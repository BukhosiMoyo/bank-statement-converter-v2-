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
    href: "/can-you-convert-a-scanned-bank-statement-to-excel",
    label: "Can You Convert a Scanned Bank Statement to Excel?",
    description:
      "What works, what does not, and where scanned statements still need extra care.",
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
