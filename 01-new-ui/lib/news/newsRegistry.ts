/*
 * THE NEWS ROUTE REGISTRY — the "news" page family's half of `FD-GATE-01` registry-only gating.
 *
 * Authority: `FD-GATE-01` (registry-only gating; no environment reads), `CLAUDE.md` §10 (*"MUST NEVER derive
 * route existence from a fixture filename or a directory listing. Routes come from an explicit config or
 * registry"*), 07 §21 (the URL contract: `/news`, `/news/{article-slug}`, `/authors/{reporter-slug}`).
 *
 * ══ ROUTES COME FROM HERE, NOT FROM THE PAYLOAD ══
 *
 * The review corpus in `bff/review/news-review.json` is DATA; this file is the ROUTE AUTHORITY. An article slug
 * is served only when it is enumerated below AND the payload carries a matching record — the same
 * intersection discipline the archive family uses (game registry ∩ archive registry). Adding an article is
 * therefore two visible edits: the record, and the registry row that reviews it into existence.
 *
 * 07A §18 is respected by OMISSION: no `/news/jackpots`-style topic route exists here, because the blueprint
 * says to create topic collections only with sufficient durable content and demand — which a review corpus is not.
 */

import { getNewsData } from "./bff/newsBff";
import { NEWS_HUB_PATH, NEWS_SEARCH_PATH, newsArticlePath, newsAuthorPath } from "./newsContract";

export interface NewsRegistryEntry {
  route: string;
  enabled: boolean;
  /** Which approved document the served composition conforms to. */
  blueprint: "07A" | "07B";
  note: string;
}

/** The two fixed routes. */
const FIXED: readonly NewsRegistryEntry[] = Object.freeze([
  {
    route: NEWS_HUB_PATH,
    enabled: true,
    blueprint: "07A",
    note:
      "The News Hub, NH-01..NH-14 in the 07A §3 order, running NEWS-LOW-VOLUME over the review corpus. "
      + "noindex always; never in a sitemap (PUBLICATION_SAFETY).",
  },
  {
    route: NEWS_SEARCH_PATH,
    enabled: true,
    blueprint: "07A",
    note:
      "Founder-added keyword search over the review corpus (no blueprint section of its own; child of the hub). "
      + "A search-results page is noindex ALWAYS — launch never changes that — and it is permanently "
      + "sitemap-excluded (lib/seo/sitemapEntries.ts).",
  },
]);

/**
 * The enumerated article slugs. Each row is a review decision, exactly as a jurisdiction row is: the payload
 * carrying a record does NOT create the route (`CLAUDE.md` §10), and a row without a record serves nothing.
 */
const ARTICLE_SLUGS: readonly string[] = Object.freeze([
  "mega-millions-2025-matrix-change",
  "powerball-2015-matrix-history",
  "how-yearly-results-archives-work",
  "what-a-result-format-is",
]);

/** The enumerated author slugs — 07 §2's `/authors/{reporter-slug}` surface. */
const AUTHOR_SLUGS: readonly string[] = Object.freeze(["lotterycorner-editorial-team"]);

/** Is this article slug registered AND backed by a payload record? Both, or it is not a page. */
export function isNewsArticleServed(slug: string): boolean {
  if (!ARTICLE_SLUGS.includes(slug)) return false;
  return getNewsData().articles.some((a) => a.slug === slug);
}

/** Is this author slug registered AND backed by a payload record? */
export function isNewsAuthorServed(slug: string): boolean {
  if (!AUTHOR_SLUGS.includes(slug)) return false;
  return getNewsData().authors.some((a) => a.slug === slug);
}

/** Does this build serve this news-family route? The `servesPage("news", …)` delegate. */
export function isNewsRouteServed(route: string): boolean {
  const fixed = FIXED.find((e) => e.route === route);
  if (fixed) return fixed.enabled;
  const article = route.match(/^\/news\/([a-z0-9-]+)$/);
  if (article) return isNewsArticleServed(article[1]);
  const author = route.match(/^\/authors\/([a-z0-9-]+)$/);
  if (author) return isNewsAuthorServed(author[1]);
  return false;
}

/** Every news-family route this build serves, for the FD-GATE-01 route inventory. */
export function newsRoutePaths(): { route: string; blueprint: "07A" | "07B" }[] {
  const rows: { route: string; blueprint: "07A" | "07B" }[] = [];
  for (const e of FIXED) {
    if (e.enabled) rows.push({ route: e.route, blueprint: e.blueprint });
  }
  for (const slug of ARTICLE_SLUGS) {
    if (isNewsArticleServed(slug)) rows.push({ route: newsArticlePath(slug), blueprint: "07B" });
  }
  for (const slug of AUTHOR_SLUGS) {
    if (isNewsAuthorServed(slug)) rows.push({ route: newsAuthorPath(slug), blueprint: "07B" });
  }
  return rows;
}
