# SEO Content, Admin Editability, Subscriber/Login, Forum & AI Strategy

Strategy layer that sits above the technical discovery (`01`–`06`, `09`, `13`). Covers what makes
LotteryCorner rank and get cited by search **and** AI answer engines: crawlable HTML, **editable**
content, structured data, trust notices, fresh result data, and admin-managed metadata.
No UI/API code. Reference project unchanged.

> Informed by current guidance (see **Sources**): Google requires structured data to **match visible
> content**; AI crawlers (OAI-SearchBot, PerplexityBot, etc.) are controlled via **robots.txt** and
> reward crawlable, fresh, well-structured pages; **Dataset** schema fits result-history pages.

---

## 1. Purpose
SEO/GEO/AEO is **not only code**. Ranking + AI citation depend on:
- **Crawlable server-rendered HTML** (main content in HTML, not client-only) — `02`, `06` §11.
- **Editable content** (state/game copy, FAQs, notices) managed by admins, not hardcoded in templates.
- **Structured data (JSON-LD)** that mirrors visible content.
- **Trust signals** — official-source attribution, independence disclaimer, responsible-play/18+.
- **Fresh result data** with visible + machine-readable `lastUpdated`, sitemap `lastmod`, IndexNow.
- **Admin-managed metadata** (title/description/H1 per URL) — already DB-driven today (`02` §1, `SEOMeta`).
GEO/AEO is achieved **through** strong technical SEO + answer-focused, sourced content — not as a separate gimmick (CLAUDE.md).

## 2. Dynamic SEO / Content Model (admin/API-driven, NOT hardcoded)
Every field below must come from config/admin/API via the data-provider (sample JSON now, API later):
`title`, `metaDescription`, `canonical`, `H1`, **intro answer block**, state/game **summary**, **FAQs**,
**official source attribution**, **responsible-play notice**, **`lastUpdated`** (visible + ISO `dateModified`),
**internal links**, **schema/JSON-LD inputs**, **blog/news content**, **AI tool teasers**.
- Templates render these fields; they never contain the copy literally.
- Matches existing behavior: `SEOMetaInfo` (pageUrl→title/desc/H1/headings) is already per-URL DB data with templated fallback — preserve and migrate (`02` §1, `06` §11).

**Result & payout data normalization (Bala clarification).** The source feed (`04-sample-data/source-xml/latest-results-lc.xml`) carries per-game numbers as a **string** (`<numbers-str>`) and an optional **`<payout>` element containing escaped nested XML** (`&lt;payoutInfo…&gt;` with winner/match/prize rows — expected, valid, not an error; = `game_result.payout_xml`, `04-...`). SEO/content rules:
- Payout and numbers are **normalized to JSON server-side** (decode escaped XML → parse `<payoutInfo>`); the **UI/schema consume structured fields, never escaped-XML strings** and never parse raw XML in the browser.
- **No payout data loss** in transformation — winner/match/prize/tier rows must survive into the content model so they can drive visible prize-breakdown tables **and** matching structured data.
- Structured payout/prize content is admin/feed-sourced (not hardcoded) and, where shown visibly, can support prize-tier tables and (per §3) `Dataset` metadata.

## 3. JSON-LD / Schema.org Strategy
Reusable **schema generator components**, each fed from the **same content/data model** as the visible page (so markup always matches what's rendered — Google policy):
- `OrganizationSchema` — sitewide (name, url, logo, sameAs). Exists today (`02` §8).
- `WebsiteSchema` — sitewide, **add `potentialAction` `SearchAction`** (sitelinks search box) — currently missing.
- `WebPageSchema` — per public page.
- `BreadcrumbListSchema` — per page (extend trail: Home → State → Game → Year). Exists for state today.
- `DatasetSchema` — **result/history pages** (`/{state}/{game}/{year}`): `name` + `description` required; add `DataDownload` **only if** a real CSV/API/download exists (a history download stream does — `01` §11). Fits Google's "data-focused page" guidance. Source the dataset from **normalized** result/payout JSON (never escaped-XML strings — see §2 normalization note).
- `Article` / `NewsArticle` — **editorial blog/news posts only** (with `datePublished`/`dateModified`, author, headline). Not on result pages.
- `FAQPageSchema` — **only when FAQ content is visible** on the page.
- `DataDownloadSchema` — only where download access actually exists.
**Rules:** JSON-LD only; must be a true representation of visible content; no markup of hidden/empty content; generate from the content model so schema and HTML never drift.

## 4. State-Specific SEO Content (editable per state)
Editable blocks per state page (config-driven, toggled via the module matrix `10`):
short answer / **latest results intro** / **official source notice** (link to that state's lottery) /
**draw schedule explanation** / **claiming info** / **tax info** / **anonymity rules** / **FAQs** /
**responsible play** / **data accuracy & update policy** / **internal links** to that state's games + history.
- Keep stable `/{state}` URLs; content differs by state; **do not hardcode Florida** (`09`, `06` §4).
- No-lottery states (al/ak/nv/hi/ut) still need editable FAQ + intro + SEO meta (`05` R10).

## 5. Game-Specific SEO Content (editable per game)
Editable blocks per game page:
**result summary** / **rules summary** / **odds summary** / **next-draw explanation** /
**jackpot explanation** / **history intro** / **number-analysis intro** / **FAQs** /
**official source notice** / **responsible play**.
- Sourced from `game` fields (HOWTOPLAY, PLAY_TYPE, PRIZE_MATRIX, odds) + editable overrides.
- Multi-state games (Powerball/Mega Millions/etc.) share game copy but link to state context.

## 6. Admin Strategy
- **Admin already exists** in the reference app: manage missing/updated results (`addresults`, `updateresultsfromxml`, `uploadresults`), games (`addgame`), blogs/news (`addblogentry`, `addnewsentry`), **SEO metadata** (`addSEOMetaInfo`/`editSEOMetaInfo`), affiliate props (`addaffliateproperties`), sitemap (`addsitemapxml`), holidays (`markholiday`) — auth-gated `/admin/*` package (`01`, `02`, `03`, `05`).
- **Phase 1: do NOT rebuild admin** unless required. The new **public UI consumes admin-managed content** via sample JSON now, API later.
- **Future decision (Bala):** admin can (a) remain the existing separate app, (b) become a new separate admin app, or (c) become a protected area inside the new app. Pick during tech-stack finalization.

## 7. Subscriber / Login Strategy (plan only — do NOT implement in Phase 1)
Plan for (existing "Insider" concept, `05` R18):
login/register links, **favorites / star games** (star icon already in mockups, `08`), saved states/games,
alerts, smart-pick tools, number search, download/history, **AI tools**, subscriber dashboard.
- Phase 1: render **login/register + favorite-star affordances as visible entry points** (non-functional or stubbed), keep public content crawlable and ungated.
- Gate real tools behind login later.

## 8. Forum / Community Strategy (plan only — do NOT implement unless approved)
Lightweight forum/threads for SEO + engagement (legacy `newforum` route existed):
- **forum categories**, **thread pages**, **moderation**, **spam control**.
- **noindex thin/low-quality/empty threads**; index only substantive threads (avoid crawl-budget dilution / doorway pages).
- Internal-link threads to relevant **results / game / blog** pages.
- Phase 1: not built; reserve URL space + nav slot only if Bala approves.

## 9. AI Positioning & Content Strategy (plan; careful copy)
Planned AI areas (future, mostly logged-in — `13` §5, `05` D5):
**Lottery Genie / Lucky GPT**, **AI lottery insights**, **smart number analysis**,
**personalized alerts**, **historical pattern exploration**, **responsible-play guidance**.
- **Do NOT claim AI can predict or guarantee winning numbers.** Lottery draws are random.
- Approved copy style: **"AI-assisted insights"**, **"pattern exploration"**, **"personalized tools"**, "for entertainment/informational purposes".
- Phase 1: `AiToolsTeaser` entry points only, honest copy, gated tools later. Pair AI surfaces with the responsible-play/18+ notice.
- Keep AI features from harming SEO: don't block crawlers from public result content; AI tools sit behind login.

## 10. LotteryPost Simplicity Benchmark (Bala direction)
LotteryCorner should move toward the **simplicity and usability of LotteryPost.com** — clean, fast,
easy result scanning — **while preserving** LotteryCorner's: revenue model + **fixed ad placements** (`03`, `13`),
SEO structure + indexed URLs (`01`, `02`), state/game **data depth**, and planned **AI tools**.
Simplicity applies to UX/layout clarity, **not** to dropping revenue units, schema, or content depth.

## 11. Phase 1 vs Later
**Phase 1 (public UI, this build):**
- SEO/content **placeholders** for every field in §2 (fed by sample JSON).
- **Schema utility components** (§3) wired to the content model.
- Trust/notice blocks (official source, responsible play, `lastUpdated`).
- Visible-but-stubbed entry points: login/register, favorite star, AI teaser, insider/systems links.
- Fixed ad slots + Buy Tickets CTAs preserved.

**Later phases:**
- Admin rebuild/decision (§6), login/subscriber dashboard (§7), forum (§8), functional AI tools (§9),
  SEO enhancements (SearchAction, Dataset, IndexNow, sitemap index, AI-crawler robots rules).

## 12. Open Questions for Bala
1. **Admin destination:** keep existing admin, new separate admin app, or protected area in the new app (§6)?
2. **Canonical host/slash convention** (needed before schema/canonical emit — `02` §3, `06` §15).
3. **Robots/AI-crawler policy:** confirm allow OAI-SearchBot / PerplexityBot / Bingbot / Googlebot and the GPTBot (training) stance; adopt **IndexNow** + **llms.txt**?
4. **Dataset/DataDownload:** expose result history as a downloadable dataset (enables `DataDownload`), or metadata-only `Dataset`?
5. **Forum:** in scope at all, and if so when (§8)?
6. **Login/subscriber scope** for the first functional release (which insider tools first) (§7)?
7. **AI copy sign-off:** approve the "AI-assisted / no-prediction" wording and branding (Lottery Genie / Lucky GPT) (§9)?
8. **`bonus_numbers_info` data + `highlighted1..7` colors** still needed to finalize result rendering (`04`, `06` §15).

---

## Sources (consulted July 2026; summarized, not copied)
- [Google — General Structured Data Guidelines (must match visible content; JSON-LD; no hidden/empty markup)](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google — Intro to Structured Data (JSON-LD recommended)](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google — Dataset structured data (data-focused pages; name/description; DataDownload distribution)](https://developers.google.com/search/docs/appearance/structured-data/dataset)
- [Google — Article structured data (editorial posts; datePublished/dateModified)](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google — FAQPage structured data (visible FAQ requirement)](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Google — Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [OpenAI — Overview of Crawlers (GPTBot=training, OAI-SearchBot=search indexing, ChatGPT-User=live fetch)](https://developers.openai.com/api/docs/bots)
- [Perplexity — Bots & crawler documentation](https://docs.perplexity.ai/guides/bots)
- [Bing — Which crawlers does Bing use (+ IndexNow)](https://www.bing.com/webmaster/help/which-crawlers-does-bing-use-8c184ec0)
