import Link from "next/link";
import type { ReactNode } from "react";

import { PaymentRequestPanel } from "@/components/payment-request-panel";
import type {
  PaymentRequest,
  StoredConversion,
  UserPlanSummary,
  WorkspaceProject,
} from "@/lib/app-data";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

export function formatCount(count: number, singular: string, plural: string) {
  return `${formatCompactNumber(count)} ${count === 1 ? singular : plural}`;
}

export function formatMoneyMinor(
  amountMinor: number,
  currency = "ZAR",
) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function formatStatementsRemaining(remaining: number) {
  return `${formatCompactNumber(remaining)} ${
    remaining === 1 ? "statement" : "statements"
  } left`;
}

export function formatCreditValue(totalCredits: number, creditsUsed: number) {
  return `${formatCompactNumber(Math.max(totalCredits - creditsUsed, 0))} remaining`;
}

export function formatWindow(start: string | null, end: string | null) {
  if (!start || !end) {
    return "Not detected";
  }

  return `${start} → ${end}`;
}

export function formatClientAllowance(
  totalProjects: number,
  projectLimit: number | null,
) {
  if (projectLimit === null) {
    return {
      value: "Unlimited",
      note: "No cap",
    };
  }

  const remaining = Math.max(projectLimit - totalProjects, 0);

  return {
    value: `${formatCompactNumber(totalProjects)} / ${formatCompactNumber(projectLimit)}`,
    note: `${formatCompactNumber(remaining)} left`,
  };
}

export function ToolbarPill({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full border border-black/8 bg-white/78 px-4 py-2 text-sm text-[var(--foreground)]">
      {children}
    </span>
  );
}

export function DashboardMetricCard({
  label,
  note,
  value,
}: {
  label: string;
  note?: string;
  value: string;
}) {
  return (
    <article className="rounded-[1.6rem] border border-black/8 bg-white/72 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-sm text-[var(--muted)]">{note}</p>
      ) : null}
    </article>
  );
}

export function SectionTitle({
  action,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function DocumentListItem({
  conversion,
}: {
  conversion: StoredConversion;
}) {
  return (
    <Link
      href={`/dashboard/convert?conversion=${conversion.id}`}
      className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 hover:border-[var(--accent)]/20"
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-[var(--foreground)]">
          {conversion.fileName}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {conversion.detectedBank ?? "Unknown bank"}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-xs text-[var(--foreground)]">
          {formatCompactNumber(conversion.rowCount)} rows
        </p>
        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
          {formatDate(conversion.createdAt)}
        </p>
      </div>
    </Link>
  );
}

export function ProjectListItem({
  project,
}: {
  project: WorkspaceProject;
}) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 px-4 py-4 hover:border-[var(--accent)]/20"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">
          {project.projectName}
        </p>
        <p className="mt-1 truncate text-sm text-[var(--muted)]">
          {project.clientName ?? "No client"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-xs text-[var(--foreground)]">
          {formatCompactNumber(project.stats.conversionCount)} files
        </p>
        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
          {formatCompactNumber(project.stats.totalRowCount)} rows
        </p>
      </div>
    </Link>
  );
}

export function WorkspaceSidebarCard({
  memberCount,
  planSummary,
  totalProjects,
  workspaceType,
}: {
  memberCount: number;
  planSummary: UserPlanSummary;
  totalProjects: number;
  workspaceType: "organization" | "personal";
}) {
  const clientAllowance = formatClientAllowance(
    totalProjects,
    planSummary.projectLimit,
  );

  return (
    <div className="rounded-[1.9rem] bg-[linear-gradient(145deg,#1b7a66,#0f5145)] p-5 text-white shadow-[0_22px_48px_rgba(21,104,87,0.24)]">
      <p className="text-xs uppercase tracking-[0.16em] text-white/70">
        Plan
      </p>
      <p className="mt-3 text-xl font-semibold tracking-tight">
        {planSummary.planName}
      </p>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">Statements</span>
          <span>{formatStatementsRemaining(planSummary.usage.conversionsRemaining)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">Credits</span>
          <span>
            {formatCreditValue(
              planSummary.credits.totalCredits,
              planSummary.credits.creditsUsed,
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">
            {workspaceType === "organization" ? "Team" : "Clients"}
          </span>
          <span>
            {workspaceType === "organization"
              ? formatCount(memberCount, "member", "members")
              : clientAllowance.note}
          </span>
        </div>
      </div>
      <Link
        href="/dashboard/billing"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/18 bg-white/10 px-4 text-sm font-medium"
      >
        Manage billing
      </Link>
    </div>
  );
}

export function AdminSidebarCard({
  approved,
  pending,
  revenueMinor,
  users,
}: {
  approved: number;
  pending: number;
  revenueMinor: number;
  users: number;
}) {
  return (
    <div className="rounded-[1.9rem] bg-[linear-gradient(145deg,#1b7a66,#0f5145)] p-5 text-white shadow-[0_22px_48px_rgba(21,104,87,0.24)]">
      <p className="text-xs uppercase tracking-[0.16em] text-white/70">
        Platform
      </p>
      <p className="mt-3 text-xl font-semibold tracking-tight">
        Admin
      </p>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">Users</span>
          <span>{formatCompactNumber(users)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">Pending</span>
          <span>{formatCompactNumber(pending)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">Approved</span>
          <span>{formatCompactNumber(approved)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/70">Month</span>
          <span>{formatMoneyMinor(revenueMinor)}</span>
        </div>
      </div>
      <Link
        href="/dashboard/admin/payments"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/18 bg-white/10 px-4 text-sm font-medium"
      >
        Review payments
      </Link>
    </div>
  );
}

export function PendingPaymentCard({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest | null;
}) {
  if (paymentRequest) {
    return (
      <PaymentRequestPanel
        actionLabel="Open"
        href={`/payments/${paymentRequest.id}`}
        paymentRequest={paymentRequest}
      />
    );
  }

  return (
    <section className="panel rounded-[2rem] p-6">
      <SectionTitle
        action={
          <Link
            href="/dashboard/billing"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
          >
            Billing
          </Link>
        }
        eyebrow="Payments"
        title="No pending item"
      />
    </section>
  );
}
