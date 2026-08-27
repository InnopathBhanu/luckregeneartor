"use client";

/*
 * THE HYDRATION-SAFE VIEWPORT TIER — LRG-ADS-CANARY-003A defect 1.
 *
 * Returns `null` until after mount, then the live tier, then follows it across the 992px boundary.
 *
 * ══ WHY `null` FIRST, ALWAYS ══
 *
 * The server has no viewport. If this returned a guess — a default of `"desktop"`, or a read of
 * `window.innerWidth` — the first client render would disagree with the server HTML for half of all readers,
 * and React would discard and re-render the tree. That is the hydration failure class this programme has
 * already paid for twice. `null` is the honest answer before mount and it is identical on both sides, so the
 * initial paint matches by construction rather than by care.
 *
 * The cost is one extra render for ad slots after mount, which is invisible: the reserved geometry is
 * server-rendered and never moves, and only the GPT div inside it appears.
 *
 * ══ WHY `matchMedia` AND NOT A RESIZE LISTENER ══
 *
 * The question is not "how wide is the window" but "which side of 992px are we on". `matchMedia` answers
 * exactly that and fires only when the answer CHANGES, so dragging a window from 1400px to 1000px produces no
 * work at all, while crossing to 991px produces exactly one event. A resize listener would fire continuously
 * and force this module to re-derive a boolean it does not need to compute.
 *
 * `addEventListener("change")` with an `addListener` fallback: the modern method is standard, the deprecated
 * one is what older Safari exposes, and an ad gate that silently never updates on an older browser would fail
 * in the direction of requesting for the wrong tier.
 */

import { useEffect, useState } from "react";
import { DESKTOP_MEDIA_QUERY, type ViewportTier } from "@/lib/ads/viewportTier";

export function useViewportTier(): ViewportTier | null {
  const [tier, setTier] = useState<ViewportTier | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      /* No matchMedia: stay `null` forever. Nothing registers, nothing requests — the fail-closed direction. */
      return;
    }
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const apply = (matches: boolean) => setTier(matches ? "desktop" : "mobile");

    apply(mql.matches);

    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    /* Deprecated path, for browsers that never shipped the modern one. */
    const legacy = mql as MediaQueryList & {
      addListener?: (l: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (l: (e: MediaQueryListEvent) => void) => void;
    };
    legacy.addListener?.(onChange);
    return () => legacy.removeListener?.(onChange);
  }, []);

  return tier;
}
