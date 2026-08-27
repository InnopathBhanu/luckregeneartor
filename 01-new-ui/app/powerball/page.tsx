import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFlagshipRouteEnabled } from "@/lib/flagship/flagshipRouteAccess";
import { flagshipMetadata } from "@/lib/flagship/flagshipRouteMetadata";
import { buildFlagshipPageModel } from "@/lib/flagship/flagshipPageModel";
import FlagshipGamePage from "@/components/flagship/FlagshipGamePage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import { FLAGSHIP_ANCHORS } from "@/lib/flagship/flagshipContract";

/*
 * THE POWERBALL ROOT FLAGSHIP HUB — `/powerball` — LRG-FLAGSHIP-002, revised by FGP-007.
 *
 * THE ROUTE IS THE PRODUCTION ROUTE. `ROUTE-AUDIT-001` §1.1 row 7 measured `/powerball` live and indexed, and §6
 * classifies it **preserve, canonical self, no redirect**. BP-04A §8 preserves it. No `-new` path, no design-lab
 * path and no second canonical is introduced, and nothing here changes `/fl/powerball`.
 *
 * ══ FGP-007 REMOVED THE PREVIEW GATE ══
 *
 * This route previously required `LC_FLAGSHIP_GAME_PREVIEW=true` and 404'd without it. The site is now being
 * rebuilt locally and published as a whole later, so a per-page environment flag is no longer how it is held
 * back. The page renders locally with no environment variable.
 *
 * ONE CONDITION REMAINS, and it is deliberate: the slug must be in `flagshipRegistry`. `CLAUDE.md` §10 requires
 * route existence to come from an explicit registry rather than from a fixture, a feed record or a directory
 * listing, and removing the env flag does not relax that.
 *
 * ══ WHAT DID NOT CHANGE ══
 *
 * The page is still `noindex, nofollow`, still enters no sitemap, still emits no redirect, and still leaves the
 * commerce routes alone. Availability and indexability are separate decisions; only the first was in scope.
 */

const GAME_SLUG = "powerball";

export async function generateMetadata(): Promise<Metadata> {
  return flagshipMetadata(GAME_SLUG);
}

export default function PowerballFlagshipRoute() {
  /* An unregistered slug is not a page. With the env flag gone this is the only gate, so it stays explicit. */
  if (!isFlagshipRouteEnabled(GAME_SLUG)) notFound();

  const model = buildFlagshipPageModel(GAME_SLUG);
  /* A registered route whose model cannot be built is a configuration fault, not a page. */
  if (!model) notFound();

  /*
   * §A2 — the approved Global Shell chrome, on this route rather than the legacy `SiteHeader`.
   *
   * `layoutSuppliesMain` is now always false: the root layout stopped wrapping `children` in `<main>`, so this
   * page owns its one landmark and `#lcfg-main` is the skip-link target in every environment. The AI control
   * reaches FG-03, this page's own answer region — GS-06 is contextual, not a global chat button.
   */
  return (
    <>
      <GlobalShellChrome askAnchor={FLAGSHIP_ANCHORS.askAi} activePrimaryNav="Games" activeBottomNav="Results" />
      <FlagshipGamePage model={model} layoutSuppliesMain={false} />
    </>
  );
}
