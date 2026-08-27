import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveGamePreview } from "@/lib/game/gamePreviewGuard";
import { gameConfigFor } from "@/lib/game/gameConfigRegistry";
import { buildArchiveModel } from "@/lib/archive/archiveModel";
import { parseArchiveYearSegment } from "@/lib/archive/archiveYear";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import ArchiveView from "@/components/archive/ArchiveView";
import JsonLd from "@/components/seo/JsonLd";
import { archiveSchema } from "@/lib/archive/archiveSchema";
import GlobalShellChrome from "@/components/shell/GlobalShellChrome";
import { canonicalUrl } from "@/lib/seo/productionOrigin";

/*
 * THE YEARLY HISTORY ARCHIVE ROUTE — `/{state}/{game}/{year}` — LRG-ARCHIVE-054.
 *
 * Authority: the 2026-08-05 execution brief §6 (preview guard and route rules), §7 (metadata), §13 (SEO);
 * archive blueprint §29–§31; `CLAUDE.md` §10 (route and migration rules).
 *
 * ══ THE ROUTE PATTERN IS PRODUCTION'S, THE SPECIFIC URL IS NOT ══
 *
 * `struts.xml` maps the wildcard action `*​/*​/*` to `GameResultsHistoryAction` with `selectedYear={3}`, so
 * `/{state}/{game}/{year}` is a live production pattern and this is the right shape. But the specific URL is
 * new. The production sitemap contains:
 *
 *     /fl/pick-3-evening/{1988…2023}   36 indexed years
 *     /fl/pick-3-midday/{2008…2023}    16 indexed years
 *     /fl/pick-3/{year}                 0 — does not exist
 *
 * Production splits Pick 3 into two GAMES with two yearly archives. The founder has directed one FAMILY route
 * with Midday and Evening as independent rows, which would consolidate 52 indexed URLs into roughly 26. That is
 * a migration, not a rendering decision: it needs the route, canonical, traffic, backlink and edge-redirect
 * audit that `CLAUDE.md` §10 requires. So this route is INTRODUCED and registry-limited, exactly as
 * `/fl/pick-3` is, and
 * the conflict is recorded in the implementation record rather than silently resolved.
 *
 * No redirect is added. No canonical is emitted. No sitemap entry exists — the repository has no `sitemap.ts`
 * route at all, and `sitemapEntries()` emits no game or archive path, so exclusion is structural.
 *
 * ══ THREE INDEPENDENT CONDITIONS ══
 *
 *   1. `resolveGamePreview` — the same explicit game-registry boundary `/fl/pick-3` uses. No custom environment
 *      flag is required for local review.
 *   2. `isArchiveEligible` — an explicit state/game/YEAR registry entry. `CLAUDE.md` §10 requires route existence
 *      to come from a registry and never from data, and an earlier revision of this route got that wrong: it
 *      accepted any eligible game with any parseable year and 404'd only when the fixture produced no rows, which
 *      made `/fl/cash-pop/2026`, `/fl/lotto/2026`, `/ca/superlotto-plus/2026` and `/fl/powerball/2026` all
 *      resolve. The brief scopes this task to one archive page.
 *   3. A built model with rows. Belt and braces after (2): a registered year that somehow produced nothing must
 *      404 rather than publish an empty archive, which would read as a claim that the game had no drawings.
 *
 * A future year 404s at step (2) as well as at the model, because blueprint §31 requires it.
 *
 * ══ WHY THE DIRECTORY IS `[segment]` AND NOT `[year]` ══
 *
 * Because Next.js rejects two different slug names at the same dynamic depth, and it does so at REQUEST time
 * rather than at build time. `app/[state]/[game]/[year]/` alongside the existing `app/[state]/[game]/[section]/`
 * compiled cleanly and listed both routes in the build table — then every request failed with *"You cannot use
 * different slug names for the same dynamic path ('section' !== 'year')."*
 *
 * A build-only probe therefore proves nothing here; the pair has to be SERVED to be verified, and an earlier
 * probe's 500s were this error rather than the stale-`.next` corruption they were first taken for.
 *
 * So both share one name. The archive is `[segment]/page.tsx`, an article is `[segment]/[slug]/page.tsx`, and
 * they disambiguate on CONTENT rather than on position: a four-digit year is an archive, a known editorial
 * segment is an article, and anything else 404s in both. No URL changed in either direction.
 *
 * This is the one pre-existing file this task renames, and it is renamed rather than worked around because the
 * alternative — nesting the archive a level deeper — would have invented a URL that production does not have.
 */

type Params = Promise<{ state: string; game: string; segment: string }>;

/**
 * Preview-safe metadata.
 *
 * ══ THE SELF-REFERENCING CANONICAL — §A4 / `ROUTE-AUDIT-001` §9 ══
 *
 * This route used to emit NO canonical, on the 2026-08-05 brief's instruction — *"do not emit a production
 * canonical from synthetic review content"*. `ROUTE-AUDIT-001` §9 records the consequence in its own row: *"The
 * archive emits no canonical at all … On ungating this must become a self-referencing canonical, or the archive
 * ships as the one indexable page with no canonical signal."* The active founder instruction closes that gap now
 * rather than at ungating, and it is safe to close now for one reason: the page is `noindex, nofollow`, so no
 * canonical signal reaches a crawler and no synthetic row is nominated as authoritative for anything.
 *
 * ══ WHAT THIS DOES NOT DECIDE ══
 *
 * **No host and no trailing-slash decision is made HERE.** The value comes from `canonicalUrl`, the origin
 * constant `/fl/powerball`, `/powerball`, `/mega-millions` and the guarded State page already share — one
 * constant, now the ratified `www` no-trailing-slash form (`FD-RTE-01`/`02`/`03`, ratified 2026-08-11 and
 * implemented by FD-RTE Stage 1). The canonical and the `noindex` below COEXIST DELIBERATELY during
 * pre-launch: the tag reaches no crawler while `noindex` stands. No redirect, no sitemap entry and no
 * `robots.txt` change is made here.
 *
 * The conflict between the brief's "no canonical" and this instruction is recorded in
 * `03-docs/08-decisions/source-conflicts.md`; the active task is tier 1 in `CLAUDE.md` §2 and settles it.
 *
 * The production title and description templates that blueprint §30 specifies are recorded in the
 * implementation record for the later cutover. Writing them here would emit them now.
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state, game, segment } = await params;
  if (!resolveGamePreview(state, game)) return {};

  const parsed = parseArchiveYearSegment(segment);
  /* `FD-GATE-01`: one call expresses BOTH conditions an archive page needs — the game pair and the enumerated
     year — so the two can no longer be checked in one place and forgotten in another. */
  if (parsed === null || !servesPage("archive", state, game, parsed)) return {};

  const cfg = gameConfigFor(state, game);
  if (!cfg) return {};
  const model = buildArchiveModel(state, game, parsed, cfg, true);
  if (!model || model.rows.length === 0) return {};

  return {
    title: {
      absolute: `${model.stateName} ${model.gameLabel} Results ${parsed} — internal preview | LotteryCorner`,
    },
    /* Says what the page IS, so the description cannot be mistaken for a public claim about the year. */
    description:
      `Internal design-review preview of the ${model.stateName} ${model.gameLabel} ${parsed} results archive. `
      + "Contains internal review samples and is not published.",
    /* Self-referencing, built from the governed origin constant — never from the request host, which is how a
       preview or a local hostname leaks into a canonical. See the note above for what this deliberately does not
       decide. */
    alternates: { canonical: canonicalUrl(`/${state}/${game}/${parsed}`) },
    robots: { index: false, follow: false },
  };
}

export default async function ArchiveRoute({ params }: { params: Params }) {
  const { state, game, segment } = await params;

  /* Guard first, before anything else is read. */
  if (!resolveGamePreview(state, game)) notFound();

  const parsed = parseArchiveYearSegment(segment);
  if (parsed === null) notFound();
  /* The route inventory is the registry, never the data — and `FD-GATE-01` makes it the SAME registry call the
     other four families use, so `routeInventory()` can enumerate this family too. */
  if (!servesPage("archive", state, game, parsed)) notFound();

  const config = gameConfigFor(state, game);
  if (!config) notFound();

  const model = buildArchiveModel(state, game, parsed, config, true);
  /* A year with no connected drawings is not a page. Publishing an empty archive would state something false
     about that year by implication, and would create an indexable near-duplicate of every other empty year. */
  if (!model || model.rows.length === 0) notFound();

  /*
   * §A2 — the approved Global Shell chrome on the archive route, plus the page's own landmark.
   *
   * `askAnchor={null}` on purpose. `FD-DAT-17` removed Ask-the-Archive because every AI execution has to be
   * metered per Account (`FD-DAT-12`) and no Account service exists, so this page has NO answer surface. GS-06 is
   * therefore rendered as a labelled unavailable affordance rather than a control that scrolls to nothing —
   * exactly the distinction `FD-ACC-14` and `CLAUDE.md` §9 require.
   */
  return (
    <>
      {/*
        LRG-UX-SCHEMA-001 correction 4. Blueprint §32's conceptual list, minus the one line it makes conditional:
        no `Dataset`, because no governed dataset release exists. The `ItemList` is the rendered result rows, in
        render order, anchored on each row's own game-local-date fragment. `noindex` is untouched — this route's
        robots posture is a launch decision, and describing a page correctly is not publishing it.
      */}
      <JsonLd data={archiveSchema(model)} />
      <GlobalShellChrome askAnchor={null} activePrimaryNav="Results" activeBottomNav="Results" />
      <main id="ar-main">
        <ArchiveView model={model} />
      </main>
    </>
  );
}
