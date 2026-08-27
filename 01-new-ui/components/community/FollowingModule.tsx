"use client";

/*
 * CH-13 — FOLLOWING. 08A §15: a signed-in module for games, states, members, entries, systems and news
 * discussions, whose PUBLIC FALLBACK explains follow benefits without forcing sign-in early.
 *
 * The anonymous form below IS the server HTML (`useAccountSession`'s server snapshot is hard-coded anonymous,
 * Shell §33), so the public fallback is what crawlers and signed-out readers get; the member's own follows
 * hydrate in on their machine only.
 */

import Link from "next/link";
import { useAccountSession } from "@/lib/account/useAccountSession";

export default function FollowingModule() {
  const { session, account } = useAccountSession();

  if (!session || !account) {
    /* The 08A §15 public fallback — benefit, not a wall. */
    return (
      <div data-following-state="public-fallback">
        <p className="lcc-note">
          Follow the games, states, members and discussions you care about, and this spot brings you back to
          them — new replies, monthly threads, poll results. A free account keeps your follows; you can keep
          reading everything without one.
        </p>
        <ul className="lcc-linkrow">
          <li><Link href="/signup">Create a free account</Link></li>
          <li><Link href="/login">Sign in</Link></li>
        </ul>
      </div>
    );
  }

  const entryFollows = Object.entries(account.preferences.page)
    .filter(([key, pref]) => key.startsWith("follow-entry:") && pref.value)
    .map(([key]) => key.slice("follow-entry:".length));

  const nothing =
    account.followedGames.length === 0 && account.followedStates.length === 0 && entryFollows.length === 0;

  return (
    <div data-following-state="signed-in">
      {nothing ? (
        <p className="lcc-note" data-honest-empty="true">
          You are not following anything yet. Every entry has a Follow control; game and state pages have one
          too.
        </p>
      ) : (
        <>
          {account.followedGames.length > 0 ? (
            <p className="lcc-note" data-following="games">
              Games: {account.followedGames.map((g) => g.replace(/-/g, " ")).join(", ")}
            </p>
          ) : null}
          {account.followedStates.length > 0 ? (
            <p className="lcc-note" data-following="states">
              States: {account.followedStates.map((s) => s.toUpperCase()).join(", ")}
            </p>
          ) : null}
          {entryFollows.length > 0 ? (
            <ul className="lcc-linkrow" data-following="entries">
              {entryFollows.map((slug) => (
                <li key={slug}>
                  <Link href={`/community/${slug}`}>{slug.replace(/-/g, " ")}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
