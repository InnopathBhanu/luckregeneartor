/*
 * State result-format contract — GENERIC, VERSIONED, SOURCE-BACKED.
 *
 * Task LRG-STATE-029. Authority: `FD-S-10` (format-driven rendering; never a hardcoded ball count),
 * `FD-S-09` (closed status union), `FD-S-14` (three-signal special balls), `FD-S-01`/`FD-S-02` (nothing
 * unsourced publishes), `FD-X-01` (one State family — nothing here branches on a state code),
 * `CLAUDE.md` §14 (date-effective format rules; game-local draw dates).
 *
 * WHY THIS EXISTS. The accepted national research found that `PLAY_TYPE` plus sibling-format cloning is
 * **not** sufficient for production correctness wherever a game has date-effective rule changes,
 * multipliers, add-ons, independently drawn secondary results, purchase-time add-ons, stake-dependent
 * prizes, or a retirement. `04-sample-data/result-format-definitions.json` cannot express any of those
 * distinctions: its `addOns` is `{key,label}` with no class, its `multipliers` has no kind, it carries no
 * prize semantics, no verification status and no retirement relationship. This module supplies the missing
 * contract.
 *
 * THE FIVE DISTINCTIONS THIS MODULE ENFORCES
 *
 *   1. PRIMARY RESULT      — the official winning-number structure of the main draw.
 *   2. SECONDARY DRAWING   — a separately drawn result (Double Play). Own numbers, own label, own status,
 *                            own prize structure. NOT extra balls on the parent.
 *   3. DRAWN ADD-ON        — an additional officially drawn value (Fireball). It HAS a drawn value, so it
 *                            renders — but never as an ordinary main ball.
 *   4. PURCHASE-TIME ADD-ON— an option resolved at purchase, not by a scheduled draw (EZmatch, Combo).
 *                            It has NO drawn value and MUST NEVER render as a winning-number group.
 *   5. PRIZE SEMANTICS     — an unlabelled money string is not a fact. Every prize declares its kind.
 *
 * DETERMINISTIC DATE-EFFECTIVE SELECTION. A result is rendered with the format version valid **on its own
 * draw date**, never with the currently-active version. Ranges may not overlap. See `selectFormatVersion`.
 */

/* ------------------------------------------------------------------ verification */

/**
 * How well a format version is evidenced. **Only `verifiedOfficial` may publish publicly.**
 *
 * `provisionalCloned` exists to name what LRG-STATE-025 produced: twelve Florida definitions cloned from
 * verified siblings using production `PLAY_TYPE`. Adequate for an internal visual review, and explicitly
 * not adequate for production (`FD-N-12` makes verified result coverage a cutover prerequisite).
 */
export type FormatVerification =
  | "verifiedOfficial"
  | "provisionalCloned"
  | "provisionalProductionDerived"
  | "underReview"
  | "unavailable";

/** A primary official source for one rule, with everything needed to re-verify it. */
export interface RuleSource {
  /** Official operator or game-owner URL. Never a competitor or proposed design. */
  url: string;
  /** ISO date the source was read. */
  accessed: string;
  /** The exact fact this source supports — quoted or closely paraphrased. */
  supports: string;
  /** Where the rule takes effect, when the source states one. */
  effectiveDate?: string;
  /** What the rule governs, so a reviewer knows which surfaces a change affects. */
  governs: readonly (
    | "resultRendering"
    | "purchaseOptions"
    | "prizePresentation"
    | "schedule"
    | "retiredState"
  )[];
}

/* ------------------------------------------------------------------ ball groups */

export type BallValueType = "number" | "digit" | "card";

/** One group of drawn values. `count` drives rendering — never a hardcoded literal. */
export interface BallGroupSpec {
  order: number;
  /** `null` for the main group. A special group MUST carry a label (`FD-S-14` signal 1). */
  label: string | null;
  valueType: BallValueType;
  count: number;
  min: number;
  max: number;
  /** Drawn from an independent pool, so values may repeat the main group's. */
  differentSet: boolean;
  colorToken: string;
  /** Screen-reader name. Required whenever `label` is set (`FD-S-14` signal 3). */
  accessibleLabel?: string;
  /**
   * The non-colour visual distinction (`FD-S-14` signal 2). Colour alone is insufficient — measured
   * separation between special-ball tokens is 1.09–1.30:1.
   */
  visualRole?: "main" | "special" | "addOn" | "secondary";

  /* ---------------------------------------------------------------- matching semantics (LRG-GAME-052) */

  /**
   * Whether TICKET MATCHING is position-sensitive for this group.
   *
   * ══ THIS IS NOT THE SAME QUESTION AS STORED ORDER, AND CONFLATING THEM IS THE BUG ══
   *
   * Every drawn group has a stored order — the order the operator's feed supplied, which this codebase
   * preserves end to end and never sorts. That order is a DISPLAY fact.
   *
   * Whether a ticket matches *in* that order is a RULES fact, and the two genuinely diverge:
   *
   *   - Pick 3 stores `3, 7, 8` and a Straight play must match those positions → `matchOrdered: true`.
   *   - SuperLotto Plus stores `18, 22, 28, 33, 38` and a ticket matches on the SET, whichever order the
   *     player wrote them → `matchOrdered: false`, while the page still shows the supplied order.
   *
   * So this field must be DECLARED from the game's rules. It must never be inferred from the stored array,
   * because a ball game's ascending feed order looks exactly like a positional one.
   *
   * `undefined` means undeclared, not "false". `resolveGroupSemantics` reports which it is, so a game with
   * missing metadata surfaces in the record instead of quietly getting a default.
   */
  matchOrdered?: boolean;

  /**
   * Whether the same value may legitimately appear more than once in this group.
   *
   * True for digit games (`5-5-7` is a real Pick 3 result); false for a single-pool ball draw. Needed by the
   * generator, which must not emit an impossible set, and by the search, which must reject a duplicate the
   * game cannot produce.
   *
   * `undefined` means undeclared. Same reporting rule as `matchOrdered`.
   */
  repeatsAllowed?: boolean;
}

/* ------------------------------------------------------------------ resolved matching semantics */

/** Where a piece of matching metadata came from. Reported so an absence is visible rather than silent. */
export type SemanticsSource = "declared" | "defaulted";

export interface GroupSemantics {
  matchOrdered: boolean;
  repeatsAllowed: boolean;
  matchOrderedSource: SemanticsSource;
  repeatsAllowedSource: SemanticsSource;
}

/**
 * Resolve a group's matching semantics, saying whether each answer was declared or defaulted.
 *
 * ══ THE FALLBACK IS A SAFETY NET, NOT THE DESIGN (CORRECTED, LRG-GAME-053) ══
 *
 * Every group a format registry builds now declares both fields explicitly, through the named constructors in
 * this module (`orderedDigitPositions`, `unorderedNumberPool`, `singleValueGroup`). Each constructor states the
 * semantics as a verified rules fact rather than deriving them.
 *
 * The fallback below exists only so that a hand-written or partially-transcribed spec still resolves instead of
 * throwing — and it is always reported as `defaulted`, so `undeclaredSemantics` names it. It keys off
 * `valueType`, which is at least a declared format property; it never reads the stored result array, which is
 * the inference this contract exists to forbid.
 *
 * ══ WHAT CHANGED ══
 *
 * A previous revision reported an undeclared SINGLE-value group as `declared`, reasoning that order and
 * repetition are unobservable in a group of one. That reasoning is sound about the semantics and wrong about
 * the reporting: saying "declared" about something nobody declared hides an incomplete transcription. Absence
 * is now reported as absence for every group, and the constructors make sure no representative format has any.
 */
export function resolveGroupSemantics(g: BallGroupSpec): GroupSemantics {
  const single = g.count === 1;
  const orderedDefault = single ? false : g.valueType === "digit";
  const repeatsDefault = single ? false : g.valueType === "digit";
  return {
    matchOrdered: g.matchOrdered ?? orderedDefault,
    repeatsAllowed: g.repeatsAllowed ?? repeatsDefault,
    matchOrderedSource: g.matchOrdered !== undefined ? "declared" : "defaulted",
    repeatsAllowedSource: g.repeatsAllowed !== undefined ? "declared" : "defaulted",
  };
}

/* ------------------------------------------------------------------ named semantic constructors */

/*
 * WHY THESE EXIST (LRG-GAME-053).
 *
 * Both format registries previously built their main group with one helper that computed the semantics:
 *
 *     matchOrdered: valueType === "digit",
 *     repeatsAllowed: valueType === "digit",
 *
 * Every field was populated, so `undeclaredSemantics()` reported a clean sheet — and the values were still a
 * DERIVATION, one level of indirection away from the inference the contract forbids. `valueType` is a
 * presentation property: it says a value renders as a digit. It does not say a Straight play must match by
 * position, and the two are not the same claim. A jurisdiction that ever draws digits from a pool without
 * repetition, or numbers positionally, would have silently received the wrong matching rule while appearing
 * fully declared.
 *
 * These constructors carry the semantics in their NAME. A registry author picks the one describing the game's
 * verified rules, and a reviewer reads the rule off the call site. Nothing is computed.
 */

/** Fields every constructor here fills in identically; callers vary only what the game's rules vary. */
type GroupShape = Omit<BallGroupSpec, "matchOrdered" | "repeatsAllowed">;

/**
 * A positional digit game: a Straight play must match each POSITION, and the same digit may repeat.
 *
 * Florida Pick 3 draws `5-5-7`. Both facts are published rules, not observations of the stored array.
 */
export function orderedDigitPositions(shape: GroupShape): BallGroupSpec {
  return { ...shape, matchOrdered: true, repeatsAllowed: true };
}

/**
 * A single-pool ball draw: a ticket matches on the SET in any order, and no value can repeat.
 *
 * SuperLotto Plus stores `18, 22, 28, 33, 38` ascending and a ticket matching `38, 22, 18, 33, 28` wins. The
 * page still shows the supplied order — display order and matching order are separate concerns.
 */
export function unorderedNumberPool(shape: GroupShape): BallGroupSpec {
  return { ...shape, matchOrdered: false, repeatsAllowed: false };
}

/**
 * A group of exactly one value — a named special ball, or a one-number game such as Cash Pop.
 *
 * Order and repetition are unobservable in a group of one, so both are `false`. This constructor DECLARES that
 * rather than leaving it to a default, which is the difference between a reviewed answer and an accident.
 */
export function singleValueGroup(shape: GroupShape): BallGroupSpec {
  return { ...shape, matchOrdered: false, repeatsAllowed: false };
}

/** Every group in a format whose matching semantics are still defaulted. Reported, never silently accepted. */
export function undeclaredSemantics(v: ResultFormatVersion): { group: string; missing: string[] }[] {
  const out: { group: string; missing: string[] }[] = [];
  for (const g of renderableGroups(v)) {
    const s = resolveGroupSemantics(g);
    const missing: string[] = [];
    if (s.matchOrderedSource === "defaulted") missing.push("matchOrdered");
    if (s.repeatsAllowedSource === "defaulted") missing.push("repeatsAllowed");
    if (missing.length > 0) out.push({ group: g.label ?? "main", missing });
  }
  return out;
}

/* ------------------------------------------------------------------ multiplier */

/**
 * How a multiplier is obtained. The distinction is user-visible and legally material:
 * a player *chooses* Power Play and pays for it, whereas the current Mega Millions multiplier is
 * included automatically and cannot be declined.
 */
export type MultiplierKind =
  | "independentlySelected"
  | "builtIn"
  | "unavailable"
  | "notApplicable";

export interface MultiplierSpec {
  kind: MultiplierKind;
  /** Absent for `unavailable` / `notApplicable`. */
  label?: string;
  /** Published multiplier values, when the operator states them. */
  values?: readonly number[];
  /** Any published condition, e.g. a 10× tier gated on jackpot size. */
  conditionNote?: string;
  /** Extra cost per play, where the operator publishes one. */
  extraCostNote?: string;
  sources: readonly RuleSource[];
}

/* ------------------------------------------------------------------ add-ons */

/**
 * The distinction the research identified as missing, and the one most likely to publish a false fact.
 *
 * `drawn`        — officially drawn, has a value on every draw (Fireball). Renders as its own labelled
 *                  group, never merged into the main row.
 * `purchaseTime` — resolved at purchase; there is no drawn value to show (EZmatch, Combo). **Rendering it
 *                  as a winning-number group would fabricate a result.** It belongs to game rules,
 *                  ticket/purchase configuration and Buy Now explanation only.
 */
export type AddOnClass = "drawn" | "purchaseTime";

export interface AddOnSpec {
  key: string;
  label: string;
  addOnClass: AddOnClass;
  /** Only meaningful for `drawn` add-ons. */
  drawnGroup?: BallGroupSpec;
  /**
   * What the add-on actually does. For a `drawn` wild card such as Fireball this states that it REPLACES a
   * drawn number rather than adding one — the semantic that makes it not-a-main-ball.
   */
  mechanicNote: string;
  extraCostNote?: string;
  /** Published prize ceiling for the add-on itself, where stated. */
  addOnPrizeNote?: string;
  sources: readonly RuleSource[];
}

/* ------------------------------------------------------------------ prize semantics */

/**
 * Prize kinds. **A bare money string is not a publishable fact** — Texas publishes
 * "Est. Annuitized Jackpot" with a companion "Est. Cash Value" for some games and "Current Advertised
 * Jackpot" for others, and Florida's Cash Pop prize depends entirely on the player's stake.
 */
export type PrizeKind =
  | "estimatedAnnuitizedJackpot"
  | "estimatedCashValue"
  | "advertisedJackpot"
  | "fixedTopPrize"
  | "variableTopPrize"
  | "stakeDependentPrize"
  | "noJackpot"
  | "unavailable";

export interface PrizeSpec {
  kind: PrizeKind;
  /** Present only when a cash value is separately published. Never derived by us. */
  cashValueAvailable: boolean;
  /**
   * Required for `stakeDependentPrize`: the prize cannot be stated without the player's stake, so any
   * single figure is meaningless on its own.
   */
  stakeOptions?: readonly string[];
  /** Published multiplier range applied to the stake, for stake-dependent games. */
  stakeMultiplierRange?: { min: number; max: number };
  /** Rolldown / pari-mutuel behaviour, where published. */
  variabilityNote?: string;
  sources: readonly RuleSource[];
}

/* ------------------------------------------------------------------ secondary draw */

/** A separately drawn result. It is a result in its own right, with its own prize structure. */
export interface SecondaryDrawSpec {
  key: string;
  label: string;
  /** Its own drawn structure — not inherited from the parent. */
  groups: readonly BallGroupSpec[];
  /** Its own prize structure, which routinely differs from the parent's. */
  prize: PrizeSpec;
  /** Published relationship to the parent draw, e.g. "held immediately after". */
  timingNote: string;
  extraCostNote?: string;
  sources: readonly RuleSource[];
}

/* ------------------------------------------------------------------ retirement */

/**
 * Retired-game handling. A retired game must leave current surfaces **without** destroying history:
 * historical result pages stay resolvable, and no valid historical URL may 404.
 */
export interface RetirementSpec {
  retiredOn: string;
  /** Last draw date that produced a valid result, when published. */
  lastValidDraw?: string;
  /** Published claim window after a winning draw date. */
  claimWindowNote?: string;
  /** Officially identified replacement game, if any. `null` when the operator names none. */
  replacementGameId: number | null;
  /** History must remain reachable — this is what prevents an accidental 404. */
  retainHistoricalResults: true;
  sources: readonly RuleSource[];
}

/* ------------------------------------------------------------------ the format version */

/** One date-effective version of one game's result format. */
export interface ResultFormatVersion {
  formatId: number;
  /** Stable identity of the game across versions. */
  gameKey: string;
  displayName: string;
  schemaVersion: string;
  /** `null` means "from the beginning of recorded results". */
  effectiveFrom: string | null;
  /** `null` means "currently active". */
  effectiveTo: string | null;
  primaryGroups: readonly BallGroupSpec[];
  multiplier: MultiplierSpec;
  addOns: readonly AddOnSpec[];
  secondaryDraws: readonly SecondaryDrawSpec[];
  prize: PrizeSpec;
  /** Statuses this format can legitimately render (`FD-S-09` closed union). */
  compatibleStatuses: readonly string[];
  verification: FormatVerification;
  sources: readonly RuleSource[];
  /** Set when the game itself is retired. */
  retirement?: RetirementSpec;
  /** Set when this version was superseded by another format id. */
  supersededBy?: number;
}

/* ------------------------------------------------------------------ selection */

/** Inclusive-start, inclusive-end containment for a plain ISO date. */
function coversDate(v: ResultFormatVersion, isoDate: string): boolean {
  if (v.effectiveFrom && isoDate < v.effectiveFrom) return false;
  if (v.effectiveTo && isoDate > v.effectiveTo) return false;
  return true;
}

/**
 * Select the format version valid on a specific draw date — deterministic, and never "the newest".
 *
 * `CLAUDE.md` §14: "year and date routes MUST reflect the game-local draw date". A 2024 Mega Millions
 * result must render with the pre-2025 format, not with the current one, or its multiplier and ball ranges
 * would be misrepresented.
 *
 * Throws when a date resolves ambiguously — a silent wrong pick is the failure mode worth preventing.
 */
export function selectFormatVersion(
  versions: readonly ResultFormatVersion[],
  gameKey: string,
  drawDateIso: string,
): ResultFormatVersion | undefined {
  const matches = versions.filter((v) => v.gameKey === gameKey && coversDate(v, drawDateIso));
  if (matches.length > 1) {
    throw new Error(
      `Result format: ${gameKey} resolves to ${matches.length} versions on ${drawDateIso} ` +
        `(${matches.map((m) => m.formatId).join(", ")}). Effective ranges must not overlap.`,
    );
  }
  return matches[0];
}

/**
 * Assert that no two versions of the same game overlap in effect.
 *
 * Run as a build/test guard. Overlap is the defect that makes `selectFormatVersion` ambiguous, and it is
 * far easier to catch here than from a wrong historical result.
 */
export function assertNoOverlappingVersions(versions: readonly ResultFormatVersion[]): void {
  const byGame = new Map<string, ResultFormatVersion[]>();
  for (const v of versions) byGame.set(v.gameKey, [...(byGame.get(v.gameKey) ?? []), v]);

  for (const [gameKey, list] of byGame) {
    const sorted = [...list].sort((a, b) =>
      (a.effectiveFrom ?? "0000-00-00").localeCompare(b.effectiveFrom ?? "0000-00-00"),
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev.effectiveTo === null) {
        throw new Error(
          `Result format: ${gameKey} version ${prev.formatId} is open-ended but ${cur.formatId} also ` +
            `applies from ${cur.effectiveFrom}. Close the earlier range.`,
        );
      }
      if (cur.effectiveFrom && prev.effectiveTo >= cur.effectiveFrom) {
        throw new Error(
          `Result format: ${gameKey} versions ${prev.formatId} and ${cur.formatId} overlap ` +
            `(${prev.effectiveTo} >= ${cur.effectiveFrom}).`,
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ publication gate */

export interface FormatGateFinding {
  formatId: number;
  gameKey: string;
  reason: string;
}

/**
 * The public publication gate for result formats.
 *
 * Returns the findings that must block a **public** render. The guarded internal preview may show a
 * clearly identified under-review state instead — but a badge never converts an unverified fact into a
 * publishable one (`FD-S-01`, `FD-S-02`).
 */
export function formatPublicationFindings(
  versions: readonly ResultFormatVersion[],
  /** Draw date under consideration, used to reject expired versions for current draws. */
  todayIso: string,
): FormatGateFinding[] {
  const out: FormatGateFinding[] = [];
  const add = (v: ResultFormatVersion, reason: string) =>
    out.push({ formatId: v.formatId, gameKey: v.gameKey, reason });

  for (const v of versions) {
    /* 1. Only officially verified rules may publish. This is what stops LRG-STATE-025's cloned
          definitions reaching the public page. */
    if (v.verification !== "verifiedOfficial") {
      add(v, `verification is "${v.verification}"; only verifiedOfficial may publish publicly`);
    }

    /* 2. Every published format must cite at least one primary official source. */
    if (v.sources.length === 0) {
      add(v, "no primary official rule source recorded");
    }

    /* 3. A retired game must not be presented as a current result. */
    if (v.retirement && (v.effectiveTo === null || v.effectiveTo >= todayIso)) {
      add(v, `retired on ${v.retirement.retiredOn} but its format is still open for current draws`);
    }

    /* 4. An expired version must not serve a current draw. */
    if (v.effectiveTo !== null && v.effectiveTo < todayIso && !v.supersededBy && !v.retirement) {
      add(v, `expired on ${v.effectiveTo} with no supersedingBy and no retirement — current draws would have no format`);
    }

    /* 5. A purchase-time add-on must never carry a drawn group. That is the exact shape that would render
          an instant-win option as if it were a winning-number result. */
    for (const a of v.addOns) {
      if (a.addOnClass === "purchaseTime" && a.drawnGroup) {
        add(v, `purchase-time add-on "${a.key}" carries a drawn group; it must never render as a result`);
      }
      if (a.addOnClass === "drawn" && !a.drawnGroup) {
        add(v, `drawn add-on "${a.key}" has no drawn group`);
      }
      if (a.sources.length === 0) add(v, `add-on "${a.key}" has no rule source`);
    }

    /* 6. Prize semantics must be labelled — never a bare money string. */
    if (v.prize.kind === "unavailable" && v.prize.sources.length === 0) {
      /* Acceptable: an unavailable prize needs no source, it is an absence. */
    } else if (v.prize.sources.length === 0) {
      add(v, `prize kind "${v.prize.kind}" has no source`);
    }

    /* 7. A stake-dependent prize must declare its stake options, or a single figure would mislead. */
    if (v.prize.kind === "stakeDependentPrize" && (v.prize.stakeOptions?.length ?? 0) === 0) {
      add(v, "stake-dependent prize has no recorded stake options; no prize figure may be shown");
    }

    /* 8. Special and add-on groups need a label and an accessible name (`FD-S-14`). */
    for (const g of v.primaryGroups) {
      if (g.label && !g.accessibleLabel) {
        add(v, `group "${g.label}" has no accessibleLabel (FD-S-14 signal 3)`);
      }
    }

    /* 9. A secondary draw is a result and needs its own source and prize. */
    for (const sd of v.secondaryDraws) {
      if (sd.sources.length === 0) add(v, `secondary draw "${sd.key}" has no rule source`);
      if (sd.groups.length === 0) add(v, `secondary draw "${sd.key}" has no drawn groups of its own`);
    }
  }
  return out;
}

/** Convenience: may this set of formats render on a PUBLIC page? */
export function mayPublishFormats(
  versions: readonly ResultFormatVersion[],
  todayIso: string,
): boolean {
  return formatPublicationFindings(versions, todayIso).length === 0;
}

/** Versions that are current for `todayIso` — retired and expired versions excluded. */
export function currentVersions(
  versions: readonly ResultFormatVersion[],
  todayIso: string,
): ResultFormatVersion[] {
  return versions.filter(
    (v) => !v.retirement && coversDate(v, todayIso),
  );
}

/** Every drawn value group a format legitimately renders: primary + drawn add-ons. Never purchase-time. */
export function renderableGroups(v: ResultFormatVersion): BallGroupSpec[] {
  return [
    ...v.primaryGroups,
    ...v.addOns.filter((a) => a.addOnClass === "drawn" && a.drawnGroup).map((a) => a.drawnGroup!),
  ];
}
