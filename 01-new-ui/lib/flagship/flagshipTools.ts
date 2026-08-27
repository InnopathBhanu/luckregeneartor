/*
 * THE FLAGSHIP TOOL MANIFEST — LRG-FLAGSHIP-002, section FG-07.
 *
 * Authority: BP-04A §21 (the Powerball and Mega Millions tool defaults), §31 (*"All tools are publicly
 * discoverable … Do not hide an Insider tool entirely"*), BP-05C §0.1 (the four access patterns), §8 and §9
 * (the two priority lists), §11 (the recommended initial access matrix), §18 (what a tool manifest declares),
 * `CLAUDE.md` §10 (a route is never invented because a blueprint names one).
 *
 * ══ THREE THINGS A TOOL DECLARES, AND WHY THEY ARE SEPARATE ══
 *
 *   `access`       — who may RUN it. A product decision from BP-05C §11.
 *   `availability` — whether the DATA exists in this build. An engineering fact.
 *   `route`        — where the full tool lives. `null` for every tool here, because BP-04A §9 and §40 make the
 *                    child routes (`/powerball/statistics`, `/powerball/generator`, `/tools/tax-calculator`)
 *                    **conceptual until the URL inventory approves them**, and `CLAUDE.md` §10 forbids
 *                    inventing a route because a blueprint needs one. A tool with no route is rendered as a
 *                    described capability, never as a dead link.
 *
 * A locked tool and an unbuilt tool look different on the page and must never be confused: one is waiting for a
 * reader to sign in, the other is waiting for us.
 */

import type { FlagshipTool, LockedCapability } from "./flagshipContract";
import type { FlagshipGameConfig } from "./flagshipGames";

/* ------------------------------------------------------------------ shared locked capabilities */

/**
 * Every signed-in continuation offered anywhere on the page.
 *
 * `signedIn` throughout since Conflict 37 (2026-08-11): the shared sign-in flow and the review-mode account
 * store exist, so each of these opens the real `/login` flow when signed out and — where it is a continuity
 * capability — executes against the member's account when signed in. Capabilities that need an execution
 * service (export, model AI, batch runs) answer honestly instead of pretending — see
 * `lib/account/session.ts` `classifyIntentAction`.
 */
const lock = (key: string, label: string, benefit: string): LockedCapability => ({
  key,
  label,
  benefit,
  gate: "signedIn",
});

export const CHECKER_LOCKS: readonly LockedCapability[] = Object.freeze([
  lock("save-ticket", "Save this ticket", "Keep the line so you do not retype it every drawing."),
  lock("check-multiple", "Check several tickets at once", "Paste or add more than one line and check them together."),
  lock("auto-check", "Check my numbers every drawing", "Your saved lines are compared automatically after each drawing."),
  lock("win-alert", "Tell me if I win", "A message when a saved line matches, instead of you remembering to look."),
  lock("label-sets", "Name my number sets", "Call a line “Mum's numbers” so you know which is which."),
]);

export const GENERATOR_LOCKS: readonly LockedCapability[] = Object.freeze([
  lock("save-sets", "Save these sets", "Keep generated lines and reuse them on the next drawing."),
  lock("batch", "Generate a batch", "Produce more lines at once than the public tool returns."),
  lock("compare-history", "Compare against past drawings", "See whether a generated line has ever come up before."),
  lock("name-sets", "Name and favourite a set", "Group lines so a saved set means something to you later."),
]);

export const STATS_LOCKS: readonly LockedCapability[] = Object.freeze([
  lock("save-view", "Save this stat view", "Return to the same period, filters and view next time."),
  lock("compare-saved", "Compare my saved numbers", "Line your own numbers up against the view on screen."),
  lock("export-snapshot", "Export or share this snapshot", "Take the table away as a file."),
  lock("ai-summarise-view", "Ask AI to summarise this view", "A plain-language read of the view you selected."),
]);

/* ------------------------------------------------------------------ the catalog */

/**
 * Every tool a flagship hub offers, keyed so a game config can order them.
 *
 * `inline: true` means the working tool is rendered ON this page. Those are the three the Constitution's
 * deliver-value-before-engagement rule most obviously covers — check, generate, understand — plus the odds
 * explainer, which is computed rather than looked up.
 */
function catalog(cfg: FlagshipGameConfig): FlagshipTool[] {
  const isPowerball = cfg.gameSlug === "powerball";

  const tools: FlagshipTool[] = [
    {
      key: "check-numbers",
      label: "Check my numbers",
      purpose: `Compare a ${cfg.gameLabel} line against the published drawing, position by position.`,
      category: "check",
      access: "publicComplete",
      availability: "available",
      inline: true,
      signedInExtras: CHECKER_LOCKS,
      route: null,
      note: "Runs on this page. A dedicated check page is conceptual until the URL inventory approves it.",
    },
    {
      key: "generator",
      label: "Number generator",
      purpose: "Produce random lines, with balance preferences and numbers you want to keep.",
      category: "generate",
      access: "publicComplete",
      availability: "available",
      inline: true,
      signedInExtras: GENERATOR_LOCKS,
      route: null,
      note: "Runs on this page.",
    },
    {
      key: "odds",
      label: "Odds explainer",
      purpose: "The real chance of every match, counted from the published number matrix.",
      category: "analyse",
      access: "publicComplete",
      availability: "available",
      inline: true,
      signedInExtras: [],
      route: null,
      note: "Runs on this page.",
    },
    {
      key: "statistics",
      label: "Stats Lab",
      purpose: "Frequency, gaps, pairs, repeats, balance and sums across the drawing record.",
      category: "analyse",
      access: "publicPreview",
      availability: "dataNotConnected",
      inline: true,
      signedInExtras: STATS_LOCKS,
      route: null,
      note:
        "The analysis is implemented and tested; no drawing history is connected to this build, so each view " +
        "states what it needs.",
    },
    {
      key: "drawn-together",
      label: "Drawn together",
      purpose: "Which numbers have appeared in the same drawing most often.",
      category: "analyse",
      access: "publicPreview",
      availability: "dataNotConnected",
      inline: true,
      signedInExtras: STATS_LOCKS,
      route: null,
      note: "A Stats Lab view. Needs the drawing history.",
    },
    {
      key: "jackpot-tracker",
      label: "Jackpot tracker",
      purpose: "How the advertised jackpot has moved, how long it has rolled and how it compares.",
      category: "money",
      access: "publicComplete",
      availability: "dataNotConnected",
      inline: false,
      signedInExtras: [
        lock("jackpot-threshold", "Tell me when it passes an amount", "A message when the jackpot crosses a figure you choose."),
      ],
      route: null,
      note:
        "This build holds the current advertised figure and the one advertised for the next drawing, and shows " +
        "both. A roll count and a growth series need the jackpot history.",
    },
    {
      key: "tax-calculator",
      label: "Jackpot tax calculator",
      purpose: "An estimate of what a win is worth after withholding.",
      category: "money",
      access: "publicComplete",
      availability: "available",
      inline: false,
      signedInExtras: [lock("save-scenario", "Save this scenario", "Come back to the same figures later.")],
      /*
       * LRG-TOOLS-001: the standalone tool exists at the BP-05C §5 blueprint route under the Conflict 42
       * interim founder instruction (noindex; the legacy /lottery-tax-calculator consolidation waits for the
       * launch redirect map). The §20 requirements the old note recorded — effective tax year, filing-status
       * and residency assumptions, dated sources, review owner — are now captured in lib/tools/taxTables2026.ts
       * and rendered on the page. `?game=` context transfer (§7) is appended by the section that renders the
       * link, never here, so this manifest stays game-neutral.
       */
      route: "/tools/tax-calculator",
      note:
        "Runs at /tools/tax-calculator (BP-05C §11: one complete public estimate; a free account adds saved " +
        "scenarios). Opened from this page with ?game= context so the advertised jackpot is prefilled.",
    },
    {
      key: "cash-vs-annuity",
      label: "Cash or annuity",
      purpose: "What the two ways of taking a jackpot are actually worth.",
      category: "money",
      access: "publicPreview",
      availability: "dataNotConnected",
      inline: false,
      signedInExtras: [lock("save-scenario-annuity", "Save this comparison", "Keep the assumptions you used.")],
      route: null,
      note:
        "The production feed carries the advertised annuity only. A cash value is published separately by the " +
        "operator and is never derived here, so there is nothing to compare yet.",
    },
    {
      key: "pool-splitter",
      label: "Group play splitter",
      purpose: "Divide a prize across a group, with each share shown.",
      category: "money",
      access: "publicComplete",
      availability: "dataNotConnected",
      inline: false,
      signedInExtras: [lock("save-group", "Save my group", "Keep the group so the split is one click next time.")],
      route: null,
      note: "Not built in this build.",
    },
    {
      key: "ai-ticket-analysis",
      label: "AI ticket analysis",
      purpose: "A plain-language read of a line you already hold — balance, duplicates, coverage.",
      category: "personal",
      access: "publicPreview",
      availability: "dataNotConnected",
      inline: false,
      signedInExtras: [
        lock("ai-batch", "Analyse several lines", "A read across every line you saved, not one at a time."),
      ],
      route: null,
      note:
        "`DATA-DEC-001` `FD-DAT-02` puts AI execution behind a free Account, and no Account or AI provider is " +
        "connected. The deterministic parts — balance, duplicates, coverage — are what the generator already shows.",
    },
  ];

  /* ---- game-specific tools, from BP-05C §8 and §9 ---- */

  if (isPowerball) {
    tools.push(
      {
        key: "double-play-checker",
        label: "Double Play checker",
        purpose: "Check the same line against the separate Double Play drawing.",
        category: "check",
        access: "publicComplete",
        availability: "available",
        inline: true,
        signedInExtras: CHECKER_LOCKS,
        route: null,
        note: "Runs inside the checker on this page whenever a Double Play result is published for the drawing.",
      },
      {
        key: "power-play-explainer",
        label: "Power Play explainer",
        purpose: "What the multiplier does, when 10X is included, and why it only applies if you bought it.",
        category: "analyse",
        access: "publicComplete",
        availability: "available",
        inline: true,
        signedInExtras: [],
        route: null,
        note: "Rendered in Prizes and odds on this page.",
      },
      {
        key: "us-uk-explainer",
        label: "U.S. and UK Powerball",
        purpose: "What the two offerings share, what they do not, and why the advertised values differ.",
        category: "analyse",
        access: "publicComplete",
        availability: "available",
        inline: true,
        signedInExtras: [],
        route: null,
        note: "Rendered in Where Powerball is played on this page.",
      },
    );
  } else {
    tools.push({
      key: "ticket-multiplier-prize",
      label: "Ticket multiplier prize calculator",
      purpose: "Apply the multiplier printed on your own ticket to a non-jackpot prize.",
      category: "money",
      access: "publicPreview",
      availability: "dataNotConnected",
      inline: false,
      signedInExtras: [],
      route: null,
      note:
        "BP-05C §9 requires this to read the multiplier from the reader's ticket and never from a drawing-level " +
        "value. It needs the operator's base prize table, which is not captured in this build.",
    });
  }

  return tools;
}

/**
 * The tools for a game, ordered by its configured lead list first, then the rest in catalog order.
 *
 * Ordering is configuration, so Mega Millions leads with its ticket-multiplier calculator and Powerball with
 * Double Play, without either page knowing which game it is.
 */
export function flagshipTools(cfg: FlagshipGameConfig): FlagshipTool[] {
  const all = catalog(cfg);
  const rank = new Map(cfg.leadToolKeys.map((k, i) => [k, i]));
  return [...all].sort((a, b) => {
    const ra = rank.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });
}

/** The tools rendered as working surfaces on this page, in configured order. */
export function inlineTools(cfg: FlagshipGameConfig): FlagshipTool[] {
  return flagshipTools(cfg).filter((t) => t.inline);
}

/** Every distinct locked capability offered anywhere on the page. Used by the tests and the alerts panel. */
export function allLockedCapabilities(cfg: FlagshipGameConfig): LockedCapability[] {
  const seen = new Map<string, LockedCapability>();
  for (const t of flagshipTools(cfg)) for (const l of t.signedInExtras) seen.set(l.key, l);
  return [...seen.values()];
}
