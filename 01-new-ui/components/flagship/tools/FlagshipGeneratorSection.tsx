"use client";

/*
 * FG-07A — BUILD A LINE. LRG-FLAGSHIP-004.
 *
 * Authority: BP-04A §21, BP-05C §11, the frozen Constitution (an entertainment tool, clearly classified; copy
 * MUST NOT imply that generation changes the odds of a fair independent drawing).
 *
 * Every number comes from `generateLines`, which uses a CSPRNG with rejection sampling and refuses to fall back
 * to a weaker source. Every control is labelled as a PREFERENCE about the line you want, and the boundary is
 * stated once, prominently, under the output.
 */

import { useMemo, useState } from "react";
import {
  dateRangeNote, generateLines, validateLocks, GENERATOR_BOUNDARY, MAX_SETS,
} from "@/lib/flagship/flagshipGenerator";
import type { GeneratorResult } from "@/lib/flagship/flagshipGenerator";
import FlagshipLocked from "@/components/flagship/FlagshipLocked";
import { useConsole } from "@/components/flagship/tools/FlagshipConsole";
import type { ConsoleSectionProps } from "@/components/flagship/tools/consoleSectionProps";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

export default function FlagshipGeneratorSection({
  gameLabel, generatorMatrix, history, generatorLocks, lockedNote,
}: ConsoleSectionProps) {
  const { testLine } = useConsole();
  const m = generatorMatrix;
  const [setCount, setSetCount] = useState(3);
  const [lockedRaw, setLockedRaw] = useState("");
  const [lockedSpecialRaw, setLockedSpecialRaw] = useState("");
  const [targetOdd, setTargetOdd] = useState<number | null>(null);
  const [targetLow, setTargetLow] = useState<number | null>(null);
  const [excludeRecentDraws, setExcludeRecentDraws] = useState(0);
  const [avoidDateHeavy, setAvoidDateHeavy] = useState(false);
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  const recent = useMemo(() => history.rows.map((r) => r.main), [history.rows]);
  const counts = Array.from({ length: m.mainCount + 1 }, (_, i) => i);

  const run = () => {
    const options = {
      mode: (targetOdd !== null || targetLow !== null || avoidDateHeavy ? "balanced" : "random") as
        | "random"
        | "balanced",
      lockedMain: lockedRaw.split(/[^0-9]+/).filter((s) => s.length > 0).map(Number),
      lockedSpecial: lockedSpecialRaw.trim() === "" ? null : Number(lockedSpecialRaw),
      setCount,
      targetOdd,
      targetLow,
      excludeRecentDraws,
      avoidDateHeavy,
    };
    const problems = validateLocks(options, m);
    if (problems.length > 0) {
      setErrors(problems);
      setResult(null);
      setFailure(null);
      return;
    }
    try {
      setErrors([]);
      setFailure(null);
      setResult(generateLines(m, options, recent));
    } catch (e) {
      setResult(null);
      setFailure(e instanceof Error ? e.message : "Number generation is unavailable in this browser.");
    }
  };

  return (
    <section className="lcfg-section" data-section-id="FG-07A" {...sectionAuditAttributes("flagship", "FG-07A")} id="generator" aria-labelledby="lcfg-h2-gen">
      <h2 className="lcfg-h2" id="lcfg-h2-gen">
        Build a {gameLabel} line
      </h2>
      <p className="lcfg-lede">
        Keep the numbers you always play, shape the rest how you like, then test the line against the drawing
        record.
      </p>

      <div className="lcfg-tool" data-tool="generator">
        <div className="lcfg-fieldrow">
          <div className="lcfg-field lcfg-field--wide">
            <label htmlFor="lcfg-gen-locked">Numbers you want to keep</label>
            <input
              id="lcfg-gen-locked"
              type="text"
              inputMode="numeric"
              placeholder={`e.g. 7 23 — from ${m.mainMin} to ${m.mainMax}`}
              value={lockedRaw}
              onChange={(e) => setLockedRaw(e.target.value)}
            />
          </div>
          {m.specialLabel ? (
            <div className="lcfg-field">
              <label htmlFor="lcfg-gen-special">Keep a {m.specialLabel}</label>
              <input
                id="lcfg-gen-special"
                type="number"
                inputMode="numeric"
                min={m.specialMin}
                max={m.specialMax}
                placeholder="–"
                value={lockedSpecialRaw}
                onChange={(e) => setLockedSpecialRaw(e.target.value)}
              />
            </div>
          ) : null}
          <div className="lcfg-field">
            <label htmlFor="lcfg-gen-count">How many lines?</label>
            <select id="lcfg-gen-count" value={setCount} onChange={(e) => setSetCount(Number(e.target.value))}>
              {Array.from({ length: MAX_SETS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lcfg-fieldrow">
          <div className="lcfg-field">
            <label htmlFor="lcfg-gen-odd">Odd and even</label>
            <select
              id="lcfg-gen-odd"
              value={targetOdd ?? ""}
              onChange={(e) => setTargetOdd(e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">No preference</option>
              {counts.map((n) => (
                <option key={n} value={n}>
                  {n} odd · {m.mainCount - n} even
                </option>
              ))}
            </select>
          </div>
          <div className="lcfg-field">
            <label htmlFor="lcfg-gen-low">Low and high</label>
            <select
              id="lcfg-gen-low"
              value={targetLow ?? ""}
              onChange={(e) => setTargetLow(e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">No preference</option>
              {counts.map((n) => (
                <option key={n} value={n}>
                  {n} low · {m.mainCount - n} high
                </option>
              ))}
            </select>
          </div>
          <div className="lcfg-field">
            <label htmlFor="lcfg-gen-exclude">Avoid numbers drawn recently</label>
            <select
              id="lcfg-gen-exclude"
              value={excludeRecentDraws}
              onChange={(e) => setExcludeRecentDraws(Number(e.target.value))}
            >
              <option value={0}>No preference</option>
              <option value={1}>From the last drawing</option>
              <option value={3}>From the last 3 drawings</option>
              <option value={5}>From the last 5 drawings</option>
            </select>
          </div>
        </div>

        <div className="lcfg-togglerow">
          <label className="lcfg-toggle">
            <input
              type="checkbox"
              checked={avoidDateHeavy}
              onChange={(e) => setAvoidDateHeavy(e.target.checked)}
            />
            <span>Include at least one number above 31</span>
          </label>
        </div>
        <p className="lcfg-fine lcfg-muted">
          Every one of these changes what this tool hands you, and nothing else. A shaped line is neither more nor
          less likely to be drawn than any other.
        </p>

        <div className="lcfg-actions">
          <button className="lcfg-btn lcfg-btn--primary" type="button" onClick={run}>
            {result ? "Generate again" : `Generate ${gameLabel} numbers`}
          </button>
        </div>

        <div className="lcfg-outcome" role="status" aria-live="polite" data-generated={result?.lines.length ?? 0}>
          {errors.length > 0 ? (
            <ul className="lcfg-errors">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
          {failure ? <p className="lcfg-fine">{failure}</p> : null}

          {result ? (
            <>
              {result.relaxed ? <p className="lcfg-fine">{result.relaxed}</p> : null}
              <ul className="lcfg-lines">
                {result.lines.map((l, i) => {
                  const note = dateRangeNote(l, m.mainMax);
                  return (
                    <li key={i} className="lcfg-line">
                      <span className="lcs-vh">Line {i + 1}</span>
                      <span className="lcfg-line__values">
                        {l.main.map((v) => (
                          <span key={v} className="lcp-ball" data-ball="standard">
                            <span style={{ color: "var(--ball-fg)" }}>{v}</span>
                          </span>
                        ))}
                        {l.special !== null && m.specialLabel ? (
                          <span
                            className="lcp-ball"
                            data-ball={m.specialLabel.toLowerCase().includes("mega") ? "megaball" : "powerball"}
                            data-special="true"
                            style={{
                              color: `var(--ball-${m.specialLabel.toLowerCase().includes("mega") ? "megaball" : "powerball"}-bg)`,
                            }}
                          >
                            <span aria-label={`${m.specialLabel} ${l.special}`} style={{ color: "var(--ball-fg)" }}>
                              {l.special}
                            </span>
                          </span>
                        ) : null}
                      </span>
                      <span className="lcfg-line__shape lcfg-muted lcfg-fine">
                        {l.odd} odd · {l.even} even · {l.low} low · {l.high} high
                      </span>
                      <button type="button" className="lcfg-rowbtn" onClick={() => testLine(l)}>
                        Has this line ever come up?
                      </button>
                      {note ? (
                        <span className="lcfg-line__note lcfg-fine" data-note="date-range">
                          {note}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="lcfg-fine lcfg-muted">{result.note}</p>
            </>
          ) : failure === null && errors.length === 0 ? (
            <p className="lcfg-fine lcfg-muted">
              Choose how you want the lines built, then generate. Nothing is saved unless you ask for it.
            </p>
          ) : null}

          <p className="lcfg-boundary">{GENERATOR_BOUNDARY}</p>
        </div>

        <FlagshipLocked capabilities={generatorLocks} note={lockedNote} label="Keep and reuse these lines" />
      </div>
    </section>
  );
}
