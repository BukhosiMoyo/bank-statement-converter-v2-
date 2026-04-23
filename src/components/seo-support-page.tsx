import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { BLOG_AUTHOR_NAME } from "@/lib/brand";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { getAbsoluteSiteUrl, SITE_NAME } from "@/lib/metadata";
import { buildGuideLinks } from "@/lib/seo-links";

type SeoSupportCard = {
  title: string;
  body: string;
  label?: string;
};

type SeoSupportSection = {
  eyebrow: string;
  title: string;
  intro?: string;
  cards: SeoSupportCard[];
  columns?: 2 | 3;
};

type SeoSupportFaq = {
  question: string;
  answer: string;
};

type SeoSupportLink = {
  href: string;
  label: string;
};

function buildFaqSchema(faqs: SeoSupportFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function toAnchorId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildBreadcrumbSchema({
  currentHref,
  title,
}: {
  currentHref: string;
  title: string;
}) {
  const isBlogArticle = currentHref.startsWith("/blog/");
  const items = [
    { name: "Home", item: getAbsoluteSiteUrl("/") },
    ...(isBlogArticle ? [{ name: "Blog", item: getAbsoluteSiteUrl("/blog") }] : []),
    { name: title, item: getAbsoluteSiteUrl(currentHref) },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function buildArticleSchema({
  currentHref,
  title,
  intro,
}: {
  currentHref: string;
  title: string;
  intro: string;
}) {
  const absoluteUrl = getAbsoluteSiteUrl(currentHref);

  return {
    "@context": "https://schema.org",
    "@type": currentHref.startsWith("/blog/") ? "BlogPosting" : "Article",
    headline: title,
    description: intro,
    author: {
      "@type": "Person",
      name: BLOG_AUTHOR_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getAbsoluteSiteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl,
    url: absoluteUrl,
  };
}

export function SeoSupportPage({
  currentHref,
  eyebrow,
  title,
  intro,
  shortAnswer,
  shortAnswerTitle = "Short answer",
  sections,
  faqs,
  ctaTitle,
  ctaBody,
  relatedLinks = [],
}: {
  currentHref: string;
  eyebrow: string;
  title: string;
  intro: string;
  shortAnswer: string;
  shortAnswerTitle?: string;
  sections: SeoSupportSection[];
  faqs: SeoSupportFaq[];
  ctaTitle: string;
  ctaBody: string;
  relatedLinks?: SeoSupportLink[];
}) {
  const faqSchema = buildFaqSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema({ currentHref, title });
  const articleSchema = buildArticleSchema({ currentHref, title, intro });
  const sectionLinks = sections.map((section) => ({
    href: `#${toAnchorId(section.title)}`,
    label: section.title,
  }));
  const guideLinks = buildGuideLinks({
    currentHref,
    preferredLinks: relatedLinks,
  });

  return (
    <main className="pb-16">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Visible breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className={`mx-auto w-full ${SITE_CONTAINER_CLASS} px-4 pt-4 sm:px-6 lg:px-8`}
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
          <li>
            <Link
              href="/"
              className="hover:text-[var(--foreground)]"
            >
              Home
            </Link>
          </li>
          {currentHref.startsWith("/blog/") ? (
            <>
              <li aria-hidden="true" className="select-none">/</li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-[var(--foreground)]"
                >
                  Blog
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true" className="select-none">/</li>
          <li>
            <span className="font-medium text-[var(--foreground)]">
              {title}
            </span>
          </li>
        </ol>
      </nav>

      <section
        className={`mx-auto grid w-full ${SITE_CONTAINER_CLASS} gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-8 lg:pt-10`}
      >
        <div className="self-center">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            {eyebrow}
          </span>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight text-[var(--foreground)] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {intro}
          </p>
          <p className="mt-5 text-sm font-medium text-[var(--muted)]">
            By {BLOG_AUTHOR_NAME}
          </p>
        </div>

        <div className="panel rounded-[2.2rem] p-5 sm:p-6 lg:sticky lg:top-28 lg:self-start">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {shortAnswerTitle}
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--foreground)]">
              {shortAnswer}
            </p>
          </div>

          <div className="mt-8 border-t border-black/8 pt-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              In this article
            </p>
            <nav className="mt-4 space-y-3">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#frequently-asked-questions"
                className="block text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Frequently Asked Questions
              </a>
            </nav>
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
        className={`mx-auto mt-2 grid w-full ${SITE_CONTAINER_CLASS} gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8`}
      >
        <article className="panel-strong rounded-[2.2rem] px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="rounded-[1.8rem] border border-black/8 bg-[rgba(255,255,255,0.78)] px-5 py-5 sm:px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Article outline
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#frequently-asked-questions"
                className="inline-flex rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                FAQ
              </a>
            </div>
          </div>

          <div className="mt-10 space-y-12">
            {sections.map((section) => (
              <section
                key={section.title}
                id={toAnchorId(section.title)}
                className="scroll-mt-32 border-t border-black/8 pt-10 first:border-t-0 first:pt-0"
              >
                <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
                  {section.eyebrow}
                </span>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2rem]">
                  {section.title}
                </h2>
                {section.intro ? (
                  <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
                    {section.intro}
                  </p>
                ) : null}

                <div className="mt-8 space-y-8">
                  {section.cards.map((card, index) => (
                    <section
                      key={`${section.title}-${card.title}`}
                      className={`border-l border-[rgba(23,32,43,0.14)] pl-5 sm:pl-6 ${
                        index > 0 ? "pt-1" : ""
                      }`}
                    >
                      {card.label ? (
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          {card.label}
                        </p>
                      ) : null}
                      <h3
                        className={`${card.label ? "mt-3" : ""} max-w-3xl text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl`}
                      >
                        {card.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
                        {card.body}
                      </p>
                    </section>
                  ))}
                </div>
              </section>
            ))}

            <section
              id="frequently-asked-questions"
              className="scroll-mt-32 border-t border-black/8 pt-10"
            >
              <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
                FAQ
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2rem]">
                Frequently Asked Questions
              </h2>

              <div className="mt-8 space-y-8">
                {faqs.map((item) => (
                  <article
                    key={item.question}
                    className="border-l border-[rgba(23,32,43,0.14)] pl-5 sm:pl-6"
                  >
                    <h3 className="max-w-3xl text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                      {item.question}
                    </h3>
                    <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="panel rounded-[1.9rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Related guides
            </p>
            <div className="mt-4 space-y-3">
              {guideLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
                Next step
              </span>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                {ctaTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {ctaBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
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
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
