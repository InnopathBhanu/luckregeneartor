/*
 * RESULT FORMATS FOR THE REPRESENTATIVE PREVIEW STATES — LRG-STATE-047.
 *
 * Authority: `resultFormatContract.ts` (the governed contract), `FD-S-10` ("cross-State rollout must not
 * enable a game whose format is unverified"), LRG-STATE-047 RESULT-FORMAT COVERAGE.
 *
 * ══ THE EVIDENCE RULE THIS FILE FOLLOWS ══
 *
 * A format appears here only when TWO INDEPENDENT PRODUCTION-DERIVED SOURCES determine it and AGREE:
 *
 *   [G1] `04-sample-data/reference-tables/game.csv` — the production database export. `PLAY_TYPE` gives the
 *        drawn structure (`3-Digits`, `5/39`, `6/47`, `5/47+1/27`, `1/15`, `4-Digits+1`) and `NUM_OF_BALLS`
 *        gives the count independently of it.
 *   [G2] `04-sample-data/source-xml/latest-results-lc.xml` — the production results feed. The actual
 *        `numbers-str` shape for that game, including any named special ball.
 *
 * Where the two agree, the format is DERIVED, and it is recorded as `provisionalProductionDerived`.
 *
 * WHAT `provisionalProductionDerived` MEANS, and why it is not a loophole. The contract reserves
 * `verifiedOfficial` for a rule read from the operator's own published page, and `formatPublicationFindings`
 * refuses to let anything else reach a public page. These formats therefore render in the GUARDED PREVIEW
 * and are blocked from publication by the same gate that blocks LRG-STATE-025's cloned Florida definitions.
 * That is the honest position: the shape is production-derived, the operator's own wording is not verified,
 * and the difference is recorded rather than papered over.
 *
 * ══ WHY THERE ARE NO `RuleSource` ENTRIES ══
 *
 * `RuleSource.url` is contractually "Official operator or game-owner URL". This task may not browse, and no
 * operator page for these four States is recorded anywhere in the repository. Putting a repository file path
 * in that field would be a false citation, so `sources` is EMPTY and the publication gate reports
 * "no primary official rule source recorded" for every format below. The finding is correct and is left
 * standing — it is precisely the work that must happen before any of these States goes public.
 *
 * ══ WHY PRIZE SEMANTICS ARE `unavailable` ══
 *
 * The feed carries a money figure for most of these games. What it does NOT carry is whether that figure is
 * an estimated annuitized jackpot, a published cash value, a fixed top prize or a pari-mutuel estimate —
 * which is the entire reason `PrizeSpec.kind` exists. An unlabelled money string beside a result is the
 * defect the contract was written to prevent, so the prize is recorded as unavailable and no figure renders.
 * Powerball and Mega Millions are unaffected: their formats are verified and live in the shared registry.
 *
 * ══ THE THREE GAMES DELIBERATELY ABSENT ══
 *
 * Each is a real production game that this task refuses to render, with the reason recorded rather than the
 * game quietly dropped. They are reported as format gaps, and `FORMAT_GAPS` below is what the tests and the
 * review document read.
 */

import type {
  BallGroupSpec, MultiplierSpec, PrizeSpec, ResultFormatVersion, SecondaryDrawSpec,
} from "./resultFormatContract";
import {
  orderedDigitPositions, unorderedNumberPool, singleValueGroup,
} from "./resultFormatContract";
import { FLORIDA_FORMAT_VERSIONS } from "./floridaFormatRegistry";

/* ------------------------------------------------------------------ helpers */

/*
 * The main drawn group, in three named forms.
 *
 * MATCHING SEMANTICS ARE DECLARED BY NAME, NOT DERIVED (LRG-GAME-053). One `MAIN(count, min, max, valueType)`
 * helper used to compute `matchOrdered`/`repeatsAllowed` from `valueType`. Every field was populated, so nothing
 * reported a gap — and the values were still a derivation from a PRESENTATION property. "Renders as a digit" is
 * not the published claim "a Straight play matches by position".
 *
 * The semantics now live in the shared constructors in `resultFormatContract.ts`, which both this registry and
 * the Florida one call, so the two cannot drift. Each call site names the rule it asserts.
 */

/** A positional digit game: matched by position, digits may repeat. */
const DIGITS = (count: number, min = 0, max = 9): BallGroupSpec =>
  orderedDigitPositions({
    order: 0, label: null, valueType: "digit", count, min, max,
    differentSet: false, colorToken: "ball.default", visualRole: "main",
  });

/** A single-pool ball draw: matched as a SET in any order, no value can repeat. */
const POOL = (count: number, min: number, max: number): BallGroupSpec =>
  unorderedNumberPool({
    order: 0, label: null, valueType: "number", count, min, max,
    differentSet: false, colorToken: "ball.default", visualRole: "main",
  });

/** A one-number main group — a Cash Pop-style game picks a single number from a pool. */
const SINGLE = (min: number, max: number): BallGroupSpec =>
  singleValueGroup({
    order: 0, label: null, valueType: "number", count: 1, min, max,
    differentSet: false, colorToken: "ball.default", visualRole: "main",
  });

/* A single-value special group. Order and repetition are unobservable in a group of one, and the constructor
   declares that rather than leaving it to a default. */
const SPECIAL = (
  order: number, label: string, min: number, max: number, colorToken: string,
): BallGroupSpec =>
  singleValueGroup({
    order, label, valueType: "number", count: 1, min, max,
    differentSet: true, colorToken, accessibleLabel: label, visualRole: "special",
  });

const NO_MULTIPLIER: MultiplierSpec = { kind: "notApplicable", sources: [] };

/** No verified prize semantics. An absence needs no source, and the gate accepts that explicitly. */
const PRIZE_UNAVAILABLE: PrizeSpec = { kind: "unavailable", cashValueAvailable: false, sources: [] };

/**
 * Fireball, as Virginia's feed spells it.
 *
 * The MECHANIC is not re-derived: it is the same officially drawn wild card the Florida registry documents,
 * and the note says so without claiming a Virginia source we do not have. `[G1]` gives `PLAY_TYPE`
 * `N-Digits+1` and `[G2]` shows a `FIREBALL:` group, so the SHAPE is determined; only the operator's own
 * wording is unverified, which is what `provisionalProductionDerived` records.
 */
const fireballVA = (digits: number) => ({
  key: "fireball",
  label: "Fireball",
  addOnClass: "drawn" as const,
  drawnGroup: {
    order: 1, label: "Fireball", valueType: "digit" as const, count: 1, min: 0, max: 9,
    differentSet: true, colorToken: "ball.fireball", accessibleLabel: "Fireball",
    visualRole: "addOn" as const,
    /* One value: order and repetition are unobservable, so both are declared rather than left to a default. */
    matchOrdered: false, repeatsAllowed: false,
  },
  mechanicNote:
    `Drawn wild card. It REPLACES one of the ${digits} drawn numbers to create additional winning ` +
    "combinations — it is not an extra main number and must never render inside the main group. The " +
    "Virginia Lottery's own published wording for this rule is NOT verified in this task.",
  sources: [],
});

/** A Double Play style secondary drawing, structured from the feed's own trailing group. */
const doublePlay = (groups: readonly BallGroupSpec[]): SecondaryDrawSpec => ({
  key: "double-play",
  label: "Double Play",
  groups,
  prize: PRIZE_UNAVAILABLE,
  timingNote:
    "A separate labelled drawing carried in the same feed record. Its published timing and prize structure " +
    "are not verified in this task, so it renders as its own labelled result and nothing more.",
  sources: [],
});

const V = (
  o: Omit<ResultFormatVersion, "schemaVersion" | "compatibleStatuses" | "verification" | "sources">,
): ResultFormatVersion => ({
  schemaVersion: "1.0-provisional",
  compatibleStatuses: ["verified", "awaiting", "pending", "delayed", "cancelled", "corrected", "closed"],
  verification: "provisionalProductionDerived",
  sources: [],
  ...o,
});

/* ------------------------------------------------------------------ Michigan */

export const MI_FORMAT_VERSIONS: readonly ResultFormatVersion[] = [
  V({
    formatId: 397, gameKey: "mi-daily-3", displayName: "Daily 3",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] PLAY_TYPE 3-Digits, NUM_OF_BALLS 3. [G2] "7-0-2". */
    primaryGroups: [DIGITS(3)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 399, gameKey: "mi-daily-4", displayName: "Daily 4",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 4-Digits / 4. [G2] "2-0-2-0". */
    primaryGroups: [DIGITS(4)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 401, gameKey: "mi-fantasy-5", displayName: "Fantasy 5",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5/39 / 5. [G2] "6-7-9-13-17, Double Play: 18-25-28-32-39". */
    primaryGroups: [POOL(5, 1, 39)],
    multiplier: NO_MULTIPLIER, addOns: [],
    secondaryDraws: [doublePlay([POOL(5, 1, 39)])],
    prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 517, gameKey: "mi-classic-lotto-47", displayName: "Classic Lotto 47",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 6/47 / 6. [G2] "12-15-20-30-37-39, Double Play: 1-17-18-28-31-38". */
    primaryGroups: [POOL(6, 1, 47)],
    multiplier: NO_MULTIPLIER, addOns: [],
    secondaryDraws: [doublePlay([POOL(6, 1, 47)])],
    prize: PRIZE_UNAVAILABLE,
  }),
];

/* ------------------------------------------------------------------ Virginia */

export const VA_FORMAT_VERSIONS: readonly ResultFormatVersion[] = [
  V({
    formatId: 488, gameKey: "va-pick-3", displayName: "Pick 3",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 3-Digits+1 / 3+1. [G2] "7-5-4, FIREBALL: 9". */
    primaryGroups: [DIGITS(3)],
    multiplier: NO_MULTIPLIER, addOns: [fireballVA(3)], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 490, gameKey: "va-pick-4", displayName: "Pick 4",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 4-Digits+1 / 4+1. [G2] "6-3-8-4, FIREBALL: 4". */
    primaryGroups: [DIGITS(4)],
    multiplier: NO_MULTIPLIER, addOns: [fireballVA(4)], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 641, gameKey: "va-pick-5", displayName: "Pick 5",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5-Digits+1 / 5+1. [G2] "9-8-1-5-2, Fireball: 3". */
    primaryGroups: [DIGITS(5)],
    multiplier: NO_MULTIPLIER, addOns: [fireballVA(5)], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 542, gameKey: "va-cash-5", displayName: "Cash 5",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5/45 / 5. [G2] "2-5-16-23-45". */
    primaryGroups: [POOL(5, 1, 45)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 631, gameKey: "va-cash-pop", displayName: "Cash Pop",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 1/15 / 1. [G2] single value, e.g. "4". */
    primaryGroups: [SINGLE(1, 15)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 574, gameKey: "va-bank-a-million", displayName: "Bank a Million",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 6/40 / 6+1. [G2] "1-2-14-26-36-37, Bonus: 8". The special ball's own range is NOT determined by
       either source — `NUM_OF_BALLS` gives its count, not its pool — so it is recorded at the main pool's
       range and the format stays provisional. */
    primaryGroups: [POOL(6, 1, 40), SPECIAL(1, "Bonus", 1, 40, "ball.powerball")],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
];

/* ------------------------------------------------------------------ California */

export const CA_FORMAT_VERSIONS: readonly ResultFormatVersion[] = [
  V({
    formatId: 311, gameKey: "ca-daily-3", displayName: "Daily 3",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 3-Digits / 3. [G2] "1-3-1". */
    primaryGroups: [DIGITS(3)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 313, gameKey: "ca-daily-4", displayName: "Daily 4",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 4-Digits / 4. [G2] "3-1-3-1". */
    primaryGroups: [DIGITS(4)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 314, gameKey: "ca-fantasy-5", displayName: "Fantasy 5",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5/39 / 5. [G2] "11-23-25-28-36". */
    primaryGroups: [POOL(5, 1, 39)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 316, gameKey: "ca-superlotto-plus", displayName: "SuperLotto Plus",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5/47+1/27 / 5+1 — the special pool's range IS published in PLAY_TYPE here. [G2]
       "18-22-28-33-38, Mega Ball: 15". The feed's own label is used verbatim rather than a corrected one. */
    primaryGroups: [POOL(5, 1, 47), SPECIAL(1, "Mega Ball", 1, 27, "ball.megaball")],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
];

/* ------------------------------------------------------------------ Maryland */

export const MD_FORMAT_VERSIONS: readonly ResultFormatVersion[] = [
  V({
    formatId: 388, gameKey: "md-pick-3", displayName: "Pick 3",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 3-Digits / 3. [G2] "4-9-7". */
    primaryGroups: [DIGITS(3)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 390, gameKey: "md-pick-4", displayName: "Pick 4",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 4-Digits / 4. [G2] "0-5-8-7". */
    primaryGroups: [DIGITS(4)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 629, gameKey: "md-pick-5", displayName: "Pick 5",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5-Digits / 5. [G2] "0-3-9-6-3". */
    primaryGroups: [DIGITS(5)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 654, gameKey: "md-cash-pop", displayName: "Cash Pop",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 1/15 / 1. [G2] single value, e.g. "5". */
    primaryGroups: [SINGLE(1, 15)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 392, gameKey: "md-bonus-match-5", displayName: "Bonus Match 5",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 5/39 / 5+1. [G2] "17-29-35-36-38, Bonus: 4". Special-ball pool not independently determined. */
    primaryGroups: [POOL(5, 1, 39), SPECIAL(1, "Bonus", 1, 39, "ball.powerball")],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
  V({
    formatId: 515, gameKey: "md-multi-match", displayName: "Multi Match",
    effectiveFrom: null, effectiveTo: null,
    /* [G1] 6/43 / 6. [G2] "10-11-15-17-31-34". */
    primaryGroups: [POOL(6, 1, 43)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_UNAVAILABLE,
  }),
];

/* ------------------------------------------------------------------ recorded gaps */

export interface FormatGap {
  stateCode: string;
  gameId: number;
  gameName: string;
  /** The conflict or absence that stops this format being determined. */
  reason: string;
}

/**
 * Games present in production that this task REFUSES to render.
 *
 * Recording them is the point. A game that silently disappears looks like coverage; a game listed here with
 * its reason is a gap someone can close.
 */
export const FORMAT_GAPS: readonly FormatGap[] = Object.freeze([
  {
    stateCode: "mi", gameId: 402, gameName: "Michigan Keno",
    reason:
      "The two production sources DISAGREE. [G1] `PLAY_TYPE` is \"10/80\" while `NUM_OF_BALLS` is 22, and " +
      "[G2] draws 22 values. The most likely reading is that 10/80 describes the player's selection and 22 " +
      "the drawn count — but that distinction is nowhere recorded in the repository, so the drawn structure " +
      "is not determined and no result is rendered.",
  },
  {
    stateCode: "mi", gameId: 403, gameName: "Michigan Poker Lotto",
    reason:
      "A playing-card game: [G1] `isCardGame` is T and [G2] draws \"KS-10D-5H-9S-10S\". `BallValueType` " +
      "admits \"card\", but no governed rendering rules for rank, suit or colour exist anywhere in the " +
      "repository, and no existing format definition uses the card type. Rendering it would mean inventing " +
      "the presentation, not deriving it.",
  },
  {
    stateCode: "ca", gameId: 315, gameName: "California Daily Derby",
    reason:
      "[G1] `PLAY_TYPE` is \"Non-Traditional\" and the result is \"1st:11 Money Bags-2nd:4 Big Ben-3rd:5 " +
      "California Classic, Race Time: 1:45.68\" — placed horse names plus a race time. The format model has " +
      "no representation for a finishing order or an elapsed time, and inventing one is out of scope.",
  },
]);

/** Format gaps for one jurisdiction. */
export function formatGapsFor(stateCode: string): readonly FormatGap[] {
  const c = stateCode.toLowerCase();
  return FORMAT_GAPS.filter((g) => g.stateCode === c);
}

/* ------------------------------------------------------------------ per-State lookup */

/**
 * The multi-state formats, lifted from the Florida registry.
 *
 * These are NOT Florida rules. Powerball and Mega Millions are governed by their own game owners, the
 * registry records them with those owners' official sources, and every participating jurisdiction draws the
 * same numbers from the same draw. Sharing them is correct; re-declaring them per State would be the actual
 * duplication, and would let two States disagree about one national game.
 */
const MULTI_STATE_KEYS = new Set(["powerball", "mega-millions"]);

/*
 * COMPLETE registries — a jurisdiction whose formats were researched as one set, multi-state rules included.
 * Florida is here rather than special-cased in the function: its registry is already complete and verified,
 * and this task does not edit it.
 */
const COMPLETE: Record<string, readonly ResultFormatVersion[]> = {
  fl: FLORIDA_FORMAT_VERSIONS,
};

/* NATIVE-ONLY registries — state games only. The shared multi-state rules are prepended. */
const NATIVE: Record<string, readonly ResultFormatVersion[]> = {
  mi: MI_FORMAT_VERSIONS,
  va: VA_FORMAT_VERSIONS,
  ca: CA_FORMAT_VERSIONS,
  md: MD_FORMAT_VERSIONS,
};

/** Every format version a jurisdiction may render: the shared multi-state rules plus its own native games. */
export function formatVersionsFor(stateCode: string): readonly ResultFormatVersion[] {
  const c = stateCode.toLowerCase();
  const complete = COMPLETE[c];
  if (complete) return complete;
  const native = NATIVE[c];
  if (!native) return [];
  const multi = FLORIDA_FORMAT_VERSIONS.filter((v) => MULTI_STATE_KEYS.has(v.gameKey));
  return [...multi, ...native];
}
