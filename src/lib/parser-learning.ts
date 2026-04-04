import { randomUUID } from "node:crypto";

import type {
  AdaptiveSchemaType,
  ParserLearningProfile,
} from "@/lib/bank-parsers/types";
import { getDatabasePool, hasDatabaseUrl } from "@/lib/db";

type ParserFeedbackEntry = {
  id: string;
  layoutSignature: string;
  submittedAt: string;
  parserId: string;
  detectedBank: string | null;
  accepted: boolean;
  preferredParserId: string | null;
  bankName: string | null;
  schemaHint: AdaptiveSchemaType | null;
  notes: string | null;
};

export type RecordParserFeedbackInput = {
  layoutSignature: string;
  parserId: string;
  detectedBank?: string | null;
  accepted: boolean;
  preferredParserId?: string | null;
  bankName?: string | null;
  schemaHint?: AdaptiveSchemaType | null;
  notes?: string | null;
};

let schemaReadyPromise: Promise<void> | null = null;

function chooseRecentValue<T extends string>(
  entries: ParserFeedbackEntry[],
  pick: (entry: ParserFeedbackEntry) => T | null,
) {
  const candidate = [...entries]
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
    .find((entry) => pick(entry));

  return candidate ? pick(candidate) : null;
}

function chooseParserId(entries: ParserFeedbackEntry[]) {
  const preferred = chooseRecentValue(entries, (entry) => entry.preferredParserId);

  if (preferred) {
    return preferred;
  }

  const votes = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.accepted) {
      continue;
    }

    votes.set(entry.parserId, (votes.get(entry.parserId) ?? 0) + 1);
  }

  return [...votes.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function buildLearningProfile(
  layoutSignature: string,
  entries: ParserFeedbackEntry[],
): ParserLearningProfile | null {
  if (entries.length === 0) {
    return null;
  }

  const acceptedCount = entries.filter((entry) => entry.accepted).length;
  const rejectedCount = entries.length - acceptedCount;
  const preferredParserId = chooseParserId(entries);
  const bankName =
    chooseRecentValue(entries, (entry) => entry.bankName) ??
    chooseRecentValue(
      entries.filter((entry) => entry.accepted),
      (entry) => entry.detectedBank,
    );
  const schemaHint = chooseRecentValue(entries, (entry) => entry.schemaHint);
  const updatedAt = [...entries]
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0]
    ?.submittedAt ?? null;

  return {
    layoutSignature,
    preferredParserId,
    bankName,
    schemaHint,
    feedbackCount: entries.length,
    acceptedCount,
    rejectedCount,
    trustScore: entries.length > 0 ? acceptedCount / entries.length : 0,
    updatedAt,
  };
}

async function ensureParserFeedbackTable() {
  if (!hasDatabaseUrl()) {
    return;
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const pool = getDatabasePool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS parser_feedback_entries (
          id TEXT PRIMARY KEY,
          layout_signature TEXT NOT NULL,
          submitted_at TIMESTAMPTZ NOT NULL,
          parser_id TEXT NOT NULL,
          detected_bank TEXT,
          accepted BOOLEAN NOT NULL,
          preferred_parser_id TEXT,
          bank_name TEXT,
          schema_hint TEXT,
          notes TEXT
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS parser_feedback_entries_layout_signature_idx
        ON parser_feedback_entries (layout_signature, submitted_at DESC)
      `);
    })();
  }

  await schemaReadyPromise;
}

function mapRowToEntry(row: Record<string, unknown>): ParserFeedbackEntry {
  return {
    id: String(row.id),
    layoutSignature: String(row.layout_signature),
    submittedAt: new Date(String(row.submitted_at)).toISOString(),
    parserId: String(row.parser_id),
    detectedBank:
      typeof row.detected_bank === "string" ? row.detected_bank : null,
    accepted: Boolean(row.accepted),
    preferredParserId:
      typeof row.preferred_parser_id === "string"
        ? row.preferred_parser_id
        : null,
    bankName: typeof row.bank_name === "string" ? row.bank_name : null,
    schemaHint:
      row.schema_hint === "directional-balance" ||
      row.schema_hint === "fee-balance" ||
      row.schema_hint === "signed-balance"
        ? row.schema_hint
        : null,
    notes: typeof row.notes === "string" ? row.notes : null,
  };
}

async function getEntriesForLayout(layoutSignature: string) {
  if (!hasDatabaseUrl()) {
    return [] as ParserFeedbackEntry[];
  }

  await ensureParserFeedbackTable();

  const pool = getDatabasePool();
  const result = await pool.query(
    `
      SELECT
        id,
        layout_signature,
        submitted_at,
        parser_id,
        detected_bank,
        accepted,
        preferred_parser_id,
        bank_name,
        schema_hint,
        notes
      FROM parser_feedback_entries
      WHERE layout_signature = $1
      ORDER BY submitted_at DESC
    `,
    [layoutSignature],
  );

  return result.rows.map(mapRowToEntry);
}

export async function getParserLearningProfile(layoutSignature: string) {
  const entries = await getEntriesForLayout(layoutSignature);
  return buildLearningProfile(layoutSignature, entries);
}

export async function listParserFeedbackEntries(layoutSignature: string) {
  return getEntriesForLayout(layoutSignature);
}

export async function recordParserFeedback(input: RecordParserFeedbackInput) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await ensureParserFeedbackTable();

  const pool = getDatabasePool();

  await pool.query(
    `
      INSERT INTO parser_feedback_entries (
        id,
        layout_signature,
        submitted_at,
        parser_id,
        detected_bank,
        accepted,
        preferred_parser_id,
        bank_name,
        schema_hint,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      randomUUID(),
      input.layoutSignature,
      new Date().toISOString(),
      input.parserId,
      input.detectedBank ?? null,
      input.accepted,
      input.preferredParserId ?? null,
      input.bankName ?? null,
      input.schemaHint ?? null,
      input.notes ?? null,
    ],
  );

  return getParserLearningProfile(input.layoutSignature);
}
