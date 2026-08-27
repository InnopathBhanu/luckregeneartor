/*
 * THE BLOG ROUTE REGISTRY — the "blog" page family's half of `FD-GATE-01` registry-only gating.
 *
 * Authority: `FD-GATE-01` (registry-only gating; no environment reads), `CLAUDE.md` §10 (*"Routes come from an
 * explicit config or registry"*), and **Conflict 39** (`source-conflicts.md`): `/blog` and `/blog/{slug}` are
 * classified **preserve** in the ratified route audit (21 live indexed URLs), and the family itself is built on
 * the founder's Tier-1 instruction because no blog blueprint exists.
 *
 * ══ ROUTES COME FROM HERE, NOT FROM THE PAYLOAD ══
 *
 * The review corpus in `bff/review/blog-review.json` is DATA; this file is the ROUTE AUTHORITY. A post slug is
 * served only when it is enumerated below AND the payload carries a matching record — the same intersection
 * discipline the news family uses. Adding a post is two visible edits: the record, and the registry row that
 * reviews it into existence.
 *
 * No `/blog/category/*` or `/blog/{category}` route exists: the category chips are a server-side `?category=`
 * filter over the ONE hub URL, so browsing cannot mint indexable URL variants.
 */

import { getBlogData } from "./bff/blogBff";
import { BLOG_HUB_PATH, BLOG_SEARCH_PATH, blogAuthorPath, blogPostPath } from "./blogContract";

export interface BlogRegistryEntry {
  route: string;
  enabled: boolean;
  /** The authority the served composition conforms to. No blueprint exists; Conflict 39 is the record. */
  authority: "CONFLICT-39";
  note: string;
}

/** The two fixed routes. */
const FIXED: readonly BlogRegistryEntry[] = Object.freeze([
  {
    route: BLOG_HUB_PATH,
    enabled: true,
    authority: "CONFLICT-39",
    note:
      "The Blog hub, BH-01..BH-06 in the recorded order (blogContract.ts), over the review corpus. "
      + "noindex always; never in a sitemap (PUBLICATION_SAFETY).",
  },
  {
    route: BLOG_SEARCH_PATH,
    enabled: true,
    authority: "CONFLICT-39",
    note:
      "Founder-added keyword search over the review corpus (Conflict 39 names blog search explicitly). "
      + "A search-results page is noindex ALWAYS — launch never changes that — and it is permanently "
      + "sitemap-excluded (lib/seo/sitemapEntries.ts).",
  },
]);

/**
 * The enumerated post slugs. Each row is a review decision: the payload carrying a record does NOT create the
 * route (`CLAUDE.md` §10), and a row without a record serves nothing.
 */
const POST_SLUGS: readonly string[] = Object.freeze([
  "hot-and-cold-numbers-an-honest-look",
  "lottery-systems-wheels-and-lucky-numbers",
  "why-we-publish-the-boring-version",
  "multipliers-explained-power-play-and-megaplier",
  "what-double-play-is",
  "how-to-claim-a-florida-lottery-prize",
  "cash-vs-annuity-explained",
  "how-pick-3-payouts-work",
]);

/** The two desk identities, on the shared 07 §2 `/authors/{slug}` surface beside the news placeholder. */
const AUTHOR_SLUGS: readonly string[] = Object.freeze([
  "lotterycorner-results-desk",
  "lotterycorner-guides-desk",
]);

/** Is this post slug registered AND backed by a payload record? Both, or it is not a page. */
export function isBlogPostServed(slug: string): boolean {
  if (!POST_SLUGS.includes(slug)) return false;
  return getBlogData().posts.some((p) => p.slug === slug);
}

/** Is this desk-author slug registered AND backed by a payload record? */
export function isBlogAuthorServed(slug: string): boolean {
  if (!AUTHOR_SLUGS.includes(slug)) return false;
  return getBlogData().authors.some((a) => a.slug === slug);
}

/** Does this build serve this blog-family route? The `servesPage("blog", …)` delegate. */
export function isBlogRouteServed(route: string): boolean {
  const fixed = FIXED.find((e) => e.route === route);
  if (fixed) return fixed.enabled;
  const post = route.match(/^\/blog\/([a-z0-9-]+)$/);
  if (post) return isBlogPostServed(post[1]);
  const author = route.match(/^\/authors\/([a-z0-9-]+)$/);
  if (author) return isBlogAuthorServed(author[1]);
  return false;
}

/** Every blog-family route this build serves, for the FD-GATE-01 route inventory. */
export function blogRoutePaths(): { route: string; authority: "CONFLICT-39" }[] {
  const rows: { route: string; authority: "CONFLICT-39" }[] = [];
  for (const e of FIXED) {
    if (e.enabled) rows.push({ route: e.route, authority: e.authority });
  }
  for (const slug of POST_SLUGS) {
    if (isBlogPostServed(slug)) rows.push({ route: blogPostPath(slug), authority: "CONFLICT-39" });
  }
  for (const slug of AUTHOR_SLUGS) {
    if (isBlogAuthorServed(slug)) rows.push({ route: blogAuthorPath(slug), authority: "CONFLICT-39" });
  }
  return rows;
}
