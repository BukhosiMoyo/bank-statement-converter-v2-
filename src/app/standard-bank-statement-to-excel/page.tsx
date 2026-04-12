import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Standard Bank Statement to Excel",
  description:
    "Convert a Standard Bank statement to Excel with a clean preview, structured export, and accountant-friendly workflow.",
  path: "/standard-bank-statement-to-excel",
  keywords: [
    "Standard Bank statement to Excel",
    "convert Standard Bank statement to Excel",
    "Standard Bank bank statement to Excel",
    "Standard Bank statement converter",
  ],
  type: "article",
});

const relatedLinks = [
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
    title: "How to convert a Standard Bank statement to Excel",
    intro:
      "The process is designed for accountants who need to move from Standard Bank PDFs to usable spreadsheet rows fast.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the statement PDF",
        body: "Start with a digital Standard Bank statement PDF and send it into the converter.",
      },
      {
        label: "Step 02",
        title: "Review the output",
        body: "Check dates, descriptions, balances, and the extracted transaction list before export.",
      },
      {
        label: "Step 03",
        title: "Export the clean file",
        body: "Download Excel or CSV output for bookkeeping, reconciliation, or spreadsheet analysis.",
      },
    ],
  },
  {
    eyebrow: "Standard Bank statements",
    title: "Why Standard Bank statement conversion matters",
    intro:
      "Standard Bank statements usually contain running balances, transaction descriptions, and multi-line statement data that are awkward to work with inside a raw PDF.",
    columns: 3 as const,
    cards: [
      {
        title: "Running-balance workflows",
        body: "Reviewing extracted rows with balances visible makes it easier to trace cash movement during reconciliations.",
      },
      {
        title: "Client bookkeeping",
        body: "Standard Bank client statements can be turned into spreadsheet-ready data instead of being handled manually line by line.",
      },
      {
        title: "Month-end cleanup",
        body: "A structured export reduces manual cleanup time when statements need to be reviewed each month.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for Standard Bank conversion",
    intro:
      "The product keeps the conversion process practical for accountants and finance teams.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel export",
        body: "Download Standard Bank statement data into a spreadsheet-ready Excel file.",
      },
      {
        title: "CSV output",
        body: "Export CSV when the next step is import, analysis, or spreadsheet cleanup.",
      },
      {
        title: "Projects and history",
        body: "Save converted statements into projects so client work stays organized across repeated periods.",
      },
    ],
  },
  {
    eyebrow: "Formats",
    title: "Supported Standard Bank statement formats",
    intro:
      "Input type affects extraction quality, so the product is clear about what works best.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDF support",
        body: "Digital, text-based Standard Bank statement PDFs are the strongest supported input.",
      },
      {
        title: "Scanned PDF limitation",
        body: "Scanned or image-only Standard Bank statements are still best-effort and may not parse cleanly.",
      },
      {
        title: "Preview before export",
        body: "The workflow keeps a review step in place before the final Excel or CSV download.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a Standard Bank statement to Excel?",
    answer:
      "Upload a digital Standard Bank statement PDF, review the extracted transaction rows, and export the result as Excel.",
  },
  {
    question: "Can I download Standard Bank statements as CSV too?",
    answer:
      "Yes. The same parsed preview can be exported as CSV or Excel.",
  },
  {
    question: "Why do accountants convert Standard Bank statements to Excel?",
    answer:
      "It makes monthly bookkeeping, statement cleanup, and reconciliation easier than working inside a PDF.",
  },
  {
    question: "Does this support Standard Bank statements with running balances?",
    answer:
      "Yes. The review-first workflow is designed to preserve transaction rows and balance context in a structured export.",
  },
  {
    question: "Do scanned Standard Bank PDFs work?",
    answer:
      "Digital, text-based PDFs work best. Scanned and image-only statements are not fully supported yet.",
  },
  {
    question: "Can I keep Standard Bank client statements in projects?",
    answer:
      "Yes. Logged-in users can save conversions into projects and revisit them later.",
  },
] as const;

export default function StandardBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/standard-bank-statement-to-excel"
      eyebrow="Standard Bank statement to Excel"
      title="Standard Bank Statement to Excel"
      intro="Need to convert a Standard Bank statement to Excel? Upload the statement PDF, review the extracted rows, and export a clean file for bookkeeping and reconciliations."
      shortAnswer="Yes. You can convert a Standard Bank statement to Excel by uploading a digital PDF, reviewing the preview, and downloading a structured Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert Standard Bank statement PDFs into usable spreadsheet data"
      ctaBody="Use the converter to turn Standard Bank PDFs into clean outputs for monthly bookkeeping, client cleanup, and statement review."
      relatedLinks={relatedLinks}
    />
  );
}
