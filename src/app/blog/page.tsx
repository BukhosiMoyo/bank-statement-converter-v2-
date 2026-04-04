import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { BLOG_ARTICLES } from "@/lib/seo-links";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Public guides and articles for converting bank statements to Excel or CSV, with workflows for South African accounting teams.",
  openGraph: {
    title: "Bank Statement Converter Blog",
    description:
      "Guides and practical articles for statement conversion, review, and export workflows.",
    type: "website",
    siteName: "Bank Statement Converter",
  },
};

export default function BlogPage() {
  return (
    <main className="pb-16">
      <SiteHeader />

      <section
        className={`mx-auto grid w-full ${SITE_CONTAINER_CLASS} gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-10`}
      >
        <div className="self-center">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Blog
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.96] tracking-tight text-[var(--foreground)] sm:text-6xl">
            Public guides for statement conversion
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Browse the public articles, bank-specific guides, and workflow notes
            already published for the platform.
          </p>
        </div>

        <div className="panel rounded-[2.2rem] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Browse
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-black/8 bg-white/72 px-4 py-4">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Guides
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Step-by-step workflows for Excel and CSV exports.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-black/8 bg-white/72 px-4 py-4">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Bank layouts
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Public pages for FNB, Standard Bank, Capitec, and local teams.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/convert"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white hover:-translate-y-0.5"
            >
              Start converting
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <section
        className={`mx-auto mt-4 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {BLOG_ARTICLES.map((article) => (
            <article key={article.href} className="panel rounded-[1.8rem] p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {article.label}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {article.description}
              </p>
              <Link
                href={article.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/72 px-5 text-sm font-medium text-[var(--foreground)]"
              >
                Open article
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
