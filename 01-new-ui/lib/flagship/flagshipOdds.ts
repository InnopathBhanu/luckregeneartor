/*
 * COMBINATORIAL ODDS — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §19 (*"How to Play, Prizes and Odds … Neutral, non-predictive and rule-era-aware"*),
 * the frozen Constitution (*"Distinguish claim types explicitly: verified fact · statistically true historical
 * observation …"*), `CLAUDE.md` §17 (*"Where evidence is missing, label it as missing rather than guessing"*).
 *
 * ══ WHY THIS IS COMPUTED AND NOT TRANSCRIBED ══
 *
 * The repository holds no captured prize-and-odds table for either flagship game. Two responses were available:
 * type the well-known numbers from memory, or derive them. Typing them would be an unsourced factual claim about
 * a real lottery — precisely what §14 forbids — and it would silently rot when a matrix changes.
 *
 * Deriving them does not. The number matrix IS captured and IS `verifiedOfficial` (5 from 1–69 plus 1 from 1–26;
 * 5 from 1–70 plus 1 from 1–24, both quoted from the operator in `floridaFormatRegistry.ts`). The odds of a given
 * match against a fair independent draw follow from the matrix by arithmetic alone. So the odds this module
 * produces are classified `computed`: true by calculation over a verified fact, with the calculation shown.
 *
 * ══ WHAT THIS MODULE DELIBERATELY DOES NOT PRODUCE ══
 *
 * **Prize amounts, and which combinations win a prize at all.** Those are the operator's prize matrix, not a
 * property of the number matrix — no amount of arithmetic yields them, and neither game's table is captured here.
 * They are reported as a gap with the official source named, and the "overall odds of winning any prize" figure
 * is withheld for the same reason: it is a sum over the operator's paying tiers, and summing a tier list we do
 * not hold would be inventing one.
 *
 * ══ ACCURACY ══
 *
 * `C(70,5) * 24 = 290,472,336` and `C(69,5) * 26 = 292,201,338` are both far below `Number.MAX_SAFE_INTEGER`
 * (~9.007e15), and the multiplicative binomial below divides at every step so no intermediate exceeds the result.
 * Every value is therefore exact, not floating-point approximate.
 */

/** `C(n, k)`, computed multiplicatively so intermediates stay small and exact. */
export function combinations(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k)) throw new Error("combinations: n and k must be integers");
  if (k < 0 || n < 0 || k > n) return 0;
  const kk = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= kk; i++) {
    /* Divide at each step: `result` is always C(n, i), an integer, so this never loses precision. */
    result = (result * (n - kk + i)) / i;
  }
  return Math.round(result);
}

/** The drawn shape, reduced to the four numbers the odds depend on. */
export interface OddsMatrix {
  /** How many main values are drawn. */
  mainCount: number;
  /** The size of the main pool — the highest main number, when the pool starts at 1. */
  mainPool: number;
  /** How many special values are drawn. `0` for a game with no special ball. */
  specialCount: number;
  specialPool: number;
}

export interface OddsRow {
  /** How many main values this row matches. */
  mainMatched: number;
  /** Whether the special ball is matched. `null` for a game with no special ball. */
  specialMatched: boolean | null;
  /** Reader-facing label, e.g. `5 + Powerball`. */
  label: string;
  /** Distinct tickets that produce this outcome. */
  ways: number;
  /** The `N` in "1 in N", rounded to two decimals below 1,000 and to a whole number above. */
  oddsOneIn: number;
  /** `1 in 292,201,338` — preformatted so a component never re-derives the presentation. */
  display: string;
  /** True for the single row that matches everything. */
  isJackpot: boolean;
}

function formatOneIn(n: number): string {
  const rounded = n >= 1000 ? Math.round(n) : Math.round(n * 100) / 100;
  return `1 in ${rounded.toLocaleString("en-US")}`;
}

/** Total distinct tickets the matrix can produce. */
export function totalCombinations(m: OddsMatrix): number {
  const main = combinations(m.mainPool, m.mainCount);
  const special = m.specialCount > 0 ? combinations(m.specialPool, m.specialCount) : 1;
  return main * special;
}

/**
 * Every possible match outcome, best first.
 *
 * The main term is hypergeometric: choosing `matched` of the `mainCount` drawn values and the remaining
 * `mainCount - matched` from the `mainPool - mainCount` values that were not drawn. The special term is a simple
 * hit or miss. Rows are emitted for EVERY combination, including the ones that pay nothing — the reader is owed
 * the real distribution, and which rows pay is a separate, unheld fact.
 */
export function oddsTable(m: OddsMatrix, specialLabel: string | null): OddsRow[] {
  const total = totalCombinations(m);
  const rows: OddsRow[] = [];

  const specialOutcomes: (boolean | null)[] = m.specialCount > 0 ? [true, false] : [null];

  for (let matched = m.mainCount; matched >= 0; matched--) {
    for (const specialMatched of specialOutcomes) {
      const mainWays =
        combinations(m.mainCount, matched) * combinations(m.mainPool - m.mainCount, m.mainCount - matched);
      const specialWays =
        specialMatched === null ? 1 : specialMatched ? 1 : combinations(m.specialPool, m.specialCount) - 1;
      const ways = mainWays * specialWays;
      if (ways === 0) continue;

      const label =
        specialMatched === null
          ? `${matched} of ${m.mainCount}`
          : specialMatched
            ? `${matched} + ${specialLabel}`
            : `${matched} of ${m.mainCount}`;

      rows.push({
        mainMatched: matched,
        specialMatched,
        label,
        ways,
        oddsOneIn: total / ways,
        display: formatOneIn(total / ways),
        isJackpot: matched === m.mainCount && specialMatched !== false,
      });
    }
  }

  /* Rarest first: the reader scans from the jackpot down, which is the order every operator publishes. */
  return rows.sort((a, b) => b.oddsOneIn - a.oddsOneIn);
}

/** The jackpot row on its own — the one figure the hero and the AI answers both cite. */
export function jackpotOdds(m: OddsMatrix): OddsRow {
  const table = oddsTable(m, null);
  const jackpot = table.find((r) => r.isJackpot);
  if (!jackpot) throw new Error("jackpotOdds: matrix produced no jackpot row");
  return jackpot;
}

/**
 * The method sentence, rendered beside the table.
 *
 * BP-05C §19 requires every statistical result to state its basis. This is that statement, generated from the
 * matrix so it can never describe a different game than the table above it.
 */
export function oddsMethod(m: OddsMatrix, specialLabel: string | null): string {
  const main = `C(${m.mainPool},${m.mainCount}) = ${combinations(m.mainPool, m.mainCount).toLocaleString("en-US")}`;
  if (m.specialCount === 0) {
    return `Counted from the published number matrix: ${main} possible tickets, each equally likely on a fair independent drawing.`;
  }
  return (
    `Counted from the published number matrix: ${main} ways to choose the main numbers, multiplied by ` +
    `${m.specialPool} possible ${specialLabel ?? "special ball"} values, giving ` +
    `${totalCombinations(m).toLocaleString("en-US")} equally likely tickets on a fair independent drawing.`
  );
}
