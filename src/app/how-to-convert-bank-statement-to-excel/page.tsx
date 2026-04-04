import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { BLOG_RELATED_LINKS } from "@/lib/seo-links";

export const metadata: Metadata = {
  title: "How to Convert a Bank Statement to Excel",
  description:
    "Learn how to convert a bank statement to Excel with a clear upload, review, and export workflow built for accountants and finance teams.",
  keywords: [
    "how to convert bank statement to excel",
    "convert bank statement to excel",
    "bank statement to excel",
    "bank statement converter",
  ],
  openGraph: {
    title: "How to Convert a Bank Statement to Excel",
    description:
      "A practical step-by-step guide to turning bank statement PDFs into clean Excel-ready files.",
    type: "article",
    siteName: "Bank Statement Converter",
  },
};

const sections = [
  {
    eyebrow: "Step by step",
    title: "How to convert a bank statement to Excel",
    intro:
      "The fastest way is to start with a digital PDF, review the extracted rows, and export only after the output looks right.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the statement PDF",
        body: "Use a digital bank statement PDF so the converter can extract transaction rows cleanly.",
      },
      {
        label: "Step 02",
        title: "Review the preview",
        body: "Check dates, descriptions, references, debits, credits, and balances before exporting anything.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean working file for bookkeeping, reconciliation, or spreadsheet analysis.",
      },
    ],
  },
  {
    eyebrow: "Why this works",
    title: "Why accountants convert bank statements to Excel first",
    intro:
      "Excel is usually the easiest place to review, clean, sort, and hand off transaction data after it leaves the PDF.",
    columns: 3 as const,
    cards: [
      {
        title: "Monthly bookkeeping",
        body: "Recurring statement work is faster when rows are already structured instead of locked in a PDF.",
      },
      {
        title: "Review before import",
        body: "The preview step helps accountants catch issues before the file reaches client workbooks or bookkeeping systems.",
      },
      {
        title: "Reuse across clients",
        body: "Saved projects and conversion history make repeated client statement work easier to manage.",
      },
    ],
  },
  {
    eyebrow: "Product fit",
    title: "What to look for in a bank statement to Excel workflow",
    intro:
      "A practical workflow should do more than export a file. It should support review, repeated use, and mixed client volumes.",
    columns: 3 as const,
    cards: [
      {
        title: "Batch uploads",
        body: "Batch uploads help when you need to process multiple client statements in one session.",
      },
      {
        title: "Supported banks",
        body: "Strongest current layouts include FNB, Standard Bank, and Capitec, with best-effort support for other digital PDFs.",
      },
      {
        title: "Known limitation",
        body: "Scanned and image-only statements are not fully supported yet, so digital PDFs remain the best starting point.",
      },
    ],
  },
];

const faqs = [
  {
    question: "What is the easiest way to convert a bank statement to Excel?",
    answer:
      "Upload a digital PDF bank statement, review the extracted rows, and export the result as Excel.",
  },
  {
    question: "Can I convert bank statements to CSV as well?",
    answer:
      "Yes. The same parsed preview can be exported as CSV or Excel, depending on your workflow.",
  },
  {
    question: "Do I need to clean the PDF before uploading it?",
    answer:
      "Usually no. A digital, text-based PDF is the best input and should go straight into the converter.",
  },
  {
    question: "Can I process more than one statement at once?",
    answer:
      "Yes. Batch upload is available, and each successful file keeps its own preview and export options.",
  },
  {
    question: "Do scanned bank statements work?",
    answer:
      "Digital PDFs work best. Scanned and image-only statements are still best-effort and may not parse cleanly.",
  },
] as const;

export default function HowToConvertBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      eyebrow="How to convert bank statement to Excel"
      title="How to Convert a Bank Statement to Excel"
      intro="Yes, you can convert a bank statement to Excel with a straightforward upload, review, and export workflow that is built for accountants and finance teams."
      shortAnswer="Start with a digital PDF bank statement, review the extracted transactions, and then export the result as Excel or CSV. That gives you a clean working file instead of a locked PDF."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Start converting bank statements into Excel-ready files"
      ctaBody="Use the converter to move from PDF to review-ready exports, then save client work into projects for repeated use."
      relatedLinks={[...BLOG_RELATED_LINKS]}
    />
  );
}
