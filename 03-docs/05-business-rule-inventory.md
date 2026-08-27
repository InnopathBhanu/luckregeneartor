# Business Rule Inventory — LotteryCorner (reference project)

Hidden/important business rules discovered in `00-reference-existing-project/LotteryCorner40`.
Read-only; reference not modified. No UI/API built. IDs resolved via
`04-sample-data/reference-tables/` (game.csv / state_info.csv / state_game.csv).
Cross-refs: `01-url-inventory.md`, `02-seo-geo-aeo-inventory.md`, `03-revenue-inventory.md`, `04-game-result-format-inventory.md`, `CLAUDE.md`.

> **Do not treat any rule below as obsolete just because it looks old** (per CLAUDE.md). Preserve existing
> behavior first; the future-API notes are for the rebuild, not a license to drop logic now.

---

## Format-variant selection is split across TWO code paths (context for many rules)
- **State page** (`StateResultsAction`, latest + date-specific): picks `special` variant per game by **result-array size** (huge if/else, lines ~200–370: `single/max/fire/wild/super/double/sum`).
- **Game & history page** (`GameResultsWeb.getResultsHTMLString`): picks variant by **gameId + draw-date cutoffs + size** (doc 04 §8).
- Both feed `ApplicationProperties.getResultFormat` → HTML template → `String.format`. **Two independent selectors for the same concept** → divergence risk. (Detail in `04-...`.)

---

## Rules

### R1 — Jackpot display & ordering
- **Where:** `CommonResultsCache` (`getJackPots("dueNext"|"jackpots"|"jackpotsLtoH")`, `getJackpotsMap`, jackpot graph viewers), `ResultsDBManager.getJackPots`; `game.isJackpot`, `game_result.JACKPOT_CASH_VALUE`, `game.HIGHEST_JACKPOT/_DATE`; jackpot change formatted via `formatePrizeString`.
- **Pages:** home, `/jackpots`, `/jackpotanalysis`, state/game cards, "Top Jackpots" sub-bar.
- **Games:** jackpot games only (`isJackpot=T`, e.g. Powerball 1012, Mega Millions 1013, state lottos).
- **Behavior:** jackpots sorted 3 ways (due-next, high→low, low→high); cash value + jackpot change shown; history charts cached.
- **UI impact:** Top Jackpots bar, jackpot cards, analysis charts. **Revenue-adjacent** (`03-...`).
- **Future:** API endpoints for jackpot lists (sortable) + jackpot history series; `isJackpot` flag in game config.
- **Risk if missed:** wrong/missing jackpots break the highest-value revenue surface.

### R2 — Next-draw display & timezone conversion
- **Where:** `StateResultsAction` ~378, `GameResultsAction` ~328, `CommonResultsCache`; `LuckyDateUtils.calculateGameDisplayNextDrawDateFromEST(+withtimezone)`; `tracker.getNextDrawTime()`.
- **Pages:** state, game, home cards.
- **Behavior:** next-draw stored in **EST**, converted to each **game's timezone** (`game.getTimeZone()`) for display; a timezone-labeled variant is also produced.
- **UI impact:** "Next draw" line on every result card; "also coming up" sub-bar.
- **Future:** API returns next-draw as **ISO 8601 with offset**; UI formats locally. Do not hardcode ET.
- **Risk:** wrong draw times mislead users; TZ bugs (cf. Arizona `GMT+5:30` mockup bug, `08-...`).

### R3 — Game-closed behavior
- **Where:** `StateResultsAction` ~383 & `GameResultsAction` ~332 → `if (game.isActive()) {...} else nextDrawtime = DisplayLiterals.GAME_CLOSED` (`"Game is closed"`). `Game.isActive()` = `status == "Active"`.
- **Pages:** state, game.
- **Games:** `game.csv` Status: **Active (142), Ignore (26), Closed (4)**. Non-active (incl. "Closed") → shows **"Game is closed"** instead of a next draw.
- **UI impact:** card shows "Game is closed" (no countdown/Buy Tickets relevance).
- **Future:** game `status` enum (Active/Closed/Ignore) in config; UI renders a closed state.
- **Risk:** showing a countdown/Buy Tickets for a dead game = bad UX + wasted affiliate clicks.

### R4 — Ignored games are skipped entirely
- **Where:** state loop `if (!game.isIgnore())` (`Game.isIgnore()` = `status == "Ignore"`).
- **Pages:** state page (and anywhere iterating a state's games).
- **Games:** 26 `Ignore` games (e.g. AZ Weekly Winnings 302, AZ 2by2 304 — Status "Ignore").
- **Behavior:** never rendered.
- **Future:** `status=Ignore` excludes from listing + sitemap.
- **Risk:** un-ignoring resurrects dead games; forgetting the flag shows games that shouldn't appear.

### R5 — Draw countdown ("Drawing now" / due-in timer)
- **Where:** `LiveResultsDataHolder` (`setDueInTime(new Timer(nextDrawTime - now))`), `CommonResultsCache` jackpot `dueInTime`.
- **Pages:** live results, home, cards ("Countdown: Drawing now" in mockups).
- **Behavior:** server computes ms-to-next-draw; when elapsed shows "Drawing now".
- **UI impact:** live countdown on cards/sub-bar.
- **Future:** API returns next-draw timestamp; **countdown computed client-side** (avoids stale server timer). Keep "Drawing now" state.
- **Risk:** stale/incorrect countdowns; server-time coupling.

### R6 — Awaiting / overdue result threshold
- **Where:** `ResultReaderJob` ~70: `if (now - nextDrawTime >= MAX_WAIT_HOURS_FOR_RESULTS h)` → alert/log (result overdue). Reader jobs poll the feed.
- **Pages:** indirectly all result surfaces (result appears once fed).
- **Behavior:** between draw time and result ingestion the card shows the **previous** result + next-draw/"Drawing now"; no explicit "awaiting result" UI found (confirm).
- **Future:** explicit "awaiting result" state in API/UI for the gap window.
- **Risk:** users see stale numbers just after a draw with no "pending" indicator. **Needs Bala confirmation** on desired UX.

### R7 — Date-specific results (same state action, date params)
- **Where:** `StateResultsAction` ~163: `if (selectedMonth==0 && selectedDay==0 && selectedYear==0)` → latest; else `ResultsDBManager.loadGameResultsOfGivenDateGo(gameId, date)` (note `selectedDay + 1` offset). JSON error path: "No results found for the specified date and game".
- **Pages:** state page (per Bala: **state page = default + date-param results**, `01-...` §5).
- **Behavior:** confirms Bala's clarification — one action serves latest and date-specific views.
- **Future:** API `results?date=` on the same resource, using **timezone-safe range logic (see D7)** — local range → EST query → local display. **Do not** replicate `selectedDay+1` (see D8).
- **Risk:** off-by-one / date-shift for non-EST games (esp. post-10 PM local). Treat `selectedDay+1` as a **test case**, not a rule.

### R8 — Prize string formatting (`LuckUtils.formatePrizeString`)
- **Where:** `LuckUtils.formatePrizeString(rawPrize, gameId)`.
- **Behavior:** numeric prize → `$X Million` / `$X Billion` (0 or 2 decimals, whole vs fractional); `<1M` → US currency, no decimals; negatives handled; non-numeric passed through as-is (e.g. "$1,000/day for life").
- **Pages:** everywhere a prize/jackpot shows.
- **Future:** replicate exactly (Million/Billion rounding + passthrough for non-numeric prizes); expose raw + formatted in API.
- **Risk:** inconsistent jackpot formatting across pages; mis-rounding headline jackpots.

### R9 — Draw-date display in game timezone
- **Where:** `GameResultsWeb` ~86 `LuckyDateUtils.calculateGamdDisplayDrawDateFromEST(drawTime, game)`; `game.getTimeZone()` display name.
- **Behavior:** draw dates stored EST → shown in the game's own timezone.
- **Future:** ISO timestamps + game TZ metadata; format client-side.
- **Risk:** date shown in wrong TZ (esp. AZ/HI no-DST, PR/VI).

### R10 — No-lottery states
- **Where:** `StateResultsAction` `statesNoLottery = [al, ak, nv, hi, ut]` → returns result-name → `state_{al,ak,hi,ut,nv}.jsp`.
- **Pages:** `/al /ak /nv /hi /ut` (`01-...` §3).
- **Behavior:** no results; shows FAQ + popular games + SEO meta only.
- **Future:** `state.hasLottery=false` config → dedicated template; keep URLs (SEO).
- **Risk:** breaking these = 5 indexed state URLs 404 / lose SEO.

### R11 — Default state & invalid-state handling
- **Where:** `StateResultsAction` ~101: `selectedState` empty → `"az"` (Arizona default); `stateDetails == null` → **404** (`ERROR_404`).
- **Pages:** state wildcard `/{state}`.
- **Behavior:** unknown single-segment slug that isn't a valid state → 404 (mitigates the broad-wildcard risk in `01-...` §15, but only when `StatesCache` returns null).
- **Future:** explicit state allowlist; keep 404 for unknown; decide if empty→AZ default is still wanted.
- **Risk:** removing the null-check reopens thin/soft-404 pages.

### R12 — Florida special template
- **Where:** struts `fl-new`/`fl` → `StateResultsAction` → `florida_newVersion.jsp` (vs default `lottery-result_upgrade_as_new.jsp`), `01-...` §3.
- **Pages:** `/fl`.
- **Games:** FL incl. Florida Lotto **337 = 6+6 Double Play**.
- **Behavior:** FL renders a different JSP (same ad slot set, doc 03).
- **Future:** template variant selectable per state via config (don't hardcode FL); preserve `/fl`.
- **Risk:** FL is a top revenue/traffic state — regressions costly.

### R13 — Powerball Double Play by state
- **Where:** `ApplicationConstants.pbDoublePlayStates = [CO,FL,IN,MD,MI,MO,NJ,PA,PR,SC,SD,TN,WA,DC]`; `StateResultsAction`: `gameId==1012 && pbDoublePlayStates.contains(stateCode) && <size>` → `special="single"`.
- **Pages:** state page (Powerball card) in those states.
- **Behavior:** Powerball rendering differs in Double-Play states based on result size.
- **Future:** model Double Play availability per state+game in config; `secondaryDraw` in result contract (`04-...`).
- **Risk:** wrong Powerball display in 14 jurisdictions.

### R14 — Per-game format-variant selection by result size (state page)
- **Where:** `StateResultsAction` ~200–370 (large if/else): dozens of gameId groups → `single/max/fire/wild/super/double/sum` based on `results.size()`. Examples: **509 IL Lotto** size>7→`max`; **600–603 USVI Pick 4** size 12/13→`single`; **337/401/517/526/432** (FL Lotto/…/MI Classic 47/NJ Pick 6/NC Cash 5) → `single`; **480–483/476–479 TX** → `fire`; many `wild`/`super`/`sum` groups.
- **Pages:** state page result cards.
- **Behavior:** which template variant renders depends on how many values the draw has.
- **Future:** replace with **date-effective `ResultFormatDefinition`** (`04-...` contract), not size-guessing.
- **Risk:** high — this is fragile, duplicated vs game-page logic, and easy to break for edge sizes.

### R15 — History / date-effective format changes
- **Where:** `GameResultsWeb` (doc 04 §8) — hardcoded date cutoffs (`04/28/2019`, `09/21/2022`, `02/27/2018`) + size/flags per game.
- **Pages:** history `/{state}/{game}/{year}` (~8,700 URLs), date-specific state view.
- **Behavior:** old draws render in their era's format (`.old`/`.fire`/`.sum`/etc.).
- **Future:** date-versioned format config (`EffectiveDateRange`).
- **Risk:** **highest** — breaking cutoffs mis-renders thousands of historical pages.

### R16 — Sticky notes & per-state notes
- **Where:** `StateResultsAction` `stickynoteList` (~450), `noteList = CommonResultsCache.getNoteInfoMap().get(state)`; `Note` entity.
- **Pages:** state page.
- **Behavior:** admin-authored notes/sticky notes shown per state (e.g. game-change announcements).
- **Future:** notes as content config per state; keep placement.
- **Risk:** losing operational notices (e.g. "game X ended").

### R17 — State news & blog on lottery pages
- **Where:** `newsList = StateNewsCache.getStateNewsMap().get(state)`; blog/news namespaces (`01-...` §8–9); `rss.xml`/`/feed`.
- **Pages:** state page (news section), `/news`, `/blog`.
- **Behavior:** state-specific news surfaced on the state page; blog/news are separate content systems.
- **Future:** news feed by state via API; keep post URLs (SEO).
- **Risk:** losing internal links + freshness signals.

### R18 — Smart picks / insider / predictions / lottery systems
- **Where:** `getsmartpicks`, `getsystempicks/.../{date}` (JSON), insider `systems/*` (Powerball Five/Lucky Hits/Wheeling, Magic8, drop-digit, etc.), `SimpleSmartPicks.properties`, `Powerball*Generator`, `.smart` format variant.
- **Pages:** `/jackpotanalysis`, insider/systems pages, smart-pick widgets, home "Predictions".
- **Games:** predominantly Powerball/Mega Millions + pick games.
- **Behavior:** login-gated tools (insider); generated picks; `.smart` render variant.
- **Future:** ties to planned **AI/logged-in tools** (`13-...`); gate behind login; keep public content crawlable.
- **Risk:** dropping insider tools loses a differentiator + logged-in engagement; **do not overclaim AI** (`13-...`).

### R19 — Cache & feed-refresh cadence (affects displayed data freshness)
- **Where:** `QuartzSchedulerListener` schedules jobs (interval-in-minutes from `Application.properties`): **Tinbu reader 15m, Tinbu validator 30m, master reader 15m, jackpot job 360m (+5–10m jitter)**; `ResultReaderJob`, `TinbuUSResultsReader/Validator`. Caches: `CommonResultsCache`, `GameResultsAccessManager`, `GamesCache`, `StatesCache`, `SEOMetaHeadingsCache`, `StateNewsCache`.
- **Pages:** all data-driven pages.
- **Behavior:** results/jackpots refreshed on job cadence; UI reads cached data. "Last updated" reflects `readTime`.
- **Future:** API caching + a real `lastUpdated` (`02-...` §14); push freshness to sitemap/IndexNow on update.
- **Risk:** stale results/jackpots; mismatch between visible "last updated" and actual data.

### R20 — SEO fallback, affiliate/geo, ads, holidays, config-driven rules (cross-refs + extras)
- **SEO fallback:** `seoMetaInfo` null → templated title/desc/H1 (`02-...` §1–4). Risk: generic metadata on new URLs.
- **Affiliate/geo:** `/buynow/<code>` → `AffiliateAction` 302; country via MaxMind → US-vs-non-US routing; per state×game partner (jackpot.com/theLotter/official EACDN); tracking `tl_affid=11132`, `ft=5`, `bta=35261` (`03-...`). Also `CommonResultsCache` hardcodes country **"US"** for cached popular-game buy URLs → cached buy links are US even for non-US visitors. **Confirm intended.**
- **Ads:** fixed GAM slots; the state-specific **`wyoming_on_results_table`** slot is an ad embedded in the WY results table (`03-...`). Risk: conditional per-state ad slots easy to drop.
- **Holidays / days-off:** `game.daysOff` (`game_daysoff` table) + admin `markholiday` → draws skipped on days off (affects next-draw calc). **Confirm still active.**
- **`playType.contains("Non")`** (`Game.java` ~387/422): games with "Non"(-draw) playtype excluded from certain listings/analysis. Preserve.
- **Config-driven rules:** `application_properties` table + admin (`addApplicationProperties`/`editApplicationProperties`), `StateGamePoperties.properties` (howtoplay/cutoff/playtype per state.game), `Affiliate.properties`, `ResultFormat_Upgrade.properties`, `SEOMeta` DB, `FAQsInformation`/`HowToClaimRecords`/`TaxInformationRecords`/`StateFactsRecords` (XML-backed content per state). Future: keep as config/API-driven content.

---

## Temporary-looking but production-impacting
- Home A/B result names `special`/`lazy`/`_lazy_testing` (`WelcomeAction`, `01-...`) — look like tests but are wired; don't expose at crawlable URLs.
- Silent fallback to default format on `String.format` exception (`04-...`) — masks data errors; logged only for draws <10 days old.
- `selectedDay + 1` date offset (R7) — **per D8, do not reproduce as a rule**; it's a legacy timezone date-shift symptom. Fix via D7 range logic; keep as a test case.
- `CommonResultsCache` hardcoded `"US"` for cached buy URLs (R20) — looks like a shortcut; confirm.

## Risks (top)
1. **R15 historical date cutoffs** + **R14 size-based variant selection** — fragile, duplicated across two code paths; breakage mis-renders results/history at scale.
2. **R3/R4 status handling** — mis-set Active/Closed/Ignore shows dead games or hides live ones.
3. **R13 pbDoublePlayStates** + **R12 FL template** — state-specific rendering for top games/states.
4. **R6 awaiting-result** gap — no explicit pending UI (confirm desired behavior).
5. **R20 cached "US" buy URLs / conditional ad slots / holidays** — easy to drop in a rebuild.

## Bala Decisions / Clarifications

Resolutions for the questions below (authoritative). These override earlier open questions where they conflict.

### D1 — Awaiting-result UX (resolves R6)
If draw time has passed but the latest result is **not yet available**, **keep showing the latest available result from the DB** — **do not hide the game card**. The countdown/ticker must switch to **"Awaiting latest results"** / **"Drawing completed, results pending"** and must **not** show a misleading countdown as if the draw hasn't happened. → Future API returns a draw/result **status** (e.g. `latest | awaiting | pending`) so the UI picks the right label.

### D2 — Buy Tickets geo / cached URLs (resolves R20 buy-URL item; ties to `01-...`, `03-...`, `13-...`)
UI must **not hardcode** Buy Tickets URLs. UI-first: use placeholder **internal `/buynow/<code>`** links. Future API resolves the destination from **geo/IP, state, game, affiliate availability, tracking, and existing routing logic**. The cached **US-only** behavior (`CommonResultsCache`) is to be **reviewed during API implementation**, not blindly carried forward.

### D3 — Holidays / days-off (resolves R20 holiday item)
**Preserve** holiday/`game_daysoff`/`markholiday` logic until confirmed obsolete. Future API returns **draw availability/status** so the UI can show correct **no-draw / holiday** messaging.

### D4 — Closed vs Ignore (resolves R3/R4)
- **Ignored games:** not shown in the state page game/result list, **but direct game URLs may still be reachable** (bookmark, search, old link). **Do not auto-delete, redirect, or noindex ignored game URLs without Bala approval.**
- **Closed games:** may **remain visible/indexed** if they have historical results or SEO value. UI must **clearly indicate closed status** where applicable.

### D5 — Insider / predictions / systems tools (resolves R18)
Carry forward **Lottery Systems, Smart Pick, Search Numbers, History, Download, Insider, and Prediction** entry points as existing **SEO/revenue/product assets**. Phase 1: **preserve visible entry points**; plan them as future **logged-in / AI-enabled** tools. **Do not redesign or remove them yet.**

### D6 — Date/time storage & timezone conversion (reinforces R2/R9)
Draw dates/times are stored in **EST** in the DB. On display, each draw/result time is **converted back to the game/state local timezone**. The existing timezone-conversion logic (`LuckyDateUtils.*FromEST`) must be **discovered, preserved, and tested** — not reinvented.

### D7 — Date-specific & year-history query behavior (corrects R7; critical for non-EST games)
For date-specific pages and year-history URLs (`/{state}/{game}/{year}`), the date range must be **computed in the game/state local timezone first**, then converted to EST for the query:
1. Determine `fromDate`/`toDate` in the **game/state local timezone**.
2. Convert that local range → **EST** for the DB query.
3. Query the DB using the **EST range**.
4. Convert each result's stored **EST draw time back to game-local** for display.
This is critical for **PST/MST** (and other non-EST) games, **especially draws after 10 PM local** — those can shift to the **next calendar date in EST**, but the UI/URL/year/history must still show the correct **game-local** draw date.

### D8 — `selectedDay + 1` correction (corrects R7)
**Do not** reproduce `selectedDay + 1` as a real rule. Treat it as a **legacy workaround / symptom of timezone date-shift**. The real rule is **D7** (local range → EST query → local display). Document `selectedDay + 1` as a **risk/test case**, not behavior to copy blindly.

**Future API — timezone-safe result metadata** (per D6–D8): expose
`storedDrawDateTime`, `storedTimezone` (likely `EST`/`America/New_York`), `gameLocalDrawDateTime`, `gameLocalTimezone`, `gameLocalDate`, `queryLocalDateRange`, `queryStoredDateRange`, and `resultDateLabel` (for UI/history grouping).

**Testing requirements** (D6–D8): add cases for
- PST/MST games with draw times **after 10 PM local**,
- year-history URLs `/{state}/{game}/{year}`,
- date-specific state results,
- result grouping by **local draw date**,
- **EST boundary crossing around midnight**.

## Questions for Bala
_All prior open questions are resolved above (see Bala Decisions D1–D8). Remaining items for future phases:_
1. **Cached "US" buy URLs (D2):** exact geo behavior to confirm **during API implementation**.
2. **Holidays/days-off (D3):** confirm when/if the logic can be declared obsolete.
3. **AI/logged-in roadmap (D5):** priority order for converting preserved insider/prediction entry points into AI tools (`13-...`).

## Next suggested step
Discovery docs (00–05, 08–13) are now complete. Recommend the **New UI Readiness Summary** (`03-docs/06-new-ui-readiness-summary.md`) consolidating templates/components/config + the sample-data JSON schema (built from `game`/`state`/`bonus_numbers_info` + these rules), then begin `01-new-ui` with dummy data once Bala approves.
