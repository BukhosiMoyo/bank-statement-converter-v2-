import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/admin";
import { setPaymentsEnabled } from "@/lib/app-data";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  await requireAdminUser();

  const formData = await request.formData();
  const paymentsEnabled = String(formData.get("paymentsEnabled") ?? "").trim();
  const requestedReturnTo = String(
    formData.get("returnTo") ?? "/dashboard/billing",
  ).trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/billing";

  try {
    if (paymentsEnabled !== "true" && paymentsEnabled !== "false") {
      throw new Error("Invalid value for paymentsEnabled.");
    }

    await setPaymentsEnabled(paymentsEnabled === "true");

    return buildRedirect(request, `${returnTo}?saved=1`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Settings could not be updated.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }
}
