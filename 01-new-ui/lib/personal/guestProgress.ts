/*
 * GUEST PROGRESS — the anonymous continuity shell. Global Shell §12. LRG-PERS-001.
 *
 * ══ WHAT THIS IS ══
 *
 * A small device-local record of what an anonymous reader was in the middle of: games they recently viewed,
 * an unfinished calculator input, a drafted composer text. It lives in browser storage and NOWHERE ELSE —
 * there is no account behind it, no upload, no sync, no backup. Every surface that shows it must say so in
 * plain words (`GUEST_STORAGE_SENTENCE`), offer a Clear control, and never imply a cloud copy exists.
 *
 * ══ WHY IT EXISTS ══
 *
 * It is the honest half of "registration follows demonstrated value" (Constitution): the reader accumulates
 * something worth preserving BEFORE being asked for an account, and the prompt to create one
 * (`GUEST_KEEP_PROMPT`) appears beside the thing it would preserve — never as an interruption.
 *
 * ══ SERVER DISCIPLINE ══
 *
 * Same rule as the session seam (Shell §33): on a rendering server there is no storage, `readGuestProgress`
 * returns the frozen empty list, and the `GuestProgress` component renders nothing — so no cached public
 * page can ever contain a device's progress.
 */

/* ------------------------------------------------------------------ wording, exported for tests */

/** MUST be rendered wherever guest progress is shown. Device-local truth, stated plainly. */
export const GUEST_STORAGE_SENTENCE =
  "Stored on this device only — clearing your browser removes it.";

/** The registration prompt, shown beside the stored items. Links to /signup; never a wall. */
export const GUEST_KEEP_PROMPT = "Create a free account to keep these";

export const GUEST_CLEAR_LABEL = "Clear saved progress";

/* ------------------------------------------------------------------ shape */

export type GuestProgressKind = "viewed-game" | "calculator-input" | "composer-draft";

export interface GuestProgressEntry {
  id: string;
  kind: GuestProgressKind;
  /** Reader-facing line — "Florida lottery results", "Tax estimate: $100,000,000 advertised…". */
  label: string;
  detail?: string;
  savedAtIso: string;
}

const STORAGE_KEY = "lc.guestProgress.v1";
const MAX_ENTRIES = 8;

/* ------------------------------------------------------------------ store */

const EMPTY: readonly GuestProgressEntry[] = Object.freeze([]);
let cache: readonly GuestProgressEntry[] = EMPTY;
/**
 * The raw string behind `cache`. `undefined` means "not cached" — it can never equal a stored read, because
 * `getItem` returns `string | null`. The distinction matters: invalidating with `null` once made a CLEARED
 * store (`raw === null`) look like a cache hit and hand back the stale pre-clear list, so the guest module
 * kept rendering entries the reader had just deleted.
 */
let cacheRaw: string | null | undefined = undefined;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; /* Storage denied (privacy mode) — guest progress simply does not exist. */
  }
}

function isEntry(v: unknown): v is GuestProgressEntry {
  const e = v as GuestProgressEntry;
  return (
    typeof e === "object" && e !== null
    && typeof e.id === "string"
    && (e.kind === "viewed-game" || e.kind === "calculator-input" || e.kind === "composer-draft")
    && typeof e.label === "string" && e.label.length > 0
    && typeof e.savedAtIso === "string"
  );
}

/**
 * Snapshot read, referentially stable for `useSyncExternalStore`: the parsed list is re-created only when
 * the raw stored string actually changed. A malformed record is discarded, never repaired — the same
 * discipline as `assertAccountRecord`.
 */
export function readGuestProgress(): readonly GuestProgressEntry[] {
  const s = storage();
  if (!s) return EMPTY;
  let raw: string | null;
  try {
    raw = s.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  if (!raw) {
    cache = EMPTY;
    return cache;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cache = Array.isArray(parsed) ? Object.freeze(parsed.filter(isEntry)) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

/** The server snapshot: always empty. There is no device on a server. */
export function readGuestProgressServer(): readonly GuestProgressEntry[] {
  return EMPTY;
}

export function subscribeGuestProgress(listener: () => void): () => void {
  listeners.add(listener);
  /* Cross-tab: another tab's write fires `storage`; re-read and notify. */
  const onStorage = (ev: StorageEvent) => {
    if (ev.key === STORAGE_KEY) notify();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function notify(): void {
  for (const l of listeners) l();
}

function write(entries: readonly GuestProgressEntry[]): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    return; /* Quota or privacy failure: progress is a convenience, never worth an error surface. */
  }
  cacheRaw = undefined; /* Invalidate so the next read re-parses. */
  notify();
}

/**
 * Record one piece of progress. `viewed-game` entries de-duplicate by label (a revisit moves the entry to
 * the front rather than repeating it); drafts replace any previous draft of the same kind.
 */
export function recordGuestProgress(input: {
  kind: GuestProgressKind;
  label: string;
  detail?: string;
}): void {
  if (!storage()) return;
  const existing = readGuestProgress().filter((e) =>
    input.kind === "viewed-game" ? !(e.kind === "viewed-game" && e.label === input.label) : e.kind !== input.kind,
  );
  const entry: GuestProgressEntry = {
    id: `gp-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    kind: input.kind,
    label: input.label,
    ...(input.detail !== undefined ? { detail: input.detail } : {}),
    savedAtIso: new Date().toISOString(),
  };
  write([entry, ...existing]);
}

/** The reader's Clear control. Removes everything, immediately, on this device. */
export function clearGuestProgress(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  cacheRaw = undefined;
  notify();
}
