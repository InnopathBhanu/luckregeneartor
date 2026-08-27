/*
 * THE SECTION INTELLIGENCE MATRIX — §C3.
 *
 * Authority: Global Shell v1.1 **§10.5**, quoted in full because this file exists to satisfy it:
 *
 *   *"The global AI entry is one access point, not the complete AI strategy. A page-family blueprint cannot claim
 *   AI compliance merely because it includes this trigger or a single page-level AI module. Every section must
 *   record one of the following in its Section Intelligence Matrix: deterministic intelligence; generative AI
 *   explanation or synthesis; curated editorial context; an interesting fact; a contextual next action; or a
 *   documented decision that no intelligence layer would add value."*
 *
 * Also: `FD-X-08` (ONE shared answer surface per page; at most one contextual AI action per panel; none on
 * multi-state or member rows), `FD-DAT-20` (a deterministic computation is NOT labelled AI, in either direction),
 * `FD-DAT-17` (a model-executed surface is absent, not gated-and-dead), `CLAUDE.md` §16 (no Member/Insider
 * capability may be implemented).
 *
 * ══ WHY ONE MATRIX AND NOT FIVE FIELDS ══
 *
 * The obvious implementation is an `intelligence` field on each family's own section manifest. Five reasons not to:
 *
 *   1. **§10.5 is a coverage rule across the product**, not a per-family one. "Every section on all five pages has
 *      a recorded decision" is one assertion against one table; against five manifests it is five assertions that
 *      can each pass while the product still has a gap.
 *   2. **Two of the five families have no section manifest to put a field on.** Home's sections are a typed
 *      envelope union and the archive's are a string union; adding a parallel field to each means adding a
 *      parallel structure to each.
 *   3. **The decision is reviewable as prose.** A founder reading §10.5 compliance wants a list of "section →
 *      decision → why", which is what this file is. A field spread across five files is not readable as a matrix.
 *   4. **`none` needs a REASON, and a boolean field invites omitting it.** Here every entry carries `why`, and the
 *      test asserts that a `none` entry explains itself — because "no intelligence would add value" is a decision
 *      and an empty attribute is not.
 *   5. It keeps the section manifests describing SECTIONS. `sectionManifest.ts` already says it is deliberately not
 *      a CMS (FD-S-04); adding an intelligence taxonomy to it widens exactly the thing it refuses to become.
 *
 * ══ WHAT `deterministic` MEANS HERE, PRECISELY ══
 *
 * Arithmetic or transcription over data the page already holds — a count, a sum, a gap between two dates, a
 * comparison of two published drawings, an operator's own quoted rule. Per `FD-DAT-20` those surfaces are NOT
 * labelled AI and NOT disclaimed as non-AI; they are labelled by their provenance. `generative` appears NOWHERE in
 * this table today, and that is the honest state of the product: no provider is connected (§C0).
 */

import type { SectionIntelligence } from "@/lib/shell/sectionContract";

/** Which page family a section belongs to. */
export type IntelligenceFamily =
  | "home" | "state" | "game" | "archive" | "flagship" | "news" | "community" | "blog" | "tools";

export interface SectionIntelligenceEntry {
  family: IntelligenceFamily;
  /** The family's own governed section id. */
  sectionId: string;
  decision: SectionIntelligence;
  /**
   * WHY this decision. Required for every entry, and especially for `none` — §10.5 asks for *"a documented decision
   * that no intelligence layer would add value"*, and a decision with no reason is not documented.
   */
  why: string;
  /**
   * True when this section carries a RESULT a reader might want explained, and therefore needs a contextual Explain
   * action targeting the page's one shared answer surface (`FD-X-08`).
   *
   * Deliberately false on a multi-state block and on a member row: FD-X-08 caps contextual AI at one action per
   * panel, and LRG-STATE-039 §4 removed it from the multi-state block entirely so the page's main answer surface
   * stays the primary AI experience.
   */
  explainAction?: boolean;
}

/* ------------------------------------------------------------------ Home (BP-02) */

const HOME: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "home", sectionId: "H-01", decision: "none",
    why: "The page identity header states where the reader is. Nothing to explain, and an insight here would delay the task." },
  { family: "home", sectionId: "H-02A", decision: "deterministic",
    why: "The featured result carries the deterministic draw analysis — shape, sum, spread — computed from the drawn values.",
    explainAction: true },
  { family: "home", sectionId: "H-02B", decision: "deterministic",
    why: "The secondary results grid carries the same computed shape description per card.",
    explainAction: true },
  { family: "home", sectionId: "H-03", decision: "deterministic",
    why: "§B2's jackpot movement: the change between two published advertised figures, subtracted, never estimated." },
  { family: "home", sectionId: "H-04", decision: "nextAction",
    why: "Check-your-numbers is a task launcher. Its intelligence is the deterministic comparison it leads to, not a summary of itself." },
  { family: "home", sectionId: "H-05", decision: "deterministic",
    why: "The page's ONE shared answer surface. Every answer is computed from the results the page already holds." },
  { family: "home", sectionId: "H-06A", decision: "deterministic",
    why: "Upcoming draws carry §B1's relative next-draw label, computed in each game's own timezone." },
  { family: "home", sectionId: "H-06B", decision: "deterministic",
    why: "Draw status is derived from the published result state, never asserted." },
  { family: "home", sectionId: "H-07", decision: "curated",
    why: "The popular-games rail is an approved editorial selection. Ranking it by an interest signal would be desirability ranking." },
  { family: "home", sectionId: "H-08", decision: "none",
    why: "Commerce. Constitution §17 forbids commission covertly driving a recommendation, so no intelligence layer may shape it." },
  { family: "home", sectionId: "H-09", decision: "nextAction",
    why: "The tools rail routes to a tool. The tool's own output is where the intelligence is." },
  { family: "home", sectionId: "H-09A", decision: "interestingFact",
    why: "SL-I04. A statistically true historical observation about the published results, labelled as one." },
  { family: "home", sectionId: "H-09B", decision: "nextAction",
    why: "A continuation rail. One best next step, no summary." },
  { family: "home", sectionId: "H-10", decision: "curated",
    why: "Editorial content, human-authored. A generated summary of it needs a provider and a review pipeline; neither exists." },
  { family: "home", sectionId: "H-10A", decision: "curated",
    why: "The second editorial rail, same reasoning as H-10: human-authored content, and a generated summary of it needs a provider and a review pipeline." },
  { family: "home", sectionId: "H-11", decision: "curated",
    why: "News. AI Quick Take (AI-E1) is approved but needs a provider, so nothing is generated (§C0)." },
  { family: "home", sectionId: "H-11A", decision: "curated",
    why: "The secondary news rail, same reasoning as H-11: AI-E1's quick take is approved but needs a provider, so nothing is generated." },
  { family: "home", sectionId: "H-12", decision: "none",
    why: "Community. Content is human-authored and MUST NOT be fabricated; a Community Pulse summary needs a provider." },
  { family: "home", sectionId: "H-13", decision: "none",
    why: "Trust and responsible play. A protected zone: no interruption, and nothing here benefits from a layer over it." },
  { family: "home", sectionId: "H-14", decision: "none",
    why: "Navigation. A state directory answers 'where do I go'; an insight layer over a list of links adds nothing a reader can act on." },
  { family: "home", sectionId: "H-14A", decision: "none",
    why: "The compact directory variant. Same reasoning as H-14: it is a set of destinations, not a set of facts to interpret." },
  { family: "home", sectionId: "H-14B", decision: "none",
    why: "The full state grid. Same reasoning as H-14, and ranking states by any signal would be desirability ranking rather than navigation." },
  { family: "home", sectionId: "H-15", decision: "none",
    why: "The footer. GS-10 is navigation and disclosure; an intelligence layer on it would be noise." },
]);

/* ------------------------------------------------------------------ State (PF-02) */

const STATE: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "state", sectionId: "S-01", decision: "none",
    why: "State identity and task header. FD-X-03 requires the first verified result to be reachable fast; an insight here delays it." },
  { family: "state", sectionId: "S-02", decision: "deterministic",
    why: "Latest results. Each family panel carries ONE Explain action into S-03 — never a panel of its own (FD-X-08).",
    explainAction: true },
  { family: "state", sectionId: "S-03", decision: "deterministic",
    why: "The page's ONE shared answer surface. Every answer is computed from this page's own governed families." },
  { family: "state", sectionId: "S-04", decision: "deterministic",
    why: "§B3's weekly schedule is a union over the operator's published draw days, plus §B1's relative label." },
  { family: "state", sectionId: "S-05", decision: "deterministic",
    why: "Ticket checking is a deterministic comparison and FD-S-17 forbids AI determining it. No checker is connected, so the section routes to the operator's own." },
  { family: "state", sectionId: "S-06", decision: "deterministic",
    why: "The game portfolio is projected from governed format coverage — which games verify, and which are recorded as gaps." },
  { family: "state", sectionId: "S-07", decision: "none",
    why: "Commerce. §13 requires deterministic, state-aware eligibility; an intelligence layer must never shape it." },
  { family: "state", sectionId: "S-08", decision: "curated",
    why: "Claims, taxes and anonymity are transcribed operator guidance. A protected zone — no interruption, and no generated paraphrase of legal guidance." },
  { family: "state", sectionId: "S-08A", decision: "curated",
    why: "State Essentials projects verified manifest facts. Each links to its source; an unverified fact is absent." },
  { family: "state", sectionId: "S-09", decision: "deterministic",
    why: "FD-X-09's what-changed summary: computed from real feed values against a local-only visit marker. No account, no server profile." },
  { family: "state", sectionId: "S-10", decision: "nextAction",
    why: "Explore and tools. Every destination is checked at build time; the intelligence is in the tool it reaches." },
  { family: "state", sectionId: "S-11", decision: "none",
    why: "Scratchers are suppressed — no sourced snapshot exists. There is nothing to add a layer to." },
  { family: "state", sectionId: "S-12", decision: "none",
    why: "Winners and unclaimed prizes are suppressed: the fixture records are fabricated and §14 forbids publishing them as fact." },
  { family: "state", sectionId: "S-13", decision: "none", why: "Fund allocation is suppressed — no source." },
  { family: "state", sectionId: "S-14", decision: "none",
    why: "Community. Human-authored, never fabricated. A thread summary needs a provider and a labelled AI byline." },
  { family: "state", sectionId: "S-15", decision: "curated",
    why: "News and guides are approved editorial. A generated quick take needs a provider (§C0)." },
  { family: "state", sectionId: "S-16", decision: "none",
    why: "Follow / My LotteryCorner is BLOCKED — a Member capability, and §16 forbids implementing one. Nothing renders, so nothing can carry a layer." },
  { family: "state", sectionId: "S-17", decision: "curated",
    why: "Sources and responsible play, merged into S-18. Transcribed and linked; a generated paraphrase of a helpline is not an improvement." },
  { family: "state", sectionId: "S-18", decision: "curated",
    why: "The approved resources band. Configured content with real destinations." },
]);

/* ------------------------------------------------------------------ Game (BP-04B) */

const GAME: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "game", sectionId: "JO-01", decision: "deterministic",
    why: "The result hero. Carries ONE Explain action into the page's shared answer surface.", explainAction: true },
  { family: "game", sectionId: "JO-02", decision: "deterministic",
    why: "Buying and the next drawing: §B1's relative label, computed in the jurisdiction's governed timezone." },
  { family: "game", sectionId: "JO-03", decision: "curated",
    why: "Local features are configured labels over governed values. An unverified field is absent, not summarised." },
  { family: "game", sectionId: "JO-04", decision: "deterministic",
    why: "The shared answer surface for JG-M1." },
  { family: "game", sectionId: "JO-05", decision: "curated", why: "Transcribed operator rules." },
  { family: "game", sectionId: "JO-06", decision: "nextAction", why: "A continuation into the state hub and the archive." },
  { family: "game", sectionId: "JO-07", decision: "curated", why: "Editorial inventory with resolved destinations." },
  { family: "game", sectionId: "JO-08", decision: "curated", why: "Sources and responsible play. Protected." },
  { family: "game", sectionId: "JG-01", decision: "deterministic",
    why: "The result. AI-D1's draw fingerprint is computed from the drawn values.", explainAction: true },
  { family: "game", sectionId: "JG-02", decision: "deterministic", why: "Buying and the next drawing, as JO-02." },
  { family: "game", sectionId: "JG-03", decision: "deterministic",
    why: "Ticket comparison is deterministic by rule (FD-S-17); AI may explain the OUTPUT, never produce it." },
  { family: "game", sectionId: "JG-04", decision: "deterministic",
    why: "The shared answer surface for JG-M2 — every contextual chip on the page targets this one region." },
  { family: "game", sectionId: "JG-05", decision: "deterministic", why: "Today's drawings, from the published schedule." },
  { family: "game", sectionId: "JG-06", decision: "curated",
    why: "How the game works: the operator's own prize matrix and rules, quoted. Suppressed where no payout row is captured." },
  { family: "game", sectionId: "JG-07", decision: "deterministic",
    why: "Result history. Counts over published rows; AI-D2's previous-draw relationship is arithmetic over two of them.",
    explainAction: true },
  { family: "game", sectionId: "JG-08", decision: "deterministic",
    why: "Number history and AI-D4's gap context — current gap, median, longest observed — with the overdue-number myth explained." },
  { family: "game", sectionId: "JG-09", decision: "deterministic",
    why: "Statistics. Every figure counts the drawings on the page; nothing is modelled, weighted or projected." },
  { family: "game", sectionId: "JG-10", decision: "none",
    why: "A number generator is an entertainment tool. Its output is random and must never be described as analysed or improved." },
  { family: "game", sectionId: "JG-11", decision: "curated", why: "How-to-play explanation, transcribed." },
  { family: "game", sectionId: "JG-12", decision: "curated", why: "Local offering facts, each with a named source." },
  { family: "game", sectionId: "JG-13", decision: "curated", why: "Claim guidance. A protected zone." },
  { family: "game", sectionId: "JG-14", decision: "deterministic",
    why: "Draw insights, consolidated: AI-D1, AI-D2, AI-D4 and AI-D7 where the data supports them (§C4)." },
  { family: "game", sectionId: "JG-15", decision: "curated", why: "Editorial, with crawlable destinations." },
  { family: "game", sectionId: "JG-16", decision: "none", why: "Community. Human-authored; never fabricated." },
  { family: "game", sectionId: "JG-17", decision: "none",
    why: "Alerts need an account. §16 blocks it, and FD-ACC-14 forbids a control that cannot work." },
  { family: "game", sectionId: "JG-18", decision: "curated", why: "Sources, methodology and responsible play. Protected." },
]);

/* ------------------------------------------------------------------ archive */

const ARCHIVE: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "archive", sectionId: "AR-01", decision: "deterministic",
    why: "The concise year summary — drawing count, span, coverage — counted from the rows on the page." },
  { family: "archive", sectionId: "AR-02", decision: "deterministic",
    why: "Year metrics. Every figure describes the listed drawings and states that it does not predict a future result." },
  { family: "archive", sectionId: "AR-03", decision: "deterministic",
    why: "The year brief (§C5): most-drawn values, longest gaps and notable drawings, each labelled a statistically true historical observation. Per FD-DAT-20 it is NOT labelled AI — there is no model." },
  { family: "archive", sectionId: "AR-04", decision: "deterministic",
    why: "Month navigation carries real per-month drawing counts, and marks a month containing a correction or a rule change." },
  { family: "archive", sectionId: "AR-05", decision: "deterministic",
    why: "The result rows, with a per-row shape and sum. A protected zone: no advertisement and no interruption inside it." },
  { family: "archive", sectionId: "AR-06", decision: "deterministic",
    why: "Search and filters run deterministic code over the rows. Ask-the-Archive is ABSENT per FD-DAT-17, not gated-and-dead." },
  { family: "archive", sectionId: "AR-07", decision: "deterministic",
    why: "Statistics, with the method stated on every view and the neutrality statement above them all." },
  { family: "archive", sectionId: "AR-08", decision: "none",
    why: "Personal archive tools need an account. FD-ACC-08 reserves the position; nothing is drawn." },
  { family: "archive", sectionId: "AR-09", decision: "curated", why: "Editorial inventory, configured." },
  { family: "archive", sectionId: "AR-10", decision: "curated",
    why: "Coverage, sources and methodology. Stated, with the corrections route. Protected." },
  { family: "archive", sectionId: "AR-11", decision: "nextAction",
    why: "Continuation. Filtered to actions that genuinely resolve." },
]);

/* ------------------------------------------------------------------ flagship (BP-04A) */

const FLAGSHIP: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "flagship", sectionId: "FG-01", decision: "deterministic",
    why: "The hero: the drawing, §B2's jackpot movement, §B1's relative next draw, and AI-D1's fingerprint folded in.",
    explainAction: true },
  { family: "flagship", sectionId: "FG-02", decision: "deterministic",
    why: "Ticket checking is deterministic comparison against published rows." },
  { family: "flagship", sectionId: "FG-03", decision: "deterministic",
    why: "The page's ONE shared answer surface. Every chip on the page targets it." },
  { family: "flagship", sectionId: "FG-04", decision: "deterministic",
    why: "Draw intelligence, merged into the hero and the Stats Lab. AI-D1 and AI-D2, computed from the drawn values." },
  { family: "flagship", sectionId: "FG-05", decision: "deterministic",
    why: "Prizes and odds are counted from the verified number matrix, and AI-D7 explains the add-on and the multiplier (§C4)." },
  { family: "flagship", sectionId: "FG-06", decision: "curated",
    why: "Jurisdiction rules, merged into FG-05. Transcribed per state; an unverified note is absent." },
  { family: "flagship", sectionId: "FG-07A", decision: "none",
    why: "The generator is an entertainment tool. Random output must never be described as analysed or improved." },
  { family: "flagship", sectionId: "FG-07B", decision: "deterministic",
    why: "The Stats Lab: ten views, each stating its period, its sample size and its method." },
  { family: "flagship", sectionId: "FG-08", decision: "deterministic",
    why: "The history explorer. Its live filter result feeds the shared answer surface as computed context." },
  { family: "flagship", sectionId: "FG-09", decision: "deterministic",
    why: "AI-D6's jackpot run: rollovers, drawings since the last jackpot, average rise. Descriptive, never projected." },
  { family: "flagship", sectionId: "FG-10", decision: "curated",
    why: "Where it is played, merged into FG-15. Transcribed jurisdiction list." },
  { family: "flagship", sectionId: "FG-11", decision: "curated", why: "Tagged guides, merged into FG-13." },
  { family: "flagship", sectionId: "FG-12", decision: "curated", why: "Tagged news, merged into FG-13." },
  { family: "flagship", sectionId: "FG-13", decision: "curated",
    why: "The integrated tagged-content module. Human-authored; a generated summary needs a provider." },
  { family: "flagship", sectionId: "FG-14", decision: "none",
    why: "Alerts and follow, merged into FG-09. Account capability; §16 blocks it and nothing is drawn as disabled." },
  { family: "flagship", sectionId: "FG-15", decision: "curated",
    why: "Trust, responsible play and the FAQ. Generated from the page's own facts so it cannot contradict them. Protected." },
]);

/* ------------------------------------------------------------------ News (07A hub, 07B article) */

/*
 * The News family runs on a review corpus with no model connected, so no entry claims a layer it does not have:
 * the corpus's own dated facts are `curated`, the honest empty rankings are `none` with the reason recorded, and
 * the 07B conditional AI slot (NA-07) records the 07 §7 suppression as its decision.
 */
const NEWS: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "news", sectionId: "NH-01", decision: "none",
    why: "The hub identity header states where the reader is. Nothing to explain, and an insight here would delay the feed." },
  { family: "news", sectionId: "NH-02", decision: "curated",
    why: "The top story is an editor-selected dated record; its Bottom Line is editorial ownership (07B §5)." },
  { family: "news", sectionId: "NH-03", decision: "none",
    why: "Jackpot Watch is unavailable until a real feed connects; explaining an absent figure would be theatre." },
  { family: "news", sectionId: "NH-04", decision: "curated",
    why: "The latest feed lists editor-written dated records with their categories and dates." },
  { family: "news", sectionId: "NH-05", decision: "none",
    why: "Winners and unclaimed prizes render an honest empty state — there is no verified content to add a layer to." },
  { family: "news", sectionId: "NH-06", decision: "none",
    why: "The state selector is navigation. No IP inference, no personalisation, no insight — links and a filter (07A §9)." },
  { family: "news", sectionId: "NH-07", decision: "curated",
    why: "Guides and Research are editor-written evergreen pieces carrying their own distinct labels (07A §10)." },
  { family: "news", sectionId: "NH-08", decision: "none",
    why: "Trending is a backend aggregate over real behaviour (07 §11). Empty until real readership exists; never seeded." },
  { family: "news", sectionId: "NH-09", decision: "none",
    why: "Most Discussed needs real contributors and reply depth (07 §11). Empty until a community platform connects." },
  { family: "news", sectionId: "NH-10", decision: "none",
    why: "Most Read is readership only (07 §11). Empty until real measurement exists; counts are never invented." },
  { family: "news", sectionId: "NH-11", decision: "none",
    why: "Community content is human-authored and none exists yet; fabricating activity is prohibited outright." },
  { family: "news", sectionId: "NH-12", decision: "none",
    why: "No approved event package exists (07A §13), so the module renders its recorded empty state." },
  { family: "news", sectionId: "NH-13", decision: "nextAction",
    why: "Alerts and digests point at the real account routes — the one relevant continuation from a news surface." },
  { family: "news", sectionId: "NH-14", decision: "curated",
    why: "Trust, reporters and policies: the accountable author identity and the live policy routes, transcribed." },
  { family: "news", sectionId: "NA-01", decision: "curated",
    why: "Category, entities and status are governed taxonomy values (07 §20), written by the editor." },
  { family: "news", sectionId: "NA-04", decision: "curated",
    why: "The Bottom Line is one or two human-written or editor-approved sentences (07B §5)." },
  { family: "news", sectionId: "NA-05", decision: "deterministic",
    why: "The data card transcribes effective-date format facts from the production-derived records. No inference." },
  { family: "news", sectionId: "NA-06", decision: "curated",
    why: "The main article is reporter/editor-owned prose over verified attribution (07B §6)." },
  { family: "news", sectionId: "NA-07", decision: "none",
    why: "The conditional AI slot is SUPPRESSED: 07 §7 admits an AI module only when it adds grounded value, and no model is connected, so nothing can pass the acceptance test." },
  { family: "news", sectionId: "NA-08", decision: "curated",
    why: "Why It Matters is editor-written player-oriented significance (07B §9)." },
  { family: "news", sectionId: "NA-09", decision: "deterministic",
    why: "The historical connection uses deterministic LotteryCorner data before any AI explanation (07B §10)." },
  { family: "news", sectionId: "NA-10", decision: "nextAction",
    why: "One relevant primary action, chosen editorially — never a tool wall (07B §11)." },
  { family: "news", sectionId: "NA-11", decision: "curated",
    why: "One focused neutral discussion question tied to the story (07B §12), written by the editor." },
  { family: "news", sectionId: "NA-13", decision: "nextAction",
    why: "Related next actions, maximum three (07C Template A), each a real same-site destination." },
  { family: "news", sectionId: "NA-14", decision: "none",
    why: "Sources, updates and corrections are a verbatim trust record (07 §16); a layer over it would blur what is verified." },
  { family: "news", sectionId: "NA-15", decision: "none",
    why: "Responsible play guidance is protected content; nothing may be layered onto or between its sentences." },
]);

/* ------------------------------------------------------------------ Blog (Conflict 39) */

/*
 * The Blog family (no blueprint; founder-authorized, Conflict 39). Two decisions matter here and both are
 * rulings, not judgement calls: BL-04's Key points are DETERMINISTIC and never described as AI (`FD-DAT-20`),
 * and BL-05's Listen control is the reader's own browser voice — an accessibility affordance, not an
 * intelligence layer, so its recorded decision is `none`.
 */
const BLOG: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "blog", sectionId: "BH-01", decision: "none",
    why: "The hub identity header states where the reader is. Nothing to explain, and an insight here would delay the browse." },
  { family: "blog", sectionId: "BH-02", decision: "deterministic",
    why: "The featured post is the newest by date — arithmetic over the corpus, never a ranking nobody measured." },
  { family: "blog", sectionId: "BH-03", decision: "deterministic",
    why: "Category chips carry real counts over the served corpus, and the filter is a server-side query over one URL." },
  { family: "blog", sectionId: "BH-04", decision: "deterministic",
    why: "The date groups are the corpus grouped by publication month — grouping arithmetic, nothing inferred." },
  { family: "blog", sectionId: "BH-05", decision: "nextAction",
    why: "From the Newsroom is the one recorded cross-link: dated records live on /news, evergreen stays here." },
  { family: "blog", sectionId: "BH-06", decision: "curated",
    why: "Desks and trust: the accountable desk identities and the live policy routes, transcribed." },
  { family: "blog", sectionId: "BL-01", decision: "curated",
    why: "Category, entity and claim-type label are governed vocabulary values, written by the editor." },
  { family: "blog", sectionId: "BL-02", decision: "curated",
    why: "The headline is editor-owned prose." },
  { family: "blog", sectionId: "BL-03", decision: "deterministic",
    why: "Author identity and dates transcribe the record; the reading time is arithmetic over the post's own words." },
  { family: "blog", sectionId: "BL-04", decision: "deterministic",
    why: "Key points are DERIVED from the post's own paragraphs by a fixed rule (blogKeyPoints.ts). FD-DAT-20: deterministic generation is never described as AI, in either direction — so the label is 'Key points' and the block never mentions AI." },
  { family: "blog", sectionId: "BL-05", decision: "none",
    why: "Listen is the reader's browser voice speaking the visible text — an accessibility affordance with no model, no inference and no server; an intelligence claim here would misdescribe the surface." },
  { family: "blog", sectionId: "BL-06", decision: "curated",
    why: "The main article is desk/editor-owned prose over cited repository evidence." },
  { family: "blog", sectionId: "BL-07", decision: "nextAction",
    why: "Related tool/game/state links, chosen editorially — never a tool wall (07B §11 by adoption)." },
  { family: "blog", sectionId: "BL-08", decision: "curated",
    why: "The end-of-post author bio transcribes the desk record: beat, honest biography, More-from links." },
  { family: "blog", sectionId: "BL-09", decision: "none",
    why: "Sources and corrections are a verbatim trust record (07 §16 by adoption); a layer over it would blur what is verified." },
  { family: "blog", sectionId: "BL-10", decision: "none",
    why: "Share is plain intent links plus a copy control over the one canonical URL. No counter exists to compute and none is invented." },
  { family: "blog", sectionId: "BL-11", decision: "deterministic",
    why: "Related posts follow a fixed rule (same category, then shared tags, newest first) — never an engagement ranking, because no readership data exists." },
  { family: "blog", sectionId: "BL-12", decision: "none",
    why: "Responsible play guidance is protected content; nothing may be layered onto or between its sentences." },
]);

/* ------------------------------------------------------------------ Community (08A/08B) */

const COMMUNITY: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "community", sectionId: "CH-01", decision: "none",
    why: "The identity header and composer are the reader's own voice. AI in the composer flow (title/tag inference, 08 §6) needs a model; none is connected, so nothing is drawn (FD-DAT-17)." },
  { family: "community", sectionId: "CH-02", decision: "deterministic",
    why: "Active Now orders visible threads by reply recency and contributor diversity — arithmetic over the corpus, never labelled AI (FD-DAT-20)." },
  { family: "community", sectionId: "CH-03", decision: "deterministic",
    why: "Needs Player Experience derives the 08A §5 labels (no replies; state context) from the records." },
  { family: "community", sectionId: "CH-04", decision: "curated",
    why: "Pick 3/Pick 4 groups governed-tagged entries; the monthly-thread priority is the blueprint's own editorial rule." },
  { family: "community", sectionId: "CH-05", decision: "curated",
    why: "Jackpot Games groups Powerball and Mega Millions entries by tag." },
  { family: "community", sectionId: "CH-06", decision: "none",
    why: "State Communities is a reader-chosen selector. No IP inference, no personalisation (08A §8)." },
  { family: "community", sectionId: "CH-07", decision: "curated",
    why: "Systems and mathematics entries carry their own methodology and Responsible Play labels (08A §9)." },
  { family: "community", sectionId: "CH-08", decision: "none",
    why: "Win stories carry verification states, which are recorded review outcomes, not an intelligence layer." },
  { family: "community", sectionId: "CH-09", decision: "none",
    why: "Scratch-off talk is member conversation; a layer over it would add nothing." },
  { family: "community", sectionId: "CH-10", decision: "curated",
    why: "Dreams and lucky numbers carry the mandatory belief label — classification, not analysis (08A §12)." },
  { family: "community", sectionId: "CH-11", decision: "none",
    why: "News discussions reuse the article's one canonical thread (Template M); the article page owns any context." },
  { family: "community", sectionId: "CH-12", decision: "deterministic",
    why: "Most Helpful ranks by helpful/accepted replies and contributor diversity — never popularity alone, never a visible score (08A §14, 08C §5)." },
  { family: "community", sectionId: "CH-13", decision: "none",
    why: "Following lists what the signed-in reader chose to follow; the anonymous form explains the benefit. No inference." },
  { family: "community", sectionId: "CH-14", decision: "deterministic",
    why: "Poll tallies are counted from the visible replies that state a choice — arithmetic over the thread." },
  { family: "community", sectionId: "CH-15", decision: "curated",
    why: "Guidelines, privacy and scam warnings, and Responsible Play are governed safety copy." },
  { family: "community", sectionId: "FE-01", decision: "none",
    why: "Breadcrumbs, tags and context chips are navigation over governed tags." },
  { family: "community", sectionId: "FE-02", decision: "none",
    why: "Identity is the member's own username and dates, rendered verbatim (08B §4)." },
  { family: "community", sectionId: "FE-03", decision: "none",
    why: "The root post is the member's own words, intact — nothing rewrites or annotates it (08B §5)." },
  { family: "community", sectionId: "FE-04", decision: "none",
    why: "Structured attachments are the poster's declared fields; the poll tally is counted in FE-04's own rendering from visible replies." },
  { family: "community", sectionId: "FE-05", decision: "nextAction",
    why: "Context cards point at the real game, state, archive and news pages the entry references." },
  { family: "community", sectionId: "FE-06", decision: "curated",
    why: "The Research reply is TEAM-AUTHORED per 08D Template H under the one non-human identity (Constitution §32). For reviewer-posted questions the deterministic tier plan (§31 A–D) renders through the shared answer surface — computation and fixed pointers, never generated prose." },
  { family: "community", sectionId: "FE-07", decision: "deterministic",
    why: "Reply sorting and pagination are arithmetic over the visible thread (08 §26)." },
  { family: "community", sectionId: "FE-08", decision: "none",
    why: "Accepted and helpful are the members' own recorded choices, rendered as labels — never counts or scores." },
  { family: "community", sectionId: "FE-09", decision: "deterministic",
    why: "The Community Summary is assembled ONLY from per-reply recorded points, each citing its reply — it cannot manufacture consensus (08B §11). Generative summarisation waits for a provider and the same grounding rule." },
  { family: "community", sectionId: "FE-10", decision: "none",
    why: "The reply composer is the reader's own words. Sign-in is requested only at publish (08 §6)." },
  { family: "community", sectionId: "FE-11", decision: "deterministic",
    why: "Related entries are game/state/tag overlap over the corpus, with the reason shown." },
  { family: "community", sectionId: "FE-12", decision: "none",
    why: "Follow records the reader's own choice in their account. No recommendation is inferred." },
  { family: "community", sectionId: "FE-13", decision: "none",
    why: "Moderation status, the report control and Responsible Play guidance are protected safety surfaces; nothing may be layered onto them." },
]);

/* ------------------------------------------------------------------ Tools (BP-05C, Conflict 42 interim) */

/*
 * The Tools family. The load-bearing decision is TL-02: the Tax Calculator's computation is DETERMINISTIC
 * arithmetic over dated published tables and is never labelled AI (`FD-DAT-20`) — and its plain-language
 * withheld-vs-owed explanation (TL-05) is fixed editorial copy over that output, `curated`, because no model
 * is connected and BP-05C §12's "AI explains deterministic outputs" waits for a provider.
 */
const TOOLS: readonly SectionIntelligenceEntry[] = Object.freeze([
  { family: "tools", sectionId: "TH-01", decision: "none",
    why: "The hub identity header states where the reader is and what the catalog answers. Nothing to explain." },
  { family: "tools", sectionId: "TH-C1", decision: "nextAction",
    why: "Check-and-results is a launcher band: each entry routes to a working tool, and the intelligence lives in the tool it reaches." },
  { family: "tools", sectionId: "TH-C2", decision: "nextAction",
    why: "Jackpot-and-money launcher band, same reasoning as TH-C1." },
  { family: "tools", sectionId: "TH-C3", decision: "nextAction",
    why: "Number-analysis launcher band, same reasoning as TH-C1." },
  { family: "tools", sectionId: "TH-C4", decision: "nextAction",
    why: "Generate-and-systems launcher band, same reasoning as TH-C1." },
  { family: "tools", sectionId: "TH-02", decision: "none",
    why: "The access explainer answers BP-05C §3's 'which tools need sign-in' in plain words. Static truth about gating; a layer over it would blur it." },
  { family: "tools", sectionId: "TH-03", decision: "none",
    why: "Trust and policy links. Navigation and disclosure; nothing to interpret." },
  { family: "tools", sectionId: "TL-01", decision: "none",
    why: "The calculator identity header and prefill provenance. FD-X-03's spirit: the tool itself must be reachable fast; an insight here delays it." },
  { family: "tools", sectionId: "TL-02", decision: "deterministic",
    why: "The calculation: 2026 marginal tables and dated state rates, bracket by bracket, in integer cents (lib/tools/taxCalculator.ts). Never labelled AI (FD-DAT-20)." },
  { family: "tools", sectionId: "TL-03", decision: "none",
    why: "The §20 disclosure block is a verbatim trust record — tax year, assumptions, sources, review owner. A layer over it would blur what is disclosed." },
  { family: "tools", sectionId: "TL-04", decision: "none",
    why: "The §19-style methodology states how every line is computed. It IS the explanation of the deterministic layer; nothing sits above it." },
  { family: "tools", sectionId: "TL-05", decision: "curated",
    why: "The withheld-vs-owed explainer and the interesting fact are fixed editorial copy over the deterministic output. BP-05C §12's generative explanation waits for a provider; nothing generative runs." },
  { family: "tools", sectionId: "TL-06", decision: "nextAction",
    why: "Related destinations — game pages, claim guidance, the cash-vs-annuity guide, the community thread, the hub. One continuation band, no summary." },
  { family: "tools", sectionId: "TL-07", decision: "none",
    why: "Save-scenario is an account continuity control (FD-DAT-04/FD-ACC-12). It stores the reader's own scenario; nothing is inferred." },
]);

/* ------------------------------------------------------------------ the matrix */

export const SECTION_INTELLIGENCE: readonly SectionIntelligenceEntry[] = Object.freeze([
  ...HOME, ...STATE, ...GAME, ...ARCHIVE, ...FLAGSHIP, ...NEWS, ...BLOG, ...COMMUNITY, ...TOOLS,
]);

const BY_KEY = new Map(SECTION_INTELLIGENCE.map((e) => [`${e.family}:${e.sectionId}`, e]));

/**
 * The recorded decision for one section.
 *
 * Returns `undefined` for an unknown pair rather than defaulting to `none`: a MISSING decision and a decision OF
 * `none` are different things, and collapsing them is how §10.5 coverage silently develops a hole. The coverage
 * test asserts every governed section in every family has an entry.
 */
export function sectionIntelligence(
  family: IntelligenceFamily,
  sectionId: string,
): SectionIntelligenceEntry | undefined {
  return BY_KEY.get(`${family}:${sectionId}`);
}

/** The decision alone, for a component that only needs the `data-intelligence` value. */
export function intelligenceOf(family: IntelligenceFamily, sectionId: string): SectionIntelligence {
  return BY_KEY.get(`${family}:${sectionId}`)?.decision ?? "none";
}

/** Sections that carry a result and therefore need a contextual Explain action (`FD-X-08`). */
export function explainActionSections(family: IntelligenceFamily): string[] {
  return SECTION_INTELLIGENCE.filter((e) => e.family === family && e.explainAction).map((e) => e.sectionId);
}

/* ------------------------------------------------------------------ §C3 audit attributes */

/**
 * The §10.5 attributes for a section that builds its own `<section>` element.
 *
 * WHY THIS EXISTS. Three of the five families compose their sections directly rather than through
 * `UniversalSection` — the flagship because its hero owns the page `<h1>`, the Game Page and the archive because
 * their `switch` statements predate the shared chrome. Migrating all ~45 of those elements is a larger refactor than
 * this task's incremental §A1 mandate, but §10.5 coverage must be readable off the RENDERED PAGE and not only out of
 * the matrix — an audit reads HTML, not a TypeScript table.
 *
 * So the decision is emitted from the same matrix `UniversalSection` reads, spread onto whatever element the family
 * already builds. One source, two ways of reaching the DOM, and no possibility of the two disagreeing.
 */
export function sectionAuditAttributes(
  family: IntelligenceFamily,
  sectionId: string,
): { "data-intelligence": SectionIntelligence; "data-intelligence-source": "matrix" } {
  return {
    "data-intelligence": intelligenceOf(family, sectionId),
    "data-intelligence-source": "matrix",
  };
}
