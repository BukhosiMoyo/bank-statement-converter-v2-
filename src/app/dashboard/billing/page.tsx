import Link from "next/link";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import { listCreditBundles } from "@/lib/billing";
import {
  canManageWorkspacePlan,
  getAdminOverview,
  getPaymentsEnabled,
  getWorkspacePendingPaymentRequest,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  listPaymentRequestsForAdmin,
  listWorkspaceProjects,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";
import { listPlanDefinitions } from "@/lib/plans";

import {
  AdminSidebarCard,
  DashboardMetricCard,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatCompactNumber,
  formatDate,
  formatMoneyMinor,
} from "../_shared";

export const metadata = {
  title: "Billing",
};

const ENTERPRISE_CONTACT_HREF =
  "mailto:sales@bankstatementconverter.com?subject=Enterprise%20plan";

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function DashboardBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/billing" });
  const params = await searchParams;
  const saved = readValue(params.saved);
  const error = readValue(params.error);
  const workspace = getWorkspaceScope(user);
  const showAdmin = isAdminEmail(user.email);
  const activeOrganizationId =
    user.activeWorkspace.type === "organization"
      ? user.activeWorkspace.organizationId
      : null;
  const activeOrganization = activeOrganizationId
    ? user.organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) ?? null
    : null;

  const [planSummary, pendingPayment, projects, adminOverview, paymentQueue, paymentsEnabled] = await Promise.all([
    getWorkspacePlanSummary(workspace),
    getWorkspacePendingPaymentRequest(user.id, workspace),
    listWorkspaceProjects(user.id, workspace, 100),
    showAdmin ? getAdminOverview() : Promise.resolve(null),
    showAdmin
      ? listPaymentRequestsForAdmin({
          status: "pending",
          limit: 6,
        })
      : Promise.resolve([]),
    getPaymentsEnabled(),
  ]);
  const plans = listPlanDefinitions();
  const creditBundles = listCreditBundles();
  const canManagePlan = canManageWorkspacePlan(workspace);

  return (
    <PlatformShell
      currentView="billing"
      eyebrow="Billing"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard/billing"
      sidebarFooter={
        showAdmin && adminOverview ? (
          <AdminSidebarCard
            approved={adminOverview.approvedPaymentRequests}
            pending={adminOverview.pendingPaymentRequests}
            revenueMinor={adminOverview.approvedRevenueThisMonthMinor}
            users={adminOverview.totalUsers}
          />
        ) : (
          <WorkspaceSidebarCard
            memberCount={activeOrganization?.membersCount ?? 1}
            planSummary={planSummary}
            totalProjects={projects.length}
            workspaceType={workspace.type}
          />
        )
      }
      showAdmin={showAdmin}
      title="Billing"
      toolbarMeta={
        showAdmin && adminOverview ? (
          <>
            <ToolbarPill>Unlimited access</ToolbarPill>
            <ToolbarPill>{formatMoneyMinor(adminOverview.approvedRevenueTodayMinor)}</ToolbarPill>
            <ToolbarPill>{formatCompactNumber(adminOverview.pendingPaymentRequests)} pending</ToolbarPill>
          </>
        ) : (
          <>
            <ToolbarPill>{user.activeWorkspace.name}</ToolbarPill>
            <ToolbarPill>{planSummary.planName}</ToolbarPill>
            <ToolbarPill>{formatDate(planSummary.usageResetAt)}</ToolbarPill>
          </>
        )
      }
      user={user}
    >
      {saved ? (
        <p className="rounded-[1.7rem] border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
          Plan updated.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[1.7rem] border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
          {error}
        </p>
      ) : null}

      <section className="panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {showAdmin ? "Admin access" : "Current plan"}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {showAdmin ? "Unlimited platform access" : planSummary.planName}
            </h2>
          </div>
          <div className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {showAdmin ? "Scope" : "Price"}
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {showAdmin ? "Platform admin" : `${planSummary.price}${planSummary.interval}`}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            label={showAdmin ? "Today" : "Statements"}
            value={
              showAdmin && adminOverview
                ? formatCompactNumber(adminOverview.statementsProcessedToday)
                : `${formatCompactNumber(planSummary.usage.conversionsUsed)} / ${formatCompactNumber(planSummary.usage.conversionLimit)}`
            }
          />
          <DashboardMetricCard
            label={showAdmin ? "This month" : "Pages"}
            value={
              showAdmin && adminOverview
                ? formatMoneyMinor(adminOverview.approvedRevenueThisMonthMinor)
                : `${formatCompactNumber(planSummary.usage.pagesProcessed)} / ${formatCompactNumber(planSummary.usage.pageLimit)}`
            }
          />
          <DashboardMetricCard
            label={showAdmin ? "Pending" : "Credits"}
            value={
              showAdmin && adminOverview
                ? formatCompactNumber(adminOverview.pendingPaymentRequests)
                : formatCompactNumber(planSummary.credits.creditsRemaining)
            }
          />
          <DashboardMetricCard
            label={showAdmin ? "Organizations" : "Reset"}
            value={
              showAdmin && adminOverview
                ? formatCompactNumber(adminOverview.totalOrganizations)
                : formatDate(planSummary.usageResetAt)
            }
          />
        </div>
      </section>

      {!showAdmin && pendingPayment ? (
        <div>
          <Link
            href={`/payments/${pendingPayment.id}`}
            className="block rounded-[2rem] border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-6 py-5 text-sm text-[var(--foreground)]"
          >
            Pending payment: {pendingPayment.displayName}
          </Link>
        </div>
      ) : null}

      {showAdmin && adminOverview ? (
        <>
          <section className="panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Platform settings
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Payments
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {paymentsEnabled
                    ? "Payments are enabled. Users must pay for plan upgrades and credit purchases."
                    : "Payments are disabled. The platform is free to use with no usage limits."}
                </p>
              </div>
              <form action="/api/admin/settings" method="post">
                <input
                  name="paymentsEnabled"
                  type="hidden"
                  value={paymentsEnabled ? "false" : "true"}
                />
                <input
                  name="returnTo"
                  type="hidden"
                  value="/dashboard/billing"
                />
                <button
                  className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-medium ${
                    paymentsEnabled
                      ? "border-[rgba(140,63,63,0.25)] bg-[rgba(140,63,63,0.06)] text-[#8c3f3f]"
                      : "border-[rgba(22,106,91,0.25)] bg-[rgba(22,106,91,0.07)] text-[var(--accent)]"
                  }`}
                  type="submit"
                >
                  {paymentsEnabled ? "Disable payments" : "Enable payments"}
                </button>
              </form>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Revenue
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Platform billing
                  </h2>
                </div>
                <Link
                  href="/dashboard/admin/payments"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
                >
                  Review payments
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardMetricCard
                  label="Approved today"
                  value={formatMoneyMinor(adminOverview.approvedRevenueTodayMinor)}
                />
                <DashboardMetricCard
                  label="Approved month"
                  value={formatMoneyMinor(adminOverview.approvedRevenueThisMonthMinor)}
                />
                <DashboardMetricCard
                  label="Approved"
                  value={formatCompactNumber(adminOverview.approvedPaymentRequests)}
                />
                <DashboardMetricCard
                  label="Rejected"
                  value={formatCompactNumber(adminOverview.rejectedPaymentRequests)}
                />
              </div>
            </section>

            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Queue
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Pending reviews
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {paymentQueue.length > 0 ? (
                  paymentQueue.map((paymentRequest) => (
                    <Link
                      key={paymentRequest.id}
                      href="/dashboard/admin/payments?status=pending"
                      className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 px-4 py-4 hover:border-[var(--accent)]/20"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {paymentRequest.requesterName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {paymentRequest.workspaceName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-[var(--foreground)]">
                          {paymentRequest.amountDisplay}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                          {paymentRequest.status}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                    No pending payments.
                  </div>
                )}
              </div>
            </section>
          </section>
        </>
      ) : !paymentsEnabled ? (
        <section className="panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Free mode
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                This platform is free to use
              </h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                All features are available at no cost. No plan upgrades or credit purchases are required.
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Process unlimited statements, manage projects, and export to Excel or CSV.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Price
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--accent)]">
                Free
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-4">
            {plans.map((plan) => {
              const isCurrentPlan = planSummary.planId === plan.id;
              const isPendingPlan =
                pendingPayment?.purchaseKind === "plan" &&
                pendingPayment.planId === plan.id;

              return (
                <article key={plan.id} className="panel rounded-[2rem] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
                      {plan.name}
                    </p>
                    {isCurrentPlan ? (
                      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]">
                        Current
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                    {plan.price}
                    {plan.interval ? (
                      <span className="text-base font-medium text-[var(--muted)]">
                        {plan.interval}
                      </span>
                    ) : null}
                  </p>

                  <p className="mt-4 text-sm text-[var(--foreground)]">
                    {plan.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {plan.notes.map((note) => (
                      <div
                        key={note}
                        className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--foreground)]"
                      >
                        {note}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    {plan.contactOnly ? (
                      <Link
                        href={ENTERPRISE_CONTACT_HREF}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
                      >
                        {plan.ctaLabel}
                      </Link>
                    ) : (
                      <form action="/api/plan" method="post">
                        <input name="planId" type="hidden" value={plan.id} />
                        <input name="billingCycle" type="hidden" value="monthly" />
                        <input name="returnTo" type="hidden" value="/dashboard/billing" />
                        <button
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={isCurrentPlan || !canManagePlan}
                          type="submit"
                        >
                          {isCurrentPlan
                            ? "Current plan"
                            : isPendingPlan
                              ? "Continue payment"
                              : canManagePlan
                                ? plan.ctaLabel
                                : "Owner only"}
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Credits
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Top up
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {creditBundles.map((bundle) => {
                const isPendingBundle =
                  pendingPayment?.purchaseKind === "credits" &&
                  pendingPayment.creditBundleId === bundle.id;

                return (
                  <article
                    key={bundle.id}
                    className="rounded-[1.7rem] border border-black/8 bg-white/72 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
                        {bundle.name}
                      </p>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        {formatMoneyMinor(bundle.amountMinor)}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        "Credits do not expire",
                        "Added after approval",
                        "Works across the active workspace",
                      ].map((note) => (
                        <div
                          key={note}
                          className="rounded-[1.35rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--foreground)]"
                        >
                          {note}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <form action="/api/plan" method="post">
                        <input name="creditBundleId" type="hidden" value={bundle.id} />
                        <input name="billingCycle" type="hidden" value="one_time" />
                        <input name="returnTo" type="hidden" value="/dashboard/billing" />
                        <button
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={!canManagePlan}
                          type="submit"
                        >
                          {isPendingBundle
                            ? "Continue payment"
                            : canManagePlan
                              ? bundle.ctaLabel
                              : "Owner only"}
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </PlatformShell>
  );
}
