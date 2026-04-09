"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import type { SessionUser } from "@/lib/app-data";

type PlatformView =
  | "dashboard"
  | "convert"
  | "projects"
  | "billing"
  | "referrals"
  | "settings"
  | "admin"
  | "users";
type NavIconKind =
  | "overview"
  | "projects"
  | "billing"
  | "convert"
  | "referrals"
  | "settings"
  | "admin"
  | "users";

const SIDEBAR_EXPANDED_WIDTH = 356;
const SIDEBAR_COLLAPSED_WIDTH = 110;
const SHELL_GAP = 16;
const TOP_OFFSET = 16;
const FOOTER_HEIGHT = 72;
const HEADER_FALLBACK_HEIGHT = 88;
const SIDEBAR_STORAGE_KEY = "bsc-platform-sidebar-collapsed";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "BS";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function BrandMark({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  return (
    <Link
      href="/dashboard"
      className={`inline-flex items-center text-sm font-semibold tracking-[0.16em] text-[var(--foreground)] uppercase ${
        collapsed ? "justify-center" : "gap-3"
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-[linear-gradient(145deg,#1b7a66,#0f5145)] text-white shadow-[0_16px_36px_rgba(21,104,87,0.24)]">
        BS
      </span>
      {!collapsed ? <span>Bank Statement Converter</span> : null}
    </Link>
  );
}

function NavIcon({
  kind,
  active = false,
}: {
  kind: NavIconKind;
  active?: boolean;
}) {
  const color = active ? "text-white" : "text-[var(--foreground)]";

  switch (kind) {
    case "overview":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M3 11.5 10 4l7 7.5V17a1 1 0 0 1-1 1h-3.5v-4.5h-5V18H4a1 1 0 0 1-1-1v-5.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "projects":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M4 6.5h12M4 10h12M4 13.5h7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
          <rect
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
            width="14"
            x="3"
            y="3.5"
          />
        </svg>
      );
    case "billing":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <rect
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
            width="14"
            x="3"
            y="4.5"
          />
          <path
            d="M3 8h14M6.5 12h2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "convert":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 4v8m0 0-3-3m3 3 3-3M4 14.5h12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "referrals":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m8.7 7.2 2.6 1.6m-2.4 2.8 2.2-1.2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "settings":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m16 10-.8-.5a5.8 5.8 0 0 0-.3-1l.3-.9-1.6-1.6-.9.3a5.8 5.8 0 0 0-1-.3L11.2 4H8.8l-.5.8a5.8 5.8 0 0 0-1 .3l-.9-.3-1.6 1.6.3.9a5.8 5.8 0 0 0-.3 1L4 10l.8.5a5.8 5.8 0 0 0 .3 1l-.3.9 1.6 1.6.9-.3a5.8 5.8 0 0 0 1 .3l.5.8h2.4l.5-.8a5.8 5.8 0 0 0 1-.3l.9.3 1.6-1.6-.3-.9a5.8 5.8 0 0 0 .3-1L16 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case "admin":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 3.5 4.5 5.6v4.1c0 3.1 2.2 5.9 5.5 6.8 3.3-.9 5.5-3.7 5.5-6.8V5.6L10 3.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path
            d="m7.7 9.7 1.6 1.6 3-3.4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "users":
      return (
        <svg
          aria-hidden="true"
          className={`h-5 w-5 ${color}`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 1.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M3.5 16c.7-2 2.3-3 4.8-3s4.1 1 4.8 3m.9-2c.9.3 1.7 1 2.1 2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
  }
}

function PlatformNavLink({
  active = false,
  collapsed = false,
  href,
  icon,
  label,
}: {
  active?: boolean;
  collapsed?: boolean;
  href: string;
  icon: NavIconKind;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center rounded-[1.35rem] text-sm font-medium ${
        active
          ? "bg-[linear-gradient(135deg,#1b7a66,#0f5145)] text-white shadow-[0_18px_35px_rgba(21,104,87,0.24)]"
          : "border border-black/8 bg-white/68 text-[var(--foreground)] hover:border-[var(--accent)]/20 hover:bg-white/82"
      } ${collapsed ? "h-12 justify-center px-0" : "min-h-12 gap-3 px-4 py-3"}`}
      title={collapsed ? label : undefined}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
        <NavIcon active={active} kind={icon} />
      </span>
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}

function FooterLinks({
  showAdmin,
}: {
  showAdmin: boolean;
}) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/settings", label: "Settings" },
    { href: "/dashboard/billing", label: "Billing" },
    ...(showAdmin
      ? [
          { href: "/dashboard/admin/users", label: "Users" },
          { href: "/dashboard/admin/payments", label: "Payments" },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/8 bg-white/72 px-3 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent)]/20"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function WorkspaceSwitcher({
  activeWorkspaceId,
  organizations,
  returnTo,
}: {
  activeWorkspaceId: string;
  organizations: Array<{
    id: string;
    name: string;
  }>;
  returnTo: string;
}) {
  return (
    <form action="/api/workspace" className="flex items-center gap-2" method="post">
      <input name="returnTo" type="hidden" value={returnTo} />
      <select
        className="min-h-10 rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm text-[var(--foreground)] outline-none"
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
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)]"
        type="submit"
      >
        Switch
      </button>
    </form>
  );
}

function ProfileMenu({
  showAdmin,
  user,
}: {
  showAdmin: boolean;
  user: SessionUser;
}) {
  return (
    <details className="relative">
      <summary className="list-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--line)] bg-white/82 px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
            {getInitials(user.name)}
          </span>
          <span className="hidden text-left xl:block">
            <span className="block text-sm font-medium text-[var(--foreground)]">
              {user.name}
            </span>
            <span className="block text-xs text-[var(--muted)]">Account</span>
          </span>
          <svg
            aria-hidden="true"
            className="mr-1 h-4 w-4 text-[var(--muted)]"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              d="m6 8 4 4 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </span>
      </summary>
      <div className="absolute right-0 z-30 mt-3 w-60 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-2 shadow-[0_24px_80px_rgba(31,42,55,0.12)]">
        <div className="rounded-[1.2rem] border border-black/6 bg-white/72 px-4 py-3">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {user.name}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">
            {user.email}
          </p>
        </div>
        <div className="mt-2 grid gap-1">
          <Link
            href="/dashboard/settings"
            className="rounded-[1.1rem] px-4 py-3 text-sm text-[var(--foreground)] hover:bg-white/72"
          >
            Account settings
          </Link>
          <Link
            href="/dashboard/billing"
            className="rounded-[1.1rem] px-4 py-3 text-sm text-[var(--foreground)] hover:bg-white/72"
          >
            Billing
          </Link>
          {showAdmin ? (
            <Link
              href="/dashboard/admin/users"
              className="rounded-[1.1rem] px-4 py-3 text-sm text-[var(--foreground)] hover:bg-white/72"
            >
              Users
            </Link>
          ) : null}
          {showAdmin ? (
            <Link
              href="/dashboard/admin/payments"
              className="rounded-[1.1rem] px-4 py-3 text-sm text-[var(--foreground)] hover:bg-white/72"
            >
              Admin payments
            </Link>
          ) : null}
          <form action="/api/auth/logout" method="post">
            <button
              className="w-full rounded-[1.1rem] px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-white/72"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

function CollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/82 text-[var(--foreground)]"
      onClick={onToggle}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          d={collapsed ? "M7 5.5 12 10l-5 4.5" : "M13 5.5 8 10l5 4.5"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    </button>
  );
}

export function PlatformShell({
  children,
  currentView,
  eyebrow = "Workspace",
  primaryAction,
  returnTo,
  searchSlot,
  sidebarFooter,
  showAdmin = false,
  title,
  toolbarMeta,
  user,
}: {
  children: ReactNode;
  currentView: PlatformView;
  eyebrow?: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  returnTo: string;
  searchSlot?: ReactNode;
  sidebarFooter?: ReactNode;
  showAdmin?: boolean;
  title: string;
  toolbarMeta?: ReactNode;
  user: SessionUser;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [headerHeight, setHeaderHeight] = useState(HEADER_FALLBACK_HEIGHT);
  const headerRef = useRef<HTMLElement | null>(null);
  const activeWorkspaceId =
    user.activeWorkspace.type === "organization"
      ? user.activeWorkspace.organizationId
      : "personal";
  const sidebarWidth = isSidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_EXPANDED_WIDTH;
  const contentOffset = sidebarWidth + SHELL_GAP;
  const action = primaryAction ?? {
    href: "/dashboard/convert",
    label: "Convert now",
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        isSidebarCollapsed ? "1" : "0",
      );
    } catch {
      return;
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const element = headerRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      setHeaderHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isSidebarCollapsed]);

  const shellStyle = {
    paddingLeft: contentOffset,
    paddingRight: SHELL_GAP,
    paddingTop: headerHeight + TOP_OFFSET + SHELL_GAP,
    paddingBottom: FOOTER_HEIGHT + TOP_OFFSET + SHELL_GAP * 2,
  } satisfies CSSProperties;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_32%),radial-gradient(circle_at_top_right,rgba(22,106,91,0.08),transparent_28%),var(--background)]">
      <aside
        className="panel fixed bottom-0 left-0 top-0 z-40 overflow-hidden rounded-l-none rounded-r-[2.25rem] border-l-0 p-4 sm:p-5"
        style={{ width: sidebarWidth }}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(22,106,91,0.16),transparent_72%)]" />
        <div className="relative flex h-full min-h-0 flex-col">
          <BrandMark collapsed={isSidebarCollapsed} />

          <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
            <nav className="grid gap-2">
              <PlatformNavLink
                active={currentView === "dashboard"}
                collapsed={isSidebarCollapsed}
                href="/dashboard"
                icon="overview"
                label="Dashboard"
              />
              <PlatformNavLink
                active={currentView === "convert"}
                collapsed={isSidebarCollapsed}
                href="/dashboard/convert"
                icon="convert"
                label="Convert"
              />
              <PlatformNavLink
                active={currentView === "projects"}
                collapsed={isSidebarCollapsed}
                href="/dashboard/projects"
                icon="projects"
                label="Projects"
              />
              <PlatformNavLink
                active={currentView === "referrals"}
                collapsed={isSidebarCollapsed}
                href="/dashboard/referrals"
                icon="referrals"
                label="Referrals"
              />
            </nav>

            <nav className="mt-6 grid gap-2">
              <PlatformNavLink
                active={currentView === "billing"}
                collapsed={isSidebarCollapsed}
                href="/dashboard/billing"
                icon="billing"
                label="Billing"
              />
              <PlatformNavLink
                active={currentView === "settings"}
                collapsed={isSidebarCollapsed}
                href="/dashboard/settings"
                icon="settings"
                label="Settings"
              />
              {showAdmin ? (
                <PlatformNavLink
                  active={currentView === "users"}
                  collapsed={isSidebarCollapsed}
                  href="/dashboard/admin/users"
                  icon="users"
                  label="Users"
                />
              ) : null}
              {showAdmin ? (
                <PlatformNavLink
                  active={currentView === "admin"}
                  collapsed={isSidebarCollapsed}
                  href="/dashboard/admin/payments"
                  icon="admin"
                  label="Payments"
                />
              ) : null}
            </nav>

            {!isSidebarCollapsed && sidebarFooter ? (
              <div className="mt-6">{sidebarFooter}</div>
            ) : null}
          </div>
        </div>
      </aside>

      <div style={shellStyle}>
        <header
          ref={headerRef}
          className="fixed z-30"
          style={{
            left: contentOffset,
            right: SHELL_GAP,
            top: TOP_OFFSET,
          }}
        >
          <div className="panel rounded-[2rem] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <CollapseButton
                  collapsed={isSidebarCollapsed}
                  onToggle={() => setIsSidebarCollapsed((current) => !current)}
                />
                <div className="min-w-0 flex items-center gap-2">
                  <span className="hidden rounded-full border border-black/8 bg-white/78 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] sm:inline-flex">
                    {eyebrow}
                  </span>
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {title}
                  </p>
                </div>
              </div>

              {searchSlot ? (
                <div className="min-w-0 flex-1 lg:max-w-[26rem]">{searchSlot}</div>
              ) : (
                <div className="hidden flex-1 lg:block" />
              )}

              <div className="ml-auto flex flex-wrap items-center gap-3">
                {user.organizations.length > 0 ? (
                  <WorkspaceSwitcher
                    activeWorkspaceId={activeWorkspaceId}
                    organizations={user.organizations.map((organization) => ({
                      id: organization.id,
                      name: organization.name,
                    }))}
                    returnTo={returnTo}
                  />
                ) : null}
                <Link
                  href={action.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white"
                >
                  {action.label}
                </Link>
                <ProfileMenu showAdmin={showAdmin} user={user} />
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {toolbarMeta ? (
            <div className="flex flex-wrap items-center gap-3">
              {toolbarMeta}
            </div>
          ) : null}
          {children}
        </div>
      </div>

      <div
        className="fixed z-20"
        style={{
          left: contentOffset,
          right: SHELL_GAP,
          bottom: TOP_OFFSET,
        }}
      >
        <div className="panel rounded-[1.6rem] px-4 py-3">
          <FooterLinks showAdmin={showAdmin} />
        </div>
      </div>
    </main>
  );
}
