/*
 * THE DETERMINISTIC TICKET COMPARISON — LRG-GAME-050.
 *
 * Authority: BP-04B §20 (*"Deterministic service understands straight, box, combo, Fireball/wild ball,
 * variant, rule era"*), the 2026-08-04 brief §3 (*"The comparison and prize logic must be deterministic and
 * rule-era aware. AI may explain an output but must not calculate it."*), Constitution (results before
 * recommendations; classify every claim).
 *
 * ══ THREE RULES THIS MODULE ENFORCES STRUCTURALLY ══
 *
 *   1. **No prize figure is computed.** Every amount returned is a string read from the era's payout table.
 *      This module decides WHETHER a ticket matched and WHICH row applies; it never does money arithmetic.
 *      A rounding bug therefore cannot invent a prize.
 *
 *   2. **The era comes from the DRAW date, not from today.** A ticket for a 2019 drawing is compared against
 *      the rules that applied in 2019 — including a play type that no longer exists. Passing "now" here would
 *      silently re-price historical tickets.
 *
 *   3. **A variant is never assumed.** The caller must name the member game id, because Midday and Evening are
 *      separate games with separate results, and comparing a Midday ticket against an Evening draw is the
 *      single most damaging mistake this feature could make.
 *
 * ══ WHAT IT REFUSES TO DO ══
 *
 * It does not validate a ticket. It compares numbers. `boundary` carries that limit on every outcome, so the
 * caller cannot render a match without it.
 */

import {
  activeAddOns, selectRuleEra, type AddOnRule, type GameRuleEra, type PayoutRow, type PlayTypeRule,
} from "./gameRuleContract";

/** The wildcard position marker for a Front Pair or Back Pair selection. */
export const ANY_DIGIT = null;

/** A player selection. `null` marks a position the play type does not use. */
export type SelectedDigits = readonly (number | null)[];

export interface TicketCheckInput {
  /** The member game the ticket was bought for. Midday and Evening are different games. */
  gameId: number;
  variantLabel: string;
  /** The drawing date being checked, ISO. Selects the rule era. */
  drawDateIso: string;
  digits: SelectedDigits;
  playTypeKey: string;
  wagerCents: number;
  fireballSelected: boolean;
}

export interface DrawnResult {
  gameId: number;
  drawDateIso: string;
  digits: readonly number[];
  /** The drawn FIREBALL number, when the drawing published one. */
  fireball: number | null;
}

export type CheckOutcomeKind =
  /** The ticket matches the drawing under its play type. */
  | "match"
  /** A valid comparison that did not match. */
  | "noMatch"
  /** The selection is not a legal ticket for this play type — nothing was compared. */
  | "invalidSelection"
  /** The rules for this drawing are not available, so no comparison may be published. */
  | "eraUnavailable";

export interface FireballFinding {
  /** One of the three combinations the FIREBALL number creates. */
  combination: readonly number[];
  /** Which drawn position the FIREBALL number replaced. */
  replacedPosition: number;
  matched: boolean;
}

export interface TicketCheckResult {
  kind: CheckOutcomeKind;
  /** The reader-facing statement. Plain language, no software vocabulary. */
  statement: string;
  /** The applicable payout row, when one applies. Prize strings are read, never computed. */
  payout: PayoutRow | null;
  prizeDisplay: string | null;
  oddsDisplay: string | null;
  /** For a Straight/Box match, which side of the split paid. */
  splitOutcome: "exactOrder" | "anyOrder" | null;
  /** FIREBALL analysis, present only when the ticket included FIREBALL and the drawing published one. */
  fireball: {
    drawnNumber: number;
    findings: readonly FireballFinding[];
    matchCount: number;
    /** The operator's published maximum for this play type, so a count can be sanity-checked, never inferred. */
    maxWins: number | null;
    prizeDisplay: string | null;
    statement: string;
  } | null;
  /** The era actually used. Rendered so a reader can see which rules were applied. */
  era: { eraId: string; effectiveFrom: string; effectiveTo: string | null; retired: boolean } | null;
  /** The one transactional boundary. Always present. */
  boundary: string;
}

const BOUNDARY =
  "This is a results comparison, not ticket validation. The Florida Lottery determines the final prize.";

/** The drawn add-on's own label for a date, or a neutral fallback. Never a hardcoded brand name. */
function addOnLabelOf(era: GameRuleEra, onDateIso: string): string {
  return activeAddOns(era, onDateIso)[0]?.label ?? "the add-on";
}

/* ------------------------------------------------------------------ digit shape */

/** How many distinct orderings a multiset of digits has. Used to pick the 3-way or 6-way row. */
export function orderingCount(digits: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const d of digits) counts.set(d, (counts.get(d) ?? 0) + 1);
  const distinct = counts.size;
  if (digits.length === 3) {
    if (distinct === 3) return 6;
    if (distinct === 2) return 3;
    return 1;
  }
  /* General fallback: n! / product(repeat!). Integer arithmetic only, so no float error. */
  const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
  let denom = 1;
  for (const c of counts.values()) denom *= fact(c);
  return fact(digits.length) / denom;
}

export type DigitShape = "allUnique" | "hasPair" | "allSame";

export function digitShapeOf(digits: readonly number[]): DigitShape {
  const distinct = new Set(digits).size;
  if (distinct === digits.length) return "allUnique";
  if (distinct === 1) return "allSame";
  return "hasPair";
}

/**
 * Whether a selection is a legal ticket for a play type.
 *
 * The interesting case is a triple such as `7-7-7`: it has exactly ONE ordering, so a Box play cannot be sold
 * on it — there is no "any other order" to cover. Returning a specific explanation rather than a generic
 * rejection is what lets the UI say something useful instead of just refusing.
 */
export function validateSelection(
  digits: SelectedDigits,
  playType: PlayTypeRule,
  /** Range comes from the FORMAT, not the era: how many values and from what pool is a format fact. */
  range: { min: number; max: number },
): { ok: true } | { ok: false; reason: string } {
  const used = playType.positions ?? digits.map((_, i) => i);
  for (let i = 0; i < digits.length; i++) {
    const v = digits[i];
    const isUsed = used.includes(i);
    if (isUsed) {
      if (v === null || !Number.isInteger(v)) {
        return { ok: false, reason: `Choose a digit for position ${i + 1}.` };
      }
      if (v < range.min || v > range.max) {
        return { ok: false, reason: `Digits must be between ${range.min} and ${range.max}.` };
      }
    }
  }
  if (playType.digitShape === "pairOnly") return { ok: true };

  const chosen = used.map((i) => digits[i] as number);
  const shape = digitShapeOf(chosen);

  if (shape === "allSame" && playType.key !== "straight") {
    return {
      ok: false,
      reason:
        `${chosen.join("-")} has only one possible order, so it can only be played Straight. ` +
        "Box, Straight/Box and Combo need at least two different digits.",
    };
  }
  if (playType.digitShape === "hasPair" && shape !== "hasPair") {
    return {
      ok: false,
      reason: `${playType.label} applies to a number with exactly two identical digits, such as ${playType.examplePattern}.`,
    };
  }
  if (playType.digitShape === "allUnique" && shape !== "allUnique") {
    return {
      ok: false,
      reason: `${playType.label} applies to a number with three different digits, such as ${playType.examplePattern}.`,
    };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ matching */

function sameMultiset(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  return [...a].sort().join(",") === [...b].sort().join(",");
}

function exactOrder(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Whether a selection matches a drawn set under one play type. Pure; no prize involved. */
function matchesPlayType(
  digits: SelectedDigits,
  drawn: readonly number[],
  playType: PlayTypeRule,
): { matched: boolean; split: "exactOrder" | "anyOrder" | null } {
  if (playType.positions) {
    const ok = playType.positions.every((p) => digits[p] === drawn[p]);
    return { matched: ok, split: null };
  }
  const chosen = digits.map((d) => d as number);

  switch (playType.key) {
    case "straight":
      return { matched: exactOrder(chosen, drawn), split: null };
    case "box-3way":
    case "box-6way":
      return { matched: sameMultiset(chosen, drawn), split: null };
    case "straight-box-3way":
    case "straight-box-6way":
      if (exactOrder(chosen, drawn)) return { matched: true, split: "exactOrder" };
      if (sameMultiset(chosen, drawn)) return { matched: true, split: "anyOrder" };
      return { matched: false, split: null };
    /* A combo buys every unique ordering as its own straight play, so ANY order of the selected digits is a
       straight win on one of the covered plays. */
    case "combo-3way":
    case "combo-6way":
      return { matched: sameMultiset(chosen, drawn), split: null };
    default:
      /* An unknown play type must not silently behave like a straight play. */
      return { matched: false, split: null };
  }
}

/* ------------------------------------------------------------------ statements */

function matchStatement(playType: PlayTypeRule, split: "exactOrder" | "anyOrder" | null): string {
  if (playType.positions) {
    return playType.key === "front-pair"
      ? "The first two digits match your Front Pair selection, in exact order."
      : "The last two digits match your Back Pair selection, in exact order.";
  }
  switch (playType.key) {
    case "straight":
      return "All three digits match in exact order.";
    case "box-3way":
    case "box-6way":
      return "All three digits match in a different order.";
    case "straight-box-3way":
    case "straight-box-6way":
      return split === "exactOrder"
        ? "All three digits match in exact order, which pays the straight side of your Straight/Box play."
        : "All three digits match in a different order, which pays the box side of your Straight/Box play.";
    case "combo-3way":
    case "combo-6way":
      return "Your Combo covers this order, so one of the straight plays on your ticket matches.";
    default:
      return "This selection matches the drawing.";
  }
}

/* ------------------------------------------------------------------ the check */

/**
 * Compare one ticket against one drawing.
 *
 * `eras` is passed in rather than imported so this module carries no jurisdiction dependency — the same
 * discipline the State builders follow, and what lets a second state reuse it unchanged.
 */
export function checkTicket(
  input: TicketCheckInput,
  drawn: DrawnResult | null,
  eras: readonly GameRuleEra[],
  gameKey: string,
  /** The format's main-group range. Defaults to a digit pool for the digit games this adapter serves. */
  range: { min: number; max: number } = { min: 0, max: 9 },
): TicketCheckResult {
  const base = {
    payout: null,
    prizeDisplay: null,
    oddsDisplay: null,
    splitOutcome: null,
    fireball: null,
    era: null,
    boundary: BOUNDARY,
  } as const;

  const era = selectRuleEra(eras, gameKey, input.drawDateIso);
  if (!era) {
    return {
      ...base,
      kind: "eraUnavailable",
      statement:
        `The rules that applied on ${input.drawDateIso} are not available, so this drawing cannot be compared here.`,
    };
  }
  const eraView = {
    eraId: era.eraId,
    effectiveFrom: era.effectiveFrom,
    effectiveTo: era.effectiveTo,
    retired: era.retired,
  };

  if (!drawn) {
    return {
      ...base,
      era: eraView,
      kind: "eraUnavailable",
      statement: `No published result exists for ${input.variantLabel} on ${input.drawDateIso}, so there is nothing to compare yet.`,
    };
  }
  /* The variant guard. A Midday ticket must never be compared against an Evening draw. */
  if (drawn.gameId !== input.gameId) {
    return {
      ...base,
      era: eraView,
      kind: "invalidSelection",
      statement: `That result belongs to a different drawing than the ${input.variantLabel} ticket being checked.`,
    };
  }

  const playType = era.playTypes.find((p) => p.key === input.playTypeKey);
  if (!playType) {
    return {
      ...base,
      era: eraView,
      kind: "invalidSelection",
      statement: `That play type was not offered for the ${input.drawDateIso} drawing.`,
    };
  }

  const valid = validateSelection(input.digits, playType, range);
  if (!valid.ok) {
    return { ...base, era: eraView, kind: "invalidSelection", statement: valid.reason };
  }

  const row = era.payouts.find(
    (p) => p.playTypeKey === playType.key && input.wagerCents in p.prizeByWagerCents,
  );
  if (!row) {
    const offered = era.payouts.find((p) => p.playTypeKey === playType.key);
    return {
      ...base,
      era: eraView,
      kind: "invalidSelection",
      statement: offered
        ? `${playType.label} is not sold at that play amount. Offered amounts: ` +
          `${Object.keys(offered.prizeByWagerCents).map((c) => era.wagers.find((w) => w.amountCents === Number(c))?.label ?? `${c}c`).join(", ")}.`
        : `No published prize applies to ${playType.label} for this drawing, so no amount can be shown.`,
    };
  }

  const { matched, split } = matchesPlayType(input.digits, drawn.digits, playType);
  const fireball = buildFireball(input, drawn, era, playType, matched);

  if (!matched) {
    return {
      ...base,
      era: eraView,
      fireball,
      oddsDisplay: row.oddsDisplay,
      kind: fireball && fireball.matchCount > 0 ? "match" : "noMatch",
      /* The add-on is named from the governed rule, never from a literal: a jurisdiction whose wild ball is
         called something else must not read "FIREBALL" here. */
      statement:
        fireball && fireball.matchCount > 0
          ? `Your digits do not match the drawn order, but ${addOnLabelOf(era, input.drawDateIso)} changes the comparison for this ticket.`
          : "This set does not match the selected drawing.",
    };
  }

  const prize = split && row.splitPrize?.[input.wagerCents]
    ? row.splitPrize[input.wagerCents][split]
    : row.prizeByWagerCents[input.wagerCents];

  return {
    kind: "match",
    statement: matchStatement(playType, split),
    payout: row,
    prizeDisplay: prize ?? null,
    oddsDisplay: row.oddsDisplay,
    splitOutcome: split,
    fireball,
    era: eraView,
    boundary: BOUNDARY,
  };
}

/**
 * The FIREBALL comparison.
 *
 * The mechanic is a replacement, not an extra ball: the drawn FIREBALL number substitutes for each of the
 * three drawn digits in turn, producing three candidate combinations. The ticket is then compared against
 * each one under its own play type. Duplicates are kept rather than de-duplicated, because the operator's
 * rules explicitly allow the created combinations to duplicate each other and each duplicate is a separate
 * win — and the published maximum win count is what bounds it, not our arithmetic.
 */
function buildFireball(
  input: TicketCheckInput,
  drawn: DrawnResult,
  era: GameRuleEra,
  playType: PlayTypeRule,
  baseMatched: boolean,
): TicketCheckResult["fireball"] {
  if (!input.fireballSelected) return null;

  const addOn: AddOnRule | undefined = activeAddOns(era, input.drawDateIso).find((a) => a.key === "fireball");
  if (!addOn) {
    return {
      drawnNumber: -1,
      findings: [],
      matchCount: 0,
      maxWins: null,
      prizeDisplay: null,
      statement: `That add-on was not offered for the ${input.drawDateIso} drawing, so it does not affect this ticket.`,
    };
  }
  if (drawn.fireball === null) {
    return {
      drawnNumber: -1,
      findings: [],
      matchCount: 0,
      maxWins: addOn.maxWinsByPlayType[playType.key] ?? null,
      prizeDisplay: null,
      statement: `This drawing does not have a published ${addOn.label} number, so the ${addOn.label} comparison is unavailable.`,
    };
  }

  const findings: FireballFinding[] = drawn.digits.map((_, position) => {
    const combination = drawn.digits.map((d, i) => (i === position ? (drawn.fireball as number) : d));
    return { combination, replacedPosition: position, matched: matchesPlayType(input.digits, combination, playType).matched };
  });

  const matchCount = findings.filter((f) => f.matched).length;
  const fbRow = addOn.payouts.find(
    (p) => p.playTypeKey === playType.key && input.wagerCents in p.prizeByWagerCents,
  );
  const maxWins = addOn.maxWinsByPlayType[playType.key] ?? null;

  const statement =
    matchCount === 0
      ? `${addOn.label} ${drawn.fireball} does not create a combination that matches this ticket.`
      : baseMatched
        ? `${addOn.label} ${drawn.fireball} adds ${matchCount === 1 ? `one ${addOn.label} win` : `${matchCount} ${addOn.label} wins`} on top of the base prize.`
        : `${addOn.label} changes the comparison for this ticket: ${matchCount === 1 ? `one ${addOn.label} combination matches` : `${matchCount} ${addOn.label} combinations match`}.`;

  return {
    drawnNumber: drawn.fireball,
    findings,
    matchCount,
    maxWins,
    prizeDisplay: matchCount > 0 ? (fbRow?.prizeByWagerCents[input.wagerCents] ?? null) : null,
    statement,
  };
}
