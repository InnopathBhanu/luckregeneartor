/*
 * CARRYING SEARCH AND VARIANT FILTERS ACROSS ARCHIVE YEARS — LRG-ARCHIVE-055.
 *
 * Authority: the 2026-08-05 founder correction direction (*"Changing year should preserve applicable search and
 * draw-variant filters"*, *"Reset the month only if that month is unavailable in the destination year"*);
 * archive blueprint §31 and brief §13 (*"filter/sort states not independently indexable"*, no crawl trap).
 *
 * ══ THE TENSION, AND WHY THE HASH RESOLVES IT ══
 *
 * Two requirements pull in opposite directions:
 *
 *   - Filters must SURVIVE a year change, or a reader searching `378` across years has to retype it each time.
 *   - Filter state must NOT be independently indexable. A `?month=03&variant=332` link is a crawlable URL, and a
 *     few such controls multiply into thousands of near-duplicate pages — the crawl trap blueprint §31 forbids.
 *
 * A URL **fragment** satisfies both. It survives navigation because the browser carries it, and it is invisible to
 * crawling and indexing: a fragment is never sent to the server, `#f=...` is not a separate document to Google,
 * and no link on the page exposes a query parameter a crawler could follow into a filtered variant.
 *
 * So the year links carry `#f=<encoded>` and the destination workspace restores from it on mount. The page's
 * canonical content is unchanged and unfiltered; the fragment is a courtesy to a human mid-search.
 *
 * ══ WHAT IS AND IS NOT CARRIED ══
 *
 * Carried: the typed number per group, the match mode, the drawing variant, the pattern, the sum band, the sort.
 * These are properties of the QUESTION a reader is asking, and the question does not change because the year did.
 *
 * NOT carried: the month. A month is a property of the year being viewed — `2026-03` is meaningless in 2023 — so
 * the month is remapped to the same calendar month in the destination and dropped when that month holds no
 * drawings there. That is the founder's rule stated exactly: reset only when unavailable.
 *
 * NOT carried either: the variant, when the destination family does not contain that member id. A game id is
 * specific to a member, and carrying `332` into a family that never had it would silently filter every row out.
 */

/** The subset of filter state worth carrying between years. Deliberately small and all reader-authored. */
export interface CarriedFilter {
  /** Raw per-group entry, as typed. Strings, so a leading zero survives the round trip. */
  raw?: Record<string, string[]>;
  orderMode?: "exact" | "any";
  /** A member game id, or `"all"`. Dropped when the destination family lacks the id. */
  variant?: string;
  shape?: string;
  sumFrom?: string;
  sumTo?: string;
  sort?: "newest" | "oldest";
  /** The 1-based calendar month, not a `YYYY-MM` key — the year part is re-derived at the destination. */
  month?: number;
}

const PREFIX = "f=";

/**
 * Encode a carried filter into a URL fragment value.
 *
 * Returns an empty string when nothing is worth carrying, so a caller can append unconditionally without
 * producing a bare `#f=` on every link. Compact JSON rather than a bespoke format: the payload is small, and a
 * hand-rolled encoding would be one more thing that can disagree with its own parser.
 */
export function encodeCarriedFilter(f: CarriedFilter): string {
  const trimmed: CarriedFilter = {};
  if (f.raw) {
    /* Only groups the reader actually filled in. An object full of empty arrays is not a filter. */
    const raw: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(f.raw)) {
      if (v.some((s) => s.trim() !== "")) raw[k] = v;
    }
    if (Object.keys(raw).length > 0) trimmed.raw = raw;
  }
  if (f.orderMode && f.orderMode !== "exact") trimmed.orderMode = f.orderMode;
  if (f.variant && f.variant !== "all") trimmed.variant = f.variant;
  if (f.shape) trimmed.shape = f.shape;
  if (f.sumFrom) trimmed.sumFrom = f.sumFrom;
  if (f.sumTo) trimmed.sumTo = f.sumTo;
  if (f.sort && f.sort !== "newest") trimmed.sort = f.sort;
  if (f.month) trimmed.month = f.month;

  if (Object.keys(trimmed).length === 0) return "";
  return PREFIX + encodeURIComponent(JSON.stringify(trimmed));
}

/**
 * Decode a fragment back into a carried filter.
 *
 * Tolerant by design: a malformed, truncated or hand-edited fragment returns `{}` rather than throwing. A reader
 * who mangles a URL should see the unfiltered year, not an error — the fragment is a convenience, and nothing on
 * the page depends on it being well formed.
 */
export function decodeCarriedFilter(hash: string): CarriedFilter {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(PREFIX)) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.slice(PREFIX.length)));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as CarriedFilter;
  } catch {
    return {};
  }
}

/**
 * Apply a carried filter to a destination year, dropping what does not survive.
 *
 * `availableMonths` is the destination year's months that actually hold drawings, and `memberIds` is the
 * destination family's member ids. Both are the destination's own facts, so this function cannot carry a filter
 * into a year or a family that cannot honour it.
 */
export function applyCarriedFilter(
  f: CarriedFilter,
  destinationYear: number,
  availableMonths: readonly number[],
  memberIds: readonly number[],
): { carried: CarriedFilter; monthKey: string | null; droppedMonth: boolean; droppedVariant: boolean } {
  const carried: CarriedFilter = { ...f };

  /* The month survives only when the SAME calendar month holds drawings in the destination year. */
  const monthSurvives = f.month !== undefined && availableMonths.includes(f.month);
  const droppedMonth = f.month !== undefined && !monthSurvives;
  if (droppedMonth) delete carried.month;

  /* The variant survives only when the destination family actually has that member. */
  const variantSurvives =
    f.variant === undefined || f.variant === "all" || memberIds.includes(Number(f.variant));
  const droppedVariant = !variantSurvives;
  if (droppedVariant) delete carried.variant;

  return {
    carried,
    monthKey: monthSurvives ? `${destinationYear}-${String(f.month).padStart(2, "0")}` : null,
    droppedMonth,
    droppedVariant,
  };
}
