/*
 * Home advertising anchor map.
 *
 * Authority: home-preview-section-manifest.md §4 (anchor -> production slot mapping);
 *            BP-02 v1.1 §62 (existing production ad preservation contract), §63 (position map),
 *            §64 (mobile ad contract).
 *
 * CRITICAL DISTINCTION: the blueprint defines 7 ANCHORS (content-relative positions). The Home
 * fixture references 20 production SLOTS. Anchors are positions; slots are inventory. One anchor
 * may carry several slots — AD-H01 has a rail sub-position and an inline sub-position.
 *
 * This module maps anchor -> slotKey ONLY. It reproduces no GAM value: no unit path, no size map,
 * no dimension, no count. Reserved heights are read at render time from each slot's own definition
 * in 04-sample-data/ad-slot-definitions.json, which this task does not modify.
 *
 * Visibility is bound to the single named structural threshold (992px, DS-20): mobile-tier slots
 * below it, rail slots at and above it. That simultaneity is what closes the 992-1023px inventory
 * gap in which mobile slots AND the rail were both hidden.
 */

/**
 * `gte-992` = rendered only at and above the 992 px threshold. Used by the contextual rail AND, since
 * LRG-ADS-015, by `hp_mid_leaderboard`, which the legacy Home hides below 992 px via
 * `.mobi-ads0 { display:none !important }`.
 *
 * `lt-992` is retained in the type because the mobile-snippet placements still exist as DISABLED
 * candidates; no active placement uses it, which matches the legacy Home (0 mobile-only placements).
 */
export type AnchorVisibility = "all" | "gte-992" | "lt-992";
export type SubPosition = "inline" | "rail" | "sticky" | "mobile-inline";

export interface AnchorSlotGroup {
  subPosition: SubPosition;
  visibility: AnchorVisibility;
  slotKeys: string[];
  /**
   * Preview placement state. One filled and one no-fill representative are required by the
   * specification so the founder can review both appearances.
   */
  placementState: "reserved" | "filled-preview" | "no-fill-preview" | "inactive-sticky-preview";
}

export interface AdAnchor {
  anchorId: string;
  name: string;
  /**
   * Documented position in the CURRENT preview sequence. Documentation and cross-check only —
   * placement resolves by anchorId (see anchorById). The founder-authorized engagement-order
   * experiment shifted content past two anchors: AD-H04 moved 18 -> 21 (LRG-UI-011, three sections
   * moved up past it) and AD-H03 moved 12 -> 13 (LRG-UI-012, H-10 inserted after H-05, before it).
   * NO anchor changed its position RELATIVE to another anchor, and no slot moved between anchors.
   *
   * These numbers are asserted against the rendered sequence in homePreviewModel.ts, so drift is a
   * hard build failure rather than silent documentation rot. That assertion caught this very change.
   */
  order: number;
  groups: AnchorSlotGroup[];
}

/**
 * The 7 anchors, in sequence order, mapping the 20 slots referenced by home-page-sample.json.
 *
 * Mobile slots are DISTRIBUTED across in-content anchors rather than stacked at page bottom, which
 * is what the current legacy HomeTemplate does. Redistribution must not reduce inventory: all four
 * hp_mobile_leaderboard_pos1..4 remain present below 992px.
 */
export const HOME_AD_ANCHORS: AdAnchor[] = [
  {
    anchorId: "AD-H00",
    name: "Existing Top Leaderboard",
    order: 2,
    groups: [
      {
        subPosition: "inline",
        visibility: "all",
        slotKeys: ["hp_top_billboard"],
        placementState: "reserved",
      },
    ],
  },
  {
    anchorId: "AD-H01",
    name: "Featured-Game Interstitial / Desktop Rail",
    order: 4,
    groups: [
      {
        subPosition: "inline",
        /*
         * LRG-ADS-015 §6: DESKTOP ONLY, restoring legacy behaviour. The legacy Home wraps this slot in
         * `.mobi-ads0`, whose rule is `display:none !important` at <=991 px. Rendering it at all widths
         * was a new-implementation change that added mobile impression opportunity the legacy page
         * never offered. GAM path, size mapping and identity are untouched.
         */
        visibility: "gte-992",
        slotKeys: ["hp_mid_leaderboard"],
        // Representative FILLED placeholder (spec example 11).
        placementState: "filled-preview",
      },
      {
        /*
         * LRG-ADS-016 §1 — RAIL DISTRIBUTION, matched to measured production placement.
         *
         * The rail formerly carried `pos1` AND `hp_side_mpu` here, with the remaining four at AD-H05.
         * Measured against production Home at 1440px, that is not where either of them sits: the
         * production rail spreads all six down the full page beside the content they accompany.
         *
         *   slot                    production y (page ~12,000px)   share of page
         *   hp_side_halfpage_pos1                             273             2%
         *   hp_side_halfpage_pos3                            4948            41%
         *   hp_side_mpu_pos1                                 5776            48%
         *   hp_side_halfpage_pos4                            9230            77%
         *   hp_side_mpu                                      9877            82%
         *   hp_side_halfpage_pos2                           11981           100%
         *
         * The existing seven anchors already sit at comparable shares, so production spacing is
         * reproduced by re-hanging the rail groups — NOT by adding anchors and NOT by changing any
         * slot's identity, path, size map, count or eager/lazy classification. All six remain rail,
         * all six remain `gte-992`, and `placedSlotKeys()` is unchanged, so the 15-active baseline
         * assertion still holds.
         *
         * `hp_side_mpu` moves from here to AD-H04, where production puts it (82%, not 2%).
         */
        subPosition: "rail",
        visibility: "gte-992",
        slotKeys: ["hp_side_halfpage_pos1"],
        placementState: "reserved",
      },
    ],
  },
  {
    anchorId: "AD-H02",
    name: "Post-Results Advertisement",
    order: 7,
    groups: [
      {
        subPosition: "inline",
        visibility: "all",
        slotKeys: ["hp_mid_large_leaderboard_pos1"],
        placementState: "reserved",
      },
    ],
  },
  {
    anchorId: "AD-H03",
    name: "Post-Live-Draw Advertisement",
    order: 13,
    groups: [
      {
        subPosition: "inline",
        visibility: "all",
        slotKeys: ["hp_mid_billboard_pos1"],
        placementState: "reserved",
      },
      {
        /* LRG-ADS-016 §1. Production: pos3 at 41% of page, mpu_pos1 at 48% — this anchor sits at 44%. */
        subPosition: "rail",
        visibility: "gte-992",
        slotKeys: ["hp_side_halfpage_pos3", "hp_side_mpu_pos1"],
        placementState: "reserved",
      },
    ],
  },
  {
    anchorId: "AD-H04",
    name: "Lower Utility Advertisement",
    order: 21,
    groups: [
      {
        subPosition: "inline",
        visibility: "all",
        /*
         * LRG-ADS-015 §7. Legacy body order is pos2 (L2355) -> pos3 (L2425) -> billboard_pos2 (L2495),
         * each separated by a real content block ("Top Jackpots Comparision", "Mega Millions Jackpot
         * History"). pos2 and pos3 are legacy's TIGHTEST pair at 70 lines apart, so they belong
         * together here; billboard_pos2 moves down to AD-H05 with billboard_pos3.
         */
        slotKeys: ["hp_mid_large_leaderboard_pos2", "hp_mid_large_leaderboard_pos3"],
        // Representative NO-FILL placeholder (spec example 12): outer geometry retained,
        // inner creative area collapsed, label suppressed.
        placementState: "no-fill-preview",
      },
      {
        /* LRG-ADS-016 §1. Production: pos4 at 77% of page, hp_side_mpu at 82% — this anchor sits at 72%. */
        subPosition: "rail",
        visibility: "gte-992",
        slotKeys: ["hp_side_halfpage_pos4", "hp_side_mpu"],
        placementState: "reserved",
      },
    ],
  },
  {
    anchorId: "AD-H05",
    name: "Bottom Content Advertisement",
    order: 28,
    groups: [
      {
        subPosition: "inline",
        visibility: "all",
        /*
         * LRG-ADS-015 §7 — the accidental three-stack is gone. It previously held pos3 +
         * billboard_pos3 + pos4, which legacy never renders consecutively: pos3 sits at L2425 and
         * billboard_pos3 at L3208 (~780 lines and several sections apart), and pos4 never renders on
         * the legacy Home at all. pos3 moved up to AD-H04; pos4 is now a disabled candidate.
         */
        slotKeys: ["hp_mid_billboard_pos2", "hp_mid_billboard_pos3"],
        placementState: "reserved",
      },
      {
        /*
         * LRG-ADS-016 §1. Production puts `hp_side_halfpage_pos2` LAST in the rail (y 11981, the
         * page tail); the other three that used to stack here moved up to AD-H03 and AD-H04, where
         * production actually places them. This is the group that produced the six-deep stack.
         */
        subPosition: "rail",
        visibility: "gte-992",
        slotKeys: ["hp_side_halfpage_pos2"],
        placementState: "reserved",
      },
    ],
  },
  {
    anchorId: "AD-H06",
    name: "Existing Bottom Anchor / Sticky Slot, when enabled",
    order: 30,
    groups: [
      {
        subPosition: "sticky",
        visibility: "all",
        slotKeys: ["hp_bottom_large_leaderboard_sticky"],
        // DS-27: labelled INACTIVE reservation. Asserts no final production creative height,
        // because DS-26/DS-34 (sticky creative height) remain unresolved with ad operations.
        placementState: "inactive-sticky-preview",
      },
    ],
  },
];

/* ==========================================================================
 * NON-ACTIVE HOME RECORDS (LRG-ADS-015)
 *
 * Eight records are deliberately NOT active inventory. They are kept here rather than deleted so the
 * audit trail survives, and none of them renders a container, reserves geometry, makes a GAM call, or
 * counts toward the active baseline.
 *
 *   1 retired legacy placement    hp_video
 *   5 implementation candidates   4 mobile snippets + hp_mid_large_leaderboard_pos4
 *   2 strategic candidates        NEW-H-ENGAGEMENT-01, NEW-H-GUIDES-01
 *
 * The retired placement is counted SEPARATELY from the candidates — it is a real legacy placement
 * being withdrawn, not a proposal awaiting approval.
 * ========================================================================== */

/**
 * RETIRED LEGACY PLACEMENT — DISABLED.
 *
 * `hp_video` (`/21828142944/LC_ATV_video_player`, div `div-gpt-ad-1715268442152-0`) DID render on the
 * legacy Home at `index_upgrade_as.jsp` L614, immediately after `hp_mid_leaderboard`, at a fixed
 * 300x168 with no size mapping. LRG-UI-014 corrected the earlier "defined but unreferenced" record.
 *
 * FOUNDER DECISION (LRG-ADS-015 §2): retired, because the former video/commercial relationship is no
 * longer active. This makes the approved active baseline **15**, not 16 — an intentional, authorised
 * exception to strict legacy parity. No replacement placement is approved, and nothing may reuse its
 * GAM path or its name.
 *
 * The production-derived definition stays in `04-sample-data/ad-slot-definitions.json` as historical
 * evidence; it is disabled HERE, through the Home registry.
 */
export const RETIRED_HOME_SLOTS = [
  {
    slotKey: "hp_video",
    legacyDivId: "div-gpt-ad-1715268442152-0",
    legacyLine: 614,
    legacySize: "300x168",
    reason: "Former video/commercial relationship is no longer active.",
    status: "RETIRED LEGACY PLACEMENT — DISABLED",
  },
] as const;

/**
 * DISABLED IMPLEMENTATION CANDIDATES — placements the NEW implementation added that the legacy Home
 * never rendered, and which have not been approved as active additions (LRG-ADS-015 §3).
 *
 * All five are genuinely DEFINED on the legacy Home, so their definitions stay in the sample data as
 * audit history. They are simply not active here.
 */
export const DISABLED_IMPLEMENTATION_CANDIDATES = [
  { slotKey: "hp_mobile_leaderboard_pos1", legacyDivId: "div-gpt-ad-1707413795676-0", note: "lc_mgp_snippet_* mobile snippet; defined L200, never rendered on legacy Home" },
  { slotKey: "hp_mobile_leaderboard_pos2", legacyDivId: "div-gpt-ad-1707413859823-0", note: "lc_mgp_snippet_* mobile snippet; defined L201, never rendered on legacy Home" },
  { slotKey: "hp_mobile_leaderboard_pos3", legacyDivId: "div-gpt-ad-1707413940026-0", note: "lc_mgp_snippet_* mobile snippet; defined L202, never rendered on legacy Home" },
  { slotKey: "hp_mobile_leaderboard_pos4", legacyDivId: "div-gpt-ad-1707414004765-0", note: "lc_mgp_snippet_* mobile snippet; defined L203, never rendered on legacy Home" },
  { slotKey: "hp_mid_large_leaderboard_pos4", legacyDivId: "div-gpt-ad-1696347916722-0", note: "Defined L196, never rendered on legacy Home" },
] as const;

/**
 * Legacy slots that are DEFINED in the production inventory but not placed by the new Home.
 *
 * Kept for the flush-guard accounting so nothing is silently forgotten. After LRG-ADS-015 this is the
 * union of the retired placement and the five disabled implementation candidates — six definitions
 * that exist in production data and render nothing here, each with a recorded reason.
 */
export const UNMAPPED_HOME_SLOTS = [
  ...RETIRED_HOME_SLOTS.map((r) => r.slotKey),
  ...DISABLED_IMPLEMENTATION_CANDIDATES.map((c) => c.slotKey),
] as const;

/**
 * Legacy provenance per slot, for the debug-mode ad labels (LRG-UI-014 "Ad debug labels").
 *
 * Proved from `WEB-INF/upgrade/index_upgrade_as.jsp` by a pure-Python scan — see the reconciliation
 * document §0 for why shell `grep` could not be trusted here.
 *
 *   EXISTING            rendered on the legacy Home at the same content-relative position
 *   RELOCATED           rendered on the legacy Home, moved to the contextual rail on the new page
 *   NEW_PLACEMENT       DEFINED on the legacy Home but never rendered there; placed by the new page
 */
export type LegacyAdStatus = "EXISTING" | "RELOCATED" | "NEW_PLACEMENT";

export interface LegacyAdProvenance {
  status: LegacyAdStatus;
  /** Legacy div id — the ad-ops-facing identifier. */
  legacyDivId: string;
  /** Body line in index_upgrade_as.jsp, or null when defined but never rendered. */
  legacyLine: number | null;
}

export const LEGACY_AD_PROVENANCE: Record<string, LegacyAdProvenance> = {
  hp_top_billboard: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694691105444-0", legacyLine: 263 },
  hp_mid_leaderboard: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694691723384-0", legacyLine: 607 },
  hp_side_halfpage_pos1: { status: "RELOCATED", legacyDivId: "div-gpt-ad-1694690716926-0", legacyLine: 877 },
  hp_mid_large_leaderboard_pos1: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694708847897-0", legacyLine: 1424 },
  hp_mid_billboard_pos1: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694708721384-0", legacyLine: 1908 },
  hp_side_halfpage_pos3: { status: "RELOCATED", legacyDivId: "div-gpt-ad-1696347663152-0", legacyLine: 2000 },
  hp_side_mpu_pos1: { status: "RELOCATED", legacyDivId: "div-gpt-ad-1696598357091-0", legacyLine: 2277 },
  hp_mid_large_leaderboard_pos2: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694709039320-0", legacyLine: 2355 },
  hp_mid_large_leaderboard_pos3: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694709114849-0", legacyLine: 2425 },
  hp_mid_billboard_pos2: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694709237082-0", legacyLine: 2495 },
  hp_side_halfpage_pos4: { status: "RELOCATED", legacyDivId: "div-gpt-ad-1696348050684-0", legacyLine: 2766 },
  hp_side_mpu: { status: "RELOCATED", legacyDivId: "div-gpt-ad-1694709311530-0", legacyLine: 3098 },
  hp_mid_billboard_pos3: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694709361130-0", legacyLine: 3208 },
  hp_side_halfpage_pos2: { status: "RELOCATED", legacyDivId: "div-gpt-ad-1694709543711-0", legacyLine: 3346 },
  hp_bottom_large_leaderboard_sticky: { status: "EXISTING", legacyDivId: "div-gpt-ad-1694709627267-0", legacyLine: 3376 },
  /* Defined on the legacy Home (L196, L200-L203) but never rendered there. */
  hp_mid_large_leaderboard_pos4: { status: "NEW_PLACEMENT", legacyDivId: "div-gpt-ad-1696347916722-0", legacyLine: null },
  hp_mobile_leaderboard_pos1: { status: "NEW_PLACEMENT", legacyDivId: "div-gpt-ad-1707413795676-0", legacyLine: null },
  hp_mobile_leaderboard_pos2: { status: "NEW_PLACEMENT", legacyDivId: "div-gpt-ad-1707413859823-0", legacyLine: null },
  hp_mobile_leaderboard_pos3: { status: "NEW_PLACEMENT", legacyDivId: "div-gpt-ad-1707413940026-0", legacyLine: null },
  hp_mobile_leaderboard_pos4: { status: "NEW_PLACEMENT", legacyDivId: "div-gpt-ad-1707414004765-0", legacyLine: null },
};

/**
 * NEW CANDIDATE placements — REGISTERED AND DISABLED.
 *
 * `NEW CANDIDATE — DISABLED PENDING AD-OPERATIONS APPROVAL`.
 *
 * These are NOT inventory. They have deliberately **no GAM unit path, no div id and no size map** —
 * fabricating any of those would put invented production values into the codebase. They render
 * nothing at all in normal mode, appear only as a labelled marker under
 * `LC_HOME_PREVIEW_DEBUG=true`, and are excluded from every active count and from `placedSlotKeys()`.
 *
 * `04-sample-data/ad-slot-definitions.json` was NOT modified: its schema requires a production unit
 * path, so per the task's fallback the candidates live here and in the reconciliation document.
 */
export interface AdCandidate {
  candidateId: string;
  /** Section ID the candidate would follow. */
  afterSectionId: string;
  rationale: string;
  status: "NEW STRATEGIC CANDIDATE — DISABLED PENDING AD-OPERATIONS APPROVAL";
}

export const HOME_AD_CANDIDATES: readonly AdCandidate[] = [
  {
    candidateId: "NEW-H-ENGAGEMENT-01",
    afterSectionId: "H-14",
    rationale: "After the Latest from LotteryCorner band, before state exploration resumes.",
    status: "NEW STRATEGIC CANDIDATE — DISABLED PENDING AD-OPERATIONS APPROVAL",
  },
  {
    candidateId: "NEW-H-GUIDES-01",
    afterSectionId: "H-11A",
    rationale: "After Lottery Blog & Guides, before transactional discovery.",
    status: "NEW STRATEGIC CANDIDATE — DISABLED PENDING AD-OPERATIONS APPROVAL",
  },
] as const;

/* ==========================================================================
 * ACCOUNTING — the single source of truth for the four published counts.
 *
 * Derived, never hand-written, so the numbers in the reconciliation document and the numbers the page
 * actually renders cannot drift apart.
 * ========================================================================== */
export const HOME_AD_ACCOUNTING = {
  /** Placements that render. Founder-approved baseline: 15. */
  activeExistingLegacy: placedSlotKeys().length,
  retiredLegacy: RETIRED_HOME_SLOTS.length,
  disabledImplementationCandidates: DISABLED_IMPLEMENTATION_CANDIDATES.length,
  disabledStrategicCandidates: HOME_AD_CANDIDATES.length,
} as const;

/**
 * Build-time guard on the founder-approved baseline.
 *
 * If a later change adds or drops an active placement, this throws instead of quietly shipping a
 * different inventory count. 15 active + 8 non-active is the approved shape; the retired placement is
 * counted separately from the seven candidates and must never be folded in with them.
 */
export function assertHomeAdBaseline(): void {
  const a = HOME_AD_ACCOUNTING;
  if (a.activeExistingLegacy !== 15) {
    throw new Error(
      `Home ad baseline: expected 15 ACTIVE EXISTING LEGACY PLACEMENTS, found ${a.activeExistingLegacy}. ` +
        `The founder-approved baseline is 15 (legacy rendered 16; hp_video is retired). ` +
        `Adding or removing an active placement requires ad-operations approval.`,
    );
  }
  const nonActive =
    a.retiredLegacy + a.disabledImplementationCandidates + a.disabledStrategicCandidates;
  if (a.retiredLegacy !== 1 || a.disabledImplementationCandidates !== 5 || a.disabledStrategicCandidates !== 2 || nonActive !== 8) {
    throw new Error(
      `Home ad baseline: expected 1 retired + 5 implementation candidates + 2 strategic candidates = 8 ` +
        `non-active records, found ${a.retiredLegacy} + ${a.disabledImplementationCandidates} + ${a.disabledStrategicCandidates} = ${nonActive}.`,
    );
  }
  /* A retired or disabled record must never leak into the rendered slot list. */
  const placed = new Set(placedSlotKeys());
  const leaked = [...RETIRED_HOME_SLOTS.map((r) => r.slotKey), ...DISABLED_IMPLEMENTATION_CANDIDATES.map((c) => c.slotKey)].filter((k) => placed.has(k));
  if (leaked.length > 0) {
    throw new Error(`Home ad baseline: retired/disabled slots reached the rendered list: ${leaked.join(", ")}`);
  }
}

/** Anchors with no active placement after the LRG-ADS-015 corrections. */
export function anchorsWithoutActivePlacement(): string[] {
  return HOME_AD_ANCHORS.filter((a) => a.groups.every((g) => g.slotKeys.length === 0)).map((a) => a.anchorId);
}

/** Every slotKey placed by an anchor. Used by the flush guard to prove nothing was lost. */
export function placedSlotKeys(): string[] {
  return HOME_AD_ANCHORS.flatMap((a) => a.groups.flatMap((g) => g.slotKeys));
}

/**
 * Look an anchor up by its ID.
 *
 * LRG-UI-011: this replaces the previous `anchorAt(order)` lookup. Keying on the numeric sequence
 * position silently coupled ad placement to content ordering — move a content section and an ad
 * anchor could stop resolving. Anchor identity is stable; sequence position is not. The `order`
 * field below is retained as documentation of where each anchor sits, and is asserted against the
 * view model rather than used for lookup.
 */
export function anchorById(anchorId: string): AdAnchor | undefined {
  return HOME_AD_ANCHORS.find((a) => a.anchorId === anchorId);
}

/** Rail groups only — rendered in the desktop contextual rail at >=992px. */
export function railGroups(): { anchorId: string; group: AnchorSlotGroup }[] {
  return HOME_AD_ANCHORS.flatMap((a) =>
    a.groups.filter((g) => g.subPosition === "rail").map((group) => ({ anchorId: a.anchorId, group })),
  );
}
