/*
 * State preview view model — resolves manifest + fixture + gate + formats into per-section state.
 *
 * Task LRG-STATE-021. Authority: `state-page-section-and-view-model-specification.md` Part B;
 * FD-S-01 (gate), FD-S-02 (suppression with reasons), FD-S-04 (manifest + resolver), FD-S-09 (closed
 * status union), FD-S-10 (format coverage).
 *
 * This is the ONLY place that decides which sections render. Components receive a resolved model and
 * render it; none of them branches on a state code or re-derives eligibility.
 */

import { getStatePage } from "../data-provider";
import type { ResultCard, StatePageData } from "../data-provider/types";
import type { StateContentManifest, StateGameEntry } from "./floridaContentManifest";
import { stateManifestFor } from "./stateContentManifests";
import { narrowStatus, verifyFormatCoverage, type CoverageReport, type ResultStatus } from "./formatCoverage";
import { gate, type GatedFact } from "./publicationGate";
import {
  DEFAULT_ORDER, rendered, suppressed, STATE_MERGED_SECTIONS, STATE_SECTIONS,
  type SectionRenderState, type StateSectionId,
} from "./sectionManifest";
import { resolveOrder, type ActiveOverride, type OverrideInput } from "./adaptivePriority";
import { findJurisdiction, directoryJurisdictions, type Jurisdiction } from "./jurisdictionRegistry";
import { buildFamilies, primaryFamily, familiesInGroup, type FamilyViewModel } from "./stateResultBuilder";
import { drawEventsFor } from "./stateDrawEvents";
import { buildStateFamilies } from "./stateFamilyBuilder";
import { formatVersionsFor, formatGapsFor, type FormatGap } from "./stateFormatRegistry";
import { adProfileFor, type StateAdProfile } from "./stateAdProfiles";
import { commerceResolutionFor, type StateCommerceResolution } from "./stateCommerceRegistry";
import { stateViewConfigFor, previewEnabledStateCodes } from "./stateViewConfigRegistry";
import {
  capabilityOf, hasLowerPageContent, isNoLotteryState, lowerPageContentFrom, type StateViewConfig,
} from "./stateViewConfig";
import type { StateLowerPageContent } from "./stateLowerPageContent";
import { stateCommunityThread } from "@/lib/community/communityDiscussionSource";
import type { ResolvedFamily } from "./gameFamilyPresentation";

export interface PreviewResultCard {
  gameId: number;
  displayName: string;
  status: ResultStatus;
  statusDetail?: string;
  card: ResultCard;
}

export interface PreviewGroup {
  groupKey: string;
  heading: string;
  cards: PreviewResultCard[];
}

export interface StatePreviewModel {
  stateCode: string;
  stateName: string;
  previewEnabled: boolean;
  manifest: StateContentManifest;
  jurisdiction: Jurisdiction;

  /* ---- LRG-STATE-047: everything that used to be a Florida import ---- */
  /** The validated State view configuration. The single source of identity, SEO and approved content. */
  config: StateViewConfig;
  /** Approved lower-page content, projected from the configuration. Bands with no items render nothing. */
  lowerContent: StateLowerPageContent;
  /** True when this State has ANY approved lower-page content at all (CONTENT-03). */
  hasLowerContent: boolean;
  /** True for the ST-06 no-lottery composition. */
  noLottery: boolean;
  /** The advertising profile resolved for this State — Florida's approved ten, or none with a reason. */
  adProfile: StateAdProfile;
  /** How buying tickets resolves here: researched, never-researched, or not applicable. */
  commerce: StateCommerceResolution;
  /** Production games this State deliberately does not render, with the reason for each. */
  formatGaps: readonly FormatGap[];
  /**
   * The States whose guarded preview is enabled, for a Change State affordance that links only to routes
   * that actually resolve. Deliberately NOT the 53-jurisdiction directory: linking a State with no preview
   * would be a control that looks functional and is not (`FD-S-08`).
   */
  previewStates: readonly { code: string; name: string }[];

  /** Resolved render order — exactly `DEFAULT_ORDER` when no override is open. */
  order: StateSectionId[];
  activeOverride: ActiveOverride | null;

  /** Per-section render decision, keyed by governed id. */
  sectionState: Record<StateSectionId, SectionRenderState>;

  /** Gated governed facts the sections consume. */
  facts: {
    operatorName: GatedFact<string>;
    operatorOfficialUrl: GatedFact<string>;
    operatorWinningNumbersUrl: GatedFact<string>;
    operatorWhereToPlayUrl: GatedFact<string>;
    resultLastUpdatedIso: GatedFact<string>;
    independencePolicy: GatedFact<string>;
  };

  results: PreviewGroup[];

  /* ---- LRG-STATE-025: grouped draw-event families (FD-X-06) ---- */
  /** The 10 Florida game identities collapsed from 19 draw events. */
  families: FamilyViewModel[];
  /** The single most relevant verified result — mobile band 2 (FD-X-03). */
  primary: FamilyViewModel | undefined;
  /** Multi-state families, for the compact strip / featured pair (FD-X-05). */
  multiState: FamilyViewModel[];
  /** Every Florida-native family, in deterministic order (FD-X-06). */
  native: FamilyViewModel[];
  /** Total displayed draw events — 19 when coverage is complete. */
  drawEventCount: number;

  /* ---- LRG-STATE-030: presentation-layer game-family surfaces (FD-N-01, FD-X-06) ----
     Each surface groups related MEMBER GAMES that keep their own ids, results, dates and statuses. The
     legacy per-variant game records are unchanged; this is presentation only. */
  familySurfaces: ResolvedFamily[];

  coverage: CoverageReport;
  games: StateGameEntry[];
  directory: Jurisdiction[];

  /** Freshness of the result feed, computed from the manifest date. */
  freshness: { lastUpdatedIso?: string; daysOld: number | null; stale: boolean };

  /** Every field class FD-S-01 names, with the gate decision that was actually taken. */
  gateAudit: { fieldClass: string; publish: boolean; reason?: string }[];
}

/*
 * LRG-STATE-047. These were four Florida literals in generic code. They are now built from the resolved
 * State name, so Michigan reads "Multi-state games offered in Michigan" without a branch anywhere.
 */
const groupHeadings = (stateName: string): Record<string, string> => ({
  multiState: `Multi-state games offered in ${stateName}`,
  stateOnly: `${stateName}-only draw games`,
  dailyVariants: "Daily number games",
  specialized: "Specialised games",
});

const STALE_AFTER_DAYS = 2;

function freshnessOf(iso: string | undefined, now: Date) {
  if (!iso) return { daysOld: null, stale: false };
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return { daysOld: null, stale: false };
  const days = Math.floor((now.getTime() - t) / 86_400_000);
  return { daysOld: days, stale: days > STALE_AFTER_DAYS };
}

/**
 * Build the model.
 *
 * `previewEnabled` is passed in from the route boundary — this module never reads the env flag, so it
 * stays pure and testable.
 */
export function buildStatePreviewModel(
  stateCode: string,
  previewEnabled: boolean,
  opts: { now?: Date; triggers?: readonly OverrideInput[]; fixture?: StatePageData } = {},
): StatePreviewModel | null {
  const code = stateCode.toLowerCase();
  const manifest = stateManifestFor(code);
  const jurisdiction = findJurisdiction(code);
  const config = stateViewConfigFor(code);
  if (!manifest || !jurisdiction || !config) return null;

  /*
   * THE FIXTURE IS NO LONGER REQUIRED — LRG-STATE-047.
   *
   * `if (!fixture) return null` used to sit here, which made a page fixture a precondition for the new
   * template. That is fixture-derived route behaviour by the back door: Utah has no fixture (it has no
   * games), so the no-lottery State could never have rendered. The fixture is now OPTIONAL and supplies
   * only the legacy result cards that feed the S-06 group listing.
   */
  const fixture = opts.fixture ?? getStatePage(code) ?? undefined;

  const now = opts.now ?? new Date();
  const stateName = manifest.canonicalName.value ?? config.state.name;
  const games = manifest.games.value ?? [];
  const GROUP_HEADINGS = groupHeadings(stateName);

  /* ---- results: only games whose format verifies, statuses narrowed to the closed union ---- */
  const cardsById = new Map<number, ResultCard>();
  for (const g of fixture?.latestResults?.groups ?? []) {
    for (const c of g.resultCards ?? []) cardsById.set(c.gameId, c);
  }
  /* LRG-STATE-025: coverage is verified against all 19 manifest games. `cardsById` still supplies the
     fixture cards where they exist; events without a fixture card are verified on their format alone. */
  const coverage = verifyFormatCoverage(games, cardsById);
  const coveredIds = new Set(coverage.covered.map((c) => c.gameId));

  const byGroup = new Map<string, PreviewResultCard[]>();
  for (const g of games) {
    if (!coveredIds.has(g.gameId)) continue;
    const card = cardsById.get(g.gameId);
    if (!card) continue;
    const status = narrowStatus(card.status);
    const entry: PreviewResultCard = {
      gameId: g.gameId,
      displayName: g.displayName,
      status,
      ...(status !== "verified" ? { statusDetail: statusDetailFor(status, card) } : {}),
      card,
    };
    byGroup.set(g.group, [...(byGroup.get(g.group) ?? []), entry]);
  }
  const results: PreviewGroup[] = (["multiState", "stateOnly", "dailyVariants", "specialized"] as const)
    .filter((k) => (byGroup.get(k)?.length ?? 0) > 0)
    .map((k) => ({ groupKey: k, heading: GROUP_HEADINGS[k], cards: byGroup.get(k)! }));

  /* ---- LRG-STATE-025: families built from the production-derived draw events, not the fixture ----
     Coverage still gates display: an event whose format does not verify is not shown at all. */
  const events = drawEventsFor(code);
  const tzLabel = manifest.displayTimezoneLabel.value ?? "ET";
  const coveredFormatIds = new Set(coverage.covered.map((c) => c.gameId));
  const allFormatIds = new Set(events.map((e) => e.formatId));
  const displayableIds = coveredFormatIds.size > 0 ? coveredFormatIds : allFormatIds;
  /* §B1: the State's own configured IANA zone reaches every card, so a relative next-draw label is computed
     against the game's local clock rather than the reader's (`CLAUDE.md` §14). */
  const families = buildFamilies(tzLabel, events, displayableIds, config.state.timezone);
  const multiState = familiesInGroup(families, "multiState");
  const native = families.filter((f) => f.group !== "multiState");
  const primary = primaryFamily(families);
  const drawEventCount = families.reduce((n, f) => n + f.eventCount, 0);

  /* LRG-STATE-030, generalised by LRG-STATE-047: family surfaces from this State's own events, its own
     configured composition and its own governed formats. */
  const familySurfaces = buildStateFamilies({
    families: config.presentation.families,
    events,
    formats: formatVersionsFor(code),
    timezoneLabel: tzLabel,
    todayIso: (manifest.resultLastUpdatedIso.value ?? now.toISOString()).slice(0, 10),
  });

  /* ---- LRG-STATE-047: the three per-State contracts the components used to import from Florida ---- */
  const commerce = commerceResolutionFor(code);
  const adProfile = adProfileFor(code);
  const formatGaps = formatGapsFor(code);
  const previewStates = previewEnabledStateCodes().map((c) => ({
    code: c,
    name: stateViewConfigFor(c)?.state.name ?? c.toUpperCase(),
  }));

  /* ---- gate the governed facts the sections consume ---- */
  const facts = {
    operatorName: gate(manifest.operatorName, previewEnabled),
    operatorOfficialUrl: gate(manifest.operatorOfficialUrl, previewEnabled),
    operatorWinningNumbersUrl: gate(manifest.operatorWinningNumbersUrl, previewEnabled),
    operatorWhereToPlayUrl: gate(manifest.operatorWhereToPlayUrl, previewEnabled),
    resultLastUpdatedIso: gate(manifest.resultLastUpdatedIso, previewEnabled),
    independencePolicy: gate(manifest.independencePolicy, previewEnabled),
  };

  /* ---- the FD-S-01 gate audit: every named field class, with its decision ---- */
  const gateAudit = [
    ["recentWinners", manifest.winnerRecords],
    ["unclaimedPrizes", manifest.unclaimedPrizeRecords],
    ["claimDeadlines", manifest.claimDeadline],
    ["claimThresholds", manifest.claimThresholds],
    ["taxRates", manifest.taxStatus],
    ["taxStatus", manifest.taxStatus],
    ["anonymityRules", manifest.anonymityRule],
    ["retailerLocations", manifest.purchaseEligibility],
    ["purchaseEligibility", manifest.purchaseEligibility],
    ["stateHighlights", manifest.winnerRecords],
  ].map(([fieldClass, f]) => {
    const d = gate(f as never, previewEnabled);
    return { fieldClass: fieldClass as string, publish: d.publish, ...(d.reason ? { reason: d.reason } : {}) };
  });

  const fresh = freshnessOf(manifest.resultLastUpdatedIso.value, now);

  /* ---- per-section render decisions ---- */
  const noLottery = isNoLotteryState(config);
  /*
   * S-14's state-scoped community entry — resolved here, not in the config, so a state package can
   * never author a thread that does not exist. The Community family serves `/community` from the
   * registry (Conflict 41; `FD-ACC-10` satisfied by construction), and `stateCommunityThread` returns
   * the state's real monthly thread or `null`. Florida resolves its Pick 3 monthly thread; a state
   * without one links only the hub.
   */
  const communityThread = stateCommunityThread(code);
  const lowerContent: StateLowerPageContent = {
    ...lowerPageContentFrom(config),
    communityThread: communityThread ? { label: communityThread.title, href: communityThread.href } : null,
  };
  const hasLower = hasLowerPageContent(config);
  /*
   * LRG-STATE-047. `hasResults` was fixture-derived alone, which meant a State with transcribed events but
   * no legacy page fixture would suppress its own results. The family surfaces are the thing S-02 actually
   * renders, so either source counts.
   */
  const hasResults = results.length > 0 || familySurfaces.length > 0;
  const sectionState = {} as Record<StateSectionId, SectionRenderState>;
  for (const s of STATE_SECTIONS) sectionState[s.id] = rendered();

  sectionState["S-02"] = hasResults
    ? rendered(fresh.stale ? `Result data is ${fresh.daysOld} days old.` : undefined)
    : suppressed("no-verified-data", `No ${stateName} game passed format verification.`);

  /* LRG-STATE-025 / FD-X-13 prerequisite 2: the schedule is now verified from the production export plus
     the operator's own published draw days, so S-04 renders instead of being suppressed. */
  sectionState["S-04"] = (manifest.drawSchedule.value?.length ?? 0) > 0
    ? rendered()
    : suppressed("no-verified-data", manifest.drawSchedule.source ?? "No verified schedule data.");
  /* FD-S-17: comparison is deterministic and never AI. No checker is connected in this preview, so S-05
     renders an informational route to the operator's own official checker rather than a disabled form
     (FD-S-08 / FD-X-09 — no disabled controls). */
  sectionState["S-05"] = capabilityOf(config, "hasTicketCheckGuidance")
    ? rendered("No ticket checker is connected in this preview.")
    : suppressed("no-verified-data", `No ${stateName} ticket-check guidance is configured.`);
  /*
   * FD-X-11. Florida's commerce state is `underReview` — NOT `retailOnly`, which would be an unverified
   * factual claim. Every other preview State has NO researched capability at all, which resolves to
   * unknown; in both cases the visible action leads to an explanation rather than a transaction.
   */
  sectionState["S-07"] = commerce.kind === "notApplicable"
    ? suppressed("no-verified-data", `${stateName} runs no lottery, so there is nothing to buy here.`)
    : rendered(
        commerce.kind === "researched"
          ? `${stateName} purchase eligibility is under review; no transactional path is offered.`
          : `${stateName} purchase paths have not been researched; no transactional path is offered.`,
      );
  sectionState["S-08"] = capabilityOf(config, "hasClaimGuide")
    ? rendered("Claim routes and deadlines are officially sourced; tax and anonymity are not.")
    : suppressed("no-verified-data", `No verified ${stateName} claim guidance is recorded.`);
  sectionState["S-08A"] = noLottery
    ? suppressed("no-verified-data", `${stateName} runs no lottery, so there are no State play essentials.`)
    : rendered(`Most ${stateName} essentials are not yet officially sourced.`);
  /* LRG-STATE-025 / FD-X-09: S-09 carries the deterministic "what changed" summary. It is computed from
     real feed values and a LOCAL-ONLY visit marker — no account, no server profile, no fabricated
     activity. The fabricated fixture highlights remain excluded (FD-S-02). */
  sectionState["S-09"] = rendered();
  /* LRG-STATE-025 / FD-X-13 prerequisite 4 + FD-X-10: S-10 renders once it has destinations that
     genuinely resolve. Every link is checked at build time; none is a dead route. */
  /*
   * LRG-STATE-048. S-10 hosts the Explore band, so it must render when there is Explore CONTENT — not only
   * when the manifest has history destinations. Before this, a State with four useful utility entries still
   * suppressed the section that draws them, because the gate asked the wrong question.
   */
  sectionState["S-10"] = (manifest.historyDestinations.value?.length ?? 0) > 0
    || lowerContent.exploreItems.length > 0
    ? rendered()
    : suppressed("no-real-destination", manifest.historyDestinations.source ?? "No real history or tool destination exists.");
  sectionState["S-11"] = suppressed("fd-s-02-unsourced", manifest.scratcherSnapshot.source ?? "No scratcher snapshot source.");
  sectionState["S-12"] = suppressed("synthetic-only-data", manifest.winnerRecords.source ?? "Winner records are fabricated.");
  sectionState["S-13"] = suppressed("fd-s-02-unsourced", manifest.fundAllocation.source ?? "No fund-allocation source.");
  /*
   * CONTENT-02 / CONTENT-03. S-10, S-14, S-15 and S-18 carry the approved lower-page bands. A State with no
   * approved content package renders NOTHING there — no heading, no "coming soon", no empty shell — because
   * the alternative is a page of headings with nothing under them.
   *
   * Florida is unaffected: every one of its capabilities is true and its content arrays are populated.
   */
  sectionState["S-14"] = capabilityOf(config, "hasLotteryCornerCommunity")
    && lowerContent.discussionItems.length > 0
    ? rendered(`No ${stateName} discussion has been started yet.`)
    : suppressed("no-verified-data", `No approved ${stateName} community content exists.`);
  /*
   * S-15 carries BOTH the news band and the guides block. Gating it on news alone hid the guides too, which
   * is why a State with three useful guides and no news article rendered neither. It now renders when EITHER
   * exists, and each band inside it draws only if it has items (CONTENT-03).
   */
  sectionState["S-15"] = (capabilityOf(config, "hasLotteryCornerNews") && lowerContent.newsItems.length > 0)
    || (capabilityOf(config, "hasLotteryCornerGuides") && lowerContent.guideItems.length > 0)
    ? rendered()
    : suppressed("no-verified-data", `No approved ${stateName} editorial content exists.`);
  /*
   * §A3 — S-16 AND S-17 NO LONGER LIE ABOUT THEMSELVES.
   *
   * Both are `required`, both were recorded as rendering, and `StatePreview` drew neither. See
   * `STATE_MERGED_SECTIONS` for the full reasoning; the short version is:
   *
   *   S-16  BLOCKED. "Follow State / My LotteryCorner" is a Member capability and `CLAUDE.md` §16 forbids
   *         implementing it. No neighbour carries it, so nothing is drawn — and specifically not a disabled
   *         Follow control, which FD-S-08 and `FD-ACC-14` both forbid.
   *   S-17  MERGED into S-18. LRG-STATE-042 moved State sources, responsible play and support into the approved
   *         Resources band, which S-18 renders at `#state-sources` — the fragment S-17 used to own. The content
   *         is on the page; only its container changed.
   */
  sectionState["S-16"] = suppressed(
    "blocked-member-insider",
    "Following a state and saving results are account capabilities. The Member and Insider founder decisions are "
      + "open, so nothing is drawn here rather than a control that cannot work.",
  );
  for (const [merged, into] of Object.entries(STATE_MERGED_SECTIONS)) {
    sectionState[merged as StateSectionId] = suppressed(
      "merged-into-neighbour",
      `Rendered inside ${into} — the approved lower-page bands carry this content in a neighbouring section `
        + "rather than in a box of its own.",
    );
  }
  /* S-18 hosts the Resources band, which is configured content. No content, no section. */
  if (!capabilityOf(config, "hasStateResourcesBand") || lowerContent.resourceItems.length === 0) {
    sectionState["S-18"] = suppressed(
      "no-verified-data", `No approved ${stateName} official resources are recorded.`,
    );
  }

  /* ---- resolved order ---- */
  const { order, activeOverride } = resolveOrder(opts.triggers ?? [], now);

  return {
    stateCode: code,
    stateName,
    previewEnabled,
    manifest,
    jurisdiction,
    config,
    lowerContent,
    hasLowerContent: hasLower,
    noLottery,
    adProfile,
    commerce,
    formatGaps,
    previewStates,
    order: order.length > 0 ? order : [...DEFAULT_ORDER],
    activeOverride,
    sectionState,
    facts,
    results,
    families,
    primary,
    multiState,
    native,
    drawEventCount,
    familySurfaces,
    coverage,
    games,
    directory: directoryJurisdictions(),
    freshness: { lastUpdatedIso: manifest.resultLastUpdatedIso.value, ...fresh },
    gateAudit,
  };
}

function statusDetailFor(status: ResultStatus, card: ResultCard): string {
  const next = card.nextDraw?.display;
  switch (status) {
    /* DS-14: `awaiting` must state the exact next-draw date, not just "awaiting". */
    case "awaiting":
      return next ? `Awaiting result — next draw ${next}` : "Awaiting result";
    case "closed":
      return "This game is closed";
    case "corrected":
      return "Corrected";
    case "delayed":
      return next ? `Draw delayed — next scheduled ${next}` : "Draw delayed";
    case "cancelled":
      return "Draw cancelled";
    case "pending":
      return next ? `Result pending — next draw ${next}` : "Result pending";
    default:
      return "Currently unavailable";
  }
}

/** Content sections that actually render, in resolved order. Used by the ad guard's reachability check. */
export function renderedSectionIds(m: StatePreviewModel): StateSectionId[] {
  return m.order.filter((id) => m.sectionState[id]?.render !== false);
}

/**
 * Sections that satisfy the APP-ST-01 content-host rule — LRG-STATE-022.
 *
 * A section is ad-host eligible only when it renders AND carries substantive real content. A section
 * rendering purely as an empty-state shell, a cold start, a sparse hub or a "Currently unavailable"
 * surface is NOT eligible: an advertisement must never be the reason such a shell exists.
 *
 * For the Florida preview that means S-01, S-02, S-03, S-06 and S-18 — the sections built from verified
 * data. S-05, S-07, S-08, S-08A and S-17 render required unavailable surfaces; S-14 and S-15 are the
 * cold-start and sparse hubs the founder correction named explicitly.
 */
export function adHostEligibleSectionIds(m: StatePreviewModel): StateSectionId[] {
  const NEVER_ELIGIBLE = new Set<StateSectionId>([
    "S-05", "S-08", "S-08A", "S-17",  /* required unavailable surfaces */
    "S-14", "S-15",                    /* cold-start / sparse hubs (APP-ST-04/05) */
    "S-16",                            /* informational only */
  ]);
  return renderedSectionIds(m).filter((id) => {
    if (NEVER_ELIGIBLE.has(id)) return false;
    if (id.startsWith("AD-") || id === "Footer") return false;
    /* S-02 is eligible only when it actually carries verified results. */
    if (id === "S-02") return m.results.length > 0;
    /* S-06 is eligible only when at least one game passed format verification. */
    if (id === "S-06") return m.coverage.covered.length > 0;
    return true;
  });
}
