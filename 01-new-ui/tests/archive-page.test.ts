/*
 * YEARLY HISTORY ARCHIVE V0 — ACCEPTANCE TESTS — LRG-ARCHIVE-054.
 *
 * Authority: the 2026-08-05 execution brief §18 (acceptance criteria), §11 (fixture rules), §17 (forbidden
 * changes); archive blueprint Part XI; `CLAUDE.md` §14 and the public-page pre-merge checklist.
 *
 * ══ HOW THESE TESTS ARE WRITTEN ══
 *
 * Each suite maps to one acceptance-criteria group in brief §18, and each test asserts the BEHAVIOUR rather than
 * the implementation where it can. The generalization suite is the important one: it drives the same
 * `buildArchiveModel` with four different format shapes and asserts the vocabulary and controls change on their
 * own, which is the only way to show a "generic" engine is actually generic rather than incidentally correct for
 * the one game it was written against.
 *
 * The proof games get NO public archive route (brief Phase 4 forbids it), so they are exercised through the model
 * directly. That is the distinction the registry makes possible.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

import { buildArchiveModel } from "../lib/archive/archiveModel";
import {
  AR_AD_ANCHORS, AR_ORDER, AR_ORDER_BLUEPRINT, isGenuineCorrection,
  type ArchiveDrawRow, type ArchiveSectionId, type ArchiveViewModel,
} from "../lib/archive/archiveContract";
import { defaultArchiveFilter, filterArchive } from "../lib/archive/archiveFilter";
import { askArchive, interpretArchiveQuestion, INTERPRETER_DISCLOSURE } from "../lib/archive/archiveAsk";
import {
  archiveDisplayDate, monthKeyOf, parseArchiveYearSegment, resolveArchiveYear,
} from "../lib/archive/archiveYear";
import {
  ARCHIVE_ELIGIBLE, adjacentArchiveYear, archiveRoutePaths, archiveYearNavigation, archiveYearsFor,
  isArchiveEligible,
} from "../lib/archive/archiveRegistry";
import {
  applyCarriedFilter, decodeCarriedFilter, encodeCarriedFilter,
} from "../lib/archive/archiveFilterCarry";
import { buildArchiveReviewRows } from "../lib/archive/archiveReviewFixture";
import { metricCapabilities, outcomeSpaceOf, REPETITION_REPORTABLE_MAX } from "../lib/archive/archiveMetrics";
import { gameConfigFor } from "../lib/game/gameConfigRegistry";
import { getCommunityData } from "../lib/community/bff/communityBff";
import { assertNeutralLanguage } from "../lib/game/digitHistoryAnalysis";
import { sitemapEntries } from "../lib/seo/sitemapEntries";
import { reviewDateFor } from "../lib/game/gameReviewDate";
import { buildAgenda, buildCalendarMonths, calendarMonthKeys } from "../lib/archive/archiveCalendar";
import {
  assessCoverage, combineSchedules, parseDrawDays, scheduleDrawsOn,
} from "../lib/archive/archiveSchedule";
import { buildArchiveCsv, escapeCsvField } from "../lib/archive/archiveDownload";
/* FD-GATE-01 archived the legacy shell along with the templates that used it. The assertion that reads this
   constant is about the ARCHIVED legacy header, so it follows the constant to its archived home. */
import { DEFAULT_SHELL_CAPABILITIES } from "../lib/archived/legacy/layout/shellCapabilities";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const codeOnly = (p: string) => src(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** The primary review archive. Built once per call so a mutation in one test cannot leak into another. */
const archive = (state = "fl", slug = "pick-3", year = 2026, preview = true): ArchiveViewModel => {
  const cfg = gameConfigFor(state, slug);
  assert.ok(cfg, `${state}/${slug} must have a game configuration`);
  const m = buildArchiveModel(state, slug, year, cfg!, preview);
  assert.ok(m, `${state}/${slug}/${year} must build an archive model`);
  return m!;
};

const maybeArchive = (state: string, slug: string, year = 2026): ArchiveViewModel | null => {
  const cfg = gameConfigFor(state, slug);
  if (!cfg) return null;
  return buildArchiveModel(state, slug, year, cfg, true);
};

/* ════════════════════════════════════════════════════════════════ route and guard */

describe("LRG-ARCHIVE-054: route and guard", () => {
  test("the archive route inventory comes from the registry, never from data", () => {
    /*
     * THE DEFECT THIS GUARDS. The first revision accepted any eligible game with any parseable year and 404'd
     * only when the fixture produced no rows, so `/fl/cash-pop/2026`, `/fl/lotto/2026`,
     * `/ca/superlotto-plus/2026` and `/fl/powerball/2026` all resolved 200. `CLAUDE.md` §10 forbids deriving
     * route existence from data, and the brief scopes this task to one archive page.
     */
    assert.deepEqual(archiveRoutePaths(), ["/fl/pick-3/2026"]);
    assert.equal(isArchiveEligible("fl", "pick-3", 2026), true);
    for (const [st, slug] of [["fl", "cash-pop"], ["fl", "lotto"], ["ca", "superlotto-plus"], ["fl", "powerball"]] as const) {
      assert.equal(isArchiveEligible(st, slug, 2026), false, `${st}/${slug}/2026 must not be a route`);
    }
    assert.equal(isArchiveEligible("fl", "pick-3", 2025), false, "an unconnected year is not a route");
  });

  test("the route consults the registry before building anything", () => {
    const code = codeOnly("app/[state]/[game]/[segment]/page.tsx");
    /* FD-GATE-01: expressed once, through the shared registry mechanism. */
    assert.match(code, /servesPage\("archive", state, game, parsed\)/);
    assert.match(code, /resolveGamePreview/);
    assert.match(code, /notFound\(\)/);
  });

  test("the guard is the game guard, and it is server-only", () => {
    const code = codeOnly("app/[state]/[game]/[segment]/page.tsx");
    assert.ok(!/NEXT_PUBLIC/.test(code), "a guard a visitor can flip is not a guard");
    assert.match(code, /from "@\/lib\/game\/gamePreviewGuard"/);
  });

  test("the archive emits a self-referencing canonical, on the existing origin constant", () => {
    /*
     * ══ SUPERSEDED, DELIBERATELY ══
     *
     * This asserted the opposite: brief §6 said *"do not emit a production canonical from synthetic review
     * content"*, so the route emitted none. `ROUTE-AUDIT-001` §9 recorded the consequence — *"the archive emits no
     * canonical at all … on ungating this must become a self-referencing canonical, or the archive ships as the one
     * indexable page with no canonical signal"* — and the active founder instruction (§A4) closes it now.
     *
     * It is safe now because the page is still `noindex, nofollow`: no canonical signal reaches a crawler, so no
     * synthetic row is nominated as authoritative for anything. Recorded in `source-conflicts.md`.
     *
     * WHAT IS STILL ASSERTED, and matters more than the tag itself: the value comes from `canonicalUrl`, so this
     * route inherits the repository's existing origin constant rather than introducing a second host or slash
     * convention. `FD-RTE-01`/`02`/`03` stay open.
     */
    const code = codeOnly("app/[state]/[game]/[segment]/page.tsx");
    assert.match(code, /alternates: \{ canonical: canonicalUrl\(/, "a self-referencing canonical is emitted");
    assert.match(code, /from "@\/lib\/seo\/productionOrigin"/, "the origin is the shared constant");
    /* No second host form, no literal URL, no request host. */
    assert.ok(!/https?:\/\//.test(code), "no literal origin may appear in the route");
    assert.match(code, /index: false/);
  });

  test("the archive path is absent from sitemap generation", () => {
    const urls = sitemapEntries({ includePreviewJurisdictions: true }).map((e) => e.url);
    for (const p of archiveRoutePaths()) {
      assert.ok(!urls.some((u) => u.endsWith(p)), `${p} must not be in the sitemap`);
    }
  });

  test("both depth-3 routes share one dynamic slug name", () => {
    /*
     * Next.js rejects two different slug names at the same dynamic depth — and it does so at REQUEST time, not
     * at build time. `[year]` beside `[section]` compiled cleanly and listed both routes, then every request
     * failed with "You cannot use different slug names for the same dynamic path". This test asserts the
     * resolution so the pair cannot be re-split by a later edit that only runs a build.
     */
    const archiveRoute = src("app/[state]/[game]/[segment]/page.tsx");
    const articleRoute = src("app/[state]/[game]/[segment]/[slug]/page.tsx");
    assert.match(archiveRoute, /segment: string/);
    assert.match(articleRoute, /segment: string/);
    assert.ok(!/section: string/.test(articleRoute), "the article route must read the shared slug name");
  });

  test("a year segment is parsed strictly, so no second URL resolves to the same archive", () => {
    assert.equal(parseArchiveYearSegment("2026"), 2026);
    for (const bad of ["026", "2026a", "+2026", "2026.0", " 2026", "20266", "", "abcd"]) {
      assert.equal(parseArchiveYearSegment(bad), null, `"${bad}" must not parse as a year`);
    }
  });

  test("a future year is not an archive", () => {
    const reviewYear = Number(reviewDateFor("fl").slice(0, 4));
    assert.equal(resolveArchiveYear("fl", reviewYear + 1), null);
    assert.equal(resolveArchiveYear("fl", reviewYear)?.mode, "YR-CURRENT");
    assert.equal(resolveArchiveYear("fl", reviewYear - 1)?.mode, "YR-CLOSED");
  });

  test("the archive year comes from the governed review date, never from the clock", () => {
    const code = codeOnly("lib/archive/archiveYear.ts");
    assert.ok(!/Date\.now\(\)/.test(code), "blueprint §3 forbids deriving the archive year from a clock");
    assert.ok(!/new Date\(\)/.test(code));
    assert.match(code, /resolveReviewDate/);
    const r = resolveArchiveYear("fl", 2026)!;
    assert.equal(r.reviewDateIso, reviewDateFor("fl"));
    /* July: only elapsed months of the current year can hold a drawing. */
    assert.equal(r.validMonths, Number(reviewDateFor("fl").slice(5, 7)));
  });
});

/* ════════════════════════════════════════════════════════════════ guard-off */

describe("LRG-ARCHIVE-054: guard-off leaks nothing", () => {
  test("no row, metric, brief or answer exists with the preview disabled", () => {
    const cfg = gameConfigFor("fl", "pick-3")!;
    const off = buildArchiveModel("fl", "pick-3", 2026, cfg, false);
    assert.ok(off, "the model still resolves — the ROUTE is what 404s");
    assert.equal(off!.rows.length, 0, "no fixture row may exist with the guard off");
    assert.equal(off!.brief, null, "no brief without rows");
    assert.equal(off!.notable.length, 0);
    assert.equal(off!.analysis.length, 0);
    assert.equal(off!.askAnswer.matchingCount, 0);
    assert.equal(off!.sectionState["AR-05"].render, false);
  });

  test("the fixture is barrier two, independent of the route", () => {
    const m = archive();
    const rows = buildArchiveReviewRows(
      false, "fl", "pick-3", 2026, 7,
      m.members.map((x) => ({ gameId: x.gameId, variantLabel: x.variantLabel, memberOrder: x.memberOrder })),
      m.profile, m.reviewDateIso,
    );
    assert.deepEqual(rows.rows, []);
    assert.equal(rows.provenance.total, 0);
  });

  test("a year with no real feed record produces no archive at all", () => {
    /*
     * THE DEFECT THIS GUARDS. Before the third barrier the generator produced a complete twelve-month archive
     * for ANY past year, because every date in 2019 is before the review date — `/fl/pick-3/2019` returned 200
     * with 96 fabricated rows and a status line describing a year this repository holds no data about.
     */
    const cfg = gameConfigFor("fl", "pick-3")!;
    for (const y of [2025, 2024, 2019]) {
      const m = buildArchiveModel("fl", "pick-3", y, cfg, true);
      assert.equal(m?.rows.length ?? 0, 0, `${y} has no captured record, so it must have no rows`);
    }
    assert.ok(archive().rows.length > 0, "the year that does have a record still works");
  });
});

/* ════════════════════════════════════════════════════════════════ page and content */

describe("LRG-ARCHIVE-054: page and content", () => {
  test("sections render in the founder's order, which overrides blueprint §6", () => {
    /*
     * ══ THE DEVIATION, ASSERTED ══
     *
     * Blueprint §6 puts results (AR-05) before search (AR-06) and the year brief (AR-03) fourth. The founder
     * direction of 2026-08-05 requires search above the results and every long-form section below them, because
     * the blueprint sequence measured at 4.4 screens to the first result and 10.2 to search on a 390 px viewport.
     *
     * AR-08 is absent because every tool it would list either already exists elsewhere on the page or is not
     * built, and the roadmap cards are gone.
     */
    const m = archive();
    const rendered = AR_ORDER.filter((id) => m.sectionState[id]?.render === true);
    assert.deepEqual(rendered, [
      "AR-01", "AR-04", "AR-06", "AR-05", "AR-03", "AR-02", "AR-07", "AR-09", "AR-10", "AR-11", "Footer",
    ]);

    /* Search precedes results, and the year brief follows them. */
    assert.ok(AR_ORDER.indexOf("AR-06") < AR_ORDER.indexOf("AR-05"));
    assert.ok(AR_ORDER.indexOf("AR-03") > AR_ORDER.indexOf("AR-05"));
    assert.ok(AR_ORDER.indexOf("AR-04") < AR_ORDER.indexOf("AR-06"));

    /* The blueprint order is retained verbatim, so the deviation stays diffable. */
    assert.equal(AR_ORDER_BLUEPRINT.indexOf("AR-05") < AR_ORDER_BLUEPRINT.indexOf("AR-06"), true);
    assert.notDeepEqual([...AR_ORDER], [...AR_ORDER_BLUEPRINT]);
  });

  test("advertisement anchors keep their governed positions in code and render nothing", () => {
    /*
     * ══ REVISED BY §A4 ══
     *
     * This asserted the anchors were ABSENT from `AR_ORDER` and present only in `AR_ORDER_BLUEPRINT`. That kept
     * them out of the sequence the composition actually walks, which `CLAUDE.md` §12 does not allow: a governed
     * position that only documentation knows about is one the next reorder re-derives silently.
     *
     * They are now IN `AR_ORDER`, resolving to `NO_APPROVED_ARCHIVE_PROFILE` — the same typed-empty pattern the
     * Game Page and the flagship hubs use. What has NOT changed is the thing that mattered: nothing is drawn, and
     * the V0's visible "Not rendered in this review" list naming the anchors and `lc_gh_*` stays gone. Both halves
     * are asserted below.
     */
    for (const id of AR_AD_ANCHORS) {
      assert.ok(AR_ORDER.includes(id), `${id} must be a governed position in the render sequence`);
      /* Every one resolves to nothing, with the profile's recorded gap as the reason. */
      assert.equal(archive().sectionState[id]?.render, false, `${id} must draw nothing`);
    }
    /* The profile is typed-empty and says why, so the dependency is reported rather than worked around. */
    const ads = archive().ads;
    assert.equal(ads.placements.length, 0, "no archive slot is approved, so none may be active");
    assert.match(ads.id, /^none-pending/);
    assert.match(ads.gap, /lc_gh_\*/);
    assert.deepEqual([...ads.anchors], [...AR_AD_ANCHORS]);
    /* No anchor sits inside a protected region (blueprint §7): each is between two content blocks. */
    for (const id of AR_AD_ANCHORS) {
      const i = AR_ORDER.indexOf(id);
      assert.ok(i > 0, `${id} must never be the first position`);
    }
    /* AD-AR00 follows the complete results section, never interrupting it. */
    assert.ok(AR_ORDER.indexOf("AD-AR00") > AR_ORDER.indexOf("AR-05"));
    /* AD-AR02 still precedes the editorial block, exactly as blueprint §6 places it. */
    assert.ok(AR_ORDER.indexOf("AD-AR02") < AR_ORDER.indexOf("AR-09"));
    /* AD-AR03 is still last before the footer. */
    assert.equal(AR_ORDER.indexOf("AD-AR03"), AR_ORDER.indexOf("Footer") - 1);

    for (const id of AR_AD_ANCHORS) {
      assert.ok(AR_ORDER_BLUEPRINT.includes(id), `${id} must stay in the governed blueprint sequence`);
    }
    /* `codeOnly`, not `src`: the composition's header comment legitimately explains the anchors, and a comment is
       not something a reader sees. The assertion is about rendered output, so it reads code. */
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.ok(!/AD-AR/.test(view), "no ad anchor id may reach the composition");
    assert.ok(!/lc_gh_/.test(view), "no GAM slot id may reach the composition");
  });

  test("the first viewport identifies the game, the year, the status and the source", () => {
    const m = archive();
    assert.equal(m.h1, "Florida Pick 3 Results 2026 — Year to Date");
    assert.match(m.supportingCopy, /Midday and Evening/);
    assert.match(m.statusLine, /^52 drawings from .* through /);
    /* §A7: one shared "Last updated" shape across all five families. */
    assert.match(m.sourceLine, /^Last updated .* · Florida Lottery results feed$/);
    assert.match(m.ruleEraLabel, /in force since/);
  });

  test("Midday and Evening stay independent records in configured order", () => {
    const m = archive();
    assert.deepEqual(m.members.map((x) => [x.gameId, x.variantLabel, x.memberOrder]), [
      [332, "Midday", 0], [333, "Evening", 1],
    ]);
    /* No row merges two members, and each keeps its own production game id. */
    const ids = new Set(m.rows.map((r) => r.gameId));
    assert.deepEqual([...ids].sort(), [332, 333]);

    /* Within one date the configured order holds — never alphabetical, never by game id coincidence. */
    const byDate = new Map<string, ArchiveDrawRow[]>();
    for (const r of m.rows) byDate.set(r.drawDateIso, [...(byDate.get(r.drawDateIso) ?? []), r]);
    let checkedMultiRowDates = 0;
    for (const [date, list] of byDate) {
      if (list.length < 2) continue;
      checkedMultiRowDates++;
      const orders = list.map((r) => r.memberOrder);
      assert.deepEqual(orders, [...orders].sort((a, b) => a - b), `${date} rows are out of configured order`);
    }
    assert.ok(checkedMultiRowDates > 0, "at least one date must carry both members, or this proves nothing");
  });

  test("every row keeps its supplied value order", () => {
    const m = archive();
    for (const r of m.rows) {
      const mainGroup = r.groups.find((g) => g.role === "main");
      assert.ok(mainGroup, "every row has a main group");
      assert.deepEqual([...mainGroup!.values], [...r.mainValues], "the rendered group must be the stored order");
    }
  });

  test("News, Guides and Blogs are visible groups with real destinations", () => {
    const m = archive();
    const kinds = m.editorial.map((g) => g.kind);
    for (const k of ["News", "Guides", "Blogs"] as const) {
      assert.ok(kinds.includes(k), `${k} must be a group`);
    }
    for (const g of m.editorial) {
      for (const i of g.items) {
        assert.ok(i.href, `${g.kind} item "${i.title}" must have a real destination`);
        /* The Blogs segment is `blog`, singular — read from `gameEditorial`'s own map rather than assumed.
           Community items are the corpus's own threads, so their destinations are `/community/{slug}`
           (registry-served since commit a39bdfe — see the community test below). */
        assert.match(
          i.href!,
          g.kind === "Community" ? /^\/community\/[a-z0-9-]+$/ : /^\/fl\/pick-3\/(news|guides|blog)\//,
        );
      }
      if (g.items.length === 0) assert.ok(g.emptyStatement, `${g.kind} must state its absence honestly`);
    }
  });

  test("community discussions are the corpus's own threads, never fabricated here", () => {
    /*
     * UPDATED DELIBERATELY — this asserted an empty group ("no discussion may be invented") while no
     * community service existed. The Community family now serves `/community/{slug}` from the registry
     * (commit a39bdfe, Conflict 41 FOUNDER AMENDMENT), satisfying `FD-ACC-10`'s
     * hidden-because-no-forum condition by construction, so AR-09's designated slot carries the corpus's
     * REAL Florida Pick 3 threads. What may still never happen: an item that does not exist in the corpus,
     * or a count that is not the thread's own.
     */
    const m = archive();
    const community = m.editorial.find((g) => g.kind === "Community");
    assert.ok(community);
    assert.ok(community!.items.length > 0, "the designated slot is filled from the corpus");
    const entries = new Map(getCommunityData().entries.map((e) => [e.slug, e]));
    for (const i of community!.items) {
      const e = entries.get(i.href!.split("/").pop()!);
      assert.ok(e, `"${i.title}" must be a corpus thread`);
      assert.equal(i.title, e!.title, "the title is the thread's own");
      assert.match(i.dateLine ?? "", new RegExp(`^${e!.replies.length} repl(y|ies)`), "the count is the thread's own");
    }
  });

  test("sources and methodology appear once, with no repeated official-site warning", () => {
    const m = archive();
    assert.equal(m.sectionState["AR-10"].render, true);
    const all = [
      m.supportingCopy, m.statusLine, m.sourceLine, m.coverage.statement,
      ...m.metrics.map((x) => `${x.label} ${x.note ?? ""}`),
      ...m.coverage.fields.map((f) => f.coverage),
    ].join(" ");
    const officialSite = all.match(/official (site|website)/gi) ?? [];
    assert.equal(officialSite.length, 0, `repeated official-site warnings are forbidden: ${officialSite.length}`);
  });

  test("export exists as a signed-in action, and still publishes no bulk file or API", () => {
    /*
     * UPDATED DELIBERATELY — this asserted `available: false` with a "not approved" statement while the
     * export surfaces were removed. `FD-DAT-16` named its own restoration condition ("when the real shared
     * Account and sign-in continuation flow works end to end") and Conflict 37 (2026-08-11) met it, so the
     * provided CSV download is BACK as a free signed-in action (`FD-DAT-01`/`FD-DAT-04`). What must stay
     * true: no bulk file, no API endpoint (`FD-DAT-14`), and the statement says so.
     */
    const m = archive();
    assert.equal(m.coverage.exportStatus.available, true);
    assert.match(m.coverage.exportStatus.statement, /Signed-in members/);
    assert.match(m.coverage.exportStatus.statement, /free/);
    assert.match(m.coverage.exportStatus.statement, /No bulk file and no API access/);
    /* Blueprint §32 and brief §8: Dataset/DataDownload markup is prohibited until a governed dataset exists.
       A gated per-reader download is not a governed public dataset, so this stands. */
    const view = src("components/archive/ArchiveView.tsx");
    assert.ok(!/DataDownload|"Dataset"/.test(view), "no Dataset structured data may be emitted");
  });

  test("no prize, jackpot or financial figure appears on a historical row", () => {
    const m = archive();
    for (const r of m.rows) {
      assert.ok(!("topPrize" in r), "a row carries no prize figure");
    }
    const prizeField = m.coverage.fields.find((f) => f.field === "Prize amounts");
    assert.ok(prizeField, "the absence of prize data is stated");
    assert.equal(prizeField!.supportsMetrics, false);
  });
});

/* ════════════════════════════════════════════════════════════════ months */

describe("LRG-ARCHIVE-054: month navigation", () => {
  test("only elapsed months are valid in a current year, and the latest is open by default", () => {
    const m = archive();
    const reviewMonth = Number(reviewDateFor("fl").slice(5, 7));
    for (const mo of m.months) {
      assert.equal(mo.valid, mo.month <= reviewMonth, `${mo.label} validity`);
    }
    assert.equal(m.defaultMonthKey, monthKeyOf(2026, reviewMonth));
  });

  test("month counts equal the rows in that month", () => {
    const m = archive();
    for (const mo of m.months) {
      const actual = m.rows.filter((r) => r.monthKey === mo.monthKey).length;
      assert.equal(mo.drawCount, actual, `${mo.label} count`);
    }
    assert.equal(m.months.reduce((a, b) => a + b.drawCount, 0), m.rows.length);
  });

  test("correction and rule-change markers appear only for a genuine sourced correction", () => {
    const m = archive();
    for (const mo of m.months) {
      const genuine = m.rows.some((r) => r.monthKey === mo.monthKey && isGenuineCorrection(r.correction));
      assert.equal(mo.hasCorrection, genuine, `${mo.label} correction marker`);
    }
    /* The fixture's correction has no source, so no month may be marked today. */
    assert.equal(m.months.filter((mo) => mo.hasCorrection).length, 0);
    /* Pick 3's era began 2021-01-18, so no 2026 month may claim a rule change. */
    assert.equal(m.months.filter((mo) => mo.hasRuleChange).length, 0);
  });

  test("month filtering changes the rows and every dependent figure", () => {
    const m = archive();
    const target = m.months.find((mo) => mo.valid && mo.drawCount > 0 && mo.drawCount < m.rows.length)!;
    const r = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), monthKey: target.monthKey });
    assert.equal(r.rows.length, target.drawCount);
    for (const row of r.rows) assert.equal(row.monthKey, target.monthKey);
    assert.ok(r.rows.length < m.rows.length, "the filter must actually narrow the set");
    assert.match(r.statement, new RegExp(`${r.rows.length} of ${m.rows.length} drawings match`));
  });
});

/* ════════════════════════════════════════════════════════════════ search */

describe("LRG-ARCHIVE-054: search and filters", () => {
  const filterFor = (over: Partial<ReturnType<typeof defaultArchiveFilter>>) => {
    const m = archive();
    return { m, r: filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), ...over }) };
  };

  test("exact-order search distinguishes 123 from 321", () => {
    const m = archive();
    /* Driven from a real row, so the assertion cannot be vacuous. */
    const row = m.rows.find((x) => new Set(x.mainValues).size === 3)!;
    const forward = row.mainValues.join("");
    const reversed = [...row.mainValues].reverse().join("");
    assert.notEqual(forward, reversed, "the sample row must not be a palindrome");

    const hit = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: [forward] }, orderMode: "exact" });
    assert.ok(hit.rows.some((x) => x.anchorId === row.anchorId), "the exact order must match");

    const miss = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: [reversed] }, orderMode: "exact" });
    assert.ok(!miss.rows.some((x) => x.anchorId === row.anchorId), "the reversed order must not match in exact mode");
  });

  test("any-order search finds the permutation the exact search rejected", () => {
    const m = archive();
    const row = m.rows.find((x) => new Set(x.mainValues).size === 3)!;
    const reversed = [...row.mainValues].reverse().join("");
    const any = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: [reversed] }, orderMode: "any" });
    assert.ok(any.rows.some((x) => x.anchorId === row.anchorId), "any order must match a permutation");
  });

  test("any-order respects repeated values as a multiset, not a set", () => {
    /*
     * The subtle one. `112` in any order matches `121` and `211` but NOT `122`: a value drawn once and selected
     * twice counts once. A set comparison would wrongly match, which is why the shared multiset helper is reused
     * rather than reimplemented here.
     */
    const m = archive();
    const double = m.rows.find((x) => x.shape === "double");
    assert.ok(double, "the fixture must contain a double, or this proves nothing");
    const values = [...double!.mainValues];
    const permuted = [values[1], values[0], values[2]].join("");
    const hit = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: [permuted] }, orderMode: "any" });
    assert.ok(hit.rows.some((x) => x.anchorId === double!.anchorId));

    /* A different multiset must not match: replace the repeated value with one that is not in the row. */
    const repeated = values.find((v, i) => values.indexOf(v) !== i)!;
    const absent = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((d) => !values.includes(d))!;
    const otherMultiset = values.map((v) => (v === repeated ? absent : v)).join("");
    const miss = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: [otherMultiset] }, orderMode: "any" });
    assert.ok(!miss.rows.some((x) => x.anchorId === double!.anchorId), "a different multiset must not match");
  });

  test("a leading zero survives to the parser", () => {
    const m = archive();
    const r = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: ["007"] }, orderMode: "exact" });
    assert.deepEqual(r.errors, {}, "007 must parse");
    assert.equal(r.numberApplied, true);
    /* And it is a different condition from 700 — the distinction a `type="number"` input would destroy. */
    const other = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: ["700"] }, orderMode: "exact" });
    assert.notEqual(
      r.rows.map((x) => x.anchorId).join(),
      other.rows.map((x) => x.anchorId).join() + "x",
    );
    const view = src("components/archive/ArchiveWorkspace.tsx");
    assert.match(view, /type="text"/, "a number input would strip the leading zero");
  });

  test("variant filtering supports both, and each member alone", () => {
    const { m } = filterFor({});
    const both = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), variant: "all" });
    assert.equal(both.rows.length, m.rows.length);
    for (const mem of m.members) {
      const one = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), variant: { gameId: mem.gameId } });
      assert.equal(one.rows.length, mem.drawCount);
      for (const row of one.rows) assert.equal(row.gameId, mem.gameId);
    }
  });

  test("shape and sum conditions narrow the set", () => {
    const m = archive();
    const doubles = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), shape: "double" });
    assert.ok(doubles.rows.length > 0);
    for (const r of doubles.rows) assert.equal(r.shape, "double");

    const banded = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), sumFrom: 5, sumTo: 10 });
    for (const r of banded.rows) {
      assert.ok(r.sum !== null && r.sum >= 5 && r.sum <= 10, `sum ${r.sum} is outside the band`);
    }
  });

  test("sort order flips the rows without touching the values", () => {
    const m = archive();
    const newest = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), sort: "newest" });
    const oldest = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), sort: "oldest" });
    assert.equal(newest.rows.length, oldest.rows.length);
    assert.equal(newest.rows[0].drawDateIso, oldest.rows[oldest.rows.length - 1].drawDateIso);
    /* The values inside the first row are identical in both orders — only records were reordered. */
    const a = newest.rows[0], b = oldest.rows[oldest.rows.length - 1];
    if (a.anchorId === b.anchorId) assert.deepEqual([...a.mainValues], [...b.mainValues]);
  });

  test("excluding corrected drawings removes exactly the corrected row", () => {
    const m = archive();
    const without = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), includeCorrected: false });
    assert.equal(without.rows.length, m.rows.length - m.rows.filter((r) => r.corrected).length);
    assert.ok(!without.rows.some((r) => r.corrected));
  });

  test("the add-on is a declared special value, never a fourth main digit", () => {
    const m = archive();
    const addOn = m.profile.groups.find((g) => g.role === "addOn");
    assert.ok(addOn, "Pick 3 has a drawn add-on");
    assert.equal(m.profile.main!.count, 3, "the main group stays three values");
    for (const r of m.rows) {
      assert.equal(r.mainValues.length, 3, "the add-on never joins the main values");
      const mainGroup = r.groups.find((g) => g.role === "main")!;
      assert.equal(mainGroup.values.length, 3);
    }
    /* It never becomes a search input either — it widens a match rather than constraining one. */
    const r = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { [addOn!.key]: ["5"] } });
    assert.equal(r.numberApplied, false, "an add-on entry is not a main-number condition");
  });

  test("a partial number entry is an error, not a silent empty result", () => {
    const m = archive();
    const r = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), raw: { main: ["12"] } });
    assert.ok(Object.keys(r.errors).length > 0, "an incomplete entry must say so");
  });
});

/* ════════════════════════════════════════════════════════════════ Ask the Archive */

describe("LRG-ARCHIVE-054: Ask the Archive", () => {
  test("one complete public answer exists in the model, before any interaction", () => {
    const m = archive();
    const a = m.askAnswer;
    assert.ok(a.question.length > 0);
    assert.ok(a.understood);
    assert.ok(a.interpretation.length >= 3, "game, year and at least one condition");
    assert.equal(a.interpretation[0].label, "Game");
    assert.equal(a.interpretation[1].label, "Year");
    assert.ok(a.matchingCount >= 0);
    assert.ok(a.explanation.length > 0);
    assert.ok(a.evidence.length > 0);
    assert.ok(a.neutrality.length > 0);
  });

  test("the answer's count comes from the same deterministic filter the controls use", () => {
    const m = archive();
    const interp = interpretArchiveQuestion(m.askAnswer.question, m.profile, m.members, 2026);
    const direct = filterArchive(m.rows, m.profile, interp.filter);
    assert.equal(direct.rows.length, m.askAnswer.matchingCount, "AI must not compute a different number");
  });

  test("it interprets a month, a variant, a number and a shape from this game's own vocabulary", () => {
    const m = archive();
    const withMonth = askArchive("Show all Midday doubles in March.", m.rows, m.profile, m.members, 2026, "Florida Pick 3");
    const labels = withMonth.interpretation.map((i) => i.label);
    assert.ok(labels.includes("Month"));
    assert.ok(labels.includes("Drawing"));
    assert.ok(labels.includes("Result shape"));
    for (const r of withMonth.rows) {
      assert.equal(r.monthKey, "2026-03");
      assert.equal(r.variantLabel, "Midday");
      assert.equal(r.shape, "double");
    }
  });

  test("an uninterpretable question says so instead of inventing an interpretation", () => {
    const m = archive();
    const a = askArchive("what is the weather", m.rows, m.profile, m.members, 2026, "Florida Pick 3");
    assert.equal(a.understood, false);
    assert.equal(a.rows.length, 0);
    assert.equal(a.matchingCount, 0);
    assert.ok(a.suggestions.length > 0, "content template Template G requires suggestions");
    assert.match(a.explanation, /could be interpreted/);
  });

  test("nothing claims a live model produced the answer", () => {
    /*
     * ══ AMENDED by `DATA-DEC-001` `FD-DAT-20` (2026-08-06) ══
     *
     * The brief's disclaimer and its AI label are both gone. `FD-DAT-20` rules the AR-03 brief a deterministic
     * summary over public archive statistics, not an AI execution — so there was never a model to identify, and
     * describing the surface as AI (or as not-AI) misdescribes it either way.
     *
     * `INTERPRETER_DISCLOSURE` is unchanged: it belongs to the Ask interpreter, which really would answer a
     * reader's question, and which `FD-DAT-02` has gated and removed from the page.
     */
    const m0 = archive();
    assert.match(INTERPRETER_DISCLOSURE, /not a live AI model/);
    assert.ok(!/\bAI\b/.test(m0.brief!.label), "the brief label does not describe itself as AI");
    assert.ok(!/\bAI\b/i.test(m0.brief!.generation), "and neither claims nor disclaims a model");
    /* What must remain is the positive provenance statement. */
    assert.match(m0.brief!.generation, /drawings listed on this page/);
  });

  test("suggested prompts are generated from this game's format and have answers", () => {
    const m = archive();
    assert.ok(m.askPrompts.length >= 2);
    for (const p of m.askPrompts) {
      const i = interpretArchiveQuestion(p, m.profile, m.members, 2026);
      assert.ok(i.understood, `the suggested prompt "${p}" must be interpretable`);
    }
    /* The first prompt uses a value from a real row, so it returns a match rather than teaching a dead end. */
    const first = askArchive(m.askPrompts[0], m.rows, m.profile, m.members, 2026, "Florida Pick 3");
    assert.ok(first.matchingCount > 0, `"${m.askPrompts[0]}" should find its own source row`);
  });

  test("a date in the question is not mistaken for a number selection", () => {
    const m = archive();
    /* `2026` is four digits; a three-digit game must not read it as a selection. */
    const a = askArchive("Show Evening drawings in 2026", m.rows, m.profile, m.members, 2026, "Florida Pick 3");
    assert.ok(!a.interpretation.some((i) => i.label === "Number"), "a year is not a number selection");
  });
});

/* ════════════════════════════════════════════════════════════════ metrics and analysis */

describe("LRG-ARCHIVE-054: metrics, analysis and notability", () => {
  test("AR-02 shows at most six metrics, each with a date range", () => {
    const m = archive();
    assert.ok(m.metrics.length > 0 && m.metrics.length <= 6, `got ${m.metrics.length}`);
    for (const x of m.metrics) {
      assert.ok(x.range.length > 0, `${x.key} must state its date range`);
      assert.ok(x.value.length > 0);
    }
  });

  test("public statistics include position frequency, variant comparison, shape and sum distribution", () => {
    const m = archive();
    const keys = m.analysis.map((v) => v.key);
    assert.ok(keys.includes("number-frequency"), "number frequency by position");
    assert.ok(keys.includes("variant-comparison"), "drawing comparison");
    assert.ok(keys.includes("shape-distribution"), "repeated digits");
    assert.ok(keys.includes("sum-distribution"), "sum distribution");
    assert.ok(keys.includes("pair-front") && keys.includes("pair-back"), "front and back pairs");
    assert.ok(keys.includes("previous-repeat"), "previous-draw repeats");

    /*
     * EXACTLY the four primary insights the founder named, and no more.
     *
     * The V0 rendered nine tables at equal prominence, and a first attempt at this fix still produced six because
     * each of the three position tables was primary. They are one combined view now.
     */
    const primary = m.analysis.filter((v) => v.primary).map((v) => v.key);
    assert.deepEqual(primary.sort(), ["number-frequency", "shape-distribution", "sum-distribution", "variant-comparison"]);
    assert.ok(m.analysis.some((v) => !v.primary), "the deeper views still exist, disclosed rather than removed");
  });

  test("every analysis view exposes period, variants, draw count and method", () => {
    const m = archive();
    for (const v of m.analysis) {
      assert.ok(v.period.length > 0, `${v.key} period`);
      assert.ok(v.variants.length > 0, `${v.key} variants`);
      assert.ok(v.drawCount > 0, `${v.key} draw count`);
      assert.ok(v.method.length > 0, `${v.key} method`);
      assert.ok(v.rows.length > 0, `${v.key} must have table rows — a chart is never the only form`);
    }
  });

  test("variant comparison is ordered by configured order, not by game id or label", () => {
    const m = archive();
    const view = m.analysis.find((v) => v.key === "variant-comparison")!;
    assert.deepEqual(view.rows.map((r) => r.label), ["Midday", "Evening"]);
    /* Alphabetical would be Evening, Midday. Naming the wrong-answer explicitly is the point of the test. */
    assert.notDeepEqual(view.rows.map((r) => r.label), ["Evening", "Midday"]);
  });

  test("at most five notable draws, each with a deterministic reason and an evidence anchor", () => {
    const m = archive();
    assert.ok(m.notable.length > 0 && m.notable.length <= 5, `got ${m.notable.length}`);
    const anchors = new Set(m.rows.map((r) => r.anchorId));
    for (const n of m.notable) {
      assert.ok(n.reason.length > 0);
      assert.ok(n.metric.length > 0);
      assert.ok(n.value.length > 0);
      assert.ok(anchors.has(n.evidenceAnchor), `${n.metric} must point at a real row`);
    }
  });

  test("the year brief carries three to five observations, each with its figure and evidence link", () => {
    const m = archive();
    const b = m.brief!;
    assert.ok(b.points.length >= 3 && b.points.length <= 5, `got ${b.points.length}`);
    for (const p of b.points) {
      assert.ok(p.text.length > 0);
      assert.ok(p.evidence.length > 0, "an observation without its figure is not evidence-backed");
      assert.match(p.evidenceHref, /^#/);
    }
    assert.ok(b.evidenceLine.includes(String(m.rows.length)));
  });

  test("a tie is described as a tie, not as a distinction", () => {
    /* The first version claimed "January holds the most drawings, with 8" while six months each held 8. */
    const m = archive();
    const monthPoint = m.brief!.points.find((p) => p.evidenceHref === "#ar-04")!;
    const counts = m.months.filter((x) => x.drawCount > 0).map((x) => x.drawCount);
    const top = Math.max(...counts);
    const tied = counts.filter((c) => c === top).length;
    if (tied > 1) assert.match(monthPoint.text, /spread evenly/);
    else assert.match(monthPoint.text, /holds the most/);
  });

  test("every produced string passes the neutral-language rule", () => {
    const m = archive();
    const strings = [
      m.h1, m.supportingCopy, m.statusLine, m.sourceLine, m.ruleEraLabel,
      m.coverage.statement, m.coverage.exportStatus.statement, m.neutrality,
      m.askAnswer.explanation, m.askAnswer.neutrality,
      ...m.metrics.flatMap((x) => [x.label, x.value, x.note ?? ""]),
      ...m.brief!.points.flatMap((p) => [p.text, p.evidence]),
      ...m.brief!.points.map(() => m.brief!.generation),
      ...m.analysis.flatMap((v) => [v.title, v.method]),
      ...m.notable.flatMap((n) => [n.reason, n.metric]),
      ...m.tools.flatMap((t) => [t.title, t.summary]),
      ...m.editorial.flatMap((g) => [g.heading, g.emptyStatement ?? ""]),
      ...m.nextActions.flatMap((a) => [a.label, a.note ?? ""]),
    ];
    assert.ok(strings.length > 60, "the sweep must actually cover the page");
    assertNeutralLanguage(strings);
  });
});

/* ════════════════════════════════════════════════════════════════ tools and entitlement */

describe("LRG-ARCHIVE-054: truthful access labels", () => {
  test("AR-08 is reserved and offers nothing, because its content needs an account", () => {
    /*
     * ══ SUPERSEDED BY `ACCT-DEC-001` `FD-ACC-08` ══
     *
     * This asserted `m.tools.length > 0` and that none claimed sign-in persistence — right when AR-08 held three
     * public "tools". Two of those were anchors to AR-06 and AR-07 on the same page and the third linked to the game
     * page, so the section was navigation furniture rather than a tool launcher.
     *
     * `FD-ACC-08` reserves AR-08 for Personal Archive Tools, whose real content is gated by `FD-ACC-06`. The section
     * is therefore empty and suppressed with a stated reason — and `FD-ACC-07` requires that absence to be genuine
     * rather than filled with something else.
     */
    const m = archive();
    assert.deepEqual([...m.tools], [], "AR-08 offers nothing until an account foundation exists");
    assert.equal(m.sectionState["AR-08"].render, false);
    const state = m.sectionState["AR-08"];
    assert.ok(state.render === false && /account/i.test(state.reason), "the reason names the dependency");
  });

  test("no unavailable roadmap capability reaches the page", () => {
    /*
     * The V0 listed Compare years, Archive Explorer, Rule-era comparison and Download/report, each badged
     * `Planned`. Founder direction: *"Do not display disabled or unavailable cards"*, and keep the roadmap in
     * documentation. Every tool the model produces now works.
     */
    const m = archive();
    for (const t of m.tools) {
      assert.equal(t.access, "public", `${t.key} must work to appear at all`);
      assert.ok(t.href !== null || t.fragment !== null, `${t.key} must go somewhere`);
    }
    assert.ok(!m.tools.some((t) => t.access === "planned"));
    /* And no Continue action carries a "not available yet" note. */
    for (const a of m.nextActions) {
      assert.equal(a.note, null, `"${a.label}" must not explain why it does not work`);
      assert.ok(a.href !== null || a.fragment !== null, `"${a.label}" must go somewhere`);
    }
  });

  test("no Save, Follow, alert or Buy action is offered", () => {
    const m = archive();
    const labels = m.nextActions.map((a) => a.label.toLowerCase()).join(" | ");
    for (const forbidden of ["save", "follow", "alert", "buy"]) {
      assert.ok(!labels.includes(forbidden), `"${forbidden}" must not appear: ${labels}`);
    }
  });
});

/* ════════════════════════════════════════════════════════════════ generalization */

describe("LRG-ARCHIVE-054: the model is generic, proven on four format shapes", () => {
  /*
   * These games have NO archive route — brief Phase 4 forbids creating one for a proof case — so they are driven
   * through `buildArchiveModel` directly. That separation is exactly what the archive registry makes possible.
   */
  const PROOFS = [
    { st: "fl", slug: "pick-3", shape: "ordered digits, two variants" },
    { st: "fl", slug: "cash-pop", shape: "single value, five variants" },
    { st: "fl", slug: "lotto", shape: "unordered pool, single member" },
    { st: "ca", slug: "superlotto-plus", shape: "unordered pool with a special ball" },
  ] as const;

  test("every proof shape builds a model through the same function", () => {
    for (const p of PROOFS) {
      const m = maybeArchive(p.st, p.slug);
      assert.ok(m, `${p.st}/${p.slug} (${p.shape}) must build`);
      assert.ok(m!.rows.length > 0, `${p.st}/${p.slug} must have rows`);
    }
  });

  test("a single-value game contains no digit-position vocabulary", () => {
    const m = maybeArchive("fl", "cash-pop")!;
    assert.equal(m.profile.main!.count, 1);
    const text = [
      ...m.metrics.flatMap((x) => [x.label, x.note ?? ""]),
      ...m.analysis.flatMap((v) => [v.title, v.method]),
      ...m.brief?.points.map((p) => p.text) ?? [],
      ...m.notable.map((n) => n.reason),
    ].join(" ");
    assert.ok(!/digit/i.test(text), `a one-number game must not speak of digits: ${text.slice(0, 200)}`);
    assert.ok(!/position/i.test(text), "position frequency is meaningless for one drawn value");
    /* And no shape, sum or repeat metric, because none of them exist for a single value. */
    assert.ok(!m.metrics.some((x) => x.key === "doubles" || x.key === "triples"));
    assert.ok(!m.analysis.some((v) => v.key.startsWith("position-") || v.key === "sum-distribution"));
    for (const r of m.rows) {
      assert.equal(r.shape, "notApplicable");
      assert.equal(r.sum, null);
    }
  });

  test("a single-value game still keeps all five of its variants, in configured order", () => {
    const m = maybeArchive("fl", "cash-pop")!;
    assert.equal(m.members.length, 5);
    assert.deepEqual(m.members.map((x) => x.variantLabel), ["Morning", "Matinee", "Afternoon", "Evening", "Late Night"]);
    assert.ok(m.analysis.some((v) => v.key === "variant-comparison"), "five variants are still compared");
  });

  test("an unordered pool offers no exact-position control", () => {
    for (const slug of ["lotto"]) {
      const m = maybeArchive("fl", slug)!;
      assert.equal(m.profile.main!.semantics.matchOrdered, false);
      assert.equal(m.profile.ordered, false);
      /* Position frequency is suppressed, because positions are not how this game matches. */
      assert.ok(!m.analysis.some((v) => v.key.startsWith("position-")), "no positional analysis for a pool draw");
      assert.ok(!m.analysis.some((v) => v.key.startsWith("pair-")), "no ordered-pair analysis for a pool draw");
      /* And no double/triple metric, because a pool draws without replacement. */
      assert.ok(!m.metrics.some((x) => x.key === "doubles"));
      for (const r of m.rows) assert.equal(r.shape, "notApplicable");
    }
  });

  test("an unordered pool suppresses exact-repetition metrics whose outcome space is astronomical", () => {
    const lotto = maybeArchive("fl", "lotto")!;
    assert.ok(outcomeSpaceOf(lotto.profile) > REPETITION_REPORTABLE_MAX);
    assert.ok(!lotto.metrics.some((x) => x.key === "uniqueResults"),
      "'unique results: 26 of 26' is arithmetic, not an observation");

    const pick3 = archive();
    assert.ok(outcomeSpaceOf(pick3.profile) <= REPETITION_REPORTABLE_MAX);
    assert.ok(pick3.metrics.some((x) => x.key === "uniqueResults"), "a 1,000-outcome game can genuinely repeat");
  });

  test("a special ball is a separate group, compared separately", () => {
    const m = maybeArchive("ca", "superlotto-plus")!;
    const special = m.profile.extraGroups.find((g) => g.role === "special");
    assert.ok(special, "SuperLotto Plus has a Mega Ball");
    for (const r of m.rows) {
      assert.equal(r.mainValues.length, 5, "the special ball never joins the main values");
      const onRow: ArchiveDrawRow["groups"][number] | undefined =
        r.groups.find((g) => g.key === special!.key);
      if (onRow) assert.equal(onRow.values.length, 1);
    }
    /* A full main match with the wrong special ball is not a match for the described ticket. */
    const row = m.rows.find((r) => r.groups.some((g) => g.key === special!.key))!;
    const drawnSpecial = row.groups.find((g) => g.key === special!.key)!.values[0];
    const wrong = drawnSpecial === special!.max ? special!.min : drawnSpecial + 1;
    const right = filterArchive(m.rows, m.profile, {
      ...defaultArchiveFilter(),
      raw: { main: row.mainValues.map(String), [special!.key]: [String(drawnSpecial)] },
    });
    const wrongOne = filterArchive(m.rows, m.profile, {
      ...defaultArchiveFilter(),
      raw: { main: row.mainValues.map(String), [special!.key]: [String(wrong)] },
    });
    assert.ok(right.rows.some((x) => x.anchorId === row.anchorId), "the right special ball matches");
    assert.ok(!wrongOne.rows.some((x) => x.anchorId === row.anchorId), "the wrong special ball must not match");
  });

  test("a single-member family renders no variant column and no variant comparison", () => {
    const m = maybeArchive("fl", "lotto")!;
    assert.equal(m.members.length, 1);
    assert.ok(!m.analysis.some((v) => v.key === "variant-comparison"), "one member is not a comparison");
    assert.ok(!m.metrics.some((x) => x.key === "variantCounts"));
  });

  test("metric capability gating is driven by the format, for every proof shape", () => {
    const expected: Record<string, { multiValue: boolean; repeats: boolean; positional: boolean }> = {
      "fl/pick-3": { multiValue: true, repeats: true, positional: true },
      "fl/cash-pop": { multiValue: false, repeats: false, positional: false },
      "fl/lotto": { multiValue: true, repeats: false, positional: false },
      "ca/superlotto-plus": { multiValue: true, repeats: false, positional: false },
    };
    for (const [pair, want] of Object.entries(expected)) {
      const [st, slug] = pair.split("/");
      const m = maybeArchive(st, slug)!;
      const caps = metricCapabilities(m.profile, m.members.length);
      assert.equal(caps.multiValue, want.multiValue, `${pair} multiValue`);
      assert.equal(caps.repeats, want.repeats, `${pair} repeats`);
      assert.equal(caps.positional, want.positional, `${pair} positional`);
    }
  });

  test("the model and the composition name no game, slug or jurisdiction", () => {
    for (const f of [
      "lib/archive/archiveModel.ts", "lib/archive/archiveMetrics.ts", "lib/archive/archiveFilter.ts",
      "lib/archive/archiveAsk.ts", "lib/archive/archiveReviewFixture.ts",
      "components/archive/ArchiveView.tsx", "components/archive/ArchiveWorkspace.tsx",
    ]) {
      const code = codeOnly(f);
      assert.ok(!/=== *"(fl|ca)"/.test(code), `${f} must not branch on a state code`);
      assert.ok(!/"pick-3"|"cash-pop"|"superlotto-plus"|"lotto"/.test(code), `${f} must not name a game`);
      assert.ok(!/\bFireball\b/.test(code), `${f} must not name a specific add-on`);
      assert.ok(!/Midday|Evening/.test(code), `${f} must not name a specific variant`);
    }
    /* The registry is the ONE place a game may be named, because that is its job. */
    assert.match(codeOnly("lib/archive/archiveRegistry.ts"), /"pick-3"/);
  });

  test("every proof shape produces neutral language", () => {
    for (const p of PROOFS) {
      const m = maybeArchive(p.st, p.slug)!;
      assertNeutralLanguage([
        m.h1, m.supportingCopy, m.statusLine, m.coverage.statement,
        ...m.metrics.flatMap((x) => [x.label, x.note ?? ""]),
        ...(m.brief?.points.map((x) => x.text) ?? []),
        ...m.analysis.flatMap((v) => [v.title, v.method]),
        ...m.notable.map((n) => n.reason),
      ]);
    }
  });
});

/* ════════════════════════════════════════════════════════════════ fixture rules */

describe("LRG-ARCHIVE-054: fixture provenance and honesty", () => {
  test("provenance is a required data field, spelled as the brief requires", () => {
    const m = archive();
    for (const r of m.rows) {
      assert.ok(
        r.provenance === "productionFeed" || r.provenance === "synthetic/internal-review",
        `unexpected provenance ${r.provenance}`,
      );
    }
    assert.ok(m.rows.some((r) => r.provenance === "synthetic/internal-review"));
  });

  test("real data wins: the newest row for each member is the feed's own record", () => {
    const m = archive();
    for (const mem of m.members) {
      const rows = m.rows.filter((r) => r.gameId === mem.gameId)
        .sort((a, b) => b.drawDateIso.localeCompare(a.drawDateIso));
      assert.equal(rows[0].provenance, "productionFeed", `${mem.variantLabel}'s newest row must be real`);
    }
  });

  test("no synthetic row is dated on or after a real one", () => {
    const m = archive();
    for (const mem of m.members) {
      const rows = m.rows.filter((r) => r.gameId === mem.gameId);
      const newestReal = rows.filter((r) => r.provenance === "productionFeed")
        .map((r) => r.drawDateIso).sort().reverse()[0];
      if (!newestReal) continue;
      for (const r of rows.filter((x) => x.provenance !== "productionFeed")) {
        assert.ok(r.drawDateIso < newestReal, `${r.drawDateIso} must precede the real record ${newestReal}`);
      }
    }
  });

  test("no row is dated after the governed review date", () => {
    const m = archive();
    for (const r of m.rows) {
      assert.ok(r.drawDateIso <= m.reviewDateIso, `${r.drawDateIso} is after the review date`);
    }
  });

  test("the fixture demonstrates every state the brief requires", () => {
    const m = archive();
    const shapes = new Set(m.rows.map((r) => r.shape));
    assert.ok(shapes.has("allDifferent") && shapes.has("double") && shapes.has("triple"),
      `all three shapes must be present: ${[...shapes].join(", ")}`);
    assert.equal(m.rows.filter((r) => r.corrected).length, 1, "the internal correction capability is exercised");
    assert.ok(m.rows.some((r) => r.addOnValue !== null), "add-on coverage");
    assert.ok(m.rows.some((r) => r.addOnValue === null), "missing add-on coverage");
    /* PARTIAL, not CORRECTED: the fixture's correction has no source, so it is not publishable. */
    assert.equal(m.coverage.completeness, "PARTIAL");
    assert.equal(m.hasPublishedCorrection, false);
    /* Both members on the same date, which is what makes the family presentation reviewable. */
    const perDate = new Map<string, number>();
    for (const r of m.rows) perDate.set(r.drawDateIso, (perDate.get(r.drawDateIso) ?? 0) + 1);
    assert.ok([...perDate.values()].some((n) => n === m.members.length), "at least one date carries every member");
  });

  test("the corrected row carries its full correction record", () => {
    const m = archive();
    const c = m.rows.find((r) => r.corrected)!;
    assert.ok(c.correction);
    assert.ok(c.correction!.field.length > 0);
    assert.ok(c.correction!.previousValue.length > 0);
    assert.ok(c.correction!.currentValue.length > 0);
    assert.equal(c.correction!.source, null, "a fixture must not claim a source it does not have");
  });

  test("the fixture is deterministic across builds", () => {
    const a = archive();
    const b = archive();
    assert.deepEqual(
      a.rows.map((r) => [r.gameId, r.drawDateIso, [...r.mainValues], r.addOnValue]),
      b.rows.map((r) => [r.gameId, r.drawDateIso, [...r.mainValues], r.addOnValue]),
    );
    const code = codeOnly("lib/archive/archiveReviewFixture.ts");
    assert.ok(!/Math\.random/.test(code), "a review fixture must be reproducible");
    assert.ok(!/Date\.now\(\)/.test(code) && !/new Date\(\)/.test(code));
  });

  test("no synthetic winner, prize, retailer, article or discussion exists", () => {
    const m = archive();
    /*
     * Scoped to the data that makes CLAIMS. An earlier version swept `coverage` too and failed on the field named
     * "Prize amounts" — whose entire content is *"Not connected. No prize or payout figure is shown"*. Flagging an
     * honest statement of absence as a fabrication is a test bug, not a finding, so the absence is asserted
     * directly instead.
     */
    /*
     * Scoped to what the FIXTURE generates. `editorial` is excluded on purpose: it is real, human-authored
     * configured content, and one of its summaries legitimately discusses payout tables while explaining the
     * 2021 rule change. Flagging that would be flagging real content for containing a real word — the sweep
     * exists to catch invented facts, not vocabulary.
     */
    const flat = JSON.stringify({
      rows: m.rows, metrics: m.metrics, brief: m.brief, notable: m.notable,
    });
    for (const banned of ["winner", "retailer", "jackpot", "claimed", "payout", "prize"]) {
      assert.ok(!new RegExp(banned, "i").test(flat), `"${banned}" must not appear in generated archive data`);
    }
    /* Editorial items must still be REAL — every one has a destination that resolves. */
    for (const g of m.editorial) {
      for (const i of g.items) assert.ok(i.href, `${g.kind} item "${i.title}" must be a real article`);
    }
    const prizeField = m.coverage.fields.find((f) => f.field === "Prize amounts")!;
    assert.match(prizeField.coverage, /Not connected/);
    assert.equal(prizeField.supportsMetrics, false);
  });

  test("the ordering distinction holds: records may be sorted, real values never are", () => {
    const m = archive();
    /* Records: newest first. */
    for (let i = 1; i < m.rows.length; i++) {
      const a = m.rows[i - 1], b = m.rows[i];
      if (a.drawDateIso === b.drawDateIso) assert.ok(a.memberOrder <= b.memberOrder);
      else assert.ok(a.drawDateIso > b.drawDateIso, "rows must be newest first");
    }
    /* Real values: exactly as supplied. An ordered digit sample is never sorted either. */
    const ordered = m.profile.main!.semantics.matchOrdered;
    if (ordered) {
      const anyUnsorted = m.rows.some((r) => {
        const v = [...r.mainValues];
        return v.join() !== [...v].sort((x, y) => x - y).join();
      });
      assert.ok(anyUnsorted, "an ordered game's values must not all be ascending, or something sorted them");
    }
  });
});

/* ════════════════════════════════════════════════════════════════ crawlability and structure */

describe("LRG-ARCHIVE-054: server HTML and crawlability", () => {
  test("the composition is a server component and the workspace is the only client island", () => {
    assert.ok(!/^"use client"/m.test(src("components/archive/ArchiveView.tsx")),
      "the archive composition must render on the server");
    assert.match(src("components/archive/ArchiveWorkspace.tsx"), /^"use client"/);
  });

  test("month navigation is real links, not click-only state", () => {
    const view = src("components/archive/ArchiveView.tsx");
    assert.match(view, /href=\{`#month-\$\{mo\.monthKey\}`\}/, "a month is an anchor a crawler can follow");
  });

  test("filter state never enters a query string, so no filter combination is crawlable", () => {
    const ws = codeOnly("components/archive/ArchiveWorkspace.tsx");
    assert.ok(!/useSearchParams|useRouter|history\.pushState/.test(ws),
      "blueprint §31: a filter state must not become an indexable URL");
    /*
     * A URL FRAGMENT is permitted and is how filters survive a year change: it is never sent to the server and
     * never indexed, so it cannot become a crawl trap. A query string would be both.
     */
    const nav = codeOnly("components/archive/ArchiveYearNav.tsx");
    assert.ok(!/\?/.test(nav.replace(/\?\?|\?\./g, "")) || !/href=.*\?/.test(nav),
      "a year link must not carry a query string");
    assert.match(nav, /#\$\{fragment\}/);
  });

  test("no structured data is emitted at all in this guarded V0", () => {
    /* Blueprint §32 permits WebPage/CollectionPage/BreadcrumbList/ItemList only when the data is governed. Most
       rows here are internal review samples, so schema would describe synthetic content as fact. */
    for (const f of ["components/archive/ArchiveView.tsx", "app/[state]/[game]/[segment]/page.tsx"]) {
      assert.ok(!/application\/ld\+json/.test(src(f)), `${f} must emit no JSON-LD`);
    }
  });

  test("every wide table has its own labelled scroll container", () => {
    const view = src("components/archive/ArchiveView.tsx");
    const wraps = view.match(/lcg-tablewrap/g) ?? [];
    const tables = view.match(/<table/g) ?? [];
    assert.equal(wraps.length, tables.length, "every table is wrapped");
    assert.match(view, /tabIndex=\{0\} role="group" aria-label=/, "a scroll container must be reachable and named");
  });

  test("the preview banner is stated once per medium", () => {
    /*
     * Two references, and they never both reach a reader: `.lca-banner` is screen-only and `.lca-printhead` is
     * `display: none` until `@media print`. A printed sheet loses the site chrome entirely, so without its own copy
     * the samples would circulate on paper with no indication they are samples — the one thing the disclosure
     * exists to prevent. One disclosure per medium is the rule; two on one screen would be the violation.
     */
    const view = src("components/archive/ArchiveView.tsx");
    assert.equal((view.match(/previewBanner/g) ?? []).length, 2, "one for screen, one for print");
    assert.match(view, /lca-banner/);
    assert.match(view, /lca-printhead/);
    const css = src("app/globals.css");
    assert.match(css, /\.lca-printhead \{ display: none; \}/, "the print header is hidden on screen");
    assert.match(css, /\.lca-banner[\s\S]{0,400}display: none !important/, "the screen banner is hidden in print");
  });
});

/* ════════════════════════════════════════════════════════════════ non-regression */

describe("LRG-ARCHIVE-054: nothing else changed", () => {
  test("the archive adds a new CSS namespace and alters no existing selector", () => {
    const css = src("app/globals.css");
    /* Bounded at the next banner rather than end-of-file — see the companion note in the LRG-ARCHIVE-055
       namespace test. The shared BP-01 §42–§45 chrome that follows is cross-family by design. */
    const archiveBlock = css.slice(
      css.indexOf("YEARLY HISTORY ARCHIVE"),
      css.indexOf("   THE UNIVERSAL SECTION CHROME —"),
    );
    /* Every selector introduced by this task is `lca-` prefixed, so no existing page family can be restyled. */
    const selectors = archiveBlock.match(/^\.[a-z][a-z0-9-]*/gm) ?? [];
    assert.ok(selectors.length > 20, "the block must actually contain the archive styles");
    for (const s of selectors) {
      assert.ok(s.startsWith(".lca-"), `${s} is outside the archive namespace`);
    }
  });

  test("the Game Page composition is untouched by this task", () => {
    const bands = src("components/game/preview/sections/GameM2Bands.tsx");
    assert.ok(!/archive/i.test(bands), "the Game Page must not gain archive behaviour");
  });

  test("no legacy path, API path or database artefact is referenced", () => {
    for (const f of [
      "lib/archive/archiveModel.ts", "lib/archive/archiveRegistry.ts",
      "app/[state]/[game]/[segment]/page.tsx", "components/archive/ArchiveView.tsx",
    ]) {
      const code = codeOnly(f);
      assert.ok(!/00-reference-existing-project|02-new-api/.test(code), `${f} must not reach outside the UI`);
    }
  });

  test("the archive declares itself not to be an API contract", () => {
    /* `CLAUDE.md` §15: a presentation payload must not become a domain contract by accident. */
    assert.match(src("lib/archive/archiveContract.ts"), /not\*\* a database schema|not a database schema/);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * LRG-ARCHIVE-055 — THE FOUNDER-CORRECTION PASS.
 *
 * Authority: the 2026-08-05 founder correction direction. Each suite maps to one numbered correction, and each
 * test names the behaviour the V0 got wrong — because the value of these tests is that they FAIL against the
 * page as the founder saw it.
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

describe("LRG-ARCHIVE-055 (1): no verification terminology reaches a reader", () => {
  /**
   * Every reader-facing string the model produces.
   *
   * Deliberately exhaustive rather than a sample: a terminology rule enforced on three of twelve strings is not
   * enforced. Internal fields (`row.status`, `row.provenance`) are excluded — they must survive, and correction (11)
   * asserts that they do.
   */
  const visibleStrings = (m: ArchiveViewModel): string[] => [
    m.h1, m.supportingCopy, m.statusLine, m.sourceLine, m.ruleEraLabel, m.previewBanner, m.neutrality,
    m.coverage.statement, m.coverage.exportStatus.statement, m.coverage.sourceLabel,
    ...m.coverage.fields.flatMap((f) => [f.field, f.coverage]),
    ...m.summaryMetrics.flatMap((x) => [x.label, x.value]),
    ...m.metrics.flatMap((x) => [x.label, x.value, x.note ?? ""]),
    ...(m.brief ? [m.brief.heading, m.brief.label, m.brief.evidenceLine] : []),
    ...(m.brief?.points.flatMap((p) => [p.text, p.evidence]) ?? []),
    ...m.analysis.flatMap((v) => [v.title, v.method, v.period, v.variants]),
    ...m.notable.flatMap((n) => [n.reason, n.metric, n.value]),
    ...m.tools.flatMap((t) => [t.title, t.summary]),
    ...m.editorial.flatMap((g) => [g.heading, g.emptyStatement ?? ""]),
    ...m.nextActions.flatMap((a) => [a.label, a.note ?? ""]),
    m.askAnswer.explanation, m.askAnswer.neutrality,
    ...m.askPrompts,
    ...m.months.map((x) => x.label),
  ];

  test("no verification word appears in any reader-facing string", () => {
    const m = archive();
    const strings = visibleStrings(m);
    assert.ok(strings.length > 70, "the sweep must actually cover the page");
    for (const s of strings) {
      assert.ok(!/verif/i.test(s), `verification terminology leaked: "${s}"`);
    }
  });

  test("no internal or implementation phrase appears in any reader-facing string", () => {
    const m = archive();
    /* Each of these was on the page the founder reviewed. */
    const banned = [
      /internal review sample/i, /governed/i, /not rendered in this review/i, /AD-AR/, /lc_gh_/,
      /deterministic/i, /provenance/i, /fixture/i, /interpreter/i, /live AI model/i, /model stub/i,
      /rule era/i, /review date/i, /guard/i,
    ];
    for (const s of visibleStrings(m)) {
      for (const b of banned) {
        assert.ok(!b.test(s), `internal phrase ${b} leaked: "${s}"`);
      }
    }
  });

  test("the composition renders no Status column and no per-row action cluster", () => {
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.ok(!/>Status</.test(view), "the Status column published a `verified` badge on every row");
    assert.ok(!/lca-actions/.test(view), "156 links to three destinations is not row-specific information");
    assert.ok(!/lcg-tag--sample/.test(view), "no per-row sample badge");
  });

  test("a visible date says Last updated, never Last verified", () => {
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.match(view, /Last updated/);
    assert.ok(!/Last verified/.test(view));
    /* And the field carries the neutral name on the contract too, so nothing can render the old one. */
    assert.ok("lastUpdatedIso" in archive().coverage);
  });

  test("exactly one preview disclosure exists per medium", () => {
    const view = codeOnly("components/archive/ArchiveView.tsx");
    /* See the per-medium test above: screen banner + print header, mutually exclusive by media query. */
    assert.equal((view.match(/previewBanner/g) ?? []).length, 2);
    /* And it still says results are samples — removing the warning would let them read as real. */
    assert.match(archive().previewBanner, /samples/i);
    assert.match(archive().previewBanner, /not ready to publish/i);
  });

  test("source and methodology information survives", () => {
    /* Founder direction: *"Do not remove the actual source and methodology information users need for trust."* */
    const m = archive();
    assert.ok(m.coverage.fields.length >= 4);
    assert.ok(m.coverage.sourceLabel.length > 0);
    assert.ok(m.coverage.lastUpdatedIso.length > 0);
    assert.match(m.sourceLine, /^Last updated /);
    assert.equal(m.sectionState["AR-10"].render, true);
  });
});

describe("LRG-ARCHIVE-055 (2): the correction gate", () => {
  test("a correction needs a previous value, a corrected value, a source and a date", () => {
    const complete = {
      field: "Winning numbers", previousValue: "1 · 2 · 3", currentValue: "3 · 2 · 1",
      correctedOnIso: "2026-06-19", source: "Operator revision notice",
    };
    assert.equal(isGenuineCorrection(complete), true);
    assert.equal(isGenuineCorrection(null), false);
    assert.equal(isGenuineCorrection(undefined), false);
    /* Each field removed in turn — one missing fact is enough to make the claim uncheckable. */
    for (const key of ["field", "previousValue", "currentValue", "correctedOnIso", "source"] as const) {
      assert.equal(isGenuineCorrection({ ...complete, [key]: key === "source" ? null : "" }), false,
        `a correction without ${key} must not publish`);
    }
    assert.equal(isGenuineCorrection({ ...complete, source: "   " }), false, "whitespace is not a source");
  });

  test("the fixture's correction record exists internally and cannot publish", () => {
    const m = archive();
    const row = m.rows.find((r) => r.corrected);
    assert.ok(row, "the internal capability is still exercised");
    assert.ok(row!.correction, "the record is present on the data");
    assert.equal(row!.correction!.source, null, "a fixture must not invent a source");
    assert.equal(isGenuineCorrection(row!.correction), false);
    assert.equal(m.hasPublishedCorrection, false);
  });

  test("nothing correction-related renders without a genuine record", () => {
    const m = archive();
    /* No metric. */
    for (const x of [...m.summaryMetrics, ...m.metrics]) {
      assert.ok(!/correct/i.test(x.label), `metric "${x.label}" must not mention corrections`);
    }
    /* No narrative in the brief or the notable draws. */
    for (const p of m.brief?.points ?? []) {
      assert.ok(!/correct/i.test(p.text), `brief point must not narrate a correction: "${p.text}"`);
    }
    for (const n of m.notable) {
      assert.ok(!/correct/i.test(n.reason + n.metric), `notable draw must not narrate a correction: ${n.metric}`);
    }
    /* No month marker. */
    assert.equal(m.months.filter((x) => x.hasCorrection).length, 0);
    /* And the completeness state is not promoted. */
    assert.equal(m.coverage.completeness, "PARTIAL");
  });

  test("the correction presentation is gated in the composition, not merely absent from the data", () => {
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.match(view, /isGenuineCorrection/, "the composition must ask the gate, not read the flag");
    assert.ok(!/r\.corrected \?/.test(view), "no rendering may branch on the raw flag");
  });

  test("the corrected-results filter appears only when a corrected result exists", () => {
    const ws = codeOnly("components/archive/ArchiveWorkspace.tsx");
    assert.match(ws, /m\.hasPublishedCorrection \? \(/, "the control is gated");
  });
});

describe("LRG-ARCHIVE-055 (5): year navigation", () => {
  /*
   * Multi-year behaviour is proven HERE, against the registry function, rather than by registering a year with no
   * data — which the founder direction forbids and which would publish a fabricated archive.
   */
  const nav = (years: number[], current: number) => {
    /* A local stand-in for a multi-year registry: same algorithm, explicit input. */
    const ascending = [...years].sort((a, b) => a - b);
    const below = ascending.filter((y) => y < current);
    const above = ascending.filter((y) => y > current);
    return {
      years: [...ascending].reverse(),
      current,
      older: below.length ? below[below.length - 1] : null,
      newer: above.length ? above[0] : null,
      singleYear: ascending.length <= 1,
    };
  };

  test("the one-year boundary state has no links in either direction", () => {
    const n = archiveYearNavigation("fl", "pick-3", 2026);
    assert.deepEqual([...n.years], [2026]);
    assert.equal(n.older, null);
    assert.equal(n.newer, null);
    assert.equal(n.singleYear, true);
  });

  test("previous and next mean the ADJACENT AVAILABLE year, never year ± 1", () => {
    /* Non-consecutive registered years — the case arithmetic gets wrong. */
    const n = nav([2019, 2021, 2026], 2021);
    assert.equal(n.older, 2019, "2020 is not registered, so Older is 2019");
    assert.equal(n.newer, 2026, "2022–2025 are not registered, so Newer is 2026");
    assert.notEqual(n.older, 2020);
    assert.notEqual(n.newer, 2022);
  });

  test("the oldest and newest boundaries omit their direction", () => {
    const oldest = nav([2019, 2021, 2026], 2019);
    assert.equal(oldest.older, null);
    assert.equal(oldest.newer, 2021);
    const newest = nav([2019, 2021, 2026], 2026);
    assert.equal(newest.older, 2021);
    assert.equal(newest.newer, null);
  });

  test("the selector lists only registered years, newest first", () => {
    const n = nav([2019, 2021, 2026], 2021);
    assert.deepEqual([...n.years], [2026, 2021, 2019]);
    for (const y of [2020, 2022, 2023, 2024, 2025]) {
      assert.ok(!n.years.includes(y), `${y} is not registered and must not be selectable`);
    }
  });

  test("the registry helper agrees with the model for the registered year", () => {
    assert.equal(adjacentArchiveYear("fl", "pick-3", 2026, "older"), null);
    assert.equal(adjacentArchiveYear("fl", "pick-3", 2026, "newer"), null);
    const m = archive();
    assert.equal(m.previousYear, null);
    assert.equal(m.nextYear, null);
    assert.deepEqual([...m.yearNav.years], [2026]);
  });

  test("the component renders a boundary as an unavailable control, never a link", () => {
    const nav = src("components/archive/ArchiveYearNav.tsx");
    assert.match(nav, /aria-disabled="true"/);
    assert.match(nav, /nav\.older !== null \? \(/, "a link only when a year exists");
    assert.match(nav, /nav\.newer !== null \? \(/);
    /* Keyboard-operable: real anchors and a labelled native select. */
    assert.match(nav, /<select/);
    assert.match(nav, /htmlFor=\{selectId\}/);
    assert.match(nav, /Choose an archive year/);
  });

  test("year navigation precedes month navigation", () => {
    /* AR-01 holds the year navigation; AR-04 is the month navigation. */
    assert.ok(AR_ORDER.indexOf("AR-01") < AR_ORDER.indexOf("AR-04"));
    const view = codeOnly("components/archive/ArchiveView.tsx");
    const inAr01 = view.slice(view.indexOf('case "AR-01"'), view.indexOf('case "AR-02"'));
    assert.match(inAr01, /ArchiveYearNav/, "the year navigation lives in AR-01, beside the title");
  });
});

describe("LRG-ARCHIVE-055 (5b): filters survive a year change without becoming crawlable", () => {
  test("an empty filter produces no fragment, so links stay clean", () => {
    assert.equal(encodeCarriedFilter({}), "");
    assert.equal(encodeCarriedFilter({ raw: { main: ["", "", ""] } }), "", "blank entry is not a filter");
    assert.equal(encodeCarriedFilter({ variant: "all", orderMode: "exact", sort: "newest" }), "",
      "default values are not a filter");
  });

  test("a real filter round-trips exactly", () => {
    const f = { raw: { main: ["007"] }, orderMode: "any" as const, variant: "332", month: 3 };
    const decoded = decodeCarriedFilter("#" + encodeCarriedFilter(f));
    assert.deepEqual(decoded.raw, { main: ["007"] }, "a leading zero must survive the round trip");
    assert.equal(decoded.orderMode, "any");
    assert.equal(decoded.variant, "332");
    assert.equal(decoded.month, 3);
  });

  test("a malformed fragment is ignored rather than throwing", () => {
    for (const bad of ["", "#", "#f=", "#f=%%%", "#f=notjson", "#other=1", "#f=" + encodeURIComponent("[1,2]")]) {
      assert.deepEqual(decodeCarriedFilter(bad), {}, `"${bad}" must decode to an empty filter`);
    }
  });

  test("the month resets only when unavailable in the destination year", () => {
    const carried = { raw: { main: ["378"] }, month: 3, variant: "332" };
    /* March exists in the destination: kept, and remapped to the destination year. */
    const kept = applyCarriedFilter(carried, 2023, [1, 2, 3, 4], [332, 333]);
    assert.equal(kept.monthKey, "2023-03");
    assert.equal(kept.droppedMonth, false);
    assert.equal(kept.carried.month, 3);

    /* March does not exist there: the month resets and everything else survives. */
    const dropped = applyCarriedFilter(carried, 2023, [1, 2], [332, 333]);
    assert.equal(dropped.monthKey, null);
    assert.equal(dropped.droppedMonth, true);
    assert.equal(dropped.carried.month, undefined);
    assert.deepEqual(dropped.carried.raw, { main: ["378"] }, "the search itself must survive");
    assert.equal(dropped.carried.variant, "332");
  });

  test("a variant the destination family does not have is dropped", () => {
    /* Carrying game id 332 into a family without it would silently filter every row out. */
    const r = applyCarriedFilter({ variant: "332" }, 2023, [1], [999]);
    assert.equal(r.droppedVariant, true);
    assert.equal(r.carried.variant, undefined);
    const kept = applyCarriedFilter({ variant: "332" }, 2023, [1], [332, 333]);
    assert.equal(kept.droppedVariant, false);
    assert.equal(kept.carried.variant, "332");
  });

  test("carried state uses a fragment, which is never indexable", () => {
    const nav = codeOnly("components/archive/ArchiveYearNav.tsx");
    assert.match(nav, /encodeCarriedFilter/);
    assert.ok(!/\?f=/.test(nav), "a query string would be crawlable; a fragment is not");
  });
});

describe("LRG-ARCHIVE-055 (7): simplified result rows", () => {
  test("the results table keeps only reader-useful columns", () => {
    const view = codeOnly("components/archive/ArchiveView.tsx");
    const ar05 = view.slice(view.indexOf('case "AR-05"'), view.indexOf('case "AR-06"'));
    for (const col of ["Date", "Drawing", "Pattern", "Sum"]) {
      assert.match(ar05, new RegExp(col), `${col} must remain`);
    }
    assert.ok(!/Status/.test(ar05));
    assert.ok(!/Actions/.test(ar05));
    assert.ok(!/>Check</.test(ar05) && !/>Analyze</.test(ar05) && !/>Details</.test(ar05));
  });

  test("the add-on is never drawn as a ball beside the winning numbers", () => {
    /*
     * It rendered twice: a full-size ball inside `RowValues` AND the inline label. The ball sat immediately after
     * the three winning digits, which reads as a fourth winning digit — exactly what Fireball is not, since it
     * REPLACES one of the drawn numbers.
     */
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.match(view, /row\.groups\.filter\(\(g\) => g\.role !== "addOn"\)/,
      "RowValues must exclude the drawn add-on");
  });

  test("the add-on renders as a labelled secondary value, not a column", () => {
    const view = codeOnly("components/archive/ArchiveView.tsx");
    const ar05 = view.slice(view.indexOf('case "AR-05"'), view.indexOf('case "AR-06"'));
    /* Inline with the numbers and named — `Fireball: 4` — so it cannot read as a fourth winning digit. */
    assert.match(ar05, /lca-addon/);
    assert.ok(!/<th scope="col">\{addOn\.label\}<\/th>/.test(ar05), "no dedicated add-on column");
  });

  test("Midday and Evening remain independent rows with their own ids", () => {
    const m = archive();
    assert.deepEqual(m.members.map((x) => x.gameId), [332, 333]);
    const ids = new Set(m.rows.map((r) => r.gameId));
    assert.deepEqual([...ids].sort(), [332, 333]);
    assert.equal(m.rows.filter((r) => r.gameId === 332).length, 26);
    assert.equal(m.rows.filter((r) => r.gameId === 333).length, 26);
  });

  test("internal governance state survives on the data while rendering nowhere", () => {
    /* Correction (11): verification metadata must still exist internally. */
    const m = archive();
    for (const r of m.rows) {
      assert.ok(r.status.length > 0, "every row keeps its governed status");
      assert.ok(r.provenance === "productionFeed" || r.provenance === "synthetic/internal-review");
    }
    assert.ok(m.rows.some((r) => r.status === "corrected"), "the corrected status is still recorded");
    assert.ok(m.rows.some((r) => r.provenance === "productionFeed"));
    assert.ok(m.rows.some((r) => r.provenance === "synthetic/internal-review"));
  });
});

describe("LRG-ARCHIVE-055 (8): statistics are weighted, not removed", () => {
  test("four primary insights are open and the rest are disclosed on request", () => {
    const m = archive();
    const primary = m.analysis.filter((v) => v.primary);
    const deeper = m.analysis.filter((v) => !v.primary);
    assert.equal(primary.length, 4);
    assert.ok(deeper.length >= 3, "the deeper views still exist");
    const view = codeOnly("components/archive/ArchiveView.tsx");
    /* A native `<details>`: keyboard-operable, announced, and findable by in-page search with no JavaScript. */
    assert.match(view, /<details className="lca-details">/);
    assert.match(view, /v\.primary/);
  });

  test("the responsible-play statement is kept in full", () => {
    const m = archive();
    assert.match(m.neutrality, /do not change the odds/i);
    const view = codeOnly("components/archive/ArchiveView.tsx");
    const ar07 = view.slice(view.indexOf('case "AR-07"'), view.indexOf('case "AR-08"'));
    assert.match(ar07, /m\.neutrality/, "it must render above the figures it qualifies");
  });

  test("the statistics engine and its coverage are untouched", () => {
    /* Every view the engine can produce is still produced — the change is presentation weighting only. */
    const keys = archive().analysis.map((v) => v.key);
    for (const k of ["number-frequency", "variant-comparison", "shape-distribution", "sum-distribution",
                     "pair-front", "pair-back", "previous-repeat"]) {
      assert.ok(keys.includes(k), `${k} must still be computed`);
    }
  });
});

describe("LRG-ARCHIVE-055: non-regression", () => {
  test("the guard, the registry and the preview metadata are unchanged", () => {
    assert.deepEqual(archiveRoutePaths(), ["/fl/pick-3/2026"]);
    const route = codeOnly("app/[state]/[game]/[segment]/page.tsx");
    assert.match(route, /resolveGamePreview/);
    /* FD-GATE-01: both conditions an archive page needs are now one `servesPage("archive", …)` call. */
    assert.match(route, /servesPage\("archive", state, game, parsed\)/);
    assert.match(route, /index: false/);
    /* §A4 replaced "still no canonical" with a self-referencing one on the shared origin constant. The
       non-regression that still matters is that the route stays `noindex` and stays server-guarded. */
    assert.match(route, /alternates: \{ canonical: canonicalUrl\(/);
    assert.ok(!/NEXT_PUBLIC/.test(route));
  });

  test("the [segment] consolidation still serves both route shapes", () => {
    assert.match(src("app/[state]/[game]/[segment]/page.tsx"), /segment: string/);
    assert.match(src("app/[state]/[game]/[segment]/[slug]/page.tsx"), /segment: string/);
  });

  test("the archive is still server-rendered with every row in the model", () => {
    assert.ok(!/^"use client"/m.test(src("components/archive/ArchiveView.tsx")));
    assert.equal(archive().rows.length, 52);
  });

  test("one complete public Ask answer still exists, grounded in the archive", () => {
    const m = archive();
    assert.ok(m.askAnswer.understood);
    assert.ok(m.askAnswer.matchingCount >= 0);
    assert.ok(m.askAnswer.explanation.length > 0);
    assert.ok(m.askAnswer.evidence.length > 0);
    /* And the reader-facing framing says where answers come from, without naming an architecture. */
    /*
     * The workspace's ask branch IS RENDERED AGAIN — `FD-DAT-16`'s restoration condition was met by
     * Conflict 37 (2026-08-11) — so this copy is now something a reader sees, in the visible-gate form.
     */
    const ws = codeOnly("components/archive/ArchiveWorkspace.tsx");
    assert.match(ws, /Answers are based on the results in this archive/);
    assert.ok(!/INTERPRETER_DISCLOSURE/.test(ws), "no implementation statement reaches the page");
  });

  test("every archive CSS addition stays inside the lca- namespace", () => {
    const css = src("app/globals.css");
    /*
     * The slice ENDS at the next banner, not at end-of-file — the same correction `tests/game-page.test.ts`
     * already had to make for the same reason. Running to the end was only ever correct while this block happened
     * to be last, and the shared BP-01 §42–§45 section chrome now follows it. That block is cross-family BY
     * DESIGN, so measuring it against the archive's namespace rule would assert the opposite of its purpose.
     */
    const from = css.indexOf("ARCHIVE FOUNDER-CORRECTION PASS");
    const to = css.indexOf("   THE UNIVERSAL SECTION CHROME —");
    assert.ok(from > 0 && to > from, "both banners must be locatable, in this order");
    const block = css.slice(from, to);
    const selectors = block.match(/^\.[a-z][a-z0-9-]*/gm) ?? [];
    assert.ok(selectors.length > 10, "the block must contain the additions");
    for (const s of selectors) assert.ok(s.startsWith(".lca-"), `${s} is outside the archive namespace`);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * LRG-ARCHIVE-057 — PUBLIC HISTORY PAGE EXPANSION.
 *
 * Authority: the 2026-08-05 founder direction §§1–7; `ACCT-DEC-001` `FD-ACC-05` (these capabilities are public),
 * `FD-ACC-07` (no personal capability renders), `FD-ACC-14` (no disabled account control).
 *
 * NOTE: `FD-ACC-05` was PARTLY SUPERSEDED on 2026-08-06 by `DATA-DEC-001` — Ask execution (`FD-DAT-02`) and
 * provided CSV/print/export (`FD-DAT-01`) are now Account-gated, and their surfaces were removed. The tests in
 * this block that covered those two surfaces were rewritten in place; see the LRG-ARCHIVE-059 block at the end
 * of this file for the removal assertions. Everything else here — calendar, agenda, detail, analytics, articles
 * — is still public under `FD-DAT-08` and is unchanged.
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

describe("LRG-ARCHIVE-057 (1): calendar and agenda", () => {
  const cal = () => {
    const m = archive();
    const validMonths = m.months.filter((x) => x.valid).length;
    return {
      m,
      months: buildCalendarMonths(
        m.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, validMonths),
        m.coveredFromIso, m.coveredToIso,
      ),
      agenda: buildAgenda(m.rows, "newest"),
    };
  };

  test("the calendar and the agenda hold exactly the table's rows — filter parity is structural", () => {
    const { m, months, agenda } = cal();
    const inCalendar = months.flatMap((mo) => mo.days.flatMap((d) => d.rows.map((r) => r.anchorId))).sort();
    const inAgenda = agenda.flatMap((d) => d.rows.map((r) => r.anchorId)).sort();
    const inTable = m.rows.map((r) => r.anchorId).sort();
    assert.deepEqual(inCalendar, inTable, "the calendar must contain the table's rows and no others");
    assert.deepEqual(inAgenda, inTable, "the agenda must contain the table's rows and no others");
  });

  test("a filtered set produces a filtered calendar, from the same function", () => {
    const m = archive();
    const march = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), monthKey: "2026-03" });
    const months = buildCalendarMonths(
      march.rows, m.archiveYear, ["2026-03"], m.coveredFromIso, m.coveredToIso,
    );
    const ids = months.flatMap((mo) => mo.days.flatMap((d) => d.rows.map((r) => r.anchorId))).sort();
    assert.deepEqual(ids, march.rows.map((r) => r.anchorId).sort());
    assert.ok(ids.length > 0 && ids.length < m.rows.length, "the filter must actually narrow the set");
  });

  test("every day carries one of four honest states, and none is a blank", () => {
    /* `noRegisteredResult` was added by LRG-ARCHIVE-058 — see the suite at the end of this file. */
    const { months } = cal();
    const states = new Set(months.flatMap((mo) => mo.days.map((d) => d.state)));
    for (const s of states) {
      assert.ok(["drawn", "noDrawing", "noRegisteredResult", "outside"].includes(s), `unexpected state ${s}`);
    }
    assert.ok(states.has("drawn"));
    assert.ok(states.has("noRegisteredResult"), "an incomplete archive must say it holds no result");
    assert.ok(!states.has("noDrawing"), "Pick 3 draws daily, so no cell may claim a drawing did not happen");
  });

  test("a day outside the covered range is distinguished from a covered day with no drawing", () => {
    /*
     * The distinction the direction requires: an empty date must not look like missing or failed data. A covered
     * day genuinely had no drawing and says "No drawing"; a day before the first or after the last recorded drawing
     * asserts nothing, because we have established nothing about it.
     */
    const m = archive();
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, 12), m.coveredFromIso, m.coveredToIso,
    );
    const all = months.flatMap((mo) => mo.days);
    const outside = all.filter((d) => d.state === "outside");
    assert.ok(outside.length > 0, "2026 stops in July, so later dates are outside the covered range");
    for (const d of outside) {
      assert.ok(
        d.dateIso < (m.coveredFromIso ?? "") || d.dateIso > (m.coveredToIso ?? ""),
        `${d.dateIso} is marked outside but falls inside the covered range`,
      );
    }
    for (const d of all.filter((x) => x.state === "noRegisteredResult")) {
      assert.ok(d.dateIso >= (m.coveredFromIso ?? "") && d.dateIso <= (m.coveredToIso ?? ""));
    }
  });

  test("coverage bounds come from the unfiltered year, so a narrow filter is not a narrow archive", () => {
    const m = archive();
    const march = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), monthKey: "2026-03" });
    const months = buildCalendarMonths(
      march.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, 7), m.coveredFromIso, m.coveredToIso,
    );
    const january = months.find((mo) => mo.monthKey === "2026-01")!;
    /*
     * January holds no rows under a March filter, but the days that fall INSIDE the archive's coverage must still
     * read as `noDrawing` — the reader's filter is not the archive's coverage.
     *
     * Jan 1–3 are a genuine exception and the reason this is asserted by range rather than by month: the first
     * recorded drawing is 2026-01-04, so the first three days of the year really are outside the covered period and
     * must not claim "No drawing".
     */
    const covered = january.days.filter((d) => d.dateIso >= (m.coveredFromIso ?? ""));
    assert.ok(covered.length > 0);
    assert.ok(covered.every((d) => d.state === "noRegisteredResult"),
      "a covered January day with no rows under this filter holds no registered result — it is not outside the archive");
    const before = january.days.filter((d) => d.dateIso < (m.coveredFromIso ?? ""));
    assert.ok(before.every((d) => d.state === "outside"),
      "days before the first recorded drawing are outside the covered period");
  });

  test("both members appear on a shared date, in configured order", () => {
    const { months } = cal();
    const multi = months.flatMap((mo) => mo.days).filter((d) => d.rows.length > 1);
    assert.ok(multi.length > 0, "at least one date must carry both drawings");
    for (const d of multi) {
      const orders = d.rows.map((r) => r.memberOrder);
      assert.deepEqual(orders, [...orders].sort((a, b) => a - b), `${d.dateIso} is out of configured order`);
      assert.equal(new Set(d.rows.map((r) => r.gameId)).size, d.rows.length, "each row keeps its own game id");
    }
  });

  test("the grid aligns to the weekday of the 1st, computed without a local timezone", () => {
    const { months } = cal();
    for (const mo of months) {
      assert.equal(mo.leadingBlanks, mo.days[0].weekday, `${mo.label} alignment`);
      assert.ok(mo.leadingBlanks >= 0 && mo.leadingBlanks <= 6);
    }
    const code = codeOnly("lib/archive/archiveCalendar.ts");
    assert.match(code, /T12:00:00Z/, "the weekday must be pinned to noon UTC");
    assert.ok(!/new Date\(\)/.test(code), "no wall-clock read");
  });

  test("the agenda lists only dates that have drawings", () => {
    const { agenda } = cal();
    for (const d of agenda) assert.ok(d.rows.length > 0, `${d.dateIso} has no drawings and must not be listed`);
    assert.equal(agenda.length, new Set(archive().rows.map((r) => r.drawDateIso)).size);
  });

  test("the table stays the server-rendered default and the views are a client island", () => {
    /* The crawlability guarantee: had the switch owned both views, the table would have become client-rendered. */
    assert.ok(!/^"use client"/m.test(src("components/archive/ArchiveView.tsx")));
    assert.match(src("components/archive/ArchiveResultViews.tsx"), /^"use client"/);
    const island = codeOnly("components/archive/ArchiveResultViews.tsx");
    assert.match(island, /useState<ViewMode>\("table"\)/, "table is the initial view");
    assert.ok(!/<table/.test(island), "the results table itself is not rendered by the island");
  });

  test("the view preference is not persisted anywhere", () => {
    /* `FD-ACC-07`: no Account persistence exists, and device storage was deliberately removed once already. */
    const island = codeOnly("components/archive/ArchiveResultViews.tsx");
    assert.ok(!/localStorage|sessionStorage|document\.cookie/.test(island));
  });
});

describe("LRG-ARCHIVE-057 (2): the result detail", () => {
  test("it renders only real archive information", () => {
    const island = src("components/archive/ArchiveResultViews.tsx");
    const detail = island.slice(island.indexOf("export function ResultDetail"), island.indexOf("export default"));
    for (const field of ["Date", "Winning", "Source", "Last updated"]) {
      assert.match(detail, new RegExp(field), `${field} must be present`);
    }
    /* `FD-ACC-07` and the direction's explicit prohibition. */
    for (const banned of ["Save", "Discuss", "Reminder", "Follow", "Alert"]) {
      assert.ok(!new RegExp(`>${banned}`).test(detail), `${banned} must not appear in the detail`);
    }
  });

  test("it is keyboard-operable, focus-managed and dismissible by construction", () => {
    /*
     * A native `<details>` gives all three without a focus trap, an escape handler or scroll locking — four things
     * a hand-built dialog would have to get right for no reader benefit, and one of which (a trap) is actively
     * hostile at 390 px.
     */
    const island = src("components/archive/ArchiveResultViews.tsx");
    assert.match(island, /<details className="lca-detail"/);
    assert.match(island, /<summary className="lca-detail__summary"/);
    const css = src("app/globals.css");
    assert.match(css, /\.lca-detail__summary:focus-visible/, "a visible focus ring is required");
    assert.match(css, /\.lca-detail__summary \{[\s\S]{0,200}min-height: 44px/, "44 px target");
  });

  test("a correction shows in the detail only when the gate passes", () => {
    const island = codeOnly("components/archive/ArchiveResultViews.tsx");
    assert.match(island, /isGenuineCorrection\(row\.correction\)/);
    /* Today no fixture correction is sourced, so no detail shows correction fields. */
    assert.equal(archive().hasPublishedCorrection, false);
  });
});

describe("LRG-ARCHIVE-057 (3): the analytics workspace", () => {
  test("the four primary analyses are unchanged and still open by default", () => {
    const primary = archive().analysis.filter((v) => v.primary).map((v) => v.key).sort();
    assert.deepEqual(primary, ["number-frequency", "shape-distribution", "sum-distribution", "variant-comparison"]);
  });

  test("the advanced analyses are present, secondary, and computed from real rows", () => {
    const m = archive();
    const keys = m.analysis.map((v) => v.key);
    for (const k of ["pair-front", "pair-back", "consecutive", "monthly-comparison", "historical-gaps",
                     "previous-repeat"]) {
      assert.ok(keys.includes(k), `${k} must be surfaced`);
      assert.equal(m.analysis.find((v) => v.key === k)!.primary, false, `${k} must be secondary`);
    }
  });

  test("consecutive-pattern counts are arithmetically correct", () => {
    const m = archive();
    const view = m.analysis.find((v) => v.key === "consecutive")!;
    const expected = m.rows.filter((r) => {
      const sorted = [...r.mainValues].sort((a, b) => a - b);
      return sorted.some((v, i) => i > 0 && v - sorted[i - 1] === 1);
    }).length;
    assert.equal(view.rows[0].count, expected, "the figure must match a direct recount");
    assert.equal(view.rows[0].count + view.rows[1].count, m.rows.length, "the two rows must partition the set");
  });

  test("monthly comparison counts match the month index exactly", () => {
    const m = archive();
    const view = m.analysis.find((v) => v.key === "monthly-comparison")!;
    for (const row of view.rows) {
      const month = m.months.find((x) => x.label === row.label)!;
      assert.equal(row.count, month.drawCount, `${row.label} must match the month index`);
    }
    assert.equal(view.rows.reduce((n, r) => n + r.count, 0), m.rows.length);
  });

  test("historical gaps are descriptive and never predictive", () => {
    const m = archive();
    const view = m.analysis.find((v) => v.key === "historical-gaps")!;
    /* The most language-sensitive view on the page. */
    assert.match(view.method, /describes what has already happened/);
    assert.match(view.method, /says nothing about which values will be drawn next/);
    assert.ok(!/overdue|due\b|hot|cold|lucky|likely/i.test(view.title + view.method));
    for (const r of view.rows) {
      assert.ok(!/overdue|due\b|lucky/i.test(r.label + r.value), `gap row "${r.label}" uses forbidden framing`);
    }
    /* One row per value in range, so no value is silently omitted. */
    assert.equal(view.rows.length, (m.profile.main!.max - m.profile.main!.min) + 1);
  });

  test("every analysis string passes the neutral-language rule", () => {
    const m = archive();
    assertNeutralLanguage(m.analysis.flatMap((v) => [v.title, v.method, v.period, v.variants,
      ...v.rows.flatMap((r) => [r.label, r.value])]));
  });

  test("every analysis view still exposes period, variants, draw count and method", () => {
    for (const v of archive().analysis) {
      assert.ok(v.period.length > 0 && v.variants.length > 0 && v.method.length > 0 && v.drawCount > 0, v.key);
      assert.ok(v.rows.length > 0, `${v.key} must have table rows`);
    }
  });

  test("the disclosure is labelled as the direction requires and stays keyboard-operable", () => {
    const view = src("components/archive/ArchiveView.tsx");
    assert.match(view, /Explore more analytics/);
    assert.match(src("app/globals.css"), /\.lca-details__summary:focus-visible/);
  });

  test("Compare Years is absent — it is blocked by data", () => {
    /* `FD-ACC-09`: hidden until two genuine years are registered. One is. */
    const m = archive();
    const text = [...m.analysis.map((v) => v.title), ...m.tools.map((t) => t.title),
                  ...m.nextActions.map((a) => a.label)].join(" ");
    assert.ok(!/compare year/i.test(text));
    assert.equal(m.yearNav.years.length, 1);
  });
});

describe("LRG-ARCHIVE-057 (4): the two new Ask intents", () => {
  const ask = (q: string) => {
    const m = archive();
    return askArchive(q, m.rows, m.profile, m.members, m.archiveYear, `${m.stateName} ${m.gameLabel}`);
  };

  test("a consecutive-pattern question is understood and grounded", () => {
    const a = ask("How often were two values next to each other?");
    assert.equal(a.understood, true);
    assert.ok(a.interpretation.some((i) => i.value.includes("adjacent")));
    assert.match(a.explanation, /\d+ of \d+ drawings/);
    assert.match(a.explanation, /describes this period only/);
    assert.ok(a.rows.length > 0, "supporting rows must be shown");
    /* Every row shown must actually contain an adjacent pair — the evidence has to evidence the claim. */
    for (const r of a.rows) {
      const sorted = [...r.mainValues].sort((x, y) => x - y);
      assert.ok(sorted.some((v, i) => i > 0 && v - sorted[i - 1] === 1), `${r.drawDateIso} is not an example`);
    }
    assert.ok(a.evidence.length > 0);
    assertNeutralLanguage([a.explanation]);
  });

  test("a gap question is understood and phrased non-predictively", () => {
    const a = ask("How long since 7 last appeared?");
    assert.equal(a.understood, true);
    assert.match(a.explanation, /last appeared/);
    assert.match(a.explanation, /does not affect the next drawing/);
    assert.ok(!/overdue|due\b|lucky|likely/i.test(a.explanation));
    assertNeutralLanguage([a.explanation]);
  });

  test("an aggregate question scoped to a month reports over that month", () => {
    const a = ask("How often were two values adjacent in March?");
    assert.ok(a.interpretation.some((i) => i.label === "Month" && i.value === "March"));
    assert.match(a.explanation, /in March/);
  });

  test("a window too thin to describe says so instead of reporting a figure", () => {
    /* The *"state limitations naturally"* requirement, and the reason it matters: four drawings is not a pattern. */
    const m = archive();
    const july = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), monthKey: "2026-07" });
    assert.ok(july.rows.length < 5, "July holds four drawings, which is the thin case");
    const a = ask("How often were two values adjacent in July?");
    assert.match(a.explanation, /too few to describe a pattern/);
  });

  test("the original intents still work", () => {
    const m = archive();
    const exact = ask(`Did ${m.rows[0].mainValues.join("")} appear this year?`);
    assert.equal(exact.understood, true);
    assert.ok(exact.matchingCount > 0);
    const doubles = ask("Show all Midday doubles in March.");
    assert.equal(doubles.understood, true);
    for (const r of doubles.rows) assert.equal(r.shape, "double");
  });

  test("no answer claims a live model and none is persisted", () => {
    const ws = codeOnly("components/archive/ArchiveWorkspace.tsx");
    assert.match(ws, /Answers are based on the results in this archive/);
    assert.ok(!/localStorage|sessionStorage/.test(ws), "no conversational persistence");
    for (const a of [ask("How often were two values adjacent?"), ask("Did 378 appear?")]) {
      assert.ok(!/I think|probably|will appear|predict/i.test(a.explanation));
    }
  });
});

describe("LRG-ARCHIVE-057 (6): public CSV and print", () => {
  test("RFC 4180 escaping, including the fields that genuinely contain commas", () => {
    assert.equal(escapeCsvField("plain"), "plain");
    assert.equal(escapeCsvField("has,comma"), '"has,comma"');
    assert.equal(escapeCsvField('has"quote'), '"has""quote"');
    assert.equal(escapeCsvField("line\nbreak"), '"line\nbreak"');
    assert.equal(escapeCsvField("carriage\rreturn"), '"carriage\rreturn"');
    /* Formula-injection guard: a spreadsheet evaluates a leading =, +, - or @. */
    assert.equal(escapeCsvField("=SUM(A1)"), "\t=SUM(A1)");
    assert.equal(escapeCsvField("+1"), "\t+1");
    assert.equal(escapeCsvField("-1"), "\t-1");
    assert.equal(escapeCsvField("@x"), "\t@x");
  });

  test("the full-year CSV carries every required field", () => {
    const m = archive();
    const build = buildArchiveCsv(m, m.rows, "year");
    assert.equal(build.dataRows, m.rows.length);
    assert.match(build.filename, /^fl-pick-3-2026-results\.csv$/);
    for (const required of ["Game", "Archive year", "Last updated", "Source", "Coverage", "Methodology"]) {
      assert.ok(build.content.includes(required), `${required} must appear in the context block`);
    }
    assert.ok(build.content.includes("Florida Pick 3"));
    assert.ok(build.content.includes("2026"));
    assert.ok(build.content.includes("Fireball"), "the add-on column must be present for this game");
    assert.match(build.content, /\r\n$/, "CRLF line endings, terminated");
  });

  test("CSV content matches the rendered rows exactly", () => {
    const m = archive();
    const build = buildArchiveCsv(m, m.rows, "year");
    const lines = build.content.trim().split("\r\n");
    const headerIndex = lines.findIndex((l) => l.startsWith("Game,Year,Draw date"));
    assert.ok(headerIndex > 0, "a data header must exist after the context block");
    const dataLines = lines.slice(headerIndex + 1);
    assert.equal(dataLines.length, m.rows.length);
    /* Spot-check the first row against the model, value by value. */
    const first = m.rows[0];
    const cells = dataLines[0].split(",");
    assert.equal(cells[2], first.drawDateIso);
    assert.equal(cells[3], first.variantLabel);
    for (let i = 0; i < first.mainValues.length; i++) {
      assert.equal(cells[4 + i], String(first.mainValues[i]), `value ${i + 1}`);
    }
  });

  test("an absent add-on is an empty cell, never a zero", () => {
    /* `0` is a legitimate Fireball value, so writing 0 for "not recorded" would fabricate a drawn value. */
    const m = archive();
    const missing = m.rows.filter((r) => r.addOnValue === null);
    assert.ok(missing.length > 0, "the fixture includes rows with no add-on");
    const build = buildArchiveCsv(m, missing, "filtered");
    const lines = build.content.trim().split("\r\n");
    const dataLines = lines.slice(lines.findIndex((l) => l.startsWith("Game,Year,Draw date")) + 1);
    for (const line of dataLines) {
      const cells = line.split(",");
      assert.equal(cells[7], "", "the add-on cell must be empty, not 0");
    }
  });

  test("a filtered CSV states what it contains", () => {
    const m = archive();
    const march = filterArchive(m.rows, m.profile, { ...defaultArchiveFilter(), monthKey: "2026-03" });
    const build = buildArchiveCsv(m, march.rows, "filtered");
    assert.match(build.filename, /filtered-results\.csv$/);
    assert.ok(build.content.includes(`Filtered selection — ${march.rows.length} of ${m.rows.length}`));
  });

  test("the CSV is deterministic — no wall-clock generation date", () => {
    const m = archive();
    assert.equal(buildArchiveCsv(m, m.rows, "year").content, buildArchiveCsv(m, m.rows, "year").content);
    const code = codeOnly("lib/archive/archiveDownload.ts");
    assert.ok(!/Date\.now\(\)|new Date\(\)/.test(code), "the date comes from the archive, not the clock");
  });

  test("the download executes only behind the account gate, and no limit outcome is faked", () => {
    /*
     * ══ UPDATED DELIBERATELY — the previous assertion here is REVERSED BY DESIGN ══
     *
     * Under LRG-ARCHIVE-059 this test asserted the download surfaces were ABSENT, because `FD-DAT-16` removed
     * them while "no sign-in flow exists" made any gate a dead control. That ruling carries its own
     * restoration condition — "restore those visible controls when the real shared Account and sign-in
     * continuation flow works end to end" — and Conflict 37 (source-conflicts.md, 2026-08-11) met it. So the
     * controls are REQUIRED again, in the recorded visible-gate form.
     */
    const island = codeOnly("components/archive/ArchiveResultViews.tsx");
    assert.match(island, /buildArchiveCsv/, "the kept builder is finally invoked from the page");
    assert.match(island, /new Blob/, "the signed-in download genuinely produces a file");
    assert.match(island, /lca-downloads/, "the download controls render in their final position (FD-DAT-03)");
    /* The gate is the SHARED affordance (FD-DAT-04), never a re-worded local copy, and never disabled. */
    assert.match(island, /SignInToUse/);
    assert.ok(!/\bdisabled\b(?!\s*(state|button|controls))/.test(island), "no disabled control (FD-ACC-14)");
    /* FD-DAT-11/FD-DAT-18: limits are server work. The client must not invent a rejection about a ledger
       that does not exist — no fake limit error, ever. The shapes live in EXPORT_LIMIT_CONTRACT as a
       contract note for the API phase. */
    assert.ok(!/limit (reached|exceeded)|over your limit|allowance (used|exceeded)/i.test(island),
      "no fake limit outcome is rendered");
    assert.ok(!/EXPORT_LIMIT_CONTRACT/.test(island), "the contract note gates nothing client-side");
  });

  test("the provided print action is back behind the gate; browser printing was never gated", () => {
    /*
     * `FD-DAT-09`: ordinary browser printing cannot be prevented and is not gated. Our PROVIDED print button
     * is the thing `FD-DAT-01` gates — removed under LRG-ARCHIVE-059, restored under `FD-DAT-16`'s own
     * condition (Conflict 37). PDF generation stays out of scope (founder direction §6).
     */
    const island = codeOnly("components/archive/ArchiveResultViews.tsx");
    assert.ok(!/pdf/i.test(island));
    assert.match(island, /window\.print\(\)/, "the provided print action executes when signed in");
    /* Cmd+P still produces a properly formatted sheet — the stylesheet is untouched. */
    const css = src("app/globals.css");
    assert.match(css, /@media print/);
    assert.match(css, /\.lca-printhead \{ display: none; \}/);
  });

  test("the print sheet carries its own identity and responsible-use statement", () => {
    const view = src("components/archive/ArchiveView.tsx");
    const head = view.slice(view.indexOf("lca-printhead"), view.indexOf("m.order.map"));
    assert.match(head, /m\.stateName/);
    assert.match(head, /m\.archiveYear/);
    assert.match(head, /m\.coverage\.sourceLabel/);
    assert.match(head, /m\.coverage\.lastUpdatedIso/);
    assert.match(head, /m\.previewBanner/, "printed samples must still say they are samples");
    assert.match(head, /m\.neutrality/, "the responsible-use statement must print");
    const css = src("app/globals.css");
    assert.match(css, /@media print/);
    assert.match(css, /thead \{ display: table-header-group/, "repeat the header across pages");
    assert.match(css, /tr \{ break-inside: avoid/, "never split a drawing across a page break");
  });
});

describe("LRG-ARCHIVE-057 (7): the shell account promises are gone", () => {
  test("account capabilities are off in the default shell profile", () => {
    assert.equal(DEFAULT_SHELL_CAPABILITIES.account, false);
    assert.equal(DEFAULT_SHELL_CAPABILITIES.favourites, false);
  });

  test("the favourite star defaults to not rendering", () => {
    /*
     * `DynamicResultCard` gates the star on a DATA flag, not on the shell capability, so turning the capability off
     * did not reach it. The component's own default had to flip.
     */
    /* FD-GATE-01 archived the legacy account hooks with the templates that rendered them. */
    const code = codeOnly("components/archived/legacy/account/AccountHooks.tsx");
    assert.match(code, /FavoriteStar\(\{ label, enabled = false \}/);
    assert.match(code, /if \(!enabled\) return null/);
  });

  test("the sign-in routes that exist are the real registered ones, and no placeholder variant exists", () => {
    /*
     * UPDATED DELIBERATELY under Conflict 37 (source-conflicts.md, 2026-08-11). This test used to assert
     * that NO sign-in route existed, because `FD-DAT-17` forbade a placeholder. The Tier-1 founder
     * authorization shipped the real flow: /login and /signup work end to end against the review data
     * layer and are registered in the page-family registry. The placeholder VARIANTS stay forbidden — one
     * flow, at the registered routes, and nothing else.
     */
    for (const d of ["login", "signup"]) {
      assert.ok(readFileSync(new URL(`../app/${d}/page.tsx`, import.meta.url), "utf8").length > 0);
    }
    for (const d of ["signin", "sign-in", "register", "account", "members"]) {
      assert.throws(() => readFileSync(new URL(`../app/${d}/page.tsx`, import.meta.url)), `app/${d} must not exist`);
    }
  });

  test("the archive itself renders no account control and no personal capability", () => {
    const m = archive();
    /* `FD-ACC-07`: hidden means absent. */
    const text = [...m.tools.map((t) => `${t.title} ${t.summary}`), ...m.nextActions.map((a) => a.label)].join(" ");
    for (const banned of ["sign in", "save", "follow", "alert", "bookmark", "coming soon"]) {
      assert.ok(!new RegExp(banned, "i").test(text), `"${banned}" must not appear: ${text}`);
    }
    assert.equal(m.sectionState["AR-08"].render, false, "AR-08 stays reserved (FD-ACC-08)");
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * LRG-ARCHIVE-058 — CALENDAR DAY-STATE ACCURACY.
 *
 * Authority: the 2026-08-06 founder verification §1. *"An absent archive row is not, by itself, proof that no
 * drawing occurred."*
 *
 * THE DEFECT: any covered date with no row was labelled `No drawing`. On `/fl/pick-3/2026` that was 160 false
 * claims — both members register `drawDays: "Daily"`, so a drawing did occur on every one of those dates.
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

describe("LRG-ARCHIVE-058: a missing row can never create a false No drawing claim", () => {
  test("the registered schedule is read from the operator's own field", () => {
    const m = archive();
    assert.deepEqual(m.schedule, { kind: "daily" }, "both Pick 3 members register drawDays: Daily");
  });

  test("coverage is measured against what the schedule expects", () => {
    const m = archive();
    const c = m.scheduleCoverage;
    assert.equal(c.daysInRange, 187);
    assert.equal(c.expectedDrawDates, 187, "a daily game expects a drawing on every date in range");
    assert.equal(c.datesWithRows, 27, "the fixture covers four dates a month");
    assert.equal(c.complete, false, "27 of 187 is emphatically incomplete");
  });

  test("NO cell claims No drawing, because the schedule cannot support it", () => {
    /* The assertion the defect would have failed: 160 cells said "No drawing" about a daily game. */
    const m = archive();
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, 7),
      m.coveredFromIso, m.coveredToIso, m.schedule, m.scheduleCoverage,
    );
    const days = months.flatMap((mo) => mo.days);
    assert.equal(days.filter((d) => d.state === "noDrawing").length, 0);
    assert.equal(days.filter((d) => d.state === "drawn").length, 27);
    assert.equal(days.filter((d) => d.state === "noRegisteredResult").length, 160);
    assert.equal(days.filter((d) => d.state === "outside").length, 25);
  });

  test("an incomplete archive downgrades every scheduled-but-missing date to No registered result", () => {
    const m = archive();
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, 7),
      m.coveredFromIso, m.coveredToIso, m.schedule, m.scheduleCoverage,
    );
    for (const d of months.flatMap((mo) => mo.days)) {
      if (d.state !== "noRegisteredResult") continue;
      /* Every one of them is a date the schedule says had a drawing — hence the downgrade. */
      assert.equal(scheduleDrawsOn(m.schedule, d.weekday), true);
      assert.equal(d.rows.length, 0);
    }
  });

  test("with no schedule at all, No drawing is still unreachable", () => {
    /* The safe default: an unreadable schedule must never license a claim. */
    const m = archive();
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, 7),
      m.coveredFromIso, m.coveredToIso, { kind: "unknown" },
    );
    const days = months.flatMap((mo) => mo.days);
    assert.equal(days.filter((d) => d.state === "noDrawing").length, 0);
    assert.ok(days.some((d) => d.state === "noRegisteredResult"));
  });

  test("a schedule that EXCLUDES a weekday does license No drawing", () => {
    /*
     * The positive case, proving the state is still reachable when evidence exists — otherwise this correction
     * would have removed a true statement along with the false ones.
     */
    const m = archive();
    const wedSat = parseDrawDays("Wed & Sat");
    assert.deepEqual(wedSat, { kind: "weekdays", days: [3, 6] });
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, calendarMonthKeys(m.archiveYear, 7),
      m.coveredFromIso, m.coveredToIso, wedSat,
      assessCoverage(m.rows.map((r) => r.drawDateIso), m.coveredFromIso, m.coveredToIso, wedSat),
    );
    const days = months.flatMap((mo) => mo.days);
    const claimed = days.filter((d) => d.state === "noDrawing");
    assert.ok(claimed.length > 0, "a Mon/Tue/Thu/Fri/Sun is provably not a draw day for this schedule");
    for (const d of claimed) {
      assert.ok(![3, 6].includes(d.weekday), `${d.dateIso} falls on a scheduled draw day and cannot be claimed`);
      assert.equal(d.rows.length, 0);
    }
  });

  test("an explicit no-draw record licenses the claim regardless of schedule", () => {
    /* The `game_daysoff` path, ready for when that table is connected. */
    const m = archive();
    const target = "2026-03-07";
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, ["2026-03"], m.coveredFromIso, m.coveredToIso,
      m.schedule, m.scheduleCoverage, [target],
    );
    const day = months[0].days.find((d) => d.dateIso === target)!;
    assert.equal(day.state, "noDrawing", "an upstream day-off record is unambiguous evidence");
  });

  test("complete coverage plus a scheduled day licenses the claim", () => {
    /* A complete archive genuinely can conclude a scheduled drawing did not occur. */
    const m = archive();
    const fabricatedComplete = { ...m.scheduleCoverage, complete: true };
    const months = buildCalendarMonths(
      m.rows, m.archiveYear, ["2026-03"], m.coveredFromIso, m.coveredToIso,
      m.schedule, fabricatedComplete,
    );
    const missing = months[0].days.filter((d) => d.rows.length === 0 && d.state !== "outside");
    assert.ok(missing.length > 0);
    assert.ok(missing.every((d) => d.state === "noDrawing"));
  });

  test("the schedule parser refuses to guess", () => {
    assert.deepEqual(parseDrawDays("Daily"), { kind: "daily" });
    assert.deepEqual(parseDrawDays("Mon, Wed & Sat"), { kind: "weekdays", days: [1, 3, 6] });
    assert.deepEqual(parseDrawDays("Tue & Fri"), { kind: "weekdays", days: [2, 5] });
    /* Every unreadable form is `unknown`, never a partial guess. */
    for (const bad of ["", "   ", null, undefined, "twice a week", "see operator"]) {
      assert.deepEqual(parseDrawDays(bad as string), { kind: "unknown" }, `"${bad}" must not be guessed at`);
    }
  });

  test("combining member schedules is a union, and unknown poisons it", () => {
    assert.deepEqual(combineSchedules([{ kind: "daily" }, { kind: "weekdays", days: [1] }]), { kind: "daily" });
    assert.deepEqual(
      combineSchedules([{ kind: "weekdays", days: [1, 3] }, { kind: "weekdays", days: [3, 6] }]),
      { kind: "weekdays", days: [1, 3, 6] },
    );
    /* If one member's schedule is unreadable we cannot rule out that it draws — so the family is unknown. */
    assert.deepEqual(combineSchedules([{ kind: "daily" }, { kind: "unknown" }]), { kind: "unknown" });
    assert.deepEqual(combineSchedules([]), { kind: "unknown" });
  });

  test("scheduleDrawsOn returns three states, not a boolean", () => {
    assert.equal(scheduleDrawsOn({ kind: "daily" }, 0), true);
    assert.equal(scheduleDrawsOn({ kind: "weekdays", days: [3, 6] }, 3), true);
    assert.equal(scheduleDrawsOn({ kind: "weekdays", days: [3, 6] }, 1), false);
    /* The distinction the whole defect turned on: unknown is not "no". */
    assert.equal(scheduleDrawsOn({ kind: "unknown" }, 1), null);
  });

  test("weekday alignment stays pinned to noon UTC", () => {
    const code = codeOnly("lib/archive/archiveCalendar.ts");
    assert.match(code, /T12:00:00Z/);
    assert.ok(!/new Date\(\)/.test(code));
    const sched = codeOnly("lib/archive/archiveSchedule.ts");
    assert.match(sched, /T12:00:00Z/, "the coverage walk must step by noon-UTC days");
    assert.ok(!/new Date\(\)/.test(sched));
  });

  test("the composition renders the fourth state and explains the gaps once", () => {
    const island = src("components/archive/ArchiveResultViews.tsx");
    assert.match(island, /No registered result/);
    assert.match(island, /lca-calcell__unknown/);
    /* One coverage note, shown only when coverage is genuinely incomplete. */
    assert.match(island, /!m\.scheduleCoverage\.complete/);
    /* `codeOnly`: the module's header comment legitimately quotes the label while explaining the defect. */
    const islandCode = codeOnly("components/archive/ArchiveResultViews.tsx");
    assert.equal((islandCode.match(/No registered result/g) ?? []).length, 2, "the cell label and the one note");
    /* And the muted style must not read as an error. */
    const css = src("app/globals.css");
    assert.match(css, /\.lca-calcell__unknown \{[^}]*color: var\(--color-text-muted\)/);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * LRG-ARCHIVE-059 — ACCOUNT-GATING ASK AND EXPORT — now in the RESTORED, visible-gate state.
 *
 * Authority: `DATA-DEC-001` (`03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md`), founder
 * decision of 2026-08-06, which supersedes `FD-ACC-05` as to Ask execution and provided downloads.
 *
 * ══ THIS BLOCK WAS REWRITTEN DELIBERATELY, REVERSING ITS OWN EARLIER ASSERTIONS BY DESIGN ══
 *
 * The earlier form asserted the executing surfaces were ABSENT — correct while `FD-DAT-16`'s removal held,
 * because no sign-in flow existed and `FD-DAT-17` forbade a dead control. `FD-DAT-16` also recorded its own
 * restoration condition: "restore those visible controls when the real shared Account and sign-in
 * continuation flow works end to end." Conflict 37 (source-conflicts.md, 2026-08-11) shipped that flow, so
 * the condition is MET and these tests now assert the RECORDED target experience instead of the removal:
 * present and legible signed out, `Sign in free to use` via the shared affordance, executing signed in,
 * intent-based continuation, and no faked metering.
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

describe("LRG-ARCHIVE-059/FD-DAT-16: Ask and export render in the visible-gate form", () => {
  test("the Ask surface renders again, composed by AR-03", () => {
    /* `FD-DAT-02` still gates EXECUTION; the surface itself is visible (`FD-DAT-03`). */
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.match(view, /part="ask"/, "AR-03 composes the Ask workspace again (FD-DAT-16 condition met)");
  });

  test("every gate is the real shared affordance, and nothing renders disabled", () => {
    /*
     * `FD-DAT-04`: the label is the shared `SignInToUse` component's exact wording, never a local re-word.
     * `FD-ACC-14` stands: nothing is drawn disabled — the control works in both account states, it just does
     * a different honest thing (capture an intent vs. execute).
     */
    for (const f of [
      "components/archive/ArchiveResultViews.tsx",
      "components/archive/ArchiveWorkspace.tsx",
    ]) {
      const code = codeOnly(f);
      assert.match(code, /SignInToUse/, `${f} gates through the shared affordance`);
      assert.ok(!/Coming soon/i.test(code), `${f} promises nothing`);
      assert.ok(!/"Sign in free to use"/.test(code), `${f} must not retype the FD-DAT-04 wording locally`);
      assert.ok(!/\bdisabled\b(?!\s*(state|button|controls))/.test(code), `${f} renders no disabled control`);
      /* FD-ACC-12: only the nonce crosses the boundary — no direct login link carrying state. */
      assert.ok(!/"\/(signin|sign-in|login|register|account)/.test(code), `${f} links to no login route directly`);
    }
    /*
     * AR-08 stays RESERVED (`FD-ACC-08`) — Personal Archive Tools remain a future slot. Restoring ask and
     * export under FD-DAT-16 did not touch it.
     */
    assert.ok(!AR_ORDER.includes("AR-08"), "AR-08 stays out of the composed order");
    assert.equal(archive().sectionState["AR-08"].render, false, "AR-08 stays reserved (FD-ACC-08)");
  });

  test("the export builder is kept, tested — and finally invoked by the restored control", () => {
    /*
     * `FD-DAT-16` KEEP, unchanged: the RFC 4180 escaping and the formula-injection guard are what the future
     * server endpoint calls too. What changed is that the page now genuinely uses it when signed in.
     */
    const m = archive();
    const build = buildArchiveCsv(m, m.rows, "year");
    assert.equal(build.dataRows, m.rows.length, "the builder still emits every row");
    assert.ok(build.content.length > 0 && build.filename.length > 0);
    assert.match(codeOnly("components/archive/ArchiveResultViews.tsx"), /buildArchiveCsv/);
  });

  test("the Ask interpreter is kept and still grounded", () => {
    /* `FD-DAT-16` KEEP. The surface is gone; the interpreter must not rot while it waits. */
    const m = archive();
    const answer = askArchive(m.askPrompts[0], m.rows, m.profile, m.members, 2026, "Florida Pick 3");
    assert.ok(answer.understood, "the interpreter still parses its own suggested question");
    assert.ok(answer.explanation.length > 0, "an answer still explains itself from archive rows");
    assert.ok(answer.evidence.length > 0, "and still cites the rows it came from");
  });

  test("no export or Ask endpoint was introduced", () => {
    /* `FD-DAT-14`. Not even a convenience route for the client island. */
    const walk = (dir: URL): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(new URL(`${e.name}/`, dir)) : [`${dir.pathname}${e.name}`],
      );
    const routes = walk(new URL("../app/", import.meta.url))
      .filter((f) => /\/route\.tsx?$/.test(f))
      .map((f) => f.slice(f.indexOf("/app/") + 4));
    /* `app/buynow/[code]/route.ts` is the pre-existing first-party commerce resolver and is unrelated. */
    assert.deepEqual(routes, ["/buynow/[code]/route.ts"], "no export, CSV or Ask endpoint was added");
  });

  test("browser printing still works and is not gated", () => {
    /*
     * `FD-DAT-09`. The reader's own Cmd/Ctrl+P is theirs and cannot be prevented; only our provided button was
     * removed. The print presentation must therefore survive intact.
     */
    const css = src("app/globals.css");
    assert.match(css, /@media print/);
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.match(view, /lca-printhead/, "the print-only header still renders");
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 * LRG-ARCHIVE-060 — THE AR-03 YEAR BRIEF IS NOT AN AI EXECUTION.
 *
 * Authority: `DATA-DEC-001` `FD-DAT-20`, the founder ruling of 2026-08-06 resolving open item 1. The brief is a
 * deterministic summary over public archive statistics: it stays public, it is not described as AI, and it
 * consumes no AI allowance and writes no `FD-DAT-12` ledger entry.
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

describe("LRG-ARCHIVE-060: the year brief is deterministic, public and not labelled AI", () => {
  test("AR-03 is composed and public", () => {
    /* `FD-DAT-20` point 1. It sits behind no gate and no capability flag. */
    assert.ok(AR_ORDER.includes("AR-03"));
    const m = archive();
    assert.ok(m.sectionState["AR-03"]?.render === true, "AR-03 renders for an anonymous reader");
    assert.ok((m.brief?.points.length ?? 0) >= 3, "and it still carries its observations");
  });

  test("no part of the surface describes itself as AI", () => {
    /* `FD-DAT-20` point 5 — in either direction: no claim, and no disclaimer that reintroduces the idea. */
    const m = archive();
    for (const s of [m.brief!.heading, m.brief!.label, m.brief!.evidenceLine, m.brief!.generation,
                     ...m.brief!.points.flatMap((p) => [p.text, p.evidence])]) {
      assert.ok(!/\bAI\b/i.test(s), `brief copy must not mention AI: ${s}`);
    }
    const view = codeOnly("components/archive/ArchiveView.tsx");
    assert.ok(!/lca-ailabel/.test(view), "the label's class no longer calls it an AI label");
    assert.match(view, /lca-brieflabel/);
  });

  test("the label reads as a LotteryCorner brief, not a model output", () => {
    const m = archive();
    assert.equal(m.brief!.label, "LotteryCorner Year-to-Date Brief");
  });

  test("every figure in the brief is counted, not generated", () => {
    /*
     * `FD-DAT-20` point 3. This is why the ruling holds: each observation is arithmetic over rows this module
     * computed, so it is reproducible from the same archive without any provider.
     */
    const m = archive();
    assert.deepEqual(archive().brief, archive().brief, "two builds of the same archive produce an identical brief");
    /* And the repeated-value observation matches a count taken directly off the rows. */
    const repeated = m.rows.filter((r) => new Set(r.mainValues).size < r.mainValues.length).length;
    assert.ok(m.brief!.points.some((p) => p.text.includes(String(repeated))),
      "the brief's figures are the archive's own counts");
  });

  test("no AI allowance or usage ledger is touched by the brief", () => {
    /*
     * `FD-DAT-20` point 4. Nothing to enforce here beyond absence: there is no provider call, no counter and no
     * ledger write anywhere in the model, so no `FD-DAT-12` entry can exist.
     */
    const model = codeOnly("lib/archive/archiveModel.ts");
    /* No network call, and no model inference of any kind. */
    assert.ok(!/\bfetch\(|XMLHttpRequest|openai|anthropic|completions?\(|inference/i.test(model),
      "the brief calls no provider");
    /* And nothing that would meter a request. `gameRuleProvider` is the rule-era source and is unrelated. */
    assert.ok(!/allowance|quota|usageLedger|tokenCount|estimatedCost/i.test(model),
      "the brief meters nothing, because there is nothing to meter");
  });
});
