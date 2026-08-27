"use client";

/*
 * JG-07 / JG-08 / JG-09 — THE HISTORY AND ANALYSIS WORKSPACE. LRG-GAME-050, revised LRG-GAME-051.
 *
 * Authority: BP-04B §18 (three consecutive sections), §21 (deterministic insights), §22 (neutral language),
 * `CLAUDE.md` §11 (*"Result tables MUST be crawlable and MUST NOT depend on client-side filtering"*), and the
 * 2026-08-04 revision direction (replace the digit-position search; show 10–20 history rows initially; replace
 * the large statistics grid with a compact preview and put the detail behind an explicit expanded view).
 *
 * ══ WHAT CHANGED IN THIS REVISION, AND WHY ══
 *
 *   1. **The digit-in-position search is gone.** "How often was 7 in the first position" is a statistic, and it
 *      already exists in JG-09's positional frequency table. What a player actually arrives wanting is "did
 *      724 come up?" — so JG-08 is now a whole-number lookup across recent drawings.
 *
 *   2. **The number input is a TEXT field, not a number field.** `007` is a real Pick 3 number and
 *      `<input type="number">` cannot hold it: the browser normalises it and `Number("007")` is `7`. The value
 *      is carried as a string to the parser, which reads it per position.
 *
 *   3. **History shows 10 rows, then expands.** The full 121-row table was most of the page's height.
 *
 *   4. **Statistics show four figures, then expand.** Ten stat panels inline buried everything after them.
 *
 * ══ SERVER HTML AND CRAWLABILITY ══
 *
 * This is a client component, so Next.js renders its initial output on the server: the first ten history rows,
 * the statistics preview and the search form are all in the raw HTML. The table does not *depend* on
 * client-side filtering; it is refinable by it. The unfiltered default is the widest view.
 *
 * ══ THE FILTER IS SHARED AND STATED ONCE ══
 *
 * JG-07 and JG-09 answer questions about the same window, so they share one filter and repeat its coverage line.
 * JG-08 is deliberately NOT bound to it: a number lookup has its own "last N drawings" window, because a reader
 * searching for a number thinks in drawings, not in dates.
 */

import { useMemo, useState } from "react";
import {
  consecutiveSummary, coverageOf, filterDraws, historicalGaps, pairFrequency, positionFrequency,
  repeatFromPrevious, shapeDistribution, STATISTICS_NEUTRALITY, sumDistribution, variantComparison,
  type AnalysisFilter,
} from "@/lib/game/digitHistoryAnalysis";
import {
  searchHistory, SEARCH_WINDOWS, type OrderMode, type SearchWindow, type VariantSelection,
} from "@/lib/game/gameHistorySearch";
import type { FormatProfile } from "@/lib/game/gameFormatProfile";
import type { ReviewDrawRecord } from "@/lib/game/gameReviewFixture";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

/** Rows shown before the reader asks for more. */
const INITIAL_ROWS = 10;
const EXPANDED_PAGE = 25;

interface MemberOption {
  gameId: number;
  variantLabel: string;
}

export default function GameWorkspace({
  history,
  members,
  profile,
  addOnLabel,
  statsPreview,
  headings,
}: {
  history: readonly ReviewDrawRecord[];
  members: readonly MemberOption[];
  /** The FORMAT decides every input, range, group and comparison rule in this workspace. */
  profile: FormatProfile;
  addOnLabel: string | null;
  /** The compact figures, computed in the model so no arithmetic happens in this component. */
  statsPreview: readonly { label: string; value: string; note: string }[];
  headings: {
    history: string;
    historyIntro: string;
    numbers: string;
    numbersIntro: string;
    statistics: string;
    statisticsIntro: string;
  };
}) {
  /* ---- JG-07 / JG-09 shared filter ---- */
  const [variantId, setVariantId] = useState<number | "all">("all");
  const [fromIso, setFromIso] = useState("");
  const [toIso, setToIso] = useState("");
  const [includeCorrected, setIncludeCorrected] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [statsExpanded, setStatsExpanded] = useState(false);

  /* ---- JG-08 number lookup, with its own window ---- */
  /**
   * Raw typed input per group, as STRINGS.
   *
   * Strings all the way to the parser is what preserves a leading zero — `Number("007")` is `7`. A digit group
   * holds one entry (the whole contiguous number); a number group holds one entry per selection, because 15 is
   * one value and not the digits 1 and 5.
   */
  const [raw, setRaw] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of profile.groups) {
      if (g.role === "addOn") continue;
      init[g.key] = g.valueType === "digit" ? [""] : Array(g.count).fill("");
    }
    return init;
  });
  const [window, setWindow] = useState<SearchWindow>(25);
  const [drawType, setDrawType] = useState<"both" | number>("both");
  const [matchMode, setMatchMode] = useState<OrderMode>("exact");
  const [includeAddOn, setIncludeAddOn] = useState(false);
  const [searched, setSearched] = useState(false);

  const setGroupRaw = (key: string, index: number, value: string) => {
    setRaw((prev) => {
      const next = { ...prev, [key]: [...(prev[key] ?? [])] };
      next[key][index] = value;
      return next;
    });
    setSearched(false);
  };

  const filter: AnalysisFilter = useMemo(
    () => ({
      variant: variantId === "all" ? "all" : { gameId: variantId },
      fromIso: fromIso || null,
      toIso: toIso || null,
      includeCorrected,
    }),
    [variantId, fromIso, toIso, includeCorrected],
  );

  const rows = useMemo(() => filterDraws(history, filter) as ReviewDrawRecord[], [history, filter]);
  const coverage = useMemo(() => coverageOf(rows, filter), [rows, filter]);

  const stats = useMemo(
    () =>
      rows.length === 0
        ? null
        : {
            /* Positional frequency only where the group is ordered. On an unordered set it would present feed
               ordering as a property of the game. */
            positions: profile.supports.positionalStatistics && profile.main
              ? positionFrequency(rows, profile.main.count, profile.main.min, profile.main.max)
              : [],
            sums: profile.main ? sumDistribution(rows, profile.main.count, profile.main.max) : null,
            shapes: shapeDistribution(rows),
            front: pairFrequency(rows, "front"),
            back: pairFrequency(rows, "back"),
            consec: consecutiveSummary(rows),
            repeats: repeatFromPrevious(rows),
            gaps: profile.main ? historicalGaps(rows, profile.main.min, profile.main.max) : [],
            variants: variantComparison(rows),
          },
    [rows, profile],
  );

  const lookup = useMemo(() => {
    if (!searched) return null;
    /* The control's sentinel is "both" (what a reader sees); the engine's is "all". Mapped here rather than
       renaming either, so the label stays natural and the type stays honest about meaning every drawing. */
    const variant: VariantSelection = drawType === "both" ? "all" : { gameId: drawType as number };
    return searchHistory(history, profile, { raw, window, variant, orderMode: matchMode, includeAddOn });
  }, [searched, history, profile, raw, window, drawType, matchMode, includeAddOn]);

  /* Provenance is disclosed ONCE per table rather than per row. */
  const sampleCount = rows.filter((r) => r.provenance === "internalSample").length;
  const visibleRows = historyExpanded
    ? rows.slice(page * EXPANDED_PAGE, page * EXPANDED_PAGE + EXPANDED_PAGE)
    : rows.slice(0, INITIAL_ROWS);
  const pageCount = Math.max(1, Math.ceil(rows.length / EXPANDED_PAGE));
  const resetPage = () => setPage(0);
  /** The groups a reader types into. An add-on is drawn by the operator, not chosen, so it is excluded. */
  const inputGroups = profile.groups.filter((g) => g.role !== "addOn");

  return (
    <>
      {/* ---------------------------------------------------------- JG-07 */}
      <section className="lcg-section" id="jg-07" data-section-id="JG-07" {...sectionAuditAttributes("game", "JG-07")} aria-labelledby="jg-07-h">
        <h3 className="lcg-h2" id="jg-07-h">
          {headings.history}
        </h3>
        <p className="lcg-fine">{headings.historyIntro}</p>

        <div className="lcg-filters" data-tool="workspace-filters">
          <div className="lcg-fieldrow">
            <div className="lcg-field">
              <label htmlFor="wk-variant">Drawing</label>
              <select
                id="wk-variant"
                value={String(variantId)}
                onChange={(e) => {
                  setVariantId(e.target.value === "all" ? "all" : Number(e.target.value));
                  resetPage();
                }}
              >
                <option value="all">All drawings</option>
                {members.map((m) => (
                  <option key={m.gameId} value={m.gameId}>
                    {m.variantLabel || "Main drawing"}
                  </option>
                ))}
              </select>
            </div>
            <div className="lcg-field">
              <label htmlFor="wk-from">From</label>
              <input
                id="wk-from"
                type="date"
                value={fromIso}
                onChange={(e) => {
                  setFromIso(e.target.value);
                  resetPage();
                }}
              />
            </div>
            <div className="lcg-field">
              <label htmlFor="wk-to">To</label>
              <input
                id="wk-to"
                type="date"
                value={toIso}
                onChange={(e) => {
                  setToIso(e.target.value);
                  resetPage();
                }}
              />
            </div>
            <div className="lcg-field lcg-field--check">
              <input
                id="wk-corrected"
                type="checkbox"
                checked={includeCorrected}
                onChange={(e) => setIncludeCorrected(e.target.checked)}
              />
              <label htmlFor="wk-corrected">Include corrected drawings</label>
            </div>
          </div>
          <p className="lcg-coverage" role="status" aria-live="polite">
            {coverage.statement}
          </p>
        </div>

        <div className="lcg-tablewrap">
          <table className="lcg-table" data-rows={visibleRows.length}>
            <caption className="lcs-vh">
              {headings.history}. {coverage.statement}
            </caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Drawing</th>
                {/* The column heading names what this game actually draws. It read "Winning digits" for every
                    game, which is wrong for a ball game and wrong for a one-number game. */}
                <th scope="col">
                  {profile.main === null
                    ? "Winning values"
                    : profile.main.count === 1
                      ? `Winning ${profile.main.valueType === "digit" ? "digit" : "number"}`
                      : `Winning ${profile.main.valueType === "digit" ? "digits" : "numbers"}`}
                </th>
                {addOnLabel ? <th scope="col">{addOnLabel}</th> : null}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={`${r.gameId}-${r.drawDateIso}`} data-provenance={r.provenance}>
                  <td>{r.drawDateIso}</td>
                  <td>{r.variantLabel || "Main"}</td>
                  <td className="lcg-numcell">{r.digits.join(" · ")}</td>
                  {addOnLabel ? <td className="lcg-numcell">{r.fireball ?? "—"}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/*
          ONE table-level provenance disclosure, replacing a badge on every row.
          A dashed "Review sample" tag repeated 119 times was visual noise that stopped conveying anything. The
          fact still has to be stated, so it is stated once, with the count, directly under the table.
        */}
        {sampleCount > 0 ? (
          <p className="lcg-disclosure" data-sample-disclosure="true">
            {rows.length - sampleCount} of these {rows.length} drawings come from the results feed. The
            remaining {sampleCount} are internal review samples, shown so the table can be reviewed before the
            results archive is connected.
          </p>
        ) : null}

        <div className="lcg-actions">
          {!historyExpanded ? (
            <button
              className="lcg-btn lcg-btn--primary"
              type="button"
              onClick={() => setHistoryExpanded(true)}
              aria-expanded={false}
              aria-controls="jg-07"
            >
              Show full history ({rows.length} drawings)
            </button>
          ) : (
            <>
              <button
                className="lcg-btn"
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Newer
              </button>
              <span className="lcg-fine lcg-muted">
                Page {page + 1} of {pageCount}
              </span>
              <button
                className="lcg-btn"
                type="button"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Older
              </button>
              <button
                className="lcg-btn"
                type="button"
                onClick={() => {
                  setHistoryExpanded(false);
                  resetPage();
                }}
                aria-expanded
                aria-controls="jg-07"
              >
                Show fewer
              </button>
            </>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- JG-08 */}
      <section className="lcg-section" id="jg-08" data-section-id="JG-08" {...sectionAuditAttributes("game", "JG-08")} aria-labelledby="jg-08-h">
        <h3 className="lcg-h2" id="jg-08-h">
          {headings.numbers}
        </h3>
        <p className="lcg-fine">{headings.numbersIntro}</p>

        {profile.searchKind === "unsupported" ? (
          /* Honest suppression. A card format has no verified matching rules here, so the tool is not drawn. */
          <p className="lcg-fine lcg-muted">
            A number search is not available for this game&rsquo;s result format.
          </p>
        ) : (
          <>
            <form
              className="lcg-form"
              data-tool="number-lookup"
              data-search-kind={profile.searchKind}
              onSubmit={(e) => {
                e.preventDefault();
                setSearched(true);
              }}
            >
              <div className="lcg-fieldrow">
                {/*
                  ONE input renderer, four presentations, all driven by the format.

                  A `digit` group is one contiguous field so a leading zero survives and `007` stays three
                  digits. A `number` group is one field PER selection, because 15 is a single value and typing
                  it into a digit field would read as a 1 and a 5 — the exact defect that made Cash Pop and
                  Fantasy 5 unsearchable before this task.
                */}
                {inputGroups.map((g) => (
                  <div className="lcg-field" key={g.key}>
                    <label htmlFor={`nl-${g.key}-0`}>
                      {g.label ?? (profile.main?.valueType === "digit" ? "Number" : "Numbers")}
                    </label>
                    {g.valueType === "digit" ? (
                      <input
                        id={`nl-${g.key}-0`}
                        className="lcg-numberinput"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        pattern={`[0-9]{${g.count}}`}
                        maxLength={g.count}
                        placeholder={"0".repeat(g.count)}
                        aria-describedby={`nl-${g.key}-hint`}
                        value={raw[g.key]?.[0] ?? ""}
                        onChange={(e) =>
                          setGroupRaw(g.key, 0, e.target.value.replace(/[^0-9]/g, "").slice(0, g.count))
                        }
                      />
                    ) : (
                      <span className="lcg-numbers" role="group" aria-labelledby={`nl-${g.key}-label`}>
                        <span className="lcs-vh" id={`nl-${g.key}-label`}>
                          {g.accessibleLabel}
                        </span>
                        {Array.from({ length: g.count }, (_, i) => (
                          <span className="lcg-digitwrap" key={i}>
                            <label className="lcs-vh" htmlFor={`nl-${g.key}-${i}`}>
                              {g.accessibleLabel} value {i + 1}
                            </label>
                            <input
                              id={`nl-${g.key}-${i}`}
                              className="lcg-numbox"
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              maxLength={String(g.max).length}
                              placeholder="–"
                              value={raw[g.key]?.[i] ?? ""}
                              onChange={(e) =>
                                setGroupRaw(
                                  g.key,
                                  i,
                                  e.target.value.replace(/[^0-9]/g, "").slice(0, String(g.max).length),
                                )
                              }
                            />
                          </span>
                        ))}
                      </span>
                    )}
                    <span id={`nl-${g.key}-hint`} className="lcg-fine lcg-muted">
                      {g.valueType === "digit"
                        ? `All ${g.count} digits, ${g.min}\u2013${g.max}. Leading zeros count \u2014 007 and 700 are different numbers.`
                        : g.count === 1
                          ? `One number from ${g.min} to ${g.max}.`
                          : `${g.count} different numbers from ${g.min} to ${g.max}.`}
                    </span>
                    {lookup?.errors[g.key] ? (
                      <span className="lcg-fielderror" role="alert">
                        {lookup.errors[g.key]}
                      </span>
                    ) : null}
                  </div>
                ))}

                <div className="lcg-field">
                  <label htmlFor="nl-window">Look back</label>
                  <select
                    id="nl-window"
                    value={String(window)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setWindow(v === "all" ? "all" : (Number(v) as SearchWindow));
                      setSearched(false);
                    }}
                  >
                    {SEARCH_WINDOWS.map((w) => (
                      <option key={String(w)} value={String(w)}>
                        {w === "all" ? "All available draws" : `Last ${w} draws`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* A drawing selector only where the family actually has more than one member. */}
                {members.length > 1 ? (
                  <div className="lcg-field">
                    <label htmlFor="nl-type">Draw type</label>
                    <select
                      id="nl-type"
                      value={String(drawType)}
                      onChange={(e) => {
                        setDrawType(e.target.value === "both" ? "both" : Number(e.target.value));
                        setSearched(false);
                      }}
                    >
                      <option value="both">All drawings</option>
                      {members.map((m) => (
                        <option key={m.gameId} value={m.gameId}>
                          {m.variantLabel || "Main drawing"}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {/*
                  Order controls appear ONLY for an ordered group.
                  A single-number game has no order, and an unordered ball game matches on the set — offering
                  Exact/Any there would imply the drawn display order is part of the rules.
                */}
                {profile.ordered ? (
                  <div className="lcg-field">
                    <label htmlFor="nl-match">Match type</label>
                    <select
                      id="nl-match"
                      value={matchMode}
                      onChange={(e) => {
                        setMatchMode(e.target.value as OrderMode);
                        setSearched(false);
                      }}
                    >
                      <option value="exact">Exact order</option>
                      <option value="any">Any order</option>
                    </select>
                  </div>
                ) : null}

                {addOnLabel ? (
                  <div className="lcg-field lcg-field--check">
                    <input
                      id="nl-addon"
                      type="checkbox"
                      checked={includeAddOn}
                      onChange={(e) => {
                        setIncludeAddOn(e.target.checked);
                        setSearched(false);
                      }}
                    />
                    <label htmlFor="nl-addon">Include {addOnLabel} combinations</label>
                  </div>
                ) : null}
              </div>

              <div className="lcg-actions">
                <button className="lcg-btn lcg-btn--primary" type="submit">
                  Search past draws
                </button>
                <button
                  className="lcg-btn"
                  type="button"
                  onClick={() => {
                    setRaw((prev) => {
                      const next: Record<string, string[]> = {};
                      for (const k of Object.keys(prev)) next[k] = prev[k].map(() => "");
                      return next;
                    });
                    setSearched(false);
                  }}
                >
                  Reset
                </button>
              </div>
            </form>

            <div
              className="lcg-outcome"
              role="status"
              aria-live="polite"
              data-lookup-matches={lookup?.totalMatches ?? "none"}
            >
              {lookup ? (
                <>
                  <p className="lcg-outcome__headline">{lookup.statement}</p>
                  {lookup.rows.length > 0 ? (
                    <div className="lcg-tablewrap">
                      <table className="lcg-table lcg-table--tight">
                        <caption className="lcs-vh">
                          Drawings matching your numbers in the {lookup.searchedCount} drawings searched
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            {members.length > 1 ? <th scope="col">Drawing</th> : null}
                            {/* One column per group. A special ball is reported separately, never merged. */}
                            {profile.groups
                              .filter((g) => g.role !== "addOn")
                              .map((g) => (
                                <th scope="col" key={g.key}>
                                  {g.label ?? "Drawn"}
                                </th>
                              ))}
                            <th scope="col">Match</th>
                            {includeAddOn && addOnLabel ? <th scope="col">{addOnLabel}</th> : null}
                          </tr>
                        </thead>
                        <tbody>
                          {lookup.rows.map((r) => (
                            <tr
                              key={`${r.gameId}-${r.drawDateIso}-${r.addOnEffect?.replacedPosition ?? "base"}`}
                              data-game-id={r.gameId}
                            >
                              <td>{r.drawDateIso}</td>
                              {members.length > 1 ? <td>{r.variantLabel || "Main"}</td> : null}
                              {profile.groups
                                .filter((g) => g.role !== "addOn")
                                .map((g) => (
                                  <td className="lcg-numcell" key={g.key}>
                                    {/* Supplied display order, echoed back unchanged. */}
                                    {(r.drawnByGroup[g.key] ?? []).join(" · ")}
                                  </td>
                                ))}
                              <td>
                                {r.description}
                                {r.matchedAs ? (
                                  <span className="lcg-muted lcg-fine">
                                    {" "}
                                    ({r.matchedAs === "exact" ? "exact order" : "any order"})
                                  </span>
                                ) : null}
                              </td>
                              {includeAddOn && addOnLabel ? (
                                <td>
                                  {r.addOnEffect ? (
                                    <>
                                      <span className="lcg-numcell">
                                        {r.addOnEffect.combination.join(" · ")}
                                      </span>{" "}
                                      <span className="lcg-muted lcg-fine">
                                        {addOnLabel} {r.addOnEffect.addOnValue} replaced position{" "}
                                        {r.addOnEffect.replacedPosition + 1}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="lcg-muted">base draw</span>
                                  )}
                                </td>
                              ) : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  <p className="lcg-fine lcg-muted">
                    This searches past drawings. To compare a ticket against one drawing, use{" "}
                    <a href="#jg-03">Check your numbers</a>.
                  </p>
                </>
              ) : (
                <p className="lcg-fine lcg-muted">
                  Enter your numbers and search to see the drawings they appeared in.
                </p>
              )}
            </div>
          </>
        )}
      </section>


      {/* ---------------------------------------------------------- JG-09 */}
      <section className="lcg-section" id="jg-09" data-section-id="JG-09" {...sectionAuditAttributes("game", "JG-09")} aria-labelledby="jg-09-h">
        <h3 className="lcg-h2" id="jg-09-h">
          {headings.statistics}
        </h3>
        <p className="lcg-fine">{headings.statisticsIntro}</p>

        {/* The compact preview: four figures, always visible. */}
        {statsPreview.length > 0 ? (
          <dl className="lcg-metricrow" data-metrics={statsPreview.length}>
            {statsPreview.map((m) => (
              <div className="lcg-metric" key={m.label}>
                <dt>{m.label}</dt>
                <dd>
                  <span className="lcg-metric__value">{m.value}</span>
                  <span className="lcg-metric__note">{m.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="lcg-fine lcg-muted">No drawings match the selected range.</p>
        )}

        <div className="lcg-actions">
          <button
            className="lcg-btn"
            type="button"
            aria-expanded={statsExpanded}
            aria-controls="jg-09-detail"
            onClick={() => setStatsExpanded((v) => !v)}
          >
            {statsExpanded ? "Hide detailed statistics" : "Show detailed statistics"}
          </button>
        </div>

        {/*
          The detail. Everything that used to be inline — positional frequency, pairs, gaps, adjacency, the
          variant comparison — now lives behind this explicit expansion.
        */}
        <div id="jg-09-detail" hidden={!statsExpanded}>
          {stats ? (
            <div className="lcg-statgrid">
              {stats.positions.map((p) => {
                const max = Math.max(...Object.values(p.counts), 1);
                return (
                  <div className="lcg-statcard" key={p.position}>
                    <h4 className="lcg-h4">{p.positionLabel}</h4>
                    <ul className="lcg-bars">
                      {Object.entries(p.counts).map(([d, c]) => (
                        <li key={d}>
                          <span className="lcg-bars__label">{d}</span>
                          <span className="lcg-bars__track">
                            <span className="lcg-bars__fill" style={{ width: `${(c / max) * 100}%` }} />
                          </span>
                          <span className="lcg-bars__value">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              <div className="lcg-statcard">
                <h4 className="lcg-h4">Total of the drawn values</h4>
                <ul className="lcg-bars">
                  {(stats.sums?.buckets ?? []).map((b) => {
                    const max = Math.max(...(stats.sums?.buckets ?? []).map((x) => x.count), 1);
                    return (
                      <li key={b.label}>
                        <span className="lcg-bars__label">{b.label}</span>
                        <span className="lcg-bars__track">
                          <span className="lcg-bars__fill" style={{ width: `${(b.count / max) * 100}%` }} />
                        </span>
                        <span className="lcg-bars__value">{b.count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {[stats.front, stats.back].map((pf) => (
                <div className="lcg-statcard" key={pf.kind}>
                  <h4 className="lcg-h4">
                    {pf.kind === "front" ? "Front pairs drawn most often" : "Back pairs drawn most often"}
                  </h4>
                  {pf.top.length > 0 ? (
                    <ul className="lcg-matchlist">
                      {pf.top.map((t) => (
                        <li key={t.pair}>
                          <span className="lcg-numcell">{t.pair}</span>{" "}
                          <span className="lcg-muted">
                            {t.count} time{t.count === 1 ? "" : "s"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="lcg-fine lcg-muted">No pairs in the selected window.</p>
                  )}
                </div>
              ))}

              <div className="lcg-statcard">
                <h4 className="lcg-h4">Adjacent values and repeats</h4>
                <dl className="lcg-facts">
                  <div className="lcg-fact">
                    <dt>Drawings with two adjacent values</dt>
                    <dd>
                      {stats.consec.drawsWithConsecutive} of {stats.consec.total}
                    </dd>
                  </div>
                  {Object.entries(stats.repeats.byGameId).map(([id, r]) => (
                    <div className="lcg-fact" key={id}>
                      <dt>{r.variantLabel || "Main"} repeated a value from the drawing before</dt>
                      <dd>
                        {r.shared} of {r.compared}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="lcg-statcard">
                <h4 className="lcg-h4">Historical gap since last drawn</h4>
                <div className="lcg-tablewrap">
                  <table className="lcg-table lcg-table--tight">
                    <caption className="lcs-vh">
                      Drawings since each value last appeared. {coverage.statement}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Value</th>
                        <th scope="col">Drawings since</th>
                        <th scope="col">Last drawn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.gaps.map((g) => (
                        <tr key={g.digit}>
                          <td className="lcg-numcell">{g.digit}</td>
                          <td>{g.drawsSinceLastSeen ?? "not in this window"}</td>
                          <td>{g.lastSeenIso ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {stats.variants.rows.length > 1 ? (
                <div className="lcg-statcard lcg-statcard--wide">
                  <h4 className="lcg-h4">Comparing the drawings</h4>
                  <div className="lcg-tablewrap">
                    <table className="lcg-table lcg-table--tight">
                      <caption className="lcs-vh">
                        Each drawing compared over the same window. {coverage.statement}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Drawing</th>
                          <th scope="col">Drawings</th>
                          <th scope="col">All different</th>
                          <th scope="col">One pair</th>
                          <th scope="col">All the same</th>
                          <th scope="col">Average total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.variants.rows.map((r) => (
                          <tr key={r.gameId}>
                            <td>{r.variantLabel || "Main"}</td>
                            <td>{r.drawCount}</td>
                            <td>{r.allDifferent}</td>
                            <td>{r.onePair}</td>
                            <td>{r.triple}</td>
                            <td>{r.averageSumDisplay}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="lcg-boundary">{STATISTICS_NEUTRALITY}</p>
      </section>
    </>
  );
}
