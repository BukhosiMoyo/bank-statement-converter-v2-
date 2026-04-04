import { NextResponse } from "next/server";

import {
  getWorkspacePlanSummary,
  getWorkspaceScope,
  saveWorkspaceConversion,
  UsageLimitError,
} from "@/lib/app-data";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getGuestPageLimit, parseStatementPreview } from "@/lib/statement-parser";

function shouldEnforceAnonymousLimit(isAuthenticated: boolean) {
  return process.env.NODE_ENV === "production" && !isAuthenticated;
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
    { status },
  );
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
      { status: 400 },
    );
  }

  const mimeType = statement.type || statement.name.toLowerCase();
  if (
    !mimeType.includes("pdf") &&
    !statement.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { error: "Only PDF files are supported." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await statement.arrayBuffer());
  const workspace = currentUser ? getWorkspaceScope(currentUser) : null;
  const bypassUsageLimits =
    currentUser !== null && isAdminEmail(currentUser.email);
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

    const detail =
      error instanceof Error && process.env.NODE_ENV !== "production"
        ? ` ${error.message}`
        : "";

    return errorResponse(
      `This PDF layout could not be parsed yet.${detail}`,
      422,
      [
        "Digital, text-based PDFs work best.",
        "Scanned and image-only PDFs are not fully supported yet.",
        "Generic parsing is best-effort for unsupported layouts.",
      ],
    );
  }
}
