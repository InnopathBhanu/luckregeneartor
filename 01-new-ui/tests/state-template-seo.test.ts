/*
 * FOCUSED TESTS for the final State template — LRG-STATE-043.
 *
 * Scoped to what this task introduced: the JSON configuration and its validator, configuration-driven
 * metadata, the canonical, the conservative JSON-LD graph, sitemap readiness and the favicon audit. Existing
 * suites already cover the visual composition, the bands, the ads and Home.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import {
  validateStateViewConfig, lowerPageContentFrom, SUPPORTED_SCHEMA_VERSION,
} from "../lib/state/stateViewConfig";
import { FLORIDA_VIEW_CONFIG, FLORIDA_LOWER_PAGE_CONTENT } from "../lib/state/floridaLowerPageContent";
import { stateViewConfigFor, configuredStateCodes } from "../lib/state/stateViewConfigRegistry";
import { PRODUCTION_ORIGIN, WEBSITE_ID, ORGANIZATION_ID, canonicalUrl } from "../lib/seo/productionOrigin";
import { stateHubGraph, PROHIBITED_STATE_HUB_TYPES } from "../lib/seo/stateHubSchema";
import { sitemapEntries, isSitemapExcluded } from "../lib/seo/sitemapEntries";

const CONFIG_PATH = new URL("../config/states/fl.json", import.meta.url);
const RAW = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as Record<string, unknown>;
const clone = () => JSON.parse(JSON.stringify(RAW)) as Record<string, unknown>;

describe("LRG-STATE-043: the Florida JSON configuration", () => {
  test("loads, validates and supplies the whole lower page", () => {
    assert.equal(FLORIDA_VIEW_CONFIG.schemaVersion, SUPPORTED_SCHEMA_VERSION);
    assert.equal(FLORIDA_VIEW_CONFIG.state.code, "fl");
    assert.equal(FLORIDA_VIEW_CONFIG.state.name, "Florida");
    assert.equal(FLORIDA_VIEW_CONFIG.state.timezone, "America/New_York");
    assert.equal(FLORIDA_VIEW_CONFIG.state.minimumLotteryAge, 18);
    /* The approved counts, now coming from configuration rather than from JSX. */
    const c = FLORIDA_LOWER_PAGE_CONTENT;
    assert.equal(c.exploreItems.length, 4);
    assert.equal(c.newsItems.length, 4);
    assert.equal(c.guideItems.length, 3);
    assert.equal(c.discussionItems.length, 3);
    assert.equal(c.resourceItems.length, 5);
    assert.ok(c.trustCopy.length > 40 && c.independenceCopy.length > 40);
  });

  test("an unknown schemaVersion fails clearly", () => {
    const bad = clone(); bad.schemaVersion = "2.0";
    assert.throws(() => validateStateViewConfig(bad, "x.json"),
      /"schemaVersion" is "2.0" but this build supports only "1.0"/);
  });

  test("missing or malformed identity and SEO fields fail, naming path and field", () => {
    for (const [mutate, pattern] of [
      [(c: Record<string, unknown>) => { delete (c.state as Record<string, unknown>).code; }, /state\.code" is missing/],
      [(c: Record<string, unknown>) => { (c.state as Record<string, unknown>).code = "FLA"; }, /state\.code" must be a two-letter/],
      [(c: Record<string, unknown>) => { delete (c.state as Record<string, unknown>).timezone; }, /state\.timezone" is missing/],
      [(c: Record<string, unknown>) => { delete (c.seo as Record<string, unknown>).title; }, /seo\.title" is missing/],
      [(c: Record<string, unknown>) => { delete (c.seo as Record<string, unknown>).description; }, /seo\.description" is missing/],
      [(c: Record<string, unknown>) => { (c.seo as Record<string, unknown>).canonicalPath = "fl"; }, /canonicalPath" must begin with "\/"/],
      [(c: Record<string, unknown>) => { (c.seo as Record<string, unknown>).canonicalPath = "/fl/"; }, /must not end with a trailing slash/],
      [(c: Record<string, unknown>) => { (c.seo as Record<string, unknown>).canonicalPath = "/fl#x"; }, /must not contain a fragment/],
    ] as const) {
      const bad = clone(); mutate(bad);
      assert.throws(() => validateStateViewConfig(bad, "config/states/fl.json"), pattern);
      assert.throws(() => validateStateViewConfig(bad, "config/states/fl.json"), /config\/states\/fl\.json/);
    }
  });

  test("duplicate content ids fail", () => {
    const bad = clone();
    const news = (bad.content as { news: { items: Record<string, unknown>[] } }).news.items;
    news[1].key = news[0].key;
    assert.throws(() => validateStateViewConfig(bad, "x.json"), /contains the duplicate id/);
  });

  test("a card destination cannot point outside LotteryCorner, and a resource must be https", () => {
    const bad = clone();
    (bad.content as { news: { items: Record<string, unknown>[] } }).news.items[0].destination =
      { kind: "route", href: "https://floridalottery.com/news" };
    assert.throws(() => validateStateViewConfig(bad, "x.json"), /not a LotteryCorner path/);
    const bad2 = clone();
    (bad2.content as { resources: { items: Record<string, unknown>[] } }).resources.items[0].href =
      "http://floridalottery.com";
    assert.throws(() => validateStateViewConfig(bad2, "x.json"), /must use an https official destination/);
  });

  test("runtime result data cannot be frozen into static configuration (JSON-03)", () => {
    /* The hazard: a jackpot or draw date copied into config becomes a stale fact shown as current. */
    const raw = readFileSync(CONFIG_PATH, "utf8");
    for (const banned of ["winningNumbers", "jackpotAmount", "cashValue", "drawDateIso", "lastUpdatedIso",
                          "currentStatus", "nextPrize", "resultDate"]) {
      assert.ok(!raw.includes(banned), `config must not carry runtime field "${banned}"`);
    }
    /* And the validator refuses it structurally, not just by review. */
    const bad = clone();
    (bad.content as { news: { items: Record<string, unknown>[] } }).news.items[0].jackpotAmount = "$435,000,000";
    assert.throws(() => validateStateViewConfig(bad, "x.json"), /runtime result data/);
  });

  test("no unfinished-looking public copy can be configured", () => {
    const bad = clone();
    (bad.content as { explore: { items: Record<string, unknown>[] } }).explore.items[0].copy = "Coming soon";
    assert.throws(() => validateStateViewConfig(bad, "x.json"), /must not contain the public phrase/);
  });

  test("the projection is total: every lower-page field comes from configuration", () => {
    const projected = lowerPageContentFrom(FLORIDA_VIEW_CONFIG);
    /* `claimVideo` is legitimately null for Florida — LRG-STATE-048 configured claim videos for the four
       new preview States only, and a null here means "this State owns no video", not a missing projection. */
    const NULLABLE = new Set(["claimVideo"]);
    for (const [k, v] of Object.entries(projected)) {
      if (NULLABLE.has(k)) continue;
      assert.ok(v !== undefined && v !== null && (typeof v !== "string" || v.length > 0),
        `${k} must be supplied by configuration`);
    }
    assert.ok("claimVideo" in projected, "the field is still projected, even when null");
  });
});

describe("LRG-STATE-043: generic components carry no Florida branch (JSON-06)", () => {
  test("no State component or the generic model names Florida or branches on its code", () => {
    const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const f of ["components/state/preview/sections/StateLowerBands.tsx",
                     "lib/state/stateLowerPageContent.ts",
                     "lib/state/stateViewConfig.ts",
                     "lib/seo/sitemapEntries.ts",
                     "lib/seo/stateHubSchema.ts"]) {
      const src = strip(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"));
      assert.ok(!/stateCode === "fl"|=== "fl"/.test(src), `${f} must not branch on a state code`);
      assert.ok(!/Florida|florida/.test(src), `${f} must not name Florida in code`);
    }
  });

  test("the six representative States are configured, and an unconfigured State resolves to nothing", () => {
    assert.deepEqual(configuredStateCodes().slice().sort(), ["ca", "fl", "md", "mi", "ut", "va"]);
    assert.equal(stateViewConfigFor("fl")?.state.code, "fl");
    assert.equal(stateViewConfigFor("ca")?.state.code, "ca");
    /* A State with a route and no configuration is the normal case, and it keeps the legacy template. */
    assert.equal(stateViewConfigFor("ny"), undefined);
    assert.equal(stateViewConfigFor("az"), undefined);
    assert.equal(stateViewConfigFor("FL")?.state.code, "fl", "lookup is case-insensitive");
  });
});

describe("LRG-STATE-043: canonical and origin", () => {
  /* FD-RTE-02/03 (ratified 2026-08-11): the single governed origin is the www no-trailing-slash form. */
  test("the governed origin is www with no trailing slash", () => {
    assert.equal(PRODUCTION_ORIGIN, "https://www.lotterycorner.com");
    assert.equal(canonicalUrl("/fl"), "https://www.lotterycorner.com/fl");
  });

  test("a local or preview host can never become a canonical value", () => {
    /* The origin is a constant, not a request header — which is the mechanism that makes this true. */
    const src = readFileSync(new URL("../lib/seo/productionOrigin.ts", import.meta.url), "utf8");
    assert.ok(!/localhost|127\.0\.0\.1|headers\(\)|request\.|process\.env/.test(src));
    assert.ok(canonicalUrl("/fl").startsWith("https://www.lotterycorner.com"));
  });

  test("canonicalUrl refuses a fragment, a relative path and a trailing slash", () => {
    assert.throws(() => canonicalUrl("fl"), /must begin with "\/"/);
    assert.throws(() => canonicalUrl("/fl#results"), /must not contain a fragment/);
    assert.equal(canonicalUrl("/fl/"), "https://www.lotterycorner.com/fl");
  });
});

describe("LRG-STATE-043: the State hub JSON-LD graph", () => {
  const graph = stateHubGraph({ config: FLORIDA_VIEW_CONFIG, dateModified: "2026-07-09T14:01:45-04:00" });
  const nodes = graph["@graph"] as Record<string, unknown>[];
  const page = nodes.find((n) => n["@type"] === "CollectionPage")!;
  const crumb = nodes.find((n) => n["@type"] === "BreadcrumbList")!;

  test("CollectionPage carries every required field, referencing the global nodes", () => {
    assert.equal(graph["@context"], "https://schema.org");
    assert.equal(page["@id"], "https://www.lotterycorner.com/fl#webpage");
    assert.equal(page.url, "https://www.lotterycorner.com/fl");
    assert.equal(page.inLanguage, "en-US");
    assert.equal(page.dateModified, "2026-07-09T14:01:45-04:00");
    assert.deepEqual(page.isPartOf, { "@id": WEBSITE_ID });
    assert.deepEqual(page.publisher, { "@id": ORGANIZATION_ID });
    assert.deepEqual(page.breadcrumb, { "@id": "https://www.lotterycorner.com/fl#breadcrumb" });
    /* The site suffix is not repeated inside the schema name. */
    assert.ok(!String(page.name).includes("| LotteryCorner"));
    /* The operator is a neutral subject, never the publisher — PF-02 §64 / FD-S-34. */
    assert.deepEqual(page.about, { "@type": "Thing", name: "Florida Lottery" });
  });

  test("dateModified is omitted rather than invented when no truthful signal exists", () => {
    const g = stateHubGraph({ config: FLORIDA_VIEW_CONFIG, dateModified: null });
    const p = (g["@graph"] as Record<string, unknown>[])[0];
    assert.ok(!("dateModified" in p), "no build or request timestamp is substituted");
  });

  test("the breadcrumb is Home then the State, with absolute canonical URLs", () => {
    const items = crumb.itemListElement as Record<string, unknown>[];
    assert.equal(items.length, 2);
    assert.deepEqual(items.map((i) => i.name), ["Home", "Florida Lottery Results"]);
    assert.deepEqual(items.map((i) => i.item),
      ["https://www.lotterycorner.com/", "https://www.lotterycorner.com/fl"]);
  });

  test("no prohibited schema type, and no ItemList until real routes exist", () => {
    const flat = JSON.stringify(graph);
    for (const t of PROHIBITED_STATE_HUB_TYPES) {
      assert.ok(!flat.includes(`"${t}"`), `SD-04 prohibits ${t} on a State hub`);
    }
    /* SD-03: the cards resolve to in-page anchors and inline previews today, which are not valid ItemList
       URLs, so the list is omitted rather than populated with anchors pretending to be pages. */
    assert.ok(!flat.includes('"ItemList"'));
    /* And FAQPage specifically, per the FAQ decision. */
    assert.ok(!flat.includes("FAQPage"));
  });
});

describe("LRG-STATE-043: sitemap readiness", () => {
  test("the guarded preview is excluded until the documented cutover", () => {
    assert.deepEqual(sitemapEntries(), [],
      "every configured State is preview-only, so all of them stay out while they are noindex");
    /* LRG-STATE-047 widened the configured set from one State to six. The cutover switch is unchanged, and
       what it opens is still exactly the configured canonical paths — never a filename-derived list. */
    const opened = sitemapEntries({ includePreviewJurisdictions: true });
    assert.deepEqual(opened.map((e) => e.url).sort(), [
      "https://www.lotterycorner.com/ca",
      "https://www.lotterycorner.com/fl",
      "https://www.lotterycorner.com/md",
      "https://www.lotterycorner.com/mi",
      "https://www.lotterycorner.com/ut",
      "https://www.lotterycorner.com/va",
    ]);
  });

  test("the canonical path comes from validated configuration, not a filename", () => {
    const src = readFileSync(new URL("../lib/seo/sitemapEntries.ts", import.meta.url), "utf8");
    assert.ok(/stateViewConfigFor|configuredStateCodes/.test(src));
    assert.ok(!/readdir|glob|fixtures\//.test(src), "route existence never comes from a filename");
  });

  test("lastmod is truthful or omitted, never a clock", () => {
    const entry = sitemapEntries({ includePreviewJurisdictions: true })
      .find((e) => e.url.endsWith("/fl"))!;
    assert.ok(!("lastModified" in entry), "omitted when no signal is supplied");
    const withSignal = sitemapEntries({
      includePreviewJurisdictions: true,
      lastModifiedByState: { fl: "2026-07-09T14:01:45-04:00" },
    }).find((e) => e.url.endsWith("/fl"))!;
    assert.equal(withSignal.lastModified, "2026-07-09T14:01:45-04:00");
    const src = readFileSync(new URL("../lib/seo/sitemapEntries.ts", import.meta.url), "utf8");
    assert.ok(!/Date\.now|new Date\(\)/.test(src), "no build or request timestamp");
  });

  test("design-lab and buynow can never enter a sitemap", () => {
    assert.ok(isSitemapExcluded("/design-lab/state/florida-content"));
    assert.ok(isSitemapExcluded("/buynow/abc"));
    assert.ok(!isSitemapExcluded("/fl"));
    /* And the route itself is gone. */
    assert.equal(existsSync(new URL("../app/design-lab", import.meta.url)), false);
  });
});

describe("LRG-STATE-043: favicon and search identity", () => {
  test("the recorded asset gap was closed by LRG-IDENTITY-044", () => {
    /*
     * LRG-STATE-043 audited this and found no favicon at all, plus an Organization `logo` reference pointing at
     * a file that did not exist. It recorded the gap rather than inventing an asset, which was the correct
     * outcome then. LRG-IDENTITY-044 closed it with the approved production LotteryCorner mark.
     *
     * The dimension and provenance assertions live in `tests/search-identity.test.ts`; this only records that
     * the gap is no longer open, so the two tasks' histories stay legible.
     */
    assert.ok(existsSync(new URL("../public/favicon.ico", import.meta.url)));
    assert.ok(existsSync(new URL("../public/icon-48.png", import.meta.url)));
    assert.ok(existsSync(new URL("../public/icon-96.png", import.meta.url)));
    assert.ok(existsSync(new URL("../public/logo.png", import.meta.url)),
      "the Organization logo reference resolves");
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    assert.ok(/icons:/.test(layout), "and root metadata declares them");
  });
});
