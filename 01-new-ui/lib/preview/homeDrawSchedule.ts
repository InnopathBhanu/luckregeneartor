/*
 * HOME DRAW SCHEDULES AND PRIOR-JACKPOT REFERENCES — the Home fixture enrichment.
 *
 * Authority: `CLAUDE.md` §14 (*"Every fixture MUST declare whether it is synthetic, copied, or
 * production-derived"*; *"production-derived data MUST retain provenance (source file, extraction date)"*;
 * *"Date and time handling MUST preserve game-local draw date and timezone meaning"*; *"Prefer
 * configuration-driven definitions … `DrawScheduleDefinition`"*), §9 (typed view models), the frozen
 * Constitution §7 (exact dates where "today" would be ambiguous; no manipulative urgency), BP-02 (H-02A featured
 * cards, H-02B jackpot table, H-03 latest results, H-06A upcoming).
 *
 * ══ WHAT THIS UNBLOCKS, AND WHY IT WAS BLOCKED ══
 *
 * `components/shell/NextDrawRelative.tsx` (§B1) and `lib/text/jackpotDelta.ts` (§B2) shipped working and rendered
 * nothing on Home, for one reason each:
 *
 *   §B1 needs a next drawing's game-local DATE, its published local TIME and the game's IANA ZONE.
 *       `home-page-sample.json` carried only a display string — `"Saturday, 07/11/2026"`. Parsing a governed date
 *       back out of a display string is what §14 forbids: a display format is a presentation decision, and
 *       re-deriving a date from it turns a formatting change into a date bug.
 *   §B2 needs TWO sourced advertised figures. The jackpot table's rows carried one.
 *
 * ══ THE SCHEDULE IS DERIVED, NOT STAMPED ══
 *
 * The instruction is explicit that a next-draw datetime must come from the game's SCHEDULE rather than from a
 * hardcoded per-fixture timestamp wherever a schedule can produce it. So nothing here holds a date. Each entry
 * holds the game's governed **draw days**, **published local draw time** and **IANA zone**, all read at module load
 * from the production-derived draw-event records — and `resolveHomeNextDraw` walks forward from the drawing that
 * actually happened to the next scheduled day.
 *
 * That is verifiable rather than asserted: the derivation reproduces the fixture's own published
 * `nextDraw.display` string for every game that has a schedule, and `tests/five-page-modules.test.ts` checks each
 * one. If the feed's draw days change, the derived date changes with them; if someone edits the display string, the
 * test fails instead of the page quietly disagreeing with itself.
 *
 * ══ WHY THE REFERENCE POINT IS THE DRAWING, NOT THE CLOCK ══
 *
 * `resolveHomeNextDraw` walks forward from each game's own `resultDate`, never from `Date.now()`. Two reasons, and
 * the second is a §14 rule:
 *
 *   1. A build must be deterministic. A schedule walked from the wall clock produces a different page every day
 *      from the same fixture, which makes a founder review unrepeatable and a snapshot test impossible.
 *   2. §14: *"production-derived fixture dates are NOT rewritten"* to look current. The fixture's results are from
 *      July 2026 and are labelled 32 days old on the page. Deriving "the next draw" from today would silently
 *      manufacture a fresh-looking future date for a stale result set — presenting a computed date as a published
 *      schedule fact.
 *
 * The relative label a reader sees is still computed against THEIR clock, by the client component. So a stale
 * fixture honestly reads "Drawing has taken place — result expected shortly", which is true.
 *
 * ══ PROVENANCE, PER ENTRY ══
 *
 * Every entry declares its own. There is no synthetic value in this module and no fallback that invents one:
 *
 *   [F1] `04-sample-data/source-xml/latest-results-lc.xml` — the production results feed. Extracted 2026-08-01
 *        for the four non-Florida states; the Florida records were transcribed by LRG-STATE-025 against the feed
 *        AND the operator's own published game pages. Supplies `result-date`, `next-date`, `prize`, `next-prize`.
 *   [F2] `04-sample-data/reference-tables/game.csv` — production database export. `GAMETIME` supplies
 *        `drawTimeLocal`.
 *   [F3] `01-new-ui/config/states/{code}.json` `state.timezone` — the validated jurisdiction configuration.
 *        Supplies the IANA zone for a state game.
 *   [F4] `lib/flagship/flagshipGames.ts` `drawTimeEt` — the operator-published Eastern draw time for the two
 *        national flagship games, quoted from the games' own rules. Supplies their zone.
 *
 * A game with no captured schedule gets NO datetime and NO label — see `NOT_CAPTURED` below. That is the honest
 * output, and it is the case Lotto America actually exercises.
 */

import { parseDrawDays } from "../archive/archiveSchedule";
import { FLORIDA_DRAW_EVENTS } from "../state/floridaDrawEvents";
import { drawEventsFor, type StateDrawEvent } from "../state/stateDrawEvents";
import { stateViewConfigFor } from "../state/stateViewConfigRegistry";
import { formatLastUpdated } from "../text/lastUpdated";

/* ------------------------------------------------------------------ provenance */

/** §14's three fixture classifications. A value must declare one; there is no default. */
export type FixtureProvenance = "production-derived" | "copied" | "synthetic";

export interface SourceRef {
  provenance: FixtureProvenance;
  /** The source file, and the extraction date where the source is an extract. §14 requires both. */
  source: string;
}

const FEED: SourceRef = {
  provenance: "production-derived",
  source: "[F1] 04-sample-data/source-xml/latest-results-lc.xml, extracted 2026-08-01",
};
const GAME_CSV: SourceRef = {
  provenance: "production-derived",
  source: "[F2] 04-sample-data/reference-tables/game.csv (GAMETIME), production database export",
};

/* ------------------------------------------------------------------ the schedule definition */

/**
 * One game's governed drawing schedule — the `DrawScheduleDefinition` shape §14 prefers over scattered
 * conditionals.
 *
 * `drawDays` is the operator's own published string ("Mon, Wed & Sat"), parsed by the existing governed
 * `parseDrawDays`. It is deliberately NOT pre-parsed into a weekday array here: the string is the transcribed
 * source value, and keeping it means a reader of this registry sees what the operator published rather than our
 * interpretation of it.
 */
export interface HomeDrawSchedule {
  /** Home's own game slug, as `home-page-sample.json` uses it. */
  gameSlug: string;
  /** The reader-facing name, for the games Home identifies by name only (the jackpot table). */
  gameName: string;
  /** The operator's published draw days. Empty string when no source publishes them. */
  drawDays: string;
  /** The operator's published local draw time, e.g. `"10:59 PM"`. `null` when none is captured. */
  drawTimeLocal: string | null;
  /** The governed IANA zone. `null` when the game's jurisdiction is not determined. */
  timeZone: string | null;
  /** The drawing that actually happened, game-local `YYYY-MM-DD` — the walk's reference point. */
  lastDrawDateIso: string | null;
  /**
   * The feed's own `next-date`, used ONLY where `drawDays` is unpublished and a walk is therefore impossible.
   * Not a "hardcoded fixture timestamp": it is the operator's own published next drawing, with provenance.
   */
  feedNextDrawDateIso: string | null;
  /** The advertised amount for the drawing that happened. The EARLIER of the two figures §B2 subtracts. */
  lastAdvertisedDisplay: string | null;
  /** The advertised amount for the next drawing. The LATER of the two figures §B2 subtracts. */
  nextAdvertisedDisplay: string | null;
  scheduleSource: SourceRef;
  timeSource: SourceRef | null;
  zoneSource: SourceRef | null;
}

/**
 * Games Home surfaces for which NO schedule is captured anywhere in the repository.
 *
 * Recorded rather than omitted silently, because "we have no source for this" and "we forgot this game" look
 * identical in an absent entry. Lotto America is the real case: it appears in `featureGames`, in the jackpot table
 * and in upcoming draws, and no draw-event record exists for it in any jurisdiction — Florida does not offer it,
 * and none of the four transcribed states carries it.
 */
export const NOT_CAPTURED: readonly { gameSlug: string; gameName: string; reason: string }[] = Object.freeze([
  {
    gameSlug: "lotto-america",
    gameName: "Lotto America",
    reason:
      "No draw-event record exists for Lotto America in any transcribed jurisdiction — Florida does not offer it, "
      + "and it is absent from the Michigan, Virginia, Maryland and California records. So no draw days, no draw "
      + "time and no jurisdiction zone are governed for it, and no next-draw datetime is produced. The relative "
      + "label and the jackpot delta both render nothing for this game, which is correct.",
  },
]);

/* ------------------------------------------------------------------ building the registry */

/** Look up one transcribed draw event by its family key. */
function eventFor(events: readonly StateDrawEvent[], familyKey: string): StateDrawEvent | undefined {
  return events.find((e) => e.familyKey === familyKey);
}

/**
 * The registry, resolved at module load from the governed records.
 *
 * READ, NEVER RESTATED. Every draw day, draw time, result date, next date and advertised figure below is read out
 * of a production-derived record — so a feed refresh flows through, and nothing here can drift away from the data
 * it claims to describe. The only literals are the KEYS (which Home game maps to which governed record) and the
 * two national games' zone, which comes from their own operator-published Eastern draw time.
 */
function buildRegistry(): HomeDrawSchedule[] {
  const fl = FLORIDA_DRAW_EVENTS;
  const ca = drawEventsFor("ca");
  /* The jurisdiction zones come from validated configuration, never from a label like "ET". */
  const flZone = stateViewConfigFor("fl")?.state.timezone ?? null;
  const caZone = stateViewConfigFor("ca")?.state.timezone ?? null;

  const out: HomeDrawSchedule[] = [];

  /*
   * The two national flagship games.
   *
   * Their draw days, times and advertised figures come from the Florida feed records — Florida sells both, so its
   * transcription carries the national drawing. Their ZONE is not Florida's by coincidence: both games publish an
   * Eastern draw time in their own rules ([F4]), and Florida happens to share it. Sourcing the zone from the game
   * rather than from a state that sells it is the distinction that keeps this correct if a non-Eastern state is
   * added later.
   */
  for (const [slug, name] of [["powerball", "Powerball"], ["mega-millions", "Mega Millions"]] as const) {
    const e = eventFor(fl, slug);
    if (!e) continue;
    out.push({
      gameSlug: slug,
      gameName: name,
      drawDays: e.drawDays,
      drawTimeLocal: e.drawTimeLocal,
      timeZone: "America/New_York",
      lastDrawDateIso: e.resultDate,
      feedNextDrawDateIso: e.nextDrawDate,
      lastAdvertisedDisplay: e.topPrizeDisplay,
      nextAdvertisedDisplay: e.nextPrizeDisplay,
      scheduleSource: FEED,
      timeSource: GAME_CSV,
      zoneSource: {
        provenance: "production-derived",
        source: "[F4] lib/flagship/flagshipGames.ts drawTimeEt — the game's own operator-published Eastern time",
      },
    });
  }

  /* Florida Lotto — a Florida game, so its zone is Florida's validated configuration. */
  const lotto = eventFor(fl, "florida-lotto");
  if (lotto) {
    out.push({
      gameSlug: "florida-lotto",
      gameName: "Florida Lotto",
      drawDays: lotto.drawDays,
      drawTimeLocal: lotto.drawTimeLocal,
      timeZone: flZone,
      lastDrawDateIso: lotto.resultDate,
      feedNextDrawDateIso: lotto.nextDrawDate,
      lastAdvertisedDisplay: lotto.topPrizeDisplay,
      nextAdvertisedDisplay: lotto.nextPrizeDisplay,
      scheduleSource: FEED,
      timeSource: GAME_CSV,
      zoneSource: { provenance: "production-derived", source: "[F3] config/states/fl.json state.timezone" },
    });
  }

  /*
   * SuperLotto Plus — the partial case, and worth reading.
   *
   * `feedDrawEvents.ts` records `drawDays: ""` for every non-Florida game and says why: Florida's draw days came
   * from the operator's own published game pages, and no equivalent source exists in the repository for the other
   * four states. So the schedule CANNOT derive a date here, and `resolveHomeNextDraw` falls back to the feed's own
   * `next-date` — which is a published operator fact with provenance, not a stamped timestamp.
   *
   * Its prize figures are `null` in the feed record, deliberately: `feedDrawEvents.ts` withholds them for
   * state-native games because the governed prize SEMANTICS are unverified — whether the feed's money value is an
   * annuitized jackpot, a cash value or a fixed top prize. So no delta is produced for it, correctly.
   */
  const superlotto = eventFor(ca, "superlotto-plus");
  if (superlotto) {
    out.push({
      gameSlug: "superlotto-plus",
      gameName: "SuperLotto Plus (CA)",
      drawDays: superlotto.drawDays,
      drawTimeLocal: superlotto.drawTimeLocal,
      timeZone: caZone,
      lastDrawDateIso: superlotto.resultDate,
      feedNextDrawDateIso: superlotto.nextDrawDate,
      lastAdvertisedDisplay: superlotto.topPrizeDisplay,
      nextAdvertisedDisplay: superlotto.nextPrizeDisplay,
      scheduleSource: FEED,
      timeSource: GAME_CSV,
      zoneSource: { provenance: "production-derived", source: "[F3] config/states/ca.json state.timezone" },
    });
  }

  return out;
}

const REGISTRY: readonly HomeDrawSchedule[] = Object.freeze(buildRegistry());

/** Every Home game with a governed schedule record. Read by the provenance report and the tests. */
export function homeDrawSchedules(): readonly HomeDrawSchedule[] {
  return REGISTRY;
}

/**
 * The schedule for a Home game, by slug OR by the reader-facing name.
 *
 * Both, because Home identifies a game two ways: its result cards carry `gameSlug`, and its jackpot table carries
 * only a display name. Resolving by name uses the registry's own `gameName`, so no slugification guess is involved
 * — `"SuperLotto Plus (CA)"` would not survive one.
 */
export function homeDrawSchedule(slugOrName: string | null | undefined): HomeDrawSchedule | null {
  if (!slugOrName) return null;
  const key = slugOrName.trim();
  return REGISTRY.find((s) => s.gameSlug === key || s.gameName === key)
    ?? REGISTRY.find((s) => s.gameName.toLowerCase() === key.toLowerCase())
    ?? null;
}

/* ------------------------------------------------------------------ the derivation */

const DAY_MS = 86_400_000;

/** The resolved next drawing: exactly what `NextDrawRelative` and `nextDrawRelativeLabel` consume. */
export interface ResolvedNextDraw {
  /** Game-local `YYYY-MM-DD`. */
  gameLocalDate: string;
  drawTimeLocal: string | null;
  timeZone: string;
  /** How the date was obtained. `schedule` walked the published draw days; `feedNextDate` read the feed. */
  derivedFrom: "schedule" | "feedNextDate";
}

/**
 * The next drawing after the one that happened.
 *
 * Walks forward one day at a time from the day AFTER `lastDrawDateIso` to the first day the published schedule
 * includes. Bounded at 14 days: every real lottery schedule repeats within a week, so a 14-day walk that finds
 * nothing means the parsed schedule is empty rather than sparse, and returning `null` there is safer than looping.
 *
 * `Date.UTC` arithmetic on the calendar parts, deliberately: this walk is over CALENDAR DAYS in the game's own
 * locale, not over instants. Introducing a timezone here would be the off-by-one §14 names as a symptom — the zone
 * belongs to the resulting datetime, which is why it is carried out untouched for `zonedInstant` to apply later.
 */
export function resolveHomeNextDraw(slugOrName: string | null | undefined): ResolvedNextDraw | null {
  const s = homeDrawSchedule(slugOrName);
  if (!s || !s.timeZone) return null;

  const schedule = parseDrawDays(s.drawDays);
  if (s.lastDrawDateIso && schedule.kind !== "unknown") {
    const [y, m, d] = s.lastDrawDateIso.split("-").map(Number);
    if (y && m && d) {
      const start = Date.UTC(y, m - 1, d);
      for (let i = 1; i <= 14; i += 1) {
        const at = new Date(start + i * DAY_MS);
        const weekday = at.getUTCDay();
        const draws = schedule.kind === "daily" || schedule.days.includes(weekday);
        if (!draws) continue;
        const iso = `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}`
          + `-${String(at.getUTCDate()).padStart(2, "0")}`;
        return {
          gameLocalDate: iso,
          drawTimeLocal: s.drawTimeLocal,
          timeZone: s.timeZone,
          derivedFrom: "schedule",
        };
      }
    }
  }

  /* No published draw days. The operator's own next-date is the only governed answer, and it is a real one. */
  if (s.feedNextDrawDateIso) {
    return {
      gameLocalDate: s.feedNextDrawDateIso,
      drawTimeLocal: s.drawTimeLocal,
      timeZone: s.timeZone,
      derivedFrom: "feedNextDate",
    };
  }
  return null;
}

/* ------------------------------------------------------------------ prior-jackpot references */

/** The two sourced figures §B2 subtracts, plus the reader-facing name of the earlier drawing. */
export interface PriorJackpotReference {
  /** The advertised amount for the next drawing — the figure the page shows. */
  currentAmountDisplay: string;
  /** The advertised amount for the drawing that happened. */
  previousAmountDisplay: string;
  /** "the July 8 drawing". The reference point, so a difference is not a bare number. */
  previousDrawLabel: string;
}

/**
 * The prior-jackpot reference for a Home game, or `null`.
 *
 * ══ NOTHING IS ESTIMATED OR BACKFILLED ══
 *
 * All three parts must come from the same governed record, and every one of them is a published operator figure:
 * the feed's `prize` (the drawing that happened), its `next-prize` (the next drawing) and its `result-date`. If the
 * record withholds either figure — as it does for every state-native game, because the prize SEMANTICS are
 * unverified — this returns `null` and the delta module renders nothing. That is the specified behaviour and it is
 * kept: a missing figure is never replaced with a nearby one, and a difference is never inferred from one value.
 *
 * `jackpotDelta.ts` then applies its own independent guard, refusing any approximate form. Two gates, and the
 * second does not trust the first.
 */
export function homePriorJackpot(slugOrName: string | null | undefined): PriorJackpotReference | null {
  const s = homeDrawSchedule(slugOrName);
  if (!s || !s.lastAdvertisedDisplay || !s.nextAdvertisedDisplay || !s.lastDrawDateIso) return null;
  return {
    currentAmountDisplay: s.nextAdvertisedDisplay,
    previousAmountDisplay: s.lastAdvertisedDisplay,
    /* The date in reader form, from the shared formatter, so "the July 8 drawing" reads the same everywhere. */
    previousDrawLabel: `the ${formatLastUpdated(s.lastDrawDateIso)} drawing`,
  };
}

/* ------------------------------------------------------------------ the provenance report */

export interface HomeScheduleProvenanceRow {
  gameSlug: string;
  gameName: string;
  hasSchedule: boolean;
  derivedFrom: ResolvedNextDraw["derivedFrom"] | "none";
  hasPriorJackpot: boolean;
  provenance: FixtureProvenance | "not-captured";
  source: string;
}

/**
 * Every Home game's enrichment status, in one table.
 *
 * §14 requires a fixture to declare its provenance; this is where a reviewer reads all of them at once rather than
 * inferring from four call sites. It is also what the test asserts against, so a game losing its schedule shows up
 * as a changed row rather than as a quietly missing label.
 */
export function homeSchedulesProvenance(): HomeScheduleProvenanceRow[] {
  const rows: HomeScheduleProvenanceRow[] = REGISTRY.map((s) => {
    const next = resolveHomeNextDraw(s.gameSlug);
    return {
      gameSlug: s.gameSlug,
      gameName: s.gameName,
      hasSchedule: true,
      derivedFrom: next?.derivedFrom ?? "none",
      hasPriorJackpot: homePriorJackpot(s.gameSlug) !== null,
      provenance: s.scheduleSource.provenance,
      source: s.scheduleSource.source,
    };
  });
  for (const n of NOT_CAPTURED) {
    rows.push({
      gameSlug: n.gameSlug,
      gameName: n.gameName,
      hasSchedule: false,
      derivedFrom: "none",
      hasPriorJackpot: false,
      provenance: "not-captured",
      source: n.reason,
    });
  }
  return rows;
}
