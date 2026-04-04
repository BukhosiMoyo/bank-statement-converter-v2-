import { NextResponse } from "next/server";

import {
  getWorkspaceScope,
  updateOrganizationName,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard%2Fsettings");
  }

  const workspace = getWorkspaceScope(currentUser);
  const formData = await request.formData();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/settings").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/settings";

  if (workspace.type !== "organization") {
    return buildRedirect(
      request,
      `${returnTo}?error=` + encodeURIComponent("Organization not found."),
    );
  }

  const name = String(formData.get("name") ?? "").trim();

  try {
    await updateOrganizationName({
      actorUserId: currentUser.id,
      organizationId: workspace.organizationId,
      name,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Organization could not be updated.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }

  return buildRedirect(request, `${returnTo}?saved=organization`);
}
