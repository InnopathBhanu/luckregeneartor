/*
 * PER-STATE ADVERTISING PROFILE — LRG-STATE-047 ADS-01 … ADS-04.
 *
 * Authority: `APP-ST-01` … `APP-ST-06` (the approved Minimum Florida profile, 10 active / 14 deferred),
 * `FD-S-22`, CLAUDE.md §12 ("MUST NOT remove, merge, rename, move, reduce, reorder, or repurpose any slot
 * without explicit founder approval"; each page family requires its own production ad-inventory audit).
 *
 * ══ FLORIDA KEEPS ITS TEN, UNCHANGED ══
 *
 * `MINIMUM_FLORIDA_PROFILE` is returned verbatim for Florida and is not touched by this task. Its ten slot
 * keys, their anchors, their host sections and their reserved geometry are the approved baseline.
 *
 * ══ WHY THE OTHER FIVE STATES CARRY NO ACTIVE PLACEMENT ══
 *
 * ADS-02 is explicit: do not automatically copy Florida's inventory to another State, and where a State has
 * no approved profile, "use no live/active ad placement beyond an explicitly approved common placeholder
 * profile; report the gap; do not fill the page with Florida slots."
 *
 * There is no approved common placeholder profile. `state-ad-anchor-distribution-proposal.md` records the
 * Minimum Florida profile as approved and lists the per-State and no-lottery profiles as OPEN ad-operations
 * questions; `AD-S-DEC-19` (the reduced no-lottery ST-06 ad model) is ruled by `FD-S-22`/`FD-S-31` in
 * principle but no slot set has been ratified. The legacy no-lottery templates do render ten slots, which is
 * production evidence of placement — it is not a founder-approved profile for the new template, and
 * CLAUDE.md §12 requires approval before inventory decisions, not evidence alone.
 *
 * So the four new lottery States and Utah render NO advertisement in this guarded preview, and the missing
 * decision is reported. That is the conservative direction: a State showing no ad is a review finding, while
 * a State showing ten unapproved ads is an inventory change nobody authorised.
 *
 * ══ WHAT AN EMPTY PROFILE DOES NOT MEAN ══
 *
 * It is NOT a claim that these States have no inventory. It is the absence of an approved mapping. The ad
 * anchors AD-S00 … AD-S04 remain in the governed section sequence for every State; they simply resolve to no
 * placement, so no geometry is reserved and no layout shift is introduced.
 */

import { MINIMUM_FLORIDA_PROFILE, type StatePlacement } from "./stateAdBaseline";
import { stateViewConfigFor } from "./stateViewConfigRegistry";

export interface StateAdProfile {
  /** Stable identifier, rendered as `data-ad-profile` so a reviewer can see which profile was applied. */
  id: string;
  placements: readonly StatePlacement[];
  /** Set when the State has no approved profile — surfaced in the review document, never to a reader. */
  gap: string | null;
}

const FLORIDA_PROFILE: StateAdProfile = Object.freeze({
  id: "minimum-florida",
  placements: MINIMUM_FLORIDA_PROFILE,
  gap: null,
});

const NO_APPROVED_PROFILE = (name: string): StateAdProfile => Object.freeze({
  id: "none-pending-ad-ops",
  placements: [],
  gap:
    `No founder-approved advertising profile exists for ${name}. ADS-02 forbids copying Florida's approved ` +
    "inventory, and no common placeholder profile has been ratified, so this preview renders no placement. " +
    "Resolving this is an ad-operations decision, not an implementation change.",
});

const NO_LOTTERY_PROFILE = (name: string): StateAdProfile => Object.freeze({
  id: "none-no-lottery",
  placements: [],
  gap:
    `No approved no-lottery (ST-06) advertising profile exists for ${name}. Production renders ten slots on ` +
    "the legacy no-lottery templates, but AD-S-DEC-19 ratifies the reduced model only in principle and no " +
    "slot set is approved. ADS-03 requires the guarded preview to stay conservative and report the gap.",
});

/*
 * APPROVED PROFILES, BY JURISDICTION.
 *
 * A TABLE rather than `if (code === "fl")`. The distinction is not cosmetic: a branch says Florida is a
 * special case in the code, and a table says Florida is the one jurisdiction that currently has an approved
 * profile — which is a fact about ad operations, not about the renderer. Approving Michigan's inventory is
 * then one entry here.
 */
const APPROVED: Record<string, StateAdProfile> = {
  fl: FLORIDA_PROFILE,
};

const CACHE = new Map<string, StateAdProfile>();

/** The advertising profile for one jurisdiction's guarded preview. */
export function adProfileFor(stateCode: string): StateAdProfile {
  const code = stateCode.toLowerCase();
  const approved = APPROVED[code];
  if (approved) return approved;
  if (!CACHE.has(code)) {
    const cfg = stateViewConfigFor(code);
    const name = cfg?.state.name ?? code.toUpperCase();
    CACHE.set(
      code,
      cfg?.state.lotteryProfile === "noLottery" ? NO_LOTTERY_PROFILE(name) : NO_APPROVED_PROFILE(name),
    );
  }
  return CACHE.get(code)!;
}
