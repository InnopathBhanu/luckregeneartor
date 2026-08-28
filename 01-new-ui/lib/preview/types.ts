/*
 * Home preview view-model types — PREVIEW ONLY.
 *
 * Authority: 03-docs/04-page-specifications/home-preview/home-preview-view-model.md
 *
 * THIS IS NOT AN API CONTRACT and NOT a domain model. It is a presentation contract for the
 * anonymous Home preview, deliberately versioned outside the `0.1-sample` fixture stream so it
 * cannot be mistaken for the production view model produced in Phase 7.
 *
 * Anonymous scope only. No signed-in field is defined here. The shape is arranged so a later
 * `shell.account.state = "signed-in"` plus additional ordered `sections` entries (H-01S…H-08S)
 * can be added without changing any field below.
 */

import type { ResultCard } from "../data-provider/types";
import type { DrawAnalysis, GameComparison } from "./drawAnalysis";

export const PREVIEW_SCHEMA_VERSION = "preview-1.0";
export const PREVIEW_SUPERSEDED_BY = "Phase 7 Home view-model contract";

export type Provenance = "production-derived" | "copied" | "synthetic" | "illustrative";

export type SectionState =
  | "ready"
  | "loading"
  | "empty"
  | "stale"
  | "corrected"
  | "unavailable";

export type PreviewAction =
  | "current-data"
  | "transformed-fixture"
  | "labelled-preview-state";

/** Global Shell §10.5: every section declares an intelligence layer, or documents that none adds value. */
export type Intelligence =
  | "deterministic"
  | "generative"
  | "curated"
  | "interesting-fact"
  | "next-action"
  | "none-documented";

/** Availability of an interactive affordance. Never renders as a silently disabled control (DS-17). */
export type Availability = "live" | "preview-unavailable";

export interface LinkRef {
  label: string;
  href: string;
  state: Availability;
}

/**
 * A navigation destination — a `LinkRef` that also knows whether it is the page the reader is on.
 *
 * Separate from `LinkRef` because `current` is meaningful only for navigation: an in-page action link or a
 * card's "read more" has no notion of being the current page, and widening `LinkRef` would have required every
 * one of its dozens of producers to answer a question that does not apply to them.
 *
 * `current` drives `aria-current="page"`. The entry stays a LINK — WCAG 2.4.8 and GS-03's "active state visible
 * by text/shape and color" both want the current page identified, and neither wants it made unreachable.
 */
export interface NavItem {
  label: string;
  /**
   * `null` when the destination does not exist.
   *
   * LRG-UX-SCHEMA-002 §1: this was `string`, so an unavailable entry had to carry SOMETHING — the bottom
   * navigation used `"#"` and the desktop AI control used `/ai-policy`. Both are destinations, and a reader who
   * activates them goes somewhere. A type that cannot express "there is nowhere to go" forces every producer to
   * invent a place, which is how a control labelled "Ask LotteryCorner" came to open the AI policy page.
   */
  href: string | null;
  state: Availability;
  current: boolean;
}

/**
 * Visual weight of a section (LRG-UI-010 direction 8: clearer demarcation and stronger rhythm).
 * PRESENTATION ONLY — it never changes the BP-02 §12 section order, and it is not an authority
 * signal. `feature` is reserved for the flagship result surfaces.
 */
export type SectionTone = "feature" | "standard" | "quiet";

/**
 * Visual family (LRG-UI-011 §12). Four reusable surface treatments so the page reads as grouped
 * rather than as one merged column.
 *
 *   results    Family A — white high-priority surface, navy headings, strongest cards.
 *   tools      Family B — soft pale-blue band; task orientation; AI distinct but not promotional.
 *   community  Family C — warmer restrained surface; human and editorial signals.
 *   directory  Family D — canvas or white; compact rows and link groups; low decorative weight.
 *
 * PRESENTATION ONLY. A family never changes section order, never merges governed sections, and is
 * not an authority signal.
 */
export type SectionFamily = "results" | "tools" | "community" | "directory";

/**
 * Presentation grouping band (LRG-UI-011 §3).
 *
 * Contiguous sections sharing a band render under one shared visual heading. The band is a VISUAL
 * GROUPING LABEL — it is not a governed content section, has no BP-02 section ID, and every member
 * section keeps its own `<section id="H-…">` element and remains separately identifiable in the DOM.
 */
export type SectionBand = "latest-from-lc";

/**
 * A LOCALLY AUTHORED or locally copied image. There is no remote asset, no CDN and no external
 * request; every path resolves under /public. Editorial imagery is decorative (LRG-UI-010
 * direction 7), so `alt` is deliberately absent — the adjacent heading is the accessible name.
 */
export interface LocalImage {
  src: string;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------

export interface PreviewMeta {
  previewMode: true;
  previewLabel: string;
  schemaVersion: typeof PREVIEW_SCHEMA_VERSION;
  supersededBy: typeof PREVIEW_SUPERSEDED_BY;
  partnerScriptsActive: false;
  provenanceSummary: Record<Provenance, string[]>;
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------

export interface PreviewPage {
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Canonical is deliberately NOT emitted — host/trailing-slash migration is unresolved. */
  canonical: { policy: "not-emitted"; placeholder: string; reason: string };
  robots: string;
  lastUpdated: { display: string; isoDateModified: string; timezoneLabel: string };
  stale: boolean;
  /** Compact badge text, e.g. "Sample data · 16 days old". */
  staleNote: string | null;
  /** Longer explanation, shown only where staleness materially matters. */
  staleDetail: string | null;
  source: { name: string; text: string; verifiedLabel: string };
  correction: {
    present: boolean;
    what?: string;
    previousValue?: string;
    replacementValue?: string;
    whenDisplay?: string;
    impact?: string;
  };
  independenceDisclaimer: string;
  responsiblePlay: { text: string; ageNotice: string };
  /** BP-02 §69: WebPage + WebSite + Organization; ItemList conditional; no SearchAction, no BreadcrumbList on root Home. */
  schema: {
    webPage: true;
    webSite: true;
    organization: true;
    itemList: { name: string; items: { name: string; path: string }[] }[];
    searchAction: false;
    breadcrumbList: false;
  };
}

// ---------------------------------------------------------------------------
// shell
// ---------------------------------------------------------------------------

export interface PreviewShell {
  /**
   * The brand mark is a single designed ASSET (`/brand-lockup.png`), not text assembled at render
   * time — so no wordmark strings live here. `markLabel` is the link's accessible name only; the
   * image itself is decorative. `brandName`/`brandAccent` were removed when the CSS approximation
   * was replaced: keeping them would leave a second, silently divergent source of brand truth.
   * Provenance: lib/shell/brand-asset-manifest.json.
   */
  header: { markLabel: string };
  primaryNav: NavItem[];
  search: { placeholder: string; state: Availability; explanation: string };
  /**
   * GS-06 AI entry (LRG-UI-012 §3). `label` is the desktop wording and `compactLabel` the
   * space-constrained mobile wording. Generic "Ask AI" is retired — the action carries the product
   * name so the capability is identifiable. `href` scrolls to H-05; no route is created.
   */
  /*
   * GS-06. `href` is `null` on a page with NO answer surface — LRG-UX-SCHEMA-002 §1.
   *
   * It used to fall back to `/ai-policy`, and `PreviewHeader` rendered the control as a prominent link whatever
   * the `state` said. So on the archive, News, Community, Tools, Blog, the auth pages and every informational
   * page, a button reading "Ask LotteryCorner" opened a policy document. The label promised an answer; the
   * destination was a page about the rules for answers.
   *
   * `explanation` carries the reader-facing reason and is rendered VISIBLY when the trigger is unavailable —
   * not as a tooltip and not only to screen readers.
   */
  aiTrigger: {
    label: string; compactLabel: string; href: string | null; state: Availability; explanation: string;
    /** Shown beside the label when `state` is not `live`. Plain language, no product terminology. */
    unavailableNote: string;
  };
  /**
   * Compact AI value statement rendered near H-01 (§2).
   *
   * It states what LotteryCorner AI does. It uses the approved AI treatment and the consistent AI
   * mark, and it must NOT read as an advertisement or push the flagship games materially lower.
   */
  /** `href` is `null` where no answer surface exists; the action is then not rendered at all. */
  aiValueStatement: { text: string; actionLabel: string; href: string | null };
  /**
   * GS-07. The SERVER-SIDE shell model is ALWAYS anonymous — Global Shell §33's security rule ("account/menu
   * state must not be cached into public pages") is enforced by this type: `state` cannot express a member.
   * Member chrome is rendered client-side by `components/account/AccountMenu.tsx` after hydration.
   * `available` records whether a real sign-in flow exists (it does — Conflict 37, 2026-08-11).
   */
  account: {
    state: "anonymous";
    signInLabel: string;
    registerLabel: string;
    valueStatement: string;
    available: boolean;
    /** The real shared flow's routes. Present only while `available` is true. */
    signInHref?: string;
    registerHref?: string;
  };
  stateContext: {
    resolved: boolean;
    source: "none";
    askUserPrompt: string;
    options: { code: string; name: string }[];
  };
  bottomNav: NavItem[];
  jackpotTicker: {
    heading: string;
    nextDraw: string | null;
    topJackpots: { game: string; amountDisplay: string; estimatedLabel: string }[];
    disclaimer: string;
  };
  responsiblePlayAccess: LinkRef;
  /**
   * The ONE visible provenance disclosure on the page (LRG-UI-010 direction 1).
   *
   * Ordinary-player language only. Developer and debug terminology — "preview", "debug", section
   * IDs, slot keys, reserved pixel heights, inventory counts — MUST NOT appear in visible copy.
   * The internal protections are unchanged and live where they belong: `meta.previewMode`,
   * `robots: noindex, nofollow`, the `data-*` attributes, and the build-blocking
   * `assertProvenanceLabels` check.
   */
  sampleDataNotice: string;
}

// ---------------------------------------------------------------------------
// sections
// ---------------------------------------------------------------------------

export interface SectionEnvelope<K extends string, D> {
  id: string;
  name: string;
  order: number;
  kind: K;
  headingLevel: 2 | 3;
  previewAction: PreviewAction;
  provenance: Provenance;
  provenanceLabel: string | null;
  state: SectionState;
  stateText: string | null;
  adTier: 0 | 1 | 2 | 3;
  protectedZone: boolean;
  intelligence: Intelligence;
  mobilePriority: 1 | 2 | 3 | 4 | 5;
  /** Presentation weight only — never reorders, merges or omits a blueprint section. */
  tone: SectionTone;
  /** Presentation surface family only (§12). */
  family: SectionFamily;
  /** Presentation grouping only (§3). Never a governed section ID. */
  band?: SectionBand;
  /**
   * Contextual AI affordances for this section (LRG-UI-012 §9).
   *
   * SELECTIVE BY DESIGN. Only the sections the founder named carry these, at most a few each, and
   * never one per item. A section with nothing useful to offer has none.
   */
  aiActions?: AiAction[];
  data: D;
}

/** An advertising anchor occupies a position in the same ordered sequence as content sections. */
export interface AdAnchorEntry {
  id: string;
  name: string;
  order: number;
  kind: "ad-anchor";
  anchorId: string;
}

/**
 * BP-02 §14's *advertised jackpot* for a featured national game, and how it relates to the figure beside it.
 *
 * ══ WHY THIS IS A KEYED SIDE-MAP AND NOT A FIELD ON `ResultCard` ══
 *
 * `ResultCard` is the shared data-provider contract — State, the Game Page and the archive all read it. A
 * Home-only presentational pairing does not belong in it (`CLAUDE.md` §15: contracts keep domain data and
 * presentation view models separate). H-02A already threads its per-game draw analysis exactly this way,
 * `analyses[gameSlug]`, so this follows the pattern the section established rather than inventing a second one.
 *
 * ══ WHY BOTH DRAWING DATES ARE CARRIED ══
 *
 * The card shows TWO money figures, and before this it labelled one of them "estimated jackpot" with a next-draw
 * date underneath — so a reader could reasonably read that figure as the jackpot for the drawing that has not
 * happened yet. Every figure therefore names the exact drawing it belongs to, and the Constitution's *"exact dates
 * where 'today' or 'last night' could be ambiguous"* rule is why these are dates and not "next" or "tonight".
 */
export interface ForwardJackpot {
  /** The advertised amount for the NEXT drawing, in the fixture's own display form. */
  amountDisplay: string;
  /** The exact drawing that amount is advertised for — "Saturday, 07/11/2026". */
  drawDateDisplay: string;
  /** The exact drawing the card's OTHER figure belongs to — the one whose numbers are shown. */
  resultDrawDateDisplay: string;
  /**
   * "Up $22 million from the July 8, 2026 drawing." — resolved on the server by `jackpotDelta`, so it is in the
   * initial HTML and adds no layout shift. `null` when the two figures cannot both be sourced exactly.
   */
  changeSentence: string | null;
}

/**
 * The three governed values §B1's relative next-draw label needs.
 *
 * A display string cannot supply them: it carries no ISO date, no draw time and no zone, and re-deriving a governed
 * date from a display format is what `CLAUDE.md` §14 forbids. Every field is optional as a SET — a surface either
 * has all three from `homeDrawSchedule.ts` or has none, and `NextDrawRelative` renders nothing without all three.
 */
export interface NextDrawTimingRef {
  /** Game-local `YYYY-MM-DD`, derived from the game's published draw days. */
  nextDrawLocalDate?: string;
  /** The operator's published local draw time, e.g. `"10:59 PM"`. */
  nextDrawTimeLocal?: string;
  /** The governed IANA zone, e.g. `America/New_York`. Never a label like "ET". */
  nextDrawTimeZone?: string;
}

export interface JackpotRow extends NextDrawTimingRef {
  game: string;
  href?: string;
  amountDisplay: string;
  estimatedLabel: string;
  nextDrawDisplay?: string;
  statusText?: string;
  /**
   * The SAME game's advertised figure at the previous drawing, and what to call that drawing — §B2.
   *
   * Both optional and both required together: the delta is arithmetic between two PUBLISHED figures, and a
   * reference point a reader cannot identify makes the difference meaningless. When either is absent the row
   * renders no delta at all — never an estimate, and never a rise inferred from a single figure
   * (`CLAUDE.md` §14 names jackpots explicitly).
   *
   * `home-page-sample.json` supplies NEITHER today: its `topJackpots` rows are `[game, amount, nextDraw]`. So H-03
   * currently shows no delta, which is the correct output for the data that exists. The gap is recorded in the
   * implementation report; closing it is a feed/fixture task, and this row is ready for it.
   */
  previousAmountDisplay?: string;
  previousDrawLabel?: string;
}

export interface DrawStatusRow {
  game: string;
  drawDisplay: string;
  status: "live" | "completed" | "awaiting" | "delayed";
  statusText: string;
}

export interface UpcomingItem extends NextDrawTimingRef {
  game: string;
  drawDisplay: string;
  jackpotDisplay?: string;
  estimatedLabel?: string;
  statusText?: string;
}

export interface HighlightItem {
  kind: "recent-win" | "unclaimed" | "jackpot-growth";
  text: string;
  location?: string;
  amount?: string;
  note?: string;
}

export interface StoryItem {
  title: string;
  href: string;
  summary?: string;
  dateDisplay?: string;
  category?: string;
  /** Locally authored thumbnail. Decorative — the story title carries the meaning. */
  image?: LocalImage;
}

/**
 * A named platform capability (LRG-UI-010 direction 5: LotteryCorner AI must read as a real product
 * capability, not a generic chatbot). Describing a capability is not the same as claiming it is live:
 * `state` records whether it is actually available.
 */
/**
 * A contextual AI affordance (§9).
 *
 * Added only where it is genuinely useful, never for visual density. `state` records whether it is
 * actually available; none is live in the preview, so each renders as a labelled, non-actionable
 * control rather than a link to nowhere.
 */
export interface AiAction {
  label: string;
  /** Icon hint; the label always carries the meaning. */
  icon: "analysis" | "compare" | "explain" | "history";
  state: Availability;
}

export interface CapabilityItem {
  title: string;
  body: string;
  state: Availability;
}

/**
 * A polished, truthful empty state (LRG-UI-011 §4/§5/§6).
 *
 * This is what renders when genuine data does not exist. It is NOT a placeholder for content that
 * will be faked later: `headline` states plainly that there is nothing yet, and `body` explains what
 * the surface will carry. Developer terminology — "preview", "illustrative", "TODO" — is prohibited
 * in both fields.
 */
export interface EmptyState {
  headline: string;
  body: string;
}

/**
 * A community discussion drawn from the forum the Community family serves.
 *
 * Constructed ONLY from `lib/community/communityDiscussionSource.ts` — the seam over the community
 * BFF — so every field is a fact about a real `/community/{slug}` thread (today: the Conflict 41
 * review corpus, disclosed wherever it renders). Nothing here may ever be estimated or invented.
 */
export interface CommunityDiscussion {
  title: string;
  forum: string;
  /** Genuine reply count. Never estimated, never rounded up, never invented. */
  replyCount: number;
  /** Genuine latest-activity value, human-readable. */
  lastActivityDisplay: string;
  /** Real display name, only where available AND permitted to publish. */
  authorDisplayName?: string;
  href?: string;
}

/** A GENUINE video or social update. Populated only from real local metadata. */
export interface MediaUpdate {
  title: string;
  platform: "youtube" | "x" | "facebook" | "instagram" | "pinterest";
  publishedDisplay: string;
  thumbnail?: LocalImage;
  /** Only set once a destination is approved. Absent means the card does not link out. */
  href?: string;
}

/**
 * A real LotteryCorner channel. Evidenced by production data — the transcribed production footer
 * (`04-sample-data/footer-config.json`) and the legacy templates. Naming a channel that genuinely
 * exists is not fabrication; claiming a post on it would be.
 */
export interface MediaChannel {
  label: string;
  platform: "youtube" | "x" | "facebook" | "instagram" | "pinterest";
  /** Why it is not actionable here. Stated in text, never a dead control. */
  stateText: string;
}

export interface PurchaseRef {
  label: string;
  /** Unresolved by design: BP-04 §4 approves /play/{game}; the implementation and legacy use /buynow/{code}. */
  routeRef: { status: "unresolved"; candidates: string[] };
  disclosure: string;
  relAttributes: "nofollow sponsored";
  eligibility: { resolved: false; stateText: string };
}

export interface InfoBlock {
  title: string;
  body?: string;
  list?: string[];
}

/* Discriminated union of every anonymous Home section payload. */
export type PreviewSection =
  | SectionEnvelope<"task-entry", { taskEntries: LinkRef[]; stateEntryHeading: string; stateEntryIntro: string; compactAiLabel: string; stateOptions: { code: string; name: string }[] }>
  /*
   * H-02A. `analyses` is keyed by gameSlug and is computed locally by lib/preview/drawAnalysis.ts —
   * no external service is involved. A game with no computable analysis is simply absent from the
   * map and its card renders without an analysis block.
   */
  | SectionEnvelope<"result-cards", { heading: string; intro?: string; cards: ResultCard[]; analyses: Record<string, DrawAnalysis>; forwardJackpots: Record<string, ForwardJackpot>; comparison: GameComparison | null }>
  /* `analysisRef` lets H-03 open the shared AI overlay with a representative analysis (§5), without
     giving every result card its own analysis block — §6 forbids that density. */
  | SectionEnvelope<"result-groups", { heading: string; intro?: string; analysisRef?: DrawAnalysis; groups: { groupKey: string; heading: string; cards: ResultCard[] }[] }>
  | SectionEnvelope<"jackpot-table", { heading: string; intro?: string; rows: JackpotRow[] }>
  | SectionEnvelope<"check-numbers", { heading: string; intro: string; howItWorks: string[] }>
  /* `oddsDisclaimer` is mandatory whenever a number-generating capability is offered (§16). */
  | SectionEnvelope<"ai-brief", { heading: string; aiLabel: string; mode: "deterministic-fallback"; summaryLines: string[]; citations: LinkRef[]; disclaimer: string; capabilities: CapabilityItem[]; oddsDisclaimer: string; examplePrompts: string[]; askLabel: string }>
  | SectionEnvelope<"draw-status", { heading: string; rows: DrawStatusRow[]; awaitingCard: ResultCard | null }>
  | SectionEnvelope<"upcoming", { heading: string; items: UpcomingItem[] }>
  | SectionEnvelope<"state-explore", { heading: string; intro?: string; states: { code: string; name: string; href: string }[] }>
  | SectionEnvelope<"highlights", { heading: string; intro?: string; items: HighlightItem[] }>
  /*
   * TOOLS, SYSTEMS AND NUMBER EXPLORATION — BP-02 §12 order 15 names all three, and §23 lists
   * "Systems and Wheels" and "Frequency / number history" among the initial tools.
   *
   * `systemsHeading` and `systemsIntro` exist SEPARATELY from `systems` because LRG-UI-016 filters
   * `systems` down by topic to remove rows that duplicate a tool card — and when that filter emptied
   * the array it also silently took the sub-block's heading and its intro with it. The intro is not
   * decoration: it is the Constitution §7 language that says draws are random and outcomes cannot be
   * predicted or guaranteed. Framing and safety copy must not be collateral damage of a de-duplication.
   */
  | SectionEnvelope<"tools", { heading: string; intro?: string; tools: LinkRef[]; systemsHeading?: string; systemsIntro?: string; systems: InfoBlock[] }>
  | SectionEnvelope<"popular-games", { heading: string; items: { slug: string; displayName: string; href: string; jurisdiction?: string; topPrizeDisplay?: string; nextDrawDisplay?: string; purchase?: PurchaseRef }[] }>
  | SectionEnvelope<"jackpot-history", { heading: string; intro?: string; items: JackpotRow[]; chart: null; chartReason: string }>
  /*
   * COMMUNITY (LRG-UI-011 §4; discussions connected under the Conflict 41 FOUNDER AMENDMENT).
   *
   * `discussions` may ONLY be populated from the forum the Community family actually serves. That
   * forum now exists — `/community` and `/community/{slug}` are registry-served routes (commit
   * a39bdfe) over the Conflict-41-authorized review corpus — so `FD-ACC-10`'s "hidden because no
   * forum platform exists" condition is satisfied by construction and this slot is filled through
   * `lib/community/communityDiscussionSource.ts` (the BFF seam, never the JSON). `emptyState`
   * remains the designed fallback for a build whose corpus is retired.
   *
   * No username, avatar, reply count, timestamp, reputation or popularity figure may ever be
   * synthesised into this shape — Constitution §17 forbids it outright. Every populated value is a
   * fact about a disclosed fixture thread, and `disclosure` carries the amendment-condition-1
   * banner sentence so the surface can say so. `topics` describes what the forum is FOR; it is a
   * capability description, not activity.
   */
  | SectionEnvelope<"community", { heading: string; kicker: string; intro: string; discussions: CommunityDiscussion[]; emptyState: EmptyState; topics: CapabilityItem[]; image?: LocalImage; disclosure?: string | null; moreHref?: string; moreLabel?: string }>
  | SectionEnvelope<"winners", { heading: string; items: { title?: string; amountDisplay?: string; game?: string; location?: string; dateDisplay?: string; text: string }[]; image?: LocalImage }>
  /*
   * EDITORIAL (LRG-UI-011 §5).
   *
   * `items` may carry a story ONLY when its classification is honest. A current-news claim requires
   * a verified headline, date, source and link; evergreen help content is permitted but must be
   * labelled Guide or Analysis rather than News. `emptyState` covers the case where no verified
   * current story exists, which is the case for Home today.
   */
  | SectionEnvelope<"stories", {
      heading: string; intro?: string; items: StoryItem[]; emptyState?: EmptyState;
      /** A real "more" destination, set only when the route exists (H-11 → /news since the News family shipped). */
      moreHref?: string; moreLabel?: string;
    }>
  | SectionEnvelope<"purchase", { heading: string; copy: string; purchase: PurchaseRef }>
  | SectionEnvelope<"account-value", { heading: string; subheading?: string; valuePoints: InfoBlock[] }>
  /*
   * RETURN AND DISTRIBUTION — the governed section that carries video and social (LRG-UI-011 §6).
   *
   * `updates` may only be populated from real local metadata: a genuine thumbnail, title, platform
   * and verified publication date, with a destination only once one is approved. There is none, so
   * `emptyState` renders instead. No title, view count, duration, date or engagement metric is ever
   * invented.
   *
   * `mediaChannels` names channels that GENUINELY EXIST — evidenced by the transcribed production
   * footer and the legacy templates. Naming a real channel is not fabrication; claiming a post on it
   * would be. NOTHING is embedded: no YouTube iframe, no X widget, no external script, no request.
   *
   * `channels` remains the return half of the section: reminders and alerts.
   */
  | SectionEnvelope<"return-channels", { heading: string; intro?: string; channels: { label: string; stateText: string; kind: "reminder" | "alert"; body?: string }[]; updates: MediaUpdate[]; emptyState: EmptyState; mediaChannels: MediaChannel[]; image?: LocalImage }>
  | SectionEnvelope<"newsletter", { heading: string; text?: string; emailPlaceholder: string }>
  | SectionEnvelope<"state-directory", { heading: string; intro?: string; states: { code: string; name: string; href: string }[] }>
  /*
   * TRUST, SUPPORT AND FOOTER — BP-02 §29.
   *
   * `faq` follows the pattern already approved and shipped on the flagship game pages, where FG-15 is
   * "Trust, responsible play and FAQ" and the FAQ renders inside that section rather than claiming a
   * section ID of its own. BP-02 §12 has no FAQ entry, so absorbing it here adds the visible FAQ the
   * founder asked for WITHOUT amending the frozen 30-entry sequence. `null` when the fixture marks the
   * block not visible on the page — a hidden FAQ is an absent one, and schema follows visibility.
   */
  | SectionEnvelope<"trust", { heading: string; sourcePolicy: string; accuracyPolicy: string; supportLinks: LinkRef[]; faq: { heading: string; items: { q: string; a: string }[] } | null }>;

export type PreviewEntry = PreviewSection | AdAnchorEntry;

export function isAdAnchor(e: PreviewEntry): e is AdAnchorEntry {
  return e.kind === "ad-anchor";
}

// ---------------------------------------------------------------------------
// root
// ---------------------------------------------------------------------------

export interface HomePreviewViewModel {
  meta: PreviewMeta;
  page: PreviewPage;
  shell: PreviewShell;
  /** ORDERED. Order comes from BP-02 §12 — never from object key order or fixture key order. */
  entries: PreviewEntry[];
}
