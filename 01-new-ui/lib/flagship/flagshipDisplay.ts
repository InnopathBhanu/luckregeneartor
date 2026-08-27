/*
 * DISPLAY MODE AND THE PROVENANCE VOCABULARY — FGP-009.
 *
 * ══ THE PROBLEM THIS SOLVES ══
 *
 * Founder direction for FGP-009: preview drawings must be *"clearly marked internally as mock source"*, but the
 * page must *"not show 'synthetic/internal-review' labels in the consumer UI unless the page is explicitly in
 * internal review mode"*.
 *
 * Those pull in opposite directions unless the labelling is separated from the data. The row's provenance is a
 * fact and never changes; what the reader is TOLD depends on who is reading. So provenance stays on the row, and
 * this module owns the two vocabularies — one for a founder or reviewer inspecting the build, one for a reader
 * on a preview deployment.
 *
 * ══ WHAT THE CONSUMER REGISTER DOES NOT DO ══
 *
 * It does not hide the distinction. A preview row still carries a visible tag, still carries `data-provenance` in
 * the markup, and the page still leads with the disclosure banner. It uses the words a reader can act on —
 * "Preview" rather than "synthetic/internal-review", which is internal vocabulary that would read as a defect.
 *
 * `CLAUDE.md` §14 forbids presenting synthetic content as real public fact. Renaming the tag does not weaken
 * that: the row is still labelled as not-real in both registers. Removing the tag would.
 */

export type FlagshipDisplayMode =
  /** What a reader sees. Preview rows are marked, in reader-facing words. */
  | "consumer"
  /** What a founder or reviewer sees. Internal vocabulary and per-row source counts. */
  | "internalReview";

/**
 * The mode the flagship pages render in.
 *
 * A module constant rather than an environment variable, matching `FLAGSHIP_DATA_MODE` and the FGP-007 decision to
 * keep page behaviour readable from the source rather than from a deployment's environment. Flipping this to
 * `"internalReview"` is a one-word edit for a review build.
 */
export const FLAGSHIP_DISPLAY_MODE: FlagshipDisplayMode = "consumer";

export type FlagshipProvenance = "productionFeed" | "synthetic/internal-review";

/** The short tag beside a row. Never blank — an unlabelled row is the failure mode this exists to prevent. */
export function provenanceTag(p: FlagshipProvenance, mode: FlagshipDisplayMode): string {
  if (p === "productionFeed") return "Published result";
  return mode === "internalReview" ? "Review row" : "Preview";
}

/** The sentence form, for prose and AI context. */
export function provenanceSentence(p: FlagshipProvenance, mode: FlagshipDisplayMode): string {
  if (p === "productionFeed") {
    return "This is a real published drawing from the production results feed.";
  }
  return mode === "internalReview"
    ? "This is an internal review row, not a published drawing — its numbers describe nothing outside this preview."
    : "This is preview data used for layout and tool testing. It is not a published drawing and describes nothing that happened.";
}

/**
 * How a count of preview rows is described.
 *
 * Returns `null` when there are none, so a caller renders nothing rather than "0 of these are preview rows",
 * which reads as a warning about a page that has none.
 */
export function previewCountNote(previewRows: number, mode: FlagshipDisplayMode): string | null {
  if (previewRows <= 0) return null;
  return mode === "internalReview"
    ? `${previewRows} of these are internal review rows.`
    : `${previewRows} of these are preview drawings used for layout and tool testing, not published results.`;
}
