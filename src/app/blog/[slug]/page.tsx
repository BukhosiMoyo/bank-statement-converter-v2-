import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoSupportPage } from "@/components/seo-support-page";
import {
  DYNAMIC_BLOG_ARTICLE_BY_SLUG,
  DYNAMIC_BLOG_ARTICLE_SLUGS,
} from "@/lib/blog-content";
import { buildPageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return DYNAMIC_BLOG_ARTICLE_SLUGS.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = DYNAMIC_BLOG_ARTICLE_BY_SLUG[slug];

  if (!article) {
    return {};
  }

  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${slug}`,
    keywords: article.keywords,
    type: "article",
  });
}

export default async function DynamicBlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = DYNAMIC_BLOG_ARTICLE_BY_SLUG[slug];

  if (!article) {
    notFound();
  }

  return (
    <SeoSupportPage
      currentHref={`/blog/${article.slug}`}
      eyebrow={article.eyebrow}
      title={article.title}
      intro={article.intro}
      shortAnswer={article.shortAnswer}
      sections={article.sections}
      faqs={article.faqs}
      ctaTitle={article.ctaTitle}
      ctaBody={article.ctaBody}
    />
  );
}
