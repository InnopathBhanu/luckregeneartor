/*
 * THE RENDERED-PAGE CONTRACT — LRG-UX-SCHEMA-001.
 *
 * ══ WHY THIS FILE IS DIFFERENT FROM EVERY OTHER TEST HERE ══
 *
 * The rest of the suite asserts MODELS and SOURCE. That is the right default — it is fast, offline and
 * deterministic. It is also how this task's defects survived: every one of them was invisible to a model test.
 *
 *   - `FG-13` appeared twice in the DOM because a wrapper and a rail each emitted it. Both call sites were
 *     correct in isolation; only the rendered document showed the collision.
 *   - Two full `Organization` entities shipped on `/news`, because the ROOT LAYOUT emitted one and the page
 *     graph emitted another. No single module was wrong.
 *   - The primary navigation had six entries where GS-03 specifies seven, and two of them said "Soon" about
 *     routes that served.
 *
 * So this file parses the SERVED HTML: every `<script type="application/ld+json">` on the page, every
 * `data-section-id`, every `<h1>`, and both navigations. It is the only way to answer "what does a browser
 * actually receive?".
 *
 * ══ OPT-IN, LIKE `state-runtime-proof.test.ts` ══
 *
 *     LC_VERIFY_URL=http://localhost:3000 npm test
 *
 * Without the variable every test SKIPS rather than fails: `npm test` must stay offline and deterministic, and
 * a suite that needs a server to pass is a suite people stop running.
 *
 * ══ ROUTES COME FROM THE REGISTRY ══
 *
 * `CLAUDE.md` §10: route existence is never derived from a fixture filename or a directory listing. The list
 * below is one representative per family, each CHECKED against `routeInventory()` before it is fetched — so a
 * route that stops being served fails loudly here instead of being silently skipped.
 */

import { describe, test, before } from "node:test";
import assert from "node:assert/strict";

import { routeInventory } from "../lib/registry/pageFamilyRegistry";
import {
  BOTTOM_NAV_LABELS, PRIMARY_NAV_LABELS,
} from "../lib/shell/globalShellModel";
import { SITE_ALTERNATE_NAMES, SITE_NAME } from "../lib/seo/brandIdentity";

const BASE = process.env.LC_VERIFY_URL;
const skip = BASE ? false : "set LC_VERIFY_URL to check a running server";

/**
 * One representative route per reviewed page family, each carrying the navigation state
 * LRG-UX-SCHEMA-002 §2's mapping table assigns it.
 *
 * `primary`/`bottom` are the EXPECTED active labels, transcribed from the task's table rather than read back
 * from the shell — so a test failure means the page disagrees with the mapping, not that two derivations of the
 * same code agree with each other. `null` means the family belongs to no entry and nothing may be marked.
 *
 * Every route here is checked against `routeInventory()` before it is fetched (`CLAUDE.md` §10 — never derive a
 * route from a fixture filename). Nested Tools, a Blog post and an author page were absent from the first pass,
 * which is why the "current item" defect on those families survived it.
 */
const ROUTES = [
  { family: "home", route: "/", primary: null, bottom: "Home" },
  { family: "state", route: "/fl", primary: "States", bottom: "Results" },
  { family: "flagship", route: "/powerball", primary: "Games", bottom: "Results" },
  { family: "flagship", route: "/mega-millions", primary: "Games", bottom: "Results" },
  { family: "game", route: "/fl/pick-3", primary: "Games", bottom: "Results" },
  { family: "archive", route: "/fl/pick-3/2026", primary: "Results", bottom: "Results" },
  { family: "tools", route: "/tools", primary: "Tools", bottom: null },
  { family: "tools", route: "/tools/tax-calculator", primary: "Tools", bottom: null },
  { family: "news", route: "/news", primary: "News", bottom: null },
  { family: "news", route: "/news/mega-millions-2025-matrix-change", primary: "News", bottom: null },
  { family: "blog", route: "/blog", primary: "News", bottom: null },
  { family: "blog", route: "/blog/hot-and-cold-numbers-an-honest-look", primary: "News", bottom: null },
  { family: "community", route: "/community", primary: "Community", bottom: "Community" },
  {
    family: "community",
    route: "/community/florida-pick-3-august-2026",
    primary: "Community",
    bottom: "Community",
  },
  { family: "community", route: "/members/sunshinepicks", primary: "Community", bottom: "Community" },
  { family: "trust", route: "/about-us", primary: null, bottom: null },
] as const;

const pages = new Map<string, string>();

before(async () => {
  if (!BASE) return;
  const served = new Set(routeInventory().map((r) => r.route));
  for (const { route } of ROUTES) {
    assert.ok(served.has(route), `${route} must be in the registry — this list is not a guess`);
    const res: Response = await fetch(`${BASE}${route}`);
    assert.equal(res.status, 200, `${route} returned ${res.status}`);
    pages.set(route, await res.text());
  }
});

/* ------------------------------------------------------------------ helpers */

const html = (route: string) => pages.get(route)!;
const matchAll = (re: RegExp, s: string) => [...s.matchAll(re)].map((m) => m[1]);

/** Every JSON-LD script on the page, parsed. A parse failure is the assertion, not an exception. */
function jsonLd(route: string): Record<string, unknown>[] {
  const scripts = matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, html(route));
  const parsed: Record<string, unknown>[] = [];
  scripts.forEach((raw, i) => {
    try {
      parsed.push(JSON.parse(raw) as Record<string, unknown>);
    } catch (e) {
      assert.fail(`${route}: JSON-LD script ${i + 1} does not parse — ${(e as Error).message}`);
    }
  });
  return parsed;
}

/** Every node across every script, with `@graph` wrappers flattened. */
function nodes(route: string): Record<string, unknown>[] {
  return jsonLd(route).flatMap((doc) =>
    Array.isArray(doc["@graph"]) ? (doc["@graph"] as Record<string, unknown>[]) : [doc],
  );
}

const typesOf = (route: string) => nodes(route).map((n) => n["@type"]);

/** A node is an ENTITY (defines something) rather than a REFERENCE (points at something). */
const isEntity = (n: Record<string, unknown>) => Object.keys(n).some((k) => k !== "@id" && k !== "@type");

function navItems(route: string, label: string): { text: string; isLink: boolean; current: boolean }[] {
  const nav = html(route).match(new RegExp(`<nav aria-label="${label}"[\\s\\S]*?</nav>`))?.[0];
  if (!nav) return [];
  return [...nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => {
    const inner = m[1];
    return {
      text: inner.replace(/<[^>]*>/g, "").replace(/soon/gi, "").trim(),
      isLink: /<a\b/.test(inner),
      current: /aria-current="page"/.test(inner),
    };
  });
}

/* ══════════════════════════════════════════════════════════ correction 1: one identity */

describe("LRG-UX-SCHEMA-001 §1: every rendered page carries ONE brand identity", { skip }, () => {
  test("every JSON-LD script on every page parses as valid JSON", () => {
    for (const { route } of ROUTES) {
      const docs = jsonLd(route);
      assert.ok(docs.length > 0, `${route} emits no structured data at all`);
    }
  });

  test("exactly one full Organization and one full WebSite entity per page", () => {
    for (const { route } of ROUTES) {
      const all = nodes(route);
      const orgs = all.filter((n) => n["@type"] === "Organization" && isEntity(n));
      const sites = all.filter((n) => n["@type"] === "WebSite" && isEntity(n));
      assert.equal(orgs.length, 1, `${route} has ${orgs.length} full Organization entities`);
      assert.equal(sites.length, 1, `${route} has ${sites.length} full WebSite entities`);
    }
  });

  test("the primary name is LotteryCorner, and 'US Lottery Results' is never a site name", () => {
    for (const { route } of ROUTES) {
      const all = nodes(route);
      const org = all.find((n) => n["@type"] === "Organization" && isEntity(n))!;
      const site = all.find((n) => n["@type"] === "WebSite" && isEntity(n))!;
      assert.equal(org["name"], SITE_NAME, `${route} Organization name`);
      assert.equal(site["name"], SITE_NAME, `${route} WebSite name`);
      assert.deepEqual(org["alternateName"], [...SITE_ALTERNATE_NAMES]);
      /*
       * The specific regression: `WebSite.name` was Home's page TITLE. It may still appear in the document as
       * a title and an h1 — it is a good page title — but never as the name of the site.
       */
      for (const n of all) {
        assert.notEqual(n["name"], "US Lottery Results", `${route}: a schema node names the site by page title`);
      }
    }
  });

  test("page-level graphs REFERENCE the identity ids rather than redefining them", () => {
    /* The hub families are where the duplication lived. Their publisher is an `@id` and nothing else. */
    for (const route of ["/news", "/community", "/tools", "/fl/pick-3/2026"]) {
      const page = nodes(route).find((n) => n["@type"] === "CollectionPage");
      assert.ok(page, `${route} emits a CollectionPage`);
      assert.deepEqual(Object.keys(page!["publisher"] as object), ["@id"], `${route} publisher is a reference`);
      assert.deepEqual(Object.keys(page!["isPartOf"] as object), ["@id"], `${route} isPartOf is a reference`);
    }
  });

  test("no SearchAction anywhere — there is no public search route", () => {
    for (const { route } of ROUTES) {
      assert.ok(!JSON.stringify(nodes(route)).includes("SearchAction"), route);
    }
  });
});

/* ══════════════════════════════════════════════════════════ correction 2: community provenance */

describe("LRG-UX-SCHEMA-001 §2: synthetic community pages claim no user-generated content", { skip }, () => {
  test("a review-fixture forum entry emits page schema only", () => {
    const t = typesOf("/community/florida-pick-3-august-2026");
    for (const banned of ["DiscussionForumPosting", "SocialMediaPosting", "ProfilePage", "Person", "Comment"]) {
      assert.ok(!t.includes(banned), `the entry page emits ${banned}`);
    }
    assert.ok(t.includes("WebPage") && t.includes("BreadcrumbList"));
  });

  test("no fabricated author, reply count or activity statistic reaches the served HTML's schema", () => {
    const raw = JSON.stringify(nodes("/community/florida-pick-3-august-2026"));
    for (const banned of ["InteractionCounter", "userInteractionCount", '"author"']) {
      assert.ok(!raw.includes(banned), `the entry schema contains ${banned}`);
    }
  });

  test("the community home withholds its ItemList while every card is a fixture", () => {
    const t = typesOf("/community");
    assert.ok(t.includes("CollectionPage"));
    assert.ok(!t.includes("ItemList"), "an ItemList of fixture threads claims the site holds those discussions");
  });
});

/* ══════════════════════════════════════════════════════════ correction 3: article imagery */

describe("LRG-UX-SCHEMA-001 §3: article schema never stands the site logo in for an image", { skip }, () => {
  test("the article graph omits image entirely, and names no logo asset", () => {
    const article = nodes("/news/mega-millions-2025-matrix-change")
      .find((n) => n["@type"] === "NewsArticle" || n["@type"] === "Article")!;
    assert.ok(article, "the article page emits an article node");
    assert.ok(!("image" in article), "image is present with no representative asset");
    assert.ok(!JSON.stringify(article).includes("logo.png"), "the article references the site logo");
  });
});

/* ══════════════════════════════════════════════════════════ correction 4: archive schema */

describe("LRG-UX-SCHEMA-001 §4: the archive ItemList is the visible rows, exactly", { skip }, () => {
  const ROUTE = "/fl/pick-3/2026";

  test("CollectionPage + BreadcrumbList + ItemList, and no Dataset of any kind", () => {
    const t = typesOf(ROUTE);
    assert.ok(t.includes("CollectionPage"));
    assert.ok(t.includes("BreadcrumbList"));
    assert.ok(t.includes("ItemList"));
    for (const banned of ["Dataset", "DataCatalog", "DataDownload"]) {
      assert.ok(!t.includes(banned), `${banned} requires a governed dataset release, and none exists`);
    }
  });

  test("count and ORDER match the rendered result rows, anchor for anchor", () => {
    const list = nodes(ROUTE).find((n) => n["@type"] === "ItemList") as {
      numberOfItems: number;
      itemListElement: { position: number; url: string }[];
    };
    /* The rendered rows carry their own anchor as the `<tr id>`; the ItemList must name the same set, in the
       same order. Comparing the anchor STRINGS is what makes this a DOM check rather than two derivations of
       one source agreeing with each other. */
    const domAnchors = matchAll(/<tr id="(draw-[^"]+)"/g, html(ROUTE));
    const ldAnchors = list.itemListElement.map((i) => i.url.split("#")[1]);
    assert.ok(domAnchors.length > 0, "the archive renders result rows");
    assert.deepEqual(ldAnchors, domAnchors, "ItemList order/count must equal the visible rows");
    assert.equal(list.numberOfItems, domAnchors.length);
    assert.deepEqual(list.itemListElement.map((i) => i.position),
      domAnchors.map((_, i) => i + 1), "positions are 1..n with no gaps");
  });

  test("no dateModified is claimed from a build clock", () => {
    for (const n of nodes(ROUTE)) {
      assert.ok(!("dateModified" in n), "the archive has no freshness record to state one from");
    }
  });
});

/* ══════════════════════════════════════════════════════════ corrections 5 & 6: navigation */

describe("LRG-UX-SCHEMA-001 §5/§6: the two navigations, on every page", { skip }, () => {
  test("desktop carries exactly GS-03's seven, in order, on every family", () => {
    for (const { route } of ROUTES) {
      const items = navItems(route, "Primary");
      assert.deepEqual(items.map((i) => i.text), [...PRIMARY_NAV_LABELS], route);
    }
  });

  test("mobile carries exactly GS-09's five, in order, on every family", () => {
    for (const { route } of ROUTES) {
      const items = navItems(route, "Main sections");
      assert.deepEqual(items.map((i) => i.text), [...BOTTOM_NAV_LABELS], route);
    }
  });

  test("an unavailable destination is never an <a>, in either navigation", () => {
    for (const { route } of ROUTES) {
      for (const label of ["Primary", "Main sections"]) {
        const nav = html(route).match(new RegExp(`<nav aria-label="${label}"[\\s\\S]*?</nav>`))?.[0] ?? "";
        assert.ok(!/<a\b[^>]*aria-disabled/.test(nav), `${route} ${label}: aria-disabled on a link`);
        /* Each item is EITHER a link or a span-with-"soon" — never a link that claims to be unavailable. */
        for (const m of nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
          const isLink = /<a\b/.test(m[1]);
          const saysSoon = /soon/i.test(m[1]);
          assert.ok(!(isLink && saysSoon), `${route} ${label}: an unavailable item rendered as a link`);
        }
      }
    }
  });

  test("the current page is marked once, with aria-current, and is still a link", () => {
    for (const [route, label] of [["/tools", "Tools"], ["/community", "Community"], ["/news", "News"]] as const) {
      const items = navItems(route, "Primary");
      const current = items.filter((i) => i.current);
      assert.equal(current.length, 1, `${route} marks exactly one current entry`);
      assert.equal(current[0].text, label);
      assert.ok(current[0].isLink, "the current page stays reachable (WCAG 2.4.8)");
    }
  });

  test("Ask AI is not duplicated between the mobile header and the bottom navigation", () => {
    for (const { route } of ROUTES) {
      const head = html(route).split('<nav aria-label="Main sections"')[0];
      const mobileAi = (head.match(/lcp-mobile-only[^"]*"[^>]*>\s*<svg/g) ?? []).length;
      assert.equal(mobileAi, 0, `${route}: the mobile header still carries its own AI control`);
    }
  });

  test("GS-05 search is disabled and says so in visible text, with no SearchAction", () => {
    for (const { route } of ROUTES) {
      const input = html(route).match(/<input[^>]*id="lcp-search"[^>]*>/)?.[0];
      if (!input) continue;
      assert.ok(/\bdisabled\b/.test(input), `${route}: search must be disabled, not readOnly`);
      assert.ok(!/readonly/i.test(input), `${route}: readOnly leaves it in the tab order`);
      assert.ok(html(route).includes("Search is not available yet."), `${route}: the reason must be visible`);
    }
  });
});

/* ══════════════════════════════════════════════════════════ correction 8: id uniqueness */

describe("LRG-UX-SCHEMA-001 §8: every governed section id appears exactly once", { skip }, () => {
  test("no duplicate data-section-id in the rendered DOM of any reviewed family", () => {
    for (const { route } of ROUTES) {
      const ids = matchAll(/data-section-id="([^"]+)"/g, html(route));
      const dupes = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
      assert.deepEqual(dupes, [], `${route} renders ${dupes.join(", ")} more than once`);
    }
  });

  test("the flagship merge is preserved: FG-11 and FG-12 still map to FG-13", () => {
    /* Uniqueness must not have been bought by deleting the merged ids — the documented relationship survives,
       carried by `data-merged-into` on each merged rail. */
    const page = html("/powerball");
    for (const id of ["FG-11", "FG-12", "FG-13"]) {
      assert.equal((page.match(new RegExp(`data-section-id="${id}"`, "g")) ?? []).length, 1, id);
    }
    assert.equal((page.match(/data-merged-into="FG-13"/g) ?? []).length, 2);
  });

  test("exactly one h1 per page", () => {
    for (const { route } of ROUTES) {
      assert.equal(matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g, html(route)).length, 1, route);
    }
  });
});

/* ══════════════════════════════════════════════════════════ correction 7: server-rendered facts */

describe("LRG-UX-SCHEMA-001 §7: compression moved nothing and hid no public fact", { skip }, () => {
  test("Home still renders all thirty governed entries, in the governed order", () => {
    const ids = matchAll(/<section id="(H-[^"]+)"/g, html("/"));
    /* 30 entries minus the seven ad anchors, which are `<div>` markers rather than sections. */
    assert.equal(ids.length, 23, "a compression pass must never drop a section");
    assert.equal(new Set(ids).size, 23);
  });

  test("the seven ad anchors are all present, in their governed order", () => {
    const anchors = matchAll(/data-ad-anchor-id="(AD-H\d+)"/g, html("/"));
    assert.deepEqual(anchors, ["AD-H00", "AD-H01", "AD-H02", "AD-H03", "AD-H04", "AD-H05", "AD-H06"]);
  });

  test("drawn numbers and the source line are in the SERVER HTML, not injected", () => {
    const home = html("/");
    assert.match(home, /Last updated:/);
    /* React emits a text-node separator between a literal and an interpolation, so the label and its value are
       never contiguous in the HTML. Asserted as the pair rather than as a string the renderer never produces. */
    assert.match(home, /Source: (<!-- -->)?Official state lottery draw results/);
    /* H-02A's result cards are server-rendered: the game names and a draw date are in the initial document. */
    assert.match(home, /Powerball/);
    assert.match(home, /Draw date:/);
  });

  test("the community composer opens collapsed, and reading is never gated", () => {
    const page = html("/community");
    assert.match(page, /data-composer-expanded="false"/);
    assert.match(page, /aria-expanded="false"[^>]*aria-controls="lcc-composer-body"/);
    assert.match(page, /Reading the community needs no account/);
    /* CH-01..CH-03 keep their order and their ids. */
    const ids = matchAll(/data-section-id="(CH-\d+)"/g, page);
    assert.deepEqual(ids.slice(0, 3), ["CH-01", "CH-02", "CH-03"]);
  });
});

/* ══════════════════════════════════════════════════ LRG-UX-SCHEMA-002 §1: the AI trigger */

describe("LRG-UX-SCHEMA-002 §1: the AI trigger never promises an answer it cannot give", { skip }, () => {
  test("an unavailable trigger is NOT a link, and carries a visible reason", () => {
    for (const { route } of ROUTES) {
      const el = html(route).match(/<(a|span)\b[^>]*data-ai-trigger="unavailable"[^>]*>[\s\S]*?<\/\1>/);
      if (!el) continue;
      assert.equal(el[1], "span", `${route}: an unavailable AI trigger rendered as <${el[1]}>`);
      assert.ok(!/href=/.test(el[0]), `${route}: it must have no destination at all`);
      assert.ok(!/tabindex="0"/.test(el[0]), `${route}: it must not be placed in the tab order`);
      /* The reason is TEXT in the element, not a title attribute and not an aria-only string. */
      assert.match(el[0].replace(/<[^>]*>/g, " "), /Not on this page yet/, `${route}: no visible reason`);
    }
  });

  test("/ai-policy is never used as a disguised Ask action", () => {
    for (const { route } of ROUTES) {
      const header = html(route).split("<main")[0];
      const aiLinks = [...header.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
        .filter((m) => /Ask LotteryCorner|Ask AI|Explore AI/.test(m[2].replace(/<[^>]*>/g, "")));
      for (const m of aiLinks) {
        assert.notEqual(m[1], "/ai-policy", `${route}: an Ask control points at the policy page`);
        assert.ok(!m[1].endsWith("#"), `${route}: an Ask control points at a bare fragment`);
      }
    }
  });

  test("every LIVE AI link resolves to an element that exists in the SAME rendered page", () => {
    let checked = 0;
    for (const { route } of ROUTES) {
      const page = html(route);
      for (const m of page.matchAll(/data-ai-trigger="live"[^>]*/g)) {
        const href = /href="([^"]+)"/.exec(m[0])?.[1]
          ?? /href="([^"]+)"[^>]*data-ai-trigger="live"/.exec(page)?.[1];
        assert.ok(href, `${route}: a live trigger with no href`);
        assert.ok(href!.startsWith("#"), `${route}: GS-06 must be contextual, got ${href}`);
        const id = href!.slice(1);
        assert.match(page, new RegExp(`id="${id}"`), `${route}: #${id} is not in this page's own output`);
        checked += 1;
      }
      /* The bottom-nav Ask AI entry is the same claim, made in the other navigation. */
      const bottom = page.match(/<nav aria-label="Main sections"[\s\S]*?<\/nav>/)?.[0] ?? "";
      const askLink = /<a\b[^>]*href="([^"]+)"[^>]*>\s*Ask AI\s*<\/a>/.exec(bottom);
      if (askLink) {
        assert.ok(askLink[1].startsWith("#"), `${route}: mobile Ask AI must be a same-page anchor`);
        assert.match(page, new RegExp(`id="${askLink[1].slice(1)}"`), `${route}: mobile Ask AI target missing`);
        checked += 1;
      }
    }
    assert.ok(checked > 0, "at least one page must genuinely offer a live AI target");
  });

  test("Home's trigger is live and lands on H-05, the surface Home actually renders", () => {
    const home = html("/");
    assert.match(home, /data-ai-trigger="live"/);
    assert.match(home, /<section id="H-05"/);
  });
});

/* ══════════════════════════════════════════════════ LRG-UX-SCHEMA-002 §2: active navigation */

describe("LRG-UX-SCHEMA-002 §2: every family carries its mapped navigation state", { skip }, () => {
  for (const { route, primary, bottom } of ROUTES) {
    test(`${route} — primary ${primary ?? "none"}, mobile ${bottom ?? "none"}`, () => {
      const desktop = navItems(route, "Primary");
      const mobile = navItems(route, "Main sections");
      assert.deepEqual(desktop.filter((i) => i.current).map((i) => i.text), primary ? [primary] : []);
      assert.deepEqual(mobile.filter((i) => i.current).map((i) => i.text), bottom ? [bottom] : []);
    });
  }

  test("no navigation ever has more than one current item", () => {
    for (const { route } of ROUTES) {
      for (const label of ["Primary", "Main sections"]) {
        const current = navItems(route, label).filter((i) => i.current);
        assert.ok(current.length <= 1, `${route} ${label}: ${current.length} current items`);
      }
    }
  });

  test("a current item is still a link — identified, never made unreachable", () => {
    for (const { route } of ROUTES) {
      for (const label of ["Primary", "Main sections"]) {
        for (const item of navItems(route, label).filter((i) => i.current)) {
          assert.ok(item.isLink, `${route} ${label}: "${item.text}" is current but not reachable`);
        }
      }
    }
  });

  test("the seven and five contracts survive the change", () => {
    for (const { route } of ROUTES) {
      assert.deepEqual(navItems(route, "Primary").map((i) => i.text), [...PRIMARY_NAV_LABELS], route);
      assert.deepEqual(navItems(route, "Main sections").map((i) => i.text), [...BOTTOM_NAV_LABELS], route);
    }
  });
});

/* ══════════════════════════════════════════════════ LRG-UX-SCHEMA-002 §3: article imagery */

describe("LRG-UX-SCHEMA-002 §3: schema imagery cannot exceed visible imagery", { skip }, () => {
  test("an article emitting image must SHOW that exact file; none does today", () => {
    for (const route of ["/news/mega-millions-2025-matrix-change", "/blog/hot-and-cold-numbers-an-honest-look"]) {
      const article = nodes(route).find((n) => ["NewsArticle", "Article", "BlogPosting"].includes(n["@type"] as string));
      assert.ok(article, `${route} emits an article node`);
      const images = (article!["image"] ?? []) as { url: string; width: number; height: number }[];
      for (const img of images) {
        /* The schema URL is absolute; the markup is origin-relative. Compare the PATH, which is the file. */
        const path = img.url.replace(/^https:\/\/[^/]+/, "");
        assert.match(html(route), new RegExp(`src="${path}"`), `${route}: schema names an unshown image`);
        assert.match(html(route), new RegExp(`width="${img.width}"`));
        assert.match(html(route), new RegExp(`height="${img.height}"`));
      }
      /* Today: no asset, so neither figure nor image key. */
      assert.equal(images.length, 0, `${route}: no corpus record carries a representative image`);
      assert.ok(!html(route).includes('data-representative-image'), `${route}: nothing renders one either`);
      assert.ok(!JSON.stringify(article).includes("logo.png"), `${route}: the logo is not article imagery`);
    }
  });
});

/* ══════════════════════════════════════════════════ LRG-UX-SCHEMA-002 §4: community counts */

describe("LRG-UX-SCHEMA-002 §4: no interaction count without the comments behind it", { skip }, () => {
  test("a fixture entry page emits no counter and no comment", () => {
    const raw = JSON.stringify(nodes("/community/florida-pick-3-august-2026"));
    for (const banned of ["userInteractionCount", "InteractionCounter", '"Comment"', "DiscussionForumPosting"]) {
      assert.ok(!raw.includes(banned), `the served entry page contains ${banned}`);
    }
  });

  test("wherever a counter IS emitted, it equals the number of emitted comments", () => {
    for (const { route } of ROUTES) {
      for (const n of nodes(route)) {
        const stat = n["interactionStatistic"] as { userInteractionCount: number }[] | undefined;
        if (!stat) continue;
        const comments = (n["comment"] ?? []) as unknown[];
        assert.equal(stat[0].userInteractionCount, comments.length,
          `${route}: a counter of ${stat[0].userInteractionCount} against ${comments.length} comments`);
      }
    }
  });
});

/* ══════════════════════════════════════════════════ LRG-UX-SCHEMA-002 §5: archive row labels */

describe("LRG-UX-SCHEMA-002 §5: every ItemList label is on the page", { skip }, () => {
  const ROUTE = "/fl/pick-3/2026";

  test("each ListItem's date and variant text appear in ITS OWN table row", () => {
    const list = nodes(ROUTE).find((n) => n["@type"] === "ItemList") as {
      itemListElement: { name: string; url: string }[];
    };
    const page = html(ROUTE);
    /* Split the table into rows keyed by the anchor each `<tr id>` carries. */
    const rows = new Map<string, string>();
    for (const m of page.matchAll(/<tr id="(draw-[^"]+)"([\s\S]*?)<\/tr>/g)) rows.set(m[1], m[2]);
    assert.ok(rows.size > 0, "the archive renders anchored result rows");

    for (const item of list.itemListElement) {
      const anchor = item.url.split("#")[1];
      const row = rows.get(anchor);
      assert.ok(row, `ItemList names ${anchor}, which is not a rendered row`);
      /* The label is "<Game> <variant> — <displayed date>". Both variable halves must be IN that row. */
      const [, tail] = item.name.split(" — ");
      assert.ok(tail, `${item.name} does not carry a displayed date`);
      const text = row!.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
      assert.ok(text.includes(tail), `${anchor}: schema date "${tail}" is not in the row (${text.slice(0, 80)})`);
      const variant = item.name.slice(0, item.name.indexOf(" — ")).replace(/^.*?Pick 3\s*/, "").trim();
      if (variant) {
        assert.ok(text.includes(variant), `${anchor}: schema variant "${variant}" is not in the row`);
      }
    }
  });

  test("the visible Main fallback is represented, not omitted", () => {
    const page = html(ROUTE);
    const list = nodes(ROUTE).find((n) => n["@type"] === "ItemList") as {
      itemListElement: { name: string }[];
    };
    /* If the table prints `Main` in its variant column, the labels must say `Main` too — that fallback is
       exactly what the old ISO-date label dropped. */
    const printsMain = /<td>Main<\/td>/.test(page);
    const labelsMain = list.itemListElement.some((i) => i.name.includes(" Main "));
    assert.equal(labelsMain, printsMain, "the Main fallback must appear in both places or neither");
  });

  test("no ISO date survives in any ItemList label", () => {
    const list = nodes(ROUTE).find((n) => n["@type"] === "ItemList") as {
      itemListElement: { name: string }[];
    };
    for (const i of list.itemListElement) {
      assert.doesNotMatch(i.name, /\d{4}-\d{2}-\d{2}/, `${i.name} uses a format the table never shows`);
    }
  });

  test("no drawn NUMBER is asserted in schema — only what the label proves", () => {
    const list = nodes(ROUTE).find((n) => n["@type"] === "ItemList") as {
      itemListElement: Record<string, unknown>[];
    };
    for (const i of list.itemListElement) {
      assert.deepEqual(Object.keys(i).sort(), ["@type", "name", "position", "url"]);
    }
  });
});

/* ══════════════════════════════════════════════════ prohibited schema, everywhere */

describe("LRG-UX-SCHEMA-002: no prohibited or invented schema type appears", { skip }, () => {
  /*
   * The types this build is allowed to emit. An ALLOWLIST rather than a banned-substring scan, because the
   * first draft of this test banned the substring "Lottery" and matched the site's own name — `LotteryCorner`
   * appears legitimately in every Organization node. Checking `@type` values answers the actual question:
   * has an invented or prohibited TYPE entered the graph?
   */
  const ALLOWED_TYPES = new Set([
    "Organization", "WebSite", "WebPage", "CollectionPage", "ProfilePage", "BreadcrumbList", "ListItem",
    "ItemList", "NewsArticle", "Article", "BlogPosting", "DiscussionForumPosting", "Comment", "Person",
    "ImageObject", "InteractionCounter", "SpeakableSpecification",
  ]);

  test("every emitted @type is a real, approved schema.org type", () => {
    for (const { route } of ROUTES) {
      const seen = new Set<string>();
      const walk = (v: unknown): void => {
        if (Array.isArray(v)) { v.forEach(walk); return; }
        if (!v || typeof v !== "object") return;
        const o = v as Record<string, unknown>;
        if (typeof o["@type"] === "string") seen.add(o["@type"] as string);
        Object.values(o).forEach(walk);
      };
      walk(nodes(route));
      for (const t of seen) {
        assert.ok(ALLOWED_TYPES.has(t), `${route} emits "${t}" — invented or unapproved`);
      }
    }
  });

  test("no SearchAction, Dataset, Product or Offer anywhere", () => {
    for (const { route } of ROUTES) {
      const raw = JSON.stringify(nodes(route));
      for (const banned of ["SearchAction", "potentialAction", "Dataset", "DataCatalog", "DataDownload",
                            '"Product"', '"Offer"', '"AggregateRating"', '"Review"']) {
        assert.ok(!raw.includes(banned), `${route} emits ${banned}`);
      }
    }
  });
});
