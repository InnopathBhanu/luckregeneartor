/*
 * THE REPRESENTATIVE ARTICLE IMAGE — markup and schema, proven to agree. LRG-UX-SCHEMA-002 §3.
 *
 * ══ WHAT THE PREVIOUS TEST DID, AND WHY IT PASSED WHILE THE FEATURE WAS ABSENT ══
 *
 * `news-pages.test.ts` and `blog-pages.test.ts` each built a record with a fabricated `representativeImage`,
 * passed it to the SCHEMA BUILDER, and asserted the builder's output contained an `ImageObject`. Both passed.
 * Neither could have failed, because neither asked the only question that mattered: does the page show it?
 * It did not — nothing rendered `representativeImage` at all.
 *
 * So this file renders the component with `react-dom/server` and compares the MARKUP against the SCHEMA for
 * the same asset. A regression that removes the render, or that lets schema describe an asset the markup
 * withheld, fails here.
 *
 * The fixtures below are constructed IN THIS FILE and never touch the corpus: §3 forbids adding images to
 * current fixtures, and the last two tests assert the corpus is still image-free in both markup and schema.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import RepresentativeImage from "../components/editorial/RepresentativeImage";
import {
  articleImageField, articleImageUrl, isRenderableArticleImage, type ArticleImageAsset,
} from "../lib/seo/articleImage";
import { PRODUCTION_ORIGIN } from "../lib/seo/productionOrigin";
import { getNewsAuthor, getNewsData } from "../lib/news/bff/newsBff";
import { newsArticleSchema } from "../lib/news/newsSchema";
import { getBlogAuthor, getBlogData } from "../lib/blog/bff/blogBff";
import { blogPostSchema } from "../lib/blog/blogSchema";

const VALID: ArticleImageAsset = {
  url: "/news/matrix-change-card.png",
  width: 1200,
  height: 675,
  alt: "Before and after the Mega Ball pool change",
  caption: "The pool moved from 25 balls to 24.",
};

const render = (asset: ArticleImageAsset | null | undefined) =>
  renderToStaticMarkup(createElement(RepresentativeImage, { asset, className: "lcn-figure" }));

/* ══════════════════════════════════════════════════════════════════ the render */

describe("LRG-UX-SCHEMA-002 §3: the representative image renders, with its real fields", () => {
  test("a valid asset produces a figure carrying the exact url, dimensions, alt and caption", () => {
    const html = render(VALID);
    assert.match(html, /<figure[^>]*data-representative-image="true"/);
    assert.match(html, new RegExp(`src="${VALID.url}"`));
    assert.match(html, /width="1200"/);
    assert.match(html, /height="675"/);
    assert.match(html, new RegExp(`alt="${VALID.alt.replace(/ /g, " ")}"`));
    assert.ok(html.includes(VALID.caption!), "a supplied caption is visible");
  });

  test("intrinsic dimensions are ATTRIBUTES, so the box is reserved before the file loads", () => {
    const html = render(VALID);
    /* Not inline styles and not CSS-only: a `width`/`height` attribute pair is what lets the browser compute
       the aspect ratio on the first layout pass. Losing them is a layout-shift regression that no visual
       inspection of a cached page would reveal. */
    assert.match(html, /<img[^>]*width="1200"[^>]*height="675"/);
  });

  test("no asset renders nothing at all — not an empty figure, not a placeholder", () => {
    assert.equal(render(null), "");
    assert.equal(render(undefined), "");
  });

  test("a caption is optional; its absence produces no empty figcaption", () => {
    const html = render({ ...VALID, caption: undefined });
    assert.match(html, /<figure/);
    assert.ok(!html.includes("figcaption"), "an empty caption element is a visible artefact of missing data");
  });

  test("the site logo can never be the article image, because nothing supplies it", () => {
    assert.ok(!render(VALID).includes("logo.png"));
  });
});

/* ══════════════════════════════════════════════════════════════════ the gate */

describe("LRG-UX-SCHEMA-002 §3: an invalid asset is withheld from BOTH markup and schema", () => {
  /** Each case names one way an `image` claim goes wrong. */
  const INVALID: [string, ArticleImageAsset][] = [
    ["empty url", { ...VALID, url: "" }],
    ["protocol-relative url", { ...VALID, url: "//evil.example/x.png" }],
    ["plain http url", { ...VALID, url: "http://example.com/x.png" }],
    ["javascript url", { ...VALID, url: "javascript:alert(1)" }],
    ["zero width", { ...VALID, width: 0 }],
    ["negative height", { ...VALID, height: -675 }],
    ["fractional width", { ...VALID, width: 1200.5 }],
    ["NaN height", { ...VALID, height: Number.NaN }],
    ["infinite width", { ...VALID, width: Number.POSITIVE_INFINITY }],
    ["empty alt", { ...VALID, alt: "" }],
    ["whitespace alt", { ...VALID, alt: "   " }],
  ];

  for (const [why, asset] of INVALID) {
    test(`${why}: no markup and no schema`, () => {
      assert.equal(isRenderableArticleImage(asset), false, why);
      assert.equal(render(asset), "", `${why} must render nothing`);
      assert.deepEqual(articleImageField(asset, PRODUCTION_ORIGIN), {}, `${why} must emit no image`);
    });
  }

  test("an absolute HTTPS url is accepted and passed through unchanged", () => {
    const asset = { ...VALID, url: "https://cdn.example.com/a.png" };
    assert.ok(isRenderableArticleImage(asset));
    assert.equal(articleImageUrl(asset, PRODUCTION_ORIGIN), "https://cdn.example.com/a.png");
  });
});

/* ══════════════════════════════════════════════════════════════════ markup ↔ schema */

describe("LRG-UX-SCHEMA-002 §3: schema cannot describe an image the markup withheld", () => {
  test("the news article graph and the rendered figure name the SAME file and dimensions", () => {
    const base = getNewsData().articles[0];
    const author = getNewsAuthor(base.authorSlug)!;
    const node = (newsArticleSchema({ ...base, representativeImage: VALID }, author) as {
      "@graph": Record<string, unknown>[];
    })["@graph"][0];
    const image = (node["image"] as { url: string; width: number; height: number; caption?: string }[])[0];

    const html = render(VALID);
    /* The schema URL is absolute and the markup URL is origin-relative — the SAME file, and this is the
       assertion that they resolve to it. Comparing the raw strings would pass while pointing at two files. */
    assert.equal(image.url, `${PRODUCTION_ORIGIN}${VALID.url}`);
    assert.ok(html.includes(`src="${VALID.url}"`));
    assert.equal(image.width, VALID.width);
    assert.equal(image.height, VALID.height);
    assert.ok(html.includes(`width="${image.width}"`));
    assert.ok(html.includes(`height="${image.height}"`));
    assert.equal(image.caption, VALID.caption);
    assert.ok(html.includes(VALID.caption!));
  });

  test("the blog post graph behaves identically — one implementation, two families", () => {
    const base = getBlogData().posts[0];
    const author = getBlogAuthor(base.authorSlug)!;
    const node = (blogPostSchema({ ...base, representativeImage: VALID }, author) as {
      "@graph": Record<string, unknown>[];
    })["@graph"][0];
    const image = (node["image"] as { url: string; width: number }[])[0];
    assert.equal(image.url, `${PRODUCTION_ORIGIN}${VALID.url}`);
    assert.equal(image.width, VALID.width);
  });

  test("an invalid asset yields an article graph with NO image key at all", () => {
    const base = getNewsData().articles[0];
    const author = getNewsAuthor(base.authorSlug)!;
    const bad = { ...VALID, alt: "" };
    const node = (newsArticleSchema({ ...base, representativeImage: bad }, author) as {
      "@graph": Record<string, unknown>[];
    })["@graph"][0];
    assert.ok(!("image" in node), "a withheld asset must leave no trace in schema");
    assert.equal(render(bad), "");
  });
});

/* ══════════════════════════════════════════════════════════════════ the corpus is unchanged */

describe("LRG-UX-SCHEMA-002 §3: no image was added to any current fixture", () => {
  test("every news article still renders no figure and emits no image", () => {
    for (const a of getNewsData().articles) {
      assert.equal(render(a.representativeImage), "", a.slug);
      assert.deepEqual(articleImageField(a.representativeImage, PRODUCTION_ORIGIN), {}, a.slug);
    }
  });

  test("every blog post still renders no figure and emits no image", () => {
    for (const p of getBlogData().posts) {
      assert.equal(render(p.representativeImage), "", p.slug);
      assert.deepEqual(articleImageField(p.representativeImage, PRODUCTION_ORIGIN), {}, p.slug);
    }
  });
});
