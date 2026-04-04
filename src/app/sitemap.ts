import { stat } from "node:fs/promises";
import { join, relative } from "node:path";

import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

const APP_DIRECTORY = join(process.cwd(), "src", "app");
const INTERNAL_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/dashboard",
  "/login",
  "/payments",
  "/privacy",
  "/projects",
  "/settings",
  "/terms",
] as const;
const HIGH_PRIORITY_ROUTES = new Set([
  "/",
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

  return 0.7;
}

function resolveChangeFrequency(route: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "/" || route === "/convert" || route === "/pricing") {
    return "weekly";
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
  const routes = pagePaths
    .map((pagePath) => ({
      pagePath,
      route: normalizeRouteFromPagePath(pagePath),
    }))
    .filter(({ route }) => isIncludedRoute(route))
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
    routes.map(async ({ pagePath, route }) => {
      const fileStat = await stat(pagePath);

      return {
        url: `${siteUrl}${route}`,
        lastModified: fileStat.mtime,
        changeFrequency: resolveChangeFrequency(route),
        priority: resolvePriority(route),
      };
    }),
  );
}
