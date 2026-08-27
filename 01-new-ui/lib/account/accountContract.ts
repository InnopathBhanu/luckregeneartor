/*
 * THE ACCOUNT DOMAIN CONTRACT — LRG-ACCT-001.
 *
 * Authority: the Tier-1 founder instruction of 2026-08-11 (source-conflicts.md Conflict 37 — "finish the entire
 * site; assume the database exists; perks for logged-in users"), `ACCT-DEC-001` `FD-ACC-01`/`FD-ACC-02`/
 * `FD-ACC-03`/`FD-ACC-15`, `CLAUDE.md` §15.
 *
 * ══ WHAT THIS FILE IS ══
 *
 * One typed description of the free LotteryCorner Account, and the ONLY place its shape is written down. It
 * follows the flagship BFF discipline (`lib/flagship/bff/flagshipBffContract.ts`): the entry seam returns this
 * and nothing else, components consume this and nothing else, and swapping the review adapter for a real
 * `02-new-api` call is a change of one module with the compiler enforcing shape-completeness.
 *
 * ══ IDENTITY IS NOT ENTITLEMENT, BY CONSTRUCTION — `FD-ACC-01`/`FD-ACC-02`/`FD-ACC-03` ══
 *
 * `AccountRecord` answers "who is this" and "what have they kept". It carries NO subscription field, NO tier,
 * NO plan and NO Insider anything — the legacy `insider_user` conflation of identity and paid membership must
 * not be reproduced, and the way it is not reproduced is that the type cannot express it. "What may this
 * account do" is a separate question answered by `accountCapabilities()`, which today returns the same free
 * continuity capabilities for every account, because that is the whole product (`FD-ACC-15`, `FD-ACC-16`).
 *
 * When the real API is designed (`CLAUDE.md` §15) these concerns stay separable:
 *
 *   domain data      → `AccountRecord` minus the presentation conveniences
 *   entitlement      → `accountCapabilities()` — its own lookup, never a field on the identity
 *   presentation     → what a page derives from these; never stored back
 *   provenance       → `dataMode` below; the API replaces it with real field-level provenance
 *
 * ══ EVERY RECORD SAYS WHAT IT IS ══
 *
 * `dataMode: "review"` is a required field on every record the review store produces, so no saved number, no
 * follow and no preference can ever be mistaken for production data (`CLAUDE.md` §14). The api adapter, when it
 * exists, stamps `"api"` instead.
 */

/** Where a record came from. The review store stamps every record it creates. */
export type AccountDataMode = "review" | "api";

/* ------------------------------------------------------------------ preferences */

/**
 * One notification preference — `FD-ACC-18`.
 *
 * Each is its OWN affirmative choice with its OWN frequency, recorded at the moment the reader made it.
 * Recording a preference is NOT a delivery promise: `FD-ACC-11` stands — no email, push or service-worker
 * channel exists, so no surface may state or imply that anything is sent. The preference exists so that the
 * choice survives until a channel does, and so Settings can show and disable it (`FD-ACC-18`'s disable path).
 */
export interface NotificationPreference {
  /** The option key the reader chose — e.g. `draw-reminder`, `win-alert`. */
  key: string;
  /** The reader-facing label at the time of choice. */
  label: string;
  /** The frequency the option declared BEFORE it was chosen — e.g. "Up to once per drawing". */
  frequency: string;
  /** True only by the reader's own affirmative act. Never a side effect of signing in or following. */
  optedIn: boolean;
  chosenAtIso: string;
  dataMode: AccountDataMode;
}

export interface AccountPreferences {
  /** Keyed by option key. `FD-ACC-18`: per-option, never a blanket switch. */
  notifications: Record<string, NotificationPreference>;
  /** Page personalisation and capability opt-ins, keyed by capability key. Value is a plain description. */
  page: Record<string, { value: string; savedAtIso: string; dataMode: AccountDataMode }>;
}

/* ------------------------------------------------------------------ saved things */

export interface SavedNumberSet {
  id: string;
  /** The game the set belongs to — `powerball`, `fl/pick-3`. */
  gameRef: string;
  /** The reader's own name for the line — "Mum's numbers". */
  label: string;
  main: readonly number[];
  special: number | null;
  savedAtIso: string;
  dataMode: AccountDataMode;
}

/**
 * A match between a saved set and a published drawing.
 *
 * ALWAYS EMPTY in the review seed and never fabricated: a match is a claim about a real drawing against a
 * reader's real numbers, and `CLAUDE.md` §14 forbids synthesising one. The shape exists so the member menu can
 * render its honest empty state and so the future matching service has a contract to fill.
 */
export interface MatchRecord {
  id: string;
  gameRef: string;
  drawDateIso: string;
  savedSetId: string;
  matchedMain: readonly number[];
  matchedSpecial: boolean;
  dataMode: AccountDataMode;
}

/* ------------------------------------------------------------------ the account */

export interface AccountRecord {
  dataMode: AccountDataMode;
  id: string;
  email: string;
  displayName: string;
  createdAtIso: string;
  /**
   * Verification is LAZY — the account is usable immediately after sign-up.
   *
   * Where verification WOULD be required, recorded now so the boundary is designed rather than improvised:
   * before the reader's FIRST OUTWARD-FACING act — a public community post, a reply, anything another reader
   * would see under this name (`FD-ACC-13`'s outward class). Reading, following, saving and preferences never
   * require it. No verification email can be sent today (no delivery channel exists — `FD-ACC-11`), which is
   * exactly why the flag starts false and nothing gates on it yet.
   */
  verified: boolean;
  /**
   * REVIEW-CONSOLE ACCESS FLAG — Conflict 40 (the protected admin area inside this app).
   *
   * OPTIONAL AND ABSENT on every member record, so member semantics are untouched: no member flow reads it,
   * no member surface renders it, and a record without the field is exactly what every member record was
   * before this field existed. It is set `true` only on the ONE seeded review admin account
   * (`reviewAccountStore.ts`), and the only reader is `lib/admin/adminAccess.ts`. It is NOT entitlement in
   * the `FD-ACC-02` sense — it grants no member capability; it answers the separate question "may this
   * session open the admin console". Real credential and role management arrives with the API phase.
   */
  isAdmin?: boolean;
  preferences: AccountPreferences;
  /** Game refs the account follows — `powerball`, `fl/pick-3`. */
  followedGames: readonly string[];
  /** Two-letter state codes the account follows. */
  followedStates: readonly string[];
  savedNumberSets: readonly SavedNumberSet[];
  matches: readonly MatchRecord[];
}

/* ------------------------------------------------------------------ session */

export interface AccountSession {
  dataMode: AccountDataMode;
  accountId: string;
  displayName: string;
  signedInAtIso: string;
  /** "Stay signed in" — defaulted ON in the sign-in form (founder-commissioned UX research). */
  staySignedIn: boolean;
}

/* ------------------------------------------------------------------ entitlement, separately */

/**
 * What a signed-in account may do. A SEPARATE question from who the account is — `FD-ACC-02`'s consequence
 * verbatim: "Code that asks 'is this user signed in' must never be answerable only by asking whether they are
 * an Insider." There is no Insider, no tier and no paid capability; every account gets the same free
 * continuity set (`FD-ACC-15`), and this function is where a future entitlement lookup would live so that no
 * component ever derives capability from identity fields.
 */
export function accountCapabilities(account: AccountRecord): readonly string[] {
  void account; /* Every account is equal today. The parameter exists so call sites ask the right question. */
  return FREE_CONTINUITY_CAPABILITIES;
}

export const FREE_CONTINUITY_CAPABILITIES = Object.freeze([
  "follow-games",
  "follow-states",
  "save-number-sets",
  "notification-preferences",
  "page-preferences",
] as const);

/* ------------------------------------------------------------------ runtime shape assertion */

/**
 * The runtime guard behind the compile-time contract.
 *
 * The review store persists to browser storage, and storage is writable by anything in the page — so a record
 * read back is asserted before it is trusted, exactly as the flagship mock asserts its JSON module. A record
 * that fails is discarded, never repaired: a half-shaped account rendering as a real one is the failure mode
 * this exists to prevent.
 */
export function assertAccountRecord(value: unknown): asserts value is AccountRecord {
  const a = value as AccountRecord;
  const fail = (why: string) => {
    throw new Error(`assertAccountRecord: ${why}`);
  };
  if (typeof a !== "object" || a === null) fail("not an object");
  if (a.dataMode !== "review" && a.dataMode !== "api") fail("dataMode must be 'review' or 'api'");
  for (const k of ["id", "email", "displayName", "createdAtIso"] as const) {
    if (typeof a[k] !== "string" || a[k].length === 0) fail(`${k} must be a non-empty string`);
  }
  if (typeof a.verified !== "boolean") fail("verified must be boolean");
  if (a.isAdmin !== undefined && typeof a.isAdmin !== "boolean") fail("isAdmin, when present, must be boolean");
  if (typeof a.preferences !== "object" || a.preferences === null) fail("preferences missing");
  if (typeof a.preferences.notifications !== "object" || a.preferences.notifications === null) {
    fail("preferences.notifications missing");
  }
  if (typeof a.preferences.page !== "object" || a.preferences.page === null) fail("preferences.page missing");
  for (const k of ["followedGames", "followedStates", "savedNumberSets", "matches"] as const) {
    if (!Array.isArray(a[k])) fail(`${k} must be an array`);
  }
  for (const s of a.savedNumberSets) {
    if (typeof s.id !== "string" || !Array.isArray(s.main)) fail("savedNumberSets entry malformed");
  }
}
