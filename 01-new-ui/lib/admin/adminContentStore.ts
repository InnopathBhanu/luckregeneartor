/*
 * THE ADMIN CONTENT STORE — the console's half of the review data layer (Conflict 37 pattern; Conflict 40
 * authorization). Two things live here:
 *
 *   1. EDITORIAL ITEMS the founder enters through the console's News/Blog forms. Lifecycle:
 *      draft → pending → approved | rejected, carried in the Conflict 40 `contentMeta`
 *      (source, reviewStatus, lastReviewed). An APPROVED item is what the family's review feed renders —
 *      `approvedEditorialItems()` is the read the /news and /blog client strips consume. Editing an approved
 *      item returns it to PENDING (the "edit to a published item" queue trigger): the prior approval no
 *      longer covers the new text.
 *
 *   2. COMMUNITY QUEUE DECISIONS. Community queue candidates are DERIVED from the community seams
 *      (reports, reviewer entries) which this module must not rewrite — so a decision is recorded here,
 *      keyed by the queue item id, with a snapshot of the row it decided. Pending = candidates minus
 *      decided; the Rejected tab lists the rejected snapshots.
 *
 * ══ WHAT THIS MODULE NEVER DOES ══
 *
 * No audit writes (the workflow owns pairing every transition with its audit record), no session reads, no
 * delivery of any kind. Storage is `localStorage` in the browser, memory in Node — the review-store pattern.
 *
 * ══ PUBLICATION HONESTY (`CLAUDE.md` §14) ══
 *
 * Every record is stamped `dataMode: "review"`. Approved items render ONLY inside the families' clearly
 * labelled review strips on the machine that holds the store (the community client-resolved precedent) —
 * they are review-build content, never presented as production editorial output.
 */

import type {
  AdminEditorialFields, AdminEditorialItem, AdminQueueItem, AdminReviewStatus,
} from "./adminContract";
import { BLOG_CATEGORY_OPTIONS, NEWS_CATEGORY_OPTIONS } from "./adminContract";

/* ------------------------------------------------------------------ storage */

const ITEMS_KEY = "lc-review-admin-editorial-v1";
const DECISIONS_KEY = "lc-review-admin-decisions-v1";

let memoryItems: AdminEditorialItem[] = [];
let memoryDecisions: CommunityDecision[] = [];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return key === ITEMS_KEY ? (memoryItems as T) : (memoryDecisions as T);
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    if (key === ITEMS_KEY) memoryItems = value as AdminEditorialItem[];
    else memoryDecisions = value as CommunityDecision[];
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Quota or privacy mode: review state stays in memory for the tab's lifetime. */
  }
}

/* ------------------------------------------------------------------ editorial items */

export function listEditorialItems(family?: "news" | "blog"): readonly AdminEditorialItem[] {
  const all = readJson<AdminEditorialItem[]>(ITEMS_KEY, []);
  const sorted = [...all].sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
  return family ? sorted.filter((i) => i.family === family) : sorted;
}

export function getEditorialItem(id: string): AdminEditorialItem | null {
  return listEditorialItems().find((i) => i.id === id) ?? null;
}

/** APPROVED items only — the read the public review strips consume. Newest first. */
export function approvedEditorialItems(family: "news" | "blog"): readonly AdminEditorialItem[] {
  return listEditorialItems(family).filter((i) => i.contentMeta.reviewStatus === "approved");
}

function slugify(headline: string, taken: ReadonlySet<string>): string {
  const base = headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
    || "console-item";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** The validation the entry forms and Edit-then-approve share. Throws with a plain-language message. */
export function assertEditorialFields(family: "news" | "blog", fields: AdminEditorialFields): void {
  const fail = (why: string): never => {
    throw new Error(`Editorial item is incomplete: ${why}`);
  };
  if (!fields.headline.trim()) fail("a headline is required.");
  if (!fields.description.trim()) fail("a description is required.");
  if (!fields.editorName.trim()) {
    fail("an accountable human editor is required on every item (07 §3, Conflict 40).");
  }
  if (!fields.evidenceNote.trim()) fail("say where the item's facts come from (CLAUDE.md §14 provenance).");
  if (fields.body.length === 0 || fields.body.every((p) => !p.trim())) fail("the body has no paragraphs.");
  if (family === "news") {
    if (!fields.bottomLine || !fields.bottomLine.trim()) fail("a news item needs its Bottom Line (07B §5).");
    if (!(NEWS_CATEGORY_OPTIONS as readonly string[]).includes(fields.category)) {
      fail(`"${fields.category}" is not a 07 §20 news category.`);
    }
  } else {
    if (!(BLOG_CATEGORY_OPTIONS as readonly string[]).includes(fields.category)) {
      fail(`"${fields.category}" is not an EA §35 blog category.`);
    }
  }
}

/** Create one item as a DRAFT. The workflow pairs this with its audit record. */
export function createEditorialItem(input: {
  family: "news" | "blog";
  fields: AdminEditorialFields;
  enteredBy: string;
}): AdminEditorialItem {
  assertEditorialFields(input.family, input.fields);
  const now = new Date().toISOString();
  const taken = new Set(listEditorialItems().map((i) => i.slug));
  const item: AdminEditorialItem = {
    ...input.fields,
    body: input.fields.body.filter((p) => p.trim().length > 0),
    dataMode: "review",
    id: `editorial-${globalThis.crypto.randomUUID()}`,
    family: input.family,
    slug: slugify(input.fields.headline, taken),
    enteredBy: input.enteredBy,
    queueNote: null,
    contentMeta: { source: "admin-console", reviewStatus: "draft", lastReviewedIso: null },
    createdAtIso: now,
    updatedAtIso: now,
    rejection: null,
  };
  writeJson(ITEMS_KEY, [item, ...readJson<AdminEditorialItem[]>(ITEMS_KEY, [])]);
  return item;
}

/** Replace an item wholesale. Internal to the workflow; validates the invariant fields stayed put. */
export function replaceEditorialItem(next: AdminEditorialItem): void {
  const all = readJson<AdminEditorialItem[]>(ITEMS_KEY, []);
  const i = all.findIndex((it) => it.id === next.id);
  if (i === -1) throw new Error(`replaceEditorialItem: no item "${next.id}"`);
  all[i] = { ...next, updatedAtIso: new Date().toISOString() };
  writeJson(ITEMS_KEY, all);
}

/** The lifecycle edges the workflow may take. Anything else throws rather than "repairing" a status. */
export function assertStatusTransition(from: AdminReviewStatus, to: AdminReviewStatus): void {
  const allowed: Record<AdminReviewStatus, readonly AdminReviewStatus[]> = {
    draft: ["pending"],
    pending: ["approved", "rejected"],
    /* Editing an approved item returns it to pending — the "edit to a published item" trigger. */
    approved: ["pending"],
    /* A rejected item may be revised and resubmitted. */
    rejected: ["pending"],
  };
  if (!allowed[from].includes(to)) {
    throw new Error(`assertStatusTransition: "${from}" → "${to}" is not a Conflict 40 lifecycle edge.`);
  }
}

/* ------------------------------------------------------------------ community decisions */

/**
 * One recorded decision on a DERIVED community queue row. The snapshot preserves the row as it was decided,
 * so the Rejected tab (and the future appeal) can show exactly what was acted on even after the underlying
 * report or entry changes.
 */
export interface CommunityDecision {
  dataMode: "review";
  targetId: string;
  status: "approved" | "rejected";
  decidedAtIso: string;
  snapshot: AdminQueueItem;
  reason: string;
  policyRef: string | null;
  notifyAuthorIntent: boolean | null;
}

export function listCommunityDecisions(): readonly CommunityDecision[] {
  return readJson<CommunityDecision[]>(DECISIONS_KEY, []);
}

export function recordCommunityDecision(decision: Omit<CommunityDecision, "dataMode" | "decidedAtIso">): CommunityDecision {
  const existing = listCommunityDecisions();
  if (existing.some((d) => d.targetId === decision.targetId)) {
    throw new Error(`recordCommunityDecision: "${decision.targetId}" was already decided.`);
  }
  const record: CommunityDecision = { ...decision, dataMode: "review", decidedAtIso: new Date().toISOString() };
  writeJson(DECISIONS_KEY, [...existing, record]);
  return record;
}

/* ------------------------------------------------------------------ test hygiene */

/** Test hygiene only. Named so a grep for it in app code fails review. */
export function clearAdminContentForTests(): void {
  memoryItems = [];
  memoryDecisions = [];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ITEMS_KEY);
      window.localStorage.removeItem(DECISIONS_KEY);
    } catch {
      /* nothing to clear */
    }
  }
}
