/*
 * Game-family PRESENTATION model — generic, configuration-driven.
 *
 * Task LRG-STATE-030. Authority: `FD-N-01` (hub density; related variants grouped under one game
 * identity), `FD-X-06` (frequent-draw variants grouped, never exploded), `FD-X-01` (one State family —
 * nothing here branches on a state code), `FD-S-01`/`FD-S-02` (never fabricate a result).
 *
 * THE PROBLEM THIS SOLVES, AND THE BOUNDARY IT RESPECTS.
 *
 * The legacy database and the production feed store each variant as its OWN game record: `Pick 3 Midday`
 * and `Pick 3 Evening` are separate games with separate ids, results, schedules, histories, sources and
 * archive URLs. That is the domain model and **this module does not change it**. No schema, no API, no feed
 * shape is altered, and no member record is merged into a synthetic parent.
 *
 * What this module adds is a **presentation layer**: a family surface that groups related member games so
 * the page renders one `Pick 3` card containing stable rows, instead of two equal-weight cards.
 *
 * VOCABULARY. Members are **member games** / **game variants** with a **variant label**. They are NOT
 * "draw periods" in the domain model — each is an independently identified game record that happens to be
 * drawn at a particular time.
 *
 * TWO RULES THAT MATTER MOST
 *
 *   1. **Stable configured order.** Member rows render in `memberDisplayOrder`, never re-sorted by which
 *      result is newest. A reader scanning `Pick 3` should find Midday in the same place every visit.
 *
 *   2. **Each member keeps its OWN latest verified result.** Before the evening draw, Midday legitimately
 *      shows today and Evening shows yesterday. Differing dates are correct, not a bug — and an empty row
 *      would be worse than an older one. A pending/awaiting/delayed/corrected state for today is shown
 *      ALONGSIDE the last verified result, never instead of it, and never fabricated.
 */

import type { ResultStatus } from "./formatCoverage";

/* ------------------------------------------------------------------ configuration */

/** One member game inside a family. Configuration only — no result data. */
export interface FamilyMemberConfig {
  /** The member game's own id, exactly as the feed and database carry it. Never rewritten. */
  gameId: number;
  /** Short label distinguishing this member within its family, e.g. "Midday". */
  variantLabel: string;
  /** Position in the family surface. Stable and independent of result recency. */
  displayOrder: number;
}

/** A family surface. Composition is data, so no component needs a jurisdiction branch. */
export interface GameFamilyConfig {
  familyId: string;
  familyLabel: string;
  /** Visual identity token. Resolved to a mark by CSS/token, never an inline asset here. */
  visualIdentity?: string;
  /** PF-02 §15 presentation group this family belongs to. */
  group: "multiState" | "stateOnly" | "dailyVariants" | "specialized";
  members: readonly FamilyMemberConfig[];
  /** Format registry key, shared by every member of the family. */
  formatGameKey: string;
  /** Family-level history destination. One per family, never one per member row. */
  historyHref?: string;
  /** Whether this family may show a family-level Buy Now (subject to the commerce resolver). */
  buyNowEligible: boolean;
  /** Family-level AI context key, when the family warrants a contextual entry at all. */
  aiContextKey?: string;
  /** Ordering weight within its group. Lower sorts first. Not a desirability signal. */
  priority: number;
  retired?: boolean;
}

/* ------------------------------------------------------------------ resolved view */

/** One drawn value group, as rendered. */
export interface MemberBallGroup {
  label: string | null;
  values: number[];
  colorToken: string;
  /** Non-colour role, so a special or add-on value is never distinguished by hue alone. */
  visualRole: "main" | "special" | "addOn";
  accessibleLabel?: string;
}

/**
 * A member row, resolved. Everything here belongs to the member game itself.
 *
 * `currentStatus` is separate from `result` on purpose: a pending evening draw must not blank the row.
 */
export interface ResolvedMember {
  /** The member game's own id — preserved end to end. */
  gameId: number;
  variantLabel: string;
  displayOrder: number;
  /** The member's OWN latest verified result. `null` only when it genuinely has none. */
  result: {
    drawDateIso: string;
    drawDateDisplay: string;
    groups: MemberBallGroup[];
    status: ResultStatus;
    /**
     * The published multiplier for this draw, with HOW it is obtained (LRG-STATE-036 §6).
     *
     * Carried through the presentation layer because it was silently dropped before: the feed held
     * `{ label: "Power Play", value: 4 }` and the State page rendered nothing, while Home rendered it. The
     * `kind` comes from the governed format so Power Play (chosen and paid for) is never confused with the
     * built-in Mega Millions multiplier.
     */
    multiplier: {
      label: string;
      value: number;
      kind: "independentlySelected" | "builtIn" | "unavailable" | "notApplicable";
    } | null;
  } | null;
  /**
   * A non-verified state for a more recent draw — pending, awaiting, delayed or corrected. Rendered in
   * addition to `result`, never in place of it.
   */
  currentStatus: { status: ResultStatus; detail: string } | null;
  /** The member's own schedule facts. */
  drawTimeLocal: string | null;
  drawDays: string;
  /** The member's own archive destination. `null` when no route exists (`FD-S-30`). */
  historyHref: string | null;
  sourceName: string;
}

export interface ResolvedFamily {
  familyId: string;
  familyLabel: string;
  visualIdentity?: string;
  group: GameFamilyConfig["group"];
  formatGameKey: string;
  /** In configured order. Never re-sorted by recency. */
  members: ResolvedMember[];
  memberCount: number;
  historyHref?: string;
  buyNowEligible: boolean;
  aiContextKey?: string;
  priority: number;
  /** Aggregate freshness: the newest verified draw date across members. */
  newestVerifiedDateIso: string | null;
  /** True when any member has a non-verified current state. */
  hasOpenStatus: boolean;
  /** Jackpot/prize summary, only where the format and feed supply a labelled one. */
  prizeSummary?: { label: string; value: string; cashValue?: string };
  /** Secondary draw (Double Play), attached to the family's own result — not a member row. */
  secondary?: { label: string; groups: MemberBallGroup[] } | null;
}

/* ------------------------------------------------------------------ resolution */

/** What a caller must supply per member game. Deliberately minimal and source-agnostic. */
export interface MemberResultInput {
  gameId: number;
  drawDateIso: string | null;
  drawDateDisplay: string;
  groups: MemberBallGroup[];
  status: ResultStatus;
  multiplier?: {
    label: string;
    value: number;
    kind: "independentlySelected" | "builtIn" | "unavailable" | "notApplicable";
  } | null;
  currentStatus?: { status: ResultStatus; detail: string } | null;
  drawTimeLocal: string | null;
  drawDays: string;
  historyHref?: string | null;
  sourceName: string;
  prizeSummary?: { label: string; value: string; cashValue?: string };
  secondary?: { label: string; groups: MemberBallGroup[] } | null;
}

/**
 * Resolve one family surface.
 *
 * Members are emitted in configured order. A member with no verified result is emitted with
 * `result: null` — the row still exists, because a missing row would silently change the family's shape
 * between visits, and inventing a result is prohibited.
 */
export function resolveFamily(
  config: GameFamilyConfig,
  inputs: readonly MemberResultInput[],
): ResolvedFamily {
  const byId = new Map(inputs.map((i) => [i.gameId, i]));

  const members: ResolvedMember[] = [...config.members]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => {
      const input = byId.get(m.gameId);
      return {
        gameId: m.gameId,
        variantLabel: m.variantLabel,
        displayOrder: m.displayOrder,
        result:
          input && input.drawDateIso
            ? {
                drawDateIso: input.drawDateIso,
                drawDateDisplay: input.drawDateDisplay,
                groups: input.groups,
                status: input.status,
                multiplier: input.multiplier ?? null,
              }
            : null,
        currentStatus: input?.currentStatus ?? null,
        drawTimeLocal: input?.drawTimeLocal ?? null,
        drawDays: input?.drawDays ?? "",
        historyHref: input?.historyHref ?? null,
        sourceName: input?.sourceName ?? "",
      };
    });

  const dates = members.map((m) => m.result?.drawDateIso).filter((d): d is string => Boolean(d));
  /* The family's prize/secondary summary comes from its FIRST configured member that supplies one —
     a family-level fact, not a per-row one. */
  const withSummary = [...config.members]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => byId.get(m.gameId))
    .find((i) => i?.prizeSummary || i?.secondary);

  return {
    familyId: config.familyId,
    familyLabel: config.familyLabel,
    visualIdentity: config.visualIdentity,
    group: config.group,
    formatGameKey: config.formatGameKey,
    members,
    memberCount: members.length,
    historyHref: config.historyHref,
    buyNowEligible: config.buyNowEligible,
    aiContextKey: config.aiContextKey,
    priority: config.priority,
    newestVerifiedDateIso: dates.length > 0 ? dates.sort().reverse()[0] : null,
    hasOpenStatus: members.some((m) => m.currentStatus !== null),
    ...(withSummary?.prizeSummary ? { prizeSummary: withSummary.prizeSummary } : {}),
    ...(withSummary?.secondary ? { secondary: withSummary.secondary } : {}),
  };
}

/* ------------------------------------------------------------------ selection */

/**
 * The order native groups are presented in on the State page.
 *
 * Declared here because it is also the last meaningful tiebreak in `selectFirstNativeFamily` — see below.
 * `StateFamilySurface` renders its headed groups in this same order, so the rule that picks the leading family
 * and the order the reader actually sees cannot drift apart.
 */
const NATIVE_GROUP_RANK: Record<string, number> = { stateOnly: 0, dailyVariants: 1, specialized: 2 };

/**
 * Choose the first State-native family to lead the page.
 *
 * Deterministic and in this order: an open urgent status → newest verified result → configured priority →
 * native group order → family id. **Jackpot size is not a factor at any point** (`FD-N-02`, `FD-X-06`), and
 * multi-state families are excluded from this selection entirely so Powerball can never lead on jackpot alone.
 *
 * WHY THE LAST TWO KEYS EXIST — LRG-STATE-037 FV-02.
 *
 * FV-02 keeps this rule but requires it to be deterministic. The first three keys were NOT a total order on the
 * real Florida data: Fantasy 5 (`dailyVariants`, priority 1) and Cash Pop (`specialized`, priority 1) both draw
 * daily and therefore tie on all three. `priority` is scoped WITHIN a group in the config, so comparing 1 against
 * 1 across two groups compares nothing. `Array.prototype.sort` is stable, so the winner was decided by the order
 * the families happened to arrive in — reversing the input array changed which family led the page.
 *
 * In practice the config order is fixed, so the page was stable; but "stable because the input never varies" is
 * not the same as deterministic, and a feed or config reordering would silently have changed the top of the page.
 *
 * The added keys are meaningful rather than arbitrary. Native group order is the order the reader already sees
 * further down the same section, and the family id is a total, immutable last resort. Both preserve the current
 * accepted outcome (Fantasy 5 leads Florida) — this closes a tie, it does not change today's hierarchy.
 */
export function selectFirstNativeFamily(families: readonly ResolvedFamily[]): ResolvedFamily | undefined {
  const native = families.filter((f) => f.group !== "multiState");
  if (native.length === 0) return undefined;
  return [...native].sort((a, b) => {
    if (a.hasOpenStatus !== b.hasOpenStatus) return a.hasOpenStatus ? -1 : 1;
    const d = (b.newestVerifiedDateIso ?? "").localeCompare(a.newestVerifiedDateIso ?? "");
    if (d !== 0) return d;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const g = (NATIVE_GROUP_RANK[a.group] ?? 9) - (NATIVE_GROUP_RANK[b.group] ?? 9);
    if (g !== 0) return g;
    return a.familyId.localeCompare(b.familyId);
  })[0];
}

/** Families in a PF-02 presentation group, ordered by configured priority. */
export function familiesInGroup(
  families: readonly ResolvedFamily[],
  group: GameFamilyConfig["group"],
): ResolvedFamily[] {
  return families.filter((f) => f.group === group).sort((a, b) => a.priority - b.priority);
}

/**
 * Choose a responsive layout from the member count alone.
 *
 * This is what keeps the component generic: no component asks "is this Cash Pop?", it asks how many members
 * there are. A 2-member family and a 5-member family get different desktop treatments from the same code.
 */
export function memberLayout(memberCount: number): "single" | "rows" | "columns" {
  if (memberCount <= 1) return "single";
  if (memberCount <= 3) return "rows";
  return "columns";
}

/* ------------------------------------------------------------------ guards */

/**
 * Assert the presentation layer has not corrupted domain identity.
 *
 * Run as a build/test guard. Every configured member id must appear exactly once across all families —
 * a duplicate would mean one game record rendering in two places, and a missing one would mean a silently
 * dropped game.
 */
export function assertMemberIdentityPreserved(
  configs: readonly GameFamilyConfig[],
  expectedGameIds: readonly number[],
): void {
  const seen = new Map<number, string>();
  for (const c of configs) {
    for (const m of c.members) {
      const prior = seen.get(m.gameId);
      if (prior) {
        throw new Error(
          `Game family: member game ${m.gameId} is claimed by both "${prior}" and "${c.familyId}". ` +
            `Each game record belongs to exactly one family surface.`,
        );
      }
      seen.set(m.gameId, c.familyId);
    }
  }
  for (const id of expectedGameIds) {
    if (!seen.has(id)) {
      throw new Error(`Game family: game ${id} exists in the source data but no family surface claims it.`);
    }
  }
}

/** Assert configured member order is a clean sequence, so rows cannot silently reshuffle. */
export function assertStableMemberOrder(configs: readonly GameFamilyConfig[]): void {
  for (const c of configs) {
    const orders = c.members.map((m) => m.displayOrder);
    if (new Set(orders).size !== orders.length) {
      throw new Error(`Game family "${c.familyId}" has duplicate displayOrder values.`);
    }
    if (c.members.length > 1) {
      for (const m of c.members) {
        if (!m.variantLabel || m.variantLabel.trim() === "") {
          throw new Error(
            `Game family "${c.familyId}" member ${m.gameId} needs a variantLabel — a multi-member family ` +
              `must never render an unlabelled row.`,
          );
        }
      }
    }
  }
}
