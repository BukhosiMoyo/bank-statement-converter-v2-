import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_ARTICLES } from "@/lib/seo-links";

export const metadata = buildPageMetadata({
  title: "Sitemap",
  description:
    "HTML sitemap for the public Bank Statement Converter pages, guides, and legal pages.",
  path: "/sitemap",
});

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/convert", label: "Convert" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
] as const;

const supportingLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/sitemap.xml", label: "XML Sitemap" },
] as const;

export default function HtmlSitemapPage() {
  return (
    <main className="pb-16">
      <SiteHeader />

      <section
        className={`mx-auto w-full ${SITE_CONTAINER_CLASS} px-4 pb-10 pt-8 sm:px-6 lg:px-8`}
      >
        <div className="max-w-3xl">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Sitemap
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Sitemap
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            Public pages and guides.
          </p>
        </div>
      </section>

      <section
        className={`mx-auto grid w-full ${SITE_CONTAINER_CLASS} gap-6 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8`}
      >
        <div className="space-y-4">
          <section className="panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Product
            </p>
            <div className="mt-4 space-y-3">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Resources
            </p>
            <div className="mt-4 space-y-3">
              {supportingLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="panel-strong rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Guides
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BLOG_ARTICLES.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="rounded-[1.35rem] border border-black/8 bg-white/72 px-4 py-4 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                {article.label}
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
