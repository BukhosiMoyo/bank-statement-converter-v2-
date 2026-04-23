import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "TymeBank Bank Statement to Excel",
  description:
    "Convert a TymeBank bank statement to Excel or CSV with a review-first workflow for accountants, bookkeepers, and finance teams.",
  path: "/tymebank-bank-statement-to-excel",
  keywords: [
    "TymeBank statement to CSV",
    "TymeBank bank statement to Excel",
    "convert TymeBank statement",
    "TymeBank statement converter",
    "TymeBank PDF to Excel",
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
  {
    href: "/discovery-bank-statement-to-excel",
    label: "Discovery Bank to Excel",
  },
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert a TymeBank bank statement to Excel",
    intro:
      "The workflow gives accountants a review step between the TymeBank PDF and the final spreadsheet export.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the TymeBank PDF",
        body: "Start with a digital TymeBank bank statement PDF. The converter reads the transaction rows from the document text.",
      },
      {
        label: "Step 02",
        title: "Review the extracted rows",
        body: "Check dates, descriptions, amounts, and balances in the structured preview before exporting.",
      },
      {
        label: "Step 03",
        title: "Download Excel or CSV",
        body: "Export a clean file for bookkeeping, reconciliation, or spreadsheet processing.",
      },
    ],
  },
  {
    eyebrow: "TymeBank statements",
    title: "Why TymeBank statements need structured conversion",
    intro:
      "TymeBank is a digital-first bank with a growing client base in South Africa. As more people and small businesses bank with TymeBank, accountants need tools to convert these statements into usable spreadsheet data.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital-first banking",
        body: "TymeBank operates primarily through digital channels, and their statement PDFs need conversion for accounting workflows.",
      },
      {
        title: "Best-effort extraction",
        body: "TymeBank layouts are handled through best-effort extraction. The preview step is important for confirming row quality before export.",
      },
      {
        title: "Consistent multi-bank workflow",
        body: "Accountants who handle TymeBank alongside FNB, Standard Bank, or Capitec clients can use the same conversion workflow for all of them.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for TymeBank statement conversion",
    intro:
      "The platform supports multi-bank accounting workflows with consistent review and export controls.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel and CSV export",
        body: "Download TymeBank statement data as Excel for workbook review or CSV for accounting software import.",
      },
      {
        title: "Review before export",
        body: "Inspect all extracted rows and confirm quality before the file is downloaded.",
      },
      {
        title: "Project organization",
        body: "Save converted TymeBank statements into client projects for organized monthly work.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a TymeBank statement to Excel?",
    answer:
      "Upload a digital TymeBank statement PDF, review the extracted rows in the preview, and download the file as Excel or CSV.",
  },
  {
    question: "Can I export a TymeBank statement to CSV?",
    answer:
      "Yes. The same parsed preview can be exported as either CSV or Excel.",
  },
  {
    question: "How well does this work with TymeBank statement layouts?",
    answer:
      "TymeBank statements are handled through best-effort extraction. Review the preview carefully before exporting.",
  },
  {
    question: "Can I use this for other banks alongside TymeBank?",
    answer:
      "Yes. The same platform handles FNB, Standard Bank, ABSA, Capitec, Nedbank, and other South African bank statements.",
  },
] as const;

export default function TymeBankBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/tymebank-bank-statement-to-excel"
      eyebrow="TymeBank bank statement to Excel"
      title="TymeBank Bank Statement to Excel"
      intro="Convert a TymeBank bank statement to Excel or CSV. Upload the PDF, review the extracted transactions, and export a clean working file for bookkeeping and accounting work."
      shortAnswer="Yes. Upload a digital TymeBank statement PDF, review the parsed rows, and download a clean Excel or CSV export."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert TymeBank statements into spreadsheet-ready files"
      ctaBody="Use the review-first workflow to turn TymeBank bank statement PDFs into structured exports for bookkeeping and reconciliation."
      relatedLinks={relatedLinks}
    />
  );
}
