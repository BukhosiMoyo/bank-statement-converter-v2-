import type { ConfidenceLevel, PreviewRow } from "@/lib/types";
import type { StatementRow } from "@/lib/bank-parsers/types";

export const GUEST_PAGE_LIMIT = 5;

const DATE_PATTERNS = [
  /^\d{2}[./-]\d{2}[./-]\d{2,4}/,
  /^\d{4}[./-]\d{2}[./-]\d{2}/,
  /^\d{2}\s+[A-Za-z]{3}\s+\d{2,4}(?=\s|$)/,
  /^\d{2}\s+[A-Za-z]{4,9}\s+\d{2,4}(?=\s|$)/,
  /^\d{2}\s+[A-Za-z]{3}/,
  /^\d{2}\s+[A-Za-z]{4,9}/,
] as const;

const MONTHS = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
} as const;

export const IGNORED_LINE_PATTERNS = [
  /^page\s+\d+/i,
  /^date\b/i,
  /^description\b/i,
  /^transaction\b/i,
  /^statement\b/i,
  /^opening balance\b/i,
  /^closing balance\b/i,
  /^available balance\b/i,
  /^balance brought forward\b/i,
  /^balances?$/i,
  /^totals?$/i,
  /^debits?$/i,
  /^credits?$/i,
] as const;

export type GroupedTextItem = {
  x: number;
  y: number;
  text: string;
};

export type MatchedDate = {
  raw: string;
  normalized: string;
};

export function isGroupedTextItem(value: unknown): value is {
  str: string;
  transform: number[];
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { str?: unknown; transform?: unknown };
  return (
    typeof candidate.str === "string" &&
    Array.isArray(candidate.transform) &&
    candidate.transform.length >= 6
  );
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function looksLikeAmount(token: string) {
  return /^-?\(?\d[\d\s,.]*\)?(?:cr|dr)?$/i.test(token);
}

export function looksLikeCurrencyAmountToken(token: string) {
  return /^-?\(?\d[\d,.]*[.,]\d{2}\)?(?:cr|dr)?$/i.test(token);
}

export function amountMarker(token: string) {
  const lower = token.trim().toLowerCase();

  if (lower.endsWith("cr")) {
    return "credit";
  }

  if (lower.endsWith("dr")) {
    return "debit";
  }

  return null;
}

export function parseMoney(token: string) {
  const compact = token.replace(/\u00a0/g, "").replace(/\s+/g, "");
  const lower = compact.toLowerCase();
  const suffix = lower.endsWith("cr") ? "cr" : lower.endsWith("dr") ? "dr" : "";
  const stripped = suffix ? compact.slice(0, -2) : compact;
  const negative =
    stripped.startsWith("-") || stripped.startsWith("(") || suffix === "dr";
  const unsigned = stripped.replace(/[()-]/g, "");
  const lastComma = unsigned.lastIndexOf(",");
  const lastDot = unsigned.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);

  let normalized = unsigned;

  if (decimalIndex >= 0) {
    const integerPart = unsigned.slice(0, decimalIndex).replace(/[.,]/g, "");
    const decimalPart = unsigned.slice(decimalIndex + 1).replace(/[.,]/g, "");
    normalized = `${integerPart}.${decimalPart}`;
  } else {
    normalized = unsigned.replace(/[.,]/g, "");
  }

  const value = Number.parseFloat(normalized);

  if (!Number.isFinite(value)) {
    return null;
  }

  return negative ? value * -1 : value;
}

export function formatAmount(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function inferYear(yearToken: string) {
  return yearToken.length === 2
    ? `${Number.parseInt(yearToken, 10) > 69 ? "19" : "20"}${yearToken}`
    : yearToken;
}

export function toIsoDate(value: string, fallbackYear?: number | null) {
  if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(value)) {
    const [year, month, day] = value.split(/[./-]/);
    return `${year}-${month}-${day}`;
  }

  if (/^\d{2}[./-]\d{2}[./-]\d{2,4}$/.test(value)) {
    const [day, month, yearToken] = value.split(/[./-]/);
    const year = inferYear(yearToken);
    return `${year}-${month}-${day}`;
  }

  const monthNameMatch = value.match(
    /^(\d{2})\s+([A-Za-z]{3,9})(?:\s+(\d{2,4}))?$/,
  );

  if (monthNameMatch) {
    const [, day, monthName, yearToken] = monthNameMatch;
    const month =
      MONTHS[monthName.slice(0, 3).toLowerCase() as keyof typeof MONTHS];
    const year = yearToken
      ? inferYear(yearToken)
      : fallbackYear
        ? String(fallbackYear)
        : null;

    if (month && year) {
      return `${year}-${month}-${day}`;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export function matchDatePrefix(
  line: string,
  fallbackYear?: number | null,
): MatchedDate | null {
  for (const pattern of DATE_PATTERNS) {
    const match = line.match(pattern);
    if (!match) {
      continue;
    }

    const normalized = toIsoDate(match[0], fallbackYear);
    if (!normalized) {
      continue;
    }

    return {
      raw: match[0],
      normalized,
    };
  }

  return null;
}

export function findReference(description: string) {
  const referenceMatch = description.match(/\b[A-Z0-9]{6,}\b/);
  return referenceMatch?.[0] ?? null;
}

export function scoreConfidence({
  amountCount,
  description,
  hasBalance,
}: {
  amountCount: number;
  description: string;
  hasBalance: boolean;
}): ConfidenceLevel {
  if (description.length >= 8 && amountCount >= 2 && hasBalance) {
    return "high";
  }

  if (description.length >= 4 && amountCount >= 1) {
    return "medium";
  }

  return "low";
}

export function isMonthNameDate(rawDate: string) {
  return /\d{2}\s+[A-Za-z]{3,9}/.test(rawDate);
}

export function buildTextRows(items: unknown[]): StatementRow[] {
  const buckets = new Map<number, GroupedTextItem[]>();

  for (const item of items) {
    if (!isGroupedTextItem(item)) {
      continue;
    }

    const text = normalizeWhitespace(item.str);
    if (!text) {
      continue;
    }

    const x = item.transform[4] ?? 0;
    const y = item.transform[5] ?? 0;
    const key = Math.round(y * 2) / 2;

    const entry = buckets.get(key) ?? [];
    entry.push({ x, y: key, text });
    buckets.set(key, entry);
  }

  return [...buckets.values()]
    .sort((left, right) => right[0].y - left[0].y)
    .map((group) => {
      const cells = group
        .sort((left, right) => left.x - right.x)
        .map((item) => ({
          x: item.x,
          text: item.text,
        }));

      return {
        y: group[0]?.y ?? 0,
        text: normalizeWhitespace(cells.map((item) => item.text).join(" ")),
        cells,
      };
    })
    .filter((row) => row.text.length > 0);
}

export function buildTextLines(items: unknown[]) {
  return buildTextRows(items).map((row) => row.text);
}

export function summarizeDates(rows: PreviewRow[]) {
  if (rows.length === 0) {
    return {
      start: null,
      end: null,
    };
  }

  const sortedDates = rows
    .map((row) => row.transactionDate)
    .sort((left, right) => left.localeCompare(right));

  return {
    start: sortedDates[0] ?? null,
    end: sortedDates.at(-1) ?? null,
  };
}

export function findDocumentYear(lines: string[]) {
  for (const line of lines) {
    const match =
      line.match(/\b(20\d{2})[./-]\d{2}[./-]\d{2}\b/) ??
      line.match(/\b\d{2}[./-]\d{2}[./-](20\d{2})\b/) ??
      line.match(/\b\d{2}\s+[A-Za-z]{3,9}\s+(20\d{2})\b/);

    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }

  return null;
}

export function extractTrailingAmounts(value: string, maxCount = 4) {
  const amounts: string[] = [];
  const tokens = normalizeWhitespace(value).split(" ").filter(Boolean);

  while (tokens.length > 0 && amounts.length < maxCount) {
    if (tokens.at(-1) === "*") {
      tokens.pop();
      continue;
    }

    const tail = tokens.at(-1);
    if (!tail || !looksLikeCurrencyAmountToken(tail)) {
      break;
    }

    const parts = [tokens.pop()!];

    while (tokens.length > 0 && /^\d{1,3}$/.test(tokens.at(-1)!)) {
      parts.unshift(tokens.pop()!);
    }

    amounts.unshift(parts.join(" "));
  }

  return {
    description: normalizeWhitespace(tokens.join(" ")),
    amounts,
  };
}
