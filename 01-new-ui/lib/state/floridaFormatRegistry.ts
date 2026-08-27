/*
 * Florida verified result-format registry — SOURCE-BACKED, VERSIONED.
 *
 * Task LRG-STATE-029. Every entry is verified against a **primary official source** read on 2026-07-29,
 * or is explicitly marked `provisionalCloned` / `underReview` so the publication gate rejects it.
 *
 * This module is Florida DATA. The contract it satisfies (`resultFormatContract.ts`) is generic, and
 * nothing here is Florida-specific *architecture* — every jurisdiction supplies the same shape (`FD-X-01`).
 *
 * WHAT THIS CORRECTS in LRG-STATE-025's provisional definitions:
 *   1. Fireball was rendered as an ordinary named special ball. It is a **drawn wild card that REPLACES**
 *      one of the drawn numbers — now a `drawn` add-on with the mechanic recorded.
 *   2. EZmatch did not exist in the model at all. It is a **purchase-time instant win**, never a drawn
 *      result — now a `purchaseTime` add-on that the gate forbids from carrying a drawn group.
 *   3. Jackpot Triple Play's **Combo** add-on was missing entirely — also `purchaseTime`.
 *   4. Cash Pop carried a flat `$250` prize string. Its prize is **entirely stake-dependent**
 *      (5×–250× a $1/$2/$5/$10 play) — now `stakeDependentPrize` with stake options, so no single figure
 *      may be shown without ticket context.
 *   5. Prizes were unlabelled money strings. Every prize now declares its kind, and Florida Lotto Double
 *      Play is recorded with its **own** $250,000 structure rather than inheriting the parent jackpot.
 *   6. Mega Millions' multiplier was `[]`. It is a **built-in automatic** 2–10× multiplier post-2025 —
 *      recorded with a closed pre-2025 version so historical results resolve correctly.
 *   7. Cash4Life had no representation. It **ended 2026-02-21** — now a retired version.
 *   8. Pick evening draw times were taken from `game.csv` as 7:57 p.m. The operator publishes
 *      **9:45 p.m. ET** — see `SCHEDULE_CONFLICTS`.
 */

import type {
  ResultFormatVersion, RuleSource, BallGroupSpec, MultiplierSpec, AddOnSpec, PrizeSpec,
  SecondaryDrawSpec,
} from "./resultFormatContract";
import {
  orderedDigitPositions, unorderedNumberPool, singleValueGroup,
} from "./resultFormatContract";

/* ------------------------------------------------------------------ sources */

const ACCESSED = "2026-07-29";

const S = {
  powerball: {
    url: "https://floridalottery.com/games/draw-games/powerball",
    accessed: "2026-07-28",
    supports:
      "\"Powerball drawings are held on Monday, Wednesday and Saturday.\" Tickets until 10:00 p.m. ET on draw night. Power Play $1/play, 2X-5X, with a 10X multiplier included when the jackpot is $150 million or lower. Double Play is an additional drawing following Powerball with prizes up to $10 million. Select five numbers 1-69 and a Powerball 1-26. Must be 18 or older to play.",
    governs: ["resultRendering", "prizePresentation", "schedule", "purchaseOptions"],
  },
  megaMillions: {
    url: "https://floridalottery.com/games/draw-games/mega-millions",
    accessed: "2026-07-28",
    supports:
      "\"MEGA MILLIONS drawings are held every Tuesday and Friday night at 11 PM Eastern Time\". Tickets until 10:00 p.m. ET. Select five numbers 1-70 and a MEGA BALL 1-24. \"Every non-jackpot win will multiply its base prize by 2, 3, 4, 5, or 10 times automatically!\"",
    governs: ["resultRendering", "prizePresentation", "schedule"],
    effectiveDate: "2025-04-08",
  },
  floridaLotto: {
    url: "https://floridalottery.com/games/draw-games/florida-lotto",
    accessed: ACCESSED,
    supports:
      "\"Players pick 6 numbers between 1-53\". Drawings twice a week. \"Tickets can be purchased until 10:55 p.m., Eastern Time, on the night of the draw.\" DOUBLE PLAY: \"For just $1 more per play\", \"The Double Play drawing is held immediately after the Florida Lotto drawing\", prizes \"up to $250,000\". EZmatch: \"For just $1\", \"Match any of your EZMatch numbers with any of your FLORIDA LOTTO numbers and you can win up to $500 instantly!\" Must be 18 or older to play.",
    governs: ["resultRendering", "prizePresentation", "schedule", "purchaseOptions"],
  },
  jackpotTriplePlay: {
    url: "https://floridalottery.com/games/draw-games/jackpot-triple-play",
    accessed: ACCESSED,
    supports:
      "\"choose six numbers 1 through 46\". \"Tickets may be purchased until 10:40 p.m. Eastern Time on the night of the draw.\" Starting Jackpot $250,000, jackpots of up to 2 million dollars. Combo: \"For just $1 extra, Combo allows you to combine winning number matches from all three sets of numbers for an extra chance to win up to $10,000!\" Must be 18 or older to play.",
    governs: ["resultRendering", "prizePresentation", "purchaseOptions"],
  },
  fantasy5: {
    url: "https://floridalottery.com/games/draw-games/fantasy5",
    accessed: ACCESSED,
    supports:
      "\"Select five numbers from 1 through 36\". \"Fantasy 5 drawings are held twice a day, 7 days a week at 1:05 p.m. and 11:15 p.m. Eastern Standard Time\". Cutoff 20 minutes before each drawing (12:45 p.m. midday, 10:55 p.m. evening). \"If there is no top prize winner, the money in the top prize pool rolls down, and is shared equally among winners in the 4-of-5 prize level, with a maximum prize of $555 per winner.\"",
    governs: ["resultRendering", "prizePresentation", "schedule"],
  },
  pick3: {
    url: "https://floridalottery.com/games/draw-games/pick-3",
    accessed: ACCESSED,
    supports:
      "Players select \"one number (from 0 through 9) from each column for a total of three digits\". Midday 1:30 p.m. ET, evening 9:45 p.m. ET. Cutoff 11 minutes prior (1:19 p.m. / 9:34 p.m. ET). \"FIREBALL doubles the base price of your PICK 3 ticket and creates more winning combinations!\" \"FIREBALL is the wild card of PICK 3, allowing you to replace one of the three official PICK winning numbers drawn with the FIREBALL number drawn.\"",
    governs: ["resultRendering", "schedule", "purchaseOptions"],
  },
  pick5: {
    url: "https://floridalottery.com/games/draw-games/pick-5",
    accessed: ACCESSED,
    supports:
      "\"PICK 5 drawings are held twice a day.\" Midday 1:30 p.m. ET, evening 9:45 p.m. ET. Cutoff 12 minutes prior (1:18 p.m. / 9:33 p.m. ET). FIREBALL \"allow[s] you to replace one of the five official PICK winning numbers drawn with the FIREBALL number drawn\" and \"doubles the base price of your PICK 5 ticket\"; base tickets cost $0.50 or $1.",
    governs: ["resultRendering", "schedule", "purchaseOptions"],
  },
  pick2: {
    url: "https://floridalottery.com/games/draw-games/pick-2",
    accessed: "2026-07-29",
    supports:
      "\"select one number (from 0 through 9) from each column for a total of two digits\". \"PICK 2 drawings are held twice a day\" at 1:30 p.m. ET midday and 9:45 p.m. ET evening. Cutoff 13 minutes prior (1:17 p.m. / 9:32 p.m. ET). \"FIREBALL is the wild card of PICK 2, allowing you to replace one of the two official PICK winning numbers drawn with the FIREBALL number drawn.\" It \"doubles the base price of your PICK 2 ticket\". Must be 18 or older to play.",
    governs: ["resultRendering", "schedule", "purchaseOptions"],
  },
  pick4: {
    url: "https://floridalottery.com/games/draw-games/pick-4",
    accessed: "2026-07-29",
    supports:
      "\"select one number (from 0 through 9) from each column for a total of four digits\". \"Pick 4 drawings are held twice a day\" with \"MID for the midday drawing at 1:30 p.m. ET, EVE for the evening drawing at 9:45 p.m., ET\". Cutoff 10 minutes prior (1:20 p.m. / 9:35 p.m. ET). \"FIREBALL is the wild card of PICK 4, allowing you to replace one of the four official PICK winning numbers drawn with the FIREBALL number drawn. FIREBALL doubles the base price of your PICK 4 ticket\". Must be 18 or older to play.",
    governs: ["resultRendering", "schedule", "purchaseOptions"],
  },
  cashPop: {
    url: "https://floridalottery.com/games/draw-games/cash-pop",
    accessed: ACCESSED,
    supports:
      "\"Select one number from 1 to 15\". \"There are five drawings per day, giving you five chances to play and win each day.\" \"Choose your play amount for each number: one dollar, two dollars, five dollars, or ten dollars. Prizes increase with higher play amounts.\" \"Prizes range from 5 times to 250 times the play amount for each number drawn.\" Base Ticket Price $1. Must be 18 or older to play.",
    governs: ["resultRendering", "prizePresentation"],
  },
  cash4life: {
    url: "https://floridalottery.com/games/draw-games/cash4life",
    accessed: ACCESSED,
    supports:
      "\"Game Ended: The Cash4Life Draw game ended on February 21, 2026. Please check winning numbers and claim prizes within 180 days after the winning draw date.\"",
    governs: ["retiredState", "resultRendering"],
    effectiveDate: "2026-02-21",
  },
} as const satisfies Record<string, RuleSource>;

/* ------------------------------------------------------------------ helpers */

/*
 * The main drawn group, in two named forms.
 *
 * MATCHING SEMANTICS ARE DECLARED BY NAME, NOT DERIVED (LRG-GAME-053). A single `MAIN(count, min, max,
 * valueType)` helper used to compute `matchOrdered`/`repeatsAllowed` from `valueType`. Every field was filled
 * in, so nothing reported a gap — but the values were a derivation from a PRESENTATION property, and
 * "renders as a digit" is not the same published claim as "a Straight play matches by position".
 *
 * Each call site below now names the rule it is asserting, and the constructor in `resultFormatContract.ts`
 * supplies the semantics. Nothing is read off the stored result array, which for a ball game arrives ascending
 * and would look positional.
 */

/** A positional digit game: matched by position, digits may repeat (Pick 3 draws `5-5-7`). */
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

/** A one-number main group — Cash Pop picks a single number from a pool. */
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

/** Fireball — a DRAWN wild card that replaces a drawn number. Never an ordinary main ball. */
const fireball = (src: RuleSource, digits: number): AddOnSpec => ({
  key: "fireball",
  label: "Fireball",
  addOnClass: "drawn",
  drawnGroup: {
    order: 1, label: "Fireball", valueType: "digit", count: 1, min: 0, max: 9,
    differentSet: true, colorToken: "ball.fireball", accessibleLabel: "Fireball",
    visualRole: "addOn",
    /* One value: order and repetition are unobservable, so both are declared rather than left to a default. */
    matchOrdered: false, repeatsAllowed: false,
  },
  mechanicNote:
    `Officially drawn wild card. It REPLACES one of the ${digits} drawn PICK numbers to create additional ` +
    `winning combinations — it is not an extra main number and must never render inside the main group.`,
  extraCostNote: "Doubles the base price of the ticket.",
  sources: [src],
});

/* ------------------------------------------------------------------ prizes */

const PRIZE_PB: PrizeSpec = {
  kind: "estimatedAnnuitizedJackpot", cashValueAvailable: true,
  variabilityNote: "Rolling estimated annuitized jackpot; a cash value is separately published.",
  sources: [S.powerball],
};
const PRIZE_MM: PrizeSpec = {
  kind: "estimatedAnnuitizedJackpot", cashValueAvailable: true,
  variabilityNote: "Rolling estimated annuitized jackpot; a cash value is separately published.",
  sources: [S.megaMillions],
};
const PRIZE_FL_LOTTO: PrizeSpec = {
  kind: "advertisedJackpot", cashValueAvailable: false,
  variabilityNote: "Rolling advertised jackpot. No cash value is published on the operator game page.",
  sources: [S.floridaLotto],
};
const PRIZE_JTP: PrizeSpec = {
  kind: "advertisedJackpot", cashValueAvailable: false,
  variabilityNote: "Starting jackpot $250,000, rolling to published maxima. No cash value published.",
  sources: [S.jackpotTriplePlay],
};
const PRIZE_FANTASY5: PrizeSpec = {
  kind: "variableTopPrize", cashValueAvailable: false,
  variabilityNote:
    "Pari-mutuel with a rolldown: with no top-prize winner the top pool is shared equally among 4-of-5 " +
    "winners, capped at $555 per winner. A single top-prize figure is an estimate, not a fixed prize.",
  sources: [S.fantasy5],
};
const PRIZE_PICK: PrizeSpec = {
  kind: "fixedTopPrize", cashValueAvailable: false,
  variabilityNote: "Fixed prize per play type; base ticket price varies ($0.50 or $1) and scales the prize.",
  sources: [S.pick3, S.pick5],
};
/** The correction that matters most: Cash Pop's prize cannot be stated without the player's stake. */
const PRIZE_CASH_POP: PrizeSpec = {
  kind: "stakeDependentPrize", cashValueAvailable: false,
  stakeOptions: ["$1", "$2", "$5", "$10"],
  stakeMultiplierRange: { min: 5, max: 250 },
  variabilityNote:
    "Prize is the play amount multiplied by 5x-250x. It CANNOT be stated without the player's stake, so no " +
    "single prize figure may be presented as the prize for a drawn number.",
  sources: [S.cashPop],
};

/* ------------------------------------------------------------------ secondary draws */

const PB_DOUBLE_PLAY: SecondaryDrawSpec = {
  key: "doubleplay", label: "Double Play",
  groups: [POOL(5, 1, 69), SPECIAL(1, "Powerball", 1, 26, "ball.powerball")],
  prize: {
    kind: "fixedTopPrize", cashValueAvailable: false,
    variabilityNote: "Published top prize up to $10 million — separate from the Powerball jackpot.",
    sources: [S.powerball],
  },
  timingNote: "An additional drawing held following the Powerball drawing.",
  extraCostNote: "$1 more per play.",
  sources: [S.powerball],
};

const FL_LOTTO_DOUBLE_PLAY: SecondaryDrawSpec = {
  key: "doubleplay", label: "Double Play",
  groups: [POOL(6, 1, 53)],
  prize: {
    kind: "fixedTopPrize", cashValueAvailable: false,
    variabilityNote:
      "Published additional prizes up to $250,000 — its OWN structure, not the Florida Lotto jackpot.",
    sources: [S.floridaLotto],
  },
  timingNote: "Held immediately after the Florida Lotto drawing.",
  extraCostNote: "$1 more per play.",
  sources: [S.floridaLotto],
};

/* ------------------------------------------------------------------ purchase-time add-ons */

/** EZmatch resolves at purchase. It has NO drawn group, by design and by gate. */
const EZMATCH: AddOnSpec = {
  key: "ezmatch", label: "EZmatch", addOnClass: "purchaseTime",
  mechanicNote:
    "Instant win resolved at purchase: EZmatch numbers printed on the ticket are matched against the " +
    "player's own Florida Lotto numbers and win immediately. It creates NO scheduled drawing and has no " +
    "drawn value, so it must never render as a winning-number group.",
  extraCostNote: "$1.",
  addOnPrizeNote: "Wins up to $500 instantly.",
  sources: [S.floridaLotto],
};

const COMBO: AddOnSpec = {
  key: "combo", label: "Combo", addOnClass: "purchaseTime",
  mechanicNote:
    "Purchase-time option that combines winning-number matches across all three of the player's number " +
    "sets. It changes how the ticket is evaluated, not what is drawn, so it has no drawn value.",
  extraCostNote: "$1 extra.",
  addOnPrizeNote: "Extra chance to win up to $10,000.",
  sources: [S.jackpotTriplePlay],
};

/* ------------------------------------------------------------------ the registry */

const V = (o: Omit<ResultFormatVersion, "schemaVersion" | "compatibleStatuses">): ResultFormatVersion => ({
  schemaVersion: "1.0-verified",
  compatibleStatuses: ["verified", "awaiting", "pending", "delayed", "cancelled", "corrected", "closed"],
  ...o,
});

export const FLORIDA_FORMAT_VERSIONS: readonly ResultFormatVersion[] = [
  /* ---- multi-state ---- */
  V({
    formatId: 1012, gameKey: "powerball", displayName: "Powerball",
    effectiveFrom: "2015-10-07", effectiveTo: null,
    primaryGroups: [POOL(5, 1, 69), SPECIAL(1, "Powerball", 1, 26, "ball.powerball")],
    multiplier: {
      kind: "independentlySelected", label: "Power Play", values: [2, 3, 4, 5, 10],
      conditionNote: "A 10x multiplier is included when the jackpot is $150 million or lower.",
      extraCostNote: "$1 per play.", sources: [S.powerball],
    },
    addOns: [], secondaryDraws: [PB_DOUBLE_PLAY], prize: PRIZE_PB,
    verification: "verifiedOfficial", sources: [S.powerball],
  }),

  /* Mega Millions is SPLIT: the built-in multiplier arrived with the 2025-04-08 rule change, so a pre-2025
     historical result must not be rendered with it. The earlier version is deliberately `underReview` —
     we have not verified the pre-2025 ball ranges or Megaplier terms from a primary source. */
  V({
    formatId: 10131, gameKey: "mega-millions", displayName: "Mega Millions",
    effectiveFrom: null, effectiveTo: "2025-04-07",
    primaryGroups: [POOL(5, 1, 70), SPECIAL(1, "Mega Ball", 1, 25, "ball.megaball")],
    multiplier: {
      kind: "unavailable", label: "Megaplier",
      conditionNote:
        "The pre-2025 separately purchased Megaplier is NOT verified from a primary source in this task.",
      sources: [],
    },
    addOns: [], secondaryDraws: [], prize: { ...PRIZE_MM, sources: [] },
    verification: "underReview",
    sources: [], supersededBy: 1013,
  }),
  V({
    formatId: 1013, gameKey: "mega-millions", displayName: "Mega Millions",
    effectiveFrom: "2025-04-08", effectiveTo: null,
    primaryGroups: [POOL(5, 1, 70), SPECIAL(1, "Mega Ball", 1, 24, "ball.megaball")],
    multiplier: {
      kind: "builtIn", label: "Multiplier", values: [2, 3, 4, 5, 10],
      conditionNote:
        "Applied automatically to every non-jackpot win; it is not separately purchased and cannot be declined.",
      sources: [S.megaMillions],
    },
    addOns: [], secondaryDraws: [], prize: PRIZE_MM,
    verification: "verifiedOfficial", sources: [S.megaMillions],
  }),

  /* ---- Florida jackpot games ---- */
  V({
    formatId: 337, gameKey: "florida-lotto", displayName: "Florida Lotto",
    effectiveFrom: null, effectiveTo: null,
    primaryGroups: [POOL(6, 1, 53)],
    multiplier: NO_MULTIPLIER,
    addOns: [EZMATCH], secondaryDraws: [FL_LOTTO_DOUBLE_PLAY], prize: PRIZE_FL_LOTTO,
    verification: "verifiedOfficial", sources: [S.floridaLotto],
  }),
  V({
    formatId: 582, gameKey: "jackpot-triple-play", displayName: "Jackpot Triple Play",
    effectiveFrom: null, effectiveTo: null,
    primaryGroups: [POOL(6, 1, 46)],
    multiplier: NO_MULTIPLIER,
    addOns: [COMBO], secondaryDraws: [], prize: PRIZE_JTP,
    verification: "verifiedOfficial", sources: [S.jackpotTriplePlay],
  }),

  /* ---- Fantasy 5: one format, two daypart events ---- */
  V({
    formatId: 640, gameKey: "fantasy-5", displayName: "Fantasy 5",
    effectiveFrom: null, effectiveTo: null,
    primaryGroups: [POOL(5, 1, 36)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_FANTASY5,
    verification: "verifiedOfficial", sources: [S.fantasy5],
  }),

  /* ---- Pick family. LRG-STATE-030 closed the gap: all four Pick games are now verified from their own
          official pages, each confirming the 9:45 p.m. ET evening draw and the Fireball replacement
          mechanic with a per-game cutoff (Pick 2 13 min, Pick 3 11 min, Pick 4 10 min, Pick 5 12 min). ---- */
  V({
    formatId: 332, gameKey: "pick-3", displayName: "Pick 3",
    effectiveFrom: "2019-04-28", effectiveTo: null,
    primaryGroups: [DIGITS(3)],
    multiplier: NO_MULTIPLIER, addOns: [fireball(S.pick3, 3)], secondaryDraws: [], prize: PRIZE_PICK,
    verification: "verifiedOfficial", sources: [S.pick3],
  }),
  V({
    formatId: 565, gameKey: "pick-5", displayName: "Pick 5",
    effectiveFrom: "2019-04-28", effectiveTo: null,
    primaryGroups: [DIGITS(5)],
    multiplier: NO_MULTIPLIER, addOns: [fireball(S.pick5, 5)], secondaryDraws: [], prize: PRIZE_PICK,
    verification: "verifiedOfficial", sources: [S.pick5],
  }),
  V({
    formatId: 563, gameKey: "pick-2", displayName: "Pick 2",
    effectiveFrom: "2019-04-28", effectiveTo: null,
    primaryGroups: [DIGITS(2)],
    multiplier: NO_MULTIPLIER, addOns: [fireball(S.pick2, 2)], secondaryDraws: [],
    prize: { ...PRIZE_PICK, sources: [S.pick2] },
    verification: "verifiedOfficial", sources: [S.pick2],
  }),
  V({
    formatId: 334, gameKey: "pick-4", displayName: "Pick 4",
    effectiveFrom: "2019-04-28", effectiveTo: null,
    primaryGroups: [DIGITS(4)],
    multiplier: NO_MULTIPLIER, addOns: [fireball(S.pick4, 4)], secondaryDraws: [],
    prize: { ...PRIZE_PICK, sources: [S.pick4] },
    verification: "verifiedOfficial", sources: [S.pick4],
  }),

  /* ---- Cash Pop: one format, five daypart events. Stake-dependent prize. ---- */
  V({
    formatId: 614, gameKey: "cash-pop", displayName: "Cash Pop",
    effectiveFrom: null, effectiveTo: null,
    primaryGroups: [SINGLE(1, 15)],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [], prize: PRIZE_CASH_POP,
    verification: "verifiedOfficial", sources: [S.cashPop],
  }),

  /* ---- Retired ---- */
  V({
    formatId: 1015, gameKey: "cash4life", displayName: "Cash4Life",
    effectiveFrom: null, effectiveTo: "2026-02-21",
    primaryGroups: [POOL(5, 1, 60), SPECIAL(1, "Cash Ball", 1, 4, "ball.cashball")],
    multiplier: NO_MULTIPLIER, addOns: [], secondaryDraws: [],
    prize: { kind: "unavailable", cashValueAvailable: false, sources: [] },
    verification: "verifiedOfficial",
    sources: [S.cash4life],
    retirement: {
      retiredOn: "2026-02-21",
      claimWindowNote: "Prizes must be claimed within 180 days after the winning draw date.",
      replacementGameId: null,
      retainHistoricalResults: true,
      sources: [S.cash4life],
    },
  }),
];

/* ------------------------------------------------------------------ schedule conflicts */

/**
 * Recorded conflicts between the production `game.csv` export and the operator's published times.
 *
 * `CLAUDE.md` §2 requires conflicts to be recorded rather than silently reconciled. **Official wins** —
 * but the conflict is preserved here so nobody "fixes" the corrected value back to the stale one.
 */
export const SCHEDULE_CONFLICTS = [
  {
    gameKeys: ["pick-2", "pick-3", "pick-4", "pick-5"],
    field: "evening draw time",
    productionExport: "7:57 PM ET (04-sample-data/reference-tables/game.csv GAMETIME)",
    official: "9:45 p.m. ET",
    resolution: "Official wins. The production export is stale for the Pick family evening draw.",
    verifiedFrom: [S.pick2.url, S.pick3.url, S.pick4.url, S.pick5.url],
    accessed: ACCESSED,
    scope: "Verified directly for ALL FOUR Pick games from their own official pages (LRG-STATE-030). Every one publishes the 9:45 p.m. ET evening draw.",
  },
  {
    gameKeys: ["florida-lotto"],
    field: "sales cutoff",
    productionExport: "35 minutes before draw time (implies 10:25 p.m. against an 11:00 p.m. draw)",
    official: "10:55 p.m. ET",
    resolution: "Official wins.",
    verifiedFrom: [S.floridaLotto.url],
    accessed: ACCESSED,
    scope: "Verified directly.",
  },
  {
    gameKeys: ["fantasy-5"],
    field: "draw times and cutoff",
    productionExport: "1:05 PM / 11:15 PM ET; 20 minutes before",
    official: "1:05 p.m. and 11:15 p.m. ET; 20 minutes before (12:45 p.m. / 10:55 p.m.)",
    resolution: "No conflict — the production export AGREES with the operator here.",
    verifiedFrom: [S.fantasy5.url],
    accessed: ACCESSED,
    scope: "Verified directly. Recorded to show the staleness is Pick-specific, not systematic.",
  },
] as const;

export const FLORIDA_RULE_SOURCES = S;
