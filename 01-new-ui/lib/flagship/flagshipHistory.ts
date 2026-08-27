/*
 * THE PUBLISHED FLAGSHIP DRAWING HISTORY — LRG-FLAGSHIP-003, rewritten by FGP-008.
 *
 * Authority: BP-04A §22 (Results and Rule-Era History), §3 (statistics default to the current era), `CLAUDE.md`
 * §14 (*"Synthetic content MUST NEVER be presented as real public fact"*), the FGP-008 instruction (*"Change
 * default route behavior so public routes use only real published data or intentional empty states"*).
 *
 * ══ WHAT CHANGED IN FGP-008 ══
 *
 * This module used to build a MIXED series: the newest row from the production feed, and up to 519 deterministic
 * review rows behind it so the explorer, the checker's history modes and the Stats Lab had something to run
 * against. Every synthetic row was tagged, filterable and disclosed — but it was still the default behaviour of a
 * route with no guard in front of it, and that is what FGP-008 removes.
 *
 * **This module now emits published drawings and nothing else.** The generator moved, whole, to
 * `flagshipReviewFixture.ts`, which is imported by tests only and refuses to run in production.
 *
 * ══ WHAT "PUBLISHED" MEANS HERE ══
 *
 * A drawing the production results feed actually carries. The feed holds one current record per game per
 * jurisdiction and those records describe the SAME national drawing, so they are de-duplicated by date and drawn
 * values: five Powerball jurisdiction records collapse to one published drawing, which is the true count.
 *
 * That count is one per game today. The tools are built for a series and say so plainly when they do not have
 * one — an intentional limited-data state, never an estimate and never a filled gap.
 */

import type { FlagshipGameConfig } from "./flagshipGames";
import { drawEventsFor, statesWithDrawEvents, type StateDrawEvent } from "@/lib/state/stateDrawEvents";

/* ------------------------------------------------------------------ contract */

/**
 * Where a row came from.
 *
 * `synthetic/internal-review` still exists in the type because the review fixture (test-only, see
 * `flagshipReviewFixture.ts`) produces rows the explorer and Stats Lab engines must still be able to describe.
 * **No code path that a route can reach produces one** — `publishedHistory` emits `productionFeed` and nothing
 * else, and a test asserts the default page model contains no other value.
 */
export type DrawProvenance = "productionFeed" | "synthetic/internal-review";

/** One drawing, with everything the explorer, the checker and the statistics need precomputed. */
export interface FlagshipDrawRow {
  drawDateIso: string;
  /** `Mon` … `Sun`, computed from the date. Drives the draw-day pattern analysis. */
  drawDay: string;
  main: readonly number[];
  special: number | null;
  /** The drawn multiplier, only where the game draws one. Never synthesised. */
  multiplier: number | null;
  /** A secondary drawing's own numbers, where the game has one. Never synthesised. */
  secondary: { main: readonly number[]; special: number | null } | null;
  /** The advertised jackpot. Present ONLY on a production row — never generated. */
  jackpotDisplay: string | null;
  provenance: DrawProvenance;

  /* -- precomputed shape, so the explorer filters and the statistics never recompute per keystroke -- */
  sum: number;
  oddCount: number;
  lowCount: number;
  /** Length of the longest run of consecutive values, `0` when there is none. */
  longestRun: number;
  /** Values also present in the immediately preceding drawing in this series. */
  repeatsFromPrevious: readonly number[];
}

export interface FlagshipHistory {
  rows: readonly FlagshipDrawRow[];
  /** How many rows came from the feed versus the review set. Rendered as one provenance disclosure. */
  provenance: { productionFeed: number; synthetic: number; total: number };
  /** The rule era the whole series sits inside. No row crosses it. */
  eraLabel: string;
  eraEffectiveFrom: string | null;
  /** Oldest and newest dates actually generated. */
  fromIso: string | null;
  toIso: string | null;
}

export const EMPTY_HISTORY: FlagshipHistory = Object.freeze({
  rows: [],
  provenance: { productionFeed: 0, synthetic: 0, total: 0 },
  eraLabel: "",
  eraEffectiveFrom: null,
  fromIso: null,
  toIso: null,
});

/**
 * The one sentence the page states about its drawing coverage.
 *
 * FGP-009: a payload may now mix one real published drawing with preview history behind it, so the sentence has
 * to say which is which. It never claims a generated drawing is published, and it never hides that the archive is
 * preview data — the page-level banner says the same thing again, more prominently.
 */
export function historyDisclosure(h: FlagshipHistory, gameLabel: string): string {
  if (h.rows.length === 0) {
    return `No published ${gameLabel} drawing is connected to this build yet.`;
  }
  if (h.provenance.synthetic > 0) {
    return (
      `${h.rows.length} ${gameLabel} drawings from ${h.fromIso} to ${h.toIso}, all inside the current rule era. ` +
      `The most recent one is the real published result; the other ${h.provenance.synthetic} are preview ` +
      `drawings used for layout and tool testing, and describe nothing that happened.`
    );
  }
  if (h.rows.length === 1) {
    return (
      `One published ${gameLabel} drawing is connected: the drawing on ${h.toIso}, from the production results ` +
      `feed. The drawing archive is not connected yet, so anything that needs a run of drawings says so rather ` +
      `than estimating it.`
    );
  }
  return (
    `${h.rows.length} published ${gameLabel} drawings from ${h.fromIso} to ${h.toIso}, all from the production ` +
    `results feed and all inside the current rule era.`
  );
}



/* ------------------------------------------------------------------ dates, without `Date` arithmetic */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function daysInMonth(year: number, month: number): number {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
}

function dateIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** One calendar day earlier. Pure integer arithmetic — no timezone can shift a draw date across a boundary. */
function previousDay(iso: string): string {
  let [y, m, d] = iso.split("-").map(Number);
  d -= 1;
  if (d < 1) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    d = daysInMonth(y, m);
  }
  return dateIso(y, m, d);
}

/**
 * The weekday of an ISO date, by Sakamoto's algorithm.
 *
 * Deliberately not `new Date(iso).getDay()`: that parses as UTC and renders in the runtime's zone, which is the
 * off-by-one class of bug `CLAUDE.md` §14 names. This is pure arithmetic on the date parts and has no zone.
 */
export function weekdayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const yy = m < 3 ? y - 1 : y;
  const index = (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7;
  return DAY_NAMES[index];
}

/**
 * The game's draw nights, as weekday abbreviations, parsed from its configured schedule.
 *
 * Read from `drawDays` — the operator-verified string — rather than hardcoded, so Powerball's three nights and
 * Mega Millions' two come from the same place the page displays them and cannot drift apart.
 */
export function drawNightsOf(config: FlagshipGameConfig): string[] {
  const text = config.drawDays.value.toLowerCase();
  const map: Record<string, string> = {
    monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
    friday: "Fri", saturday: "Sat", sunday: "Sun",
  };
  return Object.entries(map)
    .filter(([long]) => text.includes(long))
    .map(([, short]) => short);
}

/* ------------------------------------------------------------------ shape */

export function shapeOf(main: readonly number[], mainPool: number) {
  const sorted = [...main].sort((a, b) => a - b);
  const boundary = Math.floor(mainPool / 2);
  let longestRun = 0;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run += 1;
      longestRun = Math.max(longestRun, run);
    } else {
      run = 1;
    }
  }
  return {
    sum: sorted.reduce((a, b) => a + b, 0),
    oddCount: sorted.filter((v) => v % 2 === 1).length,
    lowCount: sorted.filter((v) => v <= boundary).length,
    longestRun: longestRun >= 2 ? longestRun : 0,
  };
}

/** Draw `count` distinct values in `[1, pool]` from a seeded stream. */
function distinct(rand: () => number, count: number, pool: number): number[] {
  const chosen = new Set<number>();
  while (chosen.size < count) chosen.add(1 + Math.floor(rand() * pool));
  return [...chosen].sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ published series */

/** A drawing's identity, for de-duplicating the same national event across jurisdiction records. */
function signature(e: StateDrawEvent): string {
  const special = e.specialBalls.map((s) => `${s.label}:${s.values.join(",")}`).join("|");
  return `${e.resultDate}#${e.mainNumbers.join(",")}#${special}`;
}

/**
 * Every PUBLISHED drawing this build holds for a game, newest first.
 *
 * Reads every jurisdiction that carries the game and de-duplicates by drawn identity, because the feed stores one
 * national drawing once per jurisdiction. A record with a date but no numbers — California's Mega Millions block
 * is one — is skipped rather than counted as a drawing that produced nothing.
 *
 * The richest record for a given drawing wins, so Powerball keeps its Power Play value and its Double Play
 * sub-result even though some jurisdictions omit them.
 */
export function publishedHistory(config: FlagshipGameConfig): FlagshipHistory {
  const mainSpec = config.groups.find((g) => g.role === "main");
  if (!mainSpec) return EMPTY_HISTORY;

  const completeness = (e: StateDrawEvent): number =>
    (e.multiplier ? 4 : 0) + (e.secondaryDraw ? 4 : 0) + (e.topPrizeDisplay ? 2 : 0) + (e.nextPrizeDisplay ? 1 : 0);

  const best = new Map<string, StateDrawEvent>();
  for (const code of statesWithDrawEvents()) {
    for (const e of drawEventsFor(code)) {
      if (e.gameId !== config.gameId) continue;
      if (!e.resultDate || e.mainNumbers.length === 0) continue;
      const key = signature(e);
      const held = best.get(key);
      if (!held || completeness(e) > completeness(held)) best.set(key, e);
    }
  }

  const era = config.ruleEras.find((r) => r.effectiveTo === null) ?? config.ruleEras[0];
  const eraFrom = era?.effectiveFrom ?? null;

  const rows: FlagshipDrawRow[] = [...best.values()]
    /* No drawing from before the current matrix — a statistic must never silently mix two eras. */
    .filter((e) => !eraFrom || (e.resultDate as string) >= eraFrom)
    .sort((a, b) => (b.resultDate as string).localeCompare(a.resultDate as string))
    .map((e) => ({
      drawDateIso: e.resultDate as string,
      drawDay: weekdayOf(e.resultDate as string),
      main: [...e.mainNumbers].sort((x, y) => x - y),
      special: e.specialBalls[0]?.values[0] ?? null,
      /* Only where the game's own rules say a multiplier is DRAWN — Mega Millions' is per-ticket. */
      multiplier: config.multiplier.drawnWithResult ? (e.multiplier?.value ?? null) : null,
      secondary:
        config.secondaryDraw && e.secondaryDraw
          ? {
              main: [...e.secondaryDraw.mainNumbers].sort((x, y) => x - y),
              special: e.secondaryDraw.specialBalls[0]?.values[0] ?? null,
            }
          : null,
      jackpotDisplay: e.topPrizeDisplay,
      provenance: "productionFeed" as const,
      ...shapeOf(e.mainNumbers, mainSpec.max),
      repeatsFromPrevious: [] as readonly number[],
    }));

  /* Repeats need the drawing before, so they are computed once the whole series exists. With a single published
     drawing there is no "before", and the field stays empty rather than claiming zero carry-overs. */
  for (let i = 0; i < rows.length - 1; i++) {
    const prev = new Set(rows[i + 1].main);
    rows[i] = { ...rows[i], repeatsFromPrevious: rows[i].main.filter((v) => prev.has(v)) };
  }

  if (rows.length === 0) return EMPTY_HISTORY;

  return {
    rows,
    provenance: { productionFeed: rows.length, synthetic: 0, total: rows.length },
    eraLabel: era?.label ?? "not recorded",
    eraEffectiveFrom: eraFrom,
    fromIso: rows[rows.length - 1].drawDateIso,
    toIso: rows[0].drawDateIso,
  };
}

/* ------------------------------------------------------------------ from the BFF */

/**
 * Turn a BFF drawing series into the row shape the explorer, checker and Stats Lab already consume.
 *
 * FGP-009: the page's history now comes from `getFlagshipGamePageData`, not from the feed directly. This is the
 * one place that translation happens, so the engines are unchanged and stay agnostic about whether their rows
 * arrived from the production feed, the preview payload or a future API.
 *
 * `provenance` is carried through per row rather than assumed for the series, because a single payload legitimately
 * mixes one real published drawing with generated history behind it.
 */
export function historyFromBff(
  config: FlagshipGameConfig,
  draws: readonly {
    drawDateIso: string;
    main: readonly number[];
    special: number | null;
    multiplier: number | null;
    secondary: { main: readonly number[]; special: number | null } | null;
    jackpotDisplay: string | null;
    source: "productionFeed" | "mock";
  }[],
): FlagshipHistory {
  const mainSpec = config.groups.find((g) => g.role === "main");
  if (!mainSpec || draws.length === 0) return EMPTY_HISTORY;

  const era = config.ruleEras.find((r) => r.effectiveTo === null) ?? config.ruleEras[0];

  const rows: FlagshipDrawRow[] = draws.map((d) => ({
    drawDateIso: d.drawDateIso,
    drawDay: weekdayOf(d.drawDateIso),
    main: [...d.main].sort((a, b) => a - b),
    special: d.special,
    /* Never attach a drawn multiplier to a game whose multiplier is per-ticket, whatever the payload says. */
    multiplier: config.multiplier.drawnWithResult ? d.multiplier : null,
    secondary: config.secondaryDraw && d.secondary
      ? { main: [...d.secondary.main].sort((a, b) => a - b), special: d.secondary.special }
      : null,
    jackpotDisplay: d.jackpotDisplay,
    provenance: d.source === "productionFeed" ? "productionFeed" : "synthetic/internal-review",
    ...shapeOf(d.main, mainSpec.max),
    repeatsFromPrevious: [] as readonly number[],
  }));

  for (let i = 0; i < rows.length - 1; i++) {
    const prev = new Set(rows[i + 1].main);
    rows[i] = { ...rows[i], repeatsFromPrevious: rows[i].main.filter((v) => prev.has(v)) };
  }

  const synthetic = rows.filter((r) => r.provenance !== "productionFeed").length;
  return {
    rows,
    provenance: { productionFeed: rows.length - synthetic, synthetic, total: rows.length },
    eraLabel: era?.label ?? "not recorded",
    eraEffectiveFrom: era?.effectiveFrom ?? null,
    fromIso: rows[rows.length - 1].drawDateIso,
    toIso: rows[0].drawDateIso,
  };
}
