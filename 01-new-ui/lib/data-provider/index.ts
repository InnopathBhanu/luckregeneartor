import fs from "node:fs";
import path from "node:path";
import type {
  StatePageData,
  ResultFormatDefinition,
  AdSlotDefinition,
  AdSizeMapping,
  FooterConfig,
  HomePageData,
} from "./types";

/*
 * Phase-1 sample data-provider.
 *
 * Reads static JSON from 04-sample-data (single source of truth). This is the ONLY layer that
 * knows the data comes from sample files — swap this implementation for an API client later and
 * components/pages stay unchanged. No live API calls, no DB (see 03-docs/14).
 */

const SAMPLE_DIR =
  process.env.SAMPLE_DATA_DIR ||
  path.join(process.cwd(), "..", "04-sample-data");

function readJson<T>(file: string): T {
  const full = path.join(SAMPLE_DIR, file);
  const raw = fs.readFileSync(full, "utf-8");
  return JSON.parse(raw) as T;
}

/** Full state-page payload for a state code (Phase 1: only "fl" sample exists). */
export function getStatePage(stateCode: string): StatePageData | null {
  const file = `state-${stateCode.toLowerCase()}-sample.json`;
  const full = path.join(SAMPLE_DIR, file);
  if (!fs.existsSync(full)) return null;
  return readJson<StatePageData>(file);
}

let _home: HomePageData | null = null;
/** Home page payload (sample now, API later). */
export function getHomePage(): HomePageData {
  if (!_home) _home = readJson<HomePageData>("home-page-sample.json");
  return _home;
}

let _campaigns: import("../campaign/types").Campaign[] | null = null;
/** Internal campaign/banner definitions (sample now, API later). */
export function getCampaigns(): import("../campaign/types").Campaign[] {
  if (!_campaigns) {
    const data = readJson<{ campaigns: import("../campaign/types").Campaign[] }>("campaigns-sample.json");
    _campaigns = data.campaigns ?? [];
  }
  return _campaigns;
}

export function getAvailableStateSamples(): string[] {
  return fs
    .readdirSync(SAMPLE_DIR)
    .map((f) => /^state-([a-z]{2})-sample\.json$/.exec(f)?.[1])
    .filter((x): x is string => Boolean(x));
}

let _formats: Map<number, ResultFormatDefinition> | null = null;
export function getResultFormat(gameId: number): ResultFormatDefinition | null {
  if (!_formats) {
    const data = readJson<{ formats: ResultFormatDefinition[] }>(
      "result-format-definitions.json",
    );
    _formats = new Map(data.formats.map((f) => [f.gameId, f]));
  }
  return _formats.get(gameId) ?? null;
}

let _adSlots: Map<string, AdSlotDefinition> | null = null;
let _sizeMappings: Record<string, AdSizeMapping> | null = null;

function loadAdDefs() {
  if (_adSlots && _sizeMappings) return;
  const data = readJson<Record<string, unknown>>("ad-slot-definitions.json");
  const all: AdSlotDefinition[] = [];
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && "slotKey" in item) {
          all.push(item as AdSlotDefinition);
        }
      }
    }
  }
  _adSlots = new Map(all.map((s) => [s.slotKey, s]));
  _sizeMappings = (data.sizeMappings as Record<string, AdSizeMapping>) ?? {};
}

export function getAdSlot(slotKey: string): AdSlotDefinition | null {
  loadAdDefs();
  return _adSlots!.get(slotKey) ?? null;
}

/** Named GAM size mapping (desktop [992,0] + mobile [0,0] tiers) copied from the JSP. */
export function getAdSizeMapping(name?: string | null): AdSizeMapping | null {
  if (!name) return null;
  loadAdDefs();
  return _sizeMappings![name] ?? null;
}

let _footer: FooterConfig | null = null;
/** Production footer structure (from footerbar_upgrade_as.jspf). Global site chrome. */
export function getFooterConfig(): FooterConfig {
  if (!_footer) _footer = readJson<FooterConfig>("footer-config.json");
  return _footer;
}
