# State Page — Final Content IA, Schema, Prototype Delta and V1 Specification

**Task:** LRG-DEC-027
**Version:** 1.0
**Status:** FINAL CONTENT MODEL for phase one — governed by `FD-N-01`…`FD-N-12`
**Date:** 2026-07-29
**Binding decisions:** `03-docs/08-decisions/state-page-national-content-model-decisions.md` (v1.1)
**Acceptance record:** `state-page-national-research-acceptance-and-gaps.md`

> **CORRECTED BY LRG-DEC-028.** `FD-N-03`, `FD-N-10` and `FD-N-11` were superseded and replaced.
> **`Buy Now` is the primary State-page commerce CTA**, entering a first-party purchase-options resolver;
> **S-07 is the complete `Buy Now` / purchase-options resolver experience**; `Where to Play` and
> `Find a Retailer` are resolver outcomes or supporting links, never the primary CTA. The three-category
> contextual-AI cap is removed — AI entries are **selective**, not capped. Section IDs and PF-02 order are
> unchanged.

> **PF-02 order is binding and unchanged.** This document allocates *content, budget, routing and schema*
> within the approved section order. It adds no section, removes none, and resequences none. The PF-02 §12.1
> Adaptive Priority set remains exactly five.

---

## 1. Final State-hub content model

One row per PF-02 governed section, in PF-02 order. **Budget** is the hub's share; everything beyond it routes.
**Adv.** is the advertising relationship (`FD-S-21` protected zones are absolute).

| § | Section | Primary user intent | Status | Hub budget | Dedicated destination | Source dependency | Freshness | AI role | Commerce role | Schema | Mobile behaviour | Empty / unavailable | Adv. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S-01 | State identity & task header | *Am I in the right place, and is this current?* | **Required** | H1 + operator + freshness + timezone + a compact task/action area | — | Manifest: operator, timezone, result freshness | **Very high** | None (entry point only) | **`Buy Now` permitted in the task/action area — but only AFTER the first-result priority is satisfied** (`FD-N-03` placement 1). Never above the first verified result on mobile | Part of page `WebPage`/`CollectionPage` | Band 1; compact, one line each | Never empty; staleness badge if stale | **No ad above the first result** (`FD-X-04`) |
| AD-S00 | Ad anchor | — | Required | — | — | — | — | — | — | — | **Desktop ≥992 px only** (`FD-X-04`) | — | Governed |
| S-02 | Latest State results | *Show me the numbers* | **Required** | Primary group + compact multi-state + **≤4 native groups** (`FD-N-01`) | Game pages · latest-result · date-result · yearly archive | Results feed + governed formats | **Very high** | Contextual AI: **current result, pending status, correction** — placed **selectively**, never one button per card | **`Buy Now` permitted on ELIGIBLE multi-state feature surfaces and ELIGIBLE State-native game surfaces** (`FD-N-03` placements 2–3). **Suppressed** inside possible-win/correction notices and **not dominant after a confirmed losing result** | `ItemList` **only** for the visible ordered collection | Bands 2–4; grouped variants; no horizontal scroll for verification | "No result passed verification" + official link | **No ad inside the grid, none between title and numbers** |
| S-03 | State AI brief | *Explain this to me* | **Required** | **One** persistent entry + **one** shared answer surface receiving every contextual entry | — | Governed manifest + verified results only | High | **The shared surface itself.** Every section's contextual entry writes here — no per-section chatbot | **Never recommends a provider.** May explain `Buy Now` purchase-option differences, never determine eligibility | No AI-specific schema | One entry; panel below | Not-connected state shown honestly | **Never inside an AI answer** |
| AD-S01 | Ad anchor | — | Required | — | — | — | — | — | — | — | First mobile ad, **after** the first result | — | Governed |
| S-04 | Live & upcoming draws | *When is the next draw / cutoff?* | **Conditional** | **Compact summary only** — next 2–3 draws + one link (`FD-N-12` item 3) | **Schedule page** (full table) | Manifest schedule + cutoffs | High | Contextual AI: **schedule, cutoff and user-timezone explanation** — the conversion itself stays deterministic | Access only. **A cutoff-aware `Buy Now` may appear on an eligible game surface, never inside a pending-status notice** | `WebPage`; `ItemList` on the schedule page | Compact list, not a 10-row table | Unavailable + official schedule link | May follow, never between status and result |
| S-05 | Check my ticket | *Did I win?* | **Required at experience level** | Entry + official route | Claim guide | Governed formats | High | **None for comparison** (`FD-S-17`). AI may explain *how* checking works and interpret a displayed outcome | **`Buy Now` MUST NOT be the dominant action after a confirmed losing result** (`FD-N-03`). No commerce between input and output | `WebPage` | Single action | Informational route; **no disabled form** | **Never between input and output** |
| S-06 | State game portfolio | *What games exist?* | **Required** | **Compact summary** + link | **Game pages** | Game registry + published odds | Medium | Contextual AI: **game rules, formats, multipliers and add-ons** | **`Buy Now` permitted per eligible game row**; availability line where not eligible. Never a game recommendation | `ItemList` if visibly listed | Grouped, compact | Per-game absence stated | Rail-eligible when substantive |
| AD-S02 | Ad anchor | — | Required | — | — | — | — | — | — | — | Device-exclusive pair | — | Governed |
| S-07 | Where to Play *(governed PF-02 section ID and position unchanged)* | *Can I buy, and where?* | **Conditional** | **The complete `Buy Now` / purchase-options resolver experience** — all options, ordering, provider type, material differences and disclosure | Official operator · retailer locator · courier/affiliate destinations | **Verified** eligibility **per game**, plus location, age and cutoff freshness | High | Contextual AI: **`Buy Now` and purchase-option explanation** — explains the resolved options and their differences; **never determines eligibility and never recommends a provider** | **THE commerce section.** `Buy Now` is the entry; this section is where the resolver's options render in the fixed `FD-N-10` order, each labelled by provider type, with **conspicuous adjacent disclosure before action** on every compensated option | `WebPage`; **no `Offer`** unless LotteryCorner visibly presents a real verified offer and the markup does not imply official State sale | **Inline. No sticky `Buy Now` while the governed sticky advertisement is active** (`FD-N-03`) | `unknown` / `underReview` / stale → render the **explanation outcome**, not a transactional action; `Where to Play` / `Find a Retailer` may appear as the supporting link | **Suppressed in protected context** (`FD-S-21`) |
| S-08 | Claims, taxes, anonymity | *What do I do now?* | **Required (summary)** | **Compact claim routing only**; **no tax guide on the hub** (`FD-N-12`) | **Claim guide** · **tax/anonymity guide** | Officially sourced + effective dates | Medium | Contextual AI: **claim/help explanation grounded in official sources.** Never tax advice, never a claim outcome | **None — `Buy Now` is forbidden here** (`FD-N-03`) | `WebPage`; **never `GovernmentService`** | Compact | Per-fact unavailable + official link | **Protected — no ad** |
| S-08A | State essentials | *Quick facts* | **Required** | 6–8 compact facts | Guides | Manifest, per fact | Medium | Interesting-fact only | Online status as a fact | Part of page schema | Compact strip | Individual facts unavailable | **No ad inside** |
| S-09 | What changed | *What's new since I was here?* | **Conditional** | Deterministic local diff | Result/news pages | Local marker + feed version | High | **Deterministic** — AI may summarise real changes, never invent them | None | `WebPage` | Compact | Suppress when nothing changed | No ad inside |
| S-10 | History & tools | *Show me history* | **Conditional** | **Compact destination list** | **Archives · schedule · game pages** | Real routes only | Medium | Contextual AI: **history/archive interpretation** — **never predictive** (`FD-X-10`) | None | `WebPage` | Compact list | Suppressed without real destinations | Rail-eligible when substantive |
| AD-S03 | Ad anchor | — | Required | — | — | — | — | — | — | — | — | — | Governed |
| S-11 | Scratchers | *What's available?* | **Conditional — suppressed** | Compact official outbound **only** | Scratcher hub *(gated by `FD-N-06`)* | 7 requirements of `FD-N-06` | Medium | Explain second chance | Outbound only | `CollectionPage` on the hub page only | Summary line | **Suppressed** (Florida meets 0 of 7) | No ad in a thin module |
| S-12 | Winners & unclaimed | *Notable wins* | **Suppressed in phase one** (`FD-N-08`) | **None** | News · winner story *(later)* | Official/news + correction workflow | — | — | None | — | — | **Suppressed** | — |
| S-13 | Fund allocation | *Where does the money go?* | **Conditional** | Compact + period | Guide | Sourced report + reporting period | Low | Summarise | None | `WebPage` | Compact | Suppressed | No ad |
| S-14 | Community | *Ask a real person* | **Required hub, compact** (`FD-N-05`) | **Compact cold-start entry** | **No indexed route until real activity** | Real human content only | — | Contextual AI: **community-question assistance where genuine community exists**; never fabricates activity | None | `QAPage` **only** on a real question page | Compact | Genuine cold start | **Not an ad host** (`APP-ST-04`) |
| S-15 | News & guides | *What's new?* | **Required hub** | 3 latest or honest empty | **News articles** | Real editorial only | High | Contextual AI: **sourced State news summary**, labelled | None | `Article`/`NewsArticle` **on the article page only** | Compact | Honest sparse hub | **Not an ad host** |
| S-16 | Follow State | *Keep me updated* | **Required** | **Informational only** (`FD-N-04`) | Account *(deferred)* | — | — | None — no intelligence adds value | None | — | Text, **zero controls** | Informational | No ad |
| S-17 | Sources, methodology, responsible play | *Can I trust this? I need help* | **Required** | Sources + update process + correction policy + independence + responsible-play route | Policy pages | Our own policy + official help | Medium | Explain provenance and limits. **No AI in the responsible-play path** | **None — `Buy Now` is forbidden here** (`FD-N-03`) | `WebPage` | Reachable from a top anchor | Contact unavailable rather than invented | **Protected — no ad** |
| S-18 | All States | *Change State* | **Required** | Registry-driven directory | State routes | Route registry | Low | None | None | Part of page schema | Compact | — | Rail-eligible |
| AD-S04 | Ad anchor | — | Required | — | — | — | — | — | — | — | — | — | Governed |
| Footer | Global footer | — | Required | — | — | — | — | — | — | — | — | — | Sticky ad layer separate |

### 1.1 Intelligence-layer declaration (Global Shell §10.5, `FD-N-11`)

Every governed section must declare one layer. Recorded here so the requirement is auditable:

| Layer | Sections |
|---|---|
| **AI + deterministic handoff** | S-02 (result/status) · S-04 (timezone conversion is deterministic; AI explains) · S-07 (resolver is deterministic; AI explains options) · S-08 (official sources) |
| **AI** | S-03 (the shared surface) · S-06 (game/add-on) · S-10 (history interpretation) · S-15 (sourced news summary) |
| **Deterministic** | S-05 (comparison — never AI, `FD-S-17`) · S-09 (local diff) |
| **Static** | S-08A · S-13 · S-17 (responsible-play path carries no AI) |
| **Community** | S-14 (assistive drafting only, where genuine activity exists) |
| **None — recorded decision that no intelligence layer adds value** | S-01 (entry point only) · S-16 · S-18 |

**There is no category cap.** Entries are placed where a section has a meaningful explanatory need, and are
**selective**: no `Explain` button on every result card, no per-section chatbot, no repeated identical prompts,
and no AI element where static or deterministic content is clearer.

### 1.2 Module classification — corrections applied

Adopting the report's classification with the three `FD-N` corrections:

- **Upcoming draws:** *conditional on hub* → **COMPACT SUMMARY + DEDICATED PAGE**
- **Unclaimed prizes:** *conditional on hub* → **SUPPRESS (phase one)**
- **Datasets/downloads:** *suppress until sourced* → **OUT OF PHASE ONE** (no markup, no page)
- **Prediction modules:** **REJECT** — unchanged and absolute

---

## 2. Dedicated-page content cluster

| Page family | Intent | Unique content it must own | Indexable | Canonical | Source / freshness | Schema | Internal links | AI opportunity | Commerce boundary | Launch phase |
|---|---|---|---|---|---|---|---|---|---|---|
| **State hub** | Current State truth | Current results, status, freshness, routing | Yes | Self | Feed; very high | `CollectionPage` **or** `WebPage` + `BreadcrumbList` *(+ `Organization`, `AdministrativeArea`, `ItemList` conditionally)* | → every family below | Shared surface + selective contextual entries | **`Buy Now` at the 4 approved placements; S-07 carries the resolver** | **1** |
| **State game page** | Learn one game | Rules, fields, odds, add-ons, full history entry | Yes | Self | Medium/high | `WebPage`/`ItemPage` + `BreadcrumbList` *(+ `Game` semantic only)* | ↔ hub, archive, latest result | **Explain add-on** — highest-value AI | **`Buy Now` when that game is verified eligible**; availability line otherwise | **1** |
| **Latest-result page** | Verify the newest draw | Exact numbers, source status, correction state, prize | Yes | Self | Very high | `WebPage`/`ItemPage` + `BreadcrumbList` | ↔ game page, date-result | Explain result; pending→verified | **None inside verification.** A `Buy Now` for the *next* draw may sit outside the result block, never after a confirmed loss | **1** |
| **Draw-date result page** | Verify one specific draw | Exact draw date/time and that draw's values | Yes | Self | Medium | `WebPage` + `BreadcrumbList` | ↔ archive, game page | Historical answer | Minimal | **2** |
| **Yearly archive** | Browse by year | Aggregated per-year collection | Yes | Self | Medium | `CollectionPage` + `BreadcrumbList` + `ItemList` | ↔ date-result, game page | Query interpretation | None | **2** |
| **Schedule page** | Draw times and cutoffs | Full per-game table + cutoff rules + timezone | Yes | Self | Medium/high | `WebPage` + `ItemList` + `BreadcrumbList` | ↔ hub, game pages | Timezone conversion (**deterministic**) | **Cutoff-aware `Buy Now` permitted per eligible game row** | **1** |
| **Claim guide** | Claim safely | Deadlines, documents, mail/in-person options, disclosure | Yes | Self | Medium/high | `WebPage` + `BreadcrumbList` *(+ `FAQPage` if visible and maintained)* | ↔ hub, official operator | Claim-step explanation | **None** | **1** |
| **Tax / anonymity guide** | Understand consequences | Per-jurisdiction tax status and privacy rules with effective dates | Yes | Self | Medium/high | `WebPage` + `BreadcrumbList` | ↔ hub, claim guide | Explain **with non-advice boundary** | None | **2** |
| **Scratcher hub** | Browse instant games | Catalogue with stable ids, price, prizes, expiry | **Conditional** | Self | Medium | `CollectionPage` + `ItemList` | ↔ hub, official | Explain second chance | Outbound | **3** — `FD-N-06` |
| **Second-chance page** | Enter a promotion | Current promotions, dates, eligibility, submission | **Conditional** | Self | High | `WebPage` + `BreadcrumbList` | ↔ hub, official | Eligibility explanation | No | **3** — `FD-N-07` |
| **News article** | Timely State news | Reported editorial | Yes | Self | High | `Article`/`NewsArticle` + `BreadcrumbList` + `Organization` | ↔ hub, winner story | Summarise sourced news | Rarely | **3** |
| **Winner story** | Legitimate news interest | Reported, sourced winner narrative | Yes | Self | Medium | `NewsArticle` + `BreadcrumbList` | ↔ news, hub | Summarise | None | **3** — `FD-N-08` |
| **Community question** | Genuine user Q&A | One real question with real answers | **Conditional** | Self | Medium | **`QAPage`** + `BreadcrumbList` | ↔ hub, game page | Assistive drafting only | None | **3** — `FD-N-05` |
| **Tools / history** | Descriptive history | Frequency, jackpot history, correction history | Yes | Self | Medium | `WebPage` + `BreadcrumbList` | ↔ archive, game page | Interpret, **never predict** | None | **2** |
| **Downloadable dataset** | Machine-readable results | A **real** accessible file or feed | — | — | High | **NONE until `FD-N-09` is satisfied** | — | Natural-language access | None | **Out of scope** |

**[RE] The hub must not absorb long-tail queries.** Each family above owns its own intent; the hub owns
*current State truth* and routes.

---

## 3. Final schema matrix — conservative

**Standing rules.** Structured data represents **visible** content only. `Organization` identifies
**LotteryCorner**, never the State operator. **No `GovernmentService`** for our independent service.
**No `Event`** for routine draws. **No special AI schema.** Unsupported types may aid semantic understanding
but **carry no rich-result promise**.

**[EV] Current-guidance note.** Multiple secondary SEO sources (accessed 2026-07-28) report that **Google
deprecated FAQ rich results on 7 May 2026**, removing the search appearance and Rich Results Test support in
June 2026 and Search Console API support in August 2026, while **`FAQPage` remains a valid Schema.org type**.
**This is secondary evidence and requires primary confirmation against Google Search Central.** **[RE]** Either
way the conclusion is the same: **never add `FAQPage` for a rich result.** Add it only where an FAQ is
genuinely visible, useful and maintained.

| Page family | Recommended | Conditional additions | Do not use / cautions |
|---|---|---|---|
| **State hub** | `CollectionPage` **or** `WebPage` + **`BreadcrumbList`** | `Organization` (LotteryCorner) · `AdministrativeArea` (the State as subject) · `ItemList` **only** for the visible ordered result collection | **No `GovernmentService`** · **No `Event`** · no `Offer` · no `Dataset` family · no `FAQPage` for rich results |
| **State game page** | `WebPage`/`ItemPage` + `BreadcrumbList` | `Game` — **semantic only**, and only where properties truthfully describe the visible game | Do not assert unsupported properties; no `Event` per draw |
| **Latest-result page** | `WebPage`/`ItemPage` + `BreadcrumbList` | `ItemList` for the visible number collection | **Do not misuse `Event`** for the drawing |
| **Draw-date result page** | `WebPage` + `BreadcrumbList` | `ItemList` | Same `Event` caution |
| **Yearly archive** | `CollectionPage` + `BreadcrumbList` + `ItemList` | — | **Avoid empty archive pages** — thin-content risk |
| **Schedule page** | `WebPage` + `BreadcrumbList` | `ItemList` | **No `Event`** merely because draws are scheduled |
| **Claim guide** | `WebPage` + `BreadcrumbList` | `FAQPage` if visible and maintained | **Never `GovernmentService`**; no legal overclaiming |
| **Tax / anonymity guide** | `WebPage` + `BreadcrumbList` | `FAQPage` if visible and maintained | No legal overclaiming; no advice framing |
| **Scratcher hub** | `CollectionPage` + `BreadcrumbList` | `ItemList` | **Suppress entirely if data is thin** |
| **Second-chance page** | `WebPage` + `BreadcrumbList` | — | No `Offer` implying we sell entries |
| **News article** | `Article`/`NewsArticle` + `BreadcrumbList` + `Organization` | `VideoObject` if a real video is present | **Editorial pages only** — never the hub |
| **Winner story** | `NewsArticle` + `BreadcrumbList` | — | Only published, sourced detail |
| **Community question** | **`QAPage`** + `BreadcrumbList` | `Question` / `Answer` | **Only where users can genuinely answer.** Never `FAQPage` for community content |
| **Tools / history** | `WebPage` + `BreadcrumbList` | `ItemList` | No predictive framing in any property |
| **Downloadable dataset** | **None** | — | **`Dataset`/`DataFeed`/`DataDownload` forbidden until `FD-N-09` is satisfied.** No placeholder pages |

**Competitor markup: `UNDER REVIEW`.** Neither the research report nor LRG-STATE-026 inspected competitor
JSON-LD, microdata, RDFa, Open Graph or X/Twitter payloads. **No decision above depends on competitor markup.**

**Metadata (all families):** unique title · unique meta description · single unique H1 · correct canonical ·
`BreadcrumbList` matching visible breadcrumbs · visible last-updated where relevant. **No `SearchAction`**
until a working public search route exists. Canonical host and trailing-slash decisions remain deferred
(`FD-S-32`).

---

## 4. Florida Prototype V0 delta

Baseline: commit **`1d5420b`**, which renders **16** sections and suppresses **3** (S-11, S-12, S-13).
*(The research report's "13 rendered / 6 suppressed" describes the pre-LRG-STATE-025 state — corrected.)*

| # | V0 element | Disposition | What must happen · behaviour to preserve on REPLACE/REMOVE |
|---|---|---|---|
| 1 | Identity / freshness (S-01) | **KEEP AND RESTYLE** | Keep operator, freshness, timezone, staleness badge. Tighten to reduce the H1's 3-line wrap at 390 px |
| 2 | First-result selection | **KEEP** | The report says REPLACE for adaptiveness; V0 **already** selects by recency and never by jackpot, and the five PF-02 overrides already outrank it. **Correction:** no replacement needed — the required urgency adaptiveness is the override mechanism, which exists |
| 3 | 19-event grouping into 10 families | **KEEP the grouping · REDUCE the inline surface** | Grouping is correct and mandatory (`FD-X-06`). But all 10 families render inline; `FD-N-01` caps the first mobile experience at primary + compact multi-state + **≤4 native groups**, with the rest behind **View all results** and game pages |
| 4 | Powerball / Mega Millions strip | **KEEP AND RESTYLE** | Keep compact mobile strip + desktop featured pair, after the first verified result (`FD-N-02`). Restyle so it does not visually eclipse native games |
| 5 | Florida-native ordering | **KEEP** | Deterministic, neutral, jackpot-scale low-weight. Already `FD-X-06`-compliant |
| 6 | **20 contextual Explain actions** | **REDUCE — repetition, not categories** | **Corrected by LRG-DEC-028.** The defect is *mechanical repetition* — two buttons on each of ten cards — not the category count. Remove the per-card repetition and place entries **selectively** where a section has a meaningful explanatory need, across the eight approved `FD-N-11` categories. **No three-category ceiling.** **Preserve:** the dispatch mechanism, focus movement to the shared surface, and the genuine (non-fake) handler |
| 7 | One shared AI surface | **KEEP** | Proven: one panel receives every entry. Keep the not-connected state and grounding list; keep AI disconnected |
| 8 | S-04 schedule (10-row inline table) | **MOVE TO DEDICATED PAGE** | Hub keeps a **compact next-2–3-draws summary + one link**. **Preserve:** grouped frequent-draw rows, per-family draw times, cutoff column and the timezone footnote — on the schedule page |
| 9 | S-05 ticket checking | **KEEP** | Informational route, no disabled form, comparison never AI |
| 10 | S-06 game comparison | **KEEP AND RESTYLE** | Valuable **only** with strictly sourced odds and fields. Florida `publishedOdds` is `unavailable`, so keep it factual-attribute-only until sourced |
| 11 | S-07 Where to Play | **REPLACE — becomes the `Buy Now` resolver** | **Corrected by LRG-DEC-028.** S-07 becomes the complete purchase-options resolver experience: all resolved options in the fixed `FD-N-10` order, provider type and material differences shown, **conspicuous adjacent disclosure before action** on every compensated option. **Preserve:** the eligibility ladder, `unknown`/`underReview` handling, protected-zone suppression, and Florida remaining **`underReview`**. `Where to Play` / `Find a Retailer` survive as a resolver **outcome/supporting link**, not the CTA. **No sticky `Buy Now` while the sticky ad is active** |
| 12 | S-08 / S-08A help | **KEEP AND RESTYLE + REDUCE** | Keep the officially sourced claim tiers, deadlines, age and official routing. **Remove any tax-guide ambition from the hub** (`FD-N-12`); tax stays a dedicated guide |
| 13 | S-09 what changed | **KEEP AND EXPAND** | High trust/return value. Add **session State selection** (`FD-N-04`). Expansion is gated on a real corrections pipeline — keep the honest zero-corrections statement until then |
| 14 | S-10 history / tools | **KEEP the destinations · MOVE depth to dedicated pages** | Keep the 4 resolving destinations and the mandatory non-prediction statement (`FD-X-10`). Archive/statistics depth belongs on archive and game pages |
| 15 | S-14 / S-15 cold starts | **KEEP GENUINE COLD START · REDUCE** | Never fabricate. Make both **compact** (`FD-N-05`). Neither is an ad host |
| 16 | S-17 trust | **EXPAND** | Highest-value expansion available. Add sources, update process, correction policy, independence and the responsible-play route; make it reachable from a top anchor |
| 17 | Advertising | **KEEP · VALIDATE** | `AD-S00` desktop-only holds; 10/10 active with the S-10 rail restored; protected zones intact. Re-validate density **after** the page shortens — the ratio changes when content is reduced |
| 18 | Sticky-ad close control | **KEEP AS PROPOSAL** | Functional, session-scoped, reclaims clearance. Remains **`OPEN-SX-05`**, not production-approved. The report's *"REPLACE any legacy weak-dismiss pattern"* concerns the **legacy** dismiss behaviour, not this control — **correction recorded** |
| 19 | Metadata / schema | **REPLACE** | Align to §3. **Preserve:** unique H1, unique title/description, correct canonical, visible last-updated. Add `BreadcrumbList`; add `ItemList` only for the visible result collection |
| 20 | Internal links | **EXPAND** | Strong routing to game, archive, schedule, claim, tax and news destinations. Every link must resolve (`FD-S-30`) |
| 21 | Desktop density | **REDUCE** | Competing modules fragment attention. Fewer inline groups; more routing |
| 22 | Mobile hierarchy / page length | **REORDER · REDUCE** | Results and freshness dominate; long explanatory prose out. Hub summarises and routes |
| 23 | Twelve cloned result formats | **KEEP AS PROVISIONAL** | Adequate for visual review; **not production-ready**. Needs official game-rule validation, plus **EZmatch** and **stake-sensitive prize** modelling and a typed jackpot object |

**No element is REMOVED.** Two are REPLACED (metadata/schema; and the report's stale premises are corrected
rather than acted on), and the reductions are density and routing changes that preserve every behaviour worth
keeping.

---

## 5. Florida Prototype V1 — bounded implementation specification

**Not implemented in this task.** No code was modified. This is the scope for a future approved task.

### 5.1 Content and routing changes
Compact S-04 to a next-2–3-draws summary + link · introduce the **schedule page** as the full-table
destination · keep tax content off the hub · expand S-17 · keep S-11/S-12/S-13 suppressed · add
**View all results** routing.

### 5.2 Result grouping changes
Keep the 10-family grouping · render **primary + compact multi-state + ≤4 native groups** inline ·
route the remainder · keep mandatory draw-period labels · keep neutral deterministic ordering.

### 5.3 AI-entry reduction — repetition, not categories *(corrected by LRG-DEC-028)*
Persistent **Ask State AI** entry · **one shared answer surface** · **selective** contextual entries across the
relevant sections and the eight approved `FD-N-11` categories · **remove the 20-button per-card repetition** ·
**no artificial three-category ceiling** · deterministic handoffs (timezone conversion, ticket comparison) ·
every section declares its intelligence layer · AI stays disconnected until separately approved · preserve the
real dispatch and focus handling.

### 5.4 Mobile hierarchy refinement
Tighten S-01 so the H1 does not wrap to three lines at 390 px · keep the first verified result before all
advertising · keep `AD-S00` desktop-only · accordions for legal depth only, never for current results ·
no horizontal scrolling for result verification.

### 5.5 `Buy Now` and the purchase-options resolver *(corrected by LRG-DEC-028)*
**Prominent inline `Buy Now` CTA** at the four `FD-N-03` placements · **first-party resolver interaction** on
activation · **official option first**, then other verified official options, then courier/affiliate **clearly
separated**, then retailer, then unavailable/unknown/`underReview` explanation · **provider type and material
differences shown** · **conspicuous adjacent affiliate disclosure before action** · eligibility and freshness
state surfaced (State, game, location, age, cutoff) · `unknown`/`underReview` renders an explanation, never a
transactional action · **no sticky `Buy Now` while the governed sticky advertisement is active** · **no
`Buy Now` in protected or loss-sensitive contexts** (possible-win, correction, claim, responsible play, or as
the dominant action after a confirmed losing result) · add **verified app purchase** and **verified courier**
to the ladder · Florida remains **`underReview`** · **no raw affiliate URL anywhere** · the
`/play/{game}` vs `/buynow/{code}` route conflict **stays open**.

### 5.6 Schema and metadata changes
`CollectionPage` **or** `WebPage` + `BreadcrumbList` on the hub · `ItemList` only for the visible result
collection · `Organization` = LotteryCorner · optional `AdministrativeArea` · **no** `GovernmentService`,
`Event`, `Offer`, `Dataset` family · no `FAQPage` for rich results · no `SearchAction`.

### 5.7 Internal links
Hub → game pages · latest-result · date-result · yearly archive · schedule · claim guide · tax guide ·
news · community · S-18 directory. Every target must exist in the route registry.

### 5.8 Visual refinement
Reduce desktop density · restrained cards · featured accent that does not eclipse native games · develop the
Arkansas/Delaware card pattern **minus** the impossible "Drawing now" state and **minus** "Next jackpot" as
fact · `OPEN-SX-01`…`OPEN-SX-04` remain open.

### 5.9 Tests
Hub density cap ≤4 native groups inline · **no per-card `Explain` repetition** · one shared answer surface
receives every contextual entry · **no three-category AI cap asserted anywhere** · every section declares an
intelligence layer · **`Buy Now` renders only at the 4 approved placements** · **`Buy Now` absent from
possible-win, correction, claim, responsible-play and post-loss-dominant contexts** · **no sticky `Buy Now`
while the sticky ad is active** · **resolver option ordering is official-first with courier/affiliate clearly
separated** · **adjacent disclosure present before any compensated action** · Florida commerce state is
`underReview` and never `retailOnly` · no raw affiliate URL in DOM, metadata, schema or logs ·
S-11/S-12/S-13 suppressed · no dataset markup · no `GovernmentService`/`Event`/`Offer` emitted · schedule
compact on hub · every internal link resolves · no disabled controls · first mobile result precedes
advertising · `AD-S00` absent below 992 px · Home non-regression.

### 5.10 Founder-review captures
390 px identity + first result · 390 px grouped results with the ≤4 cap visible · 390 px selective AI entries ·
**`Buy Now` entry and the S-07 resolver options with disclosure visible** · **an `underReview` resolver outcome** ·
992 px and 1440 px · shared AI surface open · compact schedule + the schedule page ·
S-10 destinations · S-17 expanded · guard-off Florida · Home at 390 and 1440 px. Store outside the repository.

---

## 6. What remains open

`OPEN-SX-01`…`OPEN-SX-06` (visual, incl. **`DS-37`, which this task does not close**) ·
`OPEN-ST-02`…`OPEN-ST-08` · the format-contract work from the acceptance record §4 (EZmatch,
stake-sensitive prizes, typed jackpot object, retired-game handling, official rule validation) ·
per-jurisdiction capability verification for the 43 jurisdictions still largely `UNDER REVIEW` ·
primary confirmation of the FAQ rich-result deprecation.
