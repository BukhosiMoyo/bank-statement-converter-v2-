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

export type StatementParseErrorCode =
  | "password_protected"
  | "invalid_pdf"
  | "malformed_pdf"
  | "unreadable_pdf";

export class StatementParseError extends Error {
  code: StatementParseErrorCode;
  guidance: string[];
  status: number;

  constructor(
    code: StatementParseErrorCode,
    message: string,
    guidance: string[],
    status = 422,
  ) {
    super(message);
    this.name = "StatementParseError";
    this.code = code;
    this.guidance = guidance;
    this.status = status;
  }
}

export function isStatementParseError(
  error: unknown,
): error is StatementParseError {
  if (error instanceof StatementParseError) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Partial<StatementParseError> & { name?: unknown };

  return (
    candidate.name === "StatementParseError" &&
    typeof candidate.message === "string" &&
    typeof candidate.status === "number" &&
    Array.isArray(candidate.guidance) &&
    typeof candidate.code === "string"
  );
}

let pdfJsModulePromise: Promise<
  typeof import("pdfjs-dist/legacy/build/pdf.mjs")
> | null = null;
let nodePdfPolyfillsPromise: Promise<void> | null = null;

async function ensureNodePdfPolyfills() {
  if (
    typeof process === "undefined" ||
    Object.prototype.toString.call(process) !== "[object process]"
  ) {
    return;
  }

  if (!nodePdfPolyfillsPromise) {
    nodePdfPolyfillsPromise = (async () => {
      const canvas = await import("@napi-rs/canvas");
      const runtimeGlobals = globalThis as unknown as Record<string, unknown>;

      if (!globalThis.DOMMatrix && canvas.DOMMatrix) {
        runtimeGlobals["DOMMatrix"] = canvas.DOMMatrix;
      }

      if (!globalThis.ImageData && canvas.ImageData) {
        runtimeGlobals["ImageData"] = canvas.ImageData;
      }

      if (!globalThis.Path2D && canvas.Path2D) {
        runtimeGlobals["Path2D"] = canvas.Path2D;
      }

      if (!globalThis.navigator?.language) {
        Object.defineProperty(globalThis, "navigator", {
          configurable: true,
          value: {
            language: "en-US",
            platform: "",
            userAgent: "",
          },
        });
      }
    })();
  }

  await nodePdfPolyfillsPromise;
}

async function loadPdfJs() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = (async () => {
      await ensureNodePdfPolyfills();
      await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      return import("pdfjs-dist/legacy/build/pdf.mjs");
    })();
  }

  return pdfJsModulePromise;
}

export function getGuestPageLimit() {
  return GUEST_PAGE_LIMIT;
}

function normalizeStatementParseError(error: unknown) {
  if (isStatementParseError(error)) {
    return error;
  }

  if (!(error instanceof Error)) {
    return null;
  }

  const pdfError = error as Error & {
    code?: number;
    details?: string;
  };

  switch (pdfError.name) {
    case "PasswordException":
      return new StatementParseError(
        "password_protected",
        "This PDF is password-protected.",
        [
          "Remove the password from the PDF and upload it again.",
          "Digital, text-based PDFs work best right now.",
        ],
      );
    case "InvalidPDFException":
      return new StatementParseError(
        "invalid_pdf",
        "This file could not be read as a valid PDF.",
        [
          "Export the statement again as a PDF and retry.",
          "Digital, text-based PDFs work best right now.",
        ],
      );
    case "FormatError":
      return new StatementParseError(
        "malformed_pdf",
        "This PDF appears to be malformed.",
        [
          "Export the statement again from the bank and retry.",
          "Digital, text-based PDFs work best right now.",
        ],
      );
    case "UnknownErrorException":
      return new StatementParseError(
        "unreadable_pdf",
        "This PDF could not be read reliably.",
        [
          "Try exporting the statement again from the bank.",
          "Scanned and image-only PDFs are not fully supported yet.",
        ],
      );
    default:
      return null;
  }
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
  let pdf: Awaited<typeof task.promise> | null = null;

  try {
    pdf = await task.promise;
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

    const textLineCount = pages.reduce(
      (total, page) => total + page.lines.length,
      0,
    );
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
        parser.id === "fnb" ||
        parser.id === "standard-bank" ||
        parser.id === "capitec"
          ? "strong"
          : "best_effort",
      reviewRecommended,
      statementStartDate: start,
      statementEndDate: end,
      rows,
    };

    return preview;
  } catch (error) {
    const normalizedError = normalizeStatementParseError(error);

    if (normalizedError) {
      throw normalizedError;
    }

    throw error;
  } finally {
    if (pdf) {
      try {
        await pdf.destroy();
      } catch {
        // Ignore cleanup failures so the original parse error is preserved.
      }
    }
  }
}
