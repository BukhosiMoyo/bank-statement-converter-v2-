export type {
  EmailAction,
  EmailDetail,
  RenderedEmail,
} from "@/lib/email/render";
export { renderAppEmail } from "@/lib/email/render";
export {
  logEmailError,
  sendEmail,
  sendOrganizationInvitationEmail,
  sendPaymentProofReceivedEmail,
  sendPaymentProofSubmittedAdminEmail,
  sendPaymentRequestCreatedEmail,
  sendPaymentStatusEmail,
  sendWelcomeEmail,
} from "@/lib/email/send";
export {
  buildOrganizationInvitationEmail,
  buildPaymentApprovedEmail,
  buildPaymentProofReceivedEmail,
  buildPaymentProofSubmittedAdminEmail,
  buildPaymentRejectedEmail,
  buildPaymentRequestCreatedEmail,
  buildPaymentUnderReviewEmail,
  buildReferralRewardEarnedEmail,
  buildWelcomeEmail,
  EMAIL_TEMPLATE_CATALOG,
  type EmailTemplateId,
} from "@/lib/email/templates";
