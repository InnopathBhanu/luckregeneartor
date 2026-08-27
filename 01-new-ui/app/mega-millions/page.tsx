import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFlagshipRouteEnabled } from "@/lib/flagship/flagshipRouteAccess";
import { flagshipMetadata } from "@/lib/flagship/flagshipRouteMetadata";
import { buildFlagshipPageModel } from "@/lib/flagship/flagshipPageModel";
import FlagshipGamePage from "@/components/flagship/FlagshipGamePage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import { FLAGSHIP_ANCHORS } from "@/lib/flagship/flagshipContract";

/*
 * THE MEGA MILLIONS ROOT FLAGSHIP HUB — `/mega-millions` — LRG-FLAGSHIP-002, revised by FGP-007.
 *
 * Identical to `/powerball` except for one constant. That is the point of the shared system: the two pages differ
 * through `lib/flagship/flagshipGames.ts`, not through two templates. Everything specific to Mega Millions — the
 * 1–70 and 1–24 matrix, the Tuesday and Friday rhythm, the $5 play, the built-in per-ticket multiplier, the
 * absence of a secondary drawing, the April 2025 rule era, the U.S.-only selling jurisdictions, the amber accent,
 * the `Mega Millions` content tag and the ticket-multiplier calculator leading its toolkit — is configuration.
 *
 * `ROUTE-AUDIT-001` §1.1 row 7 measured `/mega-millions` live and indexed; §6 classifies it **preserve**.
 *
 * FGP-007 removed the `LC_FLAGSHIP_GAME_PREVIEW` gate, so the page renders locally with no environment variable.
 * The registry check remains as the single declared condition (`CLAUDE.md` §10). The page is still
 * `noindex, nofollow`, still enters no sitemap, and still creates no redirect.
 */

const GAME_SLUG = "mega-millions";

export async function generateMetadata(): Promise<Metadata> {
  return flagshipMetadata(GAME_SLUG);
}

export default function MegaMillionsFlagshipRoute() {
  if (!isFlagshipRouteEnabled(GAME_SLUG)) notFound();

  const model = buildFlagshipPageModel(GAME_SLUG);
  if (!model) notFound();

  /* §A2 — same shared chrome and same single landmark as `/powerball`. See that route for the reasoning. */
  return (
    <>
      <GlobalShellChrome askAnchor={FLAGSHIP_ANCHORS.askAi} activePrimaryNav="Games" activeBottomNav="Results" />
      <FlagshipGamePage model={model} layoutSuppliesMain={false} />
    </>
  );
}
