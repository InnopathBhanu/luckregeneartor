/*
 * THE FLAGSHIP ROUTE REGISTRY — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §8 (*"Preserve `/powerball`, `/mega-millions`"*), `CLAUDE.md` §10 (*"MUST NEVER derive route
 * existence from a fixture filename or a directory listing. Routes come from an explicit config or registry"*).
 *
 * ══ THESE ROUTES ALREADY EXIST IN PRODUCTION ══
 *
 * `ROUTE-AUDIT-001` §1.1 row 7 measured `/powerball` and `/mega-millions` live and indexed today, and §6
 * classifies both **P — preserve, canonical self, no redirect**. So this is not an introduced route: it is a
 * rebuild of a page that exists. Two consequences follow, and both are implemented:
 *
 *   1. **No redirect, in either direction.** Nothing here creates one, and neither page emits one.
 *   2. **No canonical cutover.** Both pages remain `noindex, nofollow` and enter no sitemap, so the live
 *      production canonical situation (Conflict 26 — production emits no canonical tag at all) is untouched.
 *      FGP-007 made the routes available locally; it did not make them indexable.
 *
 * ══ ELIGIBILITY IS DECLARED, NOT DERIVED ══
 *
 * `enabled` is a property of this list, never of whether draw data, a fixture or a directory happens to exist.
 * The production results feed carries Powerball and Mega Millions inside all 49 jurisdiction blocks; exactly two
 * routes are declared here.
 *
 * FGP-007 removed the `LC_FLAGSHIP_GAME_PREVIEW` environment gate, so this registry is now the ONLY condition on
 * whether a flagship route renders. The field was called `previewEnabled` while a preview flag existed; it is
 * renamed rather than left with a name that describes a mechanism the build no longer has.
 */

import { flagshipGameConfig } from "./flagshipGames";

export interface FlagshipRegistryEntry {
  gameSlug: string;
  /** The production game id whose current record this hub renders. */
  gameId: number;
  gameLabel: string;
  canonicalPath: string;
  /** Whether this build serves the route. The only condition, since FGP-007. */
  enabled: boolean;
  /** `ROUTE-AUDIT-001` §6 classification. Recorded so the route inventory is readable from code. */
  routeClass: "preserve";
}

export const FLAGSHIP_ELIGIBLE: readonly FlagshipRegistryEntry[] = Object.freeze([
  {
    gameSlug: "powerball",
    gameId: 1012,
    gameLabel: "Powerball",
    canonicalPath: "/powerball",
    enabled: true,
    routeClass: "preserve",
  },
  {
    gameSlug: "mega-millions",
    gameId: 1013,
    gameLabel: "Mega Millions",
    canonicalPath: "/mega-millions",
    enabled: true,
    routeClass: "preserve",
  },
]);

export function flagshipRegistryEntry(gameSlug: string): FlagshipRegistryEntry | undefined {
  return FLAGSHIP_ELIGIBLE.find((e) => e.gameSlug === gameSlug.toLowerCase());
}

export function isFlagshipEligible(gameSlug: string): boolean {
  return flagshipRegistryEntry(gameSlug)?.enabled === true;
}

/** Every flagship route this build serves. Used by the route-inventory test and the implementation record. */
export function flagshipRoutePaths(): string[] {
  return FLAGSHIP_ELIGIBLE.map((e) => e.canonicalPath);
}

/**
 * Assert the registry and the game configuration cannot drift apart.
 *
 * Run as a test guard. A registered route with no configuration would 404 at render time for a reason nobody
 * could find; a configuration with no route would be dead code that looks live.
 */
export function assertRegistryMatchesConfig(): void {
  for (const e of FLAGSHIP_ELIGIBLE) {
    const cfg = flagshipGameConfig(e.gameSlug);
    if (!cfg) throw new Error(`Flagship registry: "${e.gameSlug}" is registered but has no game configuration.`);
    if (cfg.gameId !== e.gameId) {
      throw new Error(
        `Flagship registry: "${e.gameSlug}" declares game ${e.gameId} but its configuration carries ${cfg.gameId}.`,
      );
    }
    if (cfg.canonicalPath !== e.canonicalPath) {
      throw new Error(
        `Flagship registry: "${e.gameSlug}" declares ${e.canonicalPath} but its configuration carries ` +
          `${cfg.canonicalPath}.`,
      );
    }
  }
}
