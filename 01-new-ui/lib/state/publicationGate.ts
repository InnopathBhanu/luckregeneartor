/*
 * Synthetic publication gate — the enforcement point for FD-S-01.
 *
 * Task LRG-STATE-021. Authority: FD-S-01 ("Any governed fact with synthetic or illustrative origin
 * must be prevented from rendering as public fact outside an explicitly labelled internal preview
 * environment. A visible 'synthetic' label on a production page is NOT an acceptable substitute.");
 * FD-S-02 (suppress with a recorded reason); CLAUDE.md §14; Constitution §12.
 *
 * THE GATE IS ENFORCEMENT, NOT ANNOTATION. `decide()` returns whether a governed fact may render at
 * all. There is no code path in which a `synthetic` origin renders publicly with a badge attached —
 * the badge is not an escape hatch, and this module offers none.
 *
 * WHY IT TAKES `previewEnabled` RATHER THAN READING THE FLAG. Passing the guard state in keeps this
 * module pure and directly testable, and keeps the single preview-enable decision at the route
 * boundary (`resolveStatePreview`).
 */

/** Where a value came from. The publication decision is driven entirely by this. */
export type Origin =
  | "productionDerived"
  | "copiedEditorial"
  | "configuration"
  | "synthetic"
  | "unavailable";

/** How far a governed fact has been verified. */
export type Availability = "verified" | "unverified" | "underReview" | "unavailable";

export type SuppressionReason =
  | "synthetic-not-publishable"
  | "unavailable-no-source"
  | "under-review"
  | "unverified-origin";

export interface PublicationDecision {
  /** May this value render at all? */
  publish: boolean;
  /** True only when it renders *because* the guarded internal preview is on. Requires a visible label
   *  IN ADDITION to the gate — never instead of it. */
  internalPreviewOnly: boolean;
  /** Present whenever `publish` is false. Sections record this as their `suppressionReason`. */
  reason?: SuppressionReason;
}

/**
 * The single decision function.
 *
 *   productionDerived / configuration / copiedEditorial + verified   -> publish
 *   synthetic                                                       -> publish ONLY in the guarded
 *                                                                      preview, flagged
 *                                                                      internalPreviewOnly
 *   unavailable                                                     -> never publish
 *   underReview / unverified                                        -> never publish as fact
 */
export function decide(
  origin: Origin,
  availability: Availability,
  previewEnabled: boolean,
): PublicationDecision {
  if (origin === "unavailable" || availability === "unavailable") {
    return { publish: false, internalPreviewOnly: false, reason: "unavailable-no-source" };
  }

  if (origin === "synthetic") {
    /* FD-S-01. Outside the guarded internal preview a synthetic governed fact does not render, with or
       without a label. */
    return previewEnabled
      ? { publish: true, internalPreviewOnly: true }
      : { publish: false, internalPreviewOnly: false, reason: "synthetic-not-publishable" };
  }

  if (availability === "underReview") {
    return { publish: false, internalPreviewOnly: false, reason: "under-review" };
  }
  if (availability === "unverified") {
    return { publish: false, internalPreviewOnly: false, reason: "unverified-origin" };
  }

  return { publish: true, internalPreviewOnly: false };
}

/**
 * Fixture-level `_meta.illustrative` recognition.
 *
 * Every `04-sample-data/state-*-sample.json` carries `_meta.illustrative: true` and, until this task,
 * NOTHING read it. A fixture that declares itself illustrative makes every governed fact sourced from
 * it `synthetic` unless the field is independently evidenced.
 *
 * This is the bridge between today's fixture-level marker and the approved per-field provenance model:
 * a field may carry its own `origin`, and only falls back to the fixture-level default when it does not.
 */
export function fixtureDefaultOrigin(meta: { illustrative?: boolean } | undefined): Origin {
  return meta?.illustrative ? "synthetic" : "unverified" as Origin;
}

/** A governed fact, carrying just enough provenance for the gate to decide. */
export interface GovernedFact<T> {
  value?: T;
  origin: Origin;
  availability: Availability;
  /** Human-readable source, or an official URL where one is evidenced. */
  source?: string;
  sourceUrl?: string;
  effectiveDate?: string;
  lastVerified?: string;
}

export interface GatedFact<T> {
  /** Present only when the gate permits publication. */
  value?: T;
  publish: boolean;
  internalPreviewOnly: boolean;
  reason?: SuppressionReason;
  source?: string;
  sourceUrl?: string;
  lastVerified?: string;
}

/** Apply the gate to one governed fact. The value is dropped, not merely hidden, when suppressed. */
export function gate<T>(fact: GovernedFact<T>, previewEnabled: boolean): GatedFact<T> {
  const d = decide(fact.origin, fact.availability, previewEnabled);
  return {
    ...(d.publish ? { value: fact.value } : {}),
    publish: d.publish,
    internalPreviewOnly: d.internalPreviewOnly,
    ...(d.reason ? { reason: d.reason } : {}),
    ...(fact.source ? { source: fact.source } : {}),
    ...(fact.sourceUrl ? { sourceUrl: fact.sourceUrl } : {}),
    ...(fact.lastVerified ? { lastVerified: fact.lastVerified } : {}),
  };
}

/**
 * The field classes FD-S-01 names explicitly. Used by the build-time assertion below so a future
 * change cannot quietly route one of them around the gate.
 */
export const GATED_FIELD_CLASSES = [
  "recentWinners",
  "unclaimedPrizes",
  "claimDeadlines",
  "claimThresholds",
  "taxRates",
  "taxStatus",
  "anonymityRules",
  "retailerLocations",
  "purchaseEligibility",
  "stateHighlights",
] as const;

export type GatedFieldClass = (typeof GATED_FIELD_CLASSES)[number];

/**
 * Build/render-time assertion: every field class FD-S-01 names must have passed through the gate.
 *
 * Throwing is deliberate. A governed fact reaching a public page unchecked is a publication incident,
 * not a cosmetic defect, so it must be impossible to ship past rather than merely logged.
 */
export function assertAllGatedClassesChecked(checked: readonly string[]): void {
  const missing = GATED_FIELD_CLASSES.filter((c) => !checked.includes(c));
  if (missing.length > 0) {
    throw new Error(
      `Synthetic publication gate: field classes were rendered without a gate decision: ${missing.join(
        ", ",
      )}. FD-S-01 requires every governed fact of these classes to be gated.`,
    );
  }
}
