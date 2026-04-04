import type { PreviewRow } from "@/lib/types";
import type { BankParser } from "@/lib/bank-parsers/types";
import {
  formatAmount,
  matchDatePrefix,
  normalizeWhitespace,
  parseMoney,
  scoreConfidence,
} from "@/lib/bank-parsers/shared";

const CAPITEC_HINTS = [
  "Capitec Bank Limited",
  "Main Account Statement",
  "Transaction History",
  "24hr Client Care Centre 0860 10 20 43",
] as const;

const CAPITEC_NOISE_PATTERNS = [
  /^main account statement$/i,
  /^statement information$/i,
  /^interest, rewards and fees$/i,
  /^live better benefits fee summary$/i,
  /^spending summary$/i,
  /^transaction history$/i,
  /^date description category money in money out fee\* balance$/i,
  /^from date:/i,
  /^to date:/i,
  /^print date:/i,
  /^account \d+\b/i,
  /^tax invoice$/i,
  /^interest received\b/i,
  /^total fees\b/i,
  /^money in summary\b/i,
  /^money out summary\b/i,
  /^allowance\b/i,
  /^other income\b/i,
  /^refund\b/i,
  /^transfer\b/i,
  /^interest fees$/i,
  /^live better savings\b/i,
  /^cash sent fee\b/i,
  /^external immediate payment fee\b/i,
  /^monthly account admin fee\b/i,
  /^immediate payment fee\b/i,
  /^prepaid mobile purchase fee\b/i,
  /^prepaid electricity purchase fee\b/i,
  /^other fees$/i,
  /^digital payments\b/i,
  /^card payments\b/i,
  /^send cash\b/i,
  /^prepaid\b/i,
  /^cash withdrawal\b/i,
  /^online store\b/i,
  /^takeaways\b/i,
  /^groceries\b/i,
  /^cellphone\b/i,
  /^restaurants\b/i,
  /^public transport\b/i,
  /^electricity\b/i,
  /^personal care\b/i,
  /^\* includes vat at 15%$/i,
  /^24hr client care centre\b/i,
  /^capitec bank is an authorised financial services/i,
  /^unique document no\./i,
  /^\d{4}$/i,
] as const;

const CAPITEC_REFERENCE_PATTERNS = [
  /^\(?(\d{8,})\)?$/,
  /^[A-Z]\*{3,}\d{3}$/i,
] as const;

const CAPITEC_AMOUNT_PATTERN = String.raw`-?\d[\d ]*(?:[.,]\d{2})`;

function extractCapitecTrailingAmounts(value: string) {
  const amounts: string[] = [];
  let working = normalizeWhitespace(value);

  while (amounts.length < 3) {
    const match = working.match(
      new RegExp(String.raw`(?:^|\s)(${CAPITEC_AMOUNT_PATTERN})\s*$`),
    );

    if (!match || match.index === undefined) {
      break;
    }

    amounts.unshift(match[1]);
    working = working.slice(0, match.index).trimEnd();

    if (working.endsWith("*")) {
      working = working.slice(0, -1).trimEnd();
    }
  }

  return {
    description: normalizeWhitespace(working),
    amounts,
  };
}

function findCapitecReference(value: string) {
  const compact = normalizeWhitespace(value);

  for (const pattern of CAPITEC_REFERENCE_PATTERNS) {
    const match = compact.match(pattern);

    if (match) {
      return match[1] ?? match[0];
    }
  }

  const inlineAccountMatch = compact.match(/\((\d{8,})\)/);
  if (inlineAccountMatch) {
    return inlineAccountMatch[1];
  }

  return null;
}

function parseCapitecLineToRow(
  line: string,
  pageNumber: number,
  rowIndex: number,
  fallbackYear?: number | null,
): PreviewRow | null {
  const cleanedLine = normalizeWhitespace(line);

  if (
    !cleanedLine ||
    CAPITEC_NOISE_PATTERNS.some((pattern) => pattern.test(cleanedLine))
  ) {
    return null;
  }

  const dateMatch = matchDatePrefix(cleanedLine, fallbackYear);

  if (!dateMatch) {
    return null;
  }

  const remainder = normalizeWhitespace(cleanedLine.slice(dateMatch.raw.length));
  const { description, amounts } = extractCapitecTrailingAmounts(remainder);

  if (description.length === 0 || (amounts.length !== 2 && amounts.length !== 3)) {
    return null;
  }

  const [movementToken, feeToken, balanceToken] =
    amounts.length === 3
      ? amounts
      : [amounts[0], null, amounts[1]];
  const movementValue = parseMoney(movementToken);
  const feeValue = feeToken ? parseMoney(feeToken) : 0;
  const balanceValue = parseMoney(balanceToken);

  if (
    movementValue === null ||
    feeValue === null ||
    balanceValue === null
  ) {
    return null;
  }

  const netAmount = movementValue + feeValue;
  let debit: number | null = null;
  let credit: number | null = null;

  if (netAmount < 0) {
    debit = Math.abs(netAmount);
  } else if (netAmount > 0) {
    credit = Math.abs(netAmount);
  }

  return {
    id: `${pageNumber}-${rowIndex}`,
    rowIndex,
    transactionDate: dateMatch.normalized,
    description,
    reference: findCapitecReference(description),
    debit: formatAmount(debit),
    credit: formatAmount(credit),
    amount: formatAmount(netAmount) ?? "0.00",
    balance: formatAmount(balanceValue),
    sourcePage: pageNumber,
    confidence: scoreConfidence({
      amountCount: amounts.length,
      description,
      hasBalance: true,
    }),
    rawText: cleanedLine,
  };
}

function lineLooksLikeCapitecContinuation(line: string) {
  const cleanedLine = normalizeWhitespace(line);

  if (
    !cleanedLine ||
    CAPITEC_NOISE_PATTERNS.some((pattern) => pattern.test(cleanedLine))
  ) {
    return false;
  }

  return !matchDatePrefix(cleanedLine);
}

function appendCapitecContinuation(row: PreviewRow, line: string) {
  const continuation = normalizeWhitespace(line);
  const reference = findCapitecReference(continuation);

  if (reference) {
    row.reference = row.reference ?? reference;
    row.rawText = `${row.rawText} | ${continuation}`;
    return;
  }

  const description = normalizeWhitespace(`${row.description} ${continuation}`);

  row.description = description;
  row.reference = row.reference ?? findCapitecReference(description);
  row.rawText = `${row.rawText} | ${continuation}`;
  row.confidence = scoreConfidence({
    amountCount: 2,
    description,
    hasBalance: row.balance !== null,
  });
}

export const capitecParser: BankParser = {
  id: "capitec",
  label: "Capitec South Africa",
  matches: (context) => {
    const haystack = context.pages.map((page) => page.text).join("\n");
    const score = CAPITEC_HINTS.filter((hint) => haystack.includes(hint)).length;

    return score >= 2;
  },
  parse: (context) => {
    const rows: PreviewRow[] = [];
    let nextRowIndex = 1;

    for (const page of context.pages) {
      let pending: PreviewRow | null = null;

      for (const line of page.lines) {
        const parsed = parseCapitecLineToRow(
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

        if (pending && lineLooksLikeCapitecContinuation(line)) {
          appendCapitecContinuation(pending, line);
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
