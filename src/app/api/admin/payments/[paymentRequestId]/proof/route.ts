import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/admin";
import { getPaymentRequestProofForAdmin } from "@/lib/app-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ paymentRequestId: string }> },
) {
  await requireAdminUser();
  const { paymentRequestId } = await context.params;
  const proof = await getPaymentRequestProofForAdmin(paymentRequestId);

  if (!proof) {
    return new NextResponse("Not found.", { status: 404 });
  }

  return new NextResponse(new Uint8Array(proof.bytes), {
    headers: {
      "content-type": proof.contentType,
      "content-disposition": `inline; filename="${proof.fileName}"`,
    },
  });
}
