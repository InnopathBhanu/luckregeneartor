/*
 * THE AUTHOR PROFILE — `/authors/{slug}` per 07B §14 and 07C Template J.
 *
 * Template J's visible list: name, photo, role, biography, coverage, recent articles, editorial standards,
 * corrections, newsroom contact, professional profiles. The review identity fills what it truthfully can:
 *
 *   - NO PHOTO — 07 §3 forbids synthetic reporter photos, and the placeholder is not a person to photograph.
 *     A labelled monogram mark renders instead of a fake portrait or a broken-image hole.
 *   - The biography SAYS the identity is a placeholder, in its own first sentences.
 *   - "Professional profiles" and "newsroom contact" are absent, not faked: no external profile exists for a
 *     placeholder, and inventing a mailbox would be a disabled control dressed as a working one (CLAUDE.md §9).
 *   - Recent articles are the real review-corpus records this identity is accountable for.
 */

import Link from "next/link";
import type { NewsArticleRecord, NewsAuthorRecord } from "@/lib/news/newsContract";
import { NEWS_HUB_PATH, newsArticlePath } from "@/lib/news/newsContract";
import { Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { newsAuthorSchema } from "@/lib/news/newsSchema";

export default function AuthorProfilePage({
  author,
  articles,
}: {
  author: NewsAuthorRecord;
  articles: readonly NewsArticleRecord[];
}) {
  return (
    <main className="lcn" id="main" data-page-family="news" data-blueprint="07B"
      data-author-slug={author.slug} data-review-fixture={author.reviewStatus}>
      <JsonLd data={newsAuthorSchema(author)} />
      <div className="lcn__inner lcn__inner--article">
        <Breadcrumbs crumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: NEWS_HUB_PATH },
          { label: author.name },
        ]} />

        <header className="lcn-articlehead">
          {/* The honest mark where Template J puts a photo — never a synthetic portrait (07 §3). */}
          <p className="lcn-authormark" aria-hidden="true" data-no-photo="honest">LC</p>
          <h1 className="lcn-h1">{author.name}</h1>
          <p className="lcn-role">{author.role}</p>
          <p className="lcn-reviewtag" data-review-fixture="true">
            This is an accountable placeholder identity, not a person.
          </p>
        </header>

        <section className="lcn-section" aria-labelledby="lcn-author-bio">
          <h2 className="lcn-h2" id="lcn-author-bio">About</h2>
          <p className="lcn-note">{author.biography}</p>
        </section>

        <section className="lcn-section" aria-labelledby="lcn-author-covers">
          <h2 className="lcn-h2" id="lcn-author-covers">Covers</h2>
          <ul className="lcn-list">
            {author.covers.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>

        <section className="lcn-section" aria-labelledby="lcn-author-articles">
          <h2 className="lcn-h2" id="lcn-author-articles">Articles</h2>
          {articles.length > 0 ? (
            <ul className="lcn-list" data-article-count={articles.length}>
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={newsArticlePath(a.slug)}>{a.headline}</Link>
                  {" "}<time dateTime={a.datePublishedIso}>({a.datePublishedIso})</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lcn-empty" data-honest-empty="true">No articles yet.</p>
          )}
        </section>

        <section className="lcn-section" aria-labelledby="lcn-author-standards">
          <h2 className="lcn-h2" id="lcn-author-standards">Editorial standards and corrections</h2>
          <ul className="lcn-linkrow">
            <li><Link href="/corrections-policy">How corrections work</Link></li>
            <li><Link href="/ai-policy">How LotteryCorner uses AI</Link></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
