/*
 * YEARLY ARCHIVE JSON-LD — archive blueprint §32, LRG-UX-SCHEMA-001 correction 4.
 *
 * ══ WHAT WAS MISSING ══
 *
 * The archive route emitted NO page-level structured data at all. A rendered `/fl/pick-3/2026` carried only the
 * root layout's Organization and WebSite — so the largest indexed surface in the corpus (roughly 8,700 yearly
 * archive URLs in the production sitemap) described itself to a consumer as an untyped page with no collection,
 * no hierarchy and no relationship to the game it archives.
 *
 * ══ WHAT §32 ALLOWS, AND WHAT IT DOES NOT ══
 *
 * §32's conceptual list is exactly four lines:
 *
 *     WebPage/CollectionPage; BreadcrumbList; ItemList only for visible rows; Dataset only for a governed
 *     dataset release.
 *
 * `CollectionPage` is the honest choice of the first pair — the page IS a collection of results, not a document
 * about them. The fourth line is a prohibition in this build: **no `Dataset`, `DataCatalog` or `DataDownload`**,
 * because no governed dataset release exists. `CLAUDE.md` §11 says the same thing from the other direction. The
 * page's print/export affordance is a browser print of the visible table, not a published dataset, and calling
 * it one would advertise a download that has no governed existence.
 *
 * ══ THE ITEMLIST IS THE VISIBLE ROWS, EXACTLY ══
 *
 * One `ListItem` per rendered `<tr>`, in render order, positions 1..n. The archive renders the whole year in the
 * initial HTML — filtering is client-side over rows that are already present — so "visible rows" is the full row
 * set and the count is checkable against `model.rows.length`.
 *
 * Each item's `url` is the page URL plus the row's OWN anchor, which the model derives from the member game id
 * and the game-local draw date (`archiveReviewFixture.anchorOf`). That is what §32 means by a stable anchor: the
 * same drawing keeps the same fragment across rebuilds, and a Midday and an Evening draw on one date are two
 * anchors rather than one ambiguous date link. `name` is the visible date and variant — never a re-derivation
 * of the drawn numbers, so schema cannot disagree with the table.
 *
 * ══ NO `dateModified` ══
 *
 * Deliberately absent. `CLAUDE.md` §11 wants accurate freshness, and this page has no freshness record: a build
 * clock or `Date.now()` would claim the archive changed whenever the site was rebuilt, which is a false
 * modification claim on 8,700 URLs. It goes in when a real per-archive `lastUpdated` exists. `reviewDateIso` is
 * the JURISDICTION's review date, not this page's modification date, so it is not a stand-in either.
 */

import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { organizationRef, websiteRef } from "@/lib/seo/brandIdentity";
import type { ArchiveViewModel } from "./archiveContract";
import { archiveRowLabel, archiveShowsVariantColumn } from "./archiveYear";

/*
 * THE ROW LABEL COMES FROM THE SHARED FORMATTER — LRG-UX-SCHEMA-002 §5.
 *
 * What was here built its own string: `"<Game> <variant> — 2026-07-09"`. Two things were wrong with it, and
 * both were invisible to a test that compared schema against the model rather than against the page.
 *
 *   THE DATE was the raw ISO value. The table renders `archiveDisplayDate` — `"Thu 07/09/2026"`. So the
 *   `ItemList` named 52 things using a format that appears nowhere in the document.
 *
 *   THE VARIANT was omitted whenever the row's own `variantLabel` was empty. The table prints `Main` for
 *   exactly those rows, because a member with no label of its own is the main draw. So the fallback rows
 *   disagreed on the date AND on the name.
 *
 * `archiveRowLabel` and `archiveShowsVariantColumn` now serve both sides. See `archiveYear.ts`.
 */

/**
 * The archive graph: CollectionPage + BreadcrumbList + ItemList.
 *
 * `visibleRows` defaults to the model's own rows because the page renders all of them; it is a parameter so the
 * caller — not this module — remains the authority on what was rendered, which is the only way the ItemList can
 * be asserted equal to the DOM rather than to another derivation of the same source.
 */
export function archiveSchema(
  model: ArchiveViewModel,
  visibleRows: readonly ArchiveViewModel["rows"][number][] = model.rows,
) {
  const path = `/${model.stateCode}/${model.gameSlug}/${model.archiveYear}`;
  const url = canonicalUrl(path);
  /* Asked once, from the same predicate the table's column uses, and passed to every row's label. */
  const showVariant = archiveShowsVariantColumn(model.members);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: model.h1,
        description: model.supportingCopy,
        isPartOf: websiteRef(),
        publisher: organizationRef(),
        inLanguage: "en-US",
      },
      {
        /* The user hierarchy, which GS-04 permits a BreadcrumbList to project: state hub, game page, this year.
           Built from the model's OWN visible breadcrumb trail so the markup cannot name a step the page does
           not show, and the trailing crumb resolves to this page rather than to a null href. */
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: model.breadcrumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.label,
          item: c.href ? canonicalUrl(c.href) : url,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#results`,
        name: `${model.gameLabel} results, ${model.archiveYear}`,
        /* The rows are rendered newest-first and the ItemList mirrors that order rather than reordering it. */
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: visibleRows.length,
        itemListElement: visibleRows.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: archiveRowLabel({
            gameLabel: model.gameLabel,
            drawDateIso: r.drawDateIso,
            variantLabel: r.variantLabel,
            showVariant,
          }),
          /* The row's OWN anchor — the same `id` the `<tr>` carries, derived from the member game id and the
             game-local draw date. Two draws on one date remain two anchors. */
          url: `${url}#${r.anchorId}`,
        })),
      },
    ],
  };
}
