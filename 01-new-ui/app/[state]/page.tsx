import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStatePage, getAvailableStateSamples } from "@/lib/data-provider";
import { stateViewConfigFor } from "@/lib/state/stateViewConfigRegistry";
import { canonicalUrl } from "@/lib/seo/productionOrigin";
import {
  getStatePreviewAdMode, getSimulatedOverride, isStatePreviewDebug,
} from "@/lib/state/statePreviewGuard";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import { buildStatePreviewModel } from "@/lib/state/statePreviewModel";
import StatePreview from "@/components/state/preview/StatePreview";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";

/*
 * State page route: /{state}  (e.g. /fl). Preserves the existing URL pattern (01-doc).
 *
 * ONE PATH, ONE ROUTE — `FD-GATE-01`, ratified 2026-08-11.
 *
 * ══ WHAT CHANGED ══
 *
 * This route had two paths. `resolveStatePreview` ANDed `LC_STATE_PREVIEW=true` with the jurisdiction registry's
 * `previewEnabled`; with the flag unset — the default — EVERY state including Florida fell through to the legacy
 * `StatePageTemplate`. `FD-GATE-01` removed the environment half. The registry's own `previewEnabled` is now the
 * whole decision, so a jurisdiction the registry enables renders the approved PF-02 composition on any build.
 *
 * A state the registry does NOT enable now 404s rather than serving a superseded template. That is the intended
 * consequence: `CLAUDE.md` §10 requires route existence to come from a registry, and a fixture-backed fallback for
 * 52 unreviewed jurisdictions was route existence derived from data by the back door.
 *
 * `StatePageTemplate` is ARCHIVED (`CLAUDE.md` §6 — archived, not deleted).
 *
 * ══ WHAT DID NOT CHANGE ══
 *
 * `robots: noindex, nofollow` on every served State page, `generateStaticParams`, the URL pattern, and the absence
 * of any canonical/redirect behaviour. Removing the gate made these pages REACHABLE, not PUBLISHED.
 *
 * Date-specific results use the SAME route + a date param later (not a separate route) — 01/05 docs.
 */

export function generateStaticParams() {
  return getAvailableStateSamples().map((state) => ({ state }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;

  /*
   * LRG-STATE-047 REG-02. The preview decision is taken FIRST, from the registry, before any fixture is
   * consulted. It used to sit behind `if (!getStatePage(state)) return { title: "Not found" }`, which made a
   * page fixture a precondition for the new template — fixture-derived route behaviour, and the reason a
   * no-lottery State could never have had metadata.
   */
  /*
   * LRG-STATE-043 — CONFIGURATION-DRIVEN METADATA FOR THE FINAL TEMPLATE.
   *
   * When a validated State view configuration exists, title, description, canonical and social metadata all
   * come from it (SEO-01, SEO-02, SEO-03, SEO-05) rather than from the fixture. Every other jurisdiction keeps
   * the existing fixture-driven behaviour untouched, so guard-off and legacy output cannot move.
   */
  /*
   * SCOPED TO THE GUARDED PREVIEW. An earlier revision applied this whenever a configuration existed, which
   * changed guard-off `/fl` — it gained the new title, the canonical and `index, follow`. SEO-04 requires
   * guard-off legacy behaviour to remain unchanged, and FD-S-32 defers emitting a canonical convention on the
   * production route, so the config-driven metadata is preview-only until the documented cutover.
   *
   * THE CUTOVER IS THIS CONDITION: drop `&& isPreview` here and set `robots` to index/follow.
   */
  const serves = servesPage("state", state);
  const cfg = stateViewConfigFor(state);
  if (cfg && serves) {
    const canonical = canonicalUrl(cfg.seo.canonicalPath);
    const meta: Metadata = {
      /* `absolute` bypasses the root layout's title template. Without it the rendered title was
         "… | LotteryCorner | Lottery Corner" — two site suffixes, which SEO-01's "one title" forbids. */
      title: { absolute: cfg.seo.title },
      description: cfg.seo.description,
      /* Absolute, `www` (FD-RTE-02), no trailing slash, no fragment — built from the governed origin, never
         from the request host, so a preview or local host can never become a canonical value (SEO-03). */
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        siteName: "LotteryCorner",
        title: cfg.seo.openGraph.title,
        description: cfg.seo.openGraph.description,
      },
      twitter: {
        /* `summary` rather than `summary_large_image`: no approved brand image asset exists yet, and claiming
           a large-image card without one produces a broken card. Recorded as an asset gap. */
        card: "summary",
        title: cfg.seo.openGraph.title,
        description: cfg.seo.openGraph.description,
      },
    };
    /* SEO-04: the guarded preview is never indexable. Switching the final template to index/follow is the
       documented cutover, not something this task activates. The self-referencing canonical above and this
       `noindex` COEXIST DELIBERATELY during pre-launch (FD-RTE Stage 1): the tag reaches no crawler while
       `noindex` stands, and at cutover only `robots` changes. */
    return { ...meta, robots: { index: false, follow: false } };
  }

  /*
   * A jurisdiction the registry does not serve has no page, so it has no metadata. This used to fall through to
   * fixture-driven metadata for the legacy template — which, note, took its `robots` from the fixture and so was
   * the only path by which a State route could have announced itself indexable.
   */
  return {};
}

export default async function StateRoute({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;

  /*
   * ONE ROUTE-BOUNDARY DECISION — now the registry alone (`FD-GATE-01`).
   *
   * The fixture is still passed in where one exists, because it supplies the legacy result cards the S-06 group
   * listing reads, but its ABSENCE does not block the template — Utah has no fixture and must still render.
   */
  if (servesPage("state", state)) {
    const model = buildStatePreviewModel(state, true, {
      fixture: getStatePage(state) ?? undefined,
      /* Config-controlled override simulation — never a real event, never AI-determined. */
      triggers: getSimulatedOverride(),
    });
    /* If the preview model cannot be built — no governed manifest or configuration for this jurisdiction —
       fall through to the existing implementation rather than rendering a broken preview. */
    if (model) {
      /*
       * §A2 — the approved Global Shell chrome, on the State route.
       *
       * Before this the guarded State page had the legacy `SiteHeader` (guard off) or NO header at all (with
       * `LC_HOME_PREVIEW=true`, where the layout rendered `children` alone). Now it has GS-02/03/05/06/07/09, and
       * GS-06 targets S-03 — the page's single shared answer surface — rather than a global chat button.
       *
       * `<main>` is supplied here because `StatePreview` deliberately renders a `<div id="state-main">`: the root
       * layout used to own the landmark, and that is what the skip link targets. The landmark wraps the chrome's
       * sibling, not the chrome, so the header and bottom navigation stay outside `main` where they belong.
       */
      return (
        <>
          <GlobalShellChrome askAnchor="state-ai-brief" activePrimaryNav="States" activeBottomNav="Results" />
          <main>
            <StatePreview
              model={model}
              adMode={getStatePreviewAdMode()}
              debug={isStatePreviewDebug()}
            />
          </main>
        </>
      );
    }
  }

  /*
   * NOT IN THE REGISTRY, SO NOT A PAGE.
   *
   * This used to render the legacy `StatePageTemplate` for any state with a fixture — 52 jurisdictions built
   * against superseded requirements, whose existence as URLs depended on a file being present in
   * `04-sample-data`. `CLAUDE.md` §10 forbids exactly that. Enabling a jurisdiction is now a
   * `jurisdictionRegistry` edit, and the edit is the review.
   */
  notFound();
}
