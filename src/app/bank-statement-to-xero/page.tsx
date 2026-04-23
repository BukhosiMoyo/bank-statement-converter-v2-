import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Import Bank Statement to Xero — CSV Preparation Guide",
  description:
    "How to prepare bank statement CSV exports for Xero import. Convert PDF statements from South African banks, review transaction rows, and export clean CSV for Xero bank feeds.",
  path: "/bank-statement-to-xero",
  keywords: [
    "import bank statement to Xero",
    "convert FNB statement for Xero",
    "Standard Bank CSV for Xero",
    "Xero CSV bank statement template",
    "bank statement Xero workflow",
    "Xero bank statement converter",
    "convert PDF bank statement for Xero",
  ],
  type: "article",
});

const relatedLinks = [
  { href: "/bank-statement-to-sage", label: "Bank statement to Sage" },
  { href: "/pdf-bank-statement-to-csv", label: "PDF bank statement to CSV" },
  { href: "/bank-statements-to-excel", label: "Bank statements to Excel" },
  {
    href: "/bank-statement-converter-south-africa",
    label: "South Africa guide",
  },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to prepare bank statement CSV for Xero import",
    intro:
      "Xero accepts bank transaction data through CSV import and manual bank feeds. The challenge is producing a clean, reviewed CSV from a bank statement PDF that Xero can work with.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Convert the bank statement PDF",
        body: "Upload a digital bank statement PDF from FNB, Standard Bank, ABSA, Capitec, Nedbank, or another supported bank and let the converter extract the rows.",
      },
      {
        label: "Step 02",
        title: "Review rows before export",
        body: "Inspect dates, descriptions, amounts, and balances in the structured preview. Catch any issues before the CSV is generated.",
      },
      {
        label: "Step 03",
        title: "Export CSV for Xero",
        body: "Download the CSV and use it in your Xero import workflow. The structured output gives you cleaner data than manual entry.",
      },
    ],
  },
  {
    eyebrow: "Why it matters",
    title: "Why bank statement CSV preparation matters for Xero",
    intro:
      "Many South African firms use Xero but still receive bank statements as PDFs. Without a proper conversion step, accountants end up manually typing transactions or importing data that creates reconciliation problems.",
    columns: 3 as const,
    cards: [
      {
        title: "Eliminate manual data entry",
        body: "Converting PDF statements to CSV removes the need to retype transaction rows into Xero line by line, saving hours during monthly processing.",
      },
      {
        title: "Cleaner reconciliation in Xero",
        body: "When statement data enters Xero as structured CSV, bank reconciliation becomes a matching exercise rather than a data cleanup task.",
      },
      {
        title: "Consistent across all SA banks",
        body: "Whether your clients bank with FNB, Standard Bank, ABSA, Capitec, or Nedbank, the same conversion workflow produces CSV ready for Xero.",
      },
    ],
  },
  {
    eyebrow: "Bank-specific workflows",
    title: "Converting specific bank statements for Xero",
    intro:
      "Each South African bank produces statements with different layouts, but the conversion-to-Xero workflow stays consistent.",
    columns: 3 as const,
    cards: [
      {
        title: "FNB statements for Xero",
        body: "FNB digital statement PDFs are well-supported. Convert the PDF, review the rows, and export CSV for your Xero import.",
      },
      {
        title: "Standard Bank statements for Xero",
        body: "Standard Bank statement layouts produce clean structured extraction that maps well to Xero CSV import columns.",
      },
      {
        title: "ABSA, Nedbank, and Capitec for Xero",
        body: "Digital statements from ABSA, Nedbank, and Capitec can also be converted and exported as CSV for Xero-oriented workflows.",
      },
    ],
  },
  {
    eyebrow: "Xero import",
    title: "What Xero expects from a bank statement CSV",
    intro:
      "Understanding Xero's CSV requirements helps you avoid import errors and manual corrections.",
    columns: 3 as const,
    cards: [
      {
        title: "Date, description, and amount columns",
        body: "Xero generally needs columns for transaction date, description or payee, and the amount. The converter's CSV output provides these in a structured format.",
      },
      {
        title: "Review prevents import errors",
        body: "Checking the preview before export catches date formatting issues, unusual amounts, and missing descriptions before they reach Xero.",
      },
      {
        title: "CSV format, not Excel",
        body: "For Xero import, CSV is usually the right choice. Excel is better when the next step is workbook review or analysis rather than software import.",
      },
    ],
  },
  {
    eyebrow: "Best practices",
    title: "Tips for a cleaner Xero import workflow",
    intro:
      "Getting the CSV right before import saves more time than fixing data inside Xero after the fact.",
    columns: 3 as const,
    cards: [
      {
        title: "Always review before export",
        body: "The preview step lets you catch issues with dates, descriptions, and amounts before the CSV reaches Xero.",
      },
      {
        title: "Use project organization",
        body: "Save converted statements into client projects so you can track which files have been processed and imported each month.",
      },
      {
        title: "Bank feed alternative",
        body: "When direct bank feeds are unavailable or unreliable, CSV import from converted statements provides a practical fallback workflow.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Can I import a bank statement PDF directly into Xero?",
    answer:
      "No. Xero does not accept PDF files for bank imports. You need to convert the statement to CSV first, then import the CSV through Xero's bank transaction import feature.",
  },
  {
    question: "What CSV format does Xero need for bank statement import?",
    answer:
      "Xero expects columns for date, description, and amount at minimum. The CSV export from this converter provides structured columns that can be mapped during Xero import.",
  },
  {
    question: "Does this work for FNB and Standard Bank statements going into Xero?",
    answer:
      "Yes. The converter supports digital PDF statements from all major South African banks. The exported CSV works for Xero import regardless of which bank issued the statement.",
  },
  {
    question: "Is this a direct Xero integration?",
    answer:
      "No. This is a bank statement conversion tool that produces clean CSV output suitable for Xero import. The actual import step happens inside Xero.",
  },
  {
    question: "Can I use this as an alternative to Xero bank feeds?",
    answer:
      "Yes. When direct bank feeds are unavailable, unreliable, or not supported for a specific account, converting PDF statements to CSV and importing into Xero is a practical alternative.",
  },
  {
    question: "Why should I review the statement before importing to Xero?",
    answer:
      "Reviewing catches date formatting issues, missing descriptions, and unusual amounts before they enter your accounting system, reducing reconciliation problems inside Xero.",
  },
] as const;

export default function BankStatementToXeroPage() {
  return (
    <SeoSupportPage
      currentHref="/bank-statement-to-xero"
      eyebrow="Bank statement to Xero"
      title="Import Bank Statement to Xero"
      intro="Prepare clean bank statement CSV exports for Xero accounting software. Convert PDF statements from FNB, Standard Bank, ABSA, Nedbank, and Capitec, review the data, and export CSV ready for Xero import."
      shortAnswer="Convert the bank statement PDF to CSV using a review-first workflow, then import the clean CSV into Xero through the bank transaction import feature."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Prepare cleaner bank statement CSV for Xero import"
      ctaBody="Use the review-first conversion workflow to turn bank statement PDFs into structured CSV exports that make Xero bank imports faster and more reliable."
      relatedLinks={relatedLinks}
    />
  );
}
