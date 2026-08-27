"use client";

/*
 * GPT LIBRARY LOADER — LRG-ADS-CANARY-001 §2 and §3.
 *
 * ══ THE ONE PLACE THE LIBRARY IS FETCHED ══
 *
 * `gpt.js` is injected here and nowhere else, and only when all three conditions hold: GAM enabled, canary
 * mode, and the tester's session gate open. Before that the page makes **zero** requests to
 * `securepubads.g.doubleclick.net` — which is the pre-gate assertion in the validation matrix.
 *
 * ══ WHY A MANUAL SCRIPT ELEMENT AND NOT `next/script` ══
 *
 * `next/script` decides *when* to load; this component must decide *whether*, from state that only exists
 * after hydration. Rendering a `<Script>` conditionally makes the tag part of the React tree, so a hydration
 * recovery can re-insert it — the duplicate-script hazard §1 exists to prevent. A direct, id-guarded DOM
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

import { useEffect, useState } from "react";
import { CANARY_GATE_AVAILABLE } from "@/lib/ads/gamConfig";
import { isAdTestActive, onAdTestChange } from "@/lib/ads/adTestSession";
import { markLibraryBlocked } from "@/lib/ads/gptClient";

const SCRIPT_ID = "lc-gpt-js";
const GPT_SRC = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

export default function GamBootstrap() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isAdTestActive());
    return onAdTestChange(setActive);
  }, []);

  useEffect(() => {
    if (!CANARY_GATE_AVAILABLE || !active) return;
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
  }, [active]);

  return null;
}
