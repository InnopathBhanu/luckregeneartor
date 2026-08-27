# Founder Review Checklist — Shared Design System

**Document type:** Approval checklist
**Recorded by:** Task LRG-DS-005 (Phase 3)
**Date:** July 25, 2026
**Status:** **DECISIONS RECORDED — 31 of 35 items decided on July 25, 2026**
**Decision record:** [`03-docs/08-decisions/design-system-founder-decisions.md`](../08-decisions/design-system-founder-decisions.md) (DS-DEC-001)
**Decision date:** July 25, 2026 (Task LRG-DEC-006)

**Companions:** `design-system-specification.md`, `token-reuse-register.md`, `component-visual-contracts.md`

> The Decision column now carries the founder's recorded decisions with their DS-… identifiers.
> **Four items were deliberately NOT decided and remain blank: B-02, B-03, T-04, S-05.** They are listed in
> §8 of the decision record. The original proposed direction and evidence for every item are preserved unchanged below.

### How to read this checklist

The **Decision** column records the founder's decision from Task LRG-DEC-006, with the DS-… identifier of the governing entry in `design-system-founder-decisions.md`. Statuses used:

- **APPROVED** — adopt the proposed direction as specified.
- **APPROVED WITH AD-OPERATIONS VALIDATION** — approved as a frontend decision; final confirmation from ad operations is still required after live-ad testing.
- **DEFERRED** — postponed; must not be implemented or inferred as approved.
- *(blank)* — deliberately not decided by that task; the item remains open.

Items marked **BLOCKING** prevented Phase 4 (shell specification) or Phase 5 (shell implementation) from completing. See the Summary at the end for which blocks are now cleared and which remain.

**What is already binding and NOT up for review here:** everything derived from the frozen Constitution, the Experience Architecture, and Global Shell v1.1 §0.2 binding outcomes, §143–§147 accessibility, and §122 ad prohibitions. Those are approved authority. This checklist covers only what Global Shell §154 explicitly reserved — exact styling, values, density — plus three ad-operations questions and one route-adjacent conflict.

---

## A. Advertising

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **A-01** | Ad container appearance | Neutral surface, `--radius-md`, compliant boundary, visible "Advertisement" label raised to a **12 px floor** from the current ~10.4 px. Visually distinct from the information-callout treatment, which currently doubles as the ad band. | Global Shell §122; spec §4.9; `globals.css:96–110` (`0.65rem` label) | No | **APPROVED** — DS-23 |
| **A-02** | **No-fill presentation** | **Option 3** — retain the outer placement geometry, collapse the inner creative area, suppress the label. Fall back to Option 1 (reserved neutral space) where geometry cannot be preserved without a visible container. Three options compared in spec §4.9. | `collapseIfEmpty: false` is the recorded production default, making empty appearance a deliberate design decision. **Requires ad-operations confirmation** that no viewability measurement depends on a visible container. | **BLOCKING** for Phase 8 (Home) | **APPROVED WITH AD-OPERATIONS VALIDATION** — DS-24, DS-36 |
| **A-03** | **Sticky-ad reserved height** | Confirm which creatives may serve into the sticky units, then finalize reservation. **Finding:** `hp_bottom_large_leaderboard_sticky` uses mapping `hp_horizontalAds`, whose **mobile tier permits 336 × 280 (280 px tall)**, while the implementation reserves **50 px** — a potential **~230 px shortfall**. The state sticky (`horizontalads2`, 50 px mobile max) is consistent. | `ad-slot-definitions.json` mappings; `AdSlot.tsx` sticky branch. **Ad-operations decision.** | **BLOCKING** for Phase 8 | **DEFERRED** — DS-26, DS-34 |
| **A-04** | Sticky ad vs mobile bottom navigation | Adopt the Global Shell priority order: **safety controls → bottom navigation → user-requested action → advertising.** When bottom navigation is visible, the sticky ad sits above it with safe spacing **or is suppressed**. Page clearance is **derived** from reserved height + nav height, replacing the duplicated hardcoded `pb-28`. | Global Shell §6.4; spec §4.9 | **BLOCKING** for Phase 5 | **APPROVED** — DS-28 |

---

## B. Layout and Breakpoints

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **B-01** | **992 px / 1024 px threshold** | **Align the layout to 992 px** using a single named threshold that drives ad-tier reservation, mobile-slot visibility **and** the two-column/rail switch (Option A expressed with Option C naming). **Finding:** between 992–1023 px the mobile-only slots are hidden *and* the contextual rail is hidden, so **ad inventory disappears in that 32 px band** — a revenue defect, not a cosmetic mismatch. GAM's 992 px tier is immovable without ad-operations approval, so aligning the layout is the only option that closes the gap without touching production ad configuration. Three options compared in spec §4.5.1. | `globals.css:113,121` (992 px); Tailwind `lg` = 1024 px; `ad-slot-definitions.json` `[992,0]`/`[0,0]` tiers. **Founder + ad-operations decision.** No GAM change is proposed. | **BLOCKING** for Phase 5 | **APPROVED WITH AD-OPERATIONS VALIDATION** — DS-20 |
| **B-02** | Content maximum width | **≈1280 px** per Global Shell §20, replacing the current 72 rem (1152 px) container. Prose constrained to 65–75ch; tables and result grids may use full content width. | Global Shell §20; `globals.css:59–63` | No | |
| **B-03** | Density | Core result sections **compact**; AI and insight sections clearly identified but not dominant; editorial and community pages may be denser; **at most one level of card nesting on mobile**. Final mobile density is reserved by Global Shell §154 for page-family review. | Global Shell §21, §154 | No | |

---

## C. Colour

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **C-01** | Semantic colour **roles** | Adopt the ten Global Shell §18 roles plus the additional roles the system lacks entirely: focus, success, warning, alert, three data-freshness states, AI, jackpot, community, editorial, commerce disclosure, ad placeholder, elevated surface, secondary action, inverse text. Roles are named by function, never by hue. | Global Shell §18 ("semantic roles should remain stable"); spec §4.2 | **BLOCKING** for Phase 4 | **APPROVED** — DS-01 |
| **C-02** | **Primary-action colour — recorded conflict** | **Adopt Global Shell §18 as written: Action Blue `#1F5EFF` for links and primary actions, Alert Red `#C73A3A` reserved for correction, error and high consequence.** The existing implementation uses red `#b91c1c` as the primary CTA, which leaves **no colour available to signal a correction** — and correction notices are a Global Shell §126 requirement. Red-for-routine-commerce also sits against Constitution §15–§16. Both values pass contrast; **the defect is semantic, not contrast.** Options (a) adopt as written, (b) retain red for a narrow set of high-intent commerce CTAs while blue takes links and standard actions, (c) propose an alternative palette. Recommendation: **(a)**. | Global Shell §18 vs `globals.css:16`; Constitution §15, §16, §24; spec §4.2.7 | **BLOCKING** for Phase 4 — **highest-consequence item in this checklist** | **APPROVED** — DS-02, DS-03 (option a) |
| **C-03** | Contrast-derived value adjustments | Three Global Shell reference values **fail WCAG 2.2 AA** in the roles they are proposed for and need darkened variants: **AI Teal `#00A7A5` = 2.97:1** (fails as text and as a white-text fill); **Success Green `#138A5B` = 4.36:1** (large-text only); **Jackpot Gold `#F4B400` = 1.85:1** (must never be text on light — use as a fill with dark text, 8.81:1). | Computed contrast, `token-reuse-register.md` §2 | **BLOCKING** for Phase 4 | **APPROVED** — DS-04 |
| **C-04** | Existing token failures to fix | **`--lc-muted`** fails AA on canvas (4.39), info surface (4.37) and the ticker band (3.91) → adopt the Secondary Text direction `#48566A` (7.46/6.95:1, passes everywhere). **`--lc-border`** fails 3:1 non-text contrast (1.23:1 on surface) → split into a compliant `--color-border` and a decorative `--color-border-subtle`. **`--lc-info-border`** 1.31:1 → must reach 3:1. **`--lc-heading`** is byte-identical to `--lc-text` → consolidate. | Computed contrast; `globals.css:12,14,15,19` | **BLOCKING** for Phase 4 | **APPROVED** — DS-04 |

---

## L. Light and Dark Mode

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **L-01** | Light mode as the single launch target | **Light mode only.** Every semantic token records a dark-mode *intent* so a future dark theme is inexpensive, but no dark values are proposed for approval now. | Global Shell §17–§18 define one visual personality; spec §4.2 | No | **APPROVED** — corollary of DS-30 |
| **L-02** | **Dark-mode status** | **DEFERRED — not approved.** Recorded reasons: (1) no approved source requests it; (2) `CLAUDE.md` §2 forbids inferring approval from existing code; (3) the provisional set is **incomplete** — `--lc-accent` and all seven ball tokens are not overridden, so the red CTA on dark surface computes to **2.69:1, failing AA**; (4) no toggle exists, so no user can reach it; (5) `prefers-color-scheme` auto-switching is deliberately disabled. | `globals.css:39–50`; computed contrast; `token-reuse-register.md` §5 | No | **DEFERRED** — DS-30 |

---

## T. Typography

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **T-01** | **Font family** | **System sans-serif stack for launch** — no network cost, no licence, strong digit legibility. **No brand or licensed font is selected**; `CLAUDE.md` §19 forbids inventing licensed assets and Global Shell §19 assigns final font choice to the design system. If a brand font is wanted, it must be named and licensed by the founder. | Global Shell §19; `CLAUDE.md` §19 | No | **APPROVED** (system stack) — DS-08; brand font **DEFERRED** — DS-31 |
| **T-02** | Type scale | 14-role scale from Display to Disclosure, with mobile→desktop ranges, line heights, weights and maximum measures. **Body floor 16 px on mobile** (the current page default is `text-[15px]`). **Micro-label floor 12 px** (the current ad label is ~10.4 px). Minimum disclosure size 13 px — disclosures must be legible, not fine print. | Global Shell §19; spec §4.3; audited type usage (101× `text-sm`, 27× `text-xs`) | No | **APPROVED** — DS-09 |
| **T-03** | Tabular numerals | **Mandatory** for drawn numbers, jackpots, dates, times, countdowns, odds, prize tiers and every numeric table column. | Global Shell §19 (explicit requirement) | No | **APPROVED** — DS-10 |
| **T-04** | Weight policy | Weights 400/600/700/800 only. **No thin weights** per Global Shell §19. | Global Shell §19; audited weights (semibold 50×, bold 38×, extrabold 4×) | No | |

---

## V. Visual Language

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **V-01** | Overall visual direction | Trustworthy, current, energetic without casino excess, understandable to non-technical players, visually intelligent, mobile-first, community-friendly. Explicitly avoid black-and-gold casino luxury, neon gambling aesthetics, excessive motion, dense enterprise dashboards on public pages, AI sci-fi imagery and generic chatbot gradients. | Global Shell §17 (verbatim direction) | No | **APPROVED** — DS-05, DS-06 |
| **V-02** | Card, border and elevation treatment | **Border-first cards.** Surface vs canvas is only **1.07:1**, so a card without a compliant border is not perceivable. Four-step radius scale (4/8/12/full) replacing four ad-hoc radii. Four-level elevation used for **separation only, never decoration**, and **always paired with a border** because shadows are dropped in forced-colors mode. At most one level of card nesting on mobile. | Computed contrast; Global Shell §21; audited radii (61 usages) and shadows (1 usage); spec §4.6 | No | **APPROVED** — DS-07 |
| **V-03** | **Icon library** | **DEFERRED — none selected.** `CLAUDE.md` §19 forbids inventing an icon set. Until one is approved, every distinction must be achievable with **text, border and shape alone**. Approved icons will be supplementary and never the sole signal. | `CLAUDE.md` §19; spec §4.7 | No | **DEFERRED** — DS-32 |
| **V-04** | **Final logo treatment** | **DEFERRED — out of scope.** The current header renders a star glyph on `#1e3a8a`. Global Shell §18 notes values may be adjusted to fit the current logo, so logo selection should precede final brand-colour lock. | `SiteHeader.tsx:25`; Global Shell §18 | No | **DEFERRED** — DS-33 |
| **V-05** | Motion policy | Transitions 120–200 ms ease-out (overlays to 250 ms). Prohibited: spinning or slot-machine motion, confetti, pulsing urgency, parallax, autoplay video or audio. Nothing flashes more than three times per second. `prefers-reduced-motion: reduce` disables non-essential motion — **currently not handled at all**. Correction emphasis is **static and persistent**, never a transient flash. | Global Shell §17; WCAG 2.2.2, 2.3.1; spec §4.11; grep found zero reduced-motion handling | No | **APPROVED** (reduced motion + prohibitions) — DS-16, DS-06 |

---

## R. Results and Special Balls

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **R-01** | Result-ball treatment | Circular balls, `--radius-full`, tabular numerals, always **real crawlable text**. Ball count derived from data. Rows wrap cleanly through 20+1 sets. **Game-defined ordering never re-sorted.** | Global Shell §146; `CLAUDE.md` §14; spec §4.7 | No | **APPROVED** — DS-12, DS-13 |
| **R-02** | **Special-ball non-colour distinctions** | Every special type combines a **visible text label** ("Powerball", "Mega Ball", "Cash Ball", "Fireball", "Bonus"), a **border/shape treatment**, and an **accessible name** ("Mega Ball 9"). **Quantified justification:** special-ball fills are separated by only **1.09–1.30:1** in luminance (Mega Ball vs Cash Ball 1.09; Powerball vs Bonus 1.10) — colour is measurably incapable of carrying the distinction. Multipliers render full text ("Power Play 3×"), never a bare number. Card-game suits must not be conveyed by colour alone. | Computed contrast; Global Shell §146 | **BLOCKING** for Phase 11 (State) | **APPROVED** — DS-11, DS-14 |
| **R-03** | Fireball contrast fix | White on `#ea580c` is **3.56:1 — fails AA for normal text**, and drawn numbers are essential content. Either darken the fill or use dark text on the orange (≈5.0:1). | Computed contrast | No | **APPROVED** — DS-04 |
| **R-04** | Card-face boundary | `--card-face-bg` is `#ffffff` on a white surface = **1.00:1**; the element is visible only through a border that itself fails 3:1. Add a compliant `--card-face-border` (≥3:1). | Computed contrast | No | **APPROVED** — DS-04 |
| **R-05** | Awaiting, stale, corrected states | Each carries **explicit text** — "Awaiting result" with the exact next-draw date, a visible last-updated timestamp for stale, and "Corrected" with what changed, when and the impact. Colour is supplementary only. Awaiting placeholders reserve the ball row's height so no shift occurs. | Global Shell §126; Constitution §7; spec §4.7, §4.8 | No | **APPROVED** — DS-14 |

---

## X. Attribution and Distinctions

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **X-01** | AI / community / editorial / official / commercial distinctions | Five visually distinct, non-promotional treatments, **none relying on colour alone**: AI carries an explicit label ("LotteryCorner AI", "AI Quick Take"); community carries author attribution; editorial carries a byline or "LotteryCorner Research"; official-source information uses the compact "Source checked · Result verified · Last updated" line; commercial CTAs carry an explicit adjacent disclosure. | Constitution §13, §15, §24.1; Global Shell §123–§125; spec §4.10 | **BLOCKING** for Phase 4 | **APPROVED** — DS-29 |
| **X-02** | Protected-zone visual policy | No advertising, campaign or promotional treatment inside: result verification, claim guidance, correction notices, AI answer blocks, tool input→output flows, or responsible-play guidance. Minimum `space-6` separation from any protected zone. | Constitution §7; `CLAUDE.md` §12; Global Shell §122 | No | Already binding — reaffirmed by DS-21 |

---

## S. Accessibility

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **S-01** | Accessibility target | **WCAG 2.2 AA minimum**, as already binding. | Global Shell §143; `CLAUDE.md` §9 | Already binding | **APPROVED — reaffirmed** — DS-18 |
| **S-02** | Focus system | Introduce `--color-focus` and a `:focus-visible` indicator at **≥3:1 against both the component and the adjacent background**, ≥2 px, **never removed** and **never obscured by sticky layers**. **Currently there is no focus style anywhere in the codebase** — this is new work, not a refinement. | WCAG 2.4.7, 2.4.11; Global Shell §143; grep found zero focus styles | **BLOCKING** for Phase 5 | **APPROVED** — DS-15 |
| **S-03** | Disabled-control policy | A control that does nothing **must not be presented as an available action**. Prefer omitting it; otherwise reduce prominence and state a reason. **13 `disabled` attributes across 7 files currently violate this** (newsletter ×2, Login, Register, favourite star, AI CTA, privacy manager, state selector). | `CLAUDE.md` §9; audited component set | **BLOCKING** for Phase 5 | **APPROVED** — DS-17 |
| **S-04** | Validation widths | 320 · 375 · 390 · 768 · **992** · **1024** · 1280 · 1440 px, plus 200 % zoom, text-only scaling to 200 %, keyboard-only, screen-reader structure, forced-colors, no horizontal page scroll, sticky-conflict testing, and **every page validated with all ad slots unfilled**. | Global Shell §143–§147; WCAG 1.4.4, 1.4.10; spec §4.12 | No | **APPROVED** — DS-19 |
| **S-05** | Target size | 44 × 44 CSS px where practical; never below WCAG 2.5.8 without sufficient spacing or an equivalent control. | Global Shell §143 | No | |

---

## N. Next-Phase Deliverable

| ID | Item | Proposed direction | Evidence / source | Blocking | Decision |
|---|---|---|---|---|---|
| **N-01** | **Representative visual examples required in Phase 4** | The shell specification (Phase 4) must include **desktop and mobile representative examples** showing: the anonymous shell; the signed-in shell; a result card with standard and special balls including their non-colour distinctions; a filled ad container; a **no-fill** ad container; the sticky ad correctly ordered against mobile bottom navigation; a correction notice; and an AI entry with its label. Global Shell §0.1 requires desktop **and** mobile high-fidelity review and founder approval per page family before implementation. | Global Shell §0.1, §154; `implementation-sequence.md` Phase 4 | **BLOCKING** for Phase 5 | **APPROVED** — folded into Preview Track P2; final approval **DEFERRED** per DS-37 |

---

## Summary — Blocking Status After the July 25, 2026 Decisions

| Blocks | Items | Status after DS-DEC-001 |
|---|---|---|
| **Phase 4** (shell specification) | C-01, C-02, C-03, C-04, X-01 | ✅ **ALL CLEARED** — Phase 4 is unblocked |
| **Phase 5** (shell implementation) | A-04, B-01, S-02, S-03, N-01 | ✅ **ALL CLEARED** — B-01 carries an ad-operations validation caveat that does not block frontend work |
| **Phase 8** (Home implementation) | A-02, A-03 | ⚠️ **A-02 cleared** (pending ad-operations validation). **A-03 REMAINS DEFERRED** — sticky-ad production creative height is still unresolved |
| **Phase 11** (State implementation) | R-02 | ✅ **CLEARED** — DS-11, DS-14 |

**Highest-consequence decision, now made: C-02.** Blue takes primary actions, navigation emphasis and links; red is reserved for corrections, errors, critical alerts and destructive actions (DS-02, DS-03). This resolves the recorded conflict in which red-as-CTA left no colour available to signal a correction.

**Still requiring ad operations, not only the founder:**
- **A-03 / DS-26, DS-34** — sticky-ad production creative height. **Unresolved.** The Home sticky's mapping permits a 280 px mobile creative against a 50 px reservation.
- **A-02 / DS-24, DS-36** — no-fill treatment approved as the default; ad operations must confirm no viewability measurement depends on a visible container.
- **B-01 / DS-20** — the 992 px threshold is approved as a frontend decision; live-ad testing confirmation is still required.

**Explicitly deferred, requiring no decision now:** L-02 (dark mode, DS-30), V-03 (icon library, DS-32), V-04 (logo treatment, DS-33), plus DS-31 (brand font), DS-35 (page-specific ad volume) and DS-37 (final high-fidelity approval).

**Deliberately not decided and still open:** B-02 (content maximum width), B-03 (density), T-04 (weight policy), S-05 (44 × 44 target size). See §8 of `design-system-founder-decisions.md`.
