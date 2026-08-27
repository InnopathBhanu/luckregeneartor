import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";

import {
  FLAGSHIP_ELIGIBLE, flagshipRegistryEntry, isFlagshipEligible, flagshipRoutePaths,
  assertRegistryMatchesConfig,
} from "../lib/flagship/flagshipRegistry";
import { isFlagshipRouteEnabled } from "../lib/flagship/flagshipRouteAccess";
import { flagshipGameConfig, FLAGSHIP_GAMES, isGap, matrixOf } from "../lib/flagship/flagshipGames";
import { buildFlagshipPageModel, MIN_ROWS_FOR_SEARCH } from "../lib/flagship/flagshipPageModel";
import { combinations, jackpotOdds, oddsTable, totalCombinations } from "../lib/flagship/flagshipOdds";
import {
  consecutiveRuns, decadeBuckets, drawInsights, drawSpread, drawSum, highLowSplit, jackpotMovement,
  oddEvenSplit, parseAdvertised, repeatsFromPrevious, INSIGHT_BOUNDARY,
} from "../lib/flagship/flagshipInsights";
import { statsLab, statsMethod, STAT_VIEWS } from "../lib/flagship/flagshipStats";
import { flagshipFaq } from "../lib/flagship/flagshipFaq";
import { FLAGSHIP_MERGED_SECTIONS } from "../lib/flagship/flagshipContract";
import { publishedHistory, drawNightsOf, weekdayOf } from "../lib/flagship/flagshipHistory";
import { buildReviewHistory, MAX_REVIEW_DRAWS } from "../lib/flagship/flagshipReviewFixture";
import {
  EMPTY_FILTER, activeFilterChips, clearFilterKey, filterLikeDraw, searchDraws, similarDraws,
} from "../lib/flagship/flagshipExplorer";
import {
  CHECK_MODES, availableCheckModes, checkAgainstHistory, checkLine, validateLine,
} from "../lib/flagship/flagshipCheck";
import { generateLines, validateLocks, dateRangeNote, GENERATOR_BOUNDARY } from "../lib/flagship/flagshipGenerator";
import {
  aiCopyStrings, aiSurfaces, aiSurfacesFor, assertNoPredictionClaim, containsPredictionClaim,
  AI_SURFACE_BOUNDARY,
} from "../lib/flagship/flagshipAi";
import { flagshipContentFeeds, isContentConnected, taggedFeed } from "../lib/flagship/flagshipTaggedContent";
import { allLockedCapabilities, flagshipTools, inlineTools } from "../lib/flagship/flagshipTools";
import { servesPage } from "../lib/registry/pageFamilyRegistry";
import { engagementIntent, engagementOptions, ENGAGEMENT_LOCKED_NOTE } from "../lib/flagship/flagshipEngagement";
import { NO_APPROVED_FLAGSHIP_PROFILE, flagshipAdProfileFor } from "../lib/flagship/flagshipAdProfile";
import { flagshipPageGraph, PROHIBITED_FLAGSHIP_TYPES } from "../lib/flagship/flagshipSchema";
import { FLAGSHIP_SECTION_ORDER } from "../lib/flagship/flagshipContract";
import { flagshipMetadata } from "../lib/flagship/flagshipRouteMetadata";
import { gameTheme, resolveGameTheme } from "../lib/theme/gameThemeRegistry";
import { FLAGSHIP_DATA_MODE, getFlagshipGamePageData, isPreviewData } from "../lib/flagship/bff/flagshipBff";
import {
  assertPayloadShape as assertPayload, mockFlagshipGamePageData, mockedGameSlugs,
} from "../lib/flagship/bff/flagshipBffMock";
import { FUTURE_API } from "../lib/flagship/bff/flagshipBffContract";
import { jackpotRun } from "../lib/flagship/flagshipJackpotRun";
import {
  FLAGSHIP_DISPLAY_MODE, previewCountNote, provenanceSentence, provenanceTag,
} from "../lib/flagship/flagshipDisplay";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

/**
 * Every source file this page family owns.
 *
 * Enumerated from disk rather than listed by hand, so a file added later is covered by the whole-tree assertions
 * (no stray TODO, no commerce route, no direct mock import) without anyone remembering to add it here.
 */
const FLAGSHIP_SOURCE_FILES: string[] = (() => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${dir}/${e.name}`);
      else if (/\.tsx?$/.test(e.name)) out.push(`${dir}/${e.name}`);
    }
  };
  walk("lib/flagship");
  walk("components/flagship");
  walk("app/powerball");
  walk("app/mega-millions");
  return out;
})();
const exists = (p: string) => existsSync(new URL(`../${p}`, import.meta.url));

/**
 * A file's source with its comments removed.
 *
 * Several assertions below are about what the page DOES, not about what its header explains. This codebase
 * documents its constraints in prose — "it is not `disabled`", "no `/buynow` route is referenced", "`Math.random`
 * is not used" — so a naive text search matches the very comment that promises the opposite. Stripping comments
 * first makes each assertion test the code rather than the documentation of the code.
 */
const code = (p: string) =>
  src(p)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Run a body with the flagship guard forced to a value, restoring every touched variable afterwards. */
function withEnv(vars: Record<string, string | undefined>, body: () => void) {
  const previous: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    previous[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    body();
  } finally {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const PB = () => flagshipGameConfig("powerball")!;
const MM = () => flagshipGameConfig("mega-millions")!;
const modelPB = () => buildFlagshipPageModel("powerball")!;
const modelMM = () => buildFlagshipPageModel("mega-millions")!;

/* ══════════════════════════════════════════════════════════════════ guard and routes */

describe("FGP-007: the routes are available without an environment guard", () => {
  test("no flagship code reads an environment variable at all", () => {
    /*
     * The `LC_FLAGSHIP_GAME_PREVIEW` gate is gone. This asserts its ABSENCE across the whole flagship tree, so a
     * future change cannot quietly reintroduce a preview flag the founder removed.
     */
    for (const f of [
      "lib/flagship/flagshipRouteAccess.ts",
      "lib/flagship/flagshipRegistry.ts",
      "lib/flagship/flagshipRouteMetadata.ts",
      "lib/flagship/flagshipPageModel.ts",
      "lib/flagship/flagshipHistory.ts",
      "app/powerball/page.tsx",
      "app/mega-millions/page.tsx",
    ]) {
      assert.doesNotMatch(code(f), /process\.env/, `${f} must not read the environment`);
      assert.doesNotMatch(code(f), /LC_FLAGSHIP_GAME_PREVIEW/, `${f} must not reference the removed flag`);
    }
    assert.equal(exists("lib/flagship/flagshipPreviewGuard.ts"), false, "the old guard module is gone");
  });

  test("both routes are enabled, and eligibility still comes from the registry", () => {
    assert.equal(isFlagshipRouteEnabled("powerball"), true);
    assert.equal(isFlagshipRouteEnabled("mega-millions"), true);
    assert.equal(isFlagshipRouteEnabled("MEGA-MILLIONS"), true, "the lookup is case-insensitive");
    /* `CLAUDE.md` §10 survives the removal: an unregistered slug is still not a route. */
    for (const other of ["lotto-america", "2by2", "cash4life", "fl", "pick-3", ""]) {
      assert.equal(isFlagshipRouteEnabled(other), false, `${other} must not be a flagship route`);
      assert.equal(buildFlagshipPageModel(other), null, `${other} must not build a model`);
    }
    assert.equal(isFlagshipEligible("lotto-america"), false);
  });

  test("the environment cannot change what renders", () => {
    /* Setting the old flag — or any neighbouring preview flag — has no effect either way. */
    for (const value of [undefined, "true", "false", "1"]) {
      withEnv({ LC_FLAGSHIP_GAME_PREVIEW: value, LC_STATE_PREVIEW: value }, () => {
        assert.equal(isFlagshipRouteEnabled("powerball"), true);
        assert.equal(isFlagshipRouteEnabled("mega-millions"), true);
        assert.ok(buildFlagshipPageModel("powerball"));
        assert.ok(buildFlagshipPageModel("mega-millions"));
      });
    }
  });

  test("ALL FIVE page families now gate on the registry and read no environment variable", () => {
    /*
     * ══ EXTENDED BY `FD-GATE-01` (2026-08-11) ══
     *
     * This asserted that the flagship family read no env var while its NEIGHBOURS still did — it literally required
     * `LC_STATE_PREVIEW` and `LC_HOME_PREVIEW` to be present. `FD-GATE-01` ratified the flagship pattern for
     * everyone, so the assertion inverts: no family's GATE may read an environment variable, and the two flags this
     * test used to require must now be absent from every gating path.
     */
    const GATING_PATHS = [
      "lib/registry/pageFamilyRegistry.ts",
      "lib/game/gamePreviewGuard.ts",
      "lib/flagship/flagshipRouteAccess.ts",
      "lib/flagship/flagshipRegistry.ts",
      "lib/game/gameRegistry.ts",
      "lib/archive/archiveRegistry.ts",
      "lib/state/jurisdictionRegistry.ts",
    ];
    for (const f of GATING_PATHS) {
      /* `code`, not `src`: these files DOCUMENT which flags were removed, and a comment naming a dead flag is the
         opposite of a regression — it is the record of the removal. What must not exist is a READ. */
      const body = code(f);
      assert.doesNotMatch(body, /process\.env/, `${f} decides route existence and must read no environment`);
      for (const flag of [/LC_HOME_PREVIEW/, /LC_STATE_PREVIEW/, /LC_GAME_PREVIEW/, /LC_FLAGSHIP_GAME_PREVIEW/]) {
        assert.doesNotMatch(body, flag, `${f} must not reference ${flag}`);
      }
    }
    /* The two removed gates are gone from their former homes. */
    assert.ok(!/export function isStatePreviewEnabled/.test(code("lib/state/statePreviewGuard.ts")));
    assert.ok(!/export function resolveStatePreview/.test(code("lib/state/statePreviewGuard.ts")));
    assert.ok(!/export function isHomePreviewEnabled/.test(code("lib/preview/previewGuard.ts")));
    /* And every family reaches the one mechanism. */
    assert.match(code("lib/game/gamePreviewGuard.ts"), /servesPage\("game"/);
    assert.match(code("lib/flagship/flagshipRouteAccess.ts"), /servesPage\("flagship"/);
  });

  test("the registry is the route inventory, and it matches the game configuration", () => {
    assert.deepEqual(FLAGSHIP_ELIGIBLE.map((e) => e.gameSlug), ["powerball", "mega-millions"]);
    assert.deepEqual(flagshipRoutePaths(), ["/powerball", "/mega-millions"]);
    assert.equal(flagshipRegistryEntry("powerball")?.gameId, 1012);
    assert.equal(flagshipRegistryEntry("mega-millions")?.gameId, 1013);
    assert.ok(FLAGSHIP_ELIGIBLE.every((e) => e.enabled === true));
    /* Both are `preserve` — ROUTE-AUDIT-001 §6 measured them live and indexed. */
    assert.ok(FLAGSHIP_ELIGIBLE.every((e) => e.routeClass === "preserve"));
    assert.doesNotThrow(() => assertRegistryMatchesConfig());
  });

  test("both route files check the registry before building anything", () => {
    for (const route of ["app/powerball/page.tsx", "app/mega-millions/page.tsx"]) {
      assert.ok(exists(route), `${route} must exist`);
      const body = code(route);
      assert.match(body, /isFlagshipRouteEnabled/);
      assert.match(body, /notFound\(\)/);
      assert.ok(
        body.indexOf("isFlagshipRouteEnabled") < body.indexOf("buildFlagshipPageModel"),
        `${route} must check the registry before building the model`,
      );
    }
  });

  test("the page reads its data through the BFF seam, and the review switch is gone entirely", () => {
    /*
     * FGP-007 isolated the review series behind a named constant. FGP-008 removed the generator from the page's
     * dependency graph. FGP-009 puts ONE seam in its place: the model calls `getFlagshipGamePageData` and nothing
     * else, so there is still no switch to get wrong.
     */
    assert.doesNotMatch(src("lib/flagship/flagshipHistory.ts"), /FLAGSHIP_REVIEW_HISTORY/);
    const model = code("lib/flagship/flagshipPageModel.ts");
    assert.match(model, /getFlagshipGamePageData\(gameSlug\)/);
    assert.match(model, /historyFromBff\(config, data\.history\)/);
    /* The published-only path survives as the fallback, so a data layer returning nothing is still launch-safe. */
    assert.match(model, /publishedHistory\(config\)/);
    /* The newest drawing on every page is the REAL published one, whatever the rest of the series is. */
    for (const h of [modelPB().history, modelMM().history]) {
      assert.equal(h.rows[0].provenance, "productionFeed");
      assert.ok(h.provenance.productionFeed >= 1);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ SEO boundaries */

describe("LRG-FLAGSHIP-002: no sitemap, no redirect, no canonical cutover, no commerce change", () => {
  test("neither route enters a sitemap, and no sitemap route exists", () => {
    assert.doesNotMatch(src("lib/seo/sitemapEntries.ts"), /powerball|mega-millions|flagship/i);
    assert.equal(exists("app/sitemap.ts"), false, "activating a sitemap is a separate cutover");
    assert.equal(exists("app/robots.ts"), false);
    for (const route of ["app/powerball/page.tsx", "app/mega-millions/page.tsx"]) {
      assert.doesNotMatch(code(route), /sitemap/i);
    }
  });

  test("no redirect is introduced anywhere in the flagship system", () => {
    for (const f of [
      "app/powerball/page.tsx", "app/mega-millions/page.tsx",
      "lib/flagship/flagshipRouteMetadata.ts", "lib/flagship/flagshipRegistry.ts",
      "lib/flagship/flagshipPageModel.ts",
    ]) {
      assert.doesNotMatch(code(f), /\bredirect\(/);
      assert.doesNotMatch(code(f), /permanentRedirect/);
    }
    assert.equal(exists("middleware.ts"), false, "no middleware is introduced");
    assert.equal(exists("next.config.redirects.js"), false);
    const nextConfig = exists("next.config.ts")
      ? src("next.config.ts")
      : exists("next.config.mjs")
        ? src("next.config.mjs")
        : "";
    assert.doesNotMatch(nextConfig, /redirects\s*\(/, "no redirect is added to the Next configuration");
  });

  test("both guarded pages are noindex, nofollow", () => {
    assert.match(src("lib/flagship/flagshipRouteMetadata.ts"), /robots: \{ index: false, follow: false \}/);
  });

  test("metadata is emitted for a registered route and empty for anything else", () => {
    /* FGP-007: no environment dependence. An unregistered slug is the only empty case. */
    assert.deepEqual(flagshipMetadata("lotto-america"), {});
    assert.deepEqual(flagshipMetadata(""), {});

    {
      const pb = flagshipMetadata("powerball");
      assert.equal(pb.alternates?.canonical, "https://www.lotterycorner.com/powerball");
      assert.deepEqual(pb.robots, { index: false, follow: false });
      /* BP-04A §36 fixes both titles exactly. */
      assert.deepEqual(pb.title, { absolute: "Powerball Results, Jackpot, Winning Numbers & Tools | LotteryCorner" });

      const mm = flagshipMetadata("mega-millions");
      assert.equal(mm.alternates?.canonical, "https://www.lotterycorner.com/mega-millions");
      assert.deepEqual(mm.title, { absolute: "Mega Millions Results, Jackpot, Numbers & Tools | LotteryCorner" });

      /* Unique title, description and canonical per page. */
      assert.notEqual(pb.description, mm.description);
      assert.notEqual(pb.alternates?.canonical, mm.alternates?.canonical);
      /* No social image is claimed: none is approved, and a broken card is worse than a summary one. */
      assert.equal(pb.openGraph && "images" in pb.openGraph, false);
    }
  });

  test("the canonical host is the single governed www origin and no host migration is expressed", () => {
    assert.equal(modelPB().seo.canonical, "https://www.lotterycorner.com/powerball");
    assert.equal(modelMM().seo.canonical, "https://www.lotterycorner.com/mega-millions");
    /* The flagship system never hardcodes an origin of its own. */
    for (const f of ["lib/flagship/flagshipRouteMetadata.ts", "lib/flagship/flagshipPageModel.ts", "lib/flagship/flagshipSchema.ts"]) {
      assert.doesNotMatch(code(f), /https:\/\/(www\.)?lotterycorner\.com/);
      assert.match(src(f), /productionOrigin/);
    }
  });

  test("the legacy Buy Now route is untouched and no commerce CTA is rendered", () => {
    assert.ok(exists("app/buynow/[code]/route.ts"), "the existing commerce resolver must still exist");
    for (const f of [
      "components/flagship/FlagshipGamePage.tsx",
      "components/flagship/sections/FlagshipEcosystem.tsx",
      "components/flagship/sections/FlagshipRules.tsx",
      "components/flagship/tools/FlagshipExplorerSection.tsx",
      "lib/flagship/flagshipPageModel.ts",
    ]) {
      assert.doesNotMatch(code(f), /\/buynow/, `${f} must not reference the commerce route`);
      assert.doesNotMatch(code(f), /\/play\//, `${f} must not introduce the unapproved /play route`);
    }
  });

  test("the structured-data graph is conservative and reflects visible content only", () => {
    const graph = flagshipPageGraph({ config: PB(), dateModified: "2026-07-08" });
    const json = JSON.stringify(graph);
    for (const t of PROHIBITED_FLAGSHIP_TYPES) {
      assert.doesNotMatch(json, new RegExp(`"@type"\\s*:\\s*"${t}"`), `${t} must not be emitted`);
    }
    assert.match(json, /"@type":"WebPage"/);
    assert.match(json, /"@type":"BreadcrumbList"/);

    /* `dateModified` is omitted rather than invented when no truthful signal exists. */
    const undated = JSON.stringify(flagshipPageGraph({ config: PB(), dateModified: null }));
    assert.doesNotMatch(undated, /dateModified/);
  });
});

/* ══════════════════════════════════════════════════════════════════ Powerball rules */

describe("LRG-FLAGSHIP-002: Powerball-specific rules", () => {
  test("the matrix is five from 1–69 plus a Powerball from 1–26", () => {
    const cfg = PB();
    const main = cfg.groups.find((g) => g.role === "main")!;
    const special = cfg.groups.find((g) => g.role === "special")!;
    assert.deepEqual([main.count, main.min, main.max], [5, 1, 69]);
    assert.deepEqual([special.count, special.min, special.max], [1, 1, 26]);
    assert.equal(special.label, "Powerball");
    /* The odds matrix is DERIVED from the groups, so the two cannot disagree. */
    assert.deepEqual(cfg.matrix, matrixOf(cfg.groups));
  });

  test("the draw rhythm is Monday, Wednesday and Saturday", () => {
    assert.equal(PB().drawDays.value, "Monday, Wednesday and Saturday");
    assert.equal(PB().drawDays.verification, "verifiedOfficial");
    assert.match(PB().drawTimeEt.value, /10:59/);
  });

  test("Power Play is a separately bought multiplier, drawn with the result", () => {
    const m = PB().multiplier;
    assert.equal(m.mode, "independentlySelected");
    assert.equal(m.label, "Power Play");
    assert.equal(m.drawnWithResult, true);
    assert.deepEqual([...m.values], [2, 3, 4, 5, 10]);
    assert.match(m.conditionNote.value, /\$1 per play/);
    assert.match(m.conditionNote.value, /10X/);
    /* The Power Play value from the feed reaches the rendered result. */
    const r = modelPB().result!;
    assert.equal(r.multiplier?.label, "Power Play");
    assert.equal(r.multiplier?.value, 4);
    assert.equal(r.multiplier?.mode, "independentlySelected");
  });

  test("Double Play is a labelled secondary drawing with its own numbers, never a second game", () => {
    const r = modelPB().result!;
    assert.equal(r.secondary?.label, "Double Play");
    assert.equal(r.secondary?.groups.find((g) => g.visualRole === "main")?.values.length, 5);
    assert.equal(r.secondary?.groups.find((g) => g.visualRole === "special")?.label, "Powerball");
    /* The main and secondary drawings are different numbers — proof they are not the same record twice. */
    assert.notDeepEqual(
      r.groups.find((g) => g.visualRole === "main")?.values,
      r.secondary?.groups.find((g) => g.visualRole === "main")?.values,
    );
    assert.match(r.secondary!.timingNote, /after the main Powerball drawing/i);
  });

  test("the U.S. and UK offerings are distinguished and no UK figure is invented", () => {
    const notes = PB().jurisdictionNotes;
    const shared = notes.find((n) => n.key === "us-uk-jackpot")!;
    assert.equal(isGap(shared.body), false);
    assert.match(!isGap(shared.body) ? shared.body.value : "", /Only the jackpot is shared/);
    const ukDisplay = notes.find((n) => n.key === "uk-display")!;
    assert.equal(isGap(ukDisplay.body), true, "the UK advertised value is a recorded gap, not a number");
  });

  test("the jackpot odds are 1 in 292,201,338", () => {
    const j = jackpotOdds(PB().matrix);
    assert.equal(Math.round(j.oddsOneIn), 292_201_338);
    assert.equal(j.display, "1 in 292,201,338");
    assert.equal(totalCombinations(PB().matrix), 292_201_338);
  });

  test("Powerball leads with Double Play and Power Play tools; Mega Millions does not have them", () => {
    const keys = flagshipTools(PB()).map((t) => t.key);
    assert.ok(keys.includes("double-play-checker"));
    assert.ok(keys.includes("power-play-explainer"));
    assert.equal(keys.indexOf("check-numbers"), 0, "the checker leads BP-05C §8");
    assert.equal(flagshipTools(MM()).some((t) => t.key === "double-play-checker"), false);
  });
});

/* ══════════════════════════════════════════════════════════════════ Mega Millions rules */

describe("LRG-FLAGSHIP-002: Mega Millions-specific rules", () => {
  test("the matrix is five from 1–70 plus a Mega Ball from 1–24", () => {
    const cfg = MM();
    const main = cfg.groups.find((g) => g.role === "main")!;
    const special = cfg.groups.find((g) => g.role === "special")!;
    assert.deepEqual([main.count, main.min, main.max], [5, 1, 70]);
    assert.deepEqual([special.count, special.min, special.max], [1, 1, 24]);
    assert.equal(special.label, "Mega Ball");
  });

  test("the draw rhythm is Tuesday and Friday, and the ticket is $5", () => {
    assert.equal(MM().drawDays.value, "Tuesday and Friday");
    assert.match(MM().drawTimeEt.value, /11:00/);
    const price = MM().ticketPrice;
    assert.equal(isGap(price), false);
    assert.equal(isGap(price) ? null : price.value, "$5 per play");
  });

  test("the multiplier is built in, per ticket, and NEVER rendered beside the drawn numbers", () => {
    const m = MM().multiplier;
    assert.equal(m.mode, "builtIn");
    assert.equal(m.drawnWithResult, false, "BP-04A §46: no draw-level current Mega Millions multiplier");
    assert.match(m.conditionNote.value, /assigned a random/i);
    assert.match(m.conditionNote.value, /automatically/i);
    /* Enforced in the model, not only in the config. */
    assert.equal(modelMM().result?.multiplier, null);
  });

  test("the multiplier is suppressed even if a feed record carried one", () => {
    /* The guardrail lives in `flagshipPageModel`, gated on `config.multiplier.drawnWithResult`, so a future feed
       change cannot introduce a draw-level Mega Millions multiplier by accident. */
    assert.match(
      src("lib/flagship/flagshipPageModel.ts"),
      /config\.multiplier\.drawnWithResult && event\.multiplier/,
    );
  });

  test("there is no secondary drawing", () => {
    assert.equal(MM().secondaryDraw, null);
    assert.equal(modelMM().result?.secondary, null);
  });

  test("the April 2025 rule era is recorded, and the earlier era is marked not captured", () => {
    const eras = MM().ruleEras;
    const current = eras.find((e) => e.effectiveTo === null)!;
    assert.equal(current.effectiveFrom, "2025-04-08");
    assert.match(current.summary.value, /April 2025/);
    const earlier = eras.find((e) => e.effectiveTo === "2025-04-07")!;
    assert.equal(earlier.summary.verification, "notCaptured");
    assert.match(earlier.summary.value, /not comparable/);
  });

  test("U.S.-only sale and the California pari-mutuel exception are stated", () => {
    const notes = MM().jurisdictionNotes;
    assert.ok(notes.some((n) => n.key === "us-only"));
    assert.ok(notes.some((n) => n.key === "ca-exception"));
    assert.match(MM().internationalNote.value, /only in U\.S\. selling jurisdictions/);
  });

  test("the jackpot odds are 1 in 290,472,336, and the Mega Ball alone is 1 in 35.17", () => {
    assert.equal(Math.round(jackpotOdds(MM().matrix).oddsOneIn), 290_472_336);
    const rows = oddsTable(MM().matrix, "Mega Ball");
    const megaBallOnly = rows.find((r) => r.mainMatched === 0 && r.specialMatched === true)!;
    assert.equal(Math.round(megaBallOnly.oddsOneIn * 100) / 100, 35.17);
  });

  test("Mega Millions leads with the ticket multiplier calculator", () => {
    const keys = flagshipTools(MM()).map((t) => t.key);
    assert.equal(keys[0], "check-numbers");
    assert.equal(keys[1], "ticket-multiplier-prize", "BP-05C §9 puts it second");
  });
});

/* ══════════════════════════════════════════════════════════════════ shared system */

describe("LRG-FLAGSHIP-002: one shared system, two configurations", () => {
  test("no flagship component branches on a game slug", () => {
    for (const f of [
      "components/flagship/FlagshipGamePage.tsx",
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/sections/FlagshipEcosystem.tsx",
      "components/flagship/sections/FlagshipRules.tsx",
      "components/flagship/tools/FlagshipCheckerSection.tsx",
      "components/flagship/tools/FlagshipGeneratorSection.tsx",
      "components/flagship/tools/FlagshipExplorerSection.tsx",
      "components/flagship/tools/FlagshipStatsSection.tsx",
      "components/flagship/tools/FlagshipConsole.tsx",
      "components/flagship/tools/FlagshipJackpotTracker.tsx",
      "components/flagship/tools/FlagshipAiConsole.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
    ]) {
      const s = src(f);
      assert.doesNotMatch(s, /gameSlug\s*===\s*["'`]/, `${f} must not branch on a game slug`);
      assert.doesNotMatch(s, /=== "powerball"|=== "mega-millions"/, `${f} must not branch on a game`);
    }
    /* The two routes share one renderer. */
    for (const route of ["app/powerball/page.tsx", "app/mega-millions/page.tsx"]) {
      assert.match(src(route), /FlagshipGamePage/);
    }
  });

  test("both models build, and both walk the BP-04A §12 section order", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.deepEqual(model.order, FLAGSHIP_SECTION_ORDER);
      /* Every FG section renders; the five ad anchors are suppressed with a recorded reason. */
      assert.equal(model.visibleSections.filter((s) => s.startsWith("AD-")).length, 0);
      assert.equal(model.suppressed.filter((s) => s.id.startsWith("AD-")).length, 5);
      for (const id of ["FG-01", "FG-02", "FG-03", "FG-05", "FG-07A", "FG-07B", "FG-08", "FG-09", "FG-13", "FG-15"] as const) {
        assert.ok(model.visibleSections.includes(id), `${id} must render`);
      }
    }
  });

  test("the revised order matches the founder's ten-step flow", () => {
    for (const model of [modelPB(), modelMM()]) {
      const o = model.visibleSections;
      const at = (id: string) => o.indexOf(id as never);

      /* 1 hero · 2 AI · 3 check · 4 jackpot · 5 build · 6 explore · 7 stats · 8 tagged · 9 odds · 10 trust */
      assert.deepEqual(
        [...o],
        ["FG-01", "FG-03", "FG-02", "FG-09", "FG-07A", "FG-08", "FG-07B", "FG-13", "FG-05", "FG-15"],
      );

      /* The two orderings the revision calls out by name. */
      assert.ok(at("FG-02") < at("FG-08"), "the ticket checker must come BEFORE the historical explorer");
      assert.ok(at("FG-09") < at("FG-08"), "the jackpot tracker must sit ABOVE the historical explorer");
      /* And the reference matter is genuinely last. */
      assert.ok(at("FG-05") > at("FG-07B"), "prizes and rules sit below the tools");
      assert.equal(o[o.length - 1], "FG-15", "trust and responsible play close the page");
    }
  });

  test("five sections are merged into a neighbour, each with a recorded destination", () => {
    assert.deepEqual(FLAGSHIP_MERGED_SECTIONS, {
      "FG-06": "FG-05",
      "FG-10": "FG-15",
      "FG-11": "FG-13",
      "FG-12": "FG-13",
      "FG-14": "FG-09",
    });
    for (const model of [modelPB(), modelMM()]) {
      for (const [merged, into] of Object.entries(FLAGSHIP_MERGED_SECTIONS)) {
        const entry = model.suppressed.find((sp) => sp.id === merged);
        assert.ok(entry, `${merged} must be recorded as suppressed`);
        assert.match(entry!.reason, new RegExp(`Merged into ${into}`));
        assert.equal(model.visibleSections.includes(merged as never), false);
      }
      /* Their content is still on the page — the governed id travels with the panel that absorbed it. */
    }
    assert.match(src("components/flagship/tools/FlagshipJackpotTracker.tsx"), /data-section-id="FG-14"/);
    assert.match(src("components/flagship/sections/FlagshipEcosystem.tsx"), /sectionId="FG-11"/);
    assert.match(src("components/flagship/sections/FlagshipEcosystem.tsx"), /sectionId="FG-12"/);
    assert.match(src("components/flagship/sections/FlagshipEcosystem.tsx"), /data-section-id="FG-10"/);
    assert.match(src("components/flagship/sections/FlagshipRules.tsx"), /data-section-id="FG-06"/);
  });

  test("each page has a unique H1, title and description", () => {
    const [a, b] = [modelPB(), modelMM()];
    assert.notEqual(a.seo.h1, b.seo.h1);
    assert.notEqual(a.seo.title, b.seo.title);
    assert.notEqual(a.seo.description, b.seo.description);
    /* Exactly one `<h1>` element is rendered by the shared page. */
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.equal((page.match(/<h1\b/g) ?? []).length, 1);
  });

  test("the result comes from a cross-checked national record, not one jurisdiction's copy", () => {
    const r = modelPB().result!;
    assert.ok(r.comparedStateCodes.length > 1, "more than one jurisdiction record is compared");
    assert.deepEqual(r.conflicts, [], "the jurisdictions agree on the Powerball drawing");
    assert.deepEqual(modelMM().result!.conflicts, []);
    /* California's empty Mega Millions record is excluded rather than treated as a disagreement. */
    assert.match(src("lib/flagship/flagshipDrawSource.ts"), /mainNumbers\.length === 0/);
  });

  test("no advertising is rendered, and the audit gap is recorded rather than worked around", () => {
    assert.equal(flagshipAdProfileFor("powerball").placements.length, 0);
    assert.equal(flagshipAdProfileFor("mega-millions"), NO_APPROVED_FLAGSHIP_PROFILE);
    assert.equal(NO_APPROVED_FLAGSHIP_PROFILE.tier, 2);
    assert.match(NO_APPROVED_FLAGSHIP_PROFILE.gap, /lc_mgp_/);
    assert.equal(modelPB().ads.id, "none-pending-flagship-ad-audit");
    /* No GAM identifier is invented anywhere in the flagship system. */
    for (const f of ["lib/flagship/flagshipAdProfile.ts", "components/flagship/FlagshipGamePage.tsx"]) {
      assert.doesNotMatch(src(f), /googletag|defineSlot|\/\d{6,}\//);
    }
  });

  test("the cash value is a stated gap, never a derived figure", () => {
    const r = modelPB().result!;
    assert.equal(r.cashValueDisplay, null);
    assert.match(r.cashValueGap.why, /never derived/);
    assert.ok(modelPB().gaps.some((g) => g.what.includes("cash value")));
  });

  test("freshness is derived from the game's own draw rhythm", () => {
    /* Powerball draws three nights a week and Mega Millions two, so their staleness thresholds differ. Both
       hold a drawing within a normal interval of the governed review date, so neither is stale. */
    for (const model of [modelPB(), modelMM()]) {
      assert.equal(model.freshness.state, "verified");
      assert.equal(model.freshness.stale, false);
      assert.ok(model.freshness.label.length > 0);
      assert.ok(model.freshness.lastResultIso);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ odds engine */

describe("LRG-FLAGSHIP-002: the odds are counted, and prize amounts are not invented", () => {
  test("binomial coefficients are exact", () => {
    assert.equal(combinations(69, 5), 11_238_513);
    assert.equal(combinations(70, 5), 12_103_014);
    assert.equal(combinations(5, 0), 1);
    assert.equal(combinations(5, 5), 1);
    assert.equal(combinations(3, 5), 0);
  });

  test("every Powerball combination is enumerated with its exact chance", () => {
    const rows = oddsTable(PB().matrix, "Powerball");
    /* 6 main outcomes × hit/miss = 12, minus the impossible `5 of 5` miss? It is possible, so 12 rows. */
    assert.equal(rows.length, 12);
    /* The total of all ways is every possible ticket, exactly once. */
    assert.equal(rows.reduce((n, r) => n + r.ways, 0), totalCombinations(PB().matrix));

    const oneAndPb = rows.find((r) => r.mainMatched === 1 && r.specialMatched === true)!;
    assert.equal(Math.round(oneAndPb.oddsOneIn * 100) / 100, 91.98);
    const pbOnly = rows.find((r) => r.mainMatched === 0 && r.specialMatched === true)!;
    assert.equal(Math.round(pbOnly.oddsOneIn * 100) / 100, 38.32);
    /* Rarest first, as every operator publishes it. */
    assert.equal(rows[0].isJackpot, true);
    assert.ok(rows.every((r, i) => i === 0 || rows[i - 1].oddsOneIn >= r.oddsOneIn));
  });

  test("no prize amount or overall-odds figure is claimed", () => {
    const model = modelPB();
    assert.match(model.odds.prizeGap.why, /prize matrix is not captured/);
    /* Neither the odds rows nor the checker carry a prize field at all. */
    const rowJson = JSON.stringify(model.odds.rows);
    assert.doesNotMatch(rowJson, /prize/i);
    assert.doesNotMatch(code("lib/flagship/flagshipCheck.ts"), /prizeDisplay/);
    /* The method statement describes the matrix it was computed from. */
    assert.match(model.odds.method, /11,238,513/);
    assert.match(modelMM().odds.method, /12,103,014/);
  });
});

/* ══════════════════════════════════════════════════════════════════ deterministic insights */

describe("LRG-FLAGSHIP-002: deterministic draw intelligence", () => {
  const main = [12, 29, 37, 43, 55];

  test("the primitives compute what they say", () => {
    assert.equal(drawSum(main), 176);
    assert.equal(drawSpread(main), 43);
    assert.deepEqual(oddEvenSplit(main), { odd: 4, even: 1 });
    /* Boundary 34: only 12 and 29 are in the low half. */
    assert.deepEqual(highLowSplit(main, 69), { low: 2, high: 3, boundary: 34 });
    assert.deepEqual(consecutiveRuns([1, 2, 3, 10, 11, 20]), [[1, 2, 3], [10, 11]]);
    assert.deepEqual(consecutiveRuns(main), []);
    assert.equal(decadeBuckets(main, 69).length, 7);
    assert.deepEqual(repeatsFromPrevious(main, [12, 55, 60]), [12, 55]);
    assert.equal(repeatsFromPrevious(main, null), null, "no previous drawing means no claim");
  });

  test("the repeat insight is omitted without a previous drawing, and computed with one", () => {
    const keys = drawInsights({ main, special: 18, specialLabel: "Powerball", mainPool: 69 }).map((i) => i.key);
    assert.equal(keys.includes("repeats"), false, "no previous drawing means no claim");

    const withPrevious = drawInsights(
      { main, special: 18, specialLabel: "Powerball", mainPool: 69 },
      [12, 55, 60, 61, 62],
    );
    const repeat = withPrevious.find((i) => i.key === "repeats")!;
    assert.equal(repeat.value, "12, 55");
    assert.equal(repeat.claim, "historicalObservation");

    /*
     * FGP-009: a connected series supplies the drawing BEFORE the latest one, so the repeat insight is computed
     * rather than omitted. The omission path above still governs when there is no previous drawing.
     */
    assert.ok(modelPB().history.rows.length > 1);
    assert.equal(modelPB().insights.some((i) => i.key === "repeats"), true);
  });

  test("every insight is classified, and the overdue myth is corrected", () => {
    for (const i of modelPB().insights) {
      assert.ok(["verifiedFact", "historicalObservation", "analysis"].includes(i.claim));
    }
    assert.match(INSIGHT_BOUNDARY, /no such thing as an overdue number/i);
    assert.equal(modelPB().insightBoundary, INSIGHT_BOUNDARY);
  });

  test("the jackpot movement is a two-point observation, not a trend", () => {
    const j = modelPB().jackpot!;
    assert.equal(j.currentDisplay, "$435,000,000");
    assert.equal(j.nextDisplay, "$457,000,000");
    assert.equal(j.changeDisplay, "+$22,000,000");
    assert.equal(parseAdvertised("$435,000,000"), 435_000_000);
    assert.equal(parseAdvertised(null), null);
    assert.equal(parseAdvertised("Rolldown"), null);
    assert.equal(jackpotMovement(null, "a", "b", "c"), null);
    /* No roll count is produced anywhere. */
    assert.doesNotMatch(src("lib/flagship/flagshipInsights.ts"), /rollCount|rollovers:/);
  });
});

/* ══════════════════════════════════════════════════════════════════ stats engine */

/**
 * The engines below are exercised against `buildReviewHistory` — the TEST fixture, never the page.
 *
 * FGP-008 took the review series out of the rendered page. The explorer, the checker's history modes and the ten
 * Stats Lab views still have to be proven over a realistic run of drawings, and the fixture is what provides one.
 * `reviewPB()` is used only where a long series is the point; every assertion about what a READER sees uses
 * `modelPB()`, which carries published drawings only.
 */
const reviewPB = () => buildReviewHistory(PB());
const reviewMM = () => buildReviewHistory(MM());

/** The Stats Lab computed over the test fixture's full series — the engine proof, never what a reader sees. */
const labFor = (cfg: ReturnType<typeof PB>) =>
  statsLab({
    rows: buildReviewHistory(cfg).rows,
    mainPool: cfg.matrix.mainPool,
    mainCount: cfg.matrix.mainCount,
    drawNights: drawNightsOf(cfg),
  });

describe("FGP-008: the review fixture is a test device and cannot reach a page", () => {
  test("no route, page model or component imports the fixture", () => {
    for (const f of [
      "lib/flagship/flagshipPageModel.ts",
      "lib/flagship/flagshipHistory.ts",
      "app/powerball/page.tsx",
      "app/mega-millions/page.tsx",
      "components/flagship/FlagshipGamePage.tsx",
      "components/flagship/tools/FlagshipExplorerSection.tsx",
      "components/flagship/tools/FlagshipStatsSection.tsx",
      "components/flagship/tools/FlagshipCheckerSection.tsx",
    ]) {
      assert.doesNotMatch(
        code(f),
        /from "[^"]*flagshipReviewFixture"/,
        `${f} must not import the review fixture`,
      );
    }
  });

  test("the fixture refuses to run in a production build", () => {
    withEnv({ NODE_ENV: "production" }, () => {
      assert.throws(() => buildReviewHistory(PB()), /must never be built into a production render/);
    });
    /* And it still works outside production, so the barrier is a guard rather than a break. */
    assert.ok(buildReviewHistory(PB()).rows.length > 1);
  });

  test("every drawing in the page model carries its provenance, and the newest is real", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.ok(model.history.rows.length >= 100, "the preview series is deep enough to exercise the tools");
      for (const row of model.history.rows) {
        assert.ok(
          ["productionFeed", "synthetic/internal-review"].includes(row.provenance),
          `${row.drawDateIso} must declare where it came from`,
        );
      }
      /* The single most prominent fact on the page is the real published drawing. */
      assert.equal(model.history.rows[0].provenance, "productionFeed");
      assert.equal(model.history.provenance.productionFeed, 1);
      assert.equal(
        model.history.provenance.synthetic + model.history.provenance.productionFeed,
        model.history.rows.length,
      );
      /* And the page says so, in the consumer register, before anything else. */
      assert.ok(model.preview);
      assert.match(model.preview!.disclosure, /Live feeds are still being connected/);
    }
  });

  test("explorer counts and stats separate published rows from preview rows", () => {
    for (const model of [modelPB(), modelMM()]) {
      const all = searchDraws(model.history.rows, EMPTY_FILTER, "x", 1000);
      assert.equal(all.matchCount, model.history.rows.length);
      /* Exactly one published row, and the search reports it as such rather than counting them all as real. */
      assert.equal(all.productionMatchCount, 1);
      for (const v of model.stats.views) {
        for (const r of v.rows) {
          const found = searchDraws(model.history.rows, r.filter, "x", 1000);
          assert.ok(found.productionMatchCount <= found.matchCount);
        }
      }
    }
  });

  test("the disclosure states which drawings are published and which are preview", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.match(model.historyDisclosure, /real published result/);
      assert.match(model.historyDisclosure, /preview\s+drawings used for layout and tool testing/);
      /* Internal vocabulary stays out of the consumer register. */
      assert.doesNotMatch(model.historyDisclosure, /internal review|synthetic/i);
    }
  });
});

describe("FGP-008: the review fixture still obeys the fabrication rules", () => {
  test("the newest row is the REAL published drawing, and it is the only one", () => {
    for (const [h, model] of [[reviewPB(), modelPB()], [reviewMM(), modelMM()]] as const) {
      assert.ok(h.rows.length > 1, "a series exists");
      assert.equal(h.rows[0].provenance, "productionFeed");
      assert.equal(h.provenance.productionFeed, 1);
      assert.equal(h.provenance.synthetic, h.rows.length - 1);
      /* The real row carries the real numbers from the feed. */
      assert.equal(h.rows[0].drawDateIso, model.result!.drawDateIso);
      assert.deepEqual(
        [...h.rows[0].main],
        [...model.result!.groups.find((g) => g.visualRole === "main")!.values].sort((a, b) => a - b),
      );
      /* Every other row is explicitly marked. */
      assert.ok(h.rows.slice(1).every((r) => r.provenance === "synthetic/internal-review"));
    }
  });

  test("NO jackpot, cash value, winner or prize is ever generated", () => {
    for (const h of [reviewPB(), reviewMM()]) {
      for (const row of h.rows.slice(1)) {
        assert.equal(row.jackpotDisplay, null, `${row.drawDateIso} must carry no synthetic jackpot`);
      }
      /* Only the one real row has an advertised figure. */
      assert.equal(h.rows.filter((r) => r.jackpotDisplay !== null).length, 1);
    }
    /* And the module contains no winner, prize or retailer field at all. */
    assert.doesNotMatch(src("lib/flagship/flagshipReviewFixture.ts"), /winner:|prizeDisplay:|retailer:/);
  });

  test("every row falls on a real draw night and inside the current rule era", () => {
    for (const cfg of FLAGSHIP_GAMES) {
      const h = buildReviewHistory(cfg);
      const nights = new Set(drawNightsOf(cfg));
      const era = cfg.ruleEras.find((e) => e.effectiveTo === null)!;
      for (const row of h.rows) {
        assert.ok(nights.has(row.drawDay), `${row.drawDateIso} (${row.drawDay}) is not a ${cfg.gameLabel} draw night`);
        if (era.effectiveFrom) {
          assert.ok(row.drawDateIso >= era.effectiveFrom, `${row.drawDateIso} predates the current rule era`);
        }
      }
      assert.equal(h.eraEffectiveFrom, era.effectiveFrom);
    }
  });

  test("the two games get genuinely different series lengths, because their eras differ", () => {
    const pb = reviewPB();
    const mm = reviewMM();
    /* Powerball's era opened in 2015, so it fills the cap. Mega Millions' opened in April 2025, so it cannot. */
    assert.equal(pb.rows.length, MAX_REVIEW_DRAWS);
    assert.ok(mm.rows.length < MAX_REVIEW_DRAWS);
    assert.ok(mm.rows.length > 60, "Mega Millions still has a usable series");
  });

  test("weekdays are computed arithmetically, with no Date parsing", () => {
    assert.equal(weekdayOf("2026-07-08"), "Wed");
    assert.equal(weekdayOf("2026-07-07"), "Tue");
    assert.equal(weekdayOf("2000-02-29"), "Tue");
    assert.equal(weekdayOf("1999-12-31"), "Fri");
    assert.deepEqual(drawNightsOf(PB()), ["Mon", "Wed", "Sat"]);
    assert.deepEqual(drawNightsOf(MM()), ["Tue", "Fri"]);
  });

  test("the series is deterministic — two builds produce identical rows", () => {
    assert.deepEqual(JSON.stringify(reviewPB().rows), JSON.stringify(reviewPB().rows));
    assert.doesNotMatch(src("lib/flagship/flagshipReviewFixture.ts"), /Math\.random\(|getRandomValues/);
  });

  test("the fixture's rows are all tagged as review rows in the DATA", () => {
    const h = reviewPB();
    assert.equal(h.rows[0].provenance, "productionFeed");
    assert.ok(h.rows.slice(1).every((r) => r.provenance === "synthetic/internal-review"));
    assert.equal(h.provenance.synthetic, h.rows.length - 1);
  });

  test("rows carry precomputed shape, including repeats from the drawing before", () => {
    const rows = reviewPB().rows;
    for (const r of rows.slice(0, 20)) {
      assert.equal(r.sum, r.main.reduce((a, b) => a + b, 0));
      assert.equal(r.oddCount, r.main.filter((v) => v % 2 === 1).length);
      assert.equal(r.lowCount, r.main.filter((v) => v <= 34).length);
    }
    /* At least one drawing in 520 repeats a number from the one before it — the axis is genuinely exercised. */
    assert.ok(rows.some((r) => r.repeatsFromPrevious.length > 0));
    assert.ok(rows.some((r) => r.longestRun >= 2));
  });
});

/* ══════════════════════════════════════════════════════════════════ explorer */

describe("LRG-FLAGSHIP-003: the Historical Draw Explorer searches history", () => {
  /* Engine proof, over the test fixture's long series. What a reader sees is asserted in the FGP-008 block. */
  const rows = () => reviewPB().rows;

  test("with no filter it returns the whole series, newest first", () => {
    const r = searchDraws(rows(), EMPTY_FILTER, "Powerball");
    assert.equal(r.matchCount, rows().length);
    assert.equal(r.searchedCount, rows().length);
    assert.ok(r.shown <= r.limit);
    assert.ok(r.rows[0].drawDateIso > r.rows[1].drawDateIso, "newest first");
  });

  test("it searches EVERY drawing, not just the latest", () => {
    const all = rows();
    /* Pick a number from a drawing deep in the series and prove the search reaches it. */
    const deep = all[200];
    const target = deep.main[0];
    const r = searchDraws(all, { ...EMPTY_FILTER, includeMain: [target] }, "Powerball", 1000);
    assert.ok(r.matchCount > 1, "a single number appears in many drawings");
    assert.ok(r.rows.some((x) => x.drawDateIso === deep.drawDateIso), "a drawing 200 back is reachable");
    /* And the result is not merely the latest drawing repeated. */
    assert.notEqual(r.matchCount, 1);
  });

  test("every filter axis narrows real rows", () => {
    const all = rows();
    const axes: { name: string; filter: Partial<typeof EMPTY_FILTER> }[] = [
      { name: "includeMain", filter: { includeMain: [all[0].main[0]] } },
      { name: "together", filter: { together: [all[0].main[0], all[0].main[1]] } },
      { name: "special", filter: { special: all[0].special } },
      { name: "fromIso", filter: { fromIso: all[100].drawDateIso } },
      { name: "toIso", filter: { toIso: all[100].drawDateIso } },
      { name: "drawDays", filter: { drawDays: ["Mon"] } },
      { name: "hasRepeat", filter: { hasRepeat: true } },
      { name: "minConsecutive", filter: { minConsecutive: 2 } },
      { name: "oddCount", filter: { oddCount: 5 } },
      { name: "lowCount", filter: { lowCount: 5 } },
      { name: "sumMin", filter: { sumMin: 200 } },
      { name: "sumMax", filter: { sumMax: 100 } },
      { name: "productionOnly", filter: { productionOnly: true } },
    ];
    for (const a of axes) {
      const r = searchDraws(all, { ...EMPTY_FILTER, ...a.filter }, "Powerball", 1000);
      assert.ok(r.matchCount < all.length, `${a.name} must narrow the set`);
      assert.ok(r.matchCount >= 0);
    }
    /* The multiplier axis only applies to a game that draws one. */
    const withMult = searchDraws(all, { ...EMPTY_FILTER, multiplier: 2 }, "Powerball", 1000);
    assert.ok(withMult.matchCount < all.length);
  });

  test("filters compose with AND, and every matched row really satisfies them", () => {
    const all = rows();
    const filter = { ...EMPTY_FILTER, oddCount: 3, minConsecutive: 2, drawDays: ["Sat"] };
    const r = searchDraws(all, filter, "Powerball", 1000);
    for (const row of r.rows) {
      assert.equal(row.oddCount, 3);
      assert.ok(row.longestRun >= 2);
      assert.equal(row.drawDay, "Sat");
    }
  });

  test("productionOnly isolates exactly the real published drawing", () => {
    const r = searchDraws(rows(), { ...EMPTY_FILTER, productionOnly: true }, "Powerball", 1000);
    assert.equal(r.matchCount, 1);
    assert.equal(r.rows[0].provenance, "productionFeed");
    assert.equal(r.productionMatchCount, 1);
  });

  test("active filters are described, and each chip clears only its own axis", () => {
    const f = { ...EMPTY_FILTER, includeMain: [7, 23], special: 5, oddCount: 3, hasRepeat: true };
    const chips = activeFilterChips(f, "Powerball");
    assert.equal(chips.length, 4);
    assert.ok(chips.some((c) => c.label === "Includes 7, 23"));
    assert.ok(chips.some((c) => c.label === "Powerball 5"));
    const cleared = clearFilterKey(f, "special");
    assert.equal(cleared.special, null);
    assert.deepEqual(cleared.includeMain, [7, 23], "clearing one axis leaves the others");
    /* Every chip key is clearable. */
    for (const c of chips) assert.notDeepEqual(clearFilterKey(f, c.key), f);
  });

  test("an impossible combination returns zero with a real count, not an error", () => {
    const r = searchDraws(rows(), { ...EMPTY_FILTER, sumMin: 400, sumMax: 401 }, "Powerball", 1000);
    assert.equal(r.matchCount, 0);
    assert.equal(r.rows.length, 0);
    assert.ok(r.searchedCount > 0, "it still reports how many were searched");
  });

  test("similar drawings are structural, and never include the drawing itself", () => {
    const all = rows();
    const similar = similarDraws(all[0], all, 5);
    assert.equal(similar.length, 5);
    assert.ok(similar.every((x) => x.row.drawDateIso !== all[0].drawDateIso));
    assert.ok(similar[0].score >= similar[4].score, "best match first");
    /* And "show similar" hands the explorer a filter reproducing that shape. */
    const f = filterLikeDraw(all[0]);
    assert.equal(f.oddCount, all[0].oddCount);
    assert.equal(f.lowCount, all[0].lowCount);
    const r = searchDraws(all, f, "Powerball", 1000);
    assert.ok(r.matchCount >= 1);
  });

  test("the explorer is compact by default and expands on request", () => {
    /* The founder's revision: *"Do not show a huge table too early. Default state should be compact."* */
    const s2 = code("components/flagship/tools/FlagshipExplorerSection.tsx");
    assert.match(s2, /export const COMPACT_ROWS = 6/);
    assert.match(s2, /const \[expanded, setExpanded\] = useState\(false\)/);
    assert.match(s2, /const limit = expanded \? EXPLORER_PAGE_SIZE : COMPACT_ROWS/);
    /* The filter panel is collapsed until asked for. */
    assert.match(s2, /lcfg-filterdisclosure/);
    assert.match(s2, /Show more matches/);

    /* And compactness never misrepresents the size of the result: the COUNT is the full match count. */
    const all = reviewPB().rows;
    const compact = searchDraws(all, EMPTY_FILTER, "Powerball", 6);
    assert.equal(compact.rows.length, 6);
    assert.equal(compact.matchCount, all.length, "the count is never truncated with the table");
    assert.equal(compact.shown, 6);
  });
});

/* ══════════════════════════════════════════════════════════════════ stats lab */

describe("LRG-FLAGSHIP-003: the Stats Lab is computed and wired to the explorer", () => {
  test("Powerball has every view available over a full series", () => {
    const views = labFor(PB());
    assert.equal(reviewPB().rows.length, MAX_REVIEW_DRAWS);
    assert.equal(views.filter((v) => v.available).length, STAT_VIEWS.length);
    for (const view of views) {
      assert.ok(view.available, `${view.definition.key} must compute`);
      assert.ok(view.rows.length > 0, `${view.definition.key} must produce rows`);
    }
  });

  test("EVERY stat row carries the filter that opens the drawings behind it", () => {
    const model = modelPB();
    const rows = model.history.rows;
    for (const view of model.stats.views) {
      for (const r of view.rows) {
        const found = searchDraws(rows, r.filter, "Powerball", 1000);
        assert.ok(
          found.matchCount > 0,
          `${view.definition.key} row "${r.label}" must open at least one drawing`,
        );
        /* For the counting views the filter reproduces the count exactly. */
        if (["frequency", "pairs", "triples", "odd-even", "high-low", "draw-day"].includes(view.definition.key)) {
          assert.equal(
            found.matchCount,
            r.count,
            `${view.definition.key} row "${r.label}" count must equal its filter's match count`,
          );
        }
      }
    }
  });

  test("frequency and gaps agree with the series", () => {
    const rows = reviewPB().rows;
    const views = labFor(PB());
    const freq = views.find((v) => v.definition.key === "frequency")!;
    const top = freq.rows[0];
    const actual = rows.filter((r) => r.main.includes(Number(top.label))).length;
    assert.equal(top.count, actual);

    const overdue = views.find((v) => v.definition.key === "overdue")!;
    const worst = overdue.rows[0];
    const at = rows.findIndex((r) => r.main.includes(Number(worst.label)));
    assert.equal(worst.count, at === -1 ? rows.length : at);
    assert.ok(overdue.rows[0].count >= overdue.rows[1].count, "longest gap first");
  });

  test("Mega Millions' shorter era genuinely disables the deepest view", () => {
    /* Over a FULL series: Powerball's era reaches the cap, Mega Millions' April-2025 era does not. */
    const views = labFor(MM());
    const triples = views.find((v) => v.definition.key === "triples")!;
    assert.equal(triples.available, false);
    assert.match(triples.reason!, /needs at least 260/);
    assert.ok(views.filter((v) => v.available).length >= 6, "most views still work for Mega Millions");
    assert.ok(views.find((v) => v.definition.key === "frequency")!.available);
    assert.ok(reviewMM().rows.length < reviewPB().rows.length);
  });

  test("the method statement names the period, the count and the era — with no synthetic split", () => {
    const m = modelPB().stats.method;
    assert.match(m, /rule era/);
    assert.match(m, /no drawing outside this era is included/);
    /* It counts drawings; it does not call a preview row published. */
    assert.doesNotMatch(m, /\d+ published drawings/);
    assert.match(m, /preview drawings used for layout and tool testing/);
    assert.doesNotMatch(m, /internal review rows/, "internal vocabulary stays out of the consumer register");
    assert.match(
      statsMethod("X", [], "era", { productionFeed: 0, synthetic: 0 }, "consumer"),
      /No published X drawing/,
    );
    /* The internal register says it the other way, for a founder review build. */
    assert.match(
      statsMethod("X", reviewPB().rows, "era", reviewPB().provenance, "internalReview"),
      /internal review rows/,
    );
  });

  test("every view declares a threshold and a reason", () => {
    assert.equal(STAT_VIEWS.length, 10);
    assert.ok(STAT_VIEWS.every((v) => v.minDraws > 0 && v.thresholdReason.length > 0 && v.measureLabel.length > 0));
    /* A short series disables the deep views rather than computing noise. */
    const short = statsLab({ rows: modelPB().history.rows.slice(0, 20), mainPool: 69, mainCount: 5, drawNights: [] });
    assert.ok(short.every((v) => !v.available));
  });
});

/* ══════════════════════════════════════════════════════════════════ checker */

describe("LRG-FLAGSHIP-002: the ticket check is deterministic and public", () => {
  const matrix = {
    mainCount: 5, mainMin: 1, mainMax: 69,
    specialLabel: "Powerball", specialMin: 1, specialMax: 26,
  };
  const drawn = { main: [12, 29, 37, 43, 55], special: 18 };

  test("validation reports every problem, not just the first", () => {
    const errors = validateLine({ main: [1, 1, 200], special: 99 }, matrix);
    assert.ok(errors.length >= 3);
    assert.equal(validateLine({ main: [1, 2, 3, 4, 5], special: 6 }, matrix).length, 0);
  });

  test("the main group is unordered and the special ball is a separate pool", () => {
    /* Same values, different order — identical outcome. */
    const a = checkLine({ main: [55, 43, 37, 29, 12], special: 18 }, drawn, matrix);
    assert.equal(a.mainMatched, 5);
    assert.equal(a.specialMatched, true);
    assert.equal(a.matchLabel, "5 + Powerball");

    /* A white 18 does not match the Powerball 18. */
    const b = checkLine({ main: [18, 1, 2, 3, 4], special: 1 }, drawn, matrix);
    assert.equal(b.mainMatched, 0);
    assert.equal(b.specialMatched, false);
    assert.equal(b.matchLabel, "No match");
  });

  test("a partial match names the numbers that matched", () => {
    const r = checkLine({ main: [12, 29, 1, 2, 3], special: 18 }, drawn, matrix, {
      multiplierMode: "independentlySelected",
      multiplierLabel: "Power Play",
    });
    assert.equal(r.mainMatched, 2);
    assert.deepEqual(r.matchedValues, [12, 29]);
    assert.equal(r.matchLabel, "2 + Powerball");
    assert.match(r.statement, /12, 29/);
    assert.match(r.statement, /Without Power Play on the ticket/);

    const bought = checkLine({ main: [12, 29, 1, 2, 3], special: 18, multiplierBought: true }, drawn, matrix, {
      multiplierMode: "independentlySelected",
      multiplierLabel: "Power Play",
    });
    assert.match(bought.statement, /carries Power Play/);
  });

  test("a built-in multiplier is described as printed on the ticket, never looked up", () => {
    const r = checkLine({ main: [12, 1, 2, 3, 4], special: 1 }, drawn, matrix, {
      multiplierMode: "builtIn",
      multiplierLabel: "Multiplier",
    });
    assert.match(r.statement, /printed on your own ticket/);
  });

  test("an incomplete line returns errors and no match claim", () => {
    const r = checkLine({ main: [1, 2], special: null }, drawn, matrix);
    assert.equal(r.complete, false);
    assert.equal(r.matchLabel, "");
    assert.equal(r.statement, "");
    assert.ok(r.errors.length > 0);
  });

  test("the boundary is always present, and no prize is ever stated", () => {
    const r = checkLine({ main: [12, 29, 37, 43, 55], special: 18 }, drawn, matrix);
    assert.match(r.boundary, /Only the lottery that sold the ticket can validate it/);
    assert.doesNotMatch(JSON.stringify(r), /\$/);
  });

  test("the checker is public and its locked extras render after the outcome", () => {
    const s = code("components/flagship/tools/FlagshipCheckerSection.tsx");
    assert.ok(
      s.indexOf('className="lcfg-outcome"') < s.indexOf("<FlagshipLocked"),
      "the result must precede the sign-in ask — the Constitution's value-before-engagement rule",
    );
    assert.doesNotMatch(s, /\bdisabled\b/);
  });

  test("all three history modes exist and really search different depths", () => {
    assert.deepEqual(CHECK_MODES.map((m) => m.key), ["latest", "last10", "all"]);
    const rows = reviewPB().rows;
    const draws = rows.map((r) => ({
      drawDateIso: r.drawDateIso, main: r.main, special: r.special, secondary: r.secondary,
      provenance: r.provenance,
    }));
    const line = { main: [12, 29, 37, 43, 55], special: 18 };

    const latest = checkAgainstHistory(line, draws, matrix, "latest");
    const last10 = checkAgainstHistory(line, draws, matrix, "last10");
    const all = checkAgainstHistory(line, draws, matrix, "all");

    assert.equal(latest.searched, 1);
    assert.equal(last10.searched, 10);
    assert.equal(all.searched, rows.length);
    /* Scanning more drawings cannot find fewer matches. */
    assert.ok(all.hits.length >= last10.hits.length);
    assert.ok(last10.hits.length >= latest.hits.length);
    /* The real drawing is a full match, and it is found in every mode. */
    assert.equal(latest.hits[0].outcome.matchLabel, "5 + Powerball");
    assert.equal(latest.productionHits, 1);
    assert.match(all.statement, /Across all \d+ published drawings/);
  });

  test("a history scan reports only drawings where something matched, but counts the whole scan", () => {
    const rows = reviewPB().rows;
    const draws = rows.map((r) => ({
      drawDateIso: r.drawDateIso, main: r.main, special: r.special, secondary: r.secondary,
      provenance: r.provenance,
    }));
    const r = checkAgainstHistory({ main: [1, 2, 3, 4, 5], special: 1 }, draws, matrix, "all");
    assert.equal(r.searched, rows.length);
    assert.ok(r.hits.length < rows.length, "only interesting drawings are listed");
    for (const h of r.hits) {
      assert.ok(
        h.outcome.mainMatched > 0 ||
          h.outcome.specialMatched === true ||
          (h.secondaryOutcome?.mainMatched ?? 0) > 0 ||
          h.secondaryOutcome?.specialMatched === true,
      );
    }
    assert.ok(r.best === null || r.best.outcome.mainMatched >= 1);
  });

  test("an invalid line is rejected before any scan runs", () => {
    const r = checkAgainstHistory({ main: [1], special: null }, [], matrix, "all");
    assert.equal(r.complete, false);
    assert.equal(r.searched, 0);
    assert.ok(r.errors.length > 0);
  });
});

/* ══════════════════════════════════════════════════════════════════ generator */

describe("LRG-FLAGSHIP-002: the generator is honest about what it is", () => {
  const matrix = {
    mainCount: 5, mainMin: 1, mainMax: 69,
    specialLabel: "Powerball", specialMin: 1, specialMax: 26,
  };

  test("it produces valid, distinct lines of the right shape", () => {
    const r = generateLines(matrix, {
      mode: "random", lockedMain: [], lockedSpecial: null, setCount: 3, targetOdd: null, targetLow: null,
      excludeRecentDraws: 0, avoidDateHeavy: false,
    });
    assert.equal(r.lines.length, 3);
    for (const line of r.lines) {
      assert.equal(line.main.length, 5);
      assert.equal(new Set(line.main).size, 5);
      assert.ok(line.main.every((v) => v >= 1 && v <= 69));
      assert.ok(line.special !== null && line.special >= 1 && line.special <= 26);
      assert.deepEqual(line.main, [...line.main].sort((a, b) => a - b));
      assert.equal(line.odd + line.even, 5);
      assert.equal(line.low + line.high, 5);
    }
  });

  test("kept numbers are honoured, and the set count is bounded", () => {
    const r = generateLines(matrix, {
      mode: "random", lockedMain: [7, 23], lockedSpecial: 9, setCount: 99, targetOdd: null, targetLow: null,
      excludeRecentDraws: 0, avoidDateHeavy: false,
    });
    assert.equal(r.lines.length, 5, "MAX_SETS bounds the public tool");
    for (const line of r.lines) {
      assert.ok(line.main.includes(7) && line.main.includes(23));
      assert.equal(line.special, 9);
    }
    assert.match(r.note, /keeping 7, 23/);
  });

  test("balanced mode reaches the requested shape", () => {
    const r = generateLines(matrix, {
      mode: "balanced", lockedMain: [], lockedSpecial: null, setCount: 3, targetOdd: 3, targetLow: 2,
      excludeRecentDraws: 0, avoidDateHeavy: false,
    });
    assert.equal(r.relaxed, null);
    for (const line of r.lines) {
      assert.equal(line.odd, 3);
      assert.equal(line.low, 2);
    }
  });

  test("an impossible balance relaxes with an explanation rather than looping or lying", () => {
    const r = generateLines(matrix, {
      /* Four even numbers are kept, so at most one of the five can be odd — five odd is unreachable. */
      mode: "balanced", lockedMain: [2, 4, 6, 8], lockedSpecial: null, setCount: 1, targetOdd: 5, targetLow: null,
      excludeRecentDraws: 0, avoidDateHeavy: false,
    });
    assert.ok(r.relaxed, "it reports that the preferences could not be met");
    assert.match(r.relaxed!, /could not all be met/);
    assert.equal(r.lines.length, 1, "the lines are still returned, unfiltered");
    assert.ok(r.lines[0].main.includes(2) && r.lines[0].main.includes(8), "kept numbers survive");
  });

  test("locks are validated before any line is drawn", () => {
    assert.ok(validateLocks(
      { mode: "random", lockedMain: [1, 1], lockedSpecial: null, setCount: 1, targetOdd: null, targetLow: null,
        excludeRecentDraws: 0, avoidDateHeavy: false },
      matrix,
    ).some((e) => /different/.test(e)));
    assert.ok(validateLocks(
      { mode: "random", lockedMain: [], lockedSpecial: 99, setCount: 1, targetOdd: null, targetLow: null,
        excludeRecentDraws: 0, avoidDateHeavy: false },
      matrix,
    ).length > 0);
    assert.equal(validateLocks(
      { mode: "random", lockedMain: [1, 2], lockedSpecial: 3, setCount: 1, targetOdd: 2, targetLow: 2,
        excludeRecentDraws: 0, avoidDateHeavy: false },
      matrix,
    ).length, 0);
  });

  test("the birthday note is about sharing a prize, never about chances", () => {
    const dateHeavy = { main: [3, 7, 12, 21, 28], special: 5, odd: 3, even: 2, low: 5, high: 0, dateRangeCount: 5 };
    const note = dateRangeNote(dateHeavy, 69)!;
    assert.ok(note);
    assert.match(note, /does not make the line less likely/);
    assert.match(note, /more often shared/);
    assert.equal(containsPredictionClaim(note), null);
    /* A line with a number above 31 gets no note. */
    assert.equal(
      dateRangeNote({ ...dateHeavy, main: [3, 7, 12, 21, 40], dateRangeCount: 4 }, 69),
      null,
    );
  });

  test("excluding recent winners really excludes them", () => {
    const rows = modelPB().history.rows;
    const recent = rows.map((r) => r.main);
    const banned = new Set(recent.slice(0, 3).flat());
    const r = generateLines(
      matrix,
      {
        mode: "random", lockedMain: [], lockedSpecial: null, setCount: 5,
        targetOdd: null, targetLow: null, excludeRecentDraws: 3, avoidDateHeavy: false,
      },
      recent,
    );
    for (const line of r.lines) {
      for (const v of line.main) assert.ok(!banned.has(v), `${v} was drawn in the last 3 drawings`);
    }
    assert.match(r.note, /avoiding the \d+ numbers drawn in the last 3 drawings/);
    /* And it says plainly that this is a preference, not an advantage. */
    assert.match(r.note, /exactly as likely as any other/);
    assert.equal(containsPredictionClaim(r.note), null);
  });

  test("a kept number beats an exclusion, because the reader asked for it explicitly", () => {
    const rows = modelPB().history.rows;
    const recent = rows.map((r) => r.main);
    const keep = recent[0][0];
    const r = generateLines(
      matrix,
      {
        mode: "random", lockedMain: [keep], lockedSpecial: null, setCount: 3,
        targetOdd: null, targetLow: null, excludeRecentDraws: 5, avoidDateHeavy: false,
      },
      recent,
    );
    for (const line of r.lines) assert.ok(line.main.includes(keep));
  });

  test("avoiding a date-heavy line guarantees a number above 31", () => {
    const r = generateLines(matrix, {
      mode: "balanced", lockedMain: [], lockedSpecial: null, setCount: 5,
      targetOdd: null, targetLow: null, excludeRecentDraws: 0, avoidDateHeavy: true,
    });
    assert.equal(r.relaxed, null);
    for (const line of r.lines) assert.ok(line.main.some((v) => v > 31));
  });

  test("the boundary states both required sentences", () => {
    assert.match(GENERATOR_BOUNDARY, /does not change the odds/);
    assert.match(GENERATOR_BOUNDARY, /No system can predict winning numbers/);
  });

  test("no biased fallback exists if the platform has no CSPRNG", () => {
    assert.doesNotMatch(code("lib/flagship/flagshipGenerator.ts"), /Math\.random/);
    assert.match(code("lib/flagship/flagshipGenerator.ts"), /getRandomValues/);
  });
});

/* ══════════════════════════════════════════════════════════════════ AI */

describe("LRG-FLAGSHIP-002: AI is contextual, labelled, and claims no prediction", () => {
  const inputsFor = (slug: "powerball" | "mega-millions") => {
    const m = buildFlagshipPageModel(slug)!;
    return {
      config: m.config,
      draw: m.result
        ? {
            main: m.result.groups.find((g) => g.visualRole === "main")!.values,
            special: m.result.groups.find((g) => g.visualRole === "special")?.values[0] ?? null,
            specialLabel: m.config.specialLabel,
            mainPool: m.config.matrix.mainPool,
          }
        : null,
      drawDateDisplay: m.result?.drawDateDisplay ?? null,
      nextDrawDateDisplay: m.result?.nextDrawDateDisplay ?? null,
      jackpotDisplay: m.result?.jackpotDisplay ?? null,
      nextJackpotDisplay: m.result?.nextJackpotDisplay ?? null,
      contentConnected: m.content.connected,
      contentItems: {
        news: m.content.news.items.map((i) => ({
          title: i.title, publishedIso: i.publishedIso, provenance: i.provenance,
        })),
        forum: m.content.community.items.map((i) => ({
          title: i.title, replyCount: i.replyCount, provenance: i.provenance,
        })),
      },
      displayMode: m.displayMode,
      previous: m.history.rows[1]
        ? {
            dateIso: m.history.rows[1].drawDateIso,
            main: m.history.rows[1].main,
            special: m.history.rows[1].special,
          }
        : null,
      history: { total: m.history.provenance.total, productionFeed: m.history.provenance.productionFeed },
    };
  };

  test("the prediction scanner catches claims and clears corrections", () => {
    assert.ok(containsPredictionClaim("These numbers are due to hit."));
    assert.ok(containsPredictionClaim("Our model predicts the next draw."));
    assert.ok(containsPredictionClaim("This guarantees a win."));
    assert.ok(containsPredictionClaim("Playing this way increases your chances."));
    /* Negated corrections — the copy the Constitution REQUIRES — must pass. */
    assert.equal(containsPredictionClaim("No system can predict winning numbers."), null);
    assert.equal(containsPredictionClaim("There is no such thing as an overdue number."), null);
    assert.equal(containsPredictionClaim("It does not increase your chances."), null);
    assert.doesNotThrow(() => assertNoPredictionClaim("boundary", AI_SURFACE_BOUNDARY));
    assert.throws(() => assertNoPredictionClaim("bad", "These numbers are due to hit."));
  });

  test("no user-visible copy on either page contains a prediction claim", () => {
    for (const slug of ["powerball", "mega-millions"] as const) {
      const model = buildFlagshipPageModel(slug)!;
      const strings = [
        ...aiCopyStrings(inputsFor(slug)),
        model.insightBoundary,
        model.freshness.label,
        model.odds.method,
        model.odds.prizeGap.why,
        model.stats.method,
        ENGAGEMENT_LOCKED_NOTE,
        GENERATOR_BOUNDARY,
        ...model.insights.flatMap((i) => [i.label, i.value, i.detail]),
        ...model.tools.flatMap((t) => [t.label, t.purpose, t.note ?? ""]),
        ...model.engagement.flatMap((e) => [e.label, e.benefit, e.frequencyNote]),
        ...model.gaps.flatMap((g) => [g.what, g.why]),
        ...model.faq.flatMap((q) => [q.question, ...q.answer]),
        model.ticketPriceDisplay,
        ...STAT_VIEWS.flatMap((v) => [v.label, v.purpose, v.thresholdReason]),
        ...model.stats.views.map((v) => v.reason ?? ""),
        ...model.stats.views.flatMap((v) => v.rows.map((r) => r.label)),
        model.historyDisclosure,
      ];
      for (const s of strings) assertNoPredictionClaim(`${slug} copy`, s);
    }
  });

  test("every founder-requested prompt chip exists, on both pages", () => {
    for (const slug of ["powerball", "mega-millions"] as const) {
      const keys = aiSurfaces(inputsFor(slug)).map((s) => s.key);
      for (const required of [
        "explain-draw", "what-changed", "explain-multiplier", "jackpot-won", "check-ticket", "explain-odds",
        "summarise-history", "summarise-matches", "explain-stats-view", "explain-jackpot-movement",
        "summarise-news", "community-pulse",
      ]) {
        assert.ok(keys.includes(required), `${slug} must offer "${required}"`);
      }
    }
  });

  test("the six quick-action chips lead, in the founder's order", () => {
    const lead = modelPB().ai.slice(0, 6).map((s2) => s2.key);
    assert.deepEqual(lead, [
      "explain-draw",
      "check-ticket",
      "summarise-history",
      "explain-jackpot-movement",
      "explain-odds",
      "community-pulse",
    ]);
    /* FGP-009: it describes the connected series and counts the preview rows instead of calling them published. */
    const summary = modelPB().ai.find((s2) => s2.key === "summarise-history")!.deterministicAnswer!.join(" ");
    assert.match(summary, /Powerball drawings are connected here/);
    assert.match(summary, /preview drawings used for layout and tool testing/);
    assert.doesNotMatch(summary, /internal review rows/);
    assert.doesNotMatch(summary, /Every one of them comes from the production results feed/);
  });

  test("AI entries are attached to the sections they belong to, not one floating surface", () => {
    const surfaces = modelPB().ai;
    const sections = new Set(surfaces.map((s) => s.section));
    assert.ok(sections.size >= 5, "AI entries span several sections");
    assert.ok(aiSurfacesFor(surfaces, "FG-01").length >= 3);
    assert.ok(aiSurfacesFor(surfaces, "FG-05").length >= 1);
    assert.ok(aiSurfacesFor(surfaces, "FG-08").length >= 1, "the explorer has its own AI entry");
    assert.ok(aiSurfacesFor(surfaces, "FG-07B").length >= 1, "the Stats Lab has its own AI entry");
    assert.ok(aiSurfacesFor(surfaces, "FG-02").length >= 1, "the ticket checker has its own AI entry");
    assert.ok(aiSurfacesFor(surfaces, "FG-09").length >= 1, "the jackpot tracker has its own AI entry");
    assert.ok(aiSurfacesFor(surfaces, "FG-12").length >= 1);
    assert.ok(aiSurfacesFor(surfaces, "FG-13").length >= 1);
    /* Not one chatbot at the bottom: entries span at least seven sections. */
    assert.ok(sections.size >= 7);
    /* Every entry declares its grounding and its boundary. */
    for (const s of surfaces) {
      assert.ok(s.grounding.length > 0, `${s.key} must declare its grounding`);
      assert.ok(s.boundary.length > 0, `${s.key} must declare its boundary`);
    }
  });

  test("computed answers exist where the page holds the facts, and gaps are stated where it does not", () => {
    const surfaces = modelPB().ai;
    const byKey = new Map(surfaces.map((s) => [s.key, s]));
    assert.ok(byKey.get("explain-draw")!.deterministicAnswer!.length > 0);
    assert.ok(byKey.get("explain-odds")!.deterministicAnswer!.join(" ").includes("292,201,338"));
    assert.ok(byKey.get("check-ticket")!.deterministicAnswer!.length > 0);
    /* "What changed since the last drawing" needs a drawing BEFORE the latest one, which the connected series
       supplies. It states plainly that the earlier drawing is preview data rather than passing it off as real. */
    const changed = byKey.get("what-changed")!.deterministicAnswer!.join(" ");
    assert.ok(changed.length > 0);
    assert.match(changed, /the one before it is preview data/);
    assert.doesNotMatch(changed, /internal review row/);
    /* The jackpot answer explains annuity against cash without inventing a cash figure. */
    const jm = byKey.get("explain-jackpot-movement")!.deterministicAnswer!.join(" ");
    assert.match(jm, /annuity/);
    assert.match(jm, /cash value/);
    assert.doesNotMatch(jm, /\$\d[\d,]* cash/);
    /* Winner information is never inferred. */
    const won = byKey.get("jackpot-won")!.deterministicAnswer!.join(" ");
    assert.match(won, /holds no winner information/);
    /* It declines to answer, and asserts no outcome either way. */
    assert.match(won, /cannot tell you whether/);
    assert.doesNotMatch(won, /nobody won|no one won|rolled over|there (was|were) no winner/i);
    /* "…cannot tell you whether the jackpot was won" is the decline, not a claim; a bare assertion is. */
    assert.doesNotMatch(won, /(?<!whether )the jackpot was (not )?won/i);
    /* Content questions exist on both paths. Which answer they carry follows whether content is connected. */
    assert.ok(byKey.get("summarise-news")!.deterministicAnswer!.length > 0);
    assert.ok(byKey.get("community-pulse")!.deterministicAnswer!.length > 0);
  });

  test("a computed answer is never described as AI, in either direction (FD-DAT-20)", () => {
    /* §C2 moved the answer BLOCK into the shared `AnswerSurface`, which the State page renders too — so the
       FD-DAT-20 guarantee is now asserted in the one place it lives rather than per family. */
    const surface = src("components/shell/AnswerSurface.tsx");
    assert.match(surface, /data-ai-answer="computed"/);
    /* And the answer is labelled by provenance, with no AI badge on the computed branch. */
    assert.match(surface, /data-answer-label="provenance"/);
    assert.doesNotMatch(src("lib/ai/answerSurface.ts"), /ANSWER_LABEL =\s*\n?\s*"[^"]*\bAI\b/);
    /* No AI badge on the computed branch, and no "an AI did not write this" disclaimer either. */
    assert.doesNotMatch(src("lib/flagship/flagshipAi.ts"), /COMPUTED_ANSWER_LABEL = "[^"]*\bAI\b/);
  });

  test("no AI execution surface is shipped", () => {
    /* `FD-DAT-02` gates execution behind a free Account; none exists, so nothing calls a provider. */
    for (const f of [
      "lib/flagship/flagshipAi.ts",
      "components/flagship/tools/FlagshipAiConsole.tsx",
      /* §C2: the shared surface is in scope for the same rule. */
      "components/shell/AnswerSurface.tsx",
      "lib/ai/answerSurface.ts",
    ]) {
      assert.doesNotMatch(src(f), /fetch\(|anthropic|openai|\/api\//i);
    }
    assert.match(src("components/shell/AnswerSurface.tsx"), /data-ai-connected="false"/);
  });
});

/* ══════════════════════════════════════════════════════════════════ FAQ and reference */

describe("LRG-FLAGSHIP-004: the FAQ is generated from the page's own facts", () => {
  test("every game gets a concise FAQ, and it cannot contradict the page", () => {
    for (const cfg of FLAGSHIP_GAMES) {
      const faq = flagshipFaq(cfg);
      assert.ok(faq.length >= 8, `${cfg.gameSlug} must answer the common questions`);
      for (const q of faq) {
        assert.ok(q.question.endsWith("?"), `"${q.question}" must be a question`);
        assert.ok(q.answer.length > 0 && q.answer.every((a) => a.length > 0));
      }
      const byKey = new Map(faq.map((q) => [q.key, q]));
      /* The odds answer quotes the computed figure, not a remembered one. */
      assert.match(byKey.get("odds")!.answer.join(" "), new RegExp(jackpotOdds(cfg.matrix).display.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      /* The draw answer quotes the configured schedule. */
      assert.match(byKey.get("when")!.answer.join(" "), new RegExp(cfg.drawDays.value));
      /* The prediction answer is the required correction, and it survives the scanner. */
      assert.match(byKey.get("predict")!.answer.join(" "), /no system can predict winning numbers/i);
      for (const q of faq) assertNoPredictionClaim(`${cfg.gameSlug} faq`, [q.question, ...q.answer].join(" "));
    }
  });

  test("only Powerball gets the secondary-drawing question, from config", () => {
    assert.ok(flagshipFaq(PB()).some((q) => q.key === "secondary"));
    assert.equal(flagshipFaq(MM()).some((q) => q.key === "secondary"), false);
  });

  test("the FAQ is visible but no FAQPage schema is emitted while the page is noindex", () => {
    assert.match(src("components/flagship/sections/FlagshipEcosystem.tsx"), /lcfg-faqitem/);
    const json = JSON.stringify(flagshipPageGraph({ config: PB(), dateModified: null }));
    assert.doesNotMatch(json, /FAQPage/);
  });

  test("the odds section is compressed: headline rows visible, the full table behind a disclosure", () => {
    const s2 = code("components/flagship/sections/FlagshipRules.tsx");
    assert.match(s2, /const headline = odds\.rows\.filter/);
    assert.match(s2, /data-disclosure="all-odds"/);
    assert.match(s2, /Every possible match/);
    /* The full twelve rows are still reachable, not dropped. */
    assert.equal(modelPB().odds.rows.length, 12);
  });
});

/* ══════════════════════════════════════════════════════════════════ tagged content */

describe("LRG-FLAGSHIP-002: tagged content adapters", () => {
  test("the NEWS, FORUM and BLOG sources are all registered per kind", () => {
    /*
     * The News family (07/07A/07B) made the first REAL registration; the Community family (08A/08B/08C,
     * Conflict 41 FOUNDER AMENDMENT) made the forum one; the Blog family (Conflict 39) made the third.
     * Registration stays per kind — one source cannot empty its neighbours.
     */
    assert.equal(isContentConnected(), true);
    /* Blog resolves through the registered source to REAL /blog/{slug} destinations (Conflict 39). */
    const blog = taggedFeed("blog", "Powerball", 3);
    assert.ok(blog.items.length > 0);
    assert.equal(blog.unavailable, null);
    for (const item of blog.items) {
      assert.match(item.href, /^\/blog\/[a-z0-9-]+$/, "a blog item links to a real blog post route");
      assert.equal(item.provenance, "synthetic/internal-review");
      assert.ok(item.tags.includes("Powerball"));
    }
    /* News resolves through the registered source to REAL /news/{slug} destinations. */
    const news = taggedFeed("news", "Powerball", 3);
    assert.ok(news.items.length > 0);
    assert.equal(news.unavailable, null);
    for (const item of news.items) {
      assert.match(item.href, /^\/news\/[a-z0-9-]+$/, "a news item links to a real news article route");
      assert.equal(item.provenance, "synthetic/internal-review");
      assert.ok(item.tags.includes("Powerball"));
    }
    /* Forum resolves through the registered source to REAL /community/{slug} destinations. */
    const forum = taggedFeed("forum", "Powerball", 3);
    assert.ok(forum.items.length > 0);
    assert.equal(forum.unavailable, null);
    for (const item of forum.items) {
      assert.match(item.href, /^\/community\/[a-z0-9-]+$/, "a forum item links to a real forum entry route");
      assert.equal(item.provenance, "synthetic/internal-review");
      assert.ok(item.tags.includes("Powerball"));
    }
    /* All three page rails come from the registered sources now — the guides rail resolves to real
       /blog/{slug} destinations since the Conflict 39 registration replaced its BFF preview items. */
    for (const model of [modelPB(), modelMM()]) {
      assert.equal(model.content.connected, true);
      assert.ok(model.content.guides.items.length > 0);
      assert.equal(model.content.guides.unavailable, null);
      for (const item of model.content.guides.items) {
        assert.equal(item.provenance, "synthetic/internal-review");
        assert.match(item.href, /^\/blog\//);
        assert.ok(item.tags.includes(model.config.contentTag), "the tag contract holds on registered items");
      }
      for (const item of model.content.news.items) {
        assert.equal(item.provenance, "synthetic/internal-review");
        assert.match(item.href, /^\/news\//);
        assert.ok(item.tags.includes(model.config.contentTag), "the tag contract holds on registered items");
      }
      for (const item of model.content.community.items) {
        assert.equal(item.provenance, "synthetic/internal-review");
        assert.match(item.href, /^\/community\//);
        assert.ok(item.tags.includes(model.config.contentTag), "the tag contract holds on registered items");
      }
    }
  });

  test("no preview content item names a winner, a prize or a real person", () => {
    for (const model of [modelPB(), modelMM()]) {
      const items = [
        ...model.content.guides.items,
        ...model.content.news.items,
        ...model.content.community.items,
      ];
      for (const i of items) {
        const text = `${i.title} ${i.excerpt}`;
        /* No claimed prize amount, and no claim that a named person won anything. */
        assert.doesNotMatch(text, /\$[\d,]+/, `${i.id} must not state an amount`);
        assert.doesNotMatch(text, /\bwon\b|\bwinner\b|\bclaimed\b/i, `${i.id} must not report a win`);
      }
    }
  });

  test("guides, news and community render as ONE integrated module, not three stacked sections", () => {
    /* Comment-stripped: the module now EXPLAINS the merge in prose, and a raw-source count of `<section`
       cannot tell an explanation from an element (LRG-UX-SCHEMA-001 correction 8 added that note). */
    const s2 = code("components/flagship/sections/FlagshipEcosystem.tsx");
    /* One section element, three rails inside it. */
    assert.equal((s2.match(/<section/g) ?? []).length, 2, "one tagged-content section plus trust");
    assert.match(s2, /lcfg-railgrid/);
    assert.equal((s2.match(/<Rail\b/g) ?? []).length, 3);
    /* Both signed-in actions the revision names are present. */
    assert.match(s2, /key: "start-discussion"/);
    assert.match(s2, /key: "follow-topic"/);
    /* And the active-thread slot. */
    assert.match(s2, /data-panel="active-thread"/);
  });

  test("each page queries its own game tag, and the three kinds are distinct", () => {
    assert.equal(PB().contentTag, "Powerball");
    assert.equal(MM().contentTag, "Mega Millions");

    const pb = modelPB().content;
    assert.equal(pb.guides.tag, "Powerball");
    assert.equal(pb.news.tag, "Powerball");
    assert.equal(pb.community.tag, "Powerball");
    assert.deepEqual([pb.guides.kind, pb.news.kind, pb.community.kind], ["blog", "news", "forum"]);

    const mm = modelMM().content;
    assert.ok([mm.guides, mm.news, mm.community].every((f) => f.tag === "Mega Millions"));

    /* The feeds go through one adapter, so a component cannot hardcode a tag. */
    assert.equal(taggedFeed("forum", "Powerball").tag, "Powerball");
    assert.equal(flagshipContentFeeds("Mega Millions").news.tag, "Mega Millions");
    assert.doesNotMatch(
      src("components/flagship/sections/FlagshipEcosystem.tsx"),
      /"Powerball"|"Mega Millions"/,
      "no component may hardcode a content tag",
    );
  });

  test("no post, thread, member, reply or winner story is fabricated", () => {
    for (const f of [
      "lib/flagship/flagshipTaggedContent.ts",
      "components/flagship/sections/FlagshipEcosystem.tsx",
    ]) {
      const s = src(f);
      /* No constructed content item anywhere. */
      assert.doesNotMatch(s, /replyCount:\s*\d/);
      assert.doesNotMatch(s, /publishedIso:\s*"/);
      assert.doesNotMatch(s, /author:\s*"/);
    }
    /* The registered source list holds exactly the three adapters whose systems exist — News, the Community
       forum, and the Blog (Conflict 39). Their items come from the three BFF seams, whose shape assertions
       forbid fabricated winners, current-news claims and undisclosed fixtures on every read
       (`lib/news/bff/newsBff.ts`, `lib/community/bff/communityBff.ts`, `lib/blog/bff/blogBff.ts`). */
    assert.match(
      src("lib/flagship/flagshipTaggedContent.ts"),
      /const SOURCES: readonly TaggedContentSource\[\] = Object\.freeze\(\[\s*newsTaggedContentSource,\s*communityTaggedContentSource,\s*blogTaggedContentSource,\s*\]\)/,
    );
  });

  test("the adapter drops an item whose tag does not match the query", () => {
    /* Proven at the contract level: the filter is present and the limit is applied after it. */
    const s = src("lib/flagship/flagshipTaggedContent.ts");
    assert.match(s, /items\.filter\(\(i\) => i\.tags\.includes\(tag\)\)\.slice\(0, limit\)/);
  });
});

/* ══════════════════════════════════════════════════════════════════ signed-in gating */

describe("LRG-FLAGSHIP-002: signed-in capabilities are visible and locked", () => {
  test("every founder-listed gated feature exists across the tools", () => {
    const keys = allLockedCapabilities(PB()).map((c) => c.key);
    for (const required of [
      "save-ticket", "check-multiple", "auto-check", "win-alert", "label-sets",
      "save-sets", "batch", "compare-history", "name-sets",
      "save-view", "compare-saved", "export-snapshot", "ai-summarise-view",
    ]) {
      assert.ok(keys.includes(required), `the gated capability "${required}" must exist`);
    }
  });

  test("every founder-listed alert and personalisation control exists", () => {
    const keys = engagementOptions(PB()).map((o) => o.key);
    for (const required of [
      "jackpot-threshold", "draw-reminder", "result-alert", "favourite-numbers-alert", "weekly-digest",
      "follow-game", "follow-tag", "save-personalisation",
    ]) {
      assert.ok(keys.includes(required), `the control "${required}" must be visible`);
    }
    /* Each declares its own frequency — `FD-ACC-18`. */
    assert.ok(engagementOptions(MM()).every((o) => o.frequencyNote.length > 0));
    /* The options are generated from the config, so they name the right game and rhythm. */
    assert.match(engagementOptions(MM()).find((o) => o.key === "draw-reminder")!.frequencyNote, /Tuesday and Friday/);
    assert.match(engagementOptions(PB()).find((o) => o.key === "follow-tag")!.label, /Powerball/);
  });

  test("every gate is `signedIn` — the shared sign-in flow exists and is the destination", () => {
    /*
     * UPDATED DELIBERATELY under Conflict 37 (source-conflicts.md, 2026-08-11). This test used to pin
     * `signedInUnavailable` because no sign-in flow existed and nothing was allowed to claim one. The Tier-1
     * founder authorization shipped the real shared flow (/login, review data layer), so the honest gate for
     * every account-backed capability is now `signedIn`.
     */
    assert.ok(allLockedCapabilities(PB()).every((c) => c.gate === "signedIn"));
    assert.ok(engagementOptions(MM()).every((o) => o.gate === "signedIn"));
  });

  test("locked controls are real buttons, never `disabled` and never 'coming soon'", () => {
    for (const f of [
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
    ]) {
      const s = code(f);
      assert.match(s, /<button/);
      assert.doesNotMatch(s, /\bdisabled\b/);
      assert.doesNotMatch(s, /coming soon/i);
      /* No invented sign-in destination. */
      assert.doesNotMatch(s, /href=\{?["'`]\/(login|signin|sign-in|register)/);
    }
  });

  test("the locked note is honest and carries no upsell", () => {
    assert.match(ENGAGEMENT_LOCKED_NOTE, /free/);
    assert.match(ENGAGEMENT_LOCKED_NOTE, /nothing has been saved/);
    for (const word of ["premium", "upgrade", "trial", "subscription", "plan", "pro tier", "insider"]) {
      assert.doesNotMatch(ENGAGEMENT_LOCKED_NOTE, new RegExp(word, "i"), `"${word}" must not appear`);
    }
  });

  test("no locked control reports success, anywhere", () => {
    for (const f of [
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
      "components/flagship/tools/FlagshipCheckerSection.tsx",
      "components/flagship/tools/FlagshipGeneratorSection.tsx",
      "components/flagship/tools/FlagshipJackpotTracker.tsx",
    ]) {
      const s = code(f);
      assert.doesNotMatch(
        s,
        /Saved!|Alert created|You('| a)re following|(has been|is now) turned on|Subscribed|We'll email/i,
      );
    }
  });

  test("the sign-in intent shape is produced, and its return path is internal", () => {
    const option = engagementOptions(PB())[0];
    const intent = engagementIntent(PB(), option);
    assert.equal(intent.gameSlug, "powerball");
    assert.equal(intent.returnTo, "/powerball#alerts");
    assert.equal(intent.action, option.key);
    /* Never an absolute or caller-supplied URL — an open redirect is not expressible. */
    assert.ok(intent.returnTo.startsWith("/"));
    assert.doesNotMatch(intent.returnTo, /^https?:|^\/\//);
  });

  test("public tools stay public — no gate is placed on the check, the generator or the odds", () => {
    const publicTools = flagshipTools(PB()).filter((t) =>
      ["check-numbers", "generator", "odds"].includes(t.key),
    );
    assert.equal(publicTools.length, 3);
    assert.ok(publicTools.every((t) => t.access === "publicComplete"));
    assert.ok(publicTools.every((t) => t.availability === "available"));
    /* All three render inline on the page. */
    assert.ok(inlineTools(PB()).filter((t) => ["check-numbers", "generator", "odds"].includes(t.key)).length === 3);
  });

  test("every tool is discoverable, and none links to a route that does not exist", () => {
    /* The Tax Calculator is the ONE tool with an approved route: BP-05C §5's blueprint URL, built under the
       Conflict 42 interim founder instruction and served from the tools registry (LRG-TOOLS-001). Every other
       tool still may not claim a route before the URL inventory approves one. */
    for (const cfg of FLAGSHIP_GAMES) {
      for (const tool of flagshipTools(cfg)) {
        if (tool.key === "tax-calculator") {
          assert.equal(tool.route, "/tools/tax-calculator", "the tax calculator names its Conflict 42 route");
          assert.equal(servesPage("tools", tool.route!), true, "and the registry actually serves it");
        } else {
          assert.equal(tool.route, null, `${tool.key} must not claim a route before the URL inventory approves it`);
        }
        assert.ok(tool.purpose.length > 0);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ provenance and honesty */

describe("LRG-FLAGSHIP-002: provenance, gaps and the review boundary", () => {
  test("every sourced fact carries a source reference", () => {
    for (const cfg of FLAGSHIP_GAMES) {
      const sourced = [
        cfg.drawDays, cfg.drawTimeEt, cfg.salesCutoffEt, cfg.multiplier.conditionNote, cfg.internationalNote,
        ...cfg.ruleEras.map((e) => e.summary),
        ...(cfg.secondaryDraw ? [cfg.secondaryDraw.timingNote] : []),
      ];
      for (const s of sourced) {
        assert.ok(s.sourceRef.length > 0, `a fact in ${cfg.gameSlug} has no source reference`);
        assert.ok(["verifiedOfficial", "governedDocument", "computed", "notCaptured"].includes(s.verification));
      }
    }
  });

  test("the recorded gaps are exposed on the model, not swallowed", () => {
    for (const model of [modelPB(), modelMM()]) {
      /*
       * FGP-009 closed three of these — the content rails now carry preview items, so their `unavailable` gaps
       * are gone. The two that matter most are still open and still stated: the operator prize matrix and the
       * cash value, neither of which is captured and neither of which is derived.
       */
      assert.ok(model.gaps.length >= 2);
      assert.ok(model.gaps.some((g) => g.what.includes("prize amounts")));
      assert.ok(model.gaps.some((g) => g.what.includes("cash value")));
      for (const g of model.gaps) {
        assert.ok(g.what.length > 0 && g.why.length > 0);
      }
    }
    /* Powerball's unknown ticket price is a gap, not a guessed figure. */
    assert.equal(isGap(PB().ticketPrice), true);
    assert.ok(modelPB().gaps.some((g) => g.what.includes("ticket price")));
  });

  test("the page identifies itself as preview data exactly once, from the payload's own sentence", () => {
    const page = code("components/flagship/FlagshipGamePage.tsx");
    /* Two branches — preview and real — but only one can render, so the reader sees one bar. */
    assert.equal((page.match(/data-preview-banner="true"/g) ?? []).length, 2);
    assert.match(page, /UI review data/);
    /* The sentence comes from the model, not from a string typed in the component. */
    assert.match(page, /\{model\.preview\.disclosure\}/);
    assert.match(page, /Not published yet/);
  });

  test("the trust section carries every required boundary", () => {
    const trust = src("components/flagship/sections/FlagshipEcosystem.tsx");
    assert.match(trust, /only the official result is[\s\S]{0,20}final/i);
    assert.match(trust, /corrections-policy/);
    assert.match(trust, /affiliate-disclosure/);
    assert.match(trust, /1-800-522-4700/, "the responsible-play helpline");
    assert.match(trust, /18 or older/);
    assert.match(trust, /No system can predict winning[\s\S]{0,20}numbers/i);
    assert.match(trust, /no such thing as an overdue[\s\S]{0,20}number/i);
    assert.match(trust, /claimed from the lottery that sold[\s\S]{0,20}the ticket/i);
  });

  test("the shared result grammar is reused rather than reimplemented", () => {
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /StateBallGroup/);
    /* No lookalike ball markup of its own. */
    assert.doesNotMatch(page, /className="lcp-ball"/);
  });
});

/* ══════════════════════════════════════════════════════════════════ FGP-003 visual polish */

describe("FGP-003: the five jobs are above the fold, and the two games are visually distinct", () => {
  test("the primary actions render inside the result column, before the facts strip", () => {
    const page = code("components/flagship/FlagshipGamePage.tsx");
    const actions = page.indexOf('data-primary-actions="5"');
    const facts = page.indexOf("lcfg-herofacts");
    const freshness = page.indexOf("lcfg-freshness");
    assert.ok(actions > 0, "the hero must carry the five primary actions");
    assert.ok(actions < facts, "actions must precede the key-facts strip");
    assert.ok(actions < freshness, "actions must precede the freshness line");
    /* They live inside the result column, which is what fills the dead space Mega Millions had. */
    const resultCol = page.indexOf('className="lcfg-hero__result"');
    const gridClose = page.indexOf("lcfg-hero__jackpot");
    assert.ok(resultCol < actions && actions < gridClose, "actions belong to the result column");
  });

  test("all five jobs are present as controls", () => {
    const page = src("components/flagship/FlagshipGamePage.tsx");
    /* FGP-005 shortened the follow label so the five fit a 2-up mobile grid. */
    for (const label of ["Check my ticket", "Search history", "Build numbers", "Follow &amp; alerts"]) {
      assert.ok(page.includes(label), `the hero must offer "${label}"`);
    }
    /* Ask AI is the contextual chip, taken from the ordered surfaces rather than hardcoded. */
    assert.match(page, /chips\.slice\(0, 1\)\.map/);
  });

  test("each game carries its own accent, from configuration", () => {
    assert.notEqual(
      resolveGameTheme(PB().gameSlug).id,
      resolveGameTheme(MM().gameSlug).id,
      "the two pages must not look alike",
    );
    /* Set on the page root from config — no component branches on a slug. */
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /resolveGameTheme\(config\.gameSlug\)/, "the theme comes from the slug, not a branch");
    assert.match(page, /style=\{gameThemeVars\(theme\)\}/);
    /*
     * FGP-010: the accent is no longer the ball colour. A ball value is tuned to carry white numerals, so it
     * must be dark, and reusing it as the page accent is what made Powerball read brick and Mega Millions brown.
     * Each game now declares its own four-token set, and the BALL tokens are deliberately unchanged so the
     * result grammar still renders identically here and on Home, State and the jurisdiction Game Page.
     */
    const css = src("app/globals.css");
    /* `code()` strips comments — the note explaining where the blocks WENT must not count as a block. */
    assert.doesNotMatch(
      code("app/globals.css"),
      /\[data-accent="/,
      "per-game colour values must not return to the stylesheet",
    );
    for (const slug of ["powerball", "mega-millions"]) {
      const theme = gameTheme(slug);
      assert.ok(theme, `${slug} must have a registry entry`);
      assert.equal(theme!.status, "verified");
      assert.equal(theme!.emphasis, "flagship");
    }
    assert.notEqual(gameTheme("powerball")!.accent, gameTheme("mega-millions")!.accent);
    /* The ball tokens themselves are untouched by this task. */
    assert.match(css, /--ball-powerball-bg: #b3241c;/);
    assert.match(css, /--ball-megaball-bg: #9a4a07;/);
  });

  test("the hero states the cash-value gap in its short form, and the full reason survives elsewhere", () => {
    const gap = modelPB().result!.cashValueGap;
    assert.ok(gap.shortWhy, "a short form exists for the hero");
    assert.ok(gap.shortWhy!.length < gap.why.length);
    /* The full reason is still rendered on the page — in the odds section and the FAQ. */
    assert.ok(modelPB().gaps.some((g) => g.why === gap.why));
    assert.ok(modelPB().faq.some((q) => q.answer.join(" ").includes(gap.why)));
  });
});

describe("FGP-003: locked features are compact chips and still honest", () => {
  test("they are chips, not four-line cards", () => {
    for (const f of [
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
      "components/flagship/tools/FlagshipJackpotTracker.tsx",
    ]) {
      const s2 = code(f);
      assert.match(s2, /lcfg-lockchip/, `${f} must use the chip`);
      assert.doesNotMatch(s2, /lcfg-lockbtn/, `${f} must not use the old card`);
    }
    /* The old card styles are gone from the stylesheet too. */
    assert.doesNotMatch(src("app/globals.css"), /\.lcfg-lockbtn/);
    /* And the chip is a full-size touch target. */
    assert.match(src("app/globals.css"), /\.lcfg-lockchip \{[^}]*min-height: 44px/s);
  });

  test("every governance guarantee survives the compaction", () => {
    for (const f of [
      "components/flagship/FlagshipLocked.tsx",
      "components/flagship/tools/FlagshipAlerts.tsx",
    ]) {
      const s2 = code(f);
      assert.match(s2, /<button/);
      assert.doesNotMatch(s2, /\bdisabled\b/);
      assert.doesNotMatch(s2, /coming soon/i);
      assert.doesNotMatch(s2, /href=\{?["'`]\/(login|signin|sign-in|register)/);
      /* "Needs a free account" is still announced on every chip. */
      assert.match(s2, /Needs a free account/);
      /* The benefit still appears — in the shared panel, on activation. */
      assert.match(s2, /\{(active\.option\.benefit|active\.benefit)\}|\{active\.option\.benefit\}/);
    }
    /* Compaction removed pixels, not features: the same 18 tool capabilities and 8 engagement controls. */
    assert.equal(allLockedCapabilities(PB()).length, 18);
    assert.equal(engagementOptions(PB()).length, 8);
  });
});

describe("FGP-003: passive bulk is compressed", () => {
  test("ranked stat views cap at eight rows; distributions stay complete", () => {
    const views = new Map(labFor(PB()).map((v) => [v.definition.key, v]));
    const drawings = reviewPB().rows.length;

    /* A RANKED view is a top-N list, so trimming the tail loses nothing. */
    for (const key of ["frequency", "overdue", "pairs", "triples"] as const) {
      const v = views.get(key)!;
      assert.ok(v.available && v.rows.length <= 8, `${key} returns ${v.rows.length} rows`);
    }

    /*
     * A DISTRIBUTION is never truncated — cutting its tail would present a partial shape as the whole one.
     * Length came out of the sum view by widening the bucket instead, so it is shorter AND still complete.
     */
    const sums = views.get("sums")!;
    assert.ok(sums.rows.length <= 8, `sums returns ${sums.rows.length} buckets`);
    for (const key of ["sums", "odd-even", "high-low", "draw-day"] as const) {
      const total = views.get(key)!.rows.reduce((n, r) => n + r.count, 0);
      assert.equal(total, drawings, `${key} must account for every drawing`);
    }

    /* Every row still opens the drawings behind it. */
    assert.ok(views.get("frequency")!.rows.every((r) => r.filter.includeMain.length === 1));
  });

  test("the trust section is a three-column grid at desktop, with no nested panel chrome", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lcfg-trustgrid \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/);
    assert.match(css, /\.lcfg-section--trust \.lcfg-panel \{[^}]*border: 0;/s);
  });

  test("the freshness line carries the official-source boundary rather than a second paragraph", () => {
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /LotteryCorner is not a lottery/);
    /* One block, not two stacked paragraphs. */
    assert.doesNotMatch(page, /className="lcfg-official"/);
  });
});

/* ══════════════════════════════════════════════════════════════════ FGP-005 mobile command centre */

describe("FGP-005: the mobile command-centre contract", () => {
  test("all five actions survive, and the primary five are the five jobs", () => {
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /data-primary-actions="5"/);
    for (const label of ["Check my ticket", "Search history", "Build numbers", "Follow &amp; alerts"]) {
      assert.ok(page.includes(label), `the hero must offer "${label}"`);
    }
    assert.match(page, /label="Ask AI"/, "Ask AI is the fifth job");
    /* Exactly five children in the row — nothing added, nothing dropped. */
    const row = page.slice(page.indexOf('data-primary-actions="5"'), page.indexOf("</div>", page.indexOf('data-primary-actions="5"')));
    assert.equal((row.match(/className="lcfg-btn/g) ?? []).length, 4, "four buttons plus the Ask chip");
    assert.match(row, /FlagshipAskChip/);
  });

  test("the actions sit ABOVE the secondary drawing, in the DOM", () => {
    /*
     * This is the fix for the Powerball case: Double Play sat between the numbers and the actions, which pushed
     * them to y=742 and 228px tall — one of five above an 812 fold. The reorder is in the DOM rather than CSS
     * `order`, so visual, DOM and focus order stay identical (WCAG 2.4.3).
     */
    const page = code("components/flagship/FlagshipGamePage.tsx");
    const actions = page.indexOf('data-primary-actions="5"');
    const secondary = page.indexOf("result.secondary ? (");
    const facts = page.indexOf("lcfg-herofacts");
    assert.ok(actions > 0 && secondary > 0);
    assert.ok(actions < secondary, "actions must precede the secondary drawing");
    assert.ok(actions < facts, "actions must precede the key-facts strip");
  });

  test("the action row is a two-column grid on mobile, with a 44px floor", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lcfg-heroactions \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/s);
    assert.match(css, /\.lcfg-heroactions > \* \{[^}]*min-height: 44px/s);
    /* The primary action spans both columns so it still reads as primary. */
    assert.match(css, /\.lcfg-heroactions > \.lcfg-btn--primary \{ grid-column: 1 \/ -1; \}/);
    /* And it returns to an inline row above the phone breakpoint. */
    assert.match(css, /@media \(min-width: 560px\) \{\s*\.lcfg-heroactions \{ display: flex/);
    /* Nothing is hidden behind a menu. */
    assert.doesNotMatch(css, /\.lcfg-heroactions[^{]*\{[^}]*display: none/s);
  });

  test("explorer row actions stay on one line, so mobile rows do not stack to 158px", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lcfg-rowactions \{ flex-wrap: nowrap; \}/);
    /* All three actions remain discoverable — none moved into an overflow menu. */
    const explorer = src("components/flagship/tools/FlagshipExplorerSection.tsx");
    for (const action of ["Check my line", "Similar drawings", "Ask about it"]) {
      assert.ok(explorer.includes(action), `the explorer row must keep "${action}"`);
    }
    /* And the compact default is unchanged. */
    assert.match(explorer, /export const COMPACT_ROWS = 6/);
  });

  test("every Stats Lab view is discoverable — short tab labels, wrapping strip, no hidden scroll", () => {
    /* Ten sentence-length tabs wrapped to a 473px strip on mobile, which was worse than the hidden scroll it
       replaced. The tab carries a short label; the panel heading and the accessible name keep the full one. */
    for (const v of STAT_VIEWS) {
      assert.ok(v.tabLabel.length > 0, `${v.key} needs a short tab label`);
      assert.ok(v.tabLabel.length <= 12, `${v.key} tab label "${v.tabLabel}" is too long for a strip`);
      assert.notEqual(v.tabLabel, v.label, `${v.key} must not repeat the sentence in the tab`);
    }
    const section = src("components/flagship/tools/FlagshipStatsSection.tsx");
    assert.match(section, /\{v\.definition\.tabLabel\}/, "the strip renders the short label");
    assert.match(section, /aria-label=\{v\.definition\.label\}/, "the accessible name keeps the full label");
    assert.match(section, /\{active\.definition\.label\}/, "the panel heading keeps the full label");

    const css = src("app/globals.css");
    assert.match(css, /\.lcfg-tabs \{[^}]*flex-wrap: wrap/s, "the strip wraps rather than scrolling");
    assert.match(css, /\.lcfg-tabs \{[^}]*overflow-x: visible/s, "no hidden horizontal scroll");
  });

  test("the preview banner is compressed on mobile, not removed", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lcs-previewbar \{ padding: 5px 8px/, "tighter on the smallest screens");
    /* The message itself is never removed — only its wording changed in FGP-010. */
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /UI review data/);
    assert.match(page, /Not published yet/);
  });
});

/* ══════════════════════════════════════════════════════════════════ FGP-006 acceptance polish */

describe("FGP-006: the polish keeps every contract it touches", () => {
  test("the five actions carry three declared tiers, and an icon each", () => {
    const page = code("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /data-tier="primary"/);
    /* Two are literal `data-tier` attributes; the third is the Ask chip, which takes the tier as a prop and
       renders the same attribute. `tier="secondary"` matches both forms, so it counts all three exactly once. */
    assert.equal((page.match(/tier="secondary"/g) ?? []).length, 3, "three secondary actions");
    assert.match(code("components/flagship/tools/FlagshipAiConsole.tsx"), /data-tier=\{tier\}/);
    assert.match(page, /data-tier="locked"/);
    /* One icon per action, and every icon is decorative — the label is the accessible name. */
    assert.equal((page.match(/<ActionIcon name=/g) ?? []).length, 5);
    assert.match(page, /aria-hidden="true"[\s\S]{0,80}focusable="false"/);
    /* Tap-target floor is unchanged. */
    assert.match(src("app/globals.css"), /\.lcfg-heroactions > \* \{[^}]*min-height: 44px/s);
  });

  test("the AI section is styled as an assistant panel, distinct from tool panels", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lcfg-console > \.lcfg-section--ai \{[^}]*background: var\(--color-brand-navy\)/s);
    /* Inverse text on that surface — the pairing whose ratio is already recorded. */
    assert.match(css, /\.lcfg-console > \.lcfg-section--ai \{[^}]*color: var\(--color-text-inverse\)/s);
    /* The three lead prompts outrank the rest. §C2 moved the chip row into the shared surface. */
    assert.match(src("components/shell/AnswerSurface.tsx"), /data-rank=\{i < 3 \? "lead" : "rest"\}/);
    assert.match(css, /\.lcfg-section--ai \.lcfg-prompt\[data-rank="lead"\]/);
    /* The boundary is still rendered — quieter, never removed. */
    assert.match(css, /\.lcfg-section--ai \.lcfg-boundary/);
  });

  test("locked chips lost their repeated chrome, not their offer", () => {
    /* The gate tag is two words now, not a sentence repeated per group. */
    assert.match(src("components/flagship/FlagshipLocked.tsx"), /Free account<\/span>/);
    /* The note panel renders nothing until a chip is chosen — five always-on boxes were the repetition. */
    for (const f of ["components/flagship/FlagshipLocked.tsx", "components/flagship/tools/FlagshipAlerts.tsx"]) {
      const s2 = code(f);
      assert.match(s2, /\) : null\}\s*<\/div>/, `${f} must leave the note empty until activated`);
    }
    assert.match(src("app/globals.css"), /\.lcfg-lockednote:empty \{ display: none; \}/);
    /* Every capability is still offered, and every gate is still honest — `signedIn` since Conflict 37
       shipped the real shared flow. */
    assert.equal(allLockedCapabilities(PB()).length, 18);
    assert.equal(engagementOptions(PB()).length, 8);
    assert.ok(allLockedCapabilities(PB()).every((c) => c.gate === "signedIn"));
    for (const f of ["components/flagship/FlagshipLocked.tsx", "components/flagship/tools/FlagshipAlerts.tsx"]) {
      const s2 = code(f);
      assert.doesNotMatch(s2, /\bdisabled\b/);
      assert.doesNotMatch(s2, /coming soon/i);
      /* UPDATED under Conflict 37: these components previously emitted NO sign-in href because none existed.
         They now open the real flow — through the shared `SignInToUse` affordance (`FD-DAT-04`), never a
         hand-rolled link, so the wording and the intent capture cannot drift per surface. */
      assert.doesNotMatch(s2, /href=\{?["'`]\/(login|signin|sign-in|register)/);
      assert.match(s2, /SignInToUse/);
    }
  });

  test("trust drops the blue block and balances, keeping every boundary", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lcfg-section--trust \{[^}]*background: var\(--color-surface\)/s, "no blue block");
    assert.match(css, /\.lcfg-trustgrid \{[^}]*column-gap/s, "columns balance the ragged grid");
    assert.match(css, /\.lcfg-faqgrid/, "the FAQ runs two-up at desktop");

    /* Every required boundary survives the compression. */
    const trust = src("components/flagship/sections/FlagshipEcosystem.tsx");
    assert.match(trust, /only the official result is[\s\S]{0,20}final/i);
    assert.match(trust, /no such thing as an overdue[\s\S]{0,20}number/i);
    assert.match(trust, /1-800-522-4700/);
    assert.match(trust, /corrections-policy/);
    assert.match(trust, /affiliate-disclosure/);
    assert.equal(modelPB().faq.length, 9);
  });

  test("the per-game accent drives the polished surfaces, from configuration", () => {
    const css = src("app/globals.css");
    /* Hero wash, result spine, jackpot rail, primary CTA and the trust rule all key off one token. */
    for (const rule of [
      /\.lcfg-console > \.lcfg-hero \{[^}]*var\(--gt-accent-bright\)/s,
      /\.lcfg-hero__result > \.lcfg-result \{[^}]*var\(--gt-accent/s,
      /\.lcfg-hero__jackpot \{[^}]*var\(--gt-accent/s,
      /\.lcfg-heroactions \[data-tier="primary"\] \{[^}]*var\(--gt-accent/s,
      /\.lcfg-section--trust \{[^}]*var\(--gt-accent/s,
    ]) {
      assert.match(css, rule);
    }
    assert.notEqual(resolveGameTheme(PB().gameSlug).accent, resolveGameTheme(MM().gameSlug).accent);
  });
});

/* ══════════════════════════════════════════════════════════════════ FGP-008 launch-safe data */

describe("FGP-008: every flagship data path is published data or an intentional empty state", () => {
  test("published coverage is exactly what the feed carries, de-duplicated across jurisdictions", () => {
    /* Five Powerball jurisdiction records and four Mega Millions records describe ONE national drawing each. */
    for (const cfg of FLAGSHIP_GAMES) {
      const h = publishedHistory(cfg);
      assert.equal(h.rows.length, 1, `${cfg.gameSlug} publishes one drawing today`);
      assert.equal(h.provenance.synthetic, 0);
      assert.equal(h.rows[0].provenance, "productionFeed");
      /* And it is inside the current rule era, so nothing mixes matrices. */
      const era = cfg.ruleEras.find((e) => e.effectiveTo === null)!;
      if (era.effectiveFrom) assert.ok(h.rows[0].drawDateIso >= era.effectiveFrom);
    }
    /* The richest record wins, so Powerball keeps Power Play and Double Play. */
    const pb = publishedHistory(PB()).rows[0];
    assert.equal(pb.multiplier, 4);
    assert.ok(pb.secondary);
    /* Mega Millions' multiplier is per-ticket, so it is never attached to a drawing. */
    assert.equal(publishedHistory(MM()).rows[0].multiplier, null);
  });

  test("the model exposes coverage, and the connected series now satisfies it", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.ok(model.coverage.publishedDrawings >= 100);
      assert.equal(model.coverage.canSearchHistory, true, "a deep series is a searchable archive");
      assert.equal(model.coverage.canCheckRange, true);
      assert.equal(model.coverage.canComputeStats, true);
    }
    /* The threshold is declared, not hidden in a component. */
    assert.equal(MIN_ROWS_FOR_SEARCH, 25);
    /* And the limited-data path is still reachable: coverage is computed, never assumed. */
    const short = statsLab({ rows: modelPB().history.rows.slice(0, 3), mainPool: 69, mainCount: 5, drawNights: [] });
    assert.ok(short.every((v) => !v.available));
  });

  test("the explorer keeps its limited-data state, and offers the search when the data supports it", () => {
    const s2 = code("components/flagship/tools/FlagshipExplorerSection.tsx");
    assert.match(s2, /const limited = !coverage\.canSearchHistory/);
    assert.match(s2, /data-empty-state="limited-published-history"/);
    /* The filter panel and the "summarise these" chip are not offered when they cannot work. */
    assert.match(s2, /\{limited \? null : \(/);
    /* Over the connected series the search runs, and it can narrow the record. */
    for (const model of [modelPB(), modelMM()]) {
      const narrowed = searchDraws(model.history.rows, { ...EMPTY_FILTER, oddCount: 3 }, "x", 1000);
      assert.ok(narrowed.matchCount > 0);
      assert.ok(narrowed.matchCount < model.history.rows.length, "a filter must actually narrow the record");
    }
  });

  test("the Stats Lab computes every view over the connected series", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.equal(model.stats.views.length, STAT_VIEWS.length);
      const available = model.stats.views.filter((v) => v.available);
      assert.ok(available.length >= 8, `${model.config.gameSlug} should compute nearly every view`);
      for (const v of available) assert.ok(v.rows.length > 0, `${v.definition.key} must emit rows`);
      /* A view that cannot run still says why, with its own threshold named. */
      for (const v of model.stats.views.filter((v2) => !v2.available)) {
        assert.match(v.reason!, new RegExp(String(v.definition.minDraws)));
      }
    }
  });

  test("the checker offers only the depth the published archive can honour", () => {
    assert.deepEqual(availableCheckModes(1).map((m) => m.key), ["latest"]);
    assert.deepEqual(availableCheckModes(5).map((m) => m.key), ["latest", "all"]);
    assert.deepEqual(availableCheckModes(400).map((m) => m.key), ["latest", "last10", "all"]);
    /* The component reads it, and states the single-drawing reality in words. */
    const s2 = code("components/flagship/tools/FlagshipCheckerSection.tsx");
    assert.match(s2, /availableCheckModes\(coverage\.publishedDrawings\)/);
    assert.match(s2, /data-coverage="single-published-draw"/);
    /* A real check against the one published drawing still works end to end. */
    const drawn = modelPB().history.rows[0];
    const r = checkLine({ main: [...drawn.main], special: drawn.special }, { main: drawn.main, special: drawn.special }, {
      mainCount: 5, mainMin: 1, mainMax: 69, specialLabel: "Powerball", specialMin: 1, specialMax: 26,
    });
    assert.equal(r.matchLabel, "5 + Powerball");
  });

  test("the hero result stays real, and the cash value is still never derived", () => {
    for (const model of [modelPB(), modelMM()]) {
      /* The result in the hero comes from the production feed, not from the preview payload. */
      assert.ok(model.result);
      assert.equal(model.result!.drawDateIso, model.history.rows[0].drawDateIso);
      assert.equal(model.history.rows[0].provenance, "productionFeed");
      /* Two real advertised figures; the cash value remains a stated gap rather than half the annuity. */
      assert.ok(model.jackpot);
      assert.equal(model.result!.cashValueDisplay, null);
      assert.ok(model.result!.cashValueGap.why.length > 0);
      /* Odds: still computed from the verified matrix, never taken from the payload. */
      assert.match(model.odds.method, /Counted from the published number matrix/);
    }
  });

  test("no rendered copy anywhere shows internal vocabulary in the consumer register", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.equal(model.displayMode, "consumer");
      const copy = [
        model.historyDisclosure,
        model.stats.method,
        model.freshness.label,
        model.preview?.disclosure ?? "",
        model.jackpotRun?.method ?? "",
        ...model.stats.views.map((v) => v.reason ?? ""),
        ...model.ai.flatMap((a) => a.deterministicAnswer ?? []),
      ].join(" ");
      assert.doesNotMatch(copy, /sample row|internal review|synthetic/i);
      /* But the fact itself is still stated — in words a reader can act on. */
      assert.match(copy, /preview/i);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ neighbours unaffected */

describe("LRG-FLAGSHIP-002: the existing page families are untouched", () => {
  test("the Game and State route boundaries are registry-only, like this one", () => {
    /* `FD-GATE-01`: these two used to be the exception. They now follow the flagship pattern this file established. */
    assert.doesNotMatch(src("lib/game/gamePreviewGuard.ts"), /process\.env/);
    assert.match(code("lib/game/gamePreviewGuard.ts"), /servesPage\("game"/);
    assert.doesNotMatch(code("lib/registry/pageFamilyRegistry.ts"), /process\.env/);
  });

  test("the jurisdiction Game Page still owns /fl/powerball, and nothing here duplicates it", () => {
    assert.ok(exists("app/[state]/[game]/page.tsx"));
    /* `/powerball` is a different route with a different canonical; it is not a second canonical for
       `/fl/powerball`, and neither redirects to the other. */
    assert.notEqual(modelPB().seo.canonical, "https://www.lotterycorner.com/fl/powerball");
    assert.doesNotMatch(code("app/powerball/page.tsx"), /\/fl\//);
  });

  test("no flagship file writes outside its own namespace", () => {
    /* Every flagship selector is `lcfg-` prefixed, apart from the deliberately reused shared primitives. */
    const page = src("components/flagship/FlagshipGamePage.tsx");
    const reused = ["lcs-skip", "lcs-previewbar", "lcs-attr", "lcs-crumbs", "lcs-vh", "lcs-mult"];
    const classes = [...page.matchAll(/className="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
    for (const c of classes) {
      if (c.startsWith("lcfg-") || reused.includes(c) || c.startsWith("lcs-mult")) continue;
      assert.fail(`unexpected class "${c}" — flagship styling must stay in the lcfg- namespace`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ FGP-009 the mock BFF */

describe("FGP-009: the flagship data layer is one typed seam with a mock adapter behind it", () => {
  test("one function answers for every registered flagship route, and only for those", () => {
    /* Route existence comes from the registry, and the data layer agrees with it — `CLAUDE.md` §10 forbids
       deriving a route from a fixture filename, so the two are checked against each other rather than assumed. */
    for (const slug of flagshipRoutePaths().map((p) => p.replace("/", ""))) {
      assert.ok(getFlagshipGamePageData(slug), `${slug} must have a payload`);
      assert.ok(mockedGameSlugs().includes(slug), `${slug} must be answerable by the mock adapter`);
    }
    assert.equal(getFlagshipGamePageData("pick-3"), null, "an unregistered game gets nothing");
    assert.equal(getFlagshipGamePageData(""), null);
    /* And no payload exists for a game the registry does not carry. */
    for (const slug of mockedGameSlugs()) assert.ok(isFlagshipEligible(slug));
  });

  test("the payload is complete, newest-first, and every row declares its source", () => {
    for (const cfg of [PB(), MM()]) {
      const data = mockFlagshipGamePageData(cfg);
      assert.equal(data.meta.gameSlug, cfg.gameSlug);
      assert.equal(data.meta.source, "mock");
      assert.ok(isPreviewData(data));
      assert.match(data.meta.disclosure!, /Live feeds are still being connected/);

      assert.ok(data.history.length >= 100, "at least 100 drawings, per the task");
      assert.equal(data.history[0].source, "productionFeed", "the newest drawing is the real one");
      for (let i = 1; i < data.history.length; i++) {
        assert.ok(data.history[i].drawDateIso < data.history[i - 1].drawDateIso, "strictly newest-first");
        assert.equal(data.history[i].source, "mock");
      }
      /* Every drawing obeys the game's own matrix — a preview row with six numbers would break every tool. */
      for (const d of data.history) {
        assert.equal(d.main.length, cfg.matrix.mainCount);
        assert.equal(new Set(d.main).size, cfg.matrix.mainCount, "no repeated main value");
        assert.ok(d.main.every((v) => v >= 1 && v <= cfg.matrix.mainPool));
        assert.ok(d.special !== null && d.special >= 1 && d.special <= cfg.matrix.specialPool);
      }
      assert.equal(data.jackpotHistory.length, data.history.length);
      assert.ok(data.prizeTiers!.length > 0);
      assert.ok(data.checkerExamples.length > 0);
      assert.ok(data.content.forum.length + data.content.blog.length + data.content.news.length > 0);
    }
  });

  test("the two games differ through data, not through a branch", () => {
    const pb = mockFlagshipGamePageData(PB());
    const mm = mockFlagshipGamePageData(MM());
    assert.notDeepEqual(pb.history[0], mm.history[0]);
    /* Powerball's multiplier is drawn and its Double Play exists; Mega Millions has neither. */
    assert.ok(pb.history.every((d) => d.multiplier !== null));
    assert.ok(pb.history.every((d) => d.secondary !== null));
    assert.ok(mm.history.every((d) => d.multiplier === null));
    assert.ok(mm.history.every((d) => d.secondary === null));
    /* Each series stays inside its own era, so no drawing is rendered under the wrong matrix. */
    for (const [cfg, data] of [[PB(), pb], [MM(), mm]] as const) {
      const from = cfg.ruleEras.find((e) => e.effectiveTo === null)!.effectiveFrom!;
      assert.ok(data.history.every((d) => d.drawDateIso >= from));
    }
    /* And each carries its own tag. */
    assert.ok(pb.content.forum.every((i) => i.tags.includes("Powerball")));
    assert.ok(mm.content.forum.every((i) => i.tags.includes("Mega Millions")));
  });

  test("the adapter refuses a payload that would render as a misleading page", () => {
    const good = mockFlagshipGamePageData(PB());
    /* The validator is exercised through the real entry point by mutating a copy, so the guard is proven to run
       on every read rather than only at module load. */
    const broken = JSON.parse(JSON.stringify(good));
    broken.history[0].source = "mock";
    assert.throws(
      () => assertPayload("powerball", broken),
      /newest drawing is not the real published result/,
    );
    const noDisclosure = JSON.parse(JSON.stringify(good));
    noDisclosure.meta.disclosure = null;
    assert.throws(() => assertPayload("powerball", noDisclosure), /carries no disclosure/);
  });

  test("the future API shape is recorded in exactly one place", () => {
    /* `CLAUDE.md` §15 forbids API or schema design during a UI task, so the open questions are RECORDED, not
       answered — and they are recorded once, so the eventual API task has a single checklist. */
    for (const value of Object.values(FUTURE_API)) assert.ok(value.length > 40);
    assert.match(FUTURE_API.separationOfConcerns, /domain data, presentation view models, provenance/);
    assert.match(FUTURE_API.cashValue, /never be derived/);
    /* No TODO scattered anywhere else in the flagship tree. */
    for (const f of FLAGSHIP_SOURCE_FILES) {
      assert.doesNotMatch(code(f), /\bTODO\b/, `${f} must not carry a stray TODO — use FUTURE_API`);
    }
    /* `02-new-api` stays untouched: the API branch throws rather than pretending to work. */
    assert.equal(FLAGSHIP_DATA_MODE, "mock");
    assert.match(src("lib/flagship/bff/flagshipBff.ts"), /the API adapter does not exist/);
  });

  test("no component or route imports the mock payload directly", () => {
    /* The whole point of the seam: hardcoded data must not reach the render tree. */
    for (const f of FLAGSHIP_SOURCE_FILES.filter((p) => p.startsWith("components/") || p.startsWith("app/"))) {
      assert.doesNotMatch(src(f), /bff\/mock|flagshipBffMock/, `${f} must go through the page model`);
    }
    /* And only the adapter reads the JSON at all. */
    assert.match(src("lib/flagship/bff/flagshipBffMock.ts"), /mock\/powerball\.json/);
  });
});

describe("FGP-009: the tools run against the connected series", () => {
  test("the checker works across the whole series and offers every depth", () => {
    const model = modelPB();
    assert.deepEqual(availableCheckModes(model.coverage.publishedDrawings).map((m) => m.key), [
      "latest", "last10", "all",
    ]);
    const drawn = model.history.rows[0];
    const scan = checkAgainstHistory(
      { main: [...drawn.main], special: drawn.special, multiplierBought: false },
      model.history.rows,
      { mainCount: 5, mainMin: 1, mainMax: 69, specialLabel: "Powerball", specialMin: 1, specialMax: 26 },
      "all",
      { multiplierMode: "independentlySelected", multiplierLabel: "Power Play" },
    );
    assert.equal(scan.searched, model.history.rows.length);
    assert.ok(scan.hits.length > 0);
    /* The top match is the real drawing, and it is counted as the one published hit. */
    assert.equal(scan.hits[0].drawDateIso, drawn.drawDateIso);
    assert.equal(scan.productionHits, 1);
  });

  test("the checker offers example lines from the data layer, not from the component", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.ok(model.checkerExamples.length >= 2);
      for (const ex of model.checkerExamples) {
        assert.equal(ex.main.length, model.config.matrix.mainCount);
        assert.ok(ex.label.length > 0);
      }
      /* The "matches the latest drawing" example really does. */
      const exact = model.checkerExamples.find((e) => e.key === "match-latest")!;
      assert.deepEqual([...exact.main].sort((a, b) => a - b), [...model.history.rows[0].main]);
    }
    const checker = code("components/flagship/tools/FlagshipCheckerSection.tsx");
    assert.match(checker, /checkerExamples\.map/);
    assert.doesNotMatch(checker, /\[\s*\d+\s*,\s*\d+\s*,\s*\d+/, "no hardcoded sample line in the component");
  });

  test("the explorer searches, narrows and finds a specific drawing", () => {
    const model = modelPB();
    const rows = model.history.rows;
    /* A filter that names a value the record contains returns fewer rows than the record, and every row matches. */
    const target = rows[5].main[0];
    const found = searchDraws(rows, { ...EMPTY_FILTER, includeMain: [target] }, "x", 1000);
    assert.ok(found.matchCount > 0 && found.matchCount < rows.length);
    assert.ok(found.rows.every((r) => r.main.includes(target)));
    /* "Real published drawings only" narrows to the one real row, which is the reviewer's own check. */
    const real = searchDraws(rows, { ...EMPTY_FILTER, productionOnly: true }, "x", 1000);
    assert.equal(real.matchCount, 1);
    assert.equal(real.rows[0].provenance, "productionFeed");
  });

  test("the Stats Lab computes over the series and states the period it used", () => {
    for (const model of [modelPB(), modelMM()]) {
      const available = model.stats.views.filter((v) => v.available);
      assert.ok(available.length >= 8);
      assert.match(model.stats.method, new RegExp(String(model.history.rows.length)));
      assert.match(model.stats.method, /rule era/);
      /* A ranked view stays capped; a distribution still accounts for every drawing. */
      for (const v of available) {
        /* Distributions account for every drawing, so they are not capped; ranked views are. */
        if (["odd-even", "high-low", "draw-day", "consecutive"].includes(v.definition.key)) continue;
        assert.ok(v.rows.length <= 8, `${v.definition.key} is a ranked view and must stay capped`);
      }
    }
  });

  test("the jackpot tracker reports a real run, and projects nothing", () => {
    for (const model of [modelPB(), modelMM()]) {
      const run = model.jackpotRun!;
      assert.ok(run, "a connected series produces a run");
      assert.ok(run.drawings >= 2);
      assert.equal(run.points.length, run.drawings);
      /* Oldest first, and the last point is the current advertised figure. */
      for (let i = 1; i < run.points.length; i++) {
        assert.ok(run.points[i].drawDateIso > run.points[i - 1].drawDateIso);
      }
      assert.equal(run.points[run.points.length - 1].advertisedDisplay, run.currentDisplay);
      assert.ok(run.points.every((p) => p.height >= 0 && p.height <= 1));
      assert.ok(run.completedRuns > 0, "the series holds completed runs to compare against");
      /* The method is stated and it forecasts nothing. */
      assert.match(run.method, /does not forecast/);
      assertNoPredictionClaim("jackpot run", run.method);
    }
    /* One point is not a run, and the section falls back rather than inventing a trend. */
    assert.equal(jackpotRun([], "X"), null);
    assert.equal(
      jackpotRun([{ drawDateIso: "2026-01-01", advertised: 1, cashValue: null, wonAtThisDraw: false, source: "mock" }], "X"),
      null,
    );
  });

  test("a reset in the series is a run boundary, and the flag cannot disagree with the amounts", () => {
    for (const cfg of [PB(), MM()]) {
      const series = mockFlagshipGamePageData(cfg).jackpotHistory;
      /* `wonAtThisDraw` is derived from a reset, so every flagged point must actually be lower than the one
         after it in time — otherwise the roll count and the amounts would tell different stories. */
      for (let i = 0; i < series.length; i++) {
        if (!series[i].wonAtThisDraw) continue;
        assert.ok(i > 0 && series[i - 1].advertised < series[i].advertised, `${series[i].drawDateIso}`);
      }
      /* The newest figure is the real advertised jackpot, not a generated one. */
      assert.equal(series[0].source, "productionFeed");
    }
  });

  test("the prize table renders with its source stated, and the jackpot row is never a number", () => {
    for (const model of [modelPB(), modelMM()]) {
      const tiers = model.odds.prizes!;
      assert.ok(tiers.length > 0);
      /* Every tier is preview data and says so; none is passed off as the operator's published table. */
      assert.ok(tiers.every((t) => t.source === "mock"));
      const jackpotTier = tiers.find((t) => t.mainMatched === model.config.matrix.mainCount && t.specialMatched);
      assert.equal(jackpotTier!.prizeDisplay, null, "the jackpot is the advertised amount, not a fixed prize");
      /* Every tier maps onto a real odds row, so no amount can land on a match that cannot happen. */
      for (const t of tiers) {
        assert.ok(
          model.odds.rows.some((r) => r.mainMatched === t.mainMatched && r.specialMatched === t.specialMatched),
          `${t.label} must correspond to a possible outcome`,
        );
      }
    }
    const rules = code("components/flagship/sections/FlagshipRules.tsx");
    assert.match(rules, /data-prize-source=/);
    assert.match(rules, /These prize amounts are preview data/);
  });
});

describe("FGP-009: preview data is labelled, and launch safety is unchanged", () => {
  test("the disclosure travels with the payload and reaches the page", () => {
    for (const model of [modelPB(), modelMM()]) {
      assert.ok(model.preview);
      assert.equal(model.preview!.active, true);
      assert.match(model.preview!.disclosure, /Live feeds are still being connected/);
      assert.match(model.preview!.disclosure, /The latest drawing is real/);
      /* Short enough to read at a glance — a founder review note, not a wall of warning. */
      assert.ok(model.preview!.disclosure.length < 200, "the disclosure must stay one short sentence pair");
    }
  });

  test("the consumer register never uses internal vocabulary, and the internal one does", () => {
    assert.equal(FLAGSHIP_DISPLAY_MODE, "consumer");
    assert.equal(provenanceTag("productionFeed", "consumer"), "Published result");
    assert.equal(provenanceTag("synthetic/internal-review", "consumer"), "Preview");
    assert.equal(provenanceTag("synthetic/internal-review", "internalReview"), "Review row");
    assert.doesNotMatch(provenanceSentence("synthetic/internal-review", "consumer"), /internal review|synthetic/i);
    assert.match(provenanceSentence("synthetic/internal-review", "internalReview"), /internal review row/);
    /* But the consumer register still SAYS it is not real — the label changes, the fact does not. */
    assert.match(provenanceSentence("synthetic/internal-review", "consumer"), /not a published drawing/);
    assert.equal(previewCountNote(0, "consumer"), null, "no note when there is nothing to note");
    assert.match(previewCountNote(3, "consumer")!, /preview drawings used for layout and tool testing/);
  });

  test("no tool counts preview drawings as published ones", () => {
    /*
     * The failure this catches is a sentence, not a value: "this searches the 300 published drawings" over a
     * series where 299 are preview reads as a claim about published results, and it is the exact shape of
     * §14 violation that survives a green test suite. Every count the tools state is either unqualified or
     * carries its provenance beside it.
     */
    const explorer = code("components/flagship/tools/FlagshipExplorerSection.tsx");
    assert.doesNotMatch(explorer, /\$\{history\.rows\.length\} published/);
    assert.match(explorer, /result\.productionMatchCount < result\.matchCount/, "the count is qualified");
    const checker = code("components/flagship/tools/FlagshipCheckerSection.tsx");
    assert.doesNotMatch(checker, /every drawing published here/);
    /* And the model's own statements agree: no "N published drawings" where N exceeds the published count. */
    for (const model of [modelPB(), modelMM()]) {
      for (const line of [model.historyDisclosure, model.stats.method]) {
        const claimed = line.match(/(\d+) published drawings/);
        if (claimed) assert.ok(Number(claimed[1]) <= model.history.provenance.productionFeed, line);
      }
    }
  });

  test("every tool that shows a row's source reads the shared vocabulary", () => {
    for (const f of [
      "components/flagship/tools/FlagshipCheckerSection.tsx",
      "components/flagship/tools/FlagshipExplorerSection.tsx",
      "components/flagship/sections/FlagshipEcosystem.tsx",
    ]) {
      assert.match(code(f), /provenanceTag\(/, `${f} must not write its own label`);
      assert.doesNotMatch(code(f), /"Review row"/, `${f} must not hardcode the internal label`);
    }
  });

  test("the routes stay noindex, out of the sitemap, with no redirect and no commerce change", () => {
    /* The founder's standing constraints, re-asserted after a data change that makes the pages look finished. */
    for (const slug of ["powerball", "mega-millions"] as const) {
      const meta = flagshipMetadata(slug)!;
      assert.deepEqual(meta.robots, { index: false, follow: false });
    }
    assert.doesNotMatch(src("lib/seo/sitemapEntries.ts"), /powerball|mega-millions|flagship/i);
    assert.equal(exists("app/sitemap.ts"), false);
    assert.doesNotMatch(src("next.config.mjs"), /redirects/);
    for (const f of FLAGSHIP_SOURCE_FILES) {
      assert.doesNotMatch(code(f), /buynow|\/play\//, `${f} must not touch a commerce route`);
    }
  });

  test("no preview copy anywhere on either page claims a prediction", () => {
    for (const model of [modelPB(), modelMM()]) {
      const copy = [
        model.preview!.disclosure,
        model.jackpotRun!.method,
        ...model.content.guides.items.flatMap((i) => [i.title, i.excerpt]),
        ...model.content.news.items.flatMap((i) => [i.title, i.excerpt]),
        ...model.content.community.items.flatMap((i) => [i.title, i.excerpt]),
        ...model.ai.flatMap((a) => a.deterministicAnswer ?? []),
      ];
      for (const c of copy) assertNoPredictionClaim(`${model.config.gameSlug} preview copy`, c);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ FGP-010 brand colour and copy */

/**
 * WCAG relative luminance and contrast ratio.
 *
 * Implemented here rather than trusted from a comment: a colour value in this file is a claim about legibility,
 * and a claim in a stylesheet comment goes stale the moment someone edits the hex beside it. These tests read
 * the real declarations out of `globals.css` and measure them.
 */
const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The accent values for one game.
 *
 * FGP-011: read from the SHARED registry rather than parsed out of the stylesheet, because the stylesheet no
 * longer holds them. That the registry reaches the DOM under these custom-property names is asserted separately,
 * in `game-theme.test.ts`.
 */
function accentTokens(slug: string): Record<string, string> {
  const t = gameTheme(slug);
  assert.ok(t, `${slug} must have a registry entry`);
  return {
    "--gt-accent": t!.accent,
    "--gt-accent-on": t!.on,
    "--gt-accent-ink": t!.ink,
    "--gt-accent-bright": t!.bright,
  };
}

const CANVAS = "#f2f6fa";
const SURFACE = "#ffffff";
const NAVY = "#172033";

describe("FGP-010: the routes need no flag, and no copy implies one", () => {
  test("no flagship file reads an environment variable to decide access", () => {
    for (const f of FLAGSHIP_SOURCE_FILES) {
      const body = code(f);
      assert.doesNotMatch(body, /LC_FLAGSHIP_GAME_PREVIEW/, `${f} must not reference the removed flag`);
      /* `NODE_ENV` is allowed — the review fixture uses it as a production barrier, which is not route access. */
      const envReads = [...body.matchAll(/process\.env\.([A-Za-z_]+)/g)].map((m) => m[1]);
      for (const name of envReads) {
        assert.equal(name, "NODE_ENV", `${f} reads process.env.${name}; route access is registry-only`);
      }
    }
    /* Access comes from the registry and nothing else. */
    const access = code("lib/flagship/flagshipRouteAccess.ts");
    assert.doesNotMatch(access, /process\.env/);
    /* `FD-GATE-01` routes it through the shared `servesPage`, which is still registry-and-only-registry. */
    assert.match(access, /flagshipRegistryEntry|isFlagshipEligible|servesPage/);
    for (const slug of ["powerball", "mega-millions"]) assert.equal(isFlagshipRouteEnabled(slug), true);
  });

  test("no reader-facing copy mentions a flag, an environment variable or internal vocabulary", () => {
    /*
     * Checked against the MODEL's copy, not the source, because a component comment naming the removed flag is
     * documentation while a rendered string naming it is a developer warning leaking onto a public page.
     */
    const FORBIDDEN = /\bflag\b|environment variable|\benv\b|synthetic\/internal-review|localhost|process\.env/i;
    for (const model of [modelPB(), modelMM()]) {
      const copy = [
        model.preview!.disclosure,
        model.historyDisclosure,
        model.stats.method,
        model.freshness.label,
        model.jackpotRun!.method,
        model.odds.method,
        ...model.gaps.flatMap((g) => [g.what, g.why]),
        ...model.faq.flatMap((q) => [q.question, ...q.answer]),
        ...model.stats.views.map((v) => v.reason ?? ""),
        ...model.ai.flatMap((a) => [a.label, a.boundary, ...(a.deterministicAnswer ?? [])]),
        ...model.content.community.items.flatMap((i) => [i.title, i.excerpt]),
        ...model.content.news.items.flatMap((i) => [i.title, i.excerpt]),
        ...model.content.guides.items.flatMap((i) => [i.title, i.excerpt]),
      ];
      for (const line of copy) assert.doesNotMatch(line, FORBIDDEN, `"${line}"`);
    }
    /* And the banner the component writes itself. */
    const page = src("components/flagship/FlagshipGamePage.tsx");
    const rendered = [...page.matchAll(/<span className="lcs-attr">([^<]*)<\/span>/g)].map((m) => m[1]);
    for (const line of rendered) assert.doesNotMatch(line, FORBIDDEN);
  });

  test("the disclosure stays — short, honest and non-technical", () => {
    for (const model of [modelPB(), modelMM()]) {
      const d = model.preview!.disclosure;
      /* It says what is real and what is not, in that order, and it fits on two lines. */
      assert.match(d, /The latest drawing is real/);
      assert.match(d, /preview data/i);
      assert.ok(d.length < 200);
      assert.doesNotMatch(d, /warning|error|do not deploy|developer/i);
    }
  });
});

describe("FGP-010: each game reads as itself, and both stay legible", () => {
  test("Powerball is a clear red and Mega Millions a clear gold, and they share no value", () => {
    const pb = accentTokens("powerball");
    const mm = accentTokens("mega-millions");
    for (const tokens of [pb, mm]) {
      for (const name of ["--gt-accent", "--gt-accent-on", "--gt-accent-ink", "--gt-accent-bright"]) {
        assert.ok(tokens[name], `${name} must be declared`);
      }
    }
    /* Not one shared value: recolouring is not the same as a different theme. */
    for (const name of Object.keys(pb)) {
      assert.notEqual(pb[name], mm[name], `${name} is identical on both games`);
    }

    /* Powerball's accent is RED — red channel dominant, and lighter than the brick it replaced. */
    const red = parseInt(pb["--gt-accent"].slice(1, 3), 16);
    const green = parseInt(pb["--gt-accent"].slice(3, 5), 16);
    const blue = parseInt(pb["--gt-accent"].slice(5, 7), 16);
    assert.ok(red > 190, `Powerball accent red channel is ${red} — too dark to read as Powerball red`);
    assert.ok(green < 80 && blue < 80, "Powerball accent must not be muddied by green or blue");
    assert.ok(
      luminance(pb["--gt-accent"]) > luminance("#b3241c"),
      "the accent must be brighter than the ball colour it replaced",
    );

    /* Mega Millions' accent is GOLD — red and green both high, blue low. */
    const [mr, mg, mb] = [1, 3, 5].map((i) => parseInt(mm["--gt-accent"].slice(i, i + 2), 16));
    assert.ok(mr > 200 && mg > 130, `Mega Millions accent is ${mm["--gt-accent"]} — not a gold`);
    assert.ok(mb < 90, "a gold has little blue in it");
    assert.ok(mg > green + 100, "Mega Millions must differ from Powerball in hue, not just lightness");
  });

  test("every accent pairing clears its WCAG threshold", () => {
    for (const accent of ["powerball", "mega-millions"] as const) {
      const t = accentTokens(accent);
      /* A fill that carries text: 4.5:1 against the text colour that sits on it (1.4.3). */
      assert.ok(
        contrast(t["--gt-accent"], t["--gt-accent-on"]) >= 4.5,
        `${accent}: ${t["--gt-accent-on"]} on ${t["--gt-accent"]} is ` +
          contrast(t["--gt-accent"], t["--gt-accent-on"]).toFixed(2),
      );
      /* The ink, used as text on both light backgrounds the page uses. */
      for (const bg of [CANVAS, SURFACE]) {
        assert.ok(
          contrast(t["--gt-accent-ink"], bg) >= 4.5,
          `${accent}: ink on ${bg} is ${contrast(t["--gt-accent-ink"], bg).toFixed(2)}`,
        );
      }
      /*
       * The bright value is never placed on the light canvas alone. A true Mega Millions gold cannot clear 3:1
       * there — #ffc72c on #f2f6fa is 1.44 — so it appears only against the brand navy (the run chart's plinth)
       * or paired with the ink in a gradient rule. Both placements are checked, here and below.
       */
      for (const name of ["--gt-accent", "--gt-accent-bright"]) {
        assert.ok(
          contrast(t[name], NAVY) >= 3,
          `${accent}: ${name} on the chart plinth is ${contrast(t[name], NAVY).toFixed(2)}`,
        );
      }
    }
  });

  test("the bright value never carries text, and the fill always names its own text colour", () => {
    const css = src("app/globals.css");
    /* Wherever the accent is a background, `--gt-accent-on` is the colour — never an assumed white. */
    for (const selector of ["\\.lcfg-btn--primary", "\\.lcfg-tab\\[aria-selected=\"true\"\\]"]) {
      /* Both selectors appear twice — a neutral base rule and the accent-scoped override. The override is the
         one that matters, so the LAST matching rule is the one asserted against. */
      const rules = [...css.matchAll(new RegExp(`${selector} \\{[^}]*\\}`, "gs"))].map((m) => m[0]);
      const rule = rules.find((r) => r.includes("--gt-accent"));
      assert.ok(rule, `${selector} must have an accent-scoped rule`);
      assert.match(rule!, /background: var\(--gt-accent[,)]/);
      assert.match(rule!, /color: var\(--gt-accent-on/, `${selector} must set its own text colour`);
    }
    /* And the one place bright is a solid fill is the chart, which sits on the navy plinth. */
    const chart = css.match(/\.lcfg-runchart \{[^}]*\}/s)![0];
    assert.match(chart, /background: var\(--color-brand-navy\)/);
    assert.match(css, /\.lcfg-runchart__bar \{[^}]*var\(--gt-accent[,)]/s);
    assert.match(css, /\.lcfg-runchart__bar:last-child \{[^}]*var\(--gt-accent-bright/s);
  });

  test("the two games differ by more than colour", () => {
    const pb = PB();
    const mm = MM();
    /* Ticket price, multiplier mechanics, draw rhythm, secondary drawing and rule era all differ in config. */
    assert.notEqual(pb.drawDays.value, mm.drawDays.value);
    assert.match(mm.drawDays.value, /Tuesday/);
    assert.match(mm.drawDays.value, /Friday/);
    assert.equal(pb.multiplier.mode, "independentlySelected");
    assert.equal(mm.multiplier.mode, "builtIn");
    assert.ok(pb.secondaryDraw, "Powerball has Double Play");
    assert.equal(mm.secondaryDraw, null, "Mega Millions has none");
    assert.notEqual(pb.matrix.mainPool, mm.matrix.mainPool);
    assert.notEqual(pb.matrix.specialPool, mm.matrix.specialPool);
    /* Mega Millions' April 2025 era is the reason its connected series is shorter, and it is stated. */
    const era = mm.ruleEras.find((e) => e.effectiveTo === null)!;
    assert.match(era.effectiveFrom!, /^2025-04/);
    assert.ok(modelMM().history.rows.length < modelPB().history.rows.length);
    /* The rendered pages carry the difference structurally, not only in labels. */
    assert.ok(modelPB().result!.secondary, "the Powerball hero shows Double Play");
    assert.equal(modelMM().result!.secondary, null);
    assert.equal(modelMM().result!.multiplier, null, "no draw-level Mega Millions multiplier — BP-04A §46");
    /* And Mega Millions states its own ticket price rather than inheriting Powerball's gap. */
    assert.notEqual(modelPB().ticketPriceDisplay, modelMM().ticketPriceDisplay);
  });

  test("the special-number field follows the page's own accent", () => {
    /* It was hardcoded to the Powerball ball colour, so the Mega Ball input was outlined in Powerball red. */
    const css = src("app/globals.css");
    const rule = css.match(/\.lcfg-numinput--special \{[^}]*\}/s)![0];
    assert.match(rule, /var\(--gt-accent-ink/);
  });
});
