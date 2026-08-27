"use client";

/*
 * PreviewOverlay — the ONE guarded overlay for the Home preview.
 *
 * Authority: LRG-UI-013 §3 (featured-card expansion fix), §4 (play options), §5 (AI analysis),
 * §11 (Where to Play). Global Shell §145/§147 (dialog accessibility).
 *
 * WHY THIS EXISTS
 *   Featured content used native <details>. Expanding one inside a CSS grid row grew that grid row,
 *   which stretched the sibling card and left a large empty region in the shorter one. The fix is not
 *   to restyle the panel — it is to take the panel out of document flow entirely.
 *
 * HOW
 *   The overlay is rendered through createPortal into document.body, so it is genuinely OUTSIDE the
 *   featured-card grid in the DOM, not merely positioned over it. Closed by default; while closed
 *   nothing but the trigger exists in the layout, so neither card can change height.
 *
 * ONE COMPONENT, TWO MODES (§5: AI and commerce stay separate)
 *   mode="analysis"  AI teal identity, for draw analysis and comparison.
 *   mode="commerce"  neutral action identity, for ticket options.
 *   The modes share only chrome. No analysis output is ever passed into a commerce overlay and no
 *   commerce content into an analysis overlay — the caller decides, and the two never mix.
 *
 * ACCESSIBILITY
 *   role="dialog" aria-modal, labelled by its title · focus moves into the dialog on open and returns
 *   to the invoking control on close · Escape closes · Tab is contained within the dialog · background
 *   scroll is locked while open · a visible close button, ≥44px.
 *
 * NO EXTERNAL REQUEST. This component fetches nothing and imports no network client. Its children are
 * rendered on the server and passed in; opening the overlay performs no I/O whatsoever.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type OverlayMode = "analysis" | "commerce";

/** Selector for what can hold focus inside the dialog. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export default function PreviewOverlay({
  mode,
  title,
  subtitle,
  triggerLabel,
  triggerIcon,
  triggerVariant = "tonal-quiet",
  children,
}: {
  mode: OverlayMode;
  /** Accessible name of the dialog, and its visible heading. */
  title: string;
  subtitle?: string;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  /* LRG-STATE-038 FP-02 adds the two commerce variants. This is a type widening only — no existing
     caller changes behaviour, and the trigger markup, geometry and dialog contract are untouched. */
  triggerVariant?: "tonal" | "tonal-quiet" | "plain" | "commerce" | "commerce-quiet";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  /* createPortal needs a DOM target, which only exists after hydration. */
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    /* Focus returns to the control that opened it — never dumped at the top of the document. */
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    /* Move focus into the dialog. Prefer the first focusable; fall back to the dialog itself. */
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    /* Lock background scroll, restoring whatever the page had before. */
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      /* Contain Tab within the dialog so focus cannot wander into the locked page behind it. */
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === node,
      );
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`lcp-btn lcp-btn--${triggerVariant} lcp-target`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        data-overlay-mode={mode}
      >
        {triggerIcon}
        {triggerLabel}
      </button>

      {mounted && open
        ? createPortal(
            <div className="lcp-ov" data-overlay-mode={mode}>
              {/* Scrim. Clicking it closes — a conventional, discoverable dismissal that is not the
                  ONLY one: the visible button and Escape both work. */}
              <div className="lcp-ov__scrim" onClick={close} aria-hidden />
              <div
                ref={dialogRef}
                className="lcp-ov__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
              >
                <div className="lcp-ov__head">
                  <div>
                    <h2 className="lcp-ov__title" id={titleId}>
                      {title}
                    </h2>
                    {subtitle ? <p className="lcp-ov__sub">{subtitle}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="lcp-ov__close lcp-target"
                    onClick={close}
                    aria-label={`Close ${title}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="lcp-ov__body">{children}</div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
