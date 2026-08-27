/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

"use client";

import { useState } from "react";

/*
 * StickyFooterAd — the production sticky, CLOSABLE footer ad (JSP: #stickyAd + #closeAdButton),
 * wrapping the bottom_large_leaderboard slot. Fixed at the viewport bottom, centered, with a close
 * button; closing hides only this sticky container for the session (production uses a 1-hour hideAd
 * cookie — session state is equivalent for Phase 1).
 *
 * Height matches the production sticky bar: it tracks the LEADERBOARD creative (728x90 desktop /
 * 320x50 mobile) — the child AdSlot is passed `sticky`, so it reserves only that shallow height, not
 * the generic size-mapping max. The close button is absolutely positioned so it never adds height to
 * the bar. No live GAM.
 *
 * Children is the reserved AdSlot (with `sticky`) for this slot, rendered server-side and passed in.
 */
export default function StickyFooterAd({
  children,
  slotKey,
}: {
  children: React.ReactNode;
  slotKey: string;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div
      id="stickyAd"
      data-slot-key={slotKey}
      className="fixed inset-x-0 bottom-0 z-40 border-t text-center"
      style={{ background: "var(--lc-surface)", borderColor: "var(--lc-border)" }}
    >
      <div className="lc-container relative flex items-center justify-center py-1.5">
        <button
          id="closeAdButton"
          type="button"
          aria-label="Close the ad"
          title="Close the ad"
          onClick={() => setClosed(true)}
          className="absolute right-2 top-1 z-10 text-sm font-bold leading-none"
          style={{ color: "var(--lc-accent)" }}
        >
          ✕
        </button>
        <div id="adContent" className="w-full">{children}</div>
      </div>
    </div>
  );
}
