/*
 * THE COMMUNITY BFF ENTRY POINT — Community page family (08/08A/08B/08C/08D), on the flagship BFF pattern.
 *
 * ══ ONE FUNCTION, ONE SEAM ══
 *
 * `getCommunityData()` is the only way the Community pages reach data. Today it resolves to the committed
 * review corpus; when a real community backend exists, `COMMUNITY_DATA_MODE` gains its `"api"` implementation
 * and nothing else in the tree changes. Components never import the JSON — `tests/community-pages.test.ts`
 * sweeps `components/` and `app/` for imports from `bff/review`, exactly as the news and flagship tests do.
 *
 * ══ WHAT KEEPS THE REVIEW CORPUS HONEST — the Conflict 41 FOUNDER AMENDMENT, all five conditions ══
 *
 * The Constitution forbids fabricating community content, twice. The founder amendment of 2026-08-11
 * (`source-conflicts.md` Conflict 41) authorizes five member personas and ten topics as design fixtures for the
 * REVIEW BUILD ONLY, under five conditions. This module enforces the machine-checkable ones on EVERY read:
 *
 *   1. BANNER   — `meta.disclosure` is required; a review payload without the reader-facing banner sentence is
 *                 rejected, so no community page can render fixture content without disclosing it.
 *   2. PROVENANCE + PRODUCTION REFUSAL — every member, entry, reply and research reply must carry
 *                 `provenance: "synthetic-review-fixture"`, and `assertCorpusNotPublishable` REFUSES to serve
 *                 the corpus in a publishable build (see below).
 *   3. NOINDEX  — enforced by `communityRouteMetadata.ts` + `PUBLICATION_SAFETY`; the refusal in this module is
 *                 keyed to exactly that posture, so flipping it without retiring the corpus throws.
 *   4. NO PERSON JSON-LD / NO EARNED BADGES / NO REAL-PRESENTED STATS — `contributionLabels` must be empty on
 *                 every member (asserted here); the schema module emits fixture authors as plain text names,
 *                 never `Person` entities; no member count or reputation number exists anywhere in the payload.
 *   5. EXPIRY   — `meta.expiry` is required and travels in the payload, so the corpus carries its own sunset.
 *
 * ══ WHAT "REFUSES A PRODUCTION BUILD" MEANS, PRECISELY ══
 *
 * `FD-GATE-01` forbids environment-driven page behaviour, so the refusal is not an env check — it is keyed to
 * the repository's own publication posture. In this codebase "a production build" of a page family means the
 * family is indexable or sitemap-included (`PUBLICATION_SAFETY` is the single constant that records both).
 * On every read the corpus asserts that posture is still closed for it: the day a launch edit makes community
 * pages publishable, this data layer throws instead of serving fixtures — which is amendment condition 2's
 * "MUST NOT ship ungated", stated as code. Retiring the corpus (real human content or designed empty states)
 * is the only way to launch.
 */

import type { CommunityMemberRecord, ForumEntryRecord } from "../communityContract";
import { REPLY_LABELS, REVIEW_FIXTURE_PROVENANCE } from "../communityContract";
import type { CommunityData } from "./communityBffContract";
import { PUBLICATION_SAFETY } from "@/lib/registry/pageFamilyRegistry";

/* `with { type: "json" }` is required by Node's ESM loader, which the test runner uses directly. */
import reviewPayload from "./review/community-review.json" with { type: "json" };

export type CommunityDataMode =
  /** The founder-authorized review corpus (Conflict 41 FOUNDER AMENDMENT). The current mode. */
  | "review"
  /** A real community backend. Not implemented — `02-new-api` is empty and untouched (`CLAUDE.md` §15). */
  | "api";

/**
 * Which adapter answers. A module constant rather than an environment variable, so the state of the build is
 * readable from the source (`FD-GATE-01`: no env-driven page behaviour).
 */
export const COMMUNITY_DATA_MODE: CommunityDataMode = "review";

/* ------------------------------------------------------------------ the production refusal */

/** The publication posture the corpus requires. Injectable so the test can prove the refusal actually throws. */
export interface PublicationPosture {
  robots: { readonly index: boolean; readonly follow: boolean };
  inSitemap: boolean;
}

/**
 * Amendment condition 2, second half: the data layer refuses to serve the corpus in a production build.
 *
 * Called on every read with the repository's real `PUBLICATION_SAFETY`. A build in which community pages are
 * indexable or sitemap-included is a launch build, and the fixture corpus MUST NOT ship in one.
 */
export function assertCorpusNotPublishable(posture: PublicationPosture): void {
  if (posture.robots.index || posture.inSitemap) {
    throw new Error(
      "communityBff: REFUSING to serve the review-fixture corpus — the community family's publication posture "
      + "is open (indexable or sitemap-included), which makes this a production build. The Conflict 41 FOUNDER "
      + "AMENDMENT (condition 5) requires real human content or designed empty states at launch; the fixture "
      + "corpus must never ship ungated. Retire the corpus before changing the robots posture.",
    );
  }
}

/* ------------------------------------------------------------------ the shape assertion */

/**
 * Validate the payload against the invariants that would produce a MISLEADING page rather than a broken one.
 * Runs on every read, so a hand-edited fixture cannot reach a reader through a warm module cache.
 */
export function assertCommunityPayloadShape(data: CommunityData): void {
  const fail = (why: string): never => {
    throw new Error(`communityBff: review payload is unusable — ${why}`);
  };

  if (data.meta.source !== "review" && data.meta.source !== "api") {
    fail(`meta.source is "${data.meta.source}"`);
  }
  if (data.meta.source === "review") {
    /* Condition 1 — the banner sentence travels in the payload. */
    if (!data.meta.disclosure) fail("review data carries no disclosure banner sentence (amendment condition 1)");
    /* Condition 5 — the expiry is recorded in the payload itself. */
    if (!data.meta.expiry) fail("review data records no expiry (amendment condition 5)");
    if (!/Conflict 41/.test(data.meta.authorizedBy)) {
      fail("review data does not name its authorization (Conflict 41 FOUNDER AMENDMENT)");
    }
  }
  if (data.members.length === 0) fail("it carries no members");
  if (data.entries.length === 0) fail("it carries no entries");

  const usernames = new Set(data.members.map((m) => m.username));
  for (const m of data.members) {
    if (m.provenance !== REVIEW_FIXTURE_PROVENANCE) {
      fail(`member "${m.username}" does not carry provenance "${REVIEW_FIXTURE_PROVENANCE}" (condition 2)`);
    }
    /* Condition 4 — a fixture member never carries a badge presented as earned. */
    if (m.contributionLabels.length !== 0) {
      fail(`member "${m.username}" carries contribution labels — fixture members never carry earned badges`);
    }
  }

  const slugs = new Set<string>();
  for (const e of data.entries) {
    if (slugs.has(e.slug)) fail(`entry slug "${e.slug}" is duplicated`);
    slugs.add(e.slug);
    if (e.provenance !== REVIEW_FIXTURE_PROVENANCE) {
      fail(`entry "${e.slug}" does not carry provenance "${REVIEW_FIXTURE_PROVENANCE}" (condition 2)`);
    }
    if (!usernames.has(e.username)) fail(`entry "${e.slug}" names unknown member "${e.username}"`);

    const replyIds = new Set<string>();
    for (const r of e.replies) {
      if (replyIds.has(r.id)) fail(`entry "${e.slug}" duplicates reply id "${r.id}"`);
      replyIds.add(r.id);
      if (r.provenance !== REVIEW_FIXTURE_PROVENANCE) {
        fail(`reply "${r.id}" in "${e.slug}" does not carry provenance (condition 2)`);
      }
      if (!usernames.has(r.username)) fail(`reply "${r.id}" in "${e.slug}" names unknown member "${r.username}"`);
    }

    if (e.researchReply) {
      if (e.researchReply.provenance !== REVIEW_FIXTURE_PROVENANCE) {
        fail(`research reply in "${e.slug}" does not carry provenance (condition 2)`);
      }
      /* Constitution §32 — one non-human identity, and it is this one. */
      if (e.researchReply.label !== REPLY_LABELS.research) {
        fail(`research reply in "${e.slug}" is labelled "${e.researchReply.label}", not "${REPLY_LABELS.research}"`);
      }
    }

    if (e.acceptedReplyId !== null) {
      /* FE-08: only the ORIGINAL POSTER accepts, and AI/Research can never accept itself — the accepted id
         must be a MEMBER reply, so a research reply id here is structurally rejected. */
      if (!replyIds.has(e.acceptedReplyId)) {
        fail(`entry "${e.slug}" accepts "${e.acceptedReplyId}", which is not one of its member replies — `
          + "an AI/Research reply can never be accepted by itself (08 §8)");
      }
      if (e.acceptedBy !== e.username) {
        fail(`entry "${e.slug}" was accepted by "${e.acceptedBy}" — only the original poster may accept (08B §10)`);
      }
    }
  }
}

/* ------------------------------------------------------------------ reads */

/**
 * Everything the Community pages need, in one read. Synchronous for the same reason the flagship and news
 * seams are: making it `async` now would suggest the real endpoint's shape has been decided (`CLAUDE.md` §15).
 */
export function getCommunityData(): CommunityData {
  switch (COMMUNITY_DATA_MODE) {
    case "review": {
      /* The refusal runs BEFORE the payload is even parsed into shape — a publishable build gets no corpus. */
      assertCorpusNotPublishable(PUBLICATION_SAFETY);
      const { _meta_note: _ignored, ...payload } =
        reviewPayload as unknown as CommunityData & { _meta_note?: string };
      const data = payload as CommunityData;
      assertCommunityPayloadShape(data);
      return data;
    }
    case "api":
      /* Unreachable until an API task is authorised. Left as an explicit branch so the seam is visible. */
      throw new Error(
        "getCommunityData: the API adapter does not exist. `02-new-api` is untouched until a dedicated API "
          + "task is approved (CLAUDE.md §15). See FUTURE_COMMUNITY_API in communityBffContract.ts.",
      );
  }
}

/** One entry by slug, or `null`. The route decides whether `null` is a 404 — the registry gates first. */
export function getForumEntry(slug: string): ForumEntryRecord | null {
  return getCommunityData().entries.find((e) => e.slug === slug) ?? null;
}

/** One entry by its forumEntryId — the 08D Template M seam a News Article's discussion reference resolves. */
export function getForumEntryById(forumEntryId: string): ForumEntryRecord | null {
  return getCommunityData().entries.find((e) => e.forumEntryId === forumEntryId) ?? null;
}

/** One member by username, or `null`. */
export function getCommunityMember(username: string): CommunityMemberRecord | null {
  return getCommunityData().members.find((m) => m.username === username) ?? null;
}
