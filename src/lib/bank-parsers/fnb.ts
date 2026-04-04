import type { PreviewRow } from "@/lib/types";
import type { BankParser } from "@/lib/bank-parsers/types";
import {
  amountMarker,
  formatAmount,
  isMonthNameDate,
  looksLikeAmount,
  matchDatePrefix,
  normalizeWhitespace,
  parseMoney,
  scoreConfidence,
} from "@/lib/bank-parsers/shared";

const FNB_HINTS = [
  "Transactions in RAND (ZAR)",
  "Universal Branch Code",
  "Account Enquiries",
  "Delivery Method",
  "fnb.co.za",
] as const;

const FNB_NOISE_PATTERNS = [
  /^transactions in rand \(zar\)/i,
  /^branch number\b/i,
  /^account number\b/i,
  /^delivery method\b/i,
  /^customer vat registration number\b/i,
  /^bank vat registration number\b/i,
  /^street address\b/i,
  /^universal branch code\b/i,
  /^lost cards\b/i,
  /^account enquiries\b/i,
  /^fraud\b/i,
  /^relationship manager\b/i,
  /^fnb\.co\.za$/i,
  /^page \d+ of \d+$/i,
  /^ns\/iq\/wv\/dda fc$/i,
  /^\*?[A-Z][A-Z0-9 ().,'/-]+$/i,
  /^\d+$/,
] as const;

function looksLikeFnbReferenceCandidate(value: string) {
  return /^\d{3,}$/.test(value);
}

function splitFnbReference(description: string) {
  const match = description.match(/^(.*?)(?:\s+([A-Z0-9]{3,}))$/i);

  if (!match) {
    return { description, reference: null as string | null };
  }

  const [, baseDescription, candidate] = match;

  if (
    !looksLikeFnbReferenceCandidate(candidate) ||
    !/(credit|payment from|transfer from|magtape|payshap|deposit|from)/i.test(
      baseDescription,
    )
  ) {
    return { description, reference: null as string | null };
  }

  return {
    description: normalizeWhitespace(baseDescription),
    reference: candidate,
  };
}

function cleanupFnbDescription(value: string) {
  return normalizeWhitespace(
    value
      .replace(/\bNS\/IQ\/WV\/DDA FC\b/gi, "")
      .replace(/\bPage \d+ of \d+\b/gi, ""),
  );
}

function parseFnbLineToRow(
  line: string,
  pageNumber: number,
  rowIndex: number,
  fallbackYear?: number | null,
): PreviewRow | null {
  const cleanedLine = normalizeWhitespace(line);

  if (!cleanedLine || FNB_NOISE_PATTERNS.some((pattern) => pattern.test(cleanedLine))) {
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

  const lastToken = amountTokens.at(-1) ?? null;

  if (
    amountTokens.length > 2 &&
    lastToken !== null &&
    amountMarker(lastToken) !== null
  ) {
    tokens.push(...amountTokens.slice(0, -2));
    amountTokens.splice(0, amountTokens.length - 2);
  }

  if (amountTokens.length !== 2) {
    return null;
  }

  const [movementToken, balanceToken] = amountTokens;
  const movementValue = parseMoney(movementToken);
  const balanceValue = parseMoney(balanceToken);

  if (movementValue === null || balanceValue === null) {
    return null;
  }

  const { description: splitDescription, reference } = splitFnbReference(
    cleanupFnbDescription(tokens.join(" ")),
  );

  const description = splitDescription;
  let debit: number | null = null;
  let credit: number | null = null;
  let amount = 0;
  let balance = balanceValue;

  if (amountMarker(balanceToken) === "debit") {
    balance *= -1;
  }

  if (movementValue !== 0) {
    if (amountMarker(movementToken) === "credit") {
      credit = Math.abs(movementValue);
      amount = Math.abs(movementValue);
    } else if (amountMarker(movementToken) === "debit") {
      debit = Math.abs(movementValue);
      amount = Math.abs(movementValue) * -1;
    } else {
      debit = Math.abs(movementValue);
      amount = Math.abs(movementValue) * -1;
    }
  }

  return {
    id: `${pageNumber}-${rowIndex}`,
    rowIndex,
    transactionDate: dateMatch.normalized,
    description,
    reference,
    debit: formatAmount(debit),
    credit: formatAmount(credit),
    amount: formatAmount(amount) ?? "0.00",
    balance: formatAmount(balance),
    sourcePage: pageNumber,
    confidence: scoreConfidence({
      amountCount: 2,
      description,
      hasBalance: true,
    }),
    rawText: cleanedLine,
  };
}

export const fnbParser: BankParser = {
  id: "fnb",
  label: "FNB South Africa",
  matches: (context) => {
    const haystack = context.pages.map((page) => page.text).join("\n");
    const score =
      Number(/\bFNB\b/.test(haystack)) +
      FNB_HINTS.filter((hint) => haystack.includes(hint)).length;

    return score >= 2;
  },
  parse: (context) => {
    const rows: PreviewRow[] = [];

    for (const page of context.pages) {
      for (const line of page.lines) {
        const parsed = parseFnbLineToRow(
          line,
          page.pageNumber,
          rows.length + 1,
          context.documentYear,
        );

        if (parsed) {
          rows.push(parsed);
        }
      }
    }

    return rows;
  },
  detectCurrency: (context) => {
    const text = context.pages.map((page) => page.text).join("\n");
    return text.includes("Transactions in RAND (ZAR)") ? "ZAR" : null;
  },
};
