import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const ENV_FILES = [
  ".env",
  ".env.production",
  ".env.local",
  ".env.production.local",
];
const DEFAULT_MAX_STATEMENT_UPLOAD_MB = 20;
const DEFAULT_PAYMENT_PROOF_RETENTION_DAYS = 30;

function parseEnvFile(fileContents) {
  const parsed = {};

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalized = line.startsWith("export ") ? line.slice(7) : line;
    const separatorIndex = normalized.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function loadEffectiveEnv() {
  const loadedFiles = [];
  const effectiveEnv = {};

  for (const fileName of ENV_FILES) {
    const filePath = path.join(ROOT_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    Object.assign(effectiveEnv, parseEnvFile(fs.readFileSync(filePath, "utf8")));
    loadedFiles.push(fileName);
  }

  Object.assign(effectiveEnv, process.env);

  return {
    effectiveEnv,
    loadedFiles,
  };
}

function readEnv(env, key) {
  const value = env[key];

  return typeof value === "string" ? value.trim() : "";
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(value);
}

function looksLikePlaceholder(value) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized === "" ||
    normalized.includes("your-domain.com") ||
    normalized.includes("example.com") ||
    normalized.includes("postgresql://...") ||
    normalized.includes("your bank") ||
    normalized === "0000000000"
  );
}

function looksLikeLocalHost(value) {
  return /localhost|127\.0\.0\.1/i.test(value);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function printSection(title, entries) {
  if (entries.length === 0) {
    return;
  }

  console.log(`${title}:`);

  for (const entry of entries) {
    console.log(`- ${entry}`);
  }
}

const { effectiveEnv, loadedFiles } = loadEffectiveEnv();
const errors = [];
const warnings = [];

const siteUrl = readEnv(effectiveEnv, "SITE_URL");
const publicSiteUrl = readEnv(effectiveEnv, "NEXT_PUBLIC_SITE_URL");
const databaseUrl = readEnv(effectiveEnv, "DATABASE_URL");
const adminEmails = readEnv(effectiveEnv, "ADMIN_EMAILS");
const eftAccountName = readEnv(effectiveEnv, "EFT_ACCOUNT_NAME");
const eftBankName = readEnv(effectiveEnv, "EFT_BANK_NAME");
const eftAccountNumber = readEnv(effectiveEnv, "EFT_ACCOUNT_NUMBER");
const resendApiKey = readEnv(effectiveEnv, "RESEND_API_KEY");
const emailFrom = readEnv(effectiveEnv, "EMAIL_FROM");
const emailFromAccounts = readEnv(effectiveEnv, "EMAIL_FROM_ACCOUNTS");
const emailFromBilling = readEnv(effectiveEnv, "EMAIL_FROM_BILLING");
const pgssl = readEnv(effectiveEnv, "PGSSL");
const paymentProofRetentionDays =
  readEnv(effectiveEnv, "PAYMENT_PROOF_RETENTION_DAYS") ||
  String(DEFAULT_PAYMENT_PROOF_RETENTION_DAYS);
const maxStatementUploadMb =
  readEnv(effectiveEnv, "MAX_STATEMENT_UPLOAD_MB") ||
  String(DEFAULT_MAX_STATEMENT_UPLOAD_MB);

if (!siteUrl) {
  errors.push("SITE_URL is missing.");
} else if (!isValidUrl(siteUrl)) {
  errors.push("SITE_URL must be a valid absolute URL.");
} else if (looksLikePlaceholder(siteUrl) || looksLikeLocalHost(siteUrl)) {
  errors.push("SITE_URL still points to a placeholder or localhost value.");
}

if (!publicSiteUrl) {
  errors.push("NEXT_PUBLIC_SITE_URL is missing.");
} else if (!isValidUrl(publicSiteUrl)) {
  errors.push("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
} else if (
  looksLikePlaceholder(publicSiteUrl) ||
  looksLikeLocalHost(publicSiteUrl)
) {
  errors.push(
    "NEXT_PUBLIC_SITE_URL still points to a placeholder or localhost value.",
  );
}

if (siteUrl && publicSiteUrl && siteUrl !== publicSiteUrl) {
  errors.push("SITE_URL and NEXT_PUBLIC_SITE_URL should match in production.");
}

if (!databaseUrl) {
  errors.push("DATABASE_URL is missing.");
} else if (looksLikePlaceholder(databaseUrl)) {
  errors.push("DATABASE_URL is still a placeholder value.");
} else if (looksLikeLocalHost(databaseUrl)) {
  errors.push("DATABASE_URL still points to a local database.");
}

if (pgssl === "disable" && databaseUrl && !looksLikeLocalHost(databaseUrl)) {
  errors.push("PGSSL=disable is unsafe for a hosted database.");
}

if (!adminEmails) {
  errors.push("ADMIN_EMAILS is missing.");
} else {
  const parsedAdminEmails = adminEmails
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (parsedAdminEmails.length === 0) {
    errors.push("ADMIN_EMAILS must include at least one address.");
  }

  if (parsedAdminEmails.some((value) => looksLikePlaceholder(value))) {
    errors.push("ADMIN_EMAILS still contains placeholder addresses.");
  }
}

if (!eftAccountName || looksLikePlaceholder(eftAccountName)) {
  errors.push("EFT_ACCOUNT_NAME is missing or still using a placeholder value.");
}

if (!eftBankName || looksLikePlaceholder(eftBankName)) {
  errors.push("EFT_BANK_NAME is missing or still using a placeholder value.");
}

if (!eftAccountNumber || looksLikePlaceholder(eftAccountNumber)) {
  errors.push(
    "EFT_ACCOUNT_NUMBER is missing or still using a placeholder value.",
  );
}

if (!isPositiveInteger(paymentProofRetentionDays)) {
  errors.push("PAYMENT_PROOF_RETENTION_DAYS must be a positive integer.");
}

if (!isPositiveInteger(maxStatementUploadMb)) {
  errors.push("MAX_STATEMENT_UPLOAD_MB must be a positive integer.");
}

if (Number(maxStatementUploadMb) > 50) {
  warnings.push("MAX_STATEMENT_UPLOAD_MB is set above 50MB. Large uploads may hurt memory usage.");
}

if (!resendApiKey) {
  warnings.push(
    "RESEND_API_KEY is not set. Transactional emails will be disabled in production.",
  );
}

if (
  resendApiKey &&
  !emailFrom &&
  !emailFromAccounts &&
  !emailFromBilling
) {
  warnings.push(
    "A Resend key is configured, but no EMAIL_FROM sender is set for outgoing email.",
  );
}

if (
  [emailFrom, emailFromAccounts, emailFromBilling].some((value) =>
    value.includes("resend.dev"),
  )
) {
  warnings.push(
    "One or more sender addresses still use resend.dev. Replace them with your verified production domain.",
  );
}

console.log("Production preflight");
console.log(`- Working directory: ${ROOT_DIR}`);
console.log(
  `- Loaded env files: ${loadedFiles.length > 0 ? loadedFiles.join(", ") : "none"}`,
);
console.log(`- Checked at: ${new Date().toISOString()}`);

if (errors.length === 0 && warnings.length === 0) {
  console.log("Status: pass");
  process.exit(0);
}

console.log(`Status: ${errors.length > 0 ? "fail" : "warn"}`);
printSection("Errors", errors);
printSection("Warnings", warnings);

process.exit(errors.length > 0 ? 1 : 0);
