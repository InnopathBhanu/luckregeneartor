/*
 * THE GAME PAGE STRUCTURED-DATA GRAPH — LRG-GAME-049.
 *
 * Conservative by instruction: `WebPage` + `BreadcrumbList`, nothing else.
 *
 * WHAT IS DELIBERATELY NOT EMITTED, and why each absence is correct rather than cautious:
 *   - `Event` for a drawing — the task forbids it outright, and a drawing is not an event a reader attends.
 *   - `Product` / `Offer` — a lottery ticket is not merchandise and we sell nothing.
 *   - `FAQPage` / `QAPage` — the community entries are editorial starters, not answered questions.
 *   - `Article` / `NewsArticle` — the Game Page is not an article.
 *   - `ItemList` — permitted only for a visible recent-results list with genuine stable internal item
 *     destinations. There is no result history in the repository, so the list does not exist to describe.
 *   - `VideoObject` — no video on this page.
 *   - `Organization` / `WebSite` — already emitted once by the root layout. Repeating them would duplicate
 *     the sitewide nodes; this graph REFERENCES them by `@id` instead.
 */

import { PRODUCTION_ORIGIN, WEBSITE_ID, ORGANIZATION_ID, canonicalUrl } from "./productionOrigin";
import type { GameViewConfig } from "../game/gameViewConfig";

/** Types this graph must never contain. Exported so the test asserts against one list. */
export const PROHIBITED_GAME_PAGE_TYPES = Object.freeze([
  "Event", "Product", "Offer", "FAQPage", "QAPage", "Dataset",
  "Article", "NewsArticle", "ItemList", "VideoObject", "Game", "LotteryEvent",
]);

export function gamePageGraph({
  config, dateModified,
}: { config: GameViewConfig; dateModified: string | null }): Record<string, unknown> {
  const url = canonicalUrl(config.seo.canonicalPath);
  const stateUrl = canonicalUrl(`/${config.game.stateCode}`);

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
  /* Omitted rather than invented when no truthful freshness signal exists. */
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
          { "@type": "ListItem", position: 2, name: config.game.stateName, item: stateUrl },
          { "@type": "ListItem", position: 3, name: config.seo.breadcrumbLabel, item: url },
        ],
      },
    ],
  };
}
