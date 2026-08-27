import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { cleanCopy } from "@/lib/text/cleanCopy";
import HomePreview from "@/components/preview/HomePreview";
import {
  SampleDataNotice,
  PreviewHeader,
  JackpotTickerBand,
  BottomNav,
} from "@/components/shell/PreviewChrome";
import { buildHomePreview, type PreviewStateName } from "@/lib/preview/homePreviewModel";
import {
  assertProvenanceLabels,
  getHomePreviewAdMode,
  isHomePreviewDebug,
} from "@/lib/preview/previewGuard";
import JsonLd from "@/components/seo/JsonLd";
import { webPageSchema, itemListSchema } from "@/lib/seo/siteSchema";
import { canonicalUrl } from "@/lib/seo/productionOrigin";

/*
 * Home page (/) — ONE render path, gated by the registry. `FD-GATE-01`, ratified 2026-08-11.
 *
 * ══ WHAT CHANGED ══
 *
 * This route had TWO behaviours selected by `LC_HOME_PREVIEW`: the approved BP-02 composition when the flag was
 * set, and the legacy `HomeTemplate` when it was not. `FD-GATE-01` removed the flag, and with it the second path:
 * *"an environment variable that changes which pages exist makes 'what does this build serve?' a question about a
 * shell session rather than about the repository."*
 *
 * The consequence worth stating plainly: a flag being unset used to serve a page built against SUPERSEDED
 * requirements. The BP-02 composition is now the only thing this route can render, and `HomeTemplate` is ARCHIVED
 * (`CLAUDE.md` §6 — archived, not deleted).
 *
 * ══ WHAT DID NOT CHANGE ══
 *
 * `robots: noindex, nofollow`, which comes from the view model and is asserted by test. Availability and
 * indexability were always separate decisions and `FD-GATE-01` kept them separate — removing the gate made this
 * page REACHABLE, not PUBLISHED. Un-indexing is a separate launch task.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Developer-only preview state, readable ONLY while LC_HOME_PREVIEW=true:
 *
 *   /                          -> normal state, no correction UI
 *   /?previewState=corrected   -> exercises the corrected-result treatment
 *
 * This is a query parameter on the existing route. No new public route is created, and the whole
 * preview stays noindex.
 */
function readPreviewState(sp: Record<string, string | string[] | undefined>): PreviewStateName {
  return sp.previewState === "corrected" ? "corrected" : "default";
}

export function generateMetadata(): Metadata {
  /*
   * ONE metadata path. The fixture-driven branch is gone with the legacy template it described — and note that it
   * defaulted to `robots: "index,follow"`, so the removed branch was the only way this route could ever have
   * announced itself as indexable.
   */
  const vm = buildHomePreview();
  return {
    title: vm.page.title,
    description: vm.page.description,
    /* From the view model, so it cannot drift from the page it describes. Still `noindex, nofollow`.
       The canonical below and this `noindex` COEXIST DELIBERATELY: `FD-RTE-02`/`FD-RTE-03` are implemented,
       so Home self-canonicalises on the governed `www` origin, while indexability stays a separate launch
       decision. Pre-launch, the tag reaches no crawler; at cutover only `robots` changes. */
    robots: vm.page.robots,
    /* FD-RTE Stage 1 (ROUTE-AUDIT-001 §10): exactly one self-referencing canonical per page family. The root
       is the one path that legitimately keeps its trailing slash — it matches the sitemap's sole `/` entry. */
    alternates: { canonical: canonicalUrl("/") },
    openGraph: {
      type: "website",
      siteName: "Lottery Corner",
      url: canonicalUrl("/"),
      title: vm.page.title,
      description: vm.page.description,
    },
    // og:image and twitter summary_large_image are deliberately OMITTED: declaring a large-image
    // card with no image is malformed.
  };
}

export default async function HomePage({ searchParams }: { searchParams?: SearchParams }) {
  /*
   * The registry is the gate. `HOME_REGISTRY.enabled` is `true`, so this is not a branch anyone reaches today — it
   * exists so Home has the same shape as the other four families and so disabling it is the same kind of edit.
   */
  if (!servesPage("home")) notFound();
  const sp = searchParams ? await searchParams : {};
  const vm = buildHomePreview(new Date(), readPreviewState(sp));
  const debug = isHomePreviewDebug();

  // A synthetic or illustrative section missing its visible label is a defect, not a nit:
  // it is the difference between labelled preview content and invented lottery facts.
  assertProvenanceLabels(
    vm.entries
      .filter((e) => e.kind !== "ad-anchor")
      .map((e) => {
        const s = e as { id: string; provenance: string; provenanceLabel: string | null };
        return { id: s.id, provenance: s.provenance, provenanceLabel: s.provenanceLabel };
      }),
  );

  return (
    <div data-lc-preview="home">
      {/* BP-02 §69: WebPage + ItemList only. No BreadcrumbList on root Home, no NewsArticle on
          Home, no SearchAction. Schema reflects visible content only. */}
      <JsonLd data={webPageSchema({ name: vm.page.h1, path: "/", description: vm.page.intro })} />
      {vm.page.schema.itemList.map((l) => (
        <JsonLd key={l.name} data={itemListSchema(l)} />
      ))}

      {/*
        §2: the full-width sample-data strip is GONE from the normal founder view, so the page reads as
        the finished public Home. It returns under LC_HOME_PREVIEW_DEBUG=true.

        What is NOT conditional: the LC_HOME_PREVIEW guard, `robots: noindex, nofollow`,
        `meta.previewMode`, every data-* provenance attribute, and the assertProvenanceLabels check
        above — which still requires a label to exist on every synthetic section even though the label
        is no longer drawn. This page carries synthetic content and must not be served publicly.
      */}
      {debug ? <SampleDataNotice text={vm.shell.sampleDataNotice} /> : null}
      <PreviewHeader shell={vm.shell} debug={debug} />
      <JackpotTickerBand shell={vm.shell} />
      <main>
        <HomePreview vm={vm} adMode={getHomePreviewAdMode()} debug={debug} />
      </main>
      {/* LRG-SHELL-045: the global footer is supplied by the root layout, so Home no longer renders one of
          its own. Home's composition above the footer is untouched. */}
      <BottomNav shell={vm.shell} debug={debug} />
    </div>
  );
}
