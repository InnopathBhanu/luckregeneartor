/*
 * VIEWPORT-SAFE GAM ACTIVATION — LRG-ADS-CANARY-003A defect 1.
 *
 * ══ WHAT THIS GUARDS ══
 *
 * An ad request for a placement the reader cannot see. `sp_top_billboard` is governed `viewports: ["desktop"]`
 * and is EAGER, so before this correction it defined a slot, called `display()` and called `refresh()` at
 * 390px — hidden only by a CSS rule on an ancestor. CSS visibility is not request eligibility: `display: none`
 * hides pixels, it does not stop an impression.
 *
 * The rule is applied through ONE shared contract for both families — Home's `visibility` and State's
 * `viewports` both normalise into `ViewportEligibility` — so no placement is special-cased and any future one
 * inherits the gate.
 *
 * ══ HOW THE COMPONENT LAYER IS EXERCISED ══
 *
 * `GamSlot` is `.tsx` and Node's type stripping cannot parse JSX, so the gate's DECISION is tested here
 * directly against the same pure functions the component calls (`isEligibleAtTier` over the config's
 * `viewports`), and the mount/destroy consequences are driven through the real `gptClient` with the controlled
 * mock from `gam-lifecycle.test.ts`. The browser matrix in the task report covers the rendered result.
 */

import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  canaryHomeSlotKeys, canaryStateSlotKeys, canarySlotConfig, homeSlotViewports, stateSlotViewports,
} from "../lib/ads/canarySlots";
import {
  BOTH_TIERS, eligibilityFromHomeVisibility, eligibilityFromStateViewports, isEligibleAtTier, tierForWidth,
  type ViewportTier,
} from "../lib/ads/viewportTier";
import { GAM_DESKTOP_MIN_WIDTH } from "../lib/ads/gamConfig";
import { MINIMUM_FLORIDA_PROFILE } from "../lib/state/stateAdBaseline";
import { HOME_AD_ANCHORS } from "../lib/layout/adAnchors";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Would this slot register/request at this tier? The exact question `GamSlot` asks. */
function eligibleAt(slotKey: string, page: "home" | "state", tier: ViewportTier): boolean {
  const cfg = canarySlotConfig(slotKey, page, page === "state" ? "fl" : undefined);
  return cfg ? isEligibleAtTier(cfg.viewports, tier) : false;
}
const MOBILE_390: ViewportTier = tierForWidth(390);
const TABLET_768: ViewportTier = tierForWidth(768);
const DESKTOP_1440: ViewportTier = tierForWidth(1440);

/* ══════════════════════════════════════════════════════════ the breakpoint itself */

describe("LRG-ADS-CANARY-003A: one governed breakpoint, 992px", () => {
  test("the tiers divide exactly where the GAM size mappings divide", () => {
    assert.equal(GAM_DESKTOP_MIN_WIDTH, 992);
    assert.equal(tierForWidth(991), "mobile");
    assert.equal(tierForWidth(992), "desktop");
    /* The three validation viewports land where the matrix says they do. */
    assert.equal(MOBILE_390, "mobile");
    assert.equal(TABLET_768, "mobile");
    assert.equal(DESKTOP_1440, "desktop");
  });

  test("an unknown tier — server render and first hydration — is never eligible", () => {
    /* `null` is what `useViewportTier` returns before mount. Nothing may register or request while it holds,
       which is what keeps the initial client render identical to the server HTML. */
    assert.equal(isEligibleAtTier(BOTH_TIERS, null), false);
    assert.equal(isEligibleAtTier({ desktop: true, mobile: false }, null), false);
    assert.equal(isEligibleAtTier({ desktop: false, mobile: true }, null), false);
  });

  test("an unrecognised visibility rule withholds the request rather than allowing it", () => {
    assert.deepEqual(eligibilityFromHomeVisibility("something-new"), { desktop: false, mobile: false });
    assert.deepEqual(eligibilityFromStateViewports([]), { desktop: false, mobile: false });
  });
});

/* ══════════════════════════════════════════════════════════ 1–3: the three placement classes */

describe("LRG-ADS-CANARY-003A: desktop-only, mobile-only and responsive placements", () => {
  test("1 — a desktop-only placement is ineligible below 992px", () => {
    for (const key of ["sp_top_billboard", "sp_mid_leaderboard_pos2", "sp_side_mpu_pos4",
                       "sp_side_mpu_pos2", "sp_side_skyscraper_pos2"]) {
      assert.equal(eligibleAt(key, "state", "mobile"), false, `${key} at mobile`);
      assert.equal(eligibleAt(key, "state", "desktop"), true, `${key} at desktop`);
    }
  });

  test("2 — a mobile-only placement is ineligible at or above 992px", () => {
    assert.equal(eligibleAt("sp_mobile_leaderboard_pos1", "state", "desktop"), false);
    assert.equal(eligibleAt("sp_mobile_leaderboard_pos1", "state", "mobile"), true);
  });

  test("3 — a responsive placement remains eligible at both tiers", () => {
    for (const key of ["sp_mid_leaderboard_pos1", "sp_mid_leaderboard_pos6",
                       "sp_mid_leaderboard_pos5", "sp_bottom_large_leaderboard"]) {
      assert.equal(eligibleAt(key, "state", "mobile"), true, `${key} at mobile`);
      assert.equal(eligibleAt(key, "state", "desktop"), true, `${key} at desktop`);
    }
  });
});

/* ══════════════════════════════════════════════════════════ 4–5: the proven example */

describe("LRG-ADS-CANARY-003A: sp_top_billboard, the placement that proved the defect", () => {
  test("4 — it cannot register or request at 390px or 768px", () => {
    /* Both validation viewports are below 992, and it is EAGER — so before the gate it requested at both. */
    assert.equal(eligibleAt("sp_top_billboard", "state", MOBILE_390), false);
    assert.equal(eligibleAt("sp_top_billboard", "state", TABLET_768), false);
    /* Its governance is unchanged — the gate reads the rule, it does not restate it. */
    assert.deepEqual(
      MINIMUM_FLORIDA_PROFILE.find((p) => p.slotKey === "sp_top_billboard")!.viewports,
      ["desktop"],
    );
  });

  test("5 — it can register and request at 1440px", () => {
    assert.equal(eligibleAt("sp_top_billboard", "state", DESKTOP_1440), true);
    const cfg = canarySlotConfig("sp_top_billboard", "state", "fl")!;
    /* Eager, so at desktop it requests without waiting for an intersection. */
    assert.equal(cfg.lazy, false);
    assert.deepEqual(cfg.viewports, { desktop: true, mobile: false });
  });

  test("the gate is general, not a special case for this one slot", () => {
    /* Defect 1 is explicit about this. The component asks one question of every slot's own config. */
    const g = code("components/ads/GamSlot.tsx");
    assert.doesNotMatch(g, /sp_top_billboard/, "no placement may be named in the gate");
    assert.match(g, /isEligibleAtTier\(viewports, tier\)/);
    /* And every eligible placement in both families carries the rule. */
    for (const k of canaryHomeSlotKeys()) assert.ok(canarySlotConfig(k, "home")!.viewports);
    for (const k of canaryStateSlotKeys("fl")) assert.ok(canarySlotConfig(k, "state", "fl")!.viewports);
  });
});

/* ══════════════════════════════════════════════════════════ 6: the device pair */

describe("LRG-ADS-CANARY-003A: the AD-S02 device pair", () => {
  test("6 — exactly one of the pair is active at each tier", () => {
    const pair = MINIMUM_FLORIDA_PROFILE.filter((p) => p.anchorId === "AD-S02" && p.subPosition !== "rail");
    assert.deepEqual(pair.map((p) => p.slotKey).sort(),
      ["sp_mid_leaderboard_pos2", "sp_mobile_leaderboard_pos1"]);

    for (const tier of ["mobile", "desktop"] as const) {
      const live = pair.filter((p) => eligibleAt(p.slotKey, "state", tier));
      assert.equal(live.length, 1, `${tier}: exactly one of the pair`);
    }
    /* And they are never the same one. */
    assert.equal(eligibleAt("sp_mid_leaderboard_pos2", "state", "desktop"), true);
    assert.equal(eligibleAt("sp_mobile_leaderboard_pos1", "state", "mobile"), true);
  });
});

/* ══════════════════════════════════════════════════════════ 7: Home inline and rail */

describe("LRG-ADS-CANARY-003A: Home desktop-only inline and rail placements", () => {
  test("7 — no gte-992 Home placement registers on mobile", () => {
    const desktopOnly: string[] = [];
    for (const anchor of HOME_AD_ANCHORS) {
      for (const g of anchor.groups) {
        if (g.visibility === "gte-992") desktopOnly.push(...g.slotKeys);
      }
    }
    assert.ok(desktopOnly.length >= 7, "the rails and AD-H01 inline are desktop-only");
    for (const key of desktopOnly) {
      if (!canaryHomeSlotKeys().includes(key)) continue;
      assert.equal(eligibleAt(key, "home", "mobile"), false, `${key} at mobile`);
      assert.equal(eligibleAt(key, "home", "desktop"), true, `${key} at desktop`);
    }
    /* Both a rail slot and an INLINE desktop-only slot are covered — the defect is not rail-specific. */
    assert.equal(eligibleAt("hp_mid_leaderboard", "home", "mobile"), false, "inline gte-992");
    assert.equal(eligibleAt("hp_side_mpu", "home", "mobile"), false, "rail gte-992");
  });

  test("Home `all` placements stay eligible at both tiers", () => {
    for (const key of ["hp_top_billboard", "hp_mid_large_leaderboard_pos1", "hp_mid_billboard_pos1"]) {
      assert.equal(eligibleAt(key, "home", "mobile"), true, `${key} mobile`);
      assert.equal(eligibleAt(key, "home", "desktop"), true, `${key} desktop`);
    }
  });

  test("the per-tier counts follow the governed contract", () => {
    const count = (keys: readonly string[], page: "home" | "state", tier: ViewportTier) =>
      keys.filter((k) => eligibleAt(k, page, tier)).length;
    assert.equal(count(canaryHomeSlotKeys(), "home", "desktop"), 14);
    assert.equal(count(canaryHomeSlotKeys(), "home", "mobile"), 7);
    assert.equal(count(canaryStateSlotKeys("fl"), "state", "desktop"), 9);
    assert.equal(count(canaryStateSlotKeys("fl"), "state", "mobile"), 5);
  });
});

/* ══════════════════════════════════════════════════════════ 14–16: the inventory contract */

describe("LRG-ADS-CANARY-003A: the inventory contract is unchanged", () => {
  test("14 — Home eligibility is 14 and Florida is 10", () => {
    assert.equal(canaryHomeSlotKeys().length, 14);
    assert.equal(canaryStateSlotKeys("fl").length, 10);
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, 10);
  });

  test("24 unique eligible div ids, every path in the recorded network", () => {
    const ids = new Set<string>();
    let n = 0;
    for (const [keys, page, st] of [
      [canaryHomeSlotKeys(), "home", undefined],
      [canaryStateSlotKeys("fl"), "state", "fl"],
    ] as const) {
      for (const k of keys) {
        const cfg = canarySlotConfig(k, page as "home" | "state", st)!;
        assert.ok(cfg.gamPath.startsWith("/21828142944/"), `${k} outside the recorded network`);
        ids.add(cfg.divId);
        n += 1;
      }
    }
    assert.equal(n, 24);
    assert.equal(ids.size, 24, "one div id per placement");
  });

  test("15 — other states and other page families remain ineligible at every tier", () => {
    for (const st of ["ca", "md", "mi", "ut", "wy"]) {
      assert.deepEqual([...canaryStateSlotKeys(st)], [], st);
    }
    for (const page of ["game", "flagship", "archive", "news", "blog", "community", "tools"] as const) {
      assert.equal(canarySlotConfig("sp_top_billboard", page as never), null, page);
    }
  });

  test("the inactive Home sticky is still recorded, still drawn, still ineligible", () => {
    assert.equal(canarySlotConfig("hp_bottom_large_leaderboard_sticky", "home"), null);
    assert.ok(HOME_AD_ANCHORS.some((a) => a.groups.some((g) =>
      g.slotKeys.includes("hp_bottom_large_leaderboard_sticky") &&
      g.placementState === "inactive-sticky-preview")));
  });

  test("16 — the seller files are byte-identical to the legacy originals", () => {
    const legacy = (n: string) =>
      readFileSync(new URL(`../../00-reference-existing-project/LotteryCorner40/WebContent/${n}`, import.meta.url));
    const published = (n: string) => readFileSync(new URL(`../public/${n}`, import.meta.url));
    for (const n of ["ads.txt", "ads_google.txt"]) {
      assert.ok(legacy(n).equals(published(n)), `${n} changed`);
    }
  });

  test("the governed viewport rules were read, not restated", () => {
    /* The gate must derive from the family's own field. If these drifted, the gate would be a second, silently
       divergent source of truth about where a placement may appear. */
    for (const p of MINIMUM_FLORIDA_PROFILE) {
      assert.deepEqual(stateSlotViewports(p.slotKey), eligibilityFromStateViewports(p.viewports), p.slotKey);
    }
    for (const anchor of HOME_AD_ANCHORS) {
      for (const g of anchor.groups) {
        for (const k of g.slotKeys) {
          assert.deepEqual(homeSlotViewports(k), eligibilityFromHomeVisibility(g.visibility), k);
        }
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════ hydration safety */

describe("LRG-ADS-CANARY-003A: viewport activation is hydration-safe by construction", () => {
  test("the tier hook never reads a width, and never answers before mount", () => {
    const h = code("components/ads/useViewportTier.ts");
    assert.doesNotMatch(h, /innerWidth|clientWidth|offsetWidth|getBoundingClientRect/,
      "a width read can happen during SSR or first hydration");
    assert.match(h, /useState<ViewportTier \| null>\(null\)/, "null until after mount");
    assert.match(h, /matchMedia/);
    /* The subscription updates on a crossing, and both listener APIs are handled. */
    assert.match(h, /addEventListener\("change"/);
    assert.match(h, /addListener\?\./);
  });

  test("GamSlot gates registration, the observer and the rendered div on the same answer", () => {
    const g = code("components/ads/GamSlot.tsx");
    /* Three separate paths, one condition — a gap in any of them is an ad request from a hidden slot. */
    assert.equal((g.match(/!GAM_ENABLED \|\| !eligible/g) ?? []).length, 3);
    /* Eligibility is a dependency, so losing it tears the slot down. */
    assert.match(g, /\}, \[eligible, divId, gamPath, sizes, mapping, lazy\]\);/);
    assert.match(g, /\}, \[eligible, divId, lazy\]\);/);
  });

  test("no CSS or element measurement is consulted for eligibility", () => {
    for (const f of ["lib/ads/viewportTier.ts", "lib/ads/canarySlots.ts", "components/ads/GamSlot.tsx"]) {
      assert.doesNotMatch(code(f), /getComputedStyle|display:\s*none|offsetParent/,
        `${f}: CSS visibility is not request eligibility`);
    }
  });
});
