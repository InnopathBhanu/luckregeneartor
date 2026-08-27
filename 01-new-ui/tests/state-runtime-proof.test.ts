/*
 * RUNTIME PROOF for the guarded Florida preview — LRG-STATE-035 §6.
 *
 * WHY THIS TEST EXISTS. Two founder reviews reported implemented features as missing. Both times the source
 * was correct and the SERVED page was not: a stale server process kept answering on port 3000 with an older
 * build. Source-level tests cannot catch that, because they never look at what is actually being served.
 *
 * So this file checks the running server. It answers one question: **does the page a browser receives right
 * now contain the Engagement V1 experience, and which commit produced it?**
 *
 * OPT-IN, so `npm test` stays offline and deterministic:
 *
 *     LC_VERIFY_URL=http://localhost:3000 npm test
 *
 * Without `LC_VERIFY_URL` every test here is skipped rather than failing — an offline suite must not depend on
 * a server being up.
 *
 * TWO RUNTIME FAILURE MODES THIS IS DESIGNED TO CATCH, both encountered during this program of work:
 *
 *   1. A STALE SERVER. After `next start` boots, the process command is `next-server`, NOT `next start`. So
 *      `pkill -f "next start"` does not match it, the old process survives, and it keeps serving a previous
 *      build from its own loaded `.next`. The page then looks unchanged no matter how many times you rebuild.
 *      Kill by PORT or by `next-server`.
 *   2. A MIXED `.next` DIRECTORY. Running `next dev` and `next build`/`next start` against the same `.next`
 *      can leave it inconsistent — the observed symptom was `Cannot find module './331.js'` and a 500. Purge
 *      `.next` when switching modes.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { STATE_PREVIEW_COMMIT, STATE_EXPERIENCE_ID, STATE_RENDERER_ID } from "../lib/state/statePreviewGuard";

const BASE = process.env.LC_VERIFY_URL;
const skip = BASE ? false : "set LC_VERIFY_URL to check a running server";

/** Every string the guarded Florida page must contain in its SERVER HTML. */
const REQUIRED: readonly [string, string][] = [
  ["experience marker", STATE_EXPERIENCE_ID],
  ["renderer marker", STATE_RENDERER_ID],
  ["commit marker", STATE_PREVIEW_COMMIT],
  /* LRG-STATE-037 renamed three of these. The four-card engagement bar became the compact action row (FV-08),
     and its labels were shortened to plain ones (FV-08: "Use plain, familiar labels"). The markers moved with
     the DOM they describe; the guarantee is unchanged. */
  ["action row", 'data-action-row="true"'],
  ["Ask AI action", "Ask AI"],
  ["Discuss action", 'data-action="discuss"'],
  ["What changed disclosure", "What changed"],
  ["AI module heading", "LotteryCorner AI"],
  ["AI prompt", "data-prompt-key="],
  /* LRG-STATE-042 replaced the lower page with the five approved bands, so the markers are the bands
     themselves. Each is server-rendered, which is what this file exists to prove. */
  ["Explore band", 'data-explore-count='],
  ["featured news story", 'data-news="featured"'],
  ["supporting news stories", 'data-news="supporting"'],
  ["guides band", "data-guide-count="],
  ["community band", "data-discussion-count="],
  ["resources strip", "data-resource-count="],
  ["compact ad marker", 'data-review-mode="compact"'],
  ["family panel", "data-family-panel="],
  ["family summary", "data-family-summary="],
  /* FV-05: the discussion entry is a plain link now, not a dispatching action. */
  ["discussion entry", "data-discuss-link="],
  /* FV-04/FV-06/FV-07: the three inline surfaces that replaced dialogs must all be in the server HTML. */
  ["inline AI input", 'data-ai-input="true"'],
  ["inline Buy Now resolver", 'data-buynow-resolver="inline"'],
];

let fl = "", az = "", home = "";

before(async () => {
  if (!BASE) return;
  const get = async (p: string) => (await fetch(`${BASE}${p}`)).text();
  [fl, az, home] = await Promise.all([get("/fl"), get("/az"), get("/")]);
});

describe("LRG-STATE-035: the commit marker refers to a real commit in this checkout", () => {
  /*
   * WHAT THIS ASSERTS, AND WHY IT IS NOT "EQUALS HEAD".
   *
   * The obvious test — `STATE_PREVIEW_COMMIT === HEAD` — is wrong, and I wrote it that way first. `HEAD` moves
   * with every subsequent commit, so that test would fail the moment anything else landed, and the only way to
   * keep it green would be to restamp the constant on every commit. That trains people to edit the marker
   * mechanically, which is exactly how it would stop being trustworthy.
   *
   * The marker's actual job is to name WHICH IMPLEMENTATION is rendering. So the meaningful guarantee is that
   * it points at a commit this checkout genuinely contains: that catches a typo, a fabricated value, or a value
   * carried over from a different repository, while staying stable across unrelated commits.
   *
   * Restamp it when the EXPERIENCE changes, not when the sha does.
   */
  test("it is a valid short sha that is an ancestor of, or equal to, HEAD", () => {
    assert.match(STATE_PREVIEW_COMMIT, /^[0-9a-f]{7,40}$/, "must look like a git sha");

    const rev = (args: string[]) =>
      execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

    /* The object must exist and be a commit. */
    assert.equal(rev(["cat-file", "-t", STATE_PREVIEW_COMMIT]), "commit",
      `${STATE_PREVIEW_COMMIT} is not a commit in this repository`);

    /* And it must be reachable from HEAD — i.e. this checkout actually contains the code it names. */
    let reachable = true;
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", STATE_PREVIEW_COMMIT, "HEAD"],
        { stdio: "ignore" });
    } catch {
      reachable = false;
    }
    assert.ok(reachable,
      `STATE_PREVIEW_COMMIT (${STATE_PREVIEW_COMMIT}) is not reachable from HEAD. ` +
        `The rendered marker would name code this checkout does not contain.`);
  });
});

describe("LRG-STATE-035: the SERVED page contains the Engagement V1 experience", { skip }, () => {
  test("the guarded /fl response contains every required marker", () => {
    const missing = REQUIRED.filter(([, needle]) => !fl.includes(needle)).map(([name]) => name);
    assert.deepEqual(missing, [],
      `The server is not serving Engagement V1. Missing: ${missing.join(", ")}. ` +
        `Check for a stale process (kill by port, or by "next-server" — "next start" does not match it) ` +
        `and purge .next before restarting.`);
  });

  test("the served page names the stamp this checkout carries", () => {
    /* Asserts against `STATE_PREVIEW_COMMIT`, NOT against `HEAD` — and that distinction is the whole point.
       I first wrote this as `fl.includes(HEAD)` and it broke the moment this task's own commit landed, because
       the stamp names the commit the EXPERIENCE was built at, not the tip of the branch. Combined with the
       ancestor check above, this pair gives the guarantee that matters: the page names a stamp, and that stamp
       is code this checkout genuinely contains. */
    assert.ok(fl.includes(STATE_PREVIEW_COMMIT),
      `The served page does not name the stamp (${STATE_PREVIEW_COMMIT}). A different build is being served.`);
  });

  test("the marker is absent on other State routes and on Home", () => {
    /* Proves the marker is scoped to the guarded jurisdiction rather than leaking site-wide. */
    assert.ok(!az.includes(STATE_EXPERIENCE_ID), "/az must not carry the experience marker");
    assert.ok(!home.includes(STATE_EXPERIENCE_ID), "Home must not carry the experience marker");
  });

  test("the engagement experience does not depend on client-side interaction to exist", () => {
    /* §6: the route must be provable from server HTML. The engagement bar, AI prompts, community areas and
       result panels are all server-rendered; only the local-storage-dependent pieces hydrate later. */
    for (const needle of ['data-action-row="true"', "data-prompt-key=", "data-discussion-count=",
                          "data-family-panel="]) {
      assert.ok(fl.includes(needle), `${needle} must be in the server HTML, not injected client-side`);
    }
  });

  test("the SERVED page prints no provenance badge and no unavailable card", () => {
    /* LRG-STATE-039 §1/§11, checked against what a browser actually receives. The source sweep can pass while
       a stale build still serves the badges, which is the failure mode this file exists for. */
    for (const banned of ["SOURCE CHECKED", "Source checked", "Official source", "OFFICIAL SOURCE",
                          "currently unavailable", "Currently unavailable", "data-unavailable",
                          "UNDER REVIEW", "Adaptive priority", "Sections moved"]) {
      assert.ok(!fl.includes(banned), `the served Florida page must not contain "${banned}"`);
    }
    /* And the one line that replaced them is present, with its machine-readable value intact. */
    assert.ok(/data-last-updated="/.test(fl), "the governed timestamp is still emitted");
    /* React inserts a text-node separator between the literal and the interpolation, so the assertion allows
       for it rather than matching a string the renderer never emits contiguously. */
    /*
     * PRE-EXISTING TEST DEFECT, found by LRG-UX-SCHEMA-001 when the opt-in runtime suite was actually run.
     *
     * The assertion read `Updated <date>`; the page has rendered `Last updated <date>` for some time. Because
     * this whole file is gated behind `LC_VERIFY_URL`, which `npm test` does not set, the mismatch had never
     * executed. The SERVED copy is correct and is what the surrounding comment describes ("one concise
     * reader-facing line") — the regex was wrong, so the regex is what changed.
     */
    assert.ok(/Last updated (<!-- -->)?\w+ \d+, \d{4} at \d+:\d\d [AP]M/.test(fl),
      "and rendered as one concise reader-facing line");
    assert.ok(/Results from /.test(fl));
    /* Share and the split destination groups are server-rendered, not injected. */
    /* LRG-STATE-042: the two link groups became the Explore band and the Resources strip. */
    for (const needle of ['data-share-action="true"', "data-explore-count=", "data-resource-count="]) {
      assert.ok(fl.includes(needle), `${needle} must be in the server HTML`);
    }
  });

  test("no ordinary action opens a dialog in the SERVED page", () => {
    /* LRG-STATE-037 FV-03, proven at runtime rather than only in source. The founder's second rejection was
       that ordinary actions relied on modal dialogs; a source test can be satisfied while a stale build still
       serves the old markup, which is the exact failure this file exists to catch. */
    for (const banned of ['role="dialog"', "aria-modal", "<dialog"]) {
      assert.ok(!fl.includes(banned), `the served Florida page must not contain ${banned}`);
    }
    /* And the three inline replacements are present in the same response. */
    for (const [what, needle] of [["AI input", 'data-ai-input="true"'],
                                  ["What changed anchor", 'id="what-changed"'],
                                  ["Buy Now resolver", 'data-buynow-resolver="inline"']] as const) {
      assert.ok(fl.includes(needle), `the inline ${what} must be served`);
    }
  });
});
