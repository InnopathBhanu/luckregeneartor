# Claude Code Execution Brief: Yearly History Archive V0

**Status:** Ready for Claude Code execution after founder review  
**Date:** 2026-08-05  
**Primary review route:** `/fl/pick-3/2026`  
**Page family:** Game-Year Historical Intelligence Hub  
**Implementation owner:** Claude Code  
**Research and task preparation:** ChatGPT/Codex  

## 1. Founder Direction

Build the first guarded Yearly History Archive as a useful research page, not a long table.

The reference page is:

```text
/fl/pick-3/2026
```

It must present Florida Pick 3 as one game family with independent Midday and Evening draw rows. Do not merge the underlying draw records. Each member retains its existing game ID, draw date, time, result, status, correction state and stored display order.

This task comes before the global Powerball and Mega Millions pages because its result-list, search, statistics, AI-query and year-navigation primitives will be reused by those page families later.

Do not implement production redirects in this task. Candidate legacy routes such as `/fl/pick-3-midday/{year}` and `/fl/pick-3-evening/{year}` require the separate route, canonical, traffic, backlink and edge-redirect audit required by project governance.

## 2. Scope Decision

This task implements one guarded, founder-reviewable archive page and proves that its model is generic.

### In scope

- A guarded `/fl/pick-3/2026` `YR-CURRENT` archive.
- The approved `AR-01` through `AR-11` archive composition.
- One Pick 3 identity with Midday and Evening result rows and filters.
- A complete compact server-rendered review archive.
- Public basic statistics appropriate to an ordered three-digit game.
- Deterministic exact/any-order history search.
- A transparent Ask the Archive review flow grounded in deterministic filters and matching rows.
- Visible News, Guides and Blogs links when real destinations exist; honest empty states otherwise.
- A generic format-driven model tested against a single-value family, a multi-draw digit family and an unordered-number-pool family without adding public routes for those proofs.
- Guard-off regression proof.
- 390 px and 1440 px visual review.

### Out of scope

- Global `/powerball/{year}` and `/mega-millions/{year}` implementation.
- Production redirects, canonical migration, sitemap cutover or edge configuration.
- Database, API, schema or migration work.
- Real AI-provider integration.
- Paid Insider implementation, quotas or subscriptions.
- Bulk exports or API access before data-rights approval.
- Alert delivery unless a real service already exists and is explicitly approved for reuse.
- New community posts, users, replies, likes, views or historical activity.
- Production activation of archive advertisements before the history-page inventory is audited.

## 3. Authority and Founder Override

The final-approved archive package remains the governing page-family blueprint.

The blueprint's examples use separate variant routes such as `/fl/pick-3-evening/2021`, and its game-identity rule says not to rename or split games during redesign. The founder has now explicitly directed the presentation layer to use one family route such as `/fl/pick-3/2026`, with Midday and Evening shown as independent rows.

Apply that direction as follows:

- preserve each existing member game ID and draw record;
- combine only page identity, navigation and presentation;
- use stable member ordering from the existing family configuration;
- do not silently activate redirects or canonical changes;
- record the route conflict and candidate migration in the implementation record;
- keep production behavior unchanged while the preview guard is off.

## 4. Source Documents Claude Must Read First

Read completely before changing code:

1. Root `CLAUDE.md`.
2. Root `AGENTS.md`.
3. `03-docs/09-claude-execution-briefs/README.md`.
4. `03-docs/09-claude-execution-briefs/game-page/README.md`.
5. `03-docs/00-foundation/authoritative/00A-v2.1-luckregenerator-product-constitution-FROZEN.md`.
6. `03-docs/00-foundation/authoritative/01-lotterycorner-experience-architecture-FINAL-APPROVED.md`.
7. `03-docs/01-approved-blueprints/archives/06-lotterycorner-yearly-results-archive-research-FINAL-APPROVED.md`.
8. `03-docs/01-approved-blueprints/archives/06-lotterycorner-yearly-results-archive-blueprint-FINAL-APPROVED.md`.
9. `03-docs/01-approved-blueprints/archives/06-lotterycorner-yearly-results-archive-content-template-FINAL-APPROVED.md`.
10. `03-docs/01-approved-blueprints/games/05B-lotterycorner-jurisdiction-game-page-blueprint-FINAL-APPROVED.md`, only for the parent Game Page relationship.
11. `03-docs/01-approved-blueprints/games/05C-lotterycorner-tools-and-ai-insights-blueprint-FINAL-APPROVED.md`, only for shared tool and AI rules.
12. `03-docs/04-page-specifications/game/florida-pick-3-game-page-implementation.md`.
13. `03-docs/04-page-specifications/game/florida-pick-3-game-page-founder-review.md`.
14. Accepted Home, State and Global Footer implementation records, only for shared visual and interaction primitives.
15. `03-docs/08-decisions/source-authority.md` and `03-docs/08-decisions/source-conflicts.md`.
16. Current route registry, Game Page guard, family configuration, draw-event provider, result-format registry, review fixtures and history/search/statistics helpers.
17. Exact legacy yearly archive routes/templates and the history-page GAM slot family, read-only and only through narrowly scoped commands.

## 5. Current Worktree Safety

At brief creation time, branch `main` is at `b57b72e` and contains a large uncommitted Game Page program: modified and untracked Game Page, format-registry, fixture, test and implementation-record files.

Claude must:

1. Report the complete starting Git state.
2. Treat every existing modification as founder-owned work.
3. Build on the current generic format and family contracts where they are valid.
4. Never reset, clean, stash, revert or overwrite current work.
5. Keep archive changes clearly separable.
6. Do not commit or push before founder review.

## 6. Preview Guard and Route Rules

Before implementation, inspect how `LC_GAME_PREVIEW` currently gates Game Page routes.

Preferred rule:

- reuse the existing guarded preview architecture if the archive route can inherit it without exposing other unfinished routes;
- otherwise introduce a narrowly scoped archive preview guard and document why;
- with every relevant guard off, `/fl/pick-3/2026` must preserve the current behavior and must not become publicly available;
- preview pages must be `noindex`, excluded from sitemap generation and absent from production navigation;
- do not emit a production canonical from synthetic review content.

The dynamic archive segment must not collide with existing article child routes under `/{state}/{game}/{section}/{slug}`.

## 7. Page Identity and Metadata

### Review H1

```text
Florida Pick 3 Results 2026 - Year to Date
```

### Supporting copy

```text
Browse Florida Pick 3 Midday and Evening results for 2026, search the year and explore transparent historical statistics.
```

### Status line

```text
{drawCount} drawings from {firstDrawDate} through {latestDrawDate} | Midday and Evening | {completenessLabel}
```

For the guarded internal fixture, metadata must remain preview-safe and must not describe synthetic values as public facts. Production title, description, canonical and structured data are implementation-record requirements for later cutover, not permission to activate them now.

## 8. Required Page Order and Actual Content

Use the final-approved sequence. Every section needs its stable `AR-xx` marker in the model and server-rendered page.

### AR-01: Archive Identity, Status and Year Navigation

**Visible content:**

- Breadcrumbs.
- One Florida Pick 3 identity and logo.
- Selected year and `Year to date` status.
- Previous valid year, next valid year when it exists, and `All years`.
- Return link to `/fl/pick-3`.
- Earliest available year, draw count, rule-era label and completeness/correction status.

Use compact navigation with real links for valid archive destinations. Do not use a giant year dropdown as the only navigation method.

### AR-02: Year at a Glance

Show up to six public metrics:

1. Draws completed.
2. Midday and Evening counts.
3. Doubles.
4. Triples.
5. Unique exact results.
6. Repeated exact results or an approved sum-range distribution.

Every metric must state its date range and link to matching rows or methodology where useful. Suppress unsupported values. Do not use `hot`, `cold`, `due`, `overdue`, `best`, `winning pattern` or `most likely`.

### AR-03: AI Year Brief

**Visible heading:**

```text
What has defined Florida Pick 3 in 2026 so far?
```

Show three to five concise observations derived from deterministic review metrics, for example:

- count of draws containing a double;
- Midday versus Evening comparison for an explicitly named metric;
- exact result repetitions;
- one month-to-month observation;
- one notable draw linked to its row.

Label the block `LotteryCorner AI Year-to-Date Brief`. Each observation must expose its evidence. The preview may use a deterministic prepared narrative; it must not pretend a live model generated or verified it.

### AR-04: Month Navigation and Timeline

Required:

- January through the latest valid month.
- Draw count per month.
- Correction and rule-change markers only when the review fixture explicitly contains them.
- Accessible links or controls; no swipe-only navigation.
- Current month selected by default for `YR-CURRENT`.

Month navigation may be enhanced client-side, but all review rows must remain in server HTML.

### AR-05: Complete Compact Result List

The numbers remain the dominant content.

Desktop columns:

- Date.
- Drawing.
- Winning digits.
- Fireball when supported.
- Pattern: all different, double or triple.
- Sum when approved.
- Exceptional status/correction marker.
- Row actions.

Mobile row:

- Date and drawing announced first.
- Three stable position-aware digit balls.
- Fireball visually and semantically distinct.
- Compact details and one primary action.

For each date, show Midday followed by Evening according to the existing stored family order. Do not sort or combine the digits. Do not merge both variants into one synthetic result.

Row actions may include `Check`, `Analyze` and `Details`. Show `Discuss` only when a real destination exists.

### AR-06: Search, Basic Filters and Ask the Archive

This is one coherent workspace, not three disconnected cards.

**Public controls:**

- Month or date range.
- `Both / Midday / Evening` segmented control.
- Exact three-digit number.
- `Exact order / Any order` match mode.
- Include Fireball only when supported by the selected search mode.
- Doubles/triples.
- Sum range.
- Newest/oldest order.

The number input is generated from the format contract. It must use three ordered positions from 0 through 9 for Pick 3, while the underlying search contract remains generic for single-value and unordered-number-pool games.

**Ask the Archive:**

Suggested prompts:

- `Did 507 appear in 2026?`
- `Show all Midday doubles in March.`
- `Compare Midday and Evening repeated digits.`
- `Which dates had triples?`

Required output:

- Interpreted game, year, variant and filters.
- Matching count.
- Matching rows.
- Plain-language explanation.
- Evidence links.
- One neutral statement that historical occurrence does not change future odds.

AI translates and explains. Deterministic code performs the search and calculations. At least one complete public answer must render without requiring sign-in.

### AR-07: Selected Analysis and Notable Draws

Show a restrained public selection, not a dense analytics dashboard.

Required Pick 3 views:

1. Digit frequency by first, second and third position.
2. Midday versus Evening comparison.
3. All-different/double/triple distribution.
4. Sum distribution.
5. Front Pair and Back Pair frequency.
6. Previous-draw repeats or historical gaps, clearly labelled as descriptive history.

Each view exposes period, variants, draw count and method. Use charts only when they improve comparison; keep a table alternative.

Show at most five notable draws. Each needs a deterministic reason, metric/value and a link to the matching row. Do not invent significance with AI prose.

### AR-08: Historical Tools Launcher

Show compact launchers for:

- Check My Numbers Across History.
- Compare Years.
- Archive Explorer.
- Pick 3 Number History.
- Rule-Era Comparison.
- Download or Create a Report.

Access labels must be truthful:

- `Public` for working public tools.
- `Sign in to save` only when a real sign-in route and persistence path exist.
- `Planned` only inside the guarded design-review context, not as a public product promise.

Do not implement paid Insider access in this task. Do not draw a working-looking disabled control.

### AR-09: News, Guides, Blogs and Community Timeline

**Visible heading:**

```text
Florida Pick 3 news, guides and history
```

News, Guides and Blogs must be visible content groups or visible linked cards; do not hide the complete inventory behind a menu that requires interaction before links exist in HTML.

Include only real destinations. Desired inventory:

- News: rule, schedule, payout, Fireball or correction changes.
- Guides: how to play, Straight/Box/Combo, Fireball and reading an archive.
- Blogs: interpreting frequency without forecasting, Midday/Evening comparisons and repeated digits.
- Community: genuine relevant discussions only.

When no real content exists, show a concise honest empty state or suppress the group. Never fabricate articles, dates, winners, discussions or engagement metrics.

### AR-10: Data Access, Sources and Methodology

Show:

- Archive completeness.
- Coverage by winning numbers, Fireball, correction status and rule era.
- Last verified date.
- Result source/provenance label.
- Statistics methodology.
- Correction policy and report-an-issue action.
- Export availability and data-rights status.

Do not repeat `check the official site` throughout the page. Use one concise source/freshness statement near the archive and keep the complete trust explanation here.

Do not implement bulk exports in this task. If a basic review download is shown, it must be a clearly guarded internal preview and must not imply approved redistribution rights. `Dataset` or `DataDownload` structured data is prohibited until a real governed public dataset exists.

### AR-11: Current Game and Next Actions

Prioritize:

1. Return to current Florida Pick 3.
2. Check numbers.
3. Compare another year.
4. Save the search only when real account persistence exists.
5. Follow the game or choose alerts only when real services exist.

Do not place Buy Now directly after a loss, partial historical overlap or negative historical result. Commerce is not required for this V0.

## 9. Public and Account Boundary

Public users must receive:

- complete visible review history;
- year/month navigation;
- basic filters and exact/any-order search;
- the selected public statistics;
- one complete Ask the Archive answer;
- one-number-set historical check;
- sources and methodology.

Account value should eventually provide continuity:

- saved searches and number sets;
- cross-device history;
- custom multi-year comparisons;
- custom filtered downloads when rights permit;
- saved charts and AI conversations;
- alerts when delivery exists.

Do not implement or claim those account capabilities unless the current repository has an approved, working service. A signed-out Save action should route to real sign-in and return only when the destination and persistence flow exist; otherwise keep it out of public UI and record the gap.

## 10. Generic Format Contract

The implementation must look specific to Pick 3 while remaining generic behind the page.

Reuse the current date-effective result-format contract and family order. The archive model must support:

- ordered digit positions such as Pick 3;
- unordered main-number pools such as `5/69` plus a special ball;
- single-value games such as Cash Pop;
- multiple independently identified draw variants;
- named special balls and add-ons;
- rule-era changes within one archive year;
- correction and completeness states.

The view model must not infer behavior solely from game names or slugs. Do not add Pick 3-specific JSX branches where a declared capability or format-group semantic can drive presentation.

For generalization tests, use existing configured games only. Do not add production routes for the proof games in this task.

## 11. Internal Review Fixture

Real results are not required for this design review.

Claude may create one isolated archive review fixture with enough rows to demonstrate:

- all twelve months or every elapsed month for the selected current year;
- both Midday and Evening on the same dates;
- stable member order;
- exact and any-order matches;
- all-different, double and triple results;
- Fireball coverage and missing-Fireball coverage;
- one corrected row;
- one partial-data state;
- month filtering and notable-draw evidence.

Requirements:

- fixture provenance is `synthetic/internal-review` in the data contract;
- one page-level preview banner identifies the environment;
- synthetic facts do not enter production metadata, schema, sitemap or unguarded routes;
- no fake winner, prize, retailer, news or community data;
- the fixture must not be treated as an API or database contract;
- guard-off tests prove no fixture content leaks.

## 12. Design Requirements

- Mobile-first at 390 px, then 1440 px.
- Use the accepted Home, State, Footer and current Game Page visual language without modifying those page families.
- Compact page header, not a landing-page hero.
- Results and year context dominate the first viewport.
- AI is prominent after the immediate year summary; it must not block access to results.
- Desktop uses a compact semantic table/list; mobile uses stable stacked result rows.
- Month navigation and filter controls stay easy to reach without becoming a large sticky obstruction.
- Use tabs only for alternate views of the same data. News, Guides and Blogs remain visible/crawlable groups.
- No nested cards, giant metric cards, trading-dashboard treatment, casino styling or horizontal page scrolling.
- Every wide table has its own accessible horizontal scroll container when necessary.
- No ad interrupts a result list, search input/output, AI answer, correction notice or methodology statement.
- No active archive ads until the legacy history-page inventory and dimensions are documented and approved.

## 13. SEO, GEO and Crawlability Requirements

The guarded V0 must prove the production architecture without activating production SEO signals.

Required architecture:

- unique future title, description and H1 template;
- one annual route as the game/year hub;
- full critical content in server HTML;
- crawlable year links;
- server-visible month navigation and result rows;
- filter/sort states not independently indexable;
- visible draw count, date range, rule era, completeness, sources and methodology;
- stable machine-readable dates and semantic table/list markup;
- `WebPage`/`CollectionPage`, `BreadcrumbList` and visible-row `ItemList` only when production data is governed;
- accurate material `lastmod` design: current year after verified result/correction, closed year only after correction or material change.

Do not add `llms.txt`, special AI schema or hidden AI-only copy. The value for AI discovery comes from clear public facts, useful original calculations, evidence links, semantic HTML and reliable source/provenance information.

## 14. External Research Reference Register

These are supporting observations, not authority over the approved blueprint:

| Source | URL | Observation used |
|---|---|---|
| Current LotteryCorner archive | `https://www.lotterycorner.com/fl/pick-3-evening/2025` | Existing year selector, PDF/CSV/TEXT actions and long Date/Result/Jackpot table |
| Lottery Post monthly archive | `https://www.lotterypost.com/results/az/powerball/past/2025/12` | Compact results-first layout, previous/next month navigation, row actions and community proximity |
| Lottery Post member features | `https://www.lotterypost.com/features` | Advanced history search, cross-game analysis, pairs analysis and drawing statistics as deeper member value |
| Official Powerball previous results | `https://www.powerball.com/previous-results` | Simple game/date filters and direct draw-result access |
| Powerball.net yearly archive | `https://www.powerball.net/archive/2025` | One-year archive, year selector, compact rows and linked draw detail |
| LottoMetrics results history | `https://www.lottometrics.app/results-history` | Clear coverage dates and CSV/JSON/TXT export expectations |
| Google pagination guidance | `https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading` | Crawlers follow links, not buttons; avoid click-only/infinite-scroll history |
| Google AI feature guidance | `https://developers.google.com/search/docs/appearance/ai-features` | Foundational SEO remains the requirement; no special AI markup is required |
| Google Dataset guidance | `https://developers.google.com/search/docs/appearance/structured-data/dataset` | Dataset markup only for a genuine described dataset and governed distribution |

Accessed for this brief on 2026-08-05.

## 15. Implementation Phases

### Phase 1: Review and conflict report

Before coding, Claude must:

1. Confirm branch, HEAD, origin/main, ahead/behind and the full working tree.
2. Confirm current guarded Game Page behavior and available preview guards.
3. Confirm no new-UI `/{state}/{game}/{year}` archive currently exists.
4. Inventory exact legacy Pick 3 yearly routes and current archive identity.
5. Inspect current family ordering, format semantics, history search, statistics and review-fixture ownership.
6. Audit the legacy history-page ad slot family without modifying legacy files.
7. Report any conflict that cannot be resolved by the authority hierarchy.

### Phase 2: Archive model and review data

Create a typed, configuration-driven archive view model that:

- consumes existing family members and format groups;
- separates draw facts, derived metrics, editorial content, entitlement and presentation;
- carries archive mode, year, coverage, rule era and correction state;
- supports all `AR-01` through `AR-11` capabilities;
- suppresses unsupported metrics;
- isolates internal-review fixtures;
- does not become a database/API schema by accident.

### Phase 3: Guarded Florida Pick 3 archive

Implement `/fl/pick-3/2026` with the content, order and design requirements in this brief.

The default view shows both variants, newest results first, month navigation, public basic statistics and one complete transparent Ask the Archive answer.

### Phase 4: Generic proof

Test the model and format-driven controls against:

- Pick 3: ordered digits and two variants;
- Cash Pop: a single-value group and five variants;
- Florida Lotto or CA SuperLotto Plus: unordered main pool and a special group;
- one single-member family.

Do not create public archive routes or bespoke components for those proof cases.

### Phase 5: Verification and records

- Capture the primary route at 390 px and 1440 px.
- Verify no page-level horizontal overflow.
- Verify the result list and critical facts exist in server HTML.
- Verify every filter/search interaction named in acceptance criteria.
- Prove guard-off behavior and no fixture leakage.
- Create the authoritative implementation and founder-review records under `03-docs/04-page-specifications/archive/`.
- Stop for founder review. Do not start Powerball or redirects.

## 16. Allowed Paths

After confirming the repository shape, keep changes inside:

- `01-new-ui/app/[state]/[game]/[year]/`
- `01-new-ui/components/archive/`
- `01-new-ui/lib/archive/`
- narrowly required existing shared result-format, family, ball-rendering, SEO and guard modules
- namespaced archive styles in `01-new-ui/app/globals.css`
- archive tests under `01-new-ui/tests/`
- `03-docs/04-page-specifications/archive/`
- this execution brief only for status corrections if required

Any shared file change must be minimal, justified and covered by regression tests.

## 17. Forbidden Changes

- Do not modify legacy JSP, Struts, CSS, configuration or data.
- Do not redesign Home, State, Game Page or Global Footer.
- Do not implement global Powerball or Mega Millions pages.
- Do not activate production redirects, canonicals, sitemap entries or archive navigation.
- Do not modify `02-new-api`, database schemas or migrations.
- Do not install or upgrade dependencies.
- Do not fabricate public results, news, winners, community activity or claims.
- Do not hardcode Pick 3 behavior into a supposedly generic archive engine.
- Do not merge variant game IDs or draw records.
- Do not enable production export, API, alert or paid-tier behavior.
- Do not activate, remove, rename or repurpose history-page GAM slots.
- Do not expose raw affiliate destinations.
- Do not use predictive language or imply historical patterns change future odds.
- Do not commit or push before founder review.

## 18. Acceptance Criteria

### Page and content

- `/fl/pick-3/2026` resolves only under the approved preview guard.
- The page renders `AR-01` through `AR-11` in the approved order.
- The first viewport identifies Florida Pick 3, the selected year/status and recent results.
- Midday and Evening remain independent, correctly ordered result rows.
- News, Guides and Blogs are visible/crawlable groups when populated, not menu-only content.
- Sources/methodology appear once as the complete trust area without repetitive warnings.

### Search and analysis

- Exact-order search distinguishes `123` from `321`.
- Any-order search finds all valid permutations while respecting repeated digits.
- Variant filtering supports Both, Midday and Evening.
- Month/date filtering changes the matching rows and every dependent metric.
- Public statistics include position frequency, variant comparison, repeated-digit distribution and sum distribution.
- Fireball is treated as a declared special value, not a fourth main digit.
- Every notable draw links to deterministic evidence.
- One complete Ask the Archive answer shows interpreted filters, matching count, rows and explanation.

### Generic behavior

- Single-value games contain no digit-position vocabulary.
- Unordered-pool games do not use exact-position controls.
- Special balls are compared separately from main groups.
- Multi-variant ordering comes from governed configuration/data, not alphabetical sorting.
- Rule-era and partial-coverage states suppress unsupported analysis.

### SEO and guard

- Critical archive content and review rows exist in server HTML.
- No infinite-scroll-only or click-only result history.
- Filter states create no indexable crawl trap.
- Preview metadata cannot present review fixtures as production facts.
- Guard off preserves current behavior and exposes no synthetic fixture text.
- No production canonical, sitemap entry, redirect or active archive ad is introduced.

### Responsive and accessibility

- Verified at 390 px and 1440 px.
- No page-level horizontal scrolling, overlap or clipped controls.
- Any wide table scrolls inside its own labelled container.
- Result date, drawing and values have a sensible screen-reader order.
- Month, filter, table/chart and Ask controls work by keyboard.
- Touch targets and focus behavior meet the project standard.

### Validation

- Existing test suite passes.
- New archive route/model/search/statistics/guard tests pass.
- Type-check passes.
- Lint passes with no new warnings.
- Production build passes.
- Runtime screenshots and measured overflow results are included in Claude's report.

## 19. Required Claude Deliverables

1. Concise pre-implementation review and conflict report.
2. Archive data-coverage matrix for `AR-01` through `AR-11`.
3. Reuse classification for every affected artifact.
4. Guarded `/fl/pick-3/2026` implementation.
5. Screenshots at 390 px and 1440 px.
6. Generic proof report for ordered digits, a single value, unordered pools and multiple variants.
7. Exact route and guard report.
8. Test, type-check, lint and build results.
9. `03-docs/04-page-specifications/archive/florida-pick-3-yearly-archive-v0-implementation.md`.
10. `03-docs/04-page-specifications/archive/florida-pick-3-yearly-archive-v0-founder-review.md`.
11. Final Git status with all pre-existing work preserved.

Stop after the guarded archive is ready for founder review. Recommend exactly one next task and do not execute it.
