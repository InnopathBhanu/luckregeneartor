/*
 * THE STATE HUB JSON-LD GRAPH — LRG-STATE-043 SD-01…SD-04.
 *
 * CONSERVATIVE BY DESIGN. Exactly two node types: `CollectionPage` and `BreadcrumbList`. Nothing else is
 * emitted, and SD-04's prohibited list is enforced by a test rather than by care.
 *
 * WHY `CollectionPage` and not `WebPage`. The State hub's job is to collect and route to the current results
 * for a jurisdiction's games. `CollectionPage` says that truthfully; `Dataset` or `ItemList` would claim more
 * than the page can currently back.
 *
 * WHAT IS DELIBERATELY OMITTED:
 *   - `ItemList` — SD-03 requires every listed item to have a genuine canonical internal URL. Today the game
 *     and article routes are unimplemented and the cards resolve to in-page anchors or inline previews, which
 *     "are not valid ItemList URLs". So there is no ItemList until those routes exist.
 *   - `FAQPage` and `QAPage` — the FAQ decision forbids both, and no FAQ section exists to describe.
 *   - `Article` / `NewsArticle` / `DiscussionForumPosting` — teaser cards are visible, but the articles and
 *     threads themselves are not pages yet. Schema describes visible content on ITS OWN page, and a teaser is
 *     not the article.
 *   - Full `WebSite` / `Organization` objects — referenced by stable `@id` only (SD-02), never duplicated.
 *
 * `about` names the Florida Lottery as a neutral `Thing`, never as the publisher. PF-02 §64 and FD-S-34 both
 * require LotteryCorner to be modelled as an organisation DISTINCT from the State operator, so the operator
 * appears as a subject and `publisher` points at LotteryCorner.
 */

import { canonicalUrl, WEBSITE_ID, ORGANIZATION_ID, PRODUCTION_ORIGIN } from "./productionOrigin";
import type { StateViewConfig } from "@/lib/state/stateViewConfig";

export interface StateHubSchemaInput {
  config: StateViewConfig;
  /** A truthful modification signal — the newest governed content or result update, ISO. */
  dateModified: string | null;
}

export function stateHubGraph({ config, dateModified }: StateHubSchemaInput) {
  const url = canonicalUrl(config.seo.canonicalPath);
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": webpageId,
    url,
    /* The page name without the site suffix: the graph already names the publisher. */
    name: config.seo.title.replace(/\s*\|\s*LotteryCorner\s*$/, ""),
    description: config.seo.description,
    inLanguage: "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    breadcrumb: { "@id": breadcrumbId },
    /* Neutral subject. LotteryCorner is the publisher above; this is what the page is ABOUT. */
    about: { "@type": "Thing", name: config.seo.schemaAboutName },
  };

  /* Emitted only when a truthful signal exists — never a build or request timestamp (MAP-03's discipline). */
  if (dateModified) collectionPage.dateModified = dateModified;

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: config.seo.breadcrumbLabel, item: url },
    ],
  };

  return { "@context": "https://schema.org", "@graph": [collectionPage, breadcrumb] };
}

/** Node types this graph may contain. Anything else is a bug, and a test asserts it. */
export const ALLOWED_STATE_HUB_TYPES = ["CollectionPage", "BreadcrumbList", "ListItem", "Thing"] as const;

/** Types SD-04 prohibits on a State hub. */
export const PROHIBITED_STATE_HUB_TYPES = [
  "FAQPage", "QAPage", "DiscussionForumPosting", "Article", "NewsArticle", "Event", "Offer",
  "Product", "Dataset", "Review", "AggregateRating",
] as const;
