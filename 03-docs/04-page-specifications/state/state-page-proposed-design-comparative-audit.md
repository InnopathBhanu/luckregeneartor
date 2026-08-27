# State Page — Proposed-Design Comparative Audit

**Task:** LRG-STATE-023
**Version:** 1.0
**Status:** RESEARCH — not approved architecture, not a blueprint change
**Date:** 2026-07-28
**Authority:** Tier 6 supporting research. Governed by the Product Constitution v2.1, Experience
Architecture v1.1, Global Shell v1.1, PF-02 v1.1, and the approved State decision registers. Nothing in
this document overrides any of them.

> **RECONCILED BY LRG-DEC-024 (2026-07-28).** Founder rulings `FD-X-01` … `FD-X-14` are recorded in
> `03-docs/08-decisions/state-page-cross-state-experience-decisions.md` and **supersede this document where
> they differ**. Corrections applied in place: the `retailOnly` fallback replaced by the `FD-X-11`
> resolution ladder (absence of evidence → `unknown` / `underReview` / `unavailable`) · `jackpotSurge`
> **rejected** as an Adaptive Priority override (`FD-X-07`) · mobile order now results-first with `AD-S00`
> inactive below 992 px (`FD-X-03`, `FD-X-04`) · pixel heights demoted to non-binding reference budgets
> (`FD-X-03`) · anonymous Follow/Notify deferred (`FD-X-09`) · native jackpot may **not** join the
> multi-state featured band (`FD-X-05`) · launch AI set replaced by the `FD-X-08` five. The ten-question
> founder surface D-1 … D-10 is retired; six visual decisions remain (`OPEN-SX-01` … `OPEN-SX-06`).

---

## 0. Scope and evidence status

### 0.1 What was reviewed

All **eleven** proposed State designs were located **inside the repository** and reviewed as rendered
page images. None had to be treated as external-only founder-supplied evidence.

| # | State | Repository path | Pages | Reviewed |
|---|---|---|---|---|
| 1 | Arizona | `05-design-inputs/state-pages/proposed-screenshots/arizona.pdf` | 4 | Yes |
| 2 | Arkansas | `.../arkansas.pdf` | 5 | Yes |
| 3 | California | `.../california.pdf` | 4 | Yes |
| 4 | Colorado | `.../colorado.pdf` | 4 | Yes |
| 5 | Connecticut | `.../conneticut.pdf` *(filename misspelling is in the repository)* | 4 | Yes |
| 6 | Delaware | `.../delaware.pdf` | 4 | Yes |
| 7 | Florida | `.../florida.pdf` | 7 | Yes |
| 8 | Massachusetts | `.../Massachusetts.pdf` | 4 | Yes |
| 9 | Michigan | `.../Michigan.pdf` | 4 | Yes |
| 10 | New York | `.../Newyork.pdf` | 5 | Yes |
| 11 | Virginia | `.../virginia.pdf` | 5 | Yes |

**Method.** The PDFs contain no text layer — each page is a single full-page `DCTDecode` (JPEG) screen
capture at 1920 px wide. Page images were extracted losslessly and read visually. **No content was
inferred from a filename.** Where a module is recorded as absent below, it was absent from the pages
actually read; for the four-and-five-page files the tail pages were sampled rather than exhaustively
read, so absence of a *minor* module is stated as "not observed" rather than "absent".

### 0.2 Additional State evidence found alongside the designs

| Artefact | Path | Nature |
|---|---|---|
| Founder section analysis | `05-design-inputs/state-pages/section-analysis/State_Lottery_Prposed_section_analysis.docx` | The founder's own Layer A / Layer B audit of the same 11 designs, plus a feature matrix. **Directly relevant and used below.** |
| 5 State content drafts | `.../content-docs/{marylandlottery,Minnesota,Mississippi Lottery,Maine Lottery,Louisiana}.docx` | Long-form content specifications (18k–23k chars each) for **five further States** not in the design set. More structurally mature than the PDFs. |
| Existing production captures | `.../existing-screenshots/*.png` (AZ, AR, CA, CO, FL) | Current live behaviour and ad inventory. Behaviour/inventory reference only. |
| Existing mobile capture | `05-design-inputs/mobile-existing-pages/Mobile_Florida.pdf` | Current mobile behaviour. |

So State-level proposed evidence exists for **16 jurisdictions**, not 11.

### 0.3 Evidence-quality findings — read before using any figure from these PDFs

These are **observations about the artefacts**, and they materially change how much weight the designs
can carry.

**E-1 — The mockups are AI-generated prototypes.** The Florida capture carries an **"Edit with Lovable"**
badge in the lower right of its final page. *Interpretation:* the designs are generated prototypes, not
hand-authored specifications. This explains E-2 through E-6.

**E-2 — Unfilled template placeholders are visible in the rendered output.** Florida's "Unclaimed Florida
Lottery Prizes" module renders literally: *"Fantasy 5 — $208,000 (Miami): Expires in **[X days]**"* and
*"Florida Lotto — $55,000 (St. Petersburg): Winner has until **[date]** to claim."* *Interpretation:*
these modules are shells with no data source behind them.

**E-3 — The same national jackpot is shown at three different values across the set.** Powerball appears
as **$750 M** (FL, NY, MI, AR, AZ, CO, CT, DE, VA), **$850 M** (CA) and **$220 M** (MA). Mega Millions
appears as $420 M, $510 M and $185 M. A Powerball jackpot is a single national figure. *Interpretation:*
every jackpot, ball set and date in these PDFs is illustrative. **Conclusion: no PDF figure may be
published, and none may be used to validate a data contract.**

**E-4 — A build-environment timezone leaked into two pages.** Arizona and Colorado both render
*"Last updated: June 20, 2026 at 10:05 AM **GMT+5:30**"* — India Standard Time on a Mountain-Time State
page. Arizona simultaneously shows "Sat 9:00 PM **ET**" in its utility bar and **MST** on its cards.
*Interpretation:* a live instance of exactly the hazard `CLAUDE.md` §14 names — draw date and timezone
meaning must be game-local. **Recommendation:** treat this as a required test case, not a cosmetic slip.

**E-5 — Internally contradictory claim tiers.** Florida states both *"$600 – $250,000: district office or
mail"* and *"$600 – $1,000,000: district office in person"* in the same step list. Overlapping ranges
with different instructions.

**E-6 — Impossible simultaneous state.** Delaware, Arkansas, Arizona and Colorado render
*"Countdown: **Drawing now**"* on **every** card at once, including games drawn days apart.

**E-7 — Unsourced future facts.** Several cards show *"Next jackpot: $800 Million"* for Powerball
alongside a current $750 M. An unannounced next jackpot is an estimate, not a fact, and is presented here
without that qualification.

**E-8 — Winner narratives are prose without provenance.** Florida asserts *"Tampa — $2 Million Florida
Lotto: A Florida Lotto ticket worth $2 million was sold in Tampa for a recent drawing."* No date, no
source, no official reference. This is the fabrication class the Constitution prohibits publishing.

---

## 1. Top-page hierarchy — the designs do not agree with each other

This is the single most important finding of the audit. The eleven designs contain **six mutually
incompatible answers** to "what leads a State page?"

| Pattern | States | First substantive block after the H1 |
|---|---|---|
| **A — Multi-state first** | Florida, New York, Massachusetts, Arkansas, Arizona | `Multi-State Draws (Powerball & Mega Millions)`, then in-state, then daily |
| **B — Native-games first** | Michigan | `Michigan Lottery Draw Games`, with `Multi-State Games Available in Michigan` **below** |
| **C — Flat single grid, native first / multi-state last** | Delaware | One 10-card grid: Play 3/4/5 Day+Night → Multi-Win Lotto → Lotto America → Powerball → Mega Millions |
| **D — Schedule table first** | Colorado | `Today's Colorado Lottery Draw Schedule` (full Game/Time/Days table) **before** any result |
| **E — Anchor-nav + native-first** | Virginia | Inline text nav (`Winning Numbers · Draw Times · Scratchers · Prizes · Taxes · Winners`), then draw games |
| **F — Encyclopedia first, results off-page** | **Connecticut** | `What is the Connecticut Lottery?` prose → `Quick Facts` trivia table → `Quick Links to Popular Games` link list. **No winning numbers on the page at all.** |

### 1.1 Pattern F must be rejected outright

Connecticut is the clearest failure in the set. A user arriving from *"connecticut lottery results"*
receives an encyclopedia entry (State, Established 1971, Ticket Price Range $0.50–$2.00), a table of game
*names* with "View Results & History →" links, and a section headed *"Connecticut Lottery Draw Times
**(Approximate)**"*. The primary job — see the numbers — is not merely deprioritised, it is **moved off
the page**. It also directly violates the Constitution's "deliver immediate value before engagement" rule
and PF-02's requirement that S-02 is a required section.

*"Approximate"* draw times additionally fail the trust bar: a draw time is a published fact.

### 1.2 In-page tab/chip navigation is inconsistent and is an SEO hazard

| State | In-page navigation |
|---|---|
| Florida | 5 **tabs**: Results / Winning History / Schedule / How to Play / How to Claim |
| Michigan | 4 **chips**: Winning Numbers / Draw Times / Claim Info / Taxes |
| Virginia | 6 **inline text links**: Winning Numbers · Draw Times · Scratchers · Prizes · Taxes · Winners |
| NY, MA, CA, AR, AZ, CO, DE, CT | none |

*Interpretation:* three different mechanisms and eight omissions is authoring drift, not design intent.
*Recommendation:* **REJECT tabs and chips; RETAIN Virginia's inline anchor links.* Tabs imply
client-side panel switching, which would put result content behind interaction and breach `CLAUDE.md` §11
("Result tables MUST be crawlable and MUST NOT depend on client-side filtering"). Anchor links to
server-rendered sections satisfy the same navigational need with none of the risk.

---

## 2. Comparative matrix

Legend: **●** present and substantive · **◐** present but thin, templated or placeholder-bearing ·
**○** not observed · **✕** present but factually or ethically unsafe as drawn.

| Dimension | FL | NY | MI | MA | DE | CT | CO | CA | AR | AZ | VA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Top-page hierarchy | A | A | B | A | C | **F** | D | A | A | A | E |
| Result grouping (multi/native/daily) | ● | ● | ● | ● | ◐ flat | ○ | ● | ● | ● | ● | ● |
| Powerball / Mega Millions prominence | ● | ● | ◐ below | ● | ◐ 9th | ○ | ● | ● | ● | ● | ◐ |
| State-native game prominence | ◐ | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ● |
| Midday/evening handled as distinct draws | ✕ merged | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ● |
| Draw schedule treatment | ◐ tab | ○ | ◐ chip | ● | ○ | ◐ "approximate" | ● table | ○ | ○ | ○ | ◐ |
| Countdown to next draw | ● bar | ● bar | ● bar | ● bar | ● per-card | ● bar | ● per-card | ● bar | ● per-card | ● per-card | ● bar |
| Next-jackpot / jackpot delta | ○ | ○ | ○ | ○ | ● | ○ | ● | ○ | ● | ● | ○ |
| Ticket checking | ● tool | ○ | ○ | ○ | ○ | ○ | ● | ○ | ● | ● | ● |
| Per-card history / game link | ○ | ○ | ○ | ◐ prose | ● | ● | ● | ○ | ● | ● | ● |
| Per-card follow/save (star) | ○ | ○ | ○ | ○ | ● | ○ | ● | ○ | ● | ● | ○ |
| Game logos / brand marks | ○ | ○ | ○ | ○ | ● | ● | ○ | ○ | ○ | ○ | ○ |
| Buy / Where-to-Play treatment | ✕ | ✕ | ○ | ✕ | ✕ | ◐ | ✕ | ✕ | ✕ | ✕ | ○ |
| Claims | ● long | ○ | ◐ chip | ◐ | ○ | ○ | ○ | ○ | ◐ | ◐ | ◐ |
| Taxes | ● | ○ | ◐ | ◐ | ○ | ○ | ○ | ○ | ◐ | ◐ | ◐ |
| Anonymity | ○ | ○ | ○ | ○ | ● | ○ | ○ | ● | ○ | ○ | ● |
| Scratchers | ○ | ○ | ○ | ○ | ○ | ● | ○ | ● honest | ○ | ● | ● |
| Second chance | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ○ | ○ | ◐ |
| Archives / past results | ◐ tab | ○ | ○ | ◐ prose | ● | ● | ● | ○ | ● | ● | ● |
| Statistics / number analysis | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| News | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Winners / unclaimed | ✕ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | ◐ | ◐ | ◐ |
| FAQs | ✕ ×3 blocks | ○ | ○ | ◐ | ○ | ○ | ○ | ○ | ◐ | ◐ | ◐ |
| Responsible play | ◐ no helpline | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Sources / methodology | ● best in set | ○ | ○ | ○ | ◐ byline | ○ | ○ | ○ | ○ | ○ | ○ |
| Independence disclaimer | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| Correct State timezone | ● ET | ● ET | ● ET | ● ET | ● ET | ● ET | ✕ MT+bug | ● PT | ● CT | ✕ MST+bug | ● ET |
| Estimated page length | ~7 screens | ~5 | ~4 | ~4 | ~4 | ~4 | ~4 | ~4 | ~5 | ~4 | ~5 |
| Mobile suitability as drawn | Low | Medium | Medium | Medium | Medium | Low | Low | Medium | Medium | Medium | **High** |
| Repeat-visit value | Low | Low | Low | Low | **Medium** | Very low | Low | Low | **Medium** | **Medium** | Low |
| Factual risk | **High** | Medium | Medium | Medium | Medium | **High** | Medium | Medium | Medium | Medium | Medium |

### 2.1 Reading the matrix

- **No design is complete.** Florida is the most complete on trust and long-form content but the worst on
  commerce safety, FAQ duplication and mobile density. Virginia is the leanest and most mobile-viable but
  carries almost no depth. Arkansas and Arizona are the best *balance*. Delaware has the best *card*.
- **News is absent from all eleven.** Zero designs contain a State news module, yet the founder's own
  audit lists "Local News & Winners" as found in ten of eleven — the winners half is present, the news
  half is not. PF-02 makes S-15 a required hub.
- **Statistics is absent from all eleven** design PDFs, but the Minnesota content draft specifies a full
  *"Statistics & Number Analysis"* section with "Available Statistical Tools". This module therefore
  exists in the content stream and needs an explicit ruling (see §5).
- **Responsible play is near-absent.** Only Florida addresses it, and it says *"Florida's gambling
  helpline is available for support"* **without providing the helpline**. The guarded Florida preview is
  currently *more* correct than the design: it marks the contact unavailable rather than gesturing at one.

---

## 3. The commerce finding — Buy buttons are uncorrelated with real eligibility

This is the most serious safety finding. Cross-referencing the designs against which States actually
operate official online lottery sales (secondary aggregator sources, July 2026 — see the research
document's evidence register; **all require official per-State verification before any activation**):

| State | Online sales **reported** by secondary sources *(not a verified commerce state)* | Buy CTA in the proposed design | Verdict |
|---|---|---|---|
| Florida | **None reported** | "Buy Tickets" in utility bar **and** on Powerball + Mega Millions cards | **✕ Wrong** |
| California | **None reported** | "Buy Tickets" on Powerball + Mega Millions | **✕ Wrong** |
| Massachusetts | Recently moving to online sales — **changing, verify** | "Buy Tickets" on multi-state | ✕ Not evidence-driven |
| Arizona, Arkansas, Colorado | **None reported** | "Buy Tickets" on multi-state | **✕ Wrong** |
| New York | Subscription-style only, not general online single-ticket | "Buy Tickets" on Powerball, MM **and Cash4Life** — but not NY Lotto | **✕ Arbitrary** |
| Delaware | iLottery reported launching 2026 | Buy on multi-state only | ◐ Coincidental |
| Connecticut | **Yes** (2021) | Prose mentions "approved online platforms (iLottery)"; Buy only in utility bar | ◐ Partly right, by prose |
| **Michigan** | **Yes** | **None anywhere** | **✕ Inverted** |
| **Virginia** | **Yes** | **None anywhere** | **✕ Inverted** |

*Interpretation:* the Buy CTA in these designs is decoration. It appears where a visual accent was
wanted, not where a purchase is possible — and it is **absent from the two States in the set that most
clearly do sell online**. Within a single State it is inconsistent (NY: Cash4Life yes, NY Lotto no).

> **`FD-X-11` reading rule for this table.** "None reported" is **not** a verified `retailOnly` finding —
> it is an absence of evidence, which resolves to **`unknown`** or **`underReview`**. The table proves only
> that the designs' Buy CTAs are uncorrelated with anything verifiable; it does not establish any
> jurisdiction's true commerce state. `retailOnly` requires positive evidence.

*Recommendation:* This is decisive support for the already-approved position — default label
**`Where to Play`** (`FD-S-18`), state-aware deterministic eligibility, first-party resolver, and
promotion to `Play Online` / `Buy Tickets` **only** on verified eligibility (`FD-S-20`). It also
establishes a hard rule for this programme:

> **No Buy/Play CTA may ever be introduced from a design artefact. A purchase path enters the product
> only from verified per-State eligibility data.**

---

## 4. Templated, thin and repetitive content patterns

Patterns that would produce weak or untrustworthy pages once multiplied across ~49 jurisdictions.

**T-1 — Triple-duplicated FAQ blocks.** Florida carries **three separate FAQ accordions** on one page:
4 questions after the ticket checker, 3 more inside the claim section, and 8 more under "Florida Lottery —
Frequently Asked Questions" — **15 questions total**, with overlap ("Are Florida Lottery winnings taxed by
the state?" and "Are Florida Lottery prizes taxed?"). *Risk:* duplicate-intent content on one URL, and an
`FAQPage` schema temptation across three blocks. *Recommendation:* **one** FAQ block, capped, State-specific,
and only questions the page visibly answers.

**T-2 — The same trust sentence repeated three times.** Florida renders *"Winning numbers are updated
shortly after each drawing. For major prizes, confirm your ticket with an authorized Florida Lottery
retailer or office"* in the utility bar, again as an info callout above the results, and again as a
footnote below them. *Recommendation:* state it **once**, in S-17, plus the compact freshness stamp in S-01.

**T-3 — Padded pre-result prose.** Massachusetts places **four** near-identical short paragraphs between
the H1 and the first result ("Below are the most recent…", "The latest… are published shortly after each
official drawing.", "Select a game below to view…", "Each game card displays…"). Florida places two plus a
callout. *Risk:* this is the classic thin-content signature and it pushes the primary content below the
fold on mobile. *Recommendation:* **one** lede sentence; everything else is a section's own job.

**T-4 — Hardcoded dates inside prose.** Massachusetts: *"…winning numbers for today, **March 9, 2026**…"*.
*Risk:* stale-on-arrival copy. *Recommendation:* dates come from data and render as a freshness stamp,
never inside body copy.

**T-5 — Evergreen guide content that would be identical in 49 States.** Florida's "Draw Integrity &
Oversight", "Key Rules", "Where Lottery Money Goes" and "Player Rights & Common Issues" are ~1.5 screens
of prose with almost no State-specific content beyond the State's name. Multiplied ×49 this is a
near-duplicate corpus. *Recommendation:* **MOVE TO DEDICATED GUIDE** with a short State-specific summary
retained on the hub.

**T-6 — Claim and tax guides embedded in the hub.** Florida devotes roughly two of seven pages to claim
options, a 7-step claim walkthrough, deadlines, district offices and taxes. The Maryland and Minnesota
content drafts do the same at greater length. *Genuinely State-specific* (MD tiers $600/$5,000/$25,000;
MN $599/$50,000; FL $599/$250,000/$1M) — so it must be manifest-driven, not templated — but its **volume**
belongs on a dedicated guide, summarised on the hub.

**T-7 — "Why players like it" framing.** Florida's Pick-game accordions each close with an italic line:
*"Why players like it: Multiple play styles and higher payouts than Pick 2"*, *"High payouts with
manageable odds"*, *"Largest fixed prizes among daily Pick games"*. *Risk:* this is soft game
recommendation. The founder audit also names the module **"Odds & Strategy Guide"**. Both "strategy" and
"why players like it" are prohibited framing. *Recommendation:* **REJECT the framing, RETAIN the
data.* Rename to neutral odds/prize information; delete every comparative desirability claim.

**T-8 — Merged midday/evening results.** Florida renders Pick 2/3/4/5 as **one card each** labelled
"Midday & Evening" with a **single** ball row — so the user cannot tell which draw the numbers belong to.
Every other State in the set splits them. *Risk:* a user checks an evening ticket against a midday result.
*Recommendation:* **REJECT.** One card per draw event, with an explicit period label — the Lottery Post and
Delaware/NY/MI/CA/MA pattern.

**T-9 — Inconsistent game classification.** Lucky for Life is grouped under **multi-state** in Colorado but
under **in-state** in Arkansas and Massachusetts. *Recommendation:* classification is manifest data, not a
per-page choice.

---

## 5. Module dispositions

Classification per the required vocabulary. "Section" refers to the PF-02 governed section that owns the
module.

### 5.1 RETAIN

| Module | Owner | Evidence | Why |
|---|---|---|---|
| **Sources, Methodology & Update Process** | S-17 | Florida p6 | The strongest module in the entire set: Data Sources, Update Frequency, Time Zone & Formatting, Accuracy & Verification, Editorial Standards, Limitations & Notes. Its stated standards — *"No speculation on results / No predictions or strategy claims / No unofficial prize calculations / Clear separation between draw results and claim guidance"* — restate the Constitution. High trust and high AI-search value. |
| **Independence disclaimer** | S-17 / Footer | Florida p6 | *"Lottery Corner is an independent lottery information website and is not affiliated with or endorsed by the Florida Lottery… All winning tickets must be validated and claimed through official retailers or claim offices."* Exactly right. |
| **Editorial review byline** | S-01 / S-17 | Delaware p1 | *"Reviewed by Lottery Corner Editorial Team"* + *"Updated after official Delaware Lottery drawings"*. Cheap, honest, real E-E-A-T. |
| **Freshness stamp with timezone** | S-01 | All | "Last updated: … ET/CT/MT/PT". Keep — **fix the GMT+5:30 defect (E-4)**. |
| **Exact-date + relative-time pairing** | S-02 / S-04 | Massachusetts p1 | *"Next draw: **Tomorrow**, 03/10/2026 – 1:00 PM ET"*, *"**Tonight**, 03/09/2026 – 7:57 PM ET"*. Satisfies both urgency and `CLAUDE.md` §7's exact-date rule. |
| **Per-card next-draw panel** | S-02 | DE, AR, AZ, CO | Next draw datetime + countdown + next jackpot in one visually distinct block. |
| **Jackpot delta** | S-02 / S-10 | DE, AR, AZ, CO ("Next jackpot"); Lottery Post ("Change from last") | Factual movement, not manufactured urgency. Strong weekly return-visit hook. |
| **Per-card history / game links** | S-02 → S-06/S-10 | DE, AR, AZ, CO, VA, CT | "View History" / "Find More" / "View full game details →". Solves internal linking to game and archive routes. |
| **Named special-ball label** | S-02 | All | "Powerball: 14", "Mega Ball: 19", "Fireball: 3", "Cash Ball: 3", "Star Ball: 7", "Lucky Ball: 8", "Bonus: 19". Never a bare number. |
| **Draw-period qualifier** | S-02 | DE ("(Day)"/"(Night)"), Lottery Post ("Midday"/"Morning"/"Matinee"/"Late Night") | Mandatory for multi-draw games. |
| **Draw schedule table** | S-04 | Colorado p1 | Game / Time / Days with a single timezone footnote. Clean, crawlable, genuinely useful. |
| **Sales-cutoff note** | S-04 | Maryland draft | *"Ticket sales generally close shortly before each scheduled draw."* Real user need. |
| **Honest scratcher scope statement** | S-11 | California p1, Minnesota draft | *"While Lottery Corner does not publish individual Scratchers ticket listings or remaining prize counts, players can use eligible tickets to participate in California's official 2nd Chance promotions."* The correct answer to a data source we do not have. |
| **Quick Facts / State Essentials** | S-08A | CT, MN, MD | As a compact governed fact strip — **not** as CT's trivia table substituting for results. |
| **"Why Trust Lottery Corner"** | S-17 | Maryland, Minnesota drafts | Commitment to Accuracy · Our Sources · Data Freshness · Sources & Methodology · Responsible Play. |
| **"Does Lottery Corner sell tickets?" FAQ** | S-08 / S-17 | Minnesota draft | Direct affiliate/role clarity. |

### 5.2 RETAIN AND REDESIGN

| Module | Owner | Change required |
|---|---|---|
| Multi-state featured pair | S-02 | Keep the featured treatment; make availability, jackpot **and cash value** manifest-driven; remove the unconditional Buy button; add status/pending/correction states. See the specification document §5. |
| In-state game cards | S-02 | Adopt the Delaware/Arkansas card (star, next-draw panel, history link). Split every midday/evening and frequent-draw event (T-8). |
| Result card grid | S-02 | Keep PF-02 grouping (multi-state → state-only → daily variants → specialised); reject Delaware's undifferentiated flat grid and Michigan's burial of multi-state. |
| Ticket checker | S-05 | Keep; comparison stays deterministic, never AI (`FD-S-17`). Remove the disabled-looking submit. Never inject an ad between input and output. |
| Claim summary | S-08 | Keep a compact, manifest-driven, sourced summary on the hub; move the walkthrough out (T-6). Fix contradictory tiers (E-5). |
| Odds / prize matrix | S-06 → game page | Keep published odds; strip "strategy" and "why players like it" (T-7); relocate per-game depth. |
| Anonymity | S-08 / S-08A | Keep as a governed per-jurisdiction fact with source and effective date. |
| FAQ | S-08 / S-15 | Collapse three blocks into one; State-specific; only visible answers (T-1). |
| Utility action row | S-01 | Keep Check Ticket / Past Results / Prize Lookup / Claim Info as real navigation; **remove Buy Tickets** from the global bar; every item must resolve to a route that exists. |
| Winners / unclaimed | S-12 | Keep the *shape* — the Maryland draft's table (Game / Prize / Draw Date / **Claim Before**) is good — but suppress until officially sourced. |

### 5.3 CONDITIONAL STATE MODULE

Rendered only when the State's manifest carries verified data: S-04 schedule/cutoff · S-07 Where to Play ·
S-09 Worth Knowing · S-10 tools/history/statistics · S-11 scratchers · S-12 winners/unclaimed ·
S-13 fund allocation · second-chance · Keno/frequent-draw handling · courier availability.

**Important:** the variation observed in the mockups must **not** become the capability model. The founder
audit's feature matrix records "Check Ticket Tool" in only VA, CO, AR, AZ, FL and "Anonymity Rules" in only
VA, DE, CA — but ticket checking applies to every State with draw games, and anonymity law exists in every
jurisdiction (even where the answer is "not permitted"). That matrix measures **which mockups happened to
include a module**, not genuine State capability. Real capability variation (online sales, courier, Keno,
no active lottery) is a different axis and is defined in the research document §11.

### 5.4 MOVE TO GAME PAGE

Per-game odds tables and prize matrices · full "how each game works" · per-game statistics and number
frequency · Double Play detail · add-on mechanics (Power Play, Megaplier, Fireball) beyond a one-line
label · per-game full history. *Evidence:* Massachusetts explicitly promises this — *"links to individual
game pages where you can view full results history, prize matrices, past winning numbers, and number
statistics"* — and Maryland/Minnesota specify per-game "View Results →" CTAs.

### 5.5 MOVE TO DEDICATED GUIDE

Step-by-step claim walkthrough (FL 7 steps; MD/MN equivalents) · full tax explainer including withholding
detail · anonymity/privacy explainer · draw-integrity and oversight prose · "Where Lottery Money Goes"
long form · player rights and common issues · scratcher end-of-game deadline mechanics. Each keeps a short
sourced summary on the hub with a link.

### 5.6 SUPPRESS UNTIL SOURCED

Recent winner narratives (E-8) · unclaimed-prize lists with expiry (E-2) · exact tax percentages (the
Minnesota draft's *"Federal 24% + Minnesota 7.25% = 31.25%"*) · anonymity thresholds (MN's *">$10,000"*) ·
claim deadlines and tiers per State · jackpot growth/rollover narratives · fund-allocation figures ·
scratcher snapshots and remaining prize counts · responsible-play helpline contact · retailer locations ·
"Next jackpot" estimates unless labelled as estimates with a source (E-7).

This aligns with `FD-S-01`/`FD-S-02` and with what the guarded Florida preview already does.

### 5.7 REJECT

| # | Rejected | Reason |
|---|---|---|
| R-1 | **Connecticut's encyclopedia-first hierarchy (Pattern F)** | Removes results from the results page. §1.1. |
| R-2 | **Tab and chip in-page navigation** | Puts crawlable result content behind interaction; `CLAUDE.md` §11. Use anchor links. §1.2. |
| R-3 | **Merged "Midday & Evening" single card** | Ambiguous which draw a number belongs to; ticket-checking hazard. T-8. |
| R-4 | **Unconditional Buy/Play CTAs** | Uncorrelated with real eligibility, wrong in FL/CA, inverted in MI/VA. §3. |
| R-5 | **"Why players like it" / "Odds & Strategy"** | Game recommendation framing. T-7. |
| R-6 | **Repeated trust sentence and duplicate FAQ blocks** | T-1, T-2. |
| R-7 | **Padded pre-result prose and hardcoded dates in copy** | T-3, T-4. |
| R-8 | **"Approximate" draw times** | A draw time is a published fact. |
| R-9 | **Placeholder-bearing modules shipped as content** | `[X days]`, `[date]`. E-2. |
| R-10 | **Simultaneous "Drawing now" on all cards** | E-6; status must be per-game and real. |
| R-11 | **Prediction-adjacent statistics framing** | Not in the PDFs but present in the Minnesota draft's "Statistical Tools"; permitted only as *statistically true historical observation*, never prediction. |

---

## 6. What the designs collectively get right

Stated plainly, because the audit above is largely corrective:

1. **The utility action row** (Check Ticket · Past Results · Prize Lookup · Claim Info) is a genuinely good
   idea and matches how result-seekers behave.
2. **The countdown / next-draw emphasis** is correct — it is the strongest honest engagement device
   available and needs no manipulation.
3. **Grouping multi-state separately from native games** is the right information model, even though the
   set disagrees on order.
4. **The trust architecture in Florida p6 and the Maryland/Minnesota "Why Trust Lottery Corner" blocks** is
   ahead of most competitors and should be treated as a differentiator, not boilerplate.
5. **Delaware's and Arkansas's cards** are close to the right answer for the State family.
6. **Virginia** proves a State page can be lean and still complete.
7. **California's honest scratcher scope statement** is the correct template for every data set we do not
   have.

---

## 7. Consequences for the Florida preview

Carried into the founder review document; recorded here for traceability.

1. Florida's merged Pick 2/3/4/5 cards (T-8) are a **design defect the preview must not inherit**. The
   preview currently shows single-variant games ("Pick 3 (Midday)", "Cash Pop (Morning)") — closer to
   correct, but incomplete: Lottery Post's live Florida page shows **Cash Pop with five daily draws** and
   **Fantasy 5 with midday and evening**, plus Jackpot Triple Play, Florida Lotto Double Play and
   Powerball Double Play. The preview's 7 verified games under-represent roughly 24 real Florida draw
   events.
2. The preview's `unavailable` treatment of winners, unclaimed prizes, taxes, claim deadlines and the
   responsible-play contact is **more correct than the proposed design**, and should be defended rather
   than "fixed" by importing PDF content.
3. Florida's **Sources & Methodology** block should be added to the preview's S-17 — it is approved-safe
   (it makes no factual claim about Florida, only about our own process) and it is the highest-value
   missing module.
4. The preview's utility bar must not gain a Buy Tickets action. Florida's commerce state is
   **`underReview`**, not `retailOnly`, until confirmed from the official operator (`FD-X-11`).
5. **`AD-S00` must not reserve or display advertising below 992 px during the preview** (`FD-X-04`), so no
   advertisement precedes the first verified result on mobile (`FD-X-03`).

---

## 8. Open questions this audit does not resolve

| # | Question | Why it is not settled here |
|---|---|---|
| Q-1 | Which top-page hierarchy is approved — multi-state first or native-first? | Founder decision; recommendation in the specification document §5.4 and founder review D-2/D-3. |
| Q-2 | Is a State statistics/number-frequency module in scope at all? | Constitution claim-type question; founder review D-6. |
| Q-3 | How many Florida draw events should the manifest cover before visual approval? | Data-coverage question, needs the results feed audited per game. |
| Q-4 | Do the five content drafts (MD, MN, MS, ME, LA) carry any approval status? | None found. Treated as tier-7 content evidence. |
| Q-5 | Should "LOTTERY SYSTEMS" remain in global navigation? | It appears in every mockup's header and is prediction-adjacent naming; a shell question, not a State question. |

---

*End of comparative audit. Companion documents:
`state-page-cross-state-experience-research.md`,
`state-page-mobile-ai-commerce-engagement-specification.md`,
`state-page-founder-experience-review.md`.*
