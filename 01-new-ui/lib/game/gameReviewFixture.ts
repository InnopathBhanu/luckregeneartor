/*
 * THE GUARDED INTERNAL-REVIEW FIXTURE — LRG-GAME-050.
 *
 * Authority: the 2026-08-04 brief §13, founder decision 1 of 2026-08-04 (*"Use a fixed guarded-review date
 * derived from the fixture/feed update date. Identify the whole page once as an internal preview."*),
 * `CLAUDE.md` §14 (*"Synthetic content MUST NEVER be presented as real public fact"*), Constitution (never
 * fabricate winners, community activity or editorial dates).
 *
 * ══ WHY A FIXTURE EXISTS AT ALL ══
 *
 * The repository contains no result history. The production feed carries one current record per game, so
 * JG-07, JG-08, JG-09 and JG-14 — the entire history and analysis band — have nothing real to render. The
 * founder needs to see the composed page before the archive is connected. Those four sections, plus the
 * editorial inventory in JG-15, are the ONLY reason this module exists.
 *
 * ══ THE FOUR RULES THIS MODULE IS BUILT AROUND ══
 *
 *   1. **Real data wins wherever it exists.** The newest row for every member game is the production feed's
 *      own record, tagged `productionFeed`. Sample rows only fill dates the feed does not cover. So the top of
 *      the history table — the part a reader actually reads — is real.
 *
 *   2. **Every record is typed at the data layer**, not labelled at the view layer. `provenance` is a required
 *      field, so a component cannot render a sample row without knowing it is one.
 *
 *   3. **It cannot leak.** `buildReviewHistory` returns an empty array unless `previewEnabled` is true. The
 *      route already 404s with the guard off, so this is the second independent barrier, not the first.
 *
 *   4. **Nothing fabricated is a claim about the world.** There are no sample winners, no sample community
 *      activity, no sample publication dates and no sample legal or tax facts. Synthetic *draw digits* are
 *      acceptable because they are visibly internal and describe nothing outside the fixture; a synthetic
 *      winner or a synthetic article date would be a false statement about a real person or a real
 *      publication, which no guard makes acceptable.
 *
 * ══ WHY THE FIXTURE GENERATOR IS DETERMINISTIC AND THE PLAYER'S IS NOT ══
 *
 * A seeded integer generator here, a CSPRNG in `digitSetGenerator`. That asymmetry is deliberate. Two builds
 * of the same commit must produce byte-identical HTML or every screenshot comparison and every guard-off
 * parity measurement becomes noise — so a fixture must be repeatable. A tool a player uses to pick numbers
 * must not be.
 */

import { drawEventsFor } from "../state/stateDrawEvents";
import type { FormatProfile } from "./gameFormatProfile";
import type { DrawRecord } from "./digitHistoryAnalysis";

/** Where a record came from. Required, so provenance cannot be dropped in transit. */
export type RecordProvenance = "productionFeed" | "internalSample";

export interface ReviewDrawRecord extends DrawRecord {
  provenance: RecordProvenance;
}

/*
 * ══ THE REVIEW DATE USED TO LIVE HERE, AS ONE CONSTANT (CORRECTED, LRG-GAME-053) ══
 *
 * This module exported `REVIEW_DATE_ISO = "2026-07-09"` — the newest FLORIDA draw date in the captured feed —
 * and every jurisdiction's page anchored to it. California's newest transcribed result is 2026-07-08, so every
 * California page generated its history, evaluated its next-draw guard and made its date-effective selections
 * against a date one day after the newest fact California actually has.
 *
 * Founder decision 1 still holds and is unchanged: the date is derived from the feed, never from the clock.
 * Reading the real clock would make a twice-daily game show a 26-day-old row as "Latest" and a past date as
 * "Next drawing". What changed is WHOSE feed: the date is now resolved per jurisdiction by `resolveReviewDate`
 * in `gameReviewDate.ts` and passed to `buildReviewHistory`. This module holds no date of its own, so it cannot
 * reintroduce one state's date into another state's page.
 */

/** Stated once, in the single preview banner. Never repeated per row or per section. */
export const REVIEW_BANNER =
  "Internal preview. Results are dated to the captured results feed, and sections without a connected data " +
  "source use internal review samples.";

/* ------------------------------------------------------------------ deterministic sequence */

/**
 * A linear congruential generator with the Numerical Recipes constants.
 *
 * Chosen for reproducibility, not statistical quality — it fills a demonstration table. `Math.imul` keeps the
 * multiply in 32-bit integer space so the sequence is identical on every platform.
 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SEED = 20260709;

function isoMinusDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T12:00:00Z`) - days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ history */

/**
 * Build the review history: real records first, sample records for earlier dates only.
 *
 * `members` comes from the family configuration, so this function has no knowledge of which games Pick 3 has
 * and works unchanged for a one-member or five-member family.
 */
export function buildReviewHistory(
  previewEnabled: boolean,
  stateCode: string,
  members: readonly { gameId: number; variantLabel: string }[],
  profile: FormatProfile,
  /** The jurisdiction's own review date, from `resolveReviewDate`. Never a shared constant. */
  reviewDateIso: string,
  opts: { days?: number } = {},
): ReviewDrawRecord[] {
  /* Barrier two. With the guard off there is no history at all, not a shorter one. */
  if (!previewEnabled) return [];
  if (!profile.main) return [];

  const days = opts.days ?? 60;
  const out: ReviewDrawRecord[] = [];

  /*
   * ---- real records, read through the GENERIC data seam ----
   *
   * `drawEventsFor(stateCode)`, not a Florida import. Before LRG-GAME-052 this module imported
   * `FLORIDA_DRAW_EVENTS` directly, which made the fixture a Florida fixture and blocked any other
   * jurisdiction from having a reviewable page at all.
   */
  const events = drawEventsFor(stateCode);
  const realByGame = new Map<number, ReviewDrawRecord>();
  for (const m of members) {
    const e = events.find((x) => x.gameId === m.gameId);
    if (!e || !e.resultDate || e.mainNumbers.length === 0) continue;

    /* Special and add-on groups are carried by label, in the order the event supplied them. Nothing is
       merged into the main group and nothing is sorted. */
    const extras = e.specialBalls.map((sb) => ({ label: sb.label, values: sb.values }));
    const addOn = e.specialBalls.find((sb) =>
      profile.addOnLabel !== null && sb.label.trim().toLowerCase() === profile.addOnLabel.trim().toLowerCase(),
    );
    const rec: ReviewDrawRecord = {
      gameId: m.gameId,
      variantLabel: m.variantLabel,
      drawDateIso: e.resultDate,
      digits: e.mainNumbers,
      extras,
      fireball: addOn?.values[0] ?? null,
      status: "verified",
      provenance: "productionFeed",
    };
    realByGame.set(m.gameId, rec);
    out.push(rec);
  }

  /* ---- sample records, strictly OLDER than each member's real record ---- */
  const rnd = lcg(SEED);
  const main = profile.main;
  const drawGroup = (g: { count: number; min: number; max: number; semantics: { repeatsAllowed: boolean } }): number[] => {
    const values: number[] = [];
    let guard = 0;
    while (values.length < g.count && guard++ < 2000) {
      const v = g.min + Math.floor(rnd() * (g.max - g.min + 1));
      if (!g.semantics.repeatsAllowed && values.includes(v)) continue;
      values.push(v);
    }
    /*
     * A game that cannot repeat a value is published ascending by every operator in the reference set, so an
     * unordered sample is sorted to look like a real result. An ORDERED group is never sorted: its positions
     * are the point, and sorting would fabricate a pattern the game does not have.
     */
    if (!g.semantics.repeatsAllowed) values.sort((a, b) => a - b);
    return values;
  };

  for (let d = 1; d <= days; d++) {
    const dateIso = isoMinusDays(reviewDateIso, d);
    for (const m of members) {
      const real = realByGame.get(m.gameId);
      /* Never place a sample row on or after a real one: the newest row for every member must be real. */
      if (real && dateIso >= real.drawDateIso) continue;

      const mainValues = drawGroup(main);
      const extras = profile.extraGroups
        .filter((g) => g.role !== "addOn")
        .map((g) => ({ label: g.label ?? "special", values: drawGroup(g) }));
      const addOnGroup = profile.extraGroups.find((g) => g.role === "addOn");
      if (addOnGroup) {
        extras.push({ label: addOnGroup.label ?? "add-on", values: drawGroup(addOnGroup) });
      }

      out.push({
        gameId: m.gameId,
        variantLabel: m.variantLabel,
        drawDateIso: dateIso,
        digits: mainValues,
        extras,
        fireball: addOnGroup ? (extras.find((x) => x.label === (addOnGroup.label ?? "add-on"))?.values[0] ?? null) : null,
        status: "verified",
        provenance: "internalSample",
      });
    }
  }

  out.sort((a, b) =>
    a.drawDateIso === b.drawDateIso ? a.gameId - b.gameId : b.drawDateIso.localeCompare(a.drawDateIso),
  );
  return out;
}

/** How much of a history set is real. Reported in the implementation record, never as reader copy per row. */
export function provenanceSummary(rows: readonly ReviewDrawRecord[]): {
  productionFeed: number;
  internalSample: number;
} {
  return {
    productionFeed: rows.filter((r) => r.provenance === "productionFeed").length,
    internalSample: rows.filter((r) => r.provenance === "internalSample").length,
  };
}

/* ------------------------------------------------------------------ editorial inventory (JG-15) */

export type EditorialKind = "News" | "Guides" | "Blogs" | "Winners";

/**
 * One planned editorial item.
 *
 * Note what is NOT here: no publication date, no author, no destination. Founder direction forbids fabricating
 * a publication date, and `FD-S-30` forbids inventing a destination — no `/news` route exists. So the fixture
 * carries the *content inventory* the brief specifies and renders as unlinked planned coverage. A card with a
 * plausible date and a dead link would be worse than a card that admits it is not published yet.
 */
export interface EditorialItem {
  key: string;
  kind: EditorialKind;
  title: string;
  summary: string;
}

/*
 * NOTE: the Pick 3 editorial inventory previously lived here as `PICK3_EDITORIAL`.
 *
 * It moved to `config/games/fl-pick-3.json` because selecting it required `ruleGameKey === "pick-3"` inside
 * the generic model — exactly the per-game branch this architecture exists to prevent. Planned editorial
 * coverage is presentation configuration, so the configuration layer owns it, and a game with no planned
 * coverage simply omits the field. The RULES that govern it are unchanged and still apply: no publication
 * date, no author, no destination, and no fabricated winner.
 */

/* ------------------------------------------------------------------ alert options (JG-17) */

/**
 * Alert options.
 *
 * Founder decision 7: a signed-in user can act on these, and a signed-out user sees them and is asked to sign
 * in on click. No alert service and no account service exist, so `available` is false for every option and the
 * control resolves to a sign-in prompt rather than reporting a success that did not happen.
 */
export interface AlertOption {
  key: string;
  label: string;
  /**
   * Whether a service can honour this option today. TRUE since Conflict 37 (2026-08-11): the review-mode
   * account layer records follows, saves and notification preferences for real. What "honour" does NOT mean
   * for alert options is delivery — no channel exists (`FD-ACC-11`), and the JG-17 surface says so.
   */
  available: boolean;
  /** `FD-ACC-18`: the option's own frequency, shown BEFORE it is chosen. */
  frequency?: string;
}

export function alertOptionsFor(
  memberVariants: readonly string[],
  hasMovingTopPrize: boolean,
): AlertOption[] {
  const out: AlertOption[] = [
    { key: "follow", label: "Follow this game", available: true,
      frequency: "Following on its own sends nothing." },
    { key: "saved-sets", label: "Save generated number sets", available: true,
      frequency: "Sends nothing — it only keeps your sets." },
  ];
  for (const v of memberVariants) {
    if (!v) continue;
    out.push({
      key: `result-${v.toLowerCase().replace(/\s+/g, "-")}`,
      label: `Alert after the ${v} result`,
      available: true,
      frequency: "Up to once per drawing.",
    });
  }
  out.push({ key: "rules", label: "Alert when rules or the schedule change", available: true,
    frequency: "Only when something actually changes." });
  out.push({ key: "weekly", label: "Weekly results summary", available: true,
    frequency: "Once a week." });
  /* Only offered where the game's prize can actually move. A fixed-prize digit game cannot, so the option is
     absent rather than shown and quietly ignored (FD-S-08). */
  if (hasMovingTopPrize) {
    out.push({ key: "top-prize", label: "Top-prize alert", available: true,
      frequency: "Only when the top prize moves." });
  }
  return out;
}
