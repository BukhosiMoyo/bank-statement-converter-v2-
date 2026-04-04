import { capitecParser } from "@/lib/bank-parsers/capitec";
import { fnbParser } from "@/lib/bank-parsers/fnb";
import { genericParser } from "@/lib/bank-parsers/generic";
import { standardBankParser } from "@/lib/bank-parsers/standard-bank";
import type { BankParser, StatementContext } from "@/lib/bank-parsers/types";

const parsers: BankParser[] = [
  fnbParser,
  standardBankParser,
  capitecParser,
  genericParser,
];

export function selectBankParser(context: StatementContext) {
  const preferredParserId = context.learningProfile?.preferredParserId;

  if (preferredParserId) {
    const preferredParser = parsers.find(
      (parser) => parser.id === preferredParserId,
    );

    if (preferredParser) {
      return preferredParser;
    }
  }

  return parsers.find((parser) => parser.matches(context)) ?? genericParser;
}
