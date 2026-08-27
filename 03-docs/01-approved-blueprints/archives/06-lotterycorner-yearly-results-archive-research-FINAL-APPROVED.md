# LotteryCorner Yearly Results Archive Research — Final Approved

**Document:** `06-lotterycorner-yearly-results-archive-research-FINAL-APPROVED.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Version:** 1.1  
**Status:** Final approved and frozen research  
**Approved date:** July 24, 2026  
**Scope:** U.S. lottery games only  
**Supersedes:** `06-lotterycorner-yearly-results-archive-research.md`

---

## 1. Final Product Decision

LotteryCorner will preserve the established annual result URL pattern:

```text
/powerball/2026
/powerball/2025
/mega-millions/2026
/fl/pick-3-evening/2021
```

No generic `/results` route will replace these URLs.

Each annual page will become a:

> **Game-Year Historical Intelligence Hub**

The page remains first and foremost a complete, trustworthy annual result archive. It adds search, deterministic analysis, AI explanation, historical checking, comparison, discussion and premium research workflows without hiding the underlying winning numbers.

---

## 2. Existing Date and Archive-Year Logic

LotteryCorner already stores and processes draw results using its existing EST-based result-date logic.

### Approved rule

- Reuse the existing stored draw date and archive-year derivation.
- Do not derive archive membership from the visitor’s browser timezone.
- Do not introduce a new timezone conversion model for archive routing.
- A draw remains in the year currently determined by the existing LotteryCorner result-processing logic.
- Visitor-local time may be shown elsewhere as presentation context, but it does not change the archive URL or year.

This research and blueprint do not redesign the existing result date storage.

---

## 3. Canonical Ownership

### 3.1 National Games

The national annual archive is the default owner of the shared draw history:

```text
/powerball/{year}
/mega-millions/{year}
```

### 3.2 State Annual Pages for National Games

Existing pages such as:

```text
/ca/powerball/{year}
/fl/mega-millions/{year}
```

must not be deleted automatically.

They remain independently valuable only when they provide substantial state-specific information such as:

- state winner counts;
- state jackpot or major-prize winners;
- winning retailers;
- state payout exceptions;
- Double Play participation;
- state news and winner stories;
- state discussion;
- state claims context.

### 3.3 Required SEO Audit

Before consolidating any current state/year page, review:

- Search Console impressions and clicks;
- ranking queries;
- selected canonical;
- sitemap inclusion;
- backlinks;
- internal links;
- analytics;
- affiliate revenue;
- unique state content.

### 3.4 New Page Rule

Do not create new near-duplicate state/year pages for national games unless the state-lens content contract is satisfied.

---

## 4. Archive Modes

Every annual page uses one of three explicit modes.

### `YR-CURRENT`

Used for the active calendar year.

Required behavior:

- heading uses “Results — Year to Date”;
- metrics are labelled YTD;
- updated after every verified draw;
- current jackpot, next draw and alerts may be visible;
- AI brief refreshes monthly or after a material event;
- Buy Tickets may appear only through the approved general continuation rules.

### `YR-CLOSED`

Used after the year is complete.

Required behavior:

- complete-year summary;
- stable metrics;
- precomputed AI narrative;
- no unnecessary next-draw dominance;
- regenerated only after correction, source improvement or methodology change.

### `YR-RETIRED`

Used when the game is no longer active.

Required behavior:

- preserve all valid history;
- show retired status and active period;
- retain rule-era and source context;
- no Buy Tickets action;
- link to a genuine successor only when one exists.

---

## 5. Game Identity

The archive uses the existing LotteryCorner database game identity.

Do not invent a new game-ID convention in this document.

Use:

```text
gameId: <existing-game-id>
drawVariant: <existing-variant-if-applicable>
archiveYear: <existing-derived-year>
```

Implementation must determine from the current model whether Midday and Evening are:

- separate games;
- separate draw series;
- or variants under one game.

The archive consumes the existing identity instead of redefining it.

---

## 6. Historical Data Completeness

LotteryCorner has up to approximately 30 years of maintained historical results, depending on the game and verified field coverage.

Each game/year must carry a completeness profile.

```text
winningNumbersCompleteness
jackpotCompleteness
cashValueCompleteness
powerPlayCompleteness
doublePlayCompleteness
prizeTableCompleteness
winnerCountCompleteness
retailerCompleteness
videoCompleteness
newsCoverage
ruleEraCompleteness
```

### Display Rules

- Winning numbers remain visible when verified.
- Metrics using incomplete fields are suppressed or clearly limited.
- Do not calculate cash-value averages when cash-value coverage is incomplete.
- Do not show financial backtest ROI without complete ticket-price and prize data.
- Do not generate winner trends when winner data is incomplete.
- AI must state the data coverage supporting each conclusion.
- Partial archives show a visible data-coverage notice.

---

## 7. Primary Archive Purpose

The annual archive must help users:

1. find every result in the selected year;
2. find a date, number or pattern quickly;
3. understand the year at a glance;
4. compare the year with another period;
5. check their numbers against history;
6. explore deterministic historical patterns;
7. discover notable draws and jackpot runs;
8. connect results with real news and discussions;
9. save research and return;
10. access advanced Insider research tools.

---

## 8. Final Page Structure

Use the following primary order:

1. Year Header and Navigation.
2. YTD or Completed-Year Summary.
3. AI Year Brief.
4. Month Navigation.
5. Compact Complete Result List.
6. Search, Filters and Ask the Archive.
7. Selected Analysis and Notable Draws.
8. Historical Tools Launcher.
9. News and Community Timeline.
10. Data Access, Trust and Next Actions.

### Workspace Rule

The following are normally tool launchers or expandable workspaces rather than large embedded page sections:

- Compare Years;
- Check My Numbers Across History;
- Archive Explorer;
- System Lab;
- advanced charts;
- multi-year filters;
- exports and reports.

They reuse the accepted Lottery Tools architecture instead of creating duplicate archive-only implementations.

---

## 9. Result List

### 9.1 National Jackpot Game Row

May include:

- draw date;
- winning numbers;
- special ball;
- Power Play where applicable;
- linked Double Play result where applicable;
- jackpot;
- cash value when complete;
- rollover or jackpot-won status;
- winner count when complete;
- Check;
- Analyze;
- Discuss.

### 9.2 State Daily Game Row

May include:

- draw date;
- variant;
- winning number;
- Fireball or equivalent;
- top prize when verified;
- straight/box classification;
- double/triple indicator;
- approved sum/root value;
- Check;
- Analyze;
- Discuss.

### 9.3 Density

- Use compact rows, not large cards.
- Keep historical numbers as the dominant content.
- Do not place ads inside result rows.

---

## 10. Pagination and Month Navigation

### Jackpot Games

- A complete server-rendered yearly list is preferred when performance permits.
- Group by month.
- Provide crawlable year navigation.
- Month anchors may support in-page navigation.

### High-Frequency State Games

Use one of:

- server-rendered month sections;
- or genuine paginated month pages when required for performance.

Requirements:

- no infinite-scroll-only archive;
- no click-only hidden result history;
- mobile and desktop expose equivalent data;
- the annual URL remains the year hub;
- filter combinations do not become automatically indexable URLs.

---

## 11. Individual Draw Behavior

The annual archive remains the primary historical collection.

Default:

- row details expand inline or in a detail drawer;
- existing “Read more” URLs are inventoried before replacement.

A separate indexable draw page is justified only when:

- a legacy draw URL already has value;
- the draw has substantial winner, payout, video, news or discussion content;
- or search-demand evidence supports the page.

Do not generate thousands of thin draw pages automatically.

---

## 12. Search and Filters

### Free Basic Filters

- month/date;
- exact number;
- contains one or more numbers;
- jackpot won or rollover;
- draw variant;
- Power Play;
- Double Play availability;
- double/triple;
- sum range;
- odd/even;
- high/low.

### Advanced Filters

- number position;
- pairs/triples;
- gap range;
- decade distribution;
- consecutive values;
- previous-draw repeat;
- rule era;
- combined conditions.

Filter states do not become indexable pages by default.

---

## 13. Ask the Archive

AI converts a natural-language question into transparent deterministic filters.

Required flow:

1. Identify the existing game ID and selected year/range.
2. Interpret the question.
3. Show the interpreted filters.
4. Run the deterministic archive query.
5. Show matching result rows and count.
6. Let AI explain the verified result.
7. Offer save, compare or export.

Example questions:

- “Show every Powerball drawing in 2025 containing 22.”
- “Find drawings with three odd and two even white balls.”
- “Show Florida Pick 3 Evening doubles in March 2021.”
- “When did 4 and 22 appear together?”
- “Which jackpot run lasted the longest?”
- “Find draws structurally similar to this one.”

AI does not fabricate a result or hide the applied filters.

---

## 14. AI Year Brief

### Current Year

- update deterministic metrics after every verified draw;
- refresh the narrative monthly;
- refresh after a material jackpot, rule change or correction;
- do not regenerate the full narrative after every routine result.

### Closed Year

Precompute and cache:

- annual story;
- major jackpot runs;
- notable draws;
- previous-year comparison;
- rule-era explanation.

Regenerate after:

- correction;
- source improvement;
- rule-era correction;
- methodology change.

### Evidence Requirement

Every generated statement must link to:

- a draw;
- metric;
- chart;
- source;
- real news item;
- or real discussion.

---

## 15. Analysis and Notability

### Selected Free Analysis

- frequency;
- gaps;
- pairs;
- odd/even;
- high/low;
- sums;
- range;
- decade distribution;
- consecutive numbers;
- previous-draw repeats;
- jackpot timeline.

State games may add:

- digit-position frequency;
- exact/box frequency;
- doubles/triples;
- pair families;
- approved roots/sums;
- midday/evening comparison.

### Notability Contract

A notable draw needs measurable criteria:

```text
notabilityType
metric
value
historicalPercentile
reason
```

Examples:

- highest or lowest sum;
- widest or narrowest spread;
- largest jackpot;
- jackpot-winning draw;
- longest rollover end;
- repeated exact state-game result;
- first or last draw of a rule era.

AI explains the criterion but does not invent it.

### Removed Metric

Do not use “total jackpot advertised across drawings” because it repeatedly counts a rolling prize pool.

Use:

- largest jackpot;
- median advertised jackpot;
- average advertised jackpot with definition;
- jackpot-winning draws;
- rollover draws;
- longest rollover run;
- draws between jackpot wins;
- cash-to-annuity ratio when complete.

---

## 16. Historical Number Checking

Use neutral wording.

Allowed:

- exact historical match;
- partial historical overlap;
- highest historical number overlap found;
- matching dates;
- potential historical prize when complete.

Do not use:

- best near miss;
- almost won;
- lucky pattern;
- wording implying future advantage.

Rules:

- exact matches first;
- partial overlaps clearly labelled;
- no immediate Buy prompt after a historical loss or partial overlap;
- AI must state that historical overlap does not change future odds.

---

## 17. Systems and Backtesting

### Match-Only Historical Test

Available when verified result data is complete.

Show:

- system definition;
- draws tested;
- generated tickets;
- match counts;
- number/pair coverage;
- rule era;
- assumptions.

### Financial Historical Test

Available only with complete:

- historical ticket prices;
- prize tables;
- multipliers and add-ons;
- state payout exceptions;
- jackpot treatment.

Show:

- historical cost;
- verified historical payout;
- missing fields;
- assumptions;
- methodology.

### Integrity Rules

- record the system definition before testing;
- show parameter changes;
- separate tuning and evaluation periods when applicable;
- block ROI when payout data is incomplete;
- state that historical performance does not establish future advantage.

---

## 18. Community and Historical Authenticity

Archive pages may show:

- genuine archived discussions;
- genuine dated news;
- current retrospective discussions;
- clearly labelled LotteryCorner Research retrospectives.

Example:

> LotteryCorner Research retrospective — generated in 2026 from verified 2015 draw data.

Do not:

- fabricate historical community activity;
- create synthetic member replies;
- present a new AI note as if it existed during the archived year.

---

## 19. Free, Signed-In and Insider Value

### Public

- complete annual result list;
- year/month navigation;
- basic summary;
- basic filters;
- selected charts;
- one-number-set historical check;
- limited Ask the Archive;
- source and methodology;
- ads;
- general current-game continuation.

### Signed-In

- save searches;
- save number sets;
- alerts;
- saved comparisons;
- filtered exports;
- conversation continuity;
- discussion participation.

### Insider

- full multi-year Archive Explorer;
- advanced combined filters;
- batch ticket checking;
- System Lab;
- rule-era comparison;
- research workspaces;
- advanced charts;
- CSV/PDF reports;
- saved AI Research Notes;
- expanded exports.

Premium value is depth, convenience and workflow—not prediction certainty.

---

## 20. Data Rights and Export Gate

Before enabling bulk export, API or commercial redistribution, maintain a rights register with:

- source;
- data fields;
- attribution requirement;
- reuse rights;
- commercial-use restrictions;
- video/image rights;
- winner and retailer data treatment;
- permitted export/API behavior;
- reviewer and review date.

A public source does not automatically grant commercial redistribution rights for every field.

### Data Products

Potential later products:

- filtered CSV;
- full-year dataset;
- multi-year dataset;
- annual report;
- API;
- correction feed;
- widget.

Each requires rights and licensing approval.

---

## 21. SEO and AI Discovery

### URL

Preserve:

```text
/powerball/{year}
/mega-millions/{year}
/{state}/{state-game}/{year}
```

### Current-Year Title

`Powerball Results 2026: Winning Numbers & Jackpot — Year to Date | LotteryCorner`

### Closed-Year Title

`Powerball Results 2025: Winning Numbers & Jackpot Archive | LotteryCorner`

### State Game Title

`Florida Pick 3 Evening Results 2021: Winning Numbers Archive | LotteryCorner`

### Unique Annual Content

Every year page must include computed year-specific content:

- draw count;
- completeness;
- rule era;
- metrics;
- notable draws;
- AI summary;
- jackpot timeline where applicable;
- real news/community links.

Do not publish year-substitution paragraphs.

### Server-Visible HTML

Include:

- H1;
- year status;
- year summary;
- year navigation;
- month navigation;
- complete or crawlably paginated result rows;
- rule-era/data-coverage note;
- primary tool links;
- source/methodology.

### Structured Data

Conceptual:

- `CollectionPage` or `WebPage`;
- `BreadcrumbList`;
- `ItemList` only when it represents visible result rows;
- `Dataset` only for a genuine governed downloadable dataset.

Schema must reflect visible content.

### Social Metadata

Use fixed year/game metadata.

Do not include:

- user-entered numbers;
- personal match result;
- private analysis;
- IP-derived Buy availability.

---

## 22. Invalid and Empty Archive Behavior

- Future year before a valid draw: do not create or index.
- Year before the game began: 404.
- Invalid year parameter: 404.
- Valid year with incomplete import: show partial-data warning.
- Retired game with valid history: preserve archive.
- Year with no legitimate draw history: 404 unless a historically meaningful explanatory page is approved.
- Year navigation links only to valid archive years.
- Never silently fall back to the current year.

---

## 23. Advertising and Buy Tickets

### Ad Tier

Tier 2–3 depending on archive length.

Allowed:

- after the year summary;
- between month groups;
- after selected analysis;
- before lower content.

Prohibited:

- inside result rows;
- between Check My Numbers input and output;
- inside an AI answer;
- inside a correction notice;
- between a system result and its assumptions.

### Buy Tickets

May appear:

- in the current-game continuation;
- after number generation;
- near the next-draw module for `YR-CURRENT`.

Do not show it immediately after:

- a historical loss;
- partial overlap;
- negative backtest;
- claim guidance.

The existing first-party affiliate resolver remains the only Buy-link mechanism.

---

## 24. Measurement

Track:

- time to locate a draw;
- year/month-navigation use;
- filter completion;
- zero-result filter rate;
- Ask the Archive interpretation-correction rate;
- AI evidence-link clicks;
- historical number-check completion;
- comparison use;
- tool continuation;
- save/export conversion;
- Insider conversion;
- archive-to-current-game return;
- organic traffic by game/year;
- canonical and duplicate coverage;
- page performance by result volume;
- data error and correction rate;
- ad revenue without task abandonment.

---

## 25. Source Register Contract

The implementation source register must include:

- source ID;
- page/document title;
- publisher;
- full URL or internal document location;
- accessed date;
- claim/section supported;
- authority type;
- data rights;
- replacement/health status.

Authority types:

- official;
- public-data;
- accepted internal research;
- competitor observation;
- search/technical guidance;
- inference.

The public-search findings in the original research are classified as a limited spot check, not Search Console evidence.

---

## 26. Delivery Phases

### Phase 1 — Archive Rebuild

- URL preservation;
- three archive modes;
- compact results;
- month/year navigation;
- year summary;
- basic filter;
- selected analysis;
- checker entry;
- source/data coverage;
- SEO/server rendering;
- ads.

### Phase 2 — AI and Engagement

- AI Year Brief;
- Ask the Archive;
- notable draws;
- year comparison;
- news/community timeline;
- save searches;
- alerts.

### Phase 3 — Insider Research

- multi-year Archive Explorer;
- advanced filters;
- batch checking;
- System Lab;
- exports;
- workspaces;
- custom reports.

### Phase 4 — Data Products

- governed datasets;
- API;
- widgets;
- correction feed.

---

## 27. Final Approval

Approved:

1. annual URL preservation;
2. Game-Year Historical Intelligence Hub positioning;
3. national archive ownership;
4. state-lens SEO audit;
5. `YR-CURRENT`, `YR-CLOSED`, `YR-RETIRED`;
6. existing EST-based archive-year logic;
7. current database game identity;
8. completeness-aware metrics;
9. compact result list;
10. controlled filters and pagination;
11. Ask the Archive;
12. AI refresh and evidence rules;
13. neutral historical checking;
14. backtesting integrity;
15. community authenticity;
16. rights gate;
17. SEO/schema/social rules;
18. ad and Buy suppression;
19. success metrics.

This research is frozen as Version 1.1.
