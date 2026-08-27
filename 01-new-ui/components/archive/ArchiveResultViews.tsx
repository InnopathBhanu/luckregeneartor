"use client";

/*
 * AR-05 RESULT PRESENTATION — TABLE, CALENDAR, AGENDA AND RESULT DETAIL — LRG-ARCHIVE-057.
 *
 * Authority: the 2026-08-05 founder direction §1 (the `Table | Calendar` switch, the desktop calendar, the mobile
 * agenda, shared filters, independent Midday/Evening, labelled Fireball, honest empty dates, no view persistence)
 * and §2 (a compact result detail, real public information only, keyboard-operable and focus-managed);
 * `ACCT-DEC-001` `FD-ACC-05` (public) and `FD-ACC-07` (no personal action anywhere near a row).
 *
 * ══ THE TABLE STAYS THE SERVER-RENDERED DEFAULT ══
 *
 * This component does NOT render the results table. `ArchiveView` renders it on the server, and this island renders
 * beside it: the view switch, and — only once a reader asks for it — the calendar or agenda.
 *
 * That division is the point. Template J requires the year's rows in the initial HTML, and blueprint §35 rules out a
 * history that needs JavaScript. Had the switch owned both views, the table would have become client-rendered and
 * the crawlable form would have been lost to a presentation preference. So: server table always present; calendar an
 * enhancement over the same rows.
 *
 * ══ WHY THE VIEW PREFERENCE IS NOT REMEMBERED ══
 *
 * `FD-ACC-07`: no Account persistence exists, and the only alternative would be device storage — which was
 * deliberately removed from the Game Page in LRG-GAME-051 because "saved on this device" reads as an account
 * feature. A preference that silently fails to follow a reader to their phone is worse than one that resets.
 *
 * ══ WHY THE DETAIL IS `<details>` AND NOT A MODAL ══
 *
 * A native disclosure is keyboard-operable, focus-managed and dismissible with no JavaScript of ours, is announced
 * by screen readers, and is found by the browser's own in-page search. A hand-built dialog would need a focus trap,
 * an escape handler, scroll locking and `aria-modal` — four things to get wrong in exchange for nothing a reader
 * gains. It also cannot trap a reader, which matters at 390 px.
 */

import { useMemo, useState } from "react";
import type { ArchiveDrawRow, ArchiveViewModel } from "@/lib/archive/archiveContract";
import { isGenuineCorrection } from "@/lib/archive/archiveContract";
import { archiveDisplayDate } from "@/lib/archive/archiveYear";
import { buildAgenda, buildCalendarMonths, calendarMonthKeys, type CalendarDay } from "@/lib/archive/archiveCalendar";
import { defaultArchiveFilter, filterArchive, filterInputFromCarried } from "@/lib/archive/archiveFilter";
import { buildArchiveCsv, filterDescription, type CsvBuild } from "@/lib/archive/archiveDownload";
import { getCurrentArchiveFilter } from "@/lib/archive/archiveFilterBus";
import { useAccountSession } from "@/lib/account/useAccountSession";
import SignInToUse from "@/components/account/SignInToUse";

type ViewMode = "table" | "calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ shared pieces */

/**
 * One drawing, compactly: the member label, its values, and the add-on as a labelled secondary value.
 *
 * The same treatment the server-rendered table uses, deliberately — if the calendar rendered Fireball as a ball
 * while the table rendered it as text, the two views would be making different claims about what Fireball is.
 */
function DrawingLine({ row, addOnLabel }: { row: ArchiveDrawRow; addOnLabel: string | null }) {
  return (
    <span className="lca-cal__draw">
      {row.variantLabel ? <span className="lca-cal__variant">{row.variantLabel}</span> : null}
      <span className="lca-cal__values">{row.mainValues.join(" · ")}</span>
      {addOnLabel ? (
        <span className="lca-addon">
          {addOnLabel}:{" "}
          {row.addOnValue !== null
            ? <b className="lca-addon__value">{row.addOnValue}</b>
            : <span className="lcg-muted">not recorded</span>}
        </span>
      ) : null}
    </span>
  );
}

/**
 * The result detail.
 *
 * Contains only what the archive model already holds, per the direction's explicit list. No Save, no Discuss, no
 * Reminder, no Follow, no Alert — `FD-ACC-07` puts every one of those behind a foundation that does not exist, and
 * `FD-ACC-14` forbids drawing them disabled.
 */
export function ResultDetail({
  row, model, idPrefix,
}: {
  row: ArchiveDrawRow;
  model: ArchiveViewModel;
  idPrefix: string;
}) {
  const addOn = model.profile.groups.find((g) => g.role === "addOn");
  const showCorrection = isGenuineCorrection(row.correction);

  return (
    <details className="lca-detail" id={`${idPrefix}-${row.anchorId}`}>
      <summary className="lca-detail__summary">
        Drawing details
        <span className="lcs-vh">
          {" "}for {row.variantLabel || "the drawing"} on {archiveDisplayDate(row.drawDateIso)}
        </span>
      </summary>
      <dl className="lca-detail__body">
        <div><dt>Date</dt><dd><time dateTime={row.drawDateIso}>{archiveDisplayDate(row.drawDateIso)}</time></dd></div>
        {row.variantLabel ? <div><dt>Drawing</dt><dd>{row.variantLabel}</dd></div> : null}
        <div>
          <dt>{model.profile.main?.count === 1 ? "Winning number" : "Winning numbers"}</dt>
          <dd className="lcg-numcell">{row.mainValues.join(" · ")}</dd>
        </div>
        {addOn ? (
          <div>
            <dt>{addOn.label}</dt>
            <dd>{row.addOnValue !== null ? row.addOnValue : "Not recorded for this drawing"}</dd>
          </div>
        ) : null}
        {row.shape !== "notApplicable" ? (
          <div>
            <dt>Pattern</dt>
            <dd>
              {row.shape === "allDifferent" ? "All different"
                : row.shape === "double" ? "Double" : "Triple"}
            </dd>
          </div>
        ) : null}
        {row.sum !== null ? <div><dt>Sum</dt><dd className="lcg-numcell">{row.sum}</dd></div> : null}
        <div><dt>Source</dt><dd>{model.coverage.sourceLabel}</dd></div>
        <div><dt>Last updated</dt><dd>{archiveDisplayDate(model.coverage.lastUpdatedIso)}</dd></div>
        {showCorrection && row.correction ? (
          <>
            <div><dt>Corrected field</dt><dd>{row.correction.field}</dd></div>
            <div><dt>Previous value</dt><dd>{row.correction.previousValue}</dd></div>
            <div><dt>Current value</dt><dd>{row.correction.currentValue}</dd></div>
            <div><dt>Correction source</dt><dd>{row.correction.source}</dd></div>
          </>
        ) : null}
      </dl>
    </details>
  );
}

/* ------------------------------------------------------------------ the switch and the views */

export default function ArchiveResultViews({ model }: { model: ArchiveViewModel }) {
  const m = model;
  const [view, setView] = useState<ViewMode>("table");
  const addOnLabel = m.profile.groups.find((g) => g.role === "addOn")?.label ?? null;

  /*
   * ---- the rows both views share ----
   *
   * `filterArchive` with the default filter, so this island renders exactly what the server table rendered. The
   * search workspace owns its own filter state; this is the unfiltered year, which is what AR-05 shows.
   *
   * Filter PARITY is therefore structural: one function, one input, two arrangements. A test asserts the calendar
   * and the agenda contain the same row set as the table.
   */
  const rows = useMemo(
    () => filterArchive(m.rows, m.profile, defaultArchiveFilter()).rows,
    [m.rows, m.profile],
  );

  const months = useMemo(
    () => buildCalendarMonths(
      rows,
      m.archiveYear,
      calendarMonthKeys(m.archiveYear, m.months.filter((x) => x.valid).length),
      m.coveredFromIso,
      m.coveredToIso,
      /* The registered schedule and our own coverage — without these the calendar cannot tell "no drawing
         occurred" from "we hold no result", and defaults to the false claim (LRG-ARCHIVE-058). */
      m.schedule,
      m.scheduleCoverage,
    ),
    [rows, m.archiveYear, m.months, m.coveredFromIso, m.coveredToIso, m.schedule, m.scheduleCoverage],
  );
  const agenda = useMemo(() => buildAgenda(rows, "newest"), [rows]);

  /*
   * ══ THE CSV AND PRINT CONTROLS — RESTORED HERE (`FD-DAT-16`'s own condition, met by Conflict 37) ══
   *
   * LRG-ARCHIVE-059 removed these because "no sign-in flow exists" made the `Sign in free to use` affordance a
   * dead control (`FD-ACC-14`/`FD-DAT-17`). `FD-DAT-16` named its own restoration condition — "when the real
   * shared Account and sign-in continuation flow works end to end" — and Conflict 37 (2026-08-11) shipped
   * exactly that. So the controls return, in the ruling's recorded target form:
   *
   *   - SIGNED OUT: each control is present with its real label, in its final position (`FD-DAT-03`).
   *     Activating one names what it does and offers the shared `SignInToUse` affordance (`FD-DAT-04`), which
   *     captures state, game, year and the current filter snapshot as an `FD-ACC-12` intent. Adjacent copy
   *     says the account is free and mentions no plan, tier, trial or upgrade (`FD-DAT-06`).
   *   - SIGNED IN: the download genuinely happens — `buildArchiveCsv` over the same rows the table shows —
   *     and Print prints. On return from sign-in the intent lands `prepared` (`FD-DAT-16` point 6): the
   *     reader confirms by clicking the now-working control; nothing auto-executes.
   *
   * `FD-DAT-11` server enforcement and the `FD-DAT-07`/`FD-DAT-10`/`FD-DAT-13` limits remain SERVER work,
   * recorded API-phase in Conflict 37 — see `EXPORT_LIMIT_CONTRACT` in `archiveDownload.ts` for the shapes.
   * The client fakes no limit, no ledger and no rejection: inventing a limit error about accounting that does
   * not exist would be exactly the dishonesty `FD-DAT-18`'s no-client-constants rule exists to prevent.
   *
   * `FD-DAT-09` is unchanged: ordinary browser printing was never gated; the button below is OUR provided
   * action, which is the thing `FD-DAT-01` gates.
   */
  const { session } = useAccountSession();
  const [pendingExport, setPendingExport] = useState<{ action: string; label: string } | null>(null);

  const deliverCsv = (build: CsvBuild) => {
    const url = URL.createObjectURL(new Blob([build.content], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = build.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportActions: readonly { action: string; label: string; run: () => void }[] = [
    {
      action: "archive-export-year",
      label: "Download this year (CSV)",
      run: () => deliverCsv(buildArchiveCsv(m, rows, "year")),
    },
    {
      action: "archive-export-filtered",
      label: "Download filtered results (CSV)",
      /* The AR-06 workspace publishes its live filter to the bus on every change; reading it at CLICK time
         and re-running the same deterministic filter keeps file and visible matches identical. */
      run: () => deliverCsv(buildArchiveCsv(
        m,
        filterArchive(m.rows, m.profile, filterInputFromCarried(getCurrentArchiveFilter(), m.archiveYear)).rows,
        "filtered",
      )),
    },
    { action: "archive-print", label: "Print this year", run: () => window.print() },
  ];

  const activateExport = (x: { action: string; label: string; run: () => void }) => {
    if (!session) {
      /* Signed out: name the action, offer the real flow. Nothing is stored until the affordance is clicked. */
      setPendingExport({ action: x.action, label: x.label });
      return;
    }
    setPendingExport(null);
    x.run();
  };

  return (
    <div className="lca-views">
      {/* ─────────────────────────────── the view switch */}
      <div className="lca-viewbar">
        <div className="lca-viewswitch" role="group" aria-label="Result presentation">
          {(["table", "calendar"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className="lca-viewswitch__btn"
              /* `aria-pressed` rather than a disabled state: both views remain available at all times. */
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
            >
              {mode === "table" ? "Table" : "Calendar"}
            </button>
          ))}
        </div>

        {/* The provided export and print actions, restored per FD-DAT-16. Real labels in both account
            states — the gate changes what a click does, never what the control claims to be. */}
        <div className="lca-downloads" role="group" aria-label="Download or print" data-signed-in={Boolean(session)}>
          {exportActions.map((x) => (
            <button
              key={x.action}
              type="button"
              className="lcg-btn"
              data-export={x.action}
              aria-describedby={pendingExport?.action === x.action ? "lca-export-gate" : undefined}
              onClick={() => activateExport(x)}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {pendingExport && !session ? (
        <div id="lca-export-gate" className="lcg-outcome" role="status" aria-live="polite">
          <p className="lcg-outcome__headline">Sign in to use “{pendingExport.label}”</p>
          <p className="lcg-fine">
            Downloads and printing of this archive are free with a LotteryCorner account. The results
            themselves stay public on this page either way.
          </p>
          <p className="lcg-actions">
            {/* FD-DAT-04: the shared affordance, exact wording, real flow, intent captured on click. */}
            <SignInToUse
              className="lcg-btn lcg-btn--primary"
              intent={{
                returnTo: `${m.gameHref}/${m.archiveYear}#ar-05`,
                action: pendingExport.action,
                label: pendingExport.label,
                kind: "private",
                context: {
                  /* FD-DAT-16 point 6: prepared on return, never auto-executed. FD-ACC-12/FD-DAT-05: the
                     state, game, year and active filter set travel in the intent — never in a URL. */
                  class: "prepared",
                  stateCode: m.stateCode,
                  gameSlug: m.gameSlug,
                  year: String(m.archiveYear),
                  filters: JSON.stringify(getCurrentArchiveFilter()),
                },
              }}
            />
          </p>
          <p className="lcg-fine lcg-muted">A LotteryCorner account is free. Nothing downloads until you sign in.</p>
        </div>
      ) : null}

      <p className="lcg-fine lcg-muted">
        {filterDescription(m, rows.length)} · {m.coverage.sourceLabel} · Last updated{" "}
        {archiveDisplayDate(m.coverage.lastUpdatedIso)}
      </p>

      {/*
        The calendar and agenda render ONLY when asked for.

        With `view === "table"` this island adds nothing to the page but its controls, so the server-rendered table
        below is the whole presentation — which is what keeps the default crawlable and the initial payload small.
      */}
      {view === "calendar" ? (
        <>
          {/*
            ONE coverage note above the grid.

            160 of 187 cells read "No registered result", which without explanation looks like a broken calendar.
            This says why in a sentence, using the schedule's own words and our own counts — so a reader understands
            the gaps are our records rather than the lottery's schedule. Rendered only when coverage is genuinely
            incomplete; a complete archive needs no apology.
          */}
          {!m.scheduleCoverage.complete && m.scheduleCoverage.expectedDrawDates !== null ? (
            <p className="lcg-fine lcg-muted">
              This game draws {m.schedule.kind === "daily" ? "every day" : "on its scheduled days"}. This archive
              currently holds results for {m.scheduleCoverage.datesWithRows} of the{" "}
              {m.scheduleCoverage.expectedDrawDates} dates in the period, so other dates show{" "}
              <em>No registered result</em> — a drawing was almost certainly held, and we do not yet have its record.
            </p>
          ) : null}

          {/* ── desktop: a month grid ── */}
          <div className="lca-calendar" data-view="calendar">
            {months.map((mo) => (
              <section className="lca-calmonth" key={mo.monthKey} aria-labelledby={`cal-${mo.monthKey}`}>
                <h4 className="lcg-h4" id={`cal-${mo.monthKey}`}>
                  {mo.label} <span className="lcg-muted">· {mo.drawCount} drawings</span>
                </h4>
                <div className="lca-calgrid" role="table" aria-label={`${mo.label} ${mo.year} drawings`}>
                  <div className="lca-calgrid__head" role="row">
                    {WEEKDAYS.map((d) => (
                      <span className="lca-calgrid__wd" role="columnheader" key={d}>
                        <abbr title={d}>{d.slice(0, 1)}</abbr>
                      </span>
                    ))}
                  </div>
                  <div className="lca-calgrid__body" role="rowgroup">
                    {/* Leading blanks are presentational only and are hidden from assistive technology. */}
                    {Array.from({ length: mo.leadingBlanks }, (_, i) => (
                      <span className="lca-calcell lca-calcell--pad" key={`pad-${i}`} aria-hidden="true" />
                    ))}
                    {mo.days.map((d) => <CalendarCell key={d.dateIso} day={d} addOnLabel={addOnLabel} model={m} />)}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* ── mobile: a date-grouped agenda ── */}
          <div className="lca-agenda" data-view="agenda">
            <p className="lcg-fine lcg-muted">
              Dates with a drawing, newest first. {rows.length} drawings in this archive year.
            </p>
            <ol className="lca-agenda__list">
              {agenda.map((d) => (
                <li className="lca-agenda__day" key={d.dateIso}>
                  <h4 className="lca-agenda__date">
                    <time dateTime={d.dateIso}>{archiveDisplayDate(d.dateIso)}</time>
                  </h4>
                  {d.rows.map((r) => (
                    <div className="lca-agenda__row" key={r.anchorId}>
                      <DrawingLine row={r} addOnLabel={addOnLabel} />
                      <ResultDetail row={r} model={m} idPrefix="agenda" />
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * One calendar day.
 *
 * The three states are visually and textually distinct, and none of them is a blank:
 *
 *   `drawn`      the date, its drawings, and a detail disclosure
 *   `noDrawing`  the date and the words "No drawing" — a fact about the schedule
 *   `outside`    the date, muted, with no claim at all, because a date outside the covered range is not something
 *                we have established anything about
 */
function CalendarCell({
  day, addOnLabel, model,
}: {
  day: CalendarDay;
  addOnLabel: string | null;
  model: ArchiveViewModel;
}) {
  return (
    <span className="lca-calcell" role="cell" data-state={day.state}>
      <span className="lca-calcell__day">{day.day}</span>
      {day.state === "drawn" ? (
        <>
          {day.rows.map((r) => (
            <DrawingLine key={r.anchorId} row={r} addOnLabel={addOnLabel} />
          ))}
          {day.rows.map((r) => (
            <ResultDetail key={`d-${r.anchorId}`} row={r} model={model} idPrefix="cal" />
          ))}
        </>
      ) : day.state === "noDrawing" ? (
        /*
         * A CLAIM, and it is only reached with evidence: the registered schedule excludes this weekday, an upstream
         * source marks the date as a day off, or the schedule expects a drawing and our coverage is complete.
         * Unreachable for a daily game, which is why `/fl/pick-3/2026` shows none of these.
         */
        <span className="lca-calcell__none">No drawing</span>
      ) : day.state === "noRegisteredResult" ? (
        /*
         * A STATEMENT ABOUT OUR RECORDS, not about the lottery.
         *
         * This is what the 160 cells reading "No drawing" should always have said. A drawing almost certainly did
         * occur — Pick 3 is daily — and the archive simply holds no row for it. Muted rather than warning-toned, so
         * it reads as an absent record and not as a failed request.
         */
        <span className="lca-calcell__unknown">No registered result</span>
      ) : (
        /* Outside the covered range. No visible label, because any claim here would be unverified. */
        <span className="lcs-vh">Outside the recorded period</span>
      )}
    </span>
  );
}
