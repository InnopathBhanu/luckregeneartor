# Home Preview Track — Authorization Decision

**Document type:** Approved decision record
**Decision ID:** PREVIEW-DEC-001
**Recorded by:** Task LRG-DEC-006
**Decision date:** July 25, 2026
**Status:** **AUTHORIZED — founder decision (Authority Tier 1)**
**Companions:** `design-system-founder-decisions.md` (DS-DEC-001), `implementation-sequence.md`, `frontend-architecture-decision.md`, `reuse-register.md`

---

## 1. Governing Statement

> **The preview is authorized to accelerate founder visual feedback. It does not bypass the approved architecture, ad inventory, route, SEO, accessibility or production-readiness gates.**

Every constraint in root `CLAUDE.md` continues to apply in full. This authorization adds a feedback loop; it removes no gate.

---

## 2. Why the Preview Path Is Authorized

The design-system specification (Task LRG-DS-005) is necessarily abstract: token roles, contrast thresholds, type scales, spacing steps and component contracts. Several of the founder decisions it triggered — the blue/red role split (DS-02, DS-03), border-first cards (DS-07), the 992 px threshold (DS-20), no-fill presentation (DS-24), sticky-versus-bottom-navigation priority (DS-28), and the seven attribution treatments (DS-29) — are difficult to evaluate as prose and tables. They are best judged as rendered pixels at real viewport widths on a real device.

Global Shell v1.1 §0.1 already requires **desktop and mobile high-fidelity review and founder approval per page family** before implementation is considered complete. A browser-rendered Home preview is the most direct way to reach that judgement early, on the one page family whose blueprint is already final-approved and whose ad inventory is already fully enumerated.

Running this as a **separately labelled track** rather than as a change to the production sequence keeps the dependency order intact while shortening the feedback cycle.

---

## 3. Visual Preview versus Production-Ready Home

| Dimension | Visual preview (this track) | Production-ready Home (Phases 6–8) |
|---|---|---|
| **Purpose** | Elicit founder visual feedback on approved design decisions | Ship a public page |
| **Section order** | Approved Home blueprint order | Same — no divergence permitted |
| **Shell behaviour** | Global Shell v1.1 behaviour | Same |
| **Data** | Sample fixtures only | API-backed, provenance-declared, freshness-managed |
| **Ads** | Labelled, reserved, **inactive** placeholders | Live GAM after ad-operations sign-off |
| **Partner scripts** | **All disabled** | Enabled behind a consent gate |
| **Routes** | Existing `/` only | Full route registry |
| **Canonical / sitemap / robots** | **Unchanged — not implemented** | Implemented after the migration decision |
| **Affiliate destinations** | Unchanged; no destination resolved | First-party resolver after the route decision |
| **Signed-in state** | Anonymous only | Anonymous **and** signed-in per blueprint |
| **Accessibility** | Validated at the eight approved widths | Same, plus full pre-merge checklist |
| **Tests** | Not required by this track | Required |
| **Approval meaning** | Visual feedback only | Production approval |
| **Reversibility** | Must be fully reversible | Normal release process |

**The preview is not production approval.** Founder sign-off on the preview means "this visual direction is right", not "this page may go live".

---

## 4. Allowed Scope

1. **Use the existing `01-new-ui`.** No parallel application, no `-v2` directory, no monorepo or workspace restructuring, no move or rename — per `frontend-architecture-decision.md` (FE-ARCH-001).
2. **Use the approved Home Page blueprint (BP-02, v1.1) for section order.** The approved anonymous sequence has 30 entries — 23 content sections plus 7 ad anchors (`AD-H00`…`AD-H06`).
3. **Use Global Shell v1.1 for shell behaviour** — header and navigation model, mobile navigation model, Search-and-Ask architecture, anonymous shell behaviour, contextual AI-entry patterns, trust and correction language, section taxonomy and IDs, accessibility and responsive rules.
4. **Apply the approved design decisions** DS-01 … DS-29, including blue primary actions, red reserved for correction/error, corrected contrast, border-first cards, system sans stack, 16 px mobile body floor, tabular numerals, non-colour special-ball distinctions, focus-visible, reduced motion, and the seven attribution treatments.
5. **Use the single named 992 px threshold** (DS-20) for ad-tier visibility, contextual-rail appearance and the one-column/two-column transition.
6. **Reuse existing components where `reuse-register.md` allows** — specifically the KEEP and KEEP AND RESTYLE classifications: `DynamicResultCard`, `BallGroup`, `MultiplierBadge`, `AdSlot`, `AdSlotView`, `JsonLd`, `cleanCopy`, `PartnerScripts` (inert), the generic module components, and the data-provider seam.
7. **Use sample fixtures only**, read through the existing data-provider seam.
8. **Render labelled, reserved, inactive ad placeholders** for every slot the Home blueprint anchors, preserving position and order.
9. **Show a clearly labelled inactive sticky-ad reservation** (DS-27) that does not assert final production creative height.
10. **Validate at 320, 375, 390, 768, 992, 1024, 1280 and 1440 px** (DS-19), keyboard-only, with reduced motion, and **with all ad slots unfilled**.

---

## 5. Forbidden Scope

1. **No production route change.** No new public route, no renamed slug, no redirect. The preview uses the existing `/`.
2. **No canonical, sitemap or robots change.** The canonical host and trailing-slash decision remains open; `sitemap.ts` and `robots.ts` are not created by this track.
3. **No affiliate destination change.** No raw affiliate URL in DOM, metadata, schema, fixtures or logs. The `/play/{game}` versus `/buynow/{code}` question stays open and must not be settled by preview convenience.
4. **No GAM change.** No slot count, slot ID, GAM unit path, size mapping, placement or ordering is added, removed, merged, renamed, reduced or reordered. All 47 recorded definitions stand (DS-21).
5. **No partner script activation.** No GAM/GPT, AdSense, GA4/GTM, iZooto or push script loads (DS-22, DS-25). No `googletag` call. No consent layer exists yet, which is itself a precondition.
6. **No live or real ad delivery**, and no analytics collection.
7. **No API or database work.** `02-new-api` stays untouched.
8. **No dependency installation, framework upgrade, or lockfile change.**
9. **No Member/Insider implementation** — no routes, paid tiers, quotas, exports, ticket records, public badges, Insider ad treatment or promotional pauses. The 11 open Part 22 founder decisions remain open.
10. **No signed-in state implementation** beyond what the anonymous shell requires. The signed-in Home sequence (`H-01S`…`H-08S`) is out of scope for the preview.
11. **No dark mode** (DS-30), **no brand font** (DS-31), **no icon library** (DS-32), **no logo redesign** (DS-33).
12. **No synthetic content presented as real lottery fact.** Fixture provenance must remain visible and the preview must not be reachable as a public production surface.
13. **No modification of existing `03-docs` decision records, `04-sample-data`, `05-design-inputs`, the legacy project, `.gitignore`, `.github`, `.claude/settings.local.json` or root `CLAUDE.md`.**
14. **No page-family section reordering.** Order comes from BP-02; deviation requires a founder decision, not an implementation judgement.

---

## 6. Acceptance Boundary

The preview is accepted as **complete for its purpose** when all of the following hold:

| # | Condition |
|---|---|
| 1 | Home renders in a browser at all eight approved validation widths with no horizontal page scroll |
| 2 | Section order matches the approved BP-02 anonymous sequence, including all 7 ad anchors in position |
| 3 | Shell behaviour follows Global Shell v1.1 for the anonymous state |
| 4 | Blue primary actions and red-reserved-for-correction are visibly applied (DS-02, DS-03) |
| 5 | All ten recorded contrast failures are corrected (DS-04), verifiable by measurement |
| 6 | Special balls show colour **plus** label **plus** border/shape **plus** accessible name (DS-11, DS-14) |
| 7 | `:focus-visible` is present on every interactive element and is never obscured by sticky layers (DS-15) |
| 8 | Reduced motion is honoured (DS-16) |
| 9 | No control is presented as a usable disabled action (DS-17) |
| 10 | Every ad anchor renders a labelled, reserved, inactive placeholder — and the page is also validated with all slots unfilled (DS-23, DS-24) |
| 11 | Sticky reservation, bottom navigation and task actions follow the priority hierarchy without overlap at 320/375/390 px (DS-28) |
| 12 | The seven attribution treatments are visibly distinct without relying on colour (DS-29) |
| 13 | No partner script fires; no network request to any ad, analytics or push endpoint |
| 14 | Desktop **and** mobile review completed with the founder |

**Explicitly outside the acceptance boundary:** production readiness, SEO completeness, canonical emission, sitemap/robots, signed-in state, live ads, tests, and final high-fidelity approval (DS-37).

---

## 7. Rollback Expectation

1. **Task-scoped and isolated.** All changes confined to `01-new-ui`, in files the preview task explicitly names.
2. **Single revertible commit** (or a small contiguous set), separate from any documentation commit, so `git revert` restores the prior state cleanly.
3. **Diffable against the pre-blueprint baseline** `191013b` and against the immediately preceding commit.
4. **No irreversible side effects** — no dependency change, no lockfile change, no fixture rewrite that discards provenance, no deletion of existing components. Superseded components are left in place (ARCHIVE, never delete) per `CLAUDE.md` §19.
5. **No production configuration touched**, so nothing to roll back outside the repository.
6. **Rollback must not require a data migration or ad-operations action.**

---

## 8. Standing Boundaries Restated

Recorded here because each is a common failure mode for a "just a preview" task:

- **No live advertising or partner scripts.** Inert by default; no flag set; no consent layer.
- **No route, canonical, sitemap, robots or affiliate change.** These carry SEO and revenue risk and have their own gates.
- **Sample data only.** Fixtures via the data-provider seam; no API call, no database, no live feed.
- **Existing `01-new-ui`.** No parallel application.
- **Approved Home section order.** BP-02 governs.
- **Global Shell v1.1 behaviour.** §0.2's binding reuse outcomes apply.
- **Desktop and mobile review required.** Global Shell §0.1; a desktop-only review does not satisfy the gate.
- **Ad inventory preserved.** All 47 definitions; the 13 unmapped slots are resolved with ad operations, never dropped.
- **Accessibility not deferred.** WCAG 2.2 AA applies to the preview, not only to production.

---

## 9. Track Sequence

Recorded in full in `implementation-sequence.md` as a separately labelled track that **does not replace or reorder the production sequence**.

| Step | Name | Code changes |
|---|---|---|
| **P1** | Founder design decision lock | No — completed by this task |
| **P2** | Shared Shell and Home Preview Specification | No |
| **P3** | Browser-rendered Home preview | **Yes** — `01-new-ui`, task-scoped |
| **P4** | Founder visual review (desktop **and** mobile) | No |
| **P5** | Feed approved adjustments back into the production sequence | No |

**P3 must not begin until P2 is reviewed by the founder.**

---

## 10. Relationship to the Production Sequence

The preview track runs **alongside** Phases 3–8, not instead of them.

- **P2 informs Phase 4** (shared shell specification) and **Phase 6** (Home exact specification), and may be merged into them at P5 if the founder approves.
- **P3 is a preview implementation.** It does **not** satisfy Phase 5 (shell implementation) or Phase 8 (Home implementation), both of which retain their own review gates, tests, SEO requirements and ad-operations sign-off.
- **P5 is the only path** by which preview learnings enter the production sequence. Nothing from P3 is promoted to production by default.
- Production dependencies that remain open — sticky-ad creative height, live GAM behaviour, ad-operations confirmation of the 992 px threshold and of no-fill behaviour, page-specific ad volume, final high-fidelity approval, canonical and route migration, `/play/{game}` versus `/buynow/{code}`, and the 11 Member/Insider decisions — are **unaffected by this authorization** and continue to block their respective production phases.
