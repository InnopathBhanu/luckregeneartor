/*
 * THE SHARED INFORMATION-PAGE LAYOUT — LRG-SHELL-046.
 *
 * One small template for the legal, editorial and transparency destinations. It is deliberately NOT a page
 * builder: no configurable themes, no CMS schema, no block engine. A heading, an introduction, semantic
 * sections, lists, related links, and an optional last-updated line — nothing more.
 *
 * It reuses the existing Global Shell and the current footer, both of which the layout already supplies, so a
 * policy page looks like the rest of LotteryCorner without either being redesigned.
 *
 * MEASURE, not full width. Legal and policy text is capped at a readable line length rather than stretched
 * across the State page's 1440px canvas, which is the difference between a page someone reads and a wall.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { PRODUCTION_ORIGIN } from "@/lib/seo/productionOrigin";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import { Breadcrumbs } from "@/components/shell/SectionChrome";

export interface InfoSection {
  /**
   * Rendered as an `<h2>`. The page's own `<h1>` is the title. OPTIONAL since Conflict 38: several
   * transcribed legacy paragraphs sit between headings, and inventing a heading for them would be drafting
   * policy text.
   */
  heading?: string;
  /** Paragraphs, in order. */
  paragraphs?: string[];
  /** An optional list under the paragraphs. */
  list?: string[];
  /**
   * An optional data table (Conflict 38: the cookies policy's transcribed cookie inventory). Text cells
   * only. Rendered in its own horizontally scrollable wrapper so long rows never force the page to scroll
   * sideways at 375px.
   */
  table?: { headers: string[]; rows: string[][] };
}

export interface InfoRelatedLink {
  label: string;
  href: string;
}

export default function InformationPage({
  title,
  intro,
  sections,
  related,
  note,
  lastUpdated,
  children,
}: {
  title: string;
  intro: string;
  sections: InfoSection[];
  /** Related internal destinations. Same-site only — a policy page never sends a reader off-site. */
  related?: InfoRelatedLink[];
  /** A compact independence or disclosure note, where the page requires one. */
  note?: ReactNode;
  /**
   * Rendered ONLY when a real approved date exists. There is no fabricated "last reviewed" date on any page,
   * because a legal-review date nobody performed is exactly the kind of claim this task forbids.
   */
  lastUpdated?: string;
  /**
   * One optional slot after the sections (Conflict 38: the contact page's form). A slot, not a builder —
   * the page passes a finished element and this layout only places it.
   */
  children?: ReactNode;
}) {
  return (
    <>
      {/*
        §A2 — the approved Global Shell chrome, rendered here rather than by the root layout.
        A policy page has no answer surface, so GS-06 is a labelled unavailable affordance (`CLAUDE.md` §9).

        This also fixes a nested-landmark defect that predates this task: the layout wrapped `children` in a
        `<main>` while this component rendered a second one inside it, so `/affiliate-disclosure` and
        `/corrections-policy` shipped two `main` landmarks (WCAG 2.2 1.3.1 / 4.1.2).
      */}
      <GlobalShellChrome askAnchor={null} />
      <main className="lci" id="main">
        <div className="lci__inner">
          {/* §A7: the one shared breadcrumb primitive. It used to be a bespoke `.lci__crumbs` list with no
              `data-breadcrumb` marker, so the crumb audit could not see it. */}
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: title }]} />

        <h1 className="lci__h1">{title}</h1>
        <p className="lci__intro">{intro}</p>

        {sections.map((s, i) => (
          <section className="lci__section" key={s.heading ?? `untitled-${i}`}>
            {s.heading ? <h2 className="lci__h2">{s.heading}</h2> : null}
            {(s.paragraphs ?? []).map((p) => <p className="lci__p" key={p}>{p}</p>)}
            {s.list ? (
              <ul className="lci__list">
                {s.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
            {s.table ? (
              /* tabIndex: a scrollable data region must be keyboard-reachable (WCAG 2.1.1). */
              <div className="lci__tablewrap" tabIndex={0} role="region" aria-label={s.heading ?? title}>
                <table className="lci__table">
                  <thead>
                    <tr>{s.table.headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, ci) => <td key={`${ci}-${cell}`}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ))}

        {children ?? null}

        {note ? <div className="lci__note">{note}</div> : null}

        {related?.length ? (
          <section className="lci__section">
            <h2 className="lci__h2">Related</h2>
            <ul className="lci__list lci__related">
              {related.map((r) => (
                <li key={r.href}><Link href={r.href}>{r.label}</Link></li>
              ))}
            </ul>
          </section>
        ) : null}

          {lastUpdated ? <p className="lci__updated">Last updated {lastUpdated}</p> : null}
        </div>
      </main>
    </>
  );
}

/** Metadata for an information page. One title, one description, a self-referencing absolute canonical. */
export function informationPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const canonical = `${PRODUCTION_ORIGIN}${path}`;
  return {
    title: { absolute: `${title} | LotteryCorner` },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website" as const,
      url: canonical,
      siteName: "LotteryCorner",
      title,
      description,
    },
    /* `summary` rather than `summary_large_image`: no approved brand image asset exists, and claiming a
       large-image card without one produces a broken card. */
    twitter: { card: "summary" as const, title, description },
  };
}
