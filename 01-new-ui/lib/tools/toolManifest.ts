/*
 * THE TOOL MANIFEST — BP-05C §18, as a typed record per tool. LRG-TOOLS-001.
 *
 * Authority: BP-05C §3 (the six questions the hub answers), §4 (the T-C1..T-C6 catalog), §11 (the access
 * matrix — the Insider column is IGNORED: `FD-ACC-02` forbids any Insider concept, so the type below cannot
 * express one), §18 (what a manifest declares), `FD-DAT-17` (no dead link, no placeholder, no "coming soon")
 * and `CLAUDE.md` §10 (routes come from a registry, never from a blueprint's wish list).
 *
 * ══ ONLY GENUINELY AVAILABLE TOOLS ══
 *
 * BP-05C §4 catalogs ~60 tools. This manifest records the ones a reader can actually USE in this build:
 * the standalone Tax Calculator, and the tools that already run inside other page families — the flagship
 * checker, generator, Stats Lab and past-draw explorer, the JG-M2 game-page checker and generator, and the
 * yearly-archive search. A catalog category with zero available tools is simply absent from the hub
 * (`FD-DAT-17`); the rest of the §4 catalog stays in the blueprint until each tool ships.
 *
 * ══ LOCATIONS ARE DERIVED FROM THE REGISTRIES ══
 *
 * A hosted tool's links are computed from the same registries that decide route existence (`FD-GATE-01`),
 * so the hub cannot link to a page this build does not serve — the "no dead links" rule is structural, not
 * reviewed-per-edit. Fragments are the hosting family's own governed section anchors.
 */

import { FLAGSHIP_GAMES } from "../flagship/flagshipGames";
import { FLAGSHIP_ANCHORS } from "../flagship/flagshipContract";
import { isFlagshipEligible } from "../flagship/flagshipRegistry";
import { ELIGIBLE as GAME_PAIRS } from "../game/gameRegistry";
import { archiveRoutePaths } from "../archive/archiveRegistry";
import { findJurisdiction } from "../state/jurisdictionRegistry";

/* ------------------------------------------------------------------ paths */

export const TOOLS_HUB_PATH = "/tools";
export const TAX_CALCULATOR_PATH = "/tools/tax-calculator";

/* ------------------------------------------------------------------ vocabulary */

/** BP-05C §4 categories. All six exist in the type; the hub renders only the ones with available tools. */
export type ToolCategory = "T-C1" | "T-C2" | "T-C3" | "T-C4" | "T-C5" | "T-C6";

export const TOOL_CATEGORY_LABELS: Readonly<Record<ToolCategory, string>> = Object.freeze({
  "T-C1": "Check and results",
  "T-C2": "Jackpot and money",
  "T-C3": "Number analysis",
  "T-C4": "Generate and systems",
  "T-C5": "Personal and AI",
  "T-C6": "Planning and responsible use",
});

/**
 * BP-05C §0.1 access patterns, minus Insider (`FD-ACC-02`: no Insider concept, table, flag, route or copy).
 * The §11 "Insider value" column is deliberately not modelled anywhere in this type.
 */
export type ToolAccessLevel = "publicComplete" | "publicPreview" | "signedIn";

/* ------------------------------------------------------------------ the §18 record */

export interface ToolLocation {
  label: string;
  /** A same-site href: a registered route, optionally with the hosting family's governed fragment. */
  href: string;
}

/** One tool, declared per BP-05C §18. */
export interface ToolManifestRecord {
  /** §18: tool ID. */
  id: string;
  /** §18: name. */
  name: string;
  /** One line: what it calculates, analyses or generates. */
  purpose: string;
  /** §18: category. */
  category: ToolCategory;
  /** §18: route — the standalone `/tools/*` URL, or null when the tool runs inside another page family. */
  route: string | null;
  /** Where the tool runs today. Never empty; every href resolves (tested). */
  locations: readonly ToolLocation[];
  /** §18: supported games. */
  supportedGames: string;
  /** §18: required inputs. */
  requiredInputs: readonly string[];
  /** §18: the deterministic service — the module that owns the computation. */
  deterministicService: string;
  /** §18: AI role. Honest: no model is connected in this build. */
  aiRole: string;
  /** §18: access level (BP-05C §11, Insider column ignored). */
  access: ToolAccessLevel;
  /** The §11 public column, verbatim intent — e.g. "One estimate — the current scenario". */
  publicScope: string;
  /** The §11 sign-in column — what a free account adds. Continuity, never truth. */
  signedInValue: string;
  /** §18: output. */
  output: string;
  /** §18: save object, or null where nothing is saved. */
  saveObject: string | null;
  /** §18: source and data period. */
  sourceAndDataPeriod: string;
  /** §18: rule-era behavior. */
  ruleEraBehavior: string;
  /** §18: ad tier. */
  adTier: string;
  /** §18: metrics. */
  metrics: readonly string[];
  /** §18: error and freshness states the surface implements. */
  states: readonly string[];
}

/* ------------------------------------------------------------------ derived locations */

/** `fl/pick-3` → `Florida Pick 3`. Labels derive from the jurisdiction registry, never retyped. */
function gamePairLabel(stateCode: string, gameSlug: string): string {
  const stateName = findJurisdiction(stateCode)?.name ?? stateCode.toUpperCase();
  const gameName = gameSlug
    .split("-")
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
  return `${stateName} ${gameName}`;
}

function flagshipLocations(fragment: string): ToolLocation[] {
  return FLAGSHIP_GAMES.filter((g) => isFlagshipEligible(g.gameSlug)).map((g) => ({
    label: g.gameLabel,
    href: `/${g.gameSlug}#${fragment}`,
  }));
}

/** JG-M2 pages carry the working checker (JG-03) and generator (JG-10); JG-M1 does not. */
function gamePageLocations(fragment: "jg-03" | "jg-10"): ToolLocation[] {
  return GAME_PAIRS.filter((e) => e.previewEnabled && e.mode === "JG-M2").map((e) => ({
    label: gamePairLabel(e.stateCode, e.gameSlug),
    href: `/${e.stateCode}/${e.gameSlug}#${fragment}`,
  }));
}

/** Every served yearly archive, with its AR-06 search section. */
function archiveSearchLocations(): ToolLocation[] {
  return archiveRoutePaths().map((path) => {
    const [, state, game, year] = path.split("/");
    return { label: `${gamePairLabel(state, game)} — ${year} archive`, href: `${path}#ar-06` };
  });
}

/* ------------------------------------------------------------------ the manifest */

export function toolManifest(): ToolManifestRecord[] {
  return [
    {
      id: "lottery-tax-calculator",
      name: "Lottery Tax Calculator",
      purpose:
        "An estimate of what a prize is worth after federal and state taxes, cash and annuity side by side.",
      category: "T-C2",
      route: TAX_CALCULATOR_PATH,
      locations: [{ label: "Lottery Tax Calculator", href: TAX_CALCULATOR_PATH }],
      supportedGames: "Game-neutral: any advertised prize amount; ?game= context prefills the flagship jackpot.",
      requiredInputs: [
        "advertised jackpot amount",
        "lump sum or annuity choice",
        "state (chosen by the reader — never inferred from IP)",
        "federal filing status",
      ],
      deterministicService: "lib/tools/taxCalculator.ts over lib/tools/taxTables2026.ts",
      aiRole:
        "None connected. The plain-language withheld-vs-owed explanation is fixed editorial copy over the "
        + "deterministic output — never labelled AI (FD-DAT-20).",
      access: "publicComplete",
      publicScope:
        "One complete estimate — the current scenario, computed in full before anything is asked of the "
        + "reader (BP-05C §11: 'One estimate'; Constitution: the calculation comes before the save prompt).",
      signedInValue: "Save scenarios to your free account and come back to the same figures later.",
      output:
        "Side-by-side cash vs annuity columns: gross → 24% federal withholding → estimated additional "
        + "federal at 2026 marginal rates → state withheld and additional → estimated net; expandable "
        + "30-year annuity schedule.",
      saveObject: "Tax scenario (amount, payout choice, state, filing status, estimated nets) — review data mode.",
      sourceAndDataPeriod:
        "2026 IRS marginal tables (Rev. Proc. 2025-32) and published state rates, as recorded and dated in "
        + "lib/tools/taxTables2026.ts. State rows pending founder verification say so on the page.",
      ruleEraBehavior: "Not draw-data dependent. The effective TAX year (2026) is stated on every estimate.",
      adTier:
        "None. No captured GAM slot exists for the tools family (the legacy tax page's inventory is "
        + "uncaptured — CLAUDE.md §12 requires its own audit before any slot renders), and the calculator's "
        + "input-to-output flow is a protected zone regardless.",
      metrics: ["input start", "estimate completion", "schedule open", "save", "sign-in at save", "next-tool continuation"],
      states: ["fresh", "empty (no amount)", "no state selected", "state rate pending verification"],
    },
    {
      id: "flagship-number-checker",
      name: "Check my numbers",
      purpose: "Compare a line against the published drawing — or every drawing held — position by position.",
      category: "T-C1",
      route: null,
      locations: flagshipLocations(FLAGSHIP_ANCHORS.checkNumbers),
      supportedGames: "Powerball and Mega Millions, including Double Play where published.",
      requiredInputs: ["your line", "how far back to check"],
      deterministicService: "lib/flagship/flagshipCheck.ts",
      aiRole: "Explain-my-result chip targets the page's shared answer surface (deterministic grounding).",
      access: "publicComplete",
      publicScope: "Complete — check any line with no account (BP-05C §11).",
      signedInValue: "Save lines, check several tickets at once, be told when a saved line matches.",
      output: "Match outcome per drawing, with provenance per row.",
      saveObject: "Saved number set (review data mode).",
      sourceAndDataPeriod: "The hosting page's own governed drawing record; the page states its coverage.",
      ruleEraBehavior: "Checked against the matrix in force on each drawing's date.",
      adTier: "The hosting page's audited profile. Checking is a protected zone — no ad inside the flow.",
      metrics: ["input start", "completion", "save"],
      states: ["fresh", "single-drawing coverage", "incomplete line"],
    },
    {
      id: "flagship-past-draw-search",
      name: "Past draw search",
      purpose: "Filter the drawing record by date, values, sums and shape, and open any drawing found.",
      category: "T-C1",
      route: null,
      locations: flagshipLocations(FLAGSHIP_ANCHORS.resultsHistory),
      supportedGames: "Powerball and Mega Millions.",
      requiredInputs: ["any filter — date range, number, sum, shape"],
      deterministicService: "lib/flagship/flagshipExplorer.ts",
      aiRole: "Filter results feed the shared answer surface as computed context.",
      access: "publicComplete",
      publicScope: "Complete — search the connected record with no account.",
      signedInValue: "Saved filters are a later capability; nothing is gated today.",
      output: "The matching drawings, with each row openable and checkable.",
      saveObject: null,
      sourceAndDataPeriod: "The hosting page's own governed drawing record; the page states its coverage.",
      ruleEraBehavior: "Rows carry their era; the page labels comparisons across a rule change.",
      adTier: "The hosting page's audited profile.",
      metrics: ["input start", "completion"],
      states: ["fresh", "empty result"],
    },
    {
      id: "archive-search",
      name: "Yearly archive search",
      purpose: "Search one year of published results by number, month, draw time or pattern.",
      category: "T-C1",
      route: null,
      locations: archiveSearchLocations(),
      supportedGames: "Every game with a served yearly archive.",
      requiredInputs: ["a year page", "any filter — number, month, draw time, shape, sum"],
      deterministicService: "lib/archive/archiveModel.ts (AR-06 search over the year's rows)",
      aiRole: "None. Ask-the-Archive stays ABSENT per FD-DAT-17 until an account can meter it.",
      access: "publicComplete",
      publicScope: "Complete — search the year with no account.",
      signedInValue: "Nothing is gated today.",
      output: "Matching result rows inside the year, with per-row detail.",
      saveObject: null,
      sourceAndDataPeriod: "The archive page's own governed year of results.",
      ruleEraBehavior: "A year containing a format boundary labels it.",
      adTier: "The hosting page's audited profile. The result grid is a protected zone.",
      metrics: ["input start", "completion"],
      states: ["fresh", "empty result"],
    },
    {
      id: "flagship-stats-lab",
      name: "Stats Lab",
      purpose: "Frequency, gaps, pairs, repeats, balance and sums across the drawing record — method stated on every view.",
      category: "T-C3",
      route: null,
      locations: flagshipLocations(FLAGSHIP_ANCHORS.statsLab),
      supportedGames: "Powerball and Mega Millions.",
      requiredInputs: ["a view", "a period"],
      deterministicService: "lib/flagship/flagshipStats.ts",
      aiRole: "Explain-this-view chips target the shared answer surface; nothing generative runs.",
      access: "publicPreview",
      publicScope: "Views and method visible; each view states what data it needs where history is not connected.",
      signedInValue: "Save a stat view and compare your own saved numbers against it.",
      output: "Tables and counts with sample size, period and method on every view.",
      saveObject: "Saved stat view (page preference, review data mode).",
      sourceAndDataPeriod: "The hosting page's own governed drawing record; every view prints its period.",
      ruleEraBehavior: "Views state the era they cover; cross-era comparison is labelled.",
      adTier: "The hosting page's audited profile.",
      metrics: ["view open", "period change", "save"],
      states: ["fresh", "dataNotConnected — stated per view"],
    },
    {
      id: "flagship-generator",
      name: "Number generator",
      purpose: "Random lines with balance preferences and numbers you want to keep. Entertainment, not analysis.",
      category: "T-C4",
      route: null,
      locations: flagshipLocations(FLAGSHIP_ANCHORS.generator),
      supportedGames: "Powerball and Mega Millions.",
      requiredInputs: ["how many lines", "optional keeps and preferences"],
      deterministicService: "lib/flagship/flagshipGenerator.ts",
      aiRole: "None. Random output is never described as analysed or improved.",
      access: "publicComplete",
      publicScope: "Complete — generate lines with no account.",
      signedInValue: "Save generated sets and reuse them next drawing.",
      output: "Generated lines, each testable against the record in one click.",
      saveObject: "Saved number set (review data mode).",
      sourceAndDataPeriod: "The game's published number matrix.",
      ruleEraBehavior: "Generates within the matrix currently in force.",
      adTier: "The hosting page's audited profile. Input-to-output is a protected zone.",
      metrics: ["input start", "completion", "save"],
      states: ["fresh"],
    },
    {
      id: "game-page-checker",
      name: "Game-page ticket checker",
      purpose: "Check a state game's play against the drawing for a chosen date, priced by its own payout rules.",
      category: "T-C1",
      route: null,
      locations: gamePageLocations("jg-03"),
      supportedGames: "Every served JG-M2 state game.",
      requiredInputs: ["your play", "the draw date"],
      deterministicService: "lib/game (JG-03 comparison over the family's governed rules)",
      aiRole: "The explain chip targets the page's shared answer surface.",
      access: "publicComplete",
      publicScope: "Complete — check a play with no account.",
      signedInValue: "Save plays and alerts through the page's member actions (JG-17).",
      output: "Match outcome against the selected drawing.",
      saveObject: "Saved number set (review data mode).",
      sourceAndDataPeriod: "The game page's own governed results.",
      ruleEraBehavior: "Date-effective format rules decide how the play is read.",
      adTier: "The hosting page's audited profile. Checking is a protected zone.",
      metrics: ["input start", "completion", "save"],
      states: ["fresh", "unpriceable comparison — section explains instead of rendering a dead control"],
    },
    {
      id: "game-page-generator",
      name: "Game-page number generator",
      purpose: "Random plays for a state game, within its own format. Entertainment, not analysis.",
      category: "T-C4",
      route: null,
      locations: gamePageLocations("jg-10"),
      supportedGames: "Every served JG-M2 state game.",
      requiredInputs: ["how many plays"],
      deterministicService: "lib/game (JG-10 generation within the family's governed format)",
      aiRole: "None. Random output is never described as analysed or improved.",
      access: "publicComplete",
      publicScope: "Complete — generate plays with no account.",
      signedInValue: "Save plays through the page's member actions (JG-17).",
      output: "Generated plays in the game's own shape.",
      saveObject: "Saved number set (review data mode).",
      sourceAndDataPeriod: "The game's governed format definition.",
      ruleEraBehavior: "Generates within the format currently in force.",
      adTier: "The hosting page's audited profile. Input-to-output is a protected zone.",
      metrics: ["input start", "completion", "save"],
      states: ["fresh"],
    },
  ];
}

/** The §4 categories that actually have at least one available tool, in catalog order. */
export function availableCategories(): ToolCategory[] {
  const manifest = toolManifest();
  return (Object.keys(TOOL_CATEGORY_LABELS) as ToolCategory[]).filter((c) =>
    manifest.some((t) => t.category === c),
  );
}

/** The tools of one category, standalone routes first. */
export function toolsInCategory(category: ToolCategory): ToolManifestRecord[] {
  return toolManifest()
    .filter((t) => t.category === category)
    .sort((a, b) => Number(b.route !== null) - Number(a.route !== null));
}
