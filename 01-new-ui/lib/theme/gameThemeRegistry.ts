/*
 * THE SHARED GAME THEME REGISTRY — FGP-011.
 *
 * Authority: founder instruction for FGP-011 (*"each game should have its own theme based on the vibe/colors from
 * its official game identity, then use that theme consistently"*), `CLAUDE.md` §9 (shared design tokens, no raw
 * hex in components, WCAG 2.2 AA), §14 (`notCaptured` is stated, never guessed).
 *
 * ══ ONE SOURCE, NOT TWO ══
 *
 * FGP-010 put two per-game accent blocks in `globals.css`. That worked for two games and would not survive
 * twelve: a stylesheet block and a TypeScript config describing the same colour drift apart, and the drift is
 * invisible until someone screenshots the wrong page.
 *
 * So the values live HERE, once, and reach the DOM as CSS custom properties through `gameThemeVars`. The
 * stylesheet declares only how a theme is CONSUMED (`background: var(--gt-accent)`), never what any game's
 * colour is. A component never writes a hex; it applies a theme.
 *
 * ══ WHY FIVE VALUES AND NOT ONE ══
 *
 * A single "brand colour" cannot do the work. It has to be legible as a fill under text, as text on a near-white
 * page, and as a mark on a dark surface — three different jobs with three different contrast requirements, and
 * Mega Millions proves no single value can satisfy them: a gold bright enough to read as Mega Millions cannot
 * carry white text at all (#f2a71b on white is 2.04).
 *
 *   accent   A FILL that carries text. ≥4.5:1 against `on`.
 *   on       The text/icon colour that sits on `accent`. White for most games; deep navy for gold ones.
 *   ink      The theme AS TEXT, and as a line that carries meaning, on the light page. ≥4.5:1 on both
 *            the canvas (#f2f6fa) and the surface (#ffffff).
 *   bright   Full saturation, for marks on a DARK surface and for decorative washes. ≥3:1 on brand navy.
 *   wash     A very light tint for a card or band background. Body text on it stays ≥4.5:1.
 *
 * Every ratio is measured by test, not asserted in a comment. See `tests/game-theme.test.ts`.
 *
 * ══ THIS IS NOT THE BALL SYSTEM ══
 *
 * `--ball-*` colours the DRAWN NUMBERS and is a separate, already-approved system shared by Home, State, the
 * Game Page, the archive and the flagship hubs. A game theme is the identity of the GAME; a ball colour is the
 * identity of a POSITION in a result. They are related but not equal — Powerball's ball is a deeper red than its
 * page accent precisely because the ball must carry white numerals at 32px.
 *
 * No value in this file is an alias of a `--ball-*` token, and a test enforces that. Changing a theme must never
 * change what a drawn number looks like.
 *
 * ══ VERIFIED AGAINST PROVISIONAL ══
 *
 * `status: "verified"` means the identity is evidenced inside this repository — the operator-quoted format
 * registry, the captured logo manifest, or an approved blueprint. `status: "provisional"` means the hue was
 * chosen to be distinct and legible, NOT copied from an operator's brand guide, and it is a design placeholder
 * awaiting founder approval. The task instruction is explicit that an uncertain identity must be marked rather
 * than asserted, and `provisionalThemes()` exists so the report can list them without anyone reading the file.
 */

import type { CSSProperties } from "react";

export type GameThemeStatus =
  /** The identity is evidenced in this repository. */
  | "verified"
  /** A distinct, legible placeholder. Not an operator brand claim. Needs founder approval. */
  | "provisional";

export type GameThemeEmphasis =
  /** A national brand with its own hub page. Carries the strongest colour. */
  | "flagship"
  /** A named jackpot game with a recognisable identity of its own. */
  | "brand"
  /** A daily draw or tool game. Deliberately restrained — see `QUIET_NOTE`. */
  | "quiet";

export interface GameTheme {
  /** The canonical game slug. Matches the slugs used by the route registry and the fixtures. */
  id: string;
  /** Reader-facing name, for the theme picker and the tests' error messages. */
  label: string;
  emphasis: GameThemeEmphasis;
  status: GameThemeStatus;
  /** Why this colour. Read by a founder reviewing the provisional set. */
  rationale: string;
  accent: string;
  on: string;
  ink: string;
  bright: string;
  wash: string;
}

/**
 * Why the daily and tool games look alike on purpose.
 *
 * A Pick 3 is not a brand a player recognises by colour — it is a state's daily draw, and forty jurisdictions run
 * one. Giving each a saturated identity would put a dozen competing hues on a state page and make the flagship
 * games stop reading as special, which is the "visual noise from too many colours" the founder's own review
 * warns against. They get a low-chroma family instead, rotated by hue so a card is still distinguishable from
 * its neighbour, and the STATE carries the identity above them.
 */
export const QUIET_NOTE =
  "Daily and tool games share a low-chroma family: their identity comes from the state that runs them, not from " +
  "a national brand, and a dozen saturated hues on one page would drown the flagship games.";

/* ------------------------------------------------------------------ the themes */

const THEMES: readonly GameTheme[] = Object.freeze([
  /* ---- flagship ---- */
  {
    id: "powerball",
    label: "Powerball",
    emphasis: "flagship",
    status: "verified",
    rationale:
      "Powerball's identity is red, evidenced in this repository by the captured logo and the approved " +
      "`--ball-powerball-bg` token. The page accent is a clearer signal red than the ball, which must sit " +
      "under white numerals and is therefore darker.",
    accent: "#d21f28",
    on: "#ffffff",
    ink: "#c81e1e",
    bright: "#e02020",
    wash: "#fdecec",
  },
  {
    id: "mega-millions",
    label: "Mega Millions",
    emphasis: "flagship",
    status: "verified",
    rationale:
      "Mega Millions' identity is gold, evidenced by the captured logo and the approved `--ball-megaball-bg` " +
      "token. It is the one theme whose filled controls invert — navy on gold — because no gold bright enough " +
      "to read as Mega Millions can carry white text.",
    accent: "#f2a71b",
    on: "#14203a",
    ink: "#b35300",
    bright: "#ffc72c",
    wash: "#fef4e0",
  },

  /* ---- named jackpot games ---- */
  {
    id: "lotto-america",
    label: "Lotto America",
    emphasis: "brand",
    status: "provisional",
    rationale:
      "PROVISIONAL. Lotto America presents as a red-white-and-blue American mark, and blue is the half of that " +
      "which does not collide with Powerball. No operator brand guide is captured here, so the exact blue is a " +
      "placeholder.",
    accent: "#1d4ed8",
    on: "#ffffff",
    ink: "#1d4ed8",
    bright: "#5b8def",
    wash: "#e9effc",
  },
  {
    id: "cash4life",
    label: "Cash4Life",
    emphasis: "brand",
    status: "provisional",
    rationale:
      "PROVISIONAL. A green reads as money and is the furthest free hue from the flagship red and gold. Not " +
      "taken from an operator brand guide, and deliberately NOT the `--ball-cashball-bg` value.",
    accent: "#0a7a55",
    on: "#ffffff",
    ink: "#0a6a4a",
    bright: "#17a673",
    wash: "#e4f5ee",
  },
  {
    id: "lucky-for-life",
    label: "Lucky for Life",
    emphasis: "brand",
    status: "provisional",
    rationale:
      "PROVISIONAL. A violet, chosen for separation from the other multi-state games rather than from a brand " +
      "guide. Deliberately NOT #6d28d9 — that is the legacy `--ball-bonus-bg`, and a theme sharing a ball value " +
      "would make a drawn bonus ball move whenever this palette is edited.",
    accent: "#7c3aed",
    on: "#ffffff",
    ink: "#6b28d0",
    bright: "#a17cf0",
    wash: "#f0e9fd",
  },
  {
    id: "superlotto-plus",
    label: "SuperLotto Plus",
    emphasis: "brand",
    status: "provisional",
    rationale:
      "PROVISIONAL. A teal, chosen for separation. California's game, and no captured brand evidence exists in " +
      "this repository.",
    accent: "#0e7490",
    on: "#ffffff",
    ink: "#0e6f8a",
    bright: "#22a7c9",
    wash: "#e4f2f7",
  },
  {
    id: "florida-lotto",
    label: "Florida Lotto",
    emphasis: "brand",
    status: "provisional",
    rationale:
      "PROVISIONAL. The Florida Lottery mark is multi-coloured, so no single hue can be read off it honestly. A " +
      "magenta is used as a distinct placeholder.",
    accent: "#be185d",
    on: "#ffffff",
    ink: "#b81759",
    bright: "#e85490",
    wash: "#fce8f0",
  },
  {
    id: "jackpot-triple-play",
    label: "Jackpot Triple Play",
    emphasis: "brand",
    status: "provisional",
    rationale:
      "PROVISIONAL. A deep indigo, chosen for separation from Florida Lotto on the same state page. FGP-012 " +
      "deepened it: the first indigo (#4c4f7a) sat at the chroma of the QUIET family, so a named jackpot game " +
      "read as a daily draw, and it landed 10.0 ΔE from Pick 5 — a Florida game it shares a state page with. " +
      "This indigo is twice the chroma and 37 ΔE clear of Pick 5.",
    accent: "#3f3d99",
    on: "#ffffff",
    ink: "#3b3990",
    bright: "#8280d8",
    wash: "#eceafa",
  },

  /* ---- daily draw and tool games. See QUIET_NOTE. ---- */
  {
    id: "pick-2",
    label: "Pick 2",
    emphasis: "quiet",
    status: "provisional",
    rationale:
      `PROVISIONAL, quiet family. ${QUIET_NOTE} FGP-012 moved it off slate: the first Pick 2 (#475569) shared ` +
      "its wash AND its bright with DEFAULT_GAME_THEME verbatim and sat 8.6 ΔE from its accent, so a registered " +
      "game was indistinguishable from the unbranded fallback — and 5.2 ΔE from Pick 3, which a state page shows " +
      "beside it. The uniqueness test compares accents within GAME_THEMES only, so neither collision could fail " +
      "it. This olive keeps the family's low chroma and lightness and takes the empty hue between the browns and " +
      "the greens.",
    accent: "#5e5e31",
    on: "#ffffff",
    ink: "#57572d",
    bright: "#9c9c62",
    wash: "#f1f1e6",
  },
  {
    id: "pick-3",
    label: "Pick 3",
    emphasis: "quiet",
    status: "provisional",
    rationale: `PROVISIONAL, quiet family. ${QUIET_NOTE}`,
    accent: "#3f5a6b",
    on: "#ffffff",
    ink: "#3a5364",
    bright: "#7595a8",
    wash: "#edf2f5",
  },
  {
    id: "pick-4",
    label: "Pick 4",
    emphasis: "quiet",
    status: "provisional",
    rationale: `PROVISIONAL, quiet family. ${QUIET_NOTE}`,
    accent: "#4a6350",
    on: "#ffffff",
    ink: "#42594a",
    bright: "#7d9a84",
    wash: "#eef3ef",
  },
  {
    id: "pick-5",
    label: "Pick 5",
    emphasis: "quiet",
    status: "provisional",
    rationale: `PROVISIONAL, quiet family. ${QUIET_NOTE}`,
    accent: "#5d4a6b",
    on: "#ffffff",
    ink: "#564463",
    bright: "#8e78a0",
    wash: "#f1edf5",
  },
  {
    id: "fantasy-5",
    label: "Fantasy 5",
    emphasis: "quiet",
    status: "provisional",
    rationale: `PROVISIONAL, quiet family. ${QUIET_NOTE}`,
    accent: "#6b5140",
    on: "#ffffff",
    ink: "#634a3a",
    bright: "#a08573",
    wash: "#f4efeb",
  },
  {
    id: "cash-pop",
    label: "Cash Pop",
    emphasis: "quiet",
    status: "provisional",
    rationale: `PROVISIONAL, quiet family. ${QUIET_NOTE}`,
    accent: "#6b4550",
    on: "#ffffff",
    ink: "#63404a",
    bright: "#a3808a",
    wash: "#f4eef0",
  },
]);

/**
 * The theme a game gets when the registry has no entry for it.
 *
 * NOT an error state. Forty-odd jurisdictions run games this repository has never named, and a page for one of
 * them must render — quietly and legibly — rather than fall back to whatever colour happens to be inherited.
 * `gameTheme` returns `null` for an unknown slug so a caller can tell the difference; `resolveGameTheme` applies
 * this instead.
 */
export const DEFAULT_GAME_THEME: GameTheme = Object.freeze({
  id: "default",
  label: "Lottery game",
  emphasis: "quiet",
  status: "provisional",
  rationale:
    "The neutral fallback for a game with no registered identity. Deliberately the page's own text colour " +
    "family, so an unthemed game reads as unbranded rather than as some other game.",
  accent: "#334155",
  on: "#ffffff",
  ink: "#334155",
  bright: "#7c8ca6",
  wash: "#eef1f6",
});

/* ------------------------------------------------------------------ lookup */

export const GAME_THEMES: readonly GameTheme[] = THEMES;

const BY_ID = new Map(THEMES.map((t) => [t.id, t]));

/**
 * Display names that do not normalise onto their own slug.
 *
 * Home's jackpot table, upcoming rows, highlights and jackpot-history entries carry a game NAME and no slug, so
 * a name has to resolve to a theme. Most do so by lowercasing and hyphenating; these do not, and guessing is
 * exactly how "SuperLotto Plus (CA)" would end up unthemed on a page that themes everything else.
 */
const NAME_ALIASES: Record<string, string> = {
  "cash 4 life": "cash4life",
  "cash4 life": "cash4life",
  "superlotto plus (ca)": "superlotto-plus",
  "super lotto plus": "superlotto-plus",
  "florida lotto (fl)": "florida-lotto",
  "lucky for life": "lucky-for-life",
  "cashpop": "cash-pop",
};

/** Normalise a display name to a slug candidate. Mirrors `gameLogoByName`, so the two cannot disagree. */
function slugify(displayName: string): string {
  return displayName.trim().toLowerCase().replace(/\s+/g, "-");
}

/** The theme for a slug, or `null` when the registry has no entry. */
export function gameTheme(gameSlug: string): GameTheme | null {
  return BY_ID.get(gameSlug) ?? null;
}

/**
 * The theme for a display name.
 *
 * `null` rather than the default, so a caller that wants to KNOW whether a name is registered can find out —
 * which is what the "every Home game has a theme" test needs.
 */
export function gameThemeByName(displayName: string): GameTheme | null {
  const lower = displayName.trim().toLowerCase();
  const aliased = NAME_ALIASES[lower];
  if (aliased) return BY_ID.get(aliased) ?? null;
  return BY_ID.get(slugify(displayName)) ?? null;
}

/**
 * A theme for anything — slug or display name — always.
 *
 * The one function a component should call. It never returns `null`, so no component needs a fallback branch and
 * therefore no component can invent one.
 */
export function resolveGameTheme(slugOrName: string | null | undefined): GameTheme {
  if (!slugOrName) return DEFAULT_GAME_THEME;
  return gameTheme(slugOrName) ?? gameThemeByName(slugOrName) ?? DEFAULT_GAME_THEME;
}

/** Every provisional theme, for the founder-approval list. */
export function provisionalThemes(): readonly GameTheme[] {
  return THEMES.filter((t) => t.status === "provisional");
}

/* ------------------------------------------------------------------ applying a theme */

/**
 * The theme as CSS custom properties, ready for a `style` prop.
 *
 * This is the ONLY bridge between the registry and the DOM. A component sets these on a container and the
 * stylesheet's `var(--gt-*)` consumers pick them up, so the colours cascade to every descendant without a single
 * hex reaching a component or a per-game selector reaching the stylesheet.
 *
 * Typed as `CSSProperties` through a cast because React's type does not model custom properties. The cast is
 * confined to this function.
 */
export function gameThemeVars(theme: GameTheme): CSSProperties {
  return {
    "--gt-accent": theme.accent,
    "--gt-accent-on": theme.on,
    "--gt-accent-ink": theme.ink,
    "--gt-accent-bright": theme.bright,
    "--gt-accent-wash": theme.wash,
  } as CSSProperties;
}

/** `gameThemeVars` for a slug or name in one call, for the common case. */
export function gameThemeVarsFor(slugOrName: string | null | undefined): CSSProperties {
  return gameThemeVars(resolveGameTheme(slugOrName));
}
