import { NextResponse } from "next/server";

import {
  assignWorkspaceConversionToProject,
  getWorkspaceScope,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ conversionId: string }>;
  },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const { conversionId } = await context.params;
  const workspace = getWorkspaceScope(currentUser);

  try {
    const body = (await request.json()) as {
      projectId?: string | null;
    };
    const conversion = await assignWorkspaceConversionToProject(
      currentUser.id,
      workspace,
      conversionId,
      body.projectId?.trim() || null,
    );

    if (!conversion) {
      return NextResponse.json({ error: "Conversion not found." }, { status: 404 });
    }

    return NextResponse.json({ conversion });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Project assignment could not be saved.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
