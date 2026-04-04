import { NextResponse } from "next/server";

import {
  changeWorkspacePlan,
  createWorkspacePaymentRequest,
  getWorkspaceScope,
} from "@/lib/app-data";
import { getCurrentUser } from "@/lib/auth";
import { isCreditBundleId } from "@/lib/billing";
import { logEmailError, sendPaymentRequestCreatedEmail } from "@/lib/email";
import { getPlanDefinition, isPlanId } from "@/lib/plans";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return buildRedirect(request, "/login?next=%2Fpricing");
  }

  const formData = await request.formData();
  const planId = String(formData.get("planId") ?? "").trim();
  const creditBundleId = String(formData.get("creditBundleId") ?? "").trim();
  const billingCycle = String(formData.get("billingCycle") ?? "monthly").trim();
  const requestedReturnTo = String(formData.get("returnTo") ?? "/pricing").trim();
  const returnTo = requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : "/pricing";
  const workspace = getWorkspaceScope(currentUser);

  try {
    if (creditBundleId) {
      if (!isCreditBundleId(creditBundleId)) {
        throw new Error("Credit bundle not found.");
      }

      const paymentRequest = await createWorkspacePaymentRequest({
        actorUserId: currentUser.id,
        workspace,
        creditBundleId,
        billingCycle: "one_time",
      });
      await sendPaymentRequestCreatedEmail(paymentRequest).catch((error) => {
        logEmailError("credit payment request", error, {
          paymentRequestId: paymentRequest.id,
          requesterUserId: currentUser.id,
        });
      });

      return buildRedirect(request, `/payments/${paymentRequest.id}`);
    }

    if (!isPlanId(planId)) {
      throw new Error("Plan not found.");
    }

    const plan = getPlanDefinition(planId);

    if (plan.contactOnly) {
      throw new Error("Contact us for Enterprise.");
    }

    if (plan.monthlyAmountMinor === 0) {
      await changeWorkspacePlan(workspace, planId);
      return buildRedirect(request, `${returnTo}?saved=1`);
    }

    const paymentRequest = await createWorkspacePaymentRequest({
      actorUserId: currentUser.id,
      workspace,
      planId,
      billingCycle,
    });
    await sendPaymentRequestCreatedEmail(paymentRequest).catch((error) => {
      logEmailError("plan payment request", error, {
        paymentRequestId: paymentRequest.id,
        requesterUserId: currentUser.id,
      });
    });

    return buildRedirect(request, `/payments/${paymentRequest.id}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Plan could not be updated.";

    return buildRedirect(
      request,
      `${returnTo}?error=${encodeURIComponent(message)}`,
    );
  }
}
