import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Automate Bank Reconciliation — South Africa",
  description:
    "How to automate parts of bank reconciliation for South African firms. Convert bank statement PDFs to structured data, review transactions, and prepare cleaner inputs for reconciliation workflows.",
  path: "/automate-bank-reconciliation-south-africa",
  keywords: [
    "automate bank reconciliation South Africa",
    "bank feed alternative South Africa",
    "bank reconciliation automation",
    "bank statement reconciliation tool",
    "automated bank statement matching",
    "bookkeeping bank statement extractor",
  ],
  type: "article",
});

const relatedLinks = [
  { href: "/bank-statement-to-sage", label: "Bank statement to Sage" },
  { href: "/bank-statement-to-xero", label: "Bank statement to Xero" },
  {
    href: "/bank-statement-to-quickbooks",
    label: "Bank statement to QuickBooks",
  },
  {
    href: "/how-accountants-process-bank-statements-faster",
    label: "Faster statement processing",
  },
];

const sections = [
  {
    eyebrow: "The problem",
    title: "Why bank reconciliation is still manual in South Africa",
    intro:
      "Many South African accounting firms still receive bank statements as PDFs, especially from clients who download them from online banking. Without direct bank feeds, reconciliation starts with manual data entry — the slowest part of the process.",
    columns: 3 as const,
    cards: [
      {
        title: "Bank feeds are not always available",
        body: "Direct bank feeds work well when supported, but many South African bank accounts, especially business accounts, do not have reliable feed connections to accounting software.",
      },
      {
        title: "PDF statements create bottlenecks",
        body: "When bank feeds are unavailable, accountants receive PDF statements and manually enter transactions — a time-consuming, error-prone step.",
      },
      {
        title: "Monthly volume compounds the problem",
        body: "Firms handling 20+ clients with monthly statements spend significant hours just on data capture before reconciliation work even begins.",
      },
    ],
  },
  {
    eyebrow: "The solution",
    title: "How to automate the data capture step",
    intro:
      "The biggest opportunity for automation is not reconciliation itself, but the step before it — getting clean, structured transaction data from bank statement PDFs.",
    columns: 3 as const,
    cards: [
      {
        label: "Step 01",
        title: "Convert the bank statement PDF",
        body: "Upload digital PDF statements from FNB, Standard Bank, ABSA, Capitec, Nedbank, or other banks and let the converter extract the transaction rows automatically.",
      },
      {
        label: "Step 02",
        title: "Review the structured data",
        body: "Inspect dates, descriptions, amounts, and balances in the preview. Catch issues before the data enters your accounting software.",
      },
      {
        label: "Step 03",
        title: "Export and import for reconciliation",
        body: "Export CSV and import into Sage, Xero, QuickBooks, or other accounting software. Reconciliation starts with cleaner data.",
      },
    ],
  },
  {
    eyebrow: "Bank feed alternative",
    title: "When PDF conversion replaces bank feeds",
    intro:
      "For accounts where direct bank feeds are not available, converting PDF statements to CSV is a practical alternative that recovers most of the automation benefit.",
    columns: 3 as const,
    cards: [
      {
        title: "Business accounts without feeds",
        body: "Many South African business bank accounts do not support direct bank feeds. PDF conversion fills this gap with structured data extraction.",
      },
      {
        title: "Clients who only provide PDFs",
        body: "Some clients prefer to download statements themselves and send the PDF. Converting these PDFs gives you the same structured data a bank feed would provide.",
      },
      {
        title: "Faster than manual entry",
        body: "Even with a review step, converting PDF statements is significantly faster than manually typing every transaction into accounting software.",
      },
    ],
  },
  {
    eyebrow: "Accounting software",
    title: "Works with South African accounting workflows",
    intro:
      "The CSV export integrates with the accounting software most commonly used by South African firms.",
    columns: 3 as const,
    cards: [
      {
        title: "Sage Business Cloud",
        body: "Export CSV from converted statements and import into Sage for reconciliation. Works with Sage One and Sage Business Cloud Accounting.",
      },
      {
        title: "Xero",
        body: "Prepare bank statement CSV for Xero import when direct bank feeds are unavailable or unreliable.",
      },
      {
        title: "QuickBooks",
        body: "Convert PDF statements to CSV for QuickBooks bank transaction import, reducing manual data capture time.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Can I fully automate bank reconciliation with this tool?",
    answer:
      "This tool automates the data capture step — converting PDF statements to structured CSV. The matching and reconciliation step still happens inside your accounting software.",
  },
  {
    question: "Is this a bank feed replacement?",
    answer:
      "For accounts without direct bank feeds, PDF conversion provides similar structured data. It is not a live feed, but it recovers most of the automation benefit.",
  },
  {
    question: "Which accounting software does the CSV work with?",
    answer:
      "The CSV export works with Sage, Xero, QuickBooks, and other accounting software that accepts bank transaction CSV imports.",
  },
  {
    question: "How much time does this save compared to manual entry?",
    answer:
      "Most firms report significant time savings, especially during month-end when processing multiple client statements. The exact saving depends on statement volume and complexity.",
  },
  {
    question: "Does this work for all South African banks?",
    answer:
      "FNB, Standard Bank, ABSA, Capitec, and Nedbank are the best-supported banks. Other banks are handled through best-effort extraction.",
  },
  {
    question: "Why is the review step important for reconciliation?",
    answer:
      "Reviewing extracted data before import catches errors early — before they create mismatches during reconciliation. This saves more time than fixing errors inside accounting software later.",
  },
] as const;

export default function AutomateBankReconciliationSouthAfricaPage() {
  return (
    <SeoSupportPage
      currentHref="/automate-bank-reconciliation-south-africa"
      eyebrow="Automate bank reconciliation"
      title="Automate Bank Reconciliation in South Africa"
      intro="Speed up bank reconciliation by automating the data capture step. Convert bank statement PDFs from South African banks to structured CSV, review the data, and import into Sage, Xero, or QuickBooks."
      shortAnswer="Automate the slowest part of reconciliation — data capture — by converting bank statement PDFs to structured CSV. Import the clean data into your accounting software and start matching."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Start automating your bank statement data capture"
      ctaBody="Convert bank statement PDFs to clean CSV exports that make reconciliation faster, whether you use Sage, Xero, QuickBooks, or another accounting tool."
      relatedLinks={relatedLinks}
    />
  );
}
