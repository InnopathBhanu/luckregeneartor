/*
 * THE SHARED DETERMINISTIC DRAW INSIGHTS — §C4.
 *
 * Authority: BP-05C **§12** (*"AI does not invent lottery predictions"*; AI explains deterministic outputs,
 * combines governed facts, routes tools, summarizes sources) and **§13**'s catalog — AI-D1 draw fingerprint,
 * AI-D2 previous-draw relationship, AI-D4 gap context, AI-D7 prize and add-on explanation; the frozen Constitution
 * §7 (the seven claim types must be distinguished explicitly; language MUST NOT imply that history changes the odds
 * of a fair independent draw); `FD-DAT-20` (deterministic ≠ AI, in either direction); BP-04B §22 and
 * `digitHistoryAnalysis.ts`'s own rule that a metric NAMED `overdue` leaks the framing even if the copy is careful.
 *
 * ══ WHY A SHARED MODULE, WHEN THE FLAGSHIP ALREADY HAD INSIGHTS ══
 *
 * `flagshipInsights.ts` implements AI-D1 and AI-D2 well, and `digitHistoryAnalysis.ts` implements the counting the
 * Game Page and the archive need. Neither is reachable from the other, and the two gaps that follow are exactly
 * what §C4 names:
 *
 *   **AI-D4 was incomplete everywhere.** `historicalGaps` returns `drawsSinceLastSeen` per value — the CURRENT gap.
 *   §13 asks for four things: the current gap, the historical MEDIAN, the LONGEST observed gap, and the
 *   **overdue-number myth explanation**. Without the median and the longest, "this number has not appeared for 41
 *   drawings" is a number with no scale, and a reader supplies the missing scale themselves — usually as "so it is
 *   due". The myth sentence existed as `INSIGHT_BOUNDARY` on the flagship hubs ONLY, which is the one place a
 *   reader is least likely to be looking at a gap.
 *
 *   **AI-D7 existed nowhere.** §13 asks for Power Play, Double Play and the state exception on Powerball, and the
 *   ticket-assigned multiplier and prize range on Mega Millions. Both pages carried the multiplier VALUE and a
 *   one-line note; neither explained what a reader has to do to get it, which is the actual question.
 *
 * ══ EVERY OUTPUT IS ARITHMETIC OVER ROWS THE PAGE ALREADY SHOWS ══
 *
 * No provider, no fetch, no model (§C0). A gap is an index into a sorted list; a median is a middle value; the
 * fingerprint is a sum and some counts. `FD-DAT-20` therefore governs the labelling: these are labelled by what
 * they are — a *statistically true historical observation* in the Constitution's own taxonomy — and never as AI, in
 * either direction.
 *
 * ══ THE ONE NAMING RULE THIS FILE INHERITS ══
 *
 * No identifier is named `overdue`, `due`, `hot` or `cold`. `digitHistoryAnalysis.ts` established that a field name
 * IS copy: it survives into JSON, into a future API and into whatever renders it next, so a metric called `overdue`
 * eventually reaches a reader however careful the surrounding sentence was. The gap fields are `currentGap`,
 * `medianGap` and `longestGap`, and the myth is addressed in prose rather than encoded in a name.
 */

/* ------------------------------------------------------------------ shared claim labels */

/**
 * The Constitution's claim types, as the exact strings the pages print.
 *
 * §7 requires these to be *distinguished explicitly*, so they are constants rather than prose a component retypes.
 * A count over published drawings is the second one and never the first: it is true about the past and says nothing
 * about a future drawing, and that distinction is the whole reason the taxonomy exists.
 */
export const CLAIM_LABEL = Object.freeze({
  verifiedFact: "Verified fact",
  historicalObservation: "Statistically true historical observation",
  coincidence: "Historical coincidence",
  analysis: "LotteryCorner analysis",
  communityBelief: "Community belief",
  entertainment: "Entertainment tool",
});

/**
 * AI-D4's required myth explanation, as one shared sentence.
 *
 * §13 lists it as a REQUIRED part of gap context, not as an optional disclaimer. It is stated wherever a gap figure
 * is shown, because a gap without it is the exact input a reader turns into "so it is due".
 */
export const GAP_MYTH_EXPLANATION =
  "A long gap does not make a number any more likely to be drawn next. Each drawing is independent: the machine "
  + "has no memory of what it drew before, so there is no such thing as a number being due.";

/**
 * The standing boundary under any block of historical observations.
 *
 * Stated once per block, prominently — not per row, which Global Shell §45 identifies as the repetitive-disclaimer
 * failure. Wording matches the flagship's `INSIGHT_BOUNDARY` so a reader moving between pages reads one sentence.
 */
export const OBSERVATION_BOUNDARY =
  "These figures describe drawings that have already happened. Nothing here — a sum, a repeat, a run of "
  + "consecutive numbers, or a number that has not appeared for a while — changes what any future drawing will do.";

/* ------------------------------------------------------------------ AI-D1 draw fingerprint */

/** One drawing, reduced to what a fingerprint needs. */
export interface FingerprintInput {
  /** The main drawn values, in drawn order. Never reordered by us. */
  values: readonly number[];
  /** The pool's inclusive bounds, from the governed format — never inferred from the values. */
  min: number;
  max: number;
}

export interface DrawFingerprint {
  sum: number;
  /** Highest minus lowest. §13's "range". */
  range: number;
  odd: number;
  even: number;
  /** Values in the lower half of the pool, and in the upper half. §13's "high/low". */
  low: number;
  high: number;
  /** How many distinct tens bands the values fall into. §13's "decades". */
  decades: number;
  /** The longest run of consecutive values. §13's "consecutive". */
  longestConsecutiveRun: number;
  /** `clustered` when the values occupy less than a third of the pool, `spread` when more than two thirds. */
  distribution: "clustered" | "even" | "spread";
  /** One reader-facing sentence. Descriptive only. */
  description: string;
}

/**
 * AI-D1 — the shape of one drawing.
 *
 * `null` for an empty drawing rather than a fingerprint of zeroes: California's Mega Millions feed record genuinely
 * carries no numbers, and a sum of 0 presented as a fact about that drawing would be false.
 */
export function drawFingerprint(input: FingerprintInput): DrawFingerprint | null {
  const v = [...input.values].filter((n) => Number.isFinite(n));
  if (v.length === 0) return null;

  const sorted = [...v].sort((a, b) => a - b);
  const sum = v.reduce((n, x) => n + x, 0);
  const range = sorted[sorted.length - 1] - sorted[0];
  const odd = v.filter((n) => n % 2 === 1).length;
  const midpoint = (input.min + input.max) / 2;
  const low = v.filter((n) => n <= midpoint).length;
  const decades = new Set(sorted.map((n) => Math.floor(n / 10))).size;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const poolSpan = Math.max(1, input.max - input.min);
  const occupancy = range / poolSpan;
  const distribution = occupancy < 1 / 3 ? "clustered" : occupancy > 2 / 3 ? "spread" : "even";

  const parts = [
    `${odd} odd and ${v.length - odd} even`,
    `${low} from the lower half of the pool and ${v.length - low} from the upper half`,
    longest > 1 ? `${longest} consecutive numbers` : "no consecutive numbers",
    distribution === "clustered"
      ? "close together across the pool"
      : distribution === "spread"
        ? "widely spread across the pool"
        : "evenly spread across the pool",
  ];

  return {
    sum,
    range,
    odd,
    even: v.length - odd,
    low,
    high: v.length - low,
    decades,
    longestConsecutiveRun: longest,
    distribution,
    description: `They add up to ${sum}, with ${parts.join(", ")}.`,
  };
}

/* ------------------------------------------------------------------ AI-D2 previous-draw relationship */

export interface PreviousDrawRelationship {
  /** Values that appeared in BOTH drawings. */
  repeated: readonly number[];
  /** True when the named special ball repeated. `null` when either drawing has no special ball. */
  specialRepeated: boolean | null;
  /** Values one away from a value in the previous drawing. §13's "neighbouring values". */
  neighbouring: readonly number[];
  /** The change in sum, and in range. Signed. */
  sumChange: number;
  rangeChange: number;
  /** One reader-facing sentence. It states relationships and implies no probability (§13: "no probability implication"). */
  description: string;
}

/**
 * AI-D2 — how this drawing relates to the one before it.
 *
 * §13 is explicit that this carries **no probability implication**, so the description states what repeated and what
 * changed and stops. It never says a repeat is unusual, likely, or a signal — a repeat is neither, and saying so
 * would be an unsupported claim dressed as an observation.
 */
export function previousDrawRelationship(
  current: FingerprintInput & { special?: readonly number[] | null },
  previous: FingerprintInput & { special?: readonly number[] | null },
): PreviousDrawRelationship | null {
  if (current.values.length === 0 || previous.values.length === 0) return null;

  const prev = new Set(previous.values);
  const repeated = current.values.filter((n) => prev.has(n));
  const neighbouring = current.values.filter((n) => !prev.has(n) && (prev.has(n - 1) || prev.has(n + 1)));

  const specialRepeated =
    current.special && current.special.length > 0 && previous.special && previous.special.length > 0
      ? current.special.some((n) => previous.special!.includes(n))
      : null;

  const curFp = drawFingerprint(current);
  const prevFp = drawFingerprint(previous);
  const sumChange = curFp && prevFp ? curFp.sum - prevFp.sum : 0;
  const rangeChange = curFp && prevFp ? curFp.range - prevFp.range : 0;

  const bits: string[] = [];
  bits.push(
    repeated.length === 0
      ? "No number from the previous drawing appeared again"
      : `${repeated.length === 1 ? "One number" : `${repeated.length} numbers`} from the previous drawing appeared `
        + `again (${repeated.join(", ")})`,
  );
  if (neighbouring.length > 0) {
    bits.push(`${neighbouring.length} were next to a previous number (${neighbouring.join(", ")})`);
  }
  if (specialRepeated === true) bits.push("the special ball repeated");
  if (specialRepeated === false) bits.push("the special ball changed");
  bits.push(
    sumChange === 0
      ? "the total was the same"
      : `the total ${sumChange > 0 ? "rose" : "fell"} by ${Math.abs(sumChange)}`,
  );

  return {
    repeated,
    specialRepeated,
    neighbouring,
    sumChange,
    rangeChange,
    description: `${bits.join(", ")}.`,
  };
}

/* ------------------------------------------------------------------ AI-D4 gap context */

export interface GapContext {
  value: number;
  /** Drawings since this value last appeared. `null` when it has not appeared in the period at all. */
  currentGap: number | null;
  /** The middle gap length across every appearance in the period. `null` with fewer than two appearances. */
  medianGap: number | null;
  /** The longest gap observed in the period. `null` with fewer than two appearances. */
  longestGap: number | null;
  /** How many times it appeared in the period. */
  appearances: number;
  /** One reader-facing sentence including the scale, so a bare gap figure never stands alone. */
  description: string;
}

/**
 * AI-D4 — gap context for one value, with the scale §13 requires.
 *
 * ══ WHY THE MEDIAN AND THE LONGEST ARE NOT OPTIONAL ══
 *
 * "Has not appeared for 41 drawings" is a number a reader cannot judge. If the median gap is 38 and the longest
 * observed is 96, then 41 is ordinary — and saying so is the single most useful thing this function does, because
 * the alternative is that the reader supplies their own interpretation and it is "so it is due". §13 lists the
 * median and the longest for exactly this reason, and the myth explanation is listed alongside them.
 *
 * `drawsNewestFirst` must be sorted newest first by the caller, so index 0 is the most recent drawing and an index
 * IS a gap. That is the same convention `historicalGaps` uses.
 */
export function gapContext(
  value: number,
  drawsNewestFirst: readonly { values: readonly number[] }[],
): GapContext {
  const hitIndexes: number[] = [];
  drawsNewestFirst.forEach((d, i) => {
    if (d.values.includes(value)) hitIndexes.push(i);
  });

  const appearances = hitIndexes.length;
  const currentGap = appearances === 0 ? null : hitIndexes[0];

  /* Gaps BETWEEN appearances. The current gap is deliberately excluded from the median and the longest: it is not
     a completed interval, and including an in-progress gap would drag both figures toward it. */
  const between: number[] = [];
  for (let i = 1; i < hitIndexes.length; i += 1) between.push(hitIndexes[i] - hitIndexes[i - 1] - 1);

  const sortedGaps = [...between].sort((a, b) => a - b);
  const medianGap = sortedGaps.length === 0
    ? null
    : sortedGaps.length % 2 === 1
      ? sortedGaps[(sortedGaps.length - 1) / 2]
      : Math.round((sortedGaps[sortedGaps.length / 2 - 1] + sortedGaps[sortedGaps.length / 2]) / 2);
  const longestGap = sortedGaps.length === 0 ? null : sortedGaps[sortedGaps.length - 1];

  let description: string;
  if (appearances === 0) {
    description =
      `${value} has not been drawn in the ${drawsNewestFirst.length} drawings on this page.`;
  } else if (medianGap === null || longestGap === null) {
    description =
      `${value} was drawn once in these ${drawsNewestFirst.length} drawings, `
      + `${currentGap === 0 ? "in the most recent one" : `${currentGap} drawings ago`}. `
      + "One appearance is not enough to describe a typical gap.";
  } else {
    /* THE SCALE, in the same sentence as the figure. This is the point of the function. */
    description =
      `${value} was last drawn ${currentGap === 0 ? "in the most recent drawing" : `${currentGap} drawings ago`}. `
      + `Across these ${drawsNewestFirst.length} drawings it appeared ${appearances} times, with a typical gap of `
      + `${medianGap} drawings and a longest gap of ${longestGap}.`;
  }

  return { value, currentGap, medianGap, longestGap, appearances, description };
}

/* ------------------------------------------------------------------ AI-D7 prize and add-on */

export interface AddOnExplanation {
  /** The add-on or multiplier's own published name — "Power Play", "Megaplier", "Fireball", "Double Play". */
  label: string;
  /** How a player obtains it. The question a reader actually has. */
  howObtained: string;
  /** What it does to a prize, in plain language. Never a figure we have not captured. */
  effect: string;
  /** A jurisdiction or rule caveat, where one is governed. §13's "state exception". */
  exception?: string;
}

/**
 * AI-D7 — the add-on and multiplier explanation.
 *
 * ══ WHAT IS DERIVED AND WHAT IS NOT ══
 *
 * The MODE is governed data: `independentlySelected` (Power Play — chosen and paid for), `builtIn` (the Mega
 * Millions multiplier, assigned to each play when the ticket is bought), `separateDrawing` (Double Play — a second
 * drawing on the same ticket), `replacesAValue` (Fireball — it REPLACES one of the drawn numbers and is not a
 * fourth one). This function turns that mode into the sentence a reader needs.
 *
 * The PRIZE FIGURES are not derived and are not stated. Neither flagship game's prize matrix is captured
 * (`source-conflicts.md` Conflict 30), so `effect` describes the MECHANISM — that the prize is multiplied, or that
 * a separate drawing has its own prizes — and never a multiplied amount. Inventing one would be publishing a money
 * figure as fact, which §14 forbids outright.
 */
export function addOnExplanation(input: {
  label: string;
  mode: "independentlySelected" | "builtIn" | "separateDrawing" | "replacesAValue" | "none";
  /** The published multiplier values, where the format records them. */
  values?: readonly number[];
  /** A governed jurisdiction caveat, transcribed. Never inferred. */
  exception?: string | null;
}): AddOnExplanation | null {
  const { label, mode, values } = input;
  if (mode === "none") return null;
  const range = values && values.length > 0
    ? `${Math.min(...values)}× to ${Math.max(...values)}×`
    : null;

  const base: Record<Exclude<typeof mode, "none">, { howObtained: string; effect: string }> = {
    independentlySelected: {
      howObtained: `${label} is a separate option you add when you buy the ticket, at extra cost per play. If you `
        + "did not add it, it does not apply to your ticket.",
      effect: range
        ? `When it applies, it multiplies a non-jackpot prize — ${range}, drawn separately from the numbers.`
        : "When it applies, it multiplies a non-jackpot prize. The jackpot itself is not multiplied.",
    },
    builtIn: {
      howObtained: `${label} is assigned to each play automatically when the ticket is bought — there is nothing to `
        + "add and nothing extra to pay. Your multiplier is printed on your ticket.",
      effect: range
        ? `It multiplies a non-jackpot prize by the value printed on that play — ${range}.`
        : "It multiplies a non-jackpot prize by the value printed on that play. The jackpot is not multiplied.",
    },
    separateDrawing: {
      howObtained: `${label} is a separate drawing using the same numbers on your ticket. You add it when you buy, `
        + "at extra cost per play.",
      effect: "It is drawn separately and has its own prizes, so the same numbers get a second chance at a "
        + "different set of prizes. It is not a second chance at the main jackpot.",
    },
    replacesAValue: {
      howObtained: `${label} is an add-on you choose when you buy the ticket.`,
      effect: `It is not an extra winning number. ${label} REPLACES one of the drawn numbers, giving you additional `
        + "ways to match — which is why it is shown separately from the drawn set rather than beside it.",
    },
  };

  return {
    label,
    ...base[mode],
    ...(input.exception ? { exception: input.exception } : {}),
  };
}
