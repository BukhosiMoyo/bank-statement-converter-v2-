import { NextResponse } from "next/server";

import { getCurrentUser, WORKSPACE_COOKIE_NAME, workspaceCookieOptions } from "@/lib/auth";

function resolveReturnTo(request: Request, requestedReturnTo: string) {
  if (requestedReturnTo.startsWith("/")) {
    return requestedReturnTo;
  }

  const referer = request.headers.get("referer");

  if (!referer) {
    return "/dashboard";
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}` || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function resolveWorkspaceRedirect(
  request: Request,
  currentUser: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  requestedWorkspaceId: string,
  requestedReturnTo: string,
) {
  const returnTo = resolveReturnTo(request, requestedReturnTo);
  const nextWorkspaceId =
    requestedWorkspaceId === "personal"
      ? "personal"
      : currentUser.organizations.some(
            (organization) => organization.id === requestedWorkspaceId,
          )
        ? requestedWorkspaceId
        : null;

  if (!nextWorkspaceId) {
    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent("Workspace not found.")}`,
    );
  }

  const response = buildRedirect(request, returnTo);
  response.cookies.set(
    WORKSPACE_COOKIE_NAME,
    nextWorkspaceId,
    workspaceCookieOptions(),
  );

  return response;
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard");
  }

  const { searchParams } = new URL(request.url);
  const requestedWorkspaceId = searchParams.get("workspaceId")?.trim() || "personal";
  const requestedReturnTo = searchParams.get("returnTo")?.trim() || "";

  return resolveWorkspaceRedirect(
    request,
    currentUser,
    requestedWorkspaceId,
    requestedReturnTo,
  );
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard");
  }

  const formData = await request.formData();
  const requestedWorkspaceId = String(formData.get("workspaceId") ?? "personal").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "").trim();

  return resolveWorkspaceRedirect(
    request,
    currentUser,
    requestedWorkspaceId,
    requestedReturnTo,
  );
}
