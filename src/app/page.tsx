import type { Metadata } from "next";
import Link from "next/link";

import { HomeHeroUpload } from "@/components/home-hero-upload";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Bank Statement Converter | Convert Bank Statements to Excel",
  description:
    "Bank Statement Converter for accountants and finance teams. Upload a PDF bank statement, review extracted transactions, and download clean Excel or CSV files in seconds.",
  keywords: [
    "bank statement converter",
    "convert bank statement to Excel",
    "PDF bank statement to CSV",
    "bank statement converter South Africa",
    "convert PDF bank statement",
    "bank statement analysis tool",
  ],
  openGraph: {
    title: "Bank Statement Converter | Convert Bank Statements to Excel",
    description:
      "Upload a PDF bank statement, review extracted transactions, and download clean Excel or CSV files in seconds.",
    type: "website",
    siteName: "Bank Statement Converter",
  },
};

const trustPoints = [
  "Supports FNB, Standard Bank, Capitec",
  "No original PDFs stored",
  "Built for South African accountants",
];

const howItWorks = [
  {
    step: "01",
    title: "Upload your PDF",
    body: "Add a digital bank statement PDF and start the bank statement converter immediately.",
  },
  {
    step: "02",
    title: "Review extracted transactions",
    body: "Check the rows, dates, balances, and references before you export anything.",
  },
  {
    step: "03",
    title: "Download Excel or CSV",
    body: "Export clean working files for bookkeeping, analysis, and client reporting.",
  },
];

const featureCards = [
  {
    title: "Batch uploads",
    body: "Process multiple bank statements in one go and keep each file previewed separately.",
  },
  {
    title: "Excel export",
    body: "Convert bank statement to Excel with clean columns for date, description, debit, credit, balance, and page.",
  },
  {
    title: "CSV output",
    body: "Turn a PDF bank statement to CSV for bookkeeping systems, imports, and spreadsheet cleanup.",
  },
  {
    title: "Client organization",
    body: "Group saved work by client or project so monthly statement processing stays organized.",
  },
  {
    title: "Team workspace",
    body: "Use organization workspaces for shared projects, shared conversions, and shared usage.",
  },
  {
    title: "Secure processing",
    body: "Original PDFs are processed for conversion, while saved conversion data stays tied to the active workspace.",
  },
];

const useCases = [
  {
    title: "Monthly bookkeeping",
    body: "Convert recurring bank statements into Excel-ready files without retyping rows by hand every month.",
  },
  {
    title: "Client statement processing",
    body: "Keep multiple clients organized in projects so reconciliations, reviews, and exports stay separated.",
  },
  {
    title: "Financial data cleaning",
    body: "Use the preview layer as a practical bank statement analysis tool before exporting clean transaction data.",
  },
];

const faqs = [
  {
    question: "How do I convert a bank statement to Excel?",
    answer:
      "Upload a digital PDF bank statement, review the extracted transactions, then download the result as an Excel file.",
  },
  {
    question: "Can I convert PDF bank statements to CSV?",
    answer:
      "Yes. The converter supports CSV export as well as Excel export, using the same parsed preview data.",
  },
  {
    question: "Which banks are supported?",
    answer:
      "The strongest current layouts are FNB, Standard Bank, and Capitec. Other digital layouts use best-effort parsing.",
  },
  {
    question: "Does this work with scanned PDFs?",
    answer:
      "Digital, text-based PDFs work best. Scanned and image-only bank statements are not fully supported yet.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Original PDFs are not stored after conversion. Saved conversion data is tied to your personal or organization workspace.",
  },
  {
    question: "Can I upload multiple statements at once?",
    answer:
      "Yes. Batch upload is available, and each successful file keeps its own preview and export options.",
  },
  {
    question: "Can I organize statements by client?",
    answer:
      "Yes. Logged-in users can save conversions into projects and keep client work grouped in one workspace.",
  },
  {
    question: "Is this bank statement converter built for South Africa?",
    answer:
      "Yes. This bank statement converter South Africa firms can use is built for local accounting workflows and strong support for key South African bank layouts.",
  },
] as const;

const faqSchema = {
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

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert a Bank Statement to Excel",
  step: howItWorks.map((item) => ({
    "@type": "HowToStep",
    name: item.title,
    text: item.body,
  })),
};

const plans = [
  {
    name: "Starter",
    price: "R0",
    allowance: "5 statements / month",
    note: "Perfect for trying out the platform",
  },
  {
    name: "Professional",
    price: "R199",
    allowance: "100 statements / month",
    note: "Built for accountants managing multiple clients",
  },
  {
    name: "Business",
    price: "R699",
    allowance: "400 statements / month",
    note: "For teams and firms handling high volumes",
  },
  {
    name: "Enterprise",
    price: "Contact",
    allowance: "Custom statement volumes",
    note: "Contact us for custom solutions",
  },
];

export default async function Home() {
  const currentUser = await getCurrentUser();

  return (
    <main className="pb-16">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <section
        className={`mx-auto grid w-full ${SITE_CONTAINER_CLASS} gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-10`}
      >
        <div className="self-center">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Bank Statement Converter
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.96] tracking-tight text-[var(--foreground)] sm:text-6xl">
            Convert bank statements to Excel in seconds
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Upload a PDF bank statement and turn it into clean, Excel-ready
            data. Built for accountants and finance teams across South Africa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={currentUser ? "/convert" : "/signup"}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white hover:-translate-y-0.5"
            >
              {currentUser ? "Start converting" : "Sign up for free"}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
            >
              See pricing
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {trustPoints.map((item) => (
              <div key={item} className="panel rounded-[1.65rem] px-5 py-4">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <HomeHeroUpload />
        </div>
      </section>

      <section
        className={`mx-auto mt-4 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              How it works
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              How to Convert a Bank Statement to Excel
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Use the bank statement converter to turn a PDF bank statement to
              CSV or Excel-ready data in three clear steps.
            </p>
          </div>
          <Link
            href="/convert"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--foreground)]"
          >
            Try the converter
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {howItWorks.map((item) => (
            <article key={item.step} className="panel rounded-[1.8rem] p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Step {item.step}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Powerful Bank Statement Conversion Features
            </h2>
          </div>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--foreground)]"
          >
            View plans
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {featureCards.map((item) => (
            <article key={item.title} className="panel rounded-[1.8rem] p-6">
              <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div>
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Use cases
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Built for Accountants, Bookkeepers, and Finance Teams
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Convert PDF bank statements into usable working files for monthly
            bookkeeping, client work, and financial data cleanup.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {useCases.map((item) => (
            <article key={item.title} className="panel rounded-[1.8rem] p-6">
              <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              Pricing
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Plans that scale with client work.
            </h2>
          </div>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--foreground)]"
          >
            Full pricing
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className="panel rounded-[2rem] p-6">
              <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
                {plan.name}
              </p>
              <p className="mt-6 text-5xl font-semibold tracking-tight text-[var(--foreground)]">
                {plan.price}
              </p>
              <p className="mt-4 text-sm text-[var(--muted)]">{plan.allowance}</p>
              <p className="mt-4 text-sm text-[var(--foreground)]">{plan.note}</p>
            </article>
          ))}
        </div>
      </section>

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
                Start now
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Start converting bank statements now
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                Upload, review, and export clean Excel-ready files. No card
                required.
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
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
