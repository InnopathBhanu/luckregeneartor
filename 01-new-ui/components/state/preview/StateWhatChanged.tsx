"use client";

/*
 * "What changed since your last visit" — FD-X-09, anonymous and local only.
 *
 * LRG-STATE-037 FV-06 moved this INLINE, directly below the action row, as a `<details>` disclosure. It was a
 * full section further down the page; now it costs one line until a reader opens it, and it never opens a
 * dialog.
 *
 * APPROVED SCOPE: a local-only last-visit marker, a deterministic change summary, new verified-result
 * count, correction count, jackpot-change summary, next-draw summary.
 *
 * WHAT MAKES THIS ETHICAL, AND DELIBERATE:
 *   - `localStorage` only. No account, no server profile, no cross-device promise (FD-X-09).
 *   - The counts are computed from the page's own published data. Nothing is fabricated.
 *   - Suppressed entirely when nothing changed — never "you missed…".
 *   - No streak, no near-miss, no loss framing, no urgency, no prediction.
 *   - The first visit is useful on its own rather than an empty teaser.
 *
 * Storing only a feed-version marker plus a timestamp means we keep no browsing history — we cannot tell
 * what someone looked at, only whether the published data moved since they were last here.
 */

import { useEffect, useState } from "react";

const KEY = "lcs-fl-last-visit";

interface Movement {
  family: string;
  current: string;
  next: string;
}

export default function StateWhatChanged({
  stateName,
  resultCount,
  latestResultDate,
  movements,
  feedVersion,
}: {
  stateName: string;
  resultCount: number;
  latestResultDate: string | null;
  movements: Movement[];
  feedVersion: string;
}) {
  const [state, setState] = useState<
    { kind: "first" } | { kind: "returning"; since: string; changed: boolean } | null
  >(null);

  useEffect(() => {
    let prev: { v: string; t: string } | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) prev = JSON.parse(raw) as { v: string; t: string };
    } catch {
      /* Storage unavailable — fall through to the first-visit state, which is still useful. */
    }

    if (!prev) setState({ kind: "first" });
    else setState({ kind: "returning", since: prev.t, changed: prev.v !== feedVersion });

    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ v: feedVersion, t: new Date().toISOString().slice(0, 10) }),
      );
    } catch {
      /* Not remembering this visit is acceptable; inventing a visit is not. */
    }
  }, [feedVersion]);

  /* LRG-STATE-037 FV-06: an inline `<details>` disclosure directly below the action row. Not a dialog, and one
     line tall when collapsed. Semantic and keyboard-operable.

     THE SHELL IS SERVER-RENDERED; ONLY THE VERDICT IS NOT. An earlier revision returned `null` until the local
     marker had been read, which kept the server HTML honest but left the action row's `What changed` pointing at
     an `#what-changed` anchor that did not exist yet — a link that looks functional and is not, which CLAUDE.md
     §9 forbids. It also made the element pop into the layout after hydration.

     So the disclosure always renders. Before the marker is read it states only that the check happens on this
     device and claims nothing about a previous visit; `data-what-changed="checking"` marks that state. The
     server HTML therefore asserts no visit history, the first client render agrees with it, and the anchor
     resolves from the first paint. */
  return (
    <details className="lcs-wc" id="what-changed" data-what-changed={state?.kind ?? "checking"}>
      <summary className="lcs-wc__summary">
        What changed
        <span className="lcs-wc__hint">
          {state === null
            ? ""
            : state.kind === "first"
              ? " · first visit"
              : state.changed
                ? " · new results since your last visit"
                : " · nothing new"}
        </span>
      </summary>

      <div className="lcs-wc__body">
        {state === null ? (
          /* Pre-hydration and no-JS. True in both cases, and it promises nothing. */
          <p>
            This check runs on your device and compares the results on this page against a marker kept only in
            this browser. There is no account and no cross-device history.
          </p>
        ) : state.kind === "first" ? (
          <p>
            Return after the next draw to see what changed. Nothing about this visit leaves your device — there
            is no account and no cross-device history.
          </p>
        ) : (
          <>
            <p>
              {state.changed
                ? `New results have been published since you were last here on ${state.since.slice(0, 10)}.`
                : `Nothing new since you were last here on ${state.since.slice(0, 10)}.`}
            </p>
            <ul className="lcs-wc__list">
              <li>{resultCount} verified {stateName} draw results published</li>
              {latestResultDate ? <li>Most recent result {latestResultDate.slice(0, 10)}</li> : null}
              {movements.length > 0
                ? movements.map((m) => (
                    <li key={m.family}>{m.family}: {m.current} now, {m.next} next</li>
                  ))
                : null}
              <li><a href="#upcoming-draws">Next {stateName} draws</a></li>
            </ul>
          </>
        )}
        <p className="lcs-fine lcs-muted">
          Counted from this page&apos;s published results against a marker kept only on this device. No
          browsing history is stored.
        </p>
      </div>
    </details>
  );
}
