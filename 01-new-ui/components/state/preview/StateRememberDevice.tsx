"use client";

/*
 * "Remember Florida on this device" — LRG-STATE-034 §11.
 *
 * THE ONE return-loop control the anonymous launch is allowed to render.
 *
 * `FD-X-09` DEFERS Follow State, Follow Game, notification delivery, cross-device saved games and personalised
 * account feeds, and states plainly: "Do not render disabled Follow or Notify controls." `FD-N-04` then names
 * what anonymous continuity MAY do — "local last-visit marker · deterministic what-changed summary · session
 * State selection". A device-local state memory is that third item, and it is the only one of the four §11
 * items that needs a control at all.
 *
 * So this is a REAL, WORKING toggle with an honest promise:
 *   - `localStorage` on this device only. No account, no server, no cross-device claim — the copy says so.
 *   - It stores one value: the state code. No browsing history, no preferences, no identifiers.
 *   - It can be turned off, and turning it off deletes the value rather than flagging it.
 *   - It promises nothing it cannot do. It does not say "we will notify you".
 *
 * It is deliberately NOT called Follow. Follow means alerts, and alerts are deferred.
 */

import { useEffect, useState } from "react";

const KEY = "lcs-remembered-state";

export default function StateRememberDevice({
  stateName,
  stateCode,
}: {
  stateName: string;
  stateCode: string;
}) {
  const [remembered, setRemembered] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setRemembered(window.localStorage.getItem(KEY) === stateCode);
    } catch {
      /* Storage unavailable. The control is hidden rather than shown in a state it cannot honour. */
      setRemembered(null);
    }
  }, [stateCode]);

  /* Null means we could not read storage, so the toggle would be a promise we cannot keep. */
  if (remembered === null) return null;

  const toggle = () => {
    try {
      if (remembered) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, stateCode);
      setRemembered(!remembered);
    } catch {
      /* Nothing to report to the reader: the value simply did not change. */
    }
  };

  return (
    <div className="lcs-remember" data-remember-device={remembered ? "on" : "off"}>
      <button
        type="button"
        className="lcs-remember__btn"
        aria-pressed={remembered}
        onClick={toggle}
      >
        {remembered ? `${stateName} is remembered on this device` : `Remember ${stateName} on this device`}
      </button>
      <p className="lcs-remember__note">
        {remembered
          ? `This browser will open ${stateName} first. Stored on this device only — turn it off any time, and the setting is deleted.`
          : `We will open ${stateName} first next time. Stored on this device only, never on an account, and never shared between devices.`}
      </p>
    </div>
  );
}
