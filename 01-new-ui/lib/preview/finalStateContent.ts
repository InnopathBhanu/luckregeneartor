/*
 * Final-state sample content — DESIGN VALIDATION ONLY.
 *
 * Authority: LRG-UI-013 §7 (Community), §8/§9 (News and Media), §10 (Tools), §11 (Play), §12
 * (Insider), §13 (Newsletter). The founder's instruction is explicit: render representative local
 * sample content so the completed launch design can be judged, rather than judging today's content
 * availability.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * ⚠ RECORDED CONFLICT — read before reusing anything in this file.
 *
 * Product Constitution v2.1 §17 and CLAUDE.md §19 prohibit fabricating community posts, replies,
 * reputation or activity, and prohibit fabricating news. This file does exactly that, because
 * LRG-UI-013 §7 and §8 instruct it and a founder instruction in the active task is tier 1 in the
 * CLAUDE.md §2 hierarchy.
 *
 * The conflict is NOT silently reconciled. It is recorded in
 * 03-docs/04-page-specifications/home-preview/home-preview-founder-review.md §9, and it needs
 * transcribing into 03-docs/08-decisions/source-conflicts.md by a governance task — that file is
 * outside this task's allowed paths.
 *
 * CONSEQUENCE, stated plainly: this content must never reach a public surface. The protections that
 * remain are the `LC_HOME_PREVIEW` server guard, `robots: noindex, nofollow`, the `data-provenance`
 * attributes, and `SYNTHETIC_FINAL_STATE` below. The one protection deliberately traded away is the
 * VISIBLE label, which now appears only under `LC_HOME_PREVIEW_DEBUG=true`.
 *
 * Mitigations applied inside the fabricated content itself:
 *   - display names are obviously handle-like, never plausible full personal names, so no real person
 *     can appear to have said something they did not;
 *   - avatars are generated initials, never a photograph of a person;
 *   - no post asserts a lottery FACT (no winning claim, no prize amount, no strategy that works);
 *   - no editorial item asserts a verifiable current event with a fake source or byline.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */

import type { CommunityDiscussion, LocalImage, MediaUpdate, StoryItem } from "./types";

/**
 * Single marker for everything in this module. Anything carrying it is fabricated for layout review.
 * Grep this constant to find every fabricated surface on the page.
 */
export const SYNTHETIC_FINAL_STATE = "synthetic-final-state-design-sample" as const;

/* --------------------------------------------------------------- §7 Community */

/**
 * Representative discussions: one lead plus two supporting.
 *
 * Handle-style display names and initial avatars are deliberate — see the mitigations above. None of
 * these posts claims a win, a prize, or that any method improves odds.
 */
export const SAMPLE_DISCUSSIONS: CommunityDiscussion[] = [
  {
    title: "How do you decide when to take the annuity instead of cash?",
    forum: "Claims & Payouts",
    replyCount: 34,
    lastActivityDisplay: "2 hours ago",
    authorDisplayName: "midwest_player",
  },
  {
    title: "Double Play explained — is it worth the extra dollar?",
    forum: "Game Talk",
    replyCount: 21,
    lastActivityDisplay: "6 hours ago",
    authorDisplayName: "quietnumbers",
  },
  {
    title: "Florida claim centre — what to bring and how long it took",
    forum: "Florida",
    replyCount: 12,
    lastActivityDisplay: "yesterday",
    authorDisplayName: "gulfcoast_j",
  },
];

/** Initials for the avatar treatment. No photograph of a person is ever used. */
export function initialsFor(handle: string): string {
  const parts = handle.replace(/[^a-z0-9]+/gi, " ").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* -------------------------------------------------- §8/§9 News and Media band */

const IMG = (name: string): LocalImage => ({
  src: `/home-preview/editorial-${name}.svg`,
  width: 320,
  height: 160,
});

/**
 * Editorial items for the band. `alt` is meaningful sample text (§9) rather than empty, because these
 * now carry a lead-story role rather than sitting decoratively beside a heading.
 */
export const SAMPLE_LEAD_STORY: StoryItem & { alt: string } = {
  title: "How jackpot rollovers actually work, and why the estimate keeps moving",
  href: "/blog",
  summary:
    "A plain-language walkthrough of how an advertised jackpot is estimated, why it changes between draws, and what the cash value figure really represents.",
  category: "Guide",
  image: IMG("jackpot"),
  alt: "Illustration of rising jackpot amounts",
};

export const SAMPLE_SECONDARY_STORY: StoryItem & { alt: string } = {
  title: "Claiming a prize: the five steps every state has in common",
  href: "/blog",
  summary: "Deadlines, identification, and where to go for larger amounts.",
  category: "Claims",
  image: IMG("guide"),
  alt: "Illustration of a claim checklist",
};

export const SAMPLE_MEDIA_UPDATE: MediaUpdate & { alt: string; durationLabel: string } = {
  title: "Draw night recap — Wednesday numbers read out",
  platform: "youtube",
  publishedDisplay: "2 days ago",
  thumbnail: IMG("video"),
  alt: "Draw night recap thumbnail",
  durationLabel: "4 min",
};

/* ------------------------------------------------------------------ §10 Tools */

export interface SampleTool {
  key: string;
  label: string;
  body: string;
  /** What the local sample interaction shows. Never a route. */
  sampleAction: string;
}

export const SAMPLE_TOOLS: SampleTool[] = [
  {
    key: "check-ticket",
    label: "Check Your Ticket",
    body: "Enter your numbers and compare them against a published draw.",
    sampleAction: "Open checker",
  },
  {
    key: "tax",
    label: "Tax Calculator",
    body: "See how federal and state withholding affect a prize.",
    sampleAction: "Open calculator",
  },
  {
    key: "alerts",
    label: "Jackpot Alerts",
    body: "Follow a game and hear when its jackpot moves.",
    sampleAction: "Choose games",
  },
  {
    key: "analysis",
    label: "Number Analysis",
    body: "Look at how numbers have fallen across past draws.",
    sampleAction: "Open analysis",
  },
  {
    key: "responsible",
    label: "Responsible Play",
    body: "Set your own limits and find support if play stops being fun.",
    sampleAction: "Read guidance",
  },
];

/* --------------------------------------------------------- §11 Play your games */

export const SAMPLE_PLAY_GAMES = ["Powerball", "Mega Millions", "Lotto America"] as const;

export const SAMPLE_PLAY_METHOD_SUMMARY =
  "Where you can play depends on your state: some states sell directly, some allow a courier, and in others tickets are sold in person only.";

/* -------------------------------------------------------------- §12 Insider */

export interface SampleInsiderCard {
  key: string;
  title: string;
  body: string;
}

/**
 * VISUAL-ONLY promotion of the anonymous Home's account value.
 *
 * CLAUDE.md §16 keeps Member/Insider architecture behind open founder decisions. Nothing here
 * implements authentication, subscription, entitlement, quota or storage, and nothing implies the
 * reader is signed in. These are four descriptive cards and no more.
 */
export const SAMPLE_INSIDER_CARDS: SampleInsiderCard[] = [
  { key: "favorites", title: "Favorite Games", body: "Keep the games you follow one tap away." },
  { key: "alerts", title: "Jackpot Alerts", body: "Hear when a jackpot you follow moves." },
  {
    key: "patterns",
    title: "AI Pattern Exploration",
    body: "Look further back through historical draw patterns.",
  },
  { key: "tools", title: "Personalized Tools", body: "Your states and games, remembered." },
];

/* ------------------------------------------------------------ §13 Newsletter */

export const SAMPLE_NEWSLETTER = {
  value: "Winning numbers and jackpot movements for the games you follow, once a day.",
  placeholder: "you@example.com",
  action: "Subscribe",
  privacyNote: "One email a day at most. Unsubscribe from any message.",
} as const;
