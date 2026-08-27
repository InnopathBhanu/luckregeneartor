/*
 * THE DETERMINISTIC TICKET CHECK — LRG-FLAGSHIP-002, section FG-02.
 *
 * Authority: BP-04A §16 (*"The deterministic result appears before AI explanation or sign-in"*), §17 (*"AI does
 * not calculate official matches or taxes itself; it calls deterministic tools"*), BP-05C §14 AI-P1 (tool result
 * first, AI explanation second), the frozen Constitution (protect result verification from interruption; deliver
 * value before asking for anything).
 *
 * ══ THE ANSWER A PLAYER GETS CANNOT DEPEND ON A RENDERING DETAIL ══
 *
 * Every comparison lives here, as a pure function with unit tests. The component collects inputs and draws one
 * outcome. That split is the same one the jurisdiction Game Page uses, and it is the reason a checker can be
 * reviewed for correctness at all.
 *
 * ══ WHAT THIS FUNCTION REFUSES TO DO ══
 *
 * It reports **what matched**. It does not report **what that is worth**, because the operator prize matrix is not
 * captured in this build and a prize figure is the single most consequential thing a lottery page can get wrong.
 * `matchLabel` is a description of the match; there is no `prizeDisplay`, and no amount can be added without
 * adding the sourced prize table first.
 *
 * ══ THE MAIN GROUP IS UNORDERED. THE SPECIAL BALL IS A SEPARATE POOL. ══
 *
 * Both flagship games draw an unordered main set, so the comparison is a multiset intersection and the published
 * display order is irrelevant. The special ball comes from its own pool, so a Powerball of 18 does not match a
 * white 18 — a mistake that is easy to make and produces a confidently wrong answer.
 */

export interface TicketLine {
  /** The reader's main numbers. Order is irrelevant and is not preserved in the comparison. */
  main: readonly number[];
  /** The reader's special value. `null` when the game has none or the field is empty. */
  special: number | null;
  /**
   * Whether the reader says their ticket carries the separately purchased multiplier.
   *
   * Only meaningful for an `independentlySelected` multiplier such as Power Play. It changes what the outcome
   * SAYS, never what it counts.
   */
  multiplierBought?: boolean;
}

export interface DrawnLine {
  main: readonly number[];
  special: number | null;
}

export interface CheckOutcome {
  /** Whether every field needed for a comparison was supplied. */
  complete: boolean;
  /** Validation messages, one per problem, in field order. Empty when `complete`. */
  errors: readonly string[];
  mainMatched: number;
  mainCount: number;
  /** `null` when the game has no special ball or none was entered. */
  specialMatched: boolean | null;
  /** Which of the reader's numbers matched, for highlighting. */
  matchedValues: readonly number[];
  /** `3 + Powerball`, `2 of 5`, `No match`. Describes the match; never a prize. */
  matchLabel: string;
  /** The single sentence shown as the headline outcome. */
  statement: string;
  /** The one boundary sentence, always rendered after the outcome. */
  boundary: string;
}

export interface CheckMatrix {
  mainCount: number;
  mainMin: number;
  mainMax: number;
  specialLabel: string | null;
  specialMin: number;
  specialMax: number;
}

const BOUNDARY =
  "Only the lottery that sold the ticket can validate it, and only the official result is final. This compares " +
  "the numbers you typed with the published result shown on this page.";

/** Validate a line against the game matrix. Every problem is reported, not just the first. */
export function validateLine(line: TicketLine, m: CheckMatrix): string[] {
  const errors: string[] = [];
  const supplied = line.main.filter((v) => Number.isInteger(v));

  if (supplied.length !== m.mainCount) {
    errors.push(`Enter all ${m.mainCount} main numbers.`);
  }
  if (supplied.some((v) => v < m.mainMin || v > m.mainMax)) {
    errors.push(`Main numbers must be between ${m.mainMin} and ${m.mainMax}.`);
  }
  if (new Set(supplied).size !== supplied.length) {
    errors.push("Each main number must be different — this game does not draw the same number twice.");
  }
  if (m.specialLabel) {
    if (line.special === null || !Number.isInteger(line.special)) {
      errors.push(`Enter your ${m.specialLabel}.`);
    } else if (line.special < m.specialMin || line.special > m.specialMax) {
      errors.push(`The ${m.specialLabel} must be between ${m.specialMin} and ${m.specialMax}.`);
    }
  }
  return errors;
}

/**
 * Compare one line with one drawing.
 *
 * Returns an incomplete outcome rather than throwing when the line does not validate, so the component can render
 * the problems beside the fields instead of catching an exception.
 */
export function checkLine(
  line: TicketLine,
  drawn: DrawnLine,
  m: CheckMatrix,
  options: { multiplierMode?: "independentlySelected" | "builtIn" | "none"; multiplierLabel?: string } = {},
): CheckOutcome {
  const errors = validateLine(line, m);
  if (errors.length > 0) {
    return {
      complete: false,
      errors,
      mainMatched: 0,
      mainCount: m.mainCount,
      specialMatched: null,
      matchedValues: [],
      matchLabel: "",
      statement: "",
      boundary: BOUNDARY,
    };
  }

  /* Multiset intersection. Both games draw distinct values, so this reduces to a set intersection — written as a
     multiset walk anyway, so a format that does allow repeats cannot silently produce an inflated count. */
  const pool = [...drawn.main];
  const matchedValues: number[] = [];
  for (const v of line.main) {
    const at = pool.indexOf(v);
    if (at !== -1) {
      pool.splice(at, 1);
      matchedValues.push(v);
    }
  }
  const mainMatched = matchedValues.length;

  const specialMatched =
    m.specialLabel && line.special !== null && drawn.special !== null ? line.special === drawn.special : null;

  const matchLabel =
    mainMatched === 0 && specialMatched !== true
      ? "No match"
      : specialMatched === true
        ? `${mainMatched} + ${m.specialLabel}`
        : `${mainMatched} of ${m.mainCount}`;

  const isJackpot = mainMatched === m.mainCount && specialMatched === true;

  let statement: string;
  if (isJackpot) {
    statement =
      `Every number on this line matches the drawing shown, including the ${m.specialLabel}. Take the ticket to ` +
      "the lottery that sold it — only they can validate it.";
  } else if (mainMatched === 0 && specialMatched !== true) {
    statement = "None of these numbers matches the drawing shown.";
  } else {
    const parts: string[] = [];
    if (mainMatched > 0) {
      parts.push(`${mainMatched} of your ${m.mainCount} main numbers (${matchedValues.sort((a, b) => a - b).join(", ")})`);
    }
    if (specialMatched === true) parts.push(`the ${m.specialLabel}`);
    statement = `This line matches ${parts.join(" and ")}.`;
  }

  /*
   * The multiplier sentence describes the reader's own ticket, and it is careful about which game it is in.
   * A separately purchased multiplier only applies if they bought it; a built-in one is printed on the ticket
   * and is not something to look up against the drawing.
   */
  if (!isJackpot && (mainMatched > 0 || specialMatched === true)) {
    if (options.multiplierMode === "independentlySelected" && options.multiplierLabel) {
      statement += line.multiplierBought
        ? ` You said this ticket carries ${options.multiplierLabel}, so the multiplier drawn applies to a non-jackpot prize.`
        : ` Without ${options.multiplierLabel} on the ticket, the multiplier drawn does not apply.`;
    } else if (options.multiplierMode === "builtIn" && options.multiplierLabel) {
      statement += ` Read the multiplier printed on your own ticket — it is assigned per play, not drawn.`;
    }
  }

  return {
    complete: true,
    errors: [],
    mainMatched,
    mainCount: m.mainCount,
    specialMatched,
    matchedValues: matchedValues.sort((a, b) => a - b),
    matchLabel,
    statement,
    boundary: BOUNDARY,
  };
}

/* ------------------------------------------------------------------ history modes */

/**
 * How far back a check runs.
 *
 * The founder instruction requires all three: *"check latest draw · check last 10 draws · check all available
 * history"*. They are a real scan over the connected series, not three labels for the same comparison — which is
 * why `HistoryCheckResult` reports how many drawings were actually searched.
 */
export type CheckMode = "latest" | "last10" | "all";

export const CHECK_MODES: readonly { key: CheckMode; label: string; describe: (n: number) => string }[] =
  Object.freeze([
    { key: "latest", label: "The latest drawing", describe: () => "the most recent published drawing" },
    { key: "last10", label: "The last 10 drawings", describe: (n) => `the last ${n} published drawings` },
    { key: "all", label: "Every published drawing", describe: (n) => `all ${n} published drawings` },
  ]);

/**
 * The modes the PUBLISHED data can actually honour.
 *
 * FGP-008: offering "the last 10 drawings" when one drawing is published would be a control that silently does
 * something other than what it says. With a single published drawing only `latest` is offered, and the checker
 * states that plainly rather than showing two disabled radios.
 */
export function availableCheckModes(publishedDrawings: number) {
  if (publishedDrawings <= 1) return CHECK_MODES.filter((m) => m.key === "latest");
  if (publishedDrawings < 10) return CHECK_MODES.filter((m) => m.key !== "last10");
  return CHECK_MODES;
}

/** One drawing's outcome inside a history scan. */
export interface HistoryCheckHit {
  drawDateIso: string;
  /** Whether this drawing's record is a real published result or an internal review row. */
  provenance: "productionFeed" | "synthetic/internal-review";
  outcome: CheckOutcome;
  /** The Double Play (or equivalent) outcome for the same line, where the drawing has one. */
  secondaryOutcome: CheckOutcome | null;
}

export interface HistoryCheckResult {
  complete: boolean;
  errors: readonly string[];
  mode: CheckMode;
  /** How many drawings were actually compared. */
  searched: number;
  /** Drawings where the line matched at least one main number or the special ball. */
  hits: readonly HistoryCheckHit[];
  /** The best result found, by main numbers then special ball. `null` when nothing matched at all. */
  best: HistoryCheckHit | null;
  /** How many of the hits are real published drawings rather than review rows. */
  productionHits: number;
  statement: string;
  boundary: string;
}

interface HistoryDraw {
  drawDateIso: string;
  main: readonly number[];
  special: number | null;
  secondary: { main: readonly number[]; special: number | null } | null;
  provenance: "productionFeed" | "synthetic/internal-review";
}

/**
 * Run one line against a series of drawings.
 *
 * Only drawings where something matched are returned, because a list of several hundred "no match" rows is not an
 * answer to any question a player has. `searched` still reports the full scan, so the reader knows the scope.
 */
export function checkAgainstHistory(
  line: TicketLine,
  draws: readonly HistoryDraw[],
  m: CheckMatrix,
  mode: CheckMode,
  options: { multiplierMode?: "independentlySelected" | "builtIn" | "none"; multiplierLabel?: string } = {},
): HistoryCheckResult {
  const errors = validateLine(line, m);
  const base = { mode, boundary: BOUNDARY, hits: [], best: null, productionHits: 0 };

  if (errors.length > 0) {
    return { ...base, complete: false, errors, searched: 0, statement: "" };
  }

  const scope = mode === "latest" ? draws.slice(0, 1) : mode === "last10" ? draws.slice(0, 10) : draws;

  const hits: HistoryCheckHit[] = [];
  for (const d of scope) {
    const outcome = checkLine(line, { main: d.main, special: d.special }, m, options);
    const secondaryOutcome = d.secondary
      ? checkLine(line, { main: d.secondary.main, special: d.secondary.special }, m, { multiplierMode: "none" })
      : null;
    const interesting =
      outcome.mainMatched > 0 ||
      outcome.specialMatched === true ||
      (secondaryOutcome?.mainMatched ?? 0) > 0 ||
      secondaryOutcome?.specialMatched === true;
    if (interesting) {
      hits.push({ drawDateIso: d.drawDateIso, provenance: d.provenance, outcome, secondaryOutcome });
    }
  }

  const best =
    [...hits].sort(
      (a, b) =>
        b.outcome.mainMatched - a.outcome.mainMatched ||
        Number(b.outcome.specialMatched === true) - Number(a.outcome.specialMatched === true) ||
        b.drawDateIso.localeCompare(a.drawDateIso),
    )[0] ?? null;

  const productionHits = hits.filter((h) => h.provenance === "productionFeed").length;
  const scopeLabel = CHECK_MODES.find((c) => c.key === mode)!.describe(scope.length);

  const statement =
    hits.length === 0
      ? `This line matched nothing across ${scopeLabel}.`
      : best && best.outcome.mainMatched === m.mainCount && best.outcome.specialMatched === true
        ? `Across ${scopeLabel}, this line matches every number in the drawing on ${best.drawDateIso}. Take the ` +
          `ticket to the lottery that sold it — only they can validate it.`
        : `Across ${scopeLabel}, this line matched something in ${hits.length} of them. Its best result was ` +
          `${best!.outcome.matchLabel} on ${best!.drawDateIso}.`;

  return {
    complete: true,
    errors: [],
    mode,
    searched: scope.length,
    hits,
    best,
    productionHits,
    statement,
    boundary: BOUNDARY,
  };
}
