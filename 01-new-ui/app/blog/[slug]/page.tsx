import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildBlogPostModel } from "@/lib/blog/blogPostModel";
import { getBlogPost } from "@/lib/blog/bff/blogBff";
import { blogPostMetadata } from "@/lib/blog/blogRouteMetadata";
import BlogPostPage from "@/components/blog/BlogPostPage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE BLOG POST ROUTE — `/blog/{slug}`, per Conflict 39 and the ratified route audit's **preserve**
 * classification.
 *
 * The gate is the blog registry (`FD-GATE-01`): a slug is a page only when it is ENUMERATED in
 * `lib/blog/blogRegistry.ts` AND the review payload carries its record — a fixture entry alone serves nothing
 * (`CLAUDE.md` §10). `noindex, nofollow`, no sitemap, per `PUBLICATION_SAFETY`; the `index,follow` posture is
 * this family's LAUNCH state, applied by a launch task, not here.
 *
 * No `[slug]` is special-cased: `/blog/search` is a sibling static route, which Next resolves ahead of this
 * dynamic segment.
 */

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!servesPage("blog", `/blog/${slug}`)) return {};
  const post = getBlogPost(slug);
  if (!post) return {};
  return blogPostMetadata(post);
}

export default async function BlogPostRoute({ params }: { params: Params }) {
  const { slug } = await params;
  if (!servesPage("blog", `/blog/${slug}`)) notFound();

  const model = buildBlogPostModel(slug);
  /* A registered slug whose model cannot be built is a configuration fault, not a page. */
  if (!model) notFound();

  return (
    <>
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <BlogPostPage model={model} />
    </>
  );
}
