export type ConfidenceLevel = "high" | "medium" | "low";

export type PreviewRow = {
  id: string;
  rowIndex: number;
  transactionDate: string;
  description: string;
  reference: string | null;
  debit: string | null;
  credit: string | null;
  amount: string;
  balance: string | null;
  sourcePage: number;
  confidence: ConfidenceLevel;
  rawText: string;
};

export type StatementPreview = {
  fileName: string;
  pageCount: number;
  rowCount: number;
  detectedBank: string | null;
  detectedCurrency: string | null;
  parserId: string;
  layoutSignature: string;
  sourceDocumentKind?: "digital" | "likely_scanned";
  layoutSupport?: "strong" | "best_effort";
  reviewRecommended: boolean;
  statementStartDate: string | null;
  statementEndDate: string | null;
  rows: PreviewRow[];
};
