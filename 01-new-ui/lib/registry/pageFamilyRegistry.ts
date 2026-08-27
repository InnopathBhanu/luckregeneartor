/*
 * THE PAGE-FAMILY REGISTRY — `FD-GATE-01`, ratified 2026-08-11.
 *
 * Authority: `FD-GATE-01` (registry-only gating for all five page families) and its recorded founder rationale —
 * *"a single-deployment model, and no per-environment switches. The site is built and published as one thing. An
 * environment variable that changes which pages exist makes 'what does this build serve?' a question about a shell
 * session rather than about the repository — so the registry is the answer, for every family, with nothing beside
 * it."* Also `CLAUDE.md` §10 (*"MUST NEVER derive route existence from a fixture filename or a directory listing.
 * Routes come from an explicit config or registry"*), and Conflict 35 in `source-conflicts.md`, which this closes.
 *
 * ══ WHAT WAS WRONG ══
 *
 * Five families gated themselves five different ways. Measured before this change:
 *
 *   Home       `LC_HOME_PREVIEW=true`, else a superseded legacy template
 *   State      `LC_STATE_PREVIEW=true` **and** a jurisdiction registry entry
 *   Game       registry only
 *   archive    registry only (game registry + an enumerated archive year)
 *   flagship   registry only
 *
 * So "what does this build serve?" had two different answers depending on which family was asked, and one of them
 * depended on a shell variable. Worse, the two env-gated families each had a SECOND render path behind the flag —
 * Home fell back to `HomeTemplate` and State to `StatePageTemplate`, both tier-7 work superseded by the approved
 * blueprints. A flag being unset silently served the wrong page.
 *
 * ══ WHAT THIS MODULE IS, AND IS NOT ══
 *
 * It is ONE place to ask whether this build serves a page, delegating each family's specifics to the registry that
 * already owns them. It deliberately does NOT absorb those registries: `flagshipRegistry`, `gameRegistry`,
 * `archiveRegistry` and `jurisdictionRegistry` each carry their own evidence, notes and per-entry provenance, and
 * collapsing four reviewed registries into one table would lose all of it. This is a facade over them, plus the one
 * thing none of them could provide — a single route inventory.
 *
 * It is also NOT a feature-flag system. There is no runtime switch, no override, no environment read and no
 * per-request decision. Enabling a page is an edit to a registry, and the edit is the review.
 *
 * ══ WHAT `enabled` DOES NOT MEAN ══
 *
 * It means *this build serves this URL*. It does **not** mean the page is published, indexable, or in a sitemap.
 * Availability and indexability were always separate decisions and `FD-GATE-01` kept them separate: every one of
 * the five families remains `noindex, nofollow` and absent from every sitemap. Un-indexing is a separate launch
 * task, and `noindex` is precisely what makes registry-only gating safe — see `assertPublicationSafety` below.
 */

import { isFlagshipEligible, flagshipRoutePaths } from "../flagship/flagshipRegistry";
import { isGamePreviewEligible, eligiblePairs } from "../game/gameRegistry";
import { isArchiveEligible, archiveRoutePaths } from "../archive/archiveRegistry";
import { isPreviewJurisdiction, directoryJurisdictions } from "../state/jurisdictionRegistry";
import { isNewsRouteServed, newsRoutePaths } from "../news/newsRegistry";
import { isCommunityRouteServed, communityRoutePaths } from "../community/communityRegistry";
import { isBlogRouteServed, blogRoutePaths } from "../blog/blogRegistry";
import { isToolsRouteServed, toolsRoutePaths } from "../tools/toolsRegistry";
import { isTrustRouteServed, trustRoutePaths } from "../trust/trustRegistry";

/**
 * The approved page families, by their blueprint id. `account` joined under Conflict 37 (2026-08-11).
 * `news` joined with the 07A/07B implementation: its own registry (`lib/news/newsRegistry.ts`) enumerates the
 * hub, the search page, the article slugs and the author slugs — fixture content never creates a route.
 * `community` joined with the 08A/08B/08C implementation under the Conflict 41 FOUNDER AMENDMENT: its
 * registry (`lib/community/communityRegistry.ts`) enumerates the home, the ten review-topic slugs and the
 * five persona profiles — again, fixture content never creates a route.
 * `blog` joined under **Conflict 39** (2026-08-11): NO blueprint exists — the family is founder-authorized,
 * its composition contract lives in `lib/blog/blogContract.ts`, and its registry
 * (`lib/blog/blogRegistry.ts`) enumerates the hub, the search page, the post slugs and the two desk-author
 * slugs. Its inventory rows carry `CONFLICT-39` as their authority id, because that record IS the authority.
 * `tools` joined with the BP-05C implementation under the Conflict 42 interim founder instruction: its
 * registry (`lib/tools/toolsRegistry.ts`) enumerates exactly the hub and the Tax Calculator — the rest of
 * the BP-05C §5 route list stays conceptual until each tool ships, and nothing redirects from the legacy
 * `/lottery-tax-calculator` until the launch redirect map (Conflict 42).
 * `trust` joined under **Conflict 38** (2026-08-11): the five legacy policy routes — /about-us,
 * /contact-us, /terms-and-conditions, /privacy-policy, /cookies-policy — transfer to the new UI at their
 * exact production paths under the founder's full-cutover model. Text is TRANSCRIBED from the legacy pages
 * with provenance (`lib/trust/content/*`); its rows carry `CONFLICT-38` as their authority id, because that
 * record IS the authority (the Conflict 39 precedent).
 */
export type PageFamily =
  | "home" | "state" | "game" | "archive" | "flagship" | "account" | "news" | "community" | "blog" | "tools"
  | "trust" | "admin";

export const PAGE_FAMILIES: readonly PageFamily[] = Object.freeze([
  "home", "state", "game", "archive", "flagship", "account", "news", "community", "blog", "tools", "trust",
  "admin",
]);

/* ------------------------------------------------------------------ admin */

/**
 * The admin family — `/admin` (sign-in) and `/admin/console`, under **Conflict 40** (CLOSED — RECORDED
 * 2026-08-11): the founder chose a PROTECTED AREA INSIDE THE NEW APP, the same pattern as current
 * production's unindexed /admin login. NO blueprint exists; the rows carry `CONFLICT-40` because that
 * founder authorization IS the authority (the Conflict 38/39 precedent).
 *
 * ══ ISOLATION POSTURE — stricter than the content families ══
 *
 *   - `noindex, nofollow` AND canonical-free: an internal console is never a canonical URL for anything,
 *     so unlike the content families it emits NO canonical tag at all (the /buynow precedent).
 *   - Permanently sitemap-excluded (`SITEMAP_EXCLUDED_PREFIXES`).
 *   - Admin markup is NEVER in public page markup (Global Shell §15): no public route's server HTML
 *     references `/admin` or renders an admin component — `tests/admin-console.test.ts` sweeps for it.
 *   - **LAUNCH REQUIREMENT, recorded here per Conflict 40's "robots-disallowed" constraint: the launch
 *     `robots.txt` MUST carry `Disallow: /admin`.** No robots.txt exists in this repository yet — shipping
 *     one is the separate launch task (FD-RTE Stage 3 territory) — and this note is what that task reads.
 */
export interface AdminRegistryEntry {
  route: "/admin" | "/admin/console";
  enabled: boolean;
  /** No blueprint exists — the founder authorization recorded in source-conflicts.md is the authority. */
  authority: "CONFLICT-40";
  note: string;
}

export const ADMIN_REGISTRY: readonly AdminRegistryEntry[] = Object.freeze([
  {
    route: "/admin",
    enabled: true,
    authority: "CONFLICT-40",
    note:
      "The admin sign-in door, labelled 'LotteryCorner Admin', separate from the member /login. Auth-gated "
      + "against the review account store's one seeded admin. noindex+nofollow, canonical-free, never in a "
      + "sitemap; the launch robots.txt MUST Disallow /admin (Conflict 40).",
  },
  {
    route: "/admin/console",
    enabled: true,
    authority: "CONFLICT-40",
    note:
      "The console: queue tabs (Pending/Rejected) per surface, News/Blog entry forms with the Conflict 40 "
      + "contentMeta lifecycle, the contact inbox, and the visible audit trail. ONE route with client-side "
      + "tabs — the whole console is session-gated client state, so subroutes would only multiply the "
      + "unindexed surface. noindex+nofollow, canonical-free, never in a sitemap; the launch robots.txt "
      + "MUST Disallow /admin (Conflict 40).",
  },
]);

/* ------------------------------------------------------------------ account */

/**
 * The account family — `/login` and `/signup`, per GS-07 and the Tier-1 founder authorization recorded in
 * `source-conflicts.md` Conflict 37 (2026-08-11).
 *
 * Two fixed routes, enumerated here exactly as Home is, so the route inventory can answer for them and
 * disabling them is a registry edit like any other. They are `noindex` like every family, and additionally
 * SITEMAP-EXCLUDED FOREVER: a sign-in form is task chrome, not content — it has no search intent to serve,
 * and `lib/seo/sitemapEntries.ts` lists the prefixes so the future `app/sitemap.ts` cannot pick them up.
 */
export interface AccountRegistryEntry {
  route: "/login" | "/signup";
  enabled: boolean;
  blueprint: "GS-07";
  note: string;
}

export const ACCOUNT_REGISTRY: readonly AccountRegistryEntry[] = Object.freeze([
  {
    route: "/login",
    enabled: true,
    blueprint: "GS-07",
    note:
      "The shared sign-in flow every FD-DAT-04 affordance opens. Works end to end against the review data "
      + "layer (Conflict 37). noindex always; never in a sitemap.",
  },
  {
    route: "/signup",
    enabled: true,
    blueprint: "GS-07",
    note:
      "Free account creation (FD-ACC-15). Works end to end against the review data layer (Conflict 37). "
      + "noindex always; never in a sitemap.",
  },
]);

/* ------------------------------------------------------------------ Home */

/**
 * Home is the one family with no per-instance registry, because there is one Home.
 *
 * It is still a registry ENTRY rather than an unconditional `return true`, and the difference is not cosmetic: it
 * gives Home the same shape as the other four, so the route inventory can enumerate it, a test can assert it, and
 * disabling it later is the same kind of edit as disabling any other page. `blueprint` records which document the
 * served template conforms to, which is what makes "the blueprint template is the sole render path" checkable.
 */
export interface HomeRegistryEntry {
  route: "/";
  enabled: boolean;
  blueprint: "BP-02";
  /** Why this entry is in the state it is in. Read by the route inventory. */
  note: string;
}

export const HOME_REGISTRY: HomeRegistryEntry = Object.freeze({
  route: "/",
  enabled: true,
  blueprint: "BP-02",
  note:
    "The BP-02 Home composition is the sole render path. The legacy `HomeTemplate` it used to fall back to when the "
    + "removed environment gate was unset is ARCHIVED (`CLAUDE.md` §6) — an unset flag must never serve a superseded "
    + "template. Home is `noindex` until the launch task removes it.",
});

/* ------------------------------------------------------------------ the one question */

/**
 * Does this build serve this page?
 *
 * One signature for all five families. The parameter shape differs per family because the identity of a page does:
 * a State page is a jurisdiction, a Game page is a pair, an archive page is a pair and a year.
 */
export function servesPage(
  family: "home",
): boolean;
export function servesPage(family: "state", stateCode: string): boolean;
export function servesPage(family: "flagship", gameSlug: string): boolean;
export function servesPage(family: "account", route: string): boolean;
export function servesPage(family: "admin", route: string): boolean;
export function servesPage(family: "news", route: string): boolean;
export function servesPage(family: "community", route: string): boolean;
export function servesPage(family: "blog", route: string): boolean;
export function servesPage(family: "tools", route: string): boolean;
export function servesPage(family: "trust", route: string): boolean;
export function servesPage(family: "game", stateCode: string, gameSlug: string): boolean;
export function servesPage(family: "archive", stateCode: string, gameSlug: string, year: number): boolean;
export function servesPage(family: PageFamily, a?: string, b?: string, c?: number): boolean {
  switch (family) {
    case "home":
      return HOME_REGISTRY.enabled;
    case "account":
      return ACCOUNT_REGISTRY.some((e) => e.enabled && e.route === a);
    case "admin":
      /* The two Conflict 40 routes, enumerated above — noindex, canonical-free, robots-disallowed at launch. */
      return ADMIN_REGISTRY.some((e) => e.enabled && e.route === a);
    case "news":
      /* The news registry's own enumeration — hub, search, article slugs, author slugs. Never the payload alone. */
      return typeof a === "string" && isNewsRouteServed(a);
    case "community":
      /* The community registry's enumeration — home, the ten review-topic slugs, the five persona profiles.
         Reviewer-authored posts are a client-resolved exception recorded in that registry's header. */
      return typeof a === "string" && isCommunityRouteServed(a);
    case "blog":
      /* The blog registry's enumeration — hub, search, post slugs, desk-author slugs (Conflict 39). */
      return typeof a === "string" && isBlogRouteServed(a);
    case "tools":
      /* The tools registry's enumeration — the hub and the Tax Calculator, and nothing else (Conflict 42). */
      return typeof a === "string" && isToolsRouteServed(a);
    case "trust":
      /* The trust registry's enumeration — the five legacy policy routes, at their exact production paths
         (Conflict 38). */
      return typeof a === "string" && isTrustRouteServed(a);
    case "state":
      /* The jurisdiction registry's own `previewEnabled`, and nothing else. `LC_STATE_PREVIEW` used to be ANDed
         with this; `FD-GATE-01` removed that half. */
      return typeof a === "string" && isPreviewJurisdiction(a);
    case "flagship":
      return typeof a === "string" && isFlagshipEligible(a);
    case "game":
      return typeof a === "string" && typeof b === "string" && isGamePreviewEligible(a, b);
    case "archive":
      return typeof a === "string" && typeof b === "string" && typeof c === "number"
        && isGamePreviewEligible(a, b) && isArchiveEligible(a, b, c);
    default:
      return false;
  }
}

/* ------------------------------------------------------------------ the route inventory */

export interface RouteInventoryRow {
  family: PageFamily;
  /** The URL path this build serves. */
  route: string;
  /** Which blueprint the served composition conforms to. */
  blueprint: string;
}

/**
 * Every route this build serves, from every registry, in one list.
 *
 * ══ WHY THIS EXISTS ══
 *
 * It is the third condition `FD-GATE-01` was ratified under: *"one route-inventory test enumerates every served
 * route across all five registries, so the public surface is one assertion rather than five modules."* Before this,
 * answering "what does this build serve?" meant reading four registries and one environment variable and knowing
 * which template each flag selected. Now it is one function, and `tests/registry-gating.test.ts` asserts it.
 *
 * The archive rows are the game registry INTERSECTED with the archive registry, because an archive page needs both
 * — which is why `servesPage("archive", …)` checks both and why a bare `archiveRoutePaths()` would overstate the
 * inventory if the two ever disagreed.
 */
export function routeInventory(): RouteInventoryRow[] {
  const rows: RouteInventoryRow[] = [];

  if (HOME_REGISTRY.enabled) {
    rows.push({ family: "home", route: HOME_REGISTRY.route, blueprint: HOME_REGISTRY.blueprint });
  }

  for (const j of directoryJurisdictions()) {
    if (servesPage("state", j.code)) {
      rows.push({ family: "state", route: `/${j.code}`, blueprint: "PF-02" });
    }
  }

  for (const path of flagshipRoutePaths()) {
    rows.push({ family: "flagship", route: path, blueprint: "BP-04A" });
  }

  for (const e of ACCOUNT_REGISTRY) {
    if (e.enabled) rows.push({ family: "account", route: e.route, blueprint: e.blueprint });
  }

  /* Admin: the Conflict 40 protected area. NO blueprint exists — the rows carry CONFLICT-40, the founder
     authorization that is the family's authority. Serving these URLs is not publishing them: both are
     noindex, canonical-free, sitemap-excluded, and the launch robots.txt must Disallow /admin. */
  for (const e of ADMIN_REGISTRY) {
    if (e.enabled) rows.push({ family: "admin", route: e.route, blueprint: e.authority });
  }

  /* News: the hub and search carry 07A; articles and author profiles carry 07B. Enumerated by the news
     registry, which requires a registry row AND a payload record for every article — either alone serves nothing. */
  for (const r of newsRoutePaths()) {
    rows.push({ family: "news", route: r.route, blueprint: r.blueprint });
  }

  /* Community: the home carries 08A; entries carry 08B; member profiles carry 08C. Enumerated by the
     community registry, which requires a registry row AND a payload record — either alone serves nothing. */
  for (const r of communityRoutePaths()) {
    rows.push({ family: "community", route: r.route, blueprint: r.blueprint });
  }

  /* Blog: NO blueprint exists — every row carries CONFLICT-39, the founder authorization that is the
     family's authority (source-conflicts.md). Enumerated by the blog registry: registry row AND payload
     record, or nothing is served. */
  for (const r of blogRoutePaths()) {
    rows.push({ family: "blog", route: r.route, blueprint: r.authority });
  }

  /* Tools: the hub and the Tax Calculator carry BP-05C; the family exists under the Conflict 42 interim
     founder instruction (built at the blueprint route, noindex, no redirect until the launch map). */
  for (const r of toolsRoutePaths()) {
    rows.push({ family: "tools", route: r.route, blueprint: r.blueprint });
  }

  /* Trust: the five legacy policy routes at their exact production paths. NO blueprint exists — every row
     carries CONFLICT-38, the founder authorization that is the family's authority (source-conflicts.md). */
  for (const r of trustRoutePaths()) {
    rows.push({ family: "trust", route: r.route, blueprint: r.authority });
  }

  for (const pair of eligiblePairs()) {
    rows.push({ family: "game", route: `/${pair}`, blueprint: "BP-04B" });
  }

  for (const path of archiveRoutePaths()) {
    /* `/fl/pick-3/2026` -> state `fl`, game `pick-3`, year 2026. Parsed from the registry's own output rather than
       re-derived, so the inventory cannot claim a route the archive registry does not serve. */
    const [, state, game, year] = path.split("/");
    if (servesPage("archive", state, game, Number(year))) {
      rows.push({ family: "archive", route: path, blueprint: "ARCHIVE-06" });
    }
  }

  return rows;
}

/** Every served route as a plain path list, for a quick assertion or a report. */
export function servedRoutes(): string[] {
  return routeInventory().map((r) => r.route);
}

/* ------------------------------------------------------------------ publication safety */

/**
 * The invariant that makes registry-only gating safe, stated as code.
 *
 * ══ WHY AVAILABILITY WITHOUT A FLAG IS NOT PUBLICATION ══
 *
 * Removing the environment gates means these pages are reachable on any build. That is exactly what `FD-GATE-01`
 * intends, and it is safe for one reason and one reason only: **every one of them is `noindex, nofollow` and in no
 * sitemap.** A reader who types the URL sees the page; a crawler does not index it; no canonical signal is emitted
 * that would compete with production.
 *
 * This function exists so that the relationship is asserted rather than assumed. It returns the fields a caller
 * must not change without a launch task, and `tests/registry-gating.test.ts` checks every route metadata source
 * against it. The origin constant is now reconciled (`FD-RTE-03` implemented — one `www` constant), so the
 * remaining hazard is simpler: removing a `noindex` IS the launch act for that family, and it must be a task,
 * never a drive-by edit — the test is what stops it happening silently.
 */
export const PUBLICATION_SAFETY = Object.freeze({
  /** No page family is indexable until the launch task removes this. */
  robots: Object.freeze({ index: false, follow: false }),
  /** No family enters a sitemap. There is no `app/sitemap.ts` at all, which makes this structural. */
  inSitemap: false,
  why:
    "FD-GATE-01 made availability registry-only; it did NOT make anything publishable. Indexability is a separate "
    + "decision and stays closed until a launch task opens it. FD-RTE-03 is now IMPLEMENTED — `productionOrigin.ts` "
    + "holds the single ratified www constant, and every page family emits a self-referencing canonical on it. "
    + "That canonical and this `noindex` coexist deliberately during pre-launch: the tag reaches no crawler while "
    + "`noindex` stands, so launching a family means changing only its robots posture, never its canonical.",
});
