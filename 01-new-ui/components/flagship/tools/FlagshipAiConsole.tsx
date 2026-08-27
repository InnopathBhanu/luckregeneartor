"use client";

/*
 * FG-03 — THE FLAGSHIP HUB'S ANSWER SURFACE. §C2.
 *
 * Authority: BP-04A §17 and §46 (*"no prediction claim"*), BP-05C §12, the frozen Constitution §17 (*"AI is
 * contextual, clearly labelled, and supportive … A single floating chat button is not an AI strategy"*),
 * `DATA-DEC-001` `FD-DAT-02` (AI execution is an Account action), `FD-DAT-20` (a deterministic summary is not an AI
 * execution and must not be described as one).
 *
 * ══ WHAT THIS FILE IS NOW ══
 *
 * The QUESTIONS this hub asks, mapped from `model.ai`, plus the contextual chip. Everything else — the ask form,
 * the chip rows, the answer panel, the provenance line, the sources disclosure with its date and the SL-T03
 * disclosure — is `components/shell/AnswerSurface.tsx`, which the State page renders too.
 *
 * REUSE CLASSIFICATION (`CLAUDE.md` §6): **MERGE**. 304 lines became this. Nothing behavioural was dropped: the
 * `lcfg-ai-ask` event still works, live `context` from the explorer and the Stats Lab still wins over the static
 * answer, the typed box still matches deterministically at the same threshold and still refuses to answer a
 * different question, and every class name is unchanged so nothing was restyled.
 *
 * ══ WHAT CHANGED ══
 *
 * The sources disclosure now carries the DATE alongside the sources, and it is called "Where this came from" — the
 * same name the State page uses. This file previously called it "Where an answer would come from" even for an
 * answer that existed, and printed the date in a separate paragraph outside the disclosure. A reader judging an
 * answer needs both facts in one place.
 *
 * ══ WHAT DELIBERATELY DID NOT CHANGE ══
 *
 * There is still no provider, no fetch, no `/api` route and no account (§C0). A computed answer is still labelled
 * by its provenance with no AI badge and no "an AI did not write this" disclaimer either, which is `FD-DAT-20`
 * applied in both directions.
 */

import type { AiSurface } from "@/lib/flagship/flagshipContract";
import { AI_NOT_CONNECTED_LABEL } from "@/lib/flagship/flagshipAi";
import AnswerSurface, { type AskDetail } from "@/components/shell/AnswerSurface";
import type { AnswerQuestion } from "@/lib/ai/answerSurface";

export const AI_ASK_EVENT = "lcfg-ai-ask";

/** What a contextual chip may hand the answer region. Retained for existing callers. */
export type AiAskDetail = AskDetail;

/** Ask the shared answer region a question, optionally with live context computed by the caller. */
export function askFlagshipAi(detail: AiAskDetail): void {
  window.dispatchEvent(new CustomEvent(AI_ASK_EVENT, { detail }));
}

export default function FlagshipAiConsole({
  gameLabel,
  surfaces,
  lastUpdatedIso,
}: {
  gameLabel: string;
  surfaces: readonly AiSurface[];
  lastUpdatedIso: string | null;
}) {
  /*
   * The governed surfaces, mapped onto the shared question contract.
   *
   * `deterministicAnswer` is `null` where the page does not hold what the question needs, and that maps to
   * `answer: null` — which the shared surface renders as a stated gap plus the sources an answer WOULD have used.
   * No prose is invented to fill it.
   */
  const questions: AnswerQuestion[] = surfaces.map((s) => ({
    key: s.key,
    label: s.label,
    grounding: s.grounding,
    boundary: s.boundary,
    answer: s.deterministicAnswer
      ? {
          paragraphs: s.deterministicAnswer,
          computedFrom: s.grounding,
          cannot: s.boundary,
        }
      : null,
  }));

  return (
    <AnswerSurface
      classPrefix="lcfg"
      askEvent={AI_ASK_EVENT}
      questions={questions}
      valueStatement={
        `Ask about the ${gameLabel} drawing, the rules, the multiplier, the real odds and what to check on a `
        + "ticket. Every answer is restricted to the sources listed with the question."
      }
      inputLabel={`Ask a question about ${gameLabel}`}
      placeholder={`Ask about the ${gameLabel} drawing, rules or odds`}
      /* Stated once, above the questions: no model is connected to this build. The per-answer repetition it used
         to have is what §45 calls a repetitive disclaimer block. */
      previewNotice={AI_NOT_CONNECTED_LABEL}
      lastUpdatedIso={lastUpdatedIso}
      timezoneLabel="ET"
    />
  );
}

/**
 * A contextual prompt chip.
 *
 * Rendered inside the section its question belongs to, so the AI entry is relevant to the surface rather than a
 * single button floating over the page (Constitution §17). Activating it selects the question in the ONE shared
 * answer region — the chip owns no panel of its own, which is what keeps `FD-X-08` true in the DOM.
 */
export function FlagshipAskChip({
  surfaceKey,
  label,
  anchor,
  context,
  tier,
  icon,
}: {
  surfaceKey: string;
  label: string;
  anchor: string;
  /** Live context computed by the calling surface, where the question is about what is currently on screen. */
  context?: readonly string[];
  /** Set when the chip is acting as one of the hero's primary actions rather than a contextual ask. */
  tier?: "secondary";
  icon?: React.ReactNode;
}) {
  return (
    <a
      className={tier ? "lcfg-btn" : "lcfg-chip lcfg-chip--ask"}
      data-tier={tier}
      href={anchor}
      data-ask-key={surfaceKey}
      onClick={() => askFlagshipAi({ key: surfaceKey, ...(context ? { context } : {}) })}
    >
      {icon}
      {label}
    </a>
  );
}
