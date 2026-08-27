/*
 * THE FORMAT PROFILE — ONE ADAPTER, READ BY EVERY GAME PAGE TOOL. LRG-GAME-052.
 *
 * Authority: the 2026-08-04 genericity direction (*"Use the existing `ResultFormatVersion`, `BallGroupSpec`,
 * add-on and secondary-draw contracts. Do not create a competing format definition."*), `FD-S-10`
 * (format-driven rendering, never a hardcoded ball count), `CLAUDE.md` §14.
 *
 * ══ WHAT THIS REPLACES, AND WHY IT WAS WRONG ══
 *
 * `GameRuleEra` carried `selectionKind`, `selectionCount`, `selectionMin`, `selectionMax` and
 * `repeatsAllowed`, and every tool read them. That was a SECOND declaration of what `BallGroupSpec` already
 * says — a competing format definition — and it had two consequences:
 *
 *   1. It could disagree with the format. Two sources for "how many values does this game draw" is one
 *      source too many.
 *   2. It flattened every game into a single group of one value type, so a game with a special ball had no
 *      way to express itself. That is why the tools were digit-only.
 *
 * The rule era keeps what it genuinely owns and the format cannot express: play types, wagers, payout
 * matrices, odds, add-on prize tables and effective eras. The FORMAT owns the shape. This module is the seam.
 *
 * ══ THE searchKind CLASSIFICATION ══
 *
 * Four presentations, derived from the format rather than from a game name:
 *
 *   `digits`     — one ordered group of `digit` values (Pick 2/3/4/5, CA Daily 3/4). Positional inputs,
 *                  leading zeros, Exact/Any order.
 *   `single`     — one group of exactly one value (Cash Pop). One input, no order controls.
 *   `unordered`  — one group of several `number` values (Fantasy 5, Lotto, Jackpot Triple Play). Set
 *                  comparison, duplicates rejected, no digit or Box vocabulary.
 *   `multiGroup` — a main group plus one or more special groups (SuperLotto Plus, Powerball). Each group
 *                  validated, compared and reported independently.
 *   `unsupported`— a card format. The adapter boundary exists; the rules do not, so tools suppress honestly
 *                  rather than guessing at card semantics.
 *
 * Nothing here reads a state code, a game slug or a game id.
 */

import {
  renderableGroups, resolveGroupSemantics, undeclaredSemantics,
  type BallGroupSpec, type GroupSemantics, type ResultFormatVersion,
} from "../state/resultFormatContract";

/* ------------------------------------------------------------------ types */

export type SearchKind = "digits" | "single" | "unordered" | "multiGroup" | "unsupported";

/** One group, resolved for presentation and for matching. */
export interface ProfileGroup {
  /** Stable key for form fields and result columns. Derived from the label, or `main`. */
  key: string;
  /** Reader-facing label. `null` for the main group, which is named by the section heading. */
  label: string | null;
  /** Screen-reader name. Falls back to the label, then to a generic name. */
  accessibleLabel: string;
  valueType: BallGroupSpec["valueType"];
  count: number;
  min: number;
  max: number;
  /** Independent pool, so this group's values may legitimately repeat the main group's. */
  differentSet: boolean;
  role: NonNullable<BallGroupSpec["visualRole"]>;
  colorToken: string;
  semantics: GroupSemantics;
}

export interface FormatProfile {
  gameKey: string;
  displayName: string;
  /** The format version this profile came from, so a caller can cite the era it used. */
  formatId: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  searchKind: SearchKind;
  /** Primary groups plus drawn add-ons, in `order`. Purchase-time add-ons are never here. */
  groups: readonly ProfileGroup[];
  /** The main group — the one every game has. `null` only for an unsupported format. */
  main: ProfileGroup | null;
  /** Special and drawn-add-on groups, excluding main. */
  extraGroups: readonly ProfileGroup[];
  /** The drawn add-on's label, e.g. `Fireball`. `null` when the format has none. */
  addOnLabel: string | null;
  /** True when the main group's matching is position-sensitive. Drives Exact/Any order controls. */
  ordered: boolean;
  /** Total drawn values across every renderable group. */
  totalValues: number;
  /** Groups whose matching semantics were defaulted rather than declared. Surfaced, never hidden. */
  undeclared: readonly { group: string; missing: string[] }[];
  /**
   * Which optional tools this format can support at all.
   *
   * Distinct from a configuration capability flag: configuration says "should this game offer the tool",
   * this says "can the format express it". A tool needs both. A card format supports none of them.
   */
  supports: {
    history: boolean;
    numberSearch: boolean;
    generator: boolean;
    /** Positional statistics only make sense for an ordered group. */
    positionalStatistics: boolean;
    /** Box/permutation vocabulary only applies where order matters and repeats are possible. */
    permutationVocabulary: boolean;
  };
}

/* ------------------------------------------------------------------ construction */

function groupKey(g: BallGroupSpec, index: number): string {
  if (!g.label) return "main";
  const slug = g.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug.length > 0 ? slug : `group-${index}`;
}

function toProfileGroup(g: BallGroupSpec, index: number): ProfileGroup {
  return {
    key: groupKey(g, index),
    label: g.label,
    accessibleLabel: g.accessibleLabel ?? g.label ?? "Winning numbers",
    valueType: g.valueType,
    count: g.count,
    min: g.min,
    max: g.max,
    differentSet: g.differentSet,
    role: g.visualRole ?? (g.label ? "special" : "main"),
    colorToken: g.colorToken,
    semantics: resolveGroupSemantics(g),
  };
}

/**
 * Classify the presentation from the group shape.
 *
 * Order of tests matters: a card format is rejected first, then a multi-group format, then the single-group
 * cases. `multiGroup` is checked before `single` so a 1+1 format (were one ever added) reports as multi-group
 * rather than collapsing to one input.
 */
function classify(groups: readonly ProfileGroup[]): SearchKind {
  if (groups.length === 0) return "unsupported";
  if (groups.some((g) => g.valueType === "card")) return "unsupported";

  const main = groups.find((g) => g.role === "main") ?? groups[0];
  /*
   * A drawn ADD-ON is excluded from the classification.
   *
   * FIREBALL is a property of the drawing, not a group the player selects, so a Pick 3 ticket is still three
   * digits and the page is still a `digits` presentation. Counting it as a second group made every Pick game
   * classify as `multiGroup` — which also disabled the Pick 3 checker, because that requires a `digits` format.
   *
   * A SPECIAL group is different: a SuperLotto Plus player really does choose a Mega number, so it counts.
   */
  const extras = groups.filter((g) => g !== main && g.role !== "addOn");

  if (extras.length > 0) return "multiGroup";
  if (main.count === 1) return "single";
  if (main.valueType === "digit") return "digits";
  return "unordered";
}

/**
 * Build the profile for one format version.
 *
 * Deliberately takes a `ResultFormatVersion` rather than a game key, so the caller has already made the
 * date-effective selection with `selectFormatVersion` and this module cannot pick the wrong era.
 */
export function formatProfile(v: ResultFormatVersion): FormatProfile {
  const specs = [...renderableGroups(v)].sort((a, b) => a.order - b.order);
  const groups = specs.map(toProfileGroup);
  const searchKind = classify(groups);

  const main = groups.find((g) => g.role === "main") ?? groups[0] ?? null;
  const extraGroups = main ? groups.filter((g) => g !== main) : groups;
  const drawnAddOn = v.addOns.find((a) => a.addOnClass === "drawn" && a.drawnGroup);

  const supported = searchKind !== "unsupported";
  const ordered = main?.semantics.matchOrdered ?? false;

  return {
    gameKey: v.gameKey,
    displayName: v.displayName,
    formatId: v.formatId,
    effectiveFrom: v.effectiveFrom,
    effectiveTo: v.effectiveTo,
    searchKind,
    groups,
    main,
    extraGroups,
    addOnLabel: drawnAddOn?.label ?? null,
    ordered,
    totalValues: groups.reduce((n, g) => n + g.count, 0),
    undeclared: undeclaredSemantics(v),
    supports: {
      history: supported,
      numberSearch: supported,
      generator: supported,
      /* Positional frequency on an unordered set would present an artefact of feed ordering as a property of
         the game. The direction forbids it explicitly. */
      positionalStatistics: supported && ordered,
      /* "3-way box" is meaningless without both order sensitivity and the possibility of a repeat. */
      permutationVocabulary: supported && ordered && (main?.semantics.repeatsAllowed ?? false),
    },
  };
}

/* ------------------------------------------------------------------ value parsing and validation */

export interface GroupInputResult {
  values: readonly number[] | null;
  error: string | null;
}

/**
 * Parse one group's typed input.
 *
 * Two shapes, chosen by value type:
 *
 *   `digit` — a contiguous string, one character per position. **The string is read per position, so a
 *             leading zero survives.** `007` is a real Pick 3 number and `Number("007")` is `7`, which is
 *             why the digit path never goes through a numeric conversion of the whole input.
 *   `number`— a list of separate values, because 15 is one value and not the digits 1 and 5. This is the
 *             distinction that made Cash Pop's `15` and Fantasy 5's `11, 23` impossible under the old
 *             digit-only search.
 */
export function parseGroupInput(group: ProfileGroup, raw: readonly string[]): GroupInputResult {
  if (group.valueType === "digit") {
    const joined = raw.join("").trim();
    if (joined.length === 0) return { values: null, error: null };
    if (!/^[0-9]+$/.test(joined)) return { values: null, error: "Enter digits only." };
    if (joined.length !== group.count) {
      return {
        values: null,
        error: `Enter all ${group.count} digits. Leading zeros count, so 007 and 700 are different numbers.`,
      };
    }
    const values = [...joined].map(Number);
    for (const v of values) {
      if (v < group.min || v > group.max) {
        return { values: null, error: `Digits must be between ${group.min} and ${group.max}.` };
      }
    }
    if (!group.semantics.repeatsAllowed && new Set(values).size !== values.length) {
      return { values: null, error: "This game does not draw the same value twice." };
    }
    return { values, error: null };
  }

  /* Number and card groups: each position is its own value. */
  const trimmed = raw.map((r) => r.trim());
  if (trimmed.every((t) => t.length === 0)) return { values: null, error: null };
  if (trimmed.some((t) => t.length === 0)) {
    return {
      values: null,
      error: group.count === 1
        ? `Enter a value between ${group.min} and ${group.max}.`
        : `Enter all ${group.count} numbers.`,
    };
  }
  const values: number[] = [];
  for (const t of trimmed) {
    if (!/^[0-9]+$/.test(t)) return { values: null, error: "Enter whole numbers only." };
    const n = Number(t);
    if (n < group.min || n > group.max) {
      return { values: null, error: `Numbers must be between ${group.min} and ${group.max}.` };
    }
    values.push(n);
  }
  if (!group.semantics.repeatsAllowed && new Set(values).size !== values.length) {
    return { values: null, error: "Each number must be different." };
  }
  return { values, error: null };
}

/** How many positions of input a group needs. Digit groups render `count` single-character boxes. */
export function inputSlots(group: ProfileGroup): number {
  return group.count;
}

/* ------------------------------------------------------------------ matching */

export interface GroupMatch {
  key: string;
  label: string | null;
  /** How many of the group's values the ticket matched. */
  matched: number;
  /** How many values the group draws, so `2 of 5` reads correctly without a second lookup. */
  of: number;
  /** Only meaningful for an ordered group. `null` for a set comparison. */
  orderedExact: boolean | null;
}

/**
 * Compare one group's selection against its drawn values.
 *
 * **Ordered groups** compare position by position, and report whether the whole group matched in the exact
 * order typed. **Unordered groups** compare as multisets and report a count only — the drawn display order is
 * irrelevant to the comparison, which is precisely the distinction the direction asks for.
 */
export function matchGroup(
  group: ProfileGroup,
  selection: readonly number[],
  drawn: readonly number[],
): GroupMatch {
  const base = { key: group.key, label: group.label, of: group.count };

  if (group.semantics.matchOrdered) {
    let matched = 0;
    for (let i = 0; i < Math.min(selection.length, drawn.length); i++) {
      if (selection[i] === drawn[i]) matched++;
    }
    return { ...base, matched, orderedExact: matched === group.count && selection.length === drawn.length };
  }

  /* Multiset intersection: a value drawn once and selected twice counts once. */
  const pool = [...drawn];
  let matched = 0;
  for (const v of selection) {
    const at = pool.indexOf(v);
    if (at !== -1) {
      pool.splice(at, 1);
      matched++;
    }
  }
  return { ...base, matched, orderedExact: null };
}

/** Whether the same digits appear in a different order — only asked of an ordered group. */
export function sameValuesDifferentOrder(
  selection: readonly number[],
  drawn: readonly number[],
): boolean {
  if (selection.length !== drawn.length) return false;
  const exact = selection.every((v, i) => v === drawn[i]);
  if (exact) return false;
  return [...selection].sort().join(",") === [...drawn].sort().join(",");
}
