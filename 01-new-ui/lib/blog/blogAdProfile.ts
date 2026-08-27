/*
 * BLOG PAGE-FAMILY ADVERTISING — the `NO_APPROVED_*_PROFILE` pattern, following `newsAdProfile.ts`.
 *
 * Authority: `CLAUDE.md` §12 (*"Each page family REQUIRES its own production ad-inventory audit before
 * implementation"*), and **Conflict 39** verbatim: *"The `lc_bp_*`/`lc_bdp_*` ad families remain
 * named-but-not-captured: blueprint-style anchors ship as typed-empty reserved profiles pending the
 * ad-inventory capture task."*
 *
 * ══ THE AUDIT, AND ITS RESULT ══
 *
 * `04-sample-data/ad-slot-definitions.json` enumerates Home, State and mobile-snippet slots only. The blog
 * slot families (`lc_bp_*` blog page, `lc_bdp_*` blog detail page) are named in `CLAUDE.md` §5 as living ONLY
 * in the legacy templates, which have not been read for capture. So the two governed hub anchors — `AD-BH00`
 * and `AD-BH01` (blogContract.ts) — hold their recorded positions and resolve to NOTHING: no geometry is
 * reserved (so no layout shift is invented), no placeholder is drawn, and nothing is removed, renamed or
 * re-homed. §12 forbids all of those.
 *
 * The post page carries no anchors at all: the founder's composition names none, and its protected reads
 * (Key points, the Listen control, the article body, sources, responsible play) mean the honest post-page ad
 * answer is "none, pending the audit" — exactly the news article's answer.
 */

export interface BlogAdProfile {
  id: string;
  /** Approved placements. Typed empty so a placeholder cannot be added without changing the type. */
  placements: readonly never[];
  /** The regions no future placement may interrupt (07B §19 adopted; FD-DAT-20 surface included). */
  protectedRegions: readonly string[];
  gap: string;
}

export const NO_APPROVED_BLOG_PROFILE: BlogAdProfile = Object.freeze({
  id: "none-pending-blog-ad-audit",
  placements: [],
  protectedRegions: Object.freeze([
    "Hub: featured post headline and summary",
    "Post: between headline and Key points",
    "Post: inside the Key points block",
    "Post: between the Listen control and the article body",
    "Post: author identity and dates",
    "Post: sources and corrections",
    "Post: responsible play",
  ]),
  gap:
    "No blog-page advertising profile is captured or approved. `ad-slot-definitions.json` carries no blog slot "
    + "ids or size mappings — the lc_bp_*/lc_bdp_* families are named but uncaptured, and reading them out of "
    + "the legacy templates is the ad-inventory capture task Conflict 39 defers to. AD-BH00/AD-BH01 hold their "
    + "recorded hub positions and resolve to nothing until that task lands (CLAUDE.md §12).",
});

/** The advertising profile for the Blog pages. One answer today, and it is "none, with a reason". */
export function blogAdProfile(): BlogAdProfile {
  return NO_APPROVED_BLOG_PROFILE;
}
