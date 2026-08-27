import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { getNewsAuthor, getNewsData } from "@/lib/news/bff/newsBff";
import { newsAuthorMetadata } from "@/lib/news/newsRouteMetadata";
import AuthorProfilePage from "@/components/news/AuthorProfilePage";
import { getBlogAuthor, getBlogData } from "@/lib/blog/bff/blogBff";
import { blogAuthorMetadata } from "@/lib/blog/blogRouteMetadata";
import { blogPostPath } from "@/lib/blog/blogContract";
import { newsArticlePath } from "@/lib/news/newsContract";
import BlogAuthorProfilePage, { type AuthorWorkItem } from "@/components/blog/BlogAuthorProfilePage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE AUTHOR PROFILE ROUTE — `/authors/{reporter-slug}`, per 07 §2, 07B §14 and 07C Template J.
 *
 * ONE surface, TWO registries: the news family enumerates its editorial-team placeholder, and the blog family
 * (Conflict 39) enumerates its two desk identities. Each family's registry gates its own slugs (`FD-GATE-01`);
 * a slug neither enumerates is a 404. The news rendering is UNCHANGED — the blog family extends this route,
 * it does not restructure it (the recorded cross-link scope of the Conflict 39 build).
 *
 * Every identity served here is a clearly-labelled review placeholder — 07 §3 forbids fake authors, and each
 * page says in its own words that the identity is not a person. The blog desk pages additionally list work
 * ACROSS news and blog, labelled by kind, and record the launch condition (real named author + Person JSON-LD).
 * `noindex, nofollow`, no sitemap (`PUBLICATION_SAFETY`).
 */

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (servesPage("news", `/authors/${slug}`)) {
    const author = getNewsAuthor(slug);
    return author ? newsAuthorMetadata(author) : {};
  }
  if (servesPage("blog", `/authors/${slug}`)) {
    const author = getBlogAuthor(slug);
    return author ? blogAuthorMetadata(author) : {};
  }
  return {};
}

export default async function AuthorProfileRoute({ params }: { params: Params }) {
  const { slug } = await params;

  /* ---- the news family's identity: rendered exactly as before. ---- */
  if (servesPage("news", `/authors/${slug}`)) {
    const author = getNewsAuthor(slug);
    if (!author) notFound();

    const articles = getNewsData()
      .articles.filter((a) => a.authorSlug === slug)
      .sort((a, b) => b.datePublishedIso.localeCompare(a.datePublishedIso));

    return (
      <>
        <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
        <AuthorProfilePage author={author} articles={articles} />
      </>
    );
  }

  /* ---- the blog family's desk identities (Conflict 39). ---- */
  if (servesPage("blog", `/authors/${slug}`)) {
    const author = getBlogAuthor(slug);
    if (!author) notFound();

    /* The work list spans BOTH families: whatever this identity is accountable for, labelled by kind. */
    const work: AuthorWorkItem[] = [
      ...getBlogData().posts
        .filter((p) => p.authorSlug === slug)
        .map((p): AuthorWorkItem => ({
          kind: "Blog", href: blogPostPath(p.slug), headline: p.headline, dateIso: p.datePublishedIso,
        })),
      ...getNewsData().articles
        .filter((a) => a.authorSlug === slug)
        .map((a): AuthorWorkItem => ({
          kind: "News", href: newsArticlePath(a.slug), headline: a.headline, dateIso: a.datePublishedIso,
        })),
    ].sort((a, b) => b.dateIso.localeCompare(a.dateIso));

    return (
      <>
        <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
        <BlogAuthorProfilePage author={author} work={work} />
      </>
    );
  }

  notFound();
}
