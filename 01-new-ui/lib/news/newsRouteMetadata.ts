/*
 * ROUTE METADATA FOR THE NEWS FAMILY — 07A §17 (hub, verbatim), 07C Template A (article), Template J (author).
 *
 * ══ AVAILABLE IS NOT INDEXABLE ══
 *
 * Every route here is `robots: { index: false, follow: false }`, per `PUBLICATION_SAFETY` (`FD-GATE-01`): no
 * page family is indexable until its launch task removes the noindex. 07C Template A writes
 * `Robots: index,follow` for a PUBLISHED article — that is the launch posture, and it is exactly the field the
 * launch task will flip; emitting it now would put a review corpus into the index. The canonical and the
 * `noindex` coexist deliberately pre-launch (the tag reaches no crawler while `noindex` stands).
 *
 * THE SEARCH PAGE IS DIFFERENT: `/news/search` is noindex ALWAYS, launch or no launch — a search-results page
 * has no search intent of its own to serve, and indexing one creates infinite duplicate URLs. Its metadata
 * carries no canonical for the query variants; the crawlable path to the corpus is the hub feed.
 */

import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import type { NewsArticleRecord, NewsAuthorRecord } from "./newsContract";
import {
  NEWS_HUB_DESCRIPTION, NEWS_HUB_TITLE, newsArticlePath, newsAuthorPath,
} from "./newsContract";

const NOINDEX = { index: false, follow: false } as const;

/** 07A §17 — title and description VERBATIM. */
export function newsHubMetadata(): Metadata {
  const canonical = canonicalUrl("/news");
  return {
    title: { absolute: NEWS_HUB_TITLE },
    description: NEWS_HUB_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: NEWS_HUB_TITLE,
      description: NEWS_HUB_DESCRIPTION,
    },
    twitter: { card: "summary", title: NEWS_HUB_TITLE, description: NEWS_HUB_DESCRIPTION },
    robots: NOINDEX,
  };
}

/** 07C Template A — `Title: <Headline> | LotteryCorner`, description = factual summary plus player implication. */
export function newsArticleMetadata(article: NewsArticleRecord): Metadata {
  const title = `${article.headline} | LotteryCorner`;
  const canonical = canonicalUrl(newsArticlePath(article.slug));
  return {
    title: { absolute: title },
    description: article.description,
    alternates: { canonical },
    openGraph: {
      /* 07B §16: verified headline, description, canonical and dates. No unverified identity, no IP-resolved
         offer, and no image claim — no owned editorial image asset exists. */
      type: "article",
      url: canonical,
      siteName: "LotteryCorner",
      title,
      description: article.description,
      publishedTime: article.datePublishedIso,
      modifiedTime: article.dateModifiedIso,
    },
    twitter: { card: "summary", title, description: article.description },
    robots: NOINDEX,
  };
}

/** The founder-added search page. Noindex ALWAYS — see the header note. */
export function newsSearchMetadata(): Metadata {
  const title = "Search Lottery News | LotteryCorner";
  const description = "Search LotteryCorner's lottery news, guides and research by keyword, game or state.";
  return {
    title: { absolute: title },
    description,
    /* No canonical: every query string is a variant of a page that must never be indexed. */
    robots: NOINDEX,
  };
}

/** 07C Template J — the author profile. */
export function newsAuthorMetadata(author: NewsAuthorRecord): Metadata {
  const title = `${author.name} | LotteryCorner`;
  const description = `${author.name} — ${author.role}. Coverage, recent articles and editorial standards.`;
  const canonical = canonicalUrl(newsAuthorPath(author.slug));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "profile", url: canonical, siteName: "LotteryCorner", title, description },
    twitter: { card: "summary", title, description },
    robots: NOINDEX,
  };
}
