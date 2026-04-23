import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Nedbank Bank Statement to Excel",
  description:
    "Convert a Nedbank bank statement to Excel or CSV with a review-first workflow for accountants, bookkeepers, and finance teams in South Africa.",
  path: "/nedbank-bank-statement-to-excel",
  keywords: [
    "Nedbank statement to Excel",
    "convert Nedbank statement to CSV",
    "Nedbank download statement CSV",
    "Nedbank bank statement converter",
    "Nedbank PDF to CSV",
    "Nedbank business statement to Excel",
    "Nedbank PDF to Excel",
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
  {
    href: "/absa-bank-statement-to-excel",
    label: "ABSA to Excel",
  },
  { href: "/fnb-bank-statement-to-excel", label: "FNB to Excel" },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert a Nedbank bank statement to Excel",
    intro:
      "The flow is simple and built for accounting professionals who need a structured review step between the PDF and the final export.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the Nedbank PDF",
        body: "Start with a digital Nedbank bank statement PDF. The converter reads transaction rows directly from the file text.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Check dates, descriptions, amounts, and running balances inside the structured preview before anything is exported.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean file that fits the next step in your workflow — bookkeeping, reconciliation, or accounting software import.",
      },
    ],
  },
  {
    eyebrow: "Nedbank statements",
    title: "Why Nedbank bank statements need structured conversion",
    intro:
      "Nedbank statement PDFs contain detailed transaction rows with dates, descriptions, references, and balances that are difficult to work with inside the locked PDF format. Conversion turns these into spreadsheet-ready data.",
    columns: 3 as const,
    cards: [
      {
        title: "Detailed transaction lines",
        body: "Nedbank statements include transaction descriptions, payment references, and balance columns that accountants need preserved cleanly in Excel.",
      },
      {
        title: "Recurring monthly processing",
        body: "Converting Nedbank statements into structured spreadsheet data eliminates the manual retyping that slows down monthly bookkeeping cycles.",
      },
      {
        title: "Bank reconciliation workflows",
        body: "Previewing extracted rows and balances before export reduces the cleanup time during formal bank reconciliation.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for Nedbank statement conversion",
    intro:
      "The platform supports ongoing accounting work, not just quick one-time downloads.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel export",
        body: "Download a Nedbank bank statement as an Excel file with structured date, description, debit, credit, and balance columns.",
      },
      {
        title: "CSV export",
        body: "Export CSV when your next step involves accounting software import, data cleanup, or simpler tabular processing.",
      },
      {
        title: "Project organization",
        body: "Save converted Nedbank statements into client projects so recurring monthly work stays organized over time.",
      },
    ],
  },
  {
    eyebrow: "Use cases",
    title: "Who converts Nedbank bank statements to Excel",
    intro:
      "Nedbank is one of the four largest banks in South Africa. Accountants, bookkeepers, and finance teams regularly process Nedbank statements across personal and business accounts.",
    columns: 3 as const,
    cards: [
      {
        title: "Bookkeepers with Nedbank clients",
        body: "Monthly Nedbank client statements become significantly easier to process when the rows are already in a clean spreadsheet format.",
      },
      {
        title: "Finance teams preparing reconciliations",
        body: "Matching Nedbank statement rows against ledger entries is faster and less error-prone when the data starts in structured columns.",
      },
      {
        title: "Multi-bank accounting practices",
        body: "Firms that process FNB, Standard Bank, ABSA, Capitec, and Nedbank all benefit from one workflow that handles each bank consistently.",
      },
    ],
  },
  {
    eyebrow: "Formats",
    title: "Supported Nedbank statement formats",
    intro:
      "Not all statement formats produce the same quality output. Here is what works best today.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDF support",
        body: "Digital, text-based Nedbank statement PDFs work best because the transaction text is directly available for extraction.",
      },
      {
        title: "Scanned PDF limitation",
        body: "Scanned or image-only Nedbank statements are supported on a best-effort basis and should be reviewed more carefully.",
      },
      {
        title: "Review before export",
        body: "The preview step lets you inspect every extracted row, check confidence levels, and confirm quality before the file is downloaded.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a Nedbank bank statement to Excel?",
    answer:
      "Upload a digital Nedbank statement PDF, review the extracted transaction rows in the preview, and then download the file as Excel or CSV.",
  },
  {
    question: "Can I export a Nedbank bank statement to CSV?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel, depending on what your accounting workflow requires.",
  },
  {
    question: "Does this work for Nedbank business bank statements?",
    answer:
      "The converter works with digital PDF statements from both Nedbank personal and business accounts, as long as the PDF contains selectable text.",
  },
  {
    question: "Do scanned Nedbank statements work?",
    answer:
      "Digital, text-based Nedbank PDFs work best. Scanned and image-only statements have limited support and should be reviewed carefully before export.",
  },
  {
    question: "Why do accountants convert Nedbank statements to Excel?",
    answer:
      "It eliminates manual retyping and gives accountants structured rows that are immediately useful for bookkeeping, reconciliation, and client review.",
  },
  {
    question: "Can I save converted Nedbank statements by client?",
    answer:
      "Yes. Logged-in users can save conversions into projects and revisit them later, which is valuable for recurring monthly client work.",
  },
  {
    question: "How does the Nedbank CSV download compare to the Excel download?",
    answer:
      "Both formats contain the same extracted data. Excel is better for workbook review and analysis. CSV is better for lighter imports into accounting software or simpler data cleanup.",
  },
] as const;

export default function NedbankBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/nedbank-bank-statement-to-excel"
      eyebrow="Nedbank bank statement to Excel"
      title="Nedbank Bank Statement to Excel"
      intro="Convert a Nedbank bank statement to Excel or CSV. Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping, reconciliation, and client accounting work."
      shortAnswer="Yes. You can convert a Nedbank bank statement to Excel by uploading a digital PDF, reviewing the parsed rows, and downloading a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert Nedbank statements into clean spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn Nedbank bank statement PDFs into structured exports for client bookkeeping, monthly reconciliation, and accounting team workflows."
      relatedLinks={relatedLinks}
    />
  );
}
