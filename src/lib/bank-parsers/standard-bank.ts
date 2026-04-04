import type { PreviewRow } from "@/lib/types";
import type { BankParser } from "@/lib/bank-parsers/types";
import {
  formatAmount,
  isMonthNameDate,
  looksLikeAmount,
  matchDatePrefix,
  normalizeWhitespace,
  parseMoney,
  scoreConfidence,
} from "@/lib/bank-parsers/shared";

const STANDARD_BANK_HINTS = [
  "STANDARD BANK",
  "standardbank.co.za",
  "Customer Care: 0860 123 000",
  "Transaction details",
  "Date Description Payments Deposits Balance",
] as const;

const STANDARD_BANK_NOISE_PATTERNS = [
  /^customer care:/i,
  /^website:/i,
  /^standard bank$/i,
  /^3 month statement$/i,
  /^from:/i,
  /^to:/i,
  /^account number:/i,
  /^account holder:/i,
  /^product name:/i,
  /^available balance:/i,
  /^transaction details$/i,
  /^date description payments deposits balance$/i,
  /^statement opening balance\b/i,
  /^statement summary$/i,
  /^payments\s+-?r/i,
  /^deposits\s+r/i,
  /^today'?s debits have not yet been paid$/i,
  /^please verify all transactions reflected on this statement/i,
  /^the standard bank of south africa limited/i,
  /^we subscribe to the code of banking association south africa/i,
  /^pg \d+ of \d+$/i,
  /^za$/i,
  /^\d{6}$/i,
  /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/i,
] as const;

const STANDARD_BANK_REFERENCE_PATTERNS = [
  /\b\d{4}\*\d{4}\b/,
  /\b[A-Z]{3}\d{6,}\b/i,
  /\b\d{4}[A-Z]\d{3,}\b/i,
  /\*{2,}\d{4,}\b/,
  /\b\d{8,}\b/,
] as const;

function cleanupStandardBankDescription(value: string) {
  return normalizeWhitespace(value);
}

function findStandardBankReference(value: string) {
  for (const pattern of STANDARD_BANK_REFERENCE_PATTERNS) {
    const match = value.match(pattern);

    if (match) {
      return match[0];
    }
  }

  return null;
}

function parseStandardBankLineToRow(
  line: string,
  pageNumber: number,
  rowIndex: number,
  fallbackYear?: number | null,
): PreviewRow | null {
  const cleanedLine = normalizeWhitespace(line);

  if (
    !cleanedLine ||
    STANDARD_BANK_NOISE_PATTERNS.some((pattern) => pattern.test(cleanedLine))
  ) {
    return null;
  }

  const dateMatch = matchDatePrefix(cleanedLine, fallbackYear);

  if (!dateMatch || !isMonthNameDate(dateMatch.raw)) {
    return null;
  }

  const remainder = normalizeWhitespace(cleanedLine.slice(dateMatch.raw.length));
  const tokens = remainder.split(" ").filter(Boolean);
  const amountTokens: string[] = [];

  while (tokens.length > 0) {
    const nextToken = tokens.at(-1);

    if (!nextToken || !looksLikeAmount(nextToken)) {
      break;
    }

    amountTokens.unshift(tokens.pop()!);
  }

  if (amountTokens.length < 2) {
    return null;
  }

  if (amountTokens.length > 2) {
    tokens.push(...amountTokens.slice(0, -2));
    amountTokens.splice(0, amountTokens.length - 2);
  }

  const [movementToken, balanceToken] = amountTokens;
  const movementValue = parseMoney(movementToken);
  const balanceValue = parseMoney(balanceToken);

  if (movementValue === null || balanceValue === null) {
    return null;
  }

  const description = cleanupStandardBankDescription(tokens.join(" "));
  let debit: number | null = null;
  let credit: number | null = null;

  if (movementValue < 0) {
    debit = Math.abs(movementValue);
  } else if (movementValue > 0) {
    credit = Math.abs(movementValue);
  }

  return {
    id: `${pageNumber}-${rowIndex}`,
    rowIndex,
    transactionDate: dateMatch.normalized,
    description,
    reference: findStandardBankReference(description),
    debit: formatAmount(debit),
    credit: formatAmount(credit),
    amount: formatAmount(movementValue) ?? "0.00",
    balance: formatAmount(balanceValue),
    sourcePage: pageNumber,
    confidence: scoreConfidence({
      amountCount: 2,
      description,
      hasBalance: true,
    }),
    rawText: cleanedLine,
  };
}

function lineLooksLikeStandardBankContinuation(line: string) {
  const cleanedLine = normalizeWhitespace(line);

  if (
    !cleanedLine ||
    STANDARD_BANK_NOISE_PATTERNS.some((pattern) => pattern.test(cleanedLine))
  ) {
    return false;
  }

  if (matchDatePrefix(cleanedLine)) {
    return false;
  }

  return cleanedLine.length <= 60;
}

function appendStandardBankContinuation(row: PreviewRow, line: string) {
  const continuation = normalizeWhitespace(line);
  const description = normalizeWhitespace(`${row.description} ${continuation}`);

  row.description = description;
  row.reference = row.reference ?? findStandardBankReference(description);
  row.rawText = `${row.rawText} | ${continuation}`;
  row.confidence = scoreConfidence({
    amountCount: 2,
    description,
    hasBalance: row.balance !== null,
  });
}

export const standardBankParser: BankParser = {
  id: "standard-bank",
  label: "Standard Bank South Africa",
  matches: (context) => {
    const haystack = context.pages.map((page) => page.text).join("\n");
    const score = STANDARD_BANK_HINTS.filter((hint) =>
      haystack.includes(hint),
    ).length;

    return score >= 2;
  },
  parse: (context) => {
    const rows: PreviewRow[] = [];
    let nextRowIndex = 1;

    for (const page of context.pages) {
      let pending: PreviewRow | null = null;

      for (const line of page.lines) {
        const parsed = parseStandardBankLineToRow(
          line,
          page.pageNumber,
          nextRowIndex,
          context.documentYear,
        );

        if (parsed) {
          if (pending) {
            rows.push(pending);
          }

          pending = parsed;
          nextRowIndex += 1;
          continue;
        }

        if (pending && lineLooksLikeStandardBankContinuation(line)) {
          appendStandardBankContinuation(pending, line);
        }
      }

      if (pending) {
        rows.push(pending);
      }
    }

    return rows;
  },
  detectCurrency: () => "ZAR",
};
