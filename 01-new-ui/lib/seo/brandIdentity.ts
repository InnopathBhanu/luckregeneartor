/*
 * THE ONE BRAND IDENTITY — LRG-UX-SCHEMA-001 correction 1.
 *
 * ══ WHAT WAS WRONG ══
 *
 * Four schema modules and the root layout each named the site independently, and they disagreed:
 *
 *   `lib/seo/siteSchema.ts`        Organization `name: "Lottery Corner"`, WebSite `name: "US Lottery Results"`
 *   `lib/news/newsSchema.ts`       a SECOND full Organization, `name: "LotteryCorner"`, plus a second full WebSite
 *   `lib/community/communitySchema.ts`  same again
 *   `lib/blog/blogSchema.ts`       same again
 *   `lib/tools/toolsSchema.ts`     same again
 *
 * A rendered `/news` therefore carried two Organization entities and two WebSite entities sharing one `@id`
 * pair while carrying different `name` values — and the WebSite's name was a PAGE TITLE, "US Lottery Results",
 * not the site's name at all. Google's site-name guidance is explicit that `WebSite.name` is the name of the
 * site; giving it a keyword-shaped title is the case that guidance exists to prevent, and two nodes disagreeing
 * under one `@id` is not a name Google can resolve either way.
 *
 * ══ THE SHAPE ══
 *
 * One primary name; the two forms the brand genuinely also goes by as `alternateName`, which is exactly what
 * that property is for. Two entity builders that only the ROOT LAYOUT calls, and two reference builders every
 * page-level graph calls instead. A `@id` reference is the whole mechanism: a page graph says "the publisher is
 * that node" and the consumer resolves it against the full node the layout already emitted on the same page.
 *
 * No `SearchAction` — there is no working public global-search route, and `CLAUDE.md` §11 forbids declaring one
 * until there is. Nothing here reads or redefines an origin: `productionOrigin.ts` remains the single origin
 * definition (`FD-RTE-03`), and this module imports from it.
 */

import { PRODUCTION_ORIGIN, ORGANIZATION_ID, WEBSITE_ID } from "./productionOrigin";

/**
 * The primary site name — the one string any consumer should read as "what this site is called".
 *
 * `LotteryCorner`, unspaced, is the form the product uses in its own copy, its wordmark and its domain.
 */
export const SITE_NAME = "LotteryCorner";

/**
 * Forms the brand genuinely also goes by. Google's site-name guidance accepts `alternateName` for a real
 * alternate; it is not a place to list keywords, so the page title "US Lottery Results" is NOT here.
 */
export const SITE_ALTERNATE_NAMES: readonly string[] = Object.freeze([
  "Lottery Corner",
  "lotterycorner.com",
]);

/** The organization's real, already-published social profiles. Transcribed from the production footer. */
const SAME_AS: readonly string[] = Object.freeze([
  "https://www.facebook.com/lotterycornerofficial",
  "https://twitter.com/LotteryCorner",
  "https://www.instagram.com/lotterycorner",
  "https://in.pinterest.com/lotterycornerofficial",
  "https://www.youtube.com/@Lotterycorner",
]);

/**
 * The full Organization entity. **Root layout only.**
 *
 * A page-level graph that needs a publisher calls `organizationRef()` instead — emitting this a second time on
 * the same page is the duplication this module exists to end.
 */
export function organizationEntity() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: [...SITE_ALTERNATE_NAMES],
    url: `${PRODUCTION_ORIGIN}/`,
    logo: { "@type": "ImageObject", url: `${PRODUCTION_ORIGIN}/logo.png` },
    sameAs: [...SAME_AS],
  };
}

/**
 * The full WebSite entity. **Root layout only.**
 *
 * No `potentialAction`/`SearchAction`: no public search route exists. See `CLAUDE.md` §11.
 */
export function websiteEntity() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: [...SITE_ALTERNATE_NAMES],
    url: `${PRODUCTION_ORIGIN}/`,
    publisher: organizationRef(),
  };
}

/** The reference every page-level graph uses for its publisher. Resolves against the layout's node. */
export function organizationRef() {
  return { "@id": ORGANIZATION_ID } as const;
}

/** The reference every page-level graph uses for `isPartOf`. Resolves against the layout's node. */
export function websiteRef() {
  return { "@id": WEBSITE_ID } as const;
}

export { ORGANIZATION_ID, WEBSITE_ID };
