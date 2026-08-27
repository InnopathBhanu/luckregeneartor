"use client";

/*
 * THE OUTER AD RESERVATION — one truthful runtime-state contract for Home and State.
 * LRG-ADS-CANARY-002 §2.
 *
 * ══ WHAT WAS WRONG ══
 *
 * The reservation was server-rendered with STATIC attributes asserting that nothing had happened:
 *
 *     Home    data-ad-active="false"   data-ad-requested="false"
 *     State   data-gam-active="false"
 *
 * Those were accurate before the canary existed. Once `GamSlot` began registering and requesting, they stayed
 * false forever — so the outer element contradicted the inner one, and any audit reading the DOM (or the
 * verification matrix built from it) got the opposite of the truth.
 *
 * The runtime state also lived only on the inner GPT div, which meant a real `no-fill` could not reach the
 * things that must respond to it: the visible "Advertisement" label stayed up over an empty slot, and the
 * accessible name still said a filled ad was present.
 *
 * ══ THE CONTRACT ══
 *
 *   state       active   requested   treatment
 *   inactive    false    false       reserved placeholder, label shown
 *   registered  true     false       defined with GPT, nothing requested yet
 *   requested   true     true        request in flight
 *   filled      true     true        creative displayed
 *   no-fill     true     true        label SUPPRESSED, outer geometry retained, name says "not filled"
 *   blocked     true     false*      explicit debug state, never a fake fill
 *
 *   * `blocked` reports `requested=true` only when the request had already gone out before the failure, which
 *     is why it reads the recorded request flag rather than assuming either answer.
 *
 * ══ WHY THIS IS A CLIENT COMPONENT ══
 *
 * Because the state is React-owned and deterministic, which is what §2 requires. The alternative — letting the
 * inner slot reach up and mutate a server-rendered ancestor through a selector — is the fragile-ancestor
 * pattern §2 forbids, and it would put the DOM and React's model permanently out of sync.
 *
 * SSR is unaffected: a client component still server-renders. `inactive` is the state on the server AND on the
 * first client render, so the initial paint matches the server HTML byte for byte, with an empty or a populated
 * sessionStorage gate. That is the hydration acceptance criterion, satisfied by construction rather than by
 * suppression.
 */

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import GamSlot from "./GamSlot";
import type { CanarySlotConfig } from "@/lib/ads/canarySlots";
import { onSlotState, slotState, type SlotState } from "@/lib/ads/gptClient";
import { reservationPresentation } from "@/lib/ads/reservationState";
import "./adCanary.css";

export interface AdReservationProps {
  /** `null` when this placement is not canary-eligible; the reservation then stays permanently `inactive`. */
  canary: CanarySlotConfig | null;
  /** Everything the SERVER computed about the reservation. None of it is re-derived here. */
  className: string;
  style: CSSProperties;
  /** Inventory and provenance attributes, passed through verbatim. */
  dataAttributes: Record<string, string | number | undefined>;
  /**
   * Whether the PREVIEW placement state already suppresses the label (`no-fill-preview` on Home,
   * `no-fill` on State). Runtime no-fill is ORed with this — either reason suppresses it.
   */
  previewNoFill: boolean;
  /** The label element, rendered only when it should be visible. */
  label: ReactNode;
  /** Anything that renders regardless of state (debug badges, preview affordances). */
  children?: ReactNode;
}

export default function AdReservation({
  canary,
  className,
  style,
  dataAttributes,
  previewNoFill,
  label,
  children,
}: AdReservationProps) {
  const divId = canary?.divId ?? null;
  const [state, setState] = useState<SlotState>("inactive");
  /* Whether a request went out at any point. `blocked` alone cannot say — see `reservationState.ts`. */
  const [requested_, setRequested] = useState(false);

  useEffect(() => {
    if (!divId) return;
    setState(slotState(divId));
    return onSlotState((id, next) => {
      if (id !== divId) return;
      setState(next);
      if (next === "requested" || next === "filled" || next === "empty-response") setRequested(true);
      if (next === "inactive") setRequested(false);
    });
  }, [divId]);

  /* The whole decision, from one pure function that the test suite exercises row by row. A runtime no-fill
     suppresses the label for the same reason the preview state does: an empty slot must not advertise itself
     as an advertisement. The outer box is untouched either way (DS-24). */
  const { active, requested, showLabel, ariaLabel } = reservationPresentation(state, previewNoFill, requested_);

  return (
    <div
      className={className}
      style={style}
      {...dataAttributes}
      /* THE runtime attribute. One name, one meaning, on Home and State alike. */
      data-gam-state={state}
      /* The two legacy booleans now DERIVE from that state instead of contradicting it. */
      data-ad-active={active ? "true" : "false"}
      data-ad-requested={requested ? "true" : "false"}
      role="complementary"
      aria-label={ariaLabel}
    >
      {showLabel ? label : null}
      {children}
      {canary ? <GamSlot {...canary} /> : null}
    </div>
  );
}
