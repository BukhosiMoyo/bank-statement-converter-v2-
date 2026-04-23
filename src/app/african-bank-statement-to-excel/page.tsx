import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "African Bank Statement to Excel",
  description:
    "Convert an African Bank statement to Excel or CSV with a review-first workflow for accountants, bookkeepers, and finance teams.",
  path: "/african-bank-statement-to-excel",
  keywords: [
    "African Bank statement to Excel",
    "convert African Bank statement",
    "African Bank statement converter",
    "African Bank PDF to Excel",
    "African Bank statement CSV",
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
  { href: "/capitec-bank-statement-to-excel", label: "Capitec to Excel" },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert an African Bank statement to Excel",
    intro:
      "The workflow gives accountants a structured review step between the African Bank PDF and the final spreadsheet export.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the African Bank PDF",
        body: "Start with a digital African Bank statement PDF. The converter reads the transaction rows from the document text.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Inspect dates, descriptions, amounts, and balances in the preview before exporting.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean file for bookkeeping, reconciliation, or accounting software import.",
      },
    ],
  },
  {
    eyebrow: "African Bank statements",
    title: "Why African Bank statements need structured conversion",
    intro:
      "African Bank serves a significant customer base in South Africa. Accountants and bookkeepers working with African Bank clients need to convert statement PDFs into usable spreadsheet data.",
    columns: 3 as const,
    cards: [
      {
        title: "Structured data from PDFs",
        body: "African Bank statement PDFs contain transaction details that become more useful once converted to spreadsheet columns.",
      },
      {
        title: "Best-effort extraction",
        body: "African Bank layouts are handled through best-effort extraction. The preview step is important for confirming that rows are complete before export.",
      },
      {
        title: "Multi-bank client portfolios",
        body: "Accountants who handle African Bank alongside other South African bank clients can use the same conversion workflow across all banks.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for African Bank statement conversion",
    intro:
      "The platform supports multi-bank accounting workflows with consistent review and export controls.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel and CSV export",
        body: "Download African Bank statement data as Excel for workbook review or CSV for accounting software import.",
      },
      {
        title: "Review before export",
        body: "Inspect all extracted rows and confirm data quality before the file is downloaded.",
      },
      {
        title: "Project organization",
        body: "Save converted African Bank statements into client projects for organized recurring work.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert an African Bank statement to Excel?",
    answer:
      "Upload a digital African Bank statement PDF, review the extracted rows in the preview, and download the file as Excel or CSV.",
  },
  {
    question: "Can I export an African Bank statement to CSV?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel.",
  },
  {
    question: "How well does this work with African Bank statement layouts?",
    answer:
      "African Bank statements are handled through best-effort extraction. The preview step is important for confirming row quality before export.",
  },
  {
    question: "Can I use this for other banks alongside African Bank?",
    answer:
      "Yes. The same platform handles FNB, Standard Bank, ABSA, Capitec, Nedbank, and other South African bank statements.",
  },
] as const;

export default function AfricanBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/african-bank-statement-to-excel"
      eyebrow="African Bank statement to Excel"
      title="African Bank Statement to Excel"
      intro="Convert an African Bank statement to Excel or CSV. Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping and accounting work."
      shortAnswer="Yes. Upload a digital African Bank statement PDF, review the parsed rows, and download a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert African Bank statements into spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn African Bank statement PDFs into structured exports for client bookkeeping and reconciliation."
      relatedLinks={relatedLinks}
    />
  );
}
