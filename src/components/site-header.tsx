import Link from "next/link";

import { BrandIcon, BrandLogo } from "@/components/brand-media";
import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";

const links = [
  { href: "/convert", label: "Convert" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

function BrandMark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center"
    >
      <BrandIcon className="h-11 w-11 sm:hidden" priority />
      <BrandLogo className="hidden h-auto w-[15rem] sm:block" priority />
    </Link>
  );
}

function WorkspaceSwitcher({
  activeWorkspaceId,
  organizations,
}: {
  activeWorkspaceId: string;
  organizations: Array<{
    id: string;
    name: string;
  }>;
}) {
  return (
    <form action="/api/workspace" className="flex items-center gap-2" method="post">
      <select
        className="min-h-10 max-w-[10rem] rounded-full border border-[var(--line)] bg-white/70 px-4 text-sm text-[var(--foreground)] outline-none"
        defaultValue={activeWorkspaceId}
        name="workspaceId"
      >
        <option value="personal">Personal</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
      <button
        className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
        type="submit"
      >
        Switch
      </button>
    </form>
  );
}

export async function SiteHeader({
  containerClassName = SITE_CONTAINER_CLASS,
}: {
  containerClassName?: string;
} = {}) {
  const user = await getCurrentUser();
  const showAdminLink = user ? isAdminEmail(user.email) : false;

  return (
    <header className="sticky top-0 z-30">
      <div
        className={`mx-auto flex w-full ${containerClassName} items-center justify-between px-4 py-4 sm:px-6 lg:px-8`}
      >
        <div className="panel flex w-full items-center justify-between rounded-[1.75rem] px-4 py-3 sm:px-5">
          <BrandMark />
          <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
            {showAdminLink ? (
              <Link href="/dashboard/admin/payments" className="hover:text-[var(--foreground)]">
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.organizations.length > 0 ? (
                  <WorkspaceSwitcher
                    activeWorkspaceId={
                      user.activeWorkspace.type === "organization"
                        ? user.activeWorkspace.organizationId
                        : "personal"
                    }
                    organizations={user.organizations.map((organization) => ({
                      id: organization.id,
                      name: organization.name,
                    }))}
                  />
                ) : null}
                <Link
                  href="/dashboard"
                  className="hidden rounded-full px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex"
                >
                  Dashboard
                </Link>
                {showAdminLink ? (
                  <Link
                    href="/dashboard/admin/payments"
                    className="hidden rounded-full px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex"
                  >
                    Admin
                  </Link>
                ) : null}
                <form action="/api/auth/logout" method="post">
                  <button
                    className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                    type="submit"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-full px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
