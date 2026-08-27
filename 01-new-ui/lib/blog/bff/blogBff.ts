/*
 * THE BLOG BFF ENTRY POINT — Blog page family (Conflict 39), on the news/flagship BFF pattern.
 *
 * ══ ONE FUNCTION, ONE SEAM ══
 *
 * `getBlogData()` is the only way the Blog pages reach data. Today it resolves to the committed review corpus;
 * when the editorial backend exists (the Conflict 40 admin flow), `BLOG_DATA_MODE` gains its `"api"`
 * implementation and nothing else in the tree changes. Components never import the JSON —
 * `tests/blog-pages.test.ts` sweeps `components/` and `app/` for imports from `bff/review`, exactly as the news
 * test does.
 *
 * ══ WHAT KEEPS THE REVIEW CORPUS HONEST (`CLAUDE.md` §14) ══
 *
 *   1. Every post is EVERGREEN editorial with repository evidence, declared per record in `provenance` and
 *      asserted below on every read. No current-news claim, no invented winner, no jackpot figure.
 *   2. The undated-currency phrases that would turn a fixture into a fake news claim are rejected, and so is
 *      the one sentence the Constitution's language rules ban outright ("increase your chances").
 *   3. The authors are accountable DESK identities that say what they are (`reviewStatus: "review-fixture"`,
 *      no photo, honest biography, recorded launch condition). A record presenting itself as a real human
 *      fails the assertion — 07 §3 by adoption, community precedent by Conflict 41.
 *   4. The payload carries its own reader-facing disclosure sentence, and the pages stay `noindex, nofollow`
 *      and out of every sitemap (`PUBLICATION_SAFETY`).
 */

import type { BlogAuthorRecord, BlogPostRecord } from "../blogContract";
import { BLOG_CATEGORIES } from "../blogContract";
import type { BlogData } from "./blogBffContract";

/* `with { type: "json" }` is required by Node's ESM loader, which the test runner uses directly. */
import reviewPayload from "./review/blog-review.json" with { type: "json" };

export type BlogDataMode =
  /** The committed review corpus. The current mode. */
  | "review"
  /** A real editorial backend. Not implemented — `02-new-api` is empty and untouched (`CLAUDE.md` §15). */
  | "api";

/**
 * Which adapter answers. A module constant rather than an environment variable, so the state of the build is
 * readable from the source (`FD-GATE-01`: no env-driven page behaviour).
 */
export const BLOG_DATA_MODE: BlogDataMode = "review";

/** Phrases that would turn a review fixture into an undated current-news claim. Checked on every read. */
const CURRENT_NEWS_PHRASES: readonly RegExp[] = [
  /\btoday\b/i, /\byesterday\b/i, /\btonight\b/i, /\bthis week\b/i, /\bthis morning\b/i,
  /\bbreaking\b/i, /\bjust announced\b/i, /\bmoments ago\b/i,
];

/** Claims a review corpus must never carry: invented winners, jackpot movement, odds-improvement language. */
const FORBIDDEN_CLAIMS: readonly RegExp[] = [
  /\b(wins?|won|winner)\b/i,
  /\$[\d,.]+ (million|billion)/i,
  /\bjackpot (rose|climbs?|rolls?|hits?|reached)\b/i,
  /increase your (chances|odds)/i,
  /improve your (chances|odds)/i,
];

/** Every reader-visible text field of one post, for the sweeps. */
function textOf(post: BlogPostRecord): string {
  return [
    post.headline, post.description,
    ...post.sections.flatMap((s) => [s.heading ?? "", ...s.paragraphs]),
  ].join(" ");
}

/**
 * Validate the payload against the invariants that would produce a MISLEADING page rather than a broken one.
 * Runs on every read, so a hand-edited fixture cannot reach a reader through a warm module cache.
 */
export function assertBlogPayloadShape(data: BlogData): void {
  const fail = (why: string): never => {
    throw new Error(`blogBff: review payload is unusable — ${why}`);
  };

  if (data.meta.source !== "review" && data.meta.source !== "api") {
    fail(`meta.source is "${data.meta.source}"`);
  }
  if (data.meta.source === "review" && !data.meta.disclosure) {
    fail("review data carries no disclosure sentence, so a page could render it without one");
  }
  if (data.posts.length === 0) fail("it carries no posts");
  if (data.authors.length !== 2) {
    fail(`it carries ${data.authors.length} authors — the founder authorized exactly two desk identities`);
  }

  const authorSlugs = new Set(data.authors.map((a) => a.slug));
  for (const a of data.authors) {
    if (a.reviewStatus !== "review-fixture") fail(`author "${a.slug}" does not declare review-fixture status`);
    if (a.photo !== null) fail(`author "${a.slug}" carries a photo — 07 §3 forbids synthetic reporter photos`);
    if (!/LotteryCorner/i.test(a.name)) {
      fail(`author "${a.slug}" reads as a personal name — the review desk must be an accountable team identity`);
    }
    if (!/placeholder|not a person/i.test(a.biography)) {
      fail(`author "${a.slug}" biography does not say it is a placeholder`);
    }
    if (!/Person JSON-LD|real named author/i.test(a.launchNote)) {
      fail(`author "${a.slug}" records no launch condition — the fixture must know what retires it`);
    }
  }

  const seen = new Set<string>();
  for (const post of data.posts) {
    if (seen.has(post.slug)) fail(`post slug "${post.slug}" is duplicated`);
    seen.add(post.slug);
    if (!authorSlugs.has(post.authorSlug)) fail(`post "${post.slug}" names unknown author "${post.authorSlug}"`);
    if (!BLOG_CATEGORIES.includes(post.category)) fail(`post "${post.slug}" has no recognised category`);
    if (post.provenance?.reviewStatus !== "review-fixture") {
      fail(`post "${post.slug}" does not declare review-fixture provenance`);
    }
    if (post.provenance.factBasis !== "evergreen-guide" && post.provenance.factBasis !== "editorial-opinion") {
      fail(`post "${post.slug}" has no recognised fact basis`);
    }
    if (post.provenance.evidence.length === 0) fail(`post "${post.slug}" cites no evidence`);
    if (post.editorName.length === 0) fail(`post "${post.slug}" names no accountable editor`);
    /* The Key points derivation needs a lead plus at least two headed sections (`blogKeyPoints.ts`). */
    if (post.sections.length < 3) fail(`post "${post.slug}" has fewer than three sections — Key points need three`);
    if (post.sections[0]?.heading !== null) fail(`post "${post.slug}" does not open with an unheaded lead`);
    for (const [i, s] of post.sections.entries()) {
      if (i > 0 && !s.heading) fail(`post "${post.slug}" section ${i} lacks a heading`);
      if (s.paragraphs.length === 0) fail(`post "${post.slug}" section ${i} is empty`);
    }
    const text = textOf(post);
    for (const phrase of CURRENT_NEWS_PHRASES) {
      if (phrase.test(text)) fail(`post "${post.slug}" contains undated current-news phrasing (${phrase})`);
    }
    for (const claim of FORBIDDEN_CLAIMS) {
      if (claim.test(text)) fail(`post "${post.slug}" contains a forbidden claim (${claim})`);
    }
    for (const link of post.relatedLinks) {
      if (!link.href.startsWith("/")) fail(`post "${post.slug}" links off-site to "${link.href}"`);
    }
  }
}

/**
 * Everything the Blog pages need, in one read. Synchronous for the same reason the news seam is: making it
 * `async` now would suggest the real endpoint's shape has been decided, which `CLAUDE.md` §15 forbids.
 */
export function getBlogData(): BlogData {
  switch (BLOG_DATA_MODE) {
    case "review": {
      /* TypeScript widens JSON string literals to `string`; the runtime assertion re-establishes the guarantee.
         The `_meta_note` documentation key is stripped so the payload matches the contract exactly. */
      const { _meta_note: _ignored, ...payload } = reviewPayload as unknown as BlogData & { _meta_note?: string };
      const data = payload as BlogData;
      assertBlogPayloadShape(data);
      return data;
    }
    case "api":
      /* Unreachable until an API task is authorised. Left as an explicit branch so the seam is visible. */
      throw new Error(
        "getBlogData: the API adapter does not exist. `02-new-api` is untouched until a dedicated API task is " +
          "approved (CLAUDE.md §15). See FUTURE_BLOG_API in blogBffContract.ts.",
      );
  }
}

/** One post by slug, or `null`. The route decides whether `null` is a 404 — the registry gates first. */
export function getBlogPost(slug: string): BlogPostRecord | null {
  return getBlogData().posts.find((p) => p.slug === slug) ?? null;
}

/** One desk author by slug, or `null`. */
export function getBlogAuthor(slug: string): BlogAuthorRecord | null {
  return getBlogData().authors.find((a) => a.slug === slug) ?? null;
}
