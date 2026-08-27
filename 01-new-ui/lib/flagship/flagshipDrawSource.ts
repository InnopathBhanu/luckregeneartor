/*
 * THE NATIONAL DRAW ADAPTER — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §1/§2 (the two draw-event models), §15 (FG-01 required fields), `CLAUDE.md` §14 (game-local
 * draw date; production-derived data retains provenance; never fabricate a result), `FD-S-01`/`FD-S-02`.
 *
 * ══ THE PROBLEM THIS SOLVES ══
 *
 * Powerball and Mega Millions are national games, but every result the repository holds is filed under a
 * JURISDICTION — the production feed carries the same multi-state drawing inside all 49 `<State>` blocks. A
 * national hub that simply read Florida's copy would be a Florida page wearing a national URL, and it would
 * silently inherit whatever Florida's block happened to say.
 *
 * So this module reads the record from EVERY jurisdiction that carries the game, and cross-checks them. The
 * drawing is one national event; if two jurisdictions disagree about its numbers, that is a data fault worth
 * surfacing rather than a tie to break by preference.
 *
 * ══ WHAT IS CROSS-CHECKED, AND WHAT IS NOT ══
 *
 *   **Cross-checked** — the drawn main numbers, the special ball and the result date. These are properties of the
 *   national drawing and must agree everywhere.
 *
 *   **Not cross-checked** — the advertised jackpot and the next advertised amount. Those legitimately vary in
 *   presentation between jurisdictions, so the reference record's values are used and the reference is named.
 *
 * ══ CALIFORNIA'S EMPTY MEGA MILLIONS RECORD ══
 *
 * The captured feed carries `<numbers-str date="07/07/2026"/>` for California Mega Millions — a dated element
 * with no numbers. A record with no drawn values is EXCLUDED from the cross-check rather than treated as a
 * disagreement: an absent result is not a conflicting one, and reading it as `[]` would report a phantom fault.
 */

import { drawEventsFor, statesWithDrawEvents, type StateDrawEvent } from "@/lib/state/stateDrawEvents";

export interface NationalDrawRecord {
  /** The event chosen as the reference for jurisdiction-varying fields. */
  event: StateDrawEvent;
  /** The jurisdiction the reference record came from, named so the provenance is readable. */
  referenceStateCode: string;
  /** Every jurisdiction whose record was compared, including the reference. */
  comparedStateCodes: readonly string[];
  /** Jurisdictions carrying the game with a dated but empty record. Excluded, and reported. */
  emptyStateCodes: readonly string[];
  /**
   * Disagreements found between jurisdictions about the drawn values or the draw date.
   *
   * Empty in this build. When it is not, the page renders the result with an explicit data-conflict notice rather
   * than picking a winner — a national result that two sources disagree about is not a fact to publish quietly.
   */
  conflicts: readonly string[];
}

function signature(e: StateDrawEvent): string {
  const special = e.specialBalls.map((s) => `${s.label}:${s.values.join(",")}`).join("|");
  return `${e.resultDate}#${e.mainNumbers.join(",")}#${special}`;
}

/**
 * The national record for a flagship game, or `null` when no jurisdiction carries a drawn result for it.
 *
 * `null` is a real outcome and the page handles it: FG-01 renders its awaiting-result state rather than inventing
 * a drawing.
 */
export function nationalDraw(gameId: number): NationalDrawRecord | null {
  const found: { code: string; event: StateDrawEvent }[] = [];
  const empty: string[] = [];

  for (const code of statesWithDrawEvents()) {
    const event = drawEventsFor(code).find((e) => e.gameId === gameId);
    if (!event) continue;
    if (event.mainNumbers.length === 0) {
      empty.push(code);
      continue;
    }
    found.push({ code, event });
  }

  if (found.length === 0) return null;

  /*
   * THE REFERENCE IS THE MOST COMPLETE RECORD, NOT THE FIRST ONE ALPHABETICALLY.
   *
   * Jurisdiction blocks carry the same drawn values but not the same auxiliary fields: California's Powerball
   * block omits the Power Play multiplier and the Double Play sub-result that Florida's carries. Picking a
   * reference alphabetically therefore dropped Power Play and Double Play from the national hub entirely — a
   * silent loss of two facts BP-04A §15 requires the page to show.
   *
   * These auxiliary fields are properties of the national drawing, not of a state, so "the record that has them"
   * is the right reference rather than a tie to break by name. Completeness is scored, the alphabetical order is
   * the tiebreak, and the chosen jurisdiction is named in `referenceStateCode` so the provenance stays readable.
   */
  const completeness = (e: StateDrawEvent): number =>
    (e.multiplier ? 4 : 0) +
    (e.secondaryDraw ? 4 : 0) +
    (e.topPrizeDisplay ? 2 : 0) +
    (e.nextPrizeDisplay ? 1 : 0) +
    (e.nextDrawDate ? 1 : 0);

  found.sort((a, b) => completeness(b.event) - completeness(a.event) || a.code.localeCompare(b.code));
  const reference = found[0];

  const expected = signature(reference.event);
  const conflicts = found
    .filter((f) => signature(f.event) !== expected)
    .map(
      (f) =>
        `Jurisdiction "${f.code}" reports ${f.event.resultDate} ${f.event.mainNumbers.join("-")} for game ` +
        `${gameId}, which differs from "${reference.code}" (${reference.event.resultDate} ` +
        `${reference.event.mainNumbers.join("-")}).`,
    );

  return {
    event: reference.event,
    referenceStateCode: reference.code,
    comparedStateCodes: found.map((f) => f.code),
    emptyStateCodes: empty,
    conflicts,
  };
}

/**
 * "Today" for a national hub.
 *
 * The newest result date across every jurisdiction carrying the game — the national analogue of
 * `resolveReviewDate`, and derived from transcribed data rather than the wall clock for the same two reasons:
 * founder decision 1 of 2026-08-04 fixes the guarded review date to the feed, and a page built from the clock
 * changes its content every night so no screenshot comparison or test assertion survives.
 *
 * Lexical comparison is correct and intentional on zero-padded ISO dates: no `Date` parsing, so no timezone can
 * shift a draw date across a day boundary — the failure `CLAUDE.md` §14 names.
 */
export function nationalReviewDate(gameId: number): string | null {
  const dates = statesWithDrawEvents()
    .flatMap((code) => drawEventsFor(code).filter((e) => e.gameId === gameId))
    .map((e) => e.resultDate)
    .filter((d): d is string => Boolean(d));
  if (dates.length === 0) return null;
  return dates.slice().sort().reverse()[0];
}
