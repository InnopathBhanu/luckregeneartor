# Florida Pick 3 State-Native Game Page — Implementation Record

**Task:** LRG-GAME-050 · **Baseline:** `b57b72e` · **Primary route:** `/fl/pick-3` · **Guard:**
`LC_GAME_PREVIEW=true` (inert by default) · **Blueprint:** BP-04B `JG-M2` · No production route, canonical,
redirect, sitemap or ad change.

> ## Post-commit accuracy review — LRG-GAME-054, 2026-08-07
>
> This record covers four tasks (LRG-GAME-050, 051, 052, 053), each of which wrote *"Not committed"* because none
> of them was. **All four are now committed.** The code landed in **`f8e3061`** *("added history and game pages")*;
> this record and its founder-review companion were left untracked at that time and are committed by the
> documentation-only checkpoint that carries this review.
>
> Every claim below was re-verified against the committed code and the running application. **Six documentary
> inaccuracies were found and corrected in place**, each marked `**CORRECTED 2026-08-07**` where it appears:
>
> | # | Claim as written | What is actually true |
> |---|---|---|
> | 1 | *"Not committed"* (×4) | Committed in `f8e3061` |
> | 2 | *"1-OFF appears nowhere in public content"* (§2) | It appears **4 times** on `/fl/pick-3` — in the LRG-GAME-051 news article **about its retirement**. Never as a sellable play type |
> | 3 | Blog route `…/blog/why-midday-and-evening-need-separate-dates` (R1) | The configured slug is `midday-and-evening-are-two-different-games`. The documented URL **404s** |
> | 4 | Route param `[section]` (R1, R1 validation) | It is **`[segment]`**. The collision reasoning in R1 was also incomplete — see the correction there |
> | 5 | Per-task test counts 608 / 640 / 664 | Accurate **as of each task**. The suite now stands at **892**, all passing |
> | 6 | Founder-review companion covers LRG-GAME-050–051 only | It does not describe LRG-GAME-052 or 053; noted there rather than back-filled |
>
> **No Game Page code was changed by this review.** Two live defects were found and are reported for a separate
> task rather than fixed here — see *Post-commit findings* at the end of this record.
>
> The route landscape has also moved since these tasks: **`/fl/pick-3/2026` now exists** as a guarded Yearly
> History Page (LRG-ARCHIVE-054…060, commit `2020760`). §7 and §11 below were written when it did not. The
> family-archive recommendation they carry is now partly built, still guarded, and still awaiting the URL audit.

Executes `03-docs/09-claude-execution-briefs/game-page/briefs/2026-08-04-game-page-brief-state-native-family-content-and-design.md`
under founder decisions 1–8 of 2026-08-04.

---

## 1. Source inventory

| Source | Status | Used for |
|---|---|---|
| `05-…game-page-blueprint-index-FINAL-APPROVED.md` v1.1 | Final approved, frozen | `/fl/pick-3` is `JG-M2`; `/fl/powerball` stays `JG-M1` |
| `05B-…jurisdiction-game-page-blueprint-FINAL-APPROVED.md` v1.1 | Final approved, frozen | **Governing document.** §18 order, §19 variant contract, §20 deterministic check, §21 insights, §22 neutral language, §28 manifest, §34 retirement |
| `05C-…tools-and-ai-insights-blueprint-FINAL-APPROVED.md` v1.1 | Final approved, frozen | Tool access patterns; `/tools` is unbuilt so nothing routes there |
| `florida-powerball-game-page-v0-implementation.md` + `-founder-review.md` | Prior record | Shared primitives and the guard pattern. **Not** the visual blueprint for this page |
| **Florida rule `53ER24-56`** (PICK 3 game rules PDF) | **Primary official, read 2026-08-04** | Every play type, prize, odds figure, wager, FIREBALL table and Advance Play statement |
| **Pick 3 fact sheet** (Florida Lottery PDF) | **Primary official, read 2026-08-04** | The dated era boundary: FIREBALL introduced and 1-OFF ended 2021-01-18 |
| Florida Lottery Pick 3 game page | Primary official, read 2026-08-04 | Draw times, 11-minute cutoffs, minimum age |
| `src/struts.xml`, `Game.getGameNameForURL()`, `WebContent/sitemap.xml` | Legacy, read-only | Route evidence (§7) |
| `config/states/fl.json` `presentation.families` | Governed config | Pick 3 / Cash Pop / JTP member composition — **reused, not restated** |
| `floridaDrawEvents.ts`, `floridaFormatRegistry.ts`, `floridaContentManifest.ts`, `stateCommerceRegistry.ts` | Governed contracts | Results, formats, claim facts, commerce resolution |

---

## 2. What the research overturned

Founder decisions 5 and 6 required primary-source verification before publication. Three repository beliefs
were wrong, all from the same production export (`game.csv`):

| Field | Production export | Operator (53ER24-56) | Effect |
|---|---|---|---|
| Ticket price | `1$` | **$.50 or $1.00 per play** | The export omits the 50-cent play — which is **half of every prize in the matrix** |
| Advance Play | `upto 14 consecutive draws` | **Fourteen-DAY period** (or non-consecutive within seven days) | With `BOTH` selected that is up to 28 drawings, not 14 |
| Payout matrix | Contains **1-OFF**, contains **no FIREBALL** | 1-OFF appears **zero times**; FIREBALL is in force | The export is a **closed pre-2021 era**, not an approximation of the current one |

The fact sheet dates it exactly: *"January 18, 2021 The FIREBALL add-on feature for all PICK Daily Games was
introduced, and the 1-OFF play style ended."*

So the export is retained as `PICK3_PRE_FIREBALL_ERA`, marked `retiredEra` / `retired: true`, so a 2019 ticket
still resolves against 2019 rules (BP-04B §34) while `eraPublishableAsCurrent` refuses it.

**CORRECTED 2026-08-07.** This section read *"**1-OFF appears nowhere in public content**, verified by test and by
a rendered-HTML scan."* That was true when written at LRG-GAME-050 and is **false now**: `1-OFF` appears **four
times** in the rendered `/fl/pick-3` HTML. All four belong to the news article LRG-GAME-051 added — *"Rule change:
FIREBALL replaced the 1-OFF play style across the PICK daily games"* — in its card title and summary, and again
inside the RSC payload for the same strings.

The claim the page actually upholds, and the one that matters, is narrower and still exact: **1-OFF appears nowhere
as a currently sellable play type.** It is in no payout row, no play-type list, no wager option and no checker
selection, because `eraPublishableAsCurrent` refuses the retired era. Where it does appear, it appears as history —
an article explaining that the play style ended on 2021-01-18 — which is the honest treatment of a retired product,
not a leak of one.

All four conflicts are recorded in `RULE_CONFLICTS` and in `03-docs/08-decisions/source-conflicts.md`
Conflicts 19–21.

---

## 3. The verified current matrix

Published in full, from rule `53ER24-56` §2–§4. Every figure is asserted in `tests/game-page-m2.test.ts`.

| Play type | Example | 50¢ | $1.00 | Odds |
|---|---|---|---|---|
| Straight | 1-2-3 | $250.00 | $500.00 | 1 in 1,000 |
| Box (3-way) | 1-1-2 | $80.00 | $160.00 | 1 in 333.33 |
| Box (6-way) | 1-2-3 | $40.00 | $80.00 | 1 in 166.67 |
| Straight/Box (3-way) | 1-1-2 | not sold | $330.00 exact / $80.00 any order | 1 in 1,000 and 1 in 333.33 |
| Straight/Box (6-way) | 1-2-3 | not sold | $290.00 exact / $40.00 any order | 1 in 1,000 and 1 in 166.67 |
| Combo (3-way) | 1-2-2 | $250.00 (ticket $1.50) | $500.00 (ticket $3.00) | 1 in 333.33 |
| Combo (6-way) | 1-2-3 | $250.00 (ticket $3.00) | $500.00 (ticket $6.00) | 1 in 166.67 |
| Front Pair | 1-2-x | $25.00 | $50.00 | 1 in 100 |
| Back Pair | x-2-3 | $25.00 | $50.00 | 1 in 100 |

FIREBALL (in force since 2021-01-18, doubles the ticket price): Straight $100/$200 at 1 in 333; 3-way $34/$68
at 1 in 111; 6-way $17/$34 at 1 in 56; Straight/Box 3-way $134 & $34; 6-way $117 & $17; pairs $10/$20; combos
$100/$200. The operator's published **maximum win counts** per play type are carried rather than inferred.

---

## 4. Reuse decisions (§6 vocabulary)

**KEEP — used unmodified:** `StateBallGroup`, `StateAiSurface`, `StateBuyNowInline`, `StateShareResult`,
`StateExplainAction`, `StateDiscussLink`, `buildStateFamilies`, `resolveFamily`, `gate`/`publicationGate`,
`stateViewConfigFor`, `drawEventsFor`, `formatVersionsFor`, `commerceResolutionFor`, `gamePreviewGuard`,
`gameAdProfile`, `gamePageSchema`.

**KEEP AS REFERENCE:** the `JG-M1` composition in `GamePreview.tsx`. Not extended, not restyled.

**REFACTOR — additive, JG-M1 output unchanged:** `gamePreviewModel.ts` (mode dispatch + `JG_M2_ORDER` +
optional `m2` branch), `gameViewConfig.ts` (optional JG-M2 fields + validation), `gameRegistry.ts`,
`gameConfigRegistry.ts`, `GamePreview.tsx` (one dispatch line + the landmark fix).

**NEW:** `gameRuleContract.ts`, `floridaGameRules.ts`, `digitTicketCheck.ts`, `digitSetGenerator.ts`,
`digitHistoryAnalysis.ts`, `gameReviewFixture.ts`, `gameM2Model.ts`, `GameM2Bands.tsx`, five tool components,
three configuration files, `tests/game-page-m2.test.ts`, namespaced `lcg-` CSS.

**Deliberately NOT created:** a competing family registry. Member composition is read from
`config/states/fl.json`, so Midday and Evening cannot drift between the State page and this one — enforced by a
test that fails if a game configuration declares `members`.

---

## 5. The eighteen sections

`/fl/pick-3` renders **all eighteen in server HTML**, grouped into the brief's nine bands. Heading outline is
`h1` → band `h2` → section `h3` → detail `h4`, one `<h1>`, one `<main>`.

| § | Content | Data source |
|---|---|---|
| JG-01 | One identity, one mark; Midday then Evening rows, each with its own game id, date, time, digits, FIREBALL, status and next draw; **the one compact source line**; four actions with one primary | Draw events 332/333 |
| JG-02 | Play explanation, next draw per member, operator-verified ticket price and Advance Play, the existing inline Buy Now resolver (Florida `underReview` → retail guidance, no Buy button) | Rule era + commerce registry |
| JG-03 | Rule-era-aware checker: drawing, date, three digits, play type, wager, FIREBALL. Play types narrow to what the digits can legally be played as | `digitTicketCheck` |
| JG-04 | Five contextual prompts + the shared AI surface | Config + `StateAiSurface` |
| JG-05 | Per-member status, next drawing and reminder route | Schedules |
| JG-06 | Nine play types in plain language, FIREBALL mechanic, **the complete verified prize and odds matrix** plus the FIREBALL matrix, three guide titles | Rule era |
| JG-07 | 121-row history, newest first, paginated, each row tagged with its provenance | Review fixture (2 real + 119 sample) |
| JG-08 | Search by digit-and-position, front/back pair, or exact result — each answer states its window | `digitHistoryAnalysis` |
| JG-09 | Position frequency ×3, repeated-digit shape, sum bands, front/back pair frequency, adjacent values, per-member repeats, historical gaps, Midday-vs-Evening comparison; table and chart views | `digitHistoryAnalysis` |
| JG-10 | CSPRNG generator with rejection sampling; per-set ordering count and eligible play types | `digitSetGenerator` |
| JG-11 | Five method modules, each stating what it does **not** guarantee (required by the config contract) | Config |
| JG-12 | Operator, minimum age, ticket price, Advance Play, play amounts, FIREBALL availability, per-member schedule and cutoff — each tagged with its source | Rule era + manifest |
| JG-13 | Verified claim deadline and four claim routes, official claim destination. Tax and winner publicity **absent**, not warned about | Manifest |
| JG-14 | Five deterministic insights, each exposing window, method and a link to its supporting figures | `digitHistoryAnalysis` |
| JG-15 | Four-tab IA (News/Guides/Blogs/Winners), nine planned items with no date, author or destination; **Winners is an honest empty state** | Config `editorial` |
| JG-16 | Three labelled discussion starters, no author/replies/views/likes | Config |
| JG-17 | Real device-local save (localStorage, reversible), plus account-dependent options that answer a click with a sign-in request | `GameSaveControls` |
| JG-18 | Complete trust area: methodology topics, rule citations with rule number and read date, official resources, corrections policy, affiliate disclosure, independence line | Model + manifest |

`AD-JG00`–`AD-JG03` keep their governed positions in `JG_M2_ORDER` and resolve to nothing: no Game Page slot is
captured from the legacy JSPs and no profile is approved, so no geometry is reserved.

---

## 6. Trust policy (founder direction)

Measured in the rendered HTML:

- `official site` / `official website` / `verify with` / `check the official`: **0 occurrences**.
- Compact source line: **exactly one** in JG-01 (`data-source-line="true"`), repeated once inside the JG-18
  trust block where the complete explanation lives.
- Internal-preview identification: **one banner**, carrying the review-date basis. No per-row sample label, no
  per-section staleness notice (`lcg-stale`: 0 occurrences).
- Ticket-validation boundary: **once**, after checker output, per brief §7 JG-03.
- Operator links: 7, all in JG-13 (claim) and JG-18 (rules, winning numbers, responsible play, claim).

A test asserts the composition file contains none of the three forbidden warning phrasings.

---

## 7. Route evidence and classification

The legacy slug rule was **proven, not assumed**: `Game.getGameNameForURL()` takes `game.NAME`, strips `/`,
replaces spaces with hyphens and lowercases; `struts.xml` maps `*/*` → `page=game` and `*/*/*` →
`page=gameHistory`. Cross-checked against the production sitemap (9,246 URLs, all `https://www.lotterycorner.com`,
no trailing slash).

| Route | Exists in production? | Classification |
|---|---|---|
| `/fl/pick-3` | **No** | **Introduce** — guarded, `noindex`, no sitemap entry |
| `/fl/cash-pop` | **No** | **Introduce** — guarded |
| `/fl/jackpot-triple-play` | **Yes** (5 archive years) | **Preserve** — unmodified |
| `/fl/pick-3-midday` (332) | Yes, 16 archive years | Preserve; consolidation candidate, **not implemented** |
| `/fl/pick-3-evening` (333) | Yes, 36 archive years | Preserve; consolidation candidate, **not implemented** |
| `/fl/cash-pop-{morning,matinee,afternoon,evening,late-night}` | Yes, 2 archive years each | Preserve; candidates, not implemented |
| `/fl/lotto` (337) | Yes, 25 archive years | Existing route (founder decision 3) |
| `/fl/fantasy-5` (336) | Yes, 23 archive years — serves the **Evening game alone** | Existing indexed route to be **expanded** into a family page (founder decision 3) |
| `/fl/florida-lotto` | **No** | Removed from the redirect proposal (founder decision 3) |

**No redirect, canonical or sitemap change was implemented.** Per founder decision 4, all variant-year archive
URLs are preserved untouched, and the recommendation for a single family archive is recorded in §11.

---

## 8. Guarded review data

Per brief §13 and founder decision 1:

- **Fixed review date `2026-07-09`**, derived from the captured feed's newest Florida draw date — not the clock.
  A twice-daily game read against the real clock would show a 26-day-old row as "Latest" and a past date as
  "Next drawing". A guard rejects any next-draw date that is not in the future relative to the review date.
- **Real data wins:** the newest row for every member is the production feed's own record
  (`provenance: "productionFeed"`). Pick 3 history is **2 real + 119 sample**; a test asserts no sample row is
  ever dated on or after a real one.
- **Typed at the data layer**, so a component cannot render a sample row without knowing it is one.
- **Cannot leak:** `buildReviewHistory` returns `[]` unless `previewEnabled`, in addition to the route 404.
- **Deterministic** (seeded LCG), so two builds are byte-identical. The player-facing generator uses a CSPRNG
  instead — the asymmetry is deliberate.
- **No fabricated winner, community activity, publication date, author, destination, claim, tax or legal fact.**

---

## 9. Defects found and fixed during this task

1. **Two `<main>` landmarks.** The layout wraps `children` in `<main>` in its non-home-preview branch, so the
   Game Page's own `<main>` became a nested second landmark (WCAG 2.2 1.3.1/4.1.2). **Pre-existing at
   `b57b72e`** — `/fl/powerball` had the same nesting in the same flag combination; the JG-M1 record recorded
   the opposite because it was measured with the home preview on. The element is now conditional. Both pages
   now render exactly one `<main>`.
2. **Checker rendered with no play types.** Cash Pop has a publishable era and zero priced payout rows, so the
   checker drew an empty dropdown above a live submit button — a control that looks functional and is not
   (`FD-S-08`, `CLAUDE.md` §9). JG-03 now renders its heading and explanation, and the tool only when a
   comparison can be priced.
3. **Fixture produced impossible ball draws.** `repeatsAllowed` was ignored, so a 6-of-46 sample row could
   repeat a number. Caught by the generalization proof.
4. **`drawInsights` hardcoded a maximum of 9**, mis-banding every ball game. Now takes the era's range.
5. **Two per-game branches in generic code**: `ruleGameKey === "pick-3"` selected the editorial inventory, and
   `hasMovingTopPrize` held a hardcoded slug list. The inventory moved to configuration; the prize question is
   now derived from the governed format's prize kind. A top-prize alert is consequently offered for Jackpot
   Triple Play and correctly withheld from Pick 3 (fixed prize) and Cash Pop (stake-dependent).
6. **The checker hardcoded "FIREBALL"** in its outcome sentences. Now reads the add-on's own label.
7. **Straight/Box rows were 250 px tall at 390 px**, from a run-on prize sentence and an off-screen wrapping
   odds cell. Now two labelled lines in a 680 px scroller; rows are 41–89 px.
8. **Breadcrumb misaligned by 279 px at 1440 px.** Scoped to JG-M2 so `/fl/powerball` stays byte-identical;
   reported as inherited for JG-M1.
9. **Provenance quotes shipped to the client.** Several kilobytes of verbatim rule text — including the passage
   naming 1-OFF — were serialized into the RSC payload for no reader benefit. Stripped; JG-18 cites
   title, rule number, URL and read date.

---

## 10. Validation performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx next lint` | No warnings or errors |
| `npm run build` | Exit 0, 22 static pages, `/[state]/[game]` 16.6 kB |
| `npm test` | **608 tests, 608 pass, 0 fail** (83 new in `game-page-m2.test.ts`) |
| Sections in server HTML | `/fl/pick-3` = **18/18** |
| Guard OFF | all four game routes **404**; zero `lcg-`, `JG-`, or Pick 3 copy in the response |
| Guard on vs off | `/`, `/fl`, `/mi`, `/va`, `/ca`, `/md`, `/ut` **byte-identical** |
| `/fl/powerball` guard on | order, six visible sections, `JG-M1` mode, 0 JG markers, 0 bands, 1 `<main>` — matches the V0 record |
| 390 px | 0 horizontal overflow; both drawings in the first viewport; 18 sections; 9 bands |
| 1440 px | 0 horizontal overflow; 3-column stat grid; 0 stat-card overlaps; breadcrumb aligned |
| 375 px | 0 horizontal overflow |
| Checker, live | Straight $500 / 1 in 1,000; 6-way Box 50¢ $40 / 1 in 166.67; Front Pair $50 / 1 in 100; FIREBALL-only win $200; no-match correct |
| Filters, live | 121 → 60 (Evening) → 8 (Evening from 2026-07-01); position counts and variant comparison update |
| Forbidden language in HTML | `1-OFF` 0 · `increase chances` 0 · `hot number` 0 · `due to hit` 0 · `overdue` 0 · `most likely next` 0 · `guaranteed` 0 |

---

## 11. Known limitations

1. **No result history exists.** JG-07/08/09/14 run on the guarded review fixture. 119 of 121 Pick 3 rows are
   internal samples, so every statistic on the page describes sample data.
2. **No editorial, community, account or alert service.** JG-15 shows planned coverage with no dates; JG-16
   shows platform-authored starters only; JG-17's account options answer with a sign-in request.
3. **No AI service.** JG-04 renders the shared surface and fabricates no answer.
4. **Jackpot Triple Play and Cash Pop have no verified prize matrix**, so JG-06 suppresses the table and JG-03
   omits the tool. Deliberate under founder decision 6, and part of the degradation proof.
5. **JG-15 suppresses on Cash Pop and Jackpot Triple Play** (17 of 18 sections) because no editorial inventory
   is configured for them. Only `/fl/pick-3` is required to show all eighteen.
6. **No Game Page advertising.** No slot is captured from `lc_mgp_*` / `lc_bp_*` / `lc_bdp_*` / `lc_jp_*` /
   `lc_gh_*`; the four anchors resolve to nothing.
7. **1440 px screenshots are partial.** The browser pane rendered blank at that width; desktop layout was
   verified by measurement (overflow, grid columns, overlap, alignment) plus one hero capture.
8. **The public Pick 3 web page and rule `53ER24-56` disagree on the Advance Play horizon** (a six-month
   summary reading versus the rule's fourteen-day period). The promulgated rule was used; recorded as Conflict
   22 for re-verification before production.
9. **`/fl/pick-3` and `/fl/cash-pop` are introduced routes.** Guarded, `noindex`, absent from every sitemap.

---

## 12. Files changed

**New — library:** `lib/game/gameRuleContract.ts`, `floridaGameRules.ts`, `digitTicketCheck.ts`,
`digitSetGenerator.ts`, `digitHistoryAnalysis.ts`, `gameReviewFixture.ts`, `gameM2Model.ts`.

**New — components:** `components/game/preview/sections/GameM2Bands.tsx`;
`components/game/preview/tools/{GameChecker,GameGenerator,GameWorkspace,GameSaveControls,GameContentTabs}.tsx`.

**New — configuration:** `config/games/fl-pick-3.json`, `fl-cash-pop.json`, `fl-jackpot-triple-play.json`.

**New — tests and docs:** `tests/game-page-m2.test.ts`; this record;
`florida-pick-3-game-page-founder-review.md`.

**Modified:** `lib/game/{gameRegistry,gameConfigRegistry,gameViewConfig,gamePreviewModel}.ts`,
`components/game/preview/GamePreview.tsx`, `app/[state]/[game]/page.tsx`, `app/globals.css` (`lcg-`
namespaced additions only), `tests/game-page.test.ts` (two assertions this task deliberately changes),
`03-docs/08-decisions/source-conflicts.md`.

**Not touched:** any middleware or redirect file, `/powerball`, `/tools`, Home, State and Global Footer
visuals, `lib/state/**` behaviour (read-only reuse), `02-new-api`, the legacy tree.

---

## 13. Next task recommendation

**Connect a real Pick 3 results archive and retire the review fixture for JG-07/08/09/14.** It is the single
dependency behind five of the six known limitations, it is the only thing standing between this page and a
publishable state, and it unblocks the family-archive route decision in the founder review.

---

# REVISION — LRG-GAME-051 (2026-08-04)

Focused revision of the record above, executing the six required changes in the 2026-08-04 revision direction.
No redesign of Home, State, Global Footer, Powerball or any global multi-state page. No redirects.
*(**CORRECTED 2026-08-07** — read "Not committed"; committed in `f8e3061`.)*

## R1. Editorial and SEO hierarchy

**The tab interface is gone.** `GameContentTabs.tsx` is deleted. JG-15 now renders **three separate visible
sections** — Pick 3 guides, Pick 3 news and rule updates, Pick 3 analysis — each with its own heading, `<section>`
and `data-editorial-kind`.

**The articles are real, and so are their links.** Eight articles now exist with full bodies, at their own routes:

| Route | Kind | Date shown |
|---|---|---|
| `/fl/pick-3/guides/straight-box-and-combo-explained` | Guides | Facts checked 2026-08-04 |
| `/fl/pick-3/guides/how-repeated-digits-change-box-combinations` | Guides | Facts checked 2026-08-04 |
| `/fl/pick-3/guides/how-fireball-works-on-a-pick-3-ticket` | Guides | Facts checked 2026-08-04 |
| `/fl/pick-3/news/fireball-replaces-1-off` | News | Effective 2021-01-18 |
| `/fl/pick-3/news/evening-draw-time-moved-to-9-45-pm` | News | Effective 2018-08-05 |
| `/fl/pick-3/news/cash-3-renamed-pick-3` | News | Effective 2016-08-01 |
| `/fl/pick-3/blog/reading-digit-frequency-without-forecasting` | Blogs | Facts checked 2026-08-04 |
| `/fl/pick-3/blog/midday-and-evening-are-two-different-games` | Blogs | Facts checked 2026-08-04 | *(**CORRECTED 2026-08-07** — this row read `why-midday-and-evening-need-separate-dates`, a slug that does not exist and whose URL 404s. The configured slug is the one now shown; the article itself is unchanged and resolves 200.)*

New route: `app/[state]/[game]/[segment]/[slug]/page.tsx`. Same guard as its parent, `noindex`, absent from every
sitemap. An undeclared `(segment, slug)` **404s** rather than rendering an empty shell.

**CORRECTED 2026-08-07.** Two errors were in this paragraph. The directory is **`[segment]`**, not `[section]`; and
the stated reason it cannot collide with the archive pattern — *"two segments below the game… one segment below"* —
was the wrong reason, which mattered later. Depth is not what Next.js objects to: it rejects **two different slug
names at the same depth**. When LRG-ARCHIVE-054 added the yearly archive as `[year]` beside this route's
`[section]`, the app failed **at request time, not at build time**, so a build-only check passed and the 500s were
initially misread as a corrupted `.next`. Both were unified under one `[segment]` parameter, which discriminates on
the value rather than the parameter name. The URL shape documented in the table above is unchanged.

**No invented dates or bylines.** The validator rejects `publishedDate`, `author`, `byline` and `href` on any
article. What it accepts instead is honest and specific: `effectiveDate` (the date the *operator's* change took
effect, which must cite a source) or `reviewedDate` (the date a guide's facts were last checked). LotteryCorner
has not published these on a date, so no publication date is stated anywhere.

**Winners is absent entirely**, not empty. The validator rejects `"Winners"` as a kind: a winner story needs a
sourced article about a real person, and none exists.

**"Not yet published" is gone from the page** — 0 occurrences. Two other lists carried it and were fixed at the
same time: JG-06's guide list now links the three real guides, and JG-18's four methodology topics carry one
shared note instead of four repetitions.

## R2. The number-history search

The digit-in-position search is removed — that question is a statistic, and JG-09's positional frequency table
already answers it. JG-08 is now **Search a Pick 3 number in past draws**:

| Control | Values |
|---|---|
| Number | One three-digit field, **leading zeros preserved** |
| Look back | Last 10 / 25 / 50 / 100 draws |
| Draw type | Midday · Evening · Both |
| Match type | Exact order · Any order |
| FIREBALL | Offered only where the era has an active drawn add-on |

Results show total matching draws, date, drawing, drawn number, whether it matched in exact or any order, and —
only when requested and valid — which position the FIREBALL number replaced and the combination it created.

**The leading-zero fix is structural.** The field is `type="text"` with `inputMode="numeric"`, not
`type="number"`: a number input normalises `007` and `Number("007")` is `7`, so the old shape could not express
the search. `parseTypedNumber` reads the string per position and **rejects** a partial number rather than
searching for whatever parsed.

**The window applies after the draw-type filter**, so "last 25 Evening drawings" is 25 Evening drawings — not the
Evening rows that happen to fall inside the last 25 of everything, which for a twice-daily game is about twelve.

It is kept distinct from JG-03: JG-08 searches many drawings and prices nothing; JG-03 compares one ticket
against one drawing and reads the payout table. Each links to the other.

## R3. Page length

| Measure | Before | After |
|---|---|---|
| Page height at 390 px | 23,207 px | **19,197 px** |
| Page height at 1440 px | 15,145 px | **12,871 px** |

Achieved while **adding** three editorial sections and eight articles.

- History shows **10 rows**, then `Show full history (121 drawings)` reveals the paginated table.
- Statistics show a **four-figure preview** (drawings loaded · contained a repeated digit · most common total
  band · average total by drawing); positional frequency, sums, pairs, adjacency, gaps and the variant
  comparison moved behind `Show detailed statistics` (`aria-expanded`, `aria-controls`).
- JG-14's five insight cards became **one "what changed" summary** — same deterministic findings, one window
  statement, a few lines instead of five bordered boxes.
- JG-16's starters are compact rows rather than tall cards.

## R4. Membership

**All device-local save behaviour and language is removed.** No `localStorage` access, no `KEY` constant, no "on
this device" copy anywhere. The previous device-local toggle worked and was honestly labelled, but it was the
wrong product: a member's saved games must follow them across devices, so two things called Save — one of which
silently does not travel — is worse than one that asks you to sign in.

Every JG-17 option is account-backed. Activating one while signed out opens a sign-in prompt that names the
chosen action and captures the intent (`{ action, label, returnTo }`) so it can be resumed after authentication.

**Missing dependency, stated plainly.** There is no authentication service and no member store in this
repository. So `authAvailable` is false, **no login or register link is rendered** (`FD-S-30` forbids inventing a
destination, and a Log in button that 404s is worse than a sentence), and the panel says that member accounts are
not connected, nothing was turned on and nothing was saved. The signed-in success path exists as a seam guarded
by `signedIn && o.available` — both false here — so it is unreachable rather than faked. No action reports
success anywhere.

## R5. Game identity and logo

**An authentic Florida Pick 3 asset was found, verified and used.**

`00-reference-existing-project/.../img/logos/florida/florida-pick3.webp` (140×77) → `/game-logos/fl-pick-3.webp`.
Visual inspection of the byte-identical `.png` sibling shows the wordmark **"PICK 3" with a "PLUS FIREBALL"
lockup** over the Florida Lottery starburst.

Three signals corroborate that it is current and correctly attributed:

1. It sits in a per-**state** logo library (`img/logos/florida/`), not the multi-state share-card folder.
2. The FIREBALL lockup dates the artwork to the current rule era — FIREBALL launched 2021-01-18.
3. Its sibling `florida-cash3.png` reads "CA$H 3", the pre-2016 name this asset supersedes, so the library tracks
   the rename rather than confusing it.

**A near-miss worth recording.** A filename search for "pick3" finds `img/social/pick3.webp` first, and visual
inspection shows that file is **Maine's** Pick 3 logo. `img/social/` is the Open Graph share-card folder, keyed by
state name in `lottery-result_upgrade_as.jsp`. Using it would have repeated the LRG-UI-010 mis-mapping that
LRG-UI-011 had to undo.

**The registry key is therefore state-scoped** (`fl-pick-3`, not `pick-3`): the legacy library holds a different
Pick 3 mark for roughly thirty jurisdictions, and a bare game slug would put Florida's logo on Virginia's page.
Tests assert `gameLogo("pick-3") === null`.

**One identity for the family.** Midday and Evening share the single mark; a test asserts no member row carries
its own. The image is decorative (`alt=""`) because the adjacent `h1` is the accessible name, per the manifest's
existing usage boundary.

**Open founder/legal item.** The wordmark is a Florida Lottery trademark, reproduced from the production image
set that already publishes it. Provenance is verified; **trademark clearance is not settled by this task**, and it
is recorded in the manifest alongside the identical unresolved question for Powerball and Mega Millions. If
clearance is withheld, deleting one registry line reverts the page to the neutral lettered mark.

## R6. Cleanup and layout

- **Duplicated Sources paragraph removed.** JG-18 carried `copy.jg18Primary` and `config.trust.summary` saying
  the same thing, then repeated JG-01's freshness line. The trust summary is kept; the other two are gone. The
  source line now appears **once** on the page, in JG-01.
- **One table-level provenance disclosure** replaces 119 per-row "Review sample" badges, stating the real and
  sample counts beneath the table.
- **The accepted State canvas** (1380 px, 32 px desktop gutters) — **scoped by `[data-blueprint-mode="JG-M2"]`**
  so `/fl/powerball` keeps the 900 px column it had at `b57b72e`. A first attempt widened `.lcg-container`
  globally and did change Powerball; that was caught and scoped.
- **Tables and tools take the width; prose does not.** At 1440 px the payout and history tables are 1316 px and
  the payout table **no longer needs to scroll at all** (it did at 900 px), while editorial prose measures
  726 px against `--layout-measure`.
- **No overflow at mobile.** 0 px horizontal overflow at 375, 390 and 1440 px; 0 card overlaps at both widths.

## Validation

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx next lint` | No warnings or errors |
| `npm run build` | Exit 0; `/[state]/[game]/[segment]/[slug]` added *(**CORRECTED 2026-08-07** — recorded as `[section]`)* |
| `npm test` | **640 tests, 640 pass, 0 fail** (32 new) |
| Sections in server HTML | 18/18 |
| Editorial in server HTML | 3 sections, 8 crawlable `<a href>` links, all resolving |
| Article routes | 3 sampled → 200; unknown slug → 404; `noindex`; 1 `<main>` |
| Guard OFF | `/fl/pick-3`, all article routes, `/fl/powerball`, `/fl/cash-pop` → **404**, zero markup leak |
| Guard on vs off | `/`, `/fl`, `/mi`, `/va`, `/ca`, `/md`, `/ut` **byte-identical** |
| `/fl/powerball` | Same order, same six visible sections, `JG-M1`, 0 JG markers, 0 bands, 1 `<main>` |
| Number search, live | `378` exact→1 · `873` exact→0 · `873` any→1 · `007` preserved as `007`→0 · `978` +FIREBALL→1 with the replaced position named |
| Member flow, live | 6 account options, no device language, prompt names the action, 0 login links, missing dependency flagged, nothing claims success |
| `not yet published` in HTML | **0** |

### New tests (32)

Leading zeros (`007`/`070`/`700` are three searches; partial input rejected; the field is `type="text"`), each
window size, window-after-filter, Midday/Evening/Both, Exact Order, Any Order, any-order ⊇ exact-order, the
add-on widening only when asked, neutrality of every emitted statement, editorial grouping and route resolution,
Winners rejection, byline/date rejection, compact stats bounds, consolidated summary, no device-local storage,
no claimed success, the JG-M2-scoped canvas, the single provenance disclosure, the removed duplicate sources
paragraph, and the state-scoped verified logo with its recorded provenance.

## Revision limitations

1. **Statistics still describe sample data.** 119 of 121 Pick 3 history rows are internal review samples. The
   compact preview and the "what changed" summary are computed over them.
2. **No member service.** JG-17 is a guarded review state; the dependency is `member-auth` and is flagged in the
   DOM.
3. **No AI service.** JG-04 is unchanged.
4. **Article routes are introduced and guarded**, pending the URL audit. `noindex`, no sitemap entry, no redirect.
5. **1440 px screenshots are partial.** One full-width capture of the top ~2,600 px succeeded; the browser pane
   renders blank at that width after scrolling. Desktop below the fold was verified by measurement — canvas
   width, prose measure, table widths, grid columns, overlap and overflow.
6. **The founder's reference screenshot could not be opened.** It is in `~/Downloads`, outside the workspace, and
   the sandbox denies reads there. The six required changes were implemented from the written direction.
7. **Trademark clearance for the Pick 3 wordmark is unresolved** — same open item as Powerball and Mega Millions.

---

# GENERIC FORMAT-DRIVEN GAME PAGE — LRG-GAME-052 (2026-08-04)

Makes the jurisdiction Game Page generic behind the scenes while keeping each game's presentation specific to
its format, and validates it with ten representative guarded pages across two jurisdictions. No State Page,
Home, Global Footer, flagship, redirect, canonical or sitemap change.
*(**CORRECTED 2026-08-07** — read "Not committed"; committed in `f8e3061`.)*

## G1. Ordering assumptions learned from the current code

Traced before editing. Recorded because the task forbids inventing a schema or a second ordering system.

| Concept | Where it lives today | Status |
|---|---|---|
| Draw records | `drawEventsFor(code)` → `StateDrawEvent[]`, one **latest** record per member game | Generic seam, unchanged |
| Draw identity | `gameId` (production id), `formatId`, `familyKey`, `drawPeriod`, `feedName`, `resultDate`, `feedUpdatedRaw` | **No draw-level sequence number and no `drawId` exists.** Identity through the whole path is the pair `(gameId, resultDate)` |
| Result order | `mainNumbers: number[]` transcribed in feed order → `MemberBallGroup.values` → `StateBallGroup` renders array order | **Real winning values preserve supplied order, end to end.** Two narrower orderings exist and are listed below — see *Where ordering does occur* |
| Main / special groups | `mainNumbers` + `specialBalls[{label, values}]`; `groupsFor()` classifies special vs drawn add-on from the format | Never merged |
| Family members | `config/states/{code}.json` → `presentation.families[].members[{gameId, variantLabel, displayOrder}]` | Ordered by `displayOrder`, never recency |
| Format versions | `formatVersionsFor(code)` + `selectFormatVersion(versions, gameKey, drawDate)` | Date-effective by **draw** date; throws on overlap |

**Ordering information NOT carried through the view model**, and therefore unavailable to any tool:

1. **No per-draw identifier.** There is no `drawId`, draw number or ticket-verification serial. `(gameId, resultDate)` is the only identity, which is unique for the captured feed but would collide if a game ever published two drawings of the same member on one date.
2. **No intra-day sequence.** `drawPeriod` ("Midday", "Late Night") is a *label*, not an index. Cash Pop's five drawings have no ordinal, so "the third drawing today" is not expressible.
3. **No draw-level status history.** `currentStatus` exists on the resolved member but the feed carries no pending/delayed/corrected transitions, so a correction cannot be dated.
4. **No published-at timestamp per draw.** `feedUpdatedRaw` is a feed-level string, not a per-draw publication time.

None of these were invented. Each is recorded as a gap for whoever defines the production contract.

**The two orders, kept apart.** Stored/display order comes from the data path and is echoed back unchanged.
Matching order comes from declared rules. A 6/53 game preserves its ascending feed order for display while
matching on the *set*; Pick 3 matches by position. `gameHistorySearch.ts` contains no sort of a drawn value, and
a test asserts it.

### Where ordering *does* occur — corrected, LRG-GAME-053

The earlier claim in the table above read **"Nothing sorts, anywhere."** That was too strong, and a reader
auditing the code would have found sorts and concluded the record was wrong about something more important than
it was. Three distinct cases exist and only the first concerns real winning values:

1. **Real winning values preserve supplied order.** A value that came from the results feed is never reordered,
   in any layer, for any reason. `mainNumbers` reaches `StateBallGroup` in the order the operator published it,
   and the search compares against that array as supplied. This is the guarantee that matters and it holds
   without exception.
2. **History *records* may be ordered for presentation.** The rows of a history table are sorted newest-first,
   and search results are ranked by match strength before date. This orders *which draw appears above which* —
   never the values inside a draw.
3. **Guarded unordered *sample* values may be normalised for realistic display.** In `gameReviewFixture.ts`, a
   generated sample for a group whose declared semantics are `repeatsAllowed: false` is sorted ascending, because
   every operator in the reference set publishes such a game ascending and an unsorted sample would look unlike a
   real result. This applies **only** to internally generated preview samples, which are tagged
   `provenance: "internalSample"` and cannot exist with the guard off. An ordered group is never sorted — its
   positions are the point, and sorting one would fabricate a pattern the game does not have.

Reading order matters here: (2) sorts records, (3) sorts synthetic values, and neither can reach (1).

## G2. The narrow contract extension

`BallGroupSpec` already declared value type, count, min, max, `differentSet` (independent pools), label,
`accessibleLabel` and `visualRole`. **Two fields were missing and were added:**

- `matchOrdered?: boolean` — whether *ticket matching* is position-sensitive.
- `repeatsAllowed?: boolean` — whether the same value may appear twice.

Both are **declared, never inferred from stored order** — a ball game's ascending feed order looks identical to
a positional one. `resolveGroupSemantics()` reports each answer as `declared` or `defaulted`, and
`undeclaredSemantics()` lists any group still defaulting. **All 32 format versions across five jurisdictions now
declare both**, asserted by test.

## G3. The competing definition that was removed

`GameRuleEra` carried `selectionKind`, `selectionCount`, `selectionMin`, `selectionMax` and `repeatsAllowed`, and
**every tool read them**. That was a second declaration of what `BallGroupSpec` already says. Consequences:
the two sources could disagree about how many values a game draws, and a single flat group could not express a
special ball — which is precisely why every tool was digit-only.

**All five fields are deleted.** The division is now:

| Layer | Owns |
|---|---|
| `ResultFormatVersion` / `BallGroupSpec` | Groups, counts, ranges, value types, match ordering, repeat rules, independent pools, date-effective versions |
| `GameRuleEra` | Play types, wagers, payout matrices, odds, add-on prize tables, effective eras |
| `config/games/*.json` | Labels, copy, capabilities, navigation, editorial, starters |
| `gameReviewFixture.ts` | Guarded review history only |

## G4. Format adapters

`lib/game/gameFormatProfile.ts` is the single adapter. It classifies a `searchKind` from the group shape:

| `searchKind` | Presentation | Representative games |
|---|---|---|
| `digits` | Contiguous digit field, leading zeros preserved, Exact/Any order | Pick 2/3/4/5, CA Daily 3 |
| `single` | One input, its own range, **no order controls** | Cash Pop |
| `unordered` | One input per selection, duplicates rejected, set comparison, **no digit or Box vocabulary** | Fantasy 5, Lotto, Jackpot Triple Play |
| `multiGroup` | Main and special groups rendered, validated, compared and **reported separately** | CA SuperLotto Plus |
| `unsupported` | Adapter boundary for card formats; tools suppress honestly, no card rules invented | none configured |

A **drawn add-on is excluded from classification** — FIREBALL is a property of the drawing, not a group the
player picks, so Pick 3 stays `digits`. Getting this wrong initially also disabled the Pick 3 checker.

`lib/game/gameHistorySearch.ts` is the one search engine. Windows are 10/25/50/100/**all**, applied *after* the
variant filter so "last 25 Evening drawings" means 25 Evening drawings.

## G5. Dynamic versus configured fields

| Dynamic (data path) | Configured (JSON) | Rules (era) | Format (`BallGroupSpec`) |
|---|---|---|---|
| Drawn values, draw date, draw time, status, next draw, freshness, `gameId` | Headings, intros, navigation, capabilities, methods, editorial, community starters, destinations, trust copy, `visualIdentity`, `familyId`, `ruleGameKey` | Play types, wagers, payouts, odds, add-on prizes, effective eras, ticket price, Advance Play | Group count, min, max, value type, `matchOrdered`, `repeatsAllowed`, `differentSet`, labels, roles |

**Source labels come from jurisdiction configuration.** The governed manifest is preferred; only Florida has one,
so the fallback is the jurisdiction's own configured name (`{stateName} Lottery`). Previously every non-Florida
page read "Official results feed".

## G6. Representative route status

All ten are guarded preview only: `noindex`, absent from every sitemap, no redirect in either direction.

| Route | `searchKind` | Rows | Sections | Route classification | Notes |
|---|---|---|---|---|---|
| `/fl/pick-2` | digits (2) | 2 | 17 | Introduce | No verified matrix → no checker |
| `/fl/pick-3` | digits (3) | 2 | **18** | Introduce | Verified matrix, checker, editorial, verified logo |
| `/fl/pick-4` | digits (4) | 2 | 17 | Introduce | |
| `/fl/pick-5` | digits (5) | 2 | 17 | Introduce | |
| `/fl/cash-pop` | single (1/15) | **5** | 17 | Introduce | Stake-dependent prize; no repeat metric |
| `/fl/fantasy-5` | unordered (5/36) | 2 | 17 | **Exists**, currently serves one member | |
| `/fl/jackpot-triple-play` | unordered (6/46) | 1 | 17 | **Preserve** | |
| `/fl/lotto` | unordered (6/53) | 1 | 17 | **Preserve** | |
| `/ca/daily-3` | digits (3) | 2 | 16 | Introduce | Second jurisdiction |
| `/ca/superlotto-plus` | multiGroup (5/47 + Mega 1/27) | 1 | 16 | Introduce | Special-ball proof |

`/fl/powerball` remains `JG-M1`, verified unchanged: same order, six visible sections, 0 JG markers, 0 bands.

**Only two suppressions remain, both honest:** `JG-15` where no editorial exists (nine games — fabricating it is
forbidden) and `JG-13` for California, which has no claim manifest.

## G7. Missing metadata

1. **No `drawId` or draw sequence** in the data path (G1). Blocks per-draw permalinks and correction dating.
2. **Rule eras exist for three games only** (Pick 3 verified; Jackpot Triple Play and Cash Pop structure-only). Seven representative games have no payout matrix, no play types and no wagers, so JG-06 shows format-derived play information and suppresses the prize table.
3. **Claim manifests exist for Florida only.** California's JG-13 suppresses.
4. **No California rule sources** were researched in this task, by instruction.
5. **No card format is configured**, so the `unsupported` branch is exercised only by unit test.
6. **Editorial scope is per-jurisdiction-game.** A global-game versus jurisdiction-game article scope will be needed once `/powerball` exists — recorded, not designed. No CMS or database was designed.

## G8. Test and build results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx next lint` | No warnings or errors |
| `npm run build` | Exit 0; `/[state]/[game]` 18.7 kB |
| `npm test` | **664 tests, 664 pass, 0 fail** (+11 suites this task) |
| Guard OFF | all ten game routes, all article routes and `/fl/powerball` → **404**, no markup leak |
| Guard on vs off | `/`, `/fl`, `/mi`, `/va`, `/ca`, `/md`, `/ut` **byte-identical** |
| 390 px | 0 horizontal overflow on all four families |
| 1440 px | canvas 1380 px, prose 726 px, history table 1316 px, 0 overflow; one `<h1>`, one `<main>`, 9 bands each |

### Acceptance criteria

| Criterion | Result |
|---|---|
| Pick 3 searches `007` without losing zeros | ✅ parses to `[0,0,7]`; distinct from `700`; `type="text"` |
| Pick 4 and Pick 5 derive position counts | ✅ 4 and 5 from the format; 3 digits rejected for Pick 4 |
| Cash Pop accepts and searches `15` | ✅ one input, `maxLength=2`, range 1–15 enforced |
| Fantasy 5 accepts five unique values, ignores order | ✅ duplicates rejected, shuffled input gives identical result |
| Special-ball game compares groups independently | ✅ `all 5 numbers · 1 of 1 Mega Ball`; Mega validated 1–27, main 1–47 |
| Multi-draw families keep one identity, independent rows | ✅ 2/5/1 rows; distinct ids; Pick 3 dates differ |
| Supplied result order preserved | ✅ `3 · 7 · 8` echoed unchanged; no sort in the engine |
| Unsupported tools suppress honestly | ✅ checker only where a matrix is verified; JG-03 keeps its explanation |
| Adding a game needs no composition edit | ✅ composition names no slug and no game id |
| Pick 3 News, Guides, Blogs visible | ✅ three sections, eight crawlable links |
| Powerball, Home, State, Footer unchanged | ✅ byte-identical / JG-M1 signature intact |

## G9. Defects found and fixed during this task

1. **Drawn add-on misclassified digit games as `multiGroup`**, which also disabled the Pick 3 checker.
2. **`JG-06` and `JG-10` suppressed on `era !== undefined`** — a leftover that hid how-to-play and the generator from seven of ten games. Both now read the format; `formatSummary` explains the shape without an era.
3. **The unordered summary claimed a full set "appeared in 25 drawings"** when 25 was the count sharing *at least one* number. Now reports `fullMatches` and `partialMatches` separately, with full matches ranked first.
4. **"the all 60 available drawings"** — grammar bug in the window phrase.
5. **Cash Pop showed "Contained a repeated digit: 0 of 303"** — a metric that cannot apply to a one-value game. Statistics tiles are now format-appropriate and use the format's own noun.
6. **California's source label degraded to "Official results feed"** because only Florida has a manifest.
7. **`fl-cash-pop` and `fl-jackpot-triple-play` still carried device-local Save copy** from LRG-GAME-050.
8. **The review fixture imported `FLORIDA_DRAW_EVENTS` directly**, which blocked any other jurisdiction. Now reads `drawEventsFor(stateCode)`.
9. **`JG_M2_BANDS` hardcoded "Florida player information"** — now `{state}`, substituted at render.

## G10. Screenshots

Captured in the review session at 390 px and 1440 px; the browser pane returns images inline and cannot write
PNG files, so there are no on-disk paths. Covered: **Pick 3** (digits), **Cash Pop** (single-number),
**Florida Lotto** (unordered ball) and **CA SuperLotto Plus** (special ball). Desktop below the fold was
verified by measurement — canvas, prose measure, table widths, overflow, landmark and band counts — because the
pane renders blank at 1440 px after scrolling.

## G11. Remaining founder decisions

1. **Ten introduced routes** (`pick-2/3/4/5`, `cash-pop`, `ca/daily-3`, `ca/superlotto-plus`) plus eight article routes. Guarded, `noindex`, no sitemap, no redirect. Confirm they stay guarded pending the URL audit.
2. **Seven of ten games have no verified payout matrix.** Each needs its own primary-source research pass before its prize table can publish.
3. **California has no claim manifest or rule sources.** JG-13 suppresses; confirm that is acceptable for a design review.
4. **The production draw contract must supply a draw identifier and an intra-day sequence** (G1, G7). Recorded, not designed.
5. **Editorial scope** — global-game versus jurisdiction-game articles, once `/powerball` exists.
6. **`member-auth` is still missing** (LRG-GAME-051 R4), so JG-17 remains a guarded review state.
7. **Trademark clearance** for the Pick 3 wordmark remains open, alongside Powerball and Mega Millions.

---

# GENERIC-ENGINE CORRECTIONS — LRG-GAME-053 (2026-08-04)

Eight defects found in review after LRG-GAME-052, all in the generic engine rather than in any one game. No
State Page, Home, Global Footer, flagship, redirect, canonical, sitemap, auth, API or database change.
*(**CORRECTED 2026-08-07** — read "Not committed"; committed in `f8e3061`.)*

Each defect below was reproduced before being corrected, and each has a regression test that fails against the
previous code. The pattern common to five of the eight is worth stating plainly: **a mechanism that produced a
correct-looking answer for the wrong reason.** An inferred operator name that happened to be right for
California, a rule-era lookup that happened to miss, semantics derived from a property that happened to
correlate, a review date that happened to fall in a gap with no format boundary, and capability flags whose
values happened to all be `true`. None of these were visible as bugs in the rendered pages; all of them were
wrong in a way the next jurisdiction would have paid for.

## H1. Multi-group full-match semantics

`SearchResult.fullMatches` inspected the main group only. Searching CA SuperLotto Plus for the real 2026-07-08
main numbers `18, 22, 28, 33, 38` with the **wrong** Mega Ball reported `fullMatches: 1` and stated the selection
*"appeared in full"* — while the per-group table on the same screen read `main 5 of 5 · Mega Ball 0 of 1`.

Replaced by two separately named counts:

| Field | Question it answers |
|---|---|
| `fullTicketMatches` | Did **every selectable group the reader completed** match in full? |
| `fullMainMatches` | Did the **main group** match in full, whatever the specials did? |
| `partialMatches` | `totalMatches - fullMainMatches` |
| `comparedSpecialLabels` | Which non-main groups the reader actually filled in |

Rules now enforced:

- A complete main match with the wrong special ball is **not** a full ticket match. Its sentence reads
  *"matched all 5 main numbers in 1 of the … , but no drawing also matched your Mega Ball. That is a full
  main-number match, not a full ticket match."* — the phrase "full match" is never used unqualified for it.
- A group the reader left **blank** is not compared and not counted against them. Five numbers with no Mega Ball
  entered is a main-number search and reports the plain wording.
- Drawn add-ons stay out of ticket classification entirely. FIREBALL is drawn, not chosen, so it cannot bear on
  whether a player's ticket matched.
- Row ranking is three-banded: full ticket, then full main-number, then partial — each newest-first.

## H2. Generic rule-era provider

`gameM2Model.ts` imported `FLORIDA_RULE_ERAS` and matched every jurisdiction against it. The miss for California
was luck — Florida's keys are `pick-3`, California's are `ca-daily-3` — not design.

New `lib/game/gameRuleProvider.ts`: `ruleErasFor(stateCode)`, `hasRuleEras(stateCode)`,
`jurisdictionsWithRuleEras()`. It holds no rule data; Florida's eras stay in `floridaGameRules.ts` with their
provenance. Registering a jurisdiction is one line there plus its own data module, and the page model does not
change. An unregistered jurisdiction returns `[]`, so the payout matrix, play types, wagers and the ticket
checker all suppress honestly. **No California rule data was created or researched.**

## H3. JG-12 eligibility

The condition was `localFeatures.length > 0 || m2.era !== null`. `m2.era` is typed `GameRuleEra | undefined`, so
`m2.era !== null` is a **tautology** — the whole expression was constantly true and its first half was dead code.
`localFeatures` is also the JG-M1 feature list, which JG-12 does not render.

Now `m2.offeringFacts.length > 0` — the array the section actually renders, already publication-gated, and
populated from verified offering facts, an applicable rule era's details, or configured schedule facts. Florida
Pick 3 renders five facts; CA SuperLotto Plus renders one (its drawing schedule); a jurisdiction with none gets
the mandatory heading and a stated reason rather than an empty definition list.

## H4. Inferred operator names removed

The freshness line fell back to `` `${config.game.stateName} Lottery` ``. It produced "California Lottery" — which
happens to be correct — by a mechanism with no way of knowing whether it is, and which names a territory's or a
commission-run jurisdiction's operator wrongly while reading on the page as a verified attribution.

Three sources, in order of authority:

1. The governed manifest's verified `operatorName` → `"Florida Lottery results feed"`.
2. A configured `trust.resultSourceLabel` (new optional field) — configuration written and reviewed by a person
   for that jurisdiction. **No representative configuration sets it**, which is why California is neutral.
3. Neutral LotteryCorner language → `"LotteryCorner results record"`, which attributes the compilation to us and
   claims no operator at all.

A gated fact whose value is absent resolves to `undefined`, not `null`; the first implementation of this fix used
a bare `!== null` check and rendered the literal string `"undefined results feed"`. Same undefined-versus-null
slip as H3, caught in verification.

## H5. Capability gating enforced

Apart from `hasSharedAi` and `hasChecker`, **no capability was ever read.** Every representative game declares
its capabilities `true`, so the omission was invisible and setting one to `false` changed nothing.

Every optional feature now requires **both** the capability **and** the required format/data support, and each
suppression names which half failed:

| Section / feature | Capability | Support required |
|---|---|---|
| JG-04 AI | `hasSharedAi` | — |
| JG-07 History | `hasHistory` | connected or review history |
| JG-08 Number search | `hasNumberHistory` | history **and** `profile.supports.numberSearch` |
| JG-09 Statistics | `hasStatistics` | computed statistics |
| JG-10 Generator | `hasGenerator` | `profile.supports.generator` |
| JG-11 Player methods | `hasMethods` | configured modules |
| JG-14 Insights | `hasHistory` | insights (derived from history) |
| JG-16 Community starters | `hasCommunityStarters` | configured starters |
| JG-17 Alerts / follow | `hasAlerts` | applicable options |
| Checker tool (inside JG-03) | `hasChecker` | publishable era + priced payouts + digit format |
| Buy Now entry (inside JG-02) | `hasBuyNowEntry` | resolved commerce |

**Mandatory sections are not gated this way.** JG-01, JG-02, JG-03, JG-05, JG-06, JG-12, JG-13 and JG-18 keep
their heading and an honest explanation; the *tool* inside a mandatory section is what withholds. Hiding a
required heading to satisfy a flag would trade one dishonesty for another.

Capability-off tests clone a real configuration and switch one field at a time —
`buildGamePreviewModel(state, slug, preview, { config })` exists for that and is the only new API surface. A
further test asserts that **every** key in the capabilities block is named somewhere in the model, so a
configurable field can no longer be inert.

## H6. Matching semantics declared by name

Both registries built their main group with one helper that computed the semantics:

```
matchOrdered: valueType === "digit",
repeatsAllowed: valueType === "digit",
```

Every field was populated, so `undeclaredSemantics()` reported a clean sheet — and the values were a **derivation
from a presentation property**. "Renders as a digit" is not the published claim "a Straight play matches by
position".

Three named constructors now live in `resultFormatContract.ts` and both registries call them:

| Constructor | Declares | Used by |
|---|---|---|
| `orderedDigitPositions` | `matchOrdered: true`, `repeatsAllowed: true` | positional digit games |
| `unorderedNumberPool` | `matchOrdered: false`, `repeatsAllowed: false` | single-pool ball draws |
| `singleValueGroup` | `matchOrdered: false`, `repeatsAllowed: false` | one-value groups and named special balls |

Registry call sites read `DIGITS(3)`, `POOL(5, 1, 69)`, `SINGLE(1, 15)`, `SPECIAL(1, "Mega Ball", …)` — the rule
is legible at the call site and nothing is computed. The `valueType` fallback inside `resolveGroupSemantics`
remains as a safety net for a partially-transcribed spec and is always reported as `defaulted`.

One related correction: an **undeclared single-value group used to be reported as `declared`**, on the reasoning
that order and repetition are unobservable in a group of one. The reasoning is sound about the semantics and
wrong about the reporting — saying "declared" about something nobody declared hides an incomplete transcription.
Absence is now reported as absence for every group, and every publication-capable representative format declares
both fields on every group.

No database field was added and no schema was designed. Stored result order still does not determine matching
order: a test proves SuperLotto Plus stores ascending, declares `matchOrdered: false`, and matches a set typed in
a different order.

## H7. Jurisdiction-specific review-date resolution

`gameReviewFixture.ts` exported `REVIEW_DATE_ISO = "2026-07-09"` — the newest **Florida** draw date — and every
jurisdiction anchored to it. California's newest transcribed result is `2026-07-08`, so every California page
generated its history, evaluated its next-draw guard and made its date-effective selections against a date one
day after the newest fact California has. The visible harm was small only because no California format or rule
era has a boundary in that gap; a jurisdiction whose feed lagged a week would have suppressed genuinely upcoming
draws, and a format transition inside the gap would have selected the wrong era for a real published result.

New `lib/game/gameReviewDate.ts`: `resolveReviewDate(stateCode)` → `{ iso, source, absent }`, three sources in
order:

1. `governedManifest` — the jurisdiction's own `resultLastUpdatedIso` governed fact. Both Florida (`2026-07-09`)
   and California (`2026-07-08`) resolve here, so the Game Page and the State Page now agree by construction.
2. `newestDrawEvent` — newest `resultDate` across that jurisdiction's transcribed events.
3. `isolatedFallback` — one named constant, reached only by a jurisdiction with no dated facts at all. `source`
   says so and `absent` carries the reason, so a page resting on it is identifiable. **No representative page
   does**, and a test asserts that.

The resolved date is threaded through date-effective format selection, rule-era selection, generated
review-history dates, next-draw suppression and the freshness line. `buildReviewHistory` now takes the date as a
parameter and holds none of its own. Founder decision 1 is unchanged and still enforced: the date comes from the
feed, never from the clock, and a test asserts the module contains no `Date.now()` or `new Date()`.

## H8. Format-appropriate vocabulary — found during verification

The JG-09 statistics tiles were made format-driven in LRG-GAME-052; the **JG-14 summary** and the **JG-07 table
header** were missed. Cash Pop — one number from 1 to 15 — still published *"0 of 303 drawings contained a
repeated digit"*, *"0 of 303 drawings contained two digits next to each other in value"* and a **"Winning
digits"** column. All three were true, meaningless, and described a digit game the reader was not looking at.

Both now read the format: the noun comes from `valueType`, the repeat observation renders only where
`repeatsAllowed` permits one, the adjacency observation only where more than one value is drawn, and the column
heading names what that game draws (*Winning digits* / *Winning numbers* / *Winning number*). Cash Pop's rendered
page now contains zero occurrences of "digit" in visible text.

## H9. Files changed

| File | Reuse decision | Change |
|---|---|---|
| `lib/game/gameRuleProvider.ts` | **NEW** | The rule-era registry (H2) |
| `lib/game/gameReviewDate.ts` | **NEW** | The review-date resolver (H7) |
| `lib/state/resultFormatContract.ts` | REFACTOR | Named semantic constructors; honest `defaulted` reporting (H6) |
| `lib/state/floridaFormatRegistry.ts` | REFACTOR | `MAIN` → `DIGITS`/`POOL`/`SINGLE`; `SPECIAL` delegates (H6) |
| `lib/state/stateFormatRegistry.ts` | REFACTOR | Same (H6) |
| `lib/game/gameHistorySearch.ts` | REFACTOR | Ticket versus main-number classification and wording (H1) |
| `lib/game/gameM2Model.ts` | REFACTOR | Provider, resolved date, source attribution, `buyNowUsable`, `formatVersion`, JG-14 vocabulary (H2, H4, H5, H7, H8) |
| `lib/game/gamePreviewModel.ts` | REFACTOR | Capability gating, JG-12 condition, `opts.config` (H3, H5) |
| `lib/game/gameReviewFixture.ts` | REFACTOR | Review date becomes a parameter (H7) |
| `lib/game/gameViewConfig.ts` | REFACTOR | Optional `trust.resultSourceLabel` (H4) |
| `components/game/preview/sections/GameM2Bands.tsx` | REFACTOR | Buy Now gated on `buyNowUsable` (H5) |
| `components/game/preview/tools/GameWorkspace.tsx` | REFACTOR | Format-derived table header (H8) |
| `tests/game-page-m2.test.ts` | REFACTOR | Nine new suites; two tests that encoded the H4 defect corrected |

## H10. Screenshots

Eight PNGs, `{pick-3, cash-pop, florida-lotto, ca-superlotto-plus} × {390, 1440}`, written to the session
scratchpad — **outside the repository**, so `git status` stays clean:

```
/private/tmp/claude-501/-Users-bala-Learning-lc/186aa12d-5c02-44e7-a90b-b16aa210ed1b/scratchpad/review-shots-lrg-game-053/
```

These are headless captures at a fixed window width and **crop rather than reflow**, so overflow was measured in
the browser instead of read off the image: `documentElement.scrollWidth === clientWidth` at both widths on all
four games, with every wide table inside an `overflow-x: auto` wrapper and no element past the edge lacking a
scrollable ancestor. The corrected H1 search was additionally driven interactively at 390 px and the
wrong-Mega-Ball sentence confirmed on screen.

Being scratchpad files, they are session-scoped: re-capture them for a founder review rather than relying on the
paths above surviving.

## H11. Remaining limitations

1. **The G1 gaps are unchanged and still open.** No per-draw identifier, no intra-day sequence, no draw-level
   status history, no per-draw published-at timestamp. These remain future data-provider requirements, not
   design work for a UI task.
2. **California still has no researched rule data**, by instruction. Its payout matrix, play types, wagers and
   checker suppress; JG-13 suppresses for want of a claim manifest.
3. **Seven of ten games have no verified payout matrix.** Each needs its own primary-source pass.
4. **The number-search inputs take their accessible name from the drawn group's `accessibleLabel`**, so a
   SuperLotto Plus field announces as "Winning numbers value 1" when it is in fact the reader's own entry. Not
   corrected here — it is a wording defect outside this task's eight, and it affects the accessible name only.
5. **`buildGamePreviewModel` now accepts a config override.** It exists for capability testing and defaults to
   the registered configuration, so no route behaviour depends on it — but it is a seam a future caller could
   misuse to render an unregistered configuration.
6. **`resolveReviewDate` reads the State content manifest**, which couples the Game Page's review date to State
   data. That is the intended direction (one governed date per jurisdiction), but it means a State manifest
   change moves every Game Page date in that jurisdiction.

---

# POST-COMMIT ACCURACY REVIEW — LRG-GAME-054 (2026-08-07)

Documentation-only. **No Game Page code, configuration, route, redirect, canonical, sitemap or test was changed.**
This section records what was verified, what was corrected, and two live defects found in passing that belong to a
separate task.

## P1. What was re-verified against the running application

Built at commit `2020760` and served with `LC_GAME_PREVIEW=true`.

| Claim | Source | Verified |
|---|---|---|
| `/fl/pick-3` renders 18 sections in server HTML | §5 | ✅ 18 distinct `data-section-id="JG-*"`, 1 `<main>`, 1 `<h1>` |
| Nine bands | §5 | ✅ |
| `/fl/powerball` stays `JG-M1` | §10, G8 | ✅ `data-blueprint-mode="JG-M1"`, **0** JG markers, 1 `<main>` |
| Eight editorial articles, all crawlable and resolving | R1 | ✅ 8 distinct `<a href>`; each returns 200 — **after** correcting the one documented slug |
| An undeclared slug 404s | R1 | ✅ `/fl/pick-3/guides/nonexistent` → 404 |
| 121 history rows | §5, §11 | ✅ *"Show full history (121 drawings)"*, split as feed rows plus internal review samples |
| Guard OFF 404s every game and article route | §10, G8 | ✅ `/fl/pick-3`, `/fl/powerball`, `/fl/cash-pop` and a sampled article all 404 |
| `not yet published` absent | R1 | ✅ 0 occurrences |
| `official site` / `official website` absent | §6 | ✅ 0 occurrences |
| Type-check, lint, build | §10, validation, G8 | ✅ `tsc` clean; lint 0 errors; `next build` exit 0 |
| Suite passes | §10, validation, G8 | ✅ **892 tests, 892 pass, 0 fail** — the per-task counts of 608 / 640 / 664 were accurate at the time and are left as the historical record |

## P2. The two live defects found — reported, not fixed

Both are in Game Page content or code, which this task must not modify.

1. **`fIREBALL` is misspelled in the shipped article title.** `config/games/fl-pick-3.json` contains *"Rule change:
   fIREBALL replaced the 1-OFF play style across the PICK daily games"* — lower-case `f`, upper-case `IREBALL`. It
   renders exactly that way on `/fl/pick-3` and on the article page. It is a one-character content fix in
   configuration, not a code change, but it is Game Page content and therefore out of this task's scope.

2. **The documented blog slug never matched the configured one.** `why-midday-and-evening-need-separate-dates` was
   written into the record; `midday-and-evening-are-two-different-games` was written into the configuration. Only
   the record was wrong — the article has always resolved — but it means the record's route table could not be used
   to verify the page without hitting a 404. Corrected in R1 above; no code touched.

## P3. Scope changes since these tasks were written

- **`/fl/pick-3/2026` now exists** — the guarded Yearly History Page (LRG-ARCHIVE-054…060, `2020760`). §7's
  *"consolidation candidate, not implemented"* and §11's family-archive recommendation were written before it. It
  remains guarded, `noindex` and absent from every sitemap, and the consolidation decision is still open.
- **`ACCT-DEC-001` and `DATA-DEC-001` now exist** (`2020760`) and govern the account boundary that R4 and §11
  described as simply missing. `FD-ACC-14` — no disabled or *"Coming soon"* account control — is why
  `DEFAULT_SHELL_CAPABILITIES.account` and `.favourites` now default to `false` platform-wide, which changes the
  shell around this page although not the page itself.
- **`AGENTS.md` remains untracked** and Conflict 25 remains open, by founder instruction. Untouched by this task.

## P4. Next task recommendation

**Fix the `fIREBALL` title typo in `config/games/fl-pick-3.json`** — one character, one configuration file, with a
test asserting no editorial title contains a lower-case-leading all-caps word. It is the only reader-visible defect
this review found.
