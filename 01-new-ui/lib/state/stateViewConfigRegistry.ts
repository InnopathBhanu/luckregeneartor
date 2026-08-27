/*
 * THE ONE GOVERNED STATE PREVIEW REGISTRY — LRG-STATE-047 REG-01.
 *
 * Authority: `FD-X-14` (the six representative validation States and their order), `FD-S-30` (route
 * existence comes from an explicit registry, never from a fixture filename), CLAUDE.md §10.
 *
 * ══ WHAT THIS FILE DECIDES, AND WHY IT IS ONE FILE ══
 *
 * Before this task the same question — "is this State part of the new template?" — was answered in two
 * places: `jurisdictionRegistry.ts` carried `code === "fl" ? { previewEnabled: true }`, and this module
 * carried a one-entry config map. Two declarations of one fact is how they drift. There is now ONE
 * declaration, `PREVIEW_STATES` below, and `jurisdictionRegistry.ts` reads it rather than restating it.
 *
 * ══ THE THREE CONDITIONS, DELIBERATELY SEPARATE ══
 *
 *   1. a configuration FILE exists and validates;
 *   2. the registry lists the State as a preview State;
 *   3. the configuration's own `preview.enabled` is true.
 *
 * All three must hold. REG-01 is explicit that a State must not become live merely because someone added a
 * JSON file, so the file's existence is necessary and never sufficient. Condition 3 exists so a State can be
 * parked — configuration written, preview off — without deleting work or editing this file.
 *
 * ══ WHAT THIS FILE IS NOT ══
 *
 * It is not a route registry. `jurisdictionRegistry.ts` still owns which `/{state}` routes exist, which is a
 * separate and much larger question (53 jurisdictions, of which six are configured here). A State can have a
 * route and no preview configuration; that is the normal case and it keeps the existing implementation.
 */

import { validateStateViewConfig, type StateViewConfig } from "./stateViewConfig";
import { FLORIDA_VIEW_CONFIG } from "./floridaLowerPageContent";
import miRaw from "../../config/states/mi.json" with { type: "json" };
import vaRaw from "../../config/states/va.json" with { type: "json" };
import caRaw from "../../config/states/ca.json" with { type: "json" };
import mdRaw from "../../config/states/md.json" with { type: "json" };
import utRaw from "../../config/states/ut.json" with { type: "json" };

/** How complete a State's approved public content package is. Reported, never inferred from emptiness. */
export type ContentPackageStatus = "approved" | "none";

export interface StatePreviewRegistryEntry {
  code: string;
  slug: string;
  /** The configuration file this State loads, recorded so an error can name it. */
  configPath: string;
  /** Registry-level enablement. ANDed with the configuration's own `preview.enabled`. */
  previewEnabled: boolean;
  lotteryProfile: "lottery" | "noLottery";
  /**
   * Whether the current implementation can serve this State's new template.
   *
   * `ready` means a validated configuration plus, for a lottery State, transcribed runtime result data.
   * Utah is `ready` with no result data because the no-lottery profile needs none — that is the profile,
   * not a gap.
   */
  implementationEligibility: "ready" | "blocked";
  contentPackage: ContentPackageStatus;
}

/**
 * The six preview States of `FD-X-14`, in that ruling's own order.
 *
 * This list is the phase scope. LRG-STATE-047 is explicit that configurations must NOT be created for every
 * jurisdiction, because the purpose is to validate architecture against real variation rather than to
 * produce dozens of shallow files.
 */
export const PREVIEW_STATES: readonly StatePreviewRegistryEntry[] = Object.freeze([
  {
    code: "fl", slug: "fl", configPath: "config/states/fl.json", previewEnabled: true,
    lotteryProfile: "lottery", implementationEligibility: "ready", contentPackage: "approved",
  },
  {
    code: "mi", slug: "mi", configPath: "config/states/mi.json", previewEnabled: true,
    lotteryProfile: "lottery", implementationEligibility: "ready", contentPackage: "none",
  },
  {
    code: "va", slug: "va", configPath: "config/states/va.json", previewEnabled: true,
    lotteryProfile: "lottery", implementationEligibility: "ready", contentPackage: "none",
  },
  {
    code: "ca", slug: "ca", configPath: "config/states/ca.json", previewEnabled: true,
    lotteryProfile: "lottery", implementationEligibility: "ready", contentPackage: "none",
  },
  {
    code: "md", slug: "md", configPath: "config/states/md.json", previewEnabled: true,
    lotteryProfile: "lottery", implementationEligibility: "ready", contentPackage: "none",
  },
  {
    code: "ut", slug: "ut", configPath: "config/states/ut.json", previewEnabled: true,
    lotteryProfile: "noLottery", implementationEligibility: "ready", contentPackage: "none",
  },
]);

/*
 * Configurations are validated AT MODULE LOAD, so a malformed file fails the build and the test run rather
 * than producing a broken page for one State (REG-03). Florida's is imported already-validated from its own
 * module, which keeps its load-time content-safety assertion in the same place it has always been.
 */
const CONFIGS: Record<string, StateViewConfig> = {
  fl: FLORIDA_VIEW_CONFIG,
  mi: validateStateViewConfig(miRaw, "config/states/mi.json"),
  va: validateStateViewConfig(vaRaw, "config/states/va.json"),
  ca: validateStateViewConfig(caRaw, "config/states/ca.json"),
  md: validateStateViewConfig(mdRaw, "config/states/md.json"),
  ut: validateStateViewConfig(utRaw, "config/states/ut.json"),
};

/* The registry and the files it names must agree. Checked here rather than in a test alone, because a
   mismatch between the two would otherwise be a silent wrong-composition render for one State. */
for (const e of PREVIEW_STATES) {
  const cfg = CONFIGS[e.code];
  if (!cfg) throw new Error(`State registry: "${e.code}" is listed but has no loaded configuration.`);
  if (cfg.state.code !== e.code) {
    throw new Error(
      `State registry: ${e.configPath} declares code "${cfg.state.code}" but is registered as "${e.code}".`,
    );
  }
  if (cfg.state.lotteryProfile !== e.lotteryProfile) {
    throw new Error(
      `State registry: ${e.configPath} declares profile "${cfg.state.lotteryProfile}" but the registry says ` +
        `"${e.lotteryProfile}". These must agree — the page composition is chosen from the profile.`,
    );
  }
}

export function stateViewConfigFor(stateCode: string): StateViewConfig | undefined {
  return CONFIGS[stateCode.toLowerCase()];
}

/** Every jurisdiction with a validated configuration. Used by sitemap readiness. */
export function configuredStateCodes(): string[] {
  return Object.keys(CONFIGS);
}

export function previewRegistryEntry(stateCode: string): StatePreviewRegistryEntry | undefined {
  const c = stateCode.toLowerCase();
  return PREVIEW_STATES.find((e) => e.code === c);
}

/**
 * The single enablement test (REG-01, REG-02).
 *
 * Registry listing AND registry flag AND the configuration's own flag. A State missing any one of the three
 * keeps the existing implementation, which is what makes rollout reversible by data.
 */
export function isPreviewEnabledState(stateCode: string): boolean {
  const entry = previewRegistryEntry(stateCode);
  if (!entry || !entry.previewEnabled) return false;
  return stateViewConfigFor(stateCode)?.preview.enabled === true;
}

/** Codes of the States whose guarded preview is enabled, in `FD-X-14` order. */
export function previewEnabledStateCodes(): string[] {
  return PREVIEW_STATES.filter((e) => isPreviewEnabledState(e.code)).map((e) => e.code);
}
