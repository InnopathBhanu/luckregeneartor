/*
 * THE COMMUNITY BACKEND-FOR-FRONTEND CONTRACT — Community family (08/08A/08B/08C/08D).
 *
 * Replicates the flagship BFF pattern (`lib/flagship/bff/flagshipBffContract.ts`, `lib/news/bff/`): one typed
 * description of everything the Community pages need from a backend, one envelope that declares its own source,
 * and one place the future API's questions are recorded without being answered (`CLAUDE.md` §15 — no API design
 * during a UI task).
 *
 * ══ EVERY RESPONSE DECLARES ITS SOURCE, ITS DISCLOSURE AND ITS EXPIRY ══
 *
 * `meta.source` is required. `"review"` means the founder-authorized fixture corpus of Conflict 41's FOUNDER
 * AMENDMENT: five member personas and ten topics written by the team as design fixtures. The reader-facing
 * disclosure banner travels IN the payload (amendment condition 1), and the amendment's expiry is RECORDED in
 * the payload itself (condition 5) so the corpus carries its own sunset wherever it goes.
 */

import type { CommunityMemberRecord, ForumEntryRecord } from "../communityContract";

export type CommunityBffSource =
  /** The founder-authorized review corpus (Conflict 41 FOUNDER AMENDMENT, 2026-08-11). */
  | "review"
  /** A real community backend. Does not exist; the adapter branch throws (`CLAUDE.md` §15). */
  | "api";

export interface CommunityBffMeta {
  source: CommunityBffSource;
  /** Amendment condition 1 — the page-level review disclosure banner, rendered on EVERY community page. */
  disclosure: string | null;
  /** Amendment condition 5 — the recorded expiry of the fixture authorization. */
  expiry: string;
  /** Which decision record authorizes this corpus. */
  authorizedBy: string;
  /** The date the payload treats as "today". Never the wall clock. */
  asOfIso: string;
}

export interface CommunityData {
  meta: CommunityBffMeta;
  members: readonly CommunityMemberRecord[];
  /** Newest first by `createdAtIso`. */
  entries: readonly ForumEntryRecord[];
}

/**
 * The open questions the real community backend must answer — recorded, not designed (`CLAUDE.md` §15).
 * `grep FUTURE_COMMUNITY_API` finds all of it when the API task is authorised.
 */
export const FUTURE_COMMUNITY_API = Object.freeze({
  endpointShape:
    "One home read (section groupings + activity), one entry read by slug (root + attachment + replies, " +
    "paginated per 08 §26), one profile read by username. Activity signals (reply velocity, unique " +
    "contributors, moderation quality — 08A §4) are backend aggregates over real behaviour, never seeded.",
  identity:
    "Usernames with optional real names (08 §19). The private half of a member record (email, phone, tickets, " +
    "payments, moderation evidence — 08C §3) lives on the server side of this seam and NEVER enters the " +
    "public contract; MemberPublicProfile is the entire public surface.",
  lifecycle:
    "Recurring entries (08 §15): SCHEDULED..MERGED, created only where demonstrated activity exists, results " +
    "attached at period end, empty future threads never indexed.",
  indexability:
    "08 §13 / 08D Template O: INDEX_PENDING default, eligibility checks, thin/duplicate/private/moderated " +
    "noindex. Only index-eligible public entries enter community-entries-sitemap.xml (08 §27).",
  moderation:
    "Every action carries reason + policy + appeal route (08 §22). The typed report seam in " +
    "communityModeration.ts is what the admin phase consumes; the API owns the queue and the audit trail.",
  ai:
    "Constitution §31 tiers govern when LotteryCorner Research answers (Tier A quickly, B human-first, C " +
    "official-source-only under stricter review, D no routine response). The deterministic tier classifier in " +
    "communityAi.ts is the review stand-in; the real service adds grounded generation behind the same tiers.",
  expiry:
    "Conflict 41 FOUNDER AMENDMENT condition 5: at community launch the fixture corpus is retired — real human " +
    "content or designed empty states only. The production-build refusal in communityBff.ts enforces it until then.",
});
