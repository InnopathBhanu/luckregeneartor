/*
 * BLOG SEARCH — the founder-added `/blog/search` page (Conflict 39). No blueprint section governs it; the
 * persona does, exactly as on `/news/search`: one big input, plain words, suggestion chips that are player
 * language rather than operators, and results that are readable cards. Server-rendered end to end — the form
 * is a plain GET, so the results are in the initial HTML and the page works with no JavaScript at all.
 *
 * The page is `noindex` ALWAYS (search results never enter an index), so the crawlable path to every post
 * stays the hub — the fallback links below point there.
 */

import Link from "next/link";
import type { BlogSearchResult } from "@/lib/blog/blogSearch";
import { BLOG_SEARCH_SUGGESTIONS } from "@/lib/blog/blogSearch";
import {
  BLOG_CATEGORY_LABELS, BLOG_HUB_PATH, BLOG_SEARCH_PATH, blogPostPath,
} from "@/lib/blog/blogContract";
import { Breadcrumbs } from "@/components/shell/SectionChrome";

export default function BlogSearchPage({
  query,
  results,
}: {
  query: string;
  results: readonly BlogSearchResult[];
}) {
  const trimmed = query.trim();
  return (
    <main className="lcb" id="main" data-page-family="blog" data-authority="CONFLICT-39" data-blog-search="true">
      <div className="lcb__inner lcb__inner--post">
        <Breadcrumbs crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: BLOG_HUB_PATH },
          { label: "Search" },
        ]} />

        <h1 className="lcb-h1">Search the blog</h1>
        <p className="lcb-support">
          Type a game, a topic or a few plain words — like the chips below.
        </p>

        {/* A plain GET form: works without JavaScript, and the query lands in the URL so the back button and
            sharing behave the way people expect. */}
        <form className="lcb-searchform" role="search" action={BLOG_SEARCH_PATH} method="get">
          <label className="lcb-vh" htmlFor="lcb-search-q">Search the blog</label>
          <input
            className="lcb-searchinput"
            id="lcb-search-q"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try “Pick 3” or “Double Play”"
            autoComplete="off"
          />
          <button className="lcb-searchbtn" type="submit">Search</button>
        </form>

        <ul className="lcb-chips" aria-label="Search suggestions">
          {BLOG_SEARCH_SUGGESTIONS.map((sug) => (
            <li key={sug}>
              <Link className="lcb-chip" href={`${BLOG_SEARCH_PATH}?q=${encodeURIComponent(sug)}`}>
                {sug}
              </Link>
            </li>
          ))}
        </ul>

        {trimmed.length === 0 ? (
          <p className="lcb-note">Start with a word or two, or pick a suggestion above.</p>
        ) : results.length === 0 ? (
          <section className="lcb-section" aria-labelledby="lcb-noresults">
            <h2 className="lcb-h2" id="lcb-noresults">Nothing matched “{trimmed}”</h2>
            <p className="lcb-note">
              Only a small set of evergreen posts is published so far. Browsing the blog may find it faster.
            </p>
          </section>
        ) : (
          <section className="lcb-section" aria-labelledby="lcb-results">
            <h2 className="lcb-h2" id="lcb-results">
              {results.length === 1 ? "1 match" : `${results.length} matches`} for “{trimmed}”
            </h2>
            <div className="lcb-cardlist" data-result-count={results.length}>
              {results.map(({ post, matchedIn }) => (
                <article className="lcb-card" key={post.slug} data-post-card={post.slug}>
                  <p className="lcb-kicker">
                    <span className="lcb-cat">{BLOG_CATEGORY_LABELS[post.category]}</span>
                    <span className="lcb-dot" aria-hidden="true">·</span>
                    <time className="lcb-date" dateTime={post.datePublishedIso}>{post.datePublishedIso}</time>
                  </p>
                  <h3 className="lcb-card__title">
                    <Link href={blogPostPath(post.slug)}>{post.headline}</Link>
                  </h3>
                  <p className="lcb-card__summary">{post.description}</p>
                  <p className="lcb-matchline">Matches: {matchedIn.join(", ")}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* The crawlable fallback — the hub is the indexable surface; this page never is. */}
        <p className="lcb-note">
          <Link href={BLOG_HUB_PATH}>Browse all blog posts</Link>
          {" "}· <Link href={`${BLOG_HUB_PATH}#browse`}>Browse by category</Link>
        </p>
      </div>
    </main>
  );
}
