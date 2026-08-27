/*
 * DRAW-SCHEDULE INTERPRETATION AND COVERAGE ASSESSMENT — LRG-ARCHIVE-058.
 *
 * Authority: the 2026-08-06 founder verification §1 (*"An absent archive row is not, by itself, proof that no
 * drawing occurred… If the registered preview/archive dataset is incomplete, do not infer `No drawing` from a
 * missing row"*); `CLAUDE.md` §14 (never present synthetic or inferred content as fact) and §9 (state honesty).
 *
 * ══ THE DEFECT THIS MODULE EXISTS TO FIX ══
 *
 * The calendar classified any date inside the covered range with no archive row as `noDrawing`, and rendered the
 * words **"No drawing"** in the cell. On `/fl/pick-3/2026` that produced **160 false claims**: the registered
 * schedule for both Pick 3 members is `drawDays: "Daily"`, so a drawing DID occur on every one of those dates.
 * The archive simply has no row for it, because the guarded review fixture covers four dates a month.
 *
 * "We have no record" and "no drawing happened" are different statements, and only the first is true here. The
 * calendar was asserting the second.
 *
 * ══ THE CORRECTED RULE ══
 *
 * `noDrawing` is now a CONCLUSION that must be earned, and it needs positive evidence:
 *
 *   1. the registered schedule is understood, AND
 *   2. it excludes that weekday.
 *
 * Anything else with no row is `noRegisteredResult` — a statement about our records, not about the lottery.
 *
 * With `drawDays: "Daily"`, condition 2 can never hold, so `noDrawing` is **unreachable for Pick 3**. That is the
 * correct outcome: a daily game has no days off, so no cell may claim one.
 *
 * ══ WHAT WOULD LET US SAY "NO DRAWING" ══
 *
 * Two sources, one available and one not:
 *
 *   - **Available:** `drawDays`, which this module parses. `"Wed & Sat"` genuinely establishes that no drawing
 *     occurs on a Monday, so a Monday cell may say so.
 *   - **Not available:** an explicit cancelled / day-off status. Production has a `game_daysoff` table, so the
 *     concept exists upstream, but nothing in this repository carries it and none is invented here. When it is
 *     connected, `explicitNoDrawDates` is the parameter it feeds.
 *
 * ══ WHY THE PARSER REFUSES TO GUESS ══
 *
 * `drawDays` is operator free text. The dataset contains `"Daily"`, `"Mon, Wed & Sat"`, `"Tue & Fri"`, `"Wed & Sat"`
 * and `""`. A string this module cannot parse returns `unknown`, and an unknown schedule can never produce
 * `noDrawing` — because a parser that guessed would reintroduce exactly the false claim it exists to prevent.
 */

/** A registered draw schedule, or an honest admission that we could not read one. */
export type DrawSchedule =
  | { kind: "daily" }
  /** `days` holds JS weekday numbers, 0 = Sunday. */
  | { kind: "weekdays"; days: readonly number[] }
  | { kind: "unknown" };

const WEEKDAY_TOKENS: readonly (readonly [RegExp, number])[] = [
  [/\bsun(day)?\b/i, 0],
  [/\bmon(day)?\b/i, 1],
  [/\btue(s|sday)?\b/i, 2],
  [/\bwed(nesday)?\b/i, 3],
  [/\bthu(r|rs|rsday)?\b/i, 4],
  [/\bfri(day)?\b/i, 5],
  [/\bsat(urday)?\b/i, 6],
];

/**
 * Parse an operator's `drawDays` string.
 *
 * Conservative on purpose. `"Daily"` and `"Every day"` are `daily`; a string naming at least one weekday becomes
 * `weekdays`; everything else — including the empty string — is `unknown`.
 */
export function parseDrawDays(value: string | null | undefined): DrawSchedule {
  if (!value) return { kind: "unknown" };
  const v = value.trim();
  if (v === "") return { kind: "unknown" };
  if (/\b(daily|every\s*day|7\s*days)\b/i.test(v)) return { kind: "daily" };

  const days: number[] = [];
  for (const [re, day] of WEEKDAY_TOKENS) {
    if (re.test(v)) days.push(day);
  }
  if (days.length === 0) return { kind: "unknown" };
  return { kind: "weekdays", days: [...new Set(days)].sort() };
}

/**
 * Combine several members' schedules into the FAMILY's schedule.
 *
 * A family draws on a date when ANY member does, so this is a union. The union of a daily member with anything is
 * daily, and an unknown member makes the whole family unknown — because if we cannot read one member's schedule we
 * cannot rule out that it draws on a given day.
 */
export function combineSchedules(schedules: readonly DrawSchedule[]): DrawSchedule {
  if (schedules.length === 0) return { kind: "unknown" };
  if (schedules.some((s) => s.kind === "unknown")) return { kind: "unknown" };
  if (schedules.some((s) => s.kind === "daily")) return { kind: "daily" };
  const days = new Set<number>();
  for (const s of schedules) {
    if (s.kind === "weekdays") for (const d of s.days) days.add(d);
  }
  return days.size === 0 ? { kind: "unknown" } : { kind: "weekdays", days: [...days].sort() };
}

/**
 * Does the schedule establish that a drawing occurs on this weekday?
 *
 * `true` — yes; `false` — the schedule positively excludes it; `null` — unknown, so nothing may be claimed either
 * way. Three states rather than a boolean, because the whole defect was collapsing "unknown" into "no".
 */
export function scheduleDrawsOn(schedule: DrawSchedule, weekday: number): boolean | null {
  switch (schedule.kind) {
    case "daily": return true;
    case "weekdays": return schedule.days.includes(weekday);
    default: return null;
  }
}

/* ------------------------------------------------------------------ coverage */

export interface CoverageAssessment {
  /** Dates in range on which the schedule says a drawing occurs. `null` when the schedule is unknown. */
  expectedDrawDates: number | null;
  /** Distinct dates in range for which the archive holds at least one row. */
  datesWithRows: number;
  /** Total calendar days in the covered range. */
  daysInRange: number;
  /**
   * Whether the archive holds a row for every date the schedule expects.
   *
   * `false` here is what makes `noDrawing` unreachable for a date the schedule permits: an incomplete archive
   * cannot distinguish "no drawing" from "no record", so it must say the latter.
   */
  complete: boolean;
}

/**
 * Assess whether the archive covers everything its own schedule implies.
 *
 * This is the test the calendar needs before it may ever say "No drawing" about a scheduled day. On
 * `/fl/pick-3/2026` it answers: 187 days in range, 187 expected drawing dates (daily), 27 dates with rows —
 * emphatically incomplete.
 */
export function assessCoverage(
  datesWithRows: readonly string[],
  fromIso: string | null,
  toIso: string | null,
  schedule: DrawSchedule,
): CoverageAssessment {
  const distinct = new Set(datesWithRows);
  if (fromIso === null || toIso === null) {
    return { expectedDrawDates: null, datesWithRows: distinct.size, daysInRange: 0, complete: false };
  }

  /* Walk the range by ISO string, no local-timezone Date arithmetic. Noon UTC keeps the step exact. */
  let expected = 0;
  let days = 0;
  let cursor = Date.parse(`${fromIso}T12:00:00Z`);
  const end = Date.parse(`${toIso}T12:00:00Z`);
  while (cursor <= end) {
    const d = new Date(cursor);
    days++;
    const draws = scheduleDrawsOn(schedule, d.getUTCDay());
    if (draws === true) expected++;
    cursor += 86_400_000;
  }

  return {
    expectedDrawDates: schedule.kind === "unknown" ? null : expected,
    datesWithRows: distinct.size,
    daysInRange: days,
    /* Unknown schedule → never "complete", because we cannot know what completeness would mean. */
    complete: schedule.kind !== "unknown" && distinct.size >= expected,
  };
}
