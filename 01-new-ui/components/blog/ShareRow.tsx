"use client";

/*
 * SHARE THIS ARTICLE — BL-10, the founder's "engaging and sharable" requirement, per 07C Template M's
 * persona-simple social package.
 *
 * The channels are the ones ordinary U.S. players actually use — Facebook, X, WhatsApp, email — plus a
 * copy-link control. No exotic networks, no share counters (a counter would need readership data nobody has,
 * and counts are never invented), no third-party share SDK: every button is a plain intent URL built from the
 * post's ONE canonical URL, so no partner script loads and consent gating is untouched.
 *
 * Template M's rule — "Do not impersonate a user recommendation" — is kept structurally: the prefilled text is
 * the verified headline, never a first-person endorsement.
 */

import { useCallback, useState } from "react";

export default function ShareRow({ url, headline }: { url: string; headline: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Clipboard can be unavailable (permissions, http). The honest fallback: select-able visible URL below. */
      setCopied(false);
      window.prompt("Copy this link:", url);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(headline);

  return (
    <div className="lcb-share" data-share-row="true">
      <ul className="lcb-share__list">
        <li>
          <a
            className="lcb-share__btn"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            data-share-channel="facebook"
          >
            Facebook<span className="lcb-vh"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a
            className="lcb-share__btn"
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            data-share-channel="x"
          >
            X<span className="lcb-vh"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a
            className="lcb-share__btn"
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            data-share-channel="whatsapp"
          >
            WhatsApp<span className="lcb-vh"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a
            className="lcb-share__btn"
            href={`mailto:?subject=${encodedText}&body=${encodedUrl}`}
            data-share-channel="email"
          >
            Email
          </a>
        </li>
        <li>
          <button type="button" className="lcb-share__btn" onClick={copy} data-share-channel="copy-link">
            {copied ? "Copied" : "Copy link"}
          </button>
        </li>
      </ul>
      <p className="lcb-share__status" role="status" aria-live="polite">
        {copied ? "Link copied to your clipboard." : ""}
      </p>
    </div>
  );
}
