"use client";

/*
 * FG-09 — JACKPOT TRACKER, COUNTDOWN AND ALERTS. LRG-FLAGSHIP-003.
 *
 * Authority: BP-04A §23 (Jackpot History), §7 (the official ET countdown), §28 (jackpot threshold), the active
 * founder instruction (*"current jackpot · cash value if available · next draw countdown/date · jackpot
 * trend/history · jackpot threshold alert UI"*).
 *
 * ══ WHAT IS REAL HERE, AND WHAT IS NOT ══
 *
 * **Real.** The two advertised amounts and the next drawing date come from the production results feed. The
 * countdown is computed from that date and the game's published ET draw time — arithmetic over verified facts.
 * The threshold control is a working input whose value is compared against the real advertised figure, so a
 * reader can see exactly what they would be asking to be told about.
 *
 * **The run.** FGP-009 connected a series of advertised amounts through the BFF, so the roll count, the growth
 * per drawing and the comparison against completed runs are now COMPUTED — arithmetic over whatever series the
 * data layer holds, real or preview. Every figure is past tense and the section projects nothing: the operator
 * sets the next advertised amount from ticket sales, and a run's length says nothing about when it ends. With
 * fewer than two figures the section falls back to the two-point statement and its recorded gap.
 *
 * ══ THE COUNTDOWN NEVER RUNS OFF A CLOCK THE READER CONTROLS ══
 *
 * It is computed from the governed review date on the server and ticks forward in the browser from there, so the
 * rendered value is deterministic on first paint and the server and client cannot disagree at hydration.
 */

import { useEffect, useState } from "react";
import type { JackpotMovement } from "@/lib/flagship/flagshipInsights";
import type { FlagshipJackpotRun } from "@/lib/flagship/flagshipJackpotRun";
import { parseAdvertised } from "@/lib/flagship/flagshipInsights";
import type { EngagementOption } from "@/lib/flagship/flagshipEngagement";
import { askFlagshipAi } from "@/components/flagship/tools/FlagshipAiConsole";
import FlagshipAlerts from "@/components/flagship/tools/FlagshipAlerts";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

export default function FlagshipJackpotTracker({
  gameLabel,
  jackpot,
  run,
  nextDrawIso,
  drawTimeEt,
  cashValueGapWhy,
  options,
  gameSlug,
  returnTo,
  lockedNote,
}: {
  gameLabel: string;
  jackpot: JackpotMovement;
  /** The current run of advertised figures. `null` when fewer than two are held. */
  run: FlagshipJackpotRun | null;
  /** The next drawing's date, from the feed. `null` when none is published. */
  nextDrawIso: string | null;
  drawTimeEt: string;
  cashValueGapWhy: string;
  /** Every engagement option. The threshold drives the slider; the rest render as FG-14 below it. */
  options: readonly EngagementOption[];
  gameSlug: string;
  returnTo: string;
  lockedNote: string;
}) {
  /*
   * FG-14 IS MERGED IN HERE — the founder's revision titles this section "Jackpot Tracker and Alerts" and lists
   * the draw reminder, the weekly digest and Follow game under it. Alerts had its own box four sections lower,
   * which is exactly the stacking the revision is removing. The governed id survives on the panel below.
   */
  const thresholdOption = options.find((o) => o.key === "jackpot-threshold")!;
  const advertised = parseAdvertised(jackpot.nextDisplay) ?? 0;
  /* A round figure just above the advertised amount, so the control opens on something meaningful. */
  const [threshold, setThreshold] = useState(() => Math.ceil(advertised / 100_000_000) * 100_000_000 || 100_000_000);
  const [asked, setAsked] = useState(false);

  /*
   * Elapsed time is measured in the BROWSER only, and only after mount, so the server-rendered HTML carries no
   * clock reading at all. `mounted` gates the live portion; before it, the section shows the date and time,
   * which is the part that is a published fact.
   */
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const target = nextDrawIso ? Date.parse(`${nextDrawIso}T23:00:00-04:00`) : null;
  const remaining = target !== null && now !== null ? target - now : null;

  const crosses = advertised >= threshold;

  return (
    <section className="lcfg-section" data-section-id="FG-09" {...sectionAuditAttributes("flagship", "FG-09")} id="jackpot-history" aria-labelledby="lcfg-h2-jackpot">
      <h2 className="lcfg-h2" id="lcfg-h2-jackpot">
        The {gameLabel} jackpot
      </h2>

      <div className="lcfg-jackpotgrid">
        <div className="lcfg-jackpotmove" data-jackpot-move="true">
          <div className="lcfg-jackpotmove__point">
            <span className="lcfg-jackpotmove__label">{jackpot.currentDrawDisplay}</span>
            <strong className="lcfg-jackpotmove__value">{jackpot.currentDisplay}</strong>
          </div>
          <div className="lcfg-jackpotmove__arrow" aria-hidden="true">
            →
          </div>
          <div className="lcfg-jackpotmove__point">
            <span className="lcfg-jackpotmove__label">{jackpot.nextDrawDisplay}</span>
            <strong className="lcfg-jackpotmove__value">{jackpot.nextDisplay}</strong>
          </div>
          {jackpot.changeDisplay ? (
            <div className="lcfg-jackpotmove__delta" data-delta={jackpot.changeDisplay}>
              {jackpot.changeDisplay}
            </div>
          ) : null}
        </div>

        <div className="lcfg-countdown" data-countdown={nextDrawIso ?? "none"}>
          <span className="lcfg-jackpotmove__label">Next drawing</span>
          <strong className="lcfg-countdown__value">
            {jackpot.nextDrawDisplay} · {drawTimeEt}
          </strong>
          {/* `suppressHydrationWarning` is unnecessary because the live value only appears after mount. */}
          <span className="lcfg-countdown__remaining" role="status" aria-live="off">
            {remaining === null
              ? "Times are Eastern Time."
              : remaining > 0
                ? `About ${formatRemaining(remaining)} from now, Eastern Time.`
                : "This drawing time has passed — the result will appear once it is verified."}
          </span>
        </div>
      </div>

      <div className="lcfg-panel">
        <h3 className="lcfg-h3">Tell me when it gets big</h3>
        <div className="lcfg-fieldrow">
          <div className="lcfg-field lcfg-field--wide">
            <label htmlFor="lcfg-threshold">
              Alert me when the advertised {gameLabel} jackpot reaches
            </label>
            <input
              id="lcfg-threshold"
              type="range"
              min={100_000_000}
              max={2_000_000_000}
              step={50_000_000}
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value));
                setAsked(false);
              }}
              aria-describedby="lcfg-threshold-value"
            />
            <output id="lcfg-threshold-value" className="lcfg-threshold__value">
              ${threshold.toLocaleString("en-US")}
            </output>
          </div>
        </div>

        <p className="lcfg-fine" role="status" aria-live="polite">
          {crosses
            ? `The jackpot advertised for ${jackpot.nextDrawDisplay} is ${jackpot.nextDisplay}, which is already at or above that figure.`
            : `The jackpot advertised for ${jackpot.nextDrawDisplay} is ${jackpot.nextDisplay}, below that figure.`}
        </p>

        <div className="lcfg-actions">
          <button
            type="button"
            className="lcfg-lockchip lcfg-lockchip--wide"
            data-capability={thresholdOption.key}
            data-gate={thresholdOption.gate}
            aria-expanded={asked}
            aria-controls="lcfg-threshold-note"
            onClick={() => setAsked(true)}
          >
            <span className="lcfg-lockchip__icon" aria-hidden="true">
              🔒
            </span>
            <span className="lcfg-lockchip__label">Alert me at ${threshold.toLocaleString("en-US")}</span>
            <span className="lcs-vh">Needs a free account. {thresholdOption.frequencyNote}</span>
          </button>
        </div>

        <div className="lcfg-lockednote" id="lcfg-threshold-note" role="status" aria-live="polite" data-activated={asked}>
          {asked ? (
            <>
              <p className="lcfg-lockednote__head">
                “{thresholdOption.label}” needs a free LotteryCorner account
              </p>
              <p className="lcfg-fine">{thresholdOption.benefit}</p>
              <p className="lcfg-fine lcfg-muted">{lockedNote}</p>
            </>
          ) : (
            <p className="lcfg-fine lcfg-muted">
              Move the slider to the figure you care about. Nothing is turned on and nothing is stored.
            </p>
          )}
        </div>
      </div>

      <p className="lcfg-fine">
        Both amounts come from the production results feed. {cashValueGapWhy}
      </p>

      {/*
        THE RUN — FGP-009.

        The gap note that stood here said the roll count and growth needed a series of advertised amounts. The
        data layer now supplies one, so the figures are computed and shown. Everything is past tense: how far the
        jackpot has already climbed and over how many drawings. There is no projection, because the next
        advertised figure is set by the operator from ticket sales and a run's length says nothing about when it
        ends.
      */}
      {run ? (
        <div className="lcfg-run" data-jackpot-run={run.drawings}>
          <h3 className="lcfg-h3">This run</h3>
          <dl className="lcfg-runfacts">
            <div>
              <dt>Drawings without a top-prize winner</dt>
              <dd>{run.drawings}</dd>
            </div>
            <div>
              <dt>Started at</dt>
              <dd>
                {run.startDisplay} <span className="lcfg-muted">on {run.startIso}</span>
              </dd>
            </div>
            {run.growthPerDrawDisplay ? (
              <div>
                <dt>Average rise per drawing</dt>
                <dd>{run.growthPerDrawDisplay}</dd>
              </div>
            ) : null}
            <div>
              <dt>Largest figure held</dt>
              <dd>
                {run.peakDisplay} <span className="lcfg-muted">on {run.peakIso}</span>
              </dd>
            </div>
            {run.medianRunLength !== null ? (
              <div>
                <dt>Typical completed run</dt>
                <dd>
                  {run.medianRunLength} drawings{" "}
                  <span className="lcfg-muted">across {run.completedRuns} held here</span>
                </dd>
              </div>
            ) : null}
          </dl>

          {/*
            The climb, as a bar per drawing. Deliberately not a canvas or an SVG path: bars are real DOM, each
            one carries its date and amount as text, and a screen reader gets the same figures a sighted reader
            does from the table-like list. `aria-hidden` on the bars themselves, because the list below them is
            the accessible reading.
          */}
          <ol className="lcfg-runchart" aria-hidden="true">
            {run.points.map((p) => (
              <li key={p.drawDateIso} className="lcfg-runchart__bar" style={{ height: `${Math.round(p.height * 100)}%` }}>
                <span className="lcs-vh">
                  {p.drawDateIso}: {p.advertisedDisplay}
                </span>
              </li>
            ))}
          </ol>
          <p className="lcfg-fine lcfg-muted">
            The advertised jackpot rose from {run.startDisplay} on {run.startIso} to {run.currentDisplay} over{" "}
            {run.drawings} drawings.
            {run.totalGrowthDisplay ? ` That is ${run.totalGrowthDisplay} across the run.` : ""}
          </p>
          <p className="lcfg-method" data-method="jackpot-run">
            {run.method}
          </p>
          <p className="lcfg-boundary">
            A long run does not make a win more likely. Every drawing is independent, and the chance of matching
            everything is the same at every jackpot size.
          </p>
        </div>
      ) : (
        <div className="lcfg-gapnote" data-gap="jackpot-history">
          <p className="lcfg-gapnote__head">There is no roll count or growth history yet</p>
          <p className="lcfg-fine">
            How many drawings the jackpot has rolled, how fast it has grown and how this run compares with past
            ones all need the series of advertised amounts. This build holds two figures, so it shows two figures.
            Nothing is extrapolated between them.
          </p>
        </div>
      )}

      <p className="lcfg-actions">
        <a
          className="lcfg-chip lcfg-chip--ask"
          href="#ask-ai"
          onClick={() => askFlagshipAi({ key: "explain-jackpot-movement" })}
        >
          Explain cash against annuity
        </a>
        {/*
          LRG-TOOLS-001 — the BP-05C §7 context transfer into the standalone Tax Calculator (Conflict 42
          interim route). `?game=` prefills the advertised jackpot there; the canonical stays the bare tool
          URL. A plain link, not a CTA block: estimating taxes is a reader task, never promotion.
        */}
        <a className="lcfg-chip" href={`/tools/tax-calculator?game=${gameSlug}`} data-tool-ramp="tax-calculator">
          Estimate taxes on this jackpot
        </a>
      </p>

      {/* FG-14, merged. Draw reminder, result alert, saved-number alert, weekly digest, follow game and tag. */}
      <div className="lcfg-subsection" data-section-id="FG-14" {...sectionAuditAttributes("flagship", "FG-14")} id="alerts">
        <h3 className="lcfg-h3">Follow {gameLabel}</h3>
        <FlagshipAlerts
          options={options.filter((o) => o.key !== "jackpot-threshold")}
          note={lockedNote}
          gameSlug={gameSlug}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}

/** `2 days, 6 hours` — never seconds, because a minute-resolution tick would make the last unit lie. */
function formatRemaining(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} and ${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} and ${minutes} minutes`;
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}
