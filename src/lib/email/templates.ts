import { renderAppEmail, type EmailDetail, type RenderedEmail } from "@/lib/email/render";

type OrganizationInviteRole = "admin" | "member";
type PaymentPurchaseKind = "plan" | "credits";

type PaymentTemplateInput = {
  amountDisplay: string;
  displayName: string;
  paymentReference: string;
  paymentUrl?: string;
  recipientName?: string | null;
  workspaceName: string;
};

type EftDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export const EMAIL_TEMPLATE_CATALOG = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Sent after account creation.",
  },
  {
    id: "password-reset",
    title: "Password reset",
    description: "Sent when a user requests a password reset link.",
  },
  {
    id: "password-reset-confirmation",
    title: "Password reset confirmation",
    description: "Sent after a password has been updated successfully.",
  },
  {
    id: "organization-invitation",
    title: "Organization invitation",
    description: "Sent when a workspace owner or admin invites a teammate.",
  },
  {
    id: "payment-request-created",
    title: "Payment request created",
    description: "Sent when a paid plan or credit purchase is started.",
  },
  {
    id: "payment-proof-received",
    title: "Payment proof received",
    description: "Sent to the requester after proof is uploaded.",
  },
  {
    id: "payment-proof-submitted-admin",
    title: "Payment proof submitted to admin",
    description: "Sent to admins when a proof of payment needs review.",
  },
  {
    id: "payment-under-review",
    title: "Payment under review",
    description: "Sent when an admin marks a payment as under review.",
  },
  {
    id: "payment-approved",
    title: "Payment approved",
    description: "Sent when a payment is approved.",
  },
  {
    id: "payment-rejected",
    title: "Payment rejected",
    description: "Sent when a payment is rejected.",
  },
  {
    id: "referral-reward-earned",
    title: "Referral reward earned",
    description: "Sent when a referral reward is credited.",
  },
] as const;

export type EmailTemplateId = (typeof EMAIL_TEMPLATE_CATALOG)[number]["id"];

function firstName(value?: string | null) {
  const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return parts[0] ?? "there";
}

function roleLabel(role: OrganizationInviteRole) {
  return role === "admin" ? "Admin" : "Member";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function paymentDetails(input: PaymentTemplateInput): EmailDetail[] {
  return [
    { label: "Workspace", value: input.workspaceName },
    { label: "Request", value: input.displayName },
    { label: "Amount", value: input.amountDisplay },
    { label: "Reference", value: input.paymentReference },
  ];
}

export function buildWelcomeEmail(input: {
  dashboardUrl?: string;
  name?: string | null;
  pricingUrl?: string;
}): RenderedEmail {
  const subject = "Welcome to Bank Statement Converter";
  const previewText = "Your workspace is ready.";
  const person = firstName(input.name);
  const email = renderAppEmail({
    previewText,
    eyebrow: "Welcome",
    title: `Your workspace is ready, ${person}.`,
    intro:
      "Your account has been created. Sign in to upload statements, review extracted rows, and export clean files.",
    sections: [
      {
        title: "Start here",
        body: [
          "Open your dashboard to manage projects, billing, and saved work.",
          "When you are ready, head to Convert to upload your first statement.",
        ],
      },
    ],
    primaryAction: {
      label: "Open dashboard",
      href: input.dashboardUrl ?? "/dashboard",
    },
    secondaryAction: {
      label: "See pricing",
      href: input.pricingUrl ?? "/pricing",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPasswordResetEmail(input: {
  expiresAt: string;
  loginUrl?: string;
  name?: string | null;
  resetUrl: string;
}): RenderedEmail {
  const subject = "Reset your Bank Statement Converter password";
  const previewText = "Use this link to choose a new password.";
  const person = firstName(input.name);
  const email = renderAppEmail({
    previewText,
    eyebrow: "Security",
    title: `Reset your password, ${person}.`,
    intro:
      "We received a request to reset the password for your account. Use the button below to choose a new password.",
    sections: [
      {
        title: "Reset link",
        body: [
          "If you did not request a password reset, you can ignore this email.",
        ],
        details: [{ label: "Expires", value: formatDateTime(input.expiresAt) }],
      },
    ],
    primaryAction: {
      label: "Reset password",
      href: input.resetUrl,
    },
    secondaryAction: {
      label: "Sign in",
      href: input.loginUrl ?? "/login",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPasswordResetConfirmationEmail(input: {
  forgotPasswordUrl?: string;
  loginUrl?: string;
  name?: string | null;
}): RenderedEmail {
  const subject = "Your password was updated";
  const previewText = "This confirms your password has been changed.";
  const person = firstName(input.name);
  const email = renderAppEmail({
    previewText,
    eyebrow: "Security",
    title: `Password updated, ${person}.`,
    intro:
      "Your password has been changed successfully. If you did not make this change, reset your password again immediately.",
    primaryAction: {
      label: "Sign in",
      href: input.loginUrl ?? "/login",
    },
    secondaryAction: {
      label: "Reset again",
      href: input.forgotPasswordUrl ?? "/forgot-password",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildOrganizationInvitationEmail(input: {
  inviteeEmail: string;
  inviterName: string;
  organizationName: string;
  role: OrganizationInviteRole;
  signInUrl?: string;
  signUpUrl?: string;
}): RenderedEmail {
  const subject = `${input.inviterName} invited you to ${input.organizationName}`;
  const previewText = `Join ${input.organizationName} in Bank Statement Converter.`;
  const settingsPath = encodeURIComponent("/dashboard/settings");
  const email = renderAppEmail({
    previewText,
    eyebrow: "Workspace invite",
    title: `Join ${input.organizationName}.`,
    intro: `${input.inviterName} invited ${input.inviteeEmail} to this workspace as ${roleLabel(input.role)}.`,
    sections: [
      {
        title: "How it works",
        body: [
          "Sign in with this email address to view the invite in your dashboard settings.",
          "If you do not have an account yet, create one first and then accept the invite from the same dashboard page.",
        ],
        details: [
          { label: "Workspace", value: input.organizationName },
          { label: "Invited by", value: input.inviterName },
          { label: "Role", value: roleLabel(input.role) },
          { label: "Email", value: input.inviteeEmail },
        ],
      },
    ],
    primaryAction: {
      label: "Sign in",
      href: input.signInUrl ?? `/login?next=${settingsPath}`,
    },
    secondaryAction: {
      label: "Create account",
      href: input.signUpUrl ?? `/signup?next=${settingsPath}`,
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPaymentRequestCreatedEmail(
  input: PaymentTemplateInput & {
    eftDetails?: EftDetails | null;
    expiresAt: string;
    purchaseKind: PaymentPurchaseKind;
  },
): RenderedEmail {
  const subject = `Payment details for ${input.displayName}`;
  const previewText = "Your payment request is ready.";
  const details = [
    ...paymentDetails(input),
    { label: "Expires", value: formatDate(input.expiresAt) },
  ];

  const eftDetails = input.eftDetails
    ? [
        { label: "Account name", value: input.eftDetails.accountName },
        { label: "Bank", value: input.eftDetails.bankName },
        { label: "Account number", value: input.eftDetails.accountNumber },
      ]
    : [];

  const email = renderAppEmail({
    previewText,
    eyebrow: "Payment",
    title: `${input.displayName} is ready.`,
    intro:
      input.purchaseKind === "credits"
        ? "Use the payment reference exactly as shown. Credits are added after the payment is approved."
        : "Use the payment reference exactly as shown. The plan becomes active after the payment is approved.",
    sections: [
      {
        title: "Payment request",
        details,
      },
      ...(eftDetails.length > 0
        ? [
            {
              title: "EFT details",
              details: eftDetails,
            },
          ]
        : []),
    ],
    primaryAction: {
      label: "Open payment",
      href: input.paymentUrl ?? "/dashboard/billing",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPaymentProofReceivedEmail(
  input: PaymentTemplateInput,
): RenderedEmail {
  const subject = `Proof received for ${input.displayName}`;
  const previewText = "Your proof of payment has been received.";
  const person = firstName(input.recipientName);
  const email = renderAppEmail({
    previewText,
    eyebrow: "Payment",
    title: `Proof received, ${person}.`,
    intro:
      "Your proof of payment has been uploaded. The request will stay in review until an admin updates the status.",
    sections: [
      {
        title: "Submitted request",
        details: paymentDetails(input),
      },
    ],
    primaryAction: {
      label: "Open payment",
      href: input.paymentUrl ?? "/dashboard/billing",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPaymentProofSubmittedAdminEmail(
  input: PaymentTemplateInput & {
    note?: string | null;
    requesterEmail: string;
    requesterName: string;
    reviewUrl?: string;
  },
): RenderedEmail {
  const subject = `Proof submitted for ${input.displayName}`;
  const previewText = "A payment proof is waiting for review.";
  const email = renderAppEmail({
    previewText,
    eyebrow: "Admin",
    title: "A payment proof is ready for review.",
    intro: `${input.requesterName} submitted proof of payment for ${input.displayName}.`,
    sections: [
      {
        title: "Request details",
        details: [
          { label: "Requester", value: input.requesterName },
          { label: "Email", value: input.requesterEmail },
          ...paymentDetails(input),
        ],
      },
      ...(input.note?.trim()
        ? [
            {
              title: "Note",
              body: [input.note.trim()],
            },
          ]
        : []),
    ],
    primaryAction: {
      label: "Review payment",
      href: input.reviewUrl ?? "/dashboard/admin/payments?status=proof_submitted",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPaymentUnderReviewEmail(
  input: PaymentTemplateInput,
): RenderedEmail {
  const subject = `Payment under review for ${input.displayName}`;
  const previewText = "Your payment is under review.";
  const person = firstName(input.recipientName);
  const email = renderAppEmail({
    previewText,
    eyebrow: "Payment",
    title: `Your payment is under review, ${person}.`,
    intro:
      "An admin is reviewing the proof of payment. You do not need to upload anything else unless we ask for an update.",
    sections: [
      {
        title: "Request details",
        details: paymentDetails(input),
      },
    ],
    primaryAction: {
      label: "Open payment",
      href: input.paymentUrl ?? "/dashboard/billing",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPaymentApprovedEmail(
  input: PaymentTemplateInput & {
    purchaseKind: PaymentPurchaseKind;
    resultLabel?: string | null;
  },
): RenderedEmail {
  const subject = `Payment approved for ${input.displayName}`;
  const previewText = "Your payment has been approved.";
  const person = firstName(input.recipientName);
  const resultText =
    input.resultLabel?.trim() ||
    (input.purchaseKind === "credits"
      ? "Credits have been added to this workspace."
      : "The plan is now active for this workspace.");
  const email = renderAppEmail({
    previewText,
    eyebrow: "Payment",
    title: `Payment approved, ${person}.`,
    intro: resultText,
    sections: [
      {
        title: "Approved request",
        details: paymentDetails(input),
      },
    ],
    primaryAction: {
      label: "Open dashboard",
      href: input.paymentUrl ?? "/dashboard",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildPaymentRejectedEmail(
  input: PaymentTemplateInput & {
    reviewNote?: string | null;
  },
): RenderedEmail {
  const subject = `Payment update for ${input.displayName}`;
  const previewText = "Your payment was not approved.";
  const person = firstName(input.recipientName);
  const email = renderAppEmail({
    previewText,
    eyebrow: "Payment",
    title: `Payment update, ${person}.`,
    intro:
      "This payment was not approved yet. Open the payment page to review the request and upload a new proof if needed.",
    sections: [
      {
        title: "Request details",
        details: paymentDetails(input),
      },
      ...(input.reviewNote?.trim()
        ? [
            {
              title: "Review note",
              body: [input.reviewNote.trim()],
            },
          ]
        : []),
    ],
    primaryAction: {
      label: "Open payment",
      href: input.paymentUrl ?? "/dashboard/billing",
    },
  });

  return {
    subject,
    ...email,
  };
}

export function buildReferralRewardEarnedEmail(input: {
  recipientName?: string | null;
  referralCode: string;
  referralSignupUrl?: string;
  referralsUrl?: string;
  referredUserName?: string | null;
  rewardCredits: number;
}): RenderedEmail {
  const subject = `${input.rewardCredits} referral credits added`;
  const previewText = "A referral reward has been credited to your workspace.";
  const person = firstName(input.recipientName);
  const intro = input.referredUserName?.trim()
    ? `${input.referredUserName.trim()} completed a qualifying payment. ${input.rewardCredits} credits were added to your workspace.`
    : `${input.rewardCredits} credits were added to your workspace after a referral payment was approved.`;
  const email = renderAppEmail({
    previewText,
    eyebrow: "Referral",
    title: `Credits added, ${person}.`,
    intro,
    sections: [
      {
        title: "Referral reward",
        details: [
          { label: "Reward", value: `${input.rewardCredits} credits` },
          { label: "Referral code", value: input.referralCode },
        ],
      },
    ],
    primaryAction: {
      label: "Open referrals",
      href: input.referralsUrl ?? "/dashboard/referrals",
    },
    secondaryAction: {
      label: "Share signup link",
      href:
        input.referralSignupUrl ??
        `/signup?ref=${encodeURIComponent(input.referralCode)}`,
    },
  });

  return {
    subject,
    ...email,
  };
}
