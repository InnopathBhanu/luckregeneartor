/*
 * COMMUNITY JSON-LD — 08A §19 (home graph), 08B §17 (forum schema binding rules), 08D Template K
 * (DiscussionForumPosting field map) and Template L (ProfilePage).
 *
 * ══ PROVENANCE GOVERNS WHAT MAY BE CLAIMED — LRG-UX-SCHEMA-001 correction 2 ══
 *
 * A record that is not `genuine-ugc` gets `WebPage` + `BreadcrumbList` and nothing else: no
 * `DiscussionForumPosting`, no `Comment`, no author, no `interactionStatistic`, no `ItemList` membership. The
 * page and its place in the hierarchy are true; the claim that a human wrote the thread is not. See
 * `isGenuineUgc` in the contract for why the branch is on provenance rather than on the author rule below.
 *
 * ══ THE ONE RECORDED DEPARTURE FROM TEMPLATES K AND L — Conflict 41 amendment condition 4 ══
 *
 * Template K writes `author: @type Person` and Template L writes `mainEntity: @type Person`. The review
 * corpus's members are FOUNDER-AUTHORIZED DESIGN FIXTURES, not people, and the amendment is explicit:
 * *"Fixture members are never emitted as `Person` entities in JSON-LD."* So:
 *
 *   - the fixture corpus emits no author node of any kind, because it emits no posting node to attach one to
 *     (superseding the earlier plain-text-name treatment, which left the type's own claim in place);
 *   - the member profile page emits NO ProfilePage/Person markup at all — only WebPage + BreadcrumbList.
 *     A ProfilePage whose mainEntity cannot honestly be a Person is misleading markup, and 08C §8's own rule
 *     is that profiles must not retain misleading schema.
 *
 * Both revert to the Templates' full Person form the day real member records replace the corpus. Every §17
 * binding rule is otherwise honoured: JSON-LD, visible content only, visible replies only, one canonical,
 * no QAPage, and the news article page keeps `NewsArticle` (Template M — the community side of the shared
 * thread is the only side emitting `DiscussionForumPosting`).
 *
 * `interactionStatistic` carries the VISIBLE reply count, and is reached only on the genuine-UGC branch — a
 * reply counter for a thread nobody replied to is manufactured activity, disclosed review page or not.
 */

import { PRODUCTION_ORIGIN, ORGANIZATION_ID, canonicalUrl } from "@/lib/seo/productionOrigin";
import { organizationRef, websiteRef } from "@/lib/seo/brandIdentity";
import type {
  ContentProvenance, ForumEntryRecord, ForumReplyRecord, MemberPublicProfile, PostBlock,
} from "./communityContract";
import {
  COMMUNITY_H1, COMMUNITY_HOME_DESCRIPTION, COMMUNITY_HOME_PATH, communityEntryPath, isGenuineUgc, memberPath,
} from "./communityContract";

/*
 * THE PUBLISHER NODE IS GONE FROM THIS MODULE — LRG-UX-SCHEMA-001 correction 1.
 *
 * It defined a full Organization here while the root layout defined another, both under `ORGANIZATION_ID` and
 * with different `name` values — so every rendered page in this family shipped two Organization entities
 * disagreeing under one id. The layout owns the entity; `organizationRef()` emits the reference.
 */

/** Visible text of a post body — blocks joined, whitespace intact (schema mirrors visible content). */
export function postText(body: readonly PostBlock[]): string {
  return body.map((b) => b.text).join("\n\n");
}

/* ------------------------------------------------------------------ home (08A §19) */

/**
 * The 08A §19 conceptual graph, verbatim list: CollectionPage, BreadcrumbList, ItemList, Organization,
 * WebSite. `visibleEntryCards` is exactly the set of Forum Entry cards the page renders, in render order —
 * "`ItemList` represents only visible Forum Entry cards."
 */
export function communityHomeSchema(
  visibleEntryCards: readonly { title: string; slug: string; provenance: ContentProvenance }[],
) {
  const url = canonicalUrl(COMMUNITY_HOME_PATH);

  /*
   * THE ITEMLIST CARRIES GENUINE ENTRIES ONLY — LRG-UX-SCHEMA-001 correction 2.
   *
   * §19 lists `ItemList` and the cards are visibly on the page, so the old graph was internally consistent.
   * What it was not is truthful about what those cards ARE: an `ItemList` of fourteen discussion titles is a
   * claim that the site holds fourteen discussions. Every one is a fixture, so today this filters to empty and
   * the node is omitted rather than emitted with no members — an empty ItemList is still a claim, that the
   * collection is empty, and this collection is not empty, it is not-yet-real.
   *
   * `CollectionPage` and `BreadcrumbList` stay: the page genuinely exists and genuinely sits under Community.
   */
  const genuine = visibleEntryCards.filter((c) => isGenuineUgc(c.provenance));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: COMMUNITY_H1,
        description: COMMUNITY_HOME_DESCRIPTION,
        isPartOf: websiteRef(),
        publisher: organizationRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Community", item: url },
        ],
      },
      ...(genuine.length > 0
        ? [{
            "@type": "ItemList",
            "@id": `${url}#entries`,
            itemListElement: genuine.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.title,
              url: canonicalUrl(communityEntryPath(c.slug)),
            })),
          }]
        : []),
    ],
  };
}

/* ------------------------------------------------------------------ entry (08D Template K) */

/**
 * One entry's DiscussionForumPosting graph per Template K, with the amendment-condition-4 author treatment.
 *
 * `visibleReplies` is the reply set the current page RENDERS (the paginated slice) — §17: "only
 * visible/crawlable replies included". `visibleReplyCount` is the total the page states beside its replies
 * heading, which the pagination makes crawlable.
 */
/**
 * The author node for a GENUINE post or reply.
 *
 * `Person`, with a name and a resolvable profile URL — never a plain string. A bare string author names
 * somebody without identifying them, which on a forum is the difference between attribution and a rumour;
 * Google's discussion-forum guidance wants the author as an entity with a profile it can reach.
 *
 * Only ever called on the genuine-UGC branch. A fixture never reaches it.
 */
function ugcAuthorNode(username: string) {
  return {
    "@type": "Person",
    "@id": `${canonicalUrl(memberPath(username))}#person`,
    name: username,
    url: canonicalUrl(memberPath(username)),
  };
}

export function forumEntrySchema(
  entry: ForumEntryRecord,
  visibleReplies: readonly ForumReplyRecord[],
  visibleReplyCount: number,
) {
  const url = canonicalUrl(communityEntryPath(entry.slug));

  /*
   * THE PAGE NODES, which are true either way.
   *
   * This page exists, it has this title, and it sits under Community — none of that depends on who wrote the
   * thread. So `WebPage` and `BreadcrumbList` are unconditional, and they are the WHOLE graph for a fixture.
   */
  const pageNodes = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: entry.title,
      isPartOf: websiteRef(),
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: "Community", item: canonicalUrl(COMMUNITY_HOME_PATH) },
        { "@type": "ListItem", position: 3, name: entry.title, item: url },
      ],
    },
  ];

  /*
   * A REVIEW FIXTURE STOPS HERE — LRG-UX-SCHEMA-001 correction 2.
   *
   * No `DiscussionForumPosting`, no `Comment`, no author of any kind, and no `interactionStatistic`. Emitting
   * the posting type says a human wrote this; emitting a reply counter says people replied. Neither is true of
   * a thread the team wrote to test an interface, and the amendment's plain-text-author rule addressed only
   * WHO — it never made the post itself genuine.
   */
  if (!isGenuineUgc(entry.provenance)) {
    return { "@context": "https://schema.org", "@graph": pageNodes };
  }

  /*
   * THE ONE PROVENANCE-APPROVED REPLY LIST — LRG-UX-SCHEMA-002 §4.
   *
   * ══ WHAT WAS WRONG ══
   *
   * `comment` filtered `visibleReplies` to genuine UGC. `userInteractionCount` used `visibleReplyCount`, the
   * caller's UNFILTERED total. Two different populations answering one question, so a genuine entry carrying
   * fixture replies emitted zero `Comment` nodes and a positive comment count — markup asserting that N people
   * replied while listing none of them. Google's discussion-forum guidance reads the counter as the number of
   * comments on the post; a count with no comments behind it is the clearest form of the inflated-engagement
   * claim the structured-data policies prohibit.
   *
   * It also could not be fixed by correcting the count expression alone: as long as the two are derived
   * separately they can drift again on the next edit. So there is now ONE list, and every claim about replies —
   * the nodes, the counter, and anything added later — is derived from it.
   *
   * ══ WHY `visibleReplyCount` IS NO LONGER READ ══
   *
   * It is the page's total across pagination, which is the right number for the VISIBLE heading and the wrong
   * one for schema: §17 admits only visible replies, and a paginated-away reply is neither visible nor
   * crawlable from this URL. Deriving the count from `approved` means pagination, reordering or a filter can
   * change which replies are shown, and the count follows the nodes automatically rather than describing a set
   * the page did not render. The parameter is retained in the signature for the caller's own use and is
   * deliberately unread here.
   *
   * ══ WHEN THERE ARE NONE ══
   *
   * The whole `interactionStatistic` property is OMITTED rather than emitted as zero. 08D Template K lists the
   * property but does not require it, and "0 comments" is a claim about a genuine thread that may simply not
   * have been read yet — silence is the honest answer, and an absent property is not a statement.
   */
  const approved = visibleReplies.filter((r) => isGenuineUgc(r.provenance));

  /* Genuine UGC — Template K in full, with the object authors Google's forum guidance expects. */
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DiscussionForumPosting",
        "@id": `${url}#posting`,
        url,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        headline: entry.title,
        text: postText(entry.body),
        author: ugcAuthorNode(entry.username),
        datePublished: entry.createdAtIso,
        ...(entry.updatedAtIso ? { dateModified: entry.updatedAtIso } : {}),
        about: [
          ...(entry.gameId ? [entry.gameId] : []),
          ...(entry.stateCode ? [entry.stateCode.toUpperCase()] : []),
          ...entry.tags,
        ],
        ...(entry.newsArticleSlug
          ? { mentions: [canonicalUrl(`/news/${entry.newsArticleSlug}`)] }
          : {}),
        /* ONE list, declared above, drives both the comments and the count. See the note at `approved`. */
        comment: approved.map((r) => ({
          "@type": "Comment",
          "@id": `${url}#${r.id}`,
          text: postText(r.body),
          author: ugcAuthorNode(r.username),
          datePublished: r.postedAtIso,
        })),
        ...(approved.length > 0
          ? {
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/CommentAction",
                  userInteractionCount: approved.length,
                },
              ],
            }
          : {}),
        isPartOf: { "@id": `${canonicalUrl(COMMUNITY_HOME_PATH)}#webpage` },
        publisher: organizationRef(),
      },
      ...pageNodes,
    ],
  };
}

/* ------------------------------------------------------------------ member (08D Template L, withheld) */

/**
 * The member page graph. NO ProfilePage, NO Person — see the header. WebPage + BreadcrumbList only, until a
 * real member record exists to be a Person about.
 */
export function memberPageSchema(profile: MemberPublicProfile) {
  const url = canonicalUrl(memberPath(profile.username));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `@${profile.username}`,
        isPartOf: websiteRef(),
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PRODUCTION_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Community", item: canonicalUrl(COMMUNITY_HOME_PATH) },
          { "@type": "ListItem", position: 3, name: `@${profile.username}`, item: url },
        ],
      },
    ],
  };
}
