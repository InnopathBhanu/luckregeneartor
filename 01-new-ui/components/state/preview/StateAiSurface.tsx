"use client";

/*
 * S-03 — THE STATE PAGE'S ANSWER SURFACE. §C2.
 *
 * Authority: `FD-X-08` (ONE shared answer surface for the page; the seven approved initial experiences), Global
 * Shell §10.3 (the four canonical State-page questions), §10.4 (one product identity), LRG-STATE-031 §8 (the two
 * founder-added prompts), `FD-DAT-20`, `FD-DAT-17`.
 *
 * ══ WHAT THIS FILE IS NOW ══
 *
 * The QUESTIONS and the ANSWER RESOLUTION. Everything else — the ask form, the chip rows, the answer panel, the
 * provenance line, the sources disclosure with its date, and the SL-T03 disclosure — is
 * `components/shell/AnswerSurface.tsx`, which the flagship hubs render too.
 *
 * REUSE CLASSIFICATION (`CLAUDE.md` §6): **MERGE**. 368 lines became this. Nothing was dropped: all seven
 * FD-X-08 experiences are still here, `previewAnswer` still computes every answer from this page's own governed
 * data, the `lcs-ai-select` and `lcs-ai-ask` events still work, and the class names are unchanged so nothing was
 * restyled.
 *
 * ══ TWO THINGS THAT VISIBLY CHANGED, BOTH DELIBERATE ══
 *
 *   1. **The `AI` attribution chip beside the question is gone.** It was the `FD-DAT-20` defect: these answers are
 *      arithmetic and transcribed operator text, so an AI badge misdescribed the surface. The answer is now labelled
 *      by its provenance, which is what the flagship already did correctly.
 *   2. **The separate "preview, not connected" line is gone**, folded into the one provenance sentence. Two lines
 *      saying the same thing above every answer was the repetitive-disclaimer shape §45 forbids. The fact that
 *      nothing live is connected is still stated — on the page banner, and in `data-ai-connected="false"`.
 */

import type { ResolvedFamily } from "@/lib/state/gameFamilyPresentation";
import { previewAnswer, PREVIEW_LABEL, type PreviewInputs } from "@/lib/state/stateAiPreview";
import AnswerSurface from "@/components/shell/AnswerSurface";
import type { AnswerQuestion } from "@/lib/ai/answerSurface";

/** Retained for the callers that import it. The shared contract is `AnswerQuestion`. */
export type AiPrompt = AnswerQuestion;

/**
 * The events contextual entries on the State page dispatch.
 *
 * TWO names for one action, and that is a recorded inconsistency rather than a design: `StateExplainAction` sends
 * `lcs-ai-select` and `StateActionRow` sends `lcs-ai-ask`. Both are listened for so every contextual entry reaches
 * this one surface (`FD-X-08`); collapsing them into a single name touches `stateEngagement.ts` and is left as a
 * follow-up rather than folded into this pass.
 */
export const STATE_ASK_EVENTS = ["lcs-ai-select", "lcs-ai-ask"] as const;

export default function StateAiSurface({
  stateName,
  operatorName,
  resultSource,
  lastUpdated,
  timezoneLabel,
  howToClaimUrl,
  addOnLabel = null,
  families,
  purchaseReaderNote,
  daysOld = null,
}: {
  stateName: string;
  operatorName: string;
  resultSource: string;
  lastUpdated: string | null;
  timezoneLabel: string;
  howToClaimUrl: string | null;
  /**
   * The jurisdiction's own DRAWN add-on, derived from the rendered results (Florida's is Fireball).
   *
   * Passed in rather than hardcoded so the prompt names the real add-on for whichever State renders, and so the
   * prompt disappears entirely for a State that has none (`FD-X-01`).
   */
  addOnLabel?: string | null;
  /** The page's own resolved families — every answer is computed from these. */
  families: readonly ResolvedFamily[];
  /** Reader-facing purchase status from the governed commerce capability record. */
  purchaseReaderNote: string | null;
  daysOld?: number | null;
}) {
  /*
   * FD-X-08 approved five initial experiences. LRG-STATE-031 §8 names two more on FOUNDER AUTHORITY (tier 1):
   *
   *   - "Why do Midday and Evening show different dates?" — the single most likely question the family-panel model
   *     provokes. Grouping Midday and Evening under one identity is right, and it makes differing dates newly
   *     visible; a reader who cannot get that explained will read it as a bug.
   *   - "Explain Buy Now options" — Florida's purchase picture is unverified, so the honest explanation of what Buy
   *     Now does is itself a useful answer.
   *
   * Recorded as an extension rather than absorbed silently. Ordered so the FOUR that lead are the ones §7 names;
   * the labels are short enough to sit on one line each at 375px, because a question that wraps to two lines reads
   * as a paragraph rather than as a choice.
   */
  const questions: AnswerQuestion[] = [
    {
      key: "explain-result",
      label: `Explain the latest ${stateName} result`,
      grounding: [resultSource, "Governed result-format definitions"],
      boundary:
        "Describes a published result and its format. Cannot tell you whether a ticket won — that is a "
        + "deterministic check against the official operator.",
    },
    {
      key: "variant-dates",
      label: "Why do Midday and Evening have different dates?",
      grounding: [
        resultSource,
        `Verified ${stateName} draw schedule (${timezoneLabel})`,
        "Governed game-family composition",
      ],
      boundary:
        "Explains that a midday and an evening draw are separate games with separate results, so the latest "
        + "verified result for each can be from a different day. Cannot tell you a result that has not been "
        + "published.",
    },
    {
      /* Named from the jurisdiction's real drawn add-on, so this reads "What does Fireball mean?" in Florida and
         names the correct add-on elsewhere. Falls back to the generic question where none exists. */
      key: "explain-game",
      label: addOnLabel ? `What does ${addOnLabel} mean?` : "Explain this game or add-on",
      grounding: ["Governed format definitions", `${operatorName} published game rules`],
      boundary:
        "Explains how a game, multiplier or add-on works. Cannot recommend a game to play or compare games by "
        + "desirability.",
    },
    {
      key: "next-draw",
      label: `When is the next ${stateName} draw?`,
      grounding: [`Verified ${stateName} draw schedule (${timezoneLabel})`],
      boundary:
        "Explains the published schedule. The timezone conversion itself is calculated deterministically, not "
        + "generated.",
    },
    {
      key: "buy-now-options",
      label: "Explain my Buy Now options",
      grounding: [
        `${operatorName} published purchase and retailer information`,
        "LotteryCorner purchase-option records for this state",
      ],
      boundary:
        "Explains what Buy Now does and what is currently verified for this state. Cannot sell a ticket, cannot "
        + "confirm your eligibility, and will never present a partner as the official lottery.",
    },
    {
      key: "what-changed",
      label: "What changed since my last visit?",
      grounding: [resultSource, "Previously published draw for the same game"],
      boundary:
        "Compares two published draws. Cannot suggest what may be drawn next — past results do not change future "
        + "odds.",
    },
    {
      key: "claim-steps",
      label: `Explain official ${stateName} claim steps`,
      grounding: [
        `${operatorName} official claim guidance`,
        ...(howToClaimUrl ? [howToClaimUrl] : []),
      ],
      boundary:
        "Explains the operator's published claim routes. Cannot determine your eligibility, cannot give tax "
        + "advice, and cannot replace the official claim process.",
    },
  ];

  /*
   * The answer, computed from the page's own governed data.
   *
   * `familyId` is why this page passes a resolver rather than precomputing on the server: a contextual Explain
   * action carries the family the reader was actually looking at, so "explain the latest result" explains THAT
   * result rather than a page default (LRG-STATE-034 §4).
   */
  const resolve = (key: string, familyId: string | null) => {
    const inputs: PreviewInputs = {
      stateName, operatorName, resultSource, timezoneLabel,
      lastUpdatedDate: lastUpdated ? lastUpdated.slice(0, 10) : null,
      daysOld,
      families,
      focusFamily: familyId ? families.find((f) => f.familyId === familyId) ?? null : null,
      addOnLabel,
      purchaseReaderNote,
    };
    return previewAnswer(key, inputs);
  };

  return (
    <AnswerSurface
      classPrefix="lcs"
      askEvent={STATE_ASK_EVENTS}
      questions={questions}
      valueStatement={
        `Ask about ${stateName} results, games, draw times and the official claim process. Every answer is `
        + "restricted to the sources listed with the question — never to a guess."
      }
      inputLabel={`Ask a question about ${stateName} lottery results`}
      placeholder={`Ask about ${stateName} results, games or draw times`}
      resolveAnswer={resolve}
      previewNotice={PREVIEW_LABEL}
      lastUpdatedIso={lastUpdated}
      timezoneLabel={timezoneLabel}
      /* Four, not five: these labels are the longest on the site and a fifth pushed the row to three lines at
         375px. Still inside §C7's 3-5. */
      leadCount={4}
    />
  );
}
