"use client";

/*
 * GS-07 — ACCOUNT / MY LOTTERYCORNER. LRG-ACCT-001.
 *
 * Authority: Global Shell v1.1 §33 — anonymous: "Sign in, create account and benefits"; signed-in: "My Games,
 * My Numbers, Matches, Following, Notifications, Settings"; security: "account/menu state must not be cached
 * into public pages." Plus §13 (the signed-in shell adds these without moving core facts or navigation),
 * `FD-ACC-02`/`FD-ACC-16` (zero Insider/paid/upgrade copy — test-swept), `FD-ACC-18` (per-option
 * notification frequency; easy disable), `CLAUDE.md` §14 (review data is labelled).
 *
 * ══ §33'S SECURITY RULE, IMPLEMENTED ══
 *
 * This is a client component whose FIRST render — server and hydration alike — is the anonymous state
 * (`useAccountSession`'s server snapshot is hard-coded anonymous). Member state appears only after hydration
 * reads the browser session, so no server-rendered or cached HTML anywhere can contain a member's name or
 * data. `tests/account-foundation.test.ts` asserts the pattern.
 *
 * ══ WHY THE PANEL IS INLINE, NOT A SET OF ROUTES ══
 *
 * GS-07 names menu ENTRIES, not URLs, and no member-area route is registered — `CLAUDE.md` §10 forbids
 * inventing routes, and the member routes are a later, separately-approved phase. So My Games, My Numbers,
 * Matches, Following and Settings render as sections of the menu panel itself, each backed by the real
 * review store: unfollow works, remove works, notification preferences toggle off (`FD-ACC-18`'s disable
 * path is one tap, exactly as easy as enable was).
 *
 * ══ MATCHES IS EMPTY AND SAYS SO ══
 *
 * A match is a claim about a real drawing against the reader's numbers. No matching service exists, so the
 * section renders its honest empty state. Fabricating one is prohibited outright (`CLAUDE.md` §14).
 */

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  removeNumberSet,
  setNotificationPreference,
  signOut,
  unfollowGame,
  unfollowState,
} from "@/lib/account/session";

/** GS-07 anonymous benefits line. Continuity, not truth (Constitution §17); free, always (`FD-ACC-15`). */
const BENEFITS_LINE = "Free — save your numbers, follow your games, and pick up where you left off.";

/** `FD-ACC-18` + `FD-ACC-11`: preferences are recorded; nothing is delivered, and no surface implies it is. */
const NO_DELIVERY_LINE =
  "Nothing is sent yet — LotteryCorner has no email or push channel. Your choices are saved to your account "
  + "and will be waiting when one exists.";

export default function AccountMenu({ variant }: { variant: "desktop" | "mobile" }) {
  const { session, account } = useAccountSession();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const router = useRouter();

  /* ---------------------------------------------------------------- anonymous (also the server render) */
  if (!session || !account) {
    return (
      <div className="lca-menu lca-menu--anon" data-account-menu="anonymous" data-variant={variant}>
        <Link className="lca-menu__link" href="/login">
          Sign in
        </Link>
        {variant === "desktop" ? (
          <>
            <Link className="lca-menu__link lca-menu__link--register" href="/signup">
              Create free account
            </Link>
            <span className="lca-menu__benefits">{BENEFITS_LINE}</span>
          </>
        ) : null}
      </div>
    );
  }

  /* ---------------------------------------------------------------- signed in (client only — §33) */
  const doSignOut = () => {
    setOpen(false);
    signOut();
    router.refresh();
  };

  const optedIn = Object.values(account.preferences.notifications).filter((p) => p.optedIn);

  return (
    <div className="lca-menu lca-menu--member" data-account-menu="signed-in" data-variant={variant}>
      <button
        type="button"
        className="lca-menu__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" className="lca-menu__avatar">
          {account.displayName.slice(0, 1).toUpperCase()}
        </span>
        <span className="lca-menu__name">{account.displayName}</span>
      </button>

      <div className="lca-panel" id={panelId} hidden={!open}>
        {/* §14: review provenance, stated where the data shows. */}
        <p className="lca-fine lca-panel__provenance">
          Review build — your account and everything below are stored on this device.
        </p>

        <section className="lca-panel__section" aria-label="My Games">
          <h2 className="lca-panel__h">My Games</h2>
          {account.followedGames.length === 0 ? (
            <p className="lca-fine">You aren’t following any games yet. Look for Follow on any game page.</p>
          ) : (
            <ul className="lca-panel__list">
              {account.followedGames.map((g) => (
                <li key={g}>
                  <span>{g}</span>
                  <button type="button" className="lca-panel__action" onClick={() => unfollowGame(g)}>
                    Unfollow
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lca-panel__section" aria-label="My Numbers">
          <h2 className="lca-panel__h">My Numbers</h2>
          {account.savedNumberSets.length === 0 ? (
            <p className="lca-fine">No saved number sets yet. Save a line from a checker or generator.</p>
          ) : (
            <ul className="lca-panel__list">
              {account.savedNumberSets.map((s) => (
                <li key={s.id}>
                  <span>
                    {s.label} — {s.main.join(", ")}
                    {s.special !== null ? ` + ${s.special}` : ""}
                  </span>
                  <button type="button" className="lca-panel__action" onClick={() => removeNumberSet(s.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lca-panel__section" aria-label="Matches">
          <h2 className="lca-panel__h">Matches</h2>
          {/* Always the honest state: no matching service exists and no match is ever fabricated (§14). */}
          <p className="lca-fine">
            No matches yet. When a drawing is checked against your saved numbers, results show here.
          </p>
        </section>

        <section className="lca-panel__section" aria-label="Following">
          <h2 className="lca-panel__h">Following</h2>
          {account.followedStates.length === 0 && account.followedGames.length === 0 ? (
            <p className="lca-fine">Follow a state or a game and it shows up here.</p>
          ) : (
            <ul className="lca-panel__list">
              {account.followedStates.map((s) => (
                <li key={s}>
                  <span>{s.toUpperCase()}</span>
                  <button type="button" className="lca-panel__action" onClick={() => unfollowState(s)}>
                    Unfollow
                  </button>
                </li>
              ))}
              {account.followedGames.map((g) => (
                <li key={`g-${g}`}>
                  <span>{g}</span>
                  <button type="button" className="lca-panel__action" onClick={() => unfollowGame(g)}>
                    Unfollow
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lca-panel__section" aria-label="Settings">
          <h2 className="lca-panel__h">Settings</h2>
          <p className="lca-fine">
            Signed in as {account.displayName} ({account.email}).
          </p>
          <h3 className="lca-panel__h3">Notification preferences</h3>
          {optedIn.length === 0 ? (
            <p className="lca-fine">
              None turned on. Each alert on a game page is its own choice, with its own frequency.
            </p>
          ) : (
            <ul className="lca-panel__list">
              {optedIn.map((p) => (
                <li key={p.key}>
                  <span>
                    {p.label} <span className="lca-panel__freq">({p.frequency})</span>
                  </span>
                  {/* `FD-ACC-18`: disable is one tap, exactly as easy as enable was. */}
                  <button
                    type="button"
                    className="lca-panel__action"
                    onClick={() =>
                      setNotificationPreference({
                        key: p.key,
                        label: p.label,
                        frequency: p.frequency,
                        optedIn: false,
                      })
                    }
                  >
                    Turn off
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="lca-fine">{NO_DELIVERY_LINE}</p>
        </section>

        <button type="button" className="lca-panel__signout" onClick={doSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
