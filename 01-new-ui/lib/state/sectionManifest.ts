/*
 * Typed PF-02 State section manifest — the governed anonymous sequence.
 *
 * Task LRG-STATE-021 §5. Authority: FD-S-04 ("Use the exact PF-02 section IDs and default ordering…
 * Do not create a generic page-builder framework. A typed State-specific section manifest and resolver
 * are sufficient."); PF-02 §12 (the sequence), §60 (protected zones), §64A (fragments).
 *
 * SCOPE DISCIPLINE. This is a State-specific typed list, not a CMS. There is no plugin registry, no
 * dynamic component lookup by string, no schema language and no cross-family abstraction. The sequence
 * is 25 literal entries, and the resolver that consumes it is ~80 lines.
 */

/** The 25 governed anonymous positions of PF-02 §12. */
export type StateSectionId =
  | "S-01" | "AD-S00" | "S-02" | "S-03" | "AD-S01" | "S-04" | "S-05" | "S-06" | "AD-S02"
  | "S-07" | "S-08" | "S-08A" | "S-09" | "S-10" | "AD-S03" | "S-11" | "S-12" | "S-13"
  | "S-14" | "S-15" | "S-16" | "S-17" | "S-18" | "AD-S04" | "Footer";

export type SectionKind = "content" | "adAnchor" | "footer";

/** PF-02 §4. `requiredAtExperienceLevel` is S-05's specific wording. */
export type Requirement = "required" | "requiredHub" | "requiredAtExperienceLevel" | "conditional";

/**
 * Why a section is not rendering. Every absence carries one (PF-02 §1 principle 11: "Every conditional
 * module records why it is shown or suppressed").
 */
export type SuppressionCause =
  | "no-verified-data"
  | "synthetic-only-data"
  | "fd-s-02-unsourced"
  | "blocked-member-insider"
  | "no-real-destination"
  | "not-implemented-this-task"
  /**
   * The section's content is rendered INSIDE a neighbouring section rather than in a box of its own.
   *
   * Distinct from every other cause, and the distinction matters: the others mean *the reader does not get this
   * content*. This one means *the reader gets it, somewhere else*. Conflating them is how a required section
   * silently disappears — see `STATE_MERGED_SECTIONS`.
   */
  | "merged-into-neighbour";

export interface StateSectionEntry {
  id: StateSectionId;
  order: number;
  kind: SectionKind;
  name: string;
  requirement: Requirement;
  /** PF-02 §64A stable fragment, where the blueprint defines one. */
  fragment?: string;
  /** True when advertising, promotion and interruption are prohibited INSIDE this section (PF-02 §60). */
  protectedZone: boolean;
  /**
   * True when a rail or mobile-inline advertisement may only accompany this section if the section
   * carries substantive real content (APP-ST-01 / APP-ST-04 / APP-ST-05). S-14 and S-15 only.
   */
  hostEligibilityRequired?: boolean;
  /** Mobile step in PF-02 §46's anonymous mobile order, where one maps. */
  mobileStep?: number;
}

/**
 * The governed sequence, verbatim from PF-02 §12. Order values are the blueprint's own numbering.
 *
 * This array is the single source of section order. It is asserted against PF-02 in the tests, so
 * drift is a test failure rather than silent documentation rot.
 */
export const STATE_SECTIONS: readonly StateSectionEntry[] = Object.freeze([
  { id: "S-01", order: 1, kind: "content", name: "State Identity and Task Header", requirement: "required", protectedZone: true, mobileStep: 1 },
  { id: "AD-S00", order: 2, kind: "adAnchor", name: "Top State Advertisement", requirement: "required", protectedZone: false, mobileStep: 2 },
  { id: "S-02", order: 3, kind: "content", name: "Latest State Results", requirement: "required", fragment: "latest-results", protectedZone: true, mobileStep: 3 },
  { id: "S-03", order: 4, kind: "content", name: "State AI Brief", requirement: "required", protectedZone: true, mobileStep: 5 },
  { id: "AD-S01", order: 5, kind: "adAnchor", name: "Post-Results Advertisement", requirement: "required", protectedZone: false, mobileStep: 4 },
  { id: "S-04", order: 6, kind: "content", name: "Live and Upcoming Draws", requirement: "conditional", fragment: "live-draws", protectedZone: true, mobileStep: 6 },
  { id: "S-05", order: 7, kind: "content", name: "Check My State Ticket", requirement: "requiredAtExperienceLevel", fragment: "check-ticket", protectedZone: true, mobileStep: 7 },
  { id: "S-06", order: 8, kind: "content", name: "State Game Portfolio", requirement: "required", fragment: "games", protectedZone: false, mobileStep: 9 },
  { id: "AD-S02", order: 9, kind: "adAnchor", name: "Post-Games Advertisement", requirement: "required", protectedZone: false, mobileStep: 8 },
  { id: "S-07", order: 10, kind: "content", name: "Where to Play / Buy Online", requirement: "conditional", fragment: "where-to-play", protectedZone: false, mobileStep: 10 },
  { id: "S-08", order: 11, kind: "content", name: "Claims, Taxes, Anonymity and Player Help", requirement: "required", fragment: "claim-prize", protectedZone: true, mobileStep: 11 },
  { id: "S-08A", order: 12, kind: "content", name: "State Essentials", requirement: "required", fragment: "state-essentials", protectedZone: true, mobileStep: 12 },
  { id: "S-09", order: 13, kind: "content", name: "Worth Knowing in This State", requirement: "conditional", protectedZone: false, mobileStep: 13 },
  { id: "S-10", order: 14, kind: "content", name: "State Tools, History and Statistics", requirement: "conditional", protectedZone: false, mobileStep: 14 },
  { id: "AD-S03", order: 15, kind: "adAnchor", name: "Lower Utility Advertisement", requirement: "required", protectedZone: false },
  { id: "S-11", order: 16, kind: "content", name: "Scratchers / Instant Games", requirement: "conditional", fragment: "scratchers", protectedZone: false, mobileStep: 15 },
  { id: "S-12", order: 17, kind: "content", name: "Winners and Unclaimed Prizes", requirement: "conditional", protectedZone: true, mobileStep: 16 },
  { id: "S-13", order: 18, kind: "content", name: "State Lottery Impact / Fund Allocation", requirement: "conditional", protectedZone: false, mobileStep: 17 },
  { id: "S-14", order: 19, kind: "content", name: "State Community / Forums", requirement: "requiredHub", fragment: "community", protectedZone: false, hostEligibilityRequired: true, mobileStep: 18 },
  { id: "S-15", order: 20, kind: "content", name: "State News, Blog and Guides", requirement: "requiredHub", fragment: "news", protectedZone: false, hostEligibilityRequired: true, mobileStep: 19 },
  { id: "S-16", order: 21, kind: "content", name: "Follow State / My LotteryCorner", requirement: "required", protectedZone: false, mobileStep: 20 },
  { id: "S-17", order: 22, kind: "content", name: "State Sources, Responsible Play and Support", requirement: "required", protectedZone: true, mobileStep: 21 },
  { id: "S-18", order: 23, kind: "content", name: "All States / Change State", requirement: "required", protectedZone: false, mobileStep: 21 },
  { id: "AD-S04", order: 24, kind: "adAnchor", name: "Pre-Footer Advertisement", requirement: "required", protectedZone: false, mobileStep: 22 },
  { id: "Footer", order: 25, kind: "footer", name: "Global Footer", requirement: "required", protectedZone: false, mobileStep: 22 },
]);

/**
 * ══ SECTIONS RENDERED INSIDE A NEIGHBOUR — §A3 ══
 *
 * Adopted from `FLAGSHIP_MERGED_SECTIONS`, which solved this exact problem on BP-04A first.
 *
 * ══ THE DEFECT THIS CLOSES ══
 *
 * `StatePreview` carried `case "S-16": return null;` and `case "S-17": return null;`. Both are `required` in the
 * sequence above, and the resolver marked S-16 `rendered(...)` and left S-17 at the loop's `rendered()` default —
 * so the model said "this required section renders" and the component drew nothing. Silent, and invisible to every
 * audit: `renderedSectionIds` counted them, `data-visible-sections` listed them, the ad-reachability check trusted
 * them, and `data-suppressed-sections` did not name them. A required section returning `null` is exactly the
 * failure PF-02 §12's "every conditional module records why it is shown or suppressed" exists to prevent.
 *
 * ══ WHY MERGE, AND WHY ONLY S-17 ══
 *
 * LRG-STATE-042 replaced S-17's old "Sources and methodology" box with the approved **Resources and player
 * support** band — and rendered that band inside **S-18**, at `#state-sources`. So S-17's subject (State sources,
 * responsible play and support) IS on the page, in a neighbour, under the fragment S-17 used to own. That is a
 * merge, and recording it as one is truthful.
 *
 * **S-16 is not merged, it is blocked.** "Follow State / My LotteryCorner" is a Member capability, and
 * `CLAUDE.md` §16 forbids implementing Member/Insider routes, quotas, saved records or follow behaviour until the
 * open founder decisions close. There is no neighbour that carries it, so it records `blocked-member-insider`
 * with the reason, and nothing is drawn — never a disabled Follow button (FD-S-08 / `FD-ACC-14`).
 *
 * The section IDs, their order and their requirement level are all unchanged. Only where their content is drawn
 * differs, and the destination travels with the record.
 */
export const STATE_MERGED_SECTIONS: Readonly<Record<string, StateSectionId>> = Object.freeze({
  "S-17": "S-18",
});

/** The default order — exactly PF-02 §12, with no override applied. */
export const DEFAULT_ORDER: readonly StateSectionId[] = Object.freeze(
  STATE_SECTIONS.map((s) => s.id),
);

export function section(id: StateSectionId): StateSectionEntry {
  const s = STATE_SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown State section id: ${id}`);
  return s;
}

/** Sections inside which advertising is prohibited (PF-02 §60). Used by the ad-baseline guard. */
export function protectedSectionIds(): StateSectionId[] {
  return STATE_SECTIONS.filter((s) => s.protectedZone).map((s) => s.id);
}

/** Sections whose advertising requires substantive real content (APP-ST-04 / APP-ST-05). */
export function hostEligibilitySectionIds(): StateSectionId[] {
  return STATE_SECTIONS.filter((s) => s.hostEligibilityRequired).map((s) => s.id);
}

/* ---------------------------------------------------------------------------
 * Per-render section state — what the resolver produces for one page.
 * ------------------------------------------------------------------------- */

export type SectionRenderState =
  | { render: true; unavailableNote?: string }
  | { render: false; cause: SuppressionCause; reason: string };

export function rendered(unavailableNote?: string): SectionRenderState {
  return unavailableNote ? { render: true, unavailableNote } : { render: true };
}

export function suppressed(cause: SuppressionCause, reason: string): SectionRenderState {
  return { render: false, cause, reason };
}
