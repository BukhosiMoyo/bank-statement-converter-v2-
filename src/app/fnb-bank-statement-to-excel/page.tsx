import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "FNB Bank Statement to Excel",
  description:
    "Convert an FNB bank statement to Excel with a clean review-first workflow for accountants, bookkeepers, and finance teams.",
  path: "/fnb-bank-statement-to-excel",
  keywords: [
    "FNB bank statement to Excel",
    "convert FNB bank statement to Excel",
    "FNB statement to Excel",
    "FNB bank statement converter",
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
    title: "How to convert an FNB bank statement to Excel",
    intro:
      "The flow stays simple so accountants can move from FNB PDF statements to review-ready Excel output quickly.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the FNB PDF",
        body: "Start with a digital FNB bank statement PDF and send it into the converter.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Check dates, descriptions, balances, and references before anything is exported.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean working file for bookkeeping, reconciliation, or spreadsheet cleanup.",
      },
    ],
  },
  {
    eyebrow: "FNB statements",
    title: "Why FNB bank statements need structured conversion",
    intro:
      "FNB statements often include transaction lines with dates, descriptions, references, debits, credits, and running balances that are difficult to work with inside a raw PDF.",
    columns: 3 as const,
    cards: [
      {
        title: "Reference-heavy transaction lines",
        body: "FNB statements can include detailed descriptions and reference numbers that accountants need to preserve in a usable export.",
      },
      {
        title: "Monthly bookkeeping",
        body: "Recurring FNB client statements are easier to review once the rows are turned into spreadsheet-ready data.",
      },
      {
        title: "Reconciliation support",
        body: "Previewing balances and transaction rows before export helps reduce cleanup time during reconciliations.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for FNB statement conversion",
    intro:
      "The workflow is built for accountants handling ongoing client work rather than one-off exports.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel export",
        body: "Download an FNB bank statement as an Excel-ready file with structured transaction columns.",
      },
      {
        title: "CSV export",
        body: "Export CSV when the next step in your workflow is import, cleanup, or spreadsheet processing.",
      },
      {
        title: "Project organization",
        body: "Save converted FNB statements into projects so each client file stays grouped correctly.",
      },
    ],
  },
  {
    eyebrow: "Formats",
    title: "Supported FNB statement formats",
    intro:
      "Input quality matters, so the product is clear about which FNB statements work best today.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDF support",
        body: "Digital, text-based FNB statement PDFs are the strongest input for clean extraction.",
      },
      {
        title: "Scanned PDF limitation",
        body: "Scanned or image-only FNB statements are still best-effort and may need manual follow-up.",
      },
      {
        title: "Review before export",
        body: "The preview step lets you inspect extracted rows before the file is downloaded into Excel or CSV.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert an FNB bank statement to Excel?",
    answer:
      "Upload a digital FNB statement PDF, review the extracted transaction rows, and then download the file as Excel.",
  },
  {
    question: "Can I export an FNB bank statement to CSV as well?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel.",
  },
  {
    question: "Does this work for FNB statements with references and balance lines?",
    answer:
      "Yes. The workflow is designed to keep transaction details such as descriptions, references, and balances in a structured export.",
  },
  {
    question: "Do scanned FNB statements work?",
    answer:
      "Digital, text-based FNB PDFs work best. Scanned and image-only statements are not fully supported yet.",
  },
  {
    question: "Why do accountants convert FNB statements to Excel?",
    answer:
      "It makes monthly bookkeeping, reconciliation, and client statement cleanup faster than working from the raw PDF.",
  },
  {
    question: "Can I save converted FNB statements by client?",
    answer:
      "Yes. Logged-in users can save conversions into projects and revisit them later.",
  },
] as const;

export default function FnbBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/fnb-bank-statement-to-excel"
      eyebrow="FNB bank statement to Excel"
      title="FNB Bank Statement to Excel"
      intro="Need to convert an FNB bank statement to Excel? Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping and reconciliation."
      shortAnswer="Yes. You can convert an FNB bank statement to Excel by uploading a digital PDF, reviewing the parsed rows, and downloading a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert FNB statements into clean spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn FNB bank statement PDFs into structured exports for client work, monthly bookkeeping, and reconciliations."
      relatedLinks={relatedLinks}
    />
  );
}
