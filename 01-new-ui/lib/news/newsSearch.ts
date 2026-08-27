/*
 * NEWS KEYWORD SEARCH — the founder-added `/news/search` page's whole engine.
 *
 * Deliberately simple: case-insensitive keyword matching over the review corpus's own fields (headline,
 * description, body, category, keywords, tags, entities). Server-side, deterministic, no index, no service —
 * a real search backend is API-phase work (`CLAUDE.md` §15), and this module is the seam it will replace.
 *
 * The audience rule (persona: ordinary U.S. lottery players, mobile-first): plain language in, plain results
 * out. Every term must match somewhere ("powerball 2015" finds the article that mentions both), and an empty or
 * unmatched query degrades to the full corpus list on the page rather than a dead end.
 */

import { getNewsData } from "./bff/newsBff";
import type { NewsArticleRecord } from "./newsContract";

export interface NewsSearchResult {
  article: NewsArticleRecord;
  /** Which fields matched, for the "Matches: headline, category" line. Reader-facing names. */
  matchedIn: readonly string[];
}

/** The suggestion chips: plain state and game names a player would actually type. */
export const NEWS_SEARCH_SUGGESTIONS: readonly string[] = Object.freeze([
  "Powerball", "Mega Millions", "Florida", "results archive", "Mega Ball", "how formats work",
]);

function fieldsOf(a: NewsArticleRecord): { name: string; text: string }[] {
  return [
    { name: "headline", text: a.headline },
    { name: "summary", text: `${a.description} ${a.bottomLine}` },
    { name: "article text", text: a.body.join(" ") },
    { name: "category", text: `${a.newsCategory} ${a.contentType}` },
    { name: "topics", text: [...a.keywords, ...a.tags, a.primaryEntity].join(" ") },
    { name: "games and states", text: [...a.gameIds, ...a.stateCodes].join(" ") },
  ];
}

/** Normalise a query into distinct lowercase terms. Punctuation-tolerant, order-independent. */
export function searchTerms(query: string): string[] {
  return [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 0))];
}

/**
 * Every article in which EVERY term matches at least one field. Sorted newest first, ties by headline, so the
 * output is stable for the same corpus and query.
 */
export function searchNews(query: string): NewsSearchResult[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];

  const results: NewsSearchResult[] = [];
  for (const article of getNewsData().articles) {
    const fields = fieldsOf(article).map((f) => ({ name: f.name, text: f.text.toLowerCase() }));
    const everyTermMatches = terms.every((t) => fields.some((f) => f.text.includes(t)));
    if (!everyTermMatches) continue;
    const matchedIn = fields.filter((f) => terms.some((t) => f.text.includes(t))).map((f) => f.name);
    results.push({ article, matchedIn });
  }
  return results.sort(
    (a, b) =>
      b.article.datePublishedIso.localeCompare(a.article.datePublishedIso)
      || a.article.headline.localeCompare(b.article.headline),
  );
}
