/*
 * ARCHIVED SESSION-SCOPED AD-TEST GATE — retained as implementation history and imported only by the
 * archived `AdVerificationGate`. The live GAM bootstrap and slots no longer read browser-session state.
 *
 * ══ WHAT IT IS ══
 *
 * A per-tab switch a tester turns on to permit Ad Manager requests, and can turn off again. Until it is on,
 * no GPT library is fetched and no slot is requested — the page shows the same reserved, labelled, unrequested
 * space the pre-canary build showed.
 *
 * ══ WHY `sessionStorage` ══
 *
 * The scope has to match the promise. `localStorage` would persist across days and tabs, so a tester who
 * enabled ads once would silently keep making ad requests on every later visit — the opposite of an explicit
 * per-session action. A cookie would travel to the server and change what is cached. `sessionStorage` ends
 * with the tab, which is exactly the lifetime "for the current browser session" describes.
 *
 * ══ WHY IT IS NOT A CMP ══
 *
 * It records one boolean about one tester's browser tab. No purposes, no vendors, no legal basis, no TCF
 * string, and nothing about any end user. See `PUBLIC_ACTIVATION_BLOCKED` in `gamConfig.ts`.
 *
 * ══ WHY THE SUBSCRIPTION EXISTS ══
 *
 * Several components must react the moment the tester flips it: the bootstrap loads GPT, and every mounted
 * slot registers itself. A `storage` event does not fire in the tab that made the change, so this module keeps
 * its own listener set and notifies them synchronously.
 */

const KEY = "lc-ad-verification";
const ON = "on";

type Listener = (active: boolean) => void;
const listeners = new Set<Listener>();

/** Server-render and any non-browser context are always OFF: ad state must never enter cached HTML. */
function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

/** Whether the tester has started ad verification in this tab. */
export function isAdTestActive(): boolean {
  if (!canUseStorage()) return false;
  try {
    return window.sessionStorage.getItem(KEY) === ON;
  } catch {
    /* Storage can throw in private modes and under strict site-data settings. Failing closed is correct:
       an unreadable gate means no ad requests, not "assume the tester said yes". */
    return false;
  }
}

/** Turn the gate on or off and notify every subscriber in this tab. */
export function setAdTestActive(active: boolean): void {
  if (!canUseStorage()) return;
  try {
    if (active) window.sessionStorage.setItem(KEY, ON);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* If we cannot persist it we must not pretend it is on. */
    if (active) return;
  }
  for (const l of listeners) l(active);
}

/** Subscribe to gate changes. Returns an unsubscribe function. */
export function onAdTestChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The storage key, exported for the runbook and for tests.
 *
 * Documented rather than hidden because a tester debugging a canary needs to be able to see, and clear, the
 * one piece of state that decides whether the page talks to Ad Manager.
 */
export const AD_TEST_STORAGE_KEY = KEY;
