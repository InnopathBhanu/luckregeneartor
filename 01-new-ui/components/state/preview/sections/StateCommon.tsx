/*
 * Shared primitives for the guarded State preview sections.
 *
 * Task LRG-STATE-021. Small, presentational, and free of any state-code branch: everything they render
 * comes from the resolved model.
 */

import type { ReactNode } from "react";
import type { StateSectionEntry } from "@/lib/state/sectionManifest";
import { readerCopy } from "@/lib/state/stateReaderCopy";
import {
  LastUpdated, UniversalSection,
  type SectionIntelligence, type SectionSourceClass, type SectionState,
} from "@/components/shell/SectionChrome";

/**
 * One governed section — now the shared BP-01 §42–§45 anatomy, wearing State's skin.
 *
 * ══ WHAT CHANGED (§A1), AND WHAT DID NOT ══
 *
 * This used to be State's own `<section>` with its own attribute list and its own heading-id rule. It now
 * DELEGATES to `UniversalSection`, so the §42 anatomy, the §44 header contract and the §43 state vocabulary are
 * defined once for all five families instead of five times.
 *
 * REUSE CLASSIFICATION: **MERGE** — State's wrapper is absorbed into the shared primitive; the State-specific
 * parts (the `StateSectionEntry` shape, the `variant` treatments, PF-02's fragment rule) stay here because they
 * are State's, not everyone's.
 *
 * NOTHING VISUAL MOVED. `family="state"` keeps `.lcs-section`, `.lcs-section--ai`, `.lcs-h2` and `.lcs-lede`
 * exactly as the stylesheet already has them, and every `data-*` attribute State previously emitted is still
 * emitted — `data-section-id`, `data-section-order`, `data-requirement`, `data-protected-zone`,
 * `data-section-variant` and `data-host-eligibility-required`. Three attributes are ADDED, all §42 items the State
 * page had no way to record: `data-source-class`, `data-intelligence` (§10.5) and `data-section-state` (§43).
 */
export function SectionShell({
  entry,
  heading,
  lede,
  children,
  headingId,
  variant = "plain",
  sourceClass,
  intelligence,
  state,
  libraryId,
  mergedFrom,
  headingAction,
  footer,
}: {
  entry: StateSectionEntry;
  heading: string;
  lede?: string;
  children?: ReactNode;
  headingId?: string;
  /** §42.4 — where this section's content came from. */
  sourceClass?: SectionSourceClass;
  /** §10.5 — the recorded Section Intelligence decision. Defaults to the documented `none`. */
  intelligence?: SectionIntelligence;
  /** §43 — the state this section is in. */
  state?: SectionState;
  /** The shared Section Library id (`SL-U02`, `SL-I02`…), where one applies. */
  libraryId?: string;
  /** Governed ids whose content this section ABSORBS — see `STATE_MERGED_SECTIONS`. */
  mergedFrom?: readonly string[];
  /** §44's one optional compact action. */
  headingAction?: ReactNode;
  /** §45's source/method/correction/continuation/disclosure block. */
  footer?: {
    sourceUpdated?: ReactNode;
    method?: ReactNode;
    correction?: ReactNode;
    continuation?: ReactNode;
    disclosure?: ReactNode;
  };
  /**
   * LRG-STATE-031: a section's visual treatment.
   *
   * `plain` is every ordinary section. `ai` gives the AI module its own visible identity, because founder
   * review could not find the AI experience when it looked identical to everything around it. `compact`
   * reduces a supporting section's vertical weight so trust and community content cannot outweigh results.
   *
   * `engagement` (LRG-STATE-034) is a landing-page module the reader is meant to ACT in — community and
   * discussion — as distinct from a routed summary they only read.
   *
   * This is styling only — the id, fragment, heading level, order and protected-zone status are unchanged
   * in every variant. The experience rule is that a section id does not entitle a section to equal visual
   * weight; it never changes what the section IS.
   */
  variant?: "plain" | "ai" | "compact" | "engagement";
}) {
  /*
   * PF-02 §64A fragments, and the LRG-STATE-030 duplicate-id fix, both live in the shared primitive now: it
   * derives the heading id from the section id, so a caller can no longer hand the section and its `<h2>` the
   * same string. `headingId` is still accepted because several sections pass a legacy anchor
   * (`#state-tools`, `#state-sources`) — those are SECTION fragments, so they are routed to `fragment`, which is
   * where they belonged all along.
   *
   * FD-S-33: legacy fragments are alias targets only where a dependency is demonstrated. None is demonstrated in
   * this repository, so none is emitted.
   */
  const fragment = entry.fragment ?? headingId;
  return (
    <UniversalSection
      family="state"
      className={variant === "plain" ? undefined : `lcs-section--${variant}`}
      anatomy={{
        sectionId: entry.id,
        heading,
        ...(lede ? { context: lede } : {}),
        ...(fragment ? { fragment } : {}),
        ...(libraryId ? { libraryId } : {}),
        order: entry.order,
        requirement: entry.requirement,
        protectedZone: entry.protectedZone,
        sourceClass: sourceClass ?? "configured",
        /*
         * §C3 DEFECT FIX, caught in the rendered DOM at 375px.
         *
         * This read `intelligence ?? "none"`, which SHORT-CIRCUITED the Section Intelligence Matrix: `UniversalSection`
         * falls back to the matrix only when the prop is `undefined`, and a hardcoded `"none"` is not undefined. The
         * measured effect was that twelve of the State page's thirteen sections reported `data-intelligence="none"` —
         * including S-02 (latest results) and S-03 (the answer surface), both of which the matrix records as
         * `deterministic`. §10.5 coverage would have been technically present and substantively wrong, which is worse
         * than absent because it reads as compliance.
         *
         * The prop is now passed through untouched, so an explicit value wins and everything else inherits the matrix.
         */
        ...(intelligence ? { intelligence } : {}),
        state: state ?? "fresh",
      }}
      {...(headingAction ? { headingAction } : {})}
      {...(footer ? { footer: { family: "state" as const, ...footer } } : {})}
      /* State-specific markers the shared anatomy has no opinion about. */
      extraAttributes={{
        "data-section-variant": variant,
        ...(entry.hostEligibilityRequired ? { "data-host-eligibility-required": "true" } : {}),
        ...(mergedFrom && mergedFrom.length > 0 ? { "data-merged-sections": mergedFrom.join(",") } : {}),
      }}
    >
      {children}
    </UniversalSection>
  );
}

/**
 * The visible form of "Currently unavailable" (FD-S-02, PF-02 §64B, §21A).
 *
 * It states what is missing and why, and offers an authoritative destination where one exists. It never
 * substitutes a generic state-name-filled sentence for the missing fact.
 */
export function Unavailable({
  what,
  reason,
  officialUrl,
  officialLabel,
}: {
  what: string;
  reason?: string;
  officialUrl?: string;
  officialLabel?: string;
}) {
  /* LRG-STATE-031 §9. Callers pass the manifest's `source` field here, which is REVIEWER evidence and
     contained `[O2]`, `NOTE:`, `FD-X-02`, `underReview`, `retailOnly` and "fixture" — all of which reached
     the reader. The provenance data is unchanged; it is cleaned on the way to the screen. */
  const readable = readerCopy(reason, "We have not verified this yet, so we are not stating it.");
  return (
    <div className="lcs-unavailable" data-unavailable="true" data-reader-copy="cleaned">
      <p>
        <strong>{what}: currently unavailable.</strong> {readable}
      </p>
      {officialUrl ? (
        <p style={{ marginTop: 8 }}>
          <a href={officialUrl} rel="noopener noreferrer external" target="_blank">
            {officialLabel ?? "Check the official source"}
          </a>
        </p>
      ) : null}
    </div>
  );
}

/** DS-29 attribution treatments. Text-led — no icon set is approved (DS-32), so text must suffice. */
export function Attribution({
  kind,
  children,
}: {
  kind: "source" | "ai" | "community" | "editorial" | "correction" | "preview";
  children: ReactNode;
}) {
  return (
    <span className={`lcs-attr lcs-attr--${kind}`} data-attribution={kind}>
      {children}
    </span>
  );
}

/**
 * An external destination, in reader-facing language — LRG-STATE-039 §3.
 *
 * WHAT THIS REPLACES. Official links were rendered as a `VERIFIED` or `OFFICIAL SOURCE` badge followed by a
 * name, and sometimes a trailing "· official site". Three signals for one idea, and two of them were internal
 * vocabulary. A reader does not need to be told a link was verified; they need to know where it goes and that
 * it leaves the site.
 *
 * WHAT IT IS NOW. The destination's own name plus a `↗` marker, with an accessible label that says the link
 * opens the external site — so the marker is never the only signal, and a screen reader announces the
 * destination rather than an arrow glyph.
 *
 * The provenance did not move: only destinations that are `verified` in the State Content Manifest are ever
 * passed here, and the citation, source URL and access date stay in the manifest.
 */
export function ExternalLink({
  href,
  children,
  siteName,
}: {
  href: string;
  children: ReactNode;
  /** Named in the accessible label, so "opens Florida Lottery" is spoken rather than "opens external site". */
  siteName?: string;
}) {
  return (
    <a
      className="lcs-extlink"
      href={href}
      rel="noopener noreferrer external"
      target="_blank"
      data-external="true"
    >
      {children}
      <span className="lcs-extlink__mark" aria-hidden="true">↗</span>
      <span className="lcs-vh"> (opens {siteName ?? "the official site"} in a new tab)</span>
    </a>
  );
}

/**
 * Source and freshness line (PF-02 §13, §56).
 *
 * A stale feed is labelled, never silently presented as current. The production-derived date is not
 * rewritten to look fresh.
 */
export function SourceFreshness({
  lastUpdatedIso,
  daysOld,
  stale,
  timezoneLabel,
  sourceName,
}: {
  lastUpdatedIso?: string;
  daysOld: number | null;
  stale: boolean;
  timezoneLabel?: string;
  sourceName?: string;
}) {
  /* An absent governed value is an honest "unavailable", never today's date substituted in. The shared
     primitive renders that case too, so the sentence exists once. */
  if (!lastUpdatedIso) return <LastUpdated family="state" iso={null} />;
  /*
   * LRG-STATE-039 §1 — THE ONE PUBLIC SOURCE-AND-FRESHNESS LINE.
   *
   * This carried a `SOURCE CHECKED` badge, and seven more provenance badges appeared further down the page.
   * The founder principle is that provenance must GOVERN the content, not BECOME it: a reader wants to know
   * when the page was updated and where the numbers come from, once, in a sentence.
   *
   * Nothing was deleted from the model. `data-last-updated` still carries the exact governed timestamp,
   * `data-freshness` still carries the computed state, and the full evidence chain — citations, access dates,
   * publication gates — stays in the State Content Manifest where the tests and editorial tooling read it.
   *
   * ══ §A7 — IT IS NOW THE SHARED PRIMITIVE ══
   *
   * REUSE CLASSIFICATION: **MERGE**. The date arithmetic that used to live in this function moved to
   * `lib/text/lastUpdated.ts`, and the line is drawn by the shared `LastUpdated` component — the same one the
   * flagship hub, the Game Page and the archive now render. Five families printed this one fact in four different
   * shapes; there is one shape.
   *
   * TWO THINGS CHANGED VISIBLY, both deliberately:
   *   - the words are "Last updated" rather than "Updated", which is the wording `CLAUDE.md` §20's pre-merge
   *     checklist and the archive's own AR-10 already used;
   *   - the class is the family's `-fine -muted` pair rather than `.lcs-lede`, so the line reads as fine print
   *     rather than as a section introduction. `data-freshness`, `data-last-updated` and the stale badge are
   *     byte-identical.
   *
   * `Intl` is still not used with a runtime locale: the format is fixed so server and client render identically
   * and the output cannot drift with the viewer's machine.
   */
  return (
    <LastUpdated
      family="state"
      iso={lastUpdatedIso}
      {...(timezoneLabel ? { timezoneLabel } : {})}
      {...(sourceName ? { sourceName } : {})}
      daysOld={daysOld}
      stale={stale}
    />
  );
}

/**
 * Supporting detail that COLLAPSES ON MOBILE and is always open on desktop — LRG-STATE-031 §11.
 *
 * WHY. Founder review called the lower page "fragmented". The measured cause on a 390px viewport was four
 * supporting tables costing 1,600px / 1,077px / 1,043px / 908px each — a 15,500px document in which trust,
 * schedule and directory content carried more vertical weight than the results.
 *
 * HOW, AND WHY THIS EXACT MECHANISM.
 * `<details>` renders closed on mobile, and the desktop rule below force-shows its content, so:
 *   - the markup is IDENTICAL at both viewports — no duplicated DOM, no two copies of a table;
 *   - the content is in the SERVER HTML at both viewports and stays crawlable, which `<details>` guarantees
 *     and a client-side toggle would not (CLAUDE.md §11);
 *   - desktop never shows a pointless accordion, because the summary is hidden there;
 *   - nothing depends on JavaScript.
 *
 * NOT FOR RESULTS. Result content, correction notices, claim guidance and the AI answer surface are never
 * wrapped in this. The reason the reader arrived is never something they have to open.
 */
export function MobileDetail({
  summary,
  children,
  count,
}: {
  /** A MEANINGFUL summary (§11) — it says what is inside, never "More". */
  summary: string;
  children: ReactNode;
  /** Optional item count, so the reader knows the size of what they are opening. */
  count?: number;
}) {
  return (
    <details className="lcs-mdetail" data-mobile-detail="true">
      <summary className="lcs-mdetail__summary">
        {summary}
        {count !== undefined ? <span className="lcs-mdetail__count"> ({count})</span> : null}
      </summary>
      <div className="lcs-mdetail__body">{children}</div>
    </details>
  );
}

/** A recorded suppression, rendered only in the guarded preview so a reviewer can see the reasoning. */
export function SuppressionNote({ id, reason }: { id: string; reason: string }) {
  return (
    <p
      className="lcs-lede"
      style={{ fontSize: "0.8125rem" }}
      data-suppressed-section={id}
      data-suppression-reason={reason}
    >
      <Attribution kind="preview">Preview note</Attribution> {id} is suppressed: {reason}
    </p>
  );
}
