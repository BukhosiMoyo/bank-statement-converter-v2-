import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Investec Bank Statement to Excel",
  description:
    "Convert an Investec bank statement to Excel or CSV with a review-first workflow for accountants, bookkeepers, and finance teams.",
  path: "/investec-bank-statement-to-excel",
  keywords: [
    "Investec bank statement to CSV",
    "convert Investec statement to Excel",
    "Investec bank statement converter",
    "Investec PDF to Excel",
    "Investec statement export",
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
  { href: "/absa-bank-statement-to-excel", label: "ABSA to Excel" },
  { href: "/fnb-bank-statement-to-excel", label: "FNB to Excel" },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert an Investec bank statement to Excel",
    intro:
      "The workflow gives accountants a structured review step between the Investec PDF and the final export file.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the Investec PDF",
        body: "Start with a digital Investec bank statement PDF. The converter reads the transaction rows directly from the document text.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Check dates, descriptions, amounts, and balances inside the preview before exporting anything.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean working file for bookkeeping, reconciliation, or accounting software import.",
      },
    ],
  },
  {
    eyebrow: "Investec statements",
    title: "Why Investec bank statements need structured conversion",
    intro:
      "Investec statement PDFs include detailed transaction information that is difficult to work with directly. Converting to Excel or CSV makes the data usable for accounting workflows.",
    columns: 3 as const,
    cards: [
      {
        title: "Professional banking detail",
        body: "Investec statements often carry detailed transaction descriptions and references that need to be preserved during conversion.",
      },
      {
        title: "Wealth and business accounts",
        body: "Accountants handling Investec private banking or business clients benefit from structured exports for month-end bookkeeping and reconciliation.",
      },
      {
        title: "Best-effort extraction",
        body: "Investec layouts are handled through best-effort extraction. The preview step is especially important for confirming row quality before export.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for Investec statement conversion",
    intro:
      "The platform supports ongoing accounting work across multiple banks and clients.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel and CSV export",
        body: "Download Investec statement data as Excel for workbook review or CSV for accounting software import.",
      },
      {
        title: "Review before export",
        body: "The preview step lets you inspect all extracted rows and confirm the data before the file is downloaded.",
      },
      {
        title: "Project organization",
        body: "Save converted Investec statements into client projects for organized recurring work.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert an Investec bank statement to Excel?",
    answer:
      "Upload a digital Investec statement PDF, review the extracted transaction rows in the preview, and then download the file as Excel or CSV.",
  },
  {
    question: "Can I export an Investec statement to CSV?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel.",
  },
  {
    question: "How well does this work with Investec statement layouts?",
    answer:
      "Investec statements are handled through best-effort extraction. The preview step is important for confirming that the extracted rows are complete and accurate before export.",
  },
  {
    question: "Do scanned Investec statements work?",
    answer:
      "Digital, text-based PDFs work best. Scanned statements have limited support and should be reviewed carefully.",
  },
  {
    question: "Can I save converted Investec statements by client?",
    answer:
      "Yes. Logged-in users can save conversions into projects for organized client work.",
  },
] as const;

export default function InvestecBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/investec-bank-statement-to-excel"
      eyebrow="Investec bank statement to Excel"
      title="Investec Bank Statement to Excel"
      intro="Convert an Investec bank statement to Excel or CSV. Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping and accounting workflows."
      shortAnswer="Yes. Upload a digital Investec statement PDF, review the parsed rows, and download a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert Investec statements into spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn Investec bank statement PDFs into structured exports for client bookkeeping and reconciliation."
      relatedLinks={relatedLinks}
    />
  );
}
