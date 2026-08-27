"use client";

/*
 * THE CANARY GATE — LRG-ADS-CANARY-001 §2.
 *
 * A single, plainly-labelled control that a named tester uses to permit Ad Manager requests for the current
 * browser tab, and to withdraw that permission again.
 *
 * ══ WHAT IT IS NOT ══
 *
 * It is NOT a consent management platform and its copy says so. It records one boolean about one tester's tab:
 * no purposes, no vendors, no legal basis, no TCF signal, and nothing about any end user. Public activation
 * remains blocked until the approved Google-certified CMP arrangement is confirmed.
 *
 * ══ WHY IT RENDERS NOTHING OUTSIDE CANARY MODE ══
 *
 * A public build must not carry a control that can start ad requests, however carefully it is worded. The two
 * build-time flags decide whether this component exists at all; the tester's press decides whether it fires.
 *
 * ══ HYDRATION ══
 *
 * The server always renders the OFF state, because `sessionStorage` does not exist there and ad state must
 * never enter cached HTML (Global Shell §33 makes the same demand of account state). The real value is read in
 * an effect, so the first client paint matches the server and no recovery is triggered — which matters
 * especially here, since recovery is what duplicated scripts before §1 was fixed.
 */

import { useEffect, useState } from "react";
import "./adCanary.css";
import { CANARY_GATE_AVAILABLE, PUBLIC_ACTIVATION_BLOCKED } from "@/lib/ads/gamConfig";
import { isAdTestActive, onAdTestChange, setAdTestActive } from "@/lib/ads/adTestSession";

export default function AdVerificationGate() {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isAdTestActive());
    return onAdTestChange(setActive);
  }, []);

  if (!CANARY_GATE_AVAILABLE) return null;

  return (
    <div className="lcgam-gate" data-ad-gate={active ? "active" : "inactive"} role="region" aria-label="Ad verification">
      <div className="lcgam-gate__inner">
        <p className="lcgam-gate__title">
          Ad verification{" "}
          <span className="lcgam-gate__state" data-gate-state={active ? "on" : "off"}>
            {mounted && active ? "running" : "not started"}
          </span>
        </p>
        <p className="lcgam-gate__note">
          {active
            ? "Ad Manager requests are enabled for this browser tab only. Close the tab or stop the test to end them."
            : "No ad requests have been made. Starting the test lets the approved Home and Florida placements request from Ad Manager in this tab."}
        </p>
        <p className="lcgam-gate__note lcgam-gate__note--caution">
          Restricted technical canary — not a certified consent platform. {PUBLIC_ACTIVATION_BLOCKED.reason}
        </p>
        <button
          type="button"
          className="lcgam-gate__button lcp-target"
          data-ad-gate-toggle={active ? "stop" : "start"}
          aria-pressed={active}
          onClick={() => setAdTestActive(!active)}
        >
          {active ? "Stop ad verification" : "Start ad verification"}
        </button>
      </div>
    </div>
  );
}
