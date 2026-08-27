# Shared Shell and Home Preview Specification

**Document type:** Page specification — consolidated implementation specification
**Recorded by:** Task LRG-SPEC-007 (Preview Track P2)
**Date:** July 26, 2026
**Status:** **PROPOSED — founder review required before Preview Track P3**
**Governing authority:** Frozen Product Constitution v2.1 · Experience Architecture v1.1 · **Global Shell v1.1** · **Home Page Blueprint BP-02 v1.1** · `design-system-founder-decisions.md` (DS-DEC-001) · `home-preview-track-decision.md` (PREVIEW-DEC-001) · root `CLAUDE.md`
**Companions:** `home-preview-section-manifest.md`, `home-preview-view-model.md`, `home-preview-responsive-contract.md`, `home-preview-implementation-plan.md`, `home-preview-founder-review.md`

---

## 0. Preview Boundary

> **This specification authorizes only an isolated browser-rendered preview in the existing `01-new-ui`. It does not authorize production deployment, live advertising, route migration, canonical migration, affiliate activation, authentication, Member/Insider functionality, API work or database work.**

The preview exists to accelerate founder visual feedback. It bypasses no gate.

**All partner scripts remain inactive** — no GAM/GPT, AdSense, GA4/GTM or push script is loaded, and no `googletag` call is made. **No GAM configuration is read-modified:** no slot ID, unit path, size map, dimension, position or count changes. **No canonical is emitted** and no route is added or renamed. **Critical content is server-rendered.** The preview is `noindex, nofollow` and is **not production-ready**.

---

## 1. Path Reconciliation

Four paths named in the task brief do not exist. Recorded so P3 targets the real files:

| Named in brief | Actual | Note |
|---|---|---|
| `01-new-ui/components/templates/HomeTemplate.tsx` | **`01-new-ui/components/home/HomeTemplate.tsx`** | Directory is `home/`, not `templates/` |
| `01-new-ui/components/campaigns/**` | **`01-new-ui/components/campaign/**`** | Singular |
| `01-new-ui/data/**` | **does not exist** | Fixtures live in `04-sample-data/`, read via `lib/data-provider` |
| `01-new-ui/types/**` | **does not exist** | Types live in `lib/data-provider/types.ts`, `lib/campaign/types.ts` |
| Tailwind config file | **does not exist** | Tailwind v4 is CSS-first; tokens live in `app/globals.css` |

---

## 2. Existing Implementation Inventory

Verified file by file against the repository. Starting point is `reuse-register.md`; every row below was re-checked for the specific files P3 needs.

| File | Role | Decision | What changes / what survives |
|---|---|---|---|
| `app/layout.tsx` | Root layout, sitewide JSON-LD, `PartnerScripts`, header/footer | **REFACTOR** | **Changes:** wire the design-system token layer; remove the `SearchAction`-bearing `websiteSchema` call or gate it (BP-02 §69 does not require it and no `/search` exists); add the preview message banner. **Survives:** server-first structure, sitewide `Organization` + `WebSite`, inert `PartnerScripts` placement, light-theme default |
| `app/page.tsx` | Home route | **REFACTOR** | **Changes:** render the new Home composition; build metadata via the shared helper instead of inline duplication; set preview `robots`. **Survives:** the route file itself, server-component pattern, `cleanCopy` on all metadata |
| `app/globals.css` | Tokens, container, ball styles, ad placeholder | **REFACTOR** | **Changes:** replace the 26 provisional tokens with the semantic set in §5; add focus, elevation and radius scales; move the ad/layout threshold to one named 992 px value; raise the ad label to 12 px; add reduced-motion handling. **Survives:** the `@import "tailwindcss"` CSS-first approach, `data-token` ball-attribute mechanism, min-height ad reservation via a CSS custom property, light-theme-default decision |
| `components/home/HomeTemplate.tsx` | 18-section Home composition | **REPLACE** | **Changes:** recomposed to the BP-02 30-entry anonymous sequence. **Survives:** the unconsumed-ad flush guard (line 298) — carried forward verbatim in intent; the refusal to render a simulated chart without real series data; the existing section inventory used as a coverage checklist so nothing currently rendered is lost by omission. **Why:** BP-02 defines 33 section IDs including signed-in variants; this template has no user-state model and its order predates the blueprint |
| `components/layout/SiteHeader.tsx` | Desktop header | **REPLACE** | **Changes:** rebuilt to Global Shell GS-02/GS-03/GS-05/GS-06/GS-07. **Survives:** as *requirements* only — state navigation, game navigation, high-value internal links. **Why:** Global Shell §0.2 binds the header and navigation model; four current nav links point at 404 routes |
| `components/layout/MobileNav.tsx` | Hamburger menu | **REPLACE** | **Changes:** rebuilt as GS-09 bottom navigation with text labels, `aria-expanded`/`aria-controls`, Escape-to-close, focus return, safe-area insets, sticky priority 2. **Survives:** the requirement that lottery navigation stays reachable on mobile. **Why:** no bottom navigation exists and the sticky-conflict rule is unimplemented |
| `components/layout/SiteFooter.tsx` | Footer from config | **KEEP AND RESTYLE** | Restyle to tokens; replace four hardcoded hex values; mark link targets that do not exist yet. **Survives:** the config-driven rendering and the real production links |
| `components/layout/JackpotTicker.tsx` | Jackpot band | **KEEP AND RESTYLE** | Restyle; map to the approved shell band; add `estimatedLabel`; fix the 3.91:1 muted-text failure on the band; make the scroll container keyboard-reachable |
| `components/layout/UtilitySubBar.tsx` | Quick-action sub-bar | **ARCHIVE** | Not wired up. Orphaned today; hardcodes `/buynow/play-usa-powerball`, which touches the unresolved commerce route. Global Shell §154 reserves utility-strip enablement. Left in place, not deleted |
| `components/results/DynamicResultCard.tsx` | Format-driven result card | **KEEP AND RESTYLE** | Restyle; add `specialBallLabel`, `accessibleName`, `distinctionShape`, `multiplierText`, awaiting and corrected states. **Survives:** the entire format-driven architecture — variable ball counts, named specials, add-ons, multipliers, secondary draws, card games, status rules |
| `components/results/BallGroup.tsx` | Ball group renderer | **KEEP AND RESTYLE** | Restyle tokens; add the mandatory non-colour distinction and accessible names; fix the Fireball contrast failure. **Survives:** count derived from `values.length`, colour from `colorToken`, server-rendered crawlable text, game-defined ordering |
| `components/results/MultiplierBadge.tsx` | Multiplier pill | **KEEP AND RESTYLE** | Restyle; render full text ("Power Play 3×") never a bare number; compliant boundary |
| `components/ads/AdSlot.tsx` | Server slot resolver + reservation math | **KEEP AND RESTYLE** | Bind to the single named 992 px threshold; add the no-fill state; **do not** add any `googletag` call in the preview. **Survives:** dual-tier reservation from each slot's own size mapping, documented fallbacks, the future-GAM hook point |
| `components/ads/AdSlotView.tsx` | Client reservation + lazy-ready | **KEEP AND RESTYLE** | Add a distinct no-fill visual state; keep space reservation. **Survives:** the CLS-safe reservation mechanism, IntersectionObserver readiness, and the fact that **no ad script is called** |
| `components/ads/StickyFooterAd.tsx` | Sticky closable footer ad | **REFACTOR** | **Changes:** implement the DS-28 sticky priority; render a **labelled inactive reservation** (DS-27) asserting no final height; derive clearance from reserved height instead of `pb-28`. **Survives:** the zero-height close button, and the documented production 1-hour cookie behaviour recorded for later. **Why:** the priority rule is unimplemented and the production height is unresolved |
| `components/modules/FaqAccordion.tsx` | Visible FAQ | **KEEP AND RESTYLE** | Restyle; verify keyboard and screen-reader behaviour. **Survives:** FAQ schema correctly gated on visibility |
| `components/modules/QuickFactsTable.tsx` | Label/value facts | **KEEP AS REFERENCE** | **Not used by the anonymous Home sequence.** Retained for State work |
| `components/modules/DrawScheduleTable.tsx` | Draw schedule | **KEEP AS REFERENCE** | Not in the anonymous Home sequence; H-06B uses the upcoming-draws shape |
| `components/modules/DataTable.tsx` | Generic table | **KEEP AND RESTYLE** | Restyle; add `<caption>`, `<th scope>`, in-container scroll with visible affordance. Used by H-02B and H-06A |
| `components/modules/HighlightsAlerts.tsx` | Wins / unclaimed / growth | **REFACTOR** | **Changes:** remove two hardcoded "Florida" fallback headings; add visible synthetic-provenance labelling. **Survives:** the section's data shape |
| `components/modules/InfoSectionList.tsx` | Generic sections list | **KEEP AND RESTYLE** | Restyle. Used by H-09 systems |
| `components/modules/BiggestWinnersSection.tsx` | Winner stories | **KEEP AND RESTYLE** | Restyle; add synthetic labelling. Candidate for H-10A |
| `components/modules/CheckTicketTool.tsx` | Number-check entry | **REFACTOR** | **Changes:** generalize from State to a shared module; render as a labelled unavailable preview state. **Survives:** the input/output separation that keeps ads out of the flow |
| `components/modules/ContentFreshnessNote.tsx` | Freshness note | **KEEP AND RESTYLE** | Restyle; used for stale-state text |
| `components/modules/HighlightsGrid.tsx`, `HistoryLinksSection.tsx`, `HowToClaim.tsx`, `OddsAccordion.tsx`, `TaxInfo.tsx` | State-page modules | **KEEP AS REFERENCE** | **Not in the anonymous Home sequence.** Untouched by P3 |
| `components/campaign/CampaignPlacement.tsx` | Placement resolver | **REFACTOR** | **Changes:** re-key `APPROVED_PLACEMENTS` to BP-02 section IDs. **Survives:** the allowlist mechanism, at-most-one rendering, render-nothing-when-empty |
| `components/campaign/CampaignBanner.tsx` | Promo banner | **KEEP AND RESTYLE** | Restyle with tokens (replaces raw hex); keep the internal-URL-only guard and the no-targeting-in-DOM property |
| `components/cta/BuyTicketsCta.tsx` | Commerce CTA | **REFACTOR** | **Changes:** add the mandatory adjacent disclosure; render as a preview state with **no destination resolved**. **Survives:** the hard guard rejecting non-approved hrefs, and `rel="nofollow sponsored"`. **Why:** disclosure is mandatory and the route is unresolved |
| `components/ai/AiToolsTeaser.tsx` | AI stub | **REPLACE** | **Changes:** rebuilt as the H-05 labelled AI region with a deterministic fallback. **Survives:** the careful non-predictive copy discipline — a Constitution §13 requirement. **Why:** Global Shell §10.5 states a single page-level AI module does not satisfy AI compliance |
| `components/account/AccountHooks.tsx` | Login/register/favourite stubs | **REFACTOR** | **Changes:** replace three silently-disabled buttons with explicitly-labelled-unavailable affordances (DS-17); state what would be preserved. **Survives:** the recorded intent that entry points stay visible. **No auth, no Member/Insider capability** |
| `components/home/StateDirectory.tsx` | Filterable directory | **KEEP AND RESTYLE** | Restyle; serves H-07 and H-14B |
| `components/seo/JsonLd.tsx` | JSON-LD renderer | **KEEP** | No change |
| `components/partner/PartnerScripts.tsx` | Env-gated tags | **KEEP** | No change. **Remains inert — no flag set** |
| `components/state/StatePageTemplate.tsx`, `TabNav.tsx` | State page | **KEEP AS REFERENCE** | Out of P3 scope entirely |
| `lib/seo/metadata.ts` | Metadata builder | **REFACTOR** | **Changes:** absorb the duplicated inline Home logic; omit `og:image`/`summary_large_image` rather than declaring an image-less large card; set preview `robots`. **Survives:** `cleanCopy` at every boundary and the deliberate canonical deferral |
| `lib/seo/siteSchema.ts` | Schema generators | **REFACTOR** | **Changes:** add `@id` to `websiteSchema` so `WebPage.isPartOf` resolves; **remove or gate `SearchAction`**. **Survives:** real `Organization` values and the five real social profiles |
| `lib/text/cleanCopy.ts` | Marker stripper | **KEEP** | No change |
| `lib/data-provider/index.ts` | Data seam | **REFACTOR** | **Changes:** add a Home preview mapper; memoize the state loader for consistency. **Survives:** the seam itself — the single module that knows data comes from files. **Not** used as a route source in P3 (Home is a static route) |
| `lib/data-provider/types.ts` | View-model types | **REFACTOR** | **Changes:** add the preview Home view model as a **separate, clearly-labelled preview type**. **Survives:** the sound game-domain shapes — `ResultCard`, `BallGroupDrawn`, `MultiplierDrawn`, `AddOnDrawn`, `ResultFormatDefinition`, `AdSlotDefinition`, `AdSizeMapping`, `FooterConfig` — reused unchanged. **Why:** the existing 36-key state union encodes superseded requirements and must not become the Home contract |
| `lib/campaign/types.ts`, `select.ts` | Campaign framework | **REFACTOR** | Re-key placements to BP-02 IDs; keep allowlist, priority and backend-deferred geo |
| `04-sample-data/home-page-sample.json` | Home fixture | **KEEP** (read-only in P3) | **Not rewritten.** The preview maps it in code, leaving the fixture intact for Phase 7 |
| `04-sample-data/ad-slot-definitions.json` | GAM inventory | **KEEP** | **Read-only. No value changed** |
| `04-sample-data/footer-config.json` | Production footer | **KEEP** | Read-only |

---

## 3. Shell Specification (Anonymous)

Mapped to Global Shell v1.1 component IDs. §0.2 binds page families to reuse this model rather than re-inventing it.

| Component | ID | Specification |
|---|---|---|
| **Utility status strip** | GS-01 | **Not enabled** in the preview — Global Shell §154 reserves utility-strip enablement |
| **Main header** | GS-02 | Sticky. Surface or brand-navy band with a compliant bottom boundary and `--elevation-1` when stuck. Contains brand mark, primary nav, search, AI entry, account affordances. Landmark `banner`; skip-to-content is first in the tab order |
| **Logo treatment boundary** | — | **The existing brand mark is used as-is. No logo redesign** (DS-33). Global Shell §18 notes palette values may later adjust to fit the logo, so brand-colour lock follows logo selection |
| **Primary navigation** | GS-03 | Inline at ≥992 px; inside the mobile menu below. Mega menus open **by button** with `aria-expanded`/`aria-controls`; Escape closes; focus returns to the trigger; **no hover-only content**. Items whose route does not exist render as explicitly **labelled unavailable** — **no route is created to satisfy navigation.** Navigation wording (`Community`/`Forums`, `My LotteryCorner`/`Insider`, long/short AI labels) is a **proposal pending §3.2 label testing**, not a final decision |
| **Context bar / breadcrumb** | GS-04 | **Not rendered on Home.** BP-02 §69: `BreadcrumbList` is generally unnecessary on root Home |
| **Global search** | GS-05 | Visible at all widths (icon-expand below 992 px). Real form control with a persistent visible label. **Labelled preview-unavailable.** **No `SearchAction` schema** |
| **Global AI trigger** | GS-06 | Contextual entry labelled "Ask LotteryCorner AI" (compact "Ask AI"). **Not a generic floating chat bubble.** Labelled preview-unavailable |
| **Account / My LotteryCorner** | GS-07 | Anonymous only. Sign-in and register affordances state **exactly what would be preserved**. Explicitly labelled unavailable — **not silently disabled** (DS-17). **No auth, no Member/Insider capability** |
| **Notification indicator** | GS-08 | Not rendered — requires an account |
| **Mobile bottom navigation** | GS-09 | Below 992 px. **Text labels required.** Safe-area insets. Bypassable by assistive technology. **Sticky priority 2** — outranks advertising |
| **Footer** | GS-10 | From `footer-config.json` — real production links. Trust, policy, support, responsible play, 18+ notice, independence disclaimer. Link targets that do not yet exist are marked, never removed |
| **Global message banner** | GS-11 | Carries the page-level **preview disclosure** |
| **Consent and preference layer** | GS-12 | **Required but not implemented.** Recorded as a precondition for any partner script. **No script activated** |
| **Ad rail / ad anchors** | GS-13 | Rail at ≥992 px only; anchors per the manifest. Rail reserved for **production ad slots and known widgets only** — no AI teaser or promo may occupy ad inventory |
| **Affiliate action bar** | GS-14 | **Suppressed in the preview** to avoid a third competing sticky layer (BP-02 §65) |
| **Responsible play access** | GS-15 | Always reachable, including on mobile |
| **State context** | §6.5 | Precedence: page/jurisdiction → explicit session selection → signed-in preference → granted device location → manual entry. **Coarse IP may only suggest a state for confirmation and MUST NEVER determine legal purchase eligibility, claim rules, tax guidance or provider availability.** When uncertain, **ask the user** |
| **Jackpot ticker** | shell band | Full-bleed band; tabular numerals; **"estimated jackpot"** wording; exact dates where "tonight" would be ambiguous; scrolls in-container with a visible affordance |
| **Sticky hierarchy** | §6.4 | safety → bottom navigation → user action → advertising. Three layers must never compete |

---

## 4. Home Preview Specification

**Exact section sequence:** transcribed in `home-preview-section-manifest.md` — 30 entries, 23 content sections + 7 ad anchors, verbatim from BP-02 §12. **Not restated here to avoid divergence between two documents.**

| Aspect | Specification |
|---|---|
| **Primary task** | Route the visitor to their job before anything else (H-01). Visual weight follows task priority, never commercial priority |
| **Result hierarchy** | H-02A featured national games and H-03 latest results carry the **strongest** visual weight after the H-01 entry. Both are tier-0 protected — no ad inside |
| **Exploration hierarchy** | Discovery (H-07, H-08, H-09, H-09A, H-09B) sits **below** current utility. Community, winners, news and blog (H-10 … H-11A) sit below that. Return and directory (H-14 … H-14B) sit lowest before trust |
| **Protected task zones** | H-01, H-02A, H-03, H-04, H-05, H-06A, H-07, H-09 output, H-10A claim content, H-12 eligibility, H-15 responsible play. Enumerated in the manifest §5 |
| **Ad anchors** | 7 anchors mapping 20 production slots. Anchors are positions; slots are inventory. All referenced slots retained; the four mobile slots **redistributed into approved anchors, not reduced**; `hp_video` recorded as unmapped, not dropped; the unconsumed-slot flush guard retained |
| **Conditional sections** | **None.** BP-02 §12 marks no anonymous Home content section conditional, so no section is omitted. Eight render as labelled preview states |
| **Correction behaviour** | A correction notice states **what changed, when, and the impact**, adjacent to the affected value, **static and persistent** — never a transient flash. The preview includes one representative correction to exercise the state |
| **Stale behaviour** | The fixture's July 2026 timestamps are older than the freshness window. The preview **renders them truthfully** and marks affected sections stale with a visible last-updated timestamp and an explicit note. Timestamps are not silently refreshed |
| **AI entry placement** | H-05 sits **after** current utility (H-03, H-04), per BP-02 §11. A compact AI action may appear inside H-01 on small screens. Every AI region is explicitly labelled. **Deterministic fallback only** — no generated content, no prediction language. Global Shell §10.5: a single AI module does not satisfy AI compliance, so each section declares its intelligence layer |
| **Mobile prioritization** | Manifest priorities 1–5. Priority 1 (H-01, H-02A, H-03) must be reachable in the first viewport at 320 px. **No revenue-critical or task-critical element is hidden on mobile** |

---

## 5. Exact Preview Design Values

Semantic roles from DS-01. Values proposed per DS-04, with **every ratio computed**. Threshold: **4.5:1** normal text, **3:1** large text and meaningful non-text boundaries.

### 5.1 Surfaces and text

| Token | Value | Role | Contrast (computed) |
|---|---|---|---|
| `--color-canvas` | `#F5F7FA` | Page canvas | hosts `--color-text` at **15.16:1**, `--color-text-muted` at **6.95:1** |
| `--color-surface` | `#FFFFFF` | Cards, panels | hosts `--color-text` at **16.27:1**, `--color-text-muted` at **7.46:1** |
| `--color-surface-subtle` | `#EAEFF5` | Table stripes, nested rows | 1.08:1 vs canvas. **Decorative grouping only** — cannot and need not reach 3:1; where it must read as a distinct region, pair with `--color-border` |
| `--color-surface-band` | `#E9EDF2` | Jackpot ticker, full-bleed bands | `--color-text-muted` on it = **6.35:1 PASS** — fixes the old 3.91:1 failure |
| `--color-surface-elevated` | `#FFFFFF` + `--color-border` + `--elevation-2` | Dialogs, menus, popovers | Boundary carries separation, so it survives forced-colors |
| `--color-brand-navy` | `#0B1F3A` | Header authority band, footer | `--color-text-inverse` on it = **16.52:1** |
| `--color-text` | `#172033` | Body and headings | **16.27** surface / **15.16** canvas |
| `--color-text-muted` | `#48566A` | Metadata, captions, ad label, disclosure | **7.46** surface / **6.95** canvas / **6.86** info surface / **6.35** band — **passes on every permitted background**, fixing the three old failures |
| `--color-text-inverse` | `#FFFFFF` | Text on dark fills | pair-verified below |
| `--color-border` | `#7F8794` | **Meaningful boundaries** — inputs, table cells, card edges, control outlines | **3.62** surface / **3.38** canvas — **PASSES 3:1**, fixing the old 1.23:1 failure |
| `--color-border-subtle` | `#E2E8F0` | Decorative dividers only, where a compliant boundary already exists | No requirement |

### 5.2 Action, focus and navigation

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--color-action-primary` | `#1F5EFF` | **Primary actions, navigation emphasis, links** (DS-02) | **5.12** surface / **4.77** canvas as text; `--color-text-inverse` on fill = **5.12** — all PASS |
| `--color-action-secondary` | outlined: `--color-text` label + `--color-border` | Secondary actions | label 16.27; boundary 3.62 |
| `--color-focus` | `#0B1F3A` with a `--color-surface` offset ring | Focus indicator (DS-15) | **16.52** vs surface, **15.39** vs canvas, **3.23** vs the blue action fill. **The 2 px white offset ring guarantees ≥3:1 on any background**, including the navy header where navy-on-navy would otherwise be 1.0 |
| `--color-nav-active` | `#1E293B` | Active navigation fill | inverse text = **14.63**. Paired with weight change and `aria-current` — **never fill alone** |

### 5.3 Feedback and data states

Every token below is **supplementary to a mandatory text label**.

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--color-info-surface` | `#EFF6FF` | Informational callout | text **14.95**, muted **6.86** |
| `--color-info-border` | `#5B8CC9` | Callout boundary | **3.20** on info surface — **PASSES**, fixing the old 1.31:1 failure |
| `--color-success` | `#0F7350` | Verified, saved | **5.85** surface / **5.45** canvas; white on fill **5.85** — fixes Global Shell's 4.36:1 reference |
| `--color-warning` | `#8A5A00` | Caution | **5.93** / **5.52** |
| `--color-alert` | `#C73A3A` | **Corrections, errors, critical alerts, destructive actions** (DS-03) | **5.13** / **4.78**; white on fill **5.13** |
| `--color-corrected` | `#C73A3A` | Correction marker | shares `--color-alert`; always with "Corrected" + what/when/impact |
| `--color-state-awaiting` | `#8A5A00` | Draw held, result pending | **5.93** / **5.52**; always with "Awaiting result" + exact next-draw date |
| `--color-state-stale` | `#48566A` | Beyond freshness window | **7.46** / **6.95**; always with the last-updated timestamp |
| `--color-state-unavailable` | `#48566A` | Unavailable | **7.46** / **6.95**; always with reason text |

### 5.4 Attribution and commerce

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--color-ai` | `#00706E` | AI-assisted content | **5.93** / **5.52**; white on fill **5.93** — fixes Global Shell's AI Teal at 2.97:1. Always with an explicit AI label |
| `--color-community` | `#6B3FA0` | Human community content | **7.38** / **6.88**. Always with author attribution |
| `--color-editorial` | `#48566A` | LotteryCorner editorial | **7.46** / **6.95**. Always with a byline or "LotteryCorner Research" |
| `--color-jackpot` | `#F4B400` | Jackpot emphasis | **FILL ONLY.** `--color-text` on gold = **8.81 PASS**. As text on light = 1.85 → **PROHIBITED** |
| `--color-commerce-disclosure` | `#48566A` | Affiliate disclosure | **7.46** / **6.95**, at ≥13 px |
| `--color-ad-placeholder` | `#F1F3F6` | Ad container surface | Deliberately **distinct from `--color-info-surface`**, which currently doubles as the ad band. Label `--color-text-muted` = **4.9:1** on it |

### 5.5 Result balls

All fills carry `--color-text-inverse` (white) unless noted. **Every special ball additionally requires a visible label, a border/shape distinction and an accessible name** (DS-11, DS-14) — because ball-to-ball luminance separation is only **1.00–1.13:1**, colour is measurably incapable of distinguishing them.

| Token | Value | Ratio (white on fill) | Old value | Non-colour signal |
|---|---|---|---|---|
| `--ball-standard-bg` | `#172033` | **16.27** | unchanged in role | group label where a group exists |
| `--ball-powerball-bg` | `#B3241C` | **6.59** | was `#b91c1c` (6.47) | "Powerball" label + ring |
| `--ball-megaball-bg` | `#9A4A07` | **6.26** | was `#b45309` (5.02) | "Mega Ball" label + ring |
| `--ball-cashball-bg` | `#046A4E` | **6.61** | was `#047857` (5.48) | "Cash Ball" label + ring |
| `--ball-fireball-bg` | `#B34605` | **5.53** | was `#ea580c` — **3.56 FAILED** | "Fireball" label + ring; renders as an add-on, subordinate to main numbers |
| `--ball-bonus-bg` | `#5B21B6` | **8.98** | was `#6d28d9` (7.10) | "Bonus" label + ring |
| `--card-face-bg` / `-fg` / `-border` | `#FFFFFF` / `#172033` / `#7F8794` | text 16.27; **boundary 3.62** | boundary was 1.00 — **FAILED** | rank and suit as **text**; rounded rectangle, not a circle |
| `--multiplier-*` | `--color-text` on `--color-surface` + `--color-border` | 16.27 / boundary 3.62 | — | **full text** — "Power Play 3×", never a bare number |

**Token-family separation.** `--ball-powerball-bg` is red-hued but is **NOT** an alias of `--color-alert`. DS-03 reserves the *alert role*; it does not forbid red in a game's brand identity. Because every special ball also carries a mandatory label and shape, a Powerball cannot be misread as a correction. **The two families MUST NOT be aliased.**

### 5.6 All ten DS-04 failures — corrected

| # | Old failure | Old | New | Now |
|---|---|---|---|---|
| 1 | muted on band | 3.91 | `#48566A` on `#E9EDF2` | **6.35 PASS** |
| 2 | muted on canvas | 4.39 | `#48566A` on `#F5F7FA` | **6.95 PASS** |
| 3 | muted on info surface | 4.37 | `#48566A` on `#EFF6FF` | **6.86 PASS** |
| 4 | Fireball ball | 3.56 | white on `#B34605` | **5.53 PASS** |
| 5 | border on surface | 1.23 | `#7F8794` on `#FFFFFF` | **3.62 PASS** |
| 6 | info border | 1.31 | `#5B8CC9` on `#EFF6FF` | **3.20 PASS** |
| 7 | card-face boundary | 1.00 | `#7F8794` on `#FFFFFF` | **3.62 PASS** |
| 8 | surface-vs-canvas separation | 1.07 | border-first cards | **boundary carries it at 3.62** |
| 9 | AI Teal as text/fill | 2.97 | `#00706E` | **5.93 PASS** |
| 10 | Success Green as text | 4.36 | `#0F7350` | **5.85 PASS** |
| — | Jackpot Gold as text | 1.85 | fill-only, dark text on it | **8.81 PASS** |
| — | dark-mode accent | 2.69 | **n/a — dark mode DEFERRED (DS-30)** | not implemented |

**Dark mode is NOT approved and NOT implemented.** Light mode is the sole preview target.

### 5.7 Typography, spacing, shape

| Concern | Value |
|---|---|
| Font family | **System sans stack** (DS-08). No brand or licensed font (DS-31) |
| Body | **16 px minimum on mobile** (DS-09), 1.6 line height, 400 weight, 65–75ch measure |
| H1 | 24–28 → 32–36 px, 1.2, 700 |
| H2 / H3 / H4 | 20–22→24–28 / 18→20 / 16→18 px |
| Result number | 16–20 → 18–22 px, 700, **tabular numerals** |
| Micro label (ad, disclosure chips) | **12 px floor** — raises the current ~10.4 px ad label |
| Disclosure | **13 px minimum** — legible, not fine print |
| Tabular numerals | **Mandatory** for numbers, jackpots, dates, times, countdowns, odds, prize tiers, numeric columns (DS-10) |
| Spacing base | 4 px; scale 4/8/12/16/20/24/32/40/48/64 |
| Card padding | 16 px mobile → 20 px desktop; **max one nesting level** |
| Radii | 4 / 8 / 12 / full. Ad containers use 8 px and must not resemble content cards |
| Elevation | 4 levels, **separation only, always paired with a border** (survives forced-colors) |
| Cards | **Border-first** (DS-07) |
| Sticky clearance | **Derived** = reserved sticky height + bottom-nav height + 8 px |

### 5.8 Four previously-open checklist items — recommendations only

**Proposed, not approved. Included in `home-preview-founder-review.md` for decision. P3 may use these values unless the founder adjusts them before P3.**

| Item | Recommendation | Rationale |
|---|---|---|
| **B-02** Content maximum width | **1280 px** | Global Shell §20 states "approximately 1280 px". Replaces the current 1152 px container and gives the 300 px rail plus a comfortable main column |
| **B-03** Density | **Compact** for H-01/H-02A/H-03/H-06A; **standard** elsewhere; **max one card-nesting level on mobile** | Global Shell §21: core result sections compact, AI/insight identified but not dominant. Final mobile density remains reserved by §154 |
| **T-04** Weight policy | **400 / 600 / 700 / 800 only — no thin weights** | Global Shell §19 explicitly says avoid thin weights; matches the audited usage (semibold 50×, bold 38×, extrabold 4×) |
| **S-05** Target sizing | **44 × 44 CSS px where practical; never below WCAG 2.5.8 (24 × 24) without sufficient spacing or an equivalent control** | Global Shell §143 recommends 44 × 44; the WCAG floor is already binding via DS-18 |

---

## 6. Representative Visual Examples P3 Must Implement

Sixteen examples. Each must be reachable in the rendered preview and reviewable at both desktop and mobile — Global Shell §0.1 requires **both**.

| # | Example | Content | Hierarchy | Semantic tokens | Accessibility | Mobile behaviour | Prohibited |
|---|---|---|---|---|---|---|---|
| 1 | **Anonymous desktop shell** | Header with brand, primary nav, search, AI entry, account affordances; jackpot ticker; contextual rail visible | Highest authority above content | `--color-brand-navy` or `--color-surface`, `--color-border`, `--elevation-1`, `--color-action-primary` | Landmark `banner`; skip link first; menus by button with `aria-expanded`; focus visible | n/a (≥992 px) | Hover-only menus; icon-only controls without names |
| 2 | **Anonymous mobile shell** | Compact top app bar; bottom navigation with text labels; safe-area respected | Bottom nav is priority 2 | `--color-surface`, `--color-border`, `--color-nav-active` | Text labels; bypassable by AT; `aria-current`; Escape closes menu | 320/375/390 px | Icon-only tabs; nav under an ad; excessive viewport consumption |
| 3 | **Home hero / primary result area** | H-01 task entry, then H-02A featured games in the first viewport | **Strongest** on the page; precedes the first normal ad | `--color-text`, `--color-action-primary`, `--color-jackpot` as **fill** with dark text | One `h1`; heading order intact | Priority 1 — reachable at 320 px | Ad before task orientation; gold as text |
| 4 | **Standard result card** | Game name, exact draw date, standard ball row, next draw | Highest within its section | `--color-surface`, `--color-border` 3.62, `--ball-standard-bg` 16.27, tabular numerals | Draw date and game announced **before** values; numbers are real text | 1-up | Ad inside the card; image-rendered numbers; re-sorted order |
| 5 | **Special-ball result card** | Powerball main balls + Powerball special + "Power Play 3×" | Special ball visually distinct **and labelled** | `--ball-powerball-bg` 6.59 + ring + label | Accessible name "Powerball 12"; multiplier reads "Power Play 3 times" | Ball row wraps cleanly | **Colour as the only distinction**; bare multiplier number |
| 6 | **Awaiting-result card** | "Awaiting result" + exact next-draw date; ball row height reserved | Same slot as a settled card | `--color-state-awaiting` 5.93 + mandatory text | Status announced as text | No layout shift when the result lands | Empty circles with no explanation; colour-only status |
| 7 | **Corrected-result card + correction notice** | "Corrected" + what changed + when + impact, adjacent to the value | **Elevated above** ordinary content | `--color-alert`/`--color-corrected` 5.13, compliant boundary | Announced with the value; static and persistent | Full width; never collapsed by default | Silent correction; transient flash; ad adjacent inside the zone |
| 8 | **Labelled AI entry** | H-05 region labelled "LotteryCorner AI" with a deterministic summary and citations | After current utility, not before | `--color-ai` `#00706E` 5.93, bounded region | Explicit AI label; "answer complete" status; stop control; keyboard-reachable sources | Compact "Ask AI" label | Sci-fi/gradient chrome; prediction claims; human-seeming AI; ad inside |
| 9 | **Official-source block** | "Source checked · Result verified · Last updated <exact date>" | Compact, persistent, low chrome | `--color-text-muted` 7.46, `--color-border-subtle` | Timestamp as real text | Stacks | Claiming official affiliation; "official" as ordinary voice; hiding provenance |
| 10 | **Affiliate CTA with disclosure** | H-12 CTA plus adjacent disclosure and state-eligibility text | Prominent **after** value | `--color-action-primary` 5.12, `--color-commerce-disclosure` 7.46 at ≥13 px | Disclosure adjacent and clear; `rel="nofollow sponsored"` | Full-width CTA | Raw affiliate URL; urgency/loss framing; affiliate shown as official lottery; ad inside eligibility |
| 11 | **Filled ad placeholder** | Reserved geometry + "Advertisement" label + a clearly marked non-advertising block | **Lowest**; always after value | `--color-ad-placeholder` `#F1F3F6`, label `--color-text-muted` at 12 px | `role="complementary"` with a name; outside the content reading flow | Reserved from the mobile tier | Reusing `--color-info-surface`; resembling a result or jackpot card; real or simulated advertising |
| 12 | **No-fill ad placeholder** | **Outer geometry retained, inner creative area collapsed, label suppressed** (DS-24) | Invisible but space-preserving | neutral | Not announced when empty | Zero layout shift | Visible empty box; collapsing the outer geometry; any layout shift |
| 13 | **Inactive sticky-ad reservation** | Labelled inactive reservation asserting **no** final creative height (DS-27) | Priority 4 — below safety, nav, user action | `--color-surface`, top `--color-border`, `--elevation-1`, safe-area inset | Close control ≥44 px named "Close advertisement", adding **no height**; never obscures numbers, inputs or focus | Sits **above** bottom nav with safe spacing, or suppressed | Asserting production height; overlaying nav; animated height; hardcoded clearance |
| 14 | **Mobile bottom nav with sticky priority resolved** | Bottom nav + sticky reservation coexisting correctly at 375 px | safety → nav → action → ads | `--color-surface`, `--color-border`, `--color-nav-active` | Focus visible and **not obscured**; nav bypassable | **The critical 375 px test** | Three competing sticky layers; overlap; simultaneous sticky ad and purchase bar |
| 15 | **Desktop contextual rail** | Rail at ≥992 px carrying `AD-H01R` and `AD-H05R` reservations | Subordinate to main content | `--color-ad-placeholder`, compliant boundary | Rail is `complementary` with a name | Hidden below 992 px — **its slots' inventory is served by the mobile slots instead, so nothing is lost** | Rail inside game facts; AI teaser or promo occupying ad inventory |
| 16 | **Footer and trust links** | Real production footer links, source policy, accuracy policy, responsible play, 18+, independence disclaimer | Lowest, but fully reachable | `--color-brand-navy` + `--color-text-inverse` 16.52, `--color-border-on-inverse` | Real headings and links; keyboard reachable | Stacks; trust reachable on mobile | Ad inside responsible-play guidance; removing links whose targets are unbuilt |

---

## 7. SEO Preview Boundary

| Rule | Specification |
|---|---|
| **Server-rendered critical content** | Result values, jackpots, dates, headings and the state directory render in the **initial server HTML**. Numbers are text, never image-only |
| **Unique title / H1 / description** | Exactly one `h1`; unique title and description; heading order intact with no skipped levels |
| **Canonical** | **No `<link rel="canonical">` is emitted.** The host and trailing-slash migration policy is unresolved and **is not changed by this preview** |
| **`SearchAction`** | **Not added.** BP-02 §69 explicitly does not require it, and no working `/search` route exists. The existing dangling `SearchAction` should be removed or gated |
| **Schema** | `WebPage` + `WebSite` + `Organization` (sitewide). `ItemList` **only** for visibly meaningful ordered collections. **No `BreadcrumbList`** on root Home. **No `NewsArticle`** on Home — article markup belongs on article pages. `@id` added to `websiteSchema` so `WebPage.isPartOf` resolves. Schema reflects **visible content only** |
| **Open Graph / Twitter** | `og:image` and `summary_large_image` **omitted** unless a real image exists — an image-less large-image card is malformed |
| **`robots`** | Preview is **`noindex, nofollow`.** It is not a production surface |
| **Sitemap / robots.txt** | **Not created by this preview.** They remain Phase-level work gated on the canonical decision |
| **Freshness** | Visible last-updated timestamp; stale sections explicitly marked. Timestamps are rendered truthfully, not refreshed to look current |
| **Status** | **Preview metadata is not final production approval.** Every SEO obligation is re-verified at Phase 8 against the full pre-merge checklist |

---

## 8. Consistency Validation

| Check | Result |
|---|---|
| Home section order matches BP-02 §12 | ✅ transcribed in the manifest; not restated here, so the two cannot diverge |
| All 7 ad anchors present | ✅ `AD-H00`…`AD-H06`, mapping 20 production slots |
| Anonymous scope only | ✅ no `H-*S` section; shell is anonymous-only |
| No required section silently omitted | ✅ 0 omissions; 8 labelled preview states |
| Every section has a data source or labelled strategy | ✅ manifest column |
| Global Shell v1.1 governs the shell | ✅ all 15 GS components addressed |
| Reuse classified file by file | ✅ 40 files in §2, every REPLACE/REFACTOR naming what survives and why |
| No route or canonical conflict resolved | ✅ canonical not emitted; `/play` vs `/buynow` recorded unresolved |
| No live partner script activated | ✅ `PartnerScripts` KEEP and inert; consent layer recorded as an unmet precondition |
| No GAM configuration changed | ✅ `slotKey` references only |
| 992 px closes the inventory gap | ✅ demonstrated in the responsive contract §1.1 |
| All proposed pairs pass their threshold | ✅ §5.6 — all ten DS-04 failures corrected, each with a computed ratio |
| No state or special ball relies only on colour | ✅ §5.5 and §6; ball separation of 1.00–1.13:1 makes labels mandatory |
| Dark mode not approved | ✅ DEFERRED per DS-30; light-only |
| No Member/Insider capability | ✅ H-13 is value explanation only; GS-07 anonymous-only |
| API and database deferred | ✅ neither appears in scope |
| Preview is not production-ready | ✅ §0 boundary and §7 status |
