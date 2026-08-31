/*
 * StatePreviewAdSlot — labelled, reserved, INACTIVE State advertising placeholder.
 *
 * Task LRG-STATE-021 §9. Authority: DS-22/DS-23/DS-24/DS-25; the approved Minimum Florida profile.
 *
 * Reserves space from each slot's OWN size mapping in `ad-slot-definitions.json`, so there is no
 * layout shift and no dimension is restated here. Renders a quiet "ADVERTISEMENT" label and nothing
 * else.
 *
 * DELIBERATELY ABSENT: any `googletag` / GPT call, AdSense, analytics, push, or external request.
 * No slot id, unit path, size map, dimension, placement or count is modified anywhere.
 *
 * NO-FILL (DS-24): outer placement geometry is RETAINED while the inner creative area collapses and the
 * label is suppressed — unfilled inventory neither shifts layout nor reads as broken.
 */

import type { StatePlacement } from "@/lib/state/stateAdBaseline";
import { canarySlotConfig } from "@/lib/ads/canarySlots";
import AdReservation from "@/components/ads/AdReservation";
import { slotReservation, reservedHeights } from "@/lib/state/stateAdReservation";
import type { StatePreviewAdMode } from "@/lib/state/statePreviewGuard";

/*
 * Geometry lives in `lib/state/stateAdReservation.ts` — LRG-STATE-022. It is pure data read from each
 * slot's own recorded production definition, it is needed by `app/layout.tsx` to derive the document's
 * sticky clearance, and the test suite must be able to import it (Node's TypeScript stripping cannot
 * load `.tsx`). This component only RENDERS the reservation it is given.
 */

export default function StatePreviewAdSlot({
  placement,
  adMode = "compact",
  stateCode,
}: {
  placement: StatePlacement;
  adMode?: StatePreviewAdMode;
  /**
   * The jurisdiction this placement belongs to — LRG-ADS-CANARY-001 §4.
   *
   * Passed explicitly rather than inferred: `canarySlotConfig` will only return a configuration for `fl`,
   * because Florida is the one captured, approved State profile, and a component that guessed its own
   * jurisdiction could activate a state whose inventory has never been audited.
   */
  stateCode?: string;
}) {
  const r = slotReservation(placement.slotKey);
  const noFill = placement.placementState === "no-fill";
  const filled = placement.placementState === "filled";
  const { mobileH, desktopH } = reservedHeights(placement.slotKey, adMode);

  /* LRG-STATE-032 §9. In COMPACT review mode the slot is a thin labelled MARKER, not a placeholder box: no
     surface, no fill, one hairline rule, and a height capped at 32/48/40px by role. Ten bordered white boxes
     at 40-56px is what founder review saw as "empty advertisements dominating the rhythm".
     PRODUCTION mode is untouched and still draws the full governed reservation. */
  const compact = adMode === "compact";

  return (
    /*
      LRG-ADS-CANARY-002 §2 — the same shared reservation Home uses. Every geometry, inventory and provenance
      value below is still computed on the server here and passed through verbatim; the runtime booleans are
      now derived from the live GPT lifecycle rather than hardcoded, and a real no-fill suppresses the label
      and corrects the accessible name while the outer box keeps its reserved height.

      `data-gam-active="false"` is gone: `AdReservation` emits `data-ad-active` from the actual state, so the
      two families now answer the same question with the same attribute instead of two contradictory ones.
    */
    <AdReservation
      canary={stateCode ? canarySlotConfig(placement.slotKey, "state", stateCode) : null}
      className={
        `${compact ? "lcs-admark" : "lcp-adslot"} lcs-adslot-reserve` +
        `${noFill ? (compact ? " lcs-admark--nofill" : " lcp-adslot--nofill") : ""}`
      }
      previewNoFill={noFill}
      style={
        {
          maxWidth: r.maxW,
          marginInline: "auto",
          ["--lcs-ad-mobile-h" as string]: `${mobileH}px`,
          ["--lcs-ad-desktop-h" as string]: `${desktopH}px`,
          ...(filled && !compact ? { background: "var(--color-surface-subtle)" } : {}),
        } as React.CSSProperties
      }
      /* Every value below is read from the slot's own recorded definition. An audit can always read the
         real production reservation out of the DOM even in compact review mode. */
      dataAttributes={{
        "data-slot-key": placement.slotKey,
        "data-anchor-id": placement.anchorId,
        /* LRG-STATE-022: `hostSectionId` means two different things, and emitting one attribute for both
           is what made LRG-STATE-021 read as "S-10 renders". For a RAIL slot it is the section the slot sits
           beside and which must render and qualify. For an INLINE slot it is only the governed sequence
           neighbour of its anchor — the anchor position survives that neighbour's suppression. */
        ...(placement.subPosition === "rail"
          ? { "data-rail-host-section": placement.hostSectionId }
          : { "data-anchor-follows-section": placement.hostSectionId }),
        "data-sub-position": placement.subPosition,
        "data-placement-state": placement.placementState,
        "data-viewports": placement.viewports.join(","),
        "data-gam-path": r.gamPath,
        "data-div-id": r.divId,
        "data-reserved-mobile-h": r.mobileH,
        "data-reserved-desktop-h": r.desktopH,
        "data-ad-mode": adMode,
      }}
      /* DS-24: the label is suppressed in the no-fill state — preview OR runtime — so an unfilled slot does
         not read as broken while its outer geometry is retained. */
      label={
        compact ? (
          /* One quiet line. It names itself as a REVIEW MARKER and states the real production reservation it
             stands in for, so compact can never be mistaken for production geometry — while a founder
             reviewing the page visually is no longer looking at a large blank box. */
          <span className="lcs-admark__label" data-review-mode="compact">
            Ad slot · {placement.slotKey} · reserves {r.mobileH}/{r.desktopH}px in production
          </span>
        ) : (
          /*
           * NO VISIBLE LABEL IN PRODUCTION GEOMETRY — LRG-ADS-017, matching production and Home.
           *
           * Production draws no ad-labelling text on any of its 20 Home placements, so neither do we.
           * The accessible name from `reservationState` is unchanged, so the region is still announced
           * as an advertisement to assistive technology.
           *
           * The COMPACT branch above keeps its review marker. That is not an ad label — it is a
           * founder-review annotation naming the slot and the production height it stands in for, and
           * it exists precisely so compact geometry can never be mistaken for the real thing. It never
           * renders in production ad mode.
           */
          null
        )
      }
    />
  );
}
