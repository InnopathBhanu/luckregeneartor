"use client";

/*
 * Closable sticky footer advertisement — PROPOSED DESIGN FOR FOUNDER REVIEW.
 *
 * Task LRG-STATE-025 §18/§19. Authority: `APP-ST-05` names `sp_bottom_large_leaderboard` the
 * "closable sticky-footer candidate"; `FD-S-29` sets the sticky priority order and requires DERIVED
 * clearance; `OPEN-SX-05` records that whether a close control is required is still an open founder
 * decision.
 *
 * STATUS: **NOT PRODUCTION-APPROVED.** This implements the close control so the founder can review the
 * real interaction rather than a description. `OPEN-SX-05` stays open.
 *
 * WHY A CLIENT COMPONENT. A close control is genuine functionality — it really dismisses the bar and the
 * page really reclaims the clearance. That is the opposite of a fake handler: `FD-S-08` forbids controls
 * that look functional and are not, so a decorative × would be a violation. Everything else in the State
 * preview stays server-rendered; this is the only interactive island, and the advertisement itself remains
 * inert (no GAM, no partner script).
 *
 * SESSION SCOPE. Once closed the bar stays closed for the current page session only — `sessionStorage`,
 * not `localStorage`, and not a server profile. Reopening on the next visit is deliberate: a permanent
 * dismissal is an ad-operations decision, not ours.
 */

import { useEffect, useState } from "react";

const SESSION_KEY = "lcs-sticky-ad-closed";

export default function StateStickyFooterAd({
  children,
  reservedMobileH,
  reservedDesktopH,
}: {
  children: React.ReactNode;
  reservedMobileH: number;
  reservedDesktopH: number;
}) {
  /* Starts open so the server-rendered markup and the first client render agree — closing is a user act,
     never an initial state, so there is no hydration mismatch. */
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") setClosed(true);
    } catch {
      /* Storage can be unavailable (private mode, blocked). The bar simply stays open — never a crash. */
    }
  }, []);

  /* The clearance variables live on <body> (LRG-STATE-022). When the bar closes, the page must reclaim
     that space, otherwise a dismissed advertisement leaves a permanent gap at the end of the document. */
  useEffect(() => {
    const body = document.body;
    if (!body.classList.contains("lcs-doc-clearance")) return;
    if (closed) {
      body.style.setProperty("--lcs-stickyad-mobile-h", "0px");
      body.style.setProperty("--lcs-stickyad-desktop-h", "0px");
    } else {
      body.style.setProperty("--lcs-stickyad-mobile-h", `${reservedMobileH}px`);
      body.style.setProperty("--lcs-stickyad-desktop-h", `${reservedDesktopH}px`);
    }
  }, [closed, reservedMobileH, reservedDesktopH]);

  if (closed) return null;

  return (
    <div
      className="lcs-stickyfoot"
      data-sticky-layer="advertising"
      data-sticky-priority="4"
      data-closable="true"
    >
      <div className="lcp-container lcs-stickyfoot__inner">
        {children}
        <button
          type="button"
          className="lcs-stickyfoot__close"
          aria-label="Close advertisement"
          onClick={() => {
            setClosed(true);
            try {
              window.sessionStorage.setItem(SESSION_KEY, "1");
            } catch {
              /* Dismissal still works for this render even if it cannot be remembered. */
            }
          }}
        >
          {/* aria-hidden: the accessible name comes from aria-label, so the glyph must not be announced. */}
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  );
}
