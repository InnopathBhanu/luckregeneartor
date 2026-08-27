/*
 * THE COMMUNITY MODERATION SEAM — 08 §22 (moderation and safety), 08B §15 (visible states), FE-13.
 *
 * ══ WHAT THIS IS ══
 *
 * The typed report queue the FE-13 report control writes into, and the read the ADMIN PHASE consumes
 * (Conflict 40 authorized the admin area as a protected area inside this app; "maintain forum approval" is on
 * its scope). This module owns the queue's shape so the admin phase builds against a contract, not a guess.
 *
 * ══ WHERE IT LIVES IN REVIEW MODE ══
 *
 * The review data layer (Conflict 37 — "assume the database exists"): `localStorage` in the browser so a
 * reviewer's reports survive a reload, memory in Node for tests. The real service replaces the storage half;
 * the types and the two functions are the seam that stays.
 *
 * ══ WHAT 08 §22 BINDS ══
 *
 *   - The report categories are EXACTLY the §22 list (`REPORT_CATEGORIES` in the contract).
 *   - Every future moderation ACTION carries reason + policy + appeal route. The queue item records where the
 *     appeal route lives so the admin phase cannot ship an action without one.
 *   - Reporting is a SAFETY control, so it works signed-out: a reporter identity is recorded when a session
 *     exists and is `null` otherwise — requiring sign-in to report abuse would protect the abuse.
 */

import { REPORT_CATEGORIES } from "./communityContract";

export type ReportTargetKind = "entry" | "reply" | "member";

export interface CommunityReportInput {
  targetKind: ReportTargetKind;
  /** The entry slug, or the member username for a profile report. */
  targetSlug: string;
  /** The reply id, when a specific reply is reported. */
  replyId: string | null;
  /** One of the 08 §22 categories, verbatim. */
  category: string;
  /** Optional reporter note. Never required — a one-tap report must be possible. */
  detail: string;
  /** The signed-in reviewer's display name, or null for an anonymous report. */
  reporter: string | null;
}

export interface ModerationQueueItem extends CommunityReportInput {
  id: string;
  reportedAtIso: string;
  /** The admin phase moves this through review. Nothing in the public UI ever changes it. */
  status: "OPEN";
  /** Where the eventual action's reason/policy/appeal lives — 08 §22's required trio, pre-wired. */
  policy: typeof MODERATION_POLICY;
}

/**
 * The 08 §22 action contract the admin phase must satisfy: every action carries a reason, names the policy,
 * and offers an appeal route. Recorded on every queue item so the requirement travels with the report.
 */
export const MODERATION_POLICY = Object.freeze({
  requirement: "Every moderation action carries a reason, the policy applied, and an appeal route (08 §22).",
  appealRoute: "/contact-us",
});

/* ------------------------------------------------------------------ storage */

const QUEUE_KEY = "lc-review-community-moderation-queue-v1";

/** Node fallback (tests). In the browser, localStorage is authoritative. */
let memoryQueue: ModerationQueueItem[] = [];

function readQueue(): ModerationQueueItem[] {
  if (typeof window === "undefined") return memoryQueue;
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as ModerationQueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: ModerationQueueItem[]): void {
  if (typeof window === "undefined") {
    memoryQueue = queue;
    return;
  }
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* Denied storage degrades to an unrecorded report in review mode. The real service is server-side. */
  }
}

/* ------------------------------------------------------------------ the seam */

/**
 * File one report. Throws on a category outside the 08 §22 list — the control renders exactly that list, so
 * an unknown category is a caller bug, not a user choice.
 */
export function submitCommunityReport(input: CommunityReportInput): ModerationQueueItem {
  if (!REPORT_CATEGORIES.includes(input.category)) {
    throw new Error(`submitCommunityReport: "${input.category}" is not an 08 §22 moderation category.`);
  }
  const item: ModerationQueueItem = {
    ...input,
    id: `report-${globalThis.crypto.randomUUID()}`,
    reportedAtIso: new Date().toISOString(),
    status: "OPEN",
    policy: MODERATION_POLICY,
  };
  writeQueue([...readQueue(), item]);
  return item;
}

/** The queue, newest first — what the admin phase consumes. */
export function readModerationQueue(): readonly ModerationQueueItem[] {
  return [...readQueue()].sort((a, b) => b.reportedAtIso.localeCompare(a.reportedAtIso));
}

/** Test hygiene only. */
export function clearModerationQueueForTests(): void {
  memoryQueue = [];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(QUEUE_KEY);
    } catch {
      /* nothing to clear */
    }
  }
}
