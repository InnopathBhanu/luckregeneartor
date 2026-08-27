/*
 * EDITORIAL ROUTING AND GROUPING — LRG-GAME-051.
 *
 * Authority: the 2026-08-04 revision direction (*"Create separate, visible sections … real crawlable `<a href>`
 * links … Full guides and articles belong on their own routes. The Game Page is their visible content hub."*),
 * `FD-S-30` (route existence is declared, never derived), `CLAUDE.md` §10.
 *
 * ══ ONE PLACE DERIVES A DESTINATION ══
 *
 * `articleHref` is the only function that builds an article URL, and `findArticle` is the only function that
 * resolves one back. Both read the same configuration array, so a link on the Game Page and the route it points
 * at cannot disagree: if `findArticle` cannot resolve it, `articleHref` never produced it.
 *
 * That is what makes the crawlable-link requirement safe to satisfy. The previous revision rendered unlinked
 * "not yet published" cards precisely because it had no way to guarantee a destination resolved; deriving both
 * directions from one declared list removes the need to guess.
 *
 * ══ WHY THE SECTION SEGMENT IS PART OF THE PATH ══
 *
 * `/{state}/{game}/{section}/{slug}` sits two segments below the game, which keeps it clear of the legacy
 * `/{state}/{game}/{year}` archive pattern — one segment below. That archive route is not implemented, and this
 * shape means introducing it later cannot collide with an article URL.
 */

import type { GameEditorialItem, GameEditorialKind, GameViewConfig } from "./gameViewConfig";

/** The three published categories, in the order the Game Page presents them. */
export const EDITORIAL_KINDS: readonly GameEditorialKind[] = Object.freeze(["Guides", "News", "Blogs"]);

/** URL segment for each category. Lower-case and stable; the display label lives in the section heading. */
const SEGMENT: Record<GameEditorialKind, string> = {
  Guides: "guides",
  News: "news",
  Blogs: "blog",
};

/** Reverse map, so a request segment resolves to a category without a second declaration. */
const KIND_BY_SEGMENT: Record<string, GameEditorialKind> = Object.fromEntries(
  EDITORIAL_KINDS.map((k) => [SEGMENT[k], k]),
);

export function editorialSegment(kind: GameEditorialKind): string {
  return SEGMENT[kind];
}

export function kindForSegment(segment: string): GameEditorialKind | undefined {
  return KIND_BY_SEGMENT[segment.toLowerCase()];
}

/** The one place an article URL is built. */
export function articleHref(stateCode: string, gameSlug: string, item: GameEditorialItem): string {
  return `/${stateCode}/${gameSlug}/${SEGMENT[item.kind]}/${item.slug}`;
}

/**
 * The one place an article URL is resolved.
 *
 * Returns `undefined` for any segment/slug pair the configuration does not declare, so the route 404s rather
 * than rendering an empty article shell.
 */
export function findArticle(
  config: GameViewConfig,
  segment: string,
  slug: string,
): GameEditorialItem | undefined {
  const kind = kindForSegment(segment);
  if (!kind) return undefined;
  return (config.editorial ?? []).find((e) => e.kind === kind && e.slug === slug.toLowerCase());
}

export interface EditorialSection {
  kind: GameEditorialKind;
  /** Reader-facing heading, supplied by configuration so a game can name its own sections. */
  heading: string;
  intro: string;
  items: readonly (GameEditorialItem & { href: string })[];
}

/**
 * Group the configured articles into the three visible sections.
 *
 * A category with no articles is **omitted entirely** rather than rendered empty — the direction is explicit
 * that empty cards must not appear, and it is why `Winners` has no section at all.
 *
 * `limit` caps what the hub shows per section. The hub is a shortlist that routes onward, not an index.
 */
export function editorialSections(
  config: GameViewConfig,
  opts: { limit?: number } = {},
): EditorialSection[] {
  const limit = opts.limit ?? 3;
  const stateCode = config.game.stateCode;
  const gameSlug = config.game.gameSlug;

  return EDITORIAL_KINDS.map((kind) => {
    const items = (config.editorial ?? [])
      .filter((e) => e.kind === kind)
      /* Newest-dated first where a date exists, so a rule change surfaces above an older one. Items with no
         date keep their configured order behind those that have one. */
      .sort((a, b) => (b.effectiveDate ?? "").localeCompare(a.effectiveDate ?? ""))
      .slice(0, limit)
      .map((e) => ({ ...e, href: articleHref(stateCode, gameSlug, e) }));

    return {
      kind,
      heading: config.copy[`jg15${kind}Heading`] ?? kind,
      intro: config.copy[`jg15${kind}Intro`] ?? "",
      items,
    };
  }).filter((s) => s.items.length > 0);
}

/** Every declared article route for a game, for tests and for the route registry. */
export function articleRoutes(config: GameViewConfig): { segment: string; slug: string; href: string }[] {
  return (config.editorial ?? []).map((e) => ({
    segment: SEGMENT[e.kind],
    slug: e.slug,
    href: articleHref(config.game.stateCode, config.game.gameSlug, e),
  }));
}

/**
 * The date a reader should see, and what it means.
 *
 * Never "published": LotteryCorner has not published these on a date. A rule-change notice states when the
 * OPERATOR's change took effect; an evergreen guide states when its facts were last checked. Both are real
 * dates about real events, and the label says which one it is.
 */
export function articleDateLine(item: GameEditorialItem): { label: string; iso: string } | null {
  if (item.effectiveDate) return { label: "Effective", iso: item.effectiveDate };
  if (item.reviewedDate) return { label: "Facts checked", iso: item.reviewedDate };
  return null;
}
