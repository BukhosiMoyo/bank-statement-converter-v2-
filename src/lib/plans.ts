export type PlanId = "free" | "pro" | "business" | "enterprise";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: string;
  interval: string;
  monthlyAmountMinor: number | null;
  monthlyConversionLimit: number;
  monthlyPageLimit: number;
  projectLimit: number | null;
  priority: boolean;
  description: string;
  badgeLabel: string | null;
  ctaLabel: string;
  contactOnly: boolean;
  notes: string[];
};

export const DEFAULT_PLAN_ID: PlanId = "free";

const PLAN_CATALOG: PlanDefinition[] = [
  {
    id: "free",
    name: "Starter",
    price: "R0",
    interval: "/month",
    monthlyAmountMinor: 0,
    monthlyConversionLimit: 5,
    monthlyPageLimit: 100000,
    projectLimit: 1,
    priority: false,
    description: "Perfect for trying out the platform",
    badgeLabel: null,
    ctaLabel: "Get Started",
    contactOnly: false,
    notes: [
      "Preview every statement before you download",
      "Download clean Excel-ready files",
      "Keep one active client workspace",
    ],
  },
  {
    id: "pro",
    name: "Professional",
    price: "R199",
    interval: "/month",
    monthlyAmountMinor: 19900,
    monthlyConversionLimit: 100,
    monthlyPageLimit: 500000,
    projectLimit: null,
    priority: true,
    description: "Built for accountants managing multiple clients",
    badgeLabel: "Most Popular",
    ctaLabel: "Upgrade to Pro",
    contactOnly: false,
    notes: [
      "Download clean Excel-ready files",
      "Manage multiple clients",
      "Priority usage during busy periods",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "R699",
    interval: "/month",
    monthlyAmountMinor: 69900,
    monthlyConversionLimit: 400,
    monthlyPageLimit: 1000000,
    projectLimit: null,
    priority: true,
    description: "For teams and firms handling high volumes",
    badgeLabel: null,
    ctaLabel: "Upgrade to Business",
    contactOnly: false,
    notes: [
      "Manage multiple clients",
      "Share one workspace with your team",
      "Keep statement processing moving at scale",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Contact",
    interval: "",
    monthlyAmountMinor: null,
    monthlyConversionLimit: 5000,
    monthlyPageLimit: 5000000,
    projectLimit: null,
    priority: true,
    description: "Contact us for custom solutions",
    badgeLabel: null,
    ctaLabel: "Contact Us",
    contactOnly: true,
    notes: [
      "Custom onboarding for larger firms",
      "Flexible limits for specialist workflows",
      "Workspace setup shaped around your practice",
    ],
  },
];

const PLAN_MAP = Object.fromEntries(
  PLAN_CATALOG.map((plan) => [plan.id, plan]),
) as Record<PlanId, PlanDefinition>;

export function isPlanId(value: string | null | undefined): value is PlanId {
  return typeof value === "string" && value in PLAN_MAP;
}

export function getPlanDefinition(planId: string | null | undefined) {
  if (!isPlanId(planId)) {
    return PLAN_MAP[DEFAULT_PLAN_ID];
  }

  return PLAN_MAP[planId];
}

export function listPlanDefinitions() {
  return PLAN_CATALOG;
}

export function canSelfServePlan(planId: string | null | undefined) {
  return !getPlanDefinition(planId).contactOnly;
}

export function supportsTeamWorkspace(planId: string | null | undefined) {
  const plan = getPlanDefinition(planId);
  return plan.id === "business" || plan.id === "enterprise";
}
