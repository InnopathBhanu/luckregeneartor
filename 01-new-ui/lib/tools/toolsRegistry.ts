/*
 * THE TOOLS ROUTE REGISTRY — the "tools" page family's half of `FD-GATE-01` registry-only gating.
 *
 * Authority: `FD-GATE-01` (registry-only gating; no environment reads), `CLAUDE.md` §10 (routes come from an
 * explicit registry), BP-05C §5 (the standalone `/tools/*` route model) and **Conflict 42**
 * (`source-conflicts.md`): the Tax Calculator is built at the BLUEPRINT route `/tools/tax-calculator`,
 * noindex, while production still serves the indexed legacy page `/lottery-tax-calculator`. The
 * consolidation — redirect direction and timing — is a launch-redirect-map decision requiring the full
 * `CLAUDE.md` §10 route-change package. NOTHING REDIRECTS TODAY, and no `/lottery-tax-calculator` route
 * exists in this application.
 *
 * ══ TWO ROUTES, BOTH ENUMERATED ══
 *
 * BP-05C §5 lists eight conceptual standalone tools. Exactly one is built, so exactly two routes exist: the
 * hub and the Tax Calculator. The other §5 routes are NOT rows here — a registry row without a page would be
 * `FD-DAT-17`'s dead placeholder in a different costume. Adding a tool is a page AND a row, one review.
 */

import { TAX_CALCULATOR_PATH, TOOLS_HUB_PATH } from "./toolManifest";

export interface ToolsRegistryEntry {
  route: string;
  enabled: boolean;
  /** The approved document the served composition conforms to. */
  blueprint: "BP-05C";
  note: string;
}

export const TOOLS_REGISTRY: readonly ToolsRegistryEntry[] = Object.freeze([
  {
    route: TOOLS_HUB_PATH,
    enabled: true,
    blueprint: "BP-05C",
    note:
      "The public tools catalog (BP-05C §3–§4), listing only genuinely available tools — no dead links, no "
      + "'coming soon' (FD-DAT-17). noindex always until the family's launch task; never in a sitemap "
      + "(PUBLICATION_SAFETY).",
  },
  {
    route: TAX_CALCULATOR_PATH,
    enabled: true,
    blueprint: "BP-05C",
    note:
      "The Lottery Tax Calculator at the blueprint route per the Conflict 42 interim founder instruction. "
      + "noindex until the launch redirect map settles the /lottery-tax-calculator consolidation; never in a "
      + "sitemap until then (PUBLICATION_SAFETY).",
  },
]);

/** Does this build serve this tools-family route? The `servesPage("tools", …)` delegate. */
export function isToolsRouteServed(route: string): boolean {
  return TOOLS_REGISTRY.some((e) => e.enabled && e.route === route);
}

/** Every tools-family route this build serves, for the FD-GATE-01 route inventory. */
export function toolsRoutePaths(): { route: string; blueprint: "BP-05C" }[] {
  return TOOLS_REGISTRY.filter((e) => e.enabled).map((e) => ({ route: e.route, blueprint: e.blueprint }));
}
