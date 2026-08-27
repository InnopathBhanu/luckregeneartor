/*
 * THE ADMIN ACCESS SEAM — Conflict 40. The ONE module that answers "may this session use the console".
 *
 * ══ HOW ACCESS IS DECIDED ══
 *
 * Through the member session seam (`lib/account/session.ts`) and nothing else: the signed-in account's
 * `isAdmin` flag (set only on the seeded review admin — see `reviewAccountStore.ts`'s credential-pattern
 * header). Three states, and the console renders each explicitly:
 *
 *   "anonymous" — no session: /admin shows the admin sign-in form.
 *   "member"    — a session without the flag: a PLAIN not-authorized state. Deliberately information-free —
 *                 it does not say what the console contains, who the admins are, or how to become one.
 *   "admin"     — the console.
 *
 * ══ WHY THIS IS SAFE TO RENDER CLIENT-SIDE ONLY ══
 *
 * The session lives only in browser storage (Shell §33), so on the server every /admin render is the
 * anonymous sign-in shell — admin state, like member state, is never in server HTML, and no cached page can
 * carry it. In review mode this gate is a WORKFLOW gate, not a security boundary (`FD-DAT-11`: real
 * enforcement happens on a server) — which is exactly the production posture the API phase replaces it with.
 */

import type { AccountRecord } from "../account/accountContract";
import { getAccount } from "../account/session";

/** The two admin routes. `/admin` is the sign-in door; the console lives one step inside. */
export const ADMIN_PATH = "/admin";
export const ADMIN_CONSOLE_PATH = "/admin/console";

/** The console's visual identity — separate from the member surfaces by name, per the founder instruction. */
export const ADMIN_AREA_LABEL = "LotteryCorner Admin";

export type AdminAccessState = "anonymous" | "member" | "admin";

/** Is this account record an admin? The only reader of the flag. */
export function isAdminAccount(account: AccountRecord | null): boolean {
  return account?.isAdmin === true;
}

/** The session's access state, resolved through the session seam. Client-side truth; server is always anonymous. */
export function adminAccessState(): AdminAccessState {
  const account = getAccount();
  if (!account) return "anonymous";
  return isAdminAccount(account) ? "admin" : "member";
}

/**
 * The accountable identity every workflow call records as `who`. Null unless an admin is signed in —
 * callers must refuse to act on null rather than inventing an actor.
 */
export function adminIdentity(): string | null {
  const account = getAccount();
  if (!isAdminAccount(account)) return null;
  return `${account!.displayName} (${account!.email})`;
}

/**
 * The not-authorized copy for a signed-in non-admin. One plain sentence, no information leak: it names no
 * console feature, no admin identity and no path to elevation.
 */
export const NOT_AUTHORIZED_COPY = "This area is not available on your account.";
