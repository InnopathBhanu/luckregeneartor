/*
 * VIEWPORT ELIGIBILITY FOR AD REQUESTS — LRG-ADS-CANARY-003A defect 1.
 *
 * ══ WHAT WAS WRONG ══
 *
 * `StatePreviewAdSlot` handed `AdReservation` a canary configuration unconditionally, so `GamSlot` mounted for
 * every approved placement at every viewport. `sp_top_billboard` is governed `viewports: ["desktop"]` and is
 * EAGER, so below 992px it defined a slot, called `display()`, and called `refresh()` — an ad request for a
 * placement the reader could not see, because its only protection was a CSS rule on an ancestor.
 *
 * **CSS visibility is not request eligibility.** `display: none` hides pixels; it does not stop `defineSlot`,
 * it does not stop `refresh`, and it does not stop the impression that follows. The governed
 * `viewports` / `visibility` fields are the contract, and until now nothing read them on the request path.
 *
 * ══ THE ONE BREAKPOINT ══
 *
 * 992px, the same value every legacy `sizeMapping()` builder uses and the one `CLAUDE.md` §12 records as
 * deliberately different from Tailwind's `lg` (1024). It is imported from `gamConfig`, not restated, so the
 * request gate and the size mapping can never disagree about where the tiers divide.
 *
 * ══ WHY `matchMedia` AND NOT `innerWidth` ══
 *
 * `innerWidth` has to be polled or read on a resize event, and every read is a chance to read it during
 * server rendering or the first hydration pass — which would make the first client render differ from the
 * server HTML. `matchMedia` gives a subscription and, more importantly, this module never answers the
 * question at all until after mount: `useViewportTier` returns `null` on the server AND on the first client
 * render, so the initial paint is identical either way. Only the second render, driven by an effect, knows
 * the tier. `null` means "not yet known", and nothing registers or requests while it is null.
 */

import { GAM_DESKTOP_MIN_WIDTH } from "./gamConfig";

/** The two tiers the governed 992px breakpoint divides the world into. */
export type ViewportTier = "mobile" | "desktop";

/** The media query that defines the desktop tier. One string, derived from the one constant. */
export const DESKTOP_MEDIA_QUERY = `(min-width: ${GAM_DESKTOP_MIN_WIDTH}px)`;

/**
 * Which tiers a placement may be requested in.
 *
 * Both families are normalised onto this shape so one gate serves Home, State, rails, device pairs and any
 * future placement — defect 1 is explicit that `sp_top_billboard` must not be special-cased.
 *
 *   State  `viewports: ["desktop"]`         -> { desktop: true,  mobile: false }
 *   Home   `visibility: "gte-992"`          -> { desktop: true,  mobile: false }
 *   Home   `visibility: "lt-992"`           -> { desktop: false, mobile: true  }
 *   either `all` / `["mobile","desktop"]`   -> { desktop: true,  mobile: true  }
 */
export interface ViewportEligibility {
  desktop: boolean;
  mobile: boolean;
}

/** Eligible at both tiers — the default for a responsive placement. */
export const BOTH_TIERS: ViewportEligibility = Object.freeze({ desktop: true, mobile: true });

/**
 * Normalise a Home anchor group's `visibility` into the shared shape.
 *
 * An unrecognised value resolves to NEITHER tier rather than both: a visibility rule this module does not
 * understand is a reason to withhold an ad request, not to make one at every size.
 */
export function eligibilityFromHomeVisibility(visibility: string): ViewportEligibility {
  switch (visibility) {
    case "all": return { desktop: true, mobile: true };
    case "gte-992": return { desktop: true, mobile: false };
    case "lt-992": return { desktop: false, mobile: true };
    default: return { desktop: false, mobile: false };
  }
}

/** Normalise a State placement's `viewports` list into the shared shape. */
export function eligibilityFromStateViewports(viewports: readonly string[]): ViewportEligibility {
  return {
    desktop: viewports.includes("desktop"),
    mobile: viewports.includes("mobile"),
  };
}

/**
 * Whether a placement may be registered and requested at this tier.
 *
 * `null` — the tier is not yet known, which is every server render and every first client render — is always
 * ineligible. That is what keeps the initial markup identical on both sides and keeps a request from being
 * made before the browser has told us how wide it is.
 */
export function isEligibleAtTier(
  eligibility: ViewportEligibility,
  tier: ViewportTier | null,
): boolean {
  if (tier === null) return false;
  return tier === "desktop" ? eligibility.desktop : eligibility.mobile;
}

/** The tier for a given width. Exported for tests; the runtime uses `matchMedia`, never a width. */
export function tierForWidth(width: number): ViewportTier {
  return width >= GAM_DESKTOP_MIN_WIDTH ? "desktop" : "mobile";
}
