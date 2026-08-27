/*
 * LRG-STATE-048 — representative State content hydration and preview-language removal.
 *
 * Two things are load-bearing here. First, the INTERNAL-LANGUAGE AUDIT: it runs over the public component
 * sources rather than over a served page, so a leak cannot come back through a component that today happens
 * to be suppressed. Second, the Florida/Utah non-regression assertions, which are what let this task touch
 * shared components at all.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { stateViewConfigFor } from "../lib/state/stateViewConfigRegistry";
import { validateStateViewConfig } from "../lib/state/stateViewConfig";
import { buildStatePreviewModel } from "../lib/state/statePreviewModel";
import { assertLowerPageContentSafe } from "../lib/state/stateLowerPageContent";

const HYDRATED = ["mi", "va", "ca", "md"];
const ALL = ["fl", "mi", "va", "ca", "md", "ut"];

/** The four founder-supplied video ids, restated here so a configuration edit cannot quietly swap one. */
const FIXED_VIDEOS: Record<string, string> = {
  mi: "5Bx-u2g5xXg",
  va: "LMVq-937NWI",
  ca: "U7chQUq4DrE",
  md: "v_0X13KKl8o",
};

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const codeOnly = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const raw = (c: string) =>
  JSON.parse(readFileSync(new URL(`../config/states/${c}.json`, import.meta.url), "utf8"));

const modelFor = (c: string) => {
  const m = buildStatePreviewModel(c, true, { now: new Date("2026-08-02T12:00:00Z") });
  assert.ok(m, `${c} must build`);
  return m!;
};

/* ------------------------------------------------------------------ content floor */

describe("LRG-STATE-048: the four States are no longer skeletal", () => {
  test("each has a populated Explore band with at least three real entries", () => {
    for (const c of HYDRATED) {
      const items = stateViewConfigFor(c)!.content.explore.items;
      assert.ok(items.length >= 3, `${c} has ${items.length} Explore entries`);
      for (const i of items) {
        assert.ok(i.title && i.copy && i.actionLabel, `${c}/${i.key} is incomplete`);
        /* Utility actions stay on LotteryCorner — an Explore tile must never be an outbound link. */
        assert.notEqual(i.destination.kind, "route" as string,
          `${c}/${i.key}: no internal route exists yet, so a route destination would be a dead control`);
        if (i.destination.kind === "inPage") assert.ok(i.destination.fragment);
      }
    }
  });

  test("each has at least three guide cards, every one with a destination and an action", () => {
    for (const c of HYDRATED) {
      const items = stateViewConfigFor(c)!.content.guides.items;
      assert.ok(items.length >= 3, `${c} has ${items.length} guides`);
      for (const g of items) {
        assert.ok(g.title && g.summary && g.actionLabel, `${c}/${g.key} is incomplete`);
        assert.ok(g.takeaways.length >= 2, `${c}/${g.key} has too few takeaways`);
        assert.ok(g.destination, `${c}/${g.key} has no destination`);
      }
    }
  });

  test("each has State community starters and a resources group", () => {
    for (const c of HYDRATED) {
      const cfg = stateViewConfigFor(c)!;
      assert.ok(cfg.content.community.items.length >= 3, c);
      assert.ok(cfg.content.resources.items.length >= 3, c);
    }
  });

  test("the populated sections actually render", () => {
    for (const c of HYDRATED) {
      const m = modelFor(c);
      assert.equal(m.hasLowerContent, true, c);
      for (const id of ["S-10", "S-14", "S-15", "S-18"] as const) {
        assert.equal(m.sectionState[id].render, true, `${c} ${id} must now render`);
      }
    }
  });

  test("no State reuses another State's copy", () => {
    /* The specific failure guarded against is a copy-paste hydration that leaves Florida's or a sibling's
       game names in another State's file. */
    const names: Record<string, string> = {
      fl: "Florida", mi: "Michigan", va: "Virginia", ca: "California", md: "Maryland", ut: "Utah",
    };
    for (const c of ALL) {
      const flat = JSON.stringify(stateViewConfigFor(c)!.content);
      for (const [other, name] of Object.entries(names)) {
        if (other === c) continue;
        assert.ok(!flat.includes(name), `${c}.json mentions ${name}`);
      }
    }
  });

  test("news stays suppressed rather than fabricated", () => {
    for (const c of HYDRATED) {
      assert.equal(stateViewConfigFor(c)!.content.news.items.length, 0, `${c} must have no news items`);
      /* And nothing evergreen is labelled "Latest". */
      assert.equal(stateViewConfigFor(c)!.content.news.heading, "", c);
    }
  });

  test("no fabricated community metrics, and starters are labelled honestly", () => {
    for (const c of HYDRATED) {
      const cfg = stateViewConfigFor(c)!;
      const flat = JSON.stringify(cfg.content.community);
      for (const banned of ["replies", "views", "likes", "avatar", "author", "trending", "upvotes", "postedBy"]) {
        assert.ok(!flat.includes(banned), `${c} community carries ${banned}`);
      }
      assert.match(cfg.content.community.intro, /discussion starters written by LotteryCorner, not player posts/);
      for (const i of cfg.content.community.items) {
        assert.ok(i.tags.includes("Discussion starter"), `${c}/${i.key} must be labelled a starter`);
      }
      /* The module-load safety assertion still bites on this content. */
      assertLowerPageContentSafe(modelFor(c).lowerContent);
    }
  });
});

/* ------------------------------------------------------------------ claim video */

describe("LRG-STATE-048: claim videos", () => {
  test("each hydrated State carries its fixed video id, and Utah carries none", () => {
    for (const [c, id] of Object.entries(FIXED_VIDEOS)) {
      const v = stateViewConfigFor(c)!.content.claimVideo;
      assert.ok(v, `${c} must have a claim video`);
      assert.equal(v!.videoId, id, `${c} video id`);
      assert.equal(v!.embedUrl, `https://www.youtube-nocookie.com/embed/${id}`);
      assert.equal(v!.watchUrl, `https://www.youtube.com/watch?v=${id}`);
      assert.equal(v!.ownerLabel, "LotteryCorner video");
    }
    assert.equal(stateViewConfigFor("ut")!.content.claimVideo ?? null, null, "Utah must have no claim video");
    assert.equal(stateViewConfigFor("fl")!.content.claimVideo ?? null, null, "Florida is unchanged by this task");
  });

  test("video copy states no prize amount and no deadline", () => {
    /* The video is content we own; the rules inside it are governed facts owned by the manifest, and for
       these four States the manifest records them as unresearched. */
    for (const c of HYDRATED) {
      const v = stateViewConfigFor(c)!.content.claimVideo!;
      const copy = `${v.title} ${v.description}`;
      assert.ok(!/\$[\d,]/.test(copy), `${c} video copy states an amount`);
      assert.ok(!/\b\d+\s*(days?|months?|years?)\b/i.test(copy), `${c} video copy states a deadline`);
    }
    const bad = raw("mi");
    bad.content.claimVideo.description = "Claim within 180 days.";
    assert.throws(() => validateStateViewConfig(bad, "t"), /deadline/);
  });

  test("a mismatched or non-privacy-enhanced URL fails validation", () => {
    for (const [field, value, re] of [
      ["embedUrl", "https://www.youtube.com/embed/5Bx-u2g5xXg", /embedUrl/],
      ["watchUrl", "https://youtu.be/5Bx-u2g5xXg", /watchUrl/],
      ["videoId", "not a video id!", /videoId/],
    ] as const) {
      const bad = raw("mi");
      bad.content.claimVideo[field] = value;
      assert.throws(() => validateStateViewConfig(bad, "t"), re, field);
    }
  });

  test("the player never autoplays, never opens a modal and loads only on request", () => {
    const s = src("components/state/preview/StateClaimVideo.tsx");
    const code = codeOnly("components/state/preview/StateClaimVideo.tsx");
    assert.ok(!/autoplay=1|autoPlay/.test(code), "no autoplay");
    assert.ok(!/<dialog|role="dialog"|showModal/.test(code), "no modal");
    assert.ok(!/position:\s*fixed|sticky/.test(code), "no sticky player");
    /* Click-to-load: the iframe exists only in the played branch. */
    assert.match(code, /playing \? \(/);
    assert.match(code, /setPlaying\(true\)/);
    /* The required disclaimer, verbatim. */
    assert.match(s, /Claim rules can change\. Confirm current requirements before claiming\./);
  });

  test("no incomplete VideoObject is emitted", () => {
    /* `VideoObject` needs name, description, thumbnail, uploadDate, duration and embedUrl. Three of those
       are genuinely unknown for these videos, so the node is not emitted at all — the visible video stays
       and the missing metadata is recorded instead. */
    for (const c of HYDRATED) {
      const v = stateViewConfigFor(c)!.content.claimVideo!;
      assert.equal(v.thumbnailUrl, null, c);
      assert.equal(v.uploadDate, null, c);
      assert.equal(v.duration, null, c);
    }
    const schema = codeOnly("lib/seo/stateHubSchema.ts");
    assert.ok(!/VideoObject/.test(schema), "no VideoObject node is emitted while its data is incomplete");
  });
});

/* ------------------------------------------------------------------ public copy */

describe("LRG-STATE-048: no internal language reaches a reader", () => {
  /* Every component that can put words on a State page. Audited as SOURCE so a phrase cannot return via a
     branch that is currently suppressed. */
  const PUBLIC_FILES = [
    "components/state/preview/StatePreview.tsx",
    "components/state/preview/StateBuyNowInline.tsx",
    "components/state/preview/StateClaimVideo.tsx",
    "components/state/preview/StateAiSurface.tsx",
    "components/state/preview/sections/StateUtilitySections.tsx",
    "components/state/preview/sections/StateResultSections.tsx",
    "components/state/preview/sections/StateDraftSections.tsx",
    "components/state/preview/sections/StateLowerBands.tsx",
    "components/state/preview/sections/StateFamilySurface.tsx",
    "components/state/preview/sections/StateNoLottery.tsx",
  ];

  /* Phrases the founder ruling names, plus the three that were actually leaking. */
  const BANNED: [RegExp, string][] = [
    [/verified in this preview/i, "verification-gate language"],
    [/result format is verified/i, "verification-gate language"],
    [/production[- ]derived/i, "provenance vocabulary"],
    [/approved (State )?blueprint/i, "source-authority vocabulary"],
    [/[Oo]perator identity is cited/, "reviewer note"],
    [/time zone from production/i, "implementation note"],
    [/\bNot known yet\b/, "raw capability state"],
    [/no provider record/i, "internal phrasing"],
    [/no approved partner option has been verified/i, "internal phrasing"],
    [/coming soon|not published yet|not available yet/i, "unfinished-looking copy"],
  ];

  test("no banned phrase appears in any public State component", () => {
    for (const f of PUBLIC_FILES) {
      const code = codeOnly(f);
      for (const [re, why] of BANNED) {
        assert.ok(!re.test(code), `${f} contains ${why}: ${re}`);
      }
    }
  });

  test("no raw capability-state name is used as a reader label", () => {
    const code = codeOnly("components/state/preview/StateBuyNowInline.tsx");
    /* The status map may map FROM a governed key, but no governed key may be a VALUE a reader sees. */
    for (const state of ["underReview", "retailOnly", "officialOnline", "notApplicable", "unknown"]) {
      assert.ok(!new RegExp(`["'\`][^"'\`]*\\b${state}\\b[^"'\`]*["'\`]\\s*[,}]`).test(
        code.replace(/^\s*\w+:/gm, ""),
      ), `${state} must not be reader copy`);
    }
    /* And the unknown row is suppressed rather than labelled. */
    assert.ok(!/unknown:\s*"/.test(code), "the unknown status must carry no reader label at all");
    assert.match(code, /statusLabel \? \(/);
  });

  test("no configuration contains internal vocabulary", () => {
    for (const c of ALL) {
      const flat = JSON.stringify(stateViewConfigFor(c)!.content);
      for (const [re, why] of BANNED) {
        assert.ok(!re.test(flat), `${c}.json contains ${why}`);
      }
      for (const term of ["capability", "manifest", "fixture", "view model", "publication gate", "FD-X", "FD-S"]) {
        assert.ok(!flat.includes(term), `${c}.json contains "${term}"`);
      }
    }
  });
});

/* ------------------------------------------------------------------ destinations */

describe("LRG-STATE-048: internal destinations are preferred", () => {
  test("no content card links outside LotteryCorner", () => {
    for (const c of ALL) {
      const cfg = stateViewConfigFor(c)!;
      const cards = [
        ...cfg.content.explore.items, ...cfg.content.news.items,
        ...cfg.content.guides.items, ...cfg.content.community.items,
      ];
      for (const card of cards) {
        assert.notEqual((card.destination as { kind: string }).kind, "external");
        if (card.destination.kind === "route") {
          assert.ok(card.destination.href.startsWith("/"), `${c}/${card.key}`);
        }
      }
    }
  });

  test("the four States' resources are internal anchors, with no unapproved official link", () => {
    /* No official operator URL is verified for these States, so BAND 5's official group is genuinely empty
       and every resource is an in-page LotteryCorner destination. */
    for (const c of HYDRATED) {
      for (const r of stateViewConfigFor(c)!.content.resources.items) {
        assert.equal(r.href, undefined, `${c}: ${r.label} must not be an unverified external link`);
      }
      const anchored = stateViewConfigFor(c)!.content.resources.items.filter((r) => r.fragment);
      assert.ok(anchored.length >= 3, `${c} needs internal anchored resources`);
    }
    /* Florida's official links are unchanged and still external. */
    const flExternal = stateViewConfigFor("fl")!.content.resources.items.filter((r) => r.href);
    assert.equal(flExternal.length, 4);
    for (const r of flExternal) assert.match(r.href!, /^https:\/\/floridalottery\.com\//);
  });

  test("History resolves internally, never to an official site", () => {
    const builder = codeOnly("lib/state/stateFamilyBuilder.ts");
    assert.match(builder, /HISTORY_HREF = "#state-tools"/);
    assert.ok(!/https?:\/\//.test(builder), "the family builder emits no outbound destination");
  });

  test("the only external destinations on a hydrated State page are the YouTube fallbacks", () => {
    for (const c of HYDRATED) {
      const flat = JSON.stringify(stateViewConfigFor(c));
      const urls = [...flat.matchAll(/"(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
      for (const u of urls) {
        assert.ok(/^https:\/\/(www\.youtube\.com\/watch|www\.youtube-nocookie\.com\/embed)/.test(u),
          `${c}.json has an unexpected external destination: ${u}`);
      }
    }
  });
});

/* ------------------------------------------------------------------ non-regression */

describe("LRG-STATE-048: Florida and Utah", () => {
  test("Florida's bands, families and ad profile are untouched", () => {
    const m = modelFor("fl");
    const cfg = stateViewConfigFor("fl")!;
    assert.equal(cfg.content.explore.items.length, 4);
    assert.equal(cfg.content.news.items.length, 4);
    assert.equal(cfg.content.guides.items.length, 3);
    assert.equal(cfg.content.community.items.length, 3);
    assert.equal(cfg.content.resources.items.length, 5);
    assert.equal(m.familySurfaces.length, 10);
    assert.equal(m.adProfile.id, "minimum-florida");
    assert.equal(m.adProfile.placements.length, 10);
    assert.equal(m.commerce.kind, "researched");
  });

  test("Utah stays a concise no-lottery page with nothing added", () => {
    const m = modelFor("ut");
    const cfg = stateViewConfigFor("ut")!;
    assert.equal(m.noLottery, true);
    assert.equal(m.hasLowerContent, false);
    assert.equal(cfg.content.claimVideo ?? null, null);
    assert.equal(cfg.content.explore.items.length, 0);
    assert.equal(cfg.content.guides.items.length, 0);
    assert.equal(cfg.content.community.items.length, 0);
    assert.equal(m.familySurfaces.length, 0);
    assert.equal(m.adProfile.placements.length, 0);
    assert.equal(m.commerce.kind, "notApplicable");
  });

  test("no State gained an advertisement", () => {
    assert.equal(modelFor("fl").adProfile.placements.length, 10);
    for (const c of [...HYDRATED, "ut"]) {
      assert.equal(modelFor(c).adProfile.placements.length, 0, `${c} must still carry no placement`);
    }
  });
});
