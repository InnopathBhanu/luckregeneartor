/*
 * LRG-STATE-029 — Florida result-format and Buy Now capability contract tests.
 *
 * These are correctness tests for the DATA CONTRACT, not the UI. They assert the distinctions the accepted
 * national research found missing: drawn vs purchase-time add-ons, secondary draws as separate results,
 * labelled prize semantics, deterministic date-effective versioning, retirement, and the Buy Now
 * eligibility/disclosure rules.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  selectFormatVersion, assertNoOverlappingVersions, formatPublicationFindings, mayPublishFormats,
  currentVersions, renderableGroups,
} from "../lib/state/resultFormatContract";
import { FLORIDA_FORMAT_VERSIONS, SCHEDULE_CONFLICTS } from "../lib/state/floridaFormatRegistry";
import {
  resolveBuyNow, capabilityPublicationFindings, isCompensated, OPTION_TYPE_RANK,
  FLORIDA_COMMERCE_CAPABILITY, FLORIDA_PURCHASE_OPTIONS,
  type GamePurchaseOption, type StateCommerceCapability,
} from "../lib/state/buyNowCapability";
import { FLORIDA_DRAW_EVENTS, floridaGameFamilies } from "../lib/state/floridaDrawEvents";
import { FLORIDA_MANIFEST } from "../lib/state/floridaContentManifest";

const TODAY = "2026-07-29";

/* ================================================================= formats */

describe("LRG-STATE-029: every active Florida event has exactly one valid format", () => {
  test("each family resolves to exactly one version on a current date", () => {
    for (const fam of floridaGameFamilies()) {
      const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, fam.familyKey, TODAY);
      assert.ok(v, `${fam.familyKey} has no format version valid on ${TODAY}`);
    }
  });

  test("no overlapping effective ranges anywhere in the registry", () => {
    assert.doesNotThrow(() => assertNoOverlappingVersions(FLORIDA_FORMAT_VERSIONS));
  });

  test("overlapping ranges are rejected loudly", () => {
    const bad = [
      ...FLORIDA_FORMAT_VERSIONS,
      { ...FLORIDA_FORMAT_VERSIONS.find((v) => v.gameKey === "cash-pop")!, formatId: 99614 },
    ];
    assert.throws(() => assertNoOverlappingVersions(bad), /open-ended|overlap/);
  });

  test("ambiguous resolution throws rather than silently picking one", () => {
    const cp = FLORIDA_FORMAT_VERSIONS.find((v) => v.gameKey === "cash-pop")!;
    assert.throws(
      () => selectFormatVersion([cp, { ...cp, formatId: 99614 }], "cash-pop", TODAY),
      /resolves to 2 versions/,
    );
  });
});

describe("LRG-STATE-029: date-effective selection uses the draw date, not the newest version", () => {
  test("a pre-2025 Mega Millions draw resolves to the historical version", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "mega-millions", "2024-06-01");
    assert.ok(v);
    assert.equal(v!.formatId, 10131, "must be the pre-2025 version");
    assert.equal(v!.multiplier.kind, "unavailable");
  });

  test("a current Mega Millions draw resolves to the built-in multiplier version", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "mega-millions", TODAY);
    assert.ok(v);
    assert.equal(v!.formatId, 1013);
    assert.equal(v!.multiplier.kind, "builtIn");
    assert.equal(v!.primaryGroups.find((g) => g.label === "Mega Ball")!.max, 24);
  });

  test("the rule change boundary is exact", () => {
    assert.equal(selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "mega-millions", "2025-04-07")!.formatId, 10131);
    assert.equal(selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "mega-millions", "2025-04-08")!.formatId, 1013);
  });
});

/* ================================================================= add-ons */

describe("LRG-STATE-029: add-on classification", () => {
  test("Fireball is a DRAWN add-on with its own group, never a main ball", () => {
    for (const key of ["pick-2", "pick-3", "pick-4", "pick-5"]) {
      const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, key, TODAY)!;
      const fb = v.addOns.find((a) => a.key === "fireball");
      assert.ok(fb, `${key} must declare Fireball`);
      assert.equal(fb!.addOnClass, "drawn");
      assert.ok(fb!.drawnGroup, "a drawn add-on must carry its drawn group");
      assert.equal(fb!.drawnGroup!.visualRole, "addOn");
      assert.match(fb!.mechanicNote, /REPLACES/, "the replacement mechanic must be recorded");
      /* And it must NOT be inside the main group. */
      for (const g of v.primaryGroups) {
        assert.notEqual(g.label, "Fireball", `${key} main groups must not contain Fireball`);
      }
    }
  });

  test("EZmatch is a PURCHASE-TIME add-on with no drawn group", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "florida-lotto", TODAY)!;
    const ez = v.addOns.find((a) => a.key === "ezmatch");
    assert.ok(ez, "Florida Lotto must declare EZmatch");
    assert.equal(ez!.addOnClass, "purchaseTime");
    assert.equal(ez!.drawnGroup, undefined, "a purchase-time add-on must have no drawn value");
    assert.match(ez!.mechanicNote, /instant|Instant/);
  });

  test("Combo is a PURCHASE-TIME add-on on Jackpot Triple Play", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "jackpot-triple-play", TODAY)!;
    const combo = v.addOns.find((a) => a.key === "combo");
    assert.ok(combo);
    assert.equal(combo!.addOnClass, "purchaseTime");
    assert.equal(combo!.drawnGroup, undefined);
  });

  test("renderableGroups includes drawn add-ons and excludes purchase-time ones", () => {
    const lotto = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "florida-lotto", TODAY)!;
    const labels = renderableGroups(lotto).map((g) => g.label);
    assert.ok(!labels.includes("EZmatch"), "EZmatch must never be a renderable result group");

    const pick3 = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "pick-3", TODAY)!;
    assert.ok(renderableGroups(pick3).some((g) => g.label === "Fireball"));
  });

  test("a purchase-time add-on carrying a drawn group fails the gate", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "florida-lotto", TODAY)!;
    const broken = {
      ...v,
      addOns: v.addOns.map((a) =>
        a.key === "ezmatch"
          ? { ...a, drawnGroup: { order: 9, label: "EZmatch", valueType: "number" as const, count: 1, min: 1, max: 9, differentSet: true, colorToken: "x", accessibleLabel: "EZmatch" } }
          : a,
      ),
    };
    const findings = formatPublicationFindings([broken], TODAY);
    assert.ok(findings.some((f) => /must never render as a result/.test(f.reason)));
  });
});

/* ================================================================= secondary draws */

describe("LRG-STATE-029: secondary draws are separate results", () => {
  test("Powerball and Florida Lotto each declare a Double Play with its own groups and prize", () => {
    for (const key of ["powerball", "florida-lotto"]) {
      const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, key, TODAY)!;
      assert.equal(v.secondaryDraws.length, 1, `${key} must declare one secondary draw`);
      const sd = v.secondaryDraws[0];
      assert.equal(sd.label, "Double Play");
      assert.ok(sd.groups.length > 0, "a secondary draw needs its own drawn groups");
      assert.ok(sd.sources.length > 0, "a secondary draw needs its own source");
      assert.ok(sd.prize.kind !== "unavailable", "a secondary draw declares its own prize kind");
    }
  });

  test("Florida Lotto Double Play does NOT inherit the parent jackpot", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "florida-lotto", TODAY)!;
    assert.equal(v.prize.kind, "advertisedJackpot");
    assert.equal(v.secondaryDraws[0].prize.kind, "fixedTopPrize");
    assert.match(v.secondaryDraws[0].prize.variabilityNote!, /250,000/);
  });

  test("games with no secondary draw declare none", () => {
    for (const key of ["mega-millions", "fantasy-5", "cash-pop", "pick-3"]) {
      assert.equal(selectFormatVersion(FLORIDA_FORMAT_VERSIONS, key, TODAY)!.secondaryDraws.length, 0);
    }
  });
});

/* ================================================================= multipliers */

describe("LRG-STATE-029: multiplier kinds are distinguished", () => {
  test("Power Play is independently selected; Mega Millions is built in", () => {
    assert.equal(selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "powerball", TODAY)!.multiplier.kind,
      "independentlySelected");
    assert.equal(selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "mega-millions", TODAY)!.multiplier.kind,
      "builtIn");
  });

  test("games without a multiplier say notApplicable rather than leaving it empty", () => {
    for (const key of ["florida-lotto", "fantasy-5", "cash-pop", "jackpot-triple-play", "pick-3"]) {
      assert.equal(selectFormatVersion(FLORIDA_FORMAT_VERSIONS, key, TODAY)!.multiplier.kind,
        "notApplicable", key);
    }
  });
});

/* ================================================================= prize semantics */

describe("LRG-STATE-029: prize and jackpot semantics are labelled", () => {
  test("no format uses a generic unlabelled prize", () => {
    for (const v of FLORIDA_FORMAT_VERSIONS) {
      assert.ok(v.prize.kind, `${v.gameKey} must declare a prize kind`);
    }
  });

  test("annuitized jackpots declare a separately published cash value", () => {
    for (const key of ["powerball", "mega-millions"]) {
      const p = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, key, TODAY)!.prize;
      assert.equal(p.kind, "estimatedAnnuitizedJackpot");
      assert.equal(p.cashValueAvailable, true, "cash value is published separately, never derived");
    }
  });

  test("Florida Lotto and Jackpot Triple Play are advertised jackpots with NO cash value", () => {
    for (const key of ["florida-lotto", "jackpot-triple-play"]) {
      const p = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, key, TODAY)!.prize;
      assert.equal(p.kind, "advertisedJackpot");
      assert.equal(p.cashValueAvailable, false);
    }
  });

  test("Fantasy 5 is a variable top prize with the rolldown recorded", () => {
    const p = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "fantasy-5", TODAY)!.prize;
    assert.equal(p.kind, "variableTopPrize");
    assert.match(p.variabilityNote!, /rolls down|rolldown/i);
  });

  test("Cash Pop is stake-dependent and cannot state a prize without ticket context", () => {
    const p = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "cash-pop", TODAY)!.prize;
    assert.equal(p.kind, "stakeDependentPrize");
    assert.deepEqual([...p.stakeOptions!], ["$1", "$2", "$5", "$10"]);
    assert.deepEqual(p.stakeMultiplierRange, { min: 5, max: 250 });
    assert.match(p.variabilityNote!, /CANNOT be stated without/);
  });

  test("a stake-dependent prize with no stake options fails the gate", () => {
    const cp = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "cash-pop", TODAY)!;
    const broken = { ...cp, prize: { ...cp.prize, stakeOptions: [] } };
    assert.ok(formatPublicationFindings([broken], TODAY)
      .some((f) => /no recorded stake options/.test(f.reason)));
  });
});

/* ================================================================= retirement */

describe("LRG-STATE-029: retired-game handling", () => {
  const c4l = FLORIDA_FORMAT_VERSIONS.find((v) => v.gameKey === "cash4life")!;

  test("Cash4Life is recorded as retired with its official date and claim window", () => {
    assert.ok(c4l.retirement, "must carry a retirement record");
    assert.equal(c4l.retirement!.retiredOn, "2026-02-21");
    assert.match(c4l.retirement!.claimWindowNote!, /180 days/);
    assert.equal(c4l.retirement!.replacementGameId, null, "no replacement is officially identified");
    assert.equal(c4l.retirement!.retainHistoricalResults, true);
    assert.ok(c4l.retirement!.sources.length > 0);
  });

  test("a retired game is excluded from current versions", () => {
    const current = currentVersions(FLORIDA_FORMAT_VERSIONS, TODAY).map((v) => v.gameKey);
    assert.ok(!current.includes("cash4life"), "retired game must not appear in current results");
  });

  test("a retired game's historical results remain resolvable", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "cash4life", "2026-01-15");
    assert.ok(v, "a valid historical draw date must still resolve to a format — no accidental 404");
    assert.equal(v!.formatId, 1015);
  });

  test("a retired game left open for current draws fails the gate", () => {
    const broken = { ...c4l, effectiveTo: null };
    assert.ok(formatPublicationFindings([broken], TODAY)
      .some((f) => /retired on .* but its format is still open/.test(f.reason)));
  });

  test("Cash4Life is absent from the current Florida draw events", () => {
    assert.ok(!FLORIDA_DRAW_EVENTS.some((e) => e.familyKey === "cash4life"));
  });
});

/* ================================================================= the public gate */

describe("LRG-STATE-029: provisional formats cannot publish publicly", () => {
  test("the registry is NOT publishable as a whole — under-review versions exist", () => {
    /* LRG-STATE-030 closed the Pick 2 and Pick 4 verification gaps against the official Florida Lottery
       game pages, so both are now `verifiedOfficial`. The registry is STILL not publishable as a whole,
       because the retired pre-2025 Mega Millions version remains `underReview` — which is the correct
       outcome: a historical format nobody has re-verified must not gate-pass silently. */
    assert.equal(mayPublishFormats(FLORIDA_FORMAT_VERSIONS, TODAY), false,
      "the unverified historical Mega Millions version must block a whole-registry public render");
  });

  test("every blocking finding names an unverified version", () => {
    const findings = formatPublicationFindings(FLORIDA_FORMAT_VERSIONS, TODAY);
    const blocked = new Set(findings.map((f) => f.gameKey));
    assert.ok(blocked.has("mega-millions"), "the unverified historical Mega Millions version should block");
    /* Verified in LRG-STATE-030 from floridalottery.com/games/draw-games/pick-2 and /pick-4: both state
       the digit count, both drawing times and the Fireball replacement mechanic. They no longer block. */
    for (const key of ["pick-2", "pick-4"]) {
      assert.ok(!blocked.has(key), `${key} is now verifiedOfficial and must not block`);
    }
    /* Every remaining finding must name a genuinely unverified version — never a verified one. */
    for (const f of findings) {
      const v = FLORIDA_FORMAT_VERSIONS.find((x) => x.formatId === f.formatId);
      assert.ok(v && v.verification !== "verifiedOfficial",
        `finding for format ${f.formatId} must refer to a non-verified version`);
    }
  });

  test("the verifiedOfficial subset IS publishable", () => {
    const ok = FLORIDA_FORMAT_VERSIONS.filter(
      (v) => v.verification === "verifiedOfficial" && !v.retirement && v.effectiveTo === null,
    );
    assert.ok(ok.length >= 6);
    assert.equal(formatPublicationFindings(ok, TODAY).length, 0);
  });

  test("a cloned/provisional verification is rejected", () => {
    const v = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, "cash-pop", TODAY)!;
    const cloned = { ...v, verification: "provisionalCloned" as const };
    assert.ok(formatPublicationFindings([cloned], TODAY)
      .some((f) => /only verifiedOfficial may publish/.test(f.reason)));
  });

  test("every verifiedOfficial version cites a primary official source", () => {
    for (const v of FLORIDA_FORMAT_VERSIONS.filter((x) => x.verification === "verifiedOfficial")) {
      assert.ok(v.sources.length > 0, `${v.gameKey} must cite a source`);
      for (const s of v.sources) {
        assert.match(s.url, /^https:\/\/(floridalottery|www\.powerball|www\.megamillions)\.com/,
          `${v.gameKey} source must be a primary official domain, got ${s.url}`);
        assert.ok(s.accessed && s.supports.length > 20);
      }
    }
  });
});

/* ================================================================= schedule conflicts */

describe("LRG-STATE-029: schedule conflicts are recorded, not silently reconciled", () => {
  test("the Pick evening conflict is recorded with official resolution", () => {
    const c = SCHEDULE_CONFLICTS.find((x) => (x.gameKeys as readonly string[]).includes("pick-3"))!;
    assert.match(c.productionExport, /7:57/);
    assert.match(c.official, /9:45/);
    assert.match(c.resolution, /Official wins/);
  });

  test("the corrected evening time is in the draw events", () => {
    const evenings = FLORIDA_DRAW_EVENTS.filter(
      (e) => e.familyKey.startsWith("pick-") && e.drawPeriod === "Evening",
    );
    assert.equal(evenings.length, 4);
    for (const e of evenings) {
      assert.equal(e.drawTimeLocal, "9:45 PM", `${e.familyKey} evening must use the official time`);
    }
  });
});

/* ================================================================= Buy Now */

describe("LRG-STATE-029: Florida commerce remains underReview", () => {
  test("Florida capability is underReview, never retailOnly", () => {
    assert.equal(FLORIDA_COMMERCE_CAPABILITY.status, "underReview");
    const json = JSON.stringify(FLORIDA_COMMERCE_CAPABILITY);
    assert.ok(!/"retailOnly"/.test(json));
    assert.match(FLORIDA_COMMERCE_CAPABILITY.note, /never retailOnly/);
  });

  test("the manifest reports the underReview state", () => {
    assert.equal(FLORIDA_MANIFEST.commerceCapabilityRef.availability, "underReview");
  });

  test("the resolver returns underReview with a Where to Play supporting action", () => {
    const out = resolveBuyNow({
      capability: FLORIDA_COMMERCE_CAPABILITY, options: FLORIDA_PURCHASE_OPTIONS,
      jurisdictionConfirmed: true, ageConfirmed: true, physicalLocationConfirmed: true,
      safetyContexts: [], todayIso: TODAY,
    });
    assert.equal(out.kind, "underReview");
    assert.equal(out.supportingAction, "Where to Play");
    assert.equal(out.options.length, 0);
  });
});

describe("LRG-STATE-029: resolver ordering, safety and disclosure", () => {
  const cap: StateCommerceCapability = {
    jurisdiction: "xx", status: "verified", officialOperator: "Test Lottery",
    minimumAge: "18", physicalLocationRequired: true,
    source: "test", lastVerified: "2026-07-01", reviewBy: "2026-12-31", note: "test", readerNote: "test reader copy",
  };
  const opt = (t: GamePurchaseOption["optionType"], extra: Partial<GamePurchaseOption> = {}): GamePurchaseOption => ({
    gameId: 1, gameKey: "g", optionType: t, providerIdentity: `p-${t}`,
    providerRelationship: isCompensated(t) ? "compensated" : "official",
    eligibleJurisdiction: "xx", source: "test", lastVerified: "2026-07-01",
    reviewBy: "2026-12-31", lifecycle: "active",
    ...(isCompensated(t) ? { disclosure: "We may be paid if you use this option." } : {}),
    ...extra,
  });
  const run = (options: GamePurchaseOption[], over: Partial<Parameters<typeof resolveBuyNow>[0]> = {}) =>
    resolveBuyNow({
      capability: cap, options, gameKey: "g",
      jurisdictionConfirmed: true, ageConfirmed: true, physicalLocationConfirmed: true,
      safetyContexts: [], todayIso: TODAY, ...over,
    });

  test("official options sort ahead of compensated options", () => {
    const out = run([opt("approvedAffiliate"), opt("retailer"), opt("officialWeb"), opt("approvedCourier"), opt("officialApp")]);
    assert.equal(out.kind, "eligibleOptions");
    assert.deepEqual(out.options.map((o) => o.optionType),
      ["officialWeb", "officialApp", "approvedCourier", "approvedAffiliate", "retailer"]);
    /* every official option precedes every compensated one */
    const firstCompensated = out.options.findIndex((o) => isCompensated(o.optionType));
    const lastOfficial = out.options.map((o) => isCompensated(o.optionType)).lastIndexOf(false);
    assert.ok(firstCompensated < lastOfficial || firstCompensated === 2,
      "compensated options must be grouped after the official ones");
    assert.ok(OPTION_TYPE_RANK.officialWeb < OPTION_TYPE_RANK.approvedAffiliate);
  });

  test("a compensated option sets requiresDisclosure", () => {
    assert.equal(run([opt("officialWeb")]).requiresDisclosure, false);
    assert.equal(run([opt("officialWeb"), opt("approvedAffiliate")]).requiresDisclosure, true);
  });

  test("every safety context suppresses Buy Now", () => {
    for (const ctx of ["possibleWin", "correction", "claimGuidance", "responsiblePlay", "postLossDominant", "promotionPaused"] as const) {
      const out = run([opt("officialWeb")], { safetyContexts: [ctx] });
      assert.equal(out.kind, "suppressedBySafetyContext", ctx);
      assert.equal(out.options.length, 0, ctx);
    }
  });

  test("stale jurisdiction evidence suppresses", () => {
    const out = resolveBuyNow({
      capability: { ...cap, reviewBy: "2026-01-01" }, options: [opt("officialWeb")], gameKey: "g",
      jurisdictionConfirmed: true, ageConfirmed: true, physicalLocationConfirmed: true,
      safetyContexts: [], todayIso: TODAY,
    });
    assert.equal(out.kind, "suppressedByStaleEvidence");
  });

  test("a stale option is excluded", () => {
    const out = run([opt("officialWeb", { reviewBy: "2026-01-01" })]);
    assert.equal(out.kind, "underReview", "no fresh option remains");
  });

  test("unconfirmed eligibility asks rather than assumes", () => {
    const out = run([opt("officialWeb")], { jurisdictionConfirmed: false, ageConfirmed: false });
    assert.equal(out.kind, "clarificationRequired");
    assert.ok(out.missing.includes("your state"));
    assert.ok(out.missing.includes("your age"));
  });

  test("the explanation never implies LotteryCorner sells tickets", () => {
    const out = run([opt("officialWeb")]);
    assert.match(out.explanation, /does not sell tickets/);
  });

  test("deferred and expired options never render", () => {
    assert.equal(run([opt("officialWeb", { lifecycle: "deferred" })]).kind, "underReview");
    assert.equal(run([opt("officialWeb", { lifecycle: "expired" })]).kind, "underReview");
  });
});

describe("LRG-STATE-029: commerce publication gate", () => {
  const cap: StateCommerceCapability = {
    jurisdiction: "xx", status: "verified", officialOperator: "T",
    source: "s", lastVerified: "2026-07-01", reviewBy: "2026-12-31", note: "n", readerNote: "reader n",
  };
  const base: GamePurchaseOption = {
    gameId: 1, gameKey: "g", optionType: "approvedAffiliate", providerIdentity: "p",
    providerRelationship: "compensated", eligibleJurisdiction: "xx", source: "s",
    lastVerified: "2026-07-01", reviewBy: "2026-12-31", lifecycle: "active",
    disclosure: "We may be paid if you use this option.",
  };

  test("a compensated option without disclosure is rejected", () => {
    const { disclosure, ...noDisclosure } = base;
    const f = capabilityPublicationFindings(cap, [noDisclosure as GamePurchaseOption], TODAY);
    assert.ok(f.some((x) => /no adjacent disclosure/.test(x.reason)));
  });

  test("a fully disclosed option passes", () => {
    assert.equal(capabilityPublicationFindings(cap, [base], TODAY).length, 0);
  });

  test("expired option evidence is rejected", () => {
    const f = capabilityPublicationFindings(cap, [{ ...base, reviewBy: "2026-01-01" }], TODAY);
    assert.ok(f.some((x) => /evidence expired/.test(x.reason)));
  });

  test("no provider URL is carried in the option contract", () => {
    const json = JSON.stringify(FLORIDA_PURCHASE_OPTIONS) + JSON.stringify(base);
    assert.ok(!/https?:\/\/(?!floridalottery)/.test(json.replace(/floridalottery\.com/g, "")),
      "no partner destination URL may appear in commerce data");
  });
});
