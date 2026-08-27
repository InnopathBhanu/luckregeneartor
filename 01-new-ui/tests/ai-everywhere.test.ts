/*
 * AI-EVERYWHERE PHASE 1 — §C.
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. A PREDICTION CLAIM reaching a reader. The flagship had a copy scanner; §C4 extends it across Home, State,
 *      the Game Page and the archive, over the actual STRINGS those pages emit — not only their components.
 *   2. A DEAD AI CONTROL. `FD-DAT-17` requires the model-executed surface to be absent, not gated-and-dead, and
 *      `FD-ACC-14` forbids a disabled control presented as functional. The teaser was both.
 *   3. A PROVIDER SNEAKING IN. §C0 permits no fetch, no `/api`, no account and no quota anywhere in this phase.
 *   4. A §10.5 COVERAGE HOLE — a section on any of the five pages with no recorded intelligence decision.
 *   5. A GAP FIGURE WITH NO SCALE, which is the input a reader converts into "so it is due".
 *   6. FIVE AI VOCABULARIES again — two names for one disclosure, an AI badge on arithmetic, blank-box-first.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  AI_DISCLOSURE, ANSWER_LABEL, APPROVED_AI_LABELS, AI_IDENTITY, CHOOSE_PROMPT,
  LEAD_QUESTIONS_MAX, LEAD_QUESTIONS_MIN, NO_MATCH_NOTICE, SOURCES_SUMMARY, matchQuestion,
} from "../lib/ai/answerSurface";
import {
  CLAIM_LABEL, GAP_MYTH_EXPLANATION, OBSERVATION_BOUNDARY, addOnExplanation, drawFingerprint, gapContext,
  previousDrawRelationship,
} from "../lib/ai/drawInsights";
import {
  SECTION_INTELLIGENCE, explainActionSections, intelligenceOf, sectionIntelligence,
} from "../lib/ai/sectionIntelligence";
import { STATE_SECTIONS } from "../lib/state/sectionManifest";
import { AR_ORDER_BLUEPRINT } from "../lib/archive/archiveContract";
import { FLAGSHIP_SECTION_ORDER } from "../lib/flagship/flagshipContract";
import { globalShell } from "../lib/shell/globalShellModel";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const exists = (p: string) => existsSync(new URL(`../${p}`, import.meta.url));
/** Source with comments stripped: prose ABOUT a rule must never satisfy or break an assertion about output. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ══════════════════════════════════════════════════════════════════════ C0 the hard constraints */

describe("§C0: nothing in this phase connects a model", () => {
  const AI_FILES = [
    "lib/ai/answerSurface.ts",
    "lib/ai/drawInsights.ts",
    "lib/ai/sectionIntelligence.ts",
    "components/shell/AnswerSurface.tsx",
    "components/state/preview/StateAiSurface.tsx",
    "components/flagship/tools/FlagshipAiConsole.tsx",
    "app/ai-policy/page.tsx",
  ];

  test("no provider, no fetch, no /api route, no account, no quota", () => {
    for (const f of AI_FILES) {
      const body = code(f);
      for (const re of [
        /fetch\(/, /XMLHttpRequest/, /anthropic/i, /openai/i, /\bgemini\b/i,
        /\/api\//, /process\.env\.[A-Z_]*(KEY|TOKEN|SECRET)/,
        /quota/i, /tokensUsed/i, /usageLedger/i,
      ]) {
        assert.doesNotMatch(body, re, `${f} must not reference ${re}`);
      }
    }
    /* And no API route directory was created (§C0, and `CLAUDE.md` §15 forbids API work in a UI task). */
    assert.equal(exists("app/api"), false, "no /api route may exist");
  });

  test("the only route this phase adds is the AI policy page", () => {
    /* GS-10 requires the footer's AI-policy link, and `globalFooterConfig` forbids a link with no destination. */
    assert.ok(exists("app/ai-policy/page.tsx"));
    /* `app/news` left this list when the News family shipped under its own approved task (07A/07B, frozen) —
       it is registry-gated and tested in `news-pages.test.ts`, not an invention of the AI phase. `app/community`
       left it the same way: the Community family shipped under 08A/08B/08C (frozen) and the Conflict 41 FOUNDER
       AMENDMENT, registry-gated and tested in `community-pages.test.ts`. `app/tools` left it with the TOOLS
       family: BP-05C (frozen) plus the Conflict 42 interim founder instruction, registry-gated and tested in
       `tools-pages.test.ts`. */
    for (const forbidden of ["app/insider", "app/play", "app/states"]) {
      assert.equal(exists(forbidden), false, `${forbidden} must not have been invented`);
    }
  });

  test("a deterministic surface is not labelled AI, in either direction (FD-DAT-20)", () => {
    /* The answer's label describes PROVENANCE. It neither claims a model nor disclaims one — disclaiming AI raises
       the idea where it does not arise, which is the second half of FD-DAT-20 and the half usually missed. */
    assert.doesNotMatch(ANSWER_LABEL, /\bAI\b/);
    assert.doesNotMatch(ANSWER_LABEL, /not (written|generated) by/i);
    assert.match(ANSWER_LABEL, /Worked out from the results and rules already on this page/);
    /* The archive's year brief is the same case, and its label carried the word AI until DATA-DEC-001. */
    assert.doesNotMatch(code("lib/archive/archiveModel.ts"), /label: "LotteryCorner AI/);
  });
});

/* ══════════════════════════════════════════════════════════════════════ C1 the teaser */

describe("§C1: the FD-DAT-17 violation is gone, and the component is archived not deleted", () => {
  test("no page renders the teaser, and no import of it survives", () => {
    /* FD-GATE-01 archived both legacy templates; the assertion follows them so it still proves the teaser
       is absent from the code that once rendered it. */
    for (const f of ["components/archived/legacy/home/HomeTemplate.tsx",
                     "components/archived/legacy/state/StatePageTemplate.tsx"]) {
      const body = code(f);
      assert.ok(!/<AiToolsTeaser/.test(body), `${f} must not render the teaser`);
      assert.ok(!/from "\.\.\/ai\/AiToolsTeaser"/.test(body), `${f} must not import it`);
    }
    /* The old directory is gone, so the import path cannot resolve even by accident. */
    assert.equal(exists("components/ai/AiToolsTeaser.tsx"), false);
  });

  test("it is ARCHIVED, per CLAUDE.md §6 — not deleted", () => {
    assert.ok(exists("components/archived/AiToolsTeaser.tsx"), "§6: ARCHIVE, do not delete");
    const archived = src("components/archived/AiToolsTeaser.tsx");
    /* Exporting nothing is what stops it coming back by accident: importing it is a type error. */
    assert.ok(!/export default/.test(archived), "the archived component must export nothing");
    assert.match(archived, /ARCHIVED — NOT RENDERED ANYWHERE/);
  });

  test("no 'coming soon' AI promise survives on any of the five families", () => {
    for (const f of [
      "components/archived/legacy/home/HomeTemplate.tsx",
      "components/archived/legacy/state/StatePageTemplate.tsx",
      "components/state/preview/StateAiSurface.tsx", "components/flagship/tools/FlagshipAiConsole.tsx",
      "components/shell/AnswerSurface.tsx", "components/archive/ArchiveView.tsx",
      "components/game/preview/GamePreview.tsx",
    ]) {
      assert.doesNotMatch(code(f), /coming soon/i, `${f} must promise no unbuilt AI capability`);
    }
  });

  test("no AI surface renders a disabled control (FD-ACC-14)", () => {
    /*
     * SCOPED TO THE AI SURFACES, deliberately.
     *
     * The legacy `HomeTemplate` and `StatePageTemplate` still carry pre-existing disabled controls of their own — a
     * state selector and a newsletter field — which are tier-7 reference work and a separate approved cleanup
     * (LRG-STATE-022 already suppresses them on the guarded routes via `shellCapabilities`). Asserting over them
     * here would make this test fail for a reason that has nothing to do with AI, which is how a guard stops being
     * read. What §C1 is about is a disabled AI control, and the teaser's "Sign in to try" button was one.
     */
    for (const f of [
      "components/shell/AnswerSurface.tsx",
      "components/state/preview/StateAiSurface.tsx",
      "components/flagship/tools/FlagshipAiConsole.tsx",
      "app/ai-policy/page.tsx",
    ]) {
      assert.doesNotMatch(code(f), /<button[^>]*\sdisabled/, `${f} must render no disabled control`);
      assert.doesNotMatch(code(f), /aria-disabled=\{?true/, `${f} must not mark a control unavailable in place`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ C2 one identity */

describe("§C2: one AI identity, one answer surface, one disclosure", () => {
  test("only the four Global Shell §10.4 names are used", () => {
    assert.deepEqual([...APPROVED_AI_LABELS].sort(), [
      "AI Quick Take", "Ask AI", "Ask LotteryCorner", "Draw Insight", "LotteryCorner Research Note",
    ].sort());
    /* The shell's GS-06 uses the approved desktop and compact forms and invents no fifth name. */
    const shell = globalShell();
    assert.equal(shell.aiTrigger.label, AI_IDENTITY.askDesktop);
    assert.equal(shell.aiTrigger.compactLabel, AI_IDENTITY.askMobile);
  });

  test("both families render the SAME surface — there is one implementation, not two lookalikes", () => {
    for (const f of [
      "components/state/preview/StateAiSurface.tsx",
      "components/flagship/tools/FlagshipAiConsole.tsx",
    ]) {
      const body = code(f);
      assert.match(body, /<AnswerSurface/, `${f} must render the shared surface`);
      /* And neither keeps a private copy of the parts that moved. */
      assert.ok(!/data-ai-panel/.test(body), `${f} must not own an answer panel`);
      assert.ok(!/aria-live/.test(body), `${f} must not own a live region`);
      assert.ok(!/type="submit"/.test(body), `${f} must not own the ask form`);
    }
  });

  test("the sources disclosure has ONE name, and it carries the date", () => {
    /* The flagship said "Where an answer would come from" even for an answer that existed, and printed the date in
       a separate paragraph outside the disclosure. One name, and both facts in one place. */
    assert.equal(SOURCES_SUMMARY, "Where this came from");
    const surface = code("components/shell/AnswerSurface.tsx");
    assert.match(surface, /\{SOURCES_SUMMARY\}/);
    assert.match(surface, /data-answer-sources="true"/);
    /* The date is INSIDE the disclosure, beside the sources. */
    const block = surface.slice(surface.indexOf("data-answer-sources=\"true\""));
    assert.match(block.slice(0, 900), /formatLastUpdated\(lastUpdatedIso, timezoneLabel\)/);
  });

  test("SL-T03 is one shared string, rendered once per surface", () => {
    assert.match(AI_DISCLOSURE, /never from a prediction/);
    assert.match(AI_DISCLOSURE, /no past result changes the odds of a future drawing/);
    const surface = code("components/shell/AnswerSurface.tsx");
    assert.equal((surface.match(/\{AI_DISCLOSURE\}/g) ?? []).length, 1, "once, not per answer (§45)");
    assert.match(surface, /data-ai-disclosure="SL-T03"/);
  });

  test("the answer surface owns the shared ask anchor, so GS-06 reaches it from the shell", () => {
    const surface = code("components/shell/AnswerSurface.tsx");
    assert.match(surface, /id=\{SHARED_ASK_ANCHOR\}/);
    assert.match(surface, /data-ai-surface="shared"/);
  });

  test("a fuzzy match never answers a different question", () => {
    const qs = [
      { key: "a", label: "When is the next Florida draw?" },
      { key: "b", label: "Explain official Florida claim steps" },
    ];
    assert.equal(matchQuestion("when is the next florida draw", qs)?.key, "a");
    assert.equal(matchQuestion("how do I claim a Florida prize? claim steps official", qs)?.key, "b");
    /* Below the threshold it returns null, so the caller says it cannot answer rather than answering something else. */
    assert.equal(matchQuestion("what are tonight's winning numbers going to be", qs), null);
    assert.equal(matchQuestion("", qs), null);
    assert.match(NO_MATCH_NOTICE, /can only answer the questions above/);
  });
});

/* ══════════════════════════════════════════════════════════════════════ C3 §10.5 coverage */

describe("§C3: every section on all five pages records an intelligence decision (Shell §10.5)", () => {
  test("no governed section is missing from the matrix", () => {
    /* State — every content section in PF-02 §12. Ad anchors and the footer carry no intelligence decision. */
    for (const s of STATE_SECTIONS) {
      if (s.kind !== "content") continue;
      assert.ok(sectionIntelligence("state", s.id), `state ${s.id} has no recorded decision`);
    }
    /* Archive — every AR section in the blueprint sequence. */
    for (const id of AR_ORDER_BLUEPRINT) {
      if (id.startsWith("AD-") || id === "Footer") continue;
      assert.ok(sectionIntelligence("archive", id), `archive ${id} has no recorded decision`);
    }
    /* Flagship — every FG section, including the five merged into a neighbour: a merged section still has content
       and still needs a decision, which is the point of recording the merge rather than dropping the id. */
    for (const id of FLAGSHIP_SECTION_ORDER) {
      if (id.startsWith("AD-")) continue;
      assert.ok(sectionIntelligence("flagship", id), `flagship ${id} has no recorded decision`);
    }
    for (const merged of ["FG-04", "FG-06", "FG-10", "FG-11", "FG-12", "FG-14"]) {
      assert.ok(sectionIntelligence("flagship", merged), `merged flagship ${merged} still needs a decision`);
    }
  });

  test("every section that reaches the DOM emits its decision, in all five families", () => {
    /*
     * ══ WHY THIS IS A SOURCE ASSERTION AND NOT A MATRIX ONE ══
     *
     * The matrix being complete is asserted above. This asserts the other half: that the decision reaches the
     * RENDERED PAGE, because an audit reads HTML, not a TypeScript table. Measured in a running build at 375px
     * before this was wired, the matrix was complete while THREE families emitted no `data-intelligence` at all —
     * §10.5 coverage that existed only where nobody looks.
     *
     * Two mechanisms, one source: `UniversalSection` reads the matrix for a migrated section, and
     * `sectionAuditAttributes` spreads the same lookup onto a family that still builds its own element. So every
     * file that emits `data-section-id` must reach the matrix by one of the two.
     */
    const EMITTERS = [
      "components/shell/SectionChrome.tsx",
      "components/archive/ArchiveView.tsx",
      "components/game/preview/GamePreview.tsx",
      "components/game/preview/sections/GameM2Bands.tsx",
      "components/game/preview/tools/GameWorkspace.tsx",
      "components/flagship/FlagshipGamePage.tsx",
      "components/flagship/sections/FlagshipEcosystem.tsx",
      "components/flagship/sections/FlagshipRules.tsx",
      "components/flagship/tools/FlagshipCheckerSection.tsx",
      "components/flagship/tools/FlagshipExplorerSection.tsx",
      "components/flagship/tools/FlagshipGeneratorSection.tsx",
      "components/flagship/tools/FlagshipJackpotTracker.tsx",
      "components/flagship/tools/FlagshipStatsSection.tsx",
      "components/state/preview/sections/StateUtilitySections.tsx",
    ];
    for (const f of EMITTERS) {
      const body = code(f);
      if (!/data-section-id/.test(body)) continue;
      assert.match(
        body,
        /sectionAuditAttributes\(|intelligenceOf\(/,
        `${f} emits data-section-id but never reaches the intelligence matrix`,
      );
    }
  });

  test("a 'none' decision explains itself — §10.5 asks for a DOCUMENTED decision", () => {
    const nones = SECTION_INTELLIGENCE.filter((e) => e.decision === "none");
    assert.ok(nones.length > 0, "some sections genuinely need no layer, and that is a legitimate answer");
    for (const e of nones) {
      assert.ok(e.why.length > 40, `${e.family} ${e.sectionId}: "none" must state WHY`);
    }
    /* Every entry, not only the `none` ones. */
    for (const e of SECTION_INTELLIGENCE) {
      assert.ok(e.why.length > 20, `${e.family} ${e.sectionId} needs a reason`);
    }
  });

  test("no section claims GENERATIVE intelligence, because no provider is connected", () => {
    /* §C0. Claiming a generative layer that does not run would be the same class of defect as the teaser. */
    for (const e of SECTION_INTELLIGENCE) {
      assert.notEqual(e.decision, "generative", `${e.family} ${e.sectionId} claims a layer that does not exist`);
    }
  });

  test("a missing decision is distinguishable from a decision of 'none'", () => {
    /* Collapsing the two is how coverage silently develops a hole. */
    assert.equal(sectionIntelligence("state", "S-99"), undefined);
    assert.equal(intelligenceOf("state", "S-99"), "none");
    assert.equal(sectionIntelligence("state", "S-11")?.decision, "none");
  });

  test("Explain actions sit on result-bearing sections, and nowhere FD-X-08 forbids", () => {
    /* At most one per panel, and ZERO on the multi-state block and on member rows. */
    const stateExplain = explainActionSections("state");
    assert.deepEqual(stateExplain, ["S-02"], "one result section owns the State page's contextual Explain");
    const panel = code("components/state/preview/sections/StateFamilyPanel.tsx");
    assert.equal((panel.match(/<StateExplainAction/g) ?? []).length, 1, "one AI action per panel");
    const multi = code("components/state/preview/sections/StateMultiStateBlock.tsx");
    assert.equal((multi.match(/<StateExplainAction/g) ?? []).length, 0,
      "the multi-state block carries no AI action of its own (LRG-STATE-039 §4)");
    /* And every family with a result has at least one. */
    for (const family of ["home", "state", "game", "flagship"] as const) {
      assert.ok(explainActionSections(family).length > 0, `${family} needs a contextual entry to its surface`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ C4 deterministic insights */

describe("§C4: AI-D1, AI-D2, AI-D4 and AI-D7 are arithmetic, and say what BP-05C §12 requires", () => {
  test("AI-D1 describes the drawing's shape from the drawn values", () => {
    const fp = drawFingerprint({ values: [12, 29, 37, 43, 55], min: 1, max: 69 })!;
    assert.equal(fp.sum, 176);
    assert.equal(fp.range, 43);
    assert.equal(fp.odd, 4);
    assert.equal(fp.even, 1);
    assert.equal(fp.longestConsecutiveRun, 1);
    assert.match(fp.description, /add up to 176/);
    /* A consecutive run is counted, not guessed. */
    assert.equal(drawFingerprint({ values: [4, 5, 6, 20, 41], min: 1, max: 69 })!.longestConsecutiveRun, 3);
    /* An EMPTY drawing yields null, not a fingerprint of zeroes: California's Mega Millions feed record carries no
       numbers, and "they add up to 0" would be a false statement about that drawing. */
    assert.equal(drawFingerprint({ values: [], min: 1, max: 69 }), null);
  });

  test("AI-D2 states relationships and implies no probability", () => {
    const rel = previousDrawRelationship(
      { values: [12, 29, 37, 43, 55], min: 1, max: 69, special: [18] },
      { values: [12, 30, 37, 60, 61], min: 1, max: 69, special: [18] },
    )!;
    assert.deepEqual([...rel.repeated], [12, 37]);
    assert.equal(rel.specialRepeated, true);
    assert.ok(rel.neighbouring.includes(29), "29 is next to the previous 30");
    /* §13: "no probability implication". The sentence must not characterise a repeat as unusual or meaningful. */
    for (const re of [/unusual/i, /rare/i, /likely/i, /due\b/i, /signal/i, /trend/i, /streak/i]) {
      assert.doesNotMatch(rel.description, re);
    }
  });

  test("AI-D4 always carries the SCALE, and the overdue myth explanation", () => {
    /*
     * THE DEFECT THIS CLOSES. A bare "has not appeared for 41 drawings" is a figure a reader cannot judge, so they
     * supply the interpretation themselves — and it is "so it is due". §13 lists the median and the longest
     * alongside the current gap for exactly this reason.
     */
    const draws = Array.from({ length: 20 }, (_, i) => ({ values: i % 4 === 0 ? [7, 11] : [3, 19] }));
    const g = gapContext(7, draws);
    assert.equal(g.currentGap, 0);
    assert.equal(g.appearances, 5);
    assert.equal(g.medianGap, 3);
    assert.equal(g.longestGap, 3);
    /* The scale is in the SAME sentence as the figure. */
    assert.match(g.description, /typical gap of 3 drawings and a longest gap of 3/);

    /* A value never drawn says so, and claims no gap. */
    const never = gapContext(99, draws);
    assert.equal(never.currentGap, null);
    assert.match(never.description, /has not been drawn in the 20 drawings on this page/);

    /* One appearance cannot describe a typical gap, and does not pretend to. */
    const once = gapContext(5, [{ values: [5] }, { values: [1] }, { values: [2] }]);
    assert.equal(once.medianGap, null);
    assert.match(once.description, /not enough to describe a typical gap/);

    /* The myth explanation is required, and it is unambiguous. */
    assert.match(GAP_MYTH_EXPLANATION, /no such thing as a number being due/);
    assert.match(GAP_MYTH_EXPLANATION, /Each drawing is independent/);
  });

  test("no identifier in the insight modules is named after the myth", () => {
    /* `digitHistoryAnalysis.ts` established that a FIELD NAME is copy: it survives into JSON, into a future API and
       into whatever renders it next. A metric called `overdue` eventually reaches a reader. */
    const body = code("lib/ai/drawInsights.ts");
    for (const re of [/\boverdue\s*[:?]/i, /\bisDue\b/i, /\bhotNumbers?\b/i, /\bcoldNumbers?\b/i]) {
      assert.doesNotMatch(body, re, `a field named ${re} would leak the framing`);
    }
  });

  test("AI-D7 explains how an add-on is OBTAINED, and states no prize figure", () => {
    const powerPlay = addOnExplanation({
      label: "Power Play", mode: "independentlySelected", values: [2, 3, 4, 5, 10],
      exception: "California does not offer Power Play.",
    })!;
    assert.match(powerPlay.howObtained, /separate option you add when you buy/);
    assert.match(powerPlay.effect, /2× to 10×/);
    assert.equal(powerPlay.exception, "California does not offer Power Play.");

    /* Mega Millions: assigned per play, nothing to add. That is the distinction a reader needs and the one both
       pages previously left to a one-line note. */
    const built = addOnExplanation({ label: "Megaplier", mode: "builtIn", values: [2, 3, 4, 5, 10] })!;
    assert.match(built.howObtained, /assigned to each play automatically/);
    assert.match(built.howObtained, /nothing extra to pay/);

    /* Double Play is a SEPARATE DRAWING, not a second chance at the jackpot. */
    const dp = addOnExplanation({ label: "Double Play", mode: "separateDrawing" })!;
    assert.match(dp.effect, /not a second chance at the main jackpot/);

    /* Fireball REPLACES a drawn number and is not a fourth one — the exact misreading the archive fixed visually. */
    const fb = addOnExplanation({ label: "Fireball", mode: "replacesAValue" })!;
    assert.match(fb.effect, /REPLACES one of the drawn numbers/);
    assert.match(fb.effect, /not an extra winning number/);

    /* NO PRIZE AMOUNT anywhere: neither flagship matrix is captured (Conflict 30), so a figure would be invented. */
    for (const e of [powerPlay, built, dp, fb]) {
      assert.doesNotMatch(`${e.howObtained} ${e.effect}`, /\$[\d,]/, "no money figure may be stated");
    }
    assert.equal(addOnExplanation({ label: "None", mode: "none" }), null);
  });
});

/* ══════════════════════════════════════════════════════════════════════ C4 the extended scanner */

describe("§C4: the prediction-claim scanner runs over ALL FIVE families' copy", () => {
  /*
   * The flagship had a scanner over its own strings. It is extended here to every family's reader-facing copy,
   * because a prediction claim is equally harmful wherever it appears — and the archive, with roughly 8,700 URLs,
   * is the largest surface of the five.
   */
  /*
   * ══ A CLAIM, NOT A WORD ══
   *
   * The first version of this scanner forbade `/\bpredicts?\b/` outright, and it immediately failed on approved
   * copy the archive has shipped for weeks: *"These figures describe the drawings listed on this page. They do not
   * predict a future result."* That sentence is the guardrail, and a scanner that cannot tell a REFUTATION from a
   * CLAIM forces the copy to become vaguer in order to pass — which makes the page worse and the test useless.
   *
   * So the forbidden terms are checked SENTENCE BY SENTENCE, and a sentence carrying a negation near the term is
   * allowed. BP-05C §13 states the rule in exactly this shape: the required language is *"This draw resembles these
   * historical draws structurally"* and the forbidden language is *"These draws predict what comes next"* — the same
   * verb, and the difference is the claim.
   */
  const NEGATION = /\b(not|never|cannot|can'?t|no|nothing|neither|nor|without|does not|do not|is not|are not)\b/i;

  /** Terms that are a claim unless the sentence negates them. */
  const FORBIDDEN_UNLESS_NEGATED: readonly RegExp[] = Object.freeze([
    /\bpredicts?\b/i,
    /\bprediction\b/i,
    /\bdue\b/i,
    /\boverdue\b/i,
    /\bhot numbers?\b/i,
    /\bcold numbers?\b/i,
    /increase (your |the )?(odds|chances)/i,
    /better (odds|chances)/i,
    /improve your (odds|chances)/i,
    /\bguaranteed\b/i,
    /most likely next/i,
    /best numbers/i,
    /*
     * "will be drawn" is the archive's own guardrail sentence — *"says nothing about which values will be drawn
     * next"* — and it is the clearest illustration of why this list is split. As a claim it is the worst phrase on
     * the page; as a refutation it is the most important one.
     */
    /will be drawn/i,
  ]);

  /** Terms that are forbidden OUTRIGHT — no sentence can make them acceptable. */
  const FORBIDDEN_ALWAYS: readonly RegExp[] = Object.freeze([
    /smart pick/i,
    /hurry\b/i,
    /last chance/i,
    /don'?t miss/i,
    /act now/i,
    /\bsure thing\b/i,
    /can'?t lose/i,
    /* BP-05C §13's own "never" example, verbatim. */
    /predict what comes next/i,
  ]);

  /** Split into sentences so a negation in one cannot excuse a claim in the next. */
  const sentences = (body: string): string[] =>
    body.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);

  /** The copy modules and page compositions a reader's words actually come from. */
  const COPY_SOURCES: readonly string[] = Object.freeze([
    "lib/ai/answerSurface.ts",
    "lib/ai/drawInsights.ts",
    /*
     * `lib/ai/sectionIntelligence.ts` is deliberately ABSENT from this list.
     *
     * Its `why` strings are the §10.5 matrix's own internal rationale — read by a founder reviewing coverage and by
     * this test file, never rendered to a reader. Several of them necessarily REFUTE the forbidden framing ("states
     * that it does not predict a future result"), and a scanner that cannot tell a refutation from a claim would
     * force the documentation to become vaguer in order to pass. The `data-intelligence` attribute it drives is a
     * one-word enum and carries no prose.
     */
    "lib/text/jackpotDelta.ts",
    "lib/time/nextDraw.ts",
    "lib/state/weeklyDrawSchedule.ts",
    "components/shell/AnswerSurface.tsx",
    "components/shell/SectionChrome.tsx",
    "components/shell/NextDrawRelative.tsx",
    "components/shell/ResultExitRamps.tsx",
    "components/state/preview/StateAiSurface.tsx",
    "components/state/preview/sections/StateDraftSections.tsx",
    "components/game/preview/GamePreview.tsx",
    "components/archive/ArchiveView.tsx",
    "components/flagship/FlagshipGamePage.tsx",
    "components/flagship/tools/FlagshipAiConsole.tsx",
    "app/ai-policy/page.tsx",
    "lib/archive/archiveModel.ts",
  ]);

  test("no forbidden phrase appears in any family's reader-facing copy", () => {
    for (const f of COPY_SOURCES) {
      /*
       * COMMENTS ARE STRIPPED, deliberately. Several of these files DOCUMENT the rule, and a comment explaining why
       * "overdue" is forbidden must be allowed to contain the word. Rendered strings are what a reader sees.
       */
      const body = code(f);

      for (const re of FORBIDDEN_ALWAYS) {
        assert.doesNotMatch(body, re, `${f} contains prohibited language matching ${re}`);
      }

      for (const sentence of sentences(body)) {
        for (const re of FORBIDDEN_UNLESS_NEGATED) {
          if (!re.test(sentence)) continue;
          assert.ok(
            NEGATION.test(sentence),
            `${f}: "${sentence.trim().slice(0, 160)}" uses ${re} as a CLAIM rather than a refutation`,
          );
        }
      }
    }
  });

  test("the scanner itself distinguishes a claim from a refutation", () => {
    /*
     * A guard nobody has tested is a guard nobody should trust, so the scanner is exercised on both cases. Without
     * this, tightening the regex later could quietly turn it into a pass-everything check.
     */
    const claim = "These draws predict what comes next.";
    const refutation = "They do not predict a future result.";
    assert.ok(FORBIDDEN_ALWAYS.some((re) => re.test(claim)), "the §13 forbidden example must be caught outright");
    assert.ok(FORBIDDEN_UNLESS_NEGATED.some((re) => re.test(refutation)), "the term is present");
    assert.ok(NEGATION.test(refutation), "and the negation makes it a refutation");
    assert.ok(!NEGATION.test(claim), "while the claim carries no negation");
  });

  test("the AI policy page names the myths in order to refute them, and claims nothing", () => {
    /* This page is the ONE place the words may appear in visible copy, because it is denying them. */
    const page = code("app/ai-policy/page.tsx");
    assert.match(page, /does not tell you that any number is due, hot, cold or overdue/);
    assert.match(page, /does not predict winning numbers/);
    /* And it promises no capability: no provider, no date, no accuracy figure. */
    for (const re of [/\bsoon\b/i, /\bcoming\b/i, /\d+% accurate/i, /GPT|Claude|Gemini/i]) {
      assert.doesNotMatch(page, re, `the policy page must not promise or name ${re}`);
    }
  });

  test("the claim taxonomy is used, not paraphrased", () => {
    /* Constitution §7 requires the seven claim types to be distinguished EXPLICITLY. The archive's year brief
       labels its observations with the taxonomy's own words rather than inventing a synonym. */
    assert.equal(CLAIM_LABEL.historicalObservation, "Statistically true historical observation");
    assert.match(code("lib/archive/archiveModel.ts"), /CLAIM_LABEL\.historicalObservation/);
    assert.match(OBSERVATION_BOUNDARY, /describe drawings that have already happened/);
  });
});

/* ══════════════════════════════════════════════════════════════════════ C5 the archive brief */

describe("§C5: the year brief answers the two questions a year of results provokes", () => {
  test("most-drawn and longest-gap points are computed over the page's own rows", () => {
    const model = code("lib/archive/archiveModel.ts");
    /* Counted from the rows the page lists, and linked to the statistics section a reader can check. */
    assert.match(model, /was drawn most often in this archive/);
    assert.match(model, /gapContext\(v, newestFirst\)/);
    assert.match(model, /GAP_MYTH_EXPLANATION/);
    /* Evidence links point at real on-page anchors, so every claim is checkable. */
    assert.match(model, /evidenceHref: "#ar-07"/);
  });

  test("a TIE is described as a tie, never as a distinction", () => {
    /* The same correction the month point already carries: presenting a five-way tie as "most drawn" is true of one
       value and misleading about the year, and a small archive year ties constantly. */
    const model = code("lib/archive/archiveModel.ts");
    assert.match(model, /atTop\.length === 1/);
    assert.match(model, /values share the highest count in this archive/);
  });

  test("every enriched point is labelled with the claim type", () => {
    const model = code("lib/archive/archiveModel.ts");
    const from = model.indexOf("was drawn most often");
    assert.ok(from > 0, "the most-drawn point must exist");
    /* Bounded by the next point's own code rather than by a comment, which `code()` has already stripped. */
    const to = model.indexOf("notable[0]", from);
    assert.ok(to > from, "the notable-draw point must follow it");
    const briefBlock = model.slice(from, to);
    assert.ok((briefBlock.match(/CLAIM_LABEL\.historicalObservation/g) ?? []).length >= 2,
      "both enriched points carry the taxonomy label");
  });
});

/* ══════════════════════════════════════════════════════════════════════ C6 the policy page */

describe("§C6: the AI policy page exists and GS-10's footer link resolves", () => {
  test("the footer link is a real destination, never a placeholder", () => {
    const cfg = src("lib/layout/globalFooterConfig.ts");
    assert.match(cfg, /\{ label: "AI policy", href: "\/ai-policy", kind: "newRoute" \}/);
    assert.ok(exists("app/ai-policy/page.tsx"));
  });

  test("it has one title, one description and a self-referencing canonical", () => {
    const page = src("app/ai-policy/page.tsx");
    assert.match(page, /informationPageMetadata\(\{/);
    assert.match(page, /const PATH = "\/ai-policy";/);
    /* It uses the shared information-page template, so it inherits the shell, the breadcrumb and the footer. */
    assert.match(page, /<InformationPage/);
  });

  test("it covers what §C6 requires: what it does, never does, the glossary and the correction route", () => {
    const page = src("app/ai-policy/page.tsx");
    for (const heading of ["What it does", "What it never does", "What the labels mean", "If something looks wrong"]) {
      assert.ok(page.includes(heading), `the policy must cover "${heading}"`);
    }
    /* The glossary is the Constitution's own taxonomy, all seven types. */
    for (const label of [
      "Verified fact", "Statistically true historical observation", "Historical coincidence",
      "LotteryCorner analysis", "Community belief", "Entertainment tool", "Unsupported prediction",
    ]) {
      assert.ok(page.includes(label), `the labelling glossary must define "${label}"`);
    }
    assert.match(page, /\/corrections-policy/);
  });
});

/* ══════════════════════════════════════════════════════════════════════ C7 the chips audit */

describe("§C7: every Ask surface leads with questions, and none is attributed to a member", () => {
  test("3-5 chips lead, and blank-box-first is nowhere", () => {
    assert.equal(LEAD_QUESTIONS_MIN, 3);
    assert.equal(LEAD_QUESTIONS_MAX, 5);
    const surface = code("components/shell/AnswerSurface.tsx");
    /* The chip row is unconditional — it is not behind a disclosure and not behind the input. */
    assert.match(surface, /aria-label="Suggested questions"/);
    assert.match(surface, /data-lead-count=\{lead\.length\}/);
    /* The empty panel tells the reader to CHOOSE a question rather than presenting a blank box as the entry. */
    assert.match(CHOOSE_PROMPT, /^Choose a question/);
    /* State declares four (its labels are the longest); the flagship takes the default five. */
    assert.match(code("components/state/preview/StateAiSurface.tsx"), /leadCount=\{4\}/);
    assert.ok(!/leadCount=/.test(code("components/flagship/tools/FlagshipAiConsole.tsx")));
  });

  test("the State page really does supply 3-5 lead questions from 7", () => {
    /* Nothing is dropped: the remaining questions stay in the server HTML behind a `<details>`, so they are
       findable by in-page search and by a crawler. */
    const wrapper = code("components/state/preview/StateAiSurface.tsx");
    const keys = [...wrapper.matchAll(/key: "([a-z-]+)"/g)].map((m) => m[1]);
    assert.equal(keys.length, 7, "all seven FD-X-08 experiences survive");
    assert.ok(new Set(keys).size === keys.length, "no duplicate question key");
    assert.match(code("components/shell/AnswerSurface.tsx"), /<summary>More questions<\/summary>/);
  });

  test("no chip implies a member asked it (SL-I11), and no activity is fabricated", () => {
    for (const f of [
      "components/shell/AnswerSurface.tsx",
      "components/state/preview/StateAiSurface.tsx",
      "components/flagship/tools/FlagshipAiConsole.tsx",
      "lib/flagship/flagshipAi.ts",
    ]) {
      const body = code(f);
      for (const re of [
        /asked by/i, /players? asked/i, /people also ask/i, /\d+ (people|players|members)/i,
        /trending question/i, /popular question/i, /most asked/i,
      ]) {
        assert.doesNotMatch(body, re, `${f} must not attribute a question to anyone`);
      }
    }
    /* And the accessible name says whose suggestions they are: ours. */
    assert.match(code("components/shell/AnswerSurface.tsx"), /aria-label="Suggested questions"/);
  });
});
