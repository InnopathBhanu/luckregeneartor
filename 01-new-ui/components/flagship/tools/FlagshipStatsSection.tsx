"use client";

/*
 * FG-07B — THE STATS LAB. LRG-FLAGSHIP-004.
 *
 * Authority: BP-04A §18, BP-05C §11 and §19, the active founder instruction (*"Every stat should connect back to
 * action: filter explorer · show matching draws · ask AI about this stat. Avoid static-only stat cards."*).
 *
 * Every row carries the exact `ExplorerFilter` that selects the drawings it was counted from, so "17 came up 48
 * times" is not a claim the reader has to take on trust — it opens the 48 drawings in the explorer above.
 */

import { useState } from "react";
import FlagshipLocked from "@/components/flagship/FlagshipLocked";
import { askFlagshipAi } from "@/components/flagship/tools/FlagshipAiConsole";
import { useConsole } from "@/components/flagship/tools/FlagshipConsole";
import type { ConsoleSectionProps } from "@/components/flagship/tools/consoleSectionProps";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

const ASK_ANCHOR = "#ask-ai";

export default function FlagshipStatsSection({
  gameLabel, statViews, statsMethod, insightBoundary, statsLocks, lockedNote,
}: ConsoleSectionProps) {
  const { applyFilter } = useConsole();
  const [selected, setSelected] = useState(statViews[0]?.definition.key ?? "");
  const active = statViews.find((v) => v.definition.key === selected) ?? statViews[0];
  if (!active) return null;

  const availableCount = statViews.filter((v) => v.available).length;

  return (
    <section className="lcfg-section" data-section-id="FG-07B" {...sectionAuditAttributes("flagship", "FG-07B")} id="stats-lab" aria-labelledby="lcfg-h2-stats">
      <h2 className="lcfg-h2" id="lcfg-h2-stats">
        {gameLabel} Stats Lab
      </h2>
      <p className="lcfg-lede">
        Every figure below is counted from the drawing record above, and every row opens the drawings it was
        counted from.
      </p>

      <div className="lcfg-tool" data-tool="stats-lab" data-available-views={availableCount}>
        <div className="lcfg-tabs" role="tablist" aria-label={`${gameLabel} analyses`}>
          {statViews.map((v) => (
            <button
              key={v.definition.key}
              type="button"
              role="tab"
              id={`lcfg-stat-tab-${v.definition.key}`}
              aria-selected={v.definition.key === selected}
              aria-controls={`lcfg-stat-panel-${v.definition.key}`}
              tabIndex={v.definition.key === selected ? 0 : -1}
              className="lcfg-tab"
              data-available={v.available}
              /* The strip shows a short label; the accessible name keeps the full one. */
              aria-label={v.definition.label}
              onClick={() => setSelected(v.definition.key)}
            >
              {v.definition.tabLabel}
              {!v.available ? (
                <span className="lcfg-tab__flag" aria-label="needs more drawings">
                  {" "}
                  ·
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div
          className="lcfg-statpanel"
          role="tabpanel"
          id={`lcfg-stat-panel-${active.definition.key}`}
          aria-labelledby={`lcfg-stat-tab-${active.definition.key}`}
          tabIndex={0}
          data-view={active.definition.key}
          data-available={active.available}
        >
          <h3 className="lcfg-h3">{active.definition.label}</h3>
          <p className="lcfg-fine">{active.definition.purpose}</p>

          {active.available ? (
            <>
              <div className="lcfg-tablewrap">
                <table className="lcfg-table" data-table="stat">
                  <caption>
                    {active.definition.label}, counted over {active.drawCount} {gameLabel} drawings
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{active.definition.key === "frequency" || active.definition.key === "overdue" ? "Number" : "Pattern"}</th>
                      <th scope="col">{active.definition.measureLabel}</th>
                      <th scope="col">Share</th>
                      <th scope="col">Do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.rows.map((r) => (
                      <tr key={r.label}>
                        <th scope="row">{r.label}</th>
                        <td>{r.count}</td>
                        <td>{r.share === null ? "—" : `${Math.round(r.share * 100)}%`}</td>
                        <td>
                          <button
                            type="button"
                            className="lcfg-rowbtn"
                            data-open-drawings={r.label}
                            onClick={() => applyFilter(r.filter)}
                          >
                            Open these drawings
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="lcfg-actions">
                <a
                  className="lcfg-chip lcfg-chip--ask"
                  href={ASK_ANCHOR}
                  onClick={() =>
                    askFlagshipAi({
                      key: "explain-stats-view",
                      context: [
                        `${active.definition.label}, counted over ${active.drawCount} ${gameLabel} drawings.`,
                        active.rows
                          .slice(0, 3)
                          .map((r) => `${r.label}: ${r.count}${r.share === null ? "" : ` (${Math.round(r.share * 100)}%)`}`)
                          .join(" · "),
                        statsMethod,
                        insightBoundary,
                      ],
                    })
                  }
                >
                  Explain this pattern
                </a>
              </p>
            </>
          ) : (
            <div className="lcfg-empty" data-empty-state="needs-history">
              <p className="lcfg-empty__head">Not enough drawings for this one yet</p>
              <p className="lcfg-fine">{active.reason}</p>
              <p className="lcfg-fine lcfg-muted">
                Nothing is estimated to cover the gap. The other {availableCount} analyses on this page do have
                enough drawings behind them.
              </p>
            </div>
          )}

          <p className="lcfg-method">{statsMethod}</p>
          <p className="lcfg-boundary">{insightBoundary}</p>
        </div>

        <FlagshipLocked capabilities={statsLocks} note={lockedNote} label="Keep and compare your analysis" />
      </div>
    </section>
  );
}
