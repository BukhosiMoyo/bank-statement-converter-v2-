import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Import Bank Statement to QuickBooks — CSV Preparation Guide",
  description:
    "How to prepare bank statement CSV exports for QuickBooks import. Convert PDF statements from South African banks, review transactions, and export clean CSV for QuickBooks Online.",
  path: "/bank-statement-to-quickbooks",
  keywords: [
    "import bank statement to QuickBooks",
    "QuickBooks bank statement conversion",
    "ABSA statement for QuickBooks Online",
    "convert PDF bank statement to QBO",
    "QuickBooks bank statement CSV",
    "QuickBooks bank import South Africa",
  ],
  type: "article",
});

const relatedLinks = [
  { href: "/bank-statement-to-xero", label: "Bank statement to Xero" },
  { href: "/bank-statement-to-sage", label: "Bank statement to Sage" },
  { href: "/pdf-bank-statement-to-csv", label: "PDF bank statement to CSV" },
  {
    href: "/bank-statement-converter-south-africa",
    label: "South Africa guide",
  },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to prepare bank statement CSV for QuickBooks import",
    intro:
      "QuickBooks Online and QuickBooks Desktop accept bank transaction data through CSV import. The first step is getting a clean CSV from your bank statement PDF.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Convert the bank statement PDF",
        body: "Upload a digital bank statement PDF from FNB, Standard Bank, ABSA, Capitec, Nedbank, or another supported bank layout.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Inspect dates, descriptions, amounts, and balances in the preview. Catch formatting issues before the CSV is generated.",
      },
      {
        label: "Step 03",
        title: "Export CSV for QuickBooks",
        body: "Download the CSV and import it into QuickBooks. The structured format gives you cleaner data than manual entry or unreviewed conversion.",
      },
    ],
  },
  {
    eyebrow: "Why it matters",
    title: "Why clean CSV matters for QuickBooks bank imports",
    intro:
      "QuickBooks works best when bank transaction data arrives in a structured, reviewed format. Importing messy or unchecked CSV data creates categorisation problems and reconciliation errors.",
    columns: 3 as const,
    cards: [
      {
        title: "Skip manual transaction entry",
        body: "Converting PDF statements to CSV removes the need to manually key in every transaction row, saving significant time during monthly bookkeeping.",
      },
      {
        title: "Fewer categorisation errors",
        body: "When descriptions and amounts are clean before import, QuickBooks auto-categorisation works more accurately and requires less manual correction.",
      },
      {
        title: "Works with South African bank statements",
        body: "Whether your clients use FNB, Standard Bank, ABSA, Capitec, or Nedbank, the same workflow produces CSV ready for QuickBooks.",
      },
    ],
  },
  {
    eyebrow: "QuickBooks versions",
    title: "Which QuickBooks products does this workflow support",
    intro:
      "The CSV export is designed to be a clean starting point for any QuickBooks product that accepts bank transaction imports.",
    columns: 3 as const,
    cards: [
      {
        title: "QuickBooks Online",
        body: "QuickBooks Online supports CSV bank import through the Banking section. The converted CSV provides structured columns that map to the import requirements.",
      },
      {
        title: "QuickBooks Desktop",
        body: "QuickBooks Desktop also accepts CSV and QBO format imports. The CSV from this converter can be used as the input data for desktop import workflows.",
      },
      {
        title: "QBO format considerations",
        body: "While this tool exports standard CSV rather than QBO format, the structured data is a clean starting point for tools that convert CSV to QBO if needed.",
      },
    ],
  },
  {
    eyebrow: "Bank-specific workflows",
    title: "Converting specific bank statements for QuickBooks",
    intro:
      "Every South African bank produces statements with slightly different layouts, but the conversion workflow remains consistent across all of them.",
    columns: 3 as const,
    cards: [
      {
        title: "FNB statements for QuickBooks",
        body: "FNB digital statements are well-supported. Convert the PDF, review the rows, and export CSV for your QuickBooks import.",
      },
      {
        title: "ABSA statements for QuickBooks Online",
        body: "ABSA digital statement PDFs can be converted to structured CSV that works with QuickBooks Online bank import.",
      },
      {
        title: "Standard Bank and others for QuickBooks",
        body: "Standard Bank, Capitec, and Nedbank digital PDFs follow the same workflow — convert, review, and export CSV for QuickBooks.",
      },
    ],
  },
  {
    eyebrow: "Best practices",
    title: "Tips for a cleaner QuickBooks import workflow",
    intro:
      "Preparation before import prevents cleanup work inside QuickBooks.",
    columns: 3 as const,
    cards: [
      {
        title: "Review every statement before export",
        body: "The preview step catches date issues, missing descriptions, and unusual amounts before the CSV reaches QuickBooks.",
      },
      {
        title: "Organise by client project",
        body: "Save converted statements into client projects so you can track which files have been processed and imported each month.",
      },
      {
        title: "Use CSV for import, Excel for review",
        body: "Export CSV when the next step is QuickBooks import. Export Excel when you need to review or analyse the data in a spreadsheet first.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Can I import a bank statement PDF directly into QuickBooks?",
    answer:
      "No. QuickBooks does not accept PDF files directly. Convert the statement to CSV first, then import through QuickBooks' bank transaction import feature.",
  },
  {
    question: "What CSV format does QuickBooks need?",
    answer:
      "QuickBooks generally expects columns for date, description, and amount. The CSV from this converter provides these in a structured format that can be mapped during import.",
  },
  {
    question: "Does this work for ABSA statements going into QuickBooks Online?",
    answer:
      "Yes. Digital ABSA statement PDFs can be converted to CSV and imported into QuickBooks Online through the Banking section.",
  },
  {
    question: "Is this a direct QuickBooks integration?",
    answer:
      "No. This tool produces clean CSV output suitable for QuickBooks import. The actual import step happens inside your QuickBooks product.",
  },
  {
    question: "Can I convert the CSV to QBO format?",
    answer:
      "This tool exports standard CSV. If you need QBO format specifically, the structured CSV is a clean starting point for third-party CSV-to-QBO converters.",
  },
  {
    question: "Why review statements before importing to QuickBooks?",
    answer:
      "Reviewing prevents date errors, missing descriptions, and incorrect amounts from entering QuickBooks, which reduces categorisation mistakes and reconciliation issues.",
  },
] as const;

export default function BankStatementToQuickBooksPage() {
  return (
    <SeoSupportPage
      currentHref="/bank-statement-to-quickbooks"
      eyebrow="Bank statement to QuickBooks"
      title="Import Bank Statement to QuickBooks"
      intro="Prepare clean bank statement CSV exports for QuickBooks. Convert PDF statements from FNB, Standard Bank, ABSA, Nedbank, and Capitec, review the data, and export CSV ready for QuickBooks import."
      shortAnswer="Convert the bank statement PDF to CSV using a review-first workflow, then import the clean CSV into QuickBooks Online or QuickBooks Desktop."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Prepare cleaner bank statement CSV for QuickBooks import"
      ctaBody="Use the review-first conversion workflow to turn bank statement PDFs into structured CSV exports that make QuickBooks bank imports faster and more reliable."
      relatedLinks={relatedLinks}
    />
  );
}
