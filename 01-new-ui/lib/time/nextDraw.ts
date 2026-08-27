/*
 * NEXT-DRAW TIMING — §B1.
 *
 * Authority: `CLAUDE.md` §14 (*"Date and time handling MUST preserve game-local draw date and timezone meaning …
 * Legacy off-by-one behavior is a symptom to test against, not a rule to reproduce"*), the frozen Constitution
 * (*"exact dates where 'today' or 'last night' could be ambiguous"*; language *"MUST NOT … use manipulative
 * urgency"*), Global Shell SL-U05 (Next Draw and Schedule).
 *
 * ══ WHAT THE RESEARCH ASKED FOR, AND WHAT IT DID NOT ══
 *
 * The persona findings asked for a *"next drawing in X hours/minutes"* label beside the absolute date. It did NOT
 * ask for a ticking countdown clock, and one is deliberately not built here: a second-by-second clock beside a
 * lottery jackpot is the *"trading terminal"* and *"casino interface"* feel the Constitution rules out, and it
 * turns a schedule fact into a pressure device. This produces a settled phrase — "in about 4 hours", "tomorrow",
 * "in 3 days" — that a reader can act on and that does not manufacture urgency.
 *
 * ══ WHY THE TIMEZONE WORK IS UNAVOIDABLE ══
 *
 * A draw date is GAME-LOCAL. `nextDrawDate: "2026-07-11"` with `drawTimeLocal: "10:59 PM"` means 22:59 in the
 * jurisdiction's own zone, and the reader's clock is somewhere else. Subtracting a naive `Date.parse` from
 * `Date.now()` is how the legacy application produced its off-by-one dates, and §14 names that as a symptom to
 * test against. So the instant is resolved through the jurisdiction's GOVERNED IANA zone
 * (`config.state.timezone`, e.g. `America/New_York`), which handles DST correctly and needs no dependency.
 *
 * ══ WHY NO LIBRARY, AND HOW THE OFFSET IS FOUND ══
 *
 * `Intl.DateTimeFormat` with a `timeZone` can FORMAT an instant in a zone but cannot parse a wall time into one.
 * The standard inversion is: guess that the wall-clock parts are UTC, format that guess back in the target zone,
 * measure how far the formatted result drifted from the parts we wanted, and subtract the drift. One correction
 * pass is exact except within the one-hour DST fold, where a second pass settles it. That is what
 * `zonedInstant` does, and it is the only clock arithmetic in the codebase.
 *
 * NOTHING HERE IS A PREDICTION. A draw schedule is a published operator fact; the label restates when it happens.
 */

/** The pieces a caller has: a game-local calendar date, an optional local wall time, and the governed zone. */
export interface NextDrawTiming {
  /** `YYYY-MM-DD`, game-local. Never a UTC date. */
  gameLocalDate: string;
  /**
   * The operator's published local draw time, in any of the shapes the governed data actually uses:
   * `"10:59 PM"`, `"10:59 p.m. ET"`, `"22:59"`. `null` when the jurisdiction publishes none — and a guess is
   * never substituted (the data files record an empty draw time as the honest value).
   */
  drawTimeLocal: string | null;
  /** The jurisdiction's governed IANA zone, e.g. `America/New_York`. */
  timeZone: string;
}

/* ------------------------------------------------------------------ parsing a published time */

/**
 * `"10:59 p.m. ET"` → `{ hour: 22, minute: 59 }`.
 *
 * Tolerant of the three shapes the governed data uses, and STRICT about everything else: an unrecognised string
 * returns `null`, so an unparsed time produces a day-level label rather than a confidently wrong hour.
 */
export function parseLocalTime(raw: string | null | undefined): { hour: number; minute: number } | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/\./g, "");
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/.exec(s);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] === undefined ? 0 : Number(m[2]);
  const meridiem = m[3];
  if (minute > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  } else if (hour > 23) {
    return null;
  }
  return { hour, minute };
}

/* ------------------------------------------------------------------ wall time → instant */

/** The wall-clock parts an instant has when read in a given zone. */
function partsInZone(ms: number, timeZone: string): {
  y: number; mo: number; d: number; h: number; mi: number;
} | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
    const got: Record<string, string> = {};
    for (const p of fmt.formatToParts(new Date(ms))) got[p.type] = p.value;
    return {
      y: Number(got.year), mo: Number(got.month), d: Number(got.day),
      h: Number(got.hour), mi: Number(got.minute),
    };
  } catch {
    /* An unrecognised zone is a configuration fault, not a render fault. Returning null makes the caller
       degrade to a day-level label instead of throwing inside a component. */
    return null;
  }
}

/**
 * The epoch milliseconds at which a given wall time occurs in a given zone.
 *
 * `null` when the zone is unusable. See the header for why this inversion is necessary and how it works.
 */
export function zonedInstant(
  gameLocalDate: string,
  hour: number,
  minute: number,
  timeZone: string,
): number | null {
  const [y, mo, d] = gameLocalDate.split("-").map(Number);
  if (!y || !mo || !d) return null;
  /* The guess: treat the wall-clock parts as if they were UTC. */
  let ms = Date.UTC(y, mo - 1, d, hour, minute, 0, 0);
  for (let pass = 0; pass < 2; pass += 1) {
    const got = partsInZone(ms, timeZone);
    if (!got) return null;
    const want = Date.UTC(y, mo - 1, d, hour, minute, 0, 0);
    const have = Date.UTC(got.y, got.mo - 1, got.d, got.h, got.mi, 0, 0);
    const drift = have - want;
    if (drift === 0) return ms;
    ms -= drift;
  }
  return ms;
}

/** The instant a next drawing happens, or `null` when the published time is unknown or unparsable. */
export function nextDrawInstant(t: NextDrawTiming): number | null {
  const parsed = parseLocalTime(t.drawTimeLocal);
  if (!parsed) return null;
  return zonedInstant(t.gameLocalDate, parsed.hour, parsed.minute, t.timeZone);
}

/* ------------------------------------------------------------------ the label */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The relative phrase, from an instant and a now.
 *
 * ══ THE THRESHOLDS, AND WHY EACH ONE ══
 *
 *   past                 "Drawing has taken place — result expected shortly". Never "results are in": we do not
 *                        know that, and claiming it would be an unsupported statement about a published fact.
 *   under 1 minute       "in under a minute". No seconds — see the no-ticking-clock note in the header.
 *   under 1 hour         "in N minutes", rounded down, so the phrase never overstates the time remaining.
 *   under 24 hours       "in about N hours". "About" is honest: the reader's own clock is the input.
 *   under 7 days         "in N days". Plus the calendar-day forms below where they are unambiguous.
 *   7 days or more       `null` — the absolute date already says it better, and "in 23 days" beside a date is
 *                        noise. A `null` label means "render the date alone".
 *
 * `sameDay` and `nextDay` let a caller upgrade to "later today" / "tomorrow", which read better than an hour
 * count when the draw is far off but still calendar-close. They are computed by the caller in the GAME's zone,
 * never from the viewer's, so "tomorrow" cannot mean two different days for two readers.
 */
export function relativeDrawLabel(
  targetMs: number,
  nowMs: number,
  opts: { sameGameLocalDay?: boolean; nextGameLocalDay?: boolean } = {},
): string | null {
  const delta = targetMs - nowMs;
  if (delta <= 0) return "Drawing has taken place — result expected shortly";
  if (delta < MINUTE) return "in under a minute";
  if (delta < HOUR) {
    const mins = Math.floor(delta / MINUTE);
    return `in ${mins} ${mins === 1 ? "minute" : "minutes"}`;
  }
  if (delta < 6 * HOUR) {
    const hours = Math.floor(delta / HOUR);
    return `in about ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  if (opts.sameGameLocalDay) return "later today";
  if (opts.nextGameLocalDay) return "tomorrow";
  if (delta < DAY) {
    const hours = Math.floor(delta / HOUR);
    return `in about ${hours} hours`;
  }
  const days = Math.floor(delta / DAY);
  if (days < 7) return `in ${days} ${days === 1 ? "day" : "days"}`;
  return null;
}

/**
 * The day-level phrase when no draw TIME is published.
 *
 * Compared in the GAME's zone, so a reader in Los Angeles at 11pm does not see "today" for a Florida drawing that
 * has already happened. Returns `null` beyond a week, and `null` when the zone is unusable — in both cases the
 * absolute date renders alone, which is always correct.
 */
export function relativeDrawDayLabel(
  gameLocalDate: string,
  nowMs: number,
  timeZone: string,
): string | null {
  const now = partsInZone(nowMs, timeZone);
  if (!now) return null;
  const [y, mo, d] = gameLocalDate.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const target = Date.UTC(y, mo - 1, d);
  const today = Date.UTC(now.y, now.mo - 1, now.d);
  const days = Math.round((target - today) / DAY);
  if (days < 0) return "Drawing has taken place — result expected shortly";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  return null;
}

/**
 * The one entry point a component calls.
 *
 * Prefers the precise instant and degrades to the day-level phrase, so a jurisdiction that publishes no draw time
 * still gets a useful label instead of nothing — and never gets an invented hour.
 */
export function nextDrawRelativeLabel(t: NextDrawTiming, nowMs: number): string | null {
  const instant = nextDrawInstant(t);
  if (instant === null) return relativeDrawDayLabel(t.gameLocalDate, nowMs, t.timeZone);

  const now = partsInZone(nowMs, t.timeZone);
  const [y, mo, d] = t.gameLocalDate.split("-").map(Number);
  const sameGameLocalDay = now ? now.y === y && now.mo === mo && now.d === d : false;
  const nextGameLocalDay = now
    ? Date.UTC(y, mo - 1, d) - Date.UTC(now.y, now.mo - 1, now.d) === DAY
    : false;
  return relativeDrawLabel(instant, nowMs, { sameGameLocalDay, nextGameLocalDay });
}
