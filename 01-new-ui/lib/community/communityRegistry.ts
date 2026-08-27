/*
 * THE COMMUNITY ROUTE REGISTRY — the "community" page family's half of `FD-GATE-01` registry-only gating.
 *
 * Authority: `FD-GATE-01` (registry-only gating; no environment reads), `CLAUDE.md` §10 (routes come from an
 * explicit registry, and `/community`, `/community/{forum-entry-slug}`, `/members/{username}` are on the
 * MUST-be-preserved approved page-family route list), 08 §33 decisions 2 and 17 (one `/community/{slug}`
 * route; `ProfilePage` at `/members/{username}`).
 *
 * ══ ROUTES COME FROM HERE, NOT FROM THE PAYLOAD ══
 *
 * The review corpus in `bff/review/community-review.json` is DATA; this file is the ROUTE AUTHORITY. An entry
 * slug is served only when it is enumerated below AND the payload carries a matching record — the news
 * family's intersection discipline. Adding a topic is two visible edits: the record, and the registry row.
 *
 * ══ THE ONE DOCUMENTED EXCEPTION: REVIEWER-AUTHORED POSTS ══
 *
 * A post the signed-in reviewer publishes through the CH-01 composer lives in the browser-side review store
 * (Conflict 37 — the stand-in for "assume the database exists"). By construction no server registry can
 * enumerate content that exists only in one reviewer's browser, so `/community/{slug}` for a slug outside the
 * corpus serves a CLIENT-RESOLVED page: the server HTML is an honest "no such discussion is published"
 * fallback, and the reviewer's own machine hydrates their post into it. That is recorded here as the designed
 * behaviour of the dynamic segment — a real backend replaces it with ordinary server reads, and the registry
 * question ("does this build serve /community/{slug}?") keeps its server answer: only for the corpus slugs.
 *
 * ══ THE FORBIDDEN ROUTE, RECORDED ══
 *
 * There is NO `/community/new`. The composer is a SECTION of the Community Home (08A §3), not a page, and the
 * task authorizing this family forbids inventing the route. Nothing here may ever enumerate it.
 */

import { getCommunityData } from "./bff/communityBff";
import { COMMUNITY_HOME_PATH, communityEntryPath, memberPath } from "./communityContract";

export interface CommunityRegistryEntry {
  route: string;
  enabled: boolean;
  /** Which approved document the served composition conforms to. */
  blueprint: "08A" | "08B" | "08C";
  note: string;
}

/** The one fixed route. */
const FIXED: readonly CommunityRegistryEntry[] = Object.freeze([
  {
    route: COMMUNITY_HOME_PATH,
    enabled: true,
    blueprint: "08A",
    note:
      "The Community Home, CH-01..CH-15 with AD-CH00/AD-CH01 in the 08A §2 order, over the Conflict 41 "
      + "review-fixture corpus. noindex always; never in a sitemap (PUBLICATION_SAFETY). Filters are query "
      + "parameters on this one URL — 08A §18: no indexable URL explosion.",
  },
]);

/**
 * The enumerated forum-entry slugs — the ten founder-authorized review topics. Each row is a review decision:
 * the payload carrying a record does NOT create the route (`CLAUDE.md` §10), and a row without a record
 * serves nothing.
 */
const ENTRY_SLUGS: readonly string[] = Object.freeze([
  "florida-pick-3-august-2026",
  "pick-4-pairs-summer-tracking",
  "powerball-roll-streak-stories",
  "cash-3-sum-range-filter-system",
  "dreamed-about-fish-again-231",
  "first-decent-box-hit-story",
  "scratch-off-talk-august",
  "moving-to-florida-pick-3-scene",
  "poll-cash-or-annuity",
  "introduce-yourself-august-2026",
]);

/** The enumerated member usernames — the five founder-authorized personas. */
const MEMBER_USERNAMES: readonly string[] = Object.freeze([
  "sunshinepicks",
  "peachstatepat",
  "moondreamer59",
  "wheelhousebill",
  "jackpotchaser22",
]);

/** Is this entry slug registered AND backed by a payload record? Both, or it is not a server-served page. */
export function isCommunityEntryServed(slug: string): boolean {
  if (!ENTRY_SLUGS.includes(slug)) return false;
  return getCommunityData().entries.some((e) => e.slug === slug);
}

/** Is this member username registered AND backed by a payload record? */
export function isCommunityMemberServed(username: string): boolean {
  if (!MEMBER_USERNAMES.includes(username)) return false;
  return getCommunityData().members.some((m) => m.username === username);
}

/** Does this build serve this community-family route? The `servesPage("community", …)` delegate. */
export function isCommunityRouteServed(route: string): boolean {
  const fixed = FIXED.find((e) => e.route === route);
  if (fixed) return fixed.enabled;
  const entry = route.match(/^\/community\/([a-z0-9-]+)$/);
  if (entry) return isCommunityEntryServed(entry[1]);
  const member = route.match(/^\/members\/([a-z0-9-]+)$/);
  if (member) return isCommunityMemberServed(member[1]);
  return false;
}

/** Every community-family route this build serves, for the FD-GATE-01 route inventory. */
export function communityRoutePaths(): { route: string; blueprint: "08A" | "08B" | "08C" }[] {
  const rows: { route: string; blueprint: "08A" | "08B" | "08C" }[] = [];
  for (const e of FIXED) {
    if (e.enabled) rows.push({ route: e.route, blueprint: e.blueprint });
  }
  for (const slug of ENTRY_SLUGS) {
    if (isCommunityEntryServed(slug)) rows.push({ route: communityEntryPath(slug), blueprint: "08B" });
  }
  for (const username of MEMBER_USERNAMES) {
    if (isCommunityMemberServed(username)) rows.push({ route: memberPath(username), blueprint: "08C" });
  }
  return rows;
}
