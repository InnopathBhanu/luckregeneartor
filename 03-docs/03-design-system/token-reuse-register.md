# Token Reuse Register — Existing Visual Values

**Document type:** Design-system decision record
**Recorded by:** Task LRG-DS-005 (Phase 3)
**Date:** July 25, 2026
**Status:** **PROPOSED — founder review required** (see `founder-review-checklist.md`)
**Governing authority:** Global Shell v1.1 §17–§21 (visual personality, provisional semantic tokens, typography, grid, spacing/density) · Global Shell §143–§147 (accessibility) · root `CLAUDE.md` §6 reuse vocabulary
**Companions:** `design-system-specification.md`, `component-visual-contracts.md`, `founder-review-checklist.md`

**Vocabulary:** KEEP · KEEP AND RESTYLE · REPLACE · KEEP AS REFERENCE (per `CLAUDE.md` §6)

**Method.** Every value below was read from `01-new-ui/app/globals.css` and the components, then contrast-tested against WCAG 2.2 AA thresholds (4.5:1 normal text, 3:1 large text and non-text UI). **No file was edited.** Contrast figures are computed, not estimated.

---

## 0. Headline Findings

| # | Finding | Evidence |
|---|---|---|
| 1 | **Accent-colour role conflict.** The implementation uses red `#b91c1c` as the **primary CTA**. Global Shell v1.1 §18 assigns **Action Blue `#1F5EFF`** to "links, primary actions" and reserves **Alert Red `#C73A3A`** for "correction/error/high consequence". | `globals.css:16` vs Global Shell §18 |
| 2 | **`--lc-muted` fails AA on three of five backgrounds.** 4.39:1 on canvas, 4.37:1 on info background, 3.91:1 on the ticker band — all below 4.5:1 for normal text. | computed |
| 3 | **Fireball ball fails AA.** White on `#ea580c` = 3.56:1. Drawn numbers are essential content. | computed |
| 4 | **All borders fail 3:1 non-text contrast.** `--lc-border` on surface = 1.23:1; on canvas = 1.14:1; `--lc-info-border` on info background = 1.31:1. | computed |
| 5 | **Card boundaries are near-invisible.** Surface vs canvas = 1.07:1, so a card is defined almost entirely by a border that itself fails 3:1. | computed |
| 6 | **Special balls are indistinguishable by luminance.** Mega Ball vs Cash Ball = 1.09:1; Powerball vs Bonus = 1.10:1. Colour cannot carry the distinction — confirming Global Shell §146 quantitatively. | computed |
| 7 | **Four semantic roles have no token at all**: AI, jackpot emphasis, success/verified, and correction/error. One red accent currently does CTA duty for all emphasis. | `globals.css` inventory |
| 8 | **Dark mode is incomplete.** `--lc-accent` and all seven ball tokens are **not** overridden, so red CTA on dark surface = 2.69:1 (fail) and ball colours are untuned. | `globals.css:39–50` |
| 9 | **Zero focus styles exist.** No `focus-visible`, ring, or outline anywhere. Focus relies entirely on the browser default, which Global Shell §143 does not accept. | grep across `components/`, `app/` |
| 10 | **Zero reduced-motion handling** and zero transitions/animations. | grep |

---

## 1. Surface and Text Tokens

| Current token/value | Location | Current use | Decision | Proposed semantic token | Reason | Accessibility implication |
|---|---|---|---|---|---|---|
| `--lc-bg: #f4f6f8` | `globals.css:9` | Page canvas | **KEEP AND RESTYLE** | `--color-canvas` | Role is correct and matches Global Shell §18 "Page Background". Reference value `#F5F7FA` is within rounding of the current value. | Canvas vs surface separation is only **1.07:1** — cards MUST NOT rely on this alone; a compliant border or elevation is required. |
| `--lc-surface: #ffffff` | `globals.css:10` | Cards | **KEEP** | `--color-surface` | Matches Global Shell §18 "Surface" exactly. | Text at 17.85:1 — ample headroom. |
| `--lc-surface-2: #f8fafc` | `globals.css:11` | Secondary surface | **KEEP AND RESTYLE** | `--color-surface-subtle` | Role valid, but **1.04:1 against canvas** makes it functionally invisible as a distinct surface. | Needs either a larger step from canvas or a border to be perceivable. |
| *(none)* | — | Elevated surface (dialogs, menus, overlays) | **REPLACE** (create new) | `--color-surface-elevated` | No elevated-surface token exists, yet mega menus, dialogs and the mobile menu all need one. | Overlay surfaces must be distinguishable from the page beneath at ≥3:1 or via a compliant border/shadow. |
| `--lc-border: #e2e8f0` | `globals.css:12` | All borders | **REPLACE** | `--color-border-subtle` **+ new** `--color-border` (≥3:1) | **1.23:1 on surface, 1.14:1 on canvas.** A single border token cannot serve both decorative grouping and meaningful boundaries. | Boundaries that convey structure (inputs, table cells, card edges carrying the only separation) MUST meet **3:1** per WCAG 1.4.11. |
| `--lc-text: #0f172a` | `globals.css:13` | Body text | **KEEP** | `--color-text` | Matches Global Shell §18 "Primary Text" `#172033` in role and near-identical in value. | 16.48–17.85:1 across all backgrounds — passes everywhere. |
| `--lc-heading: #0f172a` | `globals.css:14` | Headings | **REPLACE** | *fold into* `--color-text` **+** `--color-text-heading` only if a distinct value is chosen | **Identical value to `--lc-text`** — two token names for one role, which `CLAUDE.md` §6 discourages. | None. Consolidation only. |
| `--lc-muted: #64748b` | `globals.css:15` | Metadata, captions, ad label | **REPLACE** | `--color-text-muted` (darkened) | **Fails AA as normal text on canvas (4.39), info background (4.37) and ticker (3.91).** Global Shell §18 "Secondary Text" `#48566A` computes to **7.46:1 on surface / 6.95:1 on canvas** and passes on all five backgrounds. | Adopt a value that clears **4.5:1 on the darkest background it is used on**, not just on white. |
| *(none)* | — | Inverse text on dark fills | **REPLACE** (create new) | `--color-text-inverse` | Footer, insider band and filled buttons all hardcode `#fff` / `#e2e8f0` inline. | Must be paired with a fill that yields ≥4.5:1. |

---

## 2. Action, Navigation and State Tokens

| Current token/value | Location | Current use | Decision | Proposed semantic token | Reason | Accessibility implication |
|---|---|---|---|---|---|---|
| `--lc-accent: #b91c1c` | `globals.css:16` | **Primary CTA**, Buy Tickets, active links, prices | **REPLACE** | Split into `--color-action-primary` (Action Blue direction) **and** `--color-alert` (red) | **Direct conflict with Global Shell §18**, which assigns blue to primary actions and red to correction/error/high consequence. Using red for routine CTAs also collides with the Constitution's rule against casino-style urgency, and leaves no colour available to signal a correction. **Requires founder decision — see checklist item C-02.** | Action Blue `#1F5EFF` = **5.12:1 on surface, 4.77:1 on canvas**; white on blue = 5.12:1. Alert Red `#C73A3A` = 5.13:1. Both pass AA. Current red passes contrast (6.47:1) — the defect is **semantic**, not contrast. |
| *(none)* | — | Secondary / tertiary action | **REPLACE** (create new) | `--color-action-secondary` | Secondary buttons are currently bare `border` + inherited text. | Outlined controls need a ≥3:1 boundary. |
| `--lc-tab-active: #1e293b` | `globals.css:17` | Active tab fill | **KEEP AND RESTYLE** | `--color-nav-active` | Role valid. White on it = **14.63:1**. | Active state MUST NOT be fill-colour-only — pair with weight, `aria-current`, or an indicator bar. |
| `--lc-info-bg: #eff6ff` | `globals.css:18` | Info callout, top ad band | **KEEP AND RESTYLE** | `--color-info-surface` | Role valid, but it is doing **two unrelated jobs**: an information callout and an advertising band. Those must separate. | Muted text on it = **4.37:1, fails AA**. |
| `--lc-info-border: #bfdbfe` | `globals.css:19` | Info callout border | **REPLACE** | `--color-info-border` (≥3:1) | **1.31:1 on info surface** — the callout edge is not perceivable. | Callout boundary must reach 3:1 or the callout must carry an icon plus a text label. |
| `--lc-ticker-bg: #e5e9ef` | `globals.css:20` | Jackpot ticker band | **KEEP AND RESTYLE** | `--color-surface-band` | Generalize from one component to a reusable full-bleed band role. | Muted text on it = **3.91:1, fails AA** — the worst text pairing in the system. |
| *(none)* | — | Focus indicator | **REPLACE** (create new) | `--color-focus` | **No focus token and no focus style exist.** Global Shell §143 requires visible focus not obscured by sticky elements. | Focus ring needs ≥3:1 against **both** the component and the adjacent background, and must remain visible over the sticky ad and sticky nav. |
| *(none)* | — | Success / verified | **REPLACE** (create new) | `--color-success` | No token. Global Shell §18 proposes Success Green `#138A5B`. | `#138A5B` = **4.36:1 — large-text only**. A darkened variant is required for normal-size text and for white-on-fill. |
| *(none)* | — | Warning | **REPLACE** (create new) | `--color-warning` | No token. | Must not be the sole signal; pair with icon and text. |
| *(none)* | — | Error / correction | **REPLACE** (create new) | `--color-alert` | No token — correction notices are a Global Shell §126 requirement and have no visual language. | Alert Red `#C73A3A` = 5.13:1, passes. |
| *(none)* | — | Stale · awaiting · unavailable | **REPLACE** (create new) | `--color-state-stale`, `--color-state-awaiting`, `--color-state-unavailable` | Awaiting/closed states currently reuse the red accent inline. Three distinct data-freshness states need distinct, non-colour-dependent treatment. | Each MUST carry a text label; colour is supplementary only. |
| *(none)* | — | AI attribution | **REPLACE** (create new) | `--color-ai` | No token. Global Shell §18 proposes AI Teal `#00A7A5`. | **`#00A7A5` = 2.97:1 — FAILS AA as text and as a white-text fill.** A darkened variant is mandatory for text, labels and filled buttons. Reference value may remain for large decorative fills with dark text. |
| *(none)* | — | Jackpot emphasis | **REPLACE** (create new) | `--color-jackpot` | No token. Global Shell §18 proposes Jackpot Gold `#F4B400`. | **1.85:1 as text — MUST NEVER be text on light.** Use as a fill with dark text (`#172033` on gold = **8.81:1**, passes). |
| *(none)* | — | Community attribution | **REPLACE** (create new) | `--color-community` | No token; community content has no visual identity. | Non-colour signal required (label + author attribution). |
| *(none)* | — | Affiliate / commerce disclosure | **REPLACE** (create new) | `--color-commerce-disclosure` | No token; disclosure is currently plain muted text. | Disclosure must be legible at small size — inherits the muted-text failure above. |

---

## 3. Result-Ball Tokens

All seven ball pairs pass or nearly pass foreground/background contrast, but **luminance separation between balls is 1.09–1.30:1**, so colour cannot distinguish them.

| Current token/value | Location | Current use | Decision | Proposed semantic token | Reason | Accessibility implication |
|---|---|---|---|---|---|---|
| `--ball-default-bg: #0f172a` / `-fg: #ffffff` | `globals.css:22–23` | Standard drawn number | **KEEP** | `--ball-standard-bg` / `-fg` | **17.85:1** — strongest pair in the system. | Passes. |
| `--ball-powerball-bg: #b91c1c` / `-fg: #ffffff` | `globals.css:24–25` | Powerball special | **KEEP AND RESTYLE** | `--ball-powerball-bg` / `-fg` | 6.47:1 passes. Value duplicates `--lc-accent`, so if the accent moves to blue this must become an independent token rather than an alias. | Passes on contrast. **Requires a non-colour distinction** — see §4.7 of the specification. |
| `--ball-megaball-bg: #b45309` / `-fg: #ffffff` | `globals.css:26–27` | Mega Ball special | **KEEP AND RESTYLE** | `--ball-megaball-bg` / `-fg` | 5.02:1 passes. | **1.09:1 against Cash Ball** — the two are effectively identical in luminance. Non-colour distinction mandatory. |
| `--ball-cashball-bg: #047857` / `-fg: #ffffff` | `globals.css:28–29` | Cash Ball special | **KEEP AND RESTYLE** | `--ball-cashball-bg` / `-fg` | 5.48:1 passes. | See Mega Ball. |
| `--ball-fireball-bg: #ea580c` / `-fg: #ffffff` | `globals.css:30–31` | Fireball add-on | **REPLACE** | `--ball-fireball-bg` / `-fg` | **3.56:1 — FAILS AA for normal text.** Drawn numbers are essential content, not decoration. | Darken the fill, or switch to dark text on the orange (`#172033` on `#ea580c` ≈ 5.0:1). A number a user may act on MUST clear 4.5:1. |
| `--ball-bonus-bg: #6d28d9` / `-fg: #ffffff` | `globals.css:32–33` | Bonus ball | **KEEP AND RESTYLE** | `--ball-bonus-bg` / `-fg` | 7.10:1 passes. | **1.10:1 against Powerball.** Non-colour distinction mandatory. |
| `--card-face-bg: #ffffff` / `-fg: #0f172a` | `globals.css:34–35` | Card-game faces (5 Card Cash) | **REPLACE** | `--card-face-bg` / `-fg` / **new** `--card-face-border` (≥3:1) | Text pair is 17.85:1, but the face background is **1.00:1 against a white surface** — the card is invisible except for a border that itself fails 3:1. | The card boundary is the only thing distinguishing the element and therefore MUST meet **3:1**. |
| *(none)* | — | Multiplier badge | **REPLACE** (create new) | `--multiplier-*` | Multipliers currently render as a bare bordered pill inheriting the failing border token. | Needs a compliant boundary and a text label (e.g. "Power Play 3×"). |

---

## 4. Hardcoded Values Outside the Token System

25 raw hex values sit inline in five component files, bypassing tokens entirely.

| Current token/value | Location | Current use | Decision | Proposed semantic token | Reason | Accessibility implication |
|---|---|---|---|---|---|---|
| `#0a142f` | `SiteFooter.tsx:12,48`; `HomeTemplate.tsx:221`; `CampaignBanner.tsx:14` | Footer + insider band navy | **KEEP AND RESTYLE** | `--color-brand-navy` | Role matches Global Shell §18 "Brand Navy" (`#0B1F3A`, near-identical). Must become a token — it is currently repeated in four files. | White on it = **18.20:1**; `#9ca3af` on it = 7.17:1. Both pass. |
| `#0f1c40` | `SiteFooter.tsx:39` | Footer newsletter panel | **KEEP AND RESTYLE** | `--color-brand-navy-raised` | An elevated variant of navy; needs a name. | Verify any text placed on it. |
| `#1f2b40` | `SiteFooter.tsx:59`; `HomeTemplate.tsx:226`; `CampaignBanner.tsx:14` | Divider on navy | **KEEP AND RESTYLE** | `--color-border-on-inverse` | Border role on dark surfaces has no token. | Must reach 3:1 against navy where it conveys structure. |
| `#2a3a63` | `SiteFooter.tsx:48` | Newsletter input border | **REPLACE** | `--color-border-on-inverse` | Duplicates the role above with a different value. | Input boundaries MUST meet 3:1. |
| `#9ca3af` | `SiteFooter.tsx:12` | Footer body text | **KEEP AND RESTYLE** | `--color-text-muted-inverse` | 7.17:1 on navy — passes, but needs a token. | Passes. |
| `#111a2b` | `HomeTemplate.tsx:226` | Insider feature card | **KEEP AND RESTYLE** | `--color-surface-on-inverse` | Card-on-dark role has no token. | `#94a3b8` on it = 6.79:1, passes. |
| `#94a3b8`, `#cbd5e1`, `#e2e8f0` | `HomeTemplate.tsx:221,223,228`; `CampaignBanner.tsx:36` | Text tiers on dark | **KEEP AND RESTYLE** | `--color-text-*-inverse` scale | Three ad-hoc inverse text tiers exist with no system. | 6.79 / 12.26 / 14.76:1 — all pass. |
| `#1e3a8a` | `SiteHeader.tsx:25` | Logo mark background | **KEEP AS REFERENCE** | *(logo treatment — deferred)* | Final logo treatment is not in scope and must not be invented. | White on it = 10.36:1. |
| `#fff` | `TabNav.tsx:16`; `CampaignBanner.tsx:35,45` | Text on filled controls | **REPLACE** | `--color-text-inverse` | Inline literal for a role that must be a token. | Pair-dependent; passes in current usages. |
| `.lc-container` `max-width: 72rem` (1152 px) | `globals.css:59–63` | Content container | **REPLACE** | `--layout-content-max` | Global Shell §20 proposes **approximately 1280 px** desktop maximum. 72 rem = 1152 px is narrower than the approved direction. | Wider measure needs a reading-measure constraint for prose so line length stays legible. |
| `max-w-[70ch]` | `StatePageTemplate.tsx:99` | State content column | **KEEP AND RESTYLE** | `--layout-measure` | Correct instinct, applied on State only — Home has no measure constraint. | 70ch is at the upper edge; 65–75ch is the accepted range. |
| `pb-28` sticky clearance | `HomeTemplate.tsx:57`; `StatePageTemplate.tsx:67` | Clear the fixed sticky ad | **REPLACE** | `--layout-sticky-clearance` (derived) | A hardcoded guess duplicated in two files; must be **derived from the reserved sticky height**. | If the sticky bar exceeds the guess, content and focus are obscured — a WCAG 2.2 §2.4.11 focus-obscured risk. |
| `.lc-adslot` font-size `0.65rem` | `globals.css:96–110` | Ad label | **KEEP AND RESTYLE** | `--type-label-micro` | ~10.4 px uppercase with letter-spacing. | Muted-on-surface passes at 4.76:1, but the size is below a comfortable floor; specification sets a minimum. |
| `rounded` / `rounded-md` / `rounded-lg` / `rounded-full` | 61 usages | Radii | **KEEP AND RESTYLE** | `--radius-*` scale | Four ad-hoc radii with no system; `rounded-md` used 35×, bare `rounded` 20×. | None. |
| `shadow-sm` (1 usage) | `MobileNav.tsx` | Mobile menu shadow | **REPLACE** | `--elevation-*` scale | A single shadow in the entire codebase; no elevation system. | Overlay separation must not depend on shadow alone (forced-colors mode drops shadows). |

---

## 5. Dark-Mode Tokens

| Current token/value | Location | Current use | Decision | Proposed semantic token | Reason | Accessibility implication |
|---|---|---|---|---|---|---|
| 12 `:root[data-theme="dark"]` overrides | `globals.css:39–50` | Opt-in dark theme | **KEEP AS REFERENCE** | *(dark scale — deferred)* | The overridden text and surface values are sound: text 14.12:1, heading 15.89:1, muted 6.79:1 on dark surface — all pass. But the set is **incomplete**. | **`--lc-accent` is not overridden** → red CTA on dark surface = **2.69:1, fails**. **No ball token is overridden** → seven special-ball fills are untuned for dark. |

### Dark-mode status — explicit determination

> **DARK MODE IS DEFERRED. It is NOT approved for implementation.**

Reasoning, recorded so it is not re-litigated by inference:

1. **No approved source requests it.** The Constitution, Experience Architecture and Global Shell v1.1 §17–§21 define one visual personality and one provisional palette. Neither mentions a dark theme.
2. **Existence is not approval.** `CLAUDE.md` §2 forbids inferring approval from the presence of code. The `[data-theme="dark"]` block is provisional work from the previous iteration.
3. **It is demonstrably incomplete** — accent and all ball tokens are missing, and the one accent that is inherited fails AA.
4. **No toggle exists**, so no user can reach it today.
5. `prefers-color-scheme` auto-switching is explicitly disabled in the file's own comment; that decision is retained.

**Recorded consequence:** the specification defines **light mode as the only implementation target**. Every semantic token records a *dark-mode treatment intent* so a future approved dark theme is cheap to add, but no dark values are proposed for approval now. Founder checklist item **L-02** carries this decision.

---

## 6. Decision Counts

| Decision | Count | Examples |
|---|---|---|
| **KEEP** | 3 | `--lc-surface`, `--lc-text`, `--ball-default-*` |
| **KEEP AND RESTYLE** | 18 | canvas, surface-2, tab-active, info surface, ticker band, four ball pairs, navy family, inverse text tiers, radii, measure, ad label |
| **REPLACE** | 24 | `--lc-accent` (role split), `--lc-muted`, `--lc-border`, `--lc-heading` (consolidate), `--lc-info-border`, fireball, card-face, container width, sticky clearance, elevation — **plus 13 create-new** (focus, success, warning, alert, AI, jackpot, community, commerce disclosure, three data-state tokens, elevated surface, secondary action, inverse text, multiplier) |
| **KEEP AS REFERENCE** | 2 | dark-mode override set, logo mark colour |
| **Total classified** | **47** | 26 existing tokens + 12 hardcoded value groups + 9 layout/shape values |

Of 24 REPLACE decisions, **11 apply to existing values** and **13 create tokens for roles that have no token at all** — the dominant gap is missing semantic roles, not wrong values.

---

## 7. Consistency Validation

| Check | Result |
|---|---|
| Every proposed token has exactly one semantic role | ✅ `--lc-heading` consolidation removes the one duplicate-role case |
| No two token names describe the same role unnecessarily | ✅ `--lc-text`/`--lc-heading` merged; `#1f2b40`/`#2a3a63` merged into one inverse-border role |
| Every text/background pair has a stated contrast requirement | ✅ all pairs computed and recorded |
| Existing tokens unmodified | ✅ `globals.css` not touched — `git diff` clean |
| Dark mode not silently approved | ✅ explicitly DEFERRED with five recorded reasons |
| No colour-only state remains unflagged | ✅ balls, active nav, info callout, data states all carry a non-colour requirement |
| No GAM mapping or slot value changed | ✅ this document reads `ad-slot-definitions.json` only |
| No existing code described as approved design | ✅ every row is KEEP-with-reason or REPLACE-with-evidence |
