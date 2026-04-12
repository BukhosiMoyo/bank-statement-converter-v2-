import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_ARTICLES } from "@/lib/seo-links";

const BLOG_PAGE_SIZE = 50;

function toPageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

function parsePositiveInteger(value: string | string[] | undefined) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(normalized ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const requestedPage = parsePositiveInteger(params.page);
  const totalPages = Math.max(1, Math.ceil(BLOG_ARTICLES.length / BLOG_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const canonicalPath = currentPage <= 1 ? "/blog" : `/blog?page=${currentPage}`;

  return buildPageMetadata({
    title: currentPage <= 1 ? "Blog" : `Blog Page ${currentPage}`,
    description:
      "Public guides and articles for converting bank statements to Excel or CSV, with workflows for South African accounting teams.",
    path: canonicalPath,
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedPage = parsePositiveInteger(params.page);
  const totalArticles = BLOG_ARTICLES.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / BLOG_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * BLOG_PAGE_SIZE;
  const pageArticles = BLOG_ARTICLES.slice(
    startIndex,
    startIndex + BLOG_PAGE_SIZE,
  );
  const featuredArticle = pageArticles[0] ?? BLOG_ARTICLES[0];
  const articles = pageArticles.slice(1);
  const latestArticles = BLOG_ARTICLES.slice(-4).reverse();
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const firstVisibleArticle = startIndex + 1;
  const lastVisibleArticle = startIndex + pageArticles.length;

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
            Latest articles
          </p>
          <div className="mt-5 space-y-3">
            {latestArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="block rounded-[1.4rem] border border-black/8 bg-white/72 px-4 py-4 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                {article.label}
              </Link>
            ))}
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
        className={`mx-auto mt-4 grid w-full ${SITE_CONTAINER_CLASS} gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8`}
      >
        <div className="space-y-4">
          <div className="panel rounded-[2rem] px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">
                Showing {firstVisibleArticle}-{lastVisibleArticle} of{" "}
                {totalArticles} articles
              </p>
              <p className="text-sm text-[var(--muted)]">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          <article className="panel-strong rounded-[2.2rem] px-6 py-7 sm:px-8 sm:py-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Featured guide
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              <Link href={featuredArticle.href} className="hover:text-[var(--accent)]">
                {featuredArticle.label}
              </Link>
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
              {featuredArticle.description}
            </p>
            <Link
              href={featuredArticle.href}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/72 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
            >
              Read article
            </Link>
          </article>

          <div className="panel rounded-[2.2rem] px-6 py-4 sm:px-8">
            {articles.map((article, index) => (
              <article
                key={article.href}
                className={`grid gap-4 py-6 ${
                  index > 0 ? "border-t border-black/8" : ""
                } lg:grid-cols-[3.5rem_minmax(0,1fr)_auto] lg:items-start`}
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                  {String(index + 2).padStart(2, "0")}
                </p>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    <Link href={article.href} className="hover:text-[var(--accent)]">
                      {article.label}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
                    {article.description}
                  </p>
                </div>
                <div>
                  <Link
                    href={article.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/72 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <nav
            aria-label="Blog pagination"
            className="panel rounded-[2rem] px-6 py-5 sm:px-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                {currentPage > 1 ? (
                  <Link
                    href={toPageHref(currentPage - 1)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/60 px-5 text-sm font-medium text-[var(--muted)]">
                    Previous
                  </span>
                )}

                {currentPage < totalPages ? (
                  <Link
                    href={toPageHref(currentPage + 1)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/60 px-5 text-sm font-medium text-[var(--muted)]">
                    Next
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {pageNumbers.map((pageNumber) => {
                  const isCurrent = pageNumber === currentPage;

                  return isCurrent ? (
                    <span
                      key={pageNumber}
                      className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white"
                    >
                      {pageNumber}
                    </span>
                  ) : (
                    <Link
                      key={pageNumber}
                      href={toPageHref(pageNumber)}
                      className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/80 px-4 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="panel rounded-[1.9rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Page summary
            </p>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <p>
                Page {currentPage} of {totalPages}
              </p>
              <p>
                Showing {firstVisibleArticle}-{lastVisibleArticle} of{" "}
                {totalArticles} guides
              </p>
              <p>50 articles per page</p>
            </div>
          </div>

          <div className="panel rounded-[1.9rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Latest articles
            </p>
            <div className="mt-4 space-y-3">
              {latestArticles.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {article.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
