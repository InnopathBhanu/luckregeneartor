/*
 * THE FLAGSHIP BFF ENTRY POINT — FGP-009.
 *
 * ══ ONE FUNCTION, ONE SEAM ══
 *
 * `getFlagshipGamePageData(gameSlug)` is the only way the page reaches data. Today it resolves to the mock
 * adapter; when `02-new-api` exists, `resolveAdapter` gains one branch and nothing else in the tree changes. The
 * compiler enforces that any replacement satisfies `FlagshipGamePageData` in full, so a partial backend cannot
 * quietly ship a page with holes in it.
 *
 * ══ WHY THE MOCK EXISTS ══
 *
 * Founder direction for FGP-009: finish the UI and deploy briefly to verify the live site and its advertising
 * before restructuring the API and database. The page therefore needs to behave like the finished product —
 * a searchable archive, a jackpot run, working statistics, populated content rails — none of which the captured
 * production feed can supply, because it carries one current drawing per game.
 *
 * ══ WHAT KEEPS THIS HONEST ══
 *
 * `CLAUDE.md` §14 forbids presenting synthetic content as real public fact, and that rule is not suspended by a
 * preview deployment. Four things hold:
 *
 *   1. The **newest drawing in every payload is the real published result** from the production results feed,
 *      tagged `productionFeed`. The most prominent fact on the page is real.
 *   2. Every row, jackpot point, prize tier and content item carries `source`, and every preview payload carries
 *      `meta.disclosure` — the sentence the page is required to show.
 *   3. The pages stay `noindex, nofollow`, out of the sitemap, and carry a visible preview banner.
 *   4. **No fabricated winner, claim, retailer or real-person statement exists anywhere in the payload.** Mock
 *      discussions and articles say in their own text that they were written for interface testing.
 *
 * Recorded in `source-conflicts.md`, because it is a deliberate, time-boxed departure from the default rule that
 * the page shows published data or an empty state.
 */

import { flagshipGameConfig } from "../flagshipGames";
import type { FlagshipGamePageData } from "./flagshipBffContract";
import { mockFlagshipGamePageData } from "./flagshipBffMock";

export type FlagshipDataMode =
  /** Preview payload: real latest drawing, generated history. The current mode. */
  | "mock"
  /** Real backend. Not implemented — `02-new-api` is empty and untouched (`CLAUDE.md` §15). */
  | "api";

/**
 * Which adapter answers.
 *
 * A module constant rather than an environment variable, so the state of the build is readable from the source.
 * FGP-007 removed the last env-driven page behaviour and this does not reintroduce one.
 */
export const FLAGSHIP_DATA_MODE: FlagshipDataMode = "mock";

/**
 * Everything a flagship game page needs, in one read.
 *
 * Synchronous today because the mock adapter reads a bundled JSON module. The signature returns the payload
 * directly rather than a promise on purpose: making it `async` now would suggest the real endpoint's shape has
 * been decided, and `CLAUDE.md` §15 forbids that during a UI task. The call site is a server component, so
 * turning this into an `async` function later is a local change with no rendering consequences.
 */
export function getFlagshipGamePageData(gameSlug: string): FlagshipGamePageData | null {
  const config = flagshipGameConfig(gameSlug);
  if (!config) return null;

  switch (FLAGSHIP_DATA_MODE) {
    case "mock":
      return mockFlagshipGamePageData(config);
    case "api":
      /* Unreachable until an API task is authorised. Left as an explicit branch so the seam is visible. */
      throw new Error(
        "getFlagshipGamePageData: the API adapter does not exist. `02-new-api` is untouched until a dedicated " +
          "API task is approved (CLAUDE.md §15). See FUTURE_API in flagshipBffContract.ts.",
      );
  }
}

/** Whether the current payload is preview data. Drives the page's disclosure banner. */
export function isPreviewData(data: FlagshipGamePageData): boolean {
  return data.meta.source !== "productionFeed";
}
