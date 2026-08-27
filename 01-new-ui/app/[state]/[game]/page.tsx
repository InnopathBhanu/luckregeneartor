import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { resolveGamePreview } from "@/lib/game/gamePreviewGuard";
import { gameConfigFor } from "@/lib/game/gameConfigRegistry";
import { buildGamePreviewModel } from "@/lib/game/gamePreviewModel";
import GamePreview from "@/components/game/preview/GamePreview";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import { SHARED_ASK_ANCHOR } from "@/lib/shell/globalShellModel";

/*
 * THE JURISDICTION GAME PAGE ROUTE — `/{state}/{game}` — LRG-GAME-049.
 *
 * THE ROUTE IS THE PRODUCTION ROUTE. `src/struts.xml` maps the wildcard action `*​/*` to `page=game` with
 * `selectedState={1}` and `gameNameUrl={2}`, so `/fl/powerball` is the live URL. BP-04B §1 preserves it. No
 * `-new` path, no design-lab path and no second canonical is introduced.
 *
 * ONE ROUTE-BOUNDARY DECISION. `resolveGamePreview` is read before anything else. It consults an explicit
 * registry pair — never a fixture, a file on disk or the feed (which carries Powerball for all 49 jurisdictions).
 *
 * Unregistered pairs still fail at the boundary: `notFound()` runs, with no metadata, canonical, schema or
 * markup leak.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; game: string }>;
}): Promise<Metadata> {
  const { state, game } = await params;
  if (!resolveGamePreview(state, game)) return {};

  const cfg = gameConfigFor(state, game);
  if (!cfg) return {};

  const canonical = canonicalUrl(cfg.seo.canonicalPath);
  return {
    /* `absolute` bypasses the root layout's title template — without it the rendered title carries two site
       suffixes, which the one-title rule forbids. */
    title: { absolute: cfg.seo.title },
    description: cfg.seo.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: cfg.seo.openGraph.title,
      description: cfg.seo.openGraph.description,
    },
    /* No approved Powerball brand image exists, so `summary` rather than a large-image card that would
       render broken. Recorded as an asset gap. */
    twitter: { card: "summary", title: cfg.seo.openGraph.title, description: cfg.seo.openGraph.description },
    /* Review content is never indexable. Switching this is the documented cutover, not this task. The
       self-referencing canonical above and this `noindex` COEXIST DELIBERATELY during pre-launch
       (FD-RTE Stage 1): the tag reaches no crawler while `noindex` stands. */
    robots: { index: false, follow: false },
  };
}

export default async function GameRoute({
  params,
}: {
  params: Promise<{ state: string; game: string }>;
}) {
  const { state, game } = await params;
  if (!resolveGamePreview(state, game)) notFound();

  const model = buildGamePreviewModel(state, game, true);
  /* A registered pair whose model cannot be built is a configuration fault, not a page. 404 rather than
     render a broken Game Page. */
  if (!model) notFound();

  /*
   * §A2 — the approved Global Shell chrome replaces the legacy `SiteHeader` on this route.
   *
   * `layoutSuppliesMain` is now always false: the root layout no longer wraps `children` in `<main>`, so this
   * page owns its one landmark and `#game-main` is the skip-link target in every environment. GS-06 targets the
   * shared answer surface this page renders (JO-04 / JG-M2's AI band), not a global chat button.
   */
  return (
    <>
      <GlobalShellChrome askAnchor={SHARED_ASK_ANCHOR} activePrimaryNav="Games" activeBottomNav="Results" />
      <GamePreview model={model} layoutSuppliesMain={false} />
    </>
  );
}
