/*
 * THE ONE GPT LIFECYCLE — LRG-ADS-CANARY-001 §3.
 *
 * ══ WHY A MODULE-LEVEL SINGLETON AND NOT COMPONENT STATE ══
 *
 * GPT is a global. `googletag.defineSlot` for a div id that already has a slot produces a duplicate-slot
 * warning and unpredictable delivery, and React gives three separate ways to arrive there:
 *
 *   - **Strict Mode** mounts every effect twice in development;
 *   - **client navigation** unmounts and remounts a slot without a page load;
 *   - **hydration recovery** re-runs effects from the recovered boundary (see §1 — this is why the community
 *     `<p>` defect had to be fixed before any of this could load safely).
 *
 * Component state cannot defend against those, because each of them produces a *new* component instance
 * against the *same* global. So slot identity lives here, keyed by div id, outside React's lifecycle, and
 * `defineSlot` is called at most once per div id per page view.
 *
 * ══ THE ORDER GPT REQUIRES ══
 *
 *   1. `setConfig({ disableInitialLoad, singleRequest, collapseDiv })` — BEFORE `enableServices()`.
 *      `disableInitialLoad` is what separates "register the slot" from "request the ad": with it, `display()`
 *      only registers, and nothing is fetched until `refresh()`. Without it, `display()` fetches immediately
 *      and the governed eager/lazy request boundary is bypassed. LRG-ADS-CANARY-002 §4 migrated these from the deprecated
 *      `pubads().disableInitialLoad()` / `enableSingleRequest()` / `collapseEmptyDivs()` service methods.
 *   2. `enableServices()` once.
 *   5. per slot: `defineSlot` → `defineSizeMapping` → `addService` → `display(divId)`.
 *   6. `refresh([slot])` when the slot is eligible — immediately for eager slots, at intersection for lazy.
 *
 * ══ WHAT THIS DELIBERATELY DOES NOT DO ══
 *
 *   - no targeting keys: none are recorded in the legacy evidence, and inventing one changes delivery;
 *   - no auto-refresh: an ad that re-requests itself inflates impressions and is not in any approved contract;
 *   - no `setCentering`, no lazy-load config, no privacy settings — none is recorded, so none is asserted.
 */

import { GAM_DESKTOP_MIN_WIDTH, GAM_NETWORK_CODE } from "./gamConfig";

/** The states a canary slot can be in, as surfaced on `data-ad-state` for the tester and the matrix. */
/*
 * `empty-response` was called `no-fill` — LRG-ADS-CANARY-003A defect 2.
 *
 * "No-fill" names a CAUSE: Ad Manager had no eligible line item. `slotRenderEnded.isEmpty === true` does not
 * establish that. Google's own GPT release notes record that a REQUEST NETWORK FAILURE also surfaces as an
 * empty `slotRenderEnded`, and consent state, geography, targeting and a creative-size mismatch can each end
 * the same way. The event tells us the slot rendered nothing; it does not tell us why.
 *
 * So the state is named after the OBSERVATION, and the causes are listed in `EMPTY_RESPONSE_CAUSES` for the
 * tester to discriminate with Publisher Console and network evidence. The visual treatment is unchanged — the
 * label is still suppressed and the reserved geometry is still retained — because what the reader should see
 * does not depend on which of those five things happened.
 */
export type SlotState =
  | "inactive"
  | "registered"
  | "requested"
  | "filled"
  | "empty-response"
  | "blocked";

/**
 * Everything an empty `slotRenderEnded` can mean. Not a diagnosis — the list a tester must rule out.
 *
 * Exported so the runbook and the tests state the same five possibilities, and so nothing in this codebase can
 * quietly narrow it back to one.
 */
export const EMPTY_RESPONSE_CAUSES: readonly string[] = Object.freeze([
  "genuine inventory no-fill (no eligible line item)",
  "line-item or targeting problem",
  "consent or geographic restriction",
  "creative-size mismatch against the requested sizes",
  "request network failure (recorded in the GPT release notes as also producing isEmpty)",
]);

export interface SlotRegistration {
  divId: string;
  gamPath: string;
  /** Flat fallback sizes, used when the slot has no named mapping. */
  sizes: number[][];
  /** Desktop tier ([992,0]) and mobile tier ([0,0]) from the slot's own named mapping, if it has one. */
  mapping: { minViewport: number[]; sizes: number[][] }[] | null;
  /** Below-fold slots wait for the viewport; above-fold slots request as soon as GAM is ready. */
  lazy: boolean;
}

type StateListener = (divId: string, state: SlotState, detail?: SlotDetail) => void;

export interface SlotDetail {
  /** The rendered creative size GPT reports, e.g. "728x90". Never an identifier. */
  renderedSize?: string | null;
  /** Why a slot is blocked, in non-sensitive terms. */
  reason?: string;
}

/* ------------------------------------------------------------------ module state */

const defined = new Map<string, googletag.Slot>();
const registrations = new Map<string, SlotRegistration>();
const states = new Map<string, SlotState>();
const requested = new Set<string>();
const listeners = new Set<StateListener>();

let servicesEnabled = false;
let libraryFailed = false;

/* ------------------------------------------------------------------ observation */

export function onSlotState(listener: StateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setState(divId: string, state: SlotState, detail?: SlotDetail): void {
  states.set(divId, state);
  for (const l of listeners) l(divId, state, detail);
}

export function slotState(divId: string): SlotState {
  return states.get(divId) ?? "inactive";
}

/** A non-sensitive snapshot for the debug panel and the verification matrix. */
export function snapshot(): { divId: string; gamPath: string; state: SlotState }[] {
  return [...registrations.values()].map((r) => ({
    divId: r.divId,
    gamPath: r.gamPath,
    state: states.get(r.divId) ?? "inactive",
  }));
}

/* ------------------------------------------------------------------ library */

function gpt(): Window["googletag"] | null {
  if (typeof window === "undefined") return null;
  window.googletag = window.googletag ?? ({ cmd: [] } as never);
  return window.googletag ?? null;
}

/** Queue work against GPT whether or not the library has finished loading. */
function push(fn: () => void): void {
  const g = gpt();
  if (!g) return;
  g.cmd.push(fn);
}

/** Marks every registered slot blocked — used when the library itself cannot load (ad blocker, network). */
export function markLibraryBlocked(reason: string): void {
  libraryFailed = true;
  for (const divId of registrations.keys()) {
    setState(divId, "blocked", { reason });
  }
}

export function isLibraryBlocked(): boolean {
  return libraryFailed;
}

/* ------------------------------------------------------------------ services */

/**
 * Configure `pubads` exactly once, in the order GPT requires.
 *
 * The event listeners are attached here rather than per slot: GPT dispatches service-level events, and adding
 * a listener per slot would fire every listener for every slot.
 */
function ensureServices(): void {
  if (servicesEnabled) return;
  servicesEnabled = true;

  push(() => {
    const g = window.googletag!;
    const pubads = g.pubads();

    /*
     * PAGE-LEVEL CONFIGURATION VIA `setConfig` — LRG-ADS-CANARY-002 §4.
     *
     * GPT itself reported the migration at runtime:
     *
     *     [GPT] PubAdsService.disableInitialLoad is deprecated,
     *           use googletag.setConfig({disableInitialLoad: ...}) instead.   (goo.gle/gpt-message#170)
     *
     * `PageSettingsConfig` was then checked against the current GPT reference before changing anything:
     * `disableInitialLoad` and `singleRequest` are both current boolean properties, and the collapse control
     * is named `collapseDiv` at page level (NOT `collapseEmptyDivs`, which is the legacy service method).
     *
     * ORDER IS LOAD-BEARING, and the official "Control ad loading" guide is explicit: `setConfig` with
     * `disableInitialLoad` must run BEFORE `enableServices()` and before any `display()`. With it, `display()`
     * only registers the div and `refresh()` is the sole act that requests an ad — which is the whole
     * mechanism the explicit request lifecycle depends on. Reversed, `display()` would fetch before the slot's
     * eager/lazy request decision.
     *
     * `collapseDiv` IS DELIBERATELY OMITTED, and that is a verified decision rather than an oversight.
     *
     * The first draft passed `collapseDiv: false`, reasoning that stating the non-collapsing behaviour
     * explicitly was better documentation. The live library rejected it:
     *
     *     [GPT] Invalid value encountered when calling: googletag.setConfig.collapseDiv: false
     *           (goo.gle/gpt-message#159)
     *
     * `collapseDiv` ENABLES collapsing; `false` is not among its accepted values, and the current reference
     * does not define one. Omitting the key is the documented way to keep GPT's default — which is not to
     * collapse — and that default is exactly what the reservation contract needs: a collapsed div on a
     * no-fill would reclaim the reserved box and reintroduce the layout shift `CLAUDE.md` §12 exists to
     * prevent. The behaviour is asserted by test rather than by a config value that does not exist.
     */
    g.setConfig({ disableInitialLoad: true, singleRequest: true });

    pubads.addEventListener("slotRequested", (e: never) => {
      const ev = e as unknown as googletag.SlotRequestedEvent;
      setState(ev.slot.getSlotElementId(), "requested");
    });

    pubads.addEventListener("slotRenderEnded", (e: never) => {
      const ev = e as unknown as googletag.SlotRenderEndedEvent;
      const divId = ev.slot.getSlotElementId();
      /*
       * `isEmpty` separates "something rendered" from "nothing rendered". It does NOT identify a cause.
       *
       * Calling this outcome `no-fill` asserted an inventory conclusion the event cannot support: per Google's
       * GPT release notes a request network failure also arrives here with `isEmpty === true`, and consent,
       * geography, targeting and creative-size mismatches do too. `empty-response` is what was actually
       * observed; `EMPTY_RESPONSE_CAUSES` is what still has to be ruled out, with Publisher Console and
       * network evidence.
       *
       * `size` is recorded because a rendered size that does not match the mapping is a real defect. Advertiser,
       * line-item and creative ids are deliberately NOT read: they identify a response and have no place in a
       * public DOM or a debug surface.
       */
      const size = Array.isArray(ev.size) ? ev.size.join("x") : (ev.size ?? null);
      setState(divId, ev.isEmpty ? "empty-response" : "filled", { renderedSize: ev.isEmpty ? null : size });
    });

    g.enableServices();
  });
}

/* ------------------------------------------------------------------ slots */

/** Build the slot's responsive mapping from its OWN recorded breakpoints. Never a re-derived guess. */
function applyMapping(slot: googletag.Slot, reg: SlotRegistration): void {
  if (!reg.mapping || reg.mapping.length === 0) return;
  const builder = window.googletag!.sizeMapping();
  for (const bp of reg.mapping) {
    const viewport: [number, number] = [bp.minViewport[0] ?? 0, bp.minViewport[1] ?? 0];
    builder.addSize(viewport, bp.sizes as googletag.SingleSize[]);
  }
  slot.defineSizeMapping(builder.build());
}

/**
 * Register one slot. Idempotent per div id — a second call for the same div is a no-op, which is what makes
 * Strict Mode's double mount and client-navigation remounts harmless.
 */
export function registerSlot(reg: SlotRegistration): void {
  if (defined.has(reg.divId)) return;
  if (!reg.gamPath.startsWith(`/${GAM_NETWORK_CODE}/`)) {
    /* A path outside the recorded network is a transcription fault, not something to request and find out. */
    setState(reg.divId, "blocked", { reason: "unit path is not in the recorded GAM network" });
    return;
  }

  registrations.set(reg.divId, reg);
  /* Claim the id synchronously, before the queued callback runs, so two mounts in the same tick cannot both
     pass the `defined.has` check above. The real slot replaces the placeholder inside the callback. */
  defined.set(reg.divId, null as unknown as googletag.Slot);

  ensureServices();

  push(() => {
    const g = window.googletag!;
    /* The element must exist when `display()` is called; if the component unmounted between the queue push
       and the flush, abandon quietly rather than defining a slot for a div that is gone. */
    if (!document.getElementById(reg.divId)) {
      defined.delete(reg.divId);
      registrations.delete(reg.divId);
      return;
    }

    const slot = g.defineSlot(reg.gamPath, reg.sizes as googletag.SingleSize[], reg.divId);
    if (!slot) {
      setState(reg.divId, "blocked", { reason: "defineSlot returned null" });
      defined.delete(reg.divId);
      return;
    }

    applyMapping(slot, reg);
    slot.addService(g.pubads());
    defined.set(reg.divId, slot);

    /* Registers the div with GPT. Because `disableInitialLoad()` ran first, this does NOT fetch. */
    g.display(reg.divId);
    setState(reg.divId, "registered");
  });
}

/**
 * Request one already-registered slot. Idempotent: a slot is refreshed at most once, because nothing in this
 * build auto-refreshes and a second refresh would be a second impression for one placement.
 */
export function requestSlot(divId: string): void {
  if (requested.has(divId)) return;
  requested.add(divId);
  push(() => {
    const slot = defined.get(divId);
    if (!slot) {
      requested.delete(divId);
      return;
    }
    window.googletag!.pubads().refresh([slot]);
  });
}

/**
 * Destroy a slot when its component unmounts or its div disappears during client navigation.
 *
 * Without this, the div id stays claimed inside GPT: a later mount of the same route finds the id already
 * defined, skips registration, and renders a permanently empty reservation. `destroySlots` releases both the
 * GPT-side slot and this module's bookkeeping so the next mount can define it cleanly.
 */
export function destroySlot(divId: string): void {
  const slot = defined.get(divId);
  defined.delete(divId);
  registrations.delete(divId);
  requested.delete(divId);
  states.delete(divId);

  /*
   * ANNOUNCE THE RESET — LRG-ADS-CANARY-002 §2.
   *
   * Clearing the map is not enough. Anything observing this slot — the outer `AdReservation`, the debug
   * panel — learned its state from a notification, so silently deleting the entry leaves those observers
   * displaying the LAST state forever. Measured before this line existed: after the tester pressed Stop, the
   * GPT divs were correctly removed but all ten Florida reservations still reported `data-ad-active="true"`
   * and the top billboard still read "Advertisement, not filled" — the exact class of false runtime state §2
   * exists to eliminate, reintroduced at teardown.
   *
   * Notified BEFORE the queued `destroySlots` because the React state change is immediate and the GPT call is
   * queued; the observable DOM must not lag behind the fact.
   */
  for (const l of listeners) l(divId, "inactive");

  if (!slot) return;
  push(() => {
    window.googletag!.destroySlots([slot]);
  });
}

/** The recorded desktop breakpoint, re-exported so a slot component need not import two modules. */
export { GAM_DESKTOP_MIN_WIDTH };
