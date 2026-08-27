/*
 * THE GUARDED ARCHIVE REVIEW FIXTURE — LRG-ARCHIVE-054.
 *
 * Authority: brief §11 (*"Real results are not required for this design review"*, the ten demonstration
 * requirements and the six hard rules), founder decision 1 of 2026-08-04 (a FIXED review date derived from the
 * feed, never the clock), `CLAUDE.md` §14 (*"Synthetic content MUST NEVER be presented as real public fact"*),
 * Constitution (never fabricate winners, prizes, retailers, news or community activity).
 *
 * ══ WHY A FIXTURE EXISTS ══
 *
 * The repository contains no result history at all. The captured production feed carries ONE current record per
 * game, so a yearly archive — whose entire purpose is a year of rows — has nothing real to render. Production
 * has 52 indexed per-variant Pick 3 yearly URLs going back to 1988; none of that data is here. The founder needs
 * to review the composed archive before the history store is connected, and that is the only reason this module
 * exists.
 *
 * ══ THE RULES THIS MODULE IS BUILT AROUND ══
 *
 *   1. **Real data wins wherever it exists.** The newest row for each member game is the feed's own record,
 *      tagged `productionFeed`. Synthetic rows only fill dates the feed does not cover. So the top of the
 *      table is real.
 *   2. **Provenance is a required field in the DATA contract**, spelled `synthetic/internal-review` exactly as
 *      the brief requires — not a label a component applies, which a component could forget.
 *   3. **It cannot leak.** Every entry point returns an empty array unless `previewEnabled` is true. The route
 *      already 404s with the guard off, so this is the second independent barrier, not the first.
 *   4. **Nothing fabricated is a claim about the world.** Synthetic draw VALUES are acceptable: they are
 *      visibly internal and describe nothing outside the fixture. There are no synthetic winners, prizes,
 *      retailers, jackpots, publication dates, articles or discussions — each of those would be a false
 *      statement about a real person or a real publication, which no guard makes acceptable.
 *   5. **It is not an API contract.** The shape here serves this page's presentation. See `archiveContract.ts`.
 *
 * ══ THE ONE CORRECTED ROW AND THE PARTIAL STATE ARE DELIBERATE, AND THEY ARE INTERNAL ══
 *
 * The brief requires a corrected row and a partial-data state so the founder can review Template E and
 * Template F. Both are properties of the FIXTURE, declared here, and both are visibly internal-review content.
 * A correction notice on a real production page would be a factual claim about a real drawing; this one sits
 * behind the guard on a synthetic row and says so.
 */

import { drawEventsFor } from "../state/stateDrawEvents";
import type { FormatProfile } from "../game/gameFormatProfile";
import type {
  ArchiveCorrection, ArchiveDrawRow, ArchiveProvenance, ArchiveRowGroup, ResultShape,
} from "./archiveContract";
import { monthKeyOf } from "./archiveYear";

/** Stated once, in one page-level banner. Never repeated per row or per section. */
export const ARCHIVE_PREVIEW_BANNER =
  "This page is a preview and is not ready to publish. Most results shown are samples used to build the page, " +
  "so do not rely on them. Only the most recent drawing for each draw time comes from the official results.";

/* ------------------------------------------------------------------ deterministic sequence */

/**
 * A linear congruential generator with the Numerical Recipes constants.
 *
 * Chosen for reproducibility, not statistical quality — it fills a demonstration table. `Math.imul` keeps the
 * multiply in 32-bit integer space so the sequence is byte-identical on every platform, which is what makes two
 * builds of the same commit produce the same HTML and a screenshot comparison meaningful.
 *
 * Contrast with `digitSetGenerator`, which uses a CSPRNG: a tool a player uses to pick numbers must NOT be
 * reproducible. The asymmetry is deliberate in both directions.
 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Derived from the archive year so each year's fixture is stable and distinct. No clock read. */
function seedFor(year: number, familyId: string): number {
  let h = year * 7919;
  for (let i = 0; i < familyId.length; i++) h = (Math.imul(h, 31) + familyId.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

/* ------------------------------------------------------------------ dates */

/** Days in a month, with a correct Gregorian leap-year rule. No `Date`, so no timezone can shift a boundary. */
function daysInMonth(year: number, month: number): number {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
}

function dateIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ shape and sum */

/**
 * Classify a result's shape from the FORMAT's declared semantics, not from the values alone.
 *
 * A pool draw and a single-value game return `notApplicable`, because "all different" would imply the game
 * could have produced something else. Only a format that permits a repeat can meaningfully be described as
 * having avoided one.
 */
export function shapeOf(values: readonly number[], repeatsAllowed: boolean): ResultShape {
  if (!repeatsAllowed || values.length < 2) return "notApplicable";
  const distinct = new Set(values).size;
  if (distinct === values.length) return "allDifferent";
  if (distinct === 1) return "triple";
  return "double";
}

/**
 * A sum, where a sum is an approved presentation for this format.
 *
 * Suppressed for a single-value game, where the "sum" is just the value again and presenting it as a statistic
 * would be padding a page with a restatement.
 */
export function sumOf(values: readonly number[]): number | null {
  if (values.length < 2) return null;
  return values.reduce((a, b) => a + b, 0);
}

/* ------------------------------------------------------------------ rows */

function anchorOf(gameId: number, iso: string): string {
  return `draw-${gameId}-${iso}`;
}

function groupsFor(profile: FormatProfile, main: readonly number[], extras: Map<string, readonly number[]>): ArchiveRowGroup[] {
  const out: ArchiveRowGroup[] = [];
  for (const g of profile.groups) {
    /*
     * A `secondary` group — Double Play and its kin — is a separate labelled DRAWING, not a group of this row.
     * Content template A7 is explicit: *"Do not render Double Play as part of the main number set."* Folding one
     * in here would merge two draw records, which brief §17 forbids outright. It is skipped rather than
     * mis-placed; a secondary drawing needs its own row and its own game id when the data carries one.
     */
    if (g.role === "secondary") continue;
    const values = g.role === "main" ? main : extras.get(g.key) ?? [];
    /* A group with no values on this row is omitted rather than rendered empty — the missing-Fireball
       coverage the brief requires is an ABSENT group, not a group showing a dash. */
    if (values.length === 0) continue;
    out.push({
      key: g.key,
      label: g.label,
      accessibleLabel: g.accessibleLabel,
      values,
      colorToken: g.colorToken,
      role: g.role,
    });
  }
  return out;
}

export interface ArchiveFixtureMember {
  gameId: number;
  variantLabel: string;
  memberOrder: number;
}

export interface ArchiveFixtureResult {
  rows: readonly ArchiveDrawRow[];
  /** How many rows came from the feed versus the sample set. Rendered as one provenance disclosure. */
  provenance: { productionFeed: number; synthetic: number; total: number };
  /** True when at least one row in the year is a real feed record. */
  hasRealRows: boolean;
}

/**
 * Build the archive year's rows: real records where they exist, synthetic ones for earlier dates.
 *
 * `members` comes from the family configuration, so this function has no knowledge of which games Pick 3 has
 * and works unchanged for a one-member or five-member family. `drawsPerDay` is the family's own member count,
 * so a five-draw game gets five rows a day without a branch.
 */
export function buildArchiveReviewRows(
  previewEnabled: boolean,
  stateCode: string,
  familyId: string,
  year: number,
  validMonths: number,
  members: readonly ArchiveFixtureMember[],
  profile: FormatProfile,
  reviewDateIso: string,
): ArchiveFixtureResult {
  const empty: ArchiveFixtureResult = {
    rows: [],
    provenance: { productionFeed: 0, synthetic: 0, total: 0 },
    hasRealRows: false,
  };
  /* Barrier two. With the guard off there is no archive at all, not a shorter one. */
  if (!previewEnabled) return empty;
  if (!profile.main || members.length === 0) return empty;

  /*
   * ══ BARRIER THREE: THE FIXTURE IS ANCHORED TO A YEAR THAT HAS REAL DATA ══
   *
   * Without this check the generator happily produced a complete twelve-month archive for ANY past year, because
   * every date in 1998 or 2019 is before the review date. `/fl/pick-3/2019` returned 200 with 96 synthetic rows
   * and a status line reading "96 drawings from Jan 04 through Dec 26, 2019" — a fabricated archive for a year
   * this repository holds no data about, which is precisely the synthetic-as-public-fact failure `CLAUDE.md` §14
   * forbids. Production has 52 indexed Pick 3 yearly URLs back to 1988; inventing their contents is not a
   * substitute for connecting them.
   *
   * A year is reviewable only when the captured feed carries a real record for at least one member IN that year.
   * The synthetic rows then fill the earlier dates of a year that genuinely exists, and every other year has no
   * archive at all — which is what the route turns into a 404.
   */
  const hasRealRecordInYear = drawEventsFor(stateCode).some(
    (e) => members.some((m) => m.gameId === e.gameId)
      && e.resultDate !== null
      && e.mainNumbers.length > 0
      && e.resultDate.slice(0, 4) === String(year),
  );
  if (!hasRealRecordInYear) return empty;

  const main = profile.main;
  const rnd = lcg(seedFor(year, familyId));
  const rows: ArchiveDrawRow[] = [];

  /* ---- real records, read through the GENERIC data seam ---- */
  const events = drawEventsFor(stateCode);
  const realByGame = new Map<number, ArchiveDrawRow>();
  for (const m of members) {
    const e = events.find((x) => x.gameId === m.gameId);
    if (!e || !e.resultDate || e.mainNumbers.length === 0) continue;
    /* A real record only belongs in THIS archive year. A 2026 feed record is not evidence about 2025. */
    if (e.resultDate.slice(0, 4) !== String(year)) continue;

    const extras = new Map<string, readonly number[]>();
    for (const g of profile.extraGroups) {
      const sb = e.specialBalls.find(
        (x) => x.label.trim().toLowerCase() === (g.label ?? "").trim().toLowerCase(),
      );
      if (sb && sb.values.length > 0) extras.set(g.key, sb.values);
    }
    const addOnGroup = profile.groups.find((g) => g.role === "addOn");
    const row: ArchiveDrawRow = {
      gameId: m.gameId,
      variantLabel: m.variantLabel,
      memberOrder: m.memberOrder,
      drawDateIso: e.resultDate,
      monthKey: e.resultDate.slice(0, 7),
      groups: groupsFor(profile, e.mainNumbers, extras),
      mainValues: e.mainNumbers,
      addOnValue: addOnGroup ? (extras.get(addOnGroup.key) ?? [])[0] ?? null : null,
      shape: shapeOf(e.mainNumbers, main.semantics.repeatsAllowed),
      sum: sumOf(e.mainNumbers),
      status: "verified",
      corrected: false,
      correction: null,
      provenance: "productionFeed",
      anchorId: anchorOf(m.gameId, e.resultDate),
    };
    realByGame.set(m.gameId, row);
    rows.push(row);
  }

  /*
   * ---- synthetic rows, strictly OLDER than each member's real record ----
   *
   * A draw group is generated from the format's declared count, range and repeat semantics — so a digit game
   * gets repeats and a pool draw cannot, without either case being named here.
   */
  const drawGroup = (count: number, min: number, max: number, repeats: boolean): number[] => {
    const values: number[] = [];
    let guard = 0;
    while (values.length < count && guard++ < 2000) {
      const v = min + Math.floor(rnd() * (max - min + 1));
      if (!repeats && values.includes(v)) continue;
      values.push(v);
    }
    /*
     * ORDERING, and the exact distinction the LRG-GAME-053 record sets out:
     *
     * a group that cannot repeat a value is published ascending by every operator in the reference set, so an
     * unordered SAMPLE is normalised to look like a real result. An ORDERED group is never sorted — its
     * positions are the point, and sorting one would fabricate a pattern the game does not have. Neither case
     * touches a real feed value, which is echoed back exactly as supplied.
     */
    if (!repeats) values.sort((a, b) => a - b);
    return values;
  };

  const addOnGroup = profile.groups.find((g) => g.role === "addOn");
  /* One corrected row and one add-on gap, both placed deterministically so a reviewer can find them and a
     test can assert them. Chosen by index rather than by date so the choice survives a different year. */
  let syntheticIndex = 0;
  const CORRECTED_AT = 6;
  const ADDON_MISSING_EVERY = 7;

  for (let month = validMonths; month >= 1; month--) {
    const last = daysInMonth(year, month);
    /*
     * Four dates a month, evenly spread.
     *
     * Enough to demonstrate month filtering, per-month counts and a notable-draw spread while keeping the
     * server-rendered table reviewable. A real archive has a row per draw day; that is a data-volume question
     * for the connection task, and the record says so rather than the fixture pretending to be complete.
     */
    for (const day of [Math.min(4, last), 11, 19, Math.min(26, last)]) {
      const iso = dateIso(year, month, day);
      if (iso > reviewDateIso) continue;

      for (const m of [...members].sort((a, b) => a.memberOrder - b.memberOrder)) {
        const real = realByGame.get(m.gameId);
        /* Never place a sample row on or after a real one: the newest row for every member must be real. */
        if (real && iso >= real.drawDateIso) continue;

        const values = drawGroup(main.count, main.min, main.max, main.semantics.repeatsAllowed);
        const extras = new Map<string, readonly number[]>();
        for (const g of profile.extraGroups) {
          /* The brief requires BOTH add-on coverage and missing-add-on coverage. A drawn add-on is skipped on
             every seventh synthetic row, which is what an unpurchased or unrecorded add-on looks like. */
          if (g.role === "addOn" && syntheticIndex % ADDON_MISSING_EVERY === 0) continue;
          extras.set(g.key, drawGroup(g.count, g.min, g.max, g.semantics.repeatsAllowed));
        }

        /*
         * ══ THE FIXTURE CARRIES A CORRECTION RECORD, AND IT IS NOT PUBLISHABLE ══
         *
         * The V0 rendered a prominent correction story — a notice above the year summary, a corrected-results
         * metric, a badge and a row treatment — from THIS row. Every word of it was true of the fixture and false
         * of the world: it read as a genuine historical correction to a real Florida drawing.
         *
         * The record is kept, because the internal capability is worth exercising and a real correction will
         * eventually arrive through the same shape. What changed is `source: null`. A fixture cannot name a source
         * without fabricating one, `isGenuineCorrection` requires a source, and so this record is structurally
         * unpublishable. That is the gate working as designed rather than a caption asking to be believed.
         */
        const corrected = syntheticIndex === CORRECTED_AT;
        const correction: ArchiveCorrection | null = corrected
          ? {
              field: "Winning numbers",
              previousValue: values.slice().reverse().join(" · "),
              currentValue: values.join(" · "),
              correctedOnIso: iso,
              source: null,
            }
          : null;

        rows.push({
          gameId: m.gameId,
          variantLabel: m.variantLabel,
          memberOrder: m.memberOrder,
          drawDateIso: iso,
          monthKey: monthKeyOf(year, month),
          groups: groupsFor(profile, values, extras),
          mainValues: values,
          addOnValue: addOnGroup ? (extras.get(addOnGroup.key) ?? [])[0] ?? null : null,
          shape: shapeOf(values, main.semantics.repeatsAllowed),
          sum: sumOf(values),
          /*
           * The row status is INTERNAL governance state, not reader copy.
           *
           * It stays on the data — tests read it, and a real pipeline will need it — but nothing renders it. The
           * V0 published a `Status` column of `verified` badges, which told a reader nothing they could act on and
           * everything about how the page was built.
           */
          status: corrected ? "corrected" : "verified",
          corrected,
          correction,
          provenance: "synthetic/internal-review",
          anchorId: anchorOf(m.gameId, iso),
        });
        syntheticIndex++;
      }
    }
  }

  /*
   * ---- the demonstration guarantees ----
   *
   * A seeded sequence produces a double and a triple eventually, but "eventually" is not a guarantee, and a
   * reviewer opening the page must be able to see each shape. Two rows are therefore forced — but only for a
   * format where the shape is POSSIBLE, so a pool draw is never given an impossible repeated value.
   */
  if (main.semantics.repeatsAllowed && main.count >= 2) {
    const forceable = rows.filter((r) => r.provenance === "synthetic/internal-review");
    forceEqualShape(forceable, 2, "triple", main.min, main.max);
    forceEqualShape(forceable, 5, "double", main.min, main.max);
  }

  const synthetic = rows.filter((r) => r.provenance === "synthetic/internal-review").length;
  return {
    rows: sortArchiveRows(rows, "newest"),
    provenance: { productionFeed: rows.length - synthetic, synthetic, total: rows.length },
    hasRealRows: realByGame.size > 0,
  };
}

/**
 * Force one synthetic row to a given shape, in place.
 *
 * Mutates the row's values and every value derived from them, so the row stays internally consistent — a row
 * whose displayed digits disagreed with its own shape label or sum would be worse than no demonstration at all.
 */
function forceEqualShape(
  rows: ArchiveDrawRow[],
  index: number,
  shape: "double" | "triple",
  min: number,
  max: number,
): void {
  const row = rows[index];
  if (!row) return;
  const v = Math.min(max, Math.max(min, min + 3));
  const values = shape === "triple"
    ? row.mainValues.map(() => v)
    : row.mainValues.map((x, i) => (i === 0 ? v : i === 1 ? v : x));
  const rewritten: ArchiveDrawRow = {
    ...row,
    mainValues: values,
    groups: row.groups.map((g) => (g.role === "main" ? { ...g, values } : g)),
    shape,
    sum: sumOf(values),
  };
  const at = rows.indexOf(row);
  rows[at] = rewritten;
}

/**
 * Sort archive rows for presentation.
 *
 * THIS ORDERS RECORDS, NOT VALUES. Within one date, members keep the family configuration's own
 * `memberOrder` — Midday before Evening — never alphabetical and never by game id, which would be a second
 * ordering system that could disagree with the State page. The values inside a row are untouched.
 */
export function sortArchiveRows(
  rows: readonly ArchiveDrawRow[],
  order: "newest" | "oldest",
): ArchiveDrawRow[] {
  const dir = order === "newest" ? -1 : 1;
  return [...rows].sort((a, b) => {
    if (a.drawDateIso !== b.drawDateIso) return a.drawDateIso.localeCompare(b.drawDateIso) * dir;
    return a.memberOrder - b.memberOrder;
  });
}
