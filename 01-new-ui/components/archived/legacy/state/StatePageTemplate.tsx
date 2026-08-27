/*
 * ══ ARCHIVED — NOT REACHABLE FROM ANY ROUTE. `FD-GATE-01`, 2026-08-11. ══
 *
 * Reuse classification (`CLAUDE.md` §6): **ARCHIVE**, not delete. §6 is explicit — *"Do not delete previous work
 * outside an approved cleanup task. ARCHIVE, do not delete."*
 *
 * ══ WHY IT MOVED ══
 *
 * `FD-GATE-01` ratified registry-only gating and made the blueprint-conformant templates the sole render path.
 * `HomeTemplate` and `StatePageTemplate` were the second path — the one an UNSET `LC_HOME_PREVIEW` or
 * `LC_STATE_PREVIEW` used to serve — and they are tier-7 reference work built against requirements the approved
 * blueprints superseded. Everything in this directory became unreachable when those two did.
 *
 * ══ WHY THE DIRECTORY MIRRORS THE ORIGINAL LAYOUT ══
 *
 * `components/archived/legacy/<original path>`, so the archived graph still resolves internally and still
 * type-checks. Imports were rewritten to `@/`-absolute form: a module that stayed LIVE (`JsonLd`, `cleanCopy`,
 * `data-provider`) is referenced at its live path, and an archived sibling at its archived path. Keeping it
 * compiling is the point — an archived tree that no longer builds is a tree nobody can bring back.
 *
 * ══ WHAT WOULD HAVE TO BE TRUE TO REVIVE ANY OF THIS ══
 *
 * A founder decision reversing `FD-GATE-01`, or a task that promotes a specific component out of here on its own
 * merits. Note that the ad renderers in `legacy/ads/` are NOT the current ad path — the approved families use
 * `PreviewAdSlot` and `StatePreviewAdSlot` — and that no ad SLOT DEFINITION was touched by archiving them:
 * `04-sample-data/ad-slot-definitions.json` and `lib/layout/adAnchors.ts` are both live and unchanged, which is
 * what `CLAUDE.md` §12 protects.
 */

import type { StatePageData } from "@/lib/data-provider/types";
import { cleanCopy } from "@/lib/text/cleanCopy";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/archived/legacy/seo/metadata";
import { webPageSchema } from "@/lib/seo/siteSchema";
import JsonLd from "@/components/seo/JsonLd";
import JackpotTicker from "@/components/archived/legacy/layout/JackpotTicker";
import AdSlot from "@/components/archived/legacy/ads/AdSlot";
import StickyFooterAd from "@/components/archived/legacy/ads/StickyFooterAd";
import TabNav from "@/components/archived/legacy/state/TabNav";
import DynamicResultCard from "@/components/archived/legacy/results/DynamicResultCard";
import CheckTicketTool from "@/components/archived/legacy/modules/CheckTicketTool";
import FaqAccordion from "@/components/archived/legacy/modules/FaqAccordion";
import HighlightsAlerts from "@/components/archived/legacy/modules/HighlightsAlerts";
import HowToClaim from "@/components/archived/legacy/modules/HowToClaim";
import TaxInfo from "@/components/archived/legacy/modules/TaxInfo";
import OddsAccordion from "@/components/archived/legacy/modules/OddsAccordion";
import InfoSectionList from "@/components/archived/legacy/modules/InfoSectionList";
import QuickFactsTable from "@/components/archived/legacy/modules/QuickFactsTable";
import DrawScheduleTable from "@/components/archived/legacy/modules/DrawScheduleTable";
import HistoryLinksSection from "@/components/archived/legacy/modules/HistoryLinksSection";
import BiggestWinnersSection from "@/components/archived/legacy/modules/BiggestWinnersSection";
import HighlightsGrid from "@/components/archived/legacy/modules/HighlightsGrid";
import DataTable from "@/components/archived/legacy/modules/DataTable";
import ContentFreshnessNote from "@/components/archived/legacy/modules/ContentFreshnessNote";
import CampaignPlacement from "@/components/archived/legacy/campaign/CampaignPlacement";

/* Coerce an adSlotRefs entry (string[] | string) to a string[]. */
function asArr(v: string[] | string | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/*
 * Florida state page — follows the proposed PDF section flow (light theme). All copy is cleaned of
 * internal markers via cleanCopy. Layout NOT redesigned in this pass; only footer/sticky-ad,
 * right-rail behavior, and readability spacing were adjusted.
 */
export default function StatePageTemplate({ data }: { data: StatePageData }) {
  const p = data.page;
  const ads = data.adSlotRefs ?? {};
  const groups = data.latestResults.groups;
  const inContent = asArr(ads.inContent);
  const mobileInContent = asArr(ads.mobileInContent);
  const stickyFooterAd = typeof ads.stickyFooterAd === "string" ? ads.stickyFooterAd : undefined;

  return (
    <>
      {/* Jackpot ticker (full-bleed grey band) */}
      <JackpotTicker data={data.jackpotTicker} />

      {/* Single subtle top leaderboard on a pale-blue band (matches PDF) */}
      {asArr(ads.top).length > 0 ? (
        <div style={{ background: "var(--lc-info-bg)" }}>
          <div className="lc-container py-3">
            {asArr(ads.top).map((k) => (
              <AdSlot key={k} slotKey={k} />
            ))}
          </div>
        </div>
      ) : null}

      <JsonLd data={webPageSchema({ name: cleanCopy(p.h1), path: p.url, description: cleanCopy(p.intro) })} />
      <JsonLd data={breadcrumbJsonLd(data)} />
      {data.faqs?.visibleOnPage && data.faqs.items ? <JsonLd data={faqJsonLd(data.faqs.items)} /> : null}

      {/* pb-28 clears the fixed sticky footer ad (desktop 728x90 bar) so content is never covered. */}
      <div className="lc-container py-4 pb-28 text-[15px] leading-relaxed">
        {/* Breadcrumb */}
        <nav className="text-xs" style={{ color: "var(--lc-muted)" }} aria-label="Breadcrumb">
          {p.metadata.breadcrumb.map((b, i) => (
            <span key={b.url}>
              {i > 0 ? " › " : ""}
              <a href={b.url}>{cleanCopy(b.name)}</a>
            </span>
          ))}
        </nav>

        {/* Hero */}
        <section id="results" className="pt-3">
          <h1 className="text-2xl font-extrabold sm:text-4xl" style={{ color: "var(--lc-heading)" }}>{cleanCopy(p.h1)}</h1>
          <p className="mt-2 max-w-3xl text-base" style={{ color: "var(--lc-muted)" }}>{cleanCopy(p.intro)}</p>
        </section>

        {/* Tabs */}
        <div className="mt-4">
          <TabNav tabs={data.tabs} />
        </div>

        {/* Campaign placement (content module; renders only if a matching campaign exists). */}
        <CampaignPlacement placement="state.afterHero" page="state" stateCode={p.stateCode} />

        {/*
          Two-column: latest results + right rail. RIGHT-RAIL POLICY: the rail is reserved for
          PRODUCTION ad slots + known widgets ONLY. Do NOT add AI teasers or new promo banners here
          without Bala approval — AI teasers stay in content sections and must not replace ad inventory.
          Rail is sticky so ads stay in view and the column doesn't read as dead space.
        */}
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex max-w-[70ch] flex-col gap-7">
            {/* Optional generic module: Quick Facts (renders only if state JSON provides it). */}
            <QuickFactsTable data={data.quickFacts} />

            <section>
              <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.latestResults.heading, "Latest Draw Results")}</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(p.lastUpdated.display)}</p>
              {data.latestResults.intro ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.latestResults.intro)}</p> : null}
              {data.latestResults.infoCallout ? (
                <p className="mt-3 rounded-md p-3 text-sm" style={{ background: "var(--lc-info-bg)", border: "1px solid var(--lc-info-border)" }}>
                  ⓘ {cleanCopy(data.latestResults.infoCallout)}
                </p>
              ) : null}
              {/* Optional generic module: content freshness / admin-review note. */}
              <div className="mt-2"><ContentFreshnessNote data={data.contentMeta} /></div>
            </section>

            {groups.map((group, gi) => (
              <section key={group.groupKey} aria-label={group.heading}>
                <h3 className="mb-3 text-lg font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(group.heading)}</h3>
                <div
                  className={
                    group.groupKey === "multiState"
                      ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                      : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {group.resultCards.map((card) => (
                    <DynamicResultCard key={card.gameId} card={card} />
                  ))}
                </div>
                {inContent[gi] ? <AdSlot slotKey={inContent[gi]} /> : null}
                {mobileInContent[gi] ? (
                  <div className="lg:hidden">
                    <AdSlot slotKey={mobileInContent[gi]} />
                  </div>
                ) : null}
              </section>
            ))}

            {/* Optional generic module: Draw Schedule table (id="schedule" tab anchor). */}
            <DrawScheduleTable data={data.drawSchedule} />

            <CampaignPlacement placement="state.afterLatestResults" page="state" stateCode={p.stateCode} />

            {/* Optional generic module: Jackpot Tracker ("Did anyone win last night?") table. */}
            <DataTable id="jackpot-tracker" data={data.jackpotTracker} />

            {/* Optional generic module: Highlights "Today" stat grid (e.g. NY). */}
            <HighlightsGrid data={data.highlightsGrid} />

            <CheckTicketTool data={data.checkTicket} />
            <FaqAccordion faq={data.faqs} />

            {/* Optional generic module: Winning-history internal links (id="winning-history" anchor). */}
            <HistoryLinksSection data={data.historyLinks} />

            <HighlightsAlerts data={data.highlights} />

            {/* Optional generic module: recent-winner location table (e.g. DE/MA/MI). */}
            <DataTable id="winner-location" data={data.winnerLocation} />

            {/* Optional generic module: Biggest Winners. */}
            <BiggestWinnersSection data={data.biggestWinners} />

            {/* Optional generic module: "which game to play" comparison table (e.g. AR/CT). */}
            <DataTable id="game-comparison" data={data.gameComparison} />

            {/* Optional generic module: Scratch-Offs overview (reuses generic InfoSectionList). */}
            <InfoSectionList id="scratch-offs" heading={data.scratchOffs?.heading} intro={data.scratchOffs?.intro} sections={data.scratchOffs?.sections} />

            {/* Optional generic module: Second-Chance promotions (reuses generic InfoSectionList). */}
            <InfoSectionList id="second-chance" heading={data.secondChance?.heading} intro={data.secondChance?.intro} sections={data.secondChance?.sections} />

            <CampaignPlacement placement="state.beforeClaiming" page="state" stateCode={p.stateCode} />

            <HowToClaim data={data.howToClaim} />
            <TaxInfo data={data.taxes} />
            <OddsAccordion data={data.oddsGuide} />
            <InfoSectionList id="player-info" heading={data.playerInfo?.heading} intro={data.playerInfo?.intro} sections={data.playerInfo?.sections} />

            {/* Optional generic module: Where Lottery Money Goes / Fund Allocation. */}
            <InfoSectionList id="fund-allocation" heading={data.fundAllocation?.heading} intro={data.fundAllocation?.intro} sections={data.fundAllocation?.sections} />

            {/* Optional generic module: Winner anonymity rules. */}
            <InfoSectionList id="anonymity" heading={data.anonymityRules?.heading} intro={data.anonymityRules?.intro} sections={data.anonymityRules?.sections} />

            {/* Optional generic module: Number trends / statistics. */}
            <InfoSectionList id="number-trends" heading={data.numberTrends?.heading} intro={data.numberTrends?.intro} sections={data.numberTrends?.sections} />

            {/* Optional generic module: Legal & Responsible Play (reuses generic InfoSectionList). */}
            <InfoSectionList id="legal-responsible-play" heading={data.legalResponsiblePlay?.heading} intro={data.legalResponsiblePlay?.intro} sections={data.legalResponsiblePlay?.sections} />

            <InfoSectionList id="methodology" heading={data.sourcesMethodology?.heading} intro={data.sourcesMethodology?.intro} groups={data.sourcesMethodology?.groups} />
            {/*
              §C1 — THE AI TOOLS TEASER IS GONE.

              It rendered "(coming soon)" plus a `<button disabled>` reading "Sign in to try". `FD-DAT-17` requires
              a model-executed Ask surface to be ABSENT rather than gated-and-dead, and `FD-ACC-14` / `CLAUDE.md` §9
              forbid a disabled control presented as functional — a permanently-disabled sign-in button is exactly
              that. `FD-DAT-02` also makes Ask an Account action, and no account service exists, so the promise could
              not be kept.

              REPLACED WITH NOTHING, deliberately. This is the legacy template — tier-7 reference work superseded by
              the approved blueprints — so adding a real AI surface here would be building the wrong page. The
              approved families carry the working deterministic surfaces (State S-03, the Game Page's AI band,
              flagship FG-03), and the shared shell's GS-06 reaches them from every route.

              The component is ARCHIVED, not deleted (`CLAUDE.md` §6): `components/archived/AiToolsTeaser.tsx`.
              The `aiToolsTeaser` fixture field is left in place — removing a data field is a fixture task.
            */}
            <CampaignPlacement placement="state.beforeFaq" page="state" stateCode={p.stateCode} />

            <FaqAccordion faq={data.finalFaqs} id="faqs" />

            {/* Trust notices */}
            <section className="flex flex-col gap-1.5 text-xs" style={{ color: "var(--lc-muted)" }}>
              {data.officialSourceNotice?.text ? <p>{cleanCopy(data.officialSourceNotice.text)}</p> : null}
              {data.independenceDisclaimer?.text ? <p>{cleanCopy(data.independenceDisclaimer.text)}</p> : null}
              {data.responsiblePlayNotice?.text ? <p>{cleanCopy(data.responsiblePlayNotice.text)}</p> : null}
            </section>

            {asArr(ads.bottom).map((k) => (
              <AdSlot key={k} slotKey={k} />
            ))}
          </div>

          {/* Right rail — reserved fixed ad slots only (desktop); sticky so ads stay in view. */}
          <aside className="hidden self-start lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-4" aria-label="Sponsored">
            {asArr(ads.rightRail).map((k) => (
              <AdSlot key={k} slotKey={k} />
            ))}
          </aside>
        </div>
      </div>

      {/* Production sticky, closable footer ad (bottom_large_leaderboard). Placeholder only, no live GAM. */}
      {stickyFooterAd ? (
        <StickyFooterAd slotKey={stickyFooterAd}>
          <AdSlot slotKey={stickyFooterAd} sticky />
        </StickyFooterAd>
      ) : null}
    </>
  );
}
