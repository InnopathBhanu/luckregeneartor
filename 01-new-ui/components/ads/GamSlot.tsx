"use client";

/*
 * ONE CANARY SLOT — LRG-ADS-CANARY-001 §3 and §4.
 *
 * Renders the div GPT needs, with the EXACT legacy div id, inside the reservation its server-rendered parent
 * already drew. The parent keeps the geometry; this adds the ad and its lifecycle.
 *
 * ══ WHAT IS PRESERVED, BY CONSTRUCTION ══
 *
 * Unit path, div id, size set and named size mapping all arrive as props read from
 * `ad-slot-definitions.json` on the server. Nothing here re-derives, normalises or defaults any of them, so
 * this component cannot move, rename, resize or reorder a placement — it can only fail to register one.
 *
 * ══ EAGER VERSUS LAZY ══
 *
 * A slot marked `lazyLoad` in its definition requests only when it comes near the viewport, via
 * `IntersectionObserver` with a generous root margin. Above-the-fold slots request as soon as GAM is ready.
 * Registration always happens immediately for both — registering is free, requesting is the billable act, and
 * separating them is exactly what `disableInitialLoad()` buys.
 *
 * ══ VIEWPORT ELIGIBILITY ══
 *
 * A placement governed for one tier only is not merely HIDDEN at the other tier — it is ineligible. Nothing
 * below runs at a tier the placement does not serve: no `defineSlot`, no `display()`, no `IntersectionObserver`
 * and no `refresh()`. See `lib/ads/viewportTier.ts` for why CSS visibility was never a sufficient gate.
 *
 * ══ NO-FILL ══
 *
 * On `no-fill` the parent's `data-placement-state` styling suppresses the "Advertisement" label while the
 * OUTER reserved box stays exactly as it was (DS-24, `CLAUDE.md` §12: fixed placements do not collapse). The
 * state also lands on `data-ad-state` so the tester and the matrix can read it without the Publisher Console.
 */

import { useEffect, useRef, useState } from "react";
import { GAM_ENABLED } from "@/lib/ads/gamConfig";
import { isEligibleAtTier, type ViewportEligibility } from "@/lib/ads/viewportTier";
import { useViewportTier } from "./useViewportTier";
import {
  destroySlot, onSlotState, registerSlot, requestSlot, slotState, type SlotState,
} from "@/lib/ads/gptClient";

export interface GamSlotProps {
  divId: string;
  gamPath: string;
  sizes: number[][];
  mapping: { minViewport: number[]; sizes: number[][] }[] | null;
  lazy: boolean;
  /** The governed tiers this placement may be requested in — LRG-ADS-CANARY-003A defect 1. */
  viewports: ViewportEligibility;
}

/** Root margin for lazy slots. Generous enough to fill before the reader arrives, not so early it prefetches
    the whole page — GPT's own lazy guidance uses the same order of magnitude. */
const LAZY_MARGIN = "300px 0px";

export default function GamSlot({ divId, gamPath, sizes, mapping, lazy, viewports }: GamSlotProps) {
  const [state, setState] = useState<SlotState>("inactive");
  const ref = useRef<HTMLDivElement | null>(null);

  /*
   * THE VIEWPORT GATE — LRG-ADS-CANARY-003A defect 1.
   *
   * `null` until after mount, so the server render and the first client render are identical and nothing is
   * registered before the browser has told us which side of 992px it is on. `eligible` is then the single
   * question every path below asks — registration, the IntersectionObserver, and the rendered div alike.
   *
   * This is what stops `sp_top_billboard` (governed `viewports: ["desktop"]`, and EAGER) from defining a slot
   * and calling `refresh()` at 390px, where its only previous protection was a CSS rule on an ancestor.
   */
  const tier = useViewportTier();
  const eligible = isEligibleAtTier(viewports, tier);

  /* Track this slot's lifecycle state for the debug attribute. */
  useEffect(() => {
    setState(slotState(divId));
    return onSlotState((id, next) => {
      if (id === divId) setState(next);
    });
  }, [divId]);

  /*
   * Register when GAM is enabled and the placement is viewport-eligible; destroy on unmount or when it loses
   * eligibility.
   *
   * `eligible` in the dependency list is what makes a resize across 992px correct: when the tier changes, this
   * effect's cleanup runs first — destroying the now-ineligible slot and freeing its div id inside GPT — and
   * only then does the newly eligible counterpart's effect register. React commits both in one pass, so the
   * pair can never be defined simultaneously and the div id is always free when it is reused.
   */
  useEffect(() => {
    if (!GAM_ENABLED || !eligible) return;
    registerSlot({ divId, gamPath, sizes, mapping, lazy });
    return () => {
      /* Client navigation and unmount both land here. Releasing the div id inside GPT is what allows the same
         route to register cleanly when it is visited again. */
      destroySlot(divId);
    };
  }, [eligible, divId, gamPath, sizes, mapping, lazy]);

  /*
   * Request: immediately when eager, at intersection when lazy.
   *
   * Gated on `eligible` BEFORE any observer is created, which defect 1 requires explicitly. An observer on a
   * hidden placement would either never fire (wasted) or fire on a zero-box element and request an ad for a
   * slot the reader cannot see.
   */
  useEffect(() => {
    if (!GAM_ENABLED || !eligible) return;
    if (!lazy) {
      requestSlot(divId);
      return;
    }
    /*
     * Observe the RESERVED PARENT, not this div.
     *
     * This element is empty until GPT writes a creative into it, and `.lcgam-gpt` sets `line-height: 0`, so its
     * own box is zero-height. The parent is the element carrying the slot's `min-height` reservation — it is
     * what actually occupies space on the page, so "near the viewport" is a question about it. Observing a
     * zero-height child makes the trigger depend on how the browser treats an empty box, which is the kind of
     * detail that differs between engines.
     */
    const el = ref.current?.parentElement ?? ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      /* No observer available: request rather than never filling. Reserved geometry is unaffected either way. */
      requestSlot(divId);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            requestSlot(divId);
            io.disconnect();
          }
        }
      },
      { rootMargin: LAZY_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eligible, divId, lazy]);

  /*
   * The div GPT writes into. It remains absent when the deployment kill switch is off or this viewport is not
   * eligible for the placement.
   */
  if (!GAM_ENABLED || !eligible) return null;

  return (
    <div
      ref={ref}
      id={divId}
      className="lcgam-gpt"
      data-ad-state={state}
      data-gam-path={gamPath}
      data-lazy={lazy ? "true" : "false"}
      /* The tier this slot is live in, so the runtime matrix can be read straight from the DOM. */
      data-tier={tier ?? "unknown"}
    />
  );
}
