import { DYNAMIC_BLOG_ARTICLE_LINKS } from "@/lib/blog-content";

export type PublicArticleLink = {
  href: string;
  label: string;
  description: string;
};

export type PublicGuideLink = {
  href: string;
  label: string;
};

export const BLOG_ARTICLES: PublicArticleLink[] = [
  {
    href: "/bank-statements-to-excel",
    label: "Bank Statements to Excel",
    description:
      "Convert statement PDFs into clean Excel-ready files for bookkeeping and review.",
  },
  {
    href: "/pdf-bank-statement-to-csv",
    label: "PDF Bank Statement to CSV",
    description:
      "Turn supported digital bank statement PDFs into structured CSV output.",
  },
  {
    href: "/bank-statement-converter-south-africa",
    label: "Bank Statement Converter South Africa",
    description:
      "A local workflow guide for firms processing South African bank statements.",
  },
  {
    href: "/best-bank-statement-converter-south-africa",
    label: "Best Bank Statement Converter South Africa",
    description:
      "What to look for when choosing a converter for accounting teams in South Africa.",
  },
  {
    href: "/how-accountants-process-bank-statements-faster",
    label: "How Accountants Process Bank Statements Faster",
    description:
      "Practical ways accountants reduce manual statement handling and cleanup time.",
  },
  {
    href: "/how-to-convert-bank-statement-to-excel",
    label: "How to Convert a Bank Statement to Excel",
    description:
      "A step-by-step guide to uploading, reviewing, and exporting clean Excel output.",
  },
  {
    href: "/convert-pdf-bank-statement-to-csv-step-by-step",
    label: "Convert PDF Bank Statement to CSV Step by Step",
    description:
      "A clear CSV workflow for finance teams working from digital bank statement PDFs.",
  },
  {
    href: "/fnb-bank-statement-to-excel",
    label: "FNB Bank Statement to Excel",
    description:
      "A focused guide for converting FNB statement layouts into working spreadsheet files.",
  },
  {
    href: "/standard-bank-statement-to-excel",
    label: "Standard Bank Statement to Excel",
    description:
      "How to process Standard Bank statement PDFs into Excel-ready exports.",
  },
  {
    href: "/capitec-bank-statement-to-excel",
    label: "Capitec Bank Statement to Excel",
    description:
      "A Capitec-specific guide for reviewing and exporting transaction rows.",
  },
  {
    href: "/absa-bank-statement-to-excel",
    label: "ABSA Bank Statement to Excel",
    description:
      "Convert ABSA bank statement PDFs into structured Excel or CSV exports for accounting workflows.",
  },
  {
    href: "/nedbank-bank-statement-to-excel",
    label: "Nedbank Bank Statement to Excel",
    description:
      "Convert Nedbank bank statement PDFs into clean Excel or CSV files for bookkeeping and reconciliation.",
  },
  {
    href: "/bank-statement-to-sage",
    label: "Import Bank Statement to Sage",
    description:
      "Prepare bank statement CSV exports for Sage accounting software import.",
  },
  {
    href: "/bank-statement-to-xero",
    label: "Import Bank Statement to Xero",
    description:
      "Prepare bank statement CSV exports for Xero accounting software import.",
  },
  {
    href: "/bank-statement-to-quickbooks",
    label: "Import Bank Statement to QuickBooks",
    description:
      "Prepare bank statement CSV exports for QuickBooks import.",
  },
  {
    href: "/investec-bank-statement-to-excel",
    label: "Investec Bank Statement to Excel",
    description:
      "Convert Investec bank statement PDFs into structured Excel or CSV exports.",
  },
  {
    href: "/discovery-bank-statement-to-excel",
    label: "Discovery Bank Statement to Excel",
    description:
      "Convert Discovery Bank statement PDFs into clean Excel or CSV files.",
  },
  {
    href: "/tymebank-bank-statement-to-excel",
    label: "TymeBank Bank Statement to Excel",
    description:
      "Convert TymeBank bank statement PDFs into structured Excel or CSV exports.",
  },
  {
    href: "/african-bank-statement-to-excel",
    label: "African Bank Statement to Excel",
    description:
      "Convert African Bank statement PDFs into clean Excel or CSV files.",
  },
  {
    href: "/can-you-convert-a-scanned-bank-statement-to-excel",
    label: "Can You Convert a Scanned Bank Statement to Excel?",
    description:
      "What works, what does not, and where scanned statements still need extra care.",
  },
  {
    href: "/free-bank-statement-converter",
    label: "Free Bank Statement Converter",
    description:
      "Convert bank statement PDFs to Excel and CSV for free with a review-first workflow.",
  },
  {
    href: "/bank-statement-parser",
    label: "Bank Statement Parser",
    description:
      "Parse bank statement PDFs and extract structured transaction data for accounting workflows.",
  },
  {
    href: "/automate-bank-reconciliation-south-africa",
    label: "Automate Bank Reconciliation South Africa",
    description:
      "Speed up bank reconciliation by automating the data capture step with PDF-to-CSV conversion.",
  },
  ...DYNAMIC_BLOG_ARTICLE_LINKS,
];

export const BLOG_RELATED_LINKS = [
  { href: "/blog", label: "All guides" },
  ...BLOG_ARTICLES.slice(0, 6).map((article) => ({
    href: article.href,
    label: article.label,
  })),
] as const;

function dedupeGuideLinks(links: PublicGuideLink[]) {
  return links.filter(
    (link, index, entries) =>
      entries.findIndex((candidate) => candidate.href === link.href) === index,
  );
}

export function buildGuideLinks({
  currentHref,
  preferredLinks = [],
  limit = 5,
}: {
  currentHref: string;
  preferredLinks?: PublicGuideLink[];
  limit?: number;
}) {
  const fallbackLinks = BLOG_ARTICLES.filter((article) => article.href !== currentHref).map(
    (article) => ({
      href: article.href,
      label: article.label,
    }),
  );

  return dedupeGuideLinks([
    { href: "/blog", label: "All guides" },
    ...preferredLinks,
    ...fallbackLinks,
  ])
    .filter((link) => link.href !== currentHref)
    .slice(0, limit);
}
