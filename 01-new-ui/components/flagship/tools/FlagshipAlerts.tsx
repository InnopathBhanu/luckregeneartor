"use client";

/*
 * FG-14 — SAVE, FOLLOW, ALERTS AND PERSONALISATION. LRG-FLAGSHIP-002, wired to the real account foundation
 * by LRG-ACCT-001 (Conflict 37, 2026-08-11).
 *
 * Authority: BP-04A §28, `ACCT-DEC-001` `FD-ACC-15`/`FD-ACC-16`/`FD-ACC-18`, `DATA-DEC-001` `FD-DAT-04`/
 * `FD-DAT-06`, `FD-ACC-12`/`FD-ACC-13`.
 *
 * ══ EVERY OPTION STILL SHOWS ITS FREQUENCY BEFORE IT IS CHOSEN ══
 *
 * `FD-ACC-18` requires any future notification to be explicit opt-in, frequency-controlled and easy to turn
 * off, and forbids one arriving as a side effect of signing in or following. The frequency renders on
 * activation alongside the benefit, Follow states in its own row that following alone sends nothing, and
 * turning anything off is one tap here or in the account menu's Settings.
 *
 * ══ WHAT CHANGED UNDER CONFLICT 37 ══
 *
 * Accounts are real now (review data layer). Signed out, each option offers the shared `FD-DAT-04`
 * affordance and the choice resumes after sign-in (`FD-ACC-13` — all options here are private continuity).
 * Signed in, each option genuinely toggles on the member's account. NOTHING claims delivery: a recorded
 * alert preference is a saved choice, and the copy says plainly that no channel exists (`FD-ACC-11`).
 */

import { useState } from "react";
import type { EngagementIntent, EngagementOption } from "@/lib/flagship/flagshipEngagement";
import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  classifyIntentAction,
  followGame,
  setNotificationPreference,
  setPagePreference,
  unfollowGame,
} from "@/lib/account/session";
import SignInToUse from "@/components/account/SignInToUse";

/** The intent is BUILT HERE, from plain strings — a function cannot cross the server/client boundary. */
function buildIntent(gameSlug: string, returnTo: string, option: EngagementOption): EngagementIntent {
  return { action: option.key, label: option.label, gameSlug, returnTo };
}

const GROUPS: { key: EngagementOption["category"]; heading: string; intro: string }[] = [
  {
    key: "alert",
    heading: "Tell me when something happens",
    intro: "Each of these is a separate choice, with its own frequency, and each is as easy to turn off as on.",
  },
  {
    key: "follow",
    heading: "Follow",
    intro: "Following collects things in one place. On its own it sends you nothing.",
  },
  {
    key: "personalise",
    heading: "Remember how I use this page",
    intro: "Changes only what you see when you come back.",
  },
];

export default function FlagshipAlerts({
  options,
  note,
  gameSlug,
  returnTo,
}: {
  options: readonly EngagementOption[];
  note: string;
  gameSlug: string;
  /** The internal path a sign-in returns the reader to. Never an absolute URL. */
  returnTo: string;
}) {
  const { session, account } = useAccountSession();
  const [active, setActive] = useState<{ option: EngagementOption; intent: EngagementIntent } | null>(null);
  const [stored, setStored] = useState<{ option: EngagementOption; on: boolean } | null>(null);

  const storeKey = (o: EngagementOption) => `${gameSlug}:${o.key}`;

  const isOn = (o: EngagementOption): boolean => {
    if (!account) return false;
    switch (classifyIntentAction(o.key)) {
      case "follow-game":
        return account.followedGames.includes(gameSlug);
      case "notification":
        return account.preferences.notifications[storeKey(o)]?.optedIn === true;
      default:
        return account.preferences.page[storeKey(o)]?.value !== undefined
          && account.preferences.page[storeKey(o)]?.value !== "off";
    }
  };

  const activate = (o: EngagementOption) => {
    const intent = buildIntent(gameSlug, returnTo, o);
    if (!session) {
      setActive({ option: o, intent });
      setStored(null);
      return;
    }
    const on = isOn(o);
    switch (classifyIntentAction(o.key)) {
      case "follow-game":
        if (on) unfollowGame(gameSlug);
        else followGame(gameSlug);
        break;
      case "notification":
        setNotificationPreference({ key: storeKey(o), label: o.label, frequency: o.frequencyNote, optedIn: !on });
        break;
      default:
        setPagePreference(storeKey(o), on ? "off" : o.label);
    }
    setActive(null);
    setStored({ option: o, on: !on });
  };

  return (
    <div className="lcfg-tool" data-tool="engagement" data-auth-available="true" data-signed-in={Boolean(session)}>
      {GROUPS.map((group) => {
        const inGroup = options.filter((o) => o.category === group.key);
        if (inGroup.length === 0) return null;
        return (
          <div key={group.key} className="lcfg-engagegroup" data-engagement-group={group.key}>
            <p className="lcfg-lockedhead">
              <span className="lcfg-lockedhead__label">{group.heading}</span>
              <span className="lcfg-lockedhead__gate">Free account</span>
            </p>
            <p className="lcfg-fine lcfg-muted lcfg-lockedintro">{group.intro}</p>
            <ul className="lcfg-lockedlist">
              {inGroup.map((o) => (
                <li key={o.key}>
                  <button
                    type="button"
                    className="lcfg-lockchip"
                    data-capability={o.key}
                    data-gate={o.gate}
                    aria-expanded={active?.option.key === o.key}
                    aria-pressed={session ? isOn(o) : undefined}
                    aria-controls="lcfg-engagement-note"
                    onClick={() => activate(o)}
                  >
                    <span className="lcfg-lockchip__icon" aria-hidden="true">
                      {session && isOn(o) ? "✓" : "🔒"}
                    </span>
                    <span className="lcfg-lockchip__label">{o.label}</span>
                    {/* Announced per chip: the account requirement or the on-state, plus the frequency. */}
                    <span className="lcs-vh">
                      {session ? "On your account." : "Needs a free account."} {o.frequencyNote}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div
        className="lcfg-lockednote"
        id="lcfg-engagement-note"
        role="status"
        aria-live="polite"
        data-activated={active?.option.key ?? stored?.option.key ?? "none"}
      >
        {active ? (
          <>
            <p className="lcfg-lockednote__head">“{active.option.label}” needs a free LotteryCorner account</p>
            <p className="lcfg-fine">
              {active.option.benefit} {active.option.frequencyNote}
            </p>
            <p className="lcfg-fine lcfg-muted">{note}</p>
            {/* FD-DAT-04: exact wording, real flow. Every option here is private continuity (FD-ACC-13),
                so it completes on return and the reader lands back at this section. */}
            <p className="lcfg-actions">
              <SignInToUse
                className="lcfg-btn lcfg-btn--primary"
                intent={{
                  returnTo: active.intent.returnTo,
                  /* The FULL store key, so the continuation writes exactly where `isOn` reads. */
                  action:
                    classifyIntentAction(active.option.key) === "follow-game"
                      ? active.option.key
                      : storeKey(active.option),
                  label: active.intent.label,
                  kind: "private",
                  context: {
                    class: classifyIntentAction(active.option.key),
                    gameRef: gameSlug,
                    gameSlug,
                    frequency: active.option.frequencyNote,
                  },
                }}
              />
            </p>
          </>
        ) : null}
        {stored ? (
          <>
            <p className="lcfg-lockednote__head">
              {stored.on ? `“${stored.option.label}” is on for your account.` : `“${stored.option.label}” is off.`}
            </p>
            {stored.on && classifyIntentAction(stored.option.key) === "notification" ? (
              <p className="lcfg-fine lcfg-muted">
                {stored.option.frequencyNote} Saved to your account (review data). No messages are sent yet —
                LotteryCorner has no email or push channel. Turning it off is one tap, here or in Settings.
              </p>
            ) : (
              <p className="lcfg-fine lcfg-muted">Saved to your account (review data). Change it here any time.</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
