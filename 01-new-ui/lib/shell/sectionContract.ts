/*
 * THE UNIVERSAL SECTION CONTRACT — BP-01 (Global Shell v1.1) §42–§45.
 *
 * The TYPES and the CONSTANTS. `components/shell/SectionChrome.tsx` is the rendering half and imports from here.
 *
 * ══ WHY THE SPLIT ══
 *
 * Two reasons, and the second is the load-bearing one:
 *
 *   1. LAYERING. A section's anatomy, its §43 state vocabulary and the §10.5 intelligence decision are a
 *      CONTRACT, and view models need to speak it — `statePreviewModel`, `flagshipPageModel` and `archiveModel` all
 *      resolve which sections render and why. A model importing a type from a `.tsx` component would invert the
 *      dependency direction the rest of the codebase keeps (`lib` is imported BY `components`, never the reverse).
 *   2. TESTABILITY. The repository's test runner resolves `.ts` and `.tsx` for IMPORTS but Node itself cannot
 *      execute a `.tsx` module, so anything a test needs to import by value has to live in a `.ts` file. A
 *      constant that only a `readFileSync` regex can reach is a constant no test can assert the SHAPE of, and the
 *      §43 state list is exactly the sort of thing that silently loses a member.
 */

/**
 * Which family's class vocabulary a section writes.
 *
 * The wrapper's class name is the ONE thing that must stay per-family: `.lcs-section` and `.lcfg-section` carry
 * different padding, different dividers and different first-child rules, and unifying the CSS is a design-system
 * task that has not been approved (`CLAUDE.md` §8). So the chrome is shared and the skin is selected.
 */
export type SectionFamily =
  | "home" | "state" | "game" | "archive" | "flagship" | "news" | "community" | "blog" | "tools";

export const CLASS_PREFIX: Readonly<Record<SectionFamily, string>> = Object.freeze({
  home: "lcp",
  state: "lcs",
  game: "lcg",
  /* The archive renders inside the Game Page's section skin — see `ArchiveView`'s header note. */
  archive: "lcg",
  flagship: "lcfg",
  /* The News family (07A/07B) — its own quiet editorial skin, defined in `globals.css`. */
  news: "lcn",
  /* The Community family (08A/08B/08C) — its own conversational skin, defined in `globals.css`. */
  community: "lcc",
  /* The Blog family (Conflict 39) — the news skin's magazine sibling, defined in `globals.css`. */
  blog: "lcb",
  /* The Tools family (BP-05C, Conflict 42 interim) — a task-first utility skin, defined in `globals.css`. */
  tools: "lct",
});

/**
 * §42 item 4 — the data/source classification a section carries.
 *
 * Recorded in the DOM so an audit can read a section's provenance without running the model. `productionFeed` and
 * `operatorPublished` are real public fact; `deterministic` is arithmetic over them; `configured` is approved
 * editorial; `synthetic` is review-only content that must never be published as fact (`CLAUDE.md` §14).
 */
export type SectionSourceClass =
  | "productionFeed"
  | "operatorPublished"
  | "deterministic"
  | "configured"
  | "synthetic"
  | "none";

/**
 * §42 items 5–6 — the intelligence decision recorded for this section.
 *
 * Global Shell §10.5 requires EVERY section to record one of these. `none` is a legitimate answer and is the reason
 * the union has a documented member rather than allowing the field to be omitted: "no intelligence layer would add
 * value here" is a DECISION, and an absent attribute is not a decision.
 */
export type SectionIntelligence =
  /** Deterministic computation over governed page data. Never labelled AI, in either direction (`FD-DAT-20`). */
  | "deterministic"
  /** A model-executed explanation or synthesis. Account-gated; nothing ships in this phase. */
  | "generative"
  /** Curated editorial context written by a person. */
  | "curated"
  /** An interesting fact (SL-I04). */
  | "interestingFact"
  /** A contextual next action (SL-M01). */
  | "nextAction"
  /** A recorded decision that no intelligence layer would add value. */
  | "none";

/** Every §10.5 answer, for the Section Intelligence Matrix coverage test. */
export const SECTION_INTELLIGENCE_KINDS: readonly SectionIntelligence[] = Object.freeze([
  "deterministic", "generative", "curated", "interestingFact", "nextAction", "none",
]);

/**
 * §43 — the universal section states.
 *
 * *"A section must never silently show stale dynamic data as current"*, so `stale` and `corrected` are first-class
 * members rather than a boolean flag hung off `fresh`.
 */
export type SectionState =
  | "loading"
  | "fresh"
  | "stale"
  | "pendingVerification"
  | "unavailable"
  | "incomplete"
  | "conflicting"
  | "corrected"
  | "archived"
  | "empty"
  | "restricted"
  | "personalized"
  | "anonymousFallback"
  | "error";

/** Every §43 state, for the coverage test. */
export const SECTION_STATES: readonly SectionState[] = Object.freeze([
  "loading", "fresh", "stale", "pendingVerification", "unavailable", "incomplete", "conflicting",
  "corrected", "archived", "empty", "restricted", "personalized", "anonymousFallback", "error",
]);

/**
 * The §42 anatomy of one rendered section.
 *
 * Every field maps to a numbered item in §42. `sectionId` is the page family's governed id (`S-02`, `FG-01`,
 * `AR-05`, `JG-07`); `libraryId` is the shared `SL-*` id from Global Shell Part IX–XI, which is what makes two
 * families' "latest result" sections recognisably the same object rather than two lookalikes.
 *
 * `heading` is deliberately `unknown` here and narrowed to `ReactNode` by the renderer: this module must stay free
 * of a React dependency so a view model can import the contract without importing React.
 */
export interface SectionAnatomyBase {
  /** §42.1 — the page family's own governed section id. */
  sectionId: string;
  /** §42.1 — the shared Section Library id (`SL-U02`, `SL-I02`, `SL-M01`…), where one applies. */
  libraryId?: string;
  /** §44 — one optional line of context under the heading. Never a second paragraph. */
  context?: string;
  /** §44 — the data period or effective date this section's content describes. */
  dataPeriod?: string;
  /** §42.4 — where this section's content comes from. */
  sourceClass?: SectionSourceClass;
  /** §42.5/§10.5 — the recorded intelligence decision. Required by the Section Intelligence Matrix. */
  intelligence?: SectionIntelligence;
  /** §43 — the state this section is actually in. */
  state?: SectionState;
  /** §42.10 — true when advertising, promotion and interruption are prohibited inside this section. */
  protectedZone?: boolean;
  /** The blueprint requirement level, where the family's manifest declares one. */
  requirement?: string;
  /** The blueprint's own order value, for the composition audit. */
  order?: number;
  /** A stable in-page fragment this section owns. Never duplicated onto its heading. */
  fragment?: string;
}
