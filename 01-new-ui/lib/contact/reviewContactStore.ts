/*
 * THE REVIEW-MODE CONTACT STORE — Conflict 38 condition 3.
 *
 * The same review-adapter shape as `lib/account/reviewAccountStore.ts`: in the BROWSER, submissions persist
 * to `localStorage` so the founder can submit, reload and still see the record; in NODE (tests), the store
 * runs purely in memory. Every record is stamped `dataMode: "review"`.
 *
 * ══ THE ADMIN-PHASE SEAM ══
 *
 * `submitContactMessage` is the public form's ONLY write, and it always writes `status: "new"`.
 * `listContactSubmissions` is the read the admin phase (Conflict 40: a protected area inside this app)
 * will consume — an inbox is a list of records ordered newest-first plus status transitions, and the
 * transitions stay out of this module until the admin task exists, so the public surface cannot grow an
 * unreviewed moderation feature by accident.
 *
 * ══ WHAT THIS NEVER DOES ══
 *
 * No fetch, no email, no third-party call, no delivery of any kind — and therefore the UI above it must
 * never say "we will get back to you". The record is RECORDED, and that is the whole truthful claim.
 */

import type { ContactSubmission, ContactSubmissionStatus } from "./contactContract";
import { assertContactSubmission } from "./contactContract";

const SUBMISSIONS_KEY = "lc-review-contact-submissions-v1";

let submissions: ContactSubmission[] = [];
let hydrated = false;

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null; /* Storage can be denied; review mode degrades to in-memory. */
  }
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  const storage = browserStorage();
  if (!storage) return;
  try {
    const raw = storage.getItem(SUBMISSIONS_KEY);
    if (!raw) return;
    for (const candidate of JSON.parse(raw) as unknown[]) {
      try {
        assertContactSubmission(candidate);
        submissions.push(candidate);
      } catch {
        /* A malformed record is dropped, never repaired into something readable. */
      }
    }
  } catch {
    /* Unreadable state is ignored. */
  }
}

function persist(): void {
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch {
    /* Quota or privacy mode: review state stays in memory for the tab's lifetime. */
  }
}

/** The public form's only write. Stamps id, instant, review mode and `status: "new"`. */
export function submitContactMessage(input: {
  name?: string;
  email: string;
  message: string;
}): ContactSubmission {
  hydrate();
  const record: ContactSubmission = {
    dataMode: "review",
    id: `review-contact-${globalThis.crypto.randomUUID()}`,
    name: input.name?.trim() ? input.name.trim() : null,
    email: input.email.trim(),
    message: input.message.trim(),
    submittedAtIso: new Date().toISOString(),
    status: "new",
  };
  assertContactSubmission(record);
  submissions = [record, ...submissions];
  persist();
  return record;
}

/** The admin-phase read seam. Newest first. */
export function listContactSubmissions(): readonly ContactSubmission[] {
  hydrate();
  return submissions;
}

/**
 * THE ADMIN-PHASE TRANSITION — the header above promised transitions would stay out of this module "until
 * the admin task exists"; that task is Conflict 40, and this is its one write. The lifecycle moves FORWARD
 * only (new → read → resolved): a submission is never un-read or un-resolved, so the inbox cannot quietly
 * lose the fact that a human saw it. Only the admin console calls this (through lib/admin/adminWorkflow.ts,
 * which pairs every transition with an audit record); the public form still writes `status: "new"` and
 * nothing else.
 */
export function transitionContactSubmission(id: string, next: ContactSubmissionStatus): ContactSubmission {
  hydrate();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) throw new Error(`transitionContactSubmission: no submission "${id}"`);
  const current = submissions[index];
  const forward: Record<ContactSubmissionStatus, readonly ContactSubmissionStatus[]> = {
    new: ["read", "resolved"],
    read: ["resolved"],
    resolved: [],
  };
  if (!forward[current.status].includes(next)) {
    throw new Error(`transitionContactSubmission: "${current.status}" → "${next}" is not a forward move.`);
  }
  const updated: ContactSubmission = { ...current, status: next };
  assertContactSubmission(updated);
  submissions = [...submissions];
  submissions[index] = updated;
  persist();
  return updated;
}

/** Test-only: return the store to empty. Named so a grep for it in app code fails review. */
export function contactStoreResetForTests(): void {
  submissions = [];
  hydrated = false;
}
