/*
 * Adaptive Priority resolver — the five PF-02 §12.1 overrides.
 *
 * Task LRG-STATE-021 §6. Authority: PF-02 §12.1; FD-S-04 (the render sequence must support the five
 * overrides; a typed State-specific resolver is sufficient); FD-S-17 (AI must never determine a
 * trigger); FD-S-21 (advertising may never precede a possible win, correction or safety state).
 *
 * DETERMINISTIC AND STATE-SPECIFIC. Triggers arrive as data. Nothing here inspects a model output,
 * calls a service, or guesses. With no trigger present the output is byte-for-byte `DEFAULT_ORDER`.
 *
 * WHAT AN OVERRIDE MAY DO. Move a governed section earlier. It may never invent a section, never
 * reorder ad anchors ahead of protected content, and never drop a section — a suppressed section stays
 * suppressed whatever the trigger.
 */

import { DEFAULT_ORDER, type StateSectionId } from "./sectionManifest";

/** PF-02 §12.1, in the blueprint's own priority order. */
export type OverrideTrigger =
  | "possibleWin"      // 1. possible winning match / claim-sensitive outcome
  | "correction"       // 2. material correction
  | "liveDraw"         // 3. live, pending or newly completed draw
  | "safety"           // 4. safety or responsible-play context
  | "sourceOutage";    // 5. source outage or stale purchase rule

/** Numeric precedence. Lower wins. Personalisation can never outrank 1, 2 or 4 (PF-02 §12.1). */
const PRECEDENCE: Record<OverrideTrigger, number> = {
  possibleWin: 1, correction: 2, liveDraw: 3, safety: 4, sourceOutage: 5,
};

/**
 * Which sections each trigger promotes, and how far.
 *
 * `promote` sections move to the front of the content sequence, keeping their relative order.
 * `suppressCommerceAndAds` records that no ad anchor may precede the promoted block.
 */
const EFFECTS: Record<OverrideTrigger, { promote: StateSectionId[]; suppressCommerceAndAds: boolean }> = {
  /* "Check Ticket result and Claim Guidance move ahead of AI, advertising and purchase." */
  possibleWin: { promote: ["S-05", "S-08"], suppressCommerceAndAds: true },
  /* "the correction notice and corrected current fact appear before all continuation modules." */
  correction: { promote: ["S-02"], suppressCommerceAndAds: true },
  /* "Live Draws moves beside or immediately after Latest Results." */
  liveDraw: { promote: ["S-02", "S-04"], suppressCommerceAndAds: false },
  /* "high-protection guidance moves ahead of commerce and promotional content." */
  safety: { promote: ["S-17"], suppressCommerceAndAds: true },
  /* "affected facts or commercial actions are suppressed rather than shown in their normal position." */
  sourceOutage: { promote: [], suppressCommerceAndAds: true },
};

export interface OverrideInput {
  trigger: OverrideTrigger;
  startedAt: string;
  expiresAt: string;
}

export interface ActiveOverride {
  trigger: OverrideTrigger;
  startedAt: string;
  expiresAt: string;
  /** Sections the override moved or suppressed — PF-02 §12.1 requires this to be recorded. */
  affects: StateSectionId[];
  /** True when no ad anchor may precede the promoted block. */
  adsDeferred: boolean;
}

export interface ResolvedOrder {
  order: StateSectionId[];
  activeOverride: ActiveOverride | null;
}

/** An override is live only inside its own window — expiry is enforced, not advisory. */
export function isWindowOpen(o: OverrideInput, now: Date): boolean {
  const start = Date.parse(o.startedAt);
  const end = Date.parse(o.expiresAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  const t = now.getTime();
  return t >= start && t <= end;
}

/**
 * Resolve the render order.
 *
 * With no open trigger the result is exactly `DEFAULT_ORDER`. With several, the lowest precedence wins
 * — a possible win always outranks a live draw, and nothing outranks it.
 */
export function resolveOrder(
  triggers: readonly OverrideInput[],
  now: Date = new Date(),
): ResolvedOrder {
  const open = triggers
    .filter((t) => isWindowOpen(t, now))
    .sort((a, b) => PRECEDENCE[a.trigger] - PRECEDENCE[b.trigger]);

  if (open.length === 0) {
    return { order: [...DEFAULT_ORDER], activeOverride: null };
  }

  const win = open[0];
  const effect = EFFECTS[win.trigger];
  const promote = effect.promote;

  /* Promote in the blueprint's stated order, then everything else in default order. Footer stays last:
     it is page chrome, not a continuation module. */
  const footer: StateSectionId[] = DEFAULT_ORDER.includes("Footer") ? ["Footer"] : [];
  const rest = DEFAULT_ORDER.filter((id) => !promote.includes(id) && id !== "Footer");
  const order: StateSectionId[] = [...promote, ...rest, ...footer];

  return {
    order,
    activeOverride: {
      trigger: win.trigger,
      startedAt: win.startedAt,
      expiresAt: win.expiresAt,
      affects: promote.length > 0 ? [...promote] : [],
      adsDeferred: effect.suppressCommerceAndAds,
    },
  };
}

/**
 * FD-S-21 / PF-02 §12.1 invariant: when an override defers advertising, no ad anchor may appear before
 * the last promoted section. Exported so both the resolver's own tests and the ad-baseline guard can
 * assert it against a real resolved order.
 */
export function assertNoAdBeforePromoted(order: readonly StateSectionId[], ov: ActiveOverride | null): void {
  if (!ov || !ov.adsDeferred || ov.affects.length === 0) return;
  const lastPromoted = Math.max(...ov.affects.map((id) => order.indexOf(id)));
  const firstAd = order.findIndex((id) => id.startsWith("AD-S"));
  if (firstAd !== -1 && firstAd < lastPromoted) {
    throw new Error(
      `Adaptive Priority: ad anchor ${order[firstAd]} precedes promoted section ${order[lastPromoted]} ` +
        `under trigger "${ov.trigger}". FD-S-21 forbids advertising ahead of a possible win, correction ` +
        `or safety state.`,
    );
  }
}
