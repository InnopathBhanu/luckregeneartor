/*
 * THE UNIVERSAL SECTION CHROME — BP-01 (Global Shell v1.1) §42–§45.
 *
 * Authority: Global Shell v1.1 §42 (universal section anatomy), §43 (universal section states), §44 (section
 * header pattern), §45 (section footer pattern), Part IX–XI (the `SL-*` section library ids).
 *
 * ══ WHY THIS EXISTS ══
 *
 * Five page families each grew their own section wrapper: `.lcp-section` (Home), `.lcs-section` (State),
 * `.lcg-section` (Game and archive), `.lca-*` (archive detail) and `.lcfg-section` (flagship). Each one
 * re-derived the same four things — the heading contract, the id/`aria-labelledby` pairing, the governance
 * `data-*` attributes and the "what does an absent section look like" answer — and they had already drifted:
 * the archive emitted no `data-requirement`, the flagship emitted no heading id contract at all, and only State
 * carried a protected-zone marker.
 *
 * §42 defines ONE anatomy for every reusable section. This module implements it once.
 *
 * ══ WHAT IT DOES NOT DO ══
 *
 * It does NOT change any family's visual language, and it does NOT change any blueprint-mandated section order.
 * The `family` prop selects which existing class prefix the wrapper writes, so a migrated section keeps the exact
 * class names the stylesheet already styles. This is a chrome unification, not a restyle: a restyle is a separate,
 * separately-approved task (`CLAUDE.md` §8, "Every page-family implementation REQUIRES its own desktop and mobile
 * review and founder approval").
 *
 * It is also NOT a page-builder. There is no component registry, no string-keyed lookup and no schema language —
 * FD-S-04 rules those out explicitly. It is four presentational primitives and one typed state union.
 */

import type { ReactNode } from "react";
import { formatLastUpdated } from "@/lib/text/lastUpdated";
import {
  CLASS_PREFIX, type SectionAnatomyBase, type SectionFamily, type SectionState,
} from "@/lib/shell/sectionContract";
import { intelligenceOf } from "@/lib/ai/sectionIntelligence";

/* ------------------------------------------------------------------ §42 identity */

/*
 * The TYPES and the CONSTANTS moved to `lib/shell/sectionContract.ts`.
 *
 * A view model has to speak this contract — `statePreviewModel`, `flagshipPageModel` and `archiveModel` all decide
 * which sections render and why — and a model importing a type from a `.tsx` component would invert the dependency
 * direction the rest of the codebase keeps. They are re-exported here so a component importing the chrome does not
 * need a second import.
 */
export type {
  SectionFamily, SectionSourceClass, SectionIntelligence, SectionState,
} from "@/lib/shell/sectionContract";
export { SECTION_STATES, SECTION_INTELLIGENCE_KINDS } from "@/lib/shell/sectionContract";

/**
 * The §42 anatomy of one rendered section, with the heading narrowed to a React node.
 *
 * `heading` is `ReactNode` rather than `string` so a family can put its own mark beside the words — the flagship AI
 * section carries the assistant glyph inside its `<h2>`. `aria-labelledby` points at that element, so the accessible
 * name is whatever the node renders as text.
 */
export interface SectionAnatomy extends SectionAnatomyBase {
  heading: ReactNode;
}

/* ------------------------------------------------------------------ §44 header */

/**
 * §44 — the section header.
 *
 * "Do not place multiple competing CTA buttons in the heading." The API enforces that: `action` is one node, not
 * a list, so a second heading CTA cannot be added without changing this type.
 */
export function SectionHeader({
  family,
  headingId,
  heading,
  context,
  dataPeriod,
  action,
  level = 2,
}: {
  family: SectionFamily;
  headingId: string;
  heading: ReactNode;
  context?: string;
  dataPeriod?: string;
  /** §44's "optional compact action". Exactly one. */
  action?: ReactNode;
  /** 2 for an ordinary section; 3 where the family nests sections under a band heading. */
  level?: 2 | 3;
}) {
  const p = CLASS_PREFIX[family];
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <div className={`${p}-sec__head`} data-section-head="true">
      <Heading className={`${p}-h${level}`} id={headingId}>
        {heading}
      </Heading>
      {context ? <p className={`${p}-lede`}>{context}</p> : null}
      {dataPeriod ? (
        <p className={`${p}-fine ${p}-muted`} data-data-period={dataPeriod}>
          {dataPeriod}
        </p>
      ) : null}
      {action ? <div className={`${p}-sec__headaction`}>{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ §45 footer */

/**
 * §45 — the section footer.
 *
 * "It must not become a repetitive disclaimer block." Enforced structurally: the footer renders NOTHING when it
 * has no real content, it accepts at most ONE continuation, and the disclosure slot is a single line. A family
 * that wants three disclaimers has to add three separate elements of its own, visibly, rather than by passing an
 * array here.
 */
export function SectionFooter({
  family,
  sourceUpdated,
  method,
  correction,
  continuation,
  disclosure,
}: {
  family: SectionFamily;
  /** "Last updated …" / "Results from …". Use `LastUpdated` so every family prints the same shape. */
  sourceUpdated?: ReactNode;
  /** How a figure was calculated. */
  method?: ReactNode;
  /** Correction notice or "report an issue" route. */
  correction?: ReactNode;
  /** §45's "one best continuation". Exactly one. */
  continuation?: ReactNode;
  /** Affiliate, advertising or AI disclosure — one line. */
  disclosure?: ReactNode;
}) {
  const p = CLASS_PREFIX[family];
  const has = sourceUpdated || method || correction || continuation || disclosure;
  if (!has) return null;
  return (
    <div className={`${p}-sec__foot`} data-section-foot="true">
      {sourceUpdated ? <p className={`${p}-fine ${p}-muted`}>{sourceUpdated}</p> : null}
      {method ? <p className={`${p}-fine ${p}-muted`} data-method="true">{method}</p> : null}
      {correction ? <p className={`${p}-fine`} data-correction-route="true">{correction}</p> : null}
      {continuation ? <p className={`${p}-fine`} data-continuation="true">{continuation}</p> : null}
      {disclosure ? <p className={`${p}-fine ${p}-muted`} data-disclosure="true">{disclosure}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ §42 wrapper */

/**
 * ONE governed section.
 *
 * Everything §42 asks a section to carry reaches the DOM here, so a composition audit reads the page rather than
 * the model, and the Section Intelligence Matrix (§10.5) is verifiable from rendered HTML.
 *
 * THE HEADING ID CONTRACT. A section's stable fragment belongs to the SECTION; the heading gets a derived id.
 * Allowing both to be the same string produced duplicate ids on the State page (`latest-results` on the section
 * AND its `<h2>`), which is invalid HTML and ambiguous for `aria-labelledby`, fragment navigation and skip links
 * alike. That fix is now structural rather than per-family.
 */
export function UniversalSection({
  family,
  anatomy,
  headingLevel = 2,
  headingAction,
  footer,
  className,
  children,
  extraAttributes,
  /** Set when the section's heading must not be drawn (a band already names it). Still emitted for a11y. */
  visuallyHiddenHeading = false,
}: {
  family: SectionFamily;
  anatomy: SectionAnatomy;
  headingLevel?: 2 | 3;
  headingAction?: ReactNode;
  footer?: React.ComponentProps<typeof SectionFooter>;
  /** Extra family classes — variants such as `lcs-section--ai` or `lcfg-hero`. */
  className?: string;
  children?: ReactNode;
  /**
   * Family-specific `data-*` markers the shared anatomy has no opinion about.
   *
   * Deliberately a narrow escape hatch and deliberately `data-*` only: State's `data-section-variant`, the
   * flagship's `data-result-state`, the archive's `data-archive-mode`. Promoting each of those into `SectionAnatomy`
   * would make the shared contract accumulate every family's private vocabulary, which is how a shared primitive
   * turns back into five primitives with one name.
   */
  extraAttributes?: Record<`data-${string}`, string | number | undefined>;
  visuallyHiddenHeading?: boolean;
}) {
  const p = CLASS_PREFIX[family];
  const a = anatomy;
  const headingId = `${a.sectionId.toLowerCase()}-heading`;
  return (
    <section
      className={`${p}-section${className ? ` ${className}` : ""}`}
      {...(a.fragment ? { id: a.fragment } : {})}
      aria-labelledby={headingId}
      /* ---- §42 anatomy, in the DOM ---- */
      data-section-id={a.sectionId}
      {...(a.libraryId ? { "data-section-library-id": a.libraryId } : {})}
      {...(a.order !== undefined ? { "data-section-order": a.order } : {})}
      {...(a.requirement ? { "data-requirement": a.requirement } : {})}
      data-protected-zone={a.protectedZone ? "true" : "false"}
      data-source-class={a.sourceClass ?? "none"}
      /*
       * §10.5 — every section records an intelligence decision, including "none".
       *
       * §C3: the value falls back to the SECTION INTELLIGENCE MATRIX rather than to a bare `"none"`. A caller that
       * passes nothing therefore still emits the recorded decision, so §10.5 coverage cannot be lost by forgetting a
       * prop at one call site — which, with roughly ninety sections across five families, is the realistic failure.
       * `data-intelligence-source` says which of the two supplied it, so an audit can tell a declared decision from
       * an inherited one.
       */
      data-intelligence={a.intelligence ?? intelligenceOf(family, a.sectionId)}
      data-intelligence-source={a.intelligence ? "section" : "matrix"}
      data-section-state={a.state ?? "fresh"}
      {...(extraAttributes ?? {})}
    >
      {visuallyHiddenHeading ? (
        <h2 className={`${p}-vh`} id={headingId}>
          {a.heading}
        </h2>
      ) : (
        <SectionHeader
          family={family}
          headingId={headingId}
          heading={a.heading}
          {...(a.context ? { context: a.context } : {})}
          {...(a.dataPeriod ? { dataPeriod: a.dataPeriod } : {})}
          {...(headingAction ? { action: headingAction } : {})}
          level={headingLevel}
        />
      )}
      {children}
      {footer ? <SectionFooter {...footer} /> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ §43 rendering */

/**
 * The visible form of a non-`fresh` section state.
 *
 * §43: "A section must never silently show stale dynamic data as current." This is the one component that says
 * so, so the sentence cannot drift between five families. It is a NOTICE, never a replacement for content: a
 * stale section still renders its data underneath, labelled.
 *
 * It deliberately renders nothing for `fresh` and for `loading` — a server-rendered page has no loading state,
 * and drawing a skeleton for one would be theatre.
 */
export function SectionStateNotice({
  family,
  state,
  detail,
}: {
  family: SectionFamily;
  state: SectionState;
  /** What specifically is stale, missing, conflicting or corrected. Never a generic sentence. */
  detail?: string;
}) {
  if (state === "fresh" || state === "loading") return null;
  const p = CLASS_PREFIX[family];
  const copy: Partial<Record<SectionState, string>> = {
    stale: "This is not the latest information we hold.",
    pendingVerification: "This result has not been checked against the official source yet.",
    unavailable: "This is currently unavailable.",
    incomplete: "Part of this information is missing.",
    conflicting: "The sources for this disagree.",
    corrected: "This was corrected after publication.",
    archived: "This covers a period that has closed.",
    empty: "There is nothing recorded here yet.",
    restricted: "This needs an account.",
    personalized: "This is based on what you have saved.",
    anonymousFallback: "You are seeing the version for visitors without an account.",
    error: "This could not be loaded.",
  };
  return (
    <p
      className={`${p}-unavailable`}
      role={state === "corrected" || state === "conflicting" ? "status" : undefined}
      data-section-state-notice={state}
    >
      <strong>{copy[state]}</strong>
      {detail ? ` ${detail}` : null}
    </p>
  );
}

/* ------------------------------------------------------------------ freshness (A7) */

/**
 * THE ONE "Last updated" PRIMITIVE — shared by all five families.
 *
 * Before this there were four: State's `SourceFreshness`, the archive's inline `archiveDisplayDate` in a
 * definition list, the flagship's `lcfg-freshness` paragraph and the Game Page's `lcg-stale`. They printed the
 * same fact in four shapes — "Updated July 9, 2026 at 2:01 PM ET", "Last updated August 2, 2026",
 * "Published … · 4 days ago" — so a reader moving between two pages could not tell whether they meant the same
 * thing.
 *
 * `Intl` is deliberately NOT used with a runtime locale: the format is fixed so the server and the client render
 * the same string and the output cannot drift with the viewer's machine (a real hydration-mismatch source).
 */
/** Re-exported so a component importing the chrome does not also have to import the lib module. */
export { formatLastUpdated };

/**
 * The shared freshness line.
 *
 * "Last updated", never "last verified" — verification state is internal governance and a reader cannot act on
 * it. A stale value is LABELLED rather than silently refreshed: production-derived fixture dates are not
 * rewritten to look current (`CLAUDE.md` §14).
 */
export function LastUpdated({
  family,
  iso,
  timezoneLabel,
  sourceName,
  daysOld = null,
  stale = false,
}: {
  family: SectionFamily;
  /** The governed timestamp. `null` renders an honest "unavailable" rather than today's date. */
  iso: string | null | undefined;
  timezoneLabel?: string;
  sourceName?: string;
  daysOld?: number | null;
  stale?: boolean;
}) {
  const p = CLASS_PREFIX[family];
  if (!iso) {
    return (
      <p className={`${p}-fine ${p}-muted`} data-freshness="unknown" data-last-updated-primitive="true">
        Last updated: currently unavailable.
      </p>
    );
  }
  return (
    <p
      className={`${p}-fine ${p}-muted`}
      data-freshness={stale ? "stale" : "current"}
      data-last-updated={iso}
      data-last-updated-primitive="true"
    >
      Last updated {formatLastUpdated(iso, timezoneLabel)}
      {sourceName ? ` · Results from ${sourceName}` : ""}
      {stale && daysOld !== null ? (
        <>
          {" "}
          <span className="lcp-stale-badge" data-stale="true">
            {daysOld} days old — not current
          </span>
        </>
      ) : null}
    </p>
  );
}

/* ------------------------------------------------------------------ breadcrumbs (A7) */

export interface Crumb {
  label: string;
  /** Absent on the current page, which renders as `aria-current` text rather than a link. */
  href?: string;
}

/**
 * THE ONE BREADCRUMB PRIMITIVE.
 *
 * State and flagship already emitted `nav.lcs-crumbs[data-breadcrumb]`; the archive emitted `nav.lca-crumbs`
 * with no `data-breadcrumb`, so the crumb audit skipped it and its styling diverged. One component, one class,
 * one attribute — and the `BreadcrumbList` JSON-LD each family emits now has exactly one visible counterpart to
 * agree with (`CLAUDE.md` §11: schema reflects visible content only).
 *
 * `Link` is not used here: a crumb href is always a governed same-site path resolved by the page's own model,
 * and rendering a plain anchor keeps this primitive usable from a server component with no client boundary. Next
 * still prefetches nothing it should not, because a breadcrumb is not a hot path.
 */
export function Breadcrumbs({ crumbs, label = "Breadcrumb" }: { crumbs: readonly Crumb[]; label?: string }) {
  return (
    <nav className="lcs-crumbs" aria-label={label} data-breadcrumb="true">
      <ol>
        {crumbs.map((c) => (
          <li key={`${c.label}:${c.href ?? "current"}`}>
            {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
