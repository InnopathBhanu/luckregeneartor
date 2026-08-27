# State Page — Founder Experience Review and Florida Preview Gap Analysis

**Task:** LRG-STATE-023
**Version:** 1.0
**Status:** FOUNDER REVIEW REQUEST — decisions open
**Date:** 2026-07-28
**Authority:** Tier 6. Does not close `DS-37`. Does not approve the Florida visual design. Does not modify
any blueprint, decision register or code.

> **FURTHER CORRECTED BY LRG-DEC-028 (2026-07-29).** Where this document records `Where to Play` as the
> commerce default, that is superseded: **`Buy Now` is the primary State-page commerce CTA**, entering a
> first-party purchase-options resolver, and **S-07 becomes that resolver experience**. `Where to Play` /
> `Find a Retailer` are resolver outcomes or supporting links. Contextual AI has **no three-category cap**;
> entries are selective. Eligibility, disclosure and protected-context rules are unchanged — Florida remains
> **`underReview`**, never `retailOnly`.
>
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

## 1. Purpose

This document originally asked for **ten decisions** and stated what must change in the guarded Florida
preview before it can be put forward for visual approval. **LRG-DEC-024 has since decided them** — §5 now
carries the reconciliation, and the remaining open surface is six visual decisions (§9A). Evidence sits in
`state-page-cross-state-experience-research.md`; the design analysis sits in
`state-page-proposed-design-comparative-audit.md`; the proposed experience sits in
`state-page-mobile-ai-commerce-engagement-specification.md`.

---

## 2. Where the Florida preview actually stands

Measured state after LRG-STATE-021 and LRG-STATE-022, guard on, production ad mode.

| Measure | Value |
|---|---|
| Governed anonymous positions | 25 (19 content sections + 5 ad anchors + footer) |
| Content sections **visible** | **13** — S-01, S-02, S-03, S-05, S-06, S-07, S-08, S-08A, S-14, S-15, S-16, S-17, S-18 |
| Content sections **fully suppressed** | **6** — S-04, S-09, S-10, S-11, S-12, S-13 |
| Approved ad profile / active / deferred | 10 approved · **9 active** · 1 deferred (`sp_side_mpu_pos2`, host S-10 suppressed) |
| Florida games with verified formats | **7** |
| Disabled controls | **0** |
| `Currently unavailable` surfaces inside visible sections | **7** — S-05 ×1, S-06 ×1, S-08 ×4, S-17 ×1 |
| Honest empty hubs | 2 — S-14, S-15 |
| Informational-only sections (no interaction) | 1 — S-16 |
| Page height at 390 px | ~10,900 px, 6 visible ads |
| Responsive / a11y validation | No horizontal scroll at 320–1440 px; reservations correct both tiers; single 992 px threshold; 1 `<main>`, 1 H1, no heading skips; focus not obscured |

### 2.1 The honest summary

Of the 13 visible sections, **7 carry no substantive content** (4 unavailable-bearing, 2 empty hubs, 1
informational). Genuinely substantive today: **S-01, S-02 (7 games), S-06 (comparison table), S-08A (partial
fact strip), S-18 (directory)** — and S-03's brief.

**The preview is architecturally correct and editorially empty.** That is the expected and defensible
outcome of `FD-S-01`/`FD-S-02`, and it should not be "fixed" by importing content from the proposed
designs. But it is **not yet a page a visitor would return to**, and it is not yet a fair test of the
State family's visual design — you would be approving a skeleton.

---

## 3. Answers to the specific review questions

**Is Powerball / Mega Millions prominence sufficient?**
**No — but the deficiency is data, not layout.** They lead S-02's multi-state group correctly. However
Mega Millions currently renders as an `awaiting` card, no jackpot or cash value is sourced for either, and
neither has a history link. The result is that the two highest-interest games occupy prime position while
displaying the least information. Fixing this needs sourced jackpot + cash value (research X-1/X-2) and the
featured treatment in the specification §3.

**Are Florida-native games sufficiently visible?**
**Partially, and they are materially under-represented.** Five native games render (Florida Lotto,
Fantasy 5, Pick 3 Midday, Pick 2 Midday, Cash Pop Morning). Florida actually runs roughly **24 draw
events**: Pick 2/3/4/5 each midday **and** evening, **Cash Pop five times daily**, Fantasy 5 midday **and**
evening, Jackpot Triple Play, Florida Lotto **with Double Play**, Powerball **with Double Play**, plus
raffles. The preview shows single variants of multi-draw games, which is safer than the Florida mockup's
merged cards but still incomplete. **This is the largest single gap.**

**Is the mobile first viewport effective?**
**No.** At 390 px the current first screen delivers the H1, the preview banner, the lede, the freshness
stamp, an action row and then `AD-S00` — the first result appears **below** the first advertisement.
**`FD-X-03` makes results-first binding below 992 px, and `FD-X-04` rules `AD-S00` inactive below 992 px
during the preview**, with no replacement mobile advertisement before the first verified result. The
specification §2.2 carries the approved order.

**Is AI visible and useful enough?**
**Barely.** S-03 exists and an `Ask Florida AI` anchor exists, but there are no contextual `Explain`
actions on any card or section, so the page currently satisfies the letter of `FD-S-16` while Global Shell
§10.5 explicitly says a single page-level module is **not** AI compliance. The Section Intelligence Matrix
(specification §5.3) is the remedy, and `FD-X-08` has since approved the architecture — one persistent entry,
contextual `Explain` actions, precomposed prompts, **one shared answer surface**, deterministic handoffs —
plus the five initial experiences.

**Does the page have enough return-visit value?**
**No.** There is no next-draw module (S-04 suppressed), no draw calendar, no jackpot movement, no
last-visit diff, no followable game, no news, and no community activity. Every device that would earn a
second visit is currently absent or suppressed. The two required hubs (S-14, S-15) are honestly empty,
which is correct but contributes nothing yet.

**Do unavailable and cold-start states dominate?**
**Yes — measurably.** 7 of 13 visible sections carry no substantive content, and 6 further sections are
suppressed entirely. The individual treatments are correct and well-written; the **cumulative** effect is a
page that reads as "mostly not ready". This is the strongest argument for the compact, results-first mobile
order now approved by `FD-X-03`, and for the `FD-X-13` content gate before any visual approval.

**Do ad reservations harm density?**
**Yes, at the current content volume.** Nine active placements are correct against the approved profile,
and reservations are now geometrically correct. But at 390 px the page is ~10,900 px tall with 6 ads and
only about three substantive sections — so advertising is a high proportion of what a visitor actually
sees. **The approved profile must not be weakened.** The correct resolution is more real content, plus the
already-approved host-eligibility rule that keeps ads off empty shells (`APP-ST-01`, `APP-ST-04/05`), which
is why one slot is legitimately deferred today. `FD-X-04` additionally removes the `AD-S00` mobile
reservation, so mobile visible placements reduce from 6 to 5 — a viewport-scoped inactive state, **not** an
inventory reduction.

**Is the visual treatment friendly enough?**
**Not yet.** It is clean, accessible and legible, but it is typographically flat: no game brand marks, no
card visual hierarchy, uniform section weight, and no colour system beyond the token defaults. The proposed
designs' warmth comes largely from game logos and card elevation (Delaware, Connecticut) — both safe to
adopt. This is what `DS-37` is for, and `FD-X-13` confirms it is decided **after** content and structure.

**Does it resemble Lottery Post's utility strengths without copying it?**
**It shares the discipline but not yet the utility.** Matching present: server-rendered results, explicit
timezone, exact draw dates, format-driven balls, named special balls. Missing: completeness of draw events,
per-card next-draw panel with plain-language countdown, per-card history and calendar links, jackpot
movement, and a last-visit stamp. None of those require copying any layout — they are information
behaviours, and the specification adopts them structurally rather than visually.

---

## 4. Per-section gap analysis

| § | Section | Current | Classification | What is required |
|---|---|---|---|---|
| S-01 | State identity / task header | Visible; H1, lede, freshness, staleness badge, 3 anchor actions; no disabled controls | **REQUIRES MOBILE REORDERING** | Compress to the band 1–2 budget; keep the freshness stamp; add `Follow Florida` as anonymous value; keep `Ask Florida AI` |
| S-02 | Latest results | Visible; 7 games, real feed values, format-driven balls, named special balls, exact dates, status union | **REQUIRES CONTENT IMPROVEMENT** + **REQUIRES INTERACTION DESIGN** | Expand to Florida's real draw events; add featured multi-state treatment with jackpot + cash value; add per-card next-draw panel, history link and follow star; add `Explain this result` |
| S-03 | State AI brief | Visible; one anonymous answer | **REQUIRES AI ENTRY** | Add precomposed prompts; make it the shared answer surface that contextual entries write into |
| S-04 | Live and upcoming draws | **Suppressed** — no verified schedule | **REQUIRES CONTENT IMPROVEMENT** | Highest-value unsuppression. Florida draw times and cutoffs are published facts; source them. Unlocks the next-draw and calendar loops |
| S-05 | Check my ticket | Visible; 1 unavailable surface; deterministic; no disabled submit | **REQUIRES INTERACTION DESIGN** | Scope to games with governed formats; ensure no ad between input and output; add post-check `Explain this result` handoff |
| S-06 | State game portfolio | Visible; comparison table; 1 unavailable surface | **REQUIRES CONTENT IMPROVEMENT** | Published odds per game; neutral comparison copy; per-game links to game pages. Reject "strategy"/"why players like it" framing |
| S-07 | Where to Play | Visible; renders the verified official link + attribution | **REQUIRES THE `Buy Now` RESOLVER** | **Corrected by LRG-DEC-028.** S-07 becomes the complete **`Buy Now` / purchase-options resolver** experience with the fixed `FD-N-10` ordering and adjacent disclosure. The `FD-X-11` eligibility ladder is retained **behind** the CTA. **Florida still resolves to `underReview`** — not `retailOnly` — so its resolver outcome is an explanation plus the official retailer route |
| S-08 | Claims, taxes, anonymity | Visible; **4** unavailable surfaces | **REQUIRES CONTENT IMPROVEMENT** | Source claim tiers, deadlines, tax status and anonymity from the official operator with effective dates; move the long walkthrough to a guide; add the operator contact/locator card |
| S-08A | State essentials | Visible; partial fact strip | **REQUIRES CONTENT IMPROVEMENT** | Complete the 8 governed facts; each with source and effective date |
| S-09 | Worth knowing | **Suppressed** — synthetic only | **DEFERRED** | Correctly suppressed. Needs a validated source and the ≤3 item cap *(the ≤3 here is the PF-02 highlight-item cap, unrelated to AI categories)* |
| S-10 | Tools, history, statistics | **Suppressed** — no real destination | **REQUIRES CONTENT IMPROVEMENT** | Unsuppressing this also restores the deferred rail slot. Needs real archive/game routes. Statistics only if D-6 approves it |
| S-11 | Scratchers | **Suppressed** — no sustainable snapshot | **DEFERRED** | Adopt California's honest scope statement + official outbound instead of a snapshot |
| S-12 | Winners and unclaimed | **Suppressed** — fabricated fixture content | **DEFERRED** | Correctly suppressed. Do **not** import the proposed designs' winner prose or `[X days]` placeholders |
| S-13 | Fund allocation | **Suppressed** — unsourced | **DEFERRED** | Needs a current sourced report with its reporting period |
| S-14 | Community | Visible; genuine cold start; no ad host | **READY FOR FOUNDER VISUAL REVIEW** | Correct as-is. Only real activity changes it |
| S-15 | News and guides | Visible; sparse hub; no ad host | **REQUIRES CONTENT IMPROVEMENT** | Real editorial has direct traffic value (local TV news ranks for these queries) |
| S-16 | Follow State | Visible; informational text only, zero controls | **READY FOR FOUNDER VISUAL REVIEW** | Correct under `FD-S-08`. Persistence blocked by open Member/Insider decisions |
| S-17 | Sources, responsible play | Visible; 1 unavailable surface (helpline) | **REQUIRES CONTENT IMPROVEMENT** | **Add the Sources & Methodology block** — highest-value safe addition available (audit §5.1). Source the Florida helpline; keep it unavailable rather than invented until then |
| S-18 | All States | Visible; registry-driven; planned States unlinked | **READY FOR FOUNDER VISUAL REVIEW** | Correct |
| AD-S00…AD-S04 | Ad anchors | 9 active / 10 approved, 1 legitimately deferred | **REQUIRES MOBILE REORDERING** | Do not weaken. `AD-S00` must not precede the first result on mobile |
| — | Whole page | — | **REQUIRES VISUAL REDESIGN** | `DS-37` / `OPEN-SX-01`…`OPEN-SX-06`, after the `FD-X-13` content gate |

**Summary:** 4 sections ready · 11 need content · 3 need interaction · 1 needs commerce state · 1 needs AI ·
5 deferred · whole-page visual redesign pending decisions.

---

## 5. Founder decisions — RECONCILED AND CLOSED by LRG-DEC-024

> **This section originally asked for ten decisions (D-1 … D-10). That surface is retired.** All ten are
> dispositioned below against founder rulings `FD-X-01` … `FD-X-14`
> (`03-docs/08-decisions/state-page-cross-state-experience-decisions.md`). **Nine are decided, rejected or
> merged. One is deferred to the visual review.** Do not re-run this as an approval exercise.

| ID | Original question | Deciding ruling | Disposition | Outcome |
|---|---|---|---|---|
| **D-1** | Mobile first-viewport density | `FD-X-03`, `FD-X-05` | **DECIDED** | Results-first priority order approved; compact multi-state strip, never two full desktop cards. Pixel heights demoted to non-binding reference budgets. *Final mobile card density* alone survives, as `OPEN-SX-04`, after a populated Florida review |
| **D-2** | Multi-state versus native-game order | `FD-X-03`, `FD-X-05` | **DECIDED — refined** | On mobile the **first verified result leads regardless of which class it belongs to**, then the compact multi-state strip, then native games. On desktop, a featured pair. PF-02's group order is confirmed, not changed. This refines the original recommendation, which had framed it purely as "multi-state first" |
| **D-3** | Featured-band strength | `FD-X-05` | **DECIDED — partially superseded** | Featured pair on desktop where data *and* availability justify it; no empty paired position if only one game is offered; native access must remain visible immediately after or alongside. **The proposal that a native jackpot could join the featured band is NOT approved** |
| **D-4** | `jackpotSurge` Adaptive Priority condition | `FD-X-07` | **REJECTED** | Not added as a sixth trigger. PF-02 §12.1 remains exactly five. Survives only as a non-reordering badge / delta line / news eligibility / last-visit difference. Removed from the override list, the sequence and the decision surface |
| **D-5** | Return-visit module set for launch | `FD-X-09` | **DECIDED — corrected** | Approved anonymous set: local-only last-visit timestamp, deterministic "what changed", new-result count, correction count, jackpot-change summary, next-draw summary, real news/community changes. **Follow State, Follow Game, notification delivery, cross-device saved games and personalised feeds are DEFERRED** — correcting this document's original recommendation of anonymous follow/save at launch. No disabled Follow or Notify control may render |
| **D-6** | Is a statistics module in scope? | `FD-X-10` | **DECIDED** | Yes, but **subordinate to S-10 only** — descriptive history, jackpot history, draw-frequency summaries, correction history, archives. No separate top-level prediction or "number strategy" section. No prominent hot/cold/predictions/systems/wheels/lucky numbers. Must state that historical patterns do not alter draw odds. Deep statistics move to dedicated destinations |
| **D-7** | Commerce prominence after verified eligibility | `FD-X-11` | **DECIDED — with a safety correction** | S-07 detail + one resolved mobile line + per-game availability line; never in the global utility bar; never in a protected zone. **And the fallback is corrected: absence of evidence resolves to `unknown` / `underReview` / `unavailable`, never to `retailOnly`** |
| **D-8** | Desktop container width and density | — | **DEFERRED TO VISUAL REVIEW** | Remains open as `OPEN-SX-01` (width) and `OPEN-SX-02` (density), gated on `DS-37` |
| **D-9** | Special-ball and target-size policy | `FD-X-12`, upholding `FD-S-14` | **MERGED — not a founder decision** | Special-ball treatment is **already governed by `FD-S-14` and must not be reopened**: visible text or abbreviation, non-colour distinction, accessible name. 44×44 applies to **interactive controls**; non-interactive number balls may be smaller if readable, distinguishable, accessible, stable at 200% zoom and non-overlapping at 320 px. The specific border/shape/pattern **tokens** remain in `OPEN-SX-03` / `DS-37` |
| **D-10** | Does Florida proceed to visual refinement, or need structural revision? | `FD-X-13` | **DECIDED** | Neither extreme: **content and structure first, then visual approval.** `DS-37` stays open. The seven `FD-X-13` expansions plus the mobile hierarchy correction form the entry gate — see §6 of the decision record. No structural revision of PF-02 order is required |

**Net effect:** 7 decided · 1 rejected · 1 merged into an existing ruling · 1 deferred to the visual review.
The open founder surface for the State family is now **six visual decisions only** — `OPEN-SX-01` … `OPEN-SX-06`
(§9 below).


## 6. Recommended sequence after these decisions

Full dependency reasoning in the research document §7.

1. **Florida content expansion** — real draw events, S-04 schedule/current draw data, S-17 Sources &
   Methodology, S-10 destinations, native game coverage, official claim/help source paths, confirmed
   cold-start treatment *(the seven `FD-X-13` prerequisites; unblocks everything)*
2. **Florida mobile reordering and card redesign** — results-first order and `AD-S00` mobile inactive state
   *(`FD-X-03`, `FD-X-04`, `FD-X-05`)*
3. **`DS-37` founder visual approval** *(the gate; `OPEN-SX-01` … `OPEN-SX-06`)*
4. Florida interaction refinement — history links, draw calendar, last-visit diff *(`FD-X-09`; Follow and
   Notify are deferred)*
5. AI shared-answer surface and the five `FD-X-08` launch experiences
6. Commerce resolver placeholder states, implementing the `FD-X-11` ladder *(no activation)*
7. State capability-profile contract *(`FD-X-01`)*
8. Michigan → Virginia → California → Maryland → Utah *(`FD-X-14`; each gated on manifest + formats)*
9. Cross-State rollout
10. Production migration, after the URL audit and canonical decision (`FD-S-32`)

---

## 7. What must not happen

- Do not import content from the proposed design PDFs. Their jackpots contradict each other, their
  placeholders are unfilled (`[X days]`), their winner narratives have no provenance, and two leak
  `GMT+5:30` into US State pages.
- Do not add a Buy or Play CTA **from a design artefact**. A `Buy Now` CTA is now approved (`FD-N-03`) but it
  must come from the governed resolver and verified eligibility — never from a mockup. Florida's commerce
  state remains **`underReview`**; absence of evidence is never a verified `retailOnly`.
- Do not weaken the approved 10-slot ad profile to improve density. Add content instead.
- Do not "fix" the `Currently unavailable` surfaces by writing plausible copy. They are correct.
- Do not re-open PF-02 section order, and do not add an Adaptive Priority trigger. `jackpotSurge` was
  **rejected** (`FD-X-07`); the trigger set remains exactly five.
- Do not implement anything from the pending Member/Insider set — the anonymous engagement modules in D-5
  were chosen specifically to avoid it.

---

## 8. Open items not raised to founder decisions

| # | Item | Route |
|---|---|---|
| O-1 | How many Florida draw events must the manifest cover before `DS-37`? | Data task scoping |
| O-2 | Do the five State content drafts (MD, MN, MS, ME, LA) carry approval status? | Governance — none found |
| O-3 | Should `LOTTERY SYSTEMS` remain in global navigation? | Shell-level, prediction-adjacent naming |
| O-4 | Re-verification cadence for online-sales eligibility per State | Commerce data operations |
| O-5 | Six conflicts C-A…C-F for the source-conflicts register | Governance task (this task may not write it) |
| O-6 | `sp_side_mpu_pos2` remains deferred until S-10 has a real destination | Resolves with O-1 / S-10 |

---

## 9A. Remaining open decisions — six, all visual

| ID | Open question | Gate |
|---|---|---|
| `OPEN-SX-01` | Final desktop container width | `DS-37` |
| `OPEN-SX-02` | Final desktop density | `DS-37` |
| `OPEN-SX-03` | Final visual token application, including the `FD-S-14` special-ball border/shape/pattern tokens | `DS-37` |
| `OPEN-SX-04` | Final mobile card density, decided **after** a populated Florida review | after `FD-X-13` |
| `OPEN-SX-05` | Whether the sticky bottom State ad requires a close control (`APP-ST-05` calls it a "closable candidate"; none exists today) | before production |
| `OPEN-SX-06` | `DS-37` State visual approval, desktop and mobile | after the above |

Everything else previously in §5 is decided, rejected or merged.

---

## 9. Correction to an earlier LRG-STATE-022 finding

LRG-STATE-022 flagged that PF-02 Appendix B's `[EXT-01]` references might not prove the current Florida
operator identity and URL, and suggested considering `underReview`. **That reservation is now resolved in
favour of the existing manifest.** `floridalottery.com` was confirmed live and official, serving the exact
paths Appendix B cites. No downgrade is required. What needs periodic re-verification is the *content* of
those pages — claim tiers, deadlines, tax status — not the operator identity or URL.

---

*End of founder review. Companion documents:
`state-page-cross-state-experience-research.md`,
`state-page-mobile-ai-commerce-engagement-specification.md`,
`state-page-proposed-design-comparative-audit.md`.*
