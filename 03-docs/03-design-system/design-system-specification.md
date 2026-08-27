# Shared Design-System Specification

**Document type:** Design-system specification
**Recorded by:** Task LRG-DS-005 (Phase 3)
**Date:** July 25, 2026
**Status:** **PROPOSED — founder review required.** Approved *semantic roles* are separated from *proposed values* throughout.
**Primary authority:** Global Shell v1.1 §17 (visual personality), §18 (provisional semantic colour tokens), §19 (typography direction), §20 (grid and container), §21 (spacing and density), §122 (ad system), §143–§147 (accessibility) · Frozen Product Constitution §7, §13, §15–§19, §24 · root `CLAUDE.md`
**Companions:** `token-reuse-register.md`, `component-visual-contracts.md`, `founder-review-checklist.md`

### How to read status markers

| Marker | Meaning |
|---|---|
| **[ROLE APPROVED]** | The semantic role derives from an approved source. Implement it. |
| **[VALUE PROPOSED]** | The specific value is a proposal requiring founder review. |
| **[REQUIRES APPROVAL]** | Founder, design, or ad-operations decision needed before implementation. |
| **[DEFERRED]** | Deliberately out of scope for this phase. |

**Scope boundary.** Global Shell v1.1 §154 explicitly reserves "exact visual styling and color values", "final mobile density" and "page-specific section order and hierarchy" for later controlled decisions. This document proposes the first two and **does not touch the third**. Page-family section ordering remains governed solely by the page-family blueprints.

---

## 4.1 Design Principles

Derived from the Constitution and Global Shell §17. These govern every later visual decision.

1. **Immediate-value hierarchy.** The user's reason for arriving renders first and completely. Results before recommendations; claim guidance before ads; tool output before "save this". Visual weight follows task priority, never commercial priority. *(Constitution §7)*
2. **Ordinary-player clarity.** Ordinary U.S. lottery terminology, short familiar labels, plain explanations. No software, analytics or corporate vocabulary in public UI. *(Global Shell §142.1)*
3. **Trustworthy, not casino-like.** Avoid black-and-gold luxury, neon gambling aesthetics, spinning motion and AI sci-fi imagery. *(Global Shell §17)*
4. **Calm, not urgent.** No countdown pressure on ordinary content, no manipulative urgency, no "increase your chances" framing. Genuine time-sensitivity (draw cutoff) is stated factually. *(Constitution §15, §16)*
5. **Information-rich without becoming a dashboard.** Dense data is supported, but public pages must not read as enterprise analytics. *(Global Shell §17, §21)*
6. **Progressive disclosure.** Depth on request. Advanced analysis is reachable, never the default surface. *(Global Shell §19, §21)*
7. **Mobile-first.** Mobile is a primary surface, not an adaptation. *(Constitution §19)*
8. **Task protection.** Result verification, claim guidance, correction notices, AI answer blocks, tool input→output flows and responsible-play guidance are protected zones: no ad, promo or interruption inside them. *(Constitution §7; `CLAUDE.md` §12)*
9. **Provenance is visible.** Official fact, LotteryCorner analysis, community content, AI output and commerce are visually distinguishable **without relying on colour**, and each distinction is labelled. *(Constitution §13, §15; Global Shell §18 "Color must never be the sole signal")*

---

## 4.2 Semantic Colour System

**Naming rule.** Tokens are named by **role**, never by component or hue. `--color-action-primary`, not `--color-red-button`.

**Global Shell §18 provides ten provisional semantic tokens with reference values and states that "semantic roles should remain stable" while values may be adjusted.** This specification adopts those roles and records where a reference value must be **derived** because it fails WCAG 2.2 AA. All contrast figures below are computed.

### 4.2.1 Contrast requirements by role class

| Class | Requirement | Basis |
|---|---|---|
| Normal body text (< 18.66 px bold / < 24 px regular) | **≥ 4.5:1** | WCAG 1.4.3 |
| Large text | **≥ 3:1** | WCAG 1.4.3 |
| Meaningful UI boundaries, focus indicators, state graphics | **≥ 3:1** | WCAG 1.4.11 |
| Drawn result numbers | **≥ 4.5:1** — essential content, never treated as decorative | Constitution §7; Global Shell §146 |
| Purely decorative fills | none | WCAG 1.4.3 exception |

**Rule:** a token must clear its threshold on **every background it is permitted on**, not only on white. This is the specific defect found in `--lc-muted`.

### 4.2.2 Surface and text families

| Token | Role | Allowed use | Prohibited use | Contrast requirement | Light value direction | Dark treatment |
|---|---|---|---|---|---|---|
| `--color-canvas` | Page canvas **[ROLE APPROVED]** | Page background, full-bleed bands | Cards, inputs | host for text ≥4.5:1 | `#F5F7FA` **[VALUE PROPOSED]** (Global Shell §18 "Page Background") | [DEFERRED] |
| `--color-surface` | Card / panel **[ROLE APPROVED]** | Cards, panels, table bodies | Page background | host for text ≥4.5:1 | `#FFFFFF` **[VALUE PROPOSED]** (Global Shell §18 "Surface") | [DEFERRED] |
| `--color-surface-subtle` | Secondary surface | Nested rows, table stripes, secondary panels | As the only card boundary | must remain distinguishable from canvas | one perceptible step from canvas **[VALUE PROPOSED]** — the current 1.04:1 step is insufficient | [DEFERRED] |
| `--color-surface-elevated` | Overlay surface | Dialogs, mega menus, mobile menu, popovers | Inline content | ≥3:1 boundary **or** compliant border against the page beneath | surface + compliant border **[VALUE PROPOSED]** | [DEFERRED] |
| `--color-surface-band` | Full-bleed band | Jackpot ticker, section bands | Advertising containers | host for text ≥4.5:1 | replaces `--lc-ticker-bg`; must fix its 3.91:1 muted-text failure **[VALUE PROPOSED]** | [DEFERRED] |
| `--color-brand-navy` | Brand authority surface **[ROLE APPROVED]** | Header authority band, footer, insider band | Body text on light | inverse text ≥4.5:1 | `#0B1F3A` **[VALUE PROPOSED]** (Global Shell §18 "Brand Navy") | [DEFERRED] |
| `--color-text` | Body and heading text **[ROLE APPROVED]** | All ordinary text | On dark fills | ≥4.5:1 everywhere permitted | `#172033` **[VALUE PROPOSED]** (Global Shell §18 "Primary Text") — 16.27:1 on surface | [DEFERRED] |
| `--color-text-muted` | Supporting metadata **[ROLE APPROVED]** | Timestamps, captions, source lines, ad label | Primary content, essential instructions | **≥4.5:1 on the darkest permitted background** | `#48566A` **[VALUE PROPOSED]** (Global Shell §18 "Secondary Text") — 7.46:1 surface / 6.95:1 canvas, and passes on the band | [DEFERRED] |
| `--color-text-inverse` | Text on dark fills | Navy surfaces, filled buttons | On light surfaces | ≥4.5:1 against its fill | `#FFFFFF` **[VALUE PROPOSED]** | [DEFERRED] |
| `--color-border` | Meaningful boundary | Inputs, table cells, card edges that carry the only separation, control outlines | Decorative dividers | **≥3:1** | must be darker than the current `#e2e8f0` (1.23:1) **[VALUE PROPOSED]** | [DEFERRED] |
| `--color-border-subtle` | Decorative grouping | Dividers where a compliant boundary already exists | Any boundary conveying structure | none | current `#e2e8f0` may persist here **[VALUE PROPOSED]** | [DEFERRED] |

### 4.2.3 Action, focus and navigation

| Token | Role | Allowed use | Prohibited use | Contrast requirement | Light value direction | Dark treatment |
|---|---|---|---|---|---|---|
| `--color-action-primary` | Primary action / link **[ROLE APPROVED]** | Primary buttons, links, primary CTAs | Result numbers, correction notices, ad creative | text ≥4.5:1; white-on-fill ≥4.5:1 | **Action Blue `#1F5EFF`** **[VALUE PROPOSED]** (Global Shell §18) — 5.12:1 surface, 4.77:1 canvas, white-on-blue 5.12:1. **See §4.2.7 — role conflict [REQUIRES APPROVAL]** | [DEFERRED] |
| `--color-action-secondary` | Secondary action | Outlined and tertiary buttons | Primary CTA | boundary ≥3:1; label ≥4.5:1 | outlined on surface **[VALUE PROPOSED]** | [DEFERRED] |
| `--color-focus` | Focus indicator | `:focus-visible` on every interactive element | Decoration, hover-only | **≥3:1 against both the component and the adjacent background** | high-contrast, distinct from `--color-action-primary` **[VALUE PROPOSED]** | [DEFERRED] |
| `--color-nav-active` | Active navigation | Active tab/nav fill or indicator | Non-navigation emphasis | inverse text ≥4.5:1 | current `#1e293b` acceptable (14.63:1) **[VALUE PROPOSED]** | [DEFERRED] |

### 4.2.4 Feedback and data-state

Every token here is **supplementary to a text label** — none may be the sole signal.

| Token | Role | Non-colour signal required | Contrast requirement | Light value direction |
|---|---|---|---|---|
| `--color-info` / `--color-info-surface` / `--color-info-border` | Informational callout **[ROLE APPROVED]** | Icon + label | surface hosts text ≥4.5:1; border ≥3:1 (current 1.31:1 fails) | **[VALUE PROPOSED]** |
| `--color-success` | Verified match, saved success **[ROLE APPROVED]** | Icon + word ("Verified", "Saved") | ≥4.5:1 as text | Global Shell "Success Green" `#138A5B` = **4.36:1, large-text only** → **a darkened variant is required** for normal text and white-on-fill **[VALUE PROPOSED]** |
| `--color-warning` | Caution | Icon + label | ≥4.5:1 as text | **[VALUE PROPOSED]** |
| `--color-alert` | Correction, error, high consequence **[ROLE APPROVED]** | Icon + explicit "Correction" / error text | ≥4.5:1 as text | **Alert Red `#C73A3A`** **[VALUE PROPOSED]** (Global Shell §18) — 5.13:1 passes |
| `--color-state-awaiting` | Draw held, result not yet published | Explicit text ("Awaiting result") + exact next-draw date | ≥4.5:1 as text | **[VALUE PROPOSED]** |
| `--color-state-stale` | Data older than its freshness window | Explicit text + visible last-updated timestamp | ≥4.5:1 as text | **[VALUE PROPOSED]** |
| `--color-state-unavailable` | Data or feature unavailable | Explicit text + reason | ≥4.5:1 as text | **[VALUE PROPOSED]** |
| `--color-corrected` | A value has been corrected | "Corrected" label + what changed, when, impact *(Global Shell §126)* | ≥4.5:1 as text | may share `--color-alert` **[VALUE PROPOSED]** |

### 4.2.5 Attribution and commerce

| Token | Role | Non-colour signal required | Contrast requirement | Light value direction |
|---|---|---|---|---|
| `--color-ai` | AI-generated or AI-assisted content **[ROLE APPROVED]** | Explicit label — "LotteryCorner AI", "AI Quick Take", "Generated for You" *(Constitution §13)* | ≥4.5:1 as text | Global Shell "AI Teal" `#00A7A5` = **2.97:1, FAILS as text and as a white-text fill** → **a darkened variant is mandatory**; the reference value may serve only as a large fill carrying dark text **[VALUE PROPOSED]** |
| `--color-community` | Human community content **[ROLE APPROVED]** | Author attribution + community label | ≥4.5:1 as text | **[VALUE PROPOSED]** |
| `--color-editorial` | LotteryCorner editorial / research | "LotteryCorner Research" or byline | ≥4.5:1 as text | **[VALUE PROPOSED]** |
| `--color-jackpot` | Jackpot emphasis, selected facts **[ROLE APPROVED]** | Currency + explicit "estimated jackpot" wording | **never text on light** | Global Shell "Jackpot Gold" `#F4B400` = **1.85:1 as text — prohibited as text.** Use as a fill with `--color-text` on it (8.81:1, passes) **[VALUE PROPOSED]** |
| `--color-commerce-disclosure` | Affiliate / sponsored disclosure | Explicit disclosure sentence *(FTC; `CLAUDE.md` §13)* | ≥4.5:1 at its rendered size | **[VALUE PROPOSED]** |
| `--color-ad-placeholder` | Advertising container | "Advertisement" label | label ≥4.5:1 | **[VALUE PROPOSED]** — must be visually distinct from `--color-info-surface`, which currently doubles as the ad band |

### 4.2.6 Prohibited colour uses (system-wide)

- Colour as the **only** carrier of state, category, ball identity or attribution. *(Global Shell §18, §146)*
- `--color-alert` for routine CTAs or emphasis.
- `--color-jackpot` as text on a light surface.
- Ad creative or ad containers styled to resemble a result, jackpot card or community post. *(Global Shell §122)*
- Casino/luxury gold-on-black, neon or gradient-heavy treatments. *(Global Shell §17)*
- Reusing `--color-info-surface` for advertising bands.

### 4.2.7 Recorded conflict — primary action colour **[REQUIRES APPROVAL]**

| | |
|---|---|
| **Existing implementation** | Red `#b91c1c` (`--lc-accent`) is the primary CTA, Buy Tickets colour, price colour and active-link colour. |
| **Approved direction** | Global Shell §18 assigns **Action Blue `#1F5EFF`** to "links, primary actions" and **Alert Red `#C73A3A`** to "correction/error/high consequence". |
| **Why it matters** | With red as the routine CTA there is **no colour left to signal a correction** — and correction notices are a Global Shell §126 requirement. Red-for-commerce also sits against Constitution §15–§16 (no manufactured urgency, commerce must not exploit pressure). |
| **Not a contrast problem** | Both values pass AA. The defect is semantic. |
| **Options** | **(a)** Adopt Global Shell §18 as written — blue primary, red reserved for correction/alert. **(b)** Retain red as a brand accent for a *narrow* set of high-intent commerce CTAs while introducing blue for links and standard actions and reserving a distinct correction treatment. **(c)** Propose an alternative palette in a design iteration. |
| **Recommendation** | **Option (a)**, for role clarity and because it is the approved direction. Recorded as founder checklist item **C-02**; the previous iteration's red-CTA convention MUST NOT be treated as approved. |

---

## 4.3 Typography

**Font-family policy [ROLE APPROVED, Global Shell §19].** Highly legible sans-serif; clear number rendering; tabular numerals for results, jackpots and dates; comfortable minimum mobile body size; **no thin weights**.

**Proposed policy [VALUE PROPOSED]:** a **system sans-serif stack** for launch — zero network cost, no licence, excellent digit legibility, and it directly serves the performance priorities. **No brand or licensed font is selected here** — `CLAUDE.md` §19 forbids inventing licensed assets, and Global Shell §19 states final font choice belongs to the design system. Brand-font selection is founder checklist item **T-01 [REQUIRES APPROVAL]**.

**Tabular numerals are mandatory** (`font-variant-numeric: tabular-nums`) for: drawn numbers, jackpot amounts, dates, times, countdowns, odds, prize tiers and every numeric table column. This is a Global Shell §19 requirement, not a preference.

| Role | Size range (mobile → desktop) | Line height | Weight | Max measure | Notes |
|---|---|---|---|---|---|
| Display | 28–32 → 40–48 px | 1.1–1.2 | 700–800 | — | Jackpot and flagship result emphasis only. Tabular numerals. |
| H1 | 24–28 → 32–36 px | 1.2 | 700 | 30ch | One per page. |
| H2 | 20–22 → 24–28 px | 1.25 | 700 | 40ch | Section headings; carries the section ID contract. |
| H3 | 18 → 20 px | 1.3 | 600–700 | 50ch | Sub-sections, result-group headings. |
| H4 | 16 → 18 px | 1.35 | 600 | 50ch | Card titles. |
| Body large | 17–18 px | 1.6 | 400 | 65–75ch | Lead paragraphs, answer blocks. |
| Body | **16 px minimum** | 1.6 | 400 | 65–75ch | Default. **16 px is the floor on mobile** — the current `text-[15px]` page default is below it. |
| Body small | 14 px | 1.5 | 400 | 65ch | Secondary prose. Not for essential instructions. |
| Label | 13–14 px | 1.4 | 600 | — | Field labels, ball group labels, badges. |
| Caption / metadata | 13 px minimum | 1.4 | 400 | — | Timestamps, source lines. |
| Micro label | **12 px floor** | 1.3 | 600 | — | Ad label, disclosure chips. **Raises the current 0.65 rem (~10.4 px) ad label.** |
| Result number | 16–20 → 18–22 px | 1 | 700 | — | Inside balls. **Tabular numerals; always real text, never image-only.** |
| Tabular data | 14–16 px | 1.4 | 400 (600 headers) | — | Tabular numerals; header cells associated via `<th scope>`. |
| Button | 14–16 px | 1.2 | 600 | 24ch | Never below 14 px. |
| Navigation | 14–16 px | 1.2 | 600 | — | Bottom-nav labels are text, not icon-only *(Global Shell §144)*. |
| Disclosure | 13 px minimum | 1.5 | 400 | 75ch | Affiliate, AI and independence disclosures must be legible, not fine print. |

**Accessibility rules.** Sizes in relative units so browser text scaling applies. Layout must survive **200 % zoom** and text-only scaling to 200 % without loss of content or function *(WCAG 1.4.4, 1.4.10)*. No text in images. `text-transform: uppercase` only on short labels, never on sentences. Letter-spacing on uppercase micro-labels must not reduce legibility.

---

## 4.4 Spacing and Sizing

**Base unit: 4 px.** All spacing comes from the scale; one-off values are prohibited.

| Step | Value | Typical use |
|---|---|---|
| `space-1` | 4 px | Icon-to-label, tight inline gaps |
| `space-2` | 8 px | Ball gaps, chip padding, badge padding |
| `space-3` | 12 px | Card inner gaps, form row spacing |
| `space-4` | 16 px | Card padding (mobile), paragraph rhythm |
| `space-5` | 20 px | Card padding (desktop) |
| `space-6` | 24 px | Intra-section spacing |
| `space-8` | 32 px | Section spacing (mobile) |
| `space-10` | 40 px | Section spacing (desktop) |
| `space-12` | 48 px | Major band separation |
| `space-16` | 64 px | Page-region separation |

| Concern | Rule |
|---|---|
| Section spacing | 32 px mobile → 40–48 px desktop between top-level sections. Core result sections sit at the **compact** end *(Global Shell §21)*. |
| Card padding | 16 px mobile → 20 px desktop. **Avoid nested cards on mobile** *(Global Shell §21)* — maximum one level of nesting. |
| Inline gaps | 8 px between balls; 8–12 px between chips; 12 px between form controls. |
| Form spacing | 8 px label→control; 16 px between fields; 24 px before the submit action. |
| Result-card spacing | 12 px between header, ball row and footer; ball rows wrap at `space-2` and must wrap cleanly for 20+1 sets (Keno/Quick Draw). |
| Mobile safe areas | Respect `env(safe-area-inset-*)` for bottom navigation and sticky ads *(Global Shell §147)*. |
| **Sticky clearance** | **Derived, never hardcoded.** Bottom padding = reserved sticky-ad height + bottom-nav height + `space-2`. Replaces the duplicated `pb-28` guess. Focus must never be obscured *(WCAG 2.4.11)*. |
| Minimum interactive target | **44 × 44 CSS px** where practical; never below the WCAG 2.5.8 minimum (24 × 24) without sufficient spacing or an equivalent control *(Global Shell §143)*. |
| Container widths | Content max **≈1280 px** *(Global Shell §20)*; 12-column desktop grid, 8-column tablet, 4-column mobile; page gutters 16 px mobile → 24 px tablet → 32 px desktop. |
| Readable measure | Prose constrained to **65–75ch**. Tables, result grids and number sets **may use full content width** *(Global Shell §20)*. |

---

## 4.5 Layout and Breakpoints

| Name | Range | Columns | Behaviour |
|---|---|---|---|
| Mobile | 320–599 px | 4 | Single column; bottom navigation; in-content mobile ad slots. Must work at **320 px**. |
| Compact tablet | 600–767 px | 4–8 | Single column, wider gutters; two-up cards where content allows. |
| Tablet | 768–991 px | 8 | Two-up card grids; **still no contextual rail**. |
| Desktop | 992/1024–1439 px | 12 | Main content + optional contextual rail *(Global Shell §20)*. |
| Wide desktop | ≥1440 px | 12 | Content capped at ≈1280 px; extra space becomes margin, not more columns. |

The desktop lower bound is deliberately written as **992/1024** because it is the subject of an unresolved dependency.

### 4.5.1 The 992 px / 1024 px dependency

**Facts, verified:**

- GAM size mappings switch tiers at **`[992, 0]`** (desktop) versus **`[0, 0]`** (mobile/tablet). These are **fixed production configuration** and are not changed by this task.
- `globals.css` reserves the desktop ad height at `@media (min-width: 992px)` and hides mobile-only slots at the same threshold.
- Tailwind's default `lg:` — which currently controls the two-column switch and the contextual rail — fires at **1024 px**.
- Only two mapping tiers exist in production; there is no desktop-only or tablet-only tier, so "tablet" resolves to the mobile tier.

**Consequence found during this audit — an ad-inventory gap:**

> Between **992 px and 1023 px**, `.lc-ad--mobile-only` slots are **hidden** (their rule fires at ≥992 px) while the contextual rail is **also hidden** (it appears at `lg:` = 1024 px). In that 32 px band, four mobile snippet slots and the rail slots all disappear simultaneously.

This is a revenue defect in the current implementation, not merely a cosmetic mismatch, and it is why the threshold question must be settled in this phase.

#### Option A — Align layout behaviour to the existing 992 px GAM threshold

| | |
|---|---|
| **Benefits** | One threshold governs ad tier, ad visibility and the column switch. The 992–1023 px gap is eliminated by construction. Reasoning about "desktop" becomes unambiguous. Requires **no GAM change**. |
| **Risks** | Redefines Tailwind's `lg` (or introduces `lg: 992px`), changing the meaning of all 21 existing `lg:` usages. 1024 px is the more common modern laptop/tablet-landscape threshold; 992 px is a Bootstrap-era value. Two-column layout begins 32 px earlier, so the rail and main column are each slightly narrower at the low end. |
| **Ad-reservation effect** | Reservation and layout flip together — no mismatch possible. |
| **Layout effect** | Two-column and rail start at 992 px. Rail width must be validated at exactly 992 px (300 px rail + gutters + main column). |
| **Testing burden** | Moderate — every `lg:` usage revalidated once; thereafter a single threshold to test. |

#### Option B — Keep layout at 1024 px and treat 992–1023 px as an explicit transitional range

| | |
|---|---|
| **Benefits** | No change to Tailwind defaults or existing `lg:` semantics. Smallest diff. |
| **Risks** | **Does not fix the inventory gap on its own.** The mobile-ad visibility rule must additionally move from 992 px to 1024 px, otherwise slots vanish in the band. Leaves two permanently different thresholds, which invites future regressions. |
| **Ad-reservation effect** | GAM may serve the desktop tier from 992 px while the layout is still single-column. For horizontal slots the reserved-height difference is small (90 px desktop vs 50 px mobile). For `verticalads1` the desktop tier reserves up to **600 px** versus 280 px mobile — but the rail is not rendered below 1024 px, so that only matters if a vertical slot is ever placed in the single-column flow. |
| **Layout effect** | Single-column persists to 1023 px. |
| **Testing burden** | Higher ongoing — every ad-adjacent change needs testing at both 992 px and 1024 px, plus the band between. |

#### Option C — Introduce a named ad/layout breakpoint at 992 px, retaining other Tailwind breakpoints

| | |
|---|---|
| **Benefits** | Makes the GAM threshold explicit and self-documenting (e.g. `ad-desktop: 992px`). Other Tailwind breakpoints keep their conventional meanings. Ad visibility and reservation bind to the named token. |
| **Risks** | If the **column switch** stays on `lg` (1024 px) while ad visibility uses the named 992 px token, the inventory gap **returns**. Closing it requires the named token to also drive the column/rail switch — at which point this is Option A with a clearer name. Two thresholds in the codebase remain a comprehension cost. |
| **Ad-reservation effect** | Correct and explicit, provided the same token drives visibility, reservation **and** the column switch. |
| **Layout effect** | Identical to Option A if the token governs the column switch; identical to Option B if it does not. |
| **Testing burden** | Moderate; lower than B because the intent is named. |

#### Recommendation

**Option A, expressed using Option C's naming.** Define a single named layout/ad threshold at **992 px**, set Tailwind's desktop breakpoint to it, and drive ad-tier reservation, mobile-slot visibility and the two-column/rail switch from that one value.

Rationale: the GAM 992 px tier is **immovable without ad-operations approval**, so aligning the layout to it is the only option that closes the inventory gap without touching production ad configuration, and it leaves exactly one threshold to reason about.

| | |
|---|---|
| **Classification** | **Technical implementation direction** for the layout/CSS side — **and [REQUIRES APPROVAL] from ad operations and the founder**, because it changes the viewport at which the two-column layout and contextual rail appear, and because the inventory-gap finding should be confirmed against live GAM delivery. |
| **Explicitly not done here** | No GAM size mapping, slot ID, unit path, placement or slot count is changed by this task or by this recommendation. |
| **Founder checklist item** | **B-01** |

---

## 4.6 Shape, Border and Elevation

**Radius scale [VALUE PROPOSED]**

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4 px | Chips, badges, small inputs |
| `--radius-md` | 8 px | Buttons, cards, tables, ad containers |
| `--radius-lg` | 12 px | Feature panels, dialogs |
| `--radius-full` | 9999 px | Balls, avatars, pills |

Consolidates the current four ad-hoc radii. **Ad containers use `--radius-md`** and must not be styled to resemble content cards.

**Border hierarchy**

| Level | Token | Requirement |
|---|---|---|
| Meaningful boundary | `--color-border` | **≥3:1.** Inputs, table cells, control outlines, and any card edge that is the only separation from its background. |
| Decorative divider | `--color-border-subtle` | No contrast requirement; permitted only where a compliant boundary already exists. |
| Boundary on inverse | `--color-border-on-inverse` | ≥3:1 against navy where it conveys structure. |

**Elevation scale [VALUE PROPOSED]**

| Token | Use | Rule |
|---|---|---|
| `--elevation-0` | Inline content | Default. Cards prefer a border over a shadow. |
| `--elevation-1` | Sticky header, sticky ad | Separation only — never decoration. |
| `--elevation-2` | Dropdowns, mobile menu, popovers | Must be paired with a compliant border. |
| `--elevation-3` | Modal dialogs | Plus a scrim. |

**Elevation MUST NOT be the only separator.** Shadows are removed in forced-colors mode, so every elevated surface also needs a border. Decorative elevation and card-on-card nesting beyond one level are prohibited *(Global Shell §21)*.

**Treatments**

- **Card boundary:** border-first. Surface-vs-canvas separation is only 1.07:1, so a card without a compliant border is not perceivable.
- **Information callout:** `--color-info-surface` + `--color-info-border` (≥3:1) + icon + text label. Must not be confused with an ad band.
- **Dialog / overlay:** `--color-surface-elevated`, `--radius-lg`, `--elevation-3`, scrim, focus trap, Escape to close, focus returns to the trigger *(Global Shell §144)*.
- **Sticky navigation vs sticky ad:** each needs its own boundary; they must be visually separable and must never overlap. Priority order in §4.9.

---

## 4.7 Result-Number and Game-Symbol System

**Governing constraint [ROLE APPROVED, Global Shell §146]:** numbers are text, not image-only; lottery-ball styling has text equivalents; draw date and game are announced before values; **colour is not the only distinction for bonus balls**; tables provide headers and captions.

**Quantified justification.** Special-ball fills are separated by only **1.09–1.30:1** in luminance (Mega Ball vs Cash Ball 1.09; Powerball vs Bonus 1.10). Colour is therefore not merely insufficient in principle — it is measurably incapable of carrying the distinction.

**Every special type MUST combine at least three of:** a visible text label · a textual prefix/suffix · a distinct border pattern · a shape treatment · an accessible name.

| Type | Fill | Visible label | Border / shape | Accessible name pattern | Notes |
|---|---|---|---|---|---|
| Standard ball | `--ball-standard` | Group label where a group exists | Circle, no extra border | "Number 17" | Highest contrast pair (17.85:1). |
| Powerball | `--ball-powerball` | **"Powerball"** below or beside the group | Circle + distinct ring | "Powerball 12" | Label mandatory. |
| Mega Ball | `--ball-megaball` | **"Mega Ball"** | Circle + distinct ring | "Mega Ball 9" | Mandatory — 1.09:1 vs Cash Ball. |
| Cash Ball | `--ball-cashball` | **"Cash Ball"** | Circle + distinct ring | "Cash Ball 3" | Mandatory. |
| Fireball | `--ball-fireball` *(darkened — current 3.56:1 fails)* | **"Fireball"** | Circle + distinct ring | "Fireball 4" | Add-on, not a main number: must read as supplementary. |
| Bonus ball | `--ball-bonus` | **"Bonus"** | Circle + distinct ring | "Bonus ball 21" | Mandatory — 1.10:1 vs Powerball. |
| Multiplier | `--multiplier-*` | **Full text, e.g. "Power Play 3×"** | Pill, `--radius-full`, compliant border | "Power Play 3 times" | Never a bare number. |
| Secondary draw | inherits group fills | **Named heading, e.g. "Double Play"** | Grouped container with its own heading | Group announced before its values | A separate drawing, visually subordinate to the main draw. |
| Card-game result | `--card-face-*` + **new** `--card-face-border` (≥3:1) | Rank and suit as **text** | Rounded rectangle, not a circle | "Ten of hearts" | Suit MUST NOT be conveyed by colour alone — 1.00:1 against a white surface today. |
| Awaiting result | `--color-state-awaiting` | **"Awaiting result"** + exact next-draw date | Placeholder that reserves the ball row's height | "Result not yet available" | No empty circles without explanation. |
| Corrected result | `--color-corrected` | **"Corrected"** + what changed, when, impact | Marker adjacent to the affected value | Correction announced with the value | *(Global Shell §126)* |

**Icon policy.** No icon library is selected **[DEFERRED]** — `CLAUDE.md` §19 forbids inventing one. Until an icon set is approved, every distinction must be achievable with **text, border and shape**. Icons, when approved, are supplementary and never the sole signal.

**Preserved invariants:** drawn values render as crawlable server-side text; **game-defined ordering is never re-sorted** for visual convenience; ball count is derived from the data, never hardcoded; ball rows wrap cleanly through 20+1 sets.

---

## 4.8 Interaction States

Every interactive element defines all applicable states. **No state may be conveyed by colour alone.**

| State | Visual requirement | Non-colour signal | Announcement |
|---|---|---|---|
| Default | Token-driven resting appearance | — | — |
| Hover | Perceptible change; pointer devices only | Not required (hover is not the only path) | — |
| **Focus-visible** | **`--color-focus` indicator, ≥3:1 against both the component and the adjacent background; ≥2 px thick; never removed** | The indicator itself | Native role and label |
| Active / pressed | Perceptible depression or fill shift | — | — |
| Selected / current | Fill or indicator **plus** weight change **plus** `aria-current` | Weight + `aria-current` | "current page/tab" |
| **Disabled** | **Must NOT resemble an available action.** Reduced prominence **plus** an explicit reason or "coming soon" label; prefer omitting the control entirely when it has no function | Text explanation | `aria-disabled` or omitted from the tab order |
| Loading | Reserved space, no layout shift; skeleton or progress | Text status ("Loading results…") | `aria-busy` / polite live region |
| Error | `--color-alert` + icon + message naming the problem and the recovery | Icon + text | Assertive live region; focus moves to the message |
| Success | `--color-success` + icon + confirmation text | Icon + text | Polite live region |
| Corrected | `--color-corrected` marker + what changed, when, impact | Explicit "Corrected" label | Announced with the value |
| Stale | Visible last-updated timestamp + explicit staleness note | Text | Polite |
| Unavailable | Explicit unavailability text + reason | Text | Polite |

**Requirements**

- **Focus is mandatory and must not be obscured** by the sticky ad, sticky header or bottom navigation *(WCAG 2.4.11; Global Shell §143)*. Scroll-into-view must account for sticky clearance. **No focus style exists today** — this is a new obligation, not a refinement.
- **Keyboard:** every action reachable and operable; mega menus open by button with `aria-expanded`/`aria-controls`; Escape closes; focus returns to the trigger; no hover-only content; bottom navigation is bypassable by assistive technology *(Global Shell §144, §147)*.
- **Reduced motion:** `prefers-reduced-motion: reduce` removes non-essential transition and animation. **Not currently handled.**
- **Touch targets:** 44 × 44 CSS px where practical; never below WCAG 2.5.8 without spacing or an equivalent control.
- **Screen reader:** result values announced with game and draw date; AI answers provide an "answer complete" status and a stop control; streaming must not continuously overwhelm output *(Global Shell §145)*.
- **Current violation to fix:** 13 `disabled` attributes across 7 files render as apparently-available controls (newsletter ×2, Login, Register, favourite star, AI CTA, privacy manager, state selector). `CLAUDE.md` §9 prohibits this.

---

## 4.9 Advertising Presentation

**Absolute boundary:** this section defines **presentation only**. It changes **no** slot count, slot ID, GAM unit path, size mapping or placement. All 47 recorded slot definitions stand unaltered.

| Concern | Rule |
|---|---|
| **Ad label** | Every container carries a visible **"Advertisement"** label at the `--type-label-micro` floor (12 px), using `--color-text-muted` (≥4.5:1). Raises the current ~10.4 px label. |
| **Reserved container** | Space is reserved **before** any request, from the slot's own size mapping. `reserveSpace: true` is the recorded default. Reservation is the mechanism that prevents CLS. |
| **Desktop / mobile reservation** | Reserve the **tallest creative in the applicable tier**. Recorded maxima: horizontal 90 px desktop / 50–280 px mobile; billboard 250 px desktop / 100–280 px mobile; vertical 250–600 px desktop / 280 px mobile. Bound to the single named threshold from §4.5. |
| **Content / ad differentiation** | Ad containers use a neutral surface, `--radius-md`, a compliant boundary and the label. They MUST NOT reuse `--color-info-surface`, card styling, jackpot styling or community styling. **No ad may be styled as a result, jackpot card or topic** *(Global Shell §122)*. |
| **Spacing from tasks** | Minimum `space-6` between an ad and any protected zone. **No ad inside** a result grid, between a jackpot and its numbers, between tool input and output, between a pending row and its status, or inside claim, correction, AI-answer or responsible-play blocks. |
| **Loading state** | Reserved neutral space plus the label. No spinner, no skeleton that mimics content, no motion. |
| **Responsive transitions** | Reserved height changes only at the single named threshold. Mobile-only slots are visible below it and hidden above — the visibility rule and the layout switch **must share one threshold** (§4.5.1). |
| **Prohibited** | Pop-up on arrival; countdown prestitial; autoplay sound; deceptive close; result-like creative; unreserved layout shift; excessive mobile density *(Global Shell §122)*. |

### Sticky ad

| Concern | Rule |
|---|---|
| Position | Fixed to the viewport bottom, centred, above the safe-area inset. |
| **Priority order** | **1** safety/system controls → **2** bottom navigation → **3** user-requested action (save/buy) → **4** advertising. If bottom navigation is visible, the sticky ad sits **above** it with safe spacing **or is suppressed** *(Global Shell §6.4)*. Three sticky layers must never compete. |
| Close control | Persistent, ≥44 × 44 px, accessible name "Close advertisement", keyboard reachable, and **must not add height** to the bar. Close must be honest — no deceptive placement. |
| Clearance | Page bottom padding derived from reserved sticky height + bottom-nav height + `space-2`. Never a hardcoded guess. |
| Obstruction | Must never obscure numbers, inputs, focus indicators or safety guidance *(Global Shell §122, §147)*. |

**Recorded sticky risk [REQUIRES APPROVAL — ad operations].** `hp_bottom_large_leaderboard_sticky` uses mapping `hp_horizontalAds`, whose **mobile tier permits a 336 × 280 creative (280 px tall)**, while its own flat sizes are only `[[728,90],[320,50]]` and the implementation reserves **50 px** on mobile. If GAM serves 336 × 280 into that sticky unit, the bar under-reserves by **~230 px**. The state-page sticky (`sp_bottom_large_leaderboard`, mapping `horizontalads2`) has a 50 px mobile maximum and is consistent. **Ad operations must confirm which creatives may serve into the sticky units before the sticky reservation is finalized.** Founder checklist item **A-03**.

### No-fill presentation — three options compared

`collapseIfEmpty: false` is the recorded production default and is correct for fixed placements: the slot must not collapse. That makes the empty appearance a **deliberate design decision**, not a fallback.

| Option | Description | Benefits | Risks |
|---|---|---|---|
| **1. Reserved neutral space** | Retain the geometry; render nothing visible — no border, no label. | Cleanest page; no "broken" impression; zero CLS. | Reads as an unexplained gap, especially a 250–600 px one. May look like a rendering fault. |
| **2. Labelled placeholder** | Retain geometry, border and "Advertisement" label. | Honest and self-explanatory; matches current behaviour. | Up to 47 visible empty boxes; labelling a slot that shows nothing is poor experience and adds visual noise. |
| **3. Collapsed internal creative area, geometry retained** | Keep the **outer placement geometry** (so surrounding layout and slot position are untouched) while collapsing the **inner creative area** and suppressing the label. | Preserves placement, order and zero CLS while removing the empty-box impression; visually calm. | Needs precise definition of what "geometry retained" means per slot so no shift occurs; requires ad-ops confirmation that no viewability metric depends on the visible container. |

**Recommendation: Option 3**, falling back to Option 1 where a slot's geometry cannot be preserved without a visible container. **[REQUIRES APPROVAL — ad operations]**, because it affects how unfilled inventory presents and must not disturb placement or measurement. Founder checklist item **A-02**.

---

## 4.10 AI, Community, Commerce and Provenance Styling

Each treatment is **visually distinct but non-promotional**, and **none relies on colour alone** *(Global Shell §18; Constitution §13, §15)*.

| Content class | Visual treatment | Mandatory non-colour signal | Prohibited |
|---|---|---|---|
| **AI-generated / AI-assisted** | Subtle bounded region using `--color-ai` (darkened variant for any text) with a leading label | **Explicit label** — "LotteryCorner AI", "AI Quick Take", "What This Means", "Generated for You" *(Constitution §13)* | Sci-fi imagery, chatbot gradients, sparkle motifs, any implication of predictive power, an AI persona that appears human |
| **Human community** | Community-attributed block with author identity | Author attribution + community label; AI contributions in community are separately and clearly identified | Styling that blends community opinion with verified fact; fabricated posts, replies, reputation or activity |
| **Official-source information** | Compact source/verification line — "Source checked · Result verified · Last updated" *(Global Shell §123)* | Text; the word "official" used **only** where the distinction materially matters *(Constitution §24.1)* | Implying LotteryCorner is an official lottery; using "official" as ordinary result voice |
| **LotteryCorner editorial / analysis** | Byline or "LotteryCorner Research" label | Explicit attribution + claim-type wording ("historical observation", not prediction) | Presenting analysis as official fact; implying history changes future odds |
| **Affiliate / commercial CTA** | `--color-action-primary` action styling with an adjacent disclosure | **Explicit disclosure sentence**, `rel="nofollow sponsored"`, plus state-eligibility context | Raw affiliate URLs; presenting an affiliate as an official lottery; urgency or loss-framing; commerce inside a protected zone |
| **Correction notice** | `--color-corrected` bounded notice near the affected value | **"Corrected"** + what changed + when + impact *(Global Shell §126)* | Silent correction; burying it below the fold |
| **Responsible-play guidance** | Calm, low-chrome block; promotion suppressed within it | Explicit guidance text + 18+ notice | Ads or commercial CTAs inside the block; alarming or stigmatising styling |

---

## 4.11 Motion

| Concern | Rule |
|---|---|
| Allowed | Opacity and small transform transitions on hover, focus, disclosure expand/collapse, menu open/close, and reserved-space content replacement. |
| Ordinary duration | **120–200 ms**, ease-out. Overlays may reach 250 ms. |
| Prohibited | Spinning or slot-machine motion; confetti or celebration on results; pulsing or flashing urgency; parallax; motion that implies a prediction; anything resembling casino animation *(Global Shell §17)*. Nothing may flash more than three times per second *(WCAG 2.3.1)*. |
| Autoplay | No autoplaying video or audio. No autoplaying carousels. Any moving content lasting >5 s needs pause/stop/hide *(WCAG 2.2.2)*. |
| **Reduced motion** | `prefers-reduced-motion: reduce` disables non-essential transition and animation, leaving instant state changes. Focus and state changes remain perceptible. **Not currently implemented.** |
| Sticky elements | Appear/disappear without animated jitter; never animate height (that causes shift). |
| Result updates | A new result **replaces content within already-reserved space**. A brief non-flashing emphasis is permitted; no celebratory motion. |
| Correction emphasis | Static, persistent marker — never a transient flash the user can miss. |

---

## 4.12 Responsive and Accessibility Requirements

**Target: WCAG 2.2 AA minimum** *(Global Shell §143; `CLAUDE.md` §9)*.

### Minimum validation widths

| Width | Why |
|---|---|
| **320 px** | Smallest supported; no horizontal page scrolling |
| **375 px** | Common small phone; sticky-conflict worst case |
| **390 px** | Common current phone |
| **768 px** | Tablet portrait; 8-column |
| **992 px** | **GAM desktop tier boundary** — reservation and (recommended) column switch |
| **1024 px** | Current Tailwind `lg`; the 992–1023 band must be verified either way |
| **1280 px** | Content maximum |
| **1440 px** | Wide desktop; content capped, surplus becomes margin |

### Required checks

| Check | Requirement |
|---|---|
| Zoom | **200 %** zoom with no loss of content or function *(WCAG 1.4.4)*; reflow at 320 px equivalent *(1.4.10)* |
| Text scaling | Text-only scaling to 200 % without clipping or overlap |
| Keyboard-only | Full operation; logical order; visible focus; **focus never obscured** by sticky elements *(2.4.11)*; no keyboard traps |
| Screen-reader structure | One `h1`; no skipped heading levels; landmarks; tables with `<th scope>` and captions; result values announced with game and draw date |
| Forced colors | Layout and meaning survive `forced-colors: active`; borders and text carry the meaning since shadows and background fills are dropped |
| No horizontal scroll | Page never scrolls horizontally; **data tables may scroll within their own container with a visible affordance** *(Global Shell §20)* |
| Sticky-element conflict | At 320/375/390 px verify sticky ad + bottom navigation + any sticky action against the §4.9 priority order; verify focus visibility with all sticky layers present |
| **Ad no-fill** | Every page validated with **all slots unfilled** — the most likely production state in low-fill conditions — confirming no gap reads as broken and no layout shift occurs |
| Contrast | Every text/background pair and every meaningful boundary verified against §4.2.1; a token failing on any permitted background is a defect |
| Reduced motion | Verified with `prefers-reduced-motion: reduce` |
| Target size | 44 × 44 px where practical; never below WCAG 2.5.8 without spacing or an equivalent |

---

## 5. Unresolved Items

None of these is settled by this task.

| # | Item | Owner | Resolves via |
|---|---|---|---|
| 1 | **Exact final colour values** | Founder + design | Checklist C-01…C-04. Global Shell §154 reserves exact values |
| 2 | **Primary-action colour role conflict** (red vs Action Blue) | **Founder** | Checklist **C-02** — the most consequential open item |
| 3 | **Brand font** | Founder + design | Checklist T-01. System stack proposed for launch |
| 4 | **Dark-mode launch** | Founder | Checklist L-02. **DEFERRED**, not approved |
| 5 | **Icon library** | Founder + design | Checklist V-03. No set invented |
| 6 | **Final logo treatment** | Founder + design | Checklist V-04. Out of scope |
| 7 | **992 / 1024 breakpoint** | **Ad operations + founder** | Checklist B-01. §4.5.1 recommends aligning to 992 px |
| 8 | **Sticky-ad creative height** | **Ad operations** | Checklist A-03. Home sticky mapping permits 280 px vs 50 px reserved |
| 9 | **No-fill collapse behaviour** | **Ad operations** + design | Checklist A-02. Option 3 recommended |
| 10 | **Page-specific ad volume** | Founder + ad operations | Per-page-family blueprint review; Global Shell §154 reserves ad-anchor density |
| 11 | **Final high-fidelity shell appearance** | Founder + design | Phase 4 shell specification, with desktop and mobile examples |

---

## 6. Consistency Validation

| Check | Result |
|---|---|
| Every proposed token has exactly one semantic role | ✅ `--lc-text`/`--lc-heading` consolidated; two inverse-border values merged |
| No two token names describe the same role unnecessarily | ✅ verified across all families |
| No component relies only on colour for state | ✅ every state in §4.8 and every ball type in §4.7 carries a mandatory non-colour signal |
| All text/background pairs have defined contrast requirements | ✅ §4.2.1 thresholds; every pair computed in `token-reuse-register.md` |
| Mobile-first rules explicit | ✅ §4.4, §4.5, §4.12; 16 px body floor; 320 px minimum |
| Breakpoint recommendation does not alter GAM configuration | ✅ stated in §4.5.1 and §4.9 |
| Page-family section ordering not redefined | ✅ no section order appears in this document; ordering stays with the page-family blueprints |
| Ad inventory not reduced | ✅ presentation only; 47 slot definitions untouched; the 992–1023 px finding **increases** effective inventory |
| No Member/Insider decision promoted | ✅ signed-in continuity is described only as a visual contract; entitlement, paid tiers and Insider ad treatment are untouched |
| No existing code described as approved design | ✅ all provisional tokens classified with evidence in the reuse register |
| Design-system specification precedes shell implementation | ✅ Phase 3 of the approved sequence; Phase 4 is the shell specification |
| Dark mode not silently approved | ✅ explicitly DEFERRED with recorded reasons |
