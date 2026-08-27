import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { searchBlog } from "@/lib/blog/blogSearch";
import { blogSearchMetadata } from "@/lib/blog/blogRouteMetadata";
import BlogSearchPage from "@/components/blog/BlogSearchPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE BLOG SEARCH ROUTE — `/blog/search`, founder-added (Conflict 39 names blog search explicitly; no
 * blueprint section exists). Registered in `lib/blog/blogRegistry.ts` like every other blog route
 * (`FD-GATE-01`).
 *
 * TWO postures are permanent, not pre-launch:
 *   - `noindex` ALWAYS — a search-results page never enters an index, launch or no launch;
 *   - permanently sitemap-excluded (`SITEMAP_EXCLUDED_PREFIXES`).
 * The crawlable path to the corpus is the hub; this page links back to it.
 *
 * Server-rendered: the form is a plain GET and the results are computed here, so the page works end to end
 * with no JavaScript.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("blog", "/blog/search")) return {};
  return blogSearchMetadata();
}

export default async function BlogSearchRoute({ searchParams }: { searchParams?: SearchParams }) {
  if (!servesPage("blog", "/blog/search")) notFound();

  const sp = searchParams ? await searchParams : {};
  const raw = sp["q"];
  const query = typeof raw === "string" ? raw.slice(0, 120) : "";

  return (
    <>
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <BlogSearchPage query={query} results={searchBlog(query)} />
    </>
  );
}
