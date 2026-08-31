/*
 * PreviewAdSlot — labelled, reserved, INACTIVE advertising placeholder.
 *
 * Authority: BP-02 §61-§65 (Home ad tier, preservation contract, position map, mobile contract,
 * prohibited placements); DS-22/DS-23/DS-24/DS-25; Global Shell §122; LRG-UI-009 §6.
 *
 * WHAT THIS DOES:
 *  - reserves space up front from each slot's OWN size mapping in ad-slot-definitions.json, so
 *    there is no layout shift;
 *  - renders a small uppercase "ADVERTISEMENT" label and nothing else (LRG-UI-009 §6: quieter —
 *    the large centred explanatory sentence is gone);
 *  - supports the three preview placement states the specification requires.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO:
 *  - no googletag / GPT call, no AdSense, no analytics, no push, no external request of any kind;
 *  - no slot ID, unit path, size map, dimension, placement or count is modified anywhere.
 *
 * NO-FILL (DS-24): the outer placement geometry is RETAINED while the inner creative area collapses
 * and the label is suppressed — so unfilled inventory neither shifts layout nor reads as broken.
 *
 * TWO REVIEW MODES (LRG-UI-011 §14), selected by LC_HOME_PREVIEW_AD_MODE:
 *  - production: the exact reserved geometry. This is the mode production layout is verified in.
 *  - compact:    the same slots at a reduced review height. Nothing is removed, merged, moved,
 *                reordered or hidden; no GAM mapping or breakpoint rule changes; and the production
 *                reservation stays readable on data-reserved-mobile-h / data-reserved-desktop-h.
 *                Compact geometry is NEVER evidence of production geometry.
 */

import { getAdSlot, getAdSizeMapping } from "@/lib/data-provider";
import { canarySlotConfig } from "@/lib/ads/canarySlots";
import AdReservation from "@/components/ads/AdReservation";
import { LEGACY_AD_PROVENANCE, type AnchorSlotGroup } from "@/lib/layout/adAnchors";
import type { HomePreviewAdMode } from "@/lib/preview/previewGuard";

/*
 * COMPACT REVIEW HEIGHTS (LRG-UI-011 §14).
 *
 * These are REVIEW AIDS, not geometry. They exist so a founder can read the whole page without
 * scrolling past tall empty reservations. Every slot, anchor, sequence position, slot key, GAM path
 * and production reservation height is retained and still inspectable in the DOM.
 *
 * A compact slot is never shorter than its production reservation — Math.min guarantees a slot that
 * is already small is left alone rather than being stretched.
 */
const COMPACT_MOBILE_H = 40;
const COMPACT_DESKTOP_H = 56;

function maxHeight(sizes: number[][] | null | undefined, fallback: number): number {
  if (!sizes || sizes.length === 0) return fallback;
  return Math.max(...sizes.map((s) => s[1] ?? fallback));
}
function maxWidth(sizes: number[][] | null | undefined, fallback: number): number {
  if (!sizes || sizes.length === 0) return fallback;
  return Math.max(...sizes.map((s) => s[0] ?? fallback));
}

/** Reserved geometry for one production slot, read from that slot's own definition. */
function reservation(slotKey: string) {
  const slot = getAdSlot(slotKey);
  const mapping = getAdSizeMapping(slot?.sizeMapping);
  const flat = slot?.sizes ?? null;

  const desktopTier = mapping?.breakpoints.find((b) => b.minViewport[0] >= 992)?.sizes;
  const mobileTier = mapping?.breakpoints.find((b) => b.minViewport[0] === 0)?.sizes;

  return {
    gamPath: slot?.gamPath ?? "UNKNOWN",
    mobileH: maxHeight(mobileTier ?? flat, 50),
    desktopH: maxHeight(desktopTier ?? flat, 90),
    maxW: maxWidth(desktopTier ?? flat, 728),
  };
}

/**
 * Debug-only classification badge (LRG-UI-014).
 *
 *   EXISTING AD            rendered on the legacy Home at the same content-relative position
 *   RELOCATED EXISTING AD  rendered on the legacy Home, moved into the contextual rail here
 *   NEW CANDIDATE AD       defined on the legacy Home but never rendered there
 *
 * The legacy div ID is included because that, not our slotKey, is what ad operations recognise.
 */
function AdDebugLabel({ slotKey }: { slotKey: string }) {
  const p = LEGACY_AD_PROVENANCE[slotKey];
  if (!p) return null;
  /* Only ACTIVE placements reach here. Retired and disabled records render no container at all and
     are labelled by AdNonActiveMarkers instead, so there is no NEW CANDIDATE branch. */
  const text = p.status === "EXISTING" ? "EXISTING AD" : "RELOCATED EXISTING AD";
  return (
    <span className="lcp-adslot__debug" data-legacy-status={p.status}>
      {/* §9 format: the classification followed by the legacy slot ID, which is the identifier ad
          operations recognise. */}
      <strong>
        {text} — {p.legacyDivId}
      </strong>
      <span>{slotKey}</span>
      <span>legacy L{p.legacyLine}</span>
    </span>
  );
}

export default function PreviewAdSlot({
  anchorId,
  group,
  adMode = "production",
  debug = false,
}: {
  anchorId: string;
  group: AnchorSlotGroup;
  /** Review mode only. Never removes, merges, moves or reorders a slot. */
  adMode?: HomePreviewAdMode;
  /**
   * LRG-UI-014 ad debug labels. Normal mode shows only "ADVERTISEMENT". Debug adds the legacy
   * classification and the legacy slot ID, so ad ops can see at a glance which placements are
   * inherited, which moved to the rail, and which the new page introduced.
   */
  debug?: boolean;
}) {
  const noFill = group.placementState === "no-fill-preview";
  const filled = group.placementState === "filled-preview";
  const compact = adMode === "compact";

  return (
    <div
      className={
        group.visibility === "lt-992"
          ? "lcp-ad-mobile"
          : /* §6: an INLINE slot restricted to >=992 needs its own gate — the rail's gate lives on
               .lcp-rail and does not apply to inline placements. */
            group.visibility === "gte-992" && group.subPosition === "inline"
            ? "lcp-ad-desktop"
            : undefined
      }
      data-ad-anchor={anchorId}
      data-sub-position={group.subPosition}
      data-placement-state={group.placementState}
      data-ad-mode={adMode}
    >
      {group.slotKeys.map((slotKey) => {
        const r = reservation(slotKey);
        /* Compact never exceeds the production reservation, so a genuinely small slot is untouched. */
        const mobileH = compact ? Math.min(r.mobileH, COMPACT_MOBILE_H) : r.mobileH;
        const desktopH = compact ? Math.min(r.desktopH, COMPACT_DESKTOP_H) : r.desktopH;
        return (
          /*
            LRG-ADS-CANARY-002 §2 — the outer reservation is now a client component that OWNS its runtime
            state. Every value below is still computed on the server and passed through verbatim; what
            changed is that `data-ad-active` / `data-ad-requested` are derived from the live GPT lifecycle
            instead of being hardcoded `false`, and a real no-fill suppresses the label and corrects the
            accessible name.
          */
          <AdReservation
            key={slotKey}
            canary={canarySlotConfig(slotKey, "home")}
            className={`lcp-adslot${noFill ? " lcp-adslot--nofill" : ""}${compact ? " lcp-adslot--compact" : ""}`}
            previewNoFill={noFill}
            dataAttributes={{
              "data-slot-key": slotKey,
              "data-gam-path": r.gamPath,
              "data-desktop-h": "1",
              /* The PRODUCTION reservation, recorded in BOTH modes. Compact changes what is drawn,
                 never what is configured — an audit reads the real numbers from here. */
              "data-reserved-mobile-h": r.mobileH,
              "data-reserved-desktop-h": r.desktopH,
            }}
            style={
              {
                minHeight: mobileH,
                maxWidth: r.maxW,
                marginBlock: compact ? 8 : 10,
                ["--lcp-ad-desktop-h" as string]: `${desktopH}px`,
              } as React.CSSProperties
            }
            /*
             * NO VISIBLE LABEL — LRG-ADS-017, founder instruction 2026-08-28, matched to production.
             *
             * The reservation used to draw the word "Advertisement" in every state. Production does not:
             * every leaf element on `lotterycorner.com/` was checked for ad labelling text
             * (advertisement / ad / ads / sponsored / advt) and there are ZERO matches across all 20
             * placements. An unfilled production slot is an empty reserved box with no text at all.
             *
             * The ACCESSIBLE name is deliberately kept. `AdReservation` still sets
             * `role="complementary"` with an `aria-label` from `reservationState`, so a screen-reader
             * user is still told this region is an advertisement and whether it is filled. That is the
             * honesty requirement; drawing the word on screen was never what satisfied it, and
             * production demonstrates the two are separable.
             *
             * `showLabel` is left in the contract rather than deleted: it still correctly reports that a
             * no-fill suppresses labelling, and reinstating a visible label is then a one-line change
             * here rather than a re-plumbing.
             */
            label={null}
          >
            {debug ? <AdDebugLabel slotKey={slotKey} /> : null}
            {filled ? (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 6,
                  border: "1px dashed var(--color-border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  pointerEvents: "none",
                }}
              />
            ) : null}
          </AdReservation>
        );
      })}
    </div>
  );
}
