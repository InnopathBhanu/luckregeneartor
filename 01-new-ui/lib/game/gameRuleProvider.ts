/*
 * THE JURISDICTION RULE-ERA PROVIDER — LRG-GAME-053.
 *
 * Authority: the 2026-08-04 correction direction (*"Remove the direct `FLORIDA_RULE_ERAS` import from the shared
 * Game Page model… California and future states can register their own rule-era modules without editing the page
 * model"*), `FD-X-01` (one State family — nothing generic branches on a state code), `CLAUDE.md` §10.
 *
 * ══ WHAT WAS WRONG ══
 *
 * `gameM2Model.ts` imported `FLORIDA_RULE_ERAS` and passed it to `selectRuleEra` for every jurisdiction. Two
 * consequences, one latent and one active:
 *
 *   - **Active:** a California game was matched against FLORIDA's rule-era list. It happened to miss, because the
 *     Florida keys are `pick-3` and California's are `ca-daily-3` — but the miss was luck, not design. A future
 *     jurisdiction that reused a Florida `gameKey` would have silently inherited Florida's payouts.
 *   - **Latent:** adding rules for a second state meant editing the shared page model, which is exactly the
 *     coupling the generic engine exists to remove.
 *
 * ══ THE SHAPE OF THE FIX ══
 *
 * This module is a registry and nothing else. It holds no rule data of its own: Florida's eras stay in
 * `floridaGameRules.ts` with their provenance. Registering a jurisdiction is one line here plus its own data
 * module, and the page model never changes.
 *
 * ══ AN UNREGISTERED JURISDICTION RETURNS AN EMPTY COLLECTION ══
 *
 * Not `undefined`, and never a fallback to another state's rules. An empty list means every rule-dependent
 * feature — the payout matrix, play types, wagers, the ticket checker — suppresses honestly, which is the
 * correct behaviour for a jurisdiction whose rules have not been researched.
 */

import type { GameRuleEra } from "./gameRuleContract";
import { FLORIDA_RULE_ERAS } from "./floridaGameRules";

/**
 * Registered rule-era modules, by jurisdiction code.
 *
 * California is deliberately ABSENT. Its rules were not researched, and inventing them — or borrowing
 * Florida's — would publish a false claim about what a California ticket pays. Absence is the honest state and
 * the page degrades to format-derived information.
 */
const RULE_ERAS: Record<string, readonly GameRuleEra[]> = {
  fl: FLORIDA_RULE_ERAS,
};

/** Every rule era registered for a jurisdiction. Empty for a jurisdiction whose rules are not researched. */
export function ruleErasFor(stateCode: string): readonly GameRuleEra[] {
  return RULE_ERAS[stateCode.toLowerCase()] ?? [];
}

/** Jurisdictions with registered rule data. Reported by the implementation record, never inferred. */
export function jurisdictionsWithRuleEras(): string[] {
  return Object.keys(RULE_ERAS);
}

/** Whether a jurisdiction has any registered rules at all. Drives honest suppression, not a guess. */
export function hasRuleEras(stateCode: string): boolean {
  return ruleErasFor(stateCode).length > 0;
}
