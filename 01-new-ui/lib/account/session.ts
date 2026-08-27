/*
 * THE MEMBER SESSION SEAM — the ONE module components import for account state. LRG-ACCT-001.
 *
 * Authority: the Tier-1 founder instruction of 2026-08-11 (Conflict 37), `ACCT-DEC-001` `FD-ACC-06` (a
 * signed-in capability appears only when the whole round trip works), `FD-ACC-12`/`FD-ACC-13` (continuation),
 * `FD-ACC-18` (notifications), Global Shell v1.1 §33 (GS-07 security rule).
 *
 * ══ SHELL §33: MEMBER STATE IS NEVER IN SERVER HTML ══
 *
 * "Account/menu state must not be cached into public pages." This module enforces that structurally:
 * the session lives only in browser storage, so on the server `getSession()` ALWAYS returns null. Server
 * rendering therefore always produces the anonymous shell, member chrome is rendered client-side after
 * hydration (`components/account/AccountMenu.tsx`), and no cache of a public page can ever contain a member's
 * name, follows or session — there is nothing on the server to bake in. `tests/account-foundation.test.ts`
 * asserts the pattern.
 *
 * ══ WHAT COMPONENTS MAY AND MAY NOT IMPORT ══
 *
 * Components import THIS module (and the React hook in `useAccountSession.ts`, which wraps it). They never
 * import `reviewAccountStore.ts` or `accountData.ts` — the internals are the part a real backend replaces,
 * and a component holding a reference to them would survive the replacement as a bug.
 */

import type { AccountRecord, AccountSession, NotificationPreference, SavedNumberSet } from "./accountContract";
import { accountAdapter } from "./accountData";
import { consumeSignInIntent, type SignInIntent } from "./signInIntent";

/* ------------------------------------------------------------------ shared copy */

/**
 * The one-sentence value line both account pages carry — founder-commissioned UX research wording.
 * `FD-ACC-15`: continuity, personalisation and engagement; the word FREE leads (`FD-DAT-04`'s spirit).
 */
export const ACCOUNT_VALUE_LINE =
  "Free — save your numbers, follow your games, and pick up where you left off.";

/**
 * The single secret rule: a MINIMUM LENGTH and nothing else.
 *
 * The founder-commissioned research (audience 45–64, non-technical, mobile) is explicit: no composition
 * rules — no required digit, symbol or case mix, which mostly produce abandoned sign-ups and password reuse
 * in this audience. One rule, stated in plain words next to the field.
 */
export const MIN_SECRET_LENGTH = 8;
export const SECRET_RULE_TEXT = `At least ${MIN_SECRET_LENGTH} characters. That is the only rule.`;

/* ------------------------------------------------------------------ result shape */

export type SessionResult = { ok: true; account: AccountRecord } | { ok: false; error: string };

/* ------------------------------------------------------------------ reads */

export function getSession(): AccountSession | null {
  /*
   * On a rendering server this is ALWAYS null in practice, which is how §33 holds:
   *   1. sign-in runs only in the browser, so the server-side (in-memory) half of the review store never
   *      contains a session for this to find;
   *   2. no server component reads it anyway — member chrome goes through `useAccountSession`, whose
   *      SERVER SNAPSHOT is hard-coded anonymous (`useAccountSession.ts`), and the sweep in
   *      `tests/account-foundation.test.ts` keeps session reads out of server components.
   * In Node tests and the scripted round-trip proof, the same in-memory store is the fixture.
   */
  return accountAdapter().getSession();
}

export function getAccount(): AccountRecord | null {
  const session = getSession();
  if (!session) return null;
  return accountAdapter().getAccountById(session.accountId);
}

export function subscribe(listener: () => void): () => void {
  return accountAdapter().subscribe(listener);
}

/* ------------------------------------------------------------------ create / sign in / sign out */

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Plain-language validation, one message per problem, written for the research audience. */
function validateEmail(email: string): string | null {
  if (email.length === 0) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "That does not look like an email address. Check for a typo.";
  return null;
}

export async function createAccount(input: {
  email: string;
  /** Optional — defaults to the part of the email before the @, which the reader can change later. */
  displayName?: string;
  secret: string;
  staySignedIn: boolean;
  /** The community-rules checkbox. A checkbox with a link, never a full-page wall. */
  acceptedCommunityRules: boolean;
}): Promise<SessionResult> {
  const email = normaliseEmail(input.email);
  const emailProblem = validateEmail(email);
  if (emailProblem) return { ok: false, error: emailProblem };
  if (input.secret.length < MIN_SECRET_LENGTH) {
    return { ok: false, error: `Your password needs at least ${MIN_SECRET_LENGTH} characters.` };
  }
  if (!input.acceptedCommunityRules) {
    return { ok: false, error: "Please tick the community rules box to continue." };
  }
  const adapter = accountAdapter();
  if (adapter.getAccountByEmail(email)) {
    return { ok: false, error: "There is already an account for that email. Try signing in instead." };
  }
  const displayName = (input.displayName ?? "").trim() || email.split("@")[0];
  const account = await adapter.createAccount({ email, displayName, secret: input.secret });
  startSession(account, input.staySignedIn);
  return { ok: true, account };
}

export async function signIn(input: {
  email: string;
  secret: string;
  staySignedIn: boolean;
}): Promise<SessionResult> {
  const email = normaliseEmail(input.email);
  const emailProblem = validateEmail(email);
  if (emailProblem) return { ok: false, error: emailProblem };
  if (input.secret.length === 0) return { ok: false, error: "Enter your password." };
  const account = await accountAdapter().verifyCredentials(email, input.secret);
  if (!account) {
    /* One message for both wrong-email and wrong-password, in plain words. No reset-by-email flow exists —
       there is no delivery channel (`FD-ACC-11`) — so none is offered; that omission is recorded on the page. */
    return { ok: false, error: "That email and password do not match an account here. Check both and try again." };
  }
  startSession(account, input.staySignedIn);
  return { ok: true, account };
}

function startSession(account: AccountRecord, staySignedIn: boolean): void {
  accountAdapter().setSession({
    dataMode: account.dataMode,
    accountId: account.id,
    displayName: account.displayName,
    signedInAtIso: new Date().toISOString(),
    staySignedIn,
  });
}

export function signOut(): void {
  accountAdapter().setSession(null);
}

/* ------------------------------------------------------------------ continuity actions */

function withAccount(mutate: (account: AccountRecord) => AccountRecord): AccountRecord | null {
  const account = getAccount();
  if (!account) return null;
  const next = mutate(account);
  accountAdapter().updateAccount(next);
  return next;
}

export function followGame(gameRef: string): AccountRecord | null {
  return withAccount((a) =>
    a.followedGames.includes(gameRef) ? a : { ...a, followedGames: [...a.followedGames, gameRef] },
  );
}

export function unfollowGame(gameRef: string): AccountRecord | null {
  return withAccount((a) => ({ ...a, followedGames: a.followedGames.filter((g) => g !== gameRef) }));
}

export function followState(stateCode: string): AccountRecord | null {
  return withAccount((a) =>
    a.followedStates.includes(stateCode) ? a : { ...a, followedStates: [...a.followedStates, stateCode] },
  );
}

export function unfollowState(stateCode: string): AccountRecord | null {
  return withAccount((a) => ({ ...a, followedStates: a.followedStates.filter((s) => s !== stateCode) }));
}

export function saveNumberSet(input: {
  gameRef: string;
  label: string;
  main: readonly number[];
  special: number | null;
}): AccountRecord | null {
  return withAccount((a) => {
    const set: SavedNumberSet = {
      id: `set-${globalThis.crypto.randomUUID()}`,
      gameRef: input.gameRef,
      label: input.label,
      main: [...input.main],
      special: input.special,
      savedAtIso: new Date().toISOString(),
      dataMode: a.dataMode,
    };
    return { ...a, savedNumberSets: [...a.savedNumberSets, set] };
  });
}

export function removeNumberSet(id: string): AccountRecord | null {
  return withAccount((a) => ({ ...a, savedNumberSets: a.savedNumberSets.filter((s) => s.id !== id) }));
}

/**
 * Record ONE notification preference — `FD-ACC-18`.
 *
 * Its own affirmative choice, its own frequency (shown before choosing), its own disable path (Settings in
 * the GS-07 menu, one tap). Recording it promises NOTHING about delivery: no channel exists (`FD-ACC-11`),
 * and every surface that shows these preferences says so in plain words.
 */
export function setNotificationPreference(input: {
  key: string;
  label: string;
  frequency: string;
  optedIn: boolean;
}): AccountRecord | null {
  return withAccount((a) => {
    const pref: NotificationPreference = {
      key: input.key,
      label: input.label,
      frequency: input.frequency,
      optedIn: input.optedIn,
      chosenAtIso: new Date().toISOString(),
      dataMode: a.dataMode,
    };
    return {
      ...a,
      preferences: {
        ...a.preferences,
        notifications: { ...a.preferences.notifications, [input.key]: pref },
      },
    };
  });
}

export function setPagePreference(key: string, value: string): AccountRecord | null {
  return withAccount((a) => ({
    ...a,
    preferences: {
      ...a.preferences,
      page: {
        ...a.preferences.page,
        [key]: { value, savedAtIso: new Date().toISOString(), dataMode: a.dataMode },
      },
    },
  }));
}

/* ------------------------------------------------------------------ continuation — FD-ACC-13 */

/**
 * Capability keys that need a tool-execution service the review layer does not stand in for — export
 * (`FD-DAT-01`/`FD-DAT-15` metering is server work, recorded as API-phase in Conflict 37), model-executed AI
 * (`FD-DAT-02`/`FD-DAT-12` — no provider exists), and batch tool runs. Signing in does NOT make these run;
 * they are answered honestly rather than pretend-completed.
 */
const EXECUTION_ACTIONS = new Set([
  "export-snapshot",
  "ai-summarise-view",
  "ai-batch",
  "batch",
  "compare-history",
  "compare-saved",
  "check-multiple",
  /* Outward acts with no platform behind them yet: posting needs the community family (FD-ACC-10). */
  "start-discussion",
]);

/**
 * Is this action OUTWARD-facing — visible to other readers, or spending anything?
 *
 * `FD-ACC-13`: an outward action must NEVER complete automatically after sign-in; the reader lands in a
 * composer or confirmation step. Callers use this to set the intent's `kind`.
 */
export function isOutwardAction(action: string): boolean {
  const bare = action.includes(":") ? action.split(":").pop()! : action;
  return /^(start-|post|reply|share|publish|send)/.test(bare);
}

/** Which continuity action an intent's key maps to. Exported so a test can assert the classification. */
export function classifyIntentAction(
  action: string,
): "notification" | "follow-game" | "follow-state" | "preference" | "execution" {
  const bare = action.includes(":") ? action.split(":").pop()! : action;
  if (EXECUTION_ACTIONS.has(bare)) return "execution";
  if (/(alert|reminder|digest|auto-check|threshold)/.test(bare)) return "notification";
  if (bare === "follow-game" || bare === "follow") return "follow-game";
  if (bare === "follow-state") return "follow-state";
  /* `follow-tag` and `follow-topic` are content-tag follows, stored as preferences so that toggling one
     never silently toggles the game follow itself. */
  return "preference";
}

export interface ContinuationOutcome {
  /** Whether the private action was completed against the account. */
  completed: boolean;
  /** The consumed intent, so the caller can navigate to `intent.returnTo`. Null if none was found. */
  intent: SignInIntent | null;
  /** Reader-facing sentence describing what happened, or what still needs their confirmation. */
  message: string | null;
}

/**
 * Consume a nonce after sign-in and — for PRIVATE actions only — complete it.
 *
 * `FD-ACC-13` verbatim: continuing a private action (following a game, saving a set) may complete
 * automatically; anything outward-facing must land the reader in a confirmation step. An outward intent is
 * therefore returned UN-executed with a message telling the reader it is waiting for them.
 */
export function completeSignInIntent(nonce: string): ContinuationOutcome {
  const intent = consumeSignInIntent(nonce);
  if (!intent) return { completed: false, intent: null, message: null };
  if (!getSession()) return { completed: false, intent, message: null };

  if (intent.kind === "outward") {
    return {
      completed: false,
      intent,
      message: `“${intent.label}” is ready for you to confirm — nothing has been posted or sent.`,
    };
  }

  /*
   * The capturing surface may declare the action's class explicitly (`context.class`), because it knows what
   * its own option means — "weekly" is a notification on JG-17, and no key pattern should have to guess that.
   * The pattern classifier is the fallback for intents captured without one.
   *
   * `prepared` is the `FD-DAT-16` point-6 class, added when the archive ask/export surfaces were restored
   * under that ruling's own condition (Conflict 37): the requested action is genuinely available once signed
   * in, but it must be "prepared and awaiting their confirmation — never auto-executed". So the continuation
   * returns the reader to the surface un-executed, and the now-working control is the confirmation step.
   */
  const declared = intent.context.class;
  const cls =
    declared === "notification" || declared === "follow-game" || declared === "follow-state"
    || declared === "preference" || declared === "execution" || declared === "prepared"
      ? declared
      : classifyIntentAction(intent.action);

  switch (cls) {
    case "prepared":
      /* FD-DAT-16 point 6 / FD-ACC-13: signed in, working, and deliberately NOT run for the reader. */
      return {
        completed: false,
        intent,
        message:
          `You're signed in. “${intent.label}” is ready on the page you're returning to — nothing has run `
          + "automatically.",
      };
    case "execution":
      /* Signed in, but the tool itself has no service to run against — never pretend-completed (§14). */
      return {
        completed: false,
        intent,
        message:
          `You're signed in. “${intent.label}” runs with the member tools service, which isn't connected in `
          + "this review build — nothing ran and nothing was saved.",
      };
    case "follow-game": {
      const ref = intent.context.gameRef ?? intent.context.gameSlug;
      if (ref) {
        followGame(ref);
        return { completed: true, intent, message: `You are following ${intent.context.gameLabel ?? ref}.` };
      }
      break;
    }
    case "follow-state": {
      const code = intent.context.stateCode;
      if (code) {
        followState(code);
        return { completed: true, intent, message: `You are following ${code.toUpperCase()}.` };
      }
      break;
    }
    case "notification": {
      setNotificationPreference({
        key: intent.action,
        label: intent.label,
        frequency: intent.context.frequency ?? "Frequency shown on the option you chose.",
        optedIn: true,
      });
      return {
        completed: true,
        intent,
        message: `“${intent.label}” is saved to your account. Nothing is sent yet — there is no email or push channel.`,
      };
    }
    case "preference":
      break;
  }

  setPagePreference(intent.action, intent.label);
  return { completed: true, intent, message: `“${intent.label}” is saved to your account.` };
}
