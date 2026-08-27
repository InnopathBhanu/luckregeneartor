/*
 * GAME PAGE ROUTE BOUNDARY — LRG-GAME-049 ROUTE-02.
 *
 * Registered Game Page routes render without a custom environment flag. Route existence still comes only
 * from the explicit registry — never from a fixture, a file on disk or a feed record — so an unknown
 * jurisdiction-and-game pair continues to 404.
 */

import { servesPage } from "../registry/pageFamilyRegistry";

/**
 * The single route-enable decision, taken at the route boundary. Eligibility is DATA — never
 * `state === "fl" && game === "powerball"` — so adding a game remains a deliberate registry edit.
 *
 * `FD-GATE-01` (2026-08-11) routes this through `servesPage`, the ONE mechanism all five families now share. It was
 * already registry-only, so nothing about this route's behaviour changes — what changes is that Home, State, Game,
 * the archive and the flagship hubs now answer "does this build serve this page?" through the same function, and the
 * route inventory can therefore enumerate all five in one list. This function is kept rather than replaced at its
 * six call sites because its name is what those routes read, and a rename would be churn without a reader benefit.
 */
export function resolveGamePreview(stateCode: string, gameSlug: string): boolean {
  return servesPage("game", stateCode, gameSlug);
}
