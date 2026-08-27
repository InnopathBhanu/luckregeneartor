"use client";

/*
 * THE GATED CAPABILITY CONTROL — LRG-FLAGSHIP-002, wired to the real account foundation by LRG-ACCT-001.
 *
 * ══ THE GOVERNANCE POSITION, UPDATED ══
 *
 * This component used to carry the Conflict 28 override: visible-but-locked chips with NO sign-in
 * destination, because none existed. Conflict 37 (Tier-1 founder instruction, 2026-08-11) closed that state:
 * the real shared sign-in flow exists and works end to end against the review data layer, so the standing
 * rule is now VISIBLE AND FUNCTIONAL — `FD-DAT-03` discoverability, the `FD-DAT-04` affordance ("Sign in
 * free to use", the word FREE mandatory), the `FD-ACC-12` intent, and `FD-ACC-13` private-action
 * continuation.
 *
 * ══ WHAT A CHIP DOES NOW ══
 *
 *   SIGNED OUT   Activating it explains the benefit and offers the shared `SignInToUse` affordance, which
 *                captures an allowlisted, expiring, single-use intent and opens `/login` with only the nonce
 *                in the URL. After sign-in the reader returns here and a private action completes.
 *   SIGNED IN    A continuity capability (save, name, follow, an alert preference) executes against the
 *                member's account for real and TOGGLES; the confirmation is truthful because the store is.
 *                A capability that needs a tool-execution service (export, model AI, batch runs) says so
 *                honestly — those services are API-phase (`FD-DAT-01`/`FD-DAT-02`), and nothing pretends
 *                to run them.
 *
 * ══ WHAT STILL NEVER HAPPENS ══
 *
 *   - No control is `disabled`; every chip is keyboard-reachable and announced.
 *   - No control says "Coming soon".
 *   - No success is claimed that did not occur; notification preferences state plainly that nothing is
 *     DELIVERED, because no channel exists (`FD-ACC-11`).
 *   - Nothing anywhere mentions a plan, a tier, a trial, a quota or an upgrade (`FD-ACC-16`, `FD-DAT-06`).
 */

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import type { LockedCapability } from "@/lib/flagship/flagshipContract";
import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  classifyIntentAction,
  followGame,
  isOutwardAction,
  setNotificationPreference,
  setPagePreference,
  unfollowGame,
} from "@/lib/account/session";
import SignInToUse from "@/components/account/SignInToUse";

type Outcome =
  | { kind: "stored"; capability: LockedCapability; on: boolean; notification: boolean }
  | { kind: "needs-service"; capability: LockedCapability };

export default function FlagshipLocked({
  capabilities,
  note,
  label,
  onActivate,
  layout = "list",
}: {
  capabilities: readonly LockedCapability[];
  /** The honest statement about accounts, rendered in the signed-out panel. */
  note: string;
  /** Optional heading for the group. */
  label?: string;
  onActivate?: (capability: LockedCapability) => void;
  layout?: "list" | "inline";
}) {
  const { session, account } = useAccountSession();
  const [active, setActive] = useState<LockedCapability | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const panelId = useId();
  const pathname = usePathname() ?? "/";

  if (capabilities.length === 0) return null;

  /* The flagship hubs are `/powerball` and `/mega-millions`; the game ref is the path's own slug. */
  const gameRef = pathname.replace(/^\//, "").split("/")[0] || "site";
  const storeKey = (c: LockedCapability) => `${gameRef}:${c.key}`;

  const isOn = (c: LockedCapability): boolean => {
    if (!account) return false;
    switch (classifyIntentAction(c.key)) {
      case "follow-game":
        return account.followedGames.includes(gameRef);
      case "notification":
        return account.preferences.notifications[storeKey(c)]?.optedIn === true;
      case "preference":
        return account.preferences.page[storeKey(c)]?.value !== undefined
          && account.preferences.page[storeKey(c)]?.value !== "off";
      default:
        return false;
    }
  };

  const activate = (c: LockedCapability) => {
    setActive(c);
    onActivate?.(c);

    if (!session) {
      setOutcome(null);
      return;
    }

    const kind = classifyIntentAction(c.key);
    if (kind === "execution") {
      /* Honest: the review layer stands in for the DATABASE, not for exports, model AI or batch runs. */
      setOutcome({ kind: "needs-service", capability: c });
      return;
    }
    const on = isOn(c);
    if (kind === "follow-game") {
      if (on) unfollowGame(gameRef);
      else followGame(gameRef);
    } else if (kind === "notification") {
      setNotificationPreference({
        key: storeKey(c),
        label: c.label,
        frequency: "Frequency shown where you turn each alert on.",
        optedIn: !on,
      });
    } else {
      setPagePreference(storeKey(c), on ? "off" : c.label);
    }
    setOutcome({ kind: "stored", capability: c, on: !on, notification: kind === "notification" });
  };

  return (
    <div className="lcfg-locked" data-locked-group={label ?? "capabilities"} data-auth-available="true">
      <p className="lcfg-lockedhead">
        {label ? <span className="lcfg-lockedhead__label">{label}</span> : null}
        <span className="lcfg-lockedhead__gate">Free account</span>
      </p>

      <ul className={`lcfg-lockedlist${layout === "inline" ? " lcfg-lockedlist--inline" : ""}`}>
        {capabilities.map((c) => (
          <li key={c.key}>
            <button
              type="button"
              className="lcfg-lockchip"
              data-capability={c.key}
              data-gate={c.gate}
              aria-expanded={active?.key === c.key}
              aria-pressed={session ? isOn(c) : undefined}
              aria-controls={panelId}
              onClick={() => activate(c)}
            >
              {/* A non-colour indicator, so the state is not carried by hue alone. */}
              <span className="lcfg-lockchip__icon" aria-hidden="true">
                {session && isOn(c) ? "✓" : "🔒"}
              </span>
              <span className="lcfg-lockchip__label">{c.label}</span>
              <span className="lcs-vh">{session ? "On your account menu" : "Needs a free account"}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Empty until a chip is chosen; `aria-live` announces it when it fills. */}
      <div className="lcfg-lockednote" id={panelId} role="status" aria-live="polite" data-activated={active?.key ?? "none"}>
        {active && !session ? (
          <>
            <p className="lcfg-lockednote__head">“{active.label}” needs a free LotteryCorner account</p>
            <p className="lcfg-fine">{active.benefit}</p>
            <p className="lcfg-fine lcfg-muted">{note}</p>
            {/* FD-DAT-04: the shared affordance — exact wording, real flow, intent captured on click. */}
            <p className="lcfg-actions">
              <SignInToUse
                className="lcfg-btn lcfg-btn--primary"
                intent={{
                  returnTo: pathname,
                  /* The FULL store key, so the continuation writes exactly where `isOn` reads. */
                  action: classifyIntentAction(active.key) === "follow-game" ? active.key : storeKey(active),
                  label: active.label,
                  /* FD-ACC-13: outward acts (posting) never auto-complete after sign-in. */
                  kind: isOutwardAction(active.key) ? "outward" : "private",
                  context: { class: classifyIntentAction(active.key), gameRef },
                }}
              />
            </p>
          </>
        ) : null}
        {outcome?.kind === "stored" ? (
          <>
            <p className="lcfg-lockednote__head">
              {outcome.on
                ? `“${outcome.capability.label}” is on for your account.`
                : `“${outcome.capability.label}” is off.`}
            </p>
            {outcome.on && outcome.notification ? (
              <p className="lcfg-fine lcfg-muted">
                Saved to your account (review data). No messages are sent yet — LotteryCorner has no email or
                push channel. Turning it off is one tap, here or in Settings.
              </p>
            ) : (
              <p className="lcfg-fine lcfg-muted">Saved to your account (review data). Change it here any time.</p>
            )}
          </>
        ) : null}
        {outcome?.kind === "needs-service" ? (
          <>
            <p className="lcfg-lockednote__head">“{outcome.capability.label}” isn’t connected yet</p>
            <p className="lcfg-fine">{outcome.capability.benefit}</p>
            <p className="lcfg-fine lcfg-muted">
              You’re signed in, but this one runs with the member tools service, which isn’t connected in this
              review build — nothing ran and nothing was saved.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
