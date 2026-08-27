/*
 * FLORIDA LOWER-PAGE CONTENT — now loaded from validated JSON configuration (LRG-STATE-043 JSON-01/JSON-04).
 *
 * WHAT CHANGED. LRG-STATE-042 held the approved public copy in this TypeScript module. LRG-STATE-043 moves it
 * to `config/states/fl.json` and keeps this module as the typed, validated door onto it — which is exactly the
 * JSON-04 boundary: "When a TypeScript module still contains governed behavior or typing: keep it; load JSON
 * through it; do not move behavior into JSON."
 *
 * The behaviour that stays here is the safety guarantee: `assertLowerPageContentSafe` still runs at module
 * load, so a configuration that fabricates social proof or points a card outside LotteryCorner fails the build
 * rather than reaching a reader.
 *
 * Public copy is byte-identical to the approved integration — the JSON was generated from this module's own
 * previous values, so the rendered page cannot have moved. The visual freeze holds by construction.
 *
 * WHAT IS NOT IN THE JSON, by design (JSON-03): current numbers, dates, jackpots, cash values, next prizes,
 * status, corrections and freshness all remain runtime data; result mechanics remain in the format registry;
 * sourced publication facts and provenance remain in the Florida content manifest; commerce eligibility
 * remains in the Buy Now capability contract. The validator refuses runtime field names structurally.
 */

/* The import attribute is required by Node's ESM loader (the test runner) and supported by the bundler, so
   one import works in both without a filesystem read — which matters because this module is reachable from a
   client component. */
import raw from "../../config/states/fl.json" with { type: "json" };
import type { StateLowerPageContent } from "./stateLowerPageContent";
import { assertLowerPageContentSafe } from "./stateLowerPageContent";
import { validateStateViewConfig, lowerPageContentFrom } from "./stateViewConfig";

/** The validated Florida view configuration. Throws at load if the file is malformed. */
export const FLORIDA_VIEW_CONFIG = validateStateViewConfig(raw, "config/states/fl.json");

export const FLORIDA_LOWER_PAGE_CONTENT: StateLowerPageContent =
  lowerPageContentFrom(FLORIDA_VIEW_CONFIG);

/* Validated at module load: fabricated social proof or an outbound card link fails the build. */
assertLowerPageContentSafe(FLORIDA_LOWER_PAGE_CONTENT);
