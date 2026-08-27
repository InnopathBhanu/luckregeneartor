/*
 * THE EXIT-RAMP CONTRACT — §B4.
 *
 * The shape and the order. `components/shell/ResultExitRamps.tsx` is the rendering half.
 *
 * Split for the same two reasons as `sectionContract.ts`: a page family's model resolves its own ramps (see
 * `gameExitRamps.ts`), so the type belongs in `lib` rather than in a component; and the ORDER is the whole value of
 * the feature, so it has to be a constant a test can import and assert rather than a regex over JSX.
 */

export interface ExitRamp {
  key: "prizes" | "history" | "rules" | "stateHub";
  label: string;
  /** `null` when this build serves no such destination. A null ramp is omitted, never disabled. */
  href: string | null;
}

/**
 * The fixed order, on every page family.
 *
 * Predictable POSITION is the point: a reader learns once that "past results" is second, and it is second on the
 * State page, the Game Page, the archive and both flagship hubs. `ResultExitRamps` sorts into this order regardless
 * of the order a caller passes, so a caller cannot accidentally reorder one page.
 */
export const EXIT_RAMP_ORDER: readonly ExitRamp["key"][] = Object.freeze([
  "prizes", "history", "rules", "stateHub",
]);
