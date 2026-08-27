# LotteryCorner Yearly Results Archive Research

**Document:** `06-lotterycorner-yearly-results-archive-research.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Research subject:** Existing annual result URLs such as `/powerball/2026` and `/fl/pick-3-evening/2021`  
**Status:** Research and product recommendation — not yet a frozen blueprint  
**Date:** July 24, 2026  
**Scope:** U.S. lottery games only  

---

## Executive Decision

LotteryCorner should preserve the established annual archive pattern:

```text
/powerball/2026
/powerball/2025
/mega-millions/2026
/fl/pick-3-evening/2026
/fl/pick-3-evening/2021
```

The pages should no longer be treated as simple lists of winning numbers.

They should become:

> **Historical Results and Intelligence Hubs for one game and one calendar year.**

The yearly archive is one of LotteryCorner’s strongest defensible assets because it combines:

- permanent search demand;
- up to approximately 30 years of owned historical data;
- high page volume with stable, meaningful URLs;
- deterministic analytical opportunities;
- AI explanation and natural-language querying;
- number checking;
- systems and backtesting;
- community discussion;
- downloadable and premium data services;
- strong internal links to current results, tools, guides and Buy Tickets.

The annual archive should remain useful even if the user never signs in. Premium value should come from deeper querying, comparison, saving, export, automation and personalized research—not from hiding the underlying winning numbers.

---

# PART I — CURRENT LOTTERYCORNER STRUCTURE

## 1. Existing URL Pattern

LotteryCorner already uses human-readable year URLs rather than a generic `/results` route.

Examples confirmed through the existing site and indexed search results include:

```text
/fl/pick-3-evening/2026
/fl/pick-3-evening/2015
/fl/pick-3-midday/2012
/ca/powerball/2026
/va/powerball/2025
/ca/mega-millions/2026
```

The founder confirms that national annual pages also follow:

```text
/powerball/{year}
/mega-millions/{year}
```

### Decision

Do not introduce `/powerball/results` merely because competitors or official sites use that structure.

The existing annual routes are clear, descriptive and already have years of internal and external history.

## 2. Current Page Content

Search-engine extracts show that the annual pages primarily provide:

- page title and archive year;
- draw date;
- winning numbers;
- jackpot or top prize;
- Power Play;
- Double Play on applicable Powerball pages;
- Fireball or similar state-game add-ons;
- occasional “Read more” actions;
- game/year navigation.

This is useful raw information, but it underuses the dataset.

## 3. Current Search Visibility Finding

Searches for LotteryCorner annual Powerball pages predominantly surfaced state-level copies such as:

- California Powerball 2026;
- Virginia Powerball 2026;
- Texas Powerball 2026;
- Michigan Powerball 2026;
- Puerto Rico Powerball 2026.

The root `/powerball` page surfaced, but the root `/powerball/2026` page did not surface in the searches performed for this research, despite the founder confirming that the route exists.

### Interpretation

This does not prove the national year page is absent or unindexed.

It is a strong signal to audit:

- canonical tags;
- internal-link prominence;
- sitemap inclusion;
- title/H1 differentiation;
- duplicate state archives;
- Google Search Console indexation;
- backlinks and query ownership.

## 4. National-Game Duplication Risk

Powerball and Mega Millions have one national draw series.

If the same annual result list is reproduced for every state and year, search engines may encounter many near-identical archives whose only material difference is the state label.

The current search results demonstrate that many state Powerball and Mega Millions annual pages are already discoverable.

### Recommendation

Do not delete or redirect those URLs immediately.

First classify every annual national-game state page through Search Console and analytics:

- impressions;
- clicks;
- ranking queries;
- backlinks;
- affiliate revenue;
- state-specific content;
- indexed canonical;
- historical traffic.

Then choose one of three outcomes:

### A. Strengthen as a State Lens

Keep `/{state}/powerball/{year}` when it can provide real state-specific value:

- state winner counts;
- state jackpot/second-prize winners;
- winning retailers;
- Double Play participation;
- local prize treatment;
- local news and winner stories;
- state discussion;
- state claims context.

### B. Preserve Temporarily

Keep the route while the national archive and internal linking are rebuilt.

### C. Consolidate Carefully

Only after evidence shows no meaningful state value or SEO equity, consolidate to `/powerball/{year}` using an approved redirect/canonical migration.

---

# PART II — MARKET AND COMPETITOR RESEARCH

## 5. Official Game Sites

### Powerball

The official Powerball site offers:

- previous-result search;
- game selection;
- start and end dates;
- Check Your Numbers;
- drawing video;
- winner stories.

Its strength is authoritative filtering and result verification.

Its weakness as an archive experience is limited editorial and analytical context.

### Mega Millions

The official Mega Millions site offers:

- previous-drawing search;
- start/end date filtering;
- draw date;
- winning numbers;
- historic Megaplier fields where applicable.

Its role is authoritative lookup, not deep historical exploration.

### Opportunity for LotteryCorner

LotteryCorner should not imitate official sites by becoming only a date-search utility.

It should combine trustworthy historical records with:

- annual narrative;
- transparent analysis;
- AI explanation;
- saved research;
- tools;
- discussions;
- premium workflows.

## 6. LottoNumbers

Its Mega Millions 2025 archive demonstrates several useful patterns:

- direct annual URL;
- links across all available years;
- month anchors;
- date;
- winning numbers;
- jackpot;
- lump-sum value;
- winner count;
- payout-detail links.

### Lesson

A year page becomes more useful when each row contains more than numbers and users can move quickly by month and year.

## 7. Lotto.net

Its Powerball annual archive includes:

- yearly navigation back to 1992;
- full draw list;
- jackpot amount;
- jackpot won versus rollover state;
- Power Play;
- prize-breakdown links.

### Lesson

The annual page can act as the index for individual draw exploration without requiring the user to begin with a search form.

## 8. USA Mega

Its Powerball history presents:

- numbers;
- jackpot;
- Power Play;
- Double Play;
- links to individual draw details;
- direct links to Ways to Win and Statistics.

### Lesson

History should connect horizontally to statistics and vertically to each draw.

## 9. LotteryUSA

Its Florida Pick 3 annual view provides a fast, compact list of:

- date;
- result;
- Fireball;
- top prize.

### Lesson

For daily games, density and scanability are essential. Heavy cards for hundreds of draws would damage usability.

## 10. LotteryPost Premium Model

LotteryPost explicitly monetizes:

- historical drawing data;
- statistics;
- powerful past-result searches;
- custom result searches;
- wheels;
- positional analysis;
- pairs and combinations;
- VTracs;
- advanced filters.

### Strategic implication

Historical data itself creates willingness to pay when the product provides:

- powerful query capability;
- saved workflows;
- advanced analysis;
- large date ranges;
- multiple filters;
- systems;
- exports;
- community expertise.

LotteryCorner can compete with a simpler experience and AI-assisted querying rather than copying LotteryPost’s interface or terminology wholesale.

## 11. Downloadable Data Demand

Official and public-data sources provide historical lottery results as:

- CSV;
- open-data datasets;
- PDFs;
- date-search pages.

Third-party APIs sell historical result retrieval and statistical data.

### Strategic implication

LotteryCorner’s cleaned and normalized 30-year database can support:

- member CSV exports;
- premium research downloads;
- API access later;
- embeddable widgets;
- scheduled reports;
- data provenance and correction logs.

This is a separate opportunity from affiliate ticket sales.

---

# PART III — WHAT THE YEAR PAGE SHOULD BECOME

## 12. Page Purpose

The yearly archive should answer:

1. What were all the results in this year?
2. What were the major events and jackpot runs?
3. How can I find a specific draw or number?
4. How did the year compare with another year?
5. When did my numbers appear?
6. What statistical properties did the draws have?
7. What changed in the game rules?
8. What did players discuss during notable draws?
9. What can I do next with this history?
10. Which advanced research is available after sign-in or through Insider?

## 13. Recommended Page Name

User-facing:

> **Powerball Results Archive — 2025**

or:

> **Florida Pick 3 Evening Results — 2021 Archive**

Internal page family:

> **Game-Year Historical Intelligence Hub**

## 14. Page Identity

### National game

```text
gameId: us-powerball
year: 2025
route: /powerball/2025
```

### State-specific game

```text
gameId: fl-pick3-evening
year: 2021
route: /fl/pick-3-evening/2021
```

The year page is an aggregate view of the game’s governed DrawEvent records.

It is not another copy of the Game Page.

---

# PART IV — RECOMMENDED YEAR-PAGE SECTIONS

## 15. YR-01 — Year Header and Navigation

Required:

- game name;
- selected year;
- previous/next year;
- current game page;
- earliest available year;
- number of draws available;
- rule era(s) covered;
- updated/correction status.

Example:

> Powerball Results Archive — 2025  
> 156 drawings · January 1–December 31 · Current matrix era

## 16. YR-02 — Year at a Glance

For jackpot games:

- total drawings;
- jackpot wins;
- largest advertised jackpot;
- largest cash value;
- longest rollover run;
- average/median advertised jackpot;
- total jackpot advertised across drawings, clearly defined;
- number of drawings with Double Play data;
- rule changes in the year;
- first and last draw.

For daily/state games:

- total drawings;
- drawings by variant;
- doubles/triples count;
- most common sum range;
- most common odd/even split;
- Fireball/add-on distribution;
- number of unique exact combinations;
- repeat combinations;
- longest gap between repeated exact results.

These are historical descriptions, not forecasts.

## 17. YR-03 — AI Year Brief

A concise generated explanation grounded in deterministic metrics.

Examples:

- “What defined Powerball in 2025?”
- “The three biggest jackpot runs”
- “The most structurally unusual draws”
- “How 2025 differed from 2024”
- “Rule changes that affected comparison”
- “What players discussed during the largest jackpot”

Every statement links to:

- a draw;
- a metric;
- a chart;
- a news article;
- or a discussion.

AI should not produce unsupported narrative filler.

## 18. YR-04 — Month Navigation and Timeline

Provide:

- January–December anchors;
- draw counts by month;
- jackpot-won markers;
- major rule/news markers;
- fast jump to month.

For high-frequency state games, allow:

- month;
- week;
- midday/evening;
- draw variant.

Do not create indexable URLs for every possible filter by default.

## 19. YR-05 — Historical Result List

The complete year remains the central content.

### Jackpot-game row

- date;
- winning numbers;
- Powerball/Mega Ball;
- Power Play;
- linked Double Play result where applicable;
- jackpot;
- cash value if available;
- rollover/jackpot won;
- winner count if governed;
- Analyze;
- Check My Numbers;
- Discuss.

### Pick 3/Pick 4 row

- date;
- draw variant;
- result;
- Fireball/Wild Ball;
- top prize;
- straight/box classification;
- doubles/triples indicator;
- sum/root where approved;
- Check;
- Analyze;
- Discuss.

### Display requirement

Use a compact table/list on desktop and a compact stacked row on mobile.

Do not render hundreds of large result cards.

## 20. YR-06 — Search and Filter This Year

Free basic filters:

- month/date;
- exact number;
- contains number(s);
- jackpot won/rollover;
- draw variant;
- Power Play;
- Double Play available;
- doubles/triples;
- sum range;
- odd/even;
- high/low.

Advanced filters:

- number positions;
- pairs/triples;
- gap range;
- decade distribution;
- consecutive numbers;
- repeated from previous draw;
- rule era;
- multiple combined conditions.

## 21. YR-07 — Ask the Archive

Natural-language historical querying.

Example questions:

- “Show every 2025 Powerball drawing containing 22.”
- “Which 2025 drawings had three odd and two even white balls?”
- “When did 4 and 22 appear together?”
- “Find draws with a sum between 120 and 150.”
- “Which jackpot run lasted the longest?”
- “Show Florida Pick 3 Evening doubles in March 2021.”
- “How often did 317 appear boxed in 2021?”
- “Compare midday and evening digit 7 during 2021.”
- “Find drawings structurally similar to July 22.”

AI converts the question into transparent deterministic filters.

The page shows:

- interpreted query;
- filters applied;
- matching draw count;
- result rows;
- explanation;
- save-search action.

## 22. YR-08 — Year Analysis

Selected free modules:

- number frequency;
- current-year gap;
- pair frequency;
- odd/even;
- high/low;
- sums;
- spread/range;
- decade distribution;
- consecutive-number rate;
- repeats from previous draw;
- jackpot timeline.

State daily games may add:

- digit-position frequency;
- exact/boxed frequency;
- doubles/triples;
- pair families;
- root/sum;
- midday/evening comparison.

Every chart states:

- game ID;
- year;
- rule era;
- number of draws;
- method;
- last updated.

## 23. YR-09 — Most Interesting Draws

Automatically nominate a limited set:

- largest jackpot;
- jackpot won;
- longest rollover end;
- highest/lowest sum;
- widest/narrowest spread;
- most consecutive values;
- repeated exact state-game result;
- rare double/triple pattern;
- rule-era first/last draw.

AI explains why each is noteworthy without suggesting predictive value.

## 24. YR-10 — Compare Years

Free:

- selected year versus previous year;
- draw count;
- jackpot milestones;
- high-level structural comparison.

Signed-in/Insider:

- any two years;
- multiple years;
- rule-era normalization;
- custom metrics;
- saved comparison;
- export.

## 25. YR-11 — Check My Numbers Against the Year

Allow users to enter:

- one number set;
- multiple saved sets;
- exact date or full year;
- main and add-on games.

Output:

- exact matches;
- partial matches;
- best historic match;
- matching dates;
- potential historical prize under that draw’s rule era, when enough data exists.

This is a major sign-in and premium opportunity.

## 26. YR-12 — Systems and Backtesting

The archive can evaluate a system historically.

Examples:

- number-selection rule;
- fixed-number system;
- wheel;
- Pick 3 filter;
- user-created strategy.

Output:

- draws tested;
- tickets generated;
- total historical cost;
- historical matches;
- historical payout only when prize data is complete;
- assumptions and missing data;
- no claim of future predictive performance.

Free/sample:

- limited period or sample system.

Insider:

- full year/multi-year;
- saved systems;
- comparisons;
- exports;
- scheduled report.

## 27. YR-13 — Year News and Community Timeline

Connect dated events to the archive:

- jackpot wins;
- rule changes;
- winner stories;
- unusual events;
- major forum discussions;
- LotteryCorner Research Notes.

This turns static history into a replayable story.

## 28. YR-14 — Download and Data Access

Possible levels:

### Public

- print;
- copy selected draw;
- limited CSV sample;
- methodology.

### Signed-in

- export filtered rows;
- saved query;
- personal report.

### Insider

- full year CSV;
- multiple-year export;
- advanced metrics;
- generated research report;
- scheduled monthly/yearly archive report.

### Future Data/API Tier

- governed API key;
- rate limits;
- game/year endpoints;
- correction feed;
- attribution/licence terms;
- commercial use pricing.

## 29. YR-15 — Continue the Journey

Recommended next actions:

- current game page;
- next draw countdown;
- generate numbers;
- save a filter;
- Buy Tickets when supported;
- compare another year;
- open statistics;
- ask AI;
- follow the game;
- join the current discussion.

---

# PART V — AI OPPORTUNITIES

## 30. AI Should Operate in Four Layers

### Layer 1 — Explanation

Explain:

- a row;
- a draw;
- a chart;
- a year metric;
- a rule-era difference.

### Layer 2 — Query Translation

Convert natural language into filters and deterministic queries.

### Layer 3 — Historical Synthesis

Create:

- annual brief;
- monthly recap;
- jackpot-run summary;
- year comparison;
- notable-draw explanation.

### Layer 4 — Personalized Research

Use the user’s saved numbers, systems and questions to produce a governed historical report.

## 31. AI Insight Catalog

### Annual Story

> What happened in this game during the year?

### Draw Fingerprint

- sum;
- range;
- odd/even;
- high/low;
- decades;
- consecutive numbers.

### Historical Similarity

Find similar draws from:

- same game ID;
- compatible rule era;
- explicit metric definition.

### Exact/Partial Appearance

Find when a number or set appeared:

- exact;
- unordered;
- partial;
- positional;
- boxed;
- with/without special ball.

### Gap Analysis

Explain:

- current gap;
- year maximum;
- historical percentile;
- independence and overdue-number caution.

### Jackpot Story

- rollover sequence;
- growth;
- winner event;
- cash/annuity relationship;
- related news.

### State Daily-Game Analysis

- position;
- pair;
- sum;
- doubles/triples;
- midday/evening;
- add-on.

### Personal Archive Assistant

Examples:

- “Have my saved numbers ever matched four?”
- “Which of my ten sets had the best historical match?”
- “Did my system perform differently in 2024 and 2025?”
- “Show all draws matching my filter.”

## 32. AI Safety and Trust

Official lottery sources describe draw games as random and do not support claims that historical patterns forecast the next winning combination.

Therefore:

- historical patterns are descriptive;
- “hot,” “cold” and “overdue” require clear explanation;
- AI cannot promise improved odds;
- system backtests cannot be presented as future performance;
- premium pricing must sell convenience, depth, workflow and analysis—not certainty.

---

# PART VI — PREMIUM AND REVENUE MODEL

## 33. Free Page Value

Keep free:

- complete annual result list;
- year navigation;
- month anchors;
- basic year summary;
- basic filtering;
- one-number-set check;
- selected basic charts;
- limited Ask the Archive;
- current year news/community links;
- ads;
- Buy Tickets continuation.

This protects SEO, AI discovery and trust.

## 34. Signed-In Value

- save searches;
- save number sets;
- compare with saved tickets;
- alerts when new result matches a saved condition;
- saved year comparisons;
- filtered exports;
- AI conversation continuity;
- discussion participation.

## 35. Insider Value

Strong candidates:

- unlimited Ask the Archive;
- full 30-year queries;
- multi-condition filters;
- advanced pairs/triples/positions;
- rule-era comparison;
- multi-year comparison;
- batch number checking;
- system backtesting;
- saved research workspaces;
- advanced exports;
- generated PDF/CSV reports;
- AI Research Notes;
- chart customization;
- no arbitrary limit on saved filters.

## 36. Possible Premium Products

### Archive Explorer

A full multi-year historical query engine.

### AI Lottery Researcher

Natural-language analysis with transparent filters and citations.

### Ticket Portfolio Analyzer

Checks and compares many saved number sets across history.

### System Lab

Build, backtest, compare and track systems.

### Data Download Pass

One-time or subscription access to governed CSV exports.

### Lottery Data API

Later B2B/developer product.

### Annual Research Report

Paid generated report for a selected game/year/rule era.

## 37. Monetization Balance

Year pages can support:

- standard display ads;
- affiliate Buy Tickets after analytical actions;
- Insider conversion;
- data/export revenue;
- email/app return loops.

Avoid:

- ad insertion inside result rows;
- Buy pressure after a loss;
- premium claims implying prediction;
- blocking the historical numbers required for search value.

---

# PART VII — SEO AND AI-DISCOVERY STRATEGY

## 38. Preserve Annual URLs

Recommended canonical routes:

```text
/powerball/2026
/mega-millions/2026
/fl/pick-3-evening/2021
```

Do not replace them with `/results` routes.

## 39. Title and H1

### National game

Title:

`Powerball Results 2025: Winning Numbers & Jackpot Archive | LotteryCorner`

H1:

`Powerball Results Archive for 2025`

### State game

Title:

`Florida Pick 3 Evening Results 2021: Winning Numbers Archive | LotteryCorner`

H1:

`Florida Pick 3 Evening Results — 2021 Archive`

## 40. Unique Annual Content

Each year page needs true computed uniqueness:

- draw count;
- year metrics;
- notable events;
- rule-era information;
- year-specific AI summary;
- jackpot timeline;
- unique news/discussion links.

Do not create generic paragraphs with only the year substituted.

## 41. Internal Linking

Every annual page should link to:

- current game page;
- previous and next available years;
- all-year directory;
- relevant tools;
- selected draw/month anchors;
- guides;
- news;
- community;
- state offering where applicable.

Search engines generally do not submit forms or use dropdowns like users. Important year pages need normal crawlable links.

## 42. Month and Filter URLs

Use month anchors initially:

```text
/powerball/2025#december
```

Do not index every filter combination.

Filters may use UI state or query parameters, but:

- canonical stays on the year page;
- invalid/empty combinations are not linked;
- high-demand permanent views require separate approval;
- avoid faceted-navigation URL explosion.

## 43. Current Versus Past Year

### Current year

- updates after every verified draw;
- meaningful sitemap `lastmod`;
- current-year AI brief may refresh;
- correction-aware cache invalidation.

### Closed historical year

- stable;
- `lastmod` changes only for data correction or meaningful content addition;
- AI summaries can be precomputed and cached.

## 44. Structured Data

Conceptual:

- `CollectionPage` or `WebPage`;
- `BreadcrumbList`;
- visible `ItemList` only when it faithfully represents the visible draw collection;
- `Dataset` only if LotteryCorner exposes a genuine downloadable dataset and data catalogue.

Google has clarified that Dataset structured data is for Dataset Search rather than ordinary Google Search rich results. It should not be treated as a ranking shortcut.

## 45. Server-Visible Content

Initial HTML should contain:

- H1;
- year summary;
- year navigation;
- complete or crawlably paginated result list;
- month anchors;
- rule-era note;
- source/methodology;
- primary tool and archive links.

AI interaction and advanced charts may enhance the page client-side, but they cannot be the only unique content.

## 46. Pagination and Mobile

A Powerball year has a manageable number of draws and may support a server-rendered view-all page.

Daily games may contain hundreds of draws.

For high-frequency games:

- use server-visible pagination or month sections;
- preserve crawlable component URLs only if required by performance;
- keep the annual page as the canonical year hub;
- do not rely solely on infinite scroll;
- ensure mobile and desktop contain equivalent historical data.

## 47. Sitemap Architecture

Create or maintain archive sitemaps grouped by:

- national game;
- state;
- game;
- year.

Past years should not receive artificial daily `lastmod` changes.

## 48. AI-Bot Readability

Provide:

- concise year summary;
- tables with semantic headers;
- exact dates;
- game ID and rule era;
- source/provenance;
- methodology;
- correction history;
- stable headings and anchors;
- downloadable data terms where offered.

---

# PART VIII — DATA AND TECHNICAL ARCHITECTURE

## 49. Core Aggregate

```text
GameYearArchive
- gameId
- calendarYear
- canonicalRoute
- firstDrawAt
- lastDrawAt
- drawCount
- ruleEraSegments
- completenessStatus
- correctionStatus
```

## 50. Year Metrics Snapshot

```text
GameYearMetrics
- gameId
- year
- computedAt
- drawCount
- frequency
- gapMetrics
- pairMetrics
- patternMetrics
- jackpotMetrics
- variantMetrics
- methodologyVersion
```

## 51. AI Year Snapshot

```text
GameYearAISnapshot
- gameId
- year
- modelVersion
- sourceMetricVersion
- generatedAt
- summary
- notableDrawIds
- claims
- supportingEvidence
- invalidatedAt
```

Precomputed summaries reduce cost and improve consistency.

## 52. Query Service

The Ask the Archive service should:

1. identify the game ID;
2. identify the year/date range;
3. parse the request into a supported query model;
4. show interpreted filters;
5. call the deterministic archive engine;
6. return matching draws and metrics;
7. let AI explain;
8. offer save/export.

## 53. Rule-Era Integrity

A year can contain more than one rule era.

The archive must:

- segment metrics;
- warn when combined;
- use the correct number matrix;
- use historical prize rules for checking;
- avoid comparing impossible numbers across eras without normalization.

## 54. Provenance

Each draw and important metric should carry:

- source reference;
- source draw date;
- imported/verified time;
- correction status;
- game rule era;
- completeness for jackpot, winners and payouts.

## 55. Correction Propagation

A corrected result must invalidate:

- year list;
- metrics;
- AI brief;
- Ask the Archive result cache;
- saved-number checks;
- system backtests;
- exports;
- charts;
- discussion fact banner;
- social image.

---

# PART IX — PRODUCT ROADMAP

## 56. Phase 1 — Rebuild the Annual Archive

- preserve URLs;
- redesign compact result list;
- year and month navigation;
- year-at-a-glance metrics;
- basic filters;
- Check My Numbers;
- selected analysis;
- current game/tools links;
- source and rule-era display;
- SEO/server rendering;
- ad placements.

## 57. Phase 2 — AI and Engagement

- AI Year Brief;
- Ask the Archive;
- notable draws;
- historical analogs;
- year comparison;
- draw/community timeline;
- save searches;
- alerts;
- AI Quick Takes.

## 58. Phase 3 — Insider Research

- full multi-year search;
- advanced filters;
- batch ticket checking;
- System Lab/backtesting;
- advanced comparison;
- CSV/PDF exports;
- saved workspaces;
- custom reports.

## 59. Phase 4 — Data Products

- downloadable datasets;
- API;
- widgets;
- correction feed;
- institutional/research plans.

---

# PART X — KEY DECISIONS FOR THE BLUEPRINT

Before freezing the page blueprint, approve:

1. Annual URL preservation.
2. Historical Intelligence Hub positioning.
3. Free versus Insider access.
4. Whether individual draws open inline or receive separate URLs later.
5. State Powerball/Mega Millions annual-page treatment after SEO audit.
6. Basic and advanced filters.
7. AI Year Brief and Ask the Archive.
8. Year comparison.
9. Batch checking and System Lab.
10. Export/API roadmap.
11. Annual-page ad tier.
12. Result-list density and pagination.
13. Rule-era and provenance model.
14. Search/schema/social contracts.

---

# PART XI — FINAL RECOMMENDATION

The next blueprint should be:

```text
06-lotterycorner-yearly-results-archive-blueprint.md
```

It should define one adaptive template with two modes:

### Mode A — National Jackpot Game Year

Examples:

- `/powerball/2025`
- `/mega-millions/2025`

### Mode B — State-Specific Game Year

Examples:

- `/fl/pick-3-evening/2021`
- `/ga/cash-3-midday/2024`

The blueprint should not create a generic `/results` route.

It should not repeat the Game Page.

Its job is to turn each year of LotteryCorner’s historical dataset into:

> **a searchable, explainable, discussable and monetizable historical product.**

---

# SOURCE REGISTER

## LotteryCorner pages observed

- LotteryCorner Powerball current page
- LotteryCorner Mega Millions current page
- California Powerball 2026 archive
- Virginia Powerball 2025/2026 archives
- Texas Powerball 2026 archive
- Florida Pick 3 Evening 2015/2026 archives
- Florida Pick 3 Midday 2012/2017 archives
- California Mega Millions 2026 archive

## Official sources

- Powerball Previous Results
- Mega Millions Previous Drawings
- Florida Lottery Winning Numbers and Integrity
- Texas Lottery downloadable Powerball CSV
- New York Open Data Powerball dataset

## Competitor/product references

- LottoNumbers annual Mega Millions archive
- Lotto.net annual Powerball archive
- USA Mega Powerball Past Results
- LotteryUSA Florida Pick 3 annual results
- LotteryPost Premium Memberships
- LotteryPost Premium Features
- LotteryPost Result Search
- LotteryPost VTracs Search
- LotteryPost Wheels

## Search and technical guidance

- Google Search Central URL Structure
- Google Search Central Link Architecture
- Google Search Central Infinite Scroll
- Google Search Central Faceted Navigation
- Google Search Central Structured Data Guidelines
- Google Search Central Breadcrumbs
- Google Search Central XML Sitemaps
- Google Search Central AI Features
- Google Search documentation update on Dataset structured data
