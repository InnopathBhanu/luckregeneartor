/*
 * MINIMAL GOOGLE PUBLISHER TAG TYPINGS — LRG-ADS-CANARY-001.
 *
 * Hand-written rather than installed: no dependency may be added by this task, and the canary uses a small,
 * stable part of the GPT surface. Everything declared here is a method this repository actually calls, so an
 * unused-API drift is visible as an unused declaration rather than hidden inside a large vendored file.
 *
 * `googletag` is `unknown` until the library loads; every call site goes through `googletag.cmd.push`, which
 * is the documented way to queue work against a tag that may not have initialised yet.
 */

declare namespace googletag {
  type SingleSize = [number, number] | "fluid";
  type SizeOrArray = SingleSize | SingleSize[];

  interface SizeMappingBuilder {
    addSize(viewportSize: [number, number], slotSizes: SizeOrArray): SizeMappingBuilder;
    build(): unknown;
  }

  interface Slot {
    defineSizeMapping(mapping: unknown): Slot;
    addService(service: unknown): Slot;
    setCollapseEmptyDiv(collapse: boolean, collapseBeforeAdFetch?: boolean): Slot;
    getSlotElementId(): string;
    getAdUnitPath(): string;
  }

  /**
   * The page-level configuration object — `googletag.setConfig()`.
   *
   * Only the three keys this repository sets are declared. Each was checked against the current GPT reference
   * before use (LRG-ADS-CANARY-002 §4): the page-level collapse control is `collapseDiv`, NOT the legacy
   * service method's name `collapseEmptyDivs`.
   */
  interface PageSettingsConfig {
    disableInitialLoad?: boolean;
    singleRequest?: boolean;
    /**
     * ENABLES collapsing. `false` is NOT an accepted value — the live library answers
     * "Invalid value encountered when calling: googletag.setConfig.collapseDiv: false" (goo.gle/gpt-message#159).
     * This repository omits the key, which keeps GPT's non-collapsing default. Typed as `true` only, so the
     * rejected value cannot be written again by accident.
     */
    collapseDiv?: true;
  }

  interface PubAdsService {
    /** @deprecated Superseded by `setConfig({ singleRequest })`. Retained for the typing of older builds. */
    enableSingleRequest(): void;
    /** @deprecated Superseded by `setConfig({ disableInitialLoad })` — GPT emits goo.gle/gpt-message#170. */
    disableInitialLoad(): void;
    /** @deprecated Superseded by `setConfig({ collapseDiv })`. */
    collapseEmptyDivs(collapseBeforeAdFetch?: boolean): void;
    refresh(slots?: Slot[] | null, options?: { changeCorrelator?: boolean }): void;
    addEventListener(eventName: string, listener: (event: never) => void): void;
  }

  interface SlotRenderEndedEvent {
    slot: Slot;
    isEmpty: boolean;
    size: number[] | string | null;
    advertiserId?: number | null;
    lineItemId?: number | null;
    creativeId?: number | null;
  }

  interface SlotRequestedEvent {
    slot: Slot;
  }

  interface SlotOnloadEvent {
    slot: Slot;
  }

  const cmd: { push(fn: () => void): void };
  function defineSlot(adUnitPath: string, size: SizeOrArray, divId: string): Slot | null;
  function sizeMapping(): SizeMappingBuilder;
  function pubads(): PubAdsService;
  function setConfig(config: PageSettingsConfig): void;
  function enableServices(): void;
  function display(divId: string): void;
  function destroySlots(slots?: Slot[]): boolean;
  function apiReady(): boolean;
}

interface Window {
  googletag?: typeof googletag & { cmd: { push(fn: () => void): void } };
}
