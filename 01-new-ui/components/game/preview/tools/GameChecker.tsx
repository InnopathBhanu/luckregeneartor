"use client";

/*
 * JG-03 — CHECK MY NUMBERS. LRG-GAME-050.
 *
 * Authority: BP-04B §20, the 2026-08-04 brief §3, Constitution (protect result verification from
 * interruption; classify every claim; deliver value before asking for anything).
 *
 * ══ THIS COMPONENT DOES NOT DECIDE ANYTHING ══
 *
 * Every comparison and every prize string comes from `checkTicket`, which reads the governed rule era. This
 * file collects six inputs and draws one outcome. That split is the point: the logic is a pure function with
 * unit tests, so the answer a player gets cannot depend on a rendering detail.
 *
 * ══ THE VARIANT IS AN INPUT, NEVER A DEFAULT ══
 *
 * Midday and Evening are separate games. The drawing selector is required and the drawn result is looked up
 * by `(gameId, date)` together, so a Midday ticket can never be silently compared against an Evening draw.
 *
 * ══ WHY THE PLAY-TYPE LIST NARROWS AS YOU TYPE ══
 *
 * `7-7-7` has one possible order, so Box, Straight/Box and Combo cannot be bought on it. Rather than accept
 * the selection and return a confusing "no match", the eligible play types are recomputed from the digits and
 * the ineligible ones are removed with the reason shown. `FD-S-08` forbids presenting a control as functional
 * when it is not.
 */

import { useMemo, useState } from "react";
import { checkTicket, type SelectedDigits } from "@/lib/game/digitTicketCheck";
import type { GameRuleEra } from "@/lib/game/gameRuleContract";
import type { FormatProfile } from "@/lib/game/gameFormatProfile";
import type { ReviewDrawRecord } from "@/lib/game/gameReviewFixture";

interface MemberOption {
  gameId: number;
  variantLabel: string;
}

export default function GameChecker({
  profile,
  era,
  gameKey,
  members,
  history,
  defaultDateIso,
  addOnLabel,
  explainAnchor,
}: {
  /** The FORMAT supplies the shape: how many positions and what range. */
  profile: FormatProfile;
  era: GameRuleEra;
  gameKey: string;
  members: readonly MemberOption[];
  history: readonly ReviewDrawRecord[];
  defaultDateIso: string;
  /** The era's drawn add-on label, e.g. `FIREBALL`. `null` hides the control entirely. */
  addOnLabel: string | null;
  /** Where "Explain this" routes. In-page, because no AI service is connected. */
  explainAnchor: string;
}) {
  const [gameId, setGameId] = useState(members[0]?.gameId ?? 0);
  const [dateIso, setDateIso] = useState(defaultDateIso);
  const [digits, setDigits] = useState<(number | null)[]>(Array((profile.main?.count ?? 0)).fill(null));
  const [playTypeKey, setPlayTypeKey] = useState(era.playTypes[0]?.key ?? "");
  const [wagerCents, setWagerCents] = useState(
    era.wagers.find((w) => w.isDefault)?.amountCents ?? era.wagers[0]?.amountCents ?? 100,
  );
  const [addOn, setAddOn] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* Only play types that actually carry a priced row are offerable. */
  const pricedPlayTypes = useMemo(
    () => era.playTypes.filter((p) => era.payouts.some((r) => r.playTypeKey === p.key)),
    [era],
  );

  /* Which play types the CURRENT digits can legally be played as. Recomputed on every keystroke. */
  const eligible = useMemo(() => {
    const chosen = digits.filter((d): d is number => d !== null);
    if (chosen.length < (profile.main?.count ?? 0)) return pricedPlayTypes;
    const distinct = new Set(chosen).size;
    const shape = distinct === chosen.length ? "allUnique" : distinct === 1 ? "allSame" : "hasPair";
    return pricedPlayTypes.filter((p) => {
      if (p.digitShape === "pairOnly") return true;
      if (shape === "allSame") return p.key === "straight";
      if (p.digitShape === "hasPair") return shape === "hasPair";
      if (p.digitShape === "allUnique") return shape === "allUnique";
      return true;
    });
  }, [digits, (profile.main?.count ?? 0), pricedPlayTypes]);

  const activePlayType = eligible.find((p) => p.key === playTypeKey) ?? eligible[0];
  const effectiveKey = activePlayType?.key ?? playTypeKey;

  /* Wagers this play type is actually sold at — Straight/Box is a $1.00 play only. */
  const wagerOptions = useMemo(() => {
    const row = era.payouts.find((r) => r.playTypeKey === effectiveKey);
    if (!row) return era.wagers;
    const priced = new Set(Object.keys(row.prizeByWagerCents).map(Number));
    return era.wagers.filter((w) => priced.has(w.amountCents));
  }, [era, effectiveKey]);

  const effectiveWager = wagerOptions.some((w) => w.amountCents === wagerCents)
    ? wagerCents
    : (wagerOptions[0]?.amountCents ?? wagerCents);

  const usedPositions = activePlayType?.positions ?? digits.map((_, i) => i);

  const drawn = useMemo(() => {
    const rec = history.find((h) => h.gameId === gameId && h.drawDateIso === dateIso);
    return rec ? { gameId: rec.gameId, drawDateIso: rec.drawDateIso, digits: rec.digits, fireball: rec.fireball } : null;
  }, [history, gameId, dateIso]);

  const outcome = useMemo(() => {
    if (!submitted) return null;
    const member = members.find((m) => m.gameId === gameId);
    return checkTicket(
      {
        gameId,
        variantLabel: member?.variantLabel || "this drawing",
        drawDateIso: dateIso,
        digits: digits as SelectedDigits,
        playTypeKey: effectiveKey,
        wagerCents: effectiveWager,
        fireballSelected: addOn,
      },
      drawn,
      [era],
      gameKey,
      { min: profile.main?.min ?? 0, max: profile.main?.max ?? 9 },
    );
  }, [submitted, members, gameId, dateIso, digits, effectiveKey, effectiveWager, addOn, drawn, era, gameKey]);

  const setDigit = (i: number, raw: string) => {
    const v = raw === "" ? null : Number(raw);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v === null || Number.isNaN(v) ? null : Math.max((profile.main?.min ?? 0), Math.min((profile.main?.max ?? 9), v));
      return next;
    });
    setSubmitted(false);
  };

  const availableDates = useMemo(
    () =>
      [...new Set(history.filter((h) => h.gameId === gameId).map((h) => h.drawDateIso))]
        .sort()
        .reverse()
        .slice(0, 120),
    [history, gameId],
  );

  return (
    <div className="lcg-tool" data-tool="checker">
      <form
        className="lcg-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="lcg-fieldrow">
          <div className="lcg-field">
            <label htmlFor="chk-variant">Drawing</label>
            <select
              id="chk-variant"
              value={gameId}
              onChange={(e) => {
                setGameId(Number(e.target.value));
                setSubmitted(false);
              }}
            >
              {members.map((m) => (
                <option key={m.gameId} value={m.gameId}>
                  {m.variantLabel || "Main drawing"}
                </option>
              ))}
            </select>
          </div>

          <div className="lcg-field">
            <label htmlFor="chk-date">Draw date</label>
            <select
              id="chk-date"
              value={dateIso}
              onChange={(e) => {
                setDateIso(e.target.value);
                setSubmitted(false);
              }}
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="lcg-fieldset">
          <legend>Your numbers</legend>
          <div className="lcg-digits">
            {digits.map((d, i) => {
              const used = usedPositions.includes(i);
              return (
                <span key={i} className="lcg-digitwrap">
                  <label className="lcs-vh" htmlFor={`chk-d${i}`}>
                    Position {i + 1}
                  </label>
                  <input
                    id={`chk-d${i}`}
                    className="lcg-digit"
                    type="number"
                    inputMode="numeric"
                    min={(profile.main?.min ?? 0)}
                    max={(profile.main?.max ?? 9)}
                    value={used ? (d ?? "") : ""}
                    placeholder={used ? "–" : "×"}
                    disabled={!used}
                    aria-describedby={!used ? `chk-d${i}-note` : undefined}
                    onChange={(e) => setDigit(i, e.target.value)}
                  />
                  {!used ? (
                    <span id={`chk-d${i}-note`} className="lcs-vh">
                      Not used by the selected play type
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </fieldset>

        <div className="lcg-fieldrow">
          <div className="lcg-field">
            <label htmlFor="chk-play">Play type</label>
            <select
              id="chk-play"
              value={effectiveKey}
              onChange={(e) => {
                setPlayTypeKey(e.target.value);
                setSubmitted(false);
              }}
            >
              {eligible.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lcg-field">
            <label htmlFor="chk-wager">Play amount</label>
            <select
              id="chk-wager"
              value={effectiveWager}
              onChange={(e) => {
                setWagerCents(Number(e.target.value));
                setSubmitted(false);
              }}
            >
              {wagerOptions.map((w) => (
                <option key={w.amountCents} value={w.amountCents}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          {addOnLabel ? (
            <div className="lcg-field lcg-field--check">
              <input
                id="chk-addon"
                type="checkbox"
                checked={addOn}
                onChange={(e) => {
                  setAddOn(e.target.checked);
                  setSubmitted(false);
                }}
              />
              <label htmlFor="chk-addon">Ticket included {addOnLabel}</label>
            </div>
          ) : null}
        </div>

        {eligible.length < pricedPlayTypes.length ? (
          <p className="lcg-fine lcg-muted" role="status">
            Some play types are unavailable for these digits, because the number of possible orders decides
            which plays can be bought.
          </p>
        ) : null}

        <div className="lcg-actions">
          <button className="lcg-btn lcg-btn--primary" type="submit">
            Check these numbers
          </button>
          <button
            className="lcg-btn"
            type="button"
            onClick={() => {
              setDigits(Array((profile.main?.count ?? 0)).fill(null));
              setSubmitted(false);
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* `aria-live` so the outcome is announced. `role="status"` rather than `alert`: this is an answer, not
          a warning, and an assertive region would interrupt a screen reader mid-sentence. */}
      <div className="lcg-outcome" role="status" aria-live="polite" data-outcome={outcome?.kind ?? "none"}>
        {outcome ? (
          <>
            <p className="lcg-outcome__headline">{outcome.statement}</p>

            {outcome.prizeDisplay ? (
              <p className="lcg-outcome__prize">
                <span className="lcg-outcome__amount">{outcome.prizeDisplay}</span>
                <span className="lcg-muted">
                  {" "}
                  published prize for this play
                  {outcome.oddsDisplay ? ` · odds ${outcome.oddsDisplay}` : ""}
                </span>
              </p>
            ) : outcome.oddsDisplay ? (
              <p className="lcg-fine lcg-muted">Published odds for this play: {outcome.oddsDisplay}</p>
            ) : null}

            {drawn ? (
              <p className="lcg-fine">
                Drawn: <strong>{drawn.digits.join(" · ")}</strong>
                {drawn.fireball !== null && addOnLabel ? (
                  <>
                    {" "}
                    · {addOnLabel} <strong>{drawn.fireball}</strong>
                  </>
                ) : null}
              </p>
            ) : null}

            {outcome.fireball && addOnLabel ? (
              <div className="lcg-outcome__addon">
                <p className="lcg-fine">{outcome.fireball.statement}</p>
                {outcome.fireball.findings.length > 0 ? (
                  <ul className="lcg-combolist">
                    {outcome.fireball.findings.map((f) => (
                      <li key={f.replacedPosition} data-matched={f.matched}>
                        <span>{f.combination.join(" · ")}</span>{" "}
                        <span className="lcg-muted">
                          {addOnLabel} replaces position {f.replacedPosition + 1}
                          {f.matched ? " — matches your ticket" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {outcome.fireball.prizeDisplay ? (
                  <p className="lcg-fine">
                    Published {addOnLabel} prize for this play: <strong>{outcome.fireball.prizeDisplay}</strong>
                    {outcome.fireball.maxWins !== null
                      ? ` · up to ${outcome.fireball.maxWins} ${addOnLabel} wins are possible on this play type`
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : null}

            {outcome.era ? (
              <p className="lcg-fine lcg-muted">
                Compared using the rules in force from {outcome.era.effectiveFrom}
                {outcome.era.effectiveTo ? ` to ${outcome.era.effectiveTo}` : " onwards"}.
              </p>
            ) : null}

            {/* The one transactional boundary the trust policy allows here. Stated once, after the output. */}
            <p className="lcg-boundary">{outcome.boundary}</p>

            <p className="lcg-actions">
              <a className="lcg-chip" href={explainAnchor}>
                Explain this outcome
              </a>
            </p>
          </>
        ) : (
          <p className="lcg-fine lcg-muted">
            Choose a drawing and enter your digits to compare them with a published result.
          </p>
        )}
      </div>
    </div>
  );
}
