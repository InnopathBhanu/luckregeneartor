/*
 * NEWS JSON-LD — 07 §15, 07A §17, 07B §15, 07C Templates J and K.
 *
 * Every builder here reflects VISIBLE content only (`CLAUDE.md` §11). The hub `ItemList` includes only the
 * article cards the page renders; the `NewsArticle` graph carries the article's own visible headline, dates and
 * author; the author page is a `ProfilePage`.
 *
 * ══ THE ONE RECORDED DEPARTURE FROM TEMPLATE K ══
 *
 * Template K writes `author: @type Person`. The review corpus's accountable author is the clearly-labelled
 * editorial-team placeholder — NOT a person — and emitting `Person` for it would be precisely the fabricated
 * reporter identity 07 §3 forbids. So the author node is emitted as `@type: Organization` until a real reporter
 * record exists. Every §15 REQUIRED FIELD is still present; only the author node's type differs, and it differs
 * because the truth does. The same applies to the ProfilePage `mainEntity` (Template J).
 *
 * ══ `image` — 07B §15 LISTS IT AS REQUIRED, AND THIS MODULE OMITS IT ══
 *
 * It used to carry `/logo.png` on every article: no editorial asset exists, 07B §18 forbids fabricating
 * documentary imagery, and the logo is the one image the organization owns. That answers the wrong question.
 * `Article.image` is the image REPRESENTING THE ARTICLE, and Google's structured-data policies require markup
 * to describe visible content — a wordmark represents every article equally, which is to say none of them.
 *
 * So `image` is emitted only from a typed asset the page genuinely shows (`representativeImage`), and no corpus
 * record has one. The disagreement with §15 is real and is recorded as **Conflict 44**, not reconciled here.
 */

import { PRODUCTION_ORIGIN, ORGANIZATION_ID, canonicalUrl } from "@/lib/seo/productionOrigin";
import { organizationRef, websiteRef } from "@/lib/seo/brandIdentity";
import { articleImageField } from "@/lib/seo/articleImage";
import type { NewsArticleRecord, NewsAuthorRecord } from "./newsContract";
import { NEWS_HUB_H1, NEWS_HUB_DESCRIPTION, newsArticlePath, newsAuthorPath } from "./newsContract";

/*
 * THE PUBLISHER NODE IS GONE FROM THIS MODULE — LRG-UX-SCHEMA-001 correction 1.
 *
 * It used to define a full Organization here, and the root layout defines one too. Both carried `ORGANIZATION_ID`
 * and DIFFERENT `name` values, so every rendered news page shipped two Organization entities disagreeing under one
 * `@id`. `organizationRef()` emits the reference; the layout owns the entity. Every `publisher: { "@id": … }` in
 * this file already resolved that way — the graph member was the redundant half.
 */

/** The editorial-policy URL `publishingPrinciples` points at — the corrections policy is the live trust surface. */
const PUBLISHING_PRINCIPLES = `${PRODUCTION_ORIGIN}/corrections-policy`;

function authorNode(author: NewsAuthorRecord) {
  return {
    /* Organization, not Person — see the header note. The truth-preserving reading of Template K. */
    "@type": "Organization",
    "@id": `${canonicalUrl(newsAuthorPath(author.slug))}#author`,
    name: author.name,
    url: canonicalUrl(newsAuthorPath(author.slug)),
  };
}

/* ------------------------------------------------------------------ hub (07A §17) */

/**
 * The hub graph: CollectionPage, BreadcrumbList, ItemList, Organization, WebSite — 07A §17 verbatim list.
 * `visibleCards` is exactly the set of article cards the page renders, in render order.
 */
export function newsHubSchema(visibleCards: readonly { headline: string; slug: string }[]) {
  const url = canonicalUrl("/news");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: NEWS_HUB_H1,
        description: NEWS_HUB_DESCRIPTION,
        isPartOf: websiteRef(),
        publisher: organizationRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "News", item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#feed`,
        /* Visible article cards ONLY — 07A §17: "`ItemList` includes only visible article cards." */
        itemListElement: visibleCards.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.headline,
          url: canonicalUrl(newsArticlePath(c.slug)),
        })),
      },
    ],
  };
}

/* ------------------------------------------------------------------ article (07B §15, Template K) */

/**
 * The 07 §15 / 07B §15 REQUIRED `NewsArticle` field list, exported so the test asserts presence against the
 * blueprint's own list rather than against whatever this module happens to emit.
 */
export const NEWS_ARTICLE_REQUIRED_FIELDS: readonly string[] = Object.freeze([
  "@context", "@type", "@id", "url", "mainEntityOfPage", "headline", "description", "image",
  "datePublished", "dateModified", "author", "publisher", "articleSection", "keywords", "about",
  "mentions", "isAccessibleForFree", "inLanguage", "copyrightHolder", "copyrightYear", "publishingPrinciples",
]);

/**
 * The subset of that list this module emits CONDITIONALLY, with the reason.
 *
 * `image` is required by §15 and present only when the article genuinely shows a representative asset. Split
 * out rather than deleted from the list above, so the blueprint's own requirement stays readable in source and
 * the test asserts the *rule* — absent without an asset, present with one — instead of quietly not checking.
 */
export const NEWS_ARTICLE_CONDITIONAL_FIELDS: readonly string[] = Object.freeze(["image"]);

/**
 * One article's graph — NewsArticle + WebPage + BreadcrumbList, with author and publisher nodes (07B §15's
 * conceptual graph). `EDITORIAL` records emit `Article` instead of `NewsArticle` (07 §1: evergreen editorial
 * is `Article`/`BlogPosting`), with the same field discipline.
 */
export function newsArticleSchema(article: NewsArticleRecord, author: NewsAuthorRecord) {
  const url = canonicalUrl(newsArticlePath(article.slug));
  const articleNode = {
    "@type": article.contentType === "NEWS" ? "NewsArticle" : "Article",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline: article.headline,
    description: article.description,
    /*
     * `image` ONLY when the article genuinely shows one — LRG-UX-SCHEMA-001 correction 3. This carried
     * `/logo.png` on every article; a wordmark represents the publisher, not the story, and Google's
     * structured-data policies require markup to describe the page's visible content. No corpus record has an
     * asset, so the field is absent throughout. See Conflict 44 — 07B §15 lists `image` as required.
     */
    ...articleImageField(article.representativeImage, PRODUCTION_ORIGIN),
    datePublished: article.datePublishedIso,
    dateModified: article.dateModifiedIso,
    author: authorNode(author),
    publisher: organizationRef(),
    articleSection: article.newsCategory,
    keywords: article.keywords.join(", "),
    about: article.primaryEntity,
    mentions: [...article.gameIds, ...article.stateCodes.map((c) => c.toUpperCase())],
    isAccessibleForFree: true,
    inLanguage: "en-US",
    copyrightHolder: organizationRef(),
    copyrightYear: new Date(article.datePublishedIso).getUTCFullYear(),
    publishingPrinciples: PUBLISHING_PRINCIPLES,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      articleNode,
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: article.headline,
        isPartOf: websiteRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "News", item: canonicalUrl("/news") },
          { "@type": "ListItem", position: 3, name: article.headline, item: url },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------ author (07B §14, Template J) */

export function newsAuthorSchema(author: NewsAuthorRecord) {
  const url = canonicalUrl(newsAuthorPath(author.slug));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#webpage`,
        url,
        name: author.name,
        isPartOf: websiteRef(),
        /* Organization, not Person — the placeholder is a team identity, and schema must not upgrade it. */
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
          { "@type": "ListItem", position: 2, name: "News", item: canonicalUrl("/news") },
          { "@type": "ListItem", position: 3, name: author.name, item: url },
        ],
      },
    ],
  };
}
