# Home Preview — Section Manifest (Anonymous)

**Document type:** Page specification — section manifest
**Recorded by:** Task LRG-SPEC-007 (Preview Track P2)
**Date:** July 26, 2026
**Status:** **PROPOSED — founder review required before P3**
**Governing authority:** Home Page Blueprint **BP-02 v1.1** §12 (Anonymous Section Sequence), §13–§56 (section specifications), §57 (Anonymous Home Matrix), §61–§65 (ad tier, preservation contract, position map, mobile contract, prohibitions) · Global Shell v1.1 · `design-system-founder-decisions.md` (DS-DEC-001)

**Scope:** anonymous Home only. The signed-in sequence (`H-01S`…`H-08S`) is **out of preview scope** per DS-DEC-001 and `home-preview-track-decision.md`.

---

> ## ⚠ Active preview deviation — read before using §2 as the rendered order
>
> The sequence in §2 below is, and remains, the **transcription of BP-02 v1.1 §12**. It is unchanged.
>
> **The guarded preview currently renders a different order.** A founder-authorized experiment, now in
> its **second round**, moves three governed sections:
>
> - **H-10 Community Live** → immediately after **H-05 LotteryCorner AI** (position 10). Round 2,
>   LRG-UI-012 §14.
> - **H-11 News and Stories** and **H-14 Return and Distribution** → immediately after **AD-H03**
>   (positions 14 and 15), grouped under the presentation label **"Latest from LotteryCorner"**.
>   Round 1, LRG-UI-011 §2.
>
> All 23 sections are retained, each exactly once; all 7 anchors and all 20 mapped slots are retained;
> no anchor changes position relative to another anchor; the frozen blueprint is not amended.
>
> The experiment, the exact before/after orders, the boundaries it preserves and the review criteria
> are recorded in **`03-docs/08-decisions/home-engagement-order-preview-experiment.md`**
> (status: FOUNDER-AUTHORIZED PREVIEW EXPERIMENT).
>
> §2 stays authoritative for the blueprint. The decision record is authoritative for what the preview
> renders today. See **§7** below for the reconciliation table.

## 1. Sequence Integrity Statement

The sequence below is **transcribed verbatim** from BP-02 §12. Order, section IDs and section names are not altered, reordered, merged or renamed.

- **30 entries total** — 23 content sections + **7 advertising anchors** (`AD-H00` … `AD-H06`).
- **No section is silently omitted.** Where current data is absent, the section is implemented as a **clearly labelled preview state**, never dropped.
- **No section is invented.**

### Preview action vocabulary

| Action | Meaning |
|---|---|
| **IMPLEMENT WITH CURRENT DATA** | The existing Home fixture already carries adequate data for this section. |
| **IMPLEMENT WITH TRANSFORMED FIXTURE** | Data exists but must be reshaped to the blueprint's view model (see `home-preview-view-model.md`). |
| **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** | No adequate data exists. The section renders with its heading, purpose and an explicit preview/unavailable label — reserving its position and hierarchy without fabricating lottery facts. |
| **OMIT ONLY IF BLUEPRINT MARKS CONDITIONAL AND CONDITION IS FALSE** | Reserved. **No anonymous Home section qualifies** — BP-02 §12 marks none of the 23 content sections conditional. Recorded for completeness; unused in this manifest. |

**Ad tier column** is taken from BP-02 §57: `0` = no advertisement inside the section; `0 inside; rail outside` = rail permitted alongside but nothing within; `1`/`2`/`3` = permitted inline density.

---

## 2. Anonymous Section Sequence

| Order | Section ID | Section name | Purpose | Required / conditional | Existing data source | Existing component candidate | Preview action | Ad protection (BP-02 §57/§65) | Mobile priority |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **H-01** | Home Task Entry | Route the visitor to their job before anything else | **Required** | `page.h1`, `page.intro`, `stateSearch`; **no search or AI-entry data exists** | `HomeTemplate` hero block (partial) | **IMPLEMENT WITH TRANSFORMED FIXTURE** — hero + state entry from fixture; search and compact AI action as labelled preview affordances | **Tier 0 — no ad inside.** First-viewport contract: identity, task entry, jackpot orientation and results precede the first normal ad | **1 — highest.** Must be in the first viewport at 320 px |
| 2 | **AD-H00** | Existing Top Leaderboard | Preserve the production top leaderboard | **Required (inherited revenue)** | `adSlotRefs.top` → `hp_top_billboard` | `AdSlot` + `AdSlotView` | **IMPLEMENT WITH CURRENT DATA** — labelled reserved placeholder, inactive | Tier 2. **No overlay; reserve height.** Not before task orientation | 2 |
| 3 | **H-02A** | Featured National Games — Powerball and Mega Millions | Deliver the two richest national games: result, jackpot, countdown, next draw | **Required** | `featureGames.cards` — **real values from `source-xml`** | `DynamicResultCard`, `BallGroup`, `MultiplierBadge` | **IMPLEMENT WITH CURRENT DATA** | **Tier 0 inside; rail outside.** No ad inside game facts; none between jackpot and numbers | **1 — highest** |
| 4 | **AD-H01** | Featured-Game Interstitial / Desktop Rail | Preserve rail inventory (`AD-H01R`) and inline banner between the two featured games (`AD-H01I`) | **Required (inherited revenue)** | `adSlotRefs.rightRail[0..]` and `adSlotRefs.inContent[0]` | `AdSlot` | **IMPLEMENT WITH CURRENT DATA** — rail ≥992 px only; inline placeholder between the featured games | Tier 2. Rail **never inside game facts**; inline must not resemble game content | 3 (rail suppressed below 992 px) |
| 5 | **H-02B** | Additional Top Jackpots | Compare the next tier of jackpots | **Required** | `topJackpots` (columns + rows) | `DataTable` | **IMPLEMENT WITH TRANSFORMED FIXTURE** — table → jackpot comparison per blueprint | Tier 1. No ad styled as a jackpot card | 2 |
| 6 | **H-03** | Latest U.S. and State Results | The winning numbers — the page's core factual payload | **Required** | `latestResults.cards` — real result data | `DynamicResultCard`, `BallGroup` | **IMPLEMENT WITH CURRENT DATA** | **Tier 0 inside.** No ad inside the result grid or inside any result card | **1 — highest** |
| 7 | **AD-H02** | Post-Results Advertisement | First normal inline advertisement | **Required (inherited revenue)** | `adSlotRefs.inContent[1]` | `AdSlot` | **IMPLEMENT WITH CURRENT DATA** | Tier 2. First normal inline ad — must follow, never precede, the results | 3 |
| 8 | **H-04** | Check My Numbers | Let the visitor compare their own numbers | **Required** | **No Home fixture key.** A `checkTicket` shape exists on State fixtures only | `CheckTicketTool` (built for State) | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — visible entry and explanation; the matching engine is not implemented in the preview | **Tier 1 after output only.** **No ad between input and output** — protected task zone | 2 |
| 9 | **H-05** | LotteryCorner AI Daily Brief | Explain what happened today, with citations | **Required** | `aiToolsTeaser` is a disabled stub, **not a brief** | `AiToolsTeaser` (stub) | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — labelled "LotteryCorner AI" region with a deterministic fallback summary drawn from real result data; **no generated content, no prediction claim** | **Tier 0 — no ad inside the AI answer** | 2 |
| 10 | **H-06A** | Live and Recently Completed Draws | Current draw status | **Required** | Partial — `upcoming.items[].status = "awaiting"` | `DataTable` / card grid | **IMPLEMENT WITH TRANSFORMED FIXTURE** — awaiting/completed status rows with explicit text status | **Tier 0 inside.** **No ad between a row's status and its result** | 2 |
| 11 | **H-06B** | Tonight and Upcoming Draws | Next draw times and cutoffs | **Required** | `upcoming.items` | card grid in `HomeTemplate` | **IMPLEMENT WITH TRANSFORMED FIXTURE** | Tier 1 | 2 |
| 12 | **AD-H03** | Post-Live-Draw Advertisement | Preserve the mid-page banner | **Required (inherited revenue)** | `adSlotRefs.inContent[2]` | `AdSlot` | **IMPLEMENT WITH CURRENT DATA** | Tier 2. **Not between status and result** | 3 |
| 13 | **H-07** | Explore Your State | Open the visitor's state hub | **Required** | `stateSearch` + `browseByState.states` | `StateDirectory` | **IMPLEMENT WITH CURRENT DATA** | Tier 0. No ad inside state selection | 2 |
| 14 | **H-08** | Worth Knowing / Intelligent Highlights | Surface notable governed facts | **Required** | `news.recentWins`, `news.unclaimedPrizes`, `news.jackpotGrowth` — **synthetic** | `HighlightsAlerts` | **IMPLEMENT WITH TRANSFORMED FIXTURE** — rendered with visible synthetic-content labelling per §4 of the view model | Tier 0 | 3 |
| 15 | **H-09** | Tools, Systems and Number Exploration | Interactive utility entry | **Required** | `tools.items`, `systems.sections` | `InfoSectionList` + link grid | **IMPLEMENT WITH CURRENT DATA** | **Tier 1.** **No ad between tool input and output** | 3 |
| 16 | **H-09A** | Popular Games | Demand-ranked game discovery | **Required** | `popularGames.items` | card grid, `BuyTicketsCta` | **IMPLEMENT WITH CURRENT DATA** | Tier 1 | 3 |
| 17 | **H-09B** | Jackpot History and Comparisons | Historical jackpot context | **Required** | `jackpotHistory.items` — **`series` deliberately absent** | card grid | **IMPLEMENT WITH CURRENT DATA** — factual cards only. **No chart**: a trend chart renders only from real historical series | Tier 2 | 4 |
| 18 | **AD-H04** | Lower Utility Advertisement | Preserve the lower utility banner | **Required (inherited revenue)** | `adSlotRefs.inContent[3]` | `AdSlot` | **IMPLEMENT WITH CURRENT DATA** | Tier 2. **Tool output protected** — must follow it | 4 |
| 19 | **H-10** | Community Live | Real human community activity | **Required** | **No fixture. No approved community data.** Community is Phase 18 | none | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — heading, purpose and an explicit "community not yet available in preview" state. **MUST NOT fabricate posts, threads, replies, reputation or activity** | Tier 2. Ad **clearly separated from posts**; never styled as a topic | 4 |
| 20 | **H-10A** | Winners and Claim Stories | Verified human outcomes | **Required** | `news.recentWins` — **synthetic** | `BiggestWinnersSection` / `HighlightsAlerts` | **IMPLEMENT WITH TRANSFORMED FIXTURE** — with visible synthetic labelling | Tier 2. **Advertising prohibited inside claim guidance** | 4 |
| 21 | **H-11** | News and Stories | Current lottery stories | **Required** | `liveNews.items` — synthetic editorial | news card grid in `HomeTemplate` | **IMPLEMENT WITH TRANSFORMED FIXTURE** — visible synthetic labelling; **no `NewsArticle` schema on Home** (BP-02 §69: article markup stays on article pages) | Tier 2–3. Ad never styled as a story | 4 |
| 22 | **H-11A** | Lottery Blog and Guides | Durable help content | **Required** | `blog.items` | blog card grid | **IMPLEMENT WITH TRANSFORMED FIXTURE** | Tier 2–3 | 5 |
| 23 | **H-12** | Where to Play / Buy Online | Present the legal purchase option | **Required** | `buyTicketsHighlight` | `BuyTicketsCta` | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — CTA in position with **explicit disclosure**, no destination resolved. **`/play/{game}` vs `/buynow/{code}` is unresolved and MUST NOT be settled here** | **Tier 1.** **No ad inside purchase eligibility.** No simultaneous mobile sticky ad and sticky purchase bar | 3 |
| 24 | **H-13** | My LotteryCorner / Insider Value | Explain continuity value to anonymous visitors | **Required** | `insider` (heading, features, CTA) | insider band in `HomeTemplate` | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — value explanation only. **MUST NOT implement any Member/Insider capability**: no route, paid tier, quota, export, ticket record, badge or Insider ad treatment. 11 Part 22 decisions remain open | Tier 1 | 5 |
| 25 | **H-14** | Return and Distribution | Give a reason and a channel to return | **Required** | Partial — no dedicated key | — | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — visible return affordances, non-functional and labelled | Tier 1 | 5 |
| 26 | **H-14A** | Newsletter and Player Updates | Email return channel | **Required** | `newsletter` | newsletter block in `HomeTemplate`/`SiteFooter` | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — form present but **explicitly labelled unavailable**, not a silently disabled control (DS-17) | Tier 1 | 5 |
| 27 | **H-14B** | Winning Numbers by State Directory | Complete crawlable state directory | **Required** | `browseByState.states` | `StateDirectory` | **IMPLEMENT WITH CURRENT DATA** | Tier 1. Strong internal-linking surface | 4 |
| 28 | **AD-H05** | Bottom Content Advertisement | Preserve the lower banner (`AD-H05`) and optional lower rail (`AD-H05R`) | **Required (inherited revenue)** | `adSlotRefs.inContent[4]`; rail from `adSlotRefs.rightRail[..]` | `AdSlot` | **IMPLEMENT WITH CURRENT DATA** | Tier 2. **Clearly labelled**; rail not styled as a story | 5 |
| 29 | **H-15** | Trust, Support and Footer | Provenance, policy, support, responsible play | **Required** | `footer-config.json` (**real production links**), `contentMeta`, trust notices | `SiteFooter` | **IMPLEMENT WITH CURRENT DATA** | **Tier 0.** No ad inside responsible-play guidance | 3 — trust must be reachable on mobile |
| 30 | **AD-H06** | Existing Bottom Anchor / Sticky Slot, when enabled | Preserve the bottom anchor | **Required (inherited revenue), when enabled** | `adSlotRefs.stickyFooterAd` → `hp_bottom_large_leaderboard_sticky` | `StickyFooterAd` + `AdSlot` | **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** — labelled **inactive** sticky reservation per DS-27; **does not assert final production creative height** (DS-26/DS-34 unresolved) | Tier 2. **Must not conflict with mobile bottom navigation or purchase**; priority: safety → bottom nav → user action → advertising | 3 |

---

## 3. Preview Action Summary

| Action | Count | Sections |
|---|---|---|
| **IMPLEMENT WITH CURRENT DATA** | 13 | AD-H00, H-02A, AD-H01, H-03, AD-H02, H-07, H-09, H-09A, H-09B, AD-H03, AD-H04, H-14B, AD-H05, H-15 *(14 rows; AD-H03/AD-H04 counted once each)* |
| **IMPLEMENT WITH TRANSFORMED FIXTURE** | 8 | H-01, H-02B, H-06A, H-06B, H-08, H-10A, H-11, H-11A |
| **IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE** | 8 | H-04, H-05, H-10, H-12, H-13, H-14, H-14A, AD-H06 |
| **OMIT** | **0** | None. No anonymous Home section is marked conditional in BP-02 §12 |

**Every one of the 30 entries has a defined preview strategy. Nothing is dropped.**

---

## 4. Advertising Anchor ↔ Production Slot Mapping

**Critical distinction:** the blueprint defines **7 anchors** (content-relative *positions*). The production inventory referenced by the Home fixture is **20 slots**. Anchors are positions; slots are inventory. Multiple production slots may sit at one anchor — for example `AD-H01` has both a rail sub-position (`AD-H01R`) and an inline sub-position (`AD-H01I`).

**Binding rule (BP-02 §62):** existing slot IDs, configured dimensions, responsive size mappings and approximate content-relative positions are preserved. **This task changes no slot ID, unit path, size map, position or count.**

| Anchor | Sub-position | Production slots (from `adSlotRefs`) | Visibility |
|---|---|---|---|
| **AD-H00** | — | `hp_top_billboard` | All widths |
| **AD-H01** | `AD-H01R` rail | `hp_side_halfpage_pos1`, `hp_side_mpu` | **≥992 px only** |
| | `AD-H01I` inline | `hp_mid_leaderboard` | All widths |
| **AD-H02** | — | `hp_mid_large_leaderboard_pos1` | All widths |
| **AD-H03** | — | `hp_mid_billboard_pos1` | All widths |
| **AD-H04** | — | `hp_mid_large_leaderboard_pos2`, `hp_mid_billboard_pos2` | All widths |
| **AD-H05** | `AD-H05` banner | `hp_mid_large_leaderboard_pos3`, `hp_mid_billboard_pos3`, `hp_mid_large_leaderboard_pos4` | All widths |
| | `AD-H05R` rail | `hp_side_halfpage_pos2`, `hp_side_mpu_pos1`, `hp_side_halfpage_pos3`, `hp_side_halfpage_pos4` | **≥992 px only** |
| **AD-H06** | — | `hp_bottom_large_leaderboard_sticky` | All widths, **inactive labelled reservation** |
| **Mobile in-content** | distributed across AD-H02, AD-H03, AD-H04, AD-H05 | `hp_mobile_leaderboard_pos1` … `pos4` | **<992 px only** |

**Slot accounting:** 1 top + 8 inContent + 6 rail + 4 mobile + 1 sticky = **20 of 21** home slots referenced. `hp_video` (`/21828142944/LC_ATV_video_player`, 300×168) is **defined but unreferenced** by the current fixture. **It is not dropped** — it is recorded here as unmapped and must be resolved with ad operations, not silently omitted (open dependency #7).

**Mobile distribution requirement.** The current implementation stacks all four `hp_mobile_leaderboard_pos1..4` slots consecutively at page bottom (`HomeTemplate.tsx:308`). Per BP-02 §64 and DS-DEC-001 the preview **must distribute them into the approved content-relative anchors**. Redistribution must not reduce inventory: **all four remain present.**

**Retained guard.** The unconsumed-ad flush pattern (`HomeTemplate.tsx:298`) must be carried forward so that if the section count changes, no configured slot is silently dropped.

**AD-H03B** (BP-02 §25, "Mid-Home Intelligent-Content Advertisement") is defined as a section specification but **is not part of the §12 numbered sequence**. It is therefore **not implemented in the preview**. It explicitly "does not replace the preserved post-live-draw slot" and remains available for a later founder decision on page-specific ad volume (DS-35, deferred).

---

## 5. Protected Task Zones (No Advertising Inside)

Consolidated from BP-02 §57 (tier 0 sections) and §65 (prohibited placements):

| Protected zone | Sections | Rule |
|---|---|---|
| Home task entry | H-01 | No ad before task orientation |
| Featured-game facts | H-02A | No ad inside game facts; none between jackpot and numbers |
| Result grid and result cards | H-03 | No ad inside |
| Number-check flow | H-04 | **No ad between input and output** |
| AI answer | H-05 | No ad inside the AI answer |
| Live draw row and status | H-06A | **No ad between status and result** |
| State selection | H-07 | No ad inside |
| Tool output | H-09 | Ad may follow output, never interrupt it |
| Claim guidance | H-10A | Advertising prohibited inside claim content |
| Purchase eligibility | H-12 | No ad inside; no simultaneous mobile sticky ad and sticky purchase bar |
| Responsible play | H-15 | No ad or commercial CTA inside |
| Mobile bottom navigation | shell | Ad must never sit over it |

---

## 6. Consistency Validation

| Check | Result |
|---|---|
| Order matches BP-02 §12 exactly | ✅ 30 entries, verbatim IDs, names and order |
| All 7 ad anchors present | ✅ `AD-H00`, `AD-H01`, `AD-H02`, `AD-H03`, `AD-H04`, `AD-H05`, `AD-H06` |
| Anonymous scope only | ✅ no `H-*S` section appears |
| No required section omitted | ✅ 0 omissions; 8 sections use labelled preview states instead |
| No invented section | ✅ every ID traces to BP-02 §12 |
| Every section has a data source or a labelled preview strategy | ✅ all 30 |
| No GAM configuration changed | ✅ mapping only; 20 slots referenced, `hp_video` recorded as unmapped |
| Ad inventory not reduced | ✅ all referenced slots retained; mobile slots redistributed, not removed |
| No Member/Insider capability promoted | ✅ H-13 is a labelled value-explanation preview state only |
| No route or canonical conflict resolved | ✅ H-12 records `/play` vs `/buynow` as unresolved |
| No synthetic content presented as fact | ✅ H-08, H-10A, H-11, H-11A carry visible synthetic labelling |

---

## 7. Preview Order Reconciliation — LRG-UI-011 engagement experiment

**Added:** July 26, 2026 · **Status:** FOUNDER-AUTHORIZED PREVIEW EXPERIMENT, pending visual review
**Governing record:** `03-docs/08-decisions/home-engagement-order-preview-experiment.md`

§2 above remains the verbatim BP-02 v1.1 §12 transcription and is **not** edited. This section
records only the difference between that blueprint order and what the guarded preview renders.

### 7.1 Section identification

The founder brief described the sections to move in prose rather than by ID. Read against §2:

| Brief wording | Resolved section ID | §2 section name |
|---|---|---|
| "the existing Community Live section" | **H-10** | Community Live |
| "the existing News and Stories section" | **H-11** | News and Stories |
| "the existing media/social/return-channel section used for video and social updates" | **H-14** | Return and Distribution |
| "the exact approved advertisement anchor occurring at this point" | **AD-H03** | Post-Live-Draw Advertisement |

### 7.2 Order difference

| Section | BP-02 §12 position | Preview position |
|---|---|---|
| H-10 Community Live | 19 | **13** |
| H-11 News and Stories | 21 | **14** |
| H-14 Return and Distribution | 25 | **15** |
| H-07 Explore Your State | 13 | 16 |
| H-08 Worth Knowing | 14 | 17 |
| H-09 Tools and Systems | 15 | 18 |
| H-09A Popular Games | 16 | 19 |
| H-09B Jackpot History | 17 | 20 |
| AD-H04 Lower Utility Advertisement | 18 | 21 |
| all others | unchanged | unchanged |

Entries 1–12 and 22–30 are identical in both orders.

### 7.3 What §4 and §5 of this manifest still govern

Unchanged by the experiment and re-verified in the rendered DOM:

- **§4 anchor↔slot mapping** — 7 anchors, 20 slots placed (19 inline + 1 sticky), `hp_video` still
  recorded as defined-but-unmapped. Placement now resolves by `anchorId`, not by sequence position,
  so content movement cannot detach a slot from its anchor.
- **§5 protected task zones** — unchanged. The reorder introduced no advertisement into any tier-0
  zone.

### 7.4 Data-authenticity changes recorded against §2 rows

Three §2 rows describe a preview action that LRG-UI-011 tightened, because the underlying fixture is
declared illustrative (`home-page-sample.json` `_meta.illustrative: true`, with only `featureGames`
carrying real source-xml values):

| Row | §2 preview action | What now renders | Why |
|---|---|---|---|
| **H-10** Community Live | labelled preview state | **Truthful empty state** — "No recent community discussions yet", plus a description of what the forum will carry | Confirmed: the production schema (`04-sample-data/reference-tables/schema-only.sql`) has `blog_entry` and `news_entry` but **no forum, thread, post or reply table**, and no fixture carries community activity. Nothing genuine exists to show |
| **H-11** News and Stories | transformed fixture | **Truthful "no verified lottery news right now"**, followed by the one **evergreen item labelled `Guide`**. The two synthetic current-news claims in `liveNews` are **not rendered** | Presenting an unsourced jackpot-movement headline as news would be inventing current news |
| **H-14** Return and Distribution | labelled preview state | **"LotteryCorner video updates are coming soon"**, plus the **real** channels named as text (YouTube, X, Facebook, Instagram) | No genuine video metadata exists. The channels themselves are production-evidenced — `04-sample-data/footer-config.json` (transcribed from `footerbar_upgrade_as.jspf`) and the legacy templates for `youtube.com/@Lotterycorner` — so naming them states a fact rather than fabricating one. Nothing is embedded and nothing links out |

### 7.5 Presentation grouping

H-10, H-11 and H-14 render inside one shared visual wrapper headed
**"What's Happening at LotteryCorner"**. That heading is a **presentation label only**: it has no
BP-02 section ID, no `data-section-id`, and is not a landmark. Each of the three keeps its own
`<section id="H-…">` element and remains separately identifiable in the DOM.

---

## 8. Preview Order Reconciliation — round 2 (LRG-UI-012 engagement experiment)

**Added:** July 26, 2026 · **Status:** FOUNDER-AUTHORIZED PREVIEW EXPERIMENT, pending visual review
**Governing record:** `03-docs/08-decisions/home-engagement-order-preview-experiment.md`, Round 2

§2 remains the verbatim BP-02 v1.1 §12 transcription and is **not** edited. §7 recorded round 1. This
section records round 2, which supersedes §7's positions where they differ.

### 8.1 Order difference from the blueprint

| Section | BP-02 §12 | Round 1 | **Round 2 (current)** |
|---|---|---|---|
| H-10 Community Live | 19 | 13 | **10** |
| H-06A Live and Recently Completed Draws | 10 | 10 | **11** |
| H-06B Tonight and Upcoming Draws | 11 | 11 | **12** |
| AD-H03 Post-Live-Draw Advertisement | 12 | 12 | **13** |
| H-11 News and Stories | 21 | 14 | 14 |
| H-14 Return and Distribution | 25 | 15 | 15 |
| H-07 · H-08 · H-09 · H-09A · H-09B | 13–17 | 16–20 | 16–20 |
| AD-H04 | 18 | 21 | 21 |
| all others | unchanged | unchanged | unchanged |

Entries 1–9 and 22–30 are identical in all three orders. **H-10 appears exactly once** — it was
removed from the round-1 three-item wrapper, not duplicated.

### 8.2 Presentation grouping after round 2

| Wrapper | Members | Label |
|---|---|---|
| *(none)* | **H-10** | Stands alone as its own Community band directly under H-05 |
| Two-item band | **H-11**, **H-14** | **"Latest from LotteryCorner"** — renamed from "What's Happening at LotteryCorner", which no longer described the contents |

Neither wrapper has a governed section ID, a `data-section-id` or a landmark role.

### 8.2a Anchor slot composition corrected (LRG-ADS-015)

Anchor **identities and positions are unchanged**; their slot composition changed when the advertising
baseline was set to 15 active placements:

| Anchor | Before | After |
|---|---|---|
| AD-H01 | `hp_mid_leaderboard` at all widths | same slot, **≥992 px only** (legacy behaviour restored) |
| AD-H02 | inline + 1 mobile snippet | inline only — the mobile snippet is a disabled candidate |
| AD-H03 | inline + 1 mobile snippet | inline only |
| AD-H04 | `pos2` + `billboard_pos2` + 1 mobile snippet | **`pos2` + `pos3`** |
| AD-H05 | `pos3` + `billboard_pos3` + `pos4` + 4 rail + 1 mobile snippet | **`billboard_pos2` + `billboard_pos3`** + 4 rail |

`hp_video` is retired and `hp_mid_large_leaderboard_pos4` plus the four mobile snippets are disabled
candidates. All seven anchors retain at least one active placement. See
`03-docs/05-advertising/home-ad-inventory-reconciliation.md` §8.

### 8.3 Anchor positions — and the guard that caught the drift

`AD-H03` moved **12 → 13** because H-10 was inserted before it. No anchor changed position relative to
any other anchor, and no slot moved between anchors.

The documented positions in `lib/layout/adAnchors.ts` are asserted against the rendered sequence at
build time. Round 2 **failed the build** until the documented position was corrected — which is the
guard working as designed. Placement itself resolves by `anchorId`, never by sequence number, so no
slot was at risk.

### 8.4 New rows to read alongside §2

Two §2 rows now render materially more than the manifest describes:

| Row | §2 preview action | What now renders |
|---|---|---|
| **H-02A** Featured National Games | IMPLEMENT WITH CURRENT DATA | Plus a compact **AI Draw Analysis** block per flagship card and a local analysis panel. Every figure is computed locally from draws in the repository; **the visible analysis basis states the sample size**. See `home-preview-historical-data-inventory.md` — there is one draw per game, so cross-draw metrics report what they need instead of being invented |
| **H-05** LotteryCorner AI | IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE | Restructured to one featured capability, five compact capability links and one contextual action, with the AI mark for identity. The odds statement stays visible for the entertainment-only generator only |

Contextual AI actions were added to **H-02A, H-03, H-04, H-06A, H-06B, H-07, H-08, H-09, H-09A and
H-11A** — ten of twenty-three sections. They are deliberately absent from H-11 (no genuine article
exists to summarise) and from H-12 (commerce, kept separate from AI).

---

## 9. Final-state presentation note (LRG-UI-013)

**Added:** July 26, 2026 · **Status:** design validation, pending founder review

The section **order** is unchanged from §8 (round 2). What changed is presentation, and two §2 rows now
render materially differently from what the manifest describes:

| Row | §2 preview action | What now renders in final-state mode |
|---|---|---|
| **H-10** Community Live | IMPLEMENT AS CLEARLY LABELLED PREVIEW STATE | One lead plus two supporting **fabricated** discussions with forum, reply count, latest activity and an initials avatar. **See the recorded conflict in the founder-review record §9.1** — this contradicts Constitution §17 and is followed on tier-1 founder instruction |
| **H-11** News and Stories · **H-14** Return and Distribution | IMPLEMENT WITH TRANSFORMED FIXTURE / LABELLED PREVIEW STATE | A filled editorial band: lead story, secondary card, media card. Also **fabricated** — same recorded conflict |

Also changed, without affecting order or inventory:

- **No visible status labelling** in the default view. `LC_HOME_PREVIEW_DEBUG=true` restores it. The
  `assertProvenanceLabels` build check still requires a label to exist on every synthetic section —
  debug only decides whether it is drawn.
- **Expanding panels became overlays.** Every featured-card panel is portalled to `document.body`, so
  §2's sections contribute their own heights only; nothing inside H-02A can stretch a sibling card.
- **H-04, H-09, H-12, H-13, H-14A** render completed-looking controls instead of unavailable states.
  No route was created: unbuilt destinations are `<button type="button">`, which cannot 404.

§4 (anchor↔slot mapping) and §5 (protected task zones) are unchanged and re-verified: 7 anchors, 20
slots, `hp_video` still recorded as defined-but-unmapped, no advertisement in any tier-0 zone.

---

## 10. Content-module responsibilities — final (LRG-UI-014)

**Added:** July 26, 2026 · **Status:** locked alongside the order

Several sections had overlapping remits, which is why the page felt repetitive. Every governed section
ID is **retained**; what follows fixes each one's single responsibility so no two compete.

| Section ID | Section title as rendered | Sole responsibility | Explicitly NOT its job |
|---|---|---|---|
| **H-02B** | Top Jackpots Right Now | **Current** jackpot comparison across games | Movement over time — that is H-09B |
| **H-09B** | **Jackpot Trends & History** *(reframed)* | Jackpot **movement and history** | Today's comparison — that is H-02B |
| **H-11** + **H-14** | Latest from LotteryCorner | Lead editorial + supporting news + video/social, as one band | Time-sensitive alerts — that is H-08 |
| **H-08** | Lottery News & Alerts | **Time-sensitive** updates only | Evergreen explainers — that is H-11A |
| **H-10A** | Winners and Claim Stories | Genuine winner and claim stories, **conditional on real data** | Any fabricated or illustrative winner |
| **H-11A** | Lottery Blog & Guides | **Evergreen educational** content | Anything dated as news |
| **H-07** | Find Your State Lottery | **Primary** state discovery, with context | Being an A–Z list — that is H-14B |
| **H-14B** | Browse Results by State | Compact **A–Z directory** for crawlability | Duplicating H-07's introduction (its intro was dropped in LRG-UI-011) |
| **H-09A** | Most Popular Games | Game **discovery** | The play workflow — that is H-12 |
| **H-12** | Play Your Favorite Games | The **state / game / play-method** workflow | Game discovery — that is H-09A |

### Reframing note for H-09B

The fixture heading is *"Jackpot Snapshot & Comparison"*, which read as a near-duplicate of H-02B
*"Top Jackpots Right Now"*. The rendered heading is now **"Jackpot Trends & History"**. The governed
section ID `H-09B` and its BP-02 §12 position are unchanged; only the visible framing moved, and
`04-sample-data/home-page-sample.json` was **not** modified.
