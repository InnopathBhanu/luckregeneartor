/*
 * THE NEWS ARTICLE — 07B §3's fifteen sections, in order, composed per 07C Template A.
 *
 * ══ THE SECTION-ID CONTRACT (recorded here because 07B defines order WITHOUT ids) ══
 *
 * 07B §3 numbers its fifteen sections but names no ids — alone among the approved blueprints. The ids this page
 * emits therefore come from TWO governed vocabularies, recorded in `NEWS_ARTICLE_SECTION_ORDER`
 * (`lib/news/newsContract.ts`), which is the single source this component and the tests both read:
 *
 *   - `data-article-section="NA-<order>"` — the family's own positional id, NA-01..NA-15, one per 07B row;
 *   - `data-library-id` — the Global Shell v1.1 editorial-library id (SL-E01..SL-E10, SL-I10, SL-M01/02,
 *     SL-T01/05) each row maps onto, `none` where the library genuinely has no id (the article body).
 *
 * Orders 1–3 (category/entities/status, headline, reporter identity) are ONE header element — all three map to
 * SL-E01 Article Header, whose blueprint definition *contains* headline, author, dates, classification and
 * entities — so splitting them into three landmarks would invent structure 07B does not have. Each still emits
 * its own `data-article-section` marker.
 *
 * ══ AD RULE (07B §19 / 07 §23) ══ No ad anchor exists on this page AT ALL (`NO_APPROVED_NEWS_PROFILE`): no
 * news inventory is captured, and every position 07B names between its sections is either protected or
 * unapproved. The article body is one uninterrupted read.
 */

import Link from "next/link";
import type { NewsArticleModel } from "@/lib/news/newsArticleModel";
import { newsAuthorPath } from "@/lib/news/newsContract";
import { Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { newsArticleSchema } from "@/lib/news/newsSchema";
import RepresentativeImage from "@/components/editorial/RepresentativeImage";

function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

/** One 07B section wrapper, carrying the recorded contract attributes. */
function ArticleSection({
  order, libraryId, heading, children, protectedZone = false,
}: {
  order: number;
  libraryId: string | null;
  heading: string;
  children: React.ReactNode;
  protectedZone?: boolean;
}) {
  const id = `NA-${String(order).padStart(2, "0")}`;
  const headingId = `${id.toLowerCase()}-heading`;
  return (
    <section
      className="lcn-section"
      aria-labelledby={headingId}
      data-article-section={id}
      data-order={order}
      data-library-id={libraryId ?? "none"}
      data-protected-zone={protectedZone ? "true" : "false"}
    >
      <h2 className="lcn-h2" id={headingId}>{heading}</h2>
      {children}
    </section>
  );
}

export default function NewsArticlePage({ model }: { model: NewsArticleModel }) {
  const { article, author } = model;
  const updated = article.dateModifiedIso !== article.datePublishedIso;
  const rendered = (order: number) => model.sections.find((r) => r.order === order)?.rendered === true;

  return (
    <main
      className="lcn"
      id="main"
      data-page-family="news"
      data-blueprint="07B"
      data-article-slug={article.slug}
      data-story-status={article.storyStatus}
      data-content-type={article.contentType}
      data-ad-profile={model.ads.id}
      data-ad-active-count={0}
      data-section-order={model.sections.map((r) => `NA-${String(r.order).padStart(2, "0")}`).join(",")}
      data-suppressed-sections={
        model.sections.filter((r) => !r.rendered).map((r) => `NA-${String(r.order).padStart(2, "0")}`).join(",")
        || "none"
      }
    >
      <JsonLd data={newsArticleSchema(article, author)} />
      <div className="lcn__inner lcn__inner--article">
        <Breadcrumbs crumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: article.headline },
        ]} />

        {model.disclosure ? (
          <p className="lcn-disclosure" data-review-disclosure="true">{model.disclosure}</p>
        ) : null}

        {/* ---- Orders 1–3 — SL-E01 Article Header (07C Template A header, verbatim shape). ---- */}
        <header className="lcn-articlehead" data-library-id="SL-E01">
          {/* 1 — <CATEGORY> · <STATE/GAME> · <STATUS> */}
          <p className="lcn-kicker" data-article-section="NA-01" data-order={1}>
            <span className="lcn-cat">{article.newsCategory}</span>
            <span className="lcn-dot" aria-hidden="true">·</span>
            <span className="lcn-entity">{article.primaryEntity}</span>
            <span className="lcn-dot" aria-hidden="true">·</span>
            <span className="lcn-status" data-story-status={article.storyStatus}>{article.storyStatus}</span>
          </p>
          {/* 2 — the one H1. */}
          <h1 className="lcn-h1" data-article-section="NA-02" data-order={2}>{article.headline}</h1>
          {/* 3 — reporter identity and dates. PROTECTED: no ad may sit inside it (07B §19). */}
          <div className="lcn-reporter" data-article-section="NA-03" data-order={3} data-protected-zone="true">
            <p className="lcn-byline">
              By <Link href={newsAuthorPath(author.slug)}>{author.name}</Link>
              <span className="lcn-role"> — {author.role}</span>
              <span className="lcn-reviewtag" data-review-fixture="true">Not a person — see profile</span>
            </p>
            <p className="lcn-dates">
              Published <time dateTime={article.datePublishedIso}>{displayDate(article.datePublishedIso)}</time>
              {updated ? (
                <> · Updated <time dateTime={article.dateModifiedIso}>{displayDate(article.dateModifiedIso)}</time></>
              ) : null}
            </p>
          </div>
        </header>

        {/* ---- 4 — Bottom Line — SL-E02. PROTECTED: nothing sits between headline and Bottom Line (07B §19),
             which the markup makes structural — they are adjacent siblings with no slot between them. ---- */}
        <p
          className="lcn-bottomline"
          data-article-section="NA-04"
          data-order={4}
          data-library-id="SL-E02"
          data-bottom-line="true"
          data-protected-zone="true"
        >
          {article.bottomLine}
        </p>

        {/* ---- 5 — Primary image/data card. 07B §3 order 5 is "Primary image/data card": the representative
             image and the verified data card share this slot. The image renders ONLY from a typed asset the
             record carries (LRG-UX-SCHEMA-002 §3) — the same asset, through the same validity gate, that
             `newsArticleSchema` reads for `NewsArticle.image`. No corpus record has one, so nothing renders
             today and nothing is claimed. It sits AFTER the Bottom Line: 07B §19 protects the span between the
             headline and the Bottom Line, and an image is exactly the kind of thing that must not enter it. */}
        <RepresentativeImage asset={article.representativeImage} className="lcn-figure" />

        {/* ---- 5 — Primary data card — SL-E04. A verified before/after table (07C Template E), never a
             fabricated image (07B §18). Suppressed with a recorded reason when the record carries none. ---- */}
        {rendered(5) && article.beforeAfter ? (
          <figure
            className="lcn-datacard"
            data-article-section="NA-05"
            data-order={5}
            data-library-id="SL-E04"
          >
            <figcaption className="lcn-datacard__caption">{article.beforeAfterLabel}</figcaption>
            <div className="lcn-tablewrap">
              <table className="lcn-table">
                <thead>
                  <tr><th scope="col">Item</th><th scope="col">Before</th><th scope="col">After</th></tr>
                </thead>
                <tbody>
                  {article.beforeAfter.map((row) => (
                    <tr key={row.item}>
                      <th scope="row">{row.item}</th>
                      <td>{row.before}</td>
                      <td>{row.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        ) : null}

        {/* ---- 6 — Main article. No library id: the body IS the NewsArticle (see the header contract). ---- */}
        <div className="lcn-body" data-article-section="NA-06" data-order={6} data-library-id="none">
          {article.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* ---- 7 — Conditional AI context — SL-I10. SUPPRESSED: 07 §7's acceptance test admits an AI module
             only when it adds grounded value beyond the headline, Bottom Line or first paragraph, and no model
             is connected in this build — so nothing renders, which is the compliant state, and no placeholder,
             teaser or disabled control is drawn in its place (CLAUDE.md §9). Reason recorded in the model. ---- */}

        {/* ---- 8 — Why It Matters — SL-E03. ---- */}
        <ArticleSection order={8} libraryId="SL-E03" heading="Why it matters">
          <ul className="lcn-list">
            {article.whyItMatters.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </ArticleSection>

        {/* ---- 9 — Historical/data connection — SL-E06. Deterministic data before AI explanation (07B §10). ---- */}
        <ArticleSection order={9} libraryId="SL-E06" heading="Worth knowing">
          <p className="lcn-note" data-worth-knowing="true">{article.historicalNote}</p>
        </ArticleSection>

        {/* ---- 10 — Primary action — SL-M01. ONE action, not a tool wall (07B §11). ---- */}
        <ArticleSection order={10} libraryId="SL-M01" heading="Where to go next">
          <p>
            <Link className="lcn-primaryaction" href={article.primaryAction.href} data-primary-action="true">
              {article.primaryAction.label}
            </Link>
          </p>
        </ArticleSection>

        {/* ---- 11 — Focused discussion question — SL-E08. Static text: the question renders, and no comment
             UI is faked under it. PROTECTED: no ad between the question and any future first comment. ---- */}
        <ArticleSection order={11} libraryId="SL-E08" heading="Join the discussion" protectedZone>
          <p className="lcn-question" data-discussion-question="true">{article.discussionQuestion}</p>
          {/* ---- 12 — Canonical discussion — SL-E08. The typed seam (`canonicalDiscussionThreadId`,
               08D Template M): when it names a thread this build serves, the article links to its ONE
               canonical community discussion; otherwise the honest state is a sentence, not an empty comment
               box pretending to work (07 §10 — a thread is never fabricated). ---- */}
          {model.discussion ? (
            <p
              className="lcn-note"
              data-article-section="NA-12"
              data-order={12}
              data-library-id="SL-E08"
              data-canonical-thread={article.canonicalDiscussionThreadId ?? "none"}
            >
              This article has one community thread:{" "}
              <Link href={model.discussion.href}>{model.discussion.title}</Link>
              {" "}({model.discussion.replyCount} replies so far).
            </p>
          ) : (
            <p
              className="lcn-note"
              data-article-section="NA-12"
              data-order={12}
              data-library-id="SL-E08"
              data-canonical-thread="none"
            >
              This article has no community thread yet. When it does, there will be exactly one, and it will
              live here.
            </p>
          )}
        </ArticleSection>

        {/* ---- 13 — Related next actions — SL-M02. Maximum three (07C Template A). ---- */}
        <ArticleSection order={13} libraryId="SL-M02" heading="Related">
          <ul className="lcn-linkrow" data-related-count={article.relatedNextActions.length}>
            {article.relatedNextActions.map((a) => (
              <li key={a.href}><Link href={a.href}>{a.label}</Link></li>
            ))}
          </ul>
        </ArticleSection>

        {/* ---- 14 — Sources, updates and corrections — SL-T01 (07 §16 visible fields, verbatim labels).
             PROTECTED: no ad inside a correction/update timeline (07B §19). ---- */}
        <ArticleSection order={14} libraryId="SL-T01" heading="Sources and corrections" protectedZone>
          <dl className="lcn-sources" data-sources-block="true">
            <dt>Primary source</dt>
            <dd>{article.sources.primarySource}</dd>
            {article.sources.additionalSources.length > 0 ? (
              <>
                <dt>Additional sources</dt>
                <dd>{article.sources.additionalSources.join("; ")}</dd>
              </>
            ) : null}
            <dt>LotteryCorner data used</dt>
            <dd>{article.sources.lotteryCornerDataUsed.join("; ")}</dd>
            <dt>Last checked</dt>
            <dd><time dateTime={article.sources.lastCheckedIso}>{displayDate(article.sources.lastCheckedIso)}</time></dd>
            <dt>Correction status</dt>
            <dd data-correction-status="true">{article.sources.correctionStatus}</dd>
            <dt>Reporter</dt>
            <dd><Link href={newsAuthorPath(author.slug)}>{author.name}</Link></dd>
            <dt>Editor</dt>
            <dd>{article.editorName}</dd>
          </dl>
        </ArticleSection>

        {/* ---- 15 — Responsible play — SL-T05. PROTECTED, and no affiliate CTA exists on any review article
             (07 §23). ---- */}
        <ArticleSection order={15} libraryId="SL-T05" heading="Play responsibly" protectedZone>
          <p className="lcn-note" data-responsible-play="true">
            Lottery games are entertainment with long odds, not a way to make money. Play with money you can
            afford to lose, and stop when it stops being fun. Every drawing is independent — nothing in this
            article changes the odds of any draw.
          </p>
        </ArticleSection>
      </div>
    </main>
  );
}
