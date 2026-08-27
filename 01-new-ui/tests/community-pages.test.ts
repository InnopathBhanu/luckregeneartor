/*
 * THE COMMUNITY PAGE FAMILY — 08/08A/08B/08C/08D conformance, under the Conflict 41 FOUNDER AMENDMENT.
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. THE AMENDMENT'S FIVE CONDITIONS — the banner, provenance + production refusal, noindex/no-sitemap,
 *      no Person JSON-LD / no earned badges / no simulated statistics, and the recorded expiry.
 *   2. A PREDICTION CLAIM in the corpus — hot/cold/overdue/guarantee language presented as fact.
 *   3. THE COMPOSITION drifting from the frozen orders — 08A §2's seventeen rows, 08B §2's fourteen.
 *   4. THE §31 TIER POLICY breaking — Tier C answered with prose, Tier D answered at all.
 *   5. Sign-in gating the wrong moment, infinite scroll, a visible reputation score, or a `/community/new`.
 */

import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";

import {
  CH10_BELIEF_LABEL, COMMUNITY_FILTERS, COMMUNITY_H1, COMMUNITY_HOME_DESCRIPTION, COMMUNITY_HOME_ORDER,
  COMMUNITY_HOME_SECTION_NAMES, COMMUNITY_HOME_TITLE, COMMUNITY_SUPPORT, COMPOSER_HELPERS, COMPOSER_PROMPT,
  FORUM_ENTRY_ORDER, FORUM_ENTRY_SECTION_NAMES, GENUINE_UGC_PROVENANCE, NEEDS_EXPERIENCE_LABELS,
  REPLIES_PER_PAGE, REPLY_LABELS,
  REPLY_PLACEHOLDER, REPORT_CATEGORIES, REVIEW_FIXTURE_PROVENANCE, forumEntryTitle,
} from "../lib/community/communityContract";
import {
  COMMUNITY_DATA_MODE, assertCommunityPayloadShape, assertCorpusNotPublishable, getCommunityData,
  getCommunityMember, getForumEntry, getForumEntryById,
} from "../lib/community/bff/communityBff";
import type { CommunityData } from "../lib/community/bff/communityBffContract";
import { isCommunityRouteServed, communityRoutePaths } from "../lib/community/communityRegistry";
import { buildCommunityHomeModel } from "../lib/community/communityHomeModel";
import { buildForumEntryModel, SUMMARY_MIN_REPLIES, buildSummary } from "../lib/community/forumEntryModel";
import { buildMemberProfileModel } from "../lib/community/memberProfileModel";
import { NO_APPROVED_COMMUNITY_PROFILE, communityAdProfile } from "../lib/community/communityAdProfile";
import { communityHomeSchema, forumEntrySchema, memberPageSchema, postText } from "../lib/community/communitySchema";
import {
  communityHomeMetadata, forumEntryMetadata, memberProfileMetadata, reviewerEntryMetadata,
} from "../lib/community/communityRouteMetadata";
import { aiResponsePlanFor, classifyForumTier, TIER_D_SUPPORT } from "../lib/community/communityAi";
import {
  MODERATION_POLICY, clearModerationQueueForTests, readModerationQueue, submitCommunityReport,
} from "../lib/community/communityModeration";
import {
  acceptReviewerReply, addFixtureReply, addReviewerReply, clearDraft, clearReviewerStoreForTests,
  fixtureRepliesFor, getReviewerEntry, listReviewerEntries, publishReviewerEntry, readDraft, saveDraft,
  toPostBlocks,
} from "../lib/community/communityReviewerStore";
import { communityTaggedContentSource } from "../lib/community/communityTaggedContentSource";
import { taggedFeed } from "../lib/flagship/flagshipTaggedContent";
import { containsPredictionClaim } from "../lib/flagship/flagshipAi";
import { PAGE_FAMILIES, PUBLICATION_SAFETY, routeInventory, servesPage, servedRoutes } from "../lib/registry/pageFamilyRegistry";
import { FOOTER_GROUPS, SUPPRESSED_ENTRIES } from "../lib/layout/globalFooterConfig";
import { sectionIntelligence } from "../lib/ai/sectionIntelligence";
import { CLASS_PREFIX } from "../lib/shell/sectionContract";
import { buildNewsArticleModel } from "../lib/news/newsArticleModel";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped, so a comment QUOTING a rule is not mistaken for a violation. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Every file under a directory, recursively. */
function filesUnder(dir: string): string[] {
  const out: string[] = [];
  const abs = new URL(`../${dir}`, import.meta.url).pathname;
  for (const name of readdirSync(abs)) {
    const rel = `${dir}/${name}`;
    if (statSync(`${abs}/${name}`).isDirectory()) out.push(...filesUnder(rel));
    else out.push(rel);
  }
  return out;
}

/** Every string value anywhere in a JSON payload. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) allStrings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) allStrings(v, out);
  return out;
}

const clone = (d: CommunityData): CommunityData => structuredClone(d) as CommunityData;

/* ══════════════════════════════════════════════════════════════════ 08A §2: the home order */

describe("08A §2: the Community Home order is the blueprint's, verbatim", () => {
  test("the seventeen rows, ids and names, in the REQUIRED order", () => {
    /* Transcribed independently from 08A §2's table — the test's own copy. */
    assert.deepEqual([...COMMUNITY_HOME_ORDER], [
      "CH-01", "CH-02", "CH-03", "CH-04", "CH-05", "CH-06", "CH-07", "AD-CH00",
      "CH-08", "CH-09", "CH-10", "CH-11", "CH-12", "CH-13", "CH-14", "CH-15", "AD-CH01",
    ]);
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-01"], "Community Identity and Ask or Share");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-02"], "Active Now");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-03"], "Questions and Entries Needing Player Experience");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-04"], "Pick 3 and Pick 4");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-05"], "Jackpot Games");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-06"], "State Communities");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-07"], "Systems, Tools and Mathematics");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-08"], "Wins and Ticket Stories");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-09"], "Scratch-Offs");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-10"], "Dreams, Signs and Lucky Numbers");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-11"], "News Discussions");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-12"], "Most Helpful");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-13"], "Following");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-14"], "Community Events and Polls");
    assert.equal(COMMUNITY_HOME_SECTION_NAMES["CH-15"], "New Members and Guidelines");
  });

  test("the model renders exactly that order, and the page emits it as one attribute", () => {
    const model = buildCommunityHomeModel();
    assert.deepEqual(model.sections.map((s) => s.id), [...COMMUNITY_HOME_ORDER]);
    const c = src("components/community/CommunityHomePage.tsx");
    assert.match(c, /data-section-order=\{model\.sections\.map\(\(x\) => x\.id\)\.join\(","\)\}/);
    /* AD anchors hold their positions as markers, not slots. */
    assert.match(c, /CommunityAdAnchor id="AD-CH00"/);
    assert.match(c, /CommunityAdAnchor id="AD-CH01"/);
  });

  test("08A §3 identity strings, verbatim: H1, support, composer prompt, the seven helpers", () => {
    assert.equal(COMMUNITY_H1, "Lottery Community");
    assert.equal(COMMUNITY_SUPPORT,
      "Ask questions, share numbers, discuss systems, celebrate wins and connect with U.S. lottery players.");
    assert.equal(COMPOSER_PROMPT, "What do you want to ask or share?");
    assert.deepEqual([...COMPOSER_HELPERS], [
      "Ask a Question", "Share Numbers", "Share a Win", "Start a Discussion",
      "Explain a System", "Add a Photo", "Create a Poll",
    ]);
    const model = buildCommunityHomeModel();
    assert.equal(model.h1, COMMUNITY_H1);
    assert.equal(model.composerPrompt, COMPOSER_PROMPT);
  });

  test("08A §5 CH-03 labels and §12 CH-10 label, verbatim", () => {
    assert.equal(NEEDS_EXPERIENCE_LABELS.noReplies, "No replies yet");
    assert.equal(NEEDS_EXPERIENCE_LABELS.aiAnswered, "LotteryCorner AI answered — player experience wanted");
    assert.equal(NEEDS_EXPERIENCE_LABELS.needsStateInput, "Needs state-player input");
    assert.equal(CH10_BELIEF_LABEL, "Community beliefs and personal interpretations");
    /* The no-replies question carries the label; the dreams section carries the belief label. */
    const model = buildCommunityHomeModel();
    const open = model.needsExperience.find((c) => c.slug === "moving-to-florida-pick-3-scene");
    assert.ok(open, "the designed no-replies question reaches CH-03");
    assert.ok(open!.needsLabels.includes("No replies yet"));
    assert.equal(model.dreamsLabel, CH10_BELIEF_LABEL);
    assert.ok(model.dreams.length > 0);
  });

  test("08A §18: filters exist, apply server-side on ONE url, and mint no route", () => {
    assert.deepEqual([...COMMUNITY_FILTERS],
      ["Latest", "Active", "Following", "Needs Replies", "Most Helpful", "State", "Game", "Tag"]);
    const needs = buildCommunityHomeModel({ filter: "needs-replies" });
    assert.ok(needs.browse.every((c) => c.replyCount === 0));
    const active = buildCommunityHomeModel({ filter: "active" });
    assert.ok(active.browse.every((c) => c.replyCount > 0));
    const fl = buildCommunityHomeModel({ state: "fl" });
    assert.equal(fl.selectedState, "fl");
    assert.ok(fl.stateEntries.every((c) => c.stateCode === "fl"));
    /* No filter value is a route: the inventory carries no query-shaped path. */
    const communityRoutes = servedRoutes().filter((r) => r.startsWith("/community"));
    assert.ok(!communityRoutes.some((r) => r.includes("?") || r.includes("=")));
    /* And CH-06 never forces a state. */
    assert.equal(buildCommunityHomeModel().selectedState, null);
    assert.match(src("components/community/CommunityHomePage.tsx"), /data-no-ip-state="true"/);
  });

  test("08A §20 metadata, verbatim, canonical /community, noindex", () => {
    assert.equal(COMMUNITY_HOME_TITLE,
      "Lottery Community: Questions, Numbers, Systems & Player Stories | LotteryCorner");
    assert.equal(COMMUNITY_HOME_DESCRIPTION,
      "Join U.S. lottery players discussing Pick 3, Pick 4, Powerball, Mega Millions, systems, winning tickets, "
      + "state games and lottery news.");
    const meta = communityHomeMetadata();
    assert.deepEqual(meta.title, { absolute: COMMUNITY_HOME_TITLE });
    assert.equal(meta.description, COMMUNITY_HOME_DESCRIPTION);
    assert.match(String(meta.alternates?.canonical), /^https:\/\/www\.lotterycorner\.com\/community$/);
    assert.deepEqual(meta.robots, { index: false, follow: false });
  });
});

/* ══════════════════════════════════════════════════════════════════ 08B §2: the entry order */

describe("08B §2: the Forum Entry order is the blueprint's, verbatim", () => {
  test("the fourteen rows, ids and names, in the REQUIRED order", () => {
    assert.deepEqual([...FORUM_ENTRY_ORDER], [
      "FE-01", "FE-02", "FE-03", "FE-04", "FE-05", "FE-06", "FE-07",
      "FE-08", "FE-09", "FE-10", "FE-11", "FE-12", "FE-13", "AD-FE00",
    ]);
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-01"], "Breadcrumbs, Tags and Context");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-02"], "Title, Username and Dates");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-03"], "Root Post");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-04"], "Structured Attachment");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-05"], "Sources, Tool or Page Context");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-06"], "LotteryCorner AI or Research Reply");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-07"], "Replies");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-08"], "Helpful or Accepted Reply");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-09"], "Community Summary");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-10"], "Reply Composer");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-11"], "Related Forum Entries");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-12"], "Follow and Notifications");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["FE-13"], "Moderation, Corrections and Responsible Play");
    assert.equal(FORUM_ENTRY_SECTION_NAMES["AD-FE00"], "Controlled Reply Advertisement");
  });

  test("every corpus entry's model renders exactly that order; the page emits it", () => {
    for (const e of getCommunityData().entries) {
      const model = buildForumEntryModel(e.slug)!;
      assert.deepEqual(model.sections.map((s) => s.id), [...FORUM_ENTRY_ORDER], e.slug);
    }
    const c = src("components/community/ForumEntryPage.tsx");
    assert.match(c, /data-section-order=\{model\.sections\.map\(\(x\) => x\.id\)\.join\(","\)\}/);
    assert.match(c, /CommunityAdAnchor id="AD-FE00"/);
    /* The reviewer view emits the same order. */
    assert.match(src("components/community/ReviewerEntryView.tsx"),
      /data-section-order=\{FORUM_ENTRY_ORDER\.join\(","\)\}/);
  });

  test("08B §4 identity block and §8 FE-06 labels, verbatim", () => {
    const c = src("components/community/ForumEntryPage.tsx");
    assert.match(c, /Posted by /);
    assert.match(c, /data-identity-block="true"/);
    assert.equal(REPLY_LABELS.ai, "LotteryCorner AI");
    assert.equal(REPLY_LABELS.research, "LotteryCorner Research");
    assert.equal(REPLY_LABELS.moderator, "Moderator Clarification");
    assert.equal(REPLY_LABELS.reporter, "Reporter Clarification");
  });

  test("08B §12 the FE-10 placeholder, verbatim, with context-sensitive alternatives", () => {
    assert.equal(REPLY_PLACEHOLDER, "Add your answer or experience…");
    /* The question entry gets the question alternative; a plain discussion the default. */
    assert.equal(buildForumEntryModel("moving-to-florida-pick-3-scene")!.replyPlaceholder,
      "Answer the question…");
    assert.equal(buildForumEntryModel("introduce-yourself-august-2026")!.replyPlaceholder, REPLY_PLACEHOLDER);
  });

  test("08B §19 metadata pattern; canonical from the slug alone, so sort/page variants share it", () => {
    const entry = getForumEntry("florida-pick-3-august-2026")!;
    const meta = forumEntryMetadata(entry);
    assert.deepEqual(meta.title, { absolute: forumEntryTitle(entry.title) });
    assert.equal(String(meta.alternates?.canonical),
      "https://www.lotterycorner.com/community/florida-pick-3-august-2026");
    assert.deepEqual(meta.robots, { index: false, follow: false });
    /* The metadata function has no sort/page input AT THE TYPE LEVEL — a variant cannot vary the canonical. */
    assert.doesNotMatch(code("lib/community/communityRouteMetadata.ts"), /sort|page=/i);
  });
});

/* ══════════════════════════════════════════════════════ the five amendment conditions */

describe("Conflict 41 FOUNDER AMENDMENT: all five conditions are enforced", () => {
  test("condition 1: the disclosure banner travels in the payload and reaches every page", () => {
    const data = getCommunityData();
    assert.ok(data.meta.disclosure && data.meta.disclosure.length > 80);
    assert.match(data.meta.disclosure!, /not real players|design fixtures/i);
    /* The BFF refuses a review payload without it. */
    const bad = clone(data);
    (bad.meta as { disclosure: string | null }).disclosure = null;
    assert.throws(() => assertCommunityPayloadShape(bad), /disclosure/);
    /* Every model carries it, and every page component renders the shared banner. */
    assert.equal(buildCommunityHomeModel().disclosure, data.meta.disclosure);
    assert.equal(buildForumEntryModel("poll-cash-or-annuity")!.disclosure, data.meta.disclosure);
    assert.equal(buildMemberProfileModel("sunshinepicks")!.disclosure, data.meta.disclosure);
    for (const f of ["components/community/CommunityHomePage.tsx", "components/community/ForumEntryPage.tsx",
      "components/community/MemberProfilePage.tsx", "components/community/ReviewerEntryView.tsx"]) {
      assert.match(src(f), /CommunityDisclosureBanner/, `${f} renders the banner`);
    }
    assert.match(src("components/community/CommunityPieces.tsx"), /data-review-disclosure="true"/);
  });

  test("condition 2a: every record carries the provenance value, asserted on every read", () => {
    const data = getCommunityData();
    for (const m of data.members) assert.equal(m.provenance, REVIEW_FIXTURE_PROVENANCE, m.username);
    for (const e of data.entries) {
      assert.equal(e.provenance, REVIEW_FIXTURE_PROVENANCE, e.slug);
      for (const r of e.replies) assert.equal(r.provenance, REVIEW_FIXTURE_PROVENANCE, r.id);
      if (e.researchReply) assert.equal(e.researchReply.provenance, REVIEW_FIXTURE_PROVENANCE, e.slug);
    }
    /* Strip one and the read refuses. */
    const bad = clone(data);
    const withReplies = bad.entries.find((e) => e.replies.length > 0)!;
    (withReplies.replies[0] as { provenance: string }).provenance = "";
    assert.throws(() => assertCommunityPayloadShape(bad), /provenance/);
  });

  test("condition 2b: the data layer REFUSES a publishable (production) build", () => {
    /* The refusal is keyed to the publication posture: indexable or sitemapped means launch build. */
    assert.throws(() => assertCorpusNotPublishable({ robots: { index: true, follow: true }, inSitemap: false }),
      /REFUSING|must never ship/);
    assert.throws(() => assertCorpusNotPublishable({ robots: { index: false, follow: false }, inSitemap: true }),
      /REFUSING|must never ship/);
    /* Today's posture is closed, so the read serves. */
    assert.doesNotThrow(() => assertCorpusNotPublishable(PUBLICATION_SAFETY));
    /* And getCommunityData calls the refusal before parsing — the guard is on the read path, not beside it. */
    const body = code("lib/community/bff/communityBff.ts");
    assert.match(body, /assertCorpusNotPublishable\(PUBLICATION_SAFETY\)/);
  });

  test("condition 3: every community route is noindex and in no sitemap", () => {
    for (const meta of [
      communityHomeMetadata(),
      forumEntryMetadata(getForumEntry("florida-pick-3-august-2026")!),
      memberProfileMetadata(buildMemberProfileModel("wheelhousebill")!.profile),
      reviewerEntryMetadata(),
    ]) {
      assert.deepEqual(meta.robots, { index: false, follow: false });
    }
    assert.equal(PUBLICATION_SAFETY.robots.index, false);
    assert.equal(PUBLICATION_SAFETY.inSitemap, false);
    /* Structural: there is no app/sitemap.ts at all. */
    assert.throws(() => statSync(new URL("../app/sitemap.ts", import.meta.url).pathname));
  });

  /*
   * LRG-UX-SCHEMA-001 correction 2 STRENGTHENED this condition.
   *
   * It used to assert "no Person node, and the author is a plain string". The second half is gone, because the
   * author is gone: a fixture entry emits no `DiscussionForumPosting` at all now, so there is nothing to
   * attribute. Condition 4's requirement — no fixture member as a `Person` — is still asserted, and it is now
   * satisfied structurally rather than by choosing a weaker author form.
   */
  test("condition 4a: fixture members are NEVER Person entities, and never authors of anything", () => {
    const data = getCommunityData();
    for (const e of data.entries) {
      const model = buildForumEntryModel(e.slug)!;
      const json = JSON.stringify(forumEntrySchema(e, model.pageReplies, model.totalReplies));
      assert.ok(!json.includes('"Person"'), `${e.slug} schema must not contain a Person node`);
      assert.ok(!json.includes('"author"'), `${e.slug} must attribute nothing — it is a fixture`);
      assert.ok(!json.includes(e.username), `${e.slug} must not name a fixture member anywhere in schema`);
    }
    for (const m of data.members) {
      const json = JSON.stringify(memberPageSchema(buildMemberProfileModel(m.username)!.profile));
      assert.ok(!json.includes('"Person"'), `${m.username} profile must not contain a Person node`);
      assert.ok(!json.includes("ProfilePage"), `${m.username} withholds ProfilePage until a real person exists`);
    }
    assert.ok(!JSON.stringify(communityHomeSchema(buildCommunityHomeModel().visibleEntryCards)).includes('"Person"'));
    /* The recorded decision lives in the schema module itself. */
    assert.match(src("lib/community/communitySchema.ts"), /never emitted as `Person`|condition 4/);
  });

  test("condition 4b: no earned badges, no reputation numbers, no simulated member statistics", () => {
    const data = getCommunityData();
    for (const m of data.members) {
      assert.equal(m.contributionLabels.length, 0, `${m.username} must carry no earned badge`);
    }
    /* A member record carrying a badge is refused at the read. */
    const bad = clone(data);
    (bad.members[0] as unknown as { contributionLabels: string[] }).contributionLabels = ["Helpful Contributor"];
    assert.throws(() => assertCommunityPayloadShape(bad), /badge|labels/i);
    /* Sweep the corpus and the components: no member counts, no reputation scores, no points totals. */
    const corpus = allStrings(data).join("\n");
    assert.doesNotMatch(corpus, /\d[\d,]*\s+members\b/i, "no member count is simulated");
    assert.doesNotMatch(corpus, /\breputation\b/i);
    assert.doesNotMatch(corpus, /\bkarma\b/i);
    for (const f of filesUnder("components/community")) {
      const body = code(f);
      assert.doesNotMatch(body, /\d[\d,]*\s+members\b/i, `${f} must not print a member count`);
      assert.doesNotMatch(body, /reputation score|points score|\bkarma\b/i, `${f} must not print a score`);
    }
    /* 08C §5: the profile lists helpful replies, never a visible points total. */
    assert.match(src("components/community/MemberProfilePage.tsx"), /labels-not-scores/);
  });

  test("condition 5: the expiry is recorded in the payload and named in the authorization", () => {
    const data = getCommunityData();
    assert.match(data.meta.expiry, /launch|expire/i);
    assert.match(data.meta.authorizedBy, /Conflict 41/);
    const bad = clone(data);
    (bad.meta as { expiry: string }).expiry = "";
    assert.throws(() => assertCommunityPayloadShape(bad), /expiry/);
  });
});

/* ══════════════════════════════════════════════════════ the corpus itself */

describe("the founder-specified review corpus: 5 personas, 10 topics, honest text", () => {
  test("exactly five member personas, each with a distinct voice, join date and home state", () => {
    const data = getCommunityData();
    assert.equal(data.members.length, 5);
    assert.equal(new Set(data.members.map((m) => m.username)).size, 5);
    assert.equal(new Set(data.members.map((m) => m.joinedIso)).size, 5);
    assert.equal(new Set(data.members.map((m) => m.homeState)).size, 5);
    for (const m of data.members) assert.ok(m.bio.length > 40, `${m.username} has a real bio`);
  });

  test("exactly ten topics, spanning the CH sections the task names", () => {
    const data = getCommunityData();
    assert.equal(data.entries.length, 10);
    /* The monthly organizing-unit thread, with the LotteryPost-authentic title shape. */
    const monthly = getForumEntry("florida-pick-3-august-2026")!;
    assert.equal(monthly.title, "Florida: 8/1 - 8/31/2026");
    assert.ok(monthly.tags.includes("monthly"));
    /* One of each specified shape. */
    assert.ok(getForumEntry("pick-4-pairs-summer-tracking"));
    assert.ok(getForumEntry("powerball-roll-streak-stories"));
    assert.equal(getForumEntry("cash-3-sum-range-filter-system")!.attachment?.kind, "system");
    assert.ok(getForumEntry("dreamed-about-fish-again-231")!.tags.includes("dreams"));
    const win = getForumEntry("first-decent-box-hit-story")!;
    assert.equal(win.attachment?.kind, "winStory");
    assert.equal((win.attachment as { verificationState: string }).verificationState, "UNVERIFIED_STORY");
    assert.ok(getForumEntry("scratch-off-talk-august"));
    assert.equal(getForumEntry("moving-to-florida-pick-3-scene")!.replies.length, 0, "the CH-03 no-replies question");
    assert.equal(getForumEntry("poll-cash-or-annuity")!.attachment?.kind, "poll");
    assert.ok(getForumEntry("introduce-yourself-august-2026")!.tags.includes("introductions"));
    /* 5–10 replies each, except the designed no-replies question. */
    for (const e of data.entries) {
      if (e.slug === "moving-to-florida-pick-3-scene") continue;
      assert.ok(e.replies.length >= 5 && e.replies.length <= 10, `${e.slug} has ${e.replies.length} replies`);
    }
  });

  test("the system entry is labelled entertainment (Template D disclosure, verbatim)", () => {
    const sys = getForumEntry("cash-3-sum-range-filter-system")!;
    assert.equal((sys.attachment as { disclosure: string }).disclosure,
      "This is a member method or historical research workflow. It does not guarantee future wins.");
  });

  test("the poll's vote count is tallied from visible replies, never stored", () => {
    const model = buildForumEntryModel("poll-cash-or-annuity")!;
    assert.ok(model.pollTally);
    const total = model.pollTally!.reduce((n, t) => n + t.votes, 0);
    const stated = getForumEntry("poll-cash-or-annuity")!.replies.filter((r) => r.pollChoice).length;
    assert.equal(total, stated);
    /* No numeric vote field exists on the attachment shape. */
    assert.doesNotMatch(code("lib/community/communityContract.ts"), /voteCount\s*:\s*number/);
    /* Template F disclosure, verbatim. */
    const poll = getForumEntry("poll-cash-or-annuity")!.attachment as { disclosure: string };
    assert.equal(poll.disclosure,
      "This is a LotteryCorner community poll and does not represent all lottery players.");
  });

  test("NO prediction claim anywhere in the corpus — the flagship scanner over every string", () => {
    for (const s of allStrings(getCommunityData())) {
      const hit = containsPredictionClaim(s);
      assert.equal(hit, null, `prediction claim in corpus: ${hit}`);
    }
  });

  test("no real-person winner claim: the win story is UNVERIFIED and photo-free; nothing names a person", () => {
    const data = getCommunityData();
    for (const e of data.entries) {
      if (e.attachment?.kind === "winStory") {
        assert.equal(e.attachment.verificationState, "UNVERIFIED_STORY");
        assert.equal(e.attachment.photo, null);
      }
    }
    /* Winner-verification research vocabulary (08 §18) is the contract's, not invented. */
    assert.match(src("lib/community/communityContract.ts"), /UNVERIFIED_STORY.*TICKET_IMAGE_REDACTED/s);
  });

  test("preserved-whitespace number tables exist and render through <pre>", () => {
    const monthly = getForumEntry("florida-pick-3-august-2026")!;
    const numberBlocks = [
      ...monthly.body.filter((b) => b.kind === "numbers"),
      ...monthly.replies.flatMap((r) => r.body.filter((b) => b.kind === "numbers")),
    ];
    assert.ok(numberBlocks.length >= 2, "the monthly thread carries ASCII worksheets");
    for (const b of numberBlocks) {
      assert.ok(b.text.includes("\n") && / {2,}/.test(b.text), "aligned columns need preserved runs of spaces");
    }
    const pieces = src("components/community/CommunityPieces.tsx");
    assert.match(pieces, /<pre className="lcc-numbers" data-whitespace-preserved="true">/);
    /* The pre scrolls inside its own container; the page never scrolls horizontally. */
    const css = src("app/globals.css");
    assert.match(css, /\.lcc-prewrap \{ overflow-x: auto/);
    assert.match(css, /\.lcc-numbers \{[^}]*white-space: pre/s);
    /* And the composer's block-splitter classifies an aligned table as a numbers block. */
    const blocks = toPostBlocks("hello everyone\n\nPair   Count\n----   -----\n38     9\n07     8");
    assert.deepEqual(blocks.map((b) => b.kind), ["text", "numbers"]);
  });
});

/* ══════════════════════════════════════════════════════ FE-06 — the §31 tier policy */

describe("Constitution §31: the FE-06 tier policy is enforced deterministically", () => {
  test("the classifier: distress outranks everything, high-consequence outranks factual", () => {
    assert.equal(classifyForumTier("I can't stop buying tickets and I keep chasing my losses"), "D");
    assert.equal(classifyForumTier("Spent too much this month on scratch offs, how do taxes work?"), "D");
    assert.equal(classifyForumTier("How do taxes work on a Florida win? Do I need a lawyer?"), "C");
    assert.equal(classifyForumTier("My ticket got damaged in the wash, can I still claim it?"), "C");
    assert.equal(classifyForumTier("What time is the Florida Pick 3 evening drawing?"), "A");
    assert.equal(classifyForumTier("What are the odds of hitting a straight?"), "A");
    assert.equal(classifyForumTier("What is everyone playing this week?"), "B");
    assert.equal(classifyForumTier("Congrats to everyone on the little wins this month!"), "B");
  });

  test("Tier C NEVER auto-answers with generated prose — official-source pointers only", () => {
    const plan = aiResponsePlanFor("How do taxes work on a win?", "Do I need a lawyer for a claim dispute?");
    assert.equal(plan.tier, "C");
    assert.equal(plan.kind, "official-source-context");
    if (plan.kind !== "official-source-context") return;
    /* The paragraphs are fixed direction — every one points at official or qualified help. */
    assert.ok(plan.answer.paragraphs.every((p) =>
      /official|qualified|professional|high-consequence|authority|state lottery/i.test(p)));
    assert.match(plan.answer.cannot, /cannot tell you what to do/);
    for (const p of plan.answer.paragraphs) assert.equal(containsPredictionClaim(p), null);
  });

  test("Tier D NEVER gets a routine response — a support pathway, and no answer object at all", () => {
    const plan = aiResponsePlanFor("I keep chasing my losses", "I borrowed money to play this week.");
    assert.equal(plan.tier, "D");
    assert.equal(plan.kind, "support-pathway");
    assert.ok(!("answer" in plan), "a Tier D plan carries no answer");
    assert.ok(!("question" in plan), "a Tier D plan does not even restate the question as an answerable one");
    assert.deepEqual((plan as { support: readonly string[] }).support, TIER_D_SUPPORT);
    assert.ok(TIER_D_SUPPORT.some((l) => /1-800-MY-RESET/.test(l)));
    /* And nothing in the pathway asks for a purchase. */
    for (const line of TIER_D_SUPPORT) assert.doesNotMatch(line, /buy|ticket|play now/i);
  });

  test("Tier B is human-first: NO automatic reply, and the silence explains itself", () => {
    const plan = aiResponsePlanFor("What is everyone playing?", "Just curious what numbers y'all like.");
    assert.equal(plan.tier, "B");
    assert.equal(plan.kind, "human-first-none");
  });

  test("Tier A resolves through the shared answer surface and NEVER invents prose for a missing fact", () => {
    const plan = aiResponsePlanFor("What time is the evening drawing?", "");
    assert.equal(plan.tier, "A");
    assert.equal(plan.kind, "deterministic-answer-surface");
    if (plan.kind !== "deterministic-answer-surface") return;
    /* No community fact store is connected, so the honest answer is the gap — grounded, bounded, no prose. */
    assert.equal(plan.answer, null);
    assert.ok(plan.grounding.length > 0);
    assert.match(plan.invitation, /experience/i);
    /* The reviewer view renders the ONE shared surface (FD-X-08), not a bespoke chatbot. */
    const v = src("components/community/ReviewerEntryView.tsx");
    assert.match(v, /AnswerSurface/);
    assert.match(v, /classPrefix="lcc"/);
  });

  test("fixture Tier-A topics carry the team-authored Research reply per Template H, honestly labelled", () => {
    const withResearch = getCommunityData().entries.filter((e) => e.researchReply);
    assert.ok(withResearch.length >= 2, "the corpus demonstrates the Research reply");
    for (const e of withResearch) {
      const r = e.researchReply!;
      assert.equal(r.label, "LotteryCorner Research");
      assert.ok(r.questionResearched.length > 10);
      assert.ok(r.whatWeFound.length > 0);
      assert.ok(r.evidence.length > 0, "Template H requires evidence");
      assert.ok(r.whatRemainsUncertain.length > 0, "Template H states uncertainty");
      assert.ok(r.invokedBy, "AI does not appear first for social entries unless invoked (08B §8)");
      for (const s of [r.questionResearched, ...r.whatWeFound, r.whatRemainsUncertain]) {
        assert.equal(containsPredictionClaim(s), null);
      }
    }
    /* Entries without one render the recorded reason, not silence. */
    const none = buildForumEntryModel("introduce-yourself-august-2026")!;
    const fe06 = none.sections.find((s) => s.id === "FE-06")!;
    assert.equal(fe06.state, "empty");
    assert.match(fe06.reason!, /does not appear first|invoked/);
  });
});

/* ══════════════════════════════════════════════════════ composer and reviewer store */

describe("08 §6: sign-in is requested ONLY at publish, and the draft survives", () => {
  beforeEach(() => {
    clearReviewerStoreForTests();
    clearDraft();
  });

  test("the composer gates at publish, not at focus or typing", () => {
    const c = code("components/community/CommunityComposer.tsx");
    /* The gate lives inside the publish handler; the textarea renders unconditionally. */
    assert.match(c, /data-signin-gate="publish-only"/);
    assert.match(c, /const startPublish = \(\) => \{[\s\S]*?if \(!session\)/);
    const taStart = c.indexOf("<textarea");
    const textareaBlock = c.slice(taStart, c.indexOf("/>", taStart));
    assert.ok(!/session|disabled/.test(textareaBlock), "the input never checks the session and is never disabled");
    /* The intent is OUTWARD — it never auto-completes after sign-in (FD-ACC-13). */
    assert.match(c, /kind: "outward"/);
    /* And only the opaque nonce reaches the URL. */
    assert.match(c, /INTENT_PARAM/);
  });

  test("the draft survives the sign-in round trip", () => {
    saveDraft({ text: "My pairs for next week\n\n12  38", helper: "Share Numbers" });
    /* …sign-in happens, the page remounts… */
    const restored = readDraft();
    assert.ok(restored);
    assert.equal(restored!.text, "My pairs for next week\n\n12  38");
    assert.equal(restored!.helper, "Share Numbers");
  });

  test("a signed-in reviewer's post genuinely persists to the review store and renders", () => {
    const entry = publishReviewerEntry({
      title: "Does anyone track sums for Ohio?",
      text: "Does anyone track sums for Ohio?\n\nSum   Count\n---   -----\n 9    3",
      helper: "Ask a Question",
      username: "Review Member",
    });
    assert.equal(entry.provenance, "reviewer-authored-review-post");
    assert.ok(getReviewerEntry(entry.slug));
    assert.equal(listReviewerEntries().length, 1);
    /* The body preserved the worksheet as a numbers block. */
    assert.ok(entry.body.some((b) => b.kind === "numbers"));
    /* Replies work, and only the OP can accept — and only a member reply. */
    const reply = addReviewerReply(entry.slug, "Review Member", "Answering my own question for the test.")!;
    assert.equal(acceptReviewerReply(entry.slug, "someone-else", reply.id), false, "only the OP accepts");
    assert.equal(acceptReviewerReply(entry.slug, "Review Member", "not-a-reply-id"), false);
    assert.equal(acceptReviewerReply(entry.slug, "Review Member", reply.id), true);
    assert.equal(getReviewerEntry(entry.slug)!.acceptedReplyId, reply.id);
    /* Reviewer replies on FIXTURE threads persist keyed by slug. */
    addFixtureReply("florida-pick-3-august-2026", "Review Member", "Good luck this month, everyone.");
    assert.equal(fixtureRepliesFor("florida-pick-3-august-2026").length, 1);
  });

  test("the seven helpers produce ONE FORUM_ENTRY — no helper creates a type or a URL", () => {
    const c = code("components/community/CommunityComposer.tsx");
    assert.doesNotMatch(c, /\/community\/new/, "the forbidden route is nowhere");
    /* The helper is a stored string on the same record, not a different shape. */
    assert.match(code("lib/community/communityReviewerStore.ts"), /helper: string \| null/);
  });
});

/* ══════════════════════════════════════════════════════ replies: FE-07 / FE-08 */

describe("FE-07/FE-08: sorts, pagination (never infinite scroll), helpful and accepted", () => {
  test("the four sorts, and pagination over the ten-reply monthly thread", () => {
    const model = buildForumEntryModel("florida-pick-3-august-2026")!;
    assert.deepEqual([...model.sorts], ["top", "newest", "oldest", "helpful"]);
    assert.equal(model.totalReplies, 10);
    assert.equal(model.pageCount, Math.ceil(10 / REPLIES_PER_PAGE));
    assert.equal(model.pageReplies.length, REPLIES_PER_PAGE);
    const page2 = buildForumEntryModel("florida-pick-3-august-2026", { page: "2" })!;
    assert.equal(page2.pageReplies.length, 10 - REPLIES_PER_PAGE);
    /* Out-of-range pages clamp instead of 404ing a crawlable variant. */
    assert.equal(buildForumEntryModel("florida-pick-3-august-2026", { page: "99" })!.page, page2.pageCount);
    /* Sorts order deterministically. */
    const newest = buildForumEntryModel("florida-pick-3-august-2026", { sort: "newest" })!;
    const times = newest.pageReplies.map((r) => r.postedAtIso);
    assert.deepEqual(times, [...times].sort().reverse());
  });

  test("pagination is pages-with-links; no infinite scroll machinery exists in the family", () => {
    assert.match(src("components/community/ForumEntryPage.tsx"), /data-pagination="pages-not-infinite-scroll"/);
    for (const f of filesUnder("components/community")) {
      /* The marker attribute itself contains the word, so the scan targets the MACHINERY of infinite
         scroll — observers, scroll handlers, load-more loops — not the refusal's own name. */
      const body = code(f).replace(/pages-not-infinite-scroll/g, "");
      assert.doesNotMatch(body, /IntersectionObserver|onScroll|InfiniteScroll|loadMore|load-more/i,
        `${f} must not infinite-scroll`);
    }
  });

  test("one accepted reply (the OP's), several helpful — and AI can never be accepted", () => {
    const entry = getForumEntry("pick-4-pairs-summer-tracking")!;
    assert.equal(entry.acceptedReplyId, "r-0002-02");
    assert.equal(entry.acceptedBy, entry.username, "only the original poster accepts (08B §10)");
    const model = buildForumEntryModel(entry.slug)!;
    assert.equal(model.acceptedReply!.id, "r-0002-02");
    assert.ok(model.helpfulReplies.length >= 1);
    /* The BFF refuses an acceptance pointing at anything but a member reply — a research reply id fails. */
    const bad = clone(getCommunityData());
    const target = bad.entries.find((e) => e.slug === entry.slug)! as { acceptedReplyId: string | null };
    target.acceptedReplyId = "rr-0002";
    assert.throws(() => assertCommunityPayloadShape(bad), /never be accepted|not one of its member replies/);
    /* And an acceptance by anyone but the OP fails. */
    const bad2 = clone(getCommunityData());
    (bad2.entries.find((e) => e.slug === entry.slug)! as { acceptedBy: string | null }).acceptedBy = "peachstatepat";
    assert.throws(() => assertCommunityPayloadShape(bad2), /original poster/);
    /* The FE-06 block exposes no accept control — structurally, the accept handler only exists on member
       replies in the reviewer view, and the research reply block renders none. */
    const fe = src("components/community/ForumEntryPage.tsx");
    const fe06Block = fe.slice(fe.indexOf('section("FE-06"'), fe.indexOf('section("FE-07"'));
    assert.doesNotMatch(fe06Block, /accept/i, "no accept control near the Research reply");
  });

  test("FE-09: the summary renders only over enough real activity, every bullet cited", () => {
    /* The no-replies question earns no summary. */
    assert.equal(buildSummary(getForumEntry("moving-to-florida-pick-3-scene")!), null);
    /* The monthly thread does, and every bullet names its reply. */
    const summary = buildSummary(getForumEntry("florida-pick-3-august-2026")!)!;
    assert.ok(summary.length >= 2);
    for (const b of summary) {
      assert.ok(b.fromReplyId && b.fromUsername, "a summary line cites the reply it came from");
    }
    assert.ok(SUMMARY_MIN_REPLIES >= 4, "several replies, not two");
    /* Template I disclosure, verbatim, reaches the page. */
    assert.equal(buildForumEntryModel("florida-pick-3-august-2026")!.summaryDisclosure,
      "Generated from visible community replies and linked sources. It does not replace the original discussion.");
  });
});

/* ══════════════════════════════════════════════════════ moderation seam */

describe("FE-13 / 08 §22: the report control and the typed moderation queue", () => {
  beforeEach(() => clearModerationQueueForTests());

  test("the report control is on every entry page, every reply, and the profile", () => {
    const fe = src("components/community/ForumEntryPage.tsx");
    assert.match(fe, /<ReportControl targetKind="entry"/);
    assert.match(fe, /<ReportControl targetKind="reply"/);
    assert.match(src("components/community/ReviewerEntryView.tsx"), /<ReportControl targetKind="entry"/);
    assert.match(src("components/community/MemberProfilePage.tsx"), /<ReportControl targetKind="member"/);
  });

  test("reports write into the typed queue the admin phase consumes, categories verbatim from 08 §22", () => {
    assert.equal(REPORT_CATEGORIES.length, 17);
    assert.ok(REPORT_CATEGORIES.includes("guaranteed-win claim"));
    assert.ok(REPORT_CATEGORIES.includes("distress"));
    const item = submitCommunityReport({
      targetKind: "entry", targetSlug: "scratch-off-talk-august", replyId: null,
      category: "spam", detail: "", reporter: null,
    });
    assert.equal(item.status, "OPEN");
    assert.equal(item.policy, MODERATION_POLICY);
    assert.match(MODERATION_POLICY.requirement, /reason.*policy.*appeal/i);
    assert.equal(MODERATION_POLICY.appealRoute, "/contact-us");
    assert.equal(readModerationQueue().length, 1);
    /* An off-list category is a bug, not a choice. */
    assert.throws(() => submitCommunityReport({
      targetKind: "entry", targetSlug: "x", replyId: null, category: "vibes", detail: "", reporter: null,
    }), /not an 08 §22/);
    /* Reporting never requires sign-in — the control takes a null reporter. */
    assert.match(code("components/community/ReportControl.tsx"), /reporter: session\?\.displayName \?\? null/);
  });
});

/* ══════════════════════════════════════════════════════ member profiles (08C) */

describe("08C: member profiles — public labels only, no score, never-public absent by type", () => {
  test("the never-public list is unexpressable: the record and projection carry no such fields", () => {
    const contract = code("lib/community/communityContract.ts");
    for (const field of ["email", "phone", "address", "password", "payment", "ticket"]) {
      assert.ok(!new RegExp(`^\\s*${field}\\??:`, "m").test(contract),
        `the member contract must not carry a "${field}" field`);
    }
    const profile = buildMemberProfileModel("sunshinepicks")!.profile;
    assert.deepEqual(Object.keys(profile).sort(), [
      "bio", "displayName", "entries", "helpfulReplies", "homeState", "interests",
      "joinedIso", "repliedIn", "status", "username",
    ]);
  });

  test("helpful/accepted replies are honestly derivable and LISTED, never totalled", () => {
    const bill = buildMemberProfileModel("wheelhousebill")!.profile;
    assert.ok(bill.helpfulReplies.length > 0, "Bill's helpful replies derive from the visible corpus");
    assert.ok(bill.helpfulReplies.some((h) => h.kind === "accepted"));
    /* Every derived item points at a real entry. */
    for (const h of bill.helpfulReplies) assert.ok(getForumEntry(h.slug), h.slug);
  });

  test("the deleted-user state exists in the contract and renders neutrally", () => {
    assert.match(code("lib/community/communityContract.ts"), /"active" \| "deleted"/);
    assert.match(src("components/community/MemberProfilePage.tsx"), /data-member-state="deleted"/);
    assert.match(src("components/community/MemberProfilePage.tsx"), /DELETED_MEMBER_NAME/);
  });

  test("no private messaging surface exists anywhere in the family (08C §10)", () => {
    for (const f of filesUnder("components/community")) {
      assert.doesNotMatch(code(f), /private message|direct message|\bDM\b|send message/i, f);
    }
    assert.match(src("components/community/MemberProfilePage.tsx"), /data-private-messaging="none"/);
  });
});

/* ══════════════════════════════════════════════════════ registry, routes, footer */

describe("FD-GATE-01: the community family is registry-gated, and /community/new does not exist", () => {
  test("the family is in the registry, and every route is enumerated + payload-backed", () => {
    assert.ok(PAGE_FAMILIES.includes("community"));
    assert.equal(servesPage("community", "/community"), true);
    assert.equal(servesPage("community", "/community/florida-pick-3-august-2026"), true);
    assert.equal(servesPage("community", "/members/sunshinepicks"), true);
    assert.equal(servesPage("community", "/community/not-a-registered-slug"), false);
    assert.equal(servesPage("community", "/members/nobody"), false);
    const rows = routeInventory().filter((r) => r.family === "community");
    /* 1 home + 10 entries + 5 members. */
    assert.equal(rows.length, 16);
    assert.deepEqual(new Set(rows.map((r) => r.blueprint)), new Set(["08A", "08B", "08C"]));
  });

  test("THE FORBIDDEN ROUTE: /community/new is not served, not enumerated, not linked", () => {
    assert.equal(servesPage("community", "/community/new"), false);
    assert.ok(!servedRoutes().includes("/community/new"));
    assert.ok(!communityRoutePaths().some((r) => r.route === "/community/new"));
    for (const dir of ["components/community", "app/community", "lib/community"]) {
      for (const f of filesUnder(dir)) {
        assert.ok(!code(f).includes("/community/new"), `${f} must not reference /community/new`);
      }
    }
  });

  test("the footer's Community entry is un-suppressed and points at the real route", () => {
    const explore = FOOTER_GROUPS.find((g) => g.heading === "Explore")!;
    const link = explore.links.find((l) => l.label === "Community");
    assert.ok(link, "Community is an active footer link now");
    assert.equal(link!.href, "/community");
    assert.equal(link!.kind, "newRoute");
    assert.ok(!SUPPRESSED_ENTRIES.some((e) => e.label === "Community"), "the suppression is retired");
  });

  test("the ad profile is typed-empty with the §12 reason; anchors are markers, not slots", () => {
    assert.equal(communityAdProfile(), NO_APPROVED_COMMUNITY_PROFILE);
    assert.equal(NO_APPROVED_COMMUNITY_PROFILE.placements.length, 0);
    assert.match(NO_APPROVED_COMMUNITY_PROFILE.gap, /CLAUDE\.md §12/);
    assert.ok(NO_APPROVED_COMMUNITY_PROFILE.protectedRegions.some((r) => /composer/.test(r)));
    assert.ok(NO_APPROVED_COMMUNITY_PROFILE.protectedRegions.some((r) => /Responsible Play/.test(r)));
    assert.match(src("components/community/CommunityPieces.tsx"), /data-ad-anchor="reserved-pending-audit"/);
  });

  test("§10.5: every community section has a recorded intelligence decision", () => {
    for (const id of COMMUNITY_HOME_ORDER.filter((x) => !x.startsWith("AD-"))) {
      assert.ok(sectionIntelligence("community", id), `${id} needs a matrix entry`);
    }
    for (const id of FORUM_ENTRY_ORDER.filter((x) => !x.startsWith("AD-"))) {
      assert.ok(sectionIntelligence("community", id), `${id} needs a matrix entry`);
    }
    assert.equal(CLASS_PREFIX.community, "lcc");
  });
});

/* ══════════════════════════════════════════════════════ schema and the news seam */

describe("08A §19 / Template K: schema reflects visible content; the news seam is live both ways", () => {
  test("the home graph is the §19 conceptual list, over visible cards only", () => {
    const model = buildCommunityHomeModel();
    const graph = communityHomeSchema(model.visibleEntryCards)["@graph"] as { "@type": string }[];
    assert.deepEqual(graph.map((n) => n["@type"]),
      /* LRG-UX-SCHEMA-001 correction 1: the Organization and WebSite ENTITIES moved to the root layout, which
         emits one of each per page. The page graph references their `@id`s instead of redefining them. */
      ["CollectionPage", "BreadcrumbList"]);
  });

  /*
   * LRG-UX-SCHEMA-001 correction 2 — the four required cases, in one place.
   *
   * The old version of this test asserted `DiscussionForumPosting` + `Comment` + a reply counter for a FIXTURE
   * entry. That is exactly the claim the correction removes: the posting type asserts a human wrote the thread,
   * and no human wrote any of these. Both branches are asserted, because a test that only checked the withheld
   * side would pass just as well if the genuine side had been deleted.
   */
  test("case 1 — a synthetic review entry emits NO UGC or person schema, page nodes only", () => {
    const entry = getForumEntry("florida-pick-3-august-2026")!;
    const model = buildForumEntryModel(entry.slug)!;
    const graph = forumEntrySchema(entry, model.pageReplies, model.totalReplies) as {
      "@graph": { "@type": string }[];
    };
    assert.deepEqual(graph["@graph"].map((n) => n["@type"]), ["WebPage", "BreadcrumbList"]);
    const json = JSON.stringify(graph);
    for (const banned of ["DiscussionForumPosting", "SocialMediaPosting", "ProfilePage", "Person",
                          "Comment", "InteractionCounter", "userInteractionCount", "QAPage"]) {
      assert.ok(!json.includes(banned), `a fixture entry must not emit ${banned}`);
    }
  });

  test("case 2 — every entry in the corpus behaves that way; none slips through", () => {
    for (const e of getCommunityData().entries) {
      const model = buildForumEntryModel(e.slug)!;
      const graph = forumEntrySchema(e, model.pageReplies, model.totalReplies) as {
        "@graph": { "@type": string }[];
      };
      assert.deepEqual(graph["@graph"].map((n) => n["@type"]), ["WebPage", "BreadcrumbList"], e.slug);
    }
    /* The community home withholds its ItemList for the same reason: every card is a fixture. */
    const home = communityHomeSchema(buildCommunityHomeModel().visibleEntryCards) as {
      "@graph": { "@type": string }[];
    };
    assert.deepEqual(home["@graph"].map((n) => n["@type"]), ["CollectionPage", "BreadcrumbList"]);
  });

  test("case 3 — a genuine-UGC entry emits DiscussionForumPosting with an OBJECT author", () => {
    const base = getForumEntry("florida-pick-3-august-2026")!;
    const model = buildForumEntryModel(base.slug)!;
    const genuine = { ...base, provenance: GENUINE_UGC_PROVENANCE };
    const graph = forumEntrySchema(genuine, model.pageReplies, model.totalReplies) as {
      "@graph": Record<string, unknown>[];
    };
    const posting = graph["@graph"][0];
    assert.equal(posting["@type"], "DiscussionForumPosting");
    const author = posting["author"] as { "@type": string; name: string; url: string };
    assert.equal(typeof author, "object", "never a plain string — Google's forum guidance wants an entity");
    assert.equal(author["@type"], "Person");
    assert.equal(author.name, base.username);
    assert.equal(author.url, `https://www.lotterycorner.com/members/${base.username}`);
    /* Text still mirrors the visible whitespace-preserved body, and no QAPage appears. */
    const json = JSON.stringify(graph);
    assert.ok(json.includes(JSON.stringify(postText(base.body)).slice(1, 40)));
    assert.doesNotMatch(json, /QAPage/);
  });

  test("case 4 — comment authors are objects too, and a fixture reply never rides a genuine thread", () => {
    const base = getForumEntry("florida-pick-3-august-2026")!;
    const model = buildForumEntryModel(base.slug)!;
    assert.ok(model.pageReplies.length > 0, "the fixture entry has replies to reason about");

    /* Genuine thread, genuine replies: every comment author is an object. */
    const allGenuine = { ...base, provenance: GENUINE_UGC_PROVENANCE };
    const replies = model.pageReplies.map((r) => ({ ...r, provenance: GENUINE_UGC_PROVENANCE }));
    const posting = (forumEntrySchema(allGenuine, replies, replies.length) as {
      "@graph": Record<string, unknown>[];
    })["@graph"][0];
    const comments = posting["comment"] as { "@type": string; author: { "@type": string; url: string } }[];
    assert.equal(comments.length, replies.length);
    for (const c of comments) {
      assert.equal(c["@type"], "Comment");
      assert.equal(typeof c.author, "object");
      assert.equal(c.author["@type"], "Person");
      assert.match(c.author.url, /^https:\/\/www\.lotterycorner\.com\/members\//);
    }

    /* Genuine thread, fixture replies: the replies drop out rather than becoming invented comments. */
    const mixed = (forumEntrySchema(allGenuine, model.pageReplies, model.totalReplies) as {
      "@graph": Record<string, unknown>[];
    })["@graph"][0];
    assert.deepEqual(mixed["comment"], []);
  });

  /*
   * LRG-UX-SCHEMA-002 §4 — THE COUNT AND THE COMMENTS ARE ONE POPULATION.
   *
   * The defect these five cases exist for: `comment` filtered to genuine replies while `userInteractionCount`
   * used the caller's unfiltered `visibleReplyCount`. A genuine entry carrying fixture replies therefore
   * emitted zero comments and a POSITIVE comment count — a claim that N people replied, with none of them
   * listed. Each case below pins one half of the invariant, and case 5 pins the pagination path that made the
   * two populations diverge in the first place.
   */
  describe("LRG-UX-SCHEMA-002 §4: interaction statistics count exactly the emitted comments", () => {
    const base = () => getForumEntry("florida-pick-3-august-2026")!;
    const replies = () => buildForumEntryModel(base().slug)!.pageReplies;
    const genuineEntry = () => ({ ...base(), provenance: GENUINE_UGC_PROVENANCE });
    const posting = (entry: never, reps: never, total: number) =>
      (forumEntrySchema(entry, reps, total) as { "@graph": Record<string, unknown>[] })["@graph"][0];
    const counter = (node: Record<string, unknown>) => {
      const stat = node["interactionStatistic"] as { userInteractionCount: number }[] | undefined;
      return stat ? stat[0].userInteractionCount : null;
    };

    test("case 1 — a fixture entry emits no comment, no author and no interaction statistic", () => {
      const node = posting(base() as never, replies() as never, 99);
      /* There is no posting node at all, so there is nothing to carry a counter. */
      assert.equal(node["@type"], "WebPage");
      assert.ok(!JSON.stringify(node).includes("interactionStatistic"));
    });

    test("case 2 — genuine entry with genuine replies: object authors and a count equal to them", () => {
      const reps = replies().map((r) => ({ ...r, provenance: GENUINE_UGC_PROVENANCE }));
      const node = posting(genuineEntry() as never, reps as never, reps.length);
      const comments = node["comment"] as { author: { "@type": string } }[];
      assert.equal(comments.length, reps.length);
      for (const c of comments) assert.equal(c.author["@type"], "Person");
      assert.equal(counter(node), comments.length);
    });

    test("case 3 — genuine entry with FIXTURE replies: zero comments and NO positive count", () => {
      /* The exact defect. `visibleReplyCount` is deliberately passed as the unfiltered total, which is what a
         caller does today — the builder must not believe it. */
      const reps = replies();
      assert.ok(reps.length > 0, "the fixture entry genuinely has replies to be wrong about");
      const node = posting(genuineEntry() as never, reps as never, reps.length);
      assert.deepEqual(node["comment"], []);
      assert.equal(counter(node), null, "no comments means no counter, not a counter of zero");
      assert.ok(!JSON.stringify(node).includes("userInteractionCount"));
    });

    test("case 4 — mixed replies: only genuine comments, and the count is exactly their number", () => {
      const all = replies();
      assert.ok(all.length >= 2, "at least two replies to split");
      const mixed = all.map((r, i) => (i % 2 === 0 ? { ...r, provenance: GENUINE_UGC_PROVENANCE } : r));
      const expected = mixed.filter((r) => r.provenance === GENUINE_UGC_PROVENANCE).length;
      const node = posting(genuineEntry() as never, mixed as never, all.length);
      const comments = node["comment"] as unknown[];
      assert.equal(comments.length, expected);
      assert.equal(counter(node), expected);
      assert.notEqual(counter(node), all.length, "the unfiltered total must not survive anywhere");
    });

    test("case 5 — reordering and pagination cannot let a hidden fixture reply into schema", () => {
      const all = replies();
      const genuine = all.map((r) => ({ ...r, provenance: GENUINE_UGC_PROVENANCE }));

      /* Reordered: the same population, so the same count — order is not a filter. */
      const reordered = [...genuine].reverse();
      const a = posting(genuineEntry() as never, reordered as never, genuine.length);
      assert.equal((a["comment"] as unknown[]).length, genuine.length);
      assert.equal(counter(a), genuine.length);

      /* Paginated: the page renders ONE reply and states a larger total. Schema describes the SLICE, because
         §17 admits only visible replies — a reply on another page is neither visible nor crawlable here. */
      const firstPage = genuine.slice(0, 1);
      const b = posting(genuineEntry() as never, firstPage as never, genuine.length);
      assert.equal((b["comment"] as unknown[]).length, 1);
      assert.equal(counter(b), 1, "the count follows the rendered slice, never the page's stated total");

      /* And a hidden FIXTURE reply cannot re-enter by being placed off-page and counted. */
      const c = posting(genuineEntry() as never, [] as never, all.length);
      assert.deepEqual(c["comment"], []);
      assert.equal(counter(c), null);
    });
  });

  test("Template M: the news article and the community entry reference the SAME thread", () => {
    /* Community side: the entry names the article. */
    const entry = getForumEntryById("fe-2026-0003")!;
    assert.equal(entry.slug, "powerball-roll-streak-stories");
    assert.equal(entry.newsArticleSlug, "powerball-2015-matrix-history");
    /* News side: the article resolves the same thread through the typed seam. */
    const article = buildNewsArticleModel("powerball-2015-matrix-history")!;
    assert.equal(article.article.canonicalDiscussionThreadId, "fe-2026-0003");
    assert.ok(article.discussion);
    assert.equal(article.discussion!.href, "/community/powerball-roll-streak-stories");
    assert.equal(article.discussion!.replyCount, entry.replies.length);
    assert.equal(article.sections.find((s) => s.order === 12)!.rendered, true);
    /* Other articles keep the honest null seam. */
    const other = buildNewsArticleModel("mega-millions-2025-matrix-change")!;
    assert.equal(other.discussion, null);
    assert.equal(other.sections.find((s) => s.order === 12)!.rendered, false);
    /* And the home's CH-11 lists the same discussion. */
    const home = buildCommunityHomeModel();
    assert.ok(home.newsDiscussions.some((d) =>
      d.slug === "powerball-roll-streak-stories" && d.newsArticleSlug === "powerball-2015-matrix-history"));
  });

  test("the forum TaggedContentSource lights the flagship rail with real /community destinations", () => {
    const items = communityTaggedContentSource.fetchByTag("Powerball", 3);
    assert.ok(items.length >= 2);
    for (const i of items) {
      assert.match(i.href, /^\/community\/[a-z0-9-]+$/);
      assert.equal(i.provenance, "synthetic/internal-review");
      assert.ok(i.tags.includes("Powerball"));
      assert.equal(typeof i.replyCount, "number");
    }
    /* Registered: the shared feed resolves through it. */
    const feed = taggedFeed("forum", "Powerball", 3);
    assert.equal(feed.unavailable, null);
    assert.ok(feed.items.every((i) => i.href.startsWith("/community/")));
  });
});

/* ══════════════════════════════════════════════════════ hygiene */

describe("hygiene: the BFF is the only door, and the mode is honest", () => {
  test("nothing outside the BFF imports the review corpus JSON", () => {
    const offenders: string[] = [];
    for (const dir of ["components", "app", "lib"]) {
      for (const f of filesUnder(dir)) {
        if (!/\.(ts|tsx)$/.test(f)) continue;
        if (f === "lib/community/bff/communityBff.ts") continue;
        if (/bff\/review\/community-review|community-review\.json/.test(code(f))) offenders.push(f);
      }
    }
    assert.deepEqual(offenders, []);
  });

  test("the mode is a module constant, not an environment read", () => {
    assert.equal(COMMUNITY_DATA_MODE, "review");
    assert.doesNotMatch(code("lib/community/bff/communityBff.ts"), /process\.env/);
    assert.doesNotMatch(code("lib/community/communityRegistry.ts"), /process\.env/);
  });

  test("server components never read the reviewer store or the session", () => {
    /* The store and session are client-side; server pages import neither. */
    for (const f of ["components/community/CommunityHomePage.tsx", "components/community/ForumEntryPage.tsx",
      "components/community/MemberProfilePage.tsx"]) {
      const body = code(f);
      assert.doesNotMatch(body, /communityReviewerStore|useAccountSession|getSession/, f);
      assert.ok(!body.trimStart().startsWith('"use client"'), `${f} is a server component`);
    }
  });

  test("the FE-06 empty state never fabricates, and no component invents an AI label", () => {
    /* The only AI-ish label in the family is the approved Research identity and the tier surface. */
    for (const f of filesUnder("components/community")) {
      const body = code(f);
      assert.doesNotMatch(body, /"AI Quick Take"|"AI Context"|"Ask AI Anything"/, f);
    }
  });
});
