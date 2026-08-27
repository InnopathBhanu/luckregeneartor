/*
 * THE YEARLY ARCHIVE VIEW MODEL — LRG-ARCHIVE-054.
 *
 * Authority: blueprint §6 (the AR-01…AR-11 order), §8–§18 (per-section specifications), §19 (`YR-CURRENT`
 * behaviour), Part VI (public/signed-in/Insider boundary); content template Templates C, E, F, J;
 * brief §8 (actual content), §9 (public and account boundary), §10 (generic format contract), §12–§13.
 *
 * ══ THIS IS THE ONLY PLACE THAT DECIDES WHICH ARCHIVE SECTIONS RENDER ══
 *
 * Components receive a resolved model and draw it. The same discipline the Game Page follows, for the same
 * reason: a section that decides its own visibility inside JSX cannot be tested without rendering, and two
 * sections that each decide can disagree about the same fact.
 *
 * ══ HOW IT STAYS GENERIC ══
 *
 * Nothing here reads a game slug to decide behaviour. Every presentation decision comes from one of three
 * declared sources:
 *
 *   1. **The format profile** — how many values, from what range, ordered or not, repeats or not, which special
 *      groups exist, which tools the shape can support.
 *   2. **The family configuration** — which members exist, their labels and their `displayOrder`.
 *   3. **The game configuration** — capabilities, copy and the editorial inventory.
 *
 * `formatGameKey` and `familyId` are DATA read from `config/states/{code}.json`, not identifiers this module
 * knows. The generalization tests build models for a single-value five-variant family and an unordered pool with
 * a special ball through this same function, with no branch added for either.
 *
 * ══ WHAT IS DELIBERATELY ABSENT ══
 *
 * No jackpot metrics: this family has no jackpot, and blueprint §9's jackpot card set is for Structure A.
 * No prize or payout figures on a row: the brief's row template makes top prize conditional on complete data,
 * and no historical prize data exists here. No export: rights are unapproved (blueprint §17, brief §2). No
 * community items: fabricating a discussion is forbidden and none exist. Each absence is stated in the model as
 * a reason rather than left as a blank space.
 */

import { stateViewConfigFor } from "../state/stateViewConfigRegistry";
import { drawEventsFor, type StateDrawEvent } from "../state/stateDrawEvents";
import { formatVersionsFor } from "../state/stateFormatRegistry";
import { selectFormatVersion } from "../state/resultFormatContract";
import { formatProfile } from "../game/gameFormatProfile";
import { stateManifestFor } from "../state/stateContentManifests";
import { gate } from "../state/publicationGate";
import { gameCapability, type GameViewConfig } from "../game/gameViewConfig";
import { ruleErasFor } from "../game/gameRuleProvider";
import { currentRuleEra, eraPublishableAsCurrent, selectRuleEra } from "../game/gameRuleContract";
import {
  STATISTICS_NEUTRALITY, consecutiveSummary, historicalGaps, positionFrequency, shapeDistribution,
  sumDistribution, pairFrequency, repeatFromPrevious, type DrawRecord,
} from "../game/digitHistoryAnalysis";
import { editorialSections } from "../game/gameEditorial";
import { communityDiscussionsFor } from "../community/communityDiscussionSource";
import type {
  ArchiveAnalysisView, ArchiveBrief, ArchiveCoverage, ArchiveDrawRow, ArchiveEditorialGroup,
  ArchiveMetric, ArchiveSectionId, ArchiveSectionState, ArchiveTool, ArchiveViewModel, CompletenessState,
} from "./archiveContract";
import { AR_ORDER, isGenuineCorrection } from "./archiveContract";
import { archiveYearNavigation } from "./archiveRegistry";
import { archiveAdProfileFor } from "./archiveAdProfile";
import { archiveMetrics, metricCapabilities, notableDraws } from "./archiveMetrics";
import { ARCHIVE_PREVIEW_BANNER, buildArchiveReviewRows } from "./archiveReviewFixture";
import { archiveDisplayDate, monthKeyOf, monthLabel, resolveArchiveYear } from "./archiveYear";
import { askArchive } from "./archiveAsk";
import { lastUpdatedSourceLine } from "../text/lastUpdated";
import { CLAIM_LABEL, GAP_MYTH_EXPLANATION, gapContext } from "../ai/drawInsights";
import { assessCoverage, combineSchedules, parseDrawDays } from "./archiveSchedule";

/* ------------------------------------------------------------------ helpers */

/** Archive rows as the shape the existing deterministic statistics already speak. No values are reordered. */
function asDrawRecords(rows: readonly ArchiveDrawRow[]): DrawRecord[] {
  return rows.map((r) => ({
    gameId: r.gameId,
    variantLabel: r.variantLabel,
    drawDateIso: r.drawDateIso,
    digits: r.mainValues,
    extras: r.groups.filter((g) => g.role !== "main").map((g) => ({ label: g.label ?? g.key, values: g.values })),
    fireball: r.addOnValue,
    status: r.status,
    corrected: r.corrected,
  }));
}

/* ------------------------------------------------------------------ build */

export interface BuildArchiveOptions {
  /** The question the server-rendered public Ask answer is built from. */
  askQuestion?: string;
}

/**
 * Build the archive model, or `null` when this pair and year are not a governed archive page.
 *
 * `previewEnabled` is passed in from the route boundary, so this module never reads the environment and stays
 * pure and testable — the discipline the State and Game models both follow.
 */
export function buildArchiveModel(
  stateCode: string,
  gameSlug: string,
  year: number,
  config: GameViewConfig,
  previewEnabled: boolean,
  opts: BuildArchiveOptions = {},
): ArchiveViewModel | null {
  const resolved = resolveArchiveYear(stateCode, year);
  if (!resolved) return null;

  const familyId = config.game.familyId ?? gameSlug;
  const stateCfg = stateViewConfigFor(stateCode);
  const familyCfg = stateCfg?.presentation.families.find((f) => f.familyId === familyId);
  if (!familyCfg) return null;

  const manifest = stateManifestFor(stateCode);
  const stateName = manifest?.canonicalName.value ?? config.game.stateName;
  const gameLabel = config.game.gameLabel;

  /* ---- the format, selected by DRAW date within this archive year ---- */
  /*
   * The date-effective selection uses a date INSIDE the archive year, not the review date. A 2021 archive must
   * resolve the format that applied in 2021 even when read in 2026 — which is what makes rule-era changes
   * within an archive year expressible at all (brief §10). For the current year the review date is inside the
   * year, so the two coincide; for a closed year they must not.
   */
  const formatDate = resolved.mode === "YR-CURRENT" ? resolved.reviewDateIso : `${year}-12-31`;
  const formatVersion = selectFormatVersion(formatVersionsFor(stateCode), familyCfg.formatGameKey, formatDate);
  if (!formatVersion) return null;
  const profile = formatProfile(formatVersion);
  if (!profile.main) return null;

  /* ---- the rule era in force in this archive year ---- */
  const ruleKey = config.game.ruleGameKey ?? gameSlug;
  const eras = ruleErasFor(stateCode);
  const ruleEra = selectRuleEra(eras, ruleKey, formatDate) ?? currentRuleEra(eras, ruleKey);
  const eraPublishable = eraPublishableAsCurrent(ruleEra);
  /*
   * The era label is COMPOSED from the era's own fields, never read off a `label` property — `GameRuleEra` has
   * none, deliberately: a rule era is identified by its id and its effective range, and inventing a display
   * name for it here would be a second, unverified description of a governed record.
   */
  const ruleEraLabel = ruleEra && eraPublishable
    ? ruleEra.effectiveTo
      ? `${ruleEra.eraId} (${ruleEra.effectiveFrom} to ${ruleEra.effectiveTo})`
      : `${ruleEra.eraId} (in force since ${ruleEra.effectiveFrom})`
    : formatVersion.effectiveFrom
      ? `Result format effective from ${formatVersion.effectiveFrom}`
      : "Current result format";

  /* ---- members, in the family's own configured order ---- */
  const members = [...familyCfg.members]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => ({ gameId: m.gameId, variantLabel: m.variantLabel, memberOrder: m.displayOrder }));

  /* ---- rows ---- */
  const fixture = buildArchiveReviewRows(
    previewEnabled, stateCode, familyId, year, resolved.validMonths, members, profile, resolved.reviewDateIso,
  );
  const rows = fixture.rows;
  const memberViews = members.map((m) => ({
    ...m,
    drawCount: rows.filter((r) => r.gameId === m.gameId).length,
  }));

  /* ---- months ---- */
  const eraStartsIn = new Set<string>();
  if (ruleEra?.effectiveFrom && ruleEra.effectiveFrom.slice(0, 4) === String(year)) {
    eraStartsIn.add(ruleEra.effectiveFrom.slice(0, 7));
  }
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthKey = monthKeyOf(year, month);
    const inYear = rows.filter((r) => r.monthKey === monthKey);
    return {
      month,
      label: monthLabel(month),
      monthKey,
      drawCount: inYear.length,
      valid: month <= resolved.validMonths,
      /*
       * Only when a month contains a GENUINE sourced correction.
       *
       * `r.corrected` alone lit the ⚑ marker and its legend from a fixture row, which put "⚑ marks a month with a
       * corrected result" on a page whose only corrected row was a demonstration.
       */
      hasCorrection: inYear.some((r) => isGenuineCorrection(r.correction)),
      /* Only from governed rule data. Never guessed from a gap in the rows. */
      hasRuleChange: eraStartsIn.has(monthKey),
    };
  });
  const validMonths = months.filter((m) => m.valid);
  /* Blueprint §19: the latest valid month is open by default for a current year. */
  const defaultMonthKey = validMonths.length > 0 ? validMonths[validMonths.length - 1].monthKey : null;

  /* ---- metrics, analysis and notability ---- */
  const caps = metricCapabilities(profile, members.length);
  /*
   * ---- two summaries, at two depths ----
   *
   * `summaryMetrics` is the concise set above the results: total drawings, one count per drawing variant, and the
   * covered date range. Founder direction: *"Replace the current large collection of metric cards with a concise
   * summary or at most a small number of genuinely useful metrics"*, and *"Do not show verification or correction
   * metrics."*
   *
   * `metrics` is the fuller set, rendered BELOW the results where a longer read is welcome. `archiveMetrics` is
   * unchanged and still tested — nothing was deleted, it moved.
   */
  const metrics = archiveMetrics(rows, profile, members, year, resolved.mode === "YR-CURRENT");
  const summaryMetrics = conciseSummary(rows, members, year);
  const analysis = buildAnalysis(rows, profile, memberViews, year, caps);
  const notable = notableDraws(rows, profile);

  /* ---- the AI brief ---- */
  const brief = buildBrief(rows, profile, memberViews, year, resolved.mode, notable, caps);

  /* ---- coverage and trust ---- */
  const coverage = buildCoverage(rows, fixture.provenance, profile, resolved.reviewDateIso, config, manifest, previewEnabled);

  /* ---- source line: one compact statement, the full explanation in AR-10 ---- */
  const verifiedOperator = (manifest ? gate(manifest.operatorName, previewEnabled).value : null) ?? null;
  const sourceLabel = verifiedOperator !== null
    ? `${verifiedOperator} results feed`
    : config.trust.resultSourceLabel ?? "LotteryCorner results record";
  const newestReal = rows.find((r) => r.provenance === "productionFeed")?.drawDateIso ?? null;
  /* §A7: one shared shape for the last-updated stamp. `archiveDisplayDate` still renders DRAW dates in the
     result table — a compact repeated table value is a different job from one prose sentence about our own
     publication, and collapsing the two would make the table worse. */
  const sourceLine = lastUpdatedSourceLine(newestReal ?? resolved.reviewDateIso, sourceLabel);

  /* ---- the one complete public Ask answer, server-rendered ---- */
  const askPrompts = buildAskPrompts(profile, memberViews, rows);
  const askQuestion = opts.askQuestion ?? askPrompts[0] ?? "";
  const askAnswer = askArchive(askQuestion, rows, profile, memberViews, year, `${stateName} ${gameLabel}`);

  /* ---- editorial ---- */
  const editorial = buildEditorial(config, stateCode, familyId);

  /* ---- tools and next actions ---- */
  const gameHref = `/${stateCode}/${gameSlug}`;
  const tools = buildTools(profile, caps, gameHref, config);
  const nextActions = buildNextActions(gameHref, gameLabel, resolved.mode, config);

  /* ---- copy ---- */
  const dates = rows.map((r) => r.drawDateIso).sort();
  const firstDraw = dates[0] ?? null;
  const latestDraw = dates[dates.length - 1] ?? null;
  const variantPhrase = members.filter((m) => m.variantLabel).map((m) => m.variantLabel).join(" and ");
  const h1 = resolved.mode === "YR-CURRENT"
    ? `${stateName} ${gameLabel} Results ${year} — Year to Date`
    : `${stateName} ${gameLabel} Results Archive — ${year}`;
  const supportingCopy = variantPhrase
    ? `Browse ${stateName} ${gameLabel} ${variantPhrase} results for ${year}, search the year and explore transparent historical statistics.`
    : `Browse ${stateName} ${gameLabel} results for ${year}, search the year and explore transparent historical statistics.`;
  const statusLine = [
    `${rows.length} drawing${rows.length === 1 ? "" : "s"}`
      + (firstDraw && latestDraw ? ` from ${archiveDisplayDate(firstDraw)} through ${archiveDisplayDate(latestDraw)}` : ""),
    variantPhrase || "One drawing per day",
    coverage.completeness === "COMPLETE" ? "Complete" : completenessWord(coverage.completeness),
  ].join(" · ");

  /*
   * ---- the registered schedule, and whether the archive lives up to it ----
   *
   * Parsed from each member's own `drawDays` and unioned, so the family's schedule is the operator's statement
   * rather than an assumption. Pick 3 registers "Daily" for both members, which is precisely what makes 160
   * previously-"No drawing" calendar cells provably wrong: a daily game has no days off.
   */
  const familyEvents = drawEventsFor(stateCode);
  const schedule = combineSchedules(
    members.map((mem) => parseDrawDays(
      familyEvents.find((e: StateDrawEvent) => e.gameId === mem.gameId)?.drawDays,
    )),
  );
  const scheduleCoverage = assessCoverage(rows.map((r) => r.drawDateIso), firstDraw, latestDraw, schedule);

  /*
   * ---- year navigation, from the REGISTRY ----
   *
   * Was derived from whether the fixture produced rows, which could only ever answer "this year". It now comes
   * from `archiveYearNavigation`, so Older and Newer mean *the nearest registered year* in that direction — never
   * `year ± 1`, which would link to a year that does not exist. With one year registered both directions are
   * boundaries and the component renders an honest disabled state.
   */
  const yearNav = archiveYearNavigation(stateCode, gameSlug, year);
  const availableYears = [...yearNav.years].sort((a, b) => a - b);
  const previousYear = yearNav.older;
  const nextYear = yearNav.newer;

  /* ---- section decisions ---- */
  const sectionState = {} as Record<ArchiveSectionId, ArchiveSectionState>;
  const set = (id: ArchiveSectionId, ok: boolean, reason: string) => {
    sectionState[id] = ok ? { render: true } : { render: false, reason };
  };

  /*
   * ---- advertisement anchors: IN the sequence, resolving to nothing ---- §A4
   *
   * They were absent from the render order entirely. Now they are governed positions that resolve to a typed-empty
   * profile, which is the pattern the Game Page and the flagship hubs already use. Each is `render: false` with the
   * profile's own recorded gap as the reason, so:
   *
   *   - nothing is drawn, no geometry is reserved and no placeholder or review note reaches the page — the V0's
   *     visible "Not rendered in this review" block naming `AD-AR00`…`AD-AR03` and `lc_gh_*` stays gone;
   *   - the position survives in the sequence the composition actually walks, not only in a documentation array;
   *   - the reason travels in `model.suppressed`, so an ad-operations audit can read the gap off the model.
   *
   * `CLAUDE.md` §12: no slot is removed, merged, renamed, moved, reduced, reordered or repurposed, and no ad is
   * activated.
   */
  const ads = archiveAdProfileFor(stateCode, gameSlug);
  for (const anchor of ads.anchors) set(anchor, false, ads.gap);

  set("AR-01", true, "");
  set("AR-02", metrics.length > 0, "No metric is supported by this format and coverage profile.");
  set("AR-03", brief !== null, "The year brief needs at least one deterministic observation.");
  set("AR-04", validMonths.length > 0, "No month in this archive year can contain a drawing.");
  set("AR-05", rows.length > 0, "No drawing is recorded for this game in this archive year.");
  set("AR-06", rows.length > 0 && profile.supports.numberSearch,
    rows.length === 0
      ? "Search needs at least one recorded drawing."
      : "This game's result format cannot express a number search.");
  set("AR-07", analysis.length > 0, "No analysis view is supported by this format.");
  set("AR-08", tools.length > 0,
    "Reserved for personal archive tools. They need an account, and no account service exists yet.");
  set("AR-09", editorial.length > 0, "No editorial inventory is configured for this game.");
  set("AR-10", true, "");
  set("AR-11", nextActions.length > 0, "No continuation action is available.");
  set("Footer", true, "");

  const suppressed = AR_ORDER
    .map((id) => ({ id, s: sectionState[id] }))
    .filter((x): x is { id: ArchiveSectionId; s: { render: false; reason: string } } => x.s?.render === false)
    .map((x) => ({ id: x.id, reason: x.s.reason }));

  return {
    stateCode, stateName, gameSlug, gameLabel, familyId,
    visualIdentity: config.game.visualIdentity ?? null,
    archiveYear: year,
    mode: resolved.mode,
    reviewDateIso: resolved.reviewDateIso,
    previewBanner: ARCHIVE_PREVIEW_BANNER,
    availableYears, previousYear, nextYear,
    earliestYear: availableYears[0] ?? null,
    gameHref,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: stateName, href: `/${stateCode}` },
      { label: gameLabel, href: gameHref },
      { label: `${year} Results`, href: null },
    ],
    h1, supportingCopy, statusLine,
    members: memberViews,
    rows, months, defaultMonthKey,
    coveredFromIso: firstDraw,
    coveredToIso: latestDraw,
    schedule,
    scheduleCoverage,
    metrics, summaryMetrics, yearNav, brief, analysis, notable, tools, editorial, coverage,
    askAnswer, askPrompts, nextActions,
    profile, ruleEra, ruleEraLabel, sourceLine,
    /** True only when at least one row carries a publishable, sourced correction. Gates every correction control. */
    hasPublishedCorrection: rows.some((r) => isGenuineCorrection(r.correction)),
    order: AR_ORDER,
    sectionState,
    suppressed,
    ads,
    neutrality: STATISTICS_NEUTRALITY,
  };
}

function completenessWord(state: CompletenessState): string {
  switch (state) {
    case "PARTIAL": return "Partial coverage";
    case "UNDER_REVIEW": return "Under review";
    case "CORRECTED": return "Includes a corrected drawing";
    default: return "Complete";
  }
}

/* ------------------------------------------------------------------ the concise summary */

/**
 * The short summary that sits above the results.
 *
 * Four facts at most, all of them things a reader of a lottery archive actually wants before they scroll: how many
 * drawings, how many of each drawing type, and what dates are covered. No verification state, no correction count,
 * no coverage enum — those were the figures that made the page read as a validation report.
 *
 * Variant counts come from the family's configured order, so a five-draw game lists five in its own order and a
 * single-member game gets no variant rows at all.
 */
function conciseSummary(
  rows: readonly ArchiveDrawRow[],
  members: readonly { gameId: number; variantLabel: string; memberOrder: number }[],
  year: number,
): ArchiveMetric[] {
  const dates = rows.map((r) => r.drawDateIso).sort();
  const range = dates.length > 0
    ? `${archiveDisplayDate(dates[0])} – ${archiveDisplayDate(dates[dates.length - 1])}`
    : `No drawings recorded in ${year}`;

  const out: ArchiveMetric[] = [{
    key: "summary-total",
    label: "Total drawings",
    value: String(rows.length),
    range,
    evidenceHref: null,
    note: null,
  }];

  for (const m of [...members].sort((a, b) => a.memberOrder - b.memberOrder)) {
    if (!m.variantLabel) continue;
    out.push({
      key: `summary-${m.gameId}`,
      label: m.variantLabel,
      value: String(rows.filter((r) => r.gameId === m.gameId).length),
      range,
      evidenceHref: null,
      note: null,
    });
  }

  out.push({
    key: "summary-range",
    label: "Dates covered",
    value: range,
    range,
    evidenceHref: null,
    note: null,
  });

  return out;
}

/* ------------------------------------------------------------------ AR-07 analysis */

/**
 * The public analysis selection, each view gated by the format property it needs.
 *
 * Blueprint §14 allows three to six views; the brief names six for an ordered digit game. A view whose
 * precondition fails is absent, not empty — a "position frequency" table for a game with one drawn value would
 * be a single column labelled as a distribution.
 */
function buildAnalysis(
  rows: readonly ArchiveDrawRow[],
  profile: ReturnType<typeof formatProfile>,
  members: readonly { gameId: number; variantLabel: string; memberOrder: number; drawCount: number }[],
  year: number,
  caps: ReturnType<typeof metricCapabilities>,
): ArchiveAnalysisView[] {
  const out: ArchiveAnalysisView[] = [];
  if (rows.length === 0 || !profile.main) return out;
  const main = profile.main;
  const records = asDrawRecords(rows);
  const period = `${year} archive`;
  const variants = members.filter((m) => m.variantLabel).map((m) => m.variantLabel).join(" and ") || "All drawings";

  if (caps.positional) {
    /*
     * ONE combined frequency view, not one table per position.
     *
     * Three separate position tables were all marked primary, so "four primary insights" rendered as six tables —
     * the overload the founder direction targets. Combined, digits are rows and positions are columns, which is
     * also the comparison a reader actually wants: "how often was 7 first versus third", answerable by reading
     * across a row instead of flipping between tables.
     *
     * `rows` here carries one entry per digit with a per-position breakdown encoded in the label, so the shared
     * `AnalysisView` renderer needs no special case.
     */
    const positions = positionFrequency(records, main.count, main.min, main.max);
    const digits: number[] = [];
    for (let d = main.min; d <= main.max; d++) digits.push(d);
    out.push({
      key: "number-frequency",
      title: "Number frequency by position",
      primary: true,
      period, variants, drawCount: rows.length,
      method: `How often each value was drawn in each of the ${main.count} positions.`,
      rows: digits.map((d) => {
        const perPosition = positions.map((pf) => pf.counts[d] ?? 0);
        const total = perPosition.reduce((a, b) => a + b, 0);
        return {
          label: String(d),
          value: perPosition.join(" · "),
          count: total,
          of: rows.length * main.count,
        };
      }),
    });
  }

  if (caps.multiVariant) {
    out.push({
      key: "variant-comparison",
      title: "Drawing comparison",
      primary: true,
      period, variants, drawCount: rows.length,
      method: "Each drawing's own rows counted separately. Listed in this game's configured order.",
      /* Ordered by the family's `memberOrder`, NOT by game id and never alphabetically — the acceptance
         criterion requires variant ordering to come from governed configuration. */
      rows: [...members].sort((a, b) => a.memberOrder - b.memberOrder).map((m) => ({
        label: m.variantLabel || "All drawings",
        value: `${m.drawCount} drawings`,
        count: m.drawCount,
        of: rows.length,
      })),
    });
  }

  if (caps.repeats) {
    const shape = shapeDistribution(records);
    out.push({
      key: "shape-distribution",
      title: "Repeated digits",
      primary: true,
      period, variants, drawCount: shape.total,
      method: "Every drawn value different, exactly two the same, or all the same.",
      rows: [
        { label: "All different", value: `${shape.allDifferent}`, count: shape.allDifferent, of: shape.total },
        { label: "Contains a double", value: `${shape.onePair}`, count: shape.onePair, of: shape.total },
        { label: "Every value the same", value: `${shape.triple}`, count: shape.triple, of: shape.total },
      ],
    });
  }

  if (caps.multiValue) {
    const sums = sumDistribution(records, main.count, main.max);
    out.push({
      key: "sum-distribution",
      title: "Sum distribution",
      primary: true,
      period, variants, drawCount: rows.length,
      method: "Total of the drawn values, grouped into fixed bands so the scale is stable across filters.",
      rows: sums.buckets.map((b) => ({ label: b.label, value: `${b.count}`, count: b.count, of: rows.length })),
    });

    if (caps.positional && main.count >= 2) {
      for (const kind of ["front", "back"] as const) {
        const pf = pairFrequency(records, kind, 5);
        out.push({
          key: `pair-${kind}`,
          title: `${kind === "front" ? "Front" : "Back"} pair frequency`,
          /* Genuinely useful, genuinely secondary. Disclosed on request rather than removed. */
          primary: false,
          period, variants, drawCount: rows.length,
          method: `The ${kind === "front" ? "first two" : "last two"} drawn values, in drawn order. Most frequent shown.`,
          rows: pf.top.map((p) => ({
            label: p.pair.split("-").join(" · "), value: `${p.count}`, count: p.count, of: rows.length,
          })),
        });
      }
    }

    /*
     * ---- consecutive-digit patterns ----
     *
     * `consecutiveSummary` has been computed and tested since LRG-GAME-050 and was never surfaced. It answers
     * "how often were two drawn values adjacent in value" — a description of the past window, phrased so it cannot
     * be read as a tendency.
     */
    const consec = consecutiveSummary(records);
    if (consec.total > 0) {
      out.push({
        key: "consecutive",
        title: "Drawings containing two adjacent values",
        primary: false,
        period, variants, drawCount: consec.total,
        method: "Two of the drawn values differ by one, in any position. A description of this period only.",
        rows: [
          {
            label: "Contains two adjacent values",
            value: `${consec.drawsWithConsecutive}`,
            count: consec.drawsWithConsecutive,
            of: consec.total,
          },
          {
            label: "No two values adjacent",
            value: `${consec.total - consec.drawsWithConsecutive}`,
            count: consec.total - consec.drawsWithConsecutive,
            of: consec.total,
          },
        ],
      });
    }

    /*
     * ---- monthly comparison ----
     *
     * Draw counts per month, which is the honest month-over-month view. Deliberately NOT a "which month runs hot"
     * framing: a month with more drawings has more draw days, nothing more.
     */
    const byMonthKey = new Map<string, number>();
    for (const r of rows) byMonthKey.set(r.monthKey, (byMonthKey.get(r.monthKey) ?? 0) + 1);
    if (byMonthKey.size > 1) {
      out.push({
        key: "monthly-comparison",
        title: "Drawings by month",
        primary: false,
        period, variants, drawCount: rows.length,
        method: "How many drawings each month of this archive year holds.",
        rows: [...byMonthKey.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => ({
          label: monthLabel(Number(k.slice(5, 7))),
          value: `${n}`,
          count: n,
          of: rows.length,
        })),
      });
    }

    /*
     * ---- historical appearance gaps ----
     *
     * The most language-sensitive view on the page. `HistoricalGap` itself carries a comment recording that the
     * field is deliberately not named `overdue`, and BP-04B §22 forbids that framing; `assertNeutralLanguage` fails
     * the build on `due`, `overdue`, `hot`, `cold` and `predict`.
     *
     * So the title states the measurement — "drawings since a value last appeared" — and the method line says
     * outright that it describes the past. A gap is a fact about history and carries no information about the next
     * drawing, which is a fair independent event.
     */
    if (main.max - main.min + 1 <= 40) {
      const gaps = historicalGaps(records, main.min, main.max);
      if (gaps.length > 0) {
        out.push({
          key: "historical-gaps",
          title: "Drawings since each value last appeared",
          primary: false,
          period, variants, drawCount: rows.length,
          method:
            "Counted back from the most recent drawing in this period. This describes what has already happened "
            + "and says nothing about which values will be drawn next.",
          rows: gaps.map((g) => ({
            label: String(g.digit),
            value: g.drawsSinceLastSeen === null
              ? "not in this period"
              : `${g.drawsSinceLastSeen} drawing${g.drawsSinceLastSeen === 1 ? "" : "s"} ago`,
            count: g.drawsSinceLastSeen ?? 0,
            of: rows.length,
          })),
        });
      }
    }

    const rep = repeatFromPrevious(records);
    const repRows = Object.values(rep.byGameId).filter((r) => r.compared > 0);
    if (repRows.length > 0) {
      out.push({
        key: "previous-repeat",
        title: "Values shared with the previous drawing",
        primary: false,
        period, variants, drawCount: rows.length,
        method:
          "For each drawing, whether it shared at least one value with that same drawing's previous result. "
          + "A description of past sequence only.",
        rows: repRows.map((r) => ({
          label: r.variantLabel || "All drawings",
          value: `${r.shared} of ${r.compared}`,
          count: r.shared,
          of: r.compared,
        })),
      });
    }
  }

  return out;
}

/* ------------------------------------------------------------------ AR-03 brief */

/**
 * Three to five deterministic observations, each carrying its figure and an evidence link.
 *
 * Nothing is generated. Each point is a sentence around a number this module just computed, which is why the
 * `generation` line can state plainly where the figures come from.
 *
 * `DATA-DEC-001` `FD-DAT-20` settles what this is: a deterministic summary over public archive statistics, **not**
 * an AI execution. It stays public, consumes no AI allowance and writes no `FD-DAT-12` ledger entry. If this
 * function is ever replaced by a provider call, a user prompt or personalised generation, it moves behind the free
 * Account and onto the server.
 */
function buildBrief(
  rows: readonly ArchiveDrawRow[],
  profile: ReturnType<typeof formatProfile>,
  members: readonly { gameId: number; variantLabel: string; memberOrder: number; drawCount: number }[],
  year: number,
  mode: ArchiveViewModel["mode"],
  notable: readonly { reason: string; drawDateIso: string; evidenceAnchor: string; metric: string; value: string }[],
  caps: ReturnType<typeof metricCapabilities>,
): ArchiveBrief | null {
  if (rows.length === 0) return null;
  const points: ArchiveBrief["points"][number][] = [];
  const records = asDrawRecords(rows);

  if (caps.repeats) {
    const shape = shapeDistribution(records);
    points.push({
      text: `${shape.onePair + shape.triple} of ${shape.total} drawings in this archive contained a repeated value.`,
      evidence: `${shape.onePair} with a double, ${shape.triple} with every value the same`,
      evidenceHref: "#ar-07",
    });
  }

  if (caps.multiVariant) {
    const ordered = [...members].sort((a, b) => a.memberOrder - b.memberOrder);
    points.push({
      text: `${ordered.map((m) => `${m.variantLabel} recorded ${m.drawCount}`).join(" and ")} drawings, each kept as its own record.`,
      evidence: "Separate game ids, compared side by side",
      evidenceHref: "#ar-07",
    });
  }

  if (caps.repetitionReportable) {
    const keys = rows.map((r) => (profile.ordered ? r.mainValues : [...r.mainValues].sort((a, b) => a - b)).join("-"));
    const seen = new Map<string, number>();
    for (const k of keys) seen.set(k, (seen.get(k) ?? 0) + 1);
    const repeated = [...seen.values()].filter((n) => n > 1).length;
    points.push({
      text: repeated > 0
        ? `${repeated} result${repeated === 1 ? "" : "s"} occurred more than once in this archive.`
        : "No result occurred more than once in this archive.",
      evidence: `${seen.size} distinct results across ${rows.length} drawings`,
      evidenceHref: "#ar-06",
    });
  }

  /* One month-to-month observation. Descriptive comparison of two counted months, no trend claim. */
  const byMonth = new Map<string, number>();
  for (const r of rows) byMonth.set(r.monthKey, (byMonth.get(r.monthKey) ?? 0) + 1);
  if (byMonth.size >= 2) {
    const sorted = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const counts = sorted.map(([, n]) => n);
    const highest = Math.max(...counts);
    const atHighest = sorted.filter(([, n]) => n === highest);
    /*
     * A "busiest month" claim is only made when the maximum is UNIQUE.
     *
     * The first version of this sentence read "January holds the most drawings, with 8" while January through
     * June each held exactly 8 — true of January and misleading about the year, because it presented a six-way
     * tie as a distinction. A tie is now described as a tie.
     */
    points.push(
      atHighest.length === 1
        ? {
            text: `${monthLabel(Number(atHighest[0][0].slice(5, 7)))} holds the most drawings recorded in this `
              + `archive, with ${highest}.`,
            evidence: `${sorted.length} months recorded`,
            evidenceHref: "#ar-04",
          }
        : {
            text: `Recorded drawings are spread evenly across the year: ${atHighest.length} of ${sorted.length} `
              + `months each hold ${highest}.`,
            evidence: `${sorted.length} months recorded, ${Math.min(...counts)} to ${highest} per month`,
            evidenceHref: "#ar-04",
          },
    );
  }

  /*
   * ══ §C5 — MOST-DRAWN VALUES AND THE LONGEST GAPS ══
   *
   * WHY THIS SECTION IS THE ONE WORTH ENRICHING. The yearly archive is roughly 8,700 indexed URLs — by far the
   * largest surface on the site, and the one an answer engine is most likely to quote. Before this, AR-03 could
   * describe repeats, variant counts, month distribution and one notable drawing; it could not answer the two
   * questions a reader of a year of results actually arrives with: *which numbers came up most*, and *which have
   * not come up for the longest*.
   *
   * ARITHMETIC OVER THE ROWS ON THIS PAGE, AND NOTHING ELSE. Both points count the drawings listed above them. No
   * external period is introduced, no other year is consulted, and nothing is modelled or weighted — which is why
   * the evidence link goes to the statistics section a reader can check it against.
   *
   * LABELLED PER THE CONSTITUTION'S TAXONOMY. Each carries `CLAIM_LABEL.historicalObservation` — *"statistically
   * true historical observation"* — because that is precisely what it is: true about the past, and silent about
   * the future. `FD-DAT-20` also applies: there is no model, so neither point is labelled AI in either direction.
   *
   * THE GAP POINT CARRIES ITS SCALE AND THE MYTH. `gapContext` states the current gap, the typical gap and the
   * longest observed gap in one sentence, and `GAP_MYTH_EXPLANATION` follows it — because BP-05C §13 lists the
   * overdue-number explanation as a REQUIRED part of gap context, and a bare "has not appeared for 41 drawings" is
   * the exact input a reader converts into "so it is due".
   */
  const mainValues = profile.main
    ? (() => {
        const counts = new Map<number, number>();
        for (const r of rows) for (const v of r.mainValues) counts.set(v, (counts.get(v) ?? 0) + 1);
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      })()
    : [];

  if (mainValues.length > 0) {
    const top = mainValues[0][1];
    const atTop = mainValues.filter(([, n]) => n === top).map(([v]) => v);
    /*
     * A "most drawn" claim is only made when the maximum is UNIQUE — the same discipline the month point above
     * already applies. Presenting a five-way tie as a distinction is the defect that correction fixed, and a small
     * archive year ties constantly.
     */
    points.push({
      text: atTop.length === 1
        ? `${atTop[0]} was drawn most often in this archive, ${top} times. ${CLAIM_LABEL.historicalObservation} `
          + "about drawings that have already happened — it does not make it more likely next time."
        : `${atTop.length} values share the highest count in this archive, each drawn ${top} times `
          + `(${atTop.slice(0, 6).join(", ")}${atTop.length > 6 ? " and others" : ""}). `
          + `${CLAIM_LABEL.historicalObservation}.`,
      evidence: `Counted from the ${rows.length} drawings on this page`,
      evidenceHref: "#ar-07",
    });

    /*
     * THE LONGEST CURRENT GAP. Newest first, so an index IS a gap — the convention `historicalGaps` uses.
     * A value never drawn in the year has no gap to describe, so it is excluded rather than reported as infinite.
     */
    const newestFirst = [...rows]
      .sort((a, b) => b.drawDateIso.localeCompare(a.drawDateIso))
      .map((r) => ({ values: r.mainValues }));
    const gaps = mainValues
      .map(([v]) => gapContext(v, newestFirst))
      .filter((g) => g.currentGap !== null && g.medianGap !== null)
      .sort((a, b) => (b.currentGap ?? 0) - (a.currentGap ?? 0));
    const widest = gaps[0];
    if (widest) {
      points.push({
        text: `${widest.description} ${GAP_MYTH_EXPLANATION}`,
        evidence: `${CLAIM_LABEL.historicalObservation} · typical gap ${widest.medianGap}, longest `
          + `${widest.longestGap}`,
        evidenceHref: "#ar-07",
      });
    }
  }

  /* One notable draw, linked to its row. */
  const first = notable[0];
  if (first) {
    points.push({
      text: `The ${archiveDisplayDate(first.drawDateIso)} drawing stands out: ${first.reason.toLowerCase()}`,
      evidence: `${first.metric}: ${first.value}`,
      evidenceHref: `#${first.evidenceAnchor}`,
    });
  }

  if (points.length === 0) return null;

  return {
    heading: mode === "YR-CURRENT"
      ? `What has defined this archive in ${year} so far?`
      : `What defined this archive in ${year}?`,
    label: mode === "YR-CURRENT" ? "LotteryCorner Year-to-Date Brief" : "LotteryCorner Historical Brief",
    points: points.slice(0, 5),
    evidenceLine: `Based on ${rows.length} drawings in this archive and the data-coverage profile below.`,
    /*
     * The provenance requirement, as reader-facing copy.
     *
     * `DATA-DEC-001` `FD-DAT-20` forbids describing this surface's deterministic generation as AI — including by
     * disclaiming AI, which only raises the idea. The V0 string ended "No live AI model generated or verified
     * these observations"; that sentence is now both unnecessary and prohibited, because nothing here claims a
     * model. What survives is the positive statement: where the observations come from.
     */
    generation:
      "Calculated from the drawings listed on this page. Every figure is counted from the results in this "
      + "archive.",
  };
}

/* ------------------------------------------------------------------ AR-10 coverage */

function buildCoverage(
  rows: readonly ArchiveDrawRow[],
  provenance: { productionFeed: number; synthetic: number; total: number },
  profile: ReturnType<typeof formatProfile>,
  reviewDateIso: string,
  config: GameViewConfig,
  manifest: ReturnType<typeof stateManifestFor>,
  previewEnabled: boolean,
): ArchiveCoverage {
  /*
   * ══ `CORRECTED` REQUIRES A GENUINE, SOURCED CORRECTION ══
   *
   * It used to be `rows.some((r) => r.corrected)` — a flag on a fixture row — which promoted the whole archive to
   * a corrected state and drove a public correction notice. The gate is now `isGenuineCorrection`: previous value,
   * corrected value, source and date, all present. A fixture record has no source, so it cannot reach this state.
   *
   * PARTIAL remains the honest answer while most rows are review samples; claiming COMPLETE would be the
   * synthetic-as-fact failure `CLAUDE.md` §14 forbids.
   */
  const publishableCorrections = rows.filter((r) => isGenuineCorrection(r.correction));
  const completeness: CompletenessState = publishableCorrections.length > 0
    ? "CORRECTED"
    : provenance.synthetic > 0
      ? "PARTIAL"
      : "COMPLETE";

  const addOn = profile.groups.find((g) => g.role === "addOn");
  const addOnRows = addOn ? rows.filter((r) => r.addOnValue !== null).length : 0;

  const verifiedOperator = (manifest ? gate(manifest.operatorName, previewEnabled).value : null) ?? null;
  const sourceLabel = verifiedOperator !== null
    ? `${verifiedOperator} results feed`
    : config.trust.resultSourceLabel ?? "LotteryCorner results record";

  const fields = [
    {
      field: "Winning numbers",
      coverage: `${provenance.total} drawings listed for this year`,
      supportsMetrics: true,
    },
    ...(addOn
      ? [{
          field: addOn.label ?? "Add-on",
          coverage: `${addOnRows} of ${provenance.total} drawings carry a value`,
          /* Partial add-on coverage is exactly why no metric is derived from it. Stated, not hidden. */
          supportsMetrics: false,
        }]
      : []),
    {
      field: "Corrections",
      coverage: publishableCorrections.length > 0
        ? `${publishableCorrections.length} drawing${publishableCorrections.length === 1 ? "" : "s"} in this year `
          + "has a published correction, shown with its source"
        : "No published correction affects this year",
      supportsMetrics: true,
    },
    {
      field: "Game rules for this year",
      /* "Governed rule data" is internal vocabulary. A reader wants to know a rule set applies, not what the
         repository calls the module it came from. */
      coverage: "The rules in force during the selected year",
      supportsMetrics: true,
    },
    {
      field: "Prize amounts",
      /* No historical prize data exists, so no financial figure and no backtest appears anywhere on the page —
         blueprint acceptance criterion 11. */
      coverage: "Not connected. No prize or payout figure is shown for a historical drawing.",
      supportsMetrics: false,
    },
  ];

  return {
    completeness,
    statement: completeness === "PARTIAL" || completeness === "CORRECTED"
      ? "This year's results are not complete yet. LotteryCorner leaves out any figure the underlying data cannot "
        + "support, and shows no prize or payout amount for a past drawing."
      : "The winning-number history for this year is complete.",
    fields,
    lastUpdatedIso: reviewDateIso,
    sourceLabel,
    /*
     * RESTORED under `FD-DAT-16`'s own condition — "restore those visible controls when the real shared
     * Account and sign-in continuation flow works end to end" — which Conflict 37 (2026-08-11) satisfied.
     * CSV export exists again as a signed-in action (`FD-DAT-01`), free (`FD-DAT-06`). What is still true
     * and still stated: no bulk file and no API access is published (`FD-DAT-14`), and the server-side
     * limits (`FD-DAT-07`/`FD-DAT-10`/`FD-DAT-13`) are API-phase work — see `EXPORT_LIMIT_CONTRACT`.
     */
    exportStatus: {
      available: true,
      statement:
        "Signed-in members can download this year's results as a CSV file, free, from the results list. "
        + "No bulk file and no API access is published, and the file is for personal use with its source "
        + "and coverage stated inside it.",
    },
  };
}

/* ------------------------------------------------------------------ AR-08 tools */

function buildTools(
  profile: ReturnType<typeof formatProfile>,
  caps: ReturnType<typeof metricCapabilities>,
  gameHref: string,
  config: GameViewConfig,
): ArchiveTool[] {
  /*
   * ══ AR-08 IS RESERVED, AND THEREFORE EMPTY (`ACCT-DEC-001` `FD-ACC-08`) ══
   *
   * It previously listed three "public tools" — check a number, check a ticket, number statistics — but two were
   * anchors to AR-06 and AR-07 *on the same page* and the third was a link to the game page. A section whose entire
   * content is links to its own neighbours is navigation furniture, and the founder correction pass removed exactly
   * this kind of redundancy elsewhere.
   *
   * `FD-ACC-08` reserves AR-08 as the future **Personal Archive Tools** slot. Its real content — follow, save a
   * number set, save a search, save an answer — is gated by `FD-ACC-06` on an account foundation that does not
   * exist, and `FD-ACC-07` requires the absent capability to be genuinely absent rather than shown as something
   * else.
   *
   * So the section id stays in the taxonomy, resolves to `render: false` with a recorded reason, and this function
   * is retained as the obvious place for the eventual signed-in actions. The parameters stay for the same reason:
   * whether a tool applies will depend on the format and the configuration, exactly as they did.
   */
  void profile; void caps; void gameHref; void config;
  return [];
}

/* ------------------------------------------------------------------ AR-09 editorial */

function buildEditorial(config: GameViewConfig, stateCode: string, familyId: string): ArchiveEditorialGroup[] {
  const sections = editorialSections(config, { limit: 3 });
  const out: ArchiveEditorialGroup[] = [];

  /*
   * `GameEditorialKind` is `Guides | News | Blogs` — there is no `Winners` kind to filter out, and that absence
   * is the safeguard rather than a gap: a winner story is a claim about a real person, so the configuration
   * schema gives it nowhere to live in the first place.
   */
  for (const s of sections) {
    out.push({
      kind: s.kind,
      heading: s.heading,
      items: s.items.map((i) => ({
        title: i.title,
        summary: i.summary,
        href: i.href,
        dateLine: i.effectiveDate ? `Took effect ${i.effectiveDate}` : null,
      })),
      emptyStatement: s.items.length === 0
        ? `No ${s.kind.toLowerCase()} entry is published for this game yet.`
        : null,
    });
  }

  /*
   * Community — AR-09's designated discussion slot, now connected to the REAL Community family.
   *
   * This group carried an honest empty state ("no community service exists") until `/community` and
   * `/community/{slug}` became registry-served routes (commit a39bdfe, Conflict 41 FOUNDER AMENDMENT) —
   * which satisfies `FD-ACC-10`'s hidden-because-no-forum condition by construction. The items are the
   * corpus's real threads for THIS jurisdiction and game family, read through the one BFF seam: real
   * titles, real reply counts, real `/community/{slug}` destinations. The Constitution still forbids
   * inventing posts, threads, replies, reputation or activity — nothing here is generated, and a family
   * with no matching thread keeps a truthful empty state that points at the hub instead of faking one.
   */
  const discussions = communityDiscussionsFor({ gameId: familyId, stateCode }, 3);
  out.push({
    kind: "Community",
    heading: "Player discussions",
    items: discussions.map((d) => ({
      title: d.title,
      summary: d.excerpt,
      href: d.href,
      dateLine: `${d.replyCount} ${d.replyCount === 1 ? "reply" : "replies"} · last activity ${d.lastActivityDisplay}`,
    })),
    emptyStatement: discussions.length === 0
      ? "No discussion about this game is open yet. Player conversation lives in the LotteryCorner "
        + "community; nothing on this page is generated activity."
      : null,
  });

  return out.filter((g) => g.items.length > 0 || g.emptyStatement !== null);
}

/* ------------------------------------------------------------------ AR-11 next actions */

function buildNextActions(
  gameHref: string,
  gameLabel: string,
  mode: ArchiveViewModel["mode"],
  config: GameViewConfig,
): ArchiveViewModel["nextActions"] {
  /*
   * ══ NO NON-FUNCTIONAL CONTINUE ACTIONS ══
   *
   * "Compare another year" was rendered with a note saying it was unavailable — a control that explains why it
   * does not work, which founder direction forbids. Save, Follow, alerts and Buy were already absent (no account
   * service, and commerce must not follow a historical comparison).
   *
   * What is left is what works: go back to the live game, and jump to the search on this page.
   */
  const out: { label: string; href: string | null; fragment: string | null; note: string | null }[] = [
    { label: `Latest ${gameLabel} results`, href: gameHref, fragment: null, note: null },
  ];
  if (gameCapability(config, "hasChecker")) {
    out.push({ label: "Check your numbers", href: `${gameHref}#jg-03`, fragment: null, note: null });
  }
  out.push({ label: "Search this year", href: null, fragment: "#ar-06", note: null });
  if (mode === "YR-RETIRED") return out.filter((a) => !a.label.startsWith("Check"));
  return out;
}

/* ------------------------------------------------------------------ ask prompts */

/**
 * Suggested prompts, generated from THIS game's format, members and rows.
 *
 * The brief lists Pick 3 examples (`Did 507 appear in 2026?`); reproducing those literally would hardcode a
 * three-digit game into a generic engine. They are built from the format instead, and the number in the first
 * prompt is taken from a real row so the suggested question has an answer.
 */
function buildAskPrompts(
  profile: ReturnType<typeof formatProfile>,
  members: readonly { variantLabel: string }[],
  rows: readonly ArchiveDrawRow[],
): string[] {
  const out: string[] = [];
  const main = profile.main;
  const sample = rows[0];
  if (main && sample) {
    const typed = main.valueType === "digit" ? sample.mainValues.join("") : sample.mainValues.join(", ");
    out.push(`Did ${typed} appear this year?`);
    if (main.semantics.matchOrdered) out.push(`Did ${typed} appear in any order?`);
  }
  const variant = members.find((m) => m.variantLabel)?.variantLabel;
  if (main?.semantics.repeatsAllowed && main.count > 1) {
    out.push(variant ? `Show all ${variant} doubles in March.` : "Show all doubles in March.");
    out.push("Which dates had every value the same?");
  }
  if (variant) out.push(`Show ${variant} drawings in June.`);
  return out.slice(0, 4);
}
