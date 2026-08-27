/*
 * FLORIDA GAME RULE ERAS — PRIMARY-SOURCE VERIFIED. LRG-GAME-050.
 *
 * This module is Florida DATA. The contract it satisfies (`gameRuleContract.ts`) is generic; nothing here is
 * Florida-specific architecture. Founder decisions 5 and 6 of 2026-08-04 required ticket price, Advance Play
 * and the payout matrix to be researched from a current primary Florida Lottery source before publication,
 * and forbade publishing a partial or era-unknown matrix as current fact.
 *
 * ══ WHAT THE RESEARCH ESTABLISHED, AND WHAT IT OVERTURNED ══
 *
 * Three separate repository beliefs were wrong, and all three came from the same production export:
 *
 *   1. **Ticket price.** `game.csv` `TICKET_PRICE` records `1$`. Rule 53ER24-56 §1b: players may choose play
 *      amounts of **$.50 or $1.00** per play, per drawing. The export omits the 50-cent play, which is not a
 *      rounding difference — it is half of every prize figure in the matrix.
 *
 *   2. **Advance Play.** `game.csv` `ADVANCED_PLAYS` records `upto 14 consecutive draws`. Rule 53ER24-56 §1f
 *      grants consecutive midday, evening or both drawings within a **fourteen-DAY** period. With `BOTH`
 *      selected that is up to twenty-eight drawings, not fourteen. Recorded as the operator states it.
 *
 *   3. **The payout matrix.** `game.csv` `PRIZE_MATRIX` carries a complete-looking Pick 3 table containing a
 *      **1-OFF** play type and **no FIREBALL rows**. The Pick 3 fact sheet dates that combination precisely:
 *      *"January 18, 2021 The FIREBALL add-on feature for all PICK Daily Games was introduced, and the 1-OFF
 *      play style ended."* The export is therefore a **closed pre-2021 era**, not an approximation of the
 *      current one, and 1-OFF appears **zero times** in the current rule document.
 *
 * That is why `PICK3_PRE_FIREBALL_ERA` exists below and is marked `retiredEra` / `retired: true`. It is
 * retained because BP-04B §34 preserves historic draws and old rule eras, and because a 2019 ticket must be
 * checked against the rules that applied in 2019. It is unpublishable as current by construction —
 * `eraPublishableAsCurrent` reads `verification`, so no caller can opt into it by accident.
 *
 * ══ NEUTRAL LANGUAGE ══
 *
 * The operator's own FIREBALL copy uses "increase their chances of winning". `CLAUDE.md` §7 forbids that
 * phrasing, so the mechanic is described by what it factually does — it creates additional winning
 * combinations for the same drawing — and the operator's promotional framing is not reproduced.
 *
 * ══ ABSENT BY DESIGN ══
 *
 * Jackpot Triple Play and Cash Pop have verified *structure* and verified *sources*, but no primary-source
 * payout matrix was read for them in this task. Their eras therefore carry zero payout rows, and JG-06
 * suppresses its prize table for them with a recorded reason rather than showing an unverified matrix or a
 * blank grid. That degradation is intentional and is part of the generalization proof.
 */

import {
  validateRuleEra, type AddOnRule, type GameRuleEra, type PayoutRow, type PlayTypeRule, type RuleDocument,
} from "./gameRuleContract";

/* ------------------------------------------------------------------ documents */

/** The current promulgated Pick 3 rule. The authority for every base and FIREBALL figure below. */
const D_PICK3_RULES: RuleDocument = {
  ruleNumber: "53ER24-56",
  title: "PICK 3 game rules (Florida Lottery)",
  url: "https://floridalottery.com/content/dam/flalottery-web/files/game-reports/08-pick/pick3-game-rules.pdf",
  accessed: "2026-08-04",
  supports:
    "§1b play amounts of $.50 or $1.00 per play, per drawing. §2 base prizes: Straight $250.00 (50c) / $500 " +
    "($1.00); 3-way box $80.00 / $160.00; 6-way box $40.00 / $80.00; Straight and 3-way box $330.00 exact or " +
    "$80.00 any order; Straight and 6-way box $290.00 exact or $40.00 any order; 3-way combo $250 for a $1.50 " +
    "play or $500 for a $3.00 play; 6-way combo $250 for a $3.00 play or $500 for a $6.00 play; front pair and " +
    "back pair $25.00 / $50.00. §3 base odds: Straight 1 in 1000; Box 3-Way 1 in 333.33; Box 6-Way 1 in " +
    "166.67; Straight and Box 3-Way 1 in 1000 and 1 in 333.33; Straight and Box 6-Way 1 in 1000 and 1 in " +
    "166.67; Combo 3-Way 1 in 333.33; Combo 6-Way 1 in 166.67; Front Pair 1 in 100; Back Pair 1 in 100. §4 " +
    "FIREBALL doubles the cost of all panels played, is available with both 50-cent and $1.00 play amounts, " +
    "and the FIREBALL number replaces any of the three official winning numbers to create three new winning " +
    "combinations. §1f advance play covers consecutive midday, evening or both drawings within a fourteen-day " +
    "period, or non-consecutive drawings within a seven-day period. Enumerated play types are Straight, Box, " +
    "Straight and Box, Combo, Front Pair and Back Pair; 1-OFF does not appear.",
};

/** The dated game history. This is the document that closes the pre-2021 era. */
const D_PICK3_FACTS: RuleDocument = {
  ruleNumber: null,
  title: "PICK 3 fact sheet (Florida Lottery)",
  url: "https://floridalottery.com/content/dam/flalottery-web/files/fact-sheets/pick3-fact-sheet.pdf",
  accessed: "2026-08-04",
  supports:
    "\"January 18, 2021 The FIREBALL add-on feature for all PICK Daily Games was introduced, and the 1-OFF " +
    "play style ended.\" Also: \"August 5, 2018 PICK 3 evening draw time changed from 7:57 p.m. to 9:45 p.m.\", " +
    "\"March 16, 2015 1-OFF play style was introduced\", \"August 1, 2016 CASH 3 is renamed PICK 3\". Florida " +
    "game stats stated since inception through March 31, 2026.",
};

/** The public game page. Confirms draw times, cutoffs and minimum age in the operator's own words. */
const D_PICK3_PAGE: RuleDocument = {
  ruleNumber: null,
  title: "Pick 3 (Florida Lottery)",
  url: "https://floridalottery.com/games/draw-games/pick-3",
  accessed: "2026-08-04",
  supports:
    "\"MID for the midday drawing at 1:30 p.m. ET, EVE for the evening drawing at 9:45 p.m., ET\". Tickets may " +
    "be purchased up to 11 minutes prior to the applicable drawing - 1:19 p.m. ET midday and 9:34 p.m. ET " +
    "evening. \"Adding FIREBALL doubles your ticket price.\" \"Must be 18 or older to play.\"",
};

/** The production export. Cited as the SOURCE OF A CLOSED ERA, never as current fact. */
const D_LEGACY_EXPORT: RuleDocument = {
  ruleNumber: null,
  title: "Production database export (game.csv, PRIZE_MATRIX for game id 332)",
  url: "04-sample-data/reference-tables/game.csv",
  accessed: "2026-08-04",
  supports:
    "PRIZE_MATRIX for game id 332 lists STRAIGHT, BOX 3-WAY and 6-WAY, STRAIGHT/BOX, 1-OFF, FRONT PAIR, BACK " +
    "PAIR and COMBO with 50-cent and $1.00 payouts and odds. It contains 1-OFF rows and no FIREBALL rows, " +
    "which dates it before 2021-01-18. TICKET_PRICE 1$; ADVANCED_PLAYS \"upto 14 consecutive draws\"; " +
    "GAMETIME 7:57 PM for game id 333, superseded on 2018-08-05.",
};

const D_JTP_PAGE: RuleDocument = {
  ruleNumber: null,
  title: "Jackpot Triple Play (Florida Lottery)",
  url: "https://floridalottery.com/games/draw-games/jackpot-triple-play",
  accessed: "2026-07-29",
  supports:
    "\"choose six numbers 1 through 46\". \"Tickets may be purchased until 10:40 p.m. Eastern Time on the night " +
    "of the draw.\" Starting jackpot $250,000. Combo: \"For just $1 extra, Combo allows you to combine winning " +
    "number matches from all three sets of numbers\". Must be 18 or older to play.",
};

const D_CASHPOP_PAGE: RuleDocument = {
  ruleNumber: null,
  title: "Cash Pop (Florida Lottery)",
  url: "https://floridalottery.com/games/draw-games/cash-pop",
  accessed: "2026-07-29",
  supports:
    "\"Select one number from 1 to 15\". \"There are five drawings per day\". \"Choose your play amount for each " +
    "number: one dollar, two dollars, five dollars, or ten dollars.\" \"Prizes range from 5 times to 250 times " +
    "the play amount for each number drawn.\" Base Ticket Price $1.",
};

/* ------------------------------------------------------------------ Pick 3 play types */

const HALF = 50;
const ONE = 100;

const PICK3_PLAY_TYPES: readonly PlayTypeRule[] = [
  {
    key: "straight",
    label: "Straight",
    definition: "Match all three digits in the exact order drawn.",
    examplePattern: "1-2-3",
    digitShape: "any",
    positions: null,
    orderMatters: true,
  },
  {
    key: "box-3way",
    label: "Box (3-way)",
    definition:
      "Match all three digits in any order. A number with two identical digits has three possible orders, " +
      "so it is a 3-way box.",
    examplePattern: "1-1-2",
    digitShape: "hasPair",
    positions: null,
    orderMatters: false,
  },
  {
    key: "box-6way",
    label: "Box (6-way)",
    definition:
      "Match all three digits in any order. A number with three different digits has six possible orders, " +
      "so it is a 6-way box.",
    examplePattern: "1-2-3",
    digitShape: "allUnique",
    positions: null,
    orderMatters: false,
  },
  {
    key: "straight-box-3way",
    label: "Straight/Box (3-way)",
    definition:
      "Splits a $1.00 play into a 50-cent straight play and a 50-cent box play. It pays the higher amount " +
      "for an exact-order match and the box amount for any other order.",
    examplePattern: "1-1-2",
    digitShape: "hasPair",
    positions: null,
    orderMatters: false,
  },
  {
    key: "straight-box-6way",
    label: "Straight/Box (6-way)",
    definition:
      "Splits a $1.00 play into a 50-cent straight play and a 50-cent box play, for a number with three " +
      "different digits.",
    examplePattern: "1-2-3",
    digitShape: "allUnique",
    positions: null,
    orderMatters: false,
  },
  {
    key: "combo-3way",
    label: "Combo (3-way)",
    definition:
      "Covers every unique order of the selected digits as separate straight plays. A number with two " +
      "identical digits has three orders, so a 3-way combo is three straight plays.",
    examplePattern: "1-2-2",
    digitShape: "hasPair",
    positions: null,
    orderMatters: true,
  },
  {
    key: "combo-6way",
    label: "Combo (6-way)",
    definition:
      "Covers every unique order of the selected digits as separate straight plays. A number with three " +
      "different digits has six orders, so a 6-way combo is six straight plays.",
    examplePattern: "1-2-3",
    digitShape: "allUnique",
    positions: null,
    orderMatters: true,
  },
  {
    key: "front-pair",
    label: "Front Pair",
    definition: "Select two digits and match the first two digits drawn, in exact order.",
    examplePattern: "1-2-x",
    digitShape: "pairOnly",
    positions: [0, 1],
    orderMatters: true,
  },
  {
    key: "back-pair",
    label: "Back Pair",
    definition: "Select two digits and match the last two digits drawn, in exact order.",
    examplePattern: "x-2-3",
    digitShape: "pairOnly",
    positions: [1, 2],
    orderMatters: true,
  },
];

/* ------------------------------------------------------------------ Pick 3 base payouts (53ER24-56 §2, §3) */

const PICK3_PAYOUTS: readonly PayoutRow[] = [
  {
    playTypeKey: "straight",
    label: "Straight",
    examplePattern: "1-2-3",
    prizeByWagerCents: { [HALF]: "$250.00", [ONE]: "$500.00" },
    oddsDisplay: "1 in 1,000",
  },
  {
    playTypeKey: "box-3way",
    label: "Box (3-way)",
    examplePattern: "1-1-2",
    prizeByWagerCents: { [HALF]: "$80.00", [ONE]: "$160.00" },
    oddsDisplay: "1 in 333.33",
  },
  {
    playTypeKey: "box-6way",
    label: "Box (6-way)",
    examplePattern: "1-2-3",
    prizeByWagerCents: { [HALF]: "$40.00", [ONE]: "$80.00" },
    oddsDisplay: "1 in 166.67",
  },
  /* A Straight/Box play IS a $1.00 play by definition (§2c: it combines a 50-cent straight and a 50-cent
     box), so it is priced at $1.00 only, and its prize genuinely has two outcomes. */
  {
    playTypeKey: "straight-box-3way",
    label: "Straight/Box (3-way)",
    examplePattern: "1-1-2",
    prizeByWagerCents: { [ONE]: "$330.00 exact order, or $80.00 any other order" },
    splitPrize: { [ONE]: { exactOrder: "$330.00", anyOrder: "$80.00" } },
    oddsDisplay: "1 in 1,000 exact order and 1 in 333.33 any order",
  },
  {
    playTypeKey: "straight-box-6way",
    label: "Straight/Box (6-way)",
    examplePattern: "1-2-3",
    prizeByWagerCents: { [ONE]: "$290.00 exact order, or $40.00 any other order" },
    splitPrize: { [ONE]: { exactOrder: "$290.00", anyOrder: "$40.00" } },
    oddsDisplay: "1 in 1,000 exact order and 1 in 166.67 any order",
  },
  {
    playTypeKey: "combo-3way",
    label: "Combo (3-way)",
    examplePattern: "1-2-2",
    prizeByWagerCents: { [HALF]: "$250.00", [ONE]: "$500.00" },
    ticketCostByWagerCents: { [HALF]: "$1.50", [ONE]: "$3.00" },
    oddsDisplay: "1 in 333.33",
  },
  {
    playTypeKey: "combo-6way",
    label: "Combo (6-way)",
    examplePattern: "1-2-3",
    prizeByWagerCents: { [HALF]: "$250.00", [ONE]: "$500.00" },
    ticketCostByWagerCents: { [HALF]: "$3.00", [ONE]: "$6.00" },
    oddsDisplay: "1 in 166.67",
  },
  {
    playTypeKey: "front-pair",
    label: "Front Pair",
    examplePattern: "1-2-x",
    prizeByWagerCents: { [HALF]: "$25.00", [ONE]: "$50.00" },
    oddsDisplay: "1 in 100",
  },
  {
    playTypeKey: "back-pair",
    label: "Back Pair",
    examplePattern: "x-2-3",
    prizeByWagerCents: { [HALF]: "$25.00", [ONE]: "$50.00" },
    oddsDisplay: "1 in 100",
  },
];

/* ------------------------------------------------------------------ FIREBALL (53ER24-56 §4) */

const PICK3_FIREBALL: AddOnRule = {
  key: "fireball",
  label: "FIREBALL",
  definition:
    "An extra number drawn alongside the three Pick 3 digits. On a ticket that includes FIREBALL, the " +
    "FIREBALL number may replace any one of the three drawn digits, which produces three additional winning " +
    "combinations for that drawing. A FIREBALL prize can be won with or without also winning a base prize.",
  priceEffect: "Adding FIREBALL doubles the cost of every panel played. It is available with 50-cent and $1.00 plays.",
  /* The dated boundary. Everything before this is a different game. */
  effectiveFrom: "2021-01-18",
  effectiveTo: null,
  payouts: [
    {
      playTypeKey: "straight",
      label: "Straight",
      examplePattern: "1-2-3",
      prizeByWagerCents: { [HALF]: "$100.00", [ONE]: "$200.00" },
      oddsDisplay: "1 in 333",
    },
    {
      playTypeKey: "box-3way",
      label: "Box (3-way)",
      examplePattern: "1-1-2",
      prizeByWagerCents: { [HALF]: "$34.00", [ONE]: "$68.00" },
      oddsDisplay: "1 in 111",
    },
    {
      playTypeKey: "box-6way",
      label: "Box (6-way)",
      examplePattern: "1-2-3",
      prizeByWagerCents: { [HALF]: "$17.00", [ONE]: "$34.00" },
      oddsDisplay: "1 in 56",
    },
    {
      playTypeKey: "straight-box-3way",
      label: "Straight/Box (3-way)",
      examplePattern: "1-1-2",
      prizeByWagerCents: { [ONE]: "$134.00 exact order, or $34.00 any other order" },
      splitPrize: { [ONE]: { exactOrder: "$134.00", anyOrder: "$34.00" } },
      oddsDisplay: "1 in 333 exact order and 1 in 111 any order",
    },
    {
      playTypeKey: "straight-box-6way",
      label: "Straight/Box (6-way)",
      examplePattern: "1-2-3",
      prizeByWagerCents: { [ONE]: "$117.00 exact order, or $17.00 any other order" },
      splitPrize: { [ONE]: { exactOrder: "$117.00", anyOrder: "$17.00" } },
      oddsDisplay: "1 in 333 exact order and 1 in 56 any order",
    },
    {
      playTypeKey: "front-pair",
      label: "Front Pair",
      examplePattern: "1-2-x",
      prizeByWagerCents: { [HALF]: "$10.00", [ONE]: "$20.00" },
      oddsDisplay: "1 in 333",
    },
    {
      playTypeKey: "back-pair",
      label: "Back Pair",
      examplePattern: "x-2-3",
      prizeByWagerCents: { [HALF]: "$10.00", [ONE]: "$20.00" },
      oddsDisplay: "1 in 333",
    },
    {
      playTypeKey: "combo-3way",
      label: "Combo (3-way)",
      examplePattern: "1-2-2",
      prizeByWagerCents: { [HALF]: "$100.00", [ONE]: "$200.00" },
      oddsDisplay: "1 in 111",
    },
    {
      playTypeKey: "combo-6way",
      label: "Combo (6-way)",
      examplePattern: "1-2-3",
      prizeByWagerCents: { [HALF]: "$100.00", [ONE]: "$200.00" },
      oddsDisplay: "1 in 56",
    },
  ],
  /* §4e: a base win and a FIREBALL win can both occur, and the operator publishes the maximum number of
     FIREBALL wins per play type. Published, never inferred. */
  maxWinsByPlayType: {
    straight: 3,
    "box-3way": 3,
    "box-6way": 2,
    "straight-box-3way": 4,
    "straight-box-6way": 3,
    "front-pair": 3,
    "back-pair": 3,
    "combo-3way": 3,
    "combo-6way": 2,
  },
  sources: [D_PICK3_RULES, D_PICK3_FACTS],
};

/* ------------------------------------------------------------------ eras */

/** The current Pick 3 era. FIREBALL in, 1-OFF out. */
export const PICK3_CURRENT_ERA: GameRuleEra = validateRuleEra({
  gameKey: "pick-3",
  eraId: "fl-pick-3-fireball",
  effectiveFrom: "2021-01-18",
  effectiveTo: null,
  verification: "verifiedOfficial",
  retired: false,
  wagers: [
    { amountCents: HALF, label: "50 cents" },
    { amountCents: ONE, label: "$1.00", isDefault: true },
  ],
  playTypes: PICK3_PLAY_TYPES,
  payouts: PICK3_PAYOUTS,
  addOns: [PICK3_FIREBALL],
  ticketPrice: "50 cents or $1.00 per play, per drawing. Adding FIREBALL doubles the ticket price.",
  advancePlay:
    "Consecutive midday, evening or both drawings within a fourteen-day period, or non-consecutive drawings " +
    "within a seven-day period.",
  sources: [D_PICK3_RULES, D_PICK3_PAGE, D_PICK3_FACTS],
  absent: [],
});

/**
 * The closed pre-FIREBALL era.
 *
 * Retained so a draw from 2015–2021 resolves against the rules that actually applied, including 1-OFF. It is
 * `retiredEra`, so `eraPublishableAsCurrent` refuses it and no public surface can present it as how Pick 3
 * works now. The payout figures come from the production export and are marked as such.
 */
export const PICK3_PRE_FIREBALL_ERA: GameRuleEra = validateRuleEra({
  gameKey: "pick-3",
  eraId: "fl-pick-3-1off",
  effectiveFrom: "2015-03-16",
  effectiveTo: "2021-01-17",
  verification: "retiredEra",
  retired: true,
  wagers: [
    { amountCents: HALF, label: "50 cents" },
    { amountCents: ONE, label: "$1.00", isDefault: true },
  ],
  playTypes: [
    ...PICK3_PLAY_TYPES,
    {
      key: "one-off",
      label: "1-OFF",
      definition:
        "A play that also won when one or more digits were one away from a drawn digit. This play type ended " +
        "on January 18, 2021 and cannot be bought today.",
      examplePattern: "1-2-4",
      digitShape: "any",
      positions: null,
      orderMatters: true,
    },
  ],
  payouts: [
    ...PICK3_PAYOUTS,
    {
      playTypeKey: "one-off",
      label: "1-OFF (ended January 18, 2021)",
      examplePattern: "1-2-4",
      prizeByWagerCents: { [ONE]: "$250.00 exact order; $20.00, $10.00 or $5.00 for one, three or two digits off" },
      oddsDisplay: "1 in 1,000 exact order; 1 in 166.67, 1 in 125 and 1 in 83.33 for the off-by-one outcomes",
    },
  ],
  addOns: [],
  ticketPrice: "50 cents or $1.00 per play, per drawing.",
  advancePlay: null,
  sources: [D_LEGACY_EXPORT, D_PICK3_FACTS],
  absent: [
    { field: "fireball", reason: "FIREBALL did not exist in this era; it was introduced on 2021-01-18." },
  ],
});

/**
 * Jackpot Triple Play — structure verified, payout matrix NOT researched in this task.
 *
 * Zero payout rows is the honest state, not an oversight: founder decision 6 forbids publishing a partial
 * matrix as current fact, and JG-06 suppresses its prize table when `payouts` is empty.
 */
export const JACKPOT_TRIPLE_PLAY_ERA: GameRuleEra = validateRuleEra({
  gameKey: "jackpot-triple-play",
  eraId: "fl-jtp-current",
  effectiveFrom: "2019-04-28",
  effectiveTo: null,
  verification: "verifiedOfficial",
  retired: false,
  wagers: [{ amountCents: ONE, label: "$1.00", isDefault: true }],
  playTypes: [
    {
      key: "line",
      label: "Six-number play",
      definition: "Choose six numbers from 1 through 46. Each ticket plays three separate sets of six numbers.",
      examplePattern: "6 of 46",
      digitShape: "any",
      positions: null,
      orderMatters: false,
    },
  ],
  payouts: [],
  addOns: [],
  ticketPrice: "$1.00 per play. Combo is $1 extra per play.",
  advancePlay: null,
  sources: [D_JTP_PAGE],
  absent: [
    {
      field: "payoutMatrix",
      reason:
        "No primary-source Jackpot Triple Play prize table was read in this task. Founder decision 6 forbids " +
        "publishing a partial or era-unknown matrix as current fact, so the prize table is suppressed.",
    },
    { field: "advancePlay", reason: "Not verified from a primary source for this game." },
  ],
});

/**
 * Cash Pop — structure and the stake-dependent prize rule verified; no prize table.
 *
 * The State format registry already records the decisive constraint: a Cash Pop prize is 5x-250x the play
 * amount and CANNOT be stated without the player's stake. So a single top-prize figure is not merely
 * unverified here, it is unstateable, which is why `payouts` is empty rather than approximated.
 */
export const CASH_POP_ERA: GameRuleEra = validateRuleEra({
  gameKey: "cash-pop",
  eraId: "fl-cash-pop-current",
  effectiveFrom: "2019-04-28",
  effectiveTo: null,
  verification: "verifiedOfficial",
  retired: false,
  wagers: [
    { amountCents: ONE, label: "$1", isDefault: true },
    { amountCents: 200, label: "$2" },
    { amountCents: 500, label: "$5" },
    { amountCents: 1000, label: "$10" },
  ],
  playTypes: [
    {
      key: "single",
      label: "Single number",
      definition:
        "Choose one number from 1 to 15 and a play amount. The prize is a multiple of the play amount, so the " +
        "same drawn number pays differently on different tickets.",
      examplePattern: "1 of 15",
      digitShape: "any",
      positions: null,
      orderMatters: false,
    },
  ],
  payouts: [],
  addOns: [],
  ticketPrice: "$1, $2, $5 or $10 per number. Prizes range from 5 to 250 times the play amount.",
  advancePlay: null,
  sources: [D_CASHPOP_PAGE],
  absent: [
    {
      field: "payoutMatrix",
      reason:
        "A Cash Pop prize is 5x-250x the play amount and cannot be stated without the player's stake, so no " +
        "single prize figure may be shown for a drawn number.",
    },
    { field: "advancePlay", reason: "Not verified from a primary source for this game." },
  ],
});

/** Every Florida rule era. Current eras first so `currentRuleEra` short-circuits on the common path. */
export const FLORIDA_RULE_ERAS: readonly GameRuleEra[] = Object.freeze([
  PICK3_CURRENT_ERA,
  JACKPOT_TRIPLE_PLAY_ERA,
  CASH_POP_ERA,
  PICK3_PRE_FIREBALL_ERA,
]);

/**
 * Conflicts between the production export and the operator, recorded rather than reconciled.
 *
 * `CLAUDE.md` §2 requires this. It also stops a future task "fixing" a corrected value back to the stale one,
 * which is exactly what `SCHEDULE_CONFLICTS` in the State format registry exists to prevent for draw times.
 */
export const RULE_CONFLICTS = [
  {
    gameKeys: ["pick-3"],
    field: "ticket price",
    productionExport: "$1 (game.csv TICKET_PRICE for game ids 332/333)",
    official: "$.50 or $1.00 per play, per drawing (53ER24-56 §1b)",
    resolution:
      "Official wins. The export omits the 50-cent play, which halves every prize in the matrix. Both wagers " +
      "are now published.",
    verifiedFrom: [D_PICK3_RULES.url],
    accessed: D_PICK3_RULES.accessed,
  },
  {
    gameKeys: ["pick-3"],
    field: "advance play",
    productionExport: "upto 14 consecutive draws (game.csv ADVANCED_PLAYS)",
    official:
      "Consecutive midday, evening or both drawings within a fourteen-DAY period, or non-consecutive drawings " +
      "within a seven-day period (53ER24-56 §1f)",
    resolution:
      "Official wins. Fourteen days is not fourteen drawings: with BOTH draw times selected it is up to " +
      "twenty-eight drawings.",
    verifiedFrom: [D_PICK3_RULES.url],
    accessed: D_PICK3_RULES.accessed,
  },
  {
    gameKeys: ["pick-3"],
    field: "payout matrix rule era",
    productionExport:
      "game.csv PRIZE_MATRIX contains 1-OFF rows and no FIREBALL rows, so it predates 2021-01-18",
    official:
      "53ER24-56 enumerates Straight, Box, Straight and Box, Combo, Front Pair and Back Pair, plus the " +
      "FIREBALL add-on. 1-OFF appears zero times. The fact sheet dates the change: FIREBALL introduced and " +
      "1-OFF ended on January 18, 2021",
    resolution:
      "Official wins. The export is retained as the closed PICK3_PRE_FIREBALL_ERA so historical draws resolve " +
      "correctly, and is unpublishable as current fact. 1-OFF is excluded from all public content.",
    verifiedFrom: [D_PICK3_RULES.url, D_PICK3_FACTS.url],
    accessed: D_PICK3_RULES.accessed,
  },
  {
    gameKeys: ["pick-3"],
    field: "advance play horizon stated on the public game page",
    productionExport: "n/a",
    official:
      "The promulgated rule 53ER24-56 §1f states a fourteen-day / seven-day period. A summary reading of the " +
      "public Pick 3 web page suggested a six-month advance horizon, which the rule text does not support",
    resolution:
      "The promulgated rule wins as the primary legal document. Recorded so the discrepancy is re-checked " +
      "before this fact ships to production.",
    verifiedFrom: [D_PICK3_RULES.url, D_PICK3_PAGE.url],
    accessed: D_PICK3_RULES.accessed,
  },
] as const;

export const FLORIDA_RULE_DOCUMENTS = {
  pick3Rules: D_PICK3_RULES,
  pick3Facts: D_PICK3_FACTS,
  pick3Page: D_PICK3_PAGE,
  legacyExport: D_LEGACY_EXPORT,
  jtpPage: D_JTP_PAGE,
  cashPopPage: D_CASHPOP_PAGE,
};
