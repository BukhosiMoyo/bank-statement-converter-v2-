import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Import Bank Statement to Sage — CSV Preparation Guide",
  description:
    "How to prepare bank statement CSV exports for Sage accounting import. Convert PDF statements, review transaction rows, and export clean CSV for Sage One and Sage Business Cloud.",
  path: "/bank-statement-to-sage",
  keywords: [
    "import bank statement to Sage",
    "convert bank statement for Sage accounting",
    "Sage one bank statement import format",
    "FNB statement to Sage CSV",
    "bank statement CSV for Sage",
    "Sage bank statement converter",
    "convert PDF bank statement for Sage",
  ],
  type: "article",
});

const relatedLinks = [
  { href: "/pdf-bank-statement-to-csv", label: "PDF bank statement to CSV" },
  { href: "/bank-statements-to-excel", label: "Bank statements to Excel" },
  {
    href: "/bank-statement-converter-south-africa",
    label: "South Africa guide",
  },
  {
    href: "/how-accountants-process-bank-statements-faster",
    label: "Faster statement processing",
  },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to prepare bank statement CSV for Sage import",
    intro:
      "Sage accounting software accepts bank transaction data via CSV import. The challenge is getting a clean, reviewed CSV out of a bank statement PDF in the first place.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Convert the bank statement PDF",
        body: "Upload a digital bank statement PDF — FNB, Standard Bank, ABSA, Capitec, Nedbank, or another supported layout — and let the converter extract the transaction rows.",
      },
      {
        label: "Step 02",
        title: "Review rows before export",
        body: "Inspect dates, descriptions, amounts, and balances in the structured preview. Fix any issues before the CSV is generated.",
      },
      {
        label: "Step 03",
        title: "Export CSV for Sage",
        body: "Download the CSV and use it in your Sage import workflow. The structured format gives you a cleaner starting point than manual data capture.",
      },
    ],
  },
  {
    eyebrow: "Why it matters",
    title: "Why bank statement imports matter for Sage workflows",
    intro:
      "Most Sage users in South Africa still receive bank statements as PDFs. Without a clean conversion step, accountants end up retyping transactions or importing messy data that creates cleanup work inside Sage.",
    columns: 3 as const,
    cards: [
      {
        title: "Reduce manual data capture",
        body: "Converting PDF statements to CSV eliminates the need to manually type transaction rows into Sage, saving hours during monthly bookkeeping.",
      },
      {
        title: "Cleaner bank reconciliation",
        body: "When statement data enters Sage in a structured format, bank reconciliation becomes a matching exercise rather than a data cleanup task.",
      },
      {
        title: "Works across South African banks",
        body: "Whether your clients bank with FNB, Standard Bank, ABSA, Capitec, or Nedbank, the same workflow produces a consistent CSV for Sage.",
      },
    ],
  },
  {
    eyebrow: "Sage versions",
    title: "Which Sage products does this workflow support",
    intro:
      "The CSV export from this platform is designed to be a clean, structured starting point for Sage-related import workflows. Specific import steps vary by Sage product.",
    columns: 3 as const,
    cards: [
      {
        title: "Sage Business Cloud Accounting",
        body: "Sage Business Cloud supports bank transaction import via CSV. Use the converted statement as input for the import step.",
      },
      {
        title: "Sage One (legacy)",
        body: "Sage One accepted CSV bank imports before the transition to Sage Business Cloud. The CSV format from this converter is compatible with that workflow.",
      },
      {
        title: "Sage 50 / Sage Pastel",
        body: "Desktop Sage products have their own import formats. The CSV provides a structured starting point that may need column mapping during import.",
      },
    ],
  },
  {
    eyebrow: "Bank-specific workflows",
    title: "Converting specific bank statements for Sage",
    intro:
      "Each South African bank produces statements with slightly different layouts, but the conversion workflow stays consistent.",
    columns: 3 as const,
    cards: [
      {
        title: "FNB statements to Sage CSV",
        body: "FNB digital statements are well-supported. Convert the PDF, review the rows, and export CSV for your Sage import process.",
      },
      {
        title: "Standard Bank statements to Sage CSV",
        body: "Standard Bank statement layouts are handled with structured extraction, giving you clean columns for Sage workflows.",
      },
      {
        title: "ABSA and Nedbank to Sage CSV",
        body: "ABSA and Nedbank digital statements can also be converted to CSV for Sage. Review the preview carefully before exporting.",
      },
    ],
  },
  {
    eyebrow: "Best practices",
    title: "Tips for a cleaner Sage import workflow",
    intro:
      "Getting the CSV right before import saves more time than fixing data inside Sage afterwards.",
    columns: 3 as const,
    cards: [
      {
        title: "Always review before export",
        body: "The preview step lets you catch date formatting issues, missing references, or unusual amounts before the CSV reaches Sage.",
      },
      {
        title: "Use project organization",
        body: "Save converted statements into client projects so you can track which files have been processed and imported for each client.",
      },
      {
        title: "Export CSV, not Excel, for Sage",
        body: "While both formats contain the same data, CSV is usually the better choice for accounting software import workflows.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Can I import a bank statement PDF directly into Sage?",
    answer:
      "No. Sage does not accept PDF files directly. You need to convert the statement to CSV first, then import the CSV into Sage.",
  },
  {
    question: "What CSV format does Sage need for bank imports?",
    answer:
      "Sage generally expects columns for date, description, and amount. The CSV export from this converter provides structured columns that can be mapped during the Sage import process.",
  },
  {
    question: "Does this work for FNB, Standard Bank, and ABSA statements going into Sage?",
    answer:
      "Yes. The converter supports digital PDF statements from all major South African banks. The exported CSV can be used in your Sage import workflow regardless of which bank issued the statement.",
  },
  {
    question: "Is this a direct Sage integration?",
    answer:
      "No. This is a bank statement conversion tool that produces clean CSV output suitable for Sage import. The actual import step happens inside your Sage product.",
  },
  {
    question: "Can I convert multiple client statements for Sage at once?",
    answer:
      "Yes. Batch upload lets you process several statements in one session. Each file keeps its own preview and export, which is useful for monthly bookkeeping across multiple clients.",
  },
  {
    question: "Why should I review the statement before importing to Sage?",
    answer:
      "Reviewing catches date formatting issues, missing descriptions, duplicate rows, or unusual amounts before they enter your accounting system, reducing cleanup work inside Sage.",
  },
] as const;

export default function BankStatementToSagePage() {
  return (
    <SeoSupportPage
      currentHref="/bank-statement-to-sage"
      eyebrow="Bank statement to Sage"
      title="Import Bank Statement to Sage"
      intro="Prepare clean bank statement CSV exports for Sage accounting software. Convert PDF statements from FNB, Standard Bank, ABSA, Nedbank, and Capitec, review the data, and export CSV ready for Sage import."
      shortAnswer="Convert the bank statement PDF to CSV using a review-first workflow, then import the clean CSV into Sage Business Cloud, Sage One, or Sage 50."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Prepare cleaner bank statement CSV for Sage import"
      ctaBody="Use the review-first conversion workflow to turn bank statement PDFs into structured CSV exports that make Sage import faster and more reliable."
      relatedLinks={relatedLinks}
    />
  );
}
