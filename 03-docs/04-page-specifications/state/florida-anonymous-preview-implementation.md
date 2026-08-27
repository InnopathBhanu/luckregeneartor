# Florida Anonymous State Preview — Implementation Record

**Document type:** Implementation record — State page family (PF-02 / BP-03)
**Produced by:** Task **LRG-STATE-021**
**Date:** July 28, 2026
**Status:** **GUARDED PREVIEW IMPLEMENTED — awaiting founder desktop/mobile review (DS-37 / `OPEN-ST-06`).**
**Baseline:** `49d44f1` · **Scope:** `FD-S-36` — guarded anonymous Florida preview only.

**Not production.** The preview is inert by default, `noindex` when enabled, connects no GAM, no partner
script, no AI service and no commerce, and carries unavailable states throughout. It must not be served
publicly in this form.

---

## 1. How to run it

```bash
cd 01-new-ui

# Guard OFF (default) — every state, including /fl, renders the existing implementation.
npm run dev

# Guard ON — /fl renders the PF-02 preview; every other state stays on the existing implementation.
LC_STATE_PREVIEW=true npm run dev

# Production-geometry ad reservations instead of compact review heights.
LC_STATE_PREVIEW=true LC_STATE_PREVIEW_AD_MODE=production npm run dev

# Simulate one of the five Adaptive Priority overrides.
LC_STATE_PREVIEW=true LC_STATE_PREVIEW_OVERRIDE=correction npm run dev
#   accepted: possibleWin | correction | liveDraw | safety | sourceOutage

npm test            # 67 focused tests
npm run lint        # clean
npx tsc --noEmit    # clean
```

**Node 24 is required** (`~/.nvm/versions/node/v24.18.0`) — Tailwind v4's `@tailwindcss/oxide` needs
Node ≥ 18, and the test runner uses Node's native TypeScript stripping.

---

## 2. Preview guard

| Property | Value |
|---|---|
| Flag | **`LC_STATE_PREVIEW`** — server-only, **no `NEXT_PUBLIC_` prefix** |
| Default | **inert.** Only the literal string `"true"` enables it |
| Jurisdiction gate | `previewEnabled` in the explicit registry — **data, not a hardcoded `=== "fl"`** |
| Decision point | **one**, at the route boundary: `resolveStatePreview(stateCode)` |
| Guard-off behaviour | `StatePageTemplate`, byte-for-byte unchanged |
| Indexability when on | forced `robots: { index: false, follow: false }` |

The task offered `NEXT_PUBLIC_LC_STATE_PREVIEW` **or** the repository's established equivalent. The
established pattern is `LC_HOME_PREVIEW` — deliberately not `NEXT_PUBLIC_`, so the value is never inlined
into the client bundle and cannot be flipped from a browser. A guard a visitor can enable is not a guard,
so the State flag follows the same posture. **One flag only**; no overlapping switch was added.

No `/fl-new` route was created. `generateStaticParams`, canonical handling and redirects are untouched
(`FD-S-32`).

---

## 3. Synthetic publication gate (`FD-S-01`)

`lib/state/publicationGate.ts`. **Enforcement, not annotation** — there is no code path in which a
`synthetic` origin publishes with a badge attached.

```
decide(origin, availability, previewEnabled)
  synthetic          -> publishes ONLY in the guarded preview, flagged internalPreviewOnly
  synthetic + guard off -> SUPPRESSED, reason "synthetic-not-publishable"  (for every availability)
  unavailable        -> never publishes
  underReview        -> never publishes as fact
  unverified         -> never publishes as fact
  productionDerived / configuration / copiedEditorial + verified -> publishes
```

- `gate()` **drops the value**, it does not merely hide it.
- Fixture-level `_meta.illustrative` is now **machine-read** (`fixtureDefaultOrigin`) — until this task
  nothing read it.
- `assertAllGatedClassesChecked()` **throws** if any of the ten FD-S-01 field classes renders without a
  gate decision: winners · unclaimed prizes · claim deadlines · claim thresholds · tax rates · tax status ·
  anonymity rules · retailer locations · purchase eligibility · state highlights.

**Verified in the built output:** every fabricated fixture string is absent from `/fl` with the guard on —
`Tampa`, `208,000`, `180 days`, `24%`, `Mandatory federal withholding`. **No fixture content was deleted
or rewritten.**

---

## 4. Florida State Content Manifest

`lib/state/floridaContentManifest.ts` — a governed **content contract**, separate from the fixture shape,
from any API payload and from any database design (`FD-S-03`).

**Published (verified, with source):** state code · canonical name · jurisdiction type · lottery status ·
operator name · operator official / winning-numbers / where-to-play URLs · primary timezone + label ·
result source · result last-updated · the 7 games · independence policy.

**Evidence register:** `[E1]` production results feed · `[E2]` `states-config.json` · `[E3]` **PF-02
Appendix B [EXT-01]** (the approved blueprint's own citation of the Florida Lottery's official site) ·
`[E4]` `result-format-definitions.json` · `[E5]` fixture `page.lastUpdated` · `[E6]` `footer-config.json`
`_meta`, which records that production's footer deliberately carries no 18+/responsible-play line.

**Recorded as absent — 17 entries, each with the reason, none invented:** draw schedule · draw cutoffs ·
minimum purchase age · claim thresholds · claim deadline · tax status · anonymity rule · purchase
eligibility · responsible-play contact · published odds · scratcher snapshot · winner records · unclaimed
prizes · fund allocation · editorial items · community items · history destinations.

**No synthetic fixture fact was copied in.** Claim deadlines, tax rates and anonymity rules exist in the
repository only as synthetic fixture prose; recording them here would launder that content into a governed
contract.

---

## 5. Florida result formats (`FD-S-10`)

**All seven Florida games already had a definition. No format definition needed adding** — this task
*verifies* coverage rather than authoring it, and `04-sample-data/**` was not modified.

| Game | id | format | Structure verified |
|---|---:|---:|---|
| Powerball | 1012 | 1012 | 5 + 1 special (`Powerball`), Power Play multiplier, Double Play, effectiveFrom 2015-10-07 |
| Mega Millions | 1013 | 1013 | 5 + 1 special, effectiveFrom **2025-04-08** (format change) — renders `awaiting` |
| Florida Lotto | 337 | 337 | 6, `6/53+6/53` secondary draw |
| Fantasy 5 | 336 | 336 | 5, `5/36` |
| Pick 3 (Midday) | 332 | 332 | 3 digits + Fireball add-on, effectiveFrom 2019-04-28 |
| Pick 2 (Midday) | 563 | 563 | 2 digits + Fireball add-on, effectiveFrom 2019-04-28 |
| Cash Pop (Morning) | 614 | 614 | 1 ball, `1/15` |

`checkGame()` suppresses rather than invents: a missing definition, a drawn count exceeding
`maxBallCount`, or a **date-effective mismatch** each suppress the game with a recorded reason.
`narrowStatus()` closes the union — `latest → verified`, and anything unrecognised becomes `unavailable`
instead of falling through to the "next draw" branch, which is the defect the widened
`| string` type allowed.

**The other 101 ungoverned formats were not touched** — they are a cross-State rollout gate.

---

## 6. PF-02 section manifest and Adaptive Priority resolver

`lib/state/sectionManifest.ts` — the 25 governed anonymous positions, transcribed verbatim, asserted
against an independently written copy of PF-02 §12 in the tests. Composition: **19 content sections +
5 ad anchors + footer**. Each entry declares kind · requirement · stable fragment · protected-zone status ·
host-eligibility requirement · mobile step.

`lib/state/adaptivePriority.ts` — the five §12.1 overrides, deterministic and data-driven. No AI, no
service call, no inference (`FD-S-17`).

**Verified in built output, one build per trigger:**

| Trigger | First sections | First ad index | Ads deferred |
|---|---|---:|---|
| *(none)* | exactly `DEFAULT_ORDER` | 1 | — |
| `possibleWin` | `S-05`, `S-08`, `S-01` | 3 | yes |
| `correction` | `S-02`, `S-01` | 2 | yes |
| `liveDraw` | `S-02`, `S-04` | 3 | no |
| `safety` | `S-17`, `S-01` | 2 | yes |
| `sourceOutage` | default order | 1 | yes |

`assertNoAdBeforePromoted()` **throws** if an ad anchor precedes a promoted section under a deferring
trigger. Every override records trigger, affected sections, start and expiry, and the window is enforced —
an expired trigger does not apply. Footer stays last under every override. Precedence is absolute: a
possible win outranks a live draw.

**Not a page-builder.** One typed State manifest, one resolver, a 20-case literal `switch`. No dynamic
component lookup, no plugin registry, no schema interpreter.

---

## 7. Rendered and suppressed sections

**Rendered (13):** S-01 · S-02 · S-03 · S-05 · S-06 · S-07 · S-08 · S-08A · S-14 · S-15 · S-16 · S-17 · S-18

| Section | What renders |
|---|---|
| **S-01** | One H1; source/freshness with a visible **stale** badge; three real in-page anchors (results, AI brief, change state) — **no disabled select**; no purchase CTA |
| **S-02** | 7 verified result cards in PF-02 grouping order; ball counts from data, order preserved; `awaiting` shows the **exact next-draw date**; no ad inside the grid |
| **S-03** | Labelled **not-connected** AI shell, prompts grounded in real manifest values; no generated answer; **no "Sign in to try" button** |
| **S-05** | Concise unavailable state — **no input controls at all**, nothing simulated |
| **S-06** | `Compare Florida Lottery Games` neutral table (game · offering · format · numbers drawn); published odds explicitly unavailable rather than estimated |
| **S-07** | `Where to Play` information only; official operator link; **no `Buy Tickets`/`Play Online`**, no affiliate |
| **S-08** | Four "Currently unavailable" cards (claim thresholds, deadline, tax, anonymity) each with the official path; `#taxes` anchor; no ad, no affiliate |
| **S-08A** | 9-row essentials table — 4 verified, 5 marked unavailable with the reason |
| **S-14** | **Genuine cold start** — zero invented items, `data-ad-host-eligible="false"` |
| **S-15** | Approved sparse state — zero invented items, `data-ad-host-eligible="false"` |
| **S-16** | Informational value statement — **no account control** |
| **S-17** | Official source · independence policy · responsible-play marked unavailable with the operator path · corrections policy |
| **S-18** | 16 supported jurisdictions as links, 37 planned as **plain text, not links**; `/usx` impossible |

**Suppressed (6), each with a recorded reason rendered in the preview:**

| Section | Reason |
|---|---|
| S-04 | No Florida draw-schedule data; cutoffs are legacy runtime DB values. Live status is never inferred |
| S-09 | The only highlights available are fabricated fixture content (`FD-S-02`) |
| S-10 | No `/fl/{game}` or archive route exists, so every history link would be dead |
| S-11 | No scratcher snapshot source |
| S-12 | Winner records are fabricated |
| S-13 | No fund-allocation block |

**28 "Currently unavailable" instances.** No empty decorative section was added to satisfy PF-02.

---

## 8. Minimum Florida advertising profile

**Approved profile: 10 placements. Rendered: 9. Deferred: 1, with a reason.**

| # | Slot | Anchor | Sub-position | Host | <992 | ≥992 | State |
|---:|---|---|---|---|:--:|:--:|---|
| 1 | `sp_top_billboard` | AD-S00 | inline | S-01 | ✅ | ✅ | reserved |
| 2 | `sp_mid_leaderboard_pos1` | AD-S01 | inline | S-03 | ✅ | ✅ | **filled** |
| 3 | `sp_mid_leaderboard_pos2` | AD-S02 | inline | S-06 | — | ✅ | reserved |
| 4 | `sp_mobile_leaderboard_pos1` | AD-S02 | mobile-inline | S-06 | ✅ | — | reserved |
| 5 | `sp_mid_leaderboard_pos6` | AD-S03 | inline | S-10 | ✅ | ✅ | **no-fill** |
| 6 | `sp_mid_leaderboard_pos5` | AD-S04 | inline | S-18 | ✅ | ✅ | reserved |
| 7 | `sp_side_mpu_pos4` | AD-S02 | rail | S-06 | — | ✅ | reserved |
| 8 | `sp_side_skyscraper_pos2` | AD-S04 | rail | S-18 | — | ✅ | reserved |
| 9 | `sp_bottom_large_leaderboard` | AD-S04 | sticky | Footer | ✅ | ✅ | reserved |
| — | `sp_side_mpu_pos2` | AD-S03 | rail | **S-10** | — | — | **DEFERRED** |

### 8.1 Why one approved placement is deferred

`sp_side_mpu_pos2`'s approved rail host is **S-10**, which this preview suppresses (no real history
destination exists). A rail slot with no host section has nowhere to sit.

`resolvePreviewPlacements()` **defers it with a recorded reason and does not re-home it** — APP-ST-04
states a slot whose host does not qualify "remains deferred and is not moved to another section". The
approved profile stays 10; the preview renders 9.

This exposed a semantic distinction the first implementation conflated: for a **rail** slot
`hostSectionId` is the section it sits *beside*, but for an **inline** slot it is the section the anchor
*follows*. An ad anchor is a sequence position, so **AD-S03 still renders** between S-08A and S-14 even
though S-10 is suppressed. The guard now checks reachability only for rail placements.

### 8.2 Verified in the built output

- **9 distinct slots, each exactly once.** No duplicate slot, **no duplicate div id**.
- **All 5 inline anchors occupied at both tiers** → no 992–1023 px hole.
- **Rail hosts: S-06 and S-18 only** — never a protected section.
- **One filled + one no-fill** review representative (DS-23 / DS-24).
- Absent, as required: `atv_video_player` · `sp_side_halfpage_pos1` · Wyoming units · `sp_toppromobar` ·
  `sp_mid_leaderboard_pos4` · `sp_mobile_leaderboard_pos4` · all four conditional S-14/S-15 slots.
- `data-gam-active="false"`; no `googletag`, no `adsbygoogle`.

### 8.3 Section-bounded rail (`FD-S-28`)

The rail is a **per-section two-column grid** whose sticky cell lives inside its own section, so
`position: sticky` releases at the section boundary **by construction**. This reproduces the legacy JS
semantic (`ad.closest('.c-section')`) declaratively, with no scroll listener — and it is why a rail slot
can never travel into protected content. `.lcp-rail` (Home) is page-level sticky and deliberately not
reused.

### 8.4 Sticky footer (`FD-S-29`)

Closable sticky footer at both tiers. **Clearance is derived** — reserved height + bottom-nav height +
spacing + `env(safe-area-inset-bottom)` — replacing the legacy hardcoded `pb-28`. The preview introduces
**no sticky purchase action** and no bottom navigation, so only one sticky layer exists; the nav term is
retained in the calc so adding navigation later cannot silently overlap.

---

## 9. `assertStateAdBaseline()`

`lib/state/stateAdBaseline.ts`. **Throws, never warns** — a silently changed ad baseline is a revenue
incident. **Written from the State rules; the Home guard was not copied** (Home asserts a single
15-slot, single-viewport baseline).

Checks, in order — per-placement validity runs **before** completeness, so a substituted slot produces the
specific error rather than a generic "an approved slot is missing":

1. forbidden slot · 2. conditional S-14/S-15 slot · 3. unknown slot · 4. no definition in the slot map ·
5. duplicate active slot · 6. approved count · 7. completeness · 8. **duplicate div id** ·
9. rail in a protected zone · 10. unapproved rail host · 11. >1 visible inline slot per anchor per
viewport · 12. **992 px tier coverage** · 13. rail reachability · 14. deferred slot without a reason ·
15. exactly one filled + one no-fill representative.

Reordering exposed a genuine defect: the forbidden and conditional checks were **unreachable** because
completeness fired first.

---

## 10. Shared design-system foundation (`FD-S-12`)

**Incremental, additive, no rewrite.** `app/globals.css` gained **140 lines**; **4 selector lines gained a
second selector.** Nothing was removed or renamed.

| Change | Effect |
|---|---|
| `[data-lc-preview]` → `[data-lc-preview], [data-lc-state-preview]` on the token/typography root | State inherits approved tokens, tabular numerals (DS-10), 16 px body floor (DS-09) |
| Same, on `:focus-visible` | DS-15 visible focus |
| Same, in the `prefers-reduced-motion` block | DS-16 |
| New `[data-lc-state-preview]`-scoped block | Section-bounded rail · section rhythm · unavailable note · DS-29 attribution treatments · accessible tables · skip link · derived sticky clearance · forced-colours |

**Home non-regression, proved three ways:**

1. **No Home file changed** — `git status` shows no Home component, fixture or Home ad file.
2. **Every `[data-lc-preview]` selector is retained**, and every pre-existing CSS line is still present:
   the change is additive. The Home preview root is `data-lc-preview="home"` (`app/page.tsx:106`), which
   **cannot match** `[data-lc-state-preview]`.
3. **Legacy Home output byte-compared before/after.** The only differences are the per-build React comment
   id and the **CSS filename hash** — the unavoidable consequence of adding a stylesheet layer. The DOM is
   otherwise identical.

The unapproved `:root[data-theme="dark"]` block was **not expanded and not removed** (DS-30 / `FD-S-15`).

---

## 11. Responsive and accessibility validation

**One structural threshold.** 33 of 41 media queries are `min-width: 992px`; **no `1024px` query exists**,
and the State preview components contain **no Tailwind `lg:` class** — so the 992/1024 split that caused
the inventory gap is gone from this page.

| Width | Layout | Ads visible | Rail |
|---:|---|---:|---|
| 320 / 375 / 390 | single column, 16 px body | 6 | collapsed |
| 768 | single column | 6 | collapsed |
| **991** | single column | 6 | collapsed |
| **992** | two columns at rail hosts | 8 | appears |
| 1024 / 1280 / 1440 | two columns, 1280 px container max | 8 | present |

The 991 → 992 switch is single and synchronised: the rail appears, the mobile-only slot suppresses and the
desktop-only slot appears at the same threshold.

| Requirement | Status |
|---|---|
| Exactly one `<main>` landmark | ✅ — a nested `<main>` was found and removed |
| Exactly one `<h1>` | ✅ (13 `<h2>`, 13 `<h3>`) |
| Skip link | ✅ `.lcs-skip`, targets `#state-main` |
| Visible focus / reduced motion / forced colours | ✅ via the shared layer |
| Tables contained | ✅ **2 tables, 2 `.lcp-scroll-x` containers** — the page body never scrolls horizontally |
| Table captions + `scope` | ✅ on both tables |
| Result balls wrap without reordering | ✅ `flex-wrap`, array order preserved (DS-12) |
| Special-ball three signals | ✅ visible label + `data-special` non-colour distinction + `data-ball-label` |
| Tabular numerals | ✅ inherited on the preview root and `.lcs-table` |
| **Disabled controls in the preview's own sections** | ✅ **zero** |
| Disabled controls inherited from shell chrome | ⚠️ **6 — see §13** — **SUPERSEDED by LRG-STATE-022: now 0, see §15.3** |

---

## 12. Tests

**67 tests, all passing.** `npm test` → `node --test` with Node's native TypeScript stripping.

**Zero new dependencies; the lockfile is untouched.** A test-only ESM resolve hook
(`tests/ts-resolve-hooks.mjs`, built on `node:module`) teaches Node the `@/` alias and extensionless
relative imports that Next/TypeScript already understand, so application source did not have to be
contorted to suit the runner.

Coverage: guard off/on and non-Florida behaviour · registry not fixture-derived, `/usx` impossible ·
publication gate (7 cases incl. "a label is never a substitute") · manifest carries no synthetic fact ·
Florida format coverage, missing definition, date-effective mismatch · closed status union · PF-02 default
order and composition · **all five overrides** plus precedence, expiry, footer-last and the no-ad-before-
promoted invariant · ad baseline (14 cases incl. duplicate div id, forbidden, conditional, protected zone,
per-viewport stack, 991/992 coverage, device pairing) · rail deferral without re-homing · preview model.

---

## 13. Known deferred work

| Item | Why deferred |
|---|---|
| **6 disabled controls inherited from `SiteHeader` / `MobileNav` / `SiteFooter`** | The root layout supplies legacy chrome around every non-Home-preview route. Suppressing it for the State preview would require either editing Home-adjacent files (forbidden here) or removing chrome from `/` and `/az` in review mode — a new inconsistency in routes this task must not change. The preview's own sections render **zero** disabled controls. These three components are already classified **REPLACE** for the Global Shell v1.1 rebuild, which is where the fix belongs — **SUPERSEDED by LRG-STATE-022: fixed without touching Home via a shell capability input, see §15.3** |
| `sp_side_mpu_pos2` | Approved rail host S-10 is suppressed; deferred, not re-homed (§8.1) |
| S-04, S-09 – S-13 | No verifiable data (§7) |
| Claim / tax / anonymity / age / responsible-play facts | Need official sourcing — `OPEN-ST-08` |
| S-05 deterministic comparison | Needs governed game rules wired to a comparator |
| S-03 AI connection | Needs the manifest-grounded retrieval layer (`AI-02`) |
| Conditional S-14/S-15 advertising | Requires substantive real content (APP-ST-04/05) |
| `atv_video_player`, `sp_side_halfpage_pos1`, Wyoming, `sp_toppromobar` | Ad-operations confirmation — `OPEN-ST-02`, `OPEN-ST-03` |
| Routes, canonical, sitemap, robots, ST-06, other 15 states | Tracks 2 and 3 |
| Signed-in / Insider, commerce activation | Tracks 4 and 5 |

---

## 14. Founder review instructions

```bash
cd 01-new-ui && LC_STATE_PREVIEW=true npm run dev     # then open http://localhost:3000/fl
```

**Check at 390 px:** top and results · middle (games, player help, essentials) · lower page and the sticky
footer. **Then 992 px** (rail must appear exactly here) and **1440 px**.

**Then verify:**

1. **Synthetic suppression** — S-09 and S-12 are absent with stated reasons; S-08 shows four "Currently
   unavailable" cards, not invented deadlines or tax rates.
2. **Adaptive Priority** — restart with `LC_STATE_PREVIEW_OVERRIDE=correction`; S-02 moves to the top and
   the correction banner appears **before** any advertising.
3. **Ad accounting** — read `data-ad-approved-count` (10), `data-ad-active-count` (9) and
   `data-ad-deferred` (`sp_side_mpu_pos2`) on the preview root.
4. **Guard off** — restart without the flag; `/fl` must be the existing page exactly.
5. **Non-Florida** — `/az` stays on the existing implementation with the flag on.
6. **Home** — `/` unchanged at one mobile and one desktop width.

**What still needs a decision:** `OPEN-ST-06` — final desktop/mobile visual approval (DS-37), the
special-ball border/shape/pattern tokens, and the four DS-DEC-001 §8 items (container width, density,
weight policy, 44×44 targets).

---

## 15. LRG-STATE-022 corrections

Task LRG-STATE-022 ran a runtime audit of the guarded preview in a real browser at nine widths, with the
guard on and production ad geometry (`LC_STATE_PREVIEW_AD_MODE=production`). It corrected **verified
defects only**. Everything below was measured, not inferred; the original LRG-STATE-021 claims above are
annotated rather than deleted.

### 15.1 The S-10 contradiction, resolved

§8.1 and §7 were both right, and read together they looked contradictory. The cause was one DOM
attribute doing two different jobs.

- For a **rail** slot, `hostSectionId` is the section the advertisement sits beside. That section must
  render *and* qualify as an advertising host.
- For an **inline** slot, `hostSectionId` only names the governed sequence neighbour of its anchor. The
  anchor position survives that neighbour's suppression.

LRG-STATE-021 emitted a single `data-host-section` for both, so `sp_mid_leaderboard_pos6` — an inline slot
at AD-S03 whose sequence neighbour is S-10 — appeared to prove "S-10 renders" while §7 correctly recorded
S-10 as suppressed. The attribute is now split into `data-rail-host-section` and
`data-anchor-follows-section`. **S-10 is suppressed. It hosts no advertisement. AD-S03's inline anchor
still renders.** The approved profile stays at 10; the preview activates 9; `sp_side_mpu_pos2` is deferred
with a recorded reason and is never re-homed (APP-ST-04).

### 15.2 Host eligibility is more than "did it render"

APP-ST-01's correction — *an empty-state shell is not an advertising host* — was only partly enforced.
`resolvePreviewPlacements()` now takes the ad-host-eligible set, not merely the rendered set, and
`assertRailHostsEligible()` throws if an active rail slot accompanies an ineligible section. Sections that
render a required unavailable surface (S-05, S-08, S-08A, S-17) or a cold-start/sparse hub (S-14, S-15)
are permanently ineligible and carry `data-ad-host-eligible="false"`.

S-07 and S-15 were also rewritten: S-07 now renders the verified official Where-to-Play link and its
attribution instead of a generic unavailable box, and S-15 renders the approved sparse editorial hub. An
inverted guard in S-04 was fixed (it could never render its own content).

### 15.3 Zero disabled controls, with Home untouched

The preview inherited **6** permanently-disabled controls from the root layout's shared chrome (state
selector, Login, Register, newsletter input and submit, Privacy Manager), against FD-S-08 / DS-17 and
`CLAUDE.md` §9. LRG-STATE-021 deferred this as unfixable without touching Home.

It was fixable. `lib/layout/shellCapabilities.ts` adds a capability input to the shared shell.
`DEFAULT_SHELL_CAPABILITIES` enables everything, so every existing caller is unchanged, and a disabled
capability means the control is **not rendered** — no fake handler, and no functionality enabled that does
not genuinely work. **The guarded preview now renders 0 disabled controls.**

Home non-regression was proved three ways: the locked Home (`LC_HOME_PREVIEW=true`) served response is
**byte-identical** in visible DOM; guard-off `/`, `/fl`, `/az` and `/ny` are **byte-identical** in visible
DOM; and the emitted stylesheet diff is 2 rules removed and 8 added, **all `lcs-` State-owned, none
matching a `.lcp-` or `[data-lc-preview]` selector**.

### 15.4 Four advertising and accessibility defects confirmed at runtime

| # | Defect (measured) | Cause | Fix |
|---|---|---|---|
| A | `sp_mid_leaderboard_pos2` rendered **112 px wide against a reserved 728 px** at 1440 px | The device wrapper reused Home's `lcp-desktop-only`, which is Home's **navigation** class and is `display: flex` at ≥ 992 px, making the slot a shrink-to-fit flex item | State-owned block wrappers `lcs-ad-desktop-only` / `lcs-ad-mobile-only`; State ad geometry no longer depends on a Home navigation rule |
| B | **Every** slot reserved its *mobile* height at *every* viewport — `sp_side_skyscraper_pos2` held **280 px against a reserved 600 px** | `min-height` was an **inline** style, which outranks any stylesheet rule including a media query, so the ≥ 992 px desktop override was dead | Both tiers are CSS variables; `.lcs-adslot-reserve` selects the tier at the single 992 px threshold |
| C | Sticky clearance was **68 px beneath a 90 px fixed bar**, and the site footer's own links sat under it (390 px: last focusable bottom 826 vs bar top 793) | The calc used Home's `--lcp-sticky-ad-h: 56px`, a *compact-mode* constant, **and** sat on the page element — but a `position: fixed` bar covers the viewport and `SiteFooter` renders after `<main>` | Clearance is derived per tier from the sticky slot's own reservation and applied at **document** level (`body.lcs-doc-clearance`). WCAG 2.2 AA 2.4.11 |
| D | Every awaiting card stated its status **twice** ("Awaiting result — next draw Friday, 07/10/2026"), to the eye and to a screen reader | The height-reserved placeholder already renders `statusDetail`, and a second paragraph repeated it | The paragraph renders only when values *are* shown and the status is still not verified — the `corrected` case |

Defects A–C all shared one root cause worth recording: **State advertising geometry was borrowing Home
classes and Home constants.** `lib/state/stateAdReservation.ts` now owns the reservation maths as pure
domain logic — importable by the layout and by the test suite, and the single owner of compact clamping,
so a slot's reserved height and the clearance beneath it cannot drift apart.

### 15.5 What the runtime audit confirmed as already correct

- **Nine widths** (320 · 375 · 390 · 768 · 991 · 992 · 1024 · 1280 · 1440): no horizontal page scroll, no
  clipped balls, no uncontained table scroll, exactly one `<main>` and one `<h1>`, no heading-level skips.
- **One structural threshold.** 991 → 992 flips once: 6 ads and no rail → 8 ads with the rail beside its
  host. No tablet tier. (Chrome evaluates media queries on window width *including* the scrollbar; an
  earlier reading that suggested a reservation fault at 991 px was a measurement artefact, not a defect.)
- **All five Adaptive Priority overrides** promote correctly and **no advertisement ever precedes the
  promoted section**: `possibleWin` → S-05, `correction` → S-02, `liveDraw` → S-02, `safety` → S-17,
  `sourceOutage` → S-01. Position count is preserved in every case. These flags must be set at **build**
  time — the State routes are SSG, so setting them only at `next start` has no effect.
- **Result formats.** Ball counts span **1 → 12** across seven Florida games, with named special balls
  (Powerball, Fireball), a multiplier rendered as text (`Power Play 4X`), a secondary draw (Double Play)
  and an awaiting placeholder. Nothing hardcodes a ball count. No card-game format applies to Florida.
- **Accessibility.** 67 focusable elements, **0 disabled**, none without an accessible name; both tables
  have a caption and `scope` on every `<th>`; bonus balls carry a visible text label as well as
  `data-special`; reduced-motion and forced-colours blocks present; no unlabelled meaning-bearing
  pictographs; no bottom navigation, so no sticky conflict.
- **Manifest provenance.** 31 governed fields: 14 published facts (5 `productionDerived`, 5
  `configuration`, 4 `copiedEditorial`) and **17 explicitly `unavailable`**. No `synthetic` field is
  published as fact.

### 15.6 `[EXT-01]` — kept `verified`, with a recorded reservation

Four fields (`operatorName`, `operatorOfficialUrl`, `operatorWinningNumbersUrl`,
`operatorWhereToPlayUrl`) rest solely on `[E3] PF-02 Appendix B [EXT-01]`. Appendix B is a register of
*external sources reviewed*, and it does state the operator name and lists all four URLs verbatim; the
same `floridalottery.com` URLs appear independently in the Experience Architecture, the Home blueprint and
the Global Shell blueprint. Because tier 2–4 approved documents agree, these stay `copiedEditorial` /
`verified` rather than being downgraded to `underReview`.

The reservation, recorded rather than resolved: this is **documentary** evidence, not live verification,
and the legacy production application provides **no corroboration at all** — it links no official state
lottery sites (its only outbound links are affiliate and `lotteryusa.com` URLs). Web verification was out
of scope for this task. Since the page renders these as official outbound links, confirming the current
official Florida domain is listed below as a founder/ops item before any public launch.

### 15.7 Still open after this task

| Item | Status |
|---|---|
| `sp_bottom_large_leaderboard` **close control** | APP-ST-05 calls it the "closable sticky-footer **candidate**", so closability is a candidate property, not yet an implemented requirement. No close control exists. Building one is new interactive work and was out of scope for an audit task |
| Official Florida operator domain | Documentary only (§15.6). Confirm before public launch |
| `OPEN-ST-06` | Final desktop/mobile visual approval (DS-37), special-ball border/shape/pattern tokens, and the four DS-DEC-001 §8 items |

---

# LRG-STATE-025 — Initial Visual Draft

**Status:** POPULATED DRAFT FOR FOUNDER REVIEW. **`DS-37` is NOT closed and the Florida visual model is
NOT approved.** Authority: `FD-X-01` … `FD-X-14` (`03-docs/08-decisions/state-page-cross-state-experience-decisions.md`).

## 1. Official sources used

All accessed **2026-07-28**. Primary official pages only — no search snippet, article or proposed PDF was
treated as authoritative.

| Ref | URL | Exact fact supported |
|---|---|---|
| [O1] | `https://floridalottery.com/games/draw-games` | *"Must be 18 or older to play."* Official link labels: Search Winning Numbers · Where to Play · How to Claim · Play Responsibly. |
| [O2] | `https://floridalottery.com/howtoclaim` | Winner's Guide. Prizes **$599 or less** at authorized retailers or district offices; **$600–$1,000,000** at a district office; **over $1,000,000** at headquarters; **mail claims up to $250,000**. *"you have 180 days after the draw date for a Draw Game"*; *"you have 60 days to claim a Scratch-Off prize after the game has ended"*. Confirms the paths `/where-to-play`, `/play-responsibly`, `/games/winning-numbers`. |
| [O3] | `https://floridalottery.com/games/draw-games/powerball` | *"Powerball drawings are held on Monday, Wednesday and Saturday."* *"Tickets may be purchased until 10:00 p.m., Eastern Time, on the night of the drawing."* Power Play 2X–5X, 10X when the jackpot is $150 M or lower. Double Play is an additional drawing after Powerball. 5 of 1–69 + Powerball 1–26. |
| [O4] | `https://floridalottery.com/games/draw-games/mega-millions` | *"MEGA MILLIONS drawings are held every Tuesday and Friday night at 11 PM Eastern Time"*. Cutoff 10:00 p.m. ET. 5 of 1–70 + MEGA BALL 1–24. *"Every non-jackpot win will multiply its base prize by 2, 3, 4, 5, or 10 times automatically!"* — the built-in multiplier that replaced the separate Megaplier add-on. |

Repository sources: `[E1]` production results feed · `[E2]` states-config · `[E4]` format definitions ·
`[E7]` `reference-tables/game.csv` (`GAMETIME`, `CUTOFFTIME`, `PLAY_TYPE`).

**Winning numbers were NOT taken from manual web copy.** All result values remain production-derived from
`04-sample-data/source-xml/latest-results-lc.xml`.

## 2. Florida manifest expansion

Manifest `0.1.0-preview` → **`0.2.0-preview`**. Seven entries moved from absent to **verified**:
`minimumPurchaseAge` (18) · `claimThresholds` (4 official tiers) · `claimDeadline` (180/60 days) ·
`drawSchedule` (19 rows) · `drawCutoffs` · `historyDestinations` (4 resolving) ·
`responsiblePlayContact` (the official `/play-responsibly` destination — **not** an invented helpline
number). Two new URL facts added: `operatorHowToClaimUrl`, `operatorResponsiblePlayUrl`.

**Still absent, and deliberately so (`FD-X-13`):** `taxStatus` · `anonymityRule` · `winnerRecords` ·
`unclaimedPrizeRecords` · `fundAllocation` · `scratcherSnapshot` · `publishedOdds` · `editorialItems` ·
`communityItems`. **No synthetic winner, tax, claim-deadline or unclaimed-prize content was repopulated.**

**Commerce:** `purchaseEligibility` = **`underReview`** (`FD-X-11`). [O1]/[O2] confirm the official Where-to-Play
destination is a retailer locator — evidence about the *destination*, not proof of the jurisdiction's full
purchase picture. It is **never** recorded as `retailOnly`, which would be an unverified factual claim.

## 3. Displayed game and draw-event coverage

**19 of 19** Florida draw events in the feed now render, collapsed into **10 game identities** (`FD-X-06`):

| Family | Events | Notes |
|---|---:|---|
| Powerball | 1 | Power Play multiplier + **Double Play** secondary draw |
| Mega Millions | 1 | Mega Ball named special |
| Florida Lotto | 1 | **Double Play** secondary draw |
| Jackpot Triple Play | 1 | 6/46 |
| Fantasy 5 | 2 | Midday + Evening |
| Pick 2 / Pick 3 / Pick 4 / Pick 5 | 2 each | Midday + Evening, each with **Fireball** |
| Cash Pop | **5** | Morning · Matinee · Afternoon · Evening · Late Night — ONE card, not five |

**12 Florida format definitions were added** so every feed event is governed. Shapes were cloned from the
verified sibling format for the same family; counts and ranges come from `PLAY_TYPE` in `game.csv` and match
the feed's `numbers-str`. No Powerball/Mega Millions definition was altered; no non-Florida format touched.

Every displayed event carries: a verified format · preserved drawn ball order · an explicit draw period
wherever its family has more than one event · source and freshness · a closed status · next-draw information
only where the feed supplies it. Florida raffles and Scratch-Off games are real but absent from the feed, so
they are **absent here rather than invented**.

## 4. Sections rendered and suppressed

**Rendered (16):** S-01, S-02, S-03, **S-04**, S-05, S-06, S-07, S-08, S-08A, **S-09**, **S-10**, S-14,
S-15, S-16, S-17, S-18 — plus AD-S00…AD-S04 and the footer.
**Suppressed (3):** S-11, S-12, S-13 — still genuinely unsourced.

S-04, S-09 and S-10 were unsuppressed by *gaining real content*, which is the only permitted route.

## 5. Mobile hierarchy (`FD-X-03`)

Order below 992 px: identity + official source + freshness → **first verified result** → compact
multi-state strip → Florida-native games → task actions → Ask Florida AI → Where-to-Play status.

**Verified at 320 / 375 / 390 px: zero in-flow advertisements precede the first verified result**, by both
DOM order and geometry. Pixel budgets in the specification remain **non-binding**.

## 6. AI interaction draft (`FD-X-08`)

One persistent `Ask Florida AI` entry, **20 contextual Explain actions**, 5 precomposed prompt chips, and
**exactly ONE shared answer surface** — verified: two different Explain actions both wrote into the same
single panel. **No AI service is connected and no answer is fabricated**; the panel shows the selected
question, the grounding sources the answer would be limited to, the stated boundary, and an explicit
*"AI response is not connected in this preview"* state.

## 7. Where-to-Play state

`underReview` → visible action stays **`Where to Play`**. No `Buy Tickets`, no `Play Online`, no purchase CTA
on any card (`buyTickets: null` on all 19), none in the utility bar. No commerce activated.

## 8. Engagement draft (`FD-X-09`)

S-09 carries the deterministic **what changed since your last visit** summary: new-result count, jackpot
movement computed from the feed's own current-vs-next advertised prizes, and a plainly stated zero
corrections. The local marker stores **only** `{feedVersion, date}` in `localStorage` — no browsing history,
no account, no cross-device promise. Suppresses itself to a single sentence when nothing changed. First
visit is useful on its own. **Follow State, Follow Game and notifications are deferred; no disabled control
renders.**

## 9. Advertising

Approved profile **unchanged at 10**. `AD-S00` is **desktop-only** (`FD-X-04`) — the anchor wrapper collapses
entirely below 992 px so no blank reservation remains, and no replacement mobile ad was introduced. The
baseline guard now enumerates that single exception by name and adds a rule forbidding any mobile placement
at `AD-S00`, so any other anchor losing a tier still fails loudly.

**All 10 placements now activate** (was 9/1 deferred): S-10 gained substantive content, so
`sp_side_mpu_pos2` became reachable and host-eligible under `APP-ST-01`. The slot was never re-homed.
Verified: 5 visible ads below 992 px, 9 at and above it, 3 rails beside their hosts from exactly 992 px, no
992–1023 px gap, no duplicate div IDs, no protected-zone ad, no live GAM or partner script.

## 10. Provisional visual choices — decided provisionally, NOT closed

| Item | Provisional choice | Open decision |
|---|---|---|
| Desktop container width | 1280 px retained | `OPEN-SX-01` |
| Desktop density | 2-column family grid from 992 px | `OPEN-SX-02` |
| Typography hierarchy | Existing token scale; compact one-line preview bar | `OPEN-SX-03` |
| Card density | Restrained 1 px border, no shadow, 12 px padding | `OPEN-SX-04` |
| Featured treatment | 3 px left accent rather than a heavier card, so native games never read as second-class | `OPEN-SX-03` |
| Special ball | `FD-S-14` three signals retained; tokens untouched | `OPEN-SX-03` |
| Mobile result-card density | Family card + `<details>` progressive disclosure | `OPEN-SX-04` |
| Sticky-ad close | **Implemented and functional**, session-scoped, reclaims clearance on close | **`OPEN-SX-05` — proposed, not production-approved** |

## 11. Founder-review captures

Stored **outside the repository** at the session scratchpad
(`…/scratchpad/lrg025-evidence/founder-review-evidence.md`), per the no-approved-evidence-directory rule.
Covers all eleven required views plus the nine-width measured sweep and the interaction evidence.
PNG files were not persisted — the browser tooling returns images inline rather than to disk and no
rendering tool was authorised; visual review was performed in-session at 390/992/1440 px and the measured
record is the durable artefact.

## 12. Verification summary

107 tests pass (0 fail) · tsc clean · lint clean · guard-off and guard-on builds succeed · **guard-off
`/fl`, `/az`, `/ny` and legacy Home visible DOM byte-identical to HEAD** · no Home file modified · 0 disabled
controls · one `<main>`, one H1, no heading skips · no horizontal scroll at any of the nine widths · 87 balls,
none clipped.

## 13. Unresolved visual decisions

`OPEN-SX-01` desktop container width · `OPEN-SX-02` desktop density · `OPEN-SX-03` visual token application
including special-ball tokens · `OPEN-SX-04` mobile card density after this populated review ·
`OPEN-SX-05` whether the sticky bottom ad requires a close control · **`OPEN-SX-06` `DS-37` visual approval**.

Two sub-44 px controls remain at every width — the shared-shell logo link (28 px) and mobile hamburger
(40×40). Both are `SiteHeader` components outside this task's allowed paths; recorded for the shell/DS-37
work rather than changed here.

---

# LRG-STATE-030 — Florida Prototype V1: Game-Family Visual Draft

**Produced by:** Task **LRG-STATE-030**
**Date:** July 30, 2026
**Baseline:** `7439cde` (clean working tree at task start)
**Status:** **PROTOTYPE V1 IMPLEMENTED — awaiting founder desktop and mobile review. `DS-37` / `OPEN-ST-06` remain OPEN.**

**Not production.** Guarded by `LC_STATE_PREVIEW=true`, `noindex`, no GAM, no partner script, no AI service,
no commerce transaction. The Buy Now surface contacts no provider.

---

## 1. What changed, in one paragraph

V0 rendered ten game families as ten equal-weight cards, each with two Explain actions — twenty AI entry
points and a hub that read as a list of games rather than a page of results. V1 introduces a
**presentation-layer game-family surface**: one card per family, with the family's member games as stable
rows inside it. Cash Pop is now one card with five rows instead of five cards. The result is a page where
the first verified Florida result is the loudest thing on the first screen, Buy Now is prominent and
governed, and AI appears twice rather than twenty times.

---

## 2. The domain model was NOT redesigned

This is the constraint that shaped every file in this task, and it is worth stating precisely.

The legacy database and the production results feed store **each variant as its own game record**.
`Pick 3 Midday` is game `332`; `Pick 3 Evening` is game `333`. They have separate ids, separate results,
separate schedules, separate histories, separate archive URLs. That is the domain model.

**No schema, API, feed shape or game record was changed, merged, renamed or synthesised.** What was added is
a presentation layer above them:

| Concern | Where it lives | Status |
|---|---|---|
| Game records, ids, results, schedules | production feed / legacy DB | **untouched** |
| Which member games render as one surface | `lib/state/floridaFamilyConfig.ts` (data) | new, presentation only |
| How a surface resolves and orders members | `lib/state/gameFamilyPresentation.ts` (generic) | new, presentation only |
| How a surface renders | `components/state/preview/sections/StateFamilySurface.tsx` | new, presentation only |

Guards enforce that the layer cannot corrupt identity:

- `assertMemberIdentityPreserved` — every member game id is claimed by **exactly one** family. A duplicate
  (one record rendering twice) or a gap (a record silently dropped) throws.
- `assertStableMemberOrder` — `displayOrder` is unique per family, and a multi-member family may never
  render an unlabelled row.

Verified at runtime: **19 member rows across 10 family surfaces**, member ids
`332 333 334 335 336 337 563 564 565 566 582 614 615 616 617 618 640 1012 1013` — the production ids,
unrewritten.

### Vocabulary

Per the task: these are **member games** / **game variants** with a **variant label**. They are **not**
"draw periods" in the domain model. The code, the types and this document use the required vocabulary.

---

## 3. Family composition

| Family | Members | Member game ids | Layout from count |
|---|---|---|---|
| Powerball | 1 | 1012 | `single` |
| Mega Millions | 1 | 1013 | `single` |
| Florida Lotto | 1 | 337 | `single` |
| Jackpot Triple Play | 1 | 582 | `single` |
| Fantasy 5 | 2 (Midday, Evening) | 640, 336 | `rows` |
| Pick 2 | 2 (Midday, Evening) | 563, 564 | `rows` |
| Pick 3 | 2 (Midday, Evening) | 332, 333 | `rows` |
| Pick 4 | 2 (Midday, Evening) | 334, 335 | `rows` |
| Pick 5 | 2 (Midday, Evening) | 565, 566 | `rows` |
| Cash Pop | 5 (Morning, Matinee, Afternoon, Evening, Late Night) | 614–618 | `columns` |

Decisions applied:

- **Powerball Double Play and Florida Lotto Double Play are SECONDARY RESULTS** inside their family, not
  member rows. Verified in the DOM: Powerball renders `memberCount: 1` with a labelled `DOUBLE PLAY` row
  carrying its own `POWERBALL 23`.
- **EZmatch and Combo appear nowhere.** They are purchase-time add-ons, not drawn results (LRG-STATE-029).
- **Fireball is a drawn add-on** and renders as its own labelled group inside the member row it belongs to.
- **Games are never grouped for sharing a format shape.** Pick 3 and Pick 5 are both digit games and remain
  separate families, because they are separate products.

### Layout is derived from member count, never from a game name

`memberLayout(memberCount)` returns `single` / `rows` / `columns`. The component asks *how many members*,
never *which family*. A test asserts the component source contains no occurrence of `Cash Pop`, `Pick 3`,
`Fantasy 5`, `Florida Lotto`, `=== "fl"` or `florida` in code. A second jurisdiction is a config file, not
a JSX rewrite.

---

## 4. Stable member rows, and why dates legitimately differ

Two properties carry the trust:

**Rows render in configured order, never re-sorted by recency.** Midday is above Evening on every visit.
The component contains no `.sort(` at all — a test enforces that; ordering lives only in the resolver.

**Each member shows its OWN latest verified result.** Verified in the live DOM at 375 px:

```
Fantasy 5                    Est. top prize $100,000
MIDDAY    Thu 07/09/2026 · 01:05 PM ET   2 18 27 32 36
EVENING   Wed 07/08/2026 · 11:15 PM ET   7 25 33 35 36
```

The dates differ, and that is correct — Midday has drawn since Evening last did. Three rules protect this:

1. A member with no verified result renders an explicit **"No result published yet"** row. It never borrows a
   sibling's numbers, and the row never disappears (a vanishing row would change the family's shape between
   visits).
2. A pending / awaiting / delayed / corrected state for a more recent draw renders **alongside** the last
   verified result, never instead of it.
3. Nothing is fabricated. A test asserts no literal ball-value array exists in the component.

---

## 5. Results-first hierarchy

Document order below 992 px, from the live DOM:

```
S-01 (identity + freshness + shortcut chips)
AD-S00                     <- collapses entirely below 992 px
S-02  >>> FIRST VERIFIED NATIVE RESULT
      task row: Buy Now · Check my ticket · How to claim
      multi-state compact strip (mobile)
      native families (4 inline)
      View all (3 more games)
S-03 ... S-18, AD-S01 ... AD-S04
```

Two compactions were made so the first result reaches the first screen at 375 × 812:

- **S-01 shortcut controls** were three stacked buttons occupying roughly 190 px. They are now one wrapping
  chip row — same three real destinations, no control removed, every target still ≥ 44 px — at about a third
  of the height.
- **S-06 (game portfolio)** listed all 19 member games as separate table rows: the same equal-weight
  explosion the family surface exists to fix, repeated further down the page. It now lists **one row per
  family** with the member count in the row. Nothing is lost — every member of a family shares one
  result-format definition, so `Pick 3 Midday` and `Pick 3 Evening` produced two byte-identical rows.

### First-native-family selection

`selectFirstNativeFamily` is deterministic: **open urgent status → newest verified result → configured
priority**. Multi-state families are excluded from the selection entirely, and **jackpot size is not a
factor at any point**. A test inflates a low-priority family's prize to `$999,999,999` and asserts the
selection does not move.

Current selection: **Fantasy 5** (newest verified native result, 2026-07-09).

---

## 6. Powerball / Mega Millions balance

- **Mobile:** a compact two-item strip — game, prize, date, Buy Now — placed **after** the first native
  result. It does not use a family card, so it cannot outweigh Florida-native games.
- **Desktop (≥ 992 px):** a featured pair of full family cards, two-up, with their verified brand logos.
- Florida-native families follow immediately, in a **two-column grid at desktop**. Two columns matter for
  more than density: at full width a single-member family stretches one short row of numbers across
  ~1,350 px and reads as an empty panel.

Native families are not visually demoted: `featured` is an accent on the *same* component, never a
different one.

---

## 7. Buy Now

Approved placements, all four implemented, **14 entries** in the DOM:

| Placement | Count | Notes |
|---|---|---|
| Task row after the first verified result | 1 | state-level |
| Powerball / Mega Millions | 4 | 2 mobile strip + 2 desktop cards; mutually exclusive by viewport |
| Eligible native families | 8 | one per family card, family level |
| S-07 Where to play | 1 | now the primary CTA there |

- **One Buy Now per family card.** Never on a member row — a test slices the `MemberRow` function and
  asserts it contains neither `StateBuyNowButton` nor `StateExplainAction`.
- **No sticky Buy Now.** The sticky tier belongs to advertising (`FD-N-03`); tests assert the button
  component mentions no sticky behaviour and that the sticky footer ad component does not import it.
- **One shared resolver for the whole page** (`StateBuyNowResolver`), mounted exactly once. Every entry
  dispatches to it. The entry button contains **no URL at all** — a test asserts that.

### What the resolver actually does

It runs the **real** deterministic resolver from `lib/state/buyNowCapability.ts` against the real governed
capability record, and shows its actual outcome. Florida has zero verified purchase options, so the honest
outcome is `underReview`:

- Leads with **"LotteryCorner does not sell tickets directly."** before any option.
- Context block: State / Game / Purchase status.
- Three separated groups in fixed order: **Official options** → **Approved partner options** → supporting
  official destination. Each states plainly that nothing is verified yet.
- The compensated-disclosure slot is rendered **even when empty**, so the requirement is visible in review.
- **No provider is invented, no affiliate URL exists, no transaction occurs, no partner is contacted.**

### S-07: Buy Now replaces Where to Play as the primary CTA

`FD-N-03` and LRG-DEC-028 supersede `FD-S-18` here. `Buy Now` is safe as the prominent label precisely
because it opens a governed resolver rather than a destination: the eligibility conditions `FD-S-18` was
protecting are enforced *inside* the resolver, which is where they belong. The official Where-to-Play
destination remains available as a supporting link — demoting it must not mean hiding it.

### Defect found and fixed: internal vocabulary was reaching the reader

The capability record's `note` field was doing double duty as reviewer evidence *and* reader copy, so the
Buy Now surface rendered:

> "This resolves to underReview, never retailOnly (FD-N-10)."

Internal status tokens and a decision id in public UI, which CLAUDE.md §7 forbids. The field is now split:
`note` stays reviewer evidence, `readerNote` carries ordinary player language, and the resolver renders only
`readerNote`. The internal enum is also mapped to plain language before display — `underReview` renders as
**"Still being verified"**, not `UNDERREVIEW`. Tests assert reader copy contains no decision id and no
internal status token, and that the resolver never references `capability.note`.

---

## 8. AI: selective, and disconnected

V0 rendered **20** Explain actions (two per card × ten cards). V1 renders **2**, verified in the DOM:

- Fantasy 5 (the leading native family)
- Powerball (the first multi-state card)

A family needs **both** a declared `aiContextKey` (capability, in config) **and** an explicit `showAi`
grant from the surface. A test asserts a declared context alone can never be sufficient. The single shared
AI surface (S-03) is unchanged, clearly labelled, and connects to no service.

---

## 9. Advertising: baseline preserved

| Check | Result |
|---|---|
| Active placements | **10** — unchanged from the approved Minimum Florida profile |
| Every approved placement accounted for | rendered, or explicitly deferred with a reason |
| AD-S00 below 992 px | **collapsed** — the whole anchor, no mobile reservation before the first result |
| Ad inside a family card or member row | **none** — a test asserts the component imports no ad slot |
| Ad inside the primary result band | **none** |
| Sticky footer ad | present, closable, 41 px, with 52 px document clearance |
| Sticky ad vs sticky Buy Now conflict | impossible — there is no sticky Buy Now |

No slot was removed, merged, renamed, moved, reduced or reordered.

---

## 10. Accessibility

Verified in a live browser, not inferred:

| Requirement | Result |
|---|---|
| One `<main>`, one `<h1>` | ✅ |
| Heading order, no skipped level | ✅ (h1 → h2 ×15 → h3 ×16, no jump) |
| Duplicate DOM ids | **none** (see defect below) |
| Broken in-page anchors | **none** (see defect below) |
| Reflow at 320 px, no horizontal page scroll | ✅ `scrollWidth == clientWidth == 320` |
| Wide tables scroll in their own container | ✅ the only overflowing elements are inside `.lcs-tablewrap` |
| Touch targets ≥ 44 px | ✅ after fixing two 24 px links in the multi-state strip |
| Resolver `role="dialog"`, `aria-modal`, `aria-labelledby` resolving to a real element | ✅ |
| Focus moves into the dialog on open | ✅ lands on Close |
| `Tab` contained while open | ✅ |
| `Escape` closes and focus returns to the exact trigger | ✅ verified: focus restored to the `Fantasy 5` button |
| Special/add-on values distinguished without colour | ✅ three signals: visible label, separator rule, squarer shape |
| Reduced motion | ✅ honoured on the resolver |
| Forced colours | ✅ chips and bordered surfaces carry `CanvasText` / `LinkText` borders |

### Two defects found and fixed

1. **Duplicate DOM id.** S-02 emitted `id="latest-results"` on both the `<section>` (its governed fragment)
   and its `<h2>` (the heading id) — invalid HTML, and ambiguous for `aria-labelledby`, fragment navigation
   and skip links alike. `SectionShell` now falls back to the derived heading id whenever `headingId` would
   collide with `entry.fragment`. The fragment belongs to the section.
2. **Dead in-page anchor.** The content manifest linked `#state-games`, which matched no element — S-06's
   governed fragment is `games`. A dead anchor is a broken control (`FD-S-08`). A test now collects every
   declared id from the section components and asserts every manifest in-page destination resolves.

### Design tokens, not new colours

Every colour in the new stylesheet is an existing token from the design-token block, whose contrast ratios
are already recorded. No new colour and **no raw hex** was introduced — a fresh hex value would carry no
verified contrast. The `Buy Now` hover also changed from a `brightness()` filter to the
`--color-action-primary-hover` token, because a filter would dim the label too and drop the recorded
6.70:1 contrast to an unverified value.

---

## 11. Verification gaps closed

`Pick 2` and `Pick 4` were `underReview` in LRG-STATE-029. Both were verified directly against the official
Florida Lottery game pages in this task:

| Game | Source | Confirmed |
|---|---|---|
| Pick 2 | `floridalottery.com/games/draw-games/pick-2` (accessed 2026-07-29) | "two digits"; 1:30 p.m. and 9:45 p.m. ET; 13-minute cutoff; Fireball replacement mechanic |
| Pick 4 | `floridalottery.com/games/draw-games/pick-4` (accessed 2026-07-29) | "four digits"; "MID for the midday drawing at 1:30 p.m. ET, EVE for the evening drawing at 9:45 p.m., ET"; 10-minute cutoff; Fireball replacement mechanic |

Both promoted to `verifiedOfficial`. **Blocking publication-gate findings dropped from 9 to 3.** The
remaining findings all name the retired pre-2025 Mega Millions format, which is the correct outcome: a
historical format nobody has re-verified must not gate-pass silently.

The evening draw time is now verified at **9:45 PM ET for all four Pick games**, confirming that
`game.csv`'s 7:57 PM is stale and that the staleness is Pick-specific (Fantasy 5 agrees with the export).

---

## 12. Reuse decisions

| Artefact | Decision |
|---|---|
| `lib/state/gameFamilyPresentation.ts` | **REPLACE** (new generic presentation model) |
| `lib/state/floridaFamilyConfig.ts` | **REPLACE** (new data) |
| `lib/state/floridaFamilyBuilder.ts` | **REPLACE** (new adapter) |
| `components/.../StateFamilySurface.tsx` | **REPLACE** (supersedes `StateFamilyResults.tsx` in S-02) |
| `components/.../StateFamilyResults.tsx` | **KEEP AS REFERENCE** — V0 composition, no longer mounted, not deleted |
| `StateBuyNowResolver.tsx`, `StateBuyNowButton.tsx` | **REPLACE** (new) |
| `lib/state/buyNowCapability.ts` | **REFACTOR** — `note` / `readerNote` split |
| `lib/state/floridaFormatRegistry.ts` | **REFACTOR** — Pick 2 / Pick 4 promoted with sources |
| `lib/state/statePreviewModel.ts` | **REFACTOR** — exposes `familySurfaces` |
| `sections/StateCommon.tsx` | **REFACTOR** — heading-id collision guard |
| `sections/StateResultSections.tsx` (S-06) | **REFACTOR** — one row per family |
| `sections/StateUtilitySections.tsx` (S-01, S-07) | **REFACTOR** — chip row; Buy Now primary |
| `lib/state/floridaContentManifest.ts` | **REFACTOR** — dead anchor fixed |
| Ad inventory, reservation, campaign framework, SEO helpers, `cleanCopy`, data-provider seam | **KEEP** |
| Home shell, Home CSS, Home components | **KEEP** — untouched, proven below |
| Game logo registry | **KEEP** — reused unchanged |

### Visual identity

`visualIdentity` is set **only** where a positively verified brand asset exists: Powerball and Mega
Millions. Every Florida-native family deliberately carries none and renders a **neutral lettered mark**
(`F5`, `P3`, `FL`, `JTP`, `CP`) — visibly typographic, never logo-like, always beside the visible family
name. A wrong or invented brand mark on a lottery game is worse than no mark (LRG-UI-011 §8).

---

## 13. Home non-regression

Proven two ways:

1. **No Home file was touched.** `git diff --name-only` shows no change under `app/page.tsx`,
   `components/home/`, `lib/preview/` or `app/layout.tsx`.
2. **`app/globals.css` is a pure append.** The single diff hunk is `@@ -2042,0 +2043,293 @@` — 293 lines
   added at the end, **zero of the 2,042 existing lines modified or removed**. Every added rule is
   `lcs-`-prefixed and State-owned.

---

## 14. Tests

`npm test` — **192 tests, 192 pass, 0 fail** (35 added by this task).

Coverage added: member ids claimed exactly once and none lost · production ids unrewritten · 19 rows across
10 families · Cash Pop is one family of five · Double Play is not a member row · configured order survives a
newer later result · Cash Pop dayparts survive a shuffled feed · the component contains no `.sort(` ·
differing member dates · an absent result renders as a gap not a borrowed sibling · an open status renders
alongside the verified result · no hardcoded ball values · multi-state can never lead · selection ignores
prize value · layout derives from member count · no Florida name in component code · no Buy Now or Explain
in a member row · exactly one resolver mount · the entry button carries no URL · Florida resolves
`underReview` with zero options and no invented provider · no partner host anywhere · disclaimer precedes
options · no internal status token or decision id in reader copy · no sticky Buy Now · AI is selective and
double-gated · ad baseline unchanged with every placement accounted for · no ad in the family surface ·
fragment/heading id collision guard · every manifest in-page destination resolves.

Three pre-existing test expectations were legitimately inverted by this task and updated with the rationale
recorded inline: the whole-registry publication gate now blocks only on the historical Mega Millions format;
Pick 2 and Pick 4 must **not** block; `resolvePreviewPlacements` returns `{active, deferred}`.

---

## 15. Founder review captures

Stored **outside the repository** at
`<session-scratchpad>/lrg-state-030-captures/` (not committed, per the task):

| File | View |
|---|---|
| `01-mobile-375-first-screen.png` | 375 × 812 — first screen; AD-S00 collapsed; Fantasy 5 card begins above the fold |
| `04-mobile-375-results-block.png` | 375 × 3600 — full S-02: primary card, task row, multi-state strip, native families, View all |
| `02-desktop-1440-first-screen.png` | 1440 × 900 — first screen with AD-S00 rendered |
| `03-desktop-1440-results-block.png` | 1440 × 3200 — full S-02 desktop |
| `07-desktop-results-anchor.png` | 1440 × 1400 — featured pair and the two-column native grid |
| `05-mobile-320-reflow.png` | 320 × 900 — reflow check |
| `06-desktop-200pct-zoom-equivalent.png` | 640 × 900 — 200 % zoom equivalent at 1280 |

**Interaction states were verified live in the browser rather than captured to file** (the review browser
returns images to the session but cannot write files, and the headless capture path cannot drive input):
Buy Now resolver open at 375 px and at 1440 px · focus landing on Close · `Tab` containment · `Escape`
closing with focus restored to the exact triggering button · Pick 2 / Pick 3 families at 320 px with the
Fireball add-on group · the `View all` disclosure expanded. Each is reported with its measured result in
§7 and §10 above.

---

## 16. Known limitations

1. **`DS-37` / `OPEN-ST-06` remain OPEN.** This is a draft for review; founder approval of desktop and
   mobile is still required. Shell approval is not styling approval.
2. **No design system yet.** The stylesheet uses existing tokens but the token set itself, the type scale
   and the breakpoint system are not an approved design system. Section density and final styling are
   provisional.
3. **The neutral lettered mark is a placeholder pattern**, not an approved visual identity treatment.
4. **`public/game-logos/lotto-america.webp` is very likely the correct Florida Lotto mark.** LRG-UI-010
   mis-mapped it to Lotto America; LRG-UI-011 disproved that and recorded that the artwork reads
   "FLORIDA LOTTO … with Double Play". Re-mapping it is a **founder decision** and was NOT done here.
5. **Powerball and Mega Millions trademark clearance is still open** (recorded in the logo manifest). This
   task extends their use from the guarded Home preview to the guarded State preview; both are `noindex`
   and not public.
6. **Prize labels are provisional.** Cash Pop's prize is stake-dependent (5×–250× a $1/$2/$5/$10 stake) and
   is therefore shown with **no** prize summary rather than a misleading single figure. Other labels
   ("Est. annuitized jackpot", "Advertised jackpot", "Est. top prize", "Top prize") come from the format
   registry's prize kinds and have not been founder-reviewed as copy.
7. **`FD-N-01`'s inline cap is implemented as 4 native families**, with the remainder behind a
   server-rendered `<details>`. The exact cap and the disclosure control's label are provisional.
8. **Pre-existing, out of scope:** with `LC_STATE_PREVIEW=true` the `lcs-doc-clearance` body class and its
   sticky-ad clearance padding are applied by `app/layout.tsx` to **every** route, including Home, which has
   no State sticky ad. This predates this task (`app/layout.tsx` is untouched here) and only occurs when the
   preview flag is on, so it never reaches production. Fixing it needs its own task.
9. **Result-format coverage is still incomplete** beyond the verified Florida set, and the retired pre-2025
   Mega Millions format remains `underReview`.

---

## 17. Founder decisions requested

1. **Approve or revise the game-family surface** as the State-page result presentation (`DS-37`).
2. **Re-map `lotto-america.webp` to Florida Lotto?** The evidence says the artwork is Florida Lotto.
3. **Confirm the `FD-N-01` inline cap of 4** native families before progressive disclosure.
4. **Approve the prize-summary labels** as public copy.
5. **`Buy Now` label prominence on a page where nothing is purchasable yet.** The resolver is honest about
   `underReview`, but a prominent `Buy Now` that resolves to "still being verified" every time is a
   product-tone decision, not an engineering one.
6. **Powerball / Mega Millions trademark clearance** for continued use, now on two guarded previews.

---

# LRG-STATE-031 — Founder Visual Restructure

**Produced by:** Task **LRG-STATE-031**
**Date:** July 30, 2026
**Baseline:** `909fbf3` (working tree clean; `origin/main` at the same commit with identical content)
**Status:** **PROTOTYPE V2 IMPLEMENTED — awaiting founder desktop and mobile review. `DS-37` / `OPEN-ST-06` remain OPEN.**

**Not production.** Guarded by `LC_STATE_PREVIEW=true`, `noindex`, no GAM, no partner script, no AI service,
no commerce transaction.

---

## 1. Rejected V1 visual issues, and what each one actually was

V1 passed every technical test and failed founder visual review. Each rejection had a *structural* cause, so
each fix is structural rather than cosmetic.

| Founder finding | Actual cause | Fix |
|---|---|---|
| Family members read as separate mini cards | Every family was a bordered card, ten of them in a two-column desktop grid; and member rows were flex lines whose columns did not align, so each row ended in a different place | One full-width panel per family with a single border; member rows on a shared four-column grid; hairline separators, never row borders |
| No discoverable AI experience | The module was present and *invisible* — an unstyled paragraph plus small grey chips, identical in weight to every other section | Its own accented panel and heading marker; four full-width pressable questions; three more disclosed |
| Excessively narrow desktop content column | The State page used Home's 1,280 px container; inside the rail grid that left ~884 px for results | A State-owned canvas token, provisionally 1,440 px — the content column measures **1,005 px** beside a 300 px rail |
| Advertisements dominate the visual rhythm | Full production reservations (280 px mobile, up to 600 px desktop) at ten anchors | Compact review mode is the default, visibly labelled; production mode remains available |
| Fragmented lower-page sections | Eighteen individually-bordered sections with no hierarchy; four supporting tables measured 1,600 / 1,077 / 1,043 / 908 px on a 390 px viewport | Four visual bands; the four heavy tables collapse on mobile and stay open on desktop |
| Small typography, weak State identity | Metadata on the DS-09 16 px floor; the header said nothing before its words did | Body 16/17 px, balls 34/38 px, an identity eyebrow line with the state code, operator and timezone |
| Placeholder letter marks | `F5` / `P3` / `JTP` tiles read as broken assets | Verified assets where they exist; otherwise **one** consistent neutral mark, disclosed once |
| Repeated small Buy Now buttons | Fourteen identical filled buttons, so nothing was primary | A `primary` / `quiet` hierarchy: five prominent, eight quiet |

**Measured outcome on a 390 px viewport:** document height **15,545 px → 11,448 px** (−26 %), with the
results band at **43 %** of the page. On desktop the whole page is **6,951 px**.

---

## 2. Online behaviour references

Both reference URLs were **unreachable from this environment** — `lotterypost.com` returned HTTP 403 and
`lotteryusa.com` refused the connection. The task's own stated lessons were used instead, and are recorded
here as the actual input:

| Reference | Lesson applied | Where |
|---|---|---|
| Lottery Post FL Pick 3 | One Pick 3 identity; Midday and Evening grouped beneath it; **each member shows its own date, result, Fireball and next-draw context** | The next-draw context was the new one — every member row now carries its own published draw days and time |
| Lottery USA Florida | Comprehensive coverage, clear ball presentation, complete state/game navigation | All 19 draws remain visible; balls enlarged; the directory kept complete |
| Lottery USA Florida Lotto | Main result and Double Play under one game identity | Already true from LRG-STATE-029; verified again in V2 |

**Not copied:** no competitor layout, wording, CSS, markup or branding. The explicitly rejected pattern —
separate equal-weight Midday/Evening entries — is what this task removed.

The next-draw context is the **verified published schedule**, not a computed next-draw date. The feed is 20
days old, and arithmetic against a stale result set would mislead.

---

## 3. Game-family row design

```
Pick 3                                          History   Ask AI   Buy Now
─────────────────────────────────────────────────────────────────────────────
MIDDAY     Thu 07/09/2026      3  7  8      │ FIREBALL 9
           Daily · 1:30 PM ET
─────────────────────────────────────────────────────────────────────────────
EVENING    Wed 07/08/2026      5  6  9      │ FIREBALL 4
           Daily · 9:45 PM ET
```

One panel · one border · one mark · one title · one header · one History · one Buy Now · at most one AI
action. Member rows carry **no border and no radius of their own** — a test asserts both, because that is the
mechanical difference between a panel and a grid of tiles.

Each row keeps its own game id, configured position, variant label, draw date, result, add-on, status,
schedule and source. Nothing is inherited from a sibling.

**Vocabulary:** member game · game variant · variant label. Never "draw period".

### Responsive behaviour

- **Mobile:** variant label, then date + schedule, then numbers on their own full-width line, then add-on and
  status. No horizontal scrolling at 320 px or 390 px.
- **Desktop:** four aligned columns — `112px · minmax(96px,180px) · minmax(0,max-content) · minmax(0,1fr)`.
  The alignment down the whole panel is what makes it read as one surface.

Two clipping defects were found and fixed by measuring, not by eye:

1. `max-content` on the numbers column **refuses to shrink**, so inside the ~318 px half-width featured panel
   Powerball's fifth ball fell outside the panel. `minmax(0, max-content)` fixes it without a second
   structural breakpoint, which `DS-20` / `FD-S-24` would forbid.
2. `.lcs-mballs` had no `flex-wrap`, so a five-ball group was one unwrappable line. **A clipped result is the
   worst possible failure on this page**, so `flex-wrap` here is load-bearing, not cosmetic.

### Applied consistently

Pick 2 · Pick 3 · Pick 4 · Pick 5 · Fantasy 5 (2 rows each) · Cash Pop (**5 rows, one panel**).
Powerball and Florida Lotto keep Double Play as a family-level **secondary result**, never a member row.
EZmatch and Combo appear nowhere — they are purchase-time add-ons, not drawn results.

`memberLayout()` now distinguishes only "one member" (no label column) from "several" (label column). Rows
never become cards at any count, which is the point.

---

## 4. Mobile results experience

Document order below 992 px:

```
S-01  identity · freshness · 4 shortcut chips
AD-S00                          <- collapses entirely below 992 px
S-02  >>> FIRST VERIFIED NATIVE FAMILY (Fantasy 5)
      task row: Buy Now · Check my ticket · How to claim · Ask Florida AI
      multi-state compact strip (one Buy Now for the pair)
      Florida jackpot games · Florida daily games (full-width panels)
      Show all Florida games (2 more)
      temporary-mark note, said once
S-03  AI module   S-04 upcoming draws   S-05 ticket check
… bands 2, 3, 4
```

The first result's numbers are **fully visible on the first screen at 390 × 844**. Getting there needed three
copy compactions, each of which removes redundancy rather than information:

- The guarded-preview banner was 77 px for one sentence → one line.
- `"Results last updated 2026-07-09 (ET)."` wrapped to two lines and pushed the stale badge to a third; the
  timezone is already stated in the identity line, so it became `"Updated 2026-07-09"`. The exact date
  remains and `data-last-updated` keeps the full value.
- The H1 was `"Latest Florida Lottery Results, Winning Numbers and Jackpots"` — three lines at 390 px, which
  §6 rules out. Now `"Florida Lottery Results and Winning Numbers"`: still unique, descriptive and
  keyword-complete, at two lines.

**No advertisement precedes the first verified result on mobile.** AD-S00 is desktop-only in this profile and
its whole anchor wrapper collapses below 992 px.

---

## 5. Desktop layout

| Measurement at 1440 px | Value |
|---|---|
| State canvas max width (**provisional**) | 1,440 px |
| Content column beside the rail | **1,005 px** |
| Rail (governed, unchanged) | 300 px |
| Primary family panel | 1,345 px |
| Horizontal page scroll | none |

The State page has its **own** width token. Home's founder-approved `--layout-content-max: 1280px` is
untouched, and a test asserts the State region never redefines it.

**1,440 px is provisional and offered for review, not decided.** It was chosen as the smallest width at which
a Cash Pop panel and the 300 px rail coexist without the rail dominating. The width decision is **not**
closed.

A layout defect was found and fixed here too: the family header was a four-column grid, and inside the
half-width featured pair the tracks could not fit — the Powerball logo, its title and its `$435,000,000` all
drew in the same place. It is now flex with `flex-wrap` and `margin-inline-start: auto` on the actions, which
gives the same single line when there is room and wraps cleanly when there is not.

---

## 6. AI visibility

The module now has its own identity: a teal accent marker on the heading, a 2 px `--color-ai` border, a
one-line value statement, and four full-width pressable questions with three more behind
**More questions (3)**.

Seven prompts, of which two are **extensions to `FD-X-08`'s approved five**, added on this task's authority
(§8 names them) and recorded rather than absorbed silently:

- *"Why do Midday and Evening show different dates?"* — the single most likely question the family-panel model
  provokes. Grouping variants under one identity is right, and it makes differing dates newly visible; a
  reader who cannot get that explained will read it as a bug.
- *"Explain Buy Now options"* — Florida's purchase picture is unverified, so explaining what Buy Now does is
  itself a useful answer.

Unchanged: **one** shared answer surface, one AI section, contextual entry from selected family panels, a
clearly labelled not-connected state, and **no fabricated answer**. Verified live: a family panel's `Ask AI`
selected the prompt, set its pressed state, moved focus into the shared panel, and listed the grounding
sources — with no answer invented.

One more copy leak was fixed here: the panel printed
`"Deterministic context already available: results last updated 2026-07-09T14:01:45-04:00"` — an engineering
word and a raw ISO timestamp in reader-facing copy. The machine-readable value moved to an attribute.

---

## 7. Buy Now hierarchy

| Placement | Variant | Count |
|---|---|---|
| State task row, after the first verified result | primary | 1 |
| Multi-state mobile strip (one for the pair, not one each) | primary | 1 |
| Powerball and Mega Millions desktop features | primary | 2 |
| S-07 Where to play | primary | 1 |
| Family panels | **quiet** | 8 |

**13 entries, of which 5 are prominent.** V1 had 14 identical filled buttons, so nothing was primary.

`quiet` is hierarchy, never disablement: same size, same 44 px target, same real behaviour, opening the same
shared resolver — it simply does not shout. A test asserts it carries no `disabled` and no `min-height`
override.

**Interpretation recorded.** §1 specifies a family panel containing a Buy Now; §9 asks to reduce visual
repetition. Deleting the action from eight of ten games would have contradicted §1 and made a game
unpurchasable from its own panel, so the repetition was solved by emphasis instead. If the founder meant
*fewer* rather than *quieter*, `commerce="none"` already exists on `FamilyCard` and it is a one-line change.

The shared resolver is unchanged in substance: non-transactional, official-first, disclosure-ready, no
invented provider, no affiliate URL. Its reader copy now says **"Still being verified"** and *"We are still
checking how tickets can be bought in Florida"* — no internal words.

---

## 8. Lower-page visual grouping

Four bands, **visual only**. Governed order, section ids, headings, fragments and semantics are unchanged.

| Band | Sections | Desktop |
|---|---|---|
| *(no heading — results must not compete)* | S-01 · AD-S00 · S-02 · S-03 · AD-S01 · S-04 · S-05 | 1 column |
| Playing, buying and getting help | S-06 · AD-S02 · S-07 · S-08 · S-08A | 2 columns |
| Updates, history and community | S-09 · S-10 · AD-S03 · S-11 · S-12 · S-13 · S-14 · S-15 · S-16 | 2 columns |
| Where this comes from | S-17 · S-18 · AD-S04 | 2 columns |

Three guards make "visual only" a proven claim rather than an assertion:

- `assertBandMembershipUnique` — no section in two bands.
- `assertEverySectionBanded` — no gaps. This one was written *because of* a real defect: S-11/S-12/S-13 were
  initially unbanded, which split the third band into two runs and produced two headings and a
  **duplicate DOM id**.
- `assertBandsPreserveOrder` — concatenating the runs must reproduce the governed order exactly, element for
  element. A visual grouping that could reorder sections would be a governance breach dressed as styling.

### Reducing fragmentation

A shared `MobileDetail` primitive collapses four heavy supporting sections on mobile and leaves them open on
desktop: **S-04** schedule, **S-06** portfolio, **S-08A** essentials, **S-18** directory. One set of markup at
both viewports, in the server HTML and crawlable at both, working with JavaScript disabled.

**Never collapsed:** results, corrections, claim guidance, the AI answer surface. The reason the reader
arrived is never something they must open — a test asserts S-02 and the AI surface contain no `MobileDetail`.

S-10's destination list became a real grouped link list with 44 px targets: those are navigation, so the
WCAG 2.5.8 inline exception does not apply to them.

---

## 9. Reviewer notation removed from the reader's view

A systematic defect, found by reading the rendered page rather than the code. The "Currently unavailable"
boxes and the essentials table rendered the manifest's `source` field — which is **reviewer evidence**, and
CLAUDE.md §14 requires it to cite exactly where a fact came from. Rendered verbatim it printed:

> `[O2] official Winner's Guide` · `NOTE: this is the operator's official page…` ·
> `FD-X-02 moves tax detail to a dedicated guide.` · `FD-X-11: this resolves to underReview, NEVER to
> retailOnly.` · `the fixture carries no anonymity block`

This is the same class of defect LRG-STATE-030 fixed inside the Buy Now resolver by splitting `note` from
`readerNote` — found in a second place, so it is fixed once, in `lib/state/stateReaderCopy.ts`.

It removes reviewer notation and **never** facts: bracketed source tokens, a leading `NOTE:`, and whole
sentences that name a decision id, an internal status enum, or repository vocabulary. A sentence stating a
fact keeps its exact wording. A citation label that cleans down to a broken fragment
(`"official Winner's Guide."`) yields the honest fallback instead, because a fragment misinforms where the
fallback does not.

**The underlying provenance data is unchanged** — a test asserts the manifest still carries its full
citation. Cleaning happens on the way to the screen only.

Rendered result, verified: **zero** occurrences of `[O#]`, `NOTE:`, `FD-*`, `DS-*`, `underReview`,
`retailOnly` or `fixture` in the page text.

---

## 10. Advertising review modes

| | compact (default) | production |
|---|---|---|
| Anchor position | unchanged | unchanged |
| Slot identity, GAM path, div id | unchanged | unchanged |
| Reserved heights | clamped to ≤ 40 mobile / ≤ 56 desktop | exact recorded geometry |
| Visible marker | **`· review size · reserves 50/90px`** | none |
| `data-reserved-*` in the DOM | real production values | real production values |

Compact **only ever clamps downward** (`Math.min`), so it can never exceed production, and it says so on the
slot — it cannot be mistaken for real reservation behaviour. The real geometry stays in the DOM in both
modes, so an audit can read it either way.

Verified across both builds: **10 slots, one profile, `assertStateAdBaseline()` passing, no slot added,
removed, moved, renamed or remapped.** Home's advertising is untouched.

Production geometry confirmed from the DOM: `sp_side_mpu_pos2` 280/600, `sp_side_skyscraper_pos2` 280/600,
`sp_side_mpu_pos4` 280/250, the leaderboards 280/90 and 50/90.

---

## 11. Accessibility

Measured in a live browser at 320, 390, 992/1010 and 1440 px:

| Check | Result |
|---|---|
| One `<main>`, one `<h1>` | ✅ |
| Heading order, no skipped level | ✅ |
| Duplicate DOM ids | **none** at any width |
| Family title / row label association | ✅ `role="table"` + `rowheader` per member row, with visually-hidden column headers |
| Draw date announced with its member game | ✅ the date is in the row whose `rowheader` is the variant label |
| Ball accessible names | ✅ `"Powerball 18"`, `"Mega Ball 12"` |
| Fireball text-labelled | ✅ 8 visible `FIREBALL` labels, plus a separator rule and a squarer shape — three signals, no colour dependence |
| Clipped result values | **none** at any width |
| Horizontal page scroll | **none**; only `.lcs-tablewrap` / `.lcp-scroll-x` scroll internally |
| Targets ≥ 44 px | ✅ all non-inline controls; remaining small ones are inline links inside `<p>`/`<li>`/`<th>` (WCAG 2.5.8 inline exception) |
| Disabled controls | **0** |
| Buy Now focus | ✅ focus moves to Close, `Tab` contained, `Escape` closes and restores focus to the exact trigger |
| AI focus | ✅ contextual action moves focus into the shared panel, with a visible ring |
| Reduced motion | ✅ |
| Forced colours | ✅ panels, chips, AI module, sheet and prompts carry `CanvasText` / `LinkText` / `ButtonText` borders |
| Sticky obstruction | ✅ document clearance derived from the reserved sticky height; no sticky Buy Now, so only one sticky layer exists |

---

## 12. Game identity

`resolveGameIdentity()` composes the shared logo registry — which is **not** edited, being outside this
task's paths — with what this task confirmed for itself.

**Florida Lotto asset: content confirmed, evidence recorded.**
`public/game-logos/lotto-america.webp` carries a misleading filename. LRG-UI-010 mapped it to Lotto America
from the filename alone; LRG-UI-011 disproved that and left re-mapping as a founder decision. This task
**confirmed the content directly**: the asset was decoded to PNG and viewed on 2026-07-30. The artwork reads
**FLORIDA LOTTO** — the word FLORIDA above LOTTO with the Lotto "X" glyph — over a pink banner reading
**"with Double Play"**. It is unambiguously the Florida Lotto mark. `florida-lotto` therefore maps to that
path. **The file is not renamed**: the path is public, and renaming a public asset is out of scope here.

Everything without a verified asset renders **one consistent neutral mark** — the same plain ball glyph for
every family, no text, no colour of its own — disclosed once per section:
*"Game marks shown without official artwork are temporary placeholders. Approved game artwork is pending."*
Said once rather than badged onto ten panels, because a disclosure repeated ten times stops being read.

V1's per-family letter tiles are gone entirely; a test asserts no initials are derived anywhere.

**Still open:** Powerball® and Mega Millions® trademark clearance, recorded in the logo manifest as a
founder/legal decision. This task extends their use from one guarded `noindex` preview to a second.

---

## 13. Tests

`npm test` — **242 tests, 242 pass, 0 fail** (50 added by this task). Lint clean, typecheck clean.

Added coverage: one panel / one mark / one title / one header per family · a member row has no border and no
radius · rows align on a shared grid · native families are not a two-column tile grid · Cash Pop is one panel
of five · Double Play is not a member row · no jurisdiction or game name in component code (tightened to
catch the capitalised state name, which this task really did regress on) · rows unsorted and stably ordered ·
differing member dates in the live model · the schedule is verified, not computed · one History per family
pointing at a real destination · the AI section requests its variant and the variant is styled · a value
statement and pressable questions · the extended prompts exist · one shared surface, not connected · no
per-family chatbot · a quiet Buy Now variant that is real and full-size · no Buy Now or AI in a member row ·
one Buy Now per panel and one for the multi-state pair · reviewer notation stripped, facts kept verbatim,
citation labels replaced by the fallback, provenance data not rewritten · band membership is a partition ·
every section banded · banding reproduces the governed order · four bands, four runs · an unbanded section
throws · the results band has no heading · PF-02 order unchanged · both ad modes, compact clamping downward
only, production geometry exact, slot identity identical, compact visibly labelled · no mobile ad before
results · no ad inside a family panel · verified assets, the confirmed Florida Lotto mapping, one neutral
mark, disclosed once · the State width token is its own and Home's is untouched · the rail keeps its governed
width · `MobileDetail` collapses on mobile and opens on desktop from one markup set · results, corrections and
AI are never collapsed.

Two of the new tests were initially wrong in the same way earlier suites have been — asserting on comments
rather than code, and counting an import as a render site. Both were fixed by stripping comments and scoping
to the render region, not by weakening the assertion.

---

## 14. Validation performed

| Command / check | Outcome |
|---|---|
| `git status --short`, `git diff --check`, `git diff --name-status` | clean; every path in scope |
| `npx tsc --noEmit` | clean |
| `npx next lint` | ✔ no warnings or errors |
| `npm test` | 242 / 242 |
| Guard-**on** build (`LC_STATE_PREVIEW=true`) | ✓ 20/20 pages |
| Guard-**off** build (default) | ✓ 20/20 pages; `/fl` renders `StatePageTemplate` with **0** `lcs-` occurrences |
| Production-ad-mode build | ✓; all slots `data-ad-mode="production"`, **0** compact markers |
| PF-02 order validation | `data-section-order` unchanged, all 25 positions, and `DEFAULT_ORDER` still equals the independently transcribed sequence |
| Game-family row validation | 10 panels / 19 rows at every width; production ids unchanged |
| State ad-baseline in production mode | `assertStateAdBaseline()` passes; geometry read from the DOM matches each slot's recorded definition |
| Compact-mode slot-identity validation | same 10 slot keys, GAM paths and div ids in both modes |

### Home non-regression

- **No Home file touched.** `app/page.tsx`, `components/home/`, `lib/preview/` and `app/layout.tsx` are all
  unmodified.
- **`app/globals.css` diff is confined to the State region.** The first **2,044 lines are byte-identical**;
  every hunk begins at line 2045 or later, and every added or removed selector is `lcs-`-prefixed.
- **Guard-off Home contains zero `lcs-` occurrences** — including the `lcs-doc-clearance` body class, which
  only appears when the preview flag is on.

---

## 15. Founder review evidence

Stored **outside the repository** at `<session-scratchpad>/lrg-state-031-captures/`:

| File | View |
|---|---|
| `01-mobile-390-top-and-first-family.png` | 390 × 844 — first screen; AD-S00 collapsed; the first result's numbers fully visible |
| `02-mobile-390-results-band.png` | 390 × 5200 — Pick 3, Cash Pop and every family panel |
| `03-mobile-390-full-page-bands.png` | 390 × 11600 — all four visual bands |
| `14-mobile-390-ai-module.png` | 390 × 3000 — the AI module |
| `04-desktop-992-threshold.png` | 1000 × 1500 — the single structural threshold |
| `05-desktop-1440-compact-ad-top.png` | 1440 × 1000 — compact ad mode |
| `06-desktop-1440-compact-ad-results.png` | 1440 × 3200 — full-width panels and the featured pair |
| `09-desktop-1440-production-ad.png` | 1440 × 1200 — production ad mode |
| `10-mobile-390-production-ad.png` | 390 × 1500 — production ad mode, mobile |
| `07-mobile-320-reflow.png` | 320 × 900 — reflow |
| `08-desktop-200pct-zoom-equivalent.png` | 640 × 900 — 200 % zoom equivalent |
| `11-guard-off-florida-1440.png` | 1440 × 1000 — guard off, existing template |
| `12-home-390.png` · `13-home-1440.png` | Home, unchanged |

**Interaction states were verified live in the browser rather than captured to file** — the review browser
returns images to the session but cannot write them, and the headless capture path cannot drive input. Each
is reported with its measured result above: the Buy Now resolver open at 390 px with reader-language copy,
`Escape` restoring focus to the exact trigger, a family panel's `Ask AI` driving the shared answer surface,
the `Show all` and `More questions` disclosures, and the four `MobileDetail` sections closed on mobile and
open on desktop.

---

## 16. Remaining visual decisions

1. **`DS-37` / `OPEN-ST-06` remain OPEN.** This is a draft for review.
2. **The 1,440 px canvas width is provisional.** Not closed.
3. **The four band groupings and their titles are provisional.** In particular S-11/S-12/S-13 are banded with
   *Updates, history and community* for **contiguity** — they sit between S-10 and S-14 in the governed order,
   and any other assignment splits the band. All three are currently suppressed. A different grouping needs
   the governed order to change, which is not this task's to do.
4. **`FD-N-01`'s inline cap is 5 native families** before disclosure. Provisional.
5. **Re-map `lotto-america.webp`?** Content confirmed as Florida Lotto (§12). Renaming the public asset, and
   whether the mapping stands, are founder calls.
6. **Powerball / Mega Millions trademark clearance** — now spanning two guarded previews.
7. **Prize-summary labels** have not been reviewed as public copy. Cash Pop still shows **no** prize summary,
   because its prize is 5×–250× a variable stake and any single figure would mislead.
8. **Buy Now count.** 13 entries, 5 prominent. If §9 meant *fewer* rather than *quieter*, see §7.
9. **The neutral game mark is a placeholder pattern**, not an approved identity treatment.
10. **No design system yet.** Tokens are reused and no new colour or raw hex was introduced, but the token
    set, type scale and breakpoint system are not themselves approved.
11. **Pre-existing, out of scope:** with the preview flag on, `app/layout.tsx` applies the
    `lcs-doc-clearance` body class to every route. It predates this task, never reaches production, and
    `app/layout.tsx` is outside this task's allowed paths.

---

# LRG-STATE-032 — Top Results Visual Acceptance Reset

**Produced by:** Task **LRG-STATE-032**
**Date:** July 30, 2026
**Baseline:** `4f86670` (working tree clean; `origin/main` at the same commit, identical content)
**Status:** **TOP RESULTS RESET — awaiting founder visual acceptance. `DS-37` / `OPEN-ST-06` remain OPEN.**

**Not production.** Guarded by `LC_STATE_PREVIEW=true`, `noindex`, no GAM, no partner script, no AI service,
no commerce transaction.

**Scope:** the visible top experience only — S-01, S-02, S-03, the AD-S00/S01/S02 compact-review
presentation, the top task actions, and the shared Buy Now and AI surfaces. **S-04 onward was not
redesigned.**

---

## 1. The previous visual rejection, and what actually caused it

The founder's screenshot followed a confirmed commit, a restarted server, a cleared build and a hard refresh.
The problems were therefore real, and reading the close screenshot showed the causes were structural, not
cosmetic:

| Rejection | Actual cause | What was done |
|---|---|---|
| Member games read as individual cards | The panel had a **grey header band over a white row body**. Two surfaces read as two objects — a label bar plus a separate white card, and at screenshot compression, as mini cards. | The whole panel is now ONE continuous surface. Rules are its only internal marks. |
| The family relationship is not obvious | Same cause. | One border, one background, one header, rows separated only by hairlines. |
| Text too small | Balls 38–46 px in a 1,316 px panel, 1.375 rem titles, 0.8125 rem dates. | Balls 40/46 px, titles 1.375/1.625 rem, dates 1.0625 rem, body 16/17 px. |
| AI not visible while scanning | S-02 rendered **seven** native panels plus the multi-state pair, pushing the AI module ~2,500 px down. It was accented and unreachable. | The top stack is capped at the first native family **plus three**. AI now sits at y≈3,400 on mobile and y≈2,383 on desktop, one screen below the last top-stack family. |
| Buy Now as many small repeated buttons | **Nine** in the top area, all the same weight. | One solid button per family, History and Ask AI demoted to text links, and one `hero` State-level CTA after the AI module. Seven Buy Now actions in the visible top experience, of which one is the hero. |
| Empty advertisements dominate | Ten placeholder boxes at 40–56 px with borders and surfaces. | 32 px inline / 48 px rail / 40 px sticky **labelled marker lines** — no box, no surface, one dashed hairline. |
| Powerball / Mega Millions read as unrelated fragments | Two independently bordered cards side by side. | ONE outer block, one heading, two columns divided by a rule, no per-game borders. |
| Does not feel like a daily State destination | The sum of all of the above. | — |

**The V2 markup was hard-replaced, not restyled.** `StateFamilyPanel.tsx` and `StateMultiStateBlock.tsx` are
new components; the old `FamilyCard` / `MultiStateStrip` markup is gone from S-02.

---

## 2. Pick 3 acceptance structure

Pick 3 was built and validated first, then every other family was rendered through the same component from
configuration. There is no per-family markup — one component, three call sites (the leading family, the top
stack, the disclosed remainder).

**Desktop, as rendered at 1440 px:**

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ◉ Pick 3                                        Top prize $500        [ Buy Now ]  │
├────────────────────────────────────────────────────────────────────────────────────┤
│ MIDDAY     Thu 07/09/2026        (3) (7) (8)  │ FIREBALL (9)                       │
│            Daily · 1:30 PM ET                                                      │
│ ·································································································· │
│ EVENING    Wed 07/08/2026        (5) (6) (9)  │ FIREBALL (4)                       │
│            Daily · 9:45 PM ET                                                      │
├────────────────────────────────────────────────────────────────────────────────────┤
│ History                                                                            │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Acceptance requirements, each satisfied and each tested:

- exactly **one** visible outer panel border · one family title · one identity mark · one History · one Buy
  Now · at most one contextual AI action;
- member records are **full-width rows**;
- rows declare `border: 0`, `border-radius: 0`, `box-shadow: none`, `background: none` — a row cannot read as
  a card because it has none of the properties that make something look like one;
- rows carry only a `border-bottom` hairline;
- stable configured order (Midday always above Evening);
- each member keeps **its own** date and result, and the dates legitimately differ.

**Semantics:** a multi-member family is a real `role="table"` with a `rowheader` per member and
visually-hidden column headers, so a screen reader associates each date and result with the correct member
game.

### Two clipping and layout defects found by measuring

1. **Single-member rows squeezed the date.** A one-member family has three row children but the desktop grid
   declared four tracks, so the date landed in the 130 px label column — Florida Lotto's
   `Wed 07/08/2026 · Wed & Sat · 11:00 PM ET` wrapped onto three lines and its six numbers onto two rows. A
   dedicated three-track list for `.lcs-fp__rows:not([role="table"])` fixes it.
2. **The add-on was stranded.** With the add-on column pinned right, a row read as
   `1 3 4 ............ FIREBALL 9` — two unrelated things. The numbers column is now `max-content` and the
   add-on sits immediately after them, matching the accepted structure. Trailing whitespace in a wide panel
   is fine; a stranded add-on is not.

---

## 3. Family-row reuse

Applied through the same component, from data: **Pick 2 · Pick 3 · Pick 4 · Pick 5 · Fantasy 5 (2 rows
each) · Cash Pop (5 rows, one panel)**. Powerball and Florida Lotto keep Double Play as a family-level
secondary result, never a member row. EZmatch and Combo appear nowhere — they are purchase-time add-ons.

Nothing in the panel, the multi-state block or S-02 names a jurisdiction or a game; a test asserts that for
all three files.

---

## 4. Mobile top experience (390 px)

```
compact Florida identity + freshness   (FL · Florida · Florida Lottery · All times ET)
first Florida-native family            (Fantasy 5 — numbers visible on the first screen)
task links                             (Check my ticket · How to claim · Ask Florida AI)
multi-state block                      (Powerball and Mega Millions, one outer block)
three more Florida-native families
View all Florida results (4 more games)
LotteryCorner AI module
one hero State-level Buy Now
```

- **No advertisement precedes the first result.** AD-S00 is desktop-only and its whole anchor collapses below
  992 px.
- No horizontal scrolling; the family panel occupies the full content width.
- Every interactive target is ≥ 44 px.
- Fireball wraps to its own line inside the row at 390 px. That is honest reflow — the alternative was
  shrinking the numbers, which §10 forbids.

Three copy compactions bought the space, none of which removes information: the preview banner to one line,
the game count onto the freshness row, and the H1 to two lines (`Florida Lottery Results and Winning
Numbers`).

---

## 5. Desktop top experience (1440 px)

| Measurement | Value | §11 target |
|---|---|---|
| Page maximum width | **1,380 px** | 1,360–1,400 |
| Primary content column | **988 px** | 960–1,020 |
| Rail | **300 px** | 300 |
| Rail gap | **28 px** | 24–32 |
| Family panel width | 1,316 px | uses the primary width |
| Ball diameter | 46 px | numbers dominate metadata |

Home's `--layout-content-max: 1280px` is untouched; the State page has its own token and a test asserts the
State region never redefines Home's.

A third layout defect was fixed here: the family header was a four-column grid, and inside the half-width
multi-state columns the tracks could not fit — the Powerball logo, its title and its `$435,000,000` all drew
in the same place. The desktop header is now flex with wrapping and `margin-inline-start: auto` on the
action.

---

## 6. Powerball and Mega Millions

ONE outer block, one heading, no per-game borders — the games are divided by a rule, because they are two
parts of one thing. Mobile stacks them inside the same block; desktop shows two related columns.

Each game shows identity (real verified logo), latest result and date, jackpot label and value, next draw
from its own published schedule, Double Play where applicable, one Buy Now, History, and — for the first game
only — one selective Ask AI.

Florida-native results precede this block in the markup on every viewport (`FD-N-02`), and jackpot size never
promotes it.

---

## 7. AI visibility

The module is an accented panel: a 2 px `--color-ai` border on a tinted surface, a teal marker on its
heading, a one-line value statement, and **five** visible full-width pressable questions with two more behind
`More questions (2)`.

The five visible prompts are the ones §7 names:

- Explain these results
- Why do the result dates differ?
- **What does Fireball mean?** — derived from the jurisdiction's real drawn add-on, read from the results the
  page actually renders. Never hardcoded, so it names the correct add-on for any state and disappears where
  none exists (`FD-X-01`). A test asserts the string `Fireball` appears nowhere in the component's code.
- When is the next Florida draw?
- Explain Buy Now options

Unchanged: one shared answer surface, one AI section, contextual entry from the leading family and the
multi-state block, a clearly labelled not-connected state, and **no fabricated answer**. It is never inside an
accordion.

One further copy leak was fixed: the panel printed
`Deterministic context already available: results last updated 2026-07-09T14:01:45-04:00` — an engineering
word and a raw ISO timestamp. The machine-readable value moved to an attribute.

---

## 8. Buy Now hierarchy

| Placement | Variant | Visible count in the top experience |
|---|---|---|
| State-level, after the AI module | **hero** (52 px) | 1 |
| Per visible game family | primary | 4 |
| Per multi-state game | primary | 2 |

**Seven visible, one of which is unmistakably primary.** History and Ask AI became text links, so each family
carries exactly one button. No Buy Now on any member row, and never two inside one family.

The four families behind `View all Florida results` each carry one Buy Now, which appears only when the
reader opens the disclosure.

The shared resolver is unchanged: non-transactional, official-first, disclosure-ready, no invented provider,
no affiliate URL. Reader-facing language stays natural — **"Still being verified"**, *"We are still checking
how tickets can be bought in Florida"*, and *"We show you where to play — LotteryCorner never sells
tickets."* Tests assert that `underReview`, `retailOnly` and any `FD-*` / `DS-*` id appear nowhere in the
top-experience code.

---

## 9. Compact advertising review

| Role | Compact ceiling | Measured | Production reservation preserved |
|---|---|---|---|
| Inline | **32 px** | 32 px | 50/90 – 280/90 |
| Rail | **48 px** | 48 px | 280/250 – 280/600 |
| Sticky | **40 px** | 40 px (41 px with its border) | 50/90 |

Each marker is a **labelled line**: no surface, no fill, one dashed hairline, and text reading
`Ad slot · sp_top_billboard · reserves 50/90px in production`. It names itself as a review marker and states
the geometry it stands in for, so compact can never be mistaken for production behaviour.

Compact **only ever clamps downward**. Rail needs its own ceiling because its production geometry is by far
the tallest — clamping a 600 px skyscraper to the inline ceiling would misrepresent it as a strip.

**A slot's role is read from the approved profile, not passed in by the caller.** That detail matters:
`app/layout.tsx` computes the document's sticky clearance through `reservedHeights` and is out of scope for
this task. Had the ceiling depended on an argument, that untouched caller would have silently received the
32 px inline ceiling for a 40 px sticky bar — reintroducing the LRG-STATE-022 defect where the footer sat
underneath the fixed bar.

**Production mode is untouched**: verified from a separate build, all slots `data-ad-mode="production"`, zero
compact markers, full reserved boxes with the plain `ADVERTISEMENT` label, and `assertStateAdBaseline()`
passing. **No slot was added, removed, moved, renamed or remapped**, and the real production geometry stays
in the DOM in both modes for audit.

---

## 10. Close visual evidence

Stored **outside the repository** at `<session-scratchpad>/lrg-state-032/`:

| File | View |
|---|---|
| `01-mobile-390-identity-and-first-family.png` | identity, freshness, first native family with its numbers on the first screen |
| `02-mobile-390-pick3-family.png` | the full Pick 3 panel, plus View all and the AI heading |
| `03-mobile-390-multistate-block.png` | Powerball and Mega Millions inside one block |
| `04-mobile-390-ai-module.png` | the AI module and the hero State-level Buy Now |
| `05-mobile-390-buynow-resolver.png` | the resolver open, in reader language |
| `06-desktop-1440-top-through-ai.png` | top of page through the multi-state block |
| `07-desktop-1440-pick3-full-width.png` | the full-width Pick 3 panel |
| `08-desktop-1440-multistate-block.png` | the shared multi-state block, two columns |
| `09-desktop-1440-compact-ad-markers.png` | compact ad-review markers in place |
| `10-desktop-1440-production-ad-mode.png` | production ad mode, full reserved geometry |

### A measurement problem worth recording

Every "390 px" headless capture in **this and the previous two tasks was actually laid out at 500 px**. This
Chrome build enforces a ~500 px minimum window width, so `--window-size=390,H` silently produced a 500 px
layout viewport that was then cropped to 390 — which is why earlier mobile evidence appeared clipped at the
right edge, and why it disagreed with the live browser.

Captures now go through the DevTools protocol (`Emulation.setDeviceMetricsOverride`), where 390 means 390.
The helper is `shot-cdp2.mjs`, kept beside the screenshots outside the repository; it uses Node's built-in
`WebSocket` and installs nothing. **Every capture listed above is a true-viewport capture and matches the
live browser.**

---

## 11. Tests

`npm test` — **269 tests, 269 pass, 0 fail** (27 added). Lint clean, typecheck clean.

Added, focused on the accepted visual only: one outer panel per family · rows declare no border, radius,
shadow or background · the header is separated by a rule and introduces no background · no member row carries
a card class · one title / mark / History / Buy Now / AI action per family · stable row order and
member-specific dates · every family renders through the same component · the top stack cap · a visible
`View all` still in the server HTML · the multi-state block is one section with no per-game borders · the
first native result precedes it · S-03 follows S-02 and the hero CTA follows S-03 · the AI module's own
border, surface and heading marker · five visible prompts, never collapsed, add-on name derived from data ·
one hero CTA · no Buy Now on a member row · footer actions are links with 44 px targets · no internal token
in top-experience code · compact ceilings 32/48/40 with every slot respecting its role's ceiling · the
compact marker is a line not a box · production geometry unchanged · the sticky clearance still derives from
the sticky ceiling · no ad before the first result · State-owned width tokens only.

Ten LRG-STATE-031 assertions were **retargeted, not deleted**, because the markup they test moved to the two
new components. Five of my own new assertions were initially wrong in the familiar way — matching comments
instead of code, and treating an import statement as a render position — and were fixed by stripping comments
and scoping to the rendered JSX, never by weakening the assertion.

**Visual acceptance does not come from these tests.** A passing assertion never proved the previous visual
was acceptable and does not prove this one is; the screenshots are the evidence.

---

## 12. Validation performed

| Check | Outcome |
|---|---|
| `git status --short`, `git diff --check`, `git diff --name-status` | clean; every path in scope |
| `npx next lint` | ✔ no warnings or errors |
| `npx tsc --noEmit` | clean |
| `npm test` | 269 / 269 |
| Guard-**on** build | ✓ 20/20 pages |
| Guard-**off** build | ✓ 20/20; `/fl` renders `StatePageTemplate` with **0** `lcs-` occurrences |
| Production-ad baseline | ✓ all slots `production`, 0 compact markers, `assertStateAdBaseline()` passes |
| Compact-ad marker validation | ✓ 32 px inline, 48 px rail, 40 px sticky, measured live |
| Visual screenshot evidence | ✓ 10 true-viewport captures |

### Home non-regression

- **No Home file touched** — `app/page.tsx`, `components/home/`, `lib/preview/`, `app/layout.tsx` unmodified.
- **`app/globals.css` is a pure append** — a single hunk at line 2692, 352 lines added, **nothing removed**,
  the first 2,692 lines byte-identical, and **no non-`lcs-` selector added or removed**.
- **Guard-off Home contains zero `lcs-` occurrences.**

### A build hazard encountered

A stale `next-server` process kept answering on port 3000 after `pkill -f "next start"` — the process name is
`next-server`, so the pattern never matched it — and served a previous build's prerendered HTML. It briefly
made a correct production-ad build look like it had rendered compact. Worth knowing for the next review:
**verify the served HTML, not just the build log**, and kill by port or by `next-server`.

---

## 13. Remaining founder feedback

1. **`DS-37` / `OPEN-ST-06` remain OPEN.** This is a visual draft awaiting acceptance.
2. **The top-stack cap of three additional families is provisional.** It is the single biggest lever on the
   top experience; raising it pushes the AI module down again.
3. **The 1,380 px canvas is provisional**, chosen inside the §11 range.
4. **The neutral game mark is a placeholder pattern**, not an approved identity treatment. Only Powerball,
   Mega Millions and Florida Lotto have verified artwork.
5. **`lotto-america.webp` still carries a misleading filename.** Its content was confirmed as Florida Lotto
   in LRG-STATE-031; renaming the public asset remains a founder call.
6. **Powerball / Mega Millions trademark clearance** remains open.
7. **Prize-summary labels** have not been reviewed as public copy. Cash Pop still shows no prize summary,
   because its prize is a variable multiple of a variable stake.
8. **Fireball wraps to its own row at 390 px** inside Pick 2/3/4/5. Fitting it on the number line would mean
   shrinking the numbers.
9. **The lower page was deliberately not redesigned** in this task. S-04 onward keeps the LRG-STATE-031 band
   treatment and has not been re-reviewed against this new top-results language.
10. **No design system yet.** Tokens are reused and no new colour or raw hex was introduced, but the token
    set, type scale and breakpoints are not themselves approved.

---

# LRG-STATE-034 — Research-Led Engagement Landing Reset

**Produced by:** Task **LRG-STATE-034**
**Date:** July 30, 2026
**Baseline:** `9b5b61c` (working tree clean; `origin/main` at the same commit, identical tree)
**Status:** **ENGAGEMENT V1 IMPLEMENTED — awaiting founder review. `DS-37` / `OPEN-ST-06` remain OPEN.**
**Runtime marker:** `data-lc-state-experience="engagement-v1"` · visible chip *State Experience Preview · Engagement V1*

**Not production.** `LC_STATE_PREVIEW=true`, `noindex`, no GAM, no partner script, **no live AI, no community
backend, no commerce transaction.**

---

## 1. Why the earlier approach was rejected — the research-to-implementation gap

The previous implementation had every capability the research asks for and **none of the loop it describes**.
AI, discussion, what-changed and Buy Now each existed as one more section in a long stack of equally weighted
modules. A reader who had just checked their numbers was offered nothing, which is precisely the moment the
research says engagement begins.

Measured on the rejected build at 390 px:

| Capability | Where it actually was | What the research asks |
|---|---|---|
| AI module | **4.38 mobile screens** down | contextual, near the results |
| Discussion | one paragraph: "No Florida discussion has been started yet" | a discussion entry from the result itself |
| Community | the same paragraph, ~10 screens down | a landing-page engagement destination |
| What changed | a section near the bottom | inside the engagement journey |
| Engagement after a result | **nothing** | "engagement begins after the immediate job" |

### One correction to the task's framing, recorded rather than absorbed

The task states the loop as six steps. The research and the Constitution both state it as **eight**, in
identical wording:

> check → understand → explore → **save** → **follow** → discuss → return → transact when appropriate

`save` and `follow` are **deferred** for the anonymous launch by `FD-X-09` and `FD-N-04`, which also state
"Do not render disabled Follow or Notify controls." So the six-step loop the task names is exactly the loop
this page can honestly implement today — the two missing steps are missing **by decision, not by omission**.
That is worth recording because a later reader could otherwise mistake their absence for a gap.

Source: `03-docs/00-foundation/research/00B-lottery-player-behavior-engagement-and-ai-experience-research.md`
§1.1 and Constitution §6. (Note the path: 00B is under `research/`, not `authoritative/`.)

---

## 2. Mobile landing hierarchy — measured at all three widths

| Signal | 320 px | 375 px | 390 px | Requirement |
|---|---|---|---|---|
| H1 lines | 2 | 2 | 2 | no three-line H1 |
| First result numbers | 0.93 screens | 0.91 | 0.91 | first useful screen |
| Engagement bar | 1.33 | 1.23 | 1.23 | directly after the result |
| Discuss results | 1.24 | 1.15 | 1.15 | within two screens |
| Buy Now | 0.71 | 0.71 | 0.71 | within two screens |
| **AI module** | **3.00** | **2.99** | **2.95** | **within three screens** |
| Multi-state block | 1.85 | 1.68 | 1.66 | compact, after the native result |
| First advertisement | 3458 px | 3293 px | 3258 px | never before the first result |
| Horizontal scroll | none | none | none | none |
| Body / balls | 16 px / 40 px | 16 / 40 | 16 / 40 | ≥16 px, balls prominent |

Getting AI inside three screens took two measured changes, not guesses:

1. **§1E's "additional family summaries" taken literally.** Three additional families as full panels put AI at
   4.38 screens; as compact summaries, 3.42. `StateFamilySummary.tsx` is the "compact contextual bridge" tier
   of the experience rule — one list, hairline separators, no border per row, numbers still legible, with the
   full panel one tap away under *View all Florida results*.
2. **A genuinely compact multi-state block on mobile.** The full treatment cost ~700 px for the pair. Nothing
   was hidden — jackpot, date, numbers, special ball, Double Play, next draw and Buy Now are all still there,
   tightened. With the summary cap at two, AI lands at 2.95.

At ≤360 px the H1 wrapped to three lines and AI fell to 3.25; a type step-down and tighter rhythm fixed both
without removing anything.

---

## 3. Results experience — the domain model is untouched

Unchanged from LRG-STATE-032, and still tested: every member game keeps its own id, its own latest result, its
own date and its own history relationship. Members render in configured order, never sorted by recency. One
family panel, no bordered member cards. Pick 3 renders exactly the §2 shape.

---

## 4. The immediate engagement bar — the pivot of this task

Directly under the first result, four real actions in the researched order:

| Action | Opens | Carries |
|---|---|---|
| **Ask AI** | the one shared AI surface | the family the reader is looking at |
| **Discuss results** | the one shared discussion surface | state, game, draw date, status, source |
| **Buy Now** | the one shared commerce resolver | state and game |
| **What changed** | `#what-changed` | — |

**`Check Ticket` is deliberately absent.** The task permits it to replace What Changed *only when the
deterministic checker is genuinely functional*; it is not, and `FD-S-08` forbids a control that looks
functional and is not.

On mobile the bar is a 2×2 grid so all four are visible together; Buy Now is the only filled button.

---

## 5. State AI — value visible while disconnected

The old panel showed a not-connected notice and a source list. Honest, and useless for judging the product: a
founder could verify the guardrails and learn nothing about the value.

`lib/state/stateAiPreview.ts` now computes a **deterministic answer from the page's own governed data**,
labelled *AI experience preview — live generation is not connected.* For example, selecting *Why do Midday and
Evening have different dates?* returns:

> They are separate games. Midday and Evening each have their own draw, their own numbers and their own result
> history — they are grouped here under one Fantasy 5 heading because they belong to the same game, not because
> they share a draw. So each row shows the latest result for that particular draw. Right now: Midday:
> Thu 07/09/2026; Evening: Wed 07/08/2026.

The rule that makes this safe: **restating and explaining what this page already publishes is allowed;
anything the page cannot substantiate is not.** No generation, no retrieval, no external fact, no simulated
model voice. Where the data for an answer is absent it says so — a test asserts `previewAnswer` returns `null`
rather than improvising. Each answer also states what it was computed from and what it cannot do.

The five visible prompts are the ones §3 names. *What does Fireball mean?* is **derived from the jurisdiction's
real drawn add-on**, read from the rendered results — a test asserts the string `Fireball` appears nowhere in
the component's code.

### Contextual distribution (§4)

One entry per module, all dispatching at the same surface with context: the AI module itself, the first native
family, the multi-state block, and the engagement bar. Never on a member row — tested.

---

## 6. Discuss results and community

**One shared discussion surface** (`StateDiscussionSurface.tsx`), opened from the engagement bar, the first
result family, or any community area. It carries the real context: state, game, draw date, result status,
source, and a correction note where one genuinely applies.

It is a **working interaction, not a disabled form**: open, type into a real local editor, close, focus
restored, draft discarded. A test asserts the file contains no `fetch`, `sendBeacon`, `localStorage` or
`sessionStorage` — the draft never leaves the browser.

**S-14 became a real module.** `StateCommunity.tsx` shows the high-context areas the research identifies,
derived from the games the state actually offers, each with a genuine cold-start action. Nothing social is
fabricated: a test bans `postCount`, `memberCount`, `activityCount`, `reputation`, `author`, `username` and any
"*N* posts/replies/members/discussions" pattern. The cold start says so plainly.

### The community AI policy has FOUR tiers, not two — corrected in this task

I had implemented a two-way split. 00B §15.2, carried as constitutional text in Constitution §31, defines four:

| Tier | Rule | Applied to |
|---|---|---|
| **A** | a labelled `LotteryCorner Research Note` with sources, after a human posts | daily games, jackpot games, multi-state, result questions |
| **B** | humans first; AI only if a factual question goes unanswered | draw reactions, beginner questions |
| **C** | **moderator-triggered only — no autonomous public answer** | claims and player help (tax, law, anonymity, disputed tickets, distress) |
| **D** | no AI social participation at all | condolences, conflict, celebrations |

Collapsing C into "humans first" understated it materially: these are the questions where a confident wrong
answer does real harm. Each tier has its own visible sentence, and the tier is never communicated by colour
alone. `LotteryCorner Research Note` is the approved label (Constitution §13; 00B §5.4 adds "not 'expert' or a
human name").

**No indexable community route was created** (`FD-N-05`), and **no advertisement hosts the community module**
(`APP-ST-04`/`APP-ST-05`: a generic cold-start message alone does not qualify a section as an ad host).

---

## 7. What changed and return utility

The full module stays at its governed S-09 position — section order is governed and was not moved. What the
engagement journey gained is a **compact return signal** directly under the bar (`StateReturnSignal.tsx`),
which **reads** the same device-only marker and never writes it, so the two cannot disagree about when the
reader was last here.

First visit: *"Return after the next draw to see what changed."* It never fabricates a previous visit. A test
bans `streak`, `you missed`, `hurry`, `last chance`, `so close`, `one number away` and `try again` from all
return copy.

**Follow and Notify remain absent** per `FD-X-09`. The one control that ships is
**"Remember Florida on this device"** — permitted by `FD-N-04`'s session state selection. It is a real toggle
storing one value locally, deletable, with no cross-device promise.

---

## 8. Buy Now

Reduced from **eleven** family-level buttons to **four plus one hero**: the engagement bar, the featured family,
each multi-state game, and the S-07 resolver. Family panels now opt IN to commerce (`commerce?: boolean`,
default false) rather than every panel claiming it.

One shared resolver. Reader-facing language only — a test asserts `underReview`, `retailOnly` and any `FD-*` /
`DS-*` id appear nowhere in the top-experience code. No sticky Buy Now.

---

## 9. Advertising review mode

| Role | Ceiling | Measured |
|---|---|---|
| Inline | **20 px** | 20 px |
| Rail | **24 px** | 24 px |
| Sticky | **36 px**, closable | 36 px |

Each marker is a labelled dashed line naming its slot key and the production reservation it stands in for.
**Production mode verified separately:** all slots `production`, zero compact markers, full reserved geometry,
`assertStateAdBaseline()` passing, no slot added, removed, moved or remapped.

---

## 10. Close visual evidence

Stored **outside the repository** at `<session-scratchpad>/lrg-state-034/`, captured through the DevTools
protocol so 390 px means 390 px:

| # | File | View |
|---|---|---|
| 1 | `01-mobile-identity-and-first-result.png` | identity, freshness, first native result |
| 2 | `02-mobile-engagement-bar.png` | the four actions + return signal |
| 3 | `03-mobile-ai-module.png` | the AI module and its five prompts |
| 3b | `03b-mobile-ai-answer.png` | **the deterministic preview answer** |
| 4 | `04-mobile-discuss-interaction.png` | the discussion surface open |
| 5 | `05-mobile-community-preview.png` | community areas and cold start |
| 6 | `06-mobile-buynow-resolver.png` | the resolver in reader language |
| 7 | `07-mobile-multistate.png` | the compact multi-state block |
| 8 | `08-mobile-what-changed.png` | the return module |
| 9 | `09-desktop-top-through-ai.png` | 1440 px top through the multi-state block |
| 10 | `10-desktop-grouped-families.png` | grouped families and summaries |
| 11 | `11-desktop-community-and-news.png` | community and news destinations |
| 12 | `12-desktop-compact-ad-mode.png` | compact ad markers |
| 13 | `13-desktop-production-ad-mode.png` | production reservations |
| 14 | `14-guard-off-florida-1440.png` | guard-off Florida |
| 15 | `15-home-1440.png` | Home |
| 16 | `16-non-florida-ca-1440.png` | `/ca` |

### Runtime marker scoping, verified

| Route | `engagement-v1` |
|---|---|
| guard-on `/fl` | **present** |
| guard-on `/ca` | absent |
| guard-on `/` (Home) | absent |
| guard-off `/fl` | absent |

---

## 11. Tests

`npm test` — **300 tests, 300 pass, 0 fail** (31 added). Lint clean, typecheck clean.

Added: the engagement-v1 marker and its scoping · four ordered actions with no disabled control · Check Ticket
absent · the bar renders after the result and before multi-state · one event and one mount per shared surface ·
contextual entries dispatch rather than own panels · AI once per module, never on a member row · every named
prompt produces a deterministic answer computed from page data · an answer quotes the published numbers and
dates · no prediction/odds/"as an AI" language anywhere in preview copy · a question without data returns null ·
S-03 precedes S-04 · discussion context carries state/game/draw/status/source · areas derived from the state's
games · four distinct AI tiers with claims at tier C · nothing social fabricated · the editor is real and never
transmits · no community route · What Changed local-only · the return signal reads but never writes · no
streak/urgency/near-miss copy · Remember-on-device is real and Follow/Notify absent · commerce opt-in · no
member-row Buy Now · no internal token in reader-facing code · 20/24/36 ceilings · production geometry and the
baseline guard unchanged · no ad before the first mobile result · community hosts no ad · PF-02 order intact.

Nine prior-task assertions were **updated, not deleted**, each with its reason recorded inline (the ceilings
tightened, the prompt labels changed to the wording this task names, the panel now has two call sites because
additional families are summaries, and the cap moved 3→2 because of the measured mobile budget). Two were my
own bugs — a non-iterable return value and a `disabled` match inside a focus-trap selector string.

---

## 12. Validation

| Check | Outcome |
|---|---|
| `git status --short`, `git diff --check`, `git diff --name-status` | clean; every path in scope |
| lint | ✔ no warnings or errors |
| typecheck | clean |
| focused State tests | 300 / 300 |
| guard-on build | ✓ 20/20 pages |
| guard-off build | ✓ 20/20; `/fl` has **0** `lcs-` occurrences |
| PF-02 section-ID validation | ✓ 16 sections render, governed order byte-identical |
| production-ad baseline | ✓ all `production`, 0 compact markers, guard passes |
| compact-ad markers | ✓ 20 / 24 / 36 measured live |
| close screenshot review | ✓ 17 captures |

**Home:** no Home file touched; `app/globals.css` is a pure append; guard-off Home has zero `lcs-`
occurrences and no marker.

---

## 13. Remaining founder decisions

1. **`DS-37` / `OPEN-ST-06` remain OPEN.**
2. **The two-summary cap is provisional** and is the binding lever on the mobile budget — raising it pushes the
   AI module past three screens again.
3. **Community areas are a proposal.** Eight are derived today; `01 §56` warns "do not open every possible
   category", so the founder may want fewer.
4. **Deterministic AI answers are a preview device, not the product.** When the live service connects, these
   become the grounding, not the output — and the boundary between "restate the page" and "generate" must be
   re-reviewed at that point.
5. **S-14 and S-15 remain far down the page** (community ≈ 10 mobile screens) because section order is
   governed. The engagement bar and task links route to them, but if the founder wants community visible
   earlier, that is a PF-02 order change and needs its own approval.
6. **The extra AI prompt categories** (Buy Now explanation, variant dates) extend `FD-X-08`'s launch five on
   this task's authority; `FD-N-11` v1.1 approves the categories but the count is worth confirming.
7. **Prize labels, the neutral game mark, and the `lotto-america.webp` filename** all remain open from earlier
   tasks.
8. **No design system yet.** Tokens are reused; no new colour or raw hex was introduced.

---

# LRG-STATE-035 — Engagement V1 Runtime Proof and Render-Path Correction

**Produced by:** Task **LRG-STATE-035**
**Date:** July 30, 2026
**Baseline:** `a4de013` (working tree clean; `origin/main` at the same commit, identical tree)
**Status:** **NO WIRING DEFECT FOUND. Runtime cause identified; commit-stamped proof marker and a served-page verifier added.**

---

## 1. Finding, stated plainly

**There is no wiring or render-path defect at `a4de013`.** A clean development server started from
`01-new-ui` with `LC_STATE_PREVIEW=true` serves the complete Engagement V1 experience — verified in the served
HTML and in the browser DOM before any visual review.

The features reported as missing were all present in the page a browser receives:

| Feature | In served HTML | In browser DOM |
|---|---|---|
| `data-lc-state-experience="engagement-v1"` | ✅ | ✅ |
| Engagement action bar | ✅ `data-engagement-bar="true"` | ✅ `display: grid` |
| Ask AI · Discuss results · Buy Now · What changed | ✅ all four | ✅ all four |
| LotteryCorner AI module | ✅ 7 prompts | ✅ |
| Community areas | ✅ 8 areas + cold-start marker | ✅ 8 |
| Compact ad markers | ✅ | ✅ 20 px inline / 36 px sticky |
| Family panels + summaries | ✅ 8 + 2 | ✅ 8 + 2 |
| Buy Now count | — | ✅ 4 primary + 1 hero |

So the founder's screenshot was produced by **something other than this commit's code**. Since no
LotteryCorner process was running when this task began (they were stopped at the end of LRG-STATE-034), the
originating process could not be inspected directly. What can be stated with confidence is which runtime
conditions produce exactly the reported symptom — and both were encountered and recorded during this program of
work.

---

## 2. The two runtime causes, and why they are easy to hit

### Cause 1 — a stale server keeps the port

**After boot, the process command is `next-server`.** It is `next-server` for **both** `next dev` and
`next start` — confirmed directly in this task:

```
PID 27646  command: next-server (v15.5.20)   cwd: /Users/bala/Learning/lc/01-new-ui
```

That process was started with `npm run dev`. So:

- `pkill -f "next start"` does **not** match it;
- `pkill -f "next dev"` does **not** match it either;
- `pkill -f "next"` matches your own shell command line and can look like it worked when it did not.

A surviving process keeps answering on port 3000 from the `.next` it loaded at boot. Rebuilding changes nothing
a browser can see. **This exact failure occurred during LRG-STATE-032**, where a stale `next-server` made a
correct production-ad build render as compact, and it is recorded in that task's entry.

**Kill by port, not by name:**

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN | awk 'NR>1{print $2}' | xargs -r kill -9
```

### Cause 2 — a mixed `.next` directory

Running `next dev` and `next build`/`next start` against the same `.next` can leave it inconsistent. The
observed symptom was a 500 with `Cannot find module './331.js'` and `"buildId":"development"` in the error
payload — also during LRG-STATE-032. **Purge `.next` when switching modes.**

---

## 3. Verified render path for `/fl` with `LC_STATE_PREVIEW=true`

| Step | Resolution |
|---|---|
| Route entry | `app/[state]/page.tsx` |
| Preview eligibility | `resolveStatePreview("fl")` = `isStatePreviewEnabled()` (`process.env.LC_STATE_PREVIEW === "true"`) **AND** `isPreviewJurisdiction("fl")` |
| Selected template | `StatePreview` — **not** `StatePageTemplate`. The old template is the guard-off branch only, and guard-off `/fl` was confirmed to render it with **zero** `lcs-` occurrences |
| Orchestrator | `components/state/preview/StatePreview.tsx` |
| Preview wrapper attributes | `data-lc-state-preview`, `data-lc-state-experience`, `data-lc-state-renderer`, `data-lc-state-preview-commit` |
| S-01 | `sections/StateUtilitySections.tsx` → `SectionS01` |
| S-02 | `sections/StateFamilySurface.tsx` → `SectionS02Families` → `StateFamilyPanel` + `StateFamilySummary` + `StateMultiStateBlock` |
| Engagement actions | `SectionS02Families` → `StateEngagementBar` (imported and rendered, `engagementActions()` from `lib/state/stateEngagement.ts`) |
| S-03 | `sections/StateDraftSections.tsx` → `SectionS03` → `StateAiSurface` |
| Community | `sections/StateCommunity.tsx` → `SectionS14`, imported by the orchestrator from `./sections/StateCommunity` (the old S-14 in `StateLowerSections.tsx` was removed) |
| Shared surfaces | `StateBuyNowResolver`, `StateDiscussionSurface` — one mount each on the preview root |
| Ad review mode | `getStatePreviewAdMode()` → `compact` unless `LC_STATE_PREVIEW_AD_MODE=production` |

A 19-point import-and-render audit confirmed every feature has a real import **and** a real render call — file
existence was not treated as proof.

---

## 4. The commit-stamped proof marker (§5)

The preview root now carries:

```
data-lc-state-experience="engagement-v1"
data-lc-state-renderer="engagement-landing"
data-lc-state-preview-commit="a4de013"
```

and renders the visible chip **State Experience Preview · Engagement V1 · a4de013**.

Verified scoping on the running server:

| Route | Marker |
|---|---|
| guard-on `/fl` | **present** |
| guard-on `/az` | absent |
| guard-on `/ca` | absent |
| guard-on `/` (Home) | absent |
| guard-off `/fl` | absent |

**This is temporary preview evidence, not production copy.** Remove it before the State page family is
considered production-ready.

### Why the commit is a constant, and how it is prevented from lying

Reading the sha at render time would mean running `git` from a server component — a build-time dependency on
the checkout being a git repo, and wrong in any deployed environment. So it is a constant in
`lib/state/statePreviewGuard.ts`, guarded by a test.

**The obvious test was wrong, and I wrote it that way first.** Asserting `STATE_PREVIEW_COMMIT === HEAD` fails
the moment any unrelated commit lands, and the only way to keep it green is to restamp the constant on every
commit — which trains people to edit the marker mechanically, and that is precisely how it stops being
trustworthy.

The test now asserts the constant **is a real commit reachable from HEAD** (`git cat-file -t` plus
`git merge-base --is-ancestor`). That catches a typo, a fabricated value, or a sha carried over from another
repository, while staying stable across unrelated commits. **Restamp it when the experience changes, not when
the sha does.**

---

## 5. A served-page verifier, so this is checkable before review

`tests/state-runtime-proof.test.ts` checks the **running server** rather than the source. Source tests cannot
catch a stale process, because they never look at what is being served.

```bash
LC_VERIFY_URL=http://localhost:3000 npm test
```

Without `LC_VERIFY_URL` the server checks are skipped, so the offline suite stays deterministic.

It asserts fifteen required markers in `/fl`, that the served page names the **stamp** this checkout carries,
that `/az` and Home do **not** carry the marker, and that the experience is in the **server HTML** rather than
injected client-side.

One correction made after this task's own commit landed: that assertion was first written as "the served page
names `HEAD`", which broke immediately — the stamp names the commit the experience was built at, not the tip of
the branch. It now asserts against `STATE_PREVIEW_COMMIT`. Combined with the ancestor check above, the pair
gives the guarantee that matters: the page names a stamp, and that stamp is code this checkout contains.

**Proved against a negative control rather than assumed.** Pointed at a deliberately guard-off server on port
3100, it fails with:

> The server is not serving Engagement V1. Missing: experience marker, renderer marker, commit marker,
> engagement bar, Ask AI action, … Check for a stale process (kill by port, or by "next-server" — "next start"
> does not match it) and purge .next before restarting.

A check that cannot fail is decoration; this one fails correctly and says what to do.

---

## 6. The one verified server now running

| Property | Value |
|---|---|
| PID | 27646 |
| Command | `next-server (v15.5.20)` (started via `LC_STATE_PREVIEW=true npm run dev`) |
| Working directory | `/Users/bala/Learning/lc/01-new-ui` |
| Port | 3000 |
| Git HEAD | `a4de013` |
| Serving | `data-lc-state-preview-commit="a4de013"` |

`.next` was purged before starting it, and no second LotteryCorner server is running.

### Recommended review procedure

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN | awk 'NR>1{print $2}' | xargs -r kill -9
rm -rf .next
LC_STATE_PREVIEW=true npm run dev
```

Then, in a second terminal, **before opening the browser**:

```bash
cd /Users/bala/Learning/lc/01-new-ui && LC_VERIFY_URL=http://localhost:3000 npm test
```

Finally, confirm the page shows **State Experience Preview · Engagement V1 · a4de013**. If that chip is absent
or names a different commit, the browser is not looking at this code and no visual conclusion should be drawn
from it.

---

## 7. Two "missing" strings that were not defects

Both were verified rather than assumed:

1. **The visible chip appeared absent from a naive string search.** React inserts an empty comment between
   static text and an interpolated value, so the HTML is
   `State Experience Preview · Engagement V1 · <!-- -->a4de013`. Stripping comments yields the exact string. The
   regex was wrong, not the page.
2. **The return signal is absent from server HTML by design.** It is a client component that renders `null`
   until it has read the device-local last-visit marker, so the server HTML never asserts a visit history. Its
   chunk is bundled and it appears after hydration — confirmed in the DOM as `data-return-signal="first"`.

---

## 8. Validation

| Check | Outcome |
|---|---|
| `git status --short`, `git diff --check`, `git diff --name-status` | clean; every path in scope |
| lint | ✔ no warnings or errors |
| typecheck | clean |
| tests (offline) | **301 / 301** |
| tests (`LC_VERIFY_URL` set, correct server) | **305 / 305** |
| tests against a wrong server (negative control) | **3 fail, as designed** |
| Marker scoping | guarded `/fl` only; absent on `/az`, `/ca`, Home, guard-off |
| Served-HTML proof | all 15 markers present before any browser review |
| Browser DOM proof | all features present; engagement bar computed `display: grid` |

**Home:** no Home file touched. `app/globals.css` unchanged in this task.

---

## 9. Remaining founder decisions

1. **`DS-37` / `OPEN-ST-06` remain OPEN.** This task changed no design.
2. **The proof marker is temporary.** It must be removed before production, and that removal should be an
   explicit task rather than a cleanup afterthought.
3. **All LRG-STATE-034 design questions stand unchanged** — the two-summary cap, the eight community areas, the
   deterministic-AI boundary when the live service connects, and whether community/news move earlier in the
   governed PF-02 order.
4. **If the page still looks wrong after following §6's procedure**, the next diagnostic step is a different
   checkout or a browser service worker, neither of which this task found evidence for.

---

# LRG-STATE-036 — Home-Aligned Result Presentation

**Produced by:** Task **LRG-STATE-036**
**Date:** July 30, 2026
**Baseline:** `ada57a1` (tree clean; `origin/main` at `a4de013`, an **ancestor** of HEAD — the two unpushed
LRG-STATE-035 commits, not divergence)
**Status:** **RESULT PRESENTATION ALIGNED. `DS-37` / `OPEN-ST-06` remain OPEN.**

---

## 1. The locked Home visual baseline, audited directly

Inspected for this task, not recalled: the rendered Home page at 390 px and 1440 px with
`LC_HOME_PREVIEW=true`, `components/preview/PreviewResultCard.tsx`, and the `.lcp-ball` / `.lcp-btn` /
`.lcp-aiact` rules in `app/globals.css`.

| Element | Locked Home | State before | Classification |
|---|---|---|---|
| Game logo | `gameLogo()` above the title, `alt=""` | same registry, inline with title | **SHARE TOKEN** |
| Game title | 20 px featured / 16 px, 700 | 22/26 px, 800 | COMPACT STATE VARIANT |
| Main ball | `.lcp-ball` 32/36 px, radius 9999, `--ball-standard-bg`, 16/18 px, 700 | 40/46 px, always navy | **SHARE EXACTLY** |
| Special ball | colour token + **non-colour ring** + visible label **below** | colour + label **before** + squarer radius | **SHARE EXACTLY** |
| Ball accessible name | **every** ball: `"<game> number <n>"` / `"<label> <n>"` | special only | **SHARE EXACTLY** |
| Card-game ball | `data-shape="square"` → `--radius-sm` | absent | SHARE TOKEN (no Florida card game today) |
| Awaiting | `.lcp-ball--awaiting` dashed, height reserved, text status | text only | SHARE TOKEN |
| Multiplier | outlined pill, **full text** "Power Play 4X" | **not rendered at all** | **SHARE EXACTLY** + State `kind` |
| Secondary result | rule + its own `<h4>` heading | inline label | **SHARE EXACTLY** |
| Result date | "Draw date: Wednesday, 07/08/2026 — 10:59 PM ET · Mon, Wed & Sat", 13 px muted | "Wed 07/08/2026" + schedule column | COMPACT STATE VARIANT |
| Prize amount | `<strong>` 24 px featured / 15 px + **gold rule** under the amount only | label then value, no rule | **SHARE EXACTLY** (typography) |
| Prize label | hardcoded " estimated jackpot" | governed prize kind | **STATE-SPECIFIC — deliberate** |
| Cash value | not present on Home | separate labelled figure | STATE-SPECIFIC |
| Next draw | "Next draw: Saturday, 07/11/2026" | "Next draw <days> · <time>" | COMPACT STATE VARIANT |
| Buy Now | `.lcp-btn` + `--accent` / `--quiet`, 9/14 px, 14 px/600 | own filled button, 15 px/700 | **SHARE EXACTLY** |
| History link | not on the Home card | family-level link | STATE-SPECIFIC |
| Contextual AI | `button.lcp-aiact__item` 13 px/600, `--color-ai`, `AiIcon` spark, hover underline | own button, no icon | **SHARE EXACTLY** |
| Border / radius / accent | `.lcp-card--featured` navy top rule | `.lcs-fp` 2 px accent border | COMPACT STATE VARIANT |
| Deep tools (Draw Analysis, Play Options panel) | on Home | — | **NOT APPLICABLE** — global game pages own depth |

---

## 2. The shared result grammar

`components/state/preview/sections/StateResultGrammar.tsx` is a State-owned consumer of Home's primitives.

**The reuse mechanism matters.** `.lcp-ball`, `.lcp-btn` and `.lcp-aiact__item` are low-level **CSS classes**,
not Home components. State now uses them verbatim, so ball shape, size, colour tokens, the special ring, the
forced-colours fallback, button padding/radius/weight and the AI action's colour and hover are **literally the
same rules** — they cannot drift apart again, and no `lcp-` rule was modified. That is precisely the reuse §10
permits, and it carries zero Home regression risk.

Where an approved rule lives only inside a Home component (`ballIdentity`, the label-below placement, the
secondary-draw heading), it was **reproduced in State-owned code** rather than refactored out of Home. §10 is
explicit that deduplicating code is not worth a Home regression.

Measured after the change: State balls report `32px/32px` at mobile and `36px` at ≥992 px, `16px/700`,
`border-radius: 9999px` — identical to Home. 99 `.lcp-ball` instances, 11 special rings, 11 visible labels.

### Three signals on a special ball, as Home implements them

Colour token + a **non-colour ring** (`data-special` → `box-shadow`, becoming an `outline` under forced
colours) + a **visible text label**. Ball-to-ball luminance separation is only 1.00–1.13:1, so colour alone is
measurably incapable of distinguishing them.

### Every ball is named

Home names all of them; State named only the special ones. Now `"Fantasy 5 number 18"` and `"Powerball 18"` are
distinguishable to a screen reader.

---

## 3. The one deliberate difference: prize labels

Home appends a hardcoded **" estimated jackpot"** to every amount. State does **not** copy that.

LRG-STATE-029 established that Florida's prizes are not all jackpots. Copying Home's suffix would make three of
four labels factually wrong:

| Family | State label | Home's suffix would say |
|---|---|---|
| Powerball / Mega Millions | Est. annuitized jackpot | estimated jackpot ✓ |
| Florida Lotto / Jackpot Triple Play | Advertised jackpot | estimated jackpot ✗ |
| Fantasy 5 | **Est. top prize** | estimated jackpot ✗ |
| Pick 2/3/4/5 | Top prize | estimated jackpot ✗ |
| Cash Pop | **no figure shown** (stake-dependent) | estimated jackpot ✗✗ |

§2 requires those labelled semantics to be preserved rather than "reduced to one unlabelled large value". So
State keeps the labels and borrows only Home's **typography** — the 24 px amount and the gold rule beneath it,
which is the only place gold appears. Four distinct labels are rendered, verified at runtime.

---

## 4. Fantasy 5 — the native acceptance example

Renders as one family panel: one identity, one title, `$100,000` at 24 px with the gold rule, **"Est. top
prize"** beneath it, Midday and Evening rows each with their own date, Home-aligned 32 px ball tokens, then one
History link, one **Ask AI** (Home's inline grammar with the spark icon), and one Discuss action. One Buy Now in
the header. No member mini cards; rows still declare no border, radius, shadow or surface.

**The top-prize label is not confusable with a jackpot** — it reads "Est. top prize", which was §5's specific
requirement.

---

## 5. Powerball and Mega Millions

Still ONE shared outer block with one heading and two games divided by a rule — no return to two floating
cards. Inside, each game now reads in Home's language:

- verified brand logo;
- amount at 24 px with the gold rule + **"Est. annuitized jackpot"**;
- draw date, then 32 px navy balls;
- **red Powerball / amber Mega Ball with the ring and the label below**, in Home's tokens;
- **"Power Play 4X · if selected"** — Home's outlined pill, with State's `kind`;
- **Double Play** as its own bold heading with subordinate balls;
- next draw from the published schedule;
- one Buy Now, one History, one selective Ask AI.

Deliberately **more compact than Home** and carrying **none of Home's deep tools** — no Draw Analysis, no play
options panel. Global Powerball and Mega Millions pages own depth; the State page owns local availability and
Buy Now context. It still renders after the first Florida-native result on every viewport.

### The multiplier was silently dropped

The feed held `{ label: "Power Play", value: 4 }` and Home rendered it while State rendered nothing — the
presentation model had no field for it. `ResolvedMember.result.multiplier` now carries the value plus the
governed `kind`, so **Power Play (chosen and paid for)** is never confused with the **built-in Mega Millions
multiplier**. An `unavailable` or `notApplicable` multiplier renders nothing.

---

## 6. Add-ons

**Fireball** remains a labelled drawn add-on on its own `ball.fireball` token with `visualRole: "addOn"`, never
an ordinary main ball. **EZmatch and Combo** appear in no result row or ball group — tested by scanning every
rendered group label.

---

## 7. Buy Now and AI alignment

Buy Now is `.lcp-btn lcp-btn--accent` (or `--quiet`), with `.lcs-buynow` adding **only** `min-height: 44px` —
Home's action sits in a `<details>` trigger and does not need a touch target. A test asserts the State rule
restates no background, radius or font-size. One per family, one per multi-state game, none on a member row.
Measured 44 px at every width.

The visible S-07 heading is now **"Buy Now in Florida"**. The governed section id, fragment (`where-to-play`)
and order (10) are unchanged; "Where to Play" survives as a resolver outcome and a supporting link.

Contextual AI is `button.lcp-aiact__item` with `AiIcon` **imported unchanged** from the Home preview icon set —
pure inline SVG with no Home coupling, so importing it is the permitted primitive reuse. The icon is
`aria-hidden` and supports the label rather than replacing it.

---

## 8. Responsive verification

| Width | Ball | H1 | Buy Now | Horiz. scroll | First result | AI |
|---|---|---|---|---|---|---|
| 320 | 32 px | 2 lines | 44 px | none | 533 px | 3.08 screens |
| 375 | 32 px | 2 lines | 44 px | none | 518 px | 2.97 |
| 390 | 32 px | 2 lines | 44 px | none | 518 px | 2.84 |
| 992 | 36 px | 1 line | 44 px | none | 399 px | — |
| 1280 | 36 px | 1 line | 44 px | none | 399 px | — |
| 1440 | 36 px | 1 line | 44 px | none | 399 px | — |

Desktop content column 988 px, rail 300 px, gap 28 px; the multi-state columns align; no unused central void.

### Two defects found by measuring, and fixed

1. **Horizontal page scroll at 320 px.** The runtime proof marker added in LRG-STATE-035 carried
   `white-space: nowrap` and was 333 px wide, pushing the document to 350 px. A temporary marker must never
   break the layout it exists to validate; it now wraps.
2. **The AI module drifted past its three-screen budget.** Home's label-below-the-ball placement adds a line per
   special group, and the multi-state block carries three. A narrow-viewport reclaim recovered it at 375 and
   390 px. **At 320 px it sits at 3.08 screens — marginally over**, and the remaining levers would mean
   shrinking a ball or a label, which §2 and §11 both forbid. Reported rather than forced.

---

## 9. Home non-regression

- **No Home file touched.** `components/home/`, `components/preview/`, `app/page.tsx`, `lib/preview/` and
  `app/layout.tsx` are all unmodified.
- **No `lcp-` selector redefined.** A test enumerates every selector this task added and asserts all are
  `lcs-`-prefixed. State may *use* an `lcp-` class; it may never redefine one.
- **The only removed CSS line in the whole diff** is my own `white-space: nowrap` from the 035 marker.
- **Guard-off `/fl` and Home both contain zero `lcs-` occurrences** and no marker.
- A test asserts Home's card still says "estimated jackpot" and that no `lcs-` class leaked into it.

---

## 10. Paired visual evidence

Stored **outside the repository** at `<session-scratchpad>/lrg-state-036/`, captured through the DevTools
protocol so 390 px means 390 px:

| # | File | View |
|---|---|---|
| 1 | `01-home-390-multistate-treatment.png` | **Home** Powerball/Mega Millions at 390 |
| 2 | `02-home-1440-multistate-treatment.png` | **Home** featured pair at 1440 |
| 3 | `03-state-390-fantasy5-family.png` | Fantasy 5 family at 390 |
| 4 | `04-state-390-multistate-block.png` | State multi-state block at 390 |
| 5 | `05-state-1440-fantasy5-family.png` | Fantasy 5 at 1440 |
| 6 | `06-state-1440-multistate-block.png` | State multi-state block at 1440 |
| 7 | `07-state-390-buynow-and-ai.png` | Buy Now + AI actions at 390 |
| 8 | `08-state-1440-buynow-and-ai.png` | Buy Now + AI actions at 1440 |

**Shared features:** ball shape, size, colour tokens, special ring, label placement, accessible naming,
multiplier pill, secondary-draw heading, amount typography and gold rule, Buy Now grammar, AI action grammar.

**Intentional State differences:** labelled prize semantics instead of a hardcoded jackpot suffix; family rows
instead of one card per game; a compact multi-state block; no Home deep tools; History and Discuss actions;
the engagement bar; the runtime proof marker.

---

## 11. Tests

`npm test` — **322 tests, 322 pass, 0 fail** (21 added). Lint clean, typecheck clean.

Added: State reuses `.lcp-ball` with Home's data attributes and defines no competing ball · the identity
mapping matches Home token for token · three signals with colour never the only one · every ball named ·
State keeps governed prize labels and Home keeps its suffix (the deliberate difference, asserted from **both**
sides) · each prize kind maps to a distinct label and Cash Pop shows none · cash value is its own figure ·
the multiplier reaches the presentation layer as full text · Power Play is selected and Mega Millions is
built in · unavailable renders nothing · Double Play is subordinate with its own heading · Fireball is a
labelled add-on · EZmatch/Combo are never a value group · Buy Now uses `.lcp-btn` and restates nothing ·
one per family and per multi-state game, none on a member row · AI uses `.lcp-aiact__item` and imports
`AiIcon` unchanged · S-07 heading is "Buy Now in Florida" with id/fragment/order intact · Engagement V1
order, row properties and marker survive · Fantasy 5 keeps two independently dated rows with a top-prize
label · no `lcp-` selector redefined · no `lcs-` class in a Home component.

Four prior assertions were corrected, and **two of my own new ones caught real defects in my own work**:

- `section()` was called but not imported into this suite.
- The quiet Buy Now variant is now Home's `.lcp-btn--quiet`, so the old assertion about a State-owned
  background no longer described the mechanism.
- Two slices used `indexOf("LRG-STATE-036")`, which matched an earlier COMMENT citing the task rather than the
  CSS block, silently widening the slice so the assertions read pre-alignment rules. They now locate the block
  by its banner heading.
- **The "State must not restate what `.lcp-btn` defines" assertion failed, and it was right.** Seven
  `.lcs-buynow` rules survived from earlier tasks, several still setting background, border, radius, padding,
  font-size and weight — exactly the duplication that would let the two pages drift apart again. Every one is
  now target-only. The forced-colours border is deliberately exempt: `.lcp-btn` uses a transparent border,
  which vanishes in forced-colours mode, so State legitimately restores a visible boundary there.
- The dead `.lcs-fp__ball` / `.lcs-fp__balls` / `.lcs-fp__balllabel` rules were **deleted, not shadowed**, once
  confirmed that no component emits them.

One process note worth recording: a first attempt at that cleanup used a `[\s\S]*?` regex that spanned past
its intended rule and removed live `.lcs-fp__row` declarations. Fourteen tests failed immediately, `globals.css`
was restored from the commit, and the cleanup was redone rule-by-rule with no spanning wildcards. The test suite
caught it before it could reach a screenshot.

---

## 12. Validation

| Check | Outcome |
|---|---|
| `git status --short`, `git diff --check`, `git diff --name-status` | clean; all in scope |
| lint · typecheck | ✔ · clean |
| focused State tests | 322 / 322 |
| guard-on build | ✓ 20/20; `engagement-v1`, 99 `.lcp-ball`, "Buy Now in Florida" all served |
| guard-off build | ✓ 20/20; `/fl` and Home have **0** `lcs-` |
| production-ad baseline | ✓ all `production`, 0 compact markers |
| runtime Engagement V1 | ✓ marker, engagement bar, AI, community, family rows intact |
| Home non-regression | ✓ no Home file, no `lcp-` rule, guard-off clean |
| paired screenshots | ✓ 8 captures |

---

## 13. Remaining visual decisions

1. **`DS-37` / `OPEN-ST-06` remain OPEN.**
2. **Ball size is now Home's 32/36 px, down from State's 40/46 px.** That is the alignment §2 asked for, but it
   reverses the size increase made in LRG-STATE-032 after "the text is too small". If the founder wants larger
   result numbers, that is a **Home** decision now — changing only State would re-open the inconsistency this
   task closed.
3. **AI at 3.08 screens at 320 px**, marginally over the LRG-STATE-034 budget. Closing it means shrinking a
   ball or a label, which this task forbids.
4. **State's date format stays compact** ("Wed 07/08/2026" + a schedule column) rather than Home's
   "Draw date: Wednesday, 07/08/2026 — 10:59 PM ET". A family panel has one date per row, so Home's long form
   would wrap on every row.
5. **The card-game ball shape (`data-shape="square"`) is wired but unused** — Florida offers no card game today.
6. **The runtime proof marker is still temporary** and must be removed before production.
7. **Prize labels have not been founder-reviewed as public copy**, and the neutral game mark and the
   `lotto-america.webp` filename remain open from earlier tasks.

---

# LRG-STATE-037 — Consumer-First Hierarchy and Inline Interactions

**Task:** LRG-STATE-037 · **Commit:** `fix: simplify state hierarchy and interactions` · **Baseline:** `90958e2`
· **Rulings:** FV-01 … FV-09 · **DS-37 remains OPEN.**

## 1. Founder concerns

Founder review accepted the LRG-STATE-036 result grammar and rejected two experience decisions plus a general
impression:

1. **Powerball and Mega Millions appeared too late.** They sat below the latest Florida-native family because a
   native result was more recent.
2. **Ordinary actions relied on modal dialogs.** Ask AI, What Changed, Discuss Results and the Buy Now resolver
   each opened a `role="dialog"` surface with a focus trap and a backdrop.
3. **The page still read as an internal dashboard** — too many equally weighted outlined controls, repeated
   status pills, tiny metadata lines and competing modules.

## 2. Powerball and Mega Millions placement (FV-01)

The multi-state block now renders **first inside S-02**, immediately after the S-01 identity area. The section
id, its manifest order and every semantic requirement are unchanged; only the order of the children moved.

| Width | Identity | Powerball / Mega Millions | First native family | Action row |
|---|---|---|---|---|
| 320 px | 101 px | 421 px (0.50 screens) | 1,231 px (1.46) | 1,667 px |
| 375 / 390 px | 89 px | 410 px (0.49) | 1,055 px (1.25) | 1,455 px |
| 992 px | 48 px | 370 px | 878 px (0.98 — inside the first screen) | 1,220 px |
| 1280 / 1440 px | 48 px | 370 px | 841 px (0.93) | 1,183 px |

**PF-02 visual-order reconciliation, recorded explicitly.** PF-02 orders *sections*; FV-01 orders *content
within S-02*. No governed section changed position, no section id changed, and no route or anchor changed. The
reconciliation is that S-02's internal sequence is now `multi-state → first native → actions → what changed →
additional families`, where it was `first native → multi-state → …`.

**No advertising precedes the first useful result.** AD-S00 is desktop-only and collapses to 0 px below 992 px;
at 1440 px it occupies 20 px in compact review mode at y=252, between the identity area and the results. The
first inline mobile ad is at 3.22 screens.

## 3. Florida-native selection (FV-02) — and a determinism defect closed

`selectFirstNativeFamily` still decides which native family leads, and still never sees a multi-state family.

Writing the FV-02 test exposed a real defect: the rule's three keys — open status, newest verified date,
configured priority — were **not a total order on the real Florida data**. Fantasy 5 (`dailyVariants`, priority
1) and Cash Pop (`specialized`, priority 1) both draw daily and tie on all three, because `priority` is scoped
*within* a group in the config. `Array.prototype.sort` is stable, so the winner was decided by the order the
families happened to arrive in — reversing the input array changed which family led the page. The config order
is fixed, so the page was stable in practice, but "stable because the input never varies" is not deterministic.

Two tiebreaks were added: **native group presentation order**, then **family id**. Both are meaningful rather
than arbitrary, and both preserve the accepted outcome (Fantasy 5 leads Florida). A test now pins that outcome
absolutely, so closing the tie cannot quietly change the top of the page.

## 4. Modal removal (FV-03)

| Removed | Replacement |
|---|---|
| `StateBuyNowResolver.tsx` — `role="dialog"`, focus trap, backdrop, close button | `StateBuyNowInline.tsx`, inline in S-07 |
| `StateDiscussionSurface.tsx` — drawer with a local composer | `StateDiscussLink.tsx`, a plain anchor |
| `StateEngagementBar.tsx` — four equal outlined cards | `StateActionRow.tsx` |
| `StateDiscussAction.tsx` — dispatching button | folded into the action row and the community section |
| `StateReturnSignal.tsx` — one-line return signal | the inline What Changed disclosure, which sits where it sat |
| A dead duplicate `SectionS03` in `StateUtilitySections.tsx` | none needed — nothing imported it, and it declared the same `id="state-ai-brief"` the live AI section owns |

The served page contains **zero** `role="dialog"`, `aria-modal` or `<dialog>`, proven at runtime as well as in
source. Their CSS was removed with them rather than retained: the sheet wrapper, backdrop, panel, close button,
context list, option groups, the discussion drawer's internals, the four-card bar and the hero CTA step.

## 5. Inline State AI (FV-04)

One inline surface at `#state-ai-brief`: a visible text input (48 px, 16 px font so iOS does not zoom), an
**Ask** button, four suggested questions with the rest behind **More questions**, and a deterministic preview
answer computed only from governed page data under the explicit preview label.

Both contextual entries — the per-result `Ask AI` and the action row's primary — dispatch at this surface and
then scroll and focus it. Neither renders an answer of its own. Typed questions are matched by deterministic
word overlap; below threshold the surface says it has no matching answer rather than guessing.

Suggested prompts became **wrapping pills** instead of four full-width outlined rectangles (FV-09).

## 6. Discussion navigation (FV-05)

Discuss Results is now a plain `<a href="#{group}">`.

**The approved production route does not exist yet.** `/community` and `/community/{forum-entry-slug}` are
preserved routes in CLAUDE.md §10 and are owned by the community blueprint, but there is no `app/community`
directory. No production URL was invented. Per FV-05's own fallback clause, the guarded preview navigates to
the matching S-14 community group, which carries the result context. **Recorded as a missing route.**

No thread, author, post, reply or activity count is fabricated anywhere.

## 7. Inline What Changed (FV-06)

A semantic `<details id="what-changed">` directly under the action row — 44 px tall when collapsed.

The disclosure **shell is server-rendered and only the verdict is not.** An earlier revision returned `null`
until the local marker had been read; that kept the server HTML honest but left the action row's `What changed`
pointing at an anchor that did not exist yet — a link that looks functional and is not, which CLAUDE.md §9
forbids. Before the marker is read it states only that the check runs on this device and claims nothing about a
previous visit (`data-what-changed="checking"`).

Its facts are deterministic: verified result count, most recent result date, jackpot movement from the feed's
own current and next advertised prizes, and a next-draw link. First visit reads *"Return after the next draw to
see what changed."*

**S-09 was reconciled, not removed.** It held the same component and the same `id="what-changed"`, which was a
duplicate DOM id and a duplicate surface. S-09 keeps its governed id, order and eligibility, and now carries
what changed in the **published data** — page facts, true for every reader, server-rendered where §11 needs
them crawlable. S-02's copy is visit-dependent and client-only. Neither states the other's content.

## 8. Inline Buy Now resolver (FV-07)

One `StateBuyNowInline` instance, hosted by S-07, heading unchanged: **Buy Now in Florida**. Every entry — the
action row, each multi-state game, each eligible family — sets the game context, scrolls to S-07, expands the
resolver and focuses its heading.

It runs the real `resolveBuyNow` against the real governed capability record. Florida's status renders as
**"Still being verified"**; the reader never sees `underReview`, `retailOnly`, a decision id or a partner URL.
The FV-07 message is served verbatim in substance, with the game named. The disclaimer leads, always.
`/play/{game}` versus `/buynow/{code}` is untouched.

## 9. Simplified action area (FV-08) and reduced technical language (FV-09)

The action row is one filled `Ask AI about {game}` (48 px) plus three compact links — Discuss, Buy Now, What
changed. No microcopy under any of them; the `hint` field was deleted from `EngagementAction` so none can be
rendered. Order, labels and emphasis come from the one governed list, so the row cannot drift from the record.
Total height 102 px at 390 px, all targets ≥ 44 px.

FV-09 reductions, each with its measured cause:

| Removed | Why |
|---|---|
| S-02's second `Source checked` line | repeated the identity area's source, date, freshness and both counts, ~110 px above the first result |
| Two of four identity chips (`Jump to results`, `Ask {state} AI`) | the reorder made both point at what is now immediately below; two rows of chips cost ~160 px |
| The featured panel's own `Ask AI` / `Discuss` / `Buy Now` | the action row directly beneath offered the same three actions — two stacked strips within ~100 px |
| The trailing State-level hero CTA and the `hero` button variant | commerce moved into the action row |
| S-07's lede and three of its four closing sentences | the resolver beneath states the same facts in reader terms |
| Full-width outlined prompt rectangles | read as a form; wrapping pills cost about a third of the height |

## 10. Community simplification (FV-09 §9)

Eight cold-start areas became **three**: Florida daily number games (tier A), Jackpot and multi-state games
(tier A), Results, claims and player questions (tier C). The finer categories survive as configuration in
`FUTURE_AREA_KEYS` — nothing was deleted, and nothing renders as an empty card. Areas are still derived from
the games the state actually offers, so a state with no daily games shows no daily-games area. The cold start
is stated plainly; no activity is invented.

## 11. Mobile and desktop review

At 320 / 375 / 390 px: no horizontal scroll, no dialog, no focus trap, no ad before the first useful result,
body text 16 px, balls 32 px (Home-aligned), AI input 48 px at 16 px, What Changed 44 px collapsed, all action
targets ≥ 44 px, first inline ad at 3.22–3.65 screens.

At 992 / 1280 / 1440 px: Powerball and Mega Millions at 370 px and the native family at 841–878 px are both
inside the initial 900 px region; no horizontal scroll; no dialog; the rail is 300 px against a 1,316 px AI
module; the inline resolver is 425–491 px, not an empty tall panel.

## 12. Visual evidence

`01`–`08` at 390 px (identity + PB/MM · native family · action row · inline AI · AI answer expanded · What
Changed expanded · Buy Now resolver expanded · Discuss destination), `09`–`12` at 1440 px (top hierarchy ·
inline AI · inline resolver · community), plus `13` guard-off Florida, `14` Home, `15` non-Florida State.
Captured over the DevTools protocol with `Emulation.setDeviceMetricsOverride`, so 390 px is a real 390 px
layout viewport. Stored outside the repository in the session evidence directory.

## 13. Validation

| Check | Result |
|---|---|
| `git diff --check` | clean |
| lint | ✓ no warnings or errors |
| typecheck | ✓ |
| tests | ✓ **335 pass, 0 fail** (330 offline + 5 runtime) |
| guard-on build | ✓ all markers served; 0 dialogs |
| guard-off build | ✓ `/fl` and Home byte-identical to the pre-task baseline apart from the Next.js build id; **0** `lcs-` |
| production-ad baseline | ✓ same 10 slot keys as the baseline, none added, removed or renamed |
| runtime Engagement V1 | ✓ `engagement-v1`, `engagement-landing`, stamp, action row, inline AI, inline resolver, community all in the served HTML |
| Home non-regression | ✓ no Home file touched; every removed CSS selector is `.lcs-`; no `.lcp-` or global rule changed |

## 14. Remaining decisions

1. **`DS-37` / `OPEN-ST-06` remain OPEN.** Not closed by this task.
2. **`/community` and `/community/{forum-entry-slug}` are not implemented.** The guarded preview uses the S-14
   fallback FV-05 permits. Building them is a separate, approved task.
3. **`/play/{game}` versus `/buynow/{code}` is still unresolved** and was not touched.
4. **The runtime proof marker is still temporary** and must be removed before production.
5. **About 75 orphaned `.lcs-` selectors predate this task** (`lcs-fam__*`, `lcs-mrow__*`, `lcs-fp__*`,
   `lcs-attr--*` and others left by earlier drafts). They were left alone: §12 authorises removing the modal
   code this task orphaned, not a general CSS purge. A scoped cleanup task is recommended.
6. **Florida's purchase status is still `underReview`** in the capability record; the reader-facing wording is
   the only thing this task changed.
7. **The 320 px native-family position (1.46 screens)** is the weakest measurement. Powerball and Mega Millions
   occupy that space with real results, so it is a consequence of FV-01 rather than of padding.

---

# LRG-STATE-038 — Final Content and Commerce Polish

**Task:** LRG-STATE-038 · **Commit:** `fix: polish state content and commerce cta` · **Baseline:** `adf2387`
· **Rulings:** FP-01 … FP-05 · **DS-37 remains OPEN.**

## 1. The Buy Now colour decision

`--color-commerce: #ae0e28`.

**Provenance.** No governed commerce red existed. The legacy production logo is gold, and the only reds in the
legacy stylesheet are incidental (a game-name label, a YouTube glyph, a heart icon). The value was therefore
sampled from the founder-supplied proposed Florida design,
`05-design-inputs/state-pages/proposed-screenshots/florida.pdf`, page 1, where **one** crimson is used for the
`LOGIN` button, both `Buy Tickets` buttons and the Mega Ball — measured at `#ae0e28` at every one of those
points. It is recorded as a design-evidence transcription, not as a fact the PDF authorises on its own.

**Why not `--color-alert` (#c73a3a).** DS-03 reserves that token for corrections, errors and critical states. A
purchase button and a correction notice must never share an identity. Neither relies on colour alone: a
correction carries the `Correction` attribution label, a commerce action carries the word `Buy Now` and a button
shape.

**Contrast.** White on #ae0e28 is **7.26:1** — AA and AAA for normal text. As a 1px border on white it is
7.26:1, well over the 3:1 non-text minimum. Focus needs no special case: navy-on-crimson would be 2.27:1 and
fail, but DS-15 draws the ring with a **2px offset**, so it lands on the page background at 16.5:1. A test pins
that offset, because removing it would silently break contrast on every commerce button.

**One red only.** Hover and active are `color-mix` derivations of the same token, so the system holds exactly one
red value. No glow, gradient, shadow, transition or animation — asserted in a test.

## 2. The shared commerce primitive

`.lcp-btn--commerce` (filled) and `.lcp-btn--commerce-quiet` (outlined), both inheriting `.lcp-btn` unchanged —
same padding, radius, weight and size, so position and dimensions are untouched and only the hue moves. Quiet is
hierarchy, never disablement: same 44px target, same behaviour, same shared resolver. A forced-colours block
keeps the identity alive as shape when author colour is discarded. The primitive holds no composition logic.

## 3. Buy Now audit and classification

| Instance | Before | Classification | After |
|---|---|---|---|
| Home — Powerball `Play Online` | `--tonal` | PRIMARY COMMERCE | `--commerce` |
| Home — Mega Millions `See Play Options` | `--tonal-quiet` | QUIET COMMERCE | `--commerce-quiet` |
| Home — H-12 `Where to play` | `--tonal` | PRIMARY COMMERCE | `--commerce` |
| Home — `Latest results` | `--accent` (blue) | NAVIGATION — **not commerce** | unchanged |
| Home — `Explore AI analysis` ×3, `Subscribe` | `--tonal` | NEUTRAL — **not commerce** | unchanged |
| State — Powerball `Buy Now` | `--accent` | PRIMARY COMMERCE | `--commerce` |
| State — Mega Millions `Buy Now` | `--accent` | QUIET COMMERCE (see below) | `--commerce-quiet` |
| State — featured family | none since FV-08 | DUPLICATE / already removed | none |
| State — action row `Buy Now` | blue link | QUIET COMMERCE (colour only) | commerce-coloured link |
| State — S-07 `find a retailer` | `--quiet` | SUPPORTING LINK | unchanged (blue) |

**The near-miss this audit caught.** `.lcp-btn--accent` was shared by State's Buy Now *and* Home's `Latest
results` navigation link. Recolouring that variant — the obvious one-line change — would have turned a Home
navigation link crimson, exactly what FP-01 rules out. A new primitive was required, not a redefinition.

**§4, one dominant action at a time.** Both multi-state Buy Now buttons were filled crimson and measured **233px
apart at 390px**, so both landed in one viewport — two equals, no dominant action. The lead game now takes the
filled treatment and the rest take the quiet variant, reusing the selective rule the block already applies to
its single AI action (`showAi={i === 0}`), so the block has one hierarchy rather than two.

## 4. The narrow Home exception (FP-02)

Three call sites changed, each a single token. **Proven by DOM comparison of the served page before and after:
the only differences are the three class strings** (plus their RSC-payload mirrors and the Next.js build id).
Same tag, same `type`, same `aria-haspopup` / `aria-expanded`, same `data-overlay-mode`, same label text, same
position, same geometry. No Home composition, order, copy, spacing, structure, advertising or behaviour moved.

## 5. Ticket check (§5) — established, not assumed

**Not functional.** There is no comparison code anywhere in the repository: no matcher, no per-game prize rule
set, no input handler; `buildStatePreviewModel` marks S-05 unavailable for that reason. S-05 was an `Unavailable`
card headed "Ticket checking: currently unavailable" — a module whose whole content was that it does not work.

It is now a compact **How to check your Florida ticket** three-step summary ending at the operator's own
winning-number search, using only verified facts (`operatorWinningNumbersUrl`, the `$599 or less` threshold),
and saying plainly that only the Florida Lottery can validate a ticket. Section id, order and semantics
unchanged. No fake checker was created, and no input control exists — asserted in a test.

## 6. Claims and player help (§6) — a content defect fixed

S-08 rendered **four** `Currently unavailable` cards. **Two were wrong.** `claimThresholds` and `claimDeadline`
are both `verified` in the content manifest, cited to the official Winner's Guide [O2], and had been since
LRG-STATE-025 — but the section passed `.source` (the reviewer citation) into `Unavailable` without ever
checking whether the fact publishes. Verified claim guidance was being withheld while the page said it did not
exist. A claim deadline is the one fact on this page a reader can lose money by not knowing.

S-08 is now **Claiming a prize in Florida**: the verified deadline (covering draw games and Scratch-Offs in one
sourced sentence), the official claim destination, the official responsible-play destination. Tax and anonymity
are `absent` with no verified source and no dedicated guide, so they are **suppressed, not boxed**, with one
honest line explaining the silence.

S-08A had the same defect: five of nine rows read "Currently unavailable", two of them over verified facts
(`minimumPurchaseAge` = "18", `claimDeadline`). It now publishes seven verified rows and **omits** anything
unsourced rather than displaying it as unavailable.

Unavailable blocks on the page fell from **14 to 2**. FP-03 keeps the amount bands, district offices and the
full claim walkthrough off the hub; the official Winner's Guide is the destination until a dedicated page exists.

## 7. Official Florida tools (§7)

A compact link list in S-10 — not another card. Four entries, every one a `verified` manifest fact with a
recorded source and `lastVerified` date: winning numbers, retailer locator, how to claim, play responsibly. No
href is composed by string-building a path onto the operator's domain; a test asserts there is no literal URL in
the group and that an unset fact drops out rather than rendering an empty link.

## 8. Scratch-Offs, Second Chance and the official app (§8) — UNDER REVIEW, not rendered

None of the three has a verified destination in the content manifest, and this task carries no authorisation to
browse, so none could be verified here. Per §8 each is recorded **UNDER REVIEW** and **not rendered**. Inventing
`/scratch-offs` on the operator's domain would be an unverified claim even if it happened to resolve. A test
fails if any of the three appears in rendered code.

## 9. News and guides (§9)

S-15 rendered a bordered module three paragraphs tall whose entire message was that it was empty. There are no
maintained State guides in the repository — no editorial store, no article records — so §9's other branch does
not apply and the surface is **suppressed**. It keeps its governed id, order and eligibility and returns the
moment a real article exists, because the condition is the content itself rather than a flag. It hosted no
advertisement (`data-ad-host-eligible="false"`), so no slot moved.

## 10. Popular questions (§10)

**No new surface was added.** All three suggested topics already exist as State AI prompts with deterministic
answer paths — *When is the next Florida draw?*, *What does Fireball mean?* (derived from the state's own add-on,
not hardcoded) and *Explain official Florida claim steps*. Adding a separate FAQ block would duplicate them and
work against FP-03 and FV-09.

## 11. Proposed-PDF disposition

The PDF is a reference and content inventory. **No PDF fact is treated as authoritative**, and where it conflicts
with the manifest the manifest wins. Its claim deadlines happen to corroborate the manifest's verified value;
that is corroboration, not the source.

**KEEP ON HUB** — latest results · compact multi-state block · grouped State games · concise ticket-check
guidance · compact claim help · compact sources and responsible play. *All present.*

**MOVE TO DEDICATED PAGE** — the 7-step claim walkthrough · claim amount bands and district-office list · the
Taxes & Withholding block · winner anonymity · per-game odds and prize matrices (Florida Lotto, Fantasy 5,
Cash4Life, Pick 2–5) · full game rules and "how it works" · draw-integrity and oversight narrative ·
where-lottery-money-goes · the FAQ accordions · player-rights section.

**DEFER UNTIL SOURCED** — winners · unclaimed prizes · expiry alerts · retailer-specific winner stories ·
fund-allocation figures requiring maintained official data · the PDF's tax statements (Florida charges no state
income tax on winnings; 24% federal withholding), which are plausible but carry no verified primary source in
this repository and are therefore not published under FP-04.

**REJECT** — placeholder dates and amounts · synthetic examples · repeated long-form sections on the hub · the
seven-page guide structure itself, which FP-03 explicitly rules out for the State hub.

## 12. Mobile and desktop review

At 390px: filled crimson Buy Now on the lead game, outlined crimson on the second, blue `History`, teal `Ask AI`
— four distinguishable action identities. Both commerce buttons are 44px. No horizontal scroll, no dialog. The
document shrank from 9,653px to 9,228px as the unavailable cards and the empty news box came out.

At 1440px: Home shows filled `Play Online` and outlined `See Play Options` while `Explore AI analysis` stays
blue and `Compare these games` stays neutral — commerce is visibly distinct from AI and from navigation.

## 13. Visual evidence

`01`–`07` at 390px (top results + primary Buy Now · quiet family Buy Now · inline resolver · official tools ·
simplified claims/help · ticket guidance · community with no news box), `08`–`09` at 1440px (top results ·
help and tools), `10`–`13` Home before/after at 390px and 1440px. The Home "before" frames restore the previous
variant classes on the live page, so the pair differs by exactly the one thing this task changed. Stored outside
the repository in the session evidence directory.

## 14. Validation

| Check | Result |
|---|---|
| `git diff --check` | clean |
| lint · typecheck | ✓ · ✓ |
| tests | ✓ **349 pass, 0 fail** (344 offline + 5 runtime) |
| guard-on build | ✓ commerce served, hierarchy correct |
| guard-off build | ✓ `/fl` and Home byte-identical to the pre-task baseline apart from the build id; **0** `lcs-` |
| Home preview build | ✓ 3 commerce triggers converted; 2 blue navigation links and 7 tonal AI/utility buttons untouched |
| production-ad baseline | ✓ same 10 slot keys, none added, removed or renamed |
| runtime Engagement V1 | ✓ all markers served; 0 dialogs |
| Home before/after DOM | ✓ 3 class strings, nothing else |

## 15. Remaining launch dependencies

1. **`DS-37` / `OPEN-ST-06` remain OPEN.** Not closed by this task.
2. **Two `Currently unavailable` cards remain, both outside this task's allowed files** and both left
   deliberately rather than silently widened into:
   - **S-06** — "Published odds and prize tiers: currently unavailable". FP-03 routes odds to a dedicated page,
     so the card should be suppressed and replaced with a destination.
   - **S-17** — "Responsible-play contact: currently unavailable", which is the same defect S-08 had: the
     manifest holds a **verified** `responsiblePlayContact` URL, and only the *helpline number* is unverified.
     It should publish the destination and drop the card.
   Both are one-file fixes and are the recommended follow-up.
3. **Scratch-Offs, Second Chance and the official Florida Lottery app are UNDER REVIEW** — they need verified
   destinations before they can render.
4. **Tax and winner-anonymity guidance needs a sourced dedicated page** before either can be stated anywhere.
5. **The commerce crimson (#ae0e28) and the Powerball ball red (#b3241c) are close in hue.** They read as
   clearly different objects in review — a wide labelled button versus a numbered circle with its own text
   label — but this is a founder call to confirm, and the ball tokens are Home-governed and were not touched.
6. **A dedicated claim page** would let the amount bands, district offices and the claim walkthrough leave the
   official-site link and live on LotteryCorner.
7. **The runtime proof marker is still temporary** and must be removed before production.

---

# LRG-STATE-039 — Reader-Friendly Engagement and Share Polish

**Task:** LRG-STATE-039 · **Commit:** `fix: simplify state trust and engagement actions` · **Baseline:**
`164d91d` · **DS-37 remains OPEN.**

## 1. The public provenance policy

**Provenance governs the content; it is not the content.** Eight repeated attribution badges came off the public
page: `SOURCE CHECKED`, four `Official source`, two `Verified` and a table caption reading "Verified Florida
facts and their sources". A `Community` chip and a governance notice printing an internal trigger name plus the
governed section ids that had moved came off with them.

Nothing was removed from the model. Verified facts still carry values and citations, absent facts are still
absent, `data-last-updated` still emits the exact governed timestamp, `data-freshness` the computed state, and
`data-override` / `data-override-affects` / `data-override-expires` the promotion detail. Two tests hold both
halves — one asserts the badges are gone from every preview file and from the **served** page, the other asserts
the manifest still carries the values, the citations and the absences that drive publication.

**The one line that replaced them**, at the top of the page, from governed data:

> Updated July 9, 2026 at 2:01 PM ET · Results from Florida Lottery · *21 days old — not current*

The date is formatted from the governed ISO value with a fixed format rather than a runtime locale, so the server
and the client cannot disagree. No sample text is hardcoded — asserted.

`Currently unavailable` survives in exactly one place: the shared `Unavailable` component and the freshness
fallback in `StateCommon`. A jurisdiction with genuinely no verified data still needs an honest way to say so;
§11 removed the two that **rendered** for Florida, not the capability. No section prints the phrase itself, and
the served Florida page contains **zero** `data-unavailable`.

## 2. Meaningful result statuses

A normal published result now shows the result and its date and nothing else. The exceptions that change what a
reader needs to know all survive: the **stale** badge ("21 days old — not current"), and the correction/urgent
promotion path, which still lifts the affected content above everything else. What changed is the wording of the
promotion notice — it said "Adaptive priority · <trigger> is active until <date>. Sections moved: S-02, S-03" and
now says that the most urgent information has been moved to the top. The trigger, the affected ids and the expiry
stay on `data-*`.

## 3. Share Result

One reusable `StateShareResult`, on every game family and every multi-state game — **ten instances, none on a
member row**.

**The link is governed, not invented.** `/{state}/{game}` is a preserved route that is **not implemented**, so
sharing it would hand someone a 404. The shared URL is the page that genuinely exists plus the family's own
existing in-page anchor (`#family-{familyId}`), which both surfaces already render. Origin and path are read from
the page at click time, so no host is hardcoded and the guarded preview cannot leak a production origin.

**A runtime defect was found and fixed while testing this.** `navigator.share` resolves when the share
*completes*, and on platforms that expose the API without a working sheet it never settles at all — headless
Chrome is one, and it left the button permanently silent and, because the guard was only released in `finally`,
un-retryable. The native attempt now runs in a bounded race: if it settles, its own result is reported; if it
does not, the link is copied instead and the message says "Link copied", which is exactly what happened.

The chain was then exercised end to end at runtime: native share rejected (`NotAllowedError`) → clipboard
rejected (`NotAllowedError` in that context) → the selectable link rendered. **No step claims success it did not
achieve**: "Link copied" is set only after `writeText` resolves, "Shared" only when the native promise won.

**Accessibility, verified at runtime.** Accessible name `Share Fantasy 5 result` · `<button type="button">` ·
`role="status" aria-live="polite"` present from first render and empty until there is news · focus never moves
(`focusUnmoved: true`) · `outlineWidth: 2px` on focus · zero dialogs · no popup and no login.

## 4. Result action hierarchy (§4)

| Surface | Actions |
|---|---|
| Native game family | History · Ask AI · Discuss this result · Share — plus the separate crimson **Buy Now** in the header |
| Powerball / Mega Millions | History · Discuss this result · Share · **Buy Now** — no AI action |
| State level (action row) | Ask AI · Discuss · **What changed** · Buy Now |
| Member rows | none |

Two changes to previously accepted arrangements, both because §4 specifies them:

- **The multi-state block lost its AI action.** §4's list omits it and states that the main State AI module
  remains the primary AI experience. Zero per block is still "at most one", so the no-per-family-chatbot
  guarantee is strengthened.
- **The featured panel regained its own actions.** LRG-STATE-037 FV-08 had reduced it to History alone because
  the action row beneath duplicated the rest. §4 supersedes that by giving the two strips different scopes: the
  card owns what belongs to *its result*, the row owns what belongs to *the State*, with `What changed` named
  explicitly as State-level. **Worth a founder look:** `Discuss` and `Buy Now` now appear in both strips within
  about 100px of each other on mobile. That follows §4 as written; if it reads as duplication in review, the
  row's copies are the ones to drop.

## 5. Discussion journey (§7)

`Discuss this result` on every result, `Join the discussion` / `Ask a question` in the community groups. The
internal vocabulary §7 names — community context, thread context, selected discussion object, posting state — is
absent, asserted. It is a plain `<a>`, no dialog, no dispatch.

**The production route still does not exist.** `/community` and `/community/{forum-entry-slug}` are preserved
routes owned by the community blueprint; there is no `app/community` directory. The governed S-14 fallback
applies, carrying the family's group id so the reader lands on the right conversation. **Recorded as the
remaining dependency.**

## 6. Future discussion model — recorded, not implemented

- **Florida Lottery Discussions** as the State community destination.
- **Monthly discussions** for daily-number families, where a month is the natural unit players already use.
- **Enduring discussions** for jackpot games, which do not reset.
- **Result and claim questions** as a standing area.
- **A correction/reporting entry** so a reader who spots something wrong has one obvious route.

Explicitly **not** a thread per draw created automatically, and no predictions presented as guidance.

## 7. Community presentation (§9)

Three visible groups, unchanged. Simple rows on hairline rules rather than application cards. The cold start is
now an invitation — *"Nobody has posted about Florida yet — so whatever you start here will be the first"* —
rather than a notice about missing data. No reply count, member count, avatar, "Trending", "Popular" or "Recent
Discussions" exists anywhere; asserted by name.

## 8. LotteryCorner destinations versus the operator's (§10)

They were one list, so a link that left the site sat beside one that did not. They are now two labelled groups.

**On LotteryCorner** — three real in-page destinations (draw schedule, jackpot movement, every game and its
result format) and three stated as **not published yet**: past results by date, yearly archives, correction
history. §10 forbids silently sending a reader to the operator in place of an unbuilt internal route, so an
unbuilt entry renders as a label with no link. Only `/` and `/[state]` are implemented in this application.

**Florida Lottery resources** — winning numbers, retailer locator, claim information, responsible play. Each is
a verified manifest fact rendered through a shared `ExternalLink`: the destination's own name, a decorative `↗`,
and a visually hidden "(opens Florida Lottery in a new tab)" so the arrow is never the only signal. No `VERIFIED`
or `OFFICIAL SOURCE` prefix.

## 9. Unfinished-looking content removed (§11)

- **The odds card is gone.** "Published odds and prize tiers: currently unavailable" is now one sentence: odds
  are not shown here, only ever from an official source, never computed or estimated — with the operator's
  destination inline.
- **Responsible play publishes.** The card said the contact was unavailable, which was misleading as well as
  unfinished-looking: the **destination is verified** and only the *helpline number* is not. Marking the whole
  resource unavailable over a missing phone number withheld working help. The link publishes; the number stays
  absent, with no claim either way.

Neither was replaced with "Coming soon" — asserted across every preview file. Unavailable treatments on the page:
**14 → 2 → 0** across the last three tasks.

## 10. Recent changes (§12)

Each line reported what a feed had done to a record: *"19 verified Florida draw results published"*, *"Powerball:
$435,000,000 now, $457,000,000 advertised for the next draw"*. The same governed facts now read as changes:
*"19 Florida results updated"*, *"Powerball jackpot changed"*. `View all changes` is deliberately absent — no
correction-history route exists, and §12 permits the link only when a real destination does.

## 11. Sources and methodology (§13)

Heading renamed from "Sources, responsible play and support"; the visual band's title renamed from "Where this
comes from". One concise governed explanation: LotteryCorner publishes Florida results from official lottery
sources and records corrections when information changes, and always verify a winning ticket with the operator.
The internal feed name, the citation codes, the access dates and the publication gate stay in the State Content
Manifest. **No research-citation syntax (`[O2]`, `[E1]`, `[P1]`) appears in any preview file** — asserted.

## 12. Popular questions (§14)

No new section. All three topics already exist as State AI prompts with deterministic answer paths — the next
draw, the state's own add-on (derived, not hardcoded) and the official claim steps.

## 13. Mobile and desktop review

390px: the concise line at 217px, Powerball/Mega Millions at 408px, the native family at 1,152px, its Share at
1,560px. No horizontal scroll, no dialog, zero unavailable blocks, 10 Share actions, 7 external links. The
document shrank from 9,228px to **8,906px**.

## 14. Visual evidence

`01`–`08` at 390px (source/freshness line · family actions with Share · Share "Link copied" · Share manual
fallback · community groups · LotteryCorner tools · Florida Lottery resources · Sources and methodology),
`09`–`12` at 1440px (top result actions · community · tools separation · trust area), plus `13` guard-off
Florida, `14` Home, `15` non-Florida State. The "Link copied" frame stubs `writeText` to resolve as it does on a
real device; the manual frame is the genuine headless outcome. Stored outside the repository.

## 15. Validation

| Check | Result |
|---|---|
| `git diff --check` | clean |
| lint · typecheck | ✓ · ✓ |
| tests | ✓ **363 pass, 0 fail** (357 offline + 6 runtime) |
| guard-on build | ✓ badges gone, Share served, 0 dialogs, 0 unavailable |
| guard-off build | ✓ `/fl` and Home differ from the pre-task baseline only by the build id; **0** `lcs-` |
| Home preview | ✓ identical to the post-038 baseline apart from the build id; 3 commerce triggers intact |
| production-ad baseline | ✓ same 10 slot keys, none added, removed or renamed |
| runtime Engagement V1 | ✓ all markers, plus a new runtime assertion that no badge or unavailable card is served |

## 16. Remaining community dependency

1. **`DS-37` / `OPEN-ST-06` remain OPEN.**
2. **`/community` and `/community/{forum-entry-slug}` are not implemented.** Every Discuss entry uses the
   governed S-14 fallback. This is now the single largest blocker to the engagement loop and is the recommended
   next task.
3. **Three LotteryCorner history destinations are unbuilt** — past results by date, yearly archives, correction
   history. They are stated rather than linked, and `View all changes` waits on the third.
4. **Scratch-Offs, Second Chance and the official app remain UNDER REVIEW** — no verified destinations.
5. **Tax and winner-anonymity guidance still needs a sourced dedicated page.**
6. **§4's two action strips sit close together on mobile** — see §4 above; a founder look is worth having.
7. **The runtime proof marker is still temporary** and must be removed before production.

---

# LRG-STATE-040 — Populated Internal News, Guides and Discussions

**Task:** LRG-STATE-040 · **Commit:** `fix: populate florida news guides and discussions` · **Baseline:**
`b8810ba` · **DS-37 remains OPEN.**

## 0. A note on the task text

The brief ends mid-§2, in the middle of the `StateLandingContent` interface. The member definitions for
`StateNewsItem`, `StateGuideItem`, `StateDiscussionItem`, `StatePromotion`, `StateOfficialResource` and
`StateTrustSummary`, and any sections after §2, are not in the text I received.

I implemented against the objective's nine numbered requirements and the container shape as given, inferring
each member from what those requirements ask for: tags and dates (§4), meaningful summaries and excerpts (§5),
internal content ownership (§6) and latest-first selection (§7). **Everything below marked *(inferred)* is a
field the brief implies but does not spell out**, and is the part most worth checking against the missing text.

## 1. The generic content model

`lib/state/stateLandingContent.ts` — jurisdiction-agnostic, with a test asserting no code in it names a state.

| Type | Fields | Inferred? |
|---|---|---|
| `StateContentItemBase` | `slug`, `title`, `summary`, `publishedAt`, `tags[]`, `origin`, `destination`, `supportingSource?` | *(inferred)* |
| `StateNewsItem` | + `familyId?` | *(inferred)* |
| `StateGuideItem` | + `readingMinutes` | *(inferred)* |
| `StateDiscussionItem` | + `groupKey`, `excerpt` | *(inferred)* |
| `StatePromotion` | `slug`, `title`, `body`, `placementKey`, `origin`, `destination` | *(inferred)* |
| `StateOfficialResource` | `label`, `url`, `purpose`, `lastVerified` | *(inferred)* |
| `StateTrustSummary` | `statement`, `verifyWith` | *(inferred)* |

It is a **view-model contract plus a seeded package, not a domain contract** — CLAUDE.md §14 and §15 are
explicit that a view model is not a domain contract and that fixtures do not become API contracts by accident.
No CMS, no API, no database.

## 2. How seeded content is prevented from passing as fact

The brief authorises seeded preview content. CLAUDE.md §14 forbids presenting synthetic content as real public
fact and names news and community activity specifically, and the Constitution forbids fabricating posts,
replies, reputation or activity. Both hold, by construction rather than by intention:

1. **`origin` is required on every item.** Nothing can be added without declaring itself `seededPreview` or
   `published`. Nothing carries `published` yet.
2. **The guard is the environment gate.** Guard-off output contains **zero** occurrences of `seededPreview` and
   zero `lcs-`, verified against the pre-task baseline.
3. **`assertNoFabricatedActivity` refuses the named fabrications** — author, username, avatar, reply count,
   view count, reputation, `trending`/`popular`, `lastPostAt` and twelve more — and runs at module load, so a
   package that adds one fails the build. **A test proves the guard bites**, not merely that it exists: adding
   `replyCount: 42` or `author` to a copy of the package throws.
4. **One honest line per hub**, not a badge per card — the news hub says the articles are example content and
   describe no winner, prize or claim; the discussion hub says the entries are example questions and not posts
   by members. LRG-STATE-039 removed badge repetition and this does not reintroduce it.
5. **Seeded copy is illustrative in voice, not inventive in fact.** Every item is built on something this page
   already publishes: the verified claim deadline, the verified schedule and cutoffs, the governed formats,
   Fireball, Double Play, the feed's jackpot movement.
6. **Nothing post-dates the feed** — asserted, so no article claims to have covered a draw the page has not
   published.
7. **No winner, unclaimed prize, expiry, prediction, hot/cold claim or urgency** — asserted by keyword over all
   seeded prose. S-11/S-12/S-13 stay suppressed, and a test holds S-12 suppressed so seeding cannot creep
   around it.

## 3. What is populated

| Hub | Content |
|---|---|
| **S-15 news** | 4 items — Powerball roll, Fantasy 5's two daily draws, the Mega Millions multiplier being included, Florida Lotto Double Play |
| **S-15 guides** | 4 items — claiming by amount, draw times vs sales cutoffs, what Fireball does, checking a ticket correctly |
| **S-14 discussions** | 4 entries across the three groups (2 daily / 1 jackpot / 1 help) |
| **Promotions** | 1, at the approved `state-return-loop` placement — never an ad anchor |
| **Official resources** | 4, in the one compact group |

12 cards, 24 tags, every card with a real title, summary/excerpt, date and tags. **No heading-only or
placeholder section** (§9). S-15 was suppressed by LRG-STATE-039 §9 for lack of content; the condition was the
content itself, so supplying it brought the section back with no flag to flip. A jurisdiction with no package
still suppresses — every state but Florida today.

## 4. Content ownership — enforced by the type system

`ContentDestination` has **no external variant**, so there is no expression that can produce an outbound link
from a news, guide, discussion or promotion card. Measured on the served page: **0 external links from any
card**, and **0 dead in-page anchors**.

An official source may still *support* an item — `supportingSource` records the label, URL and verification
date as editorial evidence. A test proves the card renderer cannot reach it.

**A second ownership fix the audit forced.** Eleven family cards each carried a `History` link to
`floridalottery.com/games/winning-numbers`, so the accepted result cards were the page's single largest source
of outbound traffic. `History` now resolves to this page's own history-and-tools section, which lists
LotteryCorner destinations first and offers the operator's archive from inside the permitted official group —
same destination, one hop later, internally. External links on the page fell **22 → 12**.

**The interpretation I made, and it is worth confirming.** §8 says "The only external Florida Lottery links
should appear in one compact official-resources section near the footer." Read absolutely, that would also undo
rulings from two tasks ago: LRG-STATE-038 §6 required publishing the official claim destination, §11 required
publishing the verified responsible-play link, FV-07 requires the resolver's official retailer outcome, and
LRG-STATE-038 §5 / LRG-STATE-039 §11 require the "check the official numbers" and "the operator publishes odds"
links. I applied the rule to its stated subject — content cards, now fully internal — and to the repeated
`History` links that had an internal equivalent, and left those six prior rulings standing. The remaining 12
external links sit in S-05 (1), S-06 (1), S-07 (2), S-08 (2), S-10 (4, the authorised group) and S-17 (2). **If
§8 was meant absolutely, say so and I will consolidate all of them into the S-10 group.**

## 5. Structure frozen (§1)

No governed section moved, no result changed, no ad mapping touched. Powerball and Mega Millions still first,
Fantasy 5 still the deterministic native selection, S-11/S-12/S-13 still suppressed — all asserted. CSS changes
are display-only: hairline-divided cards rather than twelve bordered boxes, two columns at ≥992px, tags as
pills. Production-ad baseline: same 10 slot keys, none added, removed or renamed.

## 6. Evidence and validation

Captures at 390px (news and guides, discussions) and 1440px, stored outside the repository. Document height
8,906px → 11,230px, which is what populating two hubs costs; no horizontal scroll at 390px.

| Check | Result |
|---|---|
| `git diff --check` · lint · typecheck | clean · clean · clean |
| tests | ✓ **376 pass, 0 fail** (370 offline + 6 runtime) |
| guard-on / guard-off / production-ad | ✓ · ✓ (byte-identical to baseline but the build id; **0** seeded) · ✓ same 10 slots |
| Home non-regression | ✓ no Home file in the diff |

## 7. Remaining dependencies

1. **`DS-37` / `OPEN-ST-06` remain OPEN.**
2. **The §2 interface members were inferred** — see §0. Worth reconciling against the missing task text.
3. **`/news/{slug}`, `/community/{slug}` and the guide routes are not implemented.** Every card currently
   resolves to an in-page anchor; the moment those routes exist, `destination` becomes
   `{ kind: "route", ... }` and nothing else changes.
4. **All content is `seededPreview`.** Replacing it with real editorial is a content task, not a code change:
   the shape is the shape a real package will use.
5. **Only Florida has a package.** Every other state's hubs suppress honestly.
6. **§8's scope needs confirming** — see §4.
7. **The runtime proof marker is still temporary.**

---

# LRG-STATE-042 — Approved Lower-Page Integration

**Task:** LRG-STATE-042 · **Commit:** `feat: integrate approved florida lower experience` · **Baseline:**
`70d2c27` · **DS-37 remains OPEN.**

## 1. Approved design-lab outcome

LRG-STATE-041's design lab was approved. Its composition was **moved** into the State implementation, not
re-created: the same five treatments, hierarchy, drawn cues and interaction model, with selectors renamed from
`lcd-` to State-owned `lcs-lp-`. No Home-owned selector was touched.

## 2. Integration boundary

The accepted upper experience is untouched: identity and freshness, Powerball and Mega Millions, the
Florida-native family, member rows, result grammar, result actions and Share, inline AI, upcoming draws,
ticket-check guidance, Buy Now, claim help, and the top What Changed interaction. No result component, ordering
or format changed.

## 3. Five-band composition, and the PF-02 reconciliation

Visual bands are now `results` · `play-and-help` · **`explore`** · **`editorial`** · **`community`** ·
**`resources`**. The rejected `updates-and-discovery` ("Updates, history and community") and
`trust-and-navigation` ("Sources and methodology") wrappers are gone by name.

| Approved band | Governed section | Anchor | Ads |
|---|---|---|---|
| 1 Explore Florida Lottery | S-10 | `#state-tools` | hosts AD-S03 (rail + inline) |
| 2 Latest from Florida | S-15 | `#news` | — |
| 3 Florida guides and answers | S-15 (same section) | `#news` | — |
| 4 Florida community | S-14 | `#community` | — |
| 5 Resources and player support | S-18 | `#state-sources` | hosts AD-S04 (rail + inline) |

**The reconciliation, stated plainly.** The manifest orders S-14 (19) before S-15 (20), which would put
community before news. The founder's lower-page ruling authorises the visual composition, so
`approvedLowerOrder()` in `stateVisualBands.ts` swaps exactly that one pair in the reading order while every
section keeps its governed id, anchor and ad host. It is a single, centralised, tested decision — a test asserts
that **only** S-14 and S-15 move and nothing else does. The frozen blueprint was not modified.

S-09, S-16 and S-17 no longer render. S-17's trust and independence sentences survive as the Resources band's
copy. S-11 to S-13 stay suppressed on their own evidence grounds.

## 4. State-neutral content package

`lib/state/stateLowerPageContent.ts` — view data only, no jurisdiction named, no API/CMS/database contract, no
provenance registry. It **replaces** LRG-STATE-040's `stateLandingContent.ts`, which was shaped around the
rejected composition; keeping both would have left two competing architectures for one region, which §3 forbids.

Carried over: the ownership rule expressed in the type (`LowerDestination` has no external variant, so a card
cannot link outward) and the structural refusal of fabricated social proof, which runs at module load.

`lib/state/floridaLowerPageContent.ts` is the only file naming Florida content. Every band component reads the
generic shape and contains no Florida branch. No public copy lives in JSX.

## 5. Band-by-band

- **Explore** — the four approved cards with drawn cues. Draw schedule, Claiming a prize and Florida games
  resolve to real in-page anchors; Results calendar has no route yet, so it opens a concise inline disclosure
  that still tells the reader where today's results are. No "not published yet", no redirect to the operator.
- **Latest from Florida** — one featured story (24px mobile / 32px desktop) against three supporting rows
  (17px). No images anywhere in the bands beyond the accepted result logos. Every action opens an inline
  article preview; no modal, no invented URL, no external link on a card. **The Bonus Play promotion carries
  `visibleUntil: "2026-09-20"`** and disappears after it unless marked `archived` — time behaviour is data, and
  no freshness vocabulary is shown.
- **Guides** — three instructional cards, **three takeaways on desktop and two on mobile** with a small `More`
  disclosure, done in CSS so every takeaway stays in the server HTML. Ask AI focuses the existing shared
  surface at `#state-ai-brief`; no second AI system.
- **Community** — the approved intro with the **one approved correction, "for Florida lottery players"**. Three
  conversation cards on a tinted surface, borderless and rounded, visibly different from news. No user, avatar,
  count or trending label — refused structurally.
- **Resources** — a compact chip strip immediately above the footer: 265px tall at desktop, 421px at 390px.
  Four external official actions each with `↗` and a hidden "opens … in a new tab", plus the internal
  Corrections policy. One trust sentence, one independence sentence, no methodology essay.

## 6. Rejected lower page removed

Render calls removed, not hidden: the Recent-changes block, the history-and-tools directory, the standalone
jackpot-movement log, the old community layout, the old news-and-guides columns, the "Come back to Florida"
essay, the old Sources-and-methodology sections and the All States body. `StateCommunity.tsx` was deleted and
the four obsolete section functions removed from `StateLowerSections.tsx` and `StateDraftSections.tsx`.

Verified on the served page: **every rejected phrase counts zero**, and there are **no duplicate DOM ids**. The
`#jackpot-movement` anchor went with its log; the manifest still records the destination and the anchor test
documents the exemption rather than silently passing.

## 7. Advertising

**Same ten slot keys, identical to the baseline** — none added, removed, renamed or re-mapped. `stateAdBaseline`
was not touched, which is why the mapping still resolves: S-10 and S-18 remain the hosts, now wrapping the
Explore and Resources bands. AD-S03 sits at the Explore/Latest boundary and AD-S04 above the footer — clean
boundaries between bands. No ad splits a card or appears inside a guide or community card, and none precedes
the first useful result.

## 8. Mobile and desktop

| Width | Horiz. | Dialogs | Targets <44px | Body <16px | Takeaways | Feature/row | Tiles | Slots |
|---|---|---|---|---|---|---|---|---|
| 320 | none | 0 | 0 | 0 | 2 | 24/17px | 1 col | 10 |
| 375 / 390 | none | 0 | 0 | 0 | 2 | 24/17px | 2 col | 10 |
| 992 / 1280 / 1440 | none | 0 | 0 | 0 | 3 | 32/17px | 4 col | 10 |

## 9. Evidence

Captures at 390px (upper→Explore transition, Explore, Latest, Guides, Community, Resources) and 1440px
(transition, Explore + featured news, news composition, guides + community, resources strip, full page), plus
guard-off `/fl`, Home and a non-Florida State. Stored outside the repository.

## 10. Design lab removed

`/design-lab/state/florida-content` returns **404** in both guard states — the route, its components, its
preview data and its tests are deleted. The packet and the review document remain tracked as evidence.

## 11. Remaining product dependencies

1. **`DS-37` / `OPEN-ST-06` remain OPEN.**
2. **No article, guide or community route exists.** `/news/{slug}`, the guide routes and
   `/community/{forum-entry-slug}` are preserved patterns with no implementation, so those cards open inline
   previews. When a route ships, only the `destination` in the Florida data changes.
3. **A results-calendar route** would replace the one Explore card that has no in-page equivalent.
4. **All lower-page content is founder-approved packet copy**, not a live editorial service.
5. **The featured story is a winner story.** It is packet-fixed content and rendered verbatim, but `/fl` keeps
   S-12 (Winners and Unclaimed Prizes) suppressed because winner records are unverified. This is now live in
   the guarded preview — the founder-review question raised in the design-lab review still stands.
6. **The runtime proof marker is still temporary.**

---

# LRG-STATE-043 — Final State Template SEO and JSON Configuration

**Task:** LRG-STATE-043 · **Commit:** `fix: finalize state template seo and json config` · **Baseline:**
`fa71300` · **DS-37 remains OPEN.**

## 1. JSON ownership boundary

`config/states/fl.json` (schemaVersion `1.0`) owns **static State identity, SEO copy, presentation references
and approved public content** — nothing else. Loaded through `lib/state/stateViewConfig.ts`, which validates it
and projects it into the lower-page view shape the approved band components already consume, so the components
were not touched and the rendered output is identical.

`floridaLowerPageContent.ts` survives as the typed, validated door onto the JSON, keeping the safety guarantee
(`assertLowerPageContentSafe`) in TypeScript where behaviour belongs.

## 2. Contracts that stay separate

| Concern | Owner |
|---|---|
| Sourced publication facts and provenance | Florida Content Manifest |
| Result mechanics — ball counts, Fireball, Double Play, multipliers, effective dates | result-format registry |
| Current numbers, dates, jackpots, cash values, next prizes, status, corrections, freshness | runtime provider |
| Commerce eligibility | Buy Now capability contract |

The validator **refuses runtime field names structurally** (`winningNumbers`, `jackpotAmount`, `drawDateIso`,
`lastUpdatedIso`, `currentStatus`, `cashValue`, `nextPrize`, `resultDate`), so a stale fact cannot be frozen into
static configuration by a later edit. It also refuses duplicate ids, non-HTTPS official destinations, an
outbound card destination, a bad canonical path, an unknown schemaVersion, and the phrases "coming soon" and
"not published yet". Every error names the configuration path and the field.

No generic component names Florida or branches on a state code — asserted.

## 3. Metadata

Title and description come from validated configuration, emitted in raw server HTML:

- `Florida Lottery Results Today, Winning Numbers & Jackpots | LotteryCorner`
- `Florida lottery results today for Powerball, Mega Millions, Fantasy 5, Florida Lotto, Pick games and more.
  Check winning numbers, draw times, jackpots and claim help.`

`title.absolute` is used deliberately: without it the root layout's template produced
`… | LotteryCorner | Lottery Corner` — two site suffixes, which SEO-01's "one title" forbids. Open Graph and
Twitter come from the same configuration; the card is `summary` rather than `summary_large_image` because no
approved brand image asset exists (see §7).

## 4. Canonical host and path

`https://lotterycorner.com/fl` — absolute, non-`www`, no trailing slash, no fragment, one `<link rel="canonical">`
in server HTML. Built from `PRODUCTION_ORIGIN` in `lib/seo/productionOrigin.ts`, a constant rather than a request
header, which is the mechanism that makes a local or preview host structurally unable to become a canonical.

**The recorded tension, reported not resolved.** `FD-S-32` **defers** the canonical/host/trailing-slash decision
and says not to emit a new canonical convention during State preview implementation, and `source-conflicts.md`
records fixtures carrying the `www` form. The active task instruction is tier 1 in CLAUDE.md's hierarchy and
names the non-`www` target explicitly — matching the target §11 already records — so it settles the host for this
task. It is safe to act on because the page carrying the canonical is `noindex, nofollow`, so no signal reaches a
crawler before the cutover. **No host migration, redirect or trailing-slash change was made.**

## 5. Preview robots and the cutover

Guarded preview: `noindex, nofollow`, preview marker retained. **Guard-off `/fl` is unchanged** — the
configuration-driven metadata is scoped to the preview. An earlier revision applied it whenever a configuration
existed, which gave guard-off `/fl` the new title, a canonical and `index, follow`; that violated SEO-04 and was
corrected.

**The exact cutover, in one place** — in `app/[state]/page.tsx`, drop `&& isPreview` from the config branch and
change `robots` to `{ index: true, follow: true }`.

## 6. Sitemap readiness

`lib/seo/sitemapEntries.ts` is a pure, tested generator reading the governed supported-State registry and
validated configuration — never a filename. `lastModified` is emitted only from a supplied truthful signal and
omitted otherwise; there is no `Date.now()` or `new Date()` in the module. `/design-lab` and `/buynow` can never
enter a sitemap.

**Deliberately not wired to `app/sitemap.ts`, and no `robots.txt` added.** There is no sitemap in this
application today, so creating one would be a new production behaviour with no cutover decision behind it, which
MAP-02 forbids. **The cutover is one flag:** create `app/sitemap.ts` returning
`sitemapEntries({ includePreviewJurisdictions: true })`, once the template is `index, follow`. A `noindex` page
must not be advertised in a sitemap.

## 7. Structured data

One server-rendered graph: `CollectionPage` + `BreadcrumbList`, and nothing else.

`CollectionPage` carries `@id` (`canonical#webpage`), `url`, `name` (site suffix stripped), `description`,
`inLanguage: en-US`, `dateModified` from the governed freshness value, `isPartOf` → WebSite `@id`, `publisher` →
Organization `@id`, `breadcrumb` → breadcrumb `@id`, and `about` as a neutral `Thing` named "Florida Lottery".
`dateModified` is **omitted** when no truthful signal exists rather than substituted with a build time.

**A real defect the audit caught.** `Organization` had **no `@id` at all** and `WebSite`'s `@id` used the `www`
host, so both State references dangled. SD-02's authorised correction was applied at its **smallest**: only the
two `@id` values move to the governed origin. `SITE_URL` is untouched, so `Organization.url`, `logo`, `WebPage`
and `ItemList` stay byte-identical and Home's composition is not reopened. Guard-off Home now differs by exactly
those two `@id` lines and nothing else. Residual inconsistency recorded: `Organization.@id` is non-`www` while
its `url` is still `www` — aligning `url` belongs to the canonical cutover.

A visible breadcrumb was added so the graph describes something on the page; visible and JSON-LD agree.

**No `ItemList`** — SD-03 requires genuine canonical internal URLs, and the cards resolve to in-page anchors and
inline previews today. **No prohibited type** — FAQPage, QAPage, DiscussionForumPosting, Article, NewsArticle,
Event, Offer, Product, Dataset, Review, AggregateRating are all absent, asserted by name.

## 8. FAQ decision

No FAQ section added, no `FAQPage` emitted. The guides, AI prompts, claim help and community questions already
carry that intent.

## 9. Search favicon — asset gap, not invented

**There is no favicon in this application.** `public/` contains only `game-logos` and `home-preview`; the root
layout declares no `icons`. The only existing LotteryCorner marks are legacy rasters — `cornerfavicon.png` at
**32×28** and `fav-icon.png` at **24×26** — both below ICON-01's 48×48 search minimum and neither square, and
the legacy gold star belongs to the previous identity rather than the current navy/crimson direction.

ICON-02 forbids inventing an icon and directs recording a founder asset decision instead, so **nothing was
fabricated and no metadata points at a missing file**. A test pins that no invented asset appeared.

**ICON-04 audit finding:** `organizationSchema()` references `${SITE_URL}/logo.png`, and `public/logo.png` does
not exist — the Organization logo is currently uncrawlable. Reported, not redesigned.

**Founder decision needed:** supply an approved square LotteryCorner mark at ≥48×48 (and ≥112×112 for the
Organization logo), or approve deriving one from the mark in the proposed design.

## 10. Raw HTML and internal links

Verified present in the raw server response without a click or client fetch: title, description, canonical,
robots, one H1, the freshness sentence, Powerball, Mega Millions, the first native family, additional games,
the Explore heading, **all four news titles and summaries, all three guide titles and summaries, all three
community titles and excerpts**, the resource actions, the trust and independence copy, and the JSON-LD.

Internal links: no fake internal URL, no internal journey silently sent to the operator, no news/guide/community
card linking externally, official external links limited to the four resource actions plus the accepted upper
claim/commerce handoffs, no broken fragment, no duplicate DOM id.

## 11. Advertising and visual freeze

Same **ten** slot keys, identical to the baseline; no definition or mapping touched. A structural DOM comparison
against the approved integration matches on **band order, section ids, every explore/news/guide/discussion key in
document order, all ten slot keys and every H2** — the visual freeze holds by construction, since the JSON was
generated from the previous values.

## 12. Remaining dependencies

1. **`DS-37` / `OPEN-ST-06` remain OPEN.**
2. **Robots/sitemap cutover** — two documented one-line changes, both deliberately inactive.
3. **Favicon and Organization logo assets** — founder decision, §9.
4. **`FD-S-32` canonical deferral** — the canonical is emitted on a `noindex` preview only; production cutover
   still needs the host/redirect/trailing-slash decision.
5. **No article, guide, community or results-calendar route** — until they exist there can be no `ItemList` and
   the cards keep their inline previews.
6. **Only Florida is configured.** Cross-State rollout is deferred by JSON-06.
7. **The runtime proof marker is still temporary.**

---

# LRG-IDENTITY-044 — Search Identity Assets

**Task:** LRG-IDENTITY-044 · **Commit:** `fix: add lotterycorner search identity assets` · **Baseline:**
`4e018d0`. Closes the asset gap LRG-STATE-043 §9 recorded.

## The approved mark, and its provenance

Nothing was designed, recoloured or generated. The source is the **production LotteryCorner favicon**,
`00-reference-existing-project/LotteryCorner40/WebContent/favicon.ico` — read-only; the legacy tree is
unmodified. It is a genuine multi-resolution ICO containing **seven square sizes: 16, 24, 32, 48, 64, 96 and
128**, all 32bpp with alpha.

The mark is a deep-indigo (`#09005b`) rounded square carrying a white star. Square, no wordmark, and still
legible at 16px — 48–56% of each raster is opaque ink, which is why it survives small sizes.

**Why this and not the logo.** `images/logo.png` is a 362×99 wordmark (star-in-a-box plus "Lottery Corner"); at
favicon size its words become unreadable, which the task forbids. Every other candidate was too small or not
square: `cornerfavicon.png` 32×28, `fav-icon.png` 24×26, `logo-white.png` 149×26, `logo-header.png` 250×42.

## Files installed

| File | Size | Role |
|---|---|---|
| `public/favicon.ico` | 7 sizes, 16→128 | Byte-identical copy of the approved production ICO |
| `public/icon-48.png` | 48×48 | Extracted from that ICO, unaltered |
| `public/icon-96.png` | 96×96 | Extracted from that ICO, unaltered |
| `public/logo.png` | 128×128 | Organization JSON-LD logo — clears Google's 112×112 minimum |

A test asserts `public/favicon.ico` stays byte-identical to the approved source, so a later silent edit fails.

## Metadata

`icons` is declared **once, in the root layout**, so Home and every State page inherit the same icon — verified
in the raw HTML of both `/` and `/fl`. Sizes and MIME types are explicit because Google selects by declared size
and ignores anything under 48px for search results.

Deliberately not declared: an Apple touch icon (not requested) and an Open Graph image (a different asset with
different dimensions). The Organization logo is `/logo.png`, referenced from `siteSchema.ts` — a different
concern from the favicon, and kept so.

## Organization logo

The dangling reference is resolved: `organizationSchema()` points at `${SITE_URL}/logo.png` and that file now
exists, serving `200 image/png`. **Residual item, unchanged from LRG-STATE-043 §7:** the URL still uses the
`www` host from the provisional `SITE_URL` while the node's `@id` is non-`www`. The path resolves; aligning the
host belongs to the canonical cutover, and `SITE_URL` was not touched here because Home is locked.

## Validation

All four assets serve `200` with correct MIME types. **Guarded `/fl` body unchanged** (zero differences outside
the RSC payload) and **Home is pixel-identical** to its pre-task capture at 1440×900. The only markup change
anywhere is the four icon `<link>` tags. No schema, composition, route, advertising or content file is in the
diff. Lint, typecheck and **385 tests** pass.

---

# LRG-SHELL-045 — Global Footer Integration (State note)

- **The global footer now renders on `/fl`.** It previously did not: the layout suppressed the legacy footer
  under the preview flag and only Home supplied its own. One shared `GlobalFooter` is now rendered from the
  root layout for every route in both shells. See
  `03-docs/03-experience-architecture/global-footer-implementation.md`.
- **The Florida resources band is not duplicated.** Verify results, Find a retailer, Claim information,
  Responsible play and every `floridalottery.com` destination remain in the State band only. The footer adds
  the jurisdiction-neutral legal-age sentence, `18+ in Florida` from `config/states/fl.json`, the national
  helpline, and global legal/transparency links.
- **Florida content above the footer is unchanged** — zero differing fragments in `#state-main`, and the same
  ten advertisement slot keys.
- **DS-37 / OPEN-ST-06 is CLOSED** for the guarded Florida anonymous State template, recorded in
  `03-docs/08-decisions/state-page-founder-decisions.md`. Closure covers visual structure and content direction
  only — not production route cutover, canonical migration, robots/sitemap activation, live services, the
  missing internal routes, or cross-State completion.

---

# LRG-STATE-047 — Florida now runs through the generic State path (State note)

- **Florida is served by the generic State template.** Its configuration is resolved from the one governed
  registry, its family composition from `config/states/fl.json`, its runtime results through
  `drawEventsFor("fl")`, its families through `buildStateFamilies(...)`, and its advertising, commerce and
  lower-page content through the resolved model. Nothing is imported by jurisdiction any more.
- **No Florida-specific component branch remains.** Every Florida lookup is a table keyed by state code, and
  a test asserts that no generic module or component compares a state code or references a `FLORIDA_*`
  constant.
- **Visual non-regression is proved, not asserted.** Guarded `/fl` was diffed against a build of baseline
  `1b14cbd`: the HTML is identical once HTML comments are removed — the only raw differences are the Next.js
  build-id marker and three React text-node separators that moved when two static strings became
  interpolations. Section order, band order, the ten advertisement slot keys, family order, the H1, every H2,
  the 99 number balls and the 14 footer links all match. Home shows zero differing fragments, and guard-off
  `/fl` is byte-identical.
- **`floridaFamilyBuilder.ts` and `floridaFamilyConfig.ts` are retained as the non-regression oracle.** They
  are no longer used by the application; the test suite proves the generic builder's output is deep-equal to
  the Florida builder's, and the JSON family composition deep-equal to the TypeScript one.
- **Reference-template status is retained.** Florida remains the locked visual and content reference for the
  State page family, and the five States added alongside it are guarded previews only.
- **DS-37 / OPEN-ST-06 is not reopened.** This task changed no Florida pixel, no Florida copy and no Florida
  advertisement.
