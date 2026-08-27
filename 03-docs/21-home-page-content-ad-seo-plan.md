# Home Page — Content, Ad, Partner-Script & SEO Plan

Implementation **plan only** — the home page is not built or changed in this task. Prepares content
structure, exact ad-slot preservation, partner-script strategy, and SEO for the new light-theme home.
Cross-refs: `03` (revenue), `08` (design inputs), `13`/`14` (decisions), `15` (SEO/AI/admin), `19`
(state coverage), `20` (sitemap/canonical). Reference project read-only.

Home route today: struts `welcome` → `WEB-INF/upgrade/index_upgrade_as.jsp` (SSR JSP, 214 KB) which
`@include`s: `CommonElementsUpgrade_as.jspf`, `headerbar_upgrade_as.jspf`, `populargames_as.jspf`,
`wiiningNumbersByStateSearchInput_as.jspf`, `wiiningNumbersByState_as.jspf`, `footerbar_upgrade_as.jspf`.

---

## 1. Existing home inventory (Task A)
**Sections (top→bottom)** — from `home.png` (`08` §A) + JSP headings/includes:
1. Header (logo, nav, state selector, login/register) + utility/jackpot strip.
2. **Hero** "US Lottery Results — Latest Winning Numbers" with Powerball / Mega Millions / Lotto America feature cards (jackpot + numbers + Buy Tickets).
3. **Live Lottery News** (news cards).
4. **Upcoming / awaiting results** strip.
5. **Welcome to Lottery Corner** (about/intro copy).
6. **Live Lottery** results table.
7. **Lottery Corner Predictions** (systems/predictions teaser).
8. **Lottery Systems**.
9. **Most Popular Games** grid (`populargames_as.jspf`).
10. **Powerball / Mega Millions Jackpot History** charts + jackpot comparison.
11. **Lottery Corner Insider** banner (house/insider promo).
12. **Lottery Jackpots** table.
13. **Chat Support**.
14. **Lottery Blogs**.
15. **Newsletter** signup.
16. **Winning Numbers by State** grid + state search (`wiiningNumbersByState*_as.jspf`).
17. **Footer** (`footerbar_upgrade_as.jspf`).

- **Desktop layout:** wide single column with a content body + right-rail ad column; multiple full-width ad bands between sections; sticky bottom leaderboard.
- **Mobile layout** (`Mobile_Home.pdf`, `08` §C-M): single-column vertical scroll; right-rail collapses; mobile 320×50 snippet ad slots inserted in-content; sticky bottom ad. (Exact per-slot mobile coordinates not measurable from the PDF — verify vs live.)
- **CTAs:** Buy Tickets (affiliate), state search/select, newsletter subscribe, Insider/login, blog links.
- **Head/SEO:** `<link rel="canonical" href="http…">` present (www host today), page `<title>`/meta, sitewide `Organization` + `WebSite` JSON-LD via common include (`02` §8). H1 "US Lottery Results — Latest Winning Numbers".

## 2. Existing home ad-slot inventory (Task B) — GAM network `/21828142944/`
**Preserve every slot exactly** (path, div ID, size mapping, order). All are FIXED (GAM); none removed/renamed/replaced.

| slotKey (proposed) | GAM path | div ID | sizes (desktop / mobile via mapping) | device | placement in flow | eager/lazy | sticky/closable |
|---|---|---|---|---|---|---|---|
| hp_top_billboard | `LC_hp_display_web_top_billboard` | div-gpt-ad-1694691105444-0 | 728×90 / 320×50 (`horizontalheader`) | responsive | Top, above hero | **eager** (above fold) | no |
| hp_mid_leaderboard | `lc_hp_display_web_mid_leaderboard` | 1694691723384-0 | 728×90 / 336×280,320×100 (`horizontalAds`) | responsive | between hero & news | lazy | no |
| hp_mid_billboard_pos1 | `lc_hp_display_web_mid_billboard_pos1` | 1694708721384-0 | 970×250/970×90/728×90 / 336×280… (`horizontalAds1`) | responsive | mid content | lazy | no |
| hp_mid_billboard_pos2 | `lc_hp_display_web_mid_billboard_pos2` | 1694709237082-0 | `horizontalAds1` | responsive | mid content | lazy | no |
| hp_mid_billboard_pos3 | `lc_hp_display_web_mid_billboard_pos3` | 1694709361130-0 | `horizontalAds1` | responsive | mid content | lazy | no |
| hp_mid_large_leaderboard_pos1 | `lc_hp_display_web_mid_large_leaderboard_pos1` | 1694708847897-0 | `horizontalAds` | responsive | in-content | lazy | no |
| hp_mid_large_leaderboard_pos2 | `…pos2` | 1694709039320-0 | `horizontalAds` | responsive | in-content | lazy | no |
| hp_mid_large_leaderboard_pos3 | `…pos3` | 1694709114849-0 | `horizontalAds` | responsive | in-content | lazy | no |
| hp_mid_large_leaderboard_pos4 | `…pos4` | 1696347916722-0 | `horizontalAds` | responsive | in-content | lazy | no |
| hp_side_halfpage_pos1 | `lc_hp_display_web_side_halfpage_pos1` | 1694690716926-0 | 300×600/336×288 (`verticalAds`) | responsive | right rail | lazy | no |
| hp_side_halfpage_pos2 | `…pos2` | 1694709543711-0 | 300×600,336×280 (no mapping) | responsive | right rail | lazy | no |
| hp_side_halfpage_pos3 | `…pos3` | 1696347663152-0 | 300×250,160×600,300×600 | responsive | right rail | lazy | no |
| hp_side_halfpage_pos4 | `…pos4` | 1696348050684-0 | 300×250,160×600,300×600 | responsive | right rail | lazy | no |
| hp_side_mpu | `lc_hp_display_web_side_MPU` | 1694709311530-0 | 300×250,336×280 (`verticalAds1`) | responsive | right rail | lazy | no |
| hp_side_mpu_pos1 | `lc_hp_display_web_side_MPU_pos1` | 1696598357091-0 | 300×600,300×250 (`verticalAds`) | responsive | right rail | lazy | no |
| hp_bottom_large_leaderboard_sticky | `lc_hp_display_web_bottom_large_leaderboard_sticky` | **1694709627267-0** | 728×90 / 320×50 (`horizontalAds`) | responsive | fixed page bottom | lazy | **sticky + closable** (#stickyAd/#closeAdButton) |
| hp_mobile_leaderboard_pos1..4 | `lc_mgp_snippet_display_web_320x50_mobile_leaderboard_pos1..4` | 1707413795676-0 / 859823-0 / 940026-0 / 1707414004765-0 | 320×50 (`horizontalAds2`) | **mobile-only** | in-content (mobile) | lazy | no |
| hp_video | `LC_ATV_video_player` | 1715268442152-0 | 300×168 | responsive | in-content video | lazy | no |

**Home size mappings (breakpoint 992):** `horizontalheader` (728×90 / 320×50), `horizontalAds` (728×90 / 336×280,320×50,300×250,320×100), `horizontalAds1` (728×90,970×250 / 336×280,300×250,320×100), `horizontalAds2` (728×90,970×250 / 320×50,320×100), `verticalAds` (160×600,300×600,300×250 / 336×280,300×250,320×50), `verticalAds1` (300×250 / 336×280,300×250,320×100,320×50). These are the **home** set (distinct names/values from the state-page set) — model under a new `homePageSlots` block; do not merge with `statePageSlots`.
- **Notes:** GPT uses `enableSingleRequest`; **no native lazy-load configured today** — so lazy-load is a new-UI enhancement (reserve space, IntersectionObserver, request near-viewport), exactly like the state `AdSlot`/`AdSlotView`. Keep `hp_top_billboard` eager. Nothing invented — all paths/div IDs are from `index_upgrade_as.jsp`.

## 3. Existing partner-script inventory (Task C)
| Script | Loaded today | Purpose | Proposed Next.js loading | Dev/env gating |
|---|---|---|---|---|
| **GAM / GPT** | `securepubads.g.doubleclick.net/tag/js/gpt.js` (home inline + includes) | Ad serving (all `lc_*` slots) | `<Script strategy="afterInteractive">` inside a controlled `PartnerScripts` component; slots requested via the lazy `AdSlot` hook | **Off in dev**; enabled by env flag (`NEXT_PUBLIC_ADS_ENABLED`) in staging/prod |
| **Google AdSense** | `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6009276896057794` (common include) | AdSense/auto-ads | `<Script afterInteractive>` in `PartnerScripts` | Off in dev; env-gated |
| **iZooto (push)** | `cdn.izooto.com/scripts/cfc658b260b3b771debdf9bae6aa7549d818e3b9.js` (common include + `izooto.html` SW helper) | Web push notifications / marketing | `<Script afterInteractive/lazyOnload>` in `PartnerScripts`; port the SW helper (`izooto.html` / `lc-sw.js`) | Off in dev; env-gated; respects consent |
| **Google Analytics 4** | `googletagmanager.com/gtag/js` — **G-G3L83YMSN4** | Analytics | `<Script afterInteractive>` in `PartnerScripts` | Off in dev; env-gated |
| **GTM** | container **GTM-PC9TSRLZ** | Tag manager | Optional via `PartnerScripts` (decide GTM-vs-direct) | Off in dev; env-gated |
| **Universal Analytics (legacy)** | **UA-58358715-1** | Legacy analytics (UA is sunset) | **Do not port** unless Bala wants it; flag as deprecated | n/a |

- **Do not load live scripts yet.** Design a single **`PartnerScripts`** component (client) that centralizes all third-party tags behind env flags + a consent gate, so nothing fires in local dev and everything is controllable. Preserve iZooto conceptually (do not remove).

## 4. Proposed new home section plan (Task D) — light theme, production-safe
Reuse the state-page visual system (header, jackpot ticker, cards, footer, `AdSlot`). Order:
1. **Hero** — "Latest Lottery Results, Jackpots & Winning Numbers" + short answer block (GEO/AEO). `[hp_top_billboard]` above it (eager).
2. **State search / selector** — crawlable links to all state pages (`/fl`, `/az`, …).
3. **Powerball & Mega Millions feature cards** — DynamicResultCard reuse; Buy Tickets `/buynow/<code>`.
4. **Top Jackpots / Jackpot Tracker** — reuse `DataTable`/jackpot ticker (future DB/API).
5. **Latest Results / Live Lottery** — result cards (future DB/API).
6. **Upcoming / Awaiting Results** — uses the `awaiting` status model (D1).
7. **Browse Lottery Results by State** — full crawlable state grid (SEO internal linking) + `ItemList` schema.
8. **Lottery Tools teaser** — Check Ticket, Tax Calculator, Number tools (content module).
9. **AI-assisted Tools teaser** — `AiToolsTeaser` (no prediction/guarantee claims; login-gated later).
10. **Buy Tickets highlight** — `/buynow/<code>` / future resolver only; **content module, not an ad-slot replacement**.
11. **Latest News / Winners / Unclaimed Prizes** — reuse `HighlightsAlerts` (future DB/API).
12. **Popular Lottery Games** — grid (reuse populargames concept), crawlable links + `ItemList`.
13. **Jackpot History / Comparison** — charts (future DB/API; SSR-friendly summary + client chart).
14. **Lottery Systems / Predictions** — responsibly worded (no guaranteed wins).
15. **Blog / Guides** — cards linking to `/blog` (future).
16. **Newsletter / Alerts** — reuse footer-config newsletter (non-functional placeholder Phase 1).
17. **Footer** — shared `SiteFooter`.
- In-content + right-rail + mobile-snippet + sticky-bottom **ad slots preserved** between/around these sections in their existing positions.

## 5. Home sample-data model proposal (schema only — do NOT create the file yet)
`home-page-sample.json` (mirrors state model; data-driven, admin/API-ready):
```jsonc
{
  "page": { "metadata": { "title","description","canonicalPlaceholder","robots","openGraph","twitter","schemaTypes":["WebPage","WebSite","Organization","ItemList","BreadcrumbList"] },
            "h1", "intro", "lastUpdated": { "display","isoDateModified" } },
  "jackpotTicker": { ...reuse... },
  "featureGames": [ { gameId, slug, displayName, groupsDrawn, prizeDisplay, nextDraw, buyTickets:"/buynow/<code>" } ],
  "topJackpots": { columns, rows },              // jackpot tracker
  "latestResults": [ ...result cards... ],
  "browseByState": [ { code, name, href:"/<code>" } ],   // all enabled states
  "popularGames": [ { slug, displayName, href } ],
  "news": [...], "recentWinners": [...], "unclaimedPrizes": [...],   // DB/API-driven
  "jackpotHistory": [ { game, series } ],
  "tools": [...], "aiToolsTeaser": {...}, "systems": {...}, "blog": [...],
  "newsletter": { ...footer-config... },
  "adSlotRefs": { "top":["hp_top_billboard"], "inContent":[...], "rightRail":[...], "mobileInContent":[...], "stickyFooterAd":"hp_bottom_large_leaderboard_sticky", "video":"hp_video" }
}
```

## 6. DB/API/admin-driven content fields
**Live (DB/API/feed):** featureGames, topJackpots/jackpotTracker, latestResults, upcoming/awaiting, news, recentWinners, unclaimedPrizes, jackpotHistory, lastUpdated. **Admin-editable (draft→review→publish):** hero copy, Welcome/about, tools/AI/systems copy, blog curation, FAQ (if shown), newsletter copy, browse-by-state config (which states enabled). Carry a `contentMeta` (source/reviewStatus/lastReviewed) as on state pages. **No `[ADMIN]`/`[VERIFY]` in rendered output** (`cleanCopy`).

## 7. AI / tools / Buy-Tickets promo opportunities (Task E) — house content, NOT ad replacements
Candidate internal promos (each = **content module + future house-ad fallback; requires Bala approval; must NOT replace existing ad inventory**):
- **Lottery Genie / Lucky GPT** entry point (AI-assisted, login-gated; no prediction claims).
- **Check Ticket** tool promo.
- **Jackpot Alerts** (push/newsletter opt-in).
- **Buy Tickets guide** (educational; routes via `/buynow/<code>`).
- **Favorite games / subscriber tools** (logged-in).
- **Blog / news guide cards**.
- **"Insider"** promo (existing house banner concept).
These live in content sections. A **house-ad fallback** (filling an unsold ad slot with an internal promo) is possible later **only with Bala approval** and only via GAM's own fallback/house-line-item mechanism — not by removing or overwriting a GAM slot in the UI.

## 8. Home SEO / schema requirements (Task F)
- **title:** e.g. "US Lottery Results — Latest Winning Numbers & Jackpots | Lottery Corner" (admin-editable, unique).
- **meta description**, **robots** `index,follow`.
- **canonical:** target **`https://lotterycorner.com/` (home; no trailing slash beyond root)** — **migration pending** (prod uses www); keep as `canonicalPlaceholder`, do not emit until migration (`20`).
- **OpenGraph** (type=website, title, description, image TODO) + **Twitter** (summary_large_image).
- **Organization** JSON-LD (sitewide, existing values), **WebSite** JSON-LD **with SearchAction** (sitelinks search → needs a real `/search`; TODO), **WebPage** JSON-LD.
- **ItemList** JSON-LD for top games and/or the browse-by-state list (high AEO value).
- **FAQPage** only if a visible FAQ is on the home page.
- **Crawlable state links** (all enabled `/<code>`), **crawlable top jackpots/latest results** in server HTML.
- **Visible `lastUpdated`** wherever dynamic results/jackpots appear.
- **No `[ADMIN]`/`[VERIFY]` leakage**; content server-rendered (SSR/SSG).

## 9. Mobile behavior requirements
- Single-column reflow; hamburger nav (reuse); jackpot ticker compact.
- **Mobile 320×50 snippet ad slots** (`hp_mobile_leaderboard_pos1..4`) in their existing in-content positions; right-rail slots collapse into flow or are suppressed by size mapping; **sticky closable bottom ad** preserved.
- Do not hide revenue-critical elements (ads, Buy Tickets, jackpots, results, state links) on mobile.
- Reserve ad space (min-height per breakpoint at 992) to avoid layout shift.

## 10. Implementation plan (later, separate task)
1. Add `homePageSlots` (+ home `sizeMappings`) to `ad-slot-definitions.json` from §2 (exact paths/div IDs).
2. Author `home-page-sample.json` (§5) with clean sample + `adSlotRefs`.
3. Build `app/page.tsx` (replace the placeholder home) using a `HomeTemplate` that reuses `Header`, `JackpotTicker`, `AdSlot`, `DynamicResultCard`, `HighlightsAlerts`, `AiToolsTeaser`, `SiteFooter`, and the SEO/schema helpers (+`ItemList`).
4. Add the `PartnerScripts` component (GPT/AdSense/iZooto/GA) — env-gated, off in dev, **no live calls until enabled**.
5. Build/lint; audit home SEO (title/meta/schema/no-markers/no-external-affiliate/`/buynow`); verify all home ad slots reserved and in exact positions; check desktop + mobile.
6. Keep `/fl` and state pages unchanged.

## 11. Open questions / Bala approvals needed
1. **www → non-www migration** timing (unblocks home canonical + `SITE_URL`) — `20`.
2. **PartnerScripts:** confirm GA4 (G-G3L83YMSN4) + GTM (GTM-PC9TSRLZ) — keep both or consolidate? Drop legacy **UA-58358715-1**? Keep **iZooto** (yes, conceptually) — confirm consent/CMP requirement.
3. **AdSense** (`ca-pub-6009276896057794`) — keep alongside GAM on the new home?
4. **House-ad / internal promos** (§7) — which to enable, and confirm they never displace GAM slots.
5. **WebSite SearchAction** — is there/should there be a public `/search` endpoint?
6. **Home OG image** asset URL.
7. Confirm the **home section order** (§4) vs the existing home (any sections to drop/add?).
8. **Jackpot history charts** — data source + SSR vs client-chart approach.
