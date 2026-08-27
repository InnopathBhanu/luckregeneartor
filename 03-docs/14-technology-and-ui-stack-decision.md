# Technology & UI Stack Decision — LotteryCorner Rebuild

Locks the stack and build approach before scaffolding `01-new-ui`. Consolidates decisions with the
discovery/readiness work (`02`, `03`, `06`, `13`, `15`). No UI/API code yet. Reference project unchanged.

> **Gate:** per CLAUDE.md + Decision 15, **do not scaffold or run install commands until Bala approves.**
> This doc defines *what* we will build; scaffolding is a separate, approved step.

---

## Decisions (locked)

| # | Area | Decision |
|---|------|----------|
| 1 | **Frontend framework** | **Next.js + TypeScript** — SEO-heavy site needs crawlable HTML, route-level metadata, canonical URLs, JSON-LD, sitemap support, fast mobile. |
| 2 | **Styling** | **Tailwind CSS** (until Bala chooses otherwise). |
| 3 | **Rendering** | **Server-rendered / static** for public pages. **No client-only rendering** for results, state/game/history pages, FAQs, SEO content, or schema-backed content. |
| 4 | **Phase-1 data** | Local **sample JSON/XML under `04-sample-data/`** via a data-provider abstraction. Do not wait for API. |
| 5 | **API** | **Not built yet.** Future API: structured result metadata, timezone-safe draw data, SEO metadata, admin-managed content, ad-slot config, Buy Tickets affiliate resolver. |
| 6 | **Admin** | **Do not rebuild in Phase 1.** Preserve existing admin concept; public UI consumes admin-managed SEO/content/result data via sample JSON now, API later. |
| 7 | **Login/subscriber** | **Not implemented in Phase 1.** Keep **visible entry points + component hooks** for login/register, favorites, alerts, saved games, AI tools, subscriber dashboard. |
| 8 | **Forum** | **Not in Phase 1.** Plan lightweight forum/thread pages later (SEO + community) with moderation + **noindex** for thin/low-quality pages. |
| 9 | **AI** | Plan entry points (**Lottery Genie / Lucky GPT**, AI-assisted insights, smart number analysis, personalized alerts, historical pattern exploration). **Never claim AI predicts/guarantees winning numbers.** |
| 10 | **Ads** | Build an **`AdSlot` component later**; exact **GAM placement/slot behavior preserved from `03`**. New UI **adapts around fixed ad slots**. |
| 11 | **Affiliate** | Buy Tickets CTAs render in required positions; destination from **`/buynow/<code>`** or future API/config. **No hardcoded external affiliate URLs.** |
| 12 | **SEO/schema** | Reusable SEO + schema utilities later; **content values admin/API-driven**. **No hardcoded SEO copy** in components. |
| 13 | **Canonical convention** | **Not finalized.** Before implementation, verify live canonical, sitemap, redirects, Search Console. Until then **preserve existing URL patterns; avoid canonical changes.** |
| 14 | **Benchmark** | Aim for **LotteryPost-like simplicity** (fast, clear, content-rich, easy nav) while preserving LotteryCorner revenue, SEO, data depth, AI roadmap. |
| 15 | **Discipline** | **Ask Bala for permission before running any install/scaffold command.** |
| 16 | **Deployment (Phase 1)** | **Self-hosted Next.js Node server on the existing Ubuntu VPS**, behind **Apache reverse proxy + Cloudflare**. **Not Vercel.** **Not static-export** as primary mode (SSR/SSG hybrid). Cloudflare stays enabled (DNS, SSL, CDN, WAF, bot control, caching). Existing Apache/Cloudflare redirects preserved until audited. Details in "Deployment & Hosting" below. |

### Stack specifics (implied by decisions, to confirm at scaffold time)
- **Next.js App Router** (route-level `metadata`, streaming SSR, static generation) — best fit for Decisions 1–3.
- **TypeScript** strict; **Tailwind CSS**; ESLint/Prettier.
- **Rendering per page type:** state/game/history/home/static = **SSG/ISR or SSR** (crawlable HTML). Ads/countdowns/favorites = small **client components** hydrated inside server pages (never the main content).
- **Data-provider abstraction** (`lib/data-provider`): one interface, sample-JSON implementation now, API implementation later — swap without touching components.
- **No backend/API, no DB** in `01-new-ui` Phase 1.

### Deployment & Hosting (Decision 16 — Bala)
Phase 1 targets the **existing infrastructure**, not a managed platform.
- **Runtime:** run Next.js as a **self-hosted Node server** (`next build` + `next start`), managed by **PM2 or Docker** (choose at deploy time). **Do NOT assume Vercel.**
- **Rendering mode:** **SSR/SSG hybrid** must be supported. **Do NOT use `output: 'export'` (static export) as the primary mode** unless Bala explicitly approves — this preserves route-level SSR/ISR needed for SEO, fresh results, and dynamic pages.
- **Reverse proxy:** the Node app sits **behind Apache** (reverse proxy) on the **Ubuntu VPS**. Apache terminates/forwards to the Node port; keep the app bound to localhost + a fixed port.
- **Cloudflare stays enabled** in front of Apache for **DNS, SSL, CDN, WAF, bot/crawler control, caching, and DDoS protection**. Ensure legit crawlers (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot) are not WAF-blocked (ties to `15-...` robots/AI-crawler policy).
- **Redirects:** **existing Apache + Cloudflare redirects are preserved initially** and are the source of truth. **Do NOT move redirect logic into Next.js** until the redirect map is **audited** (relates to `01-...` legacy-route + canonical questions). Avoid double-redirects (Cloudflare↔Apache↔Next).
- **Caching interplay:** Cloudflare cache + Next.js ISR/`Cache-Control` must be coordinated so fresh lottery results are not over-cached (revalidation/purge on result update; ties to freshness rules in `02-...`/`05-...`).
- **Implications for the build:** keep the app **portable** (no Vercel-only APIs / no reliance on Vercel edge/image services); use a **standard Node image adapter** for images or a self-hosted loader; env-based config for the port and base URL. Confirm PM2-vs-Docker and Node version at deploy time.

### Source XML feed & payout normalization (Bala clarification)
The sample source feed `04-sample-data/source-xml/latest-results-lc.xml` is the Tinbu-style results feed:
`<results> → <continent> → <Country> → <State> → <game>` with per-game `<result-date>`, `<numbers-str>`
(numbers as a **single string**, e.g. `12-29-37-43-55, PowerBall: 18, PowerPlay: 4`), `<jackpot>`/`<prize>`,
`<next-date>`, `<next-jackpot>`/`<next-prize>`, and an optional **`<payout>`**.
- **`<payout>` contains escaped nested XML** using `&lt;`/`&gt;` (an inner `<payoutInfo …>` doc with winner/match/prize rows). **This is expected and valid — not an error.** It corresponds to the `game_result.payout_xml` column (`04-...`).
- **Rules (locked):**
  - The **browser UI must NOT parse this raw XML** directly.
  - A **future API/parser decodes the nested escaped XML safely** (unescape → parse inner `<payoutInfo>`), server-side only.
  - **Payout is normalized to JSON before it reaches the UI**; the UI consumes **structured payout fields**, never escaped-XML strings.
  - **`<numbers-str>`** is likewise parsed/normalized server-side into structured ball groups (ties to `result-format-definitions.json` and `04-...`) — the UI never string-splits raw feed values.
  - **Do not lose payout data** during transformation (round-trip winner/match/prize rows).
- **Phase 1:** UI works from **normalized JSON**; sample JSON may include normalized payout examples where useful. Raw XML is a *reference of feed shape*, not a UI input.

---

## Recommended folder structure for `01-new-ui`
```
01-new-ui/
  app/                         # Next.js App Router (server-rendered public pages)
    layout.tsx                 # <Layout>: Header, UtilitySubBar, Footer, base <head>
    page.tsx                   # Home  (/)
    [state]/page.tsx           # State page  (/{state})  + date params
    [state]/[game]/page.tsx    # Game page   (/{state}/{game})
    [state]/[game]/[year]/page.tsx   # History  (/{state}/{game}/{year})
    powerball/page.tsx ...     # multi-state named routes (/powerball, /mega-millions, ...)
    jackpots/page.tsx
    blog/page.tsx  blog/[slug]/page.tsx
    news/page.tsx  news/[slug]/page.tsx
    (static)/about-us/page.tsx ...   # static/informational pages
    buynow/[code]/route.ts     # placeholder redirect handler (internal affiliate) — stub in Phase 1
    sitemap.ts  robots.ts      # generated from config (verify convention before enabling)
  components/
    layout/    Header UtilitySubBar StateSelector Footer PageTabNav Breadcrumbs
    seo/       SeoHead CanonicalUrl BreadcrumbSchema OrganizationSchema WebsiteSchema
               WebPageSchema DatasetSchema ResultAnswerBlock LastUpdated
               OfficialSourceNotice ResponsiblePlayNotice
    ads/       AdSlot AffiliateBanner NewsletterSignup     # AdSlot reads ad-slot-definitions.json
    results/   DynamicResultCard BallGroup Ball SpecialBallLabel MultiplierBadge
               DrawSchedule HistoryTable JackpotCard
    modules/   CheckTicketTool NewsAndWinners FundAllocation AnonymityRules
               DataMethodology QuickFactsTable BiggestJackpotsTable HighlightsGrid
               PopularGames HowToClaim TaxInfo FaqAccordion GameComparisonTable
    cta/       BuyTicketsCta
    account/   LoginRegisterLinks FavoriteStar    # visible hooks, stubbed
    ai/        AiToolsTeaser                        # honest copy, stubbed
  lib/
    data-provider/   index.ts (interface) + sampleProvider.ts (reads 04-sample-data)
    seo/  schema/  timezone/  (local→EST→local helpers)  format/ (result-format resolver)
    config/  (state defs, module toggles, ad-slot defs loaders)
  types/       Game State DrawResult ResultFormatDefinition AdSlot etc.
  public/      static assets (logos, icons)  # keep robots.txt/ads.txt behavior in mind
```

## Recommended first pages/components to build (order)
1. **`Layout` + `Header`/`UtilitySubBar`/`Footer`** and the **data-provider interface** (sample impl).
2. **SEO/schema utilities** (`SeoHead`, `CanonicalUrl`, `Breadcrumbs`+`BreadcrumbSchema`, `Organization`/`Website` schema, `LastUpdated`, `OfficialSourceNotice`, `ResponsiblePlayNotice`) — values from sample JSON, not literals.
3. **`DynamicResultCard` + `BallGroup`/`Ball`/`SpecialBallLabel`/`MultiplierBadge`** — the dynamic engine (test Cash Pop 1-ball, Powerball 5+1+1, Keno 20+1, FL Lotto 6+6 Double Play, a card game).
4. **`AdSlot`** (reads `ad-slot-definitions.json`; renders exact GAM slot placeholders in fixed positions) + **`BuyTicketsCta`** (`/buynow/<code>` from provider).
5. **`StatePageTemplate`** (Layer A + config-driven Layer B) → render **`/fl`** and **`/az`** from sample JSON.
6. **`GamePageTemplate`** → `/powerball`, `/mega-millions`.
7. **`HistoryPageTemplate` + `HistoryTable`** (timezone-safe grouping) → `/{state}/{game}/{year}`.
8. **Home** (preserve structure; minimal alignment).
9. Stubs: `LoginRegisterLinks`, `FavoriteStar`, `AiToolsTeaser`; blog/news placeholders; static pages.

## Sample data files needed before coding (`04-sample-data/`)
- `states-config.json` — state defs (code, name, H1, intro, enabled Layer B modules, game list, tax/claim/fund/anonymity, timezone).
- `games-config.json` — id → name, `NUM_OF_BALLS`, playType, isMultiState, isCardGame, status, timezone.
- `result-format-definitions.json` — `ResultFormatDefinition`s incl. edge cases (1-ball Cash Pop, Keno 20+1, FL Lotto 6+6 Double Play, USVI 4+4+4, card game) + effective-date variants.
- `state-fl-sample.json`, `state-az-sample.json` — full StatePage payloads (Layer A + module data + `lastUpdated` + timezone metadata).
- `game-powerball-sample.json`, `game-mega-millions-sample.json` — game detail + latest result (special ball + multiplier).
- `payout-sample.json` — **normalized** payout example (from a decoded `<payout>`/`payoutInfo`): structured winner/match/prize/tier rows the UI can render — no escaped-XML strings. (Reference raw feed: `04-sample-data/source-xml/latest-results-lc.xml`.)
- `history-sample.json` — year table, grouped by **game-local** draw date (timezone test data).
- `ad-slot-definitions.json` — per page type: ordered GAM slots (slotPath, sizes, sizeMapping, position) + AdSense/managed placements (from `03`).
- `affiliate-link-placeholders.json` — `/buynow/<code>` per state×game (no real destinations).
- `home-page-sample.json` — featured games, news, jackpots, popular games, state links.

## Risks
- **Ad fidelity:** AdSlot must reproduce exact GAM slot paths/sizes/order (`03`); mis-placement risks revenue + GAM config mismatch. Exact **mobile** slot coordinates unverified (no renderer) — validate against live.
- **Timezone correctness:** local→EST→local query/display (`06` §9); post-10 PM PST/MST boundary bugs can mis-date history/URLs.
- **Canonical convention unresolved (Decision 13):** premature canonical/host/slash choices could harm rankings — preserve existing until verified.
- **Result-format completeness:** `bonus_numbers_info` data + `highlighted1..7` color mapping still missing — needed to finalize `result-format-definitions.json`.
- **Sample-vs-real drift:** keep the data-provider interface strict so API swap is clean.
- **Payout/feed parsing:** `<payout>` holds **escaped nested XML** and `<numbers-str>` is a raw string — both must be **decoded/normalized server-side**; parsing in the browser or losing winner/match/prize rows is a correctness + data-loss risk. Escaped `&lt;`/`&gt;` must be unescaped before parsing.
- **Scope creep:** login/forum/AI/admin are explicitly deferred — enforce Phase-1 boundaries.
- **Deployment/caching:** Cloudflare + Apache + Next.js is a 3-layer cache/redirect stack — mis-coordination risks over-cached stale results, double-redirects, or WAF-blocked crawlers. Keep redirects in Apache/Cloudflare until audited; coordinate cache TTL/purge with result freshness.
- **Portability:** avoid Vercel-only features so the self-hosted Node deployment stays clean (images, edge, ISR revalidation must work on Node/PM2/Docker).

## Decisions still pending (Bala)
1. **Permission to scaffold `01-new-ui`** + run install commands (Decision 15) — **hard gate**.
2. **Canonical host + trailing-slash convention** (after checking live canonical/sitemap/redirects/Search Console).
3. **Ad-slot mapping sign-off** (`ad-slot-definitions.json`), managed-wrapper vendor (`lotterycornercom_*`), 2nd pub `pub-5258173596915552`.
4. **`bonus_numbers_info` data + `highlighted1..7` CSS colors** to finalize result rendering.
5. **Admin destination** (keep existing / new separate app / protected area in new app — `15` §6).
6. **Home scope** confirmation (preserve + minimal alignment; no proposed mockup).
7. **Blog/news Phase-1 depth** (full vs placeholder) and which insider/AI entry points surface first.
8. Optional: Next.js **App Router** confirmation and Node/tooling versions at scaffold time.
9. **Deployment specifics (Decision 16):** PM2 vs Docker; Node LTS version; Apache reverse-proxy vhost/port config; app port + base-URL env; Cloudflare cache rules + purge-on-update strategy; **redirect audit** before any move into Next.js.

---

## Summary
Stack is **Next.js + TypeScript + Tailwind**, server/static-rendered, sample-JSON-driven via a data-provider
abstraction, with **fixed ad slots**, **non-hardcoded** Buy Tickets + SEO content, deferred admin/login/forum/AI,
and **no canonical changes** until verified. Build order and sample-data files are defined. **Scaffolding
requires Bala's explicit go-ahead** (Decision 15).
