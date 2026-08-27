# LotteryCorner Flagship Game Page Blueprint

**Document:** `05A-lotterycorner-flagship-game-page-blueprint.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Blueprint package:** BP-04A — Flagship Game Brand Hub  
**Page families:** PF-03 Game Hub, PF-04 Current Result, PF-05 Stable Draw, PF-06 History, PF-07 Jackpot, PF-20–PF-24 Tools, PF-40–PF-42 AI  
**Version:** 1.0  
**Status:** Proposed blueprint — ready for founder review  
**Date:** July 24, 2026  
**Delivery class:** Core rebuild plus early engagement  
**Initial implementations:** Powerball and Mega Millions  
**Primary authority:**  
- Frozen Product Constitution v2.1  
- Final Approved Experience Architecture v1.1  
- Final Approved Global Shell Blueprint v1.1  
- Final Approved Home Blueprint v1.1  
- Final Approved State Blueprint v1.1  
- `05-lotterycorner-game-page-blueprint-index.md`

---

## 0. Blueprint Decision

Powerball and Mega Millions receive international-quality root game hubs:

```text
/powerball
/mega-millions
```

The root hub owns:

- current shared result;
- jackpot and next drawing;
- game rules and prize model;
- stable draw records;
- results and jackpot history;
- all major tools and statistics;
- LotteryCorner AI;
- news, winner stories and global community;
- save/follow/notifications;
- jurisdiction selector;
- geo-aware purchase and cutoff context;
- international visitor guidance.

A state/jurisdiction offering page does not duplicate the flagship experience. It supplies local purchase, cutoff, feature, claim, tax, privacy, winner, news and community context.

### 0.1 Product promise

> **Check the game, understand the draw, use the tools, ask the AI, join the discussion and see the correct local way to play.**

### 0.2 Visual-reference boundary

The included Powerball, Mega Millions and mobile visuals approve structure and hierarchy only. They do not approve final branding, game-logo usage, live values, copy length, result-ball styling or advertisement dimensions.

### 0.3 Flagship-hub eligibility

A root game hub is created only when the game has:

- a shared brand and meaningful cross-jurisdiction identity;
- a shared draw or core result object;
- substantial search demand;
- durable history and statistics;
- enough news/community/tool value;
- and meaningful content beyond local offering pages.

Powerball and Mega Millions qualify.

Other multi-state games require a separate evidence-based decision.

---

# PART I — CURRENT RESEARCH FINDINGS

## 1. Powerball Is Now a Multi-Country Game

Beginning July 21, 2026, Powerball ticket sales expanded to the United Kingdom for the July 22 drawing.

The official Powerball model now has:

- one shared jackpot;
- one shared drawing and number matrix;
- unchanged U.S. ticket price, odds and lower-tier prize structure;
- a £4 UK play;
- separate UK lower-tier prizes;
- a UK jackpot paid over 30 years rather than a one-time cash option;
- different U.S-dollar pre-tax and UK-pound post-tax advertised figures.

**Architecture implication:** `/powerball` must be genuinely global while U.S. state pages and `/uk/powerball` remain local offering pages.

## 2. Powerball Remains Jurisdiction-Specific for Purchase and Claims

Official Powerball guidance states:

- sales cutoffs vary by selling jurisdiction;
- some lotteries sell online only within the jurisdiction;
- cross-border internet/mail sales are restricted;
- a visitor may buy from an authorized retailer while physically in a selling jurisdiction and meeting the local age requirement;
- claims occur in the selling jurisdiction;
- Power Play and Double Play availability differs;
- Idaho and Montana bundle Power Play into a higher minimum purchase price.

**Architecture implication:** global facts and local transaction rules cannot be collapsed into one generic Buy button.

## 3. Mega Millions Is a U.S. Game with a Global Information Audience

The current game:

- costs $5 per play;
- draws Tuesday and Friday at 11 p.m. ET;
- uses five numbers from 1–70 and one Mega Ball from 1–24;
- includes a built-in random 2X, 3X, 4X, 5X or 10X multiplier;
- is sold in 45 states, Washington, D.C. and the U.S. Virgin Islands;
- is not officially sold outside the United States;
- has California pari-mutuel lower-tier prize differences.

**Architecture implication:** `/mega-millions` serves worldwide information demand, but purchase and payout content remains U.S.-jurisdiction-aware.

## 4. State Lottery Products Prove the Local Layer

Illinois exposes online play, draw close, results, number checking, claims and winner stories. Florida exposes local cutoff, Double Play, Power Play, advance play, retail/app play slips and local claim rules.

**Architecture implication:** the global hub links to local offering pages rather than attempting to maintain every state rule inside the main game content.

## 5. Search and Geo Research

Google warns that locale-adaptive content may not be crawled or indexed completely because Googlebot commonly appears U.S.-based and does not send normal user language/location signals.

**Architecture implication:**

- no IP-based automatic redirect;
- global content remains stable and indexable;
- geo personalization is a visible module;
- substantial local offerings receive separate URLs.

---

# PART II — ROUTE AND ENTITY ARCHITECTURE

## 6. Canonical Route Families

### Root hub

```text
/powerball
/mega-millions
```

### Shared draw/result

```text
/powerball/results
/powerball/results/{yyyy-mm-dd}
/mega-millions/results
/mega-millions/results/{yyyy-mm-dd}
```

### Universal game content

```text
/{game}/how-to-play
/{game}/prizes-and-odds
/{game}/jackpot-history
/{game}/statistics
/{game}/number-history
/{game}/generator
/{game}/systems
/{game}/check-numbers
/{game}/news
/{game}/community
```

### Powerball-specific

```text
/powerball/power-play
/powerball/double-play
/powerball/international
```

### Mega Millions-specific

```text
/mega-millions/multiplier
/mega-millions/international
```

### Jurisdiction offering

```text
/{state-code}/powerball
/{state-code}/mega-millions
/uk/powerball
```

## 7. Draw Ownership

One `DrawEvent` owns:

- draw date/time;
- winning numbers;
- multiplier/add-on results;
- jackpot/cash value;
- video;
- global winner summaries;
- status/correction.

State offering pages reference it.

A state-specific draw/prize page is created only when there is substantial local data such as local winner counts, payout variation or winning retailers.

## 8. Canonical Rules

- Root hubs self-canonical.
- Stable draw records self-canonical.
- Jurisdiction offerings self-canonical only when they contain substantial unique local content.
- `?state=fl` and similar UI parameters canonicalize to the root hub.
- Do not canonicalize a strong `/fl/powerball` page to `/powerball`.
- Do not create thin country pages through state-name substitution.
- `hreflang` is used only for genuine language/locale equivalents, not between global and local-offering pages.

---

# PART III — GEO AND INTERNATIONAL CONTEXT

## 9. Geo Context Resolution

For the purchase/cutoff module:

1. Explicit user-selected location.
2. Signed-in preferred purchasing jurisdiction.
3. IP-derived likely state/country.
4. Device precise location after permission, when a partner flow requires it.
5. Manual state/country selection.
6. Unknown.

The display must show the selected/detected location and a Change control.

## 10. IP Personalization Contract

IP may determine the initial:

- Buy Tickets or Where to Play label;
- likely cutoff;
- official/affiliate/retail option;
- local draw-time display;
- local news/winner preview;
- suggested local offering page.

It may not:

- auto-redirect;
- alter canonical ownership;
- hide global content;
- guarantee eligibility;
- replace the provider’s final geolocation;
- remain active after the user explicitly changes location.

## 11. Powerball Audience Modes

### PB-US

A U.S. selling jurisdiction.

Show:

- local cutoff;
- local ticket/add-on configuration;
- online/retail/courier options;
- claim link;
- local offering page.

### PB-UK

Show:

- UK ticket price;
- UK lower-tier-prize distinction;
- UK jackpot-payment model;
- UK purchase and claim route;
- UK offering page;
- U.S./UK comparison.

### PB-OTHER

Show:

- latest result and jackpot;
- draw time converted to user locale;
- tools, AI, news, community and alerts;
- where Powerball is officially sold;
- visitor-purchase explanation;
- scam warning;
- no unverified purchase CTA.

### PB-UNKNOWN

Ask for country/state when the user requests purchase, cutoff, prize or claim information.

## 12. Mega Millions Audience Modes

### MM-US

Show local cutoff, provider, state payout exceptions, claim/tax and local offering.

### MM-OTHER

Show results, local draw time, tools, AI, news, community and explicit no-official-overseas-sales guidance.

### MM-UNKNOWN

Request location only when needed.

---

# PART IV — FLAGSHIP PAGE SECTION ORDER

## 13. Anonymous Sequence

| Order | ID | Section |
|---:|---|---|
| 1 | FG-01 | Game Identity, Jackpot and Latest Result |
| 2 | FG-02 | Geo-Aware Buy Tickets / Where to Play / Cutoff |
| 3 | AD-FG00 | Top Advertisement |
| 4 | FG-03 | Check My Numbers |
| 5 | FG-04 | LotteryCorner Game AI |
| 6 | AD-FG01 | Post-Core Advertisement |
| 7 | FG-05 | Latest Draw Deep Dive |
| 8 | FG-06 | How to Play |
| 9 | FG-07 | Prize, Multiplier and Add-On Explanation |
| 10 | AD-FG02 | Post-Rules Advertisement |
| 11 | FG-08 | Results History |
| 12 | FG-09 | Jackpot History |
| 13 | FG-10 | Statistics and Number History |
| 14 | FG-11 | Generator and Systems |
| 15 | FG-12 | Jurisdiction Availability and Local Offerings |
| 16 | FG-13 | International Visitor Guide |
| 17 | AD-FG03 | Post-Tools Advertisement |
| 18 | FG-14 | Worth Knowing / Intelligent Highlights |
| 19 | FG-15 | News |
| 20 | FG-16 | Winners |
| 21 | FG-17 | Community |
| 22 | FG-18 | Save, Follow, Alerts and App |
| 23 | FG-19 | Trust, Scam Awareness and Responsible Play |
| 24 | AD-FG04 | Lower Advertisement |
| 25 | Footer | Global and game navigation |

## 14. Adaptive Priority Override

The normal sequence changes when:

1. A material result correction exists — correction precedes all continuation.
2. The draw is live/pending — status moves beside the latest result.
3. A saved set may have won — exact check and claim guidance outrank AI, ads and purchase.
4. A purchase cutoff is imminent and the user explicitly entered a transaction flow — purchase panel may remain sticky after core result.
5. Responsible-play or spending concern is detected — commerce and promotional alerts are suppressed.

## 15. Content Budget

The root hub is rich but not one endless document.

Initial display limits:

- one current result;
- one geo-purchase panel;
- one concise draw insight;
- three to five recent draw rows;
- one compact how-to summary;
- one compact prize/add-on summary;
- three highlight cards;
- three news items;
- three winner stories;
- three community discussions;
- selected tools only.

Full tables, histories, videos, prize matrices and archives live on canonical child pages.

---

# PART V — SECTION SPECIFICATIONS

## 16. FG-01 — Game Identity, Jackpot and Latest Result

Required:

- game name and clear global identity;
- current jackpot;
- cash value where applicable;
- next draw and local-time conversion;
- latest winning numbers;
- multiplier/add-on result;
- verified/pending/corrected state;
- stable draw;
- watch drawing;
- check numbers;
- follow.

Powerball must communicate the shared U.S.–UK jackpot without implying identical local prizes.

Mega Millions must communicate U.S. sale availability without treating international readers as irrelevant.

## 17. FG-02 — Geo-Aware Purchase and Cutoff

Required:

- detected/selected location;
- Change location;
- exact source;
- local cutoff;
- official/app/subscription/affiliate/retail classification;
- add-on/ticket-price context;
- age/geolocation/material terms;
- compensation disclosure;
- local offering link;
- final-provider-verification statement.

Action labels:

- **Buy Tickets** or **Play Online** when a verified digital option is likely available.
- **Where to Play** when eligibility or channel is unresolved.
- **Find a Retailer** for retail-only.
- no CTA when unavailable/unverified.

## 18. FG-03 — Check My Numbers

Supports:

- current draw;
- date range;
- saved sets;
- multiplier/add-on;
- U.S./UK or state prize context;
- exact match;
- governed prize explanation;
- claim escalation.

No ad between input and output.

## 19. FG-04 — LotteryCorner Game AI

Suggested tasks:

- explain latest draw;
- compare jackpot/cash value;
- explain Power Play, Double Play or Mega multiplier;
- configure statistics/generator;
- answer local cutoff or purchase question;
- summarize news/community;
- show historical connections.

The first anonymous answer is complete.

## 20. FG-05 — Latest Draw Deep Dive

Contains:

- stable draw identity;
- numbers;
- Power Play/Mega multiplier;
- Double Play relationship where relevant;
- jackpot/cash;
- winner summaries;
- video;
- correction status;
- deterministic insight;
- historical match;
- global and local discussion links.

## 21. FG-06 — How to Play

Summary only:

- number matrix;
- draw days/time;
- ticket price by context;
- winning concept;
- jackpot payment overview;
- non-predictive odds explanation.

Routes to full guide.

## 22. FG-07 — Prize, Multiplier and Add-On Explanation

### Powerball

- U.S. prize matrix;
- Power Play;
- Double Play;
- Idaho/Montana bundled-price exception;
- UK lower-tier-prize distinction;
- U.S./UK jackpot-payment differences.

### Mega Millions

- current $5 format;
- built-in 2X–10X multiplier;
- nine ways to win;
- California pari-mutuel exception;
- cash/annuity overview.

## 23. FG-08 — Results History

- bounded date search;
- stable draw links;
- current game-rule era;
- video availability;
- direct number checking;
- crawlable pagination.

## 24. FG-09 — Jackpot History

- current run;
- rollover/reset;
- historical records;
- advertised annuity and cash value;
- U.S./UK display explanation for Powerball;
- filters and charts on child page.

## 25. FG-10 — Statistics and Number History

Deterministic:

- frequency;
- gaps;
- repeats;
- pairs/triples;
- odd/even;
- high/low;
- sums;
- consecutive values;
- selected period;
- rule-era awareness.

AI explains; it does not calculate or predict.

## 26. FG-11 — Generator and Systems

- random set;
- fixed numbers;
- constraints;
- hot/cold mix;
- wheel/system;
- AI natural-language configuration;
- save;
- track;
- local purchase handoff after location resolution.

## 27. FG-12 — Jurisdiction Availability

Powerball:

- 45 U.S. states;
- D.C.;
- Puerto Rico;
- U.S. Virgin Islands;
- United Kingdom;
- local price/add-on/online/cutoff links.

Mega Millions:

- 45 states;
- D.C.;
- U.S. Virgin Islands;
- local purchase and payout links.

This is a maintained offering matrix, not a static list copied into prose.

## 28. FG-13 — International Visitor Guide

Powerball:

- where officially sold;
- UK;
- visitors purchasing while physically in a selling jurisdiction;
- claims/tax;
- local-time draw;
- scam warning;
- no mass-produced country pages.

Mega Millions:

- U.S.-only sales;
- local-time draw;
- international result checking;
- scam warning;
- no overseas purchase endorsement.

## 29. FG-14 — Worth Knowing

Maximum three:

- draw property;
- jackpot milestone;
- historical draw connection;
- rule/market expansion;
- current question;
- important winner story.

## 30. FG-15 — News

Global game news with jurisdiction labels and AI Quick Takes.

## 31. FG-16 — Winners

- jackpot winners;
- major lower-tier winners;
- U.S./UK context;
- state links;
- claim/privacy boundaries;
- no implication that a method caused the win.

## 32. FG-17 — Community

- global game forum;
- current draw reaction;
- jackpot discussion;
- systems/tools;
- U.S./UK questions;
- state/jurisdiction threads;
- AI Research Notes where appropriate.

Human replies remain primary.

## 33. FG-18 — Save, Follow, Alerts and App

User-selected events:

- result;
- saved match;
- jackpot threshold;
- draw reminder;
- news;
- replies;
- local purchase availability.

## 34. FG-19 — Trust, Scams and Responsible Play

- source/verification;
- corrections;
- independent publisher;
- game operator links;
- scam warning;
- affiliate disclosure;
- local Responsible Play;
- AI policy.

---

# PART VI — GAME-SPECIFIC PROFILES

## 35. Powerball Profile

### Shared core

- five white balls 1–69;
- one Powerball 1–26;
- Monday/Wednesday/Saturday drawing;
- shared U.S.–UK jackpot;
- same jackpot odds.

### U.S.

- $2 base play;
- Power Play optional except bundled states;
- Double Play in participating jurisdictions;
- U.S. lower-tier prizes;
- cash or annuity jackpot choice where applicable;
- state claim/tax/anonymity.

### UK

- £4 play;
- distinct lower-tier prize structure;
- jackpot paid over 30 years;
- UK advertised figure uses different currency/tax convention;
- UK purchase and claim route;
- U.S. add-ons must not be assumed.

### International non-selling country

- results, history, tools, AI, news, community and alerts;
- no unverified purchase CTA;
- visitor-purchase and scam guidance.

## 36. Mega Millions Profile

- $5 play;
- five white balls 1–70;
- one Mega Ball 1–24;
- Tuesday/Friday 11 p.m. ET;
- built-in random 2X, 3X, 4X, 5X or 10X multiplier;
- nine prize levels;
- U.S. selling jurisdictions only;
- California pari-mutuel exception;
- state online/cutoff/claim/tax variation;
- international information and scam guidance.

---

# PART VII — SIGNED-IN / INSIDER EXPERIENCE

## 37. Signed-In Priority

1. saved match or potential win;
2. current/pending followed draw;
3. upcoming followed draw/cutoff;
4. saved generator/system;
5. reply/community;
6. meaningful news/change;
7. qualified purchase.

## 38. Signed-In Modules

- My Game Summary;
- Saved Number Matches;
- Upcoming Draws;
- Personal Game AI;
- Saved Statistics/Systems;
- Following and Replies;
- Location/Purchase Preference;
- News for My Jurisdictions;
- Notification and Memory Controls.

## 39. Insider

May add:

- longer AI memory;
- advanced system tracking;
- personal performance timeline;
- advanced filters;
- configurable page modules;
- ad-supported unless changed later.

---

# PART VIII — MOBILE

## 40. Mobile Order

1. game/result/jackpot;
2. geo purchase/cutoff;
3. top ad if inherited;
4. Check My Numbers;
5. AI;
6. latest draw;
7. rules/prizes;
8. results history;
9. jackpot history;
10. statistics;
11. generator/systems;
12. jurisdictions;
13. international;
14. news/winners;
15. community;
16. save/alerts;
17. trust/footer.

## 41. Mobile Rules

- no horizontal-swipe-only access to result;
- geo context visible;
- Buy button never covers numbers;
- AI keyboard preserves actions;
- one sticky element at a time;
- history tables use accessible controlled scrolling;
- local-time and ET both available;
- state/country change remains accessible.

---

# PART IX — CONTENT AND DATA CONTRACTS

## 42. Game Brand Manifest

Required fields:

- game ID and name;
- operator/consortium;
- shared brand status;
- number matrix;
- draw schedule/timezone;
- jackpot model;
- base price by jurisdiction family;
- universal odds;
- add-ons/features;
- current rule version;
- historical rule eras;
- supported routes;
- news/community/tool capability;
- source URLs;
- owner, review date and correction status.

## 43. Jurisdiction Availability Manifest

Required per game/jurisdiction:

- jurisdiction code;
- selling status;
- price;
- cutoff;
- online/app/subscription/retail/courier;
- age;
- precise geolocation requirement;
- add-ons;
- advance play;
- lower-tier-prize exception;
- claim deadline/location;
- tax/anonymity;
- local Responsible Play;
- source;
- last verified;
- freshness;
- purchase-provider status.

## 44. Draw Event

One record:

- game;
- draw timestamp;
- numbers;
- multiplier/add-on result;
- jackpot/cash;
- status;
- video;
- winner summary;
- correction trail.

## 45. Consumers

The manifests power:

- root game hub;
- state/UK offering;
- state hub cards;
- purchase/cutoff;
- AI retrieval;
- SEO metadata/schema;
- notifications;
- saved-number checking;
- monitoring;
- future APIs.

---

# PART X — OPERATIONS AND FRESHNESS

## 46. Monitoring

| Information | Requirement |
|---|---|
| Result/jackpot | Event-driven |
| Draw/video/status | Event-driven |
| Cutoff/purchase | Daily plus change alerts |
| Jurisdiction price/add-ons | Weekly plus rules alerts |
| Claims/tax/anonymity | Monthly plus change alerts |
| UK/U.S. Powerball model | Official-source change alerts |
| Mega format/prizes | Official-source change alerts |
| News/community | Continuous lifecycle |
| Statistics/tool data | After every verified draw |
| Affiliate/provider | Daily plus outage/status alert |

## 47. Correction Propagation

Update:

- root hub;
- stable draw;
- state offering previews;
- saved checks;
- AI;
- notifications;
- article fact cards;
- community banners;
- metadata/schema;
- sitemap `lastmod`;
- partner cutoff display.

---

# PART XI — ADVERTISING AND COMMERCE

## 48. Ad Tier

Tier 2, with higher controlled inventory on long tools/news/community.

Protected:

- result;
- check input/output;
- AI answer;
- live/pending status;
- claim escalation;
- purchase eligibility decision.

## 49. Ad Anchors

- `AD-FG00-TOP`
- `AD-FG01-AFTER-CORE`
- `AD-FG02-AFTER-RULES`
- `AD-FG03-AFTER-TOOLS`
- `AD-FG04-LOWER`
- optional desktop rail and mobile sticky inherited from production configuration.

Exact IDs and dimensions require audit.

## 50. Commerce

A purchase CTA is required when:

- location is sufficiently resolved;
- source/provider status is fresh;
- game is sold;
- transaction intent is natural;
- safety suppression does not apply.

The provider completes final legal geolocation.

---

# PART XII — SEO, SOCIAL AND AI DISCOVERY

## 51. Search Identity

### Powerball title

`Powerball Results, Jackpot, Winning Numbers & Tools | LotteryCorner`

### Mega Millions title

`Mega Millions Results, Jackpot, Numbers & Tools | LotteryCorner`

### H1

Results-first, with global game scope.

## 52. Structured Data

Conceptual:

- `CollectionPage`/`WebPage`;
- `BreadcrumbList` on child pages;
- `WebSite`/`Organization` linkage;
- `VideoObject` only for an actual visible drawing video with complete metadata;
- `Dataset` only on genuine dataset pages;
- `DiscussionForumPosting` on thread pages;
- Article types on news pages.

Avoid unsupported lottery schema and Product/Offer markup on the general hub.

Use stable `@id`, `about`, `mentions`, `isPartOf` and `mainEntity` relationships.

## 53. Stable Fragments

Recommended:

- `#latest-result`
- `#where-to-play`
- `#check-numbers`
- `#ask-ai`
- `#latest-draw`
- `#how-to-play`
- `#prizes-and-odds`
- `#results-history`
- `#jackpot-history`
- `#statistics`
- `#generator`
- `#jurisdictions`
- `#international`
- `#news`
- `#community`

## 54. Server-Visible Content

Required:

- game identity;
- jackpot/result;
- next draw;
- key rules;
- major child links;
- jurisdiction selector;
- international availability statement;
- source/trust;
- visible news/community links.

Personal and geo modules enhance without replacing global crawlable content.

## 55. Content Integrity

- no generic country-name substitution;
- no AI-only unique content;
- no prediction claims;
- no stale add-on availability;
- no claim that an international courier is official;
- exact dates and rule era;
- explain U.S./UK and California exceptions where relevant.

---

# PART XIII — LIFECYCLE, ACCESSIBILITY AND METRICS

## 56. States

- fresh;
- pending;
- verified;
- corrected;
- jackpot reset;
- cutoff passed;
- location uncertain;
- purchase unavailable;
- provider stale;
- video unavailable;
- AI unavailable;
- rule change;
- international mode.

## 57. Accessibility

- WCAG 2.2 AA;
- numbers as text;
- multiplier/add-on labels;
- exact timezones;
- accessible video captions/transcript where available;
- keyboard tool input;
- no color-only balls;
- no autoplay;
- accessible tables;
- focus-safe sticky purchase/ad.

## 58. Metrics

- time to result;
- jackpot engagement;
- number-check completion;
- AI usefulness;
- tool continuation;
- jurisdiction selection;
- location correction;
- purchase eligibility/outbound;
- global-to-local offering click;
- international-guide use;
- community entry;
- save/follow;
- draw-cycle retention;
- ad revenue/viewability;
- SEO performance by root/child route.

## 59. Guardrails

- no wrong-jurisdiction purchase;
- no automatic geo redirect;
- no duplicated draw records;
- no stale cutoff;
- no U.S./UK prize confusion;
- no overseas Mega Millions purchase endorsement;
- no AI prediction claim;
- no private data in public markup;
- no ad before core result.

---

# PART XIV — VISUAL REFERENCES

## 60. Routing Model

![Game routing](bp05-game-routing-map.svg)

## 61. Powerball Desktop

![Powerball global desktop](bp05a-powerball-global-desktop.svg)

## 62. Mega Millions Desktop

![Mega Millions global desktop](bp05a-megamillions-global-desktop.svg)

## 63. Mobile

![Flagship game mobile](bp05a-flagship-global-mobile.svg)

---

# PART XV — EXPERIMENTS AND ACCEPTANCE

## 64. Experiments

1. Jackpot/result hierarchy.
2. Geo-purchase panel placement.
3. IP-detected versus manually selected wording.
4. AI position before/after latest draw detail.
5. U.S./UK comparison prominence.
6. International guide entry.
7. tool ordering.
8. community versus news ordering.
9. purchase sticky behavior.
10. ad density versus current game-page revenue.
11. root-to-local offering conversion.
12. public AI session length.

## 65. Acceptance Criteria

Approve:

1. two-layer global/local architecture;
2. route ownership;
3. IP personalization without auto-redirect;
4. Powerball U.S./UK model;
5. Mega Millions U.S.-only purchase model;
6. section order and content budget;
7. tools on root hub;
8. state pages as local offerings;
9. manifests and monitoring;
10. SEO/schema;
11. advertising and purchase contract;
12. desktop/mobile references.

---

# APPENDIX A — SOURCE REGISTER

## Official game sources

- Powerball home, FAQs, media center, draw results, check numbers and UK launch:
  - `https://www.powerball.com/`
  - `https://www.powerball.com/faqs`
  - `https://www.powerball.com/media-center`
  - `https://www.powerball.com/draw-result`
  - `https://www.powerball.com/check-your-numbers`
  - `https://www.powerball.com/powerball-launch-set-in-the-uk-for-july-21-first-drawing-to-follow`
- UK National Lottery Powerball:
  - `https://www.national-lottery.co.uk/powerball`
  - `https://www.national-lottery.co.uk/games/powerball/about-powerball`
- Mega Millions home, winning numbers, FAQ, where to play, drawing and scams:
  - `https://www.megamillions.com/`
  - `https://www.megamillions.com/winning-numbers.aspx`
  - `https://www.megamillions.com/faqs.aspx`
  - `https://www.megamillions.com/where-to-play`
  - `https://www.megamillions.com/Winning-Numbers/Watch-Latest-Draw.aspx`
  - `https://www.megamillions.com/lottery-scams`

## Official jurisdiction sources

- Illinois Powerball results/play and geolocation terms:
  - `https://www.illinoislottery.com/dbg/results/powerball`
  - `https://www.illinoislottery.com/dbg/play/powerball`
  - `https://www.illinoislottery.com/policy/terms-and-conditions`
- Florida Powerball:
  - `https://floridalottery.com/games/draw-games/powerball`

## Search guidance

- Google locale-adaptive pages:
  - `https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages`
- Google multi-regional sites:
  - `https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites`
