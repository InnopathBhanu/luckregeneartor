/*
 * ASK THE ARCHIVE — DETERMINISTIC INTERPRETATION — LRG-ARCHIVE-054.
 *
 * Authority: brief §8 AR-06 (*"AI translates and explains. Deterministic code performs the search and
 * calculations. At least one complete public answer must render without requiring sign-in."*), blueprint §13
 * (required output: interpreted query, applied filters, matching count, matching rows, plain-language
 * explanation), content template A8 and Template G (the empty-result shape); Constitution §AI (*"AI MUST be
 * clearly identified"*, never assert certainty or imply history changes odds); brief §2 out-of-scope
 * (*"Real AI-provider integration"*).
 *
 * ══ WHAT THIS MODULE IS ══
 *
 * The TRANSLATION half of Ask the Archive, implemented as a deterministic parser rather than a model call. It
 * turns a natural-language question into an `ArchiveFilterInput`, hands that to the deterministic filter, and
 * describes what it did.
 *
 * ══ WHY A PARSER AND NOT A MODEL, AND WHY THAT IS THE HONEST CHOICE ══
 *
 * Real provider integration is explicitly out of scope. The dishonest options would be to stub a model and
 * present its output as generated, or to hand-write an answer and let the label imply a model produced it. Both
 * would make the page a false statement about how it works.
 *
 * A parser is honest in a way a stub is not: it genuinely interprets the reader's question, it genuinely reports
 * what it understood, and when it does not understand it SAYS so instead of inventing an interpretation. The
 * answer block names this — see `INTERPRETER_DISCLOSURE` — so nobody reviewing the page can mistake it for a
 * live model.
 *
 * The architectural point the brief actually cares about survives intact: **the search and every number come
 * from deterministic code.** Replacing this parser with a provider later changes only how a question becomes an
 * `ArchiveFilterInput`; it cannot change a count, a row or an explanation, because those are computed here.
 *
 * ══ WHAT IT WILL NOT DO ══
 *
 * It will not guess. An uninterpretable question returns `understood: false` with Template G's suggestions,
 * because answering a question you did not understand with a confident row list is worse than saying you did not
 * understand it.
 */

import type { FormatProfile } from "../game/gameFormatProfile";
import {
  STATISTICS_NEUTRALITY, consecutiveSummary, historicalGaps, type DrawRecord,
} from "../game/digitHistoryAnalysis";
import type {
  ArchiveAskAnswer, ArchiveDrawRow, ArchiveFilterInput, ResultShape,
} from "./archiveContract";
import { defaultArchiveFilter, filterArchive } from "./archiveFilter";
import { monthKeyOf, monthLabel } from "./archiveYear";

/**
 * The honesty disclosure rendered inside the answer block.
 *
 * Required reading for anyone reviewing this page: it states that the interpretation is deterministic and that
 * no model produced or verified the answer. The Constitution's AI-labelling rule is satisfied by saying what is
 * true, not by omitting the label.
 */
export const INTERPRETER_DISCLOSURE =
  "This preview interprets your question with deterministic rules, not a live AI model. The filters, the count " +
  "and every row below come from the same deterministic search the controls above use.";

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/* ------------------------------------------------------------------ interpretation */

/**
 * An aggregate intent — a question about the archive as a whole rather than a request for matching rows.
 *
 * ══ WHY THIS IS A SEPARATE SHAPE ══
 *
 * "When did 1-2-3 appear" narrows to rows. "How often were two values adjacent" does not: the answer is a count
 * over every drawing, and filtering to a subset would answer a different question. The V0 could only express the
 * first kind, so an aggregate question fell through to `understood: false` — honest, and unhelpful for two
 * questions the archive can genuinely answer from data it already computes.
 *
 * Both kinds still end in the same place: a figure, an explanation, and rows a reader can check.
 */
export type AskAggregate = "consecutive" | "gaps";

export interface AskInterpretation {
  filter: ArchiveFilterInput;
  /** Reader-facing interpreted conditions, in the order they were understood. */
  lines: readonly { label: string; value: string }[];
  understood: boolean;
  /** What the parser recognised, for the explanation sentence. */
  recognised: {
    month: number | null;
    variantLabel: string | null;
    numberText: string | null;
    orderMode: "exact" | "any" | null;
    shape: ResultShape | null;
    /** Set when the question asks for an archive-wide figure rather than matching rows. */
    aggregate: AskAggregate | null;
  };
}

/**
 * Interpret a question against this game's format and members.
 *
 * Recognises: a month name; a variant label (matched against the family's OWN labels, so nothing is hardcoded);
 * a number of the main group's exact length; explicit order vocabulary; and shape words. Everything else is
 * ignored rather than guessed at.
 */
export function interpretArchiveQuestion(
  question: string,
  profile: FormatProfile,
  members: readonly { gameId: number; variantLabel: string }[],
  year: number,
): AskInterpretation {
  const q = question.toLowerCase();
  const filter = defaultArchiveFilter();
  const lines: { label: string; value: string }[] = [];
  const recognised: AskInterpretation["recognised"] = {
    month: null, variantLabel: null, numberText: null, orderMode: null, shape: null, aggregate: null,
  };

  /* ---- month ---- */
  const monthIndex = MONTH_NAMES.findIndex((m) => new RegExp(`\\b${m}\\b`).test(q));
  if (monthIndex >= 0) {
    filter.monthKey = monthKeyOf(year, monthIndex + 1);
    recognised.month = monthIndex + 1;
    lines.push({ label: "Month", value: monthLabel(monthIndex + 1) });
  }

  /*
   * ---- variant, from the family's own labels ----
   *
   * `Midday`, `Evening`, `Late Night` — whatever this family calls its members. Nothing here knows that Pick 3
   * has two draws or what they are called, so a five-draw family works with no change.
   */
  for (const m of members) {
    if (!m.variantLabel) continue;
    if (new RegExp(`\\b${m.variantLabel.toLowerCase().replace(/\s+/g, "\\s+")}\\b`).test(q)) {
      filter.variant = { gameId: m.gameId };
      recognised.variantLabel = m.variantLabel;
      lines.push({ label: "Drawing", value: m.variantLabel });
      break;
    }
  }

  /* ---- a number of exactly the main group's length ---- */
  const main = profile.main;
  if (main) {
    if (main.valueType === "digit") {
      /* A contiguous run of exactly `count` digits. Bounded on both sides so a date like `2026` is not read as
         a Pick 4 selection and `1234` is not truncated into a Pick 3 one. */
      const m = q.match(new RegExp(`(?<!\\d)(\\d{${main.count}})(?!\\d)`));
      if (m) {
        filter.raw = { [main.key]: [m[1]] };
        recognised.numberText = m[1];
        lines.push({ label: "Number", value: m[1] });
      }
    } else {
      /* A space/comma separated list of exactly `count` numbers. */
      const nums = q.match(/\d{1,2}/g) ?? [];
      if (nums.length === main.count) {
        filter.raw = { [main.key]: nums };
        recognised.numberText = nums.join(", ");
        lines.push({ label: "Numbers", value: nums.join(", ") });
      }
    }
  }

  /* ---- order vocabulary, only where order is a real distinction ---- */
  if (main?.semantics.matchOrdered && recognised.numberText) {
    if (/\b(any order|boxed|box|in any)\b/.test(q)) {
      filter.orderMode = "any";
      recognised.orderMode = "any";
    } else {
      filter.orderMode = "exact";
      recognised.orderMode = "exact";
    }
    lines.push({
      label: "Match mode",
      value: filter.orderMode === "exact" ? "Exact order" : "Any order",
    });
  }

  /* ---- shape words, only where the format can produce the shape ---- */
  if (main?.semantics.repeatsAllowed && main.count > 1) {
    /*
     * Both vocabularies are recognised: the short word AND the phrase the page itself displays.
     *
     * The Pattern control and the row column read "Every value the same" and "Contains a double", so a reader
     * typing what they can see in front of them must be understood. A generated suggested prompt used the phrase
     * and the parser only knew the word, which meant the page suggested a question it could not answer — the one
     * failure mode a deterministic interpreter has no excuse for.
     */
    if (/\btriples?\b/.test(q) || /every value (the same|is the same)/.test(q) || /all (the )?same\b/.test(q)) {
      filter.shape = "triple";
      recognised.shape = "triple";
      lines.push({ label: "Result shape", value: "Every value the same" });
    } else if (/\bdoubles?\b/.test(q) || /contains? a double/.test(q) || /repeated value/.test(q)) {
      filter.shape = "double";
      recognised.shape = "double";
      lines.push({ label: "Result shape", value: "Contains a double" });
    } else if (/\ball different\b/.test(q) || /every value differ/.test(q)) {
      filter.shape = "allDifferent";
      recognised.shape = "allDifferent";
      lines.push({ label: "Result shape", value: "Every value different" });
    }
  }

  /*
   * ---- aggregate intents ----
   *
   * Recognised only where the format can express them. A consecutive pair needs at least two drawn values, and a
   * gap needs an enumerable value range — asking "how long since 7 appeared" of a 6-from-53 pool is a question
   * about 53 values and a different presentation.
   *
   * Checked last so an explicit number or month still narrows the supporting rows: "how often were two values
   * adjacent in March" is an aggregate over March, not over the year.
   */
  if (main && main.count > 1) {
    if (/\b(consecutive|adjacent|next to each other|in a row|sequence)\b/.test(q)) {
      recognised.aggregate = "consecutive";
      lines.push({ label: "Question type", value: "How often two drawn values were adjacent" });
    } else if (/\b(gap|since|last appeared|last drawn|how long)\b/.test(q) && main.max - main.min + 1 <= 40) {
      recognised.aggregate = "gaps";
      lines.push({ label: "Question type", value: "Drawings since each value last appeared" });
    }
  }

  return { filter, lines, understood: lines.length > 0, recognised };
}

/* ------------------------------------------------------------------ the answer */

/**
 * Produce one complete public Ask answer.
 *
 * Public and complete: no sign-in, no quota, no truncated teaser. `rowLimit` caps how many rows the block
 * DISPLAYS, and `matchingCount` always reports the true total, so a capped display never understates the answer.
 */
export function askArchive(
  question: string,
  rows: readonly ArchiveDrawRow[],
  profile: FormatProfile,
  members: readonly { gameId: number; variantLabel: string }[],
  year: number,
  gameLabel: string,
  rowLimit = 8,
): ArchiveAskAnswer {
  const interp = interpretArchiveQuestion(question, profile, members, year);

  const base: Omit<ArchiveAskAnswer, "matchingCount" | "rows" | "explanation" | "evidence"> = {
    question,
    interpretation: [
      { label: "Game", value: gameLabel },
      { label: "Year", value: String(year) },
      ...interp.lines,
    ],
    understood: interp.understood,
    neutrality: STATISTICS_NEUTRALITY,
    suggestions: [],
  };

  if (!interp.understood) {
    /* Content template Template G. No interpretation is invented, and no indexable URL is created. */
    return {
      ...base,
      matchingCount: 0,
      rows: [],
      explanation:
        "No condition in that question could be interpreted, so no filter was applied and no rows are shown.",
      evidence: [],
      suggestions: [
        "Name a month, for example \"March\".",
        members.some((m) => m.variantLabel)
          ? `Name a drawing, for example "${members.find((m) => m.variantLabel)?.variantLabel}".`
          : "Name a date range.",
        profile.main
          ? `Enter ${profile.main.count} ${profile.main.valueType === "digit" ? "digits" : "numbers"}.`
          : "Enter a number.",
        profile.main?.semantics.repeatsAllowed && profile.main.count > 1
          ? "Ask for doubles or triples."
          : "Ask for a sum range.",
      ],
    };
  }

  const result = filterArchive(rows, profile, interp.filter);
  const shown = result.rows.slice(0, rowLimit);

  /*
   * ---- an aggregate answer ----
   *
   * Computed over the rows the question scoped to, using the SAME functions the statistics section uses — so the
   * Ask block and the analytics cannot report different numbers for the same window. The supporting rows shown are
   * the drawings the figure is about, which is what satisfies *"identify or filter to supporting rows"*.
   */
  if (interp.recognised.aggregate !== null) {
    const agg = aggregateAnswer(interp, result.rows, profile, rowLimit);
    return {
      ...base,
      matchingCount: result.rows.length,
      rows: agg.rows,
      explanation: agg.explanation,
      evidence: [
        { label: "The complete result list this figure was calculated from", href: "#ar-05" },
        { label: "The full statistics for this period", href: "#ar-07" },
        { label: "How these statistics are calculated", href: "#ar-10" },
      ],
      suggestions: [],
    };
  }

  const evidence: { label: string; href: string }[] = [
    { label: "The complete result list this answer searched", href: "#ar-05" },
    { label: "How these statistics are calculated", href: "#ar-10" },
  ];
  for (const r of shown.slice(0, 3)) {
    evidence.push({ label: `Drawing on ${r.drawDateIso}`, href: `#${r.anchorId}` });
  }

  return {
    ...base,
    matchingCount: result.rows.length,
    rows: shown,
    explanation: explain(interp, result.rows.length, result.examined, profile, shown.length),
    evidence,
    suggestions: result.rows.length === 0
      ? [
          "Remove one condition.",
          "Choose a wider month range.",
          "Check the number format.",
          "Search the whole year instead of one month.",
        ]
      : [],
  };
}

/**
 * Compute an aggregate answer and the rows that evidence it.
 *
 * `consecutive` reports how many drawings in the scoped window contained two adjacent values, and shows examples of
 * those drawings — evidence a reader can check by eye. `gaps` reports the longest current gap and shows the most
 * recent drawings, because the gap is counted back from them.
 *
 * When the window is too thin to say anything, it says so rather than reporting a figure over three drawings as
 * though it described the year. That is the *"state limitations naturally"* requirement.
 */
function aggregateAnswer(
  interp: AskInterpretation,
  scoped: readonly ArchiveDrawRow[],
  profile: FormatProfile,
  rowLimit: number,
): { explanation: string; rows: readonly ArchiveDrawRow[] } {
  const main = profile.main;
  const where = interp.recognised.month !== null ? ` in ${monthLabel(interp.recognised.month)}` : "";

  if (scoped.length < 5) {
    return {
      explanation:
        `Only ${scoped.length} drawing${scoped.length === 1 ? "" : "s"}${where} match that question, which is too `
        + "few to describe a pattern. Try a wider period.",
      rows: scoped.slice(0, rowLimit),
    };
  }

  if (interp.recognised.aggregate === "consecutive") {
    const records: DrawRecord[] = scoped.map((r) => ({
      gameId: r.gameId, variantLabel: r.variantLabel, drawDateIso: r.drawDateIso,
      digits: r.mainValues, fireball: r.addOnValue, status: r.status, corrected: r.corrected,
    }));
    const c = consecutiveSummary(records);
    /* Examples the reader can verify — the drawings the figure counted. */
    const examples = scoped.filter((r) => {
      const sorted = [...r.mainValues].sort((a, b) => a - b);
      return sorted.some((v, i) => i > 0 && v - sorted[i - 1] === 1);
    });
    return {
      explanation:
        `${c.drawsWithConsecutive} of ${c.total} drawings${where} contained two values that differ by one. `
        + "That describes this period only.",
      rows: examples.slice(0, rowLimit),
    };
  }

  /* `gaps` */
  const records: DrawRecord[] = scoped.map((r) => ({
    gameId: r.gameId, variantLabel: r.variantLabel, drawDateIso: r.drawDateIso,
    digits: r.mainValues, fireball: r.addOnValue, status: r.status, corrected: r.corrected,
  }));
  const gaps = historicalGaps(records, main?.min ?? 0, main?.max ?? 9);
  const seen = gaps.filter((g) => g.drawsSinceLastSeen !== null);
  const longest = [...seen].sort((a, b) => (b.drawsSinceLastSeen ?? 0) - (a.drawsSinceLastSeen ?? 0))[0];
  const absent = gaps.filter((g) => g.drawsSinceLastSeen === null).map((g) => g.digit);

  const parts: string[] = [];
  if (longest) {
    parts.push(
      `Counting back from the most recent drawing${where}, ${longest.digit} last appeared `
      + `${longest.drawsSinceLastSeen} drawing${longest.drawsSinceLastSeen === 1 ? "" : "s"} ago — the longest `
      + "gap in this period.",
    );
  }
  if (absent.length > 0) {
    parts.push(`${absent.join(", ")} did not appear at all in this period.`);
  }
  /* The sentence that keeps a gap a description rather than a signal. */
  parts.push("A gap describes what has already happened and does not affect the next drawing.");

  return { explanation: parts.join(" "), rows: scoped.slice(0, rowLimit) };
}

/**
 * The plain-language explanation.
 *
 * Describes what was searched and what was found, and nothing else. No characterisation of the result as
 * surprising, overdue or promising — the forbidden-language rule is not a style preference here, it is what
 * keeps a historical count from reading as a forecast.
 */
function explain(
  interp: AskInterpretation,
  found: number,
  examined: number,
  profile: FormatProfile,
  shown: number,
): string {
  const scope: string[] = [];
  if (interp.recognised.month !== null) scope.push(`in ${monthLabel(interp.recognised.month)}`);
  if (interp.recognised.variantLabel) scope.push(`for the ${interp.recognised.variantLabel} drawing`);

  const what = interp.recognised.numberText
    ? profile.main?.semantics.matchOrdered
      ? `${interp.recognised.numberText} in ${interp.recognised.orderMode === "exact" ? "exact drawn order" : "any order"}`
      : interp.recognised.numberText
    : interp.recognised.shape === "triple"
      ? "results where every drawn value was the same"
      : interp.recognised.shape === "double"
        ? "results containing a double"
        : interp.recognised.shape === "allDifferent"
          ? "results where every drawn value differed"
          : "every drawing";

  const where = scope.length > 0 ? ` ${scope.join(" ")}` : "";
  if (found === 0) {
    return `Searched ${examined} drawings for ${what}${where}. Nothing matched.`;
  }
  const displayNote = shown < found ? ` The first ${shown} are shown below.` : "";
  return `Searched ${examined} drawings for ${what}${where} and found ${found}.${displayNote}`;
}
