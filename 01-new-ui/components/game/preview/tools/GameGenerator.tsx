"use client";

/*
 * JG-10 — GENERATOR. LRG-GAME-050.
 *
 * Authority: BP-04B §21, the 2026-08-04 brief §10, Constitution (entertainment tool, clearly classified; no
 * language implying that generation changes the odds of a fair independent draw).
 *
 * The numbers come from `generateSets`, which reads the governed era for its range and shape and uses a CSPRNG
 * with rejection sampling. This file renders controls and output only — per the brief, AI may configure
 * preferences in plain language but must not manufacture the numbers, and neither may a component.
 *
 * ══ THE REPEATS TOGGLE IS LABELLED AS A PREFERENCE, NOT A RULE ══
 *
 * `1-1-2` is a perfectly valid Pick 3 ticket. Turning repeats off narrows what this tool offers and changes
 * nothing about the drawing, and the brief requires that to be said plainly rather than implied by a control
 * that looks like a filter on the game.
 */

import { useState } from "react";
import { eligiblePlayTypes, generateSets, GENERATOR_BOUNDARY, MAX_SETS, type GeneratedSet } from "@/lib/game/digitSetGenerator";
import type { FormatProfile } from "@/lib/game/gameFormatProfile";
import type { GameRuleEra } from "@/lib/game/gameRuleContract";

interface MemberOption {
  gameId: number;
  variantLabel: string;
}

export default function GameGenerator({
  profile,
  era,
  members,
  addOnLabel,
  saveAnchor,
}: {
  /** The FORMAT decides the shape: how many values, from what range, in how many groups. */
  profile: FormatProfile;
  /** The RULE ERA decides which play types a generated set could be bought as. May be absent. */
  era: GameRuleEra | undefined;
  members: readonly MemberOption[];
  addOnLabel: string | null;
  /** Where "Save set" routes: the JG-17 controls, which own the sign-in prompt. */
  saveAnchor: string;
}) {
  const [gameId, setGameId] = useState(members[0]?.gameId ?? 0);
  const [setCount, setSetCount] = useState(3);
  const [allowRepeats, setAllowRepeats] = useState(profile.main?.semantics.repeatsAllowed ?? false);
  const [addOnPreference, setAddOnPreference] = useState(false);
  const [sets, setSets] = useState<readonly GeneratedSet[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const variantLabel = members.find((m) => m.gameId === gameId)?.variantLabel || "the next drawing";

  const run = () => {
    try {
      const r = generateSets(profile, { setCount, allowRepeats });
      setSets(r.sets);
      setNote(r.note);
      setError(null);
    } catch (e) {
      /* No silent fallback to a biased generator. If no CSPRNG exists the tool says so. */
      setSets([]);
      setNote(null);
      setError(e instanceof Error ? e.message : "Number generation is unavailable in this browser.");
    }
  };

  return (
    <div className="lcg-tool" data-tool="generator">
      <div className="lcg-fieldrow">
        <div className="lcg-field">
          <label htmlFor="gen-variant">Drawing</label>
          <select id="gen-variant" value={gameId} onChange={(e) => setGameId(Number(e.target.value))}>
            {members.map((m) => (
              <option key={m.gameId} value={m.gameId}>
                {m.variantLabel || "Main drawing"}
              </option>
            ))}
          </select>
        </div>

        <div className="lcg-field">
          <label htmlFor="gen-count">Number of sets</label>
          <select id="gen-count" value={setCount} onChange={(e) => setSetCount(Number(e.target.value))}>
            {Array.from({ length: MAX_SETS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {profile.main?.semantics.repeatsAllowed ? (
          <div className="lcg-field lcg-field--check">
            <input
              id="gen-repeats"
              type="checkbox"
              checked={allowRepeats}
              onChange={(e) => setAllowRepeats(e.target.checked)}
            />
            <label htmlFor="gen-repeats">Allow a repeated digit</label>
          </div>
        ) : null}

        {addOnLabel ? (
          <div className="lcg-field lcg-field--check">
            <input
              id="gen-addon"
              type="checkbox"
              checked={addOnPreference}
              onChange={(e) => setAddOnPreference(e.target.checked)}
            />
            <label htmlFor="gen-addon">Plan to add {addOnLabel}</label>
          </div>
        ) : null}
      </div>

      {addOnLabel && addOnPreference ? (
        <p className="lcg-fine lcg-muted">
          {addOnLabel} is bought on the ticket and drawn separately. It is not part of a generated set.
        </p>
      ) : null}

      <div className="lcg-actions">
        <button className="lcg-btn lcg-btn--primary" type="button" onClick={run}>
          {sets.length === 0 ? "Generate numbers" : "Generate again"}
        </button>
        <a className="lcg-btn" href={saveAnchor}>
          Save a set
        </a>
      </div>

      <div className="lcg-outcome" role="status" aria-live="polite" data-generated={sets.length}>
        {error ? <p className="lcg-fine">{error}</p> : null}

        {sets.length > 0 ? (
          <>
            <ul className="lcg-setlist">
              {sets.map((s, i) => (
                <li key={i} className="lcg-set">
                  {/* Every group is shown separately. A special ball is never folded into the main row. */}
                  <span className="lcg-set__values">
                    {profile.groups
                      .filter((g) => g.role !== "addOn" && s.byGroup[g.key])
                      .map((g) => (
                        <span className="lcg-set__group" key={g.key}>
                          {g.label ? <span className="lcg-muted lcg-fine">{g.label} </span> : null}
                          {(s.byGroup[g.key] ?? []).join(" · ")}
                        </span>
                      ))}
                  </span>
                  <span className="lcg-muted lcg-fine">
                    {/* Permutation vocabulary belongs only to an ordered group that can repeat a value. On an
                        unordered set "6 possible orders" would describe the tool, not the game. */}
                    {profile.supports.permutationVocabulary
                      ? `${s.orderings === 1 ? "one possible order" : `${s.orderings} possible orders`}`
                      : null}
                    {profile.supports.permutationVocabulary && era ? " · can be played " : null}
                    {era ? eligiblePlayTypes(era, s).join(", ") : null}
                  </span>
                </li>
              ))}
            </ul>
            <p className="lcg-fine lcg-muted">
              Generated for {variantLabel}. {note ?? ""}
            </p>
          </>
        ) : error === null ? (
          <p className="lcg-fine lcg-muted">
            Choose how many sets you want, then generate. Nothing is saved until you ask for it.
          </p>
        ) : null}

        {/* One concise boundary, stated once. */}
        <p className="lcg-boundary">{GENERATOR_BOUNDARY}</p>
      </div>
    </div>
  );
}
