import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ABSA Bank Statement to Excel",
  description:
    "Convert an ABSA bank statement to Excel or CSV with a review-first workflow for accountants, bookkeepers, and finance teams in South Africa.",
  path: "/absa-bank-statement-to-excel",
  keywords: [
    "ABSA bank statement to Excel",
    "convert ABSA statement to CSV",
    "ABSA export statement to CSV",
    "ABSA bank statement converter",
    "ABSA PDF to CSV converter",
    "ABSA business bank statement to CSV",
    "ABSA PDF to Excel",
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
    href: "/standard-bank-statement-to-excel",
    label: "Standard Bank to Excel",
  },
  { href: "/fnb-bank-statement-to-excel", label: "FNB to Excel" },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert an ABSA bank statement to Excel",
    intro:
      "The workflow is built so accountants can move from an ABSA PDF statement to structured Excel output with a proper review step in between.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the ABSA PDF",
        body: "Start with a digital ABSA bank statement PDF. The converter reads the transaction rows directly from the file text.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Check dates, descriptions, amounts, and running balances inside the preview before anything is exported.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean working file that fits the next step in your accounting workflow, whether that is bookkeeping, reconciliation, or client review.",
      },
    ],
  },
  {
    eyebrow: "ABSA statements",
    title: "Why ABSA bank statements need structured conversion",
    intro:
      "ABSA statement PDFs include transaction detail lines, references, debit and credit columns, and running balances that are difficult to use directly from the PDF. Structured conversion solves this by turning locked PDF rows into spreadsheet-ready data.",
    columns: 3 as const,
    cards: [
      {
        title: "Complex transaction descriptions",
        body: "ABSA statements often carry detailed descriptions and payment references that accountants need to preserve intact during conversion.",
      },
      {
        title: "Monthly client bookkeeping",
        body: "Converting ABSA statements into Excel makes recurring monthly bookkeeping faster than retyping or copying from the PDF.",
      },
      {
        title: "Reconciliation preparation",
        body: "Reviewing extracted rows and balances before export reduces cleanup work during bank reconciliations.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for ABSA statement conversion",
    intro:
      "The platform is designed for recurring accounting work, not just one-off downloads.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel export",
        body: "Download an ABSA bank statement as an Excel file with structured date, description, amount, and balance columns.",
      },
      {
        title: "CSV export",
        body: "Export CSV when the next workflow step is import into accounting software, cleanup, or spreadsheet processing.",
      },
      {
        title: "Project organization",
        body: "Save converted ABSA statements into client projects so recurring monthly work stays grouped correctly.",
      },
    ],
  },
  {
    eyebrow: "Use cases",
    title: "Who converts ABSA bank statements to Excel",
    intro:
      "ABSA is one of the largest banks in South Africa. Accountants, bookkeepers, and internal finance teams all encounter ABSA statements in their regular workflows.",
    columns: 3 as const,
    cards: [
      {
        title: "Bookkeepers handling ABSA clients",
        body: "Monthly ABSA client statements are easier to process once the rows are in a structured spreadsheet rather than locked inside a PDF.",
      },
      {
        title: "Finance teams doing reconciliation",
        body: "Matching ABSA statement rows to ledger entries is faster when the data starts in a clean, sortable format.",
      },
      {
        title: "Firms with mixed-bank portfolios",
        body: "Practices that handle FNB, Standard Bank, Capitec, and ABSA clients benefit from one workflow that converts all of them.",
      },
    ],
  },
  {
    eyebrow: "Formats",
    title: "Supported ABSA statement formats",
    intro:
      "Input quality matters, so the product is transparent about which ABSA statement formats work best today.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDF support",
        body: "Digital, text-based ABSA statement PDFs offer the best extraction quality because the text can be read directly.",
      },
      {
        title: "Scanned PDF limitation",
        body: "Scanned or image-only ABSA statements are more limited and should be treated as best-effort input with closer review.",
      },
      {
        title: "Review before export",
        body: "The preview step lets you inspect rows, check confidence levels, and confirm the output before it leaves the platform.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert an ABSA bank statement to Excel?",
    answer:
      "Upload a digital ABSA statement PDF, review the extracted transaction rows in the preview, and then download the file as Excel or CSV.",
  },
  {
    question: "Can I export an ABSA bank statement to CSV?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel, depending on what your next workflow step requires.",
  },
  {
    question: "Does this work for ABSA business bank statements?",
    answer:
      "The converter works with digital PDF statements from ABSA personal and business accounts. The key requirement is that the PDF contains selectable text rather than scanned images.",
  },
  {
    question: "Do scanned ABSA statements work?",
    answer:
      "Digital, text-based ABSA PDFs work best. Scanned and image-only statements are not fully supported and should be reviewed more carefully before export.",
  },
  {
    question: "Why do accountants convert ABSA statements to Excel?",
    answer:
      "It makes monthly bookkeeping, bank reconciliation, and client statement review faster than working from the raw PDF or retyping transaction data into a spreadsheet.",
  },
  {
    question: "Can I save converted ABSA statements by client?",
    answer:
      "Yes. Logged-in users can save conversions into projects and revisit them later, which is useful for recurring monthly client work.",
  },
  {
    question: "Can I convert multiple ABSA statements at once?",
    answer:
      "Yes. Batch upload lets you process several ABSA statements in one session while still reviewing each file separately before export.",
  },
] as const;

export default function AbsaBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/absa-bank-statement-to-excel"
      eyebrow="ABSA bank statement to Excel"
      title="ABSA Bank Statement to Excel"
      intro="Convert an ABSA bank statement to Excel or CSV. Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping, reconciliation, and client work."
      shortAnswer="Yes. You can convert an ABSA bank statement to Excel by uploading a digital PDF, reviewing the parsed rows, and downloading a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert ABSA statements into clean spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn ABSA bank statement PDFs into structured exports for client bookkeeping, monthly reconciliation, and accounting team workflows."
      relatedLinks={relatedLinks}
    />
  );
}
