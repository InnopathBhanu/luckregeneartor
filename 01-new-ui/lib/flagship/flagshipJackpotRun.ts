/*
 * THE JACKPOT RUN — FGP-009, section FG-09.
 *
 * Authority: BP-04A §23 (Jackpot History), the founder instruction for this task (*"jackpot trend/history"*),
 * BP-05C §19 (a statistical result states its method), the frozen Constitution (language must not imply that
 * history bears on a future drawing).
 *
 * ══ WHAT A RUN IS ══
 *
 * A jackpot climbs from drawing to drawing until somebody takes it, then resets. Everything a reader asks about
 * a jackpot — how long it has been rolling, how fast it is climbing, whether this run is unusual — is a question
 * about the CURRENT run and how it compares with completed ones. So the series is segmented into runs first, and
 * every figure below is derived from that segmentation rather than from the raw list.
 *
 * ══ WHY THIS IS COMPUTED HERE AND NOT SHIPPED IN THE PAYLOAD ══
 *
 * The payload carries advertised amounts and a `wonAtThisDraw` flag — observations. Run length, growth per
 * drawing and rank against past runs are arithmetic over those observations. Computing them here means the same
 * arithmetic applies unchanged when a real jackpot series replaces the preview one, and a backend cannot ship a
 * roll count that disagrees with its own amounts.
 *
 * ══ THE ONE THING THIS DELIBERATELY WILL NOT SAY ══
 *
 * No projection. Not "on this trend it reaches X", not "due to be won". Growth is reported as what has already
 * happened, past tense, and the boundary sentence travels with it. A jackpot's next advertised figure is set by
 * the operator from ticket sales, and a run's length says nothing about when it ends.
 */

import type { BffJackpotPoint } from "./bff/flagshipBffContract";

/** One completed or in-progress run of the jackpot. */
export interface JackpotRunSegment {
  /** The drawing the run started at — the first after a reset. */
  startIso: string;
  /** The last drawing in the run. For the current run, the most recent drawing held. */
  endIso: string;
  /** How many drawings the run covers, inclusive. */
  drawings: number;
  startAdvertised: number;
  endAdvertised: number;
  /** True when the run ended because the top prize was taken. `false` for the run still going. */
  completed: boolean;
}

/** One plotted point, normalised for the trend chart. */
export interface JackpotRunPoint {
  drawDateIso: string;
  advertised: number;
  advertisedDisplay: string;
  /** Height as a fraction of the run's peak, 0–1. Presentation-ready so no component does arithmetic. */
  height: number;
}

export interface FlagshipJackpotRun {
  /** The run in progress, newest drawing last. */
  points: readonly JackpotRunPoint[];
  drawings: number;
  startIso: string;
  startDisplay: string;
  currentDisplay: string;
  /** Average rise per drawing across the current run. `null` for a run of one, where there is no rise yet. */
  growthPerDrawDisplay: string | null;
  totalGrowthDisplay: string | null;
  /** The largest advertised figure anywhere in the series held. */
  peakDisplay: string;
  peakIso: string;
  /** How many completed runs the series holds, for the comparison sentence. */
  completedRuns: number;
  /** Median length of the completed runs, in drawings. `null` when none has completed. */
  medianRunLength: number | null;
  /** The methodology sentence rendered beneath the trend. */
  method: string;
  /** True when any point in the current run is preview data. Drives the section's own labelling. */
  hasPreviewPoints: boolean;
}

const money = (n: number): string => `$${Math.round(n).toLocaleString("en-US")}`;

/**
 * Split the series into runs.
 *
 * Input is newest-first, as the contract specifies. `wonAtThisDraw` marks a drawing at which the top prize went,
 * so the run BOUNDARY sits between that drawing and the one after it in time.
 */
function segments(series: readonly BffJackpotPoint[]): JackpotRunSegment[] {
  if (series.length === 0) return [];
  /* Work oldest-first: a run is a forward-moving thing and reads correctly in that direction. */
  const asc = [...series].reverse();
  const out: JackpotRunSegment[] = [];
  let start = 0;

  for (let i = 0; i < asc.length; i++) {
    if (asc[i].wonAtThisDraw || i === asc.length - 1) {
      out.push({
        startIso: asc[start].drawDateIso,
        endIso: asc[i].drawDateIso,
        drawings: i - start + 1,
        startAdvertised: asc[start].advertised,
        endAdvertised: asc[i].advertised,
        completed: asc[i].wonAtThisDraw,
      });
      start = i + 1;
    }
  }
  return out;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * The current jackpot run, plus how it sits against the completed ones.
 *
 * `null` when the series is empty or carries a single point — one advertised figure is not a run, and the section
 * falls back to the two-point movement statement it has always had.
 */
export function jackpotRun(series: readonly BffJackpotPoint[], gameLabel: string): FlagshipJackpotRun | null {
  if (series.length < 2) return null;

  const runs = segments(series);
  const current = runs[runs.length - 1];
  if (!current || current.drawings < 2) return null;

  /* The current run's points, oldest first, so the chart reads left to right the way a climb does. */
  const asc = [...series].reverse();
  const startIndex = asc.findIndex((p) => p.drawDateIso === current.startIso);
  const runPoints = asc.slice(startIndex);
  const peakOfRun = Math.max(...runPoints.map((p) => p.advertised));

  const points: JackpotRunPoint[] = runPoints.map((p) => ({
    drawDateIso: p.drawDateIso,
    advertised: p.advertised,
    advertisedDisplay: money(p.advertised),
    /* Guarded against a zero peak, which would produce NaN heights and an invisible chart. */
    height: peakOfRun > 0 ? p.advertised / peakOfRun : 0,
  }));

  const totalGrowth = current.endAdvertised - current.startAdvertised;
  const steps = current.drawings - 1;

  const peakPoint = series.reduce((best, p) => (p.advertised > best.advertised ? p : best), series[0]);
  const completed = runs.filter((r) => r.completed);

  const previewPoints = runPoints.filter((p) => p.source !== "productionFeed").length;

  const method =
    `Counted from the ${series.length} advertised ${gameLabel} jackpot figures held for this page, from ` +
    `${asc[0].drawDateIso} to ${asc[asc.length - 1].drawDateIso}. A run is the drawings between one top-prize ` +
    `win and the next, and growth is the difference between advertised amounts — it describes what has already ` +
    `been advertised and does not forecast the next figure, which the operator sets from ticket sales.`;

  return {
    points,
    drawings: current.drawings,
    startIso: current.startIso,
    startDisplay: money(current.startAdvertised),
    currentDisplay: money(current.endAdvertised),
    growthPerDrawDisplay: steps > 0 && totalGrowth > 0 ? money(totalGrowth / steps) : null,
    totalGrowthDisplay: totalGrowth > 0 ? money(totalGrowth) : null,
    peakDisplay: money(peakPoint.advertised),
    peakIso: peakPoint.drawDateIso,
    completedRuns: completed.length,
    medianRunLength: median(completed.map((r) => r.drawings)),
    method,
    hasPreviewPoints: previewPoints > 0,
  };
}
