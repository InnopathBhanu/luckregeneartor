/*
 * THE FORUM TAGGED-CONTENT SOURCE — the second real registration in `flagshipTaggedContent.ts`.
 *
 * The flagship adapters were written as a seam: connecting a content system is "a one-line registration plus
 * the adapter that satisfies `TaggedContentSource`; no component changes." The News family made the first
 * registration; the Community family now makes the forum one, so the flagship FG-13 community rail pulls
 * discussions tagged `Powerball` / `Mega Millions` and links them to their real `/community/{slug}` pages.
 *
 * Every item it returns:
 *   - comes from the one BFF seam (`getCommunityData`), never from the JSON directly;
 *   - carries `provenance: "synthetic/internal-review"`, which the rail renders as its preview tag;
 *   - is a Conflict-41-authorized review fixture behind a disclosed, noindex page — no invented winner, no
 *     prediction, no real-person claim (the BFF asserts the corpus's shape on every read);
 *   - reports `replyCount` as the thread's visible reply count, a fact about the disclosed fixture thread.
 *
 * ══ THE TAG MAPPING ══
 *
 * Flagship game configs use display-form tags (`Powerball`, `Mega Millions`); the forum corpus stores
 * slug-form game ids and tags (`powerball`, `mega-millions`). The adapter matches case-insensitively on the
 * slug form and returns items whose tag list includes the REQUESTED display tag, so `taggedFeed`'s own
 * tag-contract filter passes without the corpus having to know the flagship's display strings.
 */

import type { ContentTag, TaggedContentItem } from "@/lib/flagship/flagshipContract";
import type { TaggedContentSource } from "@/lib/flagship/flagshipTaggedContent";
import { getCommunityData } from "./bff/communityBff";
import { communityEntryPath, type ForumEntryRecord } from "./communityContract";

/** Display tag → corpus slug form: "Mega Millions" → "mega-millions". */
function slugForm(tag: ContentTag): string {
  return tag.toLowerCase().replace(/\s+/g, "-");
}

function excerptOf(entry: ForumEntryRecord): string {
  const firstText = entry.body.find((b) => b.kind === "text")?.text ?? entry.title;
  return firstText.length > 180 ? `${firstText.slice(0, 177)}…` : firstText;
}

export const communityTaggedContentSource: TaggedContentSource = {
  kind: "forum",
  fetchByTag(tag: ContentTag, limit: number): readonly TaggedContentItem[] {
    const wanted = slugForm(tag);
    return getCommunityData()
      .entries.filter((e) => e.gameId === wanted || e.tags.includes(wanted))
      .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
      .slice(0, limit)
      .map((e): TaggedContentItem => ({
        id: `forum:${e.slug}`,
        kind: "forum",
        title: e.title,
        author: `@${e.username}`,
        publishedIso: e.createdAtIso,
        href: communityEntryPath(e.slug),
        excerpt: excerptOf(e),
        /* The requested display tag plus the entry's own governed tags. */
        tags: [tag, ...e.tags],
        replyCount: e.replies.length,
        provenance: "synthetic/internal-review",
      }));
  },
};
