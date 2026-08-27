/*
 * DETERMINISTIC HISTORY ANALYSIS FOR DIGIT GAMES — LRG-GAME-050.
 *
 * Serves JG-07 (results history), JG-08 (number history), JG-09 (statistics) and JG-14 (draw insights).
 *
 * Authority: BP-04B §21 (deterministic state-native insights: digit position frequency, pairs, sums, repeats,
 * gaps, variant comparison), §22 (neutral game language), the 2026-08-04 brief §9 (*"These statistics describe
 * the selected history. They do not change the odds of an independent future drawing."*), Constitution
 * (distinguish statistically true historical observation from prediction).
 *
 * ══ THE VOCABULARY IS PART OF THE CONTRACT ══
 *
 * BP-04B §22 forbids "due", "overdue", "best", "most likely next" and "hot/cold gives you a better chance".
 * That is not a copy-review note that lives in a document — a gap metric *named* `overdue` would leak the
 * forbidden claim into every consumer of this module, including the AI layer. So the field is
 * `drawsSinceLastSeen` and its label is "historical gap". `assertNeutralLanguage` re-checks the emitted
 * strings, so a future edit that reintroduces the framing fails a test rather than shipping.
 *
 * ══ EVERY RESULT CARRIES ITS OWN COVERAGE ══
 *
 * A frequency count is meaningless without the window it was taken over, and a reader comparing two figures
 * from different windows is being misled by us, not by the data. So `AnalysisCoverage` is returned from every
 * entry point and is not optional.
 *
 * ══ WHY MIDDAY AND EVENING ARE NEVER POOLED SILENTLY ══
 *
 * They are separate games. Pooling them is a legitimate *view* — `variant: "all"` — but it must be a chosen
 * view, never the accident of a missing filter. `filterDraws` requires the variant selection explicitly.
 */

/* ------------------------------------------------------------------ input */

export interface DrawRecord {
  /** The member game's own id. Preserved end to end; never rewritten. */
  gameId: number;
  variantLabel: string;
  drawDateIso: string;
  /**
   * The MAIN group's drawn values, in the order the data path supplied them.
   *
   * Named `digits` for continuity with the digit games this module was built for; it holds a ball game's main
   * numbers just as faithfully. Nothing in this file sorts it.
   */
  digits: readonly number[];
  /**
   * Every non-main drawn group — a special ball, or a drawn add-on — carried by label.
   *
   * Added by LRG-GAME-052. Before it, a special ball had nowhere to live and a game like SuperLotto Plus could
   * only be represented by discarding its Mega Ball. Keyed by label rather than by position so a feed that
   * reorders its special groups cannot shift a value into the wrong one.
   */
  extras?: readonly { label: string; values: readonly number[] }[];
  /**
   * The drawn add-on value, for the digit games that predate `extras`.
   *
   * Retained rather than migrated: the digit statistics below read it directly, and the generic search falls
   * back to it when no matching `extras` entry exists.
   */
  fireball: number | null;
  /** Governed status. A corrected draw can be included or excluded by the reader. */
  status: string;
  corrected?: boolean;
}

export type VariantSelection = "all" | { gameId: number };

export interface AnalysisFilter {
  variant: VariantSelection;
  fromIso: string | null;
  toIso: string | null;
  includeCorrected: boolean;
}

export interface AnalysisCoverage {
  drawCount: number;
  firstDrawIso: string | null;
  lastDrawIso: string | null;
  variantLabel: string;
  /** Reader-facing sentence naming exactly what was measured. Rendered next to every figure. */
  statement: string;
  /** How many draws the filter removed, so a thin window is visible rather than implied. */
  excludedCorrected: number;
}

export const STATISTICS_NEUTRALITY =
  "These statistics describe the selected history. They do not change the odds of an independent future drawing.";

/* ------------------------------------------------------------------ filtering */

/** Apply a reader's filter. Sorted newest first, which is the order every table renders. */
export function filterDraws(all: readonly DrawRecord[], f: AnalysisFilter): DrawRecord[] {
  let excluded = 0;
  const out = all.filter((d) => {
    if (f.variant !== "all" && d.gameId !== f.variant.gameId) return false;
    if (f.fromIso && d.drawDateIso < f.fromIso) return false;
    if (f.toIso && d.drawDateIso > f.toIso) return false;
    if (!f.includeCorrected && d.corrected) {
      excluded++;
      return false;
    }
    return true;
  });
  out.sort((a, b) => (a.drawDateIso === b.drawDateIso ? a.gameId - b.gameId : b.drawDateIso.localeCompare(a.drawDateIso)));
  (out as DrawRecord[] & { __excluded?: number }).__excluded = excluded;
  return out;
}

export function coverageOf(draws: readonly DrawRecord[], f: AnalysisFilter): AnalysisCoverage {
  const dates = draws.map((d) => d.drawDateIso).sort();
  const variantLabel =
    f.variant === "all" ? "All drawings" : (draws[0]?.variantLabel ?? "Selected drawing");
  const first = dates[0] ?? null;
  const last = dates[dates.length - 1] ?? null;
  const excludedCorrected = (draws as DrawRecord[] & { __excluded?: number }).__excluded ?? 0;
  return {
    drawCount: draws.length,
    firstDrawIso: first,
    lastDrawIso: last,
    variantLabel,
    excludedCorrected,
    statement:
      draws.length === 0
        ? "No drawings match the selected range."
        : `${variantLabel} · ${draws.length} drawing${draws.length === 1 ? "" : "s"} from ${first} to ${last}` +
          (f.includeCorrected ? "" : excludedCorrected > 0 ? ` · ${excludedCorrected} corrected drawing excluded` : ""),
  };
}

/* ------------------------------------------------------------------ frequency by position */

export interface PositionFrequency {
  position: number;
  positionLabel: string;
  /** digit → number of times it appeared in this position. Every digit in range is present, including zeros. */
  counts: Readonly<Record<number, number>>;
  total: number;
}

const POSITION_LABELS = ["First", "Second", "Third", "Fourth", "Fifth"];

export function positionFrequency(
  draws: readonly DrawRecord[],
  digitCount: number,
  min: number,
  max: number,
): PositionFrequency[] {
  return Array.from({ length: digitCount }, (_, position) => {
    const counts: Record<number, number> = {};
    /* Seed every digit so a digit that never appeared reads as 0 rather than vanishing from the table. */
    for (let d = min; d <= max; d++) counts[d] = 0;
    for (const draw of draws) {
      const v = draw.digits[position];
      if (v !== undefined && v in counts) counts[v] += 1;
    }
    return {
      position,
      positionLabel: `${POSITION_LABELS[position] ?? `Position ${position + 1}`} position`,
      counts,
      total: draws.length,
    };
  });
}

/* ------------------------------------------------------------------ sums */

export interface SumDistribution {
  /** sum → count. Sparse by design: only sums that occurred appear. */
  counts: Readonly<Record<number, number>>;
  min: number;
  max: number;
  /** Fixed reader-friendly buckets, so the chart axis is stable across filters. */
  buckets: readonly { label: string; from: number; to: number; count: number }[];
}

export function sumDistribution(draws: readonly DrawRecord[], digitCount: number, digitMax: number): SumDistribution {
  const counts: Record<number, number> = {};
  for (const d of draws) {
    const s = d.digits.reduce((a, b) => a + b, 0);
    counts[s] = (counts[s] ?? 0) + 1;
  }
  const maxSum = digitCount * digitMax;
  const width = Math.max(1, Math.ceil((maxSum + 1) / 6));
  const buckets: { label: string; from: number; to: number; count: number }[] = [];
  for (let from = 0; from <= maxSum; from += width) {
    const to = Math.min(maxSum, from + width - 1);
    let count = 0;
    for (const [k, v] of Object.entries(counts)) {
      const n = Number(k);
      if (n >= from && n <= to) count += v;
    }
    buckets.push({ label: from === to ? `${from}` : `${from}–${to}`, from, to, count });
  }
  const seen = Object.keys(counts).map(Number);
  return {
    counts,
    min: seen.length ? Math.min(...seen) : 0,
    max: seen.length ? Math.max(...seen) : 0,
    buckets,
  };
}

/* ------------------------------------------------------------------ repeated-digit shape */

export interface ShapeDistribution {
  allDifferent: number;
  onePair: number;
  triple: number;
  total: number;
}

export function shapeDistribution(draws: readonly DrawRecord[]): ShapeDistribution {
  let allDifferent = 0;
  let onePair = 0;
  let triple = 0;
  for (const d of draws) {
    const distinct = new Set(d.digits).size;
    if (distinct === d.digits.length) allDifferent++;
    else if (distinct === 1) triple++;
    else onePair++;
  }
  return { allDifferent, onePair, triple, total: draws.length };
}

/* ------------------------------------------------------------------ pairs */

export interface PairFrequency {
  kind: "front" | "back";
  /** "d1-d2" → count, in exact order. */
  counts: Readonly<Record<string, number>>;
  /** The most frequently drawn pairs in this window. Descriptive ordering only — not a recommendation. */
  top: readonly { pair: string; count: number }[];
}

export function pairFrequency(draws: readonly DrawRecord[], kind: "front" | "back", topN = 5): PairFrequency {
  const counts: Record<string, number> = {};
  for (const d of draws) {
    if (d.digits.length < 2) continue;
    const pair = kind === "front" ? [d.digits[0], d.digits[1]] : [d.digits[d.digits.length - 2], d.digits[d.digits.length - 1]];
    const key = pair.join("-");
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const top = Object.entries(counts)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => (b.count === a.count ? a.pair.localeCompare(b.pair) : b.count - a.count))
    .slice(0, topN);
  return { kind, counts, top };
}

/* ------------------------------------------------------------------ consecutive and repeats */

export interface ConsecutiveSummary {
  /** Draws containing at least two digits that are adjacent in value, in any position. */
  drawsWithConsecutive: number;
  total: number;
}

export function consecutiveSummary(draws: readonly DrawRecord[]): ConsecutiveSummary {
  let hit = 0;
  for (const d of draws) {
    const sorted = [...d.digits].sort((a, b) => a - b);
    let found = false;
    for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] === 1) found = true;
    if (found) hit++;
  }
  return { drawsWithConsecutive: hit, total: draws.length };
}

export interface RepeatFromPrevious {
  /** Per member game, how many draws shared at least one digit with that member's previous draw. */
  byGameId: Readonly<Record<number, { shared: number; compared: number; variantLabel: string }>>;
}

/**
 * Repeats measured WITHIN a member game.
 *
 * Comparing a Midday draw against the preceding Evening draw would be comparing two different games, which
 * is why the records are grouped by `gameId` before any comparison happens.
 */
export function repeatFromPrevious(draws: readonly DrawRecord[]): RepeatFromPrevious {
  const byGame = new Map<number, DrawRecord[]>();
  for (const d of draws) {
    const list = byGame.get(d.gameId) ?? [];
    list.push(d);
    byGame.set(d.gameId, list);
  }
  const out: Record<number, { shared: number; compared: number; variantLabel: string }> = {};
  for (const [gameId, list] of byGame) {
    const chron = [...list].sort((a, b) => a.drawDateIso.localeCompare(b.drawDateIso));
    let shared = 0;
    for (let i = 1; i < chron.length; i++) {
      const prev = new Set(chron[i - 1].digits);
      if (chron[i].digits.some((d) => prev.has(d))) shared++;
    }
    out[gameId] = { shared, compared: Math.max(0, chron.length - 1), variantLabel: chron[0]?.variantLabel ?? "" };
  }
  return { byGameId: out };
}

/* ------------------------------------------------------------------ historical gap */

export interface HistoricalGap {
  digit: number;
  /**
   * How many drawings have passed since this digit last appeared, counting back from the newest draw in the
   * window. Deliberately NOT named `overdue`: BP-04B §22 forbids that framing, and a field name is copy.
   */
  drawsSinceLastSeen: number | null;
  lastSeenIso: string | null;
}

export function historicalGaps(draws: readonly DrawRecord[], min: number, max: number): HistoricalGap[] {
  /* Newest first, so index 0 is the most recent drawing and the index IS the gap. */
  const newestFirst = [...draws].sort((a, b) => b.drawDateIso.localeCompare(a.drawDateIso));
  const out: HistoricalGap[] = [];
  for (let digit = min; digit <= max; digit++) {
    const idx = newestFirst.findIndex((d) => d.digits.includes(digit));
    out.push({
      digit,
      drawsSinceLastSeen: idx === -1 ? null : idx,
      lastSeenIso: idx === -1 ? null : newestFirst[idx].drawDateIso,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ variant comparison */

export interface VariantComparison {
  rows: readonly {
    gameId: number;
    variantLabel: string;
    drawCount: number;
    allDifferent: number;
    onePair: number;
    triple: number;
    averageSumDisplay: string;
  }[];
}

export function variantComparison(draws: readonly DrawRecord[]): VariantComparison {
  const byGame = new Map<number, DrawRecord[]>();
  for (const d of draws) {
    const l = byGame.get(d.gameId) ?? [];
    l.push(d);
    byGame.set(d.gameId, l);
  }
  const rows = [...byGame.entries()]
    .map(([gameId, list]) => {
      const shape = shapeDistribution(list);
      const total = list.reduce((a, d) => a + d.digits.reduce((x, y) => x + y, 0), 0);
      return {
        gameId,
        variantLabel: list[0]?.variantLabel ?? "",
        drawCount: list.length,
        allDifferent: shape.allDifferent,
        onePair: shape.onePair,
        triple: shape.triple,
        /* One decimal place, formatted here so no component does arithmetic on a statistic. */
        averageSumDisplay: list.length ? (total / list.length).toFixed(1) : "—",
      };
    })
    .sort((a, b) => a.gameId - b.gameId);
  return { rows };
}

/* ------------------------------------------------------------------ number history search (JG-08) */

export type NumberSearch =
  | { kind: "digitAtPosition"; digit: number; position: number }
  | { kind: "pair"; a: number; b: number; where: "front" | "back" }
  | { kind: "exact"; digits: readonly number[] };

/* ------------------------------------------------------------------ number-in-past-draws search */

/**
 * How many recent drawings to search.
 *
 * A DRAW COUNT, not a date range, and the distinction matters for a twice-daily game: "the last 25 drawings" is
 * about twelve days of Pick 3 history, and a reader thinking in drawings should not have to convert.
 */
export type DrawWindow = 10 | 25 | 50 | 100;
export const DRAW_WINDOWS: readonly DrawWindow[] = Object.freeze([10, 25, 50, 100]);

export type DrawTypeSelection = "both" | { gameId: number };
export type MatchMode = "exact" | "any";

export interface NumberLookupInput {
  /**
   * The number as TYPED, so leading zeros survive.
   *
   * `007` is a legitimate Pick 3 number and `Number("007")` is `7`. Carrying the string to the boundary and
   * parsing per position is what keeps `007`, `070` and `700` three different searches.
   */
  raw: string;
  window: DrawWindow;
  drawType: DrawTypeSelection;
  matchMode: MatchMode;
  /** Whether to also report the add-on's replacement effect. Only meaningful where the era offers one. */
  includeAddOn: boolean;
}

export interface NumberLookupRow {
  drawDateIso: string;
  gameId: number;
  variantLabel: string;
  drawn: readonly number[];
  addOn: number | null;
  /** How this drawing matched: in the exact order typed, or the same digits in a different order. */
  matchedAs: "exact" | "any";
  /**
   * Present only when the add-on was requested AND it produces the match.
   *
   * Names the position the add-on number replaced, so the row explains itself rather than asserting a match the
   * reader cannot see in the drawn digits.
   */
  addOnEffect: { replacedPosition: number; combination: readonly number[] } | null;
}

export interface NumberLookupResult {
  /** Parsed digits, or `null` when the input is not a complete number of the right length. */
  digits: readonly number[] | null;
  /** Why the input was rejected. `null` when it parsed. */
  inputError: string | null;
  /** Drawings actually searched, after the window and draw-type filters. */
  searchedCount: number;
  matches: readonly NumberLookupRow[];
  /** Total matching drawings — stated separately so the count is not inferred from a truncated list. */
  totalMatches: number;
  /** Reader-facing sentence. Always states the number, the window and the match mode. */
  statement: string;
}

/**
 * Parse a typed number into digits, preserving leading zeros.
 *
 * Rejects rather than coerces. A partially typed number is not a search over "whatever parsed", because that
 * would silently answer a different question than the one asked.
 */
export function parseTypedNumber(
  raw: string,
  count: number,
  min: number,
  max: number,
): { digits: readonly number[] | null; error: string | null } {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { digits: null, error: null };
  if (!/^[0-9]+$/.test(trimmed)) {
    return { digits: null, error: "Enter digits only." };
  }
  if (trimmed.length !== count) {
    return {
      digits: null,
      error: `Enter all ${count} digits. Leading zeros count, so 007 and 700 are different numbers.`,
    };
  }
  const digits = [...trimmed].map((ch) => Number(ch));
  for (const d of digits) {
    if (d < min || d > max) return { digits: null, error: `Digits must be between ${min} and ${max}.` };
  }
  return { digits, error: null };
}

function sameOrder(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function sameDigits(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  return [...a].sort().join(",") === [...b].sort().join(",");
}

/**
 * Search a typed number across the most recent N drawings.
 *
 * This is a HISTORICAL search and is deliberately not the ticket checker: it answers "when did this number come
 * up?" across many drawings, and prices nothing. The checker answers "did my ticket win?" against one drawing
 * and reads the payout table. Keeping them separate stops a historical count reading as a prize.
 */
export function lookupNumberInDraws(
  all: readonly DrawRecord[],
  input: NumberLookupInput,
  selectionCount: number,
  selectionMin: number,
  selectionMax: number,
): NumberLookupResult {
  const { digits, error } = parseTypedNumber(input.raw, selectionCount, selectionMin, selectionMax);

  /* Newest first, then the window is applied to the FILTERED set, so "last 25 Evening drawings" means 25
     Evening drawings rather than whatever Evening rows happen to fall inside the last 25 of everything. */
  const byType = all.filter((d) => input.drawType === "both" || d.gameId === input.drawType.gameId);
  const searched = [...byType]
    .sort((a, b) => (a.drawDateIso === b.drawDateIso ? a.gameId - b.gameId : b.drawDateIso.localeCompare(a.drawDateIso)))
    .slice(0, input.window);

  if (!digits) {
    return {
      digits: null,
      inputError: error,
      searchedCount: searched.length,
      matches: [],
      totalMatches: 0,
      statement: error
        ? error
        : `Enter a ${selectionCount}-digit number to search the last ${input.window} drawings.`,
    };
  }

  const rows: NumberLookupRow[] = [];
  for (const d of searched) {
    const exact = sameOrder(digits, d.digits);
    const any = sameDigits(digits, d.digits);
    const baseHit = input.matchMode === "exact" ? exact : exact || any;

    if (baseHit) {
      rows.push({
        drawDateIso: d.drawDateIso,
        gameId: d.gameId,
        variantLabel: d.variantLabel,
        drawn: d.digits,
        addOn: d.fireball,
        matchedAs: exact ? "exact" : "any",
        addOnEffect: null,
      });
      continue;
    }

    /*
     * The add-on only widens the search when the reader asked for it AND the drawing published one. It is a
     * REPLACEMENT: the add-on number stands in for each drawn digit in turn, so a match is reported together
     * with which position it replaced — otherwise the row would claim a match the drawn digits do not show.
     */
    if (!input.includeAddOn || d.fireball === null) continue;
    for (let pos = 0; pos < d.digits.length; pos++) {
      const combination = d.digits.map((v, i) => (i === pos ? (d.fireball as number) : v));
      const cExact = sameOrder(digits, combination);
      const cAny = sameDigits(digits, combination);
      if (input.matchMode === "exact" ? cExact : cExact || cAny) {
        rows.push({
          drawDateIso: d.drawDateIso,
          gameId: d.gameId,
          variantLabel: d.variantLabel,
          drawn: d.digits,
          addOn: d.fireball,
          matchedAs: cExact ? "exact" : "any",
          addOnEffect: { replacedPosition: pos, combination },
        });
        break;
      }
    }
  }

  const typed = digits.join("");
  const scope =
    input.drawType === "both" ? "Midday and Evening drawings" : `${searched[0]?.variantLabel ?? "selected"} drawings`;
  const mode = input.matchMode === "exact" ? "in exact order" : "in any order";
  const statement =
    rows.length === 0
      ? `${typed} did not appear ${mode} in the last ${searched.length} ${scope}.`
      : `${typed} appeared ${mode} in ${rows.length} of the last ${searched.length} ${scope}.`;

  return {
    digits,
    inputError: null,
    searchedCount: searched.length,
    matches: rows,
    totalMatches: rows.length,
    statement,
  };
}

export interface NumberSearchResult {
  search: NumberSearch;
  count: number;
  /** Every matching draw, newest first, so the claim is auditable rather than asserted. */
  matches: readonly DrawRecord[];
  lastSeenIso: string | null;
  /** Reader-facing sentence. Always states the window. */
  statement: string;
  coverage: AnalysisCoverage;
}

export function searchNumberHistory(
  draws: readonly DrawRecord[],
  coverage: AnalysisCoverage,
  search: NumberSearch,
): NumberSearchResult {
  const matches = draws.filter((d) => {
    switch (search.kind) {
      case "digitAtPosition":
        return d.digits[search.position] === search.digit;
      case "pair": {
        if (d.digits.length < 2) return false;
        const [x, y] =
          search.where === "front"
            ? [d.digits[0], d.digits[1]]
            : [d.digits[d.digits.length - 2], d.digits[d.digits.length - 1]];
        return x === search.a && y === search.b;
      }
      case "exact":
        return d.digits.length === search.digits.length && d.digits.every((v, i) => v === search.digits[i]);
    }
  });
  const newest = [...matches].sort((a, b) => b.drawDateIso.localeCompare(a.drawDateIso));
  const lastSeenIso = newest[0]?.drawDateIso ?? null;
  const n = matches.length;

  let statement: string;
  switch (search.kind) {
    case "digitAtPosition":
      statement =
        n === 0
          ? `Digit ${search.digit} did not appear in the ${(POSITION_LABELS[search.position] ?? `position ${search.position + 1}`).toLowerCase()} position in the selected period.`
          : `Digit ${search.digit} appeared in the ${(POSITION_LABELS[search.position] ?? `position ${search.position + 1}`).toLowerCase()} position ${n} time${n === 1 ? "" : "s"} in the selected period.`;
      break;
    case "pair":
      statement =
        n === 0
          ? `Pair ${search.a}-${search.b} did not appear as a ${search.where === "front" ? "Front" : "Back"} Pair in the selected period.`
          : `Pair ${search.a}-${search.b} appeared as a ${search.where === "front" ? "Front" : "Back"} Pair ${n} time${n === 1 ? "" : "s"}, most recently on ${lastSeenIso}.`;
      break;
    case "exact":
      statement =
        n === 0
          ? `Exact result ${search.digits.join("-")} did not appear in the selected period.`
          : `Exact result ${search.digits.join("-")} appeared ${n} time${n === 1 ? "" : "s"} in the selected period, most recently on ${lastSeenIso}.`;
      break;
  }
  return { search, count: n, matches: newest, lastSeenIso, statement, coverage };
}

/* ------------------------------------------------------------------ draw insights (JG-14) */

export interface DrawInsight {
  key: string;
  /** The observation, stated as history. */
  statement: string;
  /** How it was calculated, so the reader can check it. */
  method: string;
  /** Where the supporting figures live on this page. */
  supportingAnchor: string;
  coverage: AnalysisCoverage;
}

/**
 * Deterministic observations over the selected window.
 *
 * Each one is a count the reader can reproduce from the tables on the same page. Nothing here extrapolates:
 * BP-04B §21 lets AI *summarize* these findings and forbids turning one into a forecast, so the statements are
 * written in the past tense with their window attached and no comparative superlatives.
 */
export function drawInsights(
  draws: readonly DrawRecord[],
  coverage: AnalysisCoverage,
  /** The era's maximum selectable value. Required: a hardcoded 9 would mis-band every ball game. */
  selectionMax: number,
): DrawInsight[] {
  if (draws.length === 0) return [];
  const out: DrawInsight[] = [];

  const rep = repeatFromPrevious(draws);
  for (const [gameId, r] of Object.entries(rep.byGameId)) {
    if (r.compared === 0) continue;
    out.push({
      key: `repeat-${gameId}`,
      statement: `${r.shared} of the last ${r.compared} ${r.variantLabel} drawings shared at least one digit with the ${r.variantLabel} drawing before it.`,
      method: "Each drawing is compared with the previous drawing of the same game only. Midday and Evening are never compared with each other.",
      supportingAnchor: "#jg-09",
      coverage,
    });
  }

  const shape = shapeDistribution(draws);
  if (shape.total > 0) {
    out.push({
      key: "repeated-digit",
      statement: `${shape.onePair + shape.triple} of ${shape.total} drawings in this period contained a repeated digit.`,
      method: "A drawing counts once if any digit appears more than once, whatever its position.",
      supportingAnchor: "#jg-09",
      coverage,
    });
  }

  const consec = consecutiveSummary(draws);
  if (consec.total > 0) {
    out.push({
      key: "consecutive",
      statement: `${consec.drawsWithConsecutive} of ${consec.total} drawings contained two digits that are next to each other in value.`,
      method: "Digits are sorted by value and adjacent pairs differing by one are counted, in any drawn position.",
      supportingAnchor: "#jg-09",
      coverage,
    });
  }

  const sums = sumDistribution(draws, draws[0].digits.length, selectionMax);
  const busiest = [...sums.buckets].sort((a, b) => b.count - a.count)[0];
  if (busiest && busiest.count > 0) {
    out.push({
      key: "sum-band",
      statement: `Drawn totals fell in the ${busiest.label} band in ${busiest.count} of ${draws.length} drawings.`,
      method: "The drawn values are added and the total is placed in a fixed band. Bands do not change with the filter.",
      supportingAnchor: "#jg-09",
      coverage,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ language guard */

/** Framings BP-04B §22 and the Constitution forbid. Checked against emitted copy, not just reviewed. */
export const FORBIDDEN_ANALYSIS_PHRASES: readonly RegExp[] = Object.freeze([
  /\bdue\s+(to\s+)?(hit|win|appear)\b/i,
  /\boverdue\b/i,
  /\bhot\s+(number|digit)/i,
  /\bcold\s+(number|digit)/i,
  /\bmost\s+likely\s+next\b/i,
  /\bwinning\s+pattern\b/i,
  /\bbest\s+(number|digit|play|bet)/i,
  /increase\s+(your\s+)?(odds|chances)/i,
  /better\s+(odds|chances)/i,
  /\bpredict/i,
]);

/**
 * Assert a batch of emitted strings is neutral.
 *
 * Used by the test suite over every statement this module produces, so the vocabulary rule is enforced by the
 * build rather than by a reviewer noticing.
 */
export function assertNeutralLanguage(strings: readonly string[]): void {
  for (const s of strings) {
    for (const re of FORBIDDEN_ANALYSIS_PHRASES) {
      if (re.test(s)) throw new Error(`Analysis copy violates BP-04B §22 (${re}): ${s}`);
    }
  }
}
