# New UI Readiness Summary — LotteryCorner

Consolidates all discovery (`01`–`05`, `08`–`13`) into a practical plan for the first UI skeleton.
No UI/API code yet. Reference project unchanged. Cross-refs cited inline as `NN-...`.

> **Status:** discovery complete. This doc is the bridge to `01-new-ui`. It marks what is **ready to
> build against sample data** vs what **still needs Bala approval** (see §15).

---

## 1. Rebuild Strategy
- **UI-first**: build the new UI under `01-new-ui/` against **dummy/static JSON/XML** (`04-sample-data/`) behind a **data-provider abstraction**, so swapping to the real API later is trivial.
- **API later**, only after UI/SEO/ads/responsive/revenue are validated (`07-...`, `12`).
- **Preserve throughout:** SEO value + indexed URLs (`01`,`02`), **fixed GAM ad slots** (`03`,`13`), Buy Tickets/affiliate behavior (`03`,`13`), dynamic result formats (`04`), business rules incl. timezone (`05`).
- **Do not** hardcode one game format, one state, ad removal, or Buy Tickets URLs.

## 2. URL & Routing Contract (from `01-...`)
Preserve exactly (server-rendered, crawlable):
- **Home:** `/`.
- **State:** `/{state}` (e.g. `/fl`, `/az`, incl. territories `/pr`, `/vi`). Default empty→`az`; invalid→404; **no-lottery states** `al/ak/nv/hi/ut` → dedicated no-results template.
- **Game:** `/{state}/{game}` (e.g. `/ca/fantasy-5`). Plus **multi-state named routes**: `/powerball`, `/mega-millions`, `/lotto-america`, `/cash4life`, `/lucky-for-life`, `/2by2`, `/gimme-5`, `/tri-state-*`.
- **History:** `/{state}/{game}/{year}` (~8,700 URLs) — **timezone-safe** (see §9); `redirectToLatest` behavior preserved.
- **Date-specific state results:** **same** state page/action + date params (not a separate route) — Bala clarification (`01` §5).
- **Jackpot analysis:** `/{state}/{game}/jackpotanalysis`, `/jackpotanalysis`, `/jackpots`.
- **Blog/news:** `/blog`, `/blog/{slug}`, `/news`, `/news/{slug}`.
- **`/buynow/*`** (+ `/emailbuynow/*`): internal affiliate 302 redirect — **do not break; robots-disallowed**.
- **Ignored/closed game URLs (D4):** ignored games hidden from lists but **direct URLs stay reachable**; closed games may stay indexed with a "closed" indicator. **No auto delete/redirect/noindex without Bala approval.**
- **Known risks to resolve (not silently change):** canonical host/slash mismatch (`02` §3); broad `*`/`*/*` wildcards; `fl-new` vs `/fl`; legacy `struts_old.xml` routes.

## 3. Required Page Templates
| Template | Route(s) | Notes |
|----------|----------|-------|
| **HomePage** | `/` | Preserve existing structure; minimal design-system alignment (§5). |
| **StatePage** | `/{state}` (+ date params) | Single reusable template, config-driven modules (§4). |
| **GamePage** | `/{state}/{game}`, multi-state named routes | Latest result + game detail. |
| **HistoryPage** | `/{state}/{game}/{year}` | Crawlable paginated/yearly table; timezone-safe (§9). |
| **NoLotteryState** | `/al /ak /nv /hi /ut` | FAQ + popular games + SEO only, no results. |
| **Jackpot / Analysis** | `/jackpots`, `/jackpotanalysis`, `/{state}/{game}/jackpotanalysis` | Jackpot lists + charts. |
| **Blog/News (placeholders)** | `/blog`, `/blog/{slug}`, `/news`, `/news/{slug}` | Preserve URLs; can be light placeholders in phase 1. |
| **Static pages** | about-us, faqs, contact-us, write-us, privacy-policy, cookies-policy, terms-and-conditions, lottery-tax-calculator, glossary a-to-c…t-to-z, reviewspage, unsubscribe | Preserve URLs. |
| **Insider/Systems** | Lottery Systems, Smart Pick, Search Numbers, Download, Predictions | Preserve entry points; future logged-in/AI (D5, `13`). |

## 4. State Page Template Requirements (from `09`,`10`,`11`,`13`)
- **One reusable `StatePageTemplate`** = **Layer A (global, every state)** + **Layer B (optional, config-driven)**.
- **Layer A:** hero/H1 + short answer, latest draw results (multi-state / in-state / pick groups), draw schedules, how-to-claim, taxes, past-results links, FAQs, official-source + responsible-play/18+ notices, visible `lastUpdated`.
- **Layer B (toggle per state):** Check Ticket tool, Scratch-offs, Odds & Strategy, News & Winners, Fund Allocation, Anonymity, Data Methodology; plus extras seen in PDFs (Quick Facts, Number Trends, Biggest Jackpots, Winner Location, Highlights grid, Game Comparison, in-page tab nav, Where-&-How-to-Play). Matrix in `10-...`.
- **Config-driven state content:** state def (code, name, H1, intro, enabled modules, game list, tax rule, claim rules, fund program, anonymity). **Do not hardcode Florida** into the shared component.
- **Proposed PDFs = reference only** (Lovable prototypes, placeholder data) — use for structure/look, **not** as final for ads.
- **Existing ads must be preserved** around the redesigned content — the PDFs omit the right-rail/in-content ads that exist today (§6, `13`).

## 5. Home Page Requirements (from `11`,`13` — D-home)
- **Mostly preserve existing structure/section order**; apply **minimal** design-system alignment only (typography, spacing, cards, colors). No heavy redesign without approval; **no proposed home mockup exists**.
- **Preserve:** hero/featured games, latest/live results, Live Lottery News, Predictions, Lottery Systems, Most Popular Games, jackpot cards, 50-state "Winning Numbers by State" grid, blog links, newsletter signup, footer.
- **Preserve home ad/affiliate placements** (right-rail `lotter.com` banners, Buy Tickets, newsletter).
- **AI-enabled entry points:** reserve space (AI insights, smart number analysis, personalized alerts, "Lottery Genie / Lucky GPT") — **no fake/unsupported claims**; gate behind login later (D5, `13`).

## 6. Fixed Google Ad Manager Ad Slot Contract (from `03`,`13`)
- **Existing GAM placements are FIXED** — preserve exact **positions, order, sizes, and slot behavior** on desktop, tablet, mobile. **New UI adapts around ad slots**, not vice-versa.
- **No move/remove/merge/rename/reduce without explicit Bala approval.** Empty ad boxes = ad evidence.
- **Network `/21828142944/`** named slots: state `lc_sp_*` (~20, responsive size-mapped: billboard/leaderboard/skyscraper/MPU/halfpage + mobile 320×50 snippets), game `lc_mgp_/lc_mpg_*`, blog `lc_bp_/lc_bdp_*`, jackpot `lc_jp_*`, history `lc_gh_*`, `lc_toppromobar`, `LC_ATV_video_player`, **state-specific `wyoming_on_results_table`**. Plus **AdSense `ca-pub-6009276896057794`** and the managed `lotterycornercom_*` wrapper. Preserve `ads.txt`/`ads_google.txt` verbatim.
- **Desktop/mobile:** one responsive template per page type; GPT size-mappings serve desktop + mobile sizes; extra mobile 320×50 slots exist. Do not hide revenue-critical elements on mobile.
- **Ad slot component strategy:** an `AdSlot` component driven by **`ad-slot-definitions.json`** (pageType → ordered slots with slotPath, sizes, sizeMapping, position). UI renders the exact `/21828142944/lc_*` units in place.

## 7. Buy Tickets / Affiliate CTA Contract (from `03`,`13` D2)
- Render Buy Tickets CTAs **in their required positions** (sub-bar quick action + result cards) — never drop them.
- **URLs not hardcoded.** UI-first: use internal **`/buynow/<code>`** placeholders via the data provider.
- **Future API resolves destination** by geo/IP, state, game, affiliate availability, tracking, existing routing (partners: theLotter `tl_affid=11132&ft=5`, jackpot.com `bta=35261&nci`, official EACDN for MI/VA/PA). Cached **US-only** behavior reviewed at API time.
- Component: `BuyTicketsCta` takes a resolved href from config/provider (never an inline literal).

## 8. Dynamic Result Card Requirements (from `04`)
Render **from metadata, never a fixed ball count**. Must support:
- Variable counts **1 → 21**: 1-ball (**Cash Pop**), 2-digit (Pick 2), digit games (Pick/Daily/Numbers), 5-ball, 6-ball, 5+special.
- **Special balls** (named + colored): Power/Mega/Lucky/Cash/Star Ball, Bonus, **Fire Ball**, Sum, Doubler; 2by2 red/white.
- **Multipliers/add-ons:** Power Play, Multiplier (Megaplier), All Star Bonus, Doubler, Fireball, Sum, Wild.
- **Double Play** (second draw row) — model as a secondary result set (**FL Lotto 337 = 6+6**).
- **Keno / Quick Draw** (**511/371 = 20+1**) — 10+/20+ ball layouts that **wrap** on mobile.
- **Card games** (5 Card Cash 384/393/546/571, Poker Lotto 403, WPT 576, Wild Card 2 1014) — render card faces.
- **Multi-draw sets** (USVI Pick 4 600–603 = 4+4+4) — repeat ball groups.
- **Historical format support** — date-effective variants (`.old/.fire/.sum/.wild/…`), preserved exactly (§9, `04` §8).
- Components: `DynamicResultCard` → `BallGroup` → `Ball` (+ `SpecialBallLabel`, `MultiplierBadge`); driven by **`result-format-definitions.json`** (derivable from `bonus_numbers_info` + `game.NUM_OF_BALLS`).

## 9. Timezone-Safe Result Display (from `05` D6–D8) — CRITICAL
- DB stores draw times in **EST**; UI displays each draw/result in the **game/state local timezone** (existing `LuckyDateUtils.*FromEST` logic must be preserved & tested).
- **Date/year-history queries:** (1) compute `fromDate`/`toDate` in **game-local TZ** → (2) convert range to **EST** for the DB query → (3) query → (4) convert each result's EST time **back to game-local** for display.
- Handle **PST/MST and post-10 PM local** draws that shift a calendar day in EST — URL `{year}`/date grouping must reflect the **game-local** draw date.
- **`selectedDay + 1`** = legacy symptom, **not a rule** (D8) — keep as a **test case**.
- **API metadata to expose:** `storedDrawDateTime`, `storedTimezone` (`EST`/`America/New_York`), `gameLocalDrawDateTime`, `gameLocalTimezone`, `gameLocalDate`, `queryLocalDateRange`, `queryStoredDateRange`, `resultDateLabel`.
- **Tests:** post-10 PM PST/MST; `/{state}/{game}/{year}`; date-specific state results; grouping by local draw date; EST midnight boundary.

## 10. Awaiting / Closed / Ignored Game UI Rules (from `05` D1, D3, D4)
- **Awaiting results (D1):** if draw time passed but result not ingested, **keep showing the latest DB result**; ticker → **"Awaiting latest results" / "Drawing completed, results pending"**; **never hide the card**; no misleading countdown.
- **Game closed (D4):** show latest/historical result with a clear **"Game is closed"** status; may remain indexed if SEO/historical value.
- **Ignored games (D4):** hidden from state lists; **direct URLs remain reachable**; **no noindex/redirect/delete without approval**.
- **Holiday/no-draw (D3):** preserve days-off logic; API returns draw availability/status for correct no-draw messaging.

## 11. SEO + GEO/AEO Requirements for UI (from `02`)
- **Crawlable server-rendered HTML** for all main content (results tables, answer blocks) — not client-only.
- Per page: **unique title, meta description, canonical, single H1**, clean headings, breadcrumbs, internal links, visible **`lastUpdated`**.
- **Schema:** `Organization` + `WebSite` (add `SearchAction`) sitewide; `BreadcrumbList` per page; add **`Dataset`** for history/results; `Article`/`NewsArticle` for real posts; `FAQPage` where FAQ is visible.
- **Answer block** near top of state/game pages (GEO/AEO), server-rendered.
- **Official-source attribution + responsible-play/18+ disclaimers** on result pages.
- **Fix (with plan):** canonical host/slash consistency; machine-readable `dateModified`; sitemap index + auto `lastmod` + IndexNow; robots AI-crawler rules. Preserve existing SEOMeta per-URL (title/desc/H1) via migration.
- **Mobile-friendly & fast**; do not hide revenue/answer content on mobile.

## 12. Recommended Reusable Components
- **Layout/chrome:** `Layout`, `Header`, `UtilitySubBar` (next-draw/top-jackpots/quick-actions), `StateSelector`, `Footer`, `PageTabNav`, `Breadcrumbs`.
- **SEO/schema:** `SeoHead`, `CanonicalUrl`, `BreadcrumbSchema`, `OrganizationSchema`, `WebsiteSchema`, `DatasetSchema`, `ResultAnswerBlock`, `LastUpdated`, `OfficialSourceNotice`, `ResponsiblePlayNotice`.
- **Revenue:** `AdSlot` (leaderboard/in-content/rail/footer + mobile variants), `AffiliateBanner`, `BuyTicketsCta`, `NewsletterSignup`, `JackpotCard`.
- **Results:** `DynamicResultCard`, `BallGroup`, `Ball`, `SpecialBallLabel`, `MultiplierBadge`, `DrawSchedule`, `HistoryTable`.
- **Templates:** `StatePageTemplate`, `GamePageTemplate`, `HistoryPageTemplate`, `HomeTemplate`.
- **Modules (Layer B):** `CheckTicketTool`, `ScratchOffsGuide`, `OddsStrategyAccordion`, `NewsAndWinners`, `FundAllocation`, `AnonymityRules`, `DataMethodology`, `QuickFactsTable`, `NumberTrends`, `BiggestJackpotsTable`, `WinnerLocationTable`, `HighlightsGrid`, `GameComparisonTable`, `PopularGames`, `HowToClaim`, `TaxInfo`, `FaqAccordion`.
- **AI/logged-in (teasers only):** `AiToolsTeaser`, `FavoriteStar` (no fake claims).

## 13. Sample Data Needed (under `04-sample-data/`)
Author these for the UI-first build (schema derived from `game`/`state`/`bonus_numbers_info` + rules):
- `home-page-sample.json` — featured games, news, jackpots, popular games, state links.
- `state-fl-sample.json`, `state-az-sample.json` — full StatePage payloads (Layer A + which Layer B modules on), incl. `lastUpdated`, timezone metadata.
- `game-powerball-sample.json`, `game-mega-millions-sample.json` — game detail + latest result (with special ball + multiplier).
- `result-format-definitions.json` — `ResultFormatDefinition`s incl. edge cases (Cash Pop 1-ball, Keno 20+1, FL Lotto 6+6 Double Play, USVI 4+4+4, a card game) + effective-date variants.
- `ad-slot-definitions.json` — per page type, ordered GAM slots (slotPath, sizes, sizeMapping, position) + AdSense/managed placements.
- `affiliate-link-placeholders.json` — `/buynow/<code>` placeholder links per state×game (no real destinations).
- (Suggested additions) `history-sample.json` (year table, local-date grouped), `states-config.json` (state defs + module toggles), `games-config.json` (id→name/balls/multiState/status).

## 14. Future API Contract Preview (directional, not final)
- **Results:** `GET /results/{state}[/{game}][/{date|year}]` → `DrawResult` (grouped numbers + multipliers + `formatRef` + timezone metadata §9 + `status`: latest/awaiting/closed).
- **Result format:** `GET /games/{gameId}/result-format?date=` → `ResultFormatDefinition` (ball groups, special balls, multipliers, secondaryDraw, cardFaces, effectiveFrom/To).
- **Jackpots:** sortable lists (dueNext/high-low) + jackpot history series.
- **Ad slots:** ad-slot config per page type (mirror `ad-slot-definitions.json`).
- **Affiliate resolver:** `GET /buynow/{code}` → 302 (geo/state/game/affiliate/tracking) — preserve.
- **SEO metadata:** per-URL title/desc/canonical/H1/schema inputs + `lastUpdated`.
- **State/game content config:** state defs, module toggles, howtoplay/tax/claim/FAQ content.
- Keep a **generic default renderer** for the 259 games without explicit format templates.

## 15. Pre-UI Implementation Checklist (must be approved before `01-new-ui`)
**Ready now (build against sample data):**
- URL/routing contract (§2), template list (§3), StatePage Layer A/B model (§4), dynamic result card model (§8), timezone rules (§9), awaiting/closed/ignored rules (§10), component list (§12).

**Needs Bala approval / input before or during build:**
1. **Framework choice** for `01-new-ui` + permission to scaffold/install (per CLAUDE.md, ask first).
2. **Canonical host + trailing-slash convention** (fixes `02` §3 mismatch) — before emitting canonical/OG/schema.
3. **Ad strategy sign-off:** confirm exact GAM slot preservation + the `ad-slot-definitions.json` mapping (esp. re-adding right-rail/in-content ads the PDFs omit); managed-wrapper vendor (`lotterycornercom_*`), 2nd pub `pub-5258173596915552`.
4. **`bonus_numbers_info` data** (DDL exists, data not provided) + CSS color mapping for `highlighted1..7` — needed to finalize result-format definitions.
5. **Ignored/closed URL policy** (index/redirect) confirmation (D4).
6. **Home scope**: confirm "preserve + minimal alignment" (no proposed home mockup).
7. **Blog/news phase-1 depth** (full vs placeholder) + which insider/AI entry points to surface first (D5).
8. Provide **mobile references for remaining states** (only Home + FL exist) if pixel-accuracy needed.

**Still unknown / flagged (not blockers, track):** legacy `struts_old.xml` routes & any server/CDN 301 map; `special` state-template trigger; `fl-new` vs `/fl`; Illinois Lotto `.max2/.lottomax` rule; exact mobile ad-slot coordinates (no renderer available).

---

## Summary
Discovery is complete and internally consistent. The UI can be **skeletoned now** against sample data using §2–§12, provided the **§15 approvals** (framework, canonical convention, ad-slot mapping, `bonus_numbers_info` data + colors) are obtained. Everything revenue-, SEO-, and timezone-critical has an explicit preserve-first rule.
