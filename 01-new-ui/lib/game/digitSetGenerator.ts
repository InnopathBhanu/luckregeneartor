/*
 * THE NUMBER-SET GENERATOR — LRG-GAME-050.
 *
 * Authority: BP-04B §21 (AI may generate number sets), the 2026-08-04 brief §10 (*"The generator must be
 * deterministic-service backed or use a proven random-number library. AI may configure preferences in plain
 * language but must not manufacture the numbers itself."*), Constitution (entertainment tool, clearly
 * classified; no prediction language), `CLAUDE.md` §14 (never hardcode a ball count or assume a uniform
 * shape).
 *
 * ══ WHY A CSPRNG AND NOT `Math.random()` ══
 *
 * Not because a lottery pick needs cryptographic strength — because `Math.random()` is a documented
 * non-uniform, seedable, implementation-defined generator, and this is the one place in the product where a
 * visible bias in the output would look like a *claim about the game*. A player who noticed 7 appearing
 * unusually often would reasonably conclude LotteryCorner was steering them. `crypto.getRandomValues` with
 * rejection sampling removes both the bias and the appearance of one.
 *
 * ══ THE MODULO TRAP, AND WHY REJECTION SAMPLING IS USED ══
 *
 * `getRandomValues(...) % 10` is biased: 256 is not a multiple of 10, so values 0–5 arrive slightly more often
 * than 6–9. For a page whose adjacent section shows digit frequency statistics, shipping a generator with a
 * measurable low-digit bias would actively corrupt the thing being explained. So the range is truncated to a
 * whole number of buckets and out-of-range bytes are discarded.
 *
 * ══ WHAT THE GENERATOR IS NOT ══
 *
 * It reads the governed era for its range and shape, so it cannot produce an invalid ticket. It attaches no
 * likelihood, no ranking and no recommendation. `BOUNDARY` states the fact that matters once, and callers
 * render it.
 */

import type { FormatProfile, ProfileGroup } from "./gameFormatProfile";

export const GENERATOR_BOUNDARY =
  "Every valid combination has the same chance. The generator does not predict a drawing.";

export interface GenerateOptions {
  /** How many sets to produce. Bounded so a control cannot request unbounded work. */
  setCount: number;
  /**
   * Whether a value may appear more than once in a set.
   *
   * For a digit game this is a **player preference filter**, not a rule: `1-1-2` is a perfectly valid Pick 3
   * ticket. Turning repeats off narrows what the generator offers and changes nothing about the drawing, and
   * the UI must say so.
   */
  allowRepeats: boolean;
}

export interface GeneratedSet {
  /** Values per group, keyed by `ProfileGroup.key`. A special ball is its own entry, never merged. */
  byGroup: Readonly<Record<string, readonly number[]>>;
  /** The MAIN group's values, for callers that only render the headline row. */
  values: readonly number[];
  /** How many distinct orderings this set has — the fact that decides whether Box or Combo can be played. */
  orderings: number;
  /** `allUnique`, `hasPair` or `allSame`, so the UI can name the eligible play types without recomputing. */
  shape: "allUnique" | "hasPair" | "allSame";
}

export interface GenerateResult {
  sets: readonly GeneratedSet[];
  /** Present when the request could not be honoured as asked, with the reason. Never a silent adjustment. */
  note: string | null;
  boundary: string;
}

export const MAX_SETS = 10;

/* ------------------------------------------------------------------ randomness */

function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  const c = globalThis.crypto;
  /* No silent fallback to `Math.random()`. If no CSPRNG exists the caller gets an error rather than a
     quietly-biased set that looks identical to a good one. */
  if (!c || typeof c.getRandomValues !== "function") {
    throw new Error("No cryptographic random source is available for number generation.");
  }
  c.getRandomValues(out);
  return out;
}

/**
 * A uniform integer in `[min, max]` by rejection sampling.
 *
 * `limit` is the largest multiple of `range` that fits in a byte; anything at or above it is discarded, which
 * is what removes the modulo bias described in the header.
 */
function uniformInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) throw new Error(`Invalid generator range ${min}..${max}.`);
  if (range > 256) {
    /* Two-byte path, same rejection rule, for ranges a single byte cannot cover uniformly. */
    const limit = Math.floor(65536 / range) * range;
    for (;;) {
      const b = randomBytes(2);
      const v = (b[0] << 8) | b[1];
      if (v < limit) return min + (v % range);
    }
  }
  const limit = Math.floor(256 / range) * range;
  for (;;) {
    const b = randomBytes(1);
    if (b[0] < limit) return min + (b[0] % range);
  }
}

function shapeOf(values: readonly number[]): GeneratedSet["shape"] {
  const distinct = new Set(values).size;
  if (distinct === values.length) return "allUnique";
  if (distinct === 1) return "allSame";
  return "hasPair";
}

function orderingsOf(values: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
  let denom = 1;
  for (const c of counts.values()) denom *= fact(c);
  return fact(values.length) / denom;
}

/* ------------------------------------------------------------------ generation */

/**
 * Produce valid sets for one governed era.
 *
 * The era supplies the count and the range, so a Pick 3 call yields three digits 0–9 and a Cash Pop call
 * yields one number 1–15 with no branch here at all.
 */
export function generateSets(profile: FormatProfile, opts: GenerateOptions): GenerateResult {
  if (!profile.main || !profile.supports.generator) {
    return {
      sets: [],
      note: "A number generator is not available for this game's result format.",
      boundary: GENERATOR_BOUNDARY,
    };
  }

  const setCount = Math.max(1, Math.min(MAX_SETS, Math.floor(opts.setCount) || 1));
  const main = profile.main;
  let note: string | null = null;

  /*
   * The repeats preference is only the PLAYER's to set where the game can actually repeat a value.
   *
   * For a digit game, turning repeats off narrows what this tool offers and changes nothing about the drawing.
   * For a single-pool ball game the game itself cannot repeat, so the toggle is not offered and saying
   * otherwise would be a claim about the game rather than about the tool.
   */
  let allowRepeats = opts.allowRepeats;
  if (!main.semantics.repeatsAllowed) {
    allowRepeats = false;
    if (opts.allowRepeats) {
      note = `${profile.displayName} does not draw the same value twice, so repeated values are not available.`;
    }
  } else if (!opts.allowRepeats) {
    note =
      "Turning off repeated values narrows the sets this tool offers. It does not change what the drawing can produce.";
  }

  const span = main.max - main.min + 1;
  if (!allowRepeats && span < main.count) {
    allowRepeats = true;
    note = `Only ${span} values exist for ${main.count} positions, so sets must allow a repeated value.`;
  }

  /** Draw one group. Every group uses its OWN count, range and repeat rule — never the main group's. */
  const drawGroup = (g: ProfileGroup, repeats: boolean): number[] => {
    const values: number[] = [];
    while (values.length < g.count) {
      const v = uniformInt(g.min, g.max);
      if (!repeats && values.includes(v)) continue;
      values.push(v);
    }
    /* An unordered group is presented ascending, as operators publish it. An ORDERED group is never sorted:
       its positions are the ticket, and sorting would produce a different play. */
    if (!g.semantics.matchOrdered) values.sort((a, b) => a - b);
    return values;
  };

  const sets: GeneratedSet[] = [];
  for (let s = 0; s < setCount; s++) {
    const byGroup: Record<string, readonly number[]> = {};
    const mainValues = drawGroup(main, allowRepeats);
    byGroup[main.key] = mainValues;
    /* Special groups draw from their own independent pools. An add-on is drawn by the operator, not chosen on
       a ticket, so it is never generated here. */
    for (const g of profile.extraGroups) {
      if (g.role === "addOn") continue;
      byGroup[g.key] = drawGroup(g, g.semantics.repeatsAllowed);
    }
    sets.push({
      byGroup,
      values: mainValues,
      orderings: orderingsOf(mainValues),
      shape: shapeOf(mainValues),
    });
  }

  return { sets, note, boundary: GENERATOR_BOUNDARY };
}

/**
 * Which play types a generated set can actually be bought as.
 *
 * A triple such as `7-7-7` has one ordering, so Box, Straight/Box and Combo are unavailable on it. Deriving
 * this from the era rather than hardcoding it is what stops the UI offering an unbuyable play type.
 */
export function eligiblePlayTypes(
  era: { playTypes: readonly { key: string; label: string; digitShape: string }[] },
  set: GeneratedSet,
): string[] {
  return era.playTypes
    .filter((p) => {
      if (p.digitShape === "pairOnly") return false;
      if (set.shape === "allSame") return p.key === "straight";
      if (p.digitShape === "hasPair") return set.shape === "hasPair";
      if (p.digitShape === "allUnique") return set.shape === "allUnique";
      return true;
    })
    .map((p) => p.label);
}
