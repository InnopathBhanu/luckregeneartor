/*
 * Explicit jurisdiction registry — the single source of State route existence.
 *
 * Task LRG-STATE-021. Authority: FD-S-30 (replace fixture-derived route existence with an explicit
 * registry distinguishing active / no-active-lottery / territory / non-page pseudo-jurisdiction /
 * unsupported; DO NOT create `/usx`); CLAUDE.md §10 ("MUST NEVER derive route existence from a
 * fixture filename or a directory listing").
 *
 * WHAT THIS REPLACES. `getAvailableStateSamples()` reads `04-sample-data/` with `readdirSync` and a
 * filename regex, so renaming a fixture silently deletes a public URL. That mechanism is not used by
 * the preview path. It is left in place for the guard-off route (which this task must not change) and
 * is superseded here.
 *
 * PROVENANCE OF THIS LIST — every entry is evidenced, none invented:
 *   - 48 jurisdictions + the `USX` pseudo-jurisdiction are present in the production results feed
 *     `04-sample-data/source-xml/latest-results-lc.xml` (49 `<State>` elements).
 *   - 5 no-active-lottery jurisdictions (al, ak, hi, ut, nv) are proven by dedicated legacy templates
 *     `WEB-INF/upgrade/results/state_{al,ak,hi,ut,nv}.jsp`, routed by `src/struts.xml`.
 *   - 48 + 5 = 53 = 50 states + DC + PR + VI. The arithmetic closes exactly.
 *   - `USX` ("MutliState(US)", stateId 149) is a feed grouping for multi-state games, NOT a place.
 *
 * ROUTE STATUS is declared, never computed. `supported` records the jurisdictions the existing
 * implementation already serves; that set was read from the repository once, at authoring time, and is
 * asserted here as data. It is not recomputed from the filesystem at runtime.
 */

import { isPreviewEnabledState } from "./stateViewConfigRegistry";

export type LotteryStatus = "active" | "noActiveLottery";
export type JurisdictionType = "state" | "district" | "territory" | "pseudoJurisdiction";

/**
 * `supported`  — a route exists today and may be linked.
 * `planned`    — a real jurisdiction with no route yet. Must be shown WITHOUT a link (PF-02 §31 needs a
 *                complete directory; CLAUDE.md §9 forbids controls that look functional but are not).
 * `notAPage`   — must never become a route. `USX` only.
 */
export type RouteStatus = "supported" | "planned" | "notAPage";

export interface Jurisdiction {
  code: string;
  name: string;
  type: JurisdictionType;
  lotteryStatus: LotteryStatus;
  routeStatus: RouteStatus;
  /** True only for jurisdictions whose guarded PF-02 preview is enabled. */
  previewEnabled?: boolean;
}

/* Codes the existing implementation already serves (16 state fixtures at authoring time). Declared,
   not derived — see the header note. */
const SUPPORTED = new Set([
  "ar", "az", "ca", "co", "ct", "de", "fl", "la", "ma", "md", "me", "mi", "mn", "ms", "ny", "va",
]);

/* The five jurisdictions with a dedicated legacy no-lottery template. FD-S-31 preserves their routes
   with the PF-02 ST-06 experience — which this task does NOT implement, so they stay `planned`. */
const NO_ACTIVE_LOTTERY = new Set(["al", "ak", "hi", "nv", "ut"]);

const TERRITORY = new Set(["pr", "vi"]);

/** name/code pairs transcribed from the production feed's `<State>` attributes, plus the five
    no-lottery jurisdictions from the legacy templates. */
const NAMES: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California", co: "Colorado",
  ct: "Connecticut", de: "Delaware", dc: "Washington D.C.", fl: "Florida", ga: "Georgia",
  hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa", ks: "Kansas",
  ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland", ma: "Massachusetts",
  mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri", mt: "Montana",
  ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey", nm: "New Mexico",
  ny: "New York", nc: "North Carolina", nd: "North Dakota", oh: "Ohio", ok: "Oklahoma",
  or: "Oregon", pa: "Pennsylvania", pr: "Puerto Rico", ri: "Rhode Island",
  sc: "South Carolina", sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah",
  vt: "Vermont", va: "Virginia", vi: "U.S. Virgin Islands", wa: "Washington",
  wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
};

function build(): Jurisdiction[] {
  const out: Jurisdiction[] = Object.entries(NAMES).map(([code, name]) => ({
    code,
    name,
    type: code === "dc" ? "district" : TERRITORY.has(code) ? "territory" : "state",
    lotteryStatus: NO_ACTIVE_LOTTERY.has(code) ? "noActiveLottery" : "active",
    routeStatus: SUPPORTED.has(code) ? "supported" : "planned",
    /*
     * LRG-STATE-047 REG-01. This used to be `code === "fl" ? { previewEnabled: true } : {}` — the same fact
     * the config registry also declared, in a second place. Preview enablement is now READ from the one
     * governed registry, so adding or parking a State is a registry edit and this file never changes again.
     */
    ...(isPreviewEnabledState(code) ? { previewEnabled: true } : {}),
  }));

  /* `USX` is a feed grouping, not a place. It carries `notAPage` so no code path can turn it into a
     route, and it is excluded from the visible directory. */
  out.push({
    code: "usx",
    name: "Multi-State (US)",
    type: "pseudoJurisdiction",
    lotteryStatus: "active",
    routeStatus: "notAPage",
  });

  return out;
}

export const JURISDICTIONS: readonly Jurisdiction[] = Object.freeze(build());

export function findJurisdiction(code: string): Jurisdiction | undefined {
  const c = code.toLowerCase();
  return JURISDICTIONS.find((j) => j.code === c);
}

/** Routes that may be generated and linked. Excludes `planned` and `notAPage` by construction. */
export function supportedRoutes(): string[] {
  return JURISDICTIONS.filter((j) => j.routeStatus === "supported").map((j) => j.code);
}

/** The S-18 directory: every real jurisdiction, `notAPage` excluded. `planned` entries are returned so
    they can be shown WITHOUT a link rather than omitted or falsely linked. */
export function directoryJurisdictions(): Jurisdiction[] {
  return JURISDICTIONS.filter((j) => j.routeStatus !== "notAPage").slice().sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function isPreviewJurisdiction(code: string): boolean {
  return findJurisdiction(code)?.previewEnabled === true;
}
