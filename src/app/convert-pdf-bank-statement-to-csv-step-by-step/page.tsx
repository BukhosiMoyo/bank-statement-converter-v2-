import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_RELATED_LINKS } from "@/lib/seo-links";

export const metadata: Metadata = buildPageMetadata({
  title: "Convert PDF Bank Statement to CSV Step by Step",
  description:
    "A step-by-step guide to converting a PDF bank statement to CSV, including upload, preview, review, export, and support limitations.",
  path: "/convert-pdf-bank-statement-to-csv-step-by-step",
  keywords: [
    "convert pdf bank statement to csv step by step",
    "convert pdf bank statement to csv",
    "pdf bank statement to csv",
    "bank statement pdf to excel",
  ],
  type: "article",
});

const sections = [
  {
    eyebrow: "Step by step",
    title: "How to convert a PDF bank statement to CSV step by step",
    intro:
      "The safest workflow is to review the extracted rows before download instead of relying on a blind export.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the PDF",
        body: "Use a digital bank statement PDF so the transaction text can be extracted cleanly.",
      },
      {
        label: "Step 02",
        title: "Check the preview",
        body: "Inspect dates, descriptions, references, and balances before deciding to export.",
      },
      {
        label: "Step 03",
        title: "Download CSV",
        body: "Export the result as clean CSV, or choose Excel if the next step is spreadsheet review.",
      },
    ],
  },
  {
    eyebrow: "Review",
    title: "Why preview and review matter before CSV export",
    intro:
      "CSV is useful because it is portable, but that also means mistakes travel quickly if the output is not checked first.",
    columns: 3 as const,
    cards: [
      {
        title: "Catch row issues early",
        body: "A preview helps you spot rows that need closer review before the file leaves the product.",
      },
      {
        title: "Keep references intact",
        body: "Descriptions and reference fields are easier to verify while you still have a row-by-row preview.",
      },
      {
        title: "Choose CSV or Excel intentionally",
        body: "CSV is good for imports and raw cleanup, while Excel is better when the next step is workbook review.",
      },
    ],
  },
  {
    eyebrow: "Input guidance",
    title: "Digital PDFs vs scanned PDFs",
    intro:
      "Input type makes a big difference to conversion quality, so the support guidance needs to be clear.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDFs work best",
        body: "Text-based bank statement PDFs are the strongest input for CSV conversion and clean extraction.",
      },
      {
        title: "Scanned PDFs are limited",
        body: "Image-only or scanned statements are still best-effort and may fail or need manual follow-up.",
      },
      {
        title: "Current strongest layouts",
        body: "FNB, Standard Bank, and Capitec are the strongest currently supported layouts for digital PDFs.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a PDF bank statement to CSV step by step?",
    answer:
      "Upload the PDF, review the extracted transactions, and then download the result as CSV.",
  },
  {
    question: "Can I export Excel instead of CSV?",
    answer:
      "Yes. The same parsed preview can be exported as Excel or CSV depending on what your workflow needs.",
  },
  {
    question: "Why should I review before exporting CSV?",
    answer:
      "A review step helps catch low-confidence rows, balance issues, or reference problems before the CSV is used elsewhere.",
  },
  {
    question: "Do scanned bank statement PDFs work?",
    answer:
      "Digital PDFs work best. Scanned and image-only statements are not fully supported yet.",
  },
  {
    question: "Can I process multiple PDFs at once?",
    answer:
      "Yes. Batch upload is supported, and each successful file keeps its own preview and export options.",
  },
] as const;

export default function ConvertPdfBankStatementToCsvStepByStepPage() {
  return (
    <SeoSupportPage
      currentHref="/convert-pdf-bank-statement-to-csv-step-by-step"
      eyebrow="Convert PDF bank statement to CSV step by step"
      title="Convert PDF Bank Statement to CSV Step by Step"
      intro="Yes, you can convert a PDF bank statement to CSV with a simple upload, preview, and export workflow that gives accountants a review step before download."
      shortAnswer="Use a digital bank statement PDF, review the extracted transactions carefully, and then export the result as CSV. If you need a spreadsheet-first review process, export Excel instead."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert statement PDFs into clean CSV output"
      ctaBody="Use the review-first workflow to move from bank statement PDF to structured CSV, then save client work inside projects when you need repeated access."
      relatedLinks={[...BLOG_RELATED_LINKS]}
    />
  );
}
