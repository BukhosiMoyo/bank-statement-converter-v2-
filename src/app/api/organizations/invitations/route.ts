import { NextResponse } from "next/server";

import {
  createOrganizationInvitation,
  getWorkspaceScope,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";
import {
  logEmailError,
  sendOrganizationInvitationEmail,
} from "@/lib/email";

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

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "member").trim();

  try {
    await createOrganizationInvitation({
      actorUserId: currentUser.id,
      organizationId: workspace.organizationId,
      email,
      role: role === "admin" ? "admin" : "member",
    });
    await sendOrganizationInvitationEmail({
      email,
      inviterName: currentUser.name,
      organizationName:
        currentUser.activeWorkspace.type === "organization"
          ? currentUser.activeWorkspace.name
          : "Organization",
      role: role === "admin" ? "admin" : "member",
    }).catch((error) => {
      logEmailError("organization invitation", error, {
        actorUserId: currentUser.id,
        email,
        organizationId: workspace.organizationId,
      });
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invite could not be created.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }

  return buildRedirect(request, `${returnTo}?saved=invite`);
}
