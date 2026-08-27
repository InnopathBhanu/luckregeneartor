/*
 * THE AI SURFACE DEFINITIONS — LRG-FLAGSHIP-002, section FG-03 and the contextual entries elsewhere.
 *
 * Authority: BP-04A §17 (what the Game AI may do), §46 (*"no prediction claim"*), BP-05C §12 (*"AI does not
 * invent lottery predictions"* — it explains deterministic output, routes tools and summarises real sources),
 * BP-05C §13–15 (the insight catalog), the frozen Constitution (AI is contextual, clearly labelled and
 * supportive; a single floating chat button is not an AI strategy), `DATA-DEC-001` `FD-DAT-02`.
 *
 * ══ WHAT IS ACTUALLY SHIPPED, STATED PLAINLY ══
 *
 * There is no AI provider, no model, no prompt endpoint and no Account to charge an invocation to. `FD-DAT-02`
 * gates AI EXECUTION behind a free Account; `FD-DAT-17` forbids a fake login. So this page ships:
 *
 *   1. **The UI contract** — contextual prompt chips attached to the sections they belong to, each declaring the
 *      sources an answer would be restricted to and the boundary it must respect. The founder reviews the
 *      guardrails as part of the interaction, not as documentation.
 *
 *   2. **Deterministic answers where the page already holds the facts.** `Explain this drawing`, `Explain the
 *      real odds`, `What does the multiplier mean` and `What should I check on my ticket` are answered from this
 *      page's own governed data — arithmetic and transcribed operator text, computed at render, with no model,
 *      no prompt, no tokens and no cost. `FD-DAT-20` settles that such a summary is **not** an AI execution and
 *      is therefore public; it also forbids calling it AI. Those answers are labelled as computed, not as AI.
 *
 *   3. **An honest unavailable state everywhere else.** A question whose facts the page does not hold returns the
 *      gap, never invented prose. Fabricating an answer would make a founder review of the AI experience
 *      worthless and would be exactly the fabrication the Constitution forbids.
 *
 * ══ THE PREDICTION GUARD IS CODE, NOT A PROMISE ══
 *
 * `containsPredictionClaim` is a real scanner, run over every string this module and the page copy produce, in
 * the test suite. A future contributor cannot quietly add "these numbers are due" without a test failing.
 */

import type { AiSurface, FlagshipSectionId } from "./flagshipContract";
import type { FlagshipGameConfig } from "./flagshipGames";
import { isGap } from "./flagshipGames";
import { jackpotOdds, oddsMethod } from "./flagshipOdds";
import { drawInsights, type DrawShape } from "./flagshipInsights";
import { previewCountNote, type FlagshipDisplayMode } from "./flagshipDisplay";

/* ------------------------------------------------------------------ the prediction guard */

/**
 * Phrasings that assert a prediction, an improved chance, or a guaranteed outcome.
 *
 * Deliberately narrow and affirmative. The page MUST be able to say *"no system can predict winning numbers"* and
 * *"there is no such thing as an overdue number"* — those are the corrections the Constitution requires — so the
 * scanner works sentence by sentence and clears any sentence carrying a negation.
 */
const PREDICTION_PATTERNS: readonly RegExp[] = Object.freeze([
  /\bpredicts?\b/i,
  /\bprediction\b/i,
  /\bguarantee/i,
  /\bincreases? your chances?\b/i,
  /\bimproves? your (odds|chances?)\b/i,
  /\bbetter odds\b/i,
  /\bdue to (hit|come up|be drawn)\b/i,
  /\bis overdue\b/i,
  /\bare overdue\b/i,
  /\bmore likely to be drawn\b/i,
  /\bwill be drawn\b/i,
  /\bcertain to win\b/i,
  /\bsure thing\b/i,
  /\bcan't lose\b/i,
]);

const NEGATORS = /\b(no|not|never|nothing|none|cannot|can't|does not|doesn't|do not|don't|is not|isn't|are not|aren't|without|neither|nor|forbid|refuse)\b/i;

/**
 * The first prediction claim in a piece of copy, or `null` when it is clean.
 *
 * Splits on sentence boundaries so a negated correction — *"No system can predict winning numbers"* — is cleared
 * while an affirmative claim in the next sentence is still caught.
 */
export function containsPredictionClaim(text: string): string | null {
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    if (NEGATORS.test(sentence)) continue;
    for (const pattern of PREDICTION_PATTERNS) {
      const match = sentence.match(pattern);
      if (match) return `${match[0]} — in: "${sentence.trim()}"`;
    }
  }
  return null;
}

/** Throw on the first prediction claim. Used as a build/test guard over generated copy. */
export function assertNoPredictionClaim(label: string, text: string): void {
  const found = containsPredictionClaim(text);
  if (found) throw new Error(`Prediction claim in ${label}: ${found}`);
}

/* ------------------------------------------------------------------ labels */

/**
 * How a computed answer is labelled.
 *
 * `FD-DAT-20` is explicit in both directions: claiming AI would misdescribe a calculation, and disclaiming AI
 * raises the idea in a surface where it does not arise. So a computed answer states its provenance positively and
 * says nothing about AI at all.
 */
export const COMPUTED_ANSWER_LABEL = "Counted from the drawing and the game rules shown on this page.";

/** How the not-connected state is labelled where a real model would be required. */
export const AI_NOT_CONNECTED_LABEL =
  "No AI model is connected to this build, so nothing is generated. What you see below is only what this page " +
  "can already work out for itself.";

/** The standing boundary for the whole AI surface, stated once. */
export const AI_SURFACE_BOUNDARY =
  "LotteryCorner AI explains results, rules and tools. It does not work out whether a ticket won — a deterministic " +
  "check does that — and it does not forecast drawings. No system can predict winning numbers, and nothing on this " +
  "page changes the odds of a fair independent drawing.";

/* ------------------------------------------------------------------ inputs */

export interface AiAnswerInputs {
  config: FlagshipGameConfig;
  /** The drawn shape, when a result is published. `null` when none is held. */
  draw: DrawShape | null;
  drawDateDisplay: string | null;
  nextDrawDateDisplay: string | null;
  jackpotDisplay: string | null;
  nextJackpotDisplay: string | null;
  /** Whether a tagged content system is connected. Governs the two content questions. */
  contentConnected: boolean;
  /**
   * The tagged items actually on the page — FGP-009.
   *
   * The two content questions used to answer only in the negative, because nothing was connected. They can now
   * answer positively, and the answer is a LISTING of what the rails hold rather than a written summary: it
   * names the items and their provenance, and it never characterises a discussion nobody has read.
   */
  contentItems: {
    news: readonly { title: string; publishedIso: string; provenance: string }[];
    forum: readonly { title: string; replyCount?: number; provenance: string }[];
  };
  /**
   * The drawing immediately before the latest one, from the connected series.
   *
   * This is what makes *"What changed since the last drawing?"* answerable at all — it is a comparison of two
   * real records, not a narrative. `null` when the series holds fewer than two drawings.
   */
  previous: { dateIso: string; main: readonly number[]; special: number | null } | null;
  /** How many drawings the connected series holds, and how many are real. */
  history: { total: number; productionFeed: number } | null;
  /** Which labelling register the answers are written in. See `flagshipDisplay.ts`. */
  displayMode: FlagshipDisplayMode;
}

/* ------------------------------------------------------------------ the surfaces */

/**
 * Every AI entry point on the page, attached to the section it belongs to.
 *
 * The Constitution requires AI entry points to be *relevant to the surface*, which is why `section` is a required
 * field: the renderer places each chip in its own section, and the shared answer panel in FG-03 is the single
 * place an answer appears. That is one labelled, grounded, announced region — not a chatbot per section, and not
 * one floating button.
 */
export function aiSurfaces(inputs: AiAnswerInputs): AiSurface[] {
  const { config: cfg, draw } = inputs;
  const multiplierName = cfg.multiplier.mode === "none" ? "multiplier" : cfg.multiplier.label;

  const surfaces: AiSurface[] = [
    {
      key: "explain-draw",
      label: "Explain this drawing",
      section: "FG-01",
      grounding: ["The published drawing on this page", "The governed result-format definitions"],
      boundary:
        "Describes the drawing that happened. It cannot tell you whether your ticket won, and it says nothing " +
        "about what any future drawing will do.",
      deterministicAnswer: explainDraw(inputs),
    },
    {
      key: "explain-multiplier",
      label: `What does ${multiplierName} mean?`,
      section: "FG-01",
      grounding: [`${cfg.gameLabel} operator game rules`],
      boundary:
        "Explains how the multiplier is obtained and what it applies to. It cannot tell you what a prize is worth " +
        "— the prize table is not captured in this build.",
      deterministicAnswer: explainMultiplier(cfg),
    },
    {
      key: "jackpot-won",
      label: "Did anyone win the jackpot?",
      section: "FG-01",
      grounding: ["The advertised jackpot figures carried by the production results feed"],
      boundary:
        "Winner information is a published fact about real people. It is reported only from a source, never " +
        "inferred and never guessed.",
      deterministicAnswer: jackpotWon(inputs),
    },
    {
      key: "check-ticket",
      label: "Check my ticket",
      section: "FG-02",
      grounding: [`${cfg.gameLabel} operator game rules`, "The governed result-format definitions"],
      boundary:
        "A checklist of what to compare. Only the lottery that sold the ticket can validate it, and only the " +
        "official result is final.",
      deterministicAnswer: checkTicketGuide(cfg),
    },
    {
      key: "explain-odds",
      label: "Explain the real odds",
      section: "FG-05",
      grounding: ["The published number matrix", "Counting, shown in full beside the table"],
      boundary:
        "The odds are counted from the number matrix. They describe every drawing equally and are not changed by " +
        "anything you or anyone else does.",
      deterministicAnswer: explainOdds(cfg),
    },
    {
      key: "explain-rule-era",
      label: `Have the ${cfg.gameLabel} rules changed?`,
      section: "FG-05",
      grounding: [`${cfg.gameLabel} operator game rules`, "The governed rule-era records"],
      boundary:
        "Describes which rules were in force when. Statistics that mix two rule eras are not comparable, and this " +
        "says so rather than blending them.",
      deterministicAnswer: explainRuleEras(cfg),
    },
    {
      key: "what-changed",
      label: "What changed since the last drawing?",
      section: "FG-01",
      grounding: ["The two most recent drawings in the connected series"],
      boundary:
        "Compares two published drawings. It cannot suggest what may be drawn next — past results do not change " +
        "the odds of a future drawing.",
      deterministicAnswer: whatChanged(inputs),
    },
    {
      key: "summarise-history",
      label: "Summarise recent history",
      section: "FG-01",
      grounding: ["The connected drawing series", "The rule era it covers"],
      boundary:
        "Describes the drawings held here — how many, over what period, and how many are real published results. " +
        "It draws no conclusion about future drawings from them.",
      deterministicAnswer: summariseHistory(inputs),
    },
    {
      key: "summarise-matches",
      label: "Summarise the drawings I am looking at",
      section: "FG-08",
      grounding: ["The drawings currently matching your filters", "The filters you applied"],
      boundary:
        "Describes the set you selected — how many matched, over what period, and how many are real published " +
        "drawings. It draws no conclusion about future drawings from them.",
      /* Answered from the live filter state the explorer hands over at the moment you ask. */
      deterministicAnswer: null,
    },
    {
      key: "explain-jackpot-movement",
      label: "Explain the jackpot and how cash compares with annuity",
      section: "FG-09",
      grounding: ["The advertised amounts carried by the production results feed"],
      boundary:
        "Explains what the advertised figures mean. It cannot value a cash option — no cash value is published in " +
        "this build — and it is not financial advice.",
      deterministicAnswer: explainJackpot(inputs),
    },
    {
      key: "explain-stats-view",
      label: "Explain what this analysis shows",
      section: "FG-07B",
      grounding: ["The Stats Lab method statement", "The drawing period the view covers"],
      boundary:
        "Reads a view you selected. It never presents an observation about past drawings as a reason to choose a " +
        "number.",
      /* Answered from the view the reader has open, handed over at the moment they ask. */
      deterministicAnswer: null,
    },
    {
      key: "tax-and-annuity",
      label: "What would a jackpot actually be worth?",
      section: "FG-05",
      grounding: ["Standalone tax and annuity calculators"],
      boundary:
        "Routes the question to a deterministic calculator rather than answering it. BP-05C §20 requires a tax " +
        "year, filing status and residency assumptions before any figure is produced, and it is not tax advice.",
      deterministicAnswer: null,
    },
    {
      key: "summarise-news",
      label: `Summarise recent ${cfg.gameLabel} news`,
      section: "FG-12",
      grounding: [`LotteryCorner editorial tagged ${cfg.contentTag}`],
      boundary:
        "Summarises published articles. It cannot report an event that has not been published, and it never " +
        "writes a story of its own.",
      deterministicAnswer: listNews(inputs),
    },
    {
      key: "community-pulse",
      label: "What are people discussing?",
      section: "FG-13",
      grounding: [`LotteryCorner community entries tagged ${cfg.contentTag}`],
      boundary:
        "Summarises what real members have posted, including where they disagree. It never invents a member, a " +
        "post or a consensus.",
      deterministicAnswer: listDiscussions(inputs),
    },
  ];

  /* ---- game-specific entries, BP-04A §17 ---- */
  if (cfg.gameSlug === "powerball") {
    surfaces.push({
      key: "us-uk",
      label: "How is UK Powerball different?",
      section: "FG-10",
      grounding: ["BP-04A §1 — the approved Powerball offering model"],
      boundary:
        "Compares two offerings of the same game. It cannot quote a current UK advertised value, because none is " +
        "captured here.",
      deterministicAnswer: [
        "Powerball expanded to the United Kingdom in July 2026. Only the jackpot is shared.",
        "Lower-tier prize structures and administration stay separate, and the two use different official " +
          "advertised prize conventions — so a U.S. figure and a UK figure are not directly comparable amounts.",
        "No current UK advertised value is held in this build, so none is shown.",
      ],
    });
  } else {
    surfaces.push({
      key: "ticket-multiplier",
      label: "Where do I find my multiplier?",
      section: "FG-06",
      grounding: ["Mega Millions operator game rules"],
      boundary:
        "Explains where the multiplier lives. It cannot look up a value for a drawing, because there is no " +
        "drawing-level multiplier to look up.",
      deterministicAnswer: [
        "The multiplier is assigned to each play when the ticket is bought, so it is printed on your ticket.",
        "There is no drawing-level multiplier for the current Mega Millions format — which is why no multiplier " +
          "appears beside the winning numbers above.",
        "Two tickets matching the same numbers can be worth different amounts, because they can carry different " +
          "multipliers.",
      ],
    });
  }

  return surfaces;
}

/** The AI entries belonging to one section, in declared order. */
/**
 * The order the console shows them in.
 *
 * The founder's revision names six chips for the quick-actions module. They lead, in that order; every other
 * entry follows and stays reachable under "More questions". Ordering here rather than in the component keeps the
 * lead set reviewable as data.
 */
const LEAD_ORDER = [
  "explain-draw",
  "check-ticket",
  "summarise-history",
  "explain-jackpot-movement",
  "explain-odds",
  "community-pulse",
] as const;

export function orderedAiSurfaces(surfaces: readonly AiSurface[]): AiSurface[] {
  const rank = new Map<string, number>(LEAD_ORDER.map((k, i) => [k, i]));
  return [...surfaces].sort(
    (a, b) => (rank.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.key) ?? Number.MAX_SAFE_INTEGER),
  );
}

export function aiSurfacesFor(surfaces: readonly AiSurface[], section: FlagshipSectionId): AiSurface[] {
  return surfaces.filter((s) => s.section === section);
}

/* ------------------------------------------------------------------ deterministic answers */

function explainDraw(inputs: AiAnswerInputs): string[] | null {
  const { draw, drawDateDisplay, config: cfg } = inputs;
  if (!draw || draw.main.length === 0 || !drawDateDisplay) return null;
  const insights = drawInsights(draw);
  const by = new Map(insights.map((i) => [i.key, i]));
  const lines = [
    `The ${cfg.gameLabel} drawing on ${drawDateDisplay} produced ${draw.main.join(", ")}` +
      (draw.special !== null && draw.specialLabel ? `, with a ${draw.specialLabel} of ${draw.special}.` : "."),
  ];
  const sum = by.get("sum");
  const oddEven = by.get("odd-even");
  const highLow = by.get("high-low");
  if (sum && oddEven && highLow) {
    lines.push(
      `The five main numbers add up to ${sum.value}, split ${oddEven.value} and ${highLow.value}.`,
    );
  }
  const consecutive = by.get("consecutive");
  if (consecutive) {
    lines.push(
      consecutive.value === "None"
        ? "No two of them were next to each other."
        : `Two or more of them were next to each other: ${consecutive.value}.`,
    );
  }
  lines.push(
    "All of that describes this drawing only. Each drawing is independent, so none of it tells you anything about " +
      "the next one.",
  );
  return lines;
}

function explainMultiplier(cfg: FlagshipGameConfig): string[] | null {
  if (cfg.multiplier.mode === "none") return null;
  const lines = [cfg.multiplier.conditionNote.value];
  lines.push(
    cfg.multiplier.mode === "independentlySelected"
      ? `${cfg.multiplier.label} is bought separately, so a ticket without it is not affected by the value drawn.`
      : `Because it is built in, there is nothing to add and nothing to opt out of.`,
  );
  const prizeGap = cfg.gaps.find((g) => g.what.includes("prize amounts"));
  if (prizeGap) lines.push(`What a multiplied prize is actually worth is not shown here. ${prizeGap.why}`);
  return lines;
}

function jackpotWon(inputs: AiAnswerInputs): string[] | null {
  const { jackpotDisplay, nextJackpotDisplay, drawDateDisplay, nextDrawDateDisplay, config: cfg } = inputs;
  const lines = [
    `This build holds no winner information for any ${cfg.gameLabel} drawing, so it cannot tell you whether the ` +
      "jackpot was won. Nothing has been inferred to cover that.",
  ];
  if (jackpotDisplay && nextJackpotDisplay && drawDateDisplay && nextDrawDateDisplay) {
    lines.push(
      `The only related figures held here are the advertised amounts: ${jackpotDisplay} for the ` +
        `${drawDateDisplay} drawing, and ${nextJackpotDisplay} advertised for ${nextDrawDateDisplay}.`,
    );
  }
  lines.push("Winner announcements come from the lottery that sold the ticket.");
  return lines;
}

function checkTicketGuide(cfg: FlagshipGameConfig): string[] {
  const main = cfg.groups.find((g) => g.role === "main");
  const special = cfg.groups.find((g) => g.role === "special");
  const lines: string[] = [];
  if (main && special) {
    lines.push(
      `Compare your ${main.count} main numbers with the ${main.count} drawn — order does not matter — and then ` +
        `check your ${special.label} separately. The ${special.label} comes from its own pool, so it can repeat ` +
        "a main number.",
    );
  }
  if (cfg.multiplier.mode === "independentlySelected") {
    lines.push(
      `Check whether your ticket carries ${cfg.multiplier.label}. If it does not, the multiplier drawn does not ` +
        "apply to your prize.",
    );
  } else if (cfg.multiplier.mode === "builtIn") {
    lines.push(
      `Read the multiplier printed on your own ticket. It is assigned per play, so it is not something to look up ` +
        "against the drawing.",
    );
  }
  if (cfg.secondaryDraw) {
    lines.push(
      `${cfg.secondaryDraw.label} is a separate drawing on the same ticket, with its own numbers. Check it ` +
        "separately, and only if your ticket includes it.",
    );
  }
  lines.push(
    "Check the draw date on the ticket against the date of the result you are comparing it with. Only the lottery " +
      "that sold the ticket can validate a win.",
  );
  return lines;
}

function explainOdds(cfg: FlagshipGameConfig): string[] {
  const jackpot = jackpotOdds(cfg.matrix);
  const lines = [
    `Matching everything — all ${cfg.matrix.mainCount} main numbers and the ${cfg.specialLabel} — is ` +
      `${jackpot.display}.`,
    oddsMethod(cfg.matrix, cfg.specialLabel),
    "Those odds are the same for every ticket and every drawing. They do not move with the jackpot, with how long " +
      "it has rolled, or with which numbers you choose.",
  ];
  const prizeGap = cfg.gaps.find((g) => g.what.includes("prize amounts"));
  if (prizeGap) lines.push(prizeGap.why);
  return lines;
}

/**
 * What the news rail holds, listed.
 *
 * Deliberately a list and not a summary: summarising an article means characterising its contents, and these
 * answers are computed, not generated. Every preview item is identified as one in the same breath.
 */
function listNews(inputs: AiAnswerInputs): string[] {
  const { contentItems, config: cfg } = inputs;
  if (contentItems.news.length === 0) {
    return [
      `No news system is connected to this build, so there is nothing tagged ${cfg.contentTag} to summarise.`,
      "Nothing has been written to fill the gap.",
    ];
  }
  const preview = contentItems.news.filter((i) => i.provenance !== "productionFeed").length;
  return [
    `${contentItems.news.length} ${cfg.contentTag} items are on this page: ` +
      contentItems.news.map((i) => `“${i.title}” (${i.publishedIso})`).join("; ") + ".",
    preview === contentItems.news.length
      ? "All of them are preview articles used for layout testing. None reports anything that happened."
      : `${preview} of them are preview articles used for layout testing.`,
    "A published news summary comes from the articles themselves, so nothing here is characterised beyond its title.",
  ];
}

/** What the community rail holds, listed. Never a characterisation of what members think. */
function listDiscussions(inputs: AiAnswerInputs): string[] {
  const { contentItems, config: cfg } = inputs;
  if (contentItems.forum.length === 0) {
    return [
      "No community platform is connected to this build, so there are no discussions to summarise.",
      "No posts, members or activity have been invented to fill the gap.",
    ];
  }
  const preview = contentItems.forum.filter((i) => i.provenance !== "productionFeed").length;
  return [
    `${contentItems.forum.length} discussions tagged ${cfg.contentTag} are on this page: ` +
      contentItems.forum
        .map((i) => `“${i.title}”${i.replyCount === undefined ? "" : ` (${i.replyCount} replies)`}`)
        .join("; ") + ".",
    preview === contentItems.forum.length
      ? "All of them are preview discussions used for layout testing. No member wrote them, and the reply " +
        "counts are not real activity."
      : `${preview} of them are preview discussions used for layout testing.`,
    "What members actually think is not summarised here — that would mean characterising posts, and this answer " +
      "only lists what the page holds.",
  ];
}

function summariseHistory(inputs: AiAnswerInputs): string[] | null {
  const { history, config: cfg } = inputs;
  if (!history || history.total === 0) {
    return [
      `No published ${cfg.gameLabel} drawing is connected to this build yet, so there is no history to summarise.`,
      "Nothing has been generated to stand in for one.",
    ];
  }
  const era = cfg.ruleEras.find((e) => e.effectiveTo === null)?.label ?? "the current format";
  if (history.total === 1) {
    return [
      `One published ${cfg.gameLabel} drawing is connected — the most recent one, from the production results feed.`,
      `The drawing archive is not connected yet, so there is no run of drawings to describe: the search, the ` +
        `multi-drawing check and every statistic say so rather than estimating.`,
      `Anything that is shown — the numbers, the advertised jackpot, the odds, the rules — is either published ` +
        `or counted from the published ${era} matrix.`,
    ];
  }
  /*
   * FGP-009: the series may be a preview one whose newest drawing is real. The answer states which, from the
   * counts, rather than asserting that everything is published — the sentence that stood here was true when the
   * only possible series was the feed's own and became a false claim the moment a preview payload existed.
   */
  const preview = history.total - history.productionFeed;
  return [
    `${history.total} ${cfg.gameLabel} drawings are connected here, all inside the current rule era — ${era}.`,
    preview > 0
      ? previewCountNote(preview, inputs.displayMode) ??
        `${history.productionFeed} of them ${history.productionFeed === 1 ? "is" : "are"} published.`
      : "Every one of them comes from the production results feed; nothing here is generated.",
    "The search and the analyses above run over that series — use the filters to look at any part of it.",
  ];
}

function whatChanged(inputs: AiAnswerInputs): string[] | null {
  const { draw, previous, drawDateDisplay, config: cfg } = inputs;
  if (!draw || !previous || !drawDateDisplay) return null;

  const repeated = draw.main.filter((v) => previous.main.includes(v)).sort((a, b) => a - b);
  const prevSum = previous.main.reduce((a, b) => a + b, 0);
  const sum = draw.main.reduce((a, b) => a + b, 0);
  const specialSame = draw.special !== null && draw.special === previous.special;

  const lines = [
    `The drawing before ${drawDateDisplay} was on ${previous.dateIso}: ${[...previous.main].sort((a, b) => a - b).join(", ")}` +
      (previous.special !== null && draw.specialLabel ? `, ${draw.specialLabel} ${previous.special}.` : "."),
    repeated.length === 0
      ? "No number carried over between the two."
      : `${repeated.length === 1 ? "One number carried over" : `${repeated.length} numbers carried over`}: ${repeated.join(", ")}.`,
  ];
  if (specialSame && draw.specialLabel) {
    lines.push(`The ${draw.specialLabel} was the same in both drawings.`);
  }
  lines.push(
    `The total of the main numbers moved from ${prevSum} to ${sum}.`,
    "Both drawings are independent of each other, so none of this says anything about the next one.",
  );
  if (inputs.history && inputs.history.productionFeed < 2) {
    lines.push(
      inputs.displayMode === "internalReview"
        ? `Only ${inputs.history.productionFeed} of the ${cfg.gameLabel} drawings held here is a real published ` +
          "result; the earlier one is an internal review row, so treat this comparison as a demonstration."
        : `Only the most recent ${cfg.gameLabel} drawing here is a published result — the one before it is ` +
          "preview data, so treat this comparison as a demonstration of the tool.",
    );
  }
  return lines;
}

function explainJackpot(inputs: AiAnswerInputs): string[] | null {
  const { jackpotDisplay, nextJackpotDisplay, drawDateDisplay, nextDrawDateDisplay, config: cfg } = inputs;
  if (!jackpotDisplay || !drawDateDisplay) return null;
  const lines = [
    `The ${jackpotDisplay} shown for ${drawDateDisplay} is the advertised jackpot — the headline figure, paid as ` +
      "an annuity over many years rather than as one payment.",
  ];
  if (nextJackpotDisplay && nextDrawDateDisplay) {
    lines.push(`${nextJackpotDisplay} is advertised for the drawing on ${nextDrawDateDisplay}.`);
  }
  const cashGap = cfg.gaps.find((g) => g.what.includes("cash value"));
  lines.push(
    "A winner may usually take a smaller lump sum instead, called the cash value. " +
      (cashGap ? cashGap.why : "It is published separately by the game operator."),
  );
  lines.push(
    "So no comparison between the two is shown here, and nothing on this page is tax or financial advice.",
  );
  return lines;
}

function explainRuleEras(cfg: FlagshipGameConfig): string[] {
  return cfg.ruleEras.map((era) => {
    const range =
      era.effectiveFrom && era.effectiveTo
        ? `${era.effectiveFrom} to ${era.effectiveTo}`
        : era.effectiveFrom
          ? `from ${era.effectiveFrom} onwards`
          : era.effectiveTo
            ? `up to ${era.effectiveTo}`
            : "period not recorded";
    return `${era.label} (${range}). ${era.summary.value}`;
  });
}

/* ------------------------------------------------------------------ self-check */

/**
 * Every string this module can put on the page, for the prediction scanner to walk.
 *
 * Kept as a function rather than as a test fixture so the scanner reads the SAME copy the page renders. A test
 * that walked a hand-written list would pass while the page said something else.
 */
export function aiCopyStrings(inputs: AiAnswerInputs): string[] {
  const out: string[] = [AI_SURFACE_BOUNDARY, AI_NOT_CONNECTED_LABEL, COMPUTED_ANSWER_LABEL];
  for (const s of aiSurfaces(inputs)) {
    out.push(s.label, s.boundary, ...s.grounding, ...(s.deterministicAnswer ?? []));
  }
  const cfg = inputs.config;
  out.push(cfg.internationalNote.value);
  for (const n of cfg.jurisdictionNotes) out.push(n.heading, isGap(n.body) ? n.body.why : n.body.value);
  return out;
}
