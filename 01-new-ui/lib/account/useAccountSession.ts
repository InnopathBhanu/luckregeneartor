"use client";

/*
 * THE MEMBER-STATE HOOK — the client half of the session seam. LRG-ACCT-001.
 *
 * ══ SHELL §33, MADE STRUCTURAL ══
 *
 * `useSyncExternalStore`'s SERVER SNAPSHOT is hard-coded to the anonymous state. That is not a convenience —
 * it is the GS-07 security rule ("account/menu state must not be cached into public pages") expressed so the
 * framework enforces it: server rendering and the first client render are both anonymous, member chrome
 * appears only after hydration, and therefore no cached HTML of any public page can contain member state.
 * The hydration swap is the DESIGNED behaviour, not a flash to engineer away.
 */

import { useSyncExternalStore } from "react";
import type { AccountRecord, AccountSession } from "./accountContract";
import { getAccount, getSession, subscribe } from "./session";

export interface MemberState {
  session: AccountSession | null;
  account: AccountRecord | null;
}

const ANONYMOUS: MemberState = { session: null, account: null };

let cached: MemberState = ANONYMOUS;

function snapshot(): MemberState {
  const session = getSession();
  const account = getAccount();
  /* Referential stability: useSyncExternalStore re-renders on identity change, so an unchanged state must
     return the SAME object. */
  if (session === cached.session && account === cached.account) return cached;
  cached = { session, account };
  return cached;
}

function serverSnapshot(): MemberState {
  return ANONYMOUS; /* §33: the server is always anonymous. */
}

export function useAccountSession(): MemberState {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
