/*
 * TOOLS JSON-LD — BP-05C §23, restricted to what the pages visibly are. LRG-TOOLS-001.
 *
 * ══ THE §23 `WebApplication` DECISION, RECORDED ══
 *
 * §23: "`WebApplication` may be considered only when it accurately represents the visible interactive tool."
 * The calculator IS a genuine interactive tool, but the type is NOT emitted, for two recorded reasons:
 *
 *   1. Its state-rate table carries rows the founder has not verified (`taxTables2026.ts` header), and the
 *      page says so — marking the surface up as a finished application while its own data table is flagged
 *      provisional would overstate what is on the page (`CLAUDE.md` §11: schema reflects visible content).
 *   2. The route is noindex under the Conflict 42 interim (the indexed production tax page is the legacy
 *      URL). Rich-result markup on a page that must not be indexed serves nobody and risks a conflicting
 *      signal pre-consolidation.
 *
 * Revisiting the decision belongs to the family's launch task, AFTER the founder rate review — record the
 * outcome there. Until then: WebPage + BreadcrumbList on the calculator, CollectionPage + BreadcrumbList +
 * ItemList on the hub. No `SoftwareApplication`, no `Dataset`, no FAQ markup (no visible FAQ exists), no
 * invented lottery types.
 */

import { ORGANIZATION_ID, PRODUCTION_ORIGIN, canonicalUrl } from "@/lib/seo/productionOrigin";
import { organizationRef, websiteRef } from "@/lib/seo/brandIdentity";
import { TAX_CALCULATOR_PATH, TOOLS_HUB_PATH } from "./toolManifest";
import {
  TAX_CALCULATOR_DESCRIPTION, TOOLS_HUB_DESCRIPTION,
} from "./toolsRouteMetadata";

/** The visible H1s, exported so metadata, schema and the pages cannot drift apart. */
export const TOOLS_HUB_H1 = "Lottery tools";
export const TAX_CALCULATOR_H1 = "Lottery Tax Calculator";

/*
 * THE PUBLISHER NODE IS GONE FROM THIS MODULE — LRG-UX-SCHEMA-001 correction 1.
 *
 * It defined a full Organization here while the root layout defined another, both under `ORGANIZATION_ID` and
 * with different `name` values — so every rendered page in this family shipped two Organization entities
 * disagreeing under one id. The layout owns the entity; `organizationRef()` emits the reference.
 */

/** The hub graph over exactly the tool entries the page renders, in render order. */
export function toolsHubSchema(visibleTools: readonly { name: string; href: string }[]) {
  const url = canonicalUrl(TOOLS_HUB_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: TOOLS_HUB_H1,
        description: TOOLS_HUB_DESCRIPTION,
        isPartOf: websiteRef(),
        publisher: organizationRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Tools", item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#catalog`,
        /* Visible tools ONLY — schema reflects visible content (`CLAUDE.md` §11). Hosted tools list their
           primary hosting page; fragment and query context never enter schema URLs. */
        itemListElement: visibleTools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: canonicalUrl(t.href.split("#")[0].split("?")[0]),
        })),
      },
    ],
  };
}

/** The calculator graph: WebPage + BreadcrumbList ONLY — see the header for the recorded §23 decision. */
export function taxCalculatorSchema() {
  const url = canonicalUrl(TAX_CALCULATOR_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: TAX_CALCULATOR_H1,
        description: TAX_CALCULATOR_DESCRIPTION,
        isPartOf: websiteRef(),
        publisher: organizationRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Tools", item: canonicalUrl(TOOLS_HUB_PATH) },
          { "@type": "ListItem", position: 3, name: TAX_CALCULATOR_H1, item: url },
        ],
      },
    ],
  };
}
