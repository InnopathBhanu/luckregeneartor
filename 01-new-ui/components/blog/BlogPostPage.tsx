/*
 * THE BLOG POST — BL-01..BL-12 in the order recorded in `BLOG_POST_SECTION_ORDER` (`lib/blog/blogContract.ts`).
 *
 * ══ THE SECTION-ID CONTRACT (Conflict 39: no blueprint exists) ══
 *
 * The Blog family has no blueprint to transcribe, so the composition contract lives in `blogContract.ts` —
 * the founder's order, adapting 07B §3 to evergreen editorial — and this component renders exactly that
 * sequence, each section marked `data-post-section="BL-*"`. `tests/blog-pages.test.ts` asserts the sequence
 * from the contract and from this source; the served DOM carries it as one attribute.
 *
 * Orders 1–3 (category kicker, headline, author identity) are ONE header element, exactly as the news article
 * merges its 07B orders 1–3 into SL-E01 — splitting them would invent structure the composition does not have.
 * Each still emits its own `data-post-section` marker.
 *
 * ══ AD RULE (07B §19 adopted; `CLAUDE.md` §12) ══ No ad anchor exists on this page AT ALL
 * (`NO_APPROVED_BLOG_PROFILE`): the lc_bp_* and lc_bdp_* inventory is uncaptured, and the founder's composition
 * names no post-page position. Headline → Key points → Listen → body is one uninterrupted protected read.
 *
 * ══ TWO HONESTY RULES THIS PAGE CARRIES ══
 *
 *   - BL-04 is labelled **"Key points"**, never "AI": the bullets are a deterministic derivation
 *     (`FD-DAT-20` — deterministic generation is never described as AI, in either direction).
 *   - BL-05 is REAL audio (browser SpeechSynthesis) with an honest absent state and no autoplay — never a
 *     fake player (`CLAUDE.md` §9 / FD-DAT-17).
 */

import Link from "next/link";
import type { BlogPostModel } from "@/lib/blog/blogPostModel";
import { KEY_POINTS_LABEL, KEY_POINTS_PROVENANCE } from "@/lib/blog/blogKeyPoints";
import { Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { blogPostSchema } from "@/lib/blog/blogSchema";
import ListenControl from "./ListenControl";
import ShareRow from "./ShareRow";
import RepresentativeImage from "@/components/editorial/RepresentativeImage";

function displayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

/** One BL section wrapper, carrying the recorded contract attributes. */
function PostSection({
  id, heading, children, protectedZone = false, className,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
  protectedZone?: boolean;
  className?: string;
}) {
  const headingId = `${id.toLowerCase()}-heading`;
  return (
    <section
      className={`lcb-section${className ? ` ${className}` : ""}`}
      aria-labelledby={headingId}
      data-post-section={id}
      data-protected-zone={protectedZone ? "true" : "false"}
    >
      <h2 className="lcb-h2" id={headingId}>{heading}</h2>
      {children}
    </section>
  );
}

export default function BlogPostPage({ model }: { model: BlogPostModel }) {
  const { post, author } = model;
  const updated = post.dateModifiedIso !== post.datePublishedIso;

  return (
    <main
      className="lcb"
      id="main"
      data-page-family="blog"
      data-authority="CONFLICT-39"
      data-post-slug={post.slug}
      data-category={post.category}
      data-claim-type={post.claimType}
      data-ad-profile={model.ads.id}
      data-ad-active-count={0}
      data-section-order={model.sections.map((r) => r.id).join(",")}
    >
      <JsonLd data={blogPostSchema(post, author)} />
      <div className="lcb__inner lcb__inner--post">
        <Breadcrumbs crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.headline },
        ]} />

        {model.disclosure ? (
          <p className="lcb-disclosure" data-review-disclosure="true">{model.disclosure}</p>
        ) : null}

        {/* ---- BL-01..BL-03 — one header element (kicker, headline, author identity + dates). ---- */}
        <header className="lcb-posthead">
          {/* BL-01 — <CATEGORY> · <ENTITY> · claim-type label where the claim class carries one. */}
          <p className="lcb-kicker" data-post-section="BL-01">
            <span className="lcb-cat">{model.categoryLabel}</span>
            <span className="lcb-dot" aria-hidden="true">·</span>
            <span className="lcb-entity">{post.primaryEntity}</span>
            {model.claimLabel ? (
              <span className="lcb-claimlabel" data-claim-label={post.claimType}>{model.claimLabel}</span>
            ) : null}
          </p>
          {/* BL-02 — the one H1. `.lcb-h1` is a speakable selector (blogSchema.ts). */}
          <h1 className="lcb-h1" data-post-section="BL-02">{post.headline}</h1>
          {/* BL-03 — desk identity, dates, reading time. PROTECTED: no ad may sit inside it. */}
          <div className="lcb-byline-block" data-post-section="BL-03" data-protected-zone="true">
            <p className="lcb-byline">
              By <Link href={model.authorBio.profileHref}>{author.name}</Link>
              <span className="lcb-role"> — {author.role}</span>
              <span className="lcb-reviewtag" data-review-fixture="true">Not a person — see profile</span>
            </p>
            <p className="lcb-dates">
              Published <time dateTime={post.datePublishedIso}>{displayDate(post.datePublishedIso)}</time>
              {updated ? (
                <> · Updated <time dateTime={post.dateModifiedIso}>{displayDate(post.dateModifiedIso)}</time></>
              ) : null}
              <span className="lcb-dot" aria-hidden="true">·</span>
              <span data-reading-time={model.readingMinutes}>{model.readingMinutes} min read</span>
            </p>
          </div>
        </header>

        {/* ---- BL-04 — Key points. DERIVED deterministically from the article (blogKeyPoints.ts) and
             labelled "Key points", never "AI" (FD-DAT-20). `.lcb-keypoints` is the second speakable selector.
             PROTECTED: nothing sits between the headline and this block, structurally — adjacent siblings. ---- */}
        <section
          className="lcb-keypoints"
          aria-labelledby="bl-04-heading"
          data-post-section="BL-04"
          data-key-points="derived"
          data-protected-zone="true"
        >
          <h2 className="lcb-h2 lcb-keypoints__label" id="bl-04-heading">{KEY_POINTS_LABEL}</h2>
          <p className="lcb-keypoints__provenance">{KEY_POINTS_PROVENANCE}</p>
          <ul className="lcb-keypoints__list">
            {model.keyPoints.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </section>

        {/* ---- BL-05 — Listen. Real browser speech, honest absent state, no autoplay (ListenControl). ---- */}
        <PostSection id="BL-05" heading="Listen to this article" protectedZone className="lcb-listen">
          <ListenControl text={model.listenText} headline={post.headline} />
        </PostSection>

        {/* The representative image, from the same typed asset and the same validity gate `blogPostSchema`
             reads for `BlogPosting.image` (LRG-UX-SCHEMA-002 §3). No corpus post carries one, so nothing
             renders and nothing is claimed. Placed above the body, below Key points, so it illustrates the
             article rather than interrupting the summary a reader came for. */}
        <RepresentativeImage asset={post.representativeImage} className="lcb-figure" />

        {/* ---- BL-06 — the article. A readable measure, big type; the body IS the BlogPosting. ---- */}
        <div className="lcb-body" data-post-section="BL-06">
          {post.sections.map((section, i) => (
            <div key={section.heading ?? "lead"} className="lcb-body__section">
              {section.heading ? <h2 className="lcb-h2 lcb-body__heading">{section.heading}</h2> : null}
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className={i === 0 ? "lcb-body__lead" : undefined}>{p}</p>
              ))}
            </div>
          ))}
        </div>

        {/* ---- BL-07 — related tool/game/state links. Real routes only, never a tool wall. ---- */}
        <PostSection id="BL-07" heading="Where to go next">
          <ul className="lcb-linkrow" data-related-links={post.relatedLinks.length}>
            {post.relatedLinks.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </PostSection>

        {/* ---- BL-08 — the author bio card, AT THE END of the read (founder requirement). The mark is an
             honest monogram, never a fake portrait (07 §3). ---- */}
        <PostSection id="BL-08" heading="About the author" className="lcb-biocard-section">
          <div className="lcb-biocard" data-author-bio="end-of-post" data-review-fixture="true">
            <p className="lcb-authormark" aria-hidden="true" data-no-photo="honest">LC</p>
            <div className="lcb-biocard__body">
              <p className="lcb-biocard__name">
                <Link href={model.authorBio.profileHref}>{model.authorBio.name}</Link>
              </p>
              <p className="lcb-biocard__role">{model.authorBio.role}</p>
              <p className="lcb-reviewtag" data-review-fixture="true">
                This is an accountable desk identity, not a person — a real named author takes over at launch.
              </p>
              <p className="lcb-biocard__beat">{model.authorBio.beat}</p>
              <p className="lcb-biocard__bio">{model.authorBio.biography}</p>
              {model.authorBio.moreFrom.length > 0 ? (
                <>
                  <p className="lcb-biocard__morelabel">More from {model.authorBio.name}</p>
                  <ul className="lcb-linkrow" data-more-from-author={model.authorBio.moreFrom.length}>
                    {model.authorBio.moreFrom.map((l) => (
                      <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </PostSection>

        {/* ---- BL-09 — sources and corrections (07 §16 visible fields). PROTECTED. ---- */}
        <PostSection id="BL-09" heading="Sources and corrections" protectedZone>
          <dl className="lcb-sources" data-sources-block="true">
            <dt>Primary source</dt>
            <dd>{post.sources.primarySource}</dd>
            {post.sources.additionalSources.length > 0 ? (
              <>
                <dt>Additional sources</dt>
                <dd>{post.sources.additionalSources.join("; ")}</dd>
              </>
            ) : null}
            {post.sources.lotteryCornerDataUsed.length > 0 ? (
              <>
                <dt>LotteryCorner data used</dt>
                <dd>{post.sources.lotteryCornerDataUsed.join("; ")}</dd>
              </>
            ) : null}
            <dt>Last checked</dt>
            <dd><time dateTime={post.sources.lastCheckedIso}>{displayDate(post.sources.lastCheckedIso)}</time></dd>
            <dt>Correction status</dt>
            <dd data-correction-status="true">{post.sources.correctionStatus}</dd>
            <dt>Author</dt>
            <dd><Link href={model.authorBio.profileHref}>{author.name}</Link></dd>
            <dt>Editor</dt>
            <dd>{post.editorName}</dd>
          </dl>
        </PostSection>

        {/* ---- BL-10 — share (Template M, persona-simple). The canonical URL, one consistent identity. ---- */}
        <PostSection id="BL-10" heading="Share this article">
          <ShareRow url={model.shareUrl} headline={post.headline} />
        </PostSection>

        {/* ---- BL-11 — related posts. A fixed rule over the served corpus, max three. ---- */}
        <PostSection id="BL-11" heading="Related posts">
          {model.relatedPosts.length > 0 ? (
            <div className="lcb-cardlist" data-related-posts={model.relatedPosts.length}>
              {model.relatedPosts.map((r) => (
                <article className="lcb-card" key={r.slug} data-post-card={r.slug}>
                  <p className="lcb-kicker">
                    <span className="lcb-cat">{r.categoryLabel}</span>
                    <span className="lcb-dot" aria-hidden="true">·</span>
                    <time className="lcb-date" dateTime={r.dateIso}>{displayDate(r.dateIso)}</time>
                    <span className="lcb-dot" aria-hidden="true">·</span>
                    <span>{r.minutes} min read</span>
                  </p>
                  <h3 className="lcb-card__title"><Link href={r.href}>{r.headline}</Link></h3>
                </article>
              ))}
            </div>
          ) : (
            <p className="lcb-empty" data-honest-empty="true">No related posts yet.</p>
          )}
        </PostSection>

        {/* ---- BL-12 — responsible play. PROTECTED; no commerce, no affiliate CTA. ---- */}
        <PostSection id="BL-12" heading="Play responsibly" protectedZone>
          <p className="lcb-note" data-responsible-play="true">
            Lottery games are entertainment with long odds, not a way to make money. Play with money you can
            afford to lose, and stop when it stops being fun. Every drawing is independent — nothing in this
            post changes the odds of any draw.
          </p>
        </PostSection>
      </div>
    </main>
  );
}
