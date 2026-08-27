/*
 * CALENDAR AND AGENDA GROUPING — LRG-ARCHIVE-057.
 *
 * Authority: the 2026-08-05 founder direction §1 (*"Desktop calendar: monthly calendar presentation. Mobile:
 * date-grouped agenda rather than a compressed seven-column calendar… Dates without a drawing must say `No
 * drawing` where clarification is needed… Do not make empty dates look like missing or failed data"*);
 * `ACCT-DEC-001` `FD-ACC-05` (calendar and agenda viewing are public); archive blueprint §12 (result presentation),
 * §35 (server-visible content, no infinite scroll); `CLAUDE.md` §9 (mobile is a primary surface).
 *
 * ══ THIS MODULE GROUPS ROWS. IT DOES NOT FILTER THEM ══
 *
 * The rows it receives are already the output of `filterArchive`, so the calendar and the table cannot disagree
 * about which drawings exist: they are two arrangements of one array. That is the whole reason filter parity is
 * testable rather than aspirational — there is no second query.
 *
 * ══ FOUR DAY STATES, AND WHY THE FOURTH HAD TO BE ADDED (LRG-ARCHIVE-058) ══
 *
 *   `drawn`               at least one drawing on this date in the current filter
 *   `noDrawing`           the registered schedule POSITIVELY EXCLUDES this weekday, so no drawing occurred
 *   `noRegisteredResult`  no row, and we cannot conclude a drawing did not happen
 *   `outside`             before the first or after the last date the archive covers
 *
 * The original three collapsed the middle two, and `noDrawing` was assigned to any covered date with no row. On
 * `/fl/pick-3/2026` that produced **160 false claims**: both Pick 3 members register `drawDays: "Daily"`, so a
 * drawing did occur on every one of those dates — the fixture simply covers four dates a month.
 *
 * `noDrawing` is now a conclusion requiring positive evidence from the schedule (see `archiveSchedule.ts`). For a
 * daily game it is unreachable, which is right. `noRegisteredResult` says "No registered result" — a statement
 * about our records rather than about the lottery.
 *
 * None of the four renders as a blank or an error tone: a blank would read as a failed request, which the founder
 * direction forbids as clearly as it forbids the false claim.
 *
 * ══ NO DATE PARSING ══
 *
 * Every date here is an ISO `YYYY-MM-DD` string compared lexically, and the only `Date` construction is pinned to
 * noon UTC for a weekday name. A local-timezone `Date` can shift a draw date across a day boundary, which is the
 * failure `CLAUDE.md` §14 names and the exact bug a calendar is most likely to introduce.
 */

import type { ArchiveDrawRow } from "./archiveContract";
import { monthKeyOf } from "./archiveYear";
import { scheduleDrawsOn, type CoverageAssessment, type DrawSchedule } from "./archiveSchedule";

/** Why a calendar day looks the way it does. Never a bare boolean — see the module header. */
export type CalendarDayState = "drawn" | "noDrawing" | "noRegisteredResult" | "outside";

export interface CalendarDay {
  /** `YYYY-MM-DD`. */
  dateIso: string;
  /** Day of month, 1–31. */
  day: number;
  /** 0 = Sunday … 6 = Saturday. Used only for grid placement. */
  weekday: number;
  state: CalendarDayState;
  /** Drawings on this date, in the family's configured member order. Empty unless `state === "drawn"`. */
  rows: readonly ArchiveDrawRow[];
}

export interface CalendarMonth {
  monthKey: string;
  year: number;
  month: number;
  label: string;
  /** Every day of the month, in order. Includes `noDrawing` and `outside` days. */
  days: readonly CalendarDay[];
  /** Leading blank cells before the 1st, so the grid aligns to a Sunday start. */
  leadingBlanks: number;
  /** How many drawings the month holds in the current filter. */
  drawCount: number;
}

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Days in a month, with a correct Gregorian leap-year rule. No `Date`, so no timezone can shift a boundary. */
function daysInMonth(year: number, month: number): number {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
}

/** The weekday for an ISO date. Pinned to noon UTC so no local offset can move it a day. */
function weekdayOf(dateIso: string): number {
  return new Date(`${dateIso}T12:00:00Z`).getUTCDay();
}

function dateIsoOf(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Group filtered rows into calendar months.
 *
 * `coveredFromIso` / `coveredToIso` bound the archive's real coverage, and they come from the UNFILTERED year — not
 * from the rows passed in. That distinction matters: if a reader filters to March, every other day must still read
 * as `noDrawing` rather than `outside`, because those days genuinely are inside the covered archive and the reader's
 * filter is what excluded them. Deriving coverage from the filtered rows would make a narrow filter look like a
 * narrow archive.
 *
 * `monthKeys` selects which months to build — normally the year's valid months, so a current year does not render
 * five empty future grids.
 */
export function buildCalendarMonths(
  rows: readonly ArchiveDrawRow[],
  year: number,
  monthKeys: readonly string[],
  coveredFromIso: string | null,
  coveredToIso: string | null,
  /** The family's registered schedule. `unknown` is safe: it makes `noDrawing` unreachable. */
  schedule: DrawSchedule = { kind: "unknown" },
  /** From `assessCoverage`. An incomplete archive may never claim a scheduled day had no drawing. */
  coverage?: CoverageAssessment,
  /** Dates an upstream source explicitly marks as no-draw. Empty until `game_daysoff` is connected. */
  explicitNoDrawDates: readonly string[] = [],
): CalendarMonth[] {
  const explicitNoDraw = new Set(explicitNoDrawDates);
  const coverageComplete = coverage?.complete === true;
  const byDate = new Map<string, ArchiveDrawRow[]>();
  for (const r of rows) {
    byDate.set(r.drawDateIso, [...(byDate.get(r.drawDateIso) ?? []), r]);
  }

  const out: CalendarMonth[] = [];
  for (const key of monthKeys) {
    const month = Number(key.slice(5, 7));
    const total = daysInMonth(year, month);
    const days: CalendarDay[] = [];

    for (let day = 1; day <= total; day++) {
      const dateIso = dateIsoOf(year, month, day);
      const onDay = byDate.get(dateIso) ?? [];
      /* Lexical ISO comparison — correct because every value is zero-padded, and free of timezone risk. */
      const outside =
        (coveredFromIso !== null && dateIso < coveredFromIso)
        || (coveredToIso !== null && dateIso > coveredToIso);

      /*
       * ---- the corrected classification ----
       *
       * Order matters. A row wins; then the covered range; then an explicit no-draw record; then the schedule.
       * `noDrawing` is reached only by EVIDENCE — an explicit record, or a schedule that excludes this weekday, or
       * a schedule that permits it combined with complete coverage. Everything else is `noRegisteredResult`.
       */
      const weekday = weekdayOf(dateIso);
      const draws = scheduleDrawsOn(schedule, weekday);
      let state: CalendarDayState;
      if (onDay.length > 0) {
        state = "drawn";
      } else if (outside) {
        state = "outside";
      } else if (explicitNoDraw.has(dateIso)) {
        /* An upstream source says there was no drawing. The only unambiguous case. */
        state = "noDrawing";
      } else if (draws === false) {
        /* The schedule positively excludes this weekday — e.g. a Monday for a "Wed & Sat" game. */
        state = "noDrawing";
      } else if (draws === true && coverageComplete) {
        /* The schedule expects a drawing AND the archive is complete, so an absent row means it did not occur. */
        state = "noDrawing";
      } else {
        /* Either the schedule is unknown, or it expects a drawing and our coverage is incomplete. Say only what
           we know: we have no registered result for this date. */
        state = "noRegisteredResult";
      }

      days.push({
        dateIso,
        day,
        weekday,
        state,
        /* Member order, never date order: two drawings on one day are Midday then Evening. */
        rows: [...onDay].sort((a, b) => a.memberOrder - b.memberOrder),
      });
    }

    out.push({
      monthKey: key,
      year,
      month,
      label: MONTH_LABELS[month - 1] ?? key,
      days,
      leadingBlanks: days.length > 0 ? days[0].weekday : 0,
      drawCount: days.reduce((n, d) => n + d.rows.length, 0),
    });
  }
  return out;
}

/** One agenda entry: a date that has drawings, with them. */
export interface AgendaDay {
  dateIso: string;
  rows: readonly ArchiveDrawRow[];
}

/**
 * The mobile agenda: only dates that HAVE drawings, newest or oldest first.
 *
 * Deliberately different from the calendar rather than a restyle of it. A seven-column grid at 390 px gives each
 * day about 50 px, which cannot hold two drawings of three digits plus an add-on label — so the mobile view lists
 * dates instead of laying out a month.
 *
 * And it omits empty days entirely, which is right for a list: a calendar grid has a slot for every date whether
 * or not anything happened, but a list of "nothing happened" entries is noise. The month's own count already tells
 * a reader how many drawings the month holds.
 */
export function buildAgenda(
  rows: readonly ArchiveDrawRow[],
  order: "newest" | "oldest" = "newest",
): AgendaDay[] {
  const byDate = new Map<string, ArchiveDrawRow[]>();
  for (const r of rows) byDate.set(r.drawDateIso, [...(byDate.get(r.drawDateIso) ?? []), r]);

  const dir = order === "newest" ? -1 : 1;
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]) * dir)
    .map(([dateIso, list]) => ({
      dateIso,
      rows: [...list].sort((a, b) => a.memberOrder - b.memberOrder),
    }));
}

/** Month keys for a year's valid months, ascending. The calendar never builds a month that cannot hold a drawing. */
export function calendarMonthKeys(year: number, validMonths: number): string[] {
  return Array.from({ length: validMonths }, (_, i) => monthKeyOf(year, i + 1));
}
