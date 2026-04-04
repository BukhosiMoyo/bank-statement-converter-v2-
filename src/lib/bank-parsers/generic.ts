import type { PreviewRow } from "@/lib/types";
import type {
  AdaptiveSchemaType,
  BankParser,
} from "@/lib/bank-parsers/types";
import {
  IGNORED_LINE_PATTERNS,
  amountMarker,
  extractTrailingAmounts,
  findReference,
  formatAmount,
  isMonthNameDate,
  looksLikeAmount,
  looksLikeCurrencyAmountToken,
  matchDatePrefix,
  normalizeWhitespace,
  parseMoney,
  scoreConfidence,
} from "@/lib/bank-parsers/shared";

type AdaptiveSchema = AdaptiveSchemaType;

type ParsedCandidate = {
  balanceValue: number | null;
  row: PreviewRow;
};

const SECTION_STOP_PATTERNS = [
  /^statement summary\b/i,
  /^spending summary\b/i,
  /^interest, rewards and fees\b/i,
  /^please verify all transactions\b/i,
  /^today'?s debits have not yet been paid\b/i,
  /^24hr client care centre\b/i,
  /^customer care:/i,
  /^website:/i,
  /^the .* bank/i,
  /^we subscribe to\b/i,
  /^page \d+ of \d+$/i,
  /^pg \d+ of \d+$/i,
  /^\* includes vat at 15%$/i,
  /^unique document no\./i,
  /^available balance\b/i,
  /^opening balance\b/i,
  /^closing balance\b/i,
  /^print date:/i,
  /^from date:/i,
  /^to date:/i,
  /^account\b/i,
  /^tax invoice$/i,
  /^main account statement$/i,
  /^transaction history$/i,
  /^transaction details$/i,
  /^statement information$/i,
  /^interest fees$/i,
  /^other fees$/i,
  /^live better benefits fee summary$/i,
  /^totals?$/i,
  /^balances?$/i,
  /^debits?$/i,
  /^credits?$/i,
] as const;

const POSITIVE_DESCRIPTION_HINTS = [
  /\bsalary\b/i,
  /\bdeposit\b/i,
  /\brefund\b/i,
  /\binterest\b/i,
  /\bpayment received\b/i,
  /\breceived\b/i,
  /\btransfer from\b/i,
  /\bcredit\b/i,
  /\ballowance\b/i,
  /\breward\b/i,
  /\bincome\b/i,
] as const;

const NEGATIVE_DESCRIPTION_HINTS = [
  /\bpayment\b/i,
  /\bpurchase\b/i,
  /\bwithdraw/i,
  /\btransfer to\b/i,
  /\bcharge\b/i,
  /\bfee\b/i,
  /\bdebit\b/i,
  /\bcash sent\b/i,
  /\bprepaid\b/i,
  /\bcard purchase\b/i,
  /\bpayshap payment\b/i,
  /\bautobank cash withdrawal\b/i,
] as const;

function looksLikeLikelyMoneyToken(token: string) {
  return (
    looksLikeAmount(token) &&
    (looksLikeCurrencyAmountToken(token) ||
      amountMarker(token) !== null ||
      token.startsWith("-") ||
      token.startsWith("("))
  );
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function approximatelyEqual(left: number, right: number, epsilon = 0.05) {
  return Math.abs(roundMoney(left) - roundMoney(right)) <= epsilon;
}

function detectAdaptiveSchema(line: string): AdaptiveSchema | null {
  const lower = normalizeWhitespace(line).toLowerCase();

  if (!/\bdate\b/.test(lower) || !/\bbalance\b/.test(lower)) {
    return null;
  }

  const hasDescription =
    /\bdescription\b/.test(lower) ||
    /\bdetails\b/.test(lower) ||
    /\btransaction\b/.test(lower) ||
    /\bnarration\b/.test(lower) ||
    /\bparticulars\b/.test(lower) ||
    /\bmemo\b/.test(lower) ||
    /\breference\b/.test(lower);

  if (!hasDescription) {
    return null;
  }

  const hasMoneyIn = lower.includes("money in");
  const hasMoneyOut = lower.includes("money out");
  const hasDebit =
    /\bdebit(?:s)?\b/.test(lower) ||
    /\bpayment(?:s)?\b/.test(lower) ||
    /\bwithdrawal(?:s)?\b/.test(lower);
  const hasCredit =
    /\bcredit(?:s)?\b/.test(lower) ||
    /\bdeposit(?:s)?\b/.test(lower) ||
    /\breceived\b/.test(lower);
  const hasFee = /\bfee(?:s)?\b/.test(lower) || /\bcharge(?:s)?\b/.test(lower);
  const hasAmount = /\bamount\b/.test(lower) || /\bvalue\b/.test(lower);

  if (hasFee) {
    return "fee-balance";
  }

  if ((hasMoneyIn && hasMoneyOut) || (hasDebit && hasCredit)) {
    return "directional-balance";
  }

  if (hasAmount || /\bbalance\b/.test(lower)) {
    return "signed-balance";
  }

  return null;
}

function looksLikeSectionStop(line: string) {
  const cleanedLine = normalizeWhitespace(line);
  return SECTION_STOP_PATTERNS.some((pattern) => pattern.test(cleanedLine));
}

function inferDirectionFromDescription(description: string) {
  if (POSITIVE_DESCRIPTION_HINTS.some((pattern) => pattern.test(description))) {
    return 1;
  }

  if (NEGATIVE_DESCRIPTION_HINTS.some((pattern) => pattern.test(description))) {
    return -1;
  }

  return null;
}

function resolveSignedAmount({
  balanceValue,
  description,
  previousBalance,
  rawTokens,
  schema,
  values,
}: {
  balanceValue: number | null;
  description: string;
  previousBalance: number | null;
  rawTokens: string[];
  schema: AdaptiveSchema;
  values: number[];
}) {
  const explicitValues = values.map((value, index) => {
    const token = rawTokens[index] ?? "";
    const marker = amountMarker(token);

    if (marker === "credit") {
      return Math.abs(value);
    }

    if (marker === "debit") {
      return Math.abs(value) * -1;
    }

    return value;
  });

  const delta =
    balanceValue !== null && previousBalance !== null
      ? roundMoney(balanceValue - previousBalance)
      : null;
  const absoluteValues = explicitValues.map((value) => Math.abs(value));
  const explicitSum = roundMoney(
    explicitValues.reduce((sum, value) => sum + value, 0),
  );
  const absoluteSum = roundMoney(
    absoluteValues.reduce((sum, value) => sum + value, 0),
  );
  const directionalDifference =
    values.length >= 2
      ? roundMoney(Math.abs(explicitValues[1]) - Math.abs(explicitValues[0]))
      : null;
  const candidateSet = new Set<number>([
    explicitSum,
    absoluteSum,
    ...explicitValues,
    ...absoluteValues,
  ]);

  if (directionalDifference !== null) {
    candidateSet.add(directionalDifference);
    candidateSet.add(directionalDifference * -1);
  }

  if (delta !== null) {
    for (const candidate of candidateSet) {
      if (approximatelyEqual(candidate, delta)) {
        return delta;
      }
    }
  }

  if (explicitValues.some((value) => value < 0) || rawTokens.some((token) => amountMarker(token))) {
    return explicitSum;
  }

  if (schema === "directional-balance" && values.length >= 2) {
    return directionalDifference ?? explicitSum;
  }

  const describedDirection = inferDirectionFromDescription(description);
  if (describedDirection !== null) {
    return absoluteSum * describedDirection;
  }

  if (delta !== null) {
    return delta;
  }

  return explicitSum;
}

function buildPreviewRow({
  amount,
  balanceValue,
  confidenceAmountCount,
  date,
  description,
  pageNumber,
  rawText,
  rowIndex,
}: {
  amount: number;
  balanceValue: number | null;
  confidenceAmountCount: number;
  date: string;
  description: string;
  pageNumber: number;
  rawText: string;
  rowIndex: number;
}): ParsedCandidate {
  const debit = amount < 0 ? Math.abs(amount) : null;
  const credit = amount > 0 ? Math.abs(amount) : null;

  return {
    balanceValue,
    row: {
      id: `${pageNumber}-${rowIndex}`,
      rowIndex,
      transactionDate: date,
      description,
      reference: findReference(description),
      debit: formatAmount(debit),
      credit: formatAmount(credit),
      amount: formatAmount(amount) ?? "0.00",
      balance: formatAmount(balanceValue),
      sourcePage: pageNumber,
      confidence: scoreConfidence({
        amountCount: confidenceAmountCount,
        description,
        hasBalance: balanceValue !== null,
      }),
      rawText,
    },
  };
}

function parseAdaptiveLineToRow({
  fallbackYear,
  line,
  pageNumber,
  previousBalance,
  rowIndex,
  schema,
}: {
  fallbackYear?: number | null;
  line: string;
  pageNumber: number;
  previousBalance: number | null;
  rowIndex: number;
  schema: AdaptiveSchema;
}): ParsedCandidate | null {
  if (
    !line ||
    IGNORED_LINE_PATTERNS.some((pattern) => pattern.test(line)) ||
    looksLikeSectionStop(line)
  ) {
    return null;
  }

  const dateMatch = matchDatePrefix(line, fallbackYear);

  if (!dateMatch) {
    return null;
  }

  const remainder = normalizeWhitespace(line.slice(dateMatch.raw.length));
  const { description, amounts } = extractTrailingAmounts(remainder, 3);

  if (description.length === 0 || amounts.length < 2) {
    return null;
  }

  const parsedAmounts = amounts
    .map(parseMoney)
    .filter((value): value is number => value !== null);

  if (parsedAmounts.length !== amounts.length) {
    return null;
  }

  const balanceValue = parsedAmounts.at(-1) ?? null;
  const movementValues = parsedAmounts.slice(0, -1);
  const movementTokens = amounts.slice(0, -1);

  if (movementValues.length === 0) {
    return null;
  }

  const amount = resolveSignedAmount({
    balanceValue,
    description,
    previousBalance,
    rawTokens: movementTokens,
    schema,
    values: movementValues,
  });

  return buildPreviewRow({
    amount,
    balanceValue,
    confidenceAmountCount: parsedAmounts.length,
    date: dateMatch.normalized,
    description,
    pageNumber,
    rawText: line,
    rowIndex,
  });
}

function parseLegacyGenericLineToRow(
  line: string,
  pageNumber: number,
  rowIndex: number,
  previousBalance: number | null,
  fallbackYear?: number | null,
): ParsedCandidate | null {
  if (!line || IGNORED_LINE_PATTERNS.some((pattern) => pattern.test(line))) {
    return null;
  }

  const dateMatch = matchDatePrefix(line, fallbackYear);

  if (!dateMatch) {
    return null;
  }

  const remainder = normalizeWhitespace(line.slice(dateMatch.raw.length));
  const tokens = remainder.split(" ").filter(Boolean);
  const amountTokens: string[] = [];

  while (tokens.length > 0) {
    const nextToken = tokens.at(-1);

    if (!nextToken || !looksLikeLikelyMoneyToken(nextToken)) {
      break;
    }

    amountTokens.unshift(tokens.pop()!);
  }

  if (amountTokens.length === 0) {
    return null;
  }

  const usesMonthNameDate = isMonthNameDate(dateMatch.raw);
  const lastToken = amountTokens.at(-1) ?? null;
  const shouldPreferTrailingPair =
    usesMonthNameDate &&
    amountTokens.length > 2 &&
    lastToken !== null &&
    amountMarker(lastToken) !== null;

  if (shouldPreferTrailingPair) {
    tokens.push(...amountTokens.slice(0, -2));
    amountTokens.splice(0, amountTokens.length - 2);
  }

  const parsedAmounts = amountTokens
    .map(parseMoney)
    .filter((value): value is number => value !== null);

  if (parsedAmounts.length !== amountTokens.length) {
    return null;
  }

  const description = normalizeWhitespace(tokens.join(" "));
  let amount = 0;
  let balanceValue: number | null = null;

  if (parsedAmounts.length === 1) {
    amount = parsedAmounts[0];
  } else {
    balanceValue = parsedAmounts.at(-1) ?? null;
    const movementValues = parsedAmounts.slice(0, -1);
    const movementTokens = amountTokens.slice(0, -1);

    amount = resolveSignedAmount({
      balanceValue,
      description,
      previousBalance,
      rawTokens: movementTokens,
      schema: "signed-balance",
      values: movementValues,
    });
  }

  return buildPreviewRow({
    amount,
    balanceValue,
    confidenceAmountCount: parsedAmounts.length,
    date: dateMatch.normalized,
    description,
    pageNumber,
    rawText: line,
    rowIndex,
  });
}

function lineLooksLikeGenericContinuation(line: string, activeSchema: AdaptiveSchema | null) {
  const cleanedLine = normalizeWhitespace(line);

  if (
    !cleanedLine ||
    IGNORED_LINE_PATTERNS.some((pattern) => pattern.test(cleanedLine)) ||
    looksLikeSectionStop(cleanedLine) ||
    detectAdaptiveSchema(cleanedLine) !== null
  ) {
    return false;
  }

  if (matchDatePrefix(cleanedLine) || looksLikeAmount(cleanedLine)) {
    return false;
  }

  if (/^[A-Z0-9*#()/-]{6,}$/i.test(cleanedLine)) {
    return true;
  }

  if (activeSchema && /\d/.test(cleanedLine) && cleanedLine.split(" ").length > 6) {
    return false;
  }

  if (/[.?!]/.test(cleanedLine) && cleanedLine.length > 90) {
    return false;
  }

  return cleanedLine.length >= 3;
}

function appendContinuation(row: PreviewRow, line: string) {
  const continuation = normalizeWhitespace(line);
  const description = normalizeWhitespace(`${row.description} ${continuation}`);

  row.description = description;
  row.reference = row.reference ?? findReference(description);
  row.rawText = `${row.rawText} | ${continuation}`;
  row.confidence = scoreConfidence({
    amountCount:
      Number(row.debit !== null) + Number(row.credit !== null) + Number(row.balance !== null),
    description,
    hasBalance: row.balance !== null,
  });
}

export const genericParser: BankParser = {
  id: "adaptive-generic",
  label: "Adaptive Generic PDF",
  matches: () => true,
  parse: (context) => {
    const rows: PreviewRow[] = [];
    const learnedSchema = context.learningProfile?.schemaHint ?? null;
    let activeSchema: AdaptiveSchema | null = null;
    let nextRowIndex = 1;
    let pending: PreviewRow | null = null;
    let previousBalance: number | null = null;

    for (const page of context.pages) {
      for (const line of page.lines) {
        const cleanedLine = normalizeWhitespace(line);
        const schema = detectAdaptiveSchema(cleanedLine);

        if (schema) {
          if (pending) {
            rows.push(pending);
            pending = null;
          }

          activeSchema = schema;
          continue;
        }

        if (looksLikeSectionStop(cleanedLine)) {
          if (pending) {
            rows.push(pending);
            pending = null;
          }

          activeSchema = null;
          continue;
        }

        const schemaToUse = activeSchema ?? learnedSchema;
        const parsed: ParsedCandidate | null = schemaToUse
          ? parseAdaptiveLineToRow({
              fallbackYear: context.documentYear,
              line: cleanedLine,
              pageNumber: page.pageNumber,
              previousBalance,
              rowIndex: nextRowIndex,
              schema: schemaToUse,
            })
          : parseLegacyGenericLineToRow(
              cleanedLine,
              page.pageNumber,
              nextRowIndex,
              previousBalance,
              context.documentYear,
            );

        if (parsed) {
          if (pending) {
            rows.push(pending);
          }

          pending = parsed.row;
          previousBalance = parsed.balanceValue;
          nextRowIndex += 1;
          continue;
        }

        if (pending && lineLooksLikeGenericContinuation(cleanedLine, activeSchema)) {
          appendContinuation(pending, cleanedLine);
        }
      }
    }

    if (pending) {
      rows.push(pending);
    }

    return rows;
  },
};
