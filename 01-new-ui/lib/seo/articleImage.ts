/*
 * ARTICLE IMAGERY IN STRUCTURED DATA — LRG-UX-SCHEMA-001 correction 3.
 *
 * ══ WHAT WAS WRONG ══
 *
 * `NewsArticle.image` and `BlogPosting.image` both carried `/logo.png` — the site's own wordmark — on every
 * article and every post. The reasoning recorded at the time was defensible on its face: 07B §15 lists `image`
 * as a required field, 07B §18 forbids fabricating documentary imagery, and the logo is the one image the
 * organization genuinely owns. So rather than invent a photo, the field carried the logo.
 *
 * That reasoning answers the wrong question. `Article.image` is not "an image the publisher owns" — Google's
 * article structured-data guidance is that it is the image REPRESENTING THE ARTICLE, and its structured-data
 * policies require markup to describe the page's actual visible content. A wordmark represents the publisher on
 * every article equally, which is another way of saying it represents none of them. Emitting it made a
 * truthfulness claim the page could not support, and it made it identically 19 times.
 *
 * ══ THE RULE ══
 *
 * Omit `image` unless a typed, relevant asset exists AND the article visibly shows it. Omission is honest;
 * a stand-in is not. `image` is required by 07B §15 and absent by this module — that disagreement is real and
 * recorded as Conflict 44 rather than reconciled silently (`CLAUDE.md` §2).
 *
 * No asset exists in this repository today, so `articleImageField` returns `{}` for every current record. The
 * type below is the seam that makes adding one a data change rather than a schema change — and `alt` is
 * required by the type because an image a page shows without an accessible name is not one this codebase emits.
 */

/**
 * A representative article image the page genuinely renders.
 *
 * `width`/`height` are the asset's real intrinsic pixels — Google's article guidance wants the dimensions of
 * the image it will actually fetch, and a guessed pair is a claim about a file nobody measured.
 */
export interface ArticleImageAsset {
  /** Absolute or origin-relative path to an asset that exists in `public/`. */
  url: string;
  width: number;
  height: number;
  /** The accessible name the article renders with the image. Required — see the header note. */
  alt: string;
  caption?: string;
}

/**
 * Whether an asset may be rendered AND described — LRG-UX-SCHEMA-002 §3.
 *
 * ══ WHY ONE PREDICATE SERVES BOTH ══
 *
 * The visible component and the schema builder ask this same function. That is the whole mechanism by which
 * "schema matches visible content" stops being a convention somebody has to remember: a malformed asset is
 * withheld from both, and a valid one appears in both, because neither side decides on its own.
 *
 * Each condition rejects a specific way an `image` claim goes wrong:
 *
 *   url         A `javascript:` or `data:` URL is not a fetchable image, and an off-origin `http://` one is a
 *               claim about a host this site does not control. Absolute HTTPS, or origin-relative.
 *   width/height  Google's article guidance uses the dimensions to decide how to present the image. A zero,
 *               a fraction or a NaN is not a measurement — and unmeasured dimensions are how a layout-shift
 *               reservation ends up wrong.
 *   alt         An image the page shows with no accessible name fails WCAG 1.1.1. Since this is the ONE type
 *               that reaches both markup and schema, refusing it here refuses it everywhere.
 */
export function isRenderableArticleImage(
  asset: ArticleImageAsset | null | undefined,
): asset is ArticleImageAsset {
  if (!asset) return false;
  const { url, width, height, alt } = asset;
  if (typeof url !== "string" || url.length === 0) return false;
  const originRelative = url.startsWith("/") && !url.startsWith("//");
  if (!originRelative && !url.startsWith("https://")) return false;
  for (const n of [width, height]) {
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return false;
  }
  return typeof alt === "string" && alt.trim().length > 0;
}

/** The absolute URL schema emits for an asset — the same file the `<img>` requests. */
export function articleImageUrl(asset: ArticleImageAsset, origin: string): string {
  return asset.url.startsWith("https://") ? asset.url : `${origin}${asset.url}`;
}

/**
 * The `image` field for an article graph, or nothing at all.
 *
 * Spread into the node: `...articleImageField(record.representativeImage)`. Returning an EMPTY OBJECT rather
 * than `image: null` matters — a null-valued property is still a property, and a consumer reading it learns
 * that this article has no image rather than that this publisher does not make the claim.
 *
 * An asset that fails `isRenderableArticleImage` is withheld here as well as from the markup, so schema can
 * never describe an image the page declined to show.
 */
export function articleImageField(
  asset: ArticleImageAsset | null | undefined,
  origin: string,
): Record<string, unknown> {
  if (!isRenderableArticleImage(asset)) return {};
  return {
    image: [
      {
        "@type": "ImageObject",
        url: articleImageUrl(asset, origin),
        width: asset.width,
        height: asset.height,
        ...(asset.caption ? { caption: asset.caption } : {}),
      },
    ],
  };
}
