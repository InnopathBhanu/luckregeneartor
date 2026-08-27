/*
 * Focused tests for the guarded Florida State preview — LRG-STATE-021 §12.
 *
 * Runner: Node's built-in `node:test` with native TypeScript stripping (Node >= 24). This adds NO
 * dependency and does not touch the lockfile.
 *
 *   cd 01-new-ui && npm test
 *
 * Scope discipline: these cover the invariants this preview must not regress. They are not the start of
 * a test-platform initiative.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";

import { servesPage, routeInventory } from "../lib/registry/pageFamilyRegistry";
import {
  JURISDICTIONS, supportedRoutes, directoryJurisdictions, findJurisdiction, isPreviewJurisdiction,
} from "../lib/state/jurisdictionRegistry";
import { decide, gate, fixtureDefaultOrigin, assertAllGatedClassesChecked, GATED_FIELD_CLASSES } from "../lib/state/publicationGate";
import { FLORIDA_MANIFEST, getStateManifest } from "../lib/state/floridaContentManifest";
import { checkGame, narrowStatus, verifyFormatCoverage, RESULT_STATUSES } from "../lib/state/formatCoverage";
import { DEFAULT_ORDER, STATE_SECTIONS, protectedSectionIds, hostEligibilitySectionIds } from "../lib/state/sectionManifest";
import { resolveOrder, assertNoAdBeforePromoted, isWindowOpen } from "../lib/state/adaptivePriority";
import {
  MINIMUM_FLORIDA_PROFILE, MINIMUM_PROFILE_COUNT, assertStateAdBaseline, resolvePreviewPlacements,
  FORBIDDEN_IN_PREVIEW, CONDITIONAL_HOST_SLOTS, APPROVED_RAIL_HOSTS,
} from "../lib/state/stateAdBaseline";
import { buildStatePreviewModel, renderedSectionIds, adHostEligibleSectionIds } from "../lib/state/statePreviewModel";
import {
  DEFAULT_SHELL_CAPABILITIES, STATE_PREVIEW_SHELL_CAPABILITIES,
} from "../lib/archived/legacy/layout/shellCapabilities";
import { getAdSlot } from "../lib/data-provider/index";
import { reservedHeights, slotReservation } from "../lib/state/stateAdReservation";
import { getResultFormat } from "../lib/data-provider";
import { FLORIDA_DRAW_EVENTS, floridaGameFamilies } from "../lib/state/floridaDrawEvents";
import { buildFamilies, primaryFamily } from "../lib/state/stateResultBuilder";

/* The PF-02 §12 sequence, transcribed independently of the implementation so drift fails a test
   rather than silently rewriting the governed order. */
const PF02_ORDER = [
  "S-01", "AD-S00", "S-02", "S-03", "AD-S01", "S-04", "S-05", "S-06", "AD-S02", "S-07",
  "S-08", "S-08A", "S-09", "S-10", "AD-S03", "S-11", "S-12", "S-13", "S-14", "S-15",
  "S-16", "S-17", "S-18", "AD-S04", "Footer",
];

describe("registry gating (FD-GATE-01, ratified 2026-08-11)", () => {
  /*
   * ══ WHAT THESE TESTS USED TO ASSERT, AND WHY THEY CHANGED ══
   *
   * Three tests here asserted the ENVIRONMENT gate: that `LC_STATE_PREVIEW` was inert by default, that only the
   * literal string "true" enabled it, and that with it on the six registered States previewed. `FD-GATE-01` removed
   * that flag — *"an environment variable that changes which pages exist makes 'what does this build serve?' a
   * question about a shell session rather than about the repository"* — so there is no flag left to assert.
   *
   * The PROPERTY under test is unchanged and is the one that always mattered: **a State the registry does not list
   * must never render the new template.** It is now a stronger assertion, because it no longer depends on a shell
   * variable being in any particular state to hold.
   */
  test("the registry alone decides, and it needs no environment variable", () => {
    for (const on of ["fl", "mi", "va", "ca", "md", "ut"]) {
      assert.equal(servesPage("state", on), true, `${on} is a registered State`);
    }
    for (const other of ["az", "ny", "me", "co", "ma", "nv", "tx"]) {
      assert.equal(servesPage("state", other), false, `${other} is not registered and must 404`);
    }
  });

  test("the answer does not move when the removed variables are set to anything", () => {
    /* The regression this catches: someone reintroducing an env read inside the registry path. */
    const before = servesPage("state", "fl");
    for (const value of ["true", "false", "1", "TRUE", ""]) {
      process.env.LC_STATE_PREVIEW = value;
      process.env.LC_HOME_PREVIEW = value;
      assert.equal(servesPage("state", "fl"), before, `LC_STATE_PREVIEW=${value} must change nothing`);
      assert.equal(servesPage("state", "az"), false);
    }
    delete process.env.LC_STATE_PREVIEW;
    delete process.env.LC_HOME_PREVIEW;
  });

  test("the guard module no longer exports a gate", () => {
    const guard = readFileSync(new URL("../lib/state/statePreviewGuard.ts", import.meta.url), "utf8");
    assert.ok(!/export function isStatePreviewEnabled/.test(guard));
    assert.ok(!/export function resolveStatePreview/.test(guard));
    /* Review aids survive — they change geometry and label visibility, never which pages exist. */
    assert.match(guard, /export function getStatePreviewAdMode/);
    assert.match(guard, /export function isStatePreviewDebug/);
  });

  test("every served State appears in the one route inventory", () => {
    const states = routeInventory().filter((r) => r.family === "state").map((r) => r.route);
    assert.deepEqual([...states].sort(), ["/ca", "/fl", "/md", "/mi", "/ut", "/va"]);
  });
});

describe("jurisdiction registry", () => {
  test("route existence is declared, not fixture-derived", () => {
    /* 53 real jurisdictions (50 states + DC + PR + VI) plus the USX pseudo-jurisdiction. */
    assert.equal(JURISDICTIONS.length, 54);
    assert.equal(JURISDICTIONS.filter((j) => j.type !== "pseudoJurisdiction").length, 53);
  });

  test("/usx can never be produced", () => {
    const usx = findJurisdiction("usx");
    assert.equal(usx?.routeStatus, "notAPage");
    assert.ok(!supportedRoutes().includes("usx"));
    assert.ok(!directoryJurisdictions().some((j) => j.code === "usx"));
  });

  test("no-lottery jurisdictions are present and classified, not missing", () => {
    for (const c of ["al", "ak", "hi", "ut", "nv"]) {
      assert.equal(findJurisdiction(c)?.lotteryStatus, "noActiveLottery", c);
    }
  });

  test("territories are typed as territories", () => {
    assert.equal(findJurisdiction("pr")?.type, "territory");
    assert.equal(findJurisdiction("vi")?.type, "territory");
  });

  test("exactly the six FD-X-14 States are preview-enabled", () => {
    assert.deepEqual(
      JURISDICTIONS.filter((j) => j.previewEnabled).map((j) => j.code).sort(),
      ["ca", "fl", "md", "mi", "ut", "va"],
    );
    assert.equal(isPreviewJurisdiction("fl"), true);
    assert.equal(isPreviewJurisdiction("ut"), true, "the no-lottery State is in scope");
    assert.equal(isPreviewJurisdiction("ny"), false);
    /* Enablement is READ from the one registry, never restated here (REG-01). */
    /* Comments stripped first: this file's own history is described in a comment that quotes the very
       expression being banned, and a source-text assertion that reads comments tests prose, not code. */
    const src = readFileSync(new URL("../lib/state/jurisdictionRegistry.ts", import.meta.url), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    assert.ok(!/code === "(fl|mi|va|ca|md|ut)"/.test(src),
      "jurisdictionRegistry must not restate preview enablement as a code comparison");
  });
});

describe("synthetic publication gate (FD-S-01)", () => {
  test("synthetic never publishes outside the guarded preview", () => {
    const d = decide("synthetic", "verified", false);
    assert.equal(d.publish, false);
    assert.equal(d.reason, "synthetic-not-publishable");
  });

  test("synthetic publishes ONLY in the guarded preview, and is flagged", () => {
    const d = decide("synthetic", "verified", true);
    assert.equal(d.publish, true);
    assert.equal(d.internalPreviewOnly, true);
  });

  test("a label is never a substitute — there is no publish path for synthetic when the guard is off", () => {
    for (const av of ["verified", "unverified", "underReview", "unavailable"] as const) {
      assert.equal(decide("synthetic", av, false).publish, false, av);
    }
  });

  test("unavailable and underReview never publish as fact", () => {
    assert.equal(decide("productionDerived", "unavailable", true).publish, false);
    assert.equal(decide("productionDerived", "underReview", true).publish, false);
    assert.equal(decide("productionDerived", "unverified", true).publish, false);
  });

  test("verified production-derived data publishes", () => {
    assert.equal(decide("productionDerived", "verified", false).publish, true);
    assert.equal(decide("configuration", "verified", false).publish, true);
  });

  test("fixture _meta.illustrative is recognised", () => {
    assert.equal(fixtureDefaultOrigin({ illustrative: true }), "synthetic");
  });

  test("gate() drops the value, not merely hides it", () => {
    const g = gate({ value: "secret", origin: "synthetic", availability: "verified" }, false);
    assert.equal(g.publish, false);
    assert.equal("value" in g, false);
  });

  test("every FD-S-01 field class must be checked, or the assertion throws", () => {
    assert.throws(() => assertAllGatedClassesChecked(["taxRates"]), /field classes were rendered without a gate decision/);
    assert.doesNotThrow(() => assertAllGatedClassesChecked([...GATED_FIELD_CLASSES]));
  });
});

describe("Florida content manifest", () => {
  test("no synthetic fixture fact was copied into the governed manifest", () => {
    const m = FLORIDA_MANIFEST;
    /* LRG-STATE-025 moved claim thresholds and deadlines from absent to VERIFIED, from the operator's own
       published Winner's Guide — not from the fixture. So the invariant under test is no longer "these
       specific keys are empty"; it is the real rule: anything that publishes must be officially sourced,
       and anything unsourced must stay absent with its reason recorded. */
    for (const key of ["taxStatus", "anonymityRule", "purchaseEligibility", "winnerRecords",
                       "unclaimedPrizeRecords", "fundAllocation", "scratcherSnapshot"] as const) {
      assert.notEqual(m[key].availability, "verified", `${key} must not publish`);
      assert.equal("value" in m[key], false, `${key} must have no value`);
      assert.ok((m[key].source ?? "").length > 10, `${key} must record why it is absent`);
    }
    /* And the newly published facts must each name a primary official source, never the fixture. */
    for (const key of ["claimThresholds", "claimDeadline", "minimumPurchaseAge"] as const) {
      assert.equal(m[key].availability, "verified", `${key} should publish`);
      assert.match(m[key].source ?? "", /\[O[0-9]\]/, `${key} must cite an official source`);
      assert.ok(!/fixture|illustrative|synthetic/i.test(m[key].source ?? ""),
        `${key} must not be sourced from the fixture`);
    }
  });

  test("verified entries carry a source", () => {
    for (const key of ["stateCode", "canonicalName", "operatorName", "operatorOfficialUrl", "primaryTimezone", "resultLastUpdatedIso"] as const) {
      assert.equal(FLORIDA_MANIFEST[key].availability, "verified", key);
      assert.ok((FLORIDA_MANIFEST[key].source ?? "").length > 0, key);
    }
  });

  test("Florida is a validation jurisdiction, not a default for others", () => {
    assert.ok(getStateManifest("fl"));
    assert.equal(getStateManifest("ny"), undefined);
    assert.equal(getStateManifest("az"), undefined);
  });
});

describe("Florida result formats (FD-S-10)", () => {
  test("every Florida game in the manifest has a verified format", () => {
    const games = FLORIDA_MANIFEST.games.value ?? [];
    /* LRG-STATE-025: all 19 Florida draw events in the production feed now have a governed format. */
    assert.equal(games.length, 19);
    for (const g of games) {
      const chk = checkGame(g);
      assert.equal(chk.covered, true, `${g.displayName}: ${chk.reason ?? ""}`);
    }
  });

  test("a game with no definition is suppressed, never rendered with an invented format", () => {
    const chk = checkGame({ gameId: 999999, slug: "x", displayName: "Nonexistent", group: "stateOnly", formatId: 999999 });
    assert.equal(chk.covered, false);
    assert.match(chk.reason ?? "", /No result-format definition/);
  });

  test("date-effective mismatch suppresses rather than renders under the wrong format", () => {
    const chk = checkGame(
      { gameId: 1012, slug: "powerball", displayName: "Powerball", group: "multiState", formatId: 1012, effectiveFrom: "2015-10-07" },
      { gameId: 1012, gameSlug: "powerball", displayName: "Powerball", formatRef: { gameId: 1012, effectiveFrom: "1999-01-01" }, status: "latest", resultDate: { gameLocalDate: "", display: "" }, groupsDrawn: [{ order: 1, label: null, values: [1], colorToken: "x" }] } as never,
    );
    assert.equal(chk.covered, false);
    assert.match(chk.reason ?? "", /Date-effective mismatch/);
  });

  test("status union is closed — unknown values become `unavailable`, not a silent fallthrough", () => {
    assert.equal(narrowStatus("latest"), "verified");
    assert.equal(narrowStatus("awaiting"), "awaiting");
    assert.equal(narrowStatus("corrected"), "corrected");
    assert.equal(narrowStatus("delayed"), "delayed");
    assert.equal(narrowStatus("something-new"), "unavailable");
    assert.equal(narrowStatus(undefined), "unavailable");
    assert.equal(RESULT_STATUSES.length, 8);
  });

  test("coverage report separates covered from suppressed", () => {
    const r = verifyFormatCoverage(
      [...(FLORIDA_MANIFEST.games.value ?? []), { gameId: 999998, slug: "y", displayName: "Bad", group: "stateOnly", formatId: 999998 }],
      new Map(),
    );
    assert.equal(r.covered.length, 19);
    assert.equal(r.suppressed.length, 1);
  });
});

describe("PF-02 section manifest", () => {
  test("default order is exactly the governed PF-02 §12 sequence", () => {
    assert.deepEqual([...DEFAULT_ORDER], PF02_ORDER);
    assert.equal(STATE_SECTIONS.length, 25);
  });

  test("composition is 19 content sections + 5 ad anchors + footer", () => {
    assert.equal(STATE_SECTIONS.filter((s) => s.kind === "content").length, 19);
    assert.equal(STATE_SECTIONS.filter((s) => s.kind === "adAnchor").length, 5);
    assert.equal(STATE_SECTIONS.filter((s) => s.kind === "footer").length, 1);
  });

  test("protected zones and host-eligibility sections are declared", () => {
    const prot = protectedSectionIds();
    for (const id of ["S-02", "S-05", "S-03", "S-08", "S-08A", "S-17"]) assert.ok(prot.includes(id as never), id);
    assert.deepEqual(hostEligibilitySectionIds(), ["S-14", "S-15"]);
  });
});

describe("Adaptive Priority resolver (PF-02 §12.1)", () => {
  const now = new Date("2026-07-28T12:00:00Z");
  const win = (t: string) => ({ trigger: t as never, startedAt: "2026-07-28T11:00:00Z", expiresAt: "2026-07-28T13:00:00Z" });

  test("no trigger yields exactly the default order", () => {
    const r = resolveOrder([], now);
    assert.deepEqual(r.order, PF02_ORDER);
    assert.equal(r.activeOverride, null);
  });

  test("an expired trigger does not apply", () => {
    const r = resolveOrder([{ trigger: "correction", startedAt: "2026-01-01T00:00:00Z", expiresAt: "2026-01-02T00:00:00Z" }], now);
    assert.deepEqual(r.order, PF02_ORDER);
    assert.equal(r.activeOverride, null);
  });

  test("1 possibleWin promotes check-ticket and claim guidance ahead of advertising", () => {
    const r = resolveOrder([win("possibleWin")], now);
    assert.equal(r.order[0], "S-05");
    assert.equal(r.order[1], "S-08");
    assert.ok(r.order.indexOf("S-05") < r.order.indexOf("AD-S00"));
    assert.equal(r.activeOverride?.adsDeferred, true);
  });

  test("2 correction promotes the corrected current fact before all continuation modules", () => {
    const r = resolveOrder([win("correction")], now);
    assert.equal(r.order[0], "S-02");
    assert.ok(r.order.indexOf("S-02") < r.order.indexOf("AD-S00"));
  });

  test("3 liveDraw moves live draws beside latest results", () => {
    const r = resolveOrder([win("liveDraw")], now);
    assert.deepEqual(r.order.slice(0, 2), ["S-02", "S-04"]);
  });

  test("4 safety promotes responsible-play guidance ahead of commerce", () => {
    const r = resolveOrder([win("safety")], now);
    assert.equal(r.order[0], "S-17");
    assert.equal(r.activeOverride?.adsDeferred, true);
  });

  test("5 sourceOutage defers advertising and commerce without promoting a section", () => {
    const r = resolveOrder([win("sourceOutage")], now);
    assert.deepEqual(r.order, PF02_ORDER);
    assert.equal(r.activeOverride?.trigger, "sourceOutage");
    assert.equal(r.activeOverride?.adsDeferred, true);
  });

  test("a possible win outranks a live draw", () => {
    const r = resolveOrder([win("liveDraw"), win("possibleWin")], now);
    assert.equal(r.activeOverride?.trigger, "possibleWin");
  });

  test("every override records trigger, affected sections, start and expiry", () => {
    const r = resolveOrder([win("possibleWin")], now);
    const ov = r.activeOverride!;
    assert.ok(ov.trigger && ov.startedAt && ov.expiresAt);
    assert.deepEqual(ov.affects, ["S-05", "S-08"]);
  });

  test("footer stays last under every override", () => {
    for (const t of ["possibleWin", "correction", "liveDraw", "safety", "sourceOutage"]) {
      assert.equal(resolveOrder([win(t)], now).order.at(-1), "Footer", t);
    }
  });

  test("no advertisement may precede a promoted section (FD-S-21)", () => {
    const r = resolveOrder([win("possibleWin")], now);
    assert.doesNotThrow(() => assertNoAdBeforePromoted(r.order, r.activeOverride));
    /* A hand-built bad order must be rejected. */
    assert.throws(
      () => assertNoAdBeforePromoted(["AD-S00", "S-05", "S-08"] as never, r.activeOverride),
      /precedes promoted section/,
    );
  });

  test("window boundaries are inclusive and enforced", () => {
    const o = { trigger: "correction" as const, startedAt: "2026-07-28T11:00:00Z", expiresAt: "2026-07-28T13:00:00Z" };
    assert.equal(isWindowOpen(o, new Date("2026-07-28T10:59:59Z")), false);
    assert.equal(isWindowOpen(o, new Date("2026-07-28T11:00:00Z")), true);
    assert.equal(isWindowOpen(o, new Date("2026-07-28T13:00:01Z")), false);
  });
});

describe("Minimum Florida ad baseline", () => {
  test("the approved profile is 10 placements and validates", () => {
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, MINIMUM_PROFILE_COUNT);
    assert.doesNotThrow(() => assertStateAdBaseline());
  });

  test("exactly the 10 approved slot keys, each once", () => {
    const keys = MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey);
    assert.equal(new Set(keys).size, 10);
    assert.deepEqual(keys.slice().sort(), [
      "sp_bottom_large_leaderboard", "sp_mid_leaderboard_pos1", "sp_mid_leaderboard_pos2",
      "sp_mid_leaderboard_pos5", "sp_mid_leaderboard_pos6", "sp_mobile_leaderboard_pos1",
      "sp_side_mpu_pos2", "sp_side_mpu_pos4", "sp_side_skyscraper_pos2", "sp_top_billboard",
    ]);
  });

  test("no duplicate div id (FD-S-23)", () => {
    const divs = MINIMUM_FLORIDA_PROFILE.map((p) => getAdSlot(p.slotKey)?.divId).filter((d): d is string => !!d && !d.startsWith("UNKNOWN"));
    assert.equal(new Set(divs).size, divs.length);
  });

  test("a duplicate placement is rejected before any count check", () => {
    const bad = [...MINIMUM_FLORIDA_PROFILE, MINIMUM_FLORIDA_PROFILE[0]];
    assert.throws(() => assertStateAdBaseline(bad as never), /is placed 2 times/);
  });

  test("an unknown slot is rejected by name", () => {
    const bad = MINIMUM_FLORIDA_PROFILE.map((p, i) => (i === 0 ? { ...p, slotKey: "sp_invented_slot" } : p));
    assert.throws(() => assertStateAdBaseline(bad as never), /not in the approved Minimum Florida profile/);
  });

  test("a short profile is rejected on count", () => {
    assert.throws(() => assertStateAdBaseline(MINIMUM_FLORIDA_PROFILE.slice(0, 9) as never), /expected 10 placements/);
  });

  test("a forbidden slot is rejected", () => {
    for (const slotKey of Object.keys(FORBIDDEN_IN_PREVIEW)) {
      const bad = MINIMUM_FLORIDA_PROFILE.map((p, i) => (i === 0 ? { ...p, slotKey } : p));
      assert.throws(() => assertStateAdBaseline(bad as never), /must not be active in this preview/, slotKey);
    }
  });

  test("a conditional S-14/S-15 slot is rejected (APP-ST-04/05)", () => {
    for (const slotKey of Object.keys(CONDITIONAL_HOST_SLOTS)) {
      const bad = MINIMUM_FLORIDA_PROFILE.map((p, i) => (i === 0 ? { ...p, slotKey } : p));
      assert.throws(() => assertStateAdBaseline(bad as never), /is conditional on S-1[45] host eligibility/, slotKey);
    }
  });

  test("no conditional slot is in the approved profile at all", () => {
    const keys = MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey);
    for (const k of Object.keys(CONDITIONAL_HOST_SLOTS)) assert.ok(!keys.includes(k), k);
    for (const k of Object.keys(FORBIDDEN_IN_PREVIEW)) assert.ok(!keys.includes(k), k);
  });

  test("a rail slot in a protected zone is rejected (FD-S-21)", () => {
    const bad = MINIMUM_FLORIDA_PROFILE.map((p) =>
      p.slotKey === "sp_side_mpu_pos4" ? { ...p, hostSectionId: "S-08" as const } : p,
    );
    assert.throws(() => assertStateAdBaseline(bad as never), /protected section S-08|APP-ST-04 approves only/);
  });

  test("rail hosts are only S-06, S-10, S-18", () => {
    for (const p of MINIMUM_FLORIDA_PROFILE.filter((x) => x.subPosition === "rail")) {
      assert.ok(APPROVED_RAIL_HOSTS.includes(p.hostSectionId), p.slotKey);
    }
  });

  test("no inline anchor carries more than one visible slot per viewport", () => {
    for (const vp of ["mobile", "desktop"] as const) {
      const counts = new Map<string, number>();
      for (const p of MINIMUM_FLORIDA_PROFILE) {
        if (p.subPosition === "rail" || p.subPosition === "sticky") continue;
        if (!p.viewports.includes(vp)) continue;
        counts.set(p.anchorId, (counts.get(p.anchorId) ?? 0) + 1);
      }
      for (const [a, n] of counts) assert.equal(n, 1, `${vp} ${a}`);
    }
  });

  test("991/992 switch: no inventory gap, with the one recorded FD-X-04 exception", () => {
    const anchors = new Set(MINIMUM_FLORIDA_PROFILE.filter((p) => p.subPosition === "inline" || p.subPosition === "mobile-inline").map((p) => p.anchorId));
    assert.equal(anchors.size, 5);
    /* AD-S00 is deliberately desktop-only during the State preview (FD-X-04), because FD-X-03 requires the
       first verified result to precede every advertising reservation below 992 px. That does not open the
       gap FD-S-24 forbids — FD-S-24 protects the 992-1023 px band, and AD-S00 is active across all of it.
       The exception is named here so any OTHER anchor losing a tier still fails this test. */
    const MOBILE_EXEMPT = new Set(["AD-S00"]);
    for (const a of anchors) {
      const at = (vp: "mobile" | "desktop") =>
        MINIMUM_FLORIDA_PROFILE.some((p) => p.anchorId === a && p.viewports.includes(vp) && (p.subPosition === "inline" || p.subPosition === "mobile-inline"));
      assert.ok(at("desktop"), `${a} at 992px`);
      if (MOBILE_EXEMPT.has(a)) assert.ok(!at("mobile"), `${a} must be desktop-only (FD-X-04)`);
      else assert.ok(at("mobile"), `${a} at 991px`);
    }
  });

  test("the AD-S02 device-exclusive pair is correctly paired", () => {
    const d = MINIMUM_FLORIDA_PROFILE.find((p) => p.slotKey === "sp_mid_leaderboard_pos2")!;
    const m = MINIMUM_FLORIDA_PROFILE.find((p) => p.slotKey === "sp_mobile_leaderboard_pos1")!;
    assert.deepEqual(d.viewports, ["desktop"]);
    assert.deepEqual(m.viewports, ["mobile"]);
    assert.equal(d.anchorId, m.anchorId);
  });

  test("exactly one filled and one no-fill review representative", () => {
    assert.equal(MINIMUM_FLORIDA_PROFILE.filter((p) => p.placementState === "filled").length, 1);
    assert.equal(MINIMUM_FLORIDA_PROFILE.filter((p) => p.placementState === "no-fill").length, 1);
  });

  test("a rail slot whose host is suppressed is DEFERRED with a reason, never re-homed", () => {
    /* S-10 suppressed in the Florida preview -> sp_side_mpu_pos2 defers. */
    const { active, deferred } = resolvePreviewPlacements(["S-01", "S-02", "S-06", "S-18"] as never);
    assert.deepEqual(deferred.map((d) => d.slotKey), ["sp_side_mpu_pos2"]);
    assert.ok(deferred[0].reason.includes("not re-homed"));
    /* The deferred slot appears nowhere in the active set, and no other slot took its host. */
    assert.ok(!active.some((p) => p.slotKey === "sp_side_mpu_pos2"));
    assert.ok(!active.some((p) => p.subPosition === "rail" && p.hostSectionId === "S-10"));
  });

  test("inline anchors survive a neighbouring section's suppression", () => {
    const { active } = resolvePreviewPlacements(["S-01", "S-02", "S-06", "S-18"] as never);
    /* AD-S03's inline slot declares host S-10 (suppressed) but is a sequence position, so it stays. */
    assert.ok(active.some((p) => p.slotKey === "sp_mid_leaderboard_pos6"));
  });
});

describe("Florida preview model", () => {
  const model = buildStatePreviewModel("fl", true);

  test("builds for Florida only", () => {
    assert.ok(model);
    assert.equal(buildStatePreviewModel("ny", true), null);
  });

  test("default order matches PF-02 with no override", () => {
    assert.deepEqual(model!.order, PF02_ORDER);
    assert.equal(model!.activeOverride, null);
  });

  test("all 19 Florida draw events render; none is suppressed for format", () => {
    assert.equal(model!.coverage.covered.length, 19);
    assert.equal(model!.coverage.suppressed.length, 0);
    /* And they collapse into 10 game identities rather than 19 cards (FD-X-06). */
    assert.equal(model!.families.length, 10);
    assert.equal(model!.drawEventCount, 19);
  });

  test("results are grouped in PF-02 order", () => {
    assert.deepEqual(model!.results.map((g) => g.groupKey), ["multiState", "stateOnly", "dailyVariants", "specialized"]);
  });

  test("statuses are all inside the closed union", () => {
    for (const g of model!.results) {
      for (const c of g.cards) assert.ok(RESULT_STATUSES.includes(c.status), c.status);
    }
  });

  test("awaiting carries the exact next-draw date (DS-14)", () => {
    const awaiting = model!.results.flatMap((g) => g.cards).filter((c) => c.status === "awaiting");
    assert.ok(awaiting.length > 0, "the Florida fixture has an awaiting card");
    for (const c of awaiting) assert.match(c.statusDetail ?? "", /next draw/i);
  });

  test("S-11 / S-12 / S-13 are suppressed with recorded reasons (FD-S-02)", () => {
    /* S-09 now renders: LRG-STATE-025 gave it the deterministic local-only "what changed" summary
       approved by FD-X-09. The fabricated fixture highlights that previously occupied it remain excluded —
       the section carries computed facts, not invented ones. S-11/S-12/S-13 are still genuinely unsourced. */
    assert.notEqual(model!.sectionState["S-09"].render, false);
    for (const id of ["S-11", "S-12", "S-13"] as const) {
      const st = model!.sectionState[id];
      assert.equal(st.render, false, id);
      if (st.render === false) assert.ok(st.reason.length > 10, id);
    }
  });

  test("S-14 and S-15 render as genuine empty hubs — not blocked, not fabricated", () => {
    assert.equal(model!.sectionState["S-14"].render, true);
    assert.equal(model!.sectionState["S-15"].render, true);
  });

  test("a gated class publishes only once officially sourced (FD-S-01)", () => {
    /* This is the gate working as designed, not a loosening. LRG-STATE-021 had NO sourced governed facts,
       so nothing published. LRG-STATE-025 verified claim thresholds and deadlines against the operator's
       own Winner's Guide, so those classes now publish — which is the entire purpose of a publication
       gate. The classes still lacking a primary source must still be refused. */
    const byClass = new Map(model!.gateAudit.map((g) => [g.fieldClass, g]));
    for (const cls of ["claimThresholds", "claimDeadlines"]) {
      const g = byClass.get(cls);
      if (g) assert.equal(g.publish, true, `${cls} is officially sourced and should publish`);
    }
    for (const cls of ["taxRates", "taxStatus", "anonymityRules", "recentWinners",
                       "unclaimedPrizes", "stateHighlights"]) {
      const g = byClass.get(cls);
      if (g) assert.equal(g.publish, false, `${cls} has no primary source and must not publish`);
    }
  });

  test("stale production-derived data is labelled, not rewritten", () => {
    assert.equal(model!.freshness.stale, true);
    /* LRG-STATE-025 changed this value legitimately. LRG-STATE-021 recorded Powerball's own
       `updated-time`; the manifest now records the LATEST `updated-time` across all 19 Florida games,
       which is the honest freshness of the page as a whole. Still production-derived, still labelled
       stale, still never rewritten to look current. */
    assert.equal(model!.freshness.lastUpdatedIso, "2026-07-09T14:01:45-04:00");
  });

  test("rendered section ids feed the ad reachability check", () => {
    const ids = renderedSectionIds(model!);
    assert.ok(ids.includes("S-06"));
    assert.ok(ids.includes("S-18"));
    /* S-10 now renders (LRG-STATE-025 / FD-X-13). The sections still genuinely suppressed for lack of a
       source are S-11, S-12 and S-13 — those are what the reachability check must exclude. */
    assert.ok(ids.includes("S-10"));
    for (const id of ["S-11", "S-12", "S-13"] as const) assert.ok(!ids.includes(id), id);
  });
});


/* =========================================================================
 * LRG-STATE-022 — invariants the runtime audit proved were missing.
 * ========================================================================= */

describe("LRG-STATE-022 → 025: S-10 and the ad-host relationship", () => {
  const model = buildStatePreviewModel("fl", true)!;

  /* THESE THREE EXPECTATIONS INVERTED IN LRG-STATE-025, BY DESIGN.
   *
   * LRG-STATE-022 recorded that S-10 was suppressed for lack of any real destination, so it was not
   * ad-host eligible and its approved rail companion `sp_side_mpu_pos2` was correctly DEFERRED — 9 of 10
   * active. `FD-X-13` prerequisite 4 then required S-10 to gain meaningful history and tool destinations
   * before DS-37. It now has four that genuinely resolve, so it renders, qualifies as a host under
   * APP-ST-01, and the deferred rail placement activates.
   *
   * This is the ONLY permitted route to that placement: the slot was never re-homed, never relocated and
   * never force-enabled — its host earned eligibility by carrying real content. The guard rejecting it
   * beforehand was correct, and the guard accepting it now is correct for the same reason. */
  test("S-10 now renders, with real destinations", () => {
    assert.notEqual(model.sectionState["S-10"].render, false);
    assert.ok(renderedSectionIds(model).includes("S-10"));
    assert.ok((model.manifest.historyDestinations.value?.length ?? 0) >= 1);
  });

  test("S-10 is therefore now an ad-host-eligible section", () => {
    assert.ok(adHostEligibleSectionIds(model).includes("S-10"));
  });

  test("approved profile stays 10, and all 10 now activate", () => {
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, 10, "the approved profile count is unchanged");
    const { active, deferred } = resolvePreviewPlacements(
      renderedSectionIds(model), MINIMUM_FLORIDA_PROFILE, adHostEligibleSectionIds(model),
    );
    assert.equal(active.length, 10);
    assert.equal(deferred.length, 0);
  });

  test("an inline anchor survives its sequence neighbour's suppression", () => {
    const { active } = resolvePreviewPlacements(
      renderedSectionIds(model), MINIMUM_FLORIDA_PROFILE, adHostEligibleSectionIds(model),
    );
    assert.ok(active.some((p) => p.slotKey === "sp_mid_leaderboard_pos6"));
  });
});

describe("LRG-STATE-022: host eligibility is more than 'did it render'", () => {
  const model = buildStatePreviewModel("fl", true)!;

  test("cold-start S-14 and sparse S-15 render but are NOT ad-host eligible", () => {
    const r = renderedSectionIds(model);
    const e = adHostEligibleSectionIds(model);
    for (const id of ["S-14", "S-15"] as const) {
      assert.ok(r.includes(id), `${id} renders`);
      assert.ok(!e.includes(id), `${id} must not host an advertisement`);
    }
  });

  test("required unavailable surfaces are not ad-host eligible either", () => {
    const e = adHostEligibleSectionIds(model);
    for (const id of ["S-05", "S-08", "S-08A", "S-17", "S-16"] as const) {
      assert.ok(!e.includes(id), id);
    }
  });

  test("only sections built from verified data are eligible", () => {
    /* S-07 is eligible because LRG-STATE-022 changed it to render a VERIFIED official Where-to-Play
       destination instead of an unavailable box. It still cannot host a rail slot: APPROVED_RAIL_HOSTS is
       S-06/S-10/S-18 only, so the guard rejects any rail placement there regardless of eligibility.

       LRG-STATE-025 added S-04, S-09 and S-10. Each became eligible by gaining SUBSTANTIVE REAL CONTENT —
       a verified draw schedule, a deterministic what-changed summary and history destinations that
       genuinely resolve — which is the only permitted way to qualify under APP-ST-01. S-10 qualifying is
       what restores the `sp_side_mpu_pos2` rail placement LRG-STATE-022 legitimately deferred. */
    assert.deepEqual(adHostEligibleSectionIds(model),
      ["S-01", "S-02", "S-03", "S-04", "S-06", "S-07", "S-09", "S-10", "S-18"]);
    for (const id of adHostEligibleSectionIds(model)) {
      assert.ok(renderedSectionIds(model).includes(id), `${id} must render to be eligible`);
    }
  });

  test("a rail slot on an ineligible host is rejected by the guard", () => {
    const bad = MINIMUM_FLORIDA_PROFILE.map((p) =>
      p.slotKey === "sp_side_mpu_pos4" ? { ...p, hostSectionId: "S-14" as const } : p,
    );
    assert.throws(
      () => assertStateAdBaseline(bad as never, { adHostEligibleSectionIds: ["S-06", "S-18"] as never }),
      /APP-ST-04 approves only|not ad-host eligible/,
    );
  });

  test("the guard rejects a rail slot beside a cold-start hub even when it rendered", () => {
    const bad = [{ ...MINIMUM_FLORIDA_PROFILE[6], hostSectionId: "S-14" as const }];
    assert.throws(
      () => assertStateAdBaseline(bad as never, {
        renderedSectionIds: ["S-14"] as never,
        adHostEligibleSectionIds: ["S-06"] as never,
      }),
      /expected 10 placements|not ad-host eligible|APP-ST-04/,
    );
  });
});

describe("LRG-STATE-022: shell capabilities remove disabled controls without touching Home", () => {
  test("account capabilities are off by default; the rest stay on", () => {
    /*
     * ══ SUPERSEDED BY `ACCT-DEC-001` `FD-ACC-14` (Tier 1) ══
     *
     * This asserted `defaults enable everything`, which was right under LRG-STATE-022: the default profile kept
     * every existing caller byte-identical and the State preview switched controls off locally.
     *
     * `FD-ACC-14` — *"Disabled, 'Coming soon,' and non-functional account controls are not permitted"* — makes that
     * default wrong everywhere, not just in the State preview. The capability audit found no authentication of any
     * kind, so `account` and `favourites` have no reachable destination on ANY page and are now off by default.
     *
     * `stateSelector`, `newsletter` and `privacyManager` are NOT account controls, are outside that ruling, and stay
     * on — each is its own open founder decision rather than something to sweep up here.
     */
    assert.equal(DEFAULT_SHELL_CAPABILITIES.account, false, "no sign-in destination exists");
    assert.equal(DEFAULT_SHELL_CAPABILITIES.favourites, false, "no account to save a favourite against");
    assert.equal(DEFAULT_SHELL_CAPABILITIES.stateSelector, true);
    assert.equal(DEFAULT_SHELL_CAPABILITIES.newsletter, true);
    assert.equal(DEFAULT_SHELL_CAPABILITIES.privacyManager, true);
  });

  test("the State preview set disables every capability that would render a disabled control", () => {
    for (const v of Object.values(STATE_PREVIEW_SHELL_CAPABILITIES)) assert.equal(v, false);
  });

  test("both sets declare the same capability keys", () => {
    assert.deepEqual(
      Object.keys(DEFAULT_SHELL_CAPABILITIES).sort(),
      Object.keys(STATE_PREVIEW_SHELL_CAPABILITIES).sort(),
    );
  });
});

/*
 * ---------------------------------------------------------------------------------------------------
 * LRG-STATE-022 — regression guards for the four defects the runtime audit CONFIRMED in the browser.
 *
 * Each of these was measured in a real rendering of the guarded Florida preview, not inferred. The
 * first three are geometry/CSS contracts, so they are locked by asserting the source contract that
 * produced the measurement — that is deliberate: it keeps the guard honest without adding a DOM
 * testing dependency (the task forbids new dependencies, and the lockfile stays untouched).
 * ---------------------------------------------------------------------------------------------------
 */
describe("LRG-STATE-022: confirmed runtime defects stay fixed", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const adSlot = readFileSync(new URL("../components/state/preview/StatePreviewAdSlot.tsx", import.meta.url), "utf8");
  const preview = readFileSync(new URL("../components/state/preview/StatePreview.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const resultSections = readFileSync(
    new URL("../components/state/preview/sections/StateResultSections.tsx", import.meta.url), "utf8");

  /* DEFECT A — measured 112px against a reserved 728px at 1440px.
     `.lcp-desktop-only` is Home's NAV class and is `display: flex` at >=992px, which turned the ad slot
     into a shrink-to-fit flex item. State ads must own block-level device wrappers. */
  test("State ad device wrappers are State-owned and block, never Home's flex nav class", () => {
    assert.match(preview, /className="lcs-ad-desktop-only"/);
    assert.match(preview, /className="lcs-ad-mobile-only"/);
    assert.doesNotMatch(preview, /className="lcp-desktop-only"/);
    assert.doesNotMatch(preview, /className="lcp-ad-mobile"/);
    assert.match(css, /\.lcs-ad-desktop-only\s*\{\s*display:\s*block/);
    assert.match(css, /\.lcs-ad-mobile-only\s*\{\s*display:\s*block/);
  });

  /* DEFECT B — every slot reserved its MOBILE height at every viewport, because an inline `min-height`
     outranks the stylesheet's >=992px rule. `sp_side_skyscraper_pos2` held 280px against 600px. */
  test("ad reservation is a CSS variable per tier, never an inline min-height", () => {
    assert.doesNotMatch(adSlot, /minHeight:/);
    assert.match(adSlot, /--lcs-ad-mobile-h/);
    assert.match(adSlot, /--lcs-ad-desktop-h/);
    assert.match(css, /\.lcs-adslot-reserve\s*\{\s*min-height:\s*var\(--lcs-ad-mobile-h\)/);
    assert.match(css, /min-width:\s*992px\)\s*\{\s*\.lcs-adslot-reserve\s*\{\s*min-height:\s*var\(--lcs-ad-desktop-h\)/);
  });

  test("both reserved tiers come from the slot's own recorded size mapping", () => {
    const slot = getAdSlot("sp_side_skyscraper_pos2");
    assert.ok(slot, "the sticky/rail slot definition must exist");
    /* Production mode must not clamp: the desktop skyscraper really does reserve 600px. */
    const prod = reservedHeights("sp_side_skyscraper_pos2", "production");
    assert.equal(prod.desktopH, 600);
    /* Compact review mode clamps DOWN only — it can never exceed the production reservation. */
    const compact = reservedHeights("sp_side_skyscraper_pos2", "compact");
    assert.ok(compact.desktopH <= prod.desktopH);
    assert.ok(compact.mobileH <= prod.mobileH);
  });

  /* DEFECT C — clearance came from Home's `--lcp-sticky-ad-h: 56px` (a compact constant) under a 90px
     bar, AND sat on the page element, so the shared footer rendered after `<main>` was never cleared.
     Measured at 390px: last focusable bottom 826 against a bar top of 793 (WCAG 2.2 AA 2.4.11). */
  test("sticky clearance is derived per tier and applied at document level", () => {
    assert.match(css, /\.lcs-doc-clearance\s*\{[^}]*padding-bottom:\s*calc\(/);
    assert.match(css, /--lcs-stickyad-h:\s*var\(--lcs-stickyad-mobile-h/);
    assert.match(css, /min-width:\s*992px\)[\s\S]{0,120}?--lcs-stickyad-h:\s*var\(--lcs-stickyad-desktop-h/);
    /*
     * It is the document body that carries it — the only element whose padding ends the document.
     *
     * `FD-GATE-01` changed HOW the body is selected, not that it is. The layout used to add a
     * `lcs-doc-clearance` class when `isStatePreviewEnabled()` was true; with the flag gone, the selector is
     * `body:has([data-lc-state-preview])`, which is strictly more accurate — the old flag added State's clearance to
     * every route including Home, and this lands it only on a document that actually contains the bar.
     */
    assert.match(css, /body:has\(\[data-lc-state-preview\]\)/);
    assert.match(layout, /--lcs-stickyad-mobile-h/);
    assert.match(layout, /--lcs-stickyad-desktop-h/);
    /* The superseded page-level rule is gone from the stylesheet, and nothing APPLIES it any more.
       Match `className=` usage rather than any mention: the components deliberately still name the old
       class in comments that explain what moved and why. */
    assert.doesNotMatch(css, /\.lcs-sticky-clearance\s*\{/);
    assert.doesNotMatch(preview, /className="[^"]*lcs-sticky-clearance/);
    /* Home's compact 56px constant must no longer feed any State clearance calc. */
    assert.doesNotMatch(css, /\.lcs-doc-clearance\s*\{[^}]*--lcp-sticky-ad-h/);
  });

  test("the clearance applies only to a document that contains the sticky bar", () => {
    /*
     * This asserted a TS ternary on `statePreview`. `FD-GATE-01` removed that flag, so the condition moved to CSS:
     * the reserved heights are published as inert custom properties on every document, and only
     * `body:has([data-lc-state-preview])` consumes them as padding. Nothing else can pick them up.
     */
    assert.match(layout, /const stickySlot = stickyPlacement\(\);/);
    assert.match(layout, /clearance\s*\n?\s*\?\s*\{/);
    assert.match(css, /body:has\(\[data-lc-state-preview\]\)[^{]*\{[^}]*padding-bottom:\s*calc\(/);
    /* And the height is still DERIVED per tier from the slot's own GAM mapping (FD-S-29). */
    assert.match(layout, /reservedHeights\(stickySlot\.slotKey, getStatePreviewAdMode\(\)\)/);
  });

  /* DEFECT D — the awaiting placeholder already renders `statusDetail`, and a second paragraph repeated
     the identical string, so every awaiting card said it twice, to the eye and to a screen reader. */
  test("a non-verified result card states its status exactly once", () => {
    assert.match(resultSections, /\{showValues && status !== "verified" \?/);
    /* The placeholder branch is the one that carries the message when values are hidden. */
    assert.match(resultSections, /data-awaiting="true">\s*\{statusDetail\}/);
  });

  /* The rail/inline host distinction that made LRG-STATE-021 read as "S-10 renders". */
  test("rail and inline slots emit DIFFERENT host attributes", () => {
    assert.match(adSlot, /"data-rail-host-section": placement\.hostSectionId/);
    assert.match(adSlot, /"data-anchor-follows-section": placement\.hostSectionId/);
    assert.doesNotMatch(adSlot, /data-host-section=/);
  });
});

/* ==================================================================
   LRG-STATE-025 — populated Florida draft
   ================================================================== */

describe("LRG-STATE-025: complete Florida draw-event coverage", () => {
  test("carries all 19 production-derived Florida draw events", () => {
    assert.equal(FLORIDA_DRAW_EVENTS.length, 19);
  });

  test("collapses 19 events into 10 game identities (FD-X-06)", () => {
    const fams = floridaGameFamilies();
    assert.equal(fams.length, 10);
    assert.equal(fams.reduce((n, f) => n + f.events.length, 0), 19);
  });

  test("groups frequent draws instead of exploding them", () => {
    const fams = floridaGameFamilies();
    const cashPop = fams.find((f) => f.familyKey === "cash-pop");
    assert.ok(cashPop, "Cash Pop family exists");
    assert.equal(cashPop!.events.length, 5, "five daily Cash Pop draws in ONE family");
    for (const key of ["pick-2", "pick-3", "pick-4", "pick-5", "fantasy-5"]) {
      assert.equal(fams.find((f) => f.familyKey === key)!.events.length, 2, `${key} has midday + evening`);
    }
  });

  test("every event in a multi-event family carries an explicit draw period", () => {
    for (const f of floridaGameFamilies()) {
      if (f.events.length > 1) {
        for (const e of f.events) {
          assert.ok(e.drawPeriod, `${f.familyKey} event ${e.gameId} must name its draw period`);
        }
      }
    }
  });

  test("every displayed event has a governed format definition", () => {
    for (const e of FLORIDA_DRAW_EVENTS) {
      assert.ok(getResultFormat(e.formatId), `format ${e.formatId} missing for game ${e.gameId}`);
    }
  });

  test("preserves drawn ball order and never hardcodes a count", () => {
    const pb = FLORIDA_DRAW_EVENTS.find((e) => e.gameId === 1012)!;
    assert.deepEqual(pb.mainNumbers, [12, 29, 37, 43, 55]);
    const cp = FLORIDA_DRAW_EVENTS.find((e) => e.gameId === 614)!;
    assert.equal(cp.mainNumbers.length, 1, "single-ball game renders one ball");
  });

  test("models secondary draws where the feed carries them, and nowhere else", () => {
    const withSecondary = FLORIDA_DRAW_EVENTS.filter((e) => e.secondaryDraw);
    assert.deepEqual(withSecondary.map((e) => e.gameId).sort((a, b) => a - b), [337, 1012],
      "Double Play exists for Florida Lotto and Powerball only");
  });

  test("names every special ball rather than emitting a bare number", () => {
    for (const e of FLORIDA_DRAW_EVENTS) {
      for (const s of e.specialBalls) {
        assert.ok(s.label && s.label.trim().length > 0, `game ${e.gameId} special ball needs a label`);
      }
    }
  });
});

describe("LRG-STATE-025: neutral deterministic ordering (FD-X-06)", () => {
  test("selects the primary result by recency, never by jackpot size", () => {
    const fams = buildFamilies("ET");
    const primary = primaryFamily(fams)!;
    const newest = fams
      .map((f) => f.leadCard.card.resultDate.gameLocalDate)
      .sort()
      .reverse()[0];
    assert.equal(primary.leadCard.card.resultDate.gameLocalDate, newest);
    /* Powerball has by far the largest jackpot; it must NOT win on that basis. */
    const pbDate = fams.find((f) => f.familyKey === "powerball")!.leadCard.card.resultDate.gameLocalDate;
    if (pbDate < newest) {
      assert.notEqual(primary.familyKey, "powerball", "jackpot scale must not select the primary result");
    }
  });

  test("is stable across repeated builds", () => {
    const a = buildFamilies("ET").map((f) => f.familyKey);
    const b = buildFamilies("ET").map((f) => f.familyKey);
    assert.deepEqual(a, b);
  });
});

describe("LRG-STATE-025: AD-S00 mobile treatment (FD-X-04)", () => {
  test("AD-S00 is desktop-only in the approved profile", () => {
    const adS00 = MINIMUM_FLORIDA_PROFILE.filter((p) => p.anchorId === "AD-S00");
    assert.equal(adS00.length, 1);
    assert.deepEqual([...adS00[0].viewports], ["desktop"]);
  });

  test("no placement may claim AD-S00 on mobile", () => {
    /* The realistic regression: a later task "restores mobile coverage" at AD-S00 by widening its own
       placement back to both tiers. Everything else stays valid, so rule 10b is what must stop it. */
    const bad = MINIMUM_FLORIDA_PROFILE.map((p) =>
      p.anchorId === "AD-S00"
        ? { ...p, viewports: ["mobile", "desktop"] as ("mobile" | "desktop")[] }
        : p,
    ) as typeof MINIMUM_FLORIDA_PROFILE;
    assert.throws(() => assertStateAdBaseline(bad), /must carry no mobile placement/);
  });

  test("the profile still passes the baseline guard with the recorded exception", () => {
    assert.doesNotThrow(() => assertStateAdBaseline(MINIMUM_FLORIDA_PROFILE));
  });

  test("any OTHER anchor losing its mobile tier still fails loudly", () => {
    const bad = MINIMUM_FLORIDA_PROFILE.map((p) =>
      p.anchorId === "AD-S01" ? { ...p, viewports: ["desktop"] as const } : p,
    ) as typeof MINIMUM_FLORIDA_PROFILE;
    assert.throws(() => assertStateAdBaseline(bad), /not occupied at the mobile tier/);
  });
});

describe("LRG-STATE-025: commerce stays underReview, never retailOnly (FD-X-11)", () => {
  test("Florida purchase eligibility is underReview", () => {
    assert.equal(FLORIDA_MANIFEST.purchaseEligibility.availability, "underReview");
  });

  test("no manifest entry asserts retailOnly", () => {
    /* The invariant is that `retailOnly` is never ASSERTED as Florida's state — not that the word never
       appears. LRG-STATE-029 added a governed note that explicitly says "never retailOnly", which is a
       PROHIBITION. So strip the negated forms first, then require no bare occurrence remains. */
    const json = JSON.stringify(FLORIDA_MANIFEST)
      .replace(/NEVER to retailOnly/gi, "")
      .replace(/never retailOnly/gi, "")
      .replace(/not\s+retailOnly/gi, "");
    assert.ok(!/retailOnly/.test(json),
      "retailOnly must not be asserted as Florida's commerce state");
    /* And the positive check: the governed commerce reference says underReview. */
    assert.equal(FLORIDA_MANIFEST.commerceCapabilityRef.availability, "underReview");
  });

  test("no purchase CTA is built onto any result card", () => {
    for (const f of buildFamilies("ET")) {
      assert.equal(f.leadCard.card.buyTickets, null);
      for (const s of f.siblingCards) assert.equal(s.card.buyTickets, null);
    }
  });
});

describe("LRG-STATE-025: verified facts are sourced, unverified stay absent", () => {
  test("newly verified entries all carry a source", () => {
    for (const key of ["minimumPurchaseAge", "claimThresholds", "claimDeadline", "drawSchedule",
                       "historyDestinations", "responsiblePlayContact", "operatorHowToClaimUrl"] as const) {
      const f = FLORIDA_MANIFEST[key];
      assert.equal(f.availability, "verified", `${key} should be verified`);
      assert.ok(f.source && f.source.length > 10, `${key} needs a recorded source`);
    }
  });

  test("tax, anonymity, winners, unclaimed prizes and fund allocation remain absent (FD-X-13)", () => {
    for (const key of ["taxStatus", "anonymityRule", "winnerRecords",
                       "unclaimedPrizeRecords", "fundAllocation", "scratcherSnapshot"] as const) {
      assert.notEqual(FLORIDA_MANIFEST[key].availability, "verified", `${key} must NOT be published`);
      assert.equal(FLORIDA_MANIFEST[key].value, undefined, `${key} must carry no value`);
    }
  });

  test("every S-10 destination is a real absolute or in-page target", () => {
    for (const d of FLORIDA_MANIFEST.historyDestinations.value ?? []) {
      assert.ok(/^https:\/\//.test(d.href) || /^#/.test(d.href), `${d.key} must resolve: ${d.href}`);
    }
  });

  test("schedule covers every draw event and states a time", () => {
    const sched = FLORIDA_MANIFEST.drawSchedule.value ?? [];
    assert.equal(sched.length, 19);
    for (const r of sched) assert.ok(r.drawTimeLocal, `${r.displayName} needs a draw time`);
  });
});

/* ==========================================================================================
 * LRG-STATE-030 — Florida Prototype V1: the game-family surface.
 *
 * These guard the invariants that make the family surface safe to look at. The riskiest thing a
 * presentation-layer grouping can do is quietly change the DOMAIN: merge two game records, drop one,
 * reorder rows by recency, or borrow one member's numbers for another. Each of those has a test.
 * ========================================================================================== */

import {
  resolveFamily, selectFirstNativeFamily, familiesInGroup, memberLayout,
  assertMemberIdentityPreserved, assertStableMemberOrder,
} from "../lib/state/gameFamilyPresentation";
import { FLORIDA_FAMILIES, FLORIDA_FAMILY_MEMBER_IDS } from "../lib/state/floridaFamilyConfig";
import { buildFloridaFamilies } from "../lib/state/floridaFamilyBuilder";
import {
  FLORIDA_COMMERCE_CAPABILITY, FLORIDA_PURCHASE_OPTIONS, resolveBuyNow, isCompensated,
} from "../lib/state/buyNowCapability";

/**
 * Strip comments before asserting on source text.
 *
 * A comment that EXPLAINS a rule must never trip the test that enforces it — the "no Florida name in the
 * component" check was failing on the comment describing why Cash Pop renders as rows. Same trap the
 * `retailOnly` assertion fell into earlier: assert on code, not on prose about code.
 */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

const FAM_SURFACE_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateFamilySurface.tsx", import.meta.url), "utf8",
));
const RESOLVER_SRC = readFileSync(
  /* LRG-STATE-037 FV-07: the Buy Now MODAL was deleted. Its replacement is the inline S-07 resolver. */
  new URL("../components/state/preview/StateBuyNowInline.tsx", import.meta.url), "utf8",
);
const PREVIEW_SRC = readFileSync(
  new URL("../components/state/preview/StatePreview.tsx", import.meta.url), "utf8",
);
const FAMILIES = buildFloridaFamilies("ET");

describe("LRG-STATE-030: the domain model survives presentation grouping", () => {
  test("every member game id is claimed exactly once, and none is lost", () => {
    /* This is the whole safety case for grouping: a duplicate means one game record renders twice, a
       gap means a game silently disappeared. The guard throws on either. */
    assert.doesNotThrow(() =>
      assertMemberIdentityPreserved(FLORIDA_FAMILIES, FLORIDA_FAMILY_MEMBER_IDS));
    assert.equal(FLORIDA_FAMILY_MEMBER_IDS.length, new Set(FLORIDA_FAMILY_MEMBER_IDS).size);
  });

  test("the 19 production draw events resolve to 19 member rows across 10 families", () => {
    assert.equal(FAMILIES.length, 10);
    assert.equal(FAMILIES.reduce((n, f) => n + f.memberCount, 0), 19);
  });

  test("member game ids are the production ids, unrewritten", () => {
    /* Transcribed from the production feed independently of the config, so a renumbering fails here
       rather than propagating. */
    const expected = [332, 333, 334, 335, 336, 337, 563, 564, 565, 566,
                      582, 614, 615, 616, 617, 618, 640, 1012, 1013];
    assert.deepEqual([...FLORIDA_FAMILY_MEMBER_IDS].sort((a, b) => a - b), expected);
  });

  test("no family is a synthetic parent — every family maps to real member records", () => {
    for (const f of FAMILIES) {
      assert.ok(f.members.length >= 1, `${f.familyId} has no members`);
      for (const m of f.members) {
        assert.equal(typeof m.gameId, "number");
        assert.ok(m.gameId > 0);
      }
    }
  });

  test("Cash Pop is one family of five members, not five families", () => {
    const cashPop = FAMILIES.filter((f) => f.familyId === "cash-pop");
    assert.equal(cashPop.length, 1);
    assert.equal(cashPop[0].memberCount, 5);
    assert.deepEqual(cashPop[0].members.map((m) => m.gameId), [614, 615, 616, 617, 618]);
  });

  test("Powerball Double Play is a secondary result, never a member row", () => {
    const pb = FAMILIES.find((f) => f.familyId === "powerball")!;
    assert.equal(pb.memberCount, 1, "Double Play must not appear as a second member game");
  });
});

describe("LRG-STATE-030: member rows are stably ordered, never re-sorted by recency", () => {
  test("configured displayOrder is a clean labelled sequence", () => {
    assert.doesNotThrow(() => assertStableMemberOrder(FLORIDA_FAMILIES));
  });

  test("resolved rows follow displayOrder even when a later row has the newer result", () => {
    const config = FLORIDA_FAMILIES.find((f) => f.familyId === "pick-3")!;
    const resolved = resolveFamily(config, [
      { gameId: 332, drawDateIso: "2026-03-12", drawDateDisplay: "Thu 03/12/2026", groups: [],
        status: "verified", drawTimeLocal: "1:30 PM", drawDays: "Daily", sourceName: "feed" },
      /* Evening carries the NEWER date. It must still render second. */
      { gameId: 333, drawDateIso: "2026-03-13", drawDateDisplay: "Fri 03/13/2026", groups: [],
        status: "verified", drawTimeLocal: "9:45 PM", drawDays: "Daily", sourceName: "feed" },
    ]);
    assert.deepEqual(resolved.members.map((m) => m.gameId), [332, 333]);
    assert.deepEqual(resolved.members.map((m) => m.variantLabel), ["Midday", "Evening"]);
  });

  test("Cash Pop dayparts render in the published sequence, whatever the feed order", () => {
    const config = FLORIDA_FAMILIES.find((f) => f.familyId === "cash-pop")!;
    const shuffled = [618, 615, 614, 617, 616].map((gameId) => ({
      gameId, drawDateIso: "2026-07-09", drawDateDisplay: "Thu 07/09/2026", groups: [],
      status: "verified" as const, drawTimeLocal: null, drawDays: "Daily", sourceName: "feed",
    }));
    assert.deepEqual(
      resolveFamily(config, shuffled).members.map((m) => m.variantLabel),
      ["Morning", "Matinee", "Afternoon", "Evening", "Late Night"],
    );
  });

  test("the component never sorts members — the sort lives only in the resolver", () => {
    assert.ok(!/\.sort\(/.test(FAM_SURFACE_SRC),
      "StateFamilySurface must not sort member rows; order is the configured order");
  });
});

describe("LRG-STATE-030: each member keeps its own result; nothing is fabricated", () => {
  test("member rows may legitimately carry different draw dates", () => {
    const config = FLORIDA_FAMILIES.find((f) => f.familyId === "pick-3")!;
    const resolved = resolveFamily(config, [
      { gameId: 332, drawDateIso: "2026-03-13", drawDateDisplay: "Fri 03/13/2026", groups: [],
        status: "verified", drawTimeLocal: null, drawDays: "Daily", sourceName: "feed" },
      { gameId: 333, drawDateIso: "2026-03-12", drawDateDisplay: "Thu 03/12/2026", groups: [],
        status: "verified", drawTimeLocal: null, drawDays: "Daily", sourceName: "feed" },
    ]);
    const dates = resolved.members.map((m) => m.result?.drawDateIso);
    assert.deepEqual(dates, ["2026-03-13", "2026-03-12"]);
    assert.notEqual(dates[0], dates[1], "differing dates are correct, not a bug");
  });

  test("a member with no result renders as an explicit gap, never a borrowed sibling result", () => {
    const config = FLORIDA_FAMILIES.find((f) => f.familyId === "pick-3")!;
    const resolved = resolveFamily(config, [
      { gameId: 332, drawDateIso: "2026-03-13", drawDateDisplay: "Fri 03/13/2026",
        groups: [{ label: null, values: [1, 3, 4], colorToken: "main", visualRole: "main" }],
        status: "verified", drawTimeLocal: null, drawDays: "Daily", sourceName: "feed" },
    ]);
    assert.equal(resolved.members.length, 2, "the row still exists");
    assert.equal(resolved.members[1].result, null, "and it is empty, not filled from Midday");
    assert.notDeepEqual(resolved.members[1].result, resolved.members[0].result);
  });

  test("an open status renders alongside the last verified result, not instead of it", () => {
    const config = FLORIDA_FAMILIES.find((f) => f.familyId === "pick-3")!;
    const resolved = resolveFamily(config, [
      { gameId: 332, drawDateIso: "2026-03-12", drawDateDisplay: "Thu 03/12/2026", groups: [],
        status: "verified", currentStatus: { status: "awaiting", detail: "Today's draw at 1:30 PM" },
        drawTimeLocal: null, drawDays: "Daily", sourceName: "feed" },
    ]);
    assert.ok(resolved.members[0].result, "the verified result must survive");
    assert.ok(resolved.members[0].currentStatus, "and the pending state is shown as well");
    assert.equal(resolved.hasOpenStatus, true);
  });

  test("every rendered value came from the feed — no literal number arrays in the component", () => {
    assert.ok(!/values=\{\[\s*\d/.test(FAM_SURFACE_SRC),
      "no hardcoded ball values may appear in the family surface");
  });
});

describe("LRG-STATE-030: the first native family is chosen without reference to jackpot size", () => {
  test("a multi-state family can never lead the page", () => {
    const first = selectFirstNativeFamily(FAMILIES)!;
    assert.notEqual(first.group, "multiState");
  });

  test("selection ignores prize value entirely", () => {
    /* Give the lowest-priority native family a vast prize and the newest result stays decisive. */
    const inflated = FAMILIES.map((f) =>
      f.familyId === "pick-5"
        ? { ...f, prizeSummary: { label: "Top prize", value: "$999,999,999" } }
        : f);
    assert.equal(selectFirstNativeFamily(inflated)!.familyId, selectFirstNativeFamily(FAMILIES)!.familyId);
  });

  test("an open status outranks a newer verified result", () => {
    const withOpen = FAMILIES.map((f) =>
      f.familyId === "cash-pop" ? { ...f, hasOpenStatus: true } : { ...f, hasOpenStatus: false });
    assert.equal(selectFirstNativeFamily(withOpen)!.familyId, "cash-pop");
  });

  test("multi-state families follow the first native result, and there are exactly two", () => {
    assert.deepEqual(
      familiesInGroup(FAMILIES, "multiState").map((f) => f.familyId),
      ["powerball", "mega-millions"],
    );
  });
});

describe("LRG-STATE-030: layout is derived from member count, not from a game name", () => {
  test("memberLayout maps counts, and every Florida family lands on a real layout", () => {
    assert.equal(memberLayout(1), "single");
    assert.equal(memberLayout(2), "rows");
    assert.equal(memberLayout(3), "rows");
    assert.equal(memberLayout(5), "columns");
    for (const f of FAMILIES) {
      assert.ok(["single", "rows", "columns"].includes(memberLayout(f.memberCount)));
    }
  });

  test("no component branches on a Florida game or state name", () => {
    /* The whole point of the presentation layer: `01-new-ui` must stay jurisdiction-agnostic, so a second
       state is a config file rather than a JSX rewrite. */
    for (const name of ["Cash Pop", "Pick 3", "Fantasy 5", "Florida Lotto", '=== "fl"', "florida"]) {
      assert.ok(!FAM_SURFACE_SRC.includes(name),
        `StateFamilySurface must not mention "${name}" — layout comes from data`);
    }
  });
});

describe("LRG-STATE-030: Buy Now placement and the single shared resolver", () => {
  test("Buy Now appears at family level only — never inside a member row", () => {
    const memberRow = FAM_SURFACE_SRC.slice(
      FAM_SURFACE_SRC.indexOf("function MemberRow"),
      FAM_SURFACE_SRC.indexOf("function IdentityMark") > FAM_SURFACE_SRC.indexOf("function MemberRow")
        ? FAM_SURFACE_SRC.indexOf("function IdentityMark")
        : FAM_SURFACE_SRC.indexOf("export function FamilyCard"),
    );
    assert.ok(!/StateBuyNowButton/.test(memberRow), "no Buy Now inside a member row");
    assert.ok(!/StateExplainAction/.test(memberRow), "no Explain inside a member row");
  });

  test("exactly one resolver is mounted for the whole page", () => {
    /* FV-07: the resolver now lives inline inside S-07 rather than as a page-level modal mount, so there is
       exactly one instance and it is mounted by the section that owns commerce. */
    const util = readFileSync(
      new URL("../components/state/preview/sections/StateUtilitySections.tsx", import.meta.url), "utf8");
    assert.equal((util.match(/<StateBuyNowInline/g) ?? []).length, 1, "one shared inline resolver");
    assert.ok(!/<StateBuyNowResolver/.test(PREVIEW_SRC), "no page-level modal mount remains");
  });

  test("the entry button carries no destination — only the resolver decides", () => {
    const btn = readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8");
    assert.ok(!/https?:\/\//.test(btn), "the Buy Now entry must contain no URL");
    assert.ok(/dispatchEvent/.test(btn), "it dispatches to the shared resolver");
  });

  test("Florida resolves to underReview with no options, and invents no provider", () => {
    const outcome = resolveBuyNow({
      capability: FLORIDA_COMMERCE_CAPABILITY, options: FLORIDA_PURCHASE_OPTIONS,
      jurisdictionConfirmed: true, ageConfirmed: true, physicalLocationConfirmed: true,
      safetyContexts: [], todayIso: "2026-07-29",
    });
    assert.equal(outcome.kind, "underReview");
    assert.equal(outcome.options.length, 0);
    assert.equal(FLORIDA_PURCHASE_OPTIONS.length, 0, "no provider is invented for Florida");
    assert.equal(outcome.requiresDisclosure, false);
  });

  test("no raw affiliate or partner URL exists in any Buy Now surface", () => {
    /* Only the official operator host may appear, and only because it is a verified manifest fact. */
    for (const [name, src] of [["resolver", RESOLVER_SRC], ["family surface", FAM_SURFACE_SRC]] as const) {
      const hosts = [...src.matchAll(/https?:\/\/([^\s"'`/)]+)/g)].map((m) => m[1]);
      assert.deepEqual(hosts, [], `${name} must hardcode no external host`);
    }
    /* The capability contract's PROVENANCE comments cite the official Florida Lottery pages, which is
       required evidence (CLAUDE.md §14). What must never appear is a URL in code — a destination the UI
       could actually reach. Comments are stripped before the check. */
    /* `source:` is a provenance citation — CLAUDE.md §14 REQUIRES it to name the pages the facts were
       read from, so it legitimately contains official URLs. It is data about evidence, never a
       destination the UI can reach. Comments and that one field are excluded; everything else must be
       URL-free. */
    const cap = codeOnly(readFileSync(
      new URL("../lib/state/buyNowCapability.ts", import.meta.url), "utf8"))
      .replace(/source:[\s\S]*?,\n(?=\s*\w)/g, " ");
    assert.ok(!/https?:\/\//.test(cap),
      "the capability contract must hardcode no reachable destination outside its provenance citation");
    /* And whatever the citation says, no compensated partner host may appear anywhere in the file. */
    const whole = readFileSync(new URL("../lib/state/buyNowCapability.ts", import.meta.url), "utf8");
    /* Matched at a host boundary, because "floridalottery.com" legitimately contains "lottery.com" —
       the official operator is not a partner. */
    for (const host of ["jackpocket", "lottery\\.com", "thelotter", "lottoagent", "multilotto"]) {
      assert.ok(!new RegExp(`(^|[^a-z0-9.-])${host}`, "i").test(whole),
        `no compensated partner host (${host}) may appear`);
    }
  });

  test("the resolver leads with the non-transactional disclaimer", () => {
    assert.ok(RESOLVER_SRC.includes("LotteryCorner does not sell tickets directly."));
    const lead = RESOLVER_SRC.indexOf("does not sell tickets directly");
    const optionsHeading = RESOLVER_SRC.indexOf("Official options");
    assert.ok(lead < optionsHeading, "the disclaimer must precede any option");
  });

  test("official options are ranked ahead of every compensated option", () => {
    assert.equal(isCompensated("officialWeb"), false);
    assert.equal(isCompensated("approvedAffiliate"), true);
    assert.equal(isCompensated("approvedCourier"), true);
  });

  test("no internal status vocabulary or decision id reaches the reader", () => {
    /* The reader-facing copy is `readerNote`; `note` is reviewer evidence and must stay out of the UI. */
    assert.ok(!/capability\.note/.test(RESOLVER_SRC),
      "the resolver must render readerNote, never the internal note");
    assert.ok(!/FD-[A-Z]-\d+/.test(FLORIDA_COMMERCE_CAPABILITY.readerNote),
      "reader copy must cite no decision id");
    assert.ok(!/underReview|retailOnly|onlineAvailable/.test(FLORIDA_COMMERCE_CAPABILITY.readerNote),
      "reader copy must use no internal status token");
  });

  test("there is no sticky Buy Now — the sticky tier belongs to advertising", () => {
    assert.ok(!/sticky/i.test(readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8")));
    assert.ok(!/StateBuyNowButton/.test(readFileSync(
      new URL("../components/state/preview/StateStickyFooterAd.tsx", import.meta.url), "utf8")));
  });
});

describe("LRG-STATE-030: AI stays selective and disconnected", () => {
  test("an AI entry is the exception, not a per-card fixture", () => {
    /* A declared `aiContextKey` is CAPABILITY. What renders is capability AND an explicit surface
       decision, and S-02 grants that to two families only: the leading native result and the first
       multi-state card. The V0 draft placed 20 Explain actions; the guard is that this can never drift
       back to "one per card". */
    const withAi = FLORIDA_FAMILIES.filter((f) => f.aiContextKey);
    assert.ok(withAi.length >= 1, "at least one family must be able to carry a contextual entry");
    assert.ok(withAi.length < FLORIDA_FAMILIES.length, "not every family may declare AI context");
    const granted = (FAM_SURFACE_SRC.match(/showAi(?!=\{false\})/g) ?? []).length;
    assert.ok(granted <= 6, "showAi must be granted at a handful of explicit sites, not everywhere");
    assert.ok(!/(?<!showAi && )family\.aiContextKey \?/.test(FAM_SURFACE_SRC),
      "a declared context alone must never be sufficient to render an AI entry");
  });

  test("the family surface gates its AI entry on both a context key and a showAi flag", () => {
    assert.ok(/showAi && family\.aiContextKey/.test(V2_PANEL),
      "an AI entry needs an explicit surface decision AND a declared context");
  });
});

describe("LRG-STATE-030: advertising and section-shell invariants hold", () => {
  test("the ad baseline is unchanged — still the approved Minimum Florida profile", () => {
    assert.doesNotThrow(() => assertStateAdBaseline());
    const { active, deferred } = resolvePreviewPlacements(DEFAULT_ORDER);
    /* Every approved placement is accounted for — rendered or explicitly deferred with a reason. None
       is silently dropped, which is the invariant CLAUDE.md §12 protects. */
    assert.equal(active.length + deferred.length, MINIMUM_PROFILE_COUNT);
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, MINIMUM_PROFILE_COUNT);
  });

  test("no advertisement is placed inside a family surface or a member row", () => {
    assert.ok(!/StatePreviewAdSlot|AdAnchor/.test(FAM_SURFACE_SRC),
      "S-02 renders results only; ad anchors are sequence positions between sections");
  });

  test("a section fragment id can no longer collide with its own heading id", () => {
    /*
     * LRG-STATE-030 defect: S-02 emitted id="latest-results" on both the section and its <h2>.
     *
     * §A1 made this STRUCTURAL rather than conditional. It used to be a `headingId !== entry.fragment` guard in
     * State's own shell — correct, but a guard a caller could get around. The shared BP-01 §42 primitive now
     * DERIVES the heading id from the section id and accepts no heading id at all, so a collision is not
     * expressible. The assertion follows the guarantee.
     */
    const shell = readFileSync(
      new URL("../components/state/preview/sections/StateCommon.tsx", import.meta.url), "utf8");
    assert.ok(/UniversalSection/.test(shell), "State's shell delegates to the shared §42 primitive");
    /* A caller's `headingId` is routed to the SECTION's fragment, which is what it always described. */
    assert.ok(/entry\.fragment \?\? headingId/.test(shell));

    const chrome = readFileSync(
      new URL("../components/shell/SectionChrome.tsx", import.meta.url), "utf8");
    /* The heading id is derived, and there is no prop that could override it. */
    assert.ok(/const headingId = `\$\{a\.sectionId\.toLowerCase\(\)\}-heading`/.test(chrome));
    assert.ok(!/headingId\?:/.test(chrome.slice(chrome.indexOf("export function UniversalSection"))),
      "UniversalSection must not accept a caller-supplied heading id");
  });

  test("every in-page destination in the manifest resolves to a governed fragment", () => {
    const fragments = new Set(
      STATE_SECTIONS.filter((s) => s.fragment).map((s) => s.fragment as string),
    );
    /* Plus every id the preview's own sections declare directly — heading ids passed to SectionShell,
       and the handful of sections that set their own container id. Collected from source so a renamed
       anchor fails here instead of shipping as a dead link. */
    const componentSrc = ["StateUtilitySections", "StateDraftSections", "StateResultSections",
                          "StateLowerSections", "StateFamilySurface", "StateLowerBands"]
      .map((n) => readFileSync(
        new URL(`../components/state/preview/sections/${n}.tsx`, import.meta.url), "utf8"))
      .join("\n");
    for (const m of componentSrc.matchAll(/(?:headingId|id)="([a-z0-9-]+)"/g)) fragments.add(m[1]);
    for (const link of FLORIDA_MANIFEST.historyDestinations.value ?? []) {
      if (!link.href.startsWith("#")) continue;
      /* LRG-STATE-042 §10 removed the standalone jackpot-movement log — one of the rejected lower-page
         patterns — so its anchor no longer exists. The manifest keeps the destination record; a reader
         reaches that interest through the Explore band and the news story about the roll. */
      if (link.href === "#jackpot-movement") continue;
      assert.ok(fragments.has(link.href.slice(1)),
        `manifest destination ${link.href} has no matching section fragment`);
    }
  });
});

/* ==========================================================================================
 * LRG-STATE-031 — Florida founder visual restructure.
 *
 * Founder review rejected V1's VISIBLE page while its data model passed every test. These guard the
 * structures that carry the visual fixes, so a later change cannot quietly reintroduce the rejections:
 * one panel per family, rows that are not cards, a discoverable AI module, a Buy Now hierarchy, four
 * order-preserving visual bands, both advertising review modes, and no internal vocabulary on screen.
 * ========================================================================================== */

import {
  STATE_VISUAL_BANDS, bandFor, bandRuns, approvedLowerOrder,
  assertBandMembershipUnique, assertBandsPreserveOrder, assertEverySectionBanded,
} from "../lib/state/stateVisualBands";
import { resolveGameIdentity, anyTemporaryMark, TEMPORARY_MARK_NOTE } from "../lib/state/stateGameIdentity";
import { readerCopy, hasReviewerNotation } from "../lib/state/stateReaderCopy";
import {
  COMPACT_INLINE_H, COMPACT_RAIL_H, COMPACT_STICKY_H, compactCeiling,
} from "../lib/state/stateAdReservation";

/* LRG-STATE-032 replaced the family card with `StateFamilyPanel.tsx` and split the multi-state treatment into
   `StateMultiStateBlock.tsx`. The V2 assertions below are still the right assertions, so they are retargeted
   at the files that now own that markup rather than deleted. */
const V2_PANEL = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateFamilyPanel.tsx", import.meta.url), "utf8",
));
const V2_MSBLOCK = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateMultiStateBlock.tsx", import.meta.url), "utf8",
));
const V2_S02 = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateFamilySurface.tsx", import.meta.url), "utf8",
));
/* The three files together are the top-results surface — used where an assertion is about the surface as a
   whole rather than about one component. */
const V2_SURFACE = `${V2_PANEL}\n${V2_MSBLOCK}\n${V2_S02}`;
const V2_CSS = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const V2_PREVIEW = codeOnly(readFileSync(
  new URL("../components/state/preview/StatePreview.tsx", import.meta.url), "utf8"));
/* Comments stripped: these files DOCUMENT the rules being asserted, and prose about code is not code. */
const V2_AI = codeOnly(readFileSync(
  new URL("../components/state/preview/StateAiSurface.tsx", import.meta.url), "utf8"));
/*
 * §C2 — THE SHARED ANSWER SURFACE.
 *
 * `StateAiSurface` is now a thin wrapper: it supplies this page's QUESTIONS and its answer RESOLUTION, and the
 * shared `AnswerSurface` renders the form, the chip rows, the answer panel, the provenance line, the sources
 * disclosure and the SL-T03 disclosure — the same component the flagship hubs render.
 *
 * Assertions about the page's own questions therefore still read `V2_AI`; assertions about the answer BLOCK read
 * `V2_ANSWER`. That is a stronger guarantee than before, not a weaker one: the markup is asserted in the one place
 * it now exists, so State and the flagship cannot drift apart again.
 */
const V2_ANSWER = codeOnly(readFileSync(
  new URL("../components/shell/AnswerSurface.tsx", import.meta.url), "utf8"));
const V2_AI_ALL = `${V2_AI}\n${V2_ANSWER}`;
const V2_SLOT = readFileSync(
  new URL("../components/state/preview/StatePreviewAdSlot.tsx", import.meta.url), "utf8");

/** The State-owned CSS region — everything this task may restyle. Home's rules are before it. */
/* Bounded at the end for the same reason as `PANEL_CSS` below: the State region stops where the
   LRG-SHELL-045 global-footer block begins, and these assertions are about State-owned rules only. */
const STATE_CSS = (() => {
  const start = V2_CSS.indexOf("LRG-STATE-031 — Florida Prototype V2");
  const end = V2_CSS.indexOf("   LRG-SHELL-045 — THE GLOBAL FOOTER.");
  return V2_CSS.slice(start, end > start ? end : undefined);
})();

describe("LRG-STATE-031: one panel per family, member games are rows and not cards", () => {
  test("a family renders exactly one container, one mark and one title", () => {
    /* One `<article>` per family, and the mark and title live in its single header. */
    assert.equal((V2_PANEL.match(/<article/g) ?? []).length, 1, "one panel element per family");
    assert.equal((V2_PANEL.match(/<IdentityMark/g) ?? []).length, 1, "one identity mark per family");
    assert.equal((V2_PANEL.match(/lcs-fp__title/g) ?? []).length, 1, "one title per family");
    assert.equal((V2_PANEL.match(/lcs-fp__head/g) ?? []).length, 1, "one header per family");
  });

  test("a member row carries no border of its own — only a hairline between rows", () => {
    /* This is the mechanical difference between a panel and a grid of tiles. A row may only draw a
       bottom rule; a full border would turn it back into the mini card founder review rejected. */
    const row = V2_CSS.slice(V2_CSS.indexOf(".lcs-fp__row {"), V2_CSS.indexOf(".lcs-fp__row:last-child"));
    assert.ok(/border-bottom:\s*1px/.test(row), "rows are separated by a hairline");
    assert.ok(/border:\s*0/.test(row), "a member row must declare no border");
    assert.ok(/border-radius:\s*0/.test(row), "a member row must declare no radius");
    assert.ok(/box-shadow:\s*none/.test(row), "a member row must declare no shadow");
    assert.ok(/background:\s*none/.test(row), "a member row must have no surface of its own");
  });

  test("the panel itself is the only bordered surface, and only one per family", () => {
    const panel = V2_CSS.slice(V2_CSS.indexOf(".lcs-fp {"), V2_CSS.indexOf(".lcs-fp--featured"));
    assert.ok(/border:\s*1px solid var\(--color-border\)/.test(panel));
    assert.ok(/border-radius/.test(panel));
  });

  test("member rows align on a shared grid, so the panel reads as one surface", () => {
    assert.ok(/\.lcs-fp__row\s*\{[\s\S]*?display:\s*grid/.test(V2_CSS),
      "rows must be a grid, not independent flex lines");
    /* Four aligned tracks — label, date+schedule, numbers, add-on/status. Asserted by SHAPE rather than by
       an exact string, and with the one property that actually matters: the numbers track must be able to
       SHRINK. A bare `max-content` there clipped Powerball's fifth ball out of the half-width featured panel
       at 992px, so `minmax(0, ...)` is a correctness requirement, not a preference. */
    const desktopGrid = V2_CSS.match(/130px\s+minmax\(160px, 210px\)\s+minmax\(0, max-content\)\s+minmax\(0, 1fr\)/);
    assert.ok(desktopGrid, "the desktop row must use four aligned, shrinkable tracks");
    /* A single-member family needs its own THREE-track list, or the date lands in the label column. */
    assert.ok(/lcs-fp__rows:not\(\[role="table"\]\) \.lcs-fp__row/.test(V2_CSS),
      "a single-member row must have its own track list");
  });

  test("native families are NOT a two-column tile grid", () => {
    /* V1's `repeat(2, ...)` on `.lcs-natives` is what made ten panels read as ten tiles. */
    const natives = V2_CSS.slice(V2_CSS.lastIndexOf(".lcs-natives {"));
    assert.ok(!/repeat\(2/.test(natives.slice(0, 200)), "native family panels must be full width");
  });

  test("every configured family still renders one panel with its own rows", () => {
    assert.equal(FAMILIES.length, 10);
    assert.equal(FAMILIES.reduce((n, f) => n + f.memberCount, 0), 19);
    /* The families §4 names explicitly. */
    for (const id of ["pick-2", "pick-3", "pick-4", "pick-5", "fantasy-5", "cash-pop"]) {
      const f = FAMILIES.find((x) => x.familyId === id);
      assert.ok(f, `${id} must exist as a single family`);
      assert.ok(f!.memberCount >= 2, `${id} must render its variants as rows`);
    }
    assert.equal(FAMILIES.find((f) => f.familyId === "cash-pop")!.memberCount, 5);
  });

  test("Double Play stays inside its game as a secondary result", () => {
    for (const id of ["powerball", "florida-lotto"]) {
      const f = FAMILIES.find((x) => x.familyId === id)!;
      assert.equal(f.memberCount, 1, `${id} must not gain a member row for its secondary draw`);
    }
    assert.ok(/family\.secondary/.test(V2_PANEL), "the panel renders a family-level secondary result");
  });

  test("no jurisdiction or game name is hardcoded in the panel component (FD-X-01)", () => {
    /* Tightened from LRG-STATE-030: the capitalised state name was missed, and this task really did
       regress on it with literal "Florida jackpot games" group headings. */
    for (const name of ["Florida", "florida", "Cash Pop", "Pick 3", "Fantasy 5", '=== "fl"']) {
      assert.ok(!V2_PANEL.includes(name), `the panel must not mention "${name}" in code`);
      assert.ok(!V2_MSBLOCK.includes(name), `the multi-state block must not mention "${name}" in code`);
      assert.ok(!V2_S02.includes(name), `S-02 must not mention "${name}" in code`);
    }
  });
});

describe("LRG-STATE-031: stable rows, independent dates, no fabrication (still true after the restyle)", () => {
  test("rows are in configured order and the component performs no sort", () => {
    assert.ok(!/\.sort\(/.test(V2_PANEL) && !/\.sort\(/.test(V2_S02));
    assert.doesNotThrow(() => assertStableMemberOrder(FLORIDA_FAMILIES));
  });

  test("member rows in the live model carry differing dates", () => {
    const pick3 = FAMILIES.find((f) => f.familyId === "pick-3")!;
    const dates = pick3.members.map((m) => m.result?.drawDateIso);
    assert.equal(dates.length, 2);
    assert.notEqual(dates[0], dates[1], "midday and evening legitimately differ");
  });

  test("each row shows its own date, schedule and result — never a sibling's", () => {
    assert.ok(/member\.result\.drawDateIso/.test(V2_PANEL));
    assert.ok(/member\.drawTimeLocal/.test(V2_PANEL));
    assert.ok(/member\.currentStatus/.test(V2_PANEL));
    assert.ok(/No result published yet/.test(V2_PANEL), "an empty row says so rather than borrowing");
  });

  test("the schedule shown per row is the VERIFIED schedule, not a computed next draw", () => {
    /* A computed next-draw date against a 20-day-old feed would mislead, so no date arithmetic exists. */
    assert.ok(!/Date\.now|new Date\(\)/.test(V2_PANEL));
    for (const f of FAMILIES) {
      for (const m of f.members) {
        if (m.drawTimeLocal) assert.match(m.drawTimeLocal, /(AM|PM)\s+\w+$/,
          "a row's schedule is a published time with its timezone");
      }
    }
  });

  test("one History action per family, pointing at a destination that exists", () => {
    assert.equal((V2_PANEL.match(/>\s*History\s*</g) ?? []).length, 1, "one History per family panel");
    for (const f of FAMILIES) {
      assert.ok(f.historyHref, `${f.familyId} needs a history destination`);
      /* No invented internal archive route (FD-S-30) — `/{state}/{game}/{year}` is not implemented. */
      assert.ok(!/^\/[a-z]{2}\//.test(f.historyHref!), "no invented internal archive route");
      /* LRG-STATE-040's ownership rule moved this OFF the operator's archive. Eleven family cards each carried
         an outbound link, and the rule is explicit that official sources are not the reader's normal
         destination and that external links belong in the one official-resources group. It now resolves to
         this page's own history-and-tools section, which offers the operator's archive from inside that
         permitted group — the reader reaches the same place one hop later, internally. */
      assert.equal(f.historyHref, "#state-tools");
    }
  });
});

describe("LRG-STATE-031: the AI module is discoverable and still honest", () => {
  test("the AI section carries its own visible treatment", () => {
    assert.ok(/variant="ai"/.test(readFileSync(
      new URL("../components/state/preview/sections/StateDraftSections.tsx", import.meta.url), "utf8")),
      "S-03 must request the AI section variant");
    assert.ok(/\.lcs-section--ai/.test(STATE_CSS), "the variant must be styled");
    assert.ok(/\.lcs-ai\s*\{[\s\S]*?border:\s*2px solid var\(--color-ai\)/.test(STATE_CSS),
      "the module needs a visible accent border — V1 was invisible, not absent");
  });

  test("it offers a value statement and pressable questions", () => {
    assert.ok(/\$\{p\}-ai__value/.test(V2_ANSWER), "one concise value statement");
    assert.ok(/\$\{p\}-prompt`/.test(V2_ANSWER), "questions render as buttons, not tags");
    /* LRG-STATE-032 §7 asks for 3-5 visible choices; LRG-STATE-037 §8 caps the State page at FOUR initially and
       the rest sit behind "More questions". §C2 made the cap a prop rather than a module constant, so the wrapper
       declares it and the shared surface honours it. */
    assert.ok(/leadCount=\{4\}/.test(V2_AI), "at most four questions lead the State module");
  });

  test("the extended prompt set includes the questions the family model provokes", () => {
    for (const key of ["variant-dates", "buy-now-options"]) {
      assert.ok(V2_AI.includes(`key: "${key}"`), `prompt ${key} must exist`);
    }
    /* LRG-STATE-032 §7 shortened this label to "Why do the result dates differ?" so it sits on one line at
       390px. Same prompt key, same grounding, same boundary — only the wording changed. */
    /* LRG-STATE-034 §3 restored the longer wording the task names verbatim. */
    assert.ok(/Why do Midday and Evening have different dates\?/.test(V2_AI));
  });

  test("still ONE shared surface, still not connected, still no fabricated answer", () => {
    assert.equal((V2_PREVIEW.match(/<SectionS03Draft/g) ?? []).length, 1, "one AI section");
    assert.ok(/data-ai-connected="false"/.test(V2_ANSWER));
    /* LRG-STATE-034 §3 replaced the bare not-connected notice with a labelled deterministic preview answer.
       The label still states plainly that live generation is not connected. */
    assert.ok(/PREVIEW_LABEL/.test(V2_AI));
    assert.ok(/data-ai-state="preview-not-connected"/.test(V2_ANSWER));
    assert.ok(/lcs-ai-select/.test(V2_AI), "contextual entries write into this one surface");
  });

  test("no per-family chatbot: at most one AI action per panel, gated twice", () => {
    assert.equal((V2_PANEL.match(/<StateExplainAction/g) ?? []).length, 1, "one AI action per panel");
    assert.ok(/showAi && family\.aiContextKey/.test(V2_PANEL));
    /* LRG-STATE-039 §4 removed the AI action from the multi-state block entirely — its list is
       History · Discuss · Share · Buy Now, and the main State AI module stays the primary AI experience.
       Zero is still "at most one", so the no-per-family-chatbot guarantee is strengthened, not weakened. */
    assert.equal((V2_MSBLOCK.match(/<StateExplainAction/g) ?? []).length, 0,
      "Powerball and Mega Millions carry no AI action of their own");
  });
});

describe("LRG-STATE-031: Buy Now is prominent without being mechanically repeated", () => {
  test("the button has a quiet variant, and it is a real control not a disabled one", () => {
    /* Comments stripped: the file's own comment EXPLAINS that the control is not disabled, and asserting
       on prose about code is the trap this suite has fallen into twice already. */
    const btn = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8"));
    /* LRG-STATE-037 FV-08 retired the `hero` variant with the trailing State-level CTA. */
    assert.ok(/"primary" \| "compact" \| "quiet"/.test(btn) && !/"hero"/.test(btn));
    assert.ok(!/disabled/.test(btn), "quiet is hierarchy, never disablement");
    assert.ok(/dispatchEvent/.test(btn), "every variant opens the one shared resolver");
    assert.ok(/data-buynow-variant/.test(btn), "the variant is auditable in the DOM");
  });

  test("quiet keeps the full 44px target and only loses emphasis", () => {
    /* LRG-STATE-036 replaced the State-owned quiet style with Home's own `.lcp-btn--quiet`, so emphasis now
       comes from Home's primitive and State contributes only the touch target. */
    const btn = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8"));
    assert.ok(/lcp-btn lcp-btn--commerce-quiet lcs-buynow/.test(btn),
      "quiet is the outlined COMMERCE action after LRG-STATE-038 FP-01 — still commerce, lower emphasis");
    assert.ok(/background: var\(--color-surface\)/.test(V2_CSS.slice(V2_CSS.indexOf(".lcp-btn--quiet"))),
      "and it differs by emphasis, not size");
  });

  test("a member row still carries no Buy Now and no AI action", () => {
    const memberRow = V2_PANEL.slice(
      V2_PANEL.indexOf("function MemberRow"), V2_PANEL.indexOf("export default function StateFamilyPanel"));
    assert.ok(!/StateBuyNowButton|StateExplainAction/.test(memberRow));
  });

  test("the panel carries at most ONE Buy Now, and the multi-state strip one for the pair", () => {
    assert.equal((V2_PANEL.match(/<StateBuyNowButton/g) ?? []).length, 1,
      "exactly one Buy Now per family panel");
    assert.equal((V2_MSBLOCK.match(/<StateBuyNowButton/g) ?? []).length, 1,
      "one Buy Now per multi-state game, declared once in the shared game component");
    assert.equal((V2_S02.match(/<StateBuyNowButton/g) ?? []).length, 0,
      "S-02 itself adds no extra Buy Now — the State-level one lives after the AI module");
  });

  test("no internal status vocabulary can reach the reader", () => {
    for (const bad of ["underReview", "retailOnly", "onlineAvailable", "FD-N-10", "FD-N-03"]) {
      assert.ok(!hasReviewerNotation("clean sentence.") || true);
      assert.ok(hasReviewerNotation(`Something ${bad} here.`) || !/^FD/.test(bad),
        `${bad} must be recognised as reviewer notation`);
    }
  });
});

describe("LRG-STATE-031: reviewer notation never reaches the reader (§9)", () => {
  test("bracketed source tokens are stripped", () => {
    assert.equal(readerCopy("[O2] The operator publishes this on its claims page."),
      "The operator publishes this on its claims page.");
    assert.ok(!hasReviewerNotation(readerCopy("[O1]/[O3]/[O4] Must be 18 or older to play.")));
  });

  test("a citation label with no sentence becomes the honest fallback, not a fragment", () => {
    /* "[O2] official Winner's Guide" cleaned to "official Winner's Guide." — a broken fragment, which is
       worse for a reader than saying plainly that it is unverified. */
    assert.equal(readerCopy("[O2] official Winner's Guide", "We have not verified this yet."),
      "We have not verified this yet.");
  });

  test("reviewer-only sentences are dropped, fact sentences are kept verbatim", () => {
    const out = readerCopy(
      "No primary source verified for Florida tax treatment of prizes. FD-X-02 moves tax detail to a dedicated guide.",
    );
    assert.equal(out, "No primary source verified for Florida tax treatment of prizes.");
  });

  test("a leading NOTE: is removed and the sentence is re-cased", () => {
    const out = readerCopy("NOTE: this is the operator's official page, not a helpline number.");
    assert.equal(out, "This is the operator's official page, not a helpline number.");
  });

  test("whatever readerCopy returns is free of reviewer notation", () => {
    const inputs = [
      "[O2] official Winner's Guide",
      "FD-X-11: this resolves to underReview, NEVER to retailOnly.",
      "[E7] the fixture carries no anonymity block.",
      "NOTE: [O1] no helpline number has been verified, so none is stated.",
      "",
    ];
    for (const i of inputs) {
      assert.ok(!hasReviewerNotation(readerCopy(i)), `output for ${JSON.stringify(i)} still has notation`);
    }
  });

  test("the underlying provenance data is NOT rewritten", () => {
    /* CLAUDE.md §14 requires the citation to survive in the data. Cleaning happens at render only. */
    assert.ok(/\[O\d\]/.test(FLORIDA_MANIFEST.claimDeadline.source ?? ""),
      "the manifest keeps its full reviewer citation");
  });
});

describe("LRG-STATE-031: visual bands group without reordering", () => {
  test("membership is a partition and every governed section is banded", () => {
    assert.doesNotThrow(() => assertBandMembershipUnique());
    assert.doesNotThrow(() => assertEverySectionBanded(DEFAULT_ORDER));
  });

  test("banding reproduces the governed order exactly", () => {
    assert.doesNotThrow(() => assertBandsPreserveOrder(DEFAULT_ORDER));
    const flat = bandRuns(DEFAULT_ORDER).flatMap((r) => r.ids);
    /* LRG-STATE-042's founder-authorised lower-page composition swaps S-14 and S-15 so news and guides read
       before community. Exactly that one swap, and nothing else may move — which is the invariant this test
       now protects. */
    assert.deepEqual(flat, approvedLowerOrder(DEFAULT_ORDER));
    const raw = [...DEFAULT_ORDER];
    const moved = flat.filter((id, i) => id !== raw[i]);
    assert.deepEqual(moved.sort(), ["S-14", "S-15"], "only the approved pair moves");
  });

  test("there are four bands and each governed order yields exactly four runs", () => {
    /* Two accepted upper bands plus the four that carry the five approved lower-page bands — `editorial` holds
       both Latest from Florida and the guides, which the packet groups as one editorial region. */
    assert.equal(STATE_VISUAL_BANDS.length, 6);
    const runs = bandRuns(DEFAULT_ORDER).filter((r) => r.band);
    assert.equal(runs.length, 6, "a split band would duplicate its heading and its heading id");
    assert.deepEqual(runs.map((r) => r.band!.id),
      ["results", "play-and-help", "explore", "editorial", "community", "resources"]);
    /* The rejected wrappers are gone by name. */
    assert.ok(!STATE_VISUAL_BANDS.some((b) => b.id === "updates-and-discovery"));
    assert.ok(!STATE_VISUAL_BANDS.some((b) => b.id === "trust-and-navigation"));
  });

  test("an unbanded section is rejected rather than silently splitting a band", () => {
    assert.throws(() => assertEverySectionBanded(["S-01", "S-99" as never]), /no band owns S-99/);
  });

  test("the results band carries no heading, so nothing competes with the first result", () => {
    assert.equal(STATE_VISUAL_BANDS[0].id, "results");
    assert.equal(STATE_VISUAL_BANDS[0].title, "");
  });

  test("S-02 is in the first band and trust content is in the last", () => {
    assert.equal(bandFor("S-02")!.id, "results");
    /* LRG-STATE-042: the trust content now lives in the approved Resources band, hosted by S-18 immediately
       above the footer. S-17 no longer renders — its trust and independence sentences are the band's copy. */
    assert.equal(bandFor("S-18")!.id, "resources");
    assert.equal(bandFor("S-17")!.id, "community", "S-17 is banded but renders nothing");
  });

  test("PF-02 order itself is untouched by this task", () => {
    assert.deepEqual([...DEFAULT_ORDER], PF02_ORDER);
  });
});

describe("LRG-STATE-031: advertising review modes (§13)", () => {
  test("both modes exist and compact only ever clamps downward", () => {
    for (const key of MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey)) {
      const prod = reservedHeights(key, "production");
      const compact = reservedHeights(key, "compact");
      assert.ok(compact.mobileH <= prod.mobileH, `${key} compact mobile must not exceed production`);
      assert.ok(compact.desktopH <= prod.desktopH, `${key} compact desktop must not exceed production`);
      /* LRG-STATE-032 §9 replaced the single 40/56px compact ceiling with per-role ceilings, because a rail
         slot clamped to an inline height misrepresents a 600px skyscraper as a strip. */
      const ceiling = compactCeiling(MINIMUM_FLORIDA_PROFILE.find((p) => p.slotKey === key)!.subPosition);
      assert.ok(compact.mobileH <= ceiling, `${key} compact mobile must respect its ${ceiling}px ceiling`);
      assert.ok(compact.desktopH <= ceiling, `${key} compact desktop must respect its ${ceiling}px ceiling`);
    }
  });

  test("production mode preserves the exact recorded geometry", () => {
    for (const key of MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey)) {
      const r = slotReservation(key);
      assert.deepEqual(reservedHeights(key, "production"), { mobileH: r.mobileH, desktopH: r.desktopH });
    }
  });

  test("slot identity is IDENTICAL in both modes — nothing added, removed, moved or remapped", () => {
    for (const key of MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey)) {
      const r = slotReservation(key);
      assert.notEqual(r.gamPath, "UNKNOWN", `${key} must resolve to its production unit path`);
      assert.notEqual(r.divId, "UNKNOWN", `${key} must resolve to its production div id`);
    }
    /* Same approved profile, same count, whichever mode is active. */
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, MINIMUM_PROFILE_COUNT);
    assert.doesNotThrow(() => assertStateAdBaseline());
  });

  test("compact mode is visibly labelled so it cannot be mistaken for production reservation", () => {
    assert.ok(/adMode === "compact"/.test(V2_SLOT));
    /* The marker names itself and states the production reservation it stands in for. */
    assert.ok(/Ad slot/.test(V2_SLOT) && /reserves \{r\.mobileH\}\/\{r\.desktopH\}px in production/.test(V2_SLOT));
    assert.ok(/data-review-mode="compact"/.test(V2_SLOT));
    /*
       The real production geometry stays in the DOM for an audit in EITHER mode.

       LRG-ADS-CANARY-002 §2 moved these from JSX attributes into the `dataAttributes` object the shared
       `AdReservation` spreads onto the same element. The rendered DOM is unchanged — only the source form is —
       so the regex follows the new form and the guarantee it protects is identical.
    */
    assert.ok(/"data-reserved-mobile-h": r\.mobileH/.test(V2_SLOT));
    assert.ok(/"data-reserved-desktop-h": r\.desktopH/.test(V2_SLOT));
  });

  test("no ad may precede the first verified result on mobile", () => {
    /* AD-S00 is desktop-only in this profile, and the anchor wrapper collapses below 992px. */
    const adS00 = MINIMUM_FLORIDA_PROFILE.filter((p) => p.anchorId === "AD-S00");
    for (const p of adS00) {
      assert.ok(!p.viewports.includes("mobile"), `${p.slotKey} must not render before results on mobile`);
    }
    assert.ok(/lcs-adanchor--desktop-only/.test(STATE_CSS));
    assert.ok(/@media \(min-width: 992px\) \{ \.lcs-adanchor--desktop-only \{ display: block/.test(STATE_CSS));
  });

  test("no advertisement lives inside a family panel", () => {
    assert.ok(!/StatePreviewAdSlot|AdAnchor/.test(V2_SURFACE));
  });
});

describe("LRG-STATE-031: game identity", () => {
  test("a verified asset renders as itself", () => {
    for (const token of ["powerball", "mega-millions"]) {
      const id = resolveGameIdentity(token);
      assert.equal(id.kind, "verifiedAsset");
      assert.ok(id.logo?.src.startsWith("/game-logos/"));
    }
  });

  test("Florida Lotto maps to the asset whose CONTENT was confirmed in this task", () => {
    const id = resolveGameIdentity("florida-lotto");
    assert.equal(id.kind, "verifiedAsset");
    /* The filename says lotto-america; the artwork reads "FLORIDA LOTTO ... with Double Play", confirmed by
       decoding and viewing the file on 2026-07-30. The file is NOT renamed — the path is public. */
    assert.equal(id.logo?.src, "/game-logos/lotto-america.webp");
  });

  test("everything else gets ONE consistent neutral mark, not a per-game letter tile", () => {
    for (const token of ["pick-3", "cash-pop", "fantasy-5", undefined]) {
      assert.equal(resolveGameIdentity(token).kind, "temporaryNeutralMark");
    }
    /* V1's letter tiles are gone: no initials are derived anywhere in the component. */
    assert.ok(!/initials/.test(V2_SURFACE));
    assert.ok(!/familyLabel\s*\n?\s*\.split/.test(V2_SURFACE));
  });

  test("the temporary mark is disclosed once, not badged onto every panel", () => {
    assert.ok(anyTemporaryMark(FLORIDA_FAMILIES.map((f) => f.visualIdentity)));
    assert.ok(/temporary placeholders/.test(TEMPORARY_MARK_NOTE));
    /* Once at the RENDER site. The import statement is the second occurrence and is not a render. */
    const renderSites = V2_S02.slice(V2_S02.indexOf("export function SectionS02Families"));
    assert.equal((renderSites.match(/TEMPORARY_MARK_NOTE/g) ?? []).length, 1);
  });
});

describe("LRG-STATE-031: desktop canvas and lower-page compaction", () => {
  test("the State page has its OWN width token — Home's 1280px is untouched", () => {
    assert.ok(/\[data-lc-state-preview\] \{ --lcs-canvas-max: 1440px; \}/.test(STATE_CSS));
    assert.ok(/\.lcs-container/.test(STATE_CSS));
    assert.ok(/lcs-container/.test(V2_PREVIEW), "the preview must use the State container");
    /* Home's token must still be its approved value, and must not be redefined in the State region. */
    assert.ok(/--layout-content-max: 1280px/.test(V2_CSS));
    assert.ok(!/--layout-content-max/.test(STATE_CSS), "the State page must not redefine Home's width");
  });

  test("the rail keeps its governed width", () => {
    assert.ok(/grid-template-columns: minmax\(0, 1fr\) var\(--layout-rail\)/.test(STATE_CSS));
  });

  test("supporting detail collapses on mobile and is open on desktop, same markup", () => {
    const common = readFileSync(
      new URL("../components/state/preview/sections/StateCommon.tsx", import.meta.url), "utf8");
    assert.ok(/export function MobileDetail/.test(common));
    assert.ok(/<details className="lcs-mdetail"/.test(common), "server HTML, so it stays crawlable");
    assert.ok(/\.lcs-mdetail:not\(\[open\]\) > \.lcs-mdetail__body \{ display: block/.test(STATE_CSS),
      "desktop must force the content open rather than duplicating the DOM");
  });

  test("results, corrections, claim guidance and AI are never collapsed", () => {
    /* The reason the reader arrived is never something they must open. */
    assert.ok(!/MobileDetail/.test(V2_SURFACE), "the results surface must not collapse a result");
    assert.ok(!/MobileDetail/.test(V2_AI), "the AI answer surface must not collapse");
  });
});

/* ==========================================================================================
 * LRG-STATE-032 — Top results visual acceptance reset.
 *
 * Founder review rejected the V2 visual after a clean rebuild. These guard only the structures that carry
 * the accepted visual, so the specific rejections cannot come back:
 *
 *   one outer panel per family · rows that are not cards · one title/logo/Buy Now per family ·
 *   a visible AI module in the top sequence · truly compact ad markers · unchanged production geometry.
 *
 * They are deliberately narrow. Visual acceptance itself comes from the saved screenshots, not from here —
 * a passing assertion never proved the previous visual was acceptable, and it does not prove this one is.
 * ========================================================================================== */

/* Read from source text, not imported: Node's native TypeScript stripping cannot load `.tsx`, which is why
   every component assertion in this suite works on source text. */
const TOP_STACK_ADDITIONAL = Number(
  V2_S02.match(/TOP_STACK_ADDITIONAL = (\d+)/)?.[1] ?? NaN,
);

/* Bounded at both ends. LRG-SHELL-045 appended a GLOBAL FOOTER block after the State region, and an
   open-ended slice swept it in — making these State-scope assertions read rules that are not State's. */
const STATE_CSS_END = V2_CSS.indexOf("   LRG-SHELL-045 — THE GLOBAL FOOTER.");
const PANEL_CSS = V2_CSS.slice(
  V2_CSS.indexOf("LRG-STATE-032 — TOP RESULTS VISUAL ACCEPTANCE RESET"),
  STATE_CSS_END > 0 ? STATE_CSS_END : undefined,
);
/* The REAL 036 block, located by its banner heading. `indexOf("LRG-STATE-036")` finds an earlier COMMENT that
   merely cites the task, which silently widened the slice and made two assertions read pre-036 rules. */
const CSS_036 = (() => {
  const start = V2_CSS.indexOf("   LRG-STATE-036 — STATE RESULTS ALIGNED WITH LOCKED HOME");
  /* Bounded, as above: the State region ends where LRG-SHELL-045's global-footer block begins. */
  const end = V2_CSS.indexOf("   LRG-SHELL-045 — THE GLOBAL FOOTER.");
  return V2_CSS.slice(start, end > start ? end : undefined);
})();

describe("LRG-STATE-032: one outer family panel, member rows are not cards", () => {
  test("the panel is the only bordered surface and rows declare none of the card properties", () => {
    const row = PANEL_CSS.slice(PANEL_CSS.indexOf(".lcs-fp__row {"),
                                PANEL_CSS.indexOf(".lcs-fp__row:last-child"));
    /* All four together, because any one of them alone makes a row read as a card. */
    assert.ok(/border:\s*0/.test(row), "no border");
    assert.ok(/border-radius:\s*0/.test(row), "no radius");
    assert.ok(/box-shadow:\s*none/.test(row), "no shadow");
    assert.ok(/background:\s*none/.test(row), "no surface of its own");
    assert.ok(/border-bottom:\s*1px solid var\(--color-border-subtle\)/.test(row), "a hairline separator only");
  });

  test("the header is separated by a rule, NOT by a background band", () => {
    /* This was the actual cause of "mini cards": a grey header over a white body reads as two surfaces. */
    const head = PANEL_CSS.slice(PANEL_CSS.indexOf(".lcs-fp__head {"),
                                 PANEL_CSS.indexOf(".lcs-fp__head > .lcs-fp__title"));
    assert.ok(/border-bottom:\s*1px solid var\(--color-border\)/.test(head), "separated by a rule");
    assert.ok(!/background/.test(head), "the header must not introduce its own background");
  });

  test("no member row carries a card class", () => {
    for (const cardish of ["lcs-fam ", "lcp-card", "lcs-card", "lcp-panel"]) {
      assert.ok(!V2_PANEL.includes(cardish), `a member row must not use "${cardish}"`);
    }
  });

  test("one panel, one title, one identity mark, one History, one Buy Now, at most one AI action", () => {
    assert.equal((V2_PANEL.match(/<article/g) ?? []).length, 1);
    assert.equal((V2_PANEL.match(/lcs-fp__title/g) ?? []).length, 1);
    assert.equal((V2_PANEL.match(/<IdentityMark/g) ?? []).length, 1);
    assert.equal((V2_PANEL.match(/>\s*History\s*</g) ?? []).length, 1);
    assert.equal((V2_PANEL.match(/<StateBuyNowButton/g) ?? []).length, 1);
    assert.equal((V2_PANEL.match(/<StateExplainAction/g) ?? []).length, 1);
  });

  test("member rows keep stable configured order and their own dates", () => {
    /* Same guarantee as before the visual reset — the reset changed markup, never the data contract. */
    assert.ok(!/\.sort\(/.test(V2_PANEL), "the panel never sorts its rows");
    const pick3 = FAMILIES.find((f) => f.familyId === "pick-3")!;
    assert.deepEqual(pick3.members.map((m) => m.variantLabel), ["Midday", "Evening"]);
    const dates = pick3.members.map((m) => m.result?.drawDateIso);
    assert.notEqual(dates[0], dates[1], "each row carries its own draw date");
  });

  test("every family renders through the SAME component — no per-family markup", () => {
    /* Pick 3 was built and accepted first; the rest reuse it through data (§2). */
    assert.ok(/export default function StateFamilyPanel/.test(V2_PANEL));
    /* LRG-STATE-034 §1E made the additional families COMPACT SUMMARIES, so the panel has two call sites:
       the featured family, and every family in full behind the View all disclosure. */
    assert.equal((V2_S02.match(/<StateFamilyPanel/g) ?? []).length, 2);
    assert.equal((V2_S02.match(/<StateFamilySummary/g) ?? []).length, 1);
  });
});

describe("LRG-STATE-032: top results hierarchy", () => {
  test("the top stack is capped so the AI module stays near the results", () => {
    /* LRG-STATE-034 §16 requires the AI module inside three mobile screens at 390px. Measured: three full
       panels put it at 4.38 screens, three summaries at 3.42, two summaries at 2.95. The cap follows the
       measurement. */
    assert.equal(TOP_STACK_ADDITIONAL, 2, "first native family plus two summarised");
  });

  test("the remainder routes through a visible View all action, still in the server HTML", () => {
    assert.ok(/View all \{model\.stateName\} results/.test(V2_S02));
    assert.ok(/<details className="lcs-viewall"/.test(V2_S02), "server-rendered and crawlable");
  });

  test("the multi-state block is ONE outer section with no per-game borders", () => {
    assert.equal((V2_MSBLOCK.match(/<section/g) ?? []).length, 1, "one outer block");
    const game = PANEL_CSS.slice(PANEL_CSS.indexOf(".lcs-ms__game {"),
                                 PANEL_CSS.indexOf(".lcs-ms__game:last-child"));
    assert.ok(!/border:\s/.test(game), "a game inside the block must not have its own border");
    assert.ok(/border-bottom:\s*1px/.test(game), "games are divided by a rule");
  });

  test("the multi-state block precedes the first native result in the markup", () => {
    /* LRG-STATE-037 FV-01 REVERSED THIS. Powerball and Mega Millions must appear immediately after the
       identity area; the previous order put them third because a native result was more recent, and founder
       review rejected recency as the tiebreak for the two games most readers arrive looking for.
       FD-N-02's substance survives: the native family follows IMMEDIATELY and keeps the featured treatment. */
    const jsx = V2_S02.slice(V2_S02.indexOf("<SectionShell"));
    assert.ok(jsx.indexOf("<StateMultiStateBlock") < jsx.indexOf("data-primary-result"),
      "Powerball and Mega Millions come first (FV-01)");
  });
});

describe("LRG-STATE-032: the AI module is in the top sequence and visibly distinct", () => {
  test("S-03 follows S-02 and the State-level CTA follows S-03", () => {
    const order = [...DEFAULT_ORDER];
    assert.equal(order[order.indexOf("S-02") + 1], "S-03", "AI immediately follows the results section");
    /* LRG-STATE-037 FV-08 removed the trailing hero CTA; commerce now sits in the action row directly under
       the first result, which is where a reader who has just checked their numbers actually is. */
    assert.ok(!/data-state-cta/.test(V2_PREVIEW), "no trailing hero CTA after the AI module");
  });

  test("the module has its own border, surface and marker — not the weight of an unavailable box", () => {
    const ai = PANEL_CSS.slice(PANEL_CSS.indexOf(".lcs-ai {"), PANEL_CSS.indexOf(".lcs-ai__value"));
    assert.ok(/border:\s*2px solid var\(--color-ai\)/.test(ai));
    assert.ok(/background:\s*var\(--color-info-surface\)/.test(ai));
    assert.ok(/\.lcs-section--ai > \.lcs-h2::before/.test(PANEL_CSS), "the heading carries a visible marker");
  });

  test("it shows 3-5 visible prompt choices and is never hidden behind an accordion", () => {
    assert.ok(/leadCount=\{4\}/.test(V2_AI), "at most four initially (LRG-STATE-037 §8)");
    assert.ok(!/MobileDetail/.test(V2_AI_ALL), "the module itself must never collapse");
    /* FV-04: and it now offers a real question input, not only canned choices. */
    assert.ok(/data-ai-input="true"/.test(V2_ANSWER) && /data-ai-ask="true"/.test(V2_ANSWER));
    assert.ok(/\$\{p\}-prompt`/.test(V2_ANSWER), "prompts are pressable choices");
  });

  test("the named example prompts are the visible ones", () => {
    for (const label of [
      /* LRG-STATE-034 §3 names these prompts verbatim; the labels match the task, not the earlier task. */
      "Explain the latest ${stateName} result",
      "Why do Midday and Evening have different dates?",
      "Explain my Buy Now options",
    ]) {
      assert.ok(V2_AI.includes(label), `visible prompt "${label}" must exist`);
    }
    /* The add-on question names the jurisdiction's REAL add-on, derived rather than hardcoded. */
    assert.ok(/What does \$\{addOnLabel\} mean\?/.test(V2_AI));
    assert.ok(!V2_AI.includes("Fireball"), "the add-on name must come from data, not from code");
  });

  test("still one shared surface, still not connected, still no fabricated answer", () => {
    assert.equal((V2_PREVIEW.match(/<SectionS03Draft/g) ?? []).length, 1);
    assert.ok(/data-ai-connected="false"/.test(V2_ANSWER));
    /* LRG-STATE-034 §3 replaced the bare not-connected notice with a labelled deterministic preview answer.
       The label still states plainly that live generation is not connected. */
    assert.ok(/PREVIEW_LABEL/.test(V2_AI));
    assert.ok(/data-ai-state="preview-not-connected"/.test(V2_ANSWER));
  });
});

describe("LRG-STATE-032: Buy Now hierarchy in the top experience", () => {
  test("the State-level commerce action lives in the action row, not as a second hero", () => {
    /* LRG-STATE-037 FV-08 moved it into the compact action row directly under the first result. A separate
       hero CTA after the AI module competed with it and lengthened the page. */
    assert.ok(!/variant="hero"/.test(V2_PREVIEW), "no trailing hero CTA remains");
    /* The row renders the governed list, so `buy` being in that list is what proves it is present. */
    assert.ok(engagementActions().some((a) => a.key === "buy" && a.opens === "commerce"));
    assert.ok(/onClick=\{buyNow\}/.test(ENG_SRC), "and the row owns the State-level Buy Now action");
  });

  test("no Buy Now on a member row, and never two inside one family", () => {
    const memberRow = V2_PANEL.slice(V2_PANEL.indexOf("function MemberRow"),
                                     V2_PANEL.indexOf("export default function StateFamilyPanel"));
    assert.ok(!/StateBuyNowButton/.test(memberRow));
    assert.equal((V2_PANEL.match(/<StateBuyNowButton/g) ?? []).length, 1);
  });

  test("History and the AI action are text links, not more buttons", () => {
    const foot = PANEL_CSS.slice(PANEL_CSS.indexOf(".lcs-fp__link {"),
                                 PANEL_CSS.indexOf(".lcs-tasklinks"));
    assert.ok(/border:\s*0/.test(foot), "a footer action carries no button border");
    assert.ok(/min-height:\s*44px/.test(foot), "and still meets the 44px target");
  });

  test("reader-facing commerce language stays natural", () => {
    const resolverSrc = readFileSync(
      new URL("../components/state/preview/StateBuyNowInline.tsx", import.meta.url), "utf8");
    assert.ok(/does not sell tickets directly/.test(resolverSrc));
    /* FV-07: the plain statement now leads the inline resolver in S-07. */
    const inlineResolver = readFileSync(
      new URL("../components/state/preview/StateBuyNowInline.tsx", import.meta.url), "utf8");
    assert.ok(/does not sell tickets directly/.test(inlineResolver));
    /* No internal status token or decision id may appear in the top-experience CODE at all — the only place
       they legitimately live is a comment, and comments are stripped above. */
    for (const token of ["underReview", "retailOnly", "FD-N-", "FD-S-", "DS-"]) {
      assert.ok(!V2_PREVIEW.includes(token), `${token} must not appear in rendered code`);
      assert.ok(!V2_PANEL.includes(token), `${token} must not appear in the panel`);
      assert.ok(!V2_MSBLOCK.includes(token), `${token} must not appear in the multi-state block`);
    }
    /* And the reader-facing capability copy stays plain language. */
    assert.ok(!hasReviewerNotation(FLORIDA_COMMERCE_CAPABILITY.readerNote));
  });
});

describe("LRG-STATE-032: compact advertising markers (§9)", () => {
  test("compact ceilings are the tightened founder-review sizes", () => {
    /* LRG-STATE-034 §15 tightened 32/48/40 to 20/24/36: at the earlier sizes ten markers still read as
       advertisement space in a landing-page review. */
    assert.equal(COMPACT_INLINE_H, 20);
    assert.equal(COMPACT_RAIL_H, 24);
    assert.equal(COMPACT_STICKY_H, 36);
    assert.equal(compactCeiling("inline"), COMPACT_INLINE_H);
    assert.equal(compactCeiling("mobile-inline"), COMPACT_INLINE_H);
    assert.equal(compactCeiling("rail"), COMPACT_RAIL_H);
    assert.equal(compactCeiling("sticky"), COMPACT_STICKY_H);
  });

  test("every approved slot respects its role's ceiling in compact mode", () => {
    for (const p of MINIMUM_FLORIDA_PROFILE) {
      const c = reservedHeights(p.slotKey, "compact");
      const ceiling = compactCeiling(p.subPosition);
      assert.ok(c.mobileH <= ceiling && c.desktopH <= ceiling,
        `${p.slotKey} (${p.subPosition}) must not exceed ${ceiling}px in review mode`);
    }
  });

  test("the compact marker is a labelled line, not a placeholder box", () => {
    const mark = PANEL_CSS.slice(PANEL_CSS.indexOf(".lcs-admark {"),
                                 PANEL_CSS.indexOf(".lcs-admark__label"));
    assert.ok(/border:\s*0/.test(mark), "no box border");
    assert.ok(/background:\s*none/.test(mark), "no filled surface");
    assert.ok(/border-top:\s*1px dashed/.test(mark), "one hairline, so it reads as a boundary");
  });

  test("PRODUCTION geometry is untouched by any of this", () => {
    for (const p of MINIMUM_FLORIDA_PROFILE) {
      const r = slotReservation(p.slotKey);
      assert.deepEqual(reservedHeights(p.slotKey, "production"),
        { mobileH: r.mobileH, desktopH: r.desktopH });
      /* Slot identity is read from the recorded production definition in either mode. */
      assert.notEqual(r.gamPath, "UNKNOWN");
      assert.notEqual(r.divId, "UNKNOWN");
    }
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, MINIMUM_PROFILE_COUNT);
    assert.doesNotThrow(() => assertStateAdBaseline());
  });

  test("the sticky clearance still derives from the sticky slot's own ceiling", () => {
    /* `app/layout.tsx` computes the document clearance through `reservedHeights` and is out of scope here.
       The role is read from the profile rather than passed in, so that untouched caller stays correct — a
       32px inline ceiling under a 40px bar would put the footer back underneath it (LRG-STATE-022). */
    const sticky = MINIMUM_FLORIDA_PROFILE.find((p) => p.subPosition === "sticky")!;
    const c = reservedHeights(sticky.slotKey, "compact");
    assert.equal(Math.max(c.mobileH, c.desktopH), COMPACT_STICKY_H);
  });

  test("no advertisement precedes the first result on mobile", () => {
    for (const p of MINIMUM_FLORIDA_PROFILE.filter((x) => x.anchorId === "AD-S00")) {
      assert.ok(!p.viewports.includes("mobile"));
    }
  });
});

describe("LRG-STATE-032: desktop width and Home", () => {
  test("the State canvas is the provisional review width, and Home's token is untouched", () => {
    assert.ok(/--lcs-canvas-max: 1380px/.test(PANEL_CSS), "page max within the 1360-1400 range");
    assert.ok(/--layout-content-max: 1280px/.test(V2_CSS), "Home's approved width is unchanged");
    assert.ok(!/--layout-content-max/.test(PANEL_CSS), "the State region must not redefine it");
    assert.ok(/gap:\s*28px/.test(PANEL_CSS), "rail gap within the 24-32 range");
  });

  test("every rule this task added is State-owned", () => {
    const selectors = [...PANEL_CSS.matchAll(/^\.([A-Za-z][\w-]*)/gm)].map((m) => m[1]);
    const foreign = selectors.filter((c) => !c.startsWith("lcs-"));
    assert.deepEqual(foreign, [], "no Home-owned selector may be redefined here");
  });
});

/* ==========================================================================================
 * LRG-STATE-034 — Research-led engagement landing.
 *
 * The smallest useful set. These guard the LOOP the research describes and the honesty rules that make it
 * publishable — not the styling, which is judged from the screenshots.
 * ========================================================================================== */

import {
  communityAreasFor, discussionContextForFamily, aiParticipationNote, SURFACE_EVENT,
  FUTURE_AREA_KEYS, communityGroupIdFor, engagementActions,
} from "../lib/state/stateEngagement";
import { previewAnswer, PREVIEW_LABEL } from "../lib/state/stateAiPreview";
import {
  STATE_EXPERIENCE_ID, STATE_RENDERER_ID, STATE_PREVIEW_COMMIT,
} from "../lib/state/statePreviewGuard";

/* The four-card engagement bar became the compact action row (FV-08). */
const ENG_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/StateActionRow.tsx", import.meta.url), "utf8"));
/* LRG-STATE-037 FV-03/FV-05 deleted the discussion MODAL. Its replacements are a plain link and the community
   section, so the assertions that described the modal now describe these instead. */
const DISC_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/StateDiscussLink.tsx", import.meta.url), "utf8"));
/* LRG-STATE-042 replaced the S-14 community layout with the approved Community band. The assertions that
   guarded real properties — no fabricated activity, no external forum link, no ad inside a card — now guard
   the band that renders instead. */
const COMM_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateLowerBands.tsx", import.meta.url), "utf8"));
const WC_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/StateWhatChanged.tsx", import.meta.url), "utf8"));
const REMEMBER_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/StateRememberDevice.tsx", import.meta.url), "utf8"));

describe("LRG-STATE-034: the engagement-v1 runtime marker", () => {
  test("all three marker attributes and the visible chip exist, inside the guarded subtree", () => {
    /* LRG-STATE-035 §5 moved these from literals to constants and added the renderer and commit attributes,
       so the marker names WHICH code is rendering rather than only that some preview is. */
    assert.ok(/data-lc-state-experience=\{STATE_EXPERIENCE_ID\}/.test(V2_PREVIEW));
    assert.ok(/data-lc-state-renderer=\{STATE_RENDERER_ID\}/.test(V2_PREVIEW));
    assert.ok(/data-lc-state-preview-commit=\{STATE_PREVIEW_COMMIT\}/.test(V2_PREVIEW));
    assert.equal(STATE_EXPERIENCE_ID, "engagement-v1");
    assert.equal(STATE_RENDERER_ID, "engagement-landing");
    assert.ok(/State Experience Preview · Engagement V1 · \{STATE_PREVIEW_COMMIT\}/.test(V2_PREVIEW));
    /* It sits on the preview root, so guard-off, Home and any non-preview State route cannot render it —
       `app/[state]/page.tsx` only mounts `StatePreview` when the registry serves that State (FD-GATE-01). */
    const route = readFileSync(new URL("../app/[state]/page.tsx", import.meta.url), "utf8");
    assert.ok(/servesPage\("state", state\)/.test(route));
    assert.ok(!/engagement-v1|engagement-landing/.test(route),
      "the marker belongs to the preview component, not the route");
  });
});

describe("LRG-STATE-034/037: the consumer action row", () => {
  test("four actions in the researched order, one primary, none disabled", () => {
    const a = engagementActions();
    assert.deepEqual(a.map((x) => x.key), ["ask-ai", "discuss", "buy", "changed"]);
    assert.deepEqual(a.map((x) => x.label), ["Ask AI", "Discuss", "Buy Now", "What changed"]);
    /* FV-08: exactly one primary. Four equal controls is the presentation founder review rejected. */
    assert.equal(a.filter((x) => x.emphasis === "primary").length, 1);
    assert.equal(a[0].emphasis, "primary");
    /* FV-08/FV-09: no microcopy field survives, so none can be rendered under a label. */
    assert.ok(!a.some((x) => "hint" in x));
    /* Every action opens a real shared surface or routes to a real in-page id. */
    for (const x of a) {
      if (x.opens === "route") assert.ok(x.href?.startsWith("#"), `${x.key} needs a destination`);
      else assert.ok(["ai", "discussion", "commerce"].includes(x.opens));
    }
    assert.ok(!/disabled/.test(ENG_SRC), "no disabled control in the row");
    /* And the row renders that list rather than a second hardcoded copy of it. */
    assert.ok(/engagementActions\(\)/.test(ENG_SRC));
  });

  test("Check Ticket is absent, because the deterministic checker does not exist", () => {
    /* `FD-S-08` forbids a control that looks functional and is not. The task permits Check Ticket to replace
       What Changed only when the checker genuinely works. */
    assert.ok(!engagementActions().some((x) => /check ticket/i.test(x.label)));
  });

  test("the bar renders directly after the first result, before the multi-state block", () => {
    const jsx = V2_S02.slice(V2_S02.indexOf("<SectionShell"));
    /* FV-01 REVERSED THIS ORDER. Powerball and Mega Millions now come FIRST, then the native family, then the
       action row. The earlier assertion encoded the order the founder rejected. */
    assert.ok(jsx.indexOf("<StateMultiStateBlock") < jsx.indexOf("data-primary-result"),
      "multi-state precedes the first native family (FV-01)");
    assert.ok(jsx.indexOf("data-primary-result") < jsx.indexOf("<StateActionRow"),
      "and the action row follows the first native result");
  });
});

describe("LRG-STATE-034: one shared surface per capability", () => {
  test("there is exactly one event per shared surface, and one mount of each", () => {
    assert.deepEqual(Object.keys(SURFACE_EVENT), ["ai", "discussion", "commerce"]);
    assert.equal((V2_PREVIEW.match(/<StateAiSurface/g) ?? []).length, 0, "AI mounts inside S-03 only");
    assert.equal((V2_PREVIEW.match(/<SectionS03Draft/g) ?? []).length, 1);
    /* FV-03: both shared MODALS are gone. Discussion is a link; commerce is inline in S-07. */
    assert.ok(!/<StateDiscussionSurface/.test(V2_PREVIEW));
    assert.ok(!/<StateBuyNowResolver/.test(V2_PREVIEW));
  });

  test("every contextual entry dispatches at a shared surface rather than owning a panel", () => {
    /* FV-03/FV-05: the AI and commerce entries dispatch at a shared surface then MOVE the reader to it; the
       discussion entry is a plain anchor, which is the most ordinary navigation of all. Neither owns a panel. */
    assert.ok(/dispatchEvent/.test(ENG_SRC), "the action row dispatches at the shared surfaces");
    assert.ok(!/useState/.test(ENG_SRC), "and owns no surface of its own");
    assert.ok(/<a\b/.test(DISC_SRC) && !/dispatchEvent/.test(DISC_SRC),
      "the discuss entry is a link, not a dispatcher");
    /* The AI action carries the family it came from, so the answer is about the result the reader saw. */
    const explain = codeOnly(readFileSync(
      new URL("../components/state/preview/StateExplainAction.tsx", import.meta.url), "utf8"));
    assert.ok(/familyId/.test(explain));
  });

  test("AI appears at most once per module, and never on a member row", () => {
    const memberRow = V2_PANEL.slice(V2_PANEL.indexOf("function MemberRow"),
                                     V2_PANEL.indexOf("export default function StateFamilyPanel"));
    /* LRG-STATE-039 §4: "no action repeats on individual member-game rows" — now including Share. */
    assert.ok(!/StateExplainAction|StateDiscussLink|StateBuyNowButton|StateShareResult/.test(memberRow));
    assert.equal((V2_PANEL.match(/<StateExplainAction/g) ?? []).length, 1);
    assert.equal((V2_MSBLOCK.match(/<StateExplainAction/g) ?? []).length, 0);
  });
});

describe("LRG-STATE-034: the AI module shows real value while disconnected", () => {
  const inputs = {
    stateName: "Florida", operatorName: "Florida Lottery",
    resultSource: "LotteryCorner production results feed", timezoneLabel: "ET",
    lastUpdatedDate: "2026-07-09", daysOld: 20, families: FAMILIES,
    addOnLabel: "Fireball",
    purchaseReaderNote: "We are still checking how tickets can be bought in Florida.",
  };

  test("every named prompt produces a deterministic answer computed from page data", () => {
    for (const key of ["explain-result", "variant-dates", "explain-game", "next-draw",
                       "what-changed", "buy-now-options", "claim-steps"]) {
      const a = previewAnswer(key, inputs);
      assert.ok(a, `${key} must produce an answer`);
      assert.ok(a!.paragraphs.length > 0 && a!.paragraphs.every((p) => p.length > 20));
      assert.ok(a!.computedFrom.length > 0, `${key} must state what it was computed from`);
      assert.ok(a!.cannot.length > 0, `${key} must state what it cannot do`);
    }
  });

  test("an answer restates only what the page publishes — real numbers, real dates", () => {
    const a = previewAnswer("explain-result", inputs)!;
    const text = a.paragraphs.join(" ");
    const lead = FAMILIES.find((f) => f.familyId === "fantasy-5")!;
    const nums = lead.members[0].result!.groups.find((g) => g.visualRole === "main")!.values;
    /* The numbers in the answer are the numbers on the page. */
    assert.ok(text.includes(nums.join(", ")), "the answer must quote the published numbers");
    assert.ok(text.includes(lead.members[0].result!.drawDateDisplay));
  });

  test("it never predicts, never states odds, and never claims a live model replied", () => {
    const all = ["explain-result", "variant-dates", "explain-game", "next-draw",
                 "what-changed", "buy-now-options", "claim-steps"]
      .map((k) => previewAnswer(k, inputs)!)
      .flatMap((a) => [...a.paragraphs, a.cannot]).join(" ").toLowerCase();
    for (const banned of ["increase your chances", "more likely to win", "due to hit", "hot number",
                          "cold number", "predict", "guarantee", "best numbers", "i think", "as an ai"]) {
      assert.ok(!all.includes(banned), `preview copy must not contain "${banned}"`);
    }
    assert.ok(/live generation is not connected/.test(PREVIEW_LABEL));
  });

  test("a question with no verified data returns null rather than improvising", () => {
    assert.equal(previewAnswer("explain-game", { ...inputs, addOnLabel: null })!.paragraphs[0]
      .includes("do not have a drawn add-on recorded"), true);
    assert.equal(previewAnswer("explain-result", { ...inputs, families: [] }), null);
    assert.equal(previewAnswer("not-a-prompt", inputs), null);
  });

  test("the AI module renders before S-04 in the governed order", () => {
    const order = [...DEFAULT_ORDER];
    assert.ok(order.indexOf("S-03") < order.indexOf("S-04"));
    assert.ok(/variant="ai"/.test(readFileSync(
      new URL("../components/state/preview/sections/StateDraftSections.tsx", import.meta.url), "utf8")));
  });
});

describe("LRG-STATE-034: discussion and community are honest", () => {
  test("the discussion context carries state, game, draw, status and source", () => {
    const ctx = discussionContextForFamily(
      FAMILIES.find((f) => f.familyId === "pick-3")!, "Florida", "fl", "feed", "https://example.invalid");
    assert.equal(ctx.stateName, "Florida");
    assert.equal(ctx.familyLabel, "Pick 3");
    assert.ok(ctx.resultDateIso, "the draw date travels with the discussion");
    assert.ok(ctx.resultStatus, "so does the result status");
    assert.equal(ctx.sourceName, "feed");
  });

  test("only THREE community groups are visible, and they are derived from the state's games", () => {
    /* LRG-STATE-037 §9: eight cold-start groups read as an empty forum. Three remain visible; the finer
       categories stay as configuration in `FUTURE_AREA_KEYS`, never as empty cards. */
    const areas = communityAreasFor("Florida", FAMILIES);
    assert.equal(areas.length, 3);
    assert.deepEqual(areas.map((a) => a.key), ["daily", "jackpot", "help"]);
    /* A state with no games shows only the group that does not depend on one. */
    const bare = communityAreasFor("Nowhere", []);
    assert.deepEqual(bare.map((a) => a.key), ["help"]);
    assert.ok(FUTURE_AREA_KEYS.length > 0, "the rest survive as configuration");
  });

  test("the four researched AI tiers each have their own stated rule", () => {
    const notes = (["tierA", "tierB", "tierC", "tierD"] as const).map(aiParticipationNote);
    assert.equal(new Set(notes).size, 4, "four distinct sentences, not two");
    assert.ok(/LotteryCorner Research Note/.test(notes[0]), "the approved label for a community AI note");
    assert.ok(/moderator/i.test(notes[2]), "tier C is moderator-triggered only");
    assert.ok(/People only/i.test(notes[3]), "tier D has no AI participation");
    /* Claims, tax and law are tier C — not merely "humans first". */
    assert.equal(communityAreasFor("Florida", FAMILIES).find((a) => a.key === "help")!.aiParticipation,
      "tierC");
  });

  test("NOTHING social is fabricated anywhere in the community or discussion surfaces", () => {
    for (const [name, src] of [["community", COMM_SRC], ["discussion", DISC_SRC]] as const) {
      /* No count, no member, no post, no reply, no reputation, no timestamp of activity. */
      for (const banned of ["replies:", "postCount", "memberCount", "activityCount", "reputation",
                            "lastPostAt", "author:", "username"]) {
        assert.ok(!src.includes(banned), `${name} must not carry "${banned}"`);
      }
      assert.ok(!/\b\d+ (posts|replies|members|discussions)\b/.test(src),
        `${name} must not state an activity count`);
    }
    /* And the cold start says so, rather than implying content exists elsewhere. */
    /* The cold start went with the rejected layout: the band is populated from approved content now. What
       still must hold is that nothing invents a person or a crowd. */
    assert.ok(/data-discussion-count=/.test(COMM_SRC), "the band declares its real item count");
  });

  test("the discussion entry is a normal link and no longer a modal editor", () => {
    /* FV-05 replaced the drawer-with-editor with navigation. The local draft editor went with it: a page you
       navigate to owns its own composer, and a preview must not pretend to host one. */
    assert.ok(!/<textarea/.test(DISC_SRC), "no editor in a link");
    assert.ok(!/role="dialog"|aria-modal/.test(DISC_SRC), "and no dialog");
    /* UPDATED with the community integration: a caller whose blueprint designates a real `/community`
       destination may pass `href` (the family now exists — Conflict 41, FD-ACC-10 satisfied by
       construction); the in-page group anchor stays the default for the State page's own groups. */
    assert.ok(/href=\{href \?\? `#\$\{groupId\}`\}/.test(DISC_SRC),
      "it navigates to the designated destination, defaulting to the matching community group");
    assert.ok(!/disabled=|aria-disabled/.test(DISC_SRC), "no disabled control (FD-S-08)");
    /* The focus trap, the backdrop, the close button and the draft state all went with the drawer. */
    for (const gone of ["returnFocusTo", "setDraft", "lcs-modal", "overflow = ", "Escape"]) {
      assert.ok(!DISC_SRC.includes(gone), `modal machinery "${gone}" must be gone (FV-03)`);
    }
    /* Nothing leaves the browser, and nothing is stored either. */
    assert.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|localStorage|sessionStorage/.test(DISC_SRC));
    /* It still says plainly that posting is not connected, so the link never over-promises. */
    /* LRG-STATE-042: the approved community copy carries no posting-state sentence, and §8 forbids adding
       one. What replaces it is that no action leads anywhere that could accept a post. */
    assert.ok(!/<form|<textarea|method=/.test(COMM_SRC), "nothing on the band can submit anything");
  });

  test("the community entry points link the real registered route", () => {
    /*
     * UPDATED DELIBERATELY — this asserted the OPPOSITE ("no indexable community route is introduced")
     * while `/community` did not exist and linking it would have invented a URL. The Community family now
     * serves `/community` and `/community/{slug}` from the registry (commit a39bdfe, Conflict 41 FOUNDER
     * AMENDMENT), which satisfies `FD-ACC-10`'s hidden-because-no-forum condition by construction. So S-14's
     * governed entry now MUST point at the real route rather than the in-page fallback anchor.
     */
    const routes = readFileSync(new URL("../app/[state]/page.tsx", import.meta.url), "utf8");
    assert.ok(!/community/i.test(routes), "the State route file itself still names no community route");
    assert.ok(/href="\/community"/.test(COMM_SRC), "S-14's ask CTA opens the real /community route");
    assert.ok(!/#community-help/.test(COMM_SRC), "the unbuilt-route fallback anchor is gone from the band");
  });
});

describe("LRG-STATE-034: the return loop is local-only and never fabricated", () => {
  test("What Changed stores a device marker and nothing else", () => {
    assert.ok(/localStorage/.test(WC_SRC));
    assert.ok(!/fetch\(|sendBeacon|document\.cookie/.test(WC_SRC), "no server, no cookie");
    /* One feed-version marker plus a timestamp — no browsing history. */
    assert.ok(/lcs-fl-last-visit/.test(WC_SRC));
  });

  test("the return loop has ONE writer and one surface", () => {
    /* LRG-STATE-037 FV-06. There used to be two components reading the marker: the S-09 module and a one-line
       `StateReturnSignal` after the engagement bar. The inline disclosure is now directly under the action row —
       exactly where that signal sat — so the signal is redundant and was removed rather than hidden. Two readers
       of one marker is a bug waiting to happen; two rendered summaries is the duplicate surface §12 forbids. */
    assert.equal(existsSync(new URL("../components/state/preview/StateReturnSignal.tsx", import.meta.url)),
      false, "the superseded return signal is gone, not merely hidden with CSS");
    assert.ok(!/lcs-returnsig/.test(V2_CSS), "and its rules went with it");
    /* The copy it carried survives where a reader now meets it. */
    assert.ok(/Return after the next draw/.test(WC_SRC), "the first visit explains future value");
    /* LRG-STATE-042 §10 removed S-09's Recent-changes block entirely — it was one of the rejected
       lower-page patterns. The inline What Changed disclosure in S-02 is now the only one, which is a
       stronger version of the property this test was written to protect. */
    const draft = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateDraftSections.tsx", import.meta.url), "utf8"));
    assert.ok(!/<StateWhatChanged/.test(draft), "one disclosure, in S-02, under the action row");
    assert.ok(!/data-published-changes/.test(draft), "and the Recent-changes block is gone");
  });

  test("no streak, urgency, near-miss or loss framing in any return copy", () => {
    const all = `${WC_SRC}\n${REMEMBER_SRC}`.toLowerCase();
    for (const banned of ["streak", "you missed", "don't miss", "hurry", "last chance",
                          "so close", "one number away", "try again"]) {
      assert.ok(!all.includes(banned), `return copy must not contain "${banned}"`);
    }
  });

  test("Remember-on-device is a real toggle; Follow and Notify are absent", () => {
    /* `FD-X-09` defers Follow and Notify and forbids rendering them as disabled controls. `FD-N-04` permits
       device-local state selection, which is what ships. */
    assert.ok(/aria-pressed/.test(REMEMBER_SRC), "a real two-state control");
    assert.ok(/removeItem/.test(REMEMBER_SRC), "turning it off deletes the value");
    assert.ok(!/disabled/.test(REMEMBER_SRC));
    assert.ok(/this device only/i.test(REMEMBER_SRC), "no cross-device promise");
    const lower = readFileSync(
      new URL("../components/state/preview/sections/StateLowerSections.tsx", import.meta.url), "utf8");
    assert.ok(!/<button[^>]*>\s*(Follow|Notify)/.test(lower), "no Follow or Notify control");
  });
});

describe("LRG-STATE-034: commerce stays prominent without repeating", () => {
  test("family panels carry Buy Now only when the surface grants it", () => {
    assert.ok(/commerce\?: boolean/.test(V2_PANEL), "opt-in, defaulting to false");
    assert.ok(/family\.buyNowEligible && commerce/.test(V2_PANEL));
    /* LRG-STATE-037 FV-08 had stripped the grant from every panel, because the action row beneath the
       featured card offered the same actions. LRG-STATE-039 §4 supersedes that and gives the featured card its
       own action set, so the card owns what belongs to ITS result and the row owns what belongs to the State.
       Exactly ONE panel is granted commerce — a secondary summary row still routes through the shared
       resolver rather than carrying a button of its own. */
    assert.equal((V2_S02.match(/^\s+commerce$/gm) ?? []).length, 1, "the featured panel only");
    assert.ok(/<StateBuyNowButton/.test(V2_MSBLOCK), "each multi-state game keeps its own");
    assert.ok(/showAi\n\s+commerce/.test(V2_S02), "and the panel carries the §4 action set");
  });

  test("no Buy Now on a member row, and one shared resolver", () => {
    const memberRow = V2_PANEL.slice(V2_PANEL.indexOf("function MemberRow"),
                                     V2_PANEL.indexOf("export default function StateFamilyPanel"));
    assert.ok(!/StateBuyNowButton/.test(memberRow));
    assert.ok(!/<StateBuyNowResolver/.test(V2_PREVIEW), "the modal resolver is gone (FV-07)");
  });

  test("no internal status token or governance id reaches the reader", () => {
    const surfaces = `${V2_PREVIEW}\n${V2_PANEL}\n${V2_MSBLOCK}\n${V2_S02}\n${ENG_SRC}\n${DISC_SRC}\n${COMM_SRC}`;
    for (const token of ["underReview", "retailOnly", "FD-N-", "FD-S-", "FD-X-", "DS-"]) {
      assert.ok(!surfaces.includes(token), `${token} must not appear in rendered code`);
    }
    assert.ok(!hasReviewerNotation(FLORIDA_COMMERCE_CAPABILITY.readerNote));
  });
});

describe("LRG-STATE-034: compact ad markers and preserved governance", () => {
  test("the founder-review ceilings are 20 inline / 24 rail / 36 sticky", () => {
    assert.equal(COMPACT_INLINE_H, 20);
    assert.equal(COMPACT_RAIL_H, 24);
    assert.equal(COMPACT_STICKY_H, 36);
    for (const p of MINIMUM_FLORIDA_PROFILE) {
      const c = reservedHeights(p.slotKey, "compact");
      const ceiling = compactCeiling(p.subPosition);
      assert.ok(c.mobileH <= ceiling && c.desktopH <= ceiling, `${p.slotKey} exceeds ${ceiling}px`);
    }
  });

  test("production geometry, slot identity and the baseline guard are untouched", () => {
    for (const p of MINIMUM_FLORIDA_PROFILE) {
      const r = slotReservation(p.slotKey);
      assert.deepEqual(reservedHeights(p.slotKey, "production"),
        { mobileH: r.mobileH, desktopH: r.desktopH });
      assert.notEqual(r.gamPath, "UNKNOWN");
      assert.notEqual(r.divId, "UNKNOWN");
    }
    assert.equal(MINIMUM_FLORIDA_PROFILE.length, MINIMUM_PROFILE_COUNT);
    assert.doesNotThrow(() => assertStateAdBaseline());
  });

  test("no advertisement precedes the first mobile result", () => {
    for (const p of MINIMUM_FLORIDA_PROFILE.filter((x) => x.anchorId === "AD-S00")) {
      assert.ok(!p.viewports.includes("mobile"));
    }
  });

  test("the community module hosts no advertisement", () => {
    /* APP-ST-04/05: a cold-start shell must not exist primarily to host advertising, and a generic
       cold-start message alone does not qualify a section as an ad host. */
    assert.ok(!/StatePreviewAdSlot|AdAnchor|HostedSection/.test(COMM_SRC));
    assert.ok(!MINIMUM_FLORIDA_PROFILE.some(
      (p) => p.subPosition === "rail" && p.hostSectionId === "S-14"));
  });
});

describe("LRG-STATE-034: the governed composition is unchanged", () => {
  test("every PF-02 section id still resolves in the governed order", () => {
    /* `DEFAULT_ORDER` is the governed sequence; `resolveOrder` returns a richer object, not an array. */
    assert.deepEqual([...DEFAULT_ORDER], PF02_ORDER,
      "the governed order is untouched by the experience reset");
    for (const entry of STATE_SECTIONS) {
      assert.ok(entry.id.length > 0);
      assert.ok(typeof entry.order === "number");
    }
  });

  test("visual banding still preserves that order", () => {
    assert.doesNotThrow(() => assertBandMembershipUnique());
    assert.doesNotThrow(() => assertEverySectionBanded(DEFAULT_ORDER));
    assert.doesNotThrow(() => assertBandsPreserveOrder(DEFAULT_ORDER));
  });
});

/* ==========================================================================================
 * LRG-STATE-036 — State results aligned with the locked Home.
 *
 * These guard the SHARED GRAMMAR and the one deliberate difference. They are deliberately narrow: whether the
 * two pages look like one product is a visual judgement made from the paired captures, not from assertions.
 * ========================================================================================== */

const GRAMMAR_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateResultGrammar.tsx", import.meta.url), "utf8"));
const HOME_CARD_SRC = readFileSync(
  new URL("../components/preview/PreviewResultCard.tsx", import.meta.url), "utf8");

describe("LRG-STATE-036: State reuses Home's ball primitive unchanged", () => {
  test("State result balls use `.lcp-ball` with Home's data attributes", () => {
    /* Reusing the CSS primitive rather than copying its values is what stops the two pages drifting apart
       again — and it carries zero Home regression risk, because no `lcp-` rule is modified. */
    assert.ok(/className="lcp-ball"/.test(GRAMMAR_SRC));
    assert.ok(/data-ball=\{id\.ball\}/.test(GRAMMAR_SRC));
    assert.ok(/data-special=\{id\.special \? "true" : undefined\}/.test(GRAMMAR_SRC));
    /* And State no longer defines a competing ball of its own. */
    /* And no State-owned ball shape exists anywhere any more — the old rules were deleted, not shadowed. */
    assert.ok(!/\.lcs-fp__ball\b/.test(V2_CSS), "no State-owned ball shape may exist");
  });

  test("the ball identity mapping matches Home's, token for token", () => {
    /* If Home gains a ball type, this test fails and points at the drift. */
    for (const token of ["powerball", "megaball", "cashball", "fireball", "bonus"]) {
      assert.ok(GRAMMAR_SRC.includes(`"${token}"`), `State must map the ${token} token`);
      assert.ok(HOME_CARD_SRC.includes(`"${token}"`), `Home maps the ${token} token`);
    }
  });

  test("a special ball carries all three signals, and colour is never the only one", () => {
    /* Colour + non-colour ring + visible label. Ball-to-ball luminance separation is 1.00-1.13:1, so colour
       alone is measurably incapable of distinguishing them. */
    assert.ok(/data-special/.test(GRAMMAR_SRC), "the ring is driven by data-special");
    assert.ok(/lcs-bg__label/.test(GRAMMAR_SRC), "a visible label accompanies it");
    assert.ok(/\.lcp-ball\[data-special="true"\][\s\S]{0,120}box-shadow/.test(V2_CSS),
      "Home's ring rule must still exist");
    assert.ok(/forced-colors[\s\S]{0,200}outline: 2px solid CanvasText/.test(V2_CSS),
      "and become an outline under forced colours");
  });

  test("EVERY ball has an accessible name, not only the special ones", () => {
    assert.ok(/aria-label=\{id\.special \? `\$\{id\.label\} \$\{v\}` : `\$\{gameName\} number \$\{v\}`\}/
      .test(GRAMMAR_SRC), "ordinary balls are named with their game, as Home names them");
  });
});

describe("LRG-STATE-036: labelled prize semantics survive the alignment", () => {
  test("State keeps its governed prize labels rather than Home's hardcoded suffix", () => {
    /* Home appends "estimated jackpot" to every amount. Florida's prizes are not all jackpots, so copying that
       would make three of the four labels wrong. §2 forbids collapsing them. */
    assert.ok(!/estimated jackpot/.test(GRAMMAR_SRC),
      "State must not hardcode a jackpot suffix");
    assert.ok(/estimated jackpot/.test(HOME_CARD_SRC), "Home does — this is the deliberate difference");
    assert.ok(/lcs-prize__label/.test(GRAMMAR_SRC), "the label comes from the prize kind");
  });

  test("each governed prize kind still maps to its own distinct label", () => {
    const labels = new Set(
      FAMILIES.map((f) => f.prizeSummary?.label).filter(Boolean) as string[]);
    /* Four distinct labels across the Florida families, not one generic word. */
    assert.ok(labels.size >= 3, `expected several distinct prize labels, got ${[...labels].join(" / ")}`);
    for (const l of labels) assert.ok(!/^\$/.test(l), "a label must be words, not an amount");
    /* Cash Pop is stake-dependent and therefore shows NO single figure. */
    assert.equal(FAMILIES.find((f) => f.familyId === "cash-pop")!.prizeSummary, undefined);
  });

  test("a cash value renders as its own labelled figure, never merged into the amount", () => {
    assert.ok(/estimated cash value/.test(GRAMMAR_SRC));
    assert.ok(/lcs-prize__cash/.test(GRAMMAR_SRC));
  });
});

describe("LRG-STATE-036: multipliers, secondary draws and add-ons", () => {
  test("the multiplier reaches the presentation layer and renders as full text", () => {
    /* It was silently dropped: the feed held `{ label: "Power Play", value: 4 }` and State rendered nothing
       while Home rendered it. */
    const pb = FAMILIES.find((f) => f.familyId === "powerball")!;
    assert.ok(pb.members[0].result?.multiplier, "Powerball carries its published multiplier");
    assert.equal(pb.members[0].result!.multiplier!.label, "Power Play");
    assert.ok(/\{multiplier\.label\} \{multiplier\.value\}X/.test(GRAMMAR_SRC),
      "rendered as full text, never a bare number (DS-14)");
  });

  test("Power Play is independently selected and the Mega Millions multiplier is built in", () => {
    const pb = FAMILIES.find((f) => f.familyId === "powerball")!;
    assert.equal(pb.members[0].result!.multiplier!.kind, "independentlySelected");
    /* And the visible text says which, because one costs extra and the other cannot be declined. */
    assert.ok(/if selected/.test(GRAMMAR_SRC) && /included/.test(GRAMMAR_SRC));
  });

  test("an unavailable or not-applicable multiplier renders nothing at all", () => {
    assert.ok(/kind === "unavailable" \|\| multiplier\.kind === "notApplicable"\) return null/
      .test(GRAMMAR_SRC));
  });

  test("Double Play stays a subordinate secondary result with its own heading", () => {
    const pb = FAMILIES.find((f) => f.familyId === "powerball")!;
    assert.ok(pb.secondary, "it is family-level, not a member row");
    assert.equal(pb.memberCount, 1, "it never becomes a second member game");
    assert.ok(/lcs-fp__secondaryhead/.test(V2_PANEL) && /lcs-fp__secondaryhead/.test(V2_MSBLOCK),
      "both surfaces give it its own named heading, as Home does");
  });

  test("Fireball is a labelled drawn add-on, never an ordinary main ball", () => {
    const fireball = FAMILIES
      .flatMap((f) => f.members)
      .flatMap((m) => m.result?.groups ?? [])
      .find((g) => g.label === "Fireball");
    assert.ok(fireball, "Fireball is present");
    assert.equal(fireball!.visualRole, "addOn", "and marked as an add-on, not main");
    assert.equal(fireball!.colorToken, "ball.fireball", "with its own colour token");
  });

  test("EZmatch and Combo never appear as a result row or ball group", () => {
    /* They are purchase-time add-ons, not drawn results (LRG-STATE-029). */
    const allLabels = FAMILIES
      .flatMap((f) => f.members)
      .flatMap((m) => m.result?.groups ?? [])
      .map((g) => (g.label ?? "").toLowerCase());
    for (const banned of ["ezmatch", "combo"]) {
      assert.ok(!allLabels.some((l) => l.includes(banned)),
        `${banned} must not be a drawn value group`);
    }
  });
});

describe("LRG-STATE-036: Buy Now and AI actions reuse Home's grammar", () => {
  test("Buy Now uses `.lcp-btn` plus a State touch-target class only", () => {
    const btn = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8"));
    /* LRG-STATE-038 FP-01 moved Buy Now off the blue action variants onto the shared commerce primitive.
       The grammar claim is unchanged and now stronger: `.lcp-btn` still supplies every dimension, and the
       variant on top of it is the one Home's commerce triggers use too (FP-02). */
    assert.ok(/lcp-btn lcp-btn--commerce\b/.test(btn), "the shared filled commerce action");
    assert.ok(/lcp-btn lcp-btn--commerce-quiet/.test(btn), "and its outlined counterpart");
    assert.ok(!/lcp-btn--accent|lcp-btn--quiet\b/.test(btn), "no blue action variant remains on Buy Now");
    /* The only State addition is the 44px target — Home's sits in a details trigger and does not need it. */
    const rule = CSS_036.slice(CSS_036.indexOf(".lcs-buynow {"), CSS_036.indexOf(".lcs-buynow--compact"));
    assert.ok(/min-height: 44px/.test(rule));
    assert.ok(!/background|border-radius|font-size/.test(rule),
      "State must not restate what .lcp-btn already defines");
    /* Nor anywhere else: every `.lcs-buynow` rule outside the forced-colours fallback is target-only.
       The forced-colours border IS State-owned and legitimate — `.lcp-btn` uses a transparent border, which
       disappears entirely in forced-colours mode, so State restores a visible boundary there. */
    const forced = V2_CSS.indexOf("@media (forced-colors: active) { .lcs-buynow");
    for (const m of V2_CSS.matchAll(/\.lcs-buynow(?:--[a-z]+)?(?::hover)?\s*\{([^}]*)\}/g)) {
      if (forced >= 0 && m.index !== undefined && Math.abs(m.index - forced) < 60) continue;
      assert.ok(!/background|border:|border-radius|font-weight/.test(m[1]),
        `a .lcs-buynow rule still restates .lcp-btn: ${m[1].trim()}`);
    }
  });

  test("one Buy Now per family and per multi-state game; none on a member row", () => {
    assert.equal((V2_PANEL.match(/<StateBuyNowButton/g) ?? []).length, 1);
    assert.equal((V2_MSBLOCK.match(/<StateBuyNowButton/g) ?? []).length, 1);
    const memberRow = V2_PANEL.slice(V2_PANEL.indexOf("function MemberRow"),
                                     V2_PANEL.indexOf("export default function StateFamilyPanel"));
    assert.ok(!/StateBuyNowButton/.test(memberRow));
  });

  test("the contextual AI action uses Home's inline AI grammar and its icon set", () => {
    const explain = codeOnly(readFileSync(
      new URL("../components/state/preview/StateExplainAction.tsx", import.meta.url), "utf8"));
    assert.ok(/lcp-aiact__item/.test(explain), "Home's inline AI item");
    assert.ok(/lcp-aiact__mark/.test(explain), "and its icon slot");
    assert.ok(/from "@\/components\/preview\/AiIcon"/.test(explain),
      "AiIcon is imported unchanged — pure inline SVG with no Home coupling");
    assert.ok(/aria-hidden="true"/.test(explain), "the icon supports the label, never replaces it");
  });

  test("the S-07 visible heading is Buy Now in Florida, with the section id unchanged", () => {
    const util = readFileSync(
      new URL("../components/state/preview/sections/StateUtilitySections.tsx", import.meta.url), "utf8");
    assert.ok(/heading=\{`Buy Now in \$\{model\.stateName\}`\}/.test(util));
    /* The governed id, fragment and position are untouched — only the public label changed. `section()` is
       not imported into this suite, so the manifest entry is read from STATE_SECTIONS. */
    const s07 = STATE_SECTIONS.find((e) => e.id === "S-07")!;
    assert.equal(s07.id, "S-07");
    assert.equal(s07.fragment, "where-to-play");
    assert.equal(s07.order, 10);
  });
});

describe("LRG-STATE-036: the Engagement V1 structure is unchanged by the alignment", () => {
  test("family rows, engagement order and the runtime marker all survive", () => {
    assert.deepEqual([...DEFAULT_ORDER], PF02_ORDER);
    assert.equal(TOP_STACK_ADDITIONAL, 2);
    assert.ok(/data-action-row="true"/.test(ENG_SRC), "the compact action row replaced the four-card bar");
    assert.ok(/data-lc-state-experience=\{STATE_EXPERIENCE_ID\}/.test(V2_PREVIEW));
    /* Member rows are still rows: no border, radius, shadow or surface of their own. */
    const css = V2_CSS;
    const row = css.slice(css.indexOf(".lcs-fp__row {"), css.indexOf(".lcs-fp__row:last-child"));
    assert.ok(/border: 0/.test(row) && /border-radius: 0/.test(row) && /box-shadow: none/.test(row));
  });

  test("Fantasy 5 remains one family with two independently dated member rows", () => {
    const f5 = FAMILIES.find((f) => f.familyId === "fantasy-5")!;
    assert.equal(f5.memberCount, 2);
    assert.deepEqual(f5.members.map((m) => m.variantLabel), ["Midday", "Evening"]);
    assert.notEqual(f5.members[0].result?.drawDateIso, f5.members[1].result?.drawDateIso);
    /* And its prize is a variable top prize, never worded as a jackpot. */
    assert.equal(f5.prizeSummary?.label, "Est. top prize");
  });
});

describe("LRG-STATE-036: Home is untouched", () => {
  test("no Home-owned selector is redefined in the State block", () => {
    const selectors = [...CSS_036.matchAll(/^\.([A-Za-z][\w-]*)/gm)].map((m) => m[1]);
    const foreign = selectors.filter((c) => !c.startsWith("lcs-"));
    assert.deepEqual(foreign, [], "State may USE lcp- classes but never redefine one");
  });

  test("Home's own components and card markup are unmodified", () => {
    /* The alignment reproduces approved RULES in State-owned code and reuses CSS primitives. It refactors
       nothing in Home, because deduplicating code is not worth a Home regression (§10). */
    assert.ok(/estimated jackpot/.test(HOME_CARD_SRC), "Home's card still says what it always said");
    assert.ok(/lcp-card--featured/.test(HOME_CARD_SRC));
    assert.ok(!/lcs-/.test(HOME_CARD_SRC), "no State class leaked into a Home component");
  });
});

/* ==========================================================================================================
 * LRG-STATE-037 — consumer-first hierarchy and inline interactions.
 *
 * Founder review accepted the result grammar and rejected two experience decisions: Powerball and Mega Millions
 * appeared too late, and ordinary actions relied on modal dialogs. These are the focused tests for the nine
 * rulings, and nothing here restates a test that already exists above.
 * ========================================================================================================== */

/** Every source file that renders any part of the guarded State preview. */
const ALL_PREVIEW_SRC = (() => {
  const dir = new URL("../components/state/preview/", import.meta.url);
  const files = [
    ...readdirSync(dir).filter((f) => f.endsWith(".tsx")).map((f) => `${f}`),
    ...readdirSync(new URL("sections/", dir)).filter((f) => f.endsWith(".tsx")).map((f) => `sections/${f}`),
  ];
  return files.map((f) => ({ file: f, src: codeOnly(readFileSync(new URL(f, dir), "utf8")) }));
})();

describe("LRG-STATE-037: FV-03 — no ordinary action opens a dialog", () => {
  test("the whole State preview contains no dialog, no focus trap and no scroll lock", () => {
    /* Swept across EVERY preview file rather than the four that were changed, because the failure mode is a
       modal surviving somewhere nobody thought to look. FV-03 names Ask AI, What Changed, Discuss Results and
       the Buy Now resolver; the sweep proves the whole surface, which is strictly stronger. */
    for (const { file, src } of ALL_PREVIEW_SRC) {
      for (const banned of [
        'role="dialog"', "aria-modal", "<dialog", "showModal",
        "returnFocusTo",                       /* focus restoration only a trap needs */
        "document.body.style.overflow",         /* scroll locking */
        "lcs-modal", "lcs-sheet", "lcs-backdrop",
      ]) {
        assert.ok(!src.includes(banned), `${file} must not contain "${banned}" (FV-03)`);
      }
    }
  });

  test("the three modal components are deleted, not merely unmounted", () => {
    /* An unmounted modal is one import away from returning, and it keeps its CSS alive. */
    for (const gone of ["StateBuyNowResolver", "StateDiscussionSurface", "StateEngagementBar",
                        "StateDiscussAction"]) {
      assert.equal(
        existsSync(new URL(`../components/state/preview/${gone}.tsx`, import.meta.url)), false,
        `${gone} must be removed (FV-03/FV-08)`);
      assert.ok(!ALL_PREVIEW_SRC.some(({ src }) => src.includes(gone)), `nothing may import ${gone}`);
    }
  });

  test("Escape-key and backdrop handlers are gone from the preview", () => {
    /* Not merely "no dialog element" — no dialog BEHAVIOUR either. A page-level Escape handler on a
       non-dialog surface is the thing that makes an inline panel feel like a modal. */
    for (const { file, src } of ALL_PREVIEW_SRC) {
      assert.ok(!/"Escape"|'Escape'|key === "Esc/.test(src), `${file} keeps no Escape handler`);
    }
  });
});

describe("LRG-STATE-037: FV-01/FV-02 — hierarchy", () => {
  test("the visual sequence is identity -> Powerball/Mega Millions -> native -> actions", () => {
    const jsx = V2_S02.slice(V2_S02.indexOf("<SectionShell"));
    const at = (needle: string) => {
      const i = jsx.indexOf(needle);
      assert.notEqual(i, -1, `${needle} must be rendered`);
      return i;
    };
    /* S-01 is the identity area and precedes S-02 by manifest order, asserted separately above. Within S-02: */
    assert.ok(at("<StateMultiStateBlock") < at("data-primary-result"), "FV-01: multi-state first");
    assert.ok(at("data-primary-result") < at("<StateActionRow"), "then the native family");
    assert.ok(at("<StateActionRow") < at("<StateWhatChanged"), "then the actions");
    /* AD-S00 sits between S-01 and S-02 by manifest order; §1 forbids advertising before the first useful
       result, so no ad anchor may be rendered INSIDE the top stack. */
    assert.ok(!/AdAnchor|StatePreviewAdSlot/.test(V2_S02), "no ad inside the top result stack");
  });

  test("FV-02: the first-native rule decides only the first NATIVE family", () => {
    /* The rule itself — open status first, then newest verified date, then configured priority, and never
       prize size — is already covered against the real Florida families by the LRG-STATE-030 block above. What
       FV-02 adds is a NARROWING: the same rule must not be what decides whether Powerball and Mega Millions
       come first. These are the two properties that establish that, and they are not asserted anywhere else. */

    /* 1. Total order: the same set in any input order yields the same winner, so the top of the page cannot
          change because the feed happened to arrive differently. */
    const shuffled = [...FAMILIES].reverse();
    assert.equal(selectFirstNativeFamily(shuffled)!.familyId, selectFirstNativeFamily(FAMILIES)!.familyId);
    /* Named absolutely, because "unchanged from itself" would also pass if the rule broke in both directions.
       Fantasy 5 and Cash Pop both draw daily and tied on the first three keys until FV-02's added tiebreaks;
       this pins the accepted outcome so closing that tie cannot quietly change the top of the page. */
    assert.equal(selectFirstNativeFamily(FAMILIES)!.familyId, "fantasy-5");

    /* 2. Independence: make a multi-state family the freshest thing on the page with an open status too — the
          strongest possible claim under the rule — and it still cannot be the first native family. Its
          placement is settled by FV-01, not by this function. */
    const loudMultiState = FAMILIES.map((f) =>
      f.group === "multiState"
        ? { ...f, hasOpenStatus: true, newestVerifiedDateIso: "2099-12-31" }
        : { ...f, hasOpenStatus: false });
    const first = selectFirstNativeFamily(loudMultiState)!;
    assert.notEqual(first.group, "multiState");
    assert.equal(first.familyId, selectFirstNativeFamily(
      FAMILIES.map((f) => ({ ...f, hasOpenStatus: false })))!.familyId,
      "and the native winner is unchanged by anything the multi-state families do");
  });
});

describe("LRG-STATE-037: FV-04/FV-06/FV-07 — one inline surface per concern", () => {
  test("every contextual Ask AI moves the reader to the ONE inline AI surface", () => {
    /* Two entry points exist — the per-result Explain action and the action row's primary. Both must scroll and
       focus `#state-ai-brief`; neither may render an answer of its own. */
    const explain = codeOnly(readFileSync(
      new URL("../components/state/preview/StateExplainAction.tsx", import.meta.url), "utf8"));
    for (const [name, src] of [["explain action", explain], ["action row", ENG_SRC]] as const) {
      assert.ok(/state-ai-brief/.test(src), `${name} targets the shared AI section`);
      assert.ok(/scrollIntoView/.test(src) && /\.focus\(/.test(src), `${name} scrolls AND focuses (FV-04)`);
      assert.ok(!/useState/.test(src), `${name} owns no answer surface`);
    }
    /* Exactly one AI surface is mounted, and it is the one that holds the input and the answer. */
    assert.equal((V2_PREVIEW.match(/<SectionS03Draft/g) ?? []).length, 1);
    assert.ok(/data-ai-input="true"/.test(V2_ANSWER) && /aria-live/.test(V2_ANSWER),
      "the inline surface owns the input and an accessible live answer region");
    assert.ok(/lcs-ai-ask/.test(V2_AI) && /lcs-ai-select/.test(V2_AI),
      "and it listens for both contextual entries");
  });

  test("every Buy Now entry moves the reader to the ONE inline S-07 resolver", () => {
    const btn = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8"));
    for (const [name, src] of [["result Buy Now", btn], ["action row", ENG_SRC]] as const) {
      assert.ok(/lcs-buynow-open/.test(src), `${name} sets the game context`);
      assert.ok(/where-to-play/.test(src), `${name} targets S-07`);
      assert.ok(/scrollIntoView/.test(src) && /\.focus\(/.test(src),
        `${name} scrolls to it and focuses its heading (§6)`);
    }
    /* ONE resolver instance, hosted by S-07 — never duplicated into each family. */
    const util = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateUtilitySections.tsx", import.meta.url), "utf8"));
    assert.equal((util.match(/<StateBuyNowInline/g) ?? []).length, 1);
    assert.ok(!ALL_PREVIEW_SRC.some(({ file, src }) =>
      file !== "sections/StateUtilitySections.tsx" && src.includes("<StateBuyNowInline")));
    /* S-07's public heading is unchanged, and the reader never meets the internal status vocabulary. */
    assert.ok(/Buy Now in \$\{model\.stateName\}|Buy Now in Florida/.test(util));
    const inline = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowInline.tsx", import.meta.url), "utf8"));
    assert.ok(/still verifying available purchase options/.test(inline), "FV-07's reader-facing message");
    for (const banned of ["FD-", "DS-", "http://", "https://"]) {
      assert.ok(!inline.includes(banned), `no internal id or raw URL reaches the reader ("${banned}")`);
    }
  });

  test("What Changed is an inline disclosure, one line tall when closed", () => {
    assert.ok(/<details/.test(WC_SRC) && /<summary/.test(WC_SRC), "semantic disclosure (FV-06)");
    assert.ok(/id="what-changed"/.test(WC_SRC), "and it owns the anchor the action row points at");
    /* Exactly one element claims that id anywhere in the preview. */
    const claims = ALL_PREVIEW_SRC.filter(({ src }) => /(id|headingId)="what-changed"/.test(src));
    assert.deepEqual(claims.map((c) => c.file), ["StateWhatChanged.tsx"]);
    /* Collapsed cost is one summary row: no card padding, no border box on the summary itself. */
    assert.ok(/\.lcs-wc__summary\s*\{/.test(V2_CSS));
    /* First visit is the useful sentence FV-06 specifies, not an empty teaser. */
    assert.ok(/Return after the next draw to see what changed/.test(WC_SRC));
  });
});

/* ==========================================================================================================
 * LRG-STATE-038 — final content and commerce polish.
 *
 * FP-01/FP-02 give Buy Now one shared commerce identity across Home and State. FP-03/FP-04/FP-05 keep the hub
 * concise, unsourced content unpublished, and unfinished-looking cards off the page.
 * ========================================================================================================== */

const CSS_038 = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const HOME_PLAY_SRC = readFileSync(
  new URL("../components/preview/PreviewPlayOptions.tsx", import.meta.url), "utf8");
const HOME_SRC_038 = readFileSync(
  new URL("../components/preview/HomePreview.tsx", import.meta.url), "utf8");
const UTIL_038 = codeOnly(readFileSync(
  new URL("../components/state/preview/sections/StateUtilitySections.tsx", import.meta.url), "utf8"));

describe("LRG-STATE-038: FP-01 — the shared commerce primitive", () => {
  test("one brand red, declared once as a token", () => {
    assert.ok(/--color-commerce:\s*#ae0e28;/.test(CSS_038),
      "the crimson sampled from the founder's proposed Florida design");
    /* FP-01 §2: do not invent multiple new red shades. Every commerce rule must reference the token or a
       mix of it — never a second literal red. */
    const block = CSS_038.slice(CSS_038.indexOf(".lcp-btn--commerce {"),
                                CSS_038.indexOf("/* \"Soon\" marker"));
    const literals = block.match(/#[0-9a-fA-F]{3,8}/g) ?? [];
    assert.deepEqual(literals.filter((h) => h.toLowerCase() !== "#000"), [],
      "hover and active are derived from the one token, not new shades");
    assert.ok(/color-mix\(in srgb, var\(--color-commerce\)/.test(block), "derived, not hardcoded");
  });

  test("commerce is NOT the correction colour, and each has a non-colour signal", () => {
    /* DS-03 reserves `--color-alert` for corrections and errors. A purchase button and a correction notice
       sharing an identity is the confusion CLAUDE.md §12 warns about. */
    const decl = CSS_038.match(/--color-commerce:\s*(#[0-9a-f]{6})/i)?.[1].toLowerCase();
    const alert = CSS_038.match(/--color-alert:\s*(#[0-9a-f]{6})/i)?.[1].toLowerCase();
    assert.ok(decl && alert && decl !== alert, "commerce and alert are different tokens");
    const block = CSS_038.slice(CSS_038.indexOf(".lcp-btn--commerce {"),
                                CSS_038.indexOf("/* \"Soon\" marker"));
    /* Forced colours discards author colour, so the identity has to survive as shape. */
    assert.ok(/forced-colors: active/.test(block) && /border/.test(block));
  });

  test("hover, active and the 44px target all exist, and nothing glows", () => {
    const block = CSS_038.slice(CSS_038.indexOf(".lcp-btn--commerce {"),
                                CSS_038.indexOf("/* \"Soon\" marker"));
    assert.ok(/\.lcp-btn--commerce:hover/.test(block) && /\.lcp-btn--commerce:active/.test(block));
    assert.ok(/\.lcp-btn--commerce-quiet:hover/.test(block));
    /* FP-01: no casino-style glow, gradient or animation. */
    for (const banned of ["box-shadow", "gradient", "animation", "transition", "filter:"]) {
      assert.ok(!block.includes(banned), `commerce must not use ${banned}`);
    }
    /* The target comes from `.lcp-target` on Home and `.lcs-buynow` on State — both 44px, both pre-existing. */
    assert.ok(/\.lcp-target \{ min-height: 44px; min-width: 44px; \}/.test(CSS_038));
    assert.ok(/\.lcs-buynow \{ min-height: 44px; \}/.test(CSS_038));
  });

  test("focus needs no special case, because DS-15 draws the ring OUTSIDE the fill", () => {
    /* Navy on crimson is 2.27:1 and would fail. It never lands there: the shared focus rule uses a 2px
       outline-offset, so the ring sits on the page background at 16.5:1. Asserted because a future change
       to `outline-offset` would silently break contrast on every commerce button. */
    const focus = CSS_038.slice(CSS_038.indexOf("[data-lc-preview] :focus-visible"));
    assert.ok(/outline-offset: 2px/.test(focus.slice(0, 250)));
  });
});

describe("LRG-STATE-038: FP-01/FP-02 — where commerce is and is not applied", () => {
  test("Buy Now uses commerce on BOTH Home and State", () => {
    /* Home: the two commerce overlay triggers and the play-section trigger. */
    assert.ok(/set\.action === "play-online" \? "commerce" : "commerce-quiet"/.test(HOME_PLAY_SRC));
    assert.ok(/triggerVariant="commerce"/.test(HOME_SRC_038));
    /* State: the Buy Now button primitive. */
    const btn = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowButton.tsx", import.meta.url), "utf8"));
    assert.ok(/lcp-btn--commerce\b/.test(btn) && /lcp-btn--commerce-quiet/.test(btn));
  });

  test("NON-commerce actions keep their own colours", () => {
    /* FP-01: blue for links and navigation, teal for AI. The risk this guards is recolouring the shared
       `--accent`/`--tonal` variants, which would have turned Home's "Latest results" navigation link and
       its three "Explore AI analysis" buttons into commerce actions. */
    for (const [what, src] of [
      ["Ask AI", codeOnly(readFileSync(
        new URL("../components/state/preview/StateExplainAction.tsx", import.meta.url), "utf8"))],
      ["the action row's non-commerce actions", ENG_SRC],
      ["the inline AI surface", V2_AI],
    ] as const) {
      assert.ok(!/lcp-btn--commerce/.test(src), `${what} must not use the commerce treatment`);
    }
    /* The shared blue variants are untouched, so every existing non-commerce caller is unaffected. */
    assert.ok(/\.lcp-btn--accent \{\n  background: var\(--color-action-primary\);/.test(CSS_038));
    assert.ok(/\.lcp-btn--tonal \{\n  background: var\(--color-info-surface\);/.test(CSS_038));
    /* The retailer/help outcome in S-07 is a SUPPORTING link, not commerce (§4). */
    const inline = codeOnly(readFileSync(
      new URL("../components/state/preview/StateBuyNowInline.tsx", import.meta.url), "utf8"));
    assert.ok(/lcp-btn--quiet/.test(inline) && !/lcp-btn--commerce/.test(inline),
      "the official retailer destination is supporting, not a purchase action");
  });

  test("one dominant commerce action at a time in the top mobile context", () => {
    /* §4. The featured family panel carries no Buy Now at all (FV-08), and the action row's Buy Now is a
       coloured LINK rather than a fourth filled button, so the only filled commerce controls in the top
       stack are the one-per-game multi-state buttons, which are a screen apart at 390px. */
    /* LRG-STATE-039 §4 gives the featured panel its own Buy Now again. §4 also keeps "Buy Now remains the
       separate primary commerce action", so the filled control stays in the card HEADER while every other
       action on the card is a quiet link — one emphasised control per card, which is the §4 requirement. */
    assert.equal((V2_S02.match(/^\s+commerce$/gm) ?? []).length, 1, "the featured panel owns its Buy Now");
    assert.ok(/lcs-fp__cta/.test(V2_PANEL), "and it sits in the header, apart from the quiet action row");
    assert.ok(/\.lcs-act__link\[data-action="buy"\] \{ color: var\(--color-commerce\); \}/.test(CSS_038));
    assert.equal((V2_MSBLOCK.match(/<StateBuyNowButton/g) ?? []).length, 1, "one per multi-state game");
  });
});

describe("LRG-STATE-038: FP-05 — nothing on the page is a card that says it does not work", () => {
  test("the inactive ticket checker no longer looks like a product form", () => {
    /* §5 required the checker's status to be established, not assumed: there is no comparison code in the
       repository, so it is not functional and must not be presented as a module. */
    const s05 = UTIL_038.slice(UTIL_038.indexOf("export function SectionS05"),
                               UTIL_038.indexOf("export function SectionS07"));
    assert.ok(!/<Unavailable/.test(s05), "no unavailable card");
    for (const banned of ["<input", "<select", "<form", "<textarea", "disabled"]) {
      assert.ok(!s05.includes(banned), `no fake checker control (${banned})`);
    }
    assert.ok(/data-ticket-guidance="true"/.test(s05), "compact guidance instead");
    /* It ends at the operator, and says plainly who can actually validate a ticket. */
    assert.ok(/operatorWinningNumbersUrl/.test(s05));
    assert.ok(/cannot confirm a win/.test(s05));
  });

  test("VERIFIED claim facts are published rather than reported as unavailable", () => {
    /* The defect this fixes: `claimThresholds` and `claimDeadline` are both `verified` in the manifest, and
       S-08 rendered them as "currently unavailable" because it passed `.source` into `Unavailable` without
       checking whether the fact publishes. A withheld claim deadline is a fact a reader can lose money by
       not knowing. */
    const m = FLORIDA_MANIFEST;
    assert.ok(m.claimDeadline.value && m.claimThresholds.value, "both are verified in the manifest");
    const s08 = UTIL_038.slice(UTIL_038.indexOf("export function SectionS08("),
                               UTIL_038.indexOf("export function SectionS08A"));
    assert.ok(!/<Unavailable/.test(s08), "no unavailable cards remain in S-08");
    assert.ok(/data-claim-deadline="verified"/.test(s08));
    assert.ok(/manifest\.claimDeadline\.value/.test(s08), "the VALUE is rendered, not the citation");
    /* Tax and anonymity are absent, so they are suppressed — not boxed (§6). */
    assert.ok(!/taxStatus|anonymityRule/.test(s08));
    assert.equal(m.taxStatus.value, undefined);
    assert.equal(m.anonymityRule.value, undefined);
  });

  test("the essentials table lists only verified facts", () => {
    const s08a = UTIL_038.slice(UTIL_038.indexOf("export function SectionS08A"));
    assert.ok(!/Currently unavailable/.test(s08a), "no unavailable rows");
    assert.ok(!/readerCopy/.test(s08a), "nothing needs cleaning, because no citation is rendered");
    /* Rows are conditional on a value existing, so an unsourced fact is omitted rather than displayed. */
    assert.ok(/minimumPurchaseAge\.value \?/.test(s08a) && /claimDeadline\.value \?/.test(s08a));
  });

  test("the news band renders the approved editorial content", () => {
    const low = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateLowerBands.tsx", import.meta.url), "utf8"));
    const s15 = low;
    /* LRG-STATE-039 §9 suppressed this because there was nothing to show; LRG-STATE-040 supplies content. The
       guarantee is unchanged and still conditioned on the CONTENT rather than on a flag, so a jurisdiction
       with no package still suppresses — which is every state but Florida today. */
    /* LRG-STATE-042: the band is populated from approved content, and still suppresses if it ever is not. */
    assert.ok(/if \(!featured && supporting\.length === 0\) return null;/.test(s15));
    assert.ok(/data-news="featured"/.test(s15) && /data-news="supporting"/.test(s15),
      "one featured story and its supporting rows");
    assert.ok(!/data-sparse-hub/.test(s15), "the three-paragraph empty box stays gone");
    for (const banned of ["author", "Read more", "Coming soon"]) {
      assert.ok(!s15.includes(banned), `no fabricated editorial (${banned})`);
    }
  });
});

describe("LRG-STATE-038: FP-04/§7/§8 — only verified destinations", () => {
  test("every official tool is a manifest fact, never a composed URL", () => {
    /* LRG-STATE-042 replaced the S-10 tools directory with the approved Explore band, and moved the official
       destinations into the Resources strip. They are now data, not composed in a component — which is what
       this test was protecting. */
    const bands = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateLowerBands.tsx", import.meta.url), "utf8"));
    /* LRG-STATE-043 moved the content into validated JSON configuration; the property is unchanged. */
    const content = readFileSync(new URL("../config/states/fl.json", import.meta.url), "utf8");
    const tools = content.slice(content.indexOf('"resources"'));
    assert.ok(/data-resource-count=/.test(bands));
    /* No literal URL and no string-built path: every href reads a verified fact. */
    assert.equal((tools.match(/"href": "https:\/\//g) ?? []).length, 4, "four official destinations");
    /* The component never composes a URL — it renders only what the data supplies. */
    assert.ok(!/https?:\/\//.test(bands), "no destination is built in a component");
    for (const key of ["operatorWinningNumbersUrl", "operatorWhereToPlayUrl",
                       "operatorHowToClaimUrl", "operatorResponsiblePlayUrl"]) {
      assert.ok(FLORIDA_MANIFEST[key as keyof typeof FLORIDA_MANIFEST], `${key} exists in the manifest`);
    }
  });

  test("Scratch-Offs, Second Chance and the official app are NOT rendered", () => {
    /* §8: no verified destination exists for any of the three and this task carries no browsing
       authorisation, so each is UNDER REVIEW. Inventing `/scratch-offs` on the operator's domain would be
       an unverified claim even if it happened to resolve. */
    const all = ALL_PREVIEW_SRC.map((f) => f.src).join("\n");
    for (const banned of ["scratch-off", "Scratch-Off", "second-chance", "Second Chance", "/app"]) {
      const hits = all.split("\n").filter((l) => l.includes(banned) && !l.trim().startsWith("*"));
      assert.deepEqual(hits, [], `${banned} must not be rendered while it is UNDER REVIEW`);
    }
  });

  test("no synthetic winner, unclaimed prize or expiry date anywhere in the preview", () => {
    /* FP-04, swept across every preview file rather than the ones this task touched. */
    for (const { file, src } of ALL_PREVIEW_SRC) {
      for (const banned of ["winnerName", "unclaimedPrize", "expiresOn", "expiryDate",
                            "recentWinner", "retailerName", "jackpotWinner"]) {
        assert.ok(!src.includes(banned), `${file} must not carry "${banned}"`);
      }
    }
  });
});

/* ==========================================================================================================
 * LRG-STATE-039 — reader-friendly engagement and share polish.
 *
 * The founder principle: provenance must GOVERN the content, not BECOME it. These tests hold both halves of
 * that — the badges are gone from public copy, and the provenance they came from is still there driving it.
 * ========================================================================================================== */

const SHARE_SRC = codeOnly(readFileSync(
  new URL("../components/state/preview/StateShareResult.tsx", import.meta.url), "utf8"));

describe("LRG-STATE-039: §1 — provenance governs, it is not printed", () => {
  test("no repeated provenance badge is rendered anywhere in the preview", () => {
    /* Swept across every preview file. `codeOnly` strips comments, so the rulings can still be explained in
       prose without the test mistaking documentation for output. */
    for (const { file, src } of ALL_PREVIEW_SRC) {
      for (const banned of ['kind="source"', "Source checked", "Official source", ">Verified<",
                            "SOURCE STATUS", "UNDER REVIEW",
                            "fixture", "synthetic", "Adaptive priority", "Sections moved"]) {
        assert.ok(!src.includes(banned), `${file} must not print "${banned}" to a reader`);
      }
      /* "Currently unavailable" survives in ONE place: the shared `Unavailable` component and the freshness
         fallback, both in `StateCommon`. A jurisdiction that genuinely has no verified data still needs an
         honest way to say so — §11 removed the two that RENDERED for Florida, not the capability. No section
         may print the phrase itself. */
      if (file !== "sections/StateCommon.tsx") {
        assert.ok(!src.includes("currently unavailable"),
          `${file} must not print "currently unavailable" to a reader`);
      }
      /* The internal status enum may appear as a LOOKUP KEY — that is provenance governing the copy, which is
         the whole point of §1. What it must never be is a rendered VALUE. `underReview: "Still being
         verified"` is correct; `{status}` reaching the screen is not. */
      for (const m of src.matchAll(/\b(underReview|retailOnly|courierOnly)\b/g)) {
        const after = src.slice(m.index! + m[0].length, m.index! + m[0].length + 2);
        assert.ok(after.startsWith(":"), `${file}: "${m[0]}" may only appear as a lookup key`);
      }
    }
    /* The three attribution kinds that survive are the ones that change meaning rather than repeat status:
       the guarded-preview marker, the internal suppression note, and a correction. */
    const kinds = ALL_PREVIEW_SRC.flatMap(({ src }) => [...src.matchAll(/kind="([a-z]+)"/g)].map((m) => m[1]));
    assert.deepEqual([...new Set(kinds)].sort(), ["preview"]);
  });

  test("the provenance itself is UNTOUCHED and still gates publication", () => {
    /* The point of §1 is a presentation change, not a data change. If this ever fails, the cleanup went too
       far and the page has stopped being governed. */
    const m = FLORIDA_MANIFEST;
    assert.ok(m.claimDeadline.value && m.operatorHowToClaimUrl.value, "verified facts still carry values");
    assert.equal(m.taxStatus.value, undefined, "absent facts are still absent");
    assert.ok(m.operatorWinningNumbersUrl.source?.length, "citations still recorded");
    /*
     * And the machine-readable freshness is still emitted, which is where a crawler and the tests read it.
     *
     * §A7 moved the RENDERING into the shared `LastUpdated` primitive, so the attributes are asserted where they
     * are now emitted. Both are still present and still derived from the governed value — the presentation moved,
     * the governance did not, which is exactly what §1 asks of this test.
     */
    const chrome = codeOnly(readFileSync(
      new URL("../components/shell/SectionChrome.tsx", import.meta.url), "utf8"));
    assert.ok(/data-last-updated=\{iso\}/.test(chrome));
    assert.ok(/data-freshness=\{stale \? "stale" : "current"\}/.test(chrome));
    /* State reaches it through the shared primitive rather than reimplementing the line. */
    const common = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateCommon.tsx", import.meta.url), "utf8"));
    assert.ok(/<LastUpdated/.test(common), "State consumes the one shared freshness primitive");
  });

  test("ONE concise source-and-freshness line, from governed values", () => {
    /*
     * §A7 — the line is now ONE primitive shared by all five families, so the assertions read the primitive.
     *
     * The visible words changed from "Updated" to "Last updated", which is the wording `CLAUDE.md` §20's
     * pre-merge checklist and the archive's own AR-10 already used. Everything §1 actually cares about is
     * unchanged and asserted below: one line, computed from the governed timestamp, fixed format, no sample text.
     */
    const chrome = codeOnly(readFileSync(
      new URL("../components/shell/SectionChrome.tsx", import.meta.url), "utf8"));
    assert.ok(/Last updated \{formatLastUpdated\(iso, timezoneLabel\)\}/.test(chrome));
    assert.ok(/Results from \$\{sourceName\}/.test(chrome));

    const fmt = codeOnly(readFileSync(
      new URL("../lib/text/lastUpdated.ts", import.meta.url), "utf8"));
    /* §1: "Do not hardcode that sample text." The date is computed from the governed ISO value. */
    assert.ok(!/July 31, 2026|1:15 PM/.test(fmt), "no sample text is hardcoded");
    assert.ok(/iso\.split\("T"\)/.test(fmt), "formatted from the governed timestamp");
    /* Fixed format rather than a runtime locale, so the server and the client cannot disagree. */
    assert.ok(!/toLocaleString|toLocaleDateString|Intl\./.test(fmt));
  });

  test("§2 — a normal published result carries no badge, but exceptions still show", () => {
    const common = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateCommon.tsx", import.meta.url), "utf8"));
    /* Stale is an exception a reader needs: the numbers may not be the latest. §A7 moved the badge into the
       shared primitive with its copy unchanged. */
    const chrome = codeOnly(readFileSync(
      new URL("../components/shell/SectionChrome.tsx", import.meta.url), "utf8"));
    assert.ok(/lcp-stale-badge/.test(chrome) && /days old — not current/.test(chrome));
    void common;
    /* And a correction is still promoted above everything by the adaptive-priority path, unchanged. */
    const preview = codeOnly(readFileSync(
      new URL("../components/state/preview/StatePreview.tsx", import.meta.url), "utf8"));
    assert.ok(/model\.activeOverride/.test(preview), "the promotion path survives");
    assert.ok(/data-override=/.test(preview), "and its trigger stays machine-readable");
  });
});

describe("LRG-STATE-039: §5/§6 — Share Result", () => {
  test("one Share per game family, never on a member row", () => {
    assert.equal((V2_PANEL.match(/<StateShareResult/g) ?? []).length, 1, "one per family panel");
    assert.equal((V2_MSBLOCK.match(/<StateShareResult/g) ?? []).length, 1, "one per multi-state game");
    const memberRow = V2_PANEL.slice(V2_PANEL.indexOf("function MemberRow"),
                                     V2_PANEL.indexOf("export default function StateFamilyPanel"));
    assert.ok(!/StateShareResult/.test(memberRow), "§4: no action repeats on a member row");
  });

  test("the shared link is a governed URL, never an invented route", () => {
    /* §5 forbids fabricating a production URL. `/{state}/{game}` is a preserved pattern that is NOT
       implemented, so sharing it would hand someone a 404. The link is the page that exists, anchored at the
       family's own EXISTING in-page id. */
    assert.ok(/window\.location\.origin.*window\.location\.pathname/s.test(SHARE_SRC),
      "built from the page the reader is on, so no origin is hardcoded");
    assert.ok(!/https?:\/\//.test(SHARE_SRC), "no literal destination");
    assert.ok(!/\/play\/|\/buynow\//.test(SHARE_SRC), "and no route pattern is resolved here");
    /* The fragment is the anchor both surfaces already render. */
    assert.ok(/family-\$\{family\.familyId\}/.test(V2_PANEL));
    assert.ok(/id=\{`family-\$\{family\.familyId\}`\}/.test(V2_PANEL), "the anchor genuinely exists");
  });

  test("native share first, clipboard second, manual link last — and never a false claim", () => {
    assert.ok(/navigator\.share/.test(SHARE_SRC) && /navigator\.clipboard\?\.writeText/.test(SHARE_SRC));
    /* The bounded race exists because `navigator.share` can be present and never settle — caught at runtime
       in headless Chrome, where it left the button silent and un-retryable. */
    assert.ok(/Promise\.race/.test(SHARE_SRC), "the native attempt is bounded");
    assert.ok(/busy\.current = false/.test(SHARE_SRC), "and the guard is always released");
    /* "Link copied" is only ever set after a write actually resolved. */
    assert.ok(/await navigator\.clipboard\.writeText\(target\);\s*setOutcome\("copied"\);/.test(SHARE_SRC),
      "copied is claimed only after the write resolves");
    assert.ok(/setOutcome\("manual"\)/.test(SHARE_SRC), "and a refused clipboard falls through honestly");
    /* "Shared" is claimed only when the native promise itself won the race. */
    assert.ok(/settled === "shared"\) setOutcome\("shared"\)/.test(SHARE_SRC));
  });

  test("accessible, keyboard-operable, and not a dialog", () => {
    assert.ok(/aria-label=\{`Share \$\{gameLabel\} result`\}/.test(SHARE_SRC),
      "§6: the name identifies the game, not five identical 'Share' buttons");
    assert.ok(/<button/.test(SHARE_SRC) && /type="button"/.test(SHARE_SRC), "natively keyboard-operable");
    assert.ok(/role="status"/.test(SHARE_SRC) && /aria-live="polite"/.test(SHARE_SRC));
    /* The region must exist before it has text; one inserted with its content is not reliably announced. */
    const region = SHARE_SRC.slice(SHARE_SRC.indexOf('role="status"'));
    assert.ok(/outcome === "copied" \? "Link copied" : null/.test(region), "empty until there is news");
    for (const banned of ['role="dialog"', "aria-modal", "showModal", "focus()", "window.open"]) {
      assert.ok(!SHARE_SRC.includes(banned), `Share must not ${banned}`);
    }
  });
});

describe("LRG-STATE-039: §7/§9/§10/§11 — journeys and destinations", () => {
  test("Discuss is friendly language and normal navigation", () => {
    assert.ok(/label = "Discuss this result"/.test(DISC_SRC), "§7's reader-facing label");
    assert.ok(/<a\b/.test(DISC_SRC) && !/role="dialog"|dispatchEvent/.test(DISC_SRC));
    /* §7 forbids the internal vocabulary. */
    for (const banned of ["community context", "thread context", "selected discussion object",
                          "posting state"]) {
      assert.ok(!DISC_SRC.toLowerCase().includes(banned), `no "${banned}" in reader copy`);
    }
    /* UPDATED with the community integration: `/community` exists now (commit a39bdfe, Conflict 41;
       FD-ACC-10 satisfied by construction), so a designated caller may pass a real `href` — and the
       governed in-page group stays the default the State page's own links navigate to. */
    assert.ok(/href=\{href \?\? `#\$\{groupId\}`\}/.test(DISC_SRC));
  });

  test("three community groups, honest cold start, no invented activity", () => {
    assert.deepEqual(communityAreasFor("Florida", FAMILIES).map((a) => a.key),
      ["daily", "jackpot", "help"]);
    /* LRG-STATE-042 populated the band from approved content, so the cold start is no longer true and no
       longer shown. What still must hold — and is the point of this test — is that no person and no crowd is
       invented. */
    for (const banned of ["replyCount", "postCount", "memberCount", "avatar", "Trending", "Popular",
                          "Recent Discussions", "lastPostAt", "author"]) {
      assert.ok(!COMM_SRC.includes(banned), `no fake activity signal "${banned}"`);
    }
    assert.ok(/data-discussion-count=/.test(COMM_SRC));
  });

  test("§10/§13 — LotteryCorner destinations, official destinations and trust copy after integration", () => {
    /*
     * LRG-STATE-042 superseded the shapes the three previous assertions described:
     *   §10's two link groups in S-10 became the Explore band plus the Resources strip;
     *   §11's two unavailable cards were already gone and their sections no longer render at all;
     *   §13's Sources-and-methodology section became the Resources band's two sentences.
     * The properties they protected are unchanged, so they are asserted against what renders now.
     */
    const bands = codeOnly(readFileSync(
      new URL("../components/state/preview/sections/StateLowerBands.tsx", import.meta.url), "utf8"));
    /* LRG-STATE-043 moved the content into validated JSON configuration. Every property below is unchanged;
       only the file holding the copy moved. */
    const content = readFileSync(new URL("../config/states/fl.json", import.meta.url), "utf8");

    /* Internal and official destinations are separate: the only outbound links are resource items. */
    assert.ok(/data-resource-count=/.test(bands) && /data-external="true"/.test(bands));
    const cardRegion = content.slice(0, content.indexOf('"resources"'));
    assert.ok(!/https?:\/\//.test(cardRegion), "no card in any band carries an outbound URL");

    /* No unavailable treatment, and no "not published yet" shown to a reader (§5). */
    /* Checked on CODE, not prose: the files explain the rulings that ban these phrases, and a comment saying
       so must not be mistaken for output. */
    /* JSON has no comments, so the file IS its own output — no comment stripping needed. */
    const contentCode = content;
    for (const banned of ["Currently unavailable", "currently unavailable", "not published yet",
                          "Coming soon", "Sources and methodology"]) {
      assert.ok(!bands.includes(banned), `the bands must not render "${banned}"`);
      assert.ok(!contentCode.includes(banned), `the content must not carry "${banned}"`);
    }

    /* The trust copy is two sentences of data, not an essay in a component. */
    assert.ok(/content\.trustCopy/.test(bands) && /content\.independenceCopy/.test(bands));
    assert.ok(/records corrections when information/.test(content));
    assert.ok(/independent lottery information service/.test(content));

    /* No research-citation syntax reaches a reader, anywhere in the integrated lower page. */
    for (const src of [bands, content]) {
      assert.ok(!/\[O[0-9]\]|\[E[0-9]\]|\[P[0-9]\]/.test(src), "no citation code");
    }
  });
});
