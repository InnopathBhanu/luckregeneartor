/*
 * THE BLOG TAGGED-CONTENT SOURCE — the third real registration in `flagshipTaggedContent.ts`.
 *
 * The flagship guides rail (FG-11) was specified as "ready to pull" blog entries tagged `Powerball` /
 * `Mega Millions`, and until Conflict 39 no blog system existed — the rail kept its recorded empty state and
 * the BFF preview items. The Blog family now exists, so this is the registration: tagged review posts resolve
 * to real `/blog/{slug}` destinations.
 *
 * Every item it returns:
 *   - comes from the one BFF seam (`getBlogData`), never from the JSON directly;
 *   - carries `provenance: "synthetic/internal-review"`, which the rail renders as its preview tag;
 *   - is evergreen editorial (the BFF asserts no current-news claim, no winner, no jackpot figure on every
 *     read) — so the rail shows nothing that could read as manufactured news (`CLAUDE.md` §14).
 */

import type { ContentTag, TaggedContentItem } from "@/lib/flagship/flagshipContract";
import type { TaggedContentSource } from "@/lib/flagship/flagshipTaggedContent";
import { getBlogData } from "./bff/blogBff";
import { blogPostPath } from "./blogContract";

export const blogTaggedContentSource: TaggedContentSource = {
  kind: "blog",
  fetchByTag(tag: ContentTag, limit: number): readonly TaggedContentItem[] {
    const data = getBlogData();
    const authorNames = new Map(data.authors.map((a) => [a.slug, a.name]));
    return data.posts
      .filter((p) => p.tags.includes(tag))
      .sort((a, b) => b.datePublishedIso.localeCompare(a.datePublishedIso))
      .slice(0, limit)
      .map((p): TaggedContentItem => ({
        id: `blog:${p.slug}`,
        kind: "blog",
        title: p.headline,
        author: authorNames.get(p.authorSlug) ?? "LotteryCorner Guides Desk",
        publishedIso: p.datePublishedIso,
        href: blogPostPath(p.slug),
        excerpt: p.description,
        tags: p.tags,
        provenance: "synthetic/internal-review",
      }));
  },
};
