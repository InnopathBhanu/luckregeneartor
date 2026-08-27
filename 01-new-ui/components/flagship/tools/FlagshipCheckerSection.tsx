"use client";

/*
 * FG-02 — CHECK YOUR TICKET. LRG-FLAGSHIP-004.
 *
 * Authority: BP-04A §16, the frozen Constitution (result verification is protected from interruption and
 * commercial pressure; deliver value before asking for anything), the active founder instruction
 * (*"Move this above the large historical table. It is a primary user job and should be in the top
 * experience."*).
 *
 * Third section on the page, directly under the AI region. Every comparison happens in `checkAgainstHistory`,
 * a pure unit-tested function; this file collects inputs and draws one outcome. The locked continuations sit
 * AFTER the result, which is the Constitution's value-before-engagement rule expressed as DOM order.
 */

import { useMemo } from "react";
import { availableCheckModes, checkAgainstHistory } from "@/lib/flagship/flagshipCheck";
import { provenanceTag } from "@/lib/flagship/flagshipDisplay";
import FlagshipLocked from "@/components/flagship/FlagshipLocked";
import { askFlagshipAi } from "@/components/flagship/tools/FlagshipAiConsole";
import { useConsole } from "@/components/flagship/tools/FlagshipConsole";
import type { ConsoleSectionProps } from "@/components/flagship/tools/consoleSectionProps";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

const ASK_ANCHOR = "#ask-ai";

export default function FlagshipCheckerSection({
  gameLabel, matrix, history, multiplierMode, multiplierLabel, secondaryLabel, checkerLocks, lockedNote,
  coverage, displayMode, checkerExamples,
}: ConsoleSectionProps) {
  /* FGP-008: offer only the depths the published archive can honour. A "last 10 drawings" radio over one
     published drawing would be a control that quietly does something else. */
  const modes = availableCheckModes(coverage.publishedDrawings);
  const {
    line, setLine, special, setSpecial, multiplierBought, setMultiplierBought,
    mode, setMode, focusDateIso, setFocusDateIso, submitted, setSubmitted,
  } = useConsole();
  const ticket = useMemo(
    () => ({ main: line.filter((v): v is number => v !== null), special, multiplierBought }),
    [line, special, multiplierBought],
  );

  const focusRow = focusDateIso ? history.rows.find((r) => r.drawDateIso === focusDateIso) ?? null : null;

  /* A single named drawing is its own scan of one, so the same pure function answers both cases. */
  const scan = useMemo(() => {
    if (!submitted) return null;
    const draws = focusRow ? [focusRow] : history.rows;
    return checkAgainstHistory(ticket, draws, matrix, focusRow ? "all" : mode, {
      multiplierMode,
      multiplierLabel: multiplierLabel ?? undefined,
    });
  }, [submitted, focusRow, history.rows, ticket, matrix, mode, multiplierMode, multiplierLabel]);

  const setPosition = (i: number, raw: string) => {
    const v = raw.trim() === "" ? null : Number(raw);
    const next = [...line];
    next[i] = v === null || Number.isNaN(v) ? null : v;
    setLine(next);
    setSubmitted(false);
  };

  return (
    <section
      className="lcfg-section"
      data-section-id="FG-02" {...sectionAuditAttributes("flagship", "FG-02")}
      id="check-numbers"
      aria-labelledby="lcfg-h2-check"
      data-check-mode={focusRow ? "single-draw" : mode}
    >
      <h2 className="lcfg-h2" id="lcfg-h2-check">
        Check your {gameLabel} numbers
      </h2>
      <p className="lcfg-lede">
        {coverage.canCheckRange
          ? "Enter a line once and check it against the latest published drawing, the last ten, or every drawing connected to this page. No account, no sign-up, and nothing is sent anywhere."
          : "Enter a line and check it against the latest published drawing. No account, no sign-up, and nothing is sent anywhere."}
      </p>

      <div className="lcfg-tool" data-tool="checker">
        <form
          className="lcfg-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <fieldset className="lcfg-fieldset">
            <legend>Your numbers</legend>
            {/*
              A LINE TO TRY — FGP-009.

              Entering six numbers before the tool does anything is the checker's whole cost of entry, and a
              reader evaluating the page will not pay it. These load a line into the same inputs the reader would
              have typed, so the next thing they see is the real outcome, not a demonstration of one.

              The examples come from the data layer, so they always refer to drawings this page actually holds.
            */}
            {checkerExamples.length > 0 ? (
              <div className="lcfg-examples" data-examples={checkerExamples.length}>
                <span className="lcfg-fine lcfg-muted">Or try one:</span>
                {checkerExamples.map((ex) => (
                  <button
                    key={ex.key}
                    type="button"
                    className="lcfg-rowbtn"
                    data-example={ex.key}
                    onClick={() => {
                      /* Padded or trimmed to the matrix, so a payload written for a different game shape cannot
                         leave a stray slot filled. */
                      const next = Array.from({ length: matrix.mainCount }, (_, i) => ex.main[i] ?? null);
                      setLine(next);
                      setSpecial(ex.special);
                      setSubmitted(false);
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="lcfg-entry">
              {line.map((v, i) => (
                <span key={i} className="lcfg-entry__slot">
                  <label className="lcs-vh" htmlFor={`lcfg-main-${i}`}>
                    Main number {i + 1} of {matrix.mainCount}
                  </label>
                  <input
                    id={`lcfg-main-${i}`}
                    className="lcfg-numinput"
                    type="number"
                    inputMode="numeric"
                    min={matrix.mainMin}
                    max={matrix.mainMax}
                    value={v ?? ""}
                    placeholder="–"
                    onChange={(e) => setPosition(i, e.target.value)}
                  />
                </span>
              ))}
              {matrix.specialLabel ? (
                <span className="lcfg-entry__slot lcfg-entry__slot--special">
                  <label className="lcfg-entry__speciallabel" htmlFor="lcfg-special">
                    {matrix.specialLabel}
                  </label>
                  <input
                    id="lcfg-special"
                    className="lcfg-numinput lcfg-numinput--special"
                    type="number"
                    inputMode="numeric"
                    min={matrix.specialMin}
                    max={matrix.specialMax}
                    value={special ?? ""}
                    placeholder="–"
                    onChange={(e) => {
                      setSpecial(e.target.value.trim() === "" ? null : Number(e.target.value));
                      setSubmitted(false);
                    }}
                  />
                </span>
              ) : null}
            </div>
            {coverage.canCheckRange ? null : (
              <p className="lcfg-fine" data-coverage="single-published-draw">
                Only the latest published {gameLabel} drawing — {history.rows[0]?.drawDateIso} — is connected, so
                that is what your line is checked against. When the drawing archive is connected you will be able
                to check the last ten, or every published drawing, from here.
              </p>
            )}
            <p className="lcfg-fine lcfg-muted">
              {matrix.mainCount} numbers from {matrix.mainMin} to {matrix.mainMax}
              {matrix.specialLabel
                ? `, plus one ${matrix.specialLabel} from ${matrix.specialMin} to ${matrix.specialMax}. The ${matrix.specialLabel} comes from its own pool, so it can repeat a main number.`
                : "."}{" "}
              Order does not matter.
            </p>
          </fieldset>

          <fieldset className="lcfg-fieldset" hidden={modes.length <= 1}>
            <legend>How far back?</legend>
            <div className="lcfg-togglerow" role="radiogroup" aria-label="How far back to check">
              {modes.map((m) => (
                <label key={m.key} className="lcfg-toggle">
                  <input
                    type="radio"
                    name="lcfg-check-mode"
                    value={m.key}
                    checked={!focusRow && mode === m.key}
                    onChange={() => {
                      setMode(m.key);
                      setFocusDateIso(null);
                      setSubmitted(false);
                    }}
                  />
                  <span>
                    {m.label}
                    {m.key === "all" ? ` (${history.rows.length})` : ""}
                  </span>
                </label>
              ))}
            </div>
            {modes.length <= 1 ? null : null}
            {focusRow ? (
              <p className="lcfg-fine" data-focus-draw={focusRow.drawDateIso}>
                Checking against the single drawing on <strong>{focusRow.drawDateIso}</strong>, chosen from the
                search above.{" "}
                <button type="button" className="lcfg-linkbtn" onClick={() => setFocusDateIso(null)}>
                  Check a range instead
                </button>
              </p>
            ) : null}
          </fieldset>

          {multiplierMode === "independentlySelected" && multiplierLabel ? (
            <div className="lcfg-field lcfg-field--check">
              <input
                id="lcfg-mult"
                type="checkbox"
                checked={multiplierBought}
                onChange={(e) => {
                  setMultiplierBought(e.target.checked);
                  setSubmitted(false);
                }}
              />
              <label htmlFor="lcfg-mult">My ticket includes {multiplierLabel}</label>
            </div>
          ) : null}

          {multiplierMode === "builtIn" && multiplierLabel ? (
            <p className="lcfg-fine lcfg-muted">
              There is no {multiplierLabel} field to fill in: it is assigned to your play when the ticket is
              bought and printed on the ticket itself, so it is not something to look up against the drawing.
            </p>
          ) : null}

          <div className="lcfg-actions">
            <button className="lcfg-btn lcfg-btn--primary" type="submit">
              Check these numbers
            </button>
            <button
              className="lcfg-btn"
              type="button"
              onClick={() => {
                setLine(Array(matrix.mainCount).fill(null));
                setSpecial(null);
                setSubmitted(false);
              }}
            >
              Clear
            </button>
          </div>
        </form>

        <div
          className="lcfg-outcome"
          role="status"
          aria-live="polite"
          data-outcome={scan?.complete ? (scan.hits.length > 0 ? "hits" : "none") : scan ? "incomplete" : "idle"}
        >
          {scan && !scan.complete ? (
            <ul className="lcfg-errors">
              {scan.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}

          {scan?.complete ? (
            <>
              <p className="lcfg-outcome__headline">{scan.statement}</p>
              <p className="lcfg-fine lcfg-muted">
                {scan.searched} {scan.searched === 1 ? "drawing" : "drawings"} compared
                {scan.hits.length > 0
                  ? ` · ${scan.productionHits} of the matches ${
                      scan.productionHits === 1 ? "is a" : "are"
                    } published ${scan.productionHits === 1 ? "drawing" : "drawings"}`
                  : ""}
                .
              </p>

              {scan.hits.length > 0 ? (
                <div className="lcfg-tablewrap">
                  <table className="lcfg-table" data-table="check-hits">
                    <caption>Drawings where this line matched something</caption>
                    <thead>
                      <tr>
                        <th scope="col">Drawing</th>
                        <th scope="col">Matched</th>
                        <th scope="col">Your matching numbers</th>
                        {secondaryLabel ? <th scope="col">{secondaryLabel}</th> : null}
                        <th scope="col">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scan.hits.slice(0, 20).map((h) => (
                        <tr key={h.drawDateIso} data-provenance={h.provenance}>
                          <th scope="row">{h.drawDateIso}</th>
                          <td>{h.outcome.matchLabel}</td>
                          <td>{h.outcome.matchedValues.join(", ") || "—"}</td>
                          {secondaryLabel ? (
                            <td>
                              {h.secondaryOutcome && h.secondaryOutcome.matchLabel !== "No match"
                                ? h.secondaryOutcome.matchLabel
                                : "—"}
                            </td>
                          ) : null}
                          <td>
                            <span className="lcfg-tag" data-provenance={h.provenance}>
                              {provenanceTag(h.provenance, displayMode)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <p className="lcfg-fine lcfg-muted">
                What a match is worth is not stated here. Prize amounts are set by the game operator, differ by
                jurisdiction and are pari-mutuel in some of them — only the lottery that sold the ticket can say
                what it pays.
              </p>
              <p className="lcfg-boundary">{scan.boundary}</p>

              <p className="lcfg-actions">
                <a
                  className="lcfg-chip lcfg-chip--ask"
                  href={ASK_ANCHOR}
                  onClick={() =>
                    askFlagshipAi({
                      key: "check-ticket",
                      context: [
                        scan.statement,
                        `${scan.searched} ${scan.searched === 1 ? "drawing was" : "drawings were"} compared, and this line matched something in ${scan.hits.length}.`,
                        scan.productionHits === 0
                          ? "None of those is a real published drawing, so treat this as a demonstration of the tool."
                          : `${scan.productionHits} of them ${scan.productionHits === 1 ? "is a real published drawing" : "are real published drawings"}.`,
                        "Only the lottery that sold a ticket can validate it, and only the official result is final.",
                      ],
                    })
                  }
                >
                  Explain my ticket result
                </a>
              </p>
            </>
          ) : scan ? null : (
            <p className="lcfg-fine lcfg-muted">
              Enter your line and check it. Nothing is sent anywhere and nothing is stored.
            </p>
          )}
        </div>

        {/* AFTER the result, never before it. */}
        <FlagshipLocked
          capabilities={checkerLocks}
          note={lockedNote}
          label="Keep this line between drawings"
        />
      </div>
    </section>
  );
}
