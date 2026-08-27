/*
 * THE ACCOUNT DATA ENTRY POINT — LRG-ACCT-001.
 *
 * ══ ONE FUNCTION, ONE SEAM — the flagship BFF pattern, replicated exactly ══
 *
 * `accountAdapter()` is the only way the session seam reaches account data. Today it resolves to the review
 * store; when `02-new-api` exists, `resolveAdapter` gains one branch and nothing else in the tree changes. The
 * compiler enforces that any replacement satisfies `AccountAdapter` in full, so a partial backend cannot
 * quietly ship a member area with holes in it.
 *
 * ══ WHY THE REVIEW ADAPTER EXISTS ══
 *
 * Founder direction (Conflict 37, 2026-08-11): finish the site as a working product and assume the database
 * exists. The member area therefore needs to behave like the finished product — create an account, sign in,
 * follow a game, save a set, come back and find it all still there — none of which a stub could supply.
 * `CLAUDE.md` §14 still holds: every record is stamped `dataMode: "review"` and nothing is presented as a
 * production fact.
 */

import type { AccountRecord, AccountSession } from "./accountContract";
import {
  storeCreateAccount,
  storeGetAccountByEmail,
  storeGetAccountById,
  storeGetSession,
  storeSetSession,
  storeSubscribe,
  storeUpdateAccount,
  storeVerifyCredentials,
} from "./reviewAccountStore";

export type AccountDataModeSetting =
  /** Review store: in-memory seeded, browser-persisted. The current mode. */
  | "review"
  /** Real backend. Not implemented — `02-new-api` is empty and untouched (`CLAUDE.md` §15). */
  | "api";

/**
 * Which adapter answers.
 *
 * A module constant rather than an environment variable, exactly as `FLAGSHIP_DATA_MODE` is: `FD-GATE-01`'s
 * rationale — the state of the build is readable from the source, and no shell session changes what a build
 * does — applies to the data layer as much as to routes.
 */
export const ACCOUNT_DATA_MODE: AccountDataModeSetting = "review";

/** Everything the session seam needs from a backend, in one interface. */
export interface AccountAdapter {
  getSession(): AccountSession | null;
  getAccountById(id: string): AccountRecord | null;
  getAccountByEmail(email: string): AccountRecord | null;
  createAccount(input: { email: string; displayName: string; secret: string }): Promise<AccountRecord>;
  verifyCredentials(email: string, secret: string): Promise<AccountRecord | null>;
  setSession(session: AccountSession | null): void;
  updateAccount(next: AccountRecord): void;
  subscribe(listener: () => void): () => void;
}

const reviewAdapter: AccountAdapter = {
  getSession: storeGetSession,
  getAccountById: storeGetAccountById,
  getAccountByEmail: storeGetAccountByEmail,
  createAccount: storeCreateAccount,
  verifyCredentials: storeVerifyCredentials,
  setSession: storeSetSession,
  updateAccount: storeUpdateAccount,
  subscribe: storeSubscribe,
};

/** The one entry function. Components never call this either — they go through `session.ts`. */
export function accountAdapter(): AccountAdapter {
  switch (ACCOUNT_DATA_MODE) {
    case "review":
      return reviewAdapter;
    case "api":
      /* Unreachable until an API task is authorised. Left as an explicit branch so the seam is visible. */
      throw new Error(
        "accountAdapter: the API adapter does not exist. `02-new-api` is untouched until a dedicated API task " +
          "is approved (CLAUDE.md §15). The review adapter is the only implementation.",
      );
  }
}
