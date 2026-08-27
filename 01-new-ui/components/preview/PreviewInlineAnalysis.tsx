"use client";

/*
 * PreviewInlineAnalysis — inline AI draw analysis for the featured games.
 *
 * Authority: LRG-UI-014 "Inline AI analysis".
 *
 * WHY THIS REPLACES THE MODAL
 *   LRG-UI-013 moved analysis into a portalled dialog to stop an expanding <details> from stretching
 *   the sibling featured card. That fixed the height defect but made analysis a focus-trapping,
 *   scroll-locking overlay — too heavy for content the reader wants to compare against the cards.
 *   This component keeps the height fix and drops the modal.
 *
 * HOW THE HEIGHT FIX SURVIVES
 *   The drawer is a sibling of the featured grid, never a descendant. Expanding it grows the page
 *   below the grid; it cannot grow a grid row, so neither card's height changes. The triggers live in
 *   the cards, so this component owns the selected mode and renders the triggers itself.
 *
 * ONE MODE AT A TIME
 *   `mode` is a single value, not a set. Selecting Powerball closes Mega Millions and vice versa.
 *   Re-selecting the active mode collapses the drawer, and there is an explicit Collapse button.
 *
 * DESKTOP: one full-width drawer below the grid.
 * MOBILE:  the same drawer, rendered immediately after the featured group. No modal, no full-screen
 *          overlay, and NO nested scrolling area — the content flows with the page, so the only
 *          scrollbar is the document's.
 *
 * Play Online keeps its own overlay (a separate, focused commerce workflow). Analysis must not use it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawAnalysis, GameComparison } from "@/lib/preview/drawAnalysis";
import { IconCompare, IconDrawAnalysis } from "./AiIcon";

export type AnalysisMode = string | null;

export default function PreviewInlineAnalysis({
  games,
  comparison,
  panels,
}: {
  /** One entry per flagship game, in card order. */
  games: { slug: string; name: string; basisText: string }[];
  comparison: boolean;
  /**
   * Server-rendered analysis bodies, keyed by mode. A keyed MAP, not React children — every panel is
   * already in the HTML, so switching modes performs no I/O. There is no request of any kind.
   */
  panels: Record<string, React.ReactNode>;
}) {
  const [mode, setMode] = useState<AnalysisMode>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const toggle = useCallback(
    (next: string, el: HTMLButtonElement) => {
      lastTriggerRef.current = el;
      setMode((cur) => (cur === next ? null : next));
    },
    [],
  );

  const collapse = useCallback(() => {
    setMode(null);
    /* Focus returns to whichever trigger opened the drawer. */
    lastTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mode) return;
    /* Move focus to the drawer heading so keyboard and screen-reader users land on the new content.
       No focus TRAP — this is inline page content, not a dialog, and Tab must be able to leave. */
    drawerRef.current?.focus();
  }, [mode]);

  const active = games.find((g) => g.slug === mode);
  const label = (slug: string) => (mode === slug ? "Hide AI analysis" : "Explore AI analysis");

  return (
    <>
      {/* Triggers, one per card, rendered in card order below the grid so the grid stays untouched. */}
      <div className="lcp-anx__bar">
        {games.map((g) => (
          <button
            key={g.slug}
            type="button"
            className={`lcp-btn lcp-btn--tonal-quiet lcp-target lcp-anx__trigger${mode === g.slug ? " is-active" : ""}`}
            aria-expanded={mode === g.slug}
            aria-controls="lcp-analysis-drawer"
            onClick={(e) => toggle(g.slug, e.currentTarget)}
          >
            <IconDrawAnalysis size={16} />
            {g.name}: {label(g.slug)}
          </button>
        ))}
        {comparison ? (
          <button
            type="button"
            className={`lcp-btn lcp-btn--plain lcp-target lcp-anx__trigger${mode === "compare" ? " is-active" : ""}`}
            aria-expanded={mode === "compare"}
            aria-controls="lcp-analysis-drawer"
            onClick={(e) => toggle("compare", e.currentTarget)}
          >
            <IconCompare size={16} />
            {mode === "compare" ? "Hide comparison" : "Compare these games"}
          </button>
        ) : null}
      </div>

      {/*
       * The drawer. Always present in the DOM as a region so `aria-controls` resolves; its content
       * renders only while a mode is selected, so nothing contributes height when collapsed.
       */}
      <div
        id="lcp-analysis-drawer"
        className="lcp-anx"
        data-open={mode ? "true" : "false"}
        data-mode={mode ?? "none"}
      >
        {mode ? (
          <div
            className="lcp-anx__panel"
            ref={drawerRef}
            tabIndex={-1}
            role="region"
            aria-label={
              mode === "compare"
                ? "Comparison of Powerball and Mega Millions"
                : `Draw analysis for ${active?.name ?? mode}`
            }
          >
            <div className="lcp-anx__head">
              <div>
                <h3 className="lcp-anx__title">
                  {mode === "compare"
                    ? "Compare Powerball and Mega Millions"
                    : `Draw analysis — ${active?.name ?? ""}`}
                </h3>
                <p className="lcp-anx__sub">
                  {mode === "compare"
                    ? "Totals are shown as a position within each game's own range."
                    : (active?.basisText ?? "")}
                </p>
              </div>
              <button type="button" className="lcp-anx__collapse lcp-target" onClick={collapse}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 15l7-7 7 7"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Collapse
              </button>
            </div>
            {panels[mode]}
          </div>
        ) : null}
      </div>
    </>
  );
}
