"use client";

/*
 * FG-08 — THE HISTORICAL DRAW EXPLORER. LRG-FLAGSHIP-004.
 *
 * Authority: BP-04A §22, BP-05C §4 T-C3, the active founder instruction (*"It must search historical results,
 * not just current result"*; *"Keep it, but reduce its visual dominance … Default state should be compact"*).
 *
 * Thirteen filter axes over the connected series, composed with AND. Every number comes from `searchDraws`, a
 * pure unit-tested function; this file holds form state and renders.
 *
 * ══ COMPACT FIRST ══
 *
 * The filter panel is collapsed and the table shows six rows until the reader asks for more. The result COUNT is
 * never compacted — it is always the full number of matches, so a short table can never read as a small result.
 */

import { useMemo, useState } from "react";
import type { FlagshipDrawRow } from "@/lib/flagship/flagshipHistory";
import {
  EMPTY_FILTER, EXPLORER_PAGE_SIZE, activeFilterChips, clearFilterKey, searchDraws,
} from "@/lib/flagship/flagshipExplorer";
import FlagshipLocked from "@/components/flagship/FlagshipLocked";
import { askFlagshipAi } from "@/components/flagship/tools/FlagshipAiConsole";
import { useConsole } from "@/components/flagship/tools/FlagshipConsole";
import type { ConsoleSectionProps } from "@/components/flagship/tools/consoleSectionProps";
import { provenanceSentence, provenanceTag, previewCountNote, type FlagshipDisplayMode } from "@/lib/flagship/flagshipDisplay";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

const ASK_ANCHOR = "#ask-ai";

/** Rows shown before the reader expands the table. */
export const COMPACT_ROWS = 6;

export default function FlagshipExplorerSection({
  gameLabel, specialLabel, matrix, history, historyDisclosure, multiplierMode, multiplierValues,
  drawNights, statsLocks, lockedNote, coverage, displayMode,
}: ConsoleSectionProps) {
  const { filter, setFilter, showSimilar, checkDrawing } = useConsole();
  /*
   * FGP-008: with the review fixture out of the page, the published archive is what is left — one drawing per
   * game today. Thirteen filters over one row would be a search that cannot search, so below the threshold the
   * section states its coverage and lists what IS published instead of pretending to be an archive.
   */
  const limited = !coverage.canSearchHistory;
  const [numbersRaw, setNumbersRaw] = useState("");
  /*
   * COMPACT BY DEFAULT — the founder's revision note: *"Do not show a huge table too early."* Six rows and a
   * collapsed filter panel, expanding to the full page of matches on request. The MATCH COUNT is always the full
   * number, so compactness never misrepresents how much was found.
   */
  const [expanded, setExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const limit = expanded ? EXPLORER_PAGE_SIZE : COMPACT_ROWS;

  const result = useMemo(
    () => searchDraws(history.rows, filter, specialLabel ?? "special ball", limit),
    [history.rows, filter, specialLabel, limit],
  );
  const chips = activeFilterChips(filter, specialLabel ?? "special ball");

  const parseNumbers = (raw: string) =>
    raw
      .split(/[^0-9]+/)
      .filter((t) => t.length > 0)
      .map(Number)
      .filter((v) => v >= matrix.mainMin && v <= matrix.mainMax);

  const counts = Array.from({ length: matrix.mainCount + 1 }, (_, i) => i);

  return (
    <section
      className="lcfg-section"
      data-section-id="FG-08" {...sectionAuditAttributes("flagship", "FG-08")}
      id="results-history"
      aria-labelledby="lcfg-h2-explorer"
      data-match-count={result.matchCount}
    >
      <h2 className="lcfg-h2" id="lcfg-h2-explorer">
        {limited ? `Published ${gameLabel} drawings` : `Search past ${gameLabel} drawings`}
      </h2>
      <p className="lcfg-lede">
        {limited
          ? `Every ${gameLabel} drawing published on this site. The drawing archive is not connected yet, so this is a short list rather than a search.`
          : `This searches the ${history.rows.length} ${gameLabel} drawings connected to this page — not just the latest result. Combine as many filters as you like.`}
      </p>

      {limited ? (
        <div className="lcfg-empty" data-empty-state="limited-published-history">
          <p className="lcfg-empty__head">
            {coverage.publishedDrawings === 0
              ? "No published drawing is connected yet"
              : `${coverage.publishedDrawings} published ${coverage.publishedDrawings === 1 ? "drawing" : "drawings"} so far`}
          </p>
          <p className="lcfg-fine">
            Searching by number, date, draw night, balance or sum needs a run of drawings behind it. When the
            {" "}{gameLabel} archive is connected, the filters open here and the count beside them is the number
            of real drawings that match.
          </p>
          <p className="lcfg-fine lcfg-muted">
            Nothing has been generated to fill the gap — the list below is every drawing this site publishes.
          </p>
        </div>
      ) : null}

      {limited ? null : (
      <details className="lcfg-filterdisclosure" open={filtersOpen} onToggle={(e) => setFiltersOpen(e.currentTarget.open)}>
        <summary>
          {filtersOpen ? "Hide filters" : "Filter these drawings"}
          <span className="lcfg-muted"> — numbers, dates, draw night, shape, sum</span>
        </summary>
      <div className="lcfg-filterpanel">
        <div className="lcfg-fieldrow">
          <div className="lcfg-field lcfg-field--wide">
            <label htmlFor="lcfg-x-numbers">Numbers drawn</label>
            <input
              id="lcfg-x-numbers"
              type="text"
              inputMode="numeric"
              placeholder={`Any of ${matrix.mainMin}–${matrix.mainMax}, e.g. 7 23`}
              value={numbersRaw}
              onChange={(e) => {
                setNumbersRaw(e.target.value);
                setFilter({ ...filter, includeMain: parseNumbers(e.target.value) });
              }}
              aria-describedby="lcfg-x-numbers-help"
            />
            <span id="lcfg-x-numbers-help" className="lcfg-fine lcfg-muted">
              A partial line is fine — one number or five. Every one you enter must appear in the drawing.
            </span>
          </div>

          {specialLabel ? (
            <div className="lcfg-field">
              <label htmlFor="lcfg-x-special">{specialLabel}</label>
              <input
                id="lcfg-x-special"
                type="number"
                inputMode="numeric"
                min={matrix.specialMin}
                max={matrix.specialMax}
                placeholder="Any"
                value={filter.special ?? ""}
                onChange={(e) =>
                  setFilter({ ...filter, special: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
          ) : null}

          {multiplierMode === "independentlySelected" && multiplierValues.length > 0 ? (
            <div className="lcfg-field">
              <label htmlFor="lcfg-x-mult">Multiplier</label>
              <select
                id="lcfg-x-mult"
                value={filter.multiplier ?? ""}
                onChange={(e) =>
                  setFilter({ ...filter, multiplier: e.target.value === "" ? null : Number(e.target.value) })
                }
              >
                <option value="">Any</option>
                {multiplierValues.map((v) => (
                  <option key={v} value={v}>
                    {v}X
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="lcfg-fieldrow">
          <div className="lcfg-field">
            <label htmlFor="lcfg-x-from">Drawn from</label>
            <input
              id="lcfg-x-from"
              type="date"
              min={history.fromIso ?? undefined}
              max={history.toIso ?? undefined}
              value={filter.fromIso ?? ""}
              onChange={(e) => setFilter({ ...filter, fromIso: e.target.value || null })}
            />
          </div>
          <div className="lcfg-field">
            <label htmlFor="lcfg-x-to">Drawn to</label>
            <input
              id="lcfg-x-to"
              type="date"
              min={history.fromIso ?? undefined}
              max={history.toIso ?? undefined}
              value={filter.toIso ?? ""}
              onChange={(e) => setFilter({ ...filter, toIso: e.target.value || null })}
            />
          </div>
          <fieldset className="lcfg-field lcfg-field--wide lcfg-fieldset">
            <legend>Draw night</legend>
            <div className="lcfg-togglerow">
              {drawNights.map((d) => (
                <label key={d} className="lcfg-toggle">
                  <input
                    type="checkbox"
                    checked={filter.drawDays.includes(d)}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        drawDays: e.target.checked
                          ? [...filter.drawDays, d]
                          : filter.drawDays.filter((x) => x !== d),
                      })
                    }
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="lcfg-fieldrow">
          <div className="lcfg-field">
            <label htmlFor="lcfg-x-odd">Odd numbers</label>
            <select
              id="lcfg-x-odd"
              value={filter.oddCount ?? ""}
              onChange={(e) =>
                setFilter({ ...filter, oddCount: e.target.value === "" ? null : Number(e.target.value) })
              }
            >
              <option value="">Any</option>
              {counts.map((n) => (
                <option key={n} value={n}>
                  {n} odd · {matrix.mainCount - n} even
                </option>
              ))}
            </select>
          </div>
          <div className="lcfg-field">
            <label htmlFor="lcfg-x-low">Low half</label>
            <select
              id="lcfg-x-low"
              value={filter.lowCount ?? ""}
              onChange={(e) =>
                setFilter({ ...filter, lowCount: e.target.value === "" ? null : Number(e.target.value) })
              }
            >
              <option value="">Any</option>
              {counts.map((n) => (
                <option key={n} value={n}>
                  {n} low · {matrix.mainCount - n} high
                </option>
              ))}
            </select>
          </div>
          <div className="lcfg-field">
            <label htmlFor="lcfg-x-summin">Sum from</label>
            <input
              id="lcfg-x-summin"
              type="number"
              inputMode="numeric"
              placeholder="Any"
              value={filter.sumMin ?? ""}
              onChange={(e) => setFilter({ ...filter, sumMin: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
          <div className="lcfg-field">
            <label htmlFor="lcfg-x-summax">Sum to</label>
            <input
              id="lcfg-x-summax"
              type="number"
              inputMode="numeric"
              placeholder="Any"
              value={filter.sumMax ?? ""}
              onChange={(e) => setFilter({ ...filter, sumMax: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="lcfg-togglerow">
          <label className="lcfg-toggle">
            <input
              type="checkbox"
              checked={filter.hasRepeat}
              onChange={(e) => setFilter({ ...filter, hasRepeat: e.target.checked })}
            />
            <span>Repeated a number from the drawing before</span>
          </label>
          <label className="lcfg-toggle">
            <input
              type="checkbox"
              checked={filter.minConsecutive > 0}
              onChange={(e) => setFilter({ ...filter, minConsecutive: e.target.checked ? 2 : 0 })}
            />
            <span>Contains consecutive numbers</span>
          </label>
          <label className="lcfg-toggle">
            <input
              type="checkbox"
              checked={filter.productionOnly}
              onChange={(e) => setFilter({ ...filter, productionOnly: e.target.checked })}
            />
            <span>Real published drawings only</span>
          </label>
        </div>
      </div>
      </details>
      )}

      {/* Result count and active filters, always visible — the reader must never wonder what they are seeing. */}
      <div className="lcfg-resultbar" role="status" aria-live="polite">
        <p className="lcfg-resultbar__count">
          <strong>{result.matchCount}</strong>{" "}
          {limited
            ? result.matchCount === 1
              ? "published drawing"
              : "published drawings"
            : `${result.matchCount === 1 ? "drawing matches" : "drawings match"}`}
          {limited ? null : <span className="lcfg-muted"> of {result.searchedCount} searched</span>}
          {/*
            FGP-009: the series may mix one published drawing with preview history, so the count is qualified.
            "300 drawings match" without this line would read as 300 published results.
          */}
          {!limited && result.productionMatchCount < result.matchCount ? (
            <span className="lcfg-muted lcfg-fine">
              {" "}
              · {result.productionMatchCount} of them{" "}
              {result.productionMatchCount === 1 ? "is a published result" : "are published results"}, the rest
              are preview drawings
            </span>
          ) : null}
        </p>

        {chips.length > 0 ? (
          <ul className="lcfg-chiprow" aria-label="Active filters">
            {chips.map((c) => (
              <li key={`${c.key}-${c.label}`}>
                <button
                  type="button"
                  className="lcfg-filterchip"
                  data-filter-key={c.key}
                  onClick={() => {
                    setFilter(clearFilterKey(filter, c.key));
                    if (c.key === "includeMain") setNumbersRaw("");
                  }}
                >
                  {c.label}
                  <span aria-hidden="true"> ×</span>
                  <span className="lcs-vh"> — remove this filter</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="lcfg-btn"
                onClick={() => {
                  setFilter(EMPTY_FILTER);
                  setNumbersRaw("");
                }}
              >
                Clear all
              </button>
            </li>
          </ul>
        ) : (
          <p className="lcfg-fine lcfg-muted">No filters applied — showing every drawing, newest first.</p>
        )}

        <p className="lcfg-actions">
          {limited ? null : (
          <button
            type="button"
            className="lcfg-chip lcfg-chip--ask"
            onClick={() =>
              askFlagshipAi({
                key: "summarise-matches",
                context: summariseMatches(
                  result.matchCount,
                  result.searchedCount,
                  result.productionMatchCount,
                  chips.map((c) => c.label),
                  result.rows,
                  displayMode,
                ),
              })
            }
          >
            Summarise these {result.matchCount} drawings
          </button>
          )}
        </p>
      </div>

      {result.matchCount === 0 ? (
        <div className="lcfg-empty" data-empty-state="no-matches">
          <p className="lcfg-empty__head">No drawing matches all of those filters</p>
          <p className="lcfg-fine">
            That is a real answer, not an error — the combination has not come up in the {result.searchedCount}{" "}
            drawings held here. Remove a filter above to widen the search.
          </p>
        </div>
      ) : (
        <>
          <div className="lcfg-tablewrap">
            <table className="lcfg-table" data-table="explorer">
              <caption>
                {limited
                  ? `Every published ${gameLabel} drawing on this site`
                  : `${result.shown} of ${result.matchCount} matching ${gameLabel} drawings, newest first`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Drawing</th>
                  <th scope="col">Numbers</th>
                  {specialLabel ? <th scope="col">{specialLabel}</th> : null}
                  <th scope="col">Shape</th>
                  <th scope="col">Source</th>
                  <th scope="col">Do</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.drawDateIso} data-provenance={row.provenance}>
                    <th scope="row">
                      {row.drawDateIso}
                      <span className="lcfg-muted"> {row.drawDay}</span>
                    </th>
                    <td className="lcfg-cell--numbers">{row.main.join(" · ")}</td>
                    {specialLabel ? <td>{row.special ?? "—"}</td> : null}
                    <td className="lcfg-fine lcfg-muted">
                      sum {row.sum} · {row.oddCount} odd · {row.lowCount} low
                      {row.longestRun >= 2 ? ` · ${row.longestRun} in a row` : ""}
                      {row.repeatsFromPrevious.length > 0
                        ? ` · repeated ${row.repeatsFromPrevious.join(", ")}`
                        : ""}
                    </td>
                    <td>
                      <span className="lcfg-tag" data-provenance={row.provenance}>
                        {provenanceTag(row.provenance, displayMode)}
                      </span>
                    </td>
                    <td>
                      <span className="lcfg-rowactions">
                        <button type="button" className="lcfg-rowbtn" onClick={() => checkDrawing(row)}>
                          Check my line
                        </button>
                        <button type="button" className="lcfg-rowbtn" onClick={() => showSimilar(row)}>
                          Similar drawings
                        </button>
                        <a
                          className="lcfg-rowbtn"
                          href={ASK_ANCHOR}
                          onClick={() =>
                            askFlagshipAi({
                              key: "explain-draw",
                              context: describeDrawing(row, specialLabel, displayMode),
                            })
                          }
                        >
                          Ask about it
                        </a>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.matchCount > result.shown ? (
            <p className="lcfg-actions">
              {!expanded ? (
                <button type="button" className="lcfg-btn" onClick={() => setExpanded(true)}>
                  Show more matches
                </button>
              ) : (
                <button type="button" className="lcfg-btn" onClick={() => setExpanded(false)}>
                  Show fewer
                </button>
              )}
              <span className="lcfg-fine lcfg-muted">
                Showing {result.shown} of {result.matchCount}. Narrow the filters to see the rest — the count is
                always the full number of matches.
              </span>
            </p>
          ) : null}
        </>
      )}

      <p className="lcfg-method">{historyDisclosure}</p>

      <FlagshipLocked
        capabilities={statsLocks.filter((c) => ["save-view", "export-snapshot"].includes(c.key))}
        note={lockedNote}
        label="Keep this search"
        layout="inline"
      />
    </section>
  );
}

/** Live, computed context for the "summarise these drawings" question. Arithmetic, not generation. */

function summariseMatches(
  matchCount: number,
  searched: number,
  production: number,
  chipLabels: readonly string[],
  shown: readonly FlagshipDrawRow[],
  displayMode: FlagshipDisplayMode,
): string[] {
  if (matchCount === 0) {
    return [
      `None of the ${searched} drawings held here matches all of those filters.`,
      chipLabels.length > 0 ? `Filters applied: ${chipLabels.join("; ")}.` : "No filters were applied.",
      "That is a fact about this record, and it says nothing about what a future drawing will do.",
    ];
  }
  const dates = shown.map((r) => r.drawDateIso).sort();
  const sums = shown.map((r) => r.sum);
  const avg = Math.round(sums.reduce((a, b) => a + b, 0) / Math.max(1, sums.length));
  return [
    `${matchCount} of the ${searched} drawings held here match — ${Math.round((matchCount / searched) * 100)}% of the record.`,
    chipLabels.length > 0 ? `Filters applied: ${chipLabels.join("; ")}.` : "No filters were applied.",
    dates.length > 0
      ? `The matches shown run from ${dates[0]} to ${dates[dates.length - 1]}, with an average total of ${avg}.`
      : "",
    production > 0
      ? `${production} of the matches ${production === 1 ? "is a published drawing" : "are published drawings"}.`
      : "None of the matches is a published drawing, so treat this as a demonstration of the tool.",
    previewCountNote(matchCount - production, displayMode) ?? "",
    "This describes drawings that have already happened. Each drawing is independent, so none of it bears on the next one.",
  ].filter((t) => t.length > 0);
}

function describeDrawing(
  row: FlagshipDrawRow,
  specialLabel: string | null,
  displayMode: FlagshipDisplayMode,
): string[] {
  return [
    `The drawing on ${row.drawDateIso} (${row.drawDay}) produced ${row.main.join(", ")}` +
      (row.special !== null && specialLabel ? `, with a ${specialLabel} of ${row.special}.` : "."),
    `Its numbers total ${row.sum}, split ${row.oddCount} odd and ${row.lowCount} in the low half` +
      (row.longestRun >= 2 ? `, and it contained ${row.longestRun} consecutive numbers.` : "."),
    row.repeatsFromPrevious.length > 0
      ? `It repeated ${row.repeatsFromPrevious.join(", ")} from the drawing before it.`
      : "No number carried over from the drawing before it.",
    provenanceSentence(row.provenance, displayMode),
  ];
}

