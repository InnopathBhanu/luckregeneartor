/*
 * Play-option preview (LRG-UI-010 direction 3, refined by LRG-UI-011 §10 and §11).
 *
 * HARD BOUNDARIES, all enforced here rather than left to the component:
 *  - NO raw affiliate URL is ever produced, stored or returned.
 *  - NO route is created. `/play/{game}` (BP-04 §4) and `/buynow/{code}` (legacy and current
 *    implementation) are both unresolved, so nothing navigates anywhere.
 *  - NO provider is named, ranked or recommended, and no destination is activated.
 *  - Availability is CONDITIONAL, never blanket: a game with no recorded option gets no CTA at all.
 *  - State is NEVER preselected from IP. Global Shell §6.5: when state context is unresolved the
 *    interface ASKS. Coarse IP may only suggest a state for confirmation and may never determine
 *    legal purchase eligibility, claim rules, tax guidance or provider availability.
 *  - Commerce disclosure is mandatory and travels with the action.
 */

/**
 * Action hierarchy (§10). The label is chosen by eligibility, never for visual symmetry.
 *
 *   play-online     eligibility is resolved for at least one method -> "Play Online", the slightly
 *                   stronger tonal action.
 *   see-options     eligibility is UNRESOLVED -> "See Play Options", a quieter tonal action. This is
 *                   the honest label when we cannot yet say what is available.
 *   none            the game has no recorded ticket option -> no transactional CTA whatsoever.
 */
export type PlayActionKind = "play-online" | "see-options" | "none";

/** How a ticket can be bought. Kept as METHOD TYPES, never as named providers. */
export type PlayMethod = "official-state" | "courier" | "retail";

export interface PlayMethodExplainer {
  method: PlayMethod;
  label: string;
  /** Friendly, explanatory — what this route to a ticket actually is. */
  body: string;
}

export interface PlayOptionSet {
  gameSlug: string;
  gameName: string;
  action: PlayActionKind;
  actionLabel: string;
  /** Short line that sits beside the action. */
  availabilityNote: string;
  /** The explanatory panel (§11). */
  panel: {
    stateConfirmationPrompt: string;
    stateConfirmationNote: string;
    methods: PlayMethodExplainer[];
    disclosure: string;
    /**
     * When eligibility was last checked. `null` means never — which is the truth here, and is shown
     * as such. CLAUDE.md §13 requires commerce to be suppressed when eligibility data is stale, so
     * this field must never be filled with a comforting placeholder date.
     */
    eligibilityLastCheckedDisplay: string | null;
    responsiblePlayNote: string;
    closeLabel: string;
  };
}

/*
 * Representative configuration only, and deliberately SHORT.
 *
 * Showing an online option for a game that has none would be a false availability claim. Games
 * absent from this table get no CTA — which is exactly the "secondary ineligible game" state the
 * founder asked to preserve.
 */
const ACTION_BY_GAME: Record<string, PlayActionKind> = {
  powerball: "play-online",
  "mega-millions": "see-options",
};

const DISCLOSURE =
  "Some ticket options are provided by third-party partners, and we may earn a commission. It never changes the results, numbers or information shown on LotteryCorner.";

const METHODS: PlayMethodExplainer[] = [
  {
    method: "official-state",
    label: "Official state lottery",
    body: "Some states sell tickets directly through their own lottery website or app. That is the state itself, not a partner.",
  },
  {
    method: "courier",
    label: "Courier service",
    body: "A courier buys a real ticket on your behalf in a state where you are allowed to play, and holds it for you. It is a separate company, not a lottery.",
  },
  {
    method: "retail",
    label: "In-store only",
    body: "In many states the only way to play is to buy a ticket in person from a licensed retailer.",
  },
];

/**
 * Returns the play options for a game, or null when the game has none recorded.
 *
 * `stateChosen` is accepted so a later task can narrow the methods once state context resolves. The
 * preview always passes false, so the copy stays honest about not knowing yet.
 */
export function playOptionsFor(
  gameSlug: string | undefined,
  gameName: string,
  stateChosen = false,
): PlayOptionSet | null {
  if (!gameSlug) return null;
  const action = ACTION_BY_GAME[gameSlug];
  if (!action || action === "none") return null;

  return {
    gameSlug,
    gameName,
    action,
    actionLabel: action === "play-online" ? "Play Online" : "See Play Options",
    availabilityNote: "Availability varies by state",
    panel: {
      stateConfirmationPrompt: stateChosen
        ? "Showing options for your selected state."
        : "Which state do you play in?",
      stateConfirmationNote:
        "We ask rather than guess. Your location is never used to decide what you are allowed to buy.",
      methods: METHODS,
      disclosure: DISCLOSURE,
      eligibilityLastCheckedDisplay: null,
      responsiblePlayNote:
        "Play for entertainment and set your own limits. 18+ only, and age limits vary by state.",
      closeLabel: "Close",
    },
  };
}
