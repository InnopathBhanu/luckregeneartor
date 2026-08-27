# LotteryCorner Yearly Results Archive Blueprint — Final Approved

**Document:** `06-lotterycorner-yearly-results-archive-blueprint-FINAL-APPROVED.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Version:** 1.0  
**Status:** Final approved and frozen blueprint  
**Approved date:** July 24, 2026  
**Page family:** Game-Year Historical Intelligence Hub  
**Routes:** Existing `/{game}/{year}` and `/{state}/{game}/{year}` patterns  
**Research authority:** `06-lotterycorner-yearly-results-archive-research-FINAL-APPROVED.md`

---

## 0. Blueprint Decision

The yearly archive is not another Game Page.

The Game Page owns the current game experience.

The Year Archive owns:

- the complete result history for one game/year;
- year-specific historical summary;
- compact result retrieval;
- year-scoped deterministic analysis;
- AI-assisted archive querying;
- historical checking;
- selected year context;
- links into advanced archive tools.

---

# PART I — PAGE MODES AND STRUCTURES

## 1. Archive Modes

### `YR-CURRENT`

Example:

```text
/powerball/2026
```

Page identity:

> Powerball Results 2026 — Year to Date

### `YR-CLOSED`

Example:

```text
/powerball/2025
```

Page identity:

> Powerball Results Archive — 2025

### `YR-RETIRED`

Example:

```text
/{retired-game}/{year}
```

Page identity:

> [Game] Historical Results — [Year]

## 2. Game Structures

### Structure A — National Jackpot Game Year

Examples:

- `/powerball/2025`
- `/mega-millions/2025`

### Structure B — State-Specific Game Year

Examples:

- `/fl/pick-3-evening/2021`
- `/ga/cash-3-midday/2024`

### Structure C — Conditional State Lens of a National Game

Existing example:

- `/ca/powerball/2025`

This structure is preserved only after SEO audit or when meaningful state-specific history is available.

---

# PART II — ARCHIVE-YEAR AND DATA RULES

## 3. Existing EST Logic

Use the existing LotteryCorner result-date and archive-year logic.

Do not:

- calculate archive year from browser timezone;
- introduce a new routing timezone;
- move historical draws between years during redesign.

The blueprint consumes the existing stored archive date/year.

## 4. Existing Game Identity

Use:

```text
gameId: <existing-game-id>
drawVariant: <existing-variant-if-applicable>
```

Do not rename or split games as part of the page redesign.

## 5. Completeness State

Every page exposes one of:

```text
COMPLETE
PARTIAL
UNDER_REVIEW
CORRECTED
```

The page receives a field-level completeness profile and suppresses unsupported metrics.

---

# PART III — PAGE ORDER

## 6. Final Anonymous Sequence

| Order | ID | Section |
|---:|---|---|
| 1 | AR-01 | Archive Identity, Year Status and Navigation |
| 2 | AR-02 | Year at a Glance |
| 3 | AD-AR00 | Post-Summary Advertisement |
| 4 | AR-03 | AI Year Brief |
| 5 | AR-04 | Month Navigation and Historical Timeline |
| 6 | AR-05 | Complete Compact Result List |
| 7 | AD-AR01 | Mid-Archive Advertisement |
| 8 | AR-06 | Search, Basic Filters and Ask the Archive |
| 9 | AR-07 | Selected Analysis and Notable Draws |
| 10 | AR-08 | Historical Tools Launcher |
| 11 | AD-AR02 | Post-Analysis Advertisement |
| 12 | AR-09 | News and Community Timeline |
| 13 | AR-10 | Data Access, Sources and Methodology |
| 14 | AR-11 | Current Game and Next Actions |
| 15 | AD-AR03 | Lower Advertisement |
| 16 | Footer | Game/year/state navigation |

## 7. Protected Priority

When present, these appear before ads and commerce:

- correction notice;
- partial-data warning;
- result-status issue;
- historical-check result;
- methodology/assumption warning;
- retired-game notice.

---

# PART IV — SECTION SPECIFICATIONS

## 8. AR-01 — Archive Identity and Navigation

### Visible Content

- game name;
- selected year;
- archive mode;
- previous/next valid year;
- current game page;
- earliest year;
- draw count;
- rule era;
- completeness/correction status.

### `YR-CURRENT`

H1:

`[Game] Results [Year] — Year to Date`

Supporting line:

`[Draw count] verified drawings from January 1 through [latest official draw date].`

### `YR-CLOSED`

H1:

`[Game] Results Archive — [Year]`

Supporting line:

`Complete [Year] winning-number archive with [draw count] verified drawings.`

### `YR-RETIRED`

Show:

- retired status;
- active period;
- historical-only purpose;
- no Buy action.

## 9. AR-02 — Year at a Glance

### Jackpot Game Cards

Up to six:

- total draws;
- jackpot-winning draws;
- largest jackpot;
- longest rollover run;
- median advertised jackpot;
- rule-era/data-coverage status.

Optional when complete:

- cash-to-annuity ratio;
- winner counts;
- largest cash value.

### State Daily Game Cards

Up to six:

- total draws;
- variant counts;
- doubles/triples;
- unique exact results;
- repeat exact results;
- most common approved sum band.

### Rules

- current year values labelled YTD;
- no unsupported metric;
- no duplicated jackpot-total metric;
- every value links to method or matching rows where useful.

## 10. AR-03 — AI Year Brief

### Visible Block

Heading:

`What defined [Game] in [Year]?`

Content:

- 3–5 concise verified observations;
- one year-over-year context point;
- one notable draw link;
- one related tool;
- source/data-coverage disclosure.

### Current Year

Label:

`AI Year-to-Date Brief`

### Closed Year

Label:

`LotteryCorner Historical Brief`

### Retrospective Label

When generated after the archived year:

`LotteryCorner Research retrospective generated in [generation year].`

## 11. AR-04 — Month Navigation and Timeline

Required:

- January–December anchors or valid active months;
- draw count by month;
- jackpot-won markers for jackpot games;
- rule/news markers when verified;
- selected month state.

Mobile:

- compact month selector plus accessible month links;
- no swipe-only navigation.

## 12. AR-05 — Complete Result List

### Desktop

Compact semantic table/list.

### Mobile

Compact stacked result row.

### National Jackpot Row Template

- date;
- winning balls;
- special ball;
- Power Play when applicable;
- linked Double Play summary when applicable;
- jackpot;
- cash value when complete;
- win/rollover;
- winner count when complete;
- actions.

Actions:

- Check;
- Analyze;
- Discuss;
- Expand details.

### State Daily Game Row Template

- date;
- variant;
- result;
- add-on;
- top prize when complete;
- double/triple;
- approved sum/root;
- actions.

### Row Detail

Default inline/drawer detail:

- source status;
- additional metrics;
- news/discussion links;
- correction note;
- full method links.

No blanket new draw-page generation.

## 13. AR-06 — Search, Filters and Ask the Archive

### Basic Search

- date/month;
- exact number;
- contains numbers;
- variant;
- jackpot status;
- Power Play/Double Play availability;
- double/triple;
- sum;
- odd/even;
- high/low.

### AI Query

Input placeholder:

`Ask about [Game] results in [Year]…`

Example prompts:

- `Show all draws containing 22.`
- `Find drawings with three odd white balls.`
- `Show doubles in March.`
- `Which jackpot run lasted the longest?`

### Output

- interpreted query;
- applied filters;
- matching count;
- matching rows;
- plain-language explanation;
- Save Search;
- Compare;
- Open Archive Explorer.

### Access

- limited public query count;
- signed-in save/history;
- Insider multi-year and advanced combined conditions.

## 14. AR-07 — Selected Analysis and Notable Draws

### Free Analysis

Select 3–6 depending on game:

- frequency;
- gaps;
- odd/even;
- high/low;
- sum;
- range;
- pairs;
- jackpot timeline;
- previous-draw repeats;
- daily-game positions/doubles.

### Notable Draws

Maximum five.

Each requires:

- metric;
- value;
- historical percentile/rank;
- deterministic reason;
- matching row;
- AI explanation.

## 15. AR-08 — Historical Tools Launcher

Cards link into accepted tools:

- Check My Numbers Across History;
- Compare Years;
- Archive Explorer;
- Rule-Era Comparison;
- System Lab;
- Number History;
- Ticket Portfolio Analyzer;
- CSV/PDF Report;
- Jackpot History;
- Tax/Cash/Annuity tools where relevant.

### Access Labels

- Public;
- Sign in to run/save;
- Insider.

Do not fully embed all advanced tools on the year page.

## 16. AR-09 — News and Community Timeline

Show only real content:

- dated news;
- winner stories;
- rule changes;
- real archived discussions;
- current retrospective discussion;
- LotteryCorner Research note.

Every retrospective is labelled with its actual generation date.

## 17. AR-10 — Data Access, Sources and Methodology

Required:

- archive completeness;
- last verified;
- correction status;
- rule era;
- methodology;
- source links;
- export availability;
- data-rights limitation;
- correction/report issue action.

### Export Access

Public:

- print/copy;
- limited sample when permitted.

Signed-in:

- saved filtered export when permitted.

Insider:

- full export/report only after rights approval.

## 18. AR-11 — Current Game and Next Actions

Controlled actions:

1. Return to current game.
2. Open current-year archive.
3. Compare another year.
4. Check numbers.
5. Generate numbers.
6. Save search.
7. Follow game.
8. Join current discussion.
9. Buy Tickets only when allowed by mode and context.

### Buy Suppression

No Buy directly after:

- loss;
- partial historical overlap;
- negative backtest;
- claim;
- Responsible Play state.

No Buy in `YR-RETIRED`.

---

# PART V — MODE BEHAVIOR

## 19. `YR-CURRENT`

Additional elements:

- next draw;
- current jackpot;
- result alerts;
- current discussion;
- latest month open by default.

SEO:

- meaningful `lastmod` after verified draws or material updates;
- title and description use YTD language.

## 20. `YR-CLOSED`

Additional elements:

- completed-year summary;
- final year comparison;
- top annual events;
- stable generated brief.

SEO:

- `lastmod` changes only after correction or material content change.

## 21. `YR-RETIRED`

Additional elements:

- retired notice;
- last active date/year;
- complete historical navigation;
- successor only when genuine.

SEO:

- preserved canonical archive;
- no current-game or Buy implication.

---

# PART VI — FREE, SIGNED-IN AND INSIDER

## 22. Public

- complete result history;
- navigation;
- year summary;
- AI brief;
- selected charts;
- basic filter;
- limited Ask the Archive;
- one-number-set historical check;
- real news/community;
- sources.

## 23. Signed-In

- saved search;
- saved numbers;
- alerts;
- comparison history;
- discussion;
- filtered export when permitted;
- AI continuity.

## 24. Insider

- unlimited multi-year Ask the Archive;
- advanced filters;
- batch checks;
- Archive Explorer;
- System Lab;
- rule-era compare;
- workspaces;
- advanced reports and exports;
- custom analysis.

---

# PART VII — CONTENT AND DATA CONTRACTS

## 25. `GameYearArchive`

```text
gameId
archiveYear
mode
canonicalRoute
firstDraw
lastDraw
drawCount
ruleEraSegments
completenessProfile
correctionStatus
```

The archive year is supplied by the existing EST-based application logic.

## 26. `GameYearMetrics`

```text
gameId
archiveYear
computedAt
drawCount
metricSet
methodologyVersion
coverageRequirements
```

## 27. `GameYearAISnapshot`

```text
gameId
archiveYear
mode
modelVersion
metricVersion
generatedAt
claims
supportingEvidence
notableDraws
invalidatedAt
```

## 28. Correction Invalidation

A corrected draw invalidates:

- result row;
- annual summary;
- metrics;
- AI brief;
- query cache;
- checks;
- backtests;
- exports;
- charts;
- current-fact community banner;
- social image.

---

# PART VIII — SEO, SCHEMA AND ROBOTS

## 29. Canonical Routes

Preserve existing annual routes.

National-game annual state pages require separate audit.

## 30. Metadata Templates

### Current Year

Title:

`[Game] Results [Year]: Winning Numbers — Year to Date | LotteryCorner`

Description:

`View verified [Game] winning numbers for [Year], browse results by month, search the archive and explore year-to-date analysis.`

### Closed Year

Title:

`[Game] Results [Year]: Winning Numbers Archive | LotteryCorner`

Description:

`Browse the complete [Year] [Game] winning-number archive, annual summary, historical analysis and searchable draw history.`

### State Game

Title:

`[State] [Game] Results [Year]: Winning Numbers Archive | LotteryCorner`

## 31. Robots and Filters

- annual canonical pages: index/follow when valid;
- arbitrary filter/query states: not indexable by default;
- empty/invalid search: no standalone indexable page;
- future/invalid year: 404;
- partial valid archive: indexable with visible warning when useful.

## 32. Structured Data

Conceptual:

- WebPage/CollectionPage;
- BreadcrumbList;
- ItemList only for visible rows;
- Dataset only for a governed dataset release.

No hidden AI claims in structured data.

## 33. Social

Fixed game/year image and description.

Never include private numbers or personal results.

---

# PART IX — ADVERTISING AND PERFORMANCE

## 34. Ad Anchors

- `AD-AR00-AFTER-SUMMARY`
- `AD-AR01-BETWEEN-MONTHS`
- `AD-AR02-AFTER-ANALYSIS`
- `AD-AR03-LOWER`

Exact current production slot IDs and dimensions require audit.

## 35. Performance

- compact result markup;
- server-visible content;
- precomputed closed-year metrics;
- cached AI snapshot;
- lazy charts below core history;
- no infinite-scroll dependency;
- accessible month/pagination links.

---

# PART X — SECTION INTELLIGENCE MATRIX

## 36. Matrix

| Section | Immediate job | Canonical owner | Update | Deterministic intelligence | AI role | Primary action | Access | Affiliate | Ad tier | Stale/partial behavior |
|---|---|---|---|---|---|---|---|---|---|---|
| AR-01 | orient by year | Archive aggregate | draw/year state | draw count/status | explain status | navigate | public | current-year only | 0 | warning |
| AR-02 | understand year | Metrics snapshot | draw/correction | year metrics | explain | matching rows | public | none | 0 | suppress fields |
| AR-03 | understand story | AI snapshot | scheduled/material | evidence links | core | explore | public | contextual | 0 | hide/regenerate |
| AR-04 | move through year | Archive index | draw | month counts | none | month | public | none | 0 | valid months |
| AR-05 | find results | Draw records | event/correction | result facts | optional explanation | check/analyze | public | no row CTA | 0 | row status |
| AR-06 | query history | Archive query service | request | filters/results | translate/explain | save/query | tiered | none | 0 | show coverage |
| AR-07 | analyze | Metrics/notability | draw/method | charts/ranks | explain | tool/draw | selected free | contextual | 1 | suppress |
| AR-08 | advanced research | Tool registry | release/data | tool outputs | configure | launch tool | tiered | selected | 1 | per tool |
| AR-09 | historical context | Editorial/community | publish | date/entity links | summary/research | article/thread | public/sign-in | minimal | 2 | authentic only |
| AR-10 | trust/export | Source/rights registry | review | coverage | explain | methodology/export | tiered | prohibited | 0 | clear limitation |
| AR-11 | continue | Momentum service | current context | eligibility | assist | game/tool/follow | public/sign-in | controlled | 1 | suppression |

---

# PART XI — ACCEPTANCE CRITERIA

Approve implementation only when:

1. Existing annual URLs are preserved.
2. Existing EST-based archive-year logic is reused.
3. Current, closed and retired modes work.
4. National and state-game ownership is clear.
5. Result list is complete and compact.
6. High-frequency games remain crawlable without infinite scroll.
7. Partial data suppresses unsupported metrics.
8. Ask the Archive shows interpreted filters.
9. AI claims link to evidence.
10. Historical overlap language is neutral.
11. Financial backtests require complete historical payout data.
12. Historical community content is authentic.
13. Export/API rights are approved.
14. Filters do not create crawl traps.
15. Ads do not interrupt result rows or protected workflows.
16. Buy suppression follows the constitution.
17. Metadata/schema reflect visible content.
18. Corrections invalidate every derived output.
19. Performance and accessibility meet the project standard.
20. Search and product metrics are instrumented.

---

## Final Approval

This blueprint is approved and frozen as Version 1.0.
