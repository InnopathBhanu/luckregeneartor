/*
 * THE COMMUNITY HOME VIEW MODEL — 08A, the seventeen §2 rows in order, over the review corpus.
 *
 * The component renders what this returns and adds nothing, so the composition is assertable against the
 * blueprint by reading the model, and the DOM audit reads the same answer off `data-section-*`.
 *
 * ══ HOW THE SECTIONS STAY HONEST ══
 *
 *   - CH-02 Active Now ranks by LAST VISIBLE ACTIVITY over the disclosed fixture corpus — reply recency and
 *     distinct contributors — never by an invented activity statistic (amendment condition 4).
 *   - CH-03 applies the 08A §5 labels verbatim, derived from the records (no replies; state context).
 *   - CH-06 NEVER forces a state: the chooser is crawlable links plus a server-side `?state=` filter, and no
 *     IP is read anywhere (08A §8: "No IP-based forced state").
 *   - CH-12 Most Helpful ranks by helpful/accepted replies and contributor diversity — 08A §14: "Do not use
 *     popularity alone" — and lists contributors by name with NO score (08C §5: no visible points).
 *   - CH-13 Following is a signed-in module whose SERVER form is the public fallback (Shell §33: member state
 *     is never in server HTML), explaining the benefit without forcing sign-in early (08A §15).
 *
 * ══ FILTERS (08A §18) ══
 *
 * Latest / Active / Needs Replies / Most Helpful plus State / Game / Tag, all as QUERY PARAMETERS on
 * `/community` applied server-side to the browse strip. One URL, one canonical, no route per filter — "Filters
 * do not create indexable URL explosion." (`Following` is the signed-in CH-13 module, not a server filter —
 * the server never knows who follows what.)
 */

import { getCommunityData } from "./bff/communityBff";
import { communityAdProfile, type CommunityAdProfile } from "./communityAdProfile";
import type { CommunityHomeSectionId, ContentProvenance, ForumEntryRecord } from "./communityContract";
import {
  CH10_BELIEF_LABEL, COMMUNITY_FILTERS, COMMUNITY_H1, COMMUNITY_HOME_ORDER,
  COMMUNITY_HOME_SECTION_NAMES, COMMUNITY_SUPPORT, COMPOSER_HELPERS, COMPOSER_PROMPT,
  NEEDS_EXPERIENCE_LABELS,
} from "./communityContract";
import type { SectionState } from "@/lib/shell/sectionContract";

/* ------------------------------------------------------------------ shapes */

export interface CommunityHomeSection {
  id: CommunityHomeSectionId;
  name: string;
  state: SectionState;
  reason: string | null;
}

/** One entry card, with everything a home module shows. Counts here are visible fixture-thread facts. */
export interface EntryCard {
  slug: string;
  title: string;
  username: string;
  createdAtIso: string;
  lastActivityIso: string;
  replyCount: number;
  gameId: string | null;
  stateCode: string | null;
  tags: readonly string[];
  /** 08A §5 labels, verbatim strings from NEEDS_EXPERIENCE_LABELS, where they apply. */
  needsLabels: readonly string[];
  /** Win-story verification label, where the entry carries one. */
  verificationLabel: string | null;
  /** Poll close date, where the entry is a poll. */
  pollClosesIso: string | null;
  /**
   * Carried onto the card so the ItemList can filter on it without re-reading the corpus — LRG-UX-SCHEMA-001
   * correction 2. Every card is `synthetic-review-fixture` today, so the ItemList is withheld entirely.
   */
  provenance: ContentProvenance;
}

export interface CommunityHomeModel {
  h1: string;
  support: string;
  composerPrompt: string;
  composerHelpers: readonly string[];
  /** Amendment condition 1 — the page-level review disclosure banner. */
  disclosure: string | null;
  sections: readonly CommunityHomeSection[];
  /** The 08A §18 filter vocabulary, for the browse strip. */
  filters: readonly string[];
  /** The active browse filter and its server-filtered result. */
  activeFilter: string;
  browse: readonly EntryCard[];
  activeNow: readonly EntryCard[];
  needsExperience: readonly EntryCard[];
  pick34: readonly EntryCard[];
  jackpot: readonly EntryCard[];
  /** CH-06 — the states present in the corpus, as crawlable chips; plus the chosen state's entries. */
  stateOptions: readonly { code: string; entryCount: number }[];
  selectedState: string | null;
  stateEntries: readonly EntryCard[];
  systems: readonly EntryCard[];
  wins: readonly EntryCard[];
  scratchOffs: readonly EntryCard[];
  dreams: readonly EntryCard[];
  dreamsLabel: string;
  newsDiscussions: readonly (EntryCard & { newsArticleSlug: string })[];
  mostHelpful: readonly EntryCard[];
  /** CH-12 — contributors whose replies were marked helpful or accepted. Names, never scores. */
  helpfulContributors: readonly string[];
  polls: readonly EntryCard[];
  introductions: readonly EntryCard[];
  ads: CommunityAdProfile;
  /** Every visible entry card, in render order, for the 08A §19 ItemList (visible cards only). */
  visibleEntryCards: readonly { title: string; slug: string; provenance: ContentProvenance }[];
}

/* ------------------------------------------------------------------ derivations */

function lastActivityIso(e: ForumEntryRecord): string {
  const dates = [e.createdAtIso, ...(e.updatedAtIso ? [e.updatedAtIso] : []), ...e.replies.map((r) => r.postedAtIso)];
  return dates.sort().at(-1) ?? e.createdAtIso;
}

const VERIFICATION_DISPLAY: Record<string, string> = {
  UNVERIFIED_STORY: "Unverified Story",
  TICKET_IMAGE_REDACTED: "Ticket Image Redacted",
  COMMUNITY_VERIFIED: "Community Verified",
  LOTTERYCORNER_REVIEWED: "LotteryCorner Reviewed",
  OFFICIAL_SOURCE_CONFIRMED: "Official Source Confirmed",
};

function toCard(e: ForumEntryRecord): EntryCard {
  const needsLabels: string[] = [];
  if (e.replies.length === 0) {
    needsLabels.push(NEEDS_EXPERIENCE_LABELS.noReplies);
    if (e.stateCode) needsLabels.push(NEEDS_EXPERIENCE_LABELS.needsStateInput);
  } else if (e.researchReply && e.replies.length === 0) {
    needsLabels.push(NEEDS_EXPERIENCE_LABELS.aiAnswered);
  }
  return {
    slug: e.slug,
    title: e.title,
    username: e.username,
    createdAtIso: e.createdAtIso,
    lastActivityIso: lastActivityIso(e),
    replyCount: e.replies.length,
    gameId: e.gameId,
    stateCode: e.stateCode,
    tags: e.tags,
    needsLabels,
    verificationLabel:
      e.attachment?.kind === "winStory" ? VERIFICATION_DISPLAY[e.attachment.verificationState] ?? null : null,
    pollClosesIso: e.attachment?.kind === "poll" ? e.attachment.closeDateIso : null,
    provenance: e.provenance,
  };
}

const DAILY_DIGIT_GAMES = new Set(["pick-3", "pick-4", "cash-3", "cash-4"]);
const JACKPOT_GAMES = new Set(["powerball", "mega-millions"]);
const SYSTEM_TAGS = new Set(["system", "tool-help", "mathematics", "backtest", "wheel", "pairs", "statistics"]);

const byActivity = (a: EntryCard, b: EntryCard) => b.lastActivityIso.localeCompare(a.lastActivityIso);
const byNewest = (a: EntryCard, b: EntryCard) => b.createdAtIso.localeCompare(a.createdAtIso);

/* ------------------------------------------------------------------ the model */

export function buildCommunityHomeModel(params?: {
  filter?: string | null;
  state?: string | null;
  game?: string | null;
  tag?: string | null;
}): CommunityHomeModel {
  const data = getCommunityData();
  const cards = data.entries.map(toCard);

  const activeNow = [...cards].filter((c) => c.replyCount > 0).sort(byActivity).slice(0, 4);
  const needsExperience = cards.filter((c) => c.needsLabels.length > 0);
  const pick34 = cards
    .filter((c) => (c.gameId && DAILY_DIGIT_GAMES.has(c.gameId)) || c.tags.includes("pick-3") || c.tags.includes("pick-4"))
    .sort((a, b) => Number(b.tags.includes("monthly")) - Number(a.tags.includes("monthly")) || byActivity(a, b));
  const jackpot = cards
    .filter((c) => (c.gameId && JACKPOT_GAMES.has(c.gameId)) || c.tags.includes("jackpot"))
    .sort(byActivity);

  const stateCodes = [...new Set(cards.map((c) => c.stateCode).filter((s): s is string => s !== null))].sort();
  const stateOptions = stateCodes.map((code) => ({
    code,
    entryCount: cards.filter((c) => c.stateCode === code).length,
  }));
  const selectedState = stateCodes.includes((params?.state ?? "").toLowerCase())
    ? (params!.state as string).toLowerCase()
    : null;
  const stateEntries = selectedState ? cards.filter((c) => c.stateCode === selectedState).sort(byActivity) : [];

  const systems = cards.filter((c) => c.tags.some((t) => SYSTEM_TAGS.has(t))).sort(byActivity);
  const wins = cards.filter((c) => c.tags.includes("win-story")).sort(byNewest);
  const scratchOffs = cards.filter((c) => c.tags.includes("scratch-off")).sort(byActivity);
  const dreams = cards.filter((c) => c.tags.includes("dreams") || c.tags.includes("lucky-numbers")).sort(byActivity);

  const newsDiscussions = data.entries
    .filter((e): e is ForumEntryRecord & { newsArticleSlug: string } => e.newsArticleSlug !== null)
    .map((e) => ({ ...toCard(e), newsArticleSlug: e.newsArticleSlug }));

  /* CH-12 — helpful/accepted replies and contributor diversity, never raw popularity. */
  const helpfulScore = (e: ForumEntryRecord) =>
    e.replies.filter((r) => r.helpful).length + (e.acceptedReplyId ? 1 : 0);
  const mostHelpful = [...data.entries]
    .filter((e) => helpfulScore(e) > 0)
    .sort((a, b) =>
      helpfulScore(b) - helpfulScore(a)
      || new Set(b.replies.map((r) => r.username)).size - new Set(a.replies.map((r) => r.username)).size)
    .slice(0, 4)
    .map(toCard);
  const helpfulContributors = [...new Set(
    data.entries.flatMap((e) => e.replies.filter((r) => r.helpful || r.id === e.acceptedReplyId).map((r) => r.username)),
  )].sort();

  const polls = cards.filter((c) => c.pollClosesIso !== null);
  const introductions = cards.filter((c) => c.tags.includes("introductions") || c.tags.includes("new-members"));

  /* ---- the 08A §18 browse filter, server-side over ONE url ---- */
  const requested = (params?.filter ?? "").toLowerCase();
  const activeFilter =
    ["latest", "active", "needs-replies", "most-helpful"].includes(requested) ? requested : "latest";
  let browse: EntryCard[];
  switch (activeFilter) {
    case "active": browse = [...cards].filter((c) => c.replyCount > 0).sort(byActivity); break;
    case "needs-replies": browse = cards.filter((c) => c.replyCount === 0); break;
    case "most-helpful": browse = mostHelpful; break;
    default: browse = [...cards].sort(byNewest);
  }
  const game = (params?.game ?? "").toLowerCase();
  if (game) browse = browse.filter((c) => c.gameId === game || c.tags.includes(game));
  const tag = (params?.tag ?? "").toLowerCase();
  if (tag) browse = browse.filter((c) => c.tags.includes(tag));
  if (selectedState) browse = browse.filter((c) => c.stateCode === selectedState);

  /* ---- section states ---- */
  const fresh = { state: "fresh" as SectionState, reason: null };
  const emptyIf = (list: readonly unknown[], reason: string) =>
    list.length > 0 ? fresh : { state: "empty" as SectionState, reason };

  const sectionState: Record<CommunityHomeSectionId, { state: SectionState; reason: string | null }> = {
    "CH-01": fresh,
    "CH-02": emptyIf(activeNow, "No discussion has recent replies. Activity is never simulated."),
    "CH-03": emptyIf(needsExperience, "Every open question has replies right now."),
    "CH-04": emptyIf(pick34, "No Pick 3 or Pick 4 entries yet."),
    "CH-05": emptyIf(jackpot, "No jackpot-game entries yet."),
    "CH-06": fresh,
    "CH-07": emptyIf(systems, "No systems, tools or mathematics entries yet."),
    "AD-CH00": { state: "empty", reason: communityAdProfile().gap },
    "CH-08": emptyIf(wins, "No win or ticket stories yet. A win story is never invented."),
    "CH-09": emptyIf(scratchOffs, "No scratch-off entries yet."),
    "CH-10": emptyIf(dreams, "No dreams, signs or lucky-numbers entries yet."),
    "CH-11": emptyIf(newsDiscussions, "No news article has a community discussion yet."),
    "CH-12": emptyIf(mostHelpful, "No reply has been marked helpful or accepted yet."),
    "CH-13": fresh, /* the public fallback IS the anonymous content (08A §15) */
    "CH-14": emptyIf(polls, "No governed community event or poll is open."),
    "CH-15": fresh,
    "AD-CH01": { state: "empty", reason: communityAdProfile().gap },
  };

  const sections: CommunityHomeSection[] = COMMUNITY_HOME_ORDER.map((id) => ({
    id,
    name: COMMUNITY_HOME_SECTION_NAMES[id],
    state: sectionState[id].state,
    reason: sectionState[id].reason,
  }));

  /* Visible cards in render order, deduplicated, for the ItemList. */
  const seen = new Set<string>();
  const visibleEntryCards: { title: string; slug: string; provenance: ContentProvenance }[] = [];
  const push = (c: EntryCard) => {
    if (seen.has(c.slug)) return;
    seen.add(c.slug);
    visibleEntryCards.push({ title: c.title, slug: c.slug, provenance: c.provenance });
  };
  for (const group of [activeNow, needsExperience, pick34, jackpot, stateEntries, systems, wins,
    scratchOffs, dreams, newsDiscussions, mostHelpful, polls, introductions, browse]) {
    for (const c of group) push(c);
  }

  return {
    h1: COMMUNITY_H1,
    support: COMMUNITY_SUPPORT,
    composerPrompt: COMPOSER_PROMPT,
    composerHelpers: COMPOSER_HELPERS,
    disclosure: data.meta.disclosure,
    sections,
    filters: COMMUNITY_FILTERS,
    activeFilter,
    browse,
    activeNow,
    needsExperience,
    pick34,
    jackpot,
    stateOptions,
    selectedState,
    stateEntries,
    systems,
    wins,
    scratchOffs,
    dreams,
    dreamsLabel: CH10_BELIEF_LABEL,
    newsDiscussions,
    mostHelpful,
    helpfulContributors,
    polls,
    introductions,
    ads: communityAdProfile(),
    visibleEntryCards,
  };
}
