/*
 * THE DESK AUTHOR PROFILE — `/authors/{slug}` for the two blog desk identities (Conflict 39; 07 §2 and 07C
 * Template J by adoption; the news `AuthorProfilePage` is the sibling this mirrors).
 *
 * Template J's visible list, filled truthfully:
 *
 *   - NO PHOTO — 07 §3 forbids synthetic photos, and a desk is not a person to photograph. A labelled
 *     monogram renders instead of a fake portrait.
 *   - The biography SAYS the identity is a placeholder, in its own first sentences, and the page carries a
 *     visible review note plus the recorded launch condition (a real named author, with Person JSON-LD, takes
 *     over at launch — the E-E-A-T structure is built now, the human attaches when one exists).
 *   - The article list SPANS news and blog: whatever this identity is accountable for, across both families,
 *     labelled by kind. Today the desks carry blog posts; the shape is ready for both.
 */

import Link from "next/link";
import type { BlogAuthorRecord } from "@/lib/blog/blogContract";
import { BLOG_HUB_PATH } from "@/lib/blog/blogContract";
import { Breadcrumbs } from "@/components/shell/SectionChrome";
import JsonLd from "@/components/seo/JsonLd";
import { blogAuthorSchema } from "@/lib/blog/blogSchema";

/** One row of the cross-family work list — a real route, its kind, and its date. */
export interface AuthorWorkItem {
  kind: "Blog" | "News";
  href: string;
  headline: string;
  dateIso: string;
}

export default function BlogAuthorProfilePage({
  author,
  work,
}: {
  author: BlogAuthorRecord;
  work: readonly AuthorWorkItem[];
}) {
  return (
    <main className="lcb" id="main" data-page-family="blog" data-authority="CONFLICT-39"
      data-author-slug={author.slug} data-review-fixture={author.reviewStatus}>
      <JsonLd data={blogAuthorSchema(author)} />
      <div className="lcb__inner lcb__inner--post">
        <Breadcrumbs crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: BLOG_HUB_PATH },
          { label: author.name },
        ]} />

        <header className="lcb-posthead">
          {/* The honest mark where Template J puts a photo — never a synthetic portrait (07 §3). */}
          <p className="lcb-authormark" aria-hidden="true" data-no-photo="honest">LC</p>
          <h1 className="lcb-h1">{author.name}</h1>
          <p className="lcb-role">{author.role}</p>
          <p className="lcb-reviewtag" data-review-fixture="true">
            This is an accountable desk identity, not a person — a real named author takes over at launch.
          </p>
        </header>

        <section className="lcb-section" aria-labelledby="lcb-author-beat">
          <h2 className="lcb-h2" id="lcb-author-beat">Beat</h2>
          <p className="lcb-note" data-author-beat="true">{author.beat}</p>
        </section>

        <section className="lcb-section" aria-labelledby="lcb-author-bio">
          <h2 className="lcb-h2" id="lcb-author-bio">About</h2>
          <p className="lcb-note">{author.biography}</p>
          <p className="lcb-note lcb-launchnote" data-launch-note="true">{author.launchNote}</p>
        </section>

        <section className="lcb-section" aria-labelledby="lcb-author-covers">
          <h2 className="lcb-h2" id="lcb-author-covers">Covers</h2>
          <ul className="lcb-list">
            {author.covers.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>

        <section className="lcb-section" aria-labelledby="lcb-author-work">
          <h2 className="lcb-h2" id="lcb-author-work">Articles and posts</h2>
          {work.length > 0 ? (
            <ul className="lcb-list" data-work-count={work.length}>
              {work.map((w) => (
                <li key={w.href}>
                  <span className="lcb-workkind" data-work-kind={w.kind}>{w.kind}</span>{" "}
                  <Link href={w.href}>{w.headline}</Link>
                  {" "}<time dateTime={w.dateIso}>({w.dateIso})</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lcb-empty" data-honest-empty="true">Nothing published yet.</p>
          )}
        </section>

        <section className="lcb-section" aria-labelledby="lcb-author-standards">
          <h2 className="lcb-h2" id="lcb-author-standards">Editorial standards and corrections</h2>
          <ul className="lcb-linkrow">
            <li><Link href="/corrections-policy">How corrections work</Link></li>
            <li><Link href="/ai-policy">How LotteryCorner uses AI</Link></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
