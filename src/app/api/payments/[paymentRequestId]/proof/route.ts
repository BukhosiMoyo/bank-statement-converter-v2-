import { NextResponse } from "next/server";

import {
  getPaymentRequestProofForUser,
  submitPaymentRequestProof,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";
import {
  logEmailError,
  sendPaymentProofReceivedEmail,
  sendPaymentProofSubmittedAdminEmail,
} from "@/lib/email";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function sanitizeDownloadFileName(fileName: string) {
  const sanitized = fileName
    .replace(/[\r\n"]/g, "")
    .replace(/[<>:|?*\\/]/g, "-")
    .trim();

  return sanitized || "proof";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ paymentRequestId: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fpricing");
  }

  const { paymentRequestId } = await context.params;

  try {
    const proof = await getPaymentRequestProofForUser(
      currentUser.id,
      paymentRequestId,
    );

    if (!proof) {
      return new NextResponse("Not found.", { status: 404 });
    }

    return new NextResponse(new Uint8Array(proof.bytes), {
      headers: {
        "cache-control": "private, no-store, max-age=0",
        "content-type": proof.contentType,
        "content-disposition": `inline; filename="${sanitizeDownloadFileName(proof.fileName)}"`,
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found.", { status: 404 });
  }
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

  const formData = await request.formData();
  const proof = formData.get("proof");
  const note = String(formData.get("note") ?? "").trim();

  if (!(proof instanceof File) || proof.size === 0) {
    return buildRedirect(
      request,
      `/payments/${paymentRequestId}?error=${encodeURIComponent("Upload a proof file.")}`,
    );
  }

  try {
    const paymentRequest = await submitPaymentRequestProof({
      actorUserId: currentUser.id,
      paymentRequestId,
      proofFile: proof,
      note,
    });
    await sendPaymentProofReceivedEmail(paymentRequest).catch((error) => {
      logEmailError("payment proof received", error, {
        paymentRequestId: paymentRequest.id,
        requesterUserId: currentUser.id,
      });
    });
    await sendPaymentProofSubmittedAdminEmail({
      paymentRequest,
      requesterName: currentUser.name,
    }).catch((error) => {
      logEmailError("payment proof submitted admin", error, {
        paymentRequestId: paymentRequest.id,
        requesterUserId: currentUser.id,
      });
    });
    return buildRedirect(request, `/payments/${paymentRequestId}?saved=proof`);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Proof could not be submitted.";

    return buildRedirect(
      request,
      `/payments/${paymentRequestId}?error=${encodeURIComponent(message)}`,
    );
  }
}
