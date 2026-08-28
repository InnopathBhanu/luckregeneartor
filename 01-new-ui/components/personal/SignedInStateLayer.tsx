"use client";

/*
 * SIGNED-IN STATE LAYER — PF-02 Part VII §32, in the §32 order, ids verbatim. LRG-PERS-001.
 *
 * ══ THE LAYERING DECISION (Global Shell §33) ══
 *
 * Same rule as the Home layer, stated at the mount too: the server HTML is the anonymous State composition,
 * byte-identical whether or not anyone is signed in, because this component returns null on the server and
 * on the first client render (`useAccountSession`'s server snapshot is hard-coded anonymous). It mounts
 * above the anonymous content after hydration, only when a browser session exists, and it is fed ONLY by
 * the account store plus `facts` — a projection of the State page's own governed result groups. No fetch,
 * no fact the public page does not already show, no member state in any cache.
 *
 * AD-SS00 and AD-SS02 (§32 rows 2 and 16) belong to the anonymous composition's approved inventory and are
 * NOT re-rendered here — the layer must never move, duplicate or repurpose a slot (`CLAUDE.md` §12).
 * AD-SS01 is the one anchor this sequence introduces, typed and empty.
 * The complete signed-in sequence is progressively disclosed from one compact summary so sparse account
 * states cannot push the public result task several viewports down the page.
 */

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { followState } from "@/lib/account/session";
import {
  readGuestProgress,
  readGuestProgressServer,
  subscribeGuestProgress,
} from "@/lib/personal/guestProgress";
import {
  computeMatches,
  continueItems,
  FOLLOW_FIRST_GAME_SENTENCE,
  myLotteryDayRows,
  PERSONAL_FEED_SCOPE_SENTENCE,
  SCRATCHERS_EMPTY_SENTENCE,
  STATE_SIGNED_IN_SEQUENCE,
  WHERE_TO_PLAY_ACCOUNT_NEUTRAL,
  type PageGameFact,
} from "@/lib/personal/personalModel";
import {
  ControlsBlock,
  ContinueList,
  MatchesBlock,
  MyDayList,
  PersonalLayerDisclosure,
  PersonalSection,
  TypedEmptyAdAnchor,
} from "./PersonalCards";
import { TAX_CALCULATOR_PATH } from "@/lib/tools/toolManifest";

export default function SignedInStateLayer({
  stateCode,
  stateName,
  facts,
}: {
  stateCode: string;
  stateName: string;
  /** Projected from the State page's own result groups — the layer adds no lottery fact of its own. */
  facts: readonly PageGameFact[];
}) {
  const { session, account } = useAccountSession();
  const guest = useSyncExternalStore(subscribeGuestProgress, readGuestProgress, readGuestProgressServer);

  /* Anonymous — including every server render and the first client render. Nothing, by design (§33). */
  if (!session || !account) return null;

  /* This page's facts are already state-scoped: the state's own games plus the multi-state games it offers. */
  const factRefs = new Set(facts.map((f) => f.gameRef));
  const followedHere = account.followedGames.filter((g) => factRefs.has(g));
  const rows = myLotteryDayRows(followedHere, facts);
  const setsHere = account.savedNumberSets.filter((s) => factRefs.has(s.gameRef));
  const matches = computeMatches(setsHere, facts);
  const followsThisState = account.followedStates.includes(stateCode);
  const items = continueItems(
    account,
    guest.map((g) => ({ label: g.label, ...(g.detail !== undefined ? { detail: g.detail } : {}), savedAtIso: g.savedAtIso })),
    TAX_CALCULATOR_PATH,
  );
  const upcoming = rows.filter((r) => r.fact?.nextDrawDisplay);
  const ids = STATE_SIGNED_IN_SEQUENCE.map((s) => s.id);
  const heading = (id: string) =>
    (STATE_SIGNED_IN_SEQUENCE.find((s) => s.id === id)?.heading ?? id).replace("[State]", stateName);

  /* S-03S — ONE deterministic next action, chosen from what the account actually lacks here. */
  const nextAction = !followsThisState
    ? { text: `Follow ${stateName} to keep this page at the front of your LotteryCorner.`, follow: true }
    : followedHere.length === 0
      ? { text: FOLLOW_FIRST_GAME_SENTENCE, follow: false }
      : setsHere.length === 0
        ? {
            text:
              `Save a set of numbers for a ${stateName} game you follow and it is checked here every time `
              + "you come back.",
            follow: false,
          }
        : { text: "Your saved numbers are checked in My State Matches below.", follow: false };

  return (
    <PersonalLayerDisclosure
      layer="state"
      order={ids.join(",")}
      title={`My ${stateName} Lottery`}
      summary={`${followedHere.length} followed ${followedHere.length === 1 ? "game" : "games"} here · ${setsHere.length} saved ${setsHere.length === 1 ? "line" : "lines"}`}
    >
      {/* 1 — S-01S. PF-02 §33: only meaningful changes, summarized. */}
      <PersonalSection family="state" id="S-01S" heading={heading("S-01S")} protectedZone>
        <p className="lcp-personal__muted">
          Signed in as <strong>{account.displayName}</strong> — you follow {followedHere.length}{" "}
          {followedHere.length === 1 ? "game" : "games"} on this page and {setsHere.length} of your saved{" "}
          {setsHere.length === 1 ? "line is" : "lines are"} checked against its results. The full public
          page continues below, unchanged.
        </p>
      </PersonalSection>

      {/* 2 — S-02S */}
      <PersonalSection
        family="state"
        id="S-02S"
        heading={heading("S-02S")}
        context="From the results already on this page."
        protectedZone
      >
        {rows.length === 0 ? (
          <p className="lcp-personal__muted">
            You are not following any of the games on this page yet. {FOLLOW_FIRST_GAME_SENTENCE}
          </p>
        ) : (
          <MyDayList rows={rows} />
        )}
      </PersonalSection>

      {/* 3 — S-03S */}
      <PersonalSection family="state" id="S-03S" heading={heading("S-03S")}>
        <p>{nextAction.text}</p>
        {nextAction.follow ? (
          <button type="button" className="lcp-personal__btn" onClick={() => followState(stateCode)}>
            Follow {stateName}
          </button>
        ) : null}
      </PersonalSection>

      {/* 4 — S-04S */}
      <PersonalSection family="state" id="S-04S" heading={heading("S-04S")}>
        {upcoming.length === 0 ? (
          <p className="lcp-personal__muted">
            No upcoming drawing for the games you follow is listed on this page.
          </p>
        ) : (
          <ul className="lcp-personal__list">
            {upcoming.map((r) => (
              <li key={r.gameRef} className="lcp-personal__row">
                <span className="lcp-personal__game">{r.gameLabel}</span>
                <span className="lcp-personal__rowbody">{r.fact!.nextDrawDisplay}</span>
              </li>
            ))}
          </ul>
        )}
      </PersonalSection>

      {/* 5 — S-05S. Result verification: protected zone. */}
      <PersonalSection family="state" id="S-05S" heading={heading("S-05S")} protectedZone>
        <MatchesBlock outcomes={matches} savedCount={setsHere.length} />
      </PersonalSection>

      {/* 6 — S-06S. Preferences only — recording a choice, never claiming delivery (FD-ACC-11/18). */}
      <PersonalSection family="state" id="S-06S" heading={heading("S-06S")}>
        <p className="lcp-personal__muted">
          Alert choices live in My Controls below. Each option shows how often it would apply, and nothing
          is sent yet — there is no email or push channel.
        </p>
      </PersonalSection>

      {/* 7 — AD-SS01: typed and empty; see TypedEmptyAdAnchor for the CLAUDE.md §12 reasoning. */}
      <TypedEmptyAdAnchor id="AD-SS01" />

      {/* 8 — S-07S */}
      <PersonalSection family="state" id="S-07S" heading={heading("S-07S")}>
        <ContinueList items={items} />
      </PersonalSection>

      {/* 9 — S-08S */}
      <PersonalSection family="state" id="S-08S" heading={heading("S-08S")}>
        <p>
          {followsThisState
            ? `You follow ${stateName}.`
            : `You are not following ${stateName} yet.`}{" "}
          <Link href="/community">Community discussions</Link> are open to read; posting uses your member
          name.
        </p>
      </PersonalSection>

      {/* 10 — S-09S */}
      <PersonalSection family="state" id="S-09S" heading={heading("S-09S")}>
        <p>
          <Link href="/news">News</Link> covers every state; the {stateName} winners and guides this page
          carries are below in the public sections.{" "}
          <span className="lcp-personal__muted">{PERSONAL_FEED_SCOPE_SENTENCE}</span>
        </p>
      </PersonalSection>

      {/* 11 — S-10S. Never infers purchase legality from the account (CLAUDE.md §13). */}
      <PersonalSection family="state" id="S-10S" heading={heading("S-10S")}>
        <p data-account-neutral="true">{WHERE_TO_PLAY_ACCOUNT_NEUTRAL}</p>
        <p className="lcp-personal__muted">
          This page&apos;s Where to Play section below reflects {stateName}&apos;s own rules.
        </p>
      </PersonalSection>

      {/* 12 — S-11S. Honest empty state: there is no scratcher data to follow. */}
      <PersonalSection family="state" id="S-11S" heading={heading("S-11S")}>
        <p className="lcp-personal__muted" data-scratchers-empty="true">{SCRATCHERS_EMPTY_SENTENCE}</p>
      </PersonalSection>

      {/* 13 — S-12S */}
      <PersonalSection family="state" id="S-12S" heading={heading("S-12S")}>
        <ControlsBlock account={account} />
      </PersonalSection>

      <p className="lcp-personal__fine">
        Everything below is the same public {stateName} page every reader sees — your account changes what
        comes first, never the facts.
      </p>
    </PersonalLayerDisclosure>
  );
}
