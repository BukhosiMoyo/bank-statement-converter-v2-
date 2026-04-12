const PRIMARY_PRODUCTION_SITE_URL = "https://bankstatementconvertor.co.za";
const DEVELOPMENT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  const normalizedValue = value.trim().replace(/\/$/, "");

  if (normalizedValue.startsWith("http://") || normalizedValue.startsWith("https://")) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
}

function shouldUsePrimaryProductionSiteUrl(value: string) {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const hostname = new URL(value).hostname;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
}

export function getSiteUrl() {
  const rawValue =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    DEVELOPMENT_SITE_URL;
  const normalizedValue = normalizeSiteUrl(rawValue);

  if (shouldUsePrimaryProductionSiteUrl(normalizedValue)) {
    return PRIMARY_PRODUCTION_SITE_URL;
  }

  return normalizedValue;
}
