import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Discovery Bank Statement to Excel",
  description:
    "Convert a Discovery Bank statement to Excel or CSV with a review-first workflow for accountants, bookkeepers, and finance teams.",
  path: "/discovery-bank-statement-to-excel",
  keywords: [
    "Discovery Bank statement to Excel",
    "convert Discovery Bank statement to CSV",
    "Discovery Bank statement converter",
    "Discovery Bank PDF to Excel",
    "Discovery Bank statement export",
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
  { href: "/capitec-bank-statement-to-excel", label: "Capitec to Excel" },
  { href: "/nedbank-bank-statement-to-excel", label: "Nedbank to Excel" },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert a Discovery Bank statement to Excel",
    intro:
      "The workflow gives accountants a clean review step between the Discovery Bank PDF and the final spreadsheet export.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the Discovery Bank PDF",
        body: "Start with a digital Discovery Bank statement PDF. The converter reads the transaction rows from the document text.",
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
    eyebrow: "Discovery Bank statements",
    title: "Why Discovery Bank statements need structured conversion",
    intro:
      "Discovery Bank is a newer entrant in the South African banking market. Accountants handling Discovery Bank clients still need to convert statement PDFs into usable spreadsheet data for their monthly workflows.",
    columns: 3 as const,
    cards: [
      {
        title: "Growing client base",
        body: "As more clients bank with Discovery Bank, accountants increasingly encounter these statements in their monthly bookkeeping work.",
      },
      {
        title: "Best-effort extraction",
        body: "Discovery Bank layouts are handled through best-effort extraction. Review the preview carefully before exporting to confirm row quality.",
      },
      {
        title: "Same workflow as other banks",
        body: "The conversion process is consistent whether the statement comes from Discovery Bank, FNB, Standard Bank, or any other supported bank.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for Discovery Bank statement conversion",
    intro:
      "The platform supports multi-bank accounting workflows with consistent review and export controls.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel and CSV export",
        body: "Download Discovery Bank statement data as Excel for workbook review or CSV for accounting software import.",
      },
      {
        title: "Review before export",
        body: "The preview step lets you inspect all extracted rows before the file is downloaded.",
      },
      {
        title: "Project organization",
        body: "Save converted Discovery Bank statements into client projects for organized recurring work.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a Discovery Bank statement to Excel?",
    answer:
      "Upload a digital Discovery Bank statement PDF, review the extracted transaction rows in the preview, and download the file as Excel or CSV.",
  },
  {
    question: "Can I export a Discovery Bank statement to CSV?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel.",
  },
  {
    question: "How well does this work with Discovery Bank statement layouts?",
    answer:
      "Discovery Bank statements are handled through best-effort extraction. The preview step is important for confirming that extracted rows are complete and accurate.",
  },
  {
    question: "Do scanned Discovery Bank statements work?",
    answer:
      "Digital, text-based PDFs work best. Scanned statements have limited support.",
  },
  {
    question: "Can I use this for other banks alongside Discovery Bank?",
    answer:
      "Yes. The same platform handles FNB, Standard Bank, ABSA, Capitec, Nedbank, Investec, and other South African bank statements.",
  },
] as const;

export default function DiscoveryBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/discovery-bank-statement-to-excel"
      eyebrow="Discovery Bank statement to Excel"
      title="Discovery Bank Statement to Excel"
      intro="Convert a Discovery Bank statement to Excel or CSV. Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping and accounting workflows."
      shortAnswer="Yes. Upload a digital Discovery Bank statement PDF, review the parsed rows, and download a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert Discovery Bank statements into spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn Discovery Bank statement PDFs into structured exports for client bookkeeping and reconciliation."
      relatedLinks={relatedLinks}
    />
  );
}
