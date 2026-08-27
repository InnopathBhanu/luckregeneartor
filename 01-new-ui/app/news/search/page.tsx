import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { searchNews } from "@/lib/news/newsSearch";
import { newsSearchMetadata } from "@/lib/news/newsRouteMetadata";
import NewsSearchPage from "@/components/news/NewsSearchPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE NEWS SEARCH ROUTE — `/news/search`, founder-added (no blueprint section of its own; a child of the 07A
 * hub). Registered in `lib/news/newsRegistry.ts` like every other news route (`FD-GATE-01`).
 *
 * TWO postures are permanent, not pre-launch:
 *   - `noindex` ALWAYS — a search-results page never enters an index, launch or no launch;
 *   - permanently sitemap-excluded (`SITEMAP_EXCLUDED_PREFIXES`).
 * The crawlable path to the corpus is the hub feed; this page links back to it.
 *
 * Server-rendered: the form is a plain GET and the results are computed here, so the page works end to end
 * with no JavaScript.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("news", "/news/search")) return {};
  return newsSearchMetadata();
}

export default async function NewsSearchRoute({ searchParams }: { searchParams?: SearchParams }) {
  if (!servesPage("news", "/news/search")) notFound();

  const sp = searchParams ? await searchParams : {};
  const raw = sp["q"];
  const query = typeof raw === "string" ? raw.slice(0, 120) : "";

  return (
    <>
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <NewsSearchPage query={query} results={searchNews(query)} />
    </>
  );
}
