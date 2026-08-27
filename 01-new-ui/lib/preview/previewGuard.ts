/*
 * Home REVIEW AIDS — server-side only. The GATE is gone.
 *
 * ══ `isHomePreviewEnabled` WAS REMOVED — `FD-GATE-01`, ratified 2026-08-11 ══
 *
 * `LC_HOME_PREVIEW` decided WHICH TEMPLATE `/` served: the approved BP-02 composition when set, the legacy
 * `HomeTemplate` when not. `FD-GATE-01` ratified registry-only gating, so route existence is now
 * `HOME_REGISTRY.enabled` in `lib/registry/pageFamilyRegistry.ts` and the BP-02 composition is the only path.
 *
 * ══ WHAT REMAINS HERE, AND WHY IT IS NOT A GATE ══
 *
 * Two environment variables survive, and neither decides whether a page EXISTS:
 *
 *   `LC_HOME_PREVIEW_AD_MODE`   review geometry — `production` or `compact`. Every slot renders in both.
 *   `LC_HOME_PREVIEW_DEBUG`     whether internal provenance labels are DRAWN. Every protection stays on.
 *
 * `FD-GATE-01`'s rationale is about no per-environment switch deciding *what the site serves*. A reviewer's
 * choice of ad geometry, and whether internal labels are visible, change neither the route inventory nor the
 * content — so removing them would cost founder review capability and buy nothing. The distinction is the point:
 * a GATE was removed; the review aids were kept.
 *
 * No secret is read or exposed. No .env file is created or committed.
 */

/**
 * Advertising review mode (LRG-UI-011 §14) — `LC_HOME_PREVIEW_AD_MODE`.
 *
 *   production  exact current reserved geometry; the mode to verify production layout against.
 *   compact     the SAME slots, anchors and sequence positions, drawn at a reduced review height so
 *               a founder can read the page without scrolling past tall empty reservations.
 *
 * Default when unset: `compact`, because this variable only ever applies to the guarded founder
 * preview and the preview exists to be looked at.
 *
 * `hidden` IS DELIBERATELY NOT SUPPORTED. There is no mode that removes, collapses or conceals
 * inventory: CLAUDE.md §12 makes the 20 mapped Home slots a production constraint, and a "hide the
 * ads" switch is exactly how inventory silently disappears. Any unrecognised value — including
 * `hidden` — therefore falls back to `compact`, which still renders every slot.
 *
 * Compact geometry is a REVIEW AID and is never evidence of production geometry. Both modes carry
 * `data-ad-mode` plus the untouched production reservation heights on `data-reserved-*-h`, so an
 * audit can always read the real numbers out of the DOM.
 */
export type HomePreviewAdMode = "production" | "compact";

export function getHomePreviewAdMode(): HomePreviewAdMode {
  return process.env.LC_HOME_PREVIEW_AD_MODE === "production" ? "production" : "compact";
}

/**
 * FINAL-STATE vs DEBUG presentation (LRG-UI-013 §1) — `LC_HOME_PREVIEW_DEBUG`.
 *
 * Default OFF. With it off, the guarded Home presents as the intended completed launch: no "Soon",
 * no "Coming soon", no "Sample", no provenance chips, no sample-data strip, no slot counts, no
 * reservation notes.
 *
 * WHAT DEBUG DOES NOT CONTROL. Every non-visual protection stays on unconditionally:
 *   - the `LC_HOME_PREVIEW` server guard itself;
 *   - `robots: noindex, nofollow`;
 *   - `meta.previewMode` and every `data-*` provenance attribute;
 *   - `assertProvenanceLabels`, which still requires a label to EXIST on every synthetic or
 *     illustrative section. Debug only decides whether that label is DRAWN.
 *
 * Turning the visible labelling off is a deliberate trade for design fidelity in a local, guarded,
 * noindex view. It is recorded as a conflict against Constitution §26 in the founder-review record:
 * this page carries synthetic content and MUST NOT be served publicly in this state.
 */
export function isHomePreviewDebug(): boolean {
  return process.env.LC_HOME_PREVIEW_DEBUG === "true";
}

/**
 * Provenance assertion (spec: home-preview-view-model.md §8).
 *
 * Any section whose provenance is `synthetic` or `illustrative` MUST carry a visible label.
 * A missing label is a defect, not a cosmetic issue — it is the difference between "clearly
 * labelled preview content" and "invented lottery facts presented as real". We throw during
 * development so the omission is impossible to ship past.
 */
export function assertProvenanceLabels(
  sections: { id: string; provenance: string; provenanceLabel: string | null }[],
): void {
  const missing = sections
    .filter(
      (s) =>
        (s.provenance === "synthetic" || s.provenance === "illustrative") &&
        !s.provenanceLabel,
    )
    .map((s) => s.id);

  if (missing.length > 0) {
    throw new Error(
      `Home preview: sections missing a required provenance label: ${missing.join(", ")}. ` +
        `Synthetic and illustrative content must never render unlabelled.`,
    );
  }
}

/**
 * Freshness check for production-derived data.
 *
 * Founder decision (LRG-UI-008 §8): production-derived fixture dates are NOT rewritten. When they
 * are older than the freshness window we surface a visible stale state instead of quietly
 * refreshing them to look current.
 */
const STALE_AFTER_DAYS = 2;

export function isStale(isoDate: string | undefined, now: Date): boolean {
  if (!isoDate) return false;
  const then = Date.parse(isoDate);
  if (Number.isNaN(then)) return false;
  const days = (now.getTime() - then) / 86_400_000;
  return days > STALE_AFTER_DAYS;
}

/** Whole days elapsed, for the visible stale note. */
export function daysSince(isoDate: string | undefined, now: Date): number | null {
  if (!isoDate) return null;
  const then = Date.parse(isoDate);
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / 86_400_000);
}
