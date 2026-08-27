/*
 * BLOG JSON-LD — 07B §15 / 07C Template K adapted to evergreen editorial (Conflict 39), plus the founder's
 * "all required JSON SEO schema".
 *
 * Every builder here reflects VISIBLE content only (`CLAUDE.md` §11). The hub graph is CollectionPage +
 * BreadcrumbList + ItemList over exactly the post cards the page renders; the post graph is a **BlogPosting**
 * — 07B §15's own instruction for evergreen editorial (*"Use `Article` or `BlogPosting` for evergreen
 * Editorial"*) — with every Template K required field, plus `speakable` because the page genuinely offers a
 * spoken rendition (the Listen control reads the headline and Key points first).
 *
 * ══ THE ONE RECORDED DEPARTURE FROM TEMPLATE K (news precedent, held) ══
 *
 * Template K writes `author: @type Person`. The desk identities are clearly-labelled review fixtures — NOT
 * people — and the community precedent (Conflict 41 condition 4) is explicit: fixture identities are never
 * emitted as `Person` JSON-LD. So the author node is `@type: Organization` until a real named writer exists,
 * and `blogAuthorSchema` keeps the same honesty for the profile page. **Person JSON-LD, real identities and
 * consented photographs attach at launch** — that upgrade is exactly what Google's E-E-A-T / Preferred
 * Sources guidance rewards, and it is recorded on each author's `launchNote` rather than faked now.
 *
 * `image` (Template K required) is OMITTED, not stood in for. It carried `/logo.png` on every post; a wordmark
 * represents the publisher rather than the post, and Google's structured-data policies require markup to describe
 * visible content. Emitted only from a typed asset the page shows; no corpus record has one. **Conflict 44.**
 */

import { PRODUCTION_ORIGIN, ORGANIZATION_ID, canonicalUrl } from "@/lib/seo/productionOrigin";
import { organizationRef, websiteRef } from "@/lib/seo/brandIdentity";
import { articleImageField } from "@/lib/seo/articleImage";
import type { BlogAuthorRecord, BlogPostRecord } from "./blogContract";
import {
  BLOG_HUB_DESCRIPTION, BLOG_HUB_H1, blogAuthorPath, blogPostPath,
} from "./blogContract";
import { deriveKeyPoints } from "./blogKeyPoints";

/*
 * THE PUBLISHER NODE IS GONE FROM THIS MODULE — LRG-UX-SCHEMA-001 correction 1.
 *
 * It defined a full Organization here while the root layout defined another, both under `ORGANIZATION_ID` and
 * with different `name` values — so every rendered page in this family shipped two Organization entities
 * disagreeing under one id. The layout owns the entity; `organizationRef()` emits the reference.
 */

/** The editorial-policy URL `publishingPrinciples` points at — the corrections policy is the live trust surface. */
const PUBLISHING_PRINCIPLES = `${PRODUCTION_ORIGIN}/corrections-policy`;

function authorNode(author: BlogAuthorRecord) {
  return {
    /* Organization, not Person — see the header note and the author's own launchNote. */
    "@type": "Organization",
    "@id": `${canonicalUrl(blogAuthorPath(author.slug))}#author`,
    name: author.name,
    url: canonicalUrl(blogAuthorPath(author.slug)),
  };
}

/* ------------------------------------------------------------------ hub */

/**
 * The hub graph: CollectionPage, BreadcrumbList, ItemList, Organization, WebSite — the same shape the news hub
 * emits, over exactly the post cards the page renders, in render order.
 */
export function blogHubSchema(visibleCards: readonly { headline: string; slug: string }[]) {
  const url = canonicalUrl("/blog");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: BLOG_HUB_H1,
        description: BLOG_HUB_DESCRIPTION,
        isPartOf: websiteRef(),
        publisher: organizationRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#feed`,
        /* Visible post cards ONLY — schema reflects visible content (`CLAUDE.md` §11). */
        itemListElement: visibleCards.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.headline,
          url: canonicalUrl(blogPostPath(c.slug)),
        })),
      },
    ],
  };
}

/* ------------------------------------------------------------------ post (BlogPosting, Template K adapted) */

/**
 * The Template K required-field list plus `speakable`, exported so the test asserts presence against the
 * blueprint's own list rather than against whatever this module happens to emit.
 */
export const BLOG_POSTING_REQUIRED_FIELDS: readonly string[] = Object.freeze([
  "@context", "@type", "@id", "url", "mainEntityOfPage", "headline", "description", "image",
  "datePublished", "dateModified", "author", "publisher", "articleSection", "keywords", "about",
  "mentions", "isAccessibleForFree", "inLanguage", "copyrightHolder", "copyrightYear", "publishingPrinciples",
  "speakable",
]);

/**
 * The subset emitted CONDITIONALLY. `image` is required by Template K and present only when the post genuinely
 * shows a representative asset — see the header note and Conflict 44.
 */
export const BLOG_POSTING_CONDITIONAL_FIELDS: readonly string[] = Object.freeze(["image"]);

/** The CSS selectors `speakable` names — the H1 and the Key points block, the two things the audio leads with. */
export const SPEAKABLE_SELECTORS: readonly string[] = Object.freeze([".lcb-h1", ".lcb-keypoints"]);

/**
 * One post's graph — BlogPosting + WebPage + BreadcrumbList, with author and publisher nodes. `speakable`
 * points at the visible headline and Key points, which is also exactly what the Listen control reads first —
 * the markup claims nothing the page does not audibly do.
 */
export function blogPostSchema(post: BlogPostRecord, author: BlogAuthorRecord) {
  const url = canonicalUrl(blogPostPath(post.slug));
  const postingNode = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline: post.headline,
    description: post.description,
    /* `image` ONLY when the post genuinely shows one — LRG-UX-SCHEMA-001 correction 3, and the same reasoning
       as `newsSchema.ts`. No corpus record has an asset, so the field is absent throughout. Conflict 44. */
    ...articleImageField(post.representativeImage, PRODUCTION_ORIGIN),
    datePublished: post.datePublishedIso,
    dateModified: post.dateModifiedIso,
    author: authorNode(author),
    publisher: organizationRef(),
    articleSection: post.category,
    keywords: post.keywords.join(", "),
    about: post.primaryEntity,
    mentions: [...post.gameIds, ...post.stateCodes.map((c) => c.toUpperCase())],
    isAccessibleForFree: true,
    inLanguage: "en-US",
    copyrightHolder: organizationRef(),
    copyrightYear: new Date(post.datePublishedIso).getUTCFullYear(),
    publishingPrinciples: PUBLISHING_PRINCIPLES,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [...SPEAKABLE_SELECTORS],
    },
    /* Reflects the visible derivation: the abstract IS the Key points the page shows. */
    abstract: deriveKeyPoints(post).join(" "),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      postingNode,
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: post.headline,
        isPartOf: websiteRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl("/blog") },
          { "@type": "ListItem", position: 3, name: post.headline, item: url },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------ desk author (Template J adapted) */

export function blogAuthorSchema(author: BlogAuthorRecord) {
  const url = canonicalUrl(blogAuthorPath(author.slug));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#webpage`,
        url,
        name: author.name,
        isPartOf: websiteRef(),
        /* Organization, not Person — the desk is a team identity, and schema must not upgrade it (Conflict 41
           condition 4 by adoption; the Person upgrade is the recorded launch condition on the record). */
        mainEntity: {
          "@type": "Organization",
          "@id": `${url}#author`,
          name: author.name,
          description: author.biography,
          url,
          parentOrganization: organizationRef(),
          knowsAbout: [...author.covers],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl("/blog") },
          { "@type": "ListItem", position: 3, name: author.name, item: url },
        ],
      },
    ],
  };
}
