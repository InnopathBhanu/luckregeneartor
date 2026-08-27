/*
 * THE WEEKLY DRAWING SCHEDULE — §B3.
 *
 * Authority: PF-02 §17 (S-04 *"Live and Upcoming Draws"*, content: *"game/variant; time/timezone; current
 * status"*), Global Shell §10.3, which names *"Which games draw tonight?"* as one of the four canonical State-page
 * questions; `CLAUDE.md` §14 (game-local draw date and timezone meaning; configuration-driven definitions).
 *
 * ══ THE SECTION-FIT CHECK, WHICH THE TASK REQUIRED BEFORE PLACING ANYTHING ══
 *
 * The instruction suggested S-08 or S-08A. **Neither fits, and PF-02 says so explicitly.**
 *
 *   S-08 (§21) is *"Claims, Taxes, Anonymity and Player Help"*. A draw schedule is none of those.
 *   S-08A (§21A) enumerates its required facts — purchase age, time zone, claim deadline, tax status, anonymity,
 *   online-play status, help link, effective date — and a schedule is not among them. Its stated PURPOSE is to
 *   provide a compact fact block *"without placing a large 'Quick Facts' table above results"*, so putting a
 *   seven-column weekly table inside it would invert the one thing that section exists to prevent.
 *
 * **S-04 fits exactly.** Its content list is *"game/variant; time/timezone; current status; result link"* and its
 * AI note is *"Can explain status or schedule change"*. So the weekly view is placed in S-04, and the suggested
 * placement is recorded as corrected rather than followed. No new section was invented (PF-02 §12 is closed).
 *
 * ══ WHAT IS ACTUALLY NEW HERE ══
 *
 * S-04 already rendered a per-GAME table: one row per family, its draw days, its draw times, its sales cutoff.
 * That answers *"when does Pick 3 draw?"*. It does not answer *"what draws tonight?"* — for that a reader has to
 * read every row and do the set arithmetic themselves, which is precisely the persona finding.
 *
 * This inverts the same governed data: one row per DAY OF THE WEEK, listing the games that draw on it. Nothing new
 * is sourced. The transform is a union over `parseDrawDays`, the existing governed parser, which already
 * distinguishes daily / specific weekdays / **unknown** as three states rather than collapsing unknown into "no".
 *
 * ══ UNKNOWN IS CARRIED, NOT DROPPED ══
 *
 * A game whose `drawDays` string is empty — which is every game in the four non-Florida preview States, because no
 * operator-published source for them exists in the repository — cannot be placed on any day. It is NOT silently
 * omitted and it is NOT guessed onto a day: it is collected into `unscheduled`, and the section states that its
 * days are not published. Collapsing unknown into absence would let a reader conclude a game does not draw tonight
 * when we simply do not know.
 */

import { parseDrawDays, type DrawSchedule } from "../archive/archiveSchedule";

/** Sunday-first, matching `Date.prototype.getDay()` and `parseDrawDays`' own numbering. */
export const WEEKDAY_NAMES: readonly string[] = Object.freeze([
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
]);

export interface WeeklyDrawGame {
  /** The reader-facing game name, with any trailing parenthetical stripped by the caller. */
  label: string;
  /** Every published draw time for this game on this day, in the jurisdiction's own zone. */
  times: readonly string[];
  /** True when the game draws every day — worth saying, because it is why it appears seven times. */
  daily: boolean;
}

export interface WeeklyDrawDay {
  /** 0 = Sunday. */
  weekday: number;
  name: string;
  games: readonly WeeklyDrawGame[];
}

export interface WeeklyDrawSchedule {
  days: readonly WeeklyDrawDay[];
  /** Games whose draw days are not published. Named, never assigned to a day and never hidden. */
  unscheduled: readonly string[];
  /** True when at least one day carries at least one game — otherwise the caller renders nothing. */
  hasAny: boolean;
}

/** One governed schedule row, as the State Content Manifest holds it. */
export interface ScheduleRow {
  gameId: number;
  familyKey: string;
  displayName: string;
  drawDays: string;
  drawTimeLocal: string;
  drawPeriod?: string | null;
}

/**
 * Invert the per-game schedule into a per-day one.
 *
 * Rows are grouped by FAMILY first, so Pick 3 Midday and Pick 3 Evening appear as one game with two times rather
 * than as two games — the same family collapse the rest of the State page uses (FD-X-06), and the reason a reader
 * sees "Pick 3 · Midday 1:30 PM, Evening 9:45 PM" instead of two adjacent near-duplicate rows.
 */
export function weeklyDrawSchedule(rows: readonly ScheduleRow[]): WeeklyDrawSchedule {
  const families = new Map<string, ScheduleRow[]>();
  for (const r of rows) families.set(r.familyKey, [...(families.get(r.familyKey) ?? []), r]);

  const unscheduled: string[] = [];
  const perDay: WeeklyDrawGame[][] = [[], [], [], [], [], [], []];

  for (const [, familyRows] of families) {
    const first = familyRows[0];
    /* The trailing parenthetical is a feed artefact ("Powerball (Multi-State)"), not part of the game's name. */
    const label = first.displayName.replace(/\s*\(.*\)$/, "");
    const schedule: DrawSchedule = parseDrawDays(first.drawDays);

    if (schedule.kind === "unknown") {
      unscheduled.push(label);
      continue;
    }

    /* Every published time for this family, prefixed by its draw period where one exists. */
    const times = familyRows.map((r) =>
      (r.drawPeriod ? `${r.drawPeriod} ${r.drawTimeLocal}` : r.drawTimeLocal),
    );

    const days = schedule.kind === "daily" ? [0, 1, 2, 3, 4, 5, 6] : schedule.days;
    for (const d of days) {
      perDay[d].push({ label, times, daily: schedule.kind === "daily" });
    }
  }

  /* Games within a day read in a stable alphabetical order. Recency would be meaningless here — a schedule has no
     recency — and configured order would put a daily game above a jackpot game on the day both draw. */
  const days: WeeklyDrawDay[] = perDay.map((games, weekday) => ({
    weekday,
    name: WEEKDAY_NAMES[weekday],
    games: [...games].sort((a, b) => a.label.localeCompare(b.label)),
  }));

  return {
    days,
    unscheduled: [...unscheduled].sort((a, b) => a.localeCompare(b)),
    hasAny: days.some((d) => d.games.length > 0),
  };
}
