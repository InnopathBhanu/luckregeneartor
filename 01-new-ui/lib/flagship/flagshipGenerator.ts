/*
 * THE NUMBER GENERATOR — LRG-FLAGSHIP-002, inside section FG-07.
 *
 * Authority: BP-04A §21 (Quick Pick / Generator among the lead tools), BP-05C §11 (*"Basic Quick Pick — Complete
 * … save … advanced constraints"*), the frozen Constitution (an entertainment tool, clearly classified; language
 * MUST NOT imply that generation changes the odds of a fair independent drawing, and MUST NOT say "increase your
 * chances").
 *
 * ══ THE ONE THING THIS TOOL MUST NEVER BECOME ══
 *
 * A generator is where a lottery site most easily starts lying, because a "balanced" or "smart" pick sounds like
 * an advantage. It is not one, and `GENERATOR_BOUNDARY` says so in the tool, once, prominently — not in a
 * footnote. Every mode below is a **preference about what you want your line to look like**. None changes what
 * any drawing will do, and the copy for each says which it is.
 *
 * ══ RANDOMNESS ══
 *
 * `crypto.getRandomValues` with rejection sampling, so the distribution is uniform over the pool. `Math.random()`
 * is not used, and there is **no silent fallback**: if no CSPRNG exists, the generator reports that it is
 * unavailable rather than quietly producing biased output. This mirrors the jurisdiction Game Page's generator,
 * where the same rule was set.
 *
 * ══ MODES ══
 *
 *   `random`   — a straight Quick Pick, uniform over the pool.
 *   `balanced` — rejection-samples until the line meets the odd/even and low/high preferences the reader chose.
 *                It is a filter on what the TOOL returns, nothing more.
 *
 * Locked values are honoured in both: a reader keeping 7 and 23 gets lines containing them, and the remaining
 * positions are drawn from the rest of the pool.
 */

export interface GeneratorMatrix {
  mainCount: number;
  mainMin: number;
  mainMax: number;
  specialLabel: string | null;
  specialMin: number;
  specialMax: number;
}

export interface GeneratorOptions {
  mode: "random" | "balanced";
  /** Numbers the reader wants kept in every line. Validated against the matrix before use. */
  lockedMain: readonly number[];
  /** The reader's kept special value, or `null` to draw it. */
  lockedSpecial: number | null;
  setCount: number;
  /** Balanced mode only: how many of the main numbers should be odd. `null` leaves it free. */
  targetOdd: number | null;
  /** Balanced mode only: how many should fall in the low half. `null` leaves it free. */
  targetLow: number | null;
  /**
   * Exclude values drawn in the most recent `excludeRecentDraws` drawings.
   *
   * A PREFERENCE, and the copy says so. Avoiding a recently drawn number does not make a line more likely to
   * win — every line has the same chance — but it is a thing players genuinely want the tool to do, and refusing
   * to offer it while pretending the reason is mathematical would be its own dishonesty.
   */
  excludeRecentDraws: number;
  /**
   * Refuse a line whose every value is 31 or below.
   *
   * Again a preference about prize SHARING, not about chances. See `dateRangeNote`.
   */
  avoidDateHeavy: boolean;
}

export interface GeneratedLine {
  main: number[];
  special: number | null;
  odd: number;
  even: number;
  low: number;
  high: number;
  /** How many of the main numbers are 31 or below — the range a date can produce. */
  dateRangeCount: number;
}

export interface GeneratorResult {
  lines: readonly GeneratedLine[];
  /** A description of what was produced and under which preferences. Never a claim about outcomes. */
  note: string;
  /** Set when balanced mode could not satisfy the targets. The lines are still returned, unfiltered. */
  relaxed: string | null;
}

/** The most lines the public tool returns at once. More is a signed-in continuation, not a bigger number here. */
export const MAX_SETS = 5;

/** Attempts before balanced mode gives up and returns unfiltered lines with an explanation. */
const BALANCE_ATTEMPTS = 400;

export const GENERATOR_BOUNDARY =
  "This is an entertainment tool. Every line it produces has exactly the same chance as any other, and generating " +
  "numbers does not change the odds of a fair independent drawing. No system can predict winning numbers.";

/**
 * The birthday-heavy note.
 *
 * Not a warning about your chances — picking dates does not lower them. It is a note about how a JACKPOT IS
 * SHARED: lines drawn from calendar dates cluster in 1–31, so a winning line in that range is statistically more
 * likely to be shared with other winners. That is a true statement about prize splitting and it is phrased as
 * one, which is the only honest version of this widely-repeated tip.
 */
export function dateRangeNote(line: GeneratedLine, mainMax: number): string | null {
  if (mainMax <= 31) return null;
  if (line.dateRangeCount < line.main.length) return null;
  return (
    "Every number in this line is 31 or below — the range birthdays and anniversaries fall in. That does not make " +
    "the line less likely to be drawn. It does mean more people tend to play lines like it, so a top prize won " +
    "with one is more often shared."
  );
}

/* ------------------------------------------------------------------ randomness */

function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) throw new Error("randomInt: empty range");
  const g = globalThis.crypto;
  if (!g || typeof g.getRandomValues !== "function") {
    throw new Error(
      "Number generation is unavailable here because this environment provides no cryptographic random source. " +
        "No lower-quality source is substituted.",
    );
  }
  /* Rejection sampling to the largest multiple of `range`, so no value is favoured by the modulo. */
  const limit = Math.floor(0xffffffff / range) * range;
  const buf = new Uint32Array(1);
  let v: number;
  do {
    g.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return min + (v % range);
}

function drawDistinct(count: number, min: number, max: number, already: readonly number[]): number[] {
  const chosen = new Set(already);
  const out: number[] = [];
  while (out.length < count) {
    const v = randomInt(min, max);
    if (chosen.has(v)) continue;
    chosen.add(v);
    out.push(v);
  }
  return out;
}

/* ------------------------------------------------------------------ shape */

function describe(main: readonly number[], special: number | null, mainMax: number): GeneratedLine {
  const sorted = [...main].sort((a, b) => a - b);
  const odd = sorted.filter((v) => v % 2 === 1).length;
  const boundary = Math.floor(mainMax / 2);
  const low = sorted.filter((v) => v <= boundary).length;
  return {
    main: sorted,
    special,
    odd,
    even: sorted.length - odd,
    low,
    high: sorted.length - low,
    dateRangeCount: sorted.filter((v) => v <= 31).length,
  };
}

/** Validate the reader's locked values before any line is drawn. Returns messages, empty when usable. */
export function validateLocks(options: GeneratorOptions, m: GeneratorMatrix): string[] {
  const errors: string[] = [];
  const locked = options.lockedMain;
  if (locked.length > m.mainCount) {
    errors.push(`You can keep at most ${m.mainCount} main numbers — that is how many are drawn.`);
  }
  if (locked.some((v) => v < m.mainMin || v > m.mainMax)) {
    errors.push(`Kept numbers must be between ${m.mainMin} and ${m.mainMax}.`);
  }
  if (new Set(locked).size !== locked.length) {
    errors.push("Each kept number must be different.");
  }
  if (
    options.lockedSpecial !== null &&
    m.specialLabel &&
    (options.lockedSpecial < m.specialMin || options.lockedSpecial > m.specialMax)
  ) {
    errors.push(`A kept ${m.specialLabel} must be between ${m.specialMin} and ${m.specialMax}.`);
  }
  if (options.targetOdd !== null && (options.targetOdd < 0 || options.targetOdd > m.mainCount)) {
    errors.push(`The odd count must be between 0 and ${m.mainCount}.`);
  }
  if (options.targetLow !== null && (options.targetLow < 0 || options.targetLow > m.mainCount)) {
    errors.push(`The low count must be between 0 and ${m.mainCount}.`);
  }
  return errors;
}

/**
 * Generate lines.
 *
 * Throws only when there is no cryptographic random source. Every other problem — an impossible balance target, a
 * full set of locked numbers — is reported in the result rather than as an exception, because each of them is a
 * reader input and deserves an explanation rather than a stack trace.
 */
export function generateLines(
  m: GeneratorMatrix,
  options: GeneratorOptions,
  /** Recent drawings, newest first. Only read when `excludeRecentDraws` is greater than zero. */
  recentDraws: readonly (readonly number[])[] = [],
): GeneratorResult {
  const setCount = Math.max(1, Math.min(MAX_SETS, Math.floor(options.setCount)));
  const locked = [...new Set(options.lockedMain)].filter((v) => v >= m.mainMin && v <= m.mainMax);
  const toDraw = Math.max(0, m.mainCount - locked.length);

  /*
   * Values to avoid, and the pool that remains.
   *
   * A kept number always wins over an exclusion: the reader asked for it explicitly, and silently dropping it
   * would be the tool overriding a direct instruction. The exclusion is also abandoned rather than enforced when
   * it would leave too few values to draw from, with the reason reported.
   */
  const excluded = new Set<number>();
  if (options.excludeRecentDraws > 0) {
    for (const draw of recentDraws.slice(0, options.excludeRecentDraws)) {
      for (const v of draw) if (!locked.includes(v)) excluded.add(v);
    }
  }
  const remaining = m.mainMax - m.mainMin + 1 - excluded.size - locked.length;
  const exclusionUsable = remaining >= toDraw;
  const activeExclusions = exclusionUsable ? excluded : new Set<number>();

  const one = (): GeneratedLine => {
    const main = [...locked, ...drawDistinct(toDraw, m.mainMin, m.mainMax, [...locked, ...activeExclusions])];
    const special =
      m.specialLabel === null
        ? null
        : options.lockedSpecial !== null
          ? options.lockedSpecial
          : randomInt(m.specialMin, m.specialMax);
    return describe(main, special, m.mainMax);
  };

  const satisfies = (line: GeneratedLine): boolean => {
    if (options.targetOdd !== null && line.odd !== options.targetOdd) return false;
    if (options.targetLow !== null && line.low !== options.targetLow) return false;
    if (options.avoidDateHeavy && m.mainMax > 31 && line.dateRangeCount === line.main.length) return false;
    return true;
  };

  const lines: GeneratedLine[] = [];
  let relaxed: string | null = null;

  for (let i = 0; i < setCount; i++) {
    const constrained =
      options.targetOdd !== null || options.targetLow !== null || options.avoidDateHeavy;
    if (!constrained) {
      lines.push(one());
      continue;
    }
    let attempt = 0;
    let line = one();
    while (!satisfies(line) && attempt < BALANCE_ATTEMPTS) {
      line = one();
      attempt++;
    }
    if (!satisfies(line)) {
      relaxed =
        "Those preferences could not all be met with the numbers you kept, so these lines are unfiltered. " +
        "Change the kept numbers or the preferences and try again.";
    }
    lines.push(line);
  }

  const parts = [`${lines.length} ${lines.length === 1 ? "line" : "lines"}`];
  if (locked.length > 0) parts.push(`keeping ${locked.sort((a, b) => a - b).join(", ")}`);
  if (options.lockedSpecial !== null && m.specialLabel) {
    parts.push(`keeping ${m.specialLabel} ${options.lockedSpecial}`);
  }
  const wanted: string[] = [];
  if (options.targetOdd !== null) wanted.push(`${options.targetOdd} odd`);
  if (options.targetLow !== null) wanted.push(`${options.targetLow} in the low half`);
  if (options.avoidDateHeavy) wanted.push("at least one number above 31");
  if (wanted.length > 0) parts.push(`aiming for ${wanted.join(" and ")}`);
  if (activeExclusions.size > 0) {
    parts.push(`avoiding the ${activeExclusions.size} numbers drawn in the last ${options.excludeRecentDraws} drawings`);
  }

  const notes: string[] = [`Generated ${parts.join(", ")}. Nothing is saved unless you ask for it.`];
  if (options.excludeRecentDraws > 0 && !exclusionUsable) {
    notes.push(
      "Excluding that many recent drawings would leave too few numbers to draw from, so the exclusion was not " +
        "applied.",
    );
  }
  if (activeExclusions.size > 0) {
    notes.push(
      "Avoiding recently drawn numbers is a preference about the line you want, not an advantage — a number " +
        "drawn last week is exactly as likely as any other.",
    );
  }

  return { lines, note: notes.join(" "), relaxed };
}
