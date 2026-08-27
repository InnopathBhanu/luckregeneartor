/*
 * THE YEARLY ARCHIVE CONTRACT — LRG-ARCHIVE-054.
 *
 * Authority: `06-lotterycorner-yearly-results-archive-blueprint-FINAL-APPROVED.md` v1.0 (final approved,
 * frozen) — §6 page order, §5 completeness states, §1 archive modes, Part VII data contracts;
 * `06-…-content-template-FINAL-APPROVED.md` v1.0 (visible copy, Templates C/E/F/G/H/J/K);
 * the 2026-08-05 execution brief §8 (`AR-01`…`AR-11` actual content), §10 (generic format contract),
 * §11 (internal review fixture); `CLAUDE.md` §14 (fixture provenance), §9 (typed view models).
 *
 * ══ WHAT THIS FILE IS, AND WHAT IT DELIBERATELY IS NOT ══
 *
 * It is the typed vocabulary for one game-year archive page: draw rows, month index, metrics, notable draws,
 * the AI brief, coverage and the per-section render decision.
 *
 * It is **not** a database schema and must never become one. Blueprint Part VII names three future entities —
 * `GameYearArchive`, `GameYearMetrics`, `GameYearAISnapshot` — with fields such as `computedAt`, `modelVersion`
 * and `invalidatedAt` that belong to a service that computes and caches. Nothing here computes on a schedule,
 * caches, or has a version; every value is derived at request time from data that already exists. When the API
 * task begins, that contract is designed from the production result store and the governed rule data, not
 * reverse-engineered from this presentation payload (`CLAUDE.md` §15, and the fixture rule in §14).
 *
 * ══ THE OWNERSHIP SPLIT THE BRIEF REQUIRES ══
 *
 *   Draw facts        gameId, date, values, status, correction   → the jurisdiction's draw events / fixture
 *   Derived metrics   counts, distributions, notability          → deterministic functions over those rows
 *   Editorial         news, guides, blogs, community             → the game configuration's own inventory
 *   Entitlement       what a public reader may see or do         → access labels, never inferred from data
 *   Presentation      order, labels, which sections render       → the blueprint sequence and this model
 *
 * Nothing crosses. A metric cannot state a rule, editorial cannot state a result, and an access label cannot
 * be derived from whether data happens to exist.
 */

import type { FormatProfile } from "../game/gameFormatProfile";
import type { GameRuleEra } from "../game/gameRuleContract";
import type { ArchiveYearNavigation } from "./archiveRegistry";
import type { CoverageAssessment, DrawSchedule } from "./archiveSchedule";

/* ------------------------------------------------------------------ modes and sections */

/**
 * Blueprint §1. The mode is resolved from the selected year against the jurisdiction's own review date — never
 * from the wall clock, and never from a browser timezone (blueprint §3).
 */
export type ArchiveMode = "YR-CURRENT" | "YR-CLOSED" | "YR-RETIRED";

/** Blueprint §5. Exposed on every page; the page suppresses metrics the profile cannot support. */
export type CompletenessState = "COMPLETE" | "PARTIAL" | "UNDER_REVIEW" | "CORRECTED";

/**
 * Blueprint §6, reproduced exactly — including the four advertisement anchors.
 *
 * The anchors stay in the order and resolve to nothing, for the same reason the Game Page's `AD-JG*` anchors
 * do: the `lc_gh_*` history-page slot family has now been READ from the legacy template (12 slots, recorded in
 * the implementation record) but is not approved for this surface, and dropping an anchor from the sequence
 * would lose the governed position ad ops has to fill later (`CLAUDE.md` §12).
 */
export type ArchiveSectionId =
  | "AR-01" | "AR-02" | "AD-AR00" | "AR-03" | "AR-04" | "AR-05" | "AD-AR01"
  | "AR-06" | "AR-07" | "AR-08" | "AD-AR02" | "AR-09" | "AR-10" | "AR-11" | "AD-AR03"
  | "Footer";

/**
 * Blueprint §6's own sequence, retained verbatim so the deviation below is legible and testable.
 *
 * Not the render order any more. Kept because the Section Intelligence Matrix, the acceptance criteria and any
 * future page family all reference it, and because a deviation you cannot diff against the original is not a
 * recorded deviation — it is a silent rewrite.
 */
export const AR_ORDER_BLUEPRINT: readonly ArchiveSectionId[] = Object.freeze([
  "AR-01", "AR-02", "AD-AR00", "AR-03", "AR-04", "AR-05", "AD-AR01",
  "AR-06", "AR-07", "AR-08", "AD-AR02", "AR-09", "AR-10", "AR-11", "AD-AR03",
  "Footer",
]);

/**
 * THE ACTIVE ORDER — founder direction of 2026-08-05, which overrides blueprint §6 where they disagree.
 *
 * ══ WHAT MOVED, AND WHY ══
 *
 * The blueprint's sequence produced a page that read as an internal validation report rather than an archive. It
 * was measured before this change: at 390 px a reader scrolled **4.4 screens to reach the first result** and
 * **10.2 screens to reach search**, on a 23.6-screen page, with the search workspace sitting AFTER the results it
 * searches.
 *
 * Three moves, and nothing else:
 *
 *   1. **AR-06 (search and filters) moves above AR-05 (results).** A reader who wants one drawing should not have
 *      to scroll past every drawing to find the control that finds it. The Ask block stays inside AR-06 but renders
 *      after the results per the founder direction — the search CONTROLS are what must come first.
 *   2. **AR-04 (month navigation) moves above search**, so the coarse filter precedes the fine one.
 *   3. **AR-02 (year summary) shrinks and AR-03 (the year brief) moves below the results**, with every long-form
 *      section — statistics, tools, editorial, sources — following them.
 *
 * The section IDs are unchanged. Only the sequence differs, so the §6 taxonomy, the per-section contracts and the
 * Section Intelligence Matrix all still apply to exactly the sections they always did.
 */
/*
 * ══ THE FOUR ADVERTISEMENT ANCHORS ARE BACK IN THE SEQUENCE — §A4 ══
 *
 * They were removed from this array and kept only in `AR_ORDER_BLUEPRINT`. That went one step too far. `CLAUDE.md`
 * §12 forbids moving or reordering a slot, and a governed position absent from the sequence the page actually walks
 * is a position that gets silently re-derived the next time the order changes — which this order has already
 * changed once. The Game Page and the flagship hubs keep their unaudited anchors IN the governed sequence and
 * resolve them to a typed-empty profile; the archive now does the same, via `NO_APPROVED_ARCHIVE_PROFILE`.
 *
 * NOTHING IS DRAWN. The model marks all four `render: false` with the profile's recorded gap as the reason, so no
 * geometry is reserved, no layout shifts, no placeholder appears and no review note reaches the page — exactly the
 * behaviour the previous revision achieved by deletion, now achieved without losing the position.
 *
 * ══ WHERE EACH ANCHOR SITS, AND WHY ══
 *
 * The blueprint puts them after AR-02, after AR-05, after AR-08 and last. Three of those neighbours moved when the
 * founder reorder pushed the long-form sections below the results, so an anchor pinned to a section id would have
 * travelled with it into a different job. They are placed by ROLE instead — each between two content blocks, never
 * inside one — and they keep their numeric order so the sequence still reads top to bottom:
 *
 *   AD-AR00  after the results section ENDS. The first anchor after the reader's first substantial block.
 *   AD-AR01  after the year brief and summary, before the statistics.
 *   AD-AR02  before the editorial block, exactly as in the blueprint.
 *   AD-AR03  last, before the footer, exactly as in the blueprint.
 *
 * None sits inside a protected region: not in the result rows, not between the search input and its matches, not
 * inside the sources-and-corrections section (blueprint §7, `CLAUDE.md` §12). AR-08 remains absent because every
 * tool it would list is either already on the page or not built — see the model.
 */
export const AR_ORDER: readonly ArchiveSectionId[] = Object.freeze([
  "AR-01",            /* breadcrumb, title, concise summary, year navigation */
  "AR-04",            /* month navigation */
  "AR-06",            /* search and filters, then the matching-results summary */
  "AR-05",            /* the results */
  "AD-AR00",
  "AR-03",            /* the year brief, now below the results it describes */
  "AR-02",            /* the fuller year summary */
  "AD-AR01",
  "AR-07",            /* statistics, primary views open and the rest disclosed on request */
  "AD-AR02",
  "AR-09",            /* news, guides and history */
  "AR-10",            /* sources and methodology */
  "AR-11",            /* continue */
  "AD-AR03",
  "Footer",
]);

/** Every advertisement anchor. One list, so the suppression rule is applied once and cannot drift. */
export const AR_AD_ANCHORS: readonly ArchiveSectionId[] = Object.freeze([
  "AD-AR00", "AD-AR01", "AD-AR02", "AD-AR03",
]);

export type ArchiveSectionState =
  | { render: true }
  | { render: false; reason: string };

/**
 * The advertising-profile shape the model carries.
 *
 * Declared here rather than imported from `archiveAdProfile.ts` so the contract has no dependency on the profile
 * module — the contract describes what a page family MUST report about its inventory; the profile module supplies
 * this family's answer.
 */
export interface ArchiveAdProfileRef {
  id: string;
  placements: readonly never[];
  anchors: readonly ArchiveSectionId[];
  protectedRegions: readonly string[];
  gap: string;
}

/* ------------------------------------------------------------------ provenance */

/**
 * Where one archive row came from.
 *
 * The brief requires the fixture's provenance to read `synthetic/internal-review` **in the data contract**, so
 * the literal is spelled that way here rather than being a view-layer label a component could forget to apply.
 * `productionFeed` exists because real data wins wherever it exists: the newest row for each member game is the
 * captured feed's own record, so the top of the table — the part a reader actually reads — is real.
 */
export type ArchiveProvenance = "productionFeed" | "synthetic/internal-review";

/* ------------------------------------------------------------------ rows */

/** One drawn group's values on one row, in supplied order, carried by label. */
export interface ArchiveRowGroup {
  key: string;
  /** `null` for the main group, which the column heading names. */
  label: string | null;
  accessibleLabel: string;
  values: readonly number[];
  colorToken: string;
  role: "main" | "special" | "addOn";
}

/**
 * The shape of one result, as a DECLARED classification rather than a computed adjective.
 *
 * `notApplicable` is the honest answer for a format where the question is meaningless — a single-value game
 * cannot have a repeated value, and a pool draw cannot either. It is not `allDifferent` by default, because
 * "all different" would imply the game could have been otherwise.
 */
export type ResultShape = "allDifferent" | "double" | "triple" | "notApplicable";

export interface ArchiveDrawRow {
  /** The member game's own production id. Never rewritten and never merged (brief §1, blueprint §4). */
  gameId: number;
  /** The member's own variant label — `Midday`, `Evening`. Empty for a single-member family. */
  variantLabel: string;
  /** Stable order within one date, from the family configuration's `displayOrder`. Never alphabetical. */
  memberOrder: number;
  drawDateIso: string;
  /** `YYYY-MM`, for month filtering without parsing a Date. */
  monthKey: string;
  /** Every drawn group, main first, in format order. Values are in supplied order and are never sorted. */
  groups: readonly ArchiveRowGroup[];
  /** The main group's values, for the deterministic engines that already speak this shape. */
  mainValues: readonly number[];
  /** The drawn add-on's value when the format has one and this row carries it. `null` = not drawn or absent. */
  addOnValue: number | null;
  shape: ResultShape;
  /** Sum of the main values, or `null` where a sum is not an approved presentation for this format. */
  sum: number | null;
  status: string;
  /** True only for a row the fixture explicitly marks corrected. Never inferred. */
  corrected: boolean;
  /** What changed, when, and its previous value — content template Template F. `null` unless corrected. */
  correction: ArchiveCorrection | null;
  provenance: ArchiveProvenance;
  /** Stable in-page anchor, so every metric and notable draw can link to its evidence row. */
  anchorId: string;
}

/**
 * A correction, as a SOURCE-BACKED record rather than a flag.
 *
 * ══ WHY EVERY FIELD IS REQUIRED, AND WHY THAT IS THE GATE ══
 *
 * A correction notice is a factual claim about a real drawing: it says a published result was wrong and is now
 * right. The V0 rendered one from a fixture row, which made an internal demonstration read as a genuine
 * historical correction — the exact class of synthetic-as-fact failure `CLAUDE.md` §14 forbids.
 *
 * The gate is the type plus `isGenuineCorrection` below: a correction renders publicly only when it carries a
 * previous value, a corrected value, a source and a date. A fixture cannot satisfy that without fabricating a
 * source, which is precisely the thing it must not do — so the fixture simply stops claiming one, and the internal
 * capability stays intact and tested for the day a real correction record exists.
 */
export interface ArchiveCorrection {
  field: string;
  previousValue: string;
  currentValue: string;
  /** When the correction was made or discovered. */
  correctedOnIso: string;
  /**
   * The source that establishes the correction — an operator notice, a rule document, a feed revision.
   *
   * `null` means unsourced, which means not publishable. It is nullable rather than absent so an internal record
   * can exist and be inspected without being renderable.
   */
  source: string | null;
}

/**
 * Whether a correction record may be shown to a reader.
 *
 * The single gate, so no component can decide this for itself. All four facts must be present and non-empty: a
 * notice missing its previous value, its source or its date is not a correction a reader can check, and an
 * uncheckable claim about a real drawing should not be published at all.
 */
export function isGenuineCorrection(c: ArchiveCorrection | null | undefined): boolean {
  if (!c) return false;
  return (
    c.field.trim() !== ""
    && c.previousValue.trim() !== ""
    && c.currentValue.trim() !== ""
    && c.correctedOnIso.trim() !== ""
    && c.source !== null
    && c.source.trim() !== ""
  );
}

/* ------------------------------------------------------------------ months */

export interface ArchiveMonth {
  /** 1–12. */
  month: number;
  label: string;
  monthKey: string;
  drawCount: number;
  /** True when this month is within the archive year's valid range. Future months are not rendered as links. */
  valid: boolean;
  /** Set only when the fixture explicitly contains a correction in this month (brief §8 AR-04). */
  hasCorrection: boolean;
  /** Set only when a rule era begins inside this month, from the governed rule data. Never guessed. */
  hasRuleChange: boolean;
}

/* ------------------------------------------------------------------ metrics */

/**
 * One AR-02 metric.
 *
 * `range` is mandatory: the brief requires every metric to state its date range, and making the field
 * non-optional is what stops a component rendering a bare number. `evidenceHref` links to matching rows or
 * methodology where useful; `null` where no honest destination exists.
 */
export interface ArchiveMetric {
  key: string;
  label: string;
  value: string;
  range: string;
  evidenceHref: string | null;
  /** Reader-facing method note. Rendered as fine print, never as a claim about the future. */
  note: string | null;
}

/* ------------------------------------------------------------------ analysis */

export interface ArchiveAnalysisView {
  key: string;
  title: string;
  /**
   * Whether this view is one of the primary insights shown by default.
   *
   * The founder direction is explicit that nine tables of equal prominence is overload. `primary` views render
   * open; the rest go into an accessible expandable group. Nothing is removed and the engine is untouched — this
   * is a presentation weighting, decided in the model so the composition does not have to rank anything.
   */
  primary: boolean;
  /** Period, variants, draw count and method — the brief requires all four exposed per view. */
  period: string;
  variants: string;
  drawCount: number;
  method: string;
  /** Rows for the table alternative. A chart may enhance, never replace (brief §12). */
  rows: readonly { label: string; value: string; count: number; of: number }[];
}

export interface NotableDraw {
  /** Deterministic reason, computed from the rows. Never AI prose (brief §8 AR-07). */
  reason: string;
  metric: string;
  value: string;
  drawDateIso: string;
  variantLabel: string;
  /** Anchor of the row this claim rests on. Mandatory — a notable draw without evidence is not publishable. */
  evidenceAnchor: string;
}

/* ------------------------------------------------------------------ AI brief */

/**
 * One AR-03 observation.
 *
 * Every field is required, which is the point: an observation must carry the deterministic figure it came from
 * and a link to the rows that prove it. The brief's rule — *"Each observation must expose its evidence"* —
 * cannot be satisfied by prose alone, so the type does not permit prose alone.
 */
export interface ArchiveBriefPoint {
  text: string;
  /** The deterministic figure behind the sentence, shown next to it. */
  evidence: string;
  evidenceHref: string;
}

export interface ArchiveBrief {
  heading: string;
  /**
   * `LotteryCorner Year-to-Date Brief` for a current year; the Historical label for a closed one.
   *
   * The word AI was removed on 2026-08-06 by `DATA-DEC-001` `FD-DAT-20`: this brief is deterministic arithmetic
   * over public archive statistics, so calling it AI described the surface inaccurately.
   */
  label: string;
  points: readonly ArchiveBriefPoint[];
  /** Content template A5's evidence line: what the brief was computed from. */
  evidenceLine: string;
  /**
   * The provenance line: what the figures were counted from.
   *
   * Required, so the block cannot render without declaring its source. It states this positively and must not
   * mention AI in either direction — neither claiming a model nor disclaiming one (`FD-DAT-20`).
   */
  generation: string;
}

/* ------------------------------------------------------------------ coverage and trust */

export interface CoverageField {
  field: string;
  coverage: string;
  /** True when the page publishes metrics derived from this field. Drives honest suppression. */
  supportsMetrics: boolean;
}

export interface ArchiveCoverage {
  completeness: CompletenessState;
  /** Reader-facing sentence. Content template Template E when partial. */
  statement: string;
  fields: readonly CoverageField[];
  /** Reader-facing "Last updated". Never "last verified" — verification state is internal governance. */
  lastUpdatedIso: string;
  /** The result source label — verified, configured, or neutral. Never inferred from a state name. */
  sourceLabel: string;
  /** Export availability and data-rights status. `available: false` until rights are approved. */
  exportStatus: { available: boolean; statement: string };
}

/* ------------------------------------------------------------------ tools and editorial */

/**
 * Truthful access labels (brief §8 AR-08).
 *
 * `planned` is permitted **only** inside the guarded design-review context and is never a public promise, so
 * the model records the label and the composition renders it as review-only rather than as a product state.
 */
export type ToolAccess = "public" | "signInToSave" | "planned";

export interface ArchiveTool {
  key: string;
  title: string;
  summary: string;
  access: ToolAccess;
  /** A real destination, or `null` for an in-page anchor / not-yet-built tool. Never a dead link. */
  href: string | null;
  /** In-page target when the tool already exists on this page. */
  fragment: string | null;
}

export interface ArchiveEditorialGroup {
  kind: "News" | "Guides" | "Blogs" | "Community";
  heading: string;
  items: readonly { title: string; summary: string; href: string | null; dateLine: string | null }[];
  /** Shown when the group has no real content. Never a fabricated placeholder item. */
  emptyStatement: string | null;
}

/* ------------------------------------------------------------------ search and ask */

export type ArchiveOrderMode = "exact" | "any";
export type ArchiveSortOrder = "newest" | "oldest";
export type ArchiveVariantSelection = "all" | { gameId: number };

export interface ArchiveFilterInput {
  /** `YYYY-MM`, or `null` for the whole year. */
  monthKey: string | null;
  fromIso: string | null;
  toIso: string | null;
  variant: ArchiveVariantSelection;
  /** Raw per-group entry, kept as strings so a leading zero survives to the parser. */
  raw: Readonly<Record<string, readonly string[]>>;
  orderMode: ArchiveOrderMode;
  includeAddOn: boolean;
  /** `null` = no shape condition. */
  shape: ResultShape | null;
  sumFrom: number | null;
  sumTo: number | null;
  sort: ArchiveSortOrder;
  includeCorrected: boolean;
}

export interface ArchiveFilterResult {
  rows: readonly ArchiveDrawRow[];
  /** How many rows the filter examined, before the conditions. */
  examined: number;
  /** Reader-facing sentence naming exactly what was filtered and found. */
  statement: string;
  /** Per-group input error, keyed by group. Empty when everything parsed. */
  errors: Readonly<Record<string, string>>;
  /** True when a number condition was supplied and parsed. Drives match-mode vocabulary. */
  numberApplied: boolean;
}

/**
 * One Ask-the-Archive answer.
 *
 * The brief's required output shape, made structural: interpreted filters, matching count, matching rows, a
 * plain-language explanation, evidence links and the neutrality statement. `interpretation` is what the
 * translation layer understood — shown so a reader can see it was understood correctly, or correct it.
 */
export interface ArchiveAskAnswer {
  question: string;
  /** Reader-facing interpreted filters — game, year, variant and each condition, one line each. */
  interpretation: readonly { label: string; value: string }[];
  /** True when nothing in the question could be interpreted. Renders Template G, not an empty table. */
  understood: boolean;
  matchingCount: number;
  rows: readonly ArchiveDrawRow[];
  explanation: string;
  /** Deterministic evidence links for the answer. */
  evidence: readonly { label: string; href: string }[];
  /** The mandatory neutrality sentence. A required field so it cannot be dropped. */
  neutrality: string;
  /** Suggestions shown when nothing matched — content template Template G. */
  suggestions: readonly string[];
}

/* ------------------------------------------------------------------ the view model */

export interface ArchiveViewModel {
  /* ---- identity ---- */
  stateCode: string;
  stateName: string;
  gameSlug: string;
  gameLabel: string;
  /** The configuration's declared logo key. `null` when the game has no verified brand asset. */
  visualIdentity: string | null;
  familyId: string;
  archiveYear: number;
  mode: ArchiveMode;
  /** The jurisdiction's own review date, from `resolveReviewDate`. Every date decision measures against it. */
  reviewDateIso: string;
  /**
   * The single preview disclosure. Stated once, near the top, and nowhere else.
   *
   * It has to stay: most 2026 rows are sample results, and removing the warning would let them read as real. What
   * changed is that it is now the ONLY place the page discusses its own construction — every other internal
   * phrase ("internal review samples", "governed rule data", "not rendered in this review", ad-anchor ids) is
   * gone from the visible page.
   */
  previewBanner: string;

  /* ---- navigation ---- */
  /** Years with archive data, ascending. Real links only — a year with no data is not a destination. */
  availableYears: readonly number[];
  previousYear: number | null;
  nextYear: number | null;
  earliestYear: number | null;
  /** Route back to the current game page. */
  gameHref: string;
  breadcrumbs: readonly { label: string; href: string | null }[];

  /* ---- content ---- */
  h1: string;
  supportingCopy: string;
  statusLine: string;
  members: readonly { gameId: number; variantLabel: string; memberOrder: number; drawCount: number }[];
  rows: readonly ArchiveDrawRow[];
  months: readonly ArchiveMonth[];
  /** The month open by default. Latest valid month for `YR-CURRENT` (blueprint §19). */
  defaultMonthKey: string | null;
  /**
   * The archive's real coverage bounds, from the UNFILTERED year.
   *
   * The calendar needs these to tell a day that is outside the covered range from a day inside it that simply has
   * no drawing. Deriving them from filtered rows would make a narrow filter look like a narrow archive.
   */
  coveredFromIso: string | null;
  coveredToIso: string | null;
  /**
   * The family's registered draw schedule, parsed from the members' own `drawDays`.
   *
   * The calendar needs it to distinguish "no drawing occurred" from "we hold no result". Without it every gap in an
   * incomplete archive read as a claim that no drawing happened (LRG-ARCHIVE-058).
   */
  schedule: DrawSchedule;
  /** Whether the archive holds a row for every date its own schedule expects. Gates any `noDrawing` claim. */
  scheduleCoverage: CoverageAssessment;
  /**
   * The fuller year summary, rendered BELOW the results.
   *
   * Up to six blueprint §9 metrics. It kept its place in the model and lost its place at the top of the page.
   */
  metrics: readonly ArchiveMetric[];
  /**
   * The concise summary above the results: total drawings, a count per drawing variant, and the covered range.
   *
   * At most four entries, none of them a verification or correction figure.
   */
  summaryMetrics: readonly ArchiveMetric[];
  /** Year navigation resolved from the archive registry. Never from arithmetic, never from the fixture. */
  yearNav: ArchiveYearNavigation;
  brief: ArchiveBrief | null;
  analysis: readonly ArchiveAnalysisView[];
  notable: readonly NotableDraw[];
  tools: readonly ArchiveTool[];
  editorial: readonly ArchiveEditorialGroup[];
  coverage: ArchiveCoverage;
  /** One complete public Ask answer, server-rendered. The brief requires it without sign-in. */
  /**
   * The grounded Ask answer.
   *
   * Still computed, and still asserted by tests, but **not rendered** since LRG-ARCHIVE-059: `DATA-DEC-001`
   * `FD-DAT-02` gates Ask execution behind an Account. It stays on the model because the future gated endpoint
   * needs exactly this value, and because the grounding tests are what stop a regression in the interpreter.
   */
  askAnswer: ArchiveAskAnswer;
  askPrompts: readonly string[];
  /** AR-11 continuation actions, already filtered to what really exists. */
  nextActions: readonly { label: string; href: string | null; fragment: string | null; note: string | null }[];

  /**
   * The advertising profile — §A4.
   *
   * Carried on the model so the composition can declare it in `data-*` exactly as the State, Game and flagship
   * pages do, and so an ad-operations audit can read "which slots does this page family have approved?" off one
   * value. Today the answer is "none, with a recorded reason".
   */
  ads: ArchiveAdProfileRef;

  /* ---- format, carried so the composition never re-derives it ---- */
  profile: FormatProfile;
  ruleEra: GameRuleEra | undefined;
  ruleEraLabel: string;
  /** The single source/freshness statement near the archive. The complete explanation lives in AR-10. */
  sourceLine: string;

  /* ---- decisions ---- */
  /**
   * Whether any row carries a publishable, sourced correction.
   *
   * The single switch for every correction-related control: the notice, the row marker, the month marker and the
   * "include corrected drawings" filter. With no genuine correction all four are absent — a filter for a state
   * that cannot occur is a control that teaches a reader the wrong thing about the data.
   */
  hasPublishedCorrection: boolean;
  order: readonly ArchiveSectionId[];
  sectionState: Record<ArchiveSectionId, ArchiveSectionState>;
  /** Sections deliberately not rendered, with the reason. Diagnostic only — never reader copy. */
  suppressed: readonly { id: ArchiveSectionId; reason: string }[];
  /** The neutrality sentence every statistics area repeats once. */
  neutrality: string;
}
