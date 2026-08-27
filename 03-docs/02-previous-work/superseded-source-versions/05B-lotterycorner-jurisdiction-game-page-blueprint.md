# LotteryCorner Jurisdiction Game Page Blueprint

**Document:** `05B-lotterycorner-jurisdiction-game-page-blueprint.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Blueprint package:** BP-04B — Jurisdiction Game Offering  
**Page family:** PF-03 Game Hub, jurisdiction mode  
**Version:** 1.0  
**Status:** Proposed blueprint — ready for founder review  
**Date:** July 24, 2026  
**Delivery class:** Core rebuild  
**Examples:** `/fl/powerball`, `/fl/mega-millions`, `/uk/powerball`, `/fl/pick-3`  
**Primary authority:** Approved Constitution, Experience Architecture, Global Shell, Home, State and `05-lotterycorner-game-page-blueprint-index.md`.

---

## 0. Blueprint Decision

One jurisdiction-game template supports three modes.

### JG-M1 — Minimal Flagship Offering

Examples:

- `/fl/powerball`
- `/mi/powerball`
- `/fl/mega-millions`
- `/uk/powerball`

Purpose:

> Explain how a global flagship game is offered, purchased, claimed and discussed in one jurisdiction.

It remains intentionally minimal and routes universal history, tools, statistics, generator, news and global community to the root game hub.

### JG-M2 — Full State-Native Game

Examples:

- `/fl/pick-3`
- `/ny/numbers`
- `/ca/fantasy-5`
- `/mi/daily-3`

Purpose:

> Own the complete game experience because no separate global game hub exists.

It includes results, rules, prizes, history, statistics, generator, systems, purchase, claims, news and community.

### JG-M3 — Hybrid Multi-Jurisdiction Offering

Used for another shared game when:

- local differences matter;
- a root game hub may or may not exist;
- the page needs more than minimal local content but less than a state-native page.

### 0.1 Core rule

> **The page includes only content whose canonical owner is the jurisdiction offering or whose compact preview is required to complete the local task.**

### 0.2 Visual boundary

The visuals approve structural modes, not final style, copy, data or ad sizes.

---

# PART I — ROUTING AND OWNERSHIP

## 1. URL Pattern

```text
/{jurisdiction-code}/{game-slug}
```

Examples:

```text
/fl/powerball
/fl/mega-millions
/fl/pick-3
/uk/powerball
```

Existing approved URL patterns remain unchanged unless a migration decision explicitly changes them.

## 2. Canonical Decision

### Self-canonical

When the page has substantial unique local content:

- purchase/cutoff;
- local features;
- claim/tax/privacy;
- local winners/news/community;
- responsible-play/contact.

### Redirect or consolidate

If an existing state Powerball page contains only the shared numbers and generic rules, it does not justify a separate thin indexable page.

Before redirecting an existing URL, evaluate:

- current organic traffic;
- backlinks;
- affiliate revenue;
- indexed queries;
- historical internal links.

The preferred destination is a strengthened minimal local offering, not automatic deletion.

## 3. Shared Draw Links

The local page may display the latest numbers, but:

- clicking draw date/numbers opens the global stable draw record;
- results history opens the root game history;
- statistics/generator open root tools;
- global game news opens root news;
- local winner/news/community remains local.

## 4. State-Hub Routing

The State Hub game name/details opens the local offering.

Specific utility links may route directly to their canonical global child page.

---

# PART II — GEO AND PURCHASE

## 5. Location Model

A canonical local page already supplies the content jurisdiction.

IP may additionally identify whether the visitor appears physically eligible for the purchase option.

Example on `/fl/powerball`:

- content jurisdiction: Florida;
- likely physical location: Florida / outside Florida / uncertain.

## 6. IP Purchase Behavior

When IP suggests the visitor is in the local jurisdiction:

- show Buy Tickets/Play Online or retailer option;
- show local cutoff;
- mark location as detected;
- provide Change location.

When IP suggests another location:

- keep the Florida offering page;
- explain that the Florida option may require physical presence;
- offer the visitor’s likely local offering;
- do not auto-redirect.

When confidence is low:

- show Where to Play;
- request location before direct purchase;
- suppress unverified cutoff.

Final provider geolocation controls the sale.

## 7. Action Labels

- **Buy Tickets** — likely eligible verified digital option.
- **Play Online** — official digital lottery terminology.
- **Find a Retailer** — retail path.
- **Where to Play** — unresolved or multiple channels.
- **Not available online in this jurisdiction** — clear no-sale state.

---

# PART III — JG-M1 MINIMAL FLAGSHIP OFFERING

## 8. Section Order

| Order | ID | Section |
|---:|---|---|
| 1 | JO-01 | Local Game Identity and Shared Latest Result |
| 2 | AD-JO00 | Top Advertisement |
| 3 | JO-02 | Buy Tickets / Where to Play / Cutoff |
| 4 | JO-03 | Local Price, Add-Ons and Advance Play |
| 5 | JO-04 | Local Claim, Tax, Privacy and Contact |
| 6 | JO-05 | Local AI, News, Winners and Community |
| 7 | JO-06 | Global Game Tools and Details |
| 8 | JO-07 | Follow Local Offering |
| 9 | JO-08 | Responsible Play, Sources and Corrections |
| 10 | AD-JO01 | Lower Advertisement |
| 11 | Footer | State/global navigation |

## 9. Adaptive Priority

- possible winning match/claim moves first;
- material local rule/cutoff correction appears before commerce;
- pending draw/result appears beside latest result;
- Responsible Play suppresses commerce;
- provider outage replaces Buy with a clear unavailable state.

## 10. Content Budget

The minimal page should generally remain far shorter than the root hub.

Initial limits:

- one result preview;
- one purchase panel;
- five local-feature rows;
- four high-consequence summaries;
- one local AI prompt;
- up to three local news/community items;
- one compact global-tools rail.

## 11. JO-01 — Local Identity and Shared Result

Required:

- `[Game] in [Jurisdiction]`;
- local purpose;
- shared current result preview;
- jackpot/next draw;
- local cutoff preview;
- link to stable global draw;
- full global hub link.

Suggested H1:

`[Game] in [State]: Buy Tickets, Cutoff, Results and Local Rules`

For UK Powerball:

`Powerball UK: Results, How to Play, Prizes and Local Rules`

## 12. JO-02 — Buy Tickets / Where to Play

Required:

- detected physical location;
- content jurisdiction;
- provider/option classification;
- cutoff;
- price;
- age;
- precise-geolocation requirement;
- last verified;
- compensation disclosure;
- Change location;
- final-provider-verification statement.

## 13. JO-03 — Local Features

Powerball examples:

- Power Play;
- Double Play;
- bundled price;
- advance play;
- quick ticket;
- subscription/app;
- local draw display.

Mega Millions:

- local online/retail;
- cutoff;
- California pari-mutuel exception;
- advance play;
- account/app.

UK Powerball:

- £4 play;
- UK lower-tier prizes;
- 30-year jackpot payment;
- local purchase/claim;
- no assumed U.S. add-ons.

## 14. JO-04 — Claim, Tax, Privacy and Contact

Compact cards:

- claim deadline;
- cash-option election deadline where relevant;
- claim thresholds/location;
- state/federal tax;
- anonymity/publicity;
- official operator contact;
- source/effective date.

High-protection: no affiliate CTA.

## 15. JO-05 — Local AI, News, Winners and Community

AI answers local questions:

- cutoff;
- online purchase;
- Double Play;
- claim;
- local winner;
- local discussion.

Local-only content avoids duplicating global news and forum.

## 16. JO-06 — Global Tools and Details

Prominent links to:

- root hub;
- results history;
- check numbers;
- jackpot history;
- statistics;
- generator;
- systems;
- global news;
- global community;
- Power Play/Double Play/multiplier guide.

## 17. JO-07 — Follow Local Offering

User-selected:

- result;
- cutoff reminder;
- jackpot;
- feature/rule change;
- local winner/news;
- local discussion.

## 18. JO-08 — Trust

- local source;
- operator;
- LotteryCorner role;
- correction;
- affiliate;
- Responsible Play;
- scam warning where useful.

---

# PART IV — JG-M2 FULL STATE-NATIVE GAME

## 19. Section Order

| Order | ID | Section |
|---:|---|---|
| 1 | JG-01 | Game Identity, Latest Result and Next Draw |
| 2 | JG-02 | Buy / Where to Play / Cutoff |
| 3 | AD-JG00 | Top Advertisement |
| 4 | JG-03 | Check My Numbers |
| 5 | JG-04 | Game AI |
| 6 | JG-05 | Live and Upcoming Variants |
| 7 | JG-06 | How to Play, Prize Types and Odds |
| 8 | AD-JG01 | Post-Core Advertisement |
| 9 | JG-07 | Results History |
| 10 | JG-08 | Number History |
| 11 | JG-09 | Statistics and Patterns |
| 12 | JG-10 | Generator |
| 13 | JG-11 | Systems and Player Methods |
| 14 | AD-JG02 | Post-Tools Advertisement |
| 15 | JG-12 | Local Purchase and Offering |
| 16 | JG-13 | Claim, Tax and Privacy |
| 17 | JG-14 | Worth Knowing |
| 18 | JG-15 | Local News and Winners |
| 19 | JG-16 | Community |
| 20 | JG-17 | Save, Follow and Alerts |
| 21 | JG-18 | Sources, Methodology and Responsible Play |
| 22 | AD-JG03 | Lower Advertisement |
| 23 | Footer | State/game navigation |

## 20. Variant Handling

Games may have:

- midday/evening;
- multiple daily draws;
- straight/box/combo;
- Fireball/wild ball;
- add-on;
- draw and instant variants.

Every result, rule, tool and alert must identify the variant.

## 21. JG-01 — Identity and Latest Result

Required:

- state/game;
- variant;
- latest result(s);
- next draw;
- price/top prize;
- current status;
- stable draw;
- check;
- follow;
- purchase.

## 22. JG-02 — Purchase and Cutoff

Uses the same IP and provider contract.

For retail-only games, show Find a Retailer rather than a misleading Buy Online.

## 23. JG-03 — Check My Numbers

Must understand:

- variant;
- play type;
- add-on;
- draw date;
- prize rule.

## 24. JG-04 — Game AI

Examples:

- explain straight versus box;
- explain the latest result;
- configure a history/statistics query;
- generate sets;
- summarize a state-game thread;
- answer purchase/claim.

## 25. JG-05 — Live and Upcoming Variants

Shows each current variant clearly.

## 26. JG-06 — How to Play, Prizes and Odds

Use examples and a neutral comparison.

Do not say which wager is “best” or recommend spending strategy.

## 27. JG-07 — Results History

Variant-aware, stable records, bounded pagination.

## 28. JG-08 — Number History

Search exact number or digit pattern.

## 29. JG-09 — Statistics and Patterns

Deterministic:

- frequency;
- gaps;
- pairs;
- sums;
- digit positions;
- repeats;
- odd/even;
- variant comparison.

No predictive claim.

## 30. JG-10 — Generator

Variant and play-type aware; save and track.

## 31. JG-11 — Systems and Player Methods

- LotteryCorner systems;
- member systems;
- track performance;
- discuss method;
- clearly historical/non-predictive.

## 32. JG-12 — Local Offering

- ticket price;
- retailer/online/app;
- cutoff;
- advance play;
- add-ons;
- source.

## 33. JG-13 — Claim, Tax and Privacy

Routes to state guide but remains game-aware.

## 34. JG-14 — Worth Knowing

Maximum three:

- recent pattern fact;
- rule/schedule change;
- winner/unclaimed prize;
- active question;
- game milestone.

## 35. JG-15 — News and Winners

Local game stories.

## 36. JG-16 — Community

- recurring monthly threads;
- draw reactions;
- systems;
- questions;
- contributors;
- AI Research Notes.

## 37. JG-17 — Save, Follow and Alerts

- number sets;
- variants;
- result;
- reply;
- cutoff;
- rule change.

## 38. JG-18 — Trust

- sources;
- rule version;
- methodology;
- corrections;
- Responsible Play;
- AI/affiliate disclosure.

---

# PART V — JG-M3 HYBRID MODE

## 39. Root-Hub Decision

Create a root game hub only if:

- the game has meaningful cross-state search demand;
- shared results/history/tools create value;
- local pages would otherwise duplicate substantial content;
- there is operating capacity.

Until then:

- jurisdiction pages own the game experience;
- shared data still uses one game/draw entity internally;
- a future root hub can be added without changing state routes.

---

# PART VI — SIGNED-IN / INSIDER

## 40. Personal Priority

1. possible win;
2. pending result;
3. upcoming followed draw/cutoff;
4. saved numbers/system;
5. reply;
6. meaningful rule/news;
7. qualified purchase.

## 41. Personal Modules

- My Game Summary;
- Saved Matches;
- Next Draws;
- Personal AI;
- Saved Tools/Systems;
- Following/Replies;
- Local Purchase;
- Controls.

Insider adds advanced tracking and longer AI memory.

---

# PART VII — MOBILE

## 42. Minimal Offering Mobile

1. local identity/shared result;
2. purchase/cutoff;
3. top ad;
4. features;
5. claim/tax/privacy;
6. local AI/news/community;
7. global tools;
8. follow/trust;
9. lower ad/footer.

## 43. State-Native Mobile

1. identity/result;
2. purchase/cutoff;
3. top ad;
4. check;
5. AI;
6. live/variants;
7. how to play/prizes;
8. history;
9. statistics;
10. generator/systems;
11. local offer/claim;
12. news/community;
13. save/trust;
14. lower ad/footer.

## 44. Mobile Rules

- no horizontal-swipe-only variants;
- purchase never obscures result;
- explicit state and physical-location context;
- one sticky element;
- accessible tables;
- exact dates/times;
- quick switch among variants.

---

# PART VIII — CONTENT BUDGET

## 45. Minimal Offering

- one shared result preview;
- one purchase panel;
- five feature facts;
- four help facts;
- three local content items;
- global-link rail.

## 46. State-Native

- latest results for current variants;
- up to five history rows;
- compact how-to/prize summary;
- selected statistics;
- three news/community/highlight items;
- full content on child pages/expanded tools.

---

# PART IX — DATA AND OPERATIONS

## 47. Jurisdiction Game Offering Manifest

Required:

- game ID;
- jurisdiction;
- offering mode;
- route/canonical;
- selling status;
- variants;
- price;
- draw schedule;
- cutoff;
- online/app/subscription/retail/courier;
- age/geolocation;
- add-ons;
- advance play;
- prize exceptions;
- claim deadline/location;
- tax/anonymity;
- contact;
- responsible-play;
- local news/community capability;
- source;
- last verified;
- owner;
- freshness/correction.

## 48. State-Native Game Manifest

Adds:

- number matrix;
- play types;
- prize table;
- odds;
- rule eras;
- result variants;
- tool capabilities;
- generator constraints;
- statistics fields;
- local systems/community taxonomy.

## 49. Monitoring

| Data | Requirement |
|---|---|
| Result/status | Event-driven |
| Schedule/cutoff | Event-driven + daily |
| Purchase/provider | Daily + outage |
| Price/add-ons | Weekly + rule alert |
| Claim/tax/privacy | Monthly + change alert |
| Game rules | Official-source alert |
| News/community | Continuous |
| Statistics | After verified draw |

## 50. Correction

Propagate to:

- local page;
- root draw/hub;
- state hub;
- saved matches;
- AI;
- notifications;
- metadata/schema;
- community current-fact banner;
- purchase module.

---

# PART X — ADVERTISING AND COMMERCE

## 51. Ad Tier

- minimal offering: Tier 1–2;
- state-native: Tier 2;
- tools/community child pages: controlled Tier 3.

## 52. Anchors

Minimal:

- `AD-JO00-TOP`
- `AD-JO01-LOWER`
- optional rail.

State-native:

- `AD-JG00-TOP`
- `AD-JG01-AFTER-CORE`
- `AD-JG02-AFTER-TOOLS`
- `AD-JG03-LOWER`.

Exact production IDs/sizes require audit.

## 53. Commerce Guardrails

- Buy label only with fresh likely eligibility.
- IP location shown and changeable.
- precise provider geolocation final.
- compensation near affiliate CTA.
- no purchase inside claim/potential-win flow.
- no “try again” after loss.
- no default sticky ad plus sticky purchase.

---

# PART XI — SEO, SCHEMA AND AI DISCOVERY

## 54. Search Identity

### Minimal flagship offering title

`Powerball in Florida: Results, Cutoff & Where to Play | LotteryCorner`

### State-native title

`Florida Pick 3 Results, Winning Numbers & History | LotteryCorner`

Titles are adapted to real game intent, not generated mechanically.

## 55. Structured Data

Conceptual:

- `WebPage` or `CollectionPage`;
- `BreadcrumbList`;
- stable jurisdiction and game entity IDs;
- `about`, `mentions`, `isPartOf`, `mainEntity`;
- Article/thread types on child pages;
- no unsupported lottery/Product markup.

## 56. Stable Fragments

Minimal:

- `#latest-result`
- `#where-to-play`
- `#local-features`
- `#claim-tax-privacy`
- `#local-news-community`
- `#global-tools`

State-native:

- `#latest-result`
- `#check-numbers`
- `#how-to-play`
- `#prizes-and-odds`
- `#results-history`
- `#statistics`
- `#generator`
- `#systems`
- `#where-to-play`
- `#community`
- `#news`

## 57. Content Integrity

- local page must contain real local facts;
- no state-name substitution;
- no duplicated global tool content;
- no AI-only unique content;
- omit unavailable facts;
- exact variant/rule era;
- state-specific source/effective date.

## 58. Server Visibility

Required:

- local identity;
- latest result preview;
- price/cutoff/purchase classification;
- local features;
- claim/tax/privacy summaries;
- global tool links;
- source/trust;
- local news/community links.

Personal/geo purchase state enhances without hiding the baseline.

---

# PART XII — LIFECYCLE, ACCESSIBILITY AND METRICS

## 59. States

- offering active;
- not sold;
- retail-only;
- online available;
- cutoff passed;
- outside jurisdiction;
- provider stale/outage;
- game suspended/retired;
- result pending/corrected;
- rule under review.

## 60. Accessibility

- WCAG 2.2 AA;
- numbers as text;
- variants explicit;
- tables with headers;
- no color-only add-ons;
- local-time labels;
- keyboard purchase/location;
- no automatic geo redirect;
- sticky elements do not obscure controls.

## 61. Metrics

Minimal:

- local result to global draw;
- purchase eligibility/outbound;
- location correction;
- global tool click;
- claim/help use;
- local news/community;
- SEO local query performance.

State-native:

- result/check;
- history/statistics/generator;
- save/follow;
- community;
- purchase;
- draw-cycle retention;
- ad revenue.

## 62. Guardrails

- no thin local duplicate;
- no wrong-state purchase;
- no global draw duplication;
- no stale cutoff;
- no prescriptive “best game”;
- no prediction claim;
- no claim/purchase conflict;
- no private data in public markup.

---

# PART XIII — VISUAL REFERENCES

## 63. Minimal Flagship Offering

![State flagship offering](bp05b-state-flagship-offering-desktop.svg)

## 64. State-Native Game

![State native game](bp05b-state-native-game-desktop.svg)

## 65. Mobile

![Jurisdiction game mobile](bp05b-jurisdiction-game-mobile.svg)

---

# PART XIV — EXPERIMENTS AND ACCEPTANCE

## 66. Experiments

1. minimal page length;
2. local result preview depth;
3. Buy versus Where to Play wording;
4. IP-detected outside-state message;
5. global-tools rail prominence;
6. local AI/news/community grouping;
7. state-native result variant layout;
8. statistics/tool ordering;
9. community versus news order;
10. ad density versus current revenue.

## 67. Acceptance Criteria

Approve:

1. three offering modes;
2. minimal flagship local page;
3. full state-native page;
4. route/canonical and draw ownership;
5. IP purchase behavior;
6. local/global click routing;
7. content budgets;
8. manifests and freshness;
9. SEO/schema;
10. ads/affiliate;
11. visuals.

---

# APPENDIX A — OFFICIAL SOURCE REGISTER

- Powerball global and jurisdiction rules:
  - `https://www.powerball.com/`
  - `https://www.powerball.com/faqs`
  - `https://floridalottery.com/games/draw-games/powerball`
  - `https://www.illinoislottery.com/dbg/results/powerball`
  - `https://www.illinoislottery.com/policy/terms-and-conditions`
- UK Powerball:
  - `https://www.national-lottery.co.uk/powerball`
- Mega Millions:
  - `https://www.megamillions.com/`
  - `https://www.megamillions.com/faqs.aspx`
  - `https://www.megamillions.com/where-to-play`
- Google geo/locale crawling:
  - `https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages`
