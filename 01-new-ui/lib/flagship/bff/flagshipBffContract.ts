/*
 * THE FLAGSHIP BACKEND-FOR-FRONTEND CONTRACT — FGP-009.
 *
 * ══ WHAT THIS FILE IS ══
 *
 * One typed description of everything a flagship game page needs from a backend, and the ONLY place the future
 * API's shape is written down. `getFlagshipGamePageData(gameSlug)` returns this and nothing else; the page model
 * consumes this and nothing else. Swapping the mock adapter for a real `02-new-api` call is therefore a change of
 * one module, with the compiler enforcing that the replacement is shape-complete.
 *
 * `CLAUDE.md` §15 is explicit that page fixtures MUST NOT become domain contracts by accident, and that a view
 * model is not a domain contract. This is a **presentation** contract: it is what the PAGE needs, expressed for
 * the page. When `02-new-api` is designed it must keep domain data, provenance, freshness, entitlement,
 * advertising and commerce separate — this file does not pre-empt that, and `FUTURE_API` below records the
 * questions it must answer rather than answering them here.
 *
 * ══ EVERY RESPONSE DECLARES ITS SOURCE ══
 *
 * `meta.source` is a required field, not a convention. A page can therefore always tell whether it is rendering
 * real published data or preview data, and the disclosure it shows is driven by that value rather than by
 * someone remembering to change a string.
 */

/* ------------------------------------------------------------------ envelope */

export type BffSource =
  /** Real published data from the production results feed. */
  | "productionFeed"
  /** Locally generated preview data, for UI work and pre-launch verification. Never a claim about the world. */
  | "mock";

export interface BffMeta {
  gameSlug: string;
  source: BffSource;
  /**
   * The reader-facing sentence a page must show when this data is not real.
   *
   * Carried in the payload rather than written in a component so that a preview response cannot be rendered
   * without its disclosure travelling with it.
   */
  disclosure: string | null;
  /** The date the payload treats as "today". Never the wall clock — see `flagshipBffMock.ts`. */
  asOfIso: string;
}

/* ------------------------------------------------------------------ drawings */

export interface BffDrawGroupValue {
  /** Drawn main values, ascending. */
  main: readonly number[];
  /** The drawn special value, when the game has one. */
  special: number | null;
}

export interface BffDraw extends BffDrawGroupValue {
  drawDateIso: string;
  /** The drawn multiplier, only for a game whose multiplier is DRAWN. Mega Millions' is per-ticket, so `null`. */
  multiplier: number | null;
  /** A secondary drawing on the same ticket — Powerball Double Play. `null` where the game has none. */
  secondary: BffDrawGroupValue | null;
  /** The advertised jackpot for this drawing, formatted. `null` where the source carries none. */
  jackpotDisplay: string | null;
  /** Where this row came from. A single response may mix a real latest drawing with preview history. */
  source: BffSource;
}

/* ------------------------------------------------------------------ jackpot */

export interface BffJackpotPoint {
  drawDateIso: string;
  /** Advertised annuity, in whole dollars. */
  advertised: number;
  /** The lump sum, where the source publishes one. `null` is a real answer and is never derived. */
  cashValue: number | null;
  /** True when the top prize was won at this drawing and the next one resets. */
  wonAtThisDraw: boolean;
  source: BffSource;
}

/* ------------------------------------------------------------------ prizes */

export interface BffPrizeTier {
  /** How many main values matched. */
  mainMatched: number;
  /** Whether the special ball matched. `null` for a game without one. */
  specialMatched: boolean | null;
  /** Reader-facing label — `5 + Powerball`. */
  label: string;
  /** The base prize, formatted. `null` where the tier is pari-mutuel or the source does not publish one. */
  prizeDisplay: string | null;
  /** Whether the game's multiplier applies to this tier. The jackpot is normally excluded. */
  multiplierApplies: boolean;
  source: BffSource;
}

/* ------------------------------------------------------------------ next drawing */

export interface BffNextDraw {
  drawDateIso: string;
  drawTimeEt: string;
  advertisedJackpot: number | null;
  advertisedCashValue: number | null;
  source: BffSource;
}

/* ------------------------------------------------------------------ tagged content */

export type BffContentKind = "forum" | "blog" | "news";

export interface BffContentItem {
  id: string;
  kind: BffContentKind;
  title: string;
  author: string;
  publishedIso: string;
  href: string;
  excerpt: string;
  tags: readonly string[];
  replyCount?: number;
  source: BffSource;
}

/* ------------------------------------------------------------------ checker examples */

/** A sample line the checker can preload, so a reader can see the tool work without typing. */
export interface BffCheckerExample {
  key: string;
  label: string;
  main: readonly number[];
  special: number | null;
  source: BffSource;
}

/* ------------------------------------------------------------------ the payload */

export interface FlagshipGamePageData {
  meta: BffMeta;
  /** Newest first. Includes the latest drawing as `history[0]`. */
  history: readonly BffDraw[];
  jackpotHistory: readonly BffJackpotPoint[];
  /** `null` where the source publishes no prize matrix — which is the real-feed case today. */
  prizeTiers: readonly BffPrizeTier[] | null;
  nextDraw: BffNextDraw | null;
  content: {
    forum: readonly BffContentItem[];
    blog: readonly BffContentItem[];
    news: readonly BffContentItem[];
  };
  checkerExamples: readonly BffCheckerExample[];
}

/* ------------------------------------------------------------------ future API */

/**
 * EVERY open question the real backend must answer, in one place.
 *
 * Deliberately a documented constant rather than TODO comments scattered through the tree: when `02-new-api` is
 * authorised, this is the checklist, and `grep FUTURE_API` finds all of it.
 *
 * `CLAUDE.md` §15 forbids API, schema or database work during a UI task, so none of this is designed here. It is
 * recorded so the eventual API task starts from the page's real requirements rather than from a fixture shape.
 */
export const FUTURE_API = Object.freeze({
  endpointShape:
    "One page-scoped read per flagship game. The page needs history, jackpot series, prize tiers, next drawing " +
    "and tagged content together; five round trips would make the server render wait on the slowest.",
  separationOfConcerns:
    "CLAUDE.md §15: domain data, presentation view models, provenance, freshness, entitlement, advertising and " +
    "commerce must stay separable. This contract is presentation only; the API must not adopt it as its domain.",
  provenance:
    "Every field the page treats as a fact needs the §33 field-level provenance — value, sourceRef, " +
    "effectiveFrom, lastVerifiedAt, freshnessThreshold, correctionStatus. `source` here is the minimum stand-in.",
  historyDepth:
    "Production has roughly 8,700 indexed yearly archive URLs. The page needs the current rule era; the archive " +
    "pages need all of it. Paging, and where the era boundary is applied, is an API decision.",
  prizeMatrix:
    "Neither operator prize table is captured in this repository. The real endpoint must carry it with " +
    "provenance, including the California pari-mutuel exception, before any prize figure is published.",
  cashValue:
    "The production feed carries the advertised annuity only. A cash value must come from the operator and must " +
    "never be derived from the annuity.",
  corrections:
    "BP-04A §35: a corrected drawing invalidates the checker, statistics, saved matches, notifications and " +
    "social images. The API needs a correction signal the page can react to, not just a replaced value.",
  entitlement:
    "Saved lines, alerts and follows are Account-scoped. ACCT-DEC-001 and DATA-DEC-001 govern them; the API must " +
    "answer 'what may this account do' separately from 'what is this drawing'.",
  taggedContent:
    "Forum, blog and news are three different systems. The page queries them by one tag; the API should keep " +
    "them separately addressable so one being down does not empty the others.",
});
