/*
 * THE REVIEW-MODE ACCOUNT STORE — INTERNAL. LRG-ACCT-001.
 *
 * ══ DO NOT IMPORT THIS FROM A COMPONENT ══
 *
 * This module is the review adapter's internals, in the same way `flagshipBffMock.ts` is the flagship seam's
 * internals. Components reach account state through `lib/account/session.ts` and nothing else — that is the
 * seam a real backend replaces, and `tests/account-foundation.test.ts` sweeps the component tree to keep it
 * true. If a component needs something this store knows, the need is expressed as a `session.ts` export.
 *
 * ══ WHAT "REVIEW MODE" MEANS HERE ══
 *
 * The founder instruction (Conflict 37) is to build the member area as a working product against a stand-in
 * data layer: "assume the database exists." So:
 *
 *   - In the BROWSER, accounts and the session persist to `localStorage`, so a member's sign-in, follows and
 *     saved sets survive a reload during review. That is state on the reviewer's own machine, not a service.
 *   - In NODE (tests, the scripted round-trip proof), the same store runs purely in memory.
 *   - EVERY record is stamped `dataMode: "review"` (`accountContract.ts`), so nothing here can be mistaken
 *     for production data (`CLAUDE.md` §14).
 *
 * ══ WHAT THIS IS NOT ══
 *
 * Not a schema, not a credential design, and not a security boundary. `FD-DAT-11` is explicit that real
 * enforcement happens on a server; browser storage is an advisory convenience for review. The secret digest
 * below exists only so a plain-text secret is never written to storage even in review — it is NOT a password
 * hashing scheme, and the real service must use a real one (and is recorded as API-phase work in Conflict 37).
 */

import type { AccountRecord, AccountSession, AccountDataMode } from "./accountContract";
import { assertAccountRecord } from "./accountContract";

export const REVIEW_DATA_MODE: AccountDataMode = "review";

/* ------------------------------------------------------------------ storage keys */

const ACCOUNTS_KEY = "lc-review-accounts-v1";
const SESSION_KEY = "lc-review-session-v1";

/* ------------------------------------------------------------------ in-memory state */

interface StoredCredential {
  accountId: string;
  /** SHA-256 hex of `${email}:${secret}`. Review-mode only — see the header. */
  digest: string;
}

interface StoreState {
  /** Keyed by lower-cased email. */
  accounts: Map<string, AccountRecord>;
  credentials: Map<string, StoredCredential>;
  session: AccountSession | null;
}

const state: StoreState = {
  accounts: new Map(),
  credentials: new Map(),
  session: null,
};

let hydrated = false;

/* ------------------------------------------------------------------ the seed */

/**
 * One seeded review member, so the founder can sign in without creating an account first.
 *
 * Seed credentials (review data, never a production secret): `reviewer@lotterycorner.test` / `review-corner`.
 * The seed follows nothing, saves nothing and has NO matches — a fabricated match would be synthetic content
 * presented as fact (`CLAUDE.md` §14), so the seed starts exactly as empty as a genuinely new account.
 */
export const SEED_EMAIL = "reviewer@lotterycorner.test";
export const SEED_SECRET = "review-corner";

/**
 * ══ THE REVIEW ADMIN CREDENTIAL PATTERN — Conflict 40 ══
 *
 * ONE seeded review admin account, so the founder can open the protected `/admin` console without creating
 * an account first. The pattern is exactly the member seed's: a documented `.test`-domain email and a plain
 * documented secret, verified through the same `storeVerifyCredentials` path every account uses — the admin
 * sign-in is therefore GENUINELY functional against this review store, not a hardcoded bypass. What makes
 * the account an admin is the `isAdmin: true` flag on its record (`accountContract.ts`), which no member
 * flow reads and no sign-up path can set: `storeCreateAccount` never writes the field, so the only admin in
 * review mode is this seed. These are REVIEW DATA, never production secrets — real credential management,
 * roles and server-side enforcement arrive with the API phase (Conflict 37/FD-DAT-11: browser storage is
 * advisory; a security boundary needs a server).
 */
export const SEED_ADMIN_EMAIL = "admin@lotterycorner.test";
export const SEED_ADMIN_SECRET = "admin-corner";

function seedAccount(): AccountRecord {
  return {
    dataMode: REVIEW_DATA_MODE,
    id: "review-account-0001",
    email: SEED_EMAIL,
    displayName: "Review Member",
    createdAtIso: "2026-08-11T00:00:00.000Z",
    verified: false,
    preferences: { notifications: {}, page: {} },
    followedGames: [],
    followedStates: [],
    savedNumberSets: [],
    matches: [],
  };
}

/** The one review admin (Conflict 40). As empty as the member seed — the flag is the entire difference. */
function seedAdminAccount(): AccountRecord {
  return {
    dataMode: REVIEW_DATA_MODE,
    id: "review-account-admin-0001",
    email: SEED_ADMIN_EMAIL,
    displayName: "Review Admin",
    createdAtIso: "2026-08-12T00:00:00.000Z",
    verified: false,
    isAdmin: true,
    preferences: { notifications: {}, page: {} },
    followedGames: [],
    followedStates: [],
    savedNumberSets: [],
    matches: [],
  };
}

/* ------------------------------------------------------------------ digests */

/** Review-mode digest so no plain secret ever reaches storage. NOT a credential design — see the header. */
export async function secretDigest(email: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${secret}`);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------------ persistence */

function browserStorage(): Storage | null {
  /* Server rendering has no storage, and Shell §33 REQUIRES that it does not: member state must never be
     baked into cached public page HTML, so the server side of this store is deliberately session-less. */
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null; /* Storage can be denied; review mode degrades to in-memory. */
  }
}

function persist(): void {
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify({
        accounts: [...state.accounts.values()],
        credentials: [...state.credentials.entries()],
      }),
    );
    if (state.session) storage.setItem(SESSION_KEY, JSON.stringify(state.session));
    else storage.removeItem(SESSION_KEY);
  } catch {
    /* Quota or privacy mode: review state stays in memory for the tab's lifetime. */
  }
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;

  /* The seeds exist in every environment, before anything is read back. */
  const seed = seedAccount();
  state.accounts.set(seed.email, seed);
  const adminSeed = seedAdminAccount();
  state.accounts.set(adminSeed.email, adminSeed);

  const storage = browserStorage();
  if (!storage) return;

  try {
    const raw = storage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        accounts?: unknown[];
        credentials?: [string, StoredCredential][];
      };
      for (const candidate of parsed.accounts ?? []) {
        /* Storage is writable by anything in the page: assert before trusting, discard on failure. */
        try {
          assertAccountRecord(candidate);
          state.accounts.set(candidate.email.toLowerCase(), candidate);
        } catch {
          /* A malformed record is dropped, never repaired into something renderable. */
        }
      }
      for (const [email, cred] of parsed.credentials ?? []) {
        if (typeof email === "string" && typeof cred?.digest === "string") {
          state.credentials.set(email.toLowerCase(), cred);
        }
      }
    }
    const rawSession = storage.getItem(SESSION_KEY);
    if (rawSession) {
      const s = JSON.parse(rawSession) as AccountSession;
      if (s && typeof s.accountId === "string" && s.dataMode === "review") state.session = s;
    }
  } catch {
    /* Unreadable state is ignored; the seed alone remains. */
  }
}

/* ------------------------------------------------------------------ change notification */

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const l of listeners) l();
}

export function storeSubscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------------------------------------------ reads */

export function storeGetSession(): AccountSession | null {
  hydrate();
  return state.session;
}

export function storeGetAccountById(id: string): AccountRecord | null {
  hydrate();
  for (const a of state.accounts.values()) if (a.id === id) return a;
  return null;
}

export function storeGetAccountByEmail(email: string): AccountRecord | null {
  hydrate();
  return state.accounts.get(email.toLowerCase()) ?? null;
}

/* ------------------------------------------------------------------ writes */

export async function storeCreateAccount(input: {
  email: string;
  displayName: string;
  secret: string;
}): Promise<AccountRecord> {
  hydrate();
  const email = input.email.toLowerCase();
  const account: AccountRecord = {
    dataMode: REVIEW_DATA_MODE,
    id: `review-account-${globalThis.crypto.randomUUID()}`,
    email,
    displayName: input.displayName,
    createdAtIso: new Date().toISOString(),
    verified: false,
    preferences: { notifications: {}, page: {} },
    followedGames: [],
    followedStates: [],
    savedNumberSets: [],
    matches: [],
  };
  assertAccountRecord(account);
  state.accounts.set(email, account);
  state.credentials.set(email, { accountId: account.id, digest: await secretDigest(email, input.secret) });
  persist();
  notify();
  return account;
}

export async function storeVerifyCredentials(email: string, secret: string): Promise<AccountRecord | null> {
  hydrate();
  const key = email.toLowerCase();
  const account = state.accounts.get(key);
  if (!account) return null;
  const digest = await secretDigest(key, secret);
  const cred = state.credentials.get(key);
  if (cred) return cred.digest === digest ? account : null;
  /* The seed accounts have no stored credential rows; their secrets are the documented seed constants. */
  if (key === SEED_EMAIL) return secret === SEED_SECRET ? account : null;
  if (key === SEED_ADMIN_EMAIL) return secret === SEED_ADMIN_SECRET ? account : null;
  return null;
}

export function storeSetSession(session: AccountSession | null): void {
  hydrate();
  state.session = session;
  persist();
  notify();
}

/** Replace an account record wholesale. The session seam owns WHAT changes; this owns that it persists. */
export function storeUpdateAccount(next: AccountRecord): void {
  hydrate();
  assertAccountRecord(next);
  state.accounts.set(next.email.toLowerCase(), next);
  persist();
  notify();
}

/** Test-only: return the store to its seeded state. Named so a grep for it in app code fails review. */
export function storeResetForTests(): void {
  state.accounts.clear();
  state.credentials.clear();
  state.session = null;
  listeners.clear();
  hydrated = false;
}
