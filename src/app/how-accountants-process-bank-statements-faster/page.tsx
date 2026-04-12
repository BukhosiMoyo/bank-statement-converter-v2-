import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_RELATED_LINKS } from "@/lib/seo-links";

export const metadata: Metadata = buildPageMetadata({
  title: "How Accountants Process Bank Statements Faster",
  description:
    "A practical guide to how accountants process bank statements faster using review-first conversion, batch uploads, projects, and cleaner exports.",
  path: "/how-accountants-process-bank-statements-faster",
  keywords: [
    "how accountants process bank statements faster",
    "process bank statements faster",
    "bank statement workflow for accountants",
    "bank statement conversion for accountants",
  ],
  type: "article",
});

const sections = [
  {
    eyebrow: "Workflow",
    title: "How accountants process bank statements faster",
    intro:
      "The fastest workflows reduce manual cleanup, keep review in place, and make repeated client work reusable instead of starting from scratch each month.",
    columns: 3 as const,
    cards: [
      {
        title: "Start with digital PDFs",
        body: "Digital statement PDFs reduce friction because the transaction text can be extracted directly.",
      },
      {
        title: "Review before export",
        body: "A preview-first flow helps accountants catch issues before files move into spreadsheets or bookkeeping systems.",
      },
      {
        title: "Reuse saved client work",
        body: "Projects and conversion history make repeated client statement work easier to manage over time.",
      },
    ],
  },
  {
    eyebrow: "Operational gains",
    title: "Where accountants save the most time",
    intro:
      "The biggest time savings usually come from reducing repetitive handling and organizing work better across clients.",
    columns: 3 as const,
    cards: [
      {
        title: "Batch uploads",
        body: "Batch processing helps when several client statements arrive at once and each needs its own export.",
      },
      {
        title: "Excel and CSV output",
        body: "Choose Excel for review and CSV for imports, without rerunning the same statement conversion twice.",
      },
      {
        title: "Team workspaces",
        body: "Shared organization workspaces help firms distribute work without losing project context.",
      },
    ],
  },
  {
    eyebrow: "Practical limits",
    title: "Where accountants still need judgment",
    intro:
      "A faster process still needs clear support boundaries so expectations stay realistic.",
    columns: 3 as const,
    cards: [
      {
        title: "Supported banks matter",
        body: "Current strongest layouts include FNB, Standard Bank, and Capitec for digital statement conversion.",
      },
      {
        title: "Scanned PDFs remain limited",
        body: "Image-only and scanned statements are not fully supported yet, so they should not be treated like clean digital PDFs.",
      },
      {
        title: "Review is part of the workflow",
        body: "Even with automation, exported data should still be checked before it becomes part of accounting workpapers.",
      },
    ],
  },
];

const faqs = [
  {
    question: "How do accountants process bank statements faster?",
    answer:
      "They use digital PDFs, review-first conversion, batch workflows, and saved projects instead of handling each statement manually from scratch.",
  },
  {
    question: "Why does preview before export matter?",
    answer:
      "It helps catch row issues, missing references, or low-confidence extraction before the file reaches downstream work.",
  },
  {
    question: "Do batch uploads help accountants?",
    answer:
      "Yes. Batch uploads are useful when multiple client statements need to be processed in one session.",
  },
  {
    question: "Which banks are currently strongest?",
    answer:
      "FNB, Standard Bank, and Capitec are the strongest currently supported digital statement layouts.",
  },
  {
    question: "Do scanned bank statements work the same way?",
    answer:
      "No. Scanned and image-only statements are still best-effort and are not fully supported yet.",
  },
] as const;

export default function HowAccountantsProcessBankStatementsFasterPage() {
  return (
    <SeoSupportPage
      currentHref="/how-accountants-process-bank-statements-faster"
      eyebrow="How accountants process bank statements faster"
      title="How Accountants Process Bank Statements Faster"
      intro="Accountants process bank statements faster when they use digital PDFs, review-first conversion, batch uploads, and saved client workflows instead of repeating manual cleanup every month."
      shortAnswer="The fastest approach is to upload digital statement PDFs, review the extracted rows before export, and keep client work organized in projects so repeated statement handling becomes easier over time."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Build a faster bank statement workflow"
      ctaBody="Use batch uploads, preview before export, and saved projects to turn statement processing into a cleaner recurring workflow."
      relatedLinks={[...BLOG_RELATED_LINKS]}
    />
  );
}
