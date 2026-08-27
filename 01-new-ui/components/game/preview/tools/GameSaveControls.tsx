"use client";

/*
 * JG-17 — SAVE, FOLLOW AND ALERTS. LRG-GAME-050, rewritten LRG-GAME-051, wired to the real account
 * foundation by LRG-ACCT-001 (Conflict 37, 2026-08-11).
 *
 * Authority: the 2026-08-04 revision direction (*"Signed-out Save, Follow, or Alert action opens
 * Login/Register … Signed-in actions persist to the member's server-backed account … Never claim that an
 * alert, follow, or save succeeded unless the supporting service exists"*), `FD-ACC-12`/`FD-ACC-13`
 * (continuation), `FD-ACC-18` (per-option frequency, easy disable), `FD-DAT-04` (the gate affordance),
 * `CLAUDE.md` §9 and §16.
 *
 * ══ WHAT CHANGED UNDER CONFLICT 37 ══
 *
 * The supporting service now exists: the review-mode account layer (`lib/account/session.ts`). So:
 *
 *   - SIGNED OUT: activating an option names the benefit and offers the real `FD-DAT-04` affordance —
 *     "Sign in free to use" — which captures an `FD-ACC-12` intent (only the nonce enters the URL) and opens
 *     the shared `/login` flow. On return, the private action completes automatically (`FD-ACC-13`) and the
 *     reader lands back at this section.
 *   - SIGNED IN: the action genuinely executes against the member's account and TOGGLES — follow/unfollow,
 *     preference on/off — with the stored state readable on the control (`aria-pressed`). Success copy is
 *     now truthful because the store is real; every record it writes is tagged review data.
 *   - NOTHING CLAIMS DELIVERY. An alert preference is recorded with its frequency; the panel says plainly
 *     that no message is sent because no channel exists (`FD-ACC-11` stands).
 */

import { useState } from "react";
import type { AlertOption } from "@/lib/game/gameReviewFixture";
import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  followGame,
  setNotificationPreference,
  setPagePreference,
  unfollowGame,
} from "@/lib/account/session";
import SignInToUse from "@/components/account/SignInToUse";

/**
 * A captured intent. `returnTo` and `action` are exactly what the `FD-ACC-12` handoff carries so the action
 * can be resumed after authentication rather than forgotten.
 */
export interface MemberIntent {
  action: string;
  label: string;
  returnTo: string;
}

function isNotificationOption(key: string): boolean {
  return /^(result-|rules$|weekly$|top-prize$)/.test(key);
}

export default function GameSaveControls({
  gameLabel,
  gameSlug,
  stateCode,
  options,
  signedOutCopy,
}: {
  gameLabel: string;
  gameSlug: string;
  stateCode: string;
  options: readonly AlertOption[];
  signedOutCopy: string;
}) {
  const { session, account } = useAccountSession();
  const [pending, setPending] = useState<MemberIntent | null>(null);
  const [done, setDone] = useState<{ label: string; on: boolean; notification: boolean } | null>(null);

  const gameRef = `${stateCode}/${gameSlug}`;
  const returnTo = `/${stateCode}/${gameSlug}#jg-17`;

  const isOn = (o: AlertOption): boolean => {
    if (!account) return false;
    if (o.key === "follow") return account.followedGames.includes(gameRef);
    if (isNotificationOption(o.key)) {
      return account.preferences.notifications[`${gameRef}:${o.key}`]?.optedIn === true;
    }
    return `${gameRef}:${o.key}` in account.preferences.page;
  };

  const activate = (o: AlertOption) => {
    const intent: MemberIntent = { action: o.key, label: o.label, returnTo };

    if (!session) {
      /* Signed out: name the benefit, offer the real flow. The intent is captured by SignInToUse at the
         moment of the click, so an unclicked panel stores nothing. */
      setPending(intent);
      setDone(null);
      return;
    }

    /* Signed in: the action executes against the review store, as a toggle. */
    const currentlyOn = isOn(o);
    if (o.key === "follow") {
      if (currentlyOn) unfollowGame(gameRef);
      else followGame(gameRef);
    } else if (isNotificationOption(o.key)) {
      setNotificationPreference({
        key: `${gameRef}:${o.key}`,
        label: `${gameLabel} — ${o.label}`,
        frequency: o.frequency ?? "Frequency shown on this option.",
        optedIn: !currentlyOn,
      });
    } else {
      /* Preference-style options (saved-sets). Toggle: remove by writing an empty marker is wrong — the
         session seam has no delete for page prefs, so "off" is recorded as such. */
      setPagePreference(`${gameRef}:${o.key}`, currentlyOn ? "off" : o.label);
    }
    setPending(null);
    setDone({ label: o.label, on: !currentlyOn, notification: isNotificationOption(o.key) });
  };

  return (
    <div className="lcg-tool" data-tool="member-actions" data-signed-in={Boolean(session)} data-auth-available="true">
      <p className="lcg-fine">{signedOutCopy}</p>

      <ul className="lcg-optionlist">
        {options.map((o) => (
          <li key={o.key}>
            <button
              className="lcg-optionbtn"
              type="button"
              data-option={o.key}
              aria-pressed={session ? isOn(o) : undefined}
              aria-describedby={pending?.action === o.key ? "lcg-member-note" : undefined}
              onClick={() => activate(o)}
            >
              {o.label}
              {session && isOn(o) ? <span className="lcg-optionbtn__on"> — on</span> : null}
              {/* FD-ACC-18: the frequency is visible BEFORE the option is chosen. */}
              {o.frequency ? <span className="lcg-optionbtn__freq">{o.frequency}</span> : null}
            </button>
          </li>
        ))}
      </ul>

      {/* One panel, appearing only after an action, naming what was chosen and what happened to it. */}
      <div className="lcg-outcome" role="status" aria-live="polite" data-member-prompt={pending?.action ?? "none"}>
        {pending ? (
          <div id="lcg-member-note">
            <p className="lcg-outcome__headline">Sign in to turn on “{pending.label}”</p>
            <p className="lcg-fine">
              {gameLabel} alerts, follows and saved number sets belong to your LotteryCorner account so they work
              on every device you use. Signing in keeps this choice and brings you back to where you left off.
            </p>
            <p className="lcg-actions">
              {/* FD-DAT-04: the shared affordance, exact wording, real flow, intent captured on click. */}
              <SignInToUse
                className="lcg-btn lcg-btn--primary"
                intent={{
                  returnTo,
                  /* The FULL store key, so the continuation writes exactly where `isOn` reads. */
                  action: pending.action === "follow" ? "follow" : `${gameRef}:${pending.action}`,
                  label: pending.label,
                  kind: "private",
                  context: {
                    /* This surface declares what its option MEANS — no key pattern has to guess. */
                    class:
                      pending.action === "follow"
                        ? "follow-game"
                        : isNotificationOption(pending.action)
                          ? "notification"
                          : "preference",
                    gameRef,
                    gameSlug,
                    stateCode,
                    gameLabel,
                    frequency: options.find((o) => o.key === pending.action)?.frequency ?? "",
                  },
                }}
              />
            </p>
            <p className="lcg-fine lcg-muted">A LotteryCorner account is free. Nothing is saved until you sign in.</p>
          </div>
        ) : done ? (
          <div>
            <p className="lcg-outcome__headline">
              {done.on ? `“${done.label}” is on for your account.` : `“${done.label}” is off.`}
            </p>
            {done.on && done.notification ? (
              /* FD-ACC-11 stands: the preference is recorded; nothing is delivered, and we say so. */
              <p className="lcg-fine lcg-muted">
                Your choice is saved to your account. No messages are sent yet — LotteryCorner has no email or
                push channel. Turning it off is one tap, here or in Settings.
              </p>
            ) : (
              <p className="lcg-fine lcg-muted">Saved to your account. You can change it here any time.</p>
            )}
          </div>
        ) : (
          <p className="lcg-fine lcg-muted">
            Choose what you want to be told about. Each of these is kept on your LotteryCorner account.
          </p>
        )}
      </div>
    </div>
  );
}
