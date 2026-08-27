/*
 * Florida State Content Manifest — GOVERNED, EVIDENCE-ONLY.
 *
 * Task LRG-STATE-021, expanded by LRG-STATE-025. Authority: FD-S-03 (a separate governed content
 * contract, NOT a database schema, API payload or fixture format); PF-02 §56A; FD-S-01 / FD-S-02
 * (nothing unsourced renders as fact); FD-X-01 (Florida is the first representative instance of one
 * State family, never the universal template); FD-X-11 (absence of commerce evidence resolves to
 * `unknown` / `underReview` / `unavailable`, NEVER to `retailOnly`); FD-X-13 (the content expansions
 * required before DS-37).
 *
 * WHAT THIS IS. A content contract holding only what can actually be evidenced, with the provenance the
 * publication gate needs. It is deliberately NOT the fixture shape, NOT an API payload and NOT a
 * database design. Nothing here is Florida-specific *architecture* — every other jurisdiction supplies
 * the same shape from its own sources.
 *
 * LRG-STATE-025 EXPANSION. Seven entries moved from absent to verified, each from a primary official
 * source read on 2026-07-28: minimum age, claim thresholds, claim deadlines, the official how-to-claim
 * destination, the official responsible-play destination, the draw schedule, and history destinations.
 * Tax status, anonymity, winner records, unclaimed prizes, fund allocation and scratcher snapshots remain
 * ABSENT — no primary source was verified for them, and FD-X-13 explicitly forbids repopulating them.
 *
 * EVIDENCE REGISTER
 *   [E1] 04-sample-data/source-xml/latest-results-lc.xml — production results feed.
 *        `<State stateCode="FL" stateId="107" stateName="Florida">`, 19 FL `<game>` elements.
 *   [E2] 04-sample-data/states-config.json — `fl`, stateId 107, timezone/storedTimezone
 *        `America/New_York`, displayTimezoneLabel `ET`, isLotteryState true.
 *   [E3] PF-02 v1.1 Appendix B [EXT-01] — the approved blueprint's citation of the Florida Lottery site.
 *   [E4] 04-sample-data/result-format-definitions.json — 19 Florida format definitions (12 added by
 *        LRG-STATE-025 so every feed event has a governed format).
 *   [E5] 04-sample-data/state-fl-sample.json `page.lastUpdated` — feed-derived result timestamp.
 *   [E6] 04-sample-data/footer-config.json `_meta` — records that production's footer carries NO
 *        18+/responsible-play/affiliation line, "removed to avoid inventing content".
 *   [E7] 04-sample-data/reference-tables/game.csv — production database export. `GAMETIME`,
 *        `CUTOFFTIME`, `PLAY_TYPE` per game id.
 *
 *   OFFICIAL PRIMARY SOURCES, all accessed 2026-07-28:
 *   [O1] https://floridalottery.com/games/draw-games — "Must be 18 or older to play."; official link
 *        labels Search Winning Numbers · Where to Play · How to Claim · Play Responsibly.
 *   [O2] https://floridalottery.com/howtoclaim — Winner's Guide. Prizes of $599 or less at authorized
 *        retailers or district offices; $600–$1,000,000 at a district office; over $1,000,000 at
 *        headquarters; mail claims accepted up to $250,000. "you have 180 days after the draw date for a
 *        Draw Game"; "you have 60 days to claim a Scratch-Off prize after the game has ended". Confirms
 *        the paths /where-to-play, /play-responsibly and /games/winning-numbers.
 *   [O3] https://floridalottery.com/games/draw-games/powerball — "Powerball drawings are held on Monday,
 *        Wednesday and Saturday."; "Tickets may be purchased until 10:00 p.m., Eastern Time, on the night
 *        of the drawing."; Power Play 2X–5X with 10X when the jackpot is $150 million or lower; Double
 *        Play is an additional drawing following Powerball; 5 of 1–69 plus Powerball 1–26.
 *   [O4] https://floridalottery.com/games/draw-games/mega-millions — "MEGA MILLIONS drawings are held
 *        every Tuesday and Friday night at 11 PM Eastern Time"; cutoff 10:00 p.m. ET; 5 of 1–70 plus MEGA
 *        BALL 1–24; "Every non-jackpot win will multiply its base prize by 2, 3, 4, 5, or 10 times
 *        automatically!" (the built-in multiplier that replaced the separate Megaplier add-on).
 *
 * COMMERCE NOTE (FD-X-11). [O1] and [O2] confirm that the Florida Lottery's official "Where to Play"
 * destination is a retailer locator. That is evidence about the DESTINATION, not proof of the
 * jurisdiction's full purchase picture, so `purchaseEligibility` is recorded as **`underReview`** — not
 * `retailOnly`, which would be an unverified factual claim, and not any online state. The visible action
 * stays `Where to Play` either way.
 */

import type { Availability, GovernedFact, Origin } from "./publicationGate";
import { FLORIDA_DRAW_EVENTS, FLORIDA_EVENTS_EXTRACTED } from "./floridaDrawEvents";
import { FLORIDA_FORMAT_VERSIONS } from "./floridaFormatRegistry";
import { FLORIDA_COMMERCE_CAPABILITY, FLORIDA_PURCHASE_OPTIONS } from "./buyNowCapability";

function fact<T>(
  value: T | undefined,
  origin: Origin,
  availability: Availability,
  source?: string,
  extra?: { sourceUrl?: string; effectiveDate?: string; lastVerified?: string },
): GovernedFact<T> {
  return { ...(value === undefined ? {} : { value }), origin, availability, source, ...extra };
}

/** A jurisdiction absence, recorded with the reason instead of a fabricated value. */
function absent<T>(availability: Extract<Availability, "unavailable" | "underReview">, why: string) {
  return fact<T>(undefined, "unavailable", availability, why);
}

export interface StateGameEntry {
  gameId: number;
  slug: string;
  displayName: string;
  group: "multiState" | "stateOnly" | "dailyVariants" | "specialized";
  /** Format definition id in result-format-definitions.json [E4]. */
  formatId: number;
  /** Family identity — sibling draw events share it (FD-X-06 grouping). Optional: a jurisdiction with no
   *  multi-event families needs no grouping key, and grouping is driven by the draw-event source. */
  familyKey?: string;
  /** Mandatory wherever a family has more than one event. */
  drawPeriod?: string | null;
  effectiveFrom?: string | null;
}

/** One row of the verified Florida draw schedule (S-04). */
export interface StateScheduleEntry {
  gameId: number;
  familyKey: string;
  displayName: string;
  drawPeriod: string | null;
  drawDays: string;
  drawTimeLocal: string;
  salesCutoff: string | null;
}

/** A claim route tier, exactly as the operator publishes it. */
export interface ClaimThresholdEntry {
  range: string;
  where: string;
}

/** A real, reachable destination for S-10. */
export interface HistoryDestination {
  key: string;
  label: string;
  href: string;
  external: boolean;
  note?: string;
}

export interface StateContentManifest {
  manifestVersion: string;
  stateCode: GovernedFact<string>;
  canonicalName: GovernedFact<string>;
  jurisdictionType: GovernedFact<string>;
  lotteryStatus: GovernedFact<"active" | "noActiveLottery">;

  operatorName: GovernedFact<string>;
  operatorOfficialUrl: GovernedFact<string>;
  operatorWinningNumbersUrl: GovernedFact<string>;
  operatorWhereToPlayUrl: GovernedFact<string>;
  operatorHowToClaimUrl: GovernedFact<string>;
  operatorResponsiblePlayUrl: GovernedFact<string>;

  primaryTimezone: GovernedFact<string>;
  displayTimezoneLabel: GovernedFact<string>;

  resultSource: GovernedFact<string>;
  resultLastUpdatedIso: GovernedFact<string>;

  games: GovernedFact<StateGameEntry[]>;

  /* ---- verified by LRG-STATE-025 from primary official sources ---- */
  drawSchedule: GovernedFact<StateScheduleEntry[]>;
  drawCutoffs: GovernedFact<string>;
  minimumPurchaseAge: GovernedFact<string>;
  claimThresholds: GovernedFact<ClaimThresholdEntry[]>;
  claimDeadline: GovernedFact<string>;
  historyDestinations: GovernedFact<HistoryDestination[]>;
  responsiblePlayContact: GovernedFact<string>;

  /* ---- still absent by evidence, not by omission (FD-X-13 forbids repopulating these) ---- */
  taxStatus: GovernedFact<never>;
  anonymityRule: GovernedFact<never>;
  purchaseEligibility: GovernedFact<never>;
  publishedOdds: GovernedFact<never>;
  scratcherSnapshot: GovernedFact<never>;
  winnerRecords: GovernedFact<never>;
  unclaimedPrizeRecords: GovernedFact<never>;
  fundAllocation: GovernedFact<never>;
  editorialItems: GovernedFact<never>;
  communityItems: GovernedFact<never>;

  /** Product policy statement about LotteryCorner itself — not a lottery fact. */
  independencePolicy: GovernedFact<string>;

  /* ---- LRG-STATE-029: governed contracts the page consumes ---- */
  /** Verified, versioned result-format registry (`resultFormatContract.ts`). */
  formatRegistryRef: GovernedFact<string>;
  /** Buy Now jurisdiction capability (`buyNowCapability.ts`). Florida is `underReview` (`FD-N-10`). */
  commerceCapabilityRef: GovernedFact<string>;
}

/** PF-02 §15 presentation group for a game class. */
function groupFor(cls: string): StateGameEntry["group"] {
  if (cls === "multiState") return "multiState";
  if (cls === "stateJackpot") return "stateOnly";
  if (cls === "frequentDraw") return "specialized";
  return "dailyVariants";
}

/**
 * All 19 Florida games, derived from the production feed rather than hand-listed.
 *
 * LRG-STATE-021 listed only the 7 games that had format definitions. LRG-STATE-025 added the missing 12
 * definitions [E4], so every event the feed carries is now governed and displayable.
 */
const FLORIDA_GAMES: StateGameEntry[] = FLORIDA_DRAW_EVENTS.map((e) => ({
  gameId: e.gameId,
  slug: e.drawPeriod
    ? `${e.familyKey}-${e.drawPeriod.toLowerCase().replace(/\s+/g, "-")}`
    : e.familyKey,
  displayName: e.drawPeriod ? `${e.familyName} (${e.drawPeriod})` : e.familyName,
  group: groupFor(e.gameClass),
  formatId: e.formatId,
  familyKey: e.familyKey,
  drawPeriod: e.drawPeriod,
}));

/** The verified schedule, from the same production export that supplies the draw times [E7] + [O3]/[O4]. */
const FLORIDA_SCHEDULE: StateScheduleEntry[] = FLORIDA_DRAW_EVENTS.filter((e) => e.drawTimeLocal).map(
  (e) => ({
    gameId: e.gameId,
    familyKey: e.familyKey,
    displayName: e.drawPeriod ? `${e.familyName} (${e.drawPeriod})` : e.familyName,
    drawPeriod: e.drawPeriod,
    drawDays: e.drawDays,
    drawTimeLocal: e.drawTimeLocal as string,
    salesCutoff: e.salesCutoff,
  }),
);

/** Claim routes exactly as [O2] publishes them — no tier is inferred, combined or reworded. */
const FLORIDA_CLAIM_THRESHOLDS: ClaimThresholdEntry[] = [
  { range: "$599 or less", where: "Authorized Florida Lottery retailers or any district office" },
  { range: "$600 – $1,000,000", where: "Florida Lottery district office" },
  { range: "Over $1,000,000", where: "Florida Lottery headquarters" },
  { range: "Up to $250,000", where: "May be claimed by mail" },
];

/**
 * S-10 destinations. Every entry is a route that genuinely resolves today.
 *
 * LRG-STATE-021 recorded this as `unavailable` because no internal `/fl/{game}` or archive route exists —
 * still true. FD-X-13 requires S-10 to become substantive, so it is built from destinations that DO
 * exist: the operator's own official search, and in-page anchors to sections this preview really renders.
 * No link is emitted for a route that does not exist (FD-S-30, `CLAUDE.md` §10).
 */
const FLORIDA_HISTORY_DESTINATIONS: HistoryDestination[] = [
  {
    key: "official-search",
    label: "Search past Florida winning numbers",
    href: "https://floridalottery.com/games/winning-numbers",
    external: true,
    note: "The operator's official winning-number search — the authoritative archive [O1]/[O2].",
  },
  {
    key: "schedule",
    label: "Florida draw schedule and sales cutoffs",
    href: "#upcoming-draws",
    external: false,
    note: "In-page: the verified schedule this preview renders from [E7].",
  },
  {
    key: "jackpot-movement",
    label: "Current jackpot movement",
    href: "#jackpot-movement",
    external: false,
    note: "In-page: current versus next advertised prize, both from the feed [P1]. Descriptive only.",
  },
  {
    key: "compare-games",
    label: "Compare Florida games",
    /* LRG-STATE-030 DEFECT FIX: was `#state-games`, which matched no element — S-06's governed fragment is
       `games` (sectionManifest.ts). A dead in-page anchor is a broken control (FD-S-08). */
    href: "#games",
    external: false,
  },
];

export const FLORIDA_MANIFEST: StateContentManifest = {
  manifestVersion: "0.2.0-preview",

  stateCode: fact("fl", "configuration", "verified", "[E2] states-config.json"),
  canonicalName: fact("Florida", "productionDerived", "verified", "[E1] results feed stateName"),
  jurisdictionType: fact("state", "configuration", "verified", "jurisdiction registry"),
  lotteryStatus: fact("active", "productionDerived", "verified", "[E1] 19 Florida games in the feed"),

  operatorName: fact("Florida Lottery", "copiedEditorial", "verified", "[O1] official site"),
  operatorOfficialUrl: fact(
    "https://floridalottery.com/", "copiedEditorial", "verified", "[E3] PF-02 Appendix B + [O1] verified live",
    { sourceUrl: "https://floridalottery.com/", lastVerified: "2026-07-28" },
  ),
  operatorWinningNumbersUrl: fact(
    "https://floridalottery.com/games/winning-numbers", "copiedEditorial", "verified",
    "[O2] path confirmed on the official Winner's Guide", { lastVerified: "2026-07-28" },
  ),
  operatorWhereToPlayUrl: fact(
    "https://floridalottery.com/where-to-play", "copiedEditorial", "verified",
    "[O1]/[O2] official link label 'Where to Play' — a retailer locator", { lastVerified: "2026-07-28" },
  ),
  operatorHowToClaimUrl: fact(
    "https://floridalottery.com/howtoclaim", "copiedEditorial", "verified",
    "[O2] the official Winner's Guide", { lastVerified: "2026-07-28" },
  ),
  operatorResponsiblePlayUrl: fact(
    "https://floridalottery.com/play-responsibly", "copiedEditorial", "verified",
    "[O1]/[O2] official link label 'Play Responsibly'", { lastVerified: "2026-07-28" },
  ),

  primaryTimezone: fact("America/New_York", "configuration", "verified", "[E2] states-config.json"),
  displayTimezoneLabel: fact("ET", "configuration", "verified", "[E2] + [O4] 'Eastern Time'"),

  resultSource: fact(
    "LotteryCorner production results feed", "productionDerived", "verified",
    "[E1] source-xml/latest-results-lc.xml", { lastVerified: FLORIDA_EVENTS_EXTRACTED },
  ),
  resultLastUpdatedIso: fact(
    "2026-07-09T14:01:45-04:00", "productionDerived", "verified",
    "[E1] latest `updated-time` across the 19 Florida games", { lastVerified: "2026-07-09" },
  ),

  games: fact(FLORIDA_GAMES, "productionDerived", "verified", "[E1] feed + [E4] 19 format definitions"),

  /* ---- verified by LRG-STATE-025 ---- */
  drawSchedule: fact(
    FLORIDA_SCHEDULE, "productionDerived", "verified",
    "[E7] game.csv GAMETIME/CUTOFFTIME; draw days for Powerball and Mega Millions from [O3]/[O4]",
    { lastVerified: "2026-07-28" },
  ),
  drawCutoffs: fact(
    "Tickets may be purchased until 10:00 p.m. ET on the night of a Powerball or Mega Millions drawing. Other Florida games close shortly before each draw.",
    "copiedEditorial", "verified", "[O3]/[O4] official cutoff statements; per-game minutes from [E7]",
    { lastVerified: "2026-07-28" },
  ),
  minimumPurchaseAge: fact(
    "18", "copiedEditorial", "verified", "[O1]/[O3]/[O4] 'Must be 18 or older to play.'",
    { lastVerified: "2026-07-28" },
  ),
  claimThresholds: fact(
    FLORIDA_CLAIM_THRESHOLDS, "copiedEditorial", "verified", "[O2] official Winner's Guide",
    { lastVerified: "2026-07-28" },
  ),
  claimDeadline: fact(
    "180 days after the draw date for a draw game. 60 days after a Scratch-Off game ends.",
    "copiedEditorial", "verified", "[O2] official Winner's Guide", { lastVerified: "2026-07-28" },
  ),
  historyDestinations: fact(
    FLORIDA_HISTORY_DESTINATIONS, "configuration", "verified",
    "Every destination resolves: the operator's official archive, plus in-page anchors this preview renders",
  ),
  responsiblePlayContact: fact(
    "https://floridalottery.com/play-responsibly", "copiedEditorial", "verified",
    "[O1]/[O2] official 'Play Responsibly' destination. NOTE: this is the operator's official page, not a helpline number — no helpline number has been verified, so none is stated.",
    { lastVerified: "2026-07-28" },
  ),

  /* ---- Absent by evidence, not by omission. FD-X-13: do not repopulate. ---- */
  taxStatus: absent("unavailable", "No primary source verified for Florida tax treatment of prizes. Fixture tax copy is synthetic (_meta.illustrative), and FD-X-02 moves tax detail to a dedicated guide."),
  anonymityRule: absent("unavailable", "No primary source verified for Florida winner anonymity. The fixture carries no anonymity block."),
  purchaseEligibility: absent("underReview", "[O1]/[O2] confirm the official 'Where to Play' destination is a retailer locator, but no primary source explicitly establishes Florida's full online-purchase status. FD-X-11: this resolves to underReview, NEVER to retailOnly."),
  publishedOdds: absent("unavailable", "Per-game odds were not read from a primary source in this task. FD-X-02 places prize matrices on game pages."),
  scratcherSnapshot: absent("unavailable", "No sustainable Florida scratcher snapshot source. FD-S-02 suppresses S-11."),
  winnerRecords: absent("unavailable", "Fixture winner highlights are fabricated. FD-S-02 suppresses S-12; FD-X-13 forbids repopulating."),
  unclaimedPrizeRecords: absent("unavailable", "Fixture unclaimed-prize highlights are fabricated. FD-S-02 suppresses S-12; FD-X-13 forbids repopulating."),
  fundAllocation: absent("unavailable", "No current sourced Florida fund-allocation report with a reporting period. FD-S-02 suppresses S-13."),
  editorialItems: absent("unavailable", "No real Florida editorial item with a real destination exists in the repository."),
  communityItems: absent("unavailable", "No community platform exists. Fabricating discussions is prohibited."),

  independencePolicy: fact(
    "LotteryCorner is an independent lottery information service and is not affiliated with the Florida Lottery or the State of Florida. Always confirm a winning ticket with an authorized Florida Lottery retailer or office.",
    "configuration", "verified",
    "Product policy required by Constitution §11 — a statement about LotteryCorner, not a lottery fact.",
  ),

  /* ---- LRG-STATE-029 ---- */
  formatRegistryRef: fact(
    `floridaFormatRegistry.ts — ${FLORIDA_FORMAT_VERSIONS.length} versions, ${
      FLORIDA_FORMAT_VERSIONS.filter((v) => v.verification === "verifiedOfficial").length
    } verifiedOfficial`,
    "configuration", "verified",
    "Verified against primary Florida Lottery game pages, accessed 2026-07-28/29. Versions that are not verifiedOfficial are rejected by the public publication gate.",
    { lastVerified: "2026-07-29" },
  ),
  commerceCapabilityRef: fact(
    `buyNowCapability.ts — fl status "${FLORIDA_COMMERCE_CAPABILITY.status}", ${FLORIDA_PURCHASE_OPTIONS.length} recorded options`,
    "configuration", "underReview",
    "FD-N-10: Florida's full purchase picture is not verified, so it resolves to underReview, never retailOnly. Buy Now remains the visible CTA and leads to that explanation.",
    { lastVerified: "2026-07-28" },
  ),
};

/** Registry of preview manifests. Florida only in this task (FD-S-36). Keyed, not hardcoded per call site. */
export const STATE_MANIFESTS: Record<string, StateContentManifest> = { fl: FLORIDA_MANIFEST };

export function getStateManifest(stateCode: string): StateContentManifest | undefined {
  return STATE_MANIFESTS[stateCode.toLowerCase()];
}
