/*
 * FLAGSHIP GAME HUB ADVERTISING — LRG-FLAGSHIP-002.
 *
 * Authority: `CLAUDE.md` §12 (*"Each page family REQUIRES its own production ad-inventory audit before
 * implementation"*; the game, blog, jackpot and history slot families are *"named but not yet captured"*),
 * BP-04A §43 (*"Tier 2. … Production slot IDs and sizes require current-code audit."*).
 *
 * ══ THE AUDIT, AND ITS RESULT ══
 *
 * `04-sample-data/ad-slot-definitions.json` enumerates the Home, State and mobile-snippet slots. For the game
 * families it records a REFERENCE NOTE only — the `lc_mgp_*` / `lc_mpg_*` family with no div ids and no size
 * mappings — and directs that they be captured from their JSPs first. `03-docs/05-advertising/` holds a Home
 * reconciliation and a State reconciliation; there is **no flagship game hub reconciliation and no approval**.
 *
 * So no div id, no size mapping, no GAM path and no founder approval exists for a single flagship slot, and this
 * task authorises no ad-inventory work. `AD-FG00` … `AD-FG04` stay in the governed BP-04A §12 sequence and
 * resolve to nothing: no geometry is reserved, so no layout shift is introduced, and no placeholder is drawn.
 *
 * ══ WHAT THIS IS NOT ══
 *
 * It is not a claim that these pages carry no inventory — production plainly runs `lc_mgp_*`. It is the recorded
 * absence of a captured, approved mapping, and it is reported as a blocking dependency rather than worked around.
 * §12 forbids removing, merging, renaming, moving, reducing, reordering or repurposing any slot, and rendering
 * nothing where nothing is approved is the only action that does none of those things.
 */

export interface FlagshipAdProfile {
  id: string;
  /** Approved placements. Empty, and typed so a placeholder cannot be added without changing the type. */
  placements: readonly never[];
  /** BP-04A §43 ad tier, recorded for the eventual audit. */
  tier: 2;
  /** The protected regions §43 names, which no future placement may interrupt. */
  protectedRegions: readonly string[];
  gap: string;
}

export const NO_APPROVED_FLAGSHIP_PROFILE: FlagshipAdProfile = Object.freeze({
  id: "none-pending-flagship-ad-audit",
  placements: [],
  tier: 2,
  protectedRegions: Object.freeze([
    "FG-01 result and jackpot",
    "FG-01 countdown and buy clarity",
    "FG-02 check input and output",
    "FG-03 AI answer",
    "FG-04 possible-win and claim guidance",
    "FG-15 responsible play",
  ]),
  gap:
    "No flagship game hub advertising profile is captured or approved. `ad-slot-definitions.json` names the " +
    "lc_mgp_*/lc_mpg_* family but records no div ids or size mappings, and 03-docs/05-advertising has no game " +
    "hub reconciliation. Capturing the slots from the legacy templates and approving a profile is an " +
    "ad-operations task, not an implementation change.",
});

/** The advertising profile for a guarded flagship hub. One answer today, and it is "none, with a reason". */
export function flagshipAdProfileFor(_gameSlug: string): FlagshipAdProfile {
  return NO_APPROVED_FLAGSHIP_PROFILE;
}
