/*
 * THE ADMIN CONTENT WORKFLOW — Conflict 40. The one module that TRANSITIONS content, built as adapters over
 * the four existing seams:
 *
 *   community — `readModerationQueue()` (member reports) + the reviewer post store (derived triggers)
 *   news/blog — the console's own editorial store (`adminContentStore.ts`)
 *   contact   — `listContactSubmissions()` / `transitionContactSubmission()` (new → read → resolved)
 *
 * ══ THE THREE INVARIANTS EVERY TRANSITION HOLDS ══
 *
 *   1. AUDIT FIRST. `appendAuditRecord` throws on a record missing who/what/action/reason, and it is called
 *      BEFORE the state change commits — a transition that cannot be audited does not happen (Conflict 40).
 *   2. A REJECTION REQUIRES a non-empty reason, a policy reference from the 08 §22 list, and an EXPLICIT
 *      notify-author choice. The choice records INTENT only — no delivery channel exists, nothing is sent
 *      (`NOTIFY_AUTHOR_INTENT_DISCLOSURE`), and no function here claims otherwise.
 *   3. A HUMAN ACTS. Every function takes `who` — the signed-in admin the console resolved through the
 *      session seam. Nothing automated calls this module; AI may later ASSIST triage, never decide
 *      (Constitution §50).
 *
 * Approved items simply go (or stay) live: approval's record is the audit entry plus the content's own
 * status — there is no "approved" tab to curate.
 */

import { readModerationQueue } from "../community/communityModeration";
import {
  listReviewerEntries, updateReviewerEntryContent, type ReviewerEntryRecord,
} from "../community/communityReviewerStore";
import {
  listContactSubmissions, transitionContactSubmission,
} from "../contact/reviewContactStore";
import type { ContactSubmission, ContactSubmissionStatus } from "../contact/contactContract";
import type {
  AdminEditorialFields, AdminEditorialItem, AdminQueueItem, AdminSurface,
} from "./adminContract";
import {
  ADMIN_APPEAL_ROUTE, GENERAL_POLICY_REFERENCE, MODERATION_POLICY_REFERENCES,
} from "./adminContract";
import { appendAuditRecord } from "./adminAudit";
import {
  assertStatusTransition, createEditorialItem, getEditorialItem, listCommunityDecisions,
  listEditorialItems, recordCommunityDecision, replaceEditorialItem, assertEditorialFields,
} from "./adminContentStore";

/* ------------------------------------------------------------------ shared helpers */

function truncate(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

/** The 08 §22 action contract, enforced: reason + policy reference + explicit notify choice, or no action. */
function assertRejectInput(input: { reason: string; policyRef: string; notifyAuthorIntent: boolean }): void {
  if (typeof input.reason !== "string" || input.reason.trim().length === 0) {
    throw new Error("A rejection requires a reason — the action is blocked without one (08 §22, Conflict 40).");
  }
  if (!MODERATION_POLICY_REFERENCES.includes(input.policyRef)) {
    throw new Error(`"${input.policyRef}" is not one of the 08 §22 policy references.`);
  }
  if (typeof input.notifyAuthorIntent !== "boolean") {
    throw new Error("The notify-author choice must be made explicitly (it records intent only).");
  }
}

/* ------------------------------------------------------------------ queue assembly */

function editorialQueueRow(item: AdminEditorialItem): AdminQueueItem {
  return {
    surface: item.family,
    id: item.id,
    kind: "editorial-item",
    excerpt: truncate(`${item.headline} — ${item.description}`),
    author: item.editorName,
    submittedAtIso: item.updatedAtIso,
    flagReason: item.queueNote ?? "Entered in the console — awaiting review",
    editable: true,
  };
}

/**
 * The DERIVED community queue candidates, per the `QUEUE_TRIGGERS` contract: member reports (the 08 §22
 * queue), each username's first post, and link-containing posts. One entry matching several triggers is one
 * row with the reasons joined.
 */
function communityCandidates(): AdminQueueItem[] {
  const rows: AdminQueueItem[] = [];

  for (const report of readModerationQueue()) {
    const target = report.replyId
      ? `reply ${report.replyId} on “${report.targetSlug}”`
      : `${report.targetKind} “${report.targetSlug}”`;
    rows.push({
      surface: "community",
      id: report.id,
      kind: "member-report",
      excerpt: report.detail ? `${target} — “${truncate(report.detail, 100)}”` : target,
      author: report.reporter ? `Reported by ${report.reporter}` : "Reported anonymously",
      submittedAtIso: report.reportedAtIso,
      flagReason: `Member report — ${report.category} (08 §22)`,
      /* Fixture corpus content is immutable committed data; a report row offers approve/reject only. */
      editable: false,
    });
  }

  const entries = [...listReviewerEntries()].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));
  const seenUsernames = new Set<string>();
  for (const entry of entries) {
    const reasons: string[] = [];
    if (!seenUsernames.has(entry.username)) {
      seenUsernames.add(entry.username);
      reasons.push("First post from a new account");
    }
    const text = entry.body.map((b) => b.text).join("\n");
    if (/https?:\/\/|(^|\s)www\./i.test(`${entry.title}\n${text}`)) reasons.push("Post contains a link");
    if (reasons.length > 0) {
      rows.push({
        surface: "community",
        id: `entry-${entry.slug}`,
        kind: "reviewer-entry",
        excerpt: truncate(`${entry.title} — ${text}`),
        author: entry.username,
        submittedAtIso: entry.createdAtIso,
        flagReason: reasons.join(" · "),
        editable: true,
      });
    }
  }

  return rows;
}

/**
 * The console's queue read: Pending or Rejected rows for one surface. Contact is not a moderation queue —
 * its inbox lifecycle has its own read (`listContactInbox`).
 */
export function listAdminQueue(
  surface: Exclude<AdminSurface, "contact">,
  status: "pending" | "rejected",
): readonly AdminQueueItem[] {
  if (surface === "community") {
    const decisions = listCommunityDecisions();
    if (status === "rejected") {
      return decisions.filter((d) => d.status === "rejected").map((d) => d.snapshot);
    }
    const decided = new Set(decisions.map((d) => d.targetId));
    return communityCandidates()
      .filter((row) => !decided.has(row.id))
      .sort((a, b) => b.submittedAtIso.localeCompare(a.submittedAtIso));
  }
  const wanted = status === "pending" ? "pending" : "rejected";
  return listEditorialItems(surface)
    .filter((i) => i.contentMeta.reviewStatus === wanted)
    .map(editorialQueueRow);
}

/** Dashboard counts: pending per moderated surface, plus the contact inbox's unread pile. */
export function adminQueueCounts(): Record<AdminSurface, number> {
  return {
    community: listAdminQueue("community", "pending").length,
    news: listAdminQueue("news", "pending").length,
    blog: listAdminQueue("blog", "pending").length,
    contact: listContactSubmissions().filter((s) => s.status === "new").length,
  };
}

/* ------------------------------------------------------------------ editorial entry (news/blog forms) */

/** Enter a new item. It lands as a DRAFT — nothing is public until draft → pending → approved. */
export function enterEditorialDraft(input: {
  family: "news" | "blog";
  fields: AdminEditorialFields;
  who: string;
}): AdminEditorialItem {
  /* Validate before auditing so a refused draft leaves no trail entry for content that never existed. */
  assertEditorialFields(input.family, input.fields);
  const item = createEditorialItem({ family: input.family, fields: input.fields, enteredBy: input.who });
  appendAuditRecord({
    who: input.who,
    what: `${input.family} item “${truncate(item.headline, 80)}” (${item.id}) entered as a draft`,
    action: "enter-draft",
    reason: "New item entered through the console entry form.",
    surface: input.family,
    targetId: item.id,
    policyRef: null,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: null,
  });
  return item;
}

/** draft → pending (also the resubmission edge for a revised rejected item). */
export function submitEditorialForReview(id: string, who: string): AdminEditorialItem {
  const item = getEditorialItem(id);
  if (!item) throw new Error(`submitEditorialForReview: no item "${id}"`);
  assertStatusTransition(item.contentMeta.reviewStatus, "pending");
  appendAuditRecord({
    who,
    what: `${item.family} item “${truncate(item.headline, 80)}” (${item.id}) submitted for review`,
    action: "submit-for-review",
    reason: item.contentMeta.reviewStatus === "rejected"
      ? "Revised after rejection and resubmitted for review."
      : "Draft submitted for review.",
    surface: item.family,
    targetId: item.id,
    policyRef: null,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: null,
  });
  const next: AdminEditorialItem = {
    ...item,
    queueNote: item.contentMeta.reviewStatus === "rejected"
      ? "Revised after rejection — awaiting re-review"
      : "Entered in the console — awaiting review",
    contentMeta: { ...item.contentMeta, reviewStatus: "pending" },
  };
  replaceEditorialItem(next);
  return next;
}

/**
 * Edit an item OUTSIDE the approve flow. Editing an APPROVED item returns it to PENDING — the
 * "edit to a published item" queue trigger: the earlier approval does not cover the new text. The original
 * is preserved in the audit trail as a snapshot.
 */
export function reviseEditorialItem(id: string, fields: AdminEditorialFields, who: string): AdminEditorialItem {
  const item = getEditorialItem(id);
  if (!item) throw new Error(`reviseEditorialItem: no item "${id}"`);
  assertEditorialFields(item.family, fields);
  const wasApproved = item.contentMeta.reviewStatus === "approved";
  if (wasApproved) assertStatusTransition("approved", "pending");
  appendAuditRecord({
    who,
    what: `${item.family} item “${truncate(item.headline, 80)}” (${item.id}) edited${wasApproved ? " after publication" : ""}`,
    action: wasApproved ? "edit-published-item" : "enter-draft",
    reason: wasApproved
      ? "Published item edited — returned to the pending queue for re-review."
      : "Item revised before review.",
    surface: item.family,
    targetId: item.id,
    policyRef: null,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: JSON.stringify(item),
  });
  const next: AdminEditorialItem = {
    ...item,
    ...fields,
    body: fields.body.filter((p) => p.trim().length > 0),
    queueNote: wasApproved ? "Edit to a published item — awaiting re-review" : item.queueNote,
    contentMeta: wasApproved ? { ...item.contentMeta, reviewStatus: "pending" } : item.contentMeta,
  };
  replaceEditorialItem(next);
  return next;
}

/* ------------------------------------------------------------------ the three queue actions */

export interface QueueActionInput {
  surface: Exclude<AdminSurface, "contact">;
  id: string;
  who: string;
  /** Approvals carry a reason too — the audit record requires one on EVERY action. */
  reason?: string;
}

function findQueueRow(surface: Exclude<AdminSurface, "contact">, id: string): AdminQueueItem {
  const row = listAdminQueue(surface, "pending").find((r) => r.id === id);
  if (!row) throw new Error(`No pending ${surface} queue item "${id}".`);
  return row;
}

/** APPROVE — the content goes (or stays) live. */
export function approveQueueItem(input: QueueActionInput): void {
  const row = findQueueRow(input.surface, input.id);
  const reason = input.reason?.trim() || "Approved — complies with the posted content rules.";
  appendAuditRecord({
    who: input.who,
    what: `${input.surface} — approved: ${row.excerpt}`,
    action: "approve",
    reason,
    surface: input.surface,
    targetId: input.id,
    policyRef: GENERAL_POLICY_REFERENCE,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: null,
  });
  if (input.surface === "community") {
    recordCommunityDecision({
      targetId: input.id, status: "approved", snapshot: row, reason,
      policyRef: GENERAL_POLICY_REFERENCE, notifyAuthorIntent: null,
    });
    return;
  }
  const item = getEditorialItem(input.id);
  if (!item) throw new Error(`approveQueueItem: no editorial item "${input.id}"`);
  assertStatusTransition(item.contentMeta.reviewStatus, "approved");
  replaceEditorialItem({
    ...item,
    queueNote: null,
    rejection: null,
    contentMeta: { ...item.contentMeta, reviewStatus: "approved", lastReviewedIso: new Date().toISOString() },
  });
}

export interface RejectActionInput extends QueueActionInput {
  reason: string;
  policyRef: string;
  /** Explicit choice; records INTENT only — no delivery channel exists, nothing is sent. */
  notifyAuthorIntent: boolean;
}

/** REJECT — blocked without a reason, a policy reference and the explicit notify-author choice. */
export function rejectQueueItem(input: RejectActionInput): void {
  assertRejectInput(input);
  const row = findQueueRow(input.surface, input.id);
  appendAuditRecord({
    who: input.who,
    what: `${input.surface} — rejected: ${row.excerpt}`,
    action: "reject",
    reason: input.reason.trim(),
    surface: input.surface,
    targetId: input.id,
    policyRef: input.policyRef,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: input.notifyAuthorIntent,
    originalSnapshot: null,
  });
  if (input.surface === "community") {
    recordCommunityDecision({
      targetId: input.id, status: "rejected", snapshot: row, reason: input.reason.trim(),
      policyRef: input.policyRef, notifyAuthorIntent: input.notifyAuthorIntent,
    });
    return;
  }
  const item = getEditorialItem(input.id);
  if (!item) throw new Error(`rejectQueueItem: no editorial item "${input.id}"`);
  assertStatusTransition(item.contentMeta.reviewStatus, "rejected");
  replaceEditorialItem({
    ...item,
    queueNote: null,
    rejection: {
      reason: input.reason.trim(),
      policyRef: input.policyRef,
      notifyAuthorIntent: input.notifyAuthorIntent,
      appealRoute: ADMIN_APPEAL_ROUTE,
    },
    contentMeta: { ...item.contentMeta, reviewStatus: "rejected", lastReviewedIso: new Date().toISOString() },
  });
}

export interface EditApproveEditorialInput extends QueueActionInput {
  surface: "news" | "blog";
  fields: AdminEditorialFields;
}

/** EDIT-THEN-APPROVE on an editorial item. The ORIGINAL is preserved in the audit trail as a snapshot. */
export function editThenApproveEditorialItem(input: EditApproveEditorialInput): void {
  const item = getEditorialItem(input.id);
  if (!item) throw new Error(`editThenApproveEditorialItem: no editorial item "${input.id}"`);
  assertEditorialFields(item.family, input.fields);
  assertStatusTransition(item.contentMeta.reviewStatus, "approved");
  appendAuditRecord({
    who: input.who,
    what: `${item.family} item “${truncate(item.headline, 80)}” (${item.id}) edited and approved`,
    action: "edit-then-approve",
    reason: input.reason?.trim() || "Edited during review, then approved.",
    surface: item.family,
    targetId: item.id,
    policyRef: GENERAL_POLICY_REFERENCE,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: JSON.stringify(item),
  });
  replaceEditorialItem({
    ...item,
    ...input.fields,
    body: input.fields.body.filter((p) => p.trim().length > 0),
    queueNote: null,
    rejection: null,
    contentMeta: { ...item.contentMeta, reviewStatus: "approved", lastReviewedIso: new Date().toISOString() },
  });
}

export interface EditApproveCommunityInput extends QueueActionInput {
  surface: "community";
  edits: { title: string; text: string };
}

/** EDIT-THEN-APPROVE on a reviewer-authored community entry (report rows on fixture content are not editable). */
export function editThenApproveCommunityEntry(input: EditApproveCommunityInput): void {
  const row = findQueueRow("community", input.id);
  if (row.kind !== "reviewer-entry" || !row.editable) {
    throw new Error("Only a reviewer-authored entry can be edited; fixture-content reports are approve/reject only.");
  }
  const slug = input.id.replace(/^entry-/, "");
  const original: ReviewerEntryRecord | null =
    listReviewerEntries().find((e) => e.slug === slug) ?? null;
  if (!original) throw new Error(`editThenApproveCommunityEntry: no reviewer entry "${slug}"`);
  appendAuditRecord({
    who: input.who,
    what: `community entry “${truncate(original.title, 80)}” (${slug}) edited and approved`,
    action: "edit-then-approve",
    reason: input.reason?.trim() || "Edited during review, then approved.",
    surface: "community",
    targetId: input.id,
    policyRef: GENERAL_POLICY_REFERENCE,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: JSON.stringify(original),
  });
  updateReviewerEntryContent(slug, input.edits);
  recordCommunityDecision({
    targetId: input.id, status: "approved", snapshot: row,
    reason: input.reason?.trim() || "Edited during review, then approved.",
    policyRef: GENERAL_POLICY_REFERENCE, notifyAuthorIntent: null,
  });
}

/* ------------------------------------------------------------------ contact inbox */

/** The inbox read — newest first, exactly what the store holds. */
export function listContactInbox(): readonly ContactSubmission[] {
  return listContactSubmissions();
}

/** new → read → resolved, forward only, each move audited. */
export function transitionContactInboxItem(input: {
  id: string;
  next: Exclude<ContactSubmissionStatus, "new">;
  who: string;
  reason?: string;
}): ContactSubmission {
  const current = listContactSubmissions().find((s) => s.id === input.id);
  if (!current) throw new Error(`transitionContactInboxItem: no submission "${input.id}"`);
  appendAuditRecord({
    who: input.who,
    what: `contact submission from ${current.name ?? current.email} (${current.id}) marked ${input.next}`,
    action: input.next === "read" ? "contact-read" : "contact-resolved",
    reason: input.reason?.trim()
      || (input.next === "read" ? "Opened and read in the console inbox." : "Handled — marked resolved in the console inbox."),
    surface: "contact",
    targetId: current.id,
    policyRef: null,
    appealRoute: ADMIN_APPEAL_ROUTE,
    notifyAuthorIntent: null,
    originalSnapshot: null,
  });
  return transitionContactSubmission(input.id, input.next);
}
