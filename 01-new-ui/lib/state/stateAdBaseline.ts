/*
 * Minimum Florida advertising profile + `assertStateAdBaseline()`.
 *
 * Task LRG-STATE-021 §9/§10. Authority: `state-ad-anchor-distribution-proposal.md` §3, §5, §6, §8.1,
 * §10 (approved by APP-ST-01 … APP-ST-06); FD-S-21 … FD-S-29.
 *
 * INDEPENDENT OF HOME. `assertHomeAdBaseline()` asserts a single 15-slot, single-viewport Home
 * baseline. State has two viewport classes, a conditional host rule and four profiles, so this guard is
 * written from the State rules. Nothing is copied.
 *
 * REPRODUCES NO GAM VALUE. Only `slotKey`s appear here — no unit path, div id, size or size map.
 * Reserved geometry is read at render time from each slot's own definition in
 * `04-sample-data/ad-slot-definitions.json`, which this task does not modify.
 */

import { getAdSlot } from "../data-provider";
import { protectedSectionIds, type StateSectionId } from "./sectionManifest";

export type Viewport = "mobile" | "desktop";
export type SubPosition = "inline" | "rail" | "mobile-inline" | "sticky";
/** DS-23 / DS-24 review states. One filled and one no-fill representative are required. */
export type PlacementState = "reserved" | "filled" | "no-fill";

export interface StatePlacement {
  slotKey: string;
  anchorId: StateSectionId;
  subPosition: SubPosition;
  /** Governed section this placement follows or accompanies. */
  hostSectionId: StateSectionId;
  /** Which viewport classes the placement is visible in. */
  viewports: Viewport[];
  placementState: PlacementState;
  sticky?: boolean;
}

/**
 * THE APPROVED MINIMUM FLORIDA PROFILE — 10 active placements (proposal §8.1).
 *
 * Rail hosts are S-06, S-10 and S-18 only. Mobile tier at AD-S02 is the device-exclusive counterpart of
 * `sp_mid_leaderboard_pos2`, so every inline anchor is occupied at both tiers and the 992–1023 px band
 * has no hole.
 */
export const MINIMUM_FLORIDA_PROFILE: readonly StatePlacement[] = Object.freeze([
  /* LRG-STATE-025 / FD-X-04: AD-S00 is DESKTOP-ONLY during the State preview. `FD-X-03` requires the
     first verified result to precede every advertising reservation below 992 px, and AD-S00 sat before it.
     The slot is NOT relocated, NOT retired and NOT replaced — only its mobile tier stands down, and the
     approved profile count is unchanged. A viewport-scoped inactive state is not an inventory reduction
     (`FD-S-22`). `FD-S-24` is unaffected: AD-S00 stays active across the whole 992-1023 px band. */
  { slotKey: "sp_top_billboard", anchorId: "AD-S00", subPosition: "inline", hostSectionId: "S-01", viewports: ["desktop"], placementState: "reserved" },
  /* One FILLED representative (DS-23) — the first normal inline ad. */
  { slotKey: "sp_mid_leaderboard_pos1", anchorId: "AD-S01", subPosition: "inline", hostSectionId: "S-03", viewports: ["mobile", "desktop"], placementState: "filled" },
  /* Device-exclusive pair at AD-S02: legacy `mobi-ads0` (desktop-only) preserved exactly. */
  { slotKey: "sp_mid_leaderboard_pos2", anchorId: "AD-S02", subPosition: "inline", hostSectionId: "S-06", viewports: ["desktop"], placementState: "reserved" },
  { slotKey: "sp_mobile_leaderboard_pos1", anchorId: "AD-S02", subPosition: "mobile-inline", hostSectionId: "S-06", viewports: ["mobile"], placementState: "reserved" },
  /* One NO-FILL representative (DS-24): outer geometry retained, inner creative collapsed. */
  { slotKey: "sp_mid_leaderboard_pos6", anchorId: "AD-S03", subPosition: "inline", hostSectionId: "S-10", viewports: ["mobile", "desktop"], placementState: "no-fill" },
  { slotKey: "sp_mid_leaderboard_pos5", anchorId: "AD-S04", subPosition: "inline", hostSectionId: "S-18", viewports: ["mobile", "desktop"], placementState: "reserved" },
  /* Contextual rail — desktop only, section-bounded (FD-S-28). */
  { slotKey: "sp_side_mpu_pos4", anchorId: "AD-S02", subPosition: "rail", hostSectionId: "S-06", viewports: ["desktop"], placementState: "reserved", sticky: false },
  { slotKey: "sp_side_mpu_pos2", anchorId: "AD-S03", subPosition: "rail", hostSectionId: "S-10", viewports: ["desktop"], placementState: "reserved", sticky: true },
  { slotKey: "sp_side_skyscraper_pos2", anchorId: "AD-S04", subPosition: "rail", hostSectionId: "S-18", viewports: ["desktop"], placementState: "reserved", sticky: true },
  /* Closable sticky footer, both tiers (FD-S-29). */
  { slotKey: "sp_bottom_large_leaderboard", anchorId: "AD-S04", subPosition: "sticky", hostSectionId: "Footer", viewports: ["mobile", "desktop"], placementState: "reserved", sticky: true },
]);

export const MINIMUM_PROFILE_COUNT = 10;

/** Slots that must NEVER be active in this task, with the ruling that defers each. */
export const FORBIDDEN_IN_PREVIEW: Record<string, string> = {
  atv_video_player: "FD-S-26 / APP-ST-06 — deferred pending State ad-operations confirmation.",
  sp_side_halfpage_pos1: "APP-ST-03 — defined but never rendered in legacy; inactive until ad operations confirms.",
  wy_on_results_table_pos1: "FD-S-27 — record-only; no defineSlot or render exists anywhere.",
  wy_on_results_table_pos2: "FD-S-27 — record-only; no defineSlot or render exists anywhere.",
  sp_toppromobar: "Nine-state gate excludes `fl`; absence is exact legacy parity (proposal §0.1).",
  sp_mid_leaderboard_pos4: "APP-ST-03 — legacy duplicate render; at most one valid placement, not yet assigned.",
  sp_mobile_leaderboard_pos4: "APP-ST-03 — deferred until a valid governed mobile boundary exists.",
};

/** Conditional slots gated on S-14 / S-15 host eligibility. Must NOT activate in this task. */
export const CONDITIONAL_HOST_SLOTS: Record<string, StateSectionId> = {
  sp_side_skyscraper_pos3: "S-14",
  sp_mobile_leaderboard_pos2: "S-14",
  sp_side_mpu_pos3: "S-15",
  sp_mobile_leaderboard_pos3: "S-15",
};

/** Rail hosts approved by APP-ST-04 for the Minimum profile. */
export const APPROVED_RAIL_HOSTS: readonly StateSectionId[] = Object.freeze(["S-06", "S-10", "S-18"]);

export interface BaselineOptions {
  /** Section ids the resolver actually rendered, so unreachable placements can be detected. */
  renderedSectionIds?: readonly StateSectionId[];
  /**
   * Sections that additionally satisfy the APP-ST-01 content-host rule — they carry substantive real
   * content, not an empty-state shell. A rail slot may only accompany one of these.
   */
  adHostEligibleSectionIds?: readonly StateSectionId[];
  /** Recorded reasons for every deferred slot. */
  deferredReasons?: Record<string, string>;
}

/**
 * `assertStateAdBaseline` — build/render-time guard. **Throws**; never warns.
 *
 * A silently changed ad baseline is a revenue incident (CLAUDE.md §12), so every violation below is
 * fatal rather than logged.
 */
export function assertStateAdBaseline(
  placements: readonly StatePlacement[] = MINIMUM_FLORIDA_PROFILE,
  opts: BaselineOptions = {},
): void {
  const fail = (m: string) => { throw new Error(`State ad baseline: ${m}`); };

  /* ORDER MATTERS. Per-placement validity is checked BEFORE completeness, so a substituted slot
     produces the specific, actionable error ("must not be active", "not in the approved profile")
     rather than the generic "an approved slot is missing". Checking completeness first made the
     forbidden and conditional checks unreachable. */
  const approved = MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey);

  /* 1. per-placement validity: forbidden, conditional, unknown, undefined */
  for (const p of placements) {
    const forbidden = FORBIDDEN_IN_PREVIEW[p.slotKey];
    if (forbidden) fail(`slot "${p.slotKey}" must not be active in this preview — ${forbidden}`);

    const condHost = CONDITIONAL_HOST_SLOTS[p.slotKey];
    if (condHost) {
      fail(`slot "${p.slotKey}" is conditional on ${condHost} host eligibility (APP-ST-04/05) and must not activate here.`);
    }

    if (!approved.includes(p.slotKey)) {
      fail(`slot "${p.slotKey}" is not in the approved Minimum Florida profile.`);
    }
    if (!getAdSlot(p.slotKey)) {
      fail(`slot "${p.slotKey}" has no definition in ad-slot-definitions.json.`);
    }
  }

  /* 2. no duplicate active slot */
  const seen = new Map<string, number>();
  for (const p of placements) seen.set(p.slotKey, (seen.get(p.slotKey) ?? 0) + 1);
  for (const [k, n] of seen) if (n > 1) fail(`slot "${k}" is placed ${n} times; a slot may be consumed once.`);

  /* 3. approved count, then completeness */
  if (placements.length !== MINIMUM_PROFILE_COUNT) {
    fail(`expected ${MINIMUM_PROFILE_COUNT} placements in the Minimum Florida profile, found ${placements.length}. Changing the approved count requires founder and ad-operations approval.`);
  }
  for (const k of approved) if (!seen.has(k)) fail(`approved active slot "${k}" is missing.`);

  /* 4. duplicate div id — the exact legacy defect FD-S-23 forbids reproducing */
  const divIds = new Map<string, string>();
  for (const p of placements) {
    const div = getAdSlot(p.slotKey)?.divId;
    if (!div || div.startsWith("UNKNOWN")) continue;
    const prev = divIds.get(div);
    if (prev) fail(`div id "${div}" would render twice ("${prev}" and "${p.slotKey}"). FD-S-23 forbids a duplicate div id.`);
    divIds.set(div, p.slotKey);
  }

  /* 7. protected-zone placement */
  const prot = new Set<string>(protectedSectionIds());
  for (const p of placements) {
    if (p.subPosition === "rail" && prot.has(p.hostSectionId)) {
      fail(`rail slot "${p.slotKey}" accompanies protected section ${p.hostSectionId}. FD-S-21 forbids it.`);
    }
  }

  /* 8. rail hosts must be approved */
  for (const p of placements) {
    if (p.subPosition === "rail" && !APPROVED_RAIL_HOSTS.includes(p.hostSectionId)) {
      fail(`rail slot "${p.slotKey}" declares host ${p.hostSectionId}; APP-ST-04 approves only ${APPROVED_RAIL_HOSTS.join(", ")}.`);
    }
  }

  /* 9. at most one visible INLINE slot per anchor per viewport */
  for (const vp of ["mobile", "desktop"] as Viewport[]) {
    const perAnchor = new Map<string, string[]>();
    for (const p of placements) {
      if (p.subPosition === "rail" || p.subPosition === "sticky") continue;
      if (!p.viewports.includes(vp)) continue;
      perAnchor.set(p.anchorId, [...(perAnchor.get(p.anchorId) ?? []), p.slotKey]);
    }
    for (const [anchor, keys] of perAnchor) {
      if (keys.length > 1) fail(`${vp}: anchor ${anchor} carries ${keys.length} visible inline slots (${keys.join(", ")}). No stack is permitted.`);
    }
  }

  /* 10. 992 px tier coverage — every inline anchor occupied at BOTH tiers (FD-S-24)
   *
   * ONE FOUNDER-APPROVED EXCEPTION (FD-X-04, LRG-DEC-024): `AD-S00` is deliberately DESKTOP-ONLY during
   * the State preview, because FD-X-03 requires the first verified result to precede every advertising
   * reservation below 992 px. This does NOT open the gap FD-S-24 forbids — that rule protects the
   * 992–1023 px band, and AD-S00 is active across all of it. The exception is enumerated rather than
   * inferred, so any OTHER anchor losing a tier still fails loudly, and re-enabling AD-S00 on mobile
   * requires deleting this named entry. */
  const MOBILE_INACTIVE_BY_RULING: Record<string, string> = {
    "AD-S00": "FD-X-04 — desktop-only during the State preview; no replacement ad may precede the first verified result.",
  };
  const inlineAnchors = new Set(
    placements.filter((p) => p.subPosition === "inline" || p.subPosition === "mobile-inline").map((p) => p.anchorId),
  );
  for (const anchor of inlineAnchors) {
    const at = (vp: Viewport) =>
      placements.some((p) => p.anchorId === anchor && (p.subPosition === "inline" || p.subPosition === "mobile-inline") && p.viewports.includes(vp));
    if (!at("desktop")) {
      fail(`anchor ${anchor} is not occupied at the desktop tier; this opens a 992–1023 px gap (FD-S-24).`);
    }
    if (!at("mobile") && !MOBILE_INACTIVE_BY_RULING[anchor]) {
      fail(`anchor ${anchor} is not occupied at the mobile tier and has no recorded founder ruling permitting it (FD-S-24).`);
    }
  }

  /* 10b. FD-X-04 — nothing may replace AD-S00's mobile tier.
   *
   * The ruling forbids inserting any mobile advertisement before the first verified result, so no other
   * placement may claim AD-S00 on mobile. Without this, a future task could "restore mobile coverage" by
   * mapping a different slot to the same anchor and silently undo the ruling. */
  for (const anchor of Object.keys(MOBILE_INACTIVE_BY_RULING)) {
    const mobileAtAnchor = placements.filter(
      (p) => p.anchorId === anchor && p.viewports.includes("mobile") && p.subPosition !== "sticky",
    );
    if (mobileAtAnchor.length > 0) {
      fail(
        `anchor ${anchor} must carry no mobile placement (${MOBILE_INACTIVE_BY_RULING[anchor]}) but found ` +
          `${mobileAtAnchor.map((p) => p.slotKey).join(", ")}.`,
      );
    }
  }

  /* 11. no active slot silently unreachable.
   *
   * `hostSectionId` means two different things and must be checked differently:
   *   - RAIL: the section the slot sits BESIDE. If that section does not render there is no column to
   *     sit in, so the placement is genuinely unreachable.
   *   - INLINE / MOBILE-INLINE / STICKY: the section the anchor FOLLOWS. An ad anchor is a position in
   *     the PF-02 sequence, and that position survives its neighbour's suppression — AD-S03 still sits
   *     between S-08A and S-14 whether or not S-10 renders.
   *
   * Conflating the two would either reject a perfectly reachable inline anchor or silently accept a
   * rail slot with no host. `resolvePreviewPlacements` handles the rail case by deferring, with a
   * recorded reason, rather than re-homing the slot — APP-ST-04 forbids relocation.
   */
  if (opts.renderedSectionIds) {
    const rendered = new Set<string>([...opts.renderedSectionIds, "Footer"]);
    for (const p of placements) {
      if (p.subPosition === "rail" && !rendered.has(p.hostSectionId)) {
        fail(`rail slot "${p.slotKey}" declares host ${p.hostSectionId}, which did not render; a rail placement with no host section is unreachable.`);
      }
    }
  }

  /* 11b. HOST ELIGIBILITY (APP-ST-01 / APP-ST-04 / APP-ST-05) — LRG-STATE-022.
   *
   * Rendering is not sufficient. A rail slot may accompany a section only when that section carries
   * SUBSTANTIVE REAL CONTENT; a required empty-state shell does not qualify. Checking only "did it
   * render" would have let a rail slot sit beside the S-14 cold start or the S-15 sparse hub, which is
   * exactly what the founder correction prohibits.
   */
  if (opts.adHostEligibleSectionIds) {
    const eligible = new Set<string>([...opts.adHostEligibleSectionIds, "Footer"]);
    for (const p of placements) {
      if (p.subPosition === "rail" && !eligible.has(p.hostSectionId)) {
        fail(`rail slot "${p.slotKey}" declares host ${p.hostSectionId}, which is not ad-host eligible (no substantive real content). APP-ST-01 forbids an advertisement hosted by an empty-state shell.`);
      }
    }
  }

  /* 12. every deferred slot carries a reason */
  if (opts.deferredReasons) {
    for (const [k, why] of Object.entries(opts.deferredReasons)) {
      if (!why || why.trim().length === 0) fail(`deferred slot "${k}" has no recorded reason (FD-S-22).`);
    }
  }

  /* 13. required review representatives (DS-23 / DS-24) */
  const filled = placements.filter((p) => p.placementState === "filled").length;
  const noFill = placements.filter((p) => p.placementState === "no-fill").length;
  if (filled !== 1) fail(`exactly one FILLED representative is required for review, found ${filled}.`);
  if (noFill !== 1) fail(`exactly one NO-FILL representative is required for review, found ${noFill}.`);
}

/** Placements visible in one viewport class — what the renderer asks for. */
export function placementsFor(vp: Viewport, placements: readonly StatePlacement[] = MINIMUM_FLORIDA_PROFILE) {
  return placements.filter((p) => p.viewports.includes(vp));
}

/** Inline / mobile-inline placements attached to one anchor, for one viewport. */
export function inlineAt(anchorId: StateSectionId, vp: Viewport) {
  return MINIMUM_FLORIDA_PROFILE.filter(
    (p) => p.anchorId === anchorId && p.viewports.includes(vp) &&
      (p.subPosition === "inline" || p.subPosition === "mobile-inline"),
  );
}

/** Rail placements accompanying one governed section. */
export function railFor(hostSectionId: StateSectionId) {
  return MINIMUM_FLORIDA_PROFILE.filter((p) => p.subPosition === "rail" && p.hostSectionId === hostSectionId);
}

export function stickyPlacement() {
  return MINIMUM_FLORIDA_PROFILE.find((p) => p.subPosition === "sticky");
}

/* ---------------------------------------------------------------------------
 * Preview resolution — the approved profile vs. what this preview can render.
 * ------------------------------------------------------------------------- */

export interface ResolvedPlacements {
  /** Placements that render in this preview. */
  active: StatePlacement[];
  /** Approved placements held back, each with the reason. Never re-homed (APP-ST-04). */
  deferred: { slotKey: string; reason: string }[];
}

/**
 * Resolve the approved profile against the sections this preview actually renders.
 *
 * The approved Minimum Florida profile is 10 placements and does not change. When a RAIL slot's
 * approved host section is suppressed, the slot is **deferred with a recorded reason** — it is not moved
 * to another section, because APP-ST-04 states that a slot whose host does not qualify "remains deferred
 * and is not moved to another section".
 *
 * Inline, mobile-inline and sticky placements are never deferred this way: their anchor is a sequence
 * position, which survives a neighbouring section's suppression.
 */
export function resolvePreviewPlacements(
  renderedSectionIds: readonly StateSectionId[],
  placements: readonly StatePlacement[] = MINIMUM_FLORIDA_PROFILE,
  adHostEligibleSectionIds?: readonly StateSectionId[],
): ResolvedPlacements {
  const rendered = new Set<string>([...renderedSectionIds, "Footer"]);
  const eligible = adHostEligibleSectionIds
    ? new Set<string>([...adHostEligibleSectionIds, "Footer"])
    : null;
  const active: StatePlacement[] = [];
  const deferred: { slotKey: string; reason: string }[] = [];

  for (const p of placements) {
    if (p.subPosition === "rail" && !rendered.has(p.hostSectionId)) {
      deferred.push({
        slotKey: p.slotKey,
        reason: `Approved rail host ${p.hostSectionId} is suppressed in this preview, so the slot has no section to accompany. Deferred, not re-homed (APP-ST-04).`,
      });
      continue;
    }
    /* LRG-STATE-022: rendering is not enough — the host must carry substantive real content. */
    if (p.subPosition === "rail" && eligible && !eligible.has(p.hostSectionId)) {
      deferred.push({
        slotKey: p.slotKey,
        reason: `Approved rail host ${p.hostSectionId} renders but is not ad-host eligible (no substantive real content). Deferred, not re-homed (APP-ST-01/APP-ST-04).`,
      });
      continue;
    }
    active.push(p);
  }
  return { active, deferred };
}
