"use client";

/*
 * SIGNED-IN HOME LAYER — BP-02 Part VI §38, in the §38 order, ids verbatim. LRG-PERS-001.
 *
 * ══ THE LAYERING DECISION (Global Shell §33) ══
 *
 * "Account/menu state must not be cached into public pages." So this layer is CLIENT-ONLY: on the server —
 * and on the first client render — `useAccountSession()` returns the hard-coded anonymous snapshot and this
 * component returns null, byte-for-byte nothing. The anonymous Home composition IS the server HTML, cached
 * and crawled exactly as before; the personalized sections mount above it after hydration, only when a
 * session exists in browser storage, fed ONLY by the account store and by `facts` — a projection of the
 * page's own anonymous view model. No fetch, no new lottery fact, no member state on any server.
 *
 * §38's own closing rule is why the anonymous page stays whole below this layer: "The signed-in page
 * retains broad national and state discovery. Personalization changes priority, not fact ownership."
 */

import Link from "next/link";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { useSyncExternalStore } from "react";
import {
  readGuestProgress,
  readGuestProgressServer,
  subscribeGuestProgress,
} from "@/lib/personal/guestProgress";
import {
  computeMatches,
  continueItems,
  FOLLOW_FIRST_GAME_SENTENCE,
  HOME_SIGNED_IN_SEQUENCE,
  myLotteryDayRows,
  PERSONAL_FEED_SCOPE_SENTENCE,
  WHERE_TO_PLAY_ACCOUNT_NEUTRAL,
  worthKnowingInsights,
  type PageGameFact,
} from "@/lib/personal/personalModel";
import {
  ControlsBlock,
  ContinueList,
  FactNumbers,
  InsightList,
  MatchesBlock,
  MyDayList,
  PersonalSection,
  TypedEmptyAdAnchor,
} from "./PersonalCards";
import { flagshipRoutePaths } from "@/lib/flagship/flagshipRegistry";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { labelFromRef } from "@/lib/personal/personalModel";
import { TAX_CALCULATOR_PATH } from "@/lib/tools/toolManifest";

export default function SignedInHomeLayer({ facts }: { facts: readonly PageGameFact[] }) {
  const { session, account } = useAccountSession();
  const guest = useSyncExternalStore(subscribeGuestProgress, readGuestProgress, readGuestProgressServer);

  /* Anonymous — including every server render and the first client render. Nothing, by design (§33). */
  if (!session || !account) return null;

  const rows = myLotteryDayRows(account.followedGames, facts);
  const onPage = rows.filter((r) => r.fact !== null);
  const matches = computeMatches(account.savedNumberSets, facts);
  const insights = worthKnowingInsights(account, facts);
  const items = continueItems(
    account,
    guest.map((g) => ({ label: g.label, ...(g.detail !== undefined ? { detail: g.detail } : {}), savedAtIso: g.savedAtIso })),
    TAX_CALCULATOR_PATH,
  );
  /* Only registry-served routes may be linked (CLAUDE.md §10) — never a URL derived from a follow string. */
  const followedStateLinks = account.followedStates.filter((code) => servesPage("state", code));
  const upcoming = onPage.filter((r) => r.fact?.nextDrawDisplay);
  const ids = HOME_SIGNED_IN_SEQUENCE.map((s) => s.id);
  const heading = (id: string) => HOME_SIGNED_IN_SEQUENCE.find((s) => s.id === id)?.heading ?? id;

  return (
    <div
      className="lcp-personal"
      data-personal-layer="home"
      data-user-state="signed-in"
      data-personal-order={ids.join(",")}
    >
      <p className="lcp-personal__hello">
        Signed in as <strong>{account.displayName}</strong>. Your page starts with what you follow; everything
        public continues below, unchanged.
      </p>

      {/* 1 — H-01S */}
      <PersonalSection family="home" id="H-01S" heading={heading("H-01S")} protectedZone>
        {rows.length === 0 ? (
          <div>
            <p className="lcp-personal__muted">{FOLLOW_FIRST_GAME_SENTENCE}</p>
            <ul className="lcp-personal__list">
              {flagshipRoutePaths().map((path) => (
                <li key={path} className="lcp-personal__row">
                  <Link href={path}>{labelFromRef(path.slice(1))}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <MyDayList rows={rows} />
        )}
      </PersonalSection>

      {/* 2 — H-02S */}
      <PersonalSection
        family="home"
        id="H-02S"
        heading={heading("H-02S")}
        context="From the results and jackpots already on this page."
      >
        {onPage.length === 0 ? (
          <p className="lcp-personal__muted">
            None of the games you follow has a result on this page. The featured games and jackpots below
            cover the national picture.
          </p>
        ) : (
          <ul className="lcp-personal__list">
            {onPage.map((r) => (
              <li key={r.gameRef} className="lcp-personal__row">
                <span className="lcp-personal__game">{r.gameLabel}</span>
                <span className="lcp-personal__rowbody">
                  <span className="lcp-personal__date">Drawing of {r.fact!.drawDateDisplay}</span>
                  <FactNumbers fact={r.fact!} />
                  {r.fact!.nextJackpotDisplay ? (
                    <span className="lcp-personal__next">Next jackpot: {r.fact!.nextJackpotDisplay}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PersonalSection>

      {/* 3 — H-03S. Result verification: a protected zone — no ad, promotion or interruption inside. */}
      <PersonalSection family="home" id="H-03S" heading={heading("H-03S")} protectedZone>
        <MatchesBlock outcomes={matches} savedCount={account.savedNumberSets.length} />
      </PersonalSection>

      {/* 4 — H-04S */}
      <PersonalSection family="home" id="H-04S" heading={heading("H-04S")}>
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

      {/* 5 — AD-HS01: typed and empty; see TypedEmptyAdAnchor for the CLAUDE.md §12 reasoning. */}
      <TypedEmptyAdAnchor id="AD-HS01" />

      {/* 6 — H-05S */}
      <PersonalSection family="home" id="H-05S" heading={heading("H-05S")}>
        {insights.length === 0 ? (
          <p className="lcp-personal__muted">
            Follow games or save numbers and this section explains what changed for them — and why each
            item is shown.
          </p>
        ) : (
          <InsightList insights={insights} />
        )}
      </PersonalSection>

      {/* 7 — H-06S */}
      <PersonalSection family="home" id="H-06S" heading={heading("H-06S")}>
        <p>
          You follow {account.followedGames.length}{" "}
          {account.followedGames.length === 1 ? "game" : "games"} and {account.followedStates.length}{" "}
          {account.followedStates.length === 1 ? "state" : "states"}.{" "}
          <Link href="/community">Community discussions</Link> are open to read; posting uses your member
          name.
        </p>
      </PersonalSection>

      {/* 8 — H-07S */}
      <PersonalSection family="home" id="H-07S" heading={heading("H-07S")}>
        <ContinueList items={items} />
      </PersonalSection>

      {/* 9 — H-08S */}
      <PersonalSection family="home" id="H-08S" heading={heading("H-08S")}>
        <p>
          <Link href="/news">News</Link> and <Link href="/community">community discussions</Link> cover the
          games and states everyone sees. <span className="lcp-personal__muted">{PERSONAL_FEED_SCOPE_SENTENCE}</span>
        </p>
      </PersonalSection>

      {/* 10 — H-09S. Never infers purchase legality from the account (CLAUDE.md §13). */}
      <PersonalSection family="home" id="H-09S" heading={heading("H-09S")}>
        <p data-account-neutral="true">{WHERE_TO_PLAY_ACCOUNT_NEUTRAL}</p>
        {followedStateLinks.length > 0 ? (
          <ul className="lcp-personal__list">
            {followedStateLinks.map((code) => (
              <li key={code} className="lcp-personal__row">
                <Link href={`/${code}`}>{code.toUpperCase()} lottery page</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </PersonalSection>

      {/* 11 — H-10S */}
      <PersonalSection family="home" id="H-10S" heading={heading("H-10S")}>
        <ControlsBlock account={account} />
      </PersonalSection>

      <p className="lcp-personal__fine">
        Everything below is the same public page every reader sees — your account changes what comes first,
        never the facts.
      </p>
    </div>
  );
}
