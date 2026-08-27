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

import Link from "next/link";
import type { HomePageData } from "@/lib/data-provider/types";
import { cleanCopy } from "@/lib/text/cleanCopy";
import { webPageSchema, itemListSchema } from "@/lib/seo/siteSchema";
import { faqJsonLd } from "@/lib/archived/legacy/seo/metadata";
import JsonLd from "@/components/seo/JsonLd";
import AdSlot from "@/components/archived/legacy/ads/AdSlot";
import StickyFooterAd from "@/components/archived/legacy/ads/StickyFooterAd";
import DynamicResultCard from "@/components/archived/legacy/results/DynamicResultCard";
import DataTable from "@/components/archived/legacy/modules/DataTable";
import HighlightsAlerts from "@/components/archived/legacy/modules/HighlightsAlerts";
import InfoSectionList from "@/components/archived/legacy/modules/InfoSectionList";
import FaqAccordion from "@/components/archived/legacy/modules/FaqAccordion";
import ContentFreshnessNote from "@/components/archived/legacy/modules/ContentFreshnessNote";
import BuyTicketsCta from "@/components/archived/legacy/cta/BuyTicketsCta";
import CampaignPlacement from "@/components/archived/legacy/campaign/CampaignPlacement";
import StateDirectory from "@/components/archived/legacy/home/StateDirectory";
import { gameThemeVarsFor, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";

function asArr(v: string[] | string | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{children}</h2>;
}

/*
 * HomeTemplate — light theme, content-driven from home-page-sample.json. Reuses shared components.
 * AI/tools/Buy-Tickets/campaigns are CONTENT modules, never ad-slot replacements. All GAM slots
 * preserved by slotKey. Refinements: feature tool rows, richer news/popular/jackpot/insider sections,
 * state directory filter, and approved campaign placement hooks.
 */
export default function HomeTemplate({ data }: { data: HomePageData }) {
  const p = data.page;
  const ads = data.adSlotRefs ?? {};
  const inContent = asArr(ads.inContent);
  const rightRail = asArr(ads.rightRail);
  const mobileInContent = asArr(ads.mobileInContent);
  const stickyFooterAd = typeof ads.stickyFooterAd === "string" ? ads.stickyFooterAd : undefined;
  let ic = 0;
  const nextAd = () => (inContent[ic] ? <AdSlot key={`ic${ic}`} slotKey={inContent[ic++]} /> : null);

  return (
    <>
      {asArr(ads.top).length > 0 ? (
        <div style={{ background: "var(--lc-info-bg)" }}>
          <div className="lc-container py-3">{asArr(ads.top).map((k) => <AdSlot key={k} slotKey={k} />)}</div>
        </div>
      ) : null}

      <JsonLd data={webPageSchema({ name: cleanCopy(p.h1), path: "/", description: cleanCopy(p.intro) })} />
      {data.browseByState?.states ? <JsonLd data={itemListSchema({ name: "US State Lotteries", items: data.browseByState.states.map((s) => ({ name: s.name, path: s.href })) })} /> : null}
      {data.popularGames?.items ? <JsonLd data={itemListSchema({ name: "Popular Lottery Games", items: data.popularGames.items.map((g) => ({ name: g.displayName, path: g.href })) })} /> : null}
      {data.faqs?.visibleOnPage && data.faqs.items ? <JsonLd data={faqJsonLd(data.faqs.items)} /> : null}

      {/* pb-28 clears the fixed sticky footer ad (desktop 728x90 bar) so content is never covered. */}
      <div className="lc-container py-4 pb-28 text-[15px] leading-relaxed">
        {/* Hero */}
        <section className="pt-2">
          <h1 className="text-2xl font-extrabold sm:text-4xl" style={{ color: "var(--lc-heading)" }}>{cleanCopy(p.h1)}</h1>
          <p className="mt-2 max-w-3xl text-base" style={{ color: "var(--lc-muted)" }}>{cleanCopy(p.intro)}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--lc-muted)" }}>{cleanCopy(p.lastUpdated.display)}</p>
          <div className="mt-2"><ContentFreshnessNote data={data.contentMeta} /></div>
        </section>

        <CampaignPlacement placement="home.heroBelow" page="home" />

        {/* State quick links */}
        {data.stateSearch ? (
          <section className="mt-6">
            <H2>{cleanCopy(data.stateSearch.heading, "Find Your State Lottery")}</H2>
            {data.stateSearch.intro ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.stateSearch.intro)}</p> : null}
            {data.browseByState?.states ? (
              <ul className="flex flex-wrap gap-2">
                {data.browseByState.states.map((s) => (
                  <li key={s.code}><Link href={s.href} className="inline-block rounded-md border px-3 py-1.5 text-sm font-semibold" style={{ borderColor: "var(--lc-border)", color: "var(--lc-heading)" }}>{cleanCopy(s.name)}</Link></li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-8">
            {/* Feature games with generic tool rows */}
            {data.featureGames?.cards ? (
              <section>
                <H2>{cleanCopy(data.featureGames.heading, "Powerball & Mega Millions")}</H2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.featureGames.cards.map((c) => (
                    <div key={c.gameId} className="flex flex-col gap-2">
                      <DynamicResultCard card={c} />
                      {c.toolLinks && c.toolLinks.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {c.toolLinks.map((t, i) => (
                            <Link key={i} href={t.href} className="rounded border px-2 py-1 text-xs" style={{ borderColor: "var(--lc-border)", color: "var(--lc-muted)" }}>{cleanCopy(t.label)}</Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {nextAd()}

            {/* Top jackpots + campaign */}
            {/* Column 0 is the game name, so the table themes each row from it — see `DataTable`. */}
            {data.topJackpots ? <DataTable id="top-jackpots" data={data.topJackpots} gameNameColumn={0} /> : null}
            <CampaignPlacement placement="home.afterTopJackpots" page="home" />

            {/* Latest results */}
            {data.latestResults?.cards ? (
              <section>
                <H2>{cleanCopy(data.latestResults.heading, "Latest Results")}</H2>
                {data.latestResults.intro ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.latestResults.intro)}</p> : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{data.latestResults.cards.map((c) => <DynamicResultCard key={c.gameId} card={c} />)}</div>
              </section>
            ) : null}
            {nextAd()}

            {/* Upcoming / awaiting (cards) */}
            {data.upcoming?.items ? (
              <section>
                <H2>{cleanCopy(data.upcoming.heading, "Upcoming Draws")}</H2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {data.upcoming.items.map((u, i) => (
                    /* These rows carry a game NAME and no slug, so the theme is resolved by name — the same
                       route `gameLogoByName` already takes for the logo on this page. */
                    <div key={i} className="rounded-md p-3" style={{ ...gameThemeVarsFor(u.game), background: "var(--lc-surface)", border: "1px solid var(--lc-border)", borderLeft: "3px solid var(--gt-accent-ink)" }} data-game-theme={resolveGameTheme(u.game).id}>
                      <p className="text-sm font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(u.game)}</p>
                      <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(u.display)}</p>
                      {/* An AWAITING notice stays neutral: it is a status, not the game's jackpot, and colouring
                          it as one would make an empty result read as a figure. */}
                      {u.status === "awaiting" ? <p className="mt-1 text-sm font-semibold" style={{ color: "var(--lc-muted)" }}>{cleanCopy(u.statusNote, "Awaiting latest results")}</p> : u.jackpot ? <p className="mt-1 text-sm font-semibold" style={{ color: "var(--gt-accent-ink)" }}>{cleanCopy(u.jackpot)}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {nextAd()}

            <CampaignPlacement placement="home.beforeNews" page="home" />

            {/* Live Lottery News (rich cards) */}
            {data.liveNews?.items ? (
              <section>
                <H2>{cleanCopy(data.liveNews.heading, "Live Lottery News")}</H2>
                {data.liveNews.intro ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.liveNews.intro)}</p> : null}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {data.liveNews.items.map((n, i) => (
                    <article key={i} className="flex flex-col overflow-hidden rounded-md" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
                      <div className="flex h-24 items-center justify-center text-xs" style={{ background: "var(--lc-info-bg)", color: "var(--lc-muted)" }} aria-hidden>Image</div>
                      <div className="flex flex-col gap-1 p-3">
                        <div className="flex items-center justify-between text-xs" style={{ color: "var(--lc-muted)" }}>
                          <span className="rounded px-1.5 py-0.5" style={{ background: "var(--lc-info-bg)" }}>{cleanCopy(n.category, "News")}</span>
                          <span>{cleanCopy(n.date)}</span>
                        </div>
                        <h3 className="text-sm font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(n.title)}</h3>
                        {n.summary ? <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(n.summary)}</p> : null}
                        <Link href={n.href} className="mt-1 text-sm font-semibold" style={{ color: "var(--lc-accent)" }}>Continue Reading →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
            {nextAd()}

            {/* Winners & unclaimed (highlights) */}
            <HighlightsAlerts data={data.news} />
            {nextAd()}

            {/* Most popular games (rich cards) */}
            {data.popularGames?.items ? (
              <section>
                <H2>{cleanCopy(data.popularGames.heading, "Most Popular Games")}</H2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {data.popularGames.items.map((g) => (
                    <div key={g.slug} className="flex flex-col gap-1 rounded-md p-3" style={{ ...gameThemeVarsFor(g.slug), background: "var(--lc-surface)", border: "1px solid var(--lc-border)", borderTop: "3px solid var(--gt-accent-ink)" }} data-game-theme={resolveGameTheme(g.slug).id}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(g.displayName)}</p>
                        {g.jurisdiction ? <span className="text-xs" style={{ color: "var(--lc-muted)" }}>{cleanCopy(g.jurisdiction)}</span> : null}
                      </div>
                      {g.topPrize ? <p className="text-sm font-semibold" style={{ color: "var(--gt-accent-ink)" }}>{cleanCopy(g.topPrize)}</p> : null}
                      {g.nextDraw ? <p className="text-xs" style={{ color: "var(--lc-muted)" }}>Next draw: {cleanCopy(g.nextDraw)}</p> : null}
                      <div className="mt-1 flex items-center gap-2">
                        <Link href={g.href} className="rounded border px-2.5 py-1 text-xs" style={{ borderColor: "var(--lc-border)" }}>View Details</Link>
                        {g.buyTickets ? <div className="min-w-[110px]"><BuyTicketsCta href={g.buyTickets} label="Buy Tickets" /></div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {nextAd()}

            {/* Jackpot snapshot & comparison — FACTUAL summary cards only. No simulated trend chart:
                a chart is rendered only when real historical `series` data exists (future API/DB). */}
            {data.jackpotHistory?.items ? (
              <section>
                <H2>{cleanCopy(data.jackpotHistory.heading, "Jackpot Snapshot & Comparison")}</H2>
                {data.jackpotHistory.intro ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.jackpotHistory.intro)}</p> : null}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {data.jackpotHistory.items.map((j, i) => (
                    <div key={i} className="flex flex-col gap-1 rounded-md p-3" style={{ ...gameThemeVarsFor(j.game), background: "var(--lc-surface)", border: "1px solid var(--lc-border)", borderTop: "3px solid var(--gt-accent-ink)" }} data-game-theme={resolveGameTheme(j.game).id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(j.game)}</p>
                        {j.current ? <p className="text-sm font-bold" style={{ color: "var(--gt-accent-ink)" }}>{cleanCopy(j.current)}</p> : null}
                      </div>
                      {j.nextDraw ? <p className="text-xs" style={{ color: "var(--lc-muted)" }}>Next draw: {cleanCopy(j.nextDraw)}</p> : null}
                      {j.previous ? <p className="text-xs" style={{ color: "var(--lc-muted)" }}>Previous estimate: {cleanCopy(j.previous)}</p> : null}
                      {j.change ? <p className="text-xs" style={{ color: "var(--lc-muted)" }}>Change vs previous: {cleanCopy(j.change)}</p> : null}
                      {j.status ? <p className="text-xs" style={{ color: "var(--lc-muted)" }}>{cleanCopy(j.status)}</p> : null}
                      {j.href ? <Link href={j.href} className="mt-1 text-sm font-semibold" style={{ color: "var(--gt-accent-ink)" }}>View jackpot history →</Link> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {nextAd()}

            {/* Insider band (full-width content banner) */}
            {data.insider?.features ? (
              <section className="rounded-lg p-5" style={{ background: "#0a142f", color: "#e2e8f0" }} aria-label={data.insider.heading}>
                <h2 className="text-xl font-extrabold text-white">{cleanCopy(data.insider.heading, "Lottery Corner Insider")}</h2>
                {data.insider.subheading ? <p className="mt-1 text-sm" style={{ color: "#cbd5e1" }}>{cleanCopy(data.insider.subheading)}</p> : null}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {data.insider.features.map((f, i) => (
                    <div key={i} className="rounded-md p-3" style={{ background: "#111a2b", border: "1px solid #1f2b40" }}>
                      <p className="text-sm font-bold text-white">{cleanCopy(f.title)}</p>
                      {f.desc ? <p className="text-sm" style={{ color: "#94a3b8" }}>{cleanCopy(f.desc)}</p> : null}
                    </div>
                  ))}
                </div>
                {data.insider.cta ? <Link href={data.insider.cta.href} className="mt-4 inline-block rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--lc-accent)" }}>{cleanCopy(data.insider.cta.label)}</Link> : null}
              </section>
            ) : null}
            <CampaignPlacement placement="home.insiderBand" page="home" />

            {/* Buy Tickets highlight */}
            {data.buyTicketsHighlight ? (
              <section className="rounded-md p-4" style={{ background: "var(--lc-info-bg)", border: "1px solid var(--lc-info-border)" }}>
                <H2>{cleanCopy(data.buyTicketsHighlight.heading, "Play Your Favorite Games")}</H2>
                {data.buyTicketsHighlight.copy ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.buyTicketsHighlight.copy)}</p> : null}
                {data.buyTicketsHighlight.cta ? <div className="max-w-[220px]"><BuyTicketsCta href={data.buyTicketsHighlight.cta.href} label={data.buyTicketsHighlight.cta.label} /></div> : null}
              </section>
            ) : null}

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

            {/* Lottery systems / number analysis (responsible) */}
            <InfoSectionList id="systems" heading={data.systems?.heading} intro={data.systems?.intro} sections={data.systems?.sections} />
            {nextAd()}

            {/* Blog / guides */}
            {data.blog?.items ? (
              <section>
                <H2>{cleanCopy(data.blog.heading, "Lottery Blog & Guides")}</H2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {data.blog.items.map((b, i) => (
                    <Link key={i} href={b.href} className="flex flex-col gap-1 rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
                      <div className="flex items-center justify-between text-xs" style={{ color: "var(--lc-muted)" }}>
                        <span>{cleanCopy(b.category, "Guide")}</span><span>{cleanCopy(b.date)}</span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(b.title)}</p>
                      {b.excerpt ? <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(b.excerpt)}</p> : null}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* FAQs */}
            <FaqAccordion faq={data.faqs} id="faqs" />

            {/* Browse by state (SEO internal linking + filter) */}
            {data.browseByState?.states ? (
              <section>
                <CampaignPlacement placement="home.beforeStateDirectory" page="home" />
                <H2>{cleanCopy(data.browseByState.heading, "Browse Lottery Results by State")}</H2>
                {data.browseByState.intro ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.browseByState.intro)}</p> : null}
                <StateDirectory states={data.browseByState.states} />
              </section>
            ) : null}

            {/* Newsletter */}
            {data.newsletter ? (
              <section className="rounded-md p-4" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
                <H2>{cleanCopy(data.newsletter.title, "Subscribe to our Newsletter")}</H2>
                {data.newsletter.text ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.newsletter.text)}</p> : null}
                <form action="#" className="flex max-w-md gap-2">
                  <input type="email" disabled placeholder={data.newsletter.emailPlaceholder ?? "Email address"} className="w-full rounded border px-2 py-1.5 text-sm" style={{ borderColor: "var(--lc-border)", background: "var(--lc-surface)" }} />
                  <button type="button" disabled className="rounded px-3 py-1.5 text-sm font-semibold text-white opacity-80" style={{ background: "var(--lc-accent)" }}>Subscribe</button>
                </form>
              </section>
            ) : null}

            {/* Safety net: render any configured in-content GAM slots not yet consumed above, so no
                fixed slot is ever silently dropped if section count changes. */}
            {inContent.slice(ic).map((k) => <AdSlot key={`ic-flush-${k}`} slotKey={k} />)}

            {asArr(ads.bottom).map((k) => <AdSlot key={k} slotKey={k} />)}
          </div>

          <aside className="hidden self-start lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-4" aria-label="Sponsored">
            {rightRail.map((k) => <AdSlot key={k} slotKey={k} />)}
          </aside>
        </div>

        <div className="mt-4 flex flex-col gap-2 lg:hidden">{mobileInContent.map((k) => <AdSlot key={k} slotKey={k} />)}</div>
      </div>

      {stickyFooterAd ? <StickyFooterAd slotKey={stickyFooterAd}><AdSlot slotKey={stickyFooterAd} sticky /></StickyFooterAd> : null}
    </>
  );
}
