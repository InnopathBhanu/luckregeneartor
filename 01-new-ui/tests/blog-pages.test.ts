/*
 * THE BLOG PAGE FAMILY — Conflict 39 conformance.
 *
 * NO BLUEPRINT EXISTS for this family: `source-conflicts.md` **Conflict 39** (CLOSED — RECORDED 2026-08-11)
 * records the founder's Tier-1 authorization that overrides the `CLAUDE.md` §2 block, and names the derivation
 * sources — the approved News article architecture (07B) plus the Experience Architecture §35 blog distinction.
 * The composition contract therefore lives in `lib/blog/blogContract.ts`, and THIS FILE is what freezes it:
 * a drift in the recorded order is a contract change, not a restyle.
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. FABRICATED CONTENT — a current-news claim, invented winner, jackpot figure or odds-improvement promise
 *      entering the evergreen corpus (`CLAUDE.md` §14; Constitution language rules).
 *   2. A FAKE PERSON — a desk author presented as a human, or emitted as `Person` JSON-LD (07 §3; the
 *      community precedent, Conflict 41 condition 4).
 *   3. A DECEPTIVE SURFACE — the deterministic Key points labelled "AI" (`FD-DAT-20`), a fake audio player,
 *      or autoplay.
 *   4. THE COMPOSITION drifting from the recorded order, or an ad entering a protected zone (§12).
 *   5. INDEXABILITY — every blog route stays `noindex`; the search page stays noindex FOREVER; the category
 *      chips must not mint indexable URL variants.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";

import {
  BLOG_CATEGORIES, BLOG_CATEGORY_LABELS, BLOG_HUB_DESCRIPTION, BLOG_HUB_H1, BLOG_HUB_ORDER,
  BLOG_HUB_SECTION_NAMES, BLOG_HUB_SUPPORT, BLOG_HUB_TITLE, BLOG_POST_SECTION_ORDER,
} from "../lib/blog/blogContract";
import {
  BLOG_DATA_MODE, assertBlogPayloadShape, getBlogAuthor, getBlogData, getBlogPost,
} from "../lib/blog/bff/blogBff";
import type { BlogData } from "../lib/blog/bff/blogBffContract";
import { isBlogRouteServed, blogRoutePaths } from "../lib/blog/blogRegistry";
import { buildBlogHubModel } from "../lib/blog/blogHubModel";
import { buildBlogPostModel } from "../lib/blog/blogPostModel";
import { NO_APPROVED_BLOG_PROFILE, blogAdProfile } from "../lib/blog/blogAdProfile";
import {
  BLOG_POSTING_CONDITIONAL_FIELDS, BLOG_POSTING_REQUIRED_FIELDS, SPEAKABLE_SELECTORS, blogAuthorSchema, blogHubSchema, blogPostSchema,
} from "../lib/blog/blogSchema";
import {
  blogAuthorMetadata, blogHubMetadata, blogPostMetadata, blogSearchMetadata,
} from "../lib/blog/blogRouteMetadata";
import {
  KEY_POINTS_LABEL, KEY_POINTS_MAX, KEY_POINTS_MIN, deriveKeyPoints, firstSentence, listenText,
  readingTimeMinutes,
} from "../lib/blog/blogKeyPoints";
import { searchBlog, blogSearchTerms } from "../lib/blog/blogSearch";
import { blogTaggedContentSource } from "../lib/blog/blogTaggedContentSource";
import { taggedFeed } from "../lib/flagship/flagshipTaggedContent";
import { PAGE_FAMILIES, routeInventory, servesPage } from "../lib/registry/pageFamilyRegistry";
import { isSitemapExcluded } from "../lib/seo/sitemapEntries";
import { sectionIntelligence } from "../lib/ai/sectionIntelligence";
import { FOOTER_GROUPS } from "../lib/layout/globalFooterConfig";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped, so a comment QUOTING a rule is not mistaken for a violation. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const SAMPLE_SLUG = "hot-and-cold-numbers-an-honest-look";

/* ══════════════════════════════════════════════════════════════════ the family contract (Conflict 39) */

describe("Conflict 39: the composition contract is recorded, cited, and frozen by this file", () => {
  test("the authority is Conflict 39 — recorded in the contract, the registry and the served DOM", () => {
    assert.match(src("lib/blog/blogContract.ts"), /Conflict 39/);
    assert.match(src("lib/blog/blogRegistry.ts"), /CONFLICT-39/);
    /* Both pages stamp the authority on <main>, so an audit of served HTML can name it. */
    assert.match(src("components/blog/BlogHubPage.tsx"), /data-authority="CONFLICT-39"/);
    assert.match(src("components/blog/BlogPostPage.tsx"), /data-authority="CONFLICT-39"/);
  });

  test("the hub order, verbatim — the test's own copy, independent of the constant", () => {
    assert.deepEqual([...BLOG_HUB_ORDER], [
      "BH-01", "BH-02", "AD-BH00", "BH-03", "BH-04", "AD-BH01", "BH-05", "BH-06",
    ]);
    assert.equal(BLOG_HUB_SECTION_NAMES["BH-01"], "Identity and Navigation");
    assert.equal(BLOG_HUB_SECTION_NAMES["BH-02"], "Featured Post");
    assert.equal(BLOG_HUB_SECTION_NAMES["BH-03"], "Browse by Category");
    assert.equal(BLOG_HUB_SECTION_NAMES["BH-04"], "All Posts by Date");
    assert.equal(BLOG_HUB_SECTION_NAMES["BH-05"], "From the Newsroom");
    assert.equal(BLOG_HUB_SECTION_NAMES["BH-06"], "Desks and Trust");
    /* The model renders that order and nothing else; the component follows the model. */
    const model = buildBlogHubModel();
    assert.deepEqual(model.sections.map((s) => s.id), [...BLOG_HUB_ORDER]);
    const c = src("components/blog/BlogHubPage.tsx");
    assert.match(c, /data-section-order=\{model\.sections\.map\(\(x\) => x\.id\)\.join\(","\)\}/);
    const ids = [...c.matchAll(/(?:section\("|<AdAnchor id="|data-section-id=")(BH-\d\d|AD-BH\d\d)/g)]
      .map((m) => m[1]);
    assert.deepEqual(ids, [...BLOG_HUB_ORDER]);
  });

  test("the post order, verbatim — the founder's composition, with its 07B adaptations recorded", () => {
    assert.deepEqual(BLOG_POST_SECTION_ORDER.map((r) => r.id), [
      "BL-01", "BL-02", "BL-03", "BL-04", "BL-05", "BL-06",
      "BL-07", "BL-08", "BL-09", "BL-10", "BL-11", "BL-12",
    ]);
    assert.deepEqual(BLOG_POST_SECTION_ORDER.map((r) => r.section), [
      "Category, entities and status", "Headline", "Author identity and dates", "Key points",
      "Listen to this article", "Main article", "Related tool, game and state links", "About the author",
      "Sources and corrections", "Share this article", "Related posts", "Play responsibly",
    ]);
    /* Every row records where it came from — a 07B adaptation or a named founder addition. */
    for (const row of BLOG_POST_SECTION_ORDER) {
      assert.ok(row.adaptedFrom.length > 20, `${row.id} records its derivation`);
      assert.match(row.adaptedFrom, /07B|Founder requirement/, `${row.id} names its source`);
    }
    /* The component emits every marker, in the recorded order. */
    const c = src("components/blog/BlogPostPage.tsx");
    const markers = [...c.matchAll(/data-post-section="(BL-\d\d)"|<PostSection id="(BL-\d\d)"/g)]
      .map((m) => m[1] ?? m[2]);
    assert.deepEqual(markers, BLOG_POST_SECTION_ORDER.map((r) => r.id));
    /* And the served DOM carries the order as one attribute. */
    assert.match(c, /data-section-order=\{model\.sections\.map\(\(r\) => r\.id\)\.join\(","\)\}/);
  });

  test("the author bio card sits AT THE END of the read — after the body, before sources", () => {
    const ids = BLOG_POST_SECTION_ORDER.map((r) => r.id);
    assert.ok(ids.indexOf("BL-08") > ids.indexOf("BL-06"), "bio follows the article");
    assert.ok(ids.indexOf("BL-08") > ids.indexOf("BL-07"), "bio follows the related links");
    assert.ok(ids.indexOf("BL-08") < ids.indexOf("BL-09"), "bio precedes sources");
    const c = src("components/blog/BlogPostPage.tsx");
    assert.match(c, /data-author-bio="end-of-post"/);
    /* The card carries the review-fixture note and More-from links; the mark is never a fake portrait. */
    assert.match(c, /data-more-from-author/);
    assert.match(c, /data-no-photo="honest"/);
    assert.doesNotMatch(code("components/blog/BlogPostPage.tsx"), /<img|<Image/);
  });
});

/* ══════════════════════════════════════════════════════════════════ Key points (FD-DAT-20) */

describe("FD-DAT-20: Key points are derived, labelled 'Key points', and never described as AI", () => {
  test("the derivation is deterministic and extractive — every bullet is a sentence FROM the post", () => {
    for (const post of getBlogData().posts) {
      const points = deriveKeyPoints(post);
      assert.ok(points.length >= KEY_POINTS_MIN, `${post.slug}: at least ${KEY_POINTS_MIN} points`);
      assert.ok(points.length <= KEY_POINTS_MAX, `${post.slug}: at most ${KEY_POINTS_MAX} points`);
      const body = post.sections.flatMap((s) => s.paragraphs).join(" ");
      for (const point of points) {
        assert.ok(body.includes(point), `${post.slug}: "${point.slice(0, 40)}…" must exist verbatim in the body`);
      }
      /* Deterministic: the same input yields the same output. */
      assert.deepEqual(deriveKeyPoints(post), points);
    }
    /* The rule itself: first sentence of each section's first paragraph. */
    assert.equal(firstSentence("One. Two."), "One.");
    assert.equal(firstSentence("No terminator here"), "No terminator here");
  });

  test("the label is 'Key points'; the word AI appears NOWHERE on the surface, in either direction", () => {
    assert.equal(KEY_POINTS_LABEL, "Key points");
    const kp = code("lib/blog/blogKeyPoints.ts");
    const post = code("components/blog/BlogPostPage.tsx");
    /* Neither the label module's strings nor the post component may put "AI" on the reader's screen: no
       "AI summary" claim, and no "not AI" disclaimer either (FD-DAT-20 runs in both directions). */
    for (const [name, body] of [["blogKeyPoints", kp], ["BlogPostPage", post]] as const) {
      assert.doesNotMatch(body, /"[^"]*\bAI\b[^"]*"/, `${name} must not render the word AI`);
      assert.doesNotMatch(body, />[^<>]*\bAI\b[^<>]*</, `${name} must not render the word AI in JSX text`);
    }
    /* The block renders, labelled, marked derived, and protected. */
    assert.match(src("components/blog/BlogPostPage.tsx"), /data-key-points="derived"/);
    assert.match(src("components/blog/BlogPostPage.tsx"), /\{KEY_POINTS_LABEL\}/);
    /* The matrix records the decision as deterministic, citing the ruling. */
    const entry = sectionIntelligence("blog", "BL-04");
    assert.equal(entry?.decision, "deterministic");
    assert.match(entry!.why, /FD-DAT-20/);
  });

  test("the key points are NOT free-authored: no keyPoints field exists in the payload", () => {
    const raw = src("lib/blog/bff/review/blog-review.json");
    assert.doesNotMatch(raw, /"keyPoints"/, "a stored keyPoints array would be free-authored, not derived");
    assert.doesNotMatch(raw, /"summaryBullets"|"aiSummary"/);
  });
});

/* ══════════════════════════════════════════════════════════════════ the Listen control */

describe("the audio control is real, honest when absent, and never autoplays", () => {
  test("real SpeechSynthesis: speak, pause, resume, cancel are all wired", () => {
    const c = src("components/blog/ListenControl.tsx");
    assert.match(c, /"use client"/);
    for (const call of ["speechSynthesis.speak(", "speechSynthesis.pause()", "speechSynthesis.resume()",
      "speechSynthesis.cancel()"]) {
      assert.ok(c.includes(call), `the control genuinely calls ${call}`);
    }
    /* The capability check happens before any control renders. */
    assert.match(c, /"speechSynthesis" in window/);
  });

  test("no autoplay: speech starts only from the reader's click", () => {
    const c = code("components/blog/ListenControl.tsx");
    assert.doesNotMatch(c, /autoplay|autoPlay/i);
    /* `speak(` appears exactly once, inside the `start` callback, which is reachable only via onClick. */
    assert.equal((c.match(/\.speak\(/g) ?? []).length, 1);
    assert.match(c, /const start = useCallback/);
    assert.match(src("components/blog/ListenControl.tsx"), /onClick=\{start\}/);
    /* The only effect hook does capability detection and cleanup — it must not start speech. */
    const effects = [...c.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\}, \[\]\)/g)];
    for (const [, body] of effects) {
      assert.doesNotMatch(body, /\.speak\(/, "no effect may start speech");
    }
  });

  test("the absent state is a truthful sentence, not a dead control", () => {
    const c = src("components/blog/ListenControl.tsx");
    assert.match(c, /data-listen-supported=\{supported === null \? "pending" : "false"\}/);
    assert.match(c, /needs JavaScript/);
    /* No disabled-button theatre (CLAUDE.md §9 / FD-DAT-17): the unsupported branch renders prose only. */
    assert.doesNotMatch(code("components/blog/ListenControl.tsx"), /disabled/);
  });

  test("what it reads is what the page shows: headline, Key points, body — built server-side", () => {
    const post = getBlogPost(SAMPLE_SLUG)!;
    const text = listenText(post);
    assert.ok(text.startsWith(post.headline));
    assert.ok(text.includes(`${KEY_POINTS_LABEL}:`));
    for (const point of deriveKeyPoints(post)) assert.ok(text.includes(point));
    const model = buildBlogPostModel(SAMPLE_SLUG)!;
    assert.equal(model.listenText, text);
    /* The matrix records the honest decision: a browser voice is not an intelligence layer. */
    assert.equal(sectionIntelligence("blog", "BL-05")?.decision, "none");
  });
});

/* ══════════════════════════════════════════════════════════════════ authors */

describe("07 §3 + Conflict 41 precedent: two desk identities, no fake humans, no Person JSON-LD", () => {
  test("exactly TWO authors, each a labelled review fixture with a beat and a launch condition", () => {
    const authors = getBlogData().authors;
    assert.equal(authors.length, 2, "the founder authorized one or two authors; two desks ship");
    const slugs = authors.map((a) => a.slug).sort();
    assert.deepEqual(slugs, ["lotterycorner-guides-desk", "lotterycorner-results-desk"]);
    for (const a of authors) {
      assert.equal(a.reviewStatus, "review-fixture");
      assert.equal(a.photo, null, "07 §3: no synthetic photos");
      assert.match(a.name, /LotteryCorner/, "a team identity, never a personal name");
      assert.match(a.biography, /placeholder/i);
      assert.match(a.biography, /not a person/i);
      assert.ok(a.beat.length > 20, `${a.slug} has a real beat description`);
      assert.match(a.launchNote, /Person JSON-LD/, "the launch condition is recorded ON the record");
      assert.match(a.launchNote, /E-E-A-T|Preferred Sources/);
    }
    /* Distinct beats — the two desks must not be one desk twice. */
    assert.notEqual(authors[0].beat, authors[1].beat);
  });

  test("NO Person JSON-LD anywhere in the family — the sweep", () => {
    /* The emitted graphs, exhaustively. */
    const data = getBlogData();
    const graphs: unknown[] = [
      blogHubSchema(buildBlogHubModel().visibleCards),
      ...data.posts.map((p) => blogPostSchema(p, getBlogAuthor(p.authorSlug)!)),
      ...data.authors.map((a) => blogAuthorSchema(a)),
    ];
    for (const g of graphs) {
      assert.ok(!JSON.stringify(g).includes('"Person"'), "no graph may emit a Person node");
    }
    /* And the source cannot quietly grow one. */
    assert.doesNotMatch(code("lib/blog/blogSchema.ts"), /"Person"/);
    /* The author node is an Organization, and the profile mainEntity too. */
    const node = (blogPostSchema(data.posts[0], getBlogAuthor(data.posts[0].authorSlug)!) as {
      "@graph": Record<string, unknown>[];
    })["@graph"][0];
    assert.equal((node["author"] as Record<string, unknown>)["@type"], "Organization");
    const profile = (blogAuthorSchema(data.authors[0]) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    assert.equal((profile["mainEntity"] as Record<string, unknown>)["@type"], "Organization");
  });

  test("the pages label the identity as a fixture wherever it is shown", () => {
    for (const f of [
      "components/blog/BlogPostPage.tsx",
      "components/blog/BlogHubPage.tsx",
      "components/blog/BlogAuthorProfilePage.tsx",
    ]) {
      assert.match(src(f), /data-review-fixture/, `${f} carries the visible review label`);
    }
    /* The desk profile page shows the launch note and the beat, and lists work across news AND blog. */
    const profile = src("components/blog/BlogAuthorProfilePage.tsx");
    assert.match(profile, /data-launch-note="true"/);
    assert.match(profile, /data-author-beat="true"/);
    assert.match(profile, /data-work-kind=\{w\.kind\}/);
    /* The shared authors route resolves BOTH families and merges both work lists. */
    const route = src("app/authors/[slug]/page.tsx");
    assert.match(route, /servesPage\("news", `\/authors\/\$\{slug\}`\)/);
    assert.match(route, /servesPage\("blog", `\/authors\/\$\{slug\}`\)/);
    assert.match(route, /getBlogData\(\)\.posts/);
    assert.match(route, /getNewsData\(\)\.articles/);
  });

  test("every post names an accountable author AND an accountable editor", () => {
    for (const p of getBlogData().posts) {
      assert.ok(getBlogAuthor(p.authorSlug), `${p.slug} resolves its author`);
      assert.ok(p.editorName.length > 0, `${p.slug} names its editor`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ no fabricated content */

describe("CLAUDE.md §14: the evergreen corpus makes no current-news claim", () => {
  test("every post declares its fact basis, cites repository evidence, and wears a category", () => {
    for (const p of getBlogData().posts) {
      assert.ok(
        p.provenance.factBasis === "evergreen-guide" || p.provenance.factBasis === "editorial-opinion",
        `${p.slug} declares its basis`,
      );
      assert.ok(p.provenance.evidence.length > 0, `${p.slug} cites evidence`);
      assert.equal(p.provenance.reviewStatus, "review-fixture");
      assert.ok(BLOG_CATEGORIES.includes(p.category), `${p.slug} carries an EA §35 category`);
    }
    /* The EA §35 spread the founder asked for: tutorial, analysis, opinion and systems all exist. */
    const present = new Set(getBlogData().posts.map((p) => p.category));
    for (const c of BLOG_CATEGORIES) assert.ok(present.has(c), `category ${c} has at least one post`);
  });

  test("no undated currency, no winner, no jackpot figure, no odds-improvement promise — the sweep", () => {
    for (const p of getBlogData().posts) {
      const text = [p.headline, p.description,
        ...p.sections.flatMap((s) => [s.heading ?? "", ...s.paragraphs])].join(" ");
      assert.doesNotMatch(text, /\btoday\b|\byesterday\b|\btonight\b|\bthis week\b|\bbreaking\b/i,
        `${p.slug}: undated current-news phrasing`);
      assert.doesNotMatch(text, /\$[\d,.]+ (million|billion)/i, `${p.slug}: an invented jackpot figure`);
      assert.doesNotMatch(text, /\b(wins?|won|winner)\b/i,
        `${p.slug}: a winner claim needs a published verified source, which the corpus has none of`);
      assert.doesNotMatch(text, /increase your (chances|odds)|improve your (chances|odds)/i,
        `${p.slug}: the Constitution bans odds-improvement language outright`);
    }
  });

  test("the entertainment and opinion pieces wear their claim-type labels visibly", () => {
    const systems = getBlogData().posts.find((p) => p.category === "systems")!;
    assert.equal(systems.claimType, "entertainment");
    const opinion = getBlogData().posts.find((p) => p.category === "opinion")!;
    assert.equal(opinion.claimType, "opinion");
    const model = buildBlogPostModel(systems.slug)!;
    assert.equal(model.claimLabel, "For fun — not a strategy");
    assert.match(src("components/blog/BlogPostPage.tsx"), /data-claim-label=\{post\.claimType\}/);
  });

  test("the shape assertion rejects a doctored payload on read", () => {
    const base = getBlogData();
    const doctored = (mutate: (d: BlogData) => BlogData) =>
      assert.throws(() => assertBlogPayloadShape(mutate(structuredClone(base) as BlogData)));
    /* An undated current-news phrase. */
    doctored((d) => {
      (d.posts[0].sections[0] as unknown as { paragraphs: string[] }).paragraphs =
        ["The jackpot climbed again today."];
      return d;
    });
    /* An author upgraded to a person. */
    doctored((d) => {
      (d.authors[0] as { name: string }).name = "Jane Author";
      return d;
    });
    /* A third author — the founder authorized two. */
    doctored((d) => {
      (d as unknown as { authors: unknown[] }).authors = [...d.authors, structuredClone(d.authors[0])];
      return d;
    });
    /* A post with no evidence. */
    doctored((d) => {
      (d.posts[0].provenance as unknown as { evidence: string[] }).evidence = [];
      return d;
    });
    /* Odds-improvement language. */
    doctored((d) => {
      (d.posts[0] as { description: string }).description = "These picks increase your chances.";
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
        else if (/\.tsx?$/.test(name) && /blog\/bff\/review|bff\/review\/blog-review/.test(readFileSync(p, "utf8"))) {
          offenders.push(rel);
        }
      }
    };
    for (const root of ["app", "components"]) walk(root);
    assert.deepEqual(offenders, [], "the payload is reachable only through getBlogData()");
    assert.equal(BLOG_DATA_MODE, "review");
    /* The api branch exists and throws — the seam is visible, not imaginary. */
    assert.match(src("lib/blog/bff/blogBff.ts"), /case "api":/);
    assert.match(src("lib/blog/bff/blogBff.ts"), /CLAUDE\.md §15/);
  });
});

/* ══════════════════════════════════════════════════════════════════ schema */

describe("BlogPosting JSON-LD: Template K adapted, plus speakable", () => {
  test("every required field is present, for every post", () => {
    for (const post of getBlogData().posts) {
      const author = getBlogAuthor(post.authorSlug)!;
      const graph = blogPostSchema(post, author) as {
        "@context": string;
        "@graph": Record<string, unknown>[];
      };
      assert.equal(graph["@context"], "https://schema.org");
      const node = graph["@graph"][0];
      assert.equal(node["@type"], "BlogPosting");
      for (const field of BLOG_POSTING_REQUIRED_FIELDS) {
        if (field === "@context") continue; /* carried by the graph wrapper */
        if (BLOG_POSTING_CONDITIONAL_FIELDS.includes(field)) continue; /* asserted by rule below */
        assert.ok(field in node, `${post.slug} schema is missing ${field}`);
      }
    }
  });

  /* LRG-UX-SCHEMA-001 correction 3 — the same rule, and the same both-directions proof, as the news family. */
  test("image is absent without a representative asset, and never the site logo", () => {
    for (const post of getBlogData().posts) {
      const author = getBlogAuthor(post.authorSlug)!;
      const node = (blogPostSchema(post, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
      assert.ok(!("image" in node), `${post.slug} emits image with no representative asset`);
      assert.ok(!JSON.stringify(node).includes("logo.png"), `${post.slug} still references the site logo`);
    }
  });

  test("image IS emitted, as a measured ImageObject, once a record carries a representative asset", () => {
    const base = getBlogData().posts[0];
    const author = getBlogAuthor(base.authorSlug)!;
    const withAsset = {
      ...base,
      representativeImage: { url: "/blog/example.png", width: 1200, height: 675, alt: "Example figure" },
    };
    const node = (blogPostSchema(withAsset, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    const image = node["image"] as { "@type": string; url: string; width: number }[];
    assert.equal(image.length, 1);
    assert.equal(image[0]["@type"], "ImageObject");
    assert.equal(image[0].url, "https://www.lotterycorner.com/blog/example.png");
    assert.equal(image[0].width, 1200);
  });

  test("the schema matches the visible content, and speakable names the H1 and Key points selectors", () => {
    const post = getBlogPost(SAMPLE_SLUG)!;
    const author = getBlogAuthor(post.authorSlug)!;
    const node = (blogPostSchema(post, author) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    assert.equal(node["headline"], post.headline);
    assert.equal(node["description"], post.description);
    assert.equal(node["datePublished"], post.datePublishedIso);
    assert.equal(node["articleSection"], post.category);
    assert.equal(node["isAccessibleForFree"], true);
    assert.equal(node["url"], `https://www.lotterycorner.com/blog/${SAMPLE_SLUG}`);
    const speakable = node["speakable"] as Record<string, unknown>;
    assert.equal(speakable["@type"], "SpeakableSpecification");
    assert.deepEqual(speakable["cssSelector"], [".lcb-h1", ".lcb-keypoints"]);
    /* The selectors are REAL: the component renders both classes, so the markup claims nothing invisible. */
    const c = src("components/blog/BlogPostPage.tsx");
    for (const sel of SPEAKABLE_SELECTORS) {
      assert.ok(c.includes(sel.slice(1)), `${sel} exists on the rendered page`);
    }
    /* The abstract mirrors the visible Key points. */
    assert.equal(node["abstract"], deriveKeyPoints(post).join(" "));
  });

  test("the hub graph mirrors the rendered cards, and no SearchAction exists", () => {
    const model = buildBlogHubModel();
    const graph = (blogHubSchema(model.visibleCards) as { "@graph": { "@type": string }[] })["@graph"];
    assert.deepEqual(
      graph.map((n) => n["@type"]),
      /* LRG-UX-SCHEMA-001 correction 1: the Organization and WebSite ENTITIES moved to the root layout, which
         emits one of each per page. The page graph references their `@id`s instead of redefining them. */
      ["CollectionPage", "BreadcrumbList", "ItemList"],
    );
    const itemList = graph[2] as unknown as { itemListElement: { name: string }[] };
    assert.deepEqual(
      itemList.itemListElement.map((i) => i.name),
      model.visibleCards.map((c) => c.headline),
    );
    assert.doesNotMatch(src("lib/blog/blogSchema.ts"), /SearchAction/);
  });
});

/* ══════════════════════════════════════════════════════════════════ social package and share */

describe("07C Template M: the social package is complete and persona-simple", () => {
  test("OG and Twitter metadata are complete on a post", () => {
    const post = getBlogPost(SAMPLE_SLUG)!;
    const meta = blogPostMetadata(post);
    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og["url"], `https://www.lotterycorner.com/blog/${SAMPLE_SLUG}`);
    assert.equal(og["siteName"], "LotteryCorner");
    assert.ok(String(og["title"]).includes(post.headline));
    assert.equal(og["description"], post.description);
    assert.equal(og["publishedTime"], post.datePublishedIso);
    assert.equal(og["modifiedTime"], post.dateModifiedIso);
    assert.equal(og["section"], BLOG_CATEGORY_LABELS[post.category]);
    assert.deepEqual(og["tags"], [...post.keywords]);
    assert.deepEqual(og["authors"], [`https://www.lotterycorner.com/authors/${post.authorSlug}`]);
    const tw = meta.twitter as Record<string, unknown>;
    assert.equal(tw["card"], "summary");
    assert.equal(tw["description"], post.description);
  });

  test("the share row: copy link plus the persona-simple channels, no exotic networks, no counters", () => {
    const c = src("components/blog/ShareRow.tsx");
    for (const channel of ["facebook", "x", "whatsapp", "email", "copy-link"]) {
      assert.ok(c.includes(`data-share-channel="${channel}"`), `channel ${channel} present`);
    }
    assert.match(c, /navigator\.clipboard\.writeText/);
    assert.doesNotMatch(c, /reddit|linkedin|telegram|pinterest/i, "persona-simple: no exotic networks");
    assert.doesNotMatch(code("components/blog/ShareRow.tsx"), /shareCount|share_count/i);
    /* No impersonated recommendation: the prefilled text is the headline, not first-person praise. */
    assert.match(c, /encodeURIComponent\(headline\)/);
    /* The page passes the ONE canonical URL. */
    assert.match(src("components/blog/BlogPostPage.tsx"), /<ShareRow url=\{model\.shareUrl\} headline=\{post\.headline\} \/>/);
    const model = buildBlogPostModel(SAMPLE_SLUG)!;
    assert.equal(model.shareUrl, `https://www.lotterycorner.com/blog/${SAMPLE_SLUG}`);
  });
});

/* ══════════════════════════════════════════════════════════════════ routes, gating, indexability */

describe("FD-GATE-01 and PUBLICATION_SAFETY: the blog family", () => {
  test("the family is registered and the inventory carries its routes under CONFLICT-39", () => {
    assert.ok(PAGE_FAMILIES.includes("blog"));
    const rows = routeInventory().filter((r) => r.family === "blog");
    const byRoute = new Map(rows.map((r) => [r.route, r.blueprint]));
    assert.equal(byRoute.get("/blog"), "CONFLICT-39");
    assert.equal(byRoute.get("/blog/search"), "CONFLICT-39");
    assert.equal(byRoute.get(`/blog/${SAMPLE_SLUG}`), "CONFLICT-39");
    assert.equal(byRoute.get("/authors/lotterycorner-results-desk"), "CONFLICT-39");
    assert.equal(byRoute.get("/authors/lotterycorner-guides-desk"), "CONFLICT-39");
    assert.equal(rows.length, blogRoutePaths().length);
    /* 8 posts + 2 desks + hub + search. */
    assert.equal(rows.length, 12);
  });

  test("route existence needs the registry row AND the payload record — a fixture alone serves nothing", () => {
    assert.equal(servesPage("blog", "/blog"), true);
    assert.equal(servesPage("blog", `/blog/${SAMPLE_SLUG}`), true);
    assert.equal(servesPage("blog", "/blog/not-a-registered-slug"), false);
    assert.equal(servesPage("blog", "/authors/nobody"), false);
    assert.equal(isBlogRouteServed("/blog/"), false, "no trailing-slash twin");
    for (const f of [
      "app/blog/page.tsx", "app/blog/[slug]/page.tsx", "app/blog/search/page.tsx",
    ]) {
      assert.match(code(f), /servesPage\("blog"/, `${f} gates on the registry`);
      assert.match(code(f), /notFound\(\)/, `${f} refuses unregistered routes`);
    }
  });

  test("every blog route is noindex, and canonicals are the governed www form", () => {
    const post = getBlogPost(SAMPLE_SLUG)!;
    const author = getBlogAuthor("lotterycorner-guides-desk")!;
    for (const meta of [
      blogHubMetadata(), blogPostMetadata(post), blogSearchMetadata(), blogAuthorMetadata(author),
    ]) {
      assert.deepEqual(meta.robots, { index: false, follow: false });
    }
    assert.equal(blogHubMetadata().alternates?.canonical, "https://www.lotterycorner.com/blog");
    assert.equal(
      blogPostMetadata(post).alternates?.canonical,
      `https://www.lotterycorner.com/blog/${SAMPLE_SLUG}`,
    );
    /* The SEARCH page: noindex ALWAYS, no canonical for its query variants, permanently out of any sitemap. */
    assert.equal(blogSearchMetadata().alternates, undefined);
    assert.equal(isSitemapExcluded("/blog/search"), true);
    assert.match(src("lib/blog/blogRouteMetadata.ts"), /noindex ALWAYS/);
    /* One H1 per page, and the hub identity is verbatim-unique. */
    assert.equal((src("components/blog/BlogHubPage.tsx").match(/<h1/g) ?? []).length, 1);
    assert.equal((src("components/blog/BlogPostPage.tsx").match(/<h1/g) ?? []).length, 1);
    assert.equal(BLOG_HUB_H1, "The LotteryCorner Blog: Guides, Analysis and Player Culture");
    assert.equal(BLOG_HUB_TITLE, "Lottery Guides, Analysis & Player Culture | LotteryCorner Blog");
    assert.ok(BLOG_HUB_DESCRIPTION.length > 80);
    assert.ok(BLOG_HUB_SUPPORT.length > 40);
    /* The blog identity strings duplicate no news identity string (no duplicate page for the same intent). */
    assert.notEqual(BLOG_HUB_TITLE, src("lib/news/newsContract.ts").match(/NEWS_HUB_TITLE = "([^"]+)"/)?.[1]);
  });

  test("category chips filter ONE URL and can never mint an indexable variant", () => {
    /* No category route exists in the registry… */
    for (const c of BLOG_CATEGORIES) {
      assert.equal(isBlogRouteServed(`/blog/${c}`), false, `/blog/${c} must not be a route`);
      assert.equal(isBlogRouteServed(`/blog/category/${c}`), false);
    }
    /* …the chips link with a query over the hub path… */
    const hub = src("components/blog/BlogHubPage.tsx");
    assert.match(hub, /href=\{`\$\{BLOG_HUB_PATH\}\?category=\$\{c\.category\}#browse`\}/);
    /* …the filter is server-side and real… */
    const filtered = buildBlogHubModel("tutorial");
    assert.equal(filtered.selectedCategory?.category, "tutorial");
    assert.ok(filtered.categoryPosts.length > 0);
    assert.ok(filtered.categoryPosts.every((p) => p.category === "tutorial"));
    /* …and the canonical never varies with it: the hub metadata function takes no input at all, so a
       category can never reach the canonical. */
    assert.match(src("lib/blog/blogRouteMetadata.ts"), /export function blogHubMetadata\(\): Metadata/);
    assert.equal(blogHubMetadata().alternates?.canonical, "https://www.lotterycorner.com/blog");
  });

  test("§10.5: every blog section id has a recorded intelligence decision", () => {
    for (const id of BLOG_HUB_ORDER.filter((x) => x.startsWith("BH-"))) {
      const entry = sectionIntelligence("blog", id);
      assert.ok(entry, `${id} needs a recorded decision`);
      assert.ok(entry.why.length > 20, `${id} records why`);
    }
    for (const row of BLOG_POST_SECTION_ORDER) {
      const entry = sectionIntelligence("blog", row.id);
      assert.ok(entry, `${row.id} needs a recorded decision`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════ advertising */

describe("CLAUDE.md §12 / Conflict 39: advertising is typed-empty pending the lc_bp_*, lc_bdp_* capture", () => {
  test("the profile is typed-empty with the audit gap recorded — no slot is invented", () => {
    assert.equal(blogAdProfile(), NO_APPROVED_BLOG_PROFILE);
    assert.equal(NO_APPROVED_BLOG_PROFILE.placements.length, 0);
    assert.match(NO_APPROVED_BLOG_PROFILE.gap, /lc_bp_\*/);
    assert.match(NO_APPROVED_BLOG_PROFILE.gap, /lc_bdp_\*/);
    assert.match(NO_APPROVED_BLOG_PROFILE.gap, /CLAUDE\.md §12/);
  });

  test("the hub anchors hold their recorded positions and reserve nothing", () => {
    assert.equal(BLOG_HUB_ORDER[2], "AD-BH00", "after the featured post, never inside it");
    assert.equal(BLOG_HUB_ORDER[5], "AD-BH01", "between the archive and the cross-links");
    const c = src("components/blog/BlogHubPage.tsx");
    assert.match(c, /hidden\s+data-section-id=\{id\}\s+data-ad-anchor="reserved-pending-audit"/);
  });

  test("the post page carries NO ad markup, and its protected zones are marked", () => {
    const art = code("components/blog/BlogPostPage.tsx");
    assert.doesNotMatch(art, /AdAnchor|data-ad-anchor|adsbygoogle|googletag/);
    assert.match(src("components/blog/BlogPostPage.tsx"), /data-ad-active-count=\{0\}/);
    const c = src("components/blog/BlogPostPage.tsx");
    for (const marker of [
      /data-post-section="BL-03" data-protected-zone="true"/,
      /data-post-section="BL-04"[\s\S]{0,80}data-key-points="derived"[\s\S]{0,80}data-protected-zone="true"/,
      /<PostSection id="BL-05" heading="Listen to this article" protectedZone/,
      /<PostSection id="BL-09" heading="Sources and corrections" protectedZone/,
      /<PostSection id="BL-12" heading="Play responsibly" protectedZone/,
    ]) {
      assert.match(c, marker);
    }
    /* Headline → Key points → Listen → body: nothing sits between the header and the Key points block. */
    const full = code("components/blog/BlogPostPage.tsx");
    const headerEnd = full.indexOf("</header>");
    const keyPoints = full.indexOf(`data-post-section="BL-04"`);
    const between = full.slice(headerEnd, keyPoints);
    assert.doesNotMatch(between, /AdAnchor|data-ad|adsbygoogle|googletag|placement|ad-slot/i);
  });
});

/* ══════════════════════════════════════════════════════════════════ search */

describe("the founder-added blog search page", () => {
  test("plain keyword search: every term must match, order-independent, punctuation-tolerant", () => {
    assert.deepEqual(blogSearchTerms("  Double Play! "), ["double", "play"]);
    const hits = searchBlog("double play");
    assert.ok(hits.some((h) => h.post.slug === "what-double-play-is"));
    for (const h of hits) assert.ok(h.matchedIn.length > 0);
    assert.deepEqual(searchBlog("zebra"), []);
    assert.deepEqual(searchBlog(""), []);
  });

  test("the page is server-rendered with a GET form and crawlable fallbacks to the hub", () => {
    const c = src("components/blog/BlogSearchPage.tsx");
    assert.doesNotMatch(c, /"use client"/, "no client island — the results are in the initial HTML");
    assert.match(c, /method="get"/);
    assert.match(c, /Browse all blog posts/);
    assert.match(c, /BLOG_SEARCH_SUGGESTIONS/);
  });
});

/* ══════════════════════════════════════════════════════════════════ wiring: rails, footer, cross-links */

describe("the blog family feeds the existing surfaces without restructuring them", () => {
  test("the flagship guides rail resolves tagged posts to real /blog routes", () => {
    const items = blogTaggedContentSource.fetchByTag("Powerball", 3);
    assert.ok(items.length > 0);
    for (const i of items) {
      assert.ok(i.tags.includes("Powerball"));
      assert.match(i.href, /^\/blog\/[a-z0-9-]+$/);
      assert.equal(i.provenance, "synthetic/internal-review");
      assert.match(i.author, /LotteryCorner/);
      assert.equal(i.replyCount, undefined, "a blog post has no reply count to fabricate");
    }
    /* Both flagship tags resolve — each hub's rail has real content. */
    assert.ok(taggedFeed("blog", "Powerball", 3).items.length > 0);
    assert.ok(taggedFeed("blog", "Mega Millions", 3).items.length > 0);
  });

  test("the footer Blog entry is a real new-UI route now", () => {
    const explore = FOOTER_GROUPS.find((g) => g.heading === "Explore")!;
    const blog = explore.links.find((l) => l.label === "Blog")!;
    assert.equal(blog.href, "/blog");
    assert.equal(blog.kind, "newRoute");
  });

  test("news↔blog: each hub links the other, and the news touch is exactly the recorded cross-link", () => {
    /* Blog → news: the BH-05 module. */
    const blogHub = src("components/blog/BlogHubPage.tsx");
    assert.match(blogHub, /data-news-crosslink="true"/);
    assert.match(blogHub, /href="\/news"/);
    /* News → blog: one link inside NH-07, marked. */
    const newsHub = src("components/news/NewsHubPage.tsx");
    assert.match(newsHub, /data-blog-crosslink="true"/);
    assert.match(newsHub, /Conflict 39/);
    assert.equal((newsHub.match(/href="\/blog"/g) ?? []).length, 1, "one recorded link, not a restructure");
    /* And the news family's contracts and models are otherwise untouched by this build: the blog is never
       imported into the news lib. */
    for (const f of [
      "lib/news/newsContract.ts", "lib/news/newsHubModel.ts", "lib/news/newsArticleModel.ts",
      "lib/news/newsSchema.ts", "lib/news/newsRegistry.ts", "lib/news/bff/newsBff.ts",
    ]) {
      assert.doesNotMatch(code(f), /lib\/blog|blogContract|getBlogData/, `${f} must not depend on the blog`);
    }
  });

  test("reading time and date groups are arithmetic over the corpus", () => {
    const post = getBlogPost(SAMPLE_SLUG)!;
    const words = post.sections.flatMap((s) => [s.heading ?? "", ...s.paragraphs]).join(" ")
      .split(/\s+/).filter((w) => w.length > 0).length;
    assert.equal(readingTimeMinutes(post), Math.max(1, Math.round(words / 220)));
    const model = buildBlogHubModel();
    assert.equal(model.minutesBySlug[SAMPLE_SLUG], readingTimeMinutes(post));
    /* Month groups: newest month first, every post present exactly once. */
    const grouped = model.dateGroups.flatMap((g) => g.posts.map((p) => p.slug));
    assert.equal(grouped.length, getBlogData().posts.length);
    assert.equal(new Set(grouped).size, grouped.length);
    const months = model.dateGroups.map((g) => g.monthIso);
    assert.deepEqual([...months].sort().reverse(), months);
    /* The featured post is the newest, deterministically. */
    assert.equal(model.featured?.slug, SAMPLE_SLUG);
  });
});
