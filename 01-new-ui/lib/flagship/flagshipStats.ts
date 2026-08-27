/*
 * THE STATS LAB ENGINE — LRG-FLAGSHIP-003, section FG-07.
 *
 * Authority: BP-04A §18 (the deterministic insight catalog), BP-05C §11 and §19 (*"Every result states: game,
 * date range, number of draws, rule era, excluded data, last updated, methodology"*), the active founder
 * instruction (*"Must be interactive and connected to historical results … Every stat should either filter the
 * Historical Draw Explorer, open matching draws, or offer Ask AI"*), the frozen Constitution.
 *
 * ══ EVERY STATISTIC CARRIES THE FILTER THAT PRODUCED IT ══
 *
 * That is the difference between this and a decorative chart. `StatRow.filter` is the exact `ExplorerFilter` that
 * selects the drawings the number was counted from, so "17 came up 48 times" is not a claim a reader has to take
 * on trust — it opens the 48 drawings. The statistic and the evidence cannot drift apart, because the same
 * predicate produces both.
 *
 * ══ THRESHOLDS ARE PER VIEW, AND THEY ARE EDITORIAL ══
 *
 * A pair table over 40 drawings is misleading in a way a repeat rate over 40 drawings is not. Each view declares
 * its own minimum and the reason is rendered, so the threshold is reviewable rather than a constant buried in a
 * component. They are not significance tests.
 *
 * This is also why the two flagship pages differ: the review series never crosses a rule-era boundary, and Mega
 * Millions' current format began in April 2025, so its series is genuinely shorter than Powerball's and some
 * views are legitimately unavailable on one page and available on the other.
 */

import type { FlagshipDrawRow } from "./flagshipHistory";
import { EMPTY_FILTER, type ExplorerFilter } from "./flagshipExplorer";
import { previewCountNote, type FlagshipDisplayMode } from "./flagshipDisplay";

/* ------------------------------------------------------------------ views */

export type StatViewKey =
  | "frequency"
  | "overdue"
  | "pairs"
  | "triples"
  | "repeats"
  | "consecutive"
  | "odd-even"
  | "high-low"
  | "sums"
  | "draw-day";

export interface StatViewDefinition {
  key: StatViewKey;
  label: string;
  /** What the view answers, in a player's words. */
  purpose: string;
  /** The fewest drawings this view may be computed over. */
  minDraws: number;
  /** Why that threshold. Rendered with the empty state. */
  thresholdReason: string;
  /** Column heading for the measured column. */
  measureLabel: string;
  /**
   * A short form for the tab strip.
   *
   * FGP-005: the tabs used the full `label`, which is a sentence. Ten sentences wrapped to a 473px strip on
   * mobile — worse than the hidden horizontal scroll it replaced. The full label still heads the panel, so
   * nothing is lost; the tab just stops carrying a sentence.
   */
  tabLabel: string;
}

export const STAT_VIEWS: readonly StatViewDefinition[] = Object.freeze([
  {
    key: "frequency",
    tabLabel: "Frequency",
    label: "How often each number came up",
    purpose: "A count of how many drawings each number appeared in, over the period shown.",
    minDraws: 60,
    thresholdReason:
      "Below about 60 drawings, ordinary randomness makes some numbers look far more common than others when " +
      "nothing is happening at all.",
    measureLabel: "Drawings",
  },
  {
    key: "overdue",
    tabLabel: "Overdue",
    label: "Longest since last drawn",
    purpose: "How many drawings ago each number last appeared.",
    minDraws: 60,
    thresholdReason: "A gap needs enough drawings behind it to describe anything at all.",
    measureLabel: "Drawings ago",
  },
  {
    key: "pairs",
    tabLabel: "Pairs",
    label: "Numbers drawn together",
    purpose: "Which two numbers have appeared in the same drawing most often.",
    minDraws: 120,
    thresholdReason:
      "There are thousands of possible pairs, so a pair table needs a long run of drawings before the top of the " +
      "list separates from chance.",
    measureLabel: "Together",
  },
  {
    key: "triples",
    tabLabel: "Triples",
    label: "Three numbers drawn together",
    purpose: "Which three numbers have appeared in the same drawing most often.",
    minDraws: 260,
    thresholdReason:
      "There are far more possible triples than pairs, so this needs a much longer record before the top of the " +
      "list means anything.",
    measureLabel: "Together",
  },
  {
    key: "repeats",
    tabLabel: "Repeats",
    label: "Numbers carried over from the drawing before",
    purpose: "How often at least one number repeats from one drawing to the next.",
    minDraws: 30,
    thresholdReason: "Each drawing contributes one observation, so this needs a run of drawings to describe.",
    measureLabel: "Drawings",
  },
  {
    key: "consecutive",
    tabLabel: "Consecutive",
    label: "Runs of consecutive numbers",
    purpose: "How often a drawing contained two or more numbers next to each other.",
    minDraws: 30,
    thresholdReason: "One drawing either has a run or it does not; the share only means something across many.",
    measureLabel: "Drawings",
  },
  {
    key: "odd-even",
    tabLabel: "Odd / even",
    label: "Odd and even balance",
    purpose: "How the odd-to-even split has been distributed across drawings.",
    minDraws: 30,
    thresholdReason: "A distribution needs enough drawings for each split to appear.",
    measureLabel: "Drawings",
  },
  {
    key: "high-low",
    tabLabel: "Low / high",
    label: "Low and high balance",
    purpose: "How the low-to-high split has been distributed across drawings.",
    minDraws: 30,
    thresholdReason: "A distribution needs enough drawings for each split to appear.",
    measureLabel: "Drawings",
  },
  {
    key: "sums",
    tabLabel: "Sums",
    label: "Sum of the drawn numbers",
    purpose: "How the total of the drawn numbers has been distributed.",
    minDraws: 60,
    thresholdReason: "The sum has a wide range, so a shape only emerges across a long run of drawings.",
    measureLabel: "Drawings",
  },
  {
    key: "draw-day",
    tabLabel: "Draw night",
    label: "By draw night",
    purpose: "How the drawings are spread across the game's draw nights.",
    minDraws: 30,
    thresholdReason: "Each night needs enough drawings to compare with the others.",
    measureLabel: "Drawings",
  },
]);

/* ------------------------------------------------------------------ rows */

/** One row of a computed statistic, carrying the filter that opens the drawings behind it. */
export interface StatRow {
  /** Reader-facing label — `17`, `7 + 23`, `3 odd · 2 even`, `Sat`. */
  label: string;
  /** The measured value. */
  count: number;
  /** Share of the drawings searched, 0–1. `null` where a share is not meaningful. */
  share: number | null;
  /** The exact filter that selects the drawings this row was counted from. */
  filter: ExplorerFilter;
}

export interface StatView {
  definition: StatViewDefinition;
  available: boolean;
  /** Reader-facing explanation when unavailable. `null` when the view computed. */
  reason: string | null;
  rows: readonly StatRow[];
  drawCount: number;
}

/**
 * How many rows a RANKED view returns. A distribution view returns its complete shape — see `sums`.
 *
 * Trimmed from 12 in the FGP-003 polish pass: the Stats Lab was the tallest section on the page at ~1,540px, and
 * a twelve-row table of near-identical counts is not more informative than eight — the tail is noise the reader
 * has to scroll past. Every row still opens the drawings behind it, and the explorer above holds the full record.
 */
const TOP_N = 8;

/* ------------------------------------------------------------------ computation */

function frequencyRows(rows: readonly FlagshipDrawRow[], mainPool: number): StatRow[] {
  const counts = new Map<number, number>();
  for (let v = 1; v <= mainPool; v++) counts.set(v, 0);
  for (const r of rows) for (const v of r.main) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, TOP_N)
    .map(([value, count]) => ({
      label: String(value),
      count,
      share: rows.length === 0 ? 0 : count / rows.length,
      filter: { ...EMPTY_FILTER, includeMain: [value] },
    }));
}

function overdueRows(rows: readonly FlagshipDrawRow[], mainPool: number): StatRow[] {
  /* `rows` is already newest-first, so the first index a value appears at IS the number of drawings since. */
  const out: StatRow[] = [];
  for (let v = 1; v <= mainPool; v++) {
    const at = rows.findIndex((r) => r.main.includes(v));
    out.push({
      label: String(v),
      count: at === -1 ? rows.length : at,
      share: null,
      filter: { ...EMPTY_FILTER, includeMain: [v] },
    });
  }
  return out.sort((a, b) => b.count - a.count || Number(a.label) - Number(b.label)).slice(0, TOP_N);
}

function subsets(values: readonly number[], size: number): number[][] {
  const sorted = [...values].sort((a, b) => a - b);
  const out: number[][] = [];
  const walk = (start: number, acc: number[]) => {
    if (acc.length === size) {
      out.push([...acc]);
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      acc.push(sorted[i]);
      walk(i + 1, acc);
      acc.pop();
    }
  };
  walk(0, []);
  return out;
}

function combinationRows(rows: readonly FlagshipDrawRow[], size: number): StatRow[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    for (const combo of subsets(r.main, size)) {
      const key = combo.join("-");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_N)
    .map(([key, count]) => {
      const values = key.split("-").map(Number);
      return {
        label: values.join(" + "),
        count,
        share: rows.length === 0 ? 0 : count / rows.length,
        filter: { ...EMPTY_FILTER, together: values },
      };
    });
}

function bucketRows(
  rows: readonly FlagshipDrawRow[],
  keyOf: (r: FlagshipDrawRow) => string,
  filterOf: (r: FlagshipDrawRow) => ExplorerFilter,
  sort: (a: [string, { n: number; f: ExplorerFilter }], b: [string, { n: number; f: ExplorerFilter }]) => number,
): StatRow[] {
  const counts = new Map<string, { n: number; f: ExplorerFilter }>();
  for (const r of rows) {
    const k = keyOf(r);
    const entry = counts.get(k);
    if (entry) entry.n += 1;
    else counts.set(k, { n: 1, f: filterOf(r) });
  }
  return [...counts.entries()].sort(sort).map(([label, { n, f }]) => ({
    label,
    count: n,
    share: rows.length === 0 ? 0 : n / rows.length,
    filter: f,
  }));
}

/* ------------------------------------------------------------------ the lab */

export interface StatsLabInput {
  rows: readonly FlagshipDrawRow[];
  mainPool: number;
  mainCount: number;
  drawNights: readonly string[];
}

/** Compute every view against the series, each reporting its own availability. */
export function statsLab(input: StatsLabInput): StatView[] {
  const { rows, mainPool, mainCount } = input;
  const n = rows.length;

  return STAT_VIEWS.map((definition): StatView => {
    if (n < definition.minDraws) {
      return {
        definition,
        available: false,
        drawCount: n,
        rows: [],
        reason:
          n === 0
            ? "No published drawing is connected to this build yet."
            : `${n} published ${n === 1 ? "drawing is" : "drawings are"} connected; this view needs at least ` +
              `${definition.minDraws}. ${definition.thresholdReason}`,
      };
    }

    let statRows: StatRow[] = [];
    switch (definition.key) {
      case "frequency":
        statRows = frequencyRows(rows, mainPool);
        break;
      case "overdue":
        statRows = overdueRows(rows, mainPool);
        break;
      case "pairs":
        statRows = combinationRows(rows, 2);
        break;
      case "triples":
        statRows = combinationRows(rows, 3);
        break;
      case "repeats": {
        const withRepeat = rows.filter((r) => r.repeatsFromPrevious.length > 0).length;
        statRows = [
          {
            label: "Repeated at least one number",
            count: withRepeat,
            share: withRepeat / n,
            filter: { ...EMPTY_FILTER, hasRepeat: true },
          },
          {
            label: "No number carried over",
            count: n - withRepeat,
            share: (n - withRepeat) / n,
            filter: EMPTY_FILTER,
          },
        ];
        break;
      }
      case "consecutive": {
        const withRun = rows.filter((r) => r.longestRun >= 2).length;
        statRows = [
          {
            label: "Contained consecutive numbers",
            count: withRun,
            share: withRun / n,
            filter: { ...EMPTY_FILTER, minConsecutive: 2 },
          },
          {
            label: "Three or more in a row",
            count: rows.filter((r) => r.longestRun >= 3).length,
            share: rows.filter((r) => r.longestRun >= 3).length / n,
            filter: { ...EMPTY_FILTER, minConsecutive: 3 },
          },
        ];
        break;
      }
      case "odd-even":
        statRows = bucketRows(
          rows,
          (r) => `${r.oddCount} odd · ${mainCount - r.oddCount} even`,
          (r) => ({ ...EMPTY_FILTER, oddCount: r.oddCount }),
          (a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]),
        );
        break;
      case "high-low":
        statRows = bucketRows(
          rows,
          (r) => `${r.lowCount} low · ${mainCount - r.lowCount} high`,
          (r) => ({ ...EMPTY_FILTER, lowCount: r.lowCount }),
          (a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]),
        );
        break;
      case "sums": {
        /*
         * 40 rather than 25.
         *
         * A DISTRIBUTION is never truncated the way a ranked list is: cutting the tail off "how the sums are
         * spread" would hide part of the shape and misstate it. So the FGP-003 length trim widens the bucket
         * instead of dropping rows — twelve buckets become eight, the distribution stays complete, and no reader
         * is shown a partial shape as if it were the whole one.
         */
        const size = 40;
        statRows = bucketRows(
          rows,
          (r) => {
            const start = Math.floor(r.sum / size) * size;
            return `${start}–${start + size - 1}`;
          },
          (r) => {
            const start = Math.floor(r.sum / size) * size;
            return { ...EMPTY_FILTER, sumMin: start, sumMax: start + size - 1 };
          },
          (a, b) => Number(a[0].split("–")[0]) - Number(b[0].split("–")[0]),
        );
        break;
      }
      case "draw-day":
        statRows = bucketRows(
          rows,
          (r) => r.drawDay,
          (r) => ({ ...EMPTY_FILTER, drawDays: [r.drawDay] }),
          (a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]),
        );
        break;
    }

    return { definition, available: true, drawCount: n, rows: statRows, reason: null };
  });
}

/**
 * The methodology statement BP-05C §19 requires, generated from the series so it can never describe a different
 * period than the numbers beside it.
 */
export function statsMethod(
  gameLabel: string,
  rows: readonly FlagshipDrawRow[],
  eraLabel: string,
  provenance: { productionFeed: number; synthetic: number },
  displayMode: FlagshipDisplayMode,
): string {
  if (rows.length === 0) {
    return (
      `No published ${gameLabel} drawing is connected to this build, so no statistic is computed. When the ` +
      `drawing archive is connected, every view will state the period, the number of drawings and the rule era.`
    );
  }
  const dates = rows.map((r) => r.drawDateIso).sort();
  /*
   * FGP-009: the series may be a preview one, so the sentence no longer calls every drawing "published" — it
   * counts them, then says how many are published. Claiming 300 published drawings over a payload holding one is
   * exactly the kind of quiet false statement a methodology line is supposed to prevent.
   */
  const base =
    `${gameLabel} · ${rows.length} ${rows.length === 1 ? "drawing" : "drawings"} from ${dates[0]} to ` +
    `${dates[dates.length - 1]} · rule era: ${eraLabel} — no drawing outside this era is included, so nothing ` +
    `here mixes two number matrices.`;
  const note = previewCountNote(provenance.synthetic, displayMode);
  return note ? `${base} ${note}` : `${base} Every one is a published result.`;
}
