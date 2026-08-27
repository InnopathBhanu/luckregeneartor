/*
 * THE GAME RULE CONTRACT — versioned, sourced, era-scoped. LRG-GAME-050.
 *
 * Authority: BP-04B §19 (every result and tool identifies its rule era), §28 (the state-native manifest adds
 * play types, prize table, odds and rule eras), `CLAUDE.md` §14 (date-effective format rules; configuration
 * -driven definitions over scattered conditionals), founder decision 6 of 2026-08-04 (*"Do not publish a
 * partial or era-unknown matrix as current fact"*).
 *
 * ══ WHY THIS IS NOT STATIC COPY ══
 *
 * A payout matrix looks like content and behaves like a contract. It decides what a *checker* tells a player
 * they have won, so a stale figure is not a typo — it is a wrong answer about money. Three properties are
 * therefore mandatory on every era:
 *
 *   1. `sources`     — a primary operator document, with the rule number and the date it was read.
 *   2. `effectiveFrom` / `effectiveTo` — so a 2019 draw is never checked against a 2026 matrix.
 *   3. `verification` — and the publication decision reads THIS, not the presence of data.
 *
 * ══ THE ERA BOUNDARY IS LOAD-BEARING, NOT DECORATIVE ══
 *
 * Florida Pick 3 proves it. The production database export
 * (`04-sample-data/reference-tables/game.csv`, `PRIZE_MATRIX`) carries a complete, real-looking Pick 3
 * payout table — which includes a `1-OFF` play type and carries no FIREBALL rows at all. The Florida Lottery
 * fact sheet dates the change exactly: *"January 18, 2021 The FIREBALL add-on feature for all PICK Daily
 * Games was introduced, and the 1-OFF play style ended."*
 *
 * So that export is not "roughly current" — it is a **closed pre-2021 era**, and publishing it as current
 * fact would advertise a play type a Florida player can no longer buy. The era model is what makes that
 * detectable instead of plausible. The closed era is retained (`retired: true`) because historical results
 * must still resolve against the rules that applied when they were drawn.
 *
 * ══ WHAT THIS FILE DELIBERATELY CANNOT EXPRESS ══
 *
 *   - A prize with no wager. Every payout is keyed by wager, because "Straight pays $500" is only true for a
 *     $1.00 play and a 50-cent play wins $250.
 *   - An unsourced era. `sources` is required and non-empty.
 *   - A "current" era with no `effectiveFrom`.
 */

/* ------------------------------------------------------------------ provenance */

/** A primary operator document. Secondary aggregators are not accepted here. */
export interface RuleDocument {
  /** The operator's own rule/document number where one exists, e.g. `53ER24-56`. */
  ruleNumber: string | null;
  title: string;
  url: string;
  /** ISO date this document was read. Re-verification is a dated act, not an assumption. */
  accessed: string;
  /** A short quotation or close paraphrase of the passage that supports the data. */
  supports: string;
}

export type RuleVerification =
  /** Read from a primary operator document within `sources`. Publishable. */
  | "verifiedOfficial"
  /** Derived from a production export with no operator confirmation. NOT publishable as current fact. */
  | "productionExportOnly"
  /** Known superseded. Retained for historical draws only. */
  | "retiredEra";

/* ------------------------------------------------------------------ wagers and play types */

/**
 * One purchasable wager.
 *
 * `amountCents` is an integer so 50-cent and $1.00 plays sort and compare without float error, and so a
 * payout table can be keyed by an exact value rather than by a display string.
 */
export interface WagerOption {
  amountCents: number;
  label: string;
  /** True when this is the wager a terminal defaults to. Sourced, never assumed. */
  isDefault?: boolean;
}

/** How many distinct orderings a set of digits has — the basis of every Box and Combo prize. */
export type BoxWays = "3-way" | "6-way" | "not-applicable";

export interface PlayTypeRule {
  key: string;
  label: string;
  /** Plain-language definition in ordinary player language. No software or analytics vocabulary. */
  definition: string;
  /** An illustrative pattern, e.g. `123` or `12x`. Never a real recent result. */
  examplePattern: string;
  /**
   * Which digit shapes this play type accepts.
   *   `any`       — any three digits
   *   `hasPair`   — exactly two identical digits (a 3-way shape)
   *   `allUnique` — three different digits (a 6-way shape)
   *   `pairOnly`  — only two positions are selected
   */
  digitShape: "any" | "hasPair" | "allUnique" | "pairOnly";
  /** Which positions matter, for a position-aware comparison. `null` means all positions. */
  positions: readonly number[] | null;
  /** Whether order matters for a match. */
  orderMatters: boolean;
}

/* ------------------------------------------------------------------ payouts */

/**
 * One payout row.
 *
 * `prizeByWagerCents` maps a wager to its prize DISPLAY string, not a number: the operator publishes
 * `$330.00` for a Straight/Box straight hit and `$80.00` for its box hit, and a single numeric field cannot
 * carry a two-outcome prize honestly. `splitPrize` names that case explicitly.
 */
export interface PayoutRow {
  playTypeKey: string;
  label: string;
  examplePattern: string;
  /** wager amount in cents → prize display. A wager absent from this map is not offered for this play type. */
  prizeByWagerCents: Readonly<Record<number, string>>;
  /**
   * Present only where a single play can pay two different amounts (Straight/Box). The keys mirror
   * `prizeByWagerCents`; each value describes both outcomes.
   */
  splitPrize?: Readonly<Record<number, { exactOrder: string; anyOrder: string }>>;
  /** The operator's published odds string, e.g. `1 in 1,000`. Never computed by us. */
  oddsDisplay: string;
  /**
   * Total ticket cost when it differs from the wager — Combo covers several straight plays, so a 50-cent
   * 6-way Combo costs $3.00. `null` when cost equals the wager.
   */
  ticketCostByWagerCents?: Readonly<Record<number, string>>;
}

/**
 * An add-on such as FIREBALL.
 *
 * It carries its OWN payout table and its OWN effective dates, because an add-on can be introduced or
 * withdrawn without the base game changing at all — which is exactly what happened in Florida in 2021.
 */
export interface AddOnRule {
  key: string;
  label: string;
  definition: string;
  /** How buying it changes the ticket price. */
  priceEffect: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  payouts: readonly PayoutRow[];
  /** Maximum number of add-on wins per play type key. The operator publishes this; we never infer it. */
  maxWinsByPlayType: Readonly<Record<string, number>>;
  sources: readonly RuleDocument[];
}

/* ------------------------------------------------------------------ the era */

export interface GameRuleEra {
  /** Format registry key, shared with the State result-format registry. */
  gameKey: string;
  eraId: string;
  effectiveFrom: string;
  /** `null` for the current era. */
  effectiveTo: string | null;
  verification: RuleVerification;
  /** True when this era is closed and retained only so historical draws resolve correctly. */
  retired: boolean;

  /*
   * ══ THE SELECTION SHAPE IS NOT DECLARED HERE ══
   *
   * `selectionKind`, `selectionCount`, `selectionMin`, `selectionMax` and `repeatsAllowed` used to live on this
   * interface, and every Game Page tool read them. LRG-GAME-052 removed them, because they were a SECOND
   * declaration of what `BallGroupSpec` already says — a competing format definition — with two consequences:
   * the two sources could disagree about how many values a game draws, and a single flat group could not
   * express a game with a special ball, which is why the tools were digit-only.
   *
   * The division now is:
   *
   *   `ResultFormatVersion` / `BallGroupSpec`  →  SHAPE: groups, counts, ranges, value types, match ordering,
   *                                               repeat rules, independent pools, date-effective versions.
   *   this contract                            →  RULES: play types, wagers, payouts, odds, add-on prize
   *                                               tables, effective eras.
   *
   * Read the shape through `formatProfile()`.
   */

  wagers: readonly WagerOption[];
  playTypes: readonly PlayTypeRule[];
  payouts: readonly PayoutRow[];
  addOns: readonly AddOnRule[];

  /** Ticket price statement, in the operator's own terms. */
  ticketPrice: string | null;
  /** Advance Play, in the operator's own terms. `null` when unverified — never a guess. */
  advancePlay: string | null;

  sources: readonly RuleDocument[];
  /** Anything the operator does not publish, named rather than filled in. */
  absent: readonly { field: string; reason: string }[];
}

/* ------------------------------------------------------------------ selection */

class RuleEraError extends Error {
  constructor(gameKey: string, problem: string) {
    super(`Game rule era for "${gameKey}": ${problem}`);
    this.name = "RuleEraError";
  }
}

/**
 * Validate at module load, so a malformed era fails the build rather than a page.
 *
 * The checks are the three properties the file header commits to, plus the two things that would make a
 * payout table quietly wrong: a payout naming a play type that does not exist, and a payout priced against a
 * wager the era does not sell.
 */
export function validateRuleEra(era: GameRuleEra): GameRuleEra {
  if (!era.effectiveFrom) throw new RuleEraError(era.gameKey, "has no effectiveFrom");
  if (era.sources.length === 0) throw new RuleEraError(era.gameKey, "has no primary source");
  if (era.verification === "verifiedOfficial" && era.sources.every((s) => !s.ruleNumber && !s.url)) {
    throw new RuleEraError(era.gameKey, "claims verifiedOfficial with no identifiable document");
  }
  if (era.effectiveTo && era.effectiveTo < era.effectiveFrom) {
    throw new RuleEraError(era.gameKey, "ends before it starts");
  }
  if (era.effectiveTo !== null && !era.retired) {
    throw new RuleEraError(era.gameKey, "is closed but not marked retired");
  }

  const playKeys = new Set(era.playTypes.map((p) => p.key));
  const wagerCents = new Set(era.wagers.map((w) => w.amountCents));
  const checkRows = (rows: readonly PayoutRow[], where: string) => {
    for (const r of rows) {
      if (!playKeys.has(r.playTypeKey)) {
        throw new RuleEraError(era.gameKey, `${where} payout "${r.label}" names unknown play type "${r.playTypeKey}"`);
      }
      const keys = Object.keys(r.prizeByWagerCents).map(Number);
      if (keys.length === 0) throw new RuleEraError(era.gameKey, `${where} payout "${r.label}" has no priced wager`);
      for (const k of keys) {
        if (!wagerCents.has(k)) {
          throw new RuleEraError(era.gameKey, `${where} payout "${r.label}" prices wager ${k}c, which this era does not sell`);
        }
      }
    }
  };
  checkRows(era.payouts, "base");
  for (const a of era.addOns) {
    if (a.payouts.length === 0) throw new RuleEraError(era.gameKey, `add-on "${a.key}" has no payouts`);
    if (a.sources.length === 0) throw new RuleEraError(era.gameKey, `add-on "${a.key}" has no primary source`);
    checkRows(a.payouts, `add-on ${a.key}`);
  }
  return era;
}

/**
 * The era that applied on `onDateIso` — the rule-era-aware selection BP-04B §19 requires.
 *
 * Selecting by DRAW date rather than by "today" is the whole point: checking a 2020 ticket must use the 2020
 * rules, including a play type that no longer exists.
 */
export function selectRuleEra(
  eras: readonly GameRuleEra[],
  gameKey: string,
  onDateIso: string,
): GameRuleEra | undefined {
  return eras.find(
    (e) =>
      e.gameKey === gameKey &&
      e.effectiveFrom <= onDateIso &&
      (e.effectiveTo === null || onDateIso <= e.effectiveTo),
  );
}

/** The current era — the only one a public page may describe as how the game works now. */
export function currentRuleEra(eras: readonly GameRuleEra[], gameKey: string): GameRuleEra | undefined {
  return eras.find((e) => e.gameKey === gameKey && e.effectiveTo === null && !e.retired);
}

/**
 * Whether an era may be published as CURRENT fact.
 *
 * Founder decision 6: a partial or era-unknown matrix must not be published as current. So a
 * `productionExportOnly` era is loadable, checkable and inspectable — and unpublishable.
 */
export function eraPublishableAsCurrent(era: GameRuleEra | undefined): boolean {
  return era !== undefined && era.verification === "verifiedOfficial" && era.effectiveTo === null && !era.retired;
}

/** The add-ons in force on a date. An add-on outside its own window is not offered, even inside a live era. */
export function activeAddOns(era: GameRuleEra, onDateIso: string): readonly AddOnRule[] {
  return era.addOns.filter(
    (a) => a.effectiveFrom <= onDateIso && (a.effectiveTo === null || onDateIso <= a.effectiveTo),
  );
}
