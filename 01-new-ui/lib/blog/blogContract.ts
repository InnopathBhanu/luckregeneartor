/*
 * THE BLOG PAGE-FAMILY CONTRACT — built WITHOUT a blueprint, on the Tier-1 authorization recorded in
 * `03-docs/08-decisions/source-conflicts.md` **Conflict 39** (CLOSED — RECORDED 2026-08-11).
 *
 * ══ AUTHORITY, AND WHY THIS FAMILY EXISTS AT ALL ══
 *
 * No blog blueprint was ever authored (BP-08's blog half is missing), and `CLAUDE.md` §2 blocks a family with no
 * approved blueprint. Conflict 39 records the founder's Tier-1 instruction that overrides the block, and it names
 * the composition sources this file transcribes:
 *
 *   - the approved News ARTICLE architecture (07B, Final approved and frozen), adapted to evergreen editorial —
 *     07B §15 itself says *"Use `Article` or `BlogPosting` for evergreen Editorial"*, and 07C Template H is the
 *     Editorial/Guide template this family instantiates;
 *   - the Experience Architecture §35 BLOG DISTINCTION: *"analysis · tutorial · opinion · systems content ·
 *     contributor story. The visible purpose determines sections, not the URL label alone."*;
 *   - the founder's explicit feature requirements (2026-08-11): *"Make it engaging and sharable; author bio at
 *     the end; let's build authority with one or two authors on our site; AI summary and audio at the top; all
 *     required JSON SEO schema. Idea is we should make the news and blogs as Google Preferred Sources."*
 *
 * `/blog` and `/blog/{slug}` are classified **preserve** in the ratified route audit (21 live indexed URLs), so
 * this family serves routes the production site already owns — it invents none.
 *
 * ══ THE TWO RENAMES THE DECISION REGISTERS FORCE ══
 *
 *   1. The founder's "AI summary" ships as **"Key points"** — the bullets are DERIVED DETERMINISTICALLY from the
 *      post's own text (`blogKeyPoints.ts`), and `FD-DAT-20` rules that *"deterministic generation must not be
 *      described as AI"* — in either direction. No model runs; calling it AI would misdescribe a calculation.
 *   2. The founder's "authority authors" ship as two clearly-labelled editorial DESK identities
 *      (`reviewStatus: "review-fixture"`), never invented humans — 07 §3: *"no fake authors, synthetic
 *      biographies or synthetic reporter photos"*, and the community precedent (Conflict 41 condition 4): fixture
 *      identities are NEVER emitted as `Person` JSON-LD. Real named writers, photographs and `Person` schema
 *      attach at launch — that is what E-E-A-T / Preferred Sources actually requires, and it cannot be faked.
 */

/* ------------------------------------------------------------------ EA §35 categories */

/**
 * EA §35's blog distinction, minus "contributor story": no contributor exists, and inventing one to fill a
 * category is exactly the fabricated identity 07 §3 forbids. The category joins when a real contributor does.
 */
import type { ArticleImageAsset } from "@/lib/seo/articleImage";

export type BlogCategory = "tutorial" | "analysis" | "opinion" | "systems";

export const BLOG_CATEGORIES: readonly BlogCategory[] = Object.freeze([
  "tutorial", "analysis", "opinion", "systems",
]);

/** Reader-facing category labels — plain player words, not taxonomy jargon. */
export const BLOG_CATEGORY_LABELS: Readonly<Record<BlogCategory, string>> = Object.freeze({
  tutorial: "Guides",
  analysis: "Analysis",
  opinion: "Opinion",
  systems: "Systems and culture",
});

/**
 * The Constitution's claim-type vocabulary, as it lands on a blog post. The visible label keeps a reader from
 * mistaking an entertainment piece for advice — "Distinguish claim types explicitly" (`CLAUDE.md` §7).
 */
export type BlogClaimType = "explainer" | "analysis" | "opinion" | "entertainment";

export const BLOG_CLAIM_LABELS: Readonly<Record<BlogClaimType, string | null>> = Object.freeze({
  /** A plain explanation of verifiable mechanics. The category kicker already says "Guide"; no extra label. */
  explainer: null,
  analysis: "LotteryCorner analysis",
  opinion: "Opinion",
  entertainment: "For fun — not a strategy",
});

/* ------------------------------------------------------------------ authors (07 §2/§3, Conflict 39/41) */

/**
 * One editorial DESK identity — the honest form of the founder's "one or two authors to build authority with".
 *
 * A desk has a beat, a body of work and an accountable profile page: the authority STRUCTURE Preferred Sources
 * and E-E-A-T reward. What it does not have is a fabricated human behind it — the record says what it is, the
 * page says what it is, and the schema emits `Organization`, never `Person` (community precedent, Conflict 41
 * condition 4). `launchNote` records what replaces it and when.
 */
export interface BlogAuthorRecord {
  slug: string;
  name: string;
  role: string;
  /** The only constructible value: an author silent about being a fixture cannot exist in this corpus. */
  reviewStatus: "review-fixture";
  /** One sentence naming the desk's beat, rendered on cards and in the end-of-post bio. */
  beat: string;
  /** Honest biography: what this identity is and why it exists. Never an invented life story. */
  biography: string;
  /** 07 §3: no synthetic photos. `null` until a real person consents to a real photograph. */
  photo: null;
  /** Topics covered, per 07C Template J "States/games/topics covered". */
  covers: readonly string[];
  /**
   * The launch record: a real named writer with a real photograph, credentials and `Person` JSON-LD takes over
   * this desk at launch. Kept ON the record so the retirement condition travels with the fixture.
   */
  launchNote: string;
}

/* ------------------------------------------------------------------ provenance (`CLAUDE.md` §14) */

export interface BlogProvenance {
  /**
   * `evergreen-guide` — durable mechanics, evidenced in this repository, no event claims.
   * `editorial-opinion` — a labelled point of view; its factual asides still cite evidence.
   */
  factBasis: "evergreen-guide" | "editorial-opinion";
  /** The repository evidence behind every factual claim, e.g. `04-sample-data/result-format-definitions.json`. */
  evidence: readonly string[];
  /** When the evidence was last checked against the post. ISO date. */
  lastCheckedIso: string;
  /** `"review-fixture"`: written for interface review, against real evidence, not yet editorially published. */
  reviewStatus: "review-fixture";
}

/* ------------------------------------------------------------------ sources block (07 §16 by adoption) */

export interface BlogSourcesBlock {
  primarySource: string;
  additionalSources: readonly string[];
  lotteryCornerDataUsed: readonly string[];
  lastCheckedIso: string;
  correctionStatus: string;
}

/* ------------------------------------------------------------------ the post record */

/**
 * One body section. The FIRST section of every post is the lead and carries `heading: null`; every later section
 * carries a real heading. `blogKeyPoints.ts` derives the Key points from exactly this structure — which is what
 * makes the summary DERIVED rather than free-authored (`FD-DAT-20`'s deterministic discipline).
 */
export interface BlogBodySection {
  heading: string | null;
  paragraphs: readonly string[];
}

export interface BlogRelatedLink {
  label: string;
  /** A same-site route this build actually serves. Never an invented URL, never an external destination. */
  href: string;
}

export interface BlogPostRecord {
  slug: string;
  category: BlogCategory;
  claimType: BlogClaimType;
  headline: string;
  /** Metadata description — what the post explains plus why a player would care. */
  description: string;
  authorSlug: string;
  /** Every post has an accountable editor (07 §3, adopted). */
  editorName: string;
  datePublishedIso: string;
  dateModifiedIso: string;
  primaryEntity: string;
  gameIds: readonly string[];
  stateCodes: readonly string[];
  /** Tags for the flagship tagged-content seam (`Powerball`, `Mega Millions`). */
  tags: readonly string[];
  /** Governed keywords for metadata and schema. */
  keywords: readonly string[];
  /**
   * The image the post VISIBLY shows and that structured data may therefore claim represents it. `null`
   * throughout: no owned editorial asset exists. Schema omits `image` rather than substituting the site logo —
   * see `lib/seo/articleImage.ts` and source-conflicts.md Conflict 44.
   */
  representativeImage?: ArticleImageAsset | null;
  /** The body. `sections[0].heading` is `null` (the lead); every later heading is a real `<h2>`. */
  sections: readonly BlogBodySection[];
  /** Related tool/game/state links — a focused rail, never a tool wall (07B §11 by adoption). */
  relatedLinks: readonly BlogRelatedLink[];
  sources: BlogSourcesBlock;
  provenance: BlogProvenance;
}

/* ------------------------------------------------------------------ hub identity */

/** The one H1 on `/blog`. Unique across the product. */
export const BLOG_HUB_H1 = "The LotteryCorner Blog: Guides, Analysis and Player Culture";

export const BLOG_HUB_SUPPORT =
  "Evergreen guides, odds-honest analysis and player culture from the LotteryCorner desks — written to stay "
  + "useful long after any single drawing.";

/** Metadata — verbatim-unique title and description for `/blog`. */
export const BLOG_HUB_TITLE = "Lottery Guides, Analysis & Player Culture | LotteryCorner Blog";
export const BLOG_HUB_DESCRIPTION =
  "Read evergreen lottery guides and odds-honest analysis from LotteryCorner's editorial desks: how games and "
  + "payouts work, claiming and taxes, Double Play, multipliers, and player culture explained straight.";

/* ------------------------------------------------------------------ hub composition (Conflict 39) */

/**
 * THE HUB ORDER — this family's OWN contract, recorded here because no blueprint exists to transcribe.
 *
 * Derived from 07A's hub grammar (identity first, strongest content second, discovery next, trust last, ad
 * positions between content bands, never inside them) and the founder's feature list (featured post, category
 * chips, reading time, date-grouped list). `tests/blog-pages.test.ts` asserts this order verbatim; changing it
 * is a recorded contract change, not a drive-by.
 */
export type BlogHubSectionId =
  | "BH-01" | "BH-02" | "BH-03" | "BH-04" | "BH-05" | "BH-06"
  | "AD-BH00" | "AD-BH01";

export const BLOG_HUB_ORDER: readonly BlogHubSectionId[] = Object.freeze([
  "BH-01",   // 1 Identity and Navigation (H1, disclosure, category chips, search link)
  "BH-02",   // 2 Featured Post — the newest post, deterministically; never a manufactured "top story"
  "AD-BH00", // 3 Advertisement — typed-empty anchor (lc_bp_* and lc_bdp_* named but uncaptured; Conflict 39)
  "BH-03",   // 4 Browse by Category — chips + server-side ?category= filter, reading times
  "BH-04",   // 5 All Posts by Date — month-grouped archive of the whole corpus
  "AD-BH01", // 6 Advertisement — second typed-empty anchor
  "BH-05",   // 7 From the Newsroom — the news↔blog cross-link (dated records live on /news)
  "BH-06",   // 8 Desks and Trust — the two desk identities and the policy links
]);

export const BLOG_HUB_SECTION_NAMES: Readonly<Record<BlogHubSectionId, string>> = Object.freeze({
  "BH-01": "Identity and Navigation",
  "BH-02": "Featured Post",
  "AD-BH00": "Advertisement",
  "BH-03": "Browse by Category",
  "BH-04": "All Posts by Date",
  "AD-BH01": "Advertisement",
  "BH-05": "From the Newsroom",
  "BH-06": "Desks and Trust",
});

/* ------------------------------------------------------------------ post composition (Conflict 39) */

/**
 * THE POST ORDER — the founder's composition, adapting 07B §3 to evergreen editorial. Twelve sections:
 *
 *   1 category/breadcrumbs → 2 headline → 3 author identity + dates → 4 Key points → 5 Listen →
 *   6 main article → 7 related tool/game/state links → 8 author bio (AT THE END of the read) →
 *   9 sources → 10 share → 11 related posts → 12 responsible play.
 *
 * Where a 07B section has a direct evergreen counterpart the mapping is recorded; where the founder's list adds
 * something 07B has no row for (Key points, Listen, Share), `adaptedFrom` records the addition honestly.
 */
export interface BlogPostSectionRow {
  order: number;
  id: string;
  section: string;
  /** The 07B §3 row this adapts, or the recorded reason it is a founder addition. */
  adaptedFrom: string;
}

export const BLOG_POST_SECTION_ORDER: readonly BlogPostSectionRow[] = Object.freeze([
  { order: 1, id: "BL-01", section: "Category, entities and status",
    adaptedFrom: "07B §3 order 1 — the kicker names the category and primary entity." },
  { order: 2, id: "BL-02", section: "Headline",
    adaptedFrom: "07B §3 order 2 — the one H1." },
  { order: 3, id: "BL-03", section: "Author identity and dates",
    adaptedFrom: "07B §3 order 3 — desk byline, published/updated dates, reading time." },
  { order: 4, id: "BL-04", section: "Key points",
    adaptedFrom: "Founder requirement (the 'AI summary'), shipped as a deterministic derivation labelled "
      + "'Key points' per FD-DAT-20 — deterministic generation is never described as AI. Sits where 07B §3 "
      + "order 4 puts the Bottom Line: the answer before the read." },
  { order: 5, id: "BL-05", section: "Listen to this article",
    adaptedFrom: "Founder requirement — real browser SpeechSynthesis with an honest absent state; no 07B row." },
  { order: 6, id: "BL-06", section: "Main article",
    adaptedFrom: "07B §3 order 6 — the body is the BlogPosting itself." },
  { order: 7, id: "BL-07", section: "Related tool, game and state links",
    adaptedFrom: "07B §3 order 10 — relevant destinations, never a tool wall." },
  { order: 8, id: "BL-08", section: "About the author",
    adaptedFrom: "Founder requirement: the author bio card ends the read. 07B carries author identity in the "
      + "header (order 3); the end-of-post card adds the beat, honest bio and More-from links." },
  { order: 9, id: "BL-09", section: "Sources and corrections",
    adaptedFrom: "07B §3 order 14 — 07 §16 visible fields, verbatim labels." },
  { order: 10, id: "BL-10", section: "Share this article",
    adaptedFrom: "Founder requirement ('engaging and sharable') + 07C Template M's social package: "
      + "persona-simple share actions and a copy-link control." },
  { order: 11, id: "BL-11", section: "Related posts",
    adaptedFrom: "07B §3 order 13 — related next actions, as evergreen sibling posts." },
  { order: 12, id: "BL-12", section: "Play responsibly",
    adaptedFrom: "07B §3 order 15 — protected; no commerce, no affiliate CTA." },
]);

/* ------------------------------------------------------------------ routes (Conflict 39; route audit: preserve) */

export const BLOG_HUB_PATH = "/blog";
export const BLOG_SEARCH_PATH = "/blog/search";
export const blogPostPath = (slug: string) => `/blog/${slug}`;
/** Desk profiles live on the shared 07 §2 author surface, beside the news identities. */
export const blogAuthorPath = (slug: string) => `/authors/${slug}`;
