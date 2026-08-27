/*
 * THE JG-M2 COMPOSITION — ALL EIGHTEEN SECTIONS, NINE BANDS. LRG-GAME-050.
 *
 * Authority: BP-04B §18 (the approved order), the 2026-08-04 brief §7 (per-section content) and §8 (bands),
 * founder decisions 1–8 of 2026-08-04.
 *
 * ══ WHY BANDS AND NOT EIGHTEEN CARDS ══
 *
 * The brief is explicit: *"Do not show eighteen equal navigation pills or eighteen equal cards."* Eighteen
 * sections is the governed content inventory; nine bands is the reading hierarchy. Each band is one region
 * with an accessible name, and its sections are `<section>` elements inside it. So the section taxonomy is
 * preserved exactly — ids, headings, anchors — while the page reads as nine steps rather than eighteen peers.
 *
 * ══ ONE SOURCE LINE, ONE BANNER, ONE BOUNDARY ══
 *
 * Founder direction forbids repeating "check the official site". So:
 *   - the compact source/freshness line appears ONCE, in JG-01, from `m2.sourceLine`;
 *   - the internal-preview identification appears ONCE, in the page shell, not per section;
 *   - the ticket-validation boundary appears ONCE, after the checker output, inside `GameChecker`;
 *   - the complete source, methodology, corrections, independence and Responsible Play explanation lives in
 *     JG-18 and nowhere else.
 *
 * Search this file for the operator's URL and you will find it in exactly one section.
 *
 * ══ NOTHING HERE BRANCHES ON A GAME ══
 *
 * Pick 3, Jackpot Triple Play and Cash Pop render through this one file. Their differences — two rows versus
 * one versus five, a published prize matrix versus a suppressed one, a drawn add-on versus none — are all
 * data. There is no `if (pick-3)` anywhere in this component.
 */

import Link from "next/link";
import Image from "next/image";
import type { GamePreviewModel } from "@/lib/game/gamePreviewModel";
import type { GameM2Model } from "@/lib/game/gameM2Model";
import { JG_M2_BANDS } from "@/lib/game/gameM2Model";
import { articleDateLine } from "@/lib/game/gameEditorial";
import { gameLogo } from "@/lib/preview/gameLogoRegistry";
import { gameCapability } from "@/lib/game/gameViewConfig";
import { StateBallGroup } from "@/components/state/preview/sections/StateResultGrammar";
import StateAiSurface from "@/components/state/preview/StateAiSurface";
import StateBuyNowInline from "@/components/state/preview/StateBuyNowInline";
import StateShareResult from "@/components/state/preview/StateShareResult";
import StateExplainAction from "@/components/state/preview/StateExplainAction";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";
import StateDiscussLink from "@/components/state/preview/StateDiscussLink";
import GameChecker from "@/components/game/preview/tools/GameChecker";
import GameGenerator from "@/components/game/preview/tools/GameGenerator";
import GameWorkspace from "@/components/game/preview/tools/GameWorkspace";
import GameSaveControls from "@/components/game/preview/tools/GameSaveControls";

/* ------------------------------------------------------------------ small pieces */

/** Section heading id, derived once so headings and `aria-labelledby` cannot drift. */
const hid = (id: string) => `${id.toLowerCase()}-h`;
const anchor = (id: string) => id.toLowerCase();

function PayoutTable({
  rows, wagers, caption,
}: {
  rows: GameM2Model["matrix"] extends null ? never : NonNullable<GameM2Model["matrix"]>["base"];
  wagers: NonNullable<GameM2Model["matrix"]>["wagers"];
  caption: string;
}) {
  /* Only wagers some row actually prices become columns, so a game with one wager gets one column. */
  const cols = wagers.filter((w) => rows.some((r) => w.amountCents in r.prizeByWagerCents));
  return (
    <div className="lcg-tablewrap">
      <table className="lcg-table lcg-table--payout">
        <caption className="lcs-vh">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Play type</th>
            <th scope="col">Example</th>
            {cols.map((w) => (
              <th scope="col" key={w.amountCents}>
                {w.label} play
              </th>
            ))}
            <th scope="col">Odds</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.playTypeKey}>
              <th scope="row">{r.label}</th>
              <td className="lcg-numcell">{r.examplePattern}</td>
              {cols.map((w) => {
                const prize = r.prizeByWagerCents[w.amountCents];
                const split = r.splitPrize?.[w.amountCents];
                const cost = r.ticketCostByWagerCents?.[w.amountCents];
                return (
                  <td key={w.amountCents}>
                    {/*
                      A Straight/Box play genuinely pays two different amounts, and the sentence form
                      ("$330.00 exact order, or $80.00 any other order") wrapped to seven lines at 390 px.
                      `splitPrize` already carries the two outcomes separately, so they render as two labelled
                      lines — shorter, scannable, and it stops the row dominating the table on mobile.
                    */}
                    {split ? (
                      <span className="lcg-split">
                        <span className="lcg-split__row">
                          <b>{split.exactOrder}</b> <span className="lcg-muted">exact order</span>
                        </span>
                        <span className="lcg-split__row">
                          <b>{split.anyOrder}</b> <span className="lcg-muted">any order</span>
                        </span>
                      </span>
                    ) : prize ? (
                      <>
                        {prize}
                        {cost ? <span className="lcg-muted lcg-fine"> · ticket {cost}</span> : null}
                      </>
                    ) : (
                      <span className="lcg-muted">not sold</span>
                    )}
                  </td>
                );
              })}
              <td>{r.oddsDisplay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ the composition */

export default function GameM2Bands({
  model, m2, discussionContext,
}: {
  model: GamePreviewModel;
  m2: GameM2Model;
  discussionContext: React.ComponentProps<typeof StateDiscussLink>["context"];
}) {
  const { config, stateName, gameLabel, timezoneLabel } = model;
  const copy = config.copy;

  /** The era's drawn add-on, e.g. FIREBALL. Derived from data, so a game without one shows no add-on anywhere. */
  const addOnLabel = m2.addOnsInForce[0]?.label ?? null;
  const memberOptions = m2.members.map((m) => ({ gameId: m.gameId, variantLabel: m.variantLabel }));
  const logo = gameLogo(config.game.visualIdentity ?? undefined);
  /** The published guides, reused by JG-06 so it links real articles rather than naming unwritten ones. */
  const guideArticles = m2.editorial.find((s) => s.kind === "Guides")?.items ?? [];
  const visible = (id: string) =>
    model.sectionState[id as keyof typeof model.sectionState]?.render !== false;

  /* ---------------------------------------------------------------- sections */

  const section = (id: string): React.ReactNode => {
    if (!visible(id)) return null;

    switch (id) {
      /* ══════════════════════════════════════════════════ JG-01 */
      case "JG-01":
        return (
          <section
            className="lcg-section lcg-hero"
            id={anchor(id)}
            data-section-id={id} {...sectionAuditAttributes("game", id)}
            aria-labelledby={hid(id)}
            key={id}
          >
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg01Heading}
            </h3>

            {/*
              ONE IDENTITY, INDEPENDENT ROWS.
              Each row is the member game's OWN record — its own id, date, values, add-on and time. Rows render
              in configured order, never re-sorted by recency, so Midday is always found in the same place. A
              row whose sibling drew more recently keeps its own older date, which is correct rather than stale.
            */}
            <ol className="lcg-memberrows" data-member-count={m2.members.length}>
              {m2.members.map((mem) => {
                const sched = m2.schedules.find((s) => s.gameId === mem.gameId);
                return (
                  <li className="lcg-memberrow" key={mem.gameId} data-game-id={mem.gameId}>
                    <div className="lcg-memberrow__head">
                      <span className="lcg-variant">{mem.variantLabel || "Main drawing"}</span>
                      {mem.result ? (
                        <span className="lcg-memberrow__when">
                          {mem.result.drawDateDisplay}
                          {mem.drawTimeLocal ? <span className="lcg-muted"> · {mem.drawTimeLocal}</span> : null}
                        </span>
                      ) : null}
                    </div>

                    {mem.result ? (
                      <div
                        className="lcg-result"
                        role="group"
                        aria-label={`${gameLabel} ${mem.variantLabel || "main"} drawing, ${mem.result.drawDateDisplay}`}
                      >
                        <span className="lcs-vh">
                          {gameLabel} {mem.variantLabel || "main"} drawing, {mem.result.drawDateDisplay}
                        </span>
                        {mem.result.groups.map((g) => (
                          <StateBallGroup key={g.label ?? "main"} group={g} gameName={gameLabel} />
                        ))}
                      </div>
                    ) : (
                      <p className="lcg-fine lcg-muted">No published result for this drawing yet.</p>
                    )}

                    <p className="lcg-memberrow__meta">
                      <span className="lcg-tag">{mem.result?.status ?? "awaiting"}</span>
                      {sched?.nextDrawDisplay ? (
                        <span className="lcg-muted"> · Next drawing {sched.nextDrawDisplay}</span>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ol>

            {/* THE ONE compact source/freshness line on this page. */}
            <p className="lcg-source" data-source-line="true">
              {m2.sourceLine}
            </p>

            <div className="lcg-actions" data-action-row="primary">
              <a className="lcg-btn lcg-btn--primary" href="#jg-03">
                Check these numbers
              </a>
              <StateExplainAction
                promptKey="explain-result"
                label={`Explain this ${gameLabel} result`}
                familyId={config.game.gameSlug}
              />
              <a className="lcg-btn" href="#jg-07">
                View result history
              </a>
              <StateShareResult
                stateName={stateName}
                gameLabel={gameLabel}
                fragment={anchor("JG-01")}
                resultDateDisplay={m2.members[0]?.result?.drawDateDisplay ?? null}
              />
            </div>

            <p className="lcg-actions">
              <Link className="lcg-chip" href={`/${config.game.stateCode}`}>
                All {stateName} results
              </Link>
            </p>
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-02 */
      case "JG-02":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg02Heading}
            </h3>
            <p className="lcg-fine">{copy.jg02Body}</p>

            <dl className="lcg-facts">
              {m2.schedules.map((s) => (
                <div className="lcg-fact" key={s.gameId}>
                  <dt>Next {s.variantLabel || "drawing"}</dt>
                  <dd>
                    {s.nextDrawDisplay ?? "Not scheduled in the captured data"}
                    {s.drawTimeLocal ? <span className="lcg-muted"> · {s.drawTimeLocal}</span> : null}
                  </dd>
                </div>
              ))}
              {m2.era?.ticketPrice ? (
                <div className="lcg-fact">
                  <dt>Ticket price</dt>
                  <dd>{m2.era.ticketPrice}</dd>
                </div>
              ) : null}
              {m2.era?.advancePlay ? (
                <div className="lcg-fact">
                  <dt>Advance Play</dt>
                  <dd>{m2.era.advancePlay}</dd>
                </div>
              ) : null}
            </dl>

            {/*
              The existing first-party resolver, unchanged. Florida is `underReview`, so it renders retail and
              play guidance rather than a Buy button — the brief forbids drawing a disabled Buy control. The
              material commerce disclosure lives inside this component, adjacent to the action, and nowhere
              else on the page.

              Gated on `m2.buyNowUsable` (LRG-GAME-053). The `hasBuyNowEntry` capability was consulted on the
              JG-M1 path only, so a JG-M2 game with commerce switched off still rendered this. JG-02 is a
              mandatory section and keeps its heading, schedule facts and price either way — only the commerce
              entry is withheld.
            */}
            {m2.buyNowUsable ? (
              <StateBuyNowInline
                stateName={stateName}
                officialWhereToPlayUrl={null}
                operatorName={model.operatorName.value ?? "the official operator"}
                todayIso={m2.reviewDateIso}
                /* The page IS the game, so the resolver opens already knowing it. */
                initialGameLabel={gameLabel}
                commerce={model.commerce}
              />
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-03 */
      case "JG-03":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg03Heading}
            </h3>
            <p className="lcg-fine">{copy.jg03Intro}</p>
            {/* The tool renders only when it can price a comparison. Otherwise the section keeps its heading
                and the configured explanation, and no dead control is drawn (FD-S-08). */}
            {m2.era && m2.profile && m2.checkerUsable ? (
              <GameChecker
                profile={m2.profile}
                era={m2.era}
                gameKey={config.game.ruleGameKey ?? config.game.gameSlug}
                members={memberOptions}
                history={m2.history}
                defaultDateIso={m2.members[0]?.result?.drawDateIso ?? m2.reviewDateIso}
                addOnLabel={addOnLabel}
                explainAnchor="#jg-04"
              />
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-04 */
      case "JG-04":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg04Heading}
            </h3>
            <p className="lcg-fine">{copy.jg04Intro}</p>
            <ul className="lcg-promptlist">
              {(config.aiPrompts ?? []).map((p) => (
                <li key={p}>
                  <span className="lcg-chip lcg-chip--prompt">{p}</span>
                </li>
              ))}
            </ul>
            {/* The same AI surface the State page renders, reused unmodified. Nothing is connected, and no
                answer is fabricated. */}
            <StateAiSurface
              stateName={stateName}
              operatorName={model.operatorName.value ?? "the state lottery"}
              resultSource="LotteryCorner production results feed"
              lastUpdated={model.freshness.lastUpdatedIso}
              timezoneLabel={timezoneLabel}
              howToClaimUrl={model.operatorHowToClaimUrl.value ?? null}
              addOnLabel={addOnLabel}
              families={m2.family ? [m2.family] : []}
              purchaseReaderNote={
                model.commerce.kind === "researched"
                  ? model.commerce.capability.readerNote
                  : model.commerce.kind === "unknown"
                    ? model.commerce.readerNote
                    : null
              }
              daysOld={model.freshness.daysOld}
            />
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-05 */
      case "JG-05":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg05Heading}
            </h3>
            <p className="lcg-fine">{copy.jg05Intro}</p>
            <div className="lcg-tablewrap">
              <table className="lcg-table">
                <caption className="lcs-vh">{copy.jg05Heading}</caption>
                <thead>
                  <tr>
                    <th scope="col">Drawing</th>
                    <th scope="col">Latest status</th>
                    <th scope="col">Next drawing</th>
                    <th scope="col">Reminder</th>
                  </tr>
                </thead>
                <tbody>
                  {m2.schedules.map((s) => (
                    <tr key={s.gameId} data-game-id={s.gameId}>
                      <th scope="row">{s.variantLabel || "Main drawing"}</th>
                      <td>
                        <span className="lcg-tag">{s.status}</span>
                      </td>
                      <td>
                        {s.nextDrawDisplay ?? <span className="lcg-muted">Not scheduled in the captured data</span>}
                        {s.drawTimeLocal ? <span className="lcg-muted"> · {s.drawTimeLocal}</span> : null}
                      </td>
                      <td>
                        <a className="lcg-chip" href="#jg-17">
                          Set a reminder
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-06 */
      case "JG-06":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg06Heading}
            </h3>
            <p className="lcg-fine">{copy.jg06Intro}</p>

            {/* Format-derived shape, shown whenever a rule era's play types are unavailable. A game can always
                say how many values it draws from what range, even with no verified prize table. */}
            {!m2.era && m2.formatSummary ? <p className="lcg-fine">{m2.formatSummary}</p> : null}

            {m2.era ? (
              <dl className="lcg-playtypes">
                {m2.era.playTypes.map((p) => (
                  <div className="lcg-playtype" key={p.key}>
                    <dt>{p.label}</dt>
                    <dd>
                      {p.definition} <span className="lcg-muted">Example {p.examplePattern}.</span>
                    </dd>
                  </div>
                ))}
                {m2.addOnsInForce.map((a) => (
                  <div className="lcg-playtype" key={a.key}>
                    <dt>{a.label}</dt>
                    <dd>
                      {a.definition} <span className="lcg-muted">{a.priceEffect}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <h4 className="lcg-h3" id="jg-06-payouts">
              {copy.jg06PayoutsHeading}
            </h4>

            {/*
              FOUNDER DECISION 6 IN THE MARKUP.
              A verified, complete, current matrix renders in full. An era-unknown or partial one renders
              nothing and says why — it is never approximated, and never shown as an empty grid. Jackpot Triple
              Play and Cash Pop take the second branch, which is how the template proves it degrades honestly.
            */}
            {m2.matrix && m2.matrix.base.length > 0 ? (
              <>
                <PayoutTable
                  rows={m2.matrix.base}
                  wagers={m2.matrix.wagers}
                  caption={`${gameLabel} base game prizes and odds`}
                />
                {m2.matrix.addOns.map((a) => (
                  <div key={a.key}>
                    <h4 className="lcg-h4">
                      {gameLabel} with {a.label}
                    </h4>
                    <PayoutTable
                      rows={a.payouts}
                      wagers={m2.matrix!.wagers}
                      caption={`${gameLabel} with ${a.label}: prizes and odds`}
                    />
                    <p className="lcg-fine lcg-muted">
                      {a.label} prizes are separate from the base prize and can be won with or without one.
                      Offered since {a.effectiveFrom}.
                    </p>
                  </div>
                ))}
                {m2.era ? (
                  <p className="lcg-fine lcg-muted">
                    Prizes and odds as published by {model.operatorName.value ?? "the state lottery"} in the
                    current game rules, in force since {m2.era.effectiveFrom}.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="lcg-fine">
                A complete prize table for this game has not been verified against the operator&rsquo;s current
                published rules, so no prize amounts are shown here.
              </p>
            )}

            {/*
              Real guides, linked. The previous revision listed `config.guides` — titles with "· not yet
              published" after each — because no guide existed. Three now do, so this reads from the same
              editorial source JG-15 uses and links to the routes that resolve. `config.guides` is no longer
              consulted anywhere, and titles that promise nothing are gone from the page.
            */}
            {guideArticles.length > 0 ? (
              <>
                <h4 className="lcg-h4">Guides</h4>
                <ul className="lcg-guidelist">
                  {guideArticles.map((g) => (
                    <li key={g.slug}>
                      <Link href={g.href}>{g.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-07 + JG-08 + JG-09 */
      case "JG-07":
        /* One workspace renders all three, because they share one filter. JG-08 and JG-09 return null below so
           the band does not draw them twice. */
        /*
         * §C3 — ONE contextual Explain for the history band.
         *
         * JG-07 is result-bearing — it lists published drawings — and had no route into the page's shared answer
         * surface. One action for the whole workspace, not one per row: `FD-X-08` caps contextual AI at one per
         * panel, and the workspace renders JG-07, JG-08 and JG-09 together as a single panel sharing one filter.
         */
        return m2.profile ? (
          <div key={id} className="lcg-workspacewrap">
            <p className="lcg-actions" data-ai-area="contextual">
              <StateExplainAction
                promptKey="explain-result"
                label={`Explain how these ${gameLabel} results compare`}
                familyId={config.game.gameSlug}
              />
            </p>
          <GameWorkspace
            history={m2.history}
            members={memberOptions}
            profile={m2.profile}
            addOnLabel={addOnLabel}
            statsPreview={m2.statsPreview}
            headings={{
              history: copy.jg07Heading,
              historyIntro: copy.jg07Intro,
              numbers: copy.jg08Heading,
              numbersIntro: copy.jg08Intro,
              statistics: copy.jg09Heading,
              statisticsIntro: copy.jg09Intro,
            }}
          />
          </div>
        ) : null;
      case "JG-08":
      case "JG-09":
        return null;

      /* ══════════════════════════════════════════════════ JG-10 */
      case "JG-10":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg10Heading}
            </h3>
            <p className="lcg-fine">{copy.jg10Intro}</p>
            {m2.profile ? (
              <GameGenerator
                profile={m2.profile}
                era={m2.era}
                members={memberOptions}
                addOnLabel={addOnLabel}
                saveAnchor="#jg-17"
              />
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-11 */
      case "JG-11":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg11Heading}
            </h3>
            <p className="lcg-fine">{copy.jg11Intro}</p>
            <ul className="lcg-methodlist">
              {(config.methods ?? []).map((mth) => (
                <li className="lcg-method" key={mth.key}>
                  <h4 className="lcg-h4">{mth.title}</h4>
                  <p className="lcg-fine">{mth.summary}</p>
                  {/* Required by the contract: what the method does not guarantee. */}
                  <p className="lcg-fine lcg-muted">{mth.limitation}</p>
                </li>
              ))}
            </ul>
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-12 */
      case "JG-12":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg12Heading}
            </h3>
            <p className="lcg-fine">{copy.jg12Body}</p>
            <dl className="lcg-facts">
              {m2.offeringFacts.map((f) => (
                <div className="lcg-fact" key={f.key} data-fact-source={f.source}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-13 */
      case "JG-13":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg13Heading}
            </h3>
            <p className="lcg-fine">{copy.jg13Intro}</p>

            {/* Sourced facts only. An unverified field — Florida tax treatment, winner publicity — is ABSENT
                rather than rendered as a warning card, which the brief and FD-S-02 both require. */}
            {model.claimDeadline.publish && model.claimDeadline.value ? (
              <dl className="lcg-facts">
                <div className="lcg-fact">
                  <dt>Claim deadline</dt>
                  <dd>{model.claimDeadline.value}</dd>
                </div>
              </dl>
            ) : null}

            {model.claimTiers.length > 0 ? (
              <div className="lcg-tablewrap">
                <table className="lcg-table">
                  <caption className="lcs-vh">Where a {stateName} prize is claimed, by prize amount</caption>
                  <thead>
                    <tr>
                      <th scope="col">Prize amount</th>
                      <th scope="col">Where to claim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.claimTiers.map((t) => (
                      <tr key={t.range}>
                        <th scope="row">{t.range}</th>
                        <td>{t.where}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {model.operatorHowToClaimUrl.publish && model.operatorHowToClaimUrl.value ? (
              <p className="lcg-actions">
                <a
                  className="lcg-chip"
                  href={model.operatorHowToClaimUrl.value}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {model.operatorName.value ?? "Operator"} claim information
                </a>
              </p>
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-14 */
      case "JG-14":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg14Heading}
            </h3>
            <p className="lcg-fine">{copy.jg14Intro}</p>
            {/*
              ONE SUMMARY, NOT FIVE CARDS.
              The findings are the same deterministic observations as before; five near-identical bordered cards
              each repeating its own window and method was most of this section's height and none of its value.
              The window is stated once and the observations are lines beneath it.
            */}
            {m2.whatChanged ? (
              <div className="lcg-changed">
                <p className="lcg-changed__window">{m2.whatChanged.summary}</p>
                <ul className="lcg-changed__points">
                  {m2.whatChanged.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <p className="lcg-fine">
                  <a className="lcg-chip" href="#jg-09">
                    See the supporting figures
                  </a>
                </p>
              </div>
            ) : null}
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-15 */
      case "JG-15":
        /*
          THREE SEPARATE, VISIBLE, CRAWLABLE SECTIONS — no tab interface.
          Tabs hid two thirds of the content from a reader and put all of it behind a click; the panels were in
          the DOM but the section read as one item. Each category is now its own `<section>` with its own
          heading, and every card is a real `<a href>` to an article route that resolves. A category with no
          articles is absent, so no empty card exists to render.
        */
        return (
          <div key={id} data-section-id={id} {...sectionAuditAttributes("game", id)} id={anchor(id)}>
            {m2.editorial.map((sec) => (
              <section
                className="lcg-section"
                id={`jg-15-${sec.kind.toLowerCase()}`}
                data-editorial-kind={sec.kind}
                aria-labelledby={`jg-15-${sec.kind.toLowerCase()}-h`}
                key={sec.kind}
              >
                <h3 className="lcg-h2" id={`jg-15-${sec.kind.toLowerCase()}-h`}>
                  {sec.heading}
                </h3>
                {sec.intro ? <p className="lcg-fine">{sec.intro}</p> : null}
                <ul className="lcg-editoriallist">
                  {sec.items.map((it) => {
                    const dateLine = articleDateLine(it);
                    return (
                      <li className="lcg-editorial" key={it.slug}>
                        <h4 className="lcg-h4">
                          <Link href={it.href}>{it.title}</Link>
                        </h4>
                        <p className="lcg-fine">{it.summary}</p>
                        <p className="lcg-cardmeta">
                          <span className="lcg-tag">{sec.kind}</span>
                          {dateLine ? (
                            <span className="lcg-muted">
                              {dateLine.label} <time dateTime={dateLine.iso}>{dateLine.iso}</time>
                            </span>
                          ) : null}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        );

      /* ══════════════════════════════════════════════════ JG-16 */
      case "JG-16":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg16Heading}
            </h3>
            <p className="lcg-fine">{copy.jg16ColdStart}</p>

            {/* Platform-authored starters, labelled as such by their own tag. No author, replies, views or
                likes exist anywhere in the contract, so none can be rendered. */}
            <ul className="lcg-starterlist">
              {config.community.map((s) => (
                <li className="lcg-starter" key={s.key}>
                  <h4 className="lcg-h4">{s.title}</h4>
                  <p className="lcg-fine">{s.excerpt}</p>
                  <p className="lcg-cardmeta">
                    {s.tags.map((t) => (
                      <span className="lcg-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>

            <p className="lcg-actions">
              {/* JG-16's designated discussion entry now reaches the REAL community: `/community` is a
                  registry-served route (commit a39bdfe, Conflict 41), so `FD-ACC-10`'s
                  hidden-because-no-forum condition is satisfied by construction. Previously this
                  anchored to the section itself for want of a destination. */}
              <StateDiscussLink
                context={discussionContext}
                groupId={anchor("JG-16")}
                href="/community"
                label="Discuss the latest result"
              />
            </p>
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-17 */
      case "JG-17":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg17Heading}
            </h3>
            <GameSaveControls
              gameLabel={gameLabel}
              gameSlug={config.game.gameSlug}
              stateCode={config.game.stateCode}
              options={m2.alerts}
              signedOutCopy={copy.jg17SignedOut}
            />
          </section>
        );

      /* ══════════════════════════════════════════════════ JG-18 */
      case "JG-18":
        return (
          <section className="lcg-section" id={anchor(id)} data-section-id={id} {...sectionAuditAttributes("game", id)} aria-labelledby={hid(id)} key={id}>
            <h3 className="lcg-h2" id={hid(id)}>
              {copy.jg18Heading}
            </h3>
            {/*
              ONE sources paragraph.
              `copy.jg18Primary` and `config.trust.summary` said the same thing twice — both explained that
              results come from the feed and rules from the operator — and `m2.sourceLine` then repeated the
              freshness line that JG-01 already carries. The trust summary is the fuller of the two and is kept;
              the other two are removed. The `Last updated` fact now appears once on the page, in JG-01.
            */}
            <p className="lcg-fine">{config.trust.summary}</p>

            {m2.era ? (
              <dl className="lcg-facts">
                <div className="lcg-fact">
                  <dt>Rules in force</dt>
                  <dd>
                    Since {m2.era.effectiveFrom}
                    {m2.era.addOns.length > 0
                      ? `, including ${m2.era.addOns.map((a) => a.label).join(" and ")} since ${m2.era.addOns[0].effectiveFrom}`
                      : ""}
                    .
                  </dd>
                </div>
                <div className="lcg-fact">
                  <dt>Rule sources</dt>
                  <dd>
                    <ul className="lcg-sourcelist">
                      {m2.sourceRefs.map((s) => (
                        <li key={s.url}>
                          <a href={s.url} rel="noopener noreferrer" target="_blank">
                            {s.title}
                            {s.ruleNumber ? ` (${s.ruleNumber})` : ""}
                          </a>{" "}
                          <span className="lcg-muted">read {s.accessed}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            ) : null}

            <h4 className="lcg-h3">How this page is produced</h4>
            {/*
              ONE note, not one per topic. Four list items each ending "· not yet published" said the same thing
              four times. These are the topics this page's methodology covers; the dedicated methodology pages
              are a separate, unbuilt route, and that is stated once beneath the list.
            */}
            <ul className="lcg-guidelist">
              {(config.methodology ?? []).map((mth) => (
                <li key={mth}>{mth}</li>
              ))}
            </ul>
            <p className="lcg-fine lcg-muted">
              Each of these has a dedicated methodology page planned. Until they are published, the rules that
              govern them are the ones described on this page.
            </p>

            <h4 className="lcg-h3">Official {stateName} resources</h4>
            <ul className="lcg-chiplist">
              {model.operatorWinningNumbersUrl.publish && model.operatorWinningNumbersUrl.value ? (
                <li>
                  <a
                    className="lcg-chip"
                    href={model.operatorWinningNumbersUrl.value}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Official winning numbers
                  </a>
                </li>
              ) : null}
              {model.operatorHowToClaimUrl.publish && model.operatorHowToClaimUrl.value ? (
                <li>
                  <a
                    className="lcg-chip"
                    href={model.operatorHowToClaimUrl.value}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Claim information
                  </a>
                </li>
              ) : null}
              {model.operatorResponsiblePlayUrl.publish && model.operatorResponsiblePlayUrl.value ? (
                <li>
                  <a
                    className="lcg-chip"
                    href={model.operatorResponsiblePlayUrl.value}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Play responsibly
                  </a>
                </li>
              ) : null}
              <li>
                <Link className="lcg-chip" href="/corrections-policy">
                  Accuracy and corrections policy
                </Link>
              </li>
              <li>
                <Link className="lcg-chip" href="/affiliate-disclosure">
                  Affiliate disclosure
                </Link>
              </li>
            </ul>

            <p className="lcg-fine lcg-muted">{config.trust.independence}</p>
          </section>
        );

      default:
        /* The four AD-JG anchors keep their governed position in `order` and resolve to nothing. */
        return null;
    }
  };

  /* ---------------------------------------------------------------- bands */

  return (
    <>
      {/*
        THE PAGE IDENTITY, ABOVE THE BANDS.
        The `h1` sits here rather than inside JG-01 for one structural reason: every band carries an `h2`, so an
        `h1` nested inside a band would appear *after* an `h2` and invert the document outline. Hoisting it gives
        a clean `h1` → band `h2` → section `h3` hierarchy while keeping the identity visually where the brief
        wants it — immediately above the result, one game identity and one mark, not one card per variant.
      */}
      <header className="lcg-pagehead">
        <p className="lcg-context">
          <span className="lcg-statechip">{stateName}</span>
          <span className="lcg-kind">
            {m2.members.length > 1 ? `${m2.members.length} drawings a day` : "State game"}
          </span>
        </p>
        <div className="lcg-identity">
          {/*
            ONE identity for the whole family — Midday and Evening share it and have no separate marks.

            The mark renders only when the registry holds a POSITIVELY VERIFIED asset for this jurisdiction and
            game; otherwise the neutral lettered mark stands in. The registry key is state-scoped, because the
            legacy library holds a different Pick 3 mark for ~30 jurisdictions and a bare game slug would put
            Florida's logo on Virginia's page.

            `alt=""` is deliberate: the adjacent `h1` is the accessible name, so the image is decorative and a
            screen reader is not told the game twice.
          */}
          {logo ? (
            <Image
              className="lcg-logo"
              src={logo.src}
              alt=""
              width={logo.width}
              height={logo.height}
              priority
            />
          ) : (
            <span className="lcg-mark" aria-hidden="true">
              {gameLabel.slice(0, 2).toUpperCase()}
            </span>
          )}
          <h1 className="lcg-h1" id="game-h1">
            {copy.h1}
          </h1>
        </div>
        <p className="lcg-purpose">{copy.intro}</p>
      </header>

      {/* Compact in-page navigation. Eight entries for eighteen sections, per the brief. */}
      {(config.navigation ?? []).length > 0 ? (
        <nav className="lcg-jump" aria-label={`${gameLabel} sections`} data-jump-nav="true">
          <ul>
            {(config.navigation ?? []).map((n) => (
              <li key={n.fragment}>
                <a className="lcg-chip" href={n.fragment}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {JG_M2_BANDS.map((band) => {
        const rendered = band.sections.map((s) => section(s)).filter(Boolean);
        if (rendered.length === 0) return null;
        return (
          <div
            className="lcg-band"
            key={band.id}
            data-band={band.id}
            aria-labelledby={`band-${band.id}`}
            role="region"
          >
            <h2
              className={band.visuallyHiddenTitle ? "lcs-vh" : "lcg-bandtitle"}
              id={`band-${band.id}`}
            >
              {band.title.replace("{state}", stateName)}
            </h2>
            {rendered}
          </div>
        );
      })}
    </>
  );
}
