import Link from "next/link";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  getAdminOverview,
  getUserActivitySummary,
  listAdminNotifications,
  listAdminUsers,
  listPendingOrganizationInvitesForUser,
  getWorkspaceConversionStats,
  getWorkspacePendingPaymentRequest,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  listPaymentRequestsForAdmin,
  listWorkspaceConversions,
  listWorkspaceProjects,
  type SessionUser,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";
import { supportsTeamWorkspace } from "@/lib/plans";

import {
  AdminSidebarCard,
  DashboardMetricCard,
  DocumentListItem,
  PendingPaymentCard,
  ProjectListItem,
  SectionTitle,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatCompactNumber,
  formatDateTime,
  formatMoneyMinor,
} from "./_shared";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireCurrentUser({ redirectTo: "/dashboard" });

  if (isAdminEmail(user.email)) {
    return <AdminDashboard user={user} />;
  }

  return <ClientDashboard user={user} />;
}

async function ClientDashboard({
  user,
}: {
  user: SessionUser;
}) {
  const workspace = getWorkspaceScope(user);
  const activeOrganizationId =
    user.activeWorkspace.type === "organization"
      ? user.activeWorkspace.organizationId
      : null;
  const activeOrganization = activeOrganizationId
    ? user.organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) ?? null
    : null;
  const [stats, planSummary, projects, conversions, pendingPayment] =
    await Promise.all([
      getWorkspaceConversionStats(user.id, workspace),
      getWorkspacePlanSummary(workspace),
      listWorkspaceProjects(user.id, workspace, 6),
      listWorkspaceConversions(user.id, workspace, { limit: 6 }),
      getWorkspacePendingPaymentRequest(user.id, workspace),
    ]);
  const pendingInvites =
    workspace.type === "personal"
      ? await listPendingOrganizationInvitesForUser({
          id: user.id,
          email: user.email,
        })
      : [];
  const showTeamSetup =
    workspace.type === "personal" && supportsTeamWorkspace(planSummary.planId);
  const clientAlerts = [
    ...(pendingPayment
      ? [
          {
            title: "Payment pending",
            body: pendingPayment.displayName,
            href: `/payments/${pendingPayment.id}`,
          },
        ]
      : []),
    ...(planSummary.usage.limitReached || planSummary.usage.nearLimit
      ? [
          {
            title: planSummary.usage.limitReached
              ? "Usage limit reached"
              : "Usage getting close",
            body:
              planSummary.usage.limitMessage ??
              planSummary.usage.warningMessage ??
              "Open billing to review usage.",
            href: "/dashboard/billing",
          },
        ]
      : []),
    ...(pendingInvites.length > 0
      ? [
          {
            title: "Organization invites",
            body: `${formatCompactNumber(pendingInvites.length)} pending`,
            href: "/dashboard/setup",
          },
        ]
      : []),
  ];

  return (
    <PlatformShell
      currentView="dashboard"
      eyebrow="Workspace"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard"
      sidebarFooter={
        <WorkspaceSidebarCard
          memberCount={activeOrganization?.membersCount ?? 1}
          planSummary={planSummary}
          totalProjects={stats.totalProjects}
          workspaceType={workspace.type}
        />
      }
      title="Dashboard"
      toolbarMeta={
        <>
          <ToolbarPill>{user.activeWorkspace.name}</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(stats.totalFilesProcessed)} files</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(stats.totalProjects)} projects</ToolbarPill>
        </>
      }
      user={user}
    >
      <section className="grid gap-4 xl:grid-cols-4">
        <DashboardMetricCard
          label="Saved files"
          note="Workspace total"
          value={formatCompactNumber(stats.totalFilesProcessed)}
        />
        <DashboardMetricCard
          label="Projects"
          note="Client workspaces"
          value={formatCompactNumber(stats.totalProjects)}
        />
        <DashboardMetricCard
          label="Unassigned"
          note="Needs project"
          value={formatCompactNumber(stats.unassignedConversions)}
        />
        <DashboardMetricCard
          label="Rows"
          note="Parsed transactions"
          value={formatCompactNumber(stats.totalTransactionRows)}
        />
      </section>

      {clientAlerts.length > 0 || showTeamSetup ? (
        <section
          className={`grid gap-4 ${showTeamSetup ? "xl:grid-cols-[1fr_0.9fr]" : ""}`}
        >
          <section className="panel rounded-[2rem] p-6">
            <SectionTitle eyebrow="Notifications" title="Workspace updates" />

            <div className="mt-6 space-y-3">
              {clientAlerts.length > 0 ? (
                clientAlerts.map((alert) => (
                  <Link
                    key={`${alert.href}-${alert.title}`}
                    href={alert.href}
                    className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 px-4 py-4 hover:border-[var(--accent)]/20"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {alert.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {alert.body}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[var(--foreground)]">
                      Open
                    </span>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                  No new updates.
                </div>
              )}
            </div>
          </section>

          {showTeamSetup ? (
            <section className="panel rounded-[2rem] p-6">
              <SectionTitle
                action={
                  <Link
                    href="/dashboard/setup"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
                  >
                    Open setup
                  </Link>
                }
                eyebrow="Business"
                title="Team setup"
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Save workspace", "Create organization", "Invite teammates"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="rounded-[1.4rem] border border-black/8 bg-white/72 px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        Step {index + 1}
                      </p>
                      <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                        {step}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <Link
                href="/dashboard/convert"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Open convert
              </Link>
            }
            eyebrow="Documents"
            title="Recent files"
          />

          <div className="mt-6 space-y-3">
            {conversions.length > 0 ? (
              conversions.map((conversion) => (
                <DocumentListItem key={conversion.id} conversion={conversion} />
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No files yet.
              </div>
            )}
          </div>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <Link
                href="/dashboard/projects"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Open projects
              </Link>
            }
            eyebrow="Projects"
            title="Client workspaces"
          />

          <div className="mt-6 space-y-3">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectListItem key={project.id} project={project} />
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No projects yet.
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <Link
                href="/dashboard/billing"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Open billing
              </Link>
            }
            eyebrow="Billing"
            title={planSummary.planName}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DashboardMetricCard
              label="Price"
              value={`${planSummary.price}${planSummary.interval}`}
            />
            <DashboardMetricCard
              label="Statements"
              value={`${formatCompactNumber(planSummary.usage.conversionsUsed)} / ${formatCompactNumber(planSummary.usage.conversionLimit)}`}
            />
            <DashboardMetricCard
              label="Pages"
              value={`${formatCompactNumber(planSummary.usage.pagesProcessed)} / ${formatCompactNumber(planSummary.usage.pageLimit)}`}
            />
            <DashboardMetricCard
              label="Credits"
              value={formatCompactNumber(planSummary.credits.creditsRemaining)}
            />
          </div>
        </section>

        <PendingPaymentCard paymentRequest={pendingPayment} />
      </section>
    </PlatformShell>
  );
}

async function AdminDashboard({
  user,
}: {
  user: SessionUser;
}) {
  const [overview, selfActivity, paymentQueue, notifications, users] = await Promise.all([
    getAdminOverview(),
    getUserActivitySummary(user.id),
    listPaymentRequestsForAdmin({
      status: "pending",
      limit: 6,
    }),
    listAdminNotifications(6),
    listAdminUsers(6),
  ]);

  return (
    <PlatformShell
      currentView="dashboard"
      eyebrow="Admin"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard"
      showAdmin
      sidebarFooter={
        <AdminSidebarCard
          approved={overview.approvedPaymentRequests}
          pending={overview.pendingPaymentRequests}
          revenueMinor={overview.approvedRevenueThisMonthMinor}
          users={overview.totalUsers}
        />
      }
      title="Admin dashboard"
      toolbarMeta={
        <>
          <ToolbarPill>{formatMoneyMinor(overview.approvedRevenueTodayMinor)}</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(overview.statementsProcessedToday)} today</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(overview.newUsersToday)} new users</ToolbarPill>
        </>
      }
      user={user}
    >
      <section className="grid gap-4 xl:grid-cols-4">
        <DashboardMetricCard
          label="Clients"
          note="Total accounts"
          value={formatCompactNumber(overview.totalUsers)}
        />
        <DashboardMetricCard
          label="New clients"
          note="Created today"
          value={formatCompactNumber(overview.newUsersToday)}
        />
        <DashboardMetricCard
          label="Statements"
          note="Converted today"
          value={formatCompactNumber(overview.statementsProcessedToday)}
        />
        <DashboardMetricCard
          label="Revenue"
          note="Approved today"
          value={formatMoneyMinor(overview.approvedRevenueTodayMinor)}
        />
      </section>

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Your account" title="Usage" />

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <DashboardMetricCard
            label="Statements"
            value={formatCompactNumber(selfActivity.totalConversions)}
          />
          <DashboardMetricCard
            label="Rows"
            value={formatCompactNumber(selfActivity.totalTransactionRows)}
          />
          <DashboardMetricCard
            label="Credits"
            value={formatCompactNumber(selfActivity.creditsRemaining)}
          />
        </div>
      </section>

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Overview" title="Monthly overview" />

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          <DashboardMetricCard
            label="New clients"
            value={formatCompactNumber(overview.newUsersThisMonth)}
          />
          <DashboardMetricCard
            label="Statements"
            value={formatCompactNumber(overview.statementsProcessedThisMonth)}
          />
          <DashboardMetricCard
            label="Revenue"
            value={formatMoneyMinor(overview.approvedRevenueThisMonthMinor)}
          />
          <DashboardMetricCard
            label="Organizations"
            value={formatCompactNumber(overview.totalOrganizations)}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <Link
                href="/dashboard/admin/users"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Open users
              </Link>
            }
            eyebrow="Notifications"
            title="Recent activity"
          />

          <div className="mt-6 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 px-4 py-4 hover:border-[var(--accent)]/20"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {notification.body}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-[var(--muted)]">
                    {formatDateTime(notification.occurredAt)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No recent activity.
              </div>
            )}
          </div>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <Link
                href="/dashboard/admin/users"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Open directory
              </Link>
            }
            eyebrow="Users"
            title="Recent signups"
          />

          <div className="mt-6 space-y-3">
            {users.length > 0 ? (
              users.map((entry) => (
                <Link
                  key={entry.id}
                  href="/dashboard/admin/users"
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 px-4 py-4 hover:border-[var(--accent)]/20"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {entry.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--muted)]">
                      {entry.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-xs text-[var(--foreground)]">
                      {entry.planName}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No users yet.
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <Link
                href="/dashboard/admin/payments"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Open payments
              </Link>
            }
            eyebrow="Payments"
            title="Pending queue"
          />

          <div className="mt-6 space-y-3">
            {paymentQueue.length > 0 ? (
              paymentQueue.map((paymentRequest) => (
                <Link
                  key={paymentRequest.id}
                  href="/dashboard/admin/payments?status=pending"
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white/72 px-4 py-4 hover:border-[var(--accent)]/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {paymentRequest.requesterName}
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--muted)]">
                      {paymentRequest.workspaceName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
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

        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Platform" title="Plan mix" />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DashboardMetricCard
              label="Free"
              value={formatCompactNumber(overview.usersByPlan.free)}
            />
            <DashboardMetricCard
              label="Pro"
              value={formatCompactNumber(overview.usersByPlan.pro)}
            />
            <DashboardMetricCard
              label="Business"
              value={formatCompactNumber(overview.usersByPlan.business)}
            />
            <DashboardMetricCard
              label="Enterprise"
              value={formatCompactNumber(overview.usersByPlan.enterprise)}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DashboardMetricCard
              label="Pending reviews"
              value={formatCompactNumber(overview.pendingPaymentRequests)}
            />
            <DashboardMetricCard
              label="Saved files"
              value={formatCompactNumber(overview.totalSavedConversions)}
            />
          </div>
        </section>
      </section>
    </PlatformShell>
  );
}
