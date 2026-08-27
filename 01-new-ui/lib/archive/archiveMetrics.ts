/*
 * DETERMINISTIC ARCHIVE METRICS AND NOTABILITY — LRG-ARCHIVE-054.
 *
 * Authority: blueprint §9 (AR-02 state-daily cards and the "no unsupported metric" rule), §14 (AR-07 free
 * analysis and the five-notable-draw maximum), brief §8 AR-02/AR-03/AR-07, §10 (generic format contract),
 * `CLAUDE.md` §7 (claim types, forbidden language), BP-04B §22 (neutral statistical language).
 *
 * ══ EVERY METRIC IS GATED BY THE FORMAT, NOT BY THE GAME ══
 *
 * The brief is explicit: *"Suppress unsupported values"* and *"Do not hardcode Pick 3 behavior into a supposedly
 * generic archive engine."* So each metric declares the format property it needs, and a format that lacks it
 * does not produce the metric at all — rather than producing a zero, which reads as a measurement.
 *
 * The clearest case is the repeat family. "0 of 303 drawings contained a repeated digit" was true of Cash Pop
 * and meaningless: one value cannot repeat itself. Reporting it made a one-number game look like a digit game.
 * That defect was corrected on the Game Page in LRG-GAME-053 and this module is built the same way from the
 * start.
 *
 * ══ THE OUTCOME-SPACE GATE ══
 *
 * "Unique exact results" and "repeated exact results" are only informative when the outcome space is small
 * enough for a repeat to be possible in a year. Pick 3 has 1,000 outcomes and repeats often; Florida Lotto has
 * C(53,6) = 22,957,480, so "unique results: 104 of 104" is arithmetic, not an observation — and printing it
 * would imply that a repeat was a live possibility. The gate is computed from the DECLARED format (count, range,
 * repeat semantics), so no game is named.
 *
 * ══ LANGUAGE ══
 *
 * No `hot`, `cold`, `due`, `overdue`, `best`, `winning pattern`, `most likely`. Every statement names the window
 * it measured. `assertNeutralLanguage` is run over the produced strings by the test suite, so a forbidden phrase
 * fails the build rather than reaching a reader.
 */

import type { FormatProfile } from "../game/gameFormatProfile";
import type { ArchiveDrawRow, ArchiveMetric, NotableDraw, ResultShape } from "./archiveContract";
import { isGenuineCorrection } from "./archiveContract";
import { archiveDisplayDate } from "./archiveYear";

/* ------------------------------------------------------------------ format capability gates */

/**
 * How many distinct results this format can produce.
 *
 * `Infinity` when the space is too large to enumerate meaningfully. Used only to decide whether repetition is a
 * real possibility worth reporting — never shown to a reader as a probability, which would be a claim about
 * their chances.
 */
export function outcomeSpaceOf(profile: FormatProfile): number {
  const g = profile.main;
  if (!g) return Infinity;
  const range = g.max - g.min + 1;
  if (g.semantics.repeatsAllowed) {
    /* Ordered with repeats: range^count. Pick 3 → 1,000; Pick 5 → 100,000. */
    return Math.pow(range, g.count);
  }
  /* A set drawn without replacement: C(range, count). */
  let c = 1;
  for (let i = 0; i < g.count; i++) c = (c * (range - i)) / (i + 1);
  return Math.round(c);
}

/** The threshold above which exact-repetition metrics stop being informative and become arithmetic. */
export const REPETITION_REPORTABLE_MAX = 200_000;

export interface MetricCapabilities {
  /** More than one drawn value, so shape, sum and adjacency questions exist at all. */
  multiValue: boolean;
  /** The format permits a repeated value, so doubles and triples are possible outcomes. */
  repeats: boolean;
  /** More than one member game, so a variant comparison is a comparison. */
  multiVariant: boolean;
  /** The outcome space is small enough that an exact repeat is a real possibility. */
  repetitionReportable: boolean;
  /** An ordered main group, so position-specific statistics are meaningful. */
  positional: boolean;
}

export function metricCapabilities(profile: FormatProfile, memberCount: number): MetricCapabilities {
  const g = profile.main;
  return {
    multiValue: (g?.count ?? 0) > 1,
    repeats: g?.semantics.repeatsAllowed === true && (g?.count ?? 0) > 1,
    multiVariant: memberCount > 1,
    repetitionReportable: outcomeSpaceOf(profile) <= REPETITION_REPORTABLE_MAX,
    positional: profile.supports.positionalStatistics,
  };
}

/* ------------------------------------------------------------------ helpers */

/** The main values as a stable comparison key. Joined in SUPPLIED order for an ordered format. */
function exactKey(row: ArchiveDrawRow, ordered: boolean): string {
  const v = ordered ? row.mainValues : [...row.mainValues].sort((a, b) => a - b);
  return v.join("-");
}

function rangeStatement(rows: readonly ArchiveDrawRow[], year: number): string {
  if (rows.length === 0) return `No drawings recorded in ${year}`;
  const dates = rows.map((r) => r.drawDateIso).sort();
  return `${archiveDisplayDate(dates[0])} through ${archiveDisplayDate(dates[dates.length - 1])}`;
}

function countShape(rows: readonly ArchiveDrawRow[], shape: ResultShape): number {
  return rows.filter((r) => r.shape === shape).length;
}

/* ------------------------------------------------------------------ AR-02 metrics */

/**
 * Up to six public metrics for AR-02, in the blueprint's own order for a state daily game.
 *
 * Each carries its own date range, because the brief requires every metric to state one and an optional field
 * would be dropped by the first component that forgot it.
 */
export function archiveMetrics(
  rows: readonly ArchiveDrawRow[],
  profile: FormatProfile,
  members: readonly { gameId: number; variantLabel: string; memberOrder: number }[],
  year: number,
  isCurrentYear: boolean,
): ArchiveMetric[] {
  const caps = metricCapabilities(profile, members.length);
  const range = rangeStatement(rows, year);
  const ytd = isCurrentYear ? " so far this year" : "";
  const out: ArchiveMetric[] = [];

  out.push({
    key: "drawCount",
    label: isCurrentYear ? "Drawings completed" : "Total drawings",
    value: String(rows.length),
    range,
    evidenceHref: "#ar-05",
    note: null,
  });

  if (caps.multiVariant) {
    const byMember = [...members]
      .sort((a, b) => a.memberOrder - b.memberOrder)
      .map((m) => `${m.variantLabel} ${rows.filter((r) => r.gameId === m.gameId).length}`);
    out.push({
      key: "variantCounts",
      label: "Drawings by variant",
      value: byMember.join(" · "),
      range,
      evidenceHref: "#ar-07",
      /* Naming the ordering source, because the acceptance criteria require variant order to come from
         governed configuration rather than from a sort of whatever the data happened to contain. */
      note: "Listed in this game's configured drawing order.",
    });
  }

  if (caps.repeats) {
    const doubles = countShape(rows, "double");
    const triples = countShape(rows, "triple");
    out.push({
      key: "doubles",
      label: "Drawings with a double",
      value: `${doubles} of ${rows.length}`,
      range,
      evidenceHref: "#ar-06",
      note: "Exactly two of the drawn values were the same.",
    });
    out.push({
      key: "triples",
      label: "Drawings with a triple",
      value: `${triples} of ${rows.length}`,
      range,
      evidenceHref: "#ar-06",
      note: "Every drawn value was the same.",
    });
  }

  if (caps.repetitionReportable && rows.length > 0) {
    const keys = rows.map((r) => exactKey(r, profile.ordered));
    const seen = new Map<string, number>();
    for (const k of keys) seen.set(k, (seen.get(k) ?? 0) + 1);
    const repeated = [...seen.values()].filter((n) => n > 1).length;
    const orderWord = profile.ordered ? "exact" : "same-set";
    out.push({
      key: "uniqueResults",
      label: `Unique ${orderWord} results`,
      value: `${seen.size} of ${rows.length}`,
      range,
      evidenceHref: "#ar-06",
      note: profile.ordered
        ? "Counted in drawn order, so 1-2-3 and 3-2-1 are different results."
        : "Counted as a set, because this game's rules match a set in any order.",
    });
    out.push({
      key: "repeatedResults",
      label: `Repeated ${orderWord} results`,
      value: String(repeated),
      range,
      evidenceHref: "#ar-06",
      note: `Results that occurred more than once${ytd}. Search a number below to see its dates.`,
    });
  }

  /* The sixth card. A sum band is only a presentation for a multi-value format; a single-value game's "sum" is
     the value restated. Shown only when the first five have left room, keeping the blueprint's maximum of six. */
  if (caps.multiValue && out.length < 6 && rows.length > 0) {
    const sums = rows.map((r) => r.sum).filter((s): s is number => s !== null);
    if (sums.length > 0) {
      const bands = new Map<string, number>();
      const width = 5;
      for (const s of sums) {
        const lo = Math.floor(s / width) * width;
        const key = `${lo}–${lo + width - 1}`;
        bands.set(key, (bands.get(key) ?? 0) + 1);
      }
      const top = [...bands.entries()].sort((a, b) => (b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]))[0];
      out.push({
        key: "sumBand",
        label: "Most frequent sum range",
        value: `${top[0]} (${top[1]} drawings)`,
        range,
        evidenceHref: "#ar-07",
        note: "Descriptive distribution of past totals. It does not indicate a future total.",
      });
    }
  }

  return out.slice(0, 6);
}

/* ------------------------------------------------------------------ AR-07 notable draws */

/**
 * At most five notable draws, each with a deterministic reason and the row that proves it.
 *
 * "Notable" here means measurable — a highest sum, a triple, a repeated result, a correction. There is no
 * significance scoring and no AI prose, because the brief forbids inventing significance and because a
 * "notable" claim a reader cannot check is not a fact.
 */
export function notableDraws(
  rows: readonly ArchiveDrawRow[],
  profile: FormatProfile,
): NotableDraw[] {
  const out: NotableDraw[] = [];
  if (rows.length === 0) return out;
  const caps = metricCapabilities(profile, 1);

  const push = (n: NotableDraw) => {
    if (out.length < 5 && !out.some((x) => x.evidenceAnchor === n.evidenceAnchor)) out.push(n);
  };

  /*
   * A corrected row comes first — blueprint §7 puts a correction above everything else — but ONLY when the
   * correction is a genuine sourced record.
   *
   * This used to key on `r.corrected`, a flag a fixture row sets, which is how an internal demonstration became a
   * "notable drawing" narrating a correction to a real Florida result. `isGenuineCorrection` requires a previous
   * value, a corrected value, a source and a date, so a fixture cannot reach it.
   */
  const corrected = rows.find((r) => isGenuineCorrection(r.correction));
  if (corrected) {
    push({
      reason: "This result was updated after checking the source, so the figures here use the corrected value.",
      metric: "Corrected result",
      value: corrected.correction?.field ?? "Result",
      drawDateIso: corrected.drawDateIso,
      variantLabel: corrected.variantLabel,
      evidenceAnchor: corrected.anchorId,
    });
  }

  if (caps.repeats) {
    const triple = rows.find((r) => r.shape === "triple");
    if (triple) {
      push({
        reason: "Every drawn value was the same, which is the least frequent shape this format can produce.",
        metric: "Result shape",
        value: "Triple",
        drawDateIso: triple.drawDateIso,
        variantLabel: triple.variantLabel,
        evidenceAnchor: triple.anchorId,
      });
    }
  }

  if (caps.multiValue) {
    const withSums = rows.filter((r) => r.sum !== null);
    if (withSums.length > 0) {
      const highest = withSums.reduce((a, b) => ((b.sum ?? 0) > (a.sum ?? 0) ? b : a));
      const lowest = withSums.reduce((a, b) => ((b.sum ?? 0) < (a.sum ?? 0) ? b : a));
      push({
        reason: "The highest total of the drawn values in the selected period.",
        metric: "Sum of drawn values",
        value: String(highest.sum),
        drawDateIso: highest.drawDateIso,
        variantLabel: highest.variantLabel,
        evidenceAnchor: highest.anchorId,
      });
      push({
        reason: "The lowest total of the drawn values in the selected period.",
        metric: "Sum of drawn values",
        value: String(lowest.sum),
        drawDateIso: lowest.drawDateIso,
        variantLabel: lowest.variantLabel,
        evidenceAnchor: lowest.anchorId,
      });
    }
  }

  if (caps.repetitionReportable) {
    const seen = new Map<string, ArchiveDrawRow[]>();
    for (const r of rows) {
      const k = exactKey(r, profile.ordered);
      seen.set(k, [...(seen.get(k) ?? []), r]);
    }
    const repeated = [...seen.entries()].filter(([, list]) => list.length > 1)
      .sort((a, b) => b[1].length - a[1].length)[0];
    if (repeated) {
      const [key, list] = repeated;
      const newest = list.reduce((a, b) => (b.drawDateIso > a.drawDateIso ? b : a));
      push({
        reason: `This result occurred ${list.length} times in the selected period.`,
        metric: profile.ordered ? "Repeated exact result" : "Repeated set",
        value: key.split("-").join(" · "),
        drawDateIso: newest.drawDateIso,
        variantLabel: newest.variantLabel,
        evidenceAnchor: newest.anchorId,
      });
    }
  }

  return out;
}
