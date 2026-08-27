/*
 * ROUTE METADATA FOR THE COMMUNITY FAMILY — 08A §20 (hub, verbatim), 08B §18–§19 (entry canonical and title
 * patterns), 08C §7 (profile indexability).
 *
 * ══ AVAILABLE IS NOT INDEXABLE — AND HERE IT IS ALSO AN AMENDMENT CONDITION ══
 *
 * Every route is `robots: { index: false, follow: false }` per `PUBLICATION_SAFETY` (`FD-GATE-01`), and for
 * this family the noindex is ALSO Conflict 41 FOUNDER AMENDMENT condition 3: the review-fixture corpus must
 * never be indexable or sitemapped. The BFF's `assertCorpusNotPublishable` is keyed to this posture — flip it
 * without retiring the corpus and the data layer throws.
 *
 * 08B §16's own launch-time indexability ladder (INDEX_PENDING → INDEX_ELIGIBLE → INDEXED) is carried on
 * every record and rendered as a state; it takes effect at launch. Pre-launch, `noindex` wins for everything.
 *
 * CANONICAL DISCIPLINE (08B §18): one canonical per entry — `/community/{slug}` — and sort/filter/page
 * variants all carry that same canonical. They are noindex regardless, but the canonical must not vary with a
 * query string even after launch, so it is computed from the slug alone here.
 */

import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import type { ForumEntryRecord, MemberPublicProfile } from "./communityContract";
import {
  COMMUNITY_HOME_DESCRIPTION, COMMUNITY_HOME_PATH, COMMUNITY_HOME_TITLE,
  communityEntryPath, forumEntryDescription, forumEntryTitle, memberPath,
} from "./communityContract";

const NOINDEX = { index: false, follow: false } as const;

/** 08A §20 — title and description VERBATIM. */
export function communityHomeMetadata(): Metadata {
  const canonical = canonicalUrl(COMMUNITY_HOME_PATH);
  return {
    title: { absolute: COMMUNITY_HOME_TITLE },
    description: COMMUNITY_HOME_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: COMMUNITY_HOME_TITLE,
      description: COMMUNITY_HOME_DESCRIPTION,
    },
    twitter: { card: "summary", title: COMMUNITY_HOME_TITLE, description: COMMUNITY_HOME_DESCRIPTION },
    robots: NOINDEX,
  };
}

/** What the entry's description names as its topic — game/state/topic per the 08B §19 pattern. */
export function entryTopic(entry: ForumEntryRecord): string {
  if (entry.gameId && entry.stateCode) return `${entry.stateCode.toUpperCase()} ${entry.gameId.replace(/-/g, " ")}`;
  if (entry.gameId) return entry.gameId.replace(/-/g, " ");
  if (entry.stateCode) return `the ${entry.stateCode.toUpperCase()} lottery`;
  return entry.tags[0]?.replace(/-/g, " ") ?? "the lottery";
}

/** 08B §19 — `<Forum Entry Title> | LotteryCorner Community`, canonical from the slug alone. */
export function forumEntryMetadata(entry: ForumEntryRecord): Metadata {
  const title = forumEntryTitle(entry.title);
  const description = forumEntryDescription(entryTopic(entry));
  const canonical = canonicalUrl(communityEntryPath(entry.slug));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "LotteryCorner",
      title,
      description,
      publishedTime: entry.createdAtIso,
      ...(entry.updatedAtIso ? { modifiedTime: entry.updatedAtIso } : {}),
    },
    twitter: { card: "summary", title, description },
    robots: NOINDEX,
  };
}

/**
 * A `/community/{slug}` outside the corpus — the client-resolved reviewer-post segment. No canonical is
 * emitted for a page whose content the server cannot see; noindex always.
 */
export function reviewerEntryMetadata(): Metadata {
  return {
    title: { absolute: "Community discussion | LotteryCorner Community" },
    description: "A LotteryCorner community discussion.",
    robots: NOINDEX,
  };
}

/** 08C — the member profile. Pre-launch every profile is noindex; empty profiles stay noindex at launch too. */
export function memberProfileMetadata(profile: MemberPublicProfile): Metadata {
  const name = profile.displayName ?? profile.username;
  const title = `@${profile.username} | LotteryCorner Community`;
  const description = `${name} on the LotteryCorner community — public entries, replies and interests.`;
  const canonical = canonicalUrl(memberPath(profile.username));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: "profile", url: canonical, siteName: "LotteryCorner", title, description },
    twitter: { card: "summary", title, description },
    robots: NOINDEX,
  };
}
