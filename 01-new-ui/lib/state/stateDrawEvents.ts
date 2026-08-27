/*
 * THE PER-STATE DRAW-EVENT LOOKUP — LRG-STATE-047.
 *
 * One function, `drawEventsFor(code)`, is the only way the model reaches runtime result data. Before this
 * task `statePreviewModel.ts` imported `FLORIDA_DRAW_EVENTS` directly, which is what made the preview a
 * Florida implementation rather than a State template.
 *
 * `StateDrawEvent` is the SAME shape Florida already used. It is aliased rather than redefined so the two
 * cannot drift: if `FloridaDrawEvent` ever gains a field, every State's data has it too, and TypeScript says
 * so at the point of failure.
 *
 * WHAT THIS FILE DOES NOT DO. It holds no data of its own, parses nothing at runtime and reads no file. Each
 * State's events are a transcribed module with its own provenance header; this is only the dispatch.
 */

import { FLORIDA_DRAW_EVENTS, type FloridaDrawEvent } from "./floridaDrawEvents";
import { MI_DRAW_EVENTS, VA_DRAW_EVENTS, CA_DRAW_EVENTS, MD_DRAW_EVENTS } from "./feedDrawEvents";

/**
 * One published draw event for one member game, in any jurisdiction.
 *
 * The name is the generic one because the shape always was generic — `FloridaDrawEvent` describes a draw
 * event, not a Florida draw event. The alias keeps the Florida module and its provenance untouched.
 */
export type StateDrawEvent = FloridaDrawEvent;

const EVENTS: Record<string, readonly StateDrawEvent[]> = {
  fl: FLORIDA_DRAW_EVENTS,
  mi: MI_DRAW_EVENTS,
  va: VA_DRAW_EVENTS,
  ca: CA_DRAW_EVENTS,
  md: MD_DRAW_EVENTS,
  /* Utah has no entry and must not gain one. The production feed contains no `<State stateCode="UT">`
     block at all, which is the evidence — not an omission — behind the no-lottery profile. */
};

/** Every transcribed draw event for a jurisdiction. Empty for a State with no draw games. */
export function drawEventsFor(stateCode: string): readonly StateDrawEvent[] {
  return EVENTS[stateCode.toLowerCase()] ?? [];
}

/** Jurisdictions with transcribed runtime result data. Used by the registry's readiness reporting. */
export function statesWithDrawEvents(): string[] {
  return Object.keys(EVENTS);
}
