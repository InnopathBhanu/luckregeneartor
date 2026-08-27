import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildCommunityHomeModel } from "@/lib/community/communityHomeModel";
import { communityHomeMetadata } from "@/lib/community/communityRouteMetadata";
import CommunityHomePage from "@/components/community/CommunityHomePage";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * THE COMMUNITY HOME ROUTE — `/community`, per 08A (Final approved and frozen) and 08 §33 decision 2.
 *
 * `ROUTE-AUDIT-001` lists `/community` among the approved page-family routes `CLAUDE.md` §10 preserves. The
 * gate is the registry and nothing else (`FD-GATE-01`); the page is `noindex, nofollow` and in no sitemap
 * (`PUBLICATION_SAFETY`, and Conflict 41 amendment condition 3) until launch retires the review corpus.
 *
 * THERE IS NO `/community/new`. The composer is the CH-01 section of this page (08A §3); inventing a route
 * for it is expressly forbidden by the authorizing task.
 *
 * `?filter=`, `?state=`, `?game=`, `?tag=` drive the 08A §18 filters SERVER-SIDE on this one URL — the
 * canonical stays `/community` and no filter mints a route.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  if (!servesPage("community", "/community")) return {};
  return communityHomeMetadata();
}

const one = (v: string | string[] | undefined): string | null => (typeof v === "string" ? v : null);

export default async function CommunityHomeRoute({ searchParams }: { searchParams?: SearchParams }) {
  if (!servesPage("community", "/community")) notFound();

  const sp = searchParams ? await searchParams : {};
  const model = buildCommunityHomeModel({
    filter: one(sp["filter"]),
    state: one(sp["state"]),
    game: one(sp["game"]),
    tag: one(sp["tag"]),
  });

  return (
    <>
      {/* §A2 — the approved Global Shell chrome. The home's answer surfaces live on entry pages; GS-06 stays
          the labelled unavailable affordance rather than a control that pretends to work (CLAUDE.md §9). */}
      <GlobalShellChrome askAnchor={null} activePrimaryNav="Community" activeBottomNav="Community" />
      <CommunityHomePage model={model} />
    </>
  );
}
