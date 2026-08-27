/*
 * PER-STATE COMMERCE RESOLUTION — LRG-STATE-047 COM-01 … COM-04.
 *
 * Authority: `FD-X-11` as corrected ("absence of verified online or retail evidence must resolve to
 * `unknown`, `underReview` or `unavailable` — never automatically to `retailOnly`"), `FD-N-03`/`FD-N-10`
 * (`Buy Now` is the entry label and the resolver decides the outcome).
 *
 * ══ WHY EVERY NEW STATE IS UNKNOWN ══
 *
 * `FD-X-14` describes Michigan as the State that validates verified official online play, and California as
 * the State where `retailOnly` gets verified. Those are the VALIDATION PURPOSES of the rollout — they are
 * not findings, and this task must not read a stated purpose as evidence that the research has happened.
 *
 * The repository records exactly one researched capability: Florida's, and Florida is `underReview`. For
 * Michigan, Virginia, California and Maryland there is no operator page, no eligibility record and no
 * verification date anywhere in it. `FD-X-11` names that state precisely: `unknown` — "no evidence, or State
 * context unresolved", visible action `Where to Play`, and NO PROVIDER NAMED.
 *
 * Setting Michigan to `officialOnline` because a decision register lists it as the online-play validation
 * case would publish an unverified commercial claim about a jurisdiction. Setting California to `retailOnly`
 * is the exact inversion `FD-X-11` was written to correct.
 *
 * ══ WHY UNKNOWN IS AN ABSENT CAPABILITY, NOT A CAPABILITY RECORD ══
 *
 * `CapabilityStatus` is a closed union — `verified | underReview | unavailable | notApplicable` — and none
 * of them means "never researched". `underReview` asserts that evidence exists and is being checked, and
 * `unavailable` asserts as a fact that no purchase path exists. Both would be claims we have not earned.
 *
 * Widening the governed contract to carry a fifth status is not this task's call either: the Buy Now
 * capability contract owns option ordering and disclosure, and LRG-STATE-047 says existing governed
 * contracts keep what they own. So `unknown` is modelled as the ABSENCE of a capability record, which is
 * literally what it is, and the resolver is simply not consulted. `Buy Now` still exists as the entry label
 * (COM-01); it leads to an explanation instead of to options.
 */

import {
  FLORIDA_COMMERCE_CAPABILITY, FLORIDA_PURCHASE_OPTIONS,
  type GamePurchaseOption, type StateCommerceCapability,
} from "./buyNowCapability";
import { stateViewConfigFor } from "./stateViewConfigRegistry";

/**
 * What the page knows about buying tickets in one jurisdiction.
 *
 * Three cases, and they are genuinely different things — which is why they are three shapes rather than one
 * shape with a nullable field. A component that handles all three cannot accidentally treat "not researched"
 * as "not available".
 */
export type StateCommerceResolution =
  /** A researched capability record exists. The governed resolver decides the outcome. */
  | { kind: "researched"; capability: StateCommerceCapability; options: readonly GamePurchaseOption[] }
  /** A lottery State whose purchase paths have never been researched (`FD-X-11` `unknown`). */
  | { kind: "unknown"; stateName: string; readerNote: string }
  /** A State that runs no lottery. There is nothing to buy and nothing to explain. */
  | { kind: "notApplicable" };

/*
 * RESEARCHED CAPABILITY RECORDS, BY JURISDICTION.
 *
 * A table, not a branch. Florida is not a special case in the renderer; it is the one jurisdiction whose
 * purchase paths someone has actually researched. Researching Michigan adds a row here and changes no code.
 */
const RESEARCHED: Record<string, { capability: StateCommerceCapability; options: readonly GamePurchaseOption[] }> = {
  fl: { capability: FLORIDA_COMMERCE_CAPABILITY, options: FLORIDA_PURCHASE_OPTIONS },
};

const CACHE = new Map<string, StateCommerceResolution>();

function resolve(code: string): StateCommerceResolution {
  const researched = RESEARCHED[code];
  if (researched) return { kind: "researched", ...researched };
  const cfg = stateViewConfigFor(code);
  if (!cfg || cfg.state.lotteryProfile === "noLottery") return { kind: "notApplicable" };
  return {
    kind: "unknown",
    stateName: cfg.state.name,
    /*
     * Reader-facing, in ordinary player language, and it NAMES NO PROVIDER — `FD-X-11`'s unknown row is
     * explicit about that. It also does not say tickets are unavailable, because we do not know that.
     */
    readerNote:
      `We have not checked how ${cfg.state.name} lottery tickets can be bought, so we are not listing ways ` +
      "to play yet.",
  };
}

/** How commerce resolves for a jurisdiction. */
export function commerceResolutionFor(stateCode: string): StateCommerceResolution {
  const code = stateCode.toLowerCase();
  if (!CACHE.has(code)) CACHE.set(code, resolve(code));
  return CACHE.get(code)!;
}

/**
 * The reader-facing line for the Buy Now surface, whatever the resolution.
 *
 * One accessor so the three cases cannot drift apart in copy, and so no component reproduces the mapping.
 */
export function commerceReaderNoteFor(stateCode: string): string | null {
  const r = commerceResolutionFor(stateCode);
  if (r.kind === "researched") return r.capability.readerNote;
  if (r.kind === "unknown") return r.readerNote;
  return null;
}
