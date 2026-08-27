/*
 * COMMUNITY DISCUSSIONS FOR OTHER PAGE FAMILIES — the read seam Home, State and the archive use.
 *
 * ══ WHY THIS EXISTS NOW ══
 *
 * `ACCT-DEC-001` `FD-ACC-10` kept forum integration hidden "because no forum platform exists". That condition
 * is now satisfied BY CONSTRUCTION: the Community family (08A/08B/08C) serves `/community`,
 * `/community/{slug}` and `/members/{username}` from the registry (commit a39bdfe), over the Conflict 41
 * FOUNDER AMENDMENT review corpus. So the entry points other blueprints designate — Home H-10, State S-14,
 * Game JG-16, archive AR-09 — can finally link real destinations instead of carrying designed empty states.
 *
 * ══ THE HONESTY RULES, RESTATED WHERE THEY ARE ENFORCED ══
 *
 *   - Every read goes through `getCommunityData()` — the ONE BFF seam — so the amendment's per-read
 *     assertions (disclosure banner, provenance, production refusal, expiry) run for these surfaces exactly
 *     as they do for the community pages themselves. Nothing here touches the JSON.
 *   - Every count is the thread's real visible reply count. Nothing is estimated, rounded or invented
 *     (Constitution: community content is human-authored; `CLAUDE.md` §14).
 *   - `disclosure` travels with the data so a consuming surface can render the amendment-condition-1 banner
 *     sentence alongside fixture threads — a surface outside `/community` gets no exemption from disclosure.
 *   - Activity displays are the thread's own recorded dates, never a relative "2 hours ago" computed from a
 *     wall clock the fixture cannot honour.
 */

import { getCommunityData } from "./bff/communityBff";
import { COMMUNITY_HOME_PATH, communityEntryPath, type ForumEntryRecord } from "./communityContract";

/** One linkable discussion, shaped for surfaces outside the Community family. All facts, no estimates. */
export interface CommunityDiscussionRef {
  slug: string;
  /** The real registered route: `/community/{slug}`. */
  href: string;
  title: string;
  /** A short reader-facing topic chip — game and state where declared, otherwise the leading governed tag. */
  topicLabel: string;
  /** The thread's real visible reply count. Never invented (Constitution §17). */
  replyCount: number;
  lastActivityIso: string;
  /** The latest activity as an absolute date — deterministic, no wall clock, no relative time. */
  lastActivityDisplay: string;
  /** The fixture author's handle, exactly as the community pages show it. */
  authorUsername: string;
  excerpt: string;
}

/** Where "Visit the community" goes. One constant, so no caller retypes the route. */
export const COMMUNITY_HUB_PATH = COMMUNITY_HOME_PATH;

/** The Conflict 41 condition-1 banner sentence, for any surface that renders fixture threads. */
export function communityDisclosure(): string | null {
  return getCommunityData().meta.disclosure ?? null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** `2026-08-06T02:12:00Z` → `August 6, 2026`. String arithmetic on the ISO date part — timezone-safe. */
function displayDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}

function titleize(slug: string): string {
  return slug.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

function topicLabelOf(e: ForumEntryRecord): string {
  const game = e.gameId ? titleize(e.gameId) : null;
  const state = e.stateCode ? e.stateCode.toUpperCase() : null;
  if (game && state) return `${game} · ${state}`;
  if (game) return game;
  if (state) return state;
  const tag = e.tags[0];
  return tag ? titleize(tag) : "Community";
}

function excerptOf(e: ForumEntryRecord): string {
  const firstText = e.body.find((b) => b.kind === "text")?.text ?? e.title;
  return firstText.length > 180 ? `${firstText.slice(0, 177)}…` : firstText;
}

function lastActivityIso(e: ForumEntryRecord): string {
  const dates = [e.createdAtIso, ...(e.updatedAtIso ? [e.updatedAtIso] : []), ...e.replies.map((r) => r.postedAtIso)];
  return dates.sort().at(-1) ?? e.createdAtIso;
}

function toRef(e: ForumEntryRecord): CommunityDiscussionRef {
  const activity = lastActivityIso(e);
  return {
    slug: e.slug,
    href: communityEntryPath(e.slug),
    title: e.title,
    topicLabel: topicLabelOf(e),
    replyCount: e.replies.length,
    lastActivityIso: activity,
    lastActivityDisplay: displayDate(activity),
    authorUsername: e.username,
    excerpt: excerptOf(e),
  };
}

const byActivity = (a: CommunityDiscussionRef, b: CommunityDiscussionRef) =>
  b.lastActivityIso.localeCompare(a.lastActivityIso);

/** The most recently active threads across the whole community — Home H-10's content. */
export function recentCommunityDiscussions(limit: number): readonly CommunityDiscussionRef[] {
  return getCommunityData().entries.map(toRef).sort(byActivity).slice(0, limit);
}

/**
 * Threads scoped to a jurisdiction and/or game — the archive's AR-09 "Player discussions" group.
 *
 * Both conditions must hold where both are given: a New York Pick 3 thread is not a Florida Pick 3
 * discussion, and showing it on `/fl/pick-3/2026` would misattribute the conversation.
 */
export function communityDiscussionsFor(
  scope: { gameId?: string; stateCode?: string },
  limit: number,
): readonly CommunityDiscussionRef[] {
  const game = scope.gameId?.toLowerCase();
  const state = scope.stateCode?.toLowerCase();
  return getCommunityData()
    .entries.filter((e) =>
      (game === undefined || e.gameId === game || e.tags.includes(game))
      && (state === undefined || e.stateCode === state))
    .map(toRef)
    .sort(byActivity)
    .slice(0, limit);
}

/**
 * A state's standing monthly thread, where the corpus has one — State S-14's state-scoped entry point.
 *
 * "Monthly" is the corpus's own governed tag (the long-running state monthly threads PF-02 §1.4 records as
 * the durable community anchor). Returns the most recently active match, or `null` — a state without one
 * simply links the hub, and nothing is fabricated to fill the gap.
 */
export function stateCommunityThread(stateCode: string): CommunityDiscussionRef | null {
  const state = stateCode.toLowerCase();
  const matches = getCommunityData()
    .entries.filter((e) => e.stateCode === state && e.tags.includes("monthly"))
    .map(toRef)
    .sort(byActivity);
  return matches[0] ?? null;
}
