import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildNewsArticleModel } from "@/lib/news/newsArticleModel";
import { getNewsArticle } from "@/lib/news/bff/newsBff";
import { newsArticleMetadata } from "@/lib/news/newsRouteMetadata";
import NewsArticlePage from "@/components/news/NewsArticlePage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE NEWS ARTICLE ROUTE — `/news/{article-slug}`, per 07B (Final approved and frozen) and 07 §21.
 *
 * The gate is the news registry (`FD-GATE-01`): a slug is a page only when it is ENUMERATED in
 * `lib/news/newsRegistry.ts` AND the review payload carries its record — a fixture entry alone serves nothing
 * (`CLAUDE.md` §10). `noindex, nofollow`, no sitemap, per `PUBLICATION_SAFETY`. The search-engine posture 07C
 * Template A describes (`index,follow`) is this family's LAUNCH state, applied by a launch task, not here.
 *
 * No `[slug]` is special-cased: `/news/search` is a sibling static route, which Next resolves ahead of this
 * dynamic segment.
 */

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!servesPage("news", `/news/${slug}`)) return {};
  const article = getNewsArticle(slug);
  if (!article) return {};
  return newsArticleMetadata(article);
}

export default async function NewsArticleRoute({ params }: { params: Params }) {
  const { slug } = await params;
  if (!servesPage("news", `/news/${slug}`)) notFound();

  const model = buildNewsArticleModel(slug);
  /* A registered slug whose model cannot be built is a configuration fault, not a page. */
  if (!model) notFound();

  return (
    <>
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <NewsArticlePage model={model} />
    </>
  );
}
