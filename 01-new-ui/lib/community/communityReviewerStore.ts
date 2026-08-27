/*
 * THE REVIEWER POST STORE — the community half of the review data layer (Conflict 37: "assume the database
 * exists"), on the `reviewAccountStore` pattern.
 *
 * ══ WHAT LIVES HERE ══
 *
 * Content the SIGNED-IN REVIEWER genuinely authors during review: entries published through the CH-01
 * composer, replies added through FE-10, helpful marks and the OP's accepted reply. This is REAL human-authored
 * content in a stand-in store — the opposite of the fixture corpus — so it carries its own provenance value
 * (`reviewer-authored-review-post`) and is never mixed into the corpus payload. It renders only on the machine
 * that wrote it, which is exactly what a review of the posting flow needs and nothing more.
 *
 * ══ WHY THE COMPOSER'S SIGN-IN GATE IS AT PUBLISH, NOT AT FOCUS ══
 *
 * 08 §6's composer flow, verbatim steps 5–6: *"Sign-in is requested only when publishing or uploading. Draft
 * and context survive sign-in."* The draft therefore persists here (sessionStorage — an artifact of one
 * browsing session, like the sign-in intent itself) and the FD-ACC-12 round trip returns the reviewer to a
 * composer that still holds their words. Publishing is an OUTWARD action (`FD-ACC-13`), so it NEVER completes
 * automatically after sign-in — the reviewer confirms, then this store persists.
 *
 * ══ WHAT COMPONENTS MAY IMPORT ══
 *
 * Client components only. Server components never read this module (member/reviewer state is never in server
 * HTML — Shell §33), which the community test sweeps for.
 */

import { REVIEWER_POST_PROVENANCE, type PostBlock, type ReviewerPostProvenance } from "./communityContract";

/* ------------------------------------------------------------------ shapes */

export interface ReviewerReplyRecord {
  id: string;
  /** The reviewer's account display name — a real signed-in identity, not a persona. */
  username: string;
  body: readonly PostBlock[];
  postedAtIso: string;
  helpful: boolean;
  provenance: ReviewerPostProvenance;
}

export interface ReviewerEntryRecord {
  slug: string;
  title: string;
  /** Which CH-01 quick helper was active. Helpers change inputs only — one FORUM_ENTRY (08 §6). */
  helper: string | null;
  username: string;
  createdAtIso: string;
  body: readonly PostBlock[];
  replies: readonly ReviewerReplyRecord[];
  /** FE-08 — the reply the OP accepted, when one exists. Only a member reply id is ever stored here. */
  acceptedReplyId: string | null;
  provenance: ReviewerPostProvenance;
}

/** Helpful marks the reviewer placed on FIXTURE replies, keyed `${slug}:${replyId}`. */
export interface ReviewerMarks {
  helpful: readonly string[];
}

export interface CommunityDraft {
  text: string;
  helper: string | null;
  savedAtIso: string;
}

/* ------------------------------------------------------------------ storage */

const POSTS_KEY = "lc-review-community-posts-v1";
const MARKS_KEY = "lc-review-community-marks-v1";
const DRAFT_KEY = "lc-review-community-draft-v1";
const FIXTURE_REPLIES_KEY = "lc-review-community-fixture-replies-v1";

/* Node fallbacks so the flows are provable in tests. */
let memoryPosts: ReviewerEntryRecord[] = [];
let memoryMarks: ReviewerMarks = { helpful: [] };
let memoryDraft: CommunityDraft | null = null;
let memoryFixtureReplies: Record<string, ReviewerReplyRecord[]> = {};

const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

/** Subscribe to store changes — the client hook's `useSyncExternalStore` source. */
export function subscribeReviewerStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readJson<T>(storage: "local" | "session", key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = (storage === "local" ? window.localStorage : window.sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage: "local" | "session", key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    (storage === "local" ? window.localStorage : window.sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    /* Denied storage degrades to in-memory-only for this page view. */
  }
}

/* ------------------------------------------------------------------ posts */

export function listReviewerEntries(): readonly ReviewerEntryRecord[] {
  if (typeof window === "undefined") return memoryPosts;
  return readJson<ReviewerEntryRecord[]>("local", POSTS_KEY, []);
}

export function getReviewerEntry(slug: string): ReviewerEntryRecord | null {
  return listReviewerEntries().find((e) => e.slug === slug) ?? null;
}

function writePosts(posts: ReviewerEntryRecord[]): void {
  if (typeof window === "undefined") {
    memoryPosts = posts;
  } else {
    writeJson("local", POSTS_KEY, posts);
  }
  notify();
}

/** Turn a title into a stable, collision-free review slug. */
function slugify(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
    || "forum-entry";
  const taken = new Set(listReviewerEntries().map((e) => e.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Split composer text into blocks, preserving whitespace: an indented/aligned run becomes a numbers block. */
export function toPostBlocks(text: string): PostBlock[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((p) => p.replace(/\s+$/g, ""));
  return paragraphs
    .filter((p) => p.trim().length > 0)
    .map((p): PostBlock =>
      /\n/.test(p) && /(?: {2,}|\t|^ )/m.test(p) ? { kind: "numbers", text: p } : { kind: "text", text: p },
    );
}

/**
 * Publish one reviewer entry. Callers gate on a live session FIRST — publishing is the moment sign-in is
 * required (08 §6 step 5) and an outward action never auto-completes (`FD-ACC-13`).
 */
export function publishReviewerEntry(input: {
  title: string;
  text: string;
  helper: string | null;
  username: string;
}): ReviewerEntryRecord {
  const entry: ReviewerEntryRecord = {
    slug: slugify(input.title),
    title: input.title.trim(),
    helper: input.helper,
    username: input.username,
    createdAtIso: new Date().toISOString(),
    body: toPostBlocks(input.text),
    replies: [],
    acceptedReplyId: null,
    provenance: REVIEWER_POST_PROVENANCE,
  };
  writePosts([entry, ...listReviewerEntries()]);
  return entry;
}

/** Add the signed-in reviewer's reply to one of their entries. */
export function addReviewerReply(slug: string, username: string, text: string): ReviewerReplyRecord | null {
  const posts = [...listReviewerEntries()];
  const i = posts.findIndex((e) => e.slug === slug);
  if (i === -1) return null;
  const reply: ReviewerReplyRecord = {
    id: `rr-${globalThis.crypto.randomUUID()}`,
    username,
    body: toPostBlocks(text),
    postedAtIso: new Date().toISOString(),
    helpful: false,
    provenance: REVIEWER_POST_PROVENANCE,
  };
  posts[i] = { ...posts[i], replies: [...posts[i].replies, reply] };
  writePosts(posts);
  return reply;
}

/**
 * The OP accepts one MEMBER reply on their own entry — FE-08. The computed FE-06 block has no id in this
 * store at all, so "AI cannot accept itself" holds structurally: there is nothing of its to accept.
 */
export function acceptReviewerReply(slug: string, opUsername: string, replyId: string): boolean {
  const posts = [...listReviewerEntries()];
  const i = posts.findIndex((e) => e.slug === slug);
  if (i === -1) return false;
  if (posts[i].username !== opUsername) return false; /* only the original poster accepts (08B §10) */
  if (!posts[i].replies.some((r) => r.id === replyId)) return false;
  posts[i] = { ...posts[i], acceptedReplyId: replyId };
  writePosts(posts);
  return true;
}

/**
 * THE ADMIN-PHASE EDIT — Conflict 40's Edit-then-approve on a reviewer-authored entry. Only the admin
 * console calls this (through `lib/admin/adminWorkflow.ts`, which snapshots the ORIGINAL into the audit
 * trail before the edit and requires a signed-in human admin). Title and body only: authorship, timestamps
 * and provenance are never editable — a moderated post stays the author's post.
 */
export function updateReviewerEntryContent(
  slug: string,
  next: { title: string; text: string },
): ReviewerEntryRecord | null {
  const posts = [...listReviewerEntries()];
  const i = posts.findIndex((e) => e.slug === slug);
  if (i === -1) return null;
  posts[i] = { ...posts[i], title: next.title.trim(), body: toPostBlocks(next.text) };
  writePosts(posts);
  return posts[i];
}

/* ------------------------------------------------------------------ reviewer replies on fixture threads */

/**
 * FE-10 works on the fixture threads too: a signed-in reviewer's reply persists here, keyed by the fixture
 * slug, and the thread renders it appended after the corpus replies (client-side — the corpus itself is
 * immutable committed data and is never edited by the running application).
 */
export function fixtureRepliesFor(slug: string): readonly ReviewerReplyRecord[] {
  const all = typeof window === "undefined"
    ? memoryFixtureReplies
    : readJson<Record<string, ReviewerReplyRecord[]>>("local", FIXTURE_REPLIES_KEY, {});
  return all[slug] ?? [];
}

export function addFixtureReply(slug: string, username: string, text: string): ReviewerReplyRecord {
  const reply: ReviewerReplyRecord = {
    id: `rr-${globalThis.crypto.randomUUID()}`,
    username,
    body: toPostBlocks(text),
    postedAtIso: new Date().toISOString(),
    helpful: false,
    provenance: REVIEWER_POST_PROVENANCE,
  };
  const all = typeof window === "undefined"
    ? { ...memoryFixtureReplies }
    : readJson<Record<string, ReviewerReplyRecord[]>>("local", FIXTURE_REPLIES_KEY, {});
  all[slug] = [...(all[slug] ?? []), reply];
  if (typeof window === "undefined") {
    memoryFixtureReplies = all;
  } else {
    writeJson("local", FIXTURE_REPLIES_KEY, all);
  }
  notify();
  return reply;
}

/* ------------------------------------------------------------------ helpful marks on fixture replies */

export function reviewerMarks(): ReviewerMarks {
  if (typeof window === "undefined") return memoryMarks;
  return readJson<ReviewerMarks>("local", MARKS_KEY, { helpful: [] });
}

export function markReplyHelpful(slug: string, replyId: string): void {
  const key = `${slug}:${replyId}`;
  const marks = reviewerMarks();
  if (marks.helpful.includes(key)) return;
  const next: ReviewerMarks = { helpful: [...marks.helpful, key] };
  if (typeof window === "undefined") {
    memoryMarks = next;
  } else {
    writeJson("local", MARKS_KEY, next);
  }
  notify();
}

export function isMarkedHelpful(slug: string, replyId: string): boolean {
  return reviewerMarks().helpful.includes(`${slug}:${replyId}`);
}

/* ------------------------------------------------------------------ the draft (08 §6 steps 5–6) */

export function saveDraft(draft: { text: string; helper: string | null }): void {
  const record: CommunityDraft = { ...draft, savedAtIso: new Date().toISOString() };
  if (typeof window === "undefined") {
    memoryDraft = record;
  } else {
    writeJson("session", DRAFT_KEY, record);
  }
}

export function readDraft(): CommunityDraft | null {
  if (typeof window === "undefined") return memoryDraft;
  return readJson<CommunityDraft | null>("session", DRAFT_KEY, null);
}

export function clearDraft(): void {
  if (typeof window === "undefined") {
    memoryDraft = null;
    return;
  }
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Test hygiene only. */
export function clearReviewerStoreForTests(): void {
  memoryPosts = [];
  memoryMarks = { helpful: [] };
  memoryDraft = null;
  memoryFixtureReplies = {};
  notify();
}
