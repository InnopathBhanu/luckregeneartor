/*
 * FLAGSHIP ROUTE ACCESS — LRG-FLAGSHIP-007.
 *
 * ══ WHAT CHANGED, AND WHY ══
 *
 * This file replaces `flagshipPreviewGuard.ts`. That guard required `LC_FLAGSHIP_GAME_PREVIEW=true` before
 * `/powerball` or `/mega-millions` would render at all; without it both routes 404'd.
 *
 * The founder instruction for FGP-007 removes that requirement: the site is being rebuilt locally and published
 * as a whole later, so a per-page preview flag is no longer how these pages are held back. Both routes are now
 * available locally with no environment variable.
 *
 * ══ WHAT DELIBERATELY DID NOT CHANGE ══
 *
 * **Route existence is still declared, never derived.** `CLAUDE.md` §10: *"MUST NEVER derive route existence from
 * a fixture filename or a directory listing. Routes come from an explicit config or registry."* Removing the env
 * flag removes ONE of the two conditions; the registry check is the other and it stays. So the answer to "what
 * flagship URLs does this build serve?" is still this module plus `flagshipRegistry.ts`, and it is still
 * impossible for a new route to appear because a fixture or a directory gained a file.
 *
 * **Indexing did not change.** Both pages remain `noindex, nofollow` and enter no sitemap. Availability and
 * indexability are separate decisions, and only the first was in scope here — see `flagshipRouteMetadata.ts`.
 */

import { servesPage } from "../registry/pageFamilyRegistry";

/**
 * Whether this build serves a flagship route for the given game.
 *
 * Registry-only. There is no environment variable, and adding one back would reintroduce the preview gate the
 * founder removed. A slug that is not registered still 404s, which is what keeps the route inventory reviewable.
 */
export function isFlagshipRouteEnabled(gameSlug: string): boolean {
  /* `FD-GATE-01` (2026-08-11): routed through `servesPage`, the one mechanism all five families share. This family
     was already registry-only — FGP-007 removed its env flag — so it is the pattern the other four adopted. */
  return servesPage("flagship", gameSlug);
}
