import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/forgot-password",
          "/login",
          "/payments/",
          "/projects/",
          "/reset-password",
          "/settings/",
          "/signup",
        ],
      },
    ],
    host,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
