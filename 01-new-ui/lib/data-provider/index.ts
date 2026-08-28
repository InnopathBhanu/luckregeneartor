import type {
  StatePageData,
  ResultFormatDefinition,
  AdSlotDefinition,
  AdSizeMapping,
  FooterConfig,
  HomePageData,
} from "./types";
import type { Campaign } from "../campaign/types";
import adSlotDefinitions from "./fixtures/ad-slot-definitions.json";
import campaignsSample from "./fixtures/campaigns-sample.json";
import footerConfig from "./fixtures/footer-config.json";
import homePageSample from "./fixtures/home-page-sample.json";
import resultFormatDefinitions from "./fixtures/result-format-definitions.json";
import stateArSample from "./fixtures/state-ar-sample.json";
import stateAzSample from "./fixtures/state-az-sample.json";
import stateCaSample from "./fixtures/state-ca-sample.json";
import stateCoSample from "./fixtures/state-co-sample.json";
import stateCtSample from "./fixtures/state-ct-sample.json";
import stateDeSample from "./fixtures/state-de-sample.json";
import stateFlSample from "./fixtures/state-fl-sample.json";
import stateLaSample from "./fixtures/state-la-sample.json";
import stateMaSample from "./fixtures/state-ma-sample.json";
import stateMdSample from "./fixtures/state-md-sample.json";
import stateMeSample from "./fixtures/state-me-sample.json";
import stateMiSample from "./fixtures/state-mi-sample.json";
import stateMnSample from "./fixtures/state-mn-sample.json";
import stateMsSample from "./fixtures/state-ms-sample.json";
import stateNySample from "./fixtures/state-ny-sample.json";
import stateVaSample from "./fixtures/state-va-sample.json";

/*
 * Phase-1 sample data-provider.
 *
 * Imports the runtime-safe JSON copied byte-for-byte from 04-sample-data into this source folder. Bundling the
 * files makes a deployment whose root is `01-new-ui` self-contained; the originals remain the provenance
 * records. This is the ONLY layer that knows the current data comes from fixtures. The presentation types here
 * are not future domain/API contracts. No live API calls and no DB access occur in this implementation.
 */

/** JSON imports are untrusted presentation input at this adapter boundary, just as parsed JSON was before. */
function bundledFixture<T>(value: unknown): T {
  return value as T;
}

const STATE_PAGE_SAMPLES: Readonly<Record<string, StatePageData>> = Object.freeze({
  ar: bundledFixture<StatePageData>(stateArSample),
  az: bundledFixture<StatePageData>(stateAzSample),
  ca: bundledFixture<StatePageData>(stateCaSample),
  co: bundledFixture<StatePageData>(stateCoSample),
  ct: bundledFixture<StatePageData>(stateCtSample),
  de: bundledFixture<StatePageData>(stateDeSample),
  fl: bundledFixture<StatePageData>(stateFlSample),
  la: bundledFixture<StatePageData>(stateLaSample),
  ma: bundledFixture<StatePageData>(stateMaSample),
  md: bundledFixture<StatePageData>(stateMdSample),
  me: bundledFixture<StatePageData>(stateMeSample),
  mi: bundledFixture<StatePageData>(stateMiSample),
  mn: bundledFixture<StatePageData>(stateMnSample),
  ms: bundledFixture<StatePageData>(stateMsSample),
  ny: bundledFixture<StatePageData>(stateNySample),
  va: bundledFixture<StatePageData>(stateVaSample),
});

/** Full fixture-backed state-page payload for one of the 16 existing supported state samples. */
export function getStatePage(stateCode: string): StatePageData | null {
  return STATE_PAGE_SAMPLES[stateCode.toLowerCase()] ?? null;
}

let _home: HomePageData | null = null;
/** Current Home presentation fixture. */
export function getHomePage(): HomePageData {
  if (!_home) _home = bundledFixture<HomePageData>(homePageSample);
  return _home;
}

let _campaigns: Campaign[] | null = null;
/** Current internal campaign/banner presentation fixtures. */
export function getCampaigns(): Campaign[] {
  if (!_campaigns) {
    const data = bundledFixture<{ campaigns?: Campaign[] }>(campaignsSample);
    _campaigns = data.campaigns ?? [];
  }
  return _campaigns;
}

export function getAvailableStateSamples(): string[] {
  return Object.keys(STATE_PAGE_SAMPLES);
}

let _formats: Map<number, ResultFormatDefinition> | null = null;
export function getResultFormat(gameId: number): ResultFormatDefinition | null {
  if (!_formats) {
    const data = bundledFixture<{ formats: ResultFormatDefinition[] }>(resultFormatDefinitions);
    _formats = new Map(data.formats.map((f) => [f.gameId, f]));
  }
  return _formats.get(gameId) ?? null;
}

let _adSlots: Map<string, AdSlotDefinition> | null = null;
let _sizeMappings: Record<string, AdSizeMapping> | null = null;

function loadAdDefs() {
  if (_adSlots && _sizeMappings) return;
  const data = bundledFixture<Record<string, unknown>>(adSlotDefinitions);
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
  if (!_footer) _footer = bundledFixture<FooterConfig>(footerConfig);
  return _footer;
}
