/*
 * Historical draw analysis — PREVIEW ONLY, fully local, deterministic.
 *
 * Authority: LRG-UI-012 §4 (featured-card analysis), §5 (windows), §6 (modal content), §7 (wording),
 * §18 (historical-data boundary). Data inventory:
 * 03-docs/04-page-specifications/home-preview/home-preview-historical-data-inventory.md
 *
 * WHAT THIS IS
 *   Pure arithmetic over draws that already exist in the repository. Every number this module emits
 *   is computed here and now from the draws it is handed.
 *
 * WHAT THIS IS NOT
 *   - No external service, no API, no model call, no network access of any kind.
 *   - No prediction, no likelihood, no "due" or "overdue" number, no strategy, no best numbers.
 *     Frequency is always described as frequency WITHIN A STATED SAMPLE, which is a historical
 *     observation, never a statement about the next draw. Constitution §15 forbids implying that
 *     history changes the odds of a fair independent draw, and every label here respects that.
 *
 * THE CENTRAL CONSTRAINT (§18): the repository contains ONE draw per game. Every cross-draw metric is
 * implemented and correct, and every one is gated on sample size. Nothing is invented to fill a gap;
 * an unavailable metric reports what it needs. When a real archive is supplied to `analyseDraw`, the
 * gates open with no code change.
 */

import type { ResultCard } from "../data-provider/types";
import { getResultFormat } from "../data-provider";

/* ------------------------------------------------------------------ inputs */

/**
 * One historical draw, normalised.
 *
 * `gameLocalDate` is the game-local ISO date, never a shifted one (CLAUDE.md §14).
 */
export interface HistoricalDraw {
  gameLocalDate: string;
  /** Main ball group, in the order the game drew them. Never re-sorted in place. */
  main: number[];
  /** The named special ball value, when the game has one. */
  special: number | null;
}

/** The valid number space for a game, and the date from which those rules apply. */
export interface GameRange {
  mainCount: number;
  mainMin: number;
  mainMax: number;
  specialLabel: string | null;
  specialMin: number | null;
  specialMax: number | null;
  /** Draws before this date used different ranges and are EXCLUDED, not silently mixed in. */
  effectiveFrom: string | null;
}

export type AnalysisWindow = 20 | 50 | 100 | "all";

/* ----------------------------------------------------------------- outputs */

/** A single computed observation. `value` is always derived, never authored. */
export interface Observation {
  key: string;
  /** Short, descriptive, no prediction language. */
  text: string;
  /** Icon hint for the renderer. */
  icon: "composition" | "frequency" | "history" | "pattern" | "compare";
}

/** A metric that could not be computed, and precisely what it needs. */
export interface UnavailableMetric {
  key: string;
  label: string;
  drawsNeeded: number;
}

export interface Composition {
  odd: number;
  even: number;
  low: number;
  high: number;
  /** Midpoint of the game's valid range, so "high/low" is defined rather than assumed. */
  midpoint: number;
  consecutiveRuns: number[][];
  sum: number;
  span: number;
  /** Minimum and maximum sums achievable in this game's range — arithmetic, not history. */
  minPossibleSum: number;
  maxPossibleSum: number;
}

export interface FrequencyEntry {
  value: number;
  count: number;
  inCurrentDraw: boolean;
}

export interface RepeatAnalysis {
  repeatedFromPrevious: number[] | null;
  seenInLastFive: number[] | null;
  specialLastSeen: { draw: number; dateDisplay: string } | null;
  specialNeverSeenInSample: boolean;
}

export interface PatternAnalysis {
  commonPairs: { pair: [number, number]; count: number; inCurrentDraw: boolean }[];
  commonTriplets: { triplet: [number, number, number]; count: number }[];
  similarStructureCount: number | null;
  /** Only ever set when EVERY main number and the special ball genuinely match. */
  exactPriorMatch: { dateDisplay: string } | null;
  exactMatchSearched: boolean;
}

export interface DrawAnalysis {
  gameSlug: string;
  gameName: string;
  drawDateDisplay: string;
  /** Draws actually used, after deduplication and effective-date filtering. */
  sampleSize: number;
  window: AnalysisWindow;
  /** The visible basis line. Never omitted. */
  basisText: string;
  range: GameRange;
  composition: Composition;
  /** The two or three compact observations for the featured card. */
  headlineObservations: Observation[];
  frequency: { more: FrequencyEntry[]; less: FrequencyEntry[] } | null;
  repeats: RepeatAnalysis;
  patterns: PatternAnalysis;
  unavailable: UnavailableMetric[];
  /** True when nothing beyond intra-draw composition could be computed. */
  historyInsufficient: boolean;
}

/* ------------------------------------------------------------ range lookup */

/**
 * Read the valid number space from the production-derived format definition.
 *
 * The range is what makes a high/low split meaningful — without it, "upper half" is a guess. Both
 * `result-format-definitions.json` and `game.csv` record the same ranges (5/69+1/26, 5/70+1/24,
 * 5/52+1/10); this reads the former because it also carries the effective dates.
 */
export function gameRange(card: ResultCard): GameRange | null {
  const fmt = getResultFormat(card.formatRef?.gameId ?? card.gameId);
  if (!fmt) return null;
  const main = fmt.ballGroups?.find((g) => g.ballType === "MAIN") ?? fmt.ballGroups?.[0];
  if (!main || typeof main.min !== "number" || typeof main.max !== "number") return null;
  const sp = fmt.specialBalls?.[0];
  return {
    mainCount: main.count ?? main.max,
    mainMin: main.min,
    mainMax: main.max,
    specialLabel: sp?.label ?? null,
    specialMin: typeof sp?.min === "number" ? sp.min : null,
    specialMax: typeof sp?.max === "number" ? sp.max : null,
    effectiveFrom: fmt.effectiveFrom ?? null,
  };
}

/**
 * Pull the main group and named special ball out of a result card.
 *
 * Ball values are typed `(string | number)[]` because CARD GAMES draw face values, not numbers. Every
 * metric here is arithmetic, so a non-numeric draw is not analysable and returns null rather than
 * being coerced into meaningless numbers. That is why `getResultFormat().isCardGame` exists — a card
 * game gets no draw analysis at all instead of a nonsense one.
 */
export function drawFromCard(card: ResultCard): HistoricalDraw | null {
  const groups = card.groupsDrawn ?? [];
  if (groups.length === 0) return null;

  const raw = groups[0]?.values ?? [];
  if (raw.length === 0) return null;
  const main = raw.map((v) => (typeof v === "number" ? v : Number(v)));
  if (main.some((n) => !Number.isFinite(n))) return null;

  const specialGroup = groups.find((g, i) => i > 0 && (g.values?.length ?? 0) > 0);
  const rawSpecial = specialGroup?.values?.[0];
  const special =
    rawSpecial === undefined || rawSpecial === null
      ? null
      : typeof rawSpecial === "number"
        ? rawSpecial
        : Number.isFinite(Number(rawSpecial))
          ? Number(rawSpecial)
          : null;

  return {
    gameLocalDate: card.resultDate?.gameLocalDate ?? "",
    main,
    special,
  };
}

/* ------------------------------------------------------- sample preparation */

/**
 * Deduplicate and filter a raw draw list.
 *
 * DEDUPLICATION IS NOT OPTIONAL. The production feed repeats every multi-state game once per state —
 * Powerball appears in 49 blocks for a single drawing. Consuming that as 49 draws would produce
 * frequency output that is confidently wrong. Draws are keyed on `(date, numbers)`.
 *
 * EFFECTIVE-DATE FILTERING is applied for the same reason: a draw from before the game's current
 * number range must not be pooled with draws under the current one (§18).
 */
export function prepareSample(draws: HistoricalDraw[], range: GameRange): HistoricalDraw[] {
  const seen = new Set<string>();
  const out: HistoricalDraw[] = [];
  for (const d of draws) {
    if (!d.main.length) continue;
    if (range.effectiveFrom && d.gameLocalDate && d.gameLocalDate < range.effectiveFrom) continue;
    const key = `${d.gameLocalDate}|${[...d.main].sort((a, b) => a - b).join("-")}|${d.special ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  /* Newest first, so "previous draw" and "last five" mean what they say. */
  return out.sort((a, b) => (a.gameLocalDate < b.gameLocalDate ? 1 : a.gameLocalDate > b.gameLocalDate ? -1 : 0));
}

/**
 * Choose the window (§5): 50 when at least 50 valid draws exist, otherwise the full history.
 */
export function chooseWindow(sampleSize: number, requested?: AnalysisWindow): AnalysisWindow {
  if (requested) return requested;
  return sampleSize >= 50 ? 50 : "all";
}

function windowSize(window: AnalysisWindow, sampleSize: number): number {
  return window === "all" ? sampleSize : Math.min(window, sampleSize);
}

/* -------------------------------------------------------------- primitives */

function composition(main: number[], range: GameRange): Composition {
  const sorted = [...main].sort((a, b) => a - b);
  const odd = main.filter((n) => n % 2 === 1).length;
  /* The midpoint is derived from the game's own range, so "upper half" is defined, not assumed. */
  const midpoint = (range.mainMin + range.mainMax) / 2;
  const high = main.filter((n) => n > midpoint).length;

  const runs: number[][] = [];
  let run: number[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === sorted[i - 1] + 1) run.push(sorted[i]);
    else {
      if (run.length > 1) runs.push(run);
      run = [sorted[i]];
    }
  }
  if (run.length > 1) runs.push(run);

  const n = main.length;
  /* Smallest and largest sums achievable with n distinct numbers in [min, max]. Arithmetic only. */
  let minPossibleSum = 0;
  let maxPossibleSum = 0;
  for (let i = 0; i < n; i += 1) {
    minPossibleSum += range.mainMin + i;
    maxPossibleSum += range.mainMax - i;
  }

  return {
    odd,
    even: n - odd,
    low: n - high,
    high,
    midpoint,
    consecutiveRuns: runs,
    sum: main.reduce((a, b) => a + b, 0),
    span: sorted[sorted.length - 1] - sorted[0],
    minPossibleSum,
    maxPossibleSum,
  };
}

function frequency(sample: HistoricalDraw[], current: number[], range: GameRange) {
  const counts = new Map<number, number>();
  for (let v = range.mainMin; v <= range.mainMax; v += 1) counts.set(v, 0);
  for (const d of sample) for (const v of d.main) counts.set(v, (counts.get(v) ?? 0) + 1);
  const all = [...counts.entries()]
    .map(([value, count]) => ({ value, count, inCurrentDraw: current.includes(value) }))
    /* Ties break by value so output is deterministic across renders. */
    .sort((a, b) => b.count - a.count || a.value - b.value);
  return { more: all.slice(0, 6), less: [...all].reverse().slice(0, 6) };
}

function pairKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function patterns(
  sample: HistoricalDraw[],
  current: HistoricalDraw,
  currentComp: Composition,
  range: GameRange,
): PatternAnalysis {
  /* Historical draws only — the current draw is excluded so it cannot inflate its own counts. */
  const history = sample.filter((d) => d.gameLocalDate !== current.gameLocalDate);

  const pairCounts = new Map<string, number>();
  const tripletCounts = new Map<string, number>();
  for (const d of history) {
    const s = [...d.main].sort((a, b) => a - b);
    for (let i = 0; i < s.length; i += 1) {
      for (let j = i + 1; j < s.length; j += 1) {
        const k = pairKey(s[i], s[j]);
        pairCounts.set(k, (pairCounts.get(k) ?? 0) + 1);
        for (let m = j + 1; m < s.length; m += 1) {
          const t = `${s[i]}-${s[j]}-${s[m]}`;
          tripletCounts.set(t, (tripletCounts.get(t) ?? 0) + 1);
        }
      }
    }
  }

  const currentPairs = new Set<string>();
  const cs = [...current.main].sort((a, b) => a - b);
  for (let i = 0; i < cs.length; i += 1)
    for (let j = i + 1; j < cs.length; j += 1) currentPairs.add(pairKey(cs[i], cs[j]));

  const commonPairs = [...pairCounts.entries()]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([k, count]) => {
      const [a, b] = k.split("-").map(Number);
      return { pair: [a, b] as [number, number], count, inCurrentDraw: currentPairs.has(k) };
    });

  const commonTriplets = [...tripletCounts.entries()]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([k, count]) => {
      const [a, b, c] = k.split("-").map(Number);
      return { triplet: [a, b, c] as [number, number, number], count };
    });

  /*
   * "Similar structure" is defined EXACTLY (§ acceptance criterion 9): a historical draw whose
   * odd/even split AND high/low split both equal the current draw's. It is not a fuzzy resemblance
   * and it is not a likelihood statement.
   */
  const similarStructureCount = history.length
    ? history.filter((d) => {
        const c = composition(d.main, range);
        return c.odd === currentComp.odd && c.high === currentComp.high;
      }).length
    : null;

  /*
   * EXACT match means exact: every main number and the special ball. Anything less is not reported
   * as a prior occurrence, because "the same result happened earlier" is a strong factual claim.
   */
  const curSorted = [...current.main].sort((a, b) => a - b).join(",");
  const exact = history.find(
    (d) => [...d.main].sort((a, b) => a - b).join(",") === curSorted && d.special === current.special,
  );

  return {
    commonPairs,
    commonTriplets,
    similarStructureCount,
    exactPriorMatch: exact ? { dateDisplay: exact.gameLocalDate } : null,
    exactMatchSearched: history.length > 0,
  };
}

/* --------------------------------------------------------------- main entry */

/** Minimum sample sizes below which a metric is not worth showing, let alone claiming. */
const NEEDS = {
  previousDraw: 2,
  lastFive: 2,
  specialLastSeen: 2,
  frequency: 10,
  absentWindow: 10,
  pairs: 20,
  structure: 20,
  exactMatch: 2,
} as const;

export function analyseDraw(
  card: ResultCard,
  archive: HistoricalDraw[],
  requestedWindow?: AnalysisWindow,
): DrawAnalysis | null {
  const range = gameRange(card);
  const current = drawFromCard(card);
  if (!range || !current) return null;

  /* The current draw is part of its own sample; prepareSample dedupes if the archive repeats it. */
  const prepared = prepareSample([current, ...archive], range);
  const window = chooseWindow(prepared.length, requestedWindow);
  const size = windowSize(window, prepared.length);
  const sample = prepared.slice(0, size);
  const history = sample.filter((d) => d.gameLocalDate !== current.gameLocalDate);

  const comp = composition(current.main, range);

  /* -------- cross-draw metrics, each gated on what it actually needs -------- */
  const unavailable: UnavailableMetric[] = [];
  const need = (key: string, label: string, drawsNeeded: number) =>
    unavailable.push({ key, label, drawsNeeded });

  const previous = history[0] ?? null;
  const repeatedFromPrevious = previous
    ? current.main.filter((n) => previous.main.includes(n))
    : null;
  if (!previous) need("previousDraw", "Numbers repeated from the previous draw", NEEDS.previousDraw);

  const lastFive = history.slice(0, 5);
  const seenInLastFive = lastFive.length
    ? current.main.filter((n) => lastFive.some((d) => d.main.includes(n)))
    : null;
  if (!lastFive.length) need("lastFive", "Numbers seen in the last five draws", NEEDS.lastFive);

  let specialLastSeen: RepeatAnalysis["specialLastSeen"] = null;
  let specialNeverSeenInSample = false;
  if (history.length && current.special !== null) {
    const idx = history.findIndex((d) => d.special === current.special);
    if (idx >= 0) {
      specialLastSeen = { draw: idx + 1, dateDisplay: history[idx].gameLocalDate };
    } else {
      specialNeverSeenInSample = true;
    }
  } else if (current.special !== null) {
    need("specialLastSeen", `When ${range.specialLabel ?? "the special ball"} last appeared`, NEEDS.specialLastSeen);
  }

  const freq = sample.length >= NEEDS.frequency ? frequency(sample, current.main, range) : null;
  if (!freq) {
    need("frequency", "Most and least frequent numbers in the sample", NEEDS.frequency);
    need("absentWindow", "Numbers absent from the recent window", NEEDS.absentWindow);
  }

  const pat = patterns(sample, current, comp, range);
  if (history.length < NEEDS.pairs) {
    need("pairs", "Commonly occurring number pairs and triplets", NEEDS.pairs);
  }
  if (history.length < NEEDS.structure) {
    need("structure", "How often this odd/even and high/low structure occurred", NEEDS.structure);
  }
  if (!pat.exactMatchSearched) {
    need("exactMatch", "Search for an exact prior match", NEEDS.exactMatch);
  }

  /* ------------------------------ headline observations ------------------------------
   * Two or three compact, USEFUL observations for the featured card. Ordered so the most
   * informative available metric leads. Every one is computed; none repeats the jackpot, the date or
   * the numbers, which are already visible directly above.
   */
  const headline: Observation[] = [];

  if (repeatedFromPrevious) {
    const n = repeatedFromPrevious.length;
    headline.push({
      key: "repeat",
      icon: "history",
      text:
        n === 0
          ? "No numbers carried over from the previous draw"
          : `${n} number${n === 1 ? "" : "s"} also appeared in the previous draw`,
    });
  }
  if (pat.similarStructureCount !== null && history.length >= NEEDS.structure) {
    headline.push({
      key: "structure",
      icon: "pattern",
      text: `This odd/even and high/low structure appeared in ${pat.similarStructureCount} of the last ${history.length} draws`,
    });
  }
  headline.push({
    key: "highlow",
    icon: "composition",
    text: `${comp.high} of ${current.main.length} numbers are in the upper half of ${range.mainMin}–${range.mainMax}`,
  });
  if (headline.length < 3) {
    headline.push({
      key: "oddeven",
      icon: "composition",
      text: `${comp.odd} odd and ${comp.even} even`,
    });
  }
  if (headline.length < 3 && comp.consecutiveRuns.length > 0) {
    headline.push({
      key: "consecutive",
      icon: "pattern",
      text: `Includes consecutive numbers ${comp.consecutiveRuns.map((r) => r.join(" and ")).join(", ")}`,
    });
  }
  if (headline.length < 3) {
    headline.push({
      key: "sum",
      icon: "composition",
      text: `The five numbers total ${comp.sum}, within a possible ${comp.minPossibleSum}–${comp.maxPossibleSum}`,
    });
  }

  const basisText =
    sample.length === 1
      ? "Based on the 1 available draw"
      : window === "all"
        ? `Based on all ${sample.length} available draws`
        : `Based on the latest ${sample.length} available draws`;

  return {
    gameSlug: card.gameSlug,
    gameName: card.displayName,
    drawDateDisplay: card.resultDate?.display ?? current.gameLocalDate,
    sampleSize: sample.length,
    window,
    basisText,
    range,
    composition: comp,
    headlineObservations: headline.slice(0, 3),
    frequency: freq,
    repeats: { repeatedFromPrevious, seenInLastFive, specialLastSeen, specialNeverSeenInSample },
    patterns: pat,
    unavailable,
    historyInsufficient: history.length === 0,
  };
}

/* ------------------------------------------------------------- comparison */

export interface GameComparison {
  games: {
    gameSlug: string;
    gameName: string;
    rangeText: string;
    sampleSize: number;
    oddEvenText: string;
    sum: number;
    /** Sum expressed as a position in the game's own possible range, so games ARE comparable. */
    normalisedSumPercent: number;
    repeatRate: number | null;
  }[];
  /** Stated plainly: why raw sums are not compared directly. */
  normalisationNote: string;
  unavailable: UnavailableMetric[];
}

/**
 * Local comparison between games (§6 Compare).
 *
 * Raw sums are NOT compared. Powerball draws from 1–69, Mega Millions from 1–70 and Lotto America
 * from 1–52, so a raw sum means something different in each. Each sum is normalised to its position
 * within that game's own achievable range before any comparison is drawn.
 */
export function compareGames(analyses: DrawAnalysis[]): GameComparison {
  const unavailable: UnavailableMetric[] = [];
  const games = analyses.map((a) => {
    const spread = a.composition.maxPossibleSum - a.composition.minPossibleSum;
    const normalised =
      spread > 0
        ? Math.round(((a.composition.sum - a.composition.minPossibleSum) / spread) * 100)
        : 0;
    /* Repeat rate = repeated numbers / main numbers drawn. Null when there is no previous draw to
       compare against — never 0, because "no data" and "no repeats" are different facts. */
    const mainCount = a.composition.odd + a.composition.even;
    const repeated = a.repeats.repeatedFromPrevious;
    const repeatRate =
      repeated !== null && mainCount > 0 ? repeated.length / mainCount : null;
    if (repeatRate === null) {
      unavailable.push({
        key: `repeatRate:${a.gameSlug}`,
        label: `Repeat rate for ${a.gameName}`,
        drawsNeeded: NEEDS.previousDraw,
      });
    }
    return {
      gameSlug: a.gameSlug,
      gameName: a.gameName,
      rangeText: `${a.range.mainCount} from ${a.range.mainMin}–${a.range.mainMax}`,
      sampleSize: a.sampleSize,
      oddEvenText: `${a.composition.odd} odd / ${a.composition.even} even`,
      sum: a.composition.sum,
      normalisedSumPercent: normalised,
      repeatRate,
    };
  });

  return {
    games,
    normalisationNote:
      "These games draw from different number ranges, so the totals are shown as a position within each game's own possible range rather than compared directly.",
    unavailable,
  };
}
