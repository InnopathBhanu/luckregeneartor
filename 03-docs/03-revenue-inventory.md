# Revenue Inventory — LotteryCorner (reference project)

Discovery of ad and affiliate/revenue behavior in `00-reference-existing-project/LotteryCorner40`
(Java / Struts 2 app, JSP templates). Read-only; reference project not modified. No UI/API built.

Cross-refs: `13-ad-and-home-design-decisions.md`, `09-...`, `11-...`.
Governing rule (`13`): existing ad placements are **fixed in Google Ad Manager** — preserve exact
positions/order/behavior; new UI adapts around them. Buy Tickets URLs must not be hardcoded.

---

## 1. Files inspected (key)

- Ad/partner config: `WebContent/ads.txt`, `WebContent/ads_google.txt`
- Ad wiring (GPT/AdSense): `WEB-INF/upgrade/commonELements_newVersion.jspf`, `CommonElementsUpgrade.jspf`, `CommonElementsUpgrade_as.jspf`, `headerbar_upgrade_as.jspf`
- State page (live): `results/lottery-result_upgrade_as_new.jsp`; Florida: `results/florida_newVersion.jsp`; special: `lottery-result_upgrade_special.jsp`; no-lottery states: `results/state_{al,ak,hi,ut,nv}.jsp`
- Other page types: `index_upgrade_as.jsp` (home), `results/game_upgrade*.jsp` (game), `results/multistate/powerball_upgrade*.jsp`, `results/gamehistoryresults_upgrade_as.jsp`, `jackpot_upgrade*.jsp`, `blog/blog_upgrade_as.jsp`, `NewBlog.jsp`, `news/news_upgrade_as.jsp`, `populargames.jspf` / `populargames_as.jspf`, `wiiningNumbersByState*.jspf`
- Affiliate/geo (Java): `src/com/lucky/util/AffiliateDetails.java`, `src/com/lucky/cache/AffliatePropertiesCache.java`, `src/com/lucky/actions/AffiliateAction.java`, `src/com/lucky/interceptors/LoggingInterceptor.java`, `src/com/lucky/util/LuckUtils.java`, `WelcomeAction.java`, `actions/result/StateResultsAction.java`, `GameResultsAction.java`, `insider/MyFavouriteGamesAction.java`, `admin/SendResultsEmailAction.java`, `cache/CommonResultsCache.java`
- Affiliate data: `src/config/Affiliate.properties`; admin editors: `admin/addaffliateproperties.jsp`, `admin/editAffliateProperties.jsp`
- Routing: `src/struts.xml` (and legacy `src/struts_old.xml`)

---

## 2. Ad systems in use

| System | Identifier | Where | Notes |
|--------|-----------|-------|-------|
| **Google Ad Manager (GPT)** | **network `/21828142944/`** | `googletag.defineSlot(...).defineSizeMapping(...).addService(googletag.pubads())` in page templates | Primary. All named `lc_*` slots. Responsive via size mappings. `enableSingleRequest()` + `enableServices()`. **These are the fixed GAM placements.** |
| **Google AdSense** | **`ca-pub-6009276896057794`** | `adsbygoogle.js?client=ca-pub-6009276896057794` in `commonELements_newVersion.jspf` + `CommonElementsUpgrade_as.jspf` (site-wide) | Loaded on all pages via common include. |
| **Managed placement wrapper** | `placementName` / `slotId` (e.g. `lotterycornercom_leaderboard_top`) | `index_upgrade.jsp`, many `_upgrade` pages, `populargames.jspf` | Third-party ad-manager wrapper (exact vendor not named in code — likely an Ampliffy/monetization wrapper per ads.txt). **Vendor = unknown, confirm with Bala.** |
| **ads.txt sellers** | 2 DIRECT Google pubs: `pub-6009276896057794`, `pub-5258173596915552`; Ampliffy (`ampliffy/publiffy/videoffy amp/pub/vid00930`); many RESELLERs (media.net, pubmatic, rubicon, openx, triplelift, onetag, smaato, inmobi, lijit, appnexus, yahoo, opera…) | `WebContent/ads.txt` | `ads_google.txt` = `pub-6009276896057794` only. |

> Two Google publisher IDs exist: AdSense uses `pub-6009276896057794`; the second (`pub-5258173596915552`) and the GAM network `21828142944` relationship should be confirmed with Bala.

---

## 3. Ad slot catalog (GAM `/21828142944/…`) by page type

Slot naming: `lc_<pageprefix>_display_web_<position>` (+ `_posN`). Page prefixes:
`sp`=state page, `mgp`/`mpg`=multi-state game page, `bp`=blog, `bdp`=blog detail, `jp`=jackpot,
`gh`=game history, `gn`=game, `hp`=home, `ghp`=global home?. Plus `lc_toppromobar` /
`promotionalbar_test` (top promo bar), `LC_ATV_video_player` (video), and a **state-specific**
`wyoming_on_results_table_pos1/2` (in-results-table ad).

### State page (`lc_sp_*`) — live: `lottery-result_upgrade_as_new.jsp`, Florida: `florida_newVersion.jsp`
Identical slot set on both (Florida is **not** special for ads). ~20 slots, responsive size-mapped:

| Slot (position) | Sizes (desktop → mobile) | Placement (in-page order) |
|-----------------|--------------------------|---------------------------|
| `top_billboard` | [728,90] / [320,50] | Top, below header/promo bar |
| `toppromobar` | (promo bar) | Sticky top promotional/Buy-Tickets bar |
| `mid_leaderboard_pos1..pos6` | [970,90],[728,90],[336,280] | **In-content**, interleaved between result rows/sections |
| `mid_leaderboard`, `mid_skyscraper` | [970,90]/[336,280]; skyscraper | Mid content |
| `side_MPU_pos2..pos5` | [300,250],[336,280],[300,600],[160,600] | **Right rail** (MPU stack) |
| `side_skyscraper`, `_pos2`, `_pos3`, `side_halfpage_pos1` | [160,600],[300,600],[300,250],[320,100] | **Right rail** |
| `bottom_billboard` | [970,250] / [320,100] | Bottom |
| `bottom_large_leaderboard` | [728,90] / [320,50] | Footer area |
| `lc_mgp_snippet_..._320x50_mobile_leaderboard_pos1..4` | [320,50] | **Mobile-only** in-content leaderboards |
| `LC_ATV_video_player` | video | Video ad unit |

### Other page types (unique slots found)
- **Multi-state game page** `lc_mgp_/lc_mpg_*`: top_large_leaderboard, mid_large_leaderboard(+pos1/2), mid_leaderboard, mid_Masthead, side_skyscraper_pos2, side_mpu_pos1..3, side_halfpage_pos1/2, + mobile snippet slots.
- **Blog** `lc_bp_*` / **blog detail** `lc_bdp_*`: top_masthead, middle_leaderboard(+pos1..3), side_mpu, side_halfpage, bottom_leaderboard_sticky, + mobile snippet slots.
- **Jackpot** `lc_jp_*`: top_masthead, middle_leaderboard_pos1/2, side_halfpage, bottom_leaderboard_sticky.
- **Game history** `lc_gh_*`: top_masthead, middle_leaderboard_pos1..4, side_halfpage.
- **Game** `lc_gn_*`: bottom_leaderboard_sticky.
- **Home** `lc_hp_side_halfpage_pos2`; `LC_ghp_display_web_top_billboard`.
- **Admin/promo**: `promotionalbar_test` (1920×75).
- **State-specific**: `wyoming_on_results_table_pos1/pos2` — an ad embedded **inside the results table** for Wyoming only (evidence that per-state in-table ad slots exist).

---

## 4. Desktop vs mobile behavior

- **One responsive template per page type.** GPT `defineSizeMapping()` serves desktop sizes (billboard 970×250, leaderboard 970/728×90, skyscraper 160×600, halfpage 300×600, MPU 300×250) and mobile sizes (320×50, 320×100, 336×280) from the **same** slots.
- **Additional mobile-only slots**: `lc_mgp_snippet_display_web_320x50_mobile_leaderboard_pos1..4` (320×50) rendered on state/blog/game pages and in `populargames_as.jspf`.
- This matches the mobile references (`08-...` §C-M): mobile = same template reflowed; ad slots collapse to 320-wide creatives in the same positions.
- **Desktop right-rail** (MPU/skyscraper/halfpage) has no mobile counterpart size in some slots → on mobile those become in-flow 336×280 or are suppressed by size mapping. Exact mobile fill per slot must be confirmed in GAM.

---

## 5. Right-rail / in-content / footer ads (maps to existing screenshots)

- **Right rail (desktop):** `side_MPU_pos2..5`, `side_skyscraper(+pos2/3)`, `side_halfpage_pos1` — matches the existing right-rail affiliate/promo column in the desktop + mobile screenshots.
- **In-content:** `mid_leaderboard_pos1..pos6` interleaved between result sections; mobile snippet 320×50 slots between cards.
- **Footer/bottom:** `bottom_billboard`, `bottom_large_leaderboard`; blog/jackpot/game use `bottom_leaderboard_sticky` (dismissible sticky — matches mockup footer "Advertisement" with close button).
- **Top promo bar:** `lc_toppromobar` / `promotionalbar_test` — the sticky sub-header bar (jackpots/Buy Tickets area in mockups) is also an ad/promo slot.

> The "lotter.com red banner" seen in screenshots is an **affiliate creative** served into these ad
> slots and/or the managed `lotterycornercom_*` placements — not a separate hardcoded banner.

---

## 6. Buy Tickets Now CTA behavior

- **Button markup** (state page): `<a href="<s:property escape="false" value="buyURL"/>" class="c-btn c-btn--primary bynowbtn">Buy Tickets</a>`.
- **`buyURL` is server-generated**, never a raw affiliate URL: `buyURL = AffiliateDetails.buyBaseURL + urlCode` = **`https://www.lotterycorner.com/buynow/<urlCode>`** (internal redirect).
- Set in actions per game/state: `WelcomeAction` (home: PB gameId 1012, MM 1013, popular games), `StateResultsAction` (state page), `GameResultsAction` (game page), `MyFavouriteGamesAction` (insider favorites), `CommonResultsCache` (cached popular games, hardcodes country "US"), `SendResultsEmailAction` (email).
- **Redirect:** struts `buynow/*` → `AffiliateAction` → `partnerURL = getAffiliateURLFromCode(urlCode)` → `<result type="redirect">${partnerURL}</result>` (302 to real partner). Also `emailbuynow/megamillions` & `emailbuynow/powerball`.
- **Click path:** `Buy Tickets` → `lotterycorner.com/buynow/<code>` → 302 → partner URL (with tracking). **This is exactly the config/API-resolved model `13-...` §3a requires** — the new UI keeps rendering an internal `/buynow/<code>`-style link and lets the backend resolve the destination.

---

## 7. Affiliate destinations, networks & tracking

Resolved from `Affiliate.properties` (seed/fallback; also admin-editable at runtime → cached in `AffliatePropertiesCache`):

| Partner (domain) | Count | Tracking params | Used for |
|------------------|-------|-----------------|----------|
| **jackpot.com** (`partners.jackpot.com/visit/`) | 25 | `bta=35261`, `nci=<per-game id>` | Most **US state** games |
| **theLotter** (`www/or/mn.thelotter.*`, `smarturl.it`) | 16 | `tl_affid=11132`, `ft=5`, `IQid=theLotter` | **Non-US** + some states (OR, MN) |
| **Official state lottery affiliates** (`wl{michigan,virginia,penn}lottery.adsrv.eacdn.com`) | 11 | EACDN/Income-Access campaign URLs | **State-specific**: Michigan, Virginia, Pennsylvania |

- **Two-key lookup** (`AffiliateDetails.getURLCode`): key = `<us|non-us>.<gameId>.<stateCode>`, falling back to `<us|non-us>.<gameId>.xx`. So affiliate destination varies by **country × game × state**.
- Example: `non-us.1012.xx=play-usa-powerball` → smarturl/theLotter; `us.396.ma=play-massachusetts-masscash` → jackpot.com.
- **State/game-specific behavior confirmed:** different partners per state (jackpot.com default US; official affiliate for MI/VA/PA; theLotter for non-US/OR/MN).

---

## 8. Geo / IP routing findings

- **Geolocation:** `LoggingInterceptor` reads client IP (`request.getRemoteAddr()`, or first IP of `X-Forwarded-For` when behind proxy/localhost), then `LuckUtils.getLocationDetails()` uses **MaxMind GeoIP2** (`com.maxmind.geoip2`, CityResponse) → stores ISO country code in Struts `ActionContext` as `country` (`StringConstants.COUNTRY`).
- **Fallbacks:** no location found → default **"US"**; local/IPv6 loopback → **"US"**.
- **Effect on Buy Tickets:** actions read `reqCountry = context.get(COUNTRY)` and pass it to `getURLCode(country, state, game)` → **US vs non-US changes the affiliate destination** (e.g. US→jackpot.com/official; non-US→theLotter). `CommonResultsCache` hardcodes "US" for cached popular-game buy URLs.
- **No state-from-IP:** only country is derived from IP; the *state* comes from the page/game context, not geolocation (a `context STATE` line is commented out).

---

## 9. Pages / templates / actions / properties involved (summary)

- **Ad rendering:** page JSPs listed in §1 (GPT `defineSlot` blocks + `<div id='div-gpt-ad-…'>` containers); common includes load GPT + AdSense.
- **Affiliate resolution:** `AffiliateDetails` + `AffliatePropertiesCache` (+ `ApplicationConstants`), fed by `src/config/Affiliate.properties` and admin editors `add/editAffliateProperties.jsp`.
- **Buy Tickets link generation:** `WelcomeAction`, `StateResultsAction`, `GameResultsAction`, `MyFavouriteGamesAction`, `CommonResultsCache`, `SendResultsEmailAction`.
- **Redirect:** `AffiliateAction` + `struts.xml` `buynow/*`, `emailbuynow/*`.
- **Geo:** `LoggingInterceptor`, `LuckUtils` (MaxMind).

---

## 10. Unknowns needing Bala confirmation

1. **Managed wrapper vendor** behind `lotterycornercom_*` (`placementName`/`slotId`) — Ampliffy? Snigel? Needs naming to reproduce those placements.
2. **Second Google pub** `pub-5258173596915552` — where used / relationship to GAM network `21828142944`.
3. **GAM slot sizes/targeting** are defined client-side here, but final fill/targeting live in the GAM console — confirm the authoritative slot list & any slots not present in code.
4. **Home page exact slot audit:** `index_upgrade_as.jsp` shows no inline slots; home ads appear to come via includes (`populargames*.jspf` mobile snippets + AdSense in common include + managed `lotterycornercom_*` on `populargames.jspf`). Confirm the full home slot inventory.
5. **Live affiliate map source:** static `Affiliate.properties` vs DB/admin (`AffliatePropertiesCache`) — which is authoritative in production, and full current mapping (properties file may be stale).
6. **Video (`LC_ATV_video_player`)** and **`wyoming_on_results_table`** — are these active in production and expected to continue?
7. Whether `promotionalbar_test` is a live promo-bar ad or a test slot.

---

## 11. Recommendations for preserving exact placements in new UI

- **Treat the GAM slot list in §3 as the fixed contract.** Recreate the **same named slots, sizes, size-mappings, and in-page order** per page type; do not rename/merge/drop. New content sections lay out **around** these slots (`13-...` §9).
- **Model ad slots as config**, keyed by page type + position (e.g. `AdSlotDefinition { pageType, slotPath, sizes, sizeMapping, position }`), so the new UI renders the exact `/21828142944/lc_sp_…` units. Include the **mobile 320×50 snippet slots** and the **top promo bar** slot.
- **Preserve `ads.txt` / `ads_google.txt`** verbatim (seller relationships) and the AdSense `ca-pub-6009276896057794` loader.
- **Buy Tickets = internal redirect, config/API-driven** (`13-...` §3a): render `/buynow/<urlCode>` (or an API-provided href); the backend keeps the `country × state × game → urlCode → partner URL` resolution, MaxMind geo, and all tracking params (`tl_affid=11132`, `ft=5`, `bta=35261`, `nci`, `IQid`) **unchanged**.
- **Keep per-state/per-game affiliate variation** (jackpot.com / theLotter / official EACDN) and US-vs-non-US geo switching — do not flatten to one partner.
- **Do not remove** the state-specific in-table (`wyoming_*`) or video slots without confirming they're retired.
- Carry these into the pending **URL/SEO inventory** and the future API contract (a Buy Tickets / affiliate URL resolver + an ad-slot config endpoint).
