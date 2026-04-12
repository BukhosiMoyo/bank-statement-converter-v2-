import { notFound, redirect } from "next/navigation";

import { ConverterWorkspace } from "@/components/converter-workspace";
import { PlatformShell } from "@/components/platform-shell";
import { isAdminEmail } from "@/lib/admin";
import {
  getAdminOverview,
  getWorkspaceConversionById,
  getWorkspacePlanSummary,
  getWorkspaceScope,
  listWorkspaceProjects,
  type SessionUser,
  type WorkspaceScope,
} from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/auth";

import {
  AdminSidebarCard,
  ToolbarPill,
  WorkspaceSidebarCard,
  formatStatementsRemaining,
} from "../_shared";

export const metadata = {
  title: "Convert",
};

function buildReturnTo(input: {
  conversionId: string | null;
  handoffId: string | null;
}) {
  const params = new URLSearchParams();

  if (input.conversionId) {
    params.set("conversion", input.conversionId);
  }

  if (input.handoffId) {
    params.set("handoff", input.handoffId);
  }

  const serialized = params.toString();
  return serialized ? `/dashboard/convert?${serialized}` : "/dashboard/convert";
}

function buildWorkspaceRedirectPath(workspaceId: string, returnTo: string) {
  const params = new URLSearchParams({
    workspaceId,
    returnTo,
  });

  return `/api/workspace?${params.toString()}`;
}

function isSameWorkspace(left: WorkspaceScope, right: WorkspaceScope) {
  if (left.type !== right.type) {
    return false;
  }

  if (left.type === "organization" && right.type === "organization") {
    return left.organizationId === right.organizationId;
  }

  return left.userId === right.userId;
}

async function findAlternativeWorkspaceIdForConversion(
  user: SessionUser,
  currentWorkspace: WorkspaceScope,
  conversionId: string,
) {
  const personalScope: WorkspaceScope = {
    type: "personal",
    userId: user.id,
  };
  const candidateWorkspaces: Array<{
    scope: WorkspaceScope;
    workspaceId: string;
  }> = [
    {
      scope: personalScope,
      workspaceId: "personal",
    },
    ...user.organizations.map((organization) => ({
      scope: {
        type: "organization" as const,
        organizationId: organization.id,
        role: organization.role,
        userId: user.id,
      } satisfies WorkspaceScope,
      workspaceId: organization.id,
    })),
  ].filter((candidate) => !isSameWorkspace(candidate.scope, currentWorkspace));

  const matches = await Promise.all(
    candidateWorkspaces.map(async (candidate) => ({
      workspaceId: candidate.workspaceId,
      conversion: await getWorkspaceConversionById(
        user.id,
        candidate.scope,
        conversionId,
      ),
    })),
  );

  return matches.find((candidate) => candidate.conversion)?.workspaceId ?? null;
}

export default async function DashboardConvertPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser({ redirectTo: "/dashboard/convert" });
  const params = await searchParams;
  const conversionId =
    typeof params.conversion === "string" ? params.conversion : null;
  const handoffId = typeof params.handoff === "string" ? params.handoff : null;
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

  const defaultProjectId =
    workspace.type === "personal" ? user.settings.defaultProjectId : null;

  const [storedConversion, projects, planSummary, adminOverview] =
    await Promise.all([
      conversionId
        ? getWorkspaceConversionById(user.id, workspace, conversionId)
        : Promise.resolve(null),
      listWorkspaceProjects(user.id, workspace, 100),
      getWorkspacePlanSummary(workspace),
      showAdmin ? getAdminOverview() : Promise.resolve(null),
    ]);

  if (conversionId && !storedConversion) {
    const fallbackWorkspaceId = await findAlternativeWorkspaceIdForConversion(
      user,
      workspace,
      conversionId,
    );

    if (fallbackWorkspaceId) {
      redirect(
        buildWorkspaceRedirectPath(
          fallbackWorkspaceId,
          buildReturnTo({ conversionId, handoffId }),
        ),
      );
    }

    notFound();
  }

  return (
    <PlatformShell
      currentView="convert"
      eyebrow="Convert"
      primaryAction={{ href: "/dashboard/convert", label: "Convert now" }}
      returnTo={buildReturnTo({ conversionId, handoffId })}
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
      title="Convert"
      toolbarMeta={
        <>
          <ToolbarPill>{user.activeWorkspace.name}</ToolbarPill>
          {showAdmin ? (
            <ToolbarPill>Unlimited access</ToolbarPill>
          ) : (
            <>
              <ToolbarPill>{planSummary.planName}</ToolbarPill>
              <ToolbarPill>
                {formatStatementsRemaining(
                  planSummary.usage.conversionsRemaining,
                )}
              </ToolbarPill>
            </>
          )}
        </>
      }
      user={user}
    >
      <div id="convert-workspace">
        <ConverterWorkspace
          authenticatedConvertPath="/dashboard/convert"
          billingHref="/dashboard/billing"
          canManageSavedConversion={true}
          defaultCurrency={user.settings.preferredCurrency}
          defaultExportName={user.settings.exportName}
          initialUploadHandoffId={handoffId}
          initialPreview={storedConversion?.preview ?? null}
          initialConversionId={storedConversion?.id ?? null}
          initialProjectId={storedConversion?.projectId ?? defaultProjectId}
          isAuthenticated
          usageSummary={showAdmin ? null : planSummary}
          workspaceLabel={user.activeWorkspace.name}
          workspaceType={workspace.type}
          projects={projects.map((project) => ({
            id: project.id,
            name: project.projectName,
          }))}
        />
      </div>
    </PlatformShell>
  );
}
