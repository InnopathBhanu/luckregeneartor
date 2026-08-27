/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

/*
 * Shell capability input — LRG-STATE-022.
 *
 * Authority: FD-S-08 / DS-17 ("Do not render controls as disabled product promises. Until functionality
 * exists: hide the control; or replace it with clearly labelled informational text"); CLAUDE.md §9
 * ("MUST NOT display disabled controls as if they were functional").
 *
 * WHY THIS EXISTS. `SiteHeader`, `AccountHooks` and `SiteFooter` render six permanently-`disabled`
 * controls: the state selector, Login, Register, the newsletter input and submit, and Privacy Manager.
 * The guarded State preview inherits them from the root layout, which put six disabled product promises
 * on a page whose own sections contain none.
 *
 * The task's preferred approach 3 — "introduce a route/page-family capability input to the shared shell
 * if it preserves Home exactly". This is that input.
 *
 * PRESERVES HOME EXACTLY, two ways:
 *   1. `DEFAULT_SHELL_CAPABILITIES` enables everything, so any caller that passes nothing renders
 *      byte-identically to before.
 *   2. The locked Home is the Home preview (`LC_HOME_PREVIEW=true`), which supplies its own
 *      `PreviewChrome` and never renders `SiteHeader`/`SiteFooter` at all. It cannot be affected.
 *
 * NO FAKE HANDLERS. A capability set to `false` means the control is NOT RENDERED. Nothing here makes a
 * non-functional control look functional, and nothing enables login, registration, following, newsletter,
 * privacy-manager or state-change behaviour that does not already genuinely work.
 */

export interface ShellCapabilities {
  /** The header/mobile state selector. Not wired to any navigation yet. */
  stateSelector: boolean;
  /** Login and Register entry points. No auth exists. */
  account: boolean;
  /** Footer newsletter form. No submit endpoint exists. */
  newsletter: boolean;
  /** Footer Privacy Manager. No consent layer exists. */
  privacyManager: boolean;
  /** Per-result favourite star. No account to save against. */
  favourites: boolean;
}

/** Everything on — the pre-existing behaviour. Any caller that omits capabilities gets exactly this. */
/*
 * ══ `account` AND `favourites` ARE NOW OFF EVERYWHERE (LRG-ARCHIVE-057, `ACCT-DEC-001` `FD-ACC-14`) ══
 *
 * They were `true` here and `false` only in the State preview profile, which meant every other page — Home, the
 * Game Page, an article, and now the Yearly History Page — rendered a `disabled` Login button titled *"Login coming
 * in a later phase"*, a `disabled` Register beside it, and a `disabled` favourite star labelled *"(coming soon)"*.
 *
 * `FD-ACC-14` forbids exactly that: *"Disabled, 'Coming soon,' and non-functional account controls are not
 * permitted."* The capability audit found no authentication of any kind — no library, no session, no route — so
 * there is no destination these controls could ever reach today. `FD-S-08` and `DS-17` already preferred omission
 * over a disabled promise; this makes the default match the rule.
 *
 * TURNING THEM BACK ON IS THE SIGNAL that a real Account destination exists. `enabled={false}` renders `null`, so
 * nothing is left behind and no layout shifts — proven by comparing rendered HTML across Home, State, Game, Archive
 * and Article pages.
 *
 * `newsletter`, `privacyManager` and `stateSelector` are UNCHANGED. They are not account controls, they are outside
 * this task's scope, and each is a separate founder decision — recorded as an open item rather than swept up here.
 */
export const DEFAULT_SHELL_CAPABILITIES: ShellCapabilities = {
  stateSelector: true,
  account: false,
  newsletter: true,
  privacyManager: true,
  favourites: false,
};

/**
 * The guarded State preview: every capability that would render a disabled control is off.
 *
 * Each of these five is genuinely non-functional today, so omitting the control is the DS-17-preferred
 * outcome. Where the page still needs to convey the capability, the State sections say so in ordinary
 * non-interactive text (S-16 for following, S-18 for changing state).
 */
export const STATE_PREVIEW_SHELL_CAPABILITIES: ShellCapabilities = {
  stateSelector: false,
  account: false,
  newsletter: false,
  privacyManager: false,
  favourites: false,
};
