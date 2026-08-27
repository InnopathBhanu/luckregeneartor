/*
 * LRG-GAME-050 — the guarded JG-M2 State-native Game Page family.
 *
 * The load-bearing groups are:
 *
 *   RULE ERA        the payout matrix is the operator's, the retired 1-OFF era cannot be published, and a
 *                   comparison is priced against the era of the DRAW rather than of today;
 *   FAMILY          Midday and Evening stay two independent records under one identity, at one, two and five
 *                   members, and their composition is NOT restated in game configuration;
 *   HONEST ABSENCE  a game without a verified matrix suppresses it, and never draws a control that cannot work;
 *   NEUTRALITY      every statement the analysis layer emits is checked against the forbidden framings.
 *
 * The payout figures below are asserted against Florida rule 53ER24-56 read on 2026-08-04. If the operator
 * changes a prize, these tests are supposed to fail.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ELIGIBLE, eligiblePairs, gameRegistryEntry } from "../lib/game/gameRegistry";
import { resolveGamePreview } from "../lib/game/gamePreviewGuard";
import { configuredGamePairs, gameConfigFor } from "../lib/game/gameConfigRegistry";
import { validateGameViewConfig, type GameViewConfig } from "../lib/game/gameViewConfig";
import { buildGamePreviewModel, JG_M1_ORDER, JG_M2_ORDER, type GameSectionId } from "../lib/game/gamePreviewModel";
import { JG_M2_BANDS } from "../lib/game/gameM2Model";
import {
  PICK3_CURRENT_ERA, PICK3_PRE_FIREBALL_ERA, CASH_POP_ERA, JACKPOT_TRIPLE_PLAY_ERA, FLORIDA_RULE_ERAS,
  RULE_CONFLICTS,
} from "../lib/game/floridaGameRules";
import {
  activeAddOns, currentRuleEra, eraPublishableAsCurrent, selectRuleEra, validateRuleEra,
} from "../lib/game/gameRuleContract";
import { checkTicket, digitShapeOf, orderingCount, validateSelection } from "../lib/game/digitTicketCheck";
import { eligiblePlayTypes, generateSets, MAX_SETS } from "../lib/game/digitSetGenerator";
import {
  assertNeutralLanguage, coverageOf, drawInsights, DRAW_WINDOWS, filterDraws, historicalGaps,
  lookupNumberInDraws, pairFrequency, parseTypedNumber, positionFrequency, repeatFromPrevious,
  searchNumberHistory, shapeDistribution, sumDistribution, variantComparison, type AnalysisFilter,
} from "../lib/game/digitHistoryAnalysis";
import { articleDateLine, articleRoutes, findArticle } from "../lib/game/gameEditorial";
import { gameLogo } from "../lib/preview/gameLogoRegistry";
import { buildReviewHistory } from "../lib/game/gameReviewFixture";
import { resolveReviewDate, reviewDateFor } from "../lib/game/gameReviewDate";

/* Florida's own resolved review date. Read through the resolver rather than restated, so a test cannot assert
   against a date the page does not actually use. */
const FL_REVIEW_DATE = reviewDateFor("fl");
import { searchHistory, type SearchInput } from "../lib/game/gameHistorySearch";
import {
  orderedDigitPositions, singleValueGroup, undeclaredSemantics, unorderedNumberPool,
  type ResultFormatVersion,
} from "../lib/state/resultFormatContract";
import { hasRuleEras, ruleErasFor } from "../lib/game/gameRuleProvider";
import { ISOLATED_FALLBACK_REVIEW_DATE } from "../lib/game/gameReviewDate";
import { FLORIDA_FORMAT_VERSIONS } from "../lib/state/floridaFormatRegistry";
import {
  CA_FORMAT_VERSIONS, MD_FORMAT_VERSIONS, MI_FORMAT_VERSIONS, VA_FORMAT_VERSIONS,
} from "../lib/state/stateFormatRegistry";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const codeOnly = (p: string) => src(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const m2model = (slug: string) => {
  const m = buildGamePreviewModel("fl", slug, true);
  assert.ok(m, `${slug} model must build`);
  assert.ok(m!.m2, `${slug} must be a JG-M2 page`);
  return { model: m!, m2: m!.m2! };
};

const HALF = 50;
const ONE = 100;
const PICK3_KEY = "pick-3";

/* ------------------------------------------------------------------ route and registry */

describe("LRG-GAME-050: routes are declared, and introduced ones stay guarded", () => {
  test("eleven declared pairs across two jurisdictions, one JG-M1 and ten JG-M2", () => {
    /* LRG-GAME-052 grew this from four to eleven. The count is asserted so a pair cannot appear or vanish
       unnoticed, and the jurisdiction spread is asserted because a second state is the genericity proof. */
    assert.deepEqual(eligiblePairs().sort(), [
      "ca/daily-3", "ca/superlotto-plus",
      "fl/cash-pop", "fl/fantasy-5", "fl/jackpot-triple-play", "fl/lotto",
      "fl/pick-2", "fl/pick-3", "fl/pick-4", "fl/pick-5", "fl/powerball",
    ]);
    assert.equal(ELIGIBLE.filter((e) => e.mode === "JG-M1").length, 1);
    assert.equal(ELIGIBLE.filter((e) => e.mode === "JG-M2").length, 10);
    assert.equal(new Set(ELIGIBLE.map((e) => e.stateCode)).size, 2);
  });

  test("the primary game id of a family page is its FIRST configured member", () => {
    /* Pick 3 Midday (332) and Cash Pop Morning (614) — never a synthetic parent id. */
    assert.equal(gameRegistryEntry("fl", "pick-3")?.gameId, 332);
    assert.equal(gameRegistryEntry("fl", "cash-pop")?.gameId, 614);
    assert.equal(gameRegistryEntry("fl", "jackpot-triple-play")?.gameId, 582);
  });

  test("eligibility is never derived from a config file or the feed", () => {
    /* `fl/mega-millions` and `ca/daily-4` each have a configured State family, transcribed draw events and a
       format version — everything except a registry entry. They must still not resolve. */
    for (const [st, slug] of [["fl", "mega-millions"], ["ca", "daily-4"], ["ca", "fantasy-5"]] as const) {
      assert.equal(gameRegistryEntry(st, slug), undefined, `${st}/${slug} must have no registry entry`);
      assert.equal(buildGamePreviewModel(st, slug, true), null, `${st}/${slug} must not build`);
    }
  });

  test("every registered pair resolves without a custom environment flag", () => {
    for (const p of ["pick-3", "cash-pop", "jackpot-triple-play", "powerball"]) {
      assert.equal(resolveGamePreview("fl", p), true, `/fl/${p} must resolve from the registry`);
    }
    assert.equal(resolveGamePreview("fl", "mega-millions"), false, "an unregistered pair must still 404");
  });

  test("every JG-M2 canonical path is the governed route, never a second canonical", () => {
    for (const slug of ["pick-3", "cash-pop", "jackpot-triple-play"]) {
      assert.equal(gameConfigFor("fl", slug)?.seo.canonicalPath, `/fl/${slug}`);
    }
  });
});

/* ------------------------------------------------------------------ order and bands */

describe("LRG-GAME-050: BP-04B §18 order and the nine bands", () => {
  test("JG_M2_ORDER reproduces the blueprint table exactly", () => {
    assert.deepEqual([...JG_M2_ORDER], [
      "JG-01", "JG-02", "AD-JG00", "JG-03", "JG-04", "JG-05", "JG-06", "AD-JG01",
      "JG-07", "JG-08", "JG-09", "JG-10", "JG-11", "AD-JG02",
      "JG-12", "JG-13", "JG-14", "JG-15", "JG-16", "JG-17", "JG-18", "AD-JG03",
      "Footer",
    ]);
  });

  test("the JG-M1 order is untouched by this task", () => {
    assert.deepEqual([...JG_M1_ORDER], [
      "JO-01", "JO-02", "AD-JO00", "JO-03", "JO-04", "JO-05", "JO-06", "JO-07", "JO-08", "AD-JO01", "Footer",
    ]);
  });

  test("the nine bands cover all eighteen sections exactly once, and no ad anchor", () => {
    assert.equal(JG_M2_BANDS.length, 9);
    const covered = JG_M2_BANDS.flatMap((b) => b.sections);
    assert.equal(new Set(covered).size, covered.length, "no section may appear in two bands");
    assert.deepEqual(
      [...covered].sort(),
      Array.from({ length: 18 }, (_, i) => `JG-${String(i + 1).padStart(2, "0")}`).sort(),
    );
    for (const s of covered) assert.ok(!s.startsWith("AD-"), "an ad anchor must not sit inside a band");
  });

  test("every band carries a heading, so the outline is h1 → band h2 → section h3", () => {
    for (const b of JG_M2_BANDS) assert.ok(b.title.length > 0, `band ${b.id} needs a title`);
  });

  test("all four advertisement anchors stay in the order and resolve to nothing", () => {
    const { model } = m2model("pick-3");
    for (const id of ["AD-JG00", "AD-JG01", "AD-JG02", "AD-JG03"] as const) {
      assert.ok(JG_M2_ORDER.includes(id), `${id} must keep its governed position`);
      assert.equal(model.sectionState[id].render, false);
    }
  });

  test("all eighteen sections render on the Pick 3 reference page", () => {
    const { model } = m2model("pick-3");
    for (let i = 1; i <= 18; i++) {
      const id = `JG-${String(i).padStart(2, "0")}` as keyof typeof model.sectionState;
      assert.equal(model.sectionState[id]?.render, true, `${id} must render on /fl/pick-3`);
    }
  });
});

/* ------------------------------------------------------------------ the rule era */

describe("LRG-GAME-050: the payout matrix is the operator's, and the retired era cannot be published", () => {
  test("1-OFF is absent from the current era and present only in the retired one", () => {
    assert.ok(!PICK3_CURRENT_ERA.playTypes.some((p) => p.key === "one-off"));
    assert.ok(!PICK3_CURRENT_ERA.payouts.some((r) => r.playTypeKey === "one-off"));
    assert.ok(PICK3_PRE_FIREBALL_ERA.playTypes.some((p) => p.key === "one-off"));
  });

  test("the retired era is unpublishable as current, by construction", () => {
    assert.equal(PICK3_PRE_FIREBALL_ERA.verification, "retiredEra");
    assert.equal(PICK3_PRE_FIREBALL_ERA.retired, true);
    assert.equal(eraPublishableAsCurrent(PICK3_PRE_FIREBALL_ERA), false);
    assert.equal(eraPublishableAsCurrent(PICK3_CURRENT_ERA), true);
    assert.equal(currentRuleEra(FLORIDA_RULE_ERAS, PICK3_KEY)?.eraId, "fl-pick-3-fireball");
  });

  test("the era boundary is 2021-01-18, the dated FIREBALL/1-OFF changeover", () => {
    assert.equal(selectRuleEra(FLORIDA_RULE_ERAS, PICK3_KEY, "2021-01-17")?.eraId, "fl-pick-3-1off");
    assert.equal(selectRuleEra(FLORIDA_RULE_ERAS, PICK3_KEY, "2021-01-18")?.eraId, "fl-pick-3-fireball");
    assert.equal(activeAddOns(PICK3_PRE_FIREBALL_ERA, "2019-06-01").length, 0);
    assert.equal(activeAddOns(PICK3_CURRENT_ERA, FL_REVIEW_DATE)[0]?.key, "fireball");
  });

  test("base prizes and odds match rule 53ER24-56 exactly", () => {
    const row = (k: string) => {
      const r = PICK3_CURRENT_ERA.payouts.find((x) => x.playTypeKey === k);
      assert.ok(r, `missing payout row ${k}`);
      return r!;
    };
    assert.equal(row("straight").prizeByWagerCents[HALF], "$250.00");
    assert.equal(row("straight").prizeByWagerCents[ONE], "$500.00");
    assert.equal(row("straight").oddsDisplay, "1 in 1,000");

    assert.equal(row("box-3way").prizeByWagerCents[HALF], "$80.00");
    assert.equal(row("box-3way").prizeByWagerCents[ONE], "$160.00");
    assert.equal(row("box-3way").oddsDisplay, "1 in 333.33");

    assert.equal(row("box-6way").prizeByWagerCents[HALF], "$40.00");
    assert.equal(row("box-6way").prizeByWagerCents[ONE], "$80.00");
    assert.equal(row("box-6way").oddsDisplay, "1 in 166.67");

    /* A Straight/Box play IS a $1.00 play and genuinely pays two amounts. */
    assert.equal(row("straight-box-3way").splitPrize?.[ONE].exactOrder, "$330.00");
    assert.equal(row("straight-box-3way").splitPrize?.[ONE].anyOrder, "$80.00");
    assert.equal(row("straight-box-6way").splitPrize?.[ONE].exactOrder, "$290.00");
    assert.equal(row("straight-box-6way").splitPrize?.[ONE].anyOrder, "$40.00");
    assert.equal(row("straight-box-3way").prizeByWagerCents[HALF], undefined, "not sold at 50 cents");

    /* Combo prizes are flat; the TICKET cost is what scales with the coverage. */
    assert.equal(row("combo-3way").ticketCostByWagerCents?.[HALF], "$1.50");
    assert.equal(row("combo-3way").ticketCostByWagerCents?.[ONE], "$3.00");
    assert.equal(row("combo-6way").ticketCostByWagerCents?.[HALF], "$3.00");
    assert.equal(row("combo-6way").ticketCostByWagerCents?.[ONE], "$6.00");

    assert.equal(row("front-pair").prizeByWagerCents[ONE], "$50.00");
    assert.equal(row("back-pair").prizeByWagerCents[HALF], "$25.00");
    assert.equal(row("front-pair").oddsDisplay, "1 in 100");
  });

  test("FIREBALL prizes, odds and published maximum win counts match the rule", () => {
    const fb = PICK3_CURRENT_ERA.addOns.find((a) => a.key === "fireball");
    assert.ok(fb);
    const row = (k: string) => fb!.payouts.find((x) => x.playTypeKey === k)!;
    assert.equal(row("straight").prizeByWagerCents[HALF], "$100.00");
    assert.equal(row("straight").prizeByWagerCents[ONE], "$200.00");
    assert.equal(row("straight").oddsDisplay, "1 in 333");
    assert.equal(row("box-3way").prizeByWagerCents[ONE], "$68.00");
    assert.equal(row("box-6way").prizeByWagerCents[ONE], "$34.00");
    assert.equal(row("front-pair").prizeByWagerCents[ONE], "$20.00");
    assert.equal(fb!.maxWinsByPlayType["straight-box-3way"], 4);
    assert.equal(fb!.maxWinsByPlayType["box-6way"], 2);
    assert.equal(fb!.effectiveFrom, "2021-01-18");
  });

  test("ticket price and Advance Play are the operator's, not the production export's", () => {
    /* Founder decision 5. The export says `1$` and `upto 14 consecutive draws`; both are wrong. */
    assert.match(PICK3_CURRENT_ERA.ticketPrice!, /50 cents or \$1\.00/);
    assert.match(PICK3_CURRENT_ERA.advancePlay!, /fourteen-day period/);
    assert.deepEqual(PICK3_CURRENT_ERA.wagers.map((w) => w.amountCents), [HALF, ONE]);
  });

  test("every recorded conflict resolves in favour of the operator", () => {
    assert.ok(RULE_CONFLICTS.length >= 3);
    for (const c of RULE_CONFLICTS) {
      assert.ok(c.resolution.length > 0);
      assert.ok(c.verifiedFrom.length > 0, `${c.field} must cite where it was verified`);
    }
  });

  test("an era cannot be constructed unsourced, unbounded or internally inconsistent", () => {
    const base = { ...PICK3_CURRENT_ERA };
    assert.throws(() => validateRuleEra({ ...base, sources: [] }), /no primary source/);
    assert.throws(() => validateRuleEra({ ...base, effectiveFrom: "" }), /no effectiveFrom/);
    assert.throws(
      () => validateRuleEra({ ...base, effectiveTo: "2030-01-01", retired: false }),
      /closed but not marked retired/,
    );
    /* A payout priced against a wager the era does not sell is the quiet way a matrix goes wrong. */
    assert.throws(
      () => validateRuleEra({ ...base, wagers: [{ amountCents: ONE, label: "$1.00" }] }),
      /prices wager 50c/,
    );
  });

  test("games with no verified matrix carry zero payout rows and say why", () => {
    for (const era of [JACKPOT_TRIPLE_PLAY_ERA, CASH_POP_ERA]) {
      assert.equal(era.payouts.length, 0);
      assert.ok(era.absent.some((a) => a.field === "payoutMatrix" && a.reason.length > 20));
    }
    /* Cash Pop's prize is unstateable without a stake, which is stronger than merely unverified. */
    assert.match(CASH_POP_ERA.absent.find((a) => a.field === "payoutMatrix")!.reason, /play amount/);
  });

  test("selection shape lives on the FORMAT, not on the rule era", () => {
    /* LRG-GAME-052 moved these five facts to `BallGroupSpec`. Asserting them here would re-create the
       competing definition the refactor removed, so the shape assertions live in the profile suite below. */
    for (const era of [PICK3_CURRENT_ERA, JACKPOT_TRIPLE_PLAY_ERA, CASH_POP_ERA]) {
      const flat = JSON.stringify(era);
      for (const gone of ["selectionKind", "selectionCount", "selectionMin", "selectionMax"]) {
        assert.ok(!flat.includes(gone), `${era.eraId} must not carry ${gone}`);
      }
    }
  });
});

/* ------------------------------------------------------------------ the family contract */

describe("LRG-GAME-050: one identity, independent member records", () => {
  test("Pick 3 renders two members with their OWN ids, dates and values", () => {
    const { m2 } = m2model("pick-3");
    assert.equal(m2.members.length, 2);
    const [midday, evening] = m2.members;
    assert.equal(midday.gameId, 332);
    assert.equal(evening.gameId, 333);
    assert.equal(midday.variantLabel, "Midday");
    assert.equal(evening.variantLabel, "Evening");
    /* The whole point: differing dates are CORRECT, not stale. */
    assert.equal(midday.result?.drawDateIso, "2026-07-09");
    assert.equal(evening.result?.drawDateIso, "2026-07-08");
    assert.notEqual(midday.result!.drawDateIso, evening.result!.drawDateIso);
    /* And neither borrows the other's numbers. */
    const values = (m: typeof midday) => m.result!.groups.flatMap((g) => g.values).join(",");
    assert.equal(values(midday), "3,7,8,9");
    assert.equal(values(evening), "5,6,9,4");
  });

  test("member order is the configured order, never re-sorted by recency", () => {
    const { m2 } = m2model("pick-3");
    /* Evening drew EARLIER, so a recency sort would put Midday first by accident and hide the bug. Assert the
       configured order holds and that displayOrder — not the date — decides. */
    assert.deepEqual(m2.members.map((m) => m.displayOrder), [0, 1]);
    assert.deepEqual(m2.members.map((m) => m.gameId), [332, 333]);
  });

  test("Cash Pop proves five stable rows, each with its own record", () => {
    const { m2 } = m2model("cash-pop");
    assert.equal(m2.members.length, 5);
    assert.deepEqual(m2.members.map((m) => m.gameId), [614, 615, 616, 617, 618]);
    assert.deepEqual(m2.members.map((m) => m.variantLabel),
      ["Morning", "Matinee", "Afternoon", "Evening", "Late Night"]);
    /* Three drew on the 9th and two on the 8th — five independent dates, not one shared date. */
    const dates = m2.members.map((m) => m.result?.drawDateIso);
    assert.equal(dates.filter((d) => d === "2026-07-09").length, 3);
    assert.equal(dates.filter((d) => d === "2026-07-08").length, 2);
  });

  test("a single-member family uses the same contract", () => {
    const { m2 } = m2model("jackpot-triple-play");
    assert.equal(m2.members.length, 1);
    assert.equal(m2.members[0].gameId, 582);
    assert.equal(m2.members[0].variantLabel, "");
  });

  test("family composition is NOT restated in game configuration", () => {
    /* Two declarations of one fact is how Midday and Evening drift. Composition lives in the State config. */
    for (const slug of ["pick-3", "cash-pop", "jackpot-triple-play"]) {
      const raw = JSON.parse(src(`config/games/fl-${slug}.json`));
      assert.equal(raw.members, undefined, `${slug} config must not declare members`);
      assert.equal(raw.game.familyId, slug);
    }
    const stateFamilies = JSON.parse(src("config/states/fl.json")).presentation.families;
    const pick3 = stateFamilies.find((f: { familyId: string }) => f.familyId === "pick-3");
    assert.deepEqual(pick3.members.map((m: { gameId: number }) => m.gameId), [332, 333]);
  });

  test("a next-draw date is never in the past relative to the review date", () => {
    for (const slug of ["pick-3", "cash-pop", "jackpot-triple-play"]) {
      const { m2 } = m2model(slug);
      assert.equal(m2.reviewDateIso, FL_REVIEW_DATE);
      for (const s of m2.schedules) {
        if (s.nextDrawDisplay === null) continue;
        /* `Sat 07/11/2026` → compare the ISO the display was built from by re-deriving it. */
        const [, mm, dd, yyyy] = s.nextDrawDisplay.match(/(\d{2})\/(\d{2})\/(\d{4})/)!.map(Number) as unknown as number[];
        const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
        assert.ok(iso >= FL_REVIEW_DATE, `${slug} ${s.variantLabel}: next draw ${iso} is before the review date`);
      }
    }
  });
});

/* ------------------------------------------------------------------ the checker */

describe("LRG-GAME-050: the comparison is deterministic and rule-era aware", () => {
  const drawn = { gameId: 332, drawDateIso: FL_REVIEW_DATE, digits: [3, 7, 8], fireball: 9 };
  const base = { gameId: 332, variantLabel: "Midday", drawDateIso: FL_REVIEW_DATE, wagerCents: ONE, fireballSelected: false };
  const run = (over: Partial<typeof base> & { digits: (number | null)[]; playTypeKey: string }) =>
    checkTicket({ ...base, ...over }, drawn, FLORIDA_RULE_ERAS, PICK3_KEY, { min: 0, max: 9 });

  test("exact order pays the published straight prize", () => {
    const r = run({ digits: [3, 7, 8], playTypeKey: "straight" });
    assert.equal(r.kind, "match");
    assert.equal(r.prizeDisplay, "$500.00");
    assert.equal(r.oddsDisplay, "1 in 1,000");
    assert.match(r.statement, /exact order/);
  });

  test("a box play pays the box prize for the wager actually chosen", () => {
    assert.equal(run({ digits: [8, 3, 7], playTypeKey: "box-6way" }).prizeDisplay, "$80.00");
    assert.equal(
      run({ digits: [8, 3, 7], playTypeKey: "box-6way", wagerCents: HALF }).prizeDisplay,
      "$40.00",
    );
  });

  test("a Straight/Box play reports WHICH side paid", () => {
    const exact = run({ digits: [3, 7, 8], playTypeKey: "straight-box-6way" });
    assert.equal(exact.splitOutcome, "exactOrder");
    assert.equal(exact.prizeDisplay, "$290.00");
    const any = run({ digits: [8, 7, 3], playTypeKey: "straight-box-6way" });
    assert.equal(any.splitOutcome, "anyOrder");
    assert.equal(any.prizeDisplay, "$40.00");
  });

  test("pair plays are position-aware", () => {
    assert.equal(run({ digits: [3, 7, null], playTypeKey: "front-pair" }).kind, "match");
    assert.equal(run({ digits: [null, 7, 8], playTypeKey: "back-pair" }).kind, "match");
    /* 7-8 are the LAST two digits, so they are not a front pair. */
    assert.equal(run({ digits: [7, 8, null], playTypeKey: "front-pair" }).kind, "noMatch");
  });

  test("a combo covers every order of its digits", () => {
    assert.equal(run({ digits: [7, 8, 3], playTypeKey: "combo-6way" }).kind, "match");
    assert.equal(run({ digits: [7, 8, 4], playTypeKey: "combo-6way" }).kind, "noMatch");
  });

  test("FIREBALL can win alone, by replacement, and never silently", () => {
    /* Drawn 3-7-8 with FIREBALL 9 creates 9-7-8, 3-9-8 and 3-7-9. */
    const r = run({ digits: [9, 7, 8], playTypeKey: "straight", fireballSelected: true });
    assert.equal(r.kind, "match");
    assert.equal(r.prizeDisplay, null, "the BASE prize must not be paid on a FIREBALL-only win");
    assert.equal(r.fireball?.matchCount, 1);
    assert.equal(r.fireball?.prizeDisplay, "$200.00");
    assert.equal(r.fireball?.findings.length, 3, "three combinations are always created");
    assert.equal(r.fireball?.maxWins, 3);

    /* Not selected on the ticket → no FIREBALL analysis at all. */
    assert.equal(run({ digits: [9, 7, 8], playTypeKey: "straight" }).fireball, null);
    /* Selected but not a winner → an explicit statement, not silence. */
    const none = run({ digits: [3, 7, 8], playTypeKey: "straight", fireballSelected: true });
    assert.equal(none.fireball?.matchCount, 0);
    assert.match(none.fireball!.statement, /does not create a combination/);
  });

  test("a ticket is compared against the era of the DRAW, not of today", () => {
    const old = checkTicket(
      { ...base, drawDateIso: "2019-06-01", digits: [3, 7, 8], playTypeKey: "one-off" },
      { gameId: 332, drawDateIso: "2019-06-01", digits: [3, 7, 8], fireball: null },
      FLORIDA_RULE_ERAS,
      PICK3_KEY,
      { min: 0, max: 9 },
    );
    assert.equal(old.era?.eraId, "fl-pick-3-1off");
    assert.equal(old.era?.retired, true);
    /* And 1-OFF is rejected for a CURRENT drawing, because it is no longer sold. */
    assert.equal(run({ digits: [3, 7, 8], playTypeKey: "one-off" }).kind, "invalidSelection");
  });

  test("a Midday ticket can never be compared against another drawing", () => {
    const r = checkTicket(
      { ...base, gameId: 333, variantLabel: "Evening", digits: [3, 7, 8], playTypeKey: "straight" },
      drawn,
      FLORIDA_RULE_ERAS,
      PICK3_KEY,
      { min: 0, max: 9 },
    );
    assert.equal(r.kind, "invalidSelection");
    assert.match(r.statement, /different drawing/);
  });

  test("an unbuyable selection is refused with a reason, not answered", () => {
    /* A triple has one ordering, so no Box, Straight/Box or Combo exists to sell. */
    assert.equal(orderingCount([7, 7, 7]), 1);
    assert.equal(digitShapeOf([7, 7, 7]), "allSame");
    const r = run({ digits: [7, 7, 7], playTypeKey: "box-3way" });
    assert.equal(r.kind, "invalidSelection");
    assert.match(r.statement, /only one possible order/);

    const shapeMismatch = validateSelection([1, 2, 3], PICK3_CURRENT_ERA.playTypes.find((p) => p.key === "box-3way")!, { min: 0, max: 9 });
    assert.equal(shapeMismatch.ok, false);
  });

  test("orderings are arithmetic, not assumption", () => {
    assert.equal(orderingCount([1, 2, 3]), 6);
    assert.equal(orderingCount([1, 1, 2]), 3);
  });

  test("the ticket-validation boundary is on every outcome", () => {
    for (const r of [
      run({ digits: [3, 7, 8], playTypeKey: "straight" }),
      run({ digits: [1, 1, 1], playTypeKey: "straight" }),
      run({ digits: [7, 7, 7], playTypeKey: "box-6way" }),
    ]) {
      assert.match(r.boundary, /not ticket validation/);
    }
  });

  test("no prize amount is ever computed — every one is a published string", () => {
    /* Arithmetic on money is how a checker invents a prize. The module must contain none. */
    const code = codeOnly("lib/game/digitTicketCheck.ts");
    assert.ok(!/parseFloat|Number\([^)]*prize|prize\s*[*+/-]/i.test(code),
      "the checker must not do arithmetic on a prize");
  });
});

/* ------------------------------------------------------------------ the generator */

describe("LRG-GAME-050: the generator produces valid sets and claims nothing", () => {
  test("sets respect the era's own range and count", () => {
    const r = generateSets(profileFor("pick-3"), { setCount: 5, allowRepeats: true });
    assert.equal(r.sets.length, 5);
    for (const s of r.sets) {
      assert.equal(s.values.length, 3);
      for (const v of s.values) assert.ok(v >= 0 && v <= 9, `${v} out of range`);
    }
    const cp = generateSets(profileFor("cash-pop"), { setCount: 3, allowRepeats: false });
    for (const s of cp.sets) {
      assert.equal(s.values.length, 1);
      assert.ok(s.values[0] >= 1 && s.values[0] <= 15);
    }
  });

  test("a ball game never repeats a value, whatever the caller asks for", () => {
    const r = generateSets(profileFor("jackpot-triple-play"), { setCount: 6, allowRepeats: true });
    for (const s of r.sets) assert.equal(new Set(s.values).size, s.values.length);
    assert.match(r.note!, /does not draw the same value twice/);
  });

  test("the repeats toggle is described as a preference, not a rule", () => {
    const r = generateSets(profileFor("pick-3"), { setCount: 2, allowRepeats: false });
    for (const s of r.sets) assert.equal(new Set(s.values).size, 3);
    assert.match(r.note!, /does not change what the drawing can produce/);
  });

  test("the set count is bounded", () => {
    assert.equal(generateSets(profileFor("pick-3"), { setCount: 999, allowRepeats: true }).sets.length, MAX_SETS);
    assert.equal(generateSets(profileFor("pick-3"), { setCount: 0, allowRepeats: true }).sets.length, 1);
  });

  test("eligible play types follow from the generated shape", () => {
    const triple = { byGroup: { main: [7, 7, 7] }, values: [7, 7, 7], orderings: 1, shape: "allSame" as const };
    assert.deepEqual(eligiblePlayTypes(PICK3_CURRENT_ERA, triple), ["Straight"]);
    const unique = { byGroup: { main: [1, 2, 3] }, values: [1, 2, 3], orderings: 6, shape: "allUnique" as const };
    const labels = eligiblePlayTypes(PICK3_CURRENT_ERA, unique);
    assert.ok(labels.includes("Box (6-way)"));
    assert.ok(!labels.includes("Box (3-way)"));
  });

  test("the boundary is stated and no prediction language appears", () => {
    const r = generateSets(profileFor("pick-3"), { setCount: 1, allowRepeats: true });
    assert.match(r.boundary, /same chance/);
    assert.ok(!/increase|better chance|likely/i.test(r.boundary));
  });

  test("Math.random is not used anywhere in the generator", () => {
    assert.ok(!/Math\.random/.test(codeOnly("lib/game/digitSetGenerator.ts")));
  });
});

/* ------------------------------------------------------------------ analysis */

describe("LRG-GAME-050: statistics describe a stated window in neutral language", () => {
  const history = () =>
    buildReviewHistory(true, "fl", [
      { gameId: 332, variantLabel: "Midday" },
      { gameId: 333, variantLabel: "Evening" },
    ], profileFor("pick-3"), FL_REVIEW_DATE);
  const allFilter: AnalysisFilter = { variant: "all", fromIso: null, toIso: null, includeCorrected: true };

  test("coverage always names the window, and filters visibly change it", () => {
    const rows = history();
    const all = coverageOf(filterDraws(rows, allFilter), allFilter);
    assert.ok(all.drawCount > 100);
    assert.match(all.statement, /All drawings · \d+ drawings from \d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}/);

    const eveningOnly: AnalysisFilter = { ...allFilter, variant: { gameId: 333 } };
    const ev = coverageOf(filterDraws(rows, eveningOnly), eveningOnly);
    assert.ok(ev.drawCount < all.drawCount, "filtering to one drawing must reduce the window");
    assert.match(ev.statement, /^Evening/);
  });

  test("position frequency covers every digit, including ones never drawn", () => {
    const rows = filterDraws(history(), allFilter);
    const pos = positionFrequency(rows, 3, 0, 9);
    assert.equal(pos.length, 3);
    for (const p of pos) {
      assert.equal(Object.keys(p.counts).length, 10);
      const total = Object.values(p.counts).reduce((a, b) => a + b, 0);
      assert.equal(total, rows.length, "every drawing contributes to exactly one digit per position");
    }
  });

  test("repeats are measured within a member game, never across two", () => {
    const rows = filterDraws(history(), allFilter);
    const rep = repeatFromPrevious(rows);
    assert.deepEqual(Object.keys(rep.byGameId).sort(), ["332", "333"]);
    for (const r of Object.values(rep.byGameId)) assert.ok(r.shared <= r.compared);
  });

  test("a historical gap is named as a gap, never as being due", () => {
    const gaps = historicalGaps(filterDraws(history(), allFilter), 0, 9);
    assert.equal(gaps.length, 10);
    assert.ok("drawsSinceLastSeen" in gaps[0]);
    assert.ok(!JSON.stringify(gaps).match(/overdue|due/i));
  });

  test("a number search states its window and is auditable", () => {
    const rows = filterDraws(history(), allFilter);
    const cov = coverageOf(rows, allFilter);
    const r = searchNumberHistory(rows, cov, { kind: "exact", digits: [3, 7, 8] });
    assert.ok(r.count >= 1, "the real 2026-07-09 Midday result must be findable");
    assert.equal(r.matches.length, r.count, "the claim must be backed by the matching rows");
    assert.match(r.statement, /selected period/);
  });

  test("EVERY emitted analysis statement passes the neutrality guard", () => {
    const rows = filterDraws(history(), allFilter);
    const cov = coverageOf(rows, allFilter);
    const strings = [
      cov.statement,
      ...drawInsights(rows, cov, 9).flatMap((i) => [i.statement, i.method]),
      ...positionFrequency(rows, 3, 0, 9).map((p) => p.positionLabel),
      ...[0, 1, 2, 3].map(
        (d) => searchNumberHistory(rows, cov, { kind: "digitAtPosition", digit: d, position: 0 }).statement,
      ),
      searchNumberHistory(rows, cov, { kind: "pair", a: 2, b: 4, where: "back" }).statement,
      ...variantComparison(rows).rows.map((r) => r.variantLabel + r.averageSumDisplay),
      ...pairFrequency(rows, "front").top.map((t) => t.pair),
    ];
    assertNeutralLanguage(strings);
  });

  test("the neutrality guard actually catches the forbidden framings", () => {
    for (const bad of ["Digit 7 is due to hit", "These are the hot numbers", "most likely next", "overdue digits"]) {
      assert.throws(() => assertNeutralLanguage([bad]), /BP-04B §22/, `"${bad}" must be rejected`);
    }
  });

  test("insight bands follow the era's range, not a hardcoded 9", () => {
    const ballRows = buildReviewHistory(true, "fl", [{ gameId: 582, variantLabel: "" }], profileFor("jackpot-triple-play"), FL_REVIEW_DATE);
    const f: AnalysisFilter = allFilter;
    const rows = filterDraws(ballRows, f);
    const sums = sumDistribution(rows, 6, 46);
    assert.ok(sums.buckets[sums.buckets.length - 1].to >= 200, "a 6-of-46 game reaches far beyond a digit sum");
  });

  test("shape distribution accounts for every drawing", () => {
    const rows = filterDraws(history(), allFilter);
    const s = shapeDistribution(rows);
    assert.equal(s.allDifferent + s.onePair + s.triple, rows.length);
  });
});

/* ------------------------------------------------------------------ the review fixture */

describe("LRG-GAME-050: the review fixture is guarded, provenanced and cannot leak", () => {
  const members = [{ gameId: 332, variantLabel: "Midday" }, { gameId: 333, variantLabel: "Evening" }];

  test("with the guard off there is no history at all", () => {
    assert.deepEqual(buildReviewHistory(false, "fl", members, profileFor("pick-3"), FL_REVIEW_DATE), []);
  });

  test("the newest row for EVERY member is real production data", () => {
    const rows = buildReviewHistory(true, "fl", members, profileFor("pick-3"), FL_REVIEW_DATE);
    for (const m of members) {
      const forMember = rows.filter((r) => r.gameId === m.gameId);
      const newest = forMember.reduce((a, b) => (a.drawDateIso >= b.drawDateIso ? a : b));
      assert.equal(newest.provenance, "productionFeed", `${m.variantLabel}'s newest row must be real`);
    }
  });

  test("no sample row is ever dated on or after a real one", () => {
    const rows = buildReviewHistory(true, "fl", members, profileFor("pick-3"), FL_REVIEW_DATE);
    for (const m of members) {
      const forMember = rows.filter((r) => r.gameId === m.gameId);
      const realDate = forMember.find((r) => r.provenance === "productionFeed")!.drawDateIso;
      for (const r of forMember.filter((x) => x.provenance === "internalSample")) {
        assert.ok(r.drawDateIso < realDate, `sample row ${r.drawDateIso} must predate the real ${realDate}`);
      }
    }
  });

  test("every record is typed, so a component cannot render a sample unknowingly", () => {
    for (const r of buildReviewHistory(true, "fl", members, profileFor("pick-3"), FL_REVIEW_DATE)) {
      assert.ok(r.provenance === "productionFeed" || r.provenance === "internalSample");
    }
  });

  test("the fixture is deterministic, so two builds are byte-identical", () => {
    assert.deepEqual(buildReviewHistory(true, "fl", members, profileFor("pick-3"), FL_REVIEW_DATE), buildReviewHistory(true, "fl", members, profileFor("pick-3"), FL_REVIEW_DATE));
  });

  test("a ball game's sample rows are valid — distinct values, in range", () => {
    const rows = buildReviewHistory(true, "fl", [{ gameId: 582, variantLabel: "" }], profileFor("jackpot-triple-play"), FL_REVIEW_DATE);
    for (const r of rows.filter((x) => x.provenance === "internalSample")) {
      assert.equal(new Set(r.digits).size, 6, `impossible sample draw ${r.digits.join("-")}`);
      for (const v of r.digits) assert.ok(v >= 1 && v <= 46);
      assert.equal(r.fireball, null);
    }
  });

  test("no fabricated winner, author, reply count or publication date exists anywhere", () => {
    /*
     * Checked as JSON KEYS, not as substrings. The Pick 3 cold-start copy legitimately reads "Questions and
     * replies are player conversation, not lottery advice" — prose about replies is not a reply count. What
     * must not exist is a FIELD carrying one.
     */
    const BANNED_KEYS = ["publishedDate", "publishedAt", "date", "author", "byline", "href", "url",
      "replies", "views", "likes", "upvotes", "avatar", "postedBy"];
    const walk = (node: unknown, path: string) => {
      if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          /* `sources` is a citation list: a real external document with a real URL and a read date. Banning
             `url` there would forbid citing the operator's own rules, which is the opposite of the intent. */
          if (k === "sources") continue;
          assert.ok(!BANNED_KEYS.includes(k), `config/games/fl-pick-3.json${path} must not carry the key "${k}"`);
          walk(v, `${path}.${k}`);
        }
      }
    };
    /* Scoped to the two fabrication-prone collections. `destinations` legitimately carries `href`, because an
       internal LotteryCorner route is not a fabricated article link. */
    const cfg = JSON.parse(src("config/games/fl-pick-3.json"));
    walk(cfg.editorial, "editorial");
    walk(cfg.community, "community");

    /* And the fixture module declares no such field on its record types. */
    const fx = codeOnly("lib/game/gameReviewFixture.ts");
    for (const banned of ["publishedDate:", "author:", "replies:", "views:", "likes:", "upvotes:"]) {
      assert.ok(!fx.includes(banned), `the fixture must not declare ${banned}`);
    }
  });
});

/* ------------------------------------------------------------------ honest absence */

describe("LRG-GAME-050: absence is stated, never approximated or faked", () => {
  test("a game without a verified matrix suppresses it with a recorded reason", () => {
    for (const slug of ["cash-pop", "jackpot-triple-play"]) {
      const { m2 } = m2model(slug);
      assert.equal(m2.matrix?.base.length, 0);
      assert.ok((m2.matrix?.suppressedReason ?? "").length > 20, `${slug} must record why`);
    }
    const { m2 } = m2model("pick-3");
    assert.equal(m2.matrix?.suppressedReason, null);
    assert.equal(m2.matrix?.base.length, 9);
    assert.equal(m2.matrix?.addOns.length, 1);
  });

  test("the checker tool is not drawn when it cannot price a comparison", () => {
    /* The defect this test exists for: Cash Pop rendered an empty play-type dropdown above a live submit. */
    assert.equal(m2model("pick-3").m2.checkerUsable, true);
    assert.equal(m2model("cash-pop").m2.checkerUsable, false);
    assert.equal(m2model("jackpot-triple-play").m2.checkerUsable, false);
    /* JG-03 still EXISTS on every JG-M2 page — it explains itself rather than vanishing. */
    for (const slug of ["pick-3", "cash-pop", "jackpot-triple-play"]) {
      assert.equal(m2model(slug).model.sectionState["JG-03"].render, true);
    }
  });

  test("a top-prize alert is offered only where the prize can actually move", () => {
    const has = (slug: string) => m2model(slug).m2.alerts.some((a) => a.key === "top-prize");
    assert.equal(has("pick-3"), false, "a fixed prize cannot move");
    assert.equal(has("cash-pop"), false, "a stake-dependent prize cannot move");
    assert.equal(has("jackpot-triple-play"), true);
  });

  test("every alert option is honourable by the account service, and declares its frequency", () => {
    /*
     * UPDATED DELIBERATELY under Conflict 37 (source-conflicts.md, 2026-08-11). This test used to pin
     * `available: false` because no account service existed. The review-mode account layer now records
     * follows, saves and notification preferences for real, so `available` is true — and `FD-ACC-18`
     * requires each option to carry its own frequency, shown before it is chosen. What availability still
     * does NOT mean is DELIVERY: no channel exists (`FD-ACC-11`), and JG-17's copy says so.
     */
    for (const slug of ["pick-3", "cash-pop", "jackpot-triple-play"]) {
      for (const a of m2model(slug).m2.alerts) {
        assert.equal(a.available, true, `${slug}/${a.key} is recordable on the account`);
        assert.ok((a.frequency ?? "").length > 0, `${slug}/${a.key} must declare its frequency (FD-ACC-18)`);
      }
    }
  });

  test("an unverified local fact is absent, not rendered as a warning", () => {
    const { m2 } = m2model("pick-3");
    const keys = m2.offeringFacts.map((f) => f.key);
    /* Ticket price and Advance Play are present BECAUSE they were verified from the rule. */
    assert.ok(keys.includes("ticketPrice"));
    assert.ok(keys.includes("advancePlay"));
    assert.equal(m2.offeringFacts.find((f) => f.key === "ticketPrice")?.source, "operatorRule");
    /* Nothing is labelled unverified or under review in reader-facing content. */
    for (const f of m2.offeringFacts) {
      assert.ok(!/unverified|under review|unavailable/i.test(f.value), `${f.key} leaks a review label`);
    }
  });

  test("verified claim facts publish, and unverified ones carry no value", () => {
    const { model } = m2model("pick-3");
    /* The claim tiers are the operator's own, so the count is asserted as data rather than from memory. */
    assert.ok(model.claimTiers.length >= 3, "Florida publishes at least three claim routes");
    for (const t of model.claimTiers) {
      assert.ok(t.range.length > 0 && t.where.length > 0);
      assert.ok(!/unverified|under review/i.test(t.where));
    }
    assert.ok(model.claimDeadline.publish);
    assert.match(model.claimDeadline.value!, /180 days/);
    /* Tax treatment and winner publicity are recorded unavailable, so no gated value may exist for them. */
    const { m2 } = m2model("pick-3");
    assert.ok(!m2.offeringFacts.some((f) => /tax|publicity|anonym/i.test(f.label)));
  });
});

/* ------------------------------------------------------------------ trust policy */

describe("LRG-GAME-050: the trust policy is a structure, not a review note", () => {
  test("exactly one compact source line is produced by the model", () => {
    const { m2 } = m2model("pick-3");
    /* §A7: one shared "Last updated" shape across all five families. */
    assert.match(m2.sourceLine, /^Last updated .+ · Florida Lottery results feed$/);
  });

  test("the source-provenance quotes are not shipped to the client", () => {
    /* They are long verbatim rule extracts, including the passage recording that 1-OFF ended. */
    const { m2 } = m2model("pick-3");
    for (const s of m2.era!.sources) assert.equal(s.supports, "");
    for (const a of m2.era!.addOns) for (const s of a.sources) assert.equal(s.supports, "");
    /* But JG-18 can still cite them properly. */
    assert.ok(m2.sourceRefs.length >= 2);
    for (const r of m2.sourceRefs) {
      assert.ok(r.url.length > 0 && r.accessed.length > 0);
    }
    assert.ok(m2.sourceRefs.some((r) => r.ruleNumber === "53ER24-56"));
  });

  test("the composition repeats no official-source warning", () => {
    const code = src("components/game/preview/sections/GameM2Bands.tsx");
    const body = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
    for (const banned of [/official (site|website)/i, /verify (with|against)/i, /check the official/i]) {
      assert.ok(!banned.test(body), `the composition must not tell the reader to check the official site (${banned})`);
    }
  });

  test("the internal-preview identification is stated once, from the model", () => {
    const { m2 } = m2model("pick-3");
    assert.match(m2.reviewBanner, /Internal preview/);
    /* And no section repeats a per-row staleness notice. */
    const body = src("components/game/preview/sections/GameM2Bands.tsx");
    assert.ok(!/lcg-stale/.test(body));
  });
});

/* ------------------------------------------------------------------ no per-game branching */

describe("LRG-GAME-050: generic code names no jurisdiction, game or member id", () => {
  const GENERIC = [
    "lib/game/gamePreviewModel.ts",
    "lib/game/gameM2Model.ts",
    "lib/game/gameViewConfig.ts",
    "lib/game/gameRuleContract.ts",
    "lib/game/digitTicketCheck.ts",
    "lib/game/digitSetGenerator.ts",
    "lib/game/digitHistoryAnalysis.ts",
    "components/game/preview/sections/GameM2Bands.tsx",
    "components/game/preview/tools/GameChecker.tsx",
    "components/game/preview/tools/GameGenerator.tsx",
    "components/game/preview/tools/GameWorkspace.tsx",
    "components/game/preview/tools/GameSaveControls.tsx",
  ];

  test("no generic module compares a state code, a game slug or a member id", () => {
    for (const f of GENERIC) {
      const code = codeOnly(f);
      assert.ok(!/=== *"fl"/.test(code), `${f} must not branch on a state code`);
      for (const slug of ["pick-3", "cash-pop", "jackpot-triple-play", "powerball"]) {
        assert.ok(!new RegExp(`=== *"${slug}"`).test(code), `${f} must not branch on the ${slug} slug`);
      }
      for (const id of [332, 333, 614, 618, 582, 1012]) {
        assert.ok(!new RegExp(`\\b${id}\\b`).test(code), `${f} must not hardcode game id ${id}`);
      }
      assert.ok(!/\bFIREBALL\b/.test(code.replace(/"[^"]*"/g, "")),
        `${f} must not hardcode an add-on name outside a string`);
    }
  });

  test("the eighteen sections are drawn by one component, not one per game", () => {
    const body = src("components/game/preview/sections/GameM2Bands.tsx");
    for (let i = 1; i <= 18; i++) {
      const id = `JG-${String(i).padStart(2, "0")}`;
      assert.ok(body.includes(`case "${id}"`), `${id} must be handled in the shared composition`);
    }
  });

  test("only the registry, the rule data and the configuration name Florida games", () => {
    assert.match(codeOnly("lib/game/gameRegistry.ts"), /gameSlug: "pick-3"/);
    assert.equal(JSON.parse(src("config/games/fl-pick-3.json")).game.gameId, 332);
  });
});

/* ------------------------------------------------------------------ configuration contract */

describe("LRG-GAME-050: the JG-M2 configuration contract is enforced at load", () => {
  const pick3 = () => JSON.parse(src("config/games/fl-pick-3.json"));

  test("a JG-M2 configuration missing its editorial scaffolding fails loudly", () => {
    for (const field of ["navigation", "methods", "guides", "methodology", "aiPrompts"]) {
      const bad = pick3();
      delete bad[field];
      assert.throws(() => validateGameViewConfig(bad, "test"), new RegExp(field), `${field} must be required`);
    }
  });

  test("a play method must state what it does not guarantee", () => {
    const bad = pick3();
    delete bad.methods[0].limitation;
    assert.throws(() => validateGameViewConfig(bad, "test"), /does not guarantee/);
  });

  test("an editorial item cannot carry a date, author or destination", () => {
    for (const banned of ["publishedDate", "author", "href"]) {
      const bad = pick3();
      bad.editorial[0][banned] = "anything";
      assert.throws(() => validateGameViewConfig(bad, "test"), /must not carry/, `${banned} must be rejected`);
    }
  });

  test("navigation is compact and internally consistent", () => {
    const cfg = gameConfigFor("fl", "pick-3")!;
    assert.ok(cfg.navigation!.length >= 6 && cfg.navigation!.length <= 10,
      "eighteen sections must not become eighteen pills");
    for (const n of cfg.navigation!) assert.match(n.fragment, /^#/);
    assert.equal(new Set(cfg.navigation!.map((n) => n.fragment)).size, cfg.navigation!.length);
  });

  test("configuration still cannot carry runtime result data or prediction language", () => {
    const bad = pick3();
    bad.copy.winningNumbers = "3-7-8";
    assert.throws(() => validateGameViewConfig(bad, "test"), /runtime result data/);
    const bad2 = pick3();
    bad2.copy.jg10Intro = "These numbers increase your chances of winning.";
    assert.throws(() => validateGameViewConfig(bad2, "test"), /prediction or urgency/);
  });

  test("the JG-M1 configuration remains valid and unaffected", () => {
    const pb = gameConfigFor("fl", "powerball");
    assert.ok(pb);
    assert.equal(pb!.game.mode, "JG-M1");
    assert.equal(pb!.navigation, undefined, "a JG-M1 page has no eighteen-section navigation");
  });
});

/* ------------------------------------------------------------------ JG-M1 non-regression */

describe("LRG-GAME-050: the JG-M1 page is unchanged by this task", () => {
  test("/fl/powerball keeps its mode, order and section outcome", () => {
    const m = buildGamePreviewModel("fl", "powerball", true, { now: new Date("2026-08-02T12:00:00Z") });
    assert.ok(m);
    assert.equal(m!.entry.mode, "JG-M1");
    assert.equal(m!.m2, undefined, "a JG-M1 model must carry no JG-M2 branch");
    assert.deepEqual([...m!.order], [...JG_M1_ORDER]);
    const visible = JG_M1_ORDER.filter((id) => m!.sectionState[id]?.render !== false && id !== "Footer");
    assert.deepEqual([...visible], ["JO-01", "JO-02", "JO-03", "JO-04", "JO-05", "JO-08"]);
  });

  test("no JG-M2 section id can appear on a JG-M1 page", () => {
    const m = buildGamePreviewModel("fl", "powerball", true)!;
    for (const id of JG_M2_ORDER) {
      if (id === "Footer") continue;
      assert.ok(!m.order.includes(id), `${id} must not appear in the JG-M1 order`);
    }
  });
});

/* ------------------------------------------------------------------ LRG-GAME-051 revision */



describe("LRG-GAME-051: editorial sections replace the tab interface", () => {
  test("the tab component is gone and no tablist is rendered", () => {
    assert.throws(
      () => readFileSync(new URL("../components/game/preview/tools/GameContentTabs.tsx", import.meta.url), "utf8"),
      /ENOENT/,
    );
    assert.ok(!/role="tablist"/.test(src("components/game/preview/sections/GameM2Bands.tsx")));
  });

  test("three separate categories, each with articles and no empty section", () => {
    const { m2 } = m2model("pick-3");
    assert.deepEqual(m2.editorial.map((s) => s.kind), ["Guides", "News", "Blogs"]);
    for (const sec of m2.editorial) {
      assert.ok(sec.items.length >= 2 && sec.items.length <= 3, `${sec.kind} shows 2-3 items`);
      assert.ok(sec.heading.length > 0);
    }
  });

  test("Winners is absent entirely rather than empty", () => {
    const cfg = gameConfigFor("fl", "pick-3")!;
    assert.ok(!(cfg.editorial ?? []).some((e) => (e.kind as string) === "Winners"));
    const bad = JSON.parse(src("config/games/fl-pick-3.json"));
    bad.editorial[0].kind = "Winners";
    assert.throws(() => validateGameViewConfig(bad, "test"), /Winners/);
  });

  test("every article link resolves to a declared route", () => {
    const cfg = gameConfigFor("fl", "pick-3")!;
    const routes = articleRoutes(cfg);
    assert.equal(routes.length, (cfg.editorial ?? []).length);
    for (const r of routes) {
      assert.match(r.href, /^\/fl\/pick-3\/(guides|news|blog)\/[a-z0-9-]+$/);
      assert.ok(findArticle(cfg, r.segment, r.slug), `${r.href} must resolve back to an article`);
    }
    /* And an undeclared pair does not resolve, so the route 404s rather than rendering a shell. */
    assert.equal(findArticle(cfg, "guides", "not-a-real-article"), undefined);
    assert.equal(findArticle(cfg, "not-a-section", "straight-box-and-combo-explained"), undefined);
  });

  test("every article has a body, and a dated claim cites a source", () => {
    for (const e of gameConfigFor("fl", "pick-3")!.editorial ?? []) {
      assert.ok(e.body.length >= 3, `${e.slug} needs real content`);
      if (e.effectiveDate) {
        assert.ok((e.sources ?? []).length > 0, `${e.slug} states an effective date and must cite it`);
      }
    }
  });

  test("no article carries a byline or an invented publication date", () => {
    const bad = () => JSON.parse(src("config/games/fl-pick-3.json"));
    for (const banned of ["author", "publishedDate", "href"]) {
      const cfg = bad();
      cfg.editorial[0][banned] = "x";
      assert.throws(() => validateGameViewConfig(cfg, "test"), /must not carry/, `${banned} must be rejected`);
    }
    /* The date label states what the date IS, never "published". */
    const dated = (gameConfigFor("fl", "pick-3")!.editorial ?? []).filter((e) => e.effectiveDate)[0];
    assert.equal(articleDateLine(dated)?.label, "Effective");
  });
});

describe("LRG-GAME-051: page weight and honest membership", () => {
  test("the statistics preview is compact — three or four figures", () => {
    const { m2 } = m2model("pick-3");
    assert.ok(m2.statsPreview.length >= 3 && m2.statsPreview.length <= 4);
    for (const m of m2.statsPreview) {
      assert.ok(m.label.length > 0 && m.value.length > 0 && m.note.length > 0);
    }
    assertNeutralLanguage(m2.statsPreview.flatMap((m) => [m.label, m.note]));
  });

  test("the insight cards are consolidated into one what-changed summary", () => {
    const { m2 } = m2model("pick-3");
    assert.ok(m2.whatChanged, "a summary must exist");
    assert.match(m2.whatChanged!.summary, /drawings from/);
    assert.ok(m2.whatChanged!.points.length >= 2 && m2.whatChanged!.points.length <= 5);
    assertNeutralLanguage([m2.whatChanged!.summary, ...m2.whatChanged!.points]);
    /* The composition must no longer render a card per insight. */
    assert.ok(!/lcg-insightlist/.test(src("components/game/preview/sections/GameM2Bands.tsx")));
  });

  test("no device-local save language or storage access remains", () => {
    const code = codeOnly("components/game/preview/tools/GameSaveControls.tsx");
    assert.ok(!/localStorage/.test(code), "storage access must be gone, not merely relabelled");
    assert.ok(!/this device|on this device/i.test(code));
    const cfg = gameConfigFor("fl", "pick-3")!;
    assert.ok(!/this device/i.test(cfg.copy.jg17SignedOut));
    assert.match(cfg.copy.jg17SignedOut, /account/i);
  });

  test("member actions execute through the account seam, and the gate is the shared affordance", () => {
    /*
     * UPDATED DELIBERATELY under Conflict 37 (source-conflicts.md, 2026-08-11). The previous assertions —
     * `available: false`, a `data-missing-dependency` panel, and the `authAvailable ? (` branch that
     * suppressed any login link — described a build with NO sign-in flow. The Tier-1 founder authorization
     * shipped the real shared flow, so JG-17 now: reads the session from the ONE account seam, executes
     * signed-in actions against the review store, and gates signed-out actions behind the shared
     * `SignInToUse` affordance (`FD-DAT-04`) which captures an `FD-ACC-12` intent.
     */
    const code = src("components/game/preview/tools/GameSaveControls.tsx");
    assert.match(code, /useAccountSession/);
    assert.match(code, /SignInToUse/);
    /* No hand-rolled login href, and no ?next= return path in a URL — only the intent nonce crosses. */
    assert.doesNotMatch(code, /href=\{?["'`]\/(login|signin|sign-in|register)/);
    assert.doesNotMatch(code, /\?next=/);
    /* Success copy exists only on the signed-in branch, where the store made it true. */
    assert.match(code, /is on for your account/);
    /* And delivery is still never claimed (`FD-ACC-11`). */
    assert.match(code, /No messages are sent yet/);
  });

  test("the JG-M2 canvas is the State width, and JG-M1 keeps its own", () => {
    const css = src("app/globals.css");
    /* Scoped by attribute, because `/fl/powerball` is JG-M1 and must not be redesigned by this task. */
    assert.match(css, /\[data-blueprint-mode="JG-M2"\] \.lcg-container \{ max-width: 1380px; \}/);
    assert.match(css, /\.lcg-container \{ max-width: 900px; \}/, "the JG-M1 desktop column is untouched");
    /* Wide canvas, narrow prose. */
    assert.match(css, /\.lcg-prose \{ max-width: var\(--layout-measure\)/);
    assert.match(css, /\[data-blueprint-mode="JG-M2"\] \.lcg-purpose/);
  });

  test("provenance is disclosed once per table, not once per row", () => {
    const ws = src("components/game/preview/tools/GameWorkspace.tsx");
    assert.match(ws, /data-sample-disclosure="true"/);
    assert.ok(!/lcg-tag--sample/.test(ws), "per-row sample badges must be gone");
  });

  test("the duplicated sources paragraph is removed from JG-18", () => {
    /* `codeOnly`, not `src`: the comments explaining the removal legitimately name what was removed. */
    const bands = codeOnly("components/game/preview/sections/GameM2Bands.tsx");
    /* `jg18Primary` said the same thing as `trust.summary`, and `m2.sourceLine` repeated JG-01's line. */
    assert.ok(!/copy\.jg18Primary/.test(bands));
    assert.equal((bands.match(/m2\.sourceLine/g) ?? []).length, 1, "the source line appears once, in JG-01");
  });
});

describe("LRG-GAME-051: the Pick 3 identity uses a verified state-scoped logo", () => {
  test("the configured identity resolves to a registered asset", () => {
    const cfg = gameConfigFor("fl", "pick-3")!;
    assert.equal(cfg.game.visualIdentity, "fl-pick-3");
    const logo = gameLogo(cfg.game.visualIdentity!);
    assert.ok(logo, "a verified asset must be registered");
    assert.equal(logo!.src, "/game-logos/fl-pick-3.webp");
    assert.equal(logo!.width, 140);
    assert.equal(logo!.height, 77);
  });

  test("the identity token is state-scoped, so no other state inherits Florida's mark", () => {
    /* The legacy library holds a DIFFERENT Pick 3 mark for ~30 jurisdictions. A bare slug would mis-attribute. */
    assert.equal(gameLogo("pick-3"), null);
    assert.equal(gameLogo("cash-pop"), null);
    assert.equal(gameLogo("jackpot-triple-play"), null);
  });

  test("one identity for the family — no per-variant marks", () => {
    const { m2 } = m2model("pick-3");
    assert.equal(m2.members.length, 2);
    const bands = src("components/game/preview/sections/GameM2Bands.tsx");
    /* The logo is rendered in the page head, not inside the member-row loop. */
    const rowBlock = bands.slice(bands.indexOf("lcg-memberrows"), bands.indexOf("lcg-source"));
    assert.ok(!/gameLogo|lcg-logo/.test(rowBlock), "a member row must not carry its own mark");
  });

  test("provenance and the trademark question are both recorded", () => {
    const manifest = JSON.parse(src("lib/preview/game-logo-manifest.json"));
    const entry = manifest.logos.find((l: { gameId: string }) => l.gameId === "fl-pick-3");
    assert.ok(entry, "the asset must be recorded in the manifest");
    assert.equal(entry.verificationStatus, "VERIFIED");
    assert.match(entry.verificationEvidence, /PLUS FIREBALL/);
    /* The Maine mis-attribution that a filename search would have produced is recorded as a warning. */
    assert.match(entry.disambiguation, /MAINE/i);
    assert.match(manifest._meta.OPEN_ITEM_FOR_FOUNDER, /FLORIDA PICK 3/);
  });
});

/* ==============================================================================================
   LRG-GAME-052 — GENERIC, FORMAT-DRIVEN GAME PAGE. ACCEPTANCE SET.
   ============================================================================================== */

/*
 * Every configured pair as a `[stateCode, gameSlug]` tuple.
 *
 * `configuredGamePairs()` returns strings like `"fl/pick-3"`. Destructuring one of those with
 * `for (const [st, slug] of ...)` splits the STRING into its first two characters — `"f"`, `"l"` — so every
 * assertion inside the loop silently addressed a nonexistent game and the test passed by doing nothing. Four
 * LRG-GAME-053 tests were written that way and caught here.
 */
const ALL_PAIRS: readonly (readonly [string, string])[] = configuredGamePairs().map((p) => {
  const [st, slug] = p.split("/");
  return [st, slug] as const;
});

const profileFor = (slug: string, state = "fl") => {
  const m = buildGamePreviewModel(state, slug, true);
  assert.ok(m?.m2?.profile, `${state}/${slug} must resolve a format profile`);
  return m!.m2!.profile!;
};
const historyFor = (slug: string, state = "fl") => {
  const m = buildGamePreviewModel(state, slug, true);
  return m!.m2!.history;
};
const doSearch = (slug: string, raw: Record<string, string[]>, over: Partial<SearchInput> = {}, state = "fl") =>
  searchHistory(historyFor(slug, state), profileFor(slug, state), {
    raw, window: 100, variant: "all", orderMode: "exact", includeAddOn: false, ...over,
  });

describe("LRG-GAME-052: the format profile is the single source of shape", () => {
  test("every representative page classifies from its format, not its name", () => {
    const expected: Record<string, string> = {
      "fl/pick-2": "digits", "fl/pick-3": "digits", "fl/pick-4": "digits", "fl/pick-5": "digits",
      "ca/daily-3": "digits", "fl/cash-pop": "single",
      "fl/fantasy-5": "unordered", "fl/lotto": "unordered", "fl/jackpot-triple-play": "unordered",
      "ca/superlotto-plus": "multiGroup",
    };
    for (const [pair, kind] of Object.entries(expected)) {
      const [st, slug] = pair.split("/");
      assert.equal(profileFor(slug, st).searchKind, kind, `${pair} must classify as ${kind}`);
    }
  });

  test("a drawn add-on does not turn a digit game into a multi-group game", () => {
    /* FIREBALL is a property of the drawing, not a group the player picks. Counting it as one made every Pick
       game classify as multiGroup and disabled the Pick 3 checker. */
    const p = profileFor("pick-3");
    assert.equal(p.searchKind, "digits");
    assert.equal(p.addOnLabel, "Fireball");
    assert.equal(p.extraGroups.filter((g) => g.role === "addOn").length, 1);
  });

  test("position counts are DERIVED, never configured per game", () => {
    assert.equal(profileFor("pick-2").main!.count, 2);
    assert.equal(profileFor("pick-3").main!.count, 3);
    assert.equal(profileFor("pick-4").main!.count, 4);
    assert.equal(profileFor("pick-5").main!.count, 5);
    /* And no game configuration declares a count, range or value type — those are format facts. */
    for (const slug of ["pick-2", "pick-3", "pick-4", "pick-5", "cash-pop", "fantasy-5", "lotto"]) {
      const raw = JSON.parse(src(`config/games/fl-${slug}.json`));
      const flat = JSON.stringify(raw);
      for (const banned of ["selectionCount", "selectionMin", "selectionMax", "selectionKind", "repeatsAllowed"]) {
        assert.ok(!flat.includes(banned), `fl-${slug}.json must not declare ${banned}`);
      }
    }
  });

  test("the rule era no longer declares a competing shape", () => {
    const code = codeOnly("lib/game/gameRuleContract.ts");
    for (const gone of ["selectionKind", "selectionCount:", "selectionMin", "selectionMax", "repeatsAllowed:"]) {
      assert.ok(!code.includes(gone), `GameRuleEra must not carry ${gone}`);
    }
    assert.ok(!codeOnly("lib/game/floridaGameRules.ts").includes("selectionCount"));
  });

  test("matching semantics are declared on every format, in every jurisdiction", () => {
    const all = [FLORIDA_FORMAT_VERSIONS, MI_FORMAT_VERSIONS, VA_FORMAT_VERSIONS, CA_FORMAT_VERSIONS, MD_FORMAT_VERSIONS];
    let checked = 0;
    for (const set of all) {
      for (const v of set) {
        checked++;
        assert.deepEqual(undeclaredSemantics(v), [], `${v.gameKey} has undeclared matching semantics`);
      }
    }
    assert.ok(checked >= 30, `expected the full registry, saw ${checked}`);
  });

  test("ordered and unordered are declared from rules, not read off stored order", () => {
    /* A ball game's feed order is ascending, which looks positional. The declaration is what keeps them apart. */
    assert.equal(profileFor("pick-3").main!.semantics.matchOrdered, true);
    assert.equal(profileFor("pick-3").main!.semantics.repeatsAllowed, true);
    assert.equal(profileFor("lotto").main!.semantics.matchOrdered, false);
    assert.equal(profileFor("lotto").main!.semantics.repeatsAllowed, false);
    for (const g of [profileFor("pick-3").main!, profileFor("lotto").main!]) {
      assert.equal(g.semantics.matchOrderedSource, "declared");
      assert.equal(g.semantics.repeatsAllowedSource, "declared");
    }
  });
});

describe("LRG-GAME-052: acceptance — the search works for every format", () => {
  test("Pick 3 searches 007 without losing the zeros", () => {
    const r = doSearch("pick-3", { main: ["007"] });
    assert.deepEqual(r.selectionByGroup!.main, [0, 0, 7]);
    assert.match(r.statement, /^007 /);
    /* And it is a different search from 700. */
    assert.deepEqual(doSearch("pick-3", { main: ["700"] }).selectionByGroup!.main, [7, 0, 0]);
    /* An incomplete number is refused rather than coerced. */
    const short = doSearch("pick-3", { main: ["07"] });
    assert.equal(short.selectionByGroup, null);
    assert.match(short.errors.main, /all 3 digits/i);
  });

  test("Pick 4 and Pick 5 derive their position counts automatically", () => {
    assert.deepEqual(doSearch("pick-4", { main: ["0071"] }).selectionByGroup!.main, [0, 0, 7, 1]);
    assert.deepEqual(doSearch("pick-5", { main: ["00715"] }).selectionByGroup!.main, [0, 0, 7, 1, 5]);
    /* Three digits is incomplete for Pick 4 — the count came from the format, not from a per-game setting. */
    assert.match(doSearch("pick-4", { main: ["007"] }).errors.main, /all 4 digits/i);
    assert.match(doSearch("pick-5", { main: ["0071"] }).errors.main, /all 5 digits/i);
    assert.deepEqual(doSearch("pick-2", { main: ["07"] }).selectionByGroup!.main, [0, 7]);
  });

  test("Cash Pop accepts and searches 15", () => {
    /* The old digit-only search could not express this: 15 would have read as a 1 and a 5. */
    const p = profileFor("cash-pop");
    assert.equal(p.searchKind, "single");
    assert.equal(p.main!.count, 1);
    assert.equal(p.main!.max, 15);
    const r = doSearch("cash-pop", { main: ["15"] });
    assert.deepEqual(r.selectionByGroup!.main, [15]);
    assert.equal(r.errors.main, undefined);
    /* Out of range is refused. */
    assert.match(doSearch("cash-pop", { main: ["16"] }).errors.main, /between 1 and 15/);
    /* And no order vocabulary appears for a single value. */
    assert.equal(p.ordered, false);
    assert.ok(!/exact order|any order/i.test(r.statement));
  });

  test("Fantasy 5 accepts five unique values and ignores order", () => {
    const p = profileFor("fantasy-5");
    assert.equal(p.searchKind, "unordered");
    assert.equal(p.main!.count, 5);
    const asTyped = doSearch("fantasy-5", { main: ["11", "23", "25", "28", "36"] });
    const shuffled = doSearch("fantasy-5", { main: ["36", "11", "28", "23", "25"] });
    assert.deepEqual(asTyped.selectionByGroup!.main, [11, 23, 25, 28, 36]);
    /* Order changes nothing about the outcome — the comparison is on the set. */
    assert.equal(asTyped.totalMatches, shuffled.totalMatches);
    /* Duplicates are rejected, because the game cannot draw one. */
    assert.match(doSearch("fantasy-5", { main: ["11", "11", "25", "28", "36"] }).errors.main, /different/i);
    /* No Exact/Any vocabulary anywhere. */
    assert.equal(p.ordered, false);
    for (const row of asTyped.rows) assert.equal(row.matchedAs, null);
  });

  test("a special-ball game compares main and special groups independently", () => {
    const p = profileFor("superlotto-plus", "ca");
    assert.equal(p.searchKind, "multiGroup");
    assert.equal(p.main!.count, 5);
    assert.equal(p.main!.max, 47);
    const mega = p.extraGroups.find((g) => g.label === "Mega Ball")!;
    assert.equal(mega.count, 1);
    assert.equal(mega.max, 27);
    /* Independent pool: the Mega number may repeat one of the five. */
    assert.equal(mega.differentSet, true);

    /* The real 2026-07-08 drawing was 18-22-28-33-38 with Mega Ball 15. */
    const r = searchHistory(
      historyFor("superlotto-plus", "ca"),
      p,
      { raw: { main: ["18", "22", "28", "33", "38"], "mega-ball": ["15"] }, window: "all", variant: "all", orderMode: "exact", includeAddOn: false },
    );
    const hit = r.rows.find((x) => x.drawDateIso === "2026-07-08");
    assert.ok(hit, "the real drawing must be found");
    const main = hit!.matches.find((m) => m.key === "main")!;
    const special = hit!.matches.find((m) => m.key === "mega-ball")!;
    assert.equal(main.matched, 5);
    assert.equal(main.of, 5);
    assert.equal(special.matched, 1);
    assert.equal(special.of, 1);
    /* The counts are reported SEPARATELY — a special ball is never folded into the main total. */
    assert.notEqual(main.of + special.of, main.of);
    assert.match(hit!.description, /Mega Ball/);
  });

  test("a special group is validated against its own range, not the main group's", () => {
    const p = profileFor("superlotto-plus", "ca");
    /* 40 is a legal main number (1-47) and an illegal Mega number (1-27). */
    const r = searchHistory(historyFor("superlotto-plus", "ca"), p, {
      raw: { main: ["18", "22", "28", "33", "40"], "mega-ball": ["40"] },
      window: 25, variant: "all", orderMode: "exact", includeAddOn: false,
    });
    assert.equal(r.errors.main, undefined, "40 is in range for the main group");
    assert.match(r.errors["mega-ball"], /between 1 and 27/);
  });

  test("the window is a draw count and applies after the variant filter", () => {
    for (const w of [10, 25, 50] as const) {
      assert.equal(doSearch("pick-3", { main: ["378"] }, { window: w }).searchedCount, w);
    }
    const all = doSearch("pick-3", { main: ["378"] }, { window: "all" });
    assert.ok(all.searchedCount > 100);
    /* "Last 25 Evening drawings" must be 25 Evening drawings. */
    const evening = doSearch("pick-3", { main: ["378"] }, { window: 25, variant: { gameId: 333 } });
    assert.equal(evening.searchedCount, 25);
  });

  test("Exact and Any order behave correctly, and only where order applies", () => {
    const exact = doSearch("pick-3", { main: ["378"] }, { variant: { gameId: 332 }, orderMode: "exact" });
    assert.ok(exact.totalMatches >= 1);
    assert.equal(exact.rows[0].matchedAs, "exact");

    const permExact = doSearch("pick-3", { main: ["873"] }, { variant: { gameId: 332 }, orderMode: "exact" });
    const permAny = doSearch("pick-3", { main: ["873"] }, { variant: { gameId: 332 }, orderMode: "any" });
    assert.ok(permAny.totalMatches > permExact.totalMatches, "any-order must find the permutation");
    assert.equal(permAny.rows.find((r) => r.drawDateIso === "2026-07-09")?.matchedAs, "any");
    assert.match(permAny.statement, /in any order/);
    /* An unordered game never produces the vocabulary. */
    assert.ok(!/exact order|any order/i.test(doSearch("lotto", { main: ["1", "2", "3", "4", "5", "6"] }).statement));
  });

  test("supplied result order is preserved in the search output", () => {
    /* Pick 3 Midday drew 3-7-8. Echoed back in that order, never sorted. */
    const r = doSearch("pick-3", { main: ["378"] }, { variant: { gameId: 332 } });
    const row = r.rows.find((x) => x.drawDateIso === "2026-07-09")!;
    assert.deepEqual([...row.drawnByGroup.main], [3, 7, 8]);
    /* And the engine contains no sort of a drawn value. */
    const code = codeOnly("lib/game/gameHistorySearch.ts");
    assert.ok(!/drawn[A-Za-z]*\.sort|\.digits\.sort/.test(code), "the search must never sort a drawn value");
  });

  test("errors are specific: range, duplicate and incomplete input", () => {
    assert.match(doSearch("pick-3", { main: ["12a"] }).errors.main, /digits only/i);
    assert.match(doSearch("pick-3", { main: ["12"] }).errors.main, /all 3 digits/i);
    assert.match(doSearch("cash-pop", { main: ["99"] }).errors.main, /between 1 and 15/);
    assert.match(doSearch("lotto", { main: ["5", "5", "6", "7", "8", "9"] }).errors.main, /different/i);
    assert.match(doSearch("lotto", { main: ["5", "", "6", "7", "8", "9"] }).errors.main, /all 6 numbers/i);
  });

  test("every search statement stays neutral", () => {
    const statements = [
      doSearch("pick-3", { main: ["378"] }).statement,
      doSearch("pick-3", { main: ["000"] }).statement,
      doSearch("cash-pop", { main: ["15"] }).statement,
      doSearch("fantasy-5", { main: ["1", "2", "3", "4", "5"] }).statement,
      doSearch("lotto", { main: ["1", "2", "3", "4", "5", "6"] }).statement,
    ];
    assertNeutralLanguage(statements);
  });
});

describe("LRG-GAME-052: acceptance — tools, capabilities and honest suppression", () => {
  test("the generator uses each group's own count, range and repeat rule", () => {
    for (const [slug, st] of [["pick-3", "fl"], ["cash-pop", "fl"], ["lotto", "fl"], ["superlotto-plus", "ca"]] as const) {
      const p = profileFor(slug, st);
      const r = generateSets(p, { setCount: 4, allowRepeats: true });
      assert.equal(r.sets.length, 4, `${slug} must generate`);
      for (const set of r.sets) {
        for (const g of p.groups) {
          if (g.role === "addOn") continue;
          const vals = set.byGroup[g.key];
          assert.ok(vals, `${slug} must generate the ${g.key} group`);
          assert.equal(vals!.length, g.count, `${slug}/${g.key} count`);
          for (const v of vals!) {
            assert.ok(v >= g.min && v <= g.max, `${slug}/${g.key} value ${v} out of ${g.min}-${g.max}`);
          }
          if (!g.semantics.repeatsAllowed) {
            assert.equal(new Set(vals!).size, vals!.length, `${slug}/${g.key} must not repeat`);
          }
        }
      }
    }
  });

  test("a ball game refuses the repeats preference and says why", () => {
    const r = generateSets(profileFor("lotto"), { setCount: 2, allowRepeats: true });
    assert.match(r.note!, /does not draw the same value twice/);
    for (const s of r.sets) assert.equal(new Set(s.values).size, 6);
  });

  test("positional statistics and permutation vocabulary appear only on ordered games", () => {
    for (const slug of ["pick-2", "pick-3", "pick-4", "pick-5"]) {
      const p = profileFor(slug);
      assert.equal(p.supports.positionalStatistics, true, `${slug} is ordered`);
      assert.equal(p.supports.permutationVocabulary, true);
    }
    for (const [slug, st] of [["cash-pop", "fl"], ["fantasy-5", "fl"], ["lotto", "fl"], ["superlotto-plus", "ca"]] as const) {
      const p = profileFor(slug, st);
      assert.equal(p.supports.positionalStatistics, false, `${slug} must not show positional statistics`);
      assert.equal(p.supports.permutationVocabulary, false, `${slug} must not use Box vocabulary`);
    }
    /* And the model actually withholds the positional table. */
    const m = buildGamePreviewModel("fl", "lotto", true)!;
    assert.equal(m.m2!.statistics?.positions.length, 0);
    assert.ok((buildGamePreviewModel("fl", "pick-3", true)!.m2!.statistics?.positions.length ?? 0) > 0);
  });

  test("unsupported tools suppress honestly rather than rendering empty", () => {
    /* Only Pick 3 has a verified prize matrix, so only Pick 3 offers the ticket checker. */
    for (const [slug, st, usable] of [
      ["pick-3", "fl", true], ["pick-2", "fl", false], ["cash-pop", "fl", false],
      ["lotto", "fl", false], ["superlotto-plus", "ca", false],
    ] as const) {
      const m = buildGamePreviewModel(st, slug, true)!;
      assert.equal(m.m2!.checkerUsable, usable, `${st}/${slug} checker usability`);
      /* JG-03 still exists on every page — it explains itself instead of vanishing. */
      assert.equal(m.sectionState["JG-03"].render, true);
      if (!usable) {
        assert.equal(m.m2!.matrix?.base.length ?? 0, 0, `${st}/${slug} must not show an unverified matrix`);
      }
    }
  });

  test("capability flags gate optional tools independently of the format", () => {
    const cfg = gameConfigFor("fl", "lotto")!;
    assert.equal(cfg.capabilities.hasChecker, false);
    /* A format may support a tool while configuration declines it — both are required. */
    assert.equal(profileFor("lotto").supports.generator, true);
    assert.equal(cfg.capabilities.hasGenerator, true);
  });

  test("multi-draw families keep one identity with independent rows", () => {
    const cases: Record<string, number> = {
      "fl/pick-2": 2, "fl/pick-3": 2, "fl/pick-4": 2, "fl/pick-5": 2, "ca/daily-3": 2,
      "fl/cash-pop": 5, "fl/lotto": 1, "fl/jackpot-triple-play": 1, "ca/superlotto-plus": 1,
      "fl/fantasy-5": 2,
    };
    for (const [pair, rows] of Object.entries(cases)) {
      const [st, slug] = pair.split("/");
      const m = buildGamePreviewModel(st, slug, true)!;
      assert.equal(m.m2!.members.length, rows, `${pair} row count`);
      /* Every member keeps its own production id, and no id is repeated. */
      const ids = m.m2!.members.map((x) => x.gameId);
      assert.equal(new Set(ids).size, ids.length, `${pair} ids must be distinct`);
      /* One identity: exactly one H1's worth of game label, and no per-member mark. */
      assert.equal(typeof m.gameLabel, "string");
    }
    /* And the two-member families genuinely carry different dates where the feed does. */
    const p3 = buildGamePreviewModel("fl", "pick-3", true)!.m2!.members;
    assert.notEqual(p3[0].result?.drawDateIso, p3[1].result?.drawDateIso);
  });

  test("adding a configured game needs no composition edit", () => {
    /* The composition switches on JG ids only. Ten games render through it with no game-specific arm. */
    const bands = codeOnly("components/game/preview/sections/GameM2Bands.tsx");
    for (const slug of ["pick-2", "pick-4", "pick-5", "fantasy-5", "lotto", "daily-3", "superlotto-plus", "cash-pop"]) {
      assert.ok(!bands.includes(`"${slug}"`), `the composition must not name ${slug}`);
    }
    for (const id of [563, 334, 565, 640, 337, 311, 316, 614]) {
      assert.ok(!new RegExp(`\\b${id}\\b`).test(bands), `the composition must not hardcode game id ${id}`);
    }
  });

  test("generic modules name no jurisdiction, and source labels come from configuration", () => {
    const GENERIC = [
      "lib/game/gameFormatProfile.ts", "lib/game/gameHistorySearch.ts", "lib/game/gameM2Model.ts",
      "lib/game/digitSetGenerator.ts", "lib/game/gameReviewFixture.ts",
      "components/game/preview/sections/GameM2Bands.tsx",
      "components/game/preview/tools/GameWorkspace.tsx",
      "components/game/preview/tools/GameGenerator.tsx",
    ];
    for (const f of GENERIC) {
      const code = codeOnly(f);
      /* Jurisdiction names appear only inside a comparison-free string, never as a branch or a label. */
      assert.ok(!/=== *"(fl|ca)"/.test(code), `${f} must not branch on a state code`);
      assert.ok(!/"Florida Lottery"|"California Lottery"/.test(code), `${f} must not hardcode an operator name`);
      assert.ok(!/FLORIDA_DRAW_EVENTS|FLORIDA_FORMAT_VERSIONS/.test(code), `${f} must not import Florida data`);
    }
    /* The fixture reads through the generic seam. */
    assert.match(codeOnly("lib/game/gameReviewFixture.ts"), /drawEventsFor\(stateCode\)/);
    /*
     * And the source line is built from the jurisdiction's GOVERNED manifest — never from its name.
     *
     * CORRECTED (LRG-GAME-053). This test used to assert `/California Lottery results feed/`, which passed
     * because the model built that string out of `stateName`. It was asserting the defect: California has no
     * governed operator name, so nothing had verified that label, and the same template names a territory's or
     * a commission-run jurisdiction's operator wrongly while reading as an attribution.
     */
    const fl = buildGamePreviewModel("fl", "pick-3", true)!;
    const ca = buildGamePreviewModel("ca", "daily-3", true)!;
    assert.match(fl.m2!.sourceLine, /Florida Lottery results feed/, "Florida's name is governed and verified");
    assert.match(ca.m2!.sourceLine, /LotteryCorner results record/,
      "California has no verified operator name, so attribution stays neutral");
  });

  test("no device-local save copy survives in any game configuration", () => {
    for (const e of ELIGIBLE) {
      const cfg = gameConfigFor(e.stateCode, e.gameSlug)!;
      const flat = JSON.stringify(cfg.copy);
      assert.ok(!/this device/i.test(flat), `${e.stateCode}/${e.gameSlug} carries device-local save copy`);
    }
  });

  test("Pick 3 keeps three visible editorial categories; games without content suppress", () => {
    const p3 = buildGamePreviewModel("fl", "pick-3", true)!;
    assert.deepEqual(p3.m2!.editorial.map((s) => s.kind), ["Guides", "News", "Blogs"]);
    assert.equal(p3.sectionState["JG-15"].render, true);
    /* No fabricated editorial for the representative games. */
    for (const [st, slug] of [["fl", "pick-2"], ["fl", "lotto"], ["ca", "daily-3"]] as const) {
      const m = buildGamePreviewModel(st, slug, true)!;
      assert.equal(m.m2!.editorial.length, 0, `${st}/${slug} must not invent editorial`);
      assert.equal(m.sectionState["JG-15"].render, false);
    }
  });

  test("California pages resolve entirely through the generic path", () => {
    for (const slug of ["daily-3", "superlotto-plus"]) {
      const m = buildGamePreviewModel("ca", slug, true);
      assert.ok(m?.m2?.profile, `ca/${slug} must build`);
      assert.ok(m!.m2!.history.length > 0, `ca/${slug} must have a review history`);
      /* NOT `/California/`: the operator name is no longer inferred from the state name (LRG-GAME-053). */
      assert.match(m!.m2!.sourceLine, /LotteryCorner results record/);
      /* No Florida rule era exists for these, so the matrix suppresses rather than borrowing one. */
      assert.equal(m!.m2!.matrix?.base.length ?? 0, 0);
    }
  });
});

describe("LRG-GAME-052: the summary sentence matches what actually happened", () => {
  test("an unordered game separates a full set from a partial overlap", () => {
    /* The defect this guards: any overlap counts as a row, so claiming the whole set "appeared in 25 drawings"
       when it appeared in one — and 24 others shared a number — was simply false. */
    const r = doSearch("lotto", { main: ["1", "2", "3", "4", "5", "6"] }, { window: "all" });
    assert.equal(r.fullMainMatches + r.partialMatches, r.totalMatches);
    if (r.partialMatches > 0 && r.fullMainMatches === 0) {
      assert.match(r.statement, /did not appear in full/);
      assert.match(r.statement, /matched some of your numbers/);
      assert.ok(!new RegExp(`appeared in ${r.totalMatches} `).test(r.statement));
    }
    assertNeutralLanguage([r.statement]);
  });

  test("full matches are ranked above partial ones", () => {
    const r = doSearch("lotto", { main: ["1", "2", "3", "4", "5", "6"] }, { window: "all" });
    const isFull = (row: (typeof r.rows)[number]) => {
      const m = row.matches.find((x) => x.key === "main")!;
      return m.matched === m.of;
    };
    let seenPartial = false;
    for (const row of r.rows) {
      if (!isFull(row)) seenPartial = true;
      else assert.ok(!seenPartial, "a full match must not appear after a partial one");
    }
  });

  test("an ordered game reports only full matches, so its sentence stays simple", () => {
    const r = doSearch("pick-3", { main: ["378"] }, { variant: { gameId: 332 } });
    assert.equal(r.partialMatches, 0);
    assert.match(r.statement, /appeared in exact order in \d+ of the/);
  });

  test("the window phrase reads correctly for the all-drawings option", () => {
    const r = doSearch("pick-3", { main: ["378"] }, { window: "all" });
    assert.ok(!/the all /.test(r.statement), `grammar bug: ${r.statement}`);
    assert.match(r.statement, /available drawings/);
  });

  test("statistics tiles are format-appropriate", () => {
    const labels = (slug: string, st = "fl") =>
      buildGamePreviewModel(st, slug, true)!.m2!.statsPreview.map((m) => m.label);
    /* A repeated-value metric only where a repeat is possible. */
    assert.ok(labels("pick-3").some((l) => /repeated digit/.test(l)));
    assert.ok(!labels("cash-pop").some((l) => /repeat/.test(l)), "one value cannot repeat");
    assert.ok(!labels("lotto").some((l) => /repeat/.test(l)), "a single-pool draw cannot repeat");
    /* A one-value game has a value band, not a total band. */
    assert.ok(labels("cash-pop").some((l) => /value band/.test(l)));
    assert.ok(labels("pick-3").some((l) => /total band/.test(l)));
    for (const [slug, st] of [["pick-3", "fl"], ["cash-pop", "fl"], ["lotto", "fl"], ["superlotto-plus", "ca"]] as const) {
      assertNeutralLanguage(labels(slug, st));
    }
  });

  test("JG-06 and JG-10 no longer suppress for want of a rule era", () => {
    /* Both suppressed for seven of ten games on `era !== undefined`, hiding the how-to-play explanation and the
       generator from every game without a verified payout matrix. Shape is a format fact. */
    for (const [st, slug] of [
      ["fl", "pick-2"], ["fl", "pick-4"], ["fl", "pick-5"], ["fl", "fantasy-5"],
      ["fl", "lotto"], ["ca", "daily-3"], ["ca", "superlotto-plus"],
    ] as const) {
      const m = buildGamePreviewModel(st, slug, true)!;
      assert.equal(m.sectionState["JG-06"].render, true, `${st}/${slug} JG-06`);
      assert.equal(m.sectionState["JG-10"].render, true, `${st}/${slug} JG-10`);
      /* And JG-06 can explain the shape without an era. */
      assert.ok((m.m2!.formatSummary ?? "").length > 20, `${st}/${slug} needs a format summary`);
    }
    /* The only honest suppressions left are missing editorial and missing claim facts. */
    const ids = (st: string, slug: string) =>
      buildGamePreviewModel(st, slug, true)!.suppressed.filter((s) => !s.id.startsWith("AD-")).map((s) => s.id);
    assert.deepEqual(ids("fl", "lotto"), ["JG-15"]);
    assert.deepEqual(ids("ca", "daily-3"), ["JG-13", "JG-15"]);
    assert.deepEqual(ids("fl", "pick-3"), []);
  });

  test("the format summary describes each family in its own terms", () => {
    const sum = (slug: string, st = "fl") => buildGamePreviewModel(st, slug, true)!.m2!.formatSummary!;
    assert.match(sum("pick-4"), /Choose 4 digits from 0 to 9.*may repeat.*order matters/i);
    assert.match(sum("cash-pop"), /Choose one number from 1 to 15/);
    assert.match(sum("lotto"), /Choose 6 numbers from 1 to 53.*each different.*order does not matter/i);
    assert.match(sum("superlotto-plus", "ca"), /Choose 5 numbers from 1 to 47/);
    assert.match(sum("superlotto-plus", "ca"), /Mega Ball from 1 to 27.*own pool/);
  });
});

describe("LRG-GAME-052: Pick 3 editorial is player-focused", () => {
  test("three visible categories remain, with crawlable links", () => {
    const m = buildGamePreviewModel("fl", "pick-3", true)!;
    assert.deepEqual(m.m2!.editorial.map((s) => s.kind), ["Guides", "News", "Blogs"]);
    for (const sec of m.m2!.editorial) {
      assert.ok(sec.items.length >= 2);
      for (const it of sec.items) assert.match(it.href, /^\/fl\/pick-3\/(guides|news|blog)\/[a-z0-9-]+$/);
    }
  });

  test("no implementation or database vocabulary reaches the reader", () => {
    const flat = JSON.stringify(gameConfigFor("fl", "pick-3")!.editorial).toLowerCase();
    for (const banned of [
      "view model", "data path", "fixture", "identifier", "schema", "provenance",
      "deterministic", "feed order", "array", "governed",
    ]) {
      assert.ok(!flat.includes(banned), `editorial must not use "${banned}"`);
    }
  });

  test("the first two guides no longer overlap", () => {
    const ed = gameConfigFor("fl", "pick-3")!.editorial!;
    const g1 = ed.find((e) => e.slug === "straight-box-and-combo-explained")!;
    const g2 = ed.find((e) => e.slug === "how-repeated-digits-change-box-combinations")!;
    /* The 3-way/6-way arithmetic belongs to exactly one of them. */
    const text = (e: typeof g1) => JSON.stringify(e.body).toLowerCase();
    assert.ok(text(g2).includes("six ways") || text(g2).includes("6-way"));
    assert.ok(!text(g1).includes("three possible orders"), "guide one must not re-derive the arithmetic");
    assert.notEqual(g1.title, g2.title);
  });

  test("historical rule updates are labelled as historical", () => {
    const news = gameConfigFor("fl", "pick-3")!.editorial!.filter((e) => e.kind === "News");
    assert.equal(news.length, 3);
    for (const n of news) {
      assert.ok(n.effectiveDate, `${n.slug} must carry the date its change took effect`);
      assert.match(n.summary, /historical rule update/i, `${n.slug} must be labelled historical`);
      assert.ok((n.sources ?? []).length > 0);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * LRG-GAME-053 — the eight generic-engine corrections.
 *
 * Every test below names the defect it reproduces, because the value of the test is that it FAILED before the
 * correction. A test that merely restates the new behaviour proves nothing about the bug.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

describe("LRG-GAME-053 (1): a multi-group ticket is classified on every group the reader completed", () => {
  /*
   * THE DEFECT. `fullMatches` inspected the main group only. Searching SuperLotto Plus for the real 2026-07-08
   * main numbers with the WRONG Mega Ball reported one full match and stated the selection "appeared in full",
   * while the table on the same screen read `main 5 of 5 · Mega Ball 0 of 1`.
   */
  const MAIN_HIT = ["18", "22", "28", "33", "38"];
  const REAL_MEGA = "15";
  const WRONG_MEGA = "7";
  const slp = (raw: Record<string, string[]>) =>
    doSearch("superlotto-plus", raw, { window: "all", orderMode: "any" }, "ca");

  test("the real draw's main numbers exist in the history, so the cases below are not vacuous", () => {
    const row = historyFor("superlotto-plus", "ca").find((h) => h.drawDateIso === "2026-07-08");
    assert.ok(row, "the 2026-07-08 California draw must be present");
    assert.deepEqual(row!.digits, [18, 22, 28, 33, 38]);
    assert.deepEqual(row!.extras?.find((e) => e.label === "Mega Ball")?.values, [15]);
  });

  test("main full + special match is a full TICKET match", () => {
    const r = slp({ main: MAIN_HIT, "mega-ball": [REAL_MEGA] });
    assert.equal(r.fullTicketMatches, 1);
    assert.equal(r.fullMainMatches, 1);
    assert.deepEqual([...r.comparedSpecialLabels], ["Mega Ball"]);
    assert.match(r.statement, /with Mega Ball 15 appeared in full in 1 of the/);
  });

  test("main full + special MISS is NOT a full ticket match, and the sentence says so", () => {
    const r = slp({ main: MAIN_HIT, "mega-ball": [WRONG_MEGA] });
    assert.equal(r.fullTicketMatches, 0, "a wrong special ball cannot be a full ticket match");
    assert.equal(r.fullMainMatches, 1, "the main-number match is still reported");
    /* The exact false claim the defect produced must not reappear in any form. */
    assert.ok(
      !/appeared in full/.test(r.statement),
      `a wrong special ball must never read as "appeared in full": ${r.statement}`,
    );
    assert.match(r.statement, /matched all 5 main numbers/);
    assert.match(r.statement, /but no drawing also matched your Mega Ball/);
    assert.match(r.statement, /full main-number match, not a full ticket match/);
    assertNeutralLanguage([r.statement]);
  });

  test("main and special outcomes are reported separately on the row", () => {
    const r = slp({ main: MAIN_HIT, "mega-ball": [WRONG_MEGA] });
    const row = r.rows[0];
    const main = row.matches.find((m) => m.key === "main")!;
    const mega = row.matches.find((m) => m.label === "Mega Ball")!;
    assert.equal(main.matched, 5);
    assert.equal(main.of, 5);
    assert.equal(mega.matched, 0, "the special group is never folded into the main count");
    assert.equal(mega.of, 1);
    assert.match(row.description, /all 5 numbers/);
    assert.match(row.description, /0 of 1 Mega Ball/);
  });

  test("a partial main match with a matching special is still not a full ticket match", () => {
    const r = slp({ main: ["18", "22", "1", "2", "3"], "mega-ball": [REAL_MEGA] });
    assert.equal(r.fullTicketMatches, 0);
    assert.equal(r.fullMainMatches, 0);
    assert.ok(!/appeared in full/.test(r.statement), r.statement);
  });

  test("leaving the optional special group blank searches main numbers only", () => {
    /* A blank group is NOT compared and must not count against the reader — otherwise entering five numbers and
       no Mega Ball would report zero full matches for a set that genuinely came up. */
    const r = slp({ main: MAIN_HIT });
    assert.deepEqual([...r.comparedSpecialLabels], []);
    assert.equal(r.fullTicketMatches, 1);
    assert.equal(r.fullMainMatches, 1);
    assert.match(r.statement, /appeared in full in 1 of the/);
    assert.ok(!/Mega Ball/.test(r.statement), "a group the reader left blank is not mentioned");
  });

  test("a drawn add-on is never part of ticket classification", () => {
    /* FIREBALL is drawn, not chosen, so it cannot bear on whether a ticket matched. Pick 3 has one and must
       still report a plain full match with no add-on group compared. */
    const r = doSearch("pick-3", { main: ["378"] }, { variant: { gameId: 332 } });
    assert.deepEqual([...r.comparedSpecialLabels], []);
    assert.equal(r.fullTicketMatches, r.fullMainMatches);
  });

  test("full ticket matches rank above full main-number matches, which rank above partial ones", () => {
    const r = slp({ main: MAIN_HIT, "mega-ball": [REAL_MEGA] });
    const band = (row: (typeof r.rows)[number]) => {
      const main = row.matches.find((x) => x.key === "main")!;
      const mega = row.matches.find((x) => x.label === "Mega Ball");
      const mainFull = main.matched === main.of;
      const ticketFull = mainFull && mega !== undefined && mega.matched === mega.of;
      return ticketFull ? 0 : mainFull ? 1 : 2;
    };
    let worst = 0;
    for (const row of r.rows) {
      assert.ok(band(row) >= worst, "rows must be ordered ticket-full, then main-full, then partial");
      worst = band(row);
    }
  });
});

describe("LRG-GAME-053 (2): rule eras come from a generic provider, not a Florida import", () => {
  test("Florida's eras are registered and reachable through the provider", () => {
    assert.ok(ruleErasFor("fl").length > 0);
    assert.deepEqual(ruleErasFor("FL"), ruleErasFor("fl"), "the lookup is case-insensitive");
    assert.ok(hasRuleEras("fl"));
  });

  test("an unregistered jurisdiction returns an empty collection, never another state's rules", () => {
    for (const code of ["ca", "zz"]) {
      assert.deepEqual(ruleErasFor(code), [], `${code} must not inherit registered rules`);
      assert.equal(hasRuleEras(code), false);
    }
  });

  test("the shared page model no longer imports a jurisdiction's rule data", () => {
    const src = codeOnly("lib/game/gameM2Model.ts");
    assert.ok(!/FLORIDA_RULE_ERAS/.test(src), "the generic model must not name Florida's rule data");
    assert.match(src, /ruleErasFor\(stateCode\)/);
  });

  test("California's rule-dependent features suppress honestly rather than borrowing Florida's", () => {
    for (const slug of ["daily-3", "superlotto-plus"]) {
      const m = buildGamePreviewModel("ca", slug, true)!;
      assert.equal(m.m2!.era, undefined, `ca/${slug} has no researched rule era`);
      assert.equal(m.m2!.matrix, null, "no era means no payout matrix at all");
      assert.equal(m.m2!.checkerUsable, false, "a ticket cannot be priced without verified rules");
    }
  });
});

describe("LRG-GAME-053 (3): JG-12 renders only with publishable information", () => {
  test("the tautology is gone from the eligibility condition", () => {
    /* THE DEFECT. `m2.era !== null` where `era` is `GameRuleEra | undefined`: `undefined !== null` is always
       true, so the expression was constantly true and its first half was dead code. */
    const src = codeOnly("lib/game/gamePreviewModel.ts");
    assert.ok(
      !/m2\.era !== null/.test(src),
      "comparing a `GameRuleEra | undefined` against null is always true",
    );
  });

  test("JG-12 renders exactly when the section has at least one fact to show", () => {
    for (const [st, slug] of [["fl", "pick-3"], ["fl", "lotto"], ["fl", "cash-pop"],
                              ["ca", "daily-3"], ["ca", "superlotto-plus"]] as const) {
      const m = buildGamePreviewModel(st, slug, true)!;
      const facts = m.m2!.offeringFacts.length;
      assert.equal(
        m.sectionState["JG-12"].render, facts > 0,
        `${st}/${slug}: JG-12 renders ${m.sectionState["JG-12"].render} with ${facts} facts`,
      );
    }
  });

  test("Florida publishes rule-derived offering facts; California publishes only what it can verify", () => {
    const fl = buildGamePreviewModel("fl", "pick-3", true)!.m2!.offeringFacts;
    assert.ok(fl.some((f) => f.key === "ticketPrice" && f.source === "operatorRule"),
      "Florida's ticket price comes from the promulgated rule");

    const ca = buildGamePreviewModel("ca", "superlotto-plus", true)!.m2!.offeringFacts;
    assert.ok(!ca.some((f) => f.source === "operatorRule"),
      "California has no researched rule era, so no fact may claim an operator rule as its source");
  });

  test("a jurisdiction with no facts at all would get the heading and a stated reason", () => {
    /* Proven on the condition rather than by inventing a jurisdiction: with zero facts the section suppresses
       with a reason, which is the honest absence state rather than an empty definition list. */
    for (const [st, slug] of [["fl", "pick-3"], ["ca", "daily-3"]] as const) {
      const m = buildGamePreviewModel(st, slug, true)!;
      const s = m.sectionState["JG-12"];
      if (!s.render) assert.ok(s.reason.length > 0, "a suppressed section always states why");
    }
  });
});

describe("LRG-GAME-053 (4): no operator name is ever inferred from a state name", () => {
  test("the string template that manufactured operator names is gone", () => {
    const src = codeOnly("lib/game/gameM2Model.ts");
    assert.ok(
      !/\$\{config\.game\.stateName\} Lottery/.test(src),
      "an operator name must never be built out of a state name",
    );
  });

  test("Florida uses its governed, verified operator name", () => {
    const m = buildGamePreviewModel("fl", "pick-3", true)!;
    assert.match(m.m2!.sourceLine, /Florida Lottery results feed/);
  });

  test("California receives NO inferred operator name", () => {
    for (const slug of ["daily-3", "superlotto-plus"]) {
      const line = buildGamePreviewModel("ca", slug, true)!.m2!.sourceLine;
      assert.ok(
        !/California Lottery/.test(line),
        `ca/${slug}: "California Lottery" is not a verified fact here — it was a string template: ${line}`,
      );
      assert.ok(!/undefined/.test(line), `ca/${slug}: an absent governed fact must not print as text: ${line}`);
      assert.match(line, /LotteryCorner results record/,
        "with no verified or configured source name, attribution falls back to neutral language");
    }
  });

  test("a configured result-source label is preferred over neutral language", () => {
    /* Proven through the model rather than by editing a shipped configuration: the field is read from
       `trust.resultSourceLabel`, and no representative configuration sets it, which is why California is
       neutral rather than named. */
    const src = codeOnly("lib/game/gameM2Model.ts");
    assert.match(src, /config\.trust\.resultSourceLabel/);
    for (const [st, slug] of ALL_PAIRS) {
      const cfg = gameConfigFor(st, slug);
      if (cfg?.trust.resultSourceLabel !== undefined) {
        assert.ok(cfg.trust.resultSourceLabel.length > 0, `${st}/${slug}: a configured label must not be empty`);
      }
    }
  });
});

describe("LRG-GAME-053 (5): a capability set to false suppresses its feature", () => {
  /*
   * THE DEFECT. Only `hasSharedAi` and `hasChecker` were ever read. Every other capability was inert, and since
   * all ten representative games declare theirs `true` the omission was invisible. These tests clone a real
   * configuration and switch one capability off at a time, which is the only way to prove the flag is load-bearing.
   */
  const withCapabilities = (
    st: string, slug: string, over: Record<string, boolean>,
  ): GameViewConfig => {
    const base = gameConfigFor(st, slug);
    assert.ok(base, `${st}/${slug} must have a configuration to clone`);
    return { ...base!, capabilities: { ...base!.capabilities, ...over } };
  };

  /** The section each capability governs, and the data that exists anyway so the flag is the only difference. */
  const CASES: readonly { capability: string; section: GameSectionId }[] = [
    { capability: "hasHistory", section: "JG-07" },
    { capability: "hasNumberHistory", section: "JG-08" },
    { capability: "hasStatistics", section: "JG-09" },
    { capability: "hasGenerator", section: "JG-10" },
    { capability: "hasMethods", section: "JG-11" },
    { capability: "hasCommunityStarters", section: "JG-16" },
    { capability: "hasAlerts", section: "JG-17" },
    { capability: "hasSharedAi", section: "JG-04" },
  ];

  test("every governed section renders with its capability on — otherwise the off-test proves nothing", () => {
    const m = buildGamePreviewModel("fl", "pick-3", true, { config: withCapabilities("fl", "pick-3", {}) })!;
    for (const c of CASES) {
      assert.equal(m.sectionState[c.section].render, true,
        `${c.section} must render on the baseline, or switching ${c.capability} off is not a real test`);
    }
  });

  test("switching one capability off suppresses exactly its section, with a stated reason", () => {
    for (const c of CASES) {
      const cfg = withCapabilities("fl", "pick-3", { [c.capability]: false });
      const m = buildGamePreviewModel("fl", "pick-3", true, { config: cfg })!;
      const s = m.sectionState[c.section];
      assert.equal(s.render, false,
        `${c.capability}: false must suppress ${c.section} even though its fixture data exists`);
      assert.ok(s.render === false && s.reason.length > 0, `${c.section} must state why it is absent`);
    }
  });

  test("switching the history capability off also withholds observations derived from history", () => {
    const cfg = withCapabilities("fl", "pick-3", { hasHistory: false });
    const m = buildGamePreviewModel("fl", "pick-3", true, { config: cfg })!;
    assert.equal(m.sectionState["JG-07"].render, false);
    assert.equal(m.sectionState["JG-14"].render, false,
      "insights computed from a hidden history must not be published");
  });

  test("the checker and the commerce entry are gated by their own capabilities", () => {
    const noChecker = buildGamePreviewModel("fl", "pick-3", true, { config: withCapabilities("fl", "pick-3", { hasChecker: false }) })!;
    assert.equal(noChecker.m2!.checkerUsable, false);
    const noBuy = buildGamePreviewModel("fl", "pick-3", true, { config: withCapabilities("fl", "pick-3", { hasBuyNowEntry: false }) })!;
    assert.equal(noBuy.m2!.buyNowUsable, false);
  });

  test("MANDATORY sections keep their headings whatever the capabilities say", () => {
    /* The correction direction is explicit: do not hide a mandatory heading to make a capability test pass. */
    const allOff: Record<string, boolean> = {};
    for (const k of Object.keys(gameConfigFor("fl", "pick-3")!.capabilities)) allOff[k] = false;
    const m = buildGamePreviewModel("fl", "pick-3", true, { config: withCapabilities("fl", "pick-3", allOff) })!;
    for (const id of ["JG-01", "JG-02", "JG-03", "JG-05", "JG-06", "JG-12", "JG-13", "JG-18"] as GameSectionId[]) {
      assert.equal(m.sectionState[id].render, true, `${id} is required by BP-04B §18 and must still render`);
    }
  });

  test("no capability is declared in a configuration and then ignored by the model", () => {
    /* The defect in general form: a configuration field that appears to control something and does not. Every
       key in the capabilities block must be named somewhere in the model or composition layer. */
    const keys = Object.keys(gameConfigFor("fl", "pick-3")!.capabilities);
    const model = src("lib/game/gamePreviewModel.ts") + src("lib/game/gameM2Model.ts");
    for (const k of keys) {
      assert.ok(model.includes(`"${k}"`), `${k} is configurable but never read — an inert flag is a false promise`);
    }
  });
});

describe("LRG-GAME-053 (6): matching semantics are declared, not derived from a value type", () => {
  test("no registry derives a matching rule from valueType", () => {
    for (const f of ["floridaFormatRegistry", "stateFormatRegistry"]) {
      const src = codeOnly(`lib/state/${f}.ts`);
      assert.ok(
        !/matchOrdered: valueType/.test(src) && !/repeatsAllowed: valueType/.test(src),
        `${f}: "renders as a digit" is not the same claim as "matches by position"`,
      );
    }
  });

  test("every publication-capable representative format declares both fields on every group", () => {
    for (const [st, slug] of ALL_PAIRS) {
      const m = buildGamePreviewModel(st, slug, true);
      const fmt = m?.m2?.formatVersion;
      if (!fmt) continue;
      assert.deepEqual(
        undeclaredSemantics(fmt), [],
        `${st}/${slug} publishes tools, so no group may leave its matching semantics undeclared`,
      );
    }
  });

  test("an undeclared group is still DETECTED rather than silently defaulted", () => {
    /* The safety net must keep reporting, or a future partially-transcribed format would look complete. */
    const complete = FLORIDA_FORMAT_VERSIONS.find((v) => v.gameKey === "fantasy-5")!;
    const bare: ResultFormatVersion = {
      ...complete,
      primaryGroups: [{
        order: 0, label: null, valueType: "number", count: 5, min: 1, max: 39,
        differentSet: false, colorToken: "ball.default", visualRole: "main",
      }],
    };
    const missing = undeclaredSemantics(bare);
    assert.equal(missing.length, 1);
    assert.deepEqual(missing[0].missing.sort(), ["matchOrdered", "repeatsAllowed"]);
  });

  test("the named constructors state the semantics they claim", () => {
    const shape = {
      order: 0, label: null, valueType: "number" as const, count: 5, min: 1, max: 39,
      differentSet: false, colorToken: "ball.default", visualRole: "main" as const,
    };
    assert.deepEqual(
      { o: orderedDigitPositions({ ...shape, valueType: "digit" }).matchOrdered,
        r: orderedDigitPositions({ ...shape, valueType: "digit" }).repeatsAllowed },
      { o: true, r: true },
    );
    assert.deepEqual(
      { o: unorderedNumberPool(shape).matchOrdered, r: unorderedNumberPool(shape).repeatsAllowed },
      { o: false, r: false },
    );
    assert.deepEqual(
      { o: singleValueGroup({ ...shape, count: 1 }).matchOrdered,
        r: singleValueGroup({ ...shape, count: 1 }).repeatsAllowed },
      { o: false, r: false },
    );
  });

  test("stored result order does not determine ticket-matching order", () => {
    /* An unordered game's feed arrives ascending, which looks exactly like a positional result. The declared
       semantics must say otherwise, and a set typed in a different order must still match. */
    const p = profileFor("superlotto-plus", "ca");
    assert.equal(p.main?.semantics.matchOrdered, false);
    const row = historyFor("superlotto-plus", "ca").find((h) => h.drawDateIso === "2026-07-08")!;
    assert.deepEqual([...row.digits], [...row.digits].slice().sort((a, b) => a - b),
      "the stored order for this game is ascending — the condition that made inference look safe");
    const r = doSearch("superlotto-plus", { main: ["38", "22", "18", "33", "28"] },
      { window: "all", orderMode: "any" }, "ca");
    assert.equal(r.fullMainMatches, 1, "a set typed in a different order must still match");
  });
});

describe("LRG-GAME-053 (7): the review date is resolved per jurisdiction", () => {
  test("the shared Florida constant is gone from the fixture module", () => {
    const src = codeOnly("lib/game/gameReviewFixture.ts");
    assert.ok(!/export const REVIEW_DATE_ISO/.test(src),
      "one constant applied to every jurisdiction is the defect");
  });

  test("each jurisdiction resolves its own date, from a named source", () => {
    const fl = resolveReviewDate("fl");
    const ca = resolveReviewDate("ca");
    assert.equal(fl.source, "governedManifest");
    assert.equal(ca.source, "governedManifest");
    assert.notEqual(fl.iso, ca.iso, "Florida and California have different newest results");
    assert.equal(ca.iso, "2026-07-08");
    assert.equal(fl.iso, "2026-07-09");
  });

  test("no jurisdiction's review date is later than its own newest result", () => {
    /* The exact harm: California ran against 2026-07-09 while its newest fact was 2026-07-08, so its schedule
       guard and date-effective selections were evaluated a day into a future it had no data for. */
    for (const [st, slug] of ALL_PAIRS) {
      const m = buildGamePreviewModel(st, slug, true);
      if (!m?.m2) continue;
      const newest = m.m2.history
        .filter((h) => h.provenance === "productionFeed")
        .map((h) => h.drawDateIso)
        .sort()
        .reverse()[0];
      if (!newest) continue;
      assert.ok(m.m2.reviewDateIso >= newest, `${st}/${slug}: review date precedes its newest real result`);
      assert.ok(
        m.m2.reviewDateIso <= reviewDateFor(st),
        `${st}/${slug}: review date must be this jurisdiction's own, not another's`,
      );
    }
  });

  test("the resolved date is used consistently by every date-sensitive decision", () => {
    for (const [st, slug] of ALL_PAIRS) {
      const m = buildGamePreviewModel(st, slug, true);
      if (!m?.m2) continue;
      const d = m.m2.reviewDateIso;
      /* generated history dates */
      for (const h of m.m2.history) {
        assert.ok(h.drawDateIso <= d, `${st}/${slug}: a row is dated after the review date`);
      }
      /* next-draw suppression */
      for (const s of m.m2.schedules) {
        if (s.nextDrawDisplay === null) continue;
        assert.ok(/\d{2}\/\d{2}\/\d{4}/.test(s.nextDrawDisplay), "a shown next draw carries a date");
      }
      /* the freshness line */
      assert.match(m.m2.sourceLine, /^Last updated /);
    }
  });

  test("an unregistered jurisdiction records the absence instead of publishing a date as fact", () => {
    const r = resolveReviewDate("zz");
    assert.equal(r.source, "isolatedFallback");
    assert.equal(r.iso, ISOLATED_FALLBACK_REVIEW_DATE);
    assert.ok(r.absent && r.absent.length > 0, "the absence must be recorded for the implementation record");
  });

  test("no representative page depends on the isolated fallback", () => {
    for (const [st, slug] of ALL_PAIRS) {
      const m = buildGamePreviewModel(st, slug, true);
      if (!m?.m2) continue;
      assert.notEqual(m.m2.reviewDateSource, "isolatedFallback",
        `${st}/${slug} must resolve a real jurisdiction date`);
    }
  });

  test("no review date is read from the wall clock", () => {
    /* Founder decision 1, and the reason the fixture is reproducible at all. */
    const src = codeOnly("lib/game/gameReviewDate.ts");
    assert.ok(!/Date\.now\(\)/.test(src) && !/new Date\(\)/.test(src),
      "a deterministic review date must not depend on when the build ran");
  });
});

describe("LRG-GAME-053 (9): every game's vocabulary comes from its own format", () => {
  /*
   * FOUND DURING VERIFICATION. The JG-09 statistics tiles were made format-driven in LRG-GAME-052, but the
   * JG-14 "what changed" summary and the JG-07 history table header were missed, so Cash Pop — one number from
   * 1 to 15 — still published "0 of 303 drawings contained a repeated digit", "0 of 303 drawings contained two
   * digits next to each other in value" and a "Winning digits" column. All three were true, meaningless, and
   * described a digit game the reader was not looking at.
   */
  const vocabOf = (st: string, slug: string) => {
    const m = buildGamePreviewModel(st, slug, true)!;
    return [m.m2!.whatChanged?.summary ?? "", ...(m.m2!.whatChanged?.points ?? [])].join(" ");
  };

  test("a non-digit game's summary never uses digit vocabulary", () => {
    for (const [st, slug] of [["fl", "cash-pop"], ["fl", "fantasy-5"], ["fl", "lotto"],
                              ["fl", "jackpot-triple-play"], ["ca", "superlotto-plus"]] as const) {
      const v = vocabOf(st, slug);
      assert.ok(!/digit/i.test(v), `${st}/${slug} draws numbers, not digits: ${v}`);
    }
  });

  test("a digit game's summary still uses digit vocabulary", () => {
    for (const [st, slug] of [["fl", "pick-3"], ["fl", "pick-4"], ["ca", "daily-3"]] as const) {
      assert.match(vocabOf(st, slug), /digit/i, `${st}/${slug} is a digit game`);
    }
  });

  test("a one-value game reports no repeat and no adjacency observation", () => {
    /* Neither statement is meaningful when a single value is drawn: one value cannot repeat itself, and two
       values cannot be adjacent when only one exists. */
    const v = vocabOf("fl", "cash-pop");
    assert.ok(!/contained a repeated/.test(v), `a one-number game cannot repeat a value: ${v}`);
    assert.ok(!/next to each other/.test(v), `a one-number game has no adjacent pair: ${v}`);
  });

  test("a pool draw reports no repeat observation either", () => {
    /* Fantasy 5 draws without replacement, so "contained a repeated number" is always zero and always noise. */
    const v = vocabOf("fl", "fantasy-5");
    assert.ok(!/contained a repeated/.test(v), `a pool draw cannot repeat a value: ${v}`);
  });

  test("the history table header is derived from the format, not hardcoded", () => {
    const code = codeOnly("components/game/preview/tools/GameWorkspace.tsx");
    assert.ok(!/>Winning digits</.test(code), "the column heading must name what THIS game draws");
    assert.match(code, /Winning \$\{profile\.main\.valueType === "digit"/);
  });
});
