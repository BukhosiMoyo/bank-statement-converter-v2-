import { getPlanDefinition, type PlanId } from "@/lib/plans";

export type BillingCycle = "monthly" | "one_time";

export type CreditBundleId =
  | "credits_100"
  | "credits_250"
  | "credits_500";

export type CreditBundleDefinition = {
  id: CreditBundleId;
  name: string;
  credits: number;
  amountMinor: number;
  ctaLabel: string;
};

const CREDIT_BUNDLES: CreditBundleDefinition[] = [
  {
    id: "credits_100",
    name: "100 credits",
    credits: 100,
    amountMinor: 17900,
    ctaLabel: "Buy 100 credits",
  },
  {
    id: "credits_250",
    name: "250 credits",
    credits: 250,
    amountMinor: 39900,
    ctaLabel: "Buy 250 credits",
  },
  {
    id: "credits_500",
    name: "500 credits",
    credits: 500,
    amountMinor: 69900,
    ctaLabel: "Buy 500 credits",
  },
];

const CREDIT_BUNDLE_MAP = Object.fromEntries(
  CREDIT_BUNDLES.map((bundle) => [bundle.id, bundle]),
) as Record<CreditBundleId, CreditBundleDefinition>;

export function isBillingCycle(value: string | null | undefined): value is BillingCycle {
  return value === "monthly" || value === "one_time";
}

export function isCreditBundleId(
  value: string | null | undefined,
): value is CreditBundleId {
  return typeof value === "string" && value in CREDIT_BUNDLE_MAP;
}

export function getCreditBundleDefinition(
  bundleId: string | null | undefined,
) {
  if (!isCreditBundleId(bundleId)) {
    return null;
  }

  return CREDIT_BUNDLE_MAP[bundleId];
}

export function listCreditBundles() {
  return CREDIT_BUNDLES;
}

export function getEftAccountDetails() {
  return {
    accountName: process.env.EFT_ACCOUNT_NAME ?? "Bank Statement Converter",
    bankName: process.env.EFT_BANK_NAME ?? "Your Bank",
    accountNumber: process.env.EFT_ACCOUNT_NUMBER ?? "0000000000",
  };
}

export function formatZarAmount(amountMinor: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function resolvePlanAmount(planId: PlanId, billingCycle: BillingCycle) {
  const plan = getPlanDefinition(planId);

  if (billingCycle !== "monthly") {
    throw new Error("Billing cycle not supported.");
  }

  if (plan.monthlyAmountMinor === null) {
    throw new Error("This plan requires manual sales setup.");
  }

  return plan.monthlyAmountMinor;
}

export function resolveCreditBundleAmount(bundleId: CreditBundleId) {
  return CREDIT_BUNDLE_MAP[bundleId].amountMinor;
}

export function generatePaymentReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BSC-${stamp}-${suffix}`;
}
