"use client";

/*
 * TL-02 + TL-07 — THE LOTTERY TAX CALCULATOR TOOL AND ITS SAVE CONTROL. LRG-TOOLS-001.
 *
 * Authority: BP-05C §11 (Tax Calculator public scope: ONE estimate; sign-in adds saved scenarios — the
 * Insider column is ignored per `FD-ACC-02`), §16 (result before anything else), §25 (keyboard inputs,
 * results announced after calculation, mobile-friendly number entry), the frozen Constitution A.9 (no
 * purchase or promotional pressure — THERE IS NO BUY ANYTHING ON THIS PAGE) and §7 (never "you will owe";
 * everything "estimated"), `FD-DAT-04`/`FD-ACC-12`/`FD-ACC-13` (the save gate and its continuation).
 *
 * ══ THE PUBLIC ESTIMATE IS NEVER GATED ══
 *
 * The computation runs on every input change, signed in or not — no session read touches the calculation
 * path. The ONLY gated act is SAVING a scenario (TL-07): signed out it offers the shared `FD-DAT-04`
 * affordance; signed in it writes a page preference to the member's review-mode account and genuinely lists
 * it back. `children` are the server-rendered TL-03..TL-06 sections, slotted between the tool and the save
 * control so the §20 disclosures sit against the figures they govern.
 *
 * ══ SERVER HTML CARRIES THE DEFAULT EXAMPLE ══
 *
 * This is a client component, but its FIRST render happens on the server with the prefill props, so both
 * result columns for the default example are in the served HTML — no reader or crawler sees an empty tool.
 *
 * ══ NO AD ANYWHERE NEAR THIS ══
 *
 * Input to output is a protected zone (`CLAUDE.md` §12), and this family renders no ad slot at all: the
 * legacy tax page's `lc_*` inventory is uncaptured, and each family requires its own audit first.
 */

import { useMemo, useState } from "react";
import {
  ANNUITY_ESCALATION, ANNUITY_YEARS, computeTaxScenario, formatUsdCents, formatUsdWhole,
  parseUsdToCents, type TaxLine,
} from "@/lib/tools/taxCalculator";
import { FILING_STATUSES, type FilingStatus } from "@/lib/tools/taxTables2026";
import type { StateOption, TaxCalculatorPrefill } from "@/lib/tools/taxCalculatorModel";
import { TAX_CALCULATOR_PATH } from "@/lib/tools/toolManifest";
import { useAccountSession } from "@/lib/account/useAccountSession";
import { setPagePreference } from "@/lib/account/session";
import SignInToUse from "@/components/account/SignInToUse";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

type Payout = "cash" | "annuity";

const SAVE_KEY_PREFIX = "tax-scenario:";
const SAVE_ANCHOR = "tl-07";

/* ------------------------------------------------------------------ one result column */

function ResultColumn({
  title,
  detail,
  line,
  chosen,
  stateName,
}: {
  title: string;
  detail: string;
  line: TaxLine;
  chosen: boolean;
  stateName: string | null;
}) {
  return (
    <div className="lct-col" data-payout-column={title} data-chosen={chosen}>
      <h4 className="lct-col__title">
        {title}
        {chosen ? <span className="lct-chip lct-chip--chosen"> your selection</span> : null}
      </h4>
      <p className="lct-fine lct-muted">{detail}</p>
      <dl className="lct-lines">
        <div className="lct-line">
          <dt>Gross prize</dt>
          <dd data-line="gross">{formatUsdWhole(line.grossCents)}</dd>
        </div>
        <div className="lct-line">
          <dt>Federal withholding (24%)</dt>
          <dd data-line="federal-withheld">−{formatUsdWhole(line.federalWithheldCents)}</dd>
        </div>
        <div className="lct-line">
          <dt>Estimated additional federal tax</dt>
          <dd data-line="federal-additional">−{formatUsdWhole(line.federalAdditionalCents)}</dd>
        </div>
        {stateName ? (
          <>
            <div className="lct-line">
              <dt>{stateName} tax withheld</dt>
              <dd data-line="state-withheld">−{formatUsdWhole(line.stateWithheldCents)}</dd>
            </div>
            <div className="lct-line">
              <dt>Estimated additional {stateName} tax</dt>
              <dd data-line="state-additional">−{formatUsdWhole(line.stateAdditionalCents)}</dd>
            </div>
          </>
        ) : (
          <div className="lct-line lct-line--nostate">
            <dt>State tax</dt>
            <dd data-line="state-unselected">Choose a state above to include it</dd>
          </div>
        )}
        <div className="lct-line lct-line--net">
          <dt>Estimated net</dt>
          <dd data-line="estimated-net">{formatUsdWhole(line.estimatedNetCents)}</dd>
        </div>
      </dl>
      {line.federalOverWithheld || line.stateOverWithheld ? (
        <p className="lct-fine lct-muted" data-over-withheld="true">
          At this amount, more is withheld than the estimated tax comes to — the difference is usually settled
          at filing, and this estimate does not count it back in.
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ the tool */

export default function TaxCalculatorTool({
  prefill,
  states,
  children,
}: {
  prefill: TaxCalculatorPrefill;
  states: readonly StateOption[];
  /** The server-rendered TL-03..TL-06 sections, slotted between the tool and the save control. */
  children?: React.ReactNode;
}) {
  const [amountText, setAmountText] = useState(() => formatUsdWhole(prefill.advertisedCents).replace("$", ""));
  const [payout, setPayout] = useState<Payout>("cash");
  const [stateCode, setStateCode] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

  const { session, account } = useAccountSession();

  const advertisedCents = parseUsdToCents(amountText);
  const amountUsable = advertisedCents !== null && advertisedCents > 0;

  /* The operator-published cash value applies only while the amount is still the figure it was published
     for; once the reader types a different jackpot, the tool falls back to the disclosed ~half assumption. */
  const publishedCashApplies =
    prefill.cashValueCents !== null && advertisedCents === prefill.advertisedCents;

  const scenario = useMemo(
    () =>
      computeTaxScenario({
        advertisedCents: advertisedCents ?? 0,
        cashValueCents: publishedCashApplies ? prefill.cashValueCents : null,
        filingStatus,
        stateCode: stateCode || null,
      }),
    [advertisedCents, publishedCashApplies, prefill.cashValueCents, filingStatus, stateCode],
  );

  const stateRecord = scenario.state;
  const stateName = stateRecord?.name ?? null;
  const statusLabel = FILING_STATUSES.find((s) => s.key === filingStatus)?.label ?? filingStatus;

  const savedScenarios = account
    ? Object.entries(account.preferences.page)
        .filter(([key, v]) => key.startsWith(SAVE_KEY_PREFIX) && v.value !== "off")
        .map(([key, v]) => ({ key, description: v.value, savedAtIso: v.savedAtIso }))
    : [];

  /** One sentence a saved scenario keeps — everything needed to re-enter it by hand. */
  const scenarioDescription = amountUsable
    ? `${prefill.gameLabel ? `${prefill.gameLabel} — ` : ""}${formatUsdWhole(advertisedCents!)} advertised, `
      + `${payout === "cash" ? "cash option" : "30-year annuity"}, ${stateName ?? "no state selected"}, `
      + `${statusLabel} — estimated net ${formatUsdWhole(
        payout === "cash" ? scenario.cash.line.estimatedNetCents : scenario.annuity.totals.estimatedNetCents,
      )} (tax year ${scenario.effectiveTaxYear})`
    : null;

  const saveNow = () => {
    if (!scenarioDescription) return;
    setPagePreference(`${SAVE_KEY_PREFIX}${globalThis.crypto.randomUUID()}`, scenarioDescription);
    setSaved(scenarioDescription);
    setPendingSave(false);
  };

  return (
    <>
      {/* ══════════════════════════════════════════ TL-02 — the calculator. A protected zone. */}
      <section
        className="lct-section lct-calculator"
        id="tl-02"
        data-section-id="TL-02"
        {...sectionAuditAttributes("tools", "TL-02")}
        data-protected-zone="true"
        data-source-class="deterministic"
        aria-labelledby="tl-02-heading"
      >
        <h2 className="lct-h2" id="tl-02-heading">Your estimate</h2>

        {/* ---- inputs: one clean column, plain language, 44px+ targets, numeric keyboards. ---- */}
        <form className="lct-form" onSubmit={(e) => e.preventDefault()}>
          <div className="lct-field">
            <label htmlFor="lct-amount">Advertised jackpot or prize amount</label>
            <div className="lct-amountwrap">
              <span className="lct-amountwrap__symbol" aria-hidden="true">$</span>
              <input
                id="lct-amount"
                className="lct-input lct-input--amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amountText}
                onChange={(e) => {
                  setAmountText(e.target.value);
                  setSaved(null);
                  setPendingSave(false);
                }}
                aria-describedby="lct-amount-help"
              />
            </div>
            <p className="lct-fine lct-muted" id="lct-amount-help">
              Use the headline figure the game advertises — that is the annuity total, not the cash option.
            </p>
          </div>

          <fieldset className="lct-field lct-fieldset">
            <legend>How would you take it?</legend>
            <div className="lct-togglerow" role="radiogroup" aria-label="Lump sum or annuity">
              {(
                [
                  { key: "cash", label: "Cash option (lump sum)" },
                  { key: "annuity", label: "Annuity (30 yearly payments)" },
                ] as const
              ).map((opt) => (
                <label key={opt.key} className="lct-toggle">
                  <input
                    type="radio"
                    name="lct-payout"
                    value={opt.key}
                    checked={payout === opt.key}
                    onChange={() => {
                      setPayout(opt.key);
                      setSaved(null);
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="lct-fine lct-muted">Both are always shown side by side — this only marks your pick.</p>
          </fieldset>

          <div className="lct-field">
            <label htmlFor="lct-state">Your state</label>
            <select
              id="lct-state"
              className="lct-input"
              value={stateCode}
              onChange={(e) => {
                setStateCode(e.target.value);
                setSaved(null);
              }}
              aria-describedby="lct-state-help"
            >
              <option value="">Choose a state…</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <p className="lct-fine lct-muted" id="lct-state-help">
              You choose — we never guess your state from your connection. Until you pick one, the estimate is
              federal only.
            </p>
          </div>

          <div className="lct-field">
            <label htmlFor="lct-status">Federal filing status</label>
            <select
              id="lct-status"
              className="lct-input"
              value={filingStatus}
              onChange={(e) => {
                setFilingStatus(e.target.value as FilingStatus);
                setSaved(null);
              }}
            >
              {FILING_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </form>

        {/* ---- results: computed live, announced politely (§25), both columns always rendered. ---- */}
        <div className="lct-results" role="status" aria-live="polite" data-payout={payout}
          data-state-selected={Boolean(stateRecord)}>
          {amountUsable ? (
            <>
              <h3 className="lct-h3">
                Estimated after-tax value of {formatUsdWhole(advertisedCents!)}
                {stateName ? ` in ${stateName}` : " (no state selected)"}
              </h3>
              <div className="lct-cols">
                <ResultColumn
                  title="Cash option"
                  detail={
                    scenario.cash.cashValueAssumed
                      ? `Assumes a cash value of ${formatUsdWhole(scenario.cash.line.grossCents)} — the typical roughly-half ratio, because no published cash value applies to this amount.`
                      : `Published cash value: ${formatUsdWhole(scenario.cash.line.grossCents)}.`
                  }
                  line={scenario.cash.line}
                  chosen={payout === "cash"}
                  stateName={stateName}
                />
                <ResultColumn
                  title="Annuity"
                  detail={`All ${ANNUITY_YEARS} graduated payments added together, each taxed in its own year.`}
                  line={scenario.annuity.totals}
                  chosen={payout === "annuity"}
                  stateName={stateName}
                />
              </div>

              {stateRecord ? (
                <p className="lct-fine" data-state-note={stateRecord.code}>
                  <strong>{stateRecord.name}:</strong> {stateRecord.note}{" "}
                  <span className="lct-muted">
                    Source: {stateRecord.sourceUrl} · recorded {stateRecord.asOfIso}.
                  </span>
                  {stateRecord.status === "verify" ? (
                    <span className="lct-verify" data-rate-status="verify">
                      {" "}This state's figures are provisional — published sources disagree or a rate change
                      is in motion, and our review has not settled it yet. Treat the state line as an
                      estimate of an estimate.
                    </span>
                  ) : null}
                </p>
              ) : null}

              {/* ---- the cash-value explainer the research spec requires. ---- */}
              <p className="lct-p" data-explainer="cash-value">
                Why is the cash option so much smaller? The advertised jackpot is the total of thirty rising
                yearly payments. The cash value is the money actually sitting behind that schedule today —
                typically about half the advertised figure. Neither option changes what you won; they are two
                ways of being paid the same prize.
              </p>

              {/* ---- the 30-year schedule, expandable, scrolling inside its own container. ---- */}
              <details
                className="lct-schedule"
                open={scheduleOpen}
                onToggle={(e) => setScheduleOpen((e.target as HTMLDetailsElement).open)}
                data-annuity-schedule="true"
              >
                <summary className="lct-schedule__summary">
                  See the 30-year annuity schedule, year by year
                </summary>
                <p className="lct-fine lct-muted">
                  Standard graduated schedule: each payment is 5% larger than the one before, and the thirty
                  payments add up exactly to the advertised jackpot. Every year is taxed with the same{" "}
                  {scenario.effectiveTaxYear} tables — real future years would use their own.
                </p>
                <div className="lct-tablewrap">
                  <table className="lct-table" data-table="annuity-schedule">
                    <caption className="lct-vh">
                      Estimated taxes on each of the thirty annuity payments
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Year</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Federal withholding (24%)</th>
                        <th scope="col">Est. additional federal</th>
                        <th scope="col">Est. state tax</th>
                        <th scope="col">Estimated net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.annuity.schedule.map((row) => (
                        <tr key={row.year}>
                          <th scope="row">{row.year}</th>
                          <td>{formatUsdCents(row.line.grossCents)}</td>
                          <td>−{formatUsdCents(row.line.federalWithheldCents)}</td>
                          <td>−{formatUsdCents(row.line.federalAdditionalCents)}</td>
                          <td>
                            {stateName
                              ? `−${formatUsdCents(row.line.stateWithheldCents + row.line.stateAdditionalCents)}`
                              : "—"}
                          </td>
                          <td>{formatUsdCents(row.line.estimatedNetCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : (
            <p className="lct-p" data-outcome="empty">
              Enter a prize amount above to see the estimate. Nothing is sent anywhere and nothing is stored.
            </p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════ TL-03..TL-06 — server-rendered, slotted here. */}
      {children}

      {/* ══════════════════════════════════════════ TL-07 — save this scenario. The ONLY gated act. */}
      <section
        className="lct-section"
        id={SAVE_ANCHOR}
        data-section-id="TL-07"
        {...sectionAuditAttributes("tools", "TL-07")}
        data-signed-in={Boolean(session)}
        aria-labelledby="tl-07-heading"
      >
        <h2 className="lct-h2" id="tl-07-heading">Save this scenario</h2>
        <p className="lct-fine lct-muted">
          The estimate above already ran — saving only keeps these figures on your free account so you can
          come back to them on any device.
        </p>

        {scenarioDescription ? (
          <p className="lct-fine" data-scenario-summary="true">{scenarioDescription}</p>
        ) : (
          <p className="lct-fine lct-muted">Enter an amount above and there will be a scenario to save.</p>
        )}

        {session ? (
          <div className="lct-savearea">
            <button
              type="button"
              className="lct-btn lct-btn--primary"
              onClick={saveNow}
              disabled={!scenarioDescription}
              data-save-scenario="signed-in"
            >
              Save to my account
            </button>
            <div role="status" aria-live="polite">
              {saved ? (
                <p className="lct-fine">Saved to your account. Review data — it stays on this review build.</p>
              ) : null}
            </div>
            {savedScenarios.length > 0 ? (
              <div className="lct-savedlist" data-saved-count={savedScenarios.length}>
                <h3 className="lct-h3">Your saved scenarios</h3>
                <ul>
                  {savedScenarios.map((s) => (
                    <li key={s.key}>
                      <span>{s.description}</span>{" "}
                      <button
                        type="button"
                        className="lct-linkbtn"
                        onClick={() => setPagePreference(s.key, "off")}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="lct-savearea" data-member-prompt={pendingSave ? "save-scenario" : "none"}>
            {pendingSave && scenarioDescription ? (
              <div>
                <p className="lct-p">
                  Saved scenarios belong to your free LotteryCorner account, so they work on every device.
                  Signing in keeps this one and brings you straight back here.
                </p>
                <SignInToUse
                  className="lct-btn lct-btn--primary"
                  intent={{
                    returnTo: `${TAX_CALCULATOR_PATH}#${SAVE_ANCHOR}`,
                    /* The FULL store key, so the FD-ACC-13 continuation writes exactly where the list reads. */
                    action: `${SAVE_KEY_PREFIX}${globalThis.crypto.randomUUID()}`,
                    label: scenarioDescription,
                    kind: "private",
                    context: { class: "preference" },
                  }}
                />
                <p className="lct-fine lct-muted">
                  A LotteryCorner account is free. Nothing is saved until you sign in.
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="lct-btn"
                onClick={() => setPendingSave(true)}
                disabled={!scenarioDescription}
                data-save-scenario="signed-out"
              >
                Save this scenario
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
