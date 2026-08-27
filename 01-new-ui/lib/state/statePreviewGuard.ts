/*
 * State preview guard — SERVER-SIDE ONLY.
 *
 * Task LRG-STATE-021. Authority: FD-S-36 (guarded Florida anonymous preview only), DS-22, DS-25.
 *
 * WHY NOT `NEXT_PUBLIC_LC_STATE_PREVIEW`.
 * The task offered either a `NEXT_PUBLIC_` name or "the repository's established equivalent". The
 * established equivalent is `LC_HOME_PREVIEW` — read from `process.env` WITHOUT a `NEXT_PUBLIC_`
 * prefix, so the value is never inlined into the client bundle and cannot be flipped from a browser.
 * A guard that a visitor can enable is not a guard, so the State preview follows the same posture:
 *
 *   cd 01-new-ui && LC_STATE_PREVIEW=true npm run dev
 *
 * ONE FLAG. There is exactly one State preview flag. No second overlapping switch is introduced.
 *
 * INERT BY DEFAULT. With the flag absent or set to anything other than the literal string "true",
 * every state route keeps its existing behaviour (`StatePageTemplate`) — see app/[state]/page.tsx.
 *
 * No secret is read or exposed. No .env file is created or committed.
 */

/*
 * ══ `isStatePreviewEnabled` AND `resolveStatePreview` WERE REMOVED — `FD-GATE-01`, 2026-08-11 ══
 *
 * `resolveStatePreview` ANDed `LC_STATE_PREVIEW=true` with the jurisdiction registry's own `previewEnabled`. With
 * the flag unset — the default — every State including Florida fell through to the legacy `StatePageTemplate`.
 * `FD-GATE-01` removed the environment half: the registry's `previewEnabled` is now the whole decision, asked
 * through `servesPage("state", code)` in `lib/registry/pageFamilyRegistry.ts`.
 *
 * The jurisdiction registry import went with it — this module no longer answers "does this page exist?" at all.
 * What is left below is review aids and one temporary proof marker, none of which gates a route.
 */

/**
 * Ad review mode, mirroring the Home preview's `production` / `compact` split (DS-23).
 *
 * `production` renders each slot's exact reserved geometry — the mode production layout is verified
 * in. `compact` draws the same slots, in the same anchors, at a reduced review height so a founder can
 * read the page without scrolling past tall empty reservations.
 *
 * There is deliberately NO mode that removes, collapses or hides inventory: CLAUDE.md §12 makes the
 * production slot map a constraint, and a "hide the ads" switch is exactly how inventory silently
 * disappears. Any unrecognised value falls back to `compact`, which still renders every slot.
 */
/* ------------------------------------------------------------------ runtime proof marker */

/**
 * RUNTIME PROOF MARKER — LRG-STATE-035 §5. TEMPORARY PREVIEW EVIDENCE, NOT PRODUCTION COPY.
 *
 * WHY THIS EXISTS. Two founder reviews in a row reported that implemented features were not visible. In both
 * cases the source was correct and the served page was not, and there was no way to tell from the page which
 * code produced it. A marker that names the renderer AND the commit makes that question answerable in one
 * glance instead of a diagnosis session.
 *
 * WHY A CONSTANT RATHER THAN A GIT LOOKUP. Reading the sha at render time would mean running `git` from a
 * server component, which is a build-time dependency on the checkout being a git repo — fragile, and wrong in
 * any deployed environment. A constant is honest as long as it cannot silently go stale, so
 * `tests/state-preview.test.ts` asserts it matches the actual `HEAD` and fails the suite when it drifts.
 *
 * REMOVE THIS before the State page family is considered production-ready.
 */
export const STATE_EXPERIENCE_ID = "engagement-v1";
export const STATE_RENDERER_ID = "engagement-landing";
/** The commit this preview experience was stamped at. Guarded by a test against real `HEAD`. */
export const STATE_PREVIEW_COMMIT = "a4de013";

export type StatePreviewAdMode = "production" | "compact";

export function getStatePreviewAdMode(): StatePreviewAdMode {
  return process.env.LC_STATE_PREVIEW_AD_MODE === "production" ? "production" : "compact";
}

/**
 * Adaptive Priority SIMULATION — `LC_STATE_PREVIEW_OVERRIDE`.
 *
 * Task LRG-STATE-021 §6 requires "fixture-controlled simulation states" so a founder can see each of the
 * five PF-02 §12.1 overrides without a real event occurring.
 *
 *   LC_STATE_PREVIEW_OVERRIDE=correction LC_STATE_PREVIEW=true npm run dev
 *
 * Accepted: possibleWin · correction · liveDraw · safety · sourceOutage. Anything else yields no
 * override, so a typo produces the default PF-02 order rather than a surprise.
 *
 * This SIMULATES a trigger; it does not invent a real possible win, and no AI determines it (FD-S-17).
 * The window is opened around the current time purely so the simulated override is live while a reviewer
 * looks at the page.
 */
const SIMULATABLE = ["possibleWin", "correction", "liveDraw", "safety", "sourceOutage"] as const;
export type SimulatedTrigger = (typeof SIMULATABLE)[number];

export function getSimulatedOverride(
  now: Date = new Date(),
): { trigger: SimulatedTrigger; startedAt: string; expiresAt: string }[] {
  const raw = process.env.LC_STATE_PREVIEW_OVERRIDE;
  const trigger = SIMULATABLE.find((t) => t === raw);
  if (!trigger) return [];
  return [
    {
      trigger,
      startedAt: new Date(now.getTime() - 60_000).toISOString(),
      expiresAt: new Date(now.getTime() + 3_600_000).toISOString(),
    },
  ];
}

/**
 * DIAGNOSTIC mode — `LC_STATE_PREVIEW_DEBUG`.
 *
 * LRG-STATE-022 finding: the first implementation rendered a visible "Sections suppressed in this
 * preview" block listing internal suppression reasons. That is internal diagnostic output, not page
 * content, and PF-02 §12 requires an absent module to collapse rather than leave a shell. Suppression
 * reasons remain in the resolved model and in `data-*` attributes for audit; they are only DRAWN when
 * this flag is explicitly on.
 *
 *   LC_STATE_PREVIEW=true LC_STATE_PREVIEW_DEBUG=true npm run dev
 */
export function isStatePreviewDebug(): boolean {
  return process.env.LC_STATE_PREVIEW_DEBUG === "true";
}
