"use client";

/*
 * FOLLOW AND NOTIFICATIONS — FE-12, via the ACCOUNT STORE (Conflict 37: follow genuinely works end to end
 * against the review data layer).
 *
 * Entry / game / state follows are PRIVATE continuity actions (`FD-ACC-13`), so for a signed-out reader each
 * control renders the shared `FD-DAT-04` affordance ("Sign in free to use") carrying an FD-ACC-12 intent that
 * COMPLETES after sign-in — game and state follows through the session module's own classifier, the entry
 * follow as a page preference.
 *
 * Delivery honesty (`FD-ACC-11`): no email or push channel exists, so no delivery-frequency chooser renders —
 * a frequency menu with nothing behind it would promise delivery. The one sentence below says so.
 */

import { useAccountSession } from "@/lib/account/useAccountSession";
import {
  followGame, followState, setPagePreference, unfollowGame, unfollowState,
} from "@/lib/account/session";
import SignInToUse from "@/components/account/SignInToUse";

export default function FollowControls({
  entrySlug,
  entryTitle,
  gameId,
  stateCode,
}: {
  entrySlug: string;
  entryTitle: string;
  gameId: string | null;
  stateCode: string | null;
}) {
  const { session, account } = useAccountSession();
  const returnTo = `/community/${entrySlug}`;

  if (!session || !account) {
    return (
      <div className="lcc-follow" data-follow-state="anonymous">
        <p className="lcc-note">
          Follow this entry{gameId ? `, ${gameId.replace(/-/g, " ")}` : ""}
          {stateCode ? ` or ${stateCode.toUpperCase()}` : ""} to find it again from any page. A free account
          keeps your follows.
        </p>
        <SignInToUse
          className="lcc-quiet"
          intent={{
            returnTo,
            action: "follow-entry",
            label: `Follow “${entryTitle}”`,
            kind: "private",
            context: { class: "preference" },
          }}
        />
      </div>
    );
  }

  const entryKey = `follow-entry:${entrySlug}`;
  const entryFollowed = Boolean(account.preferences.page[entryKey]);
  const gameFollowed = gameId ? account.followedGames.includes(gameId) : false;
  const stateFollowed = stateCode ? account.followedStates.includes(stateCode) : false;

  return (
    <div className="lcc-follow" data-follow-state="signed-in">
      <button
        type="button"
        className="lcc-quiet"
        data-follow="entry"
        aria-pressed={entryFollowed}
        onClick={() => setPagePreference(entryKey, entryFollowed ? "" : `Following “${entryTitle}”`)}
      >
        {entryFollowed ? "Following this entry" : "Follow this entry"}
      </button>
      {gameId ? (
        <button
          type="button"
          className="lcc-quiet"
          data-follow="game"
          aria-pressed={gameFollowed}
          onClick={() => (gameFollowed ? unfollowGame(gameId) : followGame(gameId))}
        >
          {gameFollowed ? `Following ${gameId.replace(/-/g, " ")}` : `Follow ${gameId.replace(/-/g, " ")}`}
        </button>
      ) : null}
      {stateCode ? (
        <button
          type="button"
          className="lcc-quiet"
          data-follow="state"
          aria-pressed={stateFollowed}
          onClick={() => (stateFollowed ? unfollowState(stateCode) : followState(stateCode))}
        >
          {stateFollowed ? `Following ${stateCode.toUpperCase()}` : `Follow ${stateCode.toUpperCase()}`}
        </button>
      ) : null}
      <p className="lcc-fine">
        Follows are saved to your account. Nothing is emailed or pushed — no delivery channel exists yet, and
        none is pretended.
      </p>
    </div>
  );
}
