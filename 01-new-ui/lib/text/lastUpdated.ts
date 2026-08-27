/*
 * THE ONE "LAST UPDATED" FORMAT — §A7.
 *
 * Authority: `CLAUDE.md` §11 (*"show visible last-updated, official-source attribution"*), §20's public-page
 * pre-merge checklist (*"visible last-updated where relevant"*), §14 (production-derived dates are not rewritten
 * to look fresh).
 *
 * ══ WHY THIS IS A LIB MODULE AND NOT PART OF THE COMPONENT ══
 *
 * Two kinds of caller need the same string: the `LastUpdated` component, which draws a standalone line, and three
 * view models that COMPOSE it into a sentence with the source name (`sourceLine`). A model importing from
 * `components/` to get a date format would invert the dependency direction, so the format lives here and both
 * layers import it.
 *
 * ══ THE FIVE FAMILIES USED FOUR DIFFERENT SHAPES ══
 *
 *   State      "Updated July 9, 2026 at 2:01 PM ET"
 *   Game       "Updated Tue 08/02/2026 · Florida Lottery results feed"
 *   archive    "Updated Tue 07/09/2026 · …" in AR-01, "Last updated Tue 07/09/2026" in AR-10 — twice, differently
 *   flagship   "Published … · 4 days ago"
 *
 * A reader moving between two of those pages could not tell whether they meant the same thing. They now all read
 * "Last updated July 9, 2026 at 2:01 PM ET", with the time part present only when the governed value carries one.
 *
 * ══ WHY NOT `Intl` WITH A RUNTIME LOCALE ══
 *
 * Because the server and the client would then disagree, which is a real hydration mismatch and a real "the date
 * moved when I reloaded" bug. The format is fixed and computed from the ISO string's own parts, so the output
 * cannot drift with the viewer's machine or timezone.
 *
 * ══ THIS IS NOT THE DRAW-DATE FORMAT ══
 *
 * `archiveDisplayDate` renders "Tue 07/09/2026" for a DRAW date, and it stays. A draw date is a compact repeated
 * value in a table of 52 rows and it is the game-local date `CLAUDE.md` §14 governs; a last-updated stamp is one
 * prose sentence about our own publication. Same-looking, different jobs — collapsing them would make one of the
 * two worse.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * `2026-07-09T14:01:00Z` → `July 9, 2026 at 2:01 PM ET`.
 *
 * Date only when the value carries no time part — inventing "at 12:00 AM" from a date-only governed value would
 * state a precision we do not have.
 */
export function formatLastUpdated(iso: string, timezoneLabel?: string): string {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  const month = MONTHS[Number(m) - 1];
  if (!month) return datePart;
  let when = `${month} ${Number(d)}, ${y}`;
  if (timePart) {
    const [hh, mm] = timePart.slice(0, 5).split(":").map(Number);
    const suffix = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    when += ` at ${h12}:${String(mm).padStart(2, "0")} ${suffix}${timezoneLabel ? ` ${timezoneLabel}` : ""}`;
  }
  return when;
}

/**
 * The composed sentence a view model carries as its one source-and-freshness line.
 *
 * Kept beside the format so "Last updated" is written once. A model that built the prefix itself is how the
 * archive ended up saying "Updated" in AR-01 and "Last updated" in AR-10 on the same page.
 */
export function lastUpdatedSourceLine(iso: string, sourceName: string, timezoneLabel?: string): string {
  return `Last updated ${formatLastUpdated(iso, timezoneLabel)} · ${sourceName}`;
}
