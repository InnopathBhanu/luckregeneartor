/*
 * GAME PAGE ADVERTISING — LRG-GAME-049.
 *
 * Authority: CLAUDE.md §12 ("Each page family REQUIRES its own production ad-inventory audit before
 * implementation"; slot families for game pages "are named but not yet captured"), the task's ADS rules.
 *
 * ══ THE AUDIT, AND ITS RESULT ══
 *
 * `04-sample-data/ad-slot-definitions.json` enumerates 19 State slots, 21 Home slots, 4 mobile snippet slots
 * and 2 state-specific slots. For the Game Page it records only a REFERENCE note:
 *
 *   "gamePage": "lc_mgp_* / lc_mpg_* (+ mobile snippet slots)"
 *   "note": "Div IDs/size mappings not enumerated here — capture from their JSPs before building those pages."
 *
 * `03-docs/05-advertising/` contains a Home reconciliation and a State reconciliation. There is no Game Page
 * reconciliation and no `APP-*` approval for a Game Page profile. The legacy `game_upgrade_as.jsp` carries
 * no slot id of its own.
 *
 * So: no div id, no size mapping, no GAM path and no founder approval exist for a single Game Page slot.
 * The task's rule for that case is explicit — render no Game Page advertising and report the dependency —
 * and nothing in this task explicitly permits review placeholders.
 *
 * ══ WHAT THIS DOES NOT MEAN ══
 *
 * It is not a claim that the Game Page has no inventory; production clearly runs `lc_mgp_*`. It is the
 * absence of a captured, approved mapping. `AD-JO00` and `AD-JO01` remain in the governed BP-04B sequence
 * and resolve to nothing, so no geometry is reserved and no layout shift is introduced.
 */

export interface GameAdProfile {
  id: string;
  placements: readonly never[];
  gap: string;
}

export const NO_APPROVED_GAME_PROFILE: GameAdProfile = Object.freeze({
  id: "none-pending-game-ad-audit",
  placements: [],
  gap:
    "No Game Page advertising profile is captured or approved. `ad-slot-definitions.json` names the " +
    "lc_mgp_*/lc_mpg_* family but records no div ids or size mappings, and 03-docs/05-advertising has no " +
    "Game Page reconciliation. Capturing the slots from the legacy JSPs and approving a profile is an " +
    "ad-operations task, not an implementation change.",
});

/** The advertising profile for a guarded Game Page. One answer today, and it is "none, with a reason". */
export function gameAdProfileFor(_stateCode: string, _gameSlug: string): GameAdProfile {
  return NO_APPROVED_GAME_PROFILE;
}
