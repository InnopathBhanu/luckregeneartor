/*
 * THE ADMIN AUDIT TRAIL — Conflict 40: "full audit trail (who/what/when/action/reason)".
 *
 * ══ APPEND-ONLY, BY CONSTRUCTION ══
 *
 * This module exports exactly two operations on the trail: `appendAuditRecord` and reads. There is no
 * update, no delete and no truncation export (the test-hygiene reset is named so a grep for it in app code
 * fails review, per the review-store convention). A trail an action can rewrite is not an audit trail.
 *
 * ══ WHERE IT LIVES IN REVIEW MODE ══
 *
 * The review data layer (Conflict 37 — "assume the database exists"): `localStorage` in the browser so the
 * founder's console session survives a reload, memory in Node for tests. The real service replaces the
 * storage half; the record shape and the append/read seam are what stay.
 *
 * ══ THE FIVE REQUIRED FIELDS ══
 *
 * `appendAuditRecord` THROWS on a record missing who, what, action or reason (when is stamped here, so it
 * cannot be missing or forged). A transition that cannot say who did what and why must not happen at all —
 * the workflow calls this BEFORE committing a transition, so a refused audit refuses the action.
 */

import type { AdminAuditRecord, AdminSurface } from "./adminContract";
import { ADMIN_APPEAL_ROUTE } from "./adminContract";

const AUDIT_KEY = "lc-review-admin-audit-v1";

/** Node fallback (tests). In the browser, localStorage is authoritative. */
let memoryTrail: AdminAuditRecord[] = [];

function readTrail(): AdminAuditRecord[] {
  if (typeof window === "undefined") return memoryTrail;
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    return raw ? (JSON.parse(raw) as AdminAuditRecord[]) : [];
  } catch {
    return [];
  }
}

function writeTrail(trail: AdminAuditRecord[]): void {
  if (typeof window === "undefined") {
    memoryTrail = trail;
    return;
  }
  try {
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(trail));
  } catch {
    /* Quota or privacy mode: review state stays in memory for the tab's lifetime. */
  }
}

/** The append input: everything but the store-stamped fields. */
export type AuditInput = Omit<AdminAuditRecord, "dataMode" | "id" | "whenIso">;

/**
 * Append one record. Throws when any of the required fields is empty — the caller treats that as the
 * transition failing, never as "log later".
 */
export function appendAuditRecord(input: AuditInput): AdminAuditRecord {
  for (const field of ["who", "what", "action", "reason"] as const) {
    const value = input[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`appendAuditRecord: "${field}" is required on every audit record (Conflict 40).`);
    }
  }
  if (typeof input.targetId !== "string" || input.targetId.length === 0) {
    throw new Error("appendAuditRecord: targetId is required so the trail names what was acted on.");
  }
  const record: AdminAuditRecord = {
    ...input,
    dataMode: "review",
    id: `audit-${globalThis.crypto.randomUUID()}`,
    whenIso: new Date().toISOString(),
    appealRoute: input.appealRoute || ADMIN_APPEAL_ROUTE,
  };
  writeTrail([...readTrail(), record]);
  return record;
}

/** The trail, newest first, optionally filtered by surface — the console's audit view. */
export function listAuditRecords(filter?: { surface?: AdminSurface }): readonly AdminAuditRecord[] {
  const all = [...readTrail()].sort((a, b) => b.whenIso.localeCompare(a.whenIso));
  if (!filter?.surface) return all;
  return all.filter((r) => r.surface === filter.surface);
}

/** Test hygiene only. Named so a grep for it in app code fails review. */
export function clearAuditTrailForTests(): void {
  memoryTrail = [];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(AUDIT_KEY);
    } catch {
      /* nothing to clear */
    }
  }
}
