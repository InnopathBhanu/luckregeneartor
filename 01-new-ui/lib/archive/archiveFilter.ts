/*
 * THE DETERMINISTIC ARCHIVE FILTER — LRG-ARCHIVE-054.
 *
 * Authority: brief §8 AR-06 (the public control list and *"The number input is generated from the format
 * contract"*), §18 acceptance criteria (exact order distinguishes `123` from `321`; any order finds all valid
 * permutations while respecting repeated digits; variant filtering; month filtering changes every dependent
 * metric), blueprint §13 (basic search), §31 (filter states are not indexable).
 *
 * ══ WHY THIS EXISTS ALONGSIDE `gameHistorySearch` ══
 *
 * `gameHistorySearch` answers a different question: *"has my number come up in the last N drawings?"* It is
 * window-based, it ranks by match strength and it produces a reader-facing sentence about a ticket. An archive
 * filter answers *"which rows in this YEAR satisfy these conditions?"* — month, date range, variant, shape, sum
 * band, sort order — and returns rows, not a verdict.
 *
 * They share the parts that must not diverge: group parsing and per-group comparison come from the SAME format
 * profile helpers (`parseGroupInput`, `matchGroup`, `sameValuesDifferentOrder`), so "exact versus any order" can
 * never mean one thing on the Game Page and another in the archive.
 *
 * ══ ANY-ORDER AND REPEATED VALUES ══
 *
 * The subtle requirement. `sameValuesDifferentOrder` is a MULTISET comparison, so `112` in any order matches
 * `121` and `211` but NOT `122` — a value drawn once and selected twice counts once. Set-based comparison would
 * wrongly match `12` against `112`. The archive reuses the shared helper precisely so it inherits that.
 */

import { matchGroup, parseGroupInput, sameValuesDifferentOrder, type FormatProfile } from "../game/gameFormatProfile";
import type {
  ArchiveDrawRow, ArchiveFilterInput, ArchiveFilterResult, ArchiveVariantSelection,
} from "./archiveContract";
import { sortArchiveRows } from "./archiveReviewFixture";
import { monthLabel } from "./archiveYear";
import type { CarriedFilter } from "./archiveFilterCarry";

/**
 * Rebuild a full `ArchiveFilterInput` from the carried snapshot the workspace publishes.
 *
 * The filtered CSV control (restored under `FD-DAT-16`, Conflict 37) lives in the AR-05 island while the
 * filter state lives in the AR-06 workspace; the workspace already publishes every change to the
 * filter bus as a `CarriedFilter`. Reconstructing the input from that snapshot — with the SAME defaults
 * `defaultArchiveFilter` supplies — is what makes "the download and the visible matches are the same
 * data" true across the two islands without pulling the whole page across the client boundary.
 */
export function filterInputFromCarried(c: CarriedFilter, year: number): ArchiveFilterInput {
  return {
    ...defaultArchiveFilter(),
    raw: c.raw ?? {},
    orderMode: c.orderMode ?? "exact",
    variant: c.variant && c.variant !== "all" ? { gameId: Number(c.variant) } : "all",
    shape: (c.shape || null) as ArchiveFilterInput["shape"],
    sumFrom: c.sumFrom !== undefined && c.sumFrom !== "" ? Number(c.sumFrom) : null,
    sumTo: c.sumTo !== undefined && c.sumTo !== "" ? Number(c.sumTo) : null,
    sort: c.sort ?? "newest",
    monthKey: c.month ? `${year}-${String(c.month).padStart(2, "0")}` : null,
  };
}

/** The empty filter: the whole year, both variants, newest first, corrections included. */
export function defaultArchiveFilter(): ArchiveFilterInput {
  return {
    monthKey: null,
    fromIso: null,
    toIso: null,
    variant: "all",
    raw: {},
    orderMode: "exact",
    includeAddOn: false,
    shape: null,
    sumFrom: null,
    sumTo: null,
    sort: "newest",
    includeCorrected: true,
  };
}

function variantMatches(row: ArchiveDrawRow, v: ArchiveVariantSelection): boolean {
  return v === "all" || row.gameId === v.gameId;
}

/**
 * Apply an archive filter.
 *
 * Every condition is ANDed, and each is skipped when unset — so an empty filter returns the year unchanged
 * rather than nothing. The statement names what was applied, because a reader looking at 12 rows needs to know
 * whether that is the year or a slice of it.
 */
export function filterArchive(
  all: readonly ArchiveDrawRow[],
  profile: FormatProfile,
  input: ArchiveFilterInput,
): ArchiveFilterResult {
  const errors: Record<string, string> = {};

  /*
   * ---- the number condition, parsed through the FORMAT ----
   *
   * Strings reach the parser so a leading zero survives: `Number("007")` is `7`, and a Pick 3 archive that
   * cannot search `007` is broken for a tenth of its own outcome space. Only groups the reader actually filled
   * in are compared; a blank group is not a condition and must not silently exclude every row.
   */
  const selection: Record<string, readonly number[]> = {};
  let numberApplied = false;
  for (const g of profile.groups) {
    /* A drawn add-on is not a player selection and is never a main-number condition. It participates only via
       `includeAddOn`, which widens the match rather than constraining it. */
    if (g.role === "addOn") continue;
    const raw = input.raw[g.key];
    if (!raw || raw.every((s) => s.trim() === "")) continue;
    const parsed = parseGroupInput(g, raw);
    if (parsed.error) {
      errors[g.key] = parsed.error;
      continue;
    }
    if (parsed.values) {
      selection[g.key] = parsed.values;
      numberApplied = true;
    }
  }

  const mainKey = profile.main?.key ?? "main";
  const mainSelection = selection[mainKey];
  const ordered = profile.main?.semantics.matchOrdered === true;

  let rows = all.filter((r) => {
    if (!variantMatches(r, input.variant)) return false;
    if (!input.includeCorrected && r.corrected) return false;
    if (input.monthKey && r.monthKey !== input.monthKey) return false;
    if (input.fromIso && r.drawDateIso < input.fromIso) return false;
    if (input.toIso && r.drawDateIso > input.toIso) return false;
    if (input.shape && r.shape !== input.shape) return false;
    if (input.sumFrom !== null && (r.sum === null || r.sum < input.sumFrom)) return false;
    if (input.sumTo !== null && (r.sum === null || r.sum > input.sumTo)) return false;
    return true;
  });

  /* ---- number matching, when a number was supplied ---- */
  if (Object.keys(errors).length === 0 && numberApplied) {
    rows = rows.filter((r) => {
      /* Every completed selectable group must match in full. A main-number match with the wrong special ball
         is not a match for the ticket the reader described — the same rule the Game Page search enforces. */
      for (const g of profile.groups) {
        if (g.role === "addOn") continue;
        const sel = selection[g.key];
        if (!sel) continue;
        const drawn = g.role === "main"
          ? r.mainValues
          : r.groups.find((x) => x.key === g.key)?.values ?? [];

        if (g.key === mainKey && ordered) {
          const exact = matchGroup(g, sel, drawn).orderedExact === true;
          if (input.orderMode === "exact") {
            if (!exact) {
              /* The add-on widens an ordered search only when asked. It REPLACES one drawn value, so the
                 combination is drawn-with-one-substitution, never an extra value. */
              if (!input.includeAddOn || r.addOnValue === null) return false;
              if (!matchesWithAddOn(g, sel, drawn, r.addOnValue, "exact")) return false;
            }
          } else {
            const anyOrder = sameValuesDifferentOrder(sel, drawn);
            if (!exact && !anyOrder) {
              if (!input.includeAddOn || r.addOnValue === null) return false;
              if (!matchesWithAddOn(g, sel, drawn, r.addOnValue, "any")) return false;
            }
          }
          continue;
        }

        const m = matchGroup(g, sel, drawn);
        if (m.matched !== m.of) return false;
      }
      return true;
    });
  }

  const sorted = sortArchiveRows(rows, input.sort);

  return {
    rows: sorted,
    examined: all.length,
    statement: filterStatement(input, profile, mainSelection, sorted.length, all.length, numberApplied),
    errors,
    numberApplied,
  };
}

/** Whether the drawn values match the selection once the add-on substitutes for one drawn position. */
function matchesWithAddOn(
  group: Parameters<typeof matchGroup>[0],
  selection: readonly number[],
  drawn: readonly number[],
  addOnValue: number,
  mode: "exact" | "any",
): boolean {
  for (let pos = 0; pos < drawn.length; pos++) {
    const combination = drawn.map((v, i) => (i === pos ? addOnValue : v));
    if (mode === "exact") {
      if (matchGroup(group, selection, combination).orderedExact === true) return true;
    } else if (sameValuesDifferentOrder(selection, combination)) {
      return true;
    }
  }
  return false;
}

/**
 * The reader-facing sentence.
 *
 * Names every applied condition, and says "the whole year" when none was applied — so a short table is never
 * ambiguous between "few drawings" and "a narrow filter".
 */
function filterStatement(
  input: ArchiveFilterInput,
  profile: FormatProfile,
  mainSelection: readonly number[] | undefined,
  found: number,
  examined: number,
  numberApplied: boolean,
): string {
  const parts: string[] = [];
  if (input.monthKey) parts.push(monthLabel(Number(input.monthKey.slice(5, 7))));
  if (input.fromIso || input.toIso) parts.push(`${input.fromIso ?? "the start of the year"} to ${input.toIso ?? "the latest drawing"}`);
  if (input.variant !== "all") parts.push("one drawing only");
  if (numberApplied && mainSelection) {
    const typed = profile.main?.valueType === "digit" ? mainSelection.join("") : mainSelection.join(", ");
    parts.push(
      profile.main?.semantics.matchOrdered
        ? `${typed} in ${input.orderMode === "exact" ? "exact" : "any"} order`
        : typed,
    );
  }
  if (input.shape) parts.push(shapeWord(input.shape));
  if (input.sumFrom !== null || input.sumTo !== null) {
    parts.push(`sum ${input.sumFrom ?? "any"} to ${input.sumTo ?? "any"}`);
  }
  if (!input.includeCorrected) parts.push("corrected drawings excluded");

  const scope = parts.length === 0
    ? `all ${examined} drawings in this archive year`
    : `${parts.join(", ")}`;
  return parts.length === 0
    ? `Showing ${scope}.`
    : `${found} of ${examined} drawings match ${scope}.`;
}

function shapeWord(shape: NonNullable<ArchiveFilterInput["shape"]>): string {
  switch (shape) {
    case "double": return "results containing a double";
    case "triple": return "results where every value is the same";
    case "allDifferent": return "results where every value differs";
    default: return "results";
  }
}
