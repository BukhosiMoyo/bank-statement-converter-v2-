import { randomUUID } from "node:crypto";

import type { BillingCycle, CreditBundleId } from "@/lib/billing";
import { isConfiguredAdminEmail } from "@/lib/admin-config";
import {
  formatZarAmount,
  getCreditBundleDefinition,
  generatePaymentReference,
  isBillingCycle,
  isCreditBundleId,
  resolveCreditBundleAmount,
  resolvePlanAmount,
} from "@/lib/billing";
import { getDatabasePool } from "@/lib/db";
import {
  canSelfServePlan,
  DEFAULT_PLAN_ID,
  getPlanDefinition,
  isPlanId,
  supportsTeamWorkspace,
  type PlanId,
} from "@/lib/plans";
import type { StatementPreview } from "@/lib/types";

export type UserSettings = {
  workspaceName: string;
  preferredCurrency: string;
  exportName: string;
  defaultProjectId: string | null;
};

export type OrganizationRole = "owner" | "admin" | "member";

export type OrganizationSummary = {
  id: string;
  name: string;
  role: OrganizationRole;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ActiveWorkspace =
  | {
      type: "personal";
      name: string;
      role: "owner";
    }
  | {
      type: "organization";
      organizationId: string;
      name: string;
      role: OrganizationRole;
    };

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  organizations: OrganizationSummary[];
  activeWorkspace: ActiveWorkspace;
};

export type StoredConversion = {
  id: string;
  userId: string;
  organizationId: string | null;
  fileName: string;
  createdAt: string;
  pageCount: number;
  rowCount: number;
  detectedBank: string | null;
  detectedCurrency: string | null;
  parserId: string;
  layoutSignature: string;
  reviewRecommended: boolean;
  statementStartDate: string | null;
  statementEndDate: string | null;
  projectId: string | null;
  projectName: string | null;
  preview: StatementPreview;
};

export type ProjectSummaryStats = {
  conversionCount: number;
  totalRowCount: number;
  banksDetected: string[];
  coverageStartDate: string | null;
  coverageEndDate: string | null;
};

export type WorkspaceProject = {
  id: string;
  ownerId: string;
  organizationId: string | null;
  projectName: string;
  clientName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  stats: ProjectSummaryStats;
};

export type OrganizationInvite = {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: Exclude<OrganizationRole, "owner">;
  invitedByUserId: string;
  invitedByName: string;
  status: "pending" | "accepted";
  createdAt: string;
  acceptedAt: string | null;
};

export type OrganizationMember = {
  userId: string;
  name: string;
  email: string;
  role: OrganizationRole;
  joinedAt: string;
};

export type DashboardStats = {
  totalConversions: number;
  totalFilesProcessed: number;
  totalProjects: number;
  unassignedConversions: number;
  totalTransactionRows: number;
};

export type AdminOverview = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  totalOrganizations: number;
  pendingPaymentRequests: number;
  approvedPaymentRequests: number;
  rejectedPaymentRequests: number;
  expiredPaymentRequests: number;
  totalSavedConversions: number;
  statementsProcessedToday: number;
  statementsProcessedThisMonth: number;
  personalStatementsThisMonth: number;
  organizationStatementsThisMonth: number;
  approvedRevenueTodayMinor: number;
  approvedRevenueThisMonthMinor: number;
  usersByPlan: Record<PlanId, number>;
};

export type DashboardNotification = {
  id: string;
  kind: "signup" | "membership" | "payment";
  title: string;
  body: string;
  href: string;
  occurredAt: string;
};

export type AdminUserDirectoryEntry = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  planId: PlanId;
  planName: string;
  totalConversions: number;
  personalCreditsRemaining: number;
  organizationCount: number;
  organizations: string[];
};

export type AdminOrganizationDirectoryEntry = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: OrganizationMember[];
};

export type WorkspaceCreditSummary = {
  totalCredits: number;
  creditsUsed: number;
  creditsRemaining: number;
};

export type ReferralSummary = {
  referralCode: string;
  successfulReferrals: number;
  creditsEarned: number;
};

export type UserActivitySummary = {
  totalConversions: number;
  totalTransactionRows: number;
  creditsRemaining: number;
};

export type UserUsageSummary = {
  cycleStartedAt: string;
  usageResetAt: string;
  conversionsUsed: number;
  conversionLimit: number;
  conversionsRemaining: number;
  usageSource: "subscription" | "credits" | "blocked";
  usingCredits: boolean;
  pagesProcessed: number;
  pageLimit: number;
  pagesRemaining: number;
  rowsProcessed: number;
  nearLimit: boolean;
  limitReached: boolean;
  warningMessage: string | null;
  limitMessage: string | null;
};

export type UserPlanSummary = {
  planId: PlanId;
  planName: string;
  price: string;
  interval: string;
  priority: boolean;
  projectLimit: number | null;
  planStartedAt: string;
  usageResetAt: string;
  usage: UserUsageSummary;
  credits: WorkspaceCreditSummary;
};

export type PaymentRequestStatus =
  | "awaiting_payment"
  | "proof_submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export type PaymentRequest = {
  id: string;
  requesterUserId: string;
  requesterName: string;
  requesterEmail: string;
  workspaceType: WorkspaceScope["type"];
  workspaceUserId: string | null;
  organizationId: string | null;
  workspaceName: string;
  purchaseKind: "plan" | "credits";
  displayName: string;
  planId: PlanId | null;
  planName: string | null;
  creditBundleId: CreditBundleId | null;
  creditQuantity: number | null;
  billingCycle: BillingCycle;
  amountMinor: number;
  amountDisplay: string;
  currency: string;
  paymentReference: string;
  status: PaymentRequestStatus;
  proofFileName: string | null;
  proofContentType: string | null;
  proofNote: string | null;
  hasProof: boolean;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  proofSubmittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  reviewedByUserId: string | null;
};

export type WorkspaceScope =
  | {
      type: "personal";
      userId: string;
    }
  | {
      type: "organization";
      organizationId: string;
      role: OrganizationRole;
      userId: string;
    };

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversionListFilters = {
  limit?: number;
  projectId?: string | null;
  detectedBank?: string | null;
  uploadedFrom?: string | null;
  uploadedTo?: string | null;
  unassignedOnly?: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  workspaceName: "My workspace",
  preferredCurrency: "ZAR",
  exportName: "bank-statement-export",
  defaultProjectId: null,
};

declare global {
  var __bankStatementConverterAppTablesPromise: Promise<void> | undefined;
}

type Queryable = {
  query: <T = unknown>(
    text: string,
    values?: unknown[],
  ) => Promise<{
    rows: T[];
    rowCount: number | null;
  }>;
};

type SubscriptionRow = {
  plan_id: string;
  plan_started_at: Date;
  usage_cycle_started_at: Date;
  usage_reset_at: Date;
};

type UsageCycleRow = {
  plan_id: string;
  cycle_started_at: Date;
  cycle_ends_at: Date;
  conversions_used: number;
  pages_processed: number;
  rows_processed: number;
};

type WorkspaceMembershipRow = {
  organization_id: string;
  organization_name: string;
  role: OrganizationRole;
  members_count: number;
  created_at: Date;
  updated_at: Date;
};

type PaymentRequestRow = {
  id: string;
  requester_user_id: string;
  requester_name: string;
  requester_email: string;
  workspace_type: WorkspaceScope["type"];
  workspace_user_id: string | null;
  organization_id: string | null;
  workspace_name: string;
  purchase_kind: string;
  plan_id: string | null;
  credit_bundle_id: string | null;
  credit_quantity: number | null;
  billing_cycle: string;
  amount_minor: number;
  currency: string;
  payment_reference: string;
  status: string;
  proof_file_name: string | null;
  proof_content_type: string | null;
  proof_note: string | null;
  proof_blob: Buffer | null;
  review_note: string | null;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
  proof_submitted_at: Date | null;
  approved_at: Date | null;
  rejected_at: Date | null;
  reviewed_by_user_id: string | null;
};

type CreditBalanceRow = {
  total_credits: number | null;
  credits_used: number | null;
};

type ReferralProfileRow = {
  user_id: string;
  referral_code: string;
};

const OPEN_PAYMENT_REQUEST_STATUSES = [
  "awaiting_payment",
  "proof_submitted",
  "under_review",
] as const satisfies PaymentRequestStatus[];

const PAYMENT_REQUEST_EXPIRY_DAYS = 7;
const REFERRAL_REWARD_CREDITS = 50;
const PAYMENT_PROOF_RETENTION_DAYS = (() => {
  const value = Number.parseInt(
    process.env.PAYMENT_PROOF_RETENTION_DAYS ?? "30",
    10,
  );

  return Number.isFinite(value) && value > 0 ? value : 30;
})();

export class UsageLimitError extends Error {
  code: "conversion_limit" | "page_limit";

  constructor(
    code: "conversion_limit" | "page_limit",
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeIsoDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.length > 0) {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function normalizeOrganizationRole(value: unknown): OrganizationRole {
  return value === "owner" || value === "admin" || value === "member"
    ? value
    : "member";
}

function normalizeInviteRole(
  value: unknown,
): Exclude<OrganizationRole, "owner"> {
  return value === "admin" ? "admin" : "member";
}

function addMonth(date: Date) {
  const result = new Date(date);
  const day = result.getUTCDate();
  const hours = result.getUTCHours();
  const minutes = result.getUTCMinutes();
  const seconds = result.getUTCSeconds();
  const milliseconds = result.getUTCMilliseconds();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);

  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();

  result.setUTCDate(Math.min(day, lastDay));
  result.setUTCHours(hours, minutes, seconds, milliseconds);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function normalizePaymentRequestStatus(value: unknown): PaymentRequestStatus {
  return value === "proof_submitted" ||
      value === "under_review" ||
      value === "approved" ||
      value === "rejected" ||
      value === "expired"
    ? value
    : "awaiting_payment";
}

function normalizePaymentRequestKind(value: unknown): "plan" | "credits" {
  return value === "credits" ? "credits" : "plan";
}

function normalizeReferralCode(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function generateReferralCode() {
  return `BSC${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function buildUsageMessages(input: {
  planName: string;
  conversionsUsed: number;
  conversionsRemaining: number;
  conversionLimit: number;
  creditsRemaining: number;
}) {
  const conversionThreshold = Math.max(
    1,
    Math.ceil(input.conversionLimit * 0.2),
  );
  const allowanceUsed = input.conversionsRemaining <= 0;
  const usingCredits = allowanceUsed && input.creditsRemaining > 0;
  const limitReached = allowanceUsed && input.creditsRemaining <= 0;
  const nearLimit = !allowanceUsed &&
    input.conversionsRemaining <= conversionThreshold;

  if (usingCredits) {
    return {
      nearLimit: true,
      limitReached: false,
      usingCredits: true,
      usageSource: "credits" as const,
      warningMessage: `You've used your monthly plan. Using credits for additional statements. ${input.creditsRemaining} credits remaining.`,
      limitMessage: null,
    };
  }

  if (limitReached) {
    return {
      nearLimit,
      limitReached,
      usingCredits: false,
      usageSource: "blocked" as const,
      warningMessage: null,
      limitMessage:
        "You've reached your monthly limit and have no credits remaining. Upgrade or buy credits to continue processing statements.",
    };
  }

  if (nearLimit) {
    return {
      nearLimit,
      limitReached,
      usingCredits: false,
      usageSource: "subscription" as const,
      warningMessage: `You've used ${input.conversionsUsed} of ${input.conversionLimit} statements this month. Upgrade anytime.`,
      limitMessage: null,
    };
  }

  return {
    nearLimit,
    limitReached,
    usingCredits: false,
    usageSource: "subscription" as const,
    warningMessage: null,
    limitMessage: null,
  };
}

function getDefaultWorkspaceName(name: string) {
  const firstName = name.trim().split(/\s+/)[0];

  if (!firstName) {
    return DEFAULT_SETTINGS.workspaceName;
  }

  return `${firstName} workspace`;
}

async function readReferralProfile(
  userId: string,
  client: Queryable = getDatabasePool(),
) {
  const result = await client.query<ReferralProfileRow>(
    `
      SELECT user_id, referral_code
      FROM user_referral_profiles
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

async function ensureReferralProfile(
  userId: string,
  client: Queryable = getDatabasePool(),
) {
  let profile = await readReferralProfile(userId, client);

  if (profile) {
    return profile;
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const referralCode = generateReferralCode();

    try {
      const inserted = await client.query<ReferralProfileRow>(
        `
          INSERT INTO user_referral_profiles (
            user_id,
            referral_code,
            created_at,
            updated_at
          )
          VALUES ($1, $2, now(), now())
          ON CONFLICT (user_id)
          DO UPDATE SET updated_at = now()
          RETURNING user_id, referral_code
        `,
        [userId, referralCode],
      );

      profile = inserted.rows[0] ?? null;
      if (profile) {
        return profile;
      }
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Referral code could not be created.");
}

async function findReferralProfileByCode(
  referralCode: string,
  client: Queryable = getDatabasePool(),
) {
  const result = await client.query<ReferralProfileRow>(
    `
      SELECT user_id, referral_code
      FROM user_referral_profiles
      WHERE referral_code = $1
      LIMIT 1
    `,
    [normalizeReferralCode(referralCode)],
  );

  return result.rows[0] ?? null;
}

async function readWorkspaceCreditBalance(
  workspace: WorkspaceScope,
  client: Queryable = getDatabasePool(),
) {
  const result =
    workspace.type === "organization"
      ? await client.query<CreditBalanceRow>(
          `
            SELECT
              COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::int AS total_credits,
              COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)::int AS credits_used
            FROM workspace_credit_transactions
            WHERE organization_id = $1
          `,
          [workspace.organizationId],
        )
      : await client.query<CreditBalanceRow>(
          `
            SELECT
              COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::int AS total_credits,
              COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)::int AS credits_used
            FROM workspace_credit_transactions
            WHERE workspace_user_id = $1
              AND workspace_type = 'personal'
          `,
          [workspace.userId],
        );

  const totalCredits = normalizeNumber(result.rows[0]?.total_credits);
  const creditsUsed = normalizeNumber(result.rows[0]?.credits_used);

  return {
    totalCredits,
    creditsUsed,
    creditsRemaining: Math.max(totalCredits - creditsUsed, 0),
  } satisfies WorkspaceCreditSummary;
}

async function addWorkspaceCredits(input: {
  workspace: WorkspaceScope;
  amount: number;
  transactionType: string;
  note?: string | null;
  paymentRequestId?: string | null;
  conversionId?: string | null;
  referralId?: string | null;
  client: Queryable;
}) {
  if (!Number.isInteger(input.amount) || input.amount === 0) {
    throw new Error("Credit amount must be a whole number.");
  }

  await input.client.query(
    `
      INSERT INTO workspace_credit_transactions (
        id,
        workspace_type,
        workspace_user_id,
        organization_id,
        amount,
        transaction_type,
        note,
        payment_request_id,
        conversion_id,
        referral_id,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        now()
      )
    `,
    [
      randomUUID(),
      input.workspace.type,
      input.workspace.type === "personal" ? input.workspace.userId : null,
      input.workspace.type === "organization" ? input.workspace.organizationId : null,
      input.amount,
      input.transactionType,
      input.note?.trim() || null,
      input.paymentRequestId ?? null,
      input.conversionId ?? null,
      input.referralId ?? null,
    ],
  );
}

async function lockWorkspaceCredits(
  workspace: WorkspaceScope,
  client: Queryable,
) {
  const scopeKey =
    workspace.type === "organization"
      ? `org:${workspace.organizationId}`
      : `user:${workspace.userId}`;

  await client.query(
    `
      SELECT pg_advisory_xact_lock(hashtext($1))
    `,
    [scopeKey],
  );
}

function mapUserSettings(row: {
  workspace_name?: unknown;
  preferred_currency?: unknown;
  export_name?: unknown;
  default_project_id?: unknown;
} | null): UserSettings {
  return {
    workspaceName:
      normalizeString(row?.workspace_name).trim() || DEFAULT_SETTINGS.workspaceName,
    preferredCurrency:
      normalizeString(row?.preferred_currency).trim().toUpperCase() ||
      DEFAULT_SETTINGS.preferredCurrency,
    exportName:
      normalizeString(row?.export_name).trim() || DEFAULT_SETTINGS.exportName,
    defaultProjectId: normalizeNullableString(row?.default_project_id),
  };
}

function mapUserRow(row: {
  id: unknown;
  name: unknown;
  email: unknown;
  password_hash: unknown;
  created_at: unknown;
  updated_at: unknown;
}): UserRecord {
  return {
    id: normalizeString(row.id),
    name: normalizeString(row.name),
    email: normalizeString(row.email),
    passwordHash: normalizeString(row.password_hash),
    createdAt: normalizeIsoDate(row.created_at),
    updatedAt: normalizeIsoDate(row.updated_at),
  };
}

function mapSessionUser(row: {
  id: unknown;
  name: unknown;
  email: unknown;
  created_at: unknown;
  updated_at: unknown;
  workspace_name?: unknown;
  preferred_currency?: unknown;
  export_name?: unknown;
  default_project_id?: unknown;
}, organizations: OrganizationSummary[], activeWorkspace: ActiveWorkspace): SessionUser {
  return {
    id: normalizeString(row.id),
    name: normalizeString(row.name),
    email: normalizeString(row.email),
    createdAt: normalizeIsoDate(row.created_at),
    updatedAt: normalizeIsoDate(row.updated_at),
    settings: mapUserSettings(row),
    organizations,
    activeWorkspace,
  };
}

function mapStoredConversion(row: {
  id: unknown;
  user_id: unknown;
  organization_id?: unknown;
  file_name: unknown;
  created_at: unknown;
  page_count: unknown;
  row_count: unknown;
  detected_bank: unknown;
  detected_currency: unknown;
  parser_id: unknown;
  layout_signature: unknown;
  review_recommended: unknown;
  statement_start_date: unknown;
  statement_end_date: unknown;
  project_id?: unknown;
  project_name?: unknown;
  preview: StatementPreview;
}): StoredConversion {
  return {
    id: normalizeString(row.id),
    userId: normalizeString(row.user_id),
    organizationId: normalizeNullableString(row.organization_id),
    fileName: normalizeString(row.file_name),
    createdAt: normalizeIsoDate(row.created_at),
    pageCount: normalizeNumber(row.page_count),
    rowCount: normalizeNumber(row.row_count),
    detectedBank: normalizeNullableString(row.detected_bank),
    detectedCurrency: normalizeNullableString(row.detected_currency),
    parserId: normalizeString(row.parser_id),
    layoutSignature: normalizeString(row.layout_signature),
    reviewRecommended: Boolean(row.review_recommended),
    statementStartDate: normalizeNullableString(row.statement_start_date),
    statementEndDate: normalizeNullableString(row.statement_end_date),
    projectId: normalizeNullableString(row.project_id),
    projectName: normalizeNullableString(row.project_name),
    preview: row.preview,
  };
}

function mapProject(row: {
  id: unknown;
  user_id: unknown;
  organization_id?: unknown;
  project_name: unknown;
  client_name: unknown;
  notes: unknown;
  created_at: unknown;
  updated_at: unknown;
  conversion_count?: unknown;
  total_row_count?: unknown;
  banks_detected?: unknown;
  coverage_start_date?: unknown;
  coverage_end_date?: unknown;
}): WorkspaceProject {
  const banks =
    Array.isArray(row.banks_detected) && row.banks_detected.length > 0
      ? row.banks_detected.filter((value): value is string => typeof value === "string")
      : [];

  return {
    id: normalizeString(row.id),
    ownerId: normalizeString(row.user_id),
    organizationId: normalizeNullableString(row.organization_id),
    projectName: normalizeString(row.project_name),
    clientName: normalizeNullableString(row.client_name),
    notes: normalizeNullableString(row.notes),
    createdAt: normalizeIsoDate(row.created_at),
    updatedAt: normalizeIsoDate(row.updated_at),
    stats: {
      conversionCount: normalizeNumber(row.conversion_count),
      totalRowCount: normalizeNumber(row.total_row_count),
      banksDetected: banks,
      coverageStartDate: normalizeNullableString(row.coverage_start_date),
      coverageEndDate: normalizeNullableString(row.coverage_end_date),
    },
  };
}

function mapPaymentRequest(row: PaymentRequestRow): PaymentRequest {
  const purchaseKind = normalizePaymentRequestKind(row.purchase_kind);
  const plan =
    purchaseKind === "plan" ? getPlanDefinition(row.plan_id) : null;
  const bundle =
    purchaseKind === "credits"
      ? getCreditBundleDefinition(row.credit_bundle_id)
      : null;
  const billingCycle = isBillingCycle(row.billing_cycle)
    ? row.billing_cycle
    : "monthly";
  const planId =
    purchaseKind === "plan" && isPlanId(row.plan_id) ? row.plan_id : null;
  const planName = purchaseKind === "plan" ? plan?.name ?? null : null;
  const creditBundleId =
    purchaseKind === "credits" && isCreditBundleId(row.credit_bundle_id)
      ? row.credit_bundle_id
      : null;
  const creditQuantity =
    purchaseKind === "credits"
      ? normalizeNumber(row.credit_quantity ?? bundle?.credits ?? 0)
      : null;
  const displayName =
    purchaseKind === "credits"
      ? bundle?.name ?? `${creditQuantity ?? 0} credits`
      : plan?.name ?? "Plan";

  return {
    id: row.id,
    requesterUserId: row.requester_user_id,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    workspaceType: row.workspace_type,
    workspaceUserId: normalizeNullableString(row.workspace_user_id),
    organizationId: normalizeNullableString(row.organization_id),
    workspaceName: row.workspace_name,
    purchaseKind,
    displayName,
    planId,
    planName,
    creditBundleId,
    creditQuantity,
    billingCycle,
    amountMinor: normalizeNumber(row.amount_minor),
    amountDisplay: formatZarAmount(normalizeNumber(row.amount_minor)),
    currency: normalizeString(row.currency, "ZAR"),
    paymentReference: row.payment_reference,
    status: normalizePaymentRequestStatus(row.status),
    proofFileName: normalizeNullableString(row.proof_file_name),
    proofContentType: normalizeNullableString(row.proof_content_type),
    proofNote: normalizeNullableString(row.proof_note),
    hasProof: row.proof_blob instanceof Buffer && row.proof_blob.length > 0,
    reviewNote: normalizeNullableString(row.review_note),
    createdAt: normalizeIsoDate(row.created_at),
    updatedAt: normalizeIsoDate(row.updated_at),
    expiresAt: normalizeIsoDate(row.expires_at),
    proofSubmittedAt: row.proof_submitted_at
      ? normalizeIsoDate(row.proof_submitted_at)
      : null,
    approvedAt: row.approved_at ? normalizeIsoDate(row.approved_at) : null,
    rejectedAt: row.rejected_at ? normalizeIsoDate(row.rejected_at) : null,
    reviewedByUserId: normalizeNullableString(row.reviewed_by_user_id),
  };
}

function mapOrganizationSummary(row: WorkspaceMembershipRow): OrganizationSummary {
  return {
    id: row.organization_id,
    name: row.organization_name,
    role: normalizeOrganizationRole(row.role),
    membersCount: normalizeNumber(row.members_count),
    createdAt: normalizeIsoDate(row.created_at),
    updatedAt: normalizeIsoDate(row.updated_at),
  };
}

function mapOrganizationInvite(row: {
  id: unknown;
  organization_id: unknown;
  organization_name: unknown;
  email: unknown;
  role: unknown;
  invited_by_user_id: unknown;
  invited_by_name: unknown;
  status: unknown;
  created_at: unknown;
  accepted_at: unknown;
}): OrganizationInvite {
  return {
    id: normalizeString(row.id),
    organizationId: normalizeString(row.organization_id),
    organizationName: normalizeString(row.organization_name),
    email: normalizeString(row.email),
    role: normalizeInviteRole(row.role),
    invitedByUserId: normalizeString(row.invited_by_user_id),
    invitedByName: normalizeString(row.invited_by_name),
    status: normalizeString(row.status) === "accepted" ? "accepted" : "pending",
    createdAt: normalizeIsoDate(row.created_at),
    acceptedAt: normalizeNullableString(row.accepted_at),
  };
}

export async function ensureAppTables() {
  if (!global.__bankStatementConverterAppTablesPromise) {
    global.__bankStatementConverterAppTablesPromise = (async () => {
      try {
        const pool = getDatabasePool();

        await pool.query(`
        CREATE TABLE IF NOT EXISTS app_users (
          id text PRIMARY KEY,
          name text NOT NULL,
          email text NOT NULL UNIQUE,
          password_hash text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          user_id text PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
          workspace_name text NOT NULL,
          preferred_currency text NOT NULL,
          export_name text NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id text PRIMARY KEY,
          user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          token_hash text NOT NULL UNIQUE,
          created_at timestamptz NOT NULL DEFAULT now(),
          expires_at timestamptz NOT NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_conversions (
          id text PRIMARY KEY,
          user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          file_name text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          page_count integer NOT NULL,
          row_count integer NOT NULL,
          detected_bank text,
          detected_currency text,
          parser_id text NOT NULL,
          layout_signature text NOT NULL,
          review_recommended boolean NOT NULL DEFAULT false,
          statement_start_date text,
          statement_end_date text,
          preview jsonb NOT NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_projects (
          id text PRIMARY KEY,
          user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          organization_id text,
          project_name text NOT NULL,
          client_name text,
          notes text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          user_id text PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
          plan_id text NOT NULL,
          plan_started_at timestamptz NOT NULL,
          usage_cycle_started_at timestamptz NOT NULL,
          usage_reset_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id text PRIMARY KEY,
          name text NOT NULL,
          owner_user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS organization_memberships (
          id text PRIMARY KEY,
          organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          role text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE (organization_id, user_id)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS organization_invitations (
          id text PRIMARY KEY,
          organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          email text NOT NULL,
          role text NOT NULL,
          invited_by_user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          status text NOT NULL DEFAULT 'pending',
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          accepted_at timestamptz,
          accepted_by_user_id text REFERENCES app_users(id) ON DELETE SET NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS organization_subscriptions (
          organization_id text PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
          plan_id text NOT NULL,
          plan_started_at timestamptz NOT NULL,
          usage_cycle_started_at timestamptz NOT NULL,
          usage_reset_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS organization_usage_cycles (
          id text PRIMARY KEY,
          organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          plan_id text NOT NULL,
          cycle_started_at timestamptz NOT NULL,
          cycle_ends_at timestamptz NOT NULL,
          conversions_used integer NOT NULL DEFAULT 0,
          pages_processed integer NOT NULL DEFAULT 0,
          rows_processed integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE (organization_id, cycle_started_at)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS payment_requests (
          id text PRIMARY KEY,
          requester_user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          workspace_type text NOT NULL,
          workspace_user_id text REFERENCES app_users(id) ON DELETE CASCADE,
          organization_id text REFERENCES organizations(id) ON DELETE CASCADE,
          plan_id text NOT NULL,
          billing_cycle text NOT NULL,
          amount_minor integer NOT NULL,
          currency text NOT NULL DEFAULT 'ZAR',
          payment_reference text NOT NULL UNIQUE,
          status text NOT NULL,
          proof_file_name text,
          proof_content_type text,
          proof_blob bytea,
          proof_note text,
          review_note text,
          proof_submitted_at timestamptz,
          approved_at timestamptz,
          rejected_at timestamptz,
          reviewed_by_user_id text REFERENCES app_users(id) ON DELETE SET NULL,
          expires_at timestamptz NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS workspace_credit_transactions (
          id text PRIMARY KEY,
          workspace_type text NOT NULL,
          workspace_user_id text REFERENCES app_users(id) ON DELETE CASCADE,
          organization_id text REFERENCES organizations(id) ON DELETE CASCADE,
          amount integer NOT NULL,
          transaction_type text NOT NULL,
          note text,
          payment_request_id text REFERENCES payment_requests(id) ON DELETE SET NULL,
          conversion_id text,
          referral_id text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_referral_profiles (
          user_id text PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
          referral_code text NOT NULL UNIQUE,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_referrals (
          id text PRIMARY KEY,
          referrer_user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          referred_user_id text NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
          referral_code text NOT NULL,
          reward_credits integer NOT NULL DEFAULT 50,
          reward_payment_request_id text UNIQUE REFERENCES payment_requests(id) ON DELETE SET NULL,
          rewarded_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_usage_cycles (
          id text PRIMARY KEY,
          user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          plan_id text NOT NULL,
          cycle_started_at timestamptz NOT NULL,
          cycle_ends_at timestamptz NOT NULL,
          conversions_used integer NOT NULL DEFAULT 0,
          pages_processed integer NOT NULL DEFAULT 0,
          rows_processed integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE (user_id, cycle_started_at)
        )
      `);

      await pool.query(`
        ALTER TABLE user_settings
        ADD COLUMN IF NOT EXISTS default_project_id text REFERENCES user_projects(id) ON DELETE SET NULL
      `);

      await pool.query(`
        ALTER TABLE user_conversions
        ADD COLUMN IF NOT EXISTS project_id text REFERENCES user_projects(id) ON DELETE SET NULL
      `);

      await pool.query(`
        ALTER TABLE user_projects
        ADD COLUMN IF NOT EXISTS organization_id text REFERENCES organizations(id) ON DELETE CASCADE
      `);

      await pool.query(`
        ALTER TABLE user_conversions
        ADD COLUMN IF NOT EXISTS organization_id text REFERENCES organizations(id) ON DELETE CASCADE
      `);

      await pool.query(`
        ALTER TABLE payment_requests
        ADD COLUMN IF NOT EXISTS purchase_kind text NOT NULL DEFAULT 'plan'
      `);

      await pool.query(`
        ALTER TABLE payment_requests
        ADD COLUMN IF NOT EXISTS credit_bundle_id text
      `);

      await pool.query(`
        ALTER TABLE payment_requests
        ADD COLUMN IF NOT EXISTS credit_quantity integer
      `);

      await pool.query(`
        ALTER TABLE payment_requests
        ALTER COLUMN plan_id DROP NOT NULL
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx
        ON user_sessions (user_id, expires_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_conversions_user_id_created_at_idx
        ON user_conversions (user_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_conversions_user_id_project_id_created_at_idx
        ON user_conversions (user_id, project_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_projects_user_id_updated_at_idx
        ON user_projects (user_id, updated_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_projects_organization_id_updated_at_idx
        ON user_projects (organization_id, updated_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_conversions_organization_id_created_at_idx
        ON user_conversions (organization_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS organization_memberships_user_id_idx
        ON organization_memberships (user_id, updated_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS organization_invitations_email_status_idx
        ON organization_invitations (email, status, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS organization_usage_cycles_organization_id_cycle_started_at_idx
        ON organization_usage_cycles (organization_id, cycle_started_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_usage_cycles_user_id_cycle_started_at_idx
        ON user_usage_cycles (user_id, cycle_started_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS payment_requests_workspace_user_id_created_at_idx
        ON payment_requests (workspace_user_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS payment_requests_organization_id_created_at_idx
        ON payment_requests (organization_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS payment_requests_status_created_at_idx
        ON payment_requests (status, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS workspace_credit_transactions_workspace_user_created_at_idx
        ON workspace_credit_transactions (workspace_user_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS workspace_credit_transactions_organization_created_at_idx
        ON workspace_credit_transactions (organization_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS workspace_credit_transactions_payment_request_id_idx
        ON workspace_credit_transactions (payment_request_id)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_referrals_referrer_user_id_idx
        ON user_referrals (referrer_user_id, created_at DESC)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS user_referrals_rewarded_at_idx
        ON user_referrals (rewarded_at DESC)
      `);

      await pool.query(`
        ALTER TABLE app_users
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE app_users
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_sessions
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_conversions
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_projects
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_projects
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_settings
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_subscriptions
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_usage_cycles
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_usage_cycles
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organizations
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organizations
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_memberships
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_memberships
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_invitations
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_invitations
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_subscriptions
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_usage_cycles
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE organization_usage_cycles
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_referral_profiles
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_referral_profiles
        ALTER COLUMN updated_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_referrals
        ALTER COLUMN created_at SET DEFAULT now()
      `);

      await pool.query(`
        ALTER TABLE user_referrals
        ALTER COLUMN updated_at SET DEFAULT now()
      `);
      } catch (error) {
        global.__bankStatementConverterAppTablesPromise = undefined;
        throw error;
      }
    })();
  }

  return global.__bankStatementConverterAppTablesPromise;
}

async function createDefaultSubscription(
  userId: string,
  client: Queryable = getDatabasePool(),
) {
  const now = new Date();
  const resetAt = addMonth(now);

  await client.query(
    `
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        plan_started_at,
        usage_cycle_started_at,
        usage_reset_at,
        updated_at
      )
      VALUES ($1, $2, $3::timestamptz, $3::timestamptz, $4::timestamptz, now())
      ON CONFLICT (user_id) DO NOTHING
    `,
    [userId, DEFAULT_PLAN_ID, now.toISOString(), resetAt.toISOString()],
  );

  await client.query(
    `
      INSERT INTO user_usage_cycles (
        id,
        user_id,
        plan_id,
        cycle_started_at,
        cycle_ends_at,
        conversions_used,
        pages_processed,
        rows_processed,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
      ON CONFLICT (user_id, cycle_started_at) DO NOTHING
    `,
    [
      randomUUID(),
      userId,
      DEFAULT_PLAN_ID,
      now.toISOString(),
      resetAt.toISOString(),
    ],
  );
}

async function createDefaultOrganizationSubscription(
  organizationId: string,
  client: Queryable = getDatabasePool(),
) {
  const now = new Date();
  const resetAt = addMonth(now);

  await client.query(
    `
      INSERT INTO organization_subscriptions (
        organization_id,
        plan_id,
        plan_started_at,
        usage_cycle_started_at,
        usage_reset_at,
        updated_at
      )
      VALUES ($1, $2, $3::timestamptz, $3::timestamptz, $4::timestamptz, now())
      ON CONFLICT (organization_id) DO NOTHING
    `,
    [organizationId, DEFAULT_PLAN_ID, now.toISOString(), resetAt.toISOString()],
  );

  await client.query(
    `
      INSERT INTO organization_usage_cycles (
        id,
        organization_id,
        plan_id,
        cycle_started_at,
        cycle_ends_at,
        conversions_used,
        pages_processed,
        rows_processed,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
      ON CONFLICT (organization_id, cycle_started_at) DO NOTHING
    `,
    [
      randomUUID(),
      organizationId,
      DEFAULT_PLAN_ID,
      now.toISOString(),
      resetAt.toISOString(),
    ],
  );
}

async function listOrganizationMembershipRows(
  userId: string,
  client: Queryable = getDatabasePool(),
) {
  const result = await client.query<WorkspaceMembershipRow>(
    `
      SELECT
        membership.organization_id,
        organization.name AS organization_name,
        membership.role,
        organization.created_at,
        organization.updated_at,
        COUNT(all_members.user_id)::int AS members_count
      FROM organization_memberships membership
      JOIN organizations organization
        ON organization.id = membership.organization_id
      JOIN organization_memberships all_members
        ON all_members.organization_id = organization.id
      WHERE membership.user_id = $1
      GROUP BY
        membership.organization_id,
        organization.name,
        membership.role,
        organization.created_at,
        organization.updated_at
      ORDER BY organization.updated_at DESC, organization.created_at DESC
    `,
    [userId],
  );

  return result.rows;
}

function resolveActiveWorkspace(
  settings: UserSettings,
  organizations: OrganizationSummary[],
  personalWorkspaceName: string,
  requestedWorkspaceValue: string | null,
) {
  if (requestedWorkspaceValue && requestedWorkspaceValue !== "personal") {
    const organization = organizations.find(
      (item) => item.id === requestedWorkspaceValue,
    );

    if (organization) {
      return {
        type: "organization",
        organizationId: organization.id,
        name: organization.name,
        role: organization.role,
      } satisfies ActiveWorkspace;
    }
  }

  return {
    type: "personal",
    name: settings.workspaceName || personalWorkspaceName,
    role: "owner",
  } satisfies ActiveWorkspace;
}

async function readSubscriptionRow(
  userId: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  const result = await client.query<SubscriptionRow>(
    `
      SELECT plan_id, plan_started_at, usage_cycle_started_at, usage_reset_at
      FROM user_subscriptions
      WHERE user_id = $1
      ${forUpdate ? "FOR UPDATE" : ""}
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

async function readUsageCycleRow(
  userId: string,
  cycleStartedAt: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  const result = await client.query<UsageCycleRow>(
    `
      SELECT
        plan_id,
        cycle_started_at,
        cycle_ends_at,
        conversions_used,
        pages_processed,
        rows_processed
      FROM user_usage_cycles
      WHERE user_id = $1
        AND cycle_started_at = $2::timestamptz
      ${forUpdate ? "FOR UPDATE" : ""}
      LIMIT 1
    `,
    [userId, cycleStartedAt],
  );

  return result.rows[0] ?? null;
}

async function ensureCurrentUsageRows(
  userId: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  await ensureAppTables();

  let subscription = await readSubscriptionRow(userId, client, forUpdate);

  if (!subscription) {
    await createDefaultSubscription(userId, client);
    subscription = await readSubscriptionRow(userId, client, forUpdate);
  }

  if (!subscription) {
    throw new Error("Subscription could not be initialized.");
  }

  let planId = isPlanId(subscription.plan_id)
    ? subscription.plan_id
    : DEFAULT_PLAN_ID;
  let cycleStartedAt = new Date(subscription.usage_cycle_started_at);
  let usageResetAt = new Date(subscription.usage_reset_at);
  const now = new Date();

  while (usageResetAt <= now) {
    cycleStartedAt = new Date(usageResetAt);
    usageResetAt = addMonth(cycleStartedAt);

    await client.query(
      `
        UPDATE user_subscriptions
        SET
          usage_cycle_started_at = $2::timestamptz,
          usage_reset_at = $3::timestamptz,
          updated_at = now()
        WHERE user_id = $1
      `,
      [userId, cycleStartedAt.toISOString(), usageResetAt.toISOString()],
    );

    await client.query(
      `
        INSERT INTO user_usage_cycles (
          id,
          user_id,
          plan_id,
          cycle_started_at,
          cycle_ends_at,
          conversions_used,
          pages_processed,
          rows_processed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
        ON CONFLICT (user_id, cycle_started_at)
        DO UPDATE SET
          plan_id = EXCLUDED.plan_id,
          cycle_ends_at = EXCLUDED.cycle_ends_at,
          updated_at = now()
      `,
      [
        randomUUID(),
        userId,
        planId,
        cycleStartedAt.toISOString(),
        usageResetAt.toISOString(),
      ],
    );
  }

  subscription = await readSubscriptionRow(userId, client, forUpdate);

  if (!subscription) {
    throw new Error("Subscription could not be loaded.");
  }

  planId = isPlanId(subscription.plan_id) ? subscription.plan_id : DEFAULT_PLAN_ID;
  const usageCycleStartedAt = new Date(subscription.usage_cycle_started_at).toISOString();
  let usage = await readUsageCycleRow(
    userId,
    usageCycleStartedAt,
    client,
    forUpdate,
  );

  if (!usage) {
    await client.query(
      `
        INSERT INTO user_usage_cycles (
          id,
          user_id,
          plan_id,
          cycle_started_at,
          cycle_ends_at,
          conversions_used,
          pages_processed,
          rows_processed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
      `,
      [
        randomUUID(),
        userId,
        planId,
        usageCycleStartedAt,
        new Date(subscription.usage_reset_at).toISOString(),
      ],
    );

    usage = await readUsageCycleRow(
      userId,
      usageCycleStartedAt,
      client,
      forUpdate,
    );
  }

  if (!usage) {
    throw new Error("Usage cycle could not be loaded.");
  }

  return {
    subscription,
    usage,
  };
}

function buildPlanSummary(
  subscription: SubscriptionRow,
  usage: UsageCycleRow,
  credits: WorkspaceCreditSummary,
) {
  const plan = getPlanDefinition(subscription.plan_id);
  const conversionsUsed = normalizeNumber(usage.conversions_used);
  const pagesProcessed = normalizeNumber(usage.pages_processed);
  const rowsProcessed = normalizeNumber(usage.rows_processed);
  const conversionsRemaining = Math.max(
    plan.monthlyConversionLimit - conversionsUsed,
    0,
  );
  const pagesRemaining = Math.max(plan.monthlyPageLimit - pagesProcessed, 0);
  const messages = buildUsageMessages({
    planName: plan.name,
    conversionsUsed,
    conversionsRemaining,
    conversionLimit: plan.monthlyConversionLimit,
    creditsRemaining: credits.creditsRemaining,
  });

  return {
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    interval: plan.interval,
    priority: plan.priority,
    projectLimit: plan.projectLimit,
    planStartedAt: normalizeIsoDate(subscription.plan_started_at),
    usageResetAt: normalizeIsoDate(subscription.usage_reset_at),
    credits,
    usage: {
      cycleStartedAt: normalizeIsoDate(usage.cycle_started_at),
      usageResetAt: normalizeIsoDate(subscription.usage_reset_at),
      conversionsUsed,
      conversionLimit: plan.monthlyConversionLimit,
      conversionsRemaining,
      usageSource: messages.usageSource,
      usingCredits: messages.usingCredits,
      pagesProcessed,
      pageLimit: plan.monthlyPageLimit,
      pagesRemaining,
      rowsProcessed,
      nearLimit: messages.nearLimit,
      limitReached: messages.limitReached,
      warningMessage: messages.warningMessage,
      limitMessage: messages.limitMessage,
    },
  } satisfies UserPlanSummary;
}

async function getCurrentSettingsRow(userId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const result = await pool.query<{
    workspace_name: string;
    preferred_currency: string;
    export_name: string;
    default_project_id: string | null;
  }>(
    `
      SELECT workspace_name, preferred_currency, export_name, default_project_id
      FROM user_settings
      WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

async function touchProject(
  userId: string,
  projectId: string,
  client: Queryable = getDatabasePool(),
) {
  await client.query(
    `
      UPDATE user_projects
      SET updated_at = now()
      WHERE user_id = $1 AND id = $2
    `,
    [userId, projectId],
  );
}

export async function findUserByEmail(email: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const normalizedEmail = email.trim().toLowerCase();
  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
  }>(
    `
      SELECT id, name, email, password_hash, created_at, updated_at
      FROM app_users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapUserRow(result.rows[0]);
}

export async function findUserById(userId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
  }>(
    `
      SELECT id, name, email, password_hash, created_at, updated_at
      FROM app_users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapUserRow(result.rows[0]);
}

export async function getUserReferralSummary(userId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const profile = await ensureReferralProfile(userId, client);
    const result = await client.query<{
      successful_referrals: number | null;
      credits_earned: number | null;
    }>(
      `
        SELECT
          COUNT(*) FILTER (WHERE rewarded_at IS NOT NULL)::int AS successful_referrals,
          COALESCE(SUM(reward_credits) FILTER (WHERE rewarded_at IS NOT NULL), 0)::int AS credits_earned
        FROM user_referrals
        WHERE referrer_user_id = $1
      `,
      [userId],
    );
    await client.query("COMMIT");

    return {
      referralCode: profile.referral_code,
      successfulReferrals: normalizeNumber(
        result.rows[0]?.successful_referrals,
      ),
      creditsEarned: normalizeNumber(result.rows[0]?.credits_earned),
    } satisfies ReferralSummary;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  referralCode?: string | null;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const userId = randomUUID();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const referralCode = normalizeReferralCode(input.referralCode);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let referrerProfile: ReferralProfileRow | null = null;

    if (referralCode) {
      referrerProfile = await findReferralProfileByCode(referralCode, client);

      if (!referrerProfile) {
        throw new Error("Referral code not found.");
      }
    }

    const createdUser = await client.query<{
      id: string;
      name: string;
      email: string;
      password_hash: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        INSERT INTO app_users (
          id,
          name,
          email,
          password_hash,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, now(), now())
        RETURNING id, name, email, password_hash, created_at, updated_at
      `,
      [userId, name, email, input.passwordHash],
    );

    await client.query(
      `
        INSERT INTO user_settings (
          user_id,
          workspace_name,
          preferred_currency,
          export_name,
          default_project_id,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, now())
      `,
      [
        userId,
        getDefaultWorkspaceName(name),
        DEFAULT_SETTINGS.preferredCurrency,
        DEFAULT_SETTINGS.exportName,
        null,
      ],
    );

    await createDefaultSubscription(userId, client);
    await ensureReferralProfile(userId, client);

    if (referrerProfile) {
      await client.query(
        `
          INSERT INTO user_referrals (
            id,
            referrer_user_id,
            referred_user_id,
            referral_code,
            reward_credits,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, now(), now())
        `,
        [
          randomUUID(),
          referrerProfile.user_id,
          userId,
          referrerProfile.referral_code,
          REFERRAL_REWARD_CREDITS,
        ],
      );
    }

    await client.query("COMMIT");
    return mapUserRow(createdUser.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createSessionRecord(input: {
  userId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();

  await pool.query(
    `
      INSERT INTO user_sessions (
        id,
        user_id,
        token_hash,
        created_at,
        expires_at
      )
      VALUES ($1, $2, $3, now(), $4::timestamptz)
    `,
    [randomUUID(), input.userId, input.tokenHash, input.expiresAt],
  );
}

export async function deleteSessionByTokenHash(tokenHash: string) {
  await ensureAppTables();
  const pool = getDatabasePool();

  await pool.query(
    `
      DELETE FROM user_sessions
      WHERE token_hash = $1
    `,
    [tokenHash],
  );
}

export async function getSessionUserByTokenHash(
  tokenHash: string,
  requestedWorkspaceValue: string | null = null,
) {
  await ensureAppTables();
  const pool = getDatabasePool();

  await pool.query(`
    DELETE FROM user_sessions
    WHERE expires_at <= now()
  `);

  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    workspace_name: string | null;
    preferred_currency: string | null;
    export_name: string | null;
    default_project_id: string | null;
  }>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        u.updated_at,
        s.workspace_name,
        s.preferred_currency,
        s.export_name,
        s.default_project_id
      FROM user_sessions session
      JOIN app_users u ON u.id = session.user_id
      LEFT JOIN user_settings s ON s.user_id = u.id
      WHERE session.token_hash = $1
        AND session.expires_at > now()
      LIMIT 1
    `,
    [tokenHash],
  );

  if (result.rowCount === 0) {
    return null;
  }

  const organizations = (await listOrganizationMembershipRows(
    normalizeString(result.rows[0].id),
    pool,
  )).map(mapOrganizationSummary);
  const settings = mapUserSettings(result.rows[0]);
  const activeWorkspace = resolveActiveWorkspace(
    settings,
    organizations,
    getDefaultWorkspaceName(normalizeString(result.rows[0].name)),
    requestedWorkspaceValue,
  );

  return mapSessionUser(result.rows[0], organizations, activeWorkspace);
}

export async function getUserSettings(userId: string) {
  const row = await getCurrentSettingsRow(userId);
  return mapUserSettings(row);
}

export function getWorkspaceScope(user: SessionUser): WorkspaceScope {
  if (user.activeWorkspace.type === "organization") {
    return {
      type: "organization",
      organizationId: user.activeWorkspace.organizationId,
      role: user.activeWorkspace.role,
      userId: user.id,
    };
  }

  return {
    type: "personal",
    userId: user.id,
  };
}

export async function getUserActivitySummary(userId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const [conversionStats, credits] = await Promise.all([
    pool.query<{
      total_conversions: number | null;
      total_transaction_rows: number | null;
    }>(
      `
        SELECT
          COUNT(*)::int AS total_conversions,
          COALESCE(SUM(row_count), 0)::int AS total_transaction_rows
        FROM user_conversions
        WHERE user_id = $1
      `,
      [userId],
    ),
    readWorkspaceCreditBalance(
      {
        type: "personal",
        userId,
      },
      pool,
    ),
  ]);

  return {
    totalConversions: normalizeNumber(
      conversionStats.rows[0]?.total_conversions,
    ),
    totalTransactionRows: normalizeNumber(
      conversionStats.rows[0]?.total_transaction_rows,
    ),
    creditsRemaining: credits.creditsRemaining,
  } satisfies UserActivitySummary;
}

export function canManageOrganization(workspace: WorkspaceScope) {
  return workspace.type === "organization" &&
    (workspace.role === "owner" || workspace.role === "admin");
}

export function canRenameOrganization(workspace: WorkspaceScope) {
  return workspace.type === "organization" && workspace.role === "owner";
}

export function canManageWorkspacePlan(workspace: WorkspaceScope) {
  return workspace.type === "personal" || workspace.role === "owner";
}

export function canManageWorkspaceContent(workspace: WorkspaceScope) {
  return workspace.type === "personal" ||
    workspace.role === "owner" ||
    workspace.role === "admin";
}

export async function getUserPlanSummary(userId: string) {
  const { subscription, usage } = await ensureCurrentUsageRows(userId);
  const credits = await readWorkspaceCreditBalance({
    type: "personal",
    userId,
  });
  return buildPlanSummary(subscription, usage, credits);
}

async function applyUserPlanChange(
  userId: string,
  requestedPlanId: PlanId,
  client: Queryable,
) {
  const { subscription } = await ensureCurrentUsageRows(userId, client, true);
  const currentPlanId = isPlanId(subscription.plan_id)
    ? subscription.plan_id
    : DEFAULT_PLAN_ID;

  if (currentPlanId !== requestedPlanId) {
    const now = new Date();
    const resetAt = addMonth(now);

    await client.query(
      `
        INSERT INTO user_subscriptions (
          user_id,
          plan_id,
          plan_started_at,
          usage_cycle_started_at,
          usage_reset_at,
          updated_at
        )
        VALUES ($1, $2, $3::timestamptz, $3::timestamptz, $4::timestamptz, now())
        ON CONFLICT (user_id)
        DO UPDATE SET
          plan_id = EXCLUDED.plan_id,
          plan_started_at = EXCLUDED.plan_started_at,
          usage_cycle_started_at = EXCLUDED.usage_cycle_started_at,
          usage_reset_at = EXCLUDED.usage_reset_at,
          updated_at = now()
      `,
      [userId, requestedPlanId, now.toISOString(), resetAt.toISOString()],
    );

    await client.query(
      `
        INSERT INTO user_usage_cycles (
          id,
          user_id,
          plan_id,
          cycle_started_at,
          cycle_ends_at,
          conversions_used,
          pages_processed,
          rows_processed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
        ON CONFLICT (user_id, cycle_started_at)
        DO UPDATE SET
          plan_id = EXCLUDED.plan_id,
          cycle_ends_at = EXCLUDED.cycle_ends_at,
          conversions_used = 0,
          pages_processed = 0,
          rows_processed = 0,
          updated_at = now()
      `,
      [
        randomUUID(),
        userId,
        requestedPlanId,
        now.toISOString(),
        resetAt.toISOString(),
      ],
    );
  }

  const current = await ensureCurrentUsageRows(userId, client, true);
  const credits = await readWorkspaceCreditBalance(
    {
      type: "personal",
      userId,
    },
    client,
  );
  return buildPlanSummary(current.subscription, current.usage, credits);
}

export async function changeUserPlan(userId: string, requestedPlanId: string) {
  await ensureAppTables();

  if (!isPlanId(requestedPlanId)) {
    throw new Error("Plan not found.");
  }

  if (!canSelfServePlan(requestedPlanId)) {
    throw new Error("Contact us for Enterprise.");
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const planSummary = await applyUserPlanChange(userId, requestedPlanId, client);
    await client.query("COMMIT");
    return planSummary;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function readOrganizationSubscriptionRow(
  organizationId: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  const result = await client.query<SubscriptionRow>(
    `
      SELECT plan_id, plan_started_at, usage_cycle_started_at, usage_reset_at
      FROM organization_subscriptions
      WHERE organization_id = $1
      ${forUpdate ? "FOR UPDATE" : ""}
      LIMIT 1
    `,
    [organizationId],
  );

  return result.rows[0] ?? null;
}

async function readOrganizationUsageCycleRow(
  organizationId: string,
  cycleStartedAt: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  const result = await client.query<UsageCycleRow>(
    `
      SELECT
        plan_id,
        cycle_started_at,
        cycle_ends_at,
        conversions_used,
        pages_processed,
        rows_processed
      FROM organization_usage_cycles
      WHERE organization_id = $1
        AND cycle_started_at = $2::timestamptz
      ${forUpdate ? "FOR UPDATE" : ""}
      LIMIT 1
    `,
    [organizationId, cycleStartedAt],
  );

  return result.rows[0] ?? null;
}

async function ensureCurrentOrganizationUsageRows(
  organizationId: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  await ensureAppTables();

  let subscription = await readOrganizationSubscriptionRow(
    organizationId,
    client,
    forUpdate,
  );

  if (!subscription) {
    await createDefaultOrganizationSubscription(organizationId, client);
    subscription = await readOrganizationSubscriptionRow(
      organizationId,
      client,
      forUpdate,
    );
  }

  if (!subscription) {
    throw new Error("Organization subscription could not be initialized.");
  }

  let planId = isPlanId(subscription.plan_id)
    ? subscription.plan_id
    : DEFAULT_PLAN_ID;
  let cycleStartedAt = new Date(subscription.usage_cycle_started_at);
  let usageResetAt = new Date(subscription.usage_reset_at);
  const now = new Date();

  while (usageResetAt <= now) {
    cycleStartedAt = new Date(usageResetAt);
    usageResetAt = addMonth(cycleStartedAt);

    await client.query(
      `
        UPDATE organization_subscriptions
        SET
          usage_cycle_started_at = $2::timestamptz,
          usage_reset_at = $3::timestamptz,
          updated_at = now()
        WHERE organization_id = $1
      `,
      [organizationId, cycleStartedAt.toISOString(), usageResetAt.toISOString()],
    );

    await client.query(
      `
        INSERT INTO organization_usage_cycles (
          id,
          organization_id,
          plan_id,
          cycle_started_at,
          cycle_ends_at,
          conversions_used,
          pages_processed,
          rows_processed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
        ON CONFLICT (organization_id, cycle_started_at)
        DO UPDATE SET
          plan_id = EXCLUDED.plan_id,
          cycle_ends_at = EXCLUDED.cycle_ends_at,
          updated_at = now()
      `,
      [
        randomUUID(),
        organizationId,
        planId,
        cycleStartedAt.toISOString(),
        usageResetAt.toISOString(),
      ],
    );
  }

  subscription = await readOrganizationSubscriptionRow(
    organizationId,
    client,
    forUpdate,
  );

  if (!subscription) {
    throw new Error("Organization subscription could not be loaded.");
  }

  planId = isPlanId(subscription.plan_id) ? subscription.plan_id : DEFAULT_PLAN_ID;
  const usageCycleStartedAt = new Date(subscription.usage_cycle_started_at).toISOString();
  let usage = await readOrganizationUsageCycleRow(
    organizationId,
    usageCycleStartedAt,
    client,
    forUpdate,
  );

  if (!usage) {
    await client.query(
      `
        INSERT INTO organization_usage_cycles (
          id,
          organization_id,
          plan_id,
          cycle_started_at,
          cycle_ends_at,
          conversions_used,
          pages_processed,
          rows_processed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
      `,
      [
        randomUUID(),
        organizationId,
        planId,
        usageCycleStartedAt,
        new Date(subscription.usage_reset_at).toISOString(),
      ],
    );

    usage = await readOrganizationUsageCycleRow(
      organizationId,
      usageCycleStartedAt,
      client,
      forUpdate,
    );
  }

  if (!usage) {
    throw new Error("Organization usage cycle could not be loaded.");
  }

  return {
    subscription,
    usage,
  };
}

export async function getOrganizationPlanSummary(organizationId: string) {
  const { subscription, usage } = await ensureCurrentOrganizationUsageRows(
    organizationId,
  );
  const credits = await readWorkspaceCreditBalance({
    type: "organization",
    organizationId,
    role: "owner",
    userId: "",
  });
  return buildPlanSummary(subscription, usage, credits);
}

async function organizationHasAdminOwner(
  organizationId: string,
  client: Queryable = getDatabasePool(),
) {
  const result = await client.query<{ owner_email: string }>(
    `
      SELECT owner_user.email AS owner_email
      FROM organizations organization
      JOIN app_users owner_user
        ON owner_user.id = organization.owner_user_id
      WHERE organization.id = $1
      LIMIT 1
    `,
    [organizationId],
  );

  if (result.rowCount === 0) {
    return false;
  }

  return isConfiguredAdminEmail(result.rows[0].owner_email);
}

async function organizationHasTeamAccess(input: {
  organizationId: string;
  planId: string | null | undefined;
  client?: Queryable;
}) {
  if (supportsTeamWorkspace(input.planId)) {
    return true;
  }

  return organizationHasAdminOwner(
    input.organizationId,
    input.client ?? getDatabasePool(),
  );
}

export async function isOrganizationTeamAccessEnabled(
  organizationId: string,
  client: Queryable = getDatabasePool(),
) {
  const { subscription } = await ensureCurrentOrganizationUsageRows(
    organizationId,
    client,
  );

  return organizationHasTeamAccess({
    organizationId,
    planId: subscription.plan_id,
    client,
  });
}

async function applyOrganizationPlanChange(
  organizationId: string,
  requestedPlanId: PlanId,
  client: Queryable,
) {
  const { subscription } = await ensureCurrentOrganizationUsageRows(
    organizationId,
    client,
    true,
  );
  const currentPlanId = isPlanId(subscription.plan_id)
    ? subscription.plan_id
    : DEFAULT_PLAN_ID;

  if (currentPlanId !== requestedPlanId) {
    const now = new Date();
    const resetAt = addMonth(now);

    await client.query(
      `
        INSERT INTO organization_subscriptions (
          organization_id,
          plan_id,
          plan_started_at,
          usage_cycle_started_at,
          usage_reset_at,
          updated_at
        )
        VALUES ($1, $2, $3::timestamptz, $3::timestamptz, $4::timestamptz, now())
        ON CONFLICT (organization_id)
        DO UPDATE SET
          plan_id = EXCLUDED.plan_id,
          plan_started_at = EXCLUDED.plan_started_at,
          usage_cycle_started_at = EXCLUDED.usage_cycle_started_at,
          usage_reset_at = EXCLUDED.usage_reset_at,
          updated_at = now()
      `,
      [organizationId, requestedPlanId, now.toISOString(), resetAt.toISOString()],
    );

    await client.query(
      `
        INSERT INTO organization_usage_cycles (
          id,
          organization_id,
          plan_id,
          cycle_started_at,
          cycle_ends_at,
          conversions_used,
          pages_processed,
          rows_processed,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, 0, 0, 0, now(), now())
        ON CONFLICT (organization_id, cycle_started_at)
        DO UPDATE SET
          plan_id = EXCLUDED.plan_id,
          cycle_ends_at = EXCLUDED.cycle_ends_at,
          conversions_used = 0,
          pages_processed = 0,
          rows_processed = 0,
          updated_at = now()
      `,
      [
        randomUUID(),
        organizationId,
        requestedPlanId,
        now.toISOString(),
        resetAt.toISOString(),
      ],
    );
  }

  const current = await ensureCurrentOrganizationUsageRows(
    organizationId,
    client,
    true,
  );
  const credits = await readWorkspaceCreditBalance(
    {
      type: "organization",
      organizationId,
      role: "owner",
      userId: "",
    },
    client,
  );
  return buildPlanSummary(current.subscription, current.usage, credits);
}

export async function changeOrganizationPlan(
  organizationId: string,
  requestedPlanId: string,
) {
  await ensureAppTables();

  if (!isPlanId(requestedPlanId)) {
    throw new Error("Plan not found.");
  }

  if (!canSelfServePlan(requestedPlanId)) {
    throw new Error("Contact us for Enterprise.");
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const planSummary = await applyOrganizationPlanChange(
      organizationId,
      requestedPlanId,
      client,
    );
    await client.query("COMMIT");
    return planSummary;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getWorkspacePlanSummary(workspace: WorkspaceScope) {
  if (workspace.type === "organization") {
    return getOrganizationPlanSummary(workspace.organizationId);
  }

  return getUserPlanSummary(workspace.userId);
}

export async function changeWorkspacePlan(
  workspace: WorkspaceScope,
  requestedPlanId: string,
) {
  if (workspace.type === "organization") {
    if (!canManageWorkspacePlan(workspace)) {
      throw new Error("Only the organization owner can change the plan.");
    }

    return changeOrganizationPlan(workspace.organizationId, requestedPlanId);
  }

  return changeUserPlan(workspace.userId, requestedPlanId);
}

async function expireOpenPaymentRequests(
  client: Queryable = getDatabasePool(),
) {
  await client.query(
    `
      UPDATE payment_requests
      SET status = 'expired', updated_at = now()
      WHERE status = ANY($1::text[])
        AND expires_at <= now()
    `,
    [[...OPEN_PAYMENT_REQUEST_STATUSES]],
  );
}

async function cleanupStoredPaymentProofs(
  client: Queryable = getDatabasePool(),
) {
  await client.query(
    `
      UPDATE payment_requests
      SET
        proof_file_name = NULL,
        proof_content_type = NULL,
        proof_blob = NULL,
        proof_note = NULL,
        updated_at = now()
      WHERE proof_blob IS NOT NULL
        AND status = ANY($1::text[])
        AND COALESCE(approved_at, rejected_at, expires_at, updated_at)
          <= now() - ($2 * interval '1 day')
    `,
    [["approved", "rejected", "expired"], PAYMENT_PROOF_RETENTION_DAYS],
  );
}

function buildPaymentRequestSelectSql() {
  return `
    SELECT
      payment.id,
      payment.requester_user_id,
      requester.name AS requester_name,
      requester.email AS requester_email,
      payment.workspace_type,
      payment.workspace_user_id,
      payment.organization_id,
      CASE
        WHEN payment.workspace_type = 'organization'
          THEN organization.name
        ELSE COALESCE(settings.workspace_name, requester.name || ' workspace')
      END AS workspace_name,
      payment.purchase_kind,
      payment.plan_id,
      payment.credit_bundle_id,
      payment.credit_quantity,
      payment.billing_cycle,
      payment.amount_minor,
      payment.currency,
      payment.payment_reference,
      payment.status,
      payment.proof_file_name,
      payment.proof_content_type,
      payment.proof_blob,
      payment.proof_note,
      payment.review_note,
      payment.created_at,
      payment.updated_at,
      payment.expires_at,
      payment.proof_submitted_at,
      payment.approved_at,
      payment.rejected_at,
      payment.reviewed_by_user_id
    FROM payment_requests payment
    JOIN app_users requester
      ON requester.id = payment.requester_user_id
    LEFT JOIN organizations organization
      ON organization.id = payment.organization_id
    LEFT JOIN user_settings settings
      ON settings.user_id = payment.workspace_user_id
  `;
}

function buildWorkspacePaymentFilter(workspace: WorkspaceScope) {
  if (workspace.type === "organization") {
    return {
      clause: "payment.workspace_type = 'organization' AND payment.organization_id = $1",
      values: [workspace.organizationId] as unknown[],
    };
  }

  return {
    clause: "payment.workspace_type = 'personal' AND payment.workspace_user_id = $1",
    values: [workspace.userId] as unknown[],
  };
}

async function getPaymentRequestRowById(
  paymentRequestId: string,
  client: Queryable = getDatabasePool(),
  forUpdate = false,
) {
  await expireOpenPaymentRequests(client);
  await cleanupStoredPaymentProofs(client);
  const result = await client.query<PaymentRequestRow>(
    `
      ${buildPaymentRequestSelectSql()}
      WHERE payment.id = $1
      ${forUpdate ? "FOR UPDATE OF payment" : ""}
      LIMIT 1
    `,
    [paymentRequestId],
  );

  return result.rows[0] ?? null;
}

async function assertPaymentRequestViewer(
  actorUserId: string,
  paymentRequest: PaymentRequest,
  client: Queryable = getDatabasePool(),
) {
  if (
    paymentRequest.workspaceType === "personal" &&
    paymentRequest.workspaceUserId === actorUserId
  ) {
    return;
  }

  if (paymentRequest.workspaceType === "organization" && paymentRequest.organizationId) {
    const role = await getOrganizationRoleForUser(
      paymentRequest.organizationId,
      actorUserId,
      client,
    );

    if (role) {
      return;
    }
  }

  throw new Error("Payment request not found.");
}

async function assertPaymentRequestManager(
  actorUserId: string,
  paymentRequest: PaymentRequest,
  client: Queryable = getDatabasePool(),
) {
  if (
    paymentRequest.workspaceType === "personal" &&
    paymentRequest.workspaceUserId === actorUserId
  ) {
    return;
  }

  if (paymentRequest.workspaceType === "organization" && paymentRequest.organizationId) {
    const role = await getOrganizationRoleForUser(
      paymentRequest.organizationId,
      actorUserId,
      client,
    );

    if (role === "owner") {
      return;
    }
  }

  throw new Error("Payment request not found.");
}

function validateProofUpload(file: File) {
  const allowedTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  if (!allowedTypes.has(file.type)) {
    throw new Error("Upload a PDF, JPG, PNG, or WEBP proof file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Proof files must be 5MB or smaller.");
  }
}

export async function getWorkspacePendingPaymentRequest(
  actorUserId: string,
  workspace: WorkspaceScope,
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  await expireOpenPaymentRequests(pool);
  await cleanupStoredPaymentProofs(pool);
  const { clause, values } = buildWorkspacePaymentFilter(workspace);
  const result = await pool.query<PaymentRequestRow>(
    `
      ${buildPaymentRequestSelectSql()}
      WHERE ${clause}
        AND payment.status = ANY($${values.length + 1}::text[])
      ORDER BY payment.created_at DESC
      LIMIT 1
    `,
    [...values, [...OPEN_PAYMENT_REQUEST_STATUSES]],
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  const paymentRequest = mapPaymentRequest(result.rows[0]);
  await assertPaymentRequestViewer(actorUserId, paymentRequest, pool);
  return paymentRequest;
}

export async function listWorkspacePaymentRequests(
  actorUserId: string,
  workspace: WorkspaceScope,
  limit = 10,
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  await expireOpenPaymentRequests(pool);
  await cleanupStoredPaymentProofs(pool);
  const { clause, values } = buildWorkspacePaymentFilter(workspace);
  const safeLimit = Math.max(1, Math.min(limit, 20));
  const result = await pool.query<PaymentRequestRow>(
    `
      ${buildPaymentRequestSelectSql()}
      WHERE ${clause}
      ORDER BY payment.created_at DESC
      LIMIT $${values.length + 1}
    `,
    [...values, safeLimit],
  );

  const requests = result.rows.map(mapPaymentRequest);

  if (requests.length > 0) {
    await assertPaymentRequestViewer(actorUserId, requests[0], pool);
  }

  return requests;
}

export async function getPaymentRequestForUser(
  actorUserId: string,
  paymentRequestId: string,
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const row = await getPaymentRequestRowById(paymentRequestId, pool);

  if (!row) {
    return null;
  }

  const paymentRequest = mapPaymentRequest(row);
  await assertPaymentRequestViewer(actorUserId, paymentRequest, pool);
  return paymentRequest;
}

export async function createWorkspacePaymentRequest(input: {
  actorUserId: string;
  workspace: WorkspaceScope;
  planId?: string | null;
  creditBundleId?: string | null;
  billingCycle?: string | null;
}) {
  await ensureAppTables();
  const normalizedPlanId = typeof input.planId === "string"
    ? input.planId.trim()
    : "";
  const normalizedBundleId = typeof input.creditBundleId === "string"
    ? input.creditBundleId.trim()
    : "";
  const purchaseKind = normalizedBundleId ? "credits" : "plan";
  const billingCycle = purchaseKind === "credits"
    ? "one_time"
    : normalizeNullableString(input.billingCycle) ?? "monthly";

  let planId: PlanId | null = null;
  let creditBundleId: CreditBundleId | null = null;
  let creditQuantity: number | null = null;
  let amountMinor = 0;

  if (purchaseKind === "credits") {
    if (!isCreditBundleId(normalizedBundleId)) {
      throw new Error("Credit bundle not found.");
    }

    creditBundleId = normalizedBundleId;
    creditQuantity = getCreditBundleDefinition(creditBundleId)?.credits ?? null;
    amountMinor = resolveCreditBundleAmount(creditBundleId);
  } else {
    if (!isPlanId(normalizedPlanId)) {
      throw new Error("Plan not found.");
    }

    if (!canSelfServePlan(normalizedPlanId)) {
      throw new Error("Contact us for Enterprise.");
    }

    const plan = getPlanDefinition(normalizedPlanId);

    if (plan.monthlyAmountMinor === 0) {
      throw new Error("Free plans activate immediately.");
    }

    if (!isBillingCycle(billingCycle) || billingCycle !== "monthly") {
      throw new Error("Billing cycle not supported.");
    }

    planId = normalizedPlanId;
    amountMinor = resolvePlanAmount(planId, billingCycle);
  }

  if (input.workspace.type === "organization" && !canManageWorkspacePlan(input.workspace)) {
    throw new Error("Only the organization owner can request this purchase.");
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await expireOpenPaymentRequests(client);

    const currentState =
      input.workspace.type === "organization"
        ? await ensureCurrentOrganizationUsageRows(
            input.workspace.organizationId,
            client,
            true,
          )
        : await ensureCurrentUsageRows(
            input.workspace.userId,
            client,
            true,
          );
    const currentPlan = buildPlanSummary(
      currentState.subscription,
      currentState.usage,
      await readWorkspaceCreditBalance(input.workspace, client),
    );

    if (purchaseKind === "plan" && currentPlan.planId === planId) {
      throw new Error("This plan is already active.");
    }

    const { clause, values } = buildWorkspacePaymentFilter(input.workspace);
    const existingOpen = await client.query<PaymentRequestRow>(
      `
        ${buildPaymentRequestSelectSql()}
        WHERE ${clause}
          AND payment.status = ANY($${values.length + 1}::text[])
        ORDER BY payment.created_at DESC
        LIMIT 1
        FOR UPDATE OF payment
      `,
      [...values, [...OPEN_PAYMENT_REQUEST_STATUSES]],
    );

    if ((existingOpen.rowCount ?? 0) > 0) {
      const existingPayment = mapPaymentRequest(existingOpen.rows[0]);

      if (
        existingPayment.purchaseKind === purchaseKind &&
        existingPayment.planId === planId &&
        existingPayment.creditBundleId === creditBundleId &&
        existingPayment.billingCycle === billingCycle
      ) {
        await client.query("COMMIT");
        return existingPayment;
      }

      await client.query(
        `
          UPDATE payment_requests
          SET status = 'expired', updated_at = now()
          WHERE id = $1
        `,
        [existingPayment.id],
      );
    }

    const paymentReference = generatePaymentReference();
    const expiresAt = addDays(new Date(), PAYMENT_REQUEST_EXPIRY_DAYS);
    const result = await client.query<PaymentRequestRow>(
      `
        INSERT INTO payment_requests (
          id,
          requester_user_id,
          workspace_type,
          workspace_user_id,
          organization_id,
          purchase_kind,
          plan_id,
          credit_bundle_id,
          credit_quantity,
          billing_cycle,
          amount_minor,
          currency,
          payment_reference,
          status,
          expires_at,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          'ZAR',
          $12,
          'awaiting_payment',
          $13::timestamptz,
          now(),
          now()
        )
        RETURNING
          id,
          requester_user_id,
          '' AS requester_name,
          '' AS requester_email,
          workspace_type,
          workspace_user_id,
          organization_id,
          '' AS workspace_name,
          purchase_kind,
          plan_id,
          credit_bundle_id,
          credit_quantity,
          billing_cycle,
          amount_minor,
          currency,
          payment_reference,
          status,
          proof_file_name,
          proof_content_type,
          proof_note,
          proof_blob,
          review_note,
          created_at,
          updated_at,
          expires_at,
          proof_submitted_at,
          approved_at,
          rejected_at,
          reviewed_by_user_id
      `,
      [
        randomUUID(),
        input.actorUserId,
        input.workspace.type,
        input.workspace.type === "personal" ? input.workspace.userId : null,
        input.workspace.type === "organization" ? input.workspace.organizationId : null,
        purchaseKind,
        planId,
        creditBundleId,
        creditQuantity,
        billingCycle,
        amountMinor,
        paymentReference,
        expiresAt.toISOString(),
      ],
    );

    const paymentRequest = await getPaymentRequestRowById(result.rows[0].id, client);

    if (!paymentRequest) {
      throw new Error("Payment request could not be created.");
    }

    await client.query("COMMIT");
    return mapPaymentRequest(paymentRequest);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function submitPaymentRequestProof(input: {
  actorUserId: string;
  paymentRequestId: string;
  proofFile: File;
  note?: string | null;
}) {
  await ensureAppTables();
  validateProofUpload(input.proofFile);
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const row = await getPaymentRequestRowById(
      input.paymentRequestId,
      client,
      true,
    );

    if (!row) {
      throw new Error("Payment request not found.");
    }

    const paymentRequest = mapPaymentRequest(row);
    await assertPaymentRequestManager(input.actorUserId, paymentRequest, client);

    if (
      paymentRequest.status !== "awaiting_payment" &&
      paymentRequest.status !== "rejected"
    ) {
      throw new Error("Proof can no longer be submitted for this request.");
    }

    const proofBuffer = Buffer.from(await input.proofFile.arrayBuffer());

    await client.query(
      `
        UPDATE payment_requests
        SET
          proof_file_name = $2,
          proof_content_type = $3,
          proof_blob = $4,
          proof_note = $5,
          proof_submitted_at = now(),
          status = 'proof_submitted',
          rejected_at = null,
          review_note = null,
          reviewed_by_user_id = null,
          updated_at = now()
        WHERE id = $1
      `,
      [
        input.paymentRequestId,
        input.proofFile.name,
        input.proofFile.type,
        proofBuffer,
        input.note?.trim() || null,
      ],
    );

    const updatedRow = await getPaymentRequestRowById(
      input.paymentRequestId,
      client,
      true,
    );

    if (!updatedRow) {
      throw new Error("Payment request could not be updated.");
    }

    await client.query("COMMIT");
    return mapPaymentRequest(updatedRow);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getPaymentRequestProofForUser(
  actorUserId: string,
  paymentRequestId: string,
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const row = await getPaymentRequestRowById(paymentRequestId, pool);

  if (!row || !(row.proof_blob instanceof Buffer) || row.proof_blob.length === 0) {
    return null;
  }

  const paymentRequest = mapPaymentRequest(row);
  await assertPaymentRequestManager(actorUserId, paymentRequest, pool);

  return {
    fileName: row.proof_file_name ?? "proof",
    contentType: row.proof_content_type ?? "application/octet-stream",
    bytes: row.proof_blob,
  };
}

export async function getPaymentRequestProofForAdmin(paymentRequestId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  await cleanupStoredPaymentProofs(pool);
  const row = await getPaymentRequestRowById(paymentRequestId, pool);

  if (!row || !(row.proof_blob instanceof Buffer) || row.proof_blob.length === 0) {
    return null;
  }

  return {
    fileName: row.proof_file_name ?? "proof",
    contentType: row.proof_content_type ?? "application/octet-stream",
    bytes: row.proof_blob,
  };
}

export async function listPaymentRequestsForAdmin(filters?: {
  status?: PaymentRequestStatus | "pending" | null;
  limit?: number;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  await expireOpenPaymentRequests(pool);
  await cleanupStoredPaymentProofs(pool);
  const limit = Math.max(1, Math.min(filters?.limit ?? 50, 200));
  const whereParts: string[] = [];
  const values: unknown[] = [];

  if (filters?.status === "pending") {
    values.push([...OPEN_PAYMENT_REQUEST_STATUSES]);
    whereParts.push(`payment.status = ANY($${values.length}::text[])`);
  } else if (filters?.status) {
    values.push(filters.status);
    whereParts.push(`payment.status = $${values.length}`);
  }

  values.push(limit);
  const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";
  const result = await pool.query<PaymentRequestRow>(
    `
      ${buildPaymentRequestSelectSql()}
      ${whereSql}
      ORDER BY payment.created_at DESC
      LIMIT $${values.length}
    `,
    values,
  );

  return result.rows.map(mapPaymentRequest);
}

export async function getPaymentRequestForAdmin(paymentRequestId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  await cleanupStoredPaymentProofs(pool);
  const row = await getPaymentRequestRowById(paymentRequestId, pool);
  return row ? mapPaymentRequest(row) : null;
}

export async function removePaymentRequestProof(input: {
  actorUserId: string;
  paymentRequestId: string;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const row = await getPaymentRequestRowById(
      input.paymentRequestId,
      client,
      true,
    );

    if (!row) {
      throw new Error("Payment request not found.");
    }

    const paymentRequest = mapPaymentRequest(row);
    await assertPaymentRequestManager(input.actorUserId, paymentRequest, client);

    if (!paymentRequest.hasProof) {
      throw new Error("No proof file found.");
    }

    if (paymentRequest.status === "approved") {
      throw new Error("Approved payment proofs cannot be removed.");
    }

    if (paymentRequest.status === "under_review") {
      throw new Error("Proof is already under review.");
    }

    await client.query(
      `
        UPDATE payment_requests
        SET
          proof_file_name = NULL,
          proof_content_type = NULL,
          proof_blob = NULL,
          proof_note = NULL,
          proof_submitted_at = NULL,
          status = 'awaiting_payment',
          review_note = NULL,
          reviewed_by_user_id = NULL,
          rejected_at = NULL,
          updated_at = now()
        WHERE id = $1
      `,
      [input.paymentRequestId],
    );

    const updatedRow = await getPaymentRequestRowById(
      input.paymentRequestId,
      client,
      true,
    );

    if (!updatedRow) {
      throw new Error("Payment request could not be updated.");
    }

    await client.query("COMMIT");
    return mapPaymentRequest(updatedRow);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function rewardReferralForApprovedPayment(
  paymentRequest: PaymentRequest,
  client: Queryable,
) {
  const referral = await client.query<{
    id: string;
    referrer_user_id: string;
    reward_credits: number;
    rewarded_at: Date | null;
  }>(
    `
      SELECT id, referrer_user_id, reward_credits, rewarded_at
      FROM user_referrals
      WHERE referred_user_id = $1
      LIMIT 1
      FOR UPDATE
    `,
    [paymentRequest.requesterUserId],
  );

  const row = referral.rows[0];

  if (!row || row.rewarded_at) {
    return;
  }

  await lockWorkspaceCredits(
    {
      type: "personal",
      userId: row.referrer_user_id,
    },
    client,
  );

  await addWorkspaceCredits({
    workspace: {
      type: "personal",
      userId: row.referrer_user_id,
    },
    amount: normalizeNumber(row.reward_credits),
    transactionType: "referral_reward",
    note: `Referral reward for ${paymentRequest.requesterEmail}`,
    paymentRequestId: paymentRequest.id,
    referralId: row.id,
    client,
  });

  await client.query(
    `
      UPDATE user_referrals
      SET
        rewarded_at = now(),
        reward_payment_request_id = $2,
        updated_at = now()
      WHERE id = $1
    `,
    [row.id, paymentRequest.id],
  );
}

export async function reviewPaymentRequest(input: {
  adminUserId: string;
  paymentRequestId: string;
  decision: "under_review" | "approved" | "rejected";
  note?: string | null;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const row = await getPaymentRequestRowById(
      input.paymentRequestId,
      client,
      true,
    );

    if (!row) {
      throw new Error("Payment request not found.");
    }

    const paymentRequest = mapPaymentRequest(row);

    if (paymentRequest.status === "expired") {
      throw new Error("Payment request has expired.");
    }

    if (input.decision === "under_review") {
      await client.query(
        `
          UPDATE payment_requests
          SET
            status = 'under_review',
            reviewed_by_user_id = $2,
            review_note = $3,
            updated_at = now()
          WHERE id = $1
        `,
        [input.paymentRequestId, input.adminUserId, input.note?.trim() || null],
      );
    } else if (input.decision === "approved") {
      if (
        paymentRequest.status !== "proof_submitted" &&
        paymentRequest.status !== "under_review"
      ) {
        throw new Error("Proof must be submitted before approval.");
      }

      if (paymentRequest.purchaseKind === "credits") {
        if (!paymentRequest.creditQuantity) {
          throw new Error("Credit bundle is incomplete.");
        }

        if (paymentRequest.workspaceType === "organization" && paymentRequest.organizationId) {
          await lockWorkspaceCredits(
            {
              type: "organization",
              organizationId: paymentRequest.organizationId,
              role: "owner",
              userId: paymentRequest.requesterUserId,
            },
            client,
          );
          await addWorkspaceCredits({
            workspace: {
              type: "organization",
              organizationId: paymentRequest.organizationId,
              role: "owner",
              userId: paymentRequest.requesterUserId,
            },
            amount: paymentRequest.creditQuantity,
            transactionType: "credit_bundle",
            note: paymentRequest.displayName,
            paymentRequestId: paymentRequest.id,
            client,
          });
        } else {
          await lockWorkspaceCredits(
            {
              type: "personal",
              userId: paymentRequest.workspaceUserId ?? paymentRequest.requesterUserId,
            },
            client,
          );
          await addWorkspaceCredits({
            workspace: {
              type: "personal",
              userId: paymentRequest.workspaceUserId ?? paymentRequest.requesterUserId,
            },
            amount: paymentRequest.creditQuantity,
            transactionType: "credit_bundle",
            note: paymentRequest.displayName,
            paymentRequestId: paymentRequest.id,
            client,
          });
        }
      } else {
        if (!paymentRequest.planId) {
          throw new Error("Plan change is incomplete.");
        }

        if (paymentRequest.workspaceType === "organization" && paymentRequest.organizationId) {
          await applyOrganizationPlanChange(
            paymentRequest.organizationId,
            paymentRequest.planId,
            client,
          );
        } else {
          await applyUserPlanChange(
            paymentRequest.workspaceUserId ?? paymentRequest.requesterUserId,
            paymentRequest.planId,
            client,
          );
        }
      }

      await rewardReferralForApprovedPayment(paymentRequest, client);

      await client.query(
        `
          UPDATE payment_requests
          SET
            status = 'approved',
            approved_at = now(),
            reviewed_by_user_id = $2,
            review_note = $3,
            updated_at = now()
          WHERE id = $1
        `,
        [input.paymentRequestId, input.adminUserId, input.note?.trim() || null],
      );
    } else {
      await client.query(
        `
          UPDATE payment_requests
          SET
            status = 'rejected',
            rejected_at = now(),
            reviewed_by_user_id = $2,
            review_note = $3,
            updated_at = now()
          WHERE id = $1
        `,
        [input.paymentRequestId, input.adminUserId, input.note?.trim() || null],
      );
    }

    const updatedRow = await getPaymentRequestRowById(
      input.paymentRequestId,
      client,
      true,
    );

    if (!updatedRow) {
      throw new Error("Payment request could not be updated.");
    }

    await client.query("COMMIT");
    return mapPaymentRequest(updatedRow);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getAdminOverview() {
  await ensureAppTables();
  const pool = getDatabasePool();
  await expireOpenPaymentRequests(pool);
  await cleanupStoredPaymentProofs(pool);

  const [
    usersResult,
    userPlansResult,
    organizationsResult,
    paymentsResult,
    conversionsResult,
  ] = await Promise.all([
    pool.query<{
      total_users: number | null;
      new_users_today: number | null;
      new_users_this_month: number | null;
    }>(
      `
        SELECT
          COUNT(*)::int AS total_users,
          COUNT(*) FILTER (
            WHERE created_at >= date_trunc('day', now())
          )::int AS new_users_today,
          COUNT(*) FILTER (
            WHERE created_at >= date_trunc('month', now())
          )::int AS new_users_this_month
        FROM app_users
      `,
    ),
    pool.query<{ plan_id: string; total_users: number | null }>(
      `
        SELECT subscription.plan_id, COUNT(*)::int AS total_users
        FROM user_subscriptions subscription
        GROUP BY subscription.plan_id
      `,
    ),
    pool.query<{ total_organizations: number | null }>(
      `
        SELECT COUNT(*)::int AS total_organizations
        FROM organizations
      `,
    ),
    pool.query<{
      pending_payment_requests: number | null;
      approved_payment_requests: number | null;
      rejected_payment_requests: number | null;
      expired_payment_requests: number | null;
      approved_revenue_today_minor: number | null;
      approved_revenue_this_month_minor: number | null;
    }>(
      `
        SELECT
          COUNT(*) FILTER (WHERE status = ANY($1::text[]))::int AS pending_payment_requests,
          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_payment_requests,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_payment_requests,
          COUNT(*) FILTER (WHERE status = 'expired')::int AS expired_payment_requests,
          COALESCE(
            SUM(amount_minor) FILTER (
              WHERE status = 'approved'
                AND approved_at >= date_trunc('day', now())
            ),
            0
          )::int AS approved_revenue_today_minor,
          COALESCE(
            SUM(amount_minor) FILTER (
              WHERE status = 'approved'
                AND approved_at >= date_trunc('month', now())
            ),
            0
          )::int AS approved_revenue_this_month_minor
        FROM payment_requests
      `,
      [[...OPEN_PAYMENT_REQUEST_STATUSES]],
    ),
    pool.query<{
      total_saved_conversions: number | null;
      statements_processed_today: number | null;
      statements_processed_this_month: number | null;
      personal_statements_this_month: number | null;
      organization_statements_this_month: number | null;
    }>(
      `
        SELECT
          COUNT(*)::int AS total_saved_conversions,
          COUNT(*) FILTER (
            WHERE created_at >= date_trunc('day', now())
          )::int AS statements_processed_today,
          COUNT(*) FILTER (
            WHERE created_at >= date_trunc('month', now())
          )::int AS statements_processed_this_month,
          COUNT(*) FILTER (
            WHERE organization_id IS NULL
              AND created_at >= date_trunc('month', now())
          )::int AS personal_statements_this_month,
          COUNT(*) FILTER (
            WHERE organization_id IS NOT NULL
              AND created_at >= date_trunc('month', now())
          )::int AS organization_statements_this_month
        FROM user_conversions
      `,
    ),
  ]);

  const usersByPlan: Record<PlanId, number> = {
    free: 0,
    pro: 0,
    business: 0,
    enterprise: 0,
  };

  for (const row of userPlansResult.rows) {
    if (isPlanId(row.plan_id)) {
      usersByPlan[row.plan_id] = normalizeNumber(row.total_users);
    }
  }

  const personalStatementsThisMonth = normalizeNumber(
    conversionsResult.rows[0]?.personal_statements_this_month,
  );
  const organizationStatementsThisMonth = normalizeNumber(
    conversionsResult.rows[0]?.organization_statements_this_month,
  );

  return {
    totalUsers: normalizeNumber(usersResult.rows[0]?.total_users),
    newUsersToday: normalizeNumber(usersResult.rows[0]?.new_users_today),
    newUsersThisMonth: normalizeNumber(
      usersResult.rows[0]?.new_users_this_month,
    ),
    totalOrganizations: normalizeNumber(
      organizationsResult.rows[0]?.total_organizations,
    ),
    pendingPaymentRequests: normalizeNumber(
      paymentsResult.rows[0]?.pending_payment_requests,
    ),
    approvedPaymentRequests: normalizeNumber(
      paymentsResult.rows[0]?.approved_payment_requests,
    ),
    rejectedPaymentRequests: normalizeNumber(
      paymentsResult.rows[0]?.rejected_payment_requests,
    ),
    expiredPaymentRequests: normalizeNumber(
      paymentsResult.rows[0]?.expired_payment_requests,
    ),
    totalSavedConversions: normalizeNumber(
      conversionsResult.rows[0]?.total_saved_conversions,
    ),
    statementsProcessedToday: normalizeNumber(
      conversionsResult.rows[0]?.statements_processed_today,
    ),
    statementsProcessedThisMonth: normalizeNumber(
      conversionsResult.rows[0]?.statements_processed_this_month,
    ),
    personalStatementsThisMonth,
    organizationStatementsThisMonth,
    approvedRevenueTodayMinor: normalizeNumber(
      paymentsResult.rows[0]?.approved_revenue_today_minor,
    ),
    approvedRevenueThisMonthMinor: normalizeNumber(
      paymentsResult.rows[0]?.approved_revenue_this_month_minor,
    ),
    usersByPlan,
  } satisfies AdminOverview;
}

export async function listAdminNotifications(limit = 6) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const safeLimit = Math.max(limit, 1);

  const [usersResult, membershipsResult, paymentsResult] = await Promise.all([
    pool.query<{
      user_id: string;
      name: string;
      email: string;
      created_at: Date;
    }>(
      `
        SELECT id AS user_id, name, email, created_at
        FROM app_users
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [safeLimit],
    ),
    pool.query<{
      organization_id: string;
      organization_name: string;
      user_id: string;
      name: string;
      email: string;
      role: OrganizationRole;
      created_at: Date;
    }>(
      `
        SELECT
          membership.organization_id,
          organization.name AS organization_name,
          membership.user_id,
          user_record.name,
          user_record.email,
          membership.role,
          membership.created_at
        FROM organization_memberships membership
        JOIN organizations organization
          ON organization.id = membership.organization_id
        JOIN app_users user_record
          ON user_record.id = membership.user_id
        ORDER BY membership.created_at DESC
        LIMIT $1
      `,
      [safeLimit],
    ),
    pool.query<{
      id: string;
      workspace_name: string;
      requester_name: string;
      status: PaymentRequestStatus;
      occurred_at: Date;
    }>(
      `
        SELECT
          payment.id,
          payment.workspace_name,
          payment.requester_name,
          payment.status,
          COALESCE(payment.proof_submitted_at, payment.updated_at) AS occurred_at
        FROM (
          ${buildPaymentRequestSelectSql()}
        ) AS payment
        WHERE payment.status = ANY($1::text[])
        ORDER BY COALESCE(payment.proof_submitted_at, payment.updated_at) DESC
        LIMIT $2
      `,
      [["proof_submitted", "under_review", "approved"], safeLimit],
    ),
  ]);

  const notifications = [
    ...usersResult.rows.map((row) => ({
      id: `signup:${row.user_id}:${normalizeIsoDate(row.created_at)}`,
      kind: "signup" as const,
      title: `${row.name} created an account`,
      body: row.email,
      href: "/dashboard/admin/users",
      occurredAt: normalizeIsoDate(row.created_at),
    })),
    ...membershipsResult.rows.map((row) => ({
      id: `membership:${row.organization_id}:${row.user_id}:${normalizeIsoDate(
        row.created_at,
      )}`,
      kind: "membership" as const,
      title: `${row.name} joined ${row.organization_name}`,
      body: `${normalizeOrganizationRole(row.role)} • ${row.email}`,
      href: "/dashboard/admin/users",
      occurredAt: normalizeIsoDate(row.created_at),
    })),
    ...paymentsResult.rows.map((row) => ({
      id: `payment:${row.id}:${normalizeIsoDate(row.occurred_at)}`,
      kind: "payment" as const,
      title:
        row.status === "approved"
          ? "Payment approved"
          : row.status === "under_review"
            ? "Payment under review"
            : "Payment proof received",
      body: `${row.workspace_name} • ${row.requester_name}`,
      href: "/dashboard/admin/payments?status=pending",
      occurredAt: normalizeIsoDate(row.occurred_at),
    })),
  ];

  notifications.sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );

  return notifications.slice(0, safeLimit) satisfies DashboardNotification[];
}

export async function listAdminUsers(limit = 100) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const safeLimit = Math.max(limit, 1);
  const result = await pool.query<{
    user_id: string;
    name: string;
    email: string;
    created_at: Date;
    plan_id: string;
    organization_count: number | null;
    organization_names: string[] | null;
    total_conversions: number | null;
    total_credits: number | null;
    credits_used: number | null;
  }>(
    `
      WITH organization_agg AS (
        SELECT
          membership.user_id,
          COUNT(DISTINCT membership.organization_id)::int AS organization_count,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT organization.name), NULL) AS organization_names
        FROM organization_memberships membership
        LEFT JOIN organizations organization
          ON organization.id = membership.organization_id
        GROUP BY membership.user_id
      ),
      conversion_agg AS (
        SELECT user_id, COUNT(*)::int AS total_conversions
        FROM user_conversions
        GROUP BY user_id
      ),
      credit_agg AS (
        SELECT
          workspace_user_id AS user_id,
          COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::int AS total_credits,
          COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)::int AS credits_used
        FROM workspace_credit_transactions
        WHERE workspace_type = 'personal'
          AND workspace_user_id IS NOT NULL
        GROUP BY workspace_user_id
      )
      SELECT
        user_record.id AS user_id,
        user_record.name,
        user_record.email,
        user_record.created_at,
        COALESCE(subscription.plan_id, $2) AS plan_id,
        COALESCE(organization_agg.organization_count, 0)::int AS organization_count,
        organization_agg.organization_names,
        COALESCE(conversion_agg.total_conversions, 0)::int AS total_conversions,
        COALESCE(credit_agg.total_credits, 0)::int AS total_credits,
        COALESCE(credit_agg.credits_used, 0)::int AS credits_used
      FROM app_users user_record
      LEFT JOIN user_subscriptions subscription
        ON subscription.user_id = user_record.id
      LEFT JOIN organization_agg
        ON organization_agg.user_id = user_record.id
      LEFT JOIN conversion_agg
        ON conversion_agg.user_id = user_record.id
      LEFT JOIN credit_agg
        ON credit_agg.user_id = user_record.id
      ORDER BY user_record.created_at DESC, user_record.name ASC
      LIMIT $1
    `,
    [safeLimit, DEFAULT_PLAN_ID],
  );

  return result.rows.map((row) => {
    const planId = isPlanId(row.plan_id) ? row.plan_id : DEFAULT_PLAN_ID;

    return {
      id: row.user_id,
      name: row.name,
      email: row.email,
      createdAt: normalizeIsoDate(row.created_at),
      planId,
      planName: getPlanDefinition(planId).name,
      totalConversions: normalizeNumber(row.total_conversions),
      personalCreditsRemaining: Math.max(
        normalizeNumber(row.total_credits) - normalizeNumber(row.credits_used),
        0,
      ),
      organizationCount: normalizeNumber(row.organization_count),
      organizations: Array.isArray(row.organization_names)
        ? row.organization_names.filter(
            (value): value is string =>
              typeof value === "string" && value.trim().length > 0,
          )
        : [],
    } satisfies AdminUserDirectoryEntry;
  });
}

export async function listAdminOrganizations(limit = 50) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const safeLimit = Math.max(limit, 1);
  const result = await pool.query<{
    organization_id: string;
    organization_name: string;
    organization_created_at: Date;
    organization_updated_at: Date;
    owner_name: string;
    owner_email: string;
    member_user_id: string | null;
    member_name: string | null;
    member_email: string | null;
    member_role: OrganizationRole | null;
    member_created_at: Date | null;
  }>(
    `
      WITH selected_organizations AS (
        SELECT id, name, owner_user_id, created_at, updated_at
        FROM organizations
        ORDER BY updated_at DESC, created_at DESC
        LIMIT $1
      )
      SELECT
        organization.id AS organization_id,
        organization.name AS organization_name,
        organization.created_at AS organization_created_at,
        organization.updated_at AS organization_updated_at,
        owner_user.name AS owner_name,
        owner_user.email AS owner_email,
        membership.user_id AS member_user_id,
        member_user.name AS member_name,
        member_user.email AS member_email,
        membership.role AS member_role,
        membership.created_at AS member_created_at
      FROM selected_organizations organization
      JOIN app_users owner_user
        ON owner_user.id = organization.owner_user_id
      LEFT JOIN organization_memberships membership
        ON membership.organization_id = organization.id
      LEFT JOIN app_users member_user
        ON member_user.id = membership.user_id
      ORDER BY
        organization.updated_at DESC,
        organization.created_at DESC,
        CASE membership.role
          WHEN 'owner' THEN 0
          WHEN 'admin' THEN 1
          ELSE 2
        END,
        member_user.name ASC
    `,
    [safeLimit],
  );

  const organizations = new Map<string, AdminOrganizationDirectoryEntry>();

  for (const row of result.rows) {
    const existing = organizations.get(row.organization_id);

    if (!existing) {
      organizations.set(row.organization_id, {
        id: row.organization_id,
        name: row.organization_name,
        ownerName: row.owner_name,
        ownerEmail: row.owner_email,
        createdAt: normalizeIsoDate(row.organization_created_at),
        updatedAt: normalizeIsoDate(row.organization_updated_at),
        memberCount: 0,
        members: [],
      });
    }

    if (!row.member_user_id || !row.member_name || !row.member_email) {
      continue;
    }

    const organization = organizations.get(row.organization_id);

    if (!organization) {
      continue;
    }

    organization.members.push({
      userId: row.member_user_id,
      name: row.member_name,
      email: row.member_email,
      role: normalizeOrganizationRole(row.member_role),
      joinedAt: normalizeIsoDate(row.member_created_at),
    });
    organization.memberCount = organization.members.length;
  }

  return [...organizations.values()];
}

export async function grantAdminCredits(input: {
  targetUserId: string;
  amount: number;
  note?: string | null;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const amount = Number(input.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Enter a whole number of credits.");
    }

    const targetUser = await client.query<{
      id: string;
      name: string;
      email: string;
    }>(
      `
        SELECT id, name, email
        FROM app_users
        WHERE id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [input.targetUserId],
    );

    if (targetUser.rowCount === 0) {
      throw new Error("User not found.");
    }

    await lockWorkspaceCredits(
      {
        type: "personal",
        userId: input.targetUserId,
      },
      client,
    );

    await addWorkspaceCredits({
      workspace: {
        type: "personal",
        userId: input.targetUserId,
      },
      amount,
      transactionType: "admin_grant",
      note: input.note?.trim() || "Admin grant",
      client,
    });

    const credits = await readWorkspaceCreditBalance(
      {
        type: "personal",
        userId: input.targetUserId,
      },
      client,
    );

    await client.query("COMMIT");

    return {
      userId: targetUser.rows[0].id,
      name: targetUser.rows[0].name,
      email: targetUser.rows[0].email,
      credits,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listUserOrganizations(userId: string) {
  return (await listOrganizationMembershipRows(userId)).map(mapOrganizationSummary);
}

export async function createOrganization(input: {
  ownerUserId: string;
  name: string;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Enter an organization name.");
  }

  const organizationId = randomUUID();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const created = await client.query<{
      id: string;
      name: string;
      owner_user_id: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        INSERT INTO organizations (
          id,
          name,
          owner_user_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, now(), now())
        RETURNING id, name, owner_user_id, created_at, updated_at
      `,
      [organizationId, name, input.ownerUserId],
    );

    await client.query(
      `
        INSERT INTO organization_memberships (
          id,
          organization_id,
          user_id,
          role,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, 'owner', now(), now())
      `,
      [randomUUID(), organizationId, input.ownerUserId],
    );

    await createDefaultOrganizationSubscription(organizationId, client);

    await client.query("COMMIT");

    return {
      id: created.rows[0].id,
      name: created.rows[0].name,
      ownerUserId: created.rows[0].owner_user_id,
      createdAt: normalizeIsoDate(created.rows[0].created_at),
      updatedAt: normalizeIsoDate(created.rows[0].updated_at),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getOrganizationRoleForUser(
  organizationId: string,
  userId: string,
  client: Queryable = getDatabasePool(),
) {
  const result = await client.query<{ role: OrganizationRole }>(
    `
      SELECT role
      FROM organization_memberships
      WHERE organization_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [organizationId, userId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return normalizeOrganizationRole(result.rows[0].role);
}

export async function getOrganizationMembers(
  actorUserId: string,
  organizationId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const result = await pool.query<{
    user_id: string;
    name: string;
    email: string;
    role: OrganizationRole;
    created_at: Date;
  }>(
    `
      SELECT
        membership.user_id,
        user_record.name,
        user_record.email,
        membership.role,
        membership.created_at
      FROM organization_memberships membership
      JOIN app_users user_record
        ON user_record.id = membership.user_id
      WHERE membership.organization_id = $1
      ORDER BY
        CASE membership.role
          WHEN 'owner' THEN 0
          WHEN 'admin' THEN 1
          ELSE 2
        END,
        user_record.name ASC
    `,
    [organizationId],
  );

  return result.rows.map((row) => ({
    userId: row.user_id,
    name: row.name,
    email: row.email,
    role: normalizeOrganizationRole(row.role),
    joinedAt: normalizeIsoDate(row.created_at),
  })) satisfies OrganizationMember[];
}

export async function updateOrganizationName(input: {
  actorUserId: string;
  organizationId: string;
  name: string;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const role = await getOrganizationRoleForUser(
      input.organizationId,
      input.actorUserId,
      client,
    );

    if (role !== "owner") {
      throw new Error("Only the organization owner can update the name.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("Enter an organization name.");
    }

    await client.query(
      `
        UPDATE organizations
        SET name = $2, updated_at = now()
        WHERE id = $1
      `,
      [input.organizationId, name],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createOrganizationInvitation(input: {
  actorUserId: string;
  organizationId: string;
  email: string;
  role: Exclude<OrganizationRole, "owner">;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const actorRole = await getOrganizationRoleForUser(
      input.organizationId,
      input.actorUserId,
      client,
    );

    if (actorRole !== "owner" && actorRole !== "admin") {
      throw new Error("Only owners or admins can invite teammates.");
    }

    const usageState = await ensureCurrentOrganizationUsageRows(
      input.organizationId,
      client,
      true,
    );

    const teamAccessEnabled = await organizationHasTeamAccess({
      organizationId: input.organizationId,
      planId: usageState.subscription.plan_id,
      client,
    });

    if (!teamAccessEnabled) {
      throw new Error(
        "Upgrade this workspace to Business to invite teammates.",
      );
    }

    const email = input.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }

    const role = normalizeInviteRole(input.role);
    const existingMember = await client.query<{ user_id: string }>(
      `
        SELECT user_id
        FROM organization_memberships membership
        JOIN app_users user_record
          ON user_record.id = membership.user_id
        WHERE membership.organization_id = $1
          AND user_record.email = $2
        LIMIT 1
      `,
      [input.organizationId, email],
    );

    if ((existingMember.rowCount ?? 0) > 0) {
      throw new Error("That user is already in the organization.");
    }

    const existingInvite = await client.query<{ id: string }>(
      `
        SELECT id
        FROM organization_invitations
        WHERE organization_id = $1
          AND email = $2
          AND status = 'pending'
        LIMIT 1
      `,
      [input.organizationId, email],
    );

    if ((existingInvite.rowCount ?? 0) > 0) {
      throw new Error("An invite for that email already exists.");
    }

    await client.query(
      `
        INSERT INTO organization_invitations (
          id,
          organization_id,
          email,
          role,
          invited_by_user_id,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'pending', now(), now())
      `,
      [randomUUID(), input.organizationId, email, role, input.actorUserId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrganizationInvitations(
  actorUserId: string,
  organizationId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    organization_id: string;
    organization_name: string;
    email: string;
    role: string;
    invited_by_user_id: string;
    invited_by_name: string;
    status: string;
    created_at: Date;
    accepted_at: Date | null;
  }>(
    `
      SELECT
        invitation.id,
        invitation.organization_id,
        organization.name AS organization_name,
        invitation.email,
        invitation.role,
        invitation.invited_by_user_id,
        inviter.name AS invited_by_name,
        invitation.status,
        invitation.created_at,
        invitation.accepted_at
      FROM organization_invitations invitation
      JOIN organizations organization
        ON organization.id = invitation.organization_id
      JOIN app_users inviter
        ON inviter.id = invitation.invited_by_user_id
      WHERE invitation.organization_id = $1
      ORDER BY invitation.created_at DESC
    `,
    [organizationId],
  );

  return result.rows.map(mapOrganizationInvite);
}

export async function listPendingOrganizationInvitesForUser(user: {
  id: string;
  email: string;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    organization_id: string;
    organization_name: string;
    email: string;
    role: string;
    invited_by_user_id: string;
    invited_by_name: string;
    status: string;
    created_at: Date;
    accepted_at: Date | null;
  }>(
    `
      SELECT
        invitation.id,
        invitation.organization_id,
        organization.name AS organization_name,
        invitation.email,
        invitation.role,
        invitation.invited_by_user_id,
        inviter.name AS invited_by_name,
        invitation.status,
        invitation.created_at,
        invitation.accepted_at
      FROM organization_invitations invitation
      JOIN organizations organization
        ON organization.id = invitation.organization_id
      JOIN app_users inviter
        ON inviter.id = invitation.invited_by_user_id
      WHERE invitation.email = $1
        AND invitation.status = 'pending'
        AND NOT EXISTS (
          SELECT 1
          FROM organization_memberships membership
          WHERE membership.organization_id = invitation.organization_id
            AND membership.user_id = $2
        )
      ORDER BY invitation.created_at DESC
    `,
    [user.email.trim().toLowerCase(), user.id],
  );

  return result.rows.map(mapOrganizationInvite);
}

export async function acceptOrganizationInvitation(input: {
  invitationId: string;
  userId: string;
  email: string;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const invite = await client.query<{
      organization_id: string;
      email: string;
      role: string;
      status: string;
    }>(
      `
        SELECT organization_id, email, role, status
        FROM organization_invitations
        WHERE id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [input.invitationId],
    );

    if (invite.rowCount === 0) {
      throw new Error("Invitation not found.");
    }

    const invitation = invite.rows[0];

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer available.");
    }

    if (invitation.email.toLowerCase() !== input.email.trim().toLowerCase()) {
      throw new Error("This invitation is for a different email.");
    }

    const usageState = await ensureCurrentOrganizationUsageRows(
      invitation.organization_id,
      client,
      true,
    );

    const teamAccessEnabled = await organizationHasTeamAccess({
      organizationId: invitation.organization_id,
      planId: usageState.subscription.plan_id,
      client,
    });

    if (!teamAccessEnabled) {
      throw new Error(
        "This workspace needs the Business plan before teammates can join.",
      );
    }

    await client.query(
      `
        INSERT INTO organization_memberships (
          id,
          organization_id,
          user_id,
          role,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, now(), now())
        ON CONFLICT (organization_id, user_id)
        DO NOTHING
      `,
      [
        randomUUID(),
        invitation.organization_id,
        input.userId,
        normalizeInviteRole(invitation.role),
      ],
    );

    await client.query(
      `
        UPDATE organization_invitations
        SET
          status = 'accepted',
          accepted_at = now(),
          accepted_by_user_id = $2,
          updated_at = now()
        WHERE id = $1
      `,
      [input.invitationId, input.userId],
    );

    await client.query("COMMIT");

    return invitation.organization_id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function normalizeOwnedProjectId(
  userId: string,
  projectId: string | null | undefined,
) {
  await ensureAppTables();

  if (!projectId || projectId.trim().length === 0) {
    return null;
  }

  const pool = getDatabasePool();
  const result = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM user_projects
      WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
      LIMIT 1
    `,
    [userId, projectId.trim()],
  );

  if (result.rowCount === 0) {
    throw new Error("Project not found.");
  }

  return result.rows[0].id;
}

export async function updateUserSettings(
  userId: string,
  input: Partial<UserSettings>,
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const currentSettings = await getUserSettings(userId);
  const workspaceName =
    input.workspaceName?.trim() || currentSettings.workspaceName;
  const preferredCurrency =
    input.preferredCurrency?.trim().toUpperCase() ||
    currentSettings.preferredCurrency;
  const exportName = input.exportName?.trim() || currentSettings.exportName;
  const defaultProjectId = await normalizeOwnedProjectId(
    userId,
    input.defaultProjectId ?? currentSettings.defaultProjectId,
  );

  await pool.query(
    `
      INSERT INTO user_settings (
        user_id,
        workspace_name,
        preferred_currency,
        export_name,
        default_project_id,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT (user_id)
      DO UPDATE SET
        workspace_name = EXCLUDED.workspace_name,
        preferred_currency = EXCLUDED.preferred_currency,
        export_name = EXCLUDED.export_name,
        default_project_id = EXCLUDED.default_project_id,
        updated_at = now()
    `,
    [userId, workspaceName, preferredCurrency, exportName, defaultProjectId],
  );

  return getUserSettings(userId);
}

async function assertPersonalProjectAllowance(
  userId: string,
  client: Queryable = getDatabasePool(),
) {
  const planSummary = await getUserPlanSummary(userId);

  if (planSummary.projectLimit === null) {
    return;
  }

  const result = await client.query<{ total_projects: number }>(
    `
      SELECT COUNT(*)::int AS total_projects
      FROM user_projects
      WHERE user_id = $1 AND organization_id IS NULL
    `,
    [userId],
  );
  const totalProjects = normalizeNumber(result.rows[0]?.total_projects);

  if (totalProjects >= planSummary.projectLimit) {
    throw new Error(
      `${planSummary.planName} includes 1 client. Upgrade to manage multiple clients.`,
    );
  }
}

async function assertOrganizationProjectAllowance(
  organizationId: string,
  client: Queryable = getDatabasePool(),
) {
  const planSummary = await getOrganizationPlanSummary(organizationId);

  if (planSummary.projectLimit === null) {
    return;
  }

  const result = await client.query<{ total_projects: number }>(
    `
      SELECT COUNT(*)::int AS total_projects
      FROM user_projects
      WHERE organization_id = $1
    `,
    [organizationId],
  );
  const totalProjects = normalizeNumber(result.rows[0]?.total_projects);

  if (totalProjects >= planSummary.projectLimit) {
    throw new Error(
      `${planSummary.planName} includes 1 client. Upgrade to manage multiple clients.`,
    );
  }
}

export async function saveUserConversion(
  userId: string,
  preview: StatementPreview,
  requestedProjectId?: string | null,
  options?: {
    bypassUsageLimits?: boolean;
  },
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const projectId = await normalizeOwnedProjectId(userId, requestedProjectId);
  const conversionId = randomUUID();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await lockWorkspaceCredits(
      {
        type: "personal",
        userId,
      },
      client,
    );

    const usageState = await ensureCurrentUsageRows(userId, client, true);
    const currentPlan = buildPlanSummary(
      usageState.subscription,
      usageState.usage,
      await readWorkspaceCreditBalance(
        {
          type: "personal",
          userId,
        },
        client,
      ),
    );
    const projectedConversions = currentPlan.usage.conversionsUsed + 1;
    const consumeCredit =
      !options?.bypassUsageLimits &&
      projectedConversions > currentPlan.usage.conversionLimit;

    if (consumeCredit && currentPlan.credits.creditsRemaining <= 0) {
      throw new UsageLimitError(
        "conversion_limit",
        "You've reached your monthly limit and have no credits remaining. Upgrade or buy credits to continue processing statements.",
      );
    }

    const inserted = await client.query<{
      id: string;
      user_id: string;
      organization_id: string | null;
      file_name: string;
      created_at: Date;
      page_count: number;
      row_count: number;
      detected_bank: string | null;
      detected_currency: string | null;
      parser_id: string;
      layout_signature: string;
      review_recommended: boolean;
      statement_start_date: string | null;
      statement_end_date: string | null;
      project_id: string | null;
      project_name: string | null;
      preview: StatementPreview;
    }>(
      `
        INSERT INTO user_conversions (
          id,
          user_id,
          file_name,
          created_at,
          page_count,
          row_count,
          detected_bank,
          detected_currency,
          parser_id,
          layout_signature,
          review_recommended,
          statement_start_date,
          statement_end_date,
          preview,
          project_id
        )
        VALUES (
          $1,
          $2,
          $3,
          now(),
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13::jsonb,
          $14
        )
        RETURNING
          id,
          user_id,
          file_name,
          created_at,
          page_count,
          row_count,
          detected_bank,
          detected_currency,
          parser_id,
          layout_signature,
          review_recommended,
          statement_start_date,
          statement_end_date,
          project_id,
          preview
      `,
      [
        conversionId,
        userId,
        preview.fileName,
        preview.pageCount,
        preview.rowCount,
        preview.detectedBank,
        preview.detectedCurrency,
        preview.parserId,
        preview.layoutSignature,
        preview.reviewRecommended,
        preview.statementStartDate,
        preview.statementEndDate,
        JSON.stringify(preview),
        projectId,
      ],
    );

    if (projectId) {
      await touchProject(userId, projectId, client);
    }

    if (consumeCredit) {
      await addWorkspaceCredits({
        workspace: {
          type: "personal",
          userId,
        },
        amount: -1,
        transactionType: "conversion_usage",
        note: preview.fileName,
        conversionId,
        client,
      });
    }

    if (!options?.bypassUsageLimits) {
      await client.query(
        `
          UPDATE user_usage_cycles
          SET
            conversions_used = conversions_used + 1,
            pages_processed = pages_processed + $3,
            rows_processed = rows_processed + $4,
            updated_at = now()
          WHERE user_id = $1
            AND cycle_started_at = $2::timestamptz
        `,
        [
          userId,
          normalizeIsoDate(usageState.usage.cycle_started_at),
          preview.pageCount,
          preview.rowCount,
        ],
      );
    }

    let projectName: string | null = null;

    if (projectId) {
      const project = await client.query<{ project_name: string }>(
        `
          SELECT project_name
          FROM user_projects
          WHERE user_id = $1 AND id = $2
          LIMIT 1
        `,
        [userId, projectId],
      );

      projectName = project.rows[0]?.project_name ?? null;
    }

    await client.query("COMMIT");

    return mapStoredConversion({
      ...inserted.rows[0],
      project_name: projectName,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function buildConversionWhereClause(
  userId: string,
  filters: ConversionListFilters,
) {
  const clauses = ["c.user_id = $1", "c.organization_id IS NULL"];
  const values: Array<string | number | null> = [userId];

  if (filters.unassignedOnly) {
    clauses.push("c.project_id IS NULL");
  } else if (filters.projectId) {
    clauses.push(`c.project_id = $${values.length + 1}`);
    values.push(filters.projectId);
  }

  if (filters.detectedBank) {
    clauses.push(`c.detected_bank = $${values.length + 1}`);
    values.push(filters.detectedBank);
  }

  if (filters.uploadedFrom) {
    clauses.push(`c.created_at::date >= $${values.length + 1}::date`);
    values.push(filters.uploadedFrom);
  }

  if (filters.uploadedTo) {
    clauses.push(`c.created_at::date <= $${values.length + 1}::date`);
    values.push(filters.uploadedTo);
  }

  return {
    clause: clauses.join(" AND "),
    values,
  };
}

export async function listUserConversions(
  userId: string,
  filtersOrLimit: number | ConversionListFilters = {},
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const filters =
    typeof filtersOrLimit === "number"
      ? { limit: filtersOrLimit }
      : filtersOrLimit;
  const { clause, values } = buildConversionWhereClause(userId, filters);
  const limit = Math.max(1, Math.min(filters.limit ?? 50, 200));

  const result = await pool.query<{
    id: string;
    user_id: string;
    file_name: string;
    created_at: Date;
    page_count: number;
    row_count: number;
    detected_bank: string | null;
    detected_currency: string | null;
    parser_id: string;
    layout_signature: string;
    review_recommended: boolean;
    statement_start_date: string | null;
    statement_end_date: string | null;
    project_id: string | null;
    project_name: string | null;
    preview: StatementPreview;
  }>(
    `
      SELECT
        c.id,
        c.user_id,
        c.organization_id,
        c.file_name,
        c.created_at,
        c.page_count,
        c.row_count,
        c.detected_bank,
        c.detected_currency,
        c.parser_id,
        c.layout_signature,
        c.review_recommended,
        c.statement_start_date,
        c.statement_end_date,
        c.project_id,
        p.project_name,
        c.preview
      FROM user_conversions c
      LEFT JOIN user_projects p
        ON p.id = c.project_id
       AND p.user_id = c.user_id
      WHERE ${clause}
      ORDER BY c.created_at DESC
      LIMIT $${values.length + 1}
    `,
    [...values, limit],
  );

  return result.rows.map(mapStoredConversion);
}

export async function listUnassignedConversions(userId: string, limit = 10) {
  return listUserConversions(userId, {
    limit,
    unassignedOnly: true,
  });
}

export async function getUserConversionById(userId: string, conversionId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const result = await pool.query<{
      id: string;
      user_id: string;
      organization_id: string | null;
      file_name: string;
    created_at: Date;
    page_count: number;
    row_count: number;
    detected_bank: string | null;
    detected_currency: string | null;
    parser_id: string;
    layout_signature: string;
    review_recommended: boolean;
    statement_start_date: string | null;
    statement_end_date: string | null;
    project_id: string | null;
    project_name: string | null;
    preview: StatementPreview;
  }>(
    `
      SELECT
        c.id,
        c.user_id,
        c.organization_id,
        c.file_name,
        c.created_at,
        c.page_count,
        c.row_count,
        c.detected_bank,
        c.detected_currency,
        c.parser_id,
        c.layout_signature,
        c.review_recommended,
        c.statement_start_date,
        c.statement_end_date,
        c.project_id,
        p.project_name,
        c.preview
      FROM user_conversions c
      LEFT JOIN user_projects p
        ON p.id = c.project_id
       AND p.user_id = c.user_id
      WHERE c.user_id = $1 AND c.id = $2 AND c.organization_id IS NULL
      LIMIT 1
    `,
    [userId, conversionId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapStoredConversion(result.rows[0]);
}

export async function assignConversionToProject(
  userId: string,
  conversionId: string,
  requestedProjectId: string | null,
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const projectId = await normalizeOwnedProjectId(userId, requestedProjectId);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<{ project_id: string | null }>(
      `
        SELECT project_id
        FROM user_conversions
        WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
        LIMIT 1
      `,
      [userId, conversionId],
    );

    if (existing.rowCount === 0) {
      throw new Error("Conversion not found.");
    }

    const previousProjectId = existing.rows[0].project_id;

    await client.query(
      `
        UPDATE user_conversions
        SET project_id = $3
        WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
      `,
      [userId, conversionId, projectId],
    );

    if (previousProjectId && previousProjectId !== projectId) {
      await touchProject(userId, previousProjectId, client);
    }

    if (projectId) {
      await touchProject(userId, projectId, client);
    }

    const settingsRow = await client.query<{ default_project_id: string | null }>(
      `
        SELECT default_project_id
        FROM user_settings
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId],
    );

    if (
      previousProjectId &&
      previousProjectId !== projectId &&
      settingsRow.rows[0]?.default_project_id === previousProjectId &&
      projectId === null
    ) {
      await client.query(
        `
          UPDATE user_settings
          SET default_project_id = NULL, updated_at = now()
          WHERE user_id = $1
        `,
        [userId],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getUserConversionById(userId, conversionId);
}

export async function deleteUserConversion(userId: string, conversionId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<{ project_id: string | null }>(
      `
        SELECT project_id
        FROM user_conversions
        WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [userId, conversionId],
    );

    if ((existing.rowCount ?? 0) === 0) {
      throw new Error("Conversion not found.");
    }

    await client.query(
      `
        DELETE FROM user_conversions
        WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
      `,
      [userId, conversionId],
    );

    if (existing.rows[0]?.project_id) {
      await touchProject(userId, existing.rows[0].project_id, client);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserConversionStats(userId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const [conversionStats, projectStats] = await Promise.all([
    pool.query<{
      total_conversions: number | null;
      total_files_processed: number | null;
      total_transaction_rows: number | null;
      unassigned_conversions: number | null;
    }>(
      `
        SELECT
          COUNT(*)::int AS total_conversions,
          COUNT(*)::int AS total_files_processed,
          COALESCE(SUM(row_count), 0)::int AS total_transaction_rows,
          COALESCE(SUM(CASE WHEN project_id IS NULL THEN 1 ELSE 0 END), 0)::int AS unassigned_conversions
        FROM user_conversions
        WHERE user_id = $1
          AND organization_id IS NULL
      `,
      [userId],
    ),
    pool.query<{ total_projects: number | null }>(
      `
        SELECT COUNT(*)::int AS total_projects
        FROM user_projects
        WHERE user_id = $1
      `,
      [userId],
    ),
  ]);

  return {
    totalConversions: normalizeNumber(conversionStats.rows[0]?.total_conversions),
    totalFilesProcessed: normalizeNumber(
      conversionStats.rows[0]?.total_files_processed,
    ),
    totalProjects: normalizeNumber(projectStats.rows[0]?.total_projects),
    unassignedConversions: normalizeNumber(
      conversionStats.rows[0]?.unassigned_conversions,
    ),
    totalTransactionRows: normalizeNumber(
      conversionStats.rows[0]?.total_transaction_rows,
    ),
  } satisfies DashboardStats;
}

function projectAggregateQuery(limit: number | null) {
  return `
    SELECT
      p.id,
      p.user_id,
      p.organization_id,
      p.project_name,
      p.client_name,
      p.notes,
      p.created_at,
      p.updated_at,
      COUNT(c.id)::int AS conversion_count,
      COALESCE(SUM(c.row_count), 0)::int AS total_row_count,
      ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.detected_bank), NULL) AS banks_detected,
      MIN(c.statement_start_date) AS coverage_start_date,
      MAX(c.statement_end_date) AS coverage_end_date
    FROM user_projects p
    LEFT JOIN user_conversions c
      ON c.project_id = p.id
     AND c.user_id = p.user_id
     AND c.organization_id IS NULL
    WHERE p.user_id = $1
      AND p.organization_id IS NULL
    GROUP BY
      p.id,
      p.user_id,
      p.organization_id,
      p.project_name,
      p.client_name,
      p.notes,
      p.created_at,
      p.updated_at
    ORDER BY p.updated_at DESC, p.created_at DESC
    ${limit === null ? "" : "LIMIT $2"}
  `;
}

export async function listUserProjects(userId: string, limit = 12) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string | null;
    project_name: string;
    client_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    conversion_count: number;
    total_row_count: number;
    banks_detected: string[];
    coverage_start_date: string | null;
    coverage_end_date: string | null;
  }>(projectAggregateQuery(safeLimit), [userId, safeLimit]);

  return result.rows.map(mapProject);
}

export async function createProject(input: {
  userId: string;
  projectName: string;
  clientName?: string | null;
  notes?: string | null;
}) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const projectName = input.projectName.trim();

  if (!projectName) {
    throw new Error("Enter a project name.");
  }

  await assertPersonalProjectAllowance(input.userId, pool);

  const result = await pool.query<{
    id: string;
    user_id: string;
    project_name: string;
    client_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `
      INSERT INTO user_projects (
        id,
        user_id,
        organization_id,
        project_name,
        client_name,
        notes,
        created_at,
        updated_at
      )
      VALUES ($1, $2, NULL, $3, $4, $5, now(), now())
      RETURNING id, user_id, project_name, client_name, notes, created_at, updated_at
    `,
    [
      randomUUID(),
      input.userId,
      projectName,
      input.clientName?.trim() || null,
      input.notes?.trim() || null,
    ],
  );

  return mapProject({
    ...result.rows[0],
    conversion_count: 0,
    total_row_count: 0,
    banks_detected: [],
    coverage_start_date: null,
    coverage_end_date: null,
  });
}

export async function getUserProjectById(userId: string, projectId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string | null;
    project_name: string;
    client_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    conversion_count: number;
    total_row_count: number;
    banks_detected: string[];
    coverage_start_date: string | null;
    coverage_end_date: string | null;
  }>(
    `
      SELECT
        p.id,
        p.user_id,
        p.organization_id,
        p.project_name,
        p.client_name,
        p.notes,
        p.created_at,
        p.updated_at,
        COUNT(c.id)::int AS conversion_count,
        COALESCE(SUM(c.row_count), 0)::int AS total_row_count,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.detected_bank), NULL) AS banks_detected,
        MIN(c.statement_start_date) AS coverage_start_date,
        MAX(c.statement_end_date) AS coverage_end_date
      FROM user_projects p
      LEFT JOIN user_conversions c
        ON c.project_id = p.id
       AND c.user_id = p.user_id
      WHERE p.user_id = $1 AND p.id = $2 AND p.organization_id IS NULL
      GROUP BY
        p.id,
        p.user_id,
        p.organization_id,
        p.project_name,
        p.client_name,
        p.notes,
        p.created_at,
        p.updated_at
      LIMIT 1
    `,
    [userId, projectId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapProject(result.rows[0]);
}

export async function deleteUserProject(userId: string, projectId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const project = await client.query<{ id: string }>(
      `
        SELECT id
        FROM user_projects
        WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [userId, projectId],
    );

    if ((project.rowCount ?? 0) === 0) {
      throw new Error("Project not found.");
    }

    const usage = await client.query<{ total_conversions: number | null }>(
      `
        SELECT COUNT(*)::int AS total_conversions
        FROM user_conversions
        WHERE user_id = $1 AND project_id = $2 AND organization_id IS NULL
      `,
      [userId, projectId],
    );

    if (normalizeNumber(usage.rows[0]?.total_conversions) > 0) {
      throw new Error("Only empty projects can be removed.");
    }

    await client.query(
      `
        DELETE FROM user_projects
        WHERE user_id = $1 AND id = $2 AND organization_id IS NULL
      `,
      [userId, projectId],
    );

    await client.query(
      `
        UPDATE user_settings
        SET default_project_id = NULL, updated_at = now()
        WHERE user_id = $1 AND default_project_id = $2
      `,
      [userId, projectId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listProjectConversions(
  userId: string,
  projectId: string,
  limit = 50,
) {
  return listUserConversions(userId, {
    limit,
    projectId,
  });
}

export async function listUserDetectedBanks(userId: string) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const result = await pool.query<{ detected_bank: string }>(
    `
      SELECT DISTINCT detected_bank
      FROM user_conversions
      WHERE user_id = $1
        AND detected_bank IS NOT NULL
        AND detected_bank <> ''
        AND organization_id IS NULL
      ORDER BY detected_bank ASC
    `,
    [userId],
  );

  return result.rows.map((row) => row.detected_bank);
}

async function normalizeOrganizationProjectId(
  organizationId: string,
  projectId: string | null | undefined,
) {
  await ensureAppTables();

  if (!projectId || projectId.trim().length === 0) {
    return null;
  }

  const pool = getDatabasePool();
  const result = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM user_projects
      WHERE organization_id = $1 AND id = $2
      LIMIT 1
    `,
    [organizationId, projectId.trim()],
  );

  if (result.rowCount === 0) {
    throw new Error("Project not found.");
  }

  return result.rows[0].id;
}

function buildOrganizationConversionWhereClause(
  organizationId: string,
  filters: ConversionListFilters,
) {
  const clauses = ["c.organization_id = $1"];
  const values: Array<string | number | null> = [organizationId];

  if (filters.unassignedOnly) {
    clauses.push("c.project_id IS NULL");
  } else if (filters.projectId) {
    clauses.push(`c.project_id = $${values.length + 1}`);
    values.push(filters.projectId);
  }

  if (filters.detectedBank) {
    clauses.push(`c.detected_bank = $${values.length + 1}`);
    values.push(filters.detectedBank);
  }

  if (filters.uploadedFrom) {
    clauses.push(`c.created_at::date >= $${values.length + 1}::date`);
    values.push(filters.uploadedFrom);
  }

  if (filters.uploadedTo) {
    clauses.push(`c.created_at::date <= $${values.length + 1}::date`);
    values.push(filters.uploadedTo);
  }

  return {
    clause: clauses.join(" AND "),
    values,
  };
}

async function saveOrganizationConversion(
  actorUserId: string,
  organizationId: string,
  preview: StatementPreview,
  requestedProjectId?: string | null,
  options?: {
    bypassUsageLimits?: boolean;
  },
) {
  await ensureAppTables();
  const pool = getDatabasePool();
  const actorRole = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!actorRole) {
    throw new Error("Organization not found.");
  }

  const projectId = await normalizeOrganizationProjectId(
    organizationId,
    requestedProjectId,
  );
  const conversionId = randomUUID();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await lockWorkspaceCredits(
      {
        type: "organization",
        organizationId,
        role: actorRole,
        userId: actorUserId,
      },
      client,
    );

    const usageState = await ensureCurrentOrganizationUsageRows(
      organizationId,
      client,
      true,
    );
    const currentPlan = buildPlanSummary(
      usageState.subscription,
      usageState.usage,
      await readWorkspaceCreditBalance(
        {
          type: "organization",
          organizationId,
          role: actorRole,
          userId: actorUserId,
        },
        client,
      ),
    );
    const projectedConversions = currentPlan.usage.conversionsUsed + 1;
    const consumeCredit =
      !options?.bypassUsageLimits &&
      projectedConversions > currentPlan.usage.conversionLimit;

    if (consumeCredit && currentPlan.credits.creditsRemaining <= 0) {
      throw new UsageLimitError(
        "conversion_limit",
        "You've reached your monthly limit and have no credits remaining. Upgrade or buy credits to continue processing statements.",
      );
    }

    const inserted = await client.query<{
      id: string;
      user_id: string;
      organization_id: string;
      file_name: string;
      created_at: Date;
      page_count: number;
      row_count: number;
      detected_bank: string | null;
      detected_currency: string | null;
      parser_id: string;
      layout_signature: string;
      review_recommended: boolean;
      statement_start_date: string | null;
      statement_end_date: string | null;
      project_id: string | null;
      preview: StatementPreview;
    }>(
      `
        INSERT INTO user_conversions (
          id,
          user_id,
          organization_id,
          file_name,
          created_at,
          page_count,
          row_count,
          detected_bank,
          detected_currency,
          parser_id,
          layout_signature,
          review_recommended,
          statement_start_date,
          statement_end_date,
          preview,
          project_id
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          now(),
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14::jsonb,
          $15
        )
        RETURNING
          id,
          user_id,
          organization_id,
          file_name,
          created_at,
          page_count,
          row_count,
          detected_bank,
          detected_currency,
          parser_id,
          layout_signature,
          review_recommended,
          statement_start_date,
          statement_end_date,
          project_id,
          preview
      `,
      [
        conversionId,
        actorUserId,
        organizationId,
        preview.fileName,
        preview.pageCount,
        preview.rowCount,
        preview.detectedBank,
        preview.detectedCurrency,
        preview.parserId,
        preview.layoutSignature,
        preview.reviewRecommended,
        preview.statementStartDate,
        preview.statementEndDate,
        JSON.stringify(preview),
        projectId,
      ],
    );

    if (projectId) {
      await client.query(
        `
          UPDATE user_projects
          SET updated_at = now()
          WHERE organization_id = $1 AND id = $2
        `,
        [organizationId, projectId],
      );
    }

    if (consumeCredit) {
      await addWorkspaceCredits({
        workspace: {
          type: "organization",
          organizationId,
          role: actorRole,
          userId: actorUserId,
        },
        amount: -1,
        transactionType: "conversion_usage",
        note: preview.fileName,
        conversionId,
        client,
      });
    }

    if (!options?.bypassUsageLimits) {
      await client.query(
        `
          UPDATE organization_usage_cycles
          SET
            conversions_used = conversions_used + 1,
            pages_processed = pages_processed + $3,
            rows_processed = rows_processed + $4,
            updated_at = now()
          WHERE organization_id = $1
            AND cycle_started_at = $2::timestamptz
        `,
        [
          organizationId,
          normalizeIsoDate(usageState.usage.cycle_started_at),
          preview.pageCount,
          preview.rowCount,
        ],
      );
    }

    let projectName: string | null = null;

    if (projectId) {
      const project = await client.query<{ project_name: string }>(
        `
          SELECT project_name
          FROM user_projects
          WHERE organization_id = $1 AND id = $2
          LIMIT 1
        `,
        [organizationId, projectId],
      );

      projectName = project.rows[0]?.project_name ?? null;
    }

    await client.query("COMMIT");

    return mapStoredConversion({
      ...inserted.rows[0],
      project_name: projectName,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listOrganizationConversions(
  actorUserId: string,
  organizationId: string,
  filtersOrLimit: number | ConversionListFilters = {},
) {
  await ensureAppTables();
  const actorRole = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!actorRole) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const filters =
    typeof filtersOrLimit === "number"
      ? { limit: filtersOrLimit }
      : filtersOrLimit;
  const { clause, values } = buildOrganizationConversionWhereClause(
    organizationId,
    filters,
  );
  const limit = Math.max(1, Math.min(filters.limit ?? 50, 200));

  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string;
    file_name: string;
    created_at: Date;
    page_count: number;
    row_count: number;
    detected_bank: string | null;
    detected_currency: string | null;
    parser_id: string;
    layout_signature: string;
    review_recommended: boolean;
    statement_start_date: string | null;
    statement_end_date: string | null;
    project_id: string | null;
    project_name: string | null;
    preview: StatementPreview;
  }>(
    `
      SELECT
        c.id,
        c.user_id,
        c.organization_id,
        c.file_name,
        c.created_at,
        c.page_count,
        c.row_count,
        c.detected_bank,
        c.detected_currency,
        c.parser_id,
        c.layout_signature,
        c.review_recommended,
        c.statement_start_date,
        c.statement_end_date,
        c.project_id,
        p.project_name,
        c.preview
      FROM user_conversions c
      LEFT JOIN user_projects p
        ON p.id = c.project_id
       AND p.organization_id = c.organization_id
      WHERE ${clause}
      ORDER BY c.created_at DESC
      LIMIT $${values.length + 1}
    `,
    [...values, limit],
  );

  return result.rows.map(mapStoredConversion);
}

async function getOrganizationConversionById(
  actorUserId: string,
  organizationId: string,
  conversionId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string;
    file_name: string;
    created_at: Date;
    page_count: number;
    row_count: number;
    detected_bank: string | null;
    detected_currency: string | null;
    parser_id: string;
    layout_signature: string;
    review_recommended: boolean;
    statement_start_date: string | null;
    statement_end_date: string | null;
    project_id: string | null;
    project_name: string | null;
    preview: StatementPreview;
  }>(
    `
      SELECT
        c.id,
        c.user_id,
        c.organization_id,
        c.file_name,
        c.created_at,
        c.page_count,
        c.row_count,
        c.detected_bank,
        c.detected_currency,
        c.parser_id,
        c.layout_signature,
        c.review_recommended,
        c.statement_start_date,
        c.statement_end_date,
        c.project_id,
        p.project_name,
        c.preview
      FROM user_conversions c
      LEFT JOIN user_projects p
        ON p.id = c.project_id
       AND p.organization_id = c.organization_id
      WHERE c.organization_id = $1 AND c.id = $2
      LIMIT 1
    `,
    [organizationId, conversionId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapStoredConversion(result.rows[0]);
}

async function assignOrganizationConversionToProject(
  actorUserId: string,
  organizationId: string,
  conversionId: string,
  requestedProjectId: string | null,
) {
  await ensureAppTables();
  const actorRole = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!actorRole) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const projectId = await normalizeOrganizationProjectId(
    organizationId,
    requestedProjectId,
  );
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<{ project_id: string | null }>(
      `
        SELECT project_id
        FROM user_conversions
        WHERE organization_id = $1 AND id = $2
        LIMIT 1
      `,
      [organizationId, conversionId],
    );

    if (existing.rowCount === 0) {
      throw new Error("Conversion not found.");
    }

    const previousProjectId = existing.rows[0].project_id;

    await client.query(
      `
        UPDATE user_conversions
        SET project_id = $3
        WHERE organization_id = $1 AND id = $2
      `,
      [organizationId, conversionId, projectId],
    );

    if (previousProjectId && previousProjectId !== projectId) {
      await client.query(
        `
          UPDATE user_projects
          SET updated_at = now()
          WHERE organization_id = $1 AND id = $2
        `,
        [organizationId, previousProjectId],
      );
    }

    if (projectId) {
      await client.query(
        `
          UPDATE user_projects
          SET updated_at = now()
          WHERE organization_id = $1 AND id = $2
        `,
        [organizationId, projectId],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getWorkspaceConversionById(
    actorUserId,
    {
      type: "organization",
      organizationId,
      role: actorRole,
      userId: actorUserId,
    },
    conversionId,
  );
}

async function deleteOrganizationConversion(
  actorUserId: string,
  organizationId: string,
  conversionId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (role !== "owner" && role !== "admin") {
    throw new Error("Only owners or admins can delete saved statements.");
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<{ project_id: string | null }>(
      `
        SELECT project_id
        FROM user_conversions
        WHERE organization_id = $1 AND id = $2
        LIMIT 1
        FOR UPDATE
      `,
      [organizationId, conversionId],
    );

    if ((existing.rowCount ?? 0) === 0) {
      throw new Error("Conversion not found.");
    }

    await client.query(
      `
        DELETE FROM user_conversions
        WHERE organization_id = $1 AND id = $2
      `,
      [organizationId, conversionId],
    );

    if (existing.rows[0]?.project_id) {
      await client.query(
        `
          UPDATE user_projects
          SET updated_at = now()
          WHERE organization_id = $1 AND id = $2
        `,
        [organizationId, existing.rows[0].project_id],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function createOrganizationProject(input: {
  actorUserId: string;
  organizationId: string;
  projectName: string;
  clientName?: string | null;
  notes?: string | null;
}) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(
    input.organizationId,
    input.actorUserId,
  );

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const projectName = input.projectName.trim();

  if (!projectName) {
    throw new Error("Enter a project name.");
  }

  await assertOrganizationProjectAllowance(input.organizationId, pool);

  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string;
    project_name: string;
    client_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `
      INSERT INTO user_projects (
        id,
        user_id,
        organization_id,
        project_name,
        client_name,
        notes,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, now(), now())
      RETURNING id, user_id, organization_id, project_name, client_name, notes, created_at, updated_at
    `,
    [
      randomUUID(),
      input.actorUserId,
      input.organizationId,
      projectName,
      input.clientName?.trim() || null,
      input.notes?.trim() || null,
    ],
  );

  return mapProject({
    ...result.rows[0],
    conversion_count: 0,
    total_row_count: 0,
    banks_detected: [],
    coverage_start_date: null,
    coverage_end_date: null,
  });
}

async function listOrganizationProjects(
  actorUserId: string,
  organizationId: string,
  limit = 12,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string;
    project_name: string;
    client_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    conversion_count: number;
    total_row_count: number;
    banks_detected: string[];
    coverage_start_date: string | null;
    coverage_end_date: string | null;
  }>(
    `
      SELECT
        p.id,
        p.user_id,
        p.organization_id,
        p.project_name,
        p.client_name,
        p.notes,
        p.created_at,
        p.updated_at,
        COUNT(c.id)::int AS conversion_count,
        COALESCE(SUM(c.row_count), 0)::int AS total_row_count,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.detected_bank), NULL) AS banks_detected,
        MIN(c.statement_start_date) AS coverage_start_date,
        MAX(c.statement_end_date) AS coverage_end_date
      FROM user_projects p
      LEFT JOIN user_conversions c
        ON c.project_id = p.id
       AND c.organization_id = p.organization_id
      WHERE p.organization_id = $1
      GROUP BY
        p.id,
        p.user_id,
        p.organization_id,
        p.project_name,
        p.client_name,
        p.notes,
        p.created_at,
        p.updated_at
      ORDER BY p.updated_at DESC, p.created_at DESC
      LIMIT $2
    `,
    [organizationId, safeLimit],
  );

  return result.rows.map(mapProject);
}

async function getOrganizationProjectById(
  actorUserId: string,
  organizationId: string,
  projectId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    user_id: string;
    organization_id: string;
    project_name: string;
    client_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    conversion_count: number;
    total_row_count: number;
    banks_detected: string[];
    coverage_start_date: string | null;
    coverage_end_date: string | null;
  }>(
    `
      SELECT
        p.id,
        p.user_id,
        p.organization_id,
        p.project_name,
        p.client_name,
        p.notes,
        p.created_at,
        p.updated_at,
        COUNT(c.id)::int AS conversion_count,
        COALESCE(SUM(c.row_count), 0)::int AS total_row_count,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.detected_bank), NULL) AS banks_detected,
        MIN(c.statement_start_date) AS coverage_start_date,
        MAX(c.statement_end_date) AS coverage_end_date
      FROM user_projects p
      LEFT JOIN user_conversions c
        ON c.project_id = p.id
       AND c.organization_id = p.organization_id
      WHERE p.organization_id = $1 AND p.id = $2
      GROUP BY
        p.id,
        p.user_id,
        p.organization_id,
        p.project_name,
        p.client_name,
        p.notes,
        p.created_at,
        p.updated_at
      LIMIT 1
    `,
    [organizationId, projectId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapProject(result.rows[0]);
}

async function deleteOrganizationProject(
  actorUserId: string,
  organizationId: string,
  projectId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (role !== "owner" && role !== "admin") {
    throw new Error("Only owners or admins can remove projects.");
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const project = await client.query<{ id: string }>(
      `
        SELECT id
        FROM user_projects
        WHERE organization_id = $1 AND id = $2
        LIMIT 1
        FOR UPDATE
      `,
      [organizationId, projectId],
    );

    if ((project.rowCount ?? 0) === 0) {
      throw new Error("Project not found.");
    }

    const usage = await client.query<{ total_conversions: number | null }>(
      `
        SELECT COUNT(*)::int AS total_conversions
        FROM user_conversions
        WHERE organization_id = $1 AND project_id = $2
      `,
      [organizationId, projectId],
    );

    if (normalizeNumber(usage.rows[0]?.total_conversions) > 0) {
      throw new Error("Only empty projects can be removed.");
    }

    await client.query(
      `
        DELETE FROM user_projects
        WHERE organization_id = $1 AND id = $2
      `,
      [organizationId, projectId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listOrganizationDetectedBanks(
  actorUserId: string,
  organizationId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const result = await pool.query<{ detected_bank: string }>(
    `
      SELECT DISTINCT detected_bank
      FROM user_conversions
      WHERE organization_id = $1
        AND detected_bank IS NOT NULL
        AND detected_bank <> ''
      ORDER BY detected_bank ASC
    `,
    [organizationId],
  );

  return result.rows.map((row) => row.detected_bank);
}

async function getOrganizationConversionStats(
  actorUserId: string,
  organizationId: string,
) {
  await ensureAppTables();
  const role = await getOrganizationRoleForUser(organizationId, actorUserId);

  if (!role) {
    throw new Error("Organization not found.");
  }

  const pool = getDatabasePool();
  const [conversionStats, projectStats] = await Promise.all([
    pool.query<{
      total_conversions: number | null;
      total_files_processed: number | null;
      total_transaction_rows: number | null;
      unassigned_conversions: number | null;
    }>(
      `
        SELECT
          COUNT(*)::int AS total_conversions,
          COUNT(*)::int AS total_files_processed,
          COALESCE(SUM(row_count), 0)::int AS total_transaction_rows,
          COALESCE(SUM(CASE WHEN project_id IS NULL THEN 1 ELSE 0 END), 0)::int AS unassigned_conversions
        FROM user_conversions
        WHERE organization_id = $1
      `,
      [organizationId],
    ),
    pool.query<{ total_projects: number | null }>(
      `
        SELECT COUNT(*)::int AS total_projects
        FROM user_projects
        WHERE organization_id = $1
      `,
      [organizationId],
    ),
  ]);

  return {
    totalConversions: normalizeNumber(conversionStats.rows[0]?.total_conversions),
    totalFilesProcessed: normalizeNumber(
      conversionStats.rows[0]?.total_files_processed,
    ),
    totalProjects: normalizeNumber(projectStats.rows[0]?.total_projects),
    unassignedConversions: normalizeNumber(
      conversionStats.rows[0]?.unassigned_conversions,
    ),
    totalTransactionRows: normalizeNumber(
      conversionStats.rows[0]?.total_transaction_rows,
    ),
  } satisfies DashboardStats;
}

export async function createWorkspaceProject(
  actorUserId: string,
  workspace: WorkspaceScope,
  input: {
    projectName: string;
    clientName?: string | null;
    notes?: string | null;
  },
) {
  if (workspace.type === "organization") {
    return createOrganizationProject({
      actorUserId,
      organizationId: workspace.organizationId,
      projectName: input.projectName,
      clientName: input.clientName,
      notes: input.notes,
    });
  }

  return createProject({
    userId: actorUserId,
    projectName: input.projectName,
    clientName: input.clientName,
    notes: input.notes,
  });
}

export async function listWorkspaceProjects(
  actorUserId: string,
  workspace: WorkspaceScope,
  limit = 12,
) {
  if (workspace.type === "organization") {
    return listOrganizationProjects(actorUserId, workspace.organizationId, limit);
  }

  return listUserProjects(actorUserId, limit);
}

export async function getWorkspaceProjectById(
  actorUserId: string,
  workspace: WorkspaceScope,
  projectId: string,
) {
  if (workspace.type === "organization") {
    return getOrganizationProjectById(actorUserId, workspace.organizationId, projectId);
  }

  return getUserProjectById(actorUserId, projectId);
}

export async function deleteWorkspaceProject(
  actorUserId: string,
  workspace: WorkspaceScope,
  projectId: string,
) {
  if (workspace.type === "organization") {
    return deleteOrganizationProject(
      actorUserId,
      workspace.organizationId,
      projectId,
    );
  }

  return deleteUserProject(actorUserId, projectId);
}

export async function listWorkspaceConversions(
  actorUserId: string,
  workspace: WorkspaceScope,
  filtersOrLimit: number | ConversionListFilters = {},
) {
  if (workspace.type === "organization") {
    return listOrganizationConversions(
      actorUserId,
      workspace.organizationId,
      filtersOrLimit,
    );
  }

  return listUserConversions(actorUserId, filtersOrLimit);
}

export async function listWorkspaceUnassignedConversions(
  actorUserId: string,
  workspace: WorkspaceScope,
  limit = 10,
) {
  return listWorkspaceConversions(actorUserId, workspace, {
    limit,
    unassignedOnly: true,
  });
}

export async function getWorkspaceConversionById(
  actorUserId: string,
  workspace: WorkspaceScope,
  conversionId: string,
) {
  if (workspace.type === "organization") {
    return getOrganizationConversionById(
      actorUserId,
      workspace.organizationId,
      conversionId,
    );
  }

  return getUserConversionById(actorUserId, conversionId);
}

export async function assignWorkspaceConversionToProject(
  actorUserId: string,
  workspace: WorkspaceScope,
  conversionId: string,
  requestedProjectId: string | null,
) {
  if (workspace.type === "organization") {
    return assignOrganizationConversionToProject(
      actorUserId,
      workspace.organizationId,
      conversionId,
      requestedProjectId,
    );
  }

  return assignConversionToProject(actorUserId, conversionId, requestedProjectId);
}

export async function deleteWorkspaceConversion(
  actorUserId: string,
  workspace: WorkspaceScope,
  conversionId: string,
) {
  if (workspace.type === "organization") {
    return deleteOrganizationConversion(
      actorUserId,
      workspace.organizationId,
      conversionId,
    );
  }

  return deleteUserConversion(actorUserId, conversionId);
}

export async function getWorkspaceConversionStats(
  actorUserId: string,
  workspace: WorkspaceScope,
) {
  if (workspace.type === "organization") {
    return getOrganizationConversionStats(actorUserId, workspace.organizationId);
  }

  return getUserConversionStats(actorUserId);
}

export async function listWorkspaceDetectedBanks(
  actorUserId: string,
  workspace: WorkspaceScope,
) {
  if (workspace.type === "organization") {
    return listOrganizationDetectedBanks(actorUserId, workspace.organizationId);
  }

  return listUserDetectedBanks(actorUserId);
}

export async function saveWorkspaceConversion(
  actorUserId: string,
  workspace: WorkspaceScope,
  preview: StatementPreview,
  requestedProjectId?: string | null,
  options?: {
    bypassUsageLimits?: boolean;
  },
) {
  if (workspace.type === "organization") {
    return saveOrganizationConversion(
      actorUserId,
      workspace.organizationId,
      preview,
      requestedProjectId,
      options,
    );
  }

  return saveUserConversion(actorUserId, preview, requestedProjectId, options);
}

export async function listWorkspaceProjectConversions(
  actorUserId: string,
  workspace: WorkspaceScope,
  projectId: string,
  limit = 50,
) {
  return listWorkspaceConversions(actorUserId, workspace, {
    limit,
    projectId,
  });
}
