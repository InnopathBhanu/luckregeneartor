/*
 * ROUTE METADATA FOR THE TOOLS FAMILY — BP-05C §22 (search identity) and §24 (Open Graph). LRG-TOOLS-001.
 *
 * ══ AVAILABLE IS NOT INDEXABLE ══
 *
 * Both routes are `robots: { index: false, follow: false }` per `PUBLICATION_SAFETY` (`FD-GATE-01`) — and for
 * the Tax Calculator the noindex is ALSO the Conflict 42 interim posture: production still serves the indexed
 * legacy `/lottery-tax-calculator`, and emitting an indexable competitor before the launch redirect map would
 * split one intent across two URLs. The canonical and the noindex coexist deliberately pre-launch.
 *
 * ══ §24: THE OG PREVIEW IS EVERGREEN ══
 *
 * The Open Graph description never carries an entered amount, a computed net or any personal tax scenario —
 * BP-05C §24 forbids publishing a personal tax scenario outright. These functions take NO scenario input, so
 * the rule is structural: there is nothing a caller could pass that would leak into a preview.
 *
 * ══ §7: CONTEXT TRANSFER NEVER MOVES THE CANONICAL ══
 *
 * `?game=powerball` is UI context. The canonical stays the bare standalone URL — `taxCalculatorMetadata()`
 * deliberately has no parameters, so a query variant cannot mint a second canonical.
 */

import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { TAX_CALCULATOR_PATH, TOOLS_HUB_PATH } from "./toolManifest";
import { EFFECTIVE_TAX_YEAR } from "./taxTables2026";

const NOINDEX = { index: false, follow: false } as const;

export const TOOLS_HUB_TITLE = "Lottery Tools — Calculators, Checkers and Analysis | LotteryCorner";
export const TOOLS_HUB_DESCRIPTION =
  "Free lottery tools: the after-tax prize calculator, number checkers, past-draw search, statistics and "
  + "generators — each one showing where it runs and what it needs.";

export const TAX_CALCULATOR_TITLE = "Lottery Tax Calculator — Estimated Taxes on a Jackpot | LotteryCorner";
export const TAX_CALCULATOR_DESCRIPTION =
  `Estimate what a lottery prize is worth after taxes: cash and annuity side by side, ${EFFECTIVE_TAX_YEAR} `
  + "federal marginal rates, your state's published rate, and a 30-year annuity schedule. Estimates only, "
  + "with every assumption stated.";

export function toolsHubMetadata(): Metadata {
  const canonical = canonicalUrl(TOOLS_HUB_PATH);
  return {
    title: { absolute: TOOLS_HUB_TITLE },
    description: TOOLS_HUB_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: TOOLS_HUB_TITLE,
      description: TOOLS_HUB_DESCRIPTION,
    },
    twitter: { card: "summary", title: TOOLS_HUB_TITLE, description: TOOLS_HUB_DESCRIPTION },
    robots: NOINDEX,
  };
}

export function taxCalculatorMetadata(): Metadata {
  const canonical = canonicalUrl(TAX_CALCULATOR_PATH);
  return {
    title: { absolute: TAX_CALCULATOR_TITLE },
    description: TAX_CALCULATOR_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      /* Evergreen tool preview (§24): what the tool IS, never what a reader typed into it. */
      type: "website",
      url: canonical,
      siteName: "LotteryCorner",
      title: TAX_CALCULATOR_TITLE,
      description: TAX_CALCULATOR_DESCRIPTION,
    },
    twitter: { card: "summary", title: TAX_CALCULATOR_TITLE, description: TAX_CALCULATOR_DESCRIPTION },
    robots: NOINDEX,
  };
}
