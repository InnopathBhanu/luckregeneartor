/*
 * THE ARCHIVE ROUTE REGISTRY — LRG-ARCHIVE-054.
 *
 * Authority: `CLAUDE.md` §10 (*"MUST NEVER derive route existence from a fixture filename or a directory
 * listing. Routes come from an explicit config or registry"*, and *"MUST NEVER invent a route because a
 * blueprint needs a page family"*); brief §2 in-scope (*"A guarded `/fl/pick-3/2026` `YR-CURRENT` archive"*),
 * §10 and Phase 4 (*"Do not create public archive routes … for those proof cases"*).
 *
 * ══ WHY THIS EXISTS, AND WHAT IT CORRECTS ══
 *
 * The first version of the archive route had no registry. It accepted any eligible game and any year, then 404'd
 * when the fixture produced no rows. That is route existence DERIVED FROM DATA — the precise pattern §10 forbids
 * — and it had two visible consequences:
 *
 *   1. `/fl/cash-pop/2026`, `/fl/lotto/2026`, `/ca/superlotto-plus/2026` and `/fl/powerball/2026` all resolved
 *      200 in the guarded preview, because each has a 2026 feed record. The brief scopes this task to ONE
 *      archive page and says explicitly not to create archive routes for the generalization proof games.
 *   2. Which URLs exist would have changed silently whenever the fixture changed, which makes the route
 *      inventory unreviewable — nobody could answer "what archive URLs does this build serve?" without running
 *      the fixture.
 *
 * Now the answer is this file, and only this file. The generalization proof calls `buildArchiveModel` directly in
 * tests, which is how a model can be proven generic without publishing a page for every proof case.
 *
 * ══ YEARS ARE ENUMERATED, NOT RANGED ══
 *
 * `years: [2026]` rather than `from: 2026`. Production has 52 indexed Pick 3 yearly URLs going back to 1988 and
 * none of that history is connected here; a range would quietly claim every year in it. Adding a year is a
 * one-line edit once its data exists, and the edit is the review.
 */

export interface ArchiveRegistryEntry {
  stateCode: string;
  gameSlug: string;
  /** Every archive year served for this pair. Enumerated, never a range. */
  years: readonly number[];
  /** Why this entry exists, for the route inventory. */
  note: string;
}

/**
 * Every archive route this build serves.
 *
 * One entry, deliberately. The brief's in-scope list is one guarded `YR-CURRENT` archive, and the route is
 * introduced pending the migration audit recorded in the implementation record — production serves
 * `/fl/pick-3-evening/{year}` and `/fl/pick-3-midday/{year}`, not `/fl/pick-3/{year}`.
 */
export const ARCHIVE_ELIGIBLE: readonly ArchiveRegistryEntry[] = Object.freeze([
  {
    stateCode: "fl",
    gameSlug: "pick-3",
    years: [2026],
    note:
      "The founder-directed review archive. 2026 is the only year with a captured feed record, so it is the only "
      + "year with anything to review.",
  },
]);

/** Whether this jurisdiction, game and year is a registered archive route. */
export function isArchiveEligible(stateCode: string, gameSlug: string, year: number): boolean {
  return ARCHIVE_ELIGIBLE.some(
    (e) =>
      e.stateCode === stateCode.toLowerCase()
      && e.gameSlug === gameSlug.toLowerCase()
      && e.years.includes(year),
  );
}

/** Every registered archive year for a pair, ascending. Empty when the pair has no archive. */
export function archiveYearsFor(stateCode: string, gameSlug: string): number[] {
  const entry = ARCHIVE_ELIGIBLE.find(
    (e) => e.stateCode === stateCode.toLowerCase() && e.gameSlug === gameSlug.toLowerCase(),
  );
  return entry ? [...entry.years].sort((a, b) => a - b) : [];
}

/** Every archive route this build serves, as `state/game/year` strings. Used by the route-inventory test. */
export function archiveRoutePaths(): string[] {
  return ARCHIVE_ELIGIBLE.flatMap((e) => e.years.map((y) => `/${e.stateCode}/${e.gameSlug}/${y}`));
}

/* ------------------------------------------------------------------ adjacent-year navigation */

/**
 * The nearest registered year in one direction.
 *
 * ══ WHY THIS IS NOT ARITHMETIC ══
 *
 * `year - 1` is the wrong answer, and it is wrong in a way that produces a broken link rather than a wrong number.
 * A jurisdiction's connected archive is not a contiguous range: Florida Pick 3 Midday is indexed from 2008 while
 * Evening goes back to 1988, a game can be retired for a stretch, and a connection project will land years out of
 * order. "Previous" therefore means *the nearest registered year below this one*, not the arithmetic predecessor.
 *
 * Returns `null` at a boundary, which is what lets the navigation render an honest disabled state instead of a
 * link to a year that does not exist. The founder direction is explicit — *"Never generate links to missing
 * arithmetic years"* — and this function is the single place that rule is enforced.
 */
export function adjacentArchiveYear(
  stateCode: string,
  gameSlug: string,
  year: number,
  direction: "older" | "newer",
): number | null {
  const years = archiveYearsFor(stateCode, gameSlug);
  if (direction === "older") {
    const below = years.filter((y) => y < year);
    return below.length > 0 ? below[below.length - 1] : null;
  }
  const above = years.filter((y) => y > year);
  return above.length > 0 ? above[0] : null;
}

export interface ArchiveYearNavigation {
  /** Every registered year for this pair, newest first — the order a selector reads best. */
  years: readonly number[];
  current: number;
  /** The nearest registered year below. `null` at the oldest boundary. */
  older: number | null;
  /** The nearest registered year above. `null` at the newest boundary. */
  newer: number | null;
  /** True when only one year is registered, so both directions are boundaries. */
  singleYear: boolean;
}

/** Everything the year navigation needs, resolved from the registry alone. */
export function archiveYearNavigation(
  stateCode: string,
  gameSlug: string,
  year: number,
): ArchiveYearNavigation {
  const ascending = archiveYearsFor(stateCode, gameSlug);
  return {
    years: [...ascending].reverse(),
    current: year,
    older: adjacentArchiveYear(stateCode, gameSlug, year, "older"),
    newer: adjacentArchiveYear(stateCode, gameSlug, year, "newer"),
    singleYear: ascending.length <= 1,
  };
}
