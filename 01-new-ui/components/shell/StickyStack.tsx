"use client";

import { useState } from "react";

/*
 * StickyStack — resolves the sticky hierarchy (DS-28 / Global Shell §6.4).
 *
 * Priority, highest first:
 *   1. safety / system controls
 *   2. mobile bottom navigation
 *   3. user-requested action (save / buy)
 *   4. advertising
 *
 * Consequences implemented here:
 *  - The sticky ad reservation sits ABOVE the bottom navigation, offset by its height plus the
 *    safe-area inset, so the two never overlap.
 *  - The affiliate action bar (GS-14, priority 3) is SUPPRESSED in the preview, so at most two
 *    sticky layers are ever present. Three layers must never compete.
 *  - Page clearance is DERIVED from the reserved heights (see .lcp-sticky-clearance), never a
 *    hardcoded guess.
 *
 * DS-27: this is a clearly labelled INACTIVE reservation. It asserts NO final production creative
 * height, because the sticky creative height (DS-26 / DS-34) is still unresolved with ad
 * operations — the Home sticky's size mapping permits a 336x280 mobile creative while the
 * implementation reserves far less. Nothing here should be read as approving a height.
 */
export default function StickyStack({
  slotKeys,
  label,
  debug = false,
}: {
  slotKeys: string[];
  /** LRG-ADS-015 §9: the sticky is an ACTIVE EXISTING placement and carries the same debug label. */
  debug?: boolean;
  /** Internal note only. Recorded on a data attribute, never rendered as visible copy. */
  label: string;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      /*
       * Sits above the bottom navigation: its own height + nav height + safe area.
       *
       * LRG-UX-SCHEMA-001 §9 moved the bottom padding into CSS (`.lcp-stickyad`). It was an inline
       * `calc(var(--lcp-bottom-nav-h) + …)` that could not be overridden by a media query — so at >=992px,
       * where GS-09 is `display: none`, the bar still reserved 56px for a navigation that was not on screen.
       * The measured consequence at 1440: a 125px-tall fixed layer where 69px is the actual advertisement, and
       * `scroll-padding-bottom` sized for the reservation left focused controls under the real bar.
       *
       * The slot is untouched — no move, no resize, no reorder (§12). Only the dead reservation goes.
       */
      className="lcp-stickyad"
      style={{
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        zIndex: 30,
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        boxShadow: "var(--elevation-1)",
      }}
      data-sticky-layer="advertising"
      data-sticky-priority="4"
    >
      <div
        className="lcp-container"
        style={{ position: "relative", paddingBlock: 6, textAlign: "center" }}
      >
        {/* Close control: >=44px target, absolutely positioned so it adds NO height to the bar. */}
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Close advertisement"
          className="lcp-target"
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div
          role="complementary"
          aria-label="Advertisement"
          data-slot-keys={slotKeys.join(",")}
          data-ad-active="false"
          /* The reservation note is developer copy and is not rendered (LRG-UI-010 direction 1,
             reaffirmed by LRG-UI-013 §15). DS-27 still holds — this asserts no final production
             creative height — and the note travels on this attribute for ad ops and the audit. */
          data-reservation-note={label}
          style={{
            minHeight: "var(--lcp-sticky-ad-h)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            color: "var(--color-text-muted)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Advertisement
          </span>
          {debug ? (
            <span className="lcp-adslot__debug" data-legacy-status="EXISTING" style={{ position: "static" }}>
              <strong>EXISTING AD — div-gpt-ad-1694709627267-0</strong>
              <span>{slotKeys.join(",")}</span>
              <span>legacy L3376 · #stickyAd</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
