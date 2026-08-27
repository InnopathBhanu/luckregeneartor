/*
 * THE NEWS ARTICLE VIEW MODEL — 07B §3's fifteen sections, in order, over one review-corpus record.
 *
 * The component renders `sections` in the order given and nothing else, so the composition is assertable from
 * the model (`tests/news-pages.test.ts`) and auditable from the DOM (`data-article-section`, `data-library-id`).
 * The order and the SL-E mapping are the ones recorded in `NEWS_ARTICLE_SECTION_ORDER` (`newsContract.ts`) —
 * 07B defines the order WITHOUT ids of its own, so the Global Shell editorial library supplies the vocabulary.
 *
 * A section the record cannot honestly fill is SUPPRESSED WITH A REASON rather than padded:
 *   - order 7 (Conditional AI): always suppressed here — nothing passes the 07 §7 acceptance test with no model;
 *   - order 12 (Canonical discussion): the typed seam is `canonicalDiscussionThreadId: null` until the community
 *     phase connects a real thread. The focused question (order 11) still renders as static text.
 */

import { getNewsArticle, getNewsAuthor, getNewsData } from "./bff/newsBff";
import type { NewsArticleRecord, NewsAuthorRecord, NewsArticleSectionRow } from "./newsContract";
import { NEWS_ARTICLE_SECTION_ORDER } from "./newsContract";
import { newsAdProfile, type NewsAdProfile } from "./newsAdProfile";
import { getForumEntryById } from "@/lib/community/bff/communityBff";
import { communityEntryPath } from "@/lib/community/communityContract";

/** The resolved canonical discussion — Template M's community half, when the seam carries a thread id. */
export interface ArticleDiscussionVm {
  href: string;
  title: string;
  /** The thread's visible reply count — the same number the community page prints. */
  replyCount: number;
}

export interface NewsArticleSectionVm extends NewsArticleSectionRow {
  /** Whether the record can honestly fill this section. */
  rendered: boolean;
  /** Why a section is suppressed, when it is. */
  suppressed: string | null;
}

export interface NewsArticleModel {
  article: NewsArticleRecord;
  author: NewsAuthorRecord;
  /** The payload disclosure — rendered once, above the article. */
  disclosure: string | null;
  /** The fifteen 07B §3 rows, in order, each marked rendered or suppressed-with-reason. */
  sections: readonly NewsArticleSectionVm[];
  /**
   * Order 12 — the one canonical community discussion (07 §10 / 08D Template M), resolved through the
   * community BFF when `canonicalDiscussionThreadId` names a thread this build serves. Null keeps the honest
   * "no thread is fabricated" sentence.
   */
  discussion: ArticleDiscussionVm | null;
  ads: NewsAdProfile;
}

/** Resolve the Template M seam: a thread id becomes a link only when the community build serves the thread. */
function resolveDiscussion(article: NewsArticleRecord): ArticleDiscussionVm | null {
  if (!article.canonicalDiscussionThreadId) return null;
  const entry = getForumEntryById(article.canonicalDiscussionThreadId);
  if (!entry) return null;
  return { href: communityEntryPath(entry.slug), title: entry.title, replyCount: entry.replies.length };
}

export function buildNewsArticleModel(slug: string): NewsArticleModel | null {
  const article = getNewsArticle(slug);
  if (!article) return null;
  const author = getNewsAuthor(article.authorSlug);
  if (!author) return null;

  const discussion = resolveDiscussion(article);

  const sections: NewsArticleSectionVm[] = NEWS_ARTICLE_SECTION_ORDER.map((row) => {
    switch (row.order) {
      case 5:
        return article.beforeAfter
          ? { ...row, rendered: true, suppressed: null }
          : {
              ...row, rendered: false,
              suppressed:
                "No verified data card exists for this article, and no owned editorial image exists in this "
                + "repository. 07B §18 forbids fabricating documentary imagery, so the slot renders nothing.",
            };
      case 7:
        return {
          ...row, rendered: false,
          suppressed: article.aiContext.suppressionReason,
        };
      case 12:
        return discussion
          ? { ...row, rendered: true, suppressed: null }
          : {
              ...row, rendered: false,
              suppressed:
                "canonicalDiscussionThreadId is null: this article has no community discussion yet, and a "
                + "discussion thread is never fabricated (07 §10). The typed seam fills per article as the "
                + "community connects threads (08D Template M).",
            };
      default:
        return { ...row, rendered: true, suppressed: null };
    }
  });

  return {
    article,
    author,
    disclosure: getNewsData().meta.disclosure,
    sections,
    discussion,
    ads: newsAdProfile(),
  };
}
