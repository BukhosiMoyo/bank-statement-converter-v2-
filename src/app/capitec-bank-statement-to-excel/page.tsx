import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Capitec Bank Statement to Excel",
  description:
    "Convert a Capitec bank statement to Excel with a clean review-first workflow built for accountants and bookkeepers.",
  path: "/capitec-bank-statement-to-excel",
  keywords: [
    "Capitec bank statement to Excel",
    "convert Capitec bank statement to Excel",
    "Capitec statement to Excel",
    "Capitec bank statement converter",
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
];

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert a Capitec bank statement to Excel",
    intro:
      "The workflow is built for accountants who need to move quickly from Capitec statement PDFs to clean spreadsheet outputs.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload the Capitec PDF",
        body: "Start with a digital Capitec bank statement PDF and send it into the converter.",
      },
      {
        label: "Step 02",
        title: "Review extracted transactions",
        body: "Check transaction rows, balances, and descriptions before downloading the final file.",
      },
      {
        label: "Step 03",
        title: "Export the result",
        body: "Download Excel or CSV output for bookkeeping, cleanup, and financial review.",
      },
    ],
  },
  {
    eyebrow: "Capitec statements",
    title: "Why Capitec statement conversion helps accountants",
    intro:
      "Capitec statements can include compact transaction rows, fees, and running balances that are easier to work with after structured conversion.",
    columns: 3 as const,
    cards: [
      {
        title: "Compact transaction layouts",
        body: "Capitec statements often need a clean row-based export before they fit smoothly into spreadsheet workflows.",
      },
      {
        title: "Fee visibility",
        body: "A structured preview helps accountants review charges, payments, and net movement more clearly.",
      },
      {
        title: "Recurring client work",
        body: "Capitec client statements become easier to manage when they can be saved, reopened, and grouped in projects.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for Capitec conversion",
    intro:
      "The workflow supports repeated statement processing, not just one download.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel export",
        body: "Download Capitec statement data into a clean Excel-ready file.",
      },
      {
        title: "CSV export",
        body: "Use CSV when the next step in your process is import or spreadsheet cleanup.",
      },
      {
        title: "Projects and history",
        body: "Save Capitec conversions into projects so each client file stays easy to track over time.",
      },
    ],
  },
  {
    eyebrow: "Formats",
    title: "Supported Capitec statement formats",
    intro:
      "The current support guidance helps set the right expectation before upload.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDF support",
        body: "Digital, text-based Capitec statement PDFs are the strongest supported input type.",
      },
      {
        title: "Scanned PDF limitation",
        body: "Scanned or image-only Capitec statements remain best-effort and may not parse reliably.",
      },
      {
        title: "Preview-first workflow",
        body: "Review the extracted rows before export so the file is easier to trust in downstream accounting work.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert a Capitec bank statement to Excel?",
    answer:
      "Upload a digital Capitec statement PDF, review the extracted rows, and export the result as Excel.",
  },
  {
    question: "Can I export a Capitec statement as CSV too?",
    answer:
      "Yes. The same parsed preview can be exported as CSV or Excel.",
  },
  {
    question: "Why do accountants convert Capitec statements to Excel?",
    answer:
      "It makes statement cleanup, monthly bookkeeping, and reconciliation easier than working inside the PDF itself.",
  },
  {
    question: "Does this help with Capitec fees and transaction review?",
    answer:
      "Yes. The structured preview makes payments, charges, balances, and row-level review easier before export.",
  },
  {
    question: "Do scanned Capitec PDFs work?",
    answer:
      "Digital, text-based PDFs work best. Scanned and image-only statements are not fully supported yet.",
  },
  {
    question: "Can I keep Capitec statement conversions grouped by client?",
    answer:
      "Yes. Logged-in users can save conversions into projects and revisit them later.",
  },
] as const;

export default function CapitecBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/capitec-bank-statement-to-excel"
      eyebrow="Capitec bank statement to Excel"
      title="Capitec Bank Statement to Excel"
      intro="Need to convert a Capitec bank statement to Excel? Upload the PDF, review the extracted rows, and export a clean spreadsheet-ready file for bookkeeping and client work."
      shortAnswer="Yes. You can convert a Capitec bank statement to Excel by uploading a digital PDF, reviewing the parsed transaction rows, and exporting a clean Excel or CSV file."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert Capitec statements into clean spreadsheet-ready exports"
      ctaBody="Use the review-first workflow to turn Capitec statement PDFs into structured outputs for monthly bookkeeping, statement cleanup, and client reporting."
      relatedLinks={relatedLinks}
    />
  );
}
