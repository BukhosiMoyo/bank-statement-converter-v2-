import { NextResponse } from "next/server";

import {
  createOrganizationInvitation,
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

  const formData = await request.formData();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/settings").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/settings";
  const requestedOrganizationId = String(formData.get("organizationId") ?? "").trim();
  const selectedOrganization = requestedOrganizationId
    ? currentUser.organizations.find(
        (organization) => organization.id === requestedOrganizationId,
      ) ?? null
    : currentUser.activeWorkspace.type === "organization"
      ? {
          id: currentUser.activeWorkspace.organizationId,
          name: currentUser.activeWorkspace.name,
        }
      : null;

  if (!selectedOrganization) {
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
      organizationId: selectedOrganization.id,
      email,
      role: role === "admin" ? "admin" : "member",
    });
    await sendOrganizationInvitationEmail({
      email,
      inviterName: currentUser.name,
      organizationName: selectedOrganization.name,
      role: role === "admin" ? "admin" : "member",
    }).catch((error) => {
      logEmailError("organization invitation", error, {
        actorUserId: currentUser.id,
        email,
        organizationId: selectedOrganization.id,
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
