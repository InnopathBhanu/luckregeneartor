/*
 * Game logo registry — recognition assets for the guarded Home preview.
 *
 * Authority: LRG-UI-010 direction 2 (add recognizable logos), LRG-UI-011 §7 (increase recognition
 * value) and §8 (verify the disputed asset).
 *
 * BOUNDARY: logos are RECOGNITION ASSETS ONLY. They must never imply LotteryCorner is an official
 * lottery operator, and the game name is always rendered as visible text beside the mark.
 *
 * PROVENANCE lives in ./game-logo-manifest.json — a PRIVATE file under lib/, deliberately not under
 * public/. The previous manifest was served at /game-logos/logo-manifest.json and exposed internal
 * repository layout; LRG-UI-011 §9 moved it here and deleted the public copy.
 *
 * VERIFICATION GATE: only an asset whose identity is positively verified may appear here. An
 * unverified or disproven asset renders as the game's text name and nothing else — a wrong brand
 * mark on a lottery game is worse than no mark at all.
 */

export interface GameLogo {
  /** Public path under /public. */
  src: string;
  /** Intrinsic pixel size, so the browser reserves the box and the aspect ratio is never guessed. */
  width: number;
  height: number;
}

/**
 * VERIFIED assets only.
 *
 * `lotto.webp` (copied to /game-logos/lotto-america.webp) is DELIBERATELY ABSENT. LRG-UI-010 mapped
 * it to Lotto America by inferring from the generic filename. LRG-UI-011 tested that inference and
 * disproved it: the file is referenced nowhere in the legacy application, and the artwork reads
 * "FLORIDA LOTTO … with Double Play". Lotto America therefore renders as text only until a correct
 * mark is sourced or the founder re-maps the asset. See the manifest entry for the full evidence.
 */
const LOGOS: Record<string, GameLogo> = {
  powerball: { src: "/game-logos/powerball.jpg", width: 181, height: 61 },
  "mega-millions": { src: "/game-logos/mega-millions.png", width: 97, height: 39 },
  /*
   * STATE-SCOPED, and that scoping is load-bearing.
   *
   * A bare `pick-3` key would be wrong, not merely imprecise: the legacy logo library holds a DIFFERENT Pick 3
   * mark for roughly thirty jurisdictions (Maine, Iowa, Ohio, Texas, Virginia…), and `img/social/pick3.webp`
   * — the file a filename search finds first — is Maine's. Keying on the game slug alone would put Florida's
   * mark on Virginia's Pick 3 page.
   *
   * Verified by direct visual inspection of `img/logos/florida/florida-pick3.png`: it reads "PICK 3 PLUS
   * FIREBALL" over the Florida Lottery starburst. The FIREBALL lockup independently corroborates that the
   * asset is CURRENT — FIREBALL launched 2021-01-18 — and its sibling `florida-cash3.png` reads "CA$H 3",
   * the pre-2016 name, which is the era this one supersedes.
   */
  "fl-pick-3": { src: "/game-logos/fl-pick-3.webp", width: 140, height: 77 },
};

/** Returns the logo for a game slug, or null when no VERIFIED asset exists. */
export function gameLogo(gameSlug: string | undefined): GameLogo | null {
  if (!gameSlug) return null;
  return LOGOS[gameSlug] ?? null;
}

/**
 * Match a logo by display name, for sections that carry a name but no slug (the H-02B jackpot
 * comparison rows). Deliberately conservative: exact normalised match only, so a partial name can
 * never attach the wrong brand mark to a game.
 */
export function gameLogoByName(displayName: string | undefined): GameLogo | null {
  if (!displayName) return null;
  const key = displayName.trim().toLowerCase().replace(/\s+/g, "-");
  return LOGOS[key] ?? null;
}
