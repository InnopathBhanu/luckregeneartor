# URL Inventory — LotteryCorner (reference project)

Discovery of the existing URL structure in `00-reference-existing-project/LotteryCorner40`
(Struts 2, filter mapped to `/*`). Read-only; reference project not modified. No UI/API built.

Authoritative sources: `src/struts.xml` (routing), `src/struts_old.xml` (legacy), `WebContent/sitemap.xml`
(9,246 indexed `<loc>`s), `WebContent/robots.txt`. Cross-refs: `01-url-seo-preservation-rules.md`,
`03-revenue-inventory.md`, `02-seo-geo-aeo-inventory.md`.

> Struts routing is **wildcard-based and order-sensitive**: specific named actions first, then
> `*` (state), `*/*` (game), `*/*/*` (history). Any unmatched single segment is treated as a **state page**.

---

## 1. Home
- `/` → `index.jsp` (welcome-file) → forwards to Struts; `welcome` / `welcome/` → `WelcomeAction` → `index_upgrade_as.jsp` (live). Alt results: `_special`, `_lazy_testing` (A/B variants).
- Canonical host in schema/OG: `https://www.lotterycorner.com/` (www + trailing slash).

## 2. State pages — `/{state}` (MUST PRESERVE)
- `*` and `*/` → `StateResultsAction`, `selectedState={1}`, `page={1}_state` → `lottery-result_upgrade_as_new.jsp` (live).
- Examples from sitemap: `/fl`, `/az`, `/ga`, `/ny`, `/ca`, `/pa`, `/or`, `/ok`, `/va`, `/pr` (Puerto Rico), `/vi` (US Virgin Islands), `/vt`, `/wi`, … (all US states + territories).
- Ad slots on this page: `lc_sp_*` GAM set (see `03-revenue-inventory.md` §3).

## 3. State-specific / special routes
- **Florida** override: `fl-new`, `fl-new/` → `StateResultsAction` → `florida_newVersion.jsp` (different template; still under `/fl` conceptually — confirm live path).
- **No-lottery states** (result-name routing in `StateResultsAction`): `al`→`state_al.jsp`, `ak`→`state_ak.jsp`, `hi`→`state_hi.jsp`, `ut`→`state_ut.jsp`, `nv`→`state_nv.jsp`.
- **`special`** result → `lottery-result_upgrade_special.jsp` (condition set in action — unclear trigger, see Risks).
- State-specific ad slot exists: `wyoming_on_results_table_pos1/2` (in-results-table ad for WY).

## 4. Game pages — `/{state}/{game}` (MUST PRESERVE)
- `*/*` and `*/*/` → `GameResultsAction`, `selectedState={1}`, `gameNameUrl={2}` → `game_upgrade_as.jsp` (result `global` → `game_upgrade_global.jsp`).
- Examples: `/ca/fantasy-5`, `/ny/numbers-evening`, `/nj/pick-6`, `/oh/pick-5-evening`, `/or/mega-bucks`, `/pr/pega-2-noche`.

### 4a. Multi-state games — dedicated 1-segment routes (MUST PRESERVE)
Named actions → `multistate/powerball_upgrade_as.jsp` with a preset `selectedState`:
- `/powerball` (multi), `/mega-millions` (multi), `/lotto-america` (multi), `/cash4life` (ny), `/lucky-for-life` (de), `/2by2` (ks), `/gimme-5` (me), `/tri-state-pick-3-day`, `/tri-state-pick-3-evening`, `/tri-state-pick-4-day`, `/tri-state-pick-4-evening`, `/tri-state-megabucks-plus` (me).
- `powerball_upgrade_global` result variant (geo global) exists.

## 5. Result pages
- **Per Bala clarification: there is NO separate dedicated "results page" route as its own page type.**
  - The **state page = the default latest-results page** (`/{state}` shows that state's latest lottery results by default).
  - **Date-specific results are handled by the same state results page/action** using date-parameter behavior (same `StateResultsAction`/state page, with a date parameter) — not a distinct route. (Exact date-parameter name not separately traced in code; treat as Bala-confirmed behavior.)
  - The **game page** (`/{state}/{game}`) shows latest results for one game; game **history by year** is `/{state}/{game}/{year}` (§6).
  - **Do not design a separate public results-page route** unless discovered later in code or explicitly approved by Bala.
- No separate `/results/...` public path exists except the history download stream (§11).

## 6. History pages — `/{state}/{game}/{year}` (MUST PRESERVE — 8,700 URLs)
- `*/*/*` and `*/*/*/` → `GameResultsHistoryAction`, `page=gameHistory` → `gamehistoryresults_upgrade_as.jsp`.
- URL = state / game / **year**, e.g. `/nc/powerball/2007`, `/nc/cash-5/2008`. These are the **bulk of the sitemap** (~8,700 of 9,246).
- Has `redirectToLatest` result → `type=redirect ${correctedUrl}` (self-canonicalizing redirect for bad/partial history URLs — behavior must be preserved).
- `*/*/*/*` (4-seg) → `StateResultsAction` fallback (unclear purpose — see Risks).

## 7. Jackpot pages
- `/jackpots` → `JackpotsAction` → `jackpot_upgrade_as.jsp` (ad slots `lc_jp_*`).
- `/jackpotanalysis` (+ `/`) → `JackpotAnalysisAction` (home + detail results).
- `/{state}/{game}/jackpotanalysis` (+ `/`) → per-game jackpot analysis.
- `/popularlotteries`, `/multistatelotteries` → popular/multi-state game index pages.

## 8. Blog
- Listing: `/blog` (+ `/`) → `BlogHomeAction` → `blog_upgrade_as.jsp`.
- **Post: `/blog/{slug}`** → `blog` namespace package, `*`/`*/` → `ShowBlogEntryAction.showBlog` → `blogentry_as.jsp`. Examples: `/blog/five-biggest-lottery-winners-in-the-us`, `/blog/advantages-of-playing-lottery-online`.
- Tag/category: `blogsbytag` → `ShowBlogEntryAction` → `blogentrylist.jsp` (tag listing — confirm public path).
- `/simple-blog` → `NewBlog.jsp` (alternate/newer blog template; uses `lc_bdp_*` ad slots).

## 9. News
- Listing: `/news` (+ `/`) → `NewsHomeAction` → `news_upgrade_as.jsp`.
- **Post: `/news/{slug}`** → `news` namespace package, `*`/`*/` → `ShowNewsEntryAction.showNews` → `newsentry_upgrade_as.jsp`. Example: `/news/kentucky-ky-5-card-cash-lottery-ended-on-march-22nd-2022`.

## 10. Static / informational pages (MUST PRESERVE)
`/about-us`, `/faqs`, `/contact-us`, `/write-us`, `/privacy-policy`, `/cookies-policy`, `/terms-and-conditions`, `/lottery-tax-calculator`, `/reviewspage`, `/unsubscribe` (+ `unsubscribeAction`), and glossary: `/lottery-glossary-a-to-c`, `-d-to-j`, `-k-to-n`, `-o-to-q`, `-r-to-s`, `-t-to-z`.
(All have trailing-slash twins, e.g. `about-us` and `about-us/`.)

## 11. Affiliate / utility routes (DO NOT BREAK)
- **`/buynow/{urlCode}`** → `AffiliateAction` → `302 redirect ${partnerURL}` (internal affiliate redirect; **robots-disallowed**). See `03-revenue-inventory.md` §6.
- `/emailbuynow/megamillions`, `/emailbuynow/powerball` → `SendResultsEmailAction` → 302 redirect.
- `/feed` → `RssFeedAction` (stream; static `rss.xml` also present).
- `/robots` → serves robots.txt; `/ads` → serves ads.txt; `/izooto` → izooto.html.
- `/getsystempicks/.../{drawDate}`, `/getresultsjson` → JSON APIs (`type=json`).
- `/results/download/*.*` → `GameResultsHistoryDownload` (CSV/stream; `insiderlogin` redirect if gated).
- `/lottery-claim-forms/*/*` → claim form assets.

## 12. Wildcard / legacy Struts routes
- **Live wildcards (order matters):** `*` (state) → `*/*` (game) → `*/*/*` (history) → `*/*/*/*` (state fallback). Specific named actions are declared **before** wildcards so they win.
- **Legacy `struts_old.xml`** (114 actions, not the active config): `newhome`, `newstate`, `newgame`, `newforum`, `newblog`, `newblogentry`, `popular`, older `SimpleForwardAction` static pages. Status in production unknown (see Risks).
- Admin package `/admin/*` (auth-gated via `AuthenticationInterceptor`) — should be `noindex`.

## 13. Redirects (discoverable in code)
- `/buynow/*`, `/emailbuynow/*` → `302 redirect` to partner URL.
- History `*/*/*` → `redirectToLatest` (`302 redirect ${correctedUrl}`) for correcting/normalizing history URLs.
- `admin` → `redirectAction` to `admin/admin`; `login` → `redirectAction admin`.
- **No file-based 301 redirect map found** (no `.htaccess`, no redirect table in config). Any legacy→new 301s are not in this repo — confirm at the web-server/CDN layer (see Risks & questions).

## 14. URL patterns that MUST be preserved
- Home `/`; state `/{state}` (incl. territories `pr`, `vi`); multi-state game 1-seg routes (§4a); game `/{state}/{game}`; history `/{state}/{game}/{year}`; jackpot `/jackpots`, `/jackpotanalysis`, `/{state}/{game}/jackpotanalysis`; blog `/blog`, `/blog/{slug}`; news `/news`, `/news/{slug}`; all static pages (§10); `/buynow/*`, `/emailbuynow/*`, `/feed`, `/ads`, `/robots`.
- Per `CLAUDE.md` + `01-url-seo-preservation-rules.md`: **do not rename `/fl`→`/florida`** etc. without a documented old→new, canonical, and 1:1 301 plan.

## 15. Unclear / risky URL patterns
- **Broad wildcards:** `*` = state and `*/*` = game mean *any* unknown single/double segment renders a (possibly thin/soft-404) state/game page. Risk of duplicate/low-value URLs; a rebuild must replicate the exact match order or introduce an explicit allowlist + 404s.
- **`special` result trigger** in `StateResultsAction` (→ `lottery-result_upgrade_special.jsp`) — condition not yet traced. Unknown which states/dates hit it.
- **`*/*/*/*` (4-seg) → StateResultsAction** — purpose unclear (legacy? bad-URL catch?).
- **Canonical host inconsistency:** state canonical = `https://lotterycorner.com/{state}` (no-www, **no trailing slash**), but BreadcrumbList/OG use `https://www.lotterycorner.com/{state}/` (**www + trailing slash**). Mixed signals — see `02-seo-geo-aeo-inventory.md` §3.
- **`fl-new`** vs `/fl` — is the public Florida URL `/fl` or `/fl-new`? Confirm which is indexed/canonical.
- **`blogsbytag`** public URL/path and whether tag pages are indexed.
- **Legacy `struts_old.xml`** routes (`newstate`, `newgame`, …) — still served / 301'd / dead? Unknown.
- **`simple-blog` vs `/blog/{slug}`** — two blog templates; which is canonical for a given post?

## Bala Decisions / Clarifications

Authoritative decisions affecting URLs (see `05-business-rule-inventory.md` "Bala Decisions" for full context).

- **Ignored-game URLs (D4):** ignored games are **removed from the state page list**, **but their direct game URLs (`/{state}/{game}`) may still be reachable** (bookmarks, search, old links). **Do not auto-delete, 301-redirect, or noindex ignored game URLs without Bala approval.**
- **Closed-game URLs (D4):** **closed games may remain visible/indexed** when they have historical results or SEO value. Preserve the URL; the page must **clearly show "closed"** status.
- **Year-history & date-specific URLs (D7):** for `/{state}/{game}/{year}` and date-specific views, the date range must be computed in the **game/state local timezone**, converted to **EST** for the DB query, then results converted **back to game-local** for display. Critical for **PST/MST** games and **post-10 PM local** draws that shift a calendar day in EST — the **URL year/date must reflect the game-local draw date**, not the EST-shifted date. `selectedDay + 1` is a **legacy symptom, not a rule** (D8) — keep as a test case, do not reproduce.
- **Buy Tickets / `/buynow/*` (D2):** keep `/buynow/<code>` as the internal affiliate redirect (robots-disallowed). UI never hardcodes destinations; the API resolves them (geo/state/game/affiliate/tracking). Cached US-only behavior reviewed at API time.
- **Insider/systems/prediction routes (D5):** preserve existing entry points/URLs (Lottery Systems, Smart Pick, Search Numbers, History, Download, Insider, Predictions) as SEO/revenue assets; plan as future logged-in/AI tools — do not remove or restructure yet.

## Questions for Bala
1. Are legacy `struts_old.xml` routes (`newhome/newstate/newgame/newblog…`) still live or already redirected? Any existing 301 map at server/CDN?
2. Is the public Florida URL `/fl` (canonical) with `fl-new` internal, or is `/fl-new` indexed?
3. What triggers the `special` state template, and which states/dates use it?
4. Are `blogsbytag` tag pages and `simple-blog` indexed, and which blog template is canonical?
5. Preferred canonical host+slash convention going forward (`lotterycorner.com/fl` vs `www.lotterycorner.com/fl/`)? Needed before we can fix the mismatch without risking rankings.
