/*
 * THE BLOG HUB — `/blog`, BH-01..BH-06 with AD-BH00/AD-BH01 in position (the Conflict 39 order recorded in
 * `blogContract.ts`).
 *
 * A server component with no client islands: the whole magazine is in the initial HTML, the category chips are
 * crawlable links plus a server-side `?category=` filter over the ONE hub URL (no category route exists, so
 * browsing cannot mint indexable URL variants), and every reading time is arithmetic from the model.
 *
 * THE AD ANCHORS render as hidden markers: the position survives in the served HTML for the composition audit,
 * but no geometry is reserved and no placeholder is drawn, because the lc_bp_* and lc_bdp_* inventory is
 * uncaptured
 * (`CLAUDE.md` §12; `NO_APPROVED_BLOG_PROFILE`; Conflict 39's "typed-empty reserved profiles").
 */

import Link from "next/link";
import type { BlogHubModel, BlogHubSection } from "@/lib/blog/blogHubModel";
import type { BlogPostRecord } from "@/lib/blog/blogContract";
import {
  BLOG_CATEGORY_LABELS, BLOG_HUB_PATH, BLOG_SEARCH_PATH, blogAuthorPath, blogPostPath,
} from "@/lib/blog/blogContract";
import { UniversalSection, Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { blogHubSchema } from "@/lib/blog/blogSchema";
import ConsoleApprovedItems from "@/components/modules/ConsoleApprovedItems";

/* ------------------------------------------------------------------ shared bits */

function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

function PostCard({
  post, authorName, minutes, lead = false,
}: { post: BlogPostRecord; authorName: string; minutes: number; lead?: boolean }) {
  return (
    <article className={`lcb-card${lead ? " lcb-card--featured" : ""}`} data-post-card={post.slug}>
      <p className="lcb-kicker">
        <span className="lcb-cat">{BLOG_CATEGORY_LABELS[post.category]}</span>
        <span className="lcb-dot" aria-hidden="true">·</span>
        <time className="lcb-date" dateTime={post.datePublishedIso}>{displayDate(post.datePublishedIso)}</time>
        <span className="lcb-dot" aria-hidden="true">·</span>
        <span data-reading-time={minutes}>{minutes} min read</span>
      </p>
      <h3 className="lcb-card__title">
        <Link href={blogPostPath(post.slug)}>{post.headline}</Link>
      </h3>
      <p className="lcb-card__summary">{post.description}</p>
      <p className="lcb-byline">
        By <Link href={blogAuthorPath(post.authorSlug)}>{authorName}</Link>
        <span className="lcb-reviewtag" data-review-fixture="true">Review content</span>
      </p>
    </article>
  );
}

/**
 * A governed AD-BH anchor. Hidden: no reserved geometry, no placeholder — see the file header. The marker keeps
 * the recorded position auditable in served HTML.
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

export default function BlogHubPage({ model }: { model: BlogHubModel }) {
  /** The accountable byline, from the payload's own author records — never typed into a component. */
  const authorName = (slug: string): string =>
    model.authors.find((a) => a.slug === slug)?.name ?? "LotteryCorner Guides Desk";
  const minutes = (slug: string): number => model.minutesBySlug[slug] ?? 1;

  const s = (id: string): BlogHubSection => {
    const found = model.sections.find((x) => x.id === id);
    if (!found) throw new Error(`BlogHubPage: section ${id} missing from model`);
    return found;
  };

  /** One hub module through the shared §42 chrome. */
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
        family="blog"
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
    <main className="lcb" id="main" data-page-family="blog" data-authority="CONFLICT-39"
      data-section-order={model.sections.map((x) => x.id).join(",")}
      data-ad-profile={model.ads.id}>
      <JsonLd data={blogHubSchema(model.visibleCards)} />
      <div className="lcb__inner">
        {/* ---- BH-01 Identity and Navigation (order 1). Owns the page H1. ---- */}
        <section
          className="lcb-section lcb-identity"
          id="identity"
          aria-labelledby="lcb-h1"
          data-section-id="BH-01"
          data-section-order={1}
          data-section-state="fresh"
          data-protected-zone="false"
          data-intelligence="none"
          data-intelligence-source="matrix"
          data-source-class="configured"
        >
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
          <h1 className="lcb-h1" id="lcb-h1">{model.h1}</h1>
          <p className="lcb-support">{model.support}</p>
          {model.disclosure ? (
            <p className="lcb-disclosure" data-review-disclosure="true">{model.disclosure}</p>
          ) : null}
          <nav className="lcb-hubnav" aria-label="Blog sections">
            <a href="#browse">Browse by category</a>
            <a href="#by-date">All posts</a>
            <Link href="/news">Lottery news</Link>
            <Link href={BLOG_SEARCH_PATH}>Search the blog</Link>
          </nav>
        </section>

        {/* ---- BH-02 Featured Post (order 2). The newest post, deterministically. PROTECTED. ---- */}
        {section("BH-02", "featured",
          model.featured ? (
            <div data-featured-post={model.featured.slug}>
              <PostCard
                post={model.featured}
                authorName={authorName(model.featured.authorSlug)}
                minutes={minutes(model.featured.slug)}
                lead
              />
            </div>
          ) : (
            <p className="lcb-empty" data-honest-empty="true">{s("BH-02").reason}</p>
          ),
          { protectedZone: true, context: "The newest post — picked by date, not by a ranking nobody measured." },
        )}

        {/* ---- AD-BH00 (order 3) — after the featured post, never inside it. ---- */}
        <AdAnchor id="AD-BH00" profileId={model.ads.id} />

        {/* ---- BH-03 Browse by Category (order 4). Chips = crawlable links over ONE URL. ---- */}
        {section("BH-03", "browse",
          <div>
            <ul className="lcb-chips" data-category-chips="links">
              {model.categories.map((c) => (
                <li key={c.category}>
                  <Link
                    href={`${BLOG_HUB_PATH}?category=${c.category}#browse`}
                    aria-current={c.selected ? "true" : undefined}
                    className={c.selected ? "lcb-chip lcb-chip--on" : "lcb-chip"}
                  >
                    {c.label} ({c.count})
                  </Link>
                </li>
              ))}
            </ul>
            {model.selectedCategory ? (
              model.categoryPosts.length > 0 ? (
                <div className="lcb-cardlist" data-category-results={model.categoryPosts.length}>
                  {model.categoryPosts.map((p) => (
                    <PostCard key={p.slug} post={p} authorName={authorName(p.authorSlug)} minutes={minutes(p.slug)} />
                  ))}
                </div>
              ) : (
                <p className="lcb-empty" data-honest-empty="true">
                  Nothing is filed under {model.selectedCategory.label} yet.
                </p>
              )
            ) : (
              <p className="lcb-note">Pick a category to filter, or browse everything by date below.</p>
            )}
          </div>,
          { context: "Guides, analysis, opinion, and systems culture — the visible purpose of each post, not just a label." },
        )}

        {/* ---- BH-04 All Posts by Date (order 5). The whole corpus, month-grouped, newest first. The client
             strip after the groups carries items entered and approved through the review build's editorial
             console (Conflict 40 round trip) — client-resolved; server HTML never carries it. ---- */}
        {section("BH-04", "by-date",
          <>
            {model.dateGroups.length > 0 ? (
              <div data-date-groups={model.dateGroups.length}>
                {model.dateGroups.map((g) => (
                  <div className="lcb-dategroup" key={g.monthIso} data-date-group={g.monthIso}>
                    <h3 className="lcb-dategroup__label">{g.label}</h3>
                    <div className="lcb-cardlist lcb-cardlist--grid">
                      {g.posts.map((p) => (
                        <PostCard key={p.slug} post={p} authorName={authorName(p.authorSlug)} minutes={minutes(p.slug)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="lcb-empty" data-honest-empty="true">{s("BH-04").reason}</p>
            )}
            <ConsoleApprovedItems family="blog" />
          </>,
        )}

        {/* ---- AD-BH01 (order 6) — between the archive and the cross-links. ---- */}
        <AdAnchor id="AD-BH01" profileId={model.ads.id} />

        {/* ---- BH-05 From the Newsroom (order 7). The news↔blog cross-link. ---- */}
        {section("BH-05", "from-the-newsroom",
          <div>
            <p className="lcb-note" data-news-crosslink="true">
              Dated records — matrix changes, format history and anything with a date on it — live on the news
              side. The blog stays evergreen.
            </p>
            <ul className="lcb-linkrow">
              <li><Link href="/news">Browse lottery news</Link></li>
              <li><Link href="/news#guides-research">News guides and research</Link></li>
            </ul>
          </div>,
        )}

        {/* ---- BH-06 Desks and Trust (order 8). The two desk identities and the policy links. ---- */}
        {section("BH-06", "desks-and-trust",
          <div>
            <ul className="lcb-authorlist">
              {model.authors.map((a) => (
                <li key={a.slug} className="lcb-author">
                  <Link href={blogAuthorPath(a.slug)}>{a.name}</Link>
                  <span className="lcb-role"> — {a.beat}</span>
                  <span className="lcb-reviewtag" data-review-fixture="true">Not a person — see profile</span>
                </li>
              ))}
            </ul>
            <ul className="lcb-linkrow">
              <li><Link href="/corrections-policy">How corrections work</Link></li>
              <li><Link href="/ai-policy">How LotteryCorner uses AI</Link></li>
              <li><Link href="/affiliate-disclosure">Affiliate disclosure</Link></li>
            </ul>
          </div>,
        )}
      </div>
    </main>
  );
}
