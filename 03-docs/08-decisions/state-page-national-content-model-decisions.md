# State Page — National Content-Model Decisions

**Task:** LRG-DEC-027, corrected by **LRG-DEC-028**
**Version:** 1.1
**Status:** DECIDED — binding founder rulings
**Date:** 2026-07-29 (v1.0) · corrected 2026-07-29 (v1.1)

> **v1.1 CORRECTION — LRG-DEC-028.** `FD-N-03`, `FD-N-10` and `FD-N-11` are **superseded and replaced**.
> **`Buy Now` is the primary State-page commerce CTA**, entering a LotteryCorner first-party purchase-options
> resolver; `Where to Play` / `Find a Retailer` are resolver **outcomes or supporting links**, not the primary
> CTA. The three-category contextual-AI cap is **removed** — eight categories are approved and selectivity,
> not a ceiling, is the rule. All eligibility, ordering, disclosure and protected-context safety provisions are
> retained. The IDs are preserved; the previous wording is quoted inline as superseded.
**Companions:** `03-docs/04-page-specifications/state/state-page-national-research-acceptance-and-gaps.md` ·
`03-docs/04-page-specifications/state/state-page-final-content-information-architecture-and-schema.md`

---

## 1. Scope and authority

Twelve founder rulings — `FD-N-01` … `FD-N-12` — converting the founder-supplied national research report
into binding direction for the next Florida revision and the State family generally.

**Authority position.** Tier 5, alongside `state-page-founder-decisions.md` (`FD-S-*`, `APP-ST-*`) and
`state-page-cross-state-experience-decisions.md` (`FD-X-*`). Subordinate to explicit founder instruction, the
frozen Product Constitution v2.1, the final-approved Experience Architecture v1.1, Global Shell v1.1 and
PF-02 v1.1.

**What this record does not do.**

- **PF-02 order is unchanged.** No section is added, removed or resequenced. Nothing here is an Adaptive
  Priority trigger change; the PF-02 §12.1 set remains exactly five (`FD-X-07` rejected a sixth).
- **No `FD-S-*`, `APP-ST-*`, `FD-X-*` or `DS-*` ruling is amended.** Where this record is more specific, it
  *constrains within* the existing ruling rather than replacing it.
- **The research report is evidence, not authority.** It is not an approved blueprint, a final content
  specification, or an operational State capability registry. Its accepted findings are recorded in the
  companion acceptance document with corrections applied.

**Source of the twelve decisions.** The report closes by requesting twelve founder decisions (hub density ·
national-jackpot placement · sticky action · membership timing · community launch · scratcher threshold ·
second-chance threshold · winner/unclaimed scope · dataset scope · commerce scope · AI surface · Florida
review scope). `FD-N-01` … `FD-N-12` answer exactly those twelve.

---

## 2. The rulings

### FD-N-01 — Hub density

**DECIDED.** Do not use one universal raw card limit.

For the first mobile result experience:

- **one** primary current result group;
- **compact** Powerball / Mega Millions treatment when available in the jurisdiction;
- **up to four** State-native game-family groups before progressive disclosure;
- related daily variants **grouped under one game identity**;
- remaining results reached through **View all results**, game pages, or schedule/archive destinations.

Desktop may expose additional groups where density remains readable, but **must not present every event as
an equal-weight card wall.**

**Implementation consequence.** This supersedes the *effective* density of Prototype V0, which renders all
**10** Florida game families inline on one page. V1 shows the primary group + the compact multi-state
treatment + **at most 4** native family groups, then routes. The report proposed a fixed 5–7 group cap; this
ruling deliberately does **not** adopt a single universal number — it caps the *first mobile experience* and
lets desktop breathe, because a 3-game jurisdiction and a 19-event jurisdiction cannot share one raw limit.
Grouping itself (`FD-X-06`) is unchanged and remains mandatory.

---

### FD-N-02 — Multi-state placement

**DECIDED.** When offered in the State, Powerball and Mega Millions appear **after the first verified
State-result group.**

Existing **possible-win, correction, pending/live and safety overrides remain higher priority.**

**Do not use jackpot size alone to move them ahead of the first State result.**

**Implementation consequence.** Confirms and tightens `FD-X-05`/`FD-X-07`. Prototype V0 already selects the
primary result by recency and never by jackpot, and already places the multi-state strip after it — that
behaviour is **KEEP**. What this ruling adds is that the rule is now explicit and unconditional: no jackpot
threshold, news threshold or editorial override may promote the multi-state pair above the first verified
State result. The five PF-02 overrides remain the only things that can.

---

### FD-N-03 — Buy Now placement

> **SUPERSEDED AND REPLACED by LRG-DEC-028.**
> **Previous wording (LRG-DEC-027), no longer binding:** *"No sticky commerce or ticket-purchase action in the
> initial State release. Use an inline Where to Play status and destination."* That wording treated the State
> experience as informational-only and adopted the research report's safety label as the product CTA. Founder
> direction is that **Buy Now is a major product and revenue journey**, not a deferred action.

**DECIDED.** The primary State-page commerce CTA is **`Buy Now`**.

The initial State experience **may use prominent inline `Buy Now` actions.**

**Do not use a sticky `Buy Now` action while the governed sticky advertisement is active** — sticky
advertising and sticky purchase actions must not compete (`FD-S-29`, Global Shell §6.4).

**Approved State-page `Buy Now` placements:**

1. the compact State task/action area, **after the first-result priority is satisfied**;
2. eligible Powerball and Mega Millions feature surfaces;
3. eligible State-native game surfaces;
4. **S-07 — as the complete purchase-options experience.**

**`Buy Now` must not appear:**

- before the first verified result on mobile;
- inside possible-win or correction notices;
- inside claim guidance;
- inside responsible-play content;
- as the dominant action after a confirmed losing result;
- when commerce promotion is paused or suppressed.

**Implementation consequence.** This reverses the phase-one posture from "informational only" to "commerce is
a first-class journey, governed". Three things do **not** change: the PF-02 protected zones (`FD-S-21`) still
forbid commerce inside result verification, claim, correction, AI-answer and responsible-play content; the
mobile results-first rule (`FD-X-03`) still puts the first verified result ahead of any commerce action; and
the sticky-priority order (`FD-S-29`) still forbids a sticky purchase action competing with the sticky
advertisement. What changes is that `Buy Now` is now the visible label and may appear prominently inline at
the four approved placements. The loss-sensitive exclusion is new and deliberate: after a confirmed losing
result, `Buy Now` must not be the dominant action.

---

### FD-N-04 — Anonymous launch

**DECIDED.** The first public State experience remains **anonymous**.

Allowed anonymous continuity: **local last-visit marker · deterministic what-changed summary · session State
selection.**

**Defer** account-based Follow, Save and Alerts until the Member implementation is approved.
**Do not render disabled account controls.**

**Implementation consequence.** Confirms `FD-X-09` and extends it with *session State selection*, which V0
does not yet have. `FD-S-08`'s no-disabled-control rule is restated because it is the most easily violated
rule in this area. V0's local last-visit marker and deterministic what-changed summary are **KEEP**. Follow
and Notify remain deferred — V0 correctly renders neither.

---

### FD-N-05 — Community launch

**DECIDED.** The State hub may show a **compact genuine cold-start community entry**.

**Do not create an indexed dedicated State community route until genuine questions or discussions exist.**

**Never fabricate users, discussions, counts or activity.**

**Implementation consequence.** Answers the report's community-launch question: the route is **not** reserved
and indexed in advance; it comes into existence with real activity. V0's S-14 genuine cold start is **KEEP**
but must become **compact**. Combined with `APP-ST-04`/`APP-ST-05`, a cold-start community shell remains
ineligible to host advertising.

---

### FD-N-06 — Scratcher threshold

**DECIDED.** A dedicated State scratcher hub requires **all** of:

1. an official sustainable catalogue or feed;
2. stable ticket identifiers;
3. current price and prize data where displayed;
4. launch/end or expiry handling where applicable;
5. a **named update owner**;
6. a **verification cadence**;
7. **stale-data suppression**.

Without this: show only a **compact official outbound summary**, or suppress the module.

**Implementation consequence.** Florida meets none of the seven today, so S-11 stays suppressed and the most
V1 may add is a compact outbound line to the operator's own scratcher pages. Requirements 5–7 are
organisational, not technical — a scratcher hub cannot be unblocked by engineering alone. This links to the
open `OPEN-ST-08` content-ownership decision.

---

### FD-N-07 — Second-chance threshold

**DECIDED.** A dedicated second-chance page requires **all** of: current official promotions · entry and end
dates · eligibility and submission rules · official destination · named update owner · freshness monitoring ·
**automatic suppression after expiry**. Otherwise **suppress**.

**Implementation consequence.** Automatic post-expiry suppression is the distinguishing requirement: an
expired promotion is worse than an absent one, because it invites a user to enter something they cannot.
Florida has no verified second-chance data, so the module is suppressed in V1. Note that second chance is
often **account-bound** (New York's Lottery+ points programme is the reviewed example), which additionally
entangles it with the deferred Member decisions.

---

### FD-N-08 — Winner and unclaimed-prize scope

**DECIDED.** **Do not launch winner-location or unclaimed-prize page families in phase one.** They require a
reliable State-by-State official/news sourcing and correction workflow.

**The State hub must not publish synthetic winner or unclaimed-prize content.**

**Implementation consequence.** S-12 stays suppressed. This closes off the single most tempting content
expansion — the proposed design PDFs are full of winner narratives and unclaimed-prize lists, and the Florida
PDF renders literal unfilled placeholders (`[X days]`, `[date]`). V0 correctly suppresses all of it and must
continue to.

---

### FD-N-09 — Dataset scope

**DECIDED.** **Do not implement `Dataset`, `DataFeed` or `DataDownload` markup until LotteryCorner exposes a
real accessible file or feed with an owned update process.** **No placeholder dataset pages.**

**Implementation consequence.** Removes the entire dataset row from the phase-one schema matrix. Marking up a
dataset that does not exist is a misrepresentation, not an optimisation. The report's own matrix already
gates these types; this ruling makes the gate binding.

---

### FD-N-10 — Buy Now resolver

> **SUPERSEDED AND REPLACED by LRG-DEC-028.**
> **Previous wording (LRG-DEC-027), no longer binding:** *"Initial State pages remain informational… Default
> action remains `Where to Play`… Do not activate transactions or affiliate routing in this phase."* The
> eligibility, disclosure and `underReview` provisions of that ruling are **retained** below; only the
> informational-only posture and the `Where to Play` default label are superseded.

**DECIDED.** **`Buy Now` is an entry into a LotteryCorner first-party purchase-options resolver.**

**`Buy Now` does not by itself claim any of the following, and must never be presented as if it did:**

- that **LotteryCorner sells the ticket**;
- that online purchase is available;
- that the user is eligible;
- that one provider is recommended.

**The resolver must evaluate or request** whatever is needed to determine: State · game · relevant location ·
age confirmation where required · draw/cutoff freshness · official online availability · official app
purchase · subscription availability · approved courier availability · approved affiliate availability ·
retailer-only or unavailable outcome · unknown or `underReview` state.

**Option ordering — fixed:**

1. **verified official State option**;
2. other **verified official** options, such as subscription or app purchase;
3. **approved courier or affiliate** options, **clearly separated** from official options;
4. verified **retailer** option;
5. **unavailable, unknown or `underReview`** explanation.

**Every compensated option requires conspicuous adjacent disclosure before action.**

**`Where to Play` and `Find a Retailer` may appear as a resolver outcome or a supporting link. They are not
the primary State-page CTA.**

**The production resolver route remains OPEN** — `/play/{game}` versus `/buynow/{code}`. **This ruling does not
resolve that conflict** (`FD-S-32`, `OPEN-ST-05`, source Conflict 14).

**Implementation consequence.** `Buy Now` becomes a governed *entry point*, not a claim. The eligibility
ladder from the superseded `FD-X-11` is retained in full and now sits **behind** the CTA rather than in front
of it: the user sees `Buy Now`, and the resolver — not the label — decides what is actually offered. Two
provisions carry forward unchanged:

- **Florida remains `underReview`.** The research report classifies Florida as *"retail-first + retailer/app"*
  on retail play, QuickTicket and digital playslips — which is **not** a positively verified `retailOnly`.
  Contrast **Texas**, positively verified retail-only on explicit official evidence of no internet, mail or
  phone sales. **`retailOnly` remains reserved for the Texas-grade case.** Florida's resolver outcome is an
  `underReview` explanation plus the official retailer route.
- **Official first, compensated clearly separated, disclosure adjacent and before action.** Commission must
  never covertly drive ordering, and an affiliate must never be presented as an official lottery.

`Buy Now` may render at the four `FD-N-03` placements. It may not render in any protected or loss-sensitive
context. No raw affiliate URL may ever be exposed in UI, metadata, schema, fixtures, sitemaps, logs or AI
output.

---

### FD-N-11 — Contextual State AI

> **SUPERSEDED AND REPLACED by LRG-DEC-028.**
> **Previous wording (LRG-DEC-027), no longer binding:** *"For the State hub, at most these **three**
> contextual categories."* That cap was too restrictive relative to the AI-everywhere principle (Global Shell
> §10.5). The *selectivity* intent is retained; the fixed ceiling is removed.

**DECIDED.** Use **one persistent Ask State AI entry**, **one shared answer surface**, and **contextual AI
entry points wherever a section has a meaningful explanatory need.**

**Do not enforce a fixed maximum of three contextual categories.**

**Approved contextual categories include:**

1. current result, pending status and correction;
2. game rules, formats, multipliers and add-ons;
3. schedule, cutoff and user-timezone explanation;
4. claim/help explanation grounded in official sources;
5. **`Buy Now` and purchase-option explanation**;
6. history/archive interpretation;
7. sourced State news summary;
8. community-question assistance where genuine community exists.

**AI entry points must be selective. Do not render:**

- one `Explain` button on **every** result card;
- a separate chatbot in every section;
- repeated identical prompts;
- an AI element where static or deterministic content is clearer.

**Every PF-02 section must still declare its intelligence layer:** `static` · `deterministic` · `AI` ·
`AI plus deterministic handoff` · `community` · `none` (Global Shell §10.5).

**AI may not:** determine official results · declare whether a ticket won · predict numbers · recommend a
game · determine purchase eligibility · recommend an affiliate provider · provide tax advice · determine a
claim outcome.

**Implementation consequence.** The Prototype V0 problem was **mechanical repetition** — 20 `Explain` actions,
two on each of ten family cards — not the *number of categories*. The corrected rule targets the actual
defect: entries are placed where a section genuinely needs explanation, not multiplied across repeating
cards. Eight categories are approved, including a new one for `Buy Now` and purchase-option explanation,
which pairs with the resolver in `FD-N-10`. The **one shared answer surface** (`FD-X-08`) is unchanged and
remains the mechanism that keeps this from becoming per-section chatbots. AI remains disconnected in the
preview unless separately approved, and the `FD-S-17` rule that ticket comparison is deterministic and never
AI is unchanged.

---

### FD-N-12 — Florida review scope

**DECIDED.** Florida Prototype V1 should be a **tighter, better-routed State hub**. It may go to founder
review with conditional modules suppressed.

**Required before production route cutover, at minimum:**

1. verified result coverage;
2. result/source freshness;
3. compact verified schedule summary;
4. compact Where-to-Play state;
5. official claim/help routing;
6. meaningful history/archive destinations;
7. concise sources/methodology/responsible-play surface;
8. correct State-native and multi-state grouping.

**Explicitly not needed:** winners · unclaimed prizes · full scratcher catalogue · second chance · tax-guide
content on the hub · active community · member features · live AI · live commerce.

**Implementation consequence.** V1 is a *reduction and routing* exercise, not a feature expansion. Note item
3: the schedule becomes a **compact summary on the hub with the full table on a dedicated page** — V0 renders
a 10-row table inline, which must move. Note also that **tax-guide content is explicitly excluded from the
hub**, confirming `FD-X-02`. `DS-37` is **not** closed by this ruling.

---

## 3. Ruling-to-consequence index

| Ruling | Decides | Prototype V0 impact |
|---|---|---|
| `FD-N-01` | Hub density | REDUCE — 10 inline families → primary + compact multi-state + ≤4 native |
| `FD-N-02` | Multi-state placement | KEEP — already after the first verified result, never jackpot-sorted |
| `FD-N-03` | **`Buy Now` placement** | **NEW WORK — prominent inline `Buy Now` at 4 approved placements; no sticky `Buy Now` while the sticky ad is active** |
| `FD-N-04` | Anonymous launch | KEEP + add session State selection |
| `FD-N-05` | Community launch | KEEP, made compact; no indexed route yet |
| `FD-N-06` | Scratcher threshold | S-11 stays suppressed |
| `FD-N-07` | Second-chance threshold | Stays suppressed |
| `FD-N-08` | Winner/unclaimed scope | S-12 stays suppressed |
| `FD-N-09` | Dataset scope | No dataset markup, no dataset page |
| `FD-N-10` | **`Buy Now` resolver** | **NEW WORK — first-party resolver, fixed option ordering, adjacent disclosure. Florida still `underReview`; route conflict still open** |
| `FD-N-11` | **Contextual AI** | **REDUCE repetition, not categories — kill the 20-button pattern; 8 categories approved; one shared surface** |
| `FD-N-12` | Florida V1 scope | Tighter, better-routed; schedule moves to a dedicated page |

---

## 4. Relationship to existing rulings

**Confirmed without change:** `FD-S-01`/`FD-S-02` (nothing unsourced publishes) · `FD-S-08` (no disabled
controls) · `FD-S-09` closed status union · `FD-S-10` format-driven rendering · `FD-S-14` three-signal special
balls · `FD-S-17` deterministic ticket comparison · `FD-S-21`…`FD-S-29` advertising · `FD-S-30` route registry ·
`FD-X-01` one page family · `FD-X-02` hub summarises and routes · `FD-X-03` mobile results-first ·
`FD-X-04` AD-S00 desktop-only · `FD-X-05` multi-state treatment · `FD-X-06` grouping and neutral ordering ·
`FD-X-07` jackpotSurge rejected · `FD-X-08` one shared AI surface · `FD-X-10` statistics subordinate ·
`FD-X-12` target sizes · `FD-X-14` validation sequence.

**Constrained further by this record:**

| Existing ruling | Constrained how |
|---|---|
| `FD-X-08` | Contextual AI entries placed **selectively wherever a section has a meaningful explanatory need**; **no category cap** (`FD-N-11` v1.1). The one-shared-surface rule is unchanged |
| `FD-X-09` | **Session State selection** added to allowed anonymous continuity (`FD-N-04`) |
| `FD-X-11` | **SUPERSEDED IN PART** by `FD-N-10` v1.1. The eligibility ladder, `unknown`/`underReview` resolution and the reservation of `retailOnly` for Texas-grade positive proof are **retained**. What changes: the ladder now sits **behind** a `Buy Now` entry rather than determining a `Where to Play` default label. **App purchase** and **courier** are distinct verified states |
| `FD-X-02` | Schedule, claims, taxes, game discovery, archives explicitly become **compact summary + dedicated page** (`FD-N-12`) |
| `FD-X-13` | Superseded in scope by `FD-N-12`, which is the operative Florida gate. `FD-X-13`'s seven expansions were satisfied by LRG-STATE-025; `FD-N-12` sets the *next* gate |

**Still open, unchanged:** `OPEN-SX-01`…`OPEN-SX-06` (the six visual decisions, incl. `DS-37`) ·
`OPEN-ST-02`…`OPEN-ST-08`. `OPEN-SX-05` (sticky-ad close control) is informed by `FD-N-03` only in that
`FD-N-03` concerns commerce, not advertising — the close-control question remains open.

---

## 5. Revision history

| Task | Date | Change |
|---|---|---|
| **LRG-DEC-028** | July 29, 2026 | **v1.1 correction.** `FD-N-03`, `FD-N-10` and `FD-N-11` **superseded and replaced**, IDs preserved and previous wording quoted inline. **`Buy Now` becomes the primary State-page commerce CTA**, entering a LotteryCorner **first-party purchase-options resolver** with fixed option ordering (official → other official → courier/affiliate clearly separated → retailer → unavailable/unknown/underReview) and **conspicuous adjacent disclosure before action** on every compensated option. `Where to Play` / `Find a Retailer` are demoted to resolver outcomes or supporting links. The **three-category contextual-AI cap is removed**; eight categories are approved and the rule becomes selectivity rather than a ceiling. Retained unchanged: PF-02 order and protected zones · mobile results-first · sticky-priority (no sticky `Buy Now` while the sticky ad is active) · Florida `underReview`, never `retailOnly` · one shared AI answer surface · every AI prohibition · the open `/play/{game}` vs `/buynow/{code}` route conflict. `FD-S-18`, `FD-S-20` and `FD-X-11` are superseded in part — see §4. |
| **LRG-DEC-027** | July 29, 2026 | Record created. `FD-N-01` … `FD-N-12` recorded, answering the twelve founder decisions the national research report requested. Largest consequences: hub density capped for the first mobile experience (`FD-N-01`); contextual AI entries reduced from 20 to at most 3 categories (`FD-N-11`); Florida confirmed **`underReview`**, never `retailOnly` (`FD-N-10`); winners, unclaimed prizes, scratchers, second chance and datasets gated out of phase one (`FD-N-06`…`FD-N-09`). **PF-02 order unchanged; the five-trigger Adaptive Priority set unchanged; no `FD-S-*`, `APP-ST-*`, `FD-X-*` or `DS-*` ruling amended; `DS-37` not closed.** |
