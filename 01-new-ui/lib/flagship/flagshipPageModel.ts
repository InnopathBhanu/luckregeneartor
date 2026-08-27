/*
 * THE FLAGSHIP PAGE MODEL — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §12 (the anonymous section sequence), §14 (the content budget), §15–§29 (the section
 * specifications), §39 (what must be visible in server HTML), `CLAUDE.md` §9 (typed view models, all applicable
 * page states) and §11.
 *
 * ══ ONE BUILDER, TWO PAGES ══
 *
 * `/powerball` and `/mega-millions` call this with nothing but a slug. Everything that differs between them comes
 * from `flagshipGames.ts`. If a future change needs a `if (gameSlug === …)` anywhere outside that config file,
 * the config is missing a field.
 *
 * ══ THE MODEL IS COMPLETE BEFORE ANY COMPONENT RUNS ══
 *
 * Every value a section renders — including every gap, every locked capability and every "not connected" reason —
 * is resolved here, on the server. §39 requires the game identity, result, rules, tools, jurisdiction links,
 * content links and trust to be present in the initial HTML, and the way to guarantee that is for the components
 * to receive data rather than fetch it.
 *
 * ══ THIS REPLACES THE V0 PREVIEW MODEL ══
 *
 * `flagshipPreviewModel.ts` from the rejected Codex preview is removed on the founder's explicit instruction for
 * this task (*"Treat it as rejected/disposable. You may replace it completely"*). Its one substantive idea — read
 * the shared multi-state feed record rather than inventing a result — survives, generalised into
 * `flagshipDrawSource.ts`, which cross-checks every jurisdiction instead of reading Florida's copy.
 */

import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { formatVersionsFor } from "@/lib/state/stateFormatRegistry";
import { selectFormatVersion } from "@/lib/state/resultFormatContract";
import type { MemberBallGroup } from "@/lib/state/gameFamilyPresentation";

import {
  FLAGSHIP_SECTION_ORDER, FLAGSHIP_MERGED_SECTIONS, type AiSurface, type FlagshipSectionId, type FlagshipTool,
  type Gap, type TaggedContentFeed,
} from "./flagshipContract";
import { flagshipGameConfig, isGap, type FlagshipGameConfig } from "./flagshipGames";
import { flagshipRegistryEntry, type FlagshipRegistryEntry } from "./flagshipRegistry";
import { nationalDraw, nationalReviewDate } from "./flagshipDrawSource";
import { oddsTable, oddsMethod, jackpotOdds, type OddsRow } from "./flagshipOdds";
import {
  drawInsights, jackpotMovement, INSIGHT_BOUNDARY,
  type DrawInsight, type DrawShape, type JackpotMovement,
} from "./flagshipInsights";
import { statsLab, statsMethod, type StatView } from "./flagshipStats";
import {
  publishedHistory, historyFromBff, historyDisclosure, drawNightsOf, type FlagshipHistory,
} from "./flagshipHistory";
import { getFlagshipGamePageData, isPreviewData } from "./bff/flagshipBff";
import type { BffCheckerExample, BffPrizeTier } from "./bff/flagshipBffContract";
import { jackpotRun, type FlagshipJackpotRun } from "./flagshipJackpotRun";
import { FLAGSHIP_DISPLAY_MODE, type FlagshipDisplayMode } from "./flagshipDisplay";
import { flagshipTools, inlineTools } from "./flagshipTools";
import { aiSurfaces, orderedAiSurfaces } from "./flagshipAi";
import { flagshipFaq, type FlagshipFaqEntry } from "./flagshipFaq";
import { flagshipContentFeeds, flagshipContentFeedsFrom, isContentConnected } from "./flagshipTaggedContent";
import { engagementOptions, type EngagementOption } from "./flagshipEngagement";
import { flagshipAdProfileFor, type FlagshipAdProfile } from "./flagshipAdProfile";

/* ------------------------------------------------------------------ result view */

export interface FlagshipSecondaryResult {
  label: string;
  groups: readonly MemberBallGroup[];
  timingNote: string;
  topPrizeNote: string | null;
}

export interface FlagshipResultView {
  drawDateIso: string;
  drawDateDisplay: string;
  groups: readonly MemberBallGroup[];
  /** The drawn multiplier. `null` for a game whose multiplier is not drawn (Mega Millions). */
  multiplier: { label: string; value: number; mode: string; note: string } | null;
  secondary: FlagshipSecondaryResult | null;
  jackpotDisplay: string | null;
  jackpotLabel: string;
  /** `null` and rendered as a stated gap: the feed carries no cash value and we never derive one. */
  cashValueDisplay: string | null;
  cashValueGap: Gap;
  nextDrawDateDisplay: string | null;
  /** The next drawing's ISO date, for the countdown. */
  nextDrawIso: string | null;
  nextJackpotDisplay: string | null;
  drawTimeLocal: string | null;
  /** Which jurisdictions' records agreed on this drawing, for the provenance line. */
  comparedStateCodes: readonly string[];
  /** Non-empty only when jurisdictions disagree. Rendered as a data-conflict notice, never hidden. */
  conflicts: readonly string[];
}

/** BP-04A adaptive states. Every page implements all of them; one is active at a time. */
export type FlagshipResultState = "verified" | "awaitingResult" | "stale" | "unavailable";

export interface FlagshipFreshness {
  lastResultIso: string | null;
  reviewDateIso: string | null;
  daysOld: number | null;
  stale: boolean;
  state: FlagshipResultState;
  /** Reader-facing freshness sentence. Always present; never a bare timestamp. */
  label: string;
}

/* ------------------------------------------------------------------ the model */

export interface FlagshipPageModel {
  entry: FlagshipRegistryEntry;
  config: FlagshipGameConfig;

  /** BP-04A §12 order, plus which ids actually render. */
  order: readonly FlagshipSectionId[];
  visibleSections: readonly FlagshipSectionId[];
  suppressed: readonly { id: FlagshipSectionId; reason: string }[];

  seo: {
    title: string;
    description: string;
    h1: string;
    canonical: string;
    breadcrumbLabel: string;
  };

  result: FlagshipResultView | null;
  freshness: FlagshipFreshness;

  insights: readonly DrawInsight[];
  insightBoundary: string;
  jackpot: JackpotMovement | null;
  /**
   * The current jackpot run, computed from the advertised series — FGP-009.
   *
   * `null` when fewer than two figures are held, in which case FG-09 falls back to the two-point movement
   * statement and its recorded gap, exactly as it did before a series existed.
   */
  jackpotRun: FlagshipJackpotRun | null;

  odds: {
    rows: readonly OddsRow[];
    jackpotRow: OddsRow;
    method: string;
    /** The operator prize matrix, which is not captured. Rendered where the amounts would be. */
    prizeGap: Gap;
    /**
     * The prize tier table, when the data layer supplies one — FGP-009.
     *
     * `null` means no amounts are shown at all and `prizeGap` is rendered instead, which is what the real feed
     * produces today. When a table IS present, every amount carries its own source and the section states where
     * the figures came from; a preview amount is never drawn as an operator-published one.
     */
    prizes: readonly BffPrizeTier[] | null;
  };

  tools: readonly FlagshipTool[];
  inline: readonly FlagshipTool[];

  ai: readonly AiSurface[];

  /** The PUBLISHED drawing series every tool on the page runs against. Real feed records only. */
  history: FlagshipHistory;
  historyDisclosure: string;
  /**
   * How much published history the tools actually have.
   *
   * The explorer, the checker's history modes and the Stats Lab are all built for a run of drawings. This is what
   * they check before offering a search, a multi-draw scan or a statistic — so "not enough published history yet"
   * is a computed state rather than a judgement made in a component.
   */
  coverage: {
    publishedDrawings: number;
    /** Enough drawings for a search over history to mean anything. */
    canSearchHistory: boolean;
    /** Enough drawings to check a line against more than the latest one. */
    canCheckRange: boolean;
    /** Whether any Stats Lab view can be computed. */
    canComputeStats: boolean;
  };

  stats: {
    views: readonly StatView[];
    method: string;
    drawCount: number;
    availableCount: number;
  };

  content: {
    guides: TaggedContentFeed;
    news: TaggedContentFeed;
    community: TaggedContentFeed;
    connected: boolean;
  };

  engagement: readonly EngagementOption[];

  /** Sample lines the checker can load, so the tool can be seen working without typing ten digits. */
  checkerExamples: readonly BffCheckerExample[];

  /**
   * The reader-facing statement that this page is not showing published data — FGP-009.
   *
   * `null` when every figure on the page is real, in which case no banner renders. Driven by `meta.source` in the
   * payload rather than by a hardcoded string, so a page cannot render preview data without saying so.
   */
  preview: { active: boolean; disclosure: string } | null;

  /** Which labelling register the page renders in. See `flagshipDisplay.ts`. */
  displayMode: FlagshipDisplayMode;

  /** Concise FAQs, generated from this page's own governed facts. Rendered inside FG-15. */
  faq: readonly FlagshipFaqEntry[];

  /** The ticket price, or the short form of its recorded gap. Used by the hero's key-facts strip. */
  ticketPriceDisplay: string;

  ads: FlagshipAdProfile;

  /** Every recorded gap on the page, collected for the review banner and the tests. */
  gaps: readonly Gap[];
}

/**
 * The fewest published drawings that make a historical SEARCH meaningful.
 *
 * Below this the explorer renders its limited-data state and lists what is published instead of offering thirteen
 * filters over a handful of rows. The founder's own rule for this page family — *"Do not add 'search' unless it
 * searches meaningful historical data"* — is the reason the threshold exists at all.
 */
export const MIN_ROWS_FOR_SEARCH = 25;

/* ------------------------------------------------------------------ helpers */

function displayDate(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return null;
  /* Noon UTC so the weekday cannot shift across a day boundary in any runtime timezone. The date parts
     themselves come straight from the ISO string and are never re-derived from the Date. */
  const weekday = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const month = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return `${weekday}, ${month} ${Number(d)}, ${y}`;
}

function daysBetween(fromIso: string, toIso: string): number | null {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

/**
 * The freshness statement.
 *
 * `stale` is not a fixed number of days: it is derived from the game's own draw rhythm, so a game drawing three
 * nights a week goes stale sooner than one drawing twice. A hardcoded threshold would call Mega Millions stale
 * on a normal Thursday.
 */
function resolveFreshness(cfg: FlagshipGameConfig, lastResultIso: string | null, reviewDateIso: string | null): FlagshipFreshness {
  if (!lastResultIso) {
    return {
      lastResultIso: null,
      reviewDateIso,
      daysOld: null,
      stale: false,
      state: "unavailable",
      label:
        `No ${cfg.gameLabel} result is connected to this build, so none is shown. Nothing has been filled in to ` +
        "cover the gap.",
    };
  }
  const drawNightsPerWeek = cfg.drawDays.value.split(/,| and /).filter((s) => s.trim().length > 0).length;
  /* The longest ordinary wait between drawings, plus a day of grace for verification. */
  const staleAfter = Math.ceil(7 / Math.max(1, drawNightsPerWeek)) + 1;

  const daysOld = reviewDateIso ? daysBetween(lastResultIso, reviewDateIso) : null;
  const stale = daysOld !== null && daysOld > staleAfter;
  const shown = displayDate(lastResultIso);

  return {
    lastResultIso,
    reviewDateIso,
    daysOld,
    stale,
    state: stale ? "stale" : "verified",
    label: stale
      ? `This is the most recent ${cfg.gameLabel} result held in this build — the drawing on ${shown}. ` +
        `${cfg.gameLabel} draws ${cfg.drawDays.value}, so a newer drawing has almost certainly taken place. ` +
        "Check the official source before acting on it."
      : `Latest ${cfg.gameLabel} result: the drawing on ${shown}.`,
  };
}

function toGroups(cfg: FlagshipGameConfig, main: readonly number[], specials: readonly { label: string; values: number[] }[]): MemberBallGroup[] {
  const mainSpec = cfg.groups.find((g) => g.role === "main");
  return [
    {
      label: null,
      values: [...main],
      colorToken: mainSpec?.colorToken ?? "ball.default",
      visualRole: "main",
      accessibleLabel: mainSpec?.accessibleLabel ?? "Winning numbers",
    },
    ...specials.map((s) => {
      const spec = cfg.groups.find((g) => g.role === "special" && g.label === s.label);
      return {
        label: s.label,
        values: [...s.values],
        colorToken: spec?.colorToken ?? "ball.powerball",
        visualRole: "special" as const,
        accessibleLabel: spec?.accessibleLabel ?? s.label,
      };
    }),
  ];
}

/* ------------------------------------------------------------------ the builder */

/**
 * Build the whole page model for one flagship game.
 *
 * FGP-007 removed the `previewEnabled` parameter along with the environment guard it carried. The model is now
 * buildable for any REGISTERED game and `null` for anything else — which is the same route-inventory rule the
 * routes themselves apply, so the two cannot disagree.
 */
export function buildFlagshipPageModel(gameSlug: string): FlagshipPageModel | null {
  const entry = flagshipRegistryEntry(gameSlug);
  const config = flagshipGameConfig(gameSlug);
  if (!entry || !config) return null;

  /* ---- result ---- */
  const national = nationalDraw(config.gameId);
  const reviewDateIso = nationalReviewDate(config.gameId);
  const event = national?.event ?? null;

  /* The date-effective format version, so a historical drawing can never be rendered under today's rules. */
  const format = event?.resultDate
    ? selectFormatVersion(formatVersionsFor(national?.referenceStateCode ?? "fl"), config.gameSlug, event.resultDate)
    : null;

  const cashValueGap = config.gaps.find((g) => g.what.includes("cash value")) ?? {
    what: "The cash value",
    why: "Not carried by the production results feed.",
  };

  const result: FlagshipResultView | null =
    event && event.mainNumbers.length > 0 && event.resultDate && national
      ? {
          drawDateIso: event.resultDate,
          drawDateDisplay: displayDate(event.resultDate) ?? event.resultDate,
          groups: toGroups(config, event.mainNumbers, event.specialBalls),
          /*
           * A multiplier is rendered beside the numbers ONLY when the game's own rules say it is drawn. Mega
           * Millions' multiplier is assigned per ticket at purchase, so even if a feed record carried a value it
           * must not appear here — BP-04A §46 names *"no draw-level current Mega Millions multiplier"* as a
           * guardrail, and this is where it is enforced.
           */
          multiplier:
            config.multiplier.drawnWithResult && event.multiplier
              ? {
                  label: event.multiplier.label,
                  value: event.multiplier.value,
                  mode: config.multiplier.mode,
                  note: config.multiplier.conditionNote.value,
                }
              : null,
          secondary:
            config.secondaryDraw && event.secondaryDraw
              ? {
                  label: event.secondaryDraw.label,
                  groups: toGroups(config, event.secondaryDraw.mainNumbers, event.secondaryDraw.specialBalls),
                  timingNote: config.secondaryDraw.timingNote.value,
                  topPrizeNote: config.secondaryDraw.topPrizeNote?.value ?? null,
                }
              : null,
          jackpotDisplay: event.topPrizeDisplay,
          jackpotLabel:
            format?.prize.kind === "estimatedAnnuitizedJackpot" ? "Estimated jackpot (annuity)" : "Advertised jackpot",
          cashValueDisplay: null,
          cashValueGap,
          nextDrawDateDisplay: displayDate(event.nextDrawDate),
          nextDrawIso: event.nextDrawDate,
          nextJackpotDisplay: event.nextPrizeDisplay,
          drawTimeLocal: event.drawTimeLocal,
          comparedStateCodes: national.comparedStateCodes,
          conflicts: national.conflicts,
        }
      : null;

  const freshness = resolveFreshness(config, event?.resultDate ?? null, reviewDateIso);

  /* ---- deterministic intelligence, rendered inside the hero (FG-04 is merged) ---- */
  const shape: DrawShape | null = result
    ? {
        main: event!.mainNumbers,
        special: event!.specialBalls[0]?.values[0] ?? null,
        specialLabel: event!.specialBalls[0]?.label ?? null,
        mainPool: config.matrix.mainPool,
      }
    : null;

  const jackpot = result
    ? jackpotMovement(
        result.jackpotDisplay,
        result.drawDateDisplay,
        result.nextJackpotDisplay,
        result.nextDrawDateDisplay,
      )
    : null;

  /* ---- odds ---- */
  const prizeGap = config.gaps.find((g) => g.what.includes("prize amounts")) ?? {
    what: "The prize amounts",
    why: "Not captured in this build.",
  };

  /*
   * ---- the drawing series, and everything computed over it ----
   *
   * FGP-008 made this the PUBLISHED feed only. FGP-009 moves it behind the BFF seam: `getFlagshipGamePageData`
   * answers, and today that resolves to the preview payload whose newest drawing is the real published one.
   *
   * `publishedHistory` is still the fallback and is still the whole story if the data layer ever returns nothing,
   * so the launch-safe path — real drawings or a stated empty state, never an invented one — remains intact
   * underneath.
   */
  const data = getFlagshipGamePageData(gameSlug);
  const history = data ? historyFromBff(config, data.history) : publishedHistory(config);
  const preview =
    data && isPreviewData(data) && data.meta.disclosure
      ? { active: true, disclosure: data.meta.disclosure }
      : null;

  /*
   * The previous drawing now EXISTS, because the series supplies one — so the repeat insight is COMPUTED rather
   * than omitted. That is the substantive difference the connected series makes to the hero: "which numbers
   * carried over from the drawing before" is a question a reader actually asks, and it was previously
   * unanswerable.
   */
  const insights: DrawInsight[] = shape
    ? drawInsights(shape, history.rows[1]?.main ?? null)
    : [];
  const currentEra = config.ruleEras.find((e) => e.effectiveTo === null) ?? config.ruleEras[0];
  const views = statsLab({
    rows: history.rows,
    mainPool: config.matrix.mainPool,
    mainCount: config.matrix.mainCount,
    drawNights: drawNightsOf(config),
  });

  /* ---- content ----
     A registered content system wins PER KIND (the news store is now real; forum and blog are not), and the BFF
     payload fills only the unregistered kinds. A payload carrying nothing still renders each rail's recorded
     reason. */
  const feeds = data
    ? flagshipContentFeedsFrom(config.contentTag, data.content)
    : flagshipContentFeeds(config.contentTag);
  const contentConnected =
    isContentConnected() ||
    feeds.guides.items.length + feeds.news.items.length + feeds.community.items.length > 0;

  /* ---- AI ---- */
  const previousRow = history.rows[1] ?? null;
  const ai = orderedAiSurfaces(aiSurfaces({
    config,
    draw: shape,
    drawDateDisplay: result?.drawDateDisplay ?? null,
    nextDrawDateDisplay: result?.nextDrawDateDisplay ?? null,
    jackpotDisplay: result?.jackpotDisplay ?? null,
    nextJackpotDisplay: result?.nextJackpotDisplay ?? null,
    contentConnected,
    contentItems: {
      news: feeds.news.items.map((i) => ({
        title: i.title, publishedIso: i.publishedIso, provenance: i.provenance,
      })),
      forum: feeds.community.items.map((i) => ({
        title: i.title,
        ...(i.replyCount === undefined ? {} : { replyCount: i.replyCount }),
        provenance: i.provenance,
      })),
    },
    displayMode: FLAGSHIP_DISPLAY_MODE,
    previous: previousRow
      ? { dateIso: previousRow.drawDateIso, main: previousRow.main, special: previousRow.special }
      : null,
    history: history.rows.length > 0
      ? { total: history.provenance.total, productionFeed: history.provenance.productionFeed }
      : null,
  }));

  /* ---- sections ---- */
  const ads = flagshipAdProfileFor(config.gameSlug);
  const suppressed: { id: FlagshipSectionId; reason: string }[] = [];
  /* The five ids merged into a neighbour are recorded as suppressed WITH their destination, so the section
     inventory stays complete even though they no longer own a box. */
  for (const [merged, into] of Object.entries(FLAGSHIP_MERGED_SECTIONS)) {
    suppressed.push({
      id: merged as FlagshipSectionId,
      reason: `Merged into ${into} — the founder revision compresses passive sections rather than stacking them.`,
    });
  }

  const visibleSections = FLAGSHIP_SECTION_ORDER.filter((id) => {
    if (id.startsWith("AD-")) {
      suppressed.push({ id, reason: ads.gap });
      return false;
    }
    if (id === "FG-09" && !jackpot) {
      suppressed.push({
        id,
        reason: "No jackpot figures are held for this game, so there is nothing to show about its jackpot.",
      });
      return false;
    }
    return true;
  });

  /* ---- every recorded gap, collected once ---- */
  const gaps: Gap[] = [
    ...config.gaps,
    ...(isGap(config.ticketPrice) ? [config.ticketPrice] : []),
    ...config.jurisdictionNotes.map((n) => n.body).filter(isGap),
    ...[feeds.guides.unavailable, feeds.news.unavailable, feeds.community.unavailable].filter(
      (g): g is Gap => g !== null,
    ),
  ];

  return {
    entry,
    config,
    order: FLAGSHIP_SECTION_ORDER,
    visibleSections,
    suppressed,

    seo: {
      title: config.seo.title,
      description: config.seo.description,
      h1: config.seo.h1,
      canonical: canonicalUrl(config.canonicalPath),
      breadcrumbLabel: config.seo.breadcrumbLabel,
    },

    result,
    freshness,

    insights,
    insightBoundary: INSIGHT_BOUNDARY,
    jackpot,
    jackpotRun: data ? jackpotRun(data.jackpotHistory, config.gameLabel) : null,

    odds: {
      rows: oddsTable(config.matrix, config.specialLabel),
      jackpotRow: jackpotOdds(config.matrix),
      method: oddsMethod(config.matrix, config.specialLabel),
      prizeGap,
      prizes: data?.prizeTiers ?? null,
    },

    tools: flagshipTools(config),
    inline: inlineTools(config),

    ai,

    history,
    historyDisclosure: historyDisclosure(history, config.gameLabel),

    coverage: {
      publishedDrawings: history.rows.length,
      /* A "search" over a single drawing is not a search; the explorer says so instead of offering one. */
      canSearchHistory: history.rows.length >= MIN_ROWS_FOR_SEARCH,
      canCheckRange: history.rows.length > 1,
      canComputeStats: views.some((v) => v.available),
    },

    stats: {
      views,
      method: statsMethod(
        config.gameLabel,
        history.rows,
        currentEra?.label ?? "not recorded",
        history.provenance,
        FLAGSHIP_DISPLAY_MODE,
      ),
      drawCount: history.rows.length,
      availableCount: views.filter((v) => v.available).length,
    },

    content: { ...feeds, connected: contentConnected },

    engagement: engagementOptions(config),

    checkerExamples: data?.checkerExamples ?? [],
    preview,
    displayMode: FLAGSHIP_DISPLAY_MODE,

    faq: flagshipFaq(config),

    ticketPriceDisplay: isGap(config.ticketPrice) ? "Not captured" : config.ticketPrice.value,

    ads,

    gaps,
  };
}
