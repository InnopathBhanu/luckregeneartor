# State Page — Advertising Anchor Distribution Proposal

**Document type:** Advertising distribution proposal and founder approval surface — State page family (PF-02 / BP-03)
**Produced by:** Task **LRG-ADS-019**
**Date:** July 28, 2026
**Status:** **APPROVED WITH HOST-ELIGIBILITY CORRECTION** — task **LRG-ADS-020**, July 28, 2026.
`APP-ST-01` … `APP-ST-06` are decided; `OPEN-ST-01` is **closed**. No advertisement was added, removed,
moved, renamed, resized, reordered or re-mapped. No GAM or partner script was activated.
**Baseline commit:** `96e4487` (proposal) · `a6690df` (this correction)

**Purpose.** Close `OPEN-ST-01` — the single open decision that blocked the guarded anonymous Florida
State preview — by mapping the legacy State production inventory onto the seven approved PF-02 anchors.

> **What the founder corrected.** The approved direction stands, but the proposal treated **S-14
> Community and S-15 News as advertising hosts while both are cold-start or empty in the Florida
> preview.** That was wrong: a required empty-state shell does not qualify as an advertising host, and
> an advertisement must never be the reason a shell exists. Four slots are therefore **conditional on
> substantive real content** (§0.3), the implementation baseline is the **Minimum Florida profile of 10
> active slots** (§8.1), and the expanded profiles are **conditional, not guaranteed** (§8.2).

**Binding rulings applied, not reopened.** `FD-S-21` protected zones are mandatory · `FD-S-22` preserve
the legacy baseline subject to governed reconciliation · `FD-S-23` no duplicate or unreachable
placements · `FD-S-24` one 992 px threshold, no GAM mapping change · `FD-S-25` relocate result-grid and
claim-zone inventory · `FD-S-26` State video deferred and disabled · `FD-S-27` Wyoming units inactive ·
`FD-S-28` State-specific contextual rail · `FD-S-29` sticky priority order.

**Companion documents**

- `state-ad-inventory-reconciliation.md` — the measured audit this proposal builds on
- `../08-decisions/state-page-founder-decisions.md` (`ST-DEC-001`) — the rulings
- `../04-page-specifications/state/state-page-founder-review.md` — open decisions
- `../04-page-specifications/state/state-page-section-and-view-model-specification.md` — the governed section order and `AdAnchor` shape
- `home-ad-inventory-reconciliation.md` — **reused only** for guard and anchor-subposition mechanics, not for State composition

---

## 0. Three findings that shape the problem

§0.1 and §0.2 were derived directly from the production template, not from the LRG-SPEC-017 summary.
§0.3 is the founder correction recorded by LRG-ADS-020.

### 0.1 Florida is not in the top-promo-bar state gate

`sp_toppromobar` is wrapped in a Struts conditional at `lottery-result_upgrade_as_new.jsp` L219–L230
listing exactly nine state codes:

```
ny · tx · oh · ma · va · pa · mi · mn · or
```

**`fl` is not among them.** On a Florida page, legacy production renders **no** top promo bar.
Excluding `sp_toppromobar` from the Florida preview is therefore **exact legacy parity, not an
inventory reduction** — and `OPEN-ST-03` (the gate's intent) stops being a Florida-preview blocker. It
remains open for the nine gated states at cross-State rollout.

### 0.2 The legacy sticky rail is already section-bounded

The production sticky mechanism (`_as_new.jsp`, inline script) is:

```js
var stickyAds = document.querySelectorAll('.sticky-ads');
window.addEventListener('scroll', function () {
  for (var i = 0; i < stickyAds.length; i++) {
    var ad = stickyAds[i];
    var section = ad.closest('.c-section');
    if (window.scrollY >= section.offsetTop &&
        window.scrollY <= section.offsetTop + section.offsetHeight - ad.offsetHeight)
      { ad.classList.add('sticky') } else { ad.classList.remove('sticky') }
  }
});
```

A rail slot is pinned **only while the viewport is inside its own `.c-section`**, and is released at
that section's boundary. `.sticky-ads.sticky { position: fixed; top: 0 }` sits inside
`@media (min-width: 992px)`, so stickiness is desktop-only.

**This is exactly the behaviour `FD-S-28` requires** — *"sticky only where they cannot travel across
protected claim, result, correction or responsible-play content."* The rail model below therefore
**preserves the legacy section-bounded semantic** rather than inventing one, and explicitly does not
adopt the Home page-level sticky rail.

### 0.3 Host eligibility — an empty-state shell is not an advertising host

**Founder ruling, `APP-ST-01` / `APP-ST-04` / `APP-ST-05`.** A contextual-rail or mobile-inline
advertisement may render beside a governed section **only when that section contains substantive real
content appropriate to the page**. A required empty-state shell does not automatically qualify.

The LRG-ADS-019 proposal failed this test in one specific way: it placed four slots against **S-14
Community** and **S-15 News**, both of which are cold-start or empty in the Florida preview (PF-02 §4
permits a sparse hub, and `FD-S-02` suppresses fabricated substitutes). An advertisement hosted by an
empty shell would make the shell's justification commercial rather than editorial — which is what the
correction forbids.

#### What "substantive real content" means — narrow definitions

**S-14 Community qualifies** when it contains **at least one** of:

- a genuine, human-authored discussion;
- a genuine State question;
- a real, approved community collection;
- another PF-02-approved human or community object.

A **fabricated discussion is prohibited** outright (Constitution; PF-02 §27; `FD-S-36`). A generic
cold-start message alone **does not qualify**.

**S-15 News qualifies** when it contains **at least one** of:

- a published State news article;
- a real blog entry;
- a maintained State guide;
- another approved editorial object **with a real destination**.

A generic "news coming soon" shell **does not qualify**.

#### Consequences

1. **Four slots become conditional**, not active: `sp_side_skyscraper_pos3` and
   `sp_mobile_leaderboard_pos2` (both gated on S-14); `sp_side_mpu_pos3` and
   `sp_mobile_leaderboard_pos3` (both gated on S-15).
2. **The desktop rail slot and the mobile-inline slot for a given host are one unit** — they enable
   together and defer together, so a host section never has advertising on one viewport and none on the
   other.
3. **If the condition is not met, the slot stays deferred. It is not moved to another section.**
   Relocating inventory to find a host would reintroduce exactly the behaviour this ruling prohibits.
4. **The Minimum Florida profile (§8.1) is the implementation baseline.** The expanded profiles (§8.2)
   are conditional and must never be described as guaranteed.

---

---

## 1. Verified baseline inventory

Derived by deterministic scan of `lottery-result_upgrade_as_new.jsp` (the template `struts.xml`
actually routes to) plus its `populargames_as.jspf` include.

| Measure | Count |
|---|---:|
| Slots **defined** in the production State template | **24** |
| Slots **effectively rendered** (19 in template + 4 via `populargames_as.jspf`) | **23** |
| In-template render **occurrences** (19 distinct + 1 duplicate) | **20** |
| **Defined but never rendered** | **1** — `sp_side_halfpage_pos1` |
| **Duplicate legacy render** | **1 slot, 2 occurrences** — `sp_mid_leaderboard_pos4` (L771, L829) |
| Slot keys **currently mapped** by all 16 State fixtures | **14** |
| Slots currently **mapped but unreachable** | **2** — `sp_mid_leaderboard_pos4`, `sp_mobile_leaderboard_pos4` |
| State **video** slot | 1 — `atv_video_player` (deferred, `FD-S-26`) |
| Wyoming **record-only** units, not defined in any template | **2** (`FD-S-27`) |

### 1.1 Reconciled per-slot table

Legend — **Legacy**: rendered position in production. **Tier**: `both` = the slot's own GAM size
mapping serves desktop `[992,0]` and mobile `[0,0]`; `desktop` / `mobile` = restricted by a legacy CSS
visibility class. **Prot.**: protected-zone conflict at its legacy position. **Owner**: who must sign
off.

| # | Slot key | Legacy rendered | Current mapping | GAM mapping | Tier | Sticky | State condition | Prot. conflict | Preview disposition | Production disposition | Owner |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `sp_top_billboard` | ✅ L269, below header above H1 | `top` | `horizontaladsTop` | both | no | none | — | **ACTIVE** — AD-S00 | Active | Founder |
| 2 | `sp_side_halfpage_pos1` | ❌ **never** | `rightRail[0]` | `verticalads1` | both | no | none | — | **NOT ACTIVATED** | Pending ad ops | **Ad ops** |
| 3 | `sp_mid_leaderboard_pos1` | ✅ L754, in results list (idx 1) | `inContent[0]` | `horizontalads` | both | no | none | **S-02 result grid** | **ACTIVE** — AD-S01, relocated | Active | Founder |
| 4 | `sp_mid_leaderboard_pos2` | ✅ L788, in results list (idx 5) | `inContent[1]` | `horizontalads` | **desktop** (`mobi-ads0`) | no | none | **S-02 result grid** | **ACTIVE** — AD-S02 desktop, relocated | Active | Founder |
| 5 | `sp_mid_leaderboard_pos3` | ✅ L812, in results list (idx 7) | `inContent[2]` | `horizontalads` | both | no | none | **S-02 result grid** | **DEFERRED** — no anchor capacity | Restore at rollout | Founder + ad ops |
| 6 | `sp_mid_leaderboard_pos4` | ✅ L771 **and** L829 — duplicate id | `inContent[3]` (unreachable) | `horizontalads` | both | no | none | **S-02 result grid** | **DEFERRED** — `FD-S-23` | One position or retire | Founder + ad ops |
| 7 | `sp_side_mpu_pos2` | ✅ L1229, rail beside Winning History | `rightRail[1]` | `verticalads1` | both | **yes** | none | — | **ACTIVE** — AD-SR01 @ S-10 | Active | Founder |
| 8 | `sp_side_mpu_pos3` | ✅ L1294, rail beside About-[State]/blog | — | `verticalads` | both | no | none | — | **CONDITIONAL** — AD-SR01 @ S-15, only if S-15 has substantive real content (§0.3) | Active | Founder |
| 9 | `sp_side_mpu_pos4` | ✅ L1442, **inside How-to-Claim** | — | `verticalads` | both | no | none | **S-08 claim zone** | **ACTIVE** — AD-SR01 @ S-06, relocated | Active | Founder |
| 10 | `sp_side_mpu_pos5` | ✅ L1637, beside claim video | — | `verticalads` | both | no | none | **S-08 claim zone** | **DEFERRED** — no permitted host renders in preview | Restore at rollout | Founder |
| 11 | `sp_side_skyscraper` | ✅ L1954, rail beside Cut-Off Time | `rightRail[2]` | `verticalads1` | both | **yes** | none | — | **DEFERRED** — host section (S-04) conditional | Active when S-04 ships | Founder |
| 12 | `sp_mid_leaderboard` | ✅ L1867, after How-to-Play cards | — | `horizontalads` | both | no | none | — | **DEFERRED** — no anchor capacity | Restore at rollout | Founder + ad ops |
| 13 | `sp_bottom_billboard` | ✅ L2058, end of Facts section | `bottom` | `horizontalads1` | both | no | none | — | **DEFERRED** — no anchor capacity | Restore at rollout | Founder + ad ops |
| 14 | `sp_bottom_large_leaderboard` | ✅ L2199, sticky closable footer | `stickyFooterAd` | `horizontalads2` | both | **yes (footer)** | none | — | **ACTIVE** — AD-SM01 sticky | Active | Founder |
| 15 | `sp_side_skyscraper_pos2` | ✅ L2161, rail beside state directory | — | `verticalads1` | both | **yes** | none | — | **ACTIVE** — AD-SR01 @ S-18 | Active | Founder |
| 16 | `sp_side_skyscraper_pos3` | ✅ L2117, rail beside FAQ | — | `verticalads1` | both | **yes** | none | — | **CONDITIONAL** — AD-SR01 @ S-14, only if S-14 has substantive real content (§0.3) | Active | Founder |
| 17 | `sp_mid_leaderboard_pos5` | ✅ L2182, last element before footer | — | `horizontalads` | both | no | none | — | **ACTIVE** — AD-S04 | Active | Founder |
| 18 | `sp_mid_leaderboard_pos6` | ✅ L1095, top of Winning History | — | `horizontalads` | both | no | none | — | **ACTIVE** — AD-S03 | Active | Founder |
| 19 | `sp_mobile_leaderboard_pos1` | ✅ `populargames` L38 | `mobileInContent[0]` | `horizontalads2` | **mobile** (`desk-ads0`) | no | none | — | **ACTIVE** — AD-S02 mobile | Active | Founder |
| 20 | `sp_mobile_leaderboard_pos2` | ✅ `populargames` L55 | `mobileInContent[1]` | `horizontalads2` | **mobile** | no | none | — | **CONDITIONAL** — AD-SM01 after S-14, only if S-14 qualifies (§0.3) | Active | Founder |
| 21 | `sp_mobile_leaderboard_pos3` | ✅ `populargames` L73 | `mobileInContent[2]` | `horizontalads2` | **mobile** | no | none | — | **CONDITIONAL** — AD-SM01 after S-15, only if S-15 qualifies (§0.3) | Active | Founder |
| 22 | `sp_mobile_leaderboard_pos4` | ✅ `populargames` L89 | `mobileInContent[3]` (unreachable) | `horizontalads2` | **mobile** | no | none | — | **DEFERRED** — no anchor capacity | Restore at rollout | Founder + ad ops |
| 23 | `atv_video_player` | ✅ L792, in results list (idx 5) | — | none, fixed `[300,168]` | **mobile** (`desk-ads0`) | no | none | **S-02 result grid** | **DISABLED** — `FD-S-26` | Pending ad ops | **Ad ops** |
| 24 | `sp_toppromobar` | ✅ L236, sticky above header | — | none, fixed `[[430,71],'fluid',[1920,45]]` | both | **yes (top)** | **9 states only — not `fl`** | — | **NOT APPLICABLE to `fl`** — exact parity | Gate decision at rollout | **Ad ops** + founder |
| — | `wy_on_results_table_pos1` | ❌ not defined anywhere | — | none recorded | ? | ? | `wy` only (claimed) | — | **INACTIVE** — `FD-S-27` | Pending ad ops | **Ad ops** |
| — | `wy_on_results_table_pos2` | ❌ not defined anywhere | — | none recorded | ? | ? | `wy` only (claimed) | — | **INACTIVE** — `FD-S-27` | Pending ad ops | **Ad ops** |

**Totals by profile** — see §8.1 and §8.2 for the full accounting:

| Profile | Active | Deferred | Sum |
|---|---:|---:|---:|
| **Minimum Florida preview** *(implementation baseline)* | **10** | **14** | 24 |
| Expanded — S-14 qualifies only | 12 | 12 | 24 |
| Expanded — S-15 qualifies only | 12 | 12 | 24 |
| Fully expanded — S-14 **and** S-15 qualify | 14 | 10 | 24 |

All four columns are **production-template-defined slots only**. The two Wyoming record-only units sit
**outside** this baseline and are never added to these subtotals (§8.1).

---

## 2. The anchor model

Exactly the seven PF-02 anchors. **No additional governed State ad-anchor ID is created.**

| Anchor | PF-02 position | Governed boundary | Permitted subpositions |
|---|---|---|---|
| **AD-S00** | 2 — after S-01 | after State Identity, before Latest Results | primary inline |
| **AD-S01** | 5 — after S-03 | after State AI Brief, before Live & Upcoming Draws | primary inline |
| **AD-S02** | 9 — after S-06 | after State Game Portfolio, before Where to Play | primary inline · mobile-inline *(device-exclusive)* |
| **AD-S03** | 15 — after S-10 | after State Tools, History & Statistics | primary inline |
| **AD-S04** | 24 — after S-18 | after All States, before the footer | primary inline |
| **AD-SR01** | no fixed sequence position | desktop contextual rail, section-bounded | contextual rail ×5 |
| **AD-SM01** | no fixed sequence position | mobile inline + sticky footer | mobile-inline ×2 · sticky-mobile ×1 |

**Anchors are governed positions, not single-slot limits** — but a *visible* position is exclusive per
viewport. An anchor may carry two slots only when they are **device-exclusive** (one desktop-only, one
mobile-only), which is exactly what legacy did at its index-5 branch (`sp_mid_leaderboard_pos2`
desktop-only beside `atv_video_player` mobile-only). Only AD-S02 uses that pattern here.

### 2.1 Prohibited placements — enforced structurally, not by convention

No advertisement may render:

- inside S-02 result cards or result-verification content;
- between S-05 ticket-check input and output;
- inside an S-03 AI answer;
- inside a correction notice (the `FD-S-07` notice surface);
- inside S-08 / S-08A claim, tax or anonymity facts;
- inside responsible-play guidance (S-17);
- where a sticky rail slot can travel across any of the above.

Every anchor boundary above sits **between** governed sections, never inside one. The rail is bounded
to five explicitly non-protected host sections (§5). Verified by script check E.

### 2.2 Content boundary between consecutive inline anchors

No two inline anchors are adjacent — each pair is separated by governed content even with the four
`FD-S-02` suppressions applied:

| Pair | Governed sections between them (Florida preview) |
|---|---|
| AD-S00 → AD-S01 | S-02 Results · S-03 AI Brief |
| AD-S01 → AD-S02 | S-04 Live · S-05 Check Ticket · S-06 Games |
| AD-S02 → AD-S03 | S-07 Where to Play · S-08 Player Help · S-08A Essentials · S-10 Tools |
| AD-S03 → AD-S04 | S-14 Community · S-15 News · S-16 Follow · S-17 Trust · S-18 All States |

**No two large advertisements are back-to-back.** No three-ad stack exists anywhere in the proposal.

---

## 3. Proposed distribution — guarded Florida anonymous preview

Reserved geometry is read at render time from each slot's own recorded size mapping in
`04-sample-data/ad-slot-definitions.json` — **no dimension is restated or invented here**. Desktop
reservation comes from the `[992,0]` tier, mobile from `[0,0]`.

### 3.1 Inline anchors

| Anchor | Order | Slot | Subposition | Desktop ≥992 | Mobile <992 | Sticky | Lazy | Why this position is permitted |
|---|---:|---|---|---|---|---|---|---|
| **AD-S00** | 1 | `sp_top_billboard` | primary inline | ✅ | **❌ INACTIVE — `FD-X-04`** | no | **eager** (desktop) | Exact legacy position — L269, between site chrome and page identity. PF-02 §13: no ad inside the header; AD-S00 follows it. **`FD-X-04` (LRG-DEC-024): must not reserve or display advertising below 992 px during the State preview, because the first verified result must precede all advertising on mobile (`FD-X-03`). Desktop unchanged. No relocation, no replacement slot.** |
| **AD-S01** | 1 | `sp_mid_leaderboard_pos1` | primary inline | ✅ | ✅ | no | lazy | **Relocated** from the S-02 result grid (`FD-S-21`, `FD-S-25`). Earliest post-results inline position; sits after S-03, outside the AI answer |
| **AD-S02** | 1 | `sp_mid_leaderboard_pos2` | primary inline | ✅ | ❌ | no | lazy | **Relocated** from the result grid. Legacy device class `mobi-ads0` (hidden ≤991) is **preserved exactly** — this is not a new restriction |
| **AD-S02** | 2 | `sp_mobile_leaderboard_pos1` | mobile-inline | ❌ | ✅ | no | lazy | Device-exclusive counterpart. Legacy class `desk-ads0` (hidden ≥992) preserved. Fills the mobile tier that `pos2` vacates, so AD-S02 is never empty |
| **AD-S03** | 1 | `sp_mid_leaderboard_pos6` | primary inline | ✅ | ✅ | no | lazy | Natural fidelity — legacy L1095 opens the Winning-History section, which is S-10 Tools, History & Statistics |
| **AD-S04** | 1 | `sp_mid_leaderboard_pos5` | primary inline | ✅ | ✅ | no | lazy | Exact legacy position — L2182, the last element before the footer include, which is AD-S04's definition |

**No-fill behaviour, all inline slots:** the DS-24 treatment — collapse the inner creative area, retain
the outer placement geometry, suppress the label — **pending `OPEN-ST-04` validation** (see §8).


#### 3.1.1 `AD-S00` mobile inactive state — founder supersession (`FD-X-04`, LRG-DEC-024)

**Recorded here as the explicit disposition `FD-S-22` requires** ("do not reduce or add inventory silently").

| | Before (`APP-ST-01`) | After (`FD-X-04`) |
|---|---|---|
| Slot mapped to `AD-S00` | `sp_top_billboard` | **unchanged** |
| Anchor position | PF-02 position 2, after S-01 | **unchanged — no relocation** |
| Desktop ≥ 992 px | active, eager | **unchanged — active, eager** |
| **Mobile < 992 px** | **active** | **INACTIVE during the State preview** |
| Approved profile count | 10 active / 14 deferred | **unchanged** — a viewport-scoped inactive state is **not** an inventory reduction |
| Replacement mobile slot | — | **none — explicitly forbidden before the first verified result** |

**Why.** `FD-X-03` makes the first verified result precede every advertising reservation below 992 px. In
the guarded Florida preview `AD-S00` currently renders before the first result on mobile, so its mobile tier
is the reservation that must stand down.

**Scope.** `AD-S00` below 992 px only, during the State preview. `APP-ST-01` … `APP-ST-06` are otherwise
intact. **`FD-S-24` is unaffected** — it forbids a 992–1023 px inventory gap, and `AD-S00` remains active
across that entire band. **`FD-S-21`, `FD-S-22`, `FD-S-23`, `FD-S-25` … `FD-S-29` are unchanged.**

**Ownership.** Ad operations continues to own delivery validation. **Ad operations does not own the product
content hierarchy** — the ordering requirement is a founder decision. Reconsidering mobile inventory at an
approved lower boundary remains open to ad operations with founder approval.

**Net visible placements:** desktop unchanged; **mobile reduces by one** (6 → 5 in the Florida preview).

**Lazy-load:** `AD-S00` is eager (above the fold, matching the recorded `eagerAboveFold: true`); all
others lazy at the recorded `lazyLoadMarginPx: 300`. **Recorded divergence:** the legacy
`IntersectionObserver` uses **no** `rootMargin`, so the 300 px value is recorded implementation intent,
not measured legacy behaviour. Flagged to ad operations (§9 Q6).

### 3.2 Anchor occupancy at every threshold

| Anchor | ≤991 px | **992–1023 px** | ≥1024 px |
|---|---|---|---|
| AD-S00 | **inactive — `FD-X-04`** | `sp_top_billboard` | `sp_top_billboard` |
| AD-S01 | `sp_mid_leaderboard_pos1` | `sp_mid_leaderboard_pos1` | `sp_mid_leaderboard_pos1` |
| AD-S02 | `sp_mobile_leaderboard_pos1` | `sp_mid_leaderboard_pos2` | `sp_mid_leaderboard_pos2` |
| AD-S03 | `sp_mid_leaderboard_pos6` | `sp_mid_leaderboard_pos6` | `sp_mid_leaderboard_pos6` |
| AD-S04 | `sp_mid_leaderboard_pos5` | `sp_mid_leaderboard_pos5` | `sp_mid_leaderboard_pos5` |
| AD-SR01 | *(collapsed)* | **3 rail slots** (+1 per qualifying host, §0.3) | **3 rail slots** (+1 per qualifying host) |
| AD-SM01 | sticky only (+1 mobile-inline per qualifying host) | sticky only | sticky only |

**Every inline anchor is occupied at every width, in every profile — with one deliberate founder exception:
`AD-S00` below 992 px (`FD-X-04`, see §3.1). That exception does not create a device-pair gap, because
`AD-S00` has no device-exclusive counterpart; its mobile tier is simply inactive during the State preview.**
The 992–1023 px band is fully
covered: the rail appears at **992**, not 1024, and the single device-exclusive pair switches at the
same **992** px boundary. There is no width at which a desktop/mobile replacement pair is hidden
simultaneously (`FD-S-24`). Because conditional slots enable in desktop/mobile pairs (§0.3), adding or
removing a qualifying host cannot open a gap. Verified by script check D across all four profiles.

### 3.3 Two defects this distribution fixes

1. **Placement is resolved by governed section boundary, not by result-group index.** The current
   implementation renders `inContent[gi]` / `mobileInContent[gi]` keyed to the result-group index, so
   Maine's two groups silently drop two mapped slots and the fourth slot is unreachable on every
   state. Anchors resolve from the State section manifest instead.
2. **No Florida-only code path.** Allocation is keyed to governed section IDs and the state's
   `ST-01…ST-07` profile. Nothing in this proposal branches on `stateCode`.

---

## 4. The eight-inline-slot problem

The State inventory holds **eight** normal inline horizontal slots plus the top billboard, against
**four** normal inline PF-02 anchors after AD-S00.

### 4.1 Options evaluated

| Option | Verdict | Reason |
|---|---|---|
| **(a)** Multiple sequential subpositions within one anchor, separated by governed content | **Rejected** | PF-02 §12 fixes each anchor at one sequence position. A second inline slot placed after a *different* governed section is a new anchor in all but name, which §2 forbids. The only anchor with content after it and before the footer is AD-S04, and PF-02 places nothing between S-18 and the footer |
| **(b)** Desktop / mobile alternative mappings | **Accepted, once** | Legitimate and legacy-precedented, but capacity is bounded by what exists: only **one** slot (`sp_mid_leaderboard_pos2`) is desktop-only in legacy, and the mobile-only snippets can occupy a mobile tier only where a desktop-only slot vacates it. Used at AD-S02. Converting an all-widths slot to desktop-only to free more mobile tiers would **reduce that slot from two tiers to one** — an inventory reduction `FD-S-22` forbids doing silently. Offered as Option B in §4.3 |
| **(c)** Move eligible inventory to AD-SR01 | **Rejected — technically invalid** | The eight inline slots use `horizontalads` / `horizontalads1` (desktop tier 728×90, 970×250). The rail is a 300 px column carrying `verticalads` / `verticalads1` (160×600, 300×600, 300×250). A 728×90 creative cannot serve there, and `FD-S-24` forbids changing GAM size mappings. **This is a hard constraint, not a preference** |
| **(d)** Disable unreachable and invalid duplicate renders | **Accepted** | `sp_mid_leaderboard_pos4`'s second render is an invalid duplicate DOM id; `sp_mobile_leaderboard_pos4` is unreachable today. Neither is a valid position (`FD-S-23`). This removes two false capacity claims but does not create anchor capacity |
| **(e)** Defer specific inventory pending ad-operations evidence | **Accepted — the residual mechanism** | Four inline slots exceed governed capacity and are deferred with a recorded reason, not retired |
| Three-ad stack | **Prohibited by the task and by Global Shell §122** | Not proposed anywhere |

### 4.2 Recommendation

**Place five inline slots (one per anchor, plus the AD-S02 device-exclusive pair = six placements);
defer four inline slots with recorded reasons.**

Selection was by **positional fidelity to the legacy render**, so that every placed slot keeps a
defensible relationship to where it actually served:

| Anchor | Slot chosen | Fidelity basis |
|---|---|---|
| AD-S00 | `sp_top_billboard` | exact *(desktop only during the State preview — `FD-X-04`)* |
| AD-S01 | `sp_mid_leaderboard_pos1` | earliest post-results inline; relocated from a prohibited zone |
| AD-S02 | `sp_mid_leaderboard_pos2` + `sp_mobile_leaderboard_pos1` | device classes exact; positions relocated |
| AD-S03 | `sp_mid_leaderboard_pos6` | exact — legacy opens the history section |
| AD-S04 | `sp_mid_leaderboard_pos5` | exact — legacy's last pre-footer element |

**Deferred inline (4):** `sp_mid_leaderboard_pos3` · `sp_mid_leaderboard_pos4` ·
`sp_mid_leaderboard` · `sp_bottom_billboard`.

Two of these — `sp_mid_leaderboard` (legacy: after How-to-Play, the natural AD-S02 boundary) and
`sp_bottom_billboard` (legacy: end of the Facts section) — have **better positional fidelity than the
slots that displaced them**. They lost only because the device-exclusive pair at AD-S02 activates two
slots where a responsive slot would activate one. **This trade is the substance of founder approval
`APP-ST-02`**, and Option B below reverses it.

### 4.3 Option B — offered, not recommended

Make AD-S03 and AD-S04 desktop-only primaries paired with `sp_mobile_leaderboard_pos2` / `_pos3`, and
restore `sp_mid_leaderboard` and `sp_bottom_billboard` at AD-S02 and AD-S03.

- **Gains:** two more slots active (16 rather than 14); better positional fidelity for the horizontal
  inventory.
- **Costs:** `sp_mid_leaderboard_pos6` and `sp_mid_leaderboard_pos5` each drop from two tiers to one,
  which is an inventory reduction requiring explicit ad-operations sign-off; and mobile then carries
  three 320×50 snippets where legacy carried them inside one list.
- **Why not recommended:** Option A changes no slot's tier coverage from its legacy behaviour. Option B
  does, for a net gain of two placements.

---

## 5. The contextual rail — AD-SR01

**State-specific, section-bounded, desktop-only.** Not the Home rail (`FD-S-28`).

### 5.1 Slots and section ranges

**Approved initial rail candidates (`APP-ST-04`)** — unconditional, they render in every Florida
preview profile:

| Order | Slot | Host section | Sticky in legacy | Sticky proposed | Basis |
|---:|---|---|---|---|---|
| 1 | `sp_side_mpu_pos4` | **S-06** State Game Portfolio | no | no | **Relocated** out of the S-08 claim journey (`FD-S-21`, `FD-S-25`). S-06 is the nearest permitted non-protected host and carries a real game list |
| 2 | `sp_side_mpu_pos2` | **S-10** Tools, History & Statistics | yes | **yes** | Exact fidelity — legacy hosts it in the Winning-History section |
| 3 | `sp_side_skyscraper_pos2` | **S-18** All States / Change State | yes | **yes** | Exact fidelity — legacy hosts it beside the state directory, which is a real, populated list |

**Conditional rail candidates (`APP-ST-04`)** — deferred unless their host section satisfies the §0.3
content-host rule:

| Slot | Host section | Enables only when | Sticky proposed |
|---|---|---|---|
| `sp_side_skyscraper_pos3` | **S-14** State Community | S-14 contains at least one genuine human-authored discussion, State question, approved community collection, or other PF-02-approved human/community object | **yes** |
| `sp_side_mpu_pos3` | **S-15** State News, Blog & Guides | S-15 contains at least one published State news article, real blog entry, maintained State guide, or other approved editorial object with a real destination | no |

**A cold-start Community shell, a "no discussions yet" state, an unavailable state, or an empty News
hub must not exist primarily to host advertising.** If the condition is not met the slot remains
deferred — **it is not moved to another section.**

**Deferred from the rail regardless of profile:** `sp_side_skyscraper` (its legacy host, Cut-Off Time,
maps to S-04, which is conditional on verified cutoff data) · `sp_side_mpu_pos5` (no permitted host
section renders in the Florida preview, because S-09, S-11, S-12 and S-13 are suppressed by `FD-S-02`) ·
`sp_side_halfpage_pos1` (defined but never rendered in legacy — not part of the rendered baseline,
`FD-S-23`; inactive until ad operations confirms, `APP-ST-03`).

**Rail size by profile:** 3 slots (Minimum) · 4 (one host qualifies) · 5 (both qualify).

### 5.2 Sticky start and stop

**Preserve the legacy section-bounded semantic exactly** (§0.2): a rail slot pins on entering its host
section and releases at that section's end. It can never travel into an adjacent section.

Because the host sections are **S-06, S-10 and S-18** unconditionally, plus **S-14 and S-15** only when
they qualify under §0.3, no rail slot can reach S-02 (results), S-08 or S-08A (claims, tax, anonymity),
S-17 (responsible play), or the `FD-S-07` correction surface — in any profile. The prohibition is
structural, a consequence of host-section assignment, not a runtime check.

Two further rules:

- A rail slot whose host section enters a **corrected** or **source-outage** state is suppressed for as
  long as that state holds, because a correction notice may be rendered within it.
- Stickiness is desktop-only, matching `@media (min-width: 992px)` in legacy.

### 5.3 Threshold and fallback

- **Rail appears at ≥ 992 px** — the single `FD-S-24` threshold, not Tailwind's 1024 px `lg`.
- **Below 992 px the rail collapses and rail slots do not render.** Legacy did render them inline on
  mobile (they carry `mobi-ads*` classes and a `verticalads*` mobile tier), so this is a **recorded
  mobile inventory reduction for five slots**, proposed because reinstating five vertical units in the
  mobile flow would breach Global Shell §122 (excessive mobile density). Their mobile-tier counterpart
  is the AD-SM01 snippet allocation in §6. **Requires ad-operations sign-off — §9 Q10.**
- **Tablet:** GAM has no tablet tier. Below 992 px a tablet resolves to the mobile `[0,0]` tier, which
  is a production fact, not an omission.

### 5.4 Why this is not one endlessly sticky column

Three to five slots, each on a **disjoint** host section, one at a time. At any scroll position at most
**one** rail slot is pinned, and it is released before the next host section begins. There is no
rotation mechanism and no carousel — the rail is a sequence of section-scoped placements, which is what
makes `FD-S-28` enforceable. Fewer qualifying hosts simply means a shorter sequence, never a slot
looking for somewhere else to sit.

---

## 6. Mobile placement — AD-SM01

### 6.1 The four mobile snippet slots

**They are alternatives, not additive inventory.** Each is `device: "mobile"`, 320×50, hidden ≥992 px
by the legacy `desk-ads0` class. A snippet can occupy a mobile tier only where no responsive slot
already serves it — otherwise it produces a mobile stack, which §2 prohibits.

| Slot | Role | Placement | Boundary | Condition |
|---|---|---|---|---|
| `sp_mobile_leaderboard_pos1` | **Alternative** — mobile counterpart of `sp_mid_leaderboard_pos2` | AD-S02, mobile-inline | after S-06, before S-07 | **Unconditional** — S-06 carries a real game list |
| `sp_mobile_leaderboard_pos2` | Mobile counterpart of the S-14 rail region | AD-SM01, mobile-inline | after S-14, before S-15 | **Conditional** — only when S-14 has substantive real content (§0.3). Enables and defers **together with** `sp_side_skyscraper_pos3` |
| `sp_mobile_leaderboard_pos3` | Mobile counterpart of the S-15 rail region | AD-SM01, mobile-inline | after S-15, before S-16 | **Conditional** — only when S-15 has substantive real content (§0.3). Enables and defers **together with** `sp_side_mpu_pos3` |
| `sp_mobile_leaderboard_pos4` | **DEFERRED** (`APP-ST-03`) | — | — | Remains deferred until a valid governed mobile boundary exists |

**Counterpart alignment is a hard rule.** For a conditional host, the desktop rail slot and the
mobile-inline slot are one unit: a qualifying host enables both, a non-qualifying host defers both. A
host section is therefore never advertised on one viewport and bare on the other.

Legacy rendered all four inside the Popular Games list at item indices 3/6/9/12 — four 320×50 units
within a single section. Distributing three across separate governed section boundaries and deferring
the fourth is a density improvement, and it is the mechanism by which mobile retains inventory where
the rail collapses.

### 6.2 The sticky footer

`sp_bottom_large_leaderboard` — AD-SM01, **sticky-mobile** subposition, both tiers
(`horizontalads2`: 728×90 desktop / 320×50 mobile), closable, rendered at all widths as in legacy.

`FD-S-29` priority, absolute: **safety/system → bottom navigation → user-requested action →
advertising.**

- **Clearance is derived**, never hardcoded: reserved sticky height + bottom-navigation height +
  spacing + `env(safe-area-inset-bottom)`. This replaces the current hardcoded `pb-28`.
- **If bottom navigation is visible**, the sticky ad sits above it with safe spacing, or is suppressed.
- **The State preview introduces no sticky purchase action** (`FD-S-29`), so only two sticky layers can
  ever coexist. Should a sticky user-requested action be introduced later, it outranks advertising and
  the sticky ad is suppressed — not merely repositioned.
- A focus indicator must never be obscured by the sticky layer (`FD-S-13`, DS-15). The legacy
  `#stickyAd { z-index: 9999 }` with no focus management is **not** carried forward.
- Production uses a 1-hour `hideAd` cookie for the close action; the preview's session state is an
  acknowledged simplification.

**Final creative height remains DS-26/DS-34 deferred.** The State sticky uses `horizontalads2`, whose
mobile tier maxes at 320×50, so the State unit does not carry the Home unit's ~230 px shortfall risk.

### 6.3 At 991 px and 992 px

| Width | AD-S02 | AD-SR01 | AD-SM01 mobile-inline | Sticky footer |
|---|---|---|---|---|
| **991 px** | `sp_mobile_leaderboard_pos1` | collapsed | `pos2` / `pos3` **only if their host qualifies** | visible (320×50 tier) |
| **992 px** | `sp_mid_leaderboard_pos2` | 3–5 rail slots appear, per qualifying hosts | suppressed | visible (728×90 tier) |

One synchronized switch. Nothing is hidden on both sides of it.

---

## 7. Duplicate and unreachable mappings — `FD-S-23`

| Slot | Finding | Recommendation |
|---|---|---|
| **`sp_mid_leaderboard_pos4`** | Rendered **twice** in legacy with the **same DOM id** (L771 at result index 3, L829 at index 12). GPT fills only the first; the second is invalid HTML. Currently mapped to `inContent[3]`, which **never renders** because no state has a fourth result group | **Not two valid inventory positions.** One legacy render is a defect, not capacity. Its only legacy position class was the prohibited result grid. **DEFERRED** — one valid anchor position or explicit retirement, pending ad-operations confirmation that its line items still deliver. Not restored as a duplicate under any circumstances |
| **`sp_mobile_leaderboard_pos4`** | Mapped to `mobileInContent[3]`; **unreachable** for the same result-group-index reason. Legacy rendered it in Popular Games at item index 12 | **A mapped-but-unreachable slot is not preserved inventory.** **DEFERRED** with a recorded reason. Restorable at rollout once a fourth governed mobile boundary exists |
| **`sp_side_halfpage_pos1`** | **Defined but never rendered** in legacy — verified across the production template, `_as.jsp`, `_special.jsp`, all five no-lottery templates and `florida_newVersion.jsp`. Yet the current fixture maps it as `rightRail[0]`, so the new implementation **renders a placement legacy never served** | **A defined-but-never-rendered legacy slot is not part of the rendered baseline.** **NOT ACTIVATED.** The current activation is withdrawn for the preview pending ad-operations confirmation of whether the omission was intentional (§9 Q5) |

None of these three is retired by this proposal. All three remain recorded inventory with a stated
reason, per `FD-S-22`.

---

## 8. Preview versus production

### 8.1 Minimum Florida preview profile — the implementation baseline

**Accounting correction (`APP-ST-01`, LRG-ADS-020).** The LRG-ADS-019 wording *"Excluded pending
ad-operations review — 3 — `sp_side_halfpage_pos1`, `atv_video_player`, Wyoming ×2"* named **four**
units under a subtotal of **three**, and mixed template-defined slots with record-only units. The two
Wyoming units are **not among the 24 production-template definitions** and must never be folded into a
template-defined subtotal. The accounting below reports the two populations separately, and never
combines them.

#### Population A — production-template-defined slots: **24**

| Line | Count | Slots |
|---|---:|---|
| **Preview-ACTIVE defined slots** | **10** | `sp_top_billboard` · `sp_mid_leaderboard_pos1` · `sp_mid_leaderboard_pos2` · `sp_mid_leaderboard_pos5` · `sp_mid_leaderboard_pos6` · `sp_mobile_leaderboard_pos1` · `sp_side_mpu_pos2` · `sp_side_mpu_pos4` · `sp_side_skyscraper_pos2` · `sp_bottom_large_leaderboard` |
| **Preview-DEFERRED / DISABLED defined slots** | **13** | *conditional on host eligibility (4):* `sp_side_skyscraper_pos3` · `sp_side_mpu_pos3` · `sp_mobile_leaderboard_pos2` · `sp_mobile_leaderboard_pos3` — *no anchor capacity (3):* `sp_mid_leaderboard_pos3` · `sp_mid_leaderboard` · `sp_bottom_billboard` — *duplicate / unreachable (2):* `sp_mid_leaderboard_pos4` · `sp_mobile_leaderboard_pos4` — *host section not in preview (2):* `sp_side_skyscraper` · `sp_side_mpu_pos5` — *awaiting ad operations (2):* `sp_side_halfpage_pos1` · `atv_video_player` |
| **NON-APPLICABLE to Florida** | **1** | `sp_toppromobar` — the nine-state gate excludes `fl`, so absence is exact legacy parity, not a deferral (§0.1) |
| **Population A total** | **24** | 10 + 13 + 1 |

#### Population B — record-only units outside the template baseline: **2**

| Line | Count | Units |
|---|---:|---|
| **External record-only, awaiting validation** | **2** | `wy_on_results_table_pos1` · `wy_on_results_table_pos2` — recorded in `ad-slot-definitions.json` as `pageType: "state"` but with **zero `defineSlot` calls and zero renders** anywhere in the legacy tree. Inactive under `FD-S-27` / `APP-ST-06`; evidence retained |

**The two populations are never summed.** "24" always means production-template-defined slots. The
Wyoming units are reported as a separate line and enter no subtotal.

#### Rendering form

All 10 active slots render as **reserved, labelled placeholders — no live GAM**. One **filled** and one
**no-fill** representative are required for the founder visual review (DS-23, DS-24). Preview
placeholders are **not** live GAM activation: no `googletag` call, no AdSense, no GA4/GTM, no push.
DS-22 and DS-25 hold, and the consent layer — a precondition for any partner script — does not exist.

### 8.2 Conditional expanded profiles — not guaranteed

The expanded profiles apply **only** when a host section independently satisfies the §0.3 content-host
rule. **They are conditional. The Minimum profile is the implementation baseline, and no plan, forecast
or review should assume an expanded profile will be reached.**

| Profile | Trigger | Incremental slots enabled | Active | Deferred |
|---|---|---|---:|---:|
| **Minimum** | *(default)* | — | **10** | **14** |
| **Expanded — S-14** | S-14 Community contains ≥1 genuine human-authored discussion, State question, approved community collection, or other PF-02-approved human/community object | `sp_side_skyscraper_pos3` (rail, desktop) **+** `sp_mobile_leaderboard_pos2` (mobile-inline) | **12** | 12 |
| **Expanded — S-15** | S-15 News contains ≥1 published State news article, real blog entry, maintained State guide, or other approved editorial object with a real destination | `sp_side_mpu_pos3` (rail, desktop) **+** `sp_mobile_leaderboard_pos3` (mobile-inline) | **12** | 12 |
| **Fully expanded** | **Both** S-14 and S-15 qualify | all four of the above | **14** | 10 |

*(Deferred counts above include the non-applicable `sp_toppromobar`; Population A always totals 24.)*

Three rules govern the transition between profiles:

1. **Each host is evaluated independently.** S-14 qualifying does not enable the S-15 pair.
2. **Enable in pairs.** A qualifying host enables its desktop rail slot **and** its mobile-inline
   counterpart together, so 992 px coverage stays symmetric at that section.
3. **Never relocate on failure.** A non-qualifying host leaves its two slots deferred; neither is
   re-homed to another section (`APP-ST-04`).

A section that later loses its substantive content — a discussion deleted, an article unpublished —
returns to the Minimum profile for that host. Eligibility is evaluated per render, not latched.

### 8.3 Production State family — unresolved before activation

| Item | Owner | Note |
|---|---|---|
| Delivery confirmation for all 24 State GAM units | Ad ops | Which units still have active line items |
| Top promo-bar nine-state gate | Ad ops + founder | `OPEN-ST-03`; not a Florida blocker (§0.1) |
| No-fill behaviour | Ad ops | `OPEN-ST-04`; three conflicting specifications, source Conflict 15 |
| State `atv_video_player` | Ad ops | `FD-S-26` / `OPEN-ST-02`; source Conflict 17 |
| Wyoming units | Ad ops | `FD-S-27` / `OPEN-ST-02`; source Conflict 16 |
| No-lottery (ST-06) inventory profile | Ad ops + founder | Production renders **10** on `state_{al,ak,hi,ut,nv}.jsp`: `sp_top_billboard`, `sp_side_mpu_pos3`, `sp_side_skyscraper_pos2`, `_pos3`, `sp_mid_leaderboard_pos5`, `sp_bottom_large_leaderboard` + 4 mobile snippets. **No `sp_toppromobar`.** Ratification per `FD-S-22`/`FD-S-31` |
| Per-State density | Ad ops | Legacy varied inventory by game count (WY 1 of 5 in-results slots; AZ/MA/MN 3 of 5). The anchor model removes that accidental variance — confirm that is acceptable |
| Refresh / viewability rules | Ad ops | **No refresh mechanism exists in legacy** — no timer, no `refresh()` call. If any line item assumes refresh, it is not being served by this page today |
| 992 px synchronized switch | Ad ops | `FD-S-24` is approved *subject to* this validation |
| `state=<code>` targeting | Ad ops | Legacy calls `setTargeting('state', [stateCode])`; must survive the rebuild |
| Restoration of the 4 deferred inline slots and `sp_mobile_leaderboard_pos4` | Founder + ad ops | Depends on which suppressed sections become sourced |

---

## 9. Ad-operations question set

Ten questions, each answerable from GAM and delivery data alone. **Ad operations is not asked to
decide product architecture or protected-zone policy** — those are settled by `FD-S-21` and PF-02.

1. **Delivery:** which of the 24 State GAM units listed in §1.1 currently have active line items and
   measurable delivery? Please answer per unit path.
2. **Top promo bar:** is the nine-state gate on `/21828142944/lc_toppromobar`
   (`ny tx oh ma va pa mi mn or`) an intentional targeting decision, or an artefact? Florida is
   excluded today.
3. **Wyoming:** do `/21828142944/wyoming_on_results_table_pos1` and `_pos2` exist as GAM units, and do
   they deliver? If so, please supply their div IDs and size mappings — we have found none in source.
4. **State video:** does `/21828142944/LC_ATV_video_player` remain commercially active **for State
   pages**? It was retired for Home; the State page still renders it.
5. **Half-page:** was `/21828142944/lc_sp_display_web_side_halfpage_pos1` intentionally defined but
   never rendered, or is that an omission we should correct?
6. **No-fill:** which behaviour is acceptable — legacy `collapseEmptyDivs()`, a non-collapsing
   reserved container, or the DS-24 treatment (collapse the inner creative, retain outer geometry)?
   Does any viewability measurement depend on a visible container? Separately, is a 300 px lazy-load
   `rootMargin` acceptable? Legacy uses none.
7. **992 px:** do you approve one synchronized 992 px switch for rail appearance and mobile-slot
   visibility, with **no** change to any GAM size mapping?
8. **In-results index dependency:** do any line items or reports depend on the legacy in-results index
   positions (result indices 1, 3, 5, 7, 12) for `sp_mid_leaderboard_pos1/2/3/4` or
   `atv_video_player`? Those positions are prohibited and will be relocated.
9. **No-lottery profile:** do the `al/ak/hi/ut/nv` pages require their existing reduced ten-slot
   profile, or should they carry the standard State set?
10. **Rail on mobile:** legacy renders the five rail slots inline on mobile via their `verticalads*`
    mobile tier. We propose they be desktop-only ≥992 px, with three 320×50 snippets carrying the
    mobile tier instead. Is that acceptable, and does it affect any line item?

---

## 10. State ad-baseline guard — specification only

`assertStateAdBaseline()` — **documentation only. Not written in this task, and not a copy of the Home
guard**, whose accounting assumes a single-viewport Home anchor set and a fixed 15-slot baseline.

The State guard must run at build time and **fail the build** — never warn — when any of the following
does not hold. Invariants 14–20 were added by `LRG-ADS-020` to encode the host-eligibility ruling and
the accounting correction:

| # | Invariant | Why State needs it |
|---:|---|---|
| 1 | Every approved active slot is consumed **exactly once per applicable viewport class** (`<992`, `≥992`) | The current implementation double-maps and under-renders; a per-viewport count is the only way to catch it |
| 2 | **No duplicate div ID** in any rendered output | Legacy renders `sp_mid_leaderboard_pos4` twice; this must never recur |
| 3 | **No active slot is silently unreachable** — every active slot resolves to a placement in at least one viewport class | Catches the `inContent[3]` / `mobileInContent[3]` class of defect |
| 4 | **No anchor boundary inside a protected zone** — S-02 result content, S-05 input→output, S-03 AI answer, the correction surface, S-08/S-08A, S-17 | Makes `FD-S-21` mechanically enforced rather than review-dependent |
| 5 | **No unapproved slot** appears — every placed slot key exists in the approved active set | Prevents a fixture edit adding inventory |
| 6 | Every non-active slot carries an **explicit disabled or deferred reason** from a closed vocabulary | `FD-S-22`: nothing is dropped silently |
| 7 | **Desktop/mobile alternatives are correctly paired** — a desktop-only slot at an inline anchor requires a mobile-only counterpart at the same anchor, and vice versa | The AD-S02 pair is the mechanism that keeps the anchor occupied at both tiers |
| 8 | **992 px boundary coverage** — every inline anchor is occupied at both `<992` and `≥992`; no pair is hidden on both sides | Directly asserts `FD-S-24` |
| 9 | **No inline anchor carries more than one visible slot per viewport** | Structural prohibition on 2-ad and 3-ad stacks |
| 10 | **Rail invariants** — every rail slot declares exactly one host section; no host section is protected; the rail is absent below 992 px | Makes `FD-S-28` enforceable |
| 11 | **State-specific conditions are declared, not inferred** — a slot gated to a state list carries that list explicitly | `sp_toppromobar`'s nine-state gate was undocumented for a year |
| 12 | **The no-lottery (ST-06) profile is a separate asserted set**, and result, claim, tax and commerce anchors are absent from it | `FD-S-31`: an ST-06 page must not imply an active lottery |
| 13 | The **approved active count** matches the founder-approved number **for the resolved profile**; any change fails with the delta named | The Home guard's most valuable property, adapted: State has four profiles, not one baseline |
| 14 | **Host-section eligibility** — every conditional slot declares its host section and the content test that gates it (`APP-ST-04`, `APP-ST-05`) | Makes §0.3 machine-checked rather than review-dependent |
| 15 | **A conditional slot cannot render when its host has only an empty, cold-start or unavailable shell** — the host must expose ≥1 qualifying real object | The precise defect the founder correction identified |
| 16 | **Minimum and expanded profiles are asserted separately** — Minimum 10/14, S-14-expanded 12/12, S-15-expanded 12/12, fully expanded 14/10, each summing to 24 | A single global count cannot express a conditional profile |
| 17 | **Active-count assertions are per profile AND per viewport class** (`<992`, `≥992`) | Catches a profile that is correct on desktop and wrong on mobile |
| 18 | **Conditional rail and mobile counterparts remain aligned** — for each conditional host, the desktop rail slot and the mobile-inline slot are both enabled or both deferred; never one without the other | Keeps 992 px coverage symmetric as hosts qualify and un-qualify |
| 19 | **A non-qualifying host does not relocate its slots** — no conditional slot may appear under a host other than its declared one | Prevents inventory hunting for a host, which `APP-ST-04` forbids |
| 20 | **Template-defined slots and record-only units are counted in separate populations**; the Wyoming units never enter a template-defined subtotal | Encodes the §8.1 accounting correction so it cannot regress |

The guard reads the approved distribution from a single registry module and reproduces **no** GAM
value — no unit path, div id, size or size map. Reserved geometry is read at render time from
`ad-slot-definitions.json`.

---

## 11. Founder approvals — DECIDED

All six were decided by task **LRG-ADS-020** on July 28, 2026. **`OPEN-ST-01` is closed.**
**No new founder approval question is created.**

| ID | Decision | Outcome |
|---|---|---|
| **APP-ST-01** | Florida preview distribution | **APPROVED WITH HOST-ELIGIBILITY CORRECTION.** The PF-02 anchor model and the Option A direction are approved. A contextual-rail or mobile-inline advertisement may render beside a governed section **only when that section contains substantive real content appropriate to the page**; a required empty-state shell does not automatically qualify (§0.3). The **Minimum profile of 10 active slots is the implementation baseline** (§8.1) |
| **APP-ST-02** | Option A over Option B | **APPROVED.** Use Option A. Do **not** convert responsive slots to desktop-only merely to raise the unique active-slot count, and **do not reduce an existing responsive slot to one tier without ad-operations approval** |
| **APP-ST-03** | Duplicate and unreachable placements | **APPROVED.** `sp_mid_leaderboard_pos4` may receive **at most one** valid placement and **must never use a duplicate div ID**. `sp_mobile_leaderboard_pos4` remains deferred until a valid governed mobile boundary exists. `sp_side_halfpage_pos1` remains inactive until ad operations confirms whether the defined-but-never-rendered unit should be activated |
| **APP-ST-04** | Contextual rail | **APPROVED WITH CONTENT-HOST RULE.** State-specific, section-bounded rail. **Approved initial candidates:** `sp_side_mpu_pos4` @ S-06 · `sp_side_mpu_pos2` @ S-10 · `sp_side_skyscraper_pos2` @ S-18. **Conditional:** `sp_side_skyscraper_pos3` @ S-14 and `sp_side_mpu_pos3` @ S-15, each only when its host has substantive real content. A cold-start Community shell, a "no discussions yet" state, an unavailable state or an empty News hub **must not exist primarily to host advertising**. If the condition fails the slot stays deferred and **is not moved to another section** |
| **APP-ST-05** | Mobile and sticky | **APPROVED WITH THE SAME CONTENT-HOST RULE.** `sp_mobile_leaderboard_pos1` is the mobile alternative at AD-S02. `sp_mobile_leaderboard_pos2` may render after S-14, and `sp_mobile_leaderboard_pos3` after S-15, **only** when that section has substantive real content. `sp_mobile_leaderboard_pos4` remains deferred. `sp_bottom_large_leaderboard` remains the closable sticky-footer candidate. Sticky priority and derived clearance follow `FD-S-29`. **No sticky purchase action in the Florida preview** |
| **APP-ST-06** | Proceed conditionally | **APPROVED.** After this correction the guarded anonymous Florida State preview **may begin**. Inactive pending ad-operations confirmation: `atv_video_player` · `sp_side_halfpage_pos1` · the Wyoming record-only units · the top promo bar outside its proven State gate · **any slot whose active line-item status is unknown**. **No live GAM or partner script may activate in the guarded preview** |

### 11.1 What is now settled, and what is not

**Settled — implementation may proceed:** the anchor model · the Minimum 10-slot profile · the
host-eligibility rule · duplicate and unreachable treatment · the rail model · the mobile and sticky
model · the 992 px synchronized switch · protected-zone relocation.

**Still open, and explicitly non-blocking (`APP-ST-06`):** the ten ad-operations questions in §9.
Every slot that depends on an ad-operations answer is **inactive** in the preview, so no answer is
required before implementation begins. `OPEN-ST-02`, `OPEN-ST-03` and `OPEN-ST-04` remain with ad
operations and are cross-State-rollout items.

## 12. What these tasks did not do

- Added, removed, renamed, moved, resized, reordered or re-mapped **no** advertisement.
- Activated **no** GAM unit, AdSense, analytics or partner script.
- Modified **no** file under `01-new-ui/`, `04-sample-data/`, `05-design-inputs/` or the legacy
  application. `ad-slot-definitions.json` is unchanged; its recorded provenance defect and two
  resolvable "UNKNOWN" fields remain registered as source Conflict 16.
- Invented **no** GAM unit path, div id, size or size mapping. Every value is transcribed from source.
- Retired nothing. Ten slots are **deferred or disabled with a recorded reason**, which `FD-S-22`
  distinguishes from retirement.
- Reopened none of `FD-S-21` … `FD-S-29`.
- Wrote no guard code, and no State page code.
- **Created no new founder approval question.** LRG-ADS-020 decided the existing six and closed
  `OPEN-ST-01`; it did not add a seventh.
- **Relocated no slot to find it a host.** Four slots are conditional on their own host section and
  stay deferred when it does not qualify.
