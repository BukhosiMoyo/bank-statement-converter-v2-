import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { BLOG_RELATED_LINKS } from "@/lib/seo-links";

export const metadata: Metadata = {
  title: "Can You Convert a Scanned Bank Statement to Excel?",
  description:
    "Can you convert a scanned bank statement to Excel? This guide explains what works, what does not, and why digital PDFs are still the best input.",
  keywords: [
    "can you convert a scanned bank statement to excel",
    "scanned bank statement to excel",
    "image bank statement to excel",
    "digital vs scanned bank statement pdf",
  ],
  openGraph: {
    title: "Can You Convert a Scanned Bank Statement to Excel?",
    description:
      "A practical guide to scanned bank statement limitations and why digital PDFs work better.",
    type: "article",
    siteName: "Bank Statement Converter",
  },
};

const sections = [
  {
    eyebrow: "Short answer",
    title: "Can you convert a scanned bank statement to Excel?",
    intro:
      "Sometimes, but not reliably enough to treat it like a clean digital PDF workflow. Scanned statements remain a best-effort case.",
    columns: 3 as const,
    cards: [
      {
        title: "Digital PDFs work best",
        body: "Text-based bank statement PDFs are the strongest input because transaction text can be extracted directly.",
      },
      {
        title: "Scanned statements are limited",
        body: "Scanned or image-only statements do not provide the same clean text structure and may fail or need manual follow-up.",
      },
      {
        title: "Review matters even more",
        body: "When the source is scanned, every extracted row needs closer review before it can be trusted in Excel.",
      },
    ],
  },
  {
    eyebrow: "Why this happens",
    title: "Why scanned bank statements are harder to convert",
    intro:
      "A scanned statement is usually an image of a page, not a structured text document. That makes row extraction much less predictable.",
    columns: 3 as const,
    cards: [
      {
        title: "No clean text layer",
        body: "Without a text layer, the product cannot rely on normal PDF row extraction patterns.",
      },
      {
        title: "Layout ambiguity",
        body: "Images make it harder to separate dates, descriptions, amounts, and balances accurately.",
      },
      {
        title: "Higher manual review cost",
        body: "Even when a scanned statement can be processed, the review burden is usually higher than with a digital PDF.",
      },
    ],
  },
  {
    eyebrow: "What to do instead",
    title: "Best practice when you need statement conversion",
    intro:
      "The most reliable path is still to use the bank’s digital PDF statement wherever possible.",
    columns: 3 as const,
    cards: [
      {
        title: "Use the digital export",
        body: "If the bank provides a downloadable digital statement PDF, use that instead of a scan or screenshot.",
      },
      {
        title: "Check supported banks",
        body: "Current strongest digital layouts are FNB, Standard Bank, and Capitec.",
      },
      {
        title: "Use preview before export",
        body: "Review the extracted rows before downloading Excel or CSV so the result is easier to trust.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Can you convert a scanned bank statement to Excel?",
    answer:
      "Sometimes, but it is still a best-effort workflow. Digital, text-based PDFs are much more reliable.",
  },
  {
    question: "Why are digital PDFs better than scanned statements?",
    answer:
      "Digital PDFs usually contain extractable text, which makes transaction rows easier to separate and export cleanly.",
  },
  {
    question: "Should I use a scan if the bank offers a digital statement PDF?",
    answer:
      "No. If a digital PDF is available, it is the better input for conversion and review.",
  },
  {
    question: "Can I still review scanned output before export?",
    answer:
      "Yes. The preview step is still useful, but scanned sources usually need closer manual checking.",
  },
  {
    question: "Which banks are currently strongest when using digital PDFs?",
    answer:
      "FNB, Standard Bank, and Capitec are the strongest currently supported layouts for digital statements.",
  },
] as const;

export default function CanYouConvertAScannedBankStatementToExcelPage() {
  return (
    <SeoSupportPage
      eyebrow="Can you convert a scanned bank statement to Excel"
      title="Can You Convert a Scanned Bank Statement to Excel?"
      intro="Yes, sometimes, but scanned bank statements are still a best-effort case. Digital, text-based statement PDFs remain the most reliable path for clean Excel conversion."
      shortAnswer="If you need the cleanest result, use a digital PDF bank statement instead of a scan. Scanned and image-only statements are harder to parse and usually need more manual review."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Use digital statement PDFs for cleaner exports"
      ctaBody="Start with a digital bank statement PDF whenever possible, then review the extracted rows before downloading Excel or CSV output."
      relatedLinks={[...BLOG_RELATED_LINKS]}
    />
  );
}
