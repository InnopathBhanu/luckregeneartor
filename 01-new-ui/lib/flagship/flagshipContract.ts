/*
 * THE FLAGSHIP GAME HUB CONTRACT — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A `05A-lotterycorner-flagship-game-page-blueprint-FINAL-APPROVED.md` (PF-03, the root hubs
 * `/powerball` and `/mega-millions`), BP-05C `05C-lotterycorner-tools-and-ai-insights-blueprint-FINAL-APPROVED.md`
 * (tool access patterns and the AI insight catalog), the frozen Constitution, `CLAUDE.md` §9/§11/§14.
 *
 * ══ WHY A CONTRACT FILE AT ALL ══
 *
 * Powerball and Mega Millions must differ through CONFIGURATION, not through two page templates. Every type here
 * exists so that the difference between the two pages is a data edit: the number matrix, the draw rhythm, how the
 * multiplier is obtained, which jurisdictions sell it, which tools lead, which tag the content feeds carry.
 * Nothing in `components/flagship/**` may branch on a game slug, and these types are what make that enforceable.
 *
 * ══ THREE RULES ENCODED IN THE TYPES ══
 *
 *   1. **Provenance is a required field, not a convention.** `Sourced<T>` carries the value AND where it came
 *      from. A fact with no source cannot be constructed, so it cannot be rendered as if it were verified
 *      (`CLAUDE.md` §14).
 *
 *   2. **A gate is a state, not a boolean.** `GateState` distinguishes "you must sign in" from "there is nowhere
 *      to sign in yet". Conflating them is how a page ends up linking to a login route that does not exist.
 *
 *   3. **Availability is separate from access.** `Availability` says whether the DATA exists; `ToolAccess` says
 *      who may run the tool. A tool with no data is not a locked tool, and must not be drawn as one.
 */

/* ------------------------------------------------------------------ provenance */

/** How confident we are about a published fact, and why. */
export type Verification =
  /** Read from a primary operator source, with the supporting quotation recorded. */
  | "verifiedOfficial"
  /** Taken from a tier-2/3/4 governed document rather than an operator page. */
  | "governedDocument"
  /** Arithmetic over a verified fact. True by computation, not by citation. */
  | "computed"
  /** Known to exist but not captured in this repository. Renders as a stated gap, never as a value. */
  | "notCaptured";

/** A fact plus where it came from. There is no way to build one without a source. */
export interface Sourced<T> {
  value: T;
  verification: Verification;
  /** Human-readable origin: an operator URL, a blueprint id, or the computation performed. */
  sourceRef: string;
  /** When the source was read, where that is meaningful. */
  accessed?: string;
}

/** A fact we know we do not hold. Rendered as an explicit gap so silence is never mistaken for zero. */
export interface Gap {
  /** What is missing, in reader-facing words. */
  what: string;
  /** Why it is missing and what would close it. */
  why: string;
  /**
   * A one-line form, for surfaces where the full reason would crowd out something the reader came for.
   *
   * The gap is still STATED wherever it applies — this shortens it, it never hides it, and the full `why` is
   * always rendered somewhere on the same page.
   */
  shortWhy?: string;
}

/* ------------------------------------------------------------------ game shape */

/** One drawn group, as configured. The renderer reads `count`, never a literal. */
export interface FlagshipBallGroup {
  key: string;
  /** `null` for the main group, which the section heading names. */
  label: string | null;
  accessibleLabel: string;
  count: number;
  min: number;
  max: number;
  /** Non-colour role, so a special ball is never distinguished by hue alone (WCAG 2.2 AA). */
  role: "main" | "special";
  colorToken: string;
}

/** How a game's multiplier is obtained. The distinction is a Constitution classification, not a label. */
export type MultiplierMode =
  /** Bought separately and only applies if the ticket carries it — Power Play. */
  | "independentlySelected"
  /** Applied to every non-jackpot win automatically — the current Mega Millions multiplier. */
  | "builtIn"
  /** The game has none. */
  | "none";

export interface FlagshipMultiplier {
  mode: MultiplierMode;
  label: string;
  values: readonly number[];
  /** How it is obtained and what it does, in the operator's own terms. */
  conditionNote: Sourced<string>;
  /** Whether a value for it appears beside the drawn numbers. `builtIn` multipliers do not. */
  drawnWithResult: boolean;
}

/** A separate drawing run against the same ticket — Powerball Double Play. Never a second game. */
export interface FlagshipSecondaryDraw {
  key: string;
  label: string;
  timingNote: Sourced<string>;
  topPrizeNote: Sourced<string> | null;
}

/** One era of a game's rules. Checking uses the era of the selected draw (BP-04A §3). */
export interface FlagshipRuleEra {
  eraId: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  label: string;
  /** What changed at this boundary, for the reader. */
  summary: Sourced<string>;
}

/* ------------------------------------------------------------------ gating */

export type GateState =
  /** Anyone may use it, right now, to completion. */
  | "public"
  /**
   * Real sign-in exists and this needs it. REACHABLE since Conflict 37 (2026-08-11): the shared /login flow
   * works end to end against the review data layer, so a gated control opens it with an `FD-ACC-12` intent.
   */
  | "signedIn"
  /**
   * It needs an Account service that is NOT connected. Retired for the account foundation itself; retained
   * for any capability whose backing service (export metering, model AI, a forum) is still API-phase.
   */
  | "signedInUnavailable";

/**
 * A capability that needs an account, and is honest about what happens when it is used.
 *
 * ══ THE GOVERNANCE POSITION — SETTLED BY CONFLICT 37 (2026-08-11) ══
 *
 * This type used to carry the Conflict 28 override: visible-but-locked, with no sign-in destination because
 * none existed. The Tier-1 founder instruction of 2026-08-11 closed that question for every page family:
 * gated capabilities are VISIBLE AND FUNCTIONAL via the account foundation. A signed-out reader gets the
 * `FD-DAT-04` affordance ("Sign in free to use") opening the real shared `/login` flow with an `FD-ACC-12`
 * intent; a signed-in reader's continuity actions execute against the review account store for real.
 *
 * WHAT REMAINS TRUE. No control is `disabled`, none says "Coming soon", no success is claimed that did not
 * occur, nothing claims DELIVERY of any notification (`FD-ACC-11` — no channel exists), and nothing anywhere
 * mentions a plan, tier, trial, quota or upgrade (`FD-ACC-16`, `FD-DAT-06`).
 */
export interface LockedCapability {
  key: string;
  label: string;
  /** What the reader would get from it. Concrete, never a pitch. */
  benefit: string;
  gate: GateState;
}

/* ------------------------------------------------------------------ tools */

/** BP-05C §0.1 access patterns. `insider` is deliberately absent: `CLAUDE.md` §16 forbids implementing it. */
export type ToolAccess =
  /** Completes without sign-in. */
  | "publicComplete"
  /** Inputs, method and sample output visible; Run asks for sign-in. */
  | "publicPreview"
  /** Saving, history and comparison. */
  | "signedIn";

/** Whether the DATA a tool needs exists in this build. Independent of who may run it. */
export type Availability =
  | "available"
  /** The tool works, but the data it analyses is not connected. Says so; never renders an empty chart. */
  | "dataNotConnected"
  /** The format cannot express this tool at all. */
  | "unsupportedFormat";

export interface FlagshipTool {
  key: string;
  label: string;
  /** One line: what it calculates or analyses. */
  purpose: string;
  category: "check" | "generate" | "analyse" | "money" | "personal";
  access: ToolAccess;
  availability: Availability;
  /** Rendered inline on this page, rather than only launched. */
  inline: boolean;
  /** Signed-in continuations this tool offers. Visible and locked. */
  signedInExtras: readonly LockedCapability[];
  /** Where the full tool will live once its route is approved. `null` while no route exists (§10 / BP-04A §40). */
  route: string | null;
  /** Why `route` is null, or why availability is not `available`. */
  note?: string;
}

/* ------------------------------------------------------------------ AI */

/**
 * One AI entry point.
 *
 * BP-04A §17 and BP-05C §12: AI explains deterministic output, it does not compute the answer and it never
 * predicts. `boundary` is rendered beside the prompt so the reader reviews the guardrail, not just the offer.
 */
export interface AiSurface {
  key: string;
  /** The prompt chip's text — a question in a player's words. */
  label: string;
  /** Which page section this entry belongs to, so AI is contextual rather than one floating button. */
  section: FlagshipSectionId;
  /** The governed sources an answer would be restricted to. */
  grounding: readonly string[];
  /** What the answer may not do. Rendered, not just documented. */
  boundary: string;
  /**
   * The deterministic answer this page can already give, computed from its own governed data.
   * `null` where the data for it is not held — which is said, never filled in.
   */
  deterministicAnswer?: readonly string[] | null;
}

/* ------------------------------------------------------------------ tagged content */

/** The tag a content system is queried by. `Powerball` / `Mega Millions` — the game's own brand tag. */
export type ContentTag = string;

export type TaggedContentKind = "forum" | "blog" | "news";

/**
 * One tagged content item.
 *
 * Nothing constructs one of these in this build. The adapters return empty arrays because no forum, blog or news
 * platform exists (`FD-ACC-10`; the audit found no forum table among the 37 production tables). The type exists
 * so the UI is written against a real contract rather than against placeholder prose — which is the difference
 * between an adapter seam and a fabrication.
 */
export interface TaggedContentItem {
  id: string;
  kind: TaggedContentKind;
  title: string;
  /** Author display name. Human-authored only — the Constitution forbids AI accounts that appear human. */
  author: string;
  publishedIso: string;
  /** Absolute or app-relative destination. Never invented. */
  href: string;
  excerpt: string;
  tags: readonly ContentTag[];
  /** Forum only. */
  replyCount?: number;
  /**
   * Where the item came from — FGP-009.
   *
   * Required, not optional. An item with no stated provenance is exactly the thing that becomes indistinguishable
   * from a real member's post six months later, so the type refuses to construct one.
   */
  provenance: "productionFeed" | "synthetic/internal-review";
}

export interface TaggedContentFeed {
  kind: TaggedContentKind;
  tag: ContentTag;
  items: readonly TaggedContentItem[];
  /** Why the feed is empty, when it is. Rendered as the empty state. */
  unavailable: Gap | null;
}

/* ------------------------------------------------------------------ sections */

/**
 * The governed section ids.
 *
 * Every id is BP-04A §12's own, with ONE addition: `FG-07` is split into `FG-07A` (the generator) and `FG-07B`
 * (the Stats Lab). The blueprint treats FG-07 as a single "Tools and Analysis Launcher"; the active founder
 * instruction lists the generator and the Stats Lab as separate sections with the jackpot tracker between them,
 * so one blueprint section becomes two page sections. The taxonomy is extended rather than renamed, so the
 * mapping back to §12 stays exact.
 */
export type FlagshipSectionId =
  | "FG-01" | "AD-FG00" | "FG-02" | "FG-03" | "AD-FG01" | "FG-04" | "FG-05" | "FG-06"
  | "AD-FG02" | "FG-07A" | "FG-07B" | "FG-08" | "FG-09" | "AD-FG03" | "FG-10" | "FG-11" | "FG-12"
  | "FG-13" | "FG-14" | "FG-15" | "AD-FG04";

/**
 * ══ THE PAGE ORDER — LRG-FLAGSHIP-004 REVISION ══
 *
 * BP-04A §12 orders the anonymous sequence result → check → AI → intelligence → rules → jurisdictions → tools →
 * history → jackpot → international → guides → news → community → alerts → trust.
 *
 * The active founder instruction supplies a different order and gives the reason: the page *"still feels like
 * many separate white boxes stacked one after another"* and must become *"a premium command center"* built round
 * five jobs — Check, Explore, Build, Follow, Ask AI. An explicit founder instruction in the active task is Tier 1
 * in `CLAUDE.md` §2, above the tier-4 blueprint. Recorded in `source-conflicts.md` Conflict 31.
 *
 * ══ FIVE SECTIONS ARE MERGED RATHER THAN STACKED ══
 *
 * The instruction's own remedy for a passive section is *"compress it, move it lower, or merge it"*. Five ids are
 * therefore merged into a neighbour instead of owning a box of their own. Each keeps its governed id as a
 * `data-section-id` on the panel that absorbed it, so the mapping back to §12 stays exact and traceable:
 *
 *   FG-14  alerts and follow      → into FG-09, which the instruction titles "Jackpot Tracker and Alerts"
 *   FG-11  tagged guides          → into FG-13, one integrated tagged-content module
 *   FG-12  tagged news            → into FG-13, likewise
 *   FG-06  jurisdiction rules     → into FG-05, as a disclosure beside the odds
 *   FG-10  where it is played     → into FG-15, whose subject is already trust and caveats
 *
 * FG-04 (draw intelligence) stays merged into the hero and the Stats Lab, as in the previous revision.
 *
 * ONE DEPARTURE FROM THE FOUNDER'S NUMBERING, unchanged from the last pass and for the same reason: their list
 * places AI second, and it is second here. Every contextual chip on the page targets that one region, so it has
 * to sit above the tools that point at it.
 */
export const FLAGSHIP_SECTION_ORDER: readonly FlagshipSectionId[] = Object.freeze([
  "FG-01",   /*  1  Hero command centre — result, jackpot, next draw, five primary actions */
  "FG-03",   /*  2  AI quick actions — the shared answer region every chip targets */
  "AD-FG00",
  "FG-02",   /*  3  Check your ticket — latest / last 10 / all history */
  "FG-09",   /*  4  Jackpot tracker AND alerts (absorbs FG-14) */
  "AD-FG01",
  "FG-07A",  /*  5  Build a line */
  "FG-08",   /*  6  Historical draw explorer — compact by default */
  "FG-07B",  /*  7  Stats Lab, wired into the explorer */
  "AD-FG02",
  "FG-13",   /*  8  Tagged discussions, news and guides (absorbs FG-11 and FG-12) */
  "AD-FG03",
  "FG-05",   /*  9  Prize, odds and rules (absorbs FG-06) */
  "FG-15",   /* 10  Trust, responsible play and FAQ (absorbs FG-10) */
  "AD-FG04",
]);

/** Sections whose content is rendered inside another section rather than in a box of their own. */
export const FLAGSHIP_MERGED_SECTIONS: Readonly<Record<string, FlagshipSectionId>> = Object.freeze({
  "FG-06": "FG-05",
  "FG-10": "FG-15",
  "FG-11": "FG-13",
  "FG-12": "FG-13",
  "FG-14": "FG-09",
});

/** BP-04A §11 internal anchor contract. Fragment ids the page must own. */
export const FLAGSHIP_ANCHORS = Object.freeze({
  latestResult: "latest-result",
  checkNumbers: "check-numbers",
  askAi: "ask-ai",
  drawInsights: "draw-insights",
  howToPlay: "how-to-play",
  prizesAndOdds: "prizes-and-odds",
  tools: "tools",
  resultsHistory: "results-history",
  jackpotHistory: "jackpot-history",
  jurisdictions: "jurisdictions",
  international: "international",
  guides: "guides",
  news: "news",
  community: "community",
  alerts: "alerts",
  trust: "trust",
  generator: "generator",
  statsLab: "stats-lab",
});
