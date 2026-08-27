/*
 * Florida draw events — PRODUCTION-DERIVED, TRANSCRIBED WITH PROVENANCE.
 *
 * Task LRG-STATE-025. Authority: FD-X-01 (one State family, data-driven), FD-X-02 (the hub owns current
 * State truth), FD-X-06 (frequent-draw variants grouped, never exploded), `CLAUDE.md` §14 (every fixture
 * declares whether it is synthetic, copied or production-derived, and production-derived data retains
 * provenance).
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT A FIXTURE.
 * The Florida page fixture (`04-sample-data/state-fl-sample.json`) carries only 7 result cards shaped for
 * superseded page requirements, and `CLAUDE.md` §6 warns that existing fixtures are NOT future API
 * contracts. Florida actually runs 19 draw events. This module transcribes all 19 from the production
 * results feed so the preview can show complete coverage without reshaping a superseded fixture and
 * without inventing a single value.
 *
 * PROVENANCE
 *   [P1] 04-sample-data/source-xml/latest-results-lc.xml — the production results feed.
 *        `<State stateCode="FL" stateId="107" stateName="Florida">`, 19 `<game>` elements.
 *        Extracted 2026-07-28. Numbers, result dates, prizes, next-draw dates and next prizes are the
 *        feed's own values, parsed from `numbers-str`, `result-date`, `prize`/`jackpot`, `next-date` and
 *        `next-prize`/`next-jackpot`.
 *   [P2] 04-sample-data/reference-tables/game.csv — production database export. `GAMETIME` supplies the
 *        draw time, `CUTOFFTIME` the sales cutoff, `PLAY_TYPE` the game shape. Cross-checked against the
 *        live public times observed during LRG-STATE-023 research.
 *   [P4] LRG-STATE-029 CORRECTION, verified 2026-07-29. `game.csv` gives 7:57 PM ET as the Pick-family
 *        EVENING draw time. The operator publishes **9:45 p.m. ET** for Pick 3
 *        (https://floridalottery.com/games/draw-games/pick-3) and Pick 5
 *        (https://floridalottery.com/games/draw-games/pick-5). Official wins; the four Pick evening events
 *        are corrected here. Pick 2 and Pick 4 inherit the published family pattern and are recorded
 *        UNDER REVIEW in `floridaFormatRegistry.ts` `SCHEDULE_CONFLICTS`. Fantasy 5's times were checked
 *        against the operator and AGREE with `game.csv`, so the staleness is Pick-specific.
 *   [P3] Florida Lottery official game pages, accessed 2026-07-28 — draw DAYS for Powerball
 *        ("Powerball drawings are held on Monday, Wednesday and Saturday") and Mega Millions
 *        ("MEGA MILLIONS drawings are held every Tuesday and Friday night at 11 PM Eastern Time").
 *
 * WHAT IS DELIBERATELY ABSENT.
 *   - No Powerball/Lotto "cash value" — the feed does not carry it and we never derive it.
 *   - No event that the feed does not contain. Florida Lottery raffles and Scratch-Off games are real but
 *     absent from the feed, so they are absent here rather than invented.
 *   - No odds, no claim amounts, no winner records. Those are governed facts owned by the manifest.
 *
 * GROUPING. `familyKey` collapses the 19 events into 10 game identities so the page never renders 19
 * equal-weight cards (FD-X-06). `drawPeriod` is mandatory wherever a family has more than one event — a
 * result must never be ambiguous about which draw it belongs to.
 */

export type FloridaGameClass =
  | "multiState"
  | "stateJackpot"
  | "stateDaily"
  | "dailyNumbers"
  | "frequentDraw";

export interface DrawnBallGroup {
  label: string;
  values: number[];
}

export interface FloridaDrawEvent {
  gameId: number;
  /** Format definition id in `result-format-definitions.json`. */
  formatId: number;
  /** Groups sibling draw events under one game identity. */
  familyKey: string;
  familyName: string;
  gameClass: FloridaGameClass;
  /** Mandatory when the family has more than one event. `null` only for single-event families. */
  drawPeriod: string | null;
  /** The feed's own game name, kept for traceability. */
  feedName: string;
  drawDays: string;
  drawTimeLocal: string | null;
  salesCutoff: string | null;
  playType: string | null;
  resultDate: string | null;
  mainNumbers: number[];
  /** Named special balls (Powerball, Mega Ball, Fireball). Never a bare unlabelled number. */
  specialBalls: DrawnBallGroup[];
  multiplier: { label: string; value: number } | null;
  /** Double Play and other secondary drawings, as a labelled sub-result. */
  secondaryDraw: { label: string; mainNumbers: number[]; specialBalls: DrawnBallGroup[] } | null;
  topPrizeDisplay: string | null;
  nextDrawDate: string | null;
  nextPrizeDisplay: string | null;
  feedUpdatedRaw: string;
}

/** All 19 Florida draw events, ordered by family then by draw time within the family. */
export const FLORIDA_DRAW_EVENTS: readonly FloridaDrawEvent[] = [
  {
    gameId: 1012, formatId: 1012,
    familyKey: "powerball", familyName: "Powerball",
    gameClass: "multiState", drawPeriod: null,
    feedName: "Multi-State (US)-Powerball",
    drawDays: "Mon, Wed & Sat", drawTimeLocal: "10:59 PM",
    salesCutoff: null, playType: "5/69+1/26",
    resultDate: "2026-07-08",
    mainNumbers: [12, 29, 37, 43, 55],
    specialBalls: [{ label: "Powerball", values: [18] }],
    multiplier: { label: "Power Play", value: 4 },
    secondaryDraw: { label: "Double Play", mainNumbers: [6, 27, 33, 44, 69], specialBalls: [{ label: "Powerball", values: [23] }] },
    topPrizeDisplay: "$435,000,000",
    nextDrawDate: "2026-07-11", nextPrizeDisplay: "$457,000,000",
    feedUpdatedRaw: "Thu 07/09/2026 12:11:54 AM EDT",
  },
  {
    gameId: 1013, formatId: 1013,
    familyKey: "mega-millions", familyName: "Mega Millions",
    gameClass: "multiState", drawPeriod: null,
    feedName: "Multi-State (US)-Mega Millions",
    drawDays: "Tue & Fri", drawTimeLocal: "11:00 PM",
    salesCutoff: null, playType: "5/70+1/24",
    resultDate: "2026-07-07",
    mainNumbers: [2, 31, 35, 36, 63],
    specialBalls: [{ label: "Mega Ball", values: [12] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$576,000,000",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$604,000,000",
    feedUpdatedRaw: "Tue 07/07/2026 11:23:57 PM EDT",
  },
  {
    gameId: 337, formatId: 337,
    familyKey: "florida-lotto", familyName: "Florida Lotto",
    gameClass: "stateJackpot", drawPeriod: null,
    feedName: "Florida-Lotto",
    drawDays: "Wed & Sat", drawTimeLocal: "11:00 PM",
    salesCutoff: "Wed and Sat, 35 minutes before draw time", playType: "6/53+6/53",
    resultDate: "2026-07-08",
    mainNumbers: [3, 8, 11, 18, 23, 38],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: { label: "Double Play", mainNumbers: [1, 6, 12, 19, 26, 31], specialBalls: [] },
    topPrizeDisplay: "$1,500,000",
    nextDrawDate: "2026-07-11", nextPrizeDisplay: "$2,000,000",
    feedUpdatedRaw: "Thu 07/09/2026 12:10:40 AM EDT",
  },
  {
    gameId: 582, formatId: 582,
    familyKey: "jackpot-triple-play", familyName: "Jackpot Triple Play",
    gameClass: "stateJackpot", drawPeriod: null,
    feedName: "Florida-Jackpot Triple Play",
    drawDays: "Tue & Fri", drawTimeLocal: "11:15 PM",
    salesCutoff: "Tue and Fri, 35 minutes before draw time", playType: "6/46",
    resultDate: "2026-07-07",
    mainNumbers: [8, 28, 32, 40, 41, 45],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$250,000",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$275,000",
    feedUpdatedRaw: "Wed 07/08/2026 01:05:27 AM EDT",
  },
  {
    gameId: 640, formatId: 640,
    familyKey: "fantasy-5", familyName: "Fantasy 5",
    gameClass: "stateDaily", drawPeriod: "Midday",
    feedName: "Florida-Fantasy 5 Midday",
    drawDays: "Daily", drawTimeLocal: "01:05 PM",
    salesCutoff: "20 minutes before the applicable drawing", playType: "5/36",
    resultDate: "2026-07-09",
    mainNumbers: [2, 18, 27, 32, 36],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$100,000",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$100,000",
    feedUpdatedRaw: "Thu 07/09/2026 01:31:50 PM EDT",
  },
  {
    gameId: 336, formatId: 336,
    familyKey: "fantasy-5", familyName: "Fantasy 5",
    gameClass: "stateDaily", drawPeriod: "Evening",
    feedName: "Florida-Fantasy 5",
    drawDays: "Daily", drawTimeLocal: "11:15 PM",
    salesCutoff: "35 minutes before draw time", playType: "5/36",
    resultDate: "2026-07-08",
    mainNumbers: [7, 25, 33, 35, 36],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$200,000",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$200,000",
    feedUpdatedRaw: "Thu 07/09/2026 12:02:00 AM EDT",
  },
  {
    gameId: 563, formatId: 563,
    familyKey: "pick-2", familyName: "Pick 2",
    gameClass: "dailyNumbers", drawPeriod: "Midday",
    feedName: "Florida-Pick 2 Midday",
    drawDays: "Daily", drawTimeLocal: "1:30 PM",
    salesCutoff: "Mon-Sun, 13 minutes before draw time", playType: "2-Digits+1",
    resultDate: "2026-07-09",
    mainNumbers: [6, 6],
    specialBalls: [{ label: "Fireball", values: [9] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$50",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$50",
    feedUpdatedRaw: "Thu 07/09/2026 01:46:44 PM EDT",
  },
  {
    gameId: 564, formatId: 564,
    familyKey: "pick-2", familyName: "Pick 2",
    gameClass: "dailyNumbers", drawPeriod: "Evening",
    feedName: "Florida-Pick 2 Evening",
    drawDays: "Daily", drawTimeLocal: "9:45 PM",
    salesCutoff: "Mon-Sun, 13 minutes before draw time", playType: "2-Digits+1",
    resultDate: "2026-07-08",
    mainNumbers: [0, 0],
    specialBalls: [{ label: "Fireball", values: [4] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$50",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$50",
    feedUpdatedRaw: "Wed 07/08/2026 10:01:47 PM EDT",
  },
  {
    gameId: 332, formatId: 332,
    familyKey: "pick-3", familyName: "Pick 3",
    gameClass: "dailyNumbers", drawPeriod: "Midday",
    feedName: "Florida-Pick 3 Midday",
    drawDays: "Daily", drawTimeLocal: "1:30 PM",
    salesCutoff: "Mon-Sun, 11 minutes before draw time", playType: "3-Digits+1",
    resultDate: "2026-07-09",
    mainNumbers: [3, 7, 8],
    specialBalls: [{ label: "Fireball", values: [9] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$500",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$500",
    feedUpdatedRaw: "Thu 07/09/2026 02:01:34 PM EDT",
  },
  {
    gameId: 333, formatId: 333,
    familyKey: "pick-3", familyName: "Pick 3",
    gameClass: "dailyNumbers", drawPeriod: "Evening",
    feedName: "Florida-Pick 3 Evening",
    drawDays: "Daily", drawTimeLocal: "9:45 PM",
    salesCutoff: "Mon-Sun, 11 minutes before draw time", playType: "3-Digits+1",
    resultDate: "2026-07-08",
    mainNumbers: [5, 6, 9],
    specialBalls: [{ label: "Fireball", values: [4] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$500",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$500",
    feedUpdatedRaw: "Wed 07/08/2026 10:16:39 PM EDT",
  },
  {
    gameId: 334, formatId: 334,
    familyKey: "pick-4", familyName: "Pick 4",
    gameClass: "dailyNumbers", drawPeriod: "Midday",
    feedName: "Florida-Pick 4 Midday",
    drawDays: "Daily", drawTimeLocal: "1:30 PM",
    salesCutoff: "Mon-Sun, 10 minutes before draw time", playType: "4-Digits+1",
    resultDate: "2026-07-09",
    mainNumbers: [5, 5, 5, 7],
    specialBalls: [{ label: "Fireball", values: [9] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$5,000",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$5,000",
    feedUpdatedRaw: "Thu 07/09/2026 02:01:35 PM EDT",
  },
  {
    gameId: 335, formatId: 335,
    familyKey: "pick-4", familyName: "Pick 4",
    gameClass: "dailyNumbers", drawPeriod: "Evening",
    feedName: "Florida-Pick 4 Evening",
    drawDays: "Daily", drawTimeLocal: "9:45 PM",
    salesCutoff: "Mon-Sun, 10 minutes before draw time", playType: "4-Digits+1",
    resultDate: "2026-07-08",
    mainNumbers: [1, 3, 2, 2],
    specialBalls: [{ label: "Fireball", values: [4] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$5,000",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$5,000",
    feedUpdatedRaw: "Wed 07/08/2026 10:16:39 PM EDT",
  },
  {
    gameId: 565, formatId: 565,
    familyKey: "pick-5", familyName: "Pick 5",
    gameClass: "dailyNumbers", drawPeriod: "Midday",
    feedName: "Florida-Pick 5 Midday",
    drawDays: "Daily", drawTimeLocal: "1:30 PM",
    salesCutoff: "Mon-Sun, 12 minutes before draw time", playType: "5-Digits+1",
    resultDate: "2026-07-09",
    mainNumbers: [0, 8, 0, 2, 9],
    specialBalls: [{ label: "Fireball", values: [9] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$25,000",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$25,000",
    feedUpdatedRaw: "Thu 07/09/2026 02:01:45 PM EDT",
  },
  {
    gameId: 566, formatId: 566,
    familyKey: "pick-5", familyName: "Pick 5",
    gameClass: "dailyNumbers", drawPeriod: "Evening",
    feedName: "Florida-Pick 5 Evening",
    drawDays: "Daily", drawTimeLocal: "9:45 PM",
    salesCutoff: "Mon-Sun, 12 minutes before draw time", playType: "5-Digits+1",
    resultDate: "2026-07-08",
    mainNumbers: [6, 8, 6, 1, 6],
    specialBalls: [{ label: "Fireball", values: [4] }],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$25,000",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$25,000",
    feedUpdatedRaw: "Wed 07/08/2026 10:16:58 PM EDT",
  },
  {
    gameId: 614, formatId: 614,
    familyKey: "cash-pop", familyName: "Cash Pop",
    gameClass: "frequentDraw", drawPeriod: "Morning",
    feedName: "Florida-Cash Pop Morning",
    drawDays: "Daily", drawTimeLocal: "08:45 AM",
    salesCutoff: "Mon-Sun, 1 minute before draw time", playType: "1/15",
    resultDate: "2026-07-09",
    mainNumbers: [3],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$250",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$250",
    feedUpdatedRaw: "Thu 07/09/2026 09:01:39 AM EDT",
  },
  {
    gameId: 615, formatId: 615,
    familyKey: "cash-pop", familyName: "Cash Pop",
    gameClass: "frequentDraw", drawPeriod: "Matinee",
    feedName: "Florida-Cash Pop Matinee",
    drawDays: "Daily", drawTimeLocal: "11:45 AM",
    salesCutoff: "Mon-Sun, 1 minute before draw time", playType: "1/15",
    resultDate: "2026-07-09",
    mainNumbers: [3],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$250",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$250",
    feedUpdatedRaw: "Thu 07/09/2026 12:01:43 PM EDT",
  },
  {
    gameId: 616, formatId: 616,
    familyKey: "cash-pop", familyName: "Cash Pop",
    gameClass: "frequentDraw", drawPeriod: "Afternoon",
    feedName: "Florida-Cash Pop  Afternoon",
    drawDays: "Daily", drawTimeLocal: "2:45 PM",
    salesCutoff: "Mon-Sun, 1 minute before draw time", playType: "1/15",
    resultDate: "2026-07-09",
    mainNumbers: [4],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$250",
    nextDrawDate: "2026-07-10", nextPrizeDisplay: "$250",
    feedUpdatedRaw: "Thu 07/09/2026 03:01:41 PM EDT",
  },
  {
    gameId: 617, formatId: 617,
    familyKey: "cash-pop", familyName: "Cash Pop",
    gameClass: "frequentDraw", drawPeriod: "Evening",
    feedName: "Florida-Cash Pop  Evening",
    drawDays: "Daily", drawTimeLocal: "6:45 PM",
    salesCutoff: "Mon-Sun, 1 minute before draw time", playType: "1/15",
    resultDate: "2026-07-08",
    mainNumbers: [3],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$250",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$250",
    feedUpdatedRaw: "Wed 07/08/2026 07:01:40 PM EDT",
  },
  {
    gameId: 618, formatId: 618,
    familyKey: "cash-pop", familyName: "Cash Pop",
    gameClass: "frequentDraw", drawPeriod: "Late Night",
    feedName: "Florida-Cash Pop  Late Night",
    drawDays: "Daily", drawTimeLocal: "11:45 PM",
    salesCutoff: "Mon-Sun, 1 minute before draw time", playType: "1/15",
    resultDate: "2026-07-08",
    mainNumbers: [6],
    specialBalls: [],
    multiplier: null,
    secondaryDraw: null,
    topPrizeDisplay: "$250",
    nextDrawDate: "2026-07-09", nextPrizeDisplay: "$250",
    feedUpdatedRaw: "Thu 07/09/2026 12:02:14 AM EDT",
  },
];

/** Extraction date for [P1]/[P2]. Displayed as the result-source verification date. */
export const FLORIDA_EVENTS_EXTRACTED = "2026-07-28";

export interface FloridaGameFamily {
  familyKey: string;
  familyName: string;
  gameClass: FloridaGameClass;
  events: FloridaDrawEvent[];
}

/**
 * Collapse events into the 10 game identities, preserving event order.
 *
 * FD-X-06: "Frequent-draw variants must be grouped rather than expanded into excessive top-page cards."
 * Cash Pop's five daily draws become ONE family with five events; Pick 2/3/4/5 and Fantasy 5 each become
 * one family with a midday and an evening event.
 */
export function floridaGameFamilies(
  events: readonly FloridaDrawEvent[] = FLORIDA_DRAW_EVENTS,
): FloridaGameFamily[] {
  const out: FloridaGameFamily[] = [];
  for (const e of events) {
    const found = out.find((f) => f.familyKey === e.familyKey);
    if (found) found.events.push(e);
    else out.push({ familyKey: e.familyKey, familyName: e.familyName, gameClass: e.gameClass, events: [e] });
  }
  return out;
}

/** The most recently drawn event in a family — the one whose result the family card leads with. */
export function latestEventOf(family: FloridaGameFamily): FloridaDrawEvent {
  return [...family.events].sort((a, b) => (b.resultDate ?? "").localeCompare(a.resultDate ?? ""))[0];
}
