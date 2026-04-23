import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Bank Statement Converter — PDF to Excel and CSV",
  description:
    "Convert bank statement PDFs to Excel and CSV for free. Upload a digital statement from FNB, Standard Bank, ABSA, Capitec, or Nedbank, review the data, and export clean files.",
  path: "/free-bank-statement-converter",
  keywords: [
    "free bank statement converter",
    "free PDF to Excel bank statement",
    "free bank statement to CSV",
    "bank statement converter free online",
    "free bank statement extraction",
    "convert bank statement free",
  ],
  type: "article",
});

const relatedLinks = [
  { href: "/convert", label: "Start converting" },
  { href: "/bank-statements-to-excel", label: "Bank statements to Excel" },
  { href: "/pdf-bank-statement-to-csv", label: "PDF bank statement to CSV" },
  {
    href: "/bank-statement-converter-south-africa",
    label: "South Africa guide",
  },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert bank statements for free",
    intro:
      "The free plan gives you access to the full conversion workflow — upload, review, and export — so you can confirm the tool works for your specific bank statements before committing to a paid plan.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Create a free account",
        body: "Sign up and start using the converter immediately. The free Starter plan includes monthly statement conversions at no cost.",
      },
      {
        label: "Step 02",
        title: "Upload and review",
        body: "Upload a digital bank statement PDF, review the extracted transaction rows, and confirm the output quality before exporting.",
      },
      {
        label: "Step 03",
        title: "Export Excel or CSV",
        body: "Download clean Excel or CSV files. The same review-first workflow applies whether you are on the free plan or a paid plan.",
      },
    ],
  },
  {
    eyebrow: "What you get",
    title: "What the free plan includes",
    intro:
      "The Starter plan is designed to let accountants and bookkeepers try the full workflow before deciding whether a paid plan makes sense for their volume.",
    columns: 3 as const,
    cards: [
      {
        title: "Monthly statement conversions",
        body: "Convert a limited number of bank statements each month at no cost. Enough to test the workflow with real client statements.",
      },
      {
        title: "Full preview and review",
        body: "The free plan includes the same structured preview that paid plans offer. You can inspect every row before exporting.",
      },
      {
        title: "Excel and CSV exports",
        body: "Both export formats are available on the free plan. No features are locked behind a paywall during the trial period.",
      },
    ],
  },
  {
    eyebrow: "Supported banks",
    title: "Which bank statements can I convert for free",
    intro:
      "The free plan supports the same bank statement layouts as paid plans. There is no difference in bank compatibility between plans.",
    columns: 3 as const,
    cards: [
      {
        title: "Strongest support",
        body: "FNB, Standard Bank, and Capitec digital statement PDFs have the strongest extraction quality across all plans.",
      },
      {
        title: "Well supported",
        body: "ABSA and Nedbank digital statement PDFs are well supported with structured extraction and clean preview output.",
      },
      {
        title: "Best-effort support",
        body: "Investec, Discovery Bank, TymeBank, African Bank, and other digital PDFs are handled through best-effort extraction.",
      },
    ],
  },
  {
    eyebrow: "When to upgrade",
    title: "When does a paid plan make sense",
    intro:
      "The free plan is designed for trying the workflow. Paid plans make sense once statement volume becomes regular.",
    columns: 3 as const,
    cards: [
      {
        title: "Regular monthly volume",
        body: "If you process client statements every month, a paid plan gives you higher limits and removes the friction of hitting the free cap.",
      },
      {
        title: "Team collaboration",
        body: "Paid plans support organization workspaces where multiple team members can share projects, conversions, and billing.",
      },
      {
        title: "Project organization",
        body: "While the free plan supports one active project, paid plans let you organize work across multiple clients and engagements.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Is the bank statement converter really free?",
    answer:
      "Yes. The Starter plan lets you convert a limited number of statements each month at no cost. The full workflow — upload, preview, review, and export — is available on the free plan.",
  },
  {
    question: "Do I need a credit card to use the free plan?",
    answer:
      "No. Sign up with an email address and start converting immediately. No credit card is required.",
  },
  {
    question: "What is the difference between free and paid plans?",
    answer:
      "The main difference is volume. Free plans have a lower monthly conversion limit. Paid plans offer higher limits, more projects, and team workspace features.",
  },
  {
    question: "Which banks work on the free plan?",
    answer:
      "All supported banks work on the free plan — FNB, Standard Bank, ABSA, Capitec, Nedbank, and others. Bank compatibility is the same across all plans.",
  },
  {
    question: "Can I export both Excel and CSV on the free plan?",
    answer:
      "Yes. Both export formats are available on every plan, including the free Starter plan.",
  },
  {
    question: "Is this safe to use for client bank statements?",
    answer:
      "Yes. Original PDF files are not stored after conversion. The platform is designed for accounting professionals handling sensitive client financial data.",
  },
] as const;

export default function FreeBankStatementConverterPage() {
  return (
    <SeoSupportPage
      currentHref="/free-bank-statement-converter"
      eyebrow="Free bank statement converter"
      title="Free Bank Statement Converter"
      intro="Convert bank statement PDFs to Excel and CSV for free. Upload a digital statement from any major South African bank, review the extracted data, and download clean working files — no credit card required."
      shortAnswer="Yes. The free Starter plan lets you convert bank statements to Excel and CSV at no cost, with the same review-first workflow available on paid plans."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Start converting bank statements for free"
      ctaBody="Sign up, upload a statement PDF, and export clean Excel or CSV files. No credit card, no commitment."
      relatedLinks={relatedLinks}
    />
  );
}
