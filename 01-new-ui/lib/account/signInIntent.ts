/*
 * THE SIGN-IN CONTINUATION INTENT — `FD-ACC-12` / `FD-ACC-13` / `FD-DAT-05`. LRG-ACCT-001.
 *
 * ══ THE CONTRACT, AS RATIFIED ══
 *
 * `FD-ACC-12`: the continuation contract is an allowlisted, expiring, SINGLE-USE intent, and only an opaque
 * nonce crosses the sign-in boundary. The stored intent holds the internal return path and the intended
 * action; the return path is validated against an allowlist derived from the route registry, so an open
 * redirect is not expressible. No filter value, no email, no action name — nothing but the nonce — ever
 * enters a URL.
 *
 * `FD-ACC-13`: an intent records WHAT KIND of action it carries. A `private` action (follow a game, save a
 * set) may complete automatically after sign-in; an `outward` action (anything another reader would see, or
 * anything that spends money) must NEVER auto-complete — the reader lands in a confirmation step. A restored
 * intent is evidence of what the reader wanted before authenticating, not consent to act publicly for them.
 *
 * ══ WHERE THE STORE LIVES, AND THE RECORDED DEVIATION ══
 *
 * `FD-ACC-12` says "server-side". In review mode there is no server session at all — the whole account layer
 * is the review data layer (Conflict 37), so the intent store lives with it: in-memory in Node, and
 * `sessionStorage` in the browser (deliberately NOT `localStorage` — an intent is a 15-minute artifact of one
 * browsing session and must not outlive it). What the ruling actually protects is fully preserved: the URL
 * carries only the nonce, the return path is allowlisted, expiry is enforced at consumption, and consumption
 * destroys the intent. When the api adapter exists, this module's storage moves server-side and its exports
 * do not change.
 *
 * ══ EXPIRY ══
 *
 * 15 minutes — the value the capability audit recommended (`ACCT-DEC-001` open item 3). Adopted here as the
 * review-mode default; the real service makes it configuration (`FD-DAT-18`'s principle).
 */

import { routeInventory } from "@/lib/registry/pageFamilyRegistry";

export type IntentKind =
  /** Continuity-only: follow, save, a preference. May complete automatically after sign-in (`FD-ACC-13`). */
  | "private"
  /** Visible to others or costly: post, purchase, send. NEVER auto-completes; lands in confirmation. */
  | "outward";

export interface SignInIntent {
  /** The internal path to return the reader to, optionally with a fragment. Allowlisted — see below. */
  returnTo: string;
  /** The action key the reader chose — e.g. `follow-game`, `save-ticket`. */
  action: string;
  /** The reader-facing label of what they chose, for the confirmation copy. */
  label: string;
  kind: IntentKind;
  /** Action context the continuation needs — game slug, state code. Never leaves the store. */
  context: Record<string, string>;
  expiresAtMs: number;
}

export const INTENT_TTL_MS = 15 * 60 * 1000;

/** The query parameter name. The nonce is the ONLY intent-related value permitted in a URL. */
export const INTENT_PARAM = "intent";

/* ------------------------------------------------------------------ allowlist */

/**
 * Is this path one the reader may be returned to?
 *
 * Derived from `routeInventory()` — the same registry that decides route existence (`FD-GATE-01`), so the
 * allowlist cannot drift from what the build serves. Account routes themselves are excluded: returning a
 * just-signed-in reader to /login is a loop, not a continuation.
 */
export function isAllowedReturnPath(returnTo: string): boolean {
  if (typeof returnTo !== "string" || !returnTo.startsWith("/")) return false;
  if (returnTo.startsWith("//")) return false; /* protocol-relative escape */
  const path = returnTo.split("#")[0].split("?")[0];
  return routeInventory().some((r) => r.route === path && r.family !== "account");
}

/* ------------------------------------------------------------------ storage */

const STORAGE_KEY = "lc-review-signin-intents-v1";

/** Node fallback (tests, scripted proofs). In the browser, sessionStorage is authoritative. */
const memoryIntents = new Map<string, SignInIntent>();

function readAll(): Map<string, SignInIntent> {
  if (typeof window === "undefined") return memoryIntents;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw) as Record<string, SignInIntent>)) : new Map();
  } catch {
    return new Map();
  }
}

function writeAll(intents: Map<string, SignInIntent>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(intents)));
  } catch {
    /* Denied storage degrades to no continuation — sign-in still works, the action is simply not resumed. */
  }
}

/* ------------------------------------------------------------------ the contract */

/**
 * Record an intent and return the opaque nonce — the only thing the /login URL may carry.
 *
 * Throws on a return path outside the allowlist: a bad path is a caller bug or an injection attempt, and
 * silently storing it would make the allowlist advisory.
 */
export function captureSignInIntent(input: {
  returnTo: string;
  action: string;
  label: string;
  kind: IntentKind;
  context?: Record<string, string>;
}): string {
  if (!isAllowedReturnPath(input.returnTo)) {
    throw new Error(
      `captureSignInIntent: "${input.returnTo}" is not an allowlisted internal return path (FD-ACC-12).`,
    );
  }
  const nonce = globalThis.crypto.randomUUID();
  const intents = readAll();
  intents.set(nonce, {
    returnTo: input.returnTo,
    action: input.action,
    label: input.label,
    kind: input.kind,
    context: input.context ?? {},
    expiresAtMs: Date.now() + INTENT_TTL_MS,
  });
  if (typeof window === "undefined") {
    /* memoryIntents IS the map returned by readAll() in Node; the set above already stored it. */
  } else {
    writeAll(intents);
  }
  return nonce;
}

/**
 * Consume an intent — SINGLE-USE by construction.
 *
 * Returns `null` for an unknown, expired or already-consumed nonce; the caller treats all three identically
 * (no continuation), because distinguishing them would leak whether a nonce ever existed.
 */
export function consumeSignInIntent(nonce: string): SignInIntent | null {
  const intents = readAll();
  const intent = intents.get(nonce) ?? null;
  if (intent) {
    intents.delete(nonce);
    writeAll(intents);
  }
  if (!intent) return null;
  if (Date.now() > intent.expiresAtMs) return null;
  /* Re-validated at consumption: the registry may have changed between capture and return. */
  if (!isAllowedReturnPath(intent.returnTo)) return null;
  return intent;
}

/** Look without consuming — for the login page to name the pending action. Expiry still applies. */
export function peekSignInIntent(nonce: string): SignInIntent | null {
  const intent = readAll().get(nonce) ?? null;
  if (!intent) return null;
  if (Date.now() > intent.expiresAtMs) return null;
  if (!isAllowedReturnPath(intent.returnTo)) return null;
  return intent;
}
