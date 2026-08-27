/*
 * BLOG KEYWORD SEARCH — the founder-added `/blog/search` page's whole engine (Conflict 39 names blog search
 * as a founder addition with no blueprint section; it ships noindex with crawlable non-search fallbacks).
 *
 * Deliberately simple, and deliberately identical in shape to `newsSearch.ts`: case-insensitive keyword
 * matching over the review corpus's own fields, server-side, deterministic, no index, no service. A real
 * search backend is API-phase work (`CLAUDE.md` §15), and this module is the seam it will replace.
 */

import { getBlogData } from "./bff/blogBff";
import type { BlogPostRecord } from "./blogContract";
import { BLOG_CATEGORY_LABELS } from "./blogContract";

export interface BlogSearchResult {
  post: BlogPostRecord;
  /** Which fields matched, for the "Matches: headline, category" line. Reader-facing names. */
  matchedIn: readonly string[];
}

/** The suggestion chips: plain player words for what the corpus actually covers. */
export const BLOG_SEARCH_SUGGESTIONS: readonly string[] = Object.freeze([
  "Pick 3", "cash or annuity", "claim a prize", "Double Play", "hot and cold", "systems",
]);

function fieldsOf(p: BlogPostRecord): { name: string; text: string }[] {
  return [
    { name: "headline", text: p.headline },
    { name: "summary", text: p.description },
    { name: "article text", text: p.sections.flatMap((s) => [s.heading ?? "", ...s.paragraphs]).join(" ") },
    { name: "category", text: `${p.category} ${BLOG_CATEGORY_LABELS[p.category]}` },
    { name: "topics", text: [...p.keywords, ...p.tags, p.primaryEntity].join(" ") },
    { name: "games and states", text: [...p.gameIds, ...p.stateCodes].join(" ") },
  ];
}

/** Normalise a query into distinct lowercase terms. Punctuation-tolerant, order-independent. */
export function blogSearchTerms(query: string): string[] {
  return [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 0))];
}

/**
 * Every post in which EVERY term matches at least one field. Sorted newest first, ties by headline, so the
 * output is stable for the same corpus and query.
 */
export function searchBlog(query: string): BlogSearchResult[] {
  const terms = blogSearchTerms(query);
  if (terms.length === 0) return [];

  const results: BlogSearchResult[] = [];
  for (const post of getBlogData().posts) {
    const fields = fieldsOf(post).map((f) => ({ name: f.name, text: f.text.toLowerCase() }));
    const everyTermMatches = terms.every((t) => fields.some((f) => f.text.includes(t)));
    if (!everyTermMatches) continue;
    const matchedIn = fields.filter((f) => terms.some((t) => f.text.includes(t))).map((f) => f.name);
    results.push({ post, matchedIn });
  }
  return results.sort(
    (a, b) =>
      b.post.datePublishedIso.localeCompare(a.post.datePublishedIso)
      || a.post.headline.localeCompare(b.post.headline),
  );
}
