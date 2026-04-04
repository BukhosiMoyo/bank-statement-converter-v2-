import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";

export const metadata: Metadata = {
  title: "PDF Bank Statement to CSV",
  description:
    "Convert a PDF bank statement to CSV with a clear preview, review, and export workflow. Built for accountants and finance teams handling digital bank statements.",
  keywords: [
    "pdf bank statement to csv",
    "pdf bank statement",
    "bank statement pdf",
    "convert pdf bank statement to csv",
    "bank statement pdf to excel",
  ],
  openGraph: {
    title: "PDF Bank Statement to CSV",
    description:
      "Upload a bank statement PDF, review extracted rows, and export a clean CSV or Excel-ready file.",
    type: "article",
    siteName: "Bank Statement Converter",
  },
};

const sections = [
  {
    eyebrow: "Workflow",
    title: "Step-by-step PDF bank statement to CSV workflow",
    intro:
      "The product is designed so you can move from PDF upload to clean CSV output without losing visibility over the extracted rows.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the bank statement PDF",
        body: "Start with a digital PDF bank statement and send it into the converter from the upload surface.",
      },
      {
        label: "Step 02",
        title: "Review the transaction preview",
        body: "Inspect dates, descriptions, balances, and references before the export leaves the product.",
      },
      {
        label: "Step 03",
        title: "Download clean CSV",
        body: "Export a structured CSV for imports, spreadsheet cleanup, or follow-on work in Excel.",
      },
    ],
  },
  {
    eyebrow: "Review",
    title: "Preview, review, and export before the file leaves the app",
    intro:
      "This matters when you are cleaning financial data and need confidence in what was extracted from the statement PDF.",
    columns: 3 as const,
    cards: [
      {
        title: "Preview transaction rows",
        body: "See the extracted output before download instead of exporting a blind raw dump.",
      },
      {
        title: "Review low-confidence rows",
        body: "Use confidence cues and source-page references to inspect rows that need closer checking.",
      },
      {
        title: "Export CSV or Excel",
        body: "Download CSV for imports or Excel when you need a workbook-ready version of the same parsed data.",
      },
    ],
  },
  {
    eyebrow: "Support guidance",
    title: "Digital PDF support vs scanned PDF limitations",
    intro:
      "Not every bank statement PDF behaves the same way, so the support guidance is visible up front.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDFs work best",
        body: "Text-based bank statement PDFs are the strongest input type for clean extraction and export.",
      },
      {
        title: "Scanned PDFs are best-effort",
        body: "Image-only or scanned statements are not fully supported yet, so results can be limited or fail.",
      },
      {
        title: "Strongest current layouts",
        body: "FNB, Standard Bank, and Capitec currently have the strongest supported layouts in the product.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a PDF bank statement to CSV?",
    answer:
      "Upload a digital bank statement PDF, review the parsed transactions, and then download the export as CSV.",
  },
  {
    question: "Can I use a bank statement PDF instead of a CSV export from the bank?",
    answer:
      "Yes. The product is designed for PDF bank statements and creates a clean CSV or Excel-ready output from the parsed preview.",
  },
  {
    question: "Does the app also support bank statement PDF to Excel output?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel, depending on what your workflow needs.",
  },
  {
    question: "Do scanned PDFs work?",
    answer:
      "Digital, text-based PDFs work best. Scanned and image-only statements are not fully supported yet.",
  },
  {
    question: "Can I review the data before downloading CSV?",
    answer:
      "Yes. Preview and review are part of the workflow, so you can inspect rows before the export is downloaded.",
  },
  {
    question: "Can I process multiple PDF bank statements at once?",
    answer:
      "Yes. Batch upload is supported, and each successful file keeps its own preview and export options.",
  },
] as const;

export default function PdfBankStatementToCsvPage() {
  return (
    <SeoSupportPage
      eyebrow="PDF bank statement to CSV"
      title="PDF Bank Statement to CSV"
      intro="Need to convert a PDF bank statement to CSV? Upload a digital statement PDF, review the extracted transactions, and export a clean CSV or Excel-ready file."
      shortAnswer="Yes. You can convert a PDF bank statement to CSV by uploading the file, checking the preview, and exporting structured transaction data for spreadsheet or bookkeeping use."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Move from bank statement PDF to clean CSV output"
      ctaBody="Use the review-first workflow to convert statement PDFs into structured CSV files, then export Excel when your process needs it."
    />
  );
}
