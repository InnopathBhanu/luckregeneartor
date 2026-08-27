/*
 * COMMUNITY AI PARTICIPATION — the frozen Constitution §31 (AI Forum Policy, Tiers A–D), §32 (one identity),
 * §33 (AI Trust Contract), 08 §9 (AI participation rules), 08B §8 (FE-06), 08D Templates G/H.
 *
 * ══ WHAT THIS MODULE IS ══
 *
 * The DETERMINISTIC review-mode stand-in for the tier policy: a classifier that reads a reviewer-posted
 * question and decides which §31 tier governs the response, and a response PLAN per tier that the FE-06
 * section renders. No model is connected (§C0), so nothing here generates prose — Tier A yields either a
 * grounded pointer set or an honest "this build does not hold that fact", never an invented paragraph.
 *
 * ══ THE TIERS, AS RATIFIED ══
 *
 *   Tier A — verifiable factual questions (rules, draw times, odds, purchase availability, history).
 *            A labelled response may come quickly, states what was checked, links sources, invites experience.
 *   Tier B — experience and opinion questions. HUMAN-FIRST: no automatic reply at all.
 *   Tier C — high-consequence questions (claims, tax, anonymity, damaged tickets, legal, fraud).
 *            Official-source context ONLY, plus direction to official or qualified human help. Never prose
 *            that could be taken as personal legal/tax advice (§33: no personalized legal or tax conclusions).
 *   Tier D — personal distress and responsible play. NO routine response of any kind — a private support
 *            pathway, moderation and human escalation instead.
 *
 * Classification is deliberately conservative in one direction: distress outranks everything (a message that
 * is both a tax question and a distress signal is Tier D), and high-consequence outranks factual.
 */

import type { ResolvedAnswer } from "@/lib/ai/answerSurface";

export type AiForumTier = "A" | "B" | "C" | "D";

/* ------------------------------------------------------------------ markers */

/** Tier D — distress and responsible-play markers (08 §24's detection list, in player language). */
const DISTRESS_MARKERS: readonly RegExp[] = [
  /\bchas(?:e|ing)\s+(?:my\s+)?loss/i,
  /\bwin\s+(?:it\s+)?back\b/i,
  /\bborrow(?:ed|ing)?\b.*\b(?:play|ticket|lottery)|\b(?:play|ticket|lottery)\b.*\bborrow(?:ed|ing)?\b/i,
  /\bcan(?:'|no)?t\s+stop\b/i,
  /\bcan(?:'|no)?t\s+afford\b/i,
  /\bspen[dt]\w*\s+(?:too\s+much|more\s+than)/i,
  /\bout\s+of\s+control\b/i,
  /\bgambling\s+problem\b/i,
  /\brent\s+money|grocery\s+money\s+on\b/i,
  /\bdesperate\b/i,
  /\bin\s+debt\b/i,
];

/** Tier C — high-consequence markers (§31's own list). */
const HIGH_CONSEQUENCE_MARKERS: readonly RegExp[] = [
  /\bclaim(?:ing|ed)?\b/i,
  /\btax(?:es|ed)?\b/i,
  /\banonym/i,
  /\bdamaged\s+ticket|\bticket\s+(?:washed|torn|ripped|destroyed|lost)/i,
  /\blost\s+ticket\b/i,
  /\blawyer|attorney|legal\b/i,
  /\blawsuit|sue\b/i,
  /\bfraud|stolen\b/i,
  /\btrust\s+(?:fund|structure)\b/i,
  /\bdispute\b/i,
];

/** Tier A — verifiable-fact markers. Checked only after C and D have not matched. */
const FACTUAL_MARKERS: readonly RegExp[] = [
  /\bwhat\s+time\b/i,
  /\bdraw(?:ing)?\s+time/i,
  /\bhow\s+do(?:es)?\b.*\bwork\b/i,
  /\bwhat\s+are\s+the\s+odds\b/i,
  /\bodds\s+of\b/i,
  /\brules?\b/i,
  /\bfireball|power\s*play|megaplier|double\s+play\b/i,
  /\bhow\s+many\s+numbers\b/i,
  /\bwhen\s+(?:is|are|do|does)\b/i,
  /\bwhere\s+(?:can|do)\s+i\s+(?:buy|check)\b/i,
  /\bcut[- ]?off\b/i,
  /\bschedule\b/i,
];

/* ------------------------------------------------------------------ the classifier */

/**
 * Which §31 tier governs a question. Precedence: D (distress) > C (high-consequence) > A (verifiable fact) > B.
 *
 * Tier B is the DEFAULT on purpose: 08 §9 says AI normally does not lead, and an unclassifiable post is
 * treated as human conversation rather than as a fact request — the failure mode of guessing "factual" is an
 * automatic reply landing on a social post, which is exactly what the blueprint forbids.
 */
export function classifyForumTier(text: string): AiForumTier {
  if (DISTRESS_MARKERS.some((m) => m.test(text))) return "D";
  if (HIGH_CONSEQUENCE_MARKERS.some((m) => m.test(text))) return "C";
  if (FACTUAL_MARKERS.some((m) => m.test(text))) return "A";
  return "B";
}

/* ------------------------------------------------------------------ the response plans */

export type AiResponsePlan =
  /** Tier A: the shared answer surface renders, grounded; with no fact held, the honest gap — never prose. */
  | {
      tier: "A";
      kind: "deterministic-answer-surface";
      question: string;
      /** Pre-resolved when this build can answer deterministically; null renders the honest-gap state. */
      answer: ResolvedAnswer | null;
      grounding: readonly string[];
      boundary: string;
      /** 08 §9 — an AI-only answer still asks for lived experience. */
      invitation: string;
    }
  /** Tier B: human-first. NO automatic reply — the section states why nothing was generated. */
  | { tier: "B"; kind: "human-first-none"; note: string }
  /** Tier C: official-source pointers and qualified-help direction only. No generated prose. */
  | {
      tier: "C";
      kind: "official-source-context";
      question: string;
      answer: ResolvedAnswer;
    }
  /** Tier D: no routine response. A private support pathway instead. */
  | { tier: "D"; kind: "support-pathway"; support: readonly string[] };

/** The Tier B sentence — rendered by FE-06 when it stays silent, so the silence is a decision, not a gap. */
export const TIER_B_NOTE =
  "This looks like a question for players, so no automatic answer is added — real experience comes first. "
  + "LotteryCorner Research joins a discussion only when a checkable fact needs it.";

/** The Tier D support pathway. Non-judgmental, private, and free of any play prompt (08 §24). */
export const TIER_D_SUPPORT: readonly string[] = Object.freeze([
  "It sounds like lottery play may be causing stress. You are not alone, and support is free and confidential.",
  "Call or text 1-800-MY-RESET — free, confidential support, available 24/7.",
  "You can also step away at any time. Nothing on this page asks you to spend anything.",
]);

/** Tier C boundary — §33: no personalized legal or tax conclusions, ever. */
const TIER_C_BOUNDARY =
  "This cannot tell you what to do in your own case. Claim, tax and legal questions turn on your state and "
  + "your circumstances — the official lottery and a qualified professional are the right sources.";

/**
 * The FE-06 plan for a reviewer-posted entry, from its title and body.
 *
 * Deterministic and reviewable: the same words always produce the same plan, and the plan never contains
 * generated prose — Tier C's paragraphs are fixed official-source direction, Tier A resolves only what this
 * build genuinely holds (today: nothing, so the honest gap renders with its grounding).
 */
export function aiResponsePlanFor(title: string, body: string): AiResponsePlan {
  const text = `${title}\n${body}`;
  const tier = classifyForumTier(text);

  switch (tier) {
    case "D":
      return { tier, kind: "support-pathway", support: TIER_D_SUPPORT };
    case "C":
      return {
        tier,
        kind: "official-source-context",
        question: title,
        answer: {
          paragraphs: [
            "This is a high-consequence question, so the only safe pointers are official ones.",
            "Your state lottery's own claim page and phone line are the authority on claiming, deadlines, "
              + "anonymity and damaged or disputed tickets — start there before acting on anything you read "
              + "in a discussion.",
            "For tax or legal questions, a qualified professional (a CPA or an attorney licensed in your "
              + "state) is the right direction. Community replies here are experience, not advice.",
          ],
          computedFrom: [
            "The official state lottery — the only authority on claims, deadlines and ticket disputes",
            "A licensed professional in your state, for tax or legal specifics",
          ],
          cannot: TIER_C_BOUNDARY,
        },
      };
    case "A":
      return {
        tier,
        kind: "deterministic-answer-surface",
        question: title,
        /* No governed fact store is connected to the community surface in this build, so no deterministic
           answer exists to resolve. The honest gap renders — never an invented paragraph. */
        answer: null,
        grounding: [
          "The game's own page on this site (rules, schedule and latest results)",
          "The official lottery's published game rules",
        ],
        boundary:
          "Nothing here can tell you which numbers to play, and no past result changes the odds of a "
          + "future drawing.",
        invitation: "Player experience wanted — if you play this game, your answer helps more than ours.",
      };
    case "B":
      return { tier, kind: "human-first-none", note: TIER_B_NOTE };
  }
}
