export const CURRENCY_OPTIONS = [
  { value: "ZAR", label: "South African Rand (ZAR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
] as const;

export type SupportedCurrency = (typeof CURRENCY_OPTIONS)[number]["value"];

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return CURRENCY_OPTIONS.some((option) => option.value === value);
}
