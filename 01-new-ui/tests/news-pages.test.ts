/*
 * THE NEWS PAGE FAMILY — 07/07A/07B/07C conformance.
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. FABRICATED NEWS — an invented winner, jackpot, event or undated "current" claim entering the review
 *      corpus (`CLAUDE.md` §14; 07A §2 NEWS-LOW-VOLUME: "Do not manufacture news").
 *   2. A FAKE PERSON — an author presented as a real human with an invented biography or photo (07 §3).
 *   3. THE COMPOSITION drifting from the frozen order — 07A §3's seventeen rows, 07B §3's fifteen sections.
 *   4. AN AD entering a protected zone, or any slot appearing without a captured, approved profile (§12).
 *   5. INDEXABILITY — every news route stays `noindex`; the search page stays noindex FOREVER.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";

import {
  NEWS_ARTICLE_SECTION_ORDER, NEWS_HUB_DESCRIPTION, NEWS_HUB_H1, NEWS_HUB_MODE, NEWS_HUB_ORDER,
  NEWS_HUB_SECTION_NAMES, NEWS_HUB_SUPPORT, NEWS_HUB_TITLE,
} from "../lib/news/newsContract";
import { NEWS_DATA_MODE, assertNewsPayloadShape, getNewsArticle, getNewsAuthor, getNewsData } from "../lib/news/bff/newsBff";
import type { NewsData } from "../lib/news/bff/newsBffContract";
import { isNewsRouteServed, newsRoutePaths } from "../lib/news/newsRegistry";
import { buildNewsHubModel } from "../lib/news/newsHubModel";
import { buildNewsArticleModel } from "../lib/news/newsArticleModel";
import { NO_APPROVED_NEWS_PROFILE, newsAdProfile } from "../lib/news/newsAdProfile";
import { NEWS_ARTICLE_CONDITIONAL_FIELDS, NEWS_ARTICLE_REQUIRED_FIELDS, newsArticleSchema, newsAuthorSchema, newsHubSchema } from "../lib/news/newsSchema";
import {
  newsArticleMetadata, newsAuthorMetadata, newsHubMetadata, newsSearchMetadata,
} from "../lib/news/newsRouteMetadata";
import { searchNews, searchTerms } from "../lib/news/newsSearch";
import { newsTaggedContentSource } from "../lib/news/newsTaggedContentSource";
import { PAGE_FAMILIES, routeInventory, servesPage } from "../lib/registry/pageFamilyRegistry";
import { isSitemapExcluded } from "../lib/seo/sitemapEntries";
import { sectionIntelligence } from "../lib/ai/sectionIntelligence";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped, so a comment QUOTING a rule is not mistaken for a violation. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ══════════════════════════════════════════════════════════════════ 07A §3: the hub order */

describe("07A §3: the News Hub order is the blueprint's, verbatim", () => {
  test("the seventeen rows, ids and names, in the REQUIRED order", () => {
    /* Transcribed independently from 07A §3's table — the test's own copy, so a drive-by edit to the contract
       constant cannot silently agree with itself. */
    assert.deepEqual([...NEWS_HUB_ORDER], [
      "NH-01", "NH-02", "NH-03", "AD-NH00", "NH-04", "NH-05", "NH-06", "NH-07",
      "AD-NH01", "NH-08", "NH-09", "NH-10", "NH-11", "NH-12", "NH-13", "NH-14", "AD-NH02",
    ]);
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-01"], "Identity and Navigation");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-02"], "Top/Developing Story");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-03"], "Jackpot Watch");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-04"], "Latest News");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-05"], "Winners and Unclaimed Prizes");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-06"], "State News");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-07"], "Guides and LotteryCorner Research");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-08"], "Trending");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-09"], "Most Discussed");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-10"], "Most Read");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-11"], "From the Community");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-12"], "Celebrations and Events");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-13"], "Alerts and Digests");
    assert.equal(NEWS_HUB_SECTION_NAMES["NH-14"], "Trust, Reporters and Policies");
  });

  test("the model renders that order and nothing else, and the component follows the model", () => {
    const model = buildNewsHubModel();
    assert.deepEqual(model.sections.map((s) => s.id), [...NEWS_HUB_ORDER]);
    /* The component renders sections in model order; the served DOM carries the order as one attribute. */
    const c = src("components/news/NewsHubPage.tsx");
    assert.match(c, /data-section-order=\{model\.sections\.map\(\(x\) => x\.id\)\.join\(","\)\}/);
    /* Every NH id reaches the JSX exactly once, in blueprint order of appearance. NH-01 is the raw identity
       section (it owns the H1), so it appears as a literal `data-section-id`; the rest go through `section()`
       and the two AdAnchor markers. */
    const ids = [...c.matchAll(/(?:section\("|<AdAnchor id="|data-section-id=")(NH-\d\d|AD-NH\d\d)/g)]
      .map((m) => m[1]);
    assert.deepEqual(ids, [...NEWS_HUB_ORDER]);
  });

  test("the hub runs NEWS-LOW-VOLUME, and the mode is a constant, not an environment read", () => {
    assert.equal(NEWS_HUB_MODE, "NEWS-LOW-VOLUME");
    assert.equal(buildNewsHubModel().mode, "NEWS-LOW-VOLUME");
    for (const f of [
      "lib/news/newsContract.ts", "lib/news/newsHubModel.ts", "lib/news/bff/newsBff.ts",
      "lib/news/newsRegistry.ts",
    ]) {
      assert.doesNotMatch(code(f), /process\.env/, `${f} must read no environment`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ 07A §4/§17: identity, verbatim */

describe("07A §4 and §17: H1 and metadata are verbatim", () => {
  test("the H1 and supporting copy", () => {
    assert.equal(NEWS_HUB_H1, "Lottery News, Winners, Jackpots and Player Stories");
    assert.equal(
      NEWS_HUB_SUPPORT,
      "Verified U.S. lottery news with named reporters, LotteryCorner data, useful AI context and community discussion.",
    );
    const model = buildNewsHubModel();
    assert.equal(model.h1, NEWS_HUB_H1);
    /* One H1, rendered from the model. */
    const c = src("components/news/NewsHubPage.tsx");
    assert.equal((c.match(/<h1/g) ?? []).length, 1);
    assert.match(c, /\{model\.h1\}/);
  });

  test("the §17 title and description", () => {
    assert.equal(NEWS_HUB_TITLE, "Lottery News, Winners, Jackpots & Player Stories | LotteryCorner");
    assert.equal(
      NEWS_HUB_DESCRIPTION,
      "Read verified U.S. lottery news, jackpot updates, winner stories, state developments, LotteryCorner "
      + "Research and community discussions.",
    );
    const meta = newsHubMetadata();
    assert.deepEqual(meta.title, { absolute: NEWS_HUB_TITLE });
    assert.equal(meta.description, NEWS_HUB_DESCRIPTION);
  });
});

/* ══════════════════════════════════════════════════════════════════ 07B §3: the article order */

describe("07B §3: fifteen sections, in order, mapped onto the Global Shell editorial library", () => {
  test("the recorded contract: orders 1..15, blueprint names verbatim, governed library ids", () => {
    assert.equal(NEWS_ARTICLE_SECTION_ORDER.length, 15);
    assert.deepEqual(NEWS_ARTICLE_SECTION_ORDER.map((r) => r.order), Array.from({ length: 15 }, (_, i) => i + 1));
    assert.deepEqual(NEWS_ARTICLE_SECTION_ORDER.map((r) => r.section), [
      "Category, entities and status", "Headline", "Reporter identity and dates", "Bottom Line",
      "Primary image/data card", "Main article", "Conditional AI context", "Why It Matters",
      "Historical/data connection", "Relevant tool/game/state/guide", "Focused discussion question",
      "Canonical discussion", "Related next actions", "Sources, updates and corrections",
      "Responsible Play/affiliate disclosure",
    ]);
    /* Every mapping is a real library id or a RECORDED null with a reason — never an invented id. */
    const allowed = /^SL-(E0[1-9]|E10|I10|M0[12]|T0[15])$/;
    for (const row of NEWS_ARTICLE_SECTION_ORDER) {
      if (row.libraryId !== null) assert.match(row.libraryId, allowed, `order ${row.order}`);
      assert.ok(row.note.length > 20, `order ${row.order} records why`);
    }
    /* The one null is the article body. */
    assert.deepEqual(NEWS_ARTICLE_SECTION_ORDER.filter((r) => r.libraryId === null).map((r) => r.order), [6]);
  });

  test("the mapping's provenance is recorded: 07B defines order without ids of its own", () => {
    assert.match(src("lib/news/newsContract.ts"), /07B §3 defines the fifteen-section order \*\*without section ids of its own\*\*/);
    assert.match(src("components/news/NewsArticlePage.tsx"), /recorded here because 07B defines order WITHOUT ids/);
  });

  test("the component emits every order marker, ascending, with its mapped library id", () => {
    const c = src("components/news/NewsArticlePage.tsx");
    /* Orders 1–6 and 12 are inline markers; 8–15 go through the ArticleSection wrapper, which derives
       `NA-<order>` from its `order` prop. Order 7 is the suppressed AI slot: nothing renders, which is the
       compliant state, so no marker exists for it. */
    const inline = [...c.matchAll(/data-article-section="NA-(\d\d)"/g)].map((m) => Number(m[1]));
    const wrapped = [...c.matchAll(/<ArticleSection order=\{(\d+)\}/g)].map((m) => Number(m[1]));
    const markers = [...new Set([...inline, ...wrapped])].sort((a, b) => a - b);
    assert.deepEqual(markers, [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15]);
    /* The wrapped sections pass exactly the mapped library id from the contract. */
    for (const [order, id] of [[8, "SL-E03"], [9, "SL-E06"], [10, "SL-M01"], [11, "SL-E08"],
      [13, "SL-M02"], [14, "SL-T01"], [15, "SL-T05"]] as const) {
      const row = NEWS_ARTICLE_SECTION_ORDER.find((r) => r.order === order)!;
      assert.equal(row.libraryId, id);
      assert.ok(
        new RegExp(`<ArticleSection order=\\{${order}\\} libraryId="${id}"`).test(c),
        `order ${order} passes ${id}`,
      );
    }
    /* The inline markers carry theirs literally. */
    for (const [order, id] of [[4, "SL-E02"], [5, "SL-E04"], [12, "SL-E08"]] as const) {
      const row = NEWS_ARTICLE_SECTION_ORDER.find((r) => r.order === order)!;
      assert.equal(row.libraryId, id);
      assert.ok(c.includes(`data-library-id="${id}"`), `SL id ${id} reaches the DOM`);
    }
    /* The header block carries SL-E01 for orders 1–3, and the body records its honest `none`. */
    assert.match(c, /className="lcn-articlehead" data-library-id="SL-E01"/);
    assert.match(c, /data-article-section="NA-06" data-order=\{6\} data-library-id="none"/);
  });

  test("the model suppresses with reasons; it never pads", () => {
    const model = buildNewsArticleModel("mega-millions-2025-matrix-change")!;
    const ai = model.sections.find((r) => r.order === 7)!;
    assert.equal(ai.rendered, false);
    assert.match(ai.suppressed!, /07 §7|acceptance test/);
    const discussion = model.sections.find((r) => r.order === 12)!;
    assert.equal(discussion.rendered, false);
    assert.match(discussion.suppressed!, /never fabricated|community/i);
    /* The article record carries the typed seam. */
    assert.equal(model.article.canonicalDiscussionThreadId, null);
  });

  test("the AI acceptance test is honoured: suppression is recorded on every record", () => {
    for (const a of getNewsData().articles) {
      assert.equal(a.aiContext.rendered, false, `${a.slug}: no model is connected, so no AI module may render`);
      assert.ok(a.aiContext.suppressionReason.length > 40, `${a.slug} records why`);
    }
    /* And the component renders NO AI module markup at all — no label, no empty panel, no teaser. */
    const c = code("components/news/NewsArticlePage.tsx");
    for (const label of ["AI Quick Take", "AI Context", "AI Explainer", "AI Historical Note"]) {
      assert.ok(!c.includes(label), `no "${label}" module is drawn for a suppressed slot`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ schema */

describe("07B §15 / Template K: NewsArticle JSON-LD", () => {
  test("every required field is present, for every article", () => {
    for (const article of getNewsData().articles) {
      const author = getNewsAuthor(article.authorSlug)!;
      const graph = newsArticleSchema(article, author) as {
        "@context": string;
        "@graph": Record<string, unknown>[];
      };
      assert.equal(graph["@context"], "https://schema.org");
      const node = graph["@graph"][0];
      for (const field of NEWS_ARTICLE_REQUIRED_FIELDS) {
        if (field === "@context") continue; /* carried by the graph wrapper */
        if (NEWS_ARTICLE_CONDITIONAL_FIELDS.includes(field)) continue; /* asserted by rule below */
        assert.ok(field in node, `${article.slug} schema is missing ${field}`);
      }
    }
  });

  /*
   * LRG-UX-SCHEMA-001 correction 3. `image` was `/logo.png` on all 19 articles — a wordmark asserted as the
   * image representing each distinct story. The rule replacing it is asserted in both directions, because a
   * test that only checked for the logo's absence would pass just as well if `image` could never appear.
   */
  test("image is absent without a representative asset, and never the site logo", () => {
    for (const article of getNewsData().articles) {
      const author = getNewsAuthor(article.authorSlug)!;
      const node = (newsArticleSchema(article, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
      assert.ok(!("image" in node), `${article.slug} emits image with no representative asset`);
      assert.ok(!JSON.stringify(node).includes("logo.png"), `${article.slug} still references the site logo`);
    }
  });

  test("image IS emitted, as a measured ImageObject, once a record carries a representative asset", () => {
    const base = getNewsData().articles[0];
    const author = getNewsAuthor(base.authorSlug)!;
    const withAsset = {
      ...base,
      representativeImage: {
        url: "/news/example-card.png", width: 1200, height: 675, alt: "Example representative card",
      },
    };
    const node = (newsArticleSchema(withAsset, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    const image = node["image"] as { "@type": string; url: string; width: number; height: number }[];
    assert.equal(image.length, 1);
    assert.equal(image[0]["@type"], "ImageObject");
    assert.equal(image[0].url, "https://www.lotterycorner.com/news/example-card.png");
    assert.equal(image[0].width, 1200);
    assert.equal(image[0].height, 675);
  });

  test("the schema matches the visible content, field by field", () => {
    const article = getNewsArticle("mega-millions-2025-matrix-change")!;
    const author = getNewsAuthor(article.authorSlug)!;
    const node = (newsArticleSchema(article, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    assert.equal(node["@type"], "NewsArticle");
    assert.equal(node["headline"], article.headline);
    assert.equal(node["description"], article.description);
    assert.equal(node["datePublished"], article.datePublishedIso);
    assert.equal(node["dateModified"], article.dateModifiedIso);
    assert.equal(node["articleSection"], article.newsCategory);
    assert.equal(node["isAccessibleForFree"], true);
    assert.equal(node["inLanguage"], "en-US");
    assert.equal(node["url"], "https://www.lotterycorner.com/news/mega-millions-2025-matrix-change");
    const authorNode = node["author"] as Record<string, unknown>;
    assert.equal(authorNode["name"], author.name);
    /* THE RECORDED DEPARTURE: the accountable review identity is a team, so the author node is an Organization —
       emitting Person for a non-person would be the fabricated reporter 07 §3 forbids. */
    assert.equal(authorNode["@type"], "Organization");
    /* An EDITORIAL record emits Article, not NewsArticle (07 §1). */
    const guide = getNewsArticle("how-yearly-results-archives-work")!;
    const guideNode = (newsArticleSchema(guide, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    assert.equal(guideNode["@type"], "Article");
  });

  test("the hub graph is 07A §17's list, and its ItemList is the visible cards only", () => {
    const model = buildNewsHubModel();
    const graph = (newsHubSchema(model.visibleCards) as { "@graph": { "@type": string }[] })["@graph"];
    assert.deepEqual(
      graph.map((n) => n["@type"]),
      /*
       * LRG-UX-SCHEMA-001 correction 1: the trailing Organization and WebSite ENTITIES are gone from the
       * page-level graph. The root layout emits one of each per page; this graph carries references to their
       * `@id`s instead, so a rendered page no longer ships two Organization nodes disagreeing about the name.
       */
      ["CollectionPage", "BreadcrumbList", "ItemList"],
    );
    const itemList = graph[2] as unknown as { itemListElement: { name: string }[] };
    assert.deepEqual(
      itemList.itemListElement.map((i) => i.name),
      model.visibleCards.map((c) => c.headline),
      "the ItemList mirrors the rendered cards exactly — no hidden entries, none missing",
    );
    /* No SearchAction anywhere in the news schema (CLAUDE.md §11) — the search page is noindex, not a
       declared site search endpoint. */
    assert.doesNotMatch(src("lib/news/newsSchema.ts"), /SearchAction/);
  });

  test("the author page is a ProfilePage whose mainEntity is honestly an Organization", () => {
    const author = getNewsAuthor("lotterycorner-editorial-team")!;
    const graph = (newsAuthorSchema(author) as { "@graph": Record<string, unknown>[] })["@graph"];
    assert.equal(graph[0]["@type"], "ProfilePage");
    const main = graph[0]["mainEntity"] as Record<string, unknown>;
    assert.equal(main["@type"], "Organization");
    assert.equal(main["name"], author.name);
  });
});

/* ══════════════════════════════════════════════════════════════════ advertising */

describe("07A §19 / 07B §19 / CLAUDE.md §12: advertising", () => {
  test("the profile is typed-empty with the audit gap recorded — no slot is invented", () => {
    assert.equal(newsAdProfile(), NO_APPROVED_NEWS_PROFILE);
    assert.equal(NO_APPROVED_NEWS_PROFILE.placements.length, 0);
    assert.match(NO_APPROVED_NEWS_PROFILE.gap, /lc_bp_\*\/lc_bdp_\*/);
    assert.match(NO_APPROVED_NEWS_PROFILE.gap, /CLAUDE\.md §12/);
  });

  test("the AD-NH anchors hold exactly the 07A §3 positions", () => {
    assert.equal(NEWS_HUB_ORDER[3], "AD-NH00", "position 4, after Jackpot Watch");
    assert.equal(NEWS_HUB_ORDER[8], "AD-NH01", "position 9, after Guides/Research");
    assert.equal(NEWS_HUB_ORDER[16], "AD-NH02", "position 17, lower");
    /* And no anchor renders geometry: the marker is hidden and reserves nothing. */
    const c = src("components/news/NewsHubPage.tsx");
    assert.match(c, /hidden\s+data-section-id=\{id\}\s+data-ad-anchor="reserved-pending-audit"/);
  });

  test("no ad reaches a protected zone, structurally", () => {
    const hub = src("components/news/NewsHubPage.tsx");
    /* NH-02 (Top Story / Bottom Line) is marked protected, and no AdAnchor sits between NH-01 and NH-04. */
    assert.match(hub, /section\("NH-02", "top-story",[\s\S]*?\{ protectedZone: true \}/);
    const firstAd = hub.indexOf(`<AdAnchor id="AD-NH00"`);
    const nh02 = hub.indexOf(`section("NH-02"`);
    const nh03 = hub.indexOf(`section("NH-03"`);
    assert.ok(nh02 < nh03 && nh03 < firstAd, "the first anchor sits after Jackpot Watch, never above it");

    /* The ARTICLE carries no ad markup at all: every 07B §19 position is protected or unapproved. */
    const art = code("components/news/NewsArticlePage.tsx");
    assert.doesNotMatch(art, /AdAnchor|data-ad-anchor|adsbygoogle|googletag/);
    assert.match(src("components/news/NewsArticlePage.tsx"), /data-ad-active-count=\{0\}/);
    /* The protected zones are marked in the DOM: reporter identity, Bottom Line, discussion, sources,
       responsible play. */
    for (const marker of [
      /data-article-section="NA-03"[\s\S]{0,80}data-protected-zone="true"/,
      /data-article-section="NA-04"/,
      /heading="Join the discussion" protectedZone/,
      /heading="Sources and corrections" protectedZone/,
      /heading="Play responsibly" protectedZone/,
    ]) {
      assert.match(src("components/news/NewsArticlePage.tsx"), marker);
    }
    /* Headline and Bottom Line are adjacent siblings — there is no slot between them to fill. Comments are
       stripped first, so a comment QUOTING the rule cannot trip it. */
    const full = code("components/news/NewsArticlePage.tsx");
    const headerEnd = full.indexOf("</header>");
    const bottomLine = full.indexOf(`data-article-section="NA-04"`);
    const between = full.slice(headerEnd, bottomLine);
    assert.doesNotMatch(
      between,
      /AdAnchor|data-ad|adsbygoogle|googletag|placement|ad-slot/i,
      "nothing sits between the header and the Bottom Line",
    );
  });
});

/* ══════════════════════════════════════════════════════════════════ authors */

describe("07 §2/§3: accountable authorship without fabricated humans", () => {
  test("every author is a labelled review placeholder — no fake person, no photo, honest biography", () => {
    for (const a of getNewsData().authors) {
      assert.equal(a.reviewStatus, "review-fixture");
      assert.equal(a.photo, null, "07 §3: no synthetic reporter photos");
      assert.match(a.name, /LotteryCorner/, "a team identity, never a personal name");
      assert.match(a.biography, /placeholder/i);
      assert.match(a.biography, /not a person/i);
    }
  });

  test("every article names an accountable author AND an accountable editor", () => {
    for (const art of getNewsData().articles) {
      assert.ok(getNewsAuthor(art.authorSlug), `${art.slug} resolves its author`);
      assert.ok(art.editorName.length > 0, `${art.slug} names its editor (07 §3)`);
    }
  });

  test("the pages label the identity as a placeholder wherever it is shown", () => {
    for (const f of [
      "components/news/NewsArticlePage.tsx",
      "components/news/AuthorProfilePage.tsx",
      "components/news/NewsHubPage.tsx",
    ]) {
      assert.match(src(f), /data-review-fixture/, `${f} carries the visible review label`);
    }
    /* The profile never draws a portrait for a non-person. */
    assert.match(src("components/news/AuthorProfilePage.tsx"), /data-no-photo="honest"/);
    assert.doesNotMatch(code("components/news/AuthorProfilePage.tsx"), /<img|<Image/);
  });
});

/* ══════════════════════════════════════════════════════════════════ no fabricated news */

describe("CLAUDE.md §14: the review corpus manufactures no news", () => {
  test("every article declares its fact basis and evidence, and no live story is claimed", () => {
    for (const a of getNewsData().articles) {
      assert.ok(
        a.provenance.factBasis === "evergreen-guide" || a.provenance.factBasis === "dated-historical-fact",
        `${a.slug} declares its basis`,
      );
      assert.ok(a.provenance.evidence.length > 0, `${a.slug} cites evidence`);
      assert.equal(a.provenance.reviewStatus, "review-fixture");
      assert.notEqual(a.storyStatus, "DEVELOPING", `${a.slug} must not claim a developing story`);
      assert.ok(["PUBLISHED", "EVERGREEN"].includes(a.storyStatus), `${a.slug} uses a review-safe status`);
    }
  });

  test("no undated currency, no winner, no jackpot figure, no prize claim anywhere in the corpus", () => {
    for (const a of getNewsData().articles) {
      const text = [a.headline, a.description, a.bottomLine, ...a.body, a.historicalNote,
        ...a.whyItMatters].join(" ");
      assert.doesNotMatch(text, /\btoday\b|\byesterday\b|\btonight\b|\bthis week\b|\bbreaking\b/i,
        `${a.slug}: undated current-news phrasing`);
      assert.doesNotMatch(text, /\$[\d,.]+ (million|billion)|\bjackpot (rose|climbs?|rolls?|hits?|reached)\b/i,
        `${a.slug}: an invented jackpot movement`);
      assert.doesNotMatch(text, /\b(wins?|won|winner|claimed a prize)\b/i,
        `${a.slug}: a winner claim needs a published verified source, which the corpus has none of`);
    }
  });

  test("a dated historical record states its dates, and its dates match the repository evidence", () => {
    const mm = getNewsArticle("mega-millions-2025-matrix-change")!;
    assert.equal(mm.provenance.factBasis, "dated-historical-fact");
    assert.match(mm.body.join(" "), /April 8, 2025/);
    assert.match(mm.body.join(" "), /October 31, 2017/);
    const pb = getNewsArticle("powerball-2015-matrix-history")!;
    assert.match(pb.body.join(" "), /October 7, 2015/);
    /* Against the production-derived format records themselves. */
    const formats = JSON.parse(
      readFileSync(new URL("../../04-sample-data/result-format-definitions.json", import.meta.url), "utf8"),
    ) as { formats: { gameSlug: string; effectiveFrom: string | null }[] };
    const megaFrom = formats.formats.find((f) => f.gameSlug === "mega-millions")?.effectiveFrom;
    const pbFrom = formats.formats.find((f) => f.gameSlug === "powerball")?.effectiveFrom;
    assert.equal(megaFrom, "2025-04-08");
    assert.equal(pbFrom, "2015-10-07");
  });

  test("the shape assertion rejects a doctored payload on read", () => {
    const base = getNewsData();
    const doctored = (mutate: (d: NewsData) => NewsData) =>
      assert.throws(() => assertNewsPayloadShape(mutate(structuredClone(base) as NewsData)));
    /* An undated current-news phrase. */
    doctored((d) => {
      (d.articles[0] as unknown as { body: string[] }).body = ["The jackpot climbed again today."];
      return d;
    });
    /* A live-story claim. */
    doctored((d) => {
      (d.articles[0] as { storyStatus: string }).storyStatus = "DEVELOPING";
      return d;
    });
    /* An author upgraded to a person. */
    doctored((d) => {
      (d.authors[0] as { name: string }).name = "Jane Reporter";
      return d;
    });
    /* A record with no provenance. */
    doctored((d) => {
      (d.articles[0] as unknown as { provenance: { evidence: string[] } }).provenance.evidence = [];
      return d;
    });
  });

  test("the review payload enters through ONE seam: nothing in components/ or app/ imports it", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel);
        else if (/\.tsx?$/.test(name) && /news\/bff\/review|bff\/review\/news-review/.test(readFileSync(p, "utf8"))) {
          offenders.push(rel);
        }
      }
    };
    for (const root of ["app", "components"]) walk(root);
    assert.deepEqual(offenders, [], "the payload is reachable only through getNewsData()");
    assert.equal(NEWS_DATA_MODE, "review");
    /* The api branch exists and throws — the seam is visible, not imaginary. */
    assert.match(src("lib/news/bff/newsBff.ts"), /case "api":/);
    assert.match(src("lib/news/bff/newsBff.ts"), /CLAUDE\.md §15/);
  });
});

/* ══════════════════════════════════════════════════════════════════ LOW-VOLUME honesty */

describe("07 §11 / 07A §2: rankings and empty modules are honest in NEWS-LOW-VOLUME", () => {
  test("Trending, Most Discussed and Most Read are present, separate, and honestly empty", () => {
    const model = buildNewsHubModel();
    for (const id of ["NH-08", "NH-09", "NH-10"] as const) {
      const row = model.sections.find((s) => s.id === id)!;
      assert.equal(row.state, "empty", `${id} is empty, not faked`);
      assert.match(row.reason!, /never (seeded|invented|fabricated)|counts are never invented/i);
    }
    /* No count, view figure or reader number is rendered anywhere on the hub. */
    const c = code("components/news/NewsHubPage.tsx");
    assert.doesNotMatch(c, /viewCount|readCount|commentCount|replies|\breads\b/i);
  });

  test("winners, community and events render recorded reasons, never sample content", () => {
    const model = buildNewsHubModel();
    for (const id of ["NH-05", "NH-11", "NH-12"] as const) {
      const row = model.sections.find((s) => s.id === id)!;
      assert.equal(row.state, "empty");
      assert.ok(row.reason!.length > 40, `${id} explains itself`);
    }
    /* Jackpot Watch is unavailable-with-links, because rendering mock jackpots as news would be fabrication. */
    assert.equal(model.sections.find((s) => s.id === "NH-03")!.state, "unavailable");
  });

  test("the state selector is links with no IP inference anywhere in the family", () => {
    const model = buildNewsHubModel("fl");
    assert.equal(model.selectedState?.code, "fl");
    assert.ok(model.stateOptions.length > 0);
    /* A selector chip links only where the build actually serves a state hub. */
    for (const opt of model.stateOptions) {
      if (opt.hubHref) assert.ok(servesPage("state", opt.code), `${opt.code} link only where served`);
    }
    for (const f of [
      "lib/news/newsHubModel.ts", "components/news/NewsHubPage.tsx", "app/news/page.tsx",
    ]) {
      assert.doesNotMatch(code(f), /geoip|geolocation|x-forwarded-for|request\.ip|headers\(\)/i,
        `${f} must not resolve location`);
    }
    assert.match(src("components/news/NewsHubPage.tsx"), /data-no-ip-rewrite="true"/);
  });
});

/* ══════════════════════════════════════════════════════════════════ routes, gating, indexability */

describe("FD-GATE-01 and PUBLICATION_SAFETY: the news family", () => {
  test("the family is registered and the inventory carries its routes under 07A/07B", () => {
    assert.ok(PAGE_FAMILIES.includes("news"));
    const rows = routeInventory().filter((r) => r.family === "news");
    const byRoute = new Map(rows.map((r) => [r.route, r.blueprint]));
    assert.equal(byRoute.get("/news"), "07A");
    assert.equal(byRoute.get("/news/search"), "07A");
    assert.equal(byRoute.get("/news/mega-millions-2025-matrix-change"), "07B");
    assert.equal(byRoute.get("/authors/lotterycorner-editorial-team"), "07B");
    assert.equal(rows.length, newsRoutePaths().length);
  });

  test("route existence needs the registry row AND the payload record — a fixture alone serves nothing", () => {
    assert.equal(servesPage("news", "/news"), true);
    assert.equal(servesPage("news", "/news/powerball-2015-matrix-history"), true);
    assert.equal(servesPage("news", "/news/not-a-registered-slug"), false);
    assert.equal(servesPage("news", "/authors/nobody"), false);
    assert.equal(isNewsRouteServed("/news/"), false, "no trailing-slash twin");
    /* The registry enumerates slugs explicitly; the route files gate on servesPage and 404 otherwise. */
    for (const f of [
      "app/news/page.tsx", "app/news/[slug]/page.tsx", "app/news/search/page.tsx", "app/authors/[slug]/page.tsx",
    ]) {
      assert.match(code(f), /servesPage\("news"/, `${f} gates on the registry`);
      assert.match(code(f), /notFound\(\)/, `${f} refuses unregistered routes`);
    }
  });

  test("every news route is noindex, and the hub canonical is the governed www form", () => {
    const article = getNewsArticle("what-a-result-format-is")!;
    const author = getNewsAuthor("lotterycorner-editorial-team")!;
    for (const meta of [
      newsHubMetadata(), newsArticleMetadata(article), newsSearchMetadata(), newsAuthorMetadata(author),
    ]) {
      assert.deepEqual(meta.robots, { index: false, follow: false });
    }
    assert.equal(newsHubMetadata().alternates?.canonical, "https://www.lotterycorner.com/news");
    assert.equal(
      newsArticleMetadata(article).alternates?.canonical,
      "https://www.lotterycorner.com/news/what-a-result-format-is",
    );
    /* The SEARCH page: noindex ALWAYS, no canonical for its query variants, permanently out of any sitemap. */
    assert.equal(newsSearchMetadata().alternates, undefined);
    assert.equal(isSitemapExcluded("/news/search"), true);
    assert.equal(isSitemapExcluded("/news/search?q=powerball".split("?")[0]), true);
    assert.match(src("lib/news/newsRouteMetadata.ts"), /noindex ALWAYS/);
  });

  test("§10.5: every news section the pages emit has a recorded intelligence decision", () => {
    for (const id of NEWS_HUB_ORDER.filter((x) => x.startsWith("NH-"))) {
      const entry = sectionIntelligence("news", id);
      assert.ok(entry, `${id} needs a recorded decision — a missing one is not a decision of none`);
      assert.ok(entry.why.length > 20, `${id} records why`);
    }
    /* The suppressed AI slot records `none` WITH the 07 §7 reason — a decision, not an omission. */
    const na07 = sectionIntelligence("news", "NA-07");
    assert.equal(na07?.decision, "none");
    assert.match(na07!.why, /07 §7|acceptance test/);
  });
});

/* ══════════════════════════════════════════════════════════════════ search */

describe("the founder-added search page", () => {
  test("plain keyword search: every term must match, order-independent, punctuation-tolerant", () => {
    assert.deepEqual(searchTerms("  Powerball, 2015! "), ["powerball", "2015"]);
    const hits = searchNews("powerball 2015");
    assert.ok(hits.some((h) => h.article.slug === "powerball-2015-matrix-history"));
    for (const h of hits) assert.ok(h.matchedIn.length > 0);
    /* No fuzzy over-matching: a term that appears nowhere returns nothing. */
    assert.deepEqual(searchNews("zebra"), []);
    assert.deepEqual(searchNews(""), []);
  });

  test("the page is server-rendered with a GET form and crawlable fallbacks to the hub", () => {
    const c = src("components/news/NewsSearchPage.tsx");
    assert.doesNotMatch(c, /"use client"/, "no client island — the results are in the initial HTML");
    assert.match(c, /method="get"/);
    assert.match(c, /Browse all lottery news/);
    /* Suggestion chips are plain player language: states and games, not operators. */
    assert.match(c, /NEWS_SEARCH_SUGGESTIONS/);
  });
});

/* ══════════════════════════════════════════════════════════════════ the tagged-content wiring */

describe("the news family feeds the existing teasers without restructuring them", () => {
  test("the flagship news source serves tagged review articles at real routes", () => {
    const items = newsTaggedContentSource.fetchByTag("Powerball", 3);
    assert.ok(items.length > 0);
    for (const i of items) {
      assert.ok(i.tags.includes("Powerball"));
      assert.match(i.href, /^\/news\/[a-z0-9-]+$/);
      assert.equal(i.provenance, "synthetic/internal-review");
      assert.match(i.author, /LotteryCorner/);
    }
    /* The adapter respects its limit and never fabricates a reply count for a news item. */
    assert.ok(newsTaggedContentSource.fetchByTag("Mega Millions", 1).length <= 1);
    for (const i of items) assert.equal(i.replyCount, undefined);
  });

  test("Home H-11 and State S-15 gained one link each — a destination, not a restructure", () => {
    const home = src("lib/preview/homePreviewModel.ts");
    assert.match(home, /moreHref: "\/news"/);
    assert.match(home, /moreLabel: "More lottery news"/);
    assert.match(src("components/preview/HomePreview.tsx"), /data-more-news="true"/);
    const band = src("components/state/preview/sections/StateLowerBands.tsx");
    assert.match(band, /data-more-news="true"/);
    assert.match(band, /href="\/news"/);
  });
});
