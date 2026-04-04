import type { PreviewRow } from "@/lib/types";

export type AdaptiveSchemaType =
  | "directional-balance"
  | "fee-balance"
  | "signed-balance";

export type ParserLearningProfile = {
  layoutSignature: string;
  preferredParserId: string | null;
  bankName: string | null;
  schemaHint: AdaptiveSchemaType | null;
  feedbackCount: number;
  acceptedCount: number;
  rejectedCount: number;
  trustScore: number;
  updatedAt: string | null;
};

export type StatementCell = {
  x: number;
  text: string;
};

export type StatementRow = {
  y: number;
  text: string;
  cells: StatementCell[];
};

export type StatementPage = {
  pageNumber: number;
  lines: string[];
  rows: StatementRow[];
  text: string;
};

export type StatementContext = {
  fileName: string;
  pageCount: number;
  layoutSignature: string;
  learningProfile: ParserLearningProfile | null;
  pages: StatementPage[];
  documentYear: number | null;
};

export type BankParser = {
  id: string;
  label: string;
  matches: (context: StatementContext) => boolean;
  parse: (context: StatementContext) => PreviewRow[];
  detectCurrency?: (context: StatementContext) => string | null;
};
