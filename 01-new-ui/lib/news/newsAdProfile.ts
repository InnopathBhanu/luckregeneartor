/*
 * NEWS PAGE-FAMILY ADVERTISING — the `NO_APPROVED_*_PROFILE` pattern, following `flagshipAdProfile.ts`.
 *
 * Authority: `CLAUDE.md` §12 (*"Each page family REQUIRES its own production ad-inventory audit before
 * implementation"*; the blog/news-adjacent slot families `lc_bp_*` / `lc_bdp_*` are *"named but not yet
 * captured"*), 07A §19 (allowed and protected hub positions), 07 §23 / 07B §19 (article protected zones).
 *
 * ══ THE AUDIT, AND ITS RESULT ══
 *
 * `04-sample-data/ad-slot-definitions.json` enumerates Home, State and mobile-snippet slots only. No news or
 * blog slot has a captured div id, size mapping or GAM path, and `03-docs/05-advertising/` holds no news-page
 * reconciliation and no founder approval. So the three governed hub anchors — `AD-NH00`, `AD-NH01`, `AD-NH02`
 * (07A §3) — stay in the blueprint sequence and resolve to NOTHING: no geometry is reserved (so no layout shift
 * is invented), no placeholder is drawn, and nothing is removed, renamed or re-homed. §12 forbids all of those.
 *
 * The article page carries no anchors at all: 07B names no `AD-*` rows, and its §19 protected zones plus the
 * missing inventory mean the honest article ad answer is "none, pending the audit".
 */

export interface NewsAdProfile {
  id: string;
  /** Approved placements. Typed empty so a placeholder cannot be added without changing the type. */
  placements: readonly never[];
  /** 07A §19 / 07B §19 — the regions no future placement may interrupt. */
  protectedRegions: readonly string[];
  gap: string;
}

export const NO_APPROVED_NEWS_PROFILE: NewsAdProfile = Object.freeze({
  id: "none-pending-news-ad-audit",
  placements: [],
  protectedRegions: Object.freeze([
    "NH-02 Top Story Bottom Line",
    "NH-02 Developing Story timeline",
    "Safety instructions, wherever rendered",
    "First discussion interaction",
    "Article: between headline and Bottom Line",
    "Article: reporter identity",
    "Article: inside AI context",
    "Article: correction/update timeline",
    "Article: between discussion question and first comments",
  ]),
  gap:
    "No news-page advertising profile is captured or approved. `ad-slot-definitions.json` carries no news/blog "
    + "slot ids or size mappings (the lc_bp_*/lc_bdp_* families are named but uncaptured), and "
    + "03-docs/05-advertising has no news reconciliation. AD-NH00/AD-NH01/AD-NH02 hold their 07A §3 positions "
    + "and resolve to nothing until an ad-operations task captures and approves the inventory (CLAUDE.md §12).",
});

/** The advertising profile for the News pages. One answer today, and it is "none, with a reason". */
export function newsAdProfile(): NewsAdProfile {
  return NO_APPROVED_NEWS_PROFILE;
}
