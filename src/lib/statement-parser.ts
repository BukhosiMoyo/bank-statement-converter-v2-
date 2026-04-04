import { createHash } from "node:crypto";

import type { StatementPreview } from "@/lib/types";
import { selectBankParser } from "@/lib/bank-parsers";
import { getParserLearningProfile } from "@/lib/parser-learning";
import {
  GUEST_PAGE_LIMIT,
  buildTextRows,
  findDocumentYear,
  summarizeDates,
} from "@/lib/bank-parsers/shared";
import type { StatementContext } from "@/lib/bank-parsers/types";

let pdfJsModulePromise: Promise<
  typeof import("pdfjs-dist/legacy/build/pdf.mjs")
> | null = null;

async function loadPdfJs() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = (async () => {
      await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      return import("pdfjs-dist/legacy/build/pdf.mjs");
    })();
  }

  return pdfJsModulePromise;
}

export function getGuestPageLimit() {
  return GUEST_PAGE_LIMIT;
}

function createLayoutSignature(
  context: Pick<StatementContext, "fileName" | "pageCount" | "pages">,
) {
  const keywords =
    /\b(date|description|details|transaction|balance|debit|credit|deposit|payment|money|fee|amount|statement)\b/i;
  const source = context.pages
    .slice(0, 3)
    .flatMap((page) => page.lines)
    .map((line) =>
      line
        .toLowerCase()
        .replace(/\d+/g, "#")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((line) => line.length > 0 && keywords.test(line))
    .slice(0, 24)
    .join("\n");

  return createHash("sha1")
    .update(source || `${context.fileName}:${context.pageCount}`)
    .digest("hex")
    .slice(0, 16);
}

export async function parseStatementPreview({
  bytes,
  fileName,
}: {
  bytes: Uint8Array;
  fileName: string;
}) {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const pdf = await task.promise;
  const pages: StatementContext["pages"] = [];
  let documentYear: number | null = null;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = buildTextRows(content.items);
    const lines = rows.map((row) => row.text);

    documentYear ??= findDocumentYear(lines);

    pages.push({
      pageNumber,
      lines,
      rows,
      text: lines.join("\n"),
    });
  }

  await pdf.destroy();

  const textLineCount = pages.reduce((total, page) => total + page.lines.length, 0);
  const sourceDocumentKind =
    textLineCount <= Math.max(4, pdf.numPages * 2) ? "likely_scanned" : "digital";

  const layoutSignature = createLayoutSignature({
    fileName,
    pageCount: pdf.numPages,
    pages,
  });
  const learningProfile = await getParserLearningProfile(layoutSignature);

  const context: StatementContext = {
    fileName,
    pageCount: pdf.numPages,
    layoutSignature,
    learningProfile,
    pages,
    documentYear,
  };

  const parser = selectBankParser(context);
  const rows = parser.parse(context);
  const { start, end } = summarizeDates(rows);
  const reviewRecommended =
    rows.length === 0 ||
    rows.filter((row) => row.confidence === "low").length / rows.length >= 0.15 ||
    (learningProfile !== null &&
      learningProfile.feedbackCount > 0 &&
      learningProfile.trustScore < 0.6);

  const preview: StatementPreview = {
    fileName,
    pageCount: pdf.numPages,
    rowCount: rows.length,
    detectedBank: learningProfile?.bankName ?? parser.label,
    detectedCurrency: parser.detectCurrency?.(context) ?? "ZAR",
    parserId: parser.id,
    layoutSignature,
    sourceDocumentKind,
    layoutSupport:
      parser.id === "fnb" || parser.id === "standard-bank" || parser.id === "capitec"
        ? "strong"
        : "best_effort",
    reviewRecommended,
    statementStartDate: start,
    statementEndDate: end,
    rows,
  };

  return preview;
}
