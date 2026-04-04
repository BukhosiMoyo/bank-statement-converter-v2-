import { NextResponse } from "next/server";

import {
  deleteWorkspaceProject,
  getWorkspaceScope,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ projectId: string }>;
  },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard");
  }

  const { projectId } = await context.params;
  const workspace = getWorkspaceScope(currentUser);
  const formData = await request.formData();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/projects").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/projects";

  try {
    await deleteWorkspaceProject(currentUser.id, workspace, projectId);
    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}saved=project-removed`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Project could not be removed.";

    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`,
    );
  }
}
