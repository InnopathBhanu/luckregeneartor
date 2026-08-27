/*
 * THE TWO FLAGSHIP GAME CONFIGURATIONS — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §1 (Powerball current model), §2 (Mega Millions current model), §3 (rule eras), §15, §20,
 * §24; the operator quotations transcribed in `lib/state/floridaFormatRegistry.ts` with their access dates;
 * `CLAUDE.md` §14 (every fact declares whether it is production-derived, and retains provenance).
 *
 * ══ THIS FILE IS THE ONLY DIFFERENCE BETWEEN THE TWO PAGES ══
 *
 * `/powerball` and `/mega-millions` render the same components in the same order from the same model builder.
 * Everything that distinguishes them — 69 versus 70, a chosen Power Play versus a built-in multiplier, three
 * draw nights versus two, a UK offering versus none, Double Play versus no secondary drawing, which tool leads
 * the launcher, which tag the content feeds carry — is a value in this file.
 *
 * ══ WHAT IS DELIBERATELY RECORDED AS A GAP ══
 *
 * Anything the repository does not hold is `notCaptured` with the reason, and renders as a stated gap rather
 * than as a value:
 *
 *   - the operator prize matrix for either game (which combinations pay, and how much);
 *   - Powerball's ticket price — the captured operator page quotes the $1 Power Play add-on but not the base
 *     play price, and BP-04A does not state it either (it states Mega Millions' $5, which is used);
 *   - the list of jurisdictions that sell Double Play;
 *   - the cash value of the current advertised jackpot — the production feed does not carry one and we never
 *     derive it from the annuity;
 *   - the UK advertised Powerball value and its payment treatment (BP-04A §15 requires the distinction be shown;
 *     no UK figure is captured, so the distinction is explained and no number is invented).
 */

import type {
  FlagshipBallGroup, FlagshipMultiplier, FlagshipRuleEra, FlagshipSecondaryDraw, Gap, Sourced,
} from "./flagshipContract";
import type { OddsMatrix } from "./flagshipOdds";

/* ------------------------------------------------------------------ sources */

/**
 * The two primary operator pages, transcribed verbatim in `floridaFormatRegistry.ts` on the dates shown.
 *
 * They are Florida Lottery pages for the two multi-state games. That is a legitimate primary source for the
 * GAME rules — Florida publishes the game owner's matrix, schedule and add-on terms — and it is the source the
 * verified format registry already cites. It is NOT a source for anything Florida-specific, and nothing
 * Florida-specific appears on these national hubs.
 */
const SRC = {
  powerball: {
    url: "https://floridalottery.com/games/draw-games/powerball",
    accessed: "2026-07-28",
  },
  megaMillions: {
    url: "https://floridalottery.com/games/draw-games/mega-millions",
    accessed: "2026-07-28",
  },
  bp04a: { url: "03-docs/01-approved-blueprints/games/05A-lotterycorner-flagship-game-page-blueprint-FINAL-APPROVED.md" },
} as const;

const official = <T,>(value: T, src: { url: string; accessed: string }, note?: string): Sourced<T> => ({
  value,
  verification: "verifiedOfficial",
  sourceRef: note ? `${src.url} — ${note}` : src.url,
  accessed: src.accessed,
});

const blueprint = <T,>(value: T, section: string): Sourced<T> => ({
  value,
  verification: "governedDocument",
  sourceRef: `BP-04A ${section}`,
});

/* ------------------------------------------------------------------ the config shape */

export interface FlagshipGameConfig {
  gameSlug: "powerball" | "mega-millions";
  /** The production game id this hub's current result belongs to. Never rewritten. */
  gameId: number;
  gameLabel: string;
  /** Visual identity token, resolved through the existing game-logo registry. */
  visualIdentity: string;
  /*
   * FGP-011: the per-game accent no longer lives here.
   *
   * It was `accentToken: "powerball" | "megaball"`, which worked while exactly two games had a theme and would
   * have needed a new union member for every game after that. The colour is now resolved from `gameSlug` through
   * `lib/theme/gameThemeRegistry.ts`, which Home, the state pages and the flagship hubs all share — so a game
   * has ONE identity wherever it appears, and this config carries none of it.
   */
  /** The tag the forum, blog and news adapters are queried by. */
  contentTag: string;
  canonicalPath: string;

  /** Drawn groups, in render order. */
  groups: readonly FlagshipBallGroup[];
  /** The same shape, reduced for the odds engine. Derived from `groups` at build time by `matrixOf`. */
  matrix: OddsMatrix;
  specialLabel: string;

  drawDays: Sourced<string>;
  drawTimeEt: Sourced<string>;
  salesCutoffEt: Sourced<string>;
  ticketPrice: Sourced<string> | Gap;

  multiplier: FlagshipMultiplier;
  secondaryDraw: FlagshipSecondaryDraw | null;
  ruleEras: readonly FlagshipRuleEra[];

  /** BP-04A §20 — where the game is sold and how the offering differs. Facts only, no ranking. */
  jurisdictionNotes: readonly { key: string; heading: string; body: Sourced<string> | Gap }[];
  /** BP-04A §24 — guidance for a visitor outside a selling jurisdiction. */
  internationalNote: Sourced<string>;

  /** Which tools lead this game's launcher (BP-05C §8 / §9). Keys resolve in `flagshipTools.ts`. */
  leadToolKeys: readonly string[];

  /** Facts known to exist and not held here. Rendered where they belong, never as silence. */
  gaps: readonly Gap[];

  seo: {
    title: string;
    description: string;
    h1: string;
    breadcrumbLabel: string;
  };
}

/** Reduce configured groups to the odds matrix, so the two can never disagree. */
export function matrixOf(groups: readonly FlagshipBallGroup[]): OddsMatrix {
  const main = groups.find((g) => g.role === "main");
  const special = groups.find((g) => g.role === "special");
  if (!main) throw new Error("matrixOf: a flagship game must declare a main group");
  return {
    mainCount: main.count,
    mainPool: main.max,
    specialCount: special?.count ?? 0,
    specialPool: special?.max ?? 0,
  };
}

/* ------------------------------------------------------------------ shared gaps */

const PRIZE_MATRIX_GAP = (game: string, url: string): Gap => ({
  what: `The ${game} prize amounts, and which number combinations win a prize`,
  why:
    `The operator's prize matrix is not captured in this build. The odds below are counted from the published ` +
    `number matrix, which is verified; prize amounts are a separate published table. Check ${url} for the ` +
    `current prize levels.`,
});

const CASH_VALUE_GAP: Gap = {
  what: "The cash value of the advertised jackpot",
  why:
    "The production results feed carries the advertised annuity only. A cash value is published separately by " +
    "the game operator and is never derived here from the annuity figure.",
  /* The hero has the most valuable space on the page; five lines of explanation there crowded out the actions.
     The short form runs in the hero, the full `why` in the odds section and the FAQ. Nothing is lost. */
  shortWhy: "Cash value not published in this feed.",
};

/* ------------------------------------------------------------------ Powerball */

const POWERBALL_GROUPS: readonly FlagshipBallGroup[] = Object.freeze([
  {
    key: "main",
    label: null,
    accessibleLabel: "Winning numbers",
    count: 5,
    min: 1,
    max: 69,
    role: "main",
    colorToken: "ball.default",
  },
  {
    key: "powerball",
    label: "Powerball",
    accessibleLabel: "Powerball",
    count: 1,
    min: 1,
    max: 26,
    role: "special",
    colorToken: "ball.powerball",
  },
]);

const POWERBALL: FlagshipGameConfig = {
  gameSlug: "powerball",
  gameId: 1012,
  gameLabel: "Powerball",
  visualIdentity: "powerball",
  contentTag: "Powerball",
  canonicalPath: "/powerball",

  groups: POWERBALL_GROUPS,
  matrix: matrixOf(POWERBALL_GROUPS),
  specialLabel: "Powerball",

  drawDays: official(
    "Monday, Wednesday and Saturday",
    SRC.powerball,
    '"Powerball drawings are held on Monday, Wednesday and Saturday."',
  ),
  drawTimeEt: official("10:59 p.m. ET", SRC.powerball, "draw time published for the Powerball drawing"),
  salesCutoffEt: official(
    "10:00 p.m. ET on a draw night",
    SRC.powerball,
    '"Tickets until 10:00 p.m. ET on draw night."',
  ),
  ticketPrice: {
    what: "The Powerball base ticket price",
    why:
      "The captured operator page quotes the $1 Power Play add-on price but not the base play price, and BP-04A " +
      "does not state it. No figure is shown rather than a remembered one.",
  },

  multiplier: {
    mode: "independentlySelected",
    label: "Power Play",
    values: [2, 3, 4, 5, 10],
    conditionNote: official(
      "Power Play costs $1 per play and must be added to the ticket. It multiplies non-jackpot prizes 2X to 5X, " +
        "and a 10X multiplier is included when the advertised jackpot is $150 million or lower. A ticket without " +
        "Power Play is unaffected by the multiplier drawn.",
      SRC.powerball,
      '"Power Play $1/play, 2X-5X, with a 10X multiplier included when the jackpot is $150 million or lower."',
    ),
    drawnWithResult: true,
  },

  secondaryDraw: {
    key: "double-play",
    label: "Double Play",
    timingNote: official(
      "Double Play is an additional drawing held after the main Powerball drawing, using the same ticket. It draws " +
        "its own five numbers and its own Powerball, and it is never a second game.",
      SRC.powerball,
      '"Double Play is an additional drawing following Powerball."',
    ),
    topPrizeNote: official(
      "Double Play prizes reach up to $10 million.",
      SRC.powerball,
      '"Double Play … with prizes up to $10 million."',
    ),
  },

  ruleEras: [
    {
      eraId: "pb-2015",
      effectiveFrom: "2015-10-07",
      effectiveTo: null,
      label: "Five numbers 1–69 plus a Powerball 1–26",
      summary: official(
        "The current matrix draws five numbers from 1 through 69 and one Powerball from 1 through 26.",
        SRC.powerball,
        '"Select five numbers 1-69 and a Powerball 1-26."',
      ),
    },
  ],

  jurisdictionNotes: [
    {
      key: "us-uk-jackpot",
      heading: "The United States and the United Kingdom share the jackpot only",
      body: blueprint(
        "Powerball expanded to the United Kingdom in July 2026. Only the jackpot is shared between U.S. and UK " +
          "participation. Lower-tier prize structures and administration stay separate, and the two use different " +
          "official advertised prize conventions — so a U.S. advertised value and a UK advertised value are not " +
          "directly comparable figures.",
        "§1",
      ),
    },
    {
      key: "uk-display",
      heading: "The UK advertised value",
      body: {
        what: "The current UK official advertised Powerball value, its currency and its payment treatment",
        why:
          "BP-04A §15 requires the U.S. and UK official displays to be distinguished. No UK figure is captured in " +
          "this build, so the distinction is explained and no UK number is shown.",
      },
    },
    {
      key: "ca-exception",
      heading: "California prize exception",
      body: blueprint(
        "California awards its Powerball prizes on a pari-mutuel basis rather than at the fixed lower-tier amounts " +
          "used elsewhere, so a California prize for the same match can differ from another state's.",
        "§20",
      ),
    },
    {
      key: "double-play-jurisdictions",
      heading: "Where Double Play is offered",
      body: {
        what: "The list of jurisdictions that sell Double Play",
        why:
          "Double Play is not offered everywhere Powerball is sold. The participating-jurisdiction list is not " +
          "captured in this build, so no state is named either way.",
      },
    },
    {
      key: "claims",
      heading: "Claims and taxes are local",
      body: blueprint(
        "A Powerball prize is claimed from the lottery that sold the ticket, under that jurisdiction's own claim " +
          "process, deadlines and tax withholding. The game is shared; the claim is not.",
        "§20",
      ),
    },
  ],

  internationalNote: blueprint(
    "Powerball is sold by U.S. state lotteries and, since July 2026, in the United Kingdom. Results, tools and " +
      "guides on this page are available to anyone, anywhere. If someone contacts you claiming you have won a " +
      "Powerball prize you did not buy a ticket for, it is a scam — no lottery asks a winner for a payment to " +
      "release a prize.",
    "§24",
  ),

  leadToolKeys: [
    "check-numbers", "generator", "statistics", "jackpot-tracker",
    "double-play-checker", "power-play-explainer", "tax-calculator", "cash-vs-annuity",
  ],

  gaps: [
    PRIZE_MATRIX_GAP("Powerball", SRC.powerball.url),
    CASH_VALUE_GAP,
  ],

  seo: {
    /* BP-04A §36 fixes this title exactly. It is not reworded. */
    title: "Powerball Results, Jackpot, Winning Numbers & Tools | LotteryCorner",
    description:
      "Powerball winning numbers, the current jackpot, Power Play and Double Play explained, a number checker, a " +
      "generator, draw statistics and the real odds — with every source named.",
    h1: "Powerball",
    breadcrumbLabel: "Powerball",
  },
};

/* ------------------------------------------------------------------ Mega Millions */

const MEGA_MILLIONS_GROUPS: readonly FlagshipBallGroup[] = Object.freeze([
  {
    key: "main",
    label: null,
    accessibleLabel: "Winning numbers",
    count: 5,
    min: 1,
    max: 70,
    role: "main",
    colorToken: "ball.default",
  },
  {
    key: "mega-ball",
    label: "Mega Ball",
    accessibleLabel: "Mega Ball",
    count: 1,
    min: 1,
    max: 24,
    role: "special",
    colorToken: "ball.megaball",
  },
]);

const MEGA_MILLIONS: FlagshipGameConfig = {
  gameSlug: "mega-millions",
  gameId: 1013,
  gameLabel: "Mega Millions",
  visualIdentity: "mega-millions",
  contentTag: "Mega Millions",
  canonicalPath: "/mega-millions",

  groups: MEGA_MILLIONS_GROUPS,
  matrix: matrixOf(MEGA_MILLIONS_GROUPS),
  specialLabel: "Mega Ball",

  drawDays: official(
    "Tuesday and Friday",
    SRC.megaMillions,
    '"MEGA MILLIONS drawings are held every Tuesday and Friday night at 11 PM Eastern Time."',
  ),
  drawTimeEt: official(
    "11:00 p.m. ET",
    SRC.megaMillions,
    '"… every Tuesday and Friday night at 11 PM Eastern Time."',
  ),
  salesCutoffEt: official("10:00 p.m. ET", SRC.megaMillions, '"Tickets until 10:00 p.m. ET."'),
  ticketPrice: blueprint("$5 per play", "§2"),

  multiplier: {
    mode: "builtIn",
    label: "Multiplier",
    values: [2, 3, 4, 5, 10],
    conditionNote: official(
      "Every Mega Millions play is assigned a random 2X, 3X, 4X, 5X or 10X multiplier when it is bought, and it " +
        "is applied automatically to every non-jackpot win. It is not separately purchased, it cannot be declined, " +
        "and it is not a value drawn at the drawing — so no multiplier appears beside the winning numbers. Two " +
        "tickets matching the same numbers can win different amounts.",
      SRC.megaMillions,
      '"Every non-jackpot win will multiply its base prize by 2, 3, 4, 5, or 10 times automatically!"',
    ),
    drawnWithResult: false,
  },

  secondaryDraw: null,

  ruleEras: [
    {
      eraId: "mm-2025",
      effectiveFrom: "2025-04-08",
      effectiveTo: null,
      label: "Five numbers 1–70 plus a Mega Ball 1–24, $5 a play",
      summary: official(
        "Mega Millions changed to its current format in April 2025: five numbers from 1 through 70 and one Mega " +
          "Ball from 1 through 24, at $5 per play, with a multiplier assigned to every ticket.",
        SRC.megaMillions,
        '"Select five numbers 1-70 and a MEGA BALL 1-24." Effective 2025-04-08.',
      ),
    },
    {
      eraId: "mm-pre-2025",
      effectiveFrom: null,
      effectiveTo: "2025-04-07",
      label: "Before April 2025 — a different matrix and a separately bought Megaplier",
      summary: {
        value:
          "Drawings before April 8, 2025 used a different Mega Ball range and a separately purchased Megaplier " +
          "rather than a built-in multiplier. Statistics that mix the two eras are not comparable, and the earlier " +
          "terms are not verified from a primary source in this build.",
        verification: "notCaptured",
        sourceRef:
          "lib/state/floridaFormatRegistry.ts format 10131 — recorded `underReview`; the pre-2025 ball ranges and " +
          "Megaplier terms are explicitly not verified.",
      },
    },
  ],

  jurisdictionNotes: [
    {
      key: "us-only",
      heading: "Sold only in U.S. selling jurisdictions",
      body: blueprint(
        "Mega Millions is officially sold only in U.S. selling jurisdictions. There is no official sale outside " +
          "the United States, and no site can legally sell you an official Mega Millions ticket overseas.",
        "§2 / §24",
      ),
    },
    {
      key: "ticket-multiplier",
      heading: "The multiplier belongs to the ticket, not to the drawing",
      body: official(
        "Because the multiplier is assigned to each play at purchase, it is printed on the ticket. Checking a " +
          "non-jackpot win means reading the multiplier from your own ticket — there is no drawing-level multiplier " +
          "to look up.",
        SRC.megaMillions,
        '"Every non-jackpot win will multiply its base prize by 2, 3, 4, 5, or 10 times automatically!"',
      ),
    },
    {
      key: "ca-exception",
      heading: "California pari-mutuel exception",
      body: blueprint(
        "California awards its Mega Millions lower-tier prizes on a pari-mutuel basis rather than at the fixed " +
          "amounts used elsewhere, so a California prize for the same match can differ from another state's.",
        "§2 / §20",
      ),
    },
    {
      key: "claims",
      heading: "Claims and taxes are local",
      body: blueprint(
        "A Mega Millions prize is claimed from the lottery that sold the ticket, under that jurisdiction's own " +
          "claim process, deadlines and tax withholding.",
        "§20",
      ),
    },
  ],

  internationalNote: blueprint(
    "Mega Millions results, tools and guides on this page are available to anyone, anywhere — but the game itself " +
      "is sold only in U.S. selling jurisdictions. If someone contacts you claiming you have won a Mega Millions " +
      "prize you did not buy a ticket for, it is a scam; no lottery asks a winner for a payment to release a prize.",
    "§24",
  ),

  leadToolKeys: [
    "check-numbers", "ticket-multiplier-prize", "generator", "statistics",
    "jackpot-tracker", "tax-calculator", "cash-vs-annuity", "drawn-together",
  ],

  gaps: [
    PRIZE_MATRIX_GAP("Mega Millions", SRC.megaMillions.url),
    CASH_VALUE_GAP,
  ],

  seo: {
    /* BP-04A §36 fixes this title exactly. */
    title: "Mega Millions Results, Jackpot, Numbers & Tools | LotteryCorner",
    description:
      "Mega Millions winning numbers, the current jackpot, how the built-in ticket multiplier works, a number " +
      "checker, a generator, draw statistics and the real odds — with every source named.",
    h1: "Mega Millions",
    breadcrumbLabel: "Mega Millions",
  },
};

/* ------------------------------------------------------------------ lookup */

export const FLAGSHIP_GAMES: readonly FlagshipGameConfig[] = Object.freeze([POWERBALL, MEGA_MILLIONS]);

export function flagshipGameConfig(gameSlug: string): FlagshipGameConfig | undefined {
  return FLAGSHIP_GAMES.find((g) => g.gameSlug === gameSlug.toLowerCase());
}

/** Whether a value is a recorded gap rather than a sourced fact. Used by every renderer. */
export function isGap<T>(v: Sourced<T> | Gap): v is Gap {
  return typeof (v as Gap).what === "string";
}
