/*
 * NEWS SEARCH — the founder-added `/news/search` page. No blueprint section governs it; the persona does.
 *
 * Audience: ordinary U.S. lottery players, mostly on phones. So: one big input, plain words, suggestion chips
 * that are state and game NAMES rather than operators or syntax, and results that are readable cards, not a
 * ranked table. Server-rendered end to end — the form is a plain GET, so the results are in the initial HTML
 * and the page works with no JavaScript at all.
 *
 * The page is `noindex` ALWAYS (search results never enter an index), so the crawlable path to every article
 * stays the hub feed — the fallback links below point there.
 */

import Link from "next/link";
import type { NewsSearchResult } from "@/lib/news/newsSearch";
import { NEWS_SEARCH_SUGGESTIONS } from "@/lib/news/newsSearch";
import { NEWS_HUB_PATH, NEWS_SEARCH_PATH, newsArticlePath } from "@/lib/news/newsContract";
import { Breadcrumbs } from "@/components/shell/SectionChrome";

export default function NewsSearchPage({
  query,
  results,
}: {
  query: string;
  results: readonly NewsSearchResult[];
}) {
  const trimmed = query.trim();
  return (
    <main className="lcn" id="main" data-page-family="news" data-blueprint="07A" data-news-search="true">
      <div className="lcn__inner lcn__inner--article">
        <Breadcrumbs crumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: NEWS_HUB_PATH },
          { label: "Search" },
        ]} />

        <h1 className="lcn-h1">Search lottery news</h1>
        <p className="lcn-support">
          Type a game, a state or a few plain words — like the chips below.
        </p>

        {/* A plain GET form: works without JavaScript, and the query lands in the URL so the back button and
            sharing behave the way people expect. */}
        <form className="lcn-searchform" role="search" action={NEWS_SEARCH_PATH} method="get">
          <label className="lcn-vh" htmlFor="lcn-search-q">Search lottery news</label>
          <input
            className="lcn-searchinput"
            id="lcn-search-q"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try “Powerball” or “Florida”"
            autoComplete="off"
          />
          <button className="lcn-searchbtn" type="submit">Search</button>
        </form>

        <ul className="lcn-statechips" aria-label="Search suggestions">
          {NEWS_SEARCH_SUGGESTIONS.map((sug) => (
            <li key={sug}>
              <Link className="lcn-chip" href={`${NEWS_SEARCH_PATH}?q=${encodeURIComponent(sug)}`}>
                {sug}
              </Link>
            </li>
          ))}
        </ul>

        {trimmed.length === 0 ? (
          <p className="lcn-note">Start with a word or two, or pick a suggestion above.</p>
        ) : results.length === 0 ? (
          <section className="lcn-section" aria-labelledby="lcn-noresults">
            <h2 className="lcn-h2" id="lcn-noresults">Nothing matched “{trimmed}”</h2>
            <p className="lcn-note">
              Only a small set of guides and dated records is published so far. Browsing the news page may find
              it faster.
            </p>
          </section>
        ) : (
          <section className="lcn-section" aria-labelledby="lcn-results">
            <h2 className="lcn-h2" id="lcn-results">
              {results.length === 1 ? "1 match" : `${results.length} matches`} for “{trimmed}”
            </h2>
            <div className="lcn-cardlist" data-result-count={results.length}>
              {results.map(({ article, matchedIn }) => (
                <article className="lcn-card" key={article.slug} data-article-card={article.slug}>
                  <p className="lcn-kicker">
                    <span className="lcn-cat">{article.newsCategory}</span>
                    <span className="lcn-dot" aria-hidden="true">·</span>
                    <time className="lcn-date" dateTime={article.datePublishedIso}>{article.datePublishedIso}</time>
                  </p>
                  <h3 className="lcn-card__title">
                    <Link href={newsArticlePath(article.slug)}>{article.headline}</Link>
                  </h3>
                  <p className="lcn-card__summary">{article.description}</p>
                  <p className="lcn-matchline">Matches: {matchedIn.join(", ")}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* The crawlable fallback — the hub is the indexable surface; this page never is. */}
        <p className="lcn-note">
          <Link href={NEWS_HUB_PATH}>Browse all lottery news</Link>
          {" "}· <Link href={`${NEWS_HUB_PATH}#guides-research`}>Guides and research</Link>
        </p>
      </div>
    </main>
  );
}
