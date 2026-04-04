import Link from "next/link";

import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  canManageOrganization,
  canRenameOrganization,
  getAdminOverview,
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
  AdminSidebarCard,
  SectionTitle,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatDate,
} from "../_shared";

export const metadata = {
  title: "Settings",
};

function readValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  return typeof value === "string" ? value : fallback;
}

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/settings" });
  const params = await searchParams;
  const saved = readValue(params.saved);
  const error = readValue(params.error);
  const workspace = getWorkspaceScope(user);
  const showAdmin = isAdminEmail(user.email);
  const canManageTeam = canManageOrganization(workspace);
  const canRenameTeam = canRenameOrganization(workspace);
  const activeOrganizationId =
    user.activeWorkspace.type === "organization"
      ? user.activeWorkspace.organizationId
      : null;
  const activeOrganization = activeOrganizationId
    ? user.organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) ?? null
    : null;

  const [
    planSummary,
    projects,
    organizationMembers,
    organizationInvitations,
    pendingInvites,
    adminOverview,
  ] = await Promise.all([
    getWorkspacePlanSummary(workspace),
    listWorkspaceProjects(user.id, workspace, 100),
    workspace.type === "organization"
      ? getOrganizationMembers(user.id, workspace.organizationId)
      : Promise.resolve([]),
    workspace.type === "organization"
      ? listOrganizationInvitations(user.id, workspace.organizationId)
      : Promise.resolve([]),
    workspace.type === "personal"
      ? listPendingOrganizationInvitesForUser({
          id: user.id,
          email: user.email,
        })
      : Promise.resolve([]),
    showAdmin ? getAdminOverview() : Promise.resolve(null),
  ]);

  const teamWorkspaceEnabled =
    workspace.type === "organization" &&
    supportsTeamWorkspace(planSummary.planId);

  return (
    <PlatformShell
      currentView="settings"
      eyebrow="Settings"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo="/dashboard/settings"
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
      title="Settings"
      toolbarMeta={
        <>
          <ToolbarPill>{user.activeWorkspace.name}</ToolbarPill>
          <ToolbarPill>
            {workspace.type === "organization" ? "Team workspace" : "Personal workspace"}
          </ToolbarPill>
        </>
      }
      user={user}
    >
      {saved ? (
        <p className="rounded-[1.7rem] border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
          Changes updated.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[1.7rem] border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
          {error}
        </p>
      ) : null}

      <section className="panel rounded-[2rem] p-6">
        <SectionTitle eyebrow="Workspace" title="Details" />

        {workspace.type === "personal" ? (
          <form action="/api/settings" className="mt-6" method="post">
            <input name="returnTo" type="hidden" value="/dashboard/settings" />
            <div className="grid gap-4 sm:grid-cols-2">
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
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium">Export name</span>
                <input
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  defaultValue={user.settings.exportName}
                  name="exportName"
                  type="text"
                />
              </label>
              <label className="block sm:col-span-2">
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
            </div>

            <button
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
              type="submit"
            >
              Save changes
            </button>
          </form>
        ) : (
          <form action="/api/organizations/current" className="mt-6" method="post">
            <input name="returnTo" type="hidden" value="/dashboard/settings" />
            <div className="grid gap-4">
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
            </div>

            {canRenameTeam ? (
              <button
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white"
                type="submit"
              >
                Save changes
              </button>
            ) : null}
          </form>
        )}
      </section>

      {workspace.type === "personal" ? (
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Organizations" title="Workspaces" />

          <form action="/api/organizations" className="mt-6 grid gap-4" method="post">
            <input name="returnTo" type="hidden" value="/dashboard/settings" />
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
              type="submit"
            >
              Create organization
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {user.organizations.length > 0 ? (
              user.organizations.map((organization) => (
                <div
                  key={organization.id}
                  className="flex items-center justify-between rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {organization.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {organization.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-[var(--foreground)]">
                      {organization.membersCount} members
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                      {formatDate(organization.updatedAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No organizations yet.
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {pendingInvites.length > 0
              ? pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {invite.organizationName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {invite.role}
                        </p>
                      </div>
                      <form
                        action={`/api/invitations/${invite.id}/accept`}
                        method="post"
                      >
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/settings"
                        />
                        <button
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-5 text-sm font-medium text-[var(--foreground)]"
                          type="submit"
                        >
                          Accept
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </section>
      ) : (
        <section className="panel rounded-[2rem] p-6">
          <SectionTitle eyebrow="Members" title="Team" />

          <div className="mt-6 space-y-3">
            {organizationMembers.map((member) => (
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

          {canManageTeam && teamWorkspaceEnabled ? (
            <form
              action="/api/organizations/invitations"
              className="mt-6 grid gap-4"
              method="post"
            >
              <input name="returnTo" type="hidden" value="/dashboard/settings" />
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
          ) : null}

          {canManageTeam && !teamWorkspaceEnabled ? (
            <Link
              href="/dashboard/billing"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
            >
              Upgrade to Business
            </Link>
          ) : null}

          <div className="mt-6 space-y-3">
            {organizationInvitations.length > 0 ? (
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
                  <div className="text-right">
                    <p className="font-mono text-xs uppercase text-[var(--foreground)]">
                      {invite.status}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                      {formatDate(invite.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
                No invites yet.
              </div>
            )}
          </div>
        </section>
      )}
    </PlatformShell>
  );
}
