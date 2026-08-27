/*
 * FG-05 (How to play, prizes and odds) and FG-06 (jurisdiction differences). LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §19, §20, BP-05C §19 (a statistical result states its method), the frozen Constitution
 * (classify every claim; language must not assert certainty or imply that anything changes the odds).
 *
 * ══ THE ODDS TABLE IS COUNTED, AND SAYS SO ══
 *
 * Every row comes from `oddsTable`, which counts combinations over the verified number matrix. The method is
 * rendered under the table, and it is generated from the same matrix, so it can never describe a different game
 * than the numbers above it.
 *
 * ══ THE PRIZE COLUMN IS ABSENT, NOT EMPTY ══
 *
 * The operator prize matrix is not captured in this build. There is no prize column, no blank cells and no
 * "TBC" — the gap is stated once, in words, with the official source named. A prize amount is the single most
 * consequential thing a lottery page can get wrong, and a plausible-looking blank column invites someone to fill
 * it in from memory later.
 */

import type { FlagshipPageModel } from "@/lib/flagship/flagshipPageModel";
import { isGap } from "@/lib/flagship/flagshipGames";
import { FLAGSHIP_ANCHORS } from "@/lib/flagship/flagshipContract";
import { aiSurfacesFor } from "@/lib/flagship/flagshipAi";
import { FlagshipAskChip } from "@/components/flagship/tools/FlagshipAiConsole";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

export function FlagshipHowToPlay({ model }: { model: FlagshipPageModel }) {
  const { config, odds } = model;
  const main = config.groups.find((g) => g.role === "main");
  const special = config.groups.find((g) => g.role === "special");
  const chips = aiSurfacesFor(model.ai, "FG-05");
  /* The rows a reader actually asks about lead; the full twelve sit behind a disclosure. */
  const headline = odds.rows.filter((r) => r.specialMatched === true || r.mainMatched >= 3).slice(0, 6);

  /*
   * THE PRIZE COLUMN — FGP-009.
   *
   * The section shipped without one because no prize matrix was captured, and a blank column invites someone to
   * fill it in from memory. A prize table now arrives through the BFF, so the column renders — and every amount
   * in it is labelled with where it came from, because a prize figure is the single most consequential thing a
   * lottery page can state wrongly.
   *
   * `prizeFor` matches a tier to an odds row by the match itself rather than by position, so a table listing its
   * tiers in a different order cannot shift an amount onto the wrong row.
   */
  const prizes = odds.prizes;
  const prizeFor = (mainMatched: number, specialMatched: boolean | null) =>
    prizes?.find((t) => t.mainMatched === mainMatched && t.specialMatched === specialMatched) ?? null;
  const previewPrizes = (prizes ?? []).some((t) => t.source !== "productionFeed");

  return (
    <section
      className="lcfg-section lcfg-section--reference"
      data-section-id="FG-05" {...sectionAuditAttributes("flagship", "FG-05")}
      id={FLAGSHIP_ANCHORS.prizesAndOdds}
      aria-labelledby="lcfg-h2-rules"
    >
      <h2 className="lcfg-h2" id="lcfg-h2-rules">
        Prizes, odds and rules
      </h2>

      <div className="lcfg-refgrid">
        <dl className="lcfg-facts">
          {main ? (
            <div className="lcfg-fact">
              <dt>Your numbers</dt>
              <dd>
                {main.count} from {main.min}–{main.max}
                {special ? `, plus one ${special.label} from ${special.min}–${special.max}` : ""}
              </dd>
            </div>
          ) : null}
          <div className="lcfg-fact">
            <dt>Drawings</dt>
            <dd>
              {config.drawDays.value}, {config.drawTimeEt.value} · sales close {config.salesCutoffEt.value}
            </dd>
          </div>
          <div className="lcfg-fact">
            <dt>Ticket</dt>
            <dd>
              {isGap(config.ticketPrice) ? (
                <span className="lcfg-gap" data-gap="ticket-price">
                  Not shown — {config.ticketPrice.why}
                </span>
              ) : (
                config.ticketPrice.value
              )}
            </dd>
          </div>
          <div className="lcfg-fact">
            <dt>{config.multiplier.mode === "none" ? "Multiplier" : config.multiplier.label}</dt>
            <dd>
              {config.multiplier.mode === "none"
                ? "This game has none."
                : `${config.multiplier.values.join("X, ")}X — ${
                    config.multiplier.mode === "independentlySelected"
                      ? "bought separately and added to the ticket, so it applies only if you have it"
                      : "assigned to every play automatically, and printed on the ticket"
                  }`}
            </dd>
          </div>
          {config.secondaryDraw ? (
            <div className="lcfg-fact">
              <dt>{config.secondaryDraw.label}</dt>
              <dd>A separate drawing on the same ticket, with its own numbers and its own {config.specialLabel}.</dd>
            </div>
          ) : null}
        </dl>

        <div className="lcfg-oddsblock">
          <p className="lcfg-oddshead">
            Matching everything: <strong className="lcfg-oddshead__value">{odds.jackpotRow.display}</strong>
          </p>
          <div className="lcfg-tablewrap">
            <table className="lcfg-table" data-table="odds">
              <caption>The matches readers ask about most, counted from the published number matrix</caption>
              <thead>
                <tr>
                  <th scope="col">Match</th>
                  <th scope="col">Chance</th>
                  {prizes ? <th scope="col">Prize</th> : null}
                </tr>
              </thead>
              <tbody>
                {headline.map((r) => {
                  const tier = prizeFor(r.mainMatched, r.specialMatched);
                  return (
                    <tr key={`${r.mainMatched}-${r.specialMatched}`} data-jackpot-row={r.isJackpot || undefined}>
                      <th scope="row">{r.label}</th>
                      <td>{r.display}</td>
                      {prizes ? (
                        <td data-prize-source={tier?.source ?? "none"}>
                          {tier ? (
                            <>
                              {tier.prizeDisplay ?? (r.isJackpot ? "The jackpot" : "—")}
                              {tier.multiplierApplies && config.multiplier.mode !== "none" ? (
                                <span className="lcfg-fine lcfg-muted"> · {config.multiplier.label} applies</span>
                              ) : null}
                            </>
                          ) : (
                            "No prize"
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <details className="lcfg-disclosure" data-disclosure="all-odds">
            <summary>Every possible match ({odds.rows.length})</summary>
            <div className="lcfg-tablewrap">
              <table className="lcfg-table" data-table="odds-full">
                <caption>Every {config.gameLabel} outcome and its chance</caption>
                <thead>
                  <tr>
                    <th scope="col">Match</th>
                    <th scope="col">Chance</th>
                    {prizes ? <th scope="col">Prize</th> : null}
                    <th scope="col">Tickets that match</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.rows.map((r) => {
                    const tier = prizeFor(r.mainMatched, r.specialMatched);
                    return (
                      <tr key={`${r.mainMatched}-${r.specialMatched}`} data-jackpot-row={r.isJackpot || undefined}>
                        <th scope="row">{r.label}</th>
                        <td>{r.display}</td>
                        {prizes ? (
                          <td data-prize-source={tier?.source ?? "none"}>
                            {tier ? tier.prizeDisplay ?? (r.isJackpot ? "The jackpot" : "—") : "No prize"}
                          </td>
                        ) : null}
                        <td>{r.ways.toLocaleString("en-US")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="lcfg-method" data-method="odds">
              {odds.method}
            </p>
          </details>

          {prizes ? (
            <div className="lcfg-gapnote" data-gap="prize-matrix" data-prize-preview={previewPrizes}>
              <p className="lcfg-gapnote__head">
                {previewPrizes ? "These prize amounts are preview data" : "About these prize amounts"}
              </p>
              <p className="lcfg-fine">
                {previewPrizes
                  ? "They are sample figures used for layout testing, not the operator's published prize " +
                    "table, and no ticket is worth them. The operator's own published rules are the authority on " +
                    "what any match pays."
                  : "Published by the game operator. The operator's own rules are the authority on what any match " +
                    "pays."}
              </p>
              <p className="lcfg-fine lcfg-muted">
                {odds.prizeGap.why} Prizes are also pari-mutuel in some jurisdictions, so a published amount can
                differ from what a ticket actually pays there.
              </p>
            </div>
          ) : (
            <div className="lcfg-gapnote" data-gap="prize-matrix">
              <p className="lcfg-gapnote__head">Prize amounts are not shown here</p>
              <p className="lcfg-fine">{odds.prizeGap.why}</p>
              <p className="lcfg-fine lcfg-muted">
                No overall &ldquo;chance of winning any prize&rdquo; figure appears either: it is a total over the
                operator&rsquo;s paying tiers, and adding up a tier list we do not hold would be inventing one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FG-06, merged: the jurisdiction differences that change what a ticket is worth or how it is claimed. */}
      <details className="lcfg-disclosure" data-section-id="FG-06" {...sectionAuditAttributes("flagship", "FG-06")} id={FLAGSHIP_ANCHORS.jurisdictions}>
        <summary>Where {config.gameLabel} differs by jurisdiction ({config.jurisdictionNotes.length})</summary>
        <ul className="lcfg-notelist">
          {config.jurisdictionNotes.map((n) => (
            <li key={n.key} className="lcfg-note" data-note={n.key}>
              <h3 className="lcfg-h4">{n.heading}</h3>
              {isGap(n.body) ? (
                <p className="lcfg-gap" data-gap={n.key}>
                  Not shown — {n.body.why}
                </p>
              ) : (
                <p className="lcfg-fine">{n.body.value}</p>
              )}
            </li>
          ))}
        </ul>
      </details>

      <h3 className="lcfg-h3">Rule changes</h3>
      <ul className="lcfg-eralist">
        {config.ruleEras.map((era) => (
          <li key={era.eraId} data-era={era.eraId}>
            <strong>{era.label}</strong>
            <span className="lcfg-fine lcfg-muted">
              {" "}
              {era.effectiveFrom && era.effectiveTo
                ? `${era.effectiveFrom} to ${era.effectiveTo}`
                : era.effectiveFrom
                  ? `from ${era.effectiveFrom}`
                  : era.effectiveTo
                    ? `up to ${era.effectiveTo}`
                    : ""}
            </span>
            <p className="lcfg-fine">{era.summary.value}</p>
          </li>
        ))}
      </ul>

      <p className="lcfg-fine lcfg-muted">
        The operator&rsquo;s published rules are the authority on all of this. Where a figure is not captured
        here, it says so rather than showing a number.
      </p>

      {chips.length > 0 ? (
        <p className="lcfg-actions">
          {chips.map((c) => (
            <FlagshipAskChip key={c.key} surfaceKey={c.key} label={c.label} anchor={`#${FLAGSHIP_ANCHORS.askAi}`} />
          ))}
        </p>
      ) : null}
    </section>
  );
}
