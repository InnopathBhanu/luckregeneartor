/*
 * ROUTE METADATA FOR THE BLOG FAMILY — Conflict 39; 07C Template A adapted; Template M (social package).
 *
 * ══ AVAILABLE IS NOT INDEXABLE ══
 *
 * Every route here is `robots: { index: false, follow: false }` per `PUBLICATION_SAFETY` (`FD-GATE-01`): no
 * page family is indexable until its launch task removes the noindex. The canonical and the `noindex` coexist
 * deliberately pre-launch (the tag reaches no crawler while `noindex` stands).
 *
 * THE SEARCH PAGE IS DIFFERENT: `/blog/search` is noindex ALWAYS, launch or no launch — a search-results page
 * has no search intent of its own to serve. Its metadata carries no canonical for the query variants; the
 * crawlable path to the corpus is the hub.
 *
 * ══ THE SOCIAL PACKAGE (founder: "engaging and sharable"; 07C Template M) ══
 *
 * The post metadata carries the COMPLETE OpenGraph article shape — type, url, siteName, title, description,
 * publishedTime, modifiedTime, section, tags, authors — and the Twitter summary card. No image claim is made:
 * no owned editorial image exists, and 07B §16 forbids unverified assets. The share row on the page reuses the
 * same canonical URL, so every share channel carries one consistent identity.
 */

import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import type { BlogAuthorRecord, BlogPostRecord } from "./blogContract";
import {
  BLOG_CATEGORY_LABELS, BLOG_HUB_DESCRIPTION, BLOG_HUB_TITLE, blogAuthorPath, blogPostPath,
} from "./blogContract";

const NOINDEX = { index: false, follow: false } as const;

/** The hub — verbatim-unique title and description from the contract. */
export function blogHubMetadata(): Metadata {
  const canonical = canonicalUrl("/blog");
  return {
    title: { absolute: BLOG_HUB_TITLE },
    description: BLOG_HUB_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: BLOG_HUB_TITLE,
      description: BLOG_HUB_DESCRIPTION,
    },
    twitter: { card: "summary", title: BLOG_HUB_TITLE, description: BLOG_HUB_DESCRIPTION },
    robots: NOINDEX,
  };
}

/** One post — `<Headline> | LotteryCorner Blog`, with the complete Template M social package. */
export function blogPostMetadata(post: BlogPostRecord): Metadata {
  const title = `${post.headline} | LotteryCorner Blog`;
  const canonical = canonicalUrl(blogPostPath(post.slug));
  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "LotteryCorner",
      title,
      description: post.description,
      publishedTime: post.datePublishedIso,
      modifiedTime: post.dateModifiedIso,
      section: BLOG_CATEGORY_LABELS[post.category],
      tags: [...post.keywords],
      /* The accountable desk profile — a real same-site URL, never an unverified identity (07B §16). */
      authors: [canonicalUrl(blogAuthorPath(post.authorSlug))],
    },
    twitter: { card: "summary", title, description: post.description },
    robots: NOINDEX,
  };
}

/** The founder-added search page. Noindex ALWAYS — see the header note. */
export function blogSearchMetadata(): Metadata {
  const title = "Search the Blog | LotteryCorner";
  const description = "Search LotteryCorner's evergreen guides, analysis and player-culture posts by keyword.";
  return {
    title: { absolute: title },
    description,
    /* No canonical: every query string is a variant of a page that must never be indexed. */
    robots: NOINDEX,
  };
}

/** A desk-author profile on the shared `/authors/{slug}` surface. */
export function blogAuthorMetadata(author: BlogAuthorRecord): Metadata {
  const title = `${author.name} | LotteryCorner`;
  const description = `${author.name} — ${author.role}. Beat, posts and editorial standards.`;
  const canonical = canonicalUrl(blogAuthorPath(author.slug));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "profile", url: canonical, siteName: "LotteryCorner", title, description },
    twitter: { card: "summary", title, description },
    robots: NOINDEX,
  };
}
