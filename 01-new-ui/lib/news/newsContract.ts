/*
 * THE NEWS PAGE-FAMILY CONTRACT — 07 / 07A / 07B / 07C (all Final approved and frozen).
 *
 * Authority: `07-lotterycorner-news-editorial-engagement-research-FINAL-APPROVED.md` v1.1 (the frozen research),
 * `07A-lotterycorner-news-hub-blueprint-FINAL-APPROVED.md` v1.0 (the hub), `07B-lotterycorner-news-article-
 * blueprint-FINAL-APPROVED.md` v1.0 (the article), `07C-lotterycorner-editorial-content-template-FINAL-APPROVED.md`
 * v1.0 (the reusable templates), and `CLAUDE.md` §14 (no synthetic content presented as real public fact).
 *
 * ══ WHAT THIS FILE IS ══
 *
 * The typed vocabulary of the family: the governed taxonomy (07 §20), the article record shape (07 §9 entity
 * contract, 07C inputs), the hub section order (07A §3, verbatim), the article section order (07B §3, mapped onto
 * the Global Shell editorial library), and the verbatim identity strings (07A §4 and §17). Models and components
 * consume this; nothing here reads data.
 *
 * ══ THE HONESTY RULE THE WHOLE FAMILY IS BUILT UNDER ══
 *
 * This build carries a REVIEW CORPUS, not a newsroom. `CLAUDE.md` §14 forbids presenting synthetic content as real
 * public fact, and 07A §2 NEWS-LOW-VOLUME says *"Do not manufacture news."* So:
 *
 *   - every article is either an EVERGREEN guide/explainer or a record of a CLEARLY-DATED HISTORICAL FACT whose
 *     evidence exists in this repository (`04-sample-data`), with provenance carried on the record;
 *   - no invented winner, jackpot figure, current event, prize claim or deadline exists anywhere in the corpus;
 *   - the accountable author is a clearly-labelled editorial-team placeholder (`reviewStatus: "review-fixture"`),
 *     never an invented human with a fabricated biography or photo (07 §3: *"no fake authors, synthetic
 *     biographies or synthetic reporter photos"*);
 *   - the hub runs in `NEWS-LOW-VOLUME` mode, and the Trending / Most Discussed / Most Read rankings are honestly
 *     empty rather than carrying fabricated counts (07 §11 keeps them separate; nothing here fills them).
 */

import type { ArticleImageAsset } from "@/lib/seo/articleImage";

/* ------------------------------------------------------------------ 07 §20 governed taxonomy */

/** 07 §1 — the three content classes stay distinct. COMMUNITY never enters the News feed in this build. */
export type NewsContentType = "NEWS" | "EDITORIAL";

/** 07 §20 — the approved categories, verbatim. */
export type NewsCategory =
  | "Jackpot"
  | "Winner"
  | "Unclaimed Prize"
  | "State Lottery"
  | "Game Change"
  | "Scratch-Off"
  | "Claims and Taxes"
  | "Scam and Safety"
  | "Industry"
  | "Community"
  | "Research"
  | "Celebration and Event";

/** 07B §22 — the article lifecycle. The review corpus only ever uses `PUBLISHED` and `EVERGREEN`. */
export type NewsStoryStatus =
  | "DRAFT" | "SCHEDULED" | "PUBLISHED" | "DEVELOPING" | "UPDATED" | "CORRECTED"
  | "RESOLVED" | "EVERGREEN" | "ARCHIVED" | "MERGED" | "RETRACTED";

/** 07 §5 — article classes. Guidance, not rigid limits. */
export type NewsArticleClass = "flash-update" | "standard-news" | "explainer-research";

/* ------------------------------------------------------------------ authors (07 §2, §3) */

/**
 * An accountable author identity.
 *
 * 07 §2 requires every normal news article to have a real accountable human author. No real newsroom exists yet,
 * and inventing one is exactly what 07 §3 forbids — so the review corpus uses ONE accountable editorial-team
 * placeholder whose record SAYS it is a placeholder. `reviewStatus` is required so the type cannot construct an
 * author who is silent about what they are.
 */
export interface NewsAuthorRecord {
  slug: string;
  name: string;
  /** 07 §3 role vocabulary. The review placeholder is `LOTTERYCORNER_RESEARCH`-adjacent but labelled plainly. */
  role: string;
  /**
   * `"review-fixture"` — a clearly-labelled accountable placeholder, not a person.
   * A real newsroom identity would carry `"published"` and would then REQUIRE a real biography and photo.
   */
  reviewStatus: "review-fixture";
  /** Honest biography: what this identity is and why it exists. Never an invented life story. */
  biography: string;
  /** 07 §3: no synthetic reporter photos. `null` until a real person consents to a real photograph. */
  photo: null;
  /** Beats, per Template J "States/games/topics covered". */
  covers: readonly string[];
}

/* ------------------------------------------------------------------ provenance (`CLAUDE.md` §14) */

/**
 * Where an article's facts come from. Every record carries one — an article with no stated basis is exactly the
 * thing that becomes indistinguishable from invented news later.
 */
export interface NewsProvenance {
  /**
   * `dated-historical-fact` — the article records a change or event whose date and substance are evidenced in
   *   this repository. `evergreen-guide` — the article explains something durable and makes no event claims.
   */
  factBasis: "dated-historical-fact" | "evergreen-guide";
  /** The repository evidence behind every factual claim, e.g. `04-sample-data/result-format-definitions.json`. */
  evidence: readonly string[];
  /** When the evidence was last checked against the article. ISO date. */
  lastCheckedIso: string;
  /** `"review-fixture"`: written for interface review, against real evidence, and not yet editorially published. */
  reviewStatus: "review-fixture";
}

/* ------------------------------------------------------------------ sources block (07 §16, 07B §13) */

export interface NewsSourcesBlock {
  /** "Primary source" — reader-facing name of the evidence. */
  primarySource: string;
  additionalSources: readonly string[];
  /** "LotteryCorner data used". */
  lotteryCornerDataUsed: readonly string[];
  /** "Last checked" — ISO date. */
  lastCheckedIso: string;
  /** "Correction status" — visible per 07 §16. */
  correctionStatus: string;
}

/* ------------------------------------------------------------------ conditional AI (07 §7, 07B §8) */

/**
 * The conditional AI module. 07 §7's acceptance test: suppress it when it only repeats the headline, Bottom Line
 * or first paragraph. No model runs in this build, so nothing can pass the test — the honest value is a recorded
 * SUPPRESSION, and the type makes "suppressed, with the reason" the only constructible review-corpus state.
 */
export interface NewsAiContext {
  rendered: false;
  /** Why the module is suppressed. Rendered nowhere; read by the audit and the tests. */
  suppressionReason: string;
}

/* ------------------------------------------------------------------ before/after table (07C Template E) */

export interface NewsBeforeAfterRow {
  item: string;
  before: string;
  after: string;
}

/* ------------------------------------------------------------------ the article record (07 §9, 07C inputs) */

export interface NewsRelatedAction {
  label: string;
  /** A same-site route this build actually serves. Never an invented URL, never an external destination. */
  href: string;
}

export interface NewsArticleRecord {
  slug: string;
  contentType: NewsContentType;
  newsCategory: NewsCategory;
  articleClass: NewsArticleClass;
  storyStatus: NewsStoryStatus;
  headline: string;
  /** Metadata description — factual summary plus player implication (07C Template A). */
  description: string;
  /** 07B §5 — one or two sentences stating what happened and why it matters. */
  bottomLine: string;
  authorSlug: string;
  /** 07 §3 — every article has an accountable editor. The review corpus names the same placeholder. */
  editorName: string;
  datePublishedIso: string;
  dateModifiedIso: string;
  /** 07 §9 entity contract — the slice this corpus needs. */
  primaryEntity: string;
  gameIds: readonly string[];
  stateCodes: readonly string[];
  /** Tags for the flagship tagged-content seam (`Powerball`, `Mega Millions`). */
  tags: readonly string[];
  /** Governed keywords for metadata and schema (07C Template K `keywords`). */
  keywords: readonly string[];
  /**
   * The image the article VISIBLY shows and that structured data may therefore claim represents it.
   *
   * `null` on every record in the review corpus: no owned or licensed editorial asset exists, and 07B §18
   * forbids fabricating documentary imagery. Schema omits `image` entirely rather than standing the site logo
   * in for it — see `lib/seo/articleImage.ts` and source-conflicts.md Conflict 44.
   */
  representativeImage?: ArticleImageAsset | null;
  /** 07B §3 order 5 — a verified data card. `null` when the article carries none. */
  beforeAfter: readonly NewsBeforeAfterRow[] | null;
  /** Short label above the before/after card, e.g. "Matrix change, before and after". */
  beforeAfterLabel: string | null;
  /** Main article paragraphs (07B §6 flow). */
  body: readonly string[];
  /** 07B §8 — always a recorded suppression in the review corpus. */
  aiContext: NewsAiContext;
  /** 07B §9 — bullet points. */
  whyItMatters: readonly string[];
  /** 07B §10 — deterministic LotteryCorner data before AI explanation. "Worth Knowing". */
  historicalNote: string;
  /** 07B §11 — ONE relevant action, not a tool wall. */
  primaryAction: NewsRelatedAction;
  /** 07B §12 — one neutral question tied to the story. Static text in this phase. */
  discussionQuestion: string;
  /**
   * 07 §10 — the canonical discussion thread seam. `null` until the community phase wires a real thread id;
   * typed now so the article record owns the field the blueprint requires.
   */
  canonicalDiscussionThreadId: string | null;
  /** 07B §3 order 13 — related next actions, maximum three (07C Template A). */
  relatedNextActions: readonly NewsRelatedAction[];
  sources: NewsSourcesBlock;
  provenance: NewsProvenance;
}

/* ------------------------------------------------------------------ 07A §4 / §17 verbatim identity */

/** 07A §4 — the H1, verbatim. */
export const NEWS_HUB_H1 = "Lottery News, Winners, Jackpots and Player Stories";

/** 07A §4 — the supporting copy, verbatim. */
export const NEWS_HUB_SUPPORT =
  "Verified U.S. lottery news with named reporters, LotteryCorner data, useful AI context and community discussion.";

/** 07A §17 — metadata, verbatim. */
export const NEWS_HUB_TITLE = "Lottery News, Winners, Jackpots & Player Stories | LotteryCorner";
export const NEWS_HUB_DESCRIPTION =
  "Read verified U.S. lottery news, jackpot updates, winner stories, state developments, LotteryCorner Research " +
  "and community discussions.";

/* ------------------------------------------------------------------ 07A §2 hub modes */

export type NewsHubMode =
  | "NEWS-NORMAL" | "NEWS-BREAKING" | "NEWS-MAJOR-JACKPOT" | "NEWS-LOW-VOLUME" | "NEWS-EVENT";

/**
 * The mode this build runs in. A MODULE CONSTANT, not an environment read (`FD-GATE-01` keeps environment out of
 * page behaviour). `NEWS-LOW-VOLUME` is the honest mode for a review corpus: 07A §2 — *"Do not manufacture news.
 * Increase Guides, Research and archive discovery."*
 */
export const NEWS_HUB_MODE: NewsHubMode = "NEWS-LOW-VOLUME";

/* ------------------------------------------------------------------ 07A §3 page order, verbatim */

export type NewsHubSectionId =
  | "NH-01" | "NH-02" | "NH-03" | "NH-04" | "NH-05" | "NH-06" | "NH-07"
  | "NH-08" | "NH-09" | "NH-10" | "NH-11" | "NH-12" | "NH-13" | "NH-14"
  | "AD-NH00" | "AD-NH01" | "AD-NH02";

/** 07A §3 — the REQUIRED order, all seventeen rows, transcribed exactly. Tests compare against this. */
export const NEWS_HUB_ORDER: readonly NewsHubSectionId[] = Object.freeze([
  "NH-01",   //  1 Identity and Navigation
  "NH-02",   //  2 Top/Developing Story
  "NH-03",   //  3 Jackpot Watch
  "AD-NH00", //  4 Advertisement
  "NH-04",   //  5 Latest News
  "NH-05",   //  6 Winners and Unclaimed Prizes
  "NH-06",   //  7 State News
  "NH-07",   //  8 Guides and LotteryCorner Research
  "AD-NH01", //  9 Advertisement
  "NH-08",   // 10 Trending
  "NH-09",   // 11 Most Discussed
  "NH-10",   // 12 Most Read
  "NH-11",   // 13 From the Community
  "NH-12",   // 14 Celebrations and Events
  "NH-13",   // 15 Alerts and Digests
  "NH-14",   // 16 Trust, Reporters and Policies
  "AD-NH02", // 17 Lower Advertisement
]);

/** 07A §3 — module names, for headings and the composition audit. */
export const NEWS_HUB_SECTION_NAMES: Readonly<Record<NewsHubSectionId, string>> = Object.freeze({
  "NH-01": "Identity and Navigation",
  "NH-02": "Top/Developing Story",
  "NH-03": "Jackpot Watch",
  "AD-NH00": "Advertisement",
  "NH-04": "Latest News",
  "NH-05": "Winners and Unclaimed Prizes",
  "NH-06": "State News",
  "NH-07": "Guides and LotteryCorner Research",
  "AD-NH01": "Advertisement",
  "NH-08": "Trending",
  "NH-09": "Most Discussed",
  "NH-10": "Most Read",
  "NH-11": "From the Community",
  "NH-12": "Celebrations and Events",
  "NH-13": "Alerts and Digests",
  "NH-14": "Trust, Reporters and Policies",
  "AD-NH02": "Lower Advertisement",
});

/* ------------------------------------------------------------------ 07B §3 article order → SL-E mapping */

/**
 * THE ARTICLE SECTION-ORDER CONTRACT.
 *
 * 07B §3 defines the fifteen-section order **without section ids of its own** — unlike every other page-family
 * blueprint, its table carries order numbers and names only. The Global Shell v1.1 editorial section library
 * (Part XIV, SL-E01–SL-E10; Part XI momentum SL-M*; Part XVI trust SL-T*) is the governed id vocabulary the shell
 * requires page families to reuse rather than re-invent — so each 07B row is mapped onto the library id that
 * defines the same object, and the mapping is RECORDED HERE as the family's id contract. `libraryId: null` is a
 * recorded answer: the main article body is the NewsArticle itself, which the library wraps rather than names.
 */
export interface NewsArticleSectionRow {
  /** 07B §3 order number, 1–15. */
  order: number;
  /** 07B §3 section name, verbatim. */
  section: string;
  /** The Global Shell library id this row maps onto, or `null` where the library genuinely has no id for it. */
  libraryId: string | null;
  /** Why this mapping. */
  note: string;
}

export const NEWS_ARTICLE_SECTION_ORDER: readonly NewsArticleSectionRow[] = Object.freeze([
  { order: 1, section: "Category, entities and status", libraryId: "SL-E01",
    note: "SL-E01 Article Header contains classification and related entities." },
  { order: 2, section: "Headline", libraryId: "SL-E01",
    note: "SL-E01 Article Header contains the headline." },
  { order: 3, section: "Reporter identity and dates", libraryId: "SL-E01",
    note: "SL-E01 Article Header contains author and dates; SL-E10 carries the accountability detail on /authors." },
  { order: 4, section: "Bottom Line", libraryId: "SL-E02",
    note: "SL-E02 Article Summary, with editorial ownership (07B §5)." },
  { order: 5, section: "Primary image/data card", libraryId: "SL-E04",
    note: "SL-E04 Current Fact Card — the review corpus renders a verified before/after data card, never a fabricated image (07B §18)." },
  { order: 6, section: "Main article", libraryId: null,
    note: "The article body IS the NewsArticle; the editorial library wraps it and has no id for the prose itself." },
  { order: 7, section: "Conditional AI context", libraryId: "SL-I10",
    note: "SL-I10 AI Research Note. SUPPRESSED for the review corpus — nothing can pass the 07 §7 acceptance test with no model connected, and suppression is the compliant state." },
  { order: 8, section: "Why It Matters", libraryId: "SL-E03",
    note: "SL-E03 Why It Matters — plain player-oriented significance." },
  { order: 9, section: "Historical/data connection", libraryId: "SL-E06",
    note: "SL-E06 Historical Context — deterministic LotteryCorner data before AI explanation (07B §10)." },
  { order: 10, section: "Relevant tool/game/state/guide", libraryId: "SL-M01",
    note: "SL-M01 Primary Next Action — one relevant action, not a tool wall (07B §11)." },
  { order: 11, section: "Focused discussion question", libraryId: "SL-E08",
    note: "SL-E08 Article Discussion — one neutral question tied to the story (07B §12)." },
  { order: 12, section: "Canonical discussion", libraryId: "SL-E08",
    note: "SL-E08 — the durable thread. A typed seam (`canonicalDiscussionThreadId`) until the community phase connects a real thread; no fabricated comments render meanwhile." },
  { order: 13, section: "Related next actions", libraryId: "SL-M02",
    note: "SL-M02 Explore More Rail — maximum three (07C Template A)." },
  { order: 14, section: "Sources, updates and corrections", libraryId: "SL-T01",
    note: "SL-T01 Source/Verification, with SL-E09 Update/Correction Note rendered inside it when a correction exists (07C Template L)." },
  { order: 15, section: "Responsible Play/affiliate disclosure", libraryId: "SL-T05",
    note: "SL-T05 Responsible Play. No affiliate CTA exists on any review article (07 §23)." },
]);

/* ------------------------------------------------------------------ routes (07 §21) */

/** 07 §21 URL contract, plus the founder-added search page (no blueprint section; noindex always). */
export const NEWS_HUB_PATH = "/news";
export const NEWS_SEARCH_PATH = "/news/search";
export const newsArticlePath = (slug: string) => `/news/${slug}`;
export const newsAuthorPath = (slug: string) => `/authors/${slug}`;
