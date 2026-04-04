import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";

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

const baseInternalLinks = [
  { href: "/", label: "Home" },
  { href: "/convert", label: "Convert" },
  { href: "/pricing", label: "Pricing" },
  { href: "/signup", label: "Sign up" },
];

export function SeoSupportPage({
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
  const internalLinks = [...baseInternalLinks, ...relatedLinks].filter(
    (link, index, links) =>
      links.findIndex((candidate) => candidate.href === link.href) === index,
  );

  return (
    <main className="pb-16">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section
        className={`mx-auto grid w-full ${SITE_CONTAINER_CLASS} gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-10`}
      >
        <div className="self-center">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            {eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.96] tracking-tight text-[var(--foreground)] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {intro}
          </p>
        </div>

        <div className="relative">
          <div className="panel rounded-[2.2rem] p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                {shortAnswerTitle}
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--foreground)]">
                {shortAnswer}
              </p>
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
        </div>
      </section>

      <section
        className={`mx-auto mt-4 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="panel rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            {internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {sections.map((section, index) => (
        <section
          key={section.title}
          className={`mx-auto ${index === 0 ? "mt-16" : "mt-12"} w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
                {section.eyebrow}
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                {section.title}
              </h2>
              {section.intro ? (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                  {section.intro}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className={`mt-8 grid gap-4 ${
              section.columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
            }`}
          >
            {section.cards.map((card) => (
              <article key={`${section.title}-${card.title}`} className="panel rounded-[1.8rem] p-6">
                {card.label ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {card.label}
                  </p>
                ) : null}
                <h3 className={`${card.label ? "mt-4" : ""} text-xl font-semibold tracking-tight text-[var(--foreground)]`}>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div>
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((item) => (
            <article key={item.question} className="panel rounded-[1.8rem] p-6">
              <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
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
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
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
