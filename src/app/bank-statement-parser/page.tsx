import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Bank Statement Parser — Extract Transactions from PDF",
  description:
    "Parse bank statement PDFs and extract structured transaction data. Automated extraction for FNB, Standard Bank, ABSA, Capitec, and Nedbank statements with review before export.",
  path: "/bank-statement-parser",
  keywords: [
    "bank statement parser",
    "automated bank statement extraction",
    "extract transactions from PDF bank statement",
    "bank statement data extraction",
    "parse bank statement PDF",
    "bank statement OCR to Excel",
    "PDF transaction extractor",
  ],
  type: "article",
});

const relatedLinks = [
  { href: "/bank-statements-to-excel", label: "Bank statements to Excel" },
  { href: "/pdf-bank-statement-to-csv", label: "PDF bank statement to CSV" },
  {
    href: "/can-you-convert-a-scanned-bank-statement-to-excel",
    label: "Scanned statements",
  },
  {
    href: "/bank-statement-converter-south-africa",
    label: "South Africa guide",
  },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How the bank statement parser extracts transaction data",
    intro:
      "The parser reads digital bank statement PDFs and extracts structured transaction rows — dates, descriptions, amounts, and balances — into a reviewable preview before export.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the bank statement PDF",
        body: "The parser accepts digital PDF statements from FNB, Standard Bank, ABSA, Capitec, Nedbank, and other South African banks.",
      },
      {
        label: "Step 02",
        title: "Automated extraction",
        body: "The parser identifies transaction rows, separates columns, and structures the data into a clean preview that you can review before exporting.",
      },
      {
        label: "Step 03",
        title: "Review and export",
        body: "Inspect every extracted row, check confidence levels, and download as Excel or CSV when the data looks ready for accounting work.",
      },
    ],
  },
  {
    eyebrow: "How parsing works",
    title: "What the parser does with your bank statement",
    intro:
      "Bank statement parsing is the process of reading a PDF document and converting the visual layout of transactions into structured data columns that can be used in spreadsheets and accounting software.",
    columns: 3 as const,
    cards: [
      {
        title: "Text extraction from digital PDFs",
        body: "The parser reads the text layer of digital PDFs directly. This is faster and more accurate than OCR because the text is already present in the document.",
      },
      {
        title: "Layout detection",
        body: "Different banks use different statement layouts. The parser identifies column positions, header rows, and transaction line patterns specific to each bank.",
      },
      {
        title: "Structured output",
        body: "Raw PDF text becomes structured rows with separate columns for date, description, reference, debit, credit, and running balance.",
      },
    ],
  },
  {
    eyebrow: "Digital vs scanned",
    title: "Digital PDF parsing versus OCR",
    intro:
      "Not all bank statement PDFs are created equal. The type of PDF significantly affects parsing quality.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDFs (strongest support)",
        body: "Digital, text-based PDFs from online banking portals work best. The text is already machine-readable, so extraction is fast and accurate.",
      },
      {
        title: "Scanned PDFs (limited support)",
        body: "Scanned or image-only PDFs require OCR processing, which introduces more errors. These are supported on a best-effort basis.",
      },
      {
        title: "Why digital PDFs matter",
        body: "When accountants download statements directly from online banking, the resulting PDFs are digital. These produce the best parsing results.",
      },
    ],
  },
  {
    eyebrow: "Supported banks",
    title: "Bank-specific parsing support",
    intro:
      "The parser has been optimized for the most common South African bank statement layouts.",
    columns: 3 as const,
    cards: [
      {
        title: "Strongest support",
        body: "FNB, Standard Bank, and Capitec digital statements are the best-supported layouts with the highest extraction accuracy.",
      },
      {
        title: "Well supported",
        body: "ABSA and Nedbank digital statements are well supported with structured parsing and clean output.",
      },
      {
        title: "Best-effort support",
        body: "Investec, Discovery Bank, TymeBank, and African Bank statements are parsed through best-effort extraction. Review the preview carefully.",
      },
    ],
  },
  {
    eyebrow: "Use cases",
    title: "Who uses a bank statement parser",
    intro:
      "Bank statement parsing is most valuable for professionals who process statements repeatedly as part of their work.",
    columns: 3 as const,
    cards: [
      {
        title: "Accountants and bookkeepers",
        body: "Monthly client bookkeeping is faster when statement data arrives as structured rows rather than locked PDF pages.",
      },
      {
        title: "Finance teams",
        body: "Internal finance teams use parsed statement data for reconciliation, cash analysis, and management reporting.",
      },
      {
        title: "Tax practitioners",
        body: "Tax professionals process client statements for tax return preparation and supporting documentation.",
      },
    ],
  },
];

const faqs = [
  {
    question: "What is a bank statement parser?",
    answer:
      "A bank statement parser is a tool that reads bank statement PDFs and extracts the transaction data into a structured format like Excel or CSV, making it usable for accounting and analysis.",
  },
  {
    question: "Does this use OCR to read bank statements?",
    answer:
      "For digital PDFs, the parser reads the text layer directly — no OCR needed. For scanned or image-only PDFs, OCR is attempted on a best-effort basis.",
  },
  {
    question: "How accurate is the bank statement parser?",
    answer:
      "Accuracy depends on the input quality. Digital PDFs from supported banks like FNB, Standard Bank, and Capitec produce the best results. The preview step lets you verify accuracy before exporting.",
  },
  {
    question: "Can I parse multiple bank statements at once?",
    answer:
      "Yes. Batch upload lets you parse several statements in one session while reviewing each file separately.",
  },
  {
    question: "What data does the parser extract?",
    answer:
      "The parser extracts transaction dates, descriptions, references, debit and credit amounts, and running balances into structured columns.",
  },
  {
    question: "Is this automated or manual?",
    answer:
      "The extraction is automated. You upload the PDF and the parser produces a structured preview. The review step is manual, by design, so you can confirm data quality before export.",
  },
] as const;

export default function BankStatementParserPage() {
  return (
    <SeoSupportPage
      currentHref="/bank-statement-parser"
      eyebrow="Bank statement parser"
      title="Bank Statement Parser"
      intro="Parse bank statement PDFs and extract structured transaction data. Upload a digital statement, let the parser identify and separate transaction rows, and export clean Excel or CSV for accounting work."
      shortAnswer="The parser reads digital bank statement PDFs and extracts structured transaction data — dates, descriptions, amounts, and balances — into a reviewable preview before export to Excel or CSV."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Parse bank statements into structured, export-ready data"
      ctaBody="Upload a bank statement PDF, let the parser extract the transaction rows, review the output, and export clean data for accounting workflows."
      relatedLinks={relatedLinks}
    />
  );
}
