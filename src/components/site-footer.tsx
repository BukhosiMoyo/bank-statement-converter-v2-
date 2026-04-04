"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { BLOG_ARTICLES } from "@/lib/seo-links";

const footerGroups = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/convert", label: "Convert" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: BLOG_ARTICLES[0].href, label: BLOG_ARTICLES[0].label },
      { href: BLOG_ARTICLES[5].href, label: BLOG_ARTICLES[5].label },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      {
        href: "mailto:sales@bankstatementconverter.com?subject=Bank%20Statement%20Converter",
        label: "Contact",
      },
    ],
  },
];

export function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return null;
  }

  return (
    <footer
      className={`mx-auto w-full ${SITE_CONTAINER_CLASS} px-4 pb-8 pt-2 sm:px-6 lg:px-8`}
    >
      <div className="panel rounded-[1.75rem] px-5 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(3,0.8fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
              Bank Statement Converter
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Convert digital bank statement PDFs into clean CSV and Excel-ready
              files, organize client work in projects, and keep team work inside
              shared workspaces.
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Original PDFs are not stored after conversion. Saved work stays
              tied to your workspace. Saved conversions can be deleted where
              supported.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
                {group.title}
              </p>
              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {group.links.map((link) => (
                  <div key={link.href}>
                    <Link href={link.href} className="hover:text-[var(--foreground)]">
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/8 pt-4 text-sm text-[var(--muted)]">
          <p>© {year} Bank Statement Converter</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login" className="hover:text-[var(--foreground)]">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[var(--foreground)]">
              Create account
            </Link>
            <Link href="/convert" className="hover:text-[var(--foreground)]">
              Start converting
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
