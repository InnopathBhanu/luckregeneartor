/*
 * THE HISTORICAL DRAW EXPLORER — LRG-FLAGSHIP-003, section FG-08.
 *
 * Authority: BP-04A §22 (*"stable draw records; date search; rule-era filters; current versus all-history views"*),
 * BP-05C §4 T-C3 (Exact Number History Search, Drawn Together, Endings, Odd/Even, High/Low, Consecutive, Sums,
 * Repeat from Previous Draw), the active founder instruction (*"It must search historical results, not just
 * current result"*; the twelve filter axes; result count, active filters, clear empty states, row actions).
 *
 * ══ THIS IS A SEARCH ENGINE, NOT A TEXT BOX ══
 *
 * Twelve independent predicates over a precomputed series, composed with AND. Every filter narrows real rows and
 * reports how many survived, so the reader always knows what they are looking at. Nothing here is decorative:
 * each axis exists because it answers a question a player actually asks, and each one is exercised by a test.
 *
 * ══ PURE, SO THE ANSWER IS REVIEWABLE ══
 *
 * `searchDraws` is a pure function of (rows, filter). The component holds state and renders; it decides nothing.
 * That is what makes a wrong result a fixable bug rather than a rendering accident, and it is what lets the Stats
 * Lab hand the explorer a filter and get exactly the drawings the statistic was computed from.
 */

import type { FlagshipDrawRow } from "./flagshipHistory";

/* ------------------------------------------------------------------ filter */

export interface ExplorerFilter {
  /** Every one of these values must appear in the drawing. Partial lines are the point — 1 to 5 values. */
  includeMain: readonly number[];
  /** The drawn special ball must equal this. */
  special: number | null;
  /** The drawn multiplier must equal this. Only meaningful where the game draws one. */
  multiplier: number | null;
  fromIso: string | null;
  toIso: string | null;
  /** `Mon` … `Sun`. Empty means every draw night. */
  drawDays: readonly string[];
  /** The drawing must repeat at least one value from the drawing before it. */
  hasRepeat: boolean;
  /** The drawing must contain a run of at least this many consecutive values. `0` disables. */
  minConsecutive: number;
  /** Exactly this many odd values. */
  oddCount: number | null;
  /** Exactly this many values in the low half of the pool. */
  lowCount: number | null;
  sumMin: number | null;
  sumMax: number | null;
  /** Every one of these values must appear together — the pair/triplet co-occurrence axis. */
  together: readonly number[];
  /** Only rows from the production feed. Lets a reviewer see exactly what is real. */
  productionOnly: boolean;
}

export const EMPTY_FILTER: ExplorerFilter = Object.freeze({
  includeMain: [],
  special: null,
  multiplier: null,
  fromIso: null,
  toIso: null,
  drawDays: [],
  hasRepeat: false,
  minConsecutive: 0,
  oddCount: null,
  lowCount: null,
  sumMin: null,
  sumMax: null,
  together: [],
  productionOnly: false,
});

export function isEmptyFilter(f: ExplorerFilter): boolean {
  return activeFilterChips(f, "Special ball").length === 0;
}

/* ------------------------------------------------------------------ active-filter description */

export interface FilterChip {
  key: keyof ExplorerFilter;
  label: string;
}

/**
 * The active filters, as removable chips.
 *
 * Generated from the filter itself rather than tracked alongside it, so a chip can never describe a filter that
 * is not applied — the drift that makes a filter bar untrustworthy.
 */
export function activeFilterChips(f: ExplorerFilter, specialLabel: string): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.includeMain.length > 0) {
    chips.push({ key: "includeMain", label: `Includes ${[...f.includeMain].sort((a, b) => a - b).join(", ")}` });
  }
  if (f.together.length > 0) {
    chips.push({ key: "together", label: `${[...f.together].sort((a, b) => a - b).join(" + ")} drawn together` });
  }
  if (f.special !== null) chips.push({ key: "special", label: `${specialLabel} ${f.special}` });
  if (f.multiplier !== null) chips.push({ key: "multiplier", label: `Multiplier ${f.multiplier}X` });
  if (f.fromIso) chips.push({ key: "fromIso", label: `From ${f.fromIso}` });
  if (f.toIso) chips.push({ key: "toIso", label: `To ${f.toIso}` });
  if (f.drawDays.length > 0) chips.push({ key: "drawDays", label: `${f.drawDays.join(", ")} drawings` });
  if (f.hasRepeat) chips.push({ key: "hasRepeat", label: "Repeated a number from the drawing before" });
  if (f.minConsecutive > 0) {
    chips.push({ key: "minConsecutive", label: `${f.minConsecutive}+ consecutive numbers` });
  }
  if (f.oddCount !== null) chips.push({ key: "oddCount", label: `${f.oddCount} odd` });
  if (f.lowCount !== null) chips.push({ key: "lowCount", label: `${f.lowCount} in the low half` });
  if (f.sumMin !== null || f.sumMax !== null) {
    chips.push({
      key: "sumMin",
      label: `Sum ${f.sumMin ?? "any"}–${f.sumMax ?? "any"}`,
    });
  }
  if (f.productionOnly) chips.push({ key: "productionOnly", label: "Real published drawings only" });
  return chips;
}

/** Clear one chip's axis, leaving the rest of the filter intact. */
export function clearFilterKey(f: ExplorerFilter, key: keyof ExplorerFilter): ExplorerFilter {
  switch (key) {
    case "includeMain": return { ...f, includeMain: [] };
    case "together": return { ...f, together: [] };
    case "special": return { ...f, special: null };
    case "multiplier": return { ...f, multiplier: null };
    case "fromIso": return { ...f, fromIso: null };
    case "toIso": return { ...f, toIso: null };
    case "drawDays": return { ...f, drawDays: [] };
    case "hasRepeat": return { ...f, hasRepeat: false };
    case "minConsecutive": return { ...f, minConsecutive: 0 };
    case "oddCount": return { ...f, oddCount: null };
    case "lowCount": return { ...f, lowCount: null };
    case "sumMin": return { ...f, sumMin: null, sumMax: null };
    case "productionOnly": return { ...f, productionOnly: false };
    default: return f;
  }
}

/* ------------------------------------------------------------------ search */

export interface ExplorerResult {
  rows: readonly FlagshipDrawRow[];
  /** How many drawings matched, before the display limit. */
  matchCount: number;
  /** How many drawings were searched. */
  searchedCount: number;
  /** Matched rows that are real published drawings rather than review rows. */
  productionMatchCount: number;
  chips: readonly FilterChip[];
  /** Rows actually returned for display. */
  shown: number;
  limit: number;
}

/** How many matched rows the table renders before asking the reader to narrow further. */
export const EXPLORER_PAGE_SIZE = 25;

function matches(row: FlagshipDrawRow, f: ExplorerFilter): boolean {
  if (f.productionOnly && row.provenance !== "productionFeed") return false;
  if (f.fromIso && row.drawDateIso < f.fromIso) return false;
  if (f.toIso && row.drawDateIso > f.toIso) return false;
  if (f.drawDays.length > 0 && !f.drawDays.includes(row.drawDay)) return false;

  if (f.includeMain.length > 0 && !f.includeMain.every((v) => row.main.includes(v))) return false;
  /* `together` is the same predicate with different intent, kept separate so the chip can say what the reader
     meant: "includes 7" and "7 + 23 drawn together" are different questions with the same mechanics. */
  if (f.together.length > 0 && !f.together.every((v) => row.main.includes(v))) return false;

  if (f.special !== null && row.special !== f.special) return false;
  if (f.multiplier !== null && row.multiplier !== f.multiplier) return false;

  if (f.hasRepeat && row.repeatsFromPrevious.length === 0) return false;
  if (f.minConsecutive > 0 && row.longestRun < f.minConsecutive) return false;
  if (f.oddCount !== null && row.oddCount !== f.oddCount) return false;
  if (f.lowCount !== null && row.lowCount !== f.lowCount) return false;
  if (f.sumMin !== null && row.sum < f.sumMin) return false;
  if (f.sumMax !== null && row.sum > f.sumMax) return false;
  return true;
}

/** Search the series. Rows come back newest first, which is the order the series is already held in. */
export function searchDraws(
  rows: readonly FlagshipDrawRow[],
  filter: ExplorerFilter,
  specialLabel: string,
  limit: number = EXPLORER_PAGE_SIZE,
): ExplorerResult {
  const matched = rows.filter((r) => matches(r, filter));
  return {
    rows: matched.slice(0, limit),
    matchCount: matched.length,
    searchedCount: rows.length,
    productionMatchCount: matched.filter((r) => r.provenance === "productionFeed").length,
    chips: activeFilterChips(filter, specialLabel),
    shown: Math.min(matched.length, limit),
    limit,
  };
}

/* ------------------------------------------------------------------ similar draws */

/**
 * Drawings structurally like a given one — BP-05C AI-D3.
 *
 * Similarity is scored on the four properties BP-05C names: a close sum, the same odd/even split, the same
 * low/high split, and the same consecutive-run length. Shared values add a smaller weight, because two drawings
 * sharing a number is common and says less than sharing a shape.
 *
 * The language this supports is *"this drawing resembles these historical drawings structurally"* — never
 * *"these drawings predict what comes next"*.
 */
export function similarDraws(
  target: FlagshipDrawRow,
  rows: readonly FlagshipDrawRow[],
  limit = 5,
): { row: FlagshipDrawRow; score: number; shared: number[] }[] {
  return rows
    .filter((r) => r.drawDateIso !== target.drawDateIso)
    .map((r) => {
      const shared = r.main.filter((v) => target.main.includes(v));
      let score = 0;
      const sumGap = Math.abs(r.sum - target.sum);
      if (sumGap <= 10) score += 4;
      else if (sumGap <= 25) score += 2;
      if (r.oddCount === target.oddCount) score += 3;
      if (r.lowCount === target.lowCount) score += 3;
      if (r.longestRun === target.longestRun) score += 2;
      score += shared.length;
      return { row: r, score, shared };
    })
    .sort((a, b) => b.score - a.score || a.row.drawDateIso.localeCompare(b.row.drawDateIso))
    .slice(0, limit);
}

/** The filter that reproduces a drawing's structural shape — what "show similar drawings" hands the explorer. */
export function filterLikeDraw(row: FlagshipDrawRow): ExplorerFilter {
  return {
    ...EMPTY_FILTER,
    oddCount: row.oddCount,
    lowCount: row.lowCount,
    sumMin: Math.max(0, row.sum - 15),
    sumMax: row.sum + 15,
  };
}
