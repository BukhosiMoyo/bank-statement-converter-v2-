import type { Metadata } from "next";

import { BLOG_AUTHOR_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "Bank Statement Converter";

type BuildPageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
};

export function getAbsoluteSiteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const url = getAbsoluteSiteUrl(path);

  return {
    title,
    description,
    keywords,
    authors: [{ name: BLOG_AUTHOR_NAME }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            noarchive: true,
            googleBot: {
              index: false,
              follow: false,
              noarchive: true,
            },
          },
        }
      : {}),
  };
}
