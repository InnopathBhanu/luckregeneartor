/*
 * THE GAME PAGE VIEW MODEL — LRG-GAME-049.
 *
 * Resolves configuration + the governed jurisdiction manifest + the production draw event + the governed
 * result format into one typed model. This is the ONLY place that decides which Game Page sections render;
 * components receive a resolved model and draw it.
 *
 * ══ EVERYTHING COMES FROM AN EXISTING GOVERNED SOURCE ══
 *
 * No separate Powerball data source is manufactured (REFERENCE GAME). The result is the same
 * `StateDrawEvent` record the Florida State page renders, read through `drawEventsFor`; the format is the
 * same `verifiedOfficial` Powerball version from the shared registry; the claim facts are the same gated
 * Florida manifest facts; commerce is the same resolved capability. One result is governed once.
 *
 * ══ WHAT IS ABSENT, AND WHY ABSENCE IS THE ANSWER ══
 *
 * The production feed carries ONE Powerball record per jurisdiction — the current draw. There is no result
 * history anywhere in the repository, so `recentResults` does not exist and the section suppresses. BP-04B
 * §3 independently assigns results history to the flagship ecosystem, which is not built. Both roads lead to
 * the same honest place, and neither permits inventing rows.
 */

import { drawEventsFor, type StateDrawEvent } from "../state/stateDrawEvents";
import { formatVersionsFor } from "../state/stateFormatRegistry";
import { selectFormatVersion, type ResultFormatVersion } from "../state/resultFormatContract";
import { stateManifestFor } from "../state/stateContentManifests";
import { commerceResolutionFor, type StateCommerceResolution } from "../state/stateCommerceRegistry";
import { gate, type GatedFact } from "../state/publicationGate";
import { gameRegistryEntry, type GameRegistryEntry } from "./gameRegistry";
import { gameConfigFor } from "./gameConfigRegistry";
import { gameCapability, type GameViewConfig } from "./gameViewConfig";
import { buildGameM2Model, type GameM2Model } from "./gameM2Model";
import type { MemberBallGroup } from "../state/gameFamilyPresentation";
import { stateViewConfigFor } from "../state/stateViewConfigRegistry";

/** One drawn group, in the same shape the approved Home/State ball grammar already renders. */
export type GameBallGroup = MemberBallGroup;

export interface GameResultView {
  drawDateIso: string;
  drawDateDisplay: string;
  groups: GameBallGroup[];
  /** The published multiplier and HOW it is obtained, from the governed format. */
  multiplier: { label: string; value: number; kind: string; conditionNote?: string } | null;
  /** The labelled secondary drawing — Double Play — with its own groups. Never a second game card. */
  secondary: { label: string; groups: GameBallGroup[]; timingNote: string } | null;
  jackpotDisplay: string | null;
  jackpotLabel: string | null;
  /** Published separately or not at all. Never derived by us. */
  cashValueDisplay: string | null;
  nextDrawDateDisplay: string | null;
  /**
   * The next drawing's GAME-LOCAL calendar date, `YYYY-MM-DD` — §B1.
   *
   * Carried alongside the display string rather than parsed back out of it. A display string is a presentation
   * decision that can change; re-deriving a date from it is how a display change silently becomes a date bug, and
   * §14 makes game-local date meaning a governed property rather than a formatting detail.
   */
  nextDrawDateIso: string | null;
  nextJackpotDisplay: string | null;
  drawDays: string | null;
  drawTimeLocal: string | null;
}

/** One local feature row: a configured label with a value resolved from a governed source. */
export interface GameLocalFeatureView {
  key: string;
  label: string;
  value: string;
}

export interface GameClaimTier {
  range: string;
  where: string;
}

export type GameSectionId =
  | "JO-01" | "JO-02" | "AD-JO00" | "JO-03" | "JO-04" | "JO-05" | "JO-06" | "JO-07" | "JO-08"
  | "AD-JO01"
  | "JG-01" | "JG-02" | "AD-JG00" | "JG-03" | "JG-04" | "JG-05" | "JG-06" | "AD-JG01"
  | "JG-07" | "JG-08" | "JG-09" | "JG-10" | "JG-11" | "AD-JG02"
  | "JG-12" | "JG-13" | "JG-14" | "JG-15" | "JG-16" | "JG-17" | "JG-18" | "AD-JG03"
  | "Footer";

export type GameSectionState =
  | { render: true }
  | { render: false; reason: string };

/** BP-04B §8 — the approved JG-M1 order. Reproduced exactly; this array is the single source of order. */
export const JG_M1_ORDER: readonly GameSectionId[] = Object.freeze([
  "JO-01", "JO-02", "AD-JO00", "JO-03", "JO-04", "JO-05", "JO-06", "JO-07", "JO-08", "AD-JO01", "Footer",
]);

/**
 * BP-04B §18 — the approved JG-M2 order, reproduced exactly including the four advertisement anchors.
 *
 * The anchors stay in the sequence and resolve to nothing, for the same reason `AD-JO00` does: no Game Page
 * ad slot is captured or approved, and dropping the anchor from the order would lose the governed position
 * that ad ops has to fill later. Order is declared once, here, and never assembled in a component.
 */
export const JG_M2_ORDER: readonly GameSectionId[] = Object.freeze([
  "JG-01", "JG-02", "AD-JG00", "JG-03", "JG-04", "JG-05", "JG-06", "AD-JG01",
  "JG-07", "JG-08", "JG-09", "JG-10", "JG-11", "AD-JG02",
  "JG-12", "JG-13", "JG-14", "JG-15", "JG-16", "JG-17", "JG-18", "AD-JG03",
  "Footer",
]);

/** Every advertisement anchor across both modes. One list, so the suppression rule cannot be applied twice. */
const AD_ANCHORS: readonly GameSectionId[] = Object.freeze([
  "AD-JO00", "AD-JO01", "AD-JG00", "AD-JG01", "AD-JG02", "AD-JG03",
]);

export interface GamePreviewModel {
  entry: GameRegistryEntry;
  config: GameViewConfig;
  stateName: string;
  gameLabel: string;
  timezoneLabel: string;
  /**
   * The jurisdiction's GOVERNED IANA timezone, e.g. `America/New_York` — §B1.
   *
   * `timezoneLabel` ("ET") is a reader-facing label and cannot resolve an instant: it does not carry DST, and two
   * zones share it. The IANA zone comes from `config/states/{code}.json` `state.timezone`, which is validated on
   * load, so a relative draw label is computed against the game's real local clock rather than the viewer's
   * (`CLAUDE.md` §14).
   *
   * `null` when the jurisdiction has no validated State configuration — in which case no relative label renders,
   * rather than one computed against a guessed zone.
   */
  timeZone: string | null;

  order: readonly GameSectionId[];
  sectionState: Record<GameSectionId, GameSectionState>;

  result: GameResultView | null;
  format: ResultFormatVersion | undefined;

  localFeatures: GameLocalFeatureView[];
  claimDeadline: GatedFact<string>;
  claimTiers: GameClaimTier[];
  operatorName: GatedFact<string>;
  operatorHowToClaimUrl: GatedFact<string>;
  operatorWinningNumbersUrl: GatedFact<string>;
  operatorResponsiblePlayUrl: GatedFact<string>;

  commerce: StateCommerceResolution;
  freshness: { lastUpdatedIso: string | null; daysOld: number | null; stale: boolean };

  /** Sections deliberately not rendered, with the reason. Diagnostic only — never reader copy. */
  suppressed: { id: GameSectionId; reason: string }[];

  /**
   * The JG-M2 extras. `undefined` on a JG-M1 page.
   *
   * Kept as one optional branch rather than a discriminated union so the JG-M1 path — and every existing
   * JG-M1 test — is untouched by this task. A JG-M1 model built before and after this change is identical.
   */
  m2?: GameM2Model;
}

function displayDate(iso: string | null): string {
  if (!iso) return "No result yet";
  const [y, m, d] = iso.split("-");
  const weekday = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  return `${weekday} ${m}/${d}/${y}`;
}

/** Ball groups for the main drawing, using the same colour tokens and roles Home and State already use. */
function groupsFor(e: StateDrawEvent): GameBallGroup[] {
  return [
    { label: null, values: e.mainNumbers, colorToken: "ball.default", visualRole: "main" },
    ...e.specialBalls.map((s) => ({
      label: s.label,
      values: s.values,
      colorToken: s.label.toLowerCase().includes("mega") ? "ball.megaball" : "ball.powerball",
      visualRole: "special" as const,
      accessibleLabel: s.label,
    })),
  ];
}

function freshnessOf(iso: string | null, now: Date) {
  if (!iso) return { daysOld: null, stale: false };
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return { daysOld: null, stale: false };
  const days = Math.floor((now.getTime() - t) / 86_400_000);
  return { daysOld: days, stale: days > 2 };
}

/**
 * Build the model, or `null` when this pair is not a governed Game Page.
 *
 * `previewEnabled` is passed in from the route boundary, so this module never reads the environment and
 * stays pure and testable — the same discipline the State model follows.
 */
export function buildGamePreviewModel(
  stateCode: string,
  gameSlug: string,
  previewEnabled: boolean,
  opts: {
    now?: Date;
    /**
     * A configuration to use instead of the registered one.
     *
     * Exists so a test can prove a `capabilities` flag is load-bearing by cloning a real configuration and
     * switching one field off. There is no other honest way to demonstrate it: every shipped configuration
     * declares its capabilities `true`, which is exactly why nothing noticed that the flags were inert
     * (LRG-GAME-053). The registered configuration is still the default, so no route behaviour changes.
     */
    config?: GameViewConfig;
  } = {},
): GamePreviewModel | null {
  const entry = gameRegistryEntry(stateCode, gameSlug);
  const config = opts.config ?? gameConfigFor(stateCode, gameSlug);
  const manifest = stateManifestFor(stateCode);
  if (!entry || !config || !manifest) return null;

  const now = opts.now ?? new Date();
  const stateName = manifest.canonicalName.value ?? config.game.stateName;
  const { gameLabel, timezoneLabel } = { gameLabel: config.game.gameLabel, timezoneLabel: config.game.timezoneLabel };
  /* §B1: the governed IANA zone for this jurisdiction, or null. Never inferred from `timezoneLabel`. */
  const timeZone = stateViewConfigFor(config.game.stateCode)?.state.timezone ?? null;

  /* ---- the result: this jurisdiction's own record for this game id ---- */
  const event = drawEventsFor(stateCode).find((e) => e.gameId === entry.gameId) ?? null;
  const format = selectFormatVersion(
    formatVersionsFor(stateCode),
    config.game.gameSlug,
    (manifest.resultLastUpdatedIso.value ?? now.toISOString()).slice(0, 10),
  );

  const result: GameResultView | null = event && event.mainNumbers.length > 0
    ? {
        drawDateIso: event.resultDate ?? "",
        drawDateDisplay: displayDate(event.resultDate),
        groups: groupsFor(event),
        multiplier: event.multiplier
          ? {
              label: event.multiplier.label,
              value: event.multiplier.value,
              kind: format?.multiplier?.kind ?? "unavailable",
              ...(format?.multiplier?.conditionNote ? { conditionNote: format.multiplier.conditionNote } : {}),
            }
          : null,
        secondary: event.secondaryDraw
          ? {
              label: event.secondaryDraw.label,
              groups: [
                { label: null, values: event.secondaryDraw.mainNumbers, colorToken: "ball.default", visualRole: "main" },
                ...event.secondaryDraw.specialBalls.map((s) => ({
                  label: s.label, values: s.values, colorToken: "ball.powerball",
                  visualRole: "special" as const, accessibleLabel: s.label,
                })),
              ],
              timingNote: format?.secondaryDraws?.[0]?.timingNote ?? "",
            }
          : null,
        jackpotDisplay: event.topPrizeDisplay,
        /* The prize LABEL comes from the governed format's prize kind, never from a guess about what the
           feed's money figure means. */
        jackpotLabel: format?.prize.kind === "estimatedAnnuitizedJackpot" ? "Est. annuitized jackpot"
          : format?.prize.kind === "advertisedJackpot" ? "Advertised jackpot"
          : format?.prize.kind === "fixedTopPrize" ? "Top prize"
          : null,
        /* The format says a cash value is separately published; the feed does not carry one, and we never
           derive it. Absent rather than computed. */
        cashValueDisplay: null,
        nextDrawDateDisplay: event.nextDrawDate ? displayDate(event.nextDrawDate) : null,
        nextDrawDateIso: event.nextDrawDate ?? null,
        nextJackpotDisplay: event.nextPrizeDisplay,
        drawDays: event.drawDays || null,
        drawTimeLocal: event.drawTimeLocal,
      }
    : null;

  /* ---- local features: configured labels, governed values ---- */
  const schedule = (manifest.drawSchedule.value ?? []).find((s) => s.gameId === entry.gameId);
  const featureValue = (sourceKey: string): string | null => {
    switch (sourceKey) {
      case "multiplier":
        return result?.multiplier
          ? `Offered. ${result.multiplier.label} is chosen and paid for separately, and multiplies non-jackpot prizes.`
          : null;
      case "secondaryDraw":
        return result?.secondary
          ? `Offered. ${result.secondary.label} is a separate drawing with its own numbers.`
          : null;
      case "drawCutoffs":
        return manifest.drawCutoffs.availability === "verified" ? manifest.drawCutoffs.value ?? null : null;
      case "drawSchedule":
        return schedule ? `${schedule.drawDays}, ${schedule.drawTimeLocal} ${timezoneLabel}` : null;
      case "minimumPurchaseAge":
        return manifest.minimumPurchaseAge.availability === "verified" && manifest.minimumPurchaseAge.value
          ? `${manifest.minimumPurchaseAge.value} or older.`
          : null;
      default:
        return null;
    }
  };
  const localFeatures: GameLocalFeatureView[] = config.localFeatures
    .map((f) => ({ key: f.key, label: f.label, value: featureValue(f.sourceKey) ?? "" }))
    .filter((f) => f.value.length > 0);

  /* ---- claim facts, through the same publication gate the State page uses ---- */
  const claimDeadline = gate(manifest.claimDeadline, previewEnabled);
  const claimTiers = (gate(manifest.claimThresholds, previewEnabled).value ?? []) as GameClaimTier[];
  const operatorName = gate(manifest.operatorName, previewEnabled);
  const operatorHowToClaimUrl = gate(manifest.operatorHowToClaimUrl, previewEnabled);
  const operatorWinningNumbersUrl = gate(manifest.operatorWinningNumbersUrl, previewEnabled);
  const operatorResponsiblePlayUrl = gate(manifest.operatorResponsiblePlayUrl, previewEnabled);

  const commerce = commerceResolutionFor(stateCode);
  const lastUpdatedIso = manifest.resultLastUpdatedIso.value ?? null;

  /* ---- section decisions ---- */
  const sectionState = {} as Record<GameSectionId, GameSectionState>;
  const set = (id: GameSectionId, ok: boolean, reason: string) => {
    sectionState[id] = ok ? { render: true } : { render: false, reason };
  };

  /* Every advertisement anchor, both modes, one rule. No Game Page slot is captured from the legacy JSPs and
     no profile is approved, so each anchor keeps its governed position and reserves no geometry. */
  for (const id of AD_ANCHORS) {
    set(id, false, "No approved Game Page advertising profile exists.");
  }

  /* ═══ JG-M2: the full state-native composition ═══ */
  if (entry.mode === "JG-M2") {
    const m2 = buildGameM2Model(stateCode, config, previewEnabled);
    if (!m2) return null;

    const hasMembers = m2.members.some((mm) => mm.result !== null);
    const hasMatrix = (m2.matrix?.base.length ?? 0) > 0;
    const hasHistory = m2.history.length > 0;

    set("JG-01", hasMembers, "No member game has a publishable result.");
    set("JG-02", true, "");
    /* JG-03 is one of the eighteen required sections, so it renders on every JG-M2 page. Whether the TOOL is
       drawn inside it is a separate decision (`m2.checkerUsable`) — the section explains itself when the
       comparison cannot be priced, rather than vanishing or showing an empty control. */
    set("JG-03", true, "");
    set("JG-04", gameCapability(config, "hasSharedAi"), "No AI surface is configured.");
    set("JG-05", m2.schedules.length > 0, "No member schedules exist.");
    /*
     * JG-06 needs the FORMAT, not the rule era.
     *
     * It suppressed for seven of ten games on `m2.era !== undefined`, which was a leftover from before the
     * shape moved to `BallGroupSpec`. A game without a verified rule era still has a format, so it can still
     * explain how many values are drawn from what range — and the prize table inside the section suppresses
     * separately, with its own reason. Requiring the era hid the explanation along with the matrix.
     */
    set("JG-06", m2.profile !== null, "No result format exists for this game.");

    /*
     * ═══ EVERY OPTIONAL FEATURE NEEDS BOTH THE CAPABILITY AND THE SUPPORT (CORRECTED, LRG-GAME-053) ═══
     *
     * The configuration schema has carried a `capabilities` block since the Game Page began, and — apart from
     * `hasSharedAi` and `hasChecker` — NOTHING READ IT. Every representative game happens to declare its
     * capabilities `true`, so the omission was invisible: history, number search, statistics, the generator,
     * player methods, community starters and alerts each rendered whenever their DATA existed, and setting a
     * capability to `false` changed nothing at all.
     *
     * That is worse than a missing feature. A configuration field that appears to control something and does
     * not is a false statement about how the page behaves, and the first jurisdiction to switch one off would
     * have shipped a tool it had deliberately disabled.
     *
     * The rule below is now uniform: an optional feature renders only when the CAPABILITY is on AND the
     * required format or data support exists. Both halves are load-bearing — the capability is the editorial
     * decision, the support is whether it is possible — so each suppression names which half failed.
     *
     * MANDATORY SECTIONS ARE NOT GATED THIS WAY. JG-01, JG-02, JG-03, JG-05, JG-06, JG-12, JG-13 and JG-18 are
     * required by BP-04B §18 and keep their heading and an honest explanation. Hiding a required heading to
     * satisfy a capability flag would trade one dishonesty for another.
     */
    const cap = (key: Parameters<typeof gameCapability>[1]) => gameCapability(config, key);

    set("JG-07", cap("hasHistory") && hasHistory,
      cap("hasHistory")
        ? "No result history is connected and no review fixture is available."
        : "Result history is switched off for this game in its configuration.");
    set("JG-08", cap("hasNumberHistory") && hasHistory && m2.profile?.supports.numberSearch === true,
      !cap("hasNumberHistory")
        ? "Historical number search is switched off for this game in its configuration."
        : !hasHistory
          ? "Number history needs a connected or review history set."
          : "This game's result format cannot express a number search.");
    set("JG-09", cap("hasStatistics") && m2.statistics !== null,
      cap("hasStatistics")
        ? "Statistics need a connected or review history set."
        : "Statistics are switched off for this game in its configuration.");
    /* The generator needs a count and a range — both format facts. It never needed the rule era. */
    set("JG-10", cap("hasGenerator") && m2.profile?.supports.generator === true,
      cap("hasGenerator")
        ? "This game's result format cannot express a generated set."
        : "The number generator is switched off for this game in its configuration.");
    set("JG-11", cap("hasMethods") && (config.methods?.length ?? 0) > 0,
      cap("hasMethods")
        ? "No player-method modules are configured."
        : "Player methods are switched off for this game in its configuration.");
    /*
     * JG-12 renders `m2.offeringFacts` and nothing else, so that array is the eligibility question.
     *
     * ══ THE CORRECTED CONDITION ══
     *
     * It was `localFeatures.length > 0 || m2.era !== null`, and both halves were wrong. `m2.era` is typed
     * `GameRuleEra | undefined`, so `m2.era !== null` is a TAUTOLOGY — `undefined !== null` is true — which made
     * the whole expression constantly true and the first half dead code. And `localFeatures` is the JG-M1
     * feature list, which JG-12 does not render at all, so even reached it was measuring the wrong thing.
     *
     * The condition now asks what the section actually needs: at least one publishable fact to show. Those facts
     * come from a verified offering fact, an applicable rule era's relevant details, or a configured schedule
     * fact — `buildGameM2Model` has already applied the publication gate to each — so counting them is the
     * complete test. A jurisdiction with none gets the heading and a stated reason, not an empty definition list.
     */
    set("JG-12", m2.offeringFacts.length > 0,
      "No verified local offering facts exist for this jurisdiction.");
    set("JG-13", claimDeadline.publish || claimTiers.length > 0,
      "No verified claim guidance exists for this jurisdiction.");
    /* JG-14's insights are computed FROM the history, so the history capability governs them too: a game with
       history switched off must not publish observations derived from the history it is not showing. */
    set("JG-14", cap("hasHistory") && m2.insights.length > 0,
      cap("hasHistory")
        ? "Insights need a connected or review history set."
        : "Result history is switched off for this game in its configuration.");
    set("JG-15", m2.editorial.length > 0, "No editorial inventory is configured for this game.");
    set("JG-16", cap("hasCommunityStarters") && config.community.length > 0,
      cap("hasCommunityStarters")
        ? "No discussion starters are configured."
        : "Discussion starters are switched off for this game in its configuration.");
    set("JG-17", cap("hasAlerts") && m2.alerts.length > 0,
      cap("hasAlerts")
        ? "No follow or alert options apply to this game."
        : "Follow and alert options are switched off for this game in its configuration.");
    set("JG-18", true, "");
    set("Footer", true, "");

    const suppressedM2 = JG_M2_ORDER
      .map((id) => ({ id, s: sectionState[id] }))
      .filter((x): x is { id: GameSectionId; s: { render: false; reason: string } } => x.s?.render === false)
      .map((x) => ({ id: x.id, reason: x.s.reason }));

    return {
      entry, config, stateName, gameLabel, timezoneLabel, timeZone,
      order: JG_M2_ORDER,
      sectionState,
      result,
      format,
      localFeatures,
      claimDeadline,
      claimTiers,
      operatorName,
      operatorHowToClaimUrl,
      operatorWinningNumbersUrl,
      operatorResponsiblePlayUrl,
      commerce,
      freshness: { lastUpdatedIso, ...freshnessOf(lastUpdatedIso, now) },
      suppressed: suppressedM2,
      m2,
    };
  }

  set("JO-01", result !== null, "No publishable result exists for this game.");
  set("JO-02", gameCapability(config, "hasBuyNowEntry"), "No Buy Now entry is configured.");
  set("JO-03", localFeatures.length > 0, "No verified local feature facts exist for this jurisdiction.");
  set("JO-04", claimDeadline.publish || claimTiers.length > 0,
    "No verified claim guidance exists for this jurisdiction.");
  set("JO-05", gameCapability(config, "hasSharedAi") || config.community.length > 0,
    "No local AI, news, winners or community content exists.");
  /* BP-04B §15 wants a launcher to Check My Numbers, Results History, Statistics, Generator, Jackpot
     History, the Tax Calculator and `/tools`. NONE of those routes is implemented, and FD-S-30 forbids
     inventing one while FD-S-08 forbids a control that looks functional and is not. */
  set("JO-06", gameCapability(config, "hasGlobalTools"),
    "The flagship game ecosystem and /tools are not implemented, so every launcher target would be a dead route.");
  /* BP-04B §16 requires an account. Member/Insider is blocked by CLAUDE.md §16 pending founder decisions. */
  set("JO-07", gameCapability(config, "hasFollowOffering"),
    "Following requires an account; Member/Insider decisions remain open.");
  set("JO-08", true, "");
  set("Footer", true, "");

  const suppressed = JG_M1_ORDER
    .map((id) => ({ id, s: sectionState[id] }))
    .filter((x): x is { id: GameSectionId; s: { render: false; reason: string } } => x.s.render === false)
    .map((x) => ({ id: x.id, reason: x.s.reason }));

  return {
    entry, config, stateName, gameLabel, timezoneLabel, timeZone,
    order: JG_M1_ORDER,
    sectionState,
    result,
    format,
    localFeatures,
    claimDeadline,
    claimTiers,
    operatorName,
    operatorHowToClaimUrl,
    operatorWinningNumbersUrl,
    operatorResponsiblePlayUrl,
    commerce,
    freshness: { lastUpdatedIso, ...freshnessOf(lastUpdatedIso, now) },
    suppressed,
  };
}
