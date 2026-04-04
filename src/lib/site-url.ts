const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const rawValue =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    DEFAULT_SITE_URL;
  const normalizedValue = rawValue.trim().replace(/\/$/, "");

  if (normalizedValue.startsWith("http://") || normalizedValue.startsWith("https://")) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
}
