/*
 * THE JURISDICTION REVIEW-DATE RESOLVER — LRG-GAME-053.
 *
 * Authority: the 2026-08-04 correction direction (*"Remove the Florida-specific review date from generic
 * behaviour… Prefer a governed result-last-updated date for the jurisdiction… otherwise the newest available
 * result date among that jurisdiction's draw events… otherwise record the absence and use a clearly isolated
 * fallback"*), founder decision 1 of 2026-08-04 (a FIXED guarded-review date derived from the feed update date,
 * never the wall clock), `CLAUDE.md` §14 (game-local draw dates), `FD-X-01`.
 *
 * ══ WHAT WAS WRONG ══
 *
 * `gameM2Model.ts` read one constant — `REVIEW_DATE_ISO = "2026-07-09"` — for every jurisdiction. That date is
 * Florida's newest transcribed result date. California's newest is `2026-07-08`. So every California Game Page
 * computed its schedule guard, its date-effective format selection, its rule-era selection and its generated
 * review history against a date ONE DAY AFTER the newest fact California actually has.
 *
 * The visible symptoms were mild only by luck: no California format or rule era has an effective boundary
 * between those two dates. The mechanism was not mild. A jurisdiction whose feed lags by a week would have had
 * its "next drawing" suppressed for draws that were genuinely still upcoming, and a format transition inside the
 * gap would have selected the WRONG era for a real published result.
 *
 * ══ WHY NOT `new Date()` ══
 *
 * Founder decision 1 forbids it, and determinism requires it: a review fixture built from the wall clock changes
 * its content every day, so a regression test asserting on it either drifts or has to be rewritten. Every date
 * here is derived from transcribed data, so the same input always produces the same page.
 *
 * ══ THE THREE SOURCES, IN ORDER ══
 *
 *   1. `governedManifest` — the jurisdiction's own `resultLastUpdatedIso` governed fact. This is the answer the
 *      State family already uses, so the Game Page and the State Page now agree by construction.
 *   2. `newestDrawEvent` — the newest `resultDate` across that jurisdiction's transcribed draw events. Reached
 *      when a jurisdiction has results but no manifest.
 *   3. `isolatedFallback` — a single named constant, reached only when a jurisdiction has NO dated facts at all.
 *      It is deliberately isolated so that a page relying on it is identifiable: `source` says so, and
 *      `absent` carries the reason for the implementation record.
 *
 * Callers that publish date-derived copy check `source`. A page resting on the fallback has no governed date and
 * must not present one as a fact.
 */

import { stateManifestFor } from "../state/stateContentManifests";
import { drawEventsFor } from "../state/stateDrawEvents";

/** Which of the three ordered sources answered. Callers gate published copy on this, never on the date alone. */
export type ReviewDateSource = "governedManifest" | "newestDrawEvent" | "isolatedFallback";

export type ReviewDateResolution = {
  /** The resolved `YYYY-MM-DD` review date for this jurisdiction. */
  iso: string;
  source: ReviewDateSource;
  /** Set only for `isolatedFallback`: why no governed date existed. Recorded, never rendered as a fact. */
  absent: string | null;
};

/**
 * The isolated fallback.
 *
 * Reached only by a jurisdiction with no manifest AND no dated draw event — which, among the ten registered
 * representative routes, is no jurisdiction at all. It exists so that the resolver is total rather than
 * throwing, and it is a named export so a test can prove which pages depend on it (none) rather than a reviewer
 * having to trust the claim.
 *
 * This is NOT "today" and must never be replaced with the wall clock. It is the transcription date of the
 * results feed the representative fixtures were built from.
 */
export const ISOLATED_FALLBACK_REVIEW_DATE = "2026-07-09";

/** The newest transcribed result date for a jurisdiction, or undefined when it has no dated results. */
function newestResultDate(stateCode: string): string | undefined {
  const dates = drawEventsFor(stateCode)
    .map((e) => e.resultDate)
    .filter((d): d is string => Boolean(d));
  if (dates.length === 0) return undefined;
  /* Lexical sort is correct and intentional: every value is a zero-padded ISO `YYYY-MM-DD`. No Date parsing,
     so no timezone can shift a draw date across a day boundary — the failure `CLAUDE.md` §14 names. */
  return dates.slice().sort().reverse()[0];
}

/** Resolve the review date for a jurisdiction through the three ordered sources. */
export function resolveReviewDate(stateCode: string): ReviewDateResolution {
  const governed = stateManifestFor(stateCode)?.resultLastUpdatedIso.value;
  if (governed) return { iso: governed.slice(0, 10), source: "governedManifest", absent: null };

  const newest = newestResultDate(stateCode);
  if (newest) return { iso: newest, source: "newestDrawEvent", absent: null };

  return {
    iso: ISOLATED_FALLBACK_REVIEW_DATE,
    source: "isolatedFallback",
    absent: `No governed result-last-updated date and no dated draw event exists for "${stateCode}". ` +
      "Date-derived copy must be suppressed rather than published.",
  };
}

/** The resolved date alone, for the many callers that only need to select a date-effective record. */
export function reviewDateFor(stateCode: string): string {
  return resolveReviewDate(stateCode).iso;
}
