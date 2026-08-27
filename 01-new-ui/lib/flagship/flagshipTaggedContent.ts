/*
 * TAGGED CONTENT ADAPTERS — LRG-FLAGSHIP-002, sections FG-11, FG-12 and FG-13.
 *
 * Authority: BP-04A §25 (Guides and LotteryCorner Research), §26 (News and Winners), §27 (Community, and
 * *"No fabricated members or replies"*), the frozen Constitution (*"Community content is human-authored. MUST NOT
 * fabricate posts, threads, replies, reputation, or activity"*), `ACCT-DEC-001` `FD-ACC-10` (forum integration
 * stays hidden because no forum platform exists), `CLAUDE.md` §14.
 *
 * ══ WHY THIS FILE IS A SEAM AND NOT A FIXTURE ══
 *
 * The task asks for the flagship hubs to *"pull or be ready to pull"* forum, blog and news entries tagged
 * `Powerball` or `Mega Millions`. None of those systems exists: the capability audit found no forum route, no
 * model, no component and **no forum table among the 37 production tables**, and there is no editorial store
 * either. So the honest shape of "ready to pull" is a typed adapter with one implementation that returns nothing
 * and says why.
 *
 * That is deliberately NOT a fixture of sample posts. A synthetic discussion thread on a public lottery page is a
 * false statement about real people — the one category `CLAUDE.md` §14 rules out even behind a guard, and the one
 * the Constitution names twice. The empty state is designed, labelled and intentional instead.
 *
 * ══ THE TAG IS THE CONTRACT ══
 *
 * Each game config carries its own `contentTag` (`Powerball`, `Mega Millions`). Every query goes through
 * `taggedFeed`, so when a content system arrives there is exactly one place to connect it, and the Powerball hub
 * cannot start showing Mega Millions entries because a component hardcoded a string.
 */

import type { ContentTag, Gap, TaggedContentFeed, TaggedContentItem, TaggedContentKind } from "./flagshipContract";
import type { BffContentItem } from "./bff/flagshipBffContract";
import { newsTaggedContentSource } from "@/lib/news/newsTaggedContentSource";
import { communityTaggedContentSource } from "@/lib/community/communityTaggedContentSource";
import { blogTaggedContentSource } from "@/lib/blog/blogTaggedContentSource";

/**
 * The shape a real content system must satisfy to be connected here.
 *
 * One method, taking the tag and a limit. Deliberately minimal: a forum, a blog and a news store are three
 * different systems, and the page must not know which of them is behind this call.
 */
export interface TaggedContentSource {
  kind: TaggedContentKind;
  /** Newest first, at most `limit` items, every one of them tagged `tag`. */
  fetchByTag(tag: ContentTag, limit: number): readonly TaggedContentItem[];
}

/** Why each feed is empty in this build. Rendered as the empty state, not swallowed. */
const UNAVAILABLE: Record<TaggedContentKind, Gap> = {
  forum: {
    what: "Community discussions tagged for this game",
    why:
      "No community platform is connected yet. Discussions are written by members, so nothing appears here until " +
      "there are real ones — no sample threads, replies or members have been created.",
  },
  blog: {
    what: "Guides and LotteryCorner Research tagged for this game",
    why:
      "No editorial store is connected yet. Guides are published pieces with named authors and review dates, so " +
      "none is shown until there are real ones.",
  },
  news: {
    what: "News and winner stories tagged for this game",
    why:
      "No news store is connected yet. A winner story is a factual claim about a real person, so nothing is shown " +
      "here until it comes from a published source.",
  },
};

/**
 * The registered sources.
 *
 * Connecting a real forum, blog or news store is a one-line registration here plus the adapter that satisfies
 * `TaggedContentSource`; no component changes. The NEWS source is now that registration: the News page family
 * exists (07/07A/07B), so tagged review articles resolve to real `/news/{slug}` destinations. Every item it
 * serves carries `provenance: "synthetic/internal-review"` and the BFF asserts the corpus contains no invented
 * current-news claim (`lib/news/bff/newsBff.ts`).
 *
 * The FORUM source is the second registration: the Community family exists (08A/08B/08C, Conflict 41 FOUNDER
 * AMENDMENT), so tagged discussions resolve to real `/community/{slug}` destinations, each carrying
 * `provenance: "synthetic/internal-review"` and the community BFF's own per-read assertions.
 *
 * The BLOG source is the third registration: the Blog family exists (Conflict 39, founder-authorized), so the
 * FG-11 guides rail resolves tagged evergreen posts to real `/blog/{slug}` destinations, each carrying
 * `provenance: "synthetic/internal-review"` and the blog BFF's per-read assertions (no current-news claim, no
 * invented winner, no jackpot figure).
 */
const SOURCES: readonly TaggedContentSource[] = Object.freeze([
  newsTaggedContentSource,
  communityTaggedContentSource,
  blogTaggedContentSource,
]);

/** Whether any content system is connected at all. Governs the AI content questions and the section copy. */
export function isContentConnected(): boolean {
  return SOURCES.length > 0;
}

/**
 * Whether a REAL source is registered for one kind.
 *
 * Per-kind on purpose: the contract note in `bff/flagshipBffContract.ts` records that forum, blog and news are
 * three different systems and *"one being down does not empty the others"* — so connecting the news store must
 * not silently empty the forum and blog rails that the BFF preview still legitimately fills.
 */
export function isKindConnected(kind: TaggedContentKind): boolean {
  return SOURCES.some((s) => s.kind === kind);
}

/**
 * One tagged feed.
 *
 * When a source is registered, its items are returned and `unavailable` is `null`. When none is, the feed is empty
 * and carries the reason — which is what the section renders, rather than a card with nothing in it.
 */
export function taggedFeed(kind: TaggedContentKind, tag: ContentTag, limit = 3): TaggedContentFeed {
  const source = SOURCES.find((s) => s.kind === kind);
  if (!source) {
    return { kind, tag, items: [], unavailable: UNAVAILABLE[kind] };
  }
  const items = source.fetchByTag(tag, limit);
  /*
   * A source that returns an item carrying the wrong tag is a bug in the source, and it must not reach the page:
   * the whole point of the tag contract is that the Powerball hub shows Powerball entries.
   */
  const filtered = items.filter((i) => i.tags.includes(tag)).slice(0, limit);
  return {
    kind,
    tag,
    items: filtered,
    unavailable: filtered.length > 0 ? null : UNAVAILABLE[kind],
  };
}

/** The three feeds a flagship hub renders, in section order: guides, news, community. */
export function flagshipContentFeeds(tag: ContentTag): {
  guides: TaggedContentFeed;
  news: TaggedContentFeed;
  community: TaggedContentFeed;
} {
  return {
    guides: taggedFeed("blog", tag, 3),
    news: taggedFeed("news", tag, 3),
    /* BP-04A §14 content budget: three discussions. */
    community: taggedFeed("forum", tag, 3),
  };
}

/* ------------------------------------------------------------------ from the BFF */

/**
 * The same three feeds, filled from a BFF payload — FGP-009.
 *
 * ══ WHY THIS IS NOT A FABRICATION ══
 *
 * The comment at the top of this file rules out a fixture of sample posts, and that judgement stands for
 * PUBLISHED content: a synthetic thread that reads as a real member's words is a false statement about a real
 * person. Nothing here changes that rule; what changed is the surrounding conditions.
 *
 * The preview items satisfy all four of the conditions that make the difference:
 *
 *   1. Every item carries `source: "mock"`, and the rail renders a preview tag from it.
 *   2. Every excerpt SAYS IN ITS OWN TEXT that it was written for interface testing. A reader who reads the item
 *      rather than the tag still cannot mistake it for a member's post.
 *   3. No item names a real person, a real winner, a real claim, a prize amount or a retailer.
 *   4. The pages are `noindex, nofollow`, out of the sitemap, and lead with the disclosure banner.
 *
 * The alternative — three permanently empty rails — would have left the module's layout, density, wrapping and
 * ad-adjacency unverifiable before the live check the founder asked for. Recorded in `source-conflicts.md`.
 *
 * The empty state is NOT deleted: a payload that carries no items for a kind still renders that kind's recorded
 * reason, so connecting a real store and finding it empty behaves exactly as before.
 *
 * A REGISTERED SOURCE WINS PER KIND. The News family now registers a real source, so the news rail resolves
 * through `taggedFeed` to real `/news/{slug}` destinations; forum and blog have no system yet and keep their
 * BFF preview items. Kind by kind rather than all-or-nothing, so one connection cannot empty its neighbours.
 */
export function flagshipContentFeedsFrom(
  tag: ContentTag,
  content: {
    forum: readonly BffContentItem[];
    blog: readonly BffContentItem[];
    news: readonly BffContentItem[];
  },
): { guides: TaggedContentFeed; news: TaggedContentFeed; community: TaggedContentFeed } {
  return {
    guides: isKindConnected("blog") ? taggedFeed("blog", tag, 3) : fromBff("blog", tag, content.blog, 3),
    news: isKindConnected("news") ? taggedFeed("news", tag, 3) : fromBff("news", tag, content.news, 3),
    community: isKindConnected("forum") ? taggedFeed("forum", tag, 3) : fromBff("forum", tag, content.forum, 3),
  };
}

function fromBff(
  kind: TaggedContentKind,
  tag: ContentTag,
  items: readonly BffContentItem[],
  limit: number,
): TaggedContentFeed {
  /* The tag contract is enforced on BFF items exactly as it is on a registered source: the Powerball hub shows
     Powerball entries, whatever the payload claims. */
  const kept = items
    .filter((i) => i.kind === kind && i.tags.includes(tag))
    .slice(0, limit)
    .map(
      (i): TaggedContentItem => ({
        id: i.id,
        kind: i.kind,
        title: i.title,
        author: i.author,
        publishedIso: i.publishedIso,
        href: i.href,
        excerpt: i.excerpt,
        tags: i.tags,
        ...(i.replyCount === undefined ? {} : { replyCount: i.replyCount }),
        provenance: i.source === "productionFeed" ? "productionFeed" : "synthetic/internal-review",
      }),
    );

  return { kind, tag, items: kept, unavailable: kept.length > 0 ? null : UNAVAILABLE[kind] };
}
