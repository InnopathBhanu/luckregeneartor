# Florida UI Implementation Status (/fl)

Snapshot of the `/fl` state page in `01-new-ui` after the light-theme correction, mobile-nav/ad-slot
modeling, and footer/sticky-ad/right-rail production-alignment passes. Documentation only — no code changed.
Cross-refs: `16` (gap analysis), `03` (revenue), `13` (ad/home decisions), `14` (stack).

Stack: Next.js 15 (App Router) + TypeScript + Tailwind v4, server/static-rendered, sample-data driven
via `lib/data-provider` (reads `04-sample-data/*.json`). Build + lint pass. Node 24 required.

---

## 1. What is implemented for /fl
- **Light-theme state page** rendered from `04-sample-data/state-fl-sample.json` via `StatePageTemplate`.
- Section flow: jackpot ticker → top ad band → breadcrumb → H1 + intro → tab nav → Latest Draw Results (info callout + Multi-State / In-State / Pick groups) → Check Your Ticket → mini FAQ → Recent Highlights & Alerts → How to Claim → Taxes & Withholding → Game Odds/Prize accordions → Player Information → Sources & Methodology → final FAQ → trust notices → production footer → sticky closable footer ad.
- **DynamicResultCard** (metadata-driven, no hardcoded ball counts): variable balls, special balls (Powerball/Mega Ball), Fireball add-on, multipliers (Power Play), Double Play secondary draw, Cash Pop single ball, "Awaiting latest results" status.
- **Reusable components**: `SiteHeader` (+`MobileNav`), `JackpotTicker`, `TabNav`, `AdSlot`(+`AdSlotView`), `StickyFooterAd`, `BuyTicketsCta`, SEO helpers (`buildStateMetadata`, `breadcrumbJsonLd`, `faqJsonLd`, `JsonLd`), content modules (`CheckTicketTool`, `HighlightsAlerts`, `HowToClaim`, `TaxInfo`, `OddsAccordion`, `InfoSectionList`, `FaqAccordion`), `AiToolsTeaser`, `cleanCopy`.
- **No `[ADMIN]`/`[VERIFY-*]` markers reach the DOM** (`cleanCopy` guard + real sample copy).
- **SEO**: unique title/description/OG/Twitter via route `generateMetadata`; **Organization + WebSite(+SearchAction) sitewide** and **WebPage + BreadcrumbList + FAQPage** per page JSON-LD; server-rendered content; canonical intentionally **not emitted** (convention unverified). Full audit in `18-florida-seo-source-audit.md`.
- Responsive: desktop 2-col (content + sticky right rail), mobile single-column with hamburger nav + mobile ad slots.

## 2. What matches the proposed Florida PDF
- Light theme (light bg, white cards, navy text, red CTAs, pale-blue info/ad bands).
- Header (logo, nav, state selector, login/register); grey jackpot ticker (next-draw + countdown pill, Top Jackpots $ values, also-coming-up, disclaimer).
- Single subtle top leaderboard on a pale-blue band; breadcrumb; full H1 + intro; Results/Winning History/Schedule/How to Play/How to Claim tabs.
- Result cards: black main + red/gold special balls, Power Play badge, draw-date + schedule row, Next draw + jackpot, red Buy Tickets; in-state 3-up; pick games grid.
- All lower sections present (Check Ticket, Highlights & Alerts, How to Claim + docs table, Taxes, Odds accordions, Player Info, Sources & Methodology, FAQs).

## 3. Production behavior restored (from JSP/footer, not the mockup)
- **Footer** rebuilt from `footerbar_upgrade_as.jspf` (via `footer-config.json`): columns **Lottery** (Home, Jackpots, Powerball/Megamillions/Lotto America Results, USA Popular Games, USA Multi-State Games, Taxes on lotteries), **Information** (About Us, Help & FAQs, Terms, Privacy, Glossary a-c…t-z), **Lottery** (Contact Us, Login, Register, Blog, News), **Subscribe to NewsLetter** (form + real copy); bottom bar (Privacy Manager, Terms/Privacy/Cookies/sitemap, real social links); dark `#0a142f`. No invented copyright/"not affiliated"/18+ line (production has none).
- **Sticky closable footer ad** restored from `#stickyAd`/`#closeAdButton` — wraps `bottom_large_leaderboard` (`div-gpt-ad-1695650613003-0`), fixed bottom, ✕ closes it for the session.
- **Exact GAM paths + div IDs + size mappings** captured from `lottery-result_upgrade_as.jsp` into `ad-slot-definitions.json`.

## 4. Current ad handling
- **Fixed slots**: all reference `ad-slot-definitions.json` by `slotKey`; exact GAM paths/div IDs/size-mappings preserved; slots not moved/renamed/reduced.
- **Desktop / right rail**: reserved `lc_sp_*` slots (halfpage/MPU/skyscraper) in a **sticky** right rail (`lg:sticky top-4`), 300px; reserved for production ads/widgets only.
- **Mobile snippet support**: `lc_mgp_snippet_*` 320×50 slots modeled `device: "mobile"`, rendered in-content below `lg` (hidden on desktop via `lc-ad--mobile-only` at 992px).
- **Sticky closable footer ad**: `StickyFooterAd` component (placeholder), closable.
- **Lazy-load readiness**: `AdSlotView` (client) uses IntersectionObserver (rootMargin = `lazyLoadMarginPx`, default 300) to flip `data-in-view`/`data-ad-requested` near-viewport; space reserved up-front (per-breakpoint min-height at 992px) → no layout shift; `collapseIfEmpty: false`; top billboard is eager (above-fold). A single commented hook marks where future `googletag.display()` goes.
- **No live GAM**: no googletag/adsbygoogle scripts loaded; all slots render subtle "Advertisement" placeholders.

## 5. Current limitations
- **No live ads** (GAM/AdSense not wired; placeholders only).
- **No API / no DB**: all data from static sample JSON via the data-provider.
- **State selector** is a disabled placeholder (no switching).
- **Newsletter** form is non-functional (no submit/auth).
- **Login/Register/favorites/AI tools** are visible stubs only (no auth/functionality).
- **Only `/fl` is built out**: no home redesign, and no game/history/jackpot/blog/news pages (header/footer links to them 404 until built).
- **Missing ad-slot details**: `toppromobar`, `LC_ATV_video_player`, and `wyoming_on_results_table_pos1/2` div IDs/sizes are **UNKNOWN** (defined outside this JSP) — modeled with placeholders/UNKNOWN.
- Canonical URL not emitted (host/trailing-slash convention unverified — `14`).

## 6. Remaining visual polish items
- Fine spacing/typography rhythm vs the PDF (section gaps, card header alignment) can be tightened.
- Right rail shows reserved empty boxes on desktop (expected until live ads); could add subtle skeleton styling.
- Mobile menu closes on link click but not on outside-tap; state selector tight inside menu.
- Ball colors are placeholder tokens (final `highlighted1..7` colors unconfirmed — `04`).
- Some draw *times* in the FL sample are illustrative (feed carries dates, not exact clock times per game).
- Tabs are anchor links only (no active-on-scroll highlighting).

## 7. Do NOT change without Bala approval
- **Fixed GAM ad placements**: slot keys, GAM paths, div IDs, order, count, size mappings (`03`/`13`).
- **Right-rail policy**: reserved for production ads/known widgets only — no AI teasers or promo banners in the rail; AI teasers stay in content.
- **Sticky closable footer ad** placement/behavior.
- **`/buynow/<code>` CTA model** (no hardcoded external affiliate URLs).
- **Production footer** link set/structure (don't invent links).
- **Canonical/URL conventions** (pending live verification).
- Enabling **live GAM** or any real ad/affiliate call.

## 8. Recommended next implementation step
Validate the template's config-driven reuse by building a **second state page (e.g. `/az`)** from a new `state-az-sample.json` — this exercises different games, timezone (MST, no DST → the local↔EST date-shift rule), and a different Layer B module mix, confirming nothing is Florida-hardcoded. In parallel (docs only), request the missing **`toppromobar`/video/Wyoming** slot details and confirm the **canonical convention** so SEO can be finalized. Defer live GAM, API, and auth to their gated phases.
