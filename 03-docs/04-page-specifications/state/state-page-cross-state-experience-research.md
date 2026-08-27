# State Page — Cross-State Traffic, Engagement and Experience Research

**Task:** LRG-STATE-023
**Version:** 1.0
**Status:** RESEARCH — not approved architecture, not a blueprint change
**Date:** 2026-07-28
**Authority:** Tier 6 supporting research. Governed by the Product Constitution v2.1, Experience
Architecture v1.1, Global Shell v1.1, PF-02 v1.1, and the approved State decision registers.

> **RECONCILED BY LRG-DEC-024 (2026-07-28).** Founder rulings `FD-X-01` … `FD-X-14` are recorded in
> `03-docs/08-decisions/state-page-cross-state-experience-decisions.md` and **supersede this document where
> they differ**. Corrections applied in place: the `retailOnly` fallback replaced by the `FD-X-11`
> resolution ladder (absence of evidence → `unknown` / `underReview` / `unavailable`) · `jackpotSurge`
> **rejected** as an Adaptive Priority override (`FD-X-07`) · mobile order now results-first with `AD-S00`
> inactive below 992 px (`FD-X-03`, `FD-X-04`) · pixel heights demoted to non-binding reference budgets
> (`FD-X-03`) · anonymous Follow/Notify deferred (`FD-X-09`) · native jackpot may **not** join the
> multi-state featured band (`FD-X-05`) · launch AI set replaced by the `FD-X-08` five. The ten-question
> founder surface D-1 … D-10 is retired; six visual decisions remain (`OPEN-SX-01` … `OPEN-SX-06`).

> **Reading rule for this document.** Every substantive claim is tagged **[E]** evidence (observed, with
> source and access date), **[I]** interpretation (my inference from evidence), or **[R]** recommendation
> (a proposal requiring approval). Do not act on an **[R]** without a founder decision.

---

## 1. Evidence register

### 1.1 External sources

All accessed **2026-07-28** unless stated. Time-sensitive facts are marked; per `CLAUDE.md` §11 these
require re-verification before any claim is published or any commerce path is activated.

| # | Source | URL | Exact lesson taken |
|---|---|---|---|
| X-1 | Powerball official | `https://www.powerball.com/` | **The result comes before the jackpot.** Top-to-bottom: latest winning numbers (Mon Jul 27 2026, 6-26-46-58-65, Power Play 2×) → next drawing (Wed Jul 29 2026) with countdown, estimated jackpot **$663 M** and **cash value $290.4 M** → winners → How To Play → **Where To Play**. Primary actions: *View Results*, *Check Your Numbers*, *Watch The Drawing*, *Previous Results*, *Prizes & Odds*. Nav groups: Games / Results / More. **Double Play is a separate game in the Games menu, not shown on the home page.** Time-sensitive: jackpot, numbers. |
| X-2 | Mega Millions (facts via search; `megamillions.com` returned HTTP 403 to automated fetch) | `https://www.megamillions.com/` | Estimated jackpot **$800 M**, **cash value $344.2 M** (draw Fri Jul 24 2026). Draws **11 p.m. ET Tuesday and Friday**. Play: 5 of 1–70 plus Mega Ball 1–24. Jackpot annuity = 1 immediate payment + 29 annual, each **5% larger**. A prize multiplier feature exists (3×/5× observed). **Cash value is published alongside every jackpot.** Time-sensitive: all figures. **The multiplier's current name and mechanics were not confirmed from the official source and must be verified before display.** |
| X-3 | Lottery Post — results home | `https://www.lotterypost.com/results` | (a) **"You last visited July 28, 2026, 10:45 am"** — an explicit last-visit stamp, the cleanest honest return-visit primitive observed anywhere. (b) **"The time is now 10:45 am"** and **"All times shown are Eastern Time (GMT-5:00)"** — server clock and global timezone declared, so users can reason about cutoffs. (c) **"Top 10 Current Lottery Jackpots"** table with columns *Jackpot / Game / Draw Date / **Previous** / **Change*** — jackpot movement as first-class data. (d) Complete flat jurisdiction directory: 47 US entries including Puerto Rico and Washington D.C., plus Canada and Europe. (e) **"Custom Lottery Results"** — a saved personal selection view. (f) Accuracy posture: *"…errors can occur and the lotteries occasionally report incorrect results. We correct errors as soon as they are found… Verify all results with your official government lottery."* (g) PWA affordances: *Reload App*, *Add to Home Screen*. |
| X-4 | Lottery Post — Florida State page | `https://www.lotterypost.com/results/fl` | **The most informative single source in this research.** Order is **native games first, multi-state last**: Pick 2 → Pick 3 → Pick 4 → Pick 5 (each Midday + Evening) → **Cash Pop × 5 daily draws (Morning 8:45 am, Matinee 11:45 am, Afternoon 2:45 pm, Evening 6:45 pm, Late Night 11:45 pm)** → **Fantasy 5 Midday + Evening** → Jackpot Triple Play → **Lotto (with a Double Play Drawing)** → Mega Millions → Powerball (Powerball 25, **Power Play 2**) → **Powerball Double Play** → *"Raffle Results and Special Draws"* (Millionaire Raffle; $500 Raffle, *"Includes weekly drawings from Sept. 29 to Oct. 27"*). Per result: draw date, **draw-period label**, numbers, named special ball (*"Fireball: 3"*), **"Prizes/Odds"**, **"Speak"** (audio readout — an accessibility feature), *"Next Drawing:"* with exact datetime **+ timezone + plain-language countdown ("59 minutes from now", "2 days from now")*, *"Next Jackpot: $800 Million"*, **"Change from last: $57 Million"**, *"Jackpot History"*, *"Jackpot Analysis"*, and *"X Past Results"* / *"X Calendar"* / *"More »"*. **"Buy Mega Millions tickets" appears as a modest text link among others, not a button.** Cross-verifies X-1 (Powerball $663 M, Wed Jul 29). |
| X-5 | Florida Lottery official | `https://floridalottery.com/games/winning-numbers` | **Confirmed live and official**, with the exact paths PF-02 Appendix B cites (`/games/winning-numbers`, `/games/draw-games/florida-lotto`, `/games/draw-games/mega-millions`). **Its winning numbers are not present in the initial server HTML** — the results region is client-rendered and returned empty to a server-side fetch. |
| X-6 | SERP composition, *"florida lottery results"* | web search | Competing set: **Lottery Post**, **Jackpocket** (`lottery.jackpocket.com`), **LotteryUSA**, the official `floridalottery.com`, and **local TV news** (`mynews13.com` Spectrum News 13). **LotteryCorner did not appear in the retrieved result set.** |
| X-7 | Online lottery availability by State (aggregator sources: LegalSportsReport, PlayUSA, BettingUSA, LotteryUSA news, StateHouse News) | multiple | Reported official iLottery States: **Illinois** (2012, first), **New Hampshire, North Carolina, Pennsylvania** (2018), **Virginia, Rhode Island, DC** (2020), **Connecticut** (2021), **West Virginia** (2024), **Delaware** (2026), plus **Georgia, Kentucky, Michigan**. Massachusetts reported as moving into online sales. **Secondary sources — every entry requires official per-State verification before it may drive eligibility.** Highly time-sensitive. |

### 1.2 Repository sources

`CLAUDE.md` · Product Constitution v2.1 (frozen) · Experience Architecture v1.1 · Global Shell v1.1
(§0.1 visual non-binding, §10.5 AI-everywhere compliance, §11 anonymous shell, §12 guest progress) ·
PF-02 v1.1 State Page Blueprint (§4, §12, §20, §27, §32, §64B, §73, Appendix B) ·
`03-docs/08-decisions/state-page-founder-decisions.md` (`FD-S-01`…`FD-S-36`, `APP-ST-01`…`APP-ST-06`) ·
`source-authority.md` · `source-conflicts.md` ·
`03-docs/04-page-specifications/state/state-page-section-and-view-model-specification.md` ·
`.../florida-anonymous-preview-implementation.md` · the guarded Florida preview implementation
(`01-new-ui/components/state/preview/**`, `01-new-ui/lib/state/**`) · State fixtures and result formats ·
`04-sample-data/ad-slot-definitions.json` · the eleven proposed design PDFs and the founder section
analysis · five State content drafts (MD, MN, MS, ME, LA) · legacy production State templates.

### 1.3 What this research deliberately did not do

- No competitor layout was copied. Observations are behavioural lessons.
- No PDF figure was treated as fact (see the comparative audit §0.3).
- No application code, fixture, manifest, route, style or ad definition was modified.
- `megamillions.com` blocked automated retrieval; its facts are recorded as search-derived and flagged.

---

## 2. Competitor and official-product findings

### 2.1 What Lottery Post does well — and it is a lot

**[E]** Utility density with zero ceremony. A State page is a single scannable column of every draw event,
each with date, period, numbers, named special ball, next draw with exact time *and* plain-language
countdown, and immediate links to prizes/odds, past results and a calendar (X-4).

**[E]** Completeness is the product. Every draw event appears — including Cash Pop's five daily draws and
both Double Play draws. Nothing is hidden behind a tab or an accordion (X-4).

**[E]** Time is treated as first-class: server clock, declared timezone, per-game relative countdown (X-3, X-4).

**[E]** Jackpot *movement* is published, not just the level: `Previous` and `Change` columns, plus
per-game "Change from last" (X-3, X-4).

**[E]** Return-visit framing without pressure: "You last visited …" (X-3).

**[E]** Honest accuracy posture, including admitting that **lotteries themselves** sometimes publish wrong
results (X-3).

**[E]** An accessibility affordance we do not have: **"Speak"** reads the numbers aloud (X-4).

**[I]** Lottery Post ranks because it is the most *complete and fastest-to-answer* result surface, not
because it is the most attractive. Its dominance is an information-architecture win.

**[R]** Match its completeness and time handling; beat it on trust transparency, mobile ergonomics,
contextual AI and honest engagement. Do not compete on link density.

### 2.2 What LotteryCorner should not copy from Lottery Post

**[E]** Its primary navigation includes **Predictions**, **Lottery Systems**, **Lottery Wheels** and
"Lottery Charts" — around 30 flat nav items.
**[I]** Prediction and system framing is incompatible with the Constitution's language rules. Note that
**"LOTTERY SYSTEMS" already appears in the global header of all eleven LotteryCorner mockups** — this is a
shell-level naming risk that should be reviewed outside this task.
**[E]** Aggressive anti-scraping and copyright assertions, an adblock nag ("Whitelist Lottery Post"), and
premium gating of features.
**[E]** Visually dated, very dense, low-contrast tabular presentation with poor mobile ergonomics.
**[R]** Reject prediction/systems/wheels framing outright. Reject adblock nagging. Do not gate public
truth behind membership — `Complete public value stays public`.

### 2.3 How the official multi-state products prioritise

**[E]** Powerball leads with the **latest result**, then next draw + countdown + estimated jackpot **and
cash value**, then winners, then How To Play, then **Where To Play** (X-1).
**[E]** Mega Millions publishes **cash value beside every jackpot** and describes the annuity structure
explicitly (X-2).
**[E]** Both use **"Where To Play"** language for availability rather than a transactional button (X-1).
**[E]** Both offer *Check Your Numbers* as a named primary action, and Powerball offers *Watch The
Drawing* (X-1).

**[I]** Three lessons. (a) Even the jackpot owner puts the **result** above the **jackpot** — jackpot-first
is a marketing choice, not a user-need ordering. (b) A jackpot without its cash value is an incomplete
fact. (c) The official products already use the exact neutral label `FD-S-18` mandates.

**[R]** Adopt result-before-jackpot within each card, always pair jackpot with cash value when sourced, and
keep `Where to Play` as the default label — now supported by both official operators, not just policy.

### 2.4 Representative State-lottery capability variation

**[E]** Official online sales exist in a minority of States and the list changes yearly (X-7).
**[E]** The five States with the most reported online maturity in the design set — MI, VA, CT, DE, and
possibly MA — are precisely the ones whose mockups least reflect it (comparative audit §3).
**[E]** Frequent-draw and multi-draw games are real and common: Florida Cash Pop runs **five** draws daily;
Maryland Cash Pop runs **four** (9 am / 1 pm / 6 pm / 11 pm) per its content draft; Michigan and Delaware
offer **Keno**; Florida and Delaware run **Double Play**; Florida runs **raffle/special draws** with
interim and weekly drawings (X-4, repository content drafts).
**[E]** Claim tiers are genuinely per-State: MD `$600 / $5,000 / $25,000` (over $25,000 by appointment
only, no walk-ins) · MN `$599 / $50,000` (over $50,000 must be claimed at Roseville HQ) · FL
`$599 / $250,000 / $1,000,000`.
**[E]** Tax and privacy rules are genuinely per-State: MN specifies federal 24% **plus 7.25% State
withholding**; MN privacy allows many winners **over $10,000** to withhold name and city while prizes
**$10,000 or under are public record**; FL states **no State income tax** on winnings.
**[E]** Scratcher and second-chance programmes vary; California's own draft and design both state that
LotteryCorner does **not** publish individual scratcher listings or remaining prize counts.

**[I]** State variation is real and substantial — but it lives in **capabilities and jurisdiction facts**,
not in page structure. Every one of these differences is expressible as manifest data consumed by one page
family.

**[R]** One page family, capability-driven. Never a per-State template. See §6.

### 2.5 Search and mobile context

**[E]** For *"florida lottery results"* the competing set is Lottery Post, Jackpocket, LotteryUSA, the
official site and **local TV news**; LotteryCorner was absent from the retrieved results (X-6).
**[E]** The official Florida winning numbers are **not in server HTML** (X-5).

**[I]** Two structural opportunities. (a) A correctly server-rendered, crawlable, complete result page can
outrank the official operator on its own numbers — the operator's client-side rendering is a standing
weakness, and `CLAUDE.md` §9/§11 already mandate the behaviour that exploits it. (b) Local TV news ranking
for result queries indicates a **freshness and news** axis, not only a data axis: State news (S-15) has
direct traffic value, not merely engagement value.

---

## 3. State Page user-intent model

### 3.1 Intent families, ranked

Scores are 1–5. **Placement priority** is the recommended vertical position band, and it deliberately does
**not** track commercial value — `Deliver immediate value before engagement`, and claim/trust urgency
outranks revenue.

| # | Intent | Urgency | Frequency | Trust risk | Commercial | Repeat | Mobile context | Owner | Placement |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Latest result for a specific game** | 5 | 5 | 5 | 1 | 5 | Standing, one-handed, seconds after a draw | S-02 | **First** |
| 2 | **Did my ticket win / check a ticket** | 5 | 4 | 5 | 1 | 4 | Ticket in the other hand | S-05 | **First screen action** |
| 3 | **Correction / delayed / pending status** | 5 | 2 | 5 | 1 | 3 | Anxious, returning | S-02 + notice | **Above everything (override)** |
| 4 | **Next draw time / cutoff** | 4 | 5 | 4 | 3 | 5 | Before leaving the house | S-04 / card | **First screen** |
| 5 | **Current jackpot amount** | 3 | 5 | 3 | 4 | 5 | Curiosity, social trigger | S-02 featured | **First screen (compact)** |
| 6 | **Where to play / can I buy online** | 3 | 3 | **5** | **5** | 3 | Intent to act now | S-07 | **Upper-middle, eligibility-gated** |
| 7 | **Claim steps for a win** | **5** | 1 | **5** | 1 | 1 | Holding a winning ticket, stressed | S-08 | **Protected, promotion-free** |
| 8 | **Taxes / anonymity** | 4 | 1 | **5** | 1 | 1 | Post-win research | S-08 / guide | **Protected** |
| 9 | **Game history / past results** | 2 | 4 | 3 | 2 | 4 | Lean-back browsing | S-10 → archive | Middle |
| 10 | **Game rules, odds, payouts** | 2 | 3 | 4 | 2 | 2 | Learning | S-06 → game page | Middle |
| 11 | **State news** | 2 | 3 | 3 | 2 | **5** | Feed-like | S-15 | Lower-middle |
| 12 | **Winners / unclaimed prizes** | 2 | 2 | **5** | 2 | 3 | Curiosity | S-12 | Lower (suppressed until sourced) |
| 13 | **Scratchers / second chance** | 2 | 2 | 4 | 3 | 3 | In-store or planning | S-11 | Lower, conditional |
| 14 | **Community questions** | 1 | 2 | 3 | 1 | **5** | Lean-back, social | S-14 | Lower |
| 15 | **Responsible play / help** | **5 when needed** | 1 | **5** | — | — | Distress | S-17 | **Always reachable, never adjacent to promotion** |

### 3.2 What the ranking implies

**[I]** Intents 1–5 are all *time-critical* and all belong to the first screen. Intents 7, 8 and 15 have
**maximum trust risk and minimum frequency** — they must be excellent and protected, but they must not
consume primary real estate. Intent 6 is the only high-commercial intent, and it sits mid-page **behind an
eligibility gate**, which is the correct resolution of the Constitution's commerce rules.

**[I]** Intents 11 and 14 carry the highest *repeat* scores relative to their urgency. They are the
engagement engine, and they are exactly the two sections the proposed designs omit entirely.

**[R]** Treat intents 1–5 as the mobile content budget (specification document §4), 7/8/15 as protected
zones, 6 as conditional, and 11/14 as the return-visit investment.

---

## 4. Search and traffic strategy

### 4.1 The core risk

**[I]** A State page family multiplied across ~49 jurisdictions with the proposed designs' content volume
would generate a large near-duplicate corpus: the same claim walkthrough, the same tax explainer, the same
draw-integrity prose, the same 15 FAQs, with only a State name substituted. That is the thin-content
failure mode, and it also dilutes the pages that should rank.

### 4.2 Content placement map

| Content | State hub | State game page | Yearly archive | Claim guide | Tax/anonymity guide | Scratcher page | News | Community |
|---|---|---|---|---|---|---|---|---|
| Latest result per game | **Canonical** | Per-game canonical | — | — | — | — | — | — |
| Full result history | Link only | Recent window | **Canonical** | — | — | — | — | — |
| Draw schedule / cutoff | **Canonical summary** | Per-game detail | — | — | — | — | — | — |
| Jackpot + cash value | **Canonical (current)** | Per-game + history | — | — | — | — | — | — |
| Odds / prize matrix | One-line link | **Canonical** | — | — | — | — | — | — |
| Add-ons, Double Play | Label only | **Canonical** | — | — | — | — | — | — |
| Ticket checking | **Entry point** | Per-game | — | — | — | — | — | — |
| Where to Play | **Canonical (State)** | Availability line | — | — | — | — | — | — |
| Claim summary | **Summary + source** | — | — | **Canonical** | — | — | — | — |
| Tax / anonymity | **Fact strip (S-08A)** | — | — | link | **Canonical** | — | — | — |
| Statistics | link | Per-game | link | — | — | — | — | — |
| Scratchers | Conditional summary | — | — | — | — | **Canonical** | — | — |
| Winners / unclaimed | Max 3, sourced | — | — | — | — | — | **Canonical** | — |
| State news | 3 latest | — | — | — | — | — | **Canonical** | — |
| Q&A | 3 latest | — | — | — | — | — | — | **Canonical** |

**[R]** Rule: **the hub owns *current State truth* and routes to depth. It never owns a guide.**

### 4.3 Patterns

**[R] Title.** `{State} Lottery Results Today — Winning Numbers & Jackpots | Lottery Corner`. One pattern
across all jurisdictions; the observed five competing H1 patterns are drift, not variation. No-lottery
jurisdictions get their own honest pattern (§6).

**[R] H1.** `Latest {State} Lottery Results, Winning Numbers and Jackpots` — matches what the preview
already renders. Exactly one H1.

**[R] Meta description.** Generated from **live State facts** — game count, most recent draw date, whether
online play is verified — so it differs materially per State rather than by name substitution only.

**[R] Unique-value requirement.** Every State hub must carry at least three genuinely State-specific,
non-templated elements: its real game portfolio including every draw event, its own schedule and cutoffs in
its own timezone, and its own sourced jurisdiction facts. **PF-02 §64B already forbids the AI brief being
the only unique content** — that constraint must extend to the whole page.

**[R] Freshness signals.** Visible last-updated with timezone; per-result draw datetime; correction notices
stating what changed, when and the impact; `lastmod` refreshed for the State hub, affected game pages,
affected archives and Home on every result update.

**[R] FAQ.** One block, 4–6 questions, each answered visibly on the page, each varying by State
(draw times, online availability, claim deadline, anonymity, minimum age). `FAQPage` only while visible.

**[R] Structured data.** `WebPage` + `BreadcrumbList` always; `ItemList` for the result collection;
`FAQPage` only when a visible FAQ exists; `NewsArticle` only for real editorial; `DiscussionForumPosting`
only for real community entries. **No `SearchAction` until a working public search route exists. No
invented lottery schema types.** `Dataset` only if a genuinely downloadable, documented dataset ships.

**[R] Indexable fragments / GEO.** Each result card, the schedule table and each fact in S-08A should be
individually addressable and quotable — an answer engine should be able to lift "the Florida Pick 3 Midday
result for 27 July 2026" or "Florida claim deadline" with its source and date attached. This is where the
Sources & Methodology block (comparative audit §5.1) converts trust into retrievability. **No AI-crawler
behaviour may be claimed without evidence, and the supporting GEO research already carries a July 2026
evidence date requiring refresh.**

**[R] Internal links.** Hub → every game page · hub → recent archives · hub → claim and tax guides · hub →
responsible play · hub → State news and community · hub → adjacent/all States (S-18). Every per-card
"View History" must resolve to a route that exists in the registry — never a fixture-derived guess.

---

## 5. Why State pages can win recurring traffic

**[I]** Three structural advantages, each already mandated by our own rules:

1. **Server-rendered completeness.** The official Florida site does not put its numbers in initial HTML
   (X-5). We must (§9/§11). That is a durable crawl and answer-engine advantage over the most authoritative
   competitor for its own data.
2. **Every draw event, not the popular subset.** Lottery Post's completeness is its moat (X-4). Matching it
   is a data-coverage task, not a design task.
3. **Trust transparency as a differentiator.** No competitor observed publishes anything like Florida p6's
   methodology block or the drafts' "Why Trust Lottery Corner". Both humans and answer engines reward it.

**[I]** And one honest constraint: **daily return visits are earned by draw cadence, not by features.** A
Pick 3 player returns twice a day because there are two draws. The product's job is to be the fastest
correct answer at that moment and to add one honest reason to stay — not to invent urgency.

---

## 6. State variation framework

### 6.1 Principle

**[R]** One page family. One section order (PF-02). Variation expressed as **capability flags plus
jurisdiction facts on the State manifest**, resolved by the existing section resolver. No per-State
template, no per-State component, no per-State route logic.

### 6.2 Capability profiles

| Flag | Meaning | Primary effect |
|---|---|---|
| `activeLottery` | Jurisdiction operates a lottery | If false → ST-06 experience (below) |
| `multiStateOnly` | Only Powerball/Mega Millions etc. available | Native-game group suppressed; multi-state pair leads |
| `stateNativeJackpot` | Has its own jackpot game | Native jackpot card eligible for featured treatment |
| `dailyNumbersHeavy` | Multiple daily number games / midday+evening | Compact daily grid; period labels mandatory |
| `frequentDraw` | Cash Pop / Keno / rapid draws | Grouped "latest + next" pattern, not one card per draw event |
| `keno` | Keno offered | Frequent-draw treatment; live-draw handling |
| `secondaryDraw` | Double Play / second drawing | Secondary result block inside the parent card |
| `cardOrRaceFormat` | Card/horse-style formats | Format-driven rendering, never numeric balls |
| `lifetimePrize` | "for life" prize games | Prize expressed as published (e.g. `$1,000/day for life`), never annualised by us |
| `raffleOrSpecialDraw` | Raffles, interim/weekly draws | Specialised group with its own date semantics |
| `officialOnlinePlay` | Verified official online sales | S-07 may promote to `Play Online` |
| `officialSubscription` | Verified subscription | S-07 may offer subscription path |
| `courierSupported` | Verified licensed courier | S-07 may offer courier path, disclosed |
| `retailOnly` | **Retail-only availability VERIFIED from evidence** | S-07 shows retailer information only |
| `underReview` | Evidence exists but is being checked | S-07 information only, `Where to Play` |
| `unknown` | **No evidence, or State context unresolved** | S-07 `Where to Play` + confirmation ask; **no provider named** |
| `secondChance` | Second-chance programme | Conditional module, offering-level only |
| `scratcherRich` | Large scratcher catalogue | Conditional summary + official outbound; never a fabricated snapshot |
| `claimsContentAvailable` | Sourced claim tiers/deadlines | S-08 summary + guide link; else unavailable |
| `taxContentAvailable` | Sourced tax status | S-08A fact + guide link; else unavailable |
| `anonymityContentAvailable` | Sourced privacy rule | S-08A fact; else unavailable |
| `editorialRich` | Real State editorial exists | S-15 populated; else honest sparse hub |
| `communityActive` | Real human activity exists | S-14 populated; else genuine cold start |
| `sparseColdStart` | Little verified content overall | Compact page; **no ad may host on an empty shell** |

**[I]** Note the deliberate asymmetry: **commerce flags are all positive-verification.** Absence of
evidence never resolves to an assumed online path.

> **`FD-X-11` CORRECTION.** An earlier version of this sentence continued *"…resolves to `retailOnly`"*.
> That was wrong: it would have published an unverified factual claim about a jurisdiction's retail
> availability and let missing data pose as a finding. **`retailOnly` is a verified factual state requiring
> evidence.** Absence resolves to **`unknown`**, **`underReview`** or **`unavailable`**. See the
> specification §7.1 for the full ladder.

### 6.3 Module behaviour by profile

| Section | Always required | Conditional on | Compact when | Suppressed when |
|---|---|---|---|---|
| S-01 Identity/header | ✔ | — | — | never |
| S-02 Latest results | ✔ (active lottery) | — | `sparseColdStart` | `!activeLottery` |
| S-03 AI brief | ✔ | — | — | no governed inputs |
| S-04 Live/upcoming draws | — | schedule + cutoff verified | few games | unverified |
| S-05 Check ticket | ✔ at experience level | governed formats exist | — | no governed formats |
| S-06 Game portfolio | ✔ | — | `multiStateOnly` | `!activeLottery` |
| S-07 Where to Play | — | any **verified** path or **verified** retailer info | verified `retailOnly` | `unknown` · `underReview` · `staleEligibility` · `!activeLottery` |
| S-08 Claims/taxes/anonymity | ✔ (summary) | sourced facts per item | — | per-item when unsourced |
| S-08A State essentials | ✔ | — | — | never (items individually unavailable) |
| S-09 Worth knowing | — | validated, ranked, ≤3 | — | unsourced |
| S-10 Tools/history/statistics | — | routes exist | — | no real destination |
| S-11 Scratchers | — | `scratcherRich` + sustainable source | summary + outbound | no source |
| S-12 Winners/unclaimed | — | published data | ≤3 | unsourced |
| S-13 Fund allocation | — | current sourced figures + period | — | unsourced |
| S-14 Community | ✔ hub | `communityActive` populates | cold start | never (honest empty state) |
| S-15 News | ✔ hub | `editorialRich` populates | sparse | never (honest empty state) |
| S-16 Follow State | ✔ | — | anonymous = value statement | never |
| S-17 Sources/responsible play | ✔ | — | — | never |
| S-18 All States | ✔ | — | — | never |

### 6.4 No-active-lottery jurisdictions (ST-06)

**[E]** `FD-S-31` already rules: preserve `/al`, `/ak`, `/hi`, `/ut`, `/nv` with the ST-06 experience rather
than 404, and show no result, claim, tax or commerce module implying an active lottery.

**[R]** ST-06 composition: jurisdiction status with source and effective date · why there is no lottery, if
sourced · **multi-state availability only if genuinely applicable** · nearby-jurisdiction information only
where useful and lawful · local history/news if real · community · responsible play · S-18. Its own title
and H1 pattern — never *"{State} Lottery Results Today"* for a State with no lottery.

---

## 7. Recommended implementation sequence

Dependency-aware. Each step is a separately approved task; nothing here authorises work.

| # | Track | Depends on | Why this order |
|---|---|---|---|
| 1 | **Florida content expansion** | `FD-X-13` | The seven prerequisites — draw-event coverage, S-04 schedule, S-17 methodology, S-10 destinations, native coverage, official claim/help paths, confirmed cold start. Unblocks everything and precedes visual work. |
| 2 | **Florida mobile reordering and visual refinement** | 1 + `FD-X-03`/`FD-X-04`/`FD-X-05` | Results-first order, `AD-S00` mobile inactive state, compact multi-state strip. Then `DS-37` visual approval. |
| 3 | **Florida interaction refinement** | 2 | Anchor nav, per-card history links, draw calendar, last-visit diff. **Follow and Notify are deferred by `FD-X-09`.** |
| 4 | **AI shared-answer experience** | 2, 3 | One shared answer surface + contextual Explain actions + the five `FD-X-08` launch experiences. Needs final section layout to place entries. |
| 5 | **Commerce resolver placeholder states** | 2 | The `FD-X-11` ladder and disclosure rendering with **no live partner**. Absence of evidence resolves to `unknown`/`underReview`, never `retailOnly`. Unblocks eligibility design without activating commerce. |
| 6 | **State capability-profile contract** | 3, 5 | Typed manifest + capability flags. Requires Florida's real data shape and the commerce state machine to be known. |
| 7 | **Second representative State** | 6 | First proof the family generalises. |
| 8 | **High-variance representative State** | 7 | Stresses frequent draws, Keno, secondary draws. |
| 9 | **Commerce-capable State** | 6, 7 | First genuine eligibility promotion. |
| 10 | **No-lottery State (ST-06)** | 6 | Proves suppression correctness. |
| 11 | **Cross-State rollout** | 7–10 | Only after all four archetypes pass. |
| 12 | **Production migration** | 11 + URL audit + canonical decision (`FD-S-32`) | Route, canonical, redirect and sitemap work is separately gated. |

### 7.1 Recommended validation States, justified by variance

**[R]** Five States after Florida, chosen for **maximum capability coverage per State**, not convenience:

| Order | State | Why this one — variance justification |
|---|---|---|
| Florida | baseline | Broad mainstream State. Already implemented. Also unusually rich: **five** Cash Pop draws daily, midday/evening Fantasy 5, Jackpot Triple Play, **two** Double Play games, raffles, commerce currently `underReview` pending official confirmation, no State income tax. It is a stronger first case than it looks. |
| 2 | **Michigan** | The best single commerce + engagement test. **Verified official online play**, Keno, midday/evening Daily 3 and Daily 4, State jackpot (Lotto 47), fund allocation, and it is the State whose mockup most badly inverted commerce — so it directly tests the fix. Preferred over New York, which offers subscription-style purchase only and would under-test the resolver. |
| 3 | **Virginia** | Second commerce capability with a **different** shape: verified online play, plus the design set's most complete conditional-module coverage (ticket checker, scratchers, second chance, anonymity, fund allocation) and the leanest mobile hierarchy. Tests capability breadth on a compact page. Preferred over Connecticut, whose value is its iLottery status alone and whose mockup must be rejected wholesale. |
| 4 | **California** | Special-programme and claim distinctions: pari-mutuel prize structure, **no** online sales despite being the largest market, a large scratcher catalogue with an explicit honest-scope statement, active second-chance programme, Pacific timezone. Tests timezone, negative-eligibility and honest-absence handling. |
| 5 | **Maryland** *(daily-game-heavy)* | **Cash Pop with four distinct daily draws (9 am/1 pm/6 pm/11 pm)**, Pick 3/4/5 each midday+evening, Multi-Match, Bonus Match 5 — around 14 games and ~20 draw events. Also has the most mature content draft in the repository, and claim tiers ($600/$5,000/$25,000, appointment-only above $25,000) that differ from Florida's. Best available frequent-draw stress test. |
| 6 | **Utah** *(no active lottery)* | ST-06. Preferred over Alabama/Alaska/Hawaii/Nevada because it has no lottery **and** no meaningful adjacent-State ambiguity to muddy the test, so suppression correctness is measured cleanly. |

**[I]** Deliberately excluded from the early set: New York (subscription-only purchase under-tests the
resolver, though its 10-game portfolio makes it a good later case), Delaware (iLottery reportedly launched
2026 — too volatile to baseline against), Massachusetts (online status actively changing), and Connecticut
(its mockup contributes nothing reusable).

---

## 8. Conflicts and corrections arising from this research

### 8.1 Correction to a LRG-STATE-022 reservation — now resolved

LRG-STATE-022 left open whether PF-02 Appendix B's `[EXT-01]` external references genuinely prove the
current Florida operator identity and URL, and recommended considering `underReview`. **Evidence X-5/X-6
resolves this in favour of the existing manifest:** `floridalottery.com` is live, is the official Florida
Lottery site, and serves the exact paths Appendix B cites. **[R]** No downgrade is required; the entries
stand as `productionDerived`/verified. What *does* need re-verification on a schedule is the *content* of
those pages (claim tiers, deadlines, tax status), not the operator identity or URL.

### 8.2 Candidate source conflicts — ALL RESOLVED, NONE REGISTERED

LRG-DEC-024 reviewed all six against `FD-X-01` … `FD-X-14`. **None survives as a genuine unresolved source
conflict, so `source-conflicts.md` was not modified.** Each is either decided by a ruling, or falls inside
the categories that are explicitly not registrable (recommendations · missing content · implementation work ·
resolved commerce defaults · the rejected `jackpotSurge` · PDF factual errors already classified as
non-authoritative evidence).

| # | Candidate | Disposition | Why it is not a registrable conflict |
|---|---|---|---|
| C-A | Top-page hierarchy: multi-state first vs native-first | **RESOLVED** by `FD-X-03` + `FD-X-05` | Decided, not conflicting. On mobile the first verified result leads regardless of class; on desktop a featured pair with native access adjacent. PF-02 §12 group order is confirmed, not changed. The disagreement was *between non-authoritative mockups*, which the hierarchy already settles. |
| C-B | Founder audit "Layer A" mandates a tax section on every State page | **RESOLVED** by `FD-S-01` + `FD-X-02` | The authority hierarchy settles it directly: the audit is tier-7 evidence, `FD-S-01` is tier-5. Tax **status** is a sourced S-08A fact; tax **rates and advice** are guide content, suppressed until sourced. Recorded as a supersession in the decision record §4.4, which is the correct instrument. |
| C-C | Founder audit "Layer B" treats mockup presence as State capability | **RESOLVED** by `FD-X-01` | Capabilities come from the jurisdiction registry, capability profile and manifest. The matrix records which mockups included a module — an observation about artefacts, not a competing requirement. |
| C-D | "Odds & Strategy Guide" naming and "Why players like it" copy | **RESOLVED** by `FD-X-06` + `FD-S-06` | Prohibited framing, explicitly listed. A prohibited-copy finding is corrective work, not a source conflict. |
| C-E | Lucky for Life classified as multi-state (CO) and in-state (AR, MA) | **NOT REGISTRABLE** | A factual inconsistency **between the non-authoritative PDF mockups**, already classified as illustrative-only (§0.3 of the audit). Classification is manifest data; no authoritative source disagrees. |
| C-F | Florida coverage: 7 verified games vs ~24 real draw events | **NOT REGISTRABLE** | Missing content and implementation work — now `FD-X-13` prerequisite 1. Not a disagreement between sources. |

**Pre-existing State conflicts 13–18 in `source-conflicts.md` are unaffected** by this reconciliation and
remain open on their own terms.

---

## 9. Limitations of this research

1. `megamillions.com` blocked automated retrieval; its facts are search-derived (X-2) and the current
   multiplier mechanics are unconfirmed.
2. Online-sales availability (X-7) rests on secondary aggregators. **No commerce may be activated from it.**
3. Only page 1 of most design PDFs was read exhaustively; Florida was read across pages 1–3 and 5–7.
   Absence of a minor module in a tail page may be under-reported.
4. Live SERP composition was sampled for one query family in one locale and is volatile.
5. Three of the five State content drafts (Mississippi, Maine, Louisiana) were inventoried and
   structurally sampled but not read in full.
6. No accessibility audit of competitor sites was performed; Lottery Post's "Speak" feature was observed
   but not evaluated.
7. All time-sensitive facts carry a 2026-07-28 access date and require re-verification.

---

*End of research document. Companion documents:
`state-page-proposed-design-comparative-audit.md`,
`state-page-mobile-ai-commerce-engagement-specification.md`,
`state-page-founder-experience-review.md`.*

**Sources:** [Powerball](https://www.powerball.com/) ·
[Mega Millions](https://www.megamillions.com/) ·
[Lottery Post results](https://www.lotterypost.com/results) ·
[Lottery Post Florida](https://www.lotterypost.com/results/fl) ·
[Florida Lottery winning numbers](https://floridalottery.com/games/winning-numbers) ·
[LegalSportsReport online lottery](https://www.legalsportsreport.com/online-lottery/) ·
[PlayUSA online lottery](https://www.playusa.com/online-lottery/) ·
[BettingUSA lottery](https://www.bettingusa.com/lottery/) ·
[LotteryUSA news](https://www.lotteryusa.com/news/online-lottery-sales-expand-states-eye-2026) ·
[LotteryUSA Florida](https://www.lotteryusa.com/florida/) ·
[Jackpocket Florida results](https://lottery.jackpocket.com/en/lottery-results/florida)
