import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/admin";
import { grantAdminCredits } from "@/lib/app-data";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  await requireAdminUser();
  const formData = await request.formData();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").trim());
  const note = String(formData.get("note") ?? "").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/admin/users").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/admin/users";

  try {
    await grantAdminCredits({
      targetUserId,
      amount,
      note,
    });

    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}saved=credits`,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Credits could not be granted.";

    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`,
    );
  }
}
