"use client";

/*
 * THE ONE SHARED ANSWER SURFACE — §C2.
 *
 * Authority: `FD-X-08` (*"ONE shared answer surface"* per page, never one chatbot per section); Global Shell §10.2
 * (the first-answer rule), §10.4 (one consistent non-human product identity), SL-T03, SL-I11; the frozen
 * Constitution §17; `FD-DAT-20` (deterministic ≠ AI, in either direction); `FD-DAT-17` (the model-executed surface
 * is absent, not gated-and-dead); `CLAUDE.md` §9 (no disabled control presented as functional).
 *
 * ══ WHAT THIS REPLACES ══
 *
 * `StateAiSurface` and `FlagshipAiConsole` were 368 and 304 lines with the same seven parts in the same order — a
 * value statement, an ask form, a lead chip row, a disclosed chip row, an answer panel, a sources disclosure and a
 * freshness line — and they had drifted on every one of them (see `lib/ai/answerSurface.ts` for the measured list).
 * Both are now thin wrappers that supply their own QUESTIONS and their own ANSWER RESOLUTION and render this.
 *
 * REUSE CLASSIFICATION (`CLAUDE.md` §6): **MERGE**. Neither surface is discarded; their common body becomes one
 * component and their family-specific parts stay with the family that owns them.
 *
 * ══ THE THREE THINGS THIS COMPONENT REFUSES TO DO ══
 *
 *   1. **It never fabricates prose.** With no answer it says the page does not hold the facts and shows what an
 *      answer would have been built from. A model has not run; inventing a paragraph would make a founder review
 *      of the AI experience worthless and would be exactly the fabrication the Constitution forbids.
 *   2. **It never answers a different question.** Below the match threshold it says so (`NO_MATCH_NOTICE`). A
 *      confident fuzzy match on a page about money is worse than an admission.
 *   3. **It never labels arithmetic as AI.** `FD-DAT-20`: a computed answer is labelled by its provenance, with no
 *      AI badge and no "an AI did not write this" disclaimer either.
 *
 * ══ WHY IT IS A CLIENT COMPONENT, AND WHAT STAYS ON THE SERVER ══
 *
 * Selecting a question and typing are interactions, so this island is client-side. But the QUESTIONS and their
 * precomputed answers arrive as props resolved on the server, so every question and every answer that exists is in
 * the initial HTML — which is what `CLAUDE.md` §11 requires of a crawlable public fact and what keeps the
 * Constitution's "one complete public answer" reachable without JavaScript.
 *
 * ══ ONE SURFACE PER PAGE, ENFORCED IN THE DOM ══
 *
 * Contextual chips elsewhere on the page own no panel. They dispatch `askEvent` and this component listens, so
 * every Explain action anywhere on the page writes into this one region. `id={SHARED_ASK_ANCHOR}` is also emitted
 * here, which is what makes the shell's GS-06 control reach the page's own surface (see `globalShellModel.ts`).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AI_DISCLOSURE, ANSWER_LABEL, CHOOSE_PROMPT, LEAD_QUESTIONS_MAX, NO_MATCH_NOTICE, SOURCES_SUMMARY,
  SOURCES_SUMMARY_UNAVAILABLE, matchQuestion,
  type AnswerQuestion, type ResolvedAnswer,
} from "@/lib/ai/answerSurface";
import { SHARED_ASK_ANCHOR } from "@/lib/shell/globalShellModel";
import { formatLastUpdated } from "@/lib/text/lastUpdated";

/** What a contextual chip hands the surface. `context` is live arithmetic the caller already did. */
export interface AskDetail {
  key: string;
  /** The result the reader was looking at, so "explain this" explains that one and not a page default. */
  familyId?: string | null;
  /** Paragraphs the calling surface computed from what is currently on screen. Wins over the static answer. */
  context?: readonly string[];
  /** Prefill the visible input with the question, so the reader sees what was asked on their behalf. */
  prefill?: boolean;
}

export default function AnswerSurface({
  classPrefix,
  askEvent,
  questions,
  valueStatement,
  inputLabel,
  placeholder,
  resolveAnswer,
  lastUpdatedIso,
  timezoneLabel,
  previewNotice,
  leadCount = LEAD_QUESTIONS_MAX,
}: {
  /** `lcs`, `lcfg`, `lcg` or `lcc` — the family's own class vocabulary, so nothing is restyled. */
  classPrefix: "lcs" | "lcfg" | "lcg" | "lcc";
  /**
   * The DOM event(s) a contextual chip on this page dispatches. Family-scoped, so two pages cannot cross-talk.
   *
   * An ARRAY is accepted because the State page has two historical entry events — `lcs-ai-select` from
   * `StateExplainAction` and `lcs-ai-ask` from `StateActionRow`. They are the same action under two names, which is
   * exactly the inconsistency §C2 is about; collapsing them into one name is a rename with call sites in
   * `stateEngagement.ts` and is left as a follow-up rather than folded into this pass. Both are listened for, so
   * every contextual entry reaches this one region today.
   */
  askEvent: string | readonly string[];
  questions: readonly AnswerQuestion[];
  /** One concise sentence: what the surface answers, and what bounds it. Never a feature pitch. */
  valueStatement: string;
  inputLabel: string;
  placeholder: string;
  /**
   * Resolve an answer for the selected question, optionally focused on the result a chip came from.
   *
   * Optional: a family whose answers are fully precomputed on the server passes nothing and the question's own
   * `answer` is used. The State page passes one because its answer depends on WHICH result the reader clicked.
   */
  resolveAnswer?: (key: string, familyId: string | null) => ResolvedAnswer | null;
  lastUpdatedIso?: string | null;
  timezoneLabel?: string;
  /**
   * A one-line statement that live generation is not connected, for a guarded review build.
   *
   * Rendered ONCE, above the questions — not above every answer, which is where the State page had it and which is
   * the repetitive-disclaimer shape §45 forbids. Omit it on a surface that makes no such claim.
   */
  previewNotice?: string;
  /** 3–5 (§C7). Four where labels are long, five otherwise. */
  leadCount?: number;
}) {
  const [selected, setSelected] = useState<AnswerQuestion | null>(null);
  const [typed, setTyped] = useState("");
  const [noMatch, setNoMatch] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  /** Live paragraphs a calling surface computed from what is on screen right now. */
  const [context, setContext] = useState<readonly string[] | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Contextual chips target this one region rather than owning their own panel — the mechanism that keeps
     FD-X-08's "one shared answer surface" true in the DOM and not only on paper. */
  useEffect(() => {
    const onAsk = (ev: Event) => {
      const d = (ev as CustomEvent<AskDetail>).detail;
      const match = questions.find((q) => q.key === d?.key);
      if (!match) return;
      setSelected(match);
      setFamilyId(d?.familyId ?? null);
      setContext(d?.context ?? null);
      setNoMatch(false);
      /* The reader sees the question that was asked on their behalf, rather than an answer appearing from nowhere. */
      setTyped(match.label);
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    const names = typeof askEvent === "string" ? [askEvent] : askEvent;
    for (const n of names) window.addEventListener(n, onAsk);
    return () => {
      for (const n of names) window.removeEventListener(n, onAsk);
    };
  }, [askEvent, questions]);

  const pick = (q: AnswerQuestion) => {
    setSelected(q);
    setTyped(q.label);
    setNoMatch(false);
    setContext(null);
    setFamilyId(null);
  };

  const submit = () => {
    const hit = matchQuestion(typed, questions);
    if (hit) {
      setSelected(hit);
      setNoMatch(false);
      setContext(null);
    } else {
      setSelected(null);
      setNoMatch(true);
    }
  };

  const lead = useMemo(() => questions.slice(0, leadCount), [questions, leadCount]);
  const rest = useMemo(() => questions.slice(leadCount), [questions, leadCount]);

  /* Live context wins: a question about what the reader is looking at is answered from what they are looking at. */
  const answer: ResolvedAnswer | null = selected
    ? context
      ? { paragraphs: context, computedFrom: [...selected.grounding], cannot: selected.boundary }
      : (resolveAnswer?.(selected.key, familyId) ?? selected.answer ?? null)
    : null;

  const p = classPrefix;

  return (
    <div
      className={`${p}-ai lc-answersurface`}
      /* The stable anchor GS-06 targets on every page, alongside the family's own section fragment. */
      id={SHARED_ASK_ANCHOR}
      data-ai-surface="shared"
      /* No provider, no fetch, no /api route, no account (§C0). Stated in the DOM so an audit can read it. */
      data-ai-connected="false"
      data-answer-mode="deterministic"
      data-question-count={questions.length}
    >
      <p className={`${p}-ai__value`}>{valueStatement}</p>

      {/* Stated once, at the top. The absence of a live model is a fact about the whole surface, not about one
          answer, and repeating it above every answer is what made it read as a disclaimer wall. */}
      {previewNotice ? (
        <p className={`${p}-ai__previewlabel`} data-ai-state="preview-not-connected">
          {previewNotice}
        </p>
      ) : null}

      {/* A REAL field. It genuinely matches what you type to a suggested question, so it is not the fake handler
          FD-S-08 forbids — and when it cannot match, it says so instead of answering something else. */}
      <form
        className={`${p}-ai__ask`}
        role="search"
        aria-label={inputLabel}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="lcs-vh" htmlFor={`${p}-ai-input`}>
          {inputLabel}
        </label>
        <input
          id={`${p}-ai-input`}
          className={`${p}-ai__input`}
          type="text"
          value={typed}
          placeholder={placeholder}
          autoComplete="off"
          data-ai-input="true"
          onChange={(e) => {
            setTyped(e.target.value);
            setNoMatch(false);
          }}
        />
        <button type="submit" className={`${p}-ai__askbtn`} data-ai-ask="true">
          Ask
        </button>
      </form>

      {/*
        §C7 — THE SUGGESTED QUESTIONS LEAD. Blank-box-first is nowhere on the site.

        SL-I11: these are OUR suggestions, phrased as questions a reader would ask. None is attributed to a member,
        none carries a count, and none implies anyone else asked it — fabricating community activity is prohibited
        (Constitution §17).
      */}
      <ul
        className={`${p}-promptlist`}
        aria-label="Suggested questions"
        data-prompt-count={questions.length}
        data-lead-count={lead.length}
      >
        {lead.map((q, i) => (
          <li key={q.key}>
            <button
              type="button"
              className={`${p}-prompt`}
              /* The first three carry more weight — a flat row of five equal pills gives a reader no way in. */
              data-rank={i < 3 ? "lead" : "rest"}
              data-prompt-key={q.key}
              aria-pressed={selected?.key === q.key}
              onClick={() => pick(q)}
            >
              {q.label}
            </button>
          </li>
        ))}
      </ul>

      {rest.length > 0 ? (
        <details className={`${p}-moreprompts`}>
          <summary>More questions</summary>
          <ul className={`${p}-promptlist`} aria-label="More suggested questions">
            {rest.map((q) => (
              <li key={q.key}>
                <button
                  type="button"
                  className={`${p}-prompt`}
                  data-prompt-key={q.key}
                  aria-pressed={selected?.key === q.key}
                  onClick={() => pick(q)}
                >
                  {q.label}
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className={`${p}-ai__panel`} ref={panelRef} role="status" aria-live="polite" data-ai-panel="true">
        {noMatch ? (
          <p data-ai-answer="no-match">{NO_MATCH_NOTICE}</p>
        ) : selected === null ? (
          <p className={`${p}-muted`}>{CHOOSE_PROMPT}</p>
        ) : (
          <>
            <p className={`${p}-ai__q`} data-ai-question={selected.key}>
              {selected.label}
            </p>

            {answer ? (
              <>
                <div className={`${p}-ai__answer`} data-ai-answer="computed">
                  {answer.paragraphs.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
                {/* FD-DAT-20: labelled by PROVENANCE. No AI badge, and no "an AI did not write this" either. */}
                <p className={`${p}-ai__provenance`} data-answer-label="provenance">
                  {ANSWER_LABEL}
                </p>

                {/*
                  §C2 — THE CONSISTENT "Where this came from" LINE, WITH THE DATE.

                  One name across both families, and it carries the SOURCES and the DATE together. The flagship's
                  version said "Where an answer would come from" and the State's said "Where this came from"; only
                  one printed a date, and it printed it in a separate paragraph outside the disclosure. A reader
                  judging an answer needs both facts in the same place.
                */}
                <details className={`${p}-ai__how`} data-answer-sources="true">
                  <summary>{SOURCES_SUMMARY}</summary>
                  <ul className={`${p}-srclist`}>
                    {answer.computedFrom.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                  {lastUpdatedIso ? (
                    <p className={`${p}-fine`} data-last-updated={lastUpdatedIso}>
                      Information as at {formatLastUpdated(lastUpdatedIso, timezoneLabel)}.
                    </p>
                  ) : null}
                  <p className={`${p}-fine`}>{answer.cannot}</p>
                </details>
              </>
            ) : (
              <div className={`${p}-ai__answer`} data-ai-answer="unavailable">
                {/* No prose is invented to fill the gap. Saying so is the whole point. */}
                <p>
                  This page does not hold what that question needs, so there is nothing to work out. Nothing has
                  been filled in to cover the gap.
                </p>
                <details className={`${p}-ai__how`} data-answer-sources="would">
                  <summary>{SOURCES_SUMMARY_UNAVAILABLE}</summary>
                  <ul className={`${p}-srclist`}>
                    {selected.grounding.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                  <p className={`${p}-fine`}>{selected.boundary}</p>
                </details>
              </div>
            )}
          </>
        )}
      </div>

      {/*
        SL-T03 — the AI disclosure, ONCE per surface, at the foot.

        Not per answer: Global Shell §45 forbids a section footer becoming a repetitive disclaimer block, and a
        sentence a reader sees seven times is a sentence they stop reading.
      */}
      <p className={`${p}-boundary`} data-ai-disclosure="SL-T03">
        {AI_DISCLOSURE}
      </p>
    </div>
  );
}
