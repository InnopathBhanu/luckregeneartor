/*
 * THE ONE AI IDENTITY — §C2.
 *
 * Authority: Global Shell v1.1 §10.4 (*"Use one consistent non-human product identity"* and the four approved
 * names), §10.2 (the first-answer rule), SL-T03 (*"Material AI roles are clearly identified"*), SL-I11 (Related
 * Question); the frozen Constitution §17 (*"AI is contextual, clearly labelled, and supportive … A single floating
 * chat button is not an AI strategy"*, and *"MUST NOT create AI accounts that appear human"*); `FD-X-08` (ONE
 * shared answer surface per page, never one chatbot per section); `DATA-DEC-001` `FD-DAT-20` (a deterministic
 * computation is not an AI execution and must not be described as one, in either direction) and `FD-DAT-17` (a
 * model-executed Ask surface is ABSENT, not gated-and-dead).
 *
 * ══ WHAT WAS INCONSISTENT ══
 *
 * Two answer surfaces existed and they disagreed about almost everything a reader would notice. Measured:
 *
 *   the name          "Ask LotteryCorner AI about Florida" (State, in the form's accessible label) versus
 *                     "Ask about Powerball" (flagship). Home's header said "LotteryCorner AI", the mobile header
 *                     said "Explore AI", and `StateExplainAction` said "Explain".
 *   the answer label  State printed an `AI` attribution chip beside the question and a separate "preview, not
 *                     connected" line. The flagship printed neither and used a provenance sentence instead —
 *                     which is the `FD-DAT-20`-correct behaviour, so State's chip was the defect.
 *   the sources       State: a `<details>` reading "Where this came from". Flagship: a `<details>` reading "Where
 *                     an answer would come from". Same disclosure, two names, and only one of them said the DATE.
 *   the disclaimer    Flagship carried a standing boundary sentence; State carried a per-question one; neither
 *                     carried SL-T03 as a reusable thing.
 *
 * ══ WHAT THIS MODULE FIXES, AND WHAT IT DELIBERATELY DOES NOT ══
 *
 * It fixes the vocabulary and the contract. Every approved label is a constant here, so a family cannot invent a
 * fifth name for the same thing, and the answer block's shape — question, answer, provenance, date, disclosure — is
 * one component (`components/shell/AnswerSurface.tsx`) that both families render.
 *
 * It does NOT connect a model. Nothing here fetches, no provider is named, no `/api` route exists and no account
 * is required, per §C0. Every answer is deterministic computation over the page's own governed data, which is why
 * `ANSWER_LABEL` describes provenance rather than claiming AI: `FD-DAT-20` rules that attaching an AI label to
 * arithmetic misdescribes the surface, and that disclaiming AI raises the idea where it does not arise.
 */

/* ------------------------------------------------------------------ §10.4 the approved names */

/**
 * The four names Global Shell §10.4 approves, and nothing else.
 *
 * `askDesktop` / `askMobile` are the same action at two widths — §10.4's own compact form — not two products. The
 * generic bare "Ask AI" survives ONLY as the mobile label, because at 375px the product name does not fit beside a
 * brand mark and a search field, and a truncated product name is worse than a short generic one.
 */
export const AI_IDENTITY = Object.freeze({
  /** GS-06, desktop. Names the product, so the capability is identifiable. */
  askDesktop: "Ask LotteryCorner",
  /** GS-06, mobile. §10.4's compact form. */
  askMobile: "Ask AI",
  /** §10.4 — an observation about a published result. */
  drawInsight: "Draw Insight",
  /** §10.4 — a summary. */
  quickTake: "AI Quick Take",
  /** §10.4 — a factual contribution in community. Not used in this phase; recorded so it cannot be reinvented. */
  researchNote: "LotteryCorner Research Note",
});

/** Every approved name, for the audit test. A label outside this set is a new product identity. */
export const APPROVED_AI_LABELS: readonly string[] = Object.freeze(Object.values(AI_IDENTITY));

/* ------------------------------------------------------------------ the answer block's copy */

/**
 * How a computed answer is labelled.
 *
 * `FD-DAT-20`, exactly: it is labelled by its PROVENANCE. There is no AI badge, because no model produced it — and
 * there is no "an AI did not write this" disclaimer either, because disclaiming AI raises the idea where it does
 * not arise. One sentence, saying what the answer actually is.
 */
export const ANSWER_LABEL =
  "Worked out from the results and rules already on this page. No prediction is made or implied.";

/** The one name for the sources disclosure. "Where this came from" — past tense, because the answer exists. */
export const SOURCES_SUMMARY = "Where this came from";

/**
 * The name used when the page holds no answer for a question.
 *
 * Future tense, deliberately, and it is a different sentence from `SOURCES_SUMMARY` because it describes a
 * different thing: what an answer WOULD be built from, if the page held the facts.
 */
export const SOURCES_SUMMARY_UNAVAILABLE = "Where an answer would come from";

/**
 * SL-T03 — the AI disclosure, as one reusable string.
 *
 * §125: *"Material AI roles are clearly identified."* This is the standing statement for an answer surface, and it
 * covers both halves of the honest position: what the surface does today, and what it will never do. It is rendered
 * ONCE per surface, at the foot — not per answer, which would make it the repetitive disclaimer block Global Shell
 * §45 forbids.
 */
export const AI_DISCLOSURE =
  "Answers are put together from published results, official schedules and game rules — never from a prediction. "
  + "Nothing here can tell you which numbers to play, and no past result changes the odds of a future drawing.";

/**
 * What the surface says when a reader types something it cannot match.
 *
 * It never answers a DIFFERENT question, which is the failure mode a fuzzy matcher invites. `FD-DAT-17`: the
 * model-executed surface is absent, and saying so plainly is the honest form of that absence.
 */
export const NO_MATCH_NOTICE =
  "This page can only answer the questions above. Pick one, or rephrase using the words in a suggestion.";

/** The empty state, before a question is chosen. States what the reader will get, not what the product is. */
export const CHOOSE_PROMPT =
  "Choose a question. You will see the answer this page can already work out, and where it came from.";

/* ------------------------------------------------------------------ the contract */

/** One resolved answer: the prose, what it was computed from, and what it cannot do. */
export interface ResolvedAnswer {
  paragraphs: readonly string[];
  /** The governed sources the arithmetic ran over. Rendered under `SOURCES_SUMMARY`. */
  computedFrom: readonly string[];
  /** The boundary — what this answer cannot tell the reader. Never omitted. */
  cannot: string;
}

/**
 * One suggested question.
 *
 * ══ WHY `answer` IS OPTIONAL AND `grounding` IS NOT ══
 *
 * A question whose answer the page cannot compute still has to declare its GROUNDING and its BOUNDARY, because
 * that is what a reader needs in order to trust the surface at all — and `FD-X-08` requires the guardrails to be
 * reviewable as part of the interaction rather than only in documentation. So an unanswerable question renders its
 * sources and its limits and says the page does not hold the facts; it never renders invented prose.
 */
export interface AnswerQuestion {
  key: string;
  /** The question as a reader would ask it. Short enough to sit on one line at 375px. */
  label: string;
  /** The governed sources an answer would be restricted to. */
  grounding: readonly string[];
  /** What an answer to this question can never do. */
  boundary: string;
  /** The precomputed deterministic answer, where the page holds one. */
  answer?: ResolvedAnswer | null;
}

/**
 * How many questions lead a surface before the rest are disclosed.
 *
 * §C7 requires 3–5. Five is the maximum and four is used where labels are long: seven full-width questions made
 * the State module tall enough to read as a form, which is the measured reason disclosure exists here at all.
 * Nothing is dropped — every question stays in the server HTML inside a `<details>`, so it is findable by in-page
 * search and by a crawler.
 */
export const LEAD_QUESTIONS_MIN = 3;
export const LEAD_QUESTIONS_MAX = 5;

/**
 * Match typed text to a suggested question by word overlap.
 *
 * Deterministic, and it never guesses: below the threshold it returns `null` so the caller can say it cannot answer
 * that — rather than answering something else, which is the specific harm a confident fuzzy matcher does on a page
 * about money.
 *
 * Extracted here because both families had the same 15-line implementation with the same 0.34 threshold, and two
 * copies of a matcher is two thresholds waiting to diverge.
 */
export function matchQuestion<T extends { label: string }>(
  typed: string,
  questions: readonly T[],
  threshold = 0.34,
): T | null {
  const q = typed.trim().toLowerCase();
  if (!q) return null;
  const scored = questions
    .map((s) => {
      const words = s.label.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const hits = words.filter((w) => q.includes(w)).length;
      return { s, score: words.length ? hits / words.length : 0 };
    })
    .sort((a, b) => b.score - a.score)[0];
  return scored && scored.score >= threshold ? scored.s : null;
}
