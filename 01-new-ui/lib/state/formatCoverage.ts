/*
 * Result-format coverage verification for the guarded State preview.
 *
 * Task LRG-STATE-021 §3. Authority: FD-S-10 ("Florida preview must support all games displayed in the
 * Florida preview. Cross-State rollout must not enable a game whose format is unverified."); FD-S-09
 * (closed status union); CLAUDE.md §14 (never hardcode a ball count; incomplete coverage is not a
 * licence to hardcode).
 *
 * OUTCOME FOR FLORIDA. All seven Florida games rendered by this preview already have a definition in
 * `04-sample-data/result-format-definitions.json`. **No format definition needed adding.** This module
 * therefore *verifies* coverage rather than authoring it, and refuses to render a game whose format
 * cannot be verified — with a recorded reason, never an invented format.
 */

import { getResultFormat } from "../data-provider";
import type { ResultCard, ResultFormatDefinition } from "../data-provider/types";
import type { StateGameEntry } from "./floridaContentManifest";

/** FD-S-09: the closed, exhaustive result-status union. No `| string` widening. */
export const RESULT_STATUSES = [
  "verified", "pending", "awaiting", "delayed", "cancelled", "corrected", "closed", "unavailable",
] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

/**
 * Narrow a fixture status string into the closed union.
 *
 * The fixture type is `"latest" | "awaiting" | "closed" | string`. `latest` maps to `verified`: the
 * fixture's "latest" means "this is the current confirmed draw". Anything unrecognised becomes
 * `unavailable` rather than silently falling through to a "next draw" branch, which is the defect the
 * widened union allowed.
 */
export function narrowStatus(raw: string | undefined): ResultStatus {
  switch (raw) {
    case "latest":
    case "verified":
      return "verified";
    case "pending":
    case "awaiting":
    case "delayed":
    case "cancelled":
    case "corrected":
    case "closed":
      return raw as ResultStatus;
    default:
      return "unavailable";
  }
}

export interface FormatCheck {
  gameId: number;
  displayName: string;
  formatId: number;
  covered: boolean;
  /** Present only when `covered` is false — the recorded reason the game is suppressed. */
  reason?: string;
  detail?: {
    playType: string;
    maxBallCount: number;
    ballGroups: number;
    specialBalls: number;
    multipliers: number;
    addOns: number;
    secondaryDraw: boolean;
    effectiveFrom: string | null;
    effectiveTo: string | null;
  };
}

/**
 * Verify one manifest game against its format definition, and against the drawn card when supplied.
 *
 * A game is covered only when a definition exists AND the drawn card is structurally consistent with
 * it: at least one ball group, and — where the definition declares an effective-from date — a card
 * whose `formatRef.effectiveFrom` matches it, so a date-effective rule change cannot be rendered under
 * the wrong format.
 */
export function checkGame(game: StateGameEntry, card?: ResultCard): FormatCheck {
  const def: ResultFormatDefinition | null = getResultFormat(game.formatId);

  if (!def) {
    return {
      gameId: game.gameId, displayName: game.displayName, formatId: game.formatId, covered: false,
      reason: `No result-format definition for formatId ${game.formatId}. Suppressed rather than rendered with an invented format (FD-S-10).`,
    };
  }

  const detail = {
    playType: def.playType,
    maxBallCount: def.maxBallCount,
    ballGroups: def.ballGroups?.length ?? 0,
    specialBalls: def.specialBalls?.length ?? 0,
    multipliers: def.multipliers?.length ?? 0,
    addOns: def.addOns?.length ?? 0,
    secondaryDraw: Boolean(def.secondaryDraw),
    effectiveFrom: def.effectiveFrom ?? null,
    effectiveTo: def.effectiveTo ?? null,
  };

  if (card) {
    const groups = card.groupsDrawn?.length ?? 0;
    if (groups === 0) {
      return {
        gameId: game.gameId, displayName: game.displayName, formatId: game.formatId, covered: false,
        reason: "Result card carries no drawn ball group; nothing verifiable to render.", detail,
      };
    }
    const drawn = card.groupsDrawn.reduce((n, g) => n + (g.values?.length ?? 0), 0);
    if (drawn > def.maxBallCount) {
      return {
        gameId: game.gameId, displayName: game.displayName, formatId: game.formatId, covered: false,
        reason: `Drawn value count (${drawn}) exceeds the definition's maxBallCount (${def.maxBallCount}); the card and format disagree.`,
        detail,
      };
    }
    /* Date-effective applicability: when the definition is dated, the card must name the same
       effective-from, so a pre-change draw is never rendered under a post-change format. */
    const cardEff = card.formatRef?.effectiveFrom ?? null;
    if (def.effectiveFrom && cardEff !== def.effectiveFrom) {
      return {
        gameId: game.gameId, displayName: game.displayName, formatId: game.formatId, covered: false,
        reason: `Date-effective mismatch: definition effectiveFrom ${def.effectiveFrom}, card ${cardEff ?? "none"}.`,
        detail,
      };
    }
  }

  return { gameId: game.gameId, displayName: game.displayName, formatId: game.formatId, covered: true, detail };
}

export interface CoverageReport {
  total: number;
  covered: FormatCheck[];
  suppressed: FormatCheck[];
}

/** Verify every manifest game. Only `covered` games may render in S-02 and S-06. */
export function verifyFormatCoverage(
  games: readonly StateGameEntry[],
  cards: Map<number, ResultCard>,
): CoverageReport {
  const checks = games.map((g) => checkGame(g, cards.get(g.gameId)));
  return {
    total: games.length,
    covered: checks.filter((c) => c.covered),
    suppressed: checks.filter((c) => !c.covered),
  };
}
