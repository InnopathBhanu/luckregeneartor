/*
 * THE NEWS TAGGED-CONTENT SOURCE — the first real registration in `flagshipTaggedContent.ts`.
 *
 * The flagship adapters were written as a seam with zero sources because no content system existed: connecting
 * one was specified as "a one-line registration plus the adapter that satisfies `TaggedContentSource`; no
 * component changes." The News family now exists, so this is that adapter — the flagship FG-12 news rail pulls
 * review articles tagged `Powerball` / `Mega Millions` and links them to their real `/news/{slug}` pages.
 *
 * Every item it returns:
 *   - comes from the one BFF seam (`getNewsData`), never from the JSON directly;
 *   - carries `provenance: "synthetic/internal-review"`, which the rail renders as its preview tag;
 *   - is an evergreen guide or a dated historical record (the BFF asserts this on every read) — so the rail
 *     shows no invented winner, jackpot or current event (`CLAUDE.md` §14).
 */

import type { ContentTag, TaggedContentItem } from "@/lib/flagship/flagshipContract";
import type { TaggedContentSource } from "@/lib/flagship/flagshipTaggedContent";
import { getNewsData } from "./bff/newsBff";
import { newsArticlePath } from "./newsContract";

export const newsTaggedContentSource: TaggedContentSource = {
  kind: "news",
  fetchByTag(tag: ContentTag, limit: number): readonly TaggedContentItem[] {
    const data = getNewsData();
    const authorNames = new Map(data.authors.map((a) => [a.slug, a.name]));
    return data.articles
      .filter((a) => a.tags.includes(tag))
      .sort((a, b) => b.datePublishedIso.localeCompare(a.datePublishedIso))
      .slice(0, limit)
      .map((a): TaggedContentItem => ({
        id: `news:${a.slug}`,
        kind: "news",
        title: a.headline,
        author: authorNames.get(a.authorSlug) ?? "LotteryCorner Editorial Team",
        publishedIso: a.datePublishedIso,
        href: newsArticlePath(a.slug),
        excerpt: a.description,
        tags: a.tags,
        provenance: "synthetic/internal-review",
      }));
  },
};
