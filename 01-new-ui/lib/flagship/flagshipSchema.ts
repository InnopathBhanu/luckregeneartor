/*
 * THE FLAGSHIP HUB STRUCTURED-DATA GRAPH — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §37 (*"`CollectionPage`/`WebPage`; `Organization` and `WebSite` linkage; `BreadcrumbList`;
 * `VideoObject` for visible drawing video; `Dataset` only on dataset pages; … no unsupported lottery or general
 * Offer schema"*), `CLAUDE.md` §11 (*"Schema MUST reflect visible content only"*, *"MUST NOT invent
 * lottery-specific schema types"*).
 *
 * ══ WHAT IS EMITTED ══
 *
 * `WebPage` + `BreadcrumbList`, referencing the sitewide `Organization` and `WebSite` nodes the root layout
 * already emits rather than repeating them.
 *
 * ══ WHAT IS DELIBERATELY NOT EMITTED, AND WHY EACH ABSENCE IS CORRECT ══
 *
 *   - `CollectionPage` — §37 permits it, but this hub is a single page about one game, not a collection of
 *     items with stable destinations. `WebPage` is the accurate type and the more conservative one.
 *   - `VideoObject` — §37 allows it *for a visible drawing video*. No video is on this page.
 *   - `ItemList` — there is no results list with stable internal item destinations to describe; the child
 *     routes are conceptual until the URL inventory approves them (BP-04A §40).
 *   - `FAQPage` — no visible FAQ block exists on this page.
 *   - `Dataset` — this is not a dataset page.
 *   - `Event`, `Product`, `Offer` — a drawing is not an event a reader attends and nothing is sold here.
 *   - `Organization` / `WebSite` — emitted once by the root layout; repeating them would duplicate the
 *     sitewide nodes.
 *
 * The page is `noindex, nofollow` while guarded, so nothing here reaches a crawler until the documented cutover.
 * It is emitted anyway so the founder reviews the markup that will ship, not a placeholder.
 */

import { PRODUCTION_ORIGIN, WEBSITE_ID, ORGANIZATION_ID, canonicalUrl } from "@/lib/seo/productionOrigin";
import type { FlagshipGameConfig } from "./flagshipGames";

/** Types this graph must never contain. Exported so the test asserts against one list. */
export const PROHIBITED_FLAGSHIP_TYPES = Object.freeze([
  "Event", "Product", "Offer", "FAQPage", "QAPage", "Dataset", "DataCatalog", "DataDownload",
  "Article", "NewsArticle", "ItemList", "VideoObject", "Game", "LotteryEvent", "SearchAction",
  "DiscussionForumPosting", "AggregateRating", "Review",
]);

export function flagshipPageGraph({
  config,
  dateModified,
}: {
  config: FlagshipGameConfig;
  /** The newest governed result date. Omitted rather than invented when none exists. */
  dateModified: string | null;
}): Record<string, unknown> {
  const url = canonicalUrl(config.canonicalPath);

  const page: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: config.seo.title,
    description: config.seo.description,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en-US",
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
  if (dateModified) page.dateModified = dateModified;

  return {
    "@context": "https://schema.org",
    "@graph": [
      page,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: PRODUCTION_ORIGIN },
          { "@type": "ListItem", position: 2, name: config.seo.breadcrumbLabel, item: url },
        ],
      },
    ],
  };
}
