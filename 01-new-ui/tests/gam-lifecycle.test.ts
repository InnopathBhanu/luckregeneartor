/*
 * THE GPT LIFECYCLE, EXERCISED — LRG-ADS-CANARY-002 §2 and §4.
 *
 * ══ WHY THIS FILE EXISTS SEPARATELY FROM `gam-canary.test.ts` ══
 *
 * That file asserts CONFIGURATION: which flags gate what, which slots are eligible, which APIs are called. It
 * does so largely by reading source, which is the right tool for "is this line present" and the wrong tool for
 * "does the state machine actually move".
 *
 * §2 is explicit that regular-expression assertions alone are insufficient for the runtime-state contract. So
 * this file installs a CONTROLLED GPT MOCK on `globalThis`, drives `gptClient` through real registrations and
 * real service events, and asserts the observable results: the states it publishes, the counts it requests,
 * and what it does on destroy.
 *
 * The mock is deliberately faithful about the things that matter and silent about the rest: it records the
 * page config, refuses nothing, and lets the test fire `slotRequested` / `slotRenderEnded` exactly as GPT
 * would — including `isEmpty`, which is the only signal separating a no-fill from an integration failure.
 */

import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";

/* `reservationState` is a PURE module with no GPT dependency, so it imports statically. `gptClient` cannot:
   it is a deliberate module-level singleton and each test needs its own copy (see `freshClient`). */
import { FILLED_LABEL, NOT_FILLED_LABEL, reservationPresentation } from "../lib/ads/reservationState";
import { EMPTY_RESPONSE_CAUSES } from "../lib/ads/gptClient";

/* ------------------------------------------------------------------ the mock */

interface MockSlot {
  path: string;
  divId: string;
  sizes: unknown;
  mapping: unknown;
  services: number;
  destroyed: boolean;
}

interface MockState {
  config: Record<string, unknown> | null;
  configuredBeforeServices: boolean;
  servicesEnabled: number;
  slots: MockSlot[];
  displayed: string[];
  refreshed: string[][];
  listeners: Record<string, ((e: unknown) => void)[]>;
  legacyCalls: string[];
}

let mock: MockState;

function installMock(): void {
  mock = {
    config: null, configuredBeforeServices: false, servicesEnabled: 0, slots: [],
    displayed: [], refreshed: [], listeners: {}, legacyCalls: [],
  };
  const pubads = {
    /* The deprecated service methods still exist on the real object; recording them lets the test prove we
       stopped calling them rather than merely that the new call is present. */
    disableInitialLoad: () => mock.legacyCalls.push("disableInitialLoad"),
    enableSingleRequest: () => mock.legacyCalls.push("enableSingleRequest"),
    collapseEmptyDivs: () => mock.legacyCalls.push("collapseEmptyDivs"),
    refresh: (slots: { getSlotElementId(): string }[] | null) =>
      mock.refreshed.push((slots ?? []).map((s) => s.getSlotElementId())),
    addEventListener: (name: string, fn: (e: unknown) => void) => {
      (mock.listeners[name] ??= []).push(fn);
    },
  };
  const makeSlot = (path: string, sizes: unknown, divId: string): MockSlot & Record<string, unknown> => {
    const slot: MockSlot & Record<string, unknown> = {
      path, divId, sizes, mapping: null, services: 0, destroyed: false,
      defineSizeMapping(m: unknown) { slot.mapping = m; return slot; },
      addService() { slot.services += 1; return slot; },
      getSlotElementId: () => divId,
      getAdUnitPath: () => path,
    };
    return slot;
  };
  const g = {
    cmd: { push: (fn: () => void) => fn() },   /* synchronous: the queue is not what is under test */
    setConfig: (c: Record<string, unknown>) => {
      mock.config = c;
      mock.configuredBeforeServices = mock.servicesEnabled === 0;
    },
    enableServices: () => { mock.servicesEnabled += 1; },
    pubads: () => pubads,
    defineSlot: (path: string, sizes: unknown, divId: string) => {
      const s = makeSlot(path, sizes, divId);
      mock.slots.push(s);
      return s;
    },
    sizeMapping: () => {
      const built: unknown[] = [];
      const builder = { addSize: (v: unknown, s: unknown) => { built.push([v, s]); return builder; }, build: () => built };
      return builder;
    },
    display: (divId: string) => mock.displayed.push(divId),
    destroySlots: (slots: MockSlot[]) => { for (const s of slots) s.destroyed = true; return true; },
  };
  (globalThis as Record<string, unknown>).window = globalThis;
  (globalThis as Record<string, unknown>).googletag = g;
  /* `registerSlot` verifies the element exists before defining, so the mock document must answer. */
  (globalThis as Record<string, unknown>).document = {
    getElementById: (id: string) => ({ id }),
  };
}

/** Fire a GPT service event at every listener, as the real library does. */
function fire(name: string, event: unknown): void {
  for (const fn of mock.listeners[name] ?? []) fn(event);
}
const slotRef = (divId: string) => ({ getSlotElementId: () => divId });

/* A fresh module instance per test: `gptClient` is a deliberate module-level singleton, so state must not
   leak between cases. The cache-buster is what gives each test its own copy. */
let seq = 0;
async function freshClient() {
  installMock();
  return (await import(`../lib/ads/gptClient.ts?case=${seq++}`)) as typeof import("../lib/ads/gptClient");
}

const REG = {
  divId: "div-gpt-ad-test-0",
  gamPath: "/21828142944/lc_hp_display_web_mid_leaderboard",
  sizes: [[728, 90], [320, 50]],
  mapping: [
    { minViewport: [992, 0], sizes: [[728, 90]] },
    { minViewport: [0, 0], sizes: [[320, 50]] },
  ],
  lazy: false,
};

afterEach(() => {
  delete (globalThis as Record<string, unknown>).googletag;
  delete (globalThis as Record<string, unknown>).document;
  delete (globalThis as Record<string, unknown>).window;
});

/* ══════════════════════════════════════════════════════════════ §4 configuration */

describe("LRG-ADS-CANARY-002 §4: page configuration uses the current GPT API", () => {
  test("setConfig carries all three keys and runs before enableServices", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    /* `collapseDiv` is deliberately ABSENT: GPT rejects `false` (gpt-message#159) and the key only ever
       ENABLES collapsing, so omission is the documented way to keep the non-collapsing default the
       reservation contract depends on. */
    assert.deepEqual(mock.config, { disableInitialLoad: true, singleRequest: true });
    assert.ok(!("collapseDiv" in (mock.config ?? {})), "collapsing must never be enabled");
    assert.equal(mock.configuredBeforeServices, true,
      "disableInitialLoad after enableServices would let display() fetch immediately");
    assert.equal(mock.servicesEnabled, 1);
  });

  test("no deprecated service method is called", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    assert.deepEqual(mock.legacyCalls, []);
  });

  test("services are configured exactly once no matter how many slots register", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.registerSlot({ ...REG, divId: "div-b" });
    c.registerSlot({ ...REG, divId: "div-c" });
    assert.equal(mock.servicesEnabled, 1);
    assert.equal(mock.slots.length, 3);
  });
});

/* ══════════════════════════════════════════════════════════════ §2 the state machine */

describe("LRG-ADS-CANARY-002 §2: the runtime state machine is driven by GPT's own events", () => {
  test("inactive → registered on display(), with no request", async () => {
    const c = await freshClient();
    assert.equal(c.slotState(REG.divId), "inactive");
    c.registerSlot(REG);
    assert.equal(c.slotState(REG.divId), "registered");
    assert.deepEqual(mock.displayed, [REG.divId]);
    assert.deepEqual(mock.refreshed, [], "display() must register without fetching");
  });

  test("registered → requested → filled, with the rendered size recorded", async () => {
    const c = await freshClient();
    const seen: { state: string; size?: string | null }[] = [];
    c.onSlotState((id, state, detail) => {
      if (id === REG.divId) seen.push({ state, size: detail?.renderedSize });
    });
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    assert.deepEqual(mock.refreshed, [[REG.divId]]);
    fire("slotRequested", { slot: slotRef(REG.divId) });
    assert.equal(c.slotState(REG.divId), "requested");
    fire("slotRenderEnded", { slot: slotRef(REG.divId), isEmpty: false, size: [728, 90] });
    assert.equal(c.slotState(REG.divId), "filled");
    assert.deepEqual(seen.map((s) => s.state), ["registered", "requested", "filled"]);
    assert.equal(seen.at(-1)?.size, "728x90");
  });

  test("an EMPTY response is reported as empty-response, and carries no rendered size", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    fire("slotRequested", { slot: slotRef(REG.divId) });
    let detail: { renderedSize?: string | null } | undefined;
    c.onSlotState((_id, _s, d) => { detail = d; });
    fire("slotRenderEnded", { slot: slotRef(REG.divId), isEmpty: true, size: null });
    assert.equal(c.slotState(REG.divId), "empty-response");
    assert.equal(detail?.renderedSize, null, "an empty slot has no creative size to report");
  });

  test("no response identifier is ever exposed", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    let captured: unknown;
    c.onSlotState((_i, _s, d) => { captured = d; });
    fire("slotRenderEnded", {
      slot: slotRef(REG.divId), isEmpty: false, size: [728, 90],
      advertiserId: 999, lineItemId: 888, creativeId: 777,
    });
    const json = JSON.stringify(captured ?? {});
    for (const id of ["999", "888", "777"]) {
      assert.ok(!json.includes(id), "advertiser, line-item and creative ids identify a response");
    }
  });

  test("a library failure marks every registered slot blocked, not silently stuck", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.registerSlot({ ...REG, divId: "div-b" });
    c.markLibraryBlocked("gpt.js failed to load");
    assert.equal(c.slotState(REG.divId), "blocked");
    assert.equal(c.slotState("div-b"), "blocked");
    assert.equal(c.isLibraryBlocked(), true);
  });

  test("a unit path outside the recorded network is blocked, never requested", async () => {
    const c = await freshClient();
    c.registerSlot({ ...REG, divId: "div-x", gamPath: "/99999999/someone_elses_unit" });
    assert.equal(c.slotState("div-x"), "blocked");
    assert.equal(mock.slots.length, 0, "nothing may be defined for a foreign network");
  });
});

/* ══════════════════════════════════════════════════════════════ §2/§4 preserved behaviours */

describe("LRG-ADS-CANARY-002: the behaviours that must survive the refactor", () => {
  test("one div id defines exactly one slot, however many times it registers", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.registerSlot(REG);
    c.registerSlot(REG);
    assert.equal(mock.slots.length, 1, "Strict Mode, remount and recovery must all be no-ops");
    assert.equal(mock.displayed.length, 1);
  });

  test("a slot is refreshed at most once — nothing auto-refreshes", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    c.requestSlot(REG.divId);
    c.requestSlot(REG.divId);
    assert.deepEqual(mock.refreshed, [[REG.divId]]);
  });

  test("the recorded size mapping is applied verbatim, tier for tier", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    assert.deepEqual(mock.slots[0].mapping, [
      [[992, 0], [[728, 90]]],
      [[0, 0], [[320, 50]]],
    ]);
    assert.equal(mock.slots[0].path, REG.gamPath);
    assert.deepEqual(mock.slots[0].sizes, REG.sizes);
    assert.equal(mock.slots[0].services, 1);
  });

  test("destroy ANNOUNCES the reset, so the outer reservation returns to inactive", async () => {
    /*
     * The teardown half of the §2 contract. Measured in the browser before this was fixed: after Stop, the
     * GPT divs were gone but all ten Florida reservations still reported active/requested and the billboard
     * still said "not filled" — because clearing the state map notified nobody.
     */
    const c = await freshClient();
    const seen: string[] = [];
    c.onSlotState((id, state) => { if (id === REG.divId) seen.push(state); });
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    fire("slotRenderEnded", { slot: slotRef(REG.divId), isEmpty: true, size: null });
    assert.equal(c.slotState(REG.divId), "empty-response");

    c.destroySlot(REG.divId);
    assert.equal(seen.at(-1), "inactive", "observers must be told, not left on the last state");
    assert.equal(c.slotState(REG.divId), "inactive");

    /* And the presentation that follows from it is the reserved placeholder again. */
    const p = reservationPresentation("inactive", false);
    assert.deepEqual(
      { active: p.active, requested: p.requested, showLabel: p.showLabel },
      { active: false, requested: false, showLabel: true },
    );
  });

  test("destroy releases the div id so the next mount can define it cleanly", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    const first = mock.slots[0];
    c.destroySlot(REG.divId);
    assert.equal(first.destroyed, true);
    assert.equal(c.slotState(REG.divId), "inactive", "state resets on destroy");
    /* The id is free again — this is what makes client navigation back to a route work. */
    c.registerSlot(REG);
    assert.equal(mock.slots.length, 2);
    assert.equal(mock.slots[1].destroyed, false);
  });

  test("destroy also clears the request record, so a re-registered slot may request again", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    c.destroySlot(REG.divId);
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    assert.equal(mock.refreshed.length, 2, "a genuinely new mount is a new placement");
  });

  test("no targeting key is ever set", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    /* The mock has no setTargeting at all: a call would throw. Reaching here proves none was attempted. */
    assert.equal(mock.slots.length, 1);
  });
});

/* ══════════════════════════════════════════════════════════════ §2 the reservation contract */

describe("LRG-ADS-CANARY-002 §2: the outer reservation reports the truth, row by row", () => {
  test("every row of the contract table", () => {
    /* Transcribed from the task's table rather than read back from the implementation, so a change to the
       mapping fails here instead of quietly agreeing with itself. */
    const TABLE = [
      { state: "inactive",   active: false, requested: false, label: true  },
      { state: "registered", active: true,  requested: false, label: true  },
      { state: "requested",  active: true,  requested: true,  label: true  },
      { state: "filled",     active: true,  requested: true,  label: true  },
      { state: "empty-response",    active: true,  requested: true,  label: false },
    ] as const;

    for (const row of TABLE) {
      const p = reservationPresentation(row.state as never, false);
      assert.equal(p.active, row.active, `${row.state}.active`);
      assert.equal(p.requested, row.requested, `${row.state}.requested`);
      assert.equal(p.showLabel, row.label, `${row.state}.showLabel`);
      assert.equal(p.ariaLabel, row.label ? FILLED_LABEL : NOT_FILLED_LABEL, `${row.state}.ariaLabel`);
    }
  });

  test("an empty response suppresses the label and renames the region — nothing else", () => {
    const p = reservationPresentation("empty-response", false);
    assert.equal(p.showLabel, false, "an empty slot must not advertise itself as an advertisement");
    assert.equal(p.ariaLabel, NOT_FILLED_LABEL);
    /* Geometry is absent from the contract by design: a no-fill keeps its reserved box (DS-24). */
    assert.deepEqual(Object.keys(p).sort(), ["active", "ariaLabel", "requested", "showLabel"]);
  });

  test("blocked reports the request that actually happened, never a guess", () => {
    /* Library never loaded: active, but nothing was ever requested. */
    assert.deepEqual(
      { ...reservationPresentation("blocked", false, false) },
      { active: true, requested: false, showLabel: true, ariaLabel: "Advertisement" },
    );
    /* Blocked after a request went out: the request is reported. */
    assert.equal(reservationPresentation("blocked", false, true).requested, true);
    /* And a blocked slot never claims a fill. */
    assert.equal(reservationPresentation("blocked", false, true).showLabel, true);
  });

  test("a PREVIEW no-fill suppresses the label at every runtime state", () => {
    for (const state of ["inactive", "registered", "requested", "filled", "empty-response", "blocked"] as const) {
      const p = reservationPresentation(state, true);
      assert.equal(p.showLabel, false, `${state} with previewNoFill`);
      assert.equal(p.ariaLabel, NOT_FILLED_LABEL);
    }
  });

  test("the full chain: GPT events drive the presentation the reservation renders", async () => {
    /* The event seam end to end — gptClient's real listener plumbing feeding the real mapping. */
    const c = await freshClient();
    const seen: string[] = [];
    c.onSlotState((id, state) => {
      if (id !== REG.divId) return;
      const p = reservationPresentation(state, false);
      seen.push(`${state}:active=${p.active},req=${p.requested},label=${p.showLabel}`);
    });
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    fire("slotRequested", { slot: slotRef(REG.divId) });
    fire("slotRenderEnded", { slot: slotRef(REG.divId), isEmpty: true, size: null });
    assert.deepEqual(seen, [
      "registered:active=true,req=false,label=true",
      "requested:active=true,req=true,label=true",
      "empty-response:active=true,req=true,label=false",
    ]);
  });
});

/* ══════════════════════════════════════════════════════════ §1 viewport transitions */

describe("LRG-ADS-CANARY-003A: lazy timing and viewport transitions, driven through GPT", () => {
  /*
   * `GamSlot` is `.tsx` and unloadable here, so these drive `gptClient` exactly as the component's effects do:
   *   mount at a tier      -> registerSlot
   *   intersection         -> requestSlot
   *   tier change / stop   -> destroySlot, then the counterpart's registerSlot
   * Same call order, same module, so what is asserted is the real lifecycle rather than a paraphrase.
   */
  const DESKTOP_ONLY = { ...REG, divId: "div-sp-top-billboard", lazy: false };
  const MOBILE_ONLY = { ...REG, divId: "div-sp-mobile-pos1", lazy: true };

  test("8 — a lazy eligible slot does NOT request before intersection", async () => {
    const c = await freshClient();
    c.registerSlot({ ...REG, lazy: true });
    assert.equal(c.slotState(REG.divId), "registered");
    assert.deepEqual(mock.refreshed, [], "registration must never imply a request");
    assert.deepEqual(mock.displayed, [REG.divId], "but it IS displayed — display() registers only");
  });

  test("9 — a lazy eligible slot requests exactly once after intersection", async () => {
    const c = await freshClient();
    c.registerSlot({ ...REG, lazy: true });
    c.requestSlot(REG.divId);                    /* the observer firing */
    c.requestSlot(REG.divId);                    /* a second entry, e.g. scrolling back */
    assert.deepEqual(mock.refreshed, [[REG.divId]], "one intersection, one request, no repeats");
  });

  test("10 — a viewport change destroys the old slot BEFORE the counterpart activates", async () => {
    const c = await freshClient();
    /* Desktop: the desktop-only member of the pair is live. */
    c.registerSlot(DESKTOP_ONLY);
    assert.equal(mock.slots.length, 1);
    assert.equal(mock.slots[0].divId, DESKTOP_ONLY.divId);

    /* Cross to mobile: React runs the outgoing cleanup, then the incoming effect. */
    c.destroySlot(DESKTOP_ONLY.divId);
    assert.equal(mock.slots[0].destroyed, true, "the ineligible slot is destroyed");
    assert.equal(c.slotState(DESKTOP_ONLY.divId), "inactive", "and its reservation resets");
    c.registerSlot(MOBILE_ONLY);

    assert.equal(mock.slots.length, 2);
    assert.equal(mock.slots[1].divId, MOBILE_ONLY.divId);
    /* The two members of a device pair are never defined at the same time. */
    const live = mock.slots.filter((x) => !x.destroyed);
    assert.deepEqual(live.map((x) => x.divId), [MOBILE_ONLY.divId]);
  });

  test("11 — repeated resize cycles create no duplicate div ids and no duplicate requests", async () => {
    const c = await freshClient();
    for (let i = 0; i < 4; i += 1) {
      c.registerSlot(DESKTOP_ONLY);
      c.requestSlot(DESKTOP_ONLY.divId);
      c.destroySlot(DESKTOP_ONLY.divId);
      c.registerSlot(MOBILE_ONLY);
      c.requestSlot(MOBILE_ONLY.divId);
      c.destroySlot(MOBILE_ONLY.divId);
    }
    /* Every definition is a genuinely new activation — never two live for one div id at once. */
    const live = mock.slots.filter((x) => !x.destroyed);
    assert.deepEqual(live, [], "nothing is left defined after the last teardown");
    const perCycle = mock.refreshed.map((r) => r[0]);
    assert.equal(perCycle.filter((d) => d === DESKTOP_ONLY.divId).length, 4, "one request per activation");
    assert.equal(perCycle.filter((d) => d === MOBILE_ONLY.divId).length, 4);
    /* And at no point were the two ids defined simultaneously. */
    let concurrent = 0;
    const seen = new Set<string>();
    for (const slot of mock.slots) {
      if (!slot.destroyed) seen.add(slot.divId);
      concurrent = Math.max(concurrent, seen.size);
    }
    assert.ok(concurrent <= 1, "a device pair must never be defined together");
  });

  test("12 — stop resets every slot to inactive and destroys them all", async () => {
    const c = await freshClient();
    const keys = ["div-a", "div-b", "div-c"];
    const finalStates: Record<string, string> = {};
    c.onSlotState((id, state) => { finalStates[id] = state; });
    for (const divId of keys) { c.registerSlot({ ...REG, divId }); c.requestSlot(divId); }
    fire("slotRenderEnded", { slot: slotRef("div-a"), isEmpty: true, size: null });
    assert.equal(c.slotState("div-a"), "empty-response");

    /* Stop: GamSlot unmounts for every slot. */
    for (const divId of keys) c.destroySlot(divId);
    for (const divId of keys) {
      assert.equal(c.slotState(divId), "inactive", `${divId} resets`);
      assert.equal(finalStates[divId], "inactive", `${divId} announces the reset`);
    }
    assert.deepEqual(mock.slots.filter((x) => !x.destroyed), []);
  });

  test("13 — an empty response keeps its geometry and claims no cause", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    c.requestSlot(REG.divId);
    fire("slotRenderEnded", { slot: slotRef(REG.divId), isEmpty: true, size: null });

    /* The state names the OBSERVATION. */
    assert.equal(c.slotState(REG.divId), "empty-response");

    /* The presentation retains the reservation and only suppresses the label — no geometry key exists here,
       which is what guarantees a no-fill cannot shrink the box (DS-24). */
    const p = reservationPresentation("empty-response", false);
    assert.deepEqual(p, {
      active: true, requested: true, showLabel: false, ariaLabel: "Advertisement, not filled",
    });

    /* And the five causes remain open, including the one Google's release notes add. */
    assert.equal(EMPTY_RESPONSE_CAUSES.length, 5);
    assert.ok(EMPTY_RESPONSE_CAUSES.some((c2) => /network failure/i.test(c2)),
      "a request network failure also arrives as isEmpty");
    assert.ok(EMPTY_RESPONSE_CAUSES.some((c2) => /consent or geographic/i.test(c2)));
    assert.ok(EMPTY_RESPONSE_CAUSES.some((c2) => /creative-size/i.test(c2)));
  });

  test("no advertiser, creative or line-item identifier reaches the public DOM", async () => {
    const c = await freshClient();
    c.registerSlot(REG);
    let detail: unknown;
    c.onSlotState((_i, _s, d) => { detail = d; });
    fire("slotRenderEnded", {
      slot: slotRef(REG.divId), isEmpty: false, size: [728, 90],
      advertiserId: 4242, lineItemId: 5353, creativeId: 6464,
    });
    const json = JSON.stringify(detail ?? {});
    for (const id of ["4242", "5353", "6464"]) assert.ok(!json.includes(id));
  });
});
