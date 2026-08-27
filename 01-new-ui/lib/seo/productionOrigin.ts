/*
 * THE GOVERNED PRODUCTION ORIGIN — the single origin definition for the whole application.
 *
 * `FD-RTE-02` / `FD-RTE-03` (ROUTE-AUDIT-001, ratified 2026-08-11, IN FORCE): the canonical host is
 * **`www.lotterycorner.com`**, with no trailing slash. All 9,246 indexed production URLs are already `www`;
 * moving to non-`www` would have redirected the entire corpus for no reader benefit. This REVERSES the
 * non-`www` value this file carried under LRG-STATE-043, which predated that count.
 *
 * `FD-RTE-03` requires exactly ONE origin constant. `lib/seo/siteSchema.ts` re-exports this value as
 * `SITE_URL`; nothing else may define an origin string. `tests/canonical-hygiene.test.ts` sweeps `lib/` and
 * `app/` to assert that no second origin literal — `www` or non-`www` — survives anywhere.
 *
 * WHAT THIS DOES NOT DO. No redirect, no sitemap, no robots.txt and no route change is made by this file —
 * those are later stages of ROUTE-AUDIT-001 §10 (`FD-RTE-01` edge canonicalisation is Stage 2 and is not yet
 * implemented). Every guarded page family remains `noindex, nofollow`; the canonical tag and `noindex`
 * coexist deliberately until the launch cutover.
 */

/** The production origin for canonical URLs and stable schema `@id` values. `www`, no trailing slash, ever. */
export const PRODUCTION_ORIGIN = "https://www.lotterycorner.com";

/** Stable global schema node ids. State pages REFERENCE these; they never redefine the nodes (SD-02). */
export const WEBSITE_ID = `${PRODUCTION_ORIGIN}/#website`;
export const ORGANIZATION_ID = `${PRODUCTION_ORIGIN}/#organization`;

/**
 * An absolute canonical URL from a governed path.
 *
 * The origin is a constant rather than a request header on purpose: reading the host from the request is how a
 * preview or a local host leaks into a canonical, which SEO-03 forbids outright.
 *
 * The path is normalised to the canonical form `FD-RTE-01` ratified: no trailing slash (except the root) and
 * lower case. Every registered route is already lower-case (asserted in `tests/registry-gating.test.ts`), so
 * lowering here cannot point a canonical at a URL that differs from the served route — it only prevents a
 * mixed-case variant from ever being emitted as a canonical value.
 */
export function canonicalUrl(path: string): string {
  if (!path.startsWith("/")) throw new Error(`canonicalUrl: path must begin with "/", got "${path}"`);
  if (path.includes("#")) throw new Error(`canonicalUrl: path must not contain a fragment, got "${path}"`);
  const trimmed = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return `${PRODUCTION_ORIGIN}${trimmed.toLowerCase()}`;
}
