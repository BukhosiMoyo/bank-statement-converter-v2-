import { stat } from "node:fs/promises";
import { join, relative } from "node:path";

import type { MetadataRoute } from "next";

import { DYNAMIC_BLOG_ARTICLE_LINKS } from "@/lib/blog-content";
import { getSiteUrl } from "@/lib/site-url";

const APP_DIRECTORY = join(process.cwd(), "src", "app");
const BLOG_CONTENT_PATH = join(process.cwd(), "src", "lib", "blog-content.ts");
const INTERNAL_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/dashboard",
  "/forgot-password",
  "/login",
  "/payments",
  "/projects",
  "/reset-password",
  "/settings",
  "/signup",
] as const;
const HIGH_PRIORITY_ROUTES = new Set([
  "/",
  "/blog",
  "/convert",
  "/pricing",
  "/bank-statements-to-excel",
  "/pdf-bank-statement-to-csv",
  "/bank-statement-converter-south-africa",
]);

function normalizeRouteFromPagePath(pagePath: string) {
  const relativePath = relative(APP_DIRECTORY, pagePath).replace(/\\/g, "/");
  const routeSegments = relativePath.split("/").slice(0, -1);

  if (routeSegments.length === 0) {
    return "/";
  }

  return `/${routeSegments.join("/")}`;
}

function isIncludedRoute(route: string) {
  if (route.includes("[")) {
    return false;
  }

  return !INTERNAL_ROUTE_PREFIXES.some((prefix) =>
    route === prefix || route.startsWith(`${prefix}/`),
  );
}

function resolvePriority(route: string) {
  if (route === "/") {
    return 1;
  }

  if (HIGH_PRIORITY_ROUTES.has(route)) {
    return route === "/convert" ? 0.95 : 0.9;
  }

  if (route === "/signup") {
    return 0.8;
  }

  if (route === "/privacy" || route === "/terms") {
    return 0.2;
  }

  return 0.7;
}

function resolveChangeFrequency(route: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (
    route === "/" ||
    route === "/blog" ||
    route === "/convert" ||
    route === "/pricing"
  ) {
    return "weekly";
  }

  if (route === "/privacy" || route === "/terms") {
    return "yearly";
  }

  return "monthly";
}

async function collectPagePaths(directory: string): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(directory, { withFileTypes: true });
  const pagePaths: string[] = [];

  for (const entry of entries) {
    const nextPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      pagePaths.push(...(await collectPagePaths(nextPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      pagePaths.push(nextPath);
    }
  }

  return pagePaths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const pagePaths = await collectPagePaths(APP_DIRECTORY);
  const staticRoutes = pagePaths
    .map((pagePath) => ({
      sourcePath: pagePath,
      pagePath,
      route: normalizeRouteFromPagePath(pagePath),
    }))
    .filter(({ route }) => isIncludedRoute(route));
  const dynamicBlogRoutes = DYNAMIC_BLOG_ARTICLE_LINKS.map(({ href }) => ({
    sourcePath: BLOG_CONTENT_PATH,
    pagePath: join(APP_DIRECTORY, "blog", "[slug]", "page.tsx"),
    route: href,
  }));
  const routes = [...staticRoutes, ...dynamicBlogRoutes]
    .filter(
      ({ route }, index, entries) =>
        entries.findIndex((candidate) => candidate.route === route) === index,
    )
    .sort((left, right) => {
      if (left.route === "/") {
        return -1;
      }

      if (right.route === "/") {
        return 1;
      }

      return left.route.localeCompare(right.route);
    });

  return Promise.all(
    routes.map(async ({ route, sourcePath }) => {
      const fileStat = await stat(sourcePath);

      return {
        url: `${siteUrl}${route}`,
        lastModified: fileStat.mtime,
        changeFrequency: resolveChangeFrequency(route),
        priority: resolvePriority(route),
      };
    }),
  );
}
