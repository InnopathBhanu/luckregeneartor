/*
 * THE SHARED CONSOLE SECTION PROPS — LRG-FLAGSHIP-004.
 *
 * One prop shape for the four tool sections, so the page passes the same object to each and a new field cannot
 * reach one tool and miss another. State is NOT here: it lives in `FlagshipConsole`'s context, because the four
 * sections are no longer contiguous in the page order and must share it across the sections between them.
 */

import type { LockedCapability } from "@/lib/flagship/flagshipContract";
import type { FlagshipHistory } from "@/lib/flagship/flagshipHistory";
import type { StatView } from "@/lib/flagship/flagshipStats";
import type { CheckMatrix } from "@/lib/flagship/flagshipCheck";
import type { GeneratorMatrix } from "@/lib/flagship/flagshipGenerator";
import type { FlagshipDisplayMode } from "@/lib/flagship/flagshipDisplay";
import type { BffCheckerExample } from "@/lib/flagship/bff/flagshipBffContract";

/** What every console section needs from the model. Passed as plain props; state comes from the context. */
export interface ConsoleSectionProps {
  gameLabel: string;
  specialLabel: string | null;
  matrix: CheckMatrix;
  generatorMatrix: GeneratorMatrix;
  history: FlagshipHistory;
  historyDisclosure: string;
  /** What the published series can actually support. Computed in the model, never judged in a component. */
  coverage: {
    publishedDrawings: number;
    canSearchHistory: boolean;
    canCheckRange: boolean;
    canComputeStats: boolean;
  };
  statViews: readonly StatView[];
  statsMethod: string;
  multiplierMode: "independentlySelected" | "builtIn" | "none";
  multiplierLabel: string | null;
  multiplierValues: readonly number[];
  drawNights: readonly string[];
  secondaryLabel: string | null;
  insightBoundary: string;
  /** Which labelling register to use for a row's source. See `flagshipDisplay.ts`. */
  displayMode: FlagshipDisplayMode;
  /** Sample lines the checker offers, so the tool can be tried without typing a full ticket. */
  checkerExamples: readonly BffCheckerExample[];
  checkerLocks: readonly LockedCapability[];
  generatorLocks: readonly LockedCapability[];
  statsLocks: readonly LockedCapability[];
  lockedNote: string;
}
