"use client";

/*
 * LISTEN TO THIS ARTICLE — BL-05, the founder's audio requirement, implemented as REAL browser speech.
 *
 * ══ WHAT THIS IS ══
 *
 * The browser's built-in SpeechSynthesis API reading the article's own text (headline, Key points, body —
 * built server-side in `blogPostModel.ts` so the audio and the page always match). Genuine functionality:
 * play, pause, resume and stop all work, and nothing plays until the reader asks — NO AUTOPLAY, ever.
 *
 * ══ WHAT THIS IS NOT ══
 *
 *   - Not a fake player: no waveform theatre, no fabricated duration, no disabled controls dressed as working
 *     ones (`CLAUDE.md` §9 / FD-DAT-17).
 *   - Not AI, and never labelled as such: the voice is the reader's own device speaking the visible text.
 *   - Not a network feature: no audio file is fetched, nothing is recorded, nothing leaves the device.
 *
 * ══ THE ABSENT STATE IS HONEST ══
 *
 * Before hydration — and forever, when JavaScript is off — the server HTML carries one truthful sentence:
 * listening needs JavaScript and a browser voice. After mount the component checks `window.speechSynthesis`
 * once: supported browsers get the real controls, unsupported ones keep an honest sentence. No spinner, no
 * "coming soon", no dead button.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type ListenStatus = "idle" | "speaking" | "paused";

export default function ListenControl({ text, headline }: { text: string; headline: string }) {
  /** `null` until the one post-mount capability check runs — the server renders the honest fallback. */
  const [supported, setSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ListenStatus>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined"
        && "speechSynthesis" in window
        && typeof window.SpeechSynthesisUtterance === "function",
    );
    /* Leaving the page stops the voice — a reader must never need to hunt for the tab that is talking. */
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const start = useCallback(() => {
    /* Guarded by the capability check; runs ONLY from the reader's click. */
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus("speaking");
  }, [text]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setStatus("speaking");
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  /* The honest absent state — also the no-JavaScript state the server renders. */
  if (supported !== true) {
    return (
      <p
        className="lcb-listen__absent"
        data-listen-control="true"
        data-listen-supported={supported === null ? "pending" : "false"}
      >
        Listening uses your browser&apos;s built-in voice and needs JavaScript. If no player appears here, this
        browser doesn&apos;t offer one — the Key points above cover the article in brief.
      </p>
    );
  }

  return (
    <div
      className="lcb-listen__player"
      data-listen-control="true"
      data-listen-supported="true"
      data-listen-status={status}
    >
      {status === "idle" ? (
        <button type="button" className="lcb-listen__btn" onClick={start}>
          <span aria-hidden="true">▶</span> Listen to this article
        </button>
      ) : (
        <>
          {status === "speaking" ? (
            <button type="button" className="lcb-listen__btn" onClick={pause}>
              <span aria-hidden="true">⏸</span> Pause
            </button>
          ) : (
            <button type="button" className="lcb-listen__btn" onClick={resume}>
              <span aria-hidden="true">▶</span> Resume
            </button>
          )}
          <button type="button" className="lcb-listen__btn lcb-listen__btn--quiet" onClick={stop}>
            Stop
          </button>
        </>
      )}
      <span className="lcb-listen__hint" role="status">
        {status === "idle"
          ? "Read aloud by your browser's own voice."
          : status === "speaking"
            ? `Reading "${headline}".`
            : "Paused."}
      </span>
    </div>
  );
}
