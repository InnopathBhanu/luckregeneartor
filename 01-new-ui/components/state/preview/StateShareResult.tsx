"use client";

/*
 * SHARE RESULT — LRG-STATE-039 §5/§6.
 *
 * One reusable share action, used by every game family and every multi-state game. Sharing a result is the most
 * ordinary thing a lottery reader does after checking their numbers, and the page had no way to do it.
 *
 * WHAT IT SHARES. A governed URL only: the State page plus the family's EXISTING in-page fragment, which the
 * family panel and the multi-state block already render as `id="family-{familyId}"`. §5 forbids inventing a URL
 * pattern, and `/{state}/{game}` is a preserved route that is NOT implemented — sharing it would hand someone a
 * link to a 404. So the shared link is the page that genuinely exists, anchored at the result being shared.
 *
 * The fragment is the same public slug already in the DOM and in every internal anchor. No internal identifier,
 * no fixture key and no governance id is exposed.
 *
 * BEHAVIOUR, in the order §5 requires:
 *   1. `navigator.share` when the platform offers it — the native sheet, which is what a phone reader expects.
 *   2. Otherwise `navigator.clipboard.writeText`, then an inline "Link copied".
 *   3. If both are unavailable or refused, the URL is shown as selectable text so the reader can copy it
 *      manually. A share action that silently does nothing is worse than one that admits it cannot.
 *
 * NOT A DIALOG (FV-03 still governs). No modal, no backdrop, no focus trap, no login, no popup.
 *
 * ACCESSIBILITY (§6). The accessible name states the game, so a screen-reader user hears "Share Fantasy 5
 * result" rather than five identical "Share" buttons. The outcome is announced through a polite live region
 * that is present from first render — a region inserted at the same moment as its text is not reliably
 * announced. Focus never moves, so there is nothing to trap and nothing to restore.
 */

import { useRef, useState } from "react";

type Outcome = null | "shared" | "copied" | "manual" | "failed";

export default function StateShareResult({
  stateName,
  gameLabel,
  fragment,
  resultDateDisplay,
  resultStatus = null,
  memberLabel = null,
}: {
  stateName: string;
  /** The family the reader is sharing. Used in the accessible name and the share text. */
  gameLabel: string;
  /** The family's existing in-page anchor, without the `#`. Never a composed route. */
  fragment: string;
  resultDateDisplay: string | null;
  /** Carried so a corrected or pending result is never shared as if it were final. */
  resultStatus?: string | null;
  /** The specific draw within a family, where the reader picked one (for example Midday). */
  memberLabel?: string | null;
}) {
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [url, setUrl] = useState("");
  const busy = useRef(false);

  /** The reader-facing summary. Facts only — no prize claim, no prediction, no "you won". */
  const summary = [
    `${gameLabel}${memberLabel ? ` ${memberLabel}` : ""} — ${stateName} lottery results`,
    resultDateDisplay ? `Draw ${resultDateDisplay}` : null,
    /* A status only appears when it changes what the reader should believe (§2). */
    resultStatus && resultStatus !== "verified" ? `Status: ${resultStatus}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function share() {
    if (busy.current) return;
    busy.current = true;
    /* Built at click time from the page the reader is actually on, so no origin is ever hardcoded and the
       guarded preview cannot leak a production host it was not served from. */
    const target = `${window.location.origin}${window.location.pathname}#${fragment}`;
    setUrl(target);

    /** Copy, and report only what actually happened. */
    const copy = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(target);
          setOutcome("copied");
          return;
        }
      } catch {
        /* Clipboard permission refused — fall through to the manual link rather than claiming success. */
      }
      setOutcome("manual");
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        /*
         * WHY THIS IS A RACE AND NOT A PLAIN `await`.
         *
         * `navigator.share()` resolves when the share COMPLETES, not when the sheet opens — and on platforms
         * that expose the API without a working sheet (headless Chrome is one, and it was caught here at
         * runtime) the promise never settles at all. A plain `await` therefore left the button silent forever
         * and, because `busy` was only released in `finally`, un-retryable. A share action that appears to do
         * nothing is worse than one that admits it cannot share.
         *
         * So the native attempt gets a bounded window. If it settles, its own result is reported. If it does
         * not, the link is copied instead and the message says "Link copied" — which is exactly what happened.
         * If the reader is meanwhile looking at a real share sheet and completes it, both things happened and
         * neither statement was false.
         */
        const settled = await Promise.race([
          navigator.share({ title: summary, text: summary, url: target }).then(() => "shared" as const),
          new Promise<"unsettled">((r) => setTimeout(() => r("unsettled"), 1500)),
        ]);
        if (settled === "shared") setOutcome("shared");
        else await copy();
        return;
      }
      await copy();
    } catch {
      /* A REJECTED native share is usually the reader dismissing the sheet, so nothing is claimed to have been
         shared — but the link is still what they asked for, so it is copied. */
      await copy();
    } finally {
      busy.current = false;
    }
  }

  return (
    <span className="lcs-share" data-share-family={fragment}>
      <button
        type="button"
        className="lcs-fp__link lcs-share__btn"
        data-share-action="true"
        /* §6: the name identifies the game rather than repeating a bare "Share". */
        aria-label={`Share ${gameLabel} result`}
        onClick={share}
      >
        Share
      </button>

      {/* Present from first render so the announcement is reliable, and empty until there is something to say. */}
      <span className="lcs-share__status" role="status" aria-live="polite" data-share-status={outcome ?? "idle"}>
        {outcome === "copied" ? "Link copied" : null}
        {outcome === "shared" ? "Shared" : null}
        {outcome === "failed" ? "Could not share" : null}
      </span>

      {outcome === "manual" ? (
        /* The honest last resort: the exact link, selectable. No claim that anything was copied. */
        <span className="lcs-share__manual">
          Copy this link: <code>{url}</code>
        </span>
      ) : null}
    </span>
  );
}
