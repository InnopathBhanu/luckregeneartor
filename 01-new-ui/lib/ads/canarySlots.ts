/*
 * WHICH SLOTS THIS CANARY MAY REQUEST — LRG-ADS-CANARY-001 §4.
 *
 * ══ THE RULE ══
 *
 * A slot is eligible only if it is ALREADY rendered by an approved page and belongs to an approved family.
 * Eligibility is never inferred from the existence of a definition: `ad-slot-definitions.json` holds 47
 * records, and most of them are retired, disabled, deferred, video, Wyoming, or reference-only captures of
 * page families this task must not activate.
 *
 * The two gates are the ones the application already enforces for RENDERING:
 *
 *   Home   `placedSlotKeys()` — the 15 active placements. It already excludes `hp_video` (retired by
 *          `FD-ADS-015 §2`), the five disabled implementation candidates and the two strategic candidates.
 *   State  `MINIMUM_FLORIDA_PROFILE` — the 10 captured Florida placements, and only for `fl`.
 *
 * Asking the same source that decides what is drawn means the canary cannot request an ad for a placement the
 * page does not show, and cannot skip one it does. It also means a slot retired later stops being requested
 * without anything here being edited.
 *
 * ══ WHAT THIS FUNCTION CANNOT DO ══
 *
 * It returns eligibility and the slot's own recorded configuration. It never constructs a unit path, never
 * substitutes a size, and never supplies a default mapping — an incompletely recorded slot is ineligible, so
 * a gap in the evidence produces no ad request rather than a guessed one.
 */

import { getAdSlot, getAdSizeMapping } from "@/lib/data-provider";
import { HOME_AD_ANCHORS } from "@/lib/layout/adAnchors";
import { MINIMUM_FLORIDA_PROFILE } from "@/lib/state/stateAdBaseline";
import { CANARY_PAGE_TYPES, CANARY_STATE_CODES, GAM_NETWORK_CODE } from "./gamConfig";
import {
  eligibilityFromHomeVisibility, eligibilityFromStateViewports, type ViewportEligibility,
} from "./viewportTier";

export interface CanarySlotConfig {
  divId: string;
  gamPath: string;
  sizes: number[][];
  mapping: { minViewport: number[]; sizes: number[][] }[] | null;
  lazy: boolean;
  /**
   * Which viewport tiers this placement may be REQUESTED in — LRG-ADS-CANARY-003A defect 1.
   *
   * Carried on the configuration rather than resolved at the component, so the governed rule travels with the
   * slot: Home's `visibility` and State's `viewports` are both normalised into the one shape here, and the
   * component asks a single question instead of knowing two vocabularies.
   */
  viewports: ViewportEligibility;
}

/**
 * Placement states whose slots may be requested — LRG-ADS-CANARY-002 §3.
 *
 * `placedSlotKeys()` answers "which slots does Home RENDER a reservation for", which is a superset of "which
 * slots may request an ad". `hp_bottom_large_leaderboard_sticky` is the difference: its anchor group carries
 * `placementState: "inactive-sticky-preview"`, meaning the reservation is drawn but the placement is held
 * inactive pending ad-operations approval of the mobile sticky treatment.
 *
 * The first canary shipped with that slot eligible, which is why the tests asserted 15 eligible Home slots
 * while the browser only ever registered 14 — the sticky reservation is suppressed at the viewport it would
 * occupy, so it produced a configuration that could never become a request. The count was wrong in the tests,
 * not in the browser.
 *
 * `reserved`, `filled-preview` and `no-fill-preview` are all ACTIVE placements: they describe how the preview
 * draws a live slot. `inactive-sticky-preview` is the one state that describes a placement that is not live.
 */
const ACTIVE_HOME_PLACEMENT_STATES: readonly string[] = Object.freeze([
  "reserved", "filled-preview", "no-fill-preview",
]);

/**
 * The Home slot keys that are BOTH rendered and in an active placement state.
 *
 * Derived from the anchor groups rather than from `placedSlotKeys()`, because only the group carries the
 * placement state. Nothing about `HOME_AD_ANCHORS`, the sticky slot's definition, its recorded inventory or
 * its governed state is modified — this reads them.
 */
export function canaryHomeSlotKeys(): readonly string[] {
  return HOME_AD_ANCHORS.flatMap((anchor) =>
    anchor.groups
      .filter((g) => ACTIVE_HOME_PLACEMENT_STATES.includes(g.placementState))
      .flatMap((g) => g.slotKeys),
  );
}

/**
 * Home slot keys that are rendered but held INACTIVE, with the state that holds them.
 *
 * Exported so a test can assert the sticky slot is still recorded and still drawn — excluding it from ad
 * requests must not look like deleting it.
 */
export function inactiveHomeSlotKeys(): { slotKey: string; placementState: string }[] {
  return HOME_AD_ANCHORS.flatMap((anchor) =>
    anchor.groups
      .filter((g) => !ACTIVE_HOME_PLACEMENT_STATES.includes(g.placementState))
      .flatMap((g) => g.slotKeys.map((slotKey) => ({ slotKey, placementState: g.placementState }))),
  );
}

/**
 * The governed viewport eligibility for one HOME slot key, from its own anchor group's `visibility`.
 *
 * An unknown key resolves to NEITHER tier: a slot the anchors do not describe must not be requested at any
 * width, which is the same fail-closed direction the rest of this module takes.
 */
export function homeSlotViewports(slotKey: string): ViewportEligibility {
  for (const anchor of HOME_AD_ANCHORS) {
    for (const g of anchor.groups) {
      if (g.slotKeys.includes(slotKey)) return eligibilityFromHomeVisibility(g.visibility);
    }
  }
  return { desktop: false, mobile: false };
}

/** The governed viewport eligibility for one FLORIDA slot key, from its placement's `viewports`. */
export function stateSlotViewports(slotKey: string): ViewportEligibility {
  const p = MINIMUM_FLORIDA_PROFILE.find((x) => x.slotKey === slotKey);
  return p ? eligibilityFromStateViewports(p.viewports) : { desktop: false, mobile: false };
}

/** The Florida State slot keys the page actually renders. */
export function canaryStateSlotKeys(stateCode: string): readonly string[] {
  if (!CANARY_STATE_CODES.includes(stateCode.toLowerCase())) return [];
  return MINIMUM_FLORIDA_PROFILE.map((p) => p.slotKey);
}

/**
 * The GPT configuration for one slot, or `null` if this canary must not request it.
 *
 * Every rejection below is a refusal to guess:
 *   - the page family is not Home or Florida State;
 *   - the slot key is not one the approved page renders;
 *   - the definition is missing, or has no div id, or no sizes;
 *   - the unit path is not inside the recorded GAM network.
 */
export function canarySlotConfig(
  slotKey: string,
  pageType: "home" | "state",
  stateCode?: string,
): CanarySlotConfig | null {
  if (!CANARY_PAGE_TYPES.includes(pageType)) return null;

  const eligible =
    pageType === "home"
      ? canaryHomeSlotKeys().includes(slotKey)
      : canaryStateSlotKeys(stateCode ?? "").includes(slotKey);
  if (!eligible) return null;

  const slot = getAdSlot(slotKey);
  if (!slot?.divId || !slot.gamPath) return null;
  if (!slot.gamPath.startsWith(`/${GAM_NETWORK_CODE}/`)) return null;

  const mapping = getAdSizeMapping(slot.sizeMapping)?.breakpoints ?? null;
  const sizes = slot.sizes ?? null;
  /* A slot with neither a flat size list nor a mapping cannot be defined without inventing dimensions. */
  if ((!sizes || sizes.length === 0) && (!mapping || mapping.length === 0)) return null;

  /* The governed viewport rule, read from the family that owns it. Never inferred from CSS or dimensions. */
  const viewports = pageType === "home" ? homeSlotViewports(slotKey) : stateSlotViewports(slotKey);
  /* A placement eligible in NEITHER tier can never be requested, so it is not a canary slot at all. */
  if (!viewports.desktop && !viewports.mobile) return null;

  return {
    divId: slot.divId,
    gamPath: slot.gamPath,
    /* GPT wants a concrete size argument even when a mapping is attached; the mapping governs at runtime. */
    sizes: sizes ?? mapping!.flatMap((b) => b.sizes),
    mapping,
    /* Eager above the fold, lazy below it — the slot's own recorded classification, not a heuristic. */
    lazy: slot.lazyLoad === true && slot.eagerAboveFold !== true,
    viewports,
  };
}
