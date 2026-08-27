/*
 * THE GOVERNED GAME PAGE REGISTRY — LRG-GAME-049 ROUTE-01/ROUTE-02.
 *
 * Authority: BP-04B `05B-lotterycorner-jurisdiction-game-page-blueprint-FINAL-APPROVED.md` (JG-M1 minimal
 * flagship offering, route `/{jurisdiction-code}/{game-slug}`), `FD-S-30` (route existence is declared,
 * never derived), CLAUDE.md §10.
 *
 * ══ THE ROUTE IS THE PRODUCTION ROUTE ══
 *
 * `src/struts.xml` maps the wildcard action `*​/*` to `page=game` with `selectedState={1}` and
 * `gameNameUrl={2}`, and `*​/*​/*` to `page=gameHistory` with `selectedYear={3}`. So `/fl/powerball` and
 * `/fl/powerball/{year}` are the live production URLs, and BP-04B §1 preserves them. No `-new` route, no
 * design-lab route and no second canonical is created.
 *
 * ══ ELIGIBILITY IS ONE DECLARED PAIR ══
 *
 * `ELIGIBLE` holds exactly one entry for this task. It is a jurisdiction-and-game PAIR rather than a game
 * list, because `/fl/powerball` and `/ca/powerball` are different pages with different local facts, and one
 * being reviewable says nothing about the other.
 *
 * Nothing here is inferred from the results feed, from a fixture, or from the presence of a configuration
 * file. All 49 `<State>` blocks in the feed carry Powerball; exactly one pair is eligible.
 */

export interface GameRegistryEntry {
  stateCode: string;
  gameSlug: string;
  /** The production game id this page renders. Never rewritten. */
  gameId: number;
  /** BP-04B mode. `JG-M1` is a minimal flagship offering; `JG-M2` a full state-native game. */
  mode: "JG-M1" | "JG-M2" | "JG-M3";
  configPath: string;
  previewEnabled: boolean;
}

/**
 * The one guarded Game Page of this task.
 *
 * Florida Powerball, `JG-M1`. BP-04B §0 names `/fl/powerball` as the canonical example of a minimal
 * flagship offering: it owns substantial LOCAL context, while universal draw history, statistics and tools
 * belong to the flagship ecosystem at `/powerball`.
 */
export const ELIGIBLE: readonly GameRegistryEntry[] = Object.freeze([
  {
    stateCode: "fl",
    gameSlug: "powerball",
    gameId: 1012,
    mode: "JG-M1",
    configPath: "config/games/fl-powerball.json",
    previewEnabled: true,
  },
  /*
   * ══ LRG-GAME-050: THREE JG-M2 PAIRS ══
   *
   * ROUTE CLASSIFICATION, PROVEN NOT ASSUMED. `Game.getGameNameForURL()` derives a legacy game URL from
   * `game.NAME` (strip `/`, spaces to hyphens, lowercase), and the production sitemap confirms the result.
   * So Florida's real indexed inventory is `/fl/pick-3-midday` and `/fl/pick-3-evening`, and the five
   * `cash-pop-*` variants — while `/fl/pick-3` and `/fl/cash-pop` **do not exist in production at all**.
   *
   * These are therefore INTRODUCE routes, approved by founder decision 2 for guarded preview only:
   * `noindex`, no sitemap entry, no production redirect in this task. `/fl/jackpot-triple-play` is the one
   * of the three that already exists in the sitemap (5 archive years), and it is not modified.
   *
   * `gameId` is the family's FIRST member in configured order — Pick 3 Midday (332), Cash Pop Morning (614).
   * It identifies the page's primary record for schema and metadata. Member composition itself is NOT
   * declared here: it lives in `config/states/fl.json` `presentation.families`, so Midday and Evening cannot
   * drift between the State page and this one.
   */
  /*
   * ══ LRG-GAME-052: TEN REPRESENTATIVE JG-M2 PAIRS ACROSS TWO JURISDICTIONS ══
   *
   * The point of ten is format coverage, not volume. Between them they exercise every presentation the format
   * profile classifies:
   *
   *   digits (2, 3, 4 and 5 positions)  fl/pick-2, fl/pick-3, fl/pick-4, fl/pick-5, ca/daily-3
   *   single value                      fl/cash-pop
   *   unordered set                     fl/fantasy-5 (5/36), fl/lotto (6/53), fl/jackpot-triple-play (6/46)
   *   main + special group              ca/superlotto-plus (5/47 + Mega 1/27)
   *   multi-member families             pick-2/3/4/5 and ca/daily-3 (2 rows), fl/cash-pop (5 rows)
   *   single-member families            fl/lotto, fl/jackpot-triple-play, ca/superlotto-plus
   *   second jurisdiction               ca/daily-3, ca/superlotto-plus — proving nothing is Florida-bound
   *
   * ROUTE CLASSIFICATION. `Game.getGameNameForURL()` derives a legacy URL from `game.NAME`, and the production
   * sitemap confirms which exist. `/fl/lotto` and `/fl/jackpot-triple-play` are PRESERVED existing routes;
   * `/fl/fantasy-5` exists and currently serves one member; every `pick-*`, `cash-pop`, `ca/daily-3` and
   * `ca/superlotto-plus` page is an INTRODUCED route. All ten are guarded preview only: `noindex`, absent from
   * every sitemap, no redirect in either direction.
   *
   * `gameId` is the family's FIRST configured member. Member composition itself is NOT declared here — it lives
   * in `config/states/{code}.json` `presentation.families`, so a family cannot drift from the State page.
   */
  { stateCode: "fl", gameSlug: "pick-2", gameId: 563, mode: "JG-M2", configPath: "config/games/fl-pick-2.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "pick-3", gameId: 332, mode: "JG-M2", configPath: "config/games/fl-pick-3.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "pick-4", gameId: 334, mode: "JG-M2", configPath: "config/games/fl-pick-4.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "pick-5", gameId: 565, mode: "JG-M2", configPath: "config/games/fl-pick-5.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "cash-pop", gameId: 614, mode: "JG-M2", configPath: "config/games/fl-cash-pop.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "fantasy-5", gameId: 640, mode: "JG-M2", configPath: "config/games/fl-fantasy-5.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "jackpot-triple-play", gameId: 582, mode: "JG-M2", configPath: "config/games/fl-jackpot-triple-play.json", previewEnabled: true },
  { stateCode: "fl", gameSlug: "lotto", gameId: 337, mode: "JG-M2", configPath: "config/games/fl-lotto.json", previewEnabled: true },
  { stateCode: "ca", gameSlug: "daily-3", gameId: 311, mode: "JG-M2", configPath: "config/games/ca-daily-3.json", previewEnabled: true },
  { stateCode: "ca", gameSlug: "superlotto-plus", gameId: 316, mode: "JG-M2", configPath: "config/games/ca-superlotto-plus.json", previewEnabled: true },
]);

export function gameRegistryEntry(stateCode: string, gameSlug: string): GameRegistryEntry | undefined {
  const s = stateCode.toLowerCase();
  const g = gameSlug.toLowerCase();
  return ELIGIBLE.find((e) => e.stateCode === s && e.gameSlug === g);
}

/** Whether this jurisdiction-and-game pair may render the new Game Page at all. */
export function isGamePreviewEligible(stateCode: string, gameSlug: string): boolean {
  return gameRegistryEntry(stateCode, gameSlug)?.previewEnabled === true;
}

/** Every eligible pair, as `{state}/{game}`. Used by tests and by the implementation record. */
export function eligiblePairs(): string[] {
  return ELIGIBLE.map((e) => `${e.stateCode}/${e.gameSlug}`);
}
