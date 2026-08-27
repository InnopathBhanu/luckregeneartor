/*
 * AI Draw Analysis — compact featured-card block plus a LOCAL detail panel.
 *
 * Authority: LRG-UI-012 §4 (featured-card analysis), §5 (visible basis), §6 (panel content),
 * §7 (wording), §11 (separate from commerce), §12 (separate from official facts).
 *
 * FULLY LOCAL. Every figure is computed by lib/preview/drawAnalysis.ts at render time from draws
 * already in the repository. There is no external AI service, no API, no model call, no network
 * request. The panel is a native <details>, so it opens with no client JavaScript, is keyboard
 * operable, has a real close action, and its content stays server-rendered and crawlable.
 *
 * SEPARATION (§12): this renders AFTER the winning numbers, below a rule, with a visibly distinct
 * treatment. The numbers above remain official source-attributed data. Nothing here says "AI
 * verified", "AI confirmed" or "official AI analysis", and AI never replaces source verification.
 *
 * SEPARATION (§11): this block is never rendered inside the play-options panel, and no analysis
 * output influences eligibility, provider availability, purchase method or urgency.
 *
 * WORDING (§7): frequency is always "in this sample" — a historical observation about draws that
 * happened, never a statement about the next draw. No prediction, no likely/due/overdue number, no
 * strategy, no best numbers, and no repeated "AI does not predict" boilerplate.
 */

import type { DrawAnalysis, GameComparison } from "@/lib/preview/drawAnalysis";
import {
  AiMark,
  IconCompare,
  IconDrawAnalysis,
  IconFrequency,
  IconHistory,
  IconPattern,
  ObservationIcon,
} from "./AiIcon";

/* ------------------------------------------------------------------ pieces */

function Basis({ text }: { text: string }) {
  /* §5: the analysis basis is ALWAYS visible and states the draws actually used after
     deduplication and effective-date filtering — never the number of records read. */
  return <p className="lcp-an__basis">{text}</p>;
}

/**
 * What could not be computed, and what it needs. §4: missing metrics are never filled with invented
 * content. This is deliberately specific rather than a vague "not enough data".
 */
function Insufficient({ a, compact }: { a: DrawAnalysis; compact?: boolean }) {
  if (a.unavailable.length === 0) return null;
  if (compact) {
    return <p className="lcp-an__short">More historical draws are needed for this analysis.</p>;
  }
  return (
    <div className="lcp-an__gap">
      <p className="lcp-an__gap-title">More historical draws are needed for this analysis</p>
      <p className="lcp-an__short">
        This game has {a.sampleSize} draw{a.sampleSize === 1 ? "" : "s"} available here. These
        measures need more:
      </p>
      <ul className="lcp-an__gap-list">
        {a.unavailable.map((u) => (
          <li key={u.key}>
            {u.label} — needs at least {u.drawsNeeded} draws
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberChip({ value, marked }: { value: number; marked?: boolean }) {
  return (
    <span className="lcp-an__num" data-in-draw={marked ? "true" : undefined}>
      {value}
      {marked ? <span className="sr-only"> (in this draw)</span> : null}
    </span>
  );
}

/* --------------------------------------------------- compact card treatment */

/**
 * The compact block on an H-02A featured card.
 *
 * Two or three computed observations. None of them repeats the jackpot, the draw date or the numbers
 * — those are already visible directly above, and repeating them would be exactly the superficial
 * output §1 rejects.
 */
export function DrawAnalysisCard({
  analysis,
  panelId,
  debug,
}: {
  analysis: DrawAnalysis;
  panelId: string;
  /** §1: the missing-metric explanation is developer-facing and shows only in debug. */
  debug?: boolean;
}) {
  return (
    <section className="lcp-an" aria-labelledby={`${panelId}-h`} data-ai-area="draw-analysis">
      <p className="lcp-an__head" id={`${panelId}-h`}>
        <AiMark size={16} />
        <span>AI Draw Analysis</span>
      </p>

      <ul className="lcp-an__obs">
        {analysis.headlineObservations.map((o) => (
          <li key={o.key}>
            <span className="lcp-an__obs-icon">
              <ObservationIcon kind={o.icon} size={15} />
            </span>
            <span>{o.text}</span>
          </li>
        ))}
      </ul>

      <Basis text={analysis.basisText} />
      {debug && analysis.historyInsufficient ? <Insufficient a={analysis} compact /> : null}

      {/*
       * LRG-UI-014: the analysis action moved OUT of the card. Triggers and the expanded panel now
       * live in PreviewInlineAnalysis, a sibling of the featured grid, so analysis is inline rather
       * than a modal AND still cannot change a grid row's height. The card keeps only its compact
       * summary, which is what §"Keep" requires.
       */}
    </section>
  );
}

/* ------------------------------------------------------------- local panel */

/**
 * The detail panel (§6). A native <details> rather than a scripted modal: it needs no client
 * JavaScript, gives a real close action and keyboard contract for free, and keeps every figure in the
 * server-rendered HTML. On narrow viewports the CSS presents it as a bottom-anchored sheet.
 */
/**
 * The analysis body, rendered on the SERVER and handed to PreviewOverlay as children.
 *
 * LRG-UI-013 §3: this is no longer a <details> inside the card. Expanding it there grew the grid row
 * and stretched the sibling featured card. It now lives in a portalled dialog outside the grid, so
 * neither card can change height when it opens.
 */
export function DrawAnalysisContent({
  analysis: a,
  comparison,
  compareOnly,
  debug,
}: {
  analysis: DrawAnalysis;
  comparison?: GameComparison;
  /**
   * §1: the CONSOLIDATED missing-metric checklist is debug-only — it repeats what each block already
   * says inline and, as a big dashed list, made a launch-state overlay look unfinished.
   *
   * The per-block statements are NOT gated. "Frequency needs at least 10 draws in the sample" is an
   * honest data-availability answer to a blank section, not a development explanation, and removing it
   * would leave the reader wondering why the section is empty.
   */
  debug?: boolean;
  /**
   * Compare-only mode. The cross-game comparison sits ONCE under both featured cards; without this
   * it repeated each card's Summary, Frequency, Repeats and Composition blocks a third time, which
   * is noise rather than information.
   */
  compareOnly?: boolean;
}) {
  const c = a.composition;
  return (
      <div className="lcp-an__sheet">
        {compareOnly ? null : (
        <>
        {/* ---------------------------------------------------------- Summary */}
        <div className="lcp-an__block">
          <h4 className="lcp-an__block-title">
            <AiMark size={15} /> Summary
          </h4>
          <dl className="lcp-an__dl">
            <dt>Game</dt>
            <dd>{a.gameName}</dd>
            <dt>Draw</dt>
            <dd>{a.drawDateDisplay}</dd>
            <dt>Numbers analysed</dt>
            <dd>
              {a.range.mainCount} from {a.range.mainMin}–{a.range.mainMax}
              {a.range.specialLabel
                ? ` · ${a.range.specialLabel} from ${a.range.specialMin}–${a.range.specialMax}`
                : ""}
            </dd>
            <dt>Historical sample</dt>
            <dd>
              {a.sampleSize} draw{a.sampleSize === 1 ? "" : "s"}
            </dd>
            <dt>Source</dt>
            {/* Official-source attribution stays with the RESULT. This line says where the draws
                being analysed came from and how fresh they are — it does not re-verify the result. */}
            <dd>Official state lottery draw results, as published on this page</dd>
          </dl>
          <Basis text={a.basisText} />
        </div>

        {/* -------------------------------------------------------- Frequency */}
        <div className="lcp-an__block">
          <h4 className="lcp-an__block-title">
            <IconFrequency size={15} /> Frequency
          </h4>
          {a.frequency ? (
            <>
              <p className="lcp-an__short">More frequent in this sample</p>
              <p className="lcp-an__row">
                {a.frequency.more.map((f) => (
                  <NumberChip key={`m${f.value}`} value={f.value} marked={f.inCurrentDraw} />
                ))}
              </p>
              <p className="lcp-an__short">Less frequent in this sample</p>
              <p className="lcp-an__row">
                {a.frequency.less.map((f) => (
                  <NumberChip key={`l${f.value}`} value={f.value} marked={f.inCurrentDraw} />
                ))}
              </p>
              <p className="lcp-an__short">
                Numbers from this draw are outlined. Frequency describes what has already been drawn
                in this sample. Each draw is independent, so it does not change what comes next.
              </p>
            </>
          ) : (
            <p className="lcp-an__short">
              Frequency needs at least 10 draws in the sample. This game has {a.sampleSize}.
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------- Repeats */}
        <div className="lcp-an__block">
          <h4 className="lcp-an__block-title">
            <IconHistory size={15} /> Repeats and last seen
          </h4>
          <ul className="lcp-an__list">
            <li>
              {a.repeats.repeatedFromPrevious === null
                ? "A previous draw is needed to compare against."
                : a.repeats.repeatedFromPrevious.length === 0
                  ? "No numbers carried over from the previous draw."
                  : `Repeated from the previous draw: ${a.repeats.repeatedFromPrevious.join(", ")}.`}
            </li>
            <li>
              {a.repeats.seenInLastFive === null
                ? "The last five draws are not available in this sample."
                : `${a.repeats.seenInLastFive.length} of this draw's numbers appeared within the last five draws.`}
            </li>
            <li>
              {a.repeats.specialLastSeen
                ? `${a.range.specialLabel ?? "The special ball"} last appeared ${a.repeats.specialLastSeen.draw} draw${a.repeats.specialLastSeen.draw === 1 ? "" : "s"} earlier, on ${a.repeats.specialLastSeen.dateDisplay}.`
                : a.repeats.specialNeverSeenInSample
                  ? `${a.range.specialLabel ?? "The special ball"} does not appear elsewhere in this sample.`
                  : `Last-seen information for ${a.range.specialLabel ?? "the special ball"} needs more draws.`}
            </li>
          </ul>
        </div>

        {/* ------------------------------------------------------ Composition */}
        <div className="lcp-an__block">
          <h4 className="lcp-an__block-title">
            <IconPattern size={15} /> Draw composition
          </h4>
          <ul className="lcp-an__list">
            <li>
              {c.odd} odd and {c.even} even
            </li>
            <li>
              {c.high} in the upper half and {c.low} in the lower half of {a.range.mainMin}–
              {a.range.mainMax} (midpoint {c.midpoint})
            </li>
            <li>
              {c.consecutiveRuns.length === 0
                ? "No consecutive numbers"
                : `Consecutive: ${c.consecutiveRuns.map((r) => r.join("–")).join(", ")}`}
            </li>
            <li>
              Total {c.sum}, within a possible {c.minPossibleSum}–{c.maxPossibleSum}
            </li>
            <li>
              Span from lowest to highest: {c.span}
            </li>
          </ul>
        </div>

        {/* --------------------------------------------------------- Patterns */}
        <div className="lcp-an__block">
          <h4 className="lcp-an__block-title">
            <IconPattern size={15} /> Historical patterns
          </h4>
          {a.patterns.commonPairs.length > 0 ? (
            <>
              <p className="lcp-an__short">Pairs that occurred more than once in this sample</p>
              <ul className="lcp-an__list">
                {a.patterns.commonPairs.map((p) => (
                  <li key={p.pair.join("-")}>
                    {p.pair[0]} and {p.pair[1]} — {p.count} times
                    {p.inCurrentDraw ? " · both in this draw" : ""}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {a.patterns.commonTriplets.length > 0 ? (
            <ul className="lcp-an__list">
              {a.patterns.commonTriplets.map((t) => (
                <li key={t.triplet.join("-")}>
                  {t.triplet.join(", ")} — {t.count} times
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="lcp-an__list">
            <li>
              {/* Defined exactly: same odd/even split AND same high/low split. Not a resemblance,
                  and not a likelihood. */}
              {a.patterns.similarStructureCount !== null && a.sampleSize > 1
                ? `${a.patterns.similarStructureCount} earlier draws in this sample had the same odd/even and high/low split.`
                : "Comparing this draw's structure against earlier draws needs more history."}
            </li>
            <li>
              {/* An exact match is only ever claimed when every main number AND the special ball
                  genuinely match. Otherwise this says so plainly. */}
              {a.patterns.exactPriorMatch
                ? `An exact prior match was found: every number and ${a.range.specialLabel ?? "the special ball"} also appeared on ${a.patterns.exactPriorMatch.dateDisplay}.`
                : a.patterns.exactMatchSearched
                  ? "No exact prior match was found in the available archive."
                  : "An exact-match search needs more than one draw in the archive."}
            </li>
          </ul>
        </div>

        </>
        )}

        {/* ---------------------------------------------------------- Compare */}
        {comparison ? (
          <div className="lcp-an__block">
            <h4 className="lcp-an__block-title">
              <IconCompare size={15} /> Compare games
            </h4>
            <div className="lcp-scroll-x">
              <table className="lcp-an__table">
                <thead>
                  <tr>
                    <th scope="col">Game</th>
                    <th scope="col">Range</th>
                    <th scope="col">Odd / even</th>
                    <th scope="col">Total position</th>
                    <th scope="col">Repeat rate</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.games.map((g) => (
                    <tr key={g.gameSlug}>
                      <th scope="row">{g.gameName}</th>
                      <td>{g.rangeText}</td>
                      <td>{g.oddEvenText}</td>
                      <td>{g.normalisedSumPercent}% of its range</td>
                      <td>
                        {g.repeatRate === null
                          ? "needs more draws"
                          : `${Math.round(g.repeatRate * 100)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="lcp-an__short">{comparison.normalisationNote}</p>
          </div>
        ) : null}

        {debug && !compareOnly ? <Insufficient a={a} /> : null}

        {/* ------------------------------------------------------ Methodology */}
        <details className="lcp-an__method">
          <summary>How this analysis works</summary>
          <div>
            <p className="lcp-an__short">
              <strong>Window.</strong> The default sample is the latest 50 draws when at least 50 are
              available; otherwise the full available history is used and its size is shown. This game
              currently has {a.sampleSize}.
            </p>
            <p className="lcp-an__short">
              <strong>Source.</strong> Published official state lottery draw results, read from the
              same data this page displays. Repeated entries for the same drawing are collapsed before
              anything is counted.
            </p>
            <p className="lcp-an__short">
              <strong>Calculations.</strong> Odd/even and high/low splits use the game&apos;s own valid
              number range, so the midpoint is defined rather than assumed. Sums are reported against
              the smallest and largest totals the range allows. Frequency counts occurrences within
              the stated sample. Structure matching means an identical odd/even and high/low split. An
              exact match means every number and the special ball.
            </p>
            <p className="lcp-an__short">
              <strong>Rule changes.</strong> Draws from before a game&apos;s current number range are
              excluded rather than mixed in, and games with different ranges are never compared by raw
              totals.
            </p>
            <p className="lcp-an__short">
              <strong>Missing data.</strong> A measure that needs more draws than the sample holds is
              listed as unavailable with the number it needs. Nothing is estimated or filled in.
            </p>
          </div>
        </details>
      </div>
  );
}
