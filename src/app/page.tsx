import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { HomeHeroUpload } from "@/components/home-hero-upload";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { formatZarAmount, listCreditBundles } from "@/lib/billing";
import { SITE_CONTAINER_CLASS } from "@/lib/layout";
import { buildPageMetadata } from "@/lib/metadata";
import { listPlanDefinitions, type PlanDefinition } from "@/lib/plans";
import { BLOG_ARTICLES, type PublicArticleLink } from "@/lib/seo-links";

export const metadata: Metadata = buildPageMetadata({
  title: "Convert Bank Statements to Excel",
  description:
    "Bank Statement Converter for accountants and finance teams. Upload a PDF bank statement, review extracted transactions, and download clean Excel or CSV files in seconds.",
  path: "/",
  keywords: [
    "bank statement converter",
    "convert bank statement to Excel",
    "PDF bank statement to CSV",
    "bank statement converter South Africa",
    "convert PDF bank statement",
    "bank statement analysis tool",
  ],
});

const trustPoints = [
  "Supports FNB, Standard Bank, and Capitec digital layouts",
  "Original PDFs are not stored after conversion",
  "Built around South African accounting workflows",
];

const sectionLinks = [
  { href: "#why-it-works", label: "Why it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#guides", label: "Guides" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Upload the statement PDF",
    body: "Start with a digital statement PDF so the transaction text can be extracted cleanly and reviewed before it reaches bookkeeping, reconciliation, or reporting work.",
  },
  {
    step: "02",
    title: "Review the extracted rows",
    body: "Check dates, descriptions, balances, and anything that looks unusual while the statement is still easy to inspect inside one structured preview.",
  },
  {
    step: "03",
    title: "Export in the format you need",
    body: "Download Excel for workbook review or CSV for simpler imports and cleanup once the preview looks ready for the next accounting step.",
  },
];

const reviewPillars = [
  {
    title: "Review before export",
    body: "The workflow is built around the moment accountants decide whether the statement output is credible enough for real work, not just quick enough for a download button.",
  },
  {
    title: "Excel and CSV from one pass",
    body: "The same parsed statement can support spreadsheet review and cleaner downstream imports without forcing you to repeat the upload for each format.",
  },
  {
    title: "Client work that stays organised",
    body: "Projects and shared workspaces matter once statement handling becomes recurring, collaborative, and tied to real monthly accounting routines.",
  },
];

const operatingSignals = [
  "Confirm the statement period and detected bank before you export.",
  "Check amount direction, references, and low-confidence rows in one place.",
  "Choose Excel for review-heavy work and CSV for simpler tabular flows.",
];

function getArticleByHref(href: string): PublicArticleLink {
  const article = BLOG_ARTICLES.find((item) => item.href === href);

  if (!article) {
    throw new Error(`Missing public article link for ${href}`);
  }

  return article;
}

const useCases = [
  {
    audience: "For bookkeepers and small firms",
    title: "Recurring monthly bookkeeping without repeated manual capture",
    body: "Most monthly statement work becomes slow because the same client files need to be opened, checked, typed, and cleaned again every cycle. A better rhythm is to move from digital PDF to reviewed rows, then keep the finished output attached to the right client project so next month starts with order instead of another blank spreadsheet.",
    points: [
      "Keep each client inside a dedicated project",
      "Use Excel when the review happens in working papers",
      "Reduce retyping across repeat monthly files",
    ],
    article: getArticleByHref("/how-accountants-process-bank-statements-faster"),
  },
  {
    audience: "For finance teams and accounting managers",
    title: "Statement preparation before reconciliation and exception review",
    body: "Reconciliation moves faster when the statement data is already structured and reviewed before it meets the ledger or the cashbook. The preview step gives teams a practical checkpoint for dates, descriptions, references, and balance flow so the export enters matching work in a more usable shape.",
    points: [
      "Check row quality before matching starts",
      "Export only when the statement looks credible",
      "Pick CSV or Excel according to the next workflow",
    ],
    article: getArticleByHref("/how-to-convert-bank-statement-to-excel"),
  },
  {
    audience: "For firms handling heavier statement volume",
    title: "Busy-period processing when many client statements arrive together",
    body: "During month-end or catch-up periods, the pressure is operational rather than theoretical. Teams need to move through volume without losing the review controls that protect later accounting work. Batch handling helps, but the real value comes from still being able to inspect each statement separately before export.",
    points: [
      "Process several statements in one session",
      "Keep each preview separate and visible",
      "Avoid collapsing different clients into one generic batch result",
    ],
    article: getArticleByHref("/convert-pdf-bank-statement-to-csv-step-by-step"),
  },
  {
    audience: "For internal finance teams",
    title: "Cash review, reporting support, and workbook preparation",
    body: "Internal teams often do not want PDFs sitting inside their analysis files. They want structured statement rows that are easier to filter, sort, compare, and bring into spreadsheet models. Once the statement is reviewed and exported cleanly, it becomes much easier to use for cash review, support schedules, and internal reporting preparation.",
    points: [
      "Move from locked PDFs to usable transaction rows",
      "Use Excel for analysis and workpapers",
      "Keep CSV available for lighter import workflows",
    ],
    article: getArticleByHref("/bank-statement-converter-south-africa"),
  },
] as const;

const comparisonRows = [
  {
    label: "Statement volume",
    values: ["5 / month", "100 / month", "400 / month", "Custom"],
  },
  {
    label: "Client projects",
    values: ["1 active project", "Multiple", "Multiple", "Custom setup"],
  },
  {
    label: "Team workspace",
    values: ["No", "No", "Yes", "Yes"],
  },
  {
    label: "Best for",
    values: [
      "Trying the workflow",
      "Independent accountants",
      "Growing teams and firms",
      "Larger practices",
    ],
  },
] as const;

const faqs = [
  {
    question: "How do I convert a bank statement to Excel without retyping it manually?",
    answer:
      "Start with a digital PDF bank statement, upload it into the converter, and review the extracted rows before download. That gives you a workbook-ready export without rebuilding the statement line by line in Excel. The review step matters because it lets you confirm dates, descriptions, and amounts while the statement is still easy to inspect.",
  },
  {
    question: "Can I export CSV as well as Excel?",
    answer:
      "Yes. The same parsed preview can be exported as CSV or Excel. Excel is usually useful when the next step is spreadsheet review, workbook preparation, or internal analysis. CSV is usually better when the next step is cleanup, import, or a simpler tabular workflow.",
  },
  {
    question: "Which bank statements work best in the current product?",
    answer:
      "The strongest current digital layouts are FNB, Standard Bank, and Capitec. Other digital bank statement PDFs can still be attempted through a best-effort workflow, but the preview should be reviewed more carefully when the layout is outside the strongest supported group.",
  },
  {
    question: "Do scanned or image-only bank statements work the same way?",
    answer:
      "No. Digital, text-based PDFs work best because the transaction text is available directly. Scanned and image-only statements are more limited and should be treated as best-effort input. When the statement is scanned, the review step becomes even more important before any export is used in accounting work.",
  },
  {
    question: "Why is the preview step such a big part of the workflow?",
    answer:
      "Because most finance teams do not just need a file. They need a file that still looks credible once it reaches bookkeeping, reconciliation, reporting, or review. Preview is where you confirm the statement period, descriptions, references, amounts, and overall row quality before the export leaves the platform.",
  },
  {
    question: "Can I upload multiple bank statements at once?",
    answer:
      "Yes. Batch upload is available, and each successful file keeps its own preview and export options. That means a firm can process several client statements in one session without losing the ability to review each statement separately before deciding that it is ready to export.",
  },
  {
    question: "Can I organise statements by client or engagement?",
    answer:
      "Yes. Logged-in users can save converted statements into projects so recurring client work stays grouped together. That is useful when the same client sends statements every month or when several people need the same client context over time.",
  },
  {
    question: "Is this built for South African firms specifically?",
    answer:
      "Yes. The product is positioned for South African accountants, bookkeepers, and finance teams. That shows up in the strongest supported bank layouts, in the accounting-focused review workflow, and in the practical plan structure already shaped around local use.",
  },
  {
    question: "What happens to the original PDF after conversion?",
    answer:
      "Original PDFs are not stored after conversion. The useful output that remains is the saved conversion data inside your workspace, which supports later project organisation, export reuse, and team collaboration without keeping the uploaded source file around permanently.",
  },
  {
    question: "When should I choose Excel instead of CSV?",
    answer:
      "Excel is usually the better choice when the next step includes spreadsheet review, filtering, internal analysis, workpapers, or client-facing workbook preparation. CSV is often better when you need a lighter file for import or cleanup. The platform keeps both available so the format can match the next workflow instead of forcing one default.",
  },
  {
    question: "How do monthly plans and credits work together?",
    answer:
      "Monthly plans are better for regular recurring volume, especially when statement work happens every month across several clients. Credits are useful as top-ups or for occasional work beyond the monthly allowance. That gives firms a practical way to handle uneven workloads without forcing one purchasing pattern for every situation.",
  },
  {
    question: "What kind of team should use the Business or Enterprise plans?",
    answer:
      "Business is the strongest fit when more than one person needs to work inside the same statement workflow, client project structure, or billing context. Enterprise is for larger practices that need custom volume, onboarding, or workflow support. Both tiers matter most once the work becomes shared and operational rather than personal.",
  },
  {
    question: "Can I start on the free plan and upgrade later?",
    answer:
      "Yes. Starter is intended for trying the workflow and confirming that the review and export process fits the way your team already works. Once statement volume grows or client work becomes more consistent, you can move to a monthly plan that better matches regular usage.",
  },
  {
    question: "Do I need to change the way my bookkeeping team works to use this?",
    answer:
      "No. The goal is to support the workflow your team already has after the statement is available, not to replace the rest of your accounting stack. You still decide where the cleaned statement rows go next, whether that is workbook review, reconciliation, import preparation, or internal reporting support.",
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
  step: workflowSteps.map((item) => ({
    "@type": "HowToStep",
    name: item.title,
    text: item.body,
  })),
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bank Statement Converter",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Convert bank statement PDFs into clean Excel and CSV files. Built for South African accountants, bookkeepers, and finance teams.",
  url: "https://bankstatementconvertor.co.za",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ZAR",
    description: "Free Starter plan available",
  },
  featureList: [
    "PDF to Excel conversion",
    "PDF to CSV conversion",
    "Transaction row preview and review",
    "FNB, Standard Bank, ABSA, Capitec, Nedbank support",
    "Project-based organization",
    "Batch statement processing",
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bank Statement Converter",
  url: "https://bankstatementconvertor.co.za",
  description:
    "Bank statement conversion platform for South African accountants and finance teams.",
  foundingCountry: "ZA",
};

function WorkflowIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full"
      viewBox="0 0 520 360"
      fill="none"
    >
      <rect x="18" y="22" width="484" height="316" rx="32" fill="#FFF8F0" />
      <rect
        x="18"
        y="22"
        width="484"
        height="316"
        rx="32"
        stroke="rgba(23,32,43,0.1)"
      />
      <rect x="62" y="66" width="170" height="222" rx="24" fill="#0E453B" />
      <rect
        x="62"
        y="66"
        width="170"
        height="222"
        rx="24"
        stroke="rgba(255,255,255,0.16)"
      />
      <rect x="92" y="96" width="110" height="10" rx="5" fill="#B9DCA8" />
      <rect x="92" y="124" width="110" height="10" rx="5" fill="#A7D190" />
      <rect x="92" y="152" width="80" height="10" rx="5" fill="#B9DCA8" />
      <rect x="92" y="180" width="92" height="10" rx="5" fill="#A7D190" />
      <rect x="92" y="208" width="104" height="10" rx="5" fill="#B9DCA8" />
      <path
        d="M132 232C190 180 232 168 302 168C354 168 385 149 433 108"
        stroke="#C4E8B5"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M129 233C184 278 239 292 311 292C367 292 407 293 445 296"
        stroke="#0E453B"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M430 100L456 109L438 131"
        stroke="#C4E8B5"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M443 296L414 282L434 258"
        stroke="#0E453B"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="286" y="78" width="164" height="70" rx="20" fill="#fffdf8" />
      <rect
        x="286"
        y="78"
        width="164"
        height="70"
        rx="20"
        stroke="rgba(23,32,43,0.1)"
      />
      <rect x="306" y="98" width="76" height="9" rx="4.5" fill="#0E453B" />
      <rect
        x="306"
        y="117"
        width="116"
        height="8"
        rx="4"
        fill="rgba(14,69,59,0.18)"
      />
      <rect x="286" y="210" width="164" height="92" rx="24" fill="#0E453B" />
      <rect
        x="286"
        y="210"
        width="164"
        height="92"
        rx="24"
        stroke="rgba(255,255,255,0.14)"
      />
      <circle cx="322" cy="256" r="16" fill="#C4E8B5" />
      <rect x="350" y="243" width="64" height="10" rx="5" fill="#EAF7E1" />
      <rect x="350" y="262" width="46" height="8" rx="4" fill="#B9DCA8" />
    </svg>
  );
}

function OperationsIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full"
      viewBox="0 0 520 340"
      fill="none"
    >
      <rect x="24" y="24" width="472" height="292" rx="32" fill="#FFF8F0" />
      <rect
        x="24"
        y="24"
        width="472"
        height="292"
        rx="32"
        stroke="rgba(23,32,43,0.1)"
      />
      <rect x="62" y="68" width="118" height="208" rx="24" fill="#fffdf8" />
      <rect
        x="62"
        y="68"
        width="118"
        height="208"
        rx="24"
        stroke="rgba(23,32,43,0.1)"
      />
      <rect x="90" y="98" width="62" height="8" rx="4" fill="#0E453B" />
      <rect
        x="90"
        y="118"
        width="62"
        height="52"
        rx="12"
        fill="rgba(14,69,59,0.1)"
      />
      <rect x="90" y="186" width="62" height="8" rx="4" fill="#0E453B" />
      <rect
        x="90"
        y="206"
        width="62"
        height="42"
        rx="12"
        fill="rgba(14,69,59,0.08)"
      />
      <rect x="202" y="54" width="122" height="222" rx="24" fill="#0E453B" />
      <rect
        x="202"
        y="54"
        width="122"
        height="222"
        rx="24"
        stroke="rgba(255,255,255,0.16)"
      />
      <rect x="230" y="88" width="66" height="8" rx="4" fill="#B9DCA8" />
      <rect x="230" y="108" width="66" height="52" rx="12" fill="#A7D190" />
      <rect x="230" y="180" width="66" height="8" rx="4" fill="#B9DCA8" />
      <rect x="230" y="200" width="66" height="42" rx="12" fill="#A7D190" />
      <rect x="346" y="96" width="114" height="180" rx="24" fill="#fffdf8" />
      <rect
        x="346"
        y="96"
        width="114"
        height="180"
        rx="24"
        stroke="rgba(23,32,43,0.1)"
      />
      <circle cx="403" cy="138" r="22" fill="#C4E8B5" />
      <path
        d="M390 137L399 146L417 128"
        stroke="#0E453B"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="374" y="182" width="58" height="8" rx="4" fill="#0E453B" />
      <rect
        x="374"
        y="201"
        width="58"
        height="36"
        rx="12"
        fill="rgba(14,69,59,0.1)"
      />
      <path
        d="M180 162H202"
        stroke="#C4E8B5"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M324 162H346"
        stroke="#C4E8B5"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function getPlanHref(plan: PlanDefinition, isSignedIn: boolean) {
  if (plan.contactOnly) {
    return "mailto:sales@bankstatementconverter.com?subject=Enterprise%20plan%20enquiry";
  }

  if (plan.id === "free") {
    return isSignedIn ? "/convert" : "/signup";
  }

  return "/pricing";
}

export default async function Home() {
  const currentUser = await getCurrentUser();
  const plans = listPlanDefinitions();
  const creditBundles = listCreditBundles();
  const latestGuides = BLOG_ARTICLES.slice(-6).reverse();

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
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
        className={`mx-auto w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="panel rounded-[1.85rem] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Explore
            </p>
            {sectionLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] bg-white/78 px-4 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="why-it-works"
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <article className="panel-strong relative overflow-hidden rounded-[2.4rem] px-6 py-7 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(22,106,91,0.16),transparent_68%)]" />
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              Why it works
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              A statement workflow designed for review, not just for quick
              export
            </h2>
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-8 text-[var(--muted)]">
              <p>
                Most teams do not struggle with getting a file out of a PDF.
                They struggle with getting a file out of a PDF that still feels
                usable once it lands in a workbook, a reconciliation schedule,
                or a monthly bookkeeping pack. That is why the workflow here is
                built around one practical idea: let the team inspect the output
                before it becomes someone else&apos;s cleanup problem.
              </p>
              <p>
                The upload stays fast, but the useful part happens immediately
                after that. The platform gives accountants and finance teams a
                clearer way to move from statement PDF to structured rows, check
                what matters, and then export only when the file is ready for
                real work. That is a better fit for operational accounting than
                blind conversion followed by manual repair.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {reviewPillars.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.7rem] border border-black/8 bg-white/80 px-5 py-5"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <aside className="panel rounded-[2.4rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Review-first flow
            </p>
            <div className="mt-4 rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,252,247,0.94))] p-4">
              <WorkflowIllustration />
            </div>
            <div className="mt-6 space-y-3">
              {operatingSignals.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-black/8 bg-white/80 px-4 py-4 text-sm leading-7 text-[var(--foreground)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <article className="panel rounded-[2.3rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              A simple three-step process that still protects the accounting
              work after the download
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              The flow is intentionally simple. You upload the statement, review
              the extracted rows, and export in the format that fits the next
              task. The difference is that the middle step is treated as the
              core of the workflow instead of an afterthought.
            </p>
            <div className="mt-8 space-y-4">
              {workflowSteps.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[1.75rem] border border-black/8 bg-white/80 px-5 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="panel-strong rounded-[2.3rem] px-6 py-7 sm:px-8 sm:py-8">
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              Where it helps
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              The same conversion flow supports bookkeeping, reconciliation,
              client service, and internal finance review
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
              Firms usually buy a tool like this because statement handling is
              slowing down something else. Sometimes that is recurring client
              bookkeeping. Sometimes it is month-end reconciliation. Sometimes
              it is simply the drag of moving locked PDFs into usable rows. The
              product is most helpful when it removes that friction without
              forcing teams into a new operating model.
            </p>
            <div className="mt-6 rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,252,247,0.94))] p-4">
              <OperationsIllustration />
            </div>
          </article>
        </div>
      </section>

      <section
        id="use-cases"
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <aside className="panel rounded-[2.3rem] p-5 sm:p-6 xl:sticky xl:top-28 xl:self-start">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Use cases
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Clear scenarios for the teams that handle statements every week
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Good homepage content should make it obvious where the workflow
              fits. These use cases are built around real accounting pressure:
              recurring client work, reconciliation preparation, busy-period
              volume, and internal finance analysis.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Monthly client bookkeeping",
                "Reconciliation preparation",
                "Batch statement handling",
                "Internal reporting support",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.45rem] border border-black/8 bg-white/82 px-4 py-4 text-sm font-medium text-[var(--foreground)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            {useCases.map((item) => (
              <article
                key={item.title}
                className="panel-strong rounded-[2rem] px-6 py-6 sm:px-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {item.audience}
                    </p>
                    <h3 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2rem]">
                      {item.title}
                    </h3>
                  </div>
                  <Link
                    href={item.article.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/82 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                  >
                    Related guide
                  </Link>
                </div>
                <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--muted)]">
                  {item.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {item.points.map((point) => (
                    <span
                      key={point}
                      className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                    >
                      {point}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm text-[var(--muted)]">
                  Read next:{" "}
                  <Link
                    href={item.article.href}
                    className="font-medium text-[var(--accent)] hover:text-[var(--foreground)]"
                  >
                    {item.article.label}
                  </Link>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="panel-strong rounded-[2.35rem] px-6 py-7 sm:px-8 sm:py-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            Pricing
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Pricing built for solo accountants, growing firms, and shared team
            workflows
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--muted)]">
            Monthly plans work best when statement volume is regular. Credit
            packs work better for overflow periods or occasional extra capacity.
            The comparison table stays below so teams can quickly see which plan
            matches their workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#monthly-plans"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white hover:-translate-y-0.5"
            >
              Monthly plans
            </a>
            <a
              href="#credit-packs"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-white/82 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
            >
              Credit packs
            </a>
            <a
              href="#plan-compare"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-white/82 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
            >
              Compare plans
            </a>
          </div>
        </div>

        <div
          id="monthly-plans"
          className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4"
        >
          {plans.map((plan) => {
            const isFeatured = Boolean(plan.badgeLabel);

            return (
              <article
                key={plan.id}
                id={`plan-${plan.id}`}
                className={`panel flex h-full flex-col rounded-[2rem] p-6 ${
                  isFeatured
                    ? "border-[rgba(22,106,91,0.24)] bg-[linear-gradient(180deg,#ffffff,#f6fbf8)] shadow-[0_24px_60px_rgba(18,94,79,0.08)]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {plan.name}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                      {plan.price}
                      {plan.interval ? (
                        <span className="ml-2 text-base font-medium text-[var(--muted)]">
                          {plan.interval}
                        </span>
                      ) : null}
                    </h3>
                  </div>
                  {plan.badgeLabel ? (
                    <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]">
                      {plan.badgeLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {plan.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)]">
                    {plan.contactOnly
                      ? "Custom statement volume"
                      : `${plan.monthlyConversionLimit} statements / month`}
                  </span>
                  <span className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)]">
                    {plan.id === "business" || plan.id === "enterprise"
                      ? "Shared team workspace"
                      : plan.projectLimit === null
                        ? "Multiple client projects"
                        : `${plan.projectLimit} active project`}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {plan.notes.map((note) => (
                    <div
                      key={note}
                      className="rounded-[1.4rem] border border-black/8 bg-white/86 px-4 py-3 text-sm leading-7 text-[var(--foreground)]"
                    >
                      {note}
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <ActionLink
                    href={getPlanHref(plan, Boolean(currentUser))}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                  >
                    {plan.ctaLabel}
                  </ActionLink>
                </div>
              </article>
            );
          })}
        </div>

        <article
          id="credit-packs"
          className="panel mt-6 rounded-[2rem] px-6 py-6 sm:px-7"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Credit packs
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Extra capacity for overflow work and occasional statement volume
              </h3>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[var(--accent)] hover:text-[var(--foreground)]"
            >
              Full pricing
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {creditBundles.map((bundle) => (
              <article
                key={bundle.id}
                className="rounded-[1.7rem] border border-black/8 bg-white/86 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {bundle.name}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {formatZarAmount(bundle.amountMinor)}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Best for top-ups, overflow periods, or firms that need
                  occasional conversion capacity without changing the base
                  monthly plan.
                </p>
                <div className="mt-5">
                  <ActionLink
                    href={currentUser ? "/pricing" : "/signup"}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
                  >
                    {bundle.ctaLabel}
                  </ActionLink>
                </div>
              </article>
            ))}
          </div>
        </article>

        <div
          id="plan-compare"
          className="panel mt-6 overflow-hidden rounded-[2rem]"
        >
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[rgba(255,255,255,0.9)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-4 font-medium">Plan</th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className="px-4 py-4 font-medium text-[var(--foreground)]"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-t border-black/6">
                  <td className="px-4 py-4 font-medium text-[var(--foreground)]">
                    {row.label}
                  </td>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${index}-${value}`}
                      className="px-4 py-4 text-[var(--muted)]"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="panel rounded-[2.15rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
                Start now
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Keep the upload step fast and the review step visible
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--muted)]">
                Start with a digital statement PDF, review the output properly,
                and export only when the rows are ready for the accounting work
                that follows.
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
                Explore pricing
              </Link>
              <Link
                href="/blog"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                Read guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="guides"
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              Latest guides
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Our latest guides
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
              Browse the latest articles on statement conversion, CSV exports,
              bank-specific workflows, and operational guidance for accounting
              teams.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white hover:-translate-y-0.5"
          >
            View all articles
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latestGuides.map((article) => (
            <article
              key={article.href}
              className="panel rounded-[1.9rem] px-5 py-5"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                <Link
                  href={article.href}
                  className="hover:text-[var(--accent)]"
                >
                  {article.label}
                </Link>
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {article.description}
              </p>
              <Link
                href={article.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/82 px-5 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5"
              >
                Read article
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className={`mx-auto mt-16 w-full ${SITE_CONTAINER_CLASS} px-4 sm:px-6 lg:px-8`}
      >
        <div className="panel-strong rounded-[2.3rem] px-6 py-7 sm:px-8 sm:py-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
            FAQ
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--muted)]">
            Answers to the practical questions about supported statements,
            exports, projects, plans, and how the workflow fits into real
            accounting work.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="panel rounded-[1.9rem] px-5 py-5 sm:px-6"
            >
              <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {item.question}
              </h3>
              <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
