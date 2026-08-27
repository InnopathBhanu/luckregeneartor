/*
 * THE GENERIC HISTORICAL-SEARCH ENGINE — LRG-GAME-052.
 *
 * Authority: the 2026-08-04 genericity direction (*"Build one generic historical-search engine with
 * format-specific presentation"*), BP-04B §21, §22 (neutral language).
 *
 * ══ ONE ENGINE, FOUR PRESENTATIONS, ZERO GAME NAMES ══
 *
 * This module replaces `lookupNumberInDraws`, which assumed one group of digits and therefore could not
 * express Cash Pop's single value, Fantasy 5's unordered set, or SuperLotto Plus's separate special ball. It
 * reads a `FormatProfile` and works for all of them without knowing which game it has.
 *
 * ══ THE TWO ORDERS, KEPT APART ══
 *
 *   **Stored/display order** comes from the data path and is never altered. `drawn` is echoed back exactly as
 *   the draw event supplied it, so a result renders the way the operator published it.
 *
 *   **Matching order** comes from the group's declared semantics. An ordered group is compared position by
 *   position; an unordered group is compared as a set and its stored order is irrelevant to the comparison.
 *
 * A 6/46 game therefore preserves stored order for display while matching on the set — exactly the case the
 * direction calls out. Nothing here sorts a drawn value for any purpose.
 *
 * ══ WHAT IT REFUSES TO DO ══
 *
 * No predictive language, no "due" framing, and no Exact/Any-order vocabulary on a game whose main group is
 * unordered. The window is stated on every answer.
 */

import {
  matchGroup, parseGroupInput, sameValuesDifferentOrder,
  type FormatProfile, type GroupMatch, type ProfileGroup,
} from "./gameFormatProfile";
import type { DrawRecord } from "./digitHistoryAnalysis";

/* ------------------------------------------------------------------ window */

/**
 * How many recent drawings to search.
 *
 * A DRAW COUNT, not a date range: for a twice-daily game "the last 25 drawings" is about twelve days, and a
 * reader thinking in drawings should not have to convert. `"all"` searches everything available.
 */
export type SearchWindow = 10 | 25 | 50 | 100 | "all";
export const SEARCH_WINDOWS: readonly SearchWindow[] = Object.freeze([10, 25, 50, 100, "all"]);

export type VariantSelection = "all" | { gameId: number };
export type OrderMode = "exact" | "any";

/* ------------------------------------------------------------------ input */

export interface SearchInput {
  /**
   * Typed values per group, keyed by `ProfileGroup.key`, each an array of raw strings.
   *
   * Strings, not numbers, all the way to the parser. That is what preserves a leading zero: `Number("007")`
   * is `7`, so any early numeric conversion destroys the search before it starts.
   */
  raw: Readonly<Record<string, readonly string[]>>;
  window: SearchWindow;
  variant: VariantSelection;
  /** Only consulted when the main group is ordered. Ignored otherwise. */
  orderMode: OrderMode;
  /** Only offered when the format has a drawn add-on. */
  includeAddOn: boolean;
}

/* ------------------------------------------------------------------ output */

export interface SearchRow {
  /** The draw's identity as the data path supplies it. No synthetic id is minted. */
  gameId: number;
  drawDateIso: string;
  variantLabel: string;
  /** Drawn values per group, **in supplied display order**. */
  drawnByGroup: Readonly<Record<string, readonly number[]>>;
  /** Per-group comparison, reported separately. A special ball is never folded into the main count. */
  matches: readonly GroupMatch[];
  /** `exact` / `any` only for an ordered main group; `null` for a set comparison. */
  matchedAs: "exact" | "any" | null;
  /** Reader-facing description of how much matched. */
  description: string;
  /** Present only when the add-on produced the match. Names the position it replaced. */
  addOnEffect: { replacedPosition: number; combination: readonly number[]; addOnValue: number } | null;
}

export interface SearchResult {
  /** Parsed selection per group, or `null` when the input was incomplete or invalid. */
  selectionByGroup: Readonly<Record<string, readonly number[]>> | null;
  /** Per-group input error, keyed by group. Empty when the input parsed. */
  errors: Readonly<Record<string, string>>;
  /** Drawings actually searched, after the window and variant filters. */
  searchedCount: number;
  rows: readonly SearchRow[];
  totalMatches: number;
  /**
   * How many rows matched EVERY selectable group the reader completed — a full TICKET match.
   *
   * ══ WHY THIS FIELD EXISTS (LRG-GAME-053) ══
   *
   * There used to be one `fullMatches` count, and it inspected the main group only. Searching SuperLotto Plus
   * for `18, 22, 28, 33, 38` with Mega Ball `7` — the real main numbers of the 2026-07-08 draw, with the WRONG
   * Mega Ball — reported `fullMatches: 1` and stated that the selection *"appeared in full"*. The per-group
   * table on the same screen simultaneously read `main 5 of 5 · mega 0 of 1`.
   *
   * A ticket with five correct numbers and the wrong Mega Ball is not a jackpot ticket. Calling that a full
   * match is exactly the false-certainty claim the Constitution forbids, and the reader has no way to tell
   * which of the two contradictory statements to trust.
   *
   * So the two questions are now counted separately and named for what they answer. Add-ons are excluded from
   * both: FIREBALL is DRAWN, not chosen by the player, so it cannot be part of what their ticket matched.
   */
  fullTicketMatches: number;
  /**
   * How many rows matched the MAIN group completely, whatever the special groups did.
   *
   * Still worth reporting — five of five main numbers is a real, large prize on most games — but it is a full
   * MAIN-NUMBER match, and every sentence built from this count says so in those words.
   */
  fullMainMatches: number;
  /** How many rows matched the main group only in part. `totalMatches - fullMainMatches`. */
  partialMatches: number;
  /**
   * Labels of the non-main selectable groups the reader actually completed, in group order.
   *
   * Empty when they entered main numbers only — in which case there is no ticket/main distinction to draw and
   * the summary uses the plain wording.
   */
  comparedSpecialLabels: readonly string[];
  /** Reader-facing sentence. Always states the window. */
  statement: string;
  /** True when the format cannot support a search at all (a card format). */
  unsupported: boolean;
}

/* ------------------------------------------------------------------ helpers */

/**
 * Split a draw record's values into the profile's groups, **preserving supplied order**.
 *
 * The record carries `digits` (the main values) and `extras` (labelled special/add-on groups) exactly as the
 * data path produced them. Matching by label rather than by position means a feed that reorders its special
 * groups cannot silently shift a value into the wrong group.
 */
function drawnByGroup(profile: FormatProfile, rec: DrawRecord): Record<string, readonly number[]> {
  const out: Record<string, readonly number[]> = {};
  for (const g of profile.groups) {
    if (g.role === "main") {
      out[g.key] = rec.digits;
      continue;
    }
    const byLabel = (rec.extras ?? []).find(
      (e) => e.label.trim().toLowerCase() === (g.label ?? "").trim().toLowerCase(),
    );
    /* A drawn add-on carried in the legacy `fireball` field, for records that predate `extras`. */
    if (!byLabel && g.role === "addOn" && rec.fireball !== null && rec.fireball !== undefined) {
      out[g.key] = [rec.fireball];
      continue;
    }
    out[g.key] = byLabel?.values ?? [];
  }
  return out;
}

/** Describe how much matched, in the vocabulary the group's semantics permit. */
function describe(profile: FormatProfile, matches: readonly GroupMatch[], matchedAs: "exact" | "any" | null): string {
  const main = matches.find((m) => m.key === (profile.main?.key ?? "main"));
  const extras = matches.filter((m) => m !== main && m.of > 0);

  const parts: string[] = [];
  if (main) {
    if (matchedAs === "exact") parts.push(`all ${main.of} in exact order`);
    else if (matchedAs === "any") parts.push(`all ${main.of} in a different order`);
    else if (main.matched === main.of) parts.push(`all ${main.of} numbers`);
    else parts.push(`${main.matched} of ${main.of} numbers`);
  }
  for (const e of extras) {
    parts.push(`${e.matched} of ${e.of} ${e.label ?? "special"}`);
  }
  return parts.join(" · ");
}

function windowLabel(w: SearchWindow, searched: number): string {
  /* No leading article: callers embed this after "the", so "all 60 available drawings" would read "the all 60". */
  return w === "all" ? `${searched} available drawings` : `last ${searched} drawings`;
}

/* ------------------------------------------------------------------ the search */

export function searchHistory(
  all: readonly DrawRecord[],
  profile: FormatProfile,
  input: SearchInput,
): SearchResult {
  const empty = {
    selectionByGroup: null,
    searchedCount: 0,
    rows: [],
    totalMatches: 0,
    fullTicketMatches: 0,
    fullMainMatches: 0,
    partialMatches: 0,
    comparedSpecialLabels: [],
  } as const;

  if (profile.searchKind === "unsupported" || !profile.main) {
    return {
      ...empty,
      errors: {},
      unsupported: true,
      statement: "A number search is not available for this game's result format.",
    };
  }

  /* ---- parse every group ---- */
  const selectionByGroup: Record<string, readonly number[]> = {};
  const errors: Record<string, string> = {};
  let anyComplete = false;

  for (const g of profile.groups) {
    /* An add-on group is not part of the ticket the reader types; it is a property of the drawing. */
    if (g.role === "addOn") continue;
    const parsed = parseGroupInput(g, input.raw[g.key] ?? []);
    if (parsed.error) errors[g.key] = parsed.error;
    if (parsed.values) {
      selectionByGroup[g.key] = parsed.values;
      anyComplete = true;
    }
  }

  /* ---- window and variant, applied in that order ---- */
  const byVariant = all.filter((d) => input.variant === "all" || d.gameId === input.variant.gameId);
  const newestFirst = [...byVariant].sort((a, b) =>
    a.drawDateIso === b.drawDateIso ? a.gameId - b.gameId : b.drawDateIso.localeCompare(a.drawDateIso),
  );
  /* The window applies to the FILTERED set, so "last 25 Evening drawings" is 25 Evening drawings — not the
     Evening rows that happen to fall inside the last 25 of everything. */
  const searched = input.window === "all" ? newestFirst : newestFirst.slice(0, input.window);

  const mainKey = profile.main.key;
  const mainSelection = selectionByGroup[mainKey];

  if (!mainSelection || Object.keys(errors).length > 0 || !anyComplete) {
    const first = Object.values(errors)[0];
    return {
      ...empty,
      errors,
      unsupported: false,
      searchedCount: searched.length,
      statement:
        first ??
        (profile.main.valueType === "digit"
          ? `Enter a ${profile.main.count}-digit number to search the ${windowLabel(input.window, searched.length)}.`
          : profile.main.count === 1
            ? `Enter a number between ${profile.main.min} and ${profile.main.max} to search.`
            : `Enter ${profile.main.count} numbers to search the ${windowLabel(input.window, searched.length)}.`),
    };
  }

  /* ---- compare ---- */
  const ordered = profile.main.semantics.matchOrdered;
  const rows: SearchRow[] = [];

  for (const rec of searched) {
    const drawn = drawnByGroup(profile, rec);
    const mainDrawn = drawn[mainKey] ?? [];

    const matches: GroupMatch[] = [];
    for (const g of profile.groups) {
      if (g.role === "addOn") continue;
      const sel = selectionByGroup[g.key];
      /* A group the reader left blank is not compared, and is not reported as zero matches either. */
      if (!sel) continue;
      matches.push(matchGroup(g, sel, drawn[g.key] ?? []));
    }

    const mainMatch = matches.find((m) => m.key === mainKey);
    let matchedAs: "exact" | "any" | null = null;
    let hit = false;

    if (ordered) {
      const exact = mainMatch?.orderedExact === true;
      const anyOrder = sameValuesDifferentOrder(mainSelection, mainDrawn);
      matchedAs = exact ? "exact" : anyOrder ? "any" : null;
      hit = input.orderMode === "exact" ? exact : exact || anyOrder;
    } else {
      /* Unordered: any main-group overlap is a partial match worth reporting, and a full set is the headline.
         Order plays no part, and no Exact/Any vocabulary is produced. */
      hit = (mainMatch?.matched ?? 0) > 0;
    }

    if (hit) {
      rows.push({
        gameId: rec.gameId,
        drawDateIso: rec.drawDateIso,
        variantLabel: rec.variantLabel,
        drawnByGroup: drawn,
        matches,
        matchedAs,
        description: describe(profile, matches, matchedAs),
        addOnEffect: null,
      });
      continue;
    }

    /*
     * The add-on widens the search only when asked, and only where the format has one.
     *
     * It is a REPLACEMENT, not an extra value: the add-on stands in for each drawn main value in turn, so a
     * match is reported with the position it replaced. Without that, the row would claim a match the drawn
     * values visibly do not contain.
     */
    if (!input.includeAddOn || !profile.addOnLabel) continue;
    const addOnGroup = profile.groups.find((g) => g.role === "addOn");
    const addOnValue = addOnGroup ? (drawn[addOnGroup.key] ?? [])[0] : undefined;
    if (addOnValue === undefined) continue;

    for (let pos = 0; pos < mainDrawn.length; pos++) {
      const combination = mainDrawn.map((v, i) => (i === pos ? addOnValue : v));
      const m = matchGroup(profile.main, mainSelection, combination);
      const exact = m.orderedExact === true;
      const anyOrder = ordered ? sameValuesDifferentOrder(mainSelection, combination) : false;
      const combHit = ordered
        ? (input.orderMode === "exact" ? exact : exact || anyOrder)
        : m.matched === profile.main.count;
      if (!combHit) continue;

      const combMatches = [m, ...matches.filter((x) => x.key !== mainKey)];
      rows.push({
        gameId: rec.gameId,
        drawDateIso: rec.drawDateIso,
        variantLabel: rec.variantLabel,
        drawnByGroup: drawn,
        matches: combMatches,
        matchedAs: ordered ? (exact ? "exact" : "any") : null,
        description: describe(profile, combMatches, ordered ? (exact ? "exact" : "any") : null),
        addOnEffect: { replacedPosition: pos, combination, addOnValue },
      });
      break;
    }
  }

  /* ---- statement ---- */
  const typed = profile.main.valueType === "digit" ? mainSelection.join("") : mainSelection.join(", ");
  const scope = input.variant === "all" ? "drawings" : `${searched[0]?.variantLabel ?? "selected"} drawings`;
  const modeClause = ordered ? (input.orderMode === "exact" ? " in exact order" : " in any order") : "";
  const win = windowLabel(input.window, searched.length).replace("drawings", scope);

  /*
   * ---- classification: main-number match and TICKET match are different questions ----
   *
   * `comparedSpecial` is the set of non-main selectable groups the reader actually completed. Blank groups are
   * not compared and must not count against them: entering five numbers and leaving the Mega Ball empty is a
   * main-number search, and the full-ticket count then coincides with the main count rather than being zero.
   *
   * Add-ons are excluded because they are DRAWN, not chosen. FIREBALL is a wild card the operator draws; it is
   * never part of what a player's ticket selected, so it cannot bear on whether their ticket matched.
   */
  const comparedSpecial = profile.groups.filter(
    (g) => g.role !== "main" && g.role !== "addOn" && selectionByGroup[g.key] !== undefined,
  );
  const comparedSpecialLabels = comparedSpecial.map((g) => g.label ?? "special number");

  const mainFullyMatched = (r: SearchRow) => {
    const m = r.matches.find((x) => x.key === mainKey);
    return m !== undefined && m.matched === m.of;
  };
  /* Every completed selectable group matched in full — main AND each special the reader entered. */
  const ticketFullyMatched = (r: SearchRow) =>
    mainFullyMatched(r) &&
    comparedSpecial.every((g) => {
      const m = r.matches.find((x) => x.key === g.key);
      return m !== undefined && m.matched === m.of;
    });

  const fullMainMatches = rows.filter(mainFullyMatched).length;
  const fullTicketMatches = rows.filter(ticketFullyMatched).length;
  const partialMatches = rows.length - fullMainMatches;

  /*
   * ---- the headline must match what actually happened ----
   *
   * Two independent distinctions decide the sentence, and both were previously collapsed:
   *
   *   1. FULL versus PARTIAL main group. An ordered game only ever produces full main matches, so "appeared" is
   *      accurate there. An unordered game reports partial overlap too, and saying the whole set "appeared in 25
   *      drawings" when it appeared in one — and 24 others shared a number or two — is false.
   *   2. MAIN versus TICKET. When the reader entered a special ball, a complete main match with the wrong
   *      special ball must never be described as their numbers having appeared. It is a full MAIN-NUMBER match,
   *      and the sentence says exactly that, then says the special ball did not match.
   */
  const specialsTyped = comparedSpecial
    .map((g) => `${g.label ?? "special number"} ${(selectionByGroup[g.key] ?? []).join(", ")}`)
    .join(" and ");
  const labelList = comparedSpecialLabels.join(" and ");
  const typedTicket = specialsTyped ? `${typed} with ${specialsTyped}` : typed;
  const plural = (n: number) => (n === 1 ? "" : "s");

  let statement: string;
  if (rows.length === 0) {
    statement = `${typedTicket} did not appear${modeClause} in the ${win}.`;
  } else if (comparedSpecialLabels.length === 0) {
    /* Main numbers only. No ticket/main distinction exists to draw. */
    if (ordered || partialMatches === 0) {
      statement = `${typed} appeared${modeClause} in ${fullMainMatches} of the ${win}.`;
    } else if (fullMainMatches === 0) {
      statement =
        `${typed} did not appear in full in the ${win}. ` +
        `${partialMatches} drawing${plural(partialMatches)} matched some of your numbers.`;
    } else {
      statement =
        `${typed} appeared in full in ${fullMainMatches} of the ${win}, ` +
        `and ${partialMatches} more matched some of your numbers.`;
    }
  } else if (fullTicketMatches > 0) {
    /* The whole ticket came up. The only case where a full match may be claimed without qualification. */
    statement =
      `${typedTicket} appeared in full in ${fullTicketMatches} of the ${win}` +
      (partialMatches > 0 ? `, and ${partialMatches} more matched some of your numbers.` : ".");
  } else if (fullMainMatches > 0) {
    /* THE CORRECTED CASE. All main numbers, wrong special ball — labelled as a main-number match, never as a
       full match, and the special-ball miss is stated rather than left for the reader to notice in the table. */
    statement =
      `${typed} matched all ${profile.main.count} main numbers in ${fullMainMatches} of the ${win}, ` +
      `but no drawing also matched your ${labelList}. That is a full main-number match, not a full ticket match.`;
  } else {
    statement =
      `${typedTicket} did not appear in full in the ${win}. ` +
      `${partialMatches} drawing${plural(partialMatches)} matched some of your numbers.`;
  }

  /* Full ticket matches first, then full main-number matches, then partial — each newest-first within its band.
     A reader scanning for "did my ticket come up" should not have to read past twenty one-number overlaps, and a
     row that missed only the special ball belongs above them but below a genuine full ticket match. */
  const band = (r: SearchRow) => (ticketFullyMatched(r) ? 0 : mainFullyMatched(r) ? 1 : 2);
  const ranked = [...rows].sort((a, b) => {
    const d = band(a) - band(b);
    return d !== 0 ? d : b.drawDateIso.localeCompare(a.drawDateIso);
  });

  return {
    selectionByGroup,
    errors,
    unsupported: false,
    searchedCount: searched.length,
    rows: ranked,
    totalMatches: rows.length,
    fullTicketMatches,
    fullMainMatches,
    partialMatches,
    comparedSpecialLabels,
    statement,
  };
}
