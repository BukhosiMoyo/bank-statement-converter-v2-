import type { StatementPreview } from "@/lib/types";

function resolveExportBaseName(
  preview: StatementPreview,
  preferredBaseName?: string | null,
) {
  return (
    preferredBaseName?.trim() || preview.fileName.replace(/\.pdf$/i, "") || "statement-preview"
  );
}

function padTimestampPart(value: number) {
  return String(value).padStart(2, "0");
}

function parseSpreadsheetNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const isNegative =
    trimmed.startsWith("-") ||
    trimmed.endsWith("Dr") ||
    (trimmed.startsWith("(") && trimmed.endsWith(")"));
  const normalized = trimmed
    .replaceAll(",", "")
    .replaceAll(" ", "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replace(/Cr$/i, "")
    .replace(/Dr$/i, "")
    .replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return isNegative ? -Math.abs(parsed) : parsed;
}

function parseSpreadsheetDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10),
    );
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date;
}

export function buildCsv(preview: StatementPreview) {
  const header = [
    "Date",
    "Description",
    "Reference",
    "Debit",
    "Credit",
    "Amount",
    "Balance",
    "Page",
    "Confidence",
  ];

  const rows = preview.rows.map((row) =>
    [
      row.transactionDate,
      row.description,
      row.reference ?? "",
      row.debit ?? "",
      row.credit ?? "",
      row.amount,
      row.balance ?? "",
      row.sourcePage,
      row.confidence,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [header.join(","), ...rows].join("\n");
}

export function resolveCsvFileName(
  preview: StatementPreview,
  preferredBaseName?: string | null,
) {
  return `${resolveExportBaseName(preview, preferredBaseName)}.csv`;
}

export function resolveXlsxFileName(
  preview: StatementPreview,
  preferredBaseName?: string | null,
) {
  return `${resolveExportBaseName(preview, preferredBaseName)}.xlsx`;
}

export function resolveBatchZipFileName(date = new Date()) {
  const timestamp = [
    date.getFullYear(),
    padTimestampPart(date.getMonth() + 1),
    padTimestampPart(date.getDate()),
    "-",
    padTimestampPart(date.getHours()),
    padTimestampPart(date.getMinutes()),
    padTimestampPart(date.getSeconds()),
  ].join("");

  return `statement-batch-${timestamp}.zip`;
}

export async function buildWorkbook(preview: StatementPreview) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  workbook.creator = "Bank Statement Converter";
  workbook.created = new Date();

  worksheet.columns = [
    {
      header: "Date",
      key: "date",
      width: 14,
      style: { numFmt: "yyyy-mm-dd" },
    },
    {
      header: "Description",
      key: "description",
      width: 40,
    },
    {
      header: "Reference",
      key: "reference",
      width: 22,
    },
    {
      header: "Debit",
      key: "debit",
      width: 14,
      style: { numFmt: "#,##0.00" },
    },
    {
      header: "Credit",
      key: "credit",
      width: 14,
      style: { numFmt: "#,##0.00" },
    },
    {
      header: "Balance",
      key: "balance",
      width: 16,
      style: { numFmt: "#,##0.00" },
    },
    {
      header: "Source Page",
      key: "sourcePage",
      width: 12,
    },
  ];

  preview.rows.forEach((row) => {
    worksheet.addRow({
      date: parseSpreadsheetDate(row.transactionDate),
      description: row.description,
      reference: row.reference ?? "",
      debit: parseSpreadsheetNumber(row.debit),
      credit: parseSpreadsheetNumber(row.credit),
      balance: parseSpreadsheetNumber(row.balance),
      sourcePage: row.sourcePage,
    });
  });

  const headerRow = worksheet.getRow(1);

  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };
  worksheet.autoFilter = "A1:G1";

  return workbook;
}

export async function buildXlsx(preview: StatementPreview) {
  return (await buildWorkbook(preview)).xlsx.writeBuffer();
}
