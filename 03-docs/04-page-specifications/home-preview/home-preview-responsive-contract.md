# Home Preview — Responsive Contract

**Document type:** Page specification — responsive behaviour contract
**Recorded by:** Task LRG-SPEC-007 (Preview Track P2)
**Date:** July 26, 2026
**Status:** **PROPOSED — founder review required before P3**
**Governing authority:** Global Shell v1.1 §6.1–§6.5 (mobile navigation, sticky conflict, state precedence), §20 (grid and container), §21 (spacing and density), §143–§147 (accessibility) · BP-02 v1.1 §11 (first-viewport contract), §64 (mobile ad contract) · `design-system-founder-decisions.md` DS-19, DS-20, DS-28

---

## 1. The Single Named Threshold

**DS-20 approves one named structural/ad threshold at 992 px.**

```
--breakpoint-structural: 992px
```

It governs **all three** of the following simultaneously — this simultaneity is the whole point of the decision:

1. **Ad-tier visibility** — mobile-only slots visible below, hidden at and above.
2. **Contextual rail appearance** — rail hidden below, visible at and above.
3. **Primary one-column / two-column layout transition.**

**Why 992 px and not 1024 px:** the GAM size mappings switch tiers at `[992, 0]` versus `[0, 0]`. That configuration is **immovable without ad-operations approval**. Aligning the layout to it is the only option that closes the inventory gap without touching production ad configuration.

**This contract changes no GAM size mapping, slot ID, unit path, placement or count.**

### 1.1 The 992–1023 px inventory gap — closed

**The defect, as it exists today:**

| Width | Mobile-only slots (`.lc-ad--mobile-only`) | Contextual rail (`lg:` = 1024 px) | Net |
|---|---|---|---|
| 320–991 px | **Visible** | Hidden | mobile inventory served |
| **992–1023 px** | **HIDDEN** — rule fires at ≥992 px | **HIDDEN** — appears only at ≥1024 px | ❌ **four mobile snippet slots and all rail slots disappear** |
| ≥1024 px | Hidden | Visible | rail inventory served |

**After DS-20 — one threshold, no gap:**

| Width | Mobile-only slots | Contextual rail | Net |
|---|---|---|---|
| 320–991 px | **Visible** | Hidden | mobile inventory served |
| **≥992 px** | Hidden | **Visible** | rail inventory served |

**At exactly 992 px, mobile slots hide and the rail appears in the same step.** There is no width at which both are hidden. The gap is closed by construction, not by compensation.

**Verification requirement:** P3 must validate at **991 px, 992 px and 1024 px** and confirm that at every width **either** the four mobile slots **or** the rail slots are present. 1024 px stays in the mandatory validation set (DS-19) specifically to prove no residual discontinuity.

---

## 2. Width-by-Width Contract

### 320 px — smallest supported

| Aspect | Behaviour |
|---|---|
| Header | Compact top app bar: brand mark + search affordance + AI affordance. Primary nav collapsed into the mobile menu |
| Navigation | Bottom navigation with **text labels** (Global Shell §144), bypassable by assistive technology |
| Search / Ask | Icon-expand affordances in the top bar; expanded search occupies the full width; **labelled preview-unavailable** |
| Jackpot ticker | Full-bleed band, horizontally scrollable **within its own container** with a visible affordance. The page never scrolls horizontally |
| Content columns | **1** |
| Contextual rail | **Hidden** |
| Section spacing | 32 px between top-level sections |
| Card grids | 1-up |
| Result cards | 1-up. Ball rows wrap; must wrap cleanly for 20+1 sets. Ball 32 px with 8 px gaps |
| Tables | Scroll inside their own container with a visible affordance |
| Ad reservation | Mobile tier from each slot's own mapping. Mobile-only slots **visible** |
| Sticky ad | Labelled **inactive** reservation, **above** bottom navigation with safe spacing, or suppressed |
| Bottom navigation | Present. **Priority 2** — outranks advertising |
| Safe area | `env(safe-area-inset-bottom)` respected by both bottom nav and sticky reservation |
| Focus | Visible, ≥2 px, **never obscured** by the sticky reservation or bottom nav. Scroll-into-view accounts for combined sticky clearance |
| Overflow | **No horizontal page scroll.** Verified with the longest game name and largest jackpot string |

### 375 px — sticky-conflict worst case

As 320 px, plus:

| Aspect | Behaviour |
|---|---|
| Sticky stack | **The critical test.** Verify sticky-ad reservation + bottom navigation + any sticky task action against the DS-28 priority order: safety → bottom nav → user action → advertising. **Three layers must never compete.** The affiliate action bar (GS-14) is suppressed in the preview specifically to avoid a third layer |
| Content clearance | Bottom padding **derived** as reserved sticky height + bottom-nav height + 8 px. **Not the hardcoded `pb-28`** |
| Cards | 1-up; card padding 16 px; **maximum one level of card nesting** |

### 390 px — common current phone

As 375 px. Result-card grid remains 1-up. Ball size may step to 34 px if it does not force wrapping of a 6-ball main group.

### 768 px — tablet portrait

| Aspect | Behaviour |
|---|---|
| Header | Still compact; primary nav may begin to show a reduced inline set if it fits without truncation, otherwise stays in the menu |
| Navigation | Bottom navigation **still present** — below the structural threshold |
| Content columns | **1** (8-column grid available for internal card layout) |
| Contextual rail | **Hidden** |
| Card grids | 2-up for result cards, popular games, news, blog |
| Section spacing | 40 px |
| Ad reservation | **Still mobile tier.** Mobile-only slots **visible** |
| Gutters | 24 px |
| Tables | Prefer full-width layout; retain in-container scroll where columns exceed the width |

### 991 px — immediately below the threshold

**Explicit boundary test.** Mobile-only slots **visible**; rail **hidden**; single column; bottom navigation present; mobile ad tier reserved. Behaviour identical to 768 px.

### 992 px — the named threshold

| Aspect | Behaviour |
|---|---|
| **Simultaneous switch** | Mobile-only slots **hide**; contextual rail **appears**; layout becomes **two-column**; ad reservation switches to the **desktop tier**. All in one step |
| Header | Full inline primary navigation, search and AI entry visible, account affordances visible |
| Navigation | Bottom navigation **hidden** |
| Content columns | **2** — main content + contextual rail |
| Rail width | 300 px (accommodates the 300 px-wide production creatives); main column takes the remainder |
| Layout arithmetic at 992 px | 992 − (32 px gutters × 2) − 300 px rail − 32 px gap = **596 px main column.** Must be verified: result cards remain 1-up or 2-up without crowding, and the rail's 300×250/300×600 reservations fit without horizontal overflow |
| Sticky ad | Labelled inactive reservation; bottom navigation absent so no conflict |
| Section spacing | 40 px |
| Gutters | 32 px |

### 1024 px — retained validation width

| Aspect | Behaviour |
|---|---|
| Behaviour | **Identical to 992 px.** No transition occurs here after DS-20 |
| Why validated | To **prove** the previous 1024 px transition is fully removed and no residual `lg:`-bound behaviour survives. Any visual change between 992 and 1024 px indicates an incomplete migration |
| Main column | 1024 − 64 − 300 − 32 = **628 px** |

### 1280 px — content maximum

| Aspect | Behaviour |
|---|---|
| Content width | Capped at the proposed **1280 px** maximum (Global Shell §20) |
| Content columns | 2; main column ≈884 px |
| Card grids | 3-up for result cards, popular games, news; 4-up for compact directory chips |
| Prose measure | Constrained to 65–75ch even though the container is wider |
| Tables and result grids | **May use full content width** (Global Shell §20) |
| Section spacing | 48 px between major bands |

### 1440 px — wide desktop

| Aspect | Behaviour |
|---|---|
| Content width | **Still capped at 1280 px.** Surplus becomes margin — **not more columns and not a wider rail** |
| Everything else | Identical to 1280 px |

---

## 3. Consolidated Matrix

| Aspect | 320 | 375 | 390 | 768 | 991 | **992** | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|---|---|
| Content columns | 1 | 1 | 1 | 1 | 1 | **2** | 2 | 2 | 2 |
| Contextual rail | — | — | — | — | — | **300 px** | 300 px | 300 px | 300 px |
| Grid columns available | 4 | 4 | 4 | 8 | 8 | **12** | 12 | 12 | 12 |
| Bottom navigation | ✓ | ✓ | ✓ | ✓ | ✓ | **—** | — | — | — |
| Mobile-only ad slots | ✓ | ✓ | ✓ | ✓ | ✓ | **—** | — | — | — |
| Ad reservation tier | mobile | mobile | mobile | mobile | mobile | **desktop** | desktop | desktop | desktop |
| Result-card grid | 1-up | 1-up | 1-up | 2-up | 2-up | 2-up | 2-up | 3-up | 3-up |
| Section spacing | 32 | 32 | 32 | 40 | 40 | 40 | 40 | 48 | 48 |
| Page gutters | 16 | 16 | 16 | 24 | 24 | 32 | 32 | 32 | 32 |
| Container cap | — | — | — | — | — | — | — | 1280 | **1280** |
| Sticky reservation | ✓ above nav | ✓ above nav | ✓ above nav | ✓ above nav | ✓ above nav | ✓ | ✓ | ✓ | ✓ |
| Horizontal page scroll | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 4. First-Viewport Contract by Width

BP-02 §11 requires that **before the first normal advertisement**, Home delivers: identity and shell · functional task entry · top jackpots / next-draw orientation · latest national results and the state-results entry.

| Width | How satisfied |
|---|---|
| 320–390 px | Compact header (identity) → H-01 task entry → jackpot ticker (orientation) → **AD-H00 follows task orientation** → H-02A featured games. A compact AI action may appear in H-01; the full AI module (H-05) follows current utility, per §11 |
| 768–991 px | Same order, more content per viewport |
| ≥992 px | Same order; `AD-H01R` rail becomes visible alongside H-02A but **never inside game facts** |

**AD-H00 must never precede task orientation.** It is anchor 2, after H-01.

---

## 5. Sticky Hierarchy (DS-28 / Global Shell §6.4)

Applies at every width below 992 px, where bottom navigation exists.

| Priority | Layer | Preview state |
|---|---|---|
| **1** | Safety and system controls | Always wins; never overlaid |
| **2** | Bottom navigation | Present below 992 px, with text labels |
| **3** | User-requested action (save / buy) | **Suppressed in the preview** — `shell.affiliateActionBar.show = false`, avoiding a third competing layer |
| **4** | Advertising (sticky reservation) | Sits **above** bottom navigation with safe spacing, **or is suppressed** |

**Rules:** the sticky reservation must never overlay bottom navigation, numbers, inputs, focus indicators or safety guidance. Its height comes from the reserved creative and is **never animated**. Content clearance is derived, not guessed. **No simultaneous mobile sticky ad and sticky purchase bar** (BP-02 §65).

**Unresolved:** the sticky's production creative height remains open (DS-26/DS-34). The Home sticky's mapping permits a 280 px mobile creative against a 50 px reservation. The preview therefore shows a **labelled inactive reservation that asserts no final height** (DS-27).

---

## 6. Accessibility Requirements at Every Width

| Requirement | Rule |
|---|---|
| **No horizontal page scroll** | At every width, including 320 px. Tables and the ticker scroll **within their own containers** with visible affordances |
| **Focus visibility** | `:focus-visible` on every interactive element, ≥2 px, ≥3:1 against both the component and the adjacent background, **never obscured** by sticky layers (WCAG 2.4.11). Scroll-into-view offsets by the combined sticky clearance |
| **200 % zoom** | No loss of content or function (WCAG 1.4.4) |
| **Reflow** | Content reflows at a 320 px equivalent without two-dimensional scrolling (WCAG 1.4.10) |
| **Text scaling** | Text-only scaling to 200 % without clipping or overlap |
| **Keyboard-only** | Full operation at every width. Bottom navigation reachable and bypassable. Menus open by button with `aria-expanded`/`aria-controls`, Escape closes, focus returns to the trigger |
| **Target size** | 44 × 44 CSS px where practical; never below WCAG 2.5.8 without sufficient spacing or an equivalent control |
| **Reduced motion** | `prefers-reduced-motion: reduce` disables non-essential transition and animation |
| **Forced colors** | Layout and meaning survive `forced-colors: active`. Since shadows and background fills are dropped, **borders and text must carry the meaning** |
| **Virtual keyboard** | Must not hide an input or its action (Global Shell §147) |
| **Safe areas** | `env(safe-area-inset-*)` honoured by bottom navigation and the sticky reservation |
| **Ad no-fill** | **Every width validated with all slots unfilled** — the likeliest low-fill production state. No gap may read as broken and no layout shift may occur |

---

## 7. Consistency Validation

| Check | Result |
|---|---|
| All eight DS-19 widths specified | ✅ 320, 375, 390, 768, 992, 1024, 1280, 1440 — plus 991 px as an explicit boundary test |
| Single named threshold applied to all three concerns | ✅ ad visibility, rail appearance, column transition — simultaneously at 992 px |
| 992–1023 px inventory gap closed | ✅ demonstrated in §1.1 with before/after tables; no width leaves both mobile slots and rail hidden |
| 1024 px retained as a validation width | ✅ to prove no residual transition survives |
| No GAM mapping, slot or placement changed | ✅ reservation reads each slot's own mapping |
| Mobile ad slots redistributed, not reduced | ✅ all four remain present below 992 px |
| Sticky hierarchy resolved without overlap | ✅ §5, with the purchase bar suppressed to avoid a third layer |
| Sticky production height not asserted | ✅ labelled inactive reservation only |
| No horizontal page overflow at any width | ✅ stated per width; tables and ticker scroll in-container |
| Focus never obscured by sticky layers | ✅ derived clearance plus scroll-into-view offset |
