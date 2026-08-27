/*
 * DETERMINISTIC DRAW INTELLIGENCE — LRG-FLAGSHIP-002, section FG-04.
 *
 * Authority: BP-04A §18 (the deterministic insight catalog, then an AI layer over it), BP-05C §13 (AI-D1 draw
 * fingerprint, AI-D2 previous-draw relationship, AI-D4 gap context), the frozen Constitution (classify every
 * claim; never imply that history changes the odds of a fair independent draw).
 *
 * ══ THE SPLIT THIS MODULE ENFORCES ══
 *
 * BP-04A §18's catalog contains two different kinds of thing, and conflating them is how a lottery site starts
 * lying:
 *
 *   **Properties of one drawing** — sum, spread, odd/even, high/low, decade distribution, consecutive runs.
 *   These are arithmetic over five drawn numbers. They are TRUE, computable today, and they describe the draw
 *   that happened. This module computes them.
 *
 *   **Statistics over many drawings** — gaps, overdue numbers, pair and triple co-occurrence, frequency, jackpot
 *   roll counts. These need a draw history the repository does not hold. They live in `flagshipStats.ts` and
 *   report their own unavailability rather than being approximated from one draw.
 *
 * ══ EVERY INSIGHT CARRIES ITS OWN CLASSIFICATION ══
 *
 * The Constitution requires claim types to be distinguished explicitly. `InsightClaim` is that distinction as a
 * field, so a component cannot render an observation with the confidence of a fact, and so the "this is a
 * description, not a prediction" boundary travels with the number instead of being a footnote someone forgets.
 */

/** How a reader should weigh an insight. The Constitution's classification vocabulary, narrowed to what applies. */
export type InsightClaim =
  /** Arithmetic over the drawn numbers. Not open to interpretation. */
  | "verifiedFact"
  /** True of the observed data, and about the past only. */
  | "historicalObservation"
  /** LotteryCorner's own framing of a fact — a description, never a forecast. */
  | "analysis";

export interface DrawInsight {
  key: string;
  label: string;
  /** The computed value, preformatted. */
  value: string;
  /** One sentence of plain-language context. Never predictive. */
  detail: string;
  claim: InsightClaim;
}

export interface DrawShape {
  /** The drawn main numbers, in the order published. */
  main: readonly number[];
  /** The drawn special value, when the game has one. */
  special: number | null;
  specialLabel: string | null;
  /** The main pool's highest value, used for the high/low split and the decade buckets. */
  mainPool: number;
}

/* ------------------------------------------------------------------ primitives */

export function drawSum(main: readonly number[]): number {
  return main.reduce((n, v) => n + v, 0);
}

/** Highest minus lowest. How widely the drawn numbers are spread across the pool. */
export function drawSpread(main: readonly number[]): number {
  if (main.length === 0) return 0;
  return Math.max(...main) - Math.min(...main);
}

export function oddEvenSplit(main: readonly number[]): { odd: number; even: number } {
  const odd = main.filter((v) => v % 2 === 1).length;
  return { odd, even: main.length - odd };
}

/**
 * The low/high split, at the pool's midpoint.
 *
 * The midpoint is computed from the pool rather than fixed, so a 69-number game and a 70-number game each get
 * their own boundary and no component has to know which game it is rendering.
 */
export function highLowSplit(main: readonly number[], mainPool: number): { low: number; high: number; boundary: number } {
  const boundary = Math.floor(mainPool / 2);
  const low = main.filter((v) => v <= boundary).length;
  return { low, high: main.length - low, boundary };
}

/** How many drawn numbers fall in each block of ten. Buckets are derived from the pool, never hardcoded. */
export function decadeBuckets(main: readonly number[], mainPool: number): { label: string; count: number }[] {
  const buckets: { label: string; count: number }[] = [];
  for (let start = 1; start <= mainPool; start += 10) {
    const end = Math.min(start + 9, mainPool);
    buckets.push({ label: `${start}–${end}`, count: main.filter((v) => v >= start && v <= end).length });
  }
  return buckets;
}

/** Runs of two or more consecutive values, e.g. `[[36, 37]]`. Empty when the draw has none. */
export function consecutiveRuns(main: readonly number[]): number[][] {
  const sorted = [...main].sort((a, b) => a - b);
  const runs: number[][] = [];
  let current: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1] + 1) {
      if (current.length === 0) current = [sorted[i - 1]];
      current.push(sorted[i]);
    } else if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length > 0) runs.push(current);
  return runs;
}

/** Values drawn in both draws. Requires a previous draw; returns `null` when there is none. */
export function repeatsFromPrevious(
  main: readonly number[],
  previousMain: readonly number[] | null,
): number[] | null {
  if (!previousMain) return null;
  const prev = new Set(previousMain);
  return [...main].filter((v) => prev.has(v)).sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ the catalog */

/**
 * Every insight this page can compute from the drawing in front of it.
 *
 * `previousMain` is optional and is `null` in this build — the production feed carries one current record per
 * game, so there is no previous drawing to compare against. The repeat insight is then OMITTED rather than
 * rendered empty: an absent row is honest, and "0 repeated numbers" would be a claim we cannot support.
 */
export function drawInsights(shape: DrawShape, previousMain: readonly number[] | null = null): DrawInsight[] {
  const { main, mainPool } = shape;
  if (main.length === 0) return [];

  const out: DrawInsight[] = [];
  const sum = drawSum(main);
  /* The midpoint of the achievable range: the lowest possible sum plus the highest, halved. */
  const minSum = (main.length * (main.length + 1)) / 2;
  const maxSum = main.length * mainPool - (main.length * (main.length - 1)) / 2;
  const midSum = Math.round((minSum + maxSum) / 2);

  out.push({
    key: "sum",
    label: "Sum of the numbers",
    value: String(sum),
    detail:
      `The five drawn numbers add up to ${sum}. For this game a draw can total anywhere from ${minSum} to ` +
      `${maxSum}, with the middle of that range at about ${midSum}.`,
    claim: "verifiedFact",
  });

  const spread = drawSpread(main);
  out.push({
    key: "spread",
    label: "Spread",
    value: String(spread),
    detail:
      `${Math.max(...main)} minus ${Math.min(...main)} — how far apart the highest and lowest drawn numbers were.`,
    claim: "verifiedFact",
  });

  const { odd, even } = oddEvenSplit(main);
  out.push({
    key: "odd-even",
    label: "Odd and even",
    value: `${odd} odd · ${even} even`,
    detail: "A count of the numbers actually drawn. It says nothing about what the next drawing will do.",
    claim: "verifiedFact",
  });

  const { low, high, boundary } = highLowSplit(main, mainPool);
  out.push({
    key: "high-low",
    label: "Low and high half",
    value: `${low} low · ${high} high`,
    detail: `Split at ${boundary}: numbers 1–${boundary} count as low, ${boundary + 1}–${mainPool} as high.`,
    claim: "verifiedFact",
  });

  const buckets = decadeBuckets(main, mainPool).filter((b) => b.count > 0);
  out.push({
    key: "decades",
    label: "Where they landed",
    value: buckets.map((b) => `${b.label}: ${b.count}`).join(" · "),
    detail: `The drawn numbers fell in ${buckets.length} of the ${decadeBuckets(main, mainPool).length} blocks of ten.`,
    claim: "verifiedFact",
  });

  const runs = consecutiveRuns(main);
  out.push({
    key: "consecutive",
    label: "Consecutive numbers",
    value: runs.length === 0 ? "None" : runs.map((r) => r.join("–")).join(", "),
    detail:
      runs.length === 0
        ? "No two drawn numbers were next to each other. Consecutive pairs are common and carry no meaning for a future drawing."
        : "Consecutive numbers turn up regularly. They are a property of this drawing, not a pattern that continues.",
    claim: "verifiedFact",
  });

  const repeats = repeatsFromPrevious(main, previousMain);
  if (repeats !== null) {
    out.push({
      key: "repeats",
      label: "Repeated from the previous drawing",
      value: repeats.length === 0 ? "None" : repeats.join(", "),
      detail:
        "Numbers that appeared in the drawing before this one. Each drawing is independent, so a repeat neither " +
        "raises nor lowers the chance of anything.",
      claim: "historicalObservation",
    });
  }

  if (shape.special !== null && shape.specialLabel) {
    out.push({
      key: "special",
      label: shape.specialLabel,
      value: String(shape.special),
      detail:
        `The ${shape.specialLabel} is drawn from its own separate pool, so it can repeat a main number without ` +
        "that meaning anything.",
      claim: "verifiedFact",
    });
  }

  return out;
}

/**
 * The one sentence that must sit under every insight block.
 *
 * Stated once, prominently, rather than repeated per row. The Constitution forbids language implying that history
 * changes the odds of a fair independent drawing, and the myth this most often takes is "overdue" numbers —
 * addressed directly rather than left to inference (BP-05C AI-D4).
 */
export const INSIGHT_BOUNDARY =
  "These describe the drawing that happened. Each drawing is independent, so nothing here — a sum, a repeat, a " +
  "run of consecutive numbers, or a number that has not appeared for a while — changes what any future drawing " +
  "will do. There is no such thing as an overdue number.";

/* ------------------------------------------------------------------ jackpot movement */

export interface JackpotMovement {
  currentDisplay: string;
  currentDrawDisplay: string;
  nextDisplay: string;
  nextDrawDisplay: string;
  /** The rise between the two advertised figures, when both parse. `null` otherwise. */
  changeDisplay: string | null;
}

/** Parse an advertised display such as `$435,000,000` into a number. `null` when it is not a plain amount. */
export function parseAdvertised(display: string | null): number | null {
  if (!display) return null;
  const digits = display.replace(/[^0-9]/g, "");
  if (digits.length === 0) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

/**
 * The only jackpot-trend statement this build can make honestly.
 *
 * A jackpot HISTORY — rollovers, run length, growth per draw, records — needs a series the repository does not
 * hold. What it does hold is two advertised figures from the same feed record: the amount for the drawing that
 * happened, and the amount advertised for the next one. That is a real two-point observation and it is reported
 * as exactly that, with no roll count and no trend line implied.
 */
export function jackpotMovement(
  currentDisplay: string | null,
  currentDrawDisplay: string,
  nextDisplay: string | null,
  nextDrawDisplay: string | null,
): JackpotMovement | null {
  if (!currentDisplay || !nextDisplay || !nextDrawDisplay) return null;
  const a = parseAdvertised(currentDisplay);
  const b = parseAdvertised(nextDisplay);
  const delta = a !== null && b !== null && b > a ? b - a : null;
  return {
    currentDisplay,
    currentDrawDisplay,
    nextDisplay,
    nextDrawDisplay,
    changeDisplay: delta === null ? null : `+$${delta.toLocaleString("en-US")}`,
  };
}
