/*
 * State ad-slot reserved geometry — LRG-STATE-022.
 *
 * Authority: DS-22/DS-23 (reserved dimensions are mandatory, both tiers), DS-20/FD-S-24 (a single
 * 992 px structural threshold), FD-S-29 (sticky clearance is DERIVED from the reserved sticky height).
 *
 * WHY THIS IS A LIB MODULE. This is pure geometry read from `ad-slot-definitions.json`; it contains no
 * JSX and no rendering. It previously lived inside `StatePreviewAdSlot.tsx`, which meant `app/layout.tsx`
 * had to import from a component file in order to derive the document's sticky clearance, and the test
 * suite could not import it at all (Node's native TypeScript stripping does not handle `.tsx`).
 *
 * No dimension, size map, slot id or unit path is defined here. Every number is read from the slot's own
 * recorded production definition, so an audit can trace any reservation back to that file.
 */

import { getAdSlot, getAdSizeMapping } from "@/lib/data-provider";
import { MINIMUM_FLORIDA_PROFILE } from "@/lib/state/stateAdBaseline";
import type { StatePreviewAdMode } from "@/lib/state/statePreviewGuard";

/*
 * Compact review heights are a REVIEW AID and never evidence of production geometry. They only ever clamp
 * DOWNWARD (`Math.min`), so a slot already smaller than the compact height is untouched and a compact
 * reservation can never exceed the real production reservation.
 *
 * LRG-STATE-032 §9 — TIGHTENED, because 40/56px was still too large. In a compressed full-page screenshot
 * ten placeholders at that height read as "empty advertisements dominating the rhythm", which is exactly what
 * founder review reported. The new ceilings are:
 *
 *   INLINE  <= 32px   a single labelled line, not a box
 *   RAIL    <= 48px   a marker, never a tall blank card
 *   STICKY  <= 40px   closable, session-scoped, non-obstructing
 *
 * A rail slot needs its own ceiling because its production geometry is by far the tallest (600px
 * skyscrapers): clamping it to the inline ceiling would misrepresent a rail as an inline strip, while leaving
 * it at 56px+ leaves the tall blank card the founder objected to.
 */
/* LRG-STATE-034 §15 tightened these again — 32/48/40 still read as advertisement space in a landing-page
   review. A founder-review marker should read as a boundary line, not as inventory. */
export const COMPACT_INLINE_H = 20;
export const COMPACT_RAIL_H = 24;
export const COMPACT_STICKY_H = 36;

/** Retained names, now derived, so nothing that imported them silently changes meaning. */
export const COMPACT_MOBILE_H = COMPACT_INLINE_H;
export const COMPACT_DESKTOP_H = COMPACT_INLINE_H;

/** The compact ceiling that applies to a placement, by its role. */
export function compactCeiling(subPosition: string): number {
  if (subPosition === "rail") return COMPACT_RAIL_H;
  if (subPosition === "sticky") return COMPACT_STICKY_H;
  return COMPACT_INLINE_H;
}

/**
 * A slot's role, read from the APPROVED PROFILE rather than passed in by the caller.
 *
 * Deriving it here rather than taking a parameter matters for one specific reason: `app/layout.tsx` computes
 * the document's sticky clearance through `reservedHeights`, and that file is out of scope for this task. If
 * the ceiling depended on an argument, the untouched caller would silently get the 32px inline ceiling for a
 * 40px sticky bar — reintroducing the LRG-STATE-022 defect where the footer sat underneath the fixed bar.
 * Reading the role from the profile keeps every caller correct without any of them changing.
 */
function roleOf(slotKey: string): string {
  return MINIMUM_FLORIDA_PROFILE.find((p) => p.slotKey === slotKey)?.subPosition ?? "inline";
}

function maxH(sizes: number[][] | null | undefined, fallback: number): number {
  if (!sizes || sizes.length === 0) return fallback;
  return Math.max(...sizes.map((s) => s[1] ?? fallback));
}
function maxW(sizes: number[][] | null | undefined, fallback: number): number {
  if (!sizes || sizes.length === 0) return fallback;
  return Math.max(...sizes.map((s) => s[0] ?? fallback));
}

export interface SlotReservation {
  gamPath: string;
  divId: string;
  /** Tallest creative the slot's own mapping allows below the 992 px threshold. */
  mobileH: number;
  /** Tallest creative the slot's own mapping allows at or above the 992 px threshold. */
  desktopH: number;
  maxW: number;
}

/** Reserved geometry for one production slot, read from that slot's own definition. */
export function slotReservation(slotKey: string): SlotReservation {
  const slot = getAdSlot(slotKey);
  const mapping = getAdSizeMapping(slot?.sizeMapping);
  const flat = slot?.sizes ?? null;
  const desktopTier = mapping?.breakpoints.find((b) => b.minViewport[0] >= 992)?.sizes;
  const mobileTier = mapping?.breakpoints.find((b) => b.minViewport[0] === 0)?.sizes;
  return {
    gamPath: slot?.gamPath ?? "UNKNOWN",
    divId: slot?.divId ?? "UNKNOWN",
    mobileH: maxH(mobileTier ?? flat, 50),
    desktopH: maxH(desktopTier ?? flat, 90),
    maxW: maxW(desktopTier ?? flat, 728),
  };
}

/**
 * The two heights a slot will ACTUALLY occupy in the given ad mode, after compact clamping.
 *
 * This is the SINGLE owner of compact clamping. Both the rendered slot and the document's sticky
 * clearance call it, so a slot's reserved height and the clearance beneath it cannot drift apart.
 *
 * LRG-STATE-022 DEFECT FIX (two separate faults, one call site).
 *
 * 1. The slot component carried the mobile height as an INLINE `min-height`. An inline declaration
 *    outranks any stylesheet rule, media query included, so the `>= 992px` desktop override never
 *    applied and every slot reserved its mobile height at every viewport. Measured at 1440 px,
 *    `sp_side_skyscraper_pos2` held 280 px against a reserved 600 px — a 320 px shift the moment a real
 *    creative loaded, which is precisely what DS-22 exists to prevent.
 *
 * 2. The page's sticky-footer clearance was computed from Home's `--lcp-sticky-ad-h: 56px`, a
 *    compact-mode constant, giving 68 px of clearance beneath a 90 px fixed bar in production ad mode.
 *
 * Both now read the same two numbers from this function, so the reservation and the clearance can never
 * disagree, and the clearance stays DERIVED as FD-S-29 requires.
 */
export function reservedHeights(
  slotKey: string,
  adMode: StatePreviewAdMode,
): { mobileH: number; desktopH: number } {
  const r = slotReservation(slotKey);
  if (adMode !== "compact") return { mobileH: r.mobileH, desktopH: r.desktopH };
  /* Rail and sticky have their own compact ceilings (LRG-STATE-032 §9), derived from the approved profile. */
  const ceiling = compactCeiling(roleOf(slotKey));
  return {
    mobileH: Math.min(r.mobileH, ceiling),
    desktopH: Math.min(r.desktopH, ceiling),
  };
}
