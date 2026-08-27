# Home Advertising Inventory — Legacy ↔ New Reconciliation

**Document type:** Advertising audit
**Record ID:** HOME-ADS-001
**Recorded by:** Task LRG-UI-014
**Date:** July 26, 2026
**Status:** **RESOLVED — founder decisions applied by LRG-ADS-015 (see §8)**
**Active baseline:** **15 ACTIVE EXISTING LEGACY PLACEMENTS** · `hp_video` retired · 8 non-active records
**Method:** proved from legacy source, not inferred from any prior implementation report

---

## 0. Method, and a correction to how this was verified

Every fact below was extracted from the legacy template by reading the file, not by trusting an
earlier summary.

**A tooling correction worth recording.** The first two `grep` sweeps of the legacy tree returned
*contradictory* results for the same pattern — one said the Home div IDs did not exist anywhere, the
next said they existed in six files. Cause: the interactive shell's `grep` is shadowed by `ugrep`,
which applies different defaults from the `grep` a subprocess resolves through `PATH`. Both were
discarded and the audit was redone with a **pure-Python scan** over all 308 text files in
`00-reference-existing-project/LotteryCorner40/WebContent`, which is reproducible and has no aliasing.

An interim hypothesis that `homePageSlots` had been fabricated from result-page slots was **wrong** and
is withdrawn. The Home slots are genuine.

**Legacy source of record:** `WEB-INF/upgrade/index_upgrade_as.jsp` (3 435 lines,
`<link rel="canonical" href="https://lotterycorner.com/">` — confirming it is Home).
Two further variants exist and are **not** the production Home: `index_upgrade_as_special.jsp` and
`index_upgrade_as_lazy_testing.jsp` (same 21 slots), plus `index_upgrade.jsp`, which contains **no ad
markup at all**.

**Provenance note:** `ad-slot-definitions.json` `_meta.purpose` states slots were taken from
`lottery-result_upgrade_as.jsp`. That is accurate for the *state/result* slot families and for the
schema, but **not** for `homePageSlots` — those trace to `index_upgrade_as.jsp`. The comment should be
corrected in a data task.

---

## 1. Verified totals

Counted from source, each total stated separately as required.

| Total | Count | Basis |
|---|---:|---|
| **Legacy unique slots DEFINED on Home** | **21** | 21 `googletag.defineSlot()` calls, `index_upgrade_as.jsp` L184–L204 |
| **Legacy slots actually RENDERED in the Home body** | **16** | 16 distinct `div-gpt-ad-*` elements after `<body>`; **no div renders twice** |
| **Legacy defined but NOT rendered on Home** | **5** | `hp_mid_large_leaderboard_pos4` + `hp_mobile_leaderboard_pos1…4` |
| **Legacy responsive size-mapping variants** | **6 named mappings** | `horizontalheader`, `horizontalAds`, `horizontalAds1`, `horizontalAds2`, `verticalAds`, `verticalAds1` — all two-tier at the **992 px** breakpoint. `horizontalAds1` is declared **twice**, identically |
| **Legacy slots with no size mapping** | **1** | `hp_video` — fixed `[300,168]`, no `defineSizeMapping` |
| **Legacy desktop-only (rendered)** | **1** | `hp_mid_leaderboard`, via wrapper `.mobi-ads0 { display:none !important }` at ≤991 px |
| **Legacy mobile-only (rendered)** | **0** | No rendered Home slot is hidden at ≥992 px |
| **Legacy sticky slots** | **1** | `hp_bottom_large_leaderboard_sticky` inside `#stickyAd` |
| **New-page slots currently rendered** | **20** | 19 inline/rail + 1 sticky |
| **New-page anchors** | **7** | AD-H00 … AD-H06 |
| **New-page right-rail slots** | **6** | `hp_side_halfpage_pos1/2/3/4`, `hp_side_mpu`, `hp_side_mpu_pos1` |
| **New-page inline slots** | **9** | at all widths |
| **New-page mobile-only slots** | **4** | `hp_mobile_leaderboard_pos1…4` |
| **New-page unmapped definitions** | **1** | `hp_video` |

### The headline discrepancy

> **Legacy Home renders 16 slots. The new Home renders 20.**
>
> The new page places 5 slots the legacy Home never rendered (`hp_mid_large_leaderboard_pos4` and the
> four `hp_mobile_leaderboard_*`), and omits 1 the legacy Home does render (`hp_video`).
> 16 − 1 + 5 = 20.

Neither direction is a defect on its own — the mobile slots *are* defined on Home, and `hp_video` *is*
rendered on Home — but both were previously recorded the other way round, and both need an ad-ops
decision. See §5.

---

## 2. Legacy size mappings — verbatim

All two-tier, breakpoint **992 px**. This is the origin of the single named 992 px threshold (DS-20).

| Mapping | ≥992 px | <992 px |
|---|---|---|
| `horizontalheader` | `[[728,90]]` | `[[320,50]]` |
| `horizontalAds` | `[[728,90]]` | `[[336,280],[320,50],[300,250],[320,100]]` |
| `horizontalAds1` | `[[728,90],[970,250]]` | `[[336,280],[300,250],[320,100]]` |
| `horizontalAds2` | `[[728,90],[970,250]]` | `[[320,50],[320,100]]` |
| `verticalAds` | `[[160,600],[300,600],[300,250]]` | `[[336,280],[300,250],[320,50]]` |
| `verticalAds1` | `[[300,250]]` | `[[336,280],[300,250],[320,100],[320,50]]` |

**Note on `horizontalAds2`:** the four mobile leaderboards use it, and its ≥992 tier serves
`728×90` / `970×250` — i.e. the mapping is *not* mobile-restricted even though the slot name and GAM
path say `320x50_mobile_leaderboard`. Treating these as mobile-only is a **new-implementation choice**,
not a legacy rule.

**Legacy mobile height overrides** (≤991 px, from the page's own CSS): `.mobi-ads0` `display:none` ·
`.mobi-ads9` 170 px · `.mobi-ads` 280 px · `.mobi-ads2`/`.mobi-ads5` 288 px · `.mobi-ads3` 100 px ·
`.mobi-ads4` 250 px · `.mobi-ads8` 250 px. `.desktop-ads` and `.mobile-ads` are **cosmetic only**
(`text-align`, `width`) and hide nothing.

---

## 3. Sticky behaviour — verbatim

```
#stickyAd, #stickyAd:before { position: fixed; bottom: 0; width: 100% !important;
                              height: auto; padding: 10px;
                              background-color: rgba(255,255,255,.5); text-align: center }
```

- Wrapper `<div id="stickyAd">` at L3366, containing `<button id="closeAdButton">` (a red `fa-times`).
- Close handler (L3421): sets `stickyAd.style.display="none"` **and writes a `hideAd=true` cookie**.
  An expiry one hour ahead is computed — but it is **never attached to the cookie string**, so the
  cookie is a session cookie in practice. This looks like a production bug and is recorded, not copied.
- On load (L3420) the sticky is shown only when `hideAd !== 'true'`.
- Slot div carries `class="mobi-ads10 desk-ads lazy-ad"` and `min-width:320px; min-height:50px`.
- **No bottom navigation exists in the legacy Home**, so the legacy sticky has no competing layer.
  The new Home's sticky-above-bottom-nav rule (DS-28) is a new-implementation requirement.

**Lazy loading:** `.lazy-ad` is collected by `document.querySelectorAll('.lazy-ad')` (L214) — 10 of the
16 rendered slots carry it. `hp_video`, `hp_side_halfpage_pos1/2`, `hp_mid_large_leaderboard_pos1`,
`hp_mid_billboard_pos3` and the sticky wrapper do not.

---

## 4. Per-slot reconciliation

Legacy source path for every row: `WEB-INF/upgrade/index_upgrade_as.jsp`.
"Legacy L" = body line where the div renders. GAM network is `21828142944` throughout.

| # | Legacy slot key | Legacy div ID | GAM unit path (suffix) | Legacy declared sizes | Mapping ≥992 / <992 | Legacy reserved | Legacy L / page position | Legacy visibility | New anchor | New component ID | Sticky | New visibility | Status | Production geometry result | Action required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `hp_top_billboard` | `div-gpt-ad-1694691105444-0` | `LC_hp_display_web_top_billboard` | 320×50, 728×90 | 728×90 / 320×50 | 320×50 | L263 — top, after header | all widths | **AD-H00** | `data-slot-key=hp_top_billboard` | no | all widths | **EXISTING** | drawn 50 mob / 90 desk = reserved | none |
| 2 | `hp_mid_leaderboard` | `div-gpt-ad-1694691723384-0` | `lc_hp_display_web_mid_leaderboard` | 728×90, 320×100 | 728×90 / 336×280,320×50,300×250,320×100 | 320×90 | L607 — after first result block | **DESKTOP ONLY** (`.mobi-ads0`) | **AD-H01** inline | same | no | **all widths** | **EXISTING — visibility differs** | drawn 280 mob / 90 desk | **Decide:** restore desktop-only, or accept new mobile exposure |
| 3 | `hp_video` | `div-gpt-ad-1715268442152-0` | `LC_ATV_video_player` | 300×168 fixed | **no mapping** | 300×168 | L614 — immediately after #2 | all widths (170 px ≤991) | **none** | — | no | not rendered | **MISSING** | not placed | **Decide:** place at AD-H01, or confirm retired |
| 4 | `hp_side_halfpage_pos1` | `div-gpt-ad-1694690716926-0` | `lc_hp_display_web_side_halfpage_pos1` | 336×288, 300×600 | 160×600,300×600,300×250 / 336×280,300×250,320×50 | 300×288 | L877 — right column, upper | all widths | **AD-H01** rail | same | no | ≥992 only | **RELOCATED** | 280 mob / 600 desk | Confirm rail-only is acceptable |
| 5 | `hp_mid_large_leaderboard_pos1` | `div-gpt-ad-1694708847897-0` | `…mid_large_leaderboard_pos1` | 336×280, 728×90, 970×90 | 728×90 / 336×280,320×50,300×250,320×100 | 336×90 | L1424 — mid content | all widths | **AD-H02** inline | same | no | all widths | **EXISTING** | 280 / 90 | none |
| 6 | `hp_mid_billboard_pos1` | `div-gpt-ad-1694708721384-0` | `…mid_billboard_pos1` | 336×280, 970×90, 728×90, 970×250 | 728×90,970×250 / 336×280,300×250,320×100 | 336×90 | L1908 — `.c-section` | all widths | **AD-H03** inline | same | no | all widths | **EXISTING** | 280 / 250 | none |
| 7 | `hp_side_halfpage_pos3` | `div-gpt-ad-1696347663152-0` | `…side_halfpage_pos3` | 300×250, 160×600, 300×600 | verticalAds | 160×250 | L2000 — right column | all widths | **AD-H05** rail | same | no | ≥992 only | **RELOCATED** | 280 / 600 | Confirm rail-only |
| 8 | `hp_side_mpu_pos1` | `div-gpt-ad-1696598357091-0` | `…side_MPU_pos1` | 300×600, 300×250 | verticalAds | 300×250 | L2277 — `col-12 col-lg-4` | all widths | **AD-H05** rail | same | no | ≥992 only | **RELOCATED** | 280 / 600 | Confirm rail-only |
| 9 | `hp_mid_large_leaderboard_pos2` | `div-gpt-ad-1694709039320-0` | `…mid_large_leaderboard_pos2` | 728×90, 336×280, 970×90 | horizontalAds | 336×90 (288 ≤991) | L2355 | all widths | **AD-H04** inline | same | no | all widths | **EXISTING** | 280 / 90 | none |
| 10 | `hp_mid_large_leaderboard_pos3` | `div-gpt-ad-1694709114849-0` | `…mid_large_leaderboard_pos3` | 336×280, 728×90, 970×90 | horizontalAds | 336×90 (288 ≤991) | L2425 | all widths | **AD-H05** inline | same | no | all widths | **EXISTING** | 280 / 90 | none |
| 11 | `hp_mid_billboard_pos2` | `div-gpt-ad-1694709237082-0` | `…mid_billboard_pos2` | 336×280, 970×250, 728×90, 970×90 | horizontalAds1 | 336×90 (288 ≤991) | L2495 | all widths | **AD-H04** inline | same | no | all widths | **EXISTING** | 280 / 250 | none |
| 12 | `hp_side_halfpage_pos4` | `div-gpt-ad-1696348050684-0` | `…side_halfpage_pos4` | 300×250, 160×600, 300×600 | verticalAds | 160×600 | L2766 — `col-12 col-lg-3` | all widths | **AD-H05** rail | same | no | ≥992 only | **RELOCATED** | 280 / 600 | Confirm rail-only |
| 13 | `hp_side_mpu` | `div-gpt-ad-1694709311530-0` | `…side_MPU` | 300×250, 336×280 | 300×250 / 336×280,300×250,320×100,320×50 | 300×250 | L3098 — `col-12 col-lg-4`, after "Lottery Post Pandemic" | all widths | **AD-H01** rail | same | no | ≥992 only | **RELOCATED** | 280 / 250 | Confirm rail-only |
| 14 | `hp_mid_billboard_pos3` | `div-gpt-ad-1694709361130-0` | `…mid_billboard_pos3` | 336×280, 728×90, 970×250, 970×90 | horizontalAds1 | 336×250 | L3208 — lower content | all widths | **AD-H05** inline | same | no | all widths | **EXISTING** | 280 / 250 | none |
| 15 | `hp_side_halfpage_pos2` | `div-gpt-ad-1694709543711-0` | `…side_halfpage_pos2` | 300×600, 336×280 | verticalAds | 300×280 | L3346 — `col-12 col-lg-6 ads-mobile` | all widths | **AD-H05** rail | same | no | ≥992 only | **RELOCATED** | 600 / 600 | Confirm rail-only |
| 16 | `hp_bottom_large_leaderboard_sticky` | `div-gpt-ad-1694709627267-0` | `…bottom_large_leaderboard_sticky` | 728×90, 320×50 | horizontalAds | 320×50 | L3376 — inside `#stickyAd` | all widths, fixed bottom | **AD-H06** | `data-slot-keys` on StickyStack | **yes** | all widths | **EXISTING** | reserved 56 px — **asserts no production height** (DS-26/DS-34 open) | Ad ops to set the production creative height |
| 17 | `hp_mid_large_leaderboard_pos4` | `div-gpt-ad-1696347916722-0` | `…mid_large_leaderboard_pos4` | 728×90, 970×90, 336×280 | horizontalAds | — | **defined L196, never rendered** | n/a | **AD-H05** inline | same | no | all widths | **NEW PLACEMENT of a defined slot** | 280 / 90 | **Decide:** keep the new placement, or remove to match legacy |
| 18 | `hp_mobile_leaderboard_pos1` | `div-gpt-ad-1707413795676-0` | `lc_mgp_snippet_display_web_320x50_mobile_leaderboard_pos1` | 320×50 | horizontalAds2 | — | **defined L200, never rendered** | n/a | **AD-H02** mobile | same | no | <992 only | **NEW PLACEMENT of a defined slot** | 100 / 250 | **Decide** — see §5.2 |
| 19 | `hp_mobile_leaderboard_pos2` | `div-gpt-ad-1707413859823-0` | `…mobile_leaderboard_pos2` | 320×50 | horizontalAds2 | — | **defined L201, never rendered** | n/a | **AD-H03** mobile | same | no | <992 only | **NEW PLACEMENT of a defined slot** | 100 / 250 | **Decide** |
| 20 | `hp_mobile_leaderboard_pos3` | `div-gpt-ad-1707413940026-0` | `…mobile_leaderboard_pos3` | 320×50 | horizontalAds2 | — | **defined L202, never rendered** | n/a | **AD-H04** mobile | same | no | <992 only | **NEW PLACEMENT of a defined slot** | 100 / 250 | **Decide** |
| 21 | `hp_mobile_leaderboard_pos4` | `div-gpt-ad-1707414004765-0` | `…mobile_leaderboard_pos4` | 320×50 | horizontalAds2 | — | **defined L203, never rendered** | n/a | **AD-H05** mobile | same | no | <992 only | **NEW PLACEMENT of a defined slot** | 100 / 250 | **Decide** |
| 22 | `NEW-H-ENGAGEMENT-01` | — | **none — do not assign** | — | — | — | n/a | n/a | after *Latest from LotteryCorner* | `data-candidate-id` | no | disabled | **NEW CANDIDATE — DISABLED** | not rendered | Ad-ops approval |
| 23 | `NEW-H-GUIDES-01` | — | **none — do not assign** | — | — | — | n/a | n/a | after *Lottery Blog & Guides* | `data-candidate-id` | no | disabled | **NEW CANDIDATE — DISABLED** | not rendered | Ad-ops approval |

**DUPLICATED:** none. No legacy div renders twice on Home, and no new-page slot key is placed twice.

---

## 5. Discrepancies requiring an ad-operations decision

### 5.1 `hp_video` is rendered on legacy Home but missing from the new Home — MISSING

Every previous record described `hp_video` as "defined but unreferenced". **That is wrong.** It renders
at L614, immediately after `hp_mid_leaderboard`, wrapped in `desk-ads0 mobi-ads9 lazy-ad`, reserving
300×168 (170 px at ≤991). It is the only Home slot with **no size mapping**.

Action: place it at **AD-H01**, matching its legacy position, or confirm with ad ops that it is retired.
Until then it remains recorded as unmapped in code so it cannot be silently forgotten.

### 5.2 Four mobile leaderboards are placed on the new Home but never rendered on legacy Home

They are genuinely **defined** on Home (L200–L203), so they are inventory. But:
- their GAM paths are `lc_mgp_snippet_*`, not `lc_hp_*` — a different page family;
- their `horizontalAds2` mapping serves 728×90 / 970×250 at ≥992, so "mobile-only" is a
  new-implementation restriction, not a legacy rule;
- they render on 15 other legacy templates, so they are live inventory elsewhere.

Action: ad ops to confirm whether Home should serve them. If yes, the `<992` restriction needs
justifying against `horizontalAds2`.

### 5.3 `hp_mid_large_leaderboard_pos4` is placed but never rendered on legacy Home

Defined at L196, absent from the body. The new Home places it at AD-H05, which is what creates the
lower three-stack — see §6.

### 5.4 `hp_mid_leaderboard` visibility inverted

Legacy: **desktop-only** (`.mobi-ads0 { display:none !important }` at ≤991). New: all widths. This
*increases* mobile ad density, which CLAUDE.md §12 lists among prohibited experiences when excessive.

---

## 6. Lower-ad-stack finding — three consecutive advertisements before Trust and Support

**Question:** are the three lower ads distinct placements, responsive variants, fallbacks,
mobile/desktop alternates, or accidental duplicate rendering?

**Answer: accidental duplicate rendering, introduced by the new implementation's anchor grouping.**

AD-H05's inline group holds three slot keys, rendered consecutively:

| Slot | Legacy body line | Legacy neighbour context |
|---|---|---|
| `hp_mid_large_leaderboard_pos3` | L2425 | mid-page, after a section header |
| `hp_mid_billboard_pos3` | L3208 | lower content, ~783 lines later |
| `hp_mid_large_leaderboard_pos4` | **never rendered** | — |

Evidence that this is not a production pattern:

1. The two that do render are **~780 lines and several sections apart** in legacy — they were never
   adjacent.
2. The third **does not render on legacy Home at all.**
3. They are **not responsive variants**: `mid_large_leaderboard_pos3`/`pos4` use `horizontalAds`,
   `mid_billboard_pos3` uses `horizontalAds1` — different mappings, and all three serve at both tiers.
4. They are **not mobile/desktop alternates**: all three are all-widths in legacy.
5. They are **not fallbacks**: `collapseIfEmpty` is false throughout; each is an independent unit.

**Cause:** `lib/layout/adAnchors.ts` assigned three slot keys to one `AD-H05` inline group in
LRG-UI-008, and the renderer draws every key in a group consecutively.

**Recommended fix — not applied in this task**, because CLAUDE.md §12 forbids moving or reordering a
slot without explicit founder approval and §"Lower-ad-stack investigation" says not to change them
without evidence. The evidence is now recorded; the change needs approval:

> Split AD-H05's inline group so `hp_mid_large_leaderboard_pos3` sits at its legacy mid-page position
> and `hp_mid_billboard_pos3` stays lower, and decide §5.3 for `pos4`.

---

## 7. What this task did NOT change

- No slot ID, GAM unit path, size map, dimension, count or anchor assignment was altered.
- `04-sample-data/ad-slot-definitions.json` was **not modified** — the existing schema has no
  candidate shape that works without a production unit path, so the two candidates live in this
  document and in the code-local preview registry, exactly as the task's fallback instructs.
- The two candidates are **disabled** and are excluded from every active count.

---

# 8. FOUNDER DECISION — Home advertising baseline (LRG-ADS-015)

**Date:** July 26, 2026 · **Status:** **APPLIED**
**Supersedes** the "action required" column of §4 and the four open discrepancies of §5.

## 8.1 The decision

| Statement | Detail |
|---|---|
| The legacy Home rendered **16** placements | Proved in §1 from `index_upgrade_as.jsp` |
| **`hp_video` is intentionally retired** | The former video/commercial relationship is no longer active |
| **Founder-approved active baseline: 15** | An intentional, authorised exception to strict legacy parity |
| **No automatic replacement is approved** | Nothing may be added merely to restore the count to 16 |
| **Five implementation additions are disabled** | Four `lc_mgp_snippet_*` mobile placements + `hp_mid_large_leaderboard_pos4` |
| **Two strategic additions remain disabled** | `NEW-H-ENGAGEMENT-01`, `NEW-H-GUIDES-01` |
| **The lower stack is corrected** | See §8.5 |
| **`hp_mid_leaderboard` desktop-only behaviour is restored** | See §8.4 |

> The active count **must not** be reported as 16 after this task. It is **15**.

## 8.2 Final inventory classification

| Classification | Count |
|---|---:|
| **ACTIVE EXISTING LEGACY PLACEMENTS** | **15** |
| RETIRED LEGACY PLACEMENTS | **1** (`hp_video`) |
| DISABLED IMPLEMENTATION CANDIDATES | **5** |
| DISABLED STRATEGIC CANDIDATES | **2** |
| **Total active** | **15** |
| **Total disabled / non-active** | **8** |

The retired placement is counted **separately** from the seven candidates — it is a real legacy
placement being withdrawn, not a proposal awaiting approval.

These four numbers are **derived in code**, not transcribed: `HOME_AD_ACCOUNTING` in
`lib/layout/adAnchors.ts`, with `assertHomeAdBaseline()` throwing at render if the shape ever changes.
The page also publishes them as `data-ad-active` / `data-ad-retired` /
`data-ad-candidates-implementation` / `data-ad-candidates-strategic`, so the document and the page
cannot drift apart.

## 8.3 The 15 active placements

| # | Slot key | Legacy div ID | Anchor | Sub-position | Visibility | Legacy L |
|---|---|---|---|---|---|---|
| 1 | `hp_top_billboard` | `div-gpt-ad-1694691105444-0` | AD-H00 | inline | all widths | 263 |
| 2 | `hp_mid_leaderboard` | `div-gpt-ad-1694691723384-0` | AD-H01 | inline | **≥992 only** | 607 |
| 3 | `hp_side_halfpage_pos1` | `div-gpt-ad-1694690716926-0` | AD-H01 | rail | ≥992 only | 877 |
| 4 | `hp_side_mpu` | `div-gpt-ad-1694709311530-0` | AD-H01 | rail | ≥992 only | 3098 |
| 5 | `hp_mid_large_leaderboard_pos1` | `div-gpt-ad-1694708847897-0` | AD-H02 | inline | all widths | 1424 |
| 6 | `hp_mid_billboard_pos1` | `div-gpt-ad-1694708721384-0` | AD-H03 | inline | all widths | 1908 |
| 7 | `hp_mid_large_leaderboard_pos2` | `div-gpt-ad-1694709039320-0` | AD-H04 | inline | all widths | 2355 |
| 8 | `hp_mid_large_leaderboard_pos3` | `div-gpt-ad-1694709114849-0` | AD-H04 | inline | all widths | 2425 |
| 9 | `hp_mid_billboard_pos2` | `div-gpt-ad-1694709237082-0` | AD-H05 | inline | all widths | 2495 |
| 10 | `hp_mid_billboard_pos3` | `div-gpt-ad-1694709361130-0` | AD-H05 | inline | all widths | 3208 |
| 11 | `hp_side_halfpage_pos2` | `div-gpt-ad-1694709543711-0` | AD-H05 | rail | ≥992 only | 3346 |
| 12 | `hp_side_mpu_pos1` | `div-gpt-ad-1696598357091-0` | AD-H05 | rail | ≥992 only | 2277 |
| 13 | `hp_side_halfpage_pos3` | `div-gpt-ad-1696347663152-0` | AD-H05 | rail | ≥992 only | 2000 |
| 14 | `hp_side_halfpage_pos4` | `div-gpt-ad-1696348050684-0` | AD-H05 | rail | ≥992 only | 2766 |
| 15 | `hp_bottom_large_leaderboard_sticky` | `div-gpt-ad-1694709627267-0` | AD-H06 | **sticky** | all widths | 3376 |

GAM unit paths, size mappings and identities for all 15 are **unchanged** — see §4 for the full
per-slot detail, which remains accurate for these rows.

## 8.4 `hp_mid_leaderboard` — responsive visibility restored

| | Legacy | Before this task | **Now** |
|---|---|---|---|
| <992 px | hidden (`.mobi-ads0 { display:none !important }`) | visible | **hidden** |
| ≥992 px | visible | visible | **visible** |

Implemented as `visibility: "gte-992"` on the AD-H01 inline group, with a `.lcp-ad-desktop` gate at
the same 992 px threshold the legacy size mappings use. **No added mobile impression opportunity.**
GAM unit path, size mapping and slot identity are untouched.

## 8.5 Lower-page stack — resolved

**Former grouped position:** AD-H05 inline held three keys drawn consecutively —
`hp_mid_large_leaderboard_pos3` + `hp_mid_billboard_pos3` + `hp_mid_large_leaderboard_pos4`.

**Decisive legacy evidence.** Every legacy inline placement is separated by a real content block; the
legacy Home never renders two advertisements back to back:

| From → To | Gap | Content between |
|---|---|---|
| `billboard_pos1` (1908) → `large_lb_pos2` (2355) | 447 lines, ~438 words | Predictions · Systems · Powerball Jackpot History |
| `large_lb_pos2` (2355) → `large_lb_pos3` (2425) | 70 lines, ~77 words | **Top Jackpots Comparision** |
| `large_lb_pos3` (2425) → `billboard_pos2` (2495) | 70 lines, ~106 words | **Mega Millions Jackpot History** |
| `billboard_pos2` (2495) → `billboard_pos3` (3208) | 713 lines, ~402 words | Insider · Jackpots · Members · Post Pandemic |

**Corrected anchors.** `pos2` and `pos3` are legacy's tightest pair (70 lines), so they stay together
at **AD-H04**, which follows the jackpot-history content in the new sequence — the same content
adjacency legacy had. `billboard_pos2` moves down to join `billboard_pos3` at **AD-H05**.

| Anchor | Active inline slots |
|---|---:|
| AD-H00 | 1 |
| AD-H01 | 1 (desktop-only) |
| AD-H02 | 1 |
| AD-H03 | 1 |
| AD-H04 | 2 |
| AD-H05 | 2 |
| AD-H06 | 1 sticky |

**Resulting spacing:** maximum **2** consecutive active advertisements anywhere, verified at all six
widths. The three-stack before Trust and Support is gone.

**Recorded limitation, not a design choice.** Two anchors carry two placements because there are **8
active inline placements and only 6 inline-capable governed anchors**. That is arithmetic. Reaching
one-per-anchor — which is what legacy does — would need an additional governed anchor, and adding one
requires a blueprint amendment. Flagged in §9 below.

**No `hp_video` was inserted anywhere in this sequence,** and no genuine placement was moved merely to
populate an anchor.

## 8.6 Empty governed anchors

**None.** All seven anchors retain at least one active placement after the corrections, so no anchor
renders an empty container and none needed the `NO ACTIVE AD PLACEMENT` debug state. The handling
exists and is exercised by the renderer's `data-ad-active-placement` attribute, which reports `true`
for all seven today.

## 8.7 Placement counts by viewport

Measured in the browser, not calculated. A responsive size variant is **not** counted as a separate
placement.

| Width | Active inline | Active rail | Active sticky | **Total visible** | Desktop-only hidden | Mobile-visible | Retired | Disabled candidates |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 375 px | 7 | 0 | 1 | **8** | 1 (`hp_mid_leaderboard`) | 8 | 0 | 0 |
| 768 px | 7 | 0 | 1 | **8** | 1 | 8 | 0 | 0 |
| 991 px | 7 | 0 | 1 | **8** | 1 | 8 | 0 | 0 |
| 992 px | 8 | 6 | 1 | **15** | 0 | — | 0 | 0 |
| 1024 px | 8 | 6 | 1 | **15** | 0 | — | 0 | 0 |
| 1440 px | 8 | 6 | 1 | **15** | 0 | — | 0 | 0 |

**991 → 992 transition:** 8 → 15. The jump is entirely the contextual rail appearing plus
`hp_mid_leaderboard` becoming visible. **No inventory gap:** with the mobile-snippet placements now
disabled, no slot is hidden by both a lower and an upper bound, so there is no width band in which a
placement disappears. This now matches legacy exactly — legacy had **0** mobile-only and **1**
desktop-only placement.

## 8.8 Non-active records — full detail

### RETIRED LEGACY PLACEMENT — DISABLED

| Slot | `hp_video` |
|---|---|
| Legacy source | `WEB-INF/upgrade/index_upgrade_as.jsp` L614, immediately after `hp_mid_leaderboard` |
| Legacy div ID | `div-gpt-ad-1715268442152-0` |
| GAM unit path | `/21828142944/LC_ATV_video_player` |
| Legacy size | **300×168**, fixed — the only Home slot with **no** size mapping |
| Legacy wrapper | `desk-ads0 mobi-ads9 lazy-ad` (170 px height at ≤991 px) |
| Reason retired | **Former video/commercial relationship is no longer active.** |
| Rendering | Zero containers, zero reserved geometry, in both compact and production modes |
| Counting | Excluded from active inventory; counted separately from candidates |
| Constraints | Its GAM path must not be reused; no slot may be renamed to `hp_video`; no automatic replacement |
| Provenance | The production-derived definition **remains** in `04-sample-data/ad-slot-definitions.json`; it is disabled through the Home registry (`RETIRED_HOME_SLOTS`), not deleted |
| Debug label | `RETIRED AD — hp_video — DISABLED` |

### DISABLED IMPLEMENTATION CANDIDATES

All five are genuinely **defined** on the legacy Home but were **never rendered** there. Their
definitions stay in the sample data as audit history.

| Slot | Legacy div ID | Defined at | Note |
|---|---|---|---|
| `hp_mobile_leaderboard_pos1` | `div-gpt-ad-1707413795676-0` | L200 | `lc_mgp_snippet_*` — different page family |
| `hp_mobile_leaderboard_pos2` | `div-gpt-ad-1707413859823-0` | L201 | as above |
| `hp_mobile_leaderboard_pos3` | `div-gpt-ad-1707413940026-0` | L202 | as above |
| `hp_mobile_leaderboard_pos4` | `div-gpt-ad-1707414004765-0` | L203 | as above |
| `hp_mid_large_leaderboard_pos4` | `div-gpt-ad-1696347916722-0` | L196 | never rendered on legacy Home |

Debug label: `NEW CANDIDATE AD — DISABLED`, with the candidate identifier.

### DISABLED STRATEGIC CANDIDATES

| Candidate | Position | GAM path | Div ID | Geometry |
|---|---|---|---|---|
| `NEW-H-ENGAGEMENT-01` | after H-14 (Latest from LotteryCorner) | **none — not assigned** | **none** | **none reserved** |
| `NEW-H-GUIDES-01` | after H-11A (Lottery Blog & Guides) | **none — not assigned** | **none** | **none reserved** |

Debug label: `NEW STRATEGIC CANDIDATE AD — DISABLED`, with the identifier.

## 9. Remaining ad-operations decisions

1. **Should the four `lc_mgp_snippet_*` mobile placements serve on Home?** They are defined there and
   live on 15 other legacy templates. Their `horizontalAds2` mapping serves 728×90 / 970×250 at ≥992,
   so if they are activated the `<992` restriction needs justifying.
2. **Should `hp_mid_large_leaderboard_pos4` be activated?** Defined on Home, never rendered.
3. **The two strategic candidates** need GAM units before they can ever be activated.
4. **An eighth governed anchor** would allow the legacy one-advertisement-per-content-boundary pattern
   to be reproduced exactly. Requires a blueprint amendment.
5. **The sticky production creative height** (DS-26 / DS-34) is still unset. Note the legacy close
   handler computes a one-hour expiry but never attaches it to the cookie, so the legacy dismissal is
   session-only — recorded in §3, deliberately not reproduced.
