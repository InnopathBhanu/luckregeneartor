/*
 * WHAT EACH RUNTIME STATE MEANS TO THE OUTER RESERVATION — LRG-ADS-CANARY-002 §2.
 *
 * ══ WHY THIS IS A SEPARATE, PURE MODULE ══
 *
 * §2 requires the runtime-state contract to be exercised by tests rather than asserted by reading source. The
 * component that renders it is `.tsx`, and the test runner is Node's own type stripping, which cannot parse
 * JSX — so a table buried inside the component would be untestable in exactly the way §2 rules out.
 *
 * Extracting the decision makes it a pure function of one input: every row of the contract can be asserted
 * directly, and `AdReservation` becomes a thin renderer of an answer it does not compute.
 *
 * ══ THE CONTRACT ══
 *
 *   state           active   requested   label      accessible name
 *   inactive        false    false       shown      "Advertisement"
 *   registered      true     false       shown      "Advertisement"
 *   requested       true     true        shown      "Advertisement"
 *   filled          true     true        shown      "Advertisement"
 *   empty-response  true     true        SUPPRESSED "Advertisement, not filled"
 *   blocked         true     (see below) shown      "Advertisement"
 *
 * `empty-response` is named for what was observed, not for a cause — see `EMPTY_RESPONSE_CAUSES`. The READER
 * treatment is identical whichever cause applies, which is why the presentation table needs only the one row:
 * an empty box must not advertise itself as an advertisement, however it came to be empty.
 *
 * `blocked` is the one row that cannot be read off the state alone. A slot can be blocked before it ever
 * requested (the library failed to load) or after (a request went out and something downstream broke), and
 * reporting `requested=true` for the first case would claim an ad request that never happened. So the caller
 * passes what actually occurred and this function reports it rather than guessing.
 *
 * The geometry is deliberately ABSENT from this table. No state changes the reserved box: a no-fill keeps its
 * height (DS-24, `CLAUDE.md` §12 — fixed placements do not collapse), and only the label and the accessible
 * name respond.
 */

import type { SlotState } from "./gptClient";

export interface ReservationPresentation {
  /** The placement has been handed to GPT. */
  active: boolean;
  /** An ad request has actually gone out for this placement. */
  requested: boolean;
  /** Whether the visible "Advertisement" label renders. */
  showLabel: boolean;
  /** The accessible name for the reservation region. */
  ariaLabel: string;
}

/** Runtime states in which the placement has been handed to GPT. */
const ACTIVE: readonly SlotState[] = ["registered", "requested", "filled", "empty-response", "blocked"];
/** Runtime states that can only be reached by an ad request having gone out. */
const REQUESTED: readonly SlotState[] = ["requested", "filled", "empty-response"];

/* The accessible name for an empty slot. "not filled" describes the BOX, which is all the reader needs and
   all the event supports — it makes no claim about why Ad Manager returned nothing. */
export const NOT_FILLED_LABEL = "Advertisement, not filled";
export const FILLED_LABEL = "Advertisement";

/**
 * The presentation for one reservation.
 *
 * @param state          the live GPT lifecycle state for this slot
 * @param previewNoFill  whether the PREVIEW placement state already suppresses the label, independently of
 *                       any real response. Either reason suppresses it; neither overrides the other.
 * @param requestSent    whether a request had gone out before a `blocked` state was reached. Ignored in every
 *                       other state, where the state itself is decisive.
 */
export function reservationPresentation(
  state: SlotState,
  previewNoFill: boolean,
  requestSent = false,
): ReservationPresentation {
  const active = ACTIVE.includes(state);
  const requested = state === "blocked" ? requestSent : REQUESTED.includes(state);
  const noFill = previewNoFill || state === "empty-response";
  return {
    active,
    requested,
    showLabel: !noFill,
    ariaLabel: noFill ? NOT_FILLED_LABEL : FILLED_LABEL,
  };
}
