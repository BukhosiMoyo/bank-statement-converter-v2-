import Link from "next/link";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  getAdminOverview,
  getWorkspaceConversionStats,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  listWorkspaceConversions,
  listWorkspaceProjects,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";

import {
  AdminSidebarCard,
  DocumentListItem,
  ProjectListItem,
  SectionTitle,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatCompactNumber,
} from "../_shared";

export const metadata = {
  title: "Projects",
};

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function DashboardProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/projects" });
  const params = await searchParams;
  const error = readValue(params.error);
  const saved = readValue(params.saved);
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

  const [stats, projects, conversions, planSummary, adminOverview] =
    await Promise.all([
      getWorkspaceConversionStats(user.id, workspace),
      listWorkspaceProjects(user.id, workspace, 100),
      listWorkspaceConversions(user.id, workspace, { limit: 8 }),
      getWorkspacePlanSummary(workspace),
      showAdmin ? getAdminOverview() : Promise.resolve(null),
    ]);

  return (
    <PlatformShell
      currentView="projects"
      eyebrow="Projects"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard/projects"
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
            totalProjects={stats.totalProjects}
            workspaceType={workspace.type}
          />
        )
      }
      showAdmin={showAdmin}
      title="Projects"
      toolbarMeta={
        <>
          <ToolbarPill>{formatCompactNumber(projects.length)} projects</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(stats.totalFilesProcessed)} files</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(stats.unassignedConversions)} unassigned</ToolbarPill>
        </>
      }
      user={user}
    >
      {saved === "project-removed" ? (
        <p className="rounded-[1.7rem] border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
          Project removed.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[1.7rem] border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="New project" title="Add workspace" />

          <form action="/api/projects" className="mt-6 space-y-4" method="post">
            <input name="returnTo" type="hidden" value="/dashboard/projects" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Project name</span>
              <input
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/82 px-4 py-3 outline-none focus:border-[var(--accent)]"
                name="projectName"
                type="text"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Client</span>
              <input
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/82 px-4 py-3 outline-none focus:border-[var(--accent)]"
                name="clientName"
                type="text"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Notes</span>
              <input
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/82 px-4 py-3 outline-none focus:border-[var(--accent)]"
                name="notes"
                type="text"
              />
            </label>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
              type="submit"
            >
              Create project
            </button>
          </form>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <SectionTitle
            action={
              <div className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Total
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                  {formatCompactNumber(projects.length)}
                </p>
              </div>
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
    </PlatformShell>
  );
}
