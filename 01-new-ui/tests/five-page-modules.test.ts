/*
 * THE FIVE-PAGE FINALIZATION MODULES — §A and §B.
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. A COUNTDOWN THAT IS WRONG. A relative draw label computed against the reader's clock instead of the game's
 *      is the legacy off-by-one defect `CLAUDE.md` §14 names as "a symptom to test against". Every case here is
 *      asserted across a real DST boundary and from three different reader timezones.
 *   2. A JACKPOT DELTA THAT WAS ESTIMATED. §14 names jackpots explicitly as content that must never be synthetic.
 *      The parser is asserted to REFUSE every approximate form rather than coerce it.
 *   3. A SCHEDULE THAT CLAIMS A GAME DOES NOT DRAW when its days are simply unpublished.
 *   4. AN EXIT RAMP POINTING AT NOTHING — a link to a suppressed section or an unregistered archive year.
 *   5. THE §42-§45 SECTION CONTRACT drifting back into five per-family implementations.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  nextDrawInstant, nextDrawRelativeLabel, parseLocalTime, relativeDrawDayLabel, relativeDrawLabel, zonedInstant,
} from "../lib/time/nextDraw";
import { jackpotChange, parseAmount } from "../lib/text/jackpotDelta";
import { formatLastUpdated, lastUpdatedSourceLine } from "../lib/text/lastUpdated";
import { weeklyDrawSchedule, WEEKDAY_NAMES } from "../lib/state/weeklyDrawSchedule";
import { gameExitRamps } from "../lib/game/gameExitRamps";
/* Imported from `lib`, not from the `.tsx` renderers: Node cannot execute a `.tsx` module, so a constant only a
   component exports is a constant no test can assert the SHAPE of — which is how a §43 state list silently loses
   a member. The contracts live in `lib/shell/*` for exactly this reason. */
import { EXIT_RAMP_ORDER } from "../lib/shell/exitRamps";
import { SECTION_STATES } from "../lib/shell/sectionContract";
import {
  BOTTOM_NAV_LABELS, HOME_NAV_ANCHORS, PRIMARY_NAV_LABELS, SHARED_ASK_ANCHOR, globalShell,
} from "../lib/shell/globalShellModel";
import { servesPage } from "../lib/registry/pageFamilyRegistry";
import { STATE_MERGED_SECTIONS, STATE_SECTIONS } from "../lib/state/sectionManifest";
import { NO_APPROVED_ARCHIVE_PROFILE } from "../lib/archive/archiveAdProfile";
import {
  NOT_CAPTURED, homeDrawSchedule, homeDrawSchedules, homePriorJackpot, homeSchedulesProvenance,
  resolveHomeNextDraw,
} from "../lib/preview/homeDrawSchedule";
import { buildHomePreview } from "../lib/preview/homePreviewModel";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped. An explanatory note must never satisfy or break an assertion about OUTPUT. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ══════════════════════════════════════════════════════════════════════ §B1 timing */

describe("§B1: the next-draw label is computed in the GAME's timezone", () => {
  test("a published draw time parses from every shape the governed data uses", () => {
    assert.deepEqual(parseLocalTime("10:59 PM"), { hour: 22, minute: 59 });
    assert.deepEqual(parseLocalTime("10:59 p.m. ET"), { hour: 22, minute: 59 });
    assert.deepEqual(parseLocalTime("22:59"), { hour: 22, minute: 59 });
    assert.deepEqual(parseLocalTime("1:30 PM"), { hour: 13, minute: 30 });
    /* Midnight and noon are the two cases a naive 12-hour conversion always gets wrong. */
    assert.deepEqual(parseLocalTime("12:00 AM"), { hour: 0, minute: 0 });
    assert.deepEqual(parseLocalTime("12:00 PM"), { hour: 12, minute: 0 });
  });

  test("an unreadable time yields null rather than a confident wrong hour", () => {
    for (const bad of [null, undefined, "", "   ", "evening", "13:00 PM", "9:99 PM", "shortly after the draw"]) {
      assert.equal(parseLocalTime(bad), null, `"${String(bad)}" must not parse`);
    }
  });

  test("the instant is the game's wall clock, not the machine's", () => {
    /* 2026-07-11 22:59 in New York is EDT (UTC-4), so 2026-07-12T02:59Z. */
    const summer = zonedInstant("2026-07-11", 22, 59, "America/New_York");
    assert.equal(new Date(summer as number).toISOString(), "2026-07-12T02:59:00.000Z");
    /* The SAME wall clock in January is EST (UTC-5), so 03:59Z. If this were naive arithmetic both would
       produce the same offset and the winter case would be an hour wrong — the §14 symptom. */
    const winter = zonedInstant("2026-01-10", 22, 59, "America/New_York");
    assert.equal(new Date(winter as number).toISOString(), "2026-01-11T03:59:00.000Z");
    /* And a different zone genuinely differs. */
    const pacific = zonedInstant("2026-07-11", 22, 59, "America/Los_Angeles");
    assert.equal(new Date(pacific as number).toISOString(), "2026-07-12T05:59:00.000Z");
    assert.notEqual(summer, pacific);
  });

  test("an unusable zone degrades to null instead of throwing inside a render", () => {
    assert.equal(zonedInstant("2026-07-11", 22, 59, "Not/AZone"), null);
    assert.equal(nextDrawInstant({ gameLocalDate: "2026-07-11", drawTimeLocal: "10:59 PM", timeZone: "Not/AZone" }), null);
  });

  test("the phrase never overstates the time remaining", () => {
    const t = Date.UTC(2026, 6, 12, 2, 59); /* the draw */
    assert.equal(relativeDrawLabel(t, t - 35 * 60_000), "in 35 minutes");
    assert.equal(relativeDrawLabel(t, t - 1 * 60_000), "in 1 minute");
    assert.equal(relativeDrawLabel(t, t - 30_000), "in under a minute");
    /* Rounded DOWN: 119 minutes is "about 1 hour", never "about 2 hours". */
    assert.equal(relativeDrawLabel(t, t - 119 * 60_000), "in about 1 hour");
    assert.equal(relativeDrawLabel(t, t - 3 * 3_600_000), "in about 3 hours");
  });

  test("a drawing that has passed says so, and never claims the result is in", () => {
    const t = Date.UTC(2026, 6, 12, 2, 59);
    const label = relativeDrawLabel(t, t + 60_000);
    assert.match(label as string, /Drawing has taken place/);
    /* We do not know that a result has been published, so we must not say it has. */
    assert.doesNotMatch(label as string, /results? (are|is) in|numbers are out|winning numbers available/i);
  });

  test("beyond a week the label is null, so the absolute date renders alone", () => {
    const t = Date.UTC(2026, 6, 12, 2, 59);
    assert.equal(relativeDrawLabel(t, t - 8 * 86_400_000), null);
    assert.equal(relativeDrawDayLabel("2026-07-20", Date.UTC(2026, 6, 1, 12), "America/New_York"), null);
  });

  test('"today" and "tomorrow" mean the GAME\'s day for every reader', () => {
    /*
     * THE CASE THAT MATTERS. A reader in Los Angeles at 23:30 PT on July 10 is already July 11 in New York. A
     * naive local-clock comparison would tell them the July 11 Florida drawing is "tomorrow"; it is today.
     */
    const laLateJuly10 = Date.UTC(2026, 6, 11, 6, 30); /* 23:30 PT on the 10th = 02:30 ET on the 11th */
    assert.equal(relativeDrawDayLabel("2026-07-11", laLateJuly10, "America/New_York"), "today");
    assert.equal(relativeDrawDayLabel("2026-07-12", laLateJuly10, "America/New_York"), "tomorrow");
    /* Read in the reader's own Pacific zone the same instant is still the 10th, so the 11th is tomorrow. */
    assert.equal(relativeDrawDayLabel("2026-07-11", laLateJuly10, "America/Los_Angeles"), "tomorrow");
  });

  test("no published draw time still produces a useful label, never an invented hour", () => {
    const noTime = { gameLocalDate: "2026-07-11", drawTimeLocal: null, timeZone: "America/New_York" };
    const label = nextDrawRelativeLabel(noTime, Date.UTC(2026, 6, 10, 16, 0));
    assert.equal(label, "tomorrow");
    /* And it never claims an hour count it cannot know. */
    assert.doesNotMatch(label as string, /hour|minute/);
  });

  test("the label is client-only, and the server still renders the absolute date", () => {
    const c = src("components/shell/NextDrawRelative.tsx");
    assert.match(c, /^"use client";/);
    /* It renders nothing until mounted, so no clock-dependent string reaches the server HTML. */
    assert.match(c, /useState<string \| null>\(null\)/);
    assert.match(c, /if \(!label\) return null;/);
    /* A minute, not a second: a per-second countdown beside a jackpot is the casino interface §7 forbids. */
    assert.match(c, /setInterval\(tick, 60_000\)/);
    assert.match(c, /clearInterval/);
    /* Every caller keeps its absolute date. */
    for (const f of [
      "components/flagship/FlagshipGamePage.tsx",
      "components/game/preview/GamePreview.tsx",
      "components/preview/PreviewResultCard.tsx",
    ]) {
      const body = src(f);
      assert.ok(body.includes("NextDrawRelative"), `${f} must render the relative label`);
      assert.match(body, /Next draw|Next drawing/, `${f} must keep the absolute next-draw text`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ §B2 jackpot delta */

/* ══════════════════════════════════════════════════════════════════════ Home fixture enrichment */

describe("Home enrichment: the §B1 countdown and §B2 delta now have governed data to render", () => {
  /** The Home preview view model, built from the real fixture. */
  const vm = () => buildHomePreview();
  const section = (id: string) => vm().entries.find((e) => (e as { id: string }).id === id) as never;

  test("the next-draw date is DERIVED from the published draw days, not stamped", () => {
    /*
     * THE PROOF THAT IT IS A DERIVATION. The module holds no date. It holds each game's published draw days, and
     * walks forward from the drawing that actually happened — so the result is checkable against the fixture's OWN
     * published display string, which was produced independently. If someone edits the display string, or the feed's
     * draw days change, this fails rather than the page quietly disagreeing with itself.
     */
    const expected: Record<string, { date: string; from: string }> = {
      /* Wed 07-08 + "Mon, Wed & Sat" -> Sat 07-11. Fixture says "Saturday, 07/11/2026". */
      powerball: { date: "2026-07-11", from: "schedule" },
      /* Tue 07-07 + "Tue & Fri" -> Fri 07-10. Fixture says "Friday, 07/10/2026". */
      "mega-millions": { date: "2026-07-10", from: "schedule" },
      /* Wed 07-08 + "Wed & Sat" -> Sat 07-11. */
      "florida-lotto": { date: "2026-07-11", from: "schedule" },
      /* No published draw days for a non-Florida state, so the feed's own next-date is used. */
      "superlotto-plus": { date: "2026-07-11", from: "feedNextDate" },
    };
    for (const [slug, want] of Object.entries(expected)) {
      const got = resolveHomeNextDraw(slug);
      assert.equal(got?.gameLocalDate, want.date, `${slug} next draw`);
      assert.equal(got?.derivedFrom, want.from, `${slug} derivation route`);
    }
    /* And the module contains no date literal of its own — a stamped date is exactly what was forbidden. */
    assert.doesNotMatch(
      code("lib/preview/homeDrawSchedule.ts").replace(/extracted 20\d\d-\d\d-\d\d/g, ""),
      /"20\d\d-\d\d-\d\d"/,
      "no next-draw date may be hardcoded here",
    );
  });

  test("the derived date agrees with the fixture's own published display string", () => {
    /* Independent of the table above: read the fixture's string and check the derivation lands on the same day. */
    for (const c of [...(section("H-02A") as never as { data: { cards: readonly never[] } }).data.cards] as
      readonly { gameSlug?: string; displayName: string; nextDraw?: { display?: string; gameLocalDate?: string } }[]) {
      if (!c.nextDraw?.gameLocalDate || !c.nextDraw.display) continue;
      const [y, m, d] = c.nextDraw.gameLocalDate.split("-");
      /* The fixture's display is "Saturday, 07/11/2026" — the same day, written the other way round. */
      assert.ok(
        c.nextDraw.display.includes(`${m}/${d}/${y}`),
        `${c.displayName}: derived ${c.nextDraw.gameLocalDate} must match published "${c.nextDraw.display}"`,
      );
    }
  });

  test("every game carries its GAME-LOCAL zone, so no reader gets an off-by-one", () => {
    /*
     * THE CASE THAT MATTERS. SuperLotto Plus draws in California and the flagship games draw in Eastern Time. A
     * single shared zone would put SuperLotto Plus three hours out for every reader, and the label would read
     * "tomorrow" for a drawing that is today — the §14 off-by-one, arriving through the data rather than the code.
     */
    assert.equal(homeDrawSchedule("powerball")?.timeZone, "America/New_York");
    assert.equal(homeDrawSchedule("mega-millions")?.timeZone, "America/New_York");
    assert.equal(homeDrawSchedule("florida-lotto")?.timeZone, "America/New_York");
    assert.equal(homeDrawSchedule("SuperLotto Plus (CA)")?.timeZone, "America/Los_Angeles");
    /* Never a label. "ET" cannot resolve an instant: it carries no DST rule and two zones share it. */
    for (const sch of homeDrawSchedules()) {
      assert.match(sch.timeZone ?? "", /^[A-Za-z]+\/[A-Za-z_]+$/, `${sch.gameSlug} needs an IANA zone`);
    }
    /* And the same instant genuinely resolves differently for an Eastern and a Pacific game. */
    const now = Date.UTC(2026, 6, 11, 6, 30); /* 23:30 PT on the 10th = 02:30 ET on the 11th */
    const et = nextDrawRelativeLabel(
      { gameLocalDate: "2026-07-11", drawTimeLocal: "10:59 PM", timeZone: "America/New_York" }, now,
    );
    const pt = nextDrawRelativeLabel(
      { gameLocalDate: "2026-07-11", drawTimeLocal: "7:57 PM", timeZone: "America/Los_Angeles" }, now,
    );
    assert.notEqual(et, pt, "an Eastern and a Pacific drawing on the same date are not the same instant");
  });

  test("midday and evening variants keep distinct times — a family is not collapsed to one", () => {
    /*
     * Home surfaces no two-draw-a-day game today, so this asserts the PROPERTY that makes it safe when one arrives:
     * the schedule carries each game's own published time, read from the record rather than shared across a family.
     * Florida Lotto (11:00 PM) and Powerball (10:59 PM) draw on the same nights at different minutes, which is the
     * same distinction a midday/evening pair needs and is enough to prove the time is per-game.
     */
    const lotto = homeDrawSchedule("florida-lotto");
    const pb = homeDrawSchedule("powerball");
    assert.equal(lotto?.drawTimeLocal, "11:00 PM");
    assert.equal(pb?.drawTimeLocal, "10:59 PM");
    assert.notEqual(lotto?.drawTimeLocal, pb?.drawTimeLocal, "two games drawing the same night keep their own times");
    /* The same night, so only the time distinguishes them — which is exactly the midday/evening case. */
    assert.equal(resolveHomeNextDraw("florida-lotto")?.gameLocalDate, resolveHomeNextDraw("powerball")?.gameLocalDate);
  });

  test("the delta is computed from two SOURCED figures, and Home now renders it", () => {
    /* Both figures come from the same feed record: `prize` (the drawing that happened) and `next-prize`. */
    const pb = homePriorJackpot("Powerball")!;
    assert.equal(pb.previousAmountDisplay, "$435,000,000");
    assert.equal(pb.currentAmountDisplay, "$457,000,000");
    assert.match(pb.previousDrawLabel, /^the July 8, 2026 drawing$/);
    const change = jackpotChange(pb.currentAmountDisplay, pb.previousAmountDisplay, pb.previousDrawLabel)!;
    assert.equal(change.direction, "up");
    assert.equal(change.amountDisplay, "$22 million");

    /* Mega Millions: 604 - 576. A second game, so the first is not a coincidence. */
    const mm = homePriorJackpot("Mega Millions")!;
    assert.equal(
      jackpotChange(mm.currentAmountDisplay, mm.previousAmountDisplay, mm.previousDrawLabel)?.amountDisplay,
      "$28 million",
    );

    /* And the view model actually carries the pair onto the jackpot table the page renders. */
    const rows = (section("H-02B") as never as {
      data: { rows: readonly { game: string; previousAmountDisplay?: string; previousDrawLabel?: string }[] };
    }).data.rows;
    const pbRow = rows.find((r) => r.game === "Powerball")!;
    assert.equal(pbRow.previousAmountDisplay, "$435,000,000");
    assert.match(pbRow.previousDrawLabel ?? "", /drawing$/);
  });

  test("nothing renders where the fixture has no source — and that is the correct output", () => {
    /*
     * THE HONEST-ABSENCE CASES, both real rather than manufactured:
     *
     *   Lotto America has NO draw-event record in any transcribed jurisdiction, so no schedule, no zone and no
     *   datetime. The countdown renders nothing.
     *   SuperLotto Plus has a schedule but its feed record withholds both prize figures — `feedDrawEvents.ts`
     *   deliberately does not transcribe them for a state-native game, because the prize SEMANTICS are unverified.
     *   The delta renders nothing.
     */
    assert.equal(resolveHomeNextDraw("lotto-america"), null);
    assert.equal(resolveHomeNextDraw("Lotto America"), null);
    assert.equal(homePriorJackpot("lotto-america"), null);
    assert.deepEqual(NOT_CAPTURED.map((n) => n.gameSlug), ["lotto-america"]);
    assert.ok(NOT_CAPTURED[0].reason.length > 60, "an absent source must state WHY it is absent");

    assert.ok(resolveHomeNextDraw("superlotto-plus"), "it has a schedule");
    assert.equal(homePriorJackpot("superlotto-plus"), null, "but no sourced prize pair");

    /* On the page: the Lotto America row keeps its date and gains no relative label and no delta. */
    const rows = (section("H-02B") as never as {
      data: { rows: readonly {
        game: string; nextDrawDisplay?: string; nextDrawLocalDate?: string; previousAmountDisplay?: string;
      }[] };
    }).data.rows;
    const la = rows.find((r) => r.game === "Lotto America");
    if (la) {
      assert.ok(la.nextDrawDisplay, "the absolute date is still there");
      assert.equal(la.nextDrawLocalDate, undefined, "and no relative label can render");
      assert.equal(la.previousAmountDisplay, undefined, "and no delta can be computed");
    }
  });

  test("an unknown game is never guessed at", () => {
    /* A slug the registry does not hold returns null rather than falling back to a neighbour's schedule. */
    assert.equal(resolveHomeNextDraw("pick-3"), null);
    assert.equal(resolveHomeNextDraw(""), null);
    assert.equal(resolveHomeNextDraw(null), null);
    assert.equal(homePriorJackpot(undefined), null);
  });

  test("every enriched value declares production-derived provenance with a source (§14)", () => {
    const rows = homeSchedulesProvenance();
    assert.ok(rows.length >= 5, "every Home game appears, including the uncaptured one");
    for (const r of rows) {
      assert.ok(["production-derived", "copied", "synthetic", "not-captured"].includes(r.provenance),
        `${r.gameSlug} must declare a §14 classification`);
      assert.ok(r.source.length > 20, `${r.gameSlug} must name its source`);
    }
    /* NOTHING is synthetic. Every value is a published operator figure, and §14 forbids a synthetic jackpot or
       datetime reaching an ungated surface — so the safest state is not having one at all. */
    assert.equal(rows.filter((r) => r.provenance === "synthetic").length, 0);
    /* Each production-derived row names the feed file and its extraction date, as §14 requires of an extract. */
    for (const r of rows.filter((x) => x.provenance === "production-derived")) {
      assert.match(r.source, /latest-results-lc\.xml/);
      assert.match(r.source, /extracted 20\d\d-\d\d-\d\d/);
    }
  });

  test("the enrichment invented no jackpot and no date the fixture did not publish", () => {
    /*
     * The strongest guard in this file. Every advertised figure the enrichment surfaces must appear VERBATIM in the
     * production draw-event records — so no value was rounded, converted, back-filled or nudged on its way to the
     * page.
     */
    const events = code("lib/state/floridaDrawEvents.ts") + code("lib/state/feedDrawEvents.ts");
    for (const sch of homeDrawSchedules()) {
      for (const figure of [sch.lastAdvertisedDisplay, sch.nextAdvertisedDisplay]) {
        if (!figure) continue;
        assert.ok(events.includes(figure), `${sch.gameSlug}: "${figure}" must exist verbatim in a governed record`);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ H-02A forward jackpot */

describe("H-02A: both money figures name their exact drawing, and neither is invented", () => {
  const vm = () => buildHomePreview();
  const h02a = () => vm().entries.find((e) => (e as { id: string }).id === "H-02A") as never as {
    data: {
      cards: readonly { gameSlug: string; displayName: string; prizeDisplay?: string }[];
      forwardJackpots: Record<string, {
        amountDisplay: string; drawDateDisplay: string; resultDrawDateDisplay: string;
        changeSentence: string | null;
      }>;
    };
  };

  test("BP-02 §14's required content is now actually present", () => {
    /*
     * §14 "Required visible content for each game" lists *"advertised jackpot"* AND *"latest verified winning
     * numbers"* as separate requirements. The card carried only the figure belonging to the drawing that had
     * already happened, so the forward jackpot — the one a reader is deciding about — was absent. This asserts the
     * gap is closed for both featured games rather than for one.
     */
    const { cards, forwardJackpots } = h02a().data;
    assert.deepEqual(cards.map((c) => c.gameSlug), ["powerball", "mega-millions"]);
    for (const c of cards) {
      const f = forwardJackpots[c.gameSlug];
      assert.ok(f, `${c.gameSlug} must carry the advertised jackpot for the next drawing`);
      assert.ok(c.prizeDisplay, `${c.gameSlug} must still carry the drawn result's figure`);
      /* TWO DISTINCT figures, each with its OWN drawing date — the whole point. */
      assert.notEqual(f.amountDisplay, c.prizeDisplay, `${c.gameSlug}: the two figures must differ`);
      assert.notEqual(f.drawDateDisplay, f.resultDrawDateDisplay,
        `${c.gameSlug}: the two drawings must be named separately`);
    }
  });

  test("each figure is labelled with a DATE, never with \"next\" or \"tonight\"", () => {
    const card = code("components/preview/PreviewResultCard.tsx");
    /* Both labels say which drawing, and both take the date from the model rather than a relative word. */
    assert.match(card, /advertised for the \{forwardJackpot\.resultDrawDateDisplay\} drawing/);
    assert.match(card, /advertised for the \{forwardJackpot\.drawDateDisplay\} drawing/);
    /* The dates the model supplies really are exact dates. */
    for (const f of Object.values(h02a().data.forwardJackpots)) {
      for (const d of [f.drawDateDisplay, f.resultDrawDateDisplay]) {
        assert.match(d, /\d{2}\/\d{2}\/\d{4}/, `"${d}" must be an exact date`);
        assert.doesNotMatch(d, /tonight|tomorrow|next|soon/i);
      }
    }
  });

  test("the shown forward figure and the delta's basis cannot drift apart", () => {
    /*
     * THE DEFECT THIS PREVENTS. The card displays the fixture's rounded form ("$457 Million") because it must sit
     * beside the result's figure in the same style, while the delta is computed from the feed's exact form
     * ("$457,000,000"). Two representations of one number is two chances to disagree — so their VALUES are asserted
     * equal. If a fixture edit made the card say $460 Million while the delta still described a rise to $457
     * million, this fails.
     */
    for (const [slug, f] of Object.entries(h02a().data.forwardJackpots)) {
      const prior = homePriorJackpot(slug)!;
      assert.equal(
        parseAmount(f.amountDisplay), parseAmount(prior.currentAmountDisplay),
        `${slug}: the displayed figure and the delta's basis must be the same amount`,
      );
    }
  });

  test("the delta is the same sentence pattern H-02B uses", () => {
    const pb = h02a().data.forwardJackpots.powerball;
    assert.equal(pb.changeSentence, "Up $22 million from the July 8, 2026 drawing.");
    const mm = h02a().data.forwardJackpots["mega-millions"];
    assert.equal(mm.changeSentence, "Up $28 million from the July 7, 2026 drawing.");
    /* Resolved on the SERVER, so the block is in the initial HTML and cannot move the ad anchors on hydration. */
    assert.match(code("lib/preview/homePreviewModel.ts"), /changeSentence: change\?\.sentence \?\? null/);
    assert.ok(
      !/jackpotChange\(/.test(code("components/preview/PreviewResultCard.tsx")),
      "the card renders the resolved sentence; it does not compute one",
    );
  });

  test("no figure and no sentence where the feed cannot source both values", () => {
    /*
     * Exercised with REAL data rather than a manufactured case. The card block is gated on `forwardJackpot` alone,
     * so a game the model omits renders neither the figure nor the sentence — no placeholder, no dash.
     */
    assert.equal(homePriorJackpot("superlotto-plus"), null, "its feed record withholds the prize figures");
    assert.equal(homePriorJackpot("lotto-america"), null, "no draw-event record exists for it at all");
    /* Neither appears in H-02A's map, so neither card could render a partial pairing. */
    const map = h02a().data.forwardJackpots;
    assert.equal(map["superlotto-plus"], undefined);
    assert.equal(map["lotto-america"], undefined);

    /* And the model requires ALL FOUR parts — a figure with no drawing date is not a statement a reader can use. */
    const model = code("lib/preview/homePreviewModel.ts");
    assert.match(model, /if \(!prior \|\| !amount \|\| !forwardDate \|\| !resultDate\) continue;/);

    /* The card's block is one gate, so half a pairing is unexpressible. */
    const card = code("components/preview/PreviewResultCard.tsx");
    assert.match(card, /\{forwardJackpot \? \(\s*<div className="lcp-forwardjackpot"/);
    assert.ok(!/—|&mdash;/.test(card.slice(card.indexOf("lcp-forwardjackpot"), card.indexOf("lcp-forwardjackpot") + 900)),
      "no dash placeholder in the block");
  });

  test("only H-02A gains this — no other Home section changed", () => {
    /*
     * `PreviewResultCard` is shared: H-02A renders it `variant="featured"`, H-02B's comparison renders it
     * `variant="compact"` and H-06A's awaiting card renders it with the default. The prop is supplied at exactly
     * one call site, so the other sections are untouched by construction rather than by convention.
     */
    const home = code("components/preview/HomePreview.tsx");
    assert.equal((home.match(/forwardJackpot=\{/g) ?? []).length, 1, "exactly one call site supplies it");
    assert.match(home, /variant="featured"[\s\S]{0,220}forwardJackpot=\{s\.data\.forwardJackpots/);
    /* And a card with no forward figure keeps the established wording verbatim. */
    assert.match(code("components/preview/PreviewResultCard.tsx"), /<>estimated jackpot<\/>/);
  });

  test("the added copy carries no urgency vocabulary", () => {
    /* Constitution §7: language MUST NOT use manipulative urgency. A jackpot figure is the most tempting place on
       the page to add it, so the added block is scanned as well as reviewed. */
    const DENY = [/hurry/i, /don'?t miss/i, /act now/i, /last chance/i, /\bwhile you can\b/i, /running out/i];
    const card = code("components/preview/PreviewResultCard.tsx");
    const block = card.slice(card.indexOf("lcp-forwardjackpot") - 400);
    for (const re of DENY) assert.doesNotMatch(block, re, `the added copy must not match ${re}`);
    for (const f of Object.values(h02a().data.forwardJackpots)) {
      const copy = `${f.amountDisplay} ${f.drawDateDisplay} ${f.resultDrawDateDisplay} ${f.changeSentence ?? ""}`;
      for (const re of DENY) assert.doesNotMatch(copy, re);
      /* Nor any prediction framing about the drawing that has not happened. */
      for (const re of [/\bwill\b/i, /\bexpect/i, /\bcould reach\b/i, /on pace/i]) {
        assert.doesNotMatch(copy, re, `${re} implies something about a future drawing`);
      }
    }
    /* The CSS carries no attention-grabbing motion either. */
    const css = src("app/globals.css");
    const rule = css.slice(css.indexOf(".lcp-forwardjackpot {"), css.indexOf(".lcp-forwardjackpot {") + 700);
    for (const re of [/animation/i, /@keyframes/i, /blink/i]) assert.doesNotMatch(rule, re);
  });

  test("every figure on the card exists verbatim in a governed record", () => {
    /*
     * The §14 guard, extended to the new card figures. Every money value the card shows must appear VERBATIM in a
     * governed record — the production draw events OR the production-derived Home fixture — so nothing was rounded,
     * converted or back-filled on the way to the page.
     */
    const governed = code("lib/state/floridaDrawEvents.ts")
      + code("lib/state/feedDrawEvents.ts")
      + readFileSync(new URL("../../04-sample-data/home-page-sample.json", import.meta.url), "utf8");
    const { cards, forwardJackpots } = h02a().data;
    for (const c of cards) {
      const f = forwardJackpots[c.gameSlug];
      for (const figure of [c.prizeDisplay, f?.amountDisplay]) {
        if (!figure) continue;
        assert.ok(governed.includes(figure),
          `${c.gameSlug}: "${figure}" must exist verbatim in a governed record`);
      }
      /* The delta's own basis too — both sides of the subtraction. */
      const prior = homePriorJackpot(c.gameSlug)!;
      for (const figure of [prior.currentAmountDisplay, prior.previousAmountDisplay]) {
        assert.ok(governed.includes(figure), `${c.gameSlug}: "${figure}" must be governed`);
      }
    }
  });
});

describe("§B2: a jackpot delta is arithmetic over published figures or it does not exist", () => {
  test("both shapes the feed and the fixtures use are parsed exactly", () => {
    assert.equal(parseAmount("$604,000,000"), 604_000_000);
    assert.equal(parseAmount("$604 Million"), 604_000_000);
    assert.equal(parseAmount("$32.86 Million"), 32_860_000);
    assert.equal(parseAmount("$1.5 Billion"), 1_500_000_000);
    assert.equal(parseAmount("$457,000"), 457_000);
  });

  test("every APPROXIMATE form is refused rather than coerced", () => {
    /* This is the whole point. Coercing "over $600M" to 600,000,000 would publish a number the operator did not,
       as an exact fact, about money (`CLAUDE.md` §14). */
    for (const bad of [
      "over $600 million", "about $604M", "approx $604,000,000", "$600M+", "est. $604 million",
      "$400-500 million", "nearly $1 billion", "up to $604 million", "unavailable", "", null, undefined,
    ]) {
      assert.equal(parseAmount(bad), null, `"${String(bad)}" must not parse into an exact amount`);
    }
  });

  test("a rise is stated with its reference point, and no rate is projected", () => {
    const c = jackpotChange("$457,000,000", "$435,000,000", "the July 8 drawing");
    assert.equal(c?.direction, "up");
    assert.equal(c?.amountDisplay, "$22 million");
    assert.equal(c?.sentence, "Up $22 million from the July 8 drawing.");
    /* No prediction, no pace, no urgency (Constitution §7 language rules). */
    for (const re of [/on pace/i, /could reach/i, /expected to/i, /growing/i, /don'?t miss/i, /hurry/i]) {
      assert.doesNotMatch(c!.sentence, re);
    }
  });

  test("a FALL is explained as a win and a reset, not as a loss of value", () => {
    const c = jackpotChange("$20,000,000", "$600,000,000", "last Saturday's drawing");
    assert.equal(c?.direction, "down");
    assert.match(c!.sentence, /the jackpot was won and has reset/);
  });

  test("one missing figure means no delta at all", () => {
    assert.equal(jackpotChange("$457,000,000", null, "the last drawing"), null);
    assert.equal(jackpotChange(null, "$435,000,000", "the last drawing"), null);
    assert.equal(jackpotChange("$457,000,000", "over $435 million", "the last drawing"), null);
    /* Unchanged is silent unless a caller explicitly asks for it. */
    assert.equal(jackpotChange("$457,000,000", "$457,000,000", "the last drawing"), null);
    assert.match(
      jackpotChange("$457,000,000", "$457,000,000", "the last drawing", { includeFlat: true })!.sentence,
      /Unchanged/,
    );
  });

  test("the flagship hero states the rise and the reason a jackpot rises", () => {
    const page = src("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /data-jackpot-delta=/);
    /* The standing guardrail: a rise is about nobody winning, not about the odds of the next drawing. */
    assert.match(page, /rises when nobody wins it; the rise says nothing about the odds/);
  });
});

/* ══════════════════════════════════════════════════════════════════════ §B3 weekly schedule */

describe("§B3: the weekly schedule inverts governed rows and never invents a day", () => {
  const row = (over: Partial<Parameters<typeof weeklyDrawSchedule>[0][number]> = {}) => ({
    gameId: 1, familyKey: "pick-3", displayName: "Pick 3", drawDays: "Daily",
    drawTimeLocal: "1:30 PM", drawPeriod: null, ...over,
  });

  test("a daily game appears on all seven days; a two-day game on exactly two", () => {
    const w = weeklyDrawSchedule([
      row(),
      row({ gameId: 2, familyKey: "florida-lotto", displayName: "Florida Lotto", drawDays: "Wed & Sat",
            drawTimeLocal: "11:15 PM" }),
    ]);
    assert.equal(w.days.length, 7);
    assert.deepEqual(w.days.map((d) => d.name), [...WEEKDAY_NAMES]);
    assert.equal(w.days.filter((d) => d.games.some((g) => g.label === "Pick 3")).length, 7);
    const lottoDays = w.days.filter((d) => d.games.some((g) => g.label === "Florida Lotto")).map((d) => d.name);
    assert.deepEqual(lottoDays, ["Wednesday", "Saturday"]);
  });

  test("a family with two draw times is ONE game with two times, not two games", () => {
    const w = weeklyDrawSchedule([
      row({ gameId: 10, drawPeriod: "Midday", drawTimeLocal: "1:30 PM" }),
      row({ gameId: 11, drawPeriod: "Evening", drawTimeLocal: "9:45 PM" }),
    ]);
    const monday = w.days[1];
    assert.equal(monday.games.length, 1, "Midday and Evening are one Pick 3");
    assert.deepEqual([...monday.games[0].times], ["Midday 1:30 PM", "Evening 9:45 PM"]);
  });

  test("an UNPUBLISHED schedule is named, never placed on a day and never hidden", () => {
    /*
     * The defect this prevents: every game in the four non-Florida preview States has `drawDays: ""` because no
     * operator-published source exists in the repository. Dropping them would let a reader conclude those games do
     * not draw tonight, when the truth is that we do not know.
     */
    const w = weeklyDrawSchedule([
      row({ gameId: 20, familyKey: "keno", displayName: "Keno (MI)", drawDays: "" }),
      row({ gameId: 21, familyKey: "lotto", displayName: "Lotto", drawDays: "Wed & Sat" }),
    ]);
    assert.deepEqual([...w.unscheduled], ["Keno"]);
    for (const d of w.days) {
      assert.ok(!d.games.some((g) => g.label === "Keno"), `Keno must not be placed on ${d.name}`);
    }
    assert.match(src("components/state/preview/sections/StateDraftSections.tsx"), /data-unscheduled-games=/);
  });

  test("the trailing feed parenthetical is not part of a game's name", () => {
    const w = weeklyDrawSchedule([row({ displayName: "Powerball (Multi-State)", drawDays: "Mon, Wed, Sat" })]);
    assert.equal(w.days[1].games[0].label, "Powerball");
  });

  test("it is placed in S-04, whose PF-02 content list covers a schedule", () => {
    /* The instruction suggested S-08/S-08A; PF-02 §21 is claims/taxes/anonymity and §21A exists to AVOID a large
       fact table. The fit check and the correction are documented at the module, and the table renders in S-04. */
    const lib = src("lib/state/weeklyDrawSchedule.ts");
    assert.match(lib, /Neither fits, and PF-02 says so explicitly/);
    const draft = src("components/state/preview/sections/StateDraftSections.tsx");
    const s04 = draft.slice(draft.indexOf("export function SectionS04"));
    assert.match(s04, /weeklyDrawSchedule\(schedule\)/);
    assert.match(s04, /data-weekly-schedule="true"/);
    /* And S-08 / S-08A did NOT gain a schedule table. */
    const util = src("components/state/preview/sections/StateUtilitySections.tsx");
    assert.ok(!/weeklyDrawSchedule/.test(util), "the schedule must not land in S-08 or S-08A");
  });
});

/* ══════════════════════════════════════════════════════════════════════ §B4 exit ramps */

describe("§B4: every exit ramp is a proved destination or it is absent", () => {
  test("the order is fixed and identical everywhere", () => {
    assert.deepEqual([...EXIT_RAMP_ORDER], ["prizes", "history", "rules", "stateHub"]);
    /* A caller passing them out of order still renders in the governed order. */
    const c = src("components/shell/ResultExitRamps.tsx");
    assert.match(c, /EXIT_RAMP_ORDER\s*\n?\s*\.map\(\(k\) => ramps\.find/);
  });

  test("a null destination renders nothing — no disabled chip, no # placeholder", () => {
    const c = code("components/shell/ResultExitRamps.tsx");
    assert.match(c, /\.filter\(\(r\): r is ExitRamp => Boolean\(r && r\.href\)\)/);
    assert.match(c, /if \(live\.length === 0\) return null;/);
    assert.ok(!/href="#"/.test(c), "no placeholder href");
    assert.ok(!/disabled/.test(c), "no disabled control");
  });

  test("a fragment is offered only when its section actually rendered", () => {
    const withRules = gameExitRamps({
      mode: "JG-M2", stateCode: "fl", stateName: "Florida", gameSlug: "pick-3", gameLabel: "Pick 3",
      visibleSections: ["JG-01", "JG-06"], stateHubHref: "/fl",
    });
    assert.equal(withRules.find((r) => r.key === "rules")?.href, "#jg-06");

    const withoutRules = gameExitRamps({
      mode: "JG-M2", stateCode: "fl", stateName: "Florida", gameSlug: "pick-3", gameLabel: "Pick 3",
      visibleSections: ["JG-01"], stateHubHref: "/fl",
    });
    assert.equal(withoutRules.find((r) => r.key === "rules")?.href, null,
      "a suppressed section must not leave a chip pointing at nothing");
  });

  test("the archive ramp comes from the REGISTRY, never from an arithmetic year", () => {
    /* `/fl/pick-3` has 2026 registered. */
    const registered = gameExitRamps({
      mode: "JG-M2", stateCode: "fl", stateName: "Florida", gameSlug: "pick-3", gameLabel: "Pick 3",
      visibleSections: [], stateHubHref: "/fl",
    });
    assert.equal(registered.find((r) => r.key === "history")?.href, "/fl/pick-3/2026");
    assert.match(registered.find((r) => r.key === "history")!.label, /2026/);

    /* `/fl/powerball` has none, so there is no past-results ramp — not a link to a year that 404s. */
    const unregistered = gameExitRamps({
      mode: "JG-M1", stateCode: "fl", stateName: "Florida", gameSlug: "powerball", gameLabel: "Powerball",
      visibleSections: [], stateHubHref: "/fl",
    });
    assert.equal(unregistered.find((r) => r.key === "history")?.href, null);
    /* And nothing anywhere derives a year from a clock. */
    assert.ok(!/getFullYear/.test(code("lib/game/gameExitRamps.ts")));
  });

  test("a flagship hub offers NO state hub ramp, because it has no jurisdiction", () => {
    /* `CLAUDE.md` §13: coarse IP may never determine a state. Picking one here would invent the reader's. */
    const page = code("components/flagship/FlagshipGamePage.tsx");
    const i = page.indexOf("<ResultExitRamps");
    assert.ok(i > 0, "the flagship hero must render the ramp row");
    const block = page.slice(i, i + 1200);
    assert.match(block, /key: "stateHub", label: "", href: null/);
  });

  test("no exit ramp is a commerce destination", () => {
    for (const f of [
      "components/shell/ResultExitRamps.tsx",
      "lib/game/gameExitRamps.ts",
    ]) {
      const body = code(f);
      for (const re of [/buynow/i, /\/play\//, /affiliate/i, /buy tickets/i]) {
        assert.doesNotMatch(body, re, `${f} must not route commerce through a navigation ramp`);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ §A the shared chrome */

describe("§A1: one section anatomy, not five", () => {
  test("all fourteen §43 states exist and none was dropped", () => {
    assert.equal(SECTION_STATES.length, 14);
    for (const s of ["loading", "fresh", "stale", "pendingVerification", "unavailable", "incomplete",
                     "conflicting", "corrected", "archived", "empty", "restricted", "personalized",
                     "anonymousFallback", "error"]) {
      assert.ok(SECTION_STATES.includes(s as never), `§43 state ${s} is missing`);
    }
  });

  test("§10.5 is structural: every section records an intelligence decision", () => {
    const c = src("components/shell/SectionChrome.tsx");
    /*
     * §C3: the value falls back to the SECTION INTELLIGENCE MATRIX rather than to a bare `"none"`, so a call site
     * that forgets the prop still emits the recorded decision — with roughly ninety sections across five families
     * that is the realistic failure, and it would silently lose §10.5 coverage.
     */
    assert.match(c, /data-intelligence=\{a\.intelligence \?\? intelligenceOf\(family, a\.sectionId\)\}/);
    assert.match(c, /data-intelligence-source=/);
    assert.match(c, /data-source-class=\{a\.sourceClass \?\? "none"\}/);
    assert.match(c, /data-section-state=\{a\.state \?\? "fresh"\}/);
  });

  test("§44 permits exactly one heading action and §45 cannot become a disclaimer wall", () => {
    const c = src("components/shell/SectionChrome.tsx");
    /* One node, not a list — a second heading CTA is unexpressible without changing the type. */
    assert.match(c, /action\?: ReactNode;/);
    assert.ok(!/actions\?: ReactNode\[\]/.test(c));
    /* The footer renders nothing when it has nothing, so an empty rule cannot leave a bordered strip. */
    assert.match(c, /if \(!has\) return null;/);
  });

  test("a family keeps its own class prefix, so no page was restyled", () => {
    /* The prefix table is the contract's, in `lib`, so a model can speak it too. All five families are selectable
       and none was collapsed into a single shared class name — which would have restyled four pages at once. */
    const c = code("lib/shell/sectionContract.ts");
    for (const p of ["lcp", "lcs", "lcg", "lcfg"]) {
      assert.ok(c.includes(`"${p}"`), `${p} must stay a selectable skin`);
    }
    assert.match(code("components/shell/SectionChrome.tsx"), /CLASS_PREFIX\[family\]/);
  });
});

describe("§A2: one shell, one landmark, a contextual AI entry", () => {
  /*
   * LRG-UX-SCHEMA-001 corrections 5 and 6 REPLACED both of the tests that used to sit here.
   *
   * The first asserted that Powerball and Mega Millions are live entries in the primary navigation. They are
   * live ROUTES and still reachable — from the Games surface, the flagship cards and Home — but GS-03's seven
   * labels do not include two individual games, so the assertion was pinning a defect in place.
   *
   * The second asserted `/tools` and `/news` are "preview-unavailable" because "no route exists". Both routes
   * existed by then; the test had outlived its premise and was keeping two working pages labelled Soon.
   */
  test("GS-03: exactly the seven approved labels, in the approved order", () => {
    assert.deepEqual(globalShell().primaryNav.map((n) => n.label), [...PRIMARY_NAV_LABELS]);
    assert.deepEqual([...PRIMARY_NAV_LABELS],
      ["Results", "States", "Games", "Jackpots", "Tools", "News", "Community"]);
    /* Home is NOT among them — the logo owns Home, and the header renders it as the brand link. */
    assert.ok(!globalShell().primaryNav.some((n) => n.label === "Home"));
    assert.match(src("components/shell/PreviewChrome.tsx"), /<Link\s+href="\/"/);
  });

  test("GS-09: exactly the five approved destinations, in the approved order", () => {
    assert.deepEqual(globalShell().bottomNav.map((n) => n.label), [...BOTTOM_NAV_LABELS]);
    assert.deepEqual([...BOTTOM_NAV_LABELS], ["Home", "Results", "My Numbers", "Community", "Ask AI"]);
  });

  test("a live page is never labelled unavailable, and route existence comes from the registry", () => {
    const shell = globalShell();
    for (const [label, href] of [["Tools", "/tools"], ["News", "/news"], ["Community", "/community"]] as const) {
      const entry = shell.primaryNav.find((n) => n.label === label)!;
      assert.equal(entry.href, href);
      assert.equal(entry.state, servesPage(label.toLowerCase() as never, href) ? "live" : "preview-unavailable",
        `${label} must take its state from the registry, not from a literal`);
      assert.equal(entry.state, "live", `${href} is served today`);
    }
    /*
       Every `live` entry points at a route or a Home anchor — never at a bare fragment on an unknown page.
       Ask AI is the one deliberate exception: GS-06 must be CONTEXTUAL, so its target is the CURRENT page's
       own answer surface, which is a same-page fragment by design and is asserted separately below.
    */
    for (const n of [...shell.primaryNav, ...shell.bottomNav].filter((x) => x.state === "live")) {
      /* LRG-UX-SCHEMA-002 §1: `href` is nullable now, and a LIVE entry with a null destination is exactly the
         contradiction the type was widened to make expressible — so it is asserted, not narrowed away. */
      assert.ok(n.href, `${n.label} is live and must have a destination`);
      if (n.label === "Ask AI") { assert.match(n.href!, /^#/); continue; }
      assert.match(n.href!, /^\/($|[a-z#])/, `${n.label} must be a same-site path`);
    }
    /* And every Home anchor a navigation entry names is a real BP-02 §12 section. */
    const homeIds = new Set(buildHomePreview().entries.map((e) => (e as { id: string }).id));
    for (const href of Object.values(HOME_NAV_ANCHORS)) {
      assert.ok(homeIds.has(href.replace("/#", "")), `${href} must name a governed Home section`);
    }
  });

  test("the current page is marked with aria-current and stays a link; unavailable items are not links", () => {
    /* LRG-UX-SCHEMA-002 §2: the page DECLARES its family. `currentPath: "/tools"` used to be the input, and it
       worked only because `/tools` happens to equal the Tools entry's href — an accident the four Home-anchor
       entries could never reproduce. */
    const onTools = globalShell({ activePrimaryNav: "Tools" });
    assert.equal(onTools.primaryNav.find((n) => n.label === "Tools")!.current, true);
    assert.equal(onTools.primaryNav.find((n) => n.label === "Tools")!.state, "live",
      "the page you are on is not 'unavailable' — it is the page you are on");
    assert.equal(onTools.primaryNav.filter((n) => n.current).length, 1);

    /* The four Home-anchor entries can now be current too — they never could under path equality. */
    for (const label of ["Results", "States", "Games", "Jackpots"] as const) {
      const shell = globalShell({ activePrimaryNav: label });
      assert.equal(shell.primaryNav.find((n) => n.label === label)!.current, true, label);
      assert.equal(shell.primaryNav.filter((n) => n.current).length, 1, `${label}: exactly one current`);
    }
    /* And a family that belongs to no entry marks nothing, rather than marking something plausible. */
    assert.equal(globalShell({ activePrimaryNav: null }).primaryNav.filter((n) => n.current).length, 0);
    assert.equal(globalShell().bottomNav.filter((n) => n.current).length, 0);

    /* Comments stripped: this file EXPLAINS why `aria-disabled` was removed, and a raw-source regex cannot
       tell an explanation from a use — which would force the reasoning to be deleted to keep the test green. */
    const chrome = code("components/shell/PreviewChrome.tsx");
    /* The live branch is a Link carrying aria-current; the unavailable branch is a span. */
    assert.match(chrome, /aria-current=\{n\.current \? "page" : undefined\}/);
    assert.match(chrome, /aria-current=\{b\.current \? "page" : undefined\}/);
    /* `aria-disabled` on a Link is gone: it neither blocks navigation nor leaves the tab order. */
    assert.doesNotMatch(chrome, /aria-disabled/);
    /* The mobile header no longer duplicates the bottom nav's Ask AI. */
    assert.doesNotMatch(chrome, /lcp-mobile-only lcp-target/);
    /* GS-05 is disabled, not readOnly, and says so in visible text. */
    assert.match(chrome, /type="search"\n\s+disabled/);
    assert.match(chrome, /Search is not available yet\./);
  });

  test("GS-06 targets the PAGE's answer surface, and is absent where there is none", () => {
    assert.equal(globalShell().aiTrigger.href, `#${SHARED_ASK_ANCHOR}`);
    assert.equal(globalShell().aiTrigger.state, "live");
    /* The archive removed Ask (`FD-DAT-17`), so it passes null and the control is labelled unavailable rather
       than scrolling to a region that is not on the page. */
    const none = globalShell({ askAnchor: null });
    assert.equal(none.aiTrigger.state, "preview-unavailable");
    assert.match(src("app/[state]/[game]/[segment]/page.tsx"), /askAnchor=\{null\}/);
  });

  test("the shell never invents jackpot figures", () => {
    /* A ticker carries live money. A route-blind shell module supplying one would be exactly the synthetic-as-fact
       hazard §14 forbids, so it is empty and only Home renders a ticker, from Home's own model. */
    assert.deepEqual(globalShell().jackpotTicker.topJackpots, []);
    assert.equal(globalShell().jackpotTicker.nextDraw, null);
  });

  test("every page family renders the chrome and exactly one landmark", () => {
    const layout = src("app/layout.tsx");
    /* No route renders `SiteHeader` any more — `FD-GATE-01` archived it with the legacy templates. */
    assert.ok(!/<SiteHeader/.test(layout));
    assert.ok(!/<main>\{children\}<\/main>/.test(layout));
    for (const f of [
      "app/powerball/page.tsx", "app/mega-millions/page.tsx", "app/[state]/page.tsx",
      "app/[state]/[game]/page.tsx", "app/[state]/[game]/[segment]/page.tsx",
      "app/[state]/[game]/[segment]/[slug]/page.tsx",
    ]) {
      assert.match(src(f), /GlobalShellChrome/, `${f} must render the approved shell chrome`);
    }
    /*
     * `FD-GATE-01` (2026-08-11) removed the legacy branch entirely, so there is no `SiteHeader` left on this route —
     * the approved shell is the only shell. A State the registry does not serve now 404s rather than rendering a
     * superseded template.
     */
    /* `code`, not `src`: the route's comment records that the legacy branch was removed, which is the
       opposite of a regression. What must not exist is a RENDER. */
    assert.ok(!/SiteHeader/.test(code("app/[state]/page.tsx")));
    assert.match(src("app/[state]/page.tsx"), /servesPage\("state", state\)/);
  });
});

describe("§A3: a required section never silently returns null", () => {
  test("S-16 and S-17 are recorded, not dropped", () => {
    /* Both are `required` in PF-02 §12 and both drew nothing while the model said they rendered. */
    for (const id of ["S-16", "S-17"]) {
      assert.equal(STATE_SECTIONS.find((s) => s.id === id)?.requirement, "required");
    }
    /* S-17 is a MERGE with a named destination; S-16 is BLOCKED with a reason. */
    assert.deepEqual(STATE_MERGED_SECTIONS, { "S-17": "S-18" });
    const model = src("lib/state/statePreviewModel.ts");
    assert.match(model, /sectionState\["S-16"\] = suppressed\(\s*"blocked-member-insider"/);
    assert.match(model, /merged-into-neighbour/);
    /* And the component no longer has the silent cases. */
    const view = src("components/state/preview/StatePreview.tsx");
    assert.ok(!/case "S-16": return null;/.test(view));
    assert.ok(!/case "S-17": return null;/.test(view));
    /* The absorbing section declares the merge in the DOM. */
    assert.match(view, /mergedFrom=\{Object\.entries\(STATE_MERGED_SECTIONS\)/);
  });

  test("no disabled Follow control was drawn instead", () => {
    /* `CLAUDE.md` §16 forbids implementing Member/Insider; FD-ACC-14 forbids a control that cannot work. */
    const view = src("components/state/preview/StatePreview.tsx");
    assert.ok(!/Follow this state|Follow Florida/i.test(view));
  });
});

describe("§A4: the archive's advertising positions survive without an ad being drawn", () => {
  test("the profile is typed-empty and reports the dependency", () => {
    assert.equal(NO_APPROVED_ARCHIVE_PROFILE.placements.length, 0);
    assert.match(NO_APPROVED_ARCHIVE_PROFILE.gap, /lc_gh_\*/);
    assert.match(NO_APPROVED_ARCHIVE_PROFILE.gap, /ad-operations task, not an implementation change/);
    /* The protected regions blueprint §7 names are recorded, so a future placement has something to respect. */
    assert.ok(NO_APPROVED_ARCHIVE_PROFILE.protectedRegions.some((r) => /AR-05/.test(r)));
    assert.ok(NO_APPROVED_ARCHIVE_PROFILE.protectedRegions.some((r) => /AR-06/.test(r)));
  });

  test("a placeholder cannot be added without changing the type", () => {
    /* `readonly never[]` is the mechanism: pushing any object is a compile error, not a review catch. */
    assert.match(src("lib/archive/archiveAdProfile.ts"), /placements: readonly never\[\]/);
  });
});

describe("§A7: one breadcrumb and one last-updated, across five families", () => {
  test("the date format is fixed, not locale-dependent", () => {
    assert.equal(formatLastUpdated("2026-07-09T14:01:00Z", "ET"), "July 9, 2026 at 2:01 PM ET");
    /* A date-only governed value does not gain an invented midnight. */
    assert.equal(formatLastUpdated("2026-08-02"), "August 2, 2026");
    assert.equal(
      lastUpdatedSourceLine("2026-08-02", "Florida Lottery results feed"),
      "Last updated August 2, 2026 · Florida Lottery results feed",
    );
    /* No runtime locale anywhere, so the server and the client cannot disagree. */
    assert.ok(!/toLocaleString|toLocaleDateString|Intl\./.test(src("lib/text/lastUpdated.ts")));
  });

  test("every family consumes the shared primitives", () => {
    for (const f of [
      "components/state/preview/sections/StateCommon.tsx",
      "components/game/preview/GamePreview.tsx",
      "components/archive/ArchiveView.tsx",
      "components/flagship/FlagshipGamePage.tsx",
    ]) {
      assert.match(src(f), /LastUpdated/, `${f} must render the shared freshness primitive`);
    }
    for (const f of [
      "components/game/preview/GamePreview.tsx",
      "components/archive/ArchiveView.tsx",
      "components/flagship/FlagshipGamePage.tsx",
      "components/layout/InformationPage.tsx",
      "app/[state]/[game]/[segment]/[slug]/page.tsx",
    ]) {
      assert.match(src(f), /Breadcrumbs/, `${f} must render the shared breadcrumb primitive`);
    }
    /* The archive's bespoke crumb markup is gone, so the crumb audit can see it. `code`, not `src`: the
       component's comment legitimately explains what was replaced, and a comment is not rendered markup. */
    assert.ok(!/lca-crumbs/.test(code("components/archive/ArchiveView.tsx")));
  });

  test('"Last updated", never "last verified"', () => {
    /* Verification state is internal governance and a reader cannot act on it. */
    for (const f of ["lib/text/lastUpdated.ts", "components/shell/SectionChrome.tsx"]) {
      assert.doesNotMatch(src(f).replace(/\/\*[\s\S]*?\*\//g, " "), /last verified/i);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ §B5 sticky order */

describe("§B5: adding GS-09 did not create a sticky conflict", () => {
  test("the advertisement sits ABOVE the bottom navigation and below it in stacking order", () => {
    const css = src("app/globals.css");
    const block = css.slice(css.indexOf("§B5 — THE STICKY CONFLICT, RESOLVED"));
    /* §12 priority: bottom navigation outranks advertising, so the AD moves, not the navigation.
       LRG-UX-SCHEMA-001 §9 added the third term: §6.4's "safe spacing" had been zero, and the ad's own 44x44
       close control — centred in a 37px bar — overflowed 4px under the navigation. The gap is a named
       variable so it stays as symbolic as the other two. */
    assert.match(
      block,
      /bottom: calc\(\s*var\(--lcp-bottom-nav-h, 0px\) \+ var\(--lcs-stickyfoot-gap\) \+ env\(safe-area-inset-bottom, 0px\)\s*\)/,
    );
    assert.match(block, /z-index: 39/);
    /* Both terms stay symbolic: hardcoding 56 or 90 is how the previous revision under-reserved. */
    assert.ok(!/bottom: 56px|bottom: 90px/.test(block));
  });

  test("the document clearance now sums BOTH sticky layers", () => {
    const css = src("app/globals.css");
    const block = css.slice(css.indexOf("§B5 — THE STICKY CONFLICT, RESOLVED"));
    assert.match(block, /--lcs-bottomnav-h: var\(--lcp-bottom-nav-h, 0px\)/);
    /* And it returns to zero at >= 992px, where GS-09 is `display: none`. */
    assert.match(block, /@media \(min-width: 992px\) \{[\s\S]*--lcs-bottomnav-h: 0px;/);
  });

  test("the mobile density pass changed spacing only", () => {
    const css = src("app/globals.css");
    const block = css.slice(css.indexOf("§B5 mobile density on the State page at 375px"));
    /* No `display: none`, no reordering and no shrunken ball: hiding a result on mobile is forbidden (§9). */
    assert.ok(!/display:\s*none/.test(block), "nothing may be hidden on mobile");
    assert.ok(!/order:/.test(block), "no visual reorder — DOM and focus order must stay identical");
    assert.ok(!/lcp-ball|--ball-/.test(block), "a drawn number's size is not a density lever");
  });
});
