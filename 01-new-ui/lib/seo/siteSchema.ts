/*
 * Sitewide JSON-LD generators (Organization, WebSite) + per-page WebPage.
 * Values are REAL production values (from 03-docs/02 §8 Organization + footer socials) — not invented.
 *
 * HISTORY, kept so the churn is legible. `SITE_URL` began PROVISIONAL on `www`; LRG-STATE-043 SD-02 moved only
 * the two `@id` values to the then-governed non-`www` origin (the smallest root-metadata correction — it left
 * `Organization.url` and the logo on `www` and recorded the inconsistency); LRG-SHELL-045 collapsed the two
 * host forms into the ONE shared constant below. `FD-RTE-02`/`FD-RTE-03` (ratified 2026-08-11) then fixed
 * that constant's value as the `www` no-trailing-slash form — see `productionOrigin.ts`, the single origin
 * definition — so every node here is `www` again, now by ruling rather than by provisional default.
 */
import { PRODUCTION_ORIGIN } from "./productionOrigin";
import { organizationEntity, websiteEntity, websiteRef } from "./brandIdentity";

/*
 * LRG-SHELL-045 fixed decisions 7 and 8 SUPERSEDED the LRG-STATE-043 compromise: ONE governed production
 * origin, re-exported here, so the identity JSON-LD can never carry a second host form.
 *
 * `FD-RTE-02` / `FD-RTE-03` (ratified 2026-08-11) then settled the DIRECTION of that one origin: it is
 * **`www.lotterycorner.com`** — all 9,246 indexed production URLs are `www`, so the non-`www` value the
 * constant briefly held is reversed at the source. Nothing changes in this file for that: `SITE_URL` follows
 * `PRODUCTION_ORIGIN` by construction, which is exactly what `FD-RTE-03`'s "single constant" exists to
 * guarantee. The logo asset continues to resolve — `public/logo.png` is served from the same origin — and no
 * redirect is introduced, no favicon asset changes, and Home's composition is untouched.
 */
export const SITE_URL = PRODUCTION_ORIGIN;

/*
 * ══ THE IDENTITY MOVED TO `brandIdentity.ts` — LRG-UX-SCHEMA-001 correction 1 ══
 *
 * These two builders used to define the brand's names here, and four other schema modules defined them again,
 * differently. The names now come from ONE module. What is left in these functions is the `@context` wrapper
 * and the fact that the ROOT LAYOUT is the only caller — page-level graphs reference the ids instead.
 *
 * Two values changed, both because they were wrong rather than because they were duplicated:
 *   Organization `name`  "Lottery Corner"      -> "LotteryCorner", with "Lottery Corner" kept as alternateName
 *   WebSite `name`       "US Lottery Results"  -> "LotteryCorner"
 *
 * The second is the one that mattered. "US Lottery Results" is Home's PAGE TITLE, not the site's name; Google's
 * site-name guidance reads `WebSite.name` as what the site is called, and a keyword-shaped title there is the
 * case that guidance exists to prevent.
 *
 * `SearchAction` stays absent, for the reason it was removed: it pointed at `/search`, which does not exist, and
 * declaring a search endpoint that 404s is a false claim in structured data. Home Page Blueprint v1.1 §69 also
 * records that Google retired the sitelinks search box in November 2024, so nothing requires it.
 */

export function organizationSchema() {
  return { "@context": "https://schema.org", ...organizationEntity() };
}

export function websiteSchema() {
  return { "@context": "https://schema.org", ...websiteEntity() };
}

/** ItemList JSON-LD (e.g. top games / browse-by-state) — items are {name, path}. */
export function itemListSchema(opts: { name: string; items: { name: string; path: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    itemListElement: opts.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.path.startsWith("http") ? it.path : `${SITE_URL}${it.path}`,
    })),
  };
}

export function webPageSchema(opts: { name: string; path: string; description?: string }) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    url,
    "@id": `${url}#webpage`,
    ...(opts.description ? { description: opts.description } : {}),
    /* The shared reference, not a second literal `#website` string built from the origin. */
    isPartOf: websiteRef(),
  };
}
