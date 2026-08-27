/*
 * PUBLIC CSV EXPORT — LRG-ARCHIVE-057.
 *
 * Authority: the 2026-08-05 founder direction §6 (the CSV field list, *"Keep these public because they contain
 * public result information"*, *"Do not implement PDF generation, saved reports, or emailed reports"*);
 * `ACCT-DEC-001` `FD-ACC-05` (public-result CSV downloads remain public); archive blueprint §17 (export
 * availability and data-rights status must be stated); `CLAUDE.md` §14 (provenance).
 *
 * ══ WHY A CSV IS BUILT HERE AND NOT ON A SERVER ROUTE ══
 *
 * The rows are already in the reader's browser: the table renders all of them, and `filterArchive` has already
 * produced the filtered set. Building the file client-side from that array means the download and the visible
 * table are the SAME data by construction — a server route would re-query and could disagree.
 *
 * It also avoids adding a parameterised endpoint, which would be a new crawl surface and a new place for a filter
 * combination to become a URL (blueprint §31).
 *
 * No library is used. A CSV is a string.
 *
 * ══ ESCAPING IS NOT OPTIONAL ══
 *
 * `escapeCsvField` implements RFC 4180: a field containing a comma, a quote, CR or LF is wrapped in quotes and its
 * quotes are doubled. This matters here because the file carries a *filter description* and a *source label*, both
 * of which contain commas today — an unescaped source label would silently shift every column after it.
 *
 * There is also a formula-injection guard. A field beginning `=`, `+`, `-` or `@` is prefixed with a tab, because a
 * spreadsheet treats such a value as a formula on open. No archive field should ever begin that way, which is
 * exactly why the guard is cheap to keep: it costs nothing today and prevents a class of problem if a future
 * source label or filter description ever starts with a symbol.
 */

import type { ArchiveDrawRow, ArchiveViewModel } from "./archiveContract";

/*
 * ══ THE SERVER-ENFORCED LIMIT SHAPES — A CONTRACT NOTE, NOT CLIENT BEHAVIOUR ══
 *
 * `DATA-DEC-001` fixes the export limit SHAPES: at most two calendar years per export request
 * (`FD-DAT-07`), at most three distinct game-year datasets per Account per rolling 24 hours
 * (`FD-DAT-10`), and filters/splitting/repetition drawing on the same allowance (`FD-DAT-13`). Both
 * values are server-configurable, never code constants (`FD-DAT-18`), and enforcement belongs to the
 * SERVER (`FD-DAT-11`) — the rows are already in the reader's page, so any client-side "check" would be
 * decoration, and a client-side rejection would be a FAKE limit error about a ledger that does not
 * exist. Conflict 37 records `FD-DAT-15`/`FD-DAT-12` metering as API-phase work.
 *
 * So in this build the signed-in download runs unmetered, this record documents what the server will
 * enforce, and the client never invents a limit outcome. The values below are the ruling's INITIAL
 * shapes for the API phase to read as its starting configuration — they gate nothing here.
 */
export const EXPORT_LIMIT_CONTRACT = Object.freeze({
  enforcedBy: "server" as const,
  enforcementPhase: "api" as const,
  /** `FD-DAT-07` — initial value, server-configurable (`FD-DAT-18`). */
  maxCalendarYearsPerRequest: 2,
  /** `FD-DAT-10` — initial value, per Account per rolling 24 hours, server-configurable. */
  maxGameYearDatasetsPerDay: 3,
  /** `FD-DAT-13` — a filtered file consumes the same game-year slot as the full one. */
  filtersShareAllowance: true,
});

/** One CSV cell, escaped per RFC 4180 with a spreadsheet formula-injection guard. */
export function escapeCsvField(value: string): string {
  /* A leading `=`, `+`, `-` or `@` is interpreted as a formula by Excel, Sheets and Numbers. Neutralised with a
     leading tab, which those applications strip on display but do not evaluate. */
  const guarded = /^[=+\-@]/.test(value) ? `\t${value}` : value;
  if (/[",\r\n]/.test(guarded)) return `"${guarded.replace(/"/g, '""')}"`;
  return guarded;
}

function csvRow(fields: readonly string[]): string {
  return fields.map((f) => escapeCsvField(f)).join(",");
}

/** A reader-facing description of the applied filter, for the file's context block. */
export function filterDescription(m: ArchiveViewModel, rowCount: number): string {
  return rowCount === m.rows.length
    ? "All drawings in this archive year"
    : `Filtered selection — ${rowCount} of ${m.rows.length} drawings`;
}

export interface CsvBuild {
  filename: string;
  content: string;
  /** Row count excluding the header and the context block. Reported so a caller can label the control honestly. */
  dataRows: number;
}

/**
 * Build a CSV for the given rows.
 *
 * The file opens with a short **context block** — game, year, what was exported, the filter, the generation date,
 * the source and the last-updated date — before the data header. That is a deliberate choice over a bare table:
 * a results file that circulates without its provenance becomes an unattributable claim about a lottery, and
 * blueprint §17 requires source and coverage to travel with any export.
 *
 * The generation date is the archive's own `lastUpdatedIso`, **not** the wall clock. Two exports of the same
 * archive state produce byte-identical files, which is what makes the content testable.
 */
export function buildArchiveCsv(
  m: ArchiveViewModel,
  rows: readonly ArchiveDrawRow[],
  scope: "year" | "filtered",
): CsvBuild {
  const addOn = m.profile.groups.find((g) => g.role === "addOn");
  const hasAddOn = addOn !== undefined;
  const gameName = `${m.stateName} ${m.gameLabel}`;

  const lines: string[] = [];

  /* ---- context block ---- */
  lines.push(csvRow(["LotteryCorner archive export"]));
  lines.push(csvRow(["Game", gameName]));
  lines.push(csvRow(["Archive year", String(m.archiveYear)]));
  lines.push(csvRow(["Export", scope === "year" ? "Complete archive year" : "Current filtered results"]));
  lines.push(csvRow(["Selection", filterDescription(m, rows.length)]));
  lines.push(csvRow(["Drawings included", String(rows.length)]));
  lines.push(csvRow(["Last updated", m.coverage.lastUpdatedIso]));
  lines.push(csvRow(["Source", m.coverage.sourceLabel]));
  lines.push(csvRow(["Coverage", m.coverage.statement]));
  lines.push(csvRow(["Methodology", "Every value is the published result for that drawing, in the order drawn."]));
  lines.push("");

  /* ---- data ---- */
  const header = ["Game", "Year", "Draw date", "Drawing"];
  /* One column per drawn position, so a spreadsheet can sort and filter on a single value — a combined
     "3 · 7 · 8" cell is unusable for exactly the work a CSV exists to enable. */
  for (let i = 1; i <= (m.profile.main?.count ?? 0); i++) header.push(`Value ${i}`);
  if (hasAddOn) header.push(addOn!.label ?? "Add-on");
  header.push("Pattern", "Sum");
  lines.push(csvRow(header));

  for (const r of rows) {
    const fields: string[] = [
      gameName,
      String(m.archiveYear),
      r.drawDateIso,
      r.variantLabel || "Main",
    ];
    for (let i = 0; i < (m.profile.main?.count ?? 0); i++) {
      fields.push(r.mainValues[i] !== undefined ? String(r.mainValues[i]) : "");
    }
    /* An absent add-on is an EMPTY cell, not a zero. `0` is a legitimate Fireball value, so writing `0` for
       "not recorded" would fabricate a drawn value. */
    if (hasAddOn) fields.push(r.addOnValue !== null ? String(r.addOnValue) : "");
    fields.push(
      r.shape === "allDifferent" ? "All different"
        : r.shape === "double" ? "Double"
        : r.shape === "triple" ? "Triple"
        : "",
      r.sum !== null ? String(r.sum) : "",
    );
    lines.push(csvRow(fields));
  }

  const slug = `${m.stateCode}-${m.gameSlug}-${m.archiveYear}`;
  return {
    filename: scope === "year" ? `${slug}-results.csv` : `${slug}-filtered-results.csv`,
    /* CRLF per RFC 4180, and a trailing newline so the last row is terminated. */
    content: lines.join("\r\n") + "\r\n",
    dataRows: rows.length,
  };
}
