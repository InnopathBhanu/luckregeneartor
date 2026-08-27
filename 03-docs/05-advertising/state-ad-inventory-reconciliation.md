# State Page — Advertising Inventory Reconciliation

**Document type:** Advertising audit and reconciliation record — State page family (PF-02 / BP-03)
**Produced by:** Task **LRG-SPEC-017**
**Date:** July 27, 2026
**Status:** **AUDIT ONLY — no advertisement was added, removed, moved, renamed, resized, reordered or re-mapped by this task.**
**Baseline commit:** `482cd39`
**Consolidated by:** Task **LRG-DEC-018** — the founder rulings `FD-S-21` … `FD-S-29` are applied to
§8 and §9; the anchor arithmetic in §7 is corrected. **The measured evidence in §0–§6 is unchanged.**
**Superseded for distribution by:** Task **LRG-ADS-019**, **approved with a host-eligibility
correction by LRG-ADS-020** — `state-ad-anchor-distribution-proposal.md` holds the approved anchor→slot
distribution. **`OPEN-ST-01` is closed**; `APP-ST-01` … `APP-ST-06` are decided. This document remains
the **measured audit**.

**Governing authority**

- `CLAUDE.md` §12 — Advertising Rules (fixed GAM inventory; no removal/merge/rename/move/reduce/reorder without founder approval)
- State Page Blueprint v1.1 (PF-02) §58–§61 — State ad tier, position map, prohibited placements, affiliate requirements; §78 decision 14 — *existing production ad slots, sizes and mappings remain the implementation baseline until individually reviewed*
- Global Shell v1.1 §122 (SL-A01–A07), §6.4 (mobile sticky-conflict priority)
- Product Constitution v2.1 — protected zones (result verification, claim guidance, correction notices, AI answer blocks, tool input/output, responsible-play guidance)
- `03-docs/08-decisions/design-system-founder-decisions.md` — DS-20, DS-21, DS-23, DS-24, DS-26/DS-34, DS-28, DS-35, DS-36

**Companion documents**

- `03-docs/05-advertising/state-ad-anchor-distribution-proposal.md` — **the APPROVED distribution: Minimum Florida profile (10 active) plus conditional expanded profiles (LRG-ADS-019, corrected and approved by LRG-ADS-020)**
- `03-docs/08-decisions/state-page-founder-decisions.md` (`ST-DEC-001`) — the rulings applied in §8 and §9
- `03-docs/05-advertising/home-ad-inventory-reconciliation.md` (Home precedent; classification vocabulary reused here)
- `03-docs/04-page-specifications/state/state-page-source-and-current-implementation-audit.md`
- `03-docs/04-page-specifications/state/state-page-founder-review.md`

---

## 0. Method — why a deterministic scan, and what it changed

The Home reconciliation recorded that the shell `grep` alias in this environment produced
contradictory results on the legacy Home template. The same discipline was applied here: **every
number in this document comes from a pure-Python scan of the legacy source files**, not from
`grep`, and not from the previously recorded `04-sample-data/ad-slot-definitions.json` values.

Three rules were used:

1. **Defined** = an actual `googletag.defineSlot('<unit>', <sizes>, '<divId>')` call in the file.
2. **Rendered** = a `<div … id='<divId>'>` element in template markup, matched across line breaks
   after whitespace normalisation. CSS rules and HTML comments that merely mention a div id are
   **not** renders. (This distinction matters: `div-gpt-ad-1694709627267-0` — a *Home* slot id —
   appears in the State template's inline CSS at L106 and would otherwise be miscounted.)
3. **Effectively rendered** = rendered in the template **or** in a `<%@include %>` the template pulls
   in. The four mobile snippet slots are defined in the State template but rendered inside
   `populargames_as.jspf`; counting only the template would under-report them by four.

### 0.1 Two corrections the scan forced

**Correction A — the audited file is not the production file.**

`04-sample-data/ad-slot-definitions.json` `_meta.purpose` states its values were
*"taken verbatim from `lottery-result_upgrade_as.jsp`"*. A scan of `src/struts.xml` shows that file
is **never referenced by any Struts result**. The production state route resolves to
`lottery-result_upgrade_as_new.jsp`:

```
<action name="*"   class="com.lucky.actions.result.StateResultsAction">   → lottery-result_upgrade_as_new.jsp
<action name="*/"  class="com.lucky.actions.result.StateResultsAction">   → lottery-result_upgrade_as_new.jsp
<action name="*/*/*/*"  (state + yyyy/mm/dd)                              → lottery-result_upgrade_as_new.jsp
```

Both files were scanned. **Their slot inventories are identical** — same 24 definitions, same 23
effectively-rendered set, same single defined-not-rendered slot, same duplicated div id. The
recorded *values* therefore survive; only the **provenance citation is wrong**. Any future re-audit
must read `lottery-result_upgrade_as_new.jsp`. Recorded as **AD-S-DEC-09**; the sample data was not
edited by this task.

**Correction B — two "UNKNOWN" fields are not unknown.**

`ad-slot-definitions.json` records `divId: "UNKNOWN — not defined in this JSP"` for `sp_toppromobar`
and `divId: "UNKNOWN"` for `atv_video_player`. Both **are** defined in the State template:

| Slot | Recorded | Found in source |
|---|---|---|
| `sp_toppromobar` | div id UNKNOWN; sizes `[[430,71]]` | `defineSlot('/21828142944/lc_toppromobar', [[430,71], 'fluid', [1920,45]], 'div-gpt-ad-1704994141196-0')` — `_as_new.jsp` L170 |
| `atv_video_player` | div id UNKNOWN | `defineSlot('/21828142944/LC_ATV_video_player', [300,168], 'div-gpt-ad-1715268442152-0')` — `_as_new.jsp` L169 |

`sp_toppromobar` also carries **two sizes the record omits**: the `'fluid'` creative size and
`[1920, 45]`. Recorded as **AD-S-DEC-10**. Not corrected here — `04-sample-data/**` is outside this
task's write scope.

---

## 1. Headline counts

| Measure | Count | Evidence |
|---|---:|---|
| Slot definitions recorded in `ad-slot-definitions.json` (all page types) | **47** | `statePageSlots` 19 + `statePageMobileSnippetSlots` 4 + `videoSlots` 1 + `stateSpecificSlots` 2 + `homePageSlots` 21 |
| Recorded definitions in the **state domain** | **26** | 19 + 4 + 1 + 2 |
| Slots **defined** in the legacy production state template | **24** | `defineSlot` calls, `_as_new.jsp` L145–L170 |
| Slots **effectively rendered** on the legacy production state page | **23** | 19 in template + 4 via `populargames_as.jspf` |
| Slots **DEFINED-NOT-RENDERED** in legacy | **1** | `sp_side_halfpage_pos1` |
| **Duplicate div-id renders** in legacy | **1 slot, 2 occurrences** | `sp_mid_leaderboard_pos4` at L771 and L829 |
| Recorded slots **not defined anywhere** in any state template | **2** | `wy_on_results_table_pos1`, `wy_on_results_table_pos2` |
| Slot keys referenced by the **current** State fixtures | **14** (all 16 states identical) | `adSlotRefs` in `04-sample-data/state-*-sample.json` |
| Recorded state-domain slots the current implementation **never references** | **12** | listed in §6 |
| Slots the current implementation **actually renders** (3-group state, ≥1024 px) | **9** | see §5.2 |
| Slots the current implementation **actually renders** (3-group state, 992–1023 px) | **6** | see §5.2 |

> **24 defined ≠ 23 rendered ≠ 26 recorded ≠ 14 referenced ≠ 9 rendered today.** Every one of those
> five numbers is different, and every difference had to be dispositioned. **`FD-S-22` fixes the
> reconciliation baseline at the 24 defined slots** — not the 14 the fixtures map — and forbids
> reducing or adding inventory silently. §9 records what happened to each difference.

---

## 2. Legacy production ad map, in body order

Positions are body line numbers in `lottery-result_upgrade_as_new.jsp` (the production template).
"Content boundary" is the real editorial or functional block on each side of the placement.

| # | Slot key | Legacy div id | GAM unit path | Line | Rendered position and content boundary | Device / visibility classes |
|---:|---|---|---|---:|---|---|
| 1 | `sp_toppromobar` | `div-gpt-ad-1704994141196-0` | `/21828142944/lc_toppromobar` | 236 | Sticky promo bar **above the header**. Wrapped in `.element-1-container {position:sticky; top:0}`. **State-gated** — see §3. | `lazy-ad`; sticky top |
| 2 | `sp_top_billboard` | `div-gpt-ad-1695648156445-0` | `…/lc_sp_display_web_top_billboard` | 269 | Below header, above breadcrumb/H1. Between site chrome and page identity. | `mobi-ads10 desk-ads box`; both tiers |
| 3 | `sp_mid_leaderboard_pos1` | `div-gpt-ad-1695648437211-0` | `…_mid_leaderboard_pos1` | 754 | **Inside the results list**, after result card index 1. | `mobi-ads4 desk-ads box` |
| 4 | `sp_mid_leaderboard_pos4` | `div-gpt-ad-1695649467987-0` | `…_mid_leaderboard_pos4` | 771 | **Inside the results list**, after result card index 3. *(first of two renders)* | `mobi-ads4 desk-ads box` |
| 5 | `sp_mid_leaderboard_pos2` | `div-gpt-ad-1695648878708-0` | `…_mid_leaderboard_pos2` | 788 | **Inside the results list**, after result card index 5. | `desk-ads mobi-ads0 box` — `mobi-ads0` is `display:none` ≤991 px → **desktop-only in effect** |
| 6 | `atv_video_player` | `div-gpt-ad-1715268442152-0` | `/21828142944/LC_ATV_video_player` | 792 | **Inside the results list**, immediately after #5 in the same index-5 branch. | `mobi-ads9 desk-ads0 box` — `desk-ads0` is `display:none` ≥992 px → **mobile-only in effect** |
| 7 | `sp_mid_leaderboard_pos3` | `div-gpt-ad-1695649068812-0` | `…_mid_leaderboard_pos3` | 812 | **Inside the results list**, after result card index 7. | `box ads m-auto lazy-ad` |
| 8 | `sp_mid_leaderboard_pos4` | `div-gpt-ad-1695649467987-0` | `…_mid_leaderboard_pos4` | 829 | **Inside the results list**, after result card index 12. **Duplicate DOM id** — same id as #4. | `box ads m-auto lazy-ad` |
| 9 | `sp_mid_leaderboard_pos6` | `div-gpt-ad-1696670920637-0` | `…_mid_leaderboard_pos6` | 1095 | First element inside the *Winning Numbers History* section, above its H2. | `mobi-ads desk-ads` |
| 10 | `sp_side_mpu_pos2` | `div-gpt-ad-1695649586080-0` | `…_side_MPU_pos2` | 1229 | Right column (`col-lg-5`) beside the winning-history availability table. | `mobi-ads4 sticky-ads mobile-ads desk-ads2` — **sticky rail** |
| 11 | `sp_side_mpu_pos3` | `div-gpt-ad-1695649839170-0` | `…_side_MPU_pos3` | 1294 | Right column of *About [State] Lottery*, below Recent Blog Posts, above the operator address block. | `mobi-ads desk-ads5` |
| 12 | `sp_side_mpu_pos4` | `div-gpt-ad-1695649981450-0` | `…_side_MPU_pos4` | 1442 | Right column (`col-lg-4`) **inside the How-to-Claim section**. | `mobi-ads desk-ads5` |
| 13 | `sp_side_mpu_pos5` | `div-gpt-ad-1695650062170-0` | `…_side_MPU_pos5` | 1637 | Beside the claim video / claim-centre block. | `mobi-ads desk-ads5` |
| 14 | `sp_mid_leaderboard` | `div-gpt-ad-1695650411336-0` | `…_mid_leaderboard` | 1867 | After the *How to Play* game cards, before *Cut Off Time*. | `desk-ads mobi-ads4 mobile-ads` |
| 15 | `sp_side_skyscraper` | `div-gpt-ad-1695650228068-0` | `…_side_skyscraper` | 1954 | Right column (`col-lg-4`) beside the **Cut Off Time** table. | `mobi-ads3 desk-ads2 sticky-ads mobile-ads` — **sticky rail** |
| 16 | `sp_bottom_billboard` | `div-gpt-ad-1695650467957-0` | `…_bottom_billboard` | 2058 | Last element of the *Facts of [State] Lottery* section. | `desk-ads3 mobi-ads3 grid` |
| 17 | `sp_side_skyscraper_pos3` | `div-gpt-ad-1696670665970-0` | `…_side_skyscraper_pos3` | 2117 | Right column (`col-lg-5`) **beside the FAQ accordion**. | `mobi-ads4 sticky-ads mobile-ads desk-ads2` — **sticky rail** |
| 18 | `sp_side_skyscraper_pos2` | `div-gpt-ad-1696670589090-0` | `…_side_skyscraper_pos2` | 2161 | Right half of *Winning Numbers by State*, beside the state directory include. | `mobi-ads4 sticky-ads mobile-ads desk-ads2` — **sticky rail** |
| 19 | `sp_mobile_leaderboard_pos1` | `div-gpt-ad-1707413795676-0` | `/21828142944/lc_mgp_snippet_display_web_320x50_mobile_leaderboard_pos1` | `populargames_as.jspf` L38 | Inside Popular Games list, after item index 3. | `mobi-ads7 desk-ads0` → **mobile-only** |
| 20 | `sp_mobile_leaderboard_pos2` | `div-gpt-ad-1707413859823-0` | `…_pos2` | `populargames_as.jspf` L55 | After Popular Games item index 6. | mobile-only |
| 21 | `sp_mobile_leaderboard_pos3` | `div-gpt-ad-1707413940026-0` | `…_pos3` | `populargames_as.jspf` L73 | After Popular Games item index 9. | mobile-only |
| 22 | `sp_mobile_leaderboard_pos4` | `div-gpt-ad-1707414004765-0` | `…_pos4` | `populargames_as.jspf` L89 | After Popular Games item index 12. | mobile-only |
| 23 | `sp_mid_leaderboard_pos5` | `div-gpt-ad-1696670847831-0` | `…_mid_leaderboard_pos5` | 2182 | Between the Popular Games include and the footer include. | `desk-ads mobi-ads` |
| 24 | `sp_bottom_large_leaderboard` | `div-gpt-ad-1695650613003-0` | `…_bottom_large_leaderboard` | 2199 | Inside `#stickyAd` → `#adContent`, **after the footer**, fixed to viewport bottom with `#closeAdButton`. | `mobi-ads10 desk-ads`; **sticky footer, closable** |
| — | `sp_side_halfpage_pos1` | `div-gpt-ad-1695648350770-0` | `…_side_halfpage_pos1` | defined L146 | **Never rendered.** | — |

### 2.1 Named size mappings actually applied (verbatim from the template)

| Mapping | Desktop tier `[992,0]` | Mobile tier `[0,0]` | Used by |
|---|---|---|---|
| `horizontaladsTop` | 728×90 | 320×50 | `sp_top_billboard` |
| `horizontalads` | 728×90 | 336×280, 300×250, 320×50 | `sp_mid_leaderboard_pos1…pos6`, `sp_mid_leaderboard` |
| `horizontalads1` | 728×90, 970×250 | 320×50, 320×100 | `sp_bottom_billboard` |
| `horizontalads2` | 728×90 | 320×50 | `sp_bottom_large_leaderboard`, all four mobile snippets |
| `verticalads` | 300×250 | 336×280, 300×250, 320×100 | `sp_side_mpu_pos3…pos5` |
| `verticalads1` | 160×600, 300×600, 300×250 | 336×280, 300×250, 320×100 | `sp_side_halfpage_pos1`, `sp_side_mpu_pos2`, `sp_side_skyscraper`, `_pos2`, `_pos3` |
| *(none)* | fixed `[[430,71], 'fluid', [1920,45]]` | same | `sp_toppromobar` |
| *(none)* | fixed `[300,168]` | same | `atv_video_player` |

**Only two GAM tiers exist: `[992,0]` and `[0,0]`.** There is no tablet tier and no desktop-only
tier in GAM. Desktop-only / mobile-only behaviour is produced entirely by **CSS classes**
(`desk-ads0` = hide ≥992 px; `mobi-ads0` = hide ≤991 px), not by GAM.

### 2.2 Serving mechanics

- `googletag.pubads().setTargeting('state', ['<stateCode>'])` — every state page targets its own
  state code. Any rebuild must preserve this key/value or state-level line items stop delivering.
- `googletag.pubads().collapseEmptyDivs()` is called (`_as_new.jsp` L171). This **contradicts**
  `lazyLoadDefaults.collapseIfEmpty: false` recorded in `ad-slot-definitions.json` and contradicts
  DS-24 (retain outer geometry, collapse only the inner creative). Recorded as **AD-S-DEC-06**.
- There are **no eager `googletag.display()` calls**. Every slot carries `class="lazy-ad"` and is
  displayed by an `IntersectionObserver` with **no `rootMargin`** (L176–L201), falling back to
  displaying all slots when `IntersectionObserver` is unavailable. The recorded
  `lazyLoadMarginPx: 300` and `eagerAboveFold: true` for `sp_top_billboard` are **implementation
  intent in the new UI, not legacy behaviour**.

---

## 3. Conditional branches and state-specific behaviour

| Branch | Location | Effect |
|---|---|---|
| **`sp_toppromobar` state gate** | `_as_new.jsp` L219–L230, `<s:if>` on `stateCode` | Renders **only** for `ny, tx, oh, ma, va, pa, mi, mn, or` — **9 of 49 jurisdictions**. This conditional is **not recorded anywhere** in `ad-slot-definitions.json`, which lists the slot unconditionally. Tracked as `OPEN-ST-03`. **LRG-ADS-019 finding: `fl` is NOT in the gate**, so a Florida page renders no top promo bar in production — excluding it from the Florida preview is exact parity, and `OPEN-ST-03` is therefore **not a Florida-preview blocker**. |
| **Results-list index branches** | `<s:if test="#resultsStatus.index==1">` / `==3` / `==5` / `==7` / `==12` | Five ad placements are injected **between result cards**, keyed to *positional index in the result list*, not to content meaning. A state with fewer than 13 games renders fewer of them: with 6 games (AZ, MA, MN) only indices 1, 3 and 5 fire — **3 of 5**; with 3 games (WY) only index 1 fires — **1 of 5**. Inventory therefore varies by state without any configuration recording it. |
| **No-lottery states** | `state_al.jsp`, `state_ak.jsp`, `state_hi.jsp`, `state_ut.jsp`, `state_nv.jsp` | All five **define the same 24 slots** but render only **6 in-template + 4 via Popular Games = 10**: `sp_top_billboard`, `sp_side_mpu_pos3`, `sp_side_skyscraper_pos3`, `sp_side_skyscraper_pos2`, `sp_mid_leaderboard_pos5`, `sp_bottom_large_leaderboard`, plus the four mobile snippets. `sp_toppromobar` is **not** rendered on these pages. This is the production ST-06 ad model. |
| **`special` result** | `lottery-result_upgrade_special.jsp` | Same 24 defined / 23 rendered / 1 defined-not-rendered as the main template, but **no duplicate div id**. Which states resolve to `special` is decided in `StateResultsAction` (Java), not in configuration. Recorded as **AD-S-DEC-11**. |
| **`/fl-new` test route** | `florida_newVersion.jsp` | Defines all 24 slots, renders **3**. It is a test route, not the production `/fl`. Its H1 is the exact string the current fixtures use — the proposed design was prototyped here. **Not an ad baseline.** |
| **Commented-out affiliate promo** | `_as_new.jsp` L283–L365 | A "Michigan Lottery Promo Code" bonus header with a star rating, a copy-to-clipboard code and an outbound partner link, entirely inside an HTML comment and labelled *"Promotion of test Content"*. **Not active inventory**; recorded so it is not mistaken for one, and so its outbound partner destination is not carried forward. |

---

## 4. Wyoming state-specific slots — recorded but unfounded

`ad-slot-definitions.json.stateSpecificSlots` records two slots as `pageType: "state"`,
`stateCode: "wy"`, with `divId: "UNKNOWN"` and `sizes: null`:

- `wy_on_results_table_pos1` → `/21828142944/wyoming_on_results_table_pos1`
- `wy_on_results_table_pos2` → `/21828142944/wyoming_on_results_table_pos2`

A full-tree scan of the legacy application finds:

- **0** `defineSlot` calls for either unit path, anywhere;
- **0** rendered divs, anywhere;
- **2 HTML comments only**, in `WEB-INF/upgrade/insider/user/myfavouritegames_upgrade.jsp` at L334
  and L350 — an **Insider member page, not a state page**.

They are therefore **neither defined nor rendered on any state template**, and their recorded
`pageType: "state"` is unsupported by source. They may still be **live GAM units with delivery**;
only ad operations can confirm that.

**Ruled by `FD-S-27`:** both stay **out of the active State preview baseline** until ad operations
confirms that the GAM units exist and supplies their div IDs and mappings — and the **evidence record
is retained**, not discarded. `CLAUDE.md` §12 forbids dropping them on this evidence alone.
Tracked as `OPEN-ST-02`; registered as source **Conflict 16**.

---

## 5. Current implementation — what is mapped and what actually renders

### 5.1 The mapping

All 16 state fixtures carry a **byte-identical** `adSlotRefs` block (only the `note` string differs),
referencing **14 slot keys**:

| Anchor key | Slot keys | Consumed by |
|---|---|---|
| `top` | `sp_top_billboard` | full-bleed band above the breadcrumb |
| `inContent` | `sp_mid_leaderboard_pos1`, `_pos2`, `_pos3`, `_pos4` | `inContent[gi]` — **one per result group**, `StatePageTemplate.tsx:130` |
| `mobileInContent` | `sp_mobile_leaderboard_pos1…pos4` | `mobileInContent[gi]` inside `lg:hidden`, `StatePageTemplate.tsx:131-135` |
| `rightRail` | `sp_side_halfpage_pos1`, `sp_side_mpu_pos2`, `sp_side_skyscraper` | `<aside className="hidden … lg:flex">`, `StatePageTemplate.tsx:214-218` |
| `bottom` | `sp_bottom_billboard` | end of the content column |
| `stickyFooterAd` | `sp_bottom_large_leaderboard` | `StickyFooterAd` |

> The reuse register (`03-docs/08-decisions/reuse-register.md`, Advertising row *"Existing State ad
> mapping"*) states *"identical 15 slots across all 16 states."* The verified count is **14** slot
> keys; 15 is the number of `adSlotRefs` array entries **including the `note` string**. Minor, but
> recorded so the two documents do not disagree.

### 5.2 What actually renders — mapped is not rendered

`inContent[gi]` and `mobileInContent[gi]` are indexed by **result-group index**. Every fixture has
**3** groups (`multiState`, `inState`, `pick`) except **Maine**, which has **2**. Four slots are
mapped; only as many as there are groups can ever render.

| Viewport | FL/AZ/… (3 groups) | ME (2 groups) |
|---|---:|---:|
| ≥ 1024 px | **9** — top 1 + inContent 3 + rail 3 + bottom 1 + sticky 1 | **8** |
| 992–1023 px | **6** — top 1 + inContent 3 + bottom 1 + sticky 1 | **5** |
| < 992 px | **9** — top 1 + inContent 3 + mobile 3 + bottom 1 + sticky 1 | **7** |

Three consequences:

1. **`sp_mid_leaderboard_pos4` and `sp_mobile_leaderboard_pos4` are mapped but unreachable on every
   state.** A fourth result group would be required, and none exists.
2. **The 992–1023 px inventory gap is live on the State page.** The rail is gated by Tailwind's
   default `lg` = **1024 px** (no `@theme` breakpoint override exists in `app/globals.css`), while
   the mobile-only rule `.lc-ad--mobile-only { display:none }` fires at **992 px**. Between the two,
   the rail slots and the mobile slots are *both* hidden. DS-20 named 992 px as the single structural
   threshold and closed this gap — **but only inside the `[data-lc-preview]` Home-preview CSS layer**
   (`.lcp-*`). The State page still uses the older `lc-*` layer and is unfixed. **Ruled by `FD-S-24`**
   (subject to ad-operations validation): one 992 px threshold, no 992–1023 px gap, no GAM mapping
   change.
3. Reserved height is computed from each slot's own recorded mapping, so **no layout shift** is
   introduced — the gap is lost impressions, not visual breakage.
4. **LRG-ADS-019 finding — the legacy sticky rail is already section-bounded.** The production script
   pins a `.sticky-ads` slot only while the viewport is inside `ad.closest('.c-section')` and releases
   it at that section's end, under `@media (min-width: 992px)`. This is exactly what `FD-S-28`
   requires, so the rail model preserves the legacy semantic rather than inventing one. See the
   distribution proposal §0.2 and §5.2.

---

## 6. Slot-by-slot reconciliation

> **Reading the "Action required" column after LRG-DEC-018.** The `AD-S-DEC-nn` pointers below resolve
> to the founder rulings and open decisions recorded in §9: `-01`→`OPEN-ST-03` · `-02`→`FD-S-27`/`OPEN-ST-02`
> · `-03`,`-13`→`FD-S-21`+`FD-S-25` (**relocate**) · `-04`→`FD-S-23` · `-05`→`FD-S-24` ·
> `-06`→`OPEN-ST-04` · `-07`→`FD-S-22`+`OPEN-ST-01` · `-08`→`FD-S-22` · `-09`,`-10`→source Conflict 16
> · `-11`→obsolete · `-12`→`FD-S-28` · `-14`→`FD-S-29` · `-15`,`-17`,`-18`→`OPEN-ST-01` ·
> `-16`→`FD-S-26`/`OPEN-ST-02` · `-19`→`FD-S-22`+`FD-S-31`.

Classification vocabulary, as used by the Home reconciliation:

- **EXISTING** — rendered in legacy; rendered by the current implementation at a comparable
  content-relative position.
- **RELOCATED** — rendered in legacy; rendered by the current implementation at a different position.
- **MISSING** — rendered in legacy; **not rendered** by the current implementation.
- **DUPLICATED** — one slot rendered more than once in the same document.
- **DEFINED-NOT-RENDERED** — a `defineSlot` exists but no markup renders it.
- **NEW CANDIDATE** — proposed placement with no legacy precedent. *(None is proposed here.)*

| Slot key | Legacy div id | GAM unit path | Size mapping | Desktop / mobile | Legacy position | Legacy visibility | Sticky | Current anchor | Current render | Classification | Action required |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `sp_toppromobar` | `div-gpt-ad-1704994141196-0` | `/21828142944/lc_toppromobar` | none — fixed `[430,71]`, `fluid`, `[1920,45]` | same both | above header, sticky | **9 states only** | yes (top) | — | none | **MISSING** | AD-S-DEC-01 — confirm the 9-state gate and whether the sticky top bar is retained |
| `sp_top_billboard` | `…1695648156445-0` | `…_top_billboard` | `horizontaladsTop` | 728×90 / 320×50 | below header, above H1 | all | no | `top` | ✅ all widths | **EXISTING** | none |
| `sp_mid_leaderboard_pos1` | `…1695648437211-0` | `…_pos1` | `horizontalads` | 728×90 / 336×280,300×250,320×50 | **inside results list**, after card 1 | all | no | `inContent[0]` | ✅ after group 1 | **RELOCATED** | AD-S-DEC-03 — moved out of the result grid to a between-groups boundary |
| `sp_mid_leaderboard_pos2` | `…1695648878708-0` | `…_pos2` | `horizontalads` | as above | **inside results list**, after card 5 | **desktop only** (`mobi-ads0`) | no | `inContent[1]` | ✅ after group 2, **all widths** | **RELOCATED** | AD-S-DEC-03 + note: current render **adds mobile impression opportunity legacy did not offer** |
| `sp_mid_leaderboard_pos3` | `…1695649068812-0` | `…_pos3` | `horizontalads` | as above | **inside results list**, after card 7 | all | no | `inContent[2]` | ✅ after group 3 | **RELOCATED** | AD-S-DEC-03 |
| `sp_mid_leaderboard_pos4` | `…1695649467987-0` | `…_pos4` | `horizontalads` | as above | **inside results list**, after cards 3 **and** 12 | all | no | `inContent[3]` | ❌ never (only 3 groups) | **DUPLICATED** (legacy) → **MISSING** (current) | AD-S-DEC-04 — legacy duplicate id is invalid HTML and GPT fills only the first; decide the single correct position |
| `sp_mid_leaderboard_pos5` | `…1696670847831-0` | `…_pos5` | `horizontalads` | as above | after Popular Games, before footer | all | no | — | none | **MISSING** | AD-S-DEC-07 |
| `sp_mid_leaderboard_pos6` | `…1696670920637-0` | `…_pos6` | `horizontalads` | as above | top of Winning-History section | all | no | — | none | **MISSING** | AD-S-DEC-07 |
| `sp_mid_leaderboard` | `…1695650411336-0` | `…_mid_leaderboard` | `horizontalads` | as above | after How-to-Play, before Cut-Off | all | no | — | none | **MISSING** | AD-S-DEC-07 |
| `sp_side_halfpage_pos1` | `…1695648350770-0` | `…_side_halfpage_pos1` | `verticalads1` | 160×600,300×600,300×250 / 336×280,300×250,320×100 | — | — | — | `rightRail[0]` | ✅ ≥1024 px only | **DEFINED-NOT-RENDERED** (legacy) → newly placed (current) | AD-S-DEC-08 — the current page activates a placement legacy never rendered |
| `sp_side_mpu_pos2` | `…1695649586080-0` | `…_side_MPU_pos2` | `verticalads1` | as above | rail beside winning-history table | all | **yes** | `rightRail[1]` | ✅ ≥1024 px only | **RELOCATED** | AD-S-DEC-05 (threshold), AD-S-DEC-12 (rail vs. section-anchored) |
| `sp_side_mpu_pos3` | `…1695649839170-0` | `…_side_MPU_pos3` | `verticalads` | 300×250 / 336×280,300×250,320×100 | right column of About-[State] | all | no | — | none | **MISSING** | AD-S-DEC-07 |
| `sp_side_mpu_pos4` | `…1695649981450-0` | `…_side_MPU_pos4` | `verticalads` | as above | **inside How-to-Claim** | all | no | — | none | **MISSING** | AD-S-DEC-07 **and** AD-S-DEC-13 — PF-02 §60 prohibits ads inside claim content |
| `sp_side_mpu_pos5` | `…1695650062170-0` | `…_side_MPU_pos5` | `verticalads` | as above | beside claim video / claim centre | all | no | — | none | **MISSING** | AD-S-DEC-07 + AD-S-DEC-13 |
| `sp_side_skyscraper` | `…1695650228068-0` | `…_side_skyscraper` | `verticalads1` | 160×600,300×600,300×250 / 336×280,300×250,320×100 | rail beside Cut-Off table | all | **yes** | `rightRail[2]` | ✅ ≥1024 px only | **RELOCATED** | AD-S-DEC-05, AD-S-DEC-12 |
| `sp_side_skyscraper_pos2` | `…1696670589090-0` | `…_pos2` | `verticalads1` | as above | beside state directory | all | **yes** | — | none | **MISSING** | AD-S-DEC-07 |
| `sp_side_skyscraper_pos3` | `…1696670665970-0` | `…_pos3` | `verticalads1` | as above | **beside the FAQ accordion** | all | **yes** | — | none | **MISSING** | AD-S-DEC-07 |
| `sp_bottom_billboard` | `…1695650467957-0` | `…_bottom_billboard` | `horizontalads1` | 728×90,970×250 / 320×50,320×100 | end of Facts section | all | no | `bottom` | ✅ all widths | **EXISTING** | none |
| `sp_bottom_large_leaderboard` | `…1695650613003-0` | `…_bottom_large_leaderboard` | `horizontalads2` | 728×90 / 320×50 | sticky footer, closable | all | **yes** | `stickyFooterAd` | ✅ all widths | **EXISTING** | AD-S-DEC-14 — sticky-conflict priority (Global Shell §6.4 / DS-28) is unimplemented |
| `sp_mobile_leaderboard_pos1` | `…1707413795676-0` | `lc_mgp_snippet_…_pos1` | `horizontalads2` | hidden / 320×50 | Popular Games after item 3 | mobile only | no | `mobileInContent[0]` | ✅ after group 1, <992 px | **RELOCATED** | AD-S-DEC-15 — moved from Popular Games to the results area |
| `sp_mobile_leaderboard_pos2` | `…1707413859823-0` | `…_pos2` | `horizontalads2` | hidden / 320×50 | Popular Games after item 6 | mobile only | no | `mobileInContent[1]` | ✅ after group 2 | **RELOCATED** | AD-S-DEC-15 |
| `sp_mobile_leaderboard_pos3` | `…1707413940026-0` | `…_pos3` | `horizontalads2` | hidden / 320×50 | Popular Games after item 9 | mobile only | no | `mobileInContent[2]` | ✅ after group 3 | **RELOCATED** | AD-S-DEC-15 |
| `sp_mobile_leaderboard_pos4` | `…1707414004765-0` | `…_pos4` | `horizontalads2` | hidden / 320×50 | Popular Games after item 12 | mobile only | no | `mobileInContent[3]` | ❌ never | **MISSING** | AD-S-DEC-04 |
| `atv_video_player` | `…1715268442152-0` | `/21828142944/LC_ATV_video_player` | none — fixed `[300,168]` | 300×168 both | **inside results list**, index-5 branch | **mobile only** (`desk-ads0`) | no | — | none | **MISSING** | AD-S-DEC-16 — the same GAM unit was **retired on Home** (LRG-ADS-015 §2). That decision was Home-scoped; the State page renders it in production |
| `wy_on_results_table_pos1` | not defined | `/21828142944/wyoming_on_results_table_pos1` | none recorded | unknown | none | — | — | — | none | **DEFINED-NOT-RENDERED** *(record only — no `defineSlot` exists)* | AD-S-DEC-02 |
| `wy_on_results_table_pos2` | not defined | `/21828142944/wyoming_on_results_table_pos2` | none recorded | unknown | none | — | — | — | none | **DEFINED-NOT-RENDERED** *(record only)* | AD-S-DEC-02 |

**Totals:** EXISTING 3 · RELOCATED 8 · MISSING 11 (of which 2 are record-only Wyoming entries) ·
DUPLICATED 1 (also counted as MISSING in the current implementation) · DEFINED-NOT-RENDERED in
legacy 1 · NEW CANDIDATE 0.

---

## 7. Blueprint anchors vs. production slots

PF-02 §59 defines **7 ad anchors**. They are *positions*, not inventory. The **24 defined** State slots
(23 rendered + 1 defined-not-rendered) must be distributed across them, and the blueprint explicitly
defers that: *"Exact slot IDs, dimensions, breakpoints, lazy-loading and refresh behavior must be
audited from the current State Page implementation before coding."* This document is that audit; the
distribution itself is **`OPEN-ST-01`** — the one open founder decision that blocks the Florida
preview — and is not proposed here.

| Anchor | Blueprint position | Blueprint rule | Nearest legacy slot(s) |
|---|---|---|---|
| AD-S00 | after S-01 State Identity | inherit current top state slot | `sp_top_billboard` (+ `sp_toppromobar` above the shell) — **desktop ≥992 px only during the State preview (`FD-X-04`)** |
| AD-S01 | after S-02 Latest Results | first normal inline ad | one of `sp_mid_leaderboard_pos1…3` |
| AD-S02 | after S-06 Games / S-05 Check / S-04 Live | no task interruption | `sp_mid_leaderboard`, remaining `pos*` |
| AD-S03 | after S-10 Tools / S-09 Highlights | lower utility inventory | `sp_mid_leaderboard_pos5`, `pos6` |
| AD-S04 | before footer | clearly labelled | `sp_bottom_billboard` |
| AD-SR01 | optional desktop rail | never inside result/claim facts | `sp_side_halfpage_pos1`, `sp_side_mpu_pos2…5`, `sp_side_skyscraper`, `_pos2`, `_pos3` |
| AD-SM01 | mobile inline/sticky | inherit production configuration | `sp_mobile_leaderboard_pos1…4`, `sp_bottom_large_leaderboard`, `atv_video_player` |

**Arithmetic that has to be reconciled.** All 24 defined slots account as follows:

| Group | Count | Slots | Anchor capacity |
|---|---:|---|---|
| Top | 1 | `sp_top_billboard` | AD-S00 — 1 anchor. **Mobile tier inactive during the State preview (`FD-X-04`); slot retained, not reduced** |
| Inline in-content | **8** | `sp_mid_leaderboard_pos1…pos6`, `sp_mid_leaderboard`, `sp_bottom_billboard` | AD-S01–AD-S04 — **4 anchors** |
| Rail | **8** | `sp_side_halfpage_pos1`, `sp_side_mpu_pos2…pos5`, `sp_side_skyscraper`, `_pos2`, `_pos3` | AD-SR01 — **1 anchor** |
| Mobile / sticky / video | 6 | `sp_mobile_leaderboard_pos1…pos4`, `sp_bottom_large_leaderboard`, `atv_video_player` | AD-SM01 — 1 anchor |
| Shell-level, above the header | 1 | `sp_toppromobar` | outside the PF-02 anchor set |
| **Total** | **24** | | 7 anchors |

So **4 inline anchors must absorb 8 inline slots** and **1 rail anchor must absorb 8 rail slots**.
Either anchors carry multiple slots (the Home precedent — see `home-ad-inventory-reconciliation.md`,
where AD-H01 carries a rail sub-position *and* an inline sub-position), or inventory is reduced.
**`FD-S-22` forbids reducing or adding inventory silently**, and `CLAUDE.md` §12 reserves any reduction
to the founder. The distribution is `OPEN-ST-01`.

*(LRG-SPEC-017 stated "5 inline anchors must absorb 8 inline slots", which double-counted AD-S00. The
table above is the corrected accounting.)*

---

## 8. Protected-zone violations — production placements the approved architecture prohibits

These are the sharpest findings in this document: production advertising sits inside content the
Constitution protects.

> **Ruled, not optional.** `FD-S-21` settles this: *"This is not an open option between 'production
> parity' and 'architecture.' Production slots currently violating protected zones must be relocated
> to approved anchors while preserving inventory unless a separate retirement decision is taken."*
> `FD-S-25` adds that a slot is **not** retired merely because its legacy placement is prohibited.
>
> LRG-SPEC-017 presented P1 and P2 as a choice between keeping and moving these placements. That was
> an error — prohibited placement was never an equally valid option. **Every affected slot is
> relocated; inventory count is preserved; only position changes.** The destination anchor is
> `OPEN-ST-01`.

| # | Production behaviour | Rule it contradicts | Severity | Required outcome |
|---|---|---|---|---|
| **P1** | **Five slots render inside the results list** (`sp_mid_leaderboard_pos1/2/3/4` and `atv_video_player`, at result indices 1, 3, 5, 7, 12) — in `_as.jsp` as `<tr><td colspan="5" class="ads-placeholder-td">` rows inside the result `<table>`; in `_as_new.jsp` as `<div class="card ads-placeholder-td1">` cards inside the result card list. | `CLAUDE.md` §12: *"No ad inside a result grid."* PF-02 §60: *"inside result cards"* prohibited. PF-02 §15: *"No advertisement inside the result grid."* | **HIGH** | **Relocate** all five to approved anchors (`FD-S-21`, `FD-S-25`). Inventory preserved; `atv_video_player` stays disabled pending `OPEN-ST-02`. |
| **P2** | `sp_side_mpu_pos4` renders **inside the How-to-Claim section**; `sp_side_mpu_pos5` renders beside the claim video / claim-centre block. | PF-02 §21 high-protection rules: *"low/no ads"* in claims. PF-02 §60: *"inside claim/tax/anonymity"* prohibited. Constitution §protected zones: claim guidance. | **HIGH** | **Relocate** both out of claim content (`FD-S-21`, `FD-S-25`). Claim zone renders no ad (`FD-S-21`). |
| **P3** | The current implementation renders ads **between result groups** — an improvement on P1, but the group boundary is still inside the S-02 Latest State Results section, not after it. PF-02 §59 places AD-S01 **after** results. | PF-02 §15 / §59 | **MEDIUM** | Move the anchor to **after** S-02, per PF-02 §59 (`FD-S-04` section resolver + `OPEN-ST-01` distribution). |
| **P4** | `sp_side_skyscraper_pos3` renders **beside the FAQ accordion**; several rail slots are `sticky-ads` and can scroll alongside claim and tax content. | PF-02 §59 AD-SR01: *"never inside result/claim facts."* | **MEDIUM** | Rail slots become **section-bounded**; sticky only where they cannot cross protected content (`FD-S-28`). |
| **P5** | The sticky closable footer ad exists with **no bottom navigation, no sticky purchase CTA and no priority arbitration**. Global Shell §6.4 / DS-28 require: safety → bottom nav → user action → advertising, with the sticky ad above the nav or suppressed. Content clearance is a hardcoded `pb-28` in `StatePageTemplate.tsx:67` rather than derived from reserved height. | Global Shell §6.4; DS-28; `CLAUDE.md` §12 | **MEDIUM** — becomes HIGH the moment bottom navigation ships | Implement the Global Shell priority and **derive** clearance from reserved height (`FD-S-29`). Preview introduces no sticky purchase action. |
| **P6** | Legacy `#stickyAd` sets `z-index: 9999` and `position: fixed` with no focus management. DS-15 requires that a visible focus indicator is **never obscured by sticky layers**. | DS-15; WCAG 2.4.11 | **MEDIUM** | Focus indicators must never be obscured by a sticky layer (`FD-S-13`, DS-15). |
Reconciling P1 and P2 changes where production slots sit. `CLAUDE.md` §12 reserves that change to the
founder — and the founder has now made it (`FD-S-21`, `FD-S-25`): **relocate, preserve inventory.**
What remains open is only the destination anchor for each slot (`OPEN-ST-01`). **No slot was moved,
added, removed or re-mapped by this document.**

---

## 9. Dispositions — advertising

**All nineteen entries previously listed here as "decisions required" now carry a disposition.**
Fourteen are settled by the founder rulings in `03-docs/08-decisions/state-page-founder-decisions.md`
(`ST-DEC-001`); four require ad-operations input before they can close; one is obsolete.

> **LRG-ADS-019 / LRG-ADS-020 update.** The distribution items — `AD-S-DEC-03`, `-04`, `-07`, `-08`,
> `-12`, `-13`, `-15`, `-17`, `-18` — are settled by the **approved** distribution in
> `state-ad-anchor-distribution-proposal.md`. It allocates all **24 production-template-defined** slots
> across the 7 PF-02 anchors in four profiles — **Minimum 10 active / 14 deferred (the implementation
> baseline)**, rising to 14 active only if S-14 and S-15 both satisfy the content-host rule. The six
> approvals `APP-ST-01` … `APP-ST-06` are **decided** and `OPEN-ST-01` is **closed**. The four
> ad-operations items are consolidated into the ten-question set in that document §9 and are
> **non-blocking** for the guarded preview.
>
> **Host-eligibility correction (`APP-ST-01`/`-04`/`-05`).** An advertisement may not be hosted by an
> empty-state shell. Four slots — `sp_side_skyscraper_pos3`, `sp_side_mpu_pos3`,
> `sp_mobile_leaderboard_pos2`, `sp_mobile_leaderboard_pos3` — are **conditional** on S-14 / S-15
> containing substantive real content, and stay deferred otherwise. They are **not relocated**.
>
> **Accounting note.** The two Wyoming record-only units are **outside** the 24 template-defined
> definitions and are never folded into a template-defined subtotal.

| ID | Question as recorded | Disposition |
|---|---|---|
| **AD-S-DEC-01** | `sp_toppromobar` — retain the 9-state gate, extend it, or retire the sticky top promo bar | **OPEN — `OPEN-ST-03`.** Ad operations + founder. **Not a Florida-preview blocker:** `fl` is not in the gate, so excluding it from the Florida preview is exact legacy parity (proposal §0.1) |
| **AD-S-DEC-02** | Wyoming in-table slots | **DEFERRED TO AD OPERATIONS — `FD-S-27` → `OPEN-ST-02`.** Excluded from the active preview baseline until ad operations confirms the units, div IDs and mappings. Evidence record retained |
| **AD-S-DEC-03** | The five in-results-grid placements | **RULED — `FD-S-21` + `FD-S-25`: relocate to approved anchors, inventory preserved.** No longer an option to keep in place. Destination → `OPEN-ST-01` |
| **AD-S-DEC-04** | `sp_mid_leaderboard_pos4` (duplicated) and `sp_mobile_leaderboard_pos4` (unreachable) | **RULED — `FD-S-23`:** a single GAM div ID must never render twice; each slot receives at most one valid mapped placement or is explicitly disabled pending ad-operations confirmation. Broken parity is not preserved |
| **AD-S-DEC-05** | Apply the single 992 px threshold to State | **RULED — `FD-S-24`, subject to ad-operations validation.** No 992–1023 px inventory gap; no GAM size-mapping change |
| **AD-S-DEC-06** | `collapseEmptyDivs()` vs `collapseIfEmpty: false` vs DS-24 | **OPEN — `OPEN-ST-04`.** Three-way conflict; DS-36 gives ad operations the final word. Registered as source **Conflict 15**. The preview uses the DS-24 treatment |
| **AD-S-DEC-07** | The 9 legacy slots the current implementation never renders | **RULED (baseline) — `FD-S-22`:** every slot reaches a recorded disposition — active placement, or explicitly disabled with a reason. Destinations → `OPEN-ST-01` |
| **AD-S-DEC-08** | `sp_side_halfpage_pos1`, defined but never rendered in legacy, now rendered in the rail | **RULED — `FD-S-22`**, which requires "explicit treatment of defined-but-never-rendered slots". Ad operations confirms the activation |
| **AD-S-DEC-09** | Correct the provenance citation to `lottery-result_upgrade_as_new.jsp` | **EXECUTION**, blocked only by write scope: `04-sample-data/**` needs an approved data task. Registered as source **Conflict 16** |
| **AD-S-DEC-10** | Fill the two resolvable "UNKNOWN" div IDs and `sp_toppromobar`'s missing `'fluid'` / `[1920,45]` sizes | **EXECUTION**, same task. Registered as source **Conflict 16** |
| **AD-S-DEC-11** | Which jurisdictions resolve to `lottery-result_upgrade_special.jsp` | **OBSOLETE as an advertising decision.** That template's ad inventory is identical — 24 defined, 23 rendered, same defined-not-rendered slot — so it cannot change the baseline. Survives only as a minor composition-evidence item for cross-State rollout |
| **AD-S-DEC-12** | Rail model: production section-anchored vs. one continuous rail | **RULED — `FD-S-28`:** a State-specific contextual rail aligned to governed section boundaries; do not copy the Home rail mechanically. Sticky **only** where a slot cannot travel across protected claim, result, correction or responsible-play content |
| **AD-S-DEC-13** | Claim-zone ads | **RULED — `FD-S-21` + `FD-S-25`: relocate.** Same ruling as AD-S-DEC-03; merged. The claim zone renders no advertisement |
| **AD-S-DEC-14** | Sticky-conflict priority and derived clearance | **RULED — `FD-S-29`:** Global Shell priority order implemented; clearance derived from reserved height, replacing `pb-28`. The State preview introduces no sticky purchase action |
| **AD-S-DEC-15** | Mobile snippets moved from Popular Games to the results area | **MERGED into `OPEN-ST-01`.** A placement destination, validated by ad operations |
| **AD-S-DEC-16** | `atv_video_player` — extend the Home retirement or keep | **DEFERRED — `FD-S-26` → `OPEN-ST-02`.** The Home retirement was Home-scoped; the State unit is **not** assumed retired and stays **disabled** in the preview. Registered as source **Conflict 17** |
| **AD-S-DEC-17** | The anchor→slot distribution | **CLOSED — `OPEN-ST-01` resolved.** Approved by `APP-ST-01` + `APP-ST-02` + `APP-ST-03` with the host-eligibility correction: **Minimum profile 10 active / 14 deferred** is the implementation baseline; 14 active only if both conditional hosts qualify |
| **AD-S-DEC-18** | Per-state inventory variance (WY 1 of 5; AZ/MA/MN 3 of 5) | **MERGED into `OPEN-ST-01`.** Density follows the distribution; ad operations validates |
| **AD-S-DEC-19** | Ratify the reduced no-lottery (ST-06) ad model | **RULED — `FD-S-22`** ("State-specific and no-lottery rules") **+ `FD-S-31`.** Ad operations validates the final set. Result, claim, tax and commerce modules must not appear on an ST-06 page, so their anchors do not either |

### 9.1 What ad operations needs to decide

Consolidated into the **ten-question set** in `state-ad-anchor-distribution-proposal.md` §9, which asks
only for information ad operations can supply from GAM and delivery data. In priority order:

1. **`OPEN-ST-04`** — no-fill behaviour, resolving the three-way conflict (proposal Q6).
2. **`OPEN-ST-02`** — Wyoming units and the State `atv_video_player` (Q3, Q4).
3. **`OPEN-ST-03`** — the `sp_toppromobar` 9-state gate (Q2). *Not a Florida blocker.*
4. Unit-level **delivery confirmation** across all 24 State slots (Q1).

Plus three validations of already-approved directions: **`FD-S-24`** (the 992 px synchronized switch,
Q7), the activation of **`sp_side_halfpage_pos1`** under `FD-S-22` (Q5), and the proposed **desktop-only
rail** with snippets carrying the mobile tier (Q10).

**Not blocking:** `OPEN-ST-01` is no longer an ad-operations decision — it is a founder approval of the
proposed distribution (`APP-ST-01`).

---

## 10. What these tasks did **not** do

Neither LRG-SPEC-017 (the audit) nor LRG-DEC-018 (the consolidation):

- added, removed, renamed, moved, resized, reordered or re-mapped any slot;
- modified any file under `04-sample-data/`, `01-new-ui/` or the legacy application;
- **retired** any State slot — `atv_video_player` is **disabled pending confirmation** under `FD-S-26`,
  which is explicitly not retirement, and the Wyoming units are **excluded from the baseline** under
  `FD-S-27`, which is explicitly not deletion;
- invented a GAM path, div id, size or size mapping; every value above is transcribed;
- resolved `OPEN-ST-01` … `OPEN-ST-04`, which need ad-operations input.

What LRG-DEC-018 **did** do: applied `FD-S-21` … `FD-S-29`, so §8's protected-zone violations are no
longer framed as an option, §9 carries a disposition for all nineteen entries, and §7's anchor
arithmetic is corrected.

**Scan artefacts.** The Python scans used to produce this document are reproducible from the rules in
§0 against `WEB-INF/upgrade/results/lottery-result_upgrade_as_new.jsp`,
`…/lottery-result_upgrade_as.jsp`, `…/lottery-result_upgrade_special.jsp`, `…/florida_newVersion.jsp`,
`…/state_{al,ak,hi,ut,nv}.jsp` and `WEB-INF/upgrade/populargames_as.jspf`.
