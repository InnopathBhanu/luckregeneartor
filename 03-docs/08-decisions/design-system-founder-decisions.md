# Design-System Founder Decisions

**Document type:** Approved decision record
**Decision ID:** DS-DEC-001
**Recorded by:** Task LRG-DEC-006
**Decision date:** July 25, 2026
**Status:** **APPROVED — founder decision (Authority Tier 1)**
**Decided against:** `03-docs/03-design-system/design-system-specification.md`, `token-reuse-register.md`, `component-visual-contracts.md`, `founder-review-checklist.md` (all Task LRG-DS-005)
**Companions:** `home-preview-track-decision.md`, `implementation-sequence.md`, `source-conflicts.md`

**Authority note.** These are explicit founder decisions and therefore sit at **Tier 1** of the authority hierarchy in root `CLAUDE.md` §2 — above the frozen Constitution's silence on styling and above Global Shell v1.1 §154, which expressly reserved exact visual styling and colour values for controlled decisions such as this one.

**Recording discipline.** The 37 decisions below are recorded **as stated**, without reinterpretation or expansion. Where a decision closes a previously recorded conflict, that is noted. Where the checklist contained an item this task did **not** decide, it is listed in §5 and remains open.

### Status vocabulary

| Status | Meaning |
|---|---|
| **APPROVED** | Adopt as specified. Implementable now within its phase. |
| **APPROVED WITH AD-OPERATIONS VALIDATION** | Approved as a frontend decision; final confirmation from ad operations is still required after live-ad testing. |
| **DEFERRED** | Deliberately postponed. Must not be implemented or inferred. |

---

## 1. Visual Direction

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-01** | Approve the semantic colour-role system proposed in the design-system specification. | **APPROVED** | Founder decision 1; spec §4.2; Global Shell §18 | The ten Global Shell §18 roles plus the 15 additional roles the system lacked (focus, success, warning, alert, three data-freshness states, AI, jackpot, community, editorial, commerce disclosure, ad placeholder, elevated surface, secondary action, inverse text) become the token vocabulary. Tokens are named by role, never by hue. | Closes checklist **C-01**. Final values per DS-04. |
| **DS-02** | Use blue for primary actions, navigation emphasis and interactive links. | **APPROVED** | Founder decision 2; Global Shell §18 "Action Blue" | `--color-action-primary` takes the Action Blue direction. Applies to primary buttons, links, navigation emphasis and primary CTAs. | Closes checklist **C-02** (option a). |
| **DS-03** | Reserve red for corrections, errors, critical alerts and destructive actions. | **APPROVED** | Founder decision 3; Global Shell §18 "Alert Red", §126 | `--color-alert` is reserved. **Red is no longer available for routine CTAs, prices or emphasis.** This resolves the recorded conflict in spec §4.2.7: a correction can now be signalled, which was previously impossible. | Closes checklist **C-02**. Supersedes the previous iteration's red-CTA convention, which was never approved. |
| **DS-04** | Correct all identified contrast failures using WCAG 2.2 AA thresholds. | **APPROVED** | Founder decision 4; computed contrast in `token-reuse-register.md` | Ten recorded failures must be fixed: `--lc-muted` (3.91 / 4.37 / 4.39 on band, info surface, canvas), Fireball ball (3.56), `--lc-border` (1.23), `--lc-info-border` (1.31), card-face boundary (1.00), surface-vs-canvas separation (1.07), and the three Global Shell reference values that fail in their proposed roles — AI Teal (2.97), Success Green (4.36), Jackpot Gold (1.85 as text). Darkened variants are required where a reference value fails. | Closes checklist **C-03**, **C-04**, **R-03**, **R-04**. Verified at each page-family review. |
| **DS-05** | Use calm, trustworthy and information-first styling. | **APPROVED** | Founder decision 5; Global Shell §17; Constitution §7, §15–§16 | Visual weight follows task priority, never commercial priority. No manufactured urgency. | Closes checklist **V-01** (with DS-06). |
| **DS-06** | Avoid casino-like, trading-terminal and dashboard-heavy visual treatment. | **APPROVED** | Founder decision 6; Global Shell §17 | Prohibits black-and-gold casino luxury, neon gambling aesthetics, spinning or slot-machine motion, dense enterprise-dashboard treatment on public pages, AI sci-fi imagery and generic chatbot gradients. | Closes checklist **V-01**; contributes to **V-05**. |
| **DS-07** | Use border-first cards with restrained elevation and no excessive card nesting. | **APPROVED** | Founder decision 7; spec §4.6; surface-vs-canvas measured at 1.07:1 | Cards are defined by a compliant border (≥3:1), not by surface colour or shadow. Four-step radius scale replaces four ad-hoc radii. Elevation is separation-only, always paired with a border because shadows are dropped in forced-colors mode. **Maximum one level of card nesting on mobile.** | Closes checklist **V-02**. |
| **DS-08** | Use the system sans-serif font stack for the initial implementation. Do not introduce a paid or external brand font. | **APPROVED** | Founder decision 8; Global Shell §19; `CLAUDE.md` §19 | System sans stack — no network request, no licence, strong digit legibility. No font file is added. | Closes checklist **T-01** for launch. Brand font remains **DEFERRED** per DS-31. |
| **DS-09** | Use a 16 px minimum mobile body-text size. | **APPROVED** | Founder decision 9; spec §4.3 | Raises the current `text-[15px]` page default. 16 px is a floor, not a target. Also prevents iOS input zoom on forms. | Closes checklist **T-02**. |
| **DS-10** | Use tabular numerals for lottery numbers, jackpots, dates, times and odds. | **APPROVED** | Founder decision 10; Global Shell §19 (explicit requirement) | `font-variant-numeric: tabular-nums` on drawn numbers, jackpot amounts, dates, times, countdowns, odds, prize tiers and every numeric table column. | Closes checklist **T-03**. |

---

## 2. Result and Special-Ball Treatment

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-11** | Every special ball must use more than colour: a visible label or abbreviation; a distinct border, shape or pattern; and an accessible name. | **APPROVED** | Founder decision 11; Global Shell §146; measured 1.09–1.30:1 luminance separation between special balls | Three simultaneous signals are mandatory per special type. Colour alone is measurably incapable of the distinction. | Closes checklist **R-02**. Verified at the State and Game reviews. |
| **DS-12** | Preserve game-defined number ordering. | **APPROVED** | Founder decision 12; `CLAUDE.md` §14 | Drawn values are never re-sorted for visual balance or convenience. | Closes checklist **R-01** (with DS-13). |
| **DS-13** | Keep lottery numbers as crawlable text. | **APPROVED** | Founder decision 13; Global Shell §146; `CLAUDE.md` §11 | Numbers render as server-side text, never image-only. Ball count derived from data, never hardcoded. | Closes checklist **R-01**. |
| **DS-14** | Use colour **plus** non-colour distinction for Powerball, Mega Ball, Cash Ball, Fireball, bonus balls, multipliers, secondary draws, and corrected and awaiting results. | **APPROVED** | Founder decision 14; Global Shell §126, §146 | Named labels ("Powerball", "Mega Ball", "Cash Ball", "Fireball", "Bonus"); multipliers render full text ("Power Play 3×"), never a bare number; secondary draws carry a named heading ("Double Play"); **awaiting** shows "Awaiting result" plus the exact next-draw date in a height-reserved placeholder; **corrected** shows "Corrected" plus what changed, when and the impact. | Closes checklist **R-02**, **R-05**. |

---

## 3. Accessibility

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-15** | Approve the proposed focus-visible system. | **APPROVED** | Founder decision 15; spec §4.8; WCAG 2.4.7, 2.4.11; Global Shell §143 | Introduces `--color-focus` and a `:focus-visible` indicator at **≥3:1 against both the component and the adjacent background**, ≥2 px, never removed, **never obscured by sticky layers**. **No focus style exists today** — this is new work, not a refinement. | Closes checklist **S-02**. Verified keyboard-only at every review. |
| **DS-16** | Approve reduced-motion support. | **APPROVED** | Founder decision 16; spec §4.11; WCAG 2.3.3 | `prefers-reduced-motion: reduce` disables non-essential transition and animation while keeping state changes perceptible. **Not currently handled at all.** | Contributes to closing checklist **V-05** (with DS-06). |
| **DS-17** | Controls that are not functional must be hidden or explicitly identified as unavailable. They must not appear as usable disabled actions. | **APPROVED** | Founder decision 17; `CLAUDE.md` §9; spec §4.8 | Fixes the 13 `disabled` attributes across 7 files (newsletter ×2, Login, Register, favourite star, AI CTA, privacy manager, state selector). Preference order: omit the control; otherwise state a reason. | Closes checklist **S-03**. |
| **DS-18** | WCAG 2.2 AA remains the minimum target. | **APPROVED — reaffirmed** | Founder decision 18; Global Shell §143; `CLAUDE.md` §9 | Already binding; restated as a founder decision. AA is a floor, not a ceiling. | Reaffirms checklist **S-01**. |
| **DS-19** | Validate at 320, 375, 390, 768, 992, 1024, 1280 and 1440 px. | **APPROVED** | Founder decision 19; spec §4.12 | These eight widths are the mandatory validation set. **992 and 1024 are both retained** so the previously identified 992–1023 px band is verified even after DS-20. | Closes checklist **S-04**. Applies to the preview and every page family. |

---

## 4. Responsive Breakpoint

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-20** | Approve one named **992 px** structural/ad threshold governing ad-tier visibility, contextual-rail appearance, and the primary one-column/two-column transition. This is a **frontend layout decision only**. Production GAM mappings are not modified. | **APPROVED WITH AD-OPERATIONS VALIDATION** | Founder decision 20; spec §4.5.1 (three options compared); GAM tiers `[992,0]` / `[0,0]` | A single named threshold at 992 px drives ad-tier reservation, mobile-slot visibility **and** the column/rail switch. This **closes the recorded ad-inventory gap**: previously, between 992–1023 px the mobile-only slots were hidden (rule fired at ≥992 px) while the contextual rail was also hidden (appeared at 1024 px), so four mobile snippet slots and the rail slots disappeared simultaneously. **No GAM size mapping, slot ID, unit path, placement or slot count changes.** | **Final confirmation remains required from ad operations after live-ad testing.** Recorded as an open dependency in §6 and in `implementation-sequence.md`. Closes checklist **B-01** subject to that validation. |

---

## 5. Advertising Presentation

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-21** | Preserve all production ad inventory. | **APPROVED — reaffirmed** | Founder decision 21; `CLAUDE.md` §12 | All 47 recorded slot definitions, IDs, GAM unit paths, size mappings, placements and ordering stand unaltered. Includes the 13 currently unmapped slots, which must be resolved with ad operations rather than dropped. | Already binding; restated. Per-page-family ad audit remains a gate. |
| **DS-22** | Partner scripts remain disabled for the preview. | **APPROVED** | Founder decision 22 | `PartnerScripts` env flags stay unset. No GAM/GPT, AdSense, GA4/GTM or push script loads. | Preview boundary; see `home-preview-track-decision.md`. |
| **DS-23** | Preview ads use labelled, reserved placeholders only. | **APPROVED** | Founder decision 23; spec §4.9 | Reserved geometry from each slot's own mapping, plus a visible "Advertisement" label at the 12 px micro-label floor (raised from ~10.4 px). Ad containers must be visually distinct from the information callout, which currently doubles as the ad band. | Closes checklist **A-01**. |
| **DS-24** | For no-fill presentation, collapse the inner creative area and retain the required outer placement geometry where needed for layout and inventory preservation. | **APPROVED WITH AD-OPERATIONS VALIDATION** | Founder decision 24; spec §4.9 (three options compared) | Adopts Option 3. Placement geometry, slot position and surrounding layout are preserved; the inner creative area collapses and the label is suppressed, so unfilled inventory does not read as broken. Zero layout shift. | **Ad operations must confirm** no viewability measurement depends on a visible container. Production behaviour may differ per DS-36. Closes checklist **A-02** subject to that validation. |
| **DS-25** | Do not activate GAM, AdSense, analytics or push scripts. | **APPROVED** | Founder decision 25 | Explicit prohibition covering the preview and any environment reached by it. No consent layer exists yet, which is itself a precondition for activation. | Consent gating is a separate later task. |
| **DS-26** | Sticky-ad final creative height remains pending ad-operations review. | **DEFERRED** | Founder decision 26; measured mapping conflict | **Recorded finding:** `hp_bottom_large_leaderboard_sticky` uses mapping `hp_horizontalAds`, whose **mobile tier permits 336 × 280 (280 px tall)**, while the implementation reserves **50 px** — a potential **~230 px shortfall**. The state sticky (`sp_bottom_large_leaderboard`, mapping `horizontalads2`, 50 px mobile maximum) is consistent. | **Unresolved.** Ad operations must confirm which creatives may serve into the sticky units. Checklist **A-03** stays DEFERRED. |
| **DS-27** | For the visual preview, use a clearly labelled inactive sticky-ad reservation state without asserting final production creative height. | **APPROVED** | Founder decision 27 | The preview shows a labelled, inactive sticky reservation. It must **not** be read as, or documented as, the approved production height. | Production height resolved via DS-26/DS-34. |
| **DS-28** | Sticky ad, bottom navigation and user task actions must follow the approved priority hierarchy and must not overlap. | **APPROVED** | Founder decision 28; Global Shell §6.4 | Priority order: **1** safety/system controls → **2** bottom navigation → **3** user-requested action (save/buy) → **4** advertising. When bottom navigation is visible, the sticky ad sits above it with safe spacing **or is suppressed**. Page clearance is **derived** from reserved height + nav height, replacing the duplicated hardcoded `pb-28`. Three sticky layers must never compete. | Closes checklist **A-04**. Verified at 320/375/390 px. |

---

## 6. Attribution Distinctions

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-29** | Approve visibly distinct treatments for official-source facts, LotteryCorner editorial analysis, AI-assisted content, human community content, affiliate/commercial actions, corrections, and responsible-play guidance. Each distinction must include text or iconography and must not rely only on colour. | **APPROVED** | Founder decision 29; Constitution §13, §15, §24.1; Global Shell §123–§126 | Seven distinct, non-promotional treatments. Mandatory non-colour signals: official source uses "Source checked · Result verified · Last updated"; editorial carries a byline or "LotteryCorner Research"; AI carries an explicit label ("LotteryCorner AI", "AI Quick Take"); community carries author attribution; commercial CTAs carry an explicit adjacent disclosure; corrections carry "Corrected" plus what/when/impact; responsible play is calm and low-chrome with promotion suppressed inside it. **Iconography is permitted but no icon library is selected** (DS-32), so text must suffice until one is. | Closes checklist **X-01**. |

---

## 7. Deferred Decisions

| ID | Decision | Status | Source | Implementation effect | Later review gate |
|---|---|---|---|---|---|
| **DS-30** | Dark-mode launch. | **DEFERRED** | Founder decision 30; `token-reuse-register.md` §5 | **Light mode is the only implementation target.** Every token records a dark-mode *intent* so a future approved theme is inexpensive, but no dark values are approved. The existing `[data-theme="dark"]` block remains reference-only and incomplete — `--lc-accent` and all seven ball tokens are unoverridden, leaving the red CTA at 2.69:1 on dark surface. **Must not be inferred as approved from the presence of those tokens** (`CLAUDE.md` §2). | Checklist **L-02** DEFERRED; **L-01** (light-only launch) approved as the direct corollary. |
| **DS-31** | Brand or paid font. | **DEFERRED** | Founder decision 31; DS-08 | No font is licensed, purchased, downloaded or referenced. System stack per DS-08 until decided. | Checklist **T-01** — brand-font portion DEFERRED. |
| **DS-32** | Icon-library selection. | **DEFERRED** | Founder decision 32; `CLAUDE.md` §19 | **No icon set is invented or added.** Until one is approved, every distinction required by DS-11, DS-14 and DS-29 must be achievable with **text, border and shape alone**. Approved icons will be supplementary and never the sole signal. | Checklist **V-03** DEFERRED. |
| **DS-33** | Final logo redesign. | **DEFERRED** | Founder decision 33 | Current header mark retained as-is. Global Shell §18 notes values may adjust to fit the logo, so brand-colour lock should follow logo selection. | Checklist **V-04** DEFERRED. |
| **DS-34** | Final sticky-ad creative height. | **DEFERRED** | Founder decision 34; DS-26 | See DS-26. Preview uses the labelled inactive reservation per DS-27. | Checklist **A-03** DEFERRED. |
| **DS-35** | Page-family-specific ad volume. | **DEFERRED** | Founder decision 35; Global Shell §154 | Ad-anchor activation and density are reserved for per-page-family blueprint review. The preview uses only the slots the approved Home blueprint already anchors. | Per-page-family ad audit and review. |
| **DS-36** | Production no-fill behaviour where ad operations require a different treatment. | **DEFERRED** | Founder decision 36; DS-24 | DS-24 governs the preview and the proposed production default. If ad operations require a different treatment, theirs prevails and DS-24 is amended. | Ad-operations review. |
| **DS-37** | Final high-fidelity visual approval. | **DEFERRED** | Founder decision 37; Global Shell §0.1 | Global Shell §0.1 requires desktop **and** mobile high-fidelity review and founder approval **per page family** before implementation is considered complete. The Home preview does not satisfy this gate. | Per-page-family visual review; Preview Track P4. |

---

## 8. Checklist Items NOT Decided by This Task

Recorded so nothing is silently assumed approved. These remain blank in the founder checklist.

| Checklist ID | Item | Why it remains open |
|---|---|---|
| **B-02** | Content maximum width ≈1280 px (replacing the current 1152 px container) | Not among the 37 decisions. DS-20 settled the breakpoint threshold only, not the container width. |
| **B-03** | Density (compact result sections, denser editorial/community) | Not explicitly decided. DS-05 and DS-07 constrain tone and nesting, but Global Shell §154 reserves **final mobile density** for page-family review. |
| **T-04** | Weight policy (400/600/700/800 only; no thin weights) | Not among the 37 decisions. DS-08 covered the font stack only. Global Shell §19's "avoid thin weights" direction still applies as approved authority. |
| **S-05** | Target size 44 × 44 px where practical | Not explicitly decided. DS-18 keeps the WCAG 2.5.8 floor binding; the 44 × 44 practical target was not separately ratified. |

---

## 9. Conflicts Closed by This Decision Record

| Conflict | Previously | Now |
|---|---|---|
| **Primary-action colour role** (spec §4.2.7) — the highest-consequence open item | Implementation used red as the primary CTA while Global Shell §18 assigned blue to primary actions and reserved red for correction/error, leaving **no colour available to signal a correction**. Both values passed contrast; the defect was semantic. | **Closed by DS-02 and DS-03.** Blue takes primary actions; red is reserved for corrections, errors, critical alerts and destructive actions. |
| **992 px / 1024 px threshold** (unresolved dependency #5) — including the measured ad-inventory gap in the 992–1023 px band | Two competing thresholds; four mobile slots and the rail vanished between 992 and 1023 px. | **Closed by DS-20** as a frontend decision, **pending ad-operations validation**. No GAM change. |
| **No-fill presentation** (unresolved dependency #9) | Three options compared, none chosen. | **Closed by DS-24** (collapse inner creative, retain outer geometry), **pending ad-operations validation** and subject to DS-36. |
| **Ten contrast failures** | Measured but unaddressed. | **Closed by DS-04** — all must be corrected to WCAG 2.2 AA. |
| **Dark-mode ambiguity** | Provisional `[data-theme="dark"]` tokens existed with no approval status. | **Closed by DS-30** — explicitly DEFERRED; light mode only. |

**Still unresolved after this record:** sticky-ad production creative height (DS-26/DS-34), live GAM behaviour, ad-operations confirmation of DS-20 and DS-24, production no-fill where ad operations differ (DS-36), page-specific ad volume (DS-35), final high-fidelity approval (DS-37), plus the pre-existing canonical/route migration, `/play/{game}` versus `/buynow/{code}`, and the 11 open Member/Insider decisions — none of which this task touched.
