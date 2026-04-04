import Link from "next/link";
import { notFound } from "next/navigation";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  getAdminOverview,
  getWorkspacePlanSummary,
  getWorkspaceProjectById,
  getWorkspaceScope,
  listWorkspaceProjects,
  listWorkspaceProjectConversions,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";

import {
  AdminSidebarCard,
  SectionTitle,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatCompactNumber,
  formatDate,
  formatWindow,
} from "../../_shared";

export const metadata = {
  title: "Project",
};

export default async function DashboardProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/projects" });
  const { projectId } = await params;
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

  const [project, conversions, planSummary, allProjects, adminOverview] = await Promise.all([
    getWorkspaceProjectById(user.id, workspace, projectId),
    listWorkspaceProjectConversions(user.id, workspace, projectId, 100),
    getWorkspacePlanSummary(workspace),
    listWorkspaceProjects(user.id, workspace, 100),
    showAdmin ? getAdminOverview() : Promise.resolve(null),
  ]);

  if (!project) {
    notFound();
  }

  const canRemoveProject = project.stats.conversionCount === 0;

  return (
    <PlatformShell
      currentView="projects"
      eyebrow="Project"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo={`/dashboard/projects/${project.id}`}
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
            totalProjects={allProjects.length}
            workspaceType={workspace.type}
          />
        )
      }
      showAdmin={showAdmin}
      title={project.projectName}
      toolbarMeta={
        <>
          <ToolbarPill>{formatCompactNumber(project.stats.conversionCount)} files</ToolbarPill>
          <ToolbarPill>{formatCompactNumber(project.stats.totalRowCount)} rows</ToolbarPill>
          <ToolbarPill>{project.clientName ?? "No client"}</ToolbarPill>
        </>
      }
      user={user}
    >
      <section className="panel rounded-[2rem] p-6">
        <SectionTitle
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/projects"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
              >
                Back
              </Link>
              {canRemoveProject ? (
                <form action={`/api/projects/${project.id}/delete`} method="post">
                  <input name="returnTo" type="hidden" value="/dashboard/projects" />
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
                    type="submit"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </div>
          }
          eyebrow="Project"
          title={project.projectName}
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {[
            ["Client", project.clientName ?? "—"],
            ["Conversions", String(project.stats.conversionCount)],
            ["Rows", String(project.stats.totalRowCount)],
            [
              "Coverage",
              formatWindow(
                project.stats.coverageStartDate,
                project.stats.coverageEndDate,
              ),
            ],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                {label}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {value}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Notes
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]">
              {project.notes ?? "—"}
            </p>
          </article>
          <article className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Banks
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]">
              {project.stats.banksDetected.length > 0
                ? project.stats.banksDetected.join(", ")
                : "—"}
            </p>
          </article>
        </div>
      </section>

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Conversions" title="Project files" />

        <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white/72">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,255,255,0.82)] text-[var(--muted)]">
              <tr>
                {["File", "Bank", "Rows", "Uploaded"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conversions.length > 0 ? (
                conversions.map((conversion) => (
                  <tr key={conversion.id} className="border-t border-black/6">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      <Link
                        href={`/dashboard/convert?conversion=${conversion.id}`}
                        className="hover:text-[var(--accent)]"
                      >
                        {conversion.fileName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {conversion.detectedBank ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {conversion.rowCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {formatDate(conversion.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-black/6">
                  <td
                    className="px-4 py-3 text-sm text-[var(--muted)]"
                    colSpan={4}
                  >
                    No conversions in this project yet.
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
