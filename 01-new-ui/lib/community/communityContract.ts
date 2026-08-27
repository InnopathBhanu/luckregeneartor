/*
 * THE COMMUNITY PAGE-FAMILY CONTRACT — 08 / 08A / 08B / 08C / 08D (all Final approved and frozen).
 *
 * Authority: `08-lotterycorner-community-forum-engagement-research-FINAL-APPROVED.md` v1.1, the three frozen
 * blueprints 08A (Community Home), 08B (Forum Entry), 08C (Profile and Reputation), the reusable template 08D,
 * the frozen Constitution §31 (AI Forum Policy tiers) and §32 (one AI identity), and `source-conflicts.md`
 * **Conflict 41 + its FOUNDER AMENDMENT (2026-08-11)**, which authorizes the review-fixture corpus under five
 * conditions this family implements in full.
 *
 * ══ WHAT THIS FILE IS ══
 *
 * The typed vocabulary of the family: the record shapes (08D §1 inputs), the four structured attachment shapes
 * (08B §6), the moderation / indexability / verification / lifecycle vocabularies (08 §15–§22, 08D Template O),
 * the CH and FE section orders (08A §2 and 08B §2, verbatim), and the verbatim identity strings. Models and
 * components consume this; nothing here reads data.
 *
 * ══ THE HONESTY RULE THE WHOLE FAMILY IS BUILT UNDER ══
 *
 * The Constitution forbids fabricating community content, twice. The Conflict 41 FOUNDER AMENDMENT authorizes —
 * for the REVIEW BUILD ONLY — five named member personas and ten topics written by the team as design fixtures,
 * under five conditions: (1) a page-level review disclosure banner on every community page; (2) every record
 * carries `provenance: "synthetic-review-fixture"` and the data layer refuses to serve the corpus in a
 * production build; (3) community pages stay noindex and out of every sitemap; (4) fixture members are never
 * emitted as `Person` JSON-LD, never counted in a statistic presented as real, and never carry earned badges;
 * (5) the expiry is recorded — production launch requires real human content or designed empty states.
 */

/* ------------------------------------------------------------------ provenance (amendment condition 2) */

/** The provenance value every fixture record must carry. The BFF rejects a payload without it. */
export const REVIEW_FIXTURE_PROVENANCE = "synthetic-review-fixture" as const;
export type ReviewFixtureProvenance = typeof REVIEW_FIXTURE_PROVENANCE;

/**
 * The provenance a record must carry before its content may be described as user-generated in structured data.
 *
 * ══ WHY THIS VALUE EXISTS BEFORE ANY RECORD CARRIES IT — LRG-UX-SCHEMA-001 correction 2 ══
 *
 * Every record in this build is a review fixture, and the forum entry page was emitting
 * `DiscussionForumPosting` with `author`, `comment[]` and an `interactionStatistic` reply count for all of
 * them. Condition 4 of the Conflict 41 amendment was honoured to the letter — no `Person` node, no earned
 * badge — but the type itself is the claim: `DiscussionForumPosting` asserts that a human posted this, and
 * Google's structured-data policies require markup to describe genuine page content. A plain-text author does
 * not make an invented thread into user-generated content; it only makes the fabricated person anonymous.
 *
 * So the schema branches on provenance rather than on the amendment's author rule. No record is
 * `genuine-ugc` today; the value is the seam that makes real forum content a DATA change, and it is typed
 * and tested now so the day it arrives nobody has to redesign the builder under deadline.
 */
export const GENUINE_UGC_PROVENANCE = "genuine-ugc" as const;
export type GenuineUgcProvenance = typeof GENUINE_UGC_PROVENANCE;

/** What a community record's provenance may be. */
export type ContentProvenance = ReviewFixtureProvenance | GenuineUgcProvenance;

/**
 * Whether this record's content may be described as user-generated in structured data.
 *
 * The single question every community schema builder asks. Written as an explicit equality against the one
 * permitted value — not as `!== REVIEW_FIXTURE_PROVENANCE` — so a third provenance added later defaults to
 * WITHHELD rather than silently qualifying as genuine.
 */
export function isGenuineUgc(provenance: ContentProvenance): boolean {
  return provenance === GENUINE_UGC_PROVENANCE;
}

/* ------------------------------------------------------------------ 08 §15 recurring lifecycle */

export type ForumEntryLifecycle = "SCHEDULED" | "OPEN" | "ACTIVE" | "CLOSED" | "ARCHIVED" | "MERGED";

/* ------------------------------------------------------------------ 08 §13 / 08D Template O indexability */

export type ForumIndexabilityState =
  | "INDEX_PENDING" | "INDEX_ELIGIBLE" | "INDEXED"
  | "NOINDEX_LOW_VALUE" | "NOINDEX_PRIVATE" | "NOINDEX_MODERATED" | "MERGED" | "REMOVED";

/* ------------------------------------------------------------------ 08B §15 moderation states */

export type ForumModerationState =
  | "NONE" | "UPDATED" | "OUTDATED" | "CORRECTED" | "LOCKED"
  | "ARCHIVED" | "MERGED" | "REMOVED" | "UNDER_REVIEW";

/* ------------------------------------------------------------------ 08 §18 winner verification */

export type WinnerVerificationState =
  | "UNVERIFIED_STORY" | "TICKET_IMAGE_REDACTED" | "COMMUNITY_VERIFIED"
  | "LOTTERYCORNER_REVIEWED" | "OFFICIAL_SOURCE_CONFIRMED";

/** 08D Template E — the reader-facing verification labels. */
export const VERIFICATION_LABELS: Readonly<Record<WinnerVerificationState, string>> = Object.freeze({
  UNVERIFIED_STORY: "Unverified Story",
  TICKET_IMAGE_REDACTED: "Ticket Image Redacted",
  COMMUNITY_VERIFIED: "Community Verified",
  LOTTERYCORNER_REVIEWED: "LotteryCorner Reviewed",
  OFFICIAL_SOURCE_CONFIRMED: "Official Source Confirmed",
});

/**
 * Provenance of an entry the SIGNED-IN REVIEWER publishes through the composer during review.
 *
 * Distinct from the fixture value on purpose: a reviewer's post is genuinely human-authored content in the
 * review store (Conflict 37 — "assume the database exists"), not a team-written design fixture. It still never
 * ships: the whole family is noindex and the corpus refusal applies to the family's launch as a whole.
 */
export const REVIEWER_POST_PROVENANCE = "reviewer-authored-review-post" as const;
export type ReviewerPostProvenance = typeof REVIEWER_POST_PROVENANCE;

/* ------------------------------------------------------------------ 08C §4 public labels */

/**
 * The 08C §4 initial public labels — the VOCABULARY, transcribed. Amendment condition 4 forbids any fixture
 * member from carrying one presented as earned, which `CommunityMemberRecord.contributionLabels` pins to the
 * empty list by type; the vocabulary lives here so the launch implementation cannot reinvent the words.
 */
export const MEMBER_PUBLIC_LABELS: readonly string[] = Object.freeze([
  "Helpful Contributor", "State Regular", "Game Expert", "System Contributor",
  "Reporter", "Moderator", "LotteryCorner Research", "Winner Story Reviewed",
]);

/** 08C §9 — the neutral deleted-user display state. */
export const DELETED_MEMBER_NAME = "Deleted member";

/* ------------------------------------------------------------------ 08 §22 moderation categories */

/** The moderation categories, verbatim from 08 §22. The report control offers exactly these. */
export const REPORT_CATEGORIES: readonly string[] = Object.freeze([
  "harassment", "hate", "personal data", "spam", "affiliate solicitation", "fake winner claim",
  "ticket sale", "scam", "guaranteed-win claim", "unsafe financial advice", "loss chasing",
  "impersonation", "stolen content", "copyright issue", "sports betting", "underage participation", "distress",
]);

/* ------------------------------------------------------------------ members (08C) */

/**
 * A community member record as the review corpus stores it.
 *
 * 08C §3's never-public list is enforced BY TYPE: there is no email, phone, address, ticket, payment or
 * security field on this record at all, so the public view model cannot leak what the type cannot hold.
 * A fixture persona has no such data to begin with; a real backend keeps private fields on its own side of
 * the seam and never in this contract.
 */
export interface CommunityMemberRecord {
  username: string;
  /** Optional display name (08C §2). Fixture personas use the username alone. */
  displayName: string | null;
  /** ISO date the persona "joined" — a design fixture value, labelled as one by the page banner. */
  joinedIso: string;
  /** Two-letter home state code. */
  homeState: string;
  /** Short bio, in the persona's own voice. */
  bio: string;
  /** Selected state/game interests (08C §2). */
  interests: { games: readonly string[]; states: readonly string[] };
  /**
   * Amendment condition 4: a fixture member NEVER carries a reputation badge presented as earned, so the
   * type pins the field to an empty list. A real member record replaces this contract at launch.
   */
  contributionLabels: readonly never[];
  /** "active" always in the corpus; "deleted" is the 08C §9 neutral state the contract must support. */
  status: "active" | "deleted";
  provenance: ContentProvenance;
}

/**
 * The PUBLIC profile view model — the only shape `/members/{username}` renders.
 *
 * Deliberately a projection with NO private field even possible (08C §3): no email, no phone, no location
 * beyond the chosen home state, no number sets, no tickets, no payment data, no moderation evidence.
 */
export interface MemberPublicProfile {
  username: string;
  displayName: string | null;
  joinedIso: string;
  homeState: string;
  bio: string;
  interests: { games: readonly string[]; states: readonly string[] };
  status: "active" | "deleted";
  /** Entries this member started, as visible references. */
  entries: readonly { slug: string; title: string; createdAtIso: string }[];
  /** Entries this member replied in, as visible references. */
  repliedIn: readonly { slug: string; title: string }[];
  /** Replies of this member that the OP accepted or others marked helpful — honestly derivable, listed not scored. */
  helpfulReplies: readonly { slug: string; title: string; kind: "helpful" | "accepted" }[];
}

/* ------------------------------------------------------------------ post content */

/**
 * One block of post content.
 *
 * `numbers` blocks are ASCII number tables and pair lists — the LotteryPost-native form the research names —
 * and they render whitespace faithfully in a `<pre>` element. That is a hard requirement of the corpus
 * authorization: a Pick 3 monthly thread IS its aligned columns.
 */
export type PostBlock =
  | { kind: "text"; text: string }
  | { kind: "numbers"; text: string };

/* ------------------------------------------------------------------ 08B §6 structured attachments */

/** Number Share — 08B §6 / 08D Template C. */
export interface NumberShareAttachment {
  kind: "numberShare";
  game: string;
  draw: string;
  numbers: string;
  playType: string;
  /** Template C: "Shared publicly by: @<username>" — the confirmation the composer collected. */
  publicShareConfirmation: string;
  /** "Result status after draw" — the corpus never attaches an invented result, so this states that plainly. */
  resultStatusAfterDraw: string;
}

/** System — 08B §6 / 08D Template D. */
export interface SystemAttachment {
  kind: "system";
  systemName: string;
  game: string;
  version: string;
  rules: string;
  example: string;
  /** No backtest tool route exists in this build; the honest value is null, never an invented URL. */
  backtestHref: null;
  assumptions: string;
  /** Template D disclosure, verbatim — see SYSTEM_DISCLOSURE. */
  disclosure: string;
}

/** Win Story — 08B §6 / 08D Template E. */
export interface WinStoryAttachment {
  kind: "winStory";
  state: string;
  game: string;
  amount: string;
  /** No ticket photo asset exists and none is fabricated. */
  photo: null;
  verificationState: WinnerVerificationState;
  story: string;
}

/** Poll — 08B §6 / 08D Template F. Votes are NEVER stored as a number: they are tallied from visible replies. */
export interface PollAttachment {
  kind: "poll";
  question: string;
  choices: readonly string[];
  closeDateIso: string;
  /** Template F disclosure, verbatim — see POLL_DISCLOSURE. */
  disclosure: string;
}

export type ForumAttachment =
  | NumberShareAttachment | SystemAttachment | WinStoryAttachment | PollAttachment;

/** 08D Template D disclosure, verbatim. */
export const SYSTEM_DISCLOSURE =
  "This is a member method or historical research workflow. It does not guarantee future wins.";

/** 08D Template F disclosure, verbatim. */
export const POLL_DISCLOSURE =
  "This is a LotteryCorner community poll and does not represent all lottery players.";

/** 08D Template E privacy warning, verbatim. */
export const TICKET_PRIVACY_WARNING =
  "Never upload a barcode, claim number, serial number, address or account information.";

/** 08D Template I disclosure, verbatim. */
export const COMMUNITY_SUMMARY_DISCLOSURE =
  "Generated from visible community replies and linked sources. It does not replace the original discussion.";

/* ------------------------------------------------------------------ replies */

/**
 * One member reply.
 *
 * `summaryPoint` is how FE-09 stays grounded: the Community Summary is built ONLY from these per-reply,
 * team-recorded classifications — each bullet cites the reply it came from — so the summary cannot
 * manufacture a consensus the replies do not contain (08B §11).
 */
export interface ForumReplyRecord {
  id: string;
  username: string;
  body: readonly PostBlock[];
  postedAtIso: string;
  /** Marked helpful by other members in the fixture story. Rendered as a label, never as a count or score. */
  helpful: boolean;
  /** The poll choice this reply states, where the entry is a poll. Tallied for the visible vote count. */
  pollChoice?: string;
  summaryPoint?: {
    kind: "fact" | "experience" | "viewpoint" | "open";
    text: string;
  };
  provenance: ContentProvenance;
}

/**
 * The FE-06 LotteryCorner Research reply — 08D Template H, field for field.
 *
 * This is TEAM-AUTHORED content under the platform's own non-human identity (Constitution §32), which is why
 * it is honest in a review corpus where member voices are fixtures: LotteryCorner Research really is the team,
 * its findings really are checked against the repository evidence it cites, and it never pretends to be a member.
 */
export interface ResearchReplyRecord {
  id: string;
  label: typeof REPLY_LABELS.research;
  questionResearched: string;
  whatWeFound: readonly string[];
  evidence: readonly string[];
  whatRemainsUncertain: string;
  publishedIso: string;
  /** 08B §8: AI does not appear first for social/opinion entries unless invoked. Records who invoked it. */
  invokedBy: string | null;
  correctionStatus: string;
  provenance: ContentProvenance;
}

/* ------------------------------------------------------------------ the entry (08D §1 inputs) */

export interface ForumContextRef {
  label: string;
  /** A same-site route this build serves, or an official-source URL rendered with external treatment. */
  href: string;
  kind: "game" | "state" | "archive" | "tool" | "news" | "official" | "guide";
}

export interface ForumEntryRecord {
  forumEntryId: string;
  slug: string;
  title: string;
  username: string;
  createdAtIso: string;
  updatedAtIso: string | null;
  /** Governed tags (08 §5). */
  tags: readonly string[];
  gameId: string | null;
  stateCode: string | null;
  drawId: null;
  yearArchive: null;
  /** The 08D Template M seam: the News Article this entry is the one canonical discussion for. */
  newsArticleSlug: string | null;
  toolId: null;
  eventId: null;
  status: ForumEntryLifecycle;
  indexabilityState: ForumIndexabilityState;
  moderationState: ForumModerationState;
  body: readonly PostBlock[];
  attachment: ForumAttachment | null;
  contextRefs: readonly ForumContextRef[];
  researchReply: ResearchReplyRecord | null;
  replies: readonly ForumReplyRecord[];
  /** FE-08 — the reply the ORIGINAL POSTER accepted, when one exists. AI cannot accept itself (08 §8). */
  acceptedReplyId: string | null;
  /** Who performed the acceptance. Must equal `username` — only the OP may accept (08B §10). */
  acceptedBy: string | null;
  provenance: ContentProvenance;
}

/* ------------------------------------------------------------------ 08A §2 — the Community Home order */

export type CommunityHomeSectionId =
  | "CH-01" | "CH-02" | "CH-03" | "CH-04" | "CH-05" | "CH-06" | "CH-07"
  | "AD-CH00"
  | "CH-08" | "CH-09" | "CH-10" | "CH-11" | "CH-12" | "CH-13" | "CH-14" | "CH-15"
  | "AD-CH01";

/** 08A §2 — the REQUIRED order, all seventeen rows before the footer, transcribed exactly. */
export const COMMUNITY_HOME_ORDER: readonly CommunityHomeSectionId[] = Object.freeze([
  "CH-01",   //  1 Community Identity and Ask or Share
  "CH-02",   //  2 Active Now
  "CH-03",   //  3 Questions and Entries Needing Player Experience
  "CH-04",   //  4 Pick 3 and Pick 4
  "CH-05",   //  5 Jackpot Games
  "CH-06",   //  6 State Communities
  "CH-07",   //  7 Systems, Tools and Mathematics
  "AD-CH00", //  8 Advertisement
  "CH-08",   //  9 Wins and Ticket Stories
  "CH-09",   // 10 Scratch-Offs
  "CH-10",   // 11 Dreams, Signs and Lucky Numbers
  "CH-11",   // 12 News Discussions
  "CH-12",   // 13 Most Helpful
  "CH-13",   // 14 Following
  "CH-14",   // 15 Community Events and Polls
  "CH-15",   // 16 New Members and Guidelines
  "AD-CH01", // 17 Lower Advertisement
]);

/** 08A §2 — section names, verbatim. */
export const COMMUNITY_HOME_SECTION_NAMES: Readonly<Record<CommunityHomeSectionId, string>> = Object.freeze({
  "CH-01": "Community Identity and Ask or Share",
  "CH-02": "Active Now",
  "CH-03": "Questions and Entries Needing Player Experience",
  "CH-04": "Pick 3 and Pick 4",
  "CH-05": "Jackpot Games",
  "CH-06": "State Communities",
  "CH-07": "Systems, Tools and Mathematics",
  "AD-CH00": "Advertisement",
  "CH-08": "Wins and Ticket Stories",
  "CH-09": "Scratch-Offs",
  "CH-10": "Dreams, Signs and Lucky Numbers",
  "CH-11": "News Discussions",
  "CH-12": "Most Helpful",
  "CH-13": "Following",
  "CH-14": "Community Events and Polls",
  "CH-15": "New Members and Guidelines",
  "AD-CH01": "Lower Advertisement",
});

/* ------------------------------------------------------------------ 08A §3 — identity, verbatim */

/** 08A §3 — the H1, verbatim. */
export const COMMUNITY_H1 = "Lottery Community";

/** 08A §3 — the supporting copy, verbatim. */
export const COMMUNITY_SUPPORT =
  "Ask questions, share numbers, discuss systems, celebrate wins and connect with U.S. lottery players.";

/** 08A §3 — the primary composer prompt, verbatim. */
export const COMPOSER_PROMPT = "What do you want to ask or share?";

/** 08A §3 — the seven quick helpers, verbatim. All of them produce the same `FORUM_ENTRY` (08 §6). */
export const COMPOSER_HELPERS: readonly string[] = Object.freeze([
  "Ask a Question", "Share Numbers", "Share a Win", "Start a Discussion",
  "Explain a System", "Add a Photo", "Create a Poll",
]);

/** 08A §5 — the CH-03 labels, verbatim. */
export const NEEDS_EXPERIENCE_LABELS = Object.freeze({
  noReplies: "No replies yet",
  aiAnswered: "LotteryCorner AI answered — player experience wanted",
  needsStateInput: "Needs state-player input",
});

/** 08A §12 — the CH-10 label, verbatim. */
export const CH10_BELIEF_LABEL = "Community beliefs and personal interpretations";

/* ------------------------------------------------------------------ 08A §18 filters */

/** 08A §18 — the available filters, verbatim. They must not create an indexable URL explosion. */
export const COMMUNITY_FILTERS: readonly string[] = Object.freeze([
  "Latest", "Active", "Following", "Needs Replies", "Most Helpful", "State", "Game", "Tag",
]);

/* ------------------------------------------------------------------ 08A §20 metadata, verbatim */

export const COMMUNITY_HOME_TITLE =
  "Lottery Community: Questions, Numbers, Systems & Player Stories | LotteryCorner";
export const COMMUNITY_HOME_DESCRIPTION =
  "Join U.S. lottery players discussing Pick 3, Pick 4, Powerball, Mega Millions, systems, winning tickets, "
  + "state games and lottery news.";

/* ------------------------------------------------------------------ 08B §2 — the Forum Entry order */

export type ForumEntrySectionId =
  | "FE-01" | "FE-02" | "FE-03" | "FE-04" | "FE-05" | "FE-06" | "FE-07"
  | "FE-08" | "FE-09" | "FE-10" | "FE-11" | "FE-12" | "FE-13"
  | "AD-FE00";

/** 08B §2 — the REQUIRED order, all fourteen rows before the footer, transcribed exactly. */
export const FORUM_ENTRY_ORDER: readonly ForumEntrySectionId[] = Object.freeze([
  "FE-01",   //  1 Breadcrumbs, Tags and Context
  "FE-02",   //  2 Title, Username and Dates
  "FE-03",   //  3 Root Post
  "FE-04",   //  4 Structured Attachment
  "FE-05",   //  5 Sources, Tool or Page Context
  "FE-06",   //  6 LotteryCorner AI or Research Reply
  "FE-07",   //  7 Replies
  "FE-08",   //  8 Helpful or Accepted Reply
  "FE-09",   //  9 Community Summary
  "FE-10",   // 10 Reply Composer
  "FE-11",   // 11 Related Forum Entries
  "FE-12",   // 12 Follow and Notifications
  "FE-13",   // 13 Moderation, Corrections and Responsible Play
  "AD-FE00", // 14 Controlled Reply Advertisement
]);

/** 08B §2 — section names, verbatim. */
export const FORUM_ENTRY_SECTION_NAMES: Readonly<Record<ForumEntrySectionId, string>> = Object.freeze({
  "FE-01": "Breadcrumbs, Tags and Context",
  "FE-02": "Title, Username and Dates",
  "FE-03": "Root Post",
  "FE-04": "Structured Attachment",
  "FE-05": "Sources, Tool or Page Context",
  "FE-06": "LotteryCorner AI or Research Reply",
  "FE-07": "Replies",
  "FE-08": "Helpful or Accepted Reply",
  "FE-09": "Community Summary",
  "FE-10": "Reply Composer",
  "FE-11": "Related Forum Entries",
  "FE-12": "Follow and Notifications",
  "FE-13": "Moderation, Corrections and Responsible Play",
  "AD-FE00": "Controlled Reply Advertisement",
});

/* ------------------------------------------------------------------ 08B §8 — the FE-06 labels, verbatim */

export const REPLY_LABELS = Object.freeze({
  ai: "LotteryCorner AI",
  research: "LotteryCorner Research",
  moderator: "Moderator Clarification",
  reporter: "Reporter Clarification",
});

/* ------------------------------------------------------------------ 08B §9 — reply sorts */

export type ReplySort = "top" | "newest" | "oldest" | "helpful";
export const REPLY_SORTS: readonly ReplySort[] = Object.freeze(["top", "newest", "oldest", "helpful"]);
export const REPLY_SORT_LABELS: Readonly<Record<ReplySort, string>> = Object.freeze({
  top: "Top", newest: "Newest", oldest: "Oldest", helpful: "Helpful",
});

/** 08 §26: pagination, never infinite scroll. Small enough that a ten-reply monthly thread demonstrates it. */
export const REPLIES_PER_PAGE = 6;

/* ------------------------------------------------------------------ 08B §12 — the FE-10 placeholder, verbatim */

export const REPLY_PLACEHOLDER = "Add your answer or experience…";

/** 08B §12 — context-sensitive alternatives, verbatim. */
export const REPLY_PLACEHOLDER_ALTERNATIVES = Object.freeze({
  numbers: "Share your numbers…",
  experience: "Add your experience…",
  system: "Explain your method…",
  question: "Answer the question…",
});

/* ------------------------------------------------------------------ 08B §19 metadata patterns */

/** 08B §19 — `<Forum Entry Title> | LotteryCorner Community`. */
export function forumEntryTitle(title: string): string {
  return `${title} | LotteryCorner Community`;
}

/** 08B §19 — the description pattern. */
export function forumEntryDescription(topic: string): string {
  return `Join LotteryCorner members discussing ${topic}, read player replies and add your experience.`;
}

/* ------------------------------------------------------------------ routes (08 §33 decisions 2 and 17) */

export const COMMUNITY_HOME_PATH = "/community";
export const communityEntryPath = (slug: string) => `/community/${slug}`;
export const memberPath = (username: string) => `/members/${username}`;
