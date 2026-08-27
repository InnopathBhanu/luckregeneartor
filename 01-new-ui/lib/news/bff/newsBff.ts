/*
 * THE NEWS BFF ENTRY POINT — News page family (07/07A/07B/07C), on the flagship BFF pattern.
 *
 * ══ ONE FUNCTION, ONE SEAM ══
 *
 * `getNewsData()` is the only way the News pages reach data. Today it resolves to the committed review corpus;
 * when an editorial backend exists, `NEWS_DATA_MODE` gains its `"api"` implementation and nothing else in the
 * tree changes. Components never import the JSON — `tests/news-pages.test.ts` sweeps `components/` and `app/`
 * for imports from `bff/review`, exactly as the flagship test does for `bff/mock`.
 *
 * ══ WHAT KEEPS THE REVIEW CORPUS HONEST (`CLAUDE.md` §14) ══
 *
 *   1. Every article is an EVERGREEN GUIDE or a DATED HISTORICAL FACT with repository evidence, declared per
 *      record in `provenance` and asserted below on every read.
 *   2. No invented current news: `assertNewsPayloadShape` rejects any record whose status claims a live story
 *      (`DEVELOPING`), and rejects undated-currency phrasing in the body ("today", "yesterday", "this week",
 *      "breaking") — the phrases that turn a fixture into a fake news claim.
 *   3. The author is an accountable placeholder that says what it is (`reviewStatus: "review-fixture"`, no
 *      photo, honest biography). A record presenting itself as a real human fails the assertion.
 *   4. The payload carries its own reader-facing disclosure sentence, and the pages stay `noindex, nofollow`
 *      and out of every sitemap (`PUBLICATION_SAFETY`).
 */

import type { NewsArticleRecord, NewsAuthorRecord } from "../newsContract";
import type { NewsData } from "./newsBffContract";

/* `with { type: "json" }` is required by Node's ESM loader, which the test runner uses directly. */
import reviewPayload from "./review/news-review.json" with { type: "json" };

export type NewsDataMode =
  /** The committed review corpus. The current mode. */
  | "review"
  /** A real editorial backend. Not implemented — `02-new-api` is empty and untouched (`CLAUDE.md` §15). */
  | "api";

/**
 * Which adapter answers. A module constant rather than an environment variable, so the state of the build is
 * readable from the source (`FD-GATE-01`: no env-driven page behaviour).
 */
export const NEWS_DATA_MODE: NewsDataMode = "review";

/** Phrases that would turn a review fixture into an undated current-news claim. Checked on every read. */
const CURRENT_NEWS_PHRASES: readonly RegExp[] = [
  /\btoday\b/i, /\byesterday\b/i, /\btonight\b/i, /\bthis week\b/i, /\bthis morning\b/i,
  /\bbreaking\b/i, /\bjust announced\b/i, /\bmoments ago\b/i,
];

/**
 * Validate the payload against the invariants that would produce a MISLEADING page rather than a broken one.
 * Runs on every read, so a hand-edited fixture cannot reach a reader through a warm module cache.
 */
export function assertNewsPayloadShape(data: NewsData): void {
  const fail = (why: string): never => {
    throw new Error(`newsBff: review payload is unusable — ${why}`);
  };

  if (data.meta.source !== "review" && data.meta.source !== "api") {
    fail(`meta.source is "${data.meta.source}"`);
  }
  if (data.meta.source === "review" && !data.meta.disclosure) {
    fail("review data carries no disclosure sentence, so a page could render it without one");
  }
  if (data.articles.length === 0) fail("it carries no articles");
  if (data.authors.length === 0) fail("it carries no authors");

  const authorSlugs = new Set(data.authors.map((a) => a.slug));
  for (const a of data.authors) {
    if (a.reviewStatus !== "review-fixture") fail(`author "${a.slug}" does not declare review-fixture status`);
    if (a.photo !== null) fail(`author "${a.slug}" carries a photo — 07 §3 forbids synthetic reporter photos`);
    if (!/LotteryCorner/i.test(a.name)) {
      fail(`author "${a.slug}" reads as a personal name — the review placeholder must be an accountable team identity`);
    }
    if (!/placeholder|not a person/i.test(a.biography)) {
      fail(`author "${a.slug}" biography does not say it is a placeholder`);
    }
  }

  const seen = new Set<string>();
  for (const art of data.articles) {
    if (seen.has(art.slug)) fail(`article slug "${art.slug}" is duplicated`);
    seen.add(art.slug);
    if (!authorSlugs.has(art.authorSlug)) fail(`article "${art.slug}" names unknown author "${art.authorSlug}"`);
    if (art.provenance?.reviewStatus !== "review-fixture") {
      fail(`article "${art.slug}" does not declare review-fixture provenance`);
    }
    if (art.provenance.factBasis !== "evergreen-guide" && art.provenance.factBasis !== "dated-historical-fact") {
      fail(`article "${art.slug}" has no recognised fact basis`);
    }
    if (art.provenance.evidence.length === 0) fail(`article "${art.slug}" cites no evidence`);
    if (art.storyStatus === "DEVELOPING") {
      fail(`article "${art.slug}" claims a developing story — a review corpus must not manufacture live news`);
    }
    if (art.aiContext.rendered !== false) {
      fail(`article "${art.slug}" renders AI context — nothing can pass the 07 §7 test with no model connected`);
    }
    if (art.relatedNextActions.length > 3) fail(`article "${art.slug}" exceeds three related next actions (07C)`);
    for (const text of [art.headline, art.bottomLine, art.description, ...art.body]) {
      for (const phrase of CURRENT_NEWS_PHRASES) {
        if (phrase.test(text)) {
          fail(`article "${art.slug}" contains undated current-news phrasing (${phrase}) in: "${text.slice(0, 60)}…"`);
        }
      }
    }
    for (const link of [art.primaryAction, ...art.relatedNextActions]) {
      if (!link.href.startsWith("/")) fail(`article "${art.slug}" links off-site to "${link.href}"`);
    }
  }
}

/**
 * Everything the News pages need, in one read. Synchronous for the same reason the flagship seam is: making it
 * `async` now would suggest the real endpoint's shape has been decided, which `CLAUDE.md` §15 forbids.
 */
export function getNewsData(): NewsData {
  switch (NEWS_DATA_MODE) {
    case "review": {
      /* TypeScript widens JSON string literals to `string`; the runtime assertion re-establishes the guarantee.
         The `_meta_note` documentation key is stripped so the payload matches the contract exactly. */
      const { _meta_note: _ignored, ...payload } = reviewPayload as unknown as NewsData & { _meta_note?: string };
      const data = payload as NewsData;
      assertNewsPayloadShape(data);
      return data;
    }
    case "api":
      /* Unreachable until an API task is authorised. Left as an explicit branch so the seam is visible. */
      throw new Error(
        "getNewsData: the API adapter does not exist. `02-new-api` is untouched until a dedicated API task is " +
          "approved (CLAUDE.md §15). See FUTURE_NEWS_API in newsBffContract.ts.",
      );
  }
}

/** One article by slug, or `null`. The route decides whether `null` is a 404 — the registry gates first. */
export function getNewsArticle(slug: string): NewsArticleRecord | null {
  return getNewsData().articles.find((a) => a.slug === slug) ?? null;
}

/** One author by slug, or `null`. */
export function getNewsAuthor(slug: string): NewsAuthorRecord | null {
  return getNewsData().authors.find((a) => a.slug === slug) ?? null;
}
