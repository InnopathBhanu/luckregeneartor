/*
 * THE TOOLS PAGE FAMILY — BP-05C conformance (LRG-TOOLS-001, Conflict 42 interim).
 *
 * Authority: BP-05C (Final approved, frozen v1.1) §0.1/§0.2, §3–§5, §7, §11, §16, §18–§20, §22–§25;
 * `source-conflicts.md` Conflict 42 (the founder's interim build instruction: blueprint route, noindex,
 * NOTHING redirects today); `FD-ACC-02` (no Insider concept anywhere); the frozen Constitution A.9 (a tax
 * calculator carries no purchase or promotional pressure) and §7 (never "you will owe" — estimates only).
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. WRONG MONEY MATH — the marginal-table engine drifting from the published 2026 tables. The expected
 *      figures below were HAND-COMPUTED from IRS Rev. Proc. 2025-32 bracket arithmetic, independently of
 *      the module, and cover both zero-tax and high-tax states, both filing-status extremes, a prize under
 *      the withholding threshold, and a full jackpot.
 *   2. TAX ADVICE LANGUAGE — "you will owe" or an odds/certainty claim entering a money surface.
 *   3. A MISSING §20 DISCLOSURE — all eight items, every render, or the figures lose their assumptions.
 *   4. COMMERCE OR ADS inside the protected input-to-output flow (Constitution A.9; `CLAUDE.md` §12).
 *   5. A GATED PUBLIC ESTIMATE — §11 grants ONE complete estimate with no account; only saving is gated.
 *   6. INDEXABILITY — both routes stay noindex with the standalone canonical (Conflict 42), and `?game=`
 *      context must never mint a second canonical (§7).
 *   7. A DEAD HUB LINK — every href resolves to a registered route (FD-DAT-17: no placeholders, no
 *      "coming soon").
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import {
  ANNUITY_ESCALATION, ANNUITY_YEARS, ASSUMED_CASH_RATIO, annuityPaymentsCents, annuitySchedule,
  annuityTotals, computeTaxScenario, federalIncomeTaxCents, federalWithholdingCents, formatUsdCents,
  formatUsdWhole, parseUsdToCents, taxLine,
} from "../lib/tools/taxCalculator";
import {
  EFFECTIVE_TAX_YEAR, FEDERAL_BRACKETS_2026, FEDERAL_TABLE_CITATION, FEDERAL_TABLE_SOURCE,
  FEDERAL_WITHHOLDING_RATE, FEDERAL_WITHHOLDING_THRESHOLD_USD, FILING_STATUSES, RATES_AS_OF_ISO,
  REVIEW_OWNER, STATE_TAX_2026, stateTaxRecord, statesNeedingVerification,
} from "../lib/tools/taxTables2026";
import {
  TAX_DISCLAIMER, TAX_METHODOLOGY, stateOptions, taxCalculatorPrefill, taxDisclosures,
} from "../lib/tools/taxCalculatorModel";
import {
  TAX_CALCULATOR_PATH, TOOLS_HUB_PATH, TOOL_CATEGORY_LABELS, availableCategories, toolManifest,
  toolsInCategory,
} from "../lib/tools/toolManifest";
import { TOOLS_REGISTRY, isToolsRouteServed, toolsRoutePaths } from "../lib/tools/toolsRegistry";
import {
  TAX_CALCULATOR_DESCRIPTION, TAX_CALCULATOR_TITLE, TOOLS_HUB_DESCRIPTION, TOOLS_HUB_TITLE,
  taxCalculatorMetadata, toolsHubMetadata,
} from "../lib/tools/toolsRouteMetadata";
import { TAX_CALCULATOR_H1, TOOLS_HUB_H1, taxCalculatorSchema, toolsHubSchema } from "../lib/tools/toolsSchema";
import { routeInventory, servesPage } from "../lib/registry/pageFamilyRegistry";
import { sectionIntelligence } from "../lib/ai/sectionIntelligence";
import { canonicalUrl } from "../lib/seo/productionOrigin";
import { flagshipTools } from "../lib/flagship/flagshipTools";
import { FLAGSHIP_GAMES } from "../lib/flagship/flagshipGames";
import { getNewsData } from "../lib/news/bff/newsBff";
import { getBlogData } from "../lib/blog/bff/blogBff";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped, so a comment QUOTING a rule is not mistaken for a violation. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Whole dollars (or dollars-and-cents) to integer cents — the module's own unit. */
const usd = (dollars: number) => Math.round(dollars * 100);

const TOOLS_SOURCES = [
  "lib/tools/taxTables2026.ts",
  "lib/tools/taxCalculator.ts",
  "lib/tools/taxCalculatorModel.ts",
  "lib/tools/toolManifest.ts",
  "lib/tools/toolsRegistry.ts",
  "lib/tools/toolsRouteMetadata.ts",
  "lib/tools/toolsSchema.ts",
  "components/tools/ToolsHubPage.tsx",
  "components/tools/TaxCalculatorPage.tsx",
  "components/tools/TaxCalculatorTool.tsx",
  "app/tools/page.tsx",
  "app/tools/tax-calculator/page.tsx",
] as const;

/* ══════════════════════════════════════════════════════════════════ 1. the math, verified by hand */

describe("BP-05C §19/§20: the tax arithmetic matches hand-computed Rev. Proc. 2025-32 figures", () => {
  /*
   * Every expected figure below was computed BY HAND from the 2026 bracket tables (exact decimal
   * arithmetic, independent of the module), then transcribed. If one of these fails, the money math moved.
   */

  test("case 1 — $50,000,000 cash, single filer, Florida (a no-income-tax state)", () => {
    const line = taxLine(usd(50_000_000), "single", stateTaxRecord("fl")!);
    assert.equal(line.federalWithheldCents, usd(12_000_000));       /* 24% of 50M */
    assert.equal(line.federalEstimatedTaxCents, usd(18_455_957.25)); /* marginal single table */
    assert.equal(line.federalAdditionalCents, usd(6_455_957.25));
    assert.equal(line.stateWithheldCents, 0);
    assert.equal(line.stateAdditionalCents, 0);
    assert.equal(line.estimatedNetCents, usd(31_544_042.75));
    assert.equal(line.federalOverWithheld, false);
  });

  test("case 2 — the same $50,000,000 in New York (10.9% withheld at the top rate)", () => {
    const line = taxLine(usd(50_000_000), "single", stateTaxRecord("ny")!);
    assert.equal(line.federalAdditionalCents, usd(6_455_957.25));
    assert.equal(line.stateWithheldCents, usd(5_450_000));
    assert.equal(line.stateAdditionalCents, 0); /* withholding rate equals the top rate */
    assert.equal(line.estimatedNetCents, usd(26_094_042.75));
  });

  test("case 3 — a $4,000 prize (below the $5,000 withholding threshold), single, New York", () => {
    const line = taxLine(usd(4_000), "single", stateTaxRecord("ny")!);
    assert.equal(line.federalWithheldCents, 0, "no 24% withholding below the W-2G threshold");
    assert.equal(line.federalAdditionalCents, usd(400)); /* 10% bracket only */
    assert.equal(line.stateWithheldCents, 0, "state withholding mirrors the reporting threshold");
    assert.equal(line.stateAdditionalCents, usd(436));   /* 10.9% owed at filing */
    assert.equal(line.estimatedNetCents, usd(3_164));
  });

  test("case 4 — filing-status extremes on $1,000,000: married-joint vs married-separate", () => {
    const joint = taxLine(usd(1_000_000), "marriedJoint", null);
    assert.equal(joint.federalWithheldCents, usd(240_000));
    assert.equal(joint.federalAdditionalCents, usd(52_164.5));
    assert.equal(joint.estimatedNetCents, usd(707_835.5));

    const separate = taxLine(usd(1_000_000), "marriedSeparate", null);
    assert.equal(separate.federalAdditionalCents, usd(91_082.25)); /* the 35% band tops out at $384,350 */
    assert.equal(separate.estimatedNetCents, usd(668_917.75));
    assert.ok(separate.federalAdditionalCents > joint.federalAdditionalCents,
      "married-separate pays more additional tax than married-joint on the same prize");
  });

  test("case 5 — Massachusetts surtax threshold: below it no surtax, above it the additional line", () => {
    /* $500,000 sits under the ~$1M surtax threshold: 5% withheld, NO additional state line. */
    const under = taxLine(usd(500_000), "single", stateTaxRecord("ma")!);
    assert.equal(under.federalWithheldCents, usd(120_000));
    assert.equal(under.federalAdditionalCents, usd(23_769.25));
    assert.equal(under.stateWithheldCents, usd(25_000));
    assert.equal(under.stateAdditionalCents, 0, "the millionaire surtax must not bill a $500k prize");
    assert.equal(under.estimatedNetCents, usd(331_230.75));

    /* $2,000,000 crosses it: 5% withheld, the 9% top rate produces the additional line. */
    const over = taxLine(usd(2_000_000), "single", stateTaxRecord("ma")!);
    assert.equal(over.stateWithheldCents, usd(100_000));
    assert.equal(over.stateAdditionalCents, usd(80_000));
    assert.equal(over.estimatedNetCents, usd(1_124_042.75));
  });

  test("case 6 — over-withholding (Ohio, 4% withheld vs 3.5% top rate): flagged, never netted back", () => {
    const line = taxLine(usd(100_000), "single", stateTaxRecord("oh")!);
    assert.equal(line.federalWithheldCents, usd(24_000));
    /* Estimated federal tax on $100k single is $16,712 — LESS than the $24,000 withheld. */
    assert.equal(line.federalEstimatedTaxCents, usd(16_712));
    assert.equal(line.federalAdditionalCents, 0, "additional tax is clamped at zero, never negative");
    assert.equal(line.federalOverWithheld, true);
    assert.equal(line.stateWithheldCents, usd(4_000));
    assert.equal(line.stateAdditionalCents, 0);
    assert.equal(line.stateOverWithheld, true);
    /* The refund is NOT added back: net is gross minus everything actually withheld. */
    assert.equal(line.estimatedNetCents, usd(72_000));
  });

  test("the withholding threshold is a strict 'more than $5,000'", () => {
    assert.equal(FEDERAL_WITHHOLDING_THRESHOLD_USD, 5_000);
    assert.equal(FEDERAL_WITHHOLDING_RATE, 0.24);
    assert.equal(federalWithholdingCents(usd(5_000)), 0, "exactly $5,000 is not withheld");
    assert.equal(federalWithholdingCents(usd(5_000.01)), Math.round(usd(5_000.01) * 0.24));
  });

  test("the annuity schedule: 30 payments, 5% graduated, summing EXACTLY to the advertised jackpot", () => {
    assert.equal(ANNUITY_YEARS, 30);
    assert.equal(ANNUITY_ESCALATION, 1.05);
    const advertised = usd(100_000_000);
    const payments = annuityPaymentsCents(advertised);
    assert.equal(payments.length, 30);
    /* Hand-computed: first = advertised / ((1.05^30 − 1)/0.05) = $1,505,143.51. */
    assert.equal(payments[0], usd(1_505_143.51));
    /* Each payment is 5% larger than the last (the final one absorbs the closing rounding). */
    for (let i = 1; i < 29; i += 1) {
      assert.ok(Math.abs(payments[i] - payments[i - 1] * 1.05) < 5,
        `payment ${i + 1} escalates 5% over payment ${i}`);
    }
    assert.equal(payments.reduce((a, b) => a + b, 0), advertised, "the schedule closes exactly");

    const schedule = annuitySchedule(advertised, "single", stateTaxRecord("fl")!);
    const totals = annuityTotals(schedule);
    assert.equal(totals.grossCents, advertised);
    /* Hand check: 30 smaller payments keep more money in the lower brackets than one lump sum would. */
    const lump = taxLine(advertised, "single", stateTaxRecord("fl")!);
    assert.ok(totals.estimatedNetCents > lump.estimatedNetCents,
      "taxing 30 smaller payments nets more than taxing the whole advertised figure at once");
  });

  test("the assumed cash ratio applies ONLY when no published cash value exists, and is flagged", () => {
    assert.equal(ASSUMED_CASH_RATIO, 0.5);
    const assumed = computeTaxScenario({
      advertisedCents: usd(100_000_000), cashValueCents: null, filingStatus: "single", stateCode: null,
    });
    assert.equal(assumed.cash.cashValueAssumed, true);
    assert.equal(assumed.cash.line.grossCents, usd(50_000_000));

    const published = computeTaxScenario({
      advertisedCents: usd(100_000_000), cashValueCents: usd(46_300_000), filingStatus: "single", stateCode: null,
    });
    assert.equal(published.cash.cashValueAssumed, false);
    assert.equal(published.cash.line.grossCents, usd(46_300_000));
  });

  test("the bracket engine agrees with an independent per-bracket summation for every filing status", () => {
    /* A second implementation of the same table, written differently, over a spread of amounts. */
    for (const { key } of FILING_STATUSES) {
      for (const amount of [1_000, 12_400, 50_400, 105_700, 250_000, 640_600, 1_000_000, 50_000_000]) {
        let expected = 0;
        let lower = 0;
        for (const b of FEDERAL_BRACKETS_2026[key]) {
          const upper = b.upToUsd === null ? Number.POSITIVE_INFINITY : b.upToUsd * 100;
          const span = Math.min(usd(amount), upper) - lower;
          if (span <= 0) break;
          expected += Math.round(span * b.rate);
          lower = upper;
        }
        assert.equal(federalIncomeTaxCents(usd(amount), key), expected, `${key} @ $${amount}`);
      }
    }
  });

  test("formatting and parsing round-trip without drifting a cent", () => {
    assert.equal(formatUsdCents(usd(1_505_143.51)), "$1,505,143.51");
    assert.equal(formatUsdWhole(usd(457_000_000)), "$457,000,000");
    assert.equal(parseUsdToCents("457,000,000"), usd(457_000_000));
    assert.equal(parseUsdToCents("$1.5"), 150);
    assert.equal(parseUsdToCents("20000.25"), usd(20_000.25));
    assert.equal(parseUsdToCents("abc"), null);
    assert.equal(parseUsdToCents("1.234"), null, "more than two decimal places is not money input");
    assert.equal(parseUsdToCents(""), null);
  });
});

/* ══════════════════════════════════════════════════════════════════ 2. §20 — all eight disclosures */

describe("BP-05C §20: every financial-tool disclosure item exists and is rendered", () => {
  const SAMPLE_FIGURE_SOURCE =
    "The prefilled figure is a worked example for this test, not a current jackpot — a stand-in provenance sentence.";
  const disclosures = taxDisclosures(SAMPLE_FIGURE_SOURCE);

  test("exactly the eight §20 items, in the blueprint's order", () => {
    assert.deepEqual(disclosures.map((d) => d.key), [
      "effective-tax-year",           /* §20: effective tax year */
      "filing-status-assumptions",    /* §20: filing status assumptions */
      "state-residency-assumptions",  /* §20: state/residency assumptions */
      "jurisdiction-caveat",          /* §20: purchase/claim jurisdiction caveat */
      "jackpot-cash-value-source",    /* §20: jackpot and cash-value source */
      "estimate-only",                /* §20: estimate-only disclosure */
      "professional-advice",          /* §20: professional-advice recommendation */
      "review-owner",                 /* §20: review owner */
    ]);
    for (const d of disclosures) {
      assert.ok(d.label.length > 3, `${d.key} has a reader-facing label`);
      assert.ok(d.text.length > 60, `${d.key} carries real substance, not a checkbox`);
    }
  });

  test("the substance matches the requirement each item exists for", () => {
    const byKey = new Map(disclosures.map((d) => [d.key, d.text]));
    assert.match(byKey.get("effective-tax-year")!, new RegExp(String(EFFECTIVE_TAX_YEAR)));
    assert.match(byKey.get("filing-status-assumptions")!, /only taxable income/);
    assert.match(byKey.get("state-residency-assumptions")!, /live in the state you selected/);
    assert.match(byKey.get("jurisdiction-caveat")!, /bought and where the prize is claimed/);
    assert.equal(byKey.get("jackpot-cash-value-source"), SAMPLE_FIGURE_SOURCE,
      "item 5 is the prefill's own provenance sentence, passed through verbatim");
    assert.equal(byKey.get("estimate-only"), TAX_DISCLAIMER);
    assert.match(byKey.get("professional-advice")!, /not tax advice/);
    assert.match(byKey.get("review-owner")!, new RegExp(REVIEW_OWNER.slice(0, 30)));
  });

  test("the disclaimer says estimates, names the exclusions, and points at the lottery and a professional", () => {
    assert.match(TAX_DISCLAIMER, /estimates/i);
    assert.match(TAX_DISCLAIMER, /deductions/);
    assert.match(TAX_DISCLAIMER, /local taxes/);
    assert.match(TAX_DISCLAIMER, /offset/);
    assert.match(TAX_DISCLAIMER, /verify the numbers with the lottery and a qualified tax professional/);
  });

  test("the page renders every item — the component maps the same list and stamps each key", () => {
    const page = src("components/tools/TaxCalculatorPage.tsx");
    assert.match(page, /taxDisclosures\(prefill\.figureSource\)/);
    assert.match(page, /data-disclosure-count=\{disclosures\.length\}/);
    assert.match(page, /data-disclosure-item=\{d\.key\}/);
    assert.match(page, /\{disclosures\.map\(/);
    /* The disclosure block is a protected zone: nothing may interrupt it. */
    assert.match(page, /sectionId: "TL-03"[\s\S]{0,200}protectedZone: true/);
  });
});

/* ══════════════════════════════════════════════════════════════════ 3. language — estimates only */

describe("Constitution §7: estimates only — never 'you will owe', never a certainty claim", () => {
  test("no tools source contains 'you will owe', an odds claim, or manipulative urgency", () => {
    for (const p of TOOLS_SOURCES) {
      const c = code(p);
      assert.doesNotMatch(c, /you will owe/i, `${p} must never assert a liability`);
      assert.doesNotMatch(c, /you'?ll owe/i, `${p} must never assert a liability`);
      assert.doesNotMatch(c, /increase your (chances|odds)/i, p);
      assert.doesNotMatch(c, /guaranteed/i, p);
      assert.doesNotMatch(c, /act now|don'?t miss|hurry/i, p);
    }
  });

  test("every computed money line the reader sees is labelled estimated, and the H1 promise matches", () => {
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, />Estimated net<\/dt>/);
    assert.match(tool, /Estimated additional federal tax/);
    assert.match(tool, /Estimated additional \{stateName\} tax/);
    assert.match(tool, /Estimated after-tax value of/);
    for (const text of [TAX_DISCLAIMER, ...TAX_METHODOLOGY, ...taxDisclosures("x").map((d) => d.text)]) {
      assert.doesNotMatch(text, /you will owe/i);
    }
  });

  test("no single blended rate: the methodology names the bracket-by-bracket computation", () => {
    assert.ok(TAX_METHODOLOGY.length >= 4, "federal, state, annuity and cash option are each explained");
    assert.match(TAX_METHODOLOGY[0], /bracket by bracket/);
    assert.match(TAX_METHODOLOGY[0], /never one blended percentage/);
    assert.match(TAX_METHODOLOGY[2], /30 graduated yearly payments/);
    assert.match(TAX_METHODOLOGY[3], /labels the assumption/);
  });
});

/* ══════════════════════════════════════════════════════════════════ 4. protected flow — no ads */

describe("CLAUDE.md §12: no ad exists in this family, and nothing sits between input and output", () => {
  test("no tools source imports or renders any advertising artifact", () => {
    for (const p of TOOLS_SOURCES) {
      const c = code(p);
      assert.doesNotMatch(c, /components\/ads|AdSlot|AdAnchor|adSlotDefinitions|googletag|adsbygoogle/, p);
      assert.doesNotMatch(c, /data-ad-/, p);
    }
  });

  test("input and output live inside ONE protected section; the server bands slot after it", () => {
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    const sectionStart = tool.indexOf('data-section-id="TL-02"');
    const formAt = tool.indexOf("<form", sectionStart);
    const resultsAt = tool.indexOf('className="lct-results"', formAt);
    const sectionEnd = tool.indexOf("</section>", sectionStart);
    const childrenAt = tool.indexOf("{children}", sectionEnd);
    const saveAt = tool.indexOf('data-section-id="TL-07"', childrenAt);
    assert.ok(sectionStart > -1 && formAt > -1 && resultsAt > -1, "form and results exist");
    assert.ok(formAt < resultsAt && resultsAt < sectionEnd,
      "the inputs and the results render inside the same TL-02 section — nothing can be inserted between");
    assert.ok(childrenAt > sectionEnd, "the server-rendered bands slot AFTER the complete tool");
    assert.ok(saveAt > childrenAt, "the save control comes last (§16: result before save)");
    assert.match(tool, /data-protected-zone="true"/);
  });

  test("the calculator's ad tier is declared 'none', with the reason recorded", () => {
    const tax = toolManifest().find((t) => t.id === "lottery-tax-calculator")!;
    assert.match(tax.adTier, /^None\./);
    assert.match(tax.adTier, /protected zone/);
  });
});

/* ══════════════════════════════════════════════════════════════════ 5. no purchase CTA */

describe("Constitution A.9: the §16 Buy step is SUPPRESSED — no purchase pressure anywhere", () => {
  test("no tools source references the commerce resolver or any buy control", () => {
    for (const p of TOOLS_SOURCES) {
      const c = code(p);
      assert.doesNotMatch(c, /buynow/i, `${p} must not route to commerce`);
      assert.doesNotMatch(c, /buy tickets|buy now|play now/i, p);
      assert.doesNotMatch(c, /data-buy|BuyButton|PlayCta/, p);
    }
  });

  test("no related link and no manifest string reaches a commerce route", () => {
    for (const tool of toolManifest()) {
      for (const loc of tool.locations) {
        assert.ok(!loc.href.startsWith("/buynow"), `${tool.id} links ${loc.href}`);
      }
    }
    const page = src("components/tools/TaxCalculatorPage.tsx");
    assert.match(page, /NO purchase CTA of any kind/, "the suppression is recorded where it applies");
  });
});

/* ══════════════════════════════════════════════════════════════════ 6. access — public estimate, gated save */

describe("BP-05C §11 + FD-ACC-02: one complete public estimate; ONLY saving is gated; no Insider anything", () => {
  test("the computation path reads no session — the estimate cannot be gated even by accident", () => {
    for (const p of ["lib/tools/taxCalculator.ts", "lib/tools/taxTables2026.ts", "lib/tools/taxCalculatorModel.ts"]) {
      const c = code(p);
      assert.doesNotMatch(c, /useAccountSession|lib\/account|@\/lib\/account/, `${p} must stay session-free`);
    }
    /* And the pure function genuinely completes with no context at all. */
    const line = computeTaxScenario({
      advertisedCents: usd(20_000), cashValueCents: null, filingStatus: "headOfHousehold", stateCode: "pa",
    });
    assert.ok(line.cash.line.estimatedNetCents > 0);
    assert.equal(line.annuity.schedule.length, 30);
  });

  test("the save control offers the shared sign-in affordance signed out, and a real save signed in", () => {
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, /import SignInToUse from "@\/components\/account\/SignInToUse"/);
    assert.match(tool, /data-save-scenario="signed-out"/);
    assert.match(tool, /data-save-scenario="signed-in"/);
    /* The FD-ACC-13 continuation returns to the save anchor, not to a generic page. */
    assert.match(tool, /returnTo: `\$\{TAX_CALCULATOR_PATH\}#\$\{SAVE_ANCHOR\}`/);
    /* The session read gates ONLY the save area: it appears after the results markup. */
    const sessionUse = tool.indexOf("useAccountSession()");
    assert.ok(sessionUse > -1);
    const gateAt = tool.indexOf("{session ? (");
    const resultsAt = tool.indexOf('className="lct-results"');
    assert.ok(gateAt > resultsAt, "the session branch belongs to TL-07, below the public results");
  });

  test("no Insider concept: no tools code, type, copy or manifest row can express one (FD-ACC-02)", () => {
    for (const p of TOOLS_SOURCES) {
      assert.doesNotMatch(code(p), /insider/i, `${p} must not carry an Insider concept`);
      assert.doesNotMatch(code(p), /premium|paid tier|upgrade to|subscription/i, p);
    }
    for (const tool of toolManifest()) {
      assert.ok(["publicComplete", "publicPreview", "signedIn"].includes(tool.access),
        `${tool.id}: the access type has exactly three values — Insider is not expressible`);
      assert.doesNotMatch(tool.signedInValue, /insider|premium|export/i,
        `${tool.id}: sign-in value is continuity, never a paid tier`);
    }
  });

  test("the tax calculator's §11 row: public = one complete estimate, sign-in = saved scenarios", () => {
    const tax = toolManifest().find((t) => t.id === "lottery-tax-calculator")!;
    assert.equal(tax.access, "publicComplete");
    assert.match(tax.publicScope, /One complete estimate/);
    assert.match(tax.signedInValue, /Save scenarios/);
    assert.match(tax.saveObject!, /Tax scenario/);
  });

  test("the state is chosen by the reader — never IP, never a location API", () => {
    for (const p of TOOLS_SOURCES) {
      const c = code(p);
      assert.doesNotMatch(c, /geolocation|ipapi|ip-api|x-forwarded-for|request\.ip|headers\(\)/i, p);
    }
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, /useState<string>\(""\)/, "the state control starts unselected");
    assert.match(tool, /we never guess your state from your connection/);
    assert.equal(stateOptions().length, STATE_TAX_2026.length, "every recorded state is offered, manually");
  });
});

/* ══════════════════════════════════════════════════════════════════ 7. §7 context transfer */

describe("BP-05C §7: ?game= is UI context — the canonical never moves", () => {
  test("a served flagship game prefills; anything else degrades to the default worked example", () => {
    const pb = taxCalculatorPrefill("powerball");
    assert.equal(pb.gameSlug, "powerball");
    assert.ok(pb.advertisedCents > 0);
    assert.match(pb.figureSource, /Powerball data layer/);
    assert.match(pb.figureSource, /verify against the game's official page/,
      "review-mode figures disclose that they are preview data");

    for (const bogus of [null, "no-such-game", "fl", "POWERBALL/../../etc", "lottery-tax-calculator"]) {
      const fallback = taxCalculatorPrefill(bogus);
      assert.equal(fallback.gameSlug, null, `"${bogus}" degrades silently to the default example`);
      assert.equal(fallback.advertisedCents, usd(100_000_000));
      assert.match(fallback.figureSource, /worked example, not a current jackpot/);
    }
  });

  test("the metadata function takes NO parameters, so a query variant cannot mint a second canonical", () => {
    assert.equal(taxCalculatorMetadata.length, 0);
    assert.equal(toolsHubMetadata.length, 0);
    const meta = taxCalculatorMetadata();
    assert.equal(meta.alternates?.canonical, canonicalUrl(TAX_CALCULATOR_PATH));
    assert.equal(meta.alternates?.canonical, "https://www.lotterycorner.com/tools/tax-calculator");
  });

  test("the game pages hand context over with a plain link, not a CTA block", () => {
    const tracker = src("components/flagship/tools/FlagshipJackpotTracker.tsx");
    assert.match(tracker, /href=\{`\/tools\/tax-calculator\?game=\$\{gameSlug\}`\}/);
    assert.match(tracker, /data-tool-ramp="tax-calculator"/);
    /* The flagship tool row now names the real route, and the registry genuinely serves it. */
    for (const cfg of FLAGSHIP_GAMES) {
      const tax = flagshipTools(cfg).find((t) => t.key === "tax-calculator")!;
      assert.equal(tax.route, TAX_CALCULATOR_PATH);
      assert.equal(tax.availability, "available");
      assert.equal(servesPage("tools", tax.route!), true);
    }
  });

  test("the recorded exit ramps in the review corpora resolve to the served route", () => {
    const news = getNewsData().articles.flatMap((a) => [a.primaryAction, ...a.relatedNextActions]);
    const blog = getBlogData().posts.flatMap((p) => p.relatedLinks ?? []);
    const taxLinks = [...news, ...blog].filter((l) => l.href.includes("/tools/tax-calculator"));
    assert.ok(taxLinks.length >= 2, "the news and blog ramps the task recorded exist");
    for (const l of taxLinks) {
      assert.equal(servesPage("tools", l.href.split("?")[0].split("#")[0]), true, l.href);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ 8. the hub — no dead links */

describe("FD-DAT-17: the hub lists only genuinely available tools, and every href resolves", () => {
  /* The set of paths this build genuinely serves: the registry inventory plus the static trust pages. */
  const servedPaths = new Set<string>(routeInventory().map((r) => r.route));
  for (const staticPath of ["/corrections-policy", "/ai-policy", "/affiliate-disclosure"]) {
    assert.ok(existsSync(new URL(`../app${staticPath}/page.tsx`, import.meta.url)),
      `${staticPath} is a real static route`);
    servedPaths.add(staticPath);
  }

  test("every manifest location's path is served, and hosted tools carry their governed fragment", () => {
    for (const tool of toolManifest()) {
      assert.ok(tool.locations.length > 0, `${tool.id} runs somewhere real`);
      for (const loc of tool.locations) {
        const [path, fragment] = loc.href.split("#");
        assert.ok(servedPaths.has(path), `${tool.id}: ${path} must be a registered route`);
        if (tool.route === null) {
          assert.ok(fragment && fragment.length > 0,
            `${tool.id}: a hosted tool links to the section where it runs, not just the page`);
        }
        assert.ok(loc.label.length > 0);
      }
    }
  });

  test("no 'coming soon', no placeholder, no dead category", () => {
    for (const p of ["components/tools/ToolsHubPage.tsx", "lib/tools/toolManifest.ts"]) {
      assert.doesNotMatch(code(p), /coming soon|placeholder|not yet available|stay tuned/i, p);
    }
    for (const tool of toolManifest()) {
      for (const text of [tool.name, tool.purpose, tool.publicScope, tool.signedInValue, tool.output]) {
        assert.doesNotMatch(text, /coming soon/i, tool.id);
      }
    }
    /* A category renders only when at least one available tool populates it. */
    const cats = availableCategories();
    for (const c of cats) {
      assert.ok(toolsInCategory(c).length > 0, `${c} would be an empty band`);
    }
    /* T-C5 (Personal and AI) and T-C6 (Planning) have no shipped tool in this build — they must be absent. */
    assert.ok(!cats.includes("T-C5"), "no AI tool is connected, so the category is absent, not promised");
    assert.ok(!cats.includes("T-C6"), "no planning tool exists, so the category is absent, not promised");
    assert.equal(Object.keys(TOOL_CATEGORY_LABELS).length, 6, "the §4 vocabulary still knows all six");
  });

  test("every §18 manifest field is genuinely filled for every tool", () => {
    for (const tool of toolManifest()) {
      assert.ok(tool.id && tool.name && tool.purpose.length > 10, tool.id);
      assert.ok(tool.supportedGames.length > 0, tool.id);
      assert.ok(tool.requiredInputs.length > 0, tool.id);
      assert.match(tool.deterministicService, /lib\//, `${tool.id} names its deterministic module`);
      assert.ok(tool.aiRole.length > 10, `${tool.id} states its AI role honestly`);
      assert.ok(tool.output.length > 10, tool.id);
      assert.ok(tool.sourceAndDataPeriod.length > 10, tool.id);
      assert.ok(tool.ruleEraBehavior.length > 10, tool.id);
      assert.ok(tool.adTier.length > 5, tool.id);
      assert.ok(tool.metrics.length > 0, tool.id);
      assert.ok(tool.states.length > 0, tool.id);
    }
  });

  test("the standalone Tax Calculator is the only tool with its own route in this build", () => {
    const withRoutes = toolManifest().filter((t) => t.route !== null);
    assert.deepEqual(withRoutes.map((t) => t.route), [TAX_CALCULATOR_PATH]);
  });
});

/* ══════════════════════════════════════════════════════════════════ 9. registry, noindex, canonical */

describe("FD-GATE-01 + Conflict 42: registry-gated, noindex, standalone canonicals, no redirect", () => {
  test("the tools registry enumerates exactly two routes, and servesPage delegates to it", () => {
    assert.deepEqual(TOOLS_REGISTRY.map((e) => e.route), [TOOLS_HUB_PATH, TAX_CALCULATOR_PATH]);
    assert.equal(isToolsRouteServed("/tools"), true);
    assert.equal(isToolsRouteServed("/tools/tax-calculator"), true);
    assert.equal(isToolsRouteServed("/tools/jackpot-after-tax"), false, "a §5 concept is not a route");
    assert.equal(isToolsRouteServed("/lottery-tax-calculator"), false, "the legacy URL is not this app's");
    assert.equal(servesPage("tools", "/tools"), true);
    assert.equal(servesPage("tools", "/tools/nonsense"), false);
    const rows = routeInventory().filter((r) => r.family === "tools");
    assert.deepEqual(rows.map((r) => [r.route, r.blueprint]), [
      ["/tools", "BP-05C"], ["/tools/tax-calculator", "BP-05C"],
    ]);
  });

  test("both app routes gate on the registry and 404 when unserved", () => {
    for (const p of ["app/tools/page.tsx", "app/tools/tax-calculator/page.tsx"]) {
      const c = src(p);
      assert.match(c, /servesPage\("tools"/, p);
      assert.match(c, /notFound\(\)/, p);
      assert.match(c, /return \{\};/, `${p} serves no metadata for an unserved route`);
    }
    /* No third tools page has been invented on disk. */
    const entries = readdirSync(new URL("../app/tools", import.meta.url));
    assert.deepEqual(entries.sort(), ["page.tsx", "tax-calculator"]);
  });

  test("Conflict 42: the blueprint route is served, the legacy route is untouched, nothing redirects", () => {
    assert.ok(!existsSync(new URL("../app/lottery-tax-calculator", import.meta.url)),
      "the legacy URL must not exist in this app before the launch redirect map");
    for (const p of ["next.config.ts", "next.config.mjs", "next.config.js"]) {
      const url = new URL(`../${p}`, import.meta.url);
      if (existsSync(url)) {
        assert.doesNotMatch(readFileSync(url, "utf8"), /lottery-tax-calculator|tools\/tax-calculator/,
          `${p} must not carry a tools redirect — Conflict 42 says nothing redirects today`);
      }
    }
    assert.match(src("lib/tools/toolsRegistry.ts"), /Conflict 42/,
      "the interim authority is recorded where the routes are declared");
  });

  test("both routes are noindex/nofollow with self-referencing www canonicals and evergreen OG", () => {
    for (const [meta, path, title, description] of [
      [toolsHubMetadata(), TOOLS_HUB_PATH, TOOLS_HUB_TITLE, TOOLS_HUB_DESCRIPTION],
      [taxCalculatorMetadata(), TAX_CALCULATOR_PATH, TAX_CALCULATOR_TITLE, TAX_CALCULATOR_DESCRIPTION],
    ] as const) {
      assert.deepEqual(meta.robots, { index: false, follow: false }, path);
      assert.equal(meta.alternates?.canonical, `https://www.lotterycorner.com${path}`);
      assert.deepEqual(meta.title, { absolute: title });
      assert.equal(meta.description, description);
      assert.equal(meta.openGraph?.url, meta.alternates?.canonical, "OG and canonical agree");
      /* §24: the evergreen preview never carries an amount or a computed net. */
      assert.doesNotMatch(String(meta.openGraph?.description), /\$[\d,]/, path);
    }
    /* The two identities are distinct — no duplicate title/description across the family. */
    assert.notEqual(TOOLS_HUB_TITLE, TAX_CALCULATOR_TITLE);
    assert.notEqual(TOOLS_HUB_DESCRIPTION, TAX_CALCULATOR_DESCRIPTION);
    assert.notEqual(TOOLS_HUB_H1, TAX_CALCULATOR_H1);
  });

  test("no sitemap exists to advertise a noindex URL (PUBLICATION_SAFETY continues)", () => {
    assert.ok(!existsSync(new URL("../app/sitemap.ts", import.meta.url)));
    assert.ok(!existsSync(new URL("../app/sitemap.xml", import.meta.url)));
  });

  test("schema stays inside what is visible: no WebApplication, no FAQ, no invented types", () => {
    const calc = JSON.stringify(taxCalculatorSchema());
    assert.match(calc, /"WebPage"/);
    assert.match(calc, /"BreadcrumbList"/);
    for (const forbidden of ["WebApplication", "SoftwareApplication", "FAQPage", "Dataset", "SearchAction"]) {
      assert.ok(!calc.includes(forbidden), `calculator schema must not claim ${forbidden}`);
    }
    const hub = toolsHubSchema([{ name: "X", href: "/powerball#check-numbers" }]);
    const hubJson = JSON.stringify(hub);
    assert.match(hubJson, /"CollectionPage"/);
    assert.match(hubJson, /"ItemList"/);
    /* Fragments and queries never enter schema URLs. */
    const list = (hub["@graph"] as { "@type": string; itemListElement?: { url: string }[] }[])
      .find((n) => n["@type"] === "ItemList")!;
    assert.equal(list.itemListElement![0].url, "https://www.lotterycorner.com/powerball");
  });
});

/* ══════════════════════════════════════════════════════════════════ 10. dated citations */

describe("the research spec's trust markers: every tax figure carries a dated, named source", () => {
  test("the federal table citation is dated, named, and printed on the page", () => {
    assert.match(FEDERAL_TABLE_CITATION, /Rev\. Proc\. 2025-32/);
    assert.match(FEDERAL_TABLE_CITATION, /rates as of/);
    assert.match(RATES_AS_OF_ISO, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(FEDERAL_TABLE_SOURCE.asOfIso, RATES_AS_OF_ISO);
    assert.match(FEDERAL_TABLE_SOURCE.url, /^https:\/\/www\.irs\.gov\//);
    const page = src("components/tools/TaxCalculatorPage.tsx");
    assert.match(page, /FEDERAL_TABLE_CITATION/);
    assert.match(page, /FEDERAL_TABLE_SOURCE\.name/);
  });

  test("every state row: a per-state source URL, an as-of date, and a substantive note", () => {
    assert.ok(STATE_TAX_2026.length >= 45, "the dropdown covers the states this build recorded");
    const seen = new Set<string>();
    for (const s of STATE_TAX_2026) {
      assert.match(s.code, /^[a-z]{2}$/, s.name);
      assert.ok(!seen.has(s.code), `${s.code} appears once`);
      seen.add(s.code);
      assert.match(s.sourceUrl, /^https:\/\//, `${s.name} cites a real source`);
      assert.match(s.asOfIso, /^\d{4}-\d{2}-\d{2}$/, s.name);
      assert.ok(s.note.length > 20, `${s.name} explains its own quirks`);
      assert.ok(s.withholdingRate >= 0 && s.withholdingRate < 0.15, s.name);
      assert.ok(s.topRate >= 0 && s.topRate < 0.15, s.name);
      assert.ok(["recorded", "verify"].includes(s.status), s.name);
    }
    /* Ordered by name, because that is how a dropdown is read. D.C. sits at its conventional
       "District of Columbia" position even though its display name says "Washington D.C.". */
    const sortName = (s: { code: string; name: string }) =>
      s.code === "dc" ? "District of Columbia" : s.name;
    const names = STATE_TAX_2026.map(sortName);
    assert.deepEqual([...names], [...names].sort((a, b) => a.localeCompare(b)));
  });

  test("rows pending founder verification are SHOWN as provisional, never silently trusted", () => {
    assert.ok(statesNeedingVerification().length > 0,
      "the honest state of the table: several rows still carry conflicting publications");
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, /data-rate-status="verify"/);
    assert.match(tool, /provisional/);
    /* The table header records the founder gate; the review owner is named. */
    assert.match(src("lib/tools/taxTables2026.ts"), /RATES REQUIRE FOUNDER VERIFICATION/);
    assert.match(REVIEW_OWNER, /re-verified against the cited sources/);
    /* And the state note plus its source render beside the result. */
    assert.match(tool, /\{stateRecord\.note\}/);
    assert.match(tool, /Source: \{stateRecord\.sourceUrl\} · recorded \{stateRecord\.asOfIso\}/);
  });

  test("no territory row was guessed at: PR and VI run their own prize-tax regimes", () => {
    assert.equal(stateTaxRecord("pr"), undefined);
    assert.equal(stateTaxRecord("vi"), undefined);
  });
});

/* ══════════════════════════════════════════════════════════════════ 11. composition and accessibility */

describe("BP-05C §16/§25: composition order, states, and the accessibility floor", () => {
  test("the required §16 flow, with the buy step suppressed: result → explainer bands → save", () => {
    const page = src("components/tools/TaxCalculatorPage.tsx");
    const order = ["TL-01", "TL-03", "TL-04", "TL-05", "TL-06"]
      .map((id) => page.indexOf(`sectionId: "${id}"`));
    assert.deepEqual([...order], [...order].sort((a, b) => a - b), "the bands render in contract order");
    assert.ok(order.every((i) => i > -1));
    /* TL-02 and TL-07 live in the client tool, slotting the server bands between them (asserted above). */
    assert.match(page, /<TaxCalculatorTool prefill=\{prefill\} states=\{stateOptions\(\)\}>/);
  });

  test("every rendered section id has a Section Intelligence entry with a recorded decision", () => {
    for (const id of ["TH-01", "TH-C1", "TH-C2", "TH-C3", "TH-C4", "TH-02", "TH-03"]) {
      const e = sectionIntelligence("tools", id);
      assert.ok(e, `tools:${id} is in the matrix`);
      assert.ok(e!.why.length > 20, `tools:${id} records why`);
    }
    for (const id of ["TL-01", "TL-02", "TL-03", "TL-04", "TL-05", "TL-06", "TL-07"]) {
      const e = sectionIntelligence("tools", id);
      assert.ok(e, `tools:${id} is in the matrix`);
    }
    /* The load-bearing decisions: the computation is deterministic, never labelled AI (FD-DAT-20). */
    assert.equal(sectionIntelligence("tools", "TL-02")!.decision, "deterministic");
    assert.equal(sectionIntelligence("tools", "TL-05")!.decision, "curated");
  });

  test("results are announced (§25), inputs are labelled, and number entry is mobile-friendly", () => {
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, /role="status" aria-live="polite"/);
    assert.match(tool, /inputMode="decimal"/);
    assert.match(tool, /htmlFor="lct-amount"/);
    assert.match(tool, /htmlFor="lct-state"/);
    assert.match(tool, /htmlFor="lct-status"/);
    assert.match(tool, /role="radiogroup" aria-label="Lump sum or annuity"/);
    /* The schedule table is a real table with scoped headers and a caption. */
    assert.match(tool, /<caption className="lct-vh">/);
    assert.match(tool, /<th scope="col">Year<\/th>/);
    assert.match(tool, /<th scope="row">\{row\.year\}<\/th>/);
  });

  test("the schedule table scrolls inside its own container — the page body never scrolls sideways", () => {
    const css = src("app/globals.css");
    assert.match(css, /\.lct-tablewrap \{ overflow-x: auto/);
    assert.match(css, /\.lct-table \{[^}]*min-width: 560px/s);
    /* Inputs and buttons hold the 44px floor. */
    assert.match(css, /\.lct-input \{\s*width: 100%; min-height: 48px/);
    assert.match(css, /\.lct-toggle \{[^}]*min-height: 44px/s);
    assert.match(css, /\.lct-btn \{\s*min-height: 48px/);
    /* Visible focus for every interactive element in the family. */
    assert.match(css, /\.lct a:focus-visible, \.lct button:focus-visible, \.lct input:focus-visible/);
  });

  test("the empty state exists and asks for an amount instead of rendering broken columns", () => {
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, /data-outcome="empty"/);
    assert.match(tool, /Enter a prize amount above/);
    /* And the no-state case is an honest line, not a zero pretending to be a computed figure. */
    assert.match(tool, /data-line="state-unselected"/);
    assert.match(tool, /Choose a state above to include it/);
  });

  test("the server-rendered default example exists, so the tool is never met empty", () => {
    const dflt = taxCalculatorPrefill(null);
    assert.equal(dflt.advertisedCents, usd(100_000_000));
    assert.equal(dflt.gameSlug, null);
    /* The tool's initial state derives from the prefill, so the first (server) render carries figures. */
    const tool = src("components/tools/TaxCalculatorTool.tsx");
    assert.match(tool, /useState\(\(\) => formatUsdWhole\(prefill\.advertisedCents\)/);
  });

  test("both pages stamp the family and its authority on <main>", () => {
    for (const p of ["components/tools/ToolsHubPage.tsx", "components/tools/TaxCalculatorPage.tsx"]) {
      assert.match(src(p), /data-page-family="tools" data-authority="BP-05C"/, p);
    }
  });
});
