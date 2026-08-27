/*
 * Florida game-family composition — DATA ONLY.
 *
 * Task LRG-STATE-030. This file is the *configuration* that the generic presentation layer consumes.
 * It contains no rendering logic and no component reads a Florida name: `FD-X-01` requires that family
 * composition be data, so any jurisdiction supplies its own equivalent of this file.
 *
 * THE DOMAIN MODEL IS UNCHANGED. Every `gameId` below is the member game's own id, exactly as the
 * production feed and the legacy database carry it. Nothing is merged, renamed or synthesised. `Pick 3
 * Midday` (332) and `Pick 3 Evening` (333) remain two independent game records that happen to render as two
 * stable rows inside one `Pick 3` surface.
 *
 * VISUAL IDENTITY. `visualIdentity` is set ONLY where a POSITIVELY VERIFIED brand asset exists in
 * `lib/preview/gameLogoRegistry.ts` — Powerball and Mega Millions. Every Florida-native family
 * deliberately carries none, and renders a neutral lettered mark instead. A wrong or invented brand mark
 * on a lottery game is worse than no mark (LRG-UI-011 §8), so no token is created hopefully.
 *
 * OPEN FOUNDER ITEM. `public/game-logos/lotto-america.webp` was mis-mapped to Lotto America by
 * LRG-UI-010; LRG-UI-011 disproved that and recorded that the artwork actually reads
 * "FLORIDA LOTTO ... with Double Play". It is therefore very likely the correct Florida Lotto mark — but
 * the registry states re-mapping it is a founder decision, so this task does NOT re-map it.
 *
 * GROUPING RULES APPLIED (task §4):
 *   - Pick 2 / 3 / 4 / 5 — each its own family; members keep their own ids.
 *   - Fantasy 5 — one family, two members (Midday 640, Evening 336). Separate ids.
 *   - Cash Pop — one family, five members (614-618). Separate ids.
 *   - Powerball and Mega Millions — single-member families; Powerball Double Play is a SECONDARY RESULT
 *     inside Powerball, never a member row.
 *   - Florida Lotto — single member; its Double Play is likewise a secondary result.
 *   - EZmatch and Combo are purchase-time add-ons and appear nowhere here.
 *   - Games are never grouped merely for sharing a format shape: Pick 3 and Pick 5 are both digit games
 *     and remain separate families, because they are separate products.
 */

import type { GameFamilyConfig } from "./gameFamilyPresentation";

/**
 * `priority` orders families within their PF-02 group. It reflects State relevance and draw cadence — the
 * factors `FD-X-06` permits — and is explicitly **not** a desirability or jackpot ranking.
 */
export const FLORIDA_FAMILIES: readonly GameFamilyConfig[] = [
  /* ---- multi-state (PF-02 group renders first inside S-02, but never ahead of the first native result
          on mobile — that ordering is enforced by the section, per FD-N-02) ---- */
  {
    familyId: "powerball",
    familyLabel: "Powerball",
    visualIdentity: "powerball",
    group: "multiState",
    formatGameKey: "powerball",
    members: [{ gameId: 1012, variantLabel: "", displayOrder: 0 }],
    buyNowEligible: true,
    aiContextKey: "multiState",
    priority: 1,
  },
  {
    familyId: "mega-millions",
    familyLabel: "Mega Millions",
    visualIdentity: "mega-millions",
    group: "multiState",
    formatGameKey: "mega-millions",
    members: [{ gameId: 1013, variantLabel: "", displayOrder: 0 }],
    buyNowEligible: true,
    aiContextKey: "multiState",
    priority: 2,
  },

  /* ---- Florida jackpot games ---- */
  {
    familyId: "florida-lotto",
    familyLabel: "Florida Lotto",
    group: "stateOnly",
    formatGameKey: "florida-lotto",
    members: [{ gameId: 337, variantLabel: "", displayOrder: 0 }],
    buyNowEligible: true,
    priority: 1,
  },
  {
    familyId: "jackpot-triple-play",
    familyLabel: "Jackpot Triple Play",
    group: "stateOnly",
    formatGameKey: "jackpot-triple-play",
    members: [{ gameId: 582, variantLabel: "", displayOrder: 0 }],
    buyNowEligible: true,
    priority: 2,
  },

  /* ---- Fantasy 5: two member games, stable order Midday then Evening ---- */
  {
    familyId: "fantasy-5",
    familyLabel: "Fantasy 5",
    group: "dailyVariants",
    formatGameKey: "fantasy-5",
    members: [
      { gameId: 640, variantLabel: "Midday", displayOrder: 0 },
      { gameId: 336, variantLabel: "Evening", displayOrder: 1 },
    ],
    buyNowEligible: true,
    aiContextKey: "gameRules",
    priority: 1,
  },

  /* ---- Pick family. Each is its own product; members are Midday then Evening. ---- */
  {
    familyId: "pick-2",
    familyLabel: "Pick 2",
    group: "dailyVariants",
    formatGameKey: "pick-2",
    members: [
      { gameId: 563, variantLabel: "Midday", displayOrder: 0 },
      { gameId: 564, variantLabel: "Evening", displayOrder: 1 },
    ],
    buyNowEligible: true,
    priority: 3,
  },
  {
    familyId: "pick-3",
    familyLabel: "Pick 3",
    group: "dailyVariants",
    formatGameKey: "pick-3",
    members: [
      { gameId: 332, variantLabel: "Midday", displayOrder: 0 },
      { gameId: 333, variantLabel: "Evening", displayOrder: 1 },
    ],
    buyNowEligible: true,
    aiContextKey: "gameRules",
    priority: 2,
  },
  {
    familyId: "pick-4",
    familyLabel: "Pick 4",
    group: "dailyVariants",
    formatGameKey: "pick-4",
    members: [
      { gameId: 334, variantLabel: "Midday", displayOrder: 0 },
      { gameId: 335, variantLabel: "Evening", displayOrder: 1 },
    ],
    buyNowEligible: true,
    priority: 4,
  },
  {
    familyId: "pick-5",
    familyLabel: "Pick 5",
    group: "dailyVariants",
    formatGameKey: "pick-5",
    members: [
      { gameId: 565, variantLabel: "Midday", displayOrder: 0 },
      { gameId: 566, variantLabel: "Evening", displayOrder: 1 },
    ],
    buyNowEligible: true,
    priority: 5,
  },

  /* ---- Cash Pop: five member games. The clearest case for the family surface — five equal-weight cards
          would dominate the hub, which FD-X-06 forbids. Order follows the published daypart sequence. ---- */
  {
    familyId: "cash-pop",
    familyLabel: "Cash Pop",
    group: "specialized",
    formatGameKey: "cash-pop",
    members: [
      { gameId: 614, variantLabel: "Morning", displayOrder: 0 },
      { gameId: 615, variantLabel: "Matinee", displayOrder: 1 },
      { gameId: 616, variantLabel: "Afternoon", displayOrder: 2 },
      { gameId: 617, variantLabel: "Evening", displayOrder: 3 },
      { gameId: 618, variantLabel: "Late Night", displayOrder: 4 },
    ],
    buyNowEligible: true,
    aiContextKey: "gameRules",
    priority: 1,
  },
];

/** Every member game id Florida's families claim — used by the identity guard. */
export const FLORIDA_FAMILY_MEMBER_IDS: readonly number[] = FLORIDA_FAMILIES.flatMap((f) =>
  f.members.map((m) => m.gameId),
);
