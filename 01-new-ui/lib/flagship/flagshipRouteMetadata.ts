/*
 * ROUTE METADATA FOR THE FLAGSHIP HUBS — LRG-FLAGSHIP-002, revised by FGP-007.
 *
 * Authority: BP-04A §36 (the two exact search-identity titles), §38 (Open Graph: evergreen game identity, no
 * IP-personalised buy claim, canonical root URL), `CLAUDE.md` §11.
 *
 * ══ FGP-007: AVAILABLE IS NOT INDEXABLE ══
 *
 * The `LC_FLAGSHIP_GAME_PREVIEW` gate is gone and both routes now render locally without an environment variable.
 * **The indexing posture is unchanged**, deliberately, and on the task's own instruction: *"If unsure, preserve
 * noindex and report the decision needed."*
 *
 * Preserving it is also what the surrounding policy requires. `CLAUDE.md` §11 makes canonical host and
 * trailing-slash changes an explicit migration approval. `source-conflicts.md` Conflict 26 records that
 * production currently emits no canonical tag on any page, so nothing here may start competing with it.
 * `lib/seo/sitemapEntries.ts` documents sitemap activation as a one-condition cutover that stays shut until a
 * template is cut over to `index, follow`. Making these two pages indexable IS that cutover for this page family,
 * and it is a founder decision — not a side effect of removing a local preview flag.
 *
 * ══ WHAT THIS EMITS, AND WHAT IT REFUSES TO ══
 *
 *   - **`robots: { index: false, follow: false }`, unconditionally.** Unchanged by FGP-007.
 *   - **A page-local canonical**, built by `canonicalUrl` from the governed origin — the ratified `www`
 *     no-trailing-slash form (`FD-RTE-02`/`03`, implemented by FD-RTE Stage 1). It is page-local by
 *     construction: no host redirect, no trailing-slash rule and no sitemap entry is created, and because the
 *     page is `noindex, nofollow` no canonical signal reaches a crawler at all — the canonical and `noindex`
 *     COEXIST DELIBERATELY during pre-launch.
 *   - **No `openGraph.images`.** No approved evergreen flagship social image exists in `public/`, and a broken
 *     `summary_large_image` card is worse than a `summary` one. Recorded as an asset gap.
 *   - **No `alternates.languages`, no `verification`, no `other` meta.** None is governed for this page family.
 *
 * For an UNREGISTERED slug `flagshipMetadata` returns `{}` — no title, description, canonical or Open Graph — so
 * nothing leaks into the document head before the route's own `notFound()` runs.
 */

import type { Metadata } from "next";
import { isFlagshipRouteEnabled } from "./flagshipRouteAccess";
import { flagshipGameConfig } from "./flagshipGames";
import { canonicalUrl } from "@/lib/seo/productionOrigin";

export function flagshipMetadata(gameSlug: string): Metadata {
  if (!isFlagshipRouteEnabled(gameSlug)) return {};
  const config = flagshipGameConfig(gameSlug);
  if (!config) return {};

  const canonical = canonicalUrl(config.canonicalPath);

  return {
    /* `absolute` bypasses the root layout's title template — without it the rendered title carries two site
       suffixes, which the one-title rule forbids. BP-04A §36 fixes these titles exactly. */
    title: { absolute: config.seo.title },
    description: config.seo.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: config.seo.title,
      description: config.seo.description,
    },
    twitter: { card: "summary", title: config.seo.title, description: config.seo.description },
    robots: { index: false, follow: false },
  };
}
