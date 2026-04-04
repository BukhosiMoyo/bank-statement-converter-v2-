import type { Metadata } from "next";

import { SeoSupportPage } from "@/components/seo-support-page";

export const metadata: Metadata = {
  title: "Bank Statement Converter South Africa",
  description:
    "Bank statement converter South Africa firms can use for digital PDF statements, client projects, team workspaces, and Excel or CSV exports.",
  keywords: [
    "bank statement converter South Africa",
    "South African bank statement converter",
    "bank statement converter for accountants in South Africa",
    "convert bank statements to excel South Africa",
  ],
  openGraph: {
    title: "Bank Statement Converter South Africa",
    description:
      "Built for South African accountants and firms handling digital bank statements, client projects, and shared team workflows.",
    type: "article",
    siteName: "Bank Statement Converter",
  },
};

const sections = [
  {
    eyebrow: "Supported banks",
    title: "Supported South African bank layouts",
    intro:
      "The current strongest South African bank layouts are built around real conversion workflows for accountants and finance teams.",
    columns: 3 as const,
    cards: [
      {
        title: "FNB",
        body: "FNB statements are among the strongest currently supported layouts for digital PDF extraction.",
      },
      {
        title: "Standard Bank",
        body: "Standard Bank digital statements are supported with structured transaction extraction and preview.",
      },
      {
        title: "Capitec",
        body: "Capitec is part of the strongest supported bank group for current South African conversion flows.",
      },
      {
        title: "Best-effort layouts",
        body: "Other digital South African bank statements can still be parsed using the generic fallback workflow.",
      },
    ],
  },
  {
    eyebrow: "Workspace value",
    title: "Built for firms managing client work in South Africa",
    intro:
      "This is more than one-off conversion. The workspace model is built for recurring accounting and bookkeeping work.",
    columns: 3 as const,
    cards: [
      {
        title: "Projects for client files",
        body: "Group saved conversions by client or job so recurring statement work stays organized over time.",
      },
      {
        title: "Team workspace",
        body: "Use organization workspaces when your accounting team needs shared access to projects and conversions.",
      },
      {
        title: "Shared usage and plan control",
        body: "Business workspaces keep shared statement limits, credits, and plan state at the organization level.",
      },
    ],
  },
  {
    eyebrow: "Payment trust",
    title: "Manual EFT upgrades built for South African workflows",
    intro:
      "The upgrade path matches the current product reality and keeps payment activation clear for early customers.",
    columns: 3 as const,
    cards: [
      {
        title: "Request a plan",
        body: "Choose a paid plan or credit pack and generate an EFT payment request with a unique reference.",
      },
      {
        title: "Upload proof",
        body: "Submit proof of payment inside the app so the request is ready for review.",
      },
      {
        title: "Activate after approval",
        body: "Paid plans and credits activate only after approval, keeping the workflow clear and trustworthy.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Is this a bank statement converter for South Africa?",
    answer:
      "Yes. The product is positioned for South African accountants and firms, with strong support for key local bank layouts.",
  },
  {
    question: "Which South African banks are currently strongest?",
    answer:
      "FNB, Standard Bank, and Capitec are the strongest current layouts for digital PDF conversion.",
  },
  {
    question: "Can South African accountants use this for Excel exports?",
    answer:
      "Yes. You can convert bank statements to Excel in South Africa using the same preview-and-review workflow used across the product.",
  },
  {
    question: "Can my team work in one shared workspace?",
    answer:
      "Yes. Organization workspaces support shared projects, shared conversions, and role-based access for teams.",
  },
  {
    question: "How do upgrades work in South Africa?",
    answer:
      "Paid upgrades currently use a manual EFT flow: request the plan, pay with the provided reference, upload proof, and wait for approval.",
  },
  {
    question: "Are original PDFs stored after conversion?",
    answer:
      "No. Original PDFs are not stored after conversion, while saved conversion data stays tied to the active workspace.",
  },
] as const;

export default function BankStatementConverterSouthAfricaPage() {
  return (
    <SeoSupportPage
      eyebrow="Bank statement converter South Africa"
      title="Bank Statement Converter South Africa"
      intro="Built for South African accountants and firms that need digital bank statements turned into clean Excel or CSV outputs, with projects and team workspaces for ongoing client work."
      shortAnswer="Yes. This South African bank statement converter is built for accountants who need to convert digital statement PDFs, review the output, organize client work, and manage upgrades through a clear EFT flow."
      sections={sections}
      faqs={[...faqs]}
      ctaTitle="Start processing South African bank statements with a cleaner workflow"
      ctaBody="Use the converter for digital PDF statements, group saved work by client, and move into team workspaces when your firm needs shared access."
    />
  );
}
