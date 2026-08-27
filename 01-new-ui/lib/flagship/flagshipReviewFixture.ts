/*
 * THE FLAGSHIP REVIEW FIXTURE — TEST AND LOCAL-REVIEW ONLY. FGP-008.
 *
 * ══ THIS FILE IS NOT REACHABLE FROM A ROUTE ══
 *
 * It generates a deterministic series of drawings so the explorer, the ticket checker's history modes and the ten
 * Stats Lab views can be exercised against a realistic run of data. Every one of those engines is a pure function
 * with unit tests; without a series there is nothing to test them against, and deleting the generator would mean
 * deleting the proof that they work.
 *
 * FGP-008 removed it from the page. `flagshipPageModel.ts` imports `publishedHistory` and never this module, a
 * test asserts that no file under `app/` or `lib/flagship/flagshipPageModel.ts` imports it, and `assertNotProduction`
 * below throws if it is ever called in a production build. Three independent barriers, because the previous single
 * barrier was an environment flag that FGP-007 removed.
 *
 * ══ WHAT IT STILL WILL NOT DO ══
 *
 * Unchanged from the original rules, and they matter even in a test fixture: **no synthetic jackpot, cash value,
 * winner, prize, retailer, news item or discussion is generated anywhere.** Only drawn numbers and drawn
 * multipliers. Every row carries `provenance: "synthetic/internal-review"` as a required field, the series never
 * crosses a rule-era boundary, and generation is deterministic so two runs of the same commit agree.
 */

import type { FlagshipGameConfig } from "./flagshipGames";
import {
  EMPTY_HISTORY, drawNightsOf, shapeOf, weekdayOf,
  type FlagshipDrawRow, type FlagshipHistory,
} from "./flagshipHistory";
import { publishedHistory } from "./flagshipHistory";

/** How many drawings the review series may contain at most. */
export const MAX_REVIEW_DRAWS = 520;

/**
 * Refuse to run in a production build.
 *
 * The fixture is a development and test device. If a future refactor ever wires it into a page, this throws at
 * the first call in production rather than quietly serving generated drawings to a reader.
 */
function assertNotProduction(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "flagshipReviewFixture: the review series is a test and local-review device and must never be built into a " +
        "production render. The page model uses `publishedHistory` from `flagshipHistory.ts`.",
    );
  }
}

/* ------------------------------------------------------------------ determinism */

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seedFor(gameId: number, slug: string): number {
  let h = gameId * 7919;
  for (let i = 0; i < slug.length; i++) h = (Math.imul(h, 31) + slug.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

/* ------------------------------------------------------------------ dates */

function daysInMonth(year: number, month: number): number {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
}

function dateIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function previousDay(iso: string): string {
  let [y, m, d] = iso.split("-").map(Number);
  d -= 1;
  if (d < 1) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    d = daysInMonth(y, m);
  }
  return dateIso(y, m, d);
}

/** Draw `count` distinct values in `[1, pool]` from a seeded stream. */
function distinct(rand: () => number, count: number, pool: number): number[] {
  const chosen = new Set<number>();
  while (chosen.size < count) chosen.add(1 + Math.floor(rand() * pool));
  return [...chosen].sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ build */

/**
 * A published anchor plus a deterministic run of review drawings behind it.
 *
 * The newest row is the REAL published drawing, so the top of any table under test is a real fact. Earlier rows
 * are generated backwards along the game's own draw nights, stopping at `MAX_REVIEW_DRAWS` or the current rule
 * era's `effectiveFrom`, whichever comes first.
 */
export function buildReviewHistory(config: FlagshipGameConfig): FlagshipHistory {
  assertNotProduction();

  const published = publishedHistory(config);
  const anchor = published.rows[0];
  /* Without a real anchor there is no series. A wholly invented archive is the failure `CLAUDE.md` §14 forbids. */
  if (!anchor) return EMPTY_HISTORY;

  const mainSpec = config.groups.find((g) => g.role === "main")!;
  const specialSpec = config.groups.find((g) => g.role === "special") ?? null;
  const nights = new Set(drawNightsOf(config));
  const eraFrom = published.eraEffectiveFrom;
  const rand = lcg(seedFor(config.gameId, config.gameSlug));

  const rows: FlagshipDrawRow[] = [anchor];

  let cursor = anchor.drawDateIso;
  let guard = 0;
  while (rows.length < MAX_REVIEW_DRAWS && guard < MAX_REVIEW_DRAWS * 12) {
    guard += 1;
    cursor = previousDay(cursor);
    if (eraFrom && cursor < eraFrom) break;
    if (!nights.has(weekdayOf(cursor))) continue;

    const main = distinct(rand, mainSpec.count, mainSpec.max);
    rows.push({
      drawDateIso: cursor,
      drawDay: weekdayOf(cursor),
      main,
      special: specialSpec ? 1 + Math.floor(rand() * specialSpec.max) : null,
      /* A multiplier IS generated for a game that draws one — it is a drawn VALUE. A jackpot is NOT, because it
         is a claim about a real advertised prize. That line is the whole rule. */
      multiplier:
        config.multiplier.drawnWithResult && config.multiplier.values.length > 0
          ? config.multiplier.values[Math.floor(rand() * config.multiplier.values.length)]
          : null,
      secondary: config.secondaryDraw
        ? {
            main: distinct(rand, mainSpec.count, mainSpec.max),
            special: specialSpec ? 1 + Math.floor(rand() * specialSpec.max) : null,
          }
        : null,
      jackpotDisplay: null,
      provenance: "synthetic/internal-review",
      ...shapeOf(main, mainSpec.max),
      repeatsFromPrevious: [],
    });
  }

  for (let i = 0; i < rows.length - 1; i++) {
    const prev = new Set(rows[i + 1].main);
    rows[i] = { ...rows[i], repeatsFromPrevious: rows[i].main.filter((v) => prev.has(v)) };
  }

  const synthetic = rows.filter((r) => r.provenance === "synthetic/internal-review").length;
  return {
    rows,
    provenance: { productionFeed: rows.length - synthetic, synthetic, total: rows.length },
    eraLabel: published.eraLabel,
    eraEffectiveFrom: eraFrom,
    fromIso: rows[rows.length - 1].drawDateIso,
    toIso: rows[0].drawDateIso,
  };
}
