import Link from "next/link";

import { PlatformShell } from "@/components/platform-shell";
import { requireAdminUser } from "@/lib/admin";
import {
  getAdminOverview,
  listAdminOrganizations,
  listAdminUsers,
} from "@/lib/app-data";

import {
  AdminSidebarCard,
  DashboardMetricCard,
  SectionTitle,
  ToolbarPill,
  formatCompactNumber,
  formatDate,
  formatDateTime,
} from "../../_shared";

export const metadata = {
  title: "Users",
};

export default async function DashboardAdminUsersPage() {
  const user = await requireAdminUser();
  const [overview, users, organizations] = await Promise.all([
    getAdminOverview(),
    listAdminUsers(200),
    listAdminOrganizations(100),
  ]);

  return (
    <PlatformShell
      currentView="users"
      eyebrow="Admin"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard/admin/users"
      sidebarFooter={
        <AdminSidebarCard
          approved={overview.approvedPaymentRequests}
          pending={overview.pendingPaymentRequests}
          revenueMinor={overview.approvedRevenueThisMonthMinor}
          users={overview.totalUsers}
        />
      }
      showAdmin
      title="Users"
      toolbarMeta={
        <>
          <ToolbarPill>{formatCompactNumber(users.length)} listed</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(organizations.length)} organizations</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(overview.newUsersToday)} new today</ToolbarPill>
        </>
      }
      user={user}
    >
      <section className="grid gap-4 xl:grid-cols-4">
        <DashboardMetricCard
          label="Users"
          value={formatCompactNumber(overview.totalUsers)}
        />
        <DashboardMetricCard
          label="New today"
          value={formatCompactNumber(overview.newUsersToday)}
        />
        <DashboardMetricCard
          label="Organizations"
          value={formatCompactNumber(overview.totalOrganizations)}
        />
        <DashboardMetricCard
          label="Team plans"
          value={formatCompactNumber(
            overview.usersByPlan.business + overview.usersByPlan.enterprise,
          )}
        />
      </section>

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
          eyebrow="Directory"
          title="All users"
        />

        <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white/72">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,255,255,0.82)] text-[var(--muted)]">
              <tr>
                {["User", "Plan", "Organizations", "Joined"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((entry) => (
                  <tr key={entry.id} className="border-t border-black/6">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {entry.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {entry.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {entry.planName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm text-[var(--foreground)]">
                          {formatCompactNumber(entry.organizationCount)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {entry.organizations.length > 0
                            ? entry.organizations.join(", ")
                            : "No organization"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {formatDateTime(entry.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-5 text-sm text-[var(--muted)]"
                    colSpan={4}
                  >
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Organizations" title="Members by organization" />

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {organizations.length > 0 ? (
            organizations.map((organization) => (
              <article
                key={organization.id}
                className="rounded-[1.7rem] border border-black/8 bg-white/72 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                      {organization.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {organization.ownerName} • {organization.ownerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-[var(--foreground)]">
                      {formatCompactNumber(organization.memberCount)} members
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                      {formatDate(organization.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {organization.members.map((member) => (
                    <div
                      key={`${organization.id}-${member.userId}`}
                      className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-black/8 bg-white/74 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {member.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {member.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs uppercase text-[var(--foreground)]">
                          {member.role}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                          {formatDate(member.joinedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
              No organizations yet.
            </div>
          )}
        </div>
      </section>
    </PlatformShell>
  );
}
