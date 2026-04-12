import { Resend } from "resend";

import type { PaymentRequest } from "@/lib/app-data";
import { getConfiguredAdminEmails } from "@/lib/admin";
import { getEftAccountDetails } from "@/lib/billing";
import {
  buildOrganizationInvitationEmail,
  buildPaymentApprovedEmail,
  buildPaymentProofReceivedEmail,
  buildPaymentProofSubmittedAdminEmail,
  buildPaymentRejectedEmail,
  buildPaymentRequestCreatedEmail,
  buildPaymentUnderReviewEmail,
  buildPasswordResetConfirmationEmail,
  buildPasswordResetEmail,
  buildWelcomeEmail,
} from "@/lib/email/templates";

declare global {
  var __bankStatementConverterResend: Resend | undefined;
  var __bankStatementConverterEmailConfigWarningShown: boolean | undefined;
}

type SendEmailInput = {
  fromPurpose?: "accounts" | "billing" | "default";
  html: string;
  subject: string;
  text: string;
  to: string | string[];
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getEmailFromAddress() {
  const configured = process.env.EMAIL_FROM?.trim();

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV !== "production") {
    return "Bank Statement Converter <onboarding@resend.dev>";
  }

  return "";
}

function getEmailFromAddressForPurpose(
  purpose: NonNullable<SendEmailInput["fromPurpose"]> = "default",
) {
  if (purpose === "accounts") {
    return process.env.EMAIL_FROM_ACCOUNTS?.trim() || getEmailFromAddress();
  }

  if (purpose === "billing") {
    return process.env.EMAIL_FROM_BILLING?.trim() || getEmailFromAddress();
  }

  return getEmailFromAddress();
}

function isEmailSendingEnabled(
  purpose: NonNullable<SendEmailInput["fromPurpose"]> = "default",
) {
  return Boolean(getResendApiKey() && getEmailFromAddressForPurpose(purpose));
}

function getResendClient() {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!global.__bankStatementConverterResend) {
    global.__bankStatementConverterResend = new Resend(apiKey);
  }

  return global.__bankStatementConverterResend;
}

function normalizeRecipients(value: string | string[]) {
  const recipients = (Array.isArray(value) ? value : [value])
    .map((entry) => entry.trim())
    .filter(Boolean);

  return [...new Set(recipients)];
}

function warnEmailDisabled() {
  if (global.__bankStatementConverterEmailConfigWarningShown) {
    return;
  }

  console.warn(
    "Transactional email is disabled. Configure RESEND_API_KEY plus EMAIL_FROM or the category-specific sender envs to send emails.",
  );
  global.__bankStatementConverterEmailConfigWarningShown = true;
}

export function logEmailError(action: string, error: unknown, context?: Record<string, unknown>) {
  console.error(`Email delivery failed for ${action}.`, {
    context,
    error,
  });
}

export async function sendEmail(input: SendEmailInput) {
  const recipients = normalizeRecipients(input.to);
  const fromPurpose = input.fromPurpose ?? "default";
  const fromAddress = getEmailFromAddressForPurpose(fromPurpose);

  if (recipients.length === 0) {
    return null;
  }

  if (!isEmailSendingEnabled(fromPurpose)) {
    warnEmailDisabled();
    return null;
  }

  const { data, error } = await getResendClient().emails.send({
    from: fromAddress,
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: recipients,
  });

  if (error) {
    throw new Error(error.message || "Email delivery failed.");
  }

  return data ?? null;
}

function getPaymentPath(paymentRequestId: string) {
  return `/payments/${paymentRequestId}`;
}

function toPaymentTemplateInput(paymentRequest: PaymentRequest) {
  return {
    amountDisplay: paymentRequest.amountDisplay,
    displayName: paymentRequest.displayName,
    paymentReference: paymentRequest.paymentReference,
    paymentUrl: getPaymentPath(paymentRequest.id),
    workspaceName: paymentRequest.workspaceName,
  };
}

export async function sendWelcomeEmail(input: {
  email: string;
  name?: string | null;
}) {
  const email = buildWelcomeEmail({
    dashboardUrl: "/dashboard",
    name: input.name,
    pricingUrl: "/pricing",
  });

  return sendEmail({
    ...email,
    fromPurpose: "accounts",
    to: input.email,
  });
}

export async function sendPasswordResetEmail(input: {
  email: string;
  expiresAt: string;
  name?: string | null;
  resetUrl: string;
}) {
  const email = buildPasswordResetEmail({
    expiresAt: input.expiresAt,
    name: input.name,
    resetUrl: input.resetUrl,
  });

  return sendEmail({
    ...email,
    fromPurpose: "accounts",
    to: input.email,
  });
}

export async function sendPasswordResetConfirmationEmail(input: {
  email: string;
  name?: string | null;
}) {
  const email = buildPasswordResetConfirmationEmail({
    name: input.name,
  });

  return sendEmail({
    ...email,
    fromPurpose: "accounts",
    to: input.email,
  });
}

export async function sendOrganizationInvitationEmail(input: {
  email: string;
  inviterName: string;
  organizationName: string;
  role: "admin" | "member";
}) {
  const email = buildOrganizationInvitationEmail({
    inviteeEmail: input.email,
    inviterName: input.inviterName,
    organizationName: input.organizationName,
    role: input.role,
  });

  return sendEmail({
    ...email,
    fromPurpose: "accounts",
    to: input.email,
  });
}

export async function sendPaymentRequestCreatedEmail(paymentRequest: PaymentRequest) {
  const email = buildPaymentRequestCreatedEmail({
    ...toPaymentTemplateInput(paymentRequest),
    eftDetails: getEftAccountDetails(),
    expiresAt: paymentRequest.expiresAt,
    purchaseKind: paymentRequest.purchaseKind === "credits" ? "credits" : "plan",
    recipientName: paymentRequest.requesterName,
  });

  return sendEmail({
    ...email,
    fromPurpose: "billing",
    to: paymentRequest.requesterEmail,
  });
}

export async function sendPaymentProofReceivedEmail(paymentRequest: PaymentRequest) {
  const email = buildPaymentProofReceivedEmail({
    ...toPaymentTemplateInput(paymentRequest),
    recipientName: paymentRequest.requesterName,
  });

  return sendEmail({
    ...email,
    fromPurpose: "billing",
    to: paymentRequest.requesterEmail,
  });
}

export async function sendPaymentProofSubmittedAdminEmail(input: {
  paymentRequest: PaymentRequest;
  requesterName: string;
}) {
  const adminEmails = getConfiguredAdminEmails();

  if (adminEmails.length === 0) {
    return null;
  }

  const email = buildPaymentProofSubmittedAdminEmail({
    ...toPaymentTemplateInput(input.paymentRequest),
    note: input.paymentRequest.proofNote,
    requesterEmail: input.paymentRequest.requesterEmail,
    requesterName: input.requesterName,
    reviewUrl: "/dashboard/admin/payments?status=proof_submitted",
  });

  return sendEmail({
    ...email,
    fromPurpose: "billing",
    to: adminEmails,
  });
}

export async function sendPaymentStatusEmail(paymentRequest: PaymentRequest) {
  if (paymentRequest.status === "under_review") {
    const email = buildPaymentUnderReviewEmail({
      ...toPaymentTemplateInput(paymentRequest),
      recipientName: paymentRequest.requesterName,
    });

    return sendEmail({
      ...email,
      fromPurpose: "billing",
      to: paymentRequest.requesterEmail,
    });
  }

  if (paymentRequest.status === "approved") {
    const email = buildPaymentApprovedEmail({
      ...toPaymentTemplateInput(paymentRequest),
      purchaseKind: paymentRequest.purchaseKind === "credits" ? "credits" : "plan",
      recipientName: paymentRequest.requesterName,
      resultLabel:
        paymentRequest.purchaseKind === "credits"
          ? "Credits have been added to this workspace."
          : "The plan is active for this workspace and the new cycle has started.",
    });

    return sendEmail({
      ...email,
      fromPurpose: "billing",
      to: paymentRequest.requesterEmail,
    });
  }

  if (paymentRequest.status === "rejected") {
    const email = buildPaymentRejectedEmail({
      ...toPaymentTemplateInput(paymentRequest),
      recipientName: paymentRequest.requesterName,
      reviewNote: paymentRequest.reviewNote,
    });

    return sendEmail({
      ...email,
      fromPurpose: "billing",
      to: paymentRequest.requesterEmail,
    });
  }

  return null;
}
