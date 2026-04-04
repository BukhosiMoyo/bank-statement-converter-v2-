import { NextResponse } from "next/server";

import { acceptOrganizationInvitation } from "@/lib/app-data";
import { getCurrentUser, WORKSPACE_COOKIE_NAME, workspaceCookieOptions } from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ invitationId: string }>;
  },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard%2Fsettings");
  }

  const { invitationId } = await context.params;
  const formData = await request.formData();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/settings").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/settings";

  try {
    const organizationId = await acceptOrganizationInvitation({
      invitationId,
      userId: currentUser.id,
      email: currentUser.email,
    });
    const response = buildRedirect(request, `${returnTo}?saved=invite`);

    response.cookies.set(
      WORKSPACE_COOKIE_NAME,
      organizationId,
      workspaceCookieOptions(),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invitation could not be accepted.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }
}
