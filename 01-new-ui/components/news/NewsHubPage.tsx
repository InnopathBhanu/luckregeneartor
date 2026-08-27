/*
 * THE NEWS HUB — 07A, rendered in the §3 REQUIRED order, NH-01..NH-14 with AD-NH00/01/02 in position.
 *
 * A server component with no client islands: the whole feed is in the initial HTML (07A §20 — "Server-render
 * the main feed"), the state selector is crawlable links plus a server-side `?state=` filter (07A §9 — no
 * IP-based content rewrite anywhere), and the rankings render their honest empty states rather than invented
 * counts (07 §11, NEWS-LOW-VOLUME).
 *
 * THE AD ANCHORS render as hidden markers: the position survives in the served HTML for the composition audit,
 * but no geometry is reserved and no placeholder is drawn, because no news slot is captured or approved
 * (`CLAUDE.md` §12; `NO_APPROVED_NEWS_PROFILE`). A marker is not a slot — activating one is an ad-ops task.
 */

import Link from "next/link";
import type { NewsHubModel, NewsHubSection } from "@/lib/news/newsHubModel";
import type { NewsArticleRecord } from "@/lib/news/newsContract";
import { NEWS_SEARCH_PATH, newsArticlePath, newsAuthorPath } from "@/lib/news/newsContract";
import { UniversalSection, Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { newsHubSchema } from "@/lib/news/newsSchema";
import ConsoleApprovedItems from "@/components/modules/ConsoleApprovedItems";

/* ------------------------------------------------------------------ shared bits */

function ArticleCard({
  article,
  authorName,
  lead = false,
}: { article: NewsArticleRecord; authorName: string; lead?: boolean }) {
  return (
    <article className={`lcn-card${lead ? " lcn-card--lead" : ""}`} data-article-card={article.slug}>
      <p className="lcn-kicker">
        <span className="lcn-cat">{article.newsCategory}</span>
        <span className="lcn-dot" aria-hidden="true">·</span>
        <span className="lcn-class">{article.contentType === "NEWS" ? "Dated record" : labelOf(article)}</span>
        <span className="lcn-dot" aria-hidden="true">·</span>
        <time className="lcn-date" dateTime={article.datePublishedIso}>{displayDate(article.datePublishedIso)}</time>
      </p>
      <h3 className="lcn-card__title">
        <Link href={newsArticlePath(article.slug)}>{article.headline}</Link>
      </h3>
      <p className="lcn-card__summary">{article.description}</p>
      <p className="lcn-byline">
        By <Link href={newsAuthorPath(article.authorSlug)}>{authorName}</Link>
        <span className="lcn-reviewtag" data-review-fixture="true">Review content</span>
      </p>
    </article>
  );
}

/** 07A §10 — distinct labels for Guides and Research. */
function labelOf(article: NewsArticleRecord): string {
  return article.newsCategory === "Research" ? "Research" : "Guide";
}

function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

/** The honest state of a module that has nothing real to show. Never a spinner, never filler cards. */
function EmptyNote({ reason }: { reason: string | null }) {
  return <p className="lcn-empty" data-honest-empty="true">{reason}</p>;
}

/**
 * A governed AD-NH anchor. Hidden: no reserved geometry, no placeholder — see the file header. The marker keeps
 * the 07A §3 position auditable in served HTML.
 */
function AdAnchor({ id, profileId }: { id: string; profileId: string }) {
  return (
    <div
      hidden
      data-section-id={id}
      data-ad-anchor="reserved-pending-audit"
      data-ad-profile={profileId}
      data-ad-active-count={0}
    />
  );
}

/* ------------------------------------------------------------------ the page */

export default function NewsHubPage({ model }: { model: NewsHubModel }) {
  /** The accountable byline, from the payload's own author records — never typed into a component. */
  const authorName = (slug: string): string =>
    model.authors.find((a) => a.slug === slug)?.name ?? "LotteryCorner Editorial Team";

  const s = (id: string): NewsHubSection => {
    const found = model.sections.find((x) => x.id === id);
    if (!found) throw new Error(`NewsHubPage: section ${id} missing from model`);
    return found;
  };

  /** One 07A module through the shared §42 chrome. */
  const section = (
    id: string,
    fragment: string,
    children: React.ReactNode,
    opts?: { context?: string; protectedZone?: boolean },
  ) => {
    const row = s(id);
    return (
      <UniversalSection
        key={id}
        family="news"
        anatomy={{
          sectionId: row.id,
          heading: row.name,
          fragment,
          state: row.state,
          order: model.sections.findIndex((x) => x.id === id) + 1,
          sourceClass: row.state === "fresh" ? "synthetic" : "none",
          ...(opts?.context ? { context: opts.context } : {}),
          ...(opts?.protectedZone ? { protectedZone: true } : {}),
        }}
      >
        {children}
      </UniversalSection>
    );
  };

  return (
    <main className="lcn" id="main" data-page-family="news" data-blueprint="07A"
      data-hub-mode={model.mode} data-section-order={model.sections.map((x) => x.id).join(",")}
      data-ad-profile={model.ads.id}>
      <JsonLd data={newsHubSchema(model.visibleCards)} />
      <div className="lcn__inner">
        {/* ---- NH-01 Identity and Navigation (order 1). Owns the page H1, so it does not use the shared
             section chrome's h2 header — §42's anatomy is still emitted on the wrapper. ---- */}
        <section
          className="lcn-section lcn-identity"
          id="identity"
          aria-labelledby="lcn-h1"
          data-section-id="NH-01"
          data-section-order={1}
          data-section-state="fresh"
          data-protected-zone="false"
          data-intelligence="none"
          data-intelligence-source="matrix"
          data-source-class="configured"
        >
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "News" }]} />
          <h1 className="lcn-h1" id="lcn-h1">{model.h1}</h1>
          <p className="lcn-support">{model.support}</p>
          {model.disclosure ? (
            <p className="lcn-disclosure" data-review-disclosure="true">{model.disclosure}</p>
          ) : null}
          <nav className="lcn-hubnav" aria-label="News sections">
            <a href="#latest-news">Latest</a>
            <a href="#guides-research">Guides and Research</a>
            <a href="#state-news">State news</a>
            <Link href={NEWS_SEARCH_PATH}>Search the news</Link>
          </nav>
        </section>

        {/* ---- NH-02 Top/Developing Story (order 2). PROTECTED: no ad touches the Bottom Line (07A §19). ---- */}
        {section("NH-02", "top-story",
          model.topStory ? (
            <div data-top-story={model.topStory.slug}>
              <ArticleCard article={model.topStory} authorName={authorName(model.topStory.authorSlug)} lead />
              <p className="lcn-bottomline" data-bottom-line="true">{model.topStory.bottomLine}</p>
            </div>
          ) : (
            <EmptyNote reason={s("NH-02").reason} />
          ),
          { protectedZone: true },
        )}

        {/* ---- NH-03 Jackpot Watch (order 3). Unavailable honestly: no live feed, no invented figure. ---- */}
        {section("NH-03", "jackpot-watch",
          <div>
            <EmptyNote reason={s("NH-03").reason} />
            <ul className="lcn-linkrow">
              <li><Link href="/powerball">Powerball results and game page</Link></li>
              <li><Link href="/mega-millions">Mega Millions results and game page</Link></li>
            </ul>
          </div>,
        )}

        {/* ---- AD-NH00 (order 4) — after Jackpot Watch, the first 07A §19 allowed position. ---- */}
        <AdAnchor id="AD-NH00" profileId={model.ads.id} />

        {/* ---- NH-04 Latest News (order 5). The client strip below the corpus cards carries items entered
             and approved through the review build's editorial console (Conflict 40 round trip) — a
             client-resolved addition on the community precedent; server HTML never carries it. ---- */}
        {section("NH-04", "latest-news",
          <>
            {model.latest.length > 0 ? (
              <div className="lcn-cardlist" data-latest-count={model.latest.length}>
                {model.latest.map((a) => <ArticleCard key={a.slug} article={a} authorName={authorName(a.authorSlug)} />)}
              </div>
            ) : (
              <EmptyNote reason={s("NH-04").reason} />
            )}
            <ConsoleApprovedItems family="news" />
          </>,
          { context: "Dated records and their categories. Nothing here is manufactured to look current." },
        )}

        {/* ---- NH-05 Winners and Unclaimed Prizes (order 6). Honest empty — no fabricated winners. ---- */}
        {section("NH-05", "winners-unclaimed", <EmptyNote reason={s("NH-05").reason} />)}

        {/* ---- NH-06 State News (order 7). Selector = crawlable links; filter = server-side ?state=. ---- */}
        {section("NH-06", "state-news",
          <div>
            <p className="lcn-note" data-no-ip-rewrite="true">
              Pick a state to filter. Nothing is chosen for you — this page never guesses your location.
            </p>
            <ul className="lcn-statechips" data-state-selector="links">
              {model.stateOptions.map((st) => (
                <li key={st.code}>
                  <Link
                    href={`/news?state=${st.code}#state-news`}
                    aria-current={model.selectedState?.code === st.code ? "true" : undefined}
                    className={model.selectedState?.code === st.code ? "lcn-chip lcn-chip--on" : "lcn-chip"}
                  >
                    {st.name}
                  </Link>
                </li>
              ))}
            </ul>
            {model.selectedState ? (
              model.stateNews.length > 0 ? (
                <div className="lcn-cardlist">
                  {model.stateNews.map((a) => <ArticleCard key={a.slug} article={a} authorName={authorName(a.authorSlug)} />)}
                </div>
              ) : (
                <p className="lcn-empty" data-honest-empty="true">
                  No stories mention {model.selectedState.name} yet.
                  {model.selectedState.hubHref ? (
                    <> The <Link href={model.selectedState.hubHref}>{model.selectedState.name} results page</Link>
                    {" "}carries that state&apos;s drawings.</>
                  ) : null}
                </p>
              )
            ) : (
              <p className="lcn-note">Choose a state above to see stories that mention it.</p>
            )}
          </div>,
        )}

        {/* ---- NH-07 Guides and LotteryCorner Research (order 8) — raised emphasis in LOW-VOLUME (07A §2). ---- */}
        {section("NH-07", "guides-research",
          <div>
            {model.guides.length > 0 ? (
              <div className="lcn-cardlist" data-guide-count={model.guides.length}>
                {model.guides.map((a) => <ArticleCard key={a.slug} article={a} authorName={authorName(a.authorSlug)} />)}
              </div>
            ) : (
              <EmptyNote reason={s("NH-07").reason} />
            )}
            {/* The one recorded news→blog cross-link (Conflict 39): evergreen editorial lives on /blog. */}
            <p className="lcn-note" data-blog-crosslink="true">
              Evergreen guides, analysis and player culture continue on the{" "}
              <Link href="/blog">LotteryCorner Blog</Link>.
            </p>
          </div>,
          { context: "Durable help content — the emphasis while news volume is low." },
        )}

        {/* ---- AD-NH01 (order 9) — after Guides/Research, the second allowed position. ---- */}
        <AdAnchor id="AD-NH01" profileId={model.ads.id} />

        {/* ---- NH-08/09/10 Rankings (orders 10–12). Separate, and honestly empty: no invented counts. ---- */}
        {section("NH-08", "trending", <EmptyNote reason={s("NH-08").reason} />)}
        {section("NH-09", "most-discussed", <EmptyNote reason={s("NH-09").reason} />)}
        {section("NH-10", "most-read", <EmptyNote reason={s("NH-10").reason} />)}

        {/* ---- NH-11 From the Community (order 13). ---- */}
        {section("NH-11", "from-the-community", <EmptyNote reason={s("NH-11").reason} />)}

        {/* ---- NH-12 Celebrations and Events (order 14). ---- */}
        {section("NH-12", "celebrations-events", <EmptyNote reason={s("NH-12").reason} />)}

        {/* ---- NH-13 Alerts and Digests (order 15). Real destinations only — the account routes exist. ---- */}
        {section("NH-13", "alerts-digests",
          <div>
            <p className="lcn-note">
              A free account can follow games and states and save numbers. News alerts and email digests are not
              switched on yet — when they are, they will be a choice, never a default.
            </p>
            <ul className="lcn-linkrow">
              <li><Link href="/signup">Create a free account</Link></li>
              <li><Link href="/login">Sign in</Link></li>
            </ul>
          </div>,
        )}

        {/* ---- NH-14 Trust, Reporters and Policies (order 16). ---- */}
        {section("NH-14", "trust-reporters",
          <div>
            <ul className="lcn-authorlist">
              {model.authors.map((a) => (
                <li key={a.slug} className="lcn-author">
                  <Link href={newsAuthorPath(a.slug)}>{a.name}</Link>
                  <span className="lcn-role"> — {a.role}</span>
                  <span className="lcn-reviewtag" data-review-fixture="true">Not a person — see profile</span>
                </li>
              ))}
            </ul>
            <ul className="lcn-linkrow">
              <li><Link href="/corrections-policy">How corrections work</Link></li>
              <li><Link href="/ai-policy">How LotteryCorner uses AI</Link></li>
              <li><Link href="/affiliate-disclosure">Affiliate disclosure</Link></li>
            </ul>
          </div>,
        )}

        {/* ---- AD-NH02 (order 17) — the lower advertisement position. ---- */}
        <AdAnchor id="AD-NH02" profileId={model.ads.id} />
      </div>
    </main>
  );
}
