/*
 * THE JG-M2 STATE-NATIVE MODEL — LRG-GAME-050.
 *
 * Authority: BP-04B §18 (the approved JG-01…JG-18 order), §19 (variant contract), §28 (state-native manifest),
 * the 2026-08-04 brief §8 (nine visual bands) and §12 (data ownership split), founder decisions 1–8 of
 * 2026-08-04.
 *
 * ══ THE OWNERSHIP SPLIT THIS MODULE IMPLEMENTS ══
 *
 *   Runtime / dynamic    the drawn numbers, dates, statuses, next draw, freshness  → the State draw events
 *   Versioned rules      play types, wagers, payouts, odds, add-ons, effective eras → `floridaGameRules.ts`
 *   Presentation config  labels, copy, capabilities, navigation, starters           → `config/games/*.json`
 *   Review-only          history, editorial inventory, alert options                → `gameReviewFixture.ts`
 *
 * Nothing crosses. A configuration cannot state a payout, a rule era cannot state a result, and the fixture
 * cannot reach the first two.
 *
 * ══ WHY THE FAMILY COMES FROM THE STATE CONFIGURATION ══
 *
 * The brief is explicit: *"reuse the State family composition rather than creating a competing family
 * registry."* Pick 3's members already exist in `config/states/fl.json` as `presentation.families`, and the
 * State page renders them today. This module reads that same array and runs it through the same generic
 * `buildStateFamilies`. So Midday and Evening are the SAME two records on both pages, and a member added to
 * the State configuration appears here with no Game Page edit at all.
 *
 * The alternative — a `members` array in the game configuration — would have been two declarations of one
 * fact, which is how Midday and Evening drift apart.
 *
 * ══ WHY "NOW" IS AN ARGUMENT AND NOT A CLOCK READ ══
 *
 * Founder decision 1 fixes the review date to the captured feed's newest draw date. A twice-daily game read
 * against the real clock would show a 26-day-old row as "Latest" and a past date as "Next drawing". The date
 * enters from the caller so the honesty of the page is testable rather than dependent on when the test ran.
 */

import { buildStateFamilies } from "../state/stateFamilyBuilder";
import { stateViewConfigFor } from "../state/stateViewConfigRegistry";
import { drawEventsFor } from "../state/stateDrawEvents";
import { formatVersionsFor } from "../state/stateFormatRegistry";
import { selectFormatVersion, type ResultFormatVersion } from "../state/resultFormatContract";
import { formatProfile, type FormatProfile } from "./gameFormatProfile";
import { stateManifestFor } from "../state/stateContentManifests";
import { gate } from "../state/publicationGate";
import type { ResolvedFamily, ResolvedMember } from "../state/gameFamilyPresentation";
import {
  activeAddOns, currentRuleEra, eraPublishableAsCurrent, selectRuleEra,
  type AddOnRule, type GameRuleEra, type PayoutRow, type PlayTypeRule, type RuleDocument, type WagerOption,
} from "./gameRuleContract";
import { ruleErasFor } from "./gameRuleProvider";
import { resolveReviewDate, type ReviewDateSource } from "./gameReviewDate";
import {
  alertOptionsFor, buildReviewHistory, provenanceSummary, REVIEW_BANNER,
  type AlertOption, type ReviewDrawRecord,
} from "./gameReviewFixture";
import { editorialSections, type EditorialSection } from "./gameEditorial";
import {
  consecutiveSummary, coverageOf, drawInsights, filterDraws, historicalGaps, pairFrequency, positionFrequency,
  repeatFromPrevious, shapeDistribution, STATISTICS_NEUTRALITY, sumDistribution, variantComparison,
  type AnalysisCoverage, type AnalysisFilter, type DrawInsight,
} from "./digitHistoryAnalysis";
import { gameCapability, type GameViewConfig } from "./gameViewConfig";
import { lastUpdatedSourceLine } from "../text/lastUpdated";

/* ------------------------------------------------------------------ bands */

export type GameBandId =
  | "result" | "act" | "today-rules" | "workspace" | "generate-learn" | "local" | "context" | "community" | "trust";

export interface GameBand {
  id: GameBandId;
  /** Reader-facing band label. */
  title: string;
  /**
   * Whether the label is for assistive technology only.
   *
   * EVERY band carries a real `h2`, because the heading structure has to be `h1` → band `h2` → section `h3`
   * for the outline to be navigable — a screen-reader user moving by heading needs the bands to be the second
   * level. But a visible "Result and immediate action" caption sitting above the winning numbers would be
   * page furniture in the one place the reader wants none. So those two bands keep the heading and hide it.
   */
  visuallyHiddenTitle?: boolean;
  sections: readonly string[];
}

/**
 * The nine bands from the brief §8.
 *
 * All eighteen sections exist; the bands are what stop them becoming eighteen equal cards. The advertisement
 * anchors from BP-04B §18 are intentionally absent from every band: they stay in `order` so the governed
 * sequence is preserved, and they resolve to nothing because no Game Page ad profile is approved.
 */
export const JG_M2_BANDS: readonly GameBand[] = Object.freeze([
  { id: "result", title: "Latest result and how to play", visuallyHiddenTitle: true, sections: ["JG-01", "JG-02"] },
  { id: "act", title: "Do something with this result", sections: ["JG-03", "JG-04"] },
  { id: "today-rules", title: "Today's drawings and how the game works", sections: ["JG-05", "JG-06"] },
  { id: "workspace", title: "History and analysis", sections: ["JG-07", "JG-08", "JG-09"] },
  { id: "generate-learn", title: "Generate and learn", sections: ["JG-10", "JG-11"] },
  /* `{state}` is substituted with the jurisdiction name at render. It read "Florida player information",
     which put a jurisdiction in generic code and would have mislabelled every other state's band. */
  { id: "local", title: "{state} player information", sections: ["JG-12", "JG-13"] },
  { id: "context", title: "Recent context and reading", sections: ["JG-14", "JG-15"] },
  { id: "community", title: "Discuss and come back", sections: ["JG-16", "JG-17"] },
  { id: "trust", title: "Sources and responsible play", visuallyHiddenTitle: true, sections: ["JG-18"] },
]);

/* ------------------------------------------------------------------ view types */

export interface PayoutMatrixView {
  wagers: readonly WagerOption[];
  playTypes: readonly PlayTypeRule[];
  base: readonly PayoutRow[];
  addOns: readonly {
    key: string;
    label: string;
    definition: string;
    priceEffect: string;
    effectiveFrom: string;
    payouts: readonly PayoutRow[];
    maxWinsByPlayType: Readonly<Record<string, number>>;
  }[];
  /** Populated only when the matrix is suppressed, with the reason. Diagnostic, not reader copy. */
  suppressedReason: string | null;
}

export interface StatisticsView {
  coverage: AnalysisCoverage;
  positions: ReturnType<typeof positionFrequency>;
  sums: ReturnType<typeof sumDistribution>;
  shapes: ReturnType<typeof shapeDistribution>;
  frontPairs: ReturnType<typeof pairFrequency>;
  backPairs: ReturnType<typeof pairFrequency>;
  consecutive: ReturnType<typeof consecutiveSummary>;
  repeats: ReturnType<typeof repeatFromPrevious>;
  gaps: ReturnType<typeof historicalGaps>;
  variants: ReturnType<typeof variantComparison>;
  neutrality: string;
}

export interface MemberScheduleView {
  gameId: number;
  variantLabel: string;
  status: string;
  /** `null` whenever the feed's next-draw date is not actually in the future. Never a past date. */
  nextDrawDisplay: string | null;
  drawTimeLocal: string | null;
  salesCutoff: string | null;
}

/**
 * One JG-12 local-offering fact.
 *
 * `source` names where the value came from, so a reviewer can see that ticket price is now operator-verified
 * rather than export-derived — the specific correction founder decision 5 asked for.
 */
export interface OfferingFact {
  key: string;
  label: string;
  value: string;
  source: "operatorRule" | "operatorSite" | "governedManifest" | "productionFeed";
}

export interface GameM2Model {
  /**
   * The fixed review date every date-sensitive statement on the page is measured against — resolved for THIS
   * jurisdiction, not shared across jurisdictions (LRG-GAME-053).
   */
  reviewDateIso: string;
  /**
   * Which source answered: a governed last-updated fact, this jurisdiction's newest draw event, or the isolated
   * fallback. Copy that ATTRIBUTES a date must check this — a page resting on the fallback has no governed date
   * and must not present one as a fact.
   */
  reviewDateSource: ReviewDateSource;
  reviewBanner: string;

  family: ResolvedFamily | null;
  members: readonly ResolvedMember[];
  schedules: readonly MemberScheduleView[];

  /**
   * The FORMAT profile — the single source of result shape for every tool on the page.
   *
   * `era` owns play types, wagers, payouts and odds; the profile owns how many values are drawn, from what
   * range, of what type, in how many groups, and whether matching is ordered. Before LRG-GAME-052 the era
   * carried a second copy of the shape and every tool read that, which is why they were digit-only.
   */
  profile: FormatProfile | null;
  /**
   * The format VERSION the profile was derived from — the date-effective record itself.
   *
   * Exposed so a test can assert on the declared contract (for example that every group states its matching
   * semantics) rather than only on the derived profile.
   */
  formatVersion: ResultFormatVersion | null;

  era: GameRuleEra | undefined;
  eraPublishable: boolean;
  /**
   * The rule documents JG-18 cites, without their `supports` evidence quotes.
   *
   * `era` is handed to client components (the checker needs the payout table), so everything on it is
   * serialized into the page. The `supports` strings are long verbatim rule extracts — including the passage
   * recording that 1-OFF *ended* — and nothing renders them. Shipping them would put a retired play type's
   * name in the HTML for no reader benefit, so the evidence stays where a reviewer actually reads it:
   * `floridaGameRules.ts`.
   */
  sourceRefs: readonly { title: string; ruleNumber: string | null; url: string; accessed: string }[];
  matrix: PayoutMatrixView | null;
  /** Add-ons in force on the review date, e.g. FIREBALL. */
  addOnsInForce: readonly AddOnRule[];

  history: readonly ReviewDrawRecord[];
  historyProvenance: { productionFeed: number; internalSample: number };
  statistics: StatisticsView | null;
  /**
   * The compact statistics preview — three or four figures, shown by default.
   *
   * The previous revision rendered ten stat panels inline, which made the page enormous and buried the parts a
   * reader actually scans. The detailed views still exist; they now sit behind an explicit expansion.
   */
  statsPreview: readonly { label: string; value: string; note: string }[];
  insights: readonly DrawInsight[];
  /**
   * JG-14, consolidated.
   *
   * Five near-identical insight cards became one short summary with a few supporting lines. The underlying
   * deterministic findings are unchanged — `insights` still carries them, each with its method and window — but
   * the section now reads as a paragraph rather than a stack.
   */
  whatChanged: { summary: string; points: readonly string[] } | null;

  /**
   * Whether the JG-03 comparison tool can actually function.
   *
   * DEFECT FIX. This was previously inferred from "the era is publishable", which is not the same question.
   * Cash Pop has a publishable era and NO priced payout rows, so the checker rendered with an empty play-type
   * dropdown above a live submit button — a control that looks functional and is not, which `FD-S-08` and
   * `CLAUDE.md` §9 both forbid. A comparison needs a play type it can price; without one the section keeps its
   * heading and its explanation, and the tool is not drawn.
   */
  checkerUsable: boolean;
  /** Whether JG-02 draws the first-party commerce entry. The section renders either way. */
  buyNowUsable: boolean;

  /**
   * A plain-language description of the format's shape, for JG-06 on a game with no verified rule era.
   *
   * "Choose six numbers from 1 through 53" is knowable from the format alone, so a game without a payout
   * matrix can still explain how it is played rather than suppressing the whole section.
   */
  formatSummary: string | null;

  /** JG-12. Only facts with a named source appear; an unverified field is absent, never warned about. */
  offeringFacts: readonly OfferingFact[];

  /** JG-15, grouped into the three visible published categories with resolved crawlable destinations. */
  editorial: readonly EditorialSection[];
  alerts: readonly AlertOption[];

  /** One compact source/freshness line. The ONLY freshness statement outside JG-18. */
  sourceLine: string;
}

/* ------------------------------------------------------------------ helpers */

function displayDate(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  const weekday = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  return `${weekday} ${m}/${d}/${y}`;
}

/**
 * Whether a prize figure can move for this game — DERIVED from the governed format, not listed.
 *
 * Decides whether a top-prize alert is offered at all. A fixed-prize digit game has nothing to alert on, and
 * offering the option anyway is the disabled-control failure `FD-S-08` forbids.
 *
 * An earlier revision hardcoded `["pick-2","pick-3","pick-4","pick-5","cash-pop"]` here, which put game slugs
 * into generic code and would silently answer "yes" for any new fixed-prize game. The format registry already
 * classifies every prize, so the question is answered from that instead: a fixed prize and a stake-dependent
 * prize cannot move, and a jackpot can.
 */
function hasMovingTopPrize(fmt: ResultFormatVersion | undefined): boolean {
  if (!fmt) return false;
  return !["fixedTopPrize", "stakeDependentPrize", "unavailable"].includes(fmt.prize.kind);
}

/* ------------------------------------------------------------------ build */

export function buildGameM2Model(
  stateCode: string,
  config: GameViewConfig,
  previewEnabled: boolean,
): GameM2Model | null {
  const familyId = config.game.familyId ?? config.game.gameSlug;
  const ruleKey = config.game.ruleGameKey ?? config.game.gameSlug;

  /* ---- family composition, from the State configuration ---- */
  const stateCfg = stateViewConfigFor(stateCode);
  const familyCfg = stateCfg?.presentation.families.find((f) => f.familyId === familyId);
  if (!familyCfg) return null;

  /*
   * ---- the review date, resolved for THIS jurisdiction ----
   *
   * Was `REVIEW_DATE_ISO`, one constant equal to Florida's newest result date, applied to every state. See
   * `gameReviewDate.ts` for what that broke. The resolved date drives date-effective format selection, rule-era
   * selection, the generated review history, the next-draw suppression guard and the freshness line — all of
   * which must agree, and all of which must be the jurisdiction's own.
   */
  const reviewDate = resolveReviewDate(stateCode);
  const reviewDateIso = reviewDate.iso;

  const resolved = buildStateFamilies({
    families: [familyCfg],
    events: drawEventsFor(stateCode),
    formats: formatVersionsFor(stateCode),
    timezoneLabel: config.game.timezoneLabel,
    todayIso: reviewDateIso,
  });
  const family = resolved[0] ?? null;
  const members = family?.members ?? [];

  /*
   * ---- the format profile ----
   *
   * Selected by DRAW date, not by "today", and by the family's own `formatGameKey`. `selectFormatVersion`
   * throws on overlapping effective ranges, so an ambiguous era fails loudly instead of picking one.
   */
  const formatVersion = selectFormatVersion(
    formatVersionsFor(stateCode),
    familyCfg.formatGameKey,
    reviewDateIso,
  );
  const profile = formatVersion ? formatProfile(formatVersion) : null;

  /* ---- schedules, with the past-date guard founder decision 1 requires ---- */
  const events = drawEventsFor(stateCode);
  const schedules: MemberScheduleView[] = familyCfg.members
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => {
      const e = events.find((x) => x.gameId === m.gameId);
      const next = e?.nextDrawDate ?? null;
      /* A next-draw date that is not in the future is not a next draw. Suppressed rather than shown. */
      const futureNext = next && next >= reviewDateIso ? next : null;
      return {
        gameId: m.gameId,
        variantLabel: m.variantLabel,
        status: "verified",
        nextDrawDisplay: displayDate(futureNext),
        drawTimeLocal: e?.drawTimeLocal ? `${e.drawTimeLocal.trim()} ${config.game.timezoneLabel}` : null,
        salesCutoff: e?.salesCutoff ?? null,
      };
    });

  /* ---- rules: the era in force on the review date ---- */
  /* Through the provider, so a jurisdiction's rules live in its own module and an unregistered one gets an
     empty list rather than another state's payouts. */
  const ruleEras = ruleErasFor(stateCode);
  const eraSource = selectRuleEra(ruleEras, ruleKey, reviewDateIso) ?? currentRuleEra(ruleEras, ruleKey);
  const eraPublishable = eraPublishableAsCurrent(eraSource);

  /*
   * The citation list JG-18 renders, and the lean era everything else uses.
   *
   * `supports` holds long verbatim rule extracts for provenance. Nothing renders them, and `era` is passed to
   * client components, so leaving them attached would serialize several kilobytes of rule text — including the
   * passage recording that 1-OFF ended — into every page. Stripped here; the evidence remains authoritative in
   * `floridaGameRules.ts`, which is where a reviewer verifies it.
   */
  const sourceRefs = (eraSource?.sources ?? []).map((d) => ({
    title: d.title,
    ruleNumber: d.ruleNumber,
    url: d.url,
    accessed: d.accessed,
  }));
  const strip = (d: RuleDocument): RuleDocument => ({ ...d, supports: "" });
  const era: GameRuleEra | undefined = eraSource
    ? {
        ...eraSource,
        sources: eraSource.sources.map(strip),
        addOns: eraSource.addOns.map((a) => ({ ...a, sources: a.sources.map(strip) })),
      }
    : undefined;
  const addOnsInForce = era ? activeAddOns(era, reviewDateIso) : [];

  /*
   * Founder decision 6. The matrix renders only when the era is publishable as current AND actually carries
   * priced rows. Jackpot Triple Play and Cash Pop reach the second condition and fail it, so their prize table
   * suppresses with a recorded reason instead of rendering an empty grid.
   */
  let matrix: PayoutMatrixView | null = null;
  if (era) {
    const reason = !eraPublishable
      ? `The rules in force are recorded as "${era.verification}", which may not be published as current fact.`
      : era.payouts.length === 0
        ? era.absent.find((a) => a.field === "payoutMatrix")?.reason ??
          "No primary-source prize table has been verified for this game."
        : null;
    matrix = {
      wagers: era.wagers,
      playTypes: era.playTypes,
      base: reason ? [] : era.payouts,
      addOns: reason
        ? []
        : addOnsInForce.map((a) => ({
            key: a.key,
            label: a.label,
            definition: a.definition,
            priceEffect: a.priceEffect,
            effectiveFrom: a.effectiveFrom,
            payouts: a.payouts,
            maxWinsByPlayType: a.maxWinsByPlayType,
          })),
      suppressedReason: reason,
    };
  }

  /* ---- history and analysis: guarded review data ---- */
  /* History needs the FORMAT, not the rule era: the shape of a drawing is a format fact. */
  const history = profile
    ? buildReviewHistory(
        previewEnabled,
        stateCode,
        familyCfg.members.map((m) => ({ gameId: m.gameId, variantLabel: m.variantLabel })),
        profile,
        reviewDateIso,
      )
    : [];

  const filter: AnalysisFilter = {
    variant: "all",
    fromIso: null,
    toIso: null,
    includeCorrected: true,
  };
  const filtered = filterDraws(history, filter);
  const coverage = coverageOf(filtered, filter);

  const statistics: StatisticsView | null =
    profile?.main && filtered.length > 0
      ? {
          coverage,
          /* Positional frequency is only meaningful where the group is ordered. On an unordered set it would
             present an artefact of feed ordering as a property of the game, which the direction forbids. */
          positions: profile.supports.positionalStatistics
            ? positionFrequency(filtered, profile.main.count, profile.main.min, profile.main.max)
            : [],
          sums: sumDistribution(filtered, profile.main.count, profile.main.max),
          shapes: shapeDistribution(filtered),
          frontPairs: pairFrequency(filtered, "front"),
          backPairs: pairFrequency(filtered, "back"),
          consecutive: consecutiveSummary(filtered),
          repeats: repeatFromPrevious(filtered),
          gaps: historicalGaps(filtered, profile.main.min, profile.main.max),
          variants: variantComparison(filtered),
          neutrality: STATISTICS_NEUTRALITY,
        }
      : null;

  const insights = profile?.main && filtered.length > 0 ? drawInsights(filtered, coverage, profile.main.max) : [];

  /*
   * The compact preview. Four figures chosen because a Pick 3 player can act on them without a legend:
   * how much history is loaded, how often a digit repeats, where the totals cluster, and how the two drawings
   * compare. Everything else moved behind the detailed view.
   */
  const statsPreview: { label: string; value: string; note: string }[] = [];
  if (statistics && profile?.main) {
    const s2 = statistics;
    const g = profile.main;
    /* A one-value game has no "total" and no "repeat" — the metrics are named and filtered from the format. */
    const single = g.count === 1;
    const noun = g.valueType === "digit" ? "digit" : "number";

    statsPreview.push({
      label: "Drawings loaded",
      value: String(s2.coverage.drawCount),
      note: `${s2.coverage.firstDrawIso} to ${s2.coverage.lastDrawIso}`,
    });

    /*
     * The repeat metric applies only where a repeat is POSSIBLE.
     *
     * Cash Pop draws one number, so "contained a repeated digit: 0 of 303" was true, meaningless and taking up
     * a tile. A single-pool ball game cannot repeat either, so the same rule removes it there.
     */
    if (!single && g.semantics.repeatsAllowed) {
      const withRepeat = s2.shapes.onePair + s2.shapes.triple;
      statsPreview.push({
        label: `Contained a repeated ${noun}`,
        value: `${withRepeat} of ${s2.shapes.total}`,
        note: `Any ${noun} appearing more than once, in any position`,
      });
    }

    const busiest = [...(s2.sums?.buckets ?? [])].sort((a, b) => b.count - a.count)[0];
    if (busiest) {
      statsPreview.push({
        label: single ? "Most common value band" : "Most common total band",
        value: busiest.label,
        note: `${busiest.count} of ${s2.coverage.drawCount} drawings`,
      });
    }

    if (s2.variants.rows.length > 1) {
      statsPreview.push({
        label: single ? `Average ${noun} by drawing` : "Average total by drawing",
        value: s2.variants.rows.map((r) => `${r.variantLabel} ${r.averageSumDisplay}`).join(" · "),
        note: single
          ? `The drawn ${noun}, averaged over the same window`
          : `Sum of the drawn ${noun}s, over the same window`,
      });
    }
  }

  /*
   * One "what changed" summary instead of five cards.
   *
   * The findings are the same deterministic observations; this only changes how many boxes they occupy. The
   * repeat figures are per-member because comparing a Midday drawing with the preceding Evening one would be
   * comparing two different games.
   */
  let whatChanged: { summary: string; points: readonly string[] } | null = null;
  if (statistics && filtered.length > 0 && profile?.main) {
    /*
     * ---- the vocabulary and the applicability come from the FORMAT, exactly as the JG-09 tiles do ----
     *
     * These three sentences hardcoded "digit" and printed all three for every game. On Cash Pop — one number
     * from 1 to 15 — that produced "0 of 303 drawings contained a repeated digit" and "0 of 303 drawings
     * contained two digits next to each other in value": true, meaningless, and describing a digit game the
     * reader is not looking at. The JG-09 tiles were corrected for this in LRG-GAME-052 and this summary was
     * missed, so the two sections disagreed about what kind of game Cash Pop is.
     */
    const g = profile.main;
    const single = g.count === 1;
    const noun = g.valueType === "digit" ? "digit" : "number";
    const rep = repeatFromPrevious(filtered);
    const points: string[] = [];
    for (const r of Object.values(rep.byGameId)) {
      if (r.compared === 0) continue;
      points.push(
        `${r.variantLabel || "Main"}: ${r.shared} of the last ${r.compared} drawings shared a ${noun} with ` +
        "the drawing before it.",
      );
    }
    /* A repeat is only reportable where the format permits one. A single value cannot repeat, and neither can a
       draw from a pool without replacement. */
    if (!single && g.semantics.repeatsAllowed) {
      const shape = statistics.shapes;
      points.push(`${shape.onePair + shape.triple} of ${shape.total} drawings contained a repeated ${noun}.`);
    }
    /* Two values cannot be adjacent when only one is drawn. */
    if (!single) {
      const consec = statistics.consecutive;
      points.push(
        `${consec.drawsWithConsecutive} of ${consec.total} drawings contained two ${noun}s next to each ` +
        "other in value.",
      );
    }
    whatChanged = { summary: coverage.statement, points };
  }

  /* ---- the format summary, for games with no verified rule era ---- */
  /*
   * "Choose six numbers from 1 through 53" is knowable from the FORMAT alone.
   *
   * JG-06 used to suppress entirely when a game had no verified rule era, which hid the how-to-play explanation
   * along with the prize table for seven of the ten representative games. The matrix still suppresses on its
   * own terms; the shape does not have to.
   */
  const formatSummary = profile?.main
    ? (() => {
        const g = profile.main;
        const what = g.valueType === "digit" ? "digit" : "number";
        const head =
          g.count === 1
            ? `Choose one ${what} from ${g.min} to ${g.max}.`
            : `Choose ${g.count} ${what}s from ${g.min} to ${g.max}${g.semantics.repeatsAllowed ? ", and a value may repeat" : ", each different"}.`;
        const order =
          g.count > 1 ? (g.semantics.matchOrdered ? " The order matters." : " The order does not matter.") : "";
        const extras = profile.extraGroups
          .filter((x) => x.role !== "addOn")
          .map((x) =>
            x.count === 1
              ? `Then choose one ${x.label ?? "special number"} from ${x.min} to ${x.max}, drawn from its own pool.`
              : `Then choose ${x.count} ${x.label ?? "special numbers"} from ${x.min} to ${x.max}.`,
          );
        return [head + order, ...extras].join(" ");
      })()
    : null;


  /*
   * ---- JG-12 offering facts ----
   *
   * Founder decision 5 in practice: ticket price and Advance Play appear ONLY because they were read from the
   * promulgated rule, and they carry `operatorRule` so that is visible. Where the rule era has no verified
   * value the fact is omitted — `absent` in the era is not rendered as an "unverified" warning card, which
   * `FD-S-02` and the brief §13 both forbid.
   */
  const manifest = stateManifestFor(stateCode);
  const offeringFacts: OfferingFact[] = [];
  const pushFact = (key: string, label: string, value: string | null | undefined, source: OfferingFact["source"]) => {
    if (value) offeringFacts.push({ key, label, value, source });
  };

  if (manifest) {
    const operator = gate(manifest.operatorName, previewEnabled);
    if (operator.publish) pushFact("operator", "Operator", operator.value, "governedManifest");
    const age = gate(manifest.minimumPurchaseAge, previewEnabled);
    if (age.publish && age.value) pushFact("age", "Minimum age", `${age.value} or older`, "governedManifest");
  }
  if (era) {
    pushFact("ticketPrice", "Ticket price", era.ticketPrice, "operatorRule");
    pushFact("advancePlay", "Advance Play", era.advancePlay, "operatorRule");
    pushFact(
      "wagers",
      "Play amounts",
      era.wagers.map((w) => w.label).join(" or "),
      "operatorRule",
    );
    for (const a of addOnsInForce) {
      pushFact(
        `addon-${a.key}`,
        `${a.label} availability`,
        `Offered. ${a.priceEffect}`,
        "operatorRule",
      );
    }
  }
  for (const s of schedules) {
    if (!s.drawTimeLocal) continue;
    pushFact(
      `schedule-${s.gameId}`,
      s.variantLabel ? `${s.variantLabel} drawing` : "Drawing",
      s.salesCutoff ? `${s.drawTimeLocal} · sales close ${s.salesCutoff}` : s.drawTimeLocal,
      "productionFeed",
    );
  }

  /* ---- editorial and alerts ---- */
  /*
   * Editorial is CONFIGURATION, not a slug branch, and it arrives here already grouped into the three visible
   * categories with their destinations resolved.
   *
   * An earlier revision read `ruleKey === "pick-3" ? PICK3_EDITORIAL : []`, which is exactly the per-game branch
   * this architecture exists to avoid. A category with no articles is dropped by `editorialSections` rather than
   * rendered empty, which is what removes the "not yet published" cards.
   */
  const editorial = previewEnabled ? editorialSections(config, { limit: 3 }) : [];

  /*
   * The checker needs a play type it can PRICE, not merely a publishable era. Checked here so the section and
   * the component cannot disagree about whether the tool is available.
   */
  const checkerUsable =
    era !== undefined &&
    profile !== null &&
    eraPublishable &&
    gameCapability(config, "hasChecker") &&
    /* The rule adapter is digit-play-type shaped, so it needs an ordered digit format to compare against. A
       game without one keeps the section and its explanation and does not draw the tool. */
    profile.searchKind === "digits" &&
    era.playTypes.some((p) => era.payouts.some((r) => r.playTypeKey === p.key));
  /*
   * Whether the Buy Now entry is drawn inside JG-02.
   *
   * JG-02 itself is mandatory, so the CAPABILITY gates the commerce entry rather than the section. Before this
   * correction `hasBuyNowEntry` was read on the JG-M1 path only (`JO-02`) and ignored entirely on JG-M2, so a
   * game with commerce switched off still rendered the resolver.
   */
  const buyNowUsable = gameCapability(config, "hasBuyNowEntry");

  const alerts = alertOptionsFor(
    familyCfg.members.map((m) => m.variantLabel).filter(Boolean),
    hasMovingTopPrize(selectFormatVersion(formatVersionsFor(stateCode), familyCfg.formatGameKey, reviewDateIso)),
  );

  /*
   * The one compact source line.
   *
   * Founder direction: one source/freshness treatment near the result, the complete explanation in JG-18, and
   * no repeated "check the official site". This string is the entire freshness statement outside JG-18.
   */
  const newestReal = members
    .map((m) => m.result?.drawDateIso)
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse()[0];
  /*
   * The source label comes from the JURISDICTION's governed manifest, never from a literal.
   *
   * This read `Florida Lottery results feed`, which put a jurisdiction name in generic code and would have
   * mislabelled every other state's page.
   */
  /*
   * ---- who the results are attributed to: three sources, in order of authority ----
   *
   * CORRECTED (LRG-GAME-053). The last step used to be `` `${config.game.stateName} Lottery` ``, which
   * MANUFACTURED an operator name out of the state name. It produced "California Lottery" — which happens to be
   * correct — by a mechanism that has no way of knowing whether it is. The same template names a territory's
   * operator wrongly, and names a commission or corporation wrongly, while reading on the page as a verified
   * attribution. Attribution is exactly where a plausible guess is most damaging.
   *
   *   1. The governed manifest's verified operator name, with provenance behind it.
   *   2. A configured `trust.resultSourceLabel` — still configuration, but written and reviewed by a person for
   *      that jurisdiction rather than derived.
   *   3. Neutral LotteryCorner language, which attributes the compilation to us and claims no operator at all.
   *      This is the honest answer when nobody has verified the source's name, and it is what California gets.
   */
  /* `?? null` on both, because a gated fact whose value is absent resolves to `undefined` rather than `null` —
     and a bare `!== null` check let `undefined` through, which rendered the literal string "undefined results
     feed" on both California pages. The same undefined-versus-null slip is what broke JG-12's eligibility. */
  const verifiedOperator = (manifest ? gate(manifest.operatorName, previewEnabled).value : null) ?? null;
  const configuredLabel = config.trust.resultSourceLabel ?? null;
  const sourceAttribution =
    verifiedOperator !== null
      ? `${verifiedOperator} results feed`
      : configuredLabel !== null
        ? configuredLabel
        : "LotteryCorner results record";
  /* §A7: the shared last-updated shape. `displayDate` still renders DRAW dates elsewhere in this model. */
  const sourceLine = lastUpdatedSourceLine(newestReal ?? reviewDateIso, sourceAttribution);

  return {
    reviewDateIso,
    reviewDateSource: reviewDate.source,
    reviewBanner: REVIEW_BANNER,
    family,
    members,
    schedules,
    profile,
    formatVersion: formatVersion ?? null,
    era,
    eraPublishable,
    sourceRefs,
    matrix,
    addOnsInForce,
    history,
    historyProvenance: provenanceSummary(history),
    statistics,
    statsPreview,
    insights,
    whatChanged,
    checkerUsable,
    buyNowUsable,
    formatSummary,
    offeringFacts,
    editorial,
    alerts,
    sourceLine,
  };
}
