/*
 * Draw event → view model, and events → game families.
 *
 * Task LRG-STATE-025. Authority: FD-X-06 (frequent-draw variants grouped, never exploded; neutral
 * deterministic ordering), FD-X-05 (multi-state treatment), FD-X-02 (the hub owns current State truth),
 * FD-S-10 (format-driven rendering — never a hardcoded ball count), FD-S-09 (closed status union),
 * FD-S-14 (three-signal special balls).
 *
 * WHY A BUILDER RATHER THAN NEW COMPONENTS. `ResultCard` already models every shape Florida needs —
 * variable ball counts, named special balls, multipliers, secondary draws, next draw with next jackpot. So
 * this module maps the production-derived events onto that existing contract and the existing card
 * renderer is reused unchanged. No Florida-specific component is introduced (FD-X-01).
 *
 * NOTHING IS INVENTED HERE. Every value passes through from `floridaDrawEvents.ts`. Where the feed has no
 * value the field is omitted, never defaulted.
 */

import type { ResultCard } from "../data-provider/types";
import { getResultFormat } from "../data-provider";
import {
  FLORIDA_DRAW_EVENTS, floridaGameFamilies, type FloridaDrawEvent, type FloridaGameFamily,
} from "./floridaDrawEvents";
import type { ResultStatus } from "./formatCoverage";

/** `07/08/2026` style display from an ISO date, in the game's own local calendar. */
function displayDate(iso: string | null, timeLabel: string | null, tzLabel: string): string {
  if (!iso) return "unavailable";
  const [y, m, d] = iso.split("-");
  const weekday = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long", timeZone: "UTC",
  });
  const time = timeLabel ? ` — ${timeLabel.trim()} ${tzLabel}` : "";
  return `${weekday}, ${m}/${d}/${y}${time}`;
}

/**
 * Map one draw event onto the existing `ResultCard` contract.
 *
 * The display name always carries the draw period when the family has more than one event, so a result can
 * never be ambiguous about which draw it belongs to — the defect the proposed Florida design contained.
 */
/**
 * §B1 — the IANA zone a relative next-draw label needs.
 *
 * `tzLabel` is a reader-facing label ("ET"). It cannot resolve an instant: it carries no DST rule and two zones
 * share it. The zone is therefore passed separately and OPTIONALLY: a caller without a validated State
 * configuration passes nothing, and the relative label is absent rather than computed against a guess.
 */
export function eventToCard(
  e: FloridaDrawEvent,
  tzLabel: string,
  periodRequired: boolean,
  timeZone?: string | null,
): ResultCard {
  const format = getResultFormat(e.formatId);
  const displayName = periodRequired && e.drawPeriod ? `${e.familyName} (${e.drawPeriod})` : e.familyName;

  /* Main group first, then each named special ball as its own labelled group. A special ball is NEVER
     merged into the main row and never rendered as a bare number (FD-S-14). */
  const groupsDrawn = [
    { order: 0, label: null, values: e.mainNumbers, colorToken: "ball.default" },
    ...e.specialBalls.map((s, i) => ({
      order: i + 1,
      label: s.label,
      values: s.values,
      colorToken: s.label.toLowerCase().includes("fireball")
        ? "ball.fireball"
        : s.label.toLowerCase().includes("mega")
          ? "ball.megaball"
          : "ball.powerball",
    })),
  ];

  return {
    gameId: e.gameId,
    gameSlug: e.drawPeriod
      ? `${e.familyKey}-${e.drawPeriod.toLowerCase().replace(/\s+/g, "-")}`
      : e.familyKey,
    displayName,
    formatRef: { gameId: e.formatId },
    status: "latest",
    drawScheduleLabel: e.drawDays,
    resultDate: {
      gameLocalDate: e.resultDate ?? "",
      display: displayDate(e.resultDate, e.drawTimeLocal, tzLabel),
      ...(e.resultDate && e.drawTimeLocal ? {} : {}),
    },
    groupsDrawn,
    ...(e.secondaryDraw
      ? {
          secondaryDraw: {
            label: e.secondaryDraw.label,
            groupsDrawn: [
              { order: 0, label: null, values: e.secondaryDraw.mainNumbers, colorToken: "ball.default" },
              ...e.secondaryDraw.specialBalls.map((s, i) => ({
                order: i + 1, label: s.label, values: s.values, colorToken: "ball.powerball",
              })),
            ],
          },
        }
      : {}),
    ...(e.multiplier
      ? {
          multipliers: [
            {
              key: e.multiplier.label.toLowerCase().replace(/\s+/g, ""),
              label: e.multiplier.label,
              value: e.multiplier.value,
              display: `${e.multiplier.label} ${e.multiplier.value}X`,
            },
          ],
        }
      : {}),
    ...(e.topPrizeDisplay ? { prizeDisplay: e.topPrizeDisplay } : {}),
    ...(e.nextDrawDate
      ? {
          nextDraw: {
            gameLocalDate: e.nextDrawDate,
            display: displayDate(e.nextDrawDate, e.drawTimeLocal, tzLabel),
            ...(e.nextPrizeDisplay ? { nextJackpotDisplay: e.nextPrizeDisplay } : {}),
            /* §B1: the two extra fields the relative label needs. Both come straight from governed values —
               the operator's published draw time and the jurisdiction's configured IANA zone — and both are
               omitted rather than defaulted when a source does not carry them. */
            ...(e.drawTimeLocal ? { drawTimeLocal: e.drawTimeLocal } : {}),
            ...(timeZone ? { timeZone } : {}),
          },
        }
      : {}),
    /* No purchase CTA on any card. Commerce is S-07's job and Florida is `underReview` (FD-X-11). */
    buyTickets: null,
    ...(format ? {} : {}),
  };
}

/** The shape the existing card renderer consumes — reused rather than duplicated. */
export interface PreviewCard {
  gameId: number;
  displayName: string;
  status: ResultStatus;
  statusDetail?: string;
  card: ResultCard;
}

/** Wrap a built card in the renderer's contract. Status is `verified`: these are published feed results. */
function toPreviewCard(card: ResultCard): PreviewCard {
  return { gameId: card.gameId, displayName: card.displayName, status: "verified", card };
}

export interface FamilyViewModel {
  familyKey: string;
  familyName: string;
  gameClass: FloridaGameFamily["gameClass"];
  /** PF-02 §15 presentation group. */
  group: "multiState" | "stateOnly" | "dailyVariants" | "specialized";
  /** The card the family leads with — its most recent draw. */
  leadCard: PreviewCard;
  /** Sibling events other than the lead, in draw order. Empty for single-event families. */
  siblingCards: PreviewCard[];
  /** Total draw events collapsed into this family. */
  eventCount: number;
  status: ResultStatus;
  drawDays: string;
  /** Current versus next advertised prize, both from the feed. Descriptive, never predictive. */
  jackpotMovement: { current: string; next: string; changed: boolean } | null;
}

function groupFor(cls: FloridaGameFamily["gameClass"]): FamilyViewModel["group"] {
  if (cls === "multiState") return "multiState";
  if (cls === "stateJackpot") return "stateOnly";
  if (cls === "frequentDraw") return "specialized";
  return "dailyVariants";
}

/**
 * Build the family view models.
 *
 * FD-X-06 ordering, applied deterministically and in this order: result freshness → next-draw imminence →
 * draw frequency → family declaration order. **Jackpot scale is deliberately NOT a sort key** — it is a
 * low-weight interest signal only, and using it to sort would be desirability ranking.
 */
export function buildFamilies(
  tzLabel: string,
  events: readonly FloridaDrawEvent[] = FLORIDA_DRAW_EVENTS,
  coveredFormatIds?: ReadonlySet<number>,
  /* §B1: the jurisdiction's governed IANA zone, passed through to every card so the relative next-draw label can
     be computed against the game's own clock. Optional — omitted means no label, never a guessed zone. */
  timeZone?: string | null,
): FamilyViewModel[] {
  const usable = coveredFormatIds ? events.filter((e) => coveredFormatIds.has(e.formatId)) : events;
  return floridaGameFamilies(usable).map((f) => {
    const periodRequired = f.events.length > 1;
    const sorted = [...f.events].sort((a, b) => (b.resultDate ?? "").localeCompare(a.resultDate ?? ""));
    const lead = sorted[0];
    const leadCard = toPreviewCard(eventToCard(lead, tzLabel, periodRequired, timeZone));
    const siblings = f.events
      .filter((e) => e.gameId !== lead.gameId)
      .map((e) => toPreviewCard(eventToCard(e, tzLabel, periodRequired, timeZone)));
    const current = lead.topPrizeDisplay;
    const next = lead.nextPrizeDisplay;
    return {
      familyKey: f.familyKey,
      familyName: f.familyName,
      gameClass: f.gameClass,
      group: groupFor(f.gameClass),
      leadCard,
      siblingCards: siblings,
      eventCount: f.events.length,
      status: leadCard.status,
      drawDays: lead.drawDays,
      jackpotMovement:
        current && next ? { current, next, changed: current !== next } : null,
    };
  });
}

/**
 * The single most relevant verified result for the mobile first screen (FD-X-03 band 2).
 *
 * Deterministic: most recent result date wins; ties break on family declaration order. Never selected by
 * jackpot size (FD-X-06).
 */
export function primaryFamily(families: FamilyViewModel[]): FamilyViewModel | undefined {
  return [...families].sort((a, b) => {
    const d = (b.leadCard.card.resultDate.gameLocalDate ?? "").localeCompare(
      a.leadCard.card.resultDate.gameLocalDate ?? "",
    );
    return d !== 0 ? d : families.indexOf(a) - families.indexOf(b);
  })[0];
}

/** Families in a PF-02 presentation group, preserving deterministic order. */
export function familiesInGroup(
  families: FamilyViewModel[],
  group: FamilyViewModel["group"],
): FamilyViewModel[] {
  return families.filter((f) => f.group === group);
}
