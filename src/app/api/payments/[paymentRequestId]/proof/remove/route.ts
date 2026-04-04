import { NextResponse } from "next/server";

import { removePaymentRequestProof } from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ paymentRequestId: string }> },
) {
  const currentUser = await getCurrentUser();
  const { paymentRequestId } = await context.params;

  if (!currentUser) {
    return buildRedirect(
      request,
      `/login?next=${encodeURIComponent(`/payments/${paymentRequestId}`)}`,
    );
  }

  try {
    await removePaymentRequestProof({
      actorUserId: currentUser.id,
      paymentRequestId,
    });

    return buildRedirect(request, `/payments/${paymentRequestId}?saved=proof-removed`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Proof could not be removed.";

    return buildRedirect(
      request,
      `/payments/${paymentRequestId}?error=${encodeURIComponent(message)}`,
    );
  }
}
