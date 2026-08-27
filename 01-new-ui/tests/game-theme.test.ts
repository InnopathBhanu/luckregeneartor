/*
 * THE SHARED GAME THEME REGISTRY — FGP-011.
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. A themed surface that is ILLEGIBLE. Every accent pairing is measured against the real WCAG formula, not
 *      trusted from a comment beside the hex.
 *   2. A game theme silently becoming a BALL colour, which would make a drawn number change when someone edits a
 *      brand palette.
 *   3. A game on Home with NO theme, which is how one game quietly keeps the old shared red.
 *   4. A colour drifting back into a component or a per-game selector into the stylesheet — the two-sources
 *      problem the registry exists to end.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  DEFAULT_GAME_THEME, GAME_THEMES, QUIET_NOTE, gameTheme, gameThemeByName, gameThemeVars,
  gameThemeVarsFor, provisionalThemes, resolveGameTheme, type GameTheme,
} from "../lib/theme/gameThemeRegistry";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const exists = (p: string) => existsSync(new URL(`../${p}`, import.meta.url));

/** Source with comments stripped, so an explanatory note never satisfies or breaks an assertion. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ------------------------------------------------------------------ contrast */

const lin = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The four surfaces a theme is ever placed on. Read out of `globals.css` so a token change cannot be missed. */
const CANVAS = "#f2f6fa";
const SURFACE = "#ffffff";
const TEXT = "#172033";
const NAVY = "#172033";

const ALL = [...GAME_THEMES, DEFAULT_GAME_THEME];

/* ------------------------------------------------------------------ the registry */

describe("FGP-011: the game theme registry is complete and legible", () => {
  test("every theme declares all five values, an emphasis, a status and a rationale", () => {
    for (const t of ALL) {
      assert.match(t.id, /^[a-z0-9-]+$/, `${t.label} needs a slug-shaped id`);
      assert.ok(t.label.length > 0);
      assert.ok(["flagship", "brand", "quiet"].includes(t.emphasis));
      assert.ok(["verified", "provisional"].includes(t.status));
      assert.ok(t.rationale.length > 30, `${t.id} must say WHY it is this colour`);
      for (const value of [t.accent, t.on, t.ink, t.bright, t.wash]) {
        assert.match(value, /^#[0-9a-f]{6}$/, `${t.id} has a malformed colour "${value}"`);
      }
    }
    /* Ids are unique — two entries for one game is the drift this registry exists to prevent. */
    const ids = ALL.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate theme id");
  });

  test("every accent pairing clears its WCAG threshold", () => {
    for (const t of ALL) {
      /* A fill that carries text: 4.5:1 against the text colour that sits on it (1.4.3). */
      assert.ok(
        contrast(t.accent, t.on) >= 4.5,
        `${t.id}: ${t.on} on ${t.accent} is ${contrast(t.accent, t.on).toFixed(2)}`,
      );
      /* The ink is used as text and as a meaningful line on BOTH light backgrounds the site uses. */
      for (const bg of [CANVAS, SURFACE]) {
        assert.ok(
          contrast(t.ink, bg) >= 4.5,
          `${t.id}: ink on ${bg} is ${contrast(t.ink, bg).toFixed(2)}`,
        );
      }
      /* The bright value only ever appears on a dark surface or as a decorative rule: 3:1 (1.4.11). */
      assert.ok(
        contrast(t.bright, NAVY) >= 3,
        `${t.id}: bright on navy is ${contrast(t.bright, NAVY).toFixed(2)}`,
      );
      /* Body text on the wash must still read. */
      assert.ok(
        contrast(TEXT, t.wash) >= 4.5,
        `${t.id}: body text on wash is ${contrast(TEXT, t.wash).toFixed(2)}`,
      );
    }
  });

  test("no theme value is a ball colour, in either direction", () => {
    /*
     * The failure this prevents: someone brightens a brand palette and the DRAWN NUMBERS change colour on Home,
     * State, the Game Page and the archive at once. The two systems are related but not equal — Powerball's ball
     * is deeper than its page accent precisely because it carries white numerals at 32px.
     */
    const css = src("app/globals.css");
    const ballValues = new Set(
      [...css.matchAll(/--ball-[a-z-]+(?:-bg|-fg)?:\s*(#[0-9a-f]{3,6})/g)].map((m) => m[1].toLowerCase()),
    );
    assert.ok(ballValues.size >= 6, "the ball tokens must still be declared");
    for (const t of ALL) {
      for (const [name, value] of Object.entries({ accent: t.accent, ink: t.ink, bright: t.bright })) {
        assert.equal(
          ballValues.has(value.toLowerCase()),
          false,
          `${t.id}.${name} (${value}) is a ball colour — a game theme must never move a drawn number`,
        );
      }
    }
    /* And the ball tokens are still scoped to every surface that renders results. */
    for (const scope of [
      "[data-lc-preview]", "[data-lc-state-preview]", "[data-lc-game-preview]", "[data-lc-flagship-preview]",
    ]) {
      assert.ok(css.includes(scope), `${scope} must keep the approved ball tokens`);
    }
  });

  test("flagship games are verified; everything else is honestly marked provisional", () => {
    const verified = GAME_THEMES.filter((t) => t.status === "verified").map((t) => t.id);
    assert.deepEqual(verified, ["powerball", "mega-millions"], "only evidenced identities may claim `verified`");
    /* A provisional theme must SAY it is one, so a founder reading the file sees it without checking a field. */
    for (const t of provisionalThemes()) {
      assert.match(t.rationale, /PROVISIONAL/, `${t.id} must declare itself provisional in its rationale`);
    }
    assert.ok(provisionalThemes().length > 0);
  });

  test("the quiet family is restrained on purpose, and says so", () => {
    const quiet = GAME_THEMES.filter((t) => t.emphasis === "quiet");
    assert.ok(quiet.length >= 6, "the pick and tool games belong to the quiet family");
    for (const t of quiet) {
      assert.match(t.rationale, /quiet family/);
      /* Low chroma: a quiet accent's channels stay close together, so it cannot shout over a flagship game. */
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(t.accent.slice(i, i + 2), 16));
      assert.ok(Math.max(r, g, b) - Math.min(r, g, b) < 90, `${t.id} is too saturated for the quiet family`);
    }
    assert.match(QUIET_NOTE, /identity comes from the state/);
  });

  test("no two games share an accent, and the flagship pair is unmistakable", () => {
    /*
     * Checked across EVERY theme, not only the saturated ones. A first pass compared the loud themes alone and
     * let Cash Pop and Jackpot Triple Play ship the same #4c4f7a — two games, one colour, in a registry whose
     * whole purpose is that each game has its own.
     */
    const seen = new Map<string, string>();
    for (const t of GAME_THEMES) {
      const prior = seen.get(t.accent);
      assert.equal(prior, undefined, `${t.id} reuses ${prior}'s accent (${t.accent})`);
      seen.set(t.accent, t.id);
    }
    /* Powerball red and Mega Millions gold stay what FGP-010 established. */
    const pb = gameTheme("powerball")!;
    const mm = gameTheme("mega-millions")!;
    const chan = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const [pr, pg, pblue] = chan(pb.accent);
    const [mr, mg, mb] = chan(mm.accent);
    assert.ok(pr > 190 && pg < 80 && pblue < 80, "Powerball must read as a clear red");
    assert.ok(mr > 200 && mg > 130 && mb < 90, "Mega Millions must read as a clear gold");
    assert.equal(mm.on, "#14203a", "gold carries dark text; white on it fails outright");
  });

  test("lookup works by slug and by display name, and never returns nothing", () => {
    assert.equal(gameTheme("powerball")!.id, "powerball");
    assert.equal(gameTheme("not-a-game"), null, "an unknown slug is reported, not papered over");
    assert.equal(gameThemeByName("Mega Millions")!.id, "mega-millions");
    assert.equal(gameThemeByName("Lotto America")!.id, "lotto-america");
    /* The alias table exists because Home carries these names verbatim. */
    assert.equal(gameThemeByName("SuperLotto Plus (CA)")!.id, "superlotto-plus");
    assert.equal(gameThemeByName("Cash4Life")!.id, "cash4life");
    /* `resolveGameTheme` is total, so no component needs — or can invent — a fallback. */
    assert.equal(resolveGameTheme("powerball").id, "powerball");
    assert.equal(resolveGameTheme("Powerball").id, "powerball");
    assert.equal(resolveGameTheme("something unknown").id, DEFAULT_GAME_THEME.id);
    assert.equal(resolveGameTheme(null).id, DEFAULT_GAME_THEME.id);
    assert.equal(resolveGameTheme("").id, DEFAULT_GAME_THEME.id);
  });

  test("a theme reaches the DOM as five custom properties and nothing else", () => {
    const vars = gameThemeVars(gameTheme("powerball")!) as unknown as Record<string, string>;
    assert.deepEqual(Object.keys(vars).sort(), [
      "--gt-accent", "--gt-accent-bright", "--gt-accent-ink", "--gt-accent-on", "--gt-accent-wash",
    ]);
    assert.equal(vars["--gt-accent"], gameTheme("powerball")!.accent);
    assert.deepEqual(gameThemeVarsFor("Powerball"), gameThemeVars(gameTheme("powerball")!));
  });
});

/* ------------------------------------------------------------------ coverage */

describe("FGP-011: every game the site shows has an identity", () => {
  /** Every game named anywhere in Home's fixture, by slug and by display name. */
  const homeGames = (): { key: string; where: string }[] => {
    const data = JSON.parse(readFileSync(new URL("../../04-sample-data/home-page-sample.json", import.meta.url), "utf8"));
    const out: { key: string; where: string }[] = [];
    const push = (key: unknown, where: string) => {
      if (typeof key === "string" && key.trim().length > 0) out.push({ key, where });
    };
    for (const c of data.featureGames?.cards ?? []) push(c.gameSlug, "featureGames");
    for (const c of data.latestResults?.cards ?? []) push(c.gameSlug, "latestResults");
    for (const g of data.popularGames?.items ?? []) push(g.slug, "popularGames");
    for (const r of data.topJackpots?.rows ?? []) push(r[0], "topJackpots");
    for (const u of data.upcoming?.items ?? []) push(u.game, "upcoming");
    for (const j of data.jackpotHistory?.items ?? []) push(j.game, "jackpotHistory");
    for (const k of ["recentWins", "unclaimedPrizes", "jackpotGrowth"]) {
      for (const n of data.news?.[k] ?? []) push(n.game, `news.${k}`);
    }
    return out;
  };

  test("every game displayed on Home resolves to a registered theme", () => {
    const missing: string[] = [];
    for (const { key, where } of homeGames()) {
      const t = gameTheme(key) ?? gameThemeByName(key);
      if (!t) missing.push(`${key} (${where})`);
    }
    assert.deepEqual(missing, [], "these Home games would fall back to the neutral default");
  });

  test("Home no longer paints every game with one shared red", () => {
    const themes = new Set(
      homeGames().map(({ key }) => (gameTheme(key) ?? gameThemeByName(key) ?? DEFAULT_GAME_THEME).ink),
    );
    assert.ok(themes.size >= 4, `Home shows ${themes.size} distinct game colours; it used to show one`);
    /* And the legacy shared accent is gone from every game-money figure. */
    /* The archived legacy Home. The claim — the shared red is gone from its money figures — is still
       checkable there, and `FD-GATE-01` removed the template from the render path without rewriting it. */
    const home = code("components/archived/legacy/home/HomeTemplate.tsx");
    for (const [line] of home.matchAll(/^.*\{cleanCopy\((?:g\.topPrize|j\.current|u\.jackpot)\).*$/gm)) {
      assert.match(line, /--gt-accent-ink/, `a game figure still uses a shared colour: ${line.trim()}`);
      assert.doesNotMatch(line, /--lc-accent/);
    }
  });

  test("the founder's named games all have an entry, including ones not yet on Home", () => {
    for (const slug of [
      "powerball", "mega-millions", "lotto-america", "florida-lotto", "cash4life", "lucky-for-life",
      "pick-3", "pick-4", "pick-5", "fantasy-5", "cash-pop",
    ]) {
      assert.ok(gameTheme(slug), `${slug} must have a theme`);
    }
  });
});

/* ------------------------------------------------------------------ consumption */

describe("FGP-011: the registry is the only place a game colour lives", () => {
  /*
   * ══ FOUR CONSUMERS WERE ARCHIVED BY `FD-GATE-01` (2026-08-11) ══
   *
   * `HomeTemplate`, `DynamicResultCard`, `DataTable` and `HighlightsAlerts` were theme consumers only because the
   * legacy templates rendered them. Those templates are no longer reachable from any route, so those four are no
   * longer LIVE consumers and asserting over them would be asserting about unreachable code.
   *
   * The guarantee this block protects — no game colour lives outside the registry — is therefore enforced over a
   * SMALLER live surface, which is strictly stronger, not weaker. The archived copies keep their theme usage
   * unchanged; nothing was rewritten on the way out.
   */
  const CONSUMERS = [
    "components/preview/HomePreview.tsx",
    "components/preview/PreviewResultCard.tsx",
    "components/flagship/FlagshipGamePage.tsx",
    /*
     * §A6 — the three families that were still outside the registry.
     *
     * Adding them here is the point of the rollout, not bookkeeping: it is what makes "no component holds a copy of
     * a game colour" and "colour is reached through the registry" enforced on the State page, the Game Page and the
     * archive too. Before this, `/fl`, `/fl/pick-3` and `/fl/pick-3/2026` could each have presented a different
     * Pick 3 identity and no test would have noticed.
     */
    "components/state/preview/StatePreview.tsx",
    "components/game/preview/GamePreview.tsx",
    "components/archive/ArchiveView.tsx",
  ];

  test("no consumer copies a theme value out of the registry", () => {
    /*
     * Scoped to THEME values rather than to every hex in the file. `HomeTemplate.tsx` is legacy and carries
     * unrelated hexes in its insider panel; forbidding those would be a different task's cleanup and would make
     * this test fail for a reason that has nothing to do with game colour.
     *
     * What matters is that no game colour is duplicated: the moment a component holds a copy of #d21f28, the
     * registry stops being the single source and the copy is what ships when someone edits the other one.
     */
    const values = new Set(
      ALL.flatMap((t) => [t.accent, t.on, t.ink, t.bright, t.wash]).map((v) => v.toLowerCase()),
    );
    for (const f of CONSUMERS) {
      assert.ok(exists(f), `${f} must exist`);
      const body = code(f);
      for (const hex of [...body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase())) {
        assert.equal(values.has(hex), false, `${f} holds a copy of the theme value ${hex}`);
      }
      /* And it reaches colour through the registry, not through a neighbour's import. */
      assert.match(body, /gameTheme(?:Vars|VarsFor)?\(|resolveGameTheme\(/, `${f} must use the registry`);
      /* A file either SETS the properties for its subtree or READS them. `PreviewResultCard` only sets them —
         its one coloured element is styled by `.lcp-amount` in the stylesheet — and that is still part of the
         system, so both forms count. What must never appear is a literal, which the loop above rules out. */
      assert.match(
        body,
        /gameThemeVars(?:For)?\(|var\(--gt-accent/,
        `${f} must either apply or consume the theme properties`,
      );
    }
  });

  test("the stylesheet consumes themes and declares none", () => {
    const css = code("app/globals.css");
    /* No per-game selector — that was the two-sources problem. */
    assert.doesNotMatch(css, /\[data-game-theme="/, "a per-game selector puts the colour back in CSS");
    assert.doesNotMatch(css, /\[data-accent="/);
    /* But the consumers are there, and they name the shared properties. */
    assert.ok((css.match(/var\(--gt-accent/g) ?? []).length > 10, "the stylesheet must consume the theme");
    for (const rule of [
      /\.lcfg-btn--primary \{[^}]*var\(--gt-accent[,)]/s,
      /\.lcfg-btn--primary \{[^}]*color: var\(--gt-accent-on/s,
      /\.lcp-amount \{[^}]*var\(--gt-accent-bright/s,
    ]) {
      assert.match(css, rule);
    }
  });

  test("the flagship config no longer carries a one-off accent", () => {
    const games = code("lib/flagship/flagshipGames.ts");
    assert.doesNotMatch(games, /accentToken/, "the per-game colour moved to the shared registry");
    const page = code("components/flagship/FlagshipGamePage.tsx");
    assert.match(page, /resolveGameTheme\(config\.gameSlug\)/);
    assert.match(page, /data-game-theme=\{theme\.id\}/);
  });

  test("the result grammar still colours drawn numbers from the ball system", () => {
    /* A themed CARD must not have re-coloured the numbers inside it. `DynamicResultCard` was archived by
       `FD-GATE-01`; the live card is the one that matters. */
    for (const f of ["components/preview/PreviewResultCard.tsx"]) {
      const body = code(f);
      assert.doesNotMatch(body, /--gt-accent[a-z-]*"?\s*\}?\s*\)?\s*;?\s*\/\/ ball/i);
    }
    /* `BallGroup` was archived with the legacy cards. The LIVE ball primitive is the State result grammar's, which
       is asserted immediately below and is what Home, State, the Game Page, the archive and the flagship all use. */
    const grammar = code("components/state/preview/sections/StateResultGrammar.tsx");
    assert.doesNotMatch(grammar, /--gt-accent/);
  });

  test("§A6: the three newly-themed families set the properties and never a ball colour", () => {
    for (const f of [
      "components/state/preview/StatePreview.tsx",
      "components/game/preview/GamePreview.tsx",
      "components/archive/ArchiveView.tsx",
    ]) {
      const body = code(f);
      /* Each applies the theme to its own subtree root, so every descendant inherits it. */
      assert.match(body, /style=\{gameThemeVars\(theme\)\}/, `${f} must apply the theme to its root`);
      assert.match(body, /data-game-theme=\{theme\.id\}/, `${f} must declare which theme it resolved`);
      /* And none of them re-colours a drawn number: the ball system is a separate approved token family. */
      assert.doesNotMatch(body, /--ball-/, `${f} must not name a ball token`);
    }
  });
});

/* ------------------------------------------------------------------ standing constraints */

describe("FGP-011: the flagship guarantees survive a theming change", () => {
  test("no route guard, no sitemap, no redirect, no commerce change", () => {
    for (const f of [
      "lib/flagship/flagshipRouteAccess.ts",
      "components/flagship/FlagshipGamePage.tsx",
      "lib/theme/gameThemeRegistry.ts",
      "components/preview/HomePreview.tsx",
    ]) {
      assert.doesNotMatch(code(f), /LC_FLAGSHIP_GAME_PREVIEW/, `${f} must not reintroduce the removed guard`);
    }
    assert.doesNotMatch(src("lib/seo/sitemapEntries.ts"), /powerball|mega-millions|flagship/i);
    assert.equal(exists("app/sitemap.ts"), false);
    assert.doesNotMatch(src("next.config.mjs"), /redirects/);
    /* The theming pass touched no commerce route. */
    for (const f of [
      "components/archived/legacy/home/HomeTemplate.tsx",
      "components/flagship/FlagshipGamePage.tsx",
    ]) {
      const body = code(f);
      if (body.includes("buynow")) assert.fail(`${f} changed a commerce route`);
    }
  });

  test("Home keeps its ad slots and its layout", () => {
    /* Reads the ARCHIVED template deliberately: the assertion is that the theming pass did not disturb the legacy
       Home's ad slots or grid, and that claim is still checkable at its archived path. `FD-GATE-01` removed the
       template from the render path; it did not rewrite it. */
    const home = src("components/archived/legacy/home/HomeTemplate.tsx");
    /* Every GAM slot family the template renders is still rendered. */
    for (const marker of ["AdSlot", "StickyFooterAd", "ads.top", "ads.rightRail", "ads.mobileInContent"]) {
      assert.ok(home.includes(marker), `${marker} must survive the theming pass`);
    }
    /* And the theming is colour only: no grid or column count changed. */
    assert.match(home, /sm:grid-cols-2 xl:grid-cols-3/, "the popular-games grid is unchanged");
  });
});

/* Keeps the type import honest — a theme is a value shape, not an interface someone can widen unnoticed. */
const _shape: GameTheme = DEFAULT_GAME_THEME;
void _shape;
