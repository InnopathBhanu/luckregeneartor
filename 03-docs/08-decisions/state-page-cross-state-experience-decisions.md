# State Page — Cross-State Experience Decisions

**Task:** LRG-DEC-024
**Version:** 1.0
**Status:** DECIDED — binding founder rulings
**Date:** 2026-07-28
**Supersedes:** the ten-question founder surface proposed by LRG-STATE-023
(`state-page-founder-experience-review.md` §5, decisions D-1 … D-10)

---

## 1. Scope and authority

### 1.1 What this record is

Fourteen founder rulings — `FD-X-01` … `FD-X-14` — converting the LRG-STATE-023 cross-State research into
binding direction. It settles product strategy, corrects two unsafe recommendations, rejects one proposed
blueprint addition, and reduces the open founder surface to **six visual decisions**.

### 1.2 Authority position

Tier 5 — an approved decision register, alongside `state-page-founder-decisions.md`. It is subordinate to:

1. explicit founder instruction in an active task;
2. the frozen Product Constitution v2.1;
3. the final-approved Experience Architecture v1.1;
4. the final-approved Global Shell v1.1 and PF-02 v1.1 State Page Blueprint.

**No ruling here modifies PF-02 section order, the PF-02 Adaptive Priority trigger set, any
`FD-S-01` … `FD-S-36` ruling, any `APP-ST-01` … `APP-ST-06` approval, or any `DS-*` design-system
decision** — except the one explicitly scoped advertising supersession recorded in `FD-X-04` and §4.1.

### 1.3 Relationship to the research

The four LRG-STATE-023 documents remain **tier 6 supporting research**. Where this record and that
research differ, **this record wins**, and the research documents have been corrected in place to match.
Their *evidence* stands; two of their *recommendations* did not survive review (§4.2, §4.3).

### 1.4 One State Page family — stated explicitly

> **There is one PF-02-governed State Page family. There are no per-State templates.**
>
> Florida is the first representative implementation, **not** the universal content template. Arizona,
> New York, California, Michigan, Virginia, Maryland, Utah and every other jurisdiction render through the
> same page family, the same section manifest and the same components. All State difference is **data**.

---

## 2. The rulings

### FD-X-01 — One State Page family

**APPROVED.**

One PF-02-governed State Page family with capability-driven State variation. Do not create separate
Arizona, Florida, New York, California or other State templates.

State difference derives only from: the jurisdiction registry · the State capability profile · the State
Content Manifest · game definitions · verified sources · conditional section states · commerce eligibility ·
editorial and community availability.

**Implementation consequence.** No component, style, route handler or fixture may branch on `stateCode`.
The capability profile becomes a typed contract (sequence step 7). The existing preview already satisfies
this — nothing in it branches on state code — and that property must be preserved by a build-time check
rather than by convention. Florida's manifest content is *an instance*, never a default inherited by other
jurisdictions.

---

### FD-X-02 — State hub purpose

**APPROVED.**

The State hub is a **current, repeat-use lottery dashboard**, not a multi-page encyclopedia.

**The hub owns:** latest verified results · current draw status · next draws · current jackpots · State game
discovery · concise Where-to-Play status · concise claim/help essentials · AI entry points · current State
news and community entry points · sources, freshness and correction status.

**Dedicated destinations own:** the complete claim guide · the detailed tax and anonymity guide · full game
rules and prize matrices · yearly archives · the complete scratcher catalogue · the second-chance guide ·
long winner histories · detailed methodology · deep statistics.

**The hub summarises and routes to depth.**

**Implementation consequence.** Florida's proposed-design content volume (roughly two of seven pages given
to claim walkthroughs, tax detail and evergreen guide prose) does **not** belong on the hub. Each hub
section carries a concise sourced summary plus one outbound link. This also removes the thin-content risk of
replicating identical guide prose across ~49 jurisdictions, and it settles the founder section analysis's
"Layer A" instruction that every State page must carry a full tax breakdown — it must not; see §4.4.

---

### FD-X-03 — Mobile results-first hierarchy

**APPROVED.**

Below 992 px, **the first verified result or urgent result status must appear before any advertising
reservation.**

Mobile priority sequence:

1. State identity, source and freshness
2. urgent correction, possible-win or draw status, where applicable
3. **first verified result**
4. compact Powerball / Mega Millions treatment, when offered in the jurisdiction
5. State-native priority games
6. compact task actions
7. State AI entry
8. verified Where-to-Play status

**Exact pixel heights in the research are design hypotheses, not fixed contracts.** Validate the hierarchy
visually at **320, 375 and 390 px**.

**Implementation consequence.** The current preview places `AD-S00` before the first result on mobile —
this is the ordering defect this ruling corrects, and its advertising half is ruled in `FD-X-04`. The
binding requirement is **priority and first-viewport usefulness**, not component heights. The research's
64/52/150/76/120/40 px figures are retained only as **reference budgets** and carry no approval.

---

### FD-X-04 — AD-S00 mobile treatment

**APPROVED DIRECTION.**

`AD-S00` remains in its governed PF-02 manifest position. However:

- `AD-S00` **may remain active at desktop viewports ≥ 992 px**;
- `AD-S00` **must not reserve or display advertising below 992 px during the State preview**;
- **no replacement mobile advertisement may be inserted before the first verified result**;
- mobile inventory may be reconsidered later with ad-operations input at an approved lower boundary.

This ruling **supersedes the Minimum Florida profile only for `AD-S00` below 992 px.**

Do not move `AD-S00` to a new anchor and do not silently replace its inventory.

**Implementation consequence.**

- `sp_top_billboard` stays mapped to `AD-S00` and stays in the approved profile. Its **mobile tier becomes
  a recorded inactive state**, not a removal, not a relocation, not a retirement.
- Desktop visible placements are unchanged. **Mobile visible placements reduce by one.** The approved
  profile count is unchanged, because a viewport-scoped inactive state is not an inventory reduction.
- This is the **explicit disposition** `FD-S-22` requires ("do not reduce or add inventory silently") — it is
  recorded here, in `state-ad-anchor-distribution-proposal.md` and in `state-ad-inventory-reconciliation.md`.
- **No conflict with `FD-S-24`.** `FD-S-24` forbids a 992–1023 px inventory gap; `AD-S00` remains active
  across that entire band. The inactive state applies only below 992 px.
- **No new mobile slot is introduced.** `AD-S01`'s mobile tier is unchanged and remains the first mobile
  advertisement, now correctly positioned after the first verified result.
- Ad operations continues to own delivery validation. **Ad operations does not own the product content
  hierarchy** — that is a founder decision, taken here.

---

### FD-X-05 — Powerball and Mega Millions treatment

**APPROVED.** When available in the jurisdiction:

**Mobile.** One **compact multi-state jackpot/results strip after the first verified result**. It may show
game identity · result status · jackpot · next draw · one concise action. **Do not place two full desktop
cards in the first mobile viewport.**

**Desktop.** A clear **featured pair** where data and availability justify it.

Powerball and Mega Millions **must not erase State-native games**. State-native game access must remain
visible **immediately after or alongside** the multi-state treatment. **If only one multi-state game is
available, do not leave an empty paired-card position.**

**Implementation consequence.** One reusable manifest-driven module serves both games and both viewports.
Featured status is conditional on availability *and* data sufficiency — a card with no sourced jackpot and
an `awaiting` result does not earn featured treatment, which is the situation Mega Millions is in today.
The research's proposal that a **State-native jackpot game may join the featured pair** is **not approved**
(§4.5); native prominence is delivered by `FD-X-06` ranking and by adjacency, not by entering the
multi-state featured band.

---

### FD-X-06 — State-native game priority

**APPROVED.** Rank State games by neutral, deterministic factors, in this order:

1. user-followed game, where a genuine local or account preference exists
2. result freshness or pending status
3. next-draw imminence
4. State relevance
5. draw frequency
6. verified editorial importance
7. **jackpot scale — low-weight interest signal only**

**Prohibited:** best game · easiest game · recommended game · best odds to play · most likely to win ·
AI-selected game · personalised gambling recommendation.

**Frequent-draw variants must be grouped**, not expanded into excessive top-page cards.

**Implementation consequence.** Ranking is a pure deterministic function; no model, no personalisation
beyond an explicit user selection. Florida Cash Pop's five daily draws and Maryland's four become **one
grouped card** — latest draw prominent, the day's remaining draws compact, next draw stated — never five or
four separate top-page cards. Midday/evening variants of distinct games remain **separate cards with
explicit period labels**, because merging them creates the ticket-checking hazard the Florida proposed
design contained. The proposed designs' *"Why players like it"* lines and the *"Odds & Strategy Guide"*
naming are prohibited by this ruling and by `FD-S-06`.

---

### FD-X-07 — Jackpot surge

**REJECTED AS AN ADAPTIVE PRIORITY OVERRIDE.**

**Do not add `jackpotSurge` as a sixth PF-02 Adaptive Priority trigger.** The PF-02 §12.1 trigger set
remains exactly five: `possibleWin(1)` · `correction(2)` · `liveDraw(3)` · `safety(4)` · `sourceOutage(5)`.

Large jackpot movement **may** produce: a visual badge · changed jackpot emphasis · a "what changed"
message · editorial or news eligibility · an anonymous last-visit difference.

It **must not reorder ahead of** possible-win surfaces · corrections · live or pending results · safety ·
source or purchase outages.

**Implementation consequence.** `jackpotSurge` is removed from the proposed override list, from the
Adaptive Priority recommendations and from the implementation sequence. It survives **only** as a
non-reordering visual and data state: a factual badge or delta line (`Jackpot rose $57M since the last
draw`) rendered **in place**, computed from **published** movement only, never from a modelled or predicted
figure. It changes no section order, displaces no band, and alters no ad-anchor relationship. The existing
five-trigger resolver requires **no change** — which is the point of the rejection.

---

### FD-X-08 — State AI model

**APPROVED.** Use: one persistent **Ask State AI** entry · contextual **Explain** actions · precomposed
prompts · **one shared answer surface** · deterministic tool handoffs.

**Initial State AI experiences — the five that ship first:**

1. Explain this result.
2. What changed since the previous draw?
3. Explain this game, multiplier or secondary draw.
4. When is the next draw in my timezone?
5. Explain verified claim steps from official sources.

**Later:** grounded State-news summary · neutral game comparison · verified Where-to-Play explanation.

**Do not create one chatbot per section.**

**AI may not:** determine official results · check whether a ticket won · predict numbers · recommend a
game · determine claim eligibility · provide tax advice · determine commerce eligibility · recommend an
affiliate provider.

**Implementation consequence.** All entries write into a **single** answer surface (S-03), so context
accumulates in one place and there is exactly one region to label, ground and make accessible. Ticket
comparison stays fully deterministic (`FD-S-17`) — experience 5 explains *claim steps*, never eligibility.
Experience 4 explains a timezone conversion that is itself computed deterministically. Experience 3 covers
multipliers and secondary draws (Power Play, Double Play), which the research had deferred. This changes the
launch subset the research proposed: **the S-10 history-interpretation entry moves out of the launch five**
into the later set, consistent with `FD-X-10` keeping statistics subordinate. Global Shell §10.5 compliance
still requires every section to record an intelligence decision, including "no intelligence layer adds
value" — the full Section Intelligence Matrix remains the design artefact.

---

### FD-X-09 — Initial engagement model

**APPROVED PHASED SCOPE.**

**Approved for the anonymous experience:** local-only last-visit timestamp · deterministic "what changed
since your last visit" summary · new verified-result count · correction count · jackpot-change summary ·
next-draw summary · real State news and community changes where available.

**Requirements:** no fabricated activity · no account assumption · no cross-device promise · no manipulative
streaks · no near-miss framing · no loss-chasing prompt · no prediction language.

**Deferred until genuine functionality exists:** Follow State · Follow Game · notification delivery · saved
games across devices · personalised account feeds.

**Do not render disabled Follow or Notify controls.**

**Implementation consequence.** The entire approved set is deterministic, local and anonymous — nothing
requires an account, so nothing is blocked by the eleven open Member/Insider decisions. The last-visit
value is **local only**, with no server profile and no cross-device claim, and the summary suppresses
itself entirely when nothing changed. This **corrects** the research, which recommended anonymous
follow/save at launch: **Follow State and Follow Game are deferred** (§4.6). Because `FD-S-08` and this
ruling both forbid a disabled control, S-16 remains an informational value statement with **zero**
interactive controls — which is what the preview already renders.

---

### FD-X-10 — Statistics and history

**APPROVED AS A SUBORDINATE S-10 CAPABILITY.**

**Retain** descriptive historical tools: past results · jackpot history · draw-frequency summaries ·
correction history · previous-versus-current jackpot change · result archives.

**Do not create a separate top-level prediction or "number strategy" section.**

**Do not prominently promote:** hot numbers · cold numbers · predictions · systems · wheels · lucky-number
recommendations.

Any statistical explanation **must clearly state that historical patterns do not alter draw odds.**

**Implementation consequence.** Statistics live inside S-10 as one capability among several, never as their
own section and never above the results. Deep statistics belong on game pages and dedicated destinations
(`FD-X-02`). The Minnesota content draft's "Statistics & Number Analysis" with "Statistical Tools" is
admissible only in this subordinate, descriptive, non-predictive form. Unsuppressing S-10 also restores the
one legitimately deferred rail placement (`sp_side_mpu_pos2`), because that slot's host section becomes a
real destination.

---

### FD-X-11 — Commerce status model

> **SUPERSEDED IN PART by `FD-N-03` / `FD-N-10` v1.1 (LRG-DEC-028).**
> **What changes:** `Where to Play` is **no longer the default visible action**. The primary State-page CTA is
> **`Buy Now`**, an entry into a LotteryCorner **first-party purchase-options resolver**. `Where to Play` and
> `Find a Retailer` survive as resolver **outcomes or supporting links**.
> **What is RETAINED IN FULL:** the resolution ladder below · absence of evidence resolving to
> `unknown`/`underReview`/`unavailable` and **never** to `retailOnly` · `retailOnly` requiring positive
> evidence · Florida remaining **`underReview`** · adjacent disclosure on every compensated option ·
> official-option-first ordering · suppression in protected and stale contexts.
> The ladder now sits **behind** the `Buy Now` entry rather than determining a button label.

**CORRECTED AND APPROVED.**

**Absence of verified online or retail evidence must resolve to `unknown`, `underReview` or `unavailable` —
never automatically to `retailOnly`.**

**`retailOnly` is a verified factual commerce state and requires evidence.**

~~The default visible action remains **`Where to Play`**.~~ **Superseded (LRG-DEC-028):** the default visible action is **`Buy Now`**; `Where to Play` is a resolver outcome or supporting link. The eligibility ladder below is unchanged and determines what the resolver actually offers.

A stronger action may appear **only from current verified eligibility**: `Play Online` · `Buy Tickets` ·
`Order Through Licensed Courier` · `Find a Retailer`.

**Every compensated option requires adjacent disclosure.**

**No commerce activation is approved in this task.**

**Implementation consequence.** This is a **safety correction** to the research, which stated that absence
of evidence "resolves to `retailOnly`" (§4.2). That was wrong in both directions: it would have published an
unverified factual claim about a jurisdiction's retail availability, and it would have let a missing data
feed masquerade as a verified finding.

The corrected resolution ladder is:

| Evidence state | Commerce state | Visible action |
|---|---|---|
| Verified official online sales, current | `officialOnline` | `Play Online` |
| Verified official subscription, current | `officialSubscription` | `Subscribe Through {Operator}` |
| Verified licensed courier, current | `licensedCourier` | `Order Through Licensed Courier` + adjacent disclosure |
| Verified approved affiliate, eligibility current | `approvedAffiliate` | `Buy Tickets` + adjacent disclosure |
| **Verified** retail-only availability | `retailOnly` | `Find a Retailer` |
| Evidence exists but is being checked | **`underReview`** | `Where to Play` — information only |
| Evidence older than its freshness window | `staleEligibility` | `Where to Play` — information only |
| No evidence, or State context unresolved | **`unknown`** | `Where to Play` + State confirmation ask; **no provider named** |
| Not an active lottery, or legally unavailable | `unavailable` | Section suppressed |

**Florida's own state is `underReview`, not `retailOnly`,** until its availability is confirmed from the
official operator. The practical effect on the preview is nil — both resolve to `Where to Play` with no
transactional CTA — but the recorded claim is now honest. Confirming it is part of `FD-X-13`'s official
source-path work.

Note that the existing view-model contract already types `optionType` as
`officialOnline | officialApp | subscription | affiliateCourier | retailOnly | unavailable | unknown`, so it
already admits `unknown` and needs **no** structural change — only the resolution rule was wrong.

---

### FD-X-12 — Special balls and target sizes

**The special-ball decision is already governed by `FD-S-14` and must not be reopened.**

Special groups require: visible text or abbreviation · non-colour distinction · an accessible name.

The **44×44** target requirement applies to **interactive controls**. Number balls that are
**non-interactive data visualisations** may be smaller, provided they remain readable · distinguishable ·
accessible · stable at 200% zoom · non-overlapping at 320 px.

**Implementation consequence.** This closes the target-size question the LRG-STATE-022 runtime review
raised. The 44 small targets it measured are text links inside running prose, which are interactive and
must meet the control rule where practical; result balls are **data**, not controls, and are correctly
exempt. The specific special-ball border, shape and pattern **tokens** remain deferred to `DS-37` /
`OPEN-ST-06` — unchanged by this ruling. The research's D-9 is therefore **not** a founder decision; it is
merged into `FD-S-14` plus this clarification.

---

### FD-X-13 — Florida approval status

**APPROVED DIRECTION.**

**Do not close `DS-37` and do not approve the Florida visual model yet.**

The current preview is architecturally useful · safety-correct · advertising-governed · **insufficiently
populated for visual approval.**

**Before visual refinement, expand:**

1. verified Florida draw-event coverage;
2. S-04 schedule and current draw data;
3. S-17 Sources, Methodology and Update Process;
4. meaningful S-10 history and tool destinations;
5. concise State-native game coverage;
6. official claim and help source paths;
7. realistic non-fabricated cold-start treatment.

**Do not repopulate synthetic winner, tax, claim-deadline or unclaimed-prize content.**

**Implementation consequence.** Visual approval against the current page would be an approval against 7 of
13 visible sections carrying no substantive content, and any later content would change density and
invalidate it. The seven expansions above are the `DS-37` entry gate. Item 1 is the largest: the preview
carries 7 verified Florida games against roughly 24 real draw events. Item 3 is the cheapest high-value
addition and is safety-neutral — the methodology block makes claims about *our own process*, not about
Florida. Item 7 confirms that the existing honest empty states in S-14 and S-15, and the
`Currently unavailable` surfaces, are **correct and must not be "fixed" with plausible copy.**

---

### FD-X-14 — Representative validation States

**APPROVED.** Variance-driven validation sequence:

| # | State | Validation purpose |
|---|---|---|
| 1 | **Florida** | Broad mainstream State and first implementation |
| 2 | **Michigan** | Official online play, Keno / frequent draw, inverted-commerce validation |
| 3 | **Virginia** | Broad State game portfolio, different commerce model |
| 4 | **California** | Retail-only **verification**, Pacific timezone, second-chance and scratcher variation |
| 5 | **Maryland** | High draw-event volume, frequent-draw grouping |
| 6 | **Utah** | No-active-lottery ST-06 suppression profile |

**Do not begin all six simultaneously.** Each State must pass the **content-manifest** and
**result-format** gates before preview activation.

**Implementation consequence.** Sequential, gated rollout. Michigan validates `FD-X-11` in the direction
that matters most — a State where a verified online path genuinely exists, and whose proposed design had
the commerce treatment exactly inverted. California validates the *negative* case, and note the ruling's
wording: California is where `retailOnly` gets **verified**, which is precisely the `FD-X-11` correction
applied in practice. Utah validates suppression. The gates mean no State reaches preview on fixture data
alone.

---

## 3. Ruling-to-consequence index

| Ruling | Decides | Primary artefacts affected |
|---|---|---|
| `FD-X-01` | One page family, capability-driven | capability profile contract; no `stateCode` branching |
| `FD-X-02` | Hub versus dedicated-page ownership | content-placement map; section summaries |
| `FD-X-03` | Mobile results-first order | mobile hierarchy; validation at 320/375/390 px |
| `FD-X-04` | `AD-S00` inactive below 992 px | both advertising documents; `FD-S-22` disposition |
| `FD-X-05` | Multi-state treatment, both viewports | multi-state module; featured-pair rules |
| `FD-X-06` | Native game ranking and grouping | deterministic ranking; frequent-draw grouping |
| `FD-X-07` | jackpotSurge rejected as an override | PF-02 trigger set unchanged; badge-only treatment |
| `FD-X-08` | AI architecture and launch five | shared answer surface; Section Intelligence Matrix |
| `FD-X-09` | Anonymous engagement scope | last-visit diff; Follow deferred |
| `FD-X-10` | Statistics subordinate to S-10 | S-10 capability; no top-level statistics section |
| `FD-X-11` | Commerce resolution ladder | commerce state model; Florida → `underReview` |
| `FD-X-12` | Target sizes; special balls not reopened | accessibility rules; `FD-S-14` upheld |
| `FD-X-13` | Florida content gate before `DS-37` | seven expansion prerequisites |
| `FD-X-14` | Rollout order and gates | six-State sequence |

---

## 4. Supersession relationships

### 4.1 Mobile `AD-S00` — supersedes the Minimum Florida profile, narrowly

| | Before (`APP-ST-01`, LRG-ADS-020) | After (`FD-X-04`) |
|---|---|---|
| `AD-S00` slot | `sp_top_billboard` | **unchanged** |
| `AD-S00` anchor position | PF-02 position 2, after S-01 | **unchanged** |
| Desktop ≥ 992 px | active, eager | **unchanged — active** |
| **Mobile < 992 px** | **active** | **INACTIVE during the State preview** |
| Approved profile count | 10 active / 14 deferred | **unchanged — this is a viewport-scoped state, not a reduction** |
| Replacement mobile slot | — | **none — explicitly forbidden before the first verified result** |
| Relocation | — | **none — the anchor does not move** |

**Scope of the supersession:** `AD-S00` below 992 px only, during the State preview. `APP-ST-01` … `APP-ST-06`
are otherwise intact. `FD-S-21` … `FD-S-29` are unchanged. `FD-S-24` is unaffected (the 992–1023 px band
keeps full occupancy). Reconsideration of mobile inventory at an approved lower boundary remains open to ad
operations with founder approval.

### 4.2 Commerce — `unknown` supersedes the research's `retailOnly` fallback

The LRG-STATE-023 research stated that absence of verified evidence "resolves to `retailOnly`, never to an
assumed online path". The second half was right; the first half was **wrong and unsafe**. `FD-X-11`
supersedes it: absence resolves to `unknown` / `underReview` / `unavailable`. `retailOnly` is a **verified**
state requiring evidence. Every occurrence has been corrected in the research documents.

### 4.3 `jackpotSurge` — rejected, not deferred

The research proposed `jackpotSurge` as a priority-6 PF-02 Adaptive Priority trigger. `FD-X-07`
**rejects** it. It is not deferred and not conditionally approved. It has been removed from the override
lists, the implementation sequence and the founder decision surface, and survives only as a non-reordering
badge/data state.

### 4.4 Founder section analysis "Layer A" — subordinate to `FD-S-01` and `FD-X-02`

`State_Lottery_Prposed_section_analysis.docx` lists "Taxes Explained… including the 24% Federal tax and the
specific state tax percentage" as a **Layer A element required on every State page**. That is superseded:
`FD-S-01` gates tax facts behind sourcing, and `FD-X-02` moves the detailed tax guide off the hub. Tax
**status** is an S-08A fact when sourced; tax **rates and advice** are guide content, suppressed until
sourced. The document is tier-7 evidence and is not edited.

Its **Layer B** feature matrix is likewise not a capability model — it records which mockups happened to
include a module, not what a jurisdiction can do. `FD-X-01` settles this: capabilities come from the
registry and manifest.

### 4.5 Native jackpot joining the featured pair — not approved

The research proposed that a State-native jackpot game could join the multi-state featured band when its
published jackpot exceeded both. `FD-X-05` does not grant this. Native prominence is delivered by `FD-X-06`
ranking and by required adjacency ("immediately after or alongside"), not by entry into the multi-state
featured band. Removed from the specification.

### 4.6 Anonymous Follow — deferred, not approved

The research recommended anonymous follow/save in the launch engagement set. `FD-X-09` **defers** Follow
State, Follow Game, notification delivery, cross-device saved games and personalised feeds. Corrected.

### 4.7 Pixel heights — never approved

The research's 64 / 52 / 150 / 76 / 120 / 40 px band heights are **design hypotheses retained as reference
budgets only**. `FD-X-03` makes the binding requirement priority and first-viewport usefulness, validated
visually at 320 / 375 / 390 px. No component height is approved.

---

## 5. Remaining open decisions

After these rulings, **six** items remain open at founder level for the State family. All six are visual or
visual-adjacent. Everything else previously framed as a founder question is decided above, or is execution
work with a named owner.

| ID | Open question | Owner | Gate |
|---|---|---|---|
| `OPEN-SX-01` | **Final desktop container width** | Founder | `DS-37` |
| `OPEN-SX-02` | **Final desktop density** | Founder | `DS-37` |
| `OPEN-SX-03` | **Final visual token application** — including the `FD-S-14` special-ball border/shape/pattern token values | Founder | `DS-37` |
| `OPEN-SX-04` | **Final mobile card density**, decided **after** a populated Florida review | Founder | after `FD-X-13` expansion |
| `OPEN-SX-05` | **Whether the sticky bottom State ad requires a close control.** `APP-ST-05` names `sp_bottom_large_leaderboard` the "closable sticky-footer candidate"; no close control exists today | Founder + ad operations | before production |
| `OPEN-SX-06` | **`DS-37` State visual approval**, desktop and mobile | Founder | after all of the above |

`OPEN-SX-01` … `OPEN-SX-03` and `OPEN-SX-06` overlap `OPEN-ST-06` in `state-page-founder-decisions.md` §3;
they are the same visual gate expressed at cross-State scope and are not additional decisions.

**Explicitly no longer open:** mobile first-viewport density (`FD-X-03`) · multi-state versus native order
(`FD-X-03`, `FD-X-05`) · featured-band strength (`FD-X-05`) · jackpot surge (`FD-X-07` — rejected) ·
return-visit module set (`FD-X-09`) · whether a statistics module exists (`FD-X-10`) · commerce prominence
after eligibility (`FD-X-11`) · special-ball treatment (`FD-X-12`, upholding `FD-S-14`) · whether Florida
proceeds to visual refinement (`FD-X-13`).

---

## 6. Florida prerequisites before `DS-37`

`DS-37` remains **open**. The Florida visual model is **not approved**. Entry gate, per `FD-X-13`:

| # | Prerequisite | Current state | Done when |
|---|---|---|---|
| 1 | Verified Florida draw-event coverage | 7 games verified; ~24 real draw events | Every offered Florida draw event has a governed format and renders with the correct period label; frequent draws grouped per `FD-X-06` |
| 2 | S-04 schedule and current draw data | **suppressed** — no verified schedule | Published Florida draw days, times and cutoffs sourced with timezone; S-04 renders |
| 3 | S-17 Sources, Methodology and Update Process | 1 unavailable surface; no methodology block | Data sources, update frequency, timezone handling, verification steps, editorial standards and limitations render; correction policy visible |
| 4 | Meaningful S-10 history and tool destinations | **suppressed** — no real destination | Archive and game routes exist in the registry and are linked; restores `sp_side_mpu_pos2` |
| 5 | Concise State-native game coverage | 5 native games, single variants | Native games visible per `FD-X-05` adjacency and `FD-X-06` ranking |
| 6 | Official claim and help source paths | 4 unavailable surfaces in S-08; helpline unavailable | Claim tiers, deadlines, tax status, anonymity and help contact either sourced with effective dates, or honestly unavailable with the official link |
| 7 | Realistic non-fabricated cold-start treatment | S-14 and S-15 honest empty hubs | Confirmed as-is; **no synthetic content introduced** |
| 8 | Mobile hierarchy correction | `AD-S00` precedes the first result | `FD-X-03` order implemented; `FD-X-04` mobile inactive state in place; validated at 320/375/390 px |

**Prohibited while satisfying this gate:** repopulating synthetic winner, tax, claim-deadline or
unclaimed-prize content · importing any figure from the proposed design PDFs · adding a Buy or Play CTA ·
weakening the approved ad profile to improve density.

---

## 7. Representative-State rollout sequence

Per `FD-X-14`. Each State passes **both** gates — content manifest and result formats — before preview
activation. Sequential, not parallel.

| Step | State | Gate before activation | Validates |
|---|---:|---|---|
| 1 | **Florida** | §6 prerequisites 1–8 + `DS-37` | Baseline family, frequent draws, secondary draws, `underReview` commerce |
| 2 | **Michigan** | Manifest + formats | Verified `officialOnline`, Keno/frequent draw, inverted-commerce correction |
| 3 | **Virginia** | Manifest + formats | Broad portfolio, second commerce model, conditional-module breadth |
| 4 | **California** | Manifest + formats | **Verified** `retailOnly`, Pacific timezone, scratcher/second-chance variation |
| 5 | **Maryland** | Manifest + formats | High draw-event volume, frequent-draw grouping at scale |
| 6 | **Utah** | Manifest + registry | ST-06 suppression, no fabricated result/claim/commerce modules |
| 7 | Cross-State rollout | All six passed | Remaining jurisdictions |
| 8 | Production migration | `OPEN-ST-05` / `FD-S-32` resolved | Route, canonical, redirect, sitemap cutover |

---

## 8. Revision history

| Task | Date | Change |
|---|---|---|
| **LRG-DEC-024** | July 28, 2026 | Record created. `FD-X-01` … `FD-X-14` recorded. LRG-STATE-023 decisions D-1 … D-10 dispositioned and retired as a founder surface. Two research recommendations corrected: the `retailOnly` fallback (`FD-X-11`) and anonymous Follow at launch (`FD-X-09`). One proposed blueprint addition rejected: `jackpotSurge` (`FD-X-07`). One narrowly scoped advertising supersession recorded: `AD-S00` inactive below 992 px (`FD-X-04`). Open founder surface reduced to six visual decisions `OPEN-SX-01` … `OPEN-SX-06`. **No `FD-S-*`, `APP-ST-*` or `DS-*` ruling changed; PF-02 section order and Adaptive Priority trigger set unchanged.** |
