import { NextResponse } from "next/server";

import { createOrganization } from "@/lib/app-data";
import { getCurrentUser, WORKSPACE_COOKIE_NAME, workspaceCookieOptions } from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard%2Fsettings");
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/settings").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/settings";

  try {
    const organization = await createOrganization({
      ownerUserId: currentUser.id,
      name,
    });
    const response = buildRedirect(request, `${returnTo}?saved=organization`);

    response.cookies.set(
      WORKSPACE_COOKIE_NAME,
      organization.id,
      workspaceCookieOptions(),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Organization could not be created.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }
}
