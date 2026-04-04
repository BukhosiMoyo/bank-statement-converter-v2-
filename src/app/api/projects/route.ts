import { NextResponse } from "next/server";

import { createWorkspaceProject, getWorkspaceScope } from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fdashboard%2Fprojects");
  }

  const formData = await request.formData();
  const projectName = String(formData.get("projectName") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/projects").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/projects";
  const workspace = getWorkspaceScope(currentUser);

  try {
    const project = await createWorkspaceProject(currentUser.id, workspace, {
      projectName,
      clientName: clientName || null,
      notes: notes || null,
    });

    return buildRedirect(request, `/dashboard/projects/${project.id}`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Project could not be created.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }
}
