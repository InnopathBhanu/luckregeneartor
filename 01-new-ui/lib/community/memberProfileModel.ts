/*
 * THE MEMBER PROFILE VIEW MODEL — 08C, `/members/{username}`.
 *
 * ══ THE 08C GUARANTEES, AND HOW EACH IS HELD ══
 *
 *   §3 never-public list — held BY TYPE: `MemberPublicProfile` has no field that could carry an email, phone,
 *       address, private number set, ticket, payment, moderation-evidence or security value. The projection
 *       cannot leak what the shape cannot hold.
 *   §4 public labels — only where honestly derivable. A fixture member has EARNED nothing, so the amendment
 *       pins `contributionLabels` empty and this model adds none. What IS honestly derivable from the visible
 *       corpus is listed, not scored: entries started, threads replied in, replies the OP accepted or members
 *       marked helpful.
 *   §5 reputation — internal only. NO visible points score exists anywhere in this model, and no count is
 *       presented as reputation: the helpful list is a list of links, not a number.
 *   §7 indexability — every profile is noindex pre-launch (`PUBLICATION_SAFETY` + amendment condition 3), and
 *       the record's own state is carried for the launch ladder. Empty profiles remain noindex at launch.
 *   §9 deletion — the `deleted` status renders the neutral state with private data absent and public thread
 *       continuity preserved; the contract carries it even though no fixture is deleted.
 *   §10 — report and block affordances render; there is NO private messaging surface at launch.
 */

import { getCommunityData, getCommunityMember } from "./bff/communityBff";
import type { MemberPublicProfile } from "./communityContract";

export interface MemberProfileModel {
  profile: MemberPublicProfile;
  /** Amendment condition 1 — the page-level review disclosure banner. */
  disclosure: string | null;
}

/**
 * Project one member record plus the visible corpus into the PUBLIC profile shape. Everything here is
 * derivable from pages a reader can already see — nothing private exists to project.
 */
export function buildMemberProfileModel(username: string): MemberProfileModel | null {
  const member = getCommunityMember(username);
  if (!member) return null;
  const data = getCommunityData();

  const entries = data.entries
    .filter((e) => e.username === username)
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
    .map((e) => ({ slug: e.slug, title: e.title, createdAtIso: e.createdAtIso }));

  const repliedIn = data.entries
    .filter((e) => e.username !== username && e.replies.some((r) => r.username === username))
    .map((e) => ({ slug: e.slug, title: e.title }));

  const helpfulReplies = data.entries.flatMap((e) =>
    e.replies
      .filter((r) => r.username === username && (r.helpful || r.id === e.acceptedReplyId))
      .map((r) => ({
        slug: e.slug,
        title: e.title,
        kind: (r.id === e.acceptedReplyId ? "accepted" : "helpful") as "accepted" | "helpful",
      })),
  );

  const profile: MemberPublicProfile = {
    username: member.username,
    displayName: member.displayName,
    joinedIso: member.joinedIso,
    homeState: member.homeState,
    bio: member.bio,
    interests: member.interests,
    status: member.status,
    entries,
    repliedIn,
    helpfulReplies,
  };

  return { profile, disclosure: data.meta.disclosure };
}
