/*
 * CONTENT MANIFESTS FOR THE REPRESENTATIVE PREVIEW STATES — LRG-STATE-047.
 *
 * The manifest is the governed-facts layer: every field carries an availability and a source, and the
 * publication gate refuses to publish anything that is not sourced (`FD-S-01`, `FD-S-02`). Florida's
 * manifest is a long file precisely because Florida's facts were researched and sourced one at a time.
 *
 * ══ WHY THESE FIVE MANIFESTS ARE MOSTLY ABSENCES ══
 *
 * For Michigan, Virginia, California, Maryland and Utah the repository contains NO operator research: no
 * verified official URL, no published claim threshold, no verified draw days, no tax or anonymity finding,
 * no responsible-play contact. This task may not browse, and `FD-X-14` requires each State to pass the
 * content-manifest gate before its preview activates.
 *
 * So the manifests below record what is genuinely known — the State's identity, its timezone from the
 * production database export, and the results feed those numbers came from — and mark EVERYTHING ELSE as
 * `unavailable` with the reason. That is not a stub. It is the manifest doing its job: the sections that
 * depend on those facts suppress themselves, and the review document reports exactly which research would
 * turn each absence into content.
 *
 * The alternative — copying Florida's operator names, claim tiers and helpline into five other States —
 * would be fabricating jurisdiction-specific legal and financial guidance. CLAUDE.md §14 forbids it and it
 * is the single most harmful thing this task could produce.
 *
 * PROVENANCE
 *   [M1] 04-sample-data/reference-tables/game.csv — `TIMEZONE` for each State's games (production export).
 *   [M2] 04-sample-data/source-xml/latest-results-lc.xml — the results feed and its own coverage.
 *   [M3] lib/state/jurisdictionRegistry.ts — jurisdiction identity, itself evidenced from [M2] plus the
 *        five legacy no-lottery templates.
 */

import { drawEventsFor } from "./stateDrawEvents";
import { FLORIDA_MANIFEST, type StateContentManifest, type StateGameEntry } from "./floridaContentManifest";
import { findJurisdiction } from "./jurisdictionRegistry";
import { stateViewConfigFor } from "./stateViewConfigRegistry";

/* `GovernedFact` is not exported by the Florida manifest module, so the shape is taken from the interface
   itself. Both helpers below produce exactly what that interface requires. */
type Fact<T> = StateContentManifest["operatorName"] extends infer _ ? {
  value?: T;
  availability: "published" | "unavailable" | "underReview";
  source?: string;
} : never;

const known = <T,>(value: T, source: string) =>
  ({ value, availability: "published", source }) as unknown as Fact<T>;

const absent = (why: string) =>
  ({ availability: "unavailable", source: why }) as unknown as Fact<never>;

/**
 * The newest result date across a State's transcribed events, as an ISO instant.
 *
 * Derived from the events themselves rather than stated, so it can never claim a freshness the rendered
 * numbers do not have. The page's staleness banner is computed from this.
 */
function newestResultIso(code: string): string | undefined {
  const dates = drawEventsFor(code).map((e) => e.resultDate).filter((d): d is string => Boolean(d));
  if (dates.length === 0) return undefined;
  return `${dates.slice().sort().reverse()[0]}T00:00:00.000Z`;
}

/** Game entries for the coverage checker, derived from the events and the configured families. */
function gameEntriesFor(code: string): StateGameEntry[] {
  const cfg = stateViewConfigFor(code);
  const events = drawEventsFor(code);
  if (!cfg) return [];
  const groupOf = new Map<number, StateGameEntry["group"]>();
  const labelOf = new Map<number, string>();
  for (const f of cfg.presentation.families) {
    for (const m of f.members) {
      groupOf.set(m.gameId, f.group);
      labelOf.set(m.gameId, m.variantLabel ? `${f.familyLabel} (${m.variantLabel})` : f.familyLabel);
    }
  }
  return events
    .filter((e) => groupOf.has(e.gameId))
    .map((e) => ({
      gameId: e.gameId,
      displayName: labelOf.get(e.gameId) ?? e.familyName,
      group: groupOf.get(e.gameId)!,
    })) as StateGameEntry[];
}

const FEED_SOURCE =
  "04-sample-data/source-xml/latest-results-lc.xml — the production results feed, extracted 2026-08-01.";

/** The one reason string every unresearched operator fact carries, so the gap is unmistakable in audit. */
const NO_RESEARCH = (state: string, what: string) =>
  `No ${what} for ${state} is recorded anywhere in this repository. LRG-STATE-047 may not browse, and ` +
  `FD-X-14 requires the content-manifest gate to pass before this State's preview carries the claim.`;

/**
 * Build a manifest for a State whose operator facts are not yet researched.
 *
 * Every absence names the specific missing research rather than a generic "unavailable", because the review
 * document turns these strings into the work list.
 */
function unresearchedManifest(code: string): StateContentManifest | undefined {
  const j = findJurisdiction(code);
  const cfg = stateViewConfigFor(code);
  if (!j || !cfg) return undefined;
  const name = cfg.state.name;
  const noLottery = cfg.state.lotteryProfile === "noLottery";
  const lastUpdated = newestResultIso(code);

  return {
    manifestVersion: "1.0-lrg-state-047",
    stateCode: known(code, "[M3] jurisdiction registry"),
    canonicalName: known(name, "[M3] jurisdiction registry"),
    jurisdictionType: known(j.type, "[M3] jurisdiction registry"),
    lotteryStatus: known(j.lotteryStatus, "[M3] jurisdiction registry, from the legacy templates and [M2]"),

    /* The operator's NAME is not a safe derivation. "Michigan Lottery" is a plausible guess and a guess is
       not a source, and every one of these fields is rendered next to an official-source claim. */
    operatorName: absent(NO_RESEARCH(name, "verified operator name")),
    operatorOfficialUrl: absent(NO_RESEARCH(name, "verified official operator URL")),
    operatorWinningNumbersUrl: absent(NO_RESEARCH(name, "verified official winning-numbers URL")),
    operatorWhereToPlayUrl: absent(NO_RESEARCH(name, "verified official where-to-play URL")),
    operatorHowToClaimUrl: absent(NO_RESEARCH(name, "verified official how-to-claim URL")),
    operatorResponsiblePlayUrl: absent(NO_RESEARCH(name, "verified official responsible-play URL")),

    primaryTimezone: known(cfg.state.timezone, "[M1] game.csv TIMEZONE for this State's games"),
    displayTimezoneLabel: known(cfg.state.timezoneLabel, "[M1] game.csv TIMEZONE for this State's games"),

    resultSource: noLottery
      ? absent(`${name} has no games in the production results feed [M2], which is the no-lottery evidence.`)
      : known("LotteryCorner production results feed", FEED_SOURCE),
    resultLastUpdatedIso: lastUpdated
      ? known(lastUpdated, `Newest result-date across this State's transcribed events. ${FEED_SOURCE}`)
      : absent(`${name} has no results in the production feed [M2].`),

    games: known(gameEntriesFor(code), FEED_SOURCE),

    /* Draw DAYS were verified for Florida from the operator's own game pages. No equivalent source exists
       for these States, so S-04 suppresses rather than printing a schedule we cannot stand behind. */
    drawSchedule: absent(NO_RESEARCH(name, "verified draw-day schedule")),
    drawCutoffs: absent(NO_RESEARCH(name, "verified sales-cutoff rule")),
    minimumPurchaseAge: absent(NO_RESEARCH(name, "officially published minimum play age")),
    claimThresholds: absent(NO_RESEARCH(name, "published claim threshold")),
    claimDeadline: absent(NO_RESEARCH(name, "published claim deadline")),
    historyDestinations: absent(
      `No internal ${name} archive route is implemented, and FD-S-30 forbids inventing one.`,
    ),
    responsiblePlayContact: absent(NO_RESEARCH(name, "verified responsible-play contact")),

    taxStatus: absent(NO_RESEARCH(name, "state tax finding")),
    anonymityRule: absent(NO_RESEARCH(name, "winner-anonymity finding")),
    purchaseEligibility: absent(NO_RESEARCH(name, "verified purchase-eligibility evidence")),
    publishedOdds: absent(NO_RESEARCH(name, "published odds")),
    scratcherSnapshot: absent(NO_RESEARCH(name, "scratch-off snapshot")),
    winnerRecords: absent(`No verified ${name} winner record exists. Synthetic winners must never be published.`),
    unclaimedPrizeRecords: absent(NO_RESEARCH(name, "unclaimed-prize record")),
    fundAllocation: absent(NO_RESEARCH(name, "fund-allocation finding")),
    editorialItems: absent(`No approved ${name} editorial content package exists in this repository.`),
    communityItems: absent(`No real ${name} community activity exists. Fabricated activity is prohibited.`),

    /* Not a lottery fact — a statement about LotteryCorner, and true in every jurisdiction. */
    independencePolicy: known(cfg.trust.independence, "config/states/" + code + ".json — approved trust copy"),

    formatRegistryRef: known(
      "lib/state/stateFormatRegistry.ts",
      "Production-derived formats, recorded provisionalProductionDerived and blocked from public publication.",
    ),
    commerceCapabilityRef: known(
      "lib/state/stateCommerceRegistry.ts",
      `${name} commerce resolves to unknown: FD-X-11 requires positive evidence, and none is recorded.`,
    ),
  } as StateContentManifest;
}

/*
 * RESEARCHED MANIFESTS, BY JURISDICTION. A table, so Florida is data rather than a branch, and researching
 * a second State is one row.
 */
const RESEARCHED: Record<string, StateContentManifest> = { fl: FLORIDA_MANIFEST };

const CACHE = new Map<string, StateContentManifest | undefined>();

/**
 * The manifest for any preview State.
 *
 * Florida returns its own researched manifest untouched. Every other preview State gets the unresearched
 * manifest above, built once and cached — the derivation reads the events and the configuration, and both
 * are constant for the process lifetime.
 */
export function stateManifestFor(stateCode: string): StateContentManifest | undefined {
  const code = stateCode.toLowerCase();
  const researched = RESEARCHED[code];
  if (researched) return researched;
  if (!CACHE.has(code)) CACHE.set(code, unresearchedManifest(code));
  return CACHE.get(code);
}
