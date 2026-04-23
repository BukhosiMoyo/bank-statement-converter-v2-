import { NextResponse } from "next/server";

import {
  getPaymentsEnabled,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  saveWorkspaceConversion,
  UsageLimitError,
} from "@/lib/app-data";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import {
  getGuestPageLimit,
  isStatementParseError,
  parseStatementPreview,
} from "@/lib/statement-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MAX_STATEMENT_UPLOAD_BYTES = 20 * 1024 * 1024;

function shouldEnforceAnonymousLimit(isAuthenticated: boolean) {
  return process.env.NODE_ENV === "production" && !isAuthenticated;
}

function getMaxStatementUploadBytes() {
  const rawValue = process.env.MAX_STATEMENT_UPLOAD_MB?.trim();

  if (!rawValue) {
    return DEFAULT_MAX_STATEMENT_UPLOAD_BYTES;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_MAX_STATEMENT_UPLOAD_BYTES;
  }

  return parsedValue * 1024 * 1024;
}

function formatUploadLimit(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  if (Number.isInteger(megabytes)) {
    return `${megabytes}MB`;
  }

  return `${megabytes.toFixed(1)}MB`;
}

function errorResponse(
  error: string,
  status: number,
  guidance?: string[],
) {
  return NextResponse.json(
    guidance && guidance.length > 0
      ? { error, guidance }
      : { error },
    {
      status,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

function buildUnknownParserErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "This PDF layout could not be parsed yet.";
  }

  const name = error.name?.trim();
  const message = error.message?.trim();
  const diagnostic = [name, message]
    .filter((part) => part && part !== "Error")
    .join(": ")
    .slice(0, 240);

  return diagnostic
    ? `This PDF layout could not be parsed yet. ${diagnostic}`
    : "This PDF layout could not be parsed yet.";
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  const formData = await request.formData();
  const statement = formData.get("statement");
  const requestedProjectId = formData.has("projectId")
    ? String(formData.get("projectId") ?? "").trim()
    : null;

  if (!(statement instanceof File)) {
    return NextResponse.json(
      { error: "A PDF is required." },
      {
        status: 400,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }

  const mimeType = statement.type || statement.name.toLowerCase();
  if (
    !mimeType.includes("pdf") &&
    !statement.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { error: "Only PDF files are supported." },
      {
        status: 400,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }

  if (statement.size === 0) {
    return errorResponse("The PDF is empty.", 400);
  }

  const maxStatementUploadBytes = getMaxStatementUploadBytes();

  if (statement.size > maxStatementUploadBytes) {
    return errorResponse(
      `PDF files must be ${formatUploadLimit(maxStatementUploadBytes)} or smaller.`,
      413,
      ["Upload a smaller digital PDF or split the statement into separate files."],
    );
  }

  const bytes = new Uint8Array(await statement.arrayBuffer());
  const workspace = currentUser ? getWorkspaceScope(currentUser) : null;
  const paymentsEnabled = await getPaymentsEnabled();
  const bypassUsageLimits =
    !paymentsEnabled || (currentUser !== null && isAdminEmail(currentUser.email));
  const defaultProjectId =
    currentUser && workspace?.type === "personal"
      ? currentUser.settings.defaultProjectId
      : null;
  const normalizedProjectId = requestedProjectId || defaultProjectId;

  try {
    if (currentUser && workspace && !bypassUsageLimits) {
      const plan = await getWorkspacePlanSummary(workspace);

      if (plan.usage.limitReached) {
        return errorResponse(
          plan.usage.limitMessage ?? "Plan limit reached.",
          403,
          ["Change plan or buy credits to keep processing statements this month."],
        );
      }
    }

    const preview = await parseStatementPreview({
      bytes,
      fileName: statement.name,
    });

    if (
      shouldEnforceAnonymousLimit(currentUser !== null) &&
      preview.pageCount > getGuestPageLimit()
    ) {
      return errorResponse(
        `Guest uploads are limited to ${getGuestPageLimit()} pages.`,
        400,
        [
          "Create an account to save statements and increase your monthly allowance.",
        ],
      );
    }

    if (preview.rowCount === 0) {
      const guidance =
        preview.sourceDocumentKind === "likely_scanned"
          ? [
              "Digital, text-based PDFs work best right now.",
              "Scanned and image-only statements are not fully supported yet.",
              "Current strongest layouts are FNB, Standard Bank, and Capitec.",
            ]
          : [
              "This layout is not parsed reliably yet.",
              "Generic parsing is best-effort for unsupported banks.",
              "Current strongest layouts are FNB, Standard Bank, and Capitec.",
            ];

      return errorResponse(
        preview.sourceDocumentKind === "likely_scanned"
          ? "This PDF looks like a scanned statement and could not be read yet."
          : "No transaction rows were detected in this statement yet.",
        422,
        guidance,
      );
    }

    const savedConversion = currentUser
      ? await saveWorkspaceConversion(
          currentUser.id,
          workspace!,
          preview,
          normalizedProjectId,
          {
            bypassUsageLimits,
          },
        )
      : null;

    return NextResponse.json({
      preview,
      conversionId: savedConversion?.id ?? null,
      projectId: savedConversion?.projectId ?? null,
      projectName: savedConversion?.projectName ?? null,
    }, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Project not found.") {
      return errorResponse(error.message, 400);
    }

    if (error instanceof UsageLimitError) {
      return errorResponse(error.message, 403, [
        "Change plan or buy credits to keep processing statements this month.",
      ]);
    }

    if (isStatementParseError(error)) {
      return errorResponse(error.message, error.status, error.guidance);
    }

    console.error("Statement conversion failed.", error);

    return errorResponse(
      buildUnknownParserErrorMessage(error),
      422,
      [
        "Digital, text-based PDFs work best.",
        "Scanned and image-only PDFs are not fully supported yet.",
        "Generic parsing is best-effort for unsupported layouts.",
      ],
    );
  }
}
