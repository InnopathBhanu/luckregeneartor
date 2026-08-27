/*
 * Buy Now capability contract — GENERIC, DETERMINISTIC, DATA-ONLY.
 *
 * Task LRG-STATE-029. Authority: `FD-N-03` (Buy Now is the primary State-page commerce CTA; approved
 * placements and prohibited contexts), `FD-N-10` (Buy Now is an entry into a LotteryCorner first-party
 * purchase-options resolver; fixed option ordering; conspicuous adjacent disclosure before action),
 * `FD-X-11` as retained in part (eligibility ladder; absence of evidence resolves to
 * `unknown`/`underReview`/`unavailable`, NEVER to `retailOnly`), `CLAUDE.md` §13 (state-aware deterministic
 * eligibility; coarse IP may only SUGGEST a state; no raw affiliate URL anywhere).
 *
 * WHAT THIS IS. Types plus a deterministic resolver over governed data. **No UI, no route, no partner
 * integration, no network call.** `/play/{game}` versus `/buynow/{code}` is deliberately NOT resolved here
 * (`FD-N-10`, `FD-S-32`, `OPEN-ST-05`).
 *
 * THE CENTRAL SAFETY PROPERTY. `Buy Now` is an *entry point*, not a claim. It does not assert that
 * LotteryCorner sells the ticket, that online purchase exists, that the user is eligible, or that any
 * provider is recommended. The resolver — not the label — decides what is actually offered, and it is
 * happy to conclude "we do not know".
 */

/* ------------------------------------------------------------------ state level */

export type CapabilityStatus = "verified" | "underReview" | "unavailable" | "notApplicable";

/** Jurisdiction-level commerce capability. One record per jurisdiction. */
export interface StateCommerceCapability {
  jurisdiction: string;
  status: CapabilityStatus;
  officialOperator: string;
  /** Published minimum age, as a string because operators publish it as text. */
  minimumAge?: string;
  /** Whether a purchase requires the buyer to be physically within the jurisdiction. */
  physicalLocationRequired?: boolean;
  /** Whether a provider enforces device geolocation. */
  geolocationRequired?: boolean;
  source: string;
  lastVerified: string;
  /** When this record must be re-verified. Past this date the resolver treats it as stale. */
  reviewBy: string;
  /**
   * INTERNAL evidence rationale — why the status is what it is. Written for a reviewer, so it may cite
   * decision ids and status vocabulary. **Never rendered to a reader.**
   */
  note: string;
  /**
   * READER-FACING explanation of the same fact, in ordinary player language.
   *
   * LRG-STATE-030 DEFECT FIX. `note` alone previously fed both, so the Buy Now surface rendered
   * "This resolves to underReview, never retailOnly (FD-N-10)" to the reader — internal status
   * vocabulary and a decision id in public UI, which CLAUDE.md §7 forbids. The two audiences now have
   * two fields, so neither can leak into the other by omission.
   */
  readerNote: string;
}

/* ------------------------------------------------------------------ game level */

/**
 * Option types, in the fixed `FD-N-10` precedence order. The numeric rank is the sort key, so ordering is
 * data, not a UI decision: official options can never be reordered below compensated ones by styling.
 */
export const OPTION_TYPE_RANK = {
  officialWeb: 1,
  officialApp: 2,
  officialSubscription: 3,
  approvedCourier: 4,
  approvedAffiliate: 5,
  retailer: 6,
} as const;

export type OptionType = keyof typeof OPTION_TYPE_RANK;

/** Is this option compensated? Compensated options require adjacent disclosure before action. */
export function isCompensated(t: OptionType): boolean {
  return t === "approvedCourier" || t === "approvedAffiliate";
}

export type OptionLifecycle = "active" | "deferred" | "expired";

export interface GamePurchaseOption {
  /** Game this option applies to. Options are per GAME, not per state — Georgia sells Cash 3 online but
   *  not Georgia Five, so a state-level flag cannot express reality. */
  gameId: number;
  gameKey: string;
  optionType: OptionType;
  /** Who fulfils the purchase. */
  providerIdentity: string;
  /** `official` = the state operator or its own app. `compensated` = we may be paid. */
  providerRelationship: "official" | "compensated";
  eligibleJurisdiction: string;
  /** Cutoff rule as published, never computed by us. */
  cutoffNote?: string;
  /** Fees or other material differences a buyer should know BEFORE acting. */
  materialDifferences?: string;
  /** Who holds the ticket after purchase — a genuine material difference for couriers. */
  ticketCustody?: "player" | "provider" | "operatorAccount";
  /** How a prize is paid out through this option. */
  prizeHandling?: string;
  /**
   * Disclosure text. **Mandatory for any compensated option** — the gate rejects a compensated option
   * without it, because disclosure must be adjacent and precede the action.
   */
  disclosure?: string;
  source: string;
  lastVerified: string;
  reviewBy: string;
  lifecycle: OptionLifecycle;
  /**
   * Deliberately NOT part of this contract: the partner destination URL. `CLAUDE.md` §13 forbids a raw
   * affiliate URL in UI, metadata, schema, fixtures, sitemaps, logs or AI output. Destinations live behind
   * the first-party resolver route, which this task does not implement.
   */
}

/* ------------------------------------------------------------------ resolver */

export type ResolverOutcomeKind =
  | "eligibleOptions"
  | "clarificationRequired"
  | "underReview"
  | "unavailable"
  | "suppressedBySafetyContext"
  | "suppressedByStaleEvidence";

/**
 * The safety contexts in which `Buy Now` must not be the offered action (`FD-N-03`).
 * `postLossDominant` is the loss-sensitive case: after a confirmed losing result, Buy Now must not dominate.
 */
export type SafetyContext =
  | "possibleWin"
  | "correction"
  | "claimGuidance"
  | "responsiblePlay"
  | "postLossDominant"
  | "promotionPaused";

export interface ResolverInput {
  capability: StateCommerceCapability;
  options: readonly GamePurchaseOption[];
  /** Game the user is acting on, when known. */
  gameKey?: string;
  /** Resolved per `CLAUDE.md` §13 precedence. Coarse IP may only SUGGEST — never satisfy this. */
  jurisdictionConfirmed: boolean;
  ageConfirmed: boolean;
  physicalLocationConfirmed: boolean;
  /** Any open safety context. Non-empty always suppresses. */
  safetyContexts: readonly SafetyContext[];
  /** Today, for staleness evaluation. */
  todayIso: string;
}

export interface ResolverOutcome {
  kind: ResolverOutcomeKind;
  /** Ordered per `OPTION_TYPE_RANK`; official always before compensated. */
  options: GamePurchaseOption[];
  /** What the user must confirm, for `clarificationRequired`. */
  missing: string[];
  /** Plain explanation. Must never imply LotteryCorner sells the ticket. */
  explanation: string;
  /** Supporting link label, when the outcome is not transactional. */
  supportingAction?: "Where to Play" | "Find a Retailer";
  /** True when at least one rendered option needs adjacent disclosure. */
  requiresDisclosure: boolean;
}

/**
 * Deterministic resolution. Order of checks is deliberate: **safety first, then staleness, then
 * capability, then eligibility, then options.**
 *
 * Safety precedes everything because a suppression must not be defeated by having good data, and staleness
 * precedes capability because stale evidence is not evidence.
 */
export function resolveBuyNow(input: ResolverInput): ResolverOutcome {
  const base = { options: [] as GamePurchaseOption[], missing: [] as string[], requiresDisclosure: false };

  /* 1. Safety context suppresses unconditionally (`FD-N-03`). */
  if (input.safetyContexts.length > 0) {
    return {
      ...base,
      kind: "suppressedBySafetyContext",
      explanation:
        "Purchase options are not shown here. This part of the page is for checking a result, a " +
        "correction, claiming a prize or responsible-play information.",
    };
  }

  /* 2. Stale jurisdiction evidence is not evidence. */
  if (input.capability.reviewBy < input.todayIso) {
    return {
      ...base,
      kind: "suppressedByStaleEvidence",
      explanation:
        `Purchase information for ${input.capability.jurisdiction} needs re-checking before we show it. ` +
        `It was last verified on ${input.capability.lastVerified}.`,
      supportingAction: "Where to Play",
    };
  }

  /* 3. Jurisdiction-level capability. */
  if (input.capability.status === "notApplicable" || input.capability.status === "unavailable") {
    return {
      ...base,
      kind: "unavailable",
      explanation: input.capability.readerNote,
    };
  }
  if (input.capability.status === "underReview") {
    return {
      ...base,
      kind: "underReview",
      explanation: input.capability.readerNote,
      supportingAction: "Where to Play",
    };
  }

  /* 4. Eligibility inputs we do not have. Ask rather than assume (`CLAUDE.md` §13). */
  const missing: string[] = [];
  if (!input.jurisdictionConfirmed) missing.push("your state");
  if (input.capability.minimumAge && !input.ageConfirmed) missing.push("your age");
  if (input.capability.physicalLocationRequired && !input.physicalLocationConfirmed) {
    missing.push("that you are in the state");
  }
  if (missing.length > 0) {
    return {
      ...base,
      kind: "clarificationRequired",
      missing,
      explanation: `To show the right options we need to confirm ${missing.join(", ")}.`,
      supportingAction: "Where to Play",
    };
  }

  /* 5. Active options for this game, in fixed order. */
  const active = input.options
    .filter((o) => o.lifecycle === "active")
    .filter((o) => o.reviewBy >= input.todayIso)
    .filter((o) => (input.gameKey ? o.gameKey === input.gameKey : true))
    .filter((o) => o.eligibleJurisdiction === input.capability.jurisdiction)
    .sort((a, b) => OPTION_TYPE_RANK[a.optionType] - OPTION_TYPE_RANK[b.optionType]);

  if (active.length === 0) {
    return {
      ...base,
      kind: "underReview",
      explanation:
        `We have no verified purchase option recorded for this game in ${input.capability.jurisdiction}.`,
      supportingAction: "Where to Play",
    };
  }

  return {
    kind: "eligibleOptions",
    options: active,
    missing: [],
    explanation:
      "LotteryCorner does not sell tickets. These are the ways to play, official options first.",
    requiresDisclosure: active.some((o) => isCompensated(o.optionType)),
  };
}

/* ------------------------------------------------------------------ gate */

export interface CapabilityFinding {
  scope: string;
  reason: string;
}

/**
 * The publication gate for commerce data. Returns findings that must block a public commerce render.
 *
 * The most important rule is the last one: a **compensated option without disclosure can never publish**.
 */
export function capabilityPublicationFindings(
  capability: StateCommerceCapability,
  options: readonly GamePurchaseOption[],
  todayIso: string,
): CapabilityFinding[] {
  const out: CapabilityFinding[] = [];
  const add = (scope: string, reason: string) => out.push({ scope, reason });

  if (capability.status === "verified") {
    if (!capability.source) add(capability.jurisdiction, "verified capability with no source");
    if (capability.reviewBy < todayIso) {
      add(capability.jurisdiction, `capability evidence expired on ${capability.reviewBy}`);
    }
  }

  for (const o of options) {
    const scope = `${o.gameKey}:${o.optionType}`;
    if (o.lifecycle === "active") {
      if (!o.source) add(scope, "active option with no source");
      if (o.reviewBy < todayIso) add(scope, `option evidence expired on ${o.reviewBy}`);
      /* The rule that protects the user: no compensated option without adjacent disclosure. */
      if (isCompensated(o.optionType) && !o.disclosure) {
        add(scope, "compensated option has no adjacent disclosure text");
      }
      if (isCompensated(o.optionType) && o.providerRelationship !== "compensated") {
        add(scope, "compensated option type is not marked as a compensated relationship");
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ Florida instance */

/**
 * Florida — **`underReview`**, per `FD-N-10`.
 *
 * The operator's official "Where to Play" destination is a retailer locator, and retail play, QuickTicket
 * and digital playslips are documented. That describes a retail-first picture; it is **not** the positive
 * proof `retailOnly` requires. Texas is the reference case for `retailOnly` — its operator explicitly
 * publishes that there are no internet, mail or phone sales. Florida publishes no such statement that we
 * have verified, so we say we do not know.
 */
export const FLORIDA_COMMERCE_CAPABILITY: StateCommerceCapability = {
  jurisdiction: "fl",
  status: "underReview",
  officialOperator: "Florida Lottery",
  minimumAge: "18",
  physicalLocationRequired: undefined,
  geolocationRequired: undefined,
  source:
    "https://floridalottery.com/games/draw-games (accessed 2026-07-28) — \"Must be 18 or older to play.\"; " +
    "official link labels Search Winning Numbers / Where to Play / How to Claim / Play Responsibly. " +
    "https://floridalottery.com/howtoclaim (accessed 2026-07-28) confirms the /where-to-play path.",
  lastVerified: "2026-07-28",
  reviewBy: "2026-10-28",
  note:
    "Florida's full purchase picture is not verified. The official Where to Play destination is a retailer " +
    "locator, which is evidence about that destination — not proof that no other purchase path exists. " +
    "This resolves to underReview, never retailOnly (FD-N-10).",
  readerNote:
    "We are still checking how tickets can be bought in Florida, so we are not listing ways to play yet. " +
    "The Florida Lottery's own retailer finder is below.",
};

/**
 * No Florida purchase options are recorded, deliberately.
 *
 * An empty list is the honest state: we have verified no specific option. The resolver therefore returns
 * `underReview` with a `Where to Play` supporting action, and `Buy Now` remains the visible CTA (`FD-N-03`)
 * that leads to that explanation.
 */
export const FLORIDA_PURCHASE_OPTIONS: readonly GamePurchaseOption[] = [];
