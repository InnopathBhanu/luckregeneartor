/*
 * LRG-GAME-049 — the guarded Florida Powerball Game Page V0.
 *
 * The two load-bearing groups are ELIGIBILITY (one declared pair, never derived) and NON-REGRESSION (the
 * State family must be untouchable from here). Everything else checks that the page tells the truth about
 * Powerball using the governed contracts rather than a second copy of them.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import { ELIGIBLE, gameRegistryEntry, isGamePreviewEligible, eligiblePairs } from "../lib/game/gameRegistry";
import { resolveGamePreview } from "../lib/game/gamePreviewGuard";
import { gameConfigFor, configuredGamePairs } from "../lib/game/gameConfigRegistry";
import { validateGameViewConfig, gameCapability } from "../lib/game/gameViewConfig";
import { buildGamePreviewModel, JG_M1_ORDER } from "../lib/game/gamePreviewModel";
import { gamePageGraph, PROHIBITED_GAME_PAGE_TYPES } from "../lib/seo/gamePageSchema";
import { gameAdProfileFor } from "../lib/game/gameAdProfile";
import { drawEventsFor } from "../lib/state/stateDrawEvents";
import { formatVersionsFor } from "../lib/state/stateFormatRegistry";
import { buildStatePreviewModel } from "../lib/state/statePreviewModel";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const codeOnly = (p: string) => src(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const raw = () => JSON.parse(src("config/games/fl-powerball.json"));

const model = () => {
  const m = buildGamePreviewModel("fl", "powerball", true, { now: new Date("2026-08-02T12:00:00Z") });
  assert.ok(m, "the Florida Powerball model must build");
  return m!;
};

/* ------------------------------------------------------------------ route and guard */

describe("LRG-GAME-049: route and guard", () => {
  test("the Powerball pair is declared, and is the only JG-M1 offering", () => {
    /*
     * LRG-GAME-050 added three JG-M2 pairs (`pick-3`, `cash-pop`, `jackpot-triple-play`), so this no longer
     * asserts a total of one. What it still asserts is the invariant that matters: `/fl/powerball` is a
     * DECLARED entry with its production game id, and it remains the single minimal flagship offering.
     */
    assert.ok(eligiblePairs().includes("fl/powerball"));
    assert.equal(ELIGIBLE.filter((e) => e.mode === "JG-M1").length, 1);
    assert.equal(gameRegistryEntry("fl", "powerball")?.mode, "JG-M1");
    assert.equal(gameRegistryEntry("fl", "powerball")?.gameId, 1012);
    assert.equal(gameRegistryEntry("FL", "POWERBALL")?.gameId, 1012, "lookup is case-insensitive");
  });

  test("eligibility is not derived from the feed, a fixture or a config file", () => {
    /* Powerball appears in all 49 feed jurisdictions. Only the declared pair is eligible. */
    for (const s of ["mi", "va", "ca", "md", "ny", "az"]) {
      assert.ok(drawEventsFor(s).some((e) => e.gameId === 1012) || s === "ny" || s === "az",
        `${s} sanity`);
      assert.equal(isGamePreviewEligible(s, "powerball"), false, `${s}/powerball must not be eligible`);
    }
    /*
     * Games Florida genuinely runs, with transcribed events, a configured State family and a verified format —
     * and still no registry entry. `pick-3` moved to the eligible set in LRG-GAME-050, so the check now uses
     * its siblings, which are exactly as data-complete and remain ineligible.
     */
    /* LRG-GAME-052 made pick-2/4/5, fantasy-5 and lotto eligible. These three remain data-complete and
       registry-absent, which is the property this test exists to protect. */
    for (const g of ["mega-millions", "lucky-money", "mega-money"]) {
      assert.equal(isGamePreviewEligible("fl", g), false, `fl/${g} must not be eligible without a registry entry`);
    }
    /* The registry and the loaded configurations must agree exactly — no orphan file, no orphan entry. */
    assert.deepEqual(configuredGamePairs().sort(), eligiblePairs().sort());
  });

  test("registered routes render without a custom environment flag", () => {
    assert.equal(resolveGamePreview("fl", "powerball"), true);
    assert.equal(resolveGamePreview("mi", "powerball"), false, "an ineligible pair never renders");
  });

  test("the route boundary is registry-only and never reads the environment", () => {
    const guard = codeOnly("lib/game/gamePreviewGuard.ts");
    assert.ok(!/process\.env|NEXT_PUBLIC/.test(guard));
    assert.ok(!/process\.env/.test(codeOnly("lib/game/gamePreviewModel.ts")));
    assert.match(codeOnly("app/[state]/[game]/page.tsx"), /resolveGamePreview/);
  });

  test("the route family is the existing one; no second canonical is created", () => {
    assert.equal(gameConfigFor("fl", "powerball")!.seo.canonicalPath, "/fl/powerball");
    for (const bad of ["app/game", "app/design-lab"]) {
      assert.ok(!existsSync(new URL(`../${bad}`, import.meta.url)), `${bad} must not exist`);
    }
    /*
     * `/powerball` is a separate BP-04A root flagship route. It is not a second canonical for `/fl/powerball`,
     * and the two use independent explicit registries. Neither redirects to the other.
     */
    assert.ok(existsSync(new URL("../app/powerball", import.meta.url)), "the root hub may exist");
    assert.match(src("app/powerball/page.tsx"), /isFlagshipRouteEnabled/);
    /* A canonical that is not the governed route fails validation. */
    const c = raw(); c.seo.canonicalPath = "/fl/powerball-new";
    assert.throws(() => validateGameViewConfig(c, "t"), /canonicalPath/);
  });
});

/* ------------------------------------------------------------------ generic architecture */

describe("LRG-GAME-049: no Florida or Powerball branch in generic code", () => {
  const GENERIC = [
    "lib/game/gamePreviewModel.ts",
    "lib/game/gameViewConfig.ts",
    "lib/game/gameAdProfile.ts",
    "lib/seo/gamePageSchema.ts",
    "components/game/preview/GamePreview.tsx",
    "app/[state]/[game]/page.tsx",
  ];
  test("no generic module compares a state code or a game slug", () => {
    for (const f of GENERIC) {
      const code = codeOnly(f);
      assert.ok(!/=== *"fl"/.test(code), `${f} must not branch on a state code`);
      assert.ok(!/=== *"powerball"/.test(code), `${f} must not branch on a game slug`);
      assert.ok(!/\b1012\b/.test(code), `${f} must not hardcode a game id`);
      assert.ok(!/Florida|Powerball/.test(code), `${f} must not name the reference jurisdiction or game`);
    }
  });
  test("only the registry and the configuration name the pair", () => {
    assert.match(codeOnly("lib/game/gameRegistry.ts"), /stateCode: "fl"/);
    assert.equal(raw().game.gameId, 1012);
  });
});

/* ------------------------------------------------------------------ the result */

describe("LRG-GAME-049: the Powerball result is governed, not manufactured", () => {
  test("it is the same production record the Florida State page renders", () => {
    const m = model();
    const event = drawEventsFor("fl").find((e) => e.gameId === 1012)!;
    assert.ok(m.result);
    assert.equal(m.result!.drawDateIso, event.resultDate);
    assert.deepEqual(m.result!.groups[0].values, event.mainNumbers);
    /* And the State page shows the identical numbers — one result, governed once. */
    const state = buildStatePreviewModel("fl", true, { now: new Date("2026-08-02T12:00:00Z") })!;
    const statePb = state.familySurfaces.find((f) => f.familyId === "powerball")!.members[0];
    assert.deepEqual(statePb.result!.groups[0].values, m.result!.groups[0].values);
  });

  test("the special ball is labelled and comes from the verified format", () => {
    const m = model();
    const special = m.result!.groups.find((g) => g.visualRole === "special")!;
    assert.equal(special.label, "Powerball");
    assert.equal(special.accessibleLabel, "Powerball");
    assert.equal(special.values.length, 1);
    const fmt = formatVersionsFor("fl").find((v) => v.gameKey === "powerball" && v.effectiveTo === null)!;
    assert.equal(fmt.verification, "verifiedOfficial");
    /* The GOVERNED CONTRACT registry (`floridaFormatRegistry.ts`) is the authority the renderer reads, and
       it labels the special ball "Powerball". The older sample `result-format-definitions.json` writes it
       "Power Ball"; that file feeds the coverage checker, not the rendered label. */
    assert.equal(fmt.primaryGroups.find((g) => g.label)?.label, "Powerball");
  });

  test("Power Play carries its governed KIND, not just a number", () => {
    const m = model();
    assert.equal(m.result!.multiplier!.label, "Power Play");
    assert.equal(m.result!.multiplier!.value, 4);
    /* `independentlySelected` is what tells a reader it only applies if they bought it. */
    assert.equal(m.result!.multiplier!.kind, "independentlySelected");
  });

  test("Double Play is a labelled secondary drawing with its own numbers and special ball", () => {
    const m = model();
    const sec = m.result!.secondary!;
    assert.equal(sec.label, "Double Play");
    const main = sec.groups.find((g) => g.visualRole === "main")!;
    const special = sec.groups.find((g) => g.visualRole === "special")!;
    assert.equal(main.values.length, 5);
    assert.equal(special.label, "Powerball");
    /* Its numbers are its OWN — never the main drawing's. */
    assert.notDeepEqual(main.values, m.result!.groups[0].values);
    /* And it is not a second family, a second card or a second game id. */
    assert.ok(!/familyId|gameId/.test(JSON.stringify(sec)));
  });

  test("the jackpot label comes from the format's prize kind, and no cash value is invented", () => {
    const m = model();
    assert.equal(m.result!.jackpotLabel, "Est. annuitized jackpot");
    assert.equal(m.result!.jackpotDisplay, "$435,000,000");
    /* The format says a cash value is separately published; the feed does not carry one. */
    assert.equal(m.result!.cashValueDisplay, null);
    assert.ok(!/cashValue["']?\s*:\s*["']\$/.test(src("lib/game/gamePreviewModel.ts")));
  });

  test("there is no result history, so no recent-results section is claimed", () => {
    /* The feed carries one Powerball record per jurisdiction — the current draw. Fabricating rows is the
       one thing this section could have done wrong. */
    assert.equal(drawEventsFor("fl").filter((e) => e.gameId === 1012).length, 1);
    assert.equal(gameCapability(gameConfigFor("fl", "powerball")!, "hasResultHistory"), false);
  });
});

/* ------------------------------------------------------------------ sections */

describe("LRG-GAME-049: BP-04B JG-M1 composition", () => {
  test("the section order is the blueprint's, unmodified", () => {
    assert.deepEqual([...JG_M1_ORDER], [
      "JO-01", "JO-02", "AD-JO00", "JO-03", "JO-04", "JO-05", "JO-06", "JO-07", "JO-08", "AD-JO01", "Footer",
    ]);
    assert.deepEqual([...model().order], [...JG_M1_ORDER]);
  });

  test("sections with real content render and the rest suppress WITH a reason", () => {
    const m = model();
    for (const id of ["JO-01", "JO-02", "JO-03", "JO-04", "JO-05", "JO-08"] as const) {
      assert.equal(m.sectionState[id].render, true, `${id} must render`);
    }
    for (const id of ["JO-06", "JO-07", "AD-JO00", "AD-JO01"] as const) {
      const st = m.sectionState[id];
      assert.equal(st.render, false, `${id} must suppress`);
      assert.ok(st.render === false && st.reason.length > 20, `${id} needs a real reason`);
    }
    /* JO-06 suppresses because the flagship ecosystem is not built — not because we chose to hide it. */
    const jo06 = m.sectionState["JO-06"];
    assert.ok(jo06.render === false && /not implemented|dead route/.test(jo06.reason));
  });

  test("local features are configured labels with governed values, never frozen literals", () => {
    const m = model();
    const keys = m.localFeatures.map((f) => f.key);
    assert.ok(keys.includes("sales-cutoff"), "the verified Florida cutoff is a real local fact");
    assert.ok(keys.includes("draw-days"));
    assert.ok(keys.includes("minimum-age"));
    for (const f of m.localFeatures) assert.ok(f.value.length > 0, `${f.key} resolved empty`);
    /* Unverified local facts are absent rather than guessed. */
    const cfg = gameConfigFor("fl", "powerball")!;
    assert.equal(gameCapability(cfg, "hasTicketPrice"), false);
    assert.equal(gameCapability(cfg, "hasAdvancePlay"), false);
    /* A configuration that carries a VALUE instead of a source fails. */
    const bad = raw(); bad.localFeatures[0].value = "$2 per play";
    assert.throws(() => validateGameViewConfig(bad, "t"), /must not carry a value/);
  });

  test("claim guidance is the verified Florida record; tax and publicity stay absent", () => {
    const m = model();
    assert.ok(m.claimDeadline.publish);
    assert.match(m.claimDeadline.value!, /180 days/);
    assert.ok(m.claimTiers.length >= 3);
    assert.equal(gameCapability(gameConfigFor("fl", "powerball")!, "hasTaxGuidance"), false);
    assert.equal(gameCapability(gameConfigFor("fl", "powerball")!, "hasWinnerPublicityRule"), false);
  });

  test("community entries are labelled starters with no fabricated activity", () => {
    const cfg = gameConfigFor("fl", "powerball")!;
    assert.equal(cfg.community.length, 3);
    for (const s of cfg.community) assert.ok(s.tags.includes("Discussion starter"));
    const bad = raw(); bad.community[0].replies = 4;
    assert.throws(() => validateGameViewConfig(bad, "t"), /replies/);
    const bad2 = raw(); bad2.community[0].tags = ["Powerball"];
    assert.throws(() => validateGameViewConfig(bad2, "t"), /Discussion starter/);
  });
});

/* ------------------------------------------------------------------ interactions */

describe("LRG-GAME-049: AI, Share, Discuss and Buy Now", () => {
  const page = () => codeOnly("components/game/preview/GamePreview.tsx");

  test("the shared State primitives are reused, not reimplemented", () => {
    const p = page();
    for (const c of ["StateAiSurface", "StateBuyNowInline", "StateShareResult",
                     "StateExplainAction", "StateDiscussLink", "StateBallGroup", "StateMultiplierPill"]) {
      assert.match(p, new RegExp(`import[\\s\\S]{0,80}${c}`), `${c} must be imported, not rebuilt`);
    }
    /* And no second implementation was created alongside them. */
    for (const f of ["GameAiSurface", "GameShare", "GameBuyNow", "GameBallGroup"]) {
      assert.ok(!existsSync(new URL(`../components/game/preview/${f}.tsx`, import.meta.url)),
        `${f} must not exist — the State primitive is already generic`);
    }
  });

  test("exactly one AI surface and one Buy Now resolver", () => {
    const p = page();
    assert.equal((p.match(/<StateAiSurface/g) ?? []).length, 1);
    assert.equal((p.match(/<StateBuyNowInline/g) ?? []).length, 1);
  });

  test("no modal for any ordinary action", () => {
    const p = page();
    assert.ok(!/<dialog|role="dialog"|showModal|aria-modal/.test(p));
  });

  test("Buy Now keeps its label, its disclaimer and its disclosure", () => {
    const buy = src("components/state/preview/StateBuyNowInline.tsx");
    assert.match(buy, /LotteryCorner does not sell tickets directly/);
    assert.match(buy, /data-disclosure-slot="true"/);
    /* Florida is `underReview`; absence of evidence never becomes retail-only. */
    const m = model();
    assert.equal(m.commerce.kind, "researched");
    assert.equal(m.commerce.kind === "researched" && m.commerce.capability.status, "underReview");
  });

  test("no raw affiliate URL and no outbound content destination", () => {
    const cfg = gameConfigFor("fl", "powerball")!;
    const flat = JSON.stringify(cfg);
    /* Checked on DESTINATIONS, not on prose: the independence line legitimately reads "is not affiliated
       with any state lottery", and a substring scan over the whole file flags that sentence. */
    for (const d of Object.values(cfg.destinations)) {
      const target = d.kind === "route" ? d.href : d.fragment;
      assert.ok(!/utm_|affiliate|clickid|partner_id/i.test(target), `tracking parameter in ${target}`);
    }
    for (const d of Object.values(cfg.destinations)) {
      if (d.kind === "route") assert.ok(d.href.startsWith("/"), "destinations stay internal");
    }
    /* The only external links on the page are the labelled official verification/claim/help ones. */
    const p = page();
    const externals = p.match(/href=\{[^}]*operator[^}]*\}/g) ?? [];
    assert.ok(externals.length >= 1, "official links exist and are read from governed manifest fields");
    assert.ok(!/https?:\/\//.test(flat), "no URL is frozen into game configuration");
  });

  test("History does not go to the operator; the internal State hub is preferred", () => {
    const cfg = gameConfigFor("fl", "powerball")!;
    assert.equal(cfg.destinations.stateHub.kind, "route");
    assert.equal((cfg.destinations.stateHub as { href: string }).href, "/fl");
  });
});

/* ------------------------------------------------------------------ safety copy */

describe("LRG-GAME-049: no prediction or urgency language", () => {
  test("neither the configuration nor the page suggests better chances", () => {
    const targets = [JSON.stringify(raw()), src("components/game/preview/GamePreview.tsx")];
    for (const t of targets) {
      for (const re of [/increase (your )?(odds|chances)/i, /better (odds|chances)/i, /\bhot numbers?\b/i,
                        /\bdue to (hit|win)\b/i, /best numbers/i, /smart pick/i, /guaranteed/i,
                        /\bpredict/i, /hurry|last chance|don'?t miss/i]) {
        assert.ok(!re.test(t), `prohibited language matched ${re}`);
      }
    }
  });
  test("the validator rejects prediction copy outright", () => {
    const bad = raw(); bad.copy.localPurpose = "Play hot numbers to increase your chances.";
    assert.throws(() => validateGameViewConfig(bad, "t"), /prediction or urgency/);
  });
  test("no odds are calculated anywhere", () => {
    assert.equal(gameCapability(gameConfigFor("fl", "powerball")!, "hasPublishedOdds"), false);
    assert.ok(!/1 in [\d,]+|odds of/i.test(src("components/game/preview/GamePreview.tsx")));
  });
});

/* ------------------------------------------------------------------ seo, schema, ads */

describe("LRG-GAME-049: SEO, schema and advertising", () => {
  test("one title, one description, governed canonical, noindex", () => {
    const cfg = gameConfigFor("fl", "powerball")!;
    assert.ok(cfg.seo.title.length > 20 && cfg.seo.description.length > 40);
    const route = codeOnly("app/[state]/[game]/page.tsx");
    assert.match(route, /canonicalUrl\(cfg\.seo\.canonicalPath\)/);
    assert.match(route, /robots: \{ index: false, follow: false \}/);
    assert.match(route, /title: \{ absolute: cfg\.seo\.title \}/);
  });

  test("the graph is WebPage + BreadcrumbList and nothing else", () => {
    const g = gamePageGraph({ config: gameConfigFor("fl", "powerball")!, dateModified: "2026-07-09T14:01:45-04:00" });
    const nodes = g["@graph"] as Record<string, unknown>[];
    assert.deepEqual(nodes.map((n) => n["@type"]), ["WebPage", "BreadcrumbList"]);
    const flat = JSON.stringify(g);
    for (const t of PROHIBITED_GAME_PAGE_TYPES) {
      assert.ok(!flat.includes(`"${t}"`), `${t} must not be emitted`);
    }
    /* Organization and WebSite are referenced by @id, never duplicated as nodes. */
    assert.ok(!nodes.some((n) => n["@type"] === "Organization" || n["@type"] === "WebSite"));
    assert.match(flat, /#organization|#website/);
  });

  test("dateModified is omitted rather than invented", () => {
    const g = gamePageGraph({ config: gameConfigFor("fl", "powerball")!, dateModified: null });
    assert.ok(!JSON.stringify(g).includes("dateModified"));
  });

  test("no Game Page advertising renders, and the dependency is recorded", () => {
    const p = gameAdProfileFor("fl", "powerball");
    assert.equal(p.placements.length, 0);
    assert.match(p.gap, /ad-operations|approved/);
    /* The blueprint anchors stay in the sequence; they simply resolve to nothing. */
    assert.ok(JG_M1_ORDER.includes("AD-JO00") && JG_M1_ORDER.includes("AD-JO01"));
    /* And no State slot key leaked onto the Game Page. */
    const p2 = codeOnly("components/game/preview/GamePreview.tsx");
    assert.ok(!/sp_[a-z_]+/.test(p2), "no State slot key appears on the Game Page");
  });
});

/* ------------------------------------------------------------------ non-regression */

describe("LRG-GAME-049: State, Home and footer are untouched", () => {
  test("exactly one State primitive was generalized, additively", () => {
    /*
     * The Game Page reuses State primitives by IMPORT. Exactly one needed a change: the Buy Now surface
     * defaulted its game label to "All {State} games", which is right on a State page (the reader picks a
     * game) and wrong on a Game Page (the page IS the game). The task permits generalizing a shared
     * primitive provided State behaviour is preserved — so the new prop is OPTIONAL and NULL-DEFAULTED, and
     * the State call site passes nothing.
     */
    const buy = src("components/state/preview/StateBuyNowInline.tsx");
    assert.match(buy, /initialGameLabel = null/, "the new prop defaults to the previous behaviour");
    assert.match(buy, /useState<string \| null>\(initialGameLabel\)/);
    /* The State call site is unchanged — it passes no game label. */
    const stateCall = src("components/state/preview/sections/StateUtilitySections.tsx");
    assert.ok(!/initialGameLabel/.test(stateCall), "the State page must not pass the new prop");
    /* And the Game Page does pass it. */
    assert.match(src("components/game/preview/GamePreview.tsx"), /initialGameLabel=\{gameLabel\}/);
  });

  test("no other State, Home or footer component was touched", () => {
    for (const f of [
      "components/state/preview/StateAiSurface.tsx",
      "components/state/preview/StateShareResult.tsx",
      "components/state/preview/StateExplainAction.tsx",
      "components/state/preview/StateDiscussLink.tsx",
      "components/state/preview/sections/StateResultGrammar.tsx",
      "components/state/preview/StatePreview.tsx",
      "components/layout/GlobalFooter.tsx",
      "app/page.tsx",
      "app/layout.tsx",
    ]) {
      assert.ok(existsSync(new URL(`../${f}`, import.meta.url)), `${f} still exists`);
      assert.ok(!/LRG-GAME-049/.test(src(f)), `${f} must carry no Game Page edit`);
    }
  });

  test("the Florida State page still renders exactly what it did", () => {
    const s = buildStatePreviewModel("fl", true, { now: new Date("2026-08-02T12:00:00Z") })!;
    assert.equal(s.familySurfaces.length, 10);
    assert.equal(s.adProfile.id, "minimum-florida");
    assert.equal(s.adProfile.placements.length, 10);
    assert.equal(s.lowerContent.exploreItems.length, 4);
    assert.equal(s.lowerContent.guideItems.length, 3);
    assert.equal(s.lowerContent.resourceItems.length, 5);
    assert.equal(s.noLottery, false);
  });

  test("the Game Page opts into the shared primitives without redefining them", () => {
    const css = src("app/globals.css");
    /* One selector added to the existing scope list — widening what matches, never changing it. */
    assert.match(css, /\[data-lc-game-preview\]/);
    /* And every Game Page rule is namespaced, so none can reach a State or Home element. */
    /*
     * Bound the slice by the BANNER, not by the first mention: `LRG-GAME-049` also appears in the one-line
     * comment beside the widened scope list far earlier in the file.
     *
     * The block is the LAST section of the stylesheet by design — it was originally inserted mid-file, inside
     * the region two State tests slice and assert is entirely `lcs-`-owned, and every `lcg-` rule read as a
     * foreign selector. A new page family belongs in its own section after the existing ones.
     */
    const start = css.indexOf("LRG-GAME-049 — THE GUARDED GAME PAGE");
    assert.ok(start > 0, "the Game Page CSS block must be locatable");
    assert.ok(start > css.indexOf("   LRG-SHELL-045 — THE GLOBAL FOOTER."),
      "it must sit OUTSIDE the State region, after the footer block");
    /*
     * The slice ENDS at the next page-family banner (LRG-ARCHIVE-054), not at end-of-file.
     *
     * It used to run to the end, which was correct only while the Game Page block happened to be last. When the
     * yearly archive appended its own `lca-` section, every archive selector read as an un-namespaced Game Page
     * rule and this test failed — reporting a namespace violation that was really a slice-boundary bug. The
     * original intent is unchanged: every rule in the GAME PAGE block must be `lcg-`.
     */
    const nextFamily = css.indexOf("   YEARLY HISTORY ARCHIVE — `lca-`");
    const block = nextFamily > start ? css.slice(start, nextFamily) : css.slice(start);
    const selectors = block.match(/^\.[a-z-]+[^{]*\{/gm) ?? [];
    assert.ok(selectors.length > 10, "the Game Page block must actually contain its rules");
    for (const sel of selectors) {
      assert.ok(/^\.lcg-/.test(sel.trim()), `Game Page CSS selector is not namespaced: ${sel.trim()}`);
    }
  });
});
