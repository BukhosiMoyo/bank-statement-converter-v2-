import { LegalPageShell } from "@/components/legal-page-shell";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms of service for Bank Statement Converter, including supported files, review responsibilities, plans, and workspace use.",
  path: "/terms",
});

const sections = [
  {
    title: "Using The Product",
    paragraphs: [
      "Use the product only for lawful work and only with statements and financial data you are authorized to process.",
      "You are responsible for activity performed through your account and workspace access.",
    ],
  },
  {
    title: "Supported Files And Parsing Limits",
    paragraphs: [
      "Digital, text-based bank statements work best in the current product. Scanned or image-only PDFs are not fully supported yet.",
      "Some bank layouts have stronger support than others, and unsupported layouts may fall back to best-effort parsing.",
    ],
  },
  {
    title: "Review Of Output",
    paragraphs: [
      "The product helps turn statements into working files, but it does not guarantee perfect extraction for every bank layout or every PDF.",
      "You are responsible for reviewing previews, confidence signals, and exported files before using them for accounting, reconciliation, reporting, or client work.",
    ],
  },
  {
    title: "Plans And Usage",
    bullets: [
      "Plan limits apply at the active workspace level.",
      "Statement usage is counted per successful processed file.",
      "Usage limits can block additional processing until the cycle resets or the workspace moves to a higher plan.",
      "Organization workspaces use shared plan and usage rules.",
    ],
  },
  {
    title: "Manual EFT Upgrades",
    paragraphs: [
      "Paid plans currently follow a manual EFT workflow. Requesting a paid plan does not activate it immediately.",
      "Activation happens only after payment is reviewed and approved. Until approval, your current plan and usage rules stay in effect.",
    ],
  },
  {
    title: "Workspace Conduct",
    paragraphs: [
      "Do not use the service to abuse shared workspaces, interfere with other users, upload harmful content, or attempt unauthorized access to accounts, projects, conversions, or payment records.",
    ],
  },
  {
    title: "Suspension And Changes",
    paragraphs: [
      "We may suspend or restrict access for misuse, abuse of plan limits, payment abuse, or other behavior that threatens the service or other users.",
      "We may update these terms as the product evolves. Continued use after updates means you accept the revised terms.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms of Service"
      intro="These terms describe the practical rules for using the product as it exists today, including supported inputs, review responsibility, plan behavior, and manual EFT upgrades."
      sections={sections.map((section) => ({ ...section }))}
      updatedAt="04 Apr 2026"
    />
  );
}
