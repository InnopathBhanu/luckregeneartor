/*
 * THE FORUM ENTRY VIEW MODEL — 08B, the fourteen §2 rows in order, over one corpus entry.
 *
 * ══ THE DECISIONS THIS MODEL OWNS ══
 *
 *   FE-06  Fixture entries carry a TEAM-AUTHORED "LotteryCorner Research" reply (08D Template H) where the
 *          corpus recorded one — honest, because LotteryCorner Research IS the team (Constitution §32). Where
 *          none exists the section renders its recorded reason: AI does not lead social/opinion entries
 *          unless invoked (08B §8), and silence is a decision, not a gap.
 *   FE-07  Sorts Top / Newest / Oldest / Helpful as crawlable `?sort=` links; PAGINATION, never infinite
 *          scroll (08 §26), `REPLIES_PER_PAGE` per page with stable `#reply-id` anchors.
 *   FE-08  The accepted reply is the OP's choice recorded in the corpus; helpful marks are labels, never
 *          counts. AI/Research can never be accepted (BFF-asserted) and exposes no accept control.
 *   FE-09  The Community Summary renders ONLY when enough real thread activity exists (several replies and at
 *          least two recorded summary points), and every bullet cites the reply it came from — it cannot
 *          manufacture consensus the replies do not contain (08B §11).
 *   Poll   The visible vote count is TALLIED FROM THE VISIBLE REPLIES (each reply may state a choice); no
 *          stored number exists to drift from the thread (amendment condition 4).
 */

import { getCommunityData, getForumEntry } from "./bff/communityBff";
import { communityAdProfile, type CommunityAdProfile } from "./communityAdProfile";
import type {
  ForumEntryRecord, ForumEntrySectionId, ForumReplyRecord, ReplySort,
} from "./communityContract";
import {
  COMMUNITY_SUMMARY_DISCLOSURE, FORUM_ENTRY_ORDER, FORUM_ENTRY_SECTION_NAMES,
  REPLIES_PER_PAGE, REPLY_PLACEHOLDER, REPLY_PLACEHOLDER_ALTERNATIVES, REPLY_SORTS,
} from "./communityContract";
import type { SectionState } from "@/lib/shell/sectionContract";

/* ------------------------------------------------------------------ shapes */

export interface ForumEntrySectionVm {
  id: ForumEntrySectionId;
  name: string;
  state: SectionState;
  reason: string | null;
}

export interface PollTally {
  choice: string;
  /** Tallied from the visible replies that state this choice. */
  votes: number;
  voters: readonly string[];
}

export interface SummaryBullet {
  kind: "fact" | "experience" | "viewpoint" | "open";
  text: string;
  /** The reply this bullet is grounded in — cited, so the summary cannot outrun the thread. */
  fromUsername: string;
  fromReplyId: string;
}

export interface RelatedEntryVm {
  slug: string;
  title: string;
  /** Why it is related — game, state, tag or news overlap, named so the module explains itself. */
  because: string;
}

export interface ForumEntryModel {
  entry: ForumEntryRecord;
  /** Amendment condition 1 — the page-level review disclosure banner. */
  disclosure: string | null;
  sections: readonly ForumEntrySectionVm[];
  /** FE-07 — the current sort, the sorted-and-paged slice, and the pager. */
  sort: ReplySort;
  sorts: readonly ReplySort[];
  page: number;
  pageCount: number;
  pageReplies: readonly ForumReplyRecord[];
  totalReplies: number;
  /** FE-08 — resolved accepted reply, when one exists. */
  acceptedReply: ForumReplyRecord | null;
  helpfulReplies: readonly ForumReplyRecord[];
  /** FE-09 — grounded summary bullets, or null when the thread has not earned a summary. */
  summary: readonly SummaryBullet[] | null;
  summaryDisclosure: string;
  /** FE-04 poll tally, when the entry is a poll. */
  pollTally: readonly PollTally[] | null;
  /** FE-10 — context-sensitive placeholder. */
  replyPlaceholder: string;
  related: readonly RelatedEntryVm[];
  ads: CommunityAdProfile;
}

/* ------------------------------------------------------------------ sorting and paging */

function sortReplies(entry: ForumEntryRecord, sort: ReplySort): ForumReplyRecord[] {
  const replies = [...entry.replies];
  const byOldest = (a: ForumReplyRecord, b: ForumReplyRecord) => a.postedAtIso.localeCompare(b.postedAtIso);
  switch (sort) {
    case "newest":
      return replies.sort((a, b) => b.postedAtIso.localeCompare(a.postedAtIso));
    case "oldest":
      return replies.sort(byOldest);
    case "helpful":
      /* Helpful-marked first, newest within each band. */
      return replies.sort((a, b) => Number(b.helpful) - Number(a.helpful) || b.postedAtIso.localeCompare(a.postedAtIso));
    case "top":
      /* Accepted first, then helpful, then thread order — the reading order of a settled thread. */
      return replies.sort((a, b) =>
        Number(b.id === entry.acceptedReplyId) - Number(a.id === entry.acceptedReplyId)
        || Number(b.helpful) - Number(a.helpful)
        || byOldest(a, b));
  }
}

/** FE-10 — the 08B §12 context-sensitive placeholder. */
export function replyPlaceholderFor(entry: ForumEntryRecord): string {
  if (entry.tags.includes("question")) return REPLY_PLACEHOLDER_ALTERNATIVES.question;
  if (entry.attachment?.kind === "numberShare" || entry.tags.includes("pairs")) {
    return REPLY_PLACEHOLDER_ALTERNATIVES.numbers;
  }
  if (entry.attachment?.kind === "system") return REPLY_PLACEHOLDER_ALTERNATIVES.system;
  if (entry.attachment?.kind === "winStory" || entry.tags.includes("scratch-off")) {
    return REPLY_PLACEHOLDER_ALTERNATIVES.experience;
  }
  return REPLY_PLACEHOLDER;
}

/* ------------------------------------------------------------------ FE-09 */

/**
 * The FE-09 threshold: a summary exists only over SEVERAL replies (four or more) carrying at least two
 * team-recorded summary points. Below it, the section renders its reason — a two-reply thread summarised is
 * manufactured consensus, exactly what 08B §11 forbids.
 */
export const SUMMARY_MIN_REPLIES = 4;
export const SUMMARY_MIN_POINTS = 2;

export function buildSummary(entry: ForumEntryRecord): readonly SummaryBullet[] | null {
  const bullets: SummaryBullet[] = entry.replies
    .filter((r) => r.summaryPoint)
    .map((r) => ({
      kind: r.summaryPoint!.kind,
      text: r.summaryPoint!.text,
      fromUsername: r.username,
      fromReplyId: r.id,
    }));
  if (entry.replies.length < SUMMARY_MIN_REPLIES || bullets.length < SUMMARY_MIN_POINTS) return null;
  return bullets;
}

/* ------------------------------------------------------------------ related (FE-11) */

function relatedEntries(entry: ForumEntryRecord, all: readonly ForumEntryRecord[]): RelatedEntryVm[] {
  const out: RelatedEntryVm[] = [];
  for (const other of all) {
    if (other.slug === entry.slug) continue;
    let because: string | null = null;
    if (entry.gameId && other.gameId === entry.gameId) because = `also about ${entry.gameId.replace(/-/g, " ")}`;
    else if (entry.stateCode && other.stateCode === entry.stateCode) {
      because = `also ${entry.stateCode.toUpperCase()} players`;
    } else {
      const sharedTag = other.tags.find((t) => entry.tags.includes(t));
      if (sharedTag) because = `shares the ${sharedTag.replace(/-/g, " ")} tag`;
    }
    if (because) out.push({ slug: other.slug, title: other.title, because });
  }
  /* "Maximum useful suggestions" (08B §13) — three, matching the flagship content budget. */
  return out.slice(0, 3);
}

/* ------------------------------------------------------------------ the model */

export function buildForumEntryModel(
  slug: string,
  params?: { sort?: string | null; page?: string | null },
): ForumEntryModel | null {
  const entry = getForumEntry(slug);
  if (!entry) return null;
  const data = getCommunityData();

  const sort: ReplySort = (REPLY_SORTS as readonly string[]).includes((params?.sort ?? "").toLowerCase())
    ? ((params!.sort as string).toLowerCase() as ReplySort)
    : "top";
  const sorted = sortReplies(entry, sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / REPLIES_PER_PAGE));
  const requestedPage = Number.parseInt(params?.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const pageReplies = sorted.slice((page - 1) * REPLIES_PER_PAGE, page * REPLIES_PER_PAGE);

  const acceptedReply = entry.replies.find((r) => r.id === entry.acceptedReplyId) ?? null;
  const helpfulReplies = entry.replies.filter((r) => r.helpful);
  const summary = buildSummary(entry);

  const pollTally: PollTally[] | null =
    entry.attachment?.kind === "poll"
      ? entry.attachment.choices.map((choice) => {
          const voters = entry.replies.filter((r) => r.pollChoice === choice).map((r) => r.username);
          return { choice, votes: voters.length, voters };
        })
      : null;

  const fresh = { state: "fresh" as SectionState, reason: null };
  const sectionState: Record<ForumEntrySectionId, { state: SectionState; reason: string | null }> = {
    "FE-01": fresh,
    "FE-02": fresh,
    "FE-03": fresh,
    "FE-04": entry.attachment
      ? fresh
      : { state: "empty", reason: "This entry carries no structured attachment — plain discussion needs none." },
    "FE-05": entry.contextRefs.length > 0
      ? fresh
      : { state: "empty", reason: "No game, state, tool or source context was attached." },
    "FE-06": entry.researchReply
      ? fresh
      : {
          state: "empty",
          reason:
            "No AI or Research reply. AI does not appear first for social or opinion entries unless invoked "
            + "(08B §8), and no member invoked it here.",
        },
    "FE-07": entry.replies.length > 0
      ? fresh
      : { state: "empty", reason: "No replies yet. Be the first — real experience helps most." },
    "FE-08": acceptedReply || helpfulReplies.length > 0
      ? fresh
      : { state: "empty", reason: "No reply has been accepted or marked helpful yet." },
    "FE-09": summary
      ? fresh
      : {
          state: "empty",
          reason:
            "No community summary: it renders only after enough real activity, and every line must be grounded "
            + "in the replies (08B §11). This thread has not earned one yet.",
        },
    "FE-10": fresh,
    "FE-11": fresh,
    "FE-12": fresh,
    "FE-13": fresh,
    "AD-FE00": { state: "empty", reason: communityAdProfile().gap },
  };

  const sections: ForumEntrySectionVm[] = FORUM_ENTRY_ORDER.map((id) => ({
    id,
    name: FORUM_ENTRY_SECTION_NAMES[id],
    state: sectionState[id].state,
    reason: sectionState[id].reason,
  }));

  return {
    entry,
    disclosure: data.meta.disclosure,
    sections,
    sort,
    sorts: REPLY_SORTS,
    page,
    pageCount,
    pageReplies,
    totalReplies: entry.replies.length,
    acceptedReply,
    helpfulReplies,
    summary,
    summaryDisclosure: COMMUNITY_SUMMARY_DISCLOSURE,
    pollTally,
    replyPlaceholder: replyPlaceholderFor(entry),
    related: relatedEntries(entry, data.entries),
    ads: communityAdProfile(),
  };
}
