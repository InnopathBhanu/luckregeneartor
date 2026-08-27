/*
 * THE SIGNED-IN PERKS LAYER — LRG-PERS-001. BP-02 Part VI §38 (Home) and PF-02 Part VII §32 (State).
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. MEMBER STATE IN SERVER HTML. Global Shell §33: the layers are client-only, their server render is
 *      nothing, and the anonymous HTML of / and /fl never carries a personal class, attribute or name.
 *   2. AN INVENTED SEQUENCE. The section ids come from the two blueprints VERBATIM — this file reads the
 *      blueprint tables themselves, so a drifted id fails against the approved document, not a copy.
 *   3. AN INVENTED PRIZE. The match layer states which numbers coincide with a published drawing and stops.
 *      Four hand-verifiable cases pin the math; the copy sweep bans the celebration/urgency vocabulary.
 *   4. A DELIVERY CLAIM OR A PAID ANYTHING. `FD-ACC-18` frequencies are visible per option; `FD-ACC-11`
 *      means nothing is promised; `FD-ACC-02`/`FD-ACC-16` mean no Insider, paid or upgrade word anywhere.
 *   5. A DISHONEST GUEST STORE. Shell §12: device-local wording, a real Clear, and no cloud implication.
 */

import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  computeMatches,
  continueItems,
  factFromResultCard,
  FOLLOW_FIRST_GAME_SENTENCE,
  HOME_SIGNED_IN_SEQUENCE,
  labelFromRef,
  MATCH_BOUNDARY_SENTENCE,
  myLotteryDayRows,
  NO_DELIVERY_SENTENCE,
  NOTIFICATION_OPTIONS,
  SCRATCHERS_EMPTY_SENTENCE,
  STATE_SIGNED_IN_SEQUENCE,
  WHERE_TO_PLAY_ACCOUNT_NEUTRAL,
  worthKnowingInsights,
  type PageGameFact,
} from "../lib/personal/personalModel";
import {
  clearGuestProgress,
  GUEST_CLEAR_LABEL,
  GUEST_KEEP_PROMPT,
  GUEST_STORAGE_SENTENCE,
  readGuestProgress,
  readGuestProgressServer,
  recordGuestProgress,
} from "../lib/personal/guestProgress";
import { saveNumberSet, signOut } from "../lib/account/session";
import { storeResetForTests } from "../lib/account/reviewAccountStore";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/** Source with comments stripped — a comment RECORDING a rule is the audit trail, not a violation. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const LAYER_FILES = [
  "lib/personal/personalModel.ts",
  "lib/personal/guestProgress.ts",
  "components/personal/PersonalCards.tsx",
  "components/personal/SignedInHomeLayer.tsx",
  "components/personal/SignedInStateLayer.tsx",
  "components/personal/GuestProgress.tsx",
];

const HOME_BP = readFileSync(
  new URL("../../03-docs/01-approved-blueprints/home/03-lotterycorner-home-page-blueprint-FINAL-APPROVED.md", import.meta.url),
  "utf8",
);
const STATE_BP = readFileSync(
  new URL("../../03-docs/01-approved-blueprints/state/04-lotterycorner-state-page-blueprint-FINAL-APPROVED.md", import.meta.url),
  "utf8",
);

/** The `| order | ID | Section |` rows of one blueprint's signed-in sequence table. */
function sequenceTable(doc: string, heading: string): { order: number; id: string }[] {
  const start = doc.indexOf(heading);
  assert.ok(start !== -1, `blueprint section "${heading}" must exist`);
  const block = doc.slice(start, doc.indexOf("## ", start + heading.length));
  const rows: { order: number; id: string }[] = [];
  for (const m of block.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|/gm)) {
    rows.push({ order: Number(m[1]), id: m[2]! });
  }
  assert.ok(rows.length > 0, `no table rows under "${heading}"`);
  return rows;
}

beforeEach(() => {
  storeResetForTests();
  signOut();
});

/* ══════════════════════════════════════════════════ 1. the sequences, verbatim from the blueprints */

describe("BP-02 §38: the Home layer's ids are the blueprint's, verbatim and in order", () => {
  const rows = sequenceTable(HOME_BP, "## 38. Signed-In Sequence");

  test("rows 1–11 are the layer's sequence, id for id", () => {
    assert.deepEqual(
      HOME_SIGNED_IN_SEQUENCE.map((s) => s.id),
      rows.filter((r) => r.order <= 11).map((r) => r.id),
    );
  });

  test("rows 12–13 (H-14B, H-15) are the anonymous page below, not the layer's to render", () => {
    /* §38's closing rule: "The signed-in page retains broad national and state discovery." */
    assert.deepEqual(rows.filter((r) => r.order > 11).map((r) => r.id), ["H-14B", "H-15"]);
    assert.doesNotMatch(code("components/personal/SignedInHomeLayer.tsx"), /H-14B|H-15/);
  });

  test("AD-HS01 sits at blueprint position 5, is the only ad anchor, and is typed empty", () => {
    assert.equal(HOME_SIGNED_IN_SEQUENCE[4]!.id, "AD-HS01");
    assert.deepEqual(HOME_SIGNED_IN_SEQUENCE.filter((s) => s.adAnchor).map((s) => s.id), ["AD-HS01"]);
    /* CLAUDE.md §12: slots are transcribed from production, never invented — no signed-in family is
       captured, so the anchor renders no container, no reservation, no creative. The citation must be in
       the source as the audit trail. */
    assert.match(src("components/personal/PersonalCards.tsx"), /CLAUDE\.md.*§12|§12.*CLAUDE\.md/s);
    const anchor = code("components/personal/PersonalCards.tsx");
    assert.match(anchor, /data-ad-typed-empty/);
    assert.doesNotMatch(anchor, /googletag|defineSlot|adsbygoogle/);
  });
});

describe("PF-02 §32: the State layer's ids are the blueprint's, verbatim and in order", () => {
  const rows = sequenceTable(STATE_BP, "## 32. Signed-In Sequence");

  test("the layer renders the S-*S rows plus AD-SS01, in blueprint order, skipping only inherited slots", () => {
    /* AD-SS00 (row 2) and AD-SS02 (row 16) are the anonymous composition's approved inventory — the layer
       must never move, duplicate or repurpose a slot (CLAUDE.md §12) — and rows 15/17 are the public page
       itself. Everything else is the layer's, in order. */
    const expected = rows
      .filter((r) => /^S-\d\dS$/.test(r.id) || r.id === "AD-SS01")
      .map((r) => r.id);
    assert.deepEqual(STATE_SIGNED_IN_SEQUENCE.map((s) => s.id), expected);
  });

  test("the inherited slots AD-SS00 and AD-SS02 are in the blueprint but never in the layer's code", () => {
    assert.ok(rows.some((r) => r.id === "AD-SS00" && r.order === 2));
    assert.ok(rows.some((r) => r.id === "AD-SS02" && r.order === 16));
    assert.doesNotMatch(code("components/personal/SignedInStateLayer.tsx"), /AD-SS00|AD-SS02/);
    assert.doesNotMatch(code("components/personal/PersonalCards.tsx"), /AD-SS00|AD-SS02/);
  });

  test("both layers stamp their full order on the DOM for audit", () => {
    for (const f of ["components/personal/SignedInHomeLayer.tsx", "components/personal/SignedInStateLayer.tsx"]) {
      assert.match(src(f), /data-personal-order=\{ids\.join\(","\)\}/);
    }
  });
});

/* ══════════════════════════════════════════════════ 2. Global Shell §33 — anonymous server HTML */

describe("Shell §33: the server HTML of / and /fl carries zero personal markup", () => {
  test("every personal component is client-only and returns null without a browser session", () => {
    for (const f of [
      "components/personal/SignedInHomeLayer.tsx",
      "components/personal/SignedInStateLayer.tsx",
      "components/personal/GuestProgress.tsx",
      "components/personal/PersonalCards.tsx",
    ]) {
      assert.match(src(f).trimStart(), /^"use client";/, `${f} must be a client component`);
    }
    for (const f of ["components/personal/SignedInHomeLayer.tsx", "components/personal/SignedInStateLayer.tsx"]) {
      assert.match(src(f), /if \(!session \|\| !account\) return null;/, `${f} renders nothing anonymous`);
    }
    assert.match(src("components/personal/GuestProgress.tsx"), /if \(session\) return null;/);
    assert.match(src("components/personal/GuestProgress.tsx"), /if \(entries\.length === 0\) return null;/);
  });

  test("the session seam's server snapshot is hard-coded anonymous, and the guest store's is empty", () => {
    assert.match(src("lib/account/useAccountSession.ts"), /return ANONYMOUS; \/\* §33/);
    assert.equal(readGuestProgressServer().length, 0);
    /* And in this Node process — no window, exactly like a rendering server — the store reads empty and
       recording is a no-op, so no server path can ever accumulate device progress. */
    recordGuestProgress({ kind: "viewed-game", label: "Florida lottery results" });
    assert.equal(readGuestProgress().length, 0);
  });

  test("the mounts are bare client mounts that add no section and reorder nothing", () => {
    const home = src("components/preview/HomePreview.tsx");
    assert.equal(home.match(/<SignedInHomeLayer /g)?.length, 1);
    assert.match(home, /<SignedInHomeLayer facts=\{homeFactsFromEntries\(entries\)\} \/>/);
    assert.equal(home.match(/<GuestProgress\b/g)?.length, 1);
    /* Mounted ABOVE the anonymous H1, inside the container — priority, not fact ownership. */
    assert.ok(home.indexOf("<SignedInHomeLayer") < home.indexOf("Page heading — exactly one h1"));

    const state = src("components/state/preview/StatePreview.tsx");
    assert.equal(state.match(/<SignedInStateLayer\b/g)?.length, 1);
    assert.equal(state.match(/<GuestProgress\b/g)?.length, 1);
    assert.match(state, /stateFactsFromGroups\(model\.results, model\.stateCode\)/);
    /* A no-lottery state has nothing to personalize. */
    assert.match(state, /\{model\.noLottery \? null : \(\s*<SignedInStateLayer/);

    /* Neither preview reads the session itself: the anonymous composition stays session-blind. */
    for (const f of ["components/preview/HomePreview.tsx", "components/state/preview/StatePreview.tsx"]) {
      assert.doesNotMatch(src(f), /useAccountSession|lib\/account\/session/);
    }
  });

  test("the layers own no data source: no fetch, no new lottery fact", () => {
    for (const f of LAYER_FILES) {
      const s = code(f);
      assert.doesNotMatch(s, /\bfetch\(|XMLHttpRequest|axios/, `${f} must not fetch`);
    }
  });

  /* OPT-IN runtime proof against a running server (the state-runtime-proof pattern):
     LC_VERIFY_URL=http://localhost:3000 — skipped otherwise so the suite stays offline. */
  const BASE = process.env.LC_VERIFY_URL;
  const skip = BASE ? false : "set LC_VERIFY_URL to check a running server";
  for (const path of ["/", "/fl"]) {
    test(`served ${path} is byte-level anonymous`, { skip }, async () => {
      const html = await (await fetch(`${BASE}${path}`)).text();
      for (const marker of [
        "lcp-personal", "data-personal-layer", "data-personal-section", "data-guest-progress",
        "Signed in as", "My Lottery Day", "My Matches", GUEST_STORAGE_SENTENCE,
      ]) {
        assert.ok(!html.includes(marker), `${path} server HTML must not contain "${marker}"`);
      }
    });
  }
});

/* ══════════════════════════════════════════════════ 3. the match math — four hand cases */

const DIGIT_FACT: PageGameFact = {
  gameRef: "fl/pick-3", gameLabel: "Florida Pick 3", kind: "digit",
  drawDateIso: "2026-08-10", drawDateDisplay: "Monday, August 10, 2026",
  main: [4, 7, 1], special: null, specialLabel: null,
  nextDrawDisplay: null, nextJackpotDisplay: null,
};
const BALL_FACT: PageGameFact = {
  gameRef: "powerball", gameLabel: "Powerball", kind: "ball",
  drawDateIso: "2026-08-09", drawDateDisplay: "Saturday, August 9, 2026",
  main: [7, 21, 60, 52, 3], special: 12, specialLabel: "Powerball",
  nextDrawDisplay: "Monday, August 11, 2026", nextJackpotDisplay: "$215 Million",
};
const set = (id: string, gameRef: string, main: number[], special: number | null) => ({
  id, gameRef, label: id, main, special,
  savedAtIso: "2026-08-01T00:00:00.000Z", dataMode: "review" as const,
});

describe("the four hand cases: coincidence stated exactly, never a prize", () => {
  test("digit exact: 4-7-1 saved, 4-7-1 drawn — all three, in drawn order", () => {
    const [o] = computeMatches([set("Exact", "fl/pick-3", [4, 7, 1], null)], [DIGIT_FACT]);
    assert.equal(o!.kind, "digit-exact");
    assert.deepEqual(o!.matchedMain, [4, 7, 1]);
    assert.equal(o!.mainMatched, 3);
    assert.equal(o!.mainCount, 3);
    assert.equal(o!.specialMatched, null);
    assert.equal(o!.sentence, "“Exact” matches all 3 digits of the Florida Pick 3 drawing shown, in drawn order.");
  });

  test("digit partial: 4-9-1 saved, 4-7-1 drawn — positions 1 and 3 only", () => {
    const [o] = computeMatches([set("Partial", "fl/pick-3", [4, 9, 1], null)], [DIGIT_FACT]);
    assert.equal(o!.kind, "digit-partial");
    assert.deepEqual(o!.matchedMain, [4, 1]);
    assert.equal(o!.mainMatched, 2);
    assert.equal(
      o!.sentence,
      "“Partial” matches 2 of 3 digits of the Florida Pick 3 drawing shown, in the same position.",
    );
  });

  test("ball main+bonus: 7 21 34 52 68 PB 12 against 7 21 60 52 3 PB 12 — three mains and the Powerball", () => {
    const [o] = computeMatches([set("Ours", "powerball", [7, 21, 34, 52, 68], 12)], [BALL_FACT]);
    assert.equal(o!.kind, "ball-match");
    assert.deepEqual([...o!.matchedMain].sort((a, b) => a - b), [7, 21, 52]);
    assert.equal(o!.mainMatched, 3);
    assert.equal(o!.mainCount, 5);
    assert.equal(o!.specialMatched, true);
    assert.equal(o!.sentence, "“Ours” — This line matches 3 of your 5 main numbers (7, 21, 52) and the Powerball.");
  });

  test("no match: reported honestly, in the checker's own flat sentence", () => {
    const [o] = computeMatches([set("None", "powerball", [1, 2, 8, 40, 55], 9)], [BALL_FACT]);
    assert.equal(o!.kind, "no-match");
    assert.equal(o!.mainMatched, 0);
    assert.equal(o!.specialMatched, false);
    assert.equal(o!.sentence, "“None” — None of these numbers matches the drawing shown.");
  });

  test("a shape mismatch is not-comparable, never force-compared", () => {
    const [o] = computeMatches([set("Short", "fl/pick-3", [4, 7], null)], [DIGIT_FACT]);
    assert.equal(o!.kind, "not-comparable");
    assert.match(o!.sentence, /were not compared/);
  });

  test("no sentence ever names money, a prize or a claim outcome", () => {
    const outcomes = computeMatches(
      [
        set("Exact", "fl/pick-3", [4, 7, 1], null),
        set("Ours", "powerball", [7, 21, 34, 52, 68], 12),
        set("None", "powerball", [1, 2, 8, 40, 55], 9),
      ],
      [DIGIT_FACT, BALL_FACT],
    );
    for (const o of outcomes) {
      assert.doesNotMatch(o.sentence, /\$|\bprize\b|\bwin\b|\bwon\b|\bpayout\b|\bjackpot\b/i);
    }
    assert.match(MATCH_BOUNDARY_SENTENCE, /Only the lottery that sold a\s+ticket/);
  });

  test("the round trip: a set saved through the session seam is what gets checked", async () => {
    const { createAccount } = await import("../lib/account/session");
    const created = await createAccount({
      email: "perks@example.com", secret: "a-long-enough-secret",
      staySignedIn: true, acceptedCommunityRules: true,
    });
    assert.ok(created.ok);
    const account = saveNumberSet({ gameRef: "powerball", label: "Ours", main: [7, 21, 34, 52, 68], special: 12 });
    const outcomes = computeMatches(account!.savedNumberSets, [BALL_FACT]);
    assert.equal(outcomes.length, 1);
    assert.equal(outcomes[0]!.kind, "ball-match");
  });
});

/* ══════════════════════════════════════════════════ 4. banned copy — swept across the layer */

describe("the banned vocabulary appears nowhere in the layer's code or copy", () => {
  test("no celebration, near-miss, streak or urgency language", () => {
    for (const f of LAYER_FILES) {
      const s = code(f);
      for (const re of [
        /almost won/i, /near[- ]?miss/i, /confetti/i, /\bstreak/i,
        /hurry/i, /act now/i, /don'?t miss/i, /last chance/i, /running out/i,
        /increase your (chances|odds)/i, /\bdue\b to hit/i,
      ]) {
        assert.doesNotMatch(s, re, `${f} must not carry ${re}`);
      }
    }
  });

  test("no Insider, paid, upgrade or tier word (FD-ACC-02/16)", () => {
    for (const f of LAYER_FILES) {
      const s = code(f).toLowerCase();
      for (const banned of [
        "insider", "premium", "paid", "paywall", "upgrade", "trial",
        "subscription", "pricing", "checkout", "billing", "tier",
      ]) {
        assert.ok(!s.includes(banned), `"${banned}" must not appear in ${f}`);
      }
    }
  });

  test("no delivery promise anywhere (FD-ACC-11)", () => {
    for (const f of LAYER_FILES) {
      assert.doesNotMatch(
        code(f),
        /we('| wi)ll (email|send|text|notify)|you('| wi)ll receive|will be sent|sends you an?\b/i,
        `${f} must not promise delivery`,
      );
    }
  });

  test("the CSS block is quiet: no animation, no celebration", () => {
    const css = src("app/globals.css");
    const marker = css.indexOf("SIGNED-IN PERKS LAYER");
    assert.ok(marker !== -1);
    /* From the block comment's own opener, so the comment strips cleanly below. */
    const block = css.slice(css.lastIndexOf("/*", marker)).split("§B5 mobile density")[0]!;
    for (const re of [/animation/i, /@keyframes/i, /transition/i, /#[0-9a-f]{3,8}\b/i]) {
      assert.doesNotMatch(block.replace(/\/\*[\s\S]*?\*\//g, " "), re, `personal CSS must not carry ${re}`);
    }
  });
});

/* ══════════════════════════════════════════════════ 5. FD-ACC-18 — per-option frequency, visible */

describe("FD-ACC-18: every notification option declares its frequency, and nothing claims delivery", () => {
  test("three options, each with its own stated frequency", () => {
    assert.equal(NOTIFICATION_OPTIONS.length, 3);
    assert.deepEqual(NOTIFICATION_OPTIONS.map((o) => o.frequency), [
      "Up to once per drawing",
      "Up to once per drawing, after the result is published",
      "Up to once per day",
    ]);
    for (const o of NOTIFICATION_OPTIONS) {
      assert.ok(o.key && o.label, "every option carries a key and a reader-facing label");
    }
  });

  test("the controls render the frequency beside each option and the no-delivery truth after them", () => {
    const cards = src("components/personal/PersonalCards.tsx");
    assert.match(cards, /data-frequency=\{opt\.key\}/);
    assert.match(cards, /\{opt\.frequency\}/);
    assert.match(cards, /data-no-delivery="true"/);
    assert.match(NO_DELIVERY_SENTENCE, /^Nothing is sent yet/);
    assert.match(NO_DELIVERY_SENTENCE, /no email or push channel/);
  });

  test("the controls carry unfollow, clear-device-data and responsible-play access", () => {
    const cards = src("components/personal/PersonalCards.tsx");
    assert.match(cards, /unfollowGame\(/);
    assert.match(cards, /unfollowState\(/);
    assert.match(cards, /data-clear-device-data="true"/);
    assert.match(cards, /onClick=\{clearGuestProgress\}/);
    /* /responsible-play does not exist (GS-15 records it unavailable), so the control is the footer's own
       live helpline destination — never a dead link styled as a working one (CLAUDE.md §9). */
    assert.match(cards, /data-responsible-play="true"/);
    assert.match(cards, /HELPLINE_TEL/);
    assert.doesNotMatch(code("components/personal/PersonalCards.tsx"), /href="\/responsible-play"/);
  });
});

/* ══════════════════════════════════════════════════ 6. guest progress — Shell §12 */

describe("Shell §12: guest progress is device-local, says so, and clears for real", () => {
  test("the storage sentence is the device-local truth, with no cloud implication", () => {
    assert.equal(GUEST_STORAGE_SENTENCE, "Stored on this device only — clearing your browser removes it.");
    for (const f of ["lib/personal/guestProgress.ts", "components/personal/GuestProgress.tsx"]) {
      assert.doesNotMatch(code(f), /cloud|backed up|backup|saved to your account|we keep a copy/i,
        `${f} must not imply a cloud copy`);
    }
  });

  test("the surface renders the sentence, a Clear control, and the /signup value prompt", () => {
    const s = src("components/personal/GuestProgress.tsx");
    assert.match(s, /data-guest-storage="true"/);
    assert.match(s, /\{GUEST_STORAGE_SENTENCE\}/);
    assert.match(s, /onClick=\{clearGuestProgress\}/);
    assert.equal(GUEST_CLEAR_LABEL, "Clear saved progress");
    assert.match(s, /href="\/signup"/);
    assert.match(GUEST_KEEP_PROMPT, /^Create a free account to keep these$/);
  });

  test("Clear really clears: a cleared store never serves the stale pre-clear list", () => {
    /* REGRESSION — found in browser verification. The snapshot cache was invalidated with `null`, which is
       also what a CLEARED store reads (`getItem` → null), so `raw === cacheRaw` was a false cache hit and
       the module kept rendering the entries the reader had just deleted. A minimal Storage is enough to
       walk the record → read → clear → read cycle in-process. */
    const backing = new Map<string, string>();
    const fakeWindow = {
      localStorage: {
        getItem: (k: string) => backing.get(k) ?? null,
        setItem: (k: string, v: string) => void backing.set(k, v),
        removeItem: (k: string) => void backing.delete(k),
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    (globalThis as Record<string, unknown>).window = fakeWindow;
    try {
      recordGuestProgress({ kind: "viewed-game", label: "Florida lottery results" });
      assert.equal(readGuestProgress().length, 1, "the visit is recorded on the device");
      clearGuestProgress();
      assert.equal(readGuestProgress().length, 0, "a cleared store reads empty, not the stale cache");
      assert.equal(backing.size, 0, "the device record is really gone");
    } finally {
      delete (globalThis as Record<string, unknown>).window;
    }
  });

  test("recording is anonymous-only and the signed-in surface hands off to Continue My Tools", () => {
    const s = src("components/personal/GuestProgress.tsx");
    assert.match(s, /if \(!kind \|\| !label \|\| session\) return;/);
    /* And signed-in Continue keeps the device-local honesty on any guest item it lists. */
    const items = continueItems(
      { preferences: { notifications: {}, page: {} }, savedNumberSets: [] },
      [{ label: "Tax estimate", savedAtIso: "2026-08-01T00:00:00.000Z" }],
      "/tools/tax-calculator",
    );
    assert.equal(items.length, 1);
    assert.equal(items[0]!.kind, "guest-progress");
    assert.match(items[0]!.detail!, /Stored on this device only/);
  });
});

/* ══════════════════════════════════════════════════ 7. the honest empty states */

describe("empty states: no follows leads to follow-first-game, never a fabricated feed", () => {
  test("no follows: zero rows, and the layers render the plain follow-first path", () => {
    assert.deepEqual(myLotteryDayRows([], [DIGIT_FACT, BALL_FACT]), []);
    assert.match(FOLLOW_FIRST_GAME_SENTENCE, /^Follow a game and this page starts with it\./);
    assert.doesNotMatch(FOLLOW_FIRST_GAME_SENTENCE, /!|now\b|today\b/i);
    /* Home offers the flagship pages (registry-served); State reuses the same sentence. */
    assert.match(src("components/personal/SignedInHomeLayer.tsx"), /rows\.length === 0[\s\S]{0,200}FOLLOW_FIRST_GAME_SENTENCE/);
    assert.match(src("components/personal/SignedInHomeLayer.tsx"), /flagshipRoutePaths\(\)/);
    assert.match(src("components/personal/SignedInStateLayer.tsx"), /FOLLOW_FIRST_GAME_SENTENCE/);
  });

  test("a follow whose result is not on the page is an honest row, not an omission", () => {
    const rows = myLotteryDayRows(["mega-millions"], [BALL_FACT]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.fact, null);
    assert.equal(rows[0]!.gameLabel, "Mega Millions");
    assert.equal(labelFromRef("fl/pick-3"), "FL Pick 3");
  });

  test("S-11S: the scratchers empty state states the truth — no data yet, nothing to follow", () => {
    assert.match(SCRATCHERS_EMPTY_SENTENCE, /does not carry scratcher information yet/);
    assert.match(src("components/personal/SignedInStateLayer.tsx"), /data-scratchers-empty="true"/);
  });

  test("H-09S/S-10S never infer purchase legality from the account", () => {
    assert.match(WHERE_TO_PLAY_ACCOUNT_NEUTRAL, /^Signing in does not change where lottery tickets can be bought\./);
    for (const f of ["components/personal/SignedInHomeLayer.tsx", "components/personal/SignedInStateLayer.tsx"]) {
      assert.match(src(f), /data-account-neutral="true"/);
    }
  });

  test("H-05S: every insight carries its visible why-shown reason", () => {
    const insights = worthKnowingInsights(
      { followedGames: ["powerball"], followedStates: [], savedNumberSets: [set("Ours", "powerball", [7, 21, 34, 52, 68], 12)] },
      [BALL_FACT],
    );
    assert.ok(insights.length >= 2);
    for (const i of insights) {
      assert.match(i.whyShown, /^Shown because /, "the reason is stated, per insight");
    }
    assert.match(src("components/personal/PersonalCards.tsx"), /data-why-shown="true"/);
  });

  test("a result card with no drawn numbers projects to no fact — never an invented drawing", () => {
    const card = {
      gameSlug: "powerball", displayName: "Powerball",
      resultDate: { gameLocalDate: "2026-08-09", display: "Saturday, August 9, 2026" },
      groupsDrawn: [],
    };
    assert.equal(factFromResultCard(card as never, "powerball", "ball"), null);
  });
});
