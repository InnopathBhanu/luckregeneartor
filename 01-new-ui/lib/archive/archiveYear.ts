/*
 * ARCHIVE-YEAR AND MODE RESOLUTION — LRG-ARCHIVE-054.
 *
 * Authority: blueprint §1 (modes), §3 (*"Use the existing LotteryCorner result-date and archive-year logic…
 * Do not calculate archive year from browser timezone; do not introduce a new routing timezone; do not move
 * historical draws between years during redesign"*), §31 (*"future/invalid year: 404"*); brief §10
 * (rule-era changes within one archive year); `CLAUDE.md` §14 (game-local draw date).
 *
 * ══ WHERE "THE CURRENT YEAR" COMES FROM ══
 *
 * From `resolveReviewDate(stateCode)` — the same governed per-jurisdiction date the Game Page uses since
 * LRG-GAME-053. Not `new Date()`. Two reasons, and both are requirements rather than preferences:
 *
 *   1. **Blueprint §3 forbids deriving the archive year from a clock the reader controls.** A browser in
 *      Auckland on 2027-01-01 must not be shown a different archive year than one in Miami, and a draw must
 *      never move between years because of where the request came from.
 *   2. **Determinism.** Founder decision 1 of 2026-08-04 fixes the guarded review date to the feed's newest
 *      draw date. A review page built from the wall clock changes content every day, so no screenshot
 *      comparison and no test assertion survives the night.
 *
 * Florida's governed date is 2026-07-09, so `/fl/pick-3/2026` is `YR-CURRENT` with January through July valid.
 *
 * ══ YEAR VALIDITY IS DECLARED BY DATA, NOT BY ARITHMETIC ══
 *
 * A year is a valid destination only when the jurisdiction actually has rows in it. That is deliberately
 * stricter than "any year up to the current one": offering `/fl/pick-3/2019` because 2019 ≤ 2026 would publish
 * an empty archive that looks like a claim that Pick 3 had no drawings in 2019. Production has 52 indexed
 * per-variant yearly URLs back to 1988; **none of that history is in this repository**, so this V0 has exactly
 * one available year and says so. The record documents the connection as the next data step.
 */

import { resolveReviewDate } from "../game/gameReviewDate";
import type { ArchiveMode } from "./archiveContract";

export interface ArchiveYearResolution {
  /** The requested year, once it has been proven to be a well-formed four-digit year. */
  year: number;
  mode: ArchiveMode;
  /** The jurisdiction's governed review date — "today" for every date decision on the page. */
  reviewDateIso: string;
  /** The year that review date falls in. */
  reviewYear: number;
  /** Months that can contain draws in this archive year: 12 for a closed year, elapsed months for the current. */
  validMonths: number;
}

/**
 * Parse a route segment as an archive year.
 *
 * Deliberately strict. `2026` parses; `2026abc`, `026`, `+2026`, `2026.0` and ` 2026` do not. A loose parse
 * would let `/fl/pick-3/2026-suffix` resolve to the 2026 archive under a second URL — a duplicate of the same
 * intent, which the pre-merge checklist forbids, and a crawl trap of exactly the kind blueprint §31 rules out.
 */
export function parseArchiveYearSegment(segment: string): number | null {
  if (!/^\d{4}$/.test(segment)) return null;
  const n = Number(segment);
  /* A sane calendar bound. The oldest indexed LotteryCorner archive year is 1988; 1900 leaves room for any
     jurisdiction's real history without accepting a year that cannot be a lottery draw year. */
  if (n < 1900 || n > 2999) return null;
  return n;
}

/**
 * Resolve the mode and month bounds for a year in a jurisdiction.
 *
 * Returns `null` for a year AFTER the governed review year — blueprint §31 requires a future year to 404, and
 * returning `null` is how the route reaches `notFound()` without the caller deciding policy.
 *
 * `YR-RETIRED` is NOT resolved here. Retirement is a property of the game's rule data (a `retiredEra` with a
 * closing date), not of the year, so the model resolves it from the rule era and this function stays purely
 * about the calendar. Pick 3 is active, so no representative page reaches that mode; the type carries it
 * because blueprint §1 requires the mode to exist.
 */
export function resolveArchiveYear(stateCode: string, year: number): ArchiveYearResolution | null {
  const review = resolveReviewDate(stateCode);
  const reviewYear = Number(review.iso.slice(0, 4));
  if (year > reviewYear) return null;

  const current = year === reviewYear;
  return {
    year,
    mode: current ? "YR-CURRENT" : "YR-CLOSED",
    reviewDateIso: review.iso,
    reviewYear,
    /* For the current year, only elapsed months can hold a draw. `slice(5, 7)` reads the month straight out of
       the ISO string — no Date parsing, so no timezone can shift the boundary (`CLAUDE.md` §14). */
    validMonths: current ? Number(review.iso.slice(5, 7)) : 12,
  };
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(month: number): string {
  return MONTH_LABELS[month - 1] ?? `Month ${month}`;
}

/** `YYYY-MM` for a year and 1-based month. Zero-padded so lexical comparison is chronological. */
export function monthKeyOf(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * A reader-facing date, from the ISO string alone.
 *
 * No `Date` construction and no locale formatting of the day, because both can shift a draw date across a day
 * boundary. The weekday IS computed from a `Date`, pinned to noon UTC so the shift cannot occur.
 */
export function archiveDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const weekday = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  return `${weekday} ${m}/${d}/${y}`;
}

/* ------------------------------------------------------------------ shared row labelling */

/**
 * Whether the rendered table shows a variant column at all.
 *
 * The table shows it only when SOME member of the family carries a variant label — a single-member family has
 * no Midday/Evening distinction to draw. Exported so the schema builder asks the same question the view asks,
 * rather than re-deriving it and drifting.
 */
export function archiveShowsVariantColumn(
  members: readonly { variantLabel: string }[],
): boolean {
  return members.some((m) => m.variantLabel);
}

/**
 * The visible label for one archive row — LRG-UX-SCHEMA-002 §5.
 *
 * ══ WHAT WAS WRONG ══
 *
 * `archiveSchema` named each `ListItem` `"<Game> <variant> — 2026-07-09"`: a RAW ISO date, and no variant text
 * at all when the row's own `variantLabel` was empty. The table renders `archiveDisplayDate` — `"Thu 07/09/2026"`
 * — and prints `Main` in the variant column for exactly those empty rows. So the two disagreed on every row,
 * and on the fallback rows they disagreed twice. `CLAUDE.md` §11 requires schema to reflect visible content;
 * an `ItemList` whose names appear nowhere on the page does not.
 *
 * ══ WHY THE FORMATTER IS SHARED RATHER THAN COPIED ══
 *
 * A second implementation agreeing today is a second implementation that can stop agreeing. `ArchiveView` and
 * `archiveSchema` both call this, so a change to the visible date format moves the schema with it and the test
 * comparing them row-by-row cannot be satisfied by editing one side.
 *
 * `showVariant` mirrors the table's own column condition — `archiveShowsVariantColumn` — so the `Main` fallback
 * appears in the label exactly when the column that shows it is on screen, and never when it is not.
 */
export function archiveRowLabel(opts: {
  gameLabel: string;
  drawDateIso: string;
  variantLabel: string;
  showVariant: boolean;
}): string {
  const date = archiveDisplayDate(opts.drawDateIso);
  if (!opts.showVariant) return `${opts.gameLabel} — ${date}`;
  /* The same `|| "Main"` the table's variant cell uses: a member with no label of its own IS the main draw. */
  return `${opts.gameLabel} ${opts.variantLabel || "Main"} — ${date}`;
}
