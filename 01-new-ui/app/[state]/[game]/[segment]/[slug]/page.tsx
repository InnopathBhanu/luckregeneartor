import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import { resolveGamePreview } from "@/lib/game/gamePreviewGuard";
import { gameConfigFor } from "@/lib/game/gameConfigRegistry";
import { articleDateLine, editorialSegment, findArticle } from "@/lib/game/gameEditorial";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import { Breadcrumbs } from "@/components/shell/SectionChrome";

/*
 * GAME EDITORIAL ARTICLE ROUTE — `/{state}/{game}/{section}/{slug}` — LRG-GAME-051.
 *
 * ══ WHY THIS ROUTE EXISTS ══
 *
 * The revision direction requires the Game Page's editorial sections to carry *real crawlable links*, and puts
 * the full articles on their own routes with the Game Page as their hub. A link needs somewhere to go, so the
 * destination is built here rather than asserted.
 *
 * ══ IT USES THE SAME REGISTRY BOUNDARY AS ITS PARENT ══
 *
 * `resolveGamePreview` is the same explicit-registry boundary `/fl/pick-3` uses, consulted before anything else.
 * These routes remain `noindex` and absent from every sitemap. They are INTRODUCED routes pending the URL audit
 * — recorded in the implementation record, not smuggled in.
 *
 * ══ EXISTENCE IS DECLARED, NEVER DERIVED ══
 *
 * `findArticle` resolves `(segment, slug)` against the game configuration's own article list. An unknown pair
 * 404s rather than rendering an empty shell, so a mistyped link fails loudly instead of publishing a blank page
 * (`FD-S-30`).
 *
 * ══ PATH DEPTH IS DELIBERATE, AND THE SLUG NAME IS SHARED ══
 *
 * Two segments below the game, which keeps the ARTICLE URL clear of the `/{state}/{game}/{year}` archive pattern
 * one segment below. Introducing that archive did not collide with an article URL — but it did collide with this
 * directory's NAME.
 *
 * The directory was `[section]`. When LRG-ARCHIVE-054 added `[year]` beside it, Next.js rejected the pair at
 * request time: *"You cannot use different slug names for the same dynamic path ('section' !== 'year')."* The
 * build succeeds and both routes appear in the route table, so the failure only shows when a request arrives —
 * which is why it has to be caught by serving the page rather than by compiling it.
 *
 * Both are therefore `[segment]`: one shared dynamic name at this depth, with the archive at
 * `[segment]/page.tsx` and an article at `[segment]/[slug]/page.tsx`. No URL changed — `/fl/pick-3/news/{slug}`
 * still resolves here and `/fl/pick-3/2026` resolves to the archive — and the two disambiguate on CONTENT:
 * a four-digit year is an archive, a known editorial segment is an article, anything else 404s in both.
 */

type Params = Promise<{ state: string; game: string; segment: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state, game, segment, slug } = await params;
  if (!resolveGamePreview(state, game)) return {};

  const cfg = gameConfigFor(state, game);
  if (!cfg) return {};
  const article = findArticle(cfg, segment, slug);
  if (!article) return {};

  const canonical = canonicalUrl(`/${state}/${game}/${editorialSegment(article.kind)}/${article.slug}`);
  return {
    title: { absolute: `${article.title} | ${cfg.game.stateName} ${cfg.game.gameLabel} | LotteryCorner` },
    description: article.summary,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "LotteryCorner",
      title: article.title,
      description: article.summary,
    },
    twitter: { card: "summary", title: article.title, description: article.summary },
    /* A review route is never indexable. Switching this is the documented cutover, not this task. The
       self-referencing canonical above and this `noindex` COEXIST DELIBERATELY during pre-launch
       (FD-RTE Stage 1): the tag reaches no crawler while `noindex` stands. */
    robots: { index: false, follow: false },
  };
}

export default async function GameArticleRoute({ params }: { params: Params }) {
  const { state, game, segment, slug } = await params;
  if (!resolveGamePreview(state, game)) notFound();

  const cfg = gameConfigFor(state, game);
  if (!cfg) notFound();
  const article = findArticle(cfg, segment, slug);
  if (!article) notFound();

  const dateLine = articleDateLine(article);
  const gamePath = `/${state}/${game}`;

  const body = (
    <>
      {/* §A7: the one shared breadcrumb primitive, so every family emits the same markup and the same
          `data-breadcrumb` marker the crumb audit reads. */}
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: cfg.game.stateName, href: `/${state}` },
          { label: cfg.game.gameLabel, href: gamePath },
          { label: article.kind },
        ]}
      />

      <article className="lcg-article">
        <header>
          <p className="lcg-context">
            <span className="lcg-tag">{article.kind}</span>
            <span className="lcg-kind">
              {cfg.game.stateName} {cfg.game.gameLabel}
            </span>
          </p>
          <h1 className="lcg-h1">{article.title}</h1>
          <p className="lcg-purpose">{article.summary}</p>
          {dateLine ? (
            <p className="lcg-fine lcg-muted">
              {dateLine.label} <time dateTime={dateLine.iso}>{dateLine.iso}</time>
            </p>
          ) : null}
        </header>

        {/* Body blocks are a closed union — prose, a subheading or a list. No raw HTML is ever injected. */}
        <div className="lcg-prose">
          {article.body.map((b, i) => {
            if (b.kind === "h") return <h2 key={i} className="lcg-h3">{b.text}</h2>;
            if (b.kind === "ul") {
              return (
                <ul key={i} className="lcg-proselist">
                  {b.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              );
            }
            return <p key={i}>{b.text}</p>;
          })}
        </div>

        {article.sources && article.sources.length > 0 ? (
          <footer className="lcg-articlefoot">
            <h2 className="lcg-h3">Sources</h2>
            <ul className="lcg-sourcelist">
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>{" "}
                  <span className="lcg-muted">read {s.accessed}</span>
                </li>
              ))}
            </ul>
          </footer>
        ) : null}

        <p className="lcg-actions">
          <Link className="lcg-chip" href={gamePath}>
            All {cfg.game.stateName} {cfg.game.gameLabel} results and tools
          </Link>
        </p>
      </article>
    </>
  );

  return (
    <>
      {/* §A2. An editorial article has no answer surface of its own, so GS-06 is LABELLED unavailable rather
          than linking to a region that is not on the page (`CLAUDE.md` §9). */}
      <GlobalShellChrome askAnchor={null} activePrimaryNav="News" />
      <div
        data-lc-game-preview=""
        data-game-article={`${editorialSegment(article.kind)}/${article.slug}`}
        className="lcg-page"
      >
      <a className="lcs-skip" href="#article-main">Skip to main content</a>
      <div className="lcs-previewbar" role="status" data-preview-banner="true">
        <span className="lcs-attr">Internal preview</span>{" "}
        <span>Not for publication · this route is not indexed and is not in any sitemap.</span>
      </div>
      {/* ONE landmark, unconditionally. The root layout no longer supplies a `<main>`, so the conditional that
          used to exist here — and the flag about a different page that drove it — are both gone. */}
        <main id="article-main" className="lcg-container lcg-container--article">{body}</main>
      </div>
    </>
  );
}
