/*
 * THE NEWS BACKEND-FOR-FRONTEND CONTRACT — News page family (07/07A/07B/07C).
 *
 * Replicates the flagship BFF pattern (`lib/flagship/bff/flagshipBffContract.ts`): one typed description of
 * everything the News pages need from a backend, one envelope that declares its own source, and one place the
 * future API's questions are recorded without being answered (`CLAUDE.md` §15 — no API design during a UI task).
 *
 * ══ EVERY RESPONSE DECLARES ITS SOURCE ══
 *
 * `meta.source` is required. `"review"` means the committed review corpus — articles written for interface
 * review against real repository evidence, never a claim that a newsroom exists. The disclosure sentence travels
 * IN the payload so a review response cannot be rendered without it.
 */

import type { NewsArticleRecord, NewsAuthorRecord } from "../newsContract";

export type NewsBffSource =
  /** The committed review corpus. Evergreen guides and dated historical facts only — never current-news claims. */
  | "review"
  /** A real editorial backend. Does not exist; the adapter branch throws (`CLAUDE.md` §15). */
  | "api";

export interface NewsBffMeta {
  source: NewsBffSource;
  /** The reader-facing sentence the pages must show while the corpus is review data. */
  disclosure: string | null;
  /** The date the payload treats as "today". Never the wall clock. */
  asOfIso: string;
}

export interface NewsData {
  meta: NewsBffMeta;
  /** Newest first by `datePublishedIso`. */
  articles: readonly NewsArticleRecord[];
  authors: readonly NewsAuthorRecord[];
}

/**
 * The open questions the real editorial backend must answer — recorded, not designed (`CLAUDE.md` §15).
 * `grep FUTURE_NEWS_API` finds all of it when the API task is authorised.
 */
export const FUTURE_NEWS_API = Object.freeze({
  endpointShape:
    "One hub read (ordered feed + rankings + authors) and one article read by slug. Rankings (Trending, Most " +
    "Discussed, Most Read — 07 §11) are backend aggregates and must never be computed client-side from partial data.",
  lifecycle:
    "07B §22: DRAFT..RETRACTED. The API owns the lifecycle; the page renders the status it is given, and a " +
    "correction must invalidate the Bottom Line, AI context, social image and discussion fact banner (07B §13).",
  discussion:
    "07 §10: one canonical thread per article, shared with Community. The API supplies " +
    "canonicalDiscussionThreadId; this build carries the typed seam with `null`.",
  rankings:
    "Trending is velocity+decay, Most Discussed is contributors+depth+quality, Most Read is readership (07 §11). " +
    "All three are honest aggregates over real behaviour — never seeded, never invented.",
  authors:
    "07 §2/§3: real accountable humans with consented photographs, biographies, beats and disclosure. The " +
    "review-fixture editorial-team placeholder retires the day the first real reporter record exists.",
  provenance:
    "Every factual claim needs source, last-checked and correction status (07 §16). The review corpus carries " +
    "these fields already; the API must keep them first-class, not decorative.",
});
