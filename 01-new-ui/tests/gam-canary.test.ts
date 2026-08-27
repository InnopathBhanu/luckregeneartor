/*
 * THE GAM CANARY CONTRACT — LRG-ADS-CANARY-001.
 *
 * What this guards, in order of how badly it would fail in public:
 *
 *   1. AN AD REQUEST NOBODY ASKED FOR. Three conditions must hold before `gpt.js` is fetched, and the third is
 *      a per-session tester action. A regression that drops any one of them turns a restricted canary into an
 *      unconsented public ad load.
 *   2. THE WRONG SLOT ACTIVATED. Only the 15 rendered Home placements and the 10 captured Florida placements
 *      are eligible. Retired, disabled, candidate, video, Wyoming and every other page family stay inactive.
 *   3. A MOVED OR RESHAPED PLACEMENT. Unit path, div id, sizes and the 992px mapping come from the recorded
 *      definitions; nothing may be re-derived here.
 *   4. ADSENSE RIDING ALONG. The old combined flag is gone; a second ad system on the canary would make every
 *      observed fill ambiguous about which system served it.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ADSENSE_ENABLED, ANALYTICS_ENABLED, CANARY_GATE_AVAILABLE, CANARY_PAGE_TYPES, CANARY_STATE_CODES,
  GAM_DESKTOP_MIN_WIDTH, GAM_ENABLED, GAM_NETWORK_CODE, IZOOTO_ENABLED, PUBLIC_ACTIVATION_BLOCKED,
} from "../lib/ads/gamConfig";
import {
  canaryHomeSlotKeys, canaryStateSlotKeys, canarySlotConfig, inactiveHomeSlotKeys,
} from "../lib/ads/canarySlots";
import { placedSlotKeys } from "../lib/layout/adAnchors";
import { MINIMUM_FLORIDA_PROFILE } from "../lib/state/stateAdBaseline";
import { getAdSlot } from "../lib/data-provider";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped: a note EXPLAINING a rule must not satisfy or break an assertion about code. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ══════════════════════════════════════════════════════════════ §2 fail-closed flags */

describe("LRG-ADS-CANARY-001 §2: every partner flag is separate and fails closed", () => {
  test("the test environment sets none of them, so everything is off", () => {
    /* The suite runs with no NEXT_PUBLIC_* set. That is the default a new environment inherits, and it must
       load nothing — the direction a mistake should fail in. */
    for (const [name, value] of [
      ["GAM_ENABLED", GAM_ENABLED], ["ADSENSE_ENABLED", ADSENSE_ENABLED],
      ["ANALYTICS_ENABLED", ANALYTICS_ENABLED], ["IZOOTO_ENABLED", IZOOTO_ENABLED],
    ] as const) {
      assert.equal(value, false, `${name} must default to false`);
    }
    assert.equal(CANARY_GATE_AVAILABLE, false, "no gate without both GAM flags");
  });

  test("only the exact string \"true\" enables a flag", () => {
    const flagFn = code("lib/ads/gamConfig.ts");
    assert.match(flagFn, /raw === "true"/, "comparison must be strict equality against the exact string");
    /* No loose coercion anywhere: `Boolean(x)`, `!!x` or `x !== "false"` would make "0" and "no" truthy. */
    assert.doesNotMatch(flagFn, /!==\s*"false"/);
    assert.doesNotMatch(flagFn, /Boolean\(process\.env/);
  });

  test("the old combined NEXT_PUBLIC_ADS_ENABLED flag is gone from the codebase", () => {
    for (const f of ["components/partner/PartnerScripts.tsx", "lib/ads/gamConfig.ts",
                     "components/ads/GamBootstrap.tsx"]) {
      assert.doesNotMatch(code(f), /NEXT_PUBLIC_ADS_ENABLED/, `${f} still reads the combined flag`);
    }
  });

  test("PartnerScripts no longer loads GPT, and AdSense is on its own flag", () => {
    const ps = code("components/partner/PartnerScripts.tsx");
    assert.doesNotMatch(ps, /securepubads|gpt\.js/, "GPT must be loaded only by GamBootstrap");
    assert.match(ps, /ADSENSE_ENABLED \?/, "AdSense has its own independent gate");
  });

  test("public activation is recorded as blocked, in a constant that has to be edited to change", () => {
    assert.equal(PUBLIC_ACTIVATION_BLOCKED.blocked, true);
    assert.match(PUBLIC_ACTIVATION_BLOCKED.reason, /CMP/);
  });
});

/* ══════════════════════════════════════════════════════════════ §2 the session gate */

describe("LRG-ADS-CANARY-001 §2: the gate is per-session and fails closed", () => {
  test("the gate uses sessionStorage, never localStorage or a cookie", () => {
    const s = code("lib/ads/adTestSession.ts");
    assert.match(s, /sessionStorage/);
    assert.doesNotMatch(s, /localStorage/, "localStorage would persist ad requests across visits");
    assert.doesNotMatch(s, /document\.cookie/, "a cookie would reach the server and change caching");
  });

  test("an unreadable or absent store reports OFF", () => {
    /* Server render and hardened browsers both land here; assuming yes would request ads for a tester who
       never pressed anything. */
    const s = code("lib/ads/adTestSession.ts");
    /* Every storage read is wrapped, and the unreadable path returns false rather than assuming consent. */
    assert.match(s, /try \{[\s\S]*?getItem\(KEY\)[\s\S]*?\} catch \{[\s\S]*?return false;[\s\S]*?\}/);
    /* The environment guard is expressed positively — `canUseStorage()` requires BOTH a window and a
       sessionStorage before any read is attempted, so server render and hardened browsers both return false. */
    assert.match(s, /typeof window !== "undefined" && typeof window\.sessionStorage !== "undefined"/);
    assert.match(s, /if \(!canUseStorage\(\)\) return false;/);
  });

  test("GamBootstrap requires all three conditions before injecting gpt.js", () => {
    const b = code("components/ads/GamBootstrap.tsx");
    assert.match(b, /CANARY_GATE_AVAILABLE/, "build-time flags");
    assert.match(b, /isAdTestActive/, "session gate");
    assert.match(b, /if \(!CANARY_GATE_AVAILABLE \|\| !active\) return;/);
    /* Idempotent against the live DOM, not against React's memory of it. */
    assert.match(b, /document\.getElementById\(SCRIPT_ID\)/);
  });
});

/* ══════════════════════════════════════════════════════════════ §3 the GPT lifecycle */

describe("LRG-ADS-CANARY-001 §3: one lifecycle, in GPT's required order", () => {
  const client = code("lib/ads/gptClient.ts");

  test("page config uses setConfig, and runs BEFORE enableServices", () => {
    /*
     * LRG-ADS-CANARY-002 §4. GPT reported the migration itself at runtime:
     *   "[GPT] PubAdsService.disableInitialLoad is deprecated, use googletag.setConfig({disableInitialLoad: …})"
     * `disableInitialLoad` is the line that separates registration from request — reversed, `display()`
     * fetches immediately and the session gate is bypassed entirely.
     */
    assert.match(client, /setConfig\(\{ disableInitialLoad: true, singleRequest: true \}\)/);
    assert.ok(client.indexOf("setConfig(") < client.indexOf("enableServices()"),
      "setConfig must precede enableServices");
  });

  test("the deprecated service methods are gone", () => {
    /* Not a style preference: GPT logs a deprecation warning for each, and the canary must not ship one. */
    for (const legacy of ["pubads.disableInitialLoad()", "pubads.enableSingleRequest()",
                          "pubads.collapseEmptyDivs("]) {
      assert.ok(!client.includes(legacy), `${legacy} is deprecated — use setConfig`);
    }
  });

  test("collapsing is never enabled, so an empty response keeps its reserved box", () => {
    /*
     * `collapseDiv` ENABLES collapsing and has no `false` — GPT rejects it outright
     * ("Invalid value encountered when calling: googletag.setConfig.collapseDiv: false", gpt-message#159).
     * Omitting the key keeps the non-collapsing default, which is what the reservation contract needs:
     * a collapsed div on a no-fill would reclaim the box and reintroduce the layout shift CLAUDE.md §12
     * exists to prevent. So the assertion is that it is never ENABLED, anywhere.
     */
    assert.doesNotMatch(client, /collapseDiv:\s*true/);
    assert.doesNotMatch(client, /collapseDiv:\s*false/, "GPT rejects this value — omit the key instead");
  });

  test("a slot is defined at most once per div id, and the claim is synchronous", () => {
    assert.match(client, /if \(defined\.has\(reg\.divId\)\) return;/);
    /*
     * The id is claimed before the queued callback runs, so two mounts in one tick cannot both pass the check.
     * That is what makes Strict Mode's double effect and hydration recovery harmless.
     *
     * Sliced to `registerSlot` first: `push(() =>` also appears in the queue helper and in `requestSlot`, so a
     * whole-file index comparison would compare against the wrong occurrence and pass by accident.
     */
    const reg = client.slice(client.indexOf("export function registerSlot"), client.indexOf("export function requestSlot"));
    assert.ok(reg.indexOf("defined.set(reg.divId, null") < reg.indexOf("push(() =>"),
      "the div id must be claimed before the GPT command is queued");
  });

  test("destroySlots is called when a slot unmounts", () => {
    assert.match(client, /destroySlots\(\[slot\]\)/);
    assert.match(code("components/ads/GamSlot.tsx"), /return \(\) => \{[\s\S]*?destroySlot\(divId\)/);
  });

  test("no auto-refresh and no invented targeting", () => {
    assert.doesNotMatch(client, /setInterval|setTimeout/, "nothing may re-request an ad on a timer");
    assert.doesNotMatch(client, /setTargeting|setCategoryExclusion/, "no targeting key is recorded in evidence");
    /* refresh is called once per slot and guarded by a set. */
    assert.match(client, /if \(requested\.has\(divId\)\) return;/);
  });

  test("isEmpty is reported as an OBSERVATION, and no response identifier is exposed", () => {
    /*
     * LRG-ADS-CANARY-003A defect 2: the state is named for what was seen, not for a cause. Google's GPT
     * release notes record that a request network failure also produces an empty `slotRenderEnded`, so
     * "no-fill" asserted an inventory conclusion the event cannot support.
     */
    assert.match(client, /ev\.isEmpty \? "empty-response" : "filled"/);
    assert.doesNotMatch(client, /"no-fill"/, "the state must not claim a cause");
    for (const banned of ["advertiserId", "lineItemId", "creativeId"]) {
      assert.doesNotMatch(client, new RegExp(`ev\\.${banned}`), `${banned} identifies a response`);
    }
  });

  test("the six debug states are the documented set", () => {
    for (const s of ["inactive", "registered", "requested", "filled", "empty-response", "blocked"]) {
      assert.match(client, new RegExp(`"${s}"`), `missing state ${s}`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════ §4 only approved placements */

describe("LRG-ADS-CANARY-001 §4: eligibility comes from what the page already renders", () => {
  test("Home eligibility is 14 — the rendered placements MINUS the inactive sticky", () => {
    /*
     * LRG-ADS-CANARY-002 §3. This asserted 15 and equality with `placedSlotKeys()`, which answers a different
     * question: which slots does Home draw a RESERVATION for. `hp_bottom_large_leaderboard_sticky` is drawn
     * but held `inactive-sticky-preview` pending ad-operations approval, so it must never request — which is
     * why the browser only ever registered 14 while this test claimed 15.
     */
    assert.equal(canaryHomeSlotKeys().length, 14);
    assert.equal(placedSlotKeys().length, 15, "the sticky slot is still RENDERED — it was not deleted");
    const excluded = placedSlotKeys().filter((k) => !canaryHomeSlotKeys().includes(k));
    assert.deepEqual(excluded, ["hp_bottom_large_leaderboard_sticky"]);
  });

  test("the inactive sticky slot stays recorded, drawn and ineligible", () => {
    /* All three must hold at once: excluding it from ad requests must not look like deleting it. */
    assert.ok(getAdSlot("hp_bottom_large_leaderboard_sticky"), "still a recorded definition");
    assert.ok(placedSlotKeys().includes("hp_bottom_large_leaderboard_sticky"), "still rendered");
    assert.deepEqual(inactiveHomeSlotKeys(), [
      { slotKey: "hp_bottom_large_leaderboard_sticky", placementState: "inactive-sticky-preview" },
    ]);
    assert.equal(canarySlotConfig("hp_bottom_large_leaderboard_sticky", "home"), null);
  });

  test("State eligibility is exactly the Minimum Florida profile, and only for fl", () => {
    assert.deepEqual([...canaryStateSlotKeys("fl")], MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey));
    for (const other of ["ca", "md", "mi", "ut", "wy", "FL "]) {
      assert.deepEqual([...canaryStateSlotKeys(other)], [], `${other} must not be activatable`);
    }
    assert.deepEqual([...CANARY_STATE_CODES], ["fl"]);
    assert.deepEqual([...CANARY_PAGE_TYPES], ["home", "state"]);
  });

  test("the retired and disabled Home records stay inactive", () => {
    /* `hp_video` is retired by FD-ADS-015 §2; the candidates are disabled. Each is a real definition in the
       JSON, so only the eligibility gate keeps them from being requested. */
    for (const key of ["hp_video", "hp_mobile_leaderboard_pos1", "hp_mid_large_leaderboard_pos4"]) {
      assert.ok(getAdSlot(key), `${key} must still exist as a definition`);
      assert.equal(canarySlotConfig(key, "home"), null, `${key} must not be activatable`);
    }
  });

  test("no other page family can produce a configuration", () => {
    for (const pageType of ["game", "flagship", "archive", "news", "blog", "community", "tools"] as const) {
      assert.equal(
        canarySlotConfig("sp_top_billboard", pageType as never),
        null,
        `${pageType} must not be activatable`,
      );
    }
  });

  test("every eligible slot carries a recorded path, div id and network — nothing is defaulted", () => {
    const seen = new Set<string>();
    for (const [keys, type, state] of [
      [canaryHomeSlotKeys(), "home", undefined],
      [canaryStateSlotKeys("fl"), "state", "fl"],
    ] as const) {
      for (const key of keys) {
        const cfg = canarySlotConfig(key, type as "home" | "state", state);
        assert.ok(cfg, `${key} is rendered but produced no canary configuration`);
        const def = getAdSlot(key)!;
        /* Identity comes from the definition, verbatim. */
        assert.equal(cfg!.gamPath, def.gamPath);
        assert.equal(cfg!.divId, def.divId);
        assert.ok(cfg!.gamPath.startsWith(`/${GAM_NETWORK_CODE}/`), `${key} is outside the recorded network`);
        assert.ok(cfg!.sizes.length > 0, `${key} has no sizes`);
        /* A div id serves one slot. Two placements sharing one id is a duplicate-slot defect at runtime. */
        assert.ok(!seen.has(cfg!.divId), `${cfg!.divId} is used by more than one eligible slot`);
        seen.add(cfg!.divId);
      }
    }
  });

  test("the responsive mapping is the slot's own, at the recorded 992px breakpoint", () => {
    assert.equal(GAM_DESKTOP_MIN_WIDTH, 992);
    let checked = 0;
    for (const key of canaryHomeSlotKeys()) {
      const cfg = canarySlotConfig(key, "home")!;
      if (!cfg.mapping) continue;
      checked += 1;
      const desktop = cfg.mapping.find((b) => b.minViewport[0] === 992);
      const mobile = cfg.mapping.find((b) => b.minViewport[0] === 0);
      assert.ok(desktop && mobile, `${key} must carry both recorded tiers`);
    }
    assert.ok(checked > 0, "at least one eligible slot carries a named mapping");
  });
});

/* ══════════════════════════════════════════════════════════════ §5 captured, not activated */

describe("LRG-ADS-CANARY-001 §5: the new families are captured and NOT wired", () => {
  const defs = JSON.parse(readFileSync(new URL("../../04-sample-data/ad-slot-definitions.json", import.meta.url), "utf8"));
  const captured = defs.capturedPageFamiliesNotActivated as Record<string, never>;

  test("all five families are recorded with file, line and extraction date", () => {
    for (const fam of ["multiStateGame", "blogHub", "blogDetail", "jackpot", "gameHistory"]) {
      const f = captured[fam] as unknown as { slots: Record<string, unknown>[]; sourceFile: string };
      assert.ok(f, `${fam} missing`);
      assert.ok(f.slots.length > 0, `${fam} has no slots`);
      for (const s of f.slots) {
        for (const field of ["gamPath", "divId", "sizes", "sourceFile", "legacyLine", "extractionDate",
                             "status", "legacyOrder", "desktopBehavior", "mobileBehavior"]) {
          assert.ok(field in s, `${fam}: a slot is missing ${field}`);
        }
        assert.match(String(s.gamPath), /^\/21828142944\//);
      }
    }
  });

  test("no captured unit path is reachable through the canary eligibility gate", () => {
    const paths = new Set<string>();
    for (const fam of Object.values(captured)) {
      const f = fam as unknown as { slots?: { gamPath: string }[] };
      for (const s of f.slots ?? []) paths.add(s.gamPath);
    }
    assert.ok(paths.size > 30, "the capture should cover the five families");
    /* The eligible set is the Home + Florida rendered slots. A captured family path must not be among them. */
    const eligible = new Set<string>();
    for (const k of canaryHomeSlotKeys()) eligible.add(canarySlotConfig(k, "home")!.gamPath);
    for (const k of canaryStateSlotKeys("fl")) eligible.add(canarySlotConfig(k, "state", "fl")!.gamPath);
    for (const p of paths) {
      if (/lc_mgp_snippet_|LC_ATV_video_player/.test(p)) continue; /* shared units, already recorded */
      assert.ok(!eligible.has(p), `${p} is a captured-only unit but is canary-eligible`);
    }
  });

  test("no React component references a captured-only unit path", () => {
    /* §5: capture without activation. A component naming one of these paths would be activating it. */
    for (const f of ["components/ads/GamSlot.tsx", "components/ads/GamBootstrap.tsx",
                     "lib/ads/canarySlots.ts", "lib/ads/gptClient.ts"]) {
      for (const prefix of ["lc_bp_", "lc_bdp_", "lc_jp_", "lc_gh_", "lc_gn_", "lc_mpg_"]) {
        assert.doesNotMatch(code(f), new RegExp(prefix), `${f} references ${prefix}`);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════ §6 authorized sellers */

describe("LRG-ADS-CANARY-001 §6: ads.txt is published verbatim", () => {
  /* Compared by BYTES, and the contents are never asserted line by line — the seller list is public but there
     is no reason for it to live in a test file, and a per-line assertion would invite normalising it. */
  const legacy = (name: string) =>
    readFileSync(new URL(`../../00-reference-existing-project/LotteryCorner40/WebContent/${name}`, import.meta.url));
  const published = (name: string) => readFileSync(new URL(`../public/${name}`, import.meta.url));

  for (const name of ["ads.txt", "ads_google.txt"]) {
    test(`${name} is byte-identical to the legacy file`, () => {
      assert.ok(legacy(name).equals(published(name)), `${name} differs from the legacy original`);
    });
  }

  test("nothing was sorted, deduplicated or normalised", () => {
    const a = legacy("ads.txt").toString("utf8");
    const b = published("ads.txt").toString("utf8");
    assert.equal(a.length, b.length);
    assert.equal(a.split("\n").length, b.split("\n").length);
  });
});
