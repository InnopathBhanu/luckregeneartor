/*
 * THE ROUTE-INDEPENDENT GLOBAL SHELL MODEL — BP-01 (Global Shell v1.1) GS-01…GS-15.
 *
 * Authority: Global Shell v1.1 §3 (primary navigation and its language contract), §4 (desktop structure),
 * §6 (mobile navigation), GS-02 header, GS-03 primary nav, GS-05 search, GS-06 AI trigger, GS-07 account,
 * GS-09 mobile bottom navigation; `CLAUDE.md` §10 (*"MUST NEVER derive route existence from a fixture filename
 * or a directory listing"*), §9 (no disabled control presented as functional).
 *
 * ══ WHY THIS EXISTS ══
 *
 * The approved chrome was reachable from exactly one page. `PreviewChrome` — GS-02/03/05/06/07/09 — was rendered
 * only by `app/page.tsx`, and its data came from `buildHomePreview().shell`, a HOME view model. So State, Game,
 * the archive and the two flagship hubs got one of two wrong answers depending on an unrelated environment flag:
 *
 *   `LC_HOME_PREVIEW` unset  the legacy `SiteHeader` — five uppercase links, a permanently `disabled` state
 *                            selector, and no AI entry, no search, no bottom navigation.
 *   `LC_HOME_PREVIEW=true`   NO header at all, because the layout's preview branch renders `children` alone and
 *                            only Home supplied chrome of its own.
 *
 * This module is the shell's own data, independent of any page family's view model. `buildHomePreview().shell`
 * still supplies Home's jackpot ticker and its sample-data notice, because those are Home content.
 *
 * ══ ROUTE EXISTENCE IS STILL DECLARED, NEVER ASSUMED ══
 *
 * Every `live` entry below names a route that this build actually serves, and each one is asserted against the
 * app directory by test. An entry whose destination does not exist is `preview-unavailable`, which the header
 * renders as a LABELLED unavailable affordance rather than a link that 404s or a silently disabled control
 * (`CLAUDE.md` §9). No route is created to satisfy navigation.
 */

import type { PreviewShell } from "@/lib/preview/types";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";

/**
 * The one AI entry target every page family owns.
 *
 * GS-06 must be CONTEXTUAL — the Constitution is explicit that "a single floating chat button is not an AI
 * strategy" — so the header's AI control has to reach the page's OWN answer surface rather than a global route.
 * A page therefore passes its own anchor; this is the stable id the shared answer surface emits in addition to
 * its family anchor, so a page that has an answer surface always has a working target.
 *
 * A page with NO answer surface passes `null` and the AI control is omitted rather than rendered as a link to
 * nowhere. The archive is that case today: `FD-DAT-17` removed Ask-the-Archive because metering an execution
 * requires an Account, and a visible control that cannot run is exactly what `FD-ACC-14` forbids.
 */
export const SHARED_ASK_ANCHOR = "lc-ask";

/* ------------------------------------------------------------------ GS-03 / GS-09 navigation */

/*
 * THE TWO NAVIGATIONS, DEFINED ONCE — LRG-UX-SCHEMA-001 corrections 5 and 6.
 *
 * ══ WHAT WAS WRONG ══
 *
 * GS-03's labels are *"Results, States, Games, Jackpots, Tools, News, Community"* — seven, in that order, the
 * same on every public page. The shell shipped six different ones: Home, Powerball, Mega Millions, States,
 * Tools, News. Games, Jackpots and Community had no entry at all; two flagship GAMES occupied the row instead
 * of the Games family; and Home took a slot the logo already owns.
 *
 * Two of the six were also LABELLED UNAVAILABLE while their routes existed. `/tools` and `/news` are both in
 * the registry and both serve — the entries pointed at Home anchors and read "Soon". `CLAUDE.md` §9 forbids
 * showing a working control as unavailable just as firmly as the reverse.
 *
 * GS-09's items are *"Home, Results, My Numbers, Community, Ask AI"* — five. The shell shipped four: Results,
 * States, Check, Ask AI. Home and Community were missing, States is not a GS-09 item, and "Check" is not the
 * approved label.
 *
 * And Home built its own copies of both arrays in `homePreviewModel.ts`, so the two disagreed by construction.
 * GS-03's first rule is "same order across public pages" — a rule no amount of care can hold while two modules
 * each own an answer. Both now come from here.
 *
 * ══ ROUTE EXISTENCE IS ASKED, NOT ASSERTED ══
 *
 * Every route-bearing entry reads `servesPage`, so a family being enabled or disabled in the registry moves its
 * navigation entry with it. `CLAUDE.md` §10 requires route existence to come from a registry, and hardcoding
 * `state: "live"` here is exactly the assumption that produced two mislabelled entries.
 *
 * The four anchor entries address Home's own governed sections and are written in the absolute `/#…` form, so
 * one definition works from every page — on Home the browser scrolls, elsewhere it navigates and then scrolls.
 * No route is invented for either navigation: there is no `/states`, `/games` or `/jackpots` page, and §10
 * forbids creating one to satisfy a menu.
 */

/** GS-03's seven labels, in GS-03's order. Exported so a test asserts the CONTRACT, not this file's output. */
export const PRIMARY_NAV_LABELS: readonly string[] = Object.freeze([
  "Results", "States", "Games", "Jackpots", "Tools", "News", "Community",
]);

/** GS-09's five labels, in GS-09's order. */
export const BOTTOM_NAV_LABELS: readonly string[] = Object.freeze([
  "Home", "Results", "My Numbers", "Community", "Ask AI",
]);

/**
 * The governed Home anchors the two navigations address.
 *
 * Each one is a BP-02 §12 section id, so a navigation entry can never point at a section Home does not have —
 * and if §12 ever renames one, this is the single place that has to follow.
 */
export const HOME_NAV_ANCHORS = Object.freeze({
  /** H-03 Latest U.S. and State Results. */
  results: "/#H-03",
  /** H-14B Winning Numbers by State Directory — the governed state-discovery surface. */
  states: "/#H-14B",
  /** H-09A Popular Games — the governed game-discovery surface. */
  games: "/#H-09A",
  /** H-02B Additional Top Jackpots — the governed jackpot surface. */
  jackpots: "/#H-02B",
  /** H-04 Check My Numbers — anonymous entry first, sign-in only to PRESERVE (§6.2, Constitution §17). */
  myNumbers: "/#H-04",
});

/** A route-bearing entry is live only if the registry serves it. */
function routeState(served: boolean): "live" | "preview-unavailable" {
  return served ? "live" : "preview-unavailable";
}

/*
 * WHICH NAVIGATION ENTRY IS ACTIVE IS DECLARED BY THE PAGE — LRG-UX-SCHEMA-002 §2.
 *
 * ══ WHAT WAS WRONG ══
 *
 * Active state was computed inside the shell as `currentPath === href`. Four consequences, all of them
 * structural rather than accidental:
 *
 *   1. Results, States, Games and Jackpots address HOME ANCHORS (`/#H-03` …). No page's path is ever equal to
 *      an anchor, so those four were permanently `current: false` — hardcoded, by construction.
 *   2. Exact equality means only a hub can match. `/fl` never lit States; `/fl/pick-3` never lit Games;
 *      `/fl/pick-3/2026` never lit Results; `/tools/tax-calculator` never lit Tools; `/blog/{slug}` never lit
 *      News. Every page below a hub navigated with nothing marked.
 *   3. Mobile Results could never be active anywhere, for reason (1).
 *   4. Making it work by matching prefixes would be pathname guessing — the shell inferring page identity from
 *      a string, which is the same class of mistake as deriving route existence from a directory listing.
 *
 * ══ THE SHAPE ══
 *
 * The page declares what it IS; the shell renders what it is told. A union type rather than a string, so a
 * typo is a compile error and the set of answers is the set of approved labels. `null` is a real answer — the
 * auth and trust families belong to no navigation family, and inventing an active entry for them would tell
 * the reader they are somewhere they are not.
 */

/** The seven GS-03 labels, as a type. A page names one of these or `null`. */
export type PrimaryNavItem =
  | "Results" | "States" | "Games" | "Jackpots" | "Tools" | "News" | "Community";

/** The five GS-09 labels, as a type. */
export type BottomNavItem = "Home" | "Results" | "My Numbers" | "Community" | "Ask AI";

/** GS-03. The named entry is marked `current`; it stays a LINK (§4.3, WCAG 2.4.8). */
export function primaryNavigation(active: PrimaryNavItem | null): PreviewShell["primaryNav"] {
  const homeServed = servesPage("home");
  const anchor = (label: PrimaryNavItem, href: string) => ({
    label, href, state: routeState(homeServed), current: active === label,
  });
  const route = (label: PrimaryNavItem, href: string, served: boolean) => ({
    label, href: served ? href : null, state: routeState(served), current: served && active === label,
  });
  return [
    anchor("Results", HOME_NAV_ANCHORS.results),
    anchor("States", HOME_NAV_ANCHORS.states),
    anchor("Games", HOME_NAV_ANCHORS.games),
    anchor("Jackpots", HOME_NAV_ANCHORS.jackpots),
    route("Tools", "/tools", servesPage("tools", "/tools")),
    route("News", "/news", servesPage("news", "/news")),
    route("Community", "/community", servesPage("community", "/community")),
  ];
}

/**
 * GS-09. Five destinations.
 *
 * `askHref` is the page's OWN answer surface — GS-06 must be contextual, and the Constitution is explicit that
 * "a single floating chat button is not an AI strategy". A page with no answer surface passes `null`, and the
 * entry renders as a labelled unavailable item rather than a link to nowhere.
 */
export function bottomNavigation(
  askHref: string | null,
  active: BottomNavItem | null,
): PreviewShell["bottomNav"] {
  const homeServed = servesPage("home");
  const communityServed = servesPage("community", "/community");
  const at = (label: BottomNavItem) => active === label;
  return [
    { label: "Home", href: "/", state: routeState(homeServed), current: at("Home") },
    { label: "Results", href: HOME_NAV_ANCHORS.results, state: routeState(homeServed), current: at("Results") },
    {
      label: "My Numbers",
      href: HOME_NAV_ANCHORS.myNumbers,
      state: routeState(homeServed),
      current: at("My Numbers"),
    },
    {
      label: "Community",
      href: communityServed ? "/community" : null,
      state: routeState(communityServed),
      current: communityServed && at("Community"),
    },
    {
      /* `null`, not `"#"` — LRG-UX-SCHEMA-002 §1. A fragment with no target is still a destination: it is
         focusable, it is announced as a link, and activating it rewrites the URL. */
      label: "Ask AI",
      href: askHref,
      state: askHref ? ("live" as const) : ("preview-unavailable" as const),
      current: Boolean(askHref) && at("Ask AI"),
    },
  ];
}

export interface GlobalShellOptions {
  /**
   * The in-page anchor this page's shared answer surface owns, WITHOUT the `#`.
   *
   * Defaults to `SHARED_ASK_ANCHOR`. Pass `null` where the page has no answer surface — the AI control then
   * renders as non-interactive text with a visible reason, and links nowhere.
   *
   * A page passing an anchor is asserting that an element with that id is in ITS OWN rendered output. The
   * runtime contract test resolves every live AI target against the served document, so a page that names an
   * anchor it does not render fails rather than shipping a control that scrolls nowhere.
   */
  askAnchor?: string | null;
  /**
   * Which GS-03 entry this page belongs under, declared by the page — LRG-UX-SCHEMA-002 §2.
   *
   * `null` for families that belong to no navigation entry (authentication, trust). Omitting it is the same as
   * `null`: the shell never guesses, so an un-migrated caller renders with nothing marked rather than with
   * something wrong.
   */
  activePrimaryNav?: PrimaryNavItem | null;
  /** Which GS-09 entry this page belongs under. Same rules as `activePrimaryNav`. */
  activeBottomNav?: BottomNavItem | null;
}

/**
 * The GS-02…GS-09 chrome, for any route.
 *
 * Returns the same `PreviewShell` shape `PreviewChrome` already consumes, so the approved header and bottom
 * navigation are REUSED rather than reimplemented (`CLAUDE.md` §6: keep working infrastructure).
 *
 * `jackpotTicker` is intentionally empty here. The ticker carries live jackpot figures, which are page data and
 * must come from a page's own governed model — inventing them in a shell module would be exactly the synthetic
 * -content-as-fact hazard §14 forbids. `JackpotTickerBand` is therefore rendered by Home from Home's model, and
 * by nobody else.
 */
export function globalShell(opts: GlobalShellOptions = {}): PreviewShell {
  const askAnchor = opts.askAnchor === undefined ? SHARED_ASK_ANCHOR : opts.askAnchor;
  const askHref = askAnchor ? `#${askAnchor}` : null;
  const activePrimary = opts.activePrimaryNav ?? null;
  const activeBottom = opts.activeBottomNav ?? null;

  return {
    header: { markLabel: "LotteryCorner" },

    /* GS-03 — the seven approved labels, from the one definition above. See the note there for what was
       wrong and why route existence is asked of the registry rather than asserted here. */
    primaryNav: primaryNavigation(activePrimary),

    /* GS-05. No public search route exists, so the field is present and labelled rather than wired to nothing —
       and `CLAUDE.md` §11 forbids `SearchAction` schema until one does. */
    search: {
      placeholder: "Search games, states or results",
      state: "preview-unavailable",
      explanation: "Search games, states and results.",
    },

    /*
     * GS-06. §10.4's approved identity: the action names the product. "Ask AI" alone is retired on desktop and
     * kept only where mobile space is constrained, which is §10.4's own compact form.
     *
     * `state` is `live` when the page has an answer surface, because the control genuinely moves the reader to a
     * working region — it is not a promise about a model.
     */
    /*
     * LRG-UX-SCHEMA-002 §1: `/ai-policy` IS GONE from both fields.
     *
     * It was the fallback destination on every page with no answer surface — the archive, News, Community,
     * Tools, Blog, the auth pages and every informational page. The control read "Ask LotteryCorner" and opened
     * a document about how AI is governed. That is not a degraded answer; it is a different thing entirely, and
     * a reader who follows it has been told they can ask a question when they cannot.
     *
     * `href: null` now expresses the truth, and `PreviewHeader` renders it as non-interactive text carrying
     * `unavailableNote`. No global AI route is added, because §32's rule is that the AI entry is contextual —
     * a global destination is the pattern the Constitution rules out, not the fix for its absence.
     */
    aiTrigger: {
      label: "Ask LotteryCorner",
      compactLabel: "Ask AI",
      href: askHref,
      state: askHref ? "live" : "preview-unavailable",
      explanation:
        "Ask LotteryCorner explains results, compares games, walks through claim steps and shows where every "
        + "answer came from.",
      unavailableNote: "Not on this page yet",
    },

    aiValueStatement: {
      text: "Ask LotteryCorner explains results, compares games, understands odds and navigates claim steps.",
      actionLabel: "See what it can do",
      href: askHref,
    },

    /* GS-07. The SERVER model stays anonymous forever — §33 forbids member state in cached public HTML, so
       the member menu is a client concern (`AccountMenu`). What changed under Conflict 37 (2026-08-11): the
       real shared sign-in flow now EXISTS, so `available` is true and the two routes are declared. The value
       statement states what an account PRESERVES and nothing about truth — "an account unlocks continuity,
       not truth" (Constitution §17) — and it is free (`FD-ACC-15`). */
    account: {
      state: "anonymous",
      signInLabel: "Sign in",
      registerLabel: "Create free account",
      valueStatement: "Free — save your numbers, follow your games, and pick up where you left off.",
      available: true,
      signInHref: "/login",
      registerHref: "/signup",
    },

    /* §6.5 state-context precedence lives with the page that has jurisdiction context, never in the shell —
       coarse IP must never independently determine eligibility, claim rules, tax guidance or availability. */
    stateContext: {
      resolved: false,
      source: "none",
      askUserPrompt: "Which state do you play in?",
      options: [],
    },

    /* GS-09 — the five approved destinations, priority 2 in the §6.4 sticky hierarchy, so a sticky
       advertisement reserves space ABOVE it. */
    bottomNav: bottomNavigation(askHref, activeBottom),

    /*
     * The ticker carries LIVE JACKPOT FIGURES, which are page data. A shell module inventing them would be
     * exactly the "synthetic content presented as real public fact" hazard §14 forbids, so this is empty and
     * `JackpotTickerBand` is rendered only by Home, from Home's own governed model.
     */
    jackpotTicker: {
      heading: "Top jackpots",
      nextDraw: null,
      topJackpots: [],
      disclaimer: "Jackpot amounts are estimates until the official draw is certified.",
    },

    /* GS-15. `/responsible-play` does not exist; the footer's responsible-play strip is the live access point,
       and it is rendered on every route by `GlobalFooter`. Labelled rather than linked to nothing. */
    responsiblePlayAccess: {
      label: "Responsible play",
      href: "/responsible-play",
      state: "preview-unavailable",
    },

    /* Home's own disclosure sentence. Present because the shape requires it; only Home renders it. */
    sampleDataNotice:
      "Sample data — the numbers, jackpots and stories on this page are examples, not live lottery results.",
  };
}
