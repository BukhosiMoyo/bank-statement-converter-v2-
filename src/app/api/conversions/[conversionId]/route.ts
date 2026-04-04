import { NextResponse } from "next/server";

import {
  deleteWorkspaceConversion,
  getWorkspaceScope,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ conversionId: string }>;
  },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    );
  }

  const { conversionId } = await context.params;
  const workspace = getWorkspaceScope(currentUser);

  try {
    await deleteWorkspaceConversion(currentUser.id, workspace, conversionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Saved conversion could not be deleted.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
