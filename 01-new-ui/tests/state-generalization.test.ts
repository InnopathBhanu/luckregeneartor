/*
 * LRG-STATE-047 — representative State template generalization.
 *
 * The load-bearing test here is the FLORIDA NON-REGRESSION ORACLE: `floridaFamilyBuilder.ts` is retained,
 * unused by the application, purely so the generic builder can be proved deep-equal to it. Everything else
 * checks that the six configurations behave as the rulings require and that no fabricated fact reached a page.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

import {
  PREVIEW_STATES, configuredStateCodes, previewEnabledStateCodes, stateViewConfigFor,
  isPreviewEnabledState, previewRegistryEntry,
} from "../lib/state/stateViewConfigRegistry";
import { validateStateViewConfig, capabilityOf, isNoLotteryState } from "../lib/state/stateViewConfig";
import { buildStatePreviewModel } from "../lib/state/statePreviewModel";
import { drawEventsFor, statesWithDrawEvents } from "../lib/state/stateDrawEvents";
import { buildStateFamilies } from "../lib/state/stateFamilyBuilder";
import { buildFloridaFamilies } from "../lib/state/floridaFamilyBuilder";
import { FLORIDA_FAMILIES } from "../lib/state/floridaFamilyConfig";
import { formatVersionsFor, FORMAT_GAPS, formatGapsFor } from "../lib/state/stateFormatRegistry";
import { commerceResolutionFor } from "../lib/state/stateCommerceRegistry";
import { adProfileFor } from "../lib/state/stateAdProfiles";
import { MINIMUM_FLORIDA_PROFILE } from "../lib/state/stateAdBaseline";
import { servesPage } from "../lib/registry/pageFamilyRegistry";
import { stateAgeLine } from "../lib/layout/globalFooterConfig";

const SIX = ["fl", "mi", "va", "ca", "md", "ut"];
const LOTTERY_STATES = ["fl", "mi", "va", "ca", "md"];

/** Source text with comments removed. A prose mention of a banned pattern is not an occurrence of it. */
const codeOnly = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const modelFor = (code: string) => {
  const m = buildStatePreviewModel(code, true, { now: new Date("2026-08-01T12:00:00Z") });
  assert.ok(m, `${code} must build a preview model`);
  return m!;
};

/* ------------------------------------------------------------------ registry */

describe("LRG-STATE-047: the one governed registry", () => {
  test("contains exactly the six FD-X-14 preview States, in that order", () => {
    assert.deepEqual(PREVIEW_STATES.map((e) => e.code), SIX);
    assert.deepEqual(previewEnabledStateCodes(), SIX);
    assert.deepEqual(configuredStateCodes().slice().sort(), [...SIX].sort());
  });

  test("routes are not fixture-derived: a fixture without a registry entry gives no preview", () => {
    /* These all have a `state-*-sample.json` fixture and none is a preview State. If route existence were
       derived from filenames they would be in the set. */
    for (const c of ["ar", "az", "co", "ct", "de", "la", "ma", "me", "mn", "ms", "ny"]) {
      assert.equal(isPreviewEnabledState(c), false, `${c} has a fixture but no registry entry`);
      assert.equal(stateViewConfigFor(c), undefined, `${c} must have no configuration`);
    }
    /* And the converse: Utah is a preview State with NO fixture at all. */
    const fixtures = readdirSync(new URL("../../04-sample-data/", import.meta.url));
    assert.ok(!fixtures.includes("state-ut-sample.json"), "Utah genuinely has no fixture");
    assert.equal(isPreviewEnabledState("ut"), true, "and previews anyway — the registry decides, not the disk");
  });

  test("a JSON file's existence is not enablement; all three conditions are required", () => {
    const src = codeOnly("lib/state/stateViewConfigRegistry.ts");
    /* The registry flag AND the configuration's own flag are both consulted. */
    assert.match(src, /entry\.previewEnabled/);
    assert.match(src, /preview\.enabled === true/);
  });

  test("preview enablement is declared once and read everywhere else", () => {
    const jur = codeOnly("lib/state/jurisdictionRegistry.ts");
    assert.ok(!/previewEnabled: true,?\s*\}/.test(jur.replace(/isPreviewEnabledState[^\n]*/g, "")),
      "jurisdictionRegistry must not carry its own enablement list");
    assert.match(jur, /isPreviewEnabledState/);
  });

  test("the six representative States are served from the registry, with no environment variable", () => {
    /*
     * This asserted the opposite — "guard off, nothing previews" — because `LC_STATE_PREVIEW` used to be required.
     * `FD-GATE-01` removed the flag, so the six registered States are served on a default build. The invariant that
     * matters is unchanged: the LIST comes from the registry, so this test moves with a registry edit and not with a
     * shell variable.
     */
    delete process.env.LC_STATE_PREVIEW;
    for (const c of SIX) assert.equal(servesPage("state", c), true, `${c} is registered and must be served`);
    for (const c of ["az", "ny", "tx"]) assert.equal(servesPage("state", c), false, `${c} is not registered`);
  });
});

/* ------------------------------------------------------------------ configuration schema */

describe("LRG-STATE-047: configuration validation", () => {
  const raw = (c: string) =>
    JSON.parse(readFileSync(new URL(`../config/states/${c}.json`, import.meta.url), "utf8"));

  test("every configuration validates and declares schemaVersion 1.0", () => {
    for (const c of SIX) {
      const cfg = validateStateViewConfig(raw(c), `config/states/${c}.json`);
      assert.equal(cfg.schemaVersion, "1.0");
      assert.equal(cfg.state.code, c);
    }
  });

  test("an unknown schemaVersion fails rather than half-loading", () => {
    assert.throws(
      () => validateStateViewConfig({ ...raw("mi"), schemaVersion: "2.0" }, "t"),
      /schemaVersion/,
    );
  });

  test("required identity and SEO are enforced", () => {
    for (const [field, mutate] of [
      ["state.name", (o: Record<string, unknown>) => { (o.state as Record<string, unknown>).name = ""; }],
      ["state.timezone", (o: Record<string, unknown>) => { (o.state as Record<string, unknown>).timezone = ""; }],
      ["seo.title", (o: Record<string, unknown>) => { (o.seo as Record<string, unknown>).title = ""; }],
      ["seo.description", (o: Record<string, unknown>) => { (o.seo as Record<string, unknown>).description = ""; }],
      ["seo.canonicalPath", (o: Record<string, unknown>) => { (o.seo as Record<string, unknown>).canonicalPath = "mi"; }],
      ["preview.enabled", (o: Record<string, unknown>) => { o.preview = {}; }],
    ] as const) {
      const bad = raw("mi");
      mutate(bad);
      assert.throws(() => validateStateViewConfig(bad, "t"), new RegExp(field.split(".")[1]), field);
    }
  });

  test("no runtime result field can be frozen into a configuration", () => {
    for (const banned of ["drawDateIso", "winningNumbers", "jackpotAmount", "nextPrize", "resultDate"]) {
      const bad = raw("mi");
      (bad.state as Record<string, unknown>)[banned] = "x";
      assert.throws(() => validateStateViewConfig(bad, "t"), /runtime result data/, banned);
    }
  });

  test("no configuration contains a runtime value in fact", () => {
    for (const c of SIX) {
      const flat = JSON.stringify(raw(c));
      for (const banned of ["drawDateIso", "winningNumbers", "jackpotAmount", "cashValue", "nextPrize",
                            "currentStatus", "lastUpdatedIso", "drawStatus", "resultDate"]) {
        assert.ok(!flat.includes(banned), `${c}.json must not contain ${banned}`);
      }
    }
  });

  test("member displayOrder must be a complete sequence, and a game id belongs to one family only", () => {
    const gapped = raw("mi");
    gapped.presentation.families[4].members[1].displayOrder = 7;
    assert.throws(() => validateStateViewConfig(gapped, "t"), /displayOrder/);

    const dupe = raw("mi");
    dupe.presentation.families[5].members[0].gameId = dupe.presentation.families[4].members[0].gameId;
    assert.throws(() => validateStateViewConfig(dupe, "t"), /more than one family/);
  });

  test("a multi-member family must label its members", () => {
    const bad = raw("md");
    bad.presentation.families[4].members[1].variantLabel = "";
    assert.throws(() => validateStateViewConfig(bad, "t"), /variantLabel/);
  });
});

/* ------------------------------------------------------------------ Florida non-regression */

describe("LRG-STATE-047: Florida is unchanged", () => {
  test("the JSON family composition is byte-equal to the locked TypeScript configuration", () => {
    /* CFG-04 moved family composition into JSON. This proves the move changed nothing: the configuration
       the generic builder reads is deep-equal to `floridaFamilyConfig.ts`, which is untouched. */
    const fromJson = stateViewConfigFor("fl")!.presentation.families;
    assert.deepEqual(JSON.parse(JSON.stringify(fromJson)), JSON.parse(JSON.stringify(FLORIDA_FAMILIES)));
  });

  test("the generic builder reproduces the Florida builder exactly", () => {
    /* THE ORACLE. `floridaFamilyBuilder.ts` is retained solely for this comparison. */
    const oracle = buildFloridaFamilies("ET");
    const generic = buildStateFamilies({
      families: stateViewConfigFor("fl")!.presentation.families,
      events: drawEventsFor("fl"),
      formats: formatVersionsFor("fl"),
      timezoneLabel: "ET",
      todayIso: "2026-07-29",
    });
    assert.deepEqual(generic, oracle);
    assert.equal(generic.length, 10, "ten Florida family surfaces");
  });

  test("the format-selection date does not change which Florida formats are chosen", () => {
    /* The model now derives `todayIso` from the manifest rather than from a constant. Same result. */
    const args = {
      families: stateViewConfigFor("fl")!.presentation.families,
      events: drawEventsFor("fl"),
      formats: formatVersionsFor("fl"),
      timezoneLabel: "ET",
    };
    assert.deepEqual(
      buildStateFamilies({ ...args, todayIso: "2026-07-09" }),
      buildStateFamilies({ ...args, todayIso: "2026-07-29" }),
    );
  });

  test("Florida keeps its approved ten advertisement slots", () => {
    const p = adProfileFor("fl");
    assert.equal(p.id, "minimum-florida");
    assert.equal(p.gap, null);
    assert.equal(p.placements, MINIMUM_FLORIDA_PROFILE);
    assert.equal(p.placements.length, 10);
  });

  test("Florida still renders every governed section it did, with its content", () => {
    const m = modelFor("fl");
    assert.equal(m.noLottery, false);
    assert.equal(m.hasLowerContent, true);
    assert.equal(m.familySurfaces.length, 10);
    assert.equal(m.drawEventCount, 19);
    for (const id of ["S-02", "S-04", "S-05", "S-07", "S-08", "S-08A", "S-10", "S-14", "S-15", "S-18"] as const) {
      assert.equal(m.sectionState[id].render, true, `${id} must still render for Florida`);
    }
    assert.equal(m.commerce.kind, "researched");
  });
});

/* ------------------------------------------------------------------ no Florida branch */

describe("LRG-STATE-047: no Florida branch survives in generic code", () => {
  const GENERIC = [
    "lib/state/statePreviewModel.ts",
    "lib/state/stateFamilyBuilder.ts",
    "lib/state/stateDrawEvents.ts",
    "lib/state/stateAdProfiles.ts",
    "lib/state/stateCommerceRegistry.ts",
    "components/state/preview/StatePreview.tsx",
    "components/state/preview/StateBuyNowInline.tsx",
    "components/state/preview/sections/StateDraftSections.tsx",
    "components/state/preview/sections/StateUtilitySections.tsx",
    "components/state/preview/sections/StateLowerBands.tsx",
    "components/state/preview/sections/StateFamilySurface.tsx",
  ];

  test("no generic module compares a state code", () => {
    for (const f of GENERIC) {
      assert.ok(!/=== "(fl|mi|va|ca|md|ut)"/.test(codeOnly(f)), `${f} must not branch on a state code`);
    }
  });

  test("no component imports a Florida module or constant", () => {
    for (const f of GENERIC.filter((f) => f.startsWith("components/"))) {
      const src = codeOnly(f);
      assert.ok(!/FLORIDA_[A-Z_]+/.test(src), `${f} must not reference a Florida constant`);
      assert.ok(!/from "@\/lib\/state\/florida/.test(src), `${f} must not import a Florida module`);
    }
  });

  test("no Florida public copy appears in another State's configuration", () => {
    const fl = stateViewConfigFor("fl")!;
    const floridaStrings = new Set(
      [fl.seo.title, fl.seo.description, fl.seo.breadcrumbLabel,
       fl.content.explore.heading, fl.content.news.heading, fl.content.guides.heading,
       fl.content.community.heading, fl.content.resources.heading].filter(Boolean),
    );
    for (const c of SIX.filter((c) => c !== "fl")) {
      const flat = JSON.stringify(stateViewConfigFor(c));
      assert.ok(!/Florida/.test(flat), `${c}.json must not mention Florida`);
      for (const s of floridaStrings) {
        assert.ok(!flat.includes(s), `${c}.json must not reuse Florida copy: ${s.slice(0, 40)}`);
      }
    }
  });
});

/* ------------------------------------------------------------------ family grouping */

describe("LRG-STATE-047: game-family grouping", () => {
  test("independent game ids are preserved end to end", () => {
    /* Maryland Pick 3 Midday (388) and Evening (389) stay two records inside one surface. */
    const m = modelFor("md");
    const pick3 = m.familySurfaces.find((f) => f.familyId === "pick-3")!;
    assert.deepEqual(pick3.members.map((x) => x.gameId), [388, 389]);
    assert.deepEqual(pick3.members.map((x) => x.variantLabel), ["Midday", "Evening"]);
  });

  test("member rows render in CONFIGURED order, never by recency", () => {
    const m = modelFor("md");
    const pick3 = m.familySurfaces.find((f) => f.familyId === "pick-3")!;
    const [midday, evening] = pick3.members;
    /* Midday is the more recent draw AND is configured first. Reverse the configuration and the order must
       follow the configuration, which is what proves recency is not the sort key. */
    assert.ok(midday.result!.drawDateIso > evening.result!.drawDateIso);
    const reversed = buildStateFamilies({
      families: [{
        ...stateViewConfigFor("md")!.presentation.families.find((f) => f.familyId === "pick-3")!,
        members: [
          { gameId: 389, variantLabel: "Evening", displayOrder: 0 },
          { gameId: 388, variantLabel: "Midday", displayOrder: 1 },
        ],
      }],
      events: drawEventsFor("md"),
      formats: formatVersionsFor("md"),
      timezoneLabel: "ET",
      todayIso: "2026-08-01",
    });
    assert.deepEqual(reversed[0].members.map((x) => x.gameId), [389, 388]);
  });

  test("each member shows its OWN result — no sibling borrowing", () => {
    for (const code of LOTTERY_STATES) {
      const m = modelFor(code);
      const events = new Map(drawEventsFor(code).map((e) => [e.gameId, e]));
      for (const fam of m.familySurfaces) {
        for (const mem of fam.members) {
          if (!mem.result) continue;
          const own = events.get(mem.gameId)!;
          assert.equal(mem.result.drawDateIso, own.resultDate, `${code} ${mem.gameId} date`);
          assert.deepEqual(mem.result.groups[0].values, own.mainNumbers, `${code} ${mem.gameId} numbers`);
        }
      }
    }
  });

  test("a rendered member's numbers exist in the feed under THAT member's own game id", () => {
    /*
     * The borrowing defect this guards against is a member row showing a SIBLING's numbers. Two members
     * legitimately sharing a value is not that: Florida's Cash Pop Morning and Matinee both drew 3 on
     * 2026-07-09, which is a real coincidence in a 1-of-15 game and must not be flagged. So the property is
     * provenance, not distinctness — every rendered row must be reproducible from its own feed record.
     */
    for (const code of LOTTERY_STATES) {
      const events = new Map(drawEventsFor(code).map((e) => [e.gameId, e]));
      for (const fam of modelFor(code).familySurfaces) {
        for (const mem of fam.members) {
          if (!mem.result) continue;
          const own = events.get(mem.gameId);
          assert.ok(own, `${code} ${mem.gameId} rendered with no feed record of its own`);
          const rendered = mem.result.groups;
          assert.deepEqual(rendered[0].values, own!.mainNumbers,
            `${code} ${mem.gameId} main numbers must be its own`);
          assert.deepEqual(
            rendered.slice(1).map((g) => ({ label: g.label, values: g.values })),
            own!.specialBalls.map((b) => ({ label: b.label, values: b.values })),
            `${code} ${mem.gameId} special balls must be its own`,
          );
          assert.equal(mem.result.drawDateIso, own!.resultDate);
        }
      }
    }
  });

  test("a member with no publishable result is dropped, and its family survives if others are valid", () => {
    /* California's Mega Millions feed record has a result date and a prize but an EMPTY numbers element. */
    const ca = drawEventsFor("ca").find((e) => e.gameId === 1013)!;
    assert.equal(ca.mainNumbers.length, 0, "the empty feed record is transcribed faithfully");
    assert.equal(ca.resultDate, "2026-07-07");

    const m = modelFor("ca");
    assert.ok(!m.familySurfaces.some((f) => f.familyId === "mega-millions"),
      "the single-member family with no result is suppressed entirely");
    assert.ok(m.familySurfaces.some((f) => f.familyId === "powerball"),
      "and Powerball, which does have numbers, is unaffected");

    /* The other three States carry the same Mega Millions draw WITH numbers, and it must not have been
       borrowed into California. */
    const mi = drawEventsFor("mi").find((e) => e.gameId === 1013)!;
    assert.ok(mi.mainNumbers.length > 0);
    assert.notDeepEqual(ca.mainNumbers, mi.mainNumbers);
  });

  test("secondary draws stay labelled sub-results, never member rows", () => {
    const mi = modelFor("mi");
    const fantasy = mi.familySurfaces.find((f) => f.familyId === "fantasy-5")!;
    assert.equal(fantasy.members.length, 1, "Double Play is not a member game");
    assert.equal(fantasy.secondary?.label, "Double Play");
    assert.ok((fantasy.secondary?.groups[0].values.length ?? 0) > 0);
  });
});

/* ------------------------------------------------------------------ formats */

describe("LRG-STATE-047: result-format coverage", () => {
  test("every rendered member has an applicable governed format", () => {
    for (const code of LOTTERY_STATES) {
      const keys = new Set(formatVersionsFor(code).map((v) => v.gameKey));
      for (const fam of modelFor(code).familySurfaces) {
        assert.ok(keys.has(fam.formatGameKey), `${code} ${fam.familyId} has no format for ${fam.formatGameKey}`);
      }
    }
  });

  test("no state-native format claims official verification it does not have", () => {
    for (const code of ["mi", "va", "ca", "md"]) {
      for (const v of formatVersionsFor(code)) {
        if (v.gameKey === "powerball" || v.gameKey === "mega-millions") {
          /* Mega Millions is split at its 2025-04-08 rule change. The superseded historical version is
             deliberately `underReview` — the pre-2025 terms were never verified — and it can never serve a
             current draw. Only the CURRENT version must be verified. */
          const current = v.supersededBy === undefined && v.effectiveTo === null;
          assert.equal(v.verification, current ? "verifiedOfficial" : "underReview",
            `${v.gameKey} format ${v.formatId}`);
          continue;
        }
        assert.equal(v.verification, "provisionalProductionDerived", `${code} ${v.gameKey}`);
        assert.equal(v.sources.length, 0, "no official source is claimed where none was read");
        assert.equal(v.prize.kind, "unavailable", "no prize semantics are asserted");
      }
    }
  });

  test("a game whose format is not determined is suppressed and RECORDED, not silently dropped", () => {
    assert.deepEqual(FORMAT_GAPS.map((g) => g.gameId).sort(), [315, 402, 403]);
    for (const g of FORMAT_GAPS) assert.ok(g.reason.length > 80, `${g.gameName} needs a real reason`);
    /* And none of them reaches a page. */
    for (const [code, gameId] of [["mi", 402], ["mi", 403], ["ca", 315]] as const) {
      assert.ok(!drawEventsFor(code).some((e) => e.gameId === gameId), `${gameId} must not be transcribed`);
      const ids = modelFor(code).familySurfaces.flatMap((f) => f.members.map((m) => m.gameId));
      assert.ok(!ids.includes(gameId), `${gameId} must not render`);
    }
    assert.equal(formatGapsFor("mi").length, 2);
    assert.equal(formatGapsFor("md").length, 0);
  });

  test("no format was cloned from another State to make a preview render", () => {
    /* Each State's native game keys are its own; a shared key would mean a borrowed rule. */
    const native = (c: string) =>
      formatVersionsFor(c).filter((v) => !["powerball", "mega-millions"].includes(v.gameKey)).map((v) => v.gameKey);
    const all = ["mi", "va", "ca", "md"].flatMap(native);
    assert.equal(new Set(all).size, all.length, "no native format key is shared between States");
    for (const c of ["mi", "va", "ca", "md"]) {
      for (const k of native(c)) assert.ok(k.startsWith(`${c}-`), `${k} must be namespaced to ${c}`);
    }
  });
});

/* ------------------------------------------------------------------ per-State behaviour */

describe("LRG-STATE-047: per-State capabilities drive composition", () => {
  test("age and timezone come from configuration, not from code", () => {
    assert.equal(stateViewConfigFor("ca")!.state.timezone, "America/Los_Angeles");
    assert.equal(stateViewConfigFor("ca")!.state.timezoneLabel, "PT");
    assert.equal(stateViewConfigFor("mi")!.state.timezoneLabel, "ET");
    assert.equal(stateViewConfigFor("ut")!.state.minimumLotteryAge, null);
    /*
     * Florida's 18 is SOURCED — its manifest and its commerce record both carry the operator's own
     * published wording. The other four are `null`, matching their manifests, which record the published
     * minimum play age as unresearched. A plausible number is not a source, and the global footer renders
     * this value as a public statement.
     */
    assert.equal(stateViewConfigFor("fl")!.state.minimumLotteryAge, 18);
    for (const c of ["mi", "va", "ca", "md"]) {
      assert.equal(stateViewConfigFor(c)!.state.minimumLotteryAge, null, `${c} age is not verified`);
    }
    /* California's Pacific timezone reaches the rendered member rows. */
    const ca = modelFor("ca");
    const times = ca.familySurfaces.flatMap((f) => f.members.map((m) => m.drawTimeLocal)).filter(Boolean);
    assert.ok(times.length > 0 && times.every((t) => t!.endsWith(" PT")), "every CA draw time is labelled PT");
  });

  test("multi-state availability is per State and per game", () => {
    /* Powerball appears in all five lottery States; Mega Millions is configured in all five but renders in
       four, because California's feed record has no numbers. */
    for (const c of LOTTERY_STATES) {
      assert.ok(stateViewConfigFor(c)!.presentation.families.some((f) => f.familyId === "powerball"));
    }
    const withMM = LOTTERY_STATES.filter((c) =>
      modelFor(c).familySurfaces.some((f) => f.familyId === "mega-millions"));
    assert.deepEqual(withMM, ["fl", "mi", "va", "md"]);
    /* Utah has neither, and must never gain them by default. */
    assert.equal(stateViewConfigFor("ut")!.presentation.families.length, 0);
    assert.equal(drawEventsFor("ut").length, 0);
    assert.ok(!statesWithDrawEvents().includes("ut"));
  });

  /*
   * LRG-STATE-048 SUPERSEDES the four-State half of this test: Michigan, Virginia, California and Maryland
   * were hydrated from owned material and now render their bands. The PROPERTY being tested is unchanged and
   * still the important one — a band with no content suppresses cleanly with a recorded reason, never a
   * heading over nothing. Utah and the news band are where that is now demonstrated.
   */
  test("a band with no approved content suppresses cleanly, with a recorded reason", () => {
    /* Utah has no content package at all. */
    const ut = modelFor("ut");
    assert.equal(ut.hasLowerContent, false);
    for (const id of ["S-14", "S-15", "S-18"] as const) {
      const st = ut.sectionState[id];
      assert.equal(st.render, false, `ut ${id} must suppress`);
      assert.ok(st.render === false && st.reason.length > 10);
      assert.ok(!/coming soon|not available yet|not published yet/i.test(st.reason));
    }
    /* And the four hydrated States still have NO news, so that one band stays suppressed while the
       sections around it render — which is the finer-grained version of the same rule. */
    for (const c of ["mi", "va", "ca", "md"]) {
      const m = modelFor(c);
      assert.equal(m.hasLowerContent, true, `${c} was hydrated by LRG-STATE-048`);
      assert.equal(m.lowerContent.newsItems.length, 0, `${c} must still have no news`);
      assert.equal(m.sectionState["S-14"].render, true, `${c} community renders`);
      assert.equal(m.sectionState["S-18"].render, true, `${c} resources render`);
    }
  });

  test("an unverified age never reaches the footer, on either side of the guard", () => {
    /* REG-02: no new State JSON may change guard-off output. The footer age line is global and reads
       configuration by path segment, so a configured age would have appeared on the LEGACY page too. */
    for (const c of ["mi", "va", "ca", "md"]) {
      assert.equal(stateAgeLine(stateViewConfigFor(c)!.state.name,
        stateViewConfigFor(c)!.state.minimumLotteryAge), null, `${c} renders no age line`);
    }
    assert.equal(stateAgeLine("Florida", stateViewConfigFor("fl")!.state.minimumLotteryAge), "18+ in Florida");
  });

  test("no fabricated community or editorial activity exists anywhere", () => {
    for (const c of SIX) {
      const cfg = stateViewConfigFor(c)!;
      const flat = JSON.stringify(cfg.content);
      for (const banned of ["replies", "views", "likes", "avatar", "trending", "memberCount", "upvotes"]) {
        assert.ok(!flat.includes(banned), `${c}.json must not carry ${banned}`);
      }
      /* LRG-STATE-048: community starters are now configured for the four hydrated States. They are
         editorial prompts, not activity — asserted in `state-content-hydration.test.ts`. What must stay
         empty everywhere outside Florida is NEWS, because no real internal article exists. */
      assert.equal(cfg.content.news.items.length, c === "fl" ? 4 : 0, `${c} news items`);
      if (c === "ut") {
        assert.equal(cfg.content.community.items.length, 0, "Utah must have no discussion items");
      }
    }
  });
});

/* ------------------------------------------------------------------ Utah */

describe("LRG-STATE-047: the Utah no-lottery profile", () => {
  const ut = () => modelFor("ut");

  test("Utah is a positive no-lottery profile, not an empty lottery one", () => {
    const cfg = stateViewConfigFor("ut")!;
    assert.equal(cfg.state.lotteryProfile, "noLottery");
    assert.ok(isNoLotteryState(cfg));
    assert.equal(previewRegistryEntry("ut")!.lotteryProfile, "noLottery");
    assert.equal(ut().noLottery, true);
  });

  test("no capability is true, and the validator refuses one that is", () => {
    const cfg = stateViewConfigFor("ut")!;
    for (const k of Object.keys(cfg.capabilities)) assert.equal(capabilityOf(cfg, k), false, k);
    const raw = JSON.parse(readFileSync(new URL("../config/states/ut.json", import.meta.url), "utf8"));
    raw.capabilities.hasStateLottery = true;
    assert.throws(() => validateStateViewConfig(raw, "t"), /no-lottery State/);
  });

  test("no result card, no result section and no fabricated game", () => {
    const m = ut();
    assert.equal(m.familySurfaces.length, 0);
    assert.equal(m.families.length, 0);
    assert.equal(m.results.length, 0);
    assert.equal(m.drawEventCount, 0);
    assert.equal(m.sectionState["S-02"].render, false);
  });

  test("no commerce, no retailer locator, no claim guide, no Buy Now", () => {
    const m = ut();
    assert.equal(m.commerce.kind, "notApplicable");
    assert.equal(m.sectionState["S-07"].render, false);
    assert.equal(m.sectionState["S-08"].render, false);
    assert.equal(m.sectionState["S-08A"].render, false);
  });

  test("the no-lottery page is not monetised with a copied State profile", () => {
    const p = adProfileFor("ut");
    assert.equal(p.placements.length, 0);
    assert.equal(p.id, "none-no-lottery");
    assert.ok(p.gap && p.gap.includes("ST-06"));
  });

  test("the composition claims no national game and infers no cross-border eligibility", () => {
    const src = readFileSync(
      new URL("../components/state/preview/sections/StateNoLottery.tsx", import.meta.url), "utf8");
    const rendered = codeOnly("components/state/preview/sections/StateNoLottery.tsx");
    assert.ok(!/Powerball|Mega Millions/.test(rendered), "no national game is offered on a Utah page");
    assert.ok(!/Idaho|Wyoming|Nevada|Colorado|drive|border/i.test(rendered),
      "no cross-border purchase guidance");
    assert.ok(!/coming soon|not available yet/i.test(rendered));
    /* It answers the question it was opened for, in the first block. */
    assert.match(src, /does not run a state lottery/);
  });

  test("Utah links only to preview States that actually resolve", () => {
    const others = ut().previewStates.filter((s) => s.code !== "ut");
    assert.deepEqual(others.map((s) => s.code), ["fl", "mi", "va", "ca", "md"]);
    for (const s of others) assert.ok(isPreviewEnabledState(s.code), `${s.code} must be a live route`);
  });
});

/* ------------------------------------------------------------------ commerce */

describe("LRG-STATE-047: commerce", () => {
  test("Buy Now remains the entry label and is capability-driven", () => {
    const src = codeOnly("components/state/preview/sections/StateUtilitySections.tsx");
    assert.match(src, /Buy Now/);
    assert.ok(!/Where to Play<\/|>Where to Play</.test(src.replace(/Where to Play — /g, "")),
      "Where to Play survives only as a supporting link");
    assert.match(codeOnly("components/state/preview/StateBuyNowInline.tsx"), /commerce\.kind === "researched"/);
  });

  test("unknown never becomes retailOnly, and no provider is named", () => {
    for (const c of ["mi", "va", "ca", "md"]) {
      const r = commerceResolutionFor(c);
      assert.equal(r.kind, "unknown", `${c} has no researched capability`);
      assert.ok(r.kind === "unknown" && !/retail|in stores|online/i.test(r.readerNote),
        `${c} must not assert a purchase channel`);
      assert.ok(r.kind === "unknown" && !/Lottery\b/.test(r.readerNote.replace(`${r.stateName} lottery`, "")),
        `${c} must not name an operator`);
    }
  });

  test("no affiliate destination is exposed anywhere in configuration", () => {
    /*
     * Checked on DESTINATIONS, not on prose. The independence copy legitimately contains the word
     * "affiliated" — "LotteryCorner is an independent lottery information service and is not affiliated with
     * any state lottery" — and a substring scan over the whole file flags that sentence, which is the
     * opposite of a finding.
     */
    for (const c of SIX) {
      const flat = JSON.stringify(stateViewConfigFor(c));
      const urls = [...flat.matchAll(/"href":\s*"([^"]+)"/g)].map((m) => m[1]);
      for (const u of urls) {
        assert.ok(!/utm_|clickid|partner_id|[?&]ref=|affiliate/i.test(u),
          `${c}.json exposes a tracking or affiliate destination: ${u}`);
        assert.ok(/^https:\/\/(www\.)?floridalottery\.com\//.test(u) || u.startsWith("/"),
          `${c}.json exposes an unexpected external destination: ${u}`);
      }
    }
  });
});

/* ------------------------------------------------------------------ SEO and advertising */

describe("LRG-STATE-047: metadata, schema and advertising", () => {
  test("every State has a unique title, description and canonical", () => {
    const titles = new Set<string>();
    const canons = new Set<string>();
    for (const c of SIX) {
      const cfg = stateViewConfigFor(c)!;
      assert.equal(cfg.seo.canonicalPath, `/${c}`);
      assert.ok(!titles.has(cfg.seo.title), `${c} title must be unique`);
      assert.ok(!canons.has(cfg.seo.canonicalPath), `${c} canonical must be unique`);
      titles.add(cfg.seo.title);
      canons.add(cfg.seo.canonicalPath);
      assert.ok(cfg.seo.title.includes(cfg.state.name), `${c} title names the State`);
    }
  });

  test("Utah's metadata does not imply an operating Utah lottery", () => {
    const seo = stateViewConfigFor("ut")!.seo;
    assert.match(seo.description, /does not operate a state lottery/);
    assert.equal(seo.schemaAboutName, "Utah", "not 'Utah Lottery'");
    assert.ok(!/winning numbers for|jackpots for|results today/i.test(seo.title));
  });

  test("no State inherits Florida's advertisement inventory automatically", () => {
    for (const c of ["mi", "va", "ca", "md", "ut"]) {
      const p = adProfileFor(c);
      assert.equal(p.placements.length, 0, `${c} must render no unapproved slot`);
      assert.ok(p.gap && p.gap.length > 60, `${c} must record the missing ad decision`);
      assert.notEqual(p.id, "minimum-florida");
    }
    /* And the approved Florida keys appear in no other State's profile. */
    const flKeys = new Set(MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey));
    for (const c of ["mi", "va", "ca", "md", "ut"]) {
      for (const p of adProfileFor(c).placements) {
        assert.ok(!flKeys.has((p as { slotKey: string }).slotKey));
      }
    }
  });
});
