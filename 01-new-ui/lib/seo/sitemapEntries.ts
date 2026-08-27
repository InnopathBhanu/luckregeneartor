/*
 * SITEMAP READINESS — LRG-STATE-043 MAP-01/MAP-02/MAP-03.
 *
 * WHAT THIS IS, AND WHAT IT DELIBERATELY IS NOT.
 *
 * This is a pure generator: it turns validated State configuration into sitemap entries and it is tested. It is
 * NOT wired to `app/sitemap.ts`, and that omission is the point. MAP-02 says "Do not change production
 * enumeration when doing so would alter current guard-off/legacy behavior without a cutover decision" — and
 * there is no sitemap in this application today, so creating one WOULD be a new production behaviour with no
 * cutover decision behind it. The same reasoning applies to `robots.txt`: the page-level `robots` meta already
 * makes the guarded preview `noindex, nofollow`, and adding a site-wide `robots.txt` would change guard-off
 * behaviour.
 *
 * So the work this task asks for is done — generation is configuration-ready and proven — and the activation is
 * left as the documented one-condition cutover below.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 * THE CUTOVER, in one condition.
 *
 * Create `app/sitemap.ts` as:
 *
 *     import { sitemapEntries } from "@/lib/seo/sitemapEntries";
 *     export default function sitemap() { return sitemapEntries({ includePreviewJurisdictions: true }); }
 *
 * `includePreviewJurisdictions` is the single flag. It stays `false` until the State template is cut over to
 * `index, follow`, because a page that is `noindex` must not be advertised in a sitemap — the two signals would
 * contradict each other.
 * ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 */

import { canonicalUrl } from "./productionOrigin";
import { stateViewConfigFor, configuredStateCodes } from "@/lib/state/stateViewConfigRegistry";
import { isPreviewJurisdiction } from "@/lib/state/jurisdictionRegistry";

export interface SitemapEntry {
  url: string;
  /** Omitted entirely when no truthful signal exists — never a build or request time (MAP-03). */
  lastModified?: string;
}

export interface SitemapOptions {
  /**
   * Whether a jurisdiction that only exists as a guarded preview may enter the sitemap. `false` until the
   * template is cut over to `index, follow`.
   */
  includePreviewJurisdictions?: boolean;
  /**
   * A truthful modification signal per State code — the newest of a governed result update, a correction, or a
   * content/configuration change. When absent, `lastModified` is omitted rather than invented.
   */
  lastModifiedByState?: Record<string, string | undefined>;
}

/**
 * Sitemap entries from the governed supported-State registry and validated configuration.
 *
 * Enumerated from configuration and the jurisdiction registry — never from fixture filenames, which CLAUDE.md
 * §10 forbids as a source of route existence.
 */
export function sitemapEntries(options: SitemapOptions = {}): SitemapEntry[] {
  const { includePreviewJurisdictions = false, lastModifiedByState = {} } = options;
  const entries: SitemapEntry[] = [];

  for (const code of configuredStateCodes()) {
    /* A preview-only jurisdiction stays out until the cutover: it is `noindex`, and advertising a noindex URL
       in a sitemap sends a crawler two contradictory instructions. */
    if (isPreviewJurisdiction(code) && !includePreviewJurisdictions) continue;
    const cfg = stateViewConfigFor(code);
    if (!cfg) continue;
    const lastModified = lastModifiedByState[code];
    entries.push(lastModified
      ? { url: canonicalUrl(cfg.seo.canonicalPath), lastModified }
      : { url: canonicalUrl(cfg.seo.canonicalPath) });
  }

  return entries;
}

/** Routes that must never appear in a sitemap, whatever else changes (MAP-01). */
/* `/login` and `/signup` (the account family, Conflict 37): a sign-in form is task chrome, not content —
   permanently excluded, exactly as the commerce redirect routes are.
   `/news/search` and `/blog/search` (the founder-added search pages, Conflict 39): a search-results surface
   has no content of its own and is noindex ALWAYS — launching those families never adds them. The hubs,
   articles, posts and author pages are NOT listed here: they are out of every sitemap today because no
   `app/sitemap.ts` exists (PUBLICATION_SAFETY), and their eventual inclusion is each family's launch decision.
   `/admin` (the Conflict 40 protected area): permanently excluded — an internal console has no public
   existence to advertise, and the launch robots.txt must additionally Disallow it (see ADMIN_REGISTRY). */
export const SITEMAP_EXCLUDED_PREFIXES =
  ["/design-lab", "/buynow", "/login", "/signup", "/news/search", "/blog/search", "/admin"] as const;

export function isSitemapExcluded(path: string): boolean {
  return SITEMAP_EXCLUDED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}
