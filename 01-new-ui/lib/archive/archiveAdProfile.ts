/*
 * YEARLY ARCHIVE ADVERTISING — §A4.
 *
 * Authority: `CLAUDE.md` §12 (*"MUST NOT remove, merge, rename, move, reduce, reorder, or repurpose any slot
 * without explicit founder approval"*; *"Each page family REQUIRES its own production ad-inventory audit before
 * implementation"*; the `lc_gh_*` history-page family is *"named but not yet captured"*), archive blueprint §7
 * (protected priority). Adopted verbatim from `NO_APPROVED_GAME_PROFILE` / `NO_APPROVED_FLAGSHIP_PROFILE`, so the
 * three unaudited families answer the question the same way.
 *
 * ══ WHAT WENT WRONG, AND WHY THE PATTERN MATTERS ══
 *
 * `AD-AR00`…`AD-AR03` were REMOVED from `AR_ORDER` entirely. The reasoning at the time was sound as far as it went
 * — the V0 had printed a visible "Not rendered in this review" block naming the anchors and the `lc_gh_*` family,
 * which is implementation commentary a reader has no use for — but the fix went one step too far. Deleting a
 * governed anchor from the render order and keeping it only in `AR_ORDER_BLUEPRINT` means the RUNTIME composition no
 * longer knows the position exists. §12 forbids moving or reordering a slot, and a position that is absent from the
 * sequence a page actually walks is a position that gets silently re-derived the next time the order changes.
 *
 * The Game Page and the flagship hubs already solved this correctly: the anchors stay IN the governed sequence and
 * resolve to a typed-empty profile. Nothing is drawn, no geometry is reserved, no layout shift is introduced, no
 * placeholder appears — and the position survives in code, in `data-*`, and in the tests.
 *
 * ══ THE AUDIT, AND ITS RESULT ══
 *
 * `04-sample-data/ad-slot-definitions.json` enumerates the Home, State and mobile-snippet slots. For the history
 * pages it records a REFERENCE NOTE only — the `lc_gh_*` family, with no div ids and no size mappings — and directs
 * that they be captured from their JSPs first. `03-docs/05-advertising/` holds a Home reconciliation and a State
 * reconciliation; there is **no yearly-archive reconciliation and no founder approval**.
 *
 * So no div id, no size mapping, no GAM path and no approval exists for a single archive slot, and this task
 * authorises no ad-inventory work. It is NOT a claim that these pages carry no inventory — production plainly runs
 * `lc_gh_*` across roughly 8,700 archive URLs. It is the recorded ABSENCE of a captured, approved mapping, reported
 * as a blocking dependency rather than worked around.
 */

import type { ArchiveSectionId } from "./archiveContract";

export interface ArchiveAdProfile {
  id: string;
  /** Approved placements. Empty, and typed `never` so a placeholder cannot be added without changing the type. */
  placements: readonly never[];
  /** The governed anchor positions this page family owns, preserved for the eventual ad-operations audit. */
  anchors: readonly ArchiveSectionId[];
  /** Regions blueprint §7 protects, which no future placement may interrupt (`CLAUDE.md` §12). */
  protectedRegions: readonly string[];
  gap: string;
}

export const NO_APPROVED_ARCHIVE_PROFILE: ArchiveAdProfile = Object.freeze({
  id: "none-pending-archive-ad-audit",
  placements: [],
  anchors: Object.freeze(["AD-AR00", "AD-AR01", "AD-AR02", "AD-AR03"] as const),
  protectedRegions: Object.freeze([
    "AR-01 year identity and concise summary",
    "AR-05 the result rows",
    "AR-06 search input and its matching results",
    "AR-10 sources, methodology and the corrections route",
  ]),
  gap:
    "No yearly-archive advertising profile is captured or approved. `ad-slot-definitions.json` names the lc_gh_* "
    + "history-page family but records no div ids or size mappings, and 03-docs/05-advertising has no archive "
    + "reconciliation. Capturing the slots from the legacy templates and approving a profile is an ad-operations "
    + "task, not an implementation change.",
});

/** The advertising profile for an archive year. One answer today, and it is "none, with a reason". */
export function archiveAdProfileFor(_stateCode: string, _gameSlug: string): ArchiveAdProfile {
  return NO_APPROVED_ARCHIVE_PROFILE;
}
