"use client";

/*
 * GPT LIBRARY LOADER — LRG-ADS-CANARY-001 §2 and §3.
 *
 * ══ THE ONE PLACE THE LIBRARY IS FETCHED ══
 *
 * `gpt.js` is injected here and nowhere else. It loads automatically on the protected temporary subdomain
 * unless `NEXT_PUBLIC_GAM_ENABLED=false`; that exact flag is the deployment kill switch.
 *
 * ══ WHY A MANUAL SCRIPT ELEMENT AND NOT `next/script` ══
 *
 * Rendering a `<Script>` conditionally makes the tag part of the React tree, so a hydration recovery can
 * re-insert it — the duplicate-script hazard §1 exists to prevent. A direct, id-guarded DOM
 * insertion is idempotent by construction: the id is checked against the live document, not against React's
 * memory of it.
 *
 * The command queue is initialised BEFORE the script tag is appended, which is what lets every slot component
 * queue `defineSlot` work without caring whether the library has arrived yet.
 *
 * ══ FAILURE IS A STATE, NOT A SILENCE ══
 *
 * An ad blocker or a network failure fires `onerror`. That marks every registered slot `blocked` rather than
 * leaving them at `registered` forever, so the matrix can tell "the library never loaded" from "Ad Manager
 * returned nothing" — two different investigations.
 */

import { useEffect } from "react";
import { GAM_ENABLED } from "@/lib/ads/gamConfig";
import { markLibraryBlocked } from "@/lib/ads/gptClient";

const SCRIPT_ID = "lc-gpt-js";
const GPT_SRC = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

export default function GamBootstrap() {
  useEffect(() => {
    if (!GAM_ENABLED) return;
    /* Idempotent against the DOM, so Strict Mode's double effect and any hydration recovery are both no-ops. */
    if (document.getElementById(SCRIPT_ID)) return;

    window.googletag = window.googletag ?? ({ cmd: [] } as never);

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = GPT_SRC;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.addEventListener("error", () => {
      markLibraryBlocked("gpt.js failed to load (ad blocker, network, or CSP)");
    });
    document.head.appendChild(s);

    /*
     * NOT removed on cleanup, deliberately. GPT registers global state the moment it runs; removing the tag
     * would not unregister it, and re-adding it on the next effect would load a second copy over the first —
     * the duplicate-library case that produces duplicate slot definitions.
     */
  }, []);

  return null;
}
