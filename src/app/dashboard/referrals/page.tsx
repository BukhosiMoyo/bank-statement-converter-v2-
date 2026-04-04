import { headers } from "next/headers";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  getAdminOverview,
  getUserReferralSummary,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  listWorkspaceProjects,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";

import {
  AdminSidebarCard,
  DashboardMetricCard,
  SectionTitle,
  ToolbarPill,
  WorkspaceSidebarCard,
} from "../_shared";

export const metadata = {
  title: "Referrals",
};

async function getAppBaseUrl() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return host ? `${protocol}://${host}` : "";
}

export default async function DashboardReferralsPage() {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/referrals" });
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

  const [planSummary, projects, referralSummary, appBaseUrl, adminOverview] =
    await Promise.all([
      getWorkspacePlanSummary(workspace),
      listWorkspaceProjects(user.id, workspace, 100),
      getUserReferralSummary(user.id),
      getAppBaseUrl(),
      showAdmin ? getAdminOverview() : Promise.resolve(null),
    ]);

  return (
    <PlatformShell
      currentView="referrals"
      eyebrow="Referrals"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard/referrals"
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
      title="Referrals"
      toolbarMeta={
        <>
          <ToolbarPill>{user.activeWorkspace.name}</ToolbarPill>
          <ToolbarPill>{referralSummary.referralCode}</ToolbarPill>
        </>
      }
      user={user}
    >
      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardMetricCard
          label="Code"
          value={referralSummary.referralCode}
        />
        <DashboardMetricCard
          label="Earned"
          value={`${referralSummary.creditsEarned} credits`}
        />
        <DashboardMetricCard
          label="Successful"
          value={String(referralSummary.successfulReferrals)}
        />
      </section>

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Link" title="Share" />

        <div className="mt-6 rounded-[1.6rem] border border-black/8 bg-white/72 px-4 py-4 font-mono text-xs text-[var(--foreground)]">
          {(appBaseUrl ? `${appBaseUrl}/signup?ref=` : "/signup?ref=") +
            referralSummary.referralCode}
        </div>
      </section>
    </PlatformShell>
  );
}
