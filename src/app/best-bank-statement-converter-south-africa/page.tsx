import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_RELATED_LINKS } from "@/lib/seo-links";

export const metadata: Metadata = buildPageMetadata({
  title: "Best Bank Statement Converter South Africa",
  description:
    "What makes the best bank statement converter in South Africa? This guide covers review-first workflows, supported banks, batch uploads, and team features.",
  path: "/best-bank-statement-converter-south-africa",
  keywords: [
    "best bank statement converter South Africa",
    "bank statement converter South Africa",
    "South African bank statement converter",
    "bank statement converter for accountants in South Africa",
  ],
  type: "article",
});

const sections = [
  {
    eyebrow: "What matters",
    title: "What makes the best bank statement converter in South Africa",
    intro:
      "For accountants, the best tool is not just about extracting rows. It needs to support review, local bank layouts, and recurring client work.",
    columns: 3 as const,
    cards: [
      {
        title: "Strong local bank support",
        body: "FNB, Standard Bank, and Capitec support matters because South African firms often work across those layouts repeatedly.",
      },
      {
        title: "Review before export",
        body: "A preview-first workflow is more useful than a blind file conversion when financial data needs checking.",
      },
      {
        title: "Practical workspace features",
        body: "Projects, history, and organization workspaces help firms turn conversion into a repeatable process.",
      },
    ],
  },
  {
    eyebrow: "How to evaluate",
    title: "How accountants compare bank statement converters",
    intro:
      "The right comparison points are speed, clarity, and how well the tool fits month-end client work.",
    columns: 3 as const,
    cards: [
      {
        title: "Can it handle batch uploads?",
        body: "Batch support matters when multiple client statements arrive at once and need separate previews.",
      },
      {
        title: "Does it support Excel and CSV?",
        body: "Both exports are useful because one workflow may need spreadsheet cleanup while another needs CSV import.",
      },
      {
        title: "Does it explain limits clearly?",
        body: "A good product should be clear about supported banks, digital PDF requirements, and scanned PDF limitations.",
      },
    ],
  },
  {
    eyebrow: "South Africa fit",
    title: "Why local trust matters in South Africa",
    intro:
      "Local firms need bank support, workspace controls, and an upgrade path that feels workable in the South African context.",
    columns: 3 as const,
    cards: [
      {
        title: "Supported banks",
        body: "Current strongest layouts are FNB, Standard Bank, and Capitec for digital statement conversion.",
      },
      {
        title: "Team workflows",
        body: "Organization workspaces help accounting teams share projects, conversions, and usage across one firm.",
      },
      {
        title: "Manual EFT upgrades",
        body: "The current product supports a clear EFT approval flow for upgrades instead of pretending payment is fully automated.",
      },
    ],
  },
];

const faqs = [
  {
    question: "What is the best bank statement converter in South Africa?",
    answer:
      "The best option is one that supports key South African bank layouts, offers preview before export, and helps accountants manage repeated client work.",
  },
  {
    question: "Which South African banks are currently strongest?",
    answer:
      "FNB, Standard Bank, and Capitec are the strongest currently supported digital PDF layouts.",
  },
  {
    question: "Should a bank statement converter support batch uploads?",
    answer:
      "Yes. Batch uploads are useful when accountants process multiple client statements at once.",
  },
  {
    question: "Do South African accountants need Excel and CSV export?",
    answer:
      "Yes. Excel is useful for review and cleanup, while CSV is useful for imports and raw spreadsheet workflows.",
  },
  {
    question: "Do scanned statements work?",
    answer:
      "Digital, text-based PDFs work best. Scanned and image-only statements are not fully supported yet.",
  },
] as const;

export default function BestBankStatementConverterSouthAfricaPage() {
  return (
    <SeoSupportPage
      currentHref="/best-bank-statement-converter-south-africa"
      eyebrow="Best bank statement converter South Africa"
      title="Best Bank Statement Converter South Africa"
      intro="Looking for the best bank statement converter in South Africa? The best option is one that supports local bank layouts, gives you a review step before export, and fits recurring accounting work."
      shortAnswer="For South African accountants, the best bank statement converter is one that handles digital PDFs well, supports key local banks, offers Excel and CSV export, and keeps client work organized in projects or shared workspaces."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Use a converter built for South African accounting workflows"
      ctaBody="Start with digital PDF statements, review the extracted rows before export, and keep recurring client work inside projects and team workspaces."
      relatedLinks={[...BLOG_RELATED_LINKS]}
    />
  );
}
