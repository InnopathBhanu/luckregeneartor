import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { toolsHubMetadata } from "@/lib/tools/toolsRouteMetadata";
import ToolsHubPage from "@/components/tools/ToolsHubPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE TOOLS HUB ROUTE — `/tools`, per BP-05C (Final approved and frozen) §5. `ROUTE-AUDIT-001` lists
 * `/tools` among the approved page-family routes `CLAUDE.md` §10 preserves.
 *
 * The gate is the registry and nothing else (`FD-GATE-01`): `servesPage("tools", "/tools")` reads
 * `lib/tools/toolsRegistry.ts`, no environment variable exists, and the page is `noindex, nofollow` and in
 * no sitemap (`PUBLICATION_SAFETY`) until a launch task says otherwise.
 */

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("tools", "/tools")) return {};
  return toolsHubMetadata();
}

export default async function ToolsHubRoute() {
  if (!servesPage("tools", "/tools")) notFound();

  return (
    <>
      {/* §A2 — the approved Global Shell chrome. The hub has no answer surface, so GS-06 stays a labelled
          unavailable affordance rather than a control that pretends to work (CLAUDE.md §9). */}
      <GlobalShellChrome askAnchor={null} activePrimaryNav="Tools" />
      <ToolsHubPage />
    </>
  );
}
