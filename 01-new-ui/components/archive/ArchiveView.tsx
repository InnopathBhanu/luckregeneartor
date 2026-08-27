/*
 * THE YEARLY ARCHIVE COMPOSITION — LRG-ARCHIVE-054.
 *
 * Authority: blueprint §6 (the AR-01…AR-11 order, reproduced from `AR_ORDER` rather than restated here),
 * §7 (protected priority), §8–§18; content template Template J (what the server-rendered page must expose);
 * brief §8, §12 (design), §13 (crawlability).
 *
 * ══ IT SWITCHES ON SECTION IDS AND NOTHING ELSE ══
 *
 * No game slug, no game id, no jurisdiction code appears in this file. Every label, count, column and control
 * comes from the resolved model, so the same component renders a single-value five-variant family and an
 * unordered pool with a special ball without a branch. That is the whole point of brief §10, and the
 * generalization tests assert this file names no game.
 *
 * ══ SERVER-RENDERED, DELIBERATELY ══
 *
 * This is a server component and every result row is in the initial HTML. Template J requires the H1, status,
 * year navigation, draw count, summary, month navigation and result rows to be server-visible; blueprint §35 and
 * the Google pagination guidance in the brief's research register both rule out click-only or infinite-scroll
 * history. Month navigation is real anchor links; the only client component is the AR-06 workspace, and even
 * there the complete public Ask answer is server-rendered before any JavaScript runs.
 *
 * ══ THE ORDER IS THE FOUNDER'S, NOT THE BLUEPRINT'S ══
 *
 * `AR_ORDER` now puts search above the results and every long-form section below them, overriding blueprint §6.
 * See `archiveContract.ts` for what moved and the measurements that prompted it. This file reads the constant, so
 * it neither knows nor restates the sequence.
 *
 * ══ WHY THE HEADINGS NEST THE WAY THEY DO ══
 *
 * `h1` → section `h2` → detail `h3`. No band layer, unlike the Game Page: the archive's eleven sections are a
 * single sequence rather than nine grouped bands, so inserting a band level would add an outline tier a screen
 * reader has to traverse for no navigational gain.
 */

import Link from "next/link";
import type { ArchiveDrawRow, ArchiveSectionId, ArchiveViewModel } from "@/lib/archive/archiveContract";
import { isGenuineCorrection } from "@/lib/archive/archiveContract";
import { archiveDisplayDate, archiveShowsVariantColumn } from "@/lib/archive/archiveYear";
import { StateBallGroup } from "@/components/state/preview/sections/StateResultGrammar";
import { gameLogo } from "@/lib/preview/gameLogoRegistry";
import ArchiveWorkspace from "@/components/archive/ArchiveWorkspace";
import ArchiveYearNav from "@/components/archive/ArchiveYearNav";
import ArchiveResultViews, { ResultDetail } from "@/components/archive/ArchiveResultViews";
import { Breadcrumbs, LastUpdated } from "@/components/shell/SectionChrome";
import ResultExitRamps from "@/components/shell/ResultExitRamps";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";

/* ------------------------------------------------------------------ small pieces */

/** `AR-01` → `ar-01`. One transform, so an anchor and its `aria-labelledby` cannot drift. */
function anchor(id: ArchiveSectionId): string {
  return id.toLowerCase();
}
function headingId(id: ArchiveSectionId): string {
  return `${anchor(id)}-heading`;
}

/** The shape word for a row, from its declared classification. `notApplicable` renders nothing. */
function shapeLabel(row: ArchiveDrawRow): string | null {
  switch (row.shape) {
    case "allDifferent": return "All different";
    case "double": return "Double";
    case "triple": return "Triple";
    default: return null;
  }
}

/**
 * One row's drawn values.
 *
 * `StateBallGroup` is Home's ball primitive, reused unchanged — so an archive ball is visually and semantically
 * the same object as a Home ball, and a special group keeps its own colour token and its own accessible name.
 * Colour is never the only distinction: every special group also renders its label.
 */
function RowValues({ row, gameName }: { row: ArchiveDrawRow; gameName: string }) {
  return (
    <span className="lca-rowvalues">
      {/*
        THE DRAWN ADD-ON IS EXCLUDED HERE, AND RENDERED INLINE AS TEXT INSTEAD.
        
        It used to render as a full-size ball with a label beneath it, sitting immediately after the three winning
        digits — which is precisely the "fourth winning digit" reading the founder direction rules out. Fireball
        REPLACES one of the three drawn numbers; it is not a fourth one. As `Fireball: 9` in smaller type it reads
        as what it is, and it can no longer be mistaken for part of the drawn set.
        
        A `special` group — a Mega Ball, a Cash Ball — is different and stays a ball: it genuinely is part of the
        drawn result, and keeps its own colour token and accessible name.
      */}
      {row.groups.filter((g) => g.role !== "addOn").map((g) => (
        <StateBallGroup
          key={g.key}
          group={{
            label: g.label,
            /* `MemberBallGroup.values` is mutable `number[]`; an archive row's values are `readonly`, because
               nothing downstream may reorder a drawn result. Copied rather than cast, so the shared primitive
               cannot mutate the model's array even by accident. */
            values: [...g.values],
            colorToken: g.colorToken,
            visualRole: g.role,
            accessibleLabel: g.accessibleLabel,
          }}
          gameName={gameName}
          size="compact"
        />
      ))}
    </span>
  );
}

/**
 * One analysis view: a labelled table with an inline share bar.
 *
 * Extracted so the primary views and the disclosed ones render identically — a "deeper" statistic that looked
 * different from a primary one would imply it was a different KIND of thing, when the only difference is default
 * visibility.
 */
function AnalysisView({ view }: { view: ArchiveViewModel["analysis"][number] }) {
  return (
    <div className="lca-analysisview">
      <h4 className="lcg-h4">{view.title}</h4>
      <p className="lcg-fine lcg-muted">
        {view.period} · {view.variants} · {view.drawCount} drawings · {view.method}
      </p>
      <div className="lcg-tablewrap" tabIndex={0} role="group" aria-label={view.title}>
        <table className="lcg-table lcg-table--tight">
          <caption className="lcs-vh">{view.title}. {view.method}</caption>
          <thead>
            <tr><th scope="col">Value</th><th scope="col">Drawings</th><th scope="col">Share</th></tr>
          </thead>
          <tbody>
            {view.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="lcg-numcell">{r.label}</th>
                <td className="lcg-numcell">{r.value}</td>
                <td>
                  {/* A bar drawn from the share, with the figure in text next to it — the chart never replaces
                      the number, and a table alternative is what this IS. */}
                  <span className="lca-bar" aria-hidden="true">
                    <span className="lca-bar__fill" style={{ width: `${r.of > 0 ? Math.round((r.count / r.of) * 100) : 0}%` }} />
                  </span>
                  <span className="lca-share">{r.of > 0 ? Math.round((r.count / r.of) * 100) : 0}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ the composition */

export default function ArchiveView({ model }: { model: ArchiveViewModel }) {
  const m = model;
  /* The logo is keyed by the configuration's DECLARED `visualIdentity`, not by the game slug — the same lookup
     the Game Page uses. Keying it on the slug silently found nothing and dropped the mark. */
  const logo = gameLogo(m.visualIdentity ?? undefined);
  const gameName = `${m.stateName} ${m.gameLabel}`;
  const addOn = m.profile.groups.find((g) => g.role === "addOn");
  const hasSums = m.rows.some((r) => r.sum !== null);
  const hasShapes = m.rows.some((r) => r.shape !== "notApplicable");
  /*
   * A correction is rendered only when it is a genuine, sourced record.
   *
   * `r.corrected` alone was the old condition, and a fixture row satisfied it. `isGenuineCorrection` requires a
   * previous value, a corrected value, a source and a date — which no fixture can supply without inventing a
   * source. So this is `undefined` today and the whole correction presentation is absent, exactly as intended.
   */
  const correctedRow = m.rows.find((r) => isGenuineCorrection(r.correction));

  const render = (id: ArchiveSectionId) => {
    const state = m.sectionState[id];
    if (!state || state.render === false) return null;

    switch (id) {
      /* ══════════════════════════════════════════════════ AR-01 */
      case "AR-01":
        return (
          <section className="lcg-section lca-identity" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            {/*
              §A7 — THE SHARED BREADCRUMB PRIMITIVE.

              This was `nav.lca-crumbs` with no `data-breadcrumb` attribute, so the crumb audit that reads State
              and flagship pages could not see it, and its styling drifted from theirs. It is now the same
              component, emitting the same `nav.lcs-crumbs[data-breadcrumb]` markup — which is also what the
              `BreadcrumbList` JSON-LD has to agree with (`CLAUDE.md` §11: schema reflects visible content only).
            */}
            <Breadcrumbs
              crumbs={m.breadcrumbs.map((b) => (b.href ? { label: b.label, href: b.href } : { label: b.label }))}
            />

            <div className="lca-titlerow">
              {logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className="lca-logo" src={logo.src} alt="" width={logo.width} height={logo.height} aria-hidden="true" />
              ) : null}
              <h1 className="lcg-h1" id={headingId(id)}>{m.h1}</h1>
            </div>

            <p className="lcg-fine">{m.supportingCopy}</p>

            {/*
              THE CONCISE SUMMARY.

              Four facts, inline rather than in cards. The V0 opened with six metric cards including "unique exact
              results" and "repeated exact results", then a coverage enum — figures that belong in a data report,
              not above a reader's first look at a year of results.
            */}
            <ul className="lca-summary">
              {m.summaryMetrics.map((x) => (
                <li className="lca-summary__item" key={x.key}>
                  <span className="lca-summary__label">{x.label}</span>
                  <span className="lca-summary__value">{x.value}</span>
                </li>
              ))}
            </ul>

            {/* One source line. "Last updated", never "last verified". */}
            <p className="lcg-fine lcg-muted">{m.sourceLine}</p>

            {/*
              YEAR NAVIGATION, before month navigation and near the title.

              Driven entirely by the archive registry, so Older and Newer mean the nearest REGISTERED year and a
              boundary renders as an unavailable control rather than a link to a year that does not exist.
            */}
            <ArchiveYearNav nav={m.yearNav} gameHref={m.gameHref} gameLabel={m.gameLabel} />

            {/*
              §B4 — THE UNIFORM EXIT RAMPS, in the first viewport.

              The archive already had a Continue section (AR-11) — at the very FOOT of a 23-screen page, which is
              where a reader arrives only if they were not looking for a way out. These four sit beside the year
              navigation, in the same order and position as on the other four families.

              `prizes` and `rules` are the GAME page's job, not this page's: an archive states what was drawn, not
              what a match pays. Both therefore point at the game hub, which is a real registered route, and neither
              is faked as an in-page fragment. AR-11's own continuation list is untouched — it carries different,
              longer-form actions.
            */}
            <ResultExitRamps
              family="archive"
              ramps={[
                { key: "prizes", label: `${m.gameLabel} prizes and odds`, href: m.gameHref },
                {
                  key: "history",
                  label: m.previousYear ? `Past results (${m.previousYear})` : "",
                  href: m.previousYear ? `${m.gameHref}/${m.previousYear}` : null,
                },
                { key: "rules", label: `How ${m.gameLabel} works`, href: m.gameHref },
                {
                  key: "stateHub",
                  label: `All ${m.stateName} results`,
                  href: m.breadcrumbs.find((b) => b.label === m.stateName)?.href ?? null,
                },
              ]}
            />
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-02 */
      case "AR-02":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>{m.archiveYear} at a glance</h2>

            {/*
              A CORRECTION NOTICE, ONLY FOR A GENUINE SOURCED CORRECTION.

              Blueprint §7 puts a correction notice above the figures it qualifies, and that placement is kept — but
              `correctedRow` is now gated on `isGenuineCorrection`, so the block is absent unless a real record with
              a previous value, a corrected value, a source and a date exists. The V0's incomplete-fields notice is
              gone from here: the page states its preview status once, at the top, and repeats it nowhere.
            */}
            {correctedRow?.correction ? (
              <div className="lca-notice lca-notice--correction" role="note">
                <p className="lca-notice__title">A result in this year was corrected</p>
                <p className="lcg-fine">
                  The {archiveDisplayDate(correctedRow.drawDateIso)} {correctedRow.variantLabel} result was updated
                  after checking the source. Every figure on this page uses the corrected value.
                </p>
                <dl className="lcg-facts lca-facts--tight">
                  <div className="lcg-fact"><dt>Corrected field</dt><dd>{correctedRow.correction.field}</dd></div>
                  <div className="lcg-fact"><dt>Previous value</dt><dd>{correctedRow.correction.previousValue}</dd></div>
                  <div className="lcg-fact"><dt>Current value</dt><dd>{correctedRow.correction.currentValue}</dd></div>
                  <div className="lcg-fact"><dt>Source</dt><dd>{correctedRow.correction.source}</dd></div>
                </dl>
                <p className="lcg-fine"><a href={`#${correctedRow.anchorId}`}>View the corrected drawing</a></p>
              </div>
            ) : null}

            <p className="lcg-fine">
              These figures describe the drawings listed on this page. They do not predict a future result.
            </p>

            <ul className="lca-metrics">
              {m.metrics.map((x) => (
                <li className="lca-metric" key={x.key}>
                  <span className="lca-metric__label">{x.label}</span>
                  <span className="lca-metric__value">{x.value}</span>
                  <span className="lca-metric__range">{x.range}</span>
                  {x.note ? <span className="lca-metric__note">{x.note}</span> : null}
                  {x.evidenceHref ? (
                    <a className="lca-metric__link" href={x.evidenceHref}>See the drawings behind this</a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-03 */
      case "AR-03":
        if (!m.brief) return null;
        return (
          <section className="lcg-section lca-brief" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>{m.brief.heading}</h2>
            {/*
              ══ THE AI LABEL WAS REMOVED HERE (LRG-ARCHIVE-060) ══

              `DATA-DEC-001` `FD-DAT-20` rules that this brief is a deterministic summary over public archive
              statistics — not an AI execution. So the Constitution's AI-labelling duty never attached to it: that
              duty exists to identify a model's output, and there is no model. Calling it `LotteryCorner AI` was
              describing the surface inaccurately, which the same rule forbids.

              The brief stays PUBLIC. It consumes no AI allowance and writes no `FD-DAT-12` ledger entry, because
              there is no request, prompt, provider, token, latency or cost for either to record.

              What remains is what a reader needs: the label, and the line saying the figures come from the results
              on this page. The V0's "No live AI model generated or verified these observations" is gone too —
              disclaiming AI still raises AI, and nothing here claims it.

              If AR-03 ever uses a provider, a user prompt, personalised generation or model inference, it moves
              behind the free Account, executes on the server, and follows `FD-DAT-12`, `FD-DAT-18` and
              `FD-DAT-19`.
            */}
            <p className="lca-brieflabel">
              <span className="lcg-tag">{m.brief.label}</span>
              <span className="lcg-muted">Based on the results in this archive</span>
            </p>

            <ul className="lca-briefpoints">
              {m.brief.points.map((p, i) => (
                <li key={i}>
                  <span className="lca-briefpoint__text">{p.text}</span>
                  <span className="lca-briefpoint__evidence">
                    {p.evidence} · <a href={p.evidenceHref}>Evidence</a>
                  </span>
                </li>
              ))}
            </ul>
            <p className="lcg-fine lcg-muted">{m.brief.evidenceLine}</p>

            {/*
              ══ ASK THE ARCHIVE — RESTORED HERE (LRG-ARCHIVE-059 reversed BY the ruling's own terms) ══

              `FD-DAT-16` removed this surface while no sign-in flow existed, and named its own restoration
              condition: "restore those visible controls when the real shared Account and sign-in continuation
              flow works end to end." Conflict 37 (source-conflicts.md, 2026-08-11) shipped exactly that —
              `/login`, `/signup`, the `FD-ACC-12` intent contract and the review account store — so the
              condition is MET and the surface returns in the `FD-DAT-04` visible-gate form:

                - signed OUT: the whole ask surface is visible in this same position (`FD-DAT-03`), the one
                  complete public answer stays server-rendered (`FD-DAT-08`), and the submit affordance is the
                  shared `Sign in free to use` control, which captures state, game, year and the typed
                  question as an `FD-ACC-12` intent;
                - signed IN: `archiveAsk.ts` executes end to end. It is deterministic — per `FD-DAT-20`'s
                  reasoning its answers are never labelled AI, because no model produced them.

              `FD-DAT-12` per-Account metering is SERVER work and remains API-phase (recorded in Conflict 37);
              nothing here fakes a ledger, an allowance or a limit error.

              The AR-03 YEAR BRIEF above is unchanged — `FD-DAT-20` ruled it a deterministic public summary.
            */}
            <ArchiveWorkspace model={m} part="ask" />
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-04 */
      case "AR-04":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>Browse {m.archiveYear} by month</h2>
            <p className="lcg-fine">
              Every month below links to its drawings in the complete list. Counts are the drawings recorded in
              this archive.
            </p>
            {/* Real anchor links, keyboard operable, no swipe-only navigation and no click-only history. */}
            <ul className="lca-months">
              {m.months.map((mo) => (
                <li key={mo.monthKey}>
                  {mo.valid && mo.drawCount > 0 ? (
                    <a
                      className={`lcg-chip${mo.monthKey === m.defaultMonthKey ? " lca-chip--current" : ""}`}
                      href={`#month-${mo.monthKey}`}
                      aria-current={mo.monthKey === m.defaultMonthKey ? "true" : undefined}
                    >
                      {mo.label} ({mo.drawCount})
                      {mo.hasCorrection ? <span className="lca-marker" title="Contains a correction"> ⚑</span> : null}
                      {mo.hasRuleChange ? <span className="lca-marker" title="A rule era begins in this month"> §</span> : null}
                    </a>
                  ) : (
                    <span className="lcg-chip lca-chip--off">
                      {mo.label} {mo.valid ? "(0)" : "(not yet)"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {m.months.some((mo) => mo.hasCorrection || mo.hasRuleChange) ? (
              <p className="lcg-fine lcg-muted">
                ⚑ marks a month with a corrected result. § marks a month where the game&rsquo;s rules changed.
              </p>
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-05 */
      case "AR-05":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>All {gameName} results for {m.archiveYear}</h2>
            <p className="lcg-fine">
              Newest first. Where a day has more than one drawing, each keeps its own result and they are never
              combined.
            </p>

            {/*
              The view switch, the public downloads and the calendar all live in one client island rendered BEFORE
              the table. The table itself stays server-rendered below, so it remains the crawlable default and the
              year's rows are in the initial HTML whatever the reader later selects (Template J, blueprint §35).
            */}
            <ArchiveResultViews model={m} />

            <div className="lcg-tablewrap" tabIndex={0} role="group" aria-label={`${gameName} ${m.archiveYear} results table`}>
              <table className="lcg-table lca-table">
                <caption className="lcs-vh">
                  {gameName} results for {m.archiveYear}. {m.rows.length} drawings, newest first.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    {archiveShowsVariantColumn(m.members) ? <th scope="col">Drawing</th> : null}
                    <th scope="col">
                      {m.profile.main && m.profile.main.count === 1
                        ? `Winning ${m.profile.main.valueType === "digit" ? "digit" : "number"}`
                        : `Winning ${m.profile.main?.valueType === "digit" ? "digits" : "numbers"}`}
                    </th>
                    {hasShapes ? <th scope="col">Pattern</th> : null}
                    {hasSums ? <th scope="col">Sum</th> : null}
                    <th scope="col"><span className="lcs-vh">Drawing details</span></th>
                    {/*
                      NO `Status` COLUMN AND NO `Actions` COLUMN.

                      `Status` published a `verified` badge on all 52 rows — a column that never varied and told a
                      reader nothing they could act on, while advertising our own publication pipeline. It remains
                      on the data for internal governance and tests.

                      `Actions` repeated `Check | Analyze | Details` on every row: 156 links to three destinations.
                      Checking and analysing are archive-level tasks, so they live once each in the search
                      workspace and the statistics section. A corrected row still announces itself, in the Date
                      cell, because that IS row-specific information.
                    */}
                  </tr>
                </thead>
                <tbody>
                  {m.rows.map((r, i) => {
                    const prev = m.rows[i - 1];
                    const startsMonth = !prev || prev.monthKey !== r.monthKey;
                    const showCorrection = isGenuineCorrection(r.correction);
                    return (
                      <tr
                        key={r.anchorId}
                        id={r.anchorId}
                        /* Internal governance attributes. Read by tests and by nothing a reader sees. */
                        data-provenance={r.provenance}
                        data-status={r.status}
                        data-month={r.monthKey}
                        data-game-id={r.gameId}
                      >
                        <th scope="row" className="lca-datecell">
                          {/* The month anchor rides the first row of each month, so a month link lands on the
                              first matching row rather than on a separate heading the table does not have. */}
                          {startsMonth ? <span id={`month-${r.monthKey}`} className="lca-monthanchor" /> : null}
                          <time dateTime={r.drawDateIso}>{archiveDisplayDate(r.drawDateIso)}</time>
                          {showCorrection ? <span className="lca-corrected">Corrected</span> : null}
                        </th>
                        {/* The column condition and the `Main` fallback are the SAME ones `archiveRowLabel` uses for the
                            ItemList — LRG-UX-SCHEMA-002 §5. Sharing the predicate is what stops the two from
                            drifting on rows whose member carries no variant label of its own. */}
                        {archiveShowsVariantColumn(m.members) ? <td>{r.variantLabel || "Main"}</td> : null}
                        <td className="lca-valuecell">
                          <RowValues row={r} gameName={gameName} />
                          {/*
                            The add-on rides WITH the numbers as a smaller labelled secondary value —
                            `Fireball: 4` — rather than occupying its own column beside them.

                            In its own column it read as a fourth winning digit, which is exactly what Fireball is
                            not: it REPLACES one of the three drawn numbers. Naming it inline, at a smaller size,
                            makes the relationship legible instead of implied by adjacency.
                          */}
                          {addOn ? (
                            <span className="lca-addon">
                              {addOn.label}:{" "}
                              {r.addOnValue !== null
                                ? <b className="lca-addon__value">{r.addOnValue}</b>
                                : <span className="lcg-muted">not recorded</span>}
                            </span>
                          ) : null}
                        </td>
                        {hasShapes ? <td>{shapeLabel(r) ?? <span className="lcg-muted">—</span>}</td> : null}
                        {hasSums ? <td className="lcg-numcell">{r.sum ?? "—"}</td> : null}
                        {/* One detail disclosure per row — the only per-row interaction, and it carries real
                            information rather than linking to a section elsewhere on the page. */}
                        <td className="lca-detailcell">
                          <ResultDetail row={r} model={m} idPrefix="row" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-06 */
      case "AR-06":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>Search {m.archiveYear} results</h2>
            <p className="lcg-fine">
              Find a number, a draw time, a month or a pattern. The matching count and rows appear below the
              controls, and the full year follows.
            </p>
            <ArchiveWorkspace model={m} part="search" />
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-07 */
      case "AR-07": {
        /*
         * PROGRESSIVE DISCLOSURE, decided in the model.
         *
         * The V0 rendered nine tables at equal prominence — three position frequencies, a drawing comparison, a
         * shape distribution, a sum distribution, two pair tables and a previous-draw repeat table — which is a
         * dashboard, and the brief forbids the page feeling like one.
         *
         * Four primary families open by default: number frequency, repeated digits, sums and Midday-versus-Evening.
         * The rest go into a native `<details>`, which is keyboard-operable, announced by screen readers and
         * findable by in-page search without any JavaScript. Nothing was removed and the engine is untouched.
         */
        const primary = m.analysis.filter((v) => v.primary);
        const deeper = m.analysis.filter((v) => !v.primary);
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>{m.gameLabel} statistics for {m.archiveYear}</h2>
            {/* The responsible-play statement stays, in full, above every figure it qualifies. */}
            <p className="lcg-fine">{m.neutrality}</p>

            <div className="lca-analysis">
              {primary.map((v) => <AnalysisView key={v.key} view={v} />)}
            </div>

            {deeper.length > 0 ? (
              <details className="lca-details">
                <summary className="lca-details__summary">
                  Explore more analytics ({deeper.length})
                </summary>
                <div className="lca-analysis">
                  {deeper.map((v) => <AnalysisView key={v.key} view={v} />)}
                </div>
              </details>
            ) : null}

            {m.notable.length > 0 ? (
              <details className="lca-details">
                <summary className="lca-details__summary">
                  Notable drawings ({m.notable.length})
                </summary>
                <ul className="lca-notable">
                  {m.notable.map((n) => (
                    <li key={n.evidenceAnchor + n.metric}>
                      <span className="lca-notable__date">
                        {archiveDisplayDate(n.drawDateIso)}
                        {n.variantLabel ? ` · ${n.variantLabel}` : ""}
                      </span>
                      <span className="lca-notable__metric">{n.metric}: {n.value}</span>
                      <span className="lca-notable__reason">{n.reason}</span>
                      <a href={`#${n.evidenceAnchor}`}>View this drawing</a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>
        );
      }

      /* ══════════════════════════════════════════════════ AR-08 */
      case "AR-08":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>Explore {m.gameLabel} history</h2>
            <ul className="lca-tools">
              {m.tools.map((t) => (
                <li className="lca-tool" key={t.key} data-access={t.access}>
                  <span className="lca-tool__title">
                    {t.href ? <Link href={t.href}>{t.title}</Link>
                      : t.fragment ? <a href={t.fragment}>{t.title}</a>
                      : <span>{t.title}</span>}
                  </span>
                  <span className="lca-tool__summary">{t.summary}</span>
                  {/* A truthful badge. `planned` says so in words a reader cannot mistake for a working
                      control, and nothing is drawn as a disabled button. */}
                  <span className="lcg-tag">
                    {t.access === "public" ? "Public"
                      : t.access === "signInToSave" ? "Sign in to save"
                      : "Planned — not available in this review"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-09 */
      case "AR-09":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>{gameName} news, guides and history</h2>
            {/* Visible, crawlable groups. Never a menu that has to be opened before a link exists in HTML. */}
            {m.editorial.map((g) => (
              <div className="lca-editorial" key={g.kind}>
                <h3 className="lcg-h4">{g.heading}</h3>
                {g.items.length > 0 ? (
                  <ul className="lca-editoriallist">
                    {g.items.map((i) => (
                      <li key={i.title}>
                        {i.href ? <Link href={i.href}>{i.title}</Link> : <span>{i.title}</span>}
                        <span className="lcg-muted"> {i.summary}</span>
                        {i.dateLine ? <span className="lca-dateline">{i.dateLine}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="lcg-fine lcg-muted">{g.emptyStatement}</p>
                )}
              </div>
            ))}
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-10 */
      case "AR-10":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>About this {m.gameLabel} archive</h2>
            <p className="lcg-fine">{m.coverage.statement}</p>

            <dl className="lcg-facts">
              {m.coverage.fields.map((f) => (
                <div className="lcg-fact" key={f.field}>
                  <dt>{f.field}</dt>
                  <dd>
                    {f.coverage}
                    {!f.supportsMetrics ? (
                      <span className="lcg-muted"> · No figure on this page is calculated from this.</span>
                    ) : null}
                  </dd>
                </div>
              ))}
              <div className="lcg-fact">
                {/* §A7 — the ONE shared freshness primitive. "Last updated", never "last verified": verification
                    state is internal governance and a reader cannot act on it. Four families printed this fact in
                    four different shapes before this. */}
                <dt>Last updated</dt>
                <dd><LastUpdated family="archive" iso={m.coverage.lastUpdatedIso} /></dd>
              </div>
              <div className="lcg-fact">
                <dt>Result source</dt>
                <dd>{m.coverage.sourceLabel}</dd>
              </div>
              <div className="lcg-fact">
                <dt>Game rules for {m.archiveYear}</dt>
                <dd>{m.ruleEraLabel}</dd>
              </div>
              <div className="lcg-fact">
                <dt>How the statistics are calculated</dt>
                <dd>
                  Every figure counts the drawings listed on this page. Nothing is modelled, weighted or
                  projected. {m.neutrality}
                </dd>
              </div>
              <div className="lcg-fact">
                <dt>Export and data rights</dt>
                <dd>{m.coverage.exportStatus.statement}</dd>
              </div>
            </dl>

            <p className="lcg-fine">
              <Link href="/corrections-policy">Read the accuracy and corrections policy</Link>
              {" · "}
              <Link href="/corrections-policy#report">Report a result issue</Link>
            </p>
          </section>
        );

      /* ══════════════════════════════════════════════════ AR-11 */
      case "AR-11":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("archive", id)} aria-labelledby={headingId(id)} key={id}>
            <h2 className="lcg-h2" id={headingId(id)}>Continue</h2>
            <ul className="lca-next">
              {m.nextActions.map((a) => (
                <li key={a.label}>
                  {/* Every action here works. Nothing is drawn as an unavailable control with an explanation
                      attached — the model filters those out before this renders. */}
                  {a.href ? <Link className="lcg-btn" href={a.href}>{a.label}</Link>
                    : <a className="lcg-btn" href={a.fragment ?? "#ar-06"}>{a.label}</a>}
                </li>
              ))}
            </ul>
          </section>
        );

      default:
        return null;
    }
  };

  /*
   * §A6 — THE SHARED GAME THEME REGISTRY.
   *
   * The archive now consumes the same registry the flagship hubs do, resolved from the configuration's DECLARED
   * `visualIdentity` (never the slug — keying on the slug is what silently dropped the logo once already). The
   * theme reaches the DOM only as `--gt-*` custom properties, so no hex ever enters this component and
   * `/fl/lotto/2026` will be branded the day it exists with no change here.
   *
   * THE BALL SYSTEM STAYS FIREWALLED. `--ball-*` colours the drawn numbers and is a separate approved system;
   * `RowValues` above renders `StateBallGroup`, which takes its colour from the row's own `colorToken`. A theme
   * change must never move a drawn digit's colour, and `tests/game-theme.test.ts` asserts exactly that.
   */
  const theme = resolveGameTheme(m.visualIdentity ?? m.gameSlug);

  return (
    <div
      className="lcg-container lca-page"
      data-archive-mode={m.mode}
      data-game-theme={theme.id}
      style={gameThemeVars(theme)}
      /* §A4 — the advertising audit, readable off the page exactly as on State, Game and the flagship hubs. */
      data-ad-profile={m.ads.id}
      data-ad-approved-count={m.ads.placements.length}
      data-ad-active-count={0}
      data-gam-active="false"
    >
      {/*
        THE ONE PREVIEW DISCLOSURE.

        It stays because most rows are sample results and removing it would let them read as real. It is the only
        place on the page that discusses how the page was built — the V0 also printed "internal review samples" in
        the results header, "governed rule data" in the coverage list, an interpreter disclosure in the Ask block
        and a "Not rendered in this review" list of `AD-AR*` anchors at the foot. All of that is gone.
      */}
      <div className="lca-banner" role="note">
        <span className="lcg-tag">Preview</span>
        <span>{m.previewBanner}</span>
      </div>

      {/*
        THE PRINT HEADER.
        
        Screen-hidden, print-visible. A printed page loses the site chrome, the navigation and every link, so
        without this a sheet of digits would circulate with no game, no year, no source and no date — an
        unattributable claim about a lottery. §6 requires the title, the filters, the print context, the source and
        a responsible-use statement to travel with the paper.
      */}
      <div className="lca-printhead" aria-hidden="true">
        <p className="lca-printhead__title">{m.stateName} {m.gameLabel} — {m.archiveYear} results archive</p>
        <p>All {m.rows.length} drawings recorded for {m.archiveYear}. No filter applied to this printout.</p>
        <p>Source: {m.coverage.sourceLabel} · Last updated {archiveDisplayDate(m.coverage.lastUpdatedIso)}</p>
        <p>{m.previewBanner}</p>
        <p>{m.neutrality}</p>
        {/* The printed citation carries the canonical host form — `www`, FD-RTE-02. */}
        <p>www.lotterycorner.com{m.gameHref}/{m.archiveYear}</p>
      </div>

      {m.order.map((id) => render(id))}
    </div>
  );
}
