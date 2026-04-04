import Link from "next/link";

import { PlatformShell } from "@/components/platform-shell";
import { requireAdminUser } from "@/lib/admin";
import {
  getAdminOverview,
  listPaymentRequestsForAdmin,
  type PaymentRequest,
} from "@/lib/app-data";

import {
  AdminSidebarCard,
  DashboardMetricCard,
  SectionTitle,
  ToolbarPill,
  formatCompactNumber,
} from "../../_shared";

export const metadata = {
  title: "Payments",
};

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

function formatStatus(status: PaymentRequest["status"]) {
  switch (status) {
    case "awaiting_payment":
      return "Awaiting payment";
    case "proof_submitted":
      return "Proof submitted";
    case "under_review":
      return "Under review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

function isActionable(status: PaymentRequest["status"]) {
  return status === "proof_submitted" || status === "under_review";
}

export default async function DashboardAdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdminUser();
  const params = await searchParams;
  const status = readValue(params.status, "pending");
  const saved = readValue(params.saved);
  const error = readValue(params.error);
  const safeStatus =
    status === "pending" ||
    status === "awaiting_payment" ||
    status === "proof_submitted" ||
    status === "under_review" ||
    status === "approved" ||
    status === "rejected" ||
    status === "expired"
      ? status
      : "pending";
  const [overview, requests] = await Promise.all([
    getAdminOverview(),
    listPaymentRequestsForAdmin({
      status: safeStatus,
      limit: 100,
    }),
  ]);
  const returnTo = `/dashboard/admin/payments?status=${encodeURIComponent(safeStatus)}`;

  return (
    <PlatformShell
      currentView="admin"
      eyebrow="Admin"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo={returnTo}
      sidebarFooter={
        <AdminSidebarCard
          approved={overview.approvedPaymentRequests}
          pending={overview.pendingPaymentRequests}
          revenueMinor={overview.approvedRevenueThisMonthMinor}
          users={overview.totalUsers}
        />
      }
      showAdmin
      title="Payments"
      toolbarMeta={
        <>
          <ToolbarPill>{formatCompactNumber(overview.totalUsers)} users</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(overview.pendingPaymentRequests)} pending</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(overview.totalSavedConversions)} saved</ToolbarPill>
        </>
      }
      user={user}
    >
      {saved ? (
        <p className="rounded-[1.7rem] border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
          Status updated.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[1.7rem] border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-4">
        <DashboardMetricCard
          label="Users"
          value={formatCompactNumber(overview.totalUsers)}
        />
        <DashboardMetricCard
          label="Organizations"
          value={formatCompactNumber(overview.totalOrganizations)}
        />
        <DashboardMetricCard
          label="Pending"
          value={formatCompactNumber(overview.pendingPaymentRequests)}
        />
        <DashboardMetricCard
          label="This month"
          value={formatCompactNumber(overview.statementsProcessedThisMonth)}
        />
      </section>

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Review" title="Payment requests" />

        <form className="mt-6 flex items-center gap-3" method="get">
          <select
            className="min-h-12 rounded-full border border-[var(--line)] bg-white/70 px-4 text-sm text-[var(--foreground)] outline-none"
            defaultValue={status}
            name="status"
          >
            <option value="pending">Pending</option>
            <option value="awaiting_payment">Awaiting payment</option>
            <option value="proof_submitted">Proof submitted</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
            type="submit"
          >
            Filter
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white/72">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,255,255,0.82)] text-[var(--muted)]">
              <tr>
                {[
                  "Requester",
                  "Workspace",
                  "Item",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((paymentRequest) => (
                  <tr key={paymentRequest.id} className="border-t border-black/6">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {paymentRequest.requesterName}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {paymentRequest.requesterEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {paymentRequest.workspaceName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {paymentRequest.displayName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {paymentRequest.amountDisplay}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {formatStatus(paymentRequest.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {paymentRequest.hasProof ? (
                          <Link
                            href={`/api/admin/payments/${paymentRequest.id}/proof`}
                            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-4 text-xs font-medium text-[var(--foreground)]"
                          >
                            Proof
                          </Link>
                        ) : null}
                        {isActionable(paymentRequest.status) ? (
                          <>
                            <form
                              action={`/api/admin/payments/${paymentRequest.id}/status`}
                              method="post"
                            >
                              <input name="decision" type="hidden" value="approved" />
                              <input name="returnTo" type="hidden" value={returnTo} />
                              <button
                                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-4 text-xs font-medium text-[var(--foreground)]"
                                type="submit"
                              >
                                Approve
                              </button>
                            </form>
                            <form
                              action={`/api/admin/payments/${paymentRequest.id}/status`}
                              method="post"
                            >
                              <input name="decision" type="hidden" value="rejected" />
                              <input name="returnTo" type="hidden" value={returnTo} />
                              <button
                                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-4 text-xs font-medium text-[var(--foreground)]"
                                type="submit"
                              >
                                Reject
                              </button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-black/6">
                  <td
                    className="px-4 py-3 text-sm text-[var(--muted)]"
                    colSpan={6}
                  >
                    No payment requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PlatformShell>
  );
}
