/*
 * THE ADMIN-AREA CONTRACT — Conflict 40 (CLOSED — RECORDED 2026-08-11): the founder authorized a PROTECTED
 * AREA INSIDE THE NEW APP, the same pattern as current production's unindexed /admin login.
 *
 * ══ WHAT THIS FILE IS ══
 *
 * The typed vocabulary of the admin console: the four moderated surfaces, the editorial lifecycle and its
 * `contentMeta`, the moderation-action contract (reason + policy reference + appeal route + notify-author
 * INTENT), the queue-trigger contract, and the audit-record shape. The stores and the workflow consume this;
 * nothing here reads data.
 *
 * ══ THE BINDING CONSTRAINTS THIS ENCODES (Conflict 40, inherited from higher tiers) ══
 *
 *   - editorial flow is draft → review → publish with `contentMeta` (source, reviewStatus, lastReviewed);
 *   - every news article has an accountable human editor (07 §3) — the entry forms REQUIRE the field;
 *   - every moderation action carries reason + policy reference + appeal route (08 §22);
 *   - full audit trail: who / what / when / action / reason — `AdminAuditRecord` cannot be built without all five;
 *   - humans own severe actions: every transition in this module is performed by a signed-in human admin, and
 *     NO automated path calls any of them. AI may later assist with triage; it never acts (Constitution §50).
 *
 * ══ THE QUEUE-TRIGGER CONTRACT ══
 *
 * `QUEUE_TRIGGERS` below documents what puts an item into the Pending queue. Approved items simply go live —
 * there is no "approved" tab, because approval's whole effect is that the content is (or stays) public.
 */

import { REPORT_CATEGORIES } from "../community/communityContract";
import { MODERATION_POLICY } from "../community/communityModeration";
import type { NewsCategory } from "../news/newsContract";
import { BLOG_CATEGORIES, type BlogCategory } from "../blog/blogContract";

/* ------------------------------------------------------------------ surfaces */

/** The four moderated surfaces the console shows, in tab order. */
export type AdminSurface = "community" | "news" | "blog" | "contact";

export const ADMIN_SURFACES: readonly AdminSurface[] = Object.freeze([
  "community", "news", "blog", "contact",
]);

export const ADMIN_SURFACE_LABELS: Readonly<Record<AdminSurface, string>> = Object.freeze({
  community: "Community",
  news: "News",
  blog: "Blog",
  contact: "Contact",
});

/* ------------------------------------------------------------------ contentMeta (Conflict 40) */

/** The editorial lifecycle. Only "approved" content is ever publicly visible. */
export type AdminReviewStatus = "draft" | "pending" | "approved" | "rejected";

/**
 * The Conflict 40 `contentMeta` trio, verbatim: source, reviewStatus, lastReviewed. Every item entered
 * through the console carries one, and every review transition rewrites it.
 */
export interface ContentMeta {
  /** Where the content came from — the console always writes `"admin-console"`. */
  source: "admin-console";
  reviewStatus: AdminReviewStatus;
  /** ISO instant of the last review DECISION (approve/reject), or null while none has happened. */
  lastReviewedIso: string | null;
}

/* ------------------------------------------------------------------ queue triggers */

/**
 * WHAT PUTS AN ITEM IN THE PENDING QUEUE — the contract, per the founder-commissioned research spec.
 * `implementedBy` records honestly which feed exists in this review build; a trigger without a feed is a
 * documented contract for the API phase, never a pretended capability.
 */
export const QUEUE_TRIGGERS = Object.freeze([
  Object.freeze({
    id: "new-account-first-post",
    description: "A new account's first community post enters the queue before it earns unreviewed posting.",
    implementedBy:
      "Derived from the community reviewer store: each username's earliest entry is queued (lib/admin/adminWorkflow.ts).",
  }),
  Object.freeze({
    id: "member-report",
    description: "A member (or anonymous) report files the reported content into the queue.",
    implementedBy:
      "The typed 08 §22 moderation queue — readModerationQueue() in lib/community/communityModeration.ts.",
  }),
  Object.freeze({
    id: "link-containing-post",
    description: "A community post containing an outbound link is held for review (spam and affiliate-solicitation guard).",
    implementedBy:
      "Derived from the community reviewer store: entries whose body carries http(s):// or www. are queued.",
  }),
  Object.freeze({
    id: "edit-to-published-item",
    description: "An edit to an already-published item re-enters the queue; the live version stands until re-approval.",
    implementedBy:
      "Editorial items: editing an approved news/blog item returns it to pending (lib/admin/adminContentStore.ts). "
      + "Community edits have no edit path in the review store yet; the trigger binds the API phase.",
  }),
] as const);

/* ------------------------------------------------------------------ the three actions */

/**
 * The three queue actions. Approve and Edit-then-approve publish (or keep live); Reject REQUIRES a reason,
 * a policy reference and an explicit notify-author choice.
 */
export type AdminQueueAction = "approve" | "edit-then-approve" | "reject";

/**
 * The policy references the reject control offers — the 08 §22 moderation categories, verbatim from the
 * community contract (the community blueprint's own list), each cited as the policy applied. One general
 * reference exists for approvals and for rejections that enforce the content rules as a whole.
 */
export const GENERAL_POLICY_REFERENCE = "08 §22 — community content rules (general)";

export const MODERATION_POLICY_REFERENCES: readonly string[] = Object.freeze([
  GENERAL_POLICY_REFERENCE,
  ...REPORT_CATEGORIES.map((category) => `08 §22 — ${category}`),
]);

/** The 08 §22 appeal route, re-exported so every admin action names it without re-inventing it. */
export const ADMIN_APPEAL_ROUTE = MODERATION_POLICY.appealRoute;

/**
 * THE NOTIFY-AUTHOR CHOICE RECORDS INTENT ONLY. No email, push or delivery channel of any kind exists in
 * this build (`FD-ACC-11`), so nothing is sent to anyone — the choice is stored so the future channel knows
 * what the moderator decided. The console MUST render this sentence beside the checkbox; a test asserts it.
 */
export const NOTIFY_AUTHOR_INTENT_DISCLOSURE =
  "Records your intent only — no delivery channel exists in this build, so nothing is sent to the author.";

/* ------------------------------------------------------------------ queue items */

/** How an item earned its queue place — used as the row's visible flag reason. */
export type AdminQueueItemKind = "editorial-item" | "member-report" | "reviewer-entry";

/**
 * One queue row: content excerpt + author + surface + submitted time + flag reason (the research-spec row
 * contract). `editable` says whether Edit-then-approve can open the item's fields — true for console-entered
 * editorial items and reviewer-authored community entries; false for reports on fixture content, whose
 * corpus is immutable committed data.
 */
export interface AdminQueueItem {
  surface: Exclude<AdminSurface, "contact">;
  id: string;
  kind: AdminQueueItemKind;
  excerpt: string;
  author: string;
  submittedAtIso: string;
  flagReason: string;
  editable: boolean;
}

/* ------------------------------------------------------------------ editorial items (news/blog entry) */

/**
 * Governed category options for the entry forms, typed against the families' own contracts so the compiler
 * rejects a value outside 07 §20 (news) — the blog list is the runtime `BLOG_CATEGORIES` re-exported.
 */
export const NEWS_CATEGORY_OPTIONS: readonly NewsCategory[] = Object.freeze([
  "Jackpot", "Winner", "Unclaimed Prize", "State Lottery", "Game Change", "Scratch-Off",
  "Claims and Taxes", "Scam and Safety", "Industry", "Community", "Research", "Celebration and Event",
]);

export const BLOG_CATEGORY_OPTIONS: readonly BlogCategory[] = BLOG_CATEGORIES;

/** The fields the entry forms capture and Edit-then-approve reopens. */
export interface AdminEditorialFields {
  headline: string;
  /** Metadata-style summary — what the item says and why a player would care. */
  description: string;
  /** News only: the 07B §5 Bottom Line. `null` on blog items. */
  bottomLine: string | null;
  /** A governed category — 07 §20 for news, EA §35 for blog. */
  category: string;
  /** Body paragraphs. */
  body: readonly string[];
  /** The ACCOUNTABLE HUMAN EDITOR — required on every item (07 §3, Conflict 40). */
  editorName: string;
  /** Where the item's facts come from — the provenance basis the reviewer checks. */
  evidenceNote: string;
}

/**
 * One item entered through the console. It lives in the admin review store, carries the Conflict 40
 * `contentMeta`, and becomes publicly visible ONLY as `reviewStatus: "approved"` — the news/blog hubs render
 * approved items in a clearly-labelled client strip on the entering machine (the community family's
 * client-resolved precedent; a real backend replaces the store with server reads).
 */
export interface AdminEditorialItem extends AdminEditorialFields {
  dataMode: "review";
  id: string;
  family: "news" | "blog";
  slug: string;
  /** The signed-in admin who entered the item (distinct from the accountable editor field). */
  enteredBy: string;
  /** Why the item sits in the queue right now — e.g. new entry vs an edit to a published item. */
  queueNote: string | null;
  contentMeta: ContentMeta;
  createdAtIso: string;
  updatedAtIso: string;
  /** Set when rejected — the full 08 §22 action record travels with the item. */
  rejection: {
    reason: string;
    policyRef: string;
    notifyAuthorIntent: boolean;
    appealRoute: string;
  } | null;
}

/* ------------------------------------------------------------------ the audit record */

export type AdminAuditAction =
  | "approve" | "edit-then-approve" | "reject"
  | "enter-draft" | "submit-for-review" | "edit-published-item"
  | "contact-read" | "contact-resolved";

/**
 * ONE audit entry — who / what / when / action / reason, all five REQUIRED (Conflict 40's full audit trail).
 * `adminAudit.ts` refuses a record missing any of them, and exposes no update or delete: the trail is
 * append-only by construction.
 */
export interface AdminAuditRecord {
  dataMode: "review";
  id: string;
  /** WHO — the accountable human admin (display name and email). */
  who: string;
  /** WHAT — surface, target and a short content excerpt, in one reader-facing sentence. */
  what: string;
  /** WHEN — ISO instant, stamped by the store, never by the caller. */
  whenIso: string;
  action: AdminAuditAction;
  /** WHY — required on every action, not only rejections (08 §22). */
  reason: string;
  /** Structured companions to `what`, so the trail is filterable by surface. */
  surface: AdminSurface;
  targetId: string;
  /** The policy applied, when the action enforces one. */
  policyRef: string | null;
  /** Where the affected author appeals — carried on every moderation action (08 §22). */
  appealRoute: string;
  /** The recorded notify-author INTENT (see NOTIFY_AUTHOR_INTENT_DISCLOSURE), when the action offers one. */
  notifyAuthorIntent: boolean | null;
  /** JSON snapshot of the content BEFORE an edit action, so the original is preserved in the trail. */
  originalSnapshot: string | null;
}
