import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata = {
  title: "Privacy Policy",
};

const sections = [
  {
    title: "What We Process",
    paragraphs: [
      "We process account details, workspace details, uploaded PDF data during conversion, parsed transaction data, project information, usage records, and payment request details needed to operate the product.",
      "When you are signed in, successful conversions can be saved so you can return to previews, reopen client work, and download exports again later.",
    ],
  },
  {
    title: "Original Statements",
    paragraphs: [
      "Original bank statement PDFs are processed to build a preview and export output, but they are not stored after conversion in the current product.",
      "This means the saved record is the parsed conversion data, not the original uploaded PDF file.",
    ],
  },
  {
    title: "Saved Conversion Data",
    bullets: [
      "Saved conversions can include the original filename, parsed bank metadata, date range, transaction rows, and export-ready data used to regenerate CSV and Excel downloads.",
      "Guest conversions are not saved as account history.",
      "Signed-in conversions are tied to the active personal or organization workspace.",
    ],
  },
  {
    title: "Projects, Workspaces, And Access",
    paragraphs: [
      "Personal workspaces keep saved conversions and projects under the user account that created them.",
      "Organization workspaces share projects, saved conversions, plan usage, and payment state with members based on workspace role and access rules.",
    ],
  },
  {
    title: "Payment Proof Files",
    paragraphs: [
      "If you request a paid plan by EFT, proof-of-payment files and any note you submit are stored so an admin can review the payment request.",
      "Proof files can be removed before approval where the product supports that action. After payment requests are processed or expire, proof files are cleaned according to the product’s retention behavior.",
    ],
  },
  {
    title: "Deletion And Retention",
    bullets: [
      "Saved conversions can be deleted where the current workspace and role allow it.",
      "Empty projects can be removed where supported.",
      "Open payment requests can expire.",
      "Processed or expired payment requests may remain as records, while stored proof files are cleaned after the retention window.",
    ],
  },
  {
    title: "Product Limits",
    paragraphs: [
      "This is a launch-stage SaaS product. We keep the privacy model aligned to the current product behavior and update this page as storage, retention, and workspace controls evolve.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This page explains what the product processes today, what is saved for ongoing work, and how data handling follows the current launch-stage behavior of the app."
      sections={sections.map((section) => ({ ...section }))}
      updatedAt="04 Apr 2026"
    />
  );
}
