/*
 * GAME CONFIGURATION LOADING — LRG-GAME-049.
 *
 * Separate from `gameRegistry.ts` on purpose. That module declares WHICH pairs are eligible; this one loads
 * and validates the configuration files behind them. Keeping them apart is what makes "a JSON file exists"
 * insufficient on its own: eligibility is a declaration, not a directory listing.
 *
 * Configurations validate AT MODULE LOAD, so a malformed file fails the build and the test run rather than
 * producing a broken page.
 */

import { validateGameViewConfig, type GameViewConfig } from "./gameViewConfig";
import { ELIGIBLE } from "./gameRegistry";
import flPowerball from "../../config/games/fl-powerball.json" with { type: "json" };
import flPick2 from "../../config/games/fl-pick-2.json" with { type: "json" };
import flPick3 from "../../config/games/fl-pick-3.json" with { type: "json" };
import flPick4 from "../../config/games/fl-pick-4.json" with { type: "json" };
import flPick5 from "../../config/games/fl-pick-5.json" with { type: "json" };
import flJtp from "../../config/games/fl-jackpot-triple-play.json" with { type: "json" };
import flCashPop from "../../config/games/fl-cash-pop.json" with { type: "json" };
import flFantasy5 from "../../config/games/fl-fantasy-5.json" with { type: "json" };
import flLotto from "../../config/games/fl-lotto.json" with { type: "json" };
import caDaily3 from "../../config/games/ca-daily-3.json" with { type: "json" };
import caSuperLotto from "../../config/games/ca-superlotto-plus.json" with { type: "json" };

const CONFIGS: Record<string, GameViewConfig> = {
  "fl/powerball": validateGameViewConfig(flPowerball, "config/games/fl-powerball.json"),
  "fl/pick-2": validateGameViewConfig(flPick2, "config/games/fl-pick-2.json"),
  "fl/pick-3": validateGameViewConfig(flPick3, "config/games/fl-pick-3.json"),
  "fl/pick-4": validateGameViewConfig(flPick4, "config/games/fl-pick-4.json"),
  "fl/pick-5": validateGameViewConfig(flPick5, "config/games/fl-pick-5.json"),
  "fl/jackpot-triple-play": validateGameViewConfig(flJtp, "config/games/fl-jackpot-triple-play.json"),
  "fl/cash-pop": validateGameViewConfig(flCashPop, "config/games/fl-cash-pop.json"),
  "fl/fantasy-5": validateGameViewConfig(flFantasy5, "config/games/fl-fantasy-5.json"),
  "fl/lotto": validateGameViewConfig(flLotto, "config/games/fl-lotto.json"),
  "ca/daily-3": validateGameViewConfig(caDaily3, "config/games/ca-daily-3.json"),
  "ca/superlotto-plus": validateGameViewConfig(caSuperLotto, "config/games/ca-superlotto-plus.json"),
};

/* The registry and the files it names must agree, or one State's page renders another's configuration. */
for (const e of ELIGIBLE) {
  const key = `${e.stateCode}/${e.gameSlug}`;
  const cfg = CONFIGS[key];
  if (!cfg) throw new Error(`Game registry: "${key}" is eligible but has no loaded configuration.`);
  if (cfg.game.stateCode !== e.stateCode || cfg.game.gameSlug !== e.gameSlug) {
    throw new Error(`Game registry: ${e.configPath} declares a different pair than its registry entry.`);
  }
  if (cfg.game.gameId !== e.gameId) {
    throw new Error(`Game registry: ${e.configPath} declares game id ${cfg.game.gameId}, registry says ${e.gameId}.`);
  }
  if (cfg.game.mode !== e.mode) {
    throw new Error(`Game registry: ${e.configPath} declares mode ${cfg.game.mode}, registry says ${e.mode}.`);
  }
}

export function gameConfigFor(stateCode: string, gameSlug: string): GameViewConfig | undefined {
  return CONFIGS[`${stateCode.toLowerCase()}/${gameSlug.toLowerCase()}`];
}

export function configuredGamePairs(): string[] {
  return Object.keys(CONFIGS);
}
