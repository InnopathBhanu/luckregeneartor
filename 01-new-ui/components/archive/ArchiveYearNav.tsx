"use client";

/*
 * ARCHIVE YEAR NAVIGATION — LRG-ARCHIVE-055.
 *
 * Authority: the 2026-08-05 founder correction direction §5 (*"Add year navigation near the title and before month
 * navigation"*, the Older / selector / Newer requirement, *"Never generate links to missing arithmetic years"*,
 * *"Changing year should preserve applicable search and draw-variant filters"*, and the mobile arrangement
 * `‹ Older | 2026 ▾ | Newer ›`); archive blueprint §8 (AR-01 navigation), §31 (no crawl trap).
 *
 * ══ WHY THIS IS A CLIENT COMPONENT WHEN ITS LINKS ARE STATIC ══
 *
 * The links themselves are plain `<a>` elements a crawler can follow — that part needs no JavaScript and works
 * without it. The client boundary exists for two things only:
 *
 *   1. The selector, which navigates on change and needs a `<select>` handler.
 *   2. Appending the reader's current filters to the destination as a URL fragment, which requires knowing the
 *      live filter state.
 *
 * With JavaScript off, Older and Newer still work and the selector degrades to a labelled control that does
 * nothing — so the year is always reachable by link. That is deliberate: blueprint §35 and the pagination guidance
 * both rule out navigation that only exists once a script runs.
 *
 * ══ THE BOUNDARY STATE IS THE COMMON CASE TODAY ══
 *
 * Only 2026 is registered, so both directions are boundaries and the selector has one option. The founder
 * direction is explicit that this must be *"an honest boundary state without fake links"* — so a boundary renders
 * as a `<span>` with `aria-disabled`, never as a link, and never as a button styled to look clickable. Multi-year
 * behaviour is proven by tests against `archiveYearNavigation` rather than by registering a year that has no data.
 */

import { useId } from "react";
import type { ArchiveYearNavigation } from "@/lib/archive/archiveRegistry";
import { encodeCarriedFilter, type CarriedFilter } from "@/lib/archive/archiveFilterCarry";
import { getCurrentArchiveFilter } from "@/lib/archive/archiveFilterBus";

export default function ArchiveYearNav({
  nav,
  gameHref,
  gameLabel,
  /**
   * The reader's live filter state, or `undefined` when the workspace has not reported one yet.
   *
   * A function rather than a value so the destination href is computed at CLICK time. Reading it during render
   * would freeze whatever the filters were when the page loaded, which is exactly the stale-link behaviour that
   * makes "preserve my search" feel broken.
   */
  currentFilter,
}: {
  nav: ArchiveYearNavigation;
  gameHref: string;
  gameLabel: string;
  currentFilter?: () => CarriedFilter;
}) {
  const selectId = useId();

  /*
   * The destination is computed at CLICK time, from the workspace's live snapshot.
   *
   * Reading it during render would freeze whatever the filters were on page load, which is exactly the stale-link
   * behaviour that makes "preserve my search" feel broken. `currentFilter` is injectable so a test can drive it
   * without mounting the workspace.
   */
  const readFilter = currentFilter ?? getCurrentArchiveFilter;
  const hrefFor = (year: number): string => {
    const fragment = encodeCarriedFilter(readFilter());
    return `${gameHref}/${year}${fragment ? `#${fragment}` : ""}`;
  };

  return (
    <nav className="lca-yearnav" aria-label={`${gameLabel} archive year`}>
      {nav.older !== null ? (
        <a className="lca-yearnav__step" href={hrefFor(nav.older)} rel="prev">
          <span aria-hidden="true">‹</span> Older<span className="lca-yearnav__year"> · {nav.older}</span>
        </a>
      ) : (
        /* No link, because there is no older year. Announced as unavailable rather than silently missing, so a
           screen-reader user learns they are at the start of the archive rather than wondering. */
        <span className="lca-yearnav__step lca-yearnav__step--off" aria-disabled="true">
          <span aria-hidden="true">‹</span> Older
          <span className="lcs-vh"> year unavailable — this is the earliest year in the archive</span>
        </span>
      )}

      <span className="lca-yearnav__current">
        <label className="lcs-vh" htmlFor={selectId}>Choose an archive year</label>
        <select
          id={selectId}
          className="lca-yearnav__select"
          value={nav.current}
          /* Only registered years are options, so a reader cannot select a year that does not exist. */
          onChange={(e) => {
            const year = Number(e.target.value);
            if (year !== nav.current) window.location.href = hrefFor(year);
          }}
          disabled={nav.singleYear}
        >
          {nav.years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </span>

      {nav.newer !== null ? (
        <a className="lca-yearnav__step" href={hrefFor(nav.newer)} rel="next">
          Newer<span className="lca-yearnav__year"> · {nav.newer}</span> <span aria-hidden="true">›</span>
        </a>
      ) : (
        <span className="lca-yearnav__step lca-yearnav__step--off" aria-disabled="true">
          Newer <span aria-hidden="true">›</span>
          <span className="lcs-vh"> year unavailable — this is the most recent year in the archive</span>
        </span>
      )}

      {nav.singleYear ? (
        <p className="lca-yearnav__note">
          {nav.current} is the only year available in this archive so far.
        </p>
      ) : null}
    </nav>
  );
}
