/*
 * THE GAME PAGE CONFIGURATION CONTRACT — LRG-GAME-049.
 *
 * The same boundary the State configuration draws, applied to a game:
 *
 *   THIS JSON owns   jurisdiction and game identity, presentation labels, capability flags, static copy,
 *                    internal destinations, community starters and SEO copy.
 *   Runtime owns     the drawn numbers, the date, the jackpot, the cash value, the next draw, the
 *                    multiplier value, the secondary drawing, freshness and correction state.
 *   The contracts    own result shape, special-ball semantics, Power Play semantics, Double Play semantics,
 *                    Buy Now ordering and disclosure, publication gates and effective-date rules.
 *
 * `localFeatures` is the sharp end of that split. Each entry names a `sourceKey` — the governed field the
 * VALUE is read from at render time — and carries no value of its own. So a configuration can decide that
 * Florida's Powerball page should show a sales cutoff, and it still cannot decide what the cutoff is.
 */

/** Where a Game Page action goes. No external variant: an outbound content link is unexpressible. */
export type GameDestination =
  | { kind: "route"; href: string; label: string }
  | { kind: "inPage"; fragment: string; label: string };

export interface GameLocalFeature {
  key: string;
  label: string;
  /** The governed field supplying this feature's value at render time. Never a literal value. */
  sourceKey: string;
}

export interface GameCommunityStarter {
  key: string;
  title: string;
  excerpt: string;
  tags: string[];
  actionLabel: string;
}

/** One in-page navigation entry. Compact by design — the brief forbids eighteen equal pills. */
export interface GameNavEntry {
  label: string;
  fragment: string;
}

/** The three published editorial categories. `Winners` is deliberately not one of them. */
export type GameEditorialKind = "Guides" | "News" | "Blogs";

/** One body block of an article. Deliberately tiny: prose, a subheading, or a list. No raw HTML. */
export type GameArticleBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: readonly string[] };

/** A cited source for an article's factual claims. */
export interface GameArticleSource {
  title: string;
  url: string;
  accessed: string;
}

export interface GameEditorialItem {
  /** URL segment. Combined with `kind` to derive the route, so a link cannot point at nothing. */
  slug: string;
  kind: GameEditorialKind;
  title: string;
  summary: string;
  /** For a rule-change notice: the date the operator's change took effect. Never a publication date. */
  effectiveDate?: string;
  /** For an evergreen guide: the date its facts were last checked against the cited source. */
  reviewedDate?: string;
  body: readonly GameArticleBlock[];
  sources?: readonly GameArticleSource[];
}

/** One player-method module for JG-11. Facts come from the rule era; this carries only the framing. */
export interface GameMethodModule {
  key: string;
  title: string;
  summary: string;
  /** What the method does NOT guarantee. Required: BP-04B §22 forbids ranking methods by profitability. */
  limitation: string;
}

export interface GameViewConfig {
  schemaVersion: string;
  game: {
    stateCode: string;
    stateName: string;
    gameSlug: string;
    gameId: number;
    gameLabel: string;
    mode: "JG-M1" | "JG-M2" | "JG-M3";
    visualIdentity: string | null;
    isMultiState: boolean;
    timezoneLabel: string;
    /**
     * The State family this page renders, in `config/states/{code}.json` `presentation.families`.
     *
     * Optional, defaulting to `gameSlug`. Family composition — which member games exist, their variant labels
     * and their stable order — is owned there and NOT restated here, so Midday and Evening cannot drift
     * between the State page and this one.
     */
    familyId?: string;
    /** Rule-era registry key. Optional, defaulting to `gameSlug`. */
    ruleGameKey?: string;
  };
  preview: { enabled: boolean };
  capabilities: Readonly<Record<string, boolean>>;
  seo: {
    canonicalPath: string;
    title: string;
    description: string;
    breadcrumbLabel: string;
    openGraph: { type: string; title: string; description: string; imageKey: string | null };
  };
  copy: Record<string, string>;
  localFeatures: readonly GameLocalFeature[];
  community: readonly GameCommunityStarter[];
  destinations: Record<string, GameDestination>;
  trust: {
    summary: string;
    independence: string;
    /**
     * How this jurisdiction's result source is named in freshness copy — a CONFIGURED label, never an inferred
     * operator name (LRG-GAME-053).
     *
     * The model used to fall back to `` `${stateName} Lottery` ``, which fabricated an operator name for every
     * jurisdiction without a governed one. "California Lottery" happens to be right; the mechanism that produced
     * it was a string template, and the same template yields wrong names for jurisdictions whose operator is not
     * "<State> Lottery" — a territory, a consortium, or a state whose operator is a commission or corporation.
     *
     * Set this ONLY where the label has been verified for that game's source. Left unset, freshness copy uses
     * neutral LotteryCorner language, which is honest about what we can attribute.
     */
    resultSourceLabel?: string;
  };

  /* ---- JG-M2 only. Absent on a JG-M1 minimal offering, which has no eighteen-section composition. ---- */

  /** Compact in-page navigation (brief §6). */
  navigation?: readonly GameNavEntry[];
  /** JG-11 player-method modules. */
  methods?: readonly GameMethodModule[];
  /** JG-06 guide titles. Titles only — no destination, because no guide route exists (`FD-S-30`). */
  guides?: readonly string[];
  /** JG-18 methodology topics. Same rule: named, not linked, until the routes exist. */
  methodology?: readonly string[];
  /** JG-04 visible AI prompts. */
  aiPrompts?: readonly string[];
  /**
   * JG-15 editorial content — PUBLISHED items with real destinations.
   *
   * ══ WHY THIS SHAPE CHANGED ══
   *
   * The previous revision carried a *planned coverage* inventory with no date, no author and no destination,
   * because nothing was written. That produced a wall of "not yet published" cards — visually heavy and
   * useless to a reader or a crawler. This revision carries real articles instead: each one has a body, lives
   * at its own route, and is linked with a crawlable `href` derived from `kind` + `slug`.
   *
   * ══ WHAT IS STILL FORBIDDEN, AND WHY THE FIELDS ARE SHAPED THIS WAY ══
   *
   *   - **No `author`.** No byline exists, and inventing one is a claim about a person.
   *   - **No `publishedDate`.** LotteryCorner has not published these on a date, so there is no publication
   *     date to state. What exists instead is honest and specific: `effectiveDate` for a rule change (the date
   *     the OPERATOR's change took effect, from a cited source) and `reviewedDate` for an evergreen guide (the
   *     date its facts were last checked against the source). Both are real dates about real events.
   *   - **No `href`.** The destination is DERIVED from `kind` + `slug` in one place, so an article cannot be
   *     linked to a route that does not resolve.
   *   - **`Winners` is not an accepted kind.** A winner story needs a sourced article about a real person;
   *     none exists, so the category is absent rather than empty.
   */
  editorial?: readonly GameEditorialItem[];
}

export const SUPPORTED_GAME_SCHEMA_VERSION = "1.0";

class GameConfigError extends Error {
  constructor(path: string, field: string, problem: string) {
    super(`Game view configuration ${path}: "${field}" ${problem}`);
    this.name = "GameConfigError";
  }
}
const fail = (path: string, field: string, problem: string): never => {
  throw new GameConfigError(path, field, problem);
};

/**
 * Validate and return typed.
 *
 * Loud and structural, for the same reason the State validator is: this file is read at render time, so a
 * mistake in it surfaces as a missing module on a public page rather than as an error someone can act on.
 */
export function validateGameViewConfig(raw: unknown, path: string): GameViewConfig {
  if (!raw || typeof raw !== "object") fail(path, "<root>", "is not an object");
  const c = raw as Record<string, unknown>;

  if (c.schemaVersion !== SUPPORTED_GAME_SCHEMA_VERSION) {
    fail(path, "schemaVersion",
      `is "${String(c.schemaVersion)}" but this build supports only "${SUPPORTED_GAME_SCHEMA_VERSION}"`);
  }

  const g = c.game as GameViewConfig["game"] | undefined;
  if (!g) fail(path, "game", "is missing");
  if (!/^[a-z]{2}$/.test(g!.stateCode)) fail(path, "game.stateCode", "must be a two-letter lower-case code");
  if (!/^[a-z0-9-]+$/.test(g!.gameSlug)) fail(path, "game.gameSlug", "must be a lower-case slug");
  if (typeof g!.gameId !== "number") fail(path, "game.gameId", "must be the production game id");
  if (!g!.gameLabel) fail(path, "game.gameLabel", "is missing");
  if (!["JG-M1", "JG-M2", "JG-M3"].includes(g!.mode)) fail(path, "game.mode", "is not a BP-04B mode");
  if (!g!.timezoneLabel) fail(path, "game.timezoneLabel", "is missing");

  const prev = c.preview as GameViewConfig["preview"] | undefined;
  if (!prev || typeof prev.enabled !== "boolean") fail(path, "preview.enabled", "is missing or not a boolean");

  const caps = c.capabilities as Record<string, unknown> | undefined;
  if (!caps || typeof caps !== "object") fail(path, "capabilities", "is missing");
  for (const [k, v] of Object.entries(caps!)) {
    if (typeof v !== "boolean") fail(path, `capabilities.${k}`, "must be a boolean");
  }

  const seo = c.seo as GameViewConfig["seo"] | undefined;
  if (!seo) fail(path, "seo", "is missing");
  if (!seo!.title) fail(path, "seo.title", "is missing");
  if (!seo!.description) fail(path, "seo.description", "is missing");
  if (seo!.canonicalPath !== `/${g!.stateCode}/${g!.gameSlug}`) {
    fail(path, "seo.canonicalPath",
      `must be "/${g!.stateCode}/${g!.gameSlug}" — the governed route, not a second canonical`);
  }
  if (!seo!.breadcrumbLabel) fail(path, "seo.breadcrumbLabel", "is missing");
  if (!seo!.openGraph) fail(path, "seo.openGraph", "is missing");

  /* Local features name a source; they never carry the value. */
  const feats = c.localFeatures;
  if (!Array.isArray(feats)) fail(path, "localFeatures", "is missing or is not an array");
  const featKeys = new Set<string>();
  for (const f of feats as GameLocalFeature[]) {
    if (!f.key || !f.label || !f.sourceKey) fail(path, "localFeatures", "has an incomplete entry");
    if (featKeys.has(f.key)) fail(path, "localFeatures", `has the duplicate key "${f.key}"`);
    featKeys.add(f.key);
    if ("value" in (f as object)) {
      fail(path, `localFeatures[${f.key}]`, "must not carry a value — it names a governed source instead");
    }
  }

  /* Community starters are editorial prompts. Any social-proof field would make them look like activity. */
  const community = c.community;
  if (!Array.isArray(community)) fail(path, "community", "is missing or is not an array");
  for (const s of community as GameCommunityStarter[]) {
    if (!s.key || !s.title || !s.excerpt) fail(path, "community", "has an incomplete starter");
    for (const banned of ["author", "replies", "views", "likes", "avatar", "postedBy", "upvotes"]) {
      if (banned in (s as object)) fail(path, `community[${s.key}]`, `must not carry "${banned}"`);
    }
    if (!s.tags.includes("Discussion starter")) {
      fail(path, `community[${s.key}]`, "must be labelled with the \"Discussion starter\" tag");
    }
  }

  /* Destinations stay inside LotteryCorner. */
  const dests = (c.destinations ?? {}) as Record<string, GameDestination>;
  for (const [k, d] of Object.entries(dests)) {
    if (d.kind === "route") {
      if (!d.href.startsWith("/")) fail(path, `destinations.${k}`, "is not a LotteryCorner path");
      if (/^https?:/i.test(d.href)) fail(path, `destinations.${k}`, "must not be an external destination");
    } else if (d.kind === "inPage") {
      if (!d.fragment) fail(path, `destinations.${k}`, "has no fragment");
    } else {
      fail(path, `destinations.${k}`, "declares an unknown destination kind");
    }
    if (!d.label) fail(path, `destinations.${k}`, "has no label");
  }

  /*
   * NO RUNTIME RESULT DATA, and no prediction language. Both checked structurally over the whole file, so
   * neither can be reintroduced by an edit that looks like copy.
   */
  const flat = JSON.stringify(c);
  for (const banned of ["winningNumbers", "drawDateIso", "jackpotAmount", "cashValue", "nextPrize",
                        "resultDate", "lastUpdatedIso", "currentStatus", "powerPlayValue"]) {
    if (flat.includes(banned)) {
      fail(path, banned, "is runtime result data and must not be frozen into configuration");
    }
  }
  for (const banned of [/increase (your )?(odds|chances)/i, /better (odds|chances)/i, /\bhot numbers?\b/i,
                        /\bdue to (hit|win)\b/i, /lucky numbers? (for|that)/i, /best numbers/i,
                        /smart pick/i, /predict/i, /guaranteed/i, /coming soon/i]) {
    if (banned.test(flat)) fail(path, "copy", `must not contain prediction or urgency language (${banned})`);
  }

  const trust = c.trust as GameViewConfig["trust"] | undefined;
  if (!trust?.summary || !trust?.independence) fail(path, "trust", "is incomplete");

  /*
   * JG-M2 requirements.
   *
   * A full state-native game owns eighteen sections, and several of them have nothing to render without
   * editorial configuration. Requiring these HERE — at module load — means a half-configured JG-M2 game fails
   * the build rather than rendering a page with empty sections that look like a data outage.
   */
  if (g!.mode === "JG-M2") {
    const nav = c.navigation as GameNavEntry[] | undefined;
    if (!Array.isArray(nav) || nav.length === 0) {
      fail(path, "navigation", "is required on a JG-M2 game and must not be empty");
    }
    const seenFragments = new Set<string>();
    for (const n of nav!) {
      if (!n.label || !n.fragment) fail(path, "navigation", "has an incomplete entry");
      if (!n.fragment.startsWith("#")) fail(path, `navigation.${n.label}`, "must be an in-page fragment");
      if (seenFragments.has(n.fragment)) fail(path, "navigation", `repeats the fragment "${n.fragment}"`);
      seenFragments.add(n.fragment);
    }
    const methods = c.methods as GameMethodModule[] | undefined;
    if (!Array.isArray(methods) || methods.length === 0) {
      fail(path, "methods", "is required on a JG-M2 game (JG-11)");
    }
    for (const m of methods!) {
      if (!m.key || !m.title || !m.summary) fail(path, "methods", "has an incomplete module");
      /* BP-04B §22: a method must state what it does not guarantee, or the page is implicitly endorsing it. */
      if (!m.limitation) fail(path, `methods[${m.key}]`, "must state what the method does not guarantee");
    }
    /*
     * Editorial articles.
     *
     * Every item must be a real article: a slug that resolves to a route, and a body with something in it. An
     * item with no body would render as a link to an empty page, which is the "not yet published" card in a
     * more convincing disguise.
     */
    const editorial = c.editorial as GameViewConfig["editorial"] | undefined;
    if (editorial !== undefined) {
      if (!Array.isArray(editorial)) fail(path, "editorial", "is not an array");
      const seen = new Set<string>();
      for (const e of editorial) {
        if (!e.slug || !e.title || !e.summary) fail(path, "editorial", "has an incomplete item");
        if (!/^[a-z0-9-]+$/.test(e.slug)) fail(path, `editorial[${e.slug}]`, "slug must be a lower-case URL segment");
        if (seen.has(`${e.kind}/${e.slug}`)) fail(path, "editorial", `has the duplicate route "${e.kind}/${e.slug}"`);
        seen.add(`${e.kind}/${e.slug}`);
        if (!["Guides", "News", "Blogs"].includes(e.kind)) {
          fail(path, `editorial[${e.slug}]`,
            "declares an unknown content type. \"Winners\" is not accepted: a winner story needs a sourced article about a real person");
        }
        if (!Array.isArray(e.body) || e.body.length === 0) {
          fail(path, `editorial[${e.slug}]`, "has no body — a linked article must have content");
        }
        for (const b of e.body) {
          if (b.kind === "ul") {
            if (!Array.isArray(b.items) || b.items.length === 0) fail(path, `editorial[${e.slug}]`, "has an empty list block");
          } else if (!b.text) {
            fail(path, `editorial[${e.slug}]`, "has an empty text block");
          }
        }
        /* A rule-change notice states when the change took effect; both dates are optional but never invented. */
        for (const d of [e.effectiveDate, e.reviewedDate]) {
          if (d !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            fail(path, `editorial[${e.slug}]`, "carries a date that is not an ISO calendar date");
          }
        }
        /* A dated factual claim about the operator needs a citation. */
        if (e.effectiveDate && (!e.sources || e.sources.length === 0)) {
          fail(path, `editorial[${e.slug}]`, "states an effective date without citing a source");
        }
        for (const banned of ["publishedDate", "publishedAt", "author", "byline", "href", "url", "views", "likes"]) {
          if (banned in (e as object)) {
            fail(path, `editorial[${e.slug}]`,
              `must not carry "${banned}" — a byline, a publication date or a hand-written destination would each be invented`);
          }
        }
      }
    }

    for (const [field, min] of [["guides", 1], ["methodology", 1], ["aiPrompts", 1]] as const) {
      const v = c[field];
      if (!Array.isArray(v) || v.length < min) {
        fail(path, field, `is required on a JG-M2 game and needs at least ${min} entry`);
      }
      for (const s of v as unknown[]) {
        if (typeof s !== "string" || s.length === 0) fail(path, field, "must contain non-empty strings");
      }
    }
  }

  return c as unknown as GameViewConfig;
}

/** The one reader of `capabilities`. An unknown or absent key is FALSE, never permission. */
export function gameCapability(cfg: GameViewConfig, key: string): boolean {
  return cfg.capabilities[key] === true;
}
