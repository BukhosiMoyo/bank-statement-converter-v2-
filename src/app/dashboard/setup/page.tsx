import Link from "next/link";
import { redirect } from "next/navigation";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  canManageOrganization,
  canRenameOrganization,
  getOrganizationMembers,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  listOrganizationInvitations,
  listPendingOrganizationInvitesForUser,
  listWorkspaceProjects,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";
import { CURRENCY_OPTIONS } from "@/lib/currencies";
import { supportsTeamWorkspace } from "@/lib/plans";

import {
  DashboardMetricCard,
  SectionTitle,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatCompactNumber,
} from "../_shared";

export const metadata = {
  title: "Setup",
};

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function DashboardSetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/setup" });

  if (isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const saved = readValue(params.saved);
  const error = readValue(params.error);
  const workspace = getWorkspaceScope(user);
  const planSummary = await getWorkspacePlanSummary(workspace);
  const projects = await listWorkspaceProjects(user.id, workspace, 100);
  const teamPlanEnabled = supportsTeamWorkspace(planSummary.planId);
  const canManageTeam = canManageOrganization(workspace);
  const canRenameTeam = canRenameOrganization(workspace);
  const organizationMembers =
    workspace.type === "organization"
      ? await getOrganizationMembers(user.id, workspace.organizationId)
      : [];
  const organizationInvitations =
    workspace.type === "organization"
      ? await listOrganizationInvitations(user.id, workspace.organizationId)
      : [];
  const pendingInvites =
    workspace.type === "personal"
      ? await listPendingOrganizationInvitesForUser({
          id: user.id,
          email: user.email,
        })
      : [];

  return (
    <PlatformShell
      currentView="dashboard"
      eyebrow="Setup"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard/setup"
      sidebarFooter={
        <WorkspaceSidebarCard
          memberCount={workspace.type === "organization" ? organizationMembers.length : 1}
          planSummary={planSummary}
          totalProjects={projects.length}
          workspaceType={workspace.type}
        />
      }
      title="Team setup"
      toolbarMeta={
        <>
          <ToolbarPill>{planSummary.planName}</ToolbarPill>
          <ToolbarPill>
            {workspace.type === "organization" ? "Team workspace" : "Personal workspace"}
          </ToolbarPill>
        </>
      }
      user={user}
    >
      {saved ? (
        <p className="rounded-[1.7rem] border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
          Setup updated.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[1.7rem] border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardMetricCard label="Plan" value={planSummary.planName} />
        <DashboardMetricCard
          label="Projects"
          value={formatCompactNumber(projects.length)}
        />
        <DashboardMetricCard
          label="Members"
          value={formatCompactNumber(
            workspace.type === "organization" ? organizationMembers.length : 1,
          )}
        />
      </section>

      {!teamPlanEnabled ? (
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Upgrade" title="Business workspace" />
          <div className="mt-6 rounded-[1.6rem] border border-black/8 bg-white/72 px-4 py-4 text-sm text-[var(--muted)]">
            Team setup opens on Business and Enterprise plans.
          </div>
          <Link
            href="/dashboard/billing"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
          >
            Open billing
          </Link>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        {workspace.type === "personal" ? (
          <section className="panel rounded-[2rem] p-6">
            <SectionTitle eyebrow="Step 01" title="Workspace details" />

            <form action="/api/settings" className="mt-6 grid gap-4" method="post">
              <input name="returnTo" type="hidden" value="/dashboard/setup" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Workspace</span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  defaultValue={user.settings.workspaceName}
                  name="workspaceName"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Currency</span>
                <select
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  defaultValue={user.settings.preferredCurrency}
                  name="preferredCurrency"
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Export name</span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  defaultValue={user.settings.exportName}
                  name="exportName"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Default project</span>
                <select
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  defaultValue={user.settings.defaultProjectId ?? ""}
                  name="defaultProjectId"
                >
                  <option value="">Leave unassigned</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                type="submit"
              >
                Save workspace
              </button>
            </form>
          </section>
        ) : (
          <section className="panel rounded-[2rem] p-6">
            <SectionTitle eyebrow="Step 01" title="Organization" />

            <form
              action="/api/organizations/current"
              className="mt-6 grid gap-4"
              method="post"
            >
              <input name="returnTo" type="hidden" value="/dashboard/setup" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Organization</span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)] disabled:opacity-70"
                  defaultValue={user.activeWorkspace.name}
                  disabled={!canRenameTeam}
                  name="name"
                  type="text"
                />
              </label>
              {canRenameTeam ? (
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                  type="submit"
                >
                  Save organization
                </button>
              ) : null}
            </form>
          </section>
        )}

        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Step 02" title="Team workspace" />

          {workspace.type === "personal" ? (
            <form action="/api/organizations" className="mt-6 grid gap-4" method="post">
              <input name="returnTo" type="hidden" value="/dashboard/setup" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Organization</span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  name="name"
                  type="text"
                />
              </label>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                disabled={!teamPlanEnabled}
                type="submit"
              >
                Create organization
              </button>
            </form>
          ) : canManageTeam ? (
            <form
              action="/api/organizations/invitations"
              className="mt-6 grid gap-4"
              method="post"
            >
              <input name="returnTo" type="hidden" value="/dashboard/setup" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Invite email</span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  name="email"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Role</span>
                <select
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  defaultValue="member"
                  name="role"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                type="submit"
              >
                Send invite
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
              Team invitations are managed by workspace owners and admins.
            </div>
          )}
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Step 03" title="Members" />

          <div className="mt-6 space-y-3">
            {workspace.type === "organization" ? (
              organizationMembers.length > 0 ? (
                organizationMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {member.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {member.email}
                      </p>
                    </div>
                    <p className="font-mono text-xs uppercase text-[var(--foreground)]">
                      {member.role}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                  No members yet.
                </div>
              )
            ) : pendingInvites.length > 0 ? (
              pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {invite.organizationName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {invite.role}
                    </p>
                  </div>
                  <form action={`/api/invitations/${invite.id}/accept`} method="post">
                    <input name="returnTo" type="hidden" value="/dashboard/setup" />
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
                      type="submit"
                    >
                      Accept
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No invites yet.
              </div>
            )}
          </div>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Step 04" title="Invites" />

          <div className="mt-6 space-y-3">
            {workspace.type === "organization" ? (
              organizationInvitations.length > 0 ? (
                organizationInvitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {invite.email}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {invite.role}
                      </p>
                    </div>
                    <p className="font-mono text-xs uppercase text-[var(--foreground)]">
                      {invite.status}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                  No invites sent yet.
                </div>
              )
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                Create the organization first to start inviting teammates.
              </div>
            )}
          </div>
        </section>
      </section>
    </PlatformShell>
  );
}
