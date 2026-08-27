import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildBlogHubModel } from "@/lib/blog/blogHubModel";
import { blogHubMetadata } from "@/lib/blog/blogRouteMetadata";
import BlogHubPage from "@/components/blog/BlogHubPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE BLOG HUB ROUTE — `/blog`, per Conflict 39 (`source-conflicts.md`): the family is founder-authorized
 * without a blueprint, and `/blog` is classified **preserve** in the ratified route audit (21 live indexed
 * URLs).
 *
 * The gate is the registry and nothing else (`FD-GATE-01`): `servesPage("blog", "/blog")` reads
 * `lib/blog/blogRegistry.ts`, no environment variable exists, and the page is `noindex, nofollow` and in no
 * sitemap (`PUBLICATION_SAFETY`) until a launch task says otherwise.
 *
 * `?category=xx` drives the BH-03 category filter SERVER-SIDE over this one URL. It changes which posts the
 * browse module lists; it never rewrites the rest of the page, no category route exists, and the canonical
 * stays `/blog` — chips cannot mint indexable URL variants.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("blog", "/blog")) return {};
  return blogHubMetadata();
}

export default async function BlogHubRoute({ searchParams }: { searchParams?: SearchParams }) {
  if (!servesPage("blog", "/blog")) notFound();

  const sp = searchParams ? await searchParams : {};
  const rawCategory = sp["category"];
  const categoryParam = typeof rawCategory === "string" ? rawCategory : null;

  const model = buildBlogHubModel(categoryParam);

  return (
    <>
      {/* §A2 — the approved Global Shell chrome. The hub has no answer surface, so GS-06 stays a labelled
          unavailable affordance rather than a control that pretends to work (CLAUDE.md §9). */}
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <BlogHubPage model={model} />
    </>
  );
}
