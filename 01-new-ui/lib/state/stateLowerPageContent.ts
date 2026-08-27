/*
 * STATE LOWER-PAGE CONTENT — the view-data shape for the five approved bands (LRG-STATE-042 §3).
 *
 * WHAT THIS REPLACES, and why it is a replacement rather than an addition. LRG-STATE-040 introduced
 * `stateLandingContent.ts` for the lower page that founder review then rejected. Keeping it alongside this
 * would leave two competing content architectures for the same region, which §3 forbids outright. So that
 * model and its Florida package are gone and this is the single shape.
 *
 * What carried over from it: the ownership rule expressed in the TYPE (a card destination cannot be an
 * external URL), the ban on fabricated social proof, and keeping large public copy out of JSX. What did not:
 * `origin`, `supportingSource`, `groupKey`, `readingMinutes`, the registry and the two assert helpers — all
 * shaped around the rejected composition, and §3 asks for the minimum that supports the approved design.
 *
 * WHAT THIS IS NOT: an API, a CMS, a database contract or a provenance registry. It is view data. Source
 * governance stays in the Florida content manifest, where it decides what MAY publish without becoming
 * visible card content (§4).
 *
 * STATE-NEUTRAL. Nothing here names a jurisdiction and no field branches on a state code. Florida's content
 * lives in exactly one data file.
 */

/**
 * Where a card sends the reader.
 *
 * There is deliberately no `external` variant: the packet's ownership rule is that news, guide and community
 * cards never link to the original official article, so the type makes an outbound card link unexpressible.
 * External destinations exist only in `resourceItems`.
 *
 * `route`   — an implemented LotteryCorner route. Used when one exists.
 * `inPage`  — a fragment this page genuinely renders.
 * `preview` — no route yet, so the card opens a concise inline disclosure in place. Never a modal, never an
 *             invented URL, and never "not published yet" shown to a reader (§5).
 */
export type LowerDestination =
  | { kind: "route"; href: string }
  | { kind: "inPage"; fragment: string }
  | { kind: "preview"; note: string };

/** The visual cue on an Explore card. Drawn inline — never an image placeholder. */
export type ExploreCue = "calendar" | "clock" | "ticket" | "grid";

export interface StateExploreItem {
  key: string;
  title: string;
  copy: string;
  actionLabel: string;
  cue: ExploreCue;
  destination: LowerDestination;
  /** The packet marks one card as the primary utility card. */
  primary?: boolean;
}

export interface StateNewsItem {
  key: string;
  title: string;
  /** Reader-facing date, already formatted as the packet supplies it. */
  date: string;
  category: string;
  summary: string;
  tags: string[];
  actionLabel: string;
  destination: LowerDestination;
  /** Exactly one item is the featured story. */
  featured?: boolean;
  /**
   * The last day this item may appear, ISO. The packet gives the Bonus Play promotion an end date; after it,
   * the item is hidden unless `archived` marks it as intentionally preserved coverage (§6).
   */
  visibleUntil?: string;
  archived?: boolean;
}

export interface StateGuideItem {
  key: string;
  title: string;
  summary: string;
  takeaways: string[];
  tags: string[];
  actionLabel: string;
  destination: LowerDestination;
  /** The packet's per-guide AI label. Focuses the existing shared AI surface; never a second AI system. */
  aiActionLabel: string;
}

export interface StateDiscussionItem {
  key: string;
  title: string;
  excerpt: string;
  tags: string[];
  actionLabel: string;
  destination: LowerDestination;
}

export interface StateResourceItem {
  label: string;
  /** Reader-facing destination name, used in the accessible external label. */
  destinationName: string;
  /** Present only for an official external resource. Internal actions carry none. */
  href?: string;
  /**
   * An in-page anchor on this State's own page — LRG-STATE-048.
   *
   * The internal-destination policy says history, schedules, formats and game detail stay on LotteryCorner
   * whenever a real destination exists. No internal `/{state}/{game}` route is implemented yet, so the real
   * internal destination today is a section of this page. A resource with a fragment renders as an anchor;
   * one with neither `href` nor `fragment` keeps the existing disclosure behaviour.
   */
  fragment?: string;
}

/**
 * A LotteryCorner-owned claim video — LRG-STATE-048.
 *
 * Separate from every claim FACT by design. The video is content we own and can show; the thresholds and
 * deadlines spoken inside it are governed facts that live in the manifest and are NOT transcribed here.
 * That split is why a State can carry a video while its claim guidance stays suppressed.
 */
export interface StateClaimVideo {
  /** YouTube id. Evidenced by legacy `HowToClaim.xml` or by a founder-supplied fixed input. */
  videoId: string;
  title: string;
  /** One neutral sentence. Never a claim rule. */
  description: string;
  /** Visible ownership label. */
  ownerLabel: string;
  /** Privacy-enhanced embed origin. */
  embedUrl: string;
  /** Ordinary YouTube fallback for anyone who cannot use the embed. */
  watchUrl: string;
  /* ---- VideoObject fields. `null` where we genuinely do not have the value. ---- */
  thumbnailUrl: string | null;
  uploadDate: string | null;
  /** ISO 8601 duration, e.g. `PT2M14S`. */
  duration: string | null;
}

export interface StateLowerPageContent {
  exploreHeading: string;
  exploreIntro: string;
  exploreItems: StateExploreItem[];

  newsHeading: string;
  newsIntro: string;
  /** The editorial ownership label shown on every story. */
  newsOwnerLabel: string;
  newsItems: StateNewsItem[];

  guidesHeading: string;
  guidesIntro: string;
  guideLabel: string;
  guideItems: StateGuideItem[];
  aiContinuation: { heading: string; copy: string; actionLabel: string };

  communityHeading: string;
  communityIntro: string;
  discussionItems: StateDiscussionItem[];
  questionContinuation: { heading: string; copy: string; actionLabel: string };
  /**
   * The state's standing community thread, where the Community family's corpus has one — e.g. the
   * Florida monthly Pick 3 thread. Resolved by the model from `lib/community/communityDiscussionSource`
   * (never authored in a state config, so a config cannot invent a thread), and `null` where none
   * exists: the band then links only the `/community` hub and fabricates nothing.
   */
  communityThread?: { label: string; href: string } | null;

  resourcesHeading: string;
  /** The State's own claim video, when one is owned and configured. */
  claimVideo: StateClaimVideo | null;
  trustCopy: string;
  independenceCopy: string;
  resourceItems: StateResourceItem[];
}

/* ------------------------------------------------------------------ selection */

/**
 * The stories visible on a given day.
 *
 * Time behaviour is data, not copy: an expired promotion simply is not in the list, and no freshness-control
 * vocabulary ever reaches the reader (§6). `archived` keeps an item that is deliberately preserved as
 * historical coverage.
 */
export function visibleNews(items: readonly StateNewsItem[], todayIso: string): StateNewsItem[] {
  return items.filter((n) => n.archived || !n.visibleUntil || todayIso <= n.visibleUntil);
}

/** The one featured story, and the rest in supplied order. */
export function splitNews(items: readonly StateNewsItem[]): {
  featured: StateNewsItem | undefined;
  supporting: StateNewsItem[];
} {
  const featured = items.find((n) => n.featured);
  return { featured, supporting: items.filter((n) => n !== featured) };
}

/**
 * How many takeaways to show before the disclosure.
 *
 * §7: no more than three on desktop, two initially on mobile where density needs it. The split is done in CSS
 * rather than by measuring the viewport in JavaScript, so the server HTML carries every takeaway and stays
 * crawlable — the third is hidden by a media query on narrow screens and revealed by a small disclosure.
 */
export const TAKEAWAYS_DESKTOP = 3;
export const TAKEAWAYS_MOBILE = 2;

/** Field names that would constitute fabricated social proof. Refused structurally, not by convention. */
const FABRICATION_FIELDS = [
  "author", "authorName", "username", "avatar", "avatarUrl", "replies", "replyCount", "views", "viewCount",
  "likes", "upvotes", "reputation", "trending", "popular", "activityCount", "lastPostAt",
] as const;

/**
 * Refuse fabricated social proof and any outbound card link.
 *
 * Runs at module load in the content data file, so a package that adds `replyCount: 42` — the change that
 * looks like an improvement in a diff and is a publication hazard on the page — fails the build.
 */
export function assertLowerPageContentSafe(c: StateLowerPageContent): void {
  const cards: Record<string, unknown>[] = [
    ...c.exploreItems, ...c.newsItems, ...c.guideItems, ...c.discussionItems,
  ] as unknown as Record<string, unknown>[];
  for (const card of cards) {
    for (const f of FABRICATION_FIELDS) {
      if (f in card) {
        throw new Error(
          `State lower-page content must not fabricate social proof: "${String(card.key)}" carries "${f}".`,
        );
      }
    }
    const d = card.destination as LowerDestination;
    if (d.kind === "route" && /^https?:/i.test(d.href)) {
      throw new Error(`"${String(card.key)}" must not link outside LotteryCorner: ${d.href}`);
    }
  }
  /* Only an official resource may be external, and it must be a real https destination. */
  for (const r of c.resourceItems) {
    if (r.href && !/^https:\/\//.test(r.href)) {
      throw new Error(`Resource "${r.label}" must be an https official destination.`);
    }
  }
}
