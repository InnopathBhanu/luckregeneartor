/*
 * COMMUNITY PAGE-FAMILY ADVERTISING — the `NO_APPROVED_*_PROFILE` pattern, following `newsAdProfile.ts`.
 *
 * Authority: `CLAUDE.md` §12 (*"Each page family REQUIRES its own production ad-inventory audit before
 * implementation"*), 08A §21 (Community Home allowed/protected positions), 08 §31 and 08B §21 (protected
 * regions on entries).
 *
 * ══ THE AUDIT, AND ITS RESULT ══
 *
 * `04-sample-data/ad-slot-definitions.json` enumerates Home, State and mobile-snippet slots only. The legacy
 * production application HAS NO FORUM — there is no community page in production, so no community ad slot
 * family has ever existed, been captured, or been approved. The three governed anchors — `AD-CH00`, `AD-CH01`
 * (08A §2) and `AD-FE00` (08B §2) — therefore hold their blueprint positions and resolve to NOTHING: no
 * geometry is reserved (so no layout shift is invented), no placeholder is drawn, and nothing is removed,
 * renamed or re-homed. §12 forbids all of those. Activating them is an ad-operations task with founder
 * approval, not a page edit.
 */

export interface CommunityAdProfile {
  id: string;
  /** Approved placements. Typed empty so a placeholder cannot be added without changing the type. */
  placements: readonly never[];
  /** 08 §31 / 08A §21 / 08B §21 — the regions no future placement may interrupt. */
  protectedRegions: readonly string[];
  gap: string;
}

export const NO_APPROVED_COMMUNITY_PROFILE: CommunityAdProfile = Object.freeze({
  id: "none-pending-community-ad-audit",
  placements: [],
  protectedRegions: Object.freeze([
    "CH-01 composer — no ad inside the composer (08A §21)",
    "Between a safety notice and its guidance (08A §21)",
    "FE-03 root post (08 §31)",
    "First reply (08 §31)",
    "Helpful or accepted reply (08 §31)",
    "FE-06 AI/Research reply (08 §31)",
    "Privacy warning (08 §31)",
    "Moderation notice (08 §31)",
    "Responsible Play intervention (08 §31)",
  ]),
  gap:
    "No community advertising inventory exists to capture: the legacy production application has no forum, so "
    + "no community slot family was ever defined, and 04-sample-data/ad-slot-definitions.json carries none. "
    + "AD-CH00, AD-CH01 and AD-FE00 hold their 08A §2 / 08B §2 positions and resolve to nothing until an "
    + "ad-operations task defines and approves community inventory (CLAUDE.md §12).",
});

/** The advertising profile for the Community pages. One answer today, and it is "none, with a reason". */
export function communityAdProfile(): CommunityAdProfile {
  return NO_APPROVED_COMMUNITY_PROFILE;
}
