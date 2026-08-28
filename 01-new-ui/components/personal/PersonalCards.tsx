"use client";

/*
 * SHARED PERSONAL-LAYER PIECES — used by SignedInHomeLayer and SignedInStateLayer. LRG-PERS-001.
 *
 * Everything here is client-only by construction (the layers render null without a browser session), reuses
 * the shared SectionChrome anatomy so the personalized sections carry the same governed section markup as
 * the anonymous page, and draws with the `.lcp-personal` grammar in `globals.css` (tokens only).
 *
 * COPY DISCIPLINE (BP-02 §38 / PF-02 §32, test-swept): a match is a coincidence with a published drawing —
 * never a prize, never a near-anything, never urgency. Notification choices show their per-option frequency
 * and claim no delivery (`FD-ACC-18`, `FD-ACC-11`). Nothing here mentions paid tiers — there are none
 * (`FD-ACC-15`; `CLAUDE.md` §16 keeps Member/Insider commerce closed).
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { UniversalSection } from "@/components/shell/SectionChrome";
import type { AccountRecord } from "@/lib/account/accountContract";
import { setNotificationPreference, unfollowGame, unfollowState } from "@/lib/account/session";
import { clearGuestProgress } from "@/lib/personal/guestProgress";
import { FOOTER_COPY, HELPLINE_TEL } from "@/lib/layout/globalFooterConfig";
import {
  labelFromRef,
  MATCH_BOUNDARY_SENTENCE,
  NO_DELIVERY_SENTENCE,
  NOTIFICATION_OPTIONS,
  type ContinueItem,
  type MyDayRow,
  type PageGameFact,
  type PersonalInsight,
  type PersonalMatchOutcome,
} from "@/lib/personal/personalModel";
import disclosureStyles from "./PersonalLayerDisclosure.module.css";

/* ------------------------------------------------------------------ compact layer */

/**
 * Keeps the complete governed signed-in sequence available without forcing a stack of sparse account
 * panels ahead of the page's primary results. Native details/summary gives keyboard and screen-reader
 * users the same explicit control, starts closed without client state, and therefore stays hydration-safe.
 */
export function PersonalLayerDisclosure({
  layer,
  order,
  title,
  summary,
  children,
}: {
  layer: "home" | "state";
  order: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div
      className="lcp-personal"
      data-personal-layer={layer}
      data-user-state="signed-in"
      data-personal-order={order}
      data-personal-default-state="collapsed"
    >
      <details className={disclosureStyles.disclosure}>
        <summary className={disclosureStyles.summary} data-personal-summary="true">
          <span>
            <span className={disclosureStyles.title}>{title}</span>
            <span className={disclosureStyles.meta}>{summary}</span>
          </span>
          <span className={`${disclosureStyles.action} ${disclosureStyles.actionShow}`}>Show</span>
          <span className={`${disclosureStyles.action} ${disclosureStyles.actionHide}`}>Hide</span>
        </summary>
        <div className={disclosureStyles.content}>{children}</div>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ section wrapper */

/**
 * One personalized section, in the page family's own section anatomy. `family` selects the skin prefix
 * (Home `lcp`, State `lcs`) so the layer inherits the page's grammar instead of inventing one.
 */
export function PersonalSection({
  family,
  id,
  heading,
  context,
  protectedZone = false,
  children,
}: {
  family: "home" | "state";
  id: string;
  heading: string;
  context?: string;
  protectedZone?: boolean;
  children: ReactNode;
}) {
  return (
    <UniversalSection
      family={family}
      className="lcp-personal__sec"
      anatomy={{
        sectionId: id,
        heading,
        ...(context !== undefined ? { context } : {}),
        state: "personalized",
        sourceClass: "deterministic",
        intelligence: "deterministic",
        protectedZone,
      }}
      extraAttributes={{ "data-personal-section": id }}
    >
      {children}
    </UniversalSection>
  );
}

/**
 * A TYPED EMPTY advertising anchor — AD-HS01 / AD-SS01.
 *
 * `CLAUDE.md` §12: ad inventory is transcribed from production, never invented — and NO signed-in slot
 * family has been captured, so this anchor is typed (governed id, auditable in the DOM) and EMPTY (no
 * container, no reservation, no creative). The blueprint position is preserved for the day ad ops defines
 * inventory here; nothing from the anonymous page's approved slots is moved, duplicated or repurposed.
 */
export function TypedEmptyAdAnchor({ id }: { id: string }) {
  return (
    <div
      id={id}
      data-ad-anchor-id={id}
      data-ad-active-placement="false"
      data-ad-typed-empty="no-signed-in-inventory-captured"
    />
  );
}

/* ------------------------------------------------------------------ numbers */

/** Drawn numbers as text (never image), special ball named and visually distinct beyond colour alone. */
export function FactNumbers({ fact }: { fact: PageGameFact }) {
  return (
    <span className="lcp-personal__nums">
      {fact.main.map((n, i) => (
        <span key={`m-${i}`} className="lcp-personal__num">{n}</span>
      ))}
      {fact.special !== null ? (
        <span className="lcp-personal__num lcp-personal__num--special">
          <span className="lcp-personal__speciallabel">{fact.specialLabel ?? "Special"}</span> {fact.special}
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ my day rows */

export function MyDayList({ rows }: { rows: readonly MyDayRow[] }) {
  return (
    <ul className="lcp-personal__list">
      {rows.map((row) => (
        <li key={row.gameRef} className="lcp-personal__row" data-my-day-game={row.gameRef}>
          <span className="lcp-personal__game">{row.gameLabel}</span>
          {row.fact ? (
            <span className="lcp-personal__rowbody">
              {/* Draw date and game are announced before values (CLAUDE.md §9). */}
              <span className="lcp-personal__date">Drawing of {row.fact.drawDateDisplay}</span>
              <FactNumbers fact={row.fact} />
              {row.fact.nextDrawDisplay ? (
                <span className="lcp-personal__next">Next drawing: {row.fact.nextDrawDisplay}</span>
              ) : null}
            </span>
          ) : (
            <span className="lcp-personal__rowbody lcp-personal__muted">
              The latest result is not on this page — it is on the game&apos;s own page.
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ matches */

export function MatchesBlock({
  outcomes,
  savedCount,
}: {
  outcomes: readonly PersonalMatchOutcome[];
  savedCount: number;
}) {
  if (savedCount === 0) {
    return (
      <p className="lcp-personal__muted">
        Save a set of numbers on a game page and it is checked here against the results shown on this page.
      </p>
    );
  }
  const notOnPage = savedCount - outcomes.length;
  return (
    <div>
      <ul className="lcp-personal__list">
        {outcomes.map((o) => (
          <li key={`${o.setId}-${o.drawDateIso}`} className="lcp-personal__row" data-match-kind={o.kind}>
            <span className="lcp-personal__game">{o.gameLabel}</span>
            <span className="lcp-personal__rowbody">
              <span className="lcp-personal__date">Drawing of {o.drawDateDisplay}</span>
              <span>{o.sentence}</span>
            </span>
          </li>
        ))}
      </ul>
      {notOnPage > 0 ? (
        <p className="lcp-personal__muted">
          {notOnPage === 1 ? "One saved line is" : `${notOnPage} saved lines are`} for games whose results
          are not on this page, so {notOnPage === 1 ? "it was" : "they were"} not checked here.
        </p>
      ) : null}
      <p className="lcp-personal__fine">{MATCH_BOUNDARY_SENTENCE}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ insights */

export function InsightList({ insights }: { insights: readonly PersonalInsight[] }) {
  return (
    <ul className="lcp-personal__list">
      {insights.map((ins, i) => (
        <li key={i} className="lcp-personal__insight">
          <span>{ins.text}</span>
          {/* H-05S: every insight states why it is shown. Part of the contract, not decoration. */}
          <span className="lcp-personal__why" data-why-shown="true">{ins.whyShown}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ continue */

export function ContinueList({ items }: { items: readonly ContinueItem[] }) {
  if (items.length === 0) {
    return (
      <p className="lcp-personal__muted">
        Nothing saved yet. Saved numbers, saved tax scenarios and unfinished tool inputs appear here.
      </p>
    );
  }
  return (
    <ul className="lcp-personal__list">
      {items.map((it, i) => (
        <li key={`${it.kind}-${i}`} className="lcp-personal__row" data-continue-kind={it.kind}>
          <span className="lcp-personal__rowbody">
            <span>{it.href ? <Link href={it.href}>{it.label}</Link> : it.label}</span>
            {it.detail ? <span className="lcp-personal__muted">{it.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ controls */

/**
 * The controls block (H-10S / S-12S): follows with one-tap unfollow, the `FD-ACC-18` notification
 * preferences — each option its own affirmative choice, its own visible frequency, and the plain no-delivery
 * sentence beside all of them — a clear-device-data control, and responsible-play access.
 *
 * CLEAR DEVICE DATA clears the device-local guest-progress store (Shell §12's Clear, offered signed-in too:
 * the device record is never uploaded, so the account controls are the one place a signed-in reader can
 * remove it). It says exactly what it removes and that the account is untouched.
 *
 * RESPONSIBLE PLAY: `/responsible-play` does not exist yet (`globalShellModel` GS-15 records it as
 * unavailable), and a dead link would be a disabled control dressed as a working one (`CLAUDE.md` §9). So
 * this renders the same live access the footer strip renders — the helpline `tel:` destination, which is
 * real and actionable on every device. No commerce sits anywhere near it.
 */
export function ControlsBlock({ account }: { account: AccountRecord }) {
  return (
    <div className="lcp-personal__controls">
      <h3 className="lcp-personal__subhead">Following</h3>
      {account.followedGames.length === 0 && account.followedStates.length === 0 ? (
        <p className="lcp-personal__muted">You are not following any games or states yet.</p>
      ) : (
        <ul className="lcp-personal__list">
          {account.followedGames.map((g) => (
            <li key={`g-${g}`} className="lcp-personal__row">
              <span className="lcp-personal__rowbody">{labelFromRef(g)}</span>
              <button type="button" className="lcp-personal__btn" onClick={() => unfollowGame(g)}>
                Unfollow
              </button>
            </li>
          ))}
          {account.followedStates.map((s) => (
            <li key={`s-${s}`} className="lcp-personal__row">
              <span className="lcp-personal__rowbody">{s.toUpperCase()}</span>
              <button type="button" className="lcp-personal__btn" onClick={() => unfollowState(s)}>
                Unfollow
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3 className="lcp-personal__subhead">Notification preferences</h3>
      <ul className="lcp-personal__list">
        {NOTIFICATION_OPTIONS.map((opt) => {
          const chosen = account.preferences.notifications[opt.key]?.optedIn === true;
          return (
            <li key={opt.key} className="lcp-personal__pref">
              <label className="lcp-personal__preflabel">
                <input
                  type="checkbox"
                  checked={chosen}
                  onChange={(ev) =>
                    setNotificationPreference({
                      key: opt.key,
                      label: opt.label,
                      frequency: opt.frequency,
                      optedIn: ev.currentTarget.checked,
                    })
                  }
                />
                <span>{opt.label}</span>
              </label>
              {/* FD-ACC-18: the frequency is declared BEFORE the choice, per option. */}
              <span className="lcp-personal__why" data-frequency={opt.key}>{opt.frequency}</span>
            </li>
          );
        })}
      </ul>
      <p className="lcp-personal__fine" data-no-delivery="true">{NO_DELIVERY_SENTENCE}</p>
      <h3 className="lcp-personal__subhead">This device</h3>
      <p className="lcp-personal__muted">
        This browser keeps a small device-local record of recent activity (Shell §12 guest progress). It is
        stored on this device only and was never uploaded — clearing it does not change your account.
      </p>
      <button
        type="button"
        className="lcp-personal__btn"
        data-clear-device-data="true"
        onClick={clearGuestProgress}
      >
        Clear data stored on this device
      </button>
      <h3 className="lcp-personal__subhead">Responsible play</h3>
      <p className="lcp-personal__muted" data-responsible-play="true">
        {FOOTER_COPY.helpHeading}{" "}
        <a className="lcp-personal__keep" href={HELPLINE_TEL} data-helpline="true">
          {FOOTER_COPY.helpNumber}
        </a>{" "}
        {FOOTER_COPY.helpSupport}
      </p>
    </div>
  );
}
