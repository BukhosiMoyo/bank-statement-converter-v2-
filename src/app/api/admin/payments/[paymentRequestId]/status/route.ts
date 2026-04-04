import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/admin";
import { reviewPaymentRequest } from "@/lib/app-data";
import { logEmailError, sendPaymentStatusEmail } from "@/lib/email";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ paymentRequestId: string }> },
) {
  const adminUser = await requireAdminUser();
  const { paymentRequestId } = await context.params;
  const formData = await request.formData();
  const decision = String(formData.get("decision") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/dashboard/admin/payments").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/dashboard/admin/payments";

  if (
    decision !== "under_review" &&
    decision !== "approved" &&
    decision !== "rejected"
  ) {
    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent("Decision not supported.")}`,
    );
  }

  try {
    const paymentRequest = await reviewPaymentRequest({
      adminUserId: adminUser.id,
      paymentRequestId,
      decision,
      note,
    });
    await sendPaymentStatusEmail(paymentRequest).catch((error) => {
      logEmailError("payment review update", error, {
        adminUserId: adminUser.id,
        decision,
        paymentRequestId: paymentRequest.id,
      });
    });
    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}saved=1`,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Payment request could not be updated.";

    return buildRedirect(
      request,
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`,
    );
  }
}
