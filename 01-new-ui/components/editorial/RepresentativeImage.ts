/*
 * THE REPRESENTATIVE ARTICLE IMAGE — one component for News and Blog. LRG-UX-SCHEMA-002 §3.
 *
 * ══ WHAT WAS WRONG ══
 *
 * `representativeImage` was added to `NewsArticleRecord` and `BlogPostRecord` as the typed seam that lets
 * `NewsArticle.image` / `BlogPosting.image` be emitted honestly. The schema builders consumed it. **Nothing
 * rendered it.** So the seam, had a record ever used it, would have described an image the page did not show —
 * the same structured-data-policy violation as the `/logo.png` fallback it replaced, reached by a different
 * route. The tests missed it because they fabricated an asset, handed it to the schema builder, and asserted
 * the builder's own output; no test ever asked what the page contained.
 *
 * ══ THE INVARIANT ══
 *
 * This component and `articleImageField` both gate on `isRenderableArticleImage`. Neither decides alone:
 *
 *   asset absent or invalid  →  no `<figure>`, and no `image` in schema
 *   asset valid              →  both, built from the same fields
 *
 * That is what makes "schema matches visible content" a property of the code rather than a convention someone
 * has to remember on each new record.
 *
 * ══ WHY THIS FILE IS `.ts` AND USES `createElement` ══
 *
 * Because §3 also requires a component-level SERVER-RENDERING test, and the test runner is Node's own type
 * stripping with a resolve-only hook (`tests/ts-resolve-hooks.mjs`, zero dependencies by design). Node cannot
 * parse JSX — `stripTypeScriptTypes` rejects it with `ERR_INVALID_TYPESCRIPT_SYNTAX` — so a `.tsx` component
 * cannot be imported by a test without adding a transpiler, which this task forbids.
 *
 * The alternatives were worse: a `.tsx` component with no test (the defect being corrected is precisely an
 * untested render path), or a `.ts` core with a `.tsx` wrapper (indirection that leaves the wrapper untested).
 * The element tree here is four nodes deep at most, so `createElement` stays legible.
 *
 * ══ NO LAYOUT SHIFT, NO INVENTED PIXELS ══
 *
 * `width`/`height` are the asset's real intrinsic dimensions, set as HTML attributes so the browser reserves
 * the correct box on the first layout pass. CSS keeps it fluid (`max-width:100%`, `height:auto`) without
 * discarding the aspect ratio those attributes establish.
 *
 * A plain `<img>` rather than `next/image`: `next/image` rewrites the URL through the optimiser, so the file
 * schema names and the file the page requests would stop being the same file — the one property this component
 * exists to guarantee.
 */

import { createElement } from "react";
import type { ArticleImageAsset } from "@/lib/seo/articleImage";
import { isRenderableArticleImage } from "@/lib/seo/articleImage";

export default function RepresentativeImage({
  asset,
  className,
}: {
  asset: ArticleImageAsset | null | undefined;
  /** Family-specific wrapper class (`lcn-figure` for News, `lcb-figure` for Blog). */
  className?: string;
}) {
  /* The same gate schema uses. An invalid asset yields nothing here and nothing there. */
  if (!isRenderableArticleImage(asset)) return null;

  return createElement(
    "figure",
    {
      className: className ? `lce-figure ${className}` : "lce-figure",
      "data-representative-image": "true",
    },
    createElement("img", {
      className: "lce-figure__img",
      src: asset.url,
      width: asset.width,
      height: asset.height,
      alt: asset.alt,
      loading: "lazy",
      decoding: "async",
    }),
    asset.caption
      ? createElement("figcaption", { className: "lce-figure__caption" }, asset.caption)
      : null,
  );
}
