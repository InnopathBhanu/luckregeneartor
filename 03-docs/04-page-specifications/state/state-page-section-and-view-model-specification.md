# State Page — Section Manifest, View-Model, Responsive, AI and Commerce Specification

**Document type:** Implementation specification — State page family (PF-02 / BP-03)
**Produced by:** Task **LRG-SPEC-017**
**Date:** July 27, 2026
**Status:** **SPECIFICATION.** The 36 founder rulings in `ST-DEC-001` are applied. **No State code, fixture, route or advertisement was changed.**
**Baseline commit:** `482cd39`
**Consolidated by:** Task **LRG-DEC-018** — rulings applied throughout; the view model in Part B is
**deliberately simplified** where LRG-SPEC-017 had specified more structure than implementation needs.

**Binding authority.** PF-02 v1.1 governs State composition and section order. Global Shell v1.1
governs reusable shell behaviour. `design-system-founder-decisions.md` (DS-DEC-001, Tier 1) governs
shared visual tokens and accessibility. `state-page-founder-decisions.md` (`ST-DEC-001`, Tier 1)
governs the State-specific rulings. The Home Page is **not** a structural template for the State Page.
The proposed Florida design files are **visual references only**.

**Companion documents**

- `03-docs/08-decisions/state-page-founder-decisions.md` (`ST-DEC-001`) — the 36 rulings applied here
- `03-docs/04-page-specifications/state/state-page-source-and-current-implementation-audit.md` — the evidence base for every claim below
- `03-docs/05-advertising/state-ad-inventory-reconciliation.md` — slot-level ad audit
- `03-docs/04-page-specifications/state/state-page-founder-review.md` — disposition of every prior entry; the 8 remaining open decisions

---

# PART A — STATE PAGE SECTION MANIFEST

## A.1 How to read this manifest

**PF-02 §12 defines 25 governed anonymous positions: 19 content sections (S-01 … S-18, including
S-08A) + 5 ad anchors (AD-S00 … AD-S04) + the global footer.** Order and section IDs are transcribed
verbatim and **not modified** — `FD-S-04` requires exactly this.

- **Fixture availability** counts how many of the 16 current state fixtures carry usable data for the
  section (audit §4.3). `0/16` means the section has no data source today.
- **Protected zone** = ads, promotion and interruption prohibited inside. Not negotiable — `FD-S-21`.
- **Ad relationship** states only whether an ad anchor *abuts* the section. The anchor→slot
  distribution is `OPEN-ST-01` and is not proposed here.
- **State-specific** distinguishes sections whose *content* varies per jurisdiction (all of them) from
  sections whose *presence* varies (the conditional ones), and from sections that need genuinely
  distinct behaviour per state type (ST-01…ST-07).
- **Preview column** states whether the section is in scope for the **guarded Florida anonymous
  preview** (`FD-S-36`). "Suppressed" means `FD-S-02` suppresses it until sourced — with a recorded
  reason, and never with fabricated substitute content.

## A.2 Anonymous manifest

| # | ID | Official name | Req/Cond | Data dependency | Fixture avail. | State-specific behaviour | Protected | Ad relationship | Mobile (§46) | Implementation action (ruling) | Preview scope / open item |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **S-01** | State Identity and Task Header | **Required** | State registry: name, operator context, verification context; Change State; Follow State; Ask State AI | **16/16** partial — H1, intro, `lastUpdated`; **no** Change State, Follow State or Ask AI | H1 `Latest [State] Lottery Results, Winning Numbers and Jackpots`; ST-06 states jurisdiction status instead of a value claim | **Yes** — no ad inside the header | AD-S00 *follows* | Step 1 | **REFACTOR** the hero. Add Change State, Follow State and **Ask State AI** (`FD-S-16`). Replace the disabled Florida-only shell selector per `FD-S-08` | **In preview.** Follow State is anonymous-value only — persistence is signed-in (`OPEN-ST-07`) |
| 2 | **AD-S00** | Top State Advertisement | Required (inventory) | Ad registry | 16/16 — `sp_top_billboard` | `sp_toppromobar` is gated to 9 states | n/a | This *is* the anchor | Step 2 | **KEEP** position (`FD-S-22`) | **In preview.** `sp_toppromobar` → `OPEN-ST-03` |
| 3 | **S-02** | Latest State Results | **Required** (active games exist) | Result Ops: current result, status, format, draw date/time, jackpot/top prize, stable link | **16/16** — real feed values | Grouping fixed by PF-02: multi-state → state-only → daily variants → specialised. ME has 2 groups | **Yes** — no ad inside the result grid (`FD-S-21`) | AD-S01 follows the **section**, not a group boundary | Step 3 | **KEEP AND RESTYLE** `DynamicResultCard`/`BallGroup` (`FD-S-10`). Closed status union incl. `corrected`/`delayed` (`FD-S-09`); exact next-draw date on `awaiting`; three-signal special balls (`FD-S-14`); variant identity (`FD-S-11`) | **In preview** — Florida's displayed formats must be governed first (`FD-S-10`) |
| 4 | **S-03** | State AI Brief | **Required** | AI Product, over governed inputs only | **0/16** | Prompts must name the state and its real games/schedule | **Yes** — no ad inside an AI answer | between S-02 and AD-S01 | Step 5 | **NEW.** One complete anonymous answer (Global Shell §10.2). Never the only unique state content (PF-02 §64B) | **In preview** — launch placement 1 of 5 (`FD-S-16`); grounded in the Florida manifest (`FD-S-03`) |
| 5 | **AD-S01** | Post-Results Advertisement | Required (inventory) | Ad registry | mapped | — | n/a | This *is* the anchor | Step 4 | First normal inline ad, **after** results | **In preview** — position from `OPEN-ST-01` |
| 6 | **S-04** | Live and Upcoming Draws | **Conditional** — reliable status/schedule exists | Schedule Ops: cutoff, timezone, live status | **0/16** as a section; `drawSchedule` 15/16 and `jackpotTicker` 16/16 are adjacent | Legacy supplies `cutOffTime`, `advancedPlays`, `daysOff` (**days NOT drawn**), `nextDrawTimeZoned` | **Yes** — no ad between live status and result | AD-S02 may follow | Step 6 | **NEW**, built on the legacy schedule/cutoff rules. May move beside S-02 under Adaptive Priority (`FD-S-04`) | **In preview only if Florida cutoff data verifies**; otherwise schedule-only. Verification → `OPEN-ST-08` |
| 7 | **S-05** | Check My State Ticket | **Required at experience level** | Tool/Data: current game rules | **5/16** — ar az co fl va | Game options from the state's real portfolio | **Yes** — no ad between input and output | none inside | Step 7 | **REFACTOR** `CheckTicketTool`. Comparison is **deterministic, never AI** (`FD-S-17`). Its disabled controls resolved per `FD-S-08` | **In preview**, scoped to Florida games with governed formats (`FD-S-10`) |
| 8 | **S-06** | State Game Portfolio | **Required** | Game registry: offering lifecycle, price, top prize, next draw, how-to-play | partial — `popularGames` 16/16, `oddsGuide` 6/16, `gameComparison` 2/16 | Grouping: state draw · multi-state · daily · scratchers · fast play/keno · online · **announced and retired separately** | No | AD-S02 *follows* | Step 9 | **NEW** section; absorbs `popularGames`, `gameComparison` and `secondChance`-as-offering (`FD-S-05`). Heading **`Compare [State] Lottery Games`**; prohibited framing removed (`FD-S-06`) | **In preview.** Published odds only — never computed |
| 9 | **AD-S02** | Post-Games Advertisement | Required (inventory) | Ad registry | mapped | — | n/a | This *is* the anchor | Step 8 | No task interruption | **In preview** — position from `OPEN-ST-01` |
| 10 | **S-07** | Where to Play / Buy Online | **Conditional** — verified state/provider option | Commerce Ops, daily + event verified | **0/16** as a section | Highest state variance: ST-01 retail-only · ST-02 official online first · ST-03 disclosed courier · ST-06 suppress entirely | **Yes** when eligibility is stale — suppress | AD-S02 precedes | Step 10 | **NEW.** Option hierarchy per PF-02 §20. Default label **`Where to Play`** (`FD-S-18`); adjacent disclosure (`FD-S-19`) | **Non-transactional information only, and only if verified** (`FD-S-20`). Commerce activation is Track 5 |
| 11 | **S-08** | Claims, Taxes, Anonymity and Player Help | **Required** (summary) | Trust/Editorial, with source + effective date | `howToClaim` 16/16, `taxes` 16/16, `anonymityRules` 4/16 — all **synthetic** | Claim thresholds, deadlines, tax status and anonymity rules are per-jurisdiction law | **Yes** — no affiliate CTA, **no ad** (`FD-S-21`), source-first AI | none inside | Step 11 | **KEEP AND RESTYLE** `HowToClaim`/`TaxInfo`. Add the **locator and contact card** — legacy carries operator address, phone and official URL, which the fixtures dropped. Effective + last-verified dates | **In preview for officially sourced facts only**; anything unsourceable renders **"Currently unavailable"** (`FD-S-01`, `FD-S-02`) |
| 12 | **S-08A** | State Essentials | **Required** | Manifest: age, time zone, claim deadline, tax status, anonymity summary, online-play status, official help link, dates | **0/16** governed; `quickFacts` 15/16 is the nearest module | 8 compact facts, each per-jurisdiction | **Yes** — no affiliate or ad inside | none inside | Step 12 | **REFACTOR** `quickFacts` → S-08A (`FD-S-05`). May sit inside S-08 on narrow layouts but stays separately governed | **In preview** from the Florida manifest (`FD-S-03`); unverifiable facts marked unavailable |
| 13 | **S-09** | Worth Knowing in This State | Conditional | Data/Editorial/AI, validated + ranked | `highlights` 15/16, `highlightsGrid` 1/16 — **synthetic** | **Maximum three** highlights; each links to evidence | No | AD-S03 follows later | Step 13 | **REFACTOR** `HighlightsAlerts`; absorb `highlightsGrid` (`FD-S-05`). **Remove the two hardcoded "Florida" headings.** Enforce the 3-item cap | **Suppressed until sourced** (`FD-S-02`) — the current content is fabricated |
| 14 | **S-10** | State Tools, History and Statistics | Conditional | Tool owners | `historyLinks` 15/16, `numberTrends` 1/16, `jackpotTracker` 5/16 | Prioritise tools available for the selected state/game | No | AD-S03 *follows* | Step 14 | **KEEP AND RESTYLE** `HistoryLinksSection`; absorb `jackpotTracker` and `numberTrends`, and `secondChance`-as-tool/history (`FD-S-05`) | **In preview** for links to routes that exist; live jackpot estimates suppressed until sourced |
| 15 | **AD-S03** | Lower Utility Advertisement | Required (inventory) | Ad registry | **not mapped** | — | n/a | This *is* the anchor | lower | Candidate home for `sp_mid_leaderboard_pos5`/`pos6` (`FD-S-22`) | **In preview** — assignment from `OPEN-ST-01` |
| 16 | **S-11** | Scratchers / Instant Games | Conditional — sustainable snapshot | Scratcher Ops, with snapshot date | **5/16** — az ca ct la va | ST-04 states only; snapshot caveat mandatory | No | AD-S03 precedes | Step 15 | **KEEP AND RESTYLE** `InfoSectionList#scratch-offs`. AI may compare but **never claim a best ticket** | **Suppressed** — no sustainable snapshot source exists (`FD-S-02`) |
| 17 | **S-12** | Winners and Unclaimed Prizes | Conditional — published data | Editorial/Source Ops | `highlights.unclaimedPrizes` 15/16, `biggestWinners` 4/16, `winnerLocation` 3/16 — **all synthetic** | Identity and location **only as published** | **Yes** — no purchase CTA inside claim/winner modules | none inside | Step 16 | `winnerLocation` maps here (`FD-S-05`) | **Suppressed** (`FD-S-02`). Fabricated winner content must not ship |
| 18 | **S-13** | State Lottery Impact / Fund Allocation | Conditional — current sourced info | Editorial/Source Ops, with reporting period | **4/16** — co ct mi va | Beneficiary programmes are per-state | No | — | Step 17 | **KEEP AND RESTYLE** `InfoSectionList#fund-allocation`; add reporting period; avoid operator-promotional tone | **Suppressed until sourced** (`FD-S-02`) |
| 19 | **S-14** | State Community / Forums | **Required hub** | Community Ops | **0/16** | State identity is the community anchor (PF-02 §1.4) | No — minimal ads | — | Step 18 | **NEW.** Hub entry point plus a **genuine empty state**. Cold start per PF-02 §27. **Never fabricate users, posts or replies** | **In preview as a genuine cold-start hub.** PF-02 §4: *"activity may begin with Q&A/draw threads"* — **not blocked** |
| 20 | **S-15** | State News, Blog and Guides | **Required hub** | Editorial | **0/16** as a section; legacy has `blog.recentPosts` | Content may be sparse but must be **real** | No | — | Step 19 | **NEW.** Reconnect the legacy `blog.recentPosts` source, which the current page dropped | **In preview if real editorial exists**, else an honest empty state. PF-02 §4: *"sparse but real"* — **not blocked** |
| 21 | **S-16** | Follow State / My LotteryCorner | **Required** | Product/Lifecycle | **0/16**; `accountHooks` is a disabled stub | Follow events are user-selected; **no all-marketing default bundle** | No | — | Step 20 | Anonymous value proposition only | **Anonymous value statement in preview; persistence blocked** by `OPEN-ST-07` |
| 22 | **S-17** | State Sources, Responsible Play and Support | **Required** | Trust/Policy | trust notices 16/16; `sourcesMethodology` 1/16 | State-specific age minimum and state responsible-play helpline | **Yes** — protected from promotion | — | Step 21 | **KEEP AND RESTYLE** the trust block. Add operator link, methodology/corrections, contact, state age, AI and affiliate disclosure links | **In preview** |
| 23 | **S-18** | All States / Change State | **Required** | IA/Registry | **0/16** on State; Home `StateDirectory` exists; legacy renders a full directory | Must include territories and ST-06 jurisdictions; **never `/usx`** (`FD-S-30`) | No | AD-S04 follows | Step 21 | **NEW** on State; reuse `StateDirectory` backed by the route registry (`FD-S-30`) | **In preview** — prevents the state page becoming a dead end |
| 24 | **AD-S04** | Pre-Footer Advertisement | Required (inventory) | Ad registry | 16/16 — `sp_bottom_billboard` | — | n/a | This *is* the anchor | Step 22 | **KEEP** | **In preview** |
| 25 | **Footer** | Global Footer | Required | `footer-config.json` | 16/16 | — | n/a | — | Step 22 | **KEEP AND RESTYLE**; do not invent links | **In preview** |

**Notice and correction surface (`FD-S-07`).** The legacy three-severity notice capability
(information · warning · correction/error) becomes a governed State surface carrying *what changed,
when, and the impact*, with accessible dismissal where dismissal is appropriate. It is not a numbered
PF-02 position: it renders above the content flow, and a **material correction** raises Adaptive
Priority trigger 2, placing the notice and the corrected fact ahead of all continuation modules.

**Rail and mobile anchors** (PF-02 §59, no fixed sequence position): **AD-SR01** optional desktop rail —
*never inside result or claim facts*, section-bounded and sticky only where it cannot travel across
protected content (`FD-S-28`); **AD-SM01** mobile inline/sticky mapping, with the Global Shell sticky
priority applied (`FD-S-29`). Slot assignment for both → `OPEN-ST-01`.

**Coverage summary.** **19** governed content sections. **10** have a partial counterpart today
(S-01, S-02, S-05, S-08, S-09, S-10, S-11, S-12, S-13, S-17); **9** have none (S-03, S-04, S-06, S-07,
S-08A, S-14, S-15, S-16, S-18). *(LRG-SPEC-017 said "20 sections / 11 partial"; both were wrong.)*

**Orphan modules — all seven now assigned** (`FD-S-05`): `quickFacts`→S-08A · `jackpotTracker`→S-10 ·
`highlightsGrid`→S-09 · `gameComparison`→S-06 *after neutral reframing* · `winnerLocation`→S-12
*suppressed until sourced* · `numberTrends`→S-10 · `secondChance`→S-06 or S-10 depending on whether it
describes an active game offering or a tool/history destination. **No module is preserved merely to
avoid deleting it** — anything that fits neither a governed section nor a genuine need is dropped.

## A.3 Signed-in manifest — specified, blocked

PF-02 §32 defines 17 positions / 12 signed-in section IDs: **S-01S** My [State] Lottery Home ·
**AD-SS00** · **S-02S** Followed State Results · **S-03S** Personal State Next Action ·
**S-04S** Live and Upcoming Followed Draws · **S-05S** My State Matches · **S-06S** State Alerts ·
**AD-SS01** (ad / Insider offer) · **S-07S** Continue My State Tools and Systems ·
**S-08S** Following and State Community · **S-09S** State News, Winners and Guides ·
**S-10S** Where to Play · **S-11S** Followed Scratchers · **S-12S** My Controls · broad state
discovery · **AD-SS02** · Footer.

**All 12 are blocked — and that blocks Track 4 only, not the anonymous preview.**
`source-conflicts.md` Conflict 3 leaves 11 Member/Insider founder decisions open, and `CLAUDE.md` §16
forbids implementing member routes, quotas, entitlement or Insider ad treatment until they close.
AD-SS01's "Insider offer" is directly the subject of open decision 3 (*Insider ad treatment*), which
touches GAM inventory. Tracked as `OPEN-ST-07`; `FD-S-36` excludes signed-in and Insider variants from
the next implementation phase.

Two constraints are binding regardless and must be designed for now, not retrofitted:

1. **Claim outranks play.** S-03S ranks a possible winning match / claim above every other action;
   personalisation can never outrank it (§12.1, §35).
2. **S-05S shows exact outcomes only** — no near-miss celebration, no immediate play pressure (§37).

## A.4 Adaptive Priority Override — implementation contract

The section order above is the default, not an invariant. Five triggers may reorder it (PF-02 §12.1):

| Priority | Trigger | Effect | Required record |
|---:|---|---|---|
| 1 | Possible winning match / claim-sensitive outcome | Check-Ticket result and Claim Guidance move ahead of AI, advertising and purchase | trigger, start time, expiry |
| 2 | Material correction | Correction notice and corrected current fact precede **all** continuation modules | as above |
| 3 | Live / pending / newly completed draw | S-04 moves beside or immediately after S-02 | as above |
| 4 | Safety or responsible-play context | High-protection guidance moves ahead of commerce and promotion | as above |
| 5 | Source outage / stale purchase rule | Affected facts or commercial actions are **suppressed**, not shown in place | as above |

Implementation consequence: **section order must be data-driven, not hardcoded JSX.** The current
template hardcodes 41 steps in source order and therefore cannot express any override. This is the
main structural reason `StatePageTemplate` is classified **REPLACE**.

**Scope of that mechanism is bounded by `FD-S-04`:** a **typed State-specific section manifest and
resolver** are sufficient. This is explicitly **not** a generic page-builder framework, not a
cross-family abstraction, and not a rendering engine. One manifest, one resolver, five triggers.

## A.5 Content-budget contract (PF-02 §12.2)

| Module | State Hub budget | Deeper canonical destination |
|---|---|---|
| Latest results | controlled set of current full cards | results collection, game and stable draw pages |
| Daily variants | compact grouped rows/cards | game-variant pages and history |
| Claims / tax / anonymity | concise summary cards | dedicated state guides |
| Scratchers | 3–6 preview items | state scratcher collection, ticket detail |
| Winners / unclaimed | up to 3 current items **per class** | news, winner and unclaimed collections |
| Community | up to 3 relevant discussions | state community hub and threads |
| News / blog / guides | 3–5 selected items | state editorial archives |
| Tools | selected state-relevant tools | tool home, game-specific tools |
| Schedules | live / next summaries | full schedule page |
| Odds / prize matrices | short comparison only | game prize/odds guides |

The current page **exceeds this budget substantially**: full claim procedures, two full tax tables,
full per-game odds accordions, `playerInfo` long-form prose and two complete FAQ sets all render
inline. Several of the destinations the budget routes to **do not exist yet**, so trimming the hub
before those pages ship would remove content with nowhere to go. Sequencing is addressed in Part F.

## A.6 Stable section fragments (PF-02 §64A)

Mandated: `#latest-results` `#live-draws` `#games` `#check-ticket` `#where-to-play` `#claim-prize`
`#taxes` `#state-essentials` `#scratchers` `#community` `#news`.

Current and legacy both use `#results` `#winning-history` `#schedule` `#how-to-play` `#how-to-claim`
— **zero overlap**. These identifiers are live in production HTML and support direct links, analytics,
AI citations and future app deep links.

**Ruled by `FD-S-33`:** the PF-02 fragments are the **primary IDs**. A legacy fragment is preserved
only as a **secondary alias target**, and only where a live inbound-link or analytics dependency is
**demonstrated** — not by default. **No visible section may be duplicated to serve an alias.**
Gathering that dependency evidence is an SEO work item, not a founder decision.

---

# PART B — STATE PAGE VIEW MODEL

**Documentation-only, and deliberately pragmatic.** This is not an API contract, not a database
design, and not a fixture format. Per `CLAUDE.md` §14 and §15: *"a view model is not a domain
contract"* and *"fixtures MUST NOT become API contracts by accident."*

> **Simplified by LRG-DEC-018.** The LRG-SPEC-017 version specified more structure than the first
> implementation needs. Four things were removed: wrapping **every** UI string in `Sourced<T>`; a
> generic rendering engine; a universal page-builder abstraction; and storage-level ownership and
> cadence fields inside every leaf object. What is **kept** is the separation of concerns, because
> that is what stops the fixture becoming an accidental API contract.

## B.0 The twelve concerns this model keeps separate

`metadata` · `identity and context` · `provenance and freshness` · `results and formats` ·
`schedules` · `claims, tax and anonymity` · `commerce eligibility` · `editorial and community` ·
`AI entries` · `ad anchors` · `trust and corrections` · `interaction states`.

Each is a distinct branch of the page object. Collapsing any two is what produced today's flat
`StatePageData` with its ~40 optional presentation keys.

## B.1 Envelope

```
StatePageViewModel
  schemaVersion     semver of this view-model shape
  manifestVersion   version of the State Content Manifest projected from
  generatedAt       ISO-8601 with offset
  userState         "anonymous" | "signedIn" | "insider"     (signedIn/insider BLOCKED — OPEN-ST-07)
  stateType         "ST-01".."ST-07"                          PF-02 §3
  sectionOrder      ordered governed section IDs actually rendered
  activeOverride    AdaptivePriorityOverride | null
  suppressions      [{ sectionId, reason }]
  provenance        ProvenanceRegistry                        see B.2
```

Two properties carry real weight:

- **`sectionOrder` is data.** It is the only reason the five Adaptive Priority overrides are
  expressible at all (`FD-S-04`). It is resolved by a typed State resolver — not a page-builder.
- **`suppressions` is mandatory.** PF-02 §1 principle 11 requires every conditional module to record
  why it is shown or suppressed. Absence must be explained, never inferred. `FD-S-02`'s suppressions
  appear here with their reasons.

```
AdaptivePriorityOverride
  trigger     "possibleWin" | "correction" | "liveDraw" | "safety" | "sourceOutage"
  startedAt   ISO-8601
  expiresAt   ISO-8601
  affects     section IDs moved or suppressed
```

## B.2 Provenance — a small registry, referenced by governed facts

**Not a per-string wrapper.** The page carries one provenance registry; a governed fact points at an
entry by key. Most UI strings — headings, labels, link text, static copy — carry **no** provenance at
all, because they are product copy, not governed facts.

```
ProvenanceRegistry = { [provenanceRef]: ProvenanceRecord }

ProvenanceRecord
  origin           "productionDerived" | "copiedEditorial" | "synthetic" | "configuration"
  availability     "verified" | "unverified" | "underReview" | "unavailable"
  freshness        "current" | "dueForReview" | "stale" | "unknown"
  sourceUrl?       sourceType?      effectiveDate?      lastVerified?
```

**What counts as a governed fact** — the only things that carry a `provenanceRef`:

result values and draw dates · jackpots and prizes · draw schedules and cutoffs · claim thresholds,
deadlines and methods · tax status and withholding · winner-anonymity rules · operator identity and
contacts · minimum purchase age · online-play status · purchase eligibility and provider data ·
scratcher snapshots · winner and unclaimed-prize records · fund-allocation figures.

Anything not on that list is product copy and needs no provenance.

**`origin` is the publication gate, not an annotation.** `FD-S-01`: a fact whose origin is
`synthetic` must not render as public fact outside a labelled internal preview, and **a visible
"synthetic" label is not an acceptable substitute**. Enforcement is environment-level and single: a
synthetic fact reaching a public page is a failure, not a styling question.

**Ownership and review cadence live in the State Content Manifest, not here.** `FD-S-03` makes the
manifest the governed content contract; duplicating `owner` and `reviewCadence` into every leaf of a
render-time object was premature and is removed.

```
CorrectionRecord        PF-02 §57, DS-29, FD-S-07
  correctedAt   whatChanged   impact   previousValue?
```

## B.3 Page metadata

```
metadata
  title  description  h1                  one H1 per page
  canonicalUrl                            DEFERRED — FD-S-32; not emitted during preview
  robots
  openGraph { type, siteName, title, description, url?, image?, imageAlt? }
  twitter   { card, site, creator, title, description, image? }
  breadcrumb [{ name, url, isCurrent }]
  sectionFragments  { governedSectionId -> fragment }    FD-S-33: PF-02 primary, evidence-gated alias
  dateModified                            machine-readable; currently unemitted
  schema            StructuredDataProjection
```

```
StructuredDataProjection                  PF-02 §64, FD-S-34
  pageType      "CollectionPage" | "WebPage"      CollectionPage preferred
  ids           stable @id values: stateHub · jurisdiction · publisher · stateLotteryOperator · games
  jurisdiction  Place | AdministrativeArea
  publisher     Organization (LotteryCorner)
  operator      Organization (the state lottery) — MUST be distinct from publisher
  itemLists?    only for meaningful, VISIBLE lists
  faqPage?      ONLY when the FAQ is visible
  relatedLinks? game URLs — legacy emits these; the current page does not
```

Prohibited (PF-02 §64): marking LotteryCorner as the operator; FAQ markup merely because an accordion
exists; result cards as Product/Offer; invented lottery-specific types.

## B.4 State identity and context

```
identity
  stateCode  canonicalName  aliases
  jurisdictionType   "state" | "district" | "territory"
  lotteryStatus      "active" | "noActiveLottery" | "operatorRestructured" | "unknown"
  stateType          "ST-01".."ST-07"
  operator           { name, officialUrl, phone?, mailingAddress?, claimOfficeUrl? } + provenanceRef
  primaryTimezone    IANA        displayTimezones  IANA[]
  minimumPurchaseAge value + provenanceRef
  canonicalRoute     from the route registry — NEVER from a fixture filename   FD-S-30
```

```
context                                   PF-02 §9, Global Shell §6.5
  resolvedState         stateCode
  resolutionSource      "pageJurisdiction" | "sessionSelection" | "signedInPreference"
                        | "grantedDeviceLocation" | "manualEntry" | "ipSuggestion"
  confirmationRequired  TRUE whenever resolutionSource == "ipSuggestion"
  changeStateAction
```

**Binding:** `ipSuggestion` must never satisfy an eligibility, claim, tax or provider decision. Raw IP
must never reach a redirect, content or analytics store (`CLAUDE.md` §13).

## B.5 Freshness and source surface

```
freshness
  lastUpdatedDisplay     exact human string with timezone abbreviation
  lastUpdatedIso         ISO-8601 with offset
  storedTimezone         where draw data is stored (production: America/New_York)
  gameLocalTimezone      what the draw date MEANS
  activeCorrections      CorrectionRecord[]  — drives Adaptive Priority trigger 2
  degradedSources        [{ sourceId, since, affectedSections }]
```

**Date rule (`CLAUDE.md` §14):** the game-local draw date is the meaning; the stored timezone is
storage. Year and date routes must reflect the **game-local** date. The legacy off-by-one is the named
symptom to test against (`FD-S-35`).

## B.6 Results

```
results
  groups [ { groupKey: "multiState"|"stateOnly"|"dailyVariants"|"specialized",
             heading, cards: ResultCardViewModel[] } ]
  budgetApplied   shown vs available      PF-02 §12.2
```

```
ResultCardViewModel
  gameRef        { gameId, slug, displayName, variantLabel?, variantOfGameId? }   FD-S-11
  formatRef      { formatId, effectiveFrom, effectiveTo }        date-effective, required
  status         "verified"|"pending"|"awaiting"|"delayed"|"cancelled"
                 |"corrected"|"closed"|"unavailable"             CLOSED union — FD-S-09
  statusDetail   required when status != verified; includes the exact next-draw date on `awaiting`
  drawDate       { gameLocalDate, display, isoDrawDateTime, timezoneLabel }
  groupsDrawn    BallGroupDrawn[]         count ALWAYS from data
  secondaryDraw? named group set (e.g. "Double Play")
  multipliers?   full text, never a bare number                  DS-14
  addOns?        named single balls (e.g. Fireball)
  prize?         { display, kind: "jackpot"|"topPrize" } + provenanceRef
  nextDraw?      { gameLocalDate, display, cutoffIso?, nextPrizeDisplay? } + provenanceRef
  payout?        PayoutTable — normalized rows ONLY, never escaped XML
  stableResultUrl   checkNumbersAction   toolLinks?
  purchaseAction PurchaseAction                                   B.9
  insight?       AiInsight — only for a materially useful fact, never per-card boilerplate
```

```
BallGroupDrawn
  order   label?   values[]   valueType "number"|"digit"|"card"   isSpecial
  accessibleName            required when isSpecial            FD-S-14 signal 3
  distinction               { colorToken, shapeToken }          FD-S-14 signals 1 and 2
```

```
PayoutTable
  rows [{ match, numOfWinners, prize?, prizeType, prizeDisplay }]   totals?
  note  feed caveat: draw fields are EST; payoutInfo timestamps are UTC
```

## B.7 Schedules, jackpots and live status

```
jackpots   [{ gameRef, amountDisplay, estimateBasis, asOfIso } + provenanceRef]

schedules
  entries  [{ gameRef, drawDays, drawTimeDisplay, timezoneLabel, cutoffDisplay?, advancePlays? }
            + provenanceRef]
  drawDayBasis  "drawDays" | "daysOffInverted"      legacy stores days OFF
  fullSchedulePath

liveDraws                                            S-04, conditional
  items [{ gameRef, status, statusChangedIso, timeDisplay, timezoneLabel,
           resultPath?, followAction?, purchaseAction? }]
        status ∈ upcoming | live | awaitingResult | verified | delayed | cancelled
```

`drawDayBasis` exists because legacy stores `game.daysOff` — days the game does **not** draw — and
inverts it at render. Importing it as "draw days" would silently invert every schedule.

## B.8 Game definitions

```
games
  groups  ordered: stateDraw · multiState · dailyNumber · scratchersInstant
                   · fastPlayKenoSpecialized · online · announced · retired
                   (announced and retired presented SEPARATELY)
    items [ { gameRef, lifecycleStatus, ticketPrice?, topPrizeOrJackpot?,
              publishedOdds?, drawFrequency?, purchaseChannels?,
              howToPlayPath, latestResultPath, purchaseAction } + provenanceRef ]
  comparison?  NeutralComparison
```

```
NeutralComparison                          PF-02 §19, FD-S-06 — BINDING
  heading  "Compare [State] Lottery Games"
  columns  subset of: ticketPrice | drawFrequency | gameFormat
           | jackpotOrTopPrizeStructure | publishedOdds | purchaseChannel | schedule
  rows
```

`publishedOdds` are **published values only** — never computed, never estimated. **Prohibited
headings and framing** (`FD-S-06`): "Which game should you play?", "best game", "best odds to play",
"increase your chances", or any language implying one game is financially preferable.

## B.9 Claims, tax, anonymity, essentials — and commerce eligibility

```
playerHelp                                 S-08
  claims        { firstStep, thresholds[], deadline, methods[], guidePath } + provenanceRef
  taxes         { federalScope, stateStatus, withholdingNote, finalLiabilityNote,
                  calculatorPath?, limitation } + provenanceRef
  winnerPrivacy { canRemainAnonymous, publishedInformation[], thresholdOrException?,
                  guidePath } + provenanceRef
  locator       { officialSiteUrl, phone?, claimOfficeUrl?, mailingAddress?,
                  retailerFinderPath? } + provenanceRef
  highProtection { affiliateSuppressed: true, adsSuppressed: true,
                   aiMode: "sourceFirst", humanEscalationPath }
```

`highProtection` is **not configurable to false**. `FD-S-21` prohibits advertising in claim, tax and
anonymity content outright; PF-02 §21 prohibits the affiliate CTA.

```
stateEssentials                            S-08A — 8 governed facts, each + provenanceRef
  minimumPurchaseAge · primaryTimezone · standardClaimDeadline · stateTaxStatus
  · winnerAnonymitySummary · onlinePlayStatus · officialHelpLink · effectiveDate/lastVerified
```

An unverifiable fact renders **"Currently unavailable"** (PF-02 §64B, §21A) — never generic
state-name substitution.

```
PurchaseAction                             PF-02 §20 + FD-S-18 — label derivation is a RULE
  label        "Where to Play" (DEFAULT) | "Buy Tickets" | "Play Online"
               | "Find a Retailer" | null
  path         first-party resolver path only — never a partner domain or tracking parameter
  eligibility  { stateConfirmed, gameConfirmed, providerConfirmed,
                 physicalLocationConfirmed, ageGateSatisfied, cutoffPassed,
                 dataFreshness: "current"|"stale" }
  optionType   "officialOnline"|"officialApp"|"subscription"|"affiliateCourier"
               |"retailOnly"|"unavailable"|"unknown"
  disclosure   required when optionType == "affiliateCourier" — rendered ADJACENT   FD-S-19
  suppressionReason?
```

**`Where to Play` is the default** (`FD-S-18`). `Buy Tickets` / `Play Online` require **all six**
eligibility conditions. `null` suppresses the action entirely — see F.8.

## B.10 Archives, tools, editorial, community

```
archives  [{ label, path, yearRange? }]          from resultsFrom/resultsTill per game
tools     [{ label, path, appliesTo: "state"|"game", gameRef? }]

editorial { news: EditorialItem[], guides: EditorialItem[], budgetApplied }
            EditorialItem { title, path, publishedIso, updatedIso?, category, summary?,
                            authorOrByline }

community { hubPath, discussions: DiscussionItem[], unansweredQuestions,
            askQuestionAction, budgetApplied, coldStart: boolean }
            DiscussionItem { title, path, authorAttribution, replyCount, lastActivityIso }
```

**Binding:** community content is human-authored. Fabricating posts, threads, replies, reputation or
activity is prohibited (Constitution; PF-02 §27; `FD-S-36`). **`coldStart: true` means show a genuine
empty state** — not seeded content. PF-02 §4 permits exactly this for both S-14 and S-15, which is why
neither blocks the preview.

## B.11 AI entry points

```
aiEntryPoints [ AiEntryPoint ]
```

```
AiEntryPoint
  sectionId         the governed section it belongs to
  kind              one of the 5 launch kinds — FD-S-16
  label             "LotteryCorner AI" | "AI Quick Take" | "Draw Insight"
                    | "LotteryCorner Research Note"
  suggestedPrompts  contextual to THIS state and its real games/schedule
  groundedIn        manifest field paths the answer may draw on
  anonymousPolicy   "oneCompleteAnswer"
  fallback          behaviour when a grounding source is degraded
```

```
AiInsight
  text   label   groundedIn
  classification  "verifiedFact"|"historicalObservation"|"historicalCoincidence"
                  |"lotteryCornerAnalysis"|"communityBelief"|"entertainmentTool"
                  ("unsupportedPrediction" is NOT permitted)
```

There is no `mayDetermine` field. `FD-S-17` makes the boundary absolute rather than per-entry
configuration: **AI never determines winning numbers, corrections, ticket-match results, eligibility,
claim outcomes, tax advice, purchase availability or affiliate recommendation.** Ticket comparison and
eligibility evaluation are **deterministic components**.

## B.12 Advertising anchors

```
adAnchors [ AdAnchor ]

AdAnchor
  anchorId        "AD-S00".."AD-S04" | "AD-SR01" | "AD-SM01"
  afterSectionId  the governed section it follows
  groups [{ subPosition: "inline"|"rail"|"sticky"|"mobile-inline",
            visibility:  "all"|"gte-992"|"lt-992",
            slotKeys:    [...],
            placementState: "reserved"|"filled"|"no-fill" }]
```

Three rules, all now ruled rather than proposed:

1. **Anchors are positions; slots are inventory.** One anchor may carry several slots.
2. **The view model carries `slotKeys` only** — no GAM unit path, div id, size or size map. Reserved
   height is read at render time from `ad-slot-definitions.json`.
3. **A build-time baseline guard is required** (`FD-S-22`): every slot is provably placed or explicitly
   disabled with a reason, and the build fails if the approved count changes.

Visibility uses the single **992 px** threshold (`FD-S-24`) — there must be no 992–1023 px gap.

## B.13 Trust, corrections and interaction states

```
trust  { sourceNotices, independenceDisclaimer, methodologyPath, correctionsPolicyPath,
         contactPath, responsiblePlay: { stateHelpline?, nationalHelpline, minimumAge },
         aiDisclosurePath, affiliateDisclosurePath }

notices                                     FD-S-07
  items [{ severity: "information"|"warning"|"correction",
           text, whatChanged?, whenChanged?, impact?, dismissible }]
```

```
interactionStates   per rendered section
  loading | empty | awaitingResult | stale | corrected | unavailable | noFillAd
  | anonymous | signedIn                    CLAUDE.md §9 — all applicable states
```

Section-level state vocabularies the model must be able to express (PF-02 §71):

| Domain | States |
|---|---|
| Results | pending · verified · corrected · delayed · unavailable |
| Live | upcoming · live · awaitingResult · verified · delayed · cancelled |
| Purchase | officialOnline · officialApp · subscription · affiliateCourier · retailOnly · cutoffPassed · locationRequired · unavailable · stale |
| Scratchers | active · ending · ended · snapshotStale · incomplete |
| Winners / unclaimed | open · claimed · expired · statusUnknown |
| Community | active · noHumanReply · aiResearchAvailable · locked · archived |
| State level | active · noActiveLottery · operatorRestructured · sourceOutage · dataDelayed · gameAnnounced · gameSuspended · gameRetired · purchaseChanged · guideUnderReview |

## B.14 Required vs optional

**Optional means "this may legitimately not exist for this jurisdiction."** It does **not** mean "we
have not sourced it yet."

- A governed fact that cannot be verified is `availability: "unavailable"` and renders as
  **"Currently unavailable"** — never generic-filled.
- A fact past its freshness threshold is `freshness: "stale"` and must be **labelled, suppressed, or
  routed to a current source** — never silently shown as current (PF-02 §56).
- A section with no data collapses **without an empty visual shell** (PF-02 §12).
- `origin: "synthetic"` is a **hard publication gate** (`FD-S-01`).

## B.15 What this model deliberately does not do

- No database tables, API endpoints, request/response payloads or query shapes.
- No storage form for the State Content Manifest — PF-02 §56A permits DB, XML, JSON, CMS or API.
- No per-string provenance wrapper, no owner/cadence field on every leaf (both live in the manifest).
- No generic rendering engine and no page-builder abstraction (`FD-S-04`).
- No reuse of the current fixture shape as the contract.
- No entitlement model. Signed-in and Insider fields are named for completeness only and are blocked
  by `OPEN-ST-07`.

---

# PART C — RESPONSIVE SPECIFICATION

## C.1 The single named threshold

**992 px (DS-20)** governs ad-tier visibility, contextual-rail appearance and the primary
one-column/two-column transition. It matches the only two GAM tiers that exist — `[992,0]` and
`[0,0]`. No GAM mapping, slot id, unit path, placement or count changes.

**The State page does not yet honour it.** The rail is gated by Tailwind's default `lg` = 1024 px
(`StatePageTemplate.tsx:214`, and no `@theme` breakpoint override exists), while
`.lc-ad--mobile-only` hides at 992 px. Between the two, three rail slots and three mobile slots are
**all** hidden — 6 rendered placements instead of 9. **Ruled by `FD-S-24`** (subject to ad-operations validation): one 992 px threshold, no 992–1023 px inventory gap, no GAM size-mapping change.

## C.2 Behaviour at each mandated width (DS-19)

| Width | Layout | Ads | Results | Navigation | Must verify |
|---:|---|---|---|---|---|
| **320** | one column; 16 px min body (DS-09); one card-nesting level max (DS-07) | mobile tier; sticky footer reserved from its own mapping | cards stack; ball groups wrap; **no horizontal swipe** | mobile app bar + bottom nav; compact section menu | no horizontal page scroll; tables scroll inside their own container; 44×44 targets where practical; sticky + bottom nav do not overlap |
| **375** | as above | as above | as above | as above | primary reference mobile width; virtual keyboard must not hide ticket-check or AI actions |
| **390** | as above | as above | as above | as above | safe-area inset respected on the sticky layer |
| **768** | one column, wider measure | mobile tier — GAM has **no tablet tier**; tablet resolves to `[0,0]` | 2-up card grid permitted | mobile pattern still applies | the absence of a tablet tier is a GAM fact, not an oversight |
| **991** | last mobile-tier width | mobile tier | as 768 | mobile | boundary test — the pixel before the threshold |
| **992** | **switch:** two columns, rail appears | **desktop tier; rail slots appear; mobile-only slots disappear — simultaneously** | 2–3-up grids | desktop nav | **the DS-20 gap closes here or not at all** |
| **1024** | two columns | desktop tier | as 992 | desktop | retained as a distinct checkpoint precisely because the current code switches here |
| **1280** | two columns at container max | desktop tier | as 992 | desktop | container width is **B-02, unratified** — current `lc-container` is 1152 px, the Home preview uses 1280 px |
| **1440** | centred, no stretch | desktop tier | as 992 | desktop | no unbounded line length; rail stays 300 px |

## C.3 Result readability and number balls

- Numbers are **server-rendered text**, never image-only (DS-13).
- Ball count derives from data (DS-13); groups wrap at every width — 1 ball (Cash Pop) through 21
  (Quick Draw 10/80 + special) through 10 (Keno, Pick 10).
- **Game-defined ordering is preserved** — never re-sorted for visual balance (DS-12).
- **Tabular numerals** on every drawn number, jackpot, date, time, countdown, odds and numeric table
  column (DS-10).
- **Every special ball carries three simultaneous signals** (DS-11): a visible label or abbreviation; a
  distinct border, shape or pattern; and an accessible name. Colour alone is measurably insufficient —
  the recorded luminance separation between special-ball tokens is 1.09–1.30:1.
- **Awaiting** shows "Awaiting result" **plus the exact next-draw date** in a height-reserved
  placeholder (DS-14). **Corrected** shows "Corrected" plus what changed, when, and the impact.
- Card faces need a compliant boundary — the measured card-face-to-surface contrast is **1.00:1**.

## C.4 Large state and game navigation

The state directory (S-18) and the change-state control must be keyboard-operable, fully labelled, and
**not** a disabled single-option select. They must include territories and no-lottery jurisdictions.
The section menu is compact on mobile and **must not be a permanently sticky row** consuming
excessive vertical space (PF-02 §10, §48).

## C.5 Tables and overflow

Every wide table — draw schedule, claim thresholds, tax tables, odds matrices, winner locations,
jackpot tracker — scrolls **inside its own `overflow-x` container**. The page body must never scroll
horizontally at any mandated width. A `.lcp-scroll-x` utility already exists but is scoped to the
Home-preview layer; the State page's `DataTable`, `DrawScheduleTable` and `HowToClaim` have **no**
overflow container today.

Tables also require a `<caption>` (or an equivalent accessible name) and `scope` on header cells —
neither is present today. The legacy pattern of rendering two DOM copies (mobile cards + desktop
table) must **not** be reproduced; one accessible table that reflows is required.

## C.6 Sticky layers

Priority, absolute (Global Shell §6.4, DS-28):

1. Safety / system controls
2. Bottom navigation
3. User-requested action (save / buy)
4. Advertising

If bottom navigation is visible, the sticky ad sits **above it with safe spacing, or is suppressed**.
Three sticky layers must never compete. **Page clearance is derived** from reserved sticky height +
bottom-nav height + spacing + `env(safe-area-inset-bottom)` — replacing the hardcoded `pb-28` in
`StatePageTemplate.tsx:67`. A focus indicator must **never** be obscured by a sticky layer (DS-15);
the legacy `#stickyAd` sits at `z-index: 9999` with no focus management.

## C.7 Ad reservation

Reserved geometry comes from each slot's own recorded size mapping — desktop tier from `[992,0]`,
mobile tier from `[0,0]` — so switching tiers causes **zero layout shift**. `collapseIfEmpty` stays
`false` for fixed placements, which is why the no-fill appearance is a deliberate design decision
(DS-24: collapse the inner creative area, retain the outer placement geometry, suppress the label).
Three behaviours currently disagree — legacy `collapseEmptyDivs()`, recorded
`collapseIfEmpty: false`, and DS-24. That is `OPEN-ST-04`, registered as source Conflict 15; DS-36
gives ad operations the final word. **The preview uses the DS-24 treatment.**

---

# PART D — ACCESSIBILITY SPECIFICATION

Target: **WCAG 2.2 AA as a floor** (DS-18, PF-02 §73, Global Shell §143).

> **These are requirements, not decisions.** `FD-S-13` makes fourteen of them binding implementation
> requirements — visible focus · reduced motion · forced-colour support · skip link · table captions
> or equivalent accessible names · header scope · contained horizontal table overflow · accessible
> live status · logical headings · text and accessible names for special balls · non-colour
> distinction · 200 % zoom · 16 px minimum mobile body copy · sticky layers that do not obscure focus.
> They are **verified at the review gate, not debated**. The table below is therefore an
> implementation checklist and a current-status record.

| Area | Requirement | Current State-page status |
|---|---|---|
| Keyboard | Every control operable; state selector, search, AI and ticket-check fully keyboard-driven; no keyboard trap in the sticky layer or any dialog | **Partly blocked** — **14 disabled controls in 7 groups** on the State path. Resolved by the single rule `FD-S-08`: hide, or replace with clearly labelled informational text |
| Focus | `:focus-visible` at **≥3:1 against both the component and the adjacent background**, ≥2 px, never removed, never obscured by sticky layers (DS-15) | **Absent** — the rule exists only under `[data-lc-preview]` |
| Headings | Exactly one H1; logical descent; no level skips; result-card headings must not sit at the same level as their group heading | H1 correct; group `<h3>` and card `<h3>` are flat |
| Landmarks | `<main>`, `<nav>` with accessible names, `<aside>` for the ad rail, skip link to main content | `<main>` and named `<nav>`s present; **no skip link** |
| Screen reader | Draw date and game announced **before** values; every ball group has an accessible name; special balls carry accessible names; status changes announced via a live region | DOM order correct; **no accessible group name**; no live region |
| Reduced motion | `prefers-reduced-motion: reduce` disables non-essential animation while keeping state changes perceptible (DS-16) | **Absent** — scoped to the preview layer |
| Forced colors | `forced-colors: active` — borders carry meaning where shadows and fills are dropped; special-ball distinction survives | **Absent** — scoped to the preview layer |
| 200 % zoom | Content reflows without horizontal page scroll; no clipped content; no loss of function | Not verified. **Legacy actively blocks zoom** (`maximum-scale=1.0, user-scalable=0`) — the new page correctly does not, and must never reintroduce it |
| Contrast | All ten recorded failures corrected (DS-04): `--lc-muted` (3.91 / 4.37 / 4.39), Fireball ball (3.56), `--lc-border` (1.23), `--lc-info-border` (1.31), card-face boundary (1.00), surface-vs-canvas (1.07), AI Teal (2.97), Success Green (4.36), Jackpot Gold as text (1.85) | **Not applied** — the failing values are the ones the State page uses |
| Colour independence | Colour is never the only distinction for special balls, bonus balls, multipliers, secondary draws, awaiting or corrected states (DS-11, DS-14, DS-29) | **Partial** |
| Targets | 44 × 44 CSS px where practical | **S-05 unratified**; the WCAG 2.5.8 floor still binds |
| Text size | 16 px minimum mobile body (DS-09) | **Violated** — `text-[15px]` |
| Tables | Accessible name/caption; `scope` on headers; no breakpoint-duplicated DOM | **Absent** |
| Accordions | Native `<details>`/`<summary>` or full ARIA disclosure with keyboard support | `FaqAccordion` uses native `<details>` — good |
| Ads | Clearly labelled; `aria-label="Advertisement"`; never announced as content | Satisfied |
| Attribution | Seven visibly distinct treatments — official source, editorial, AI, community, commercial, correction, responsible play — each with a **text or iconographic** signal, never colour alone (DS-29). No icon library is approved (DS-32), so **text must suffice** | **Absent** on the State page |
| Virtual keyboard | Must not hide the ticket-check or AI input and action | Untested; blocked by the disabled controls |

**Design-system decisions the State page currently violates, consolidated:** DS-02, DS-03, DS-04,
DS-09, DS-10, DS-11 (partial), DS-14 (partial), DS-15, DS-16, DS-17, DS-20, DS-29, plus the DS-30
risk of an unapproved dark-theme block. The root cause is single and structural: **the entire
design-system CSS layer is scoped to `[data-lc-preview]`**, so the State page inherits none of it.
Merging the token layers (audit reuse row 36) fixes twelve findings at once and is therefore the
highest-leverage item in the implementation plan.

---

# PART E — STATE AI PLACEMENT SPECIFICATION

**This part specifies placement only. It implements nothing.**

## E.1 Principles

- AI is **contextual, clearly labelled and supportive** (Constitution). A single floating chat button
  is not an AI strategy.
- Global Shell §10.5: a single page-level AI module does **not** satisfy AI compliance. Each section
  declares its intelligence layer (PF-02 §53 Section Intelligence Matrix).
- Anonymous visitors receive **one complete answer** with its source basis, one best next action and
  up to two additional paths, **before** any sign-in ask (Global Shell §10.2).
- AI must **never be the only unique state content** (PF-02 §64B). Governed facts, current data and
  maintained editorial/community objects must remain visible.
- AI must be **grounded in the State Content Manifest and governed current objects**, with source and
  effective-date context available for rules and commercial eligibility (PF-02 §69).
- **Do not insert AI mechanically into every section** (`FD-S-16`). PF-02 §53 assigns "none" to S-18.

## E.2 Launch scope — 5 placements (`FD-S-16`)

**Ruled:** the first State implementation includes exactly these five. *"Do not create 18 separate AI
widgets or force an AI element into every visible section."*

| # | Section | AI entry | Grounded in | Prohibited |
|---:|---|---|---|---|
| 1 | **S-03** AI Brief | The state's primary AI surface — *what changed*; one complete anonymous answer | results, jackpots, schedule, rules, claims, purchase availability, news, community | Must not be the page's only unique state content (PF-02 §64B) |
| 2 | **S-01** Identity | **Ask State AI** entry + one suggested question derived from the draw calendar, the most recent material change and current result status | manifest + current results | Must not answer in the header itself |
| 3 | **S-02** Results | Result explanation **when grounded** — one section-level insight; card-level only for a materially useful fact | verified results, format definitions, history | No repetitive generated text; must not restate the numbers; must not imply history changes future odds |
| 4 | **S-04 / S-06** | Game-rule and schedule explanation | game registry, schedule ops, published odds | Must never invent a live state; must not recommend a game |
| 5 | **S-08** Player Help | Claim-step explanation **only from official sourced information** | claims, with source + effective date | Must not give tax advice; must not state a claim outcome; must not appear where an affiliate CTA would |

Placement 5 is additionally gated by `FD-S-02`: **no claim-step explanation until the claim facts are
officially sourced.** If Florida's claim facts are not sourced in time, placement 5 does not ship.

### E.2.1 Deferred placements — 13

Each waits on the section or the governed data it would explain, not on a further founder decision:

| Section | Deferred AI entry | Waits on |
|---|---|---|
| S-05 Check Ticket | Explain the match and prize **after** the deterministic comparison | governed formats for the state's games (`FD-S-10`) |
| S-07 Where to Play | Eligibility explanation | the eligibility model and provider inventory (`OPEN-ST-08`) |
| S-08A Essentials | Explain a fact on request | the State Content Manifest (`FD-S-03`) |
| S-09 Worth Knowing | Summarise the highlights | S-09 is suppressed until sourced (`FD-S-02`) |
| S-10 Tools / History | Explain a historical pattern; configure a tool | the tool routes |
| S-11 Scratchers | Compare or explain instant games | S-11 suppressed (`FD-S-02`) |
| S-12 Winners | Summarise a published story or deadline | S-12 suppressed (`FD-S-02`) |
| S-13 Impact | Explain the beneficiary programme and period | S-13 suppressed (`FD-S-02`) |
| S-14 Community | Research Note · thread summary · current-fact banner | real community activity |
| S-15 News | AI Quick Take · why it matters · historical context | real editorial content |
| S-16 Follow State | Explain the value of a follow | `OPEN-ST-07` |
| S-17 Trust | Policy explanation | — low value; deferred |
| S-18 All States | **None** — PF-02 §53 assigns "none" | n/a |

### E.2.2 Section Intelligence Matrix

PF-02 §53 and Global Shell §132 require a matrix entry per section. `FD-S-16` permits an entry of
**"none"**, **"deferred"** or **"shared entry"** where appropriate. Concretely: S-18 is `none`; the 12
deferred sections are `deferred` with the dependency named above; S-04 and S-06 share launch
placement 4 as a `shared entry`. Every section therefore has a matrix entry without inventing a
surface for a section that does not exist.

## E.3 Absolute prohibitions

AI must **not** determine: official winning numbers · corrections · **ticket-match results** ·
eligibility · claim outcome · tax advice · purchase availability · affiliate recommendation.

**`FD-S-17` adds the positive obligation:** ticket comparison and eligibility evaluation are performed
by **deterministic systems**. AI may explain their output; it may never produce it.

AI must be **clearly identified** whenever it posts in community, summarises opinion, generates
numbers, interprets a ticket image, personalises a recommendation, substantially transforms editorial
content, or answers a high-consequence question. **AI accounts that appear human are prohibited.**

Language must not assert certainty or prediction, imply that history or AI generation changes the odds
of a fair independent draw, use manipulative urgency, or say **"increase your chances"** — a phrase the
legacy state template still contains (audit §6.7) and which open Member/Insider decision 12 covers.

## E.4 Failure behaviour

When a grounding source is degraded, the AI entry must **say so and route to the governed source**, not
answer from a stale cache. AI summaries and the retrieval index are invalidated after **every material
source correction** plus a scheduled cache review (PF-02 §56).

## E.5 What exists today

One `AiToolsTeaser`: a heading, a paragraph and a **permanently disabled** button. Its copy discipline
is careful and non-predictive, and the fixture carries an explicit `guardrail` string — **both must
survive the rebuild**. Nothing else exists — and the one AI control that does exist is permanently
disabled, which `FD-S-08` resolves. The launch scope is ruled by `FD-S-16`; see E.2.

---

# PART F — COMMERCE AND AFFILIATE SPECIFICATION

## F.1 State-context precedence — binding

1. The State Page's canonical jurisdiction
2. Explicit user selection in the current session
3. Signed-in preferred or followed state
4. Device location, **only after explicit permission**
5. Manual ZIP / city / state entry
6. **Coarse IP — suggestion requiring confirmation only**

On a canonical Florida page, Florida remains the content context. A user may change state; **IP must
not silently replace it.** IP alone must **never** determine legal purchase eligibility, claim rules,
tax guidance or provider availability. Raw IP must **never** be written to a redirect, content or
analytics store.

## F.2 User confirmation

When state context is uncertain, the interface **asks**. When a provider requires physical-location
confirmation, that confirmation is requested explicitly and is recorded as
`physicalLocationConfirmed` — it is not inferred.

## F.3 Option hierarchy

1. Official state online service / app / subscription
2. Qualified licensed or authorised courier or affiliate
3. Retailer finder
4. Online unavailable
5. Unknown or unverified → **suppress**

## F.4 Required information per option (PF-02 §20)

option type · provider · eligible game · state and physical-location requirements · age · geolocation ·
cutoff · fees and material terms · **last verified** · **LotteryCorner compensation** · official or
retail alternative.

## F.5 Action-label contract — binding

See B.9 for the machine-checkable form. In words: **"Buy Tickets" or "Play Online" only after
confirmed state, game, provider, age, physical-location and freshness eligibility. Otherwise
"Where to Play". "Find a Retailer" for retail-only or location intent. Never expose "Buy Tickets"
solely from IP inference.**

**Ruled by `FD-S-18`: `Where to Play` is the default.** The current implementation labels the action
"Buy Tickets" unconditionally from a fixture field, with no eligibility check of any kind. That
behaviour is replaced — the label may not be derived from fixture configuration or from State-page
context alone.

## F.6 Disclosure

**Ruled by `FD-S-19`:** every compensated recommendation or affiliate option carries **conspicuous
adjacent disclosure before the user acts**. A generic footer or trust-page disclosure is
**insufficient** — which is exactly what the State page has today (the independence disclaimer sits in
the trust block, far below the CTAs). This restates and sharpens `CLAUDE.md` §13 and PF-02 §61.

An affiliate must **never** be presented as an official lottery. A result must **never** be confused
with an ad. Commission must **not** covertly drive a neutral recommendation.

## F.7 First-party resolver

All purchase CTAs route through a **first-party resolver route**. The page exposes a LotteryCorner
path; the resolver chooses the destination **at click time** and falls back safely when none exists. No
raw affiliate URL may appear in UI, metadata, schema, fixtures, sitemaps, logs or AI output.

**Route direction:** the approved pattern is **`/play/{game}`** (BP-04 index §4).
**Current reference:** `/buynow/{code}` — implemented as a 200 text/plain placeholder with
`X-Robots-Tag: noindex, nofollow`, guarded so that any non-`/buynow/` href renders nothing.
**Legacy:** `/buynow/*` → Struts `AffiliateAction` → 302, robots-disallowed in production.

**Deferred by `FD-S-20` and `FD-S-32`** to the URL and migration review (`OPEN-ST-05`); registered as
source Conflict 14. `CLAUDE.md` §10 requires the URL audit and founder approval before either is
switched, and neither direction may be adopted silently. Two consequential differences belong to that
decision: the new route returns **200 rather than 302**, and **no `robots.txt` exists**, so `/buynow/`
is currently crawlable where production disallows it. **`FD-S-34` makes `/buynow/` non-indexable
regardless of which route wins.**

## F.8 Suppression conditions

Suppress the CTA entirely when: inside a claim journey · inside claim, tax or anonymity content ·
inside a responsible-play context · in distress, loss or uncertainty-heavy states · when eligibility
data is stale · when the draw cutoff has passed · in a no-lottery jurisdiction · inside any protected
zone · when the provider is unknown or unverified.

**Nothing in this part activates commerce**, and `FD-S-20` **defers activation** for the initial State
preview. No eligibility rule is implemented, no provider is configured, no resolver behaviour is
changed, and the route conflict is not resolved. The preview may show a **non-transactional
`Where to Play` information entry only when its data is verified** — which, given `FD-S-02`, means
only where the provider information is genuinely sourced.

---

# PART G — PHASED IMPLEMENTATION PLAN

**Rescoped by `FD-S-36`.** The next implementation phase is a **guarded Florida anonymous preview
only**. It must not include signed-in or Insider State variants, production route migration, commerce
activation, live partner scripts, fabricated community activity, or complete 49-jurisdiction content
authoring.

The ten-phase plan LRG-SPEC-017 produced treated every gap as a gate on one linear path. It is
replaced by **five tracks** (`ST-DEC-001` §4), of which only Track 1 is authorised now.

## G.1 Track 1 — Guarded Florida anonymous preview *(authorised next)*

| Step | Work | Code changes allowed | Gate |
|---:|---|---|---|
| **1** | **Close `OPEN-ST-01`** — the anchor→slot distribution for all 24 defined State slots, with ad operations | none | **G1** — ad operations + founder. The one open decision blocking this track |
| **2** | **Extract the shared design-system layer** incrementally out of `[data-lc-preview]` (`FD-S-12`) | CSS/token extraction only; **the locked Home appearance must not change** — any Home visual delta is a defect | Home visual regression check |
| **3** | **State section manifest + resolver** (`FD-S-04`) — typed, State-specific, expressing the five Adaptive Priority triggers. Not a page-builder | new State composition modules behind the preview guard | Resolver demonstrably expresses all five triggers |
| **4** | **View-model types** (Part B) — closed status union (`FD-S-09`), provenance registry, `PurchaseAction`, `AdAnchor` | type definitions; no route or fixture change. `02-new-api` untouched | Expresses every PF-02 §71 state |
| **5** | **Florida State Content Manifest entries** (`FD-S-03`) — the governed facts S-08/S-08A need, or an explicit unavailable marking | manifest document + Florida values | No unsourced fact renders as fact |
| **6** | **Synthetic publication gate** (`FD-S-01`) — environment-level enforcement | the gate | **G2** — a synthetic fact reaching a public page fails the build/run |
| **7** | **Florida format coverage** (`FD-S-10`) — every game the Florida preview displays has a governed format | format definitions, sourced not invented | No displayed Florida game is ungoverned |
| **8** | **Build the preview** — approved section order, ad anchors with one filled and one no-fill representative, the 5 launch AI placements (`FD-S-16`), `Where to Play` default (`FD-S-18`) with adjacent disclosure (`FD-S-19`), notice/correction surface (`FD-S-07`), disabled controls resolved (`FD-S-08`), 992 px threshold (`FD-S-24`), derived sticky clearance (`FD-S-29`) | a new State template behind a preview guard, following the Home preview precedent. **Existing `/{state}` routes keep rendering the current template.** Partner scripts stay disabled (DS-22, DS-25) | Ad-baseline guard passes (`FD-S-22`) |
| **9** | **Founder desktop and mobile review** | fixes arising | **G3 — DS-37**, plus `OPEN-ST-06` (special-ball tokens, the four DS-DEC-001 §8 items) |

**Suppressed in this track, with recorded reasons** (`FD-S-02`): S-11 Scratchers, S-12 Winners and
Unclaimed Prizes, S-13 Impact, S-09 Worth Knowing, and any claim/tax/anonymity fact that cannot be
officially sourced. **Present as genuine cold-start hubs:** S-14 and S-15.

**Explicitly not blockers for this track:** the 101 undefined non-Florida formats · the 33
jurisdictions without fixtures · the 5 no-lottery jurisdictions · canonical host and trailing slash ·
sitemap and robots · the commerce route conflict · every signed-in section · automated tests ·
complete 49-jurisdiction content.

## G.2 Track 2 — Cross-State rollout

| Step | Work | Gate |
|---:|---|---|
| 1 | **Route registry** (`FD-S-30`) — five jurisdiction classes; replaces `readdirSync`; **no `/usx`** | Registry enumerates correctly and is statically enumerable for SSG |
| 2 | **ST-06 experience** (`FD-S-31`) for `/al /ak /hi /ut /nv` | Renders without implying an active lottery; no result, claim, tax or commerce module |
| 3 | **Per-state format verification** (`FD-S-10`) | **No game is enabled whose format is unverified** |
| 4 | **Content ownership and cadence** (`OPEN-ST-08`) per governed fact group | Owner and cadence recorded in the manifest |
| 5 | **Automated tests** (`FD-S-35`) — route-registry enumeration · game-local date handling · result-format rendering · synthetic publication gate · section-order/adaptive-priority resolver · State ad baseline · protected-zone ad constraints | **G4.** Framework choice is an engineering decision. Scoped to this implementation — not a test-platform project |
| 6 | Close `OPEN-ST-02`, `OPEN-ST-03`, `OPEN-ST-04` with ad operations | Ad-operations sign-off |

**No `if (stateCode === …)` branch may be introduced.** The current template has none; that property
must survive.

## G.3 Track 3 — Production route cutover

Blocked in full by `OPEN-ST-05` (`FD-S-32`). Work: canonical host · trailing slash · date-route form ·
`/fl-new` · the Apache/Cloudflare redirect audit · `app/sitemap.ts` with accurate `lastmod` ·
`app/robots.ts` including the `/buynow/` disallow · `app/not-found.tsx` · the schema projection
(`FD-S-34`, `R-13`) · fragment alias evidence (`FD-S-33`).

**Gate G5 — founder + SEO + infrastructure.** Any route change requires the full `CLAUDE.md` §10
documentation set: old route, new route, evidence, canonical impact, sitemap impact, internal-link
impact, 1:1 redirect plan. The redirect audit must complete **before any Next.js redirect is added**.
`CLAUDE.md` §10: *"MUST NEVER redirect unrelated URLs to Home."*

## G.4 Track 4 — Signed-in / Insider State

Blocked entirely by the 11 open Member/Insider decisions (`source-conflicts.md` Conflict 3 →
`OPEN-ST-07`). Two constraints must be **designed for now rather than retrofitted**: **claim outranks
play** in the personal next-action ranking (PF-02 §35), and **exact outcomes only** in personal
matches — no near-miss celebration, no immediate play pressure (PF-02 §37).

## G.5 Track 5 — Commerce activation

Blocked by the eligibility model and provider inventory (`OPEN-ST-08`), the route decision
(`OPEN-ST-05`), adjacent-disclosure implementation (`FD-S-19`), and **the consent layer, which does not
exist and is a precondition for any partner script** (DS-25).

## G.6 Dependency summary

```
OPEN-ST-01 (ad ops) ──────────────┐
FD-S-12 shared DS layer ──────────┤
FD-S-04 manifest + resolver ──────┼──► TRACK 1  Guarded Florida anonymous preview
FD-S-03 Florida manifest ─────────┤        │
FD-S-01 synthetic gate ───────────┤        │
FD-S-10 Florida formats ──────────┘        ▼
                                     G3 / DS-37 founder review
                                           │
        FD-S-30 registry ─┐                ▼
        FD-S-31 ST-06 ────┼────────► TRACK 2  Cross-State rollout
        FD-S-35 tests ────┤          (+ OPEN-ST-02/03/04, OPEN-ST-08)
        OPEN-ST-06 ───────┘                │
                                           ▼
        OPEN-ST-05 ───────────────► TRACK 3  Production route cutover

        OPEN-ST-07 ───────────────► TRACK 4  Signed-in / Insider   (independent)
        consent layer ────────────► TRACK 5  Commerce activation   (independent)
```

**Critical path to the next deliverable:** `OPEN-ST-01` — ad operations on the anchor→slot
distribution. Everything else in Track 1 is execution against a settled ruling.
