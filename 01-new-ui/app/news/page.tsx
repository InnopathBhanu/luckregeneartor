import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildNewsHubModel } from "@/lib/news/newsHubModel";
import { newsHubMetadata } from "@/lib/news/newsRouteMetadata";
import NewsHubPage from "@/components/news/NewsHubPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE NEWS HUB ROUTE — `/news`, per 07A (Final approved and frozen) and 07 §21's URL contract.
 *
 * `ROUTE-AUDIT-001` lists `/news` among the approved page-family routes `CLAUDE.md` §10 preserves. The gate is
 * the registry and nothing else (`FD-GATE-01`): `servesPage("news", "/news")` reads `lib/news/newsRegistry.ts`,
 * no environment variable exists, and the page is `noindex, nofollow` and in no sitemap (`PUBLICATION_SAFETY`)
 * until a launch task says otherwise.
 *
 * `?state=xx` drives the NH-06 state filter SERVER-SIDE (07A §9: a selector, never an IP rewrite). It changes
 * which stories the state module lists; it never rewrites the rest of the page, and the canonical stays `/news`.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("news", "/news")) return {};
  return newsHubMetadata();
}

export default async function NewsHubRoute({ searchParams }: { searchParams?: SearchParams }) {
  if (!servesPage("news", "/news")) notFound();

  const sp = searchParams ? await searchParams : {};
  const rawState = sp["state"];
  const stateParam = typeof rawState === "string" ? rawState : null;

  const model = buildNewsHubModel(stateParam);

  return (
    <>
      {/* §A2 — the approved Global Shell chrome. The hub has no answer surface, so GS-06 stays a labelled
          unavailable affordance rather than a control that pretends to work (CLAUDE.md §9). */}
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <NewsHubPage model={model} />
    </>
  );
}
