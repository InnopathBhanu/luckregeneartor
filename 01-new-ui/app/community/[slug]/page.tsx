import type { Metadata } from "next";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { getForumEntry } from "@/lib/community/bff/communityBff";
import { buildForumEntryModel } from "@/lib/community/forumEntryModel";
import { forumEntryMetadata, reviewerEntryMetadata } from "@/lib/community/communityRouteMetadata";
import ForumEntryPage from "@/components/community/ForumEntryPage";
import ReviewerEntryView from "@/components/community/ReviewerEntryView";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE FORUM ENTRY ROUTE — `/community/{forum-entry-slug}`, per 08B (Final approved and frozen) and 08 §33
 * decision 2 (ONE canonical route for every conversation).
 *
 * The gate is the community registry (`FD-GATE-01`): a slug is a SERVER-SERVED page only when it is
 * enumerated in `lib/community/communityRegistry.ts` AND the review payload carries its record — a fixture
 * record alone serves nothing (`CLAUDE.md` §10).
 *
 * A slug OUTSIDE the corpus resolves CLIENT-SIDE against the reviewer's own review store (Conflict 37 — a
 * post published through the CH-01 composer genuinely persists and renders). The server HTML for those slugs
 * is an honest "nothing is published here" fallback, never a fabricated thread; the registry header records
 * this as the dynamic segment's designed behaviour. `noindex, nofollow` on every variant, no sitemap
 * (`PUBLICATION_SAFETY`, Conflict 41 amendment condition 3).
 *
 * `?sort=` and `?page=` drive FE-07 server-side; the canonical stays `/community/{slug}` for every variant
 * (08B §18 — sort/filter variants are noindex and never a second canonical).
 */

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!servesPage("community", `/community/${slug}`)) {
    /* The client-resolved reviewer segment: noindex, no canonical for content the server cannot see. */
    return reviewerEntryMetadata();
  }
  const entry = getForumEntry(slug);
  if (!entry) return {};
  return forumEntryMetadata(entry);
}

const one = (v: string | string[] | undefined): string | null => (typeof v === "string" ? v : null);

export default async function ForumEntryRoute({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { slug } = await params;

  if (!servesPage("community", `/community/${slug}`)) {
    /* Not a corpus entry: resolve against the reviewer's own store, or render the honest not-found state. */
    return (
      <>
        <GlobalShellChrome askAnchor={null} activePrimaryNav="Community" activeBottomNav="Community" />
        <ReviewerEntryView slug={slug} />
      </>
    );
  }

  const sp = searchParams ? await searchParams : {};
  const model = buildForumEntryModel(slug, { sort: one(sp["sort"]), page: one(sp["page"]) });
  if (!model) {
    /* A registered slug whose model cannot be built is a configuration fault, not a page. */
    return (
      <>
        <GlobalShellChrome askAnchor={null} activePrimaryNav="Community" activeBottomNav="Community" />
        <ReviewerEntryView slug={slug} />
      </>
    );
  }

  return (
    <>
      <GlobalShellChrome askAnchor={null} activePrimaryNav="Community" activeBottomNav="Community" />
      <ForumEntryPage model={model} />
    </>
  );
}
