# State Page — National Research Acceptance and Gaps

**Task:** LRG-DEC-027
**Version:** 1.0
**Status:** ACCEPTANCE RECORD — research disposition, not approved architecture
**Date:** 2026-07-29
**Subject:** `03-docs/04-page-specifications/research-sources/lotterycorner-state-page-family-research-report-2026-07-29.pdf`
**Binding decisions:** `03-docs/08-decisions/state-page-national-content-model-decisions.md` (`FD-N-01`…`FD-N-12`, **v1.1**)

> **CORRECTED BY LRG-DEC-028.** Two dispositions below changed. The report's **`Where to Play`** recommendation
> is accepted as a **safety observation** but **rejected as LotteryCorner's primary CTA label** — the founder
> decision is **`Buy Now`** entering a governed first-party purchase-options resolver. The report's
> **one-shared-AI-surface** conclusion is accepted; its reduction of contextual entries is accepted
> **directionally** but **not as a three-category cap**. See §5 rows C-4, C-5, C-12 and C-13.
> **The report's own wording is preserved verbatim throughout and is not rewritten** — it remains external
> research evidence; only our dispositions changed.

---

## 0. The report, and what it is not

**[EV]** The founder-supplied report is a 33-page text PDF titled *"LotteryCorner State Page Family Research
Report"*. It was read in full for this task by decompressing its object streams and decoding its CID-encoded
text (the file carries no image pages; its 16.8 MB is almost entirely one ~19 MB embedded font collection).

**It is high-value research evidence.** It is **not** an approved blueprint, **not** a final content
specification, and **not** an operational State capability registry. Where it conflicts with the frozen
Constitution, the Experience Architecture, Global Shell, PF-02 or an approved decision register, those win.

### 0.1 Path discrepancy — recorded, not silently resolved

The task's CONTEXT names the report at
`03-docs/04-page-specifications/state/research-sources/…`. **Its actual supplied path is**
`03-docs/04-page-specifications/research-sources/…` — one level up, outside `state/`. It is committed **at its
supplied path** as instructed. **[RE]** If the intended home is `state/research-sources/`, move it in a
separate governance task rather than as an unrequested side effect here.

---

## 1. Research acceptance review

| # | Report conclusion | Disposition | Reason |
|---|---|---|---|
| R-1 | **One governed State Page family with capability-driven variation**, not per-state templates | **ACCEPT** | Independently correct and already binding via `FD-X-01`. The report's framing — that the differences that matter are *"mostly data and capability differences… not a different information architecture for every jurisdiction"* — is the right articulation |
| R-2 | **State-hub jobs**: latest verified result, draw/cutoff info, ticket checking, how to claim, where to play, add-on/online-play understanding | **ACCEPT** | Matches `FD-X-02` and the intent ranking already accepted in LRG-STATE-023. No correction needed |
| R-3 | **Official capability variation** is the real axis: any lottery at all · both multi-state games · official online purchase · subscriptions · ticket-checking app/scanner · frequent-draw products · anonymity breadth · claim/tax/help currency | **ACCEPT** | Well evidenced and directly usable as the capability-profile axis list |
| R-4 | **Verified official online purchase** in CT, GA, IL, MI, PA, VA | **ACCEPT** | Cited to operator FAQ/iLottery documentation per state. Consistent with the independently rendered Michigan and Georgia evidence gathered in LRG-STATE-026 |
| R-5 | **Verified subscriptions** in MD (My Lottery Rewards) and NY | **ACCEPT** | NY independently confirmed — the operator's own draw-games page promotes subscriptions for four named games |
| R-6 | **Texas is positively verified retail-only** (no internet/mail/phone sales; courier context) | **ACCEPT** | This is the *positive* verification `FD-N-10` requires. Texas, not Florida, is the reference case for `retailOnly` |
| R-7 | **Florida is "retail-first + retailer/app"** (retail play, QuickTicket, digital playslips) | **ACCEPT WITH CORRECTION** | Accepted as a *description*, **rejected as a commerce state assignment**. "Retail-first" is not positively verified `retailOnly`. **`FD-N-10` fixes Florida at `underReview`.** The distinction is exactly the R-6/R-7 contrast |
| R-8 | **Multi-state participation**: Powerball 45 states + DC + PR + VI; Mega Millions 45 states + DC + VI; Powerball Double Play in 30 lotteries | **ACCEPT** | Note the asymmetry the report correctly surfaces: **Puerto Rico has Powerball but not Mega Millions.** Multi-state availability must therefore be per-game manifest data, never a single "multi-state" flag |
| R-9 | **No-active-lottery states are AL, AK, HI, NV, UT**, inferred by comparing official participation lists with the 50 states, reinforced by Utah's constitutional position | **ACCEPT WITH CORRECTION** | The conclusion is right and independently corroborated by our own registry and the five legacy `state_{al,ak,hi,ut,nv}.jsp` templates. The **method** is an inference from participation lists, which the report itself flags — so it is accepted on our repository evidence, not on the inference |
| R-10 | **Competitor lessons**: completeness, time handling, jackpot movement, honest accuracy posture; do not copy prediction/systems framing | **ACCEPT AS DIRECTION ONLY** | Correct in substance, but the report's competitor pages were not markup-inspected (see §2.4), so structural claims are directional |
| R-11 | **Search-intent model** and the page-family SEO pattern (hub → game pages → latest-result → date-result → yearly archives → guides → scratchers/second chance/winners/news/community) | **ACCEPT** | Triangulates with the independently observed competitor and official cluster patterns (`/{state}/past-results`, `illinoislottery.com/results-hub`, `masslottery.com/tools/past-results`) |
| R-12 | **Content cluster + page-family operating model** with per-family intent, freshness, canonical, indexability, thin-content risk, AI role, commerce and engagement columns | **ACCEPT** | Adopted as the basis of the final cluster table in the companion IA document |
| R-13 | **Hub module classification** (required / conditional / compact+dedicated / game-page / news / community / member-only / suppress / reject) | **ACCEPT WITH CORRECTION** | Adopted, with three corrections: **Upcoming draws** moves from *conditional on hub* to **compact summary + dedicated page** (`FD-N-12` item 3); **Unclaimed prizes** moves from *conditional on hub* to **suppressed in phase one** (`FD-N-08`); **Datasets** from *suppress until sourced* to **out of phase one entirely** (`FD-N-09`) |
| R-14 | **Prediction modules → REJECT** | **ACCEPT** | Already binding. Reinforces that Lottery Post's Predictions/Systems/Wheels navigation is the anti-pattern, and that **"LOTTERY SYSTEMS" in our own global header** remains a shell-level naming risk |
| R-15 | **Conservative schema matrix**; no `GovernmentService` for LotteryCorner; no `Event` for routine draws; `Dataset` family only on a real file | **ACCEPT** | Correct and consistent with the task's schema rules. Adopted, tightened in the companion document |
| R-16 | **Commerce status model** with ten states and placement rules | **ACCEPT WITH CORRECTION** *(revised by LRG-DEC-028)* | The **ten-state eligibility model is accepted and retained in full** — it is the substance of the resolver. **Two corrections.** (a) The report's `Where to Play` label is accepted as a **safety observation** — a neutral default is right when eligibility is unproven — but **rejected as LotteryCorner's primary CTA**. `FD-N-10` v1.1 makes **`Buy Now`** the CTA and an entry into a first-party resolver; `Where to Play` / `Find a Retailer` become resolver **outcomes or supporting links**. (b) The report's suggested **mobile sticky action** is rejected: `FD-N-03` v1.1 permits **prominent inline** `Buy Now` but **forbids a sticky `Buy Now` while the governed sticky advertisement is active** |
| R-17 | **AI model**: one shared contextual surface; ranked opportunities with ship-early/ship-later guidance; prediction rejected as core AI | **ACCEPT WITH CORRECTION** *(revised by LRG-DEC-028)* | **The one-shared-answer-surface conclusion is ACCEPTED** and remains binding (`FD-X-08`, `FD-N-11` v1.1). Its ranked opportunity list and prediction rejection are accepted. **Correction:** the *reduction* of contextual entries is accepted **directionally** — entries must be selective — but **not as a three-category cap**. `FD-N-11` v1.1 removes the ceiling, approves **eight** categories, and targets the real defect: **mechanical repetition** (an `Explain` on every card, a chatbot per section, repeated identical prompts) rather than category count |
| R-18 | **Engagement model**: pending→verified, corrections/what-changed, next draw + explicit cutoff as the ethical loops; reject manipulative streaks, urgency detached from real cutoffs, prediction claims, "secret best number" framing | **ACCEPT** | Matches `FD-X-09`/`FD-N-04`. The rejected-loop list is precisely right |
| R-19 | **Mobile-first hierarchy** — same priority stack at 320/375/390 px with only density and truncation changing; design principles not fixed pixel heights | **ACCEPT** | Confirms `FD-X-03`. The report's own design rules (group daily variants, no horizontal scrolling for result verification, accordions for legal depth not current results, no ads between a result title and its numbers, no sticky collisions with claim/ticket-check UI) are adopted verbatim as principles |
| R-20 | **Prototype V0 section-by-section review** | **ACCEPT WITH CORRECTION** | The *directions* are almost all correct and are adopted in the V0 delta. **Correction: the review is based on a stale prototype** — see §2.1. Two specific items are corrected in §3 |
| R-21 | **PLAY_TYPE cloning is sufficient only for simple, stable structures** and needs official rule verification for Mega Millions post-2025, Florida Lotto Double Play and **EZmatch**, Pick 2/3/4/5 Fireball logic and display labels, **Cash Pop stake-sensitive interpretation**, and retired-game handling such as Florida's ended Cash4Life flow | **ACCEPT — highest-value finding in the report** | This is a direct, correct critique of LRG-STATE-025's format-cloning method and it identifies concerns that work did not consider at all. See §4 |
| R-22 | **Twelve founder decisions required** | **ACCEPT** | Answered as `FD-N-01`…`FD-N-12` |
| R-23 | **Recommended implementation sequence** (capability schema → hub → dedicated pages → commerce status → engagement → conditional modules → datasets last) | **ACCEPT AS DIRECTION ONLY** | Sound ordering. The bounded V1 specification in the companion document is the operative next step |
| R-24 | Report's own **hub density proposal**: cap current-result cards at a fixed 5–7 visible groups | **ACCEPT WITH CORRECTION** | **`FD-N-01` deliberately declines a single universal number.** A 3-game jurisdiction (Wyoming) and a 19-event jurisdiction (Florida) cannot share one raw cap. The cap applies to the **first mobile experience**; desktop may exceed it where readable |
| R-25 | Report's **community proposal**: reserve the route in every state but keep it unindexed until real activity | **ACCEPT WITH CORRECTION** | **`FD-N-05` declines route reservation.** A reserved-but-empty route is a thin-content and dead-end risk; the route comes into existence with genuine activity |

**Nothing in the report was REJECTED outright.** Two items were **DEFERRED** by consequence rather than by
disagreement: the dataset page family (`FD-N-09`) and winner/unclaimed page families (`FD-N-08`) — both
accepted as eventual destinations, both out of phase one.

---

## 2. Research limitations — explicitly recorded

These are recorded so the report is never mistaken for a complete national State capability contract.

### 2.1 The Prototype V0 review is based on a stale prototype

**[EV]** The report states the guarded preview *"currently renders 13 sections and suppresses 6, including
schedule, history, scratchers, winners, and fund-allocation sections."*

**[EV] That is the LRG-STATE-022 state, not commit `1d5420b`.** At `1d5420b` the preview renders **16**
sections and suppresses **3** (S-11, S-12, S-13). **S-04 (schedule), S-09 (what changed) and S-10
(history/tools) were unsuppressed by LRG-STATE-025** with verified data.

**[IN]** Consequently two report recommendations are already satisfied and must not be re-issued as work:
its *"Schedule — MOVE TO DEDICATED PAGE"* correctly identifies that the hub should carry only a compact
summary, but the premise that the section is suppressed is stale; and its *"History/tools — current preview
correctly suppresses when…"* no longer describes the prototype. Both are corrected in the V0 delta.

### 2.2 No complete operational matrix for every jurisdiction

**[EV]** The report itself records that *"capability verification quality is uneven across jurisdictions
because official lotteries publish different amounts of operational detail on the open web."* It verifies
commerce for roughly ten jurisdictions and does not produce a filled cell-by-cell matrix for all 53.

**[RE]** **The report must not be cited as a State capability registry.** Capability remains the State Content
Manifest's job, per jurisdiction, with `VERIFIED` / `NOT FOUND IN REVIEWED SOURCES` / `UNDER REVIEW` /
`NOT APPLICABLE` and a last-verified date on every cell.

### 2.3 Only three of eleven proposed design PDFs were directly reviewed

**[EV]** The report states: *"Only three proposal PDFs were available in the uploaded artifacts for direct
review in this run: **Connecticut, Delaware, and Florida**. The user-requested Arizona, Arkansas, California,
Colorado, Massachusetts, Michigan, New York, and Virginia proposal PDFs were **not available in reviewed
sources**, so those remain **UNDER REVIEW** for document-specific findings."*

**[EV]** All **eleven** PDFs are in fact present in this repository at
`05-design-inputs/state-pages/proposed-screenshots/`. The gap was in the report's uploaded artifact set, not
in the repository. **§3 of this document supplies the complete eleven-PDF reconciliation** from the
repository copies, drawing on the full visual review performed in LRG-STATE-023.

### 2.4 Competitor structured-data markup remains UNDER REVIEW

**[EV]** The report's schema section is reconciled against Google Search Central and Schema.org, but its
competitor rows do not evidence inspected `<script type="application/ld+json">` payloads. LRG-STATE-026
likewise reached Lottery Post's rendered text but **did not inspect its markup**, and could not retrieve
Lottery USA or Lottery.net at all.

**[RE]** **All competitor structured-data claims are `UNDER REVIEW`.** No schema decision in the companion
document rests on competitor markup; each rests on Schema.org semantics and current Google guidance.

### 2.5 Visibility observations are not verified traffic measurements

**[EV]** The report uses competitor sites as *"evidence of search visibility, page architecture, and usage
conventions"* — not traffic data. No traffic figures appear in it, and none were available to this task.

**[RE]** Every "opportunity" statement derived from the report is a **visibility proxy**: repeated SERP
presence, indexed-page breadth, result freshness, archive depth. **Do not convert any of it into a traffic
claim, a forecast or a business case.**

### 2.6 Non-durable references inside the report

**[EV]** The report's body carries **ChatGPT-internal citation tokens** throughout, of the form
`filecite turn0file5`, `turn0file6`, `turn0file9`…`turn0file11` (visible in the extracted text with ligatures
dropped). Its source register additionally refers to uploaded artifacts by role rather than by repository path.

**[RE]** **`/mnt/data` paths and `turn0file*` tokens are not durable repository references and must never be
cited as provenance in governed documents.** Where a report claim is adopted, this repository re-anchors it to
a repository path or an official URL with an access date. Any future re-verification must resolve the report's
uploaded-artifact references to real repository paths first.

### 2.7 Access-date concentration

**[EV]** The report's evidence register gives a single access date for all web sources: **2026-07-29**.
**[OB]** Time-sensitive facts — jackpots, online-purchase availability, promotions, schema guidance — therefore
share one verification timestamp and will age together. **[RE]** Re-verify per fact, not per report.

---

## 3. Complete proposed-design reconciliation — all eleven PDFs

**[EV]** All eleven are present in the repository. This reconciliation compares them against the accepted
national content model. **No PDF fact is treated as verified** (the set contains contradictory national
jackpots, unfilled `[X days]` / `[date]` placeholders, an `Edit with Lovable` badge indicating generated
prototypes, and `GMT+5:30` leaking into two US State pages). Per the task, only the six required dimensions
are recorded.

| # | State | Useful State-specific module | Repeated template pattern | Unsafe factual assumption | Commerce assumption | Mobile weakness | Better on a dedicated page | Visual lesson to retain |
|---|---|---|---|---|---|---|---|---|
| 1 | **Arizona** | Timezone-aware presentation (MST) | Multi-state-first, then in-state, then daily | **`GMT+5:30` in "Last updated"** on a Mountain-Time page; "Next jackpot" as fact | `Buy Tickets` on multi-state — **AZ not verified online** | Rich per-card panels stack tall | Per-game odds accordions | Per-card next-draw panel; favourite star |
| 2 | **Arkansas** | Correct Central Time throughout | Same multi-state-first stack | *"Live Numbers"* overclaim; "Next jackpot: $800M" | `Buy Tickets` on multi-state — **not verified** | Best-balanced but still card-heavy | Odds/prize accordions | **Strongest overall card**: star + next-draw panel + Find More/View History |
| 3 | **California** | **Honest scratcher scope statement** — *"does not publish individual Scratchers ticket listings or remaining prize counts"*; correct Pacific Time | Multi-state-first | Powerball shown at **$850 M** while nine others show $750 M | `Buy Tickets` on multi-state — **CA does not sell online** | Daily 3/Daily 4 split into 4 cards | Second-chance detail | The honest-absence pattern is the model for every unavailable dataset |
| 4 | **Colorado** | **Schedule table first**, with a single MT footnote | Schedule → results | **`GMT+5:30`**; **Lucky for Life grouped as multi-state** here but in-state elsewhere | `Buy Tickets` on PB/MM only | Schedule-before-results delays the primary answer | The full schedule table itself | Clean Game/Time/Days table with one timezone note |
| 5 | **Connecticut** | Quick Facts table (established, price range, claim deadline) | **Encyclopedia-first** | *"Draw Times (**Approximate**)"*; prose asserts iLottery | `Buy Tickets` in utility bar only | **No winning numbers on the page at all** | Everything below the game link list | Game logos aid scanning |
| 6 | **Delaware** | **"Reviewed by Lottery Corner Editorial Team"** byline; Day/Night qualifiers | Flat single grid, native first, multi-state last | *"Countdown: Drawing now"* on **every** card simultaneously; "Next jackpot" as fact | Buy on PB/MM only | Powerball buried 9th in a 10-card flat grid | Per-game history | **Richest card**: logo + star + next-draw panel + Find More/View History |
| 7 | **Florida** | **Sources, Methodology & Update Process** — the strongest module in the set; independence disclaimer | Multi-state-first; **7 screens** | Literal **`[X days]`** / **`[date]`**; unsourced winner prose; contradictory claim tiers; **merged "Midday & Evening" single card** | `Buy Tickets` in utility bar **and** on PB/MM — **FL not verified online** | Longest page; trust sentence repeated 3×; **three FAQ blocks (15 questions)** | Claim walkthrough, tax detail, odds matrices, draw-integrity prose | Methodology block + editorial-standards list |
| 8 | **Massachusetts** | Relative + exact date pairing — *"Next draw: **Tomorrow**, 03/10/2026 – 1:00 PM ET"* | Multi-state-first | Hardcoded *"for today, March 9, 2026"* in prose; PB **$220 M** vs others' $750 M | `Buy Tickets` on multi-state | **Four near-identical padding paragraphs** before the first result | Prize matrices (its own copy says game pages own them) | The exact+relative date pattern |
| 9 | **Michigan** | Native games **first**, multi-state below; Keno as a normal card | Native-first | **`GMT+5:30`-class inconsistency** (Jan 2025 results, June 2026 "last updated") | **No purchase CTA anywhere — and MI is a verified full iLottery state.** The most inverted case in the set | Chip row implies client-side switching | Odds & "strategy" content | Native-first ordering is defensible; chips are not |
| 10 | **New York** | Numbers/Win 4 midday+evening as **four distinct cards**; Pick 10 with 10 balls wrapping | Multi-state-first | Results dated Feb 2026, "last updated" June 2026 | `Buy Tickets` on PB, MM **and Cash4Life** but **not NY Lotto** — arbitrary; NY is subscription-capable, not general-online | No in-page nav at all | Per-game history | Correct midday/evening separation |
| 11 | **Virginia** | **Inline anchor nav** (Winning Numbers · Draw Times · Scratchers · Prizes · Taxes · Winners); Cash Pop single-ball card | Native-first, leanest | Lede promises *"exact tax deductions"* the site cannot source | **No purchase CTA — and VA is verified online-capable.** Second inverted case | Almost none — **most mobile-viable of the eleven** | Scratchers, taxes, winners | Anchor links instead of tabs; lean cards |

### 3.1 Cross-cutting conclusions from all eleven

**[IN]**

1. **Six mutually incompatible top-page hierarchies** across eleven documents (multi-state-first ×6,
   native-first ×2, flat grid, schedule-first, encyclopedia-first). This is authoring drift, not design
   intent, and is exactly why `FD-N-01`/`FD-N-02` must be explicit.
2. **Commerce CTAs are uncorrelated with verified capability** — present on unverified Florida, California,
   Arizona and Arkansas; **absent from verified-online Michigan and Virginia.** This is the single strongest
   argument for `FD-N-10`.
3. **Page-length inflation via stacked explanatory prose** is the shared weakness the report identified, and
   it is confirmed across all eleven. Florida is the extreme.
4. **Three in-page navigation mechanisms** (5 tabs, 4 chips, 6 inline anchors) plus eight omissions.
   **[RE]** Retain **Virginia's inline anchors** only; reject tabs and chips, which imply putting crawlable
   result content behind interaction.
5. **The best card in the set is Arkansas/Delaware's** — logo, follow star, highlighted next-draw panel,
   per-game history link. **[RE]** That is the card pattern to develop, minus the impossible
   "Drawing now" state and minus "Next jackpot" presented as fact.

---

## 4. The PLAY_TYPE finding — accepted, and what it means for our work

**[EV]** LRG-STATE-025 added twelve Florida result-format definitions by **cloning the verified sibling format
for the same game family**, taking ball counts and ranges from `PLAY_TYPE` in
`04-sample-data/reference-tables/game.csv`.

**[EV]** The report's verdict: cloning is *"sufficient only for simple, stable structures"* and *"not
sufficient without rule verification"* for:

| Item | Why cloning is insufficient | Prototype V0 exposure |
|---|---|---|
| **Mega Millions after the 2025 format change** | Effective-date logic required; the multiplier mechanism changed | V0 carries `effectiveFrom: 2025-04-08` and the built-in multiplier is officially confirmed — **partially handled**, but no pre-change historical branch exists |
| **Florida Lotto Double Play *and* EZmatch presentation** | Two distinct add-on/secondary structures on one game | **Gap.** V0 models Double Play from the feed but **has no EZmatch concept at all** |
| **Pick 2/3/4/5 Fireball logic and display labels** | Fireball *replaces* a drawn number rather than adding one; label semantics matter | **Partial.** V0 renders Fireball as a named special-ball group — visually correct, but the replacement semantics are not modelled |
| **Cash Pop stake-sensitive interpretation** | The prize depends on the stake played, so a single "top prize" is misleading | **Gap.** V0 renders one `topPrizeDisplay` (`$250`) per Cash Pop draw with no stake context |
| **Retired-game handling — Florida's ended Cash4Life flow** | A retired game must not present as current | **Not exercised.** Cash4Life is absent from the Florida feed, so V0 neither shows nor mishandles it — but no retirement mechanism exists |

**[RE] Accepted in full.** Two consequences:

1. **The twelve cloned formats are provisional.** They are adequate for a founder *visual* review of grouping
   and hierarchy — which is what they were built for — and are **not production-ready**. `FD-N-12` lists
   verified result coverage as a cutover prerequisite; that verification must include **official game-rule
   validation per format**, not just play-type shape.
2. **Two genuine modelling gaps** to record now: **EZmatch** and **stake-sensitive prizes**. Both are
   *format-definition* concerns, not rendering concerns, so they belong to the manifest/format contract.

**[OB]** Independently, LRG-STATE-026 surfaced a third gap of the same class from Texas: jackpots carry
**semantically different labels** — *"Est. Annuitized Jackpot"* with a companion *"Est. Cash Value"* versus
*"Current Advertised Jackpot"*. V0 renders a single unlabelled prize string. **[RE]** Add a typed jackpot
object (`kind`, `amount`, `cashValue?`, `asOfDate`) to the same contract work.

---

## 5. Corrections applied to the report — summary

| # | Report position | Correction | Authority |
|---|---|---|---|
| C-1 | Florida is *"retail-first + retailer/app"* | Florida's commerce state is **`underReview`**, never `retailOnly` | `FD-N-10`, `FD-X-11` |
| C-2 | Prototype V0 renders 13 sections, suppresses 6 | At `1d5420b` it renders **16**, suppresses **3** (S-11/S-12/S-13) | Repository evidence |
| C-3 | Cap hub result cards at a fixed 5–7 groups | **No universal raw cap.** First mobile experience: primary + compact multi-state + ≤4 native groups | `FD-N-01` |
| C-4 | Mobile sticky action defaulting to `Where to Play` | **REVISED by LRG-DEC-028.** Prominent **inline `Buy Now`** is permitted; a **sticky `Buy Now` is forbidden while the governed sticky advertisement is active** | `FD-N-03` v1.1 |
| C-5 | Ranked AI list implying many entry points | **REVISED by LRG-DEC-028.** No category cap. **Eight** categories approved; entries must be **selective**; the prohibition is on *repetition* — no Explain per card, no chatbot per section, no repeated identical prompts | `FD-N-11` v1.1 |
| C-6 | Reserve a community route in every state, unindexed | **No route reservation.** The route exists when activity exists | `FD-N-05` |
| C-7 | Upcoming draws *conditional on hub* | **Compact summary + dedicated page** | `FD-N-12` item 3 |
| C-8 | Unclaimed prizes *conditional on hub* | **Suppressed in phase one** | `FD-N-08` |
| C-9 | Datasets *suppress until sourced* | **Out of phase one entirely**; no markup, no placeholder page | `FD-N-09` |
| C-10 | No-lottery states inferred from participation lists | Accepted on **repository** evidence (registry + five legacy templates), not on the inference | Repository evidence |
| C-11 | Competitor schema rows | **`UNDER REVIEW`** — no markup was inspected by the report or by LRG-STATE-026 | §2.4 |
| **C-12** | **`Where to Play` as the product CTA** | **The label is accepted as a SAFETY OBSERVATION and rejected as the primary CTA.** `Buy Now` is the primary State-page commerce CTA and an entry into a first-party purchase-options resolver; `Where to Play` / `Find a Retailer` survive as a resolver **outcome or supporting link**. The neutral-default *principle* the report was protecting is preserved — it now governs the resolver **outcome** rather than the button label | `FD-N-03` / `FD-N-10` v1.1 |
| **C-13** | **"Initial State pages remain informational"** | **Superseded.** Commerce is a first-class governed journey from phase one. Retained unchanged: eligibility determination, official-first ordering, courier/affiliate separation, adjacent disclosure before action, protected-zone and loss-sensitive suppression, Florida `underReview`, and the open `/play/{game}` vs `/buynow/{code}` route conflict | `FD-N-10` v1.1 |

---

## 6. Open items this record does not close

| # | Item | Route |
|---|---|---|
| O-1 | 43 of 53 jurisdictions still have mostly `UNDER REVIEW` capability cells | Per-jurisdiction manifest work, gated by `FD-X-14` order |
| O-2 | Official-site access: several operators block automated retrieval | Infrastructure |
| O-3 | EZmatch, stake-sensitive prizes, typed jackpot object, retired-game handling | Format/manifest contract task |
| O-4 | Competitor structured-data markup | SEO, if it is worth doing at all — no decision depends on it |
| O-5 | Primary confirmation of the FAQ rich-result deprecation against Google Search Central | SEO |
| O-6 | Report PDF path (`state/research-sources/` vs `research-sources/`) | Governance |
| O-7 | `OPEN-SX-01`…`OPEN-SX-06` visual decisions incl. `DS-37` | Founder visual review |
| O-8 | "LOTTERY SYSTEMS" in the global header — prediction-adjacent naming | Shell |

---

*Companion: `state-page-final-content-information-architecture-and-schema.md` carries the final content
model, the dedicated-page cluster, the schema matrix, the Prototype V0 delta and the bounded V1
specification.*
