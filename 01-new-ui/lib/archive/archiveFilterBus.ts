"use client";

/*
 * THE CURRENT-FILTER HOLDER — LRG-ARCHIVE-055.
 *
 * Authority: the 2026-08-05 founder correction direction §5 (*"Changing year should preserve applicable search and
 * draw-variant filters"*).
 *
 * ══ WHY A MODULE HOLDER AND NOT A CONTEXT ══
 *
 * The year navigation sits in AR-01 and the search workspace in AR-06. Between them is the server composition,
 * which renders sections from `AR_ORDER` and is deliberately not a client component — every result row has to
 * exist in the initial HTML. A React context would require a client provider wrapping the whole page, which would
 * pull the entire composition across the client boundary and undo that.
 *
 * So the two client islands share one module-scoped value instead. The workspace writes it on every change; the
 * year navigation reads it at CLICK time, not at render time, so a link always carries the filters as they are
 * rather than as they were when the page loaded.
 *
 * ══ WHY MODULE STATE IS SAFE HERE ══
 *
 * It is client-only — the `"use client"` directive keeps it out of any server render, so there is no shared-state
 * leak between requests, which is the usual and correct objection to module-level mutable state in Next.js.
 *
 * One archive page renders one workspace, so there is exactly one writer. The value is a plain snapshot with no
 * subscribers: nothing re-renders when it changes, because nothing needs to. It exists only to be read once, when
 * a reader clicks a year.
 */

import type { CarriedFilter } from "./archiveFilterCarry";

let current: CarriedFilter = {};

/** Called by the workspace whenever the reader changes a filter. Replaces the snapshot wholesale. */
export function setCurrentArchiveFilter(f: CarriedFilter): void {
  current = f;
}

/** Read at click time by the year navigation. Returns an empty filter before the workspace has reported one. */
export function getCurrentArchiveFilter(): CarriedFilter {
  return current;
}

/** Clears the snapshot. Used by the workspace's Reset, so a reset filter is not carried across a year change. */
export function clearCurrentArchiveFilter(): void {
  current = {};
}
