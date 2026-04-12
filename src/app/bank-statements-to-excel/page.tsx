import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Bank Statements to Excel",
  description:
    "Convert bank statements to Excel with clean, accountant-ready outputs. Upload a PDF statement, review extracted transactions, and download Excel or CSV files.",
  path: "/bank-statements-to-excel",
  keywords: [
    "bank statements to excel",
    "convert bank statements to excel",
    "bank statement to excel converter",
    "convert bank statement to excel",
  ],
  type: "article",
});

const sections = [
  {
    eyebrow: "How it works",
    title: "How to convert bank statements to Excel",
    intro:
      "The workflow stays simple so accountants and bookkeepers can move from PDF to clean spreadsheet output quickly.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Upload your statement",
        body: "Start with a digital bank statement PDF and send it into the converter without manual preparation.",
      },
      {
        label: "Step 02",
        title: "Review extracted rows",
        body: "Check dates, descriptions, balances, and references before you export anything to Excel.",
      },
      {
        label: "Step 03",
        title: "Download a clean file",
        body: "Export an Excel-ready working file or CSV for imports, cleanup, and bookkeeping workflows.",
      },
    ],
  },
  {
    eyebrow: "Benefits",
    title: "Why accountants use bank statements to Excel tools",
    intro:
      "The main value is speed without losing control over the output before it reaches client workbooks or bookkeeping systems.",
    columns: 3 as const,
    cards: [
      {
        title: "Faster monthly bookkeeping",
        body: "Cut down repetitive copy-and-paste work when recurring client statements need to be cleaned every month.",
      },
      {
        title: "Cleaner review process",
        body: "Use the preview stage to inspect extracted rows before downloading the file into your Excel workflow.",
      },
      {
        title: "Better client organization",
        body: "Save converted statements into projects so each client workspace stays separated and easy to revisit.",
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Feature highlights for bank statement to Excel conversion",
    intro:
      "The product is built for working accountants, not just one-off file conversion.",
    columns: 3 as const,
    cards: [
      {
        title: "Excel export",
        body: "Download structured Excel files with transaction columns ready for review, filtering, and handoff.",
      },
      {
        title: "CSV backup",
        body: "Export CSV when you need imports or raw spreadsheet handling alongside Excel output.",
      },
      {
        title: "Batch uploads",
        body: "Process multiple statements in one workflow and keep each file previewed separately.",
      },
      {
        title: "Project organization",
        body: "Group saved work by client or project so statement history stays useful over time.",
      },
      {
        title: "Shared workspace",
        body: "Use organization workspaces when your team needs shared access to projects and converted statements.",
      },
      {
        title: "Secure handling",
        body: "Original PDFs are not stored after conversion, while saved conversion data stays tied to the active workspace.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do I convert bank statements to Excel?",
    answer:
      "Upload a digital PDF bank statement, review the extracted transactions, and then download the result as an Excel file.",
  },
  {
    question: "Can I convert bank statements to Excel without retyping rows?",
    answer:
      "Yes. The converter extracts transaction rows from supported digital PDFs so you do not need to capture each line manually.",
  },
  {
    question: "Is this a bank statement to Excel converter for accountants?",
    answer:
      "Yes. The workflow is built around review, export, project organization, and repeated client work.",
  },
  {
    question: "Can I also download CSV?",
    answer:
      "Yes. CSV export is available alongside Excel export, using the same parsed transaction preview.",
  },
  {
    question: "Does it support multiple statements at once?",
    answer:
      "Yes. Batch upload is supported, and each successful file keeps its own preview and export options.",
  },
  {
    question: "Which statement layouts work best?",
    answer:
      "The strongest current layouts are FNB, Standard Bank, and Capitec, while other digital PDFs use best-effort parsing.",
  },
] as const;

export default function BankStatementsToExcelPage() {
  return (
    <SeoSupportPage
      currentHref="/bank-statements-to-excel"
      eyebrow="Bank statements to Excel"
      title="Bank Statements to Excel"
      intro="Need to convert bank statements to Excel? Upload a digital PDF, review the extracted transactions, and download a clean working file in seconds."
      shortAnswer="Yes. This bank statement to Excel converter pulls transaction rows from supported digital PDFs, gives you a review step before export, and produces clean Excel or CSV files for bookkeeping."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Convert bank statements to Excel without manual cleanup"
      ctaBody="Use the converter to move from statement PDF to review-ready Excel output, then scale up when your monthly client volume grows."
    />
  );
}
