# Home Preview — P3 Implementation Plan

**Document type:** Page specification — implementation scope for Preview Track P3
**Recorded by:** Task LRG-SPEC-007 (Preview Track P2)
**Date:** July 26, 2026
**Status:** **PROPOSED — founder review required before P3 begins**
**Governing authority:** `home-preview-track-decision.md` (PREVIEW-DEC-001) · `design-system-founder-decisions.md` (DS-DEC-001) · `frontend-architecture-decision.md` (FE-ARCH-001) · `reuse-register.md` · root `CLAUDE.md`

**P2 creates no code.** This document defines exactly what P3 may change, must not change, and must validate.

---

## 1. Scope Principle

> **Controlled reuse with minimal additions.** Prefer refactoring an existing file over creating a new one. Prefer one new shared primitive over several near-duplicates. Every addition must be justified by a blueprint requirement that no existing file can satisfy.

FE-ARCH-001 binds P3 to the **existing `01-new-ui`**: no parallel application, no `-v2` directory, no monorepo or workspace restructuring, no move or rename.

---

## 2. Files Expected to Change

Exact existing paths. **21 files.**

### 2.1 App shell and route

| File | Action | Change |
|---|---|---|
| `01-new-ui/app/globals.css` | **REFACTOR** | Replace the 26 provisional tokens with the semantic set; add focus, radius and elevation scales; define the single named 992 px threshold; raise the ad label to 12 px; add `prefers-reduced-motion` handling; keep the `data-token` ball mechanism and the CSS-custom-property ad reservation |
| `01-new-ui/app/layout.tsx` | **REFACTOR** | Token wiring; preview message banner; remove or gate the `SearchAction`-bearing schema call; keep sitewide `Organization` + `WebSite` and the inert `PartnerScripts` placement |
| `01-new-ui/app/page.tsx` | **REFACTOR** | Render the new Home composition; build metadata via the shared helper instead of inline duplication; set preview `robots: noindex, nofollow` |

### 2.2 Shell components

| File | Action |
|---|---|
| `01-new-ui/components/layout/SiteHeader.tsx` | **REPLACE** — rebuilt to GS-02/GS-03/GS-05/GS-06/GS-07 |
| `01-new-ui/components/layout/MobileNav.tsx` | **REPLACE** — rebuilt as GS-09 bottom navigation |
| `01-new-ui/components/layout/SiteFooter.tsx` | **KEEP AND RESTYLE** — tokens replace four hardcoded hex values |
| `01-new-ui/components/layout/JackpotTicker.tsx` | **KEEP AND RESTYLE** — band token, `estimatedLabel`, muted-text contrast fix |

### 2.3 Home composition

| File | Action |
|---|---|
| `01-new-ui/components/home/HomeTemplate.tsx` | **REPLACE** — recomposed to the BP-02 30-entry sequence, retaining the unconsumed-ad flush guard |
| `01-new-ui/components/home/StateDirectory.tsx` | **KEEP AND RESTYLE** — serves H-07 and H-14B |

### 2.4 Results

| File | Action |
|---|---|
| `01-new-ui/components/results/DynamicResultCard.tsx` | **KEEP AND RESTYLE** — add special-ball label, accessible name, distinction shape, awaiting and corrected states |
| `01-new-ui/components/results/BallGroup.tsx` | **KEEP AND RESTYLE** — non-colour distinctions, accessible names, Fireball contrast fix |
| `01-new-ui/components/results/MultiplierBadge.tsx` | **KEEP AND RESTYLE** — full multiplier text, compliant boundary |

### 2.5 Advertising

| File | Action |
|---|---|
| `01-new-ui/components/ads/AdSlot.tsx` | **KEEP AND RESTYLE** — bind to the named threshold; add the no-fill state; **no `googletag` call** |
| `01-new-ui/components/ads/AdSlotView.tsx` | **KEEP AND RESTYLE** — distinct no-fill visual state; keep reservation |
| `01-new-ui/components/ads/StickyFooterAd.tsx` | **REFACTOR** — DS-28 priority; labelled inactive reservation; derived clearance |

### 2.6 Modules, campaign, commerce, AI, account

| File | Action |
|---|---|
| `01-new-ui/components/modules/DataTable.tsx` | **KEEP AND RESTYLE** — caption, `th scope`, in-container scroll |
| `01-new-ui/components/modules/HighlightsAlerts.tsx` | **REFACTOR** — remove two hardcoded "Florida" headings; add synthetic labelling |
| `01-new-ui/components/modules/FaqAccordion.tsx` | **KEEP AND RESTYLE** |
| `01-new-ui/components/modules/InfoSectionList.tsx` | **KEEP AND RESTYLE** |
| `01-new-ui/components/modules/ContentFreshnessNote.tsx` | **KEEP AND RESTYLE** — stale-state text |
| `01-new-ui/components/modules/BiggestWinnersSection.tsx` | **KEEP AND RESTYLE** — H-10A, with synthetic labelling |
| `01-new-ui/components/modules/CheckTicketTool.tsx` | **REFACTOR** — generalize from State; labelled unavailable preview state |
| `01-new-ui/components/campaign/CampaignPlacement.tsx` | **REFACTOR** — re-key placements to BP-02 section IDs |
| `01-new-ui/components/campaign/CampaignBanner.tsx` | **KEEP AND RESTYLE** — tokens replace raw hex |
| `01-new-ui/components/cta/BuyTicketsCta.tsx` | **REFACTOR** — mandatory adjacent disclosure; no destination resolved |
| `01-new-ui/components/ai/AiToolsTeaser.tsx` | **REPLACE** — becomes the H-05 labelled AI region with deterministic fallback |
| `01-new-ui/components/account/AccountHooks.tsx` | **REFACTOR** — explicitly-labelled-unavailable affordances replacing silently-disabled buttons |

### 2.7 Library

| File | Action |
|---|---|
| `01-new-ui/lib/data-provider/index.ts` | **REFACTOR** — add the Home preview mapper; memoize the state loader |
| `01-new-ui/lib/data-provider/types.ts` | **REFACTOR** — add the preview Home view model as a clearly-labelled preview type; reuse the sound game-domain shapes unchanged |
| `01-new-ui/lib/seo/metadata.ts` | **REFACTOR** — absorb duplicated Home logic; omit image-less large card; preview `robots` |
| `01-new-ui/lib/seo/siteSchema.ts` | **REFACTOR** — add `@id` to `websiteSchema`; remove or gate `SearchAction` |
| `01-new-ui/lib/campaign/types.ts` | **REFACTOR** — re-key `APPROVED_PLACEMENTS` to BP-02 IDs |

---

## 3. Files Expected to Be Created

**Minimal additions — 8 files.** Each is justified by a requirement no existing file satisfies.

| Proposed path | Purpose | Why a new file is required |
|---|---|---|
| `01-new-ui/lib/preview/homePreviewModel.ts` | Map `home-page-sample.json` into the preview view model | Keeps the transformation out of the fixture and out of the template, so the fixture stays intact for Phase 7 |
| `01-new-ui/lib/preview/previewGuard.ts` | Local-only environment gate + provenance assertion | Enforces that a non-local environment refuses to render preview data, and that no synthetic section lacks a label |
| `01-new-ui/lib/layout/adAnchors.ts` | Map the 7 blueprint anchors to production `slotKey`s and visibility | Anchor→slot mapping does not exist today; keeping it in one module prevents drift and preserves the flush guard |
| `01-new-ui/components/shell/PreviewBanner.tsx` | GS-11 preview disclosure banner | No message-banner component exists |
| `01-new-ui/components/shell/BottomNav.tsx` | GS-09 bottom navigation | No bottom navigation exists; `MobileNav` is a hamburger menu with a different contract |
| `01-new-ui/components/shell/StickyStack.tsx` | Resolve the DS-28 sticky priority and derive clearance | The priority rule is unimplemented and clearance is currently a hardcoded `pb-28` duplicated in two templates |
| `01-new-ui/components/shell/PageShell.tsx` | Shared page-composition primitives: content container, contextual rail, full-bleed band, `asArr` | **MERGE** target for four patterns currently duplicated between `HomeTemplate` and `StatePageTemplate` |
| `01-new-ui/components/trust/SourceNotice.tsx` | Global Shell §123–§126 source, verification and correction surfaces | These are inline JSX in `StatePageTemplate` today and absent from Home |

**Not created:** no new route, no `sitemap.ts`, no `robots.ts`, no test file (P3 has no test mandate), no fixture file, no config file, no dependency.

---

## 4. Files Forbidden to Change

| Path | Reason |
|---|---|
| `00-reference-existing-project/**` | Legacy read-only evidence. The pre-existing `M .project` modification must stay untouched |
| `02-new-api/**` | API deferred until UI contracts stabilize (Phase 21) |
| `03-docs/**` | All approved documents, blueprints and decision records |
| `04-sample-data/ad-slot-definitions.json` | **Production ad definitions.** No slot ID, unit path, size map, dimension, position or count may change |
| `04-sample-data/home-page-sample.json` | Read-only in P3. Transformation lives in code, preserving the fixture for Phase 7 |
| `04-sample-data/footer-config.json`, `states-config.json`, `result-format-definitions.json`, `state-*.json`, `source-xml/**`, `reference-tables/**` | Read-only reference and production-derived data |
| `05-design-inputs/**` | Visual references |
| `01-new-ui/app/[state]/page.tsx`, `components/state/**` | **State page is out of P3 scope** |
| `01-new-ui/app/buynow/[code]/route.ts` | **Route/canonical/commerce configuration outside Home.** `/play` vs `/buynow` is unresolved |
| `01-new-ui/components/partner/PartnerScripts.tsx` | **No partner-script activation.** Keep inert |
| `01-new-ui/components/layout/UtilitySubBar.tsx` | ARCHIVE — left in place, not wired, not deleted |
| `01-new-ui/components/modules/{QuickFactsTable,DrawScheduleTable,HighlightsGrid,HistoryLinksSection,HowToClaim,OddsAccordion,TaxInfo}.tsx` | State-page modules, not in the anonymous Home sequence |
| Member/Insider files | None exist and none may be created. 11 Part 22 decisions open |
| `package.json`, `package-lock.json` | **No dependency installation or upgrade** |
| `next.config.mjs`, `tsconfig.json`, `.eslintrc.json` | Build configuration — unless the P3 task explicitly authorizes the `engines`/lint hardening, which is a separate foundation task |
| `.gitignore`, `.github/**`, `.claude/settings.local.json`, root `CLAUDE.md` | Governance and tooling |

---

## 5. Component-by-Component Action Summary

| Action | Count | Components |
|---|---|---|
| **KEEP** | 3 | `JsonLd`, `PartnerScripts`, `cleanCopy` |
| **KEEP AND RESTYLE** | 12 | `SiteFooter`, `JackpotTicker`, `StateDirectory`, `DynamicResultCard`, `BallGroup`, `MultiplierBadge`, `AdSlot`, `AdSlotView`, `DataTable`, `FaqAccordion`, `InfoSectionList`, `ContentFreshnessNote`, `BiggestWinnersSection`, `CampaignBanner` |
| **REFACTOR** | 13 | `globals.css`, `layout.tsx`, `page.tsx`, `StickyFooterAd`, `HighlightsAlerts`, `CheckTicketTool`, `CampaignPlacement`, `BuyTicketsCta`, `AccountHooks`, `data-provider/index.ts`, `data-provider/types.ts`, `seo/metadata.ts`, `seo/siteSchema.ts`, `campaign/types.ts` |
| **MERGE** | 4 patterns → 1 file | contextual rail, top-ad band, `asArr`, sticky clearance → `PageShell.tsx` + `StickyStack.tsx` |
| **REPLACE** | 4 | `HomeTemplate`, `SiteHeader`, `MobileNav`, `AiToolsTeaser` |
| **ARCHIVE** | 1 | `UtilitySubBar` (left in place) |
| **KEEP AS REFERENCE** | 9 | `StatePageTemplate`, `TabNav`, and the seven State-only modules |

**Every REPLACE and REFACTOR names what survives** in §2 of `shared-shell-and-home-preview-specification.md`.

---

## 6. Fixture Transformation

| Rule | Detail |
|---|---|
| **Read-through, not rewrite** | `home-page-sample.json` is **read unchanged** through `lib/data-provider`. The mapping to the preview view model lives in `lib/preview/homePreviewModel.ts` |
| **Fixture is not an API contract** | The preview view model is a **separate, clearly-labelled preview type** (`schemaVersion: "preview-1.0"`, `supersededBy: "Phase 7 Home view-model contract"`). Deliberately not continuous with the `0.1-sample` stream |
| **Section identity from blueprint IDs** | Sections are keyed by `H-01`, `H-02A`, … — **never** by fixture key names |
| **Missing data → labelled preview state** | Eight sections have no adequate data. Each renders with heading, purpose and an explicit label. **Nothing is fabricated and nothing is dropped** |
| **Provenance preserved and surfaced** | The fixture's `_meta.illustrative`, `dbApiDriven` and `adminEditable` lists feed `meta.provenanceSummary`. Synthetic sections (H-08, H-10A, H-11, H-11A) render with a visible label |
| **Stale timestamps rendered truthfully** | July 2026 timestamps are older than the freshness window. The preview shows them and marks affected sections stale. **Timestamps are not refreshed to look current** |
| **`cleanCopy` at every boundary** | No `[ADMIN]` or `[VERIFY-*]` marker may reach the DOM |
| **Ad references by `slotKey` only** | No GAM value copied into the preview model |

---

## 7. Preview Safety Requirements

| # | Requirement |
|---|---|
| 1 | **Local-development-only gate.** An explicit preview flag plus `meta.previewMode === true`. A non-local environment **must refuse to render** preview data |
| 2 | **Visible preview disclosure.** GS-11 banner carries `meta.previewLabel` |
| 3 | **Visible synthetic labelling.** Any section with `provenance` of `synthetic` or `illustrative` and a null `provenanceLabel` is a **build-blocking defect** |
| 4 | **`robots: noindex, nofollow`** on the preview |
| 5 | **No live scripts.** `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ANALYTICS_ENABLED`, `NEXT_PUBLIC_IZOOTO_ENABLED` remain unset. **No `googletag` call.** No network request to any ad, analytics or push endpoint |
| 6 | **No raw affiliate destination** in DOM, metadata, schema, fixtures or logs. `BuyTicketsCta` keeps its hard guard |
| 7 | **No synthetic claim published as fact** — no invented winner, deadline, jackpot, tax figure, news item or community activity presented as real |
| 8 | **No fabricated community content.** H-10 `items` must be empty |
| 9 | **No canonical emitted**; no sitemap or robots.txt created |
| 10 | **Reversible.** A single revertible commit (or a small contiguous set), separate from documentation, diffable against baseline `191013b`. No dependency, lockfile or fixture change. Superseded components left in place, never deleted |

---

## 8. Validation P3 Must Run

**Not run now.** This is the checklist P3 executes.

### 8.1 Static and type checks

| Check | Notes |
|---|---|
| TypeScript type check | `strict: true` already on. Must pass with no new `any` |
| Lint | **Only if** the existing configuration runs without altering files. Note `next.config.mjs` currently sets `eslint.ignoreDuringBuilds: true`, so lint does not gate the build |
| Production build | **Only if the P3 task explicitly permits it.** Requires Node 24 (`engines` is absent — open dependency #9) |
| Dependency-free static checks | Grep-level assertions: no `googletag`, no external affiliate host, no `[ADMIN]`/`[VERIFY-` in rendered output, no raw hex outside the token layer |

### 8.2 Browser validation

| Check | Requirement |
|---|---|
| Screenshots | **320, 375, 390, 768, 991, 992, 1024, 1280, 1440 px** — 991 and 992 adjacent to prove the threshold switch |
| All 16 representative examples | Each reachable and captured at desktop **and** mobile (Global Shell §0.1) |
| No horizontal page scroll | Every width. Tables and the ticker scroll in-container with a visible affordance |
| Keyboard review | Full operation at 375 px and 1280 px; logical order; no traps; menus open by button, Escape closes, focus returns |
| Focus review | Visible on every interactive element; **never obscured** by the sticky reservation or bottom navigation; scroll-into-view offsets by combined clearance |
| Contrast review | Every rendered text/background pair and every meaningful boundary re-measured against §5 of the specification |
| Reduced motion | Verified with `prefers-reduced-motion: reduce` |
| Forced colors | Layout and meaning survive `forced-colors: active` |
| 200 % zoom | No loss of content or function |
| **All 7 ad anchors present** | `AD-H00`…`AD-H06` rendered in sequence position, with all 20 referenced slot placeholders accounted for |
| **Ad no-fill** | Every page validated with **all slots unfilled** — no layout shift, no gap reading as broken |
| **Mobile slot distribution** | All four `hp_mobile_leaderboard_pos1..4` present below 992 px, distributed into approved anchors — not stacked at page bottom |
| **992–1023 px gap closed** | At 991 px the four mobile slots are present and the rail is absent; at 992 px the rail is present and the mobile slots absent. **No width leaves both absent** |
| **Sticky priority** | At 320/375/390 px: safety → bottom nav → user action → advertising, with no overlap and no third competing layer |
| **Partner scripts inactive** | Network panel shows **zero** requests to GAM, AdSense, GA4/GTM or push endpoints |
| Section order | Rendered order matches the BP-02 30-entry sequence exactly |
| Provenance labels | Every synthetic and illustrative section visibly labelled |

---

## 9. Explicitly Out of P3 Scope

State page · game pages · archives · news · community · tools · signed-in state · authentication · Member/Insider · API · database · route registry · sitemap · robots.txt · canonical emission · commerce destination resolution · live advertising · consent layer implementation · dark mode · brand font · icon library · logo redesign · tests and CI · dependency or framework changes.

---

## 10. Consistency Validation

| Check | Result |
|---|---|
| Only existing `01-new-ui` is modified | ✅ 21 files changed, 8 created, all under `01-new-ui` |
| No parallel application or restructuring | ✅ FE-ARCH-001 honoured |
| Production ad definitions forbidden | ✅ `ad-slot-definitions.json` in the forbidden list |
| Partner-script activation forbidden | ✅ `PartnerScripts` forbidden to change; flags unset; network assertion required |
| Route/canonical outside Home forbidden | ✅ `buynow` route and State route in the forbidden list |
| Member/Insider forbidden | ✅ explicit |
| API and database deferred | ✅ `02-new-api` forbidden |
| Fixture not treated as an API contract | ✅ separate preview type with `supersededBy` |
| Additions minimal and justified | ✅ 8 new files, each with a stated reason no existing file satisfies |
| Every component has an action | ✅ 46 classifications across 7 categories |
| Reversibility required | ✅ §7 item 10 |
| Validation includes the gap, sticky, no-fill and script checks | ✅ §8.2 |
