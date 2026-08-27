/*
 * FORUM ENTRY POINTS + ARCHIVE VISIBLE-GATE RESTORATION — the community-integration task.
 *
 * ══ WHAT THIS SUITE GUARDS ══
 *
 * Stream A — the Community family exists (08A/08B/08C, commit a39bdfe, Conflict 41 FOUNDER AMENDMENT), so
 * `FD-ACC-10`'s "forum integration hidden because no forum platform exists" is satisfied BY CONSTRUCTION and
 * the designated entry slots on Home (H-10), State (S-14), Game (JG-16) and the archive (AR-09) now link the
 * real routes. The invariants: honest counts from the corpus (never invented), real `/community/{slug}`
 * destinations, the Conflict 41 disclosure travelling with fixture threads, and NO section reordering —
 * designated slots were filled, nothing structural moved.
 *
 * Stream B — `FD-DAT-16` removed the archive's executing ask/export surfaces and recorded its own restoration
 * condition: "restore those visible controls when the real shared Account and sign-in continuation flow works
 * end to end." Conflict 37 (2026-08-11) met it. The invariants: signed-out shows the surface with the shared
 * `Sign in free to use` affordance (`FD-DAT-04`, exact wording, one implementation), signed-in genuinely
 * executes, continuation lands `prepared` and never auto-executes (`FD-DAT-16` point 6), and no limit outcome
 * is ever faked client-side (`FD-DAT-11`/`FD-DAT-18`; metering is API-phase per Conflict 37).
 */

import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildHomePreview } from "../lib/preview/homePreviewModel";
import { getCommunityData } from "../lib/community/bff/communityBff";
import {
  COMMUNITY_HUB_PATH,
  communityDisclosure,
  communityDiscussionsFor,
  recentCommunityDiscussions,
  stateCommunityThread,
} from "../lib/community/communityDiscussionSource";
import { buildStatePreviewModel } from "../lib/state/statePreviewModel";
import { bandRuns } from "../lib/state/stateVisualBands";
import { DEFAULT_ORDER } from "../lib/state/sectionManifest";
import { gameConfigFor } from "../lib/game/gameConfigRegistry";
import { buildArchiveModel } from "../lib/archive/archiveModel";
import { AR_ORDER, type ArchiveViewModel } from "../lib/archive/archiveContract";
import { filterArchive, filterInputFromCarried } from "../lib/archive/archiveFilter";
import { buildArchiveCsv, EXPORT_LIMIT_CONTRACT } from "../lib/archive/archiveDownload";
import { askArchive, interpretArchiveQuestion } from "../lib/archive/archiveAsk";
import { createAccount, completeSignInIntent } from "../lib/account/session";
import { captureSignInIntent } from "../lib/account/signInIntent";
import { storeResetForTests } from "../lib/account/reviewAccountStore";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped — a comment RECORDING a rule is the audit trail, not a violation. */
const codeOnly = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const archive = (): ArchiveViewModel => {
  const cfg = gameConfigFor("fl", "pick-3");
  assert.ok(cfg);
  const m = buildArchiveModel("fl", "pick-3", 2026, cfg!, true);
  assert.ok(m);
  return m!;
};

beforeEach(() => {
  storeResetForTests();
});

/* ══════════════════════════════════════════════════════════ Stream A — Home H-10 */

describe("H-10 Community Live carries real corpus threads with honest counts", () => {
  const homeCommunity = () => {
    const s = buildHomePreview().entries.find((e) => (e as { id?: string }).id === "H-10") as unknown as {
      id: string; name: string; order: number; kind: string; provenance: string;
      data: {
        discussions: readonly {
          title: string; forum: string; replyCount: number; lastActivityDisplay: string;
          authorDisplayName?: string; href?: string;
        }[];
        disclosure?: string | null; moreHref?: string; moreLabel?: string;
      };
    };
    assert.ok(s, "H-10 must exist");
    return s;
  };

  test("the discussions are populated, and every one links its real /community/{slug} page", () => {
    const s = homeCommunity();
    assert.ok(s.data.discussions.length >= 3, "the designed content slot is filled");
    const slugs = new Set(getCommunityData().entries.map((e) => e.slug));
    for (const d of s.data.discussions) {
      assert.match(d.href ?? "", /^\/community\/[a-z0-9-]+$/, `${d.title} links a forum entry route`);
      assert.ok(slugs.has((d.href ?? "").split("/").pop()!), `${d.href} must be a corpus thread that exists`);
    }
  });

  test("every reply count is the corpus thread's real visible count — never invented", () => {
    const s = homeCommunity();
    const bySlug = new Map(getCommunityData().entries.map((e) => [e.slug, e]));
    for (const d of s.data.discussions) {
      const entry = bySlug.get((d.href ?? "").split("/").pop()!)!;
      assert.equal(d.replyCount, entry.replies.length, `${d.title} must carry the thread's own reply count`);
      assert.equal(d.authorDisplayName, entry.username, "and the thread's own author handle");
    }
  });

  test("the Conflict 41 disclosure travels onto the surface, and the hub link exists", () => {
    const s = homeCommunity();
    assert.equal(s.data.disclosure, getCommunityData().meta.disclosure,
      "amendment condition 1: fixture threads never render undisclosed");
    assert.equal(s.data.moreHref, "/community");
    assert.equal(COMMUNITY_HUB_PATH, "/community");
    /* The render links the threads and appends the hub continuation without restructuring the section. */
    const render = src("components/preview/HomePreview.tsx");
    assert.match(render, /data-more-community="true"/);
    assert.match(render, /s\.data\.disclosure \?\?/, "the disclosure replaces the membership claim when present");
  });

  test("H-10's position and envelope are unchanged: content slot filled, no restructure", () => {
    const vm = buildHomePreview();
    const ids = vm.entries.map((e) => (e as { id: string }).id);
    assert.equal(new Set(ids).size, ids.length, "no section id is duplicated or invented");
    /* LRG-UI-012 §14 stands: H-10 sits immediately after H-05, exactly where the order experiment put it. */
    assert.equal(ids.indexOf("H-10"), ids.indexOf("H-05") + 1, "H-10 still follows H-05 directly");
    const s = vm.entries.find((e) => (e as { id: string }).id === "H-10") as unknown as {
      name: string; order: number; kind: string; provenance: string; provenanceLabel: string | null;
    };
    assert.equal(s.name, "Community Live");
    assert.equal(s.order, ids.indexOf("H-10") + 1, "the order experiment's renumbering is untouched");
    assert.equal(s.kind, "community");
    /* Review-fixture threads are synthetic and say so; `Coming soon` stopped being true. */
    assert.equal(s.provenance, "synthetic");
    assert.equal(s.provenanceLabel, "Sample", "the visible synthetic label the guard requires");
    /* H-10A Winners is untouched — it stays synthetic-labelled editorial, not forum content. */
    const winners = vm.entries.find((e) => (e as { id: string }).id === "H-10A") as unknown as {
      kind: string; provenance: string;
    };
    assert.equal(winners.kind, "winners");
    assert.equal(winners.provenance, "synthetic");
  });
});

/* ══════════════════════════════════════════════════════════ Stream A — the adapter itself */

describe("the community discussion seam is honest about its source", () => {
  test("recent discussions come sorted by real last activity, capped at the limit", () => {
    const three = recentCommunityDiscussions(3);
    assert.equal(three.length, 3);
    for (let i = 1; i < three.length; i++) {
      assert.ok(three[i - 1].lastActivityIso >= three[i].lastActivityIso, "newest activity first");
    }
  });

  test("scoped discussions require BOTH the game and the state where both are given", () => {
    const fl = communityDiscussionsFor({ gameId: "pick-3", stateCode: "fl" }, 10);
    assert.ok(fl.length >= 2, "the corpus carries Florida Pick 3 threads");
    const entries = new Map(getCommunityData().entries.map((e) => [e.slug, e]));
    for (const d of fl) {
      const e = entries.get(d.slug)!;
      assert.equal(e.stateCode, "fl", `${d.slug} must be a Florida thread`);
      assert.ok(e.gameId === "pick-3" || e.tags.includes("pick-3"), `${d.slug} must be a Pick 3 thread`);
    }
    /* A New York Pick 3 thread never appears under a Florida scope. */
    assert.ok(!fl.some((d) => d.slug === "dreamed-about-fish-again-231"));
  });

  test("the Florida monthly thread resolves; a state without one gets null, never a fabrication", () => {
    const fl = stateCommunityThread("fl");
    assert.ok(fl, "the corpus has a Florida monthly thread");
    assert.equal(fl!.slug, "florida-pick-3-august-2026");
    assert.equal(fl!.href, "/community/florida-pick-3-august-2026");
    assert.equal(stateCommunityThread("ca"), null, "no California monthly thread exists — so none is shown");
  });

  test("the disclosure is the corpus's own banner sentence", () => {
    assert.equal(communityDisclosure(), getCommunityData().meta.disclosure);
  });
});

/* ══════════════════════════════════════════════════════════ Stream A — State S-14 */

describe("S-14's community band links the real route, state-scoped where the corpus allows", () => {
  test("Florida's lower content carries the monthly thread, resolved by the model not the config", () => {
    const m = buildStatePreviewModel("fl", true);
    assert.ok(m);
    assert.equal(m!.lowerContent.communityThread?.href, "/community/florida-pick-3-august-2026");
    /* The config cannot author a thread: the JSON has no such field, and the model resolves it. */
    assert.ok(!src("config/states/fl.json").includes("communityThread"));
  });

  test("the band's CTA opens /community and renders the state thread link when present", () => {
    const band = src("components/state/preview/sections/StateLowerBands.tsx");
    assert.match(band, /href="\/community"/);
    assert.match(band, /data-community-thread="true"/);
    assert.ok(!/#community-help/.test(codeOnly("components/state/preview/sections/StateLowerBands.tsx")),
      "the unbuilt-route fallback anchor is retired");
  });

  test("state band order is unchanged — the community band moved nowhere", () => {
    /* The order contract asserted in state-preview.test.ts stays authoritative; this re-pins the band list
       so a regression here fails in the task's own suite too. */
    const runs = bandRuns(DEFAULT_ORDER).filter((r) => r.band);
    assert.deepEqual(runs.map((r) => r.band!.id),
      ["results", "play-and-help", "explore", "editorial", "community", "resources"]);
  });
});

/* ══════════════════════════════════════════════════════════ Stream A — Game JG-16 + archive AR-09 */

describe("only designated slots were filled on the game page and the archive", () => {
  test("JG-16's designated discuss link points at /community through the shared component", () => {
    const bands = src("components/game/preview/sections/GameM2Bands.tsx");
    const jg16 = bands.slice(bands.indexOf('case "JG-16"'), bands.indexOf('case "JG-17"'));
    assert.match(jg16, /StateDiscussLink/);
    assert.match(jg16, /href="\/community"/);
    /* No new section: the M2 band map is untouched (JG-16 and JG-17 still form the community band). */
    assert.match(src("lib/game/gameM2Model.ts"), /\{ id: "community", title: "Discuss and come back", sections: \["JG-16", "JG-17"\] \}/);
  });

  test("AR-09's Player discussions group carries the scoped corpus threads with real facts", () => {
    const m = archive();
    const community = m.editorial.find((g) => g.kind === "Community");
    assert.ok(community, "the designated group exists");
    assert.ok(community!.items.length > 0, "the Florida Pick 3 archive has matching threads");
    assert.equal(community!.emptyStatement, null);
    const entries = new Map(getCommunityData().entries.map((e) => [e.slug, e]));
    for (const item of community!.items) {
      assert.match(item.href ?? "", /^\/community\/[a-z0-9-]+$/);
      const e = entries.get(item.href!.split("/").pop()!)!;
      assert.ok(e, `${item.href} must exist in the corpus`);
      /* The dateLine's reply figure is the thread's real count — stated, not estimated. */
      assert.match(item.dateLine ?? "", new RegExp(`^${e.replies.length} repl(y|ies)`));
    }
  });

  test("the archive section order is byte-identical to the governed AR_ORDER — nothing moved", () => {
    assert.deepEqual([...AR_ORDER], [
      "AR-01", "AR-04", "AR-06", "AR-05", "AD-AR00", "AR-03", "AR-02", "AD-AR01",
      "AR-07", "AD-AR02", "AR-09", "AR-10", "AR-11", "AD-AR03", "Footer",
    ]);
    /* AR-08 stays reserved: FD-ACC-08's Personal Archive Tools slot is future work, not this task's. */
    assert.ok(!AR_ORDER.includes("AR-08"));
    assert.equal(archive().sectionState["AR-08"].render, false);
  });
});

/* ══════════════════════════════════════════════════════════ Stream B — the ask gate */

describe("FD-DAT-16 restoration: the ask surface is gated signed-out and executes signed-in", () => {
  test("AR-03 composes the ask part again, citing the met condition", () => {
    const view = src("components/archive/ArchiveView.tsx");
    assert.match(view, /part="ask"/);
    assert.match(view, /FD-DAT-16/, "the restoration is documented at the site");
    assert.match(view, /Conflict 37/, "with the condition that met it");
  });

  test("signed out, the surface is visible and the submit affordance is the shared gate", () => {
    const ws = codeOnly("components/archive/ArchiveWorkspace.tsx");
    /* The gate: SignInToUse when no session, real Ask button when signed in. */
    assert.match(ws, /useAccountSession/);
    assert.match(ws, /SignInToUse/);
    assert.ok(!/"Sign in free to use"/.test(ws), "FD-DAT-04 wording lives ONLY in the shared component");
    /* FD-ACC-12/FD-DAT-05: the intent carries state, game, year and the typed question. */
    assert.match(ws, /stateCode: m\.stateCode/);
    assert.match(ws, /gameSlug: m\.gameSlug/);
    assert.match(ws, /year: String\(m\.archiveYear\)/);
    assert.match(ws, /query: question\.trim\(\)/);
    /* FD-DAT-16 point 6: prepared on return, never auto-executed. */
    assert.match(ws, /class: "prepared"/);
    /* FD-DAT-06: the adjacent copy says free and never mentions a plan, tier, trial or upgrade. */
    assert.match(src("components/archive/ArchiveWorkspace.tsx"), /free with a LotteryCorner account/);
    assert.ok(!/\b(plan|tier|trial|upgrade)\b/i.test(codeOnly("components/archive/ArchiveWorkspace.tsx")));
    /* Signed out, nothing executes: every execution path checks the session first. */
    assert.ok(!/onClick=\{\(\) => \{ setQuestion\(p\); setAskedQuestion\(p\); \}\}/.test(ws),
      "chips must not execute for a signed-out reader");
  });

  test("the executing path is deterministic and never labelled AI (FD-DAT-20's reasoning)", () => {
    const m = archive();
    /* The same function the signed-in submit calls, end to end, grounded in the archive rows. */
    const a = askArchive(m.askPrompts[0], m.rows, m.profile, m.members, 2026, "Florida Pick 3");
    assert.ok(a.understood);
    assert.ok(a.explanation.length > 0);
    const interp = interpretArchiveQuestion(m.askPrompts[0], m.profile, m.members, 2026);
    const direct = filterArchive(m.rows, m.profile, interp.filter);
    assert.equal(a.matchingCount, direct.rows.length, "the ask path and the filter path agree exactly");
    /* Never labelled AI: no answer string claims a model. */
    for (const s of [a.explanation, a.neutrality, ...a.interpretation.map((i) => `${i.label} ${i.value}`)]) {
      assert.ok(!/\bAI\b/.test(s), `deterministic answers are never labelled AI: ${s}`);
    }
  });

  test("the one complete public answer stays server-computed and public (FD-DAT-08)", () => {
    const m = archive();
    assert.ok(m.askAnswer.understood);
    assert.ok(m.askAnswer.explanation.length > 0);
    /* And the workspace shows it before any interaction: the server answer renders while askedQuestion
       is null, which is the initial state in both account states. */
    assert.match(src("components/archive/ArchiveWorkspace.tsx"), /askedQuestion === null\s*\?\s*m\.askAnswer/);
  });
});

/* ══════════════════════════════════════════════════════════ Stream B — the export gate */

describe("FD-DAT-16 restoration: exports download signed-in, gate signed-out, fake nothing", () => {
  test("the three provided actions render with their real labels and the shared gate", () => {
    const island = src("components/archive/ArchiveResultViews.tsx");
    assert.match(island, /Download this year \(CSV\)/);
    assert.match(island, /Download filtered results \(CSV\)/);
    assert.match(island, /Print this year/);
    assert.match(island, /SignInToUse/);
    assert.match(island, /class: "prepared"/, "FD-DAT-16 point 6: continuation prepares, never auto-runs");
    assert.match(island, /A LotteryCorner account is free/);
  });

  test("the signed-in CSV is the same data the table shows, for both scopes", () => {
    const m = archive();
    const year = buildArchiveCsv(m, m.rows, "year");
    assert.equal(year.dataRows, m.rows.length);
    assert.match(year.filename, /^fl-pick-3-2026-results\.csv$/);
    /* The filtered scope reconstructs the workspace's published filter through the SAME deterministic
       filter — here, the carried shape a March search publishes to the bus. */
    const carried = filterInputFromCarried({ month: 3 }, 2026);
    const march = filterArchive(m.rows, m.profile, carried);
    const filtered = buildArchiveCsv(m, march.rows, "filtered");
    assert.equal(filtered.dataRows, march.rows.length);
    assert.match(filtered.filename, /filtered-results\.csv$/);
    assert.ok(filtered.content.includes(`Filtered selection — ${march.rows.length} of ${m.rows.length}`));
  });

  test("no fake limit outcome exists anywhere on the client — the shapes are a contract note", () => {
    /* FD-DAT-07/10/13 SHAPES, recorded for the API phase; FD-DAT-11 puts enforcement on the server and
       Conflict 37 records metering as API-phase. The client never invents a rejection. */
    assert.equal(EXPORT_LIMIT_CONTRACT.enforcedBy, "server");
    assert.equal(EXPORT_LIMIT_CONTRACT.enforcementPhase, "api");
    assert.equal(EXPORT_LIMIT_CONTRACT.maxCalendarYearsPerRequest, 2);
    assert.equal(EXPORT_LIMIT_CONTRACT.maxGameYearDatasetsPerDay, 3);
    assert.equal(EXPORT_LIMIT_CONTRACT.filtersShareAllowance, true);
    for (const f of ["components/archive/ArchiveResultViews.tsx", "components/archive/ArchiveWorkspace.tsx"]) {
      const c = codeOnly(f);
      assert.ok(!/limit (reached|exceeded)|over your limit|allowance/i.test(c), `${f} fakes no limit outcome`);
      assert.ok(!/EXPORT_LIMIT_CONTRACT/.test(c), `${f} must not enforce the note client-side`);
    }
  });

  test("continuation after sign-in lands prepared — never auto-executed (FD-DAT-16 point 6)", async () => {
    await createAccount({
      email: "archive@example.com", secret: "long-enough-secret", staySignedIn: true, acceptedCommunityRules: true,
    });
    const nonce = captureSignInIntent({
      returnTo: "/fl/pick-3/2026#ar-05",
      action: "archive-export-year",
      label: "Download this year (CSV)",
      kind: "private",
      context: { class: "prepared", stateCode: "fl", gameSlug: "pick-3", year: "2026", filters: "{}" },
    });
    const outcome = completeSignInIntent(nonce);
    assert.equal(outcome.completed, false, "nothing runs for the reader");
    assert.equal(outcome.intent?.returnTo, "/fl/pick-3/2026#ar-05", "same archive, same year, same section");
    assert.match(outcome.message!, /nothing has run automatically/);
  });
});
