# Home Preview — Founder Review

**Document type:** Approval checklist for Preview Track P2 → P3
**Recorded by:** Task LRG-SPEC-007
**Date:** July 26, 2026
**Status:** **P3 AUTHORIZED — July 26, 2026.** Six decisions recorded (see §5). Items 1–2 and 7–20 remain open for the P4 visual review.
**Companions:** `shared-shell-and-home-preview-specification.md`, `home-preview-section-manifest.md`, `home-preview-view-model.md`, `home-preview-responsive-contract.md`, `home-preview-implementation-plan.md`

**How to use:** record **APPROVE** or **ADJUST** (with the change you want) in the Decision column of §2, then record the P3 authorization in §5.

> **Status of this checklist.** Items **3, 4, 5 and 6** were decided on July 26, 2026 and P3 was authorized — see **§5**. Items **1, 2 and 7–20** are still blank and are the subject of the **P4 visual review**, once the preview can be seen in a browser.

---

## 1. Already Locked — Not Up for Review

These were decided in DS-DEC-001 (July 25, 2026) and are applied throughout the specification. Listed so you can see what is already settled and skip past it.

| Locked decision | Ref |
|---|---|
| **Blue for primary actions**, navigation emphasis and links | DS-02 |
| **Red reserved** for corrections, errors, critical alerts and destructive actions | DS-03 |
| Semantic colour-role system adopted | DS-01 |
| **WCAG 2.2 AA** minimum | DS-18 |
| **Special balls use colour + label + border/shape + accessible name** | DS-11, DS-14 |
| **Single named 992 px threshold** (frontend; ad-ops validation still pending) | DS-20 |
| **System sans font stack**, no paid font | DS-08, DS-31 |
| **16 px minimum mobile body text** | DS-09 |
| **Border-first cards**, restrained elevation, max one nesting level | DS-07 |
| Tabular numerals for numbers, jackpots, dates, times, odds | DS-10 |
| Focus-visible system; reduced motion; no silently-disabled controls | DS-15, DS-16, DS-17 |
| Game-defined ordering preserved; numbers as crawlable text | DS-12, DS-13 |
| **Dark mode DEFERRED** — light only | DS-30 |
| **Preview ads inactive** — labelled reserved placeholders, no partner scripts | DS-22, DS-23, DS-25 |
| No-fill collapses inner creative, retains outer geometry | DS-24 |
| Sticky priority: safety → bottom nav → user action → advertising | DS-28 |
| Seven attribution treatments, none colour-only | DS-29 |
| Icon library, brand font, logo redesign, page-specific ad volume, final high-fidelity approval | DS-31–DS-33, DS-35, DS-37 — all DEFERRED |

---

## 2. Decisions for This Review

| # | Item | Proposed direction | Evidence | Decision |
|---|---|---|---|---|
| **1** | **Shell visual hierarchy** | Header carries highest authority above all content; jackpot ticker is a supporting band that must not outrank the page's primary answer; contextual rail is subordinate and appears only at ≥992 px; footer lowest but fully reachable | Global Shell §0.2, §17, §20; spec §3 | |
| **2** | **Home visual hierarchy** | H-01 task entry first → H-02A featured national games and H-03 latest results carry the strongest weight → discovery below current utility → community/news/blog below that → return/directory lowest before trust. Visual weight follows **task** priority, never commercial priority | BP-02 §11 first-viewport contract, §12; Constitution §7; spec §4 | |
| **3** | **Content maximum width** *(previously open, B-02)* | **1280 px**, replacing the current 1152 px container. Prose constrained to 65–75ch; tables and result grids may use full content width | Global Shell §20 "approximately 1280 px"; spec §5.8 | **APPROVE** — 1280 px |
| **4** | **Density** *(previously open, B-03)* | **Compact** for H-01, H-02A, H-03, H-06A; **standard** elsewhere; **max one card-nesting level on mobile**. Final mobile density stays reserved for page-family review | Global Shell §21, §154; spec §5.8 | **APPROVE** — compact first viewport, standard density below the first task area |
| **5** | **Weight policy** *(previously open, T-04)* | **400 / 600 / 700 / 800 only — no thin weights** | Global Shell §19; audited usage (semibold 50×, bold 38×, extrabold 4×); spec §5.8 | **APPROVE** — 400 / 600 / 700 / 800 |
| **6** | **44 × 44 target policy** *(previously open, S-05)* | **44 × 44 CSS px where practical**; never below the WCAG 2.5.8 floor (24 × 24) without sufficient spacing or an equivalent control | Global Shell §143; DS-18 already binds the WCAG floor; spec §5.8 | **APPROVE** — 44×44 px where practical |
| **7** | **Header height** | Compact: single row at mobile widths; single row plus inline nav at ≥992 px. Sticky, with a compliant bottom boundary and `--elevation-1` when stuck. **Must not consume excessive viewport height** — the first-viewport contract requires task entry, jackpot orientation and results before the first normal ad | Global Shell §147; BP-02 §11 | |
| **8** | **Navigation treatment** | Inline primary nav at ≥992 px; **bottom navigation with text labels** below. Mega menus open by button with `aria-expanded`/`aria-controls`, Escape closes, focus returns. Routes that do not exist render **explicitly labelled unavailable** — no route is created to satisfy navigation. **Wording** (`Community`/`Forums`, `My LotteryCorner`/`Insider`, long/short AI labels) remains a **proposal pending label testing**, not a final decision | Global Shell §3.2, §6.2, §144; spec §3 | |
| **9** | **Jackpot ticker treatment** | Full-bleed band on `--color-surface-band` `#E9EDF2`; tabular numerals; mandatory **"estimated jackpot"** wording; exact dates where "tonight" would be ambiguous; scrolls in-container with a visible affordance. Muted text on the band now measures **6.35:1**, fixing the previous 3.91:1 failure | Constitution §15; spec §5.3; computed contrast | |
| **10** | **Card radius and border treatment** | **Border-first**: `--color-border` `#7F8794` at **3.62:1**, `--radius-md` 8 px, `--elevation-0` by default. Necessary because surface-vs-canvas separation is only **1.07:1** — a card without a compliant border is not perceivable | DS-07; computed contrast; spec §5.1, §5.7 | |
| **11** | **Result-ball dimensions** | 32 px mobile → 36 px desktop, `--radius-full`, 8 px gaps, result number 16–20 → 18–22 px at 700 weight with tabular numerals. Rows must wrap cleanly through 20+1 sets (Keno/Quick Draw) | Global Shell §146; spec §5.7 | |
| **12** | **Primary-result prominence** | H-02A and H-03 are the **strongest** elements after the H-01 entry, tier-0 protected (no ad inside), and reachable in the first viewport at 320 px | BP-02 §11, §57; spec §4 | |
| **13** | **Contextual rail width** | **300 px** at ≥992 px, accommodating the 300 px-wide production creatives. At exactly 992 px this leaves a **596 px** main column — must be verified for crowding | Global Shell §20; responsive contract §2 | |
| **14** | **Filled-ad placeholder** | Reserved geometry from each slot's own size mapping + visible "Advertisement" label at the **12 px** floor (raised from ~10.4 px) + a clearly marked **non-advertising** placeholder block on `--color-ad-placeholder` `#F1F3F6`, deliberately distinct from the information-callout surface | DS-23; Global Shell §122; spec §5.4 | |
| **15** | **No-fill placeholder** | **Outer placement geometry retained; inner creative area collapsed; label suppressed.** Zero layout shift, no empty-box impression. Every page must be validated with **all slots unfilled** | DS-24; **ad-operations validation still pending** (DS-36) | |
| **16** | **Inactive sticky reservation** | Labelled inactive reservation that **asserts no final production creative height**. Close control ≥44 px adding no height. Clearance **derived** from reserved height + bottom-nav height, replacing the hardcoded `pb-28` | DS-27; production height unresolved (DS-26, DS-34) | |
| **17** | **Mobile bottom navigation** | GS-09 with **text labels**, safe-area insets, bypassable by assistive technology, **priority 2** — outranks advertising. The sticky reservation sits above it with safe spacing or is suppressed. The affiliate action bar is **suppressed in the preview** to avoid a third competing layer | Global Shell §6.2, §6.4, §144; DS-28 | |
| **18** | **AI entry treatment** | H-05 sits **after** current utility, in a bounded region labelled "LotteryCorner AI" using `--color-ai` `#00706E` (**5.93:1**, fixing the reference value's 2.97:1). **Deterministic fallback only** in the preview — no generated content, no prediction language. A compact "Ask AI" action may appear in H-01 on small screens. **No floating chat bubble as the AI strategy** | Constitution §13; Global Shell §10.5, §145; BP-02 §11 | |
| **19** | **Correction notice** | `--color-alert` `#C73A3A` (**5.13:1**), stating **what changed, when, and the impact**, adjacent to the affected value, **static and persistent** — never a transient flash. One representative correction is included in the preview to exercise the state | Global Shell §126; DS-03 | |
| **20** | **Footer treatment** | `--color-brand-navy` `#0B1F3A` with inverse text at **16.52:1**, rendered from `footer-config.json`'s **real production links**. Trust, policy, support, responsible play, 18+ and independence disclaimer all present. Link targets that do not yet exist are **marked, never removed** | Global Shell §10; spec §5.1 | |

---

## 3. Points Worth Your Attention

Three things surfaced during specification that you may want to weigh before approving:

1. **Eight of the 23 Home content sections have no adequate data** (H-04, H-05, H-10, H-12, H-13, H-14, H-14A, plus the AD-H06 sticky). They render as **clearly labelled preview states** rather than being omitted — the blueprint marks none of them conditional. The preview will therefore look partly "scaffolded" in its lower half. That is intentional and honest, not an implementation gap.

2. **Four sections carry synthetic lottery-like content** (H-08 winner/unclaimed highlights, H-10A winner stories, H-11 news, H-11A blog). They will render **with visible synthetic labels**. If you would prefer them shown as empty labelled states instead of labelled synthetic content, say so at item 2 — it is a one-line change to the manifest.

3. **The fixture's timestamps are July 2026** and older than the freshness window. The preview will show them truthfully and mark affected sections **stale**, rather than refreshing them to look current. You will see stale indicators on results. Confirm that is what you want to see, or ask for refreshed fixture timestamps as a separate data task.

---

## 4. Still Unresolved — Not Decided Here

These continue to block their respective production phases and are **not** resolved by this specification or by P3:

| Item | Owner | Blocks |
|---|---|---|
| Sticky-ad production creative height — Home sticky's mapping permits a 280 px mobile creative against a 50 px reservation | **Ad operations** | Phase 8 |
| Ad-operations confirmation of the 992 px threshold after live-ad testing | **Ad operations** | production ad delivery |
| Ad-operations confirmation of no-fill behaviour | **Ad operations** | Phase 8 |
| 13 unmapped ad slots, plus `hp_video` unreferenced on Home | Ad operations | State/Home ad audits |
| Canonical host and trailing-slash migration | Founder + SEO | Phase 23 |
| `/play/{game}` versus `/buynow/{code}` | Founder + commerce | Phase 12 |
| Page-specific ad volume | Founder + ad ops | per-family review |
| Final high-fidelity visual approval | Founder + design | every page family |
| 11 open Member/Insider Part 22 decisions | **Founder** | Phase 19 |
| Node version pinning; tests and CI | Frontend | Phase 5 |

---

## 5. P3 Authorization

Record one:

**Decision date:** July 26, 2026 · **Recorded by:** Task LRG-UI-008

| Choice | Meaning | Selection |
|---|---|---|
| **APPROVE P3 IMPLEMENTATION** | Proceed with the browser-rendered Home preview exactly as specified | ✅ **SELECTED** |
| **APPROVE WITH ADJUSTMENTS** | Proceed after applying the adjustments recorded in §2 and §3 | |
| **DO NOT IMPLEMENT YET** | Hold P3; specification needs revision first | |

### Founder decisions recorded for P3

| # | Decision | Status |
|---|---|---|
| 1 | **Content maximum width** | **APPROVED — 1280 px** (checklist item 3) |
| 2 | **Density** | **APPROVED — compact first viewport, standard density below the first task area** (checklist item 4) |
| 3 | **Typography weights** | **APPROVED — 400 / 600 / 700 / 800** (checklist item 5) |
| 4 | **Interactive target sizing** | **APPROVED — minimum 44×44 CSS px wherever practical** (checklist item 6) |
| 5 | **Illustrative preview content** | **APPROVED WITH VISIBLE LABELLING.** Clearly labelled illustrative content is used instead of blank sections where visual review requires content. Every illustrative area displays a visible label (`Illustrative preview` / `Preview content`). Illustrative content MUST NOT be presented as live results, real winners, current jackpots, actual claim deadlines, authoritative tax guidance or genuine community activity. *(Resolves attention point 2 in §3 in favour of labelled illustrative content.)* |
| 6 | **Stale production-derived data** | **APPROVED WITH VISIBLE STALE STATE.** Production-derived fixture dates remain **unchanged**; a visible stale-data state is shown when old. *(Resolves attention point 3 in §3.)* |
| 7 | **P3 implementation status** | **APPROVED** |

### P4/P5 refinement round — LRG-UI-009 (July 26, 2026)

Founder visual review of the P3 preview produced a second round of directions, applied by task
LRG-UI-009. **This was a refinement, not a rebuild:** the BP-02 section order, all 23 content
sections, all 7 ad anchors, the 992 px threshold, preview safety, accessibility and the legacy Home
fallback are unchanged.

| # | Direction | Applied |
|---|---|---|
| 1 | Powerball and Mega Millions are the **only two rich featured cards**; other national jackpots move into the H-02B comparison | ✅ Featured count verified as exactly 2; Lotto America now appears as a comparison row. The H-02A heading was corrected to "Powerball & Mega Millions" so it describes what the section actually shows |
| 2 | Move the flagship games visually higher by compressing H-01, reducing intro copy and tightening spacing | ✅ Powerball now begins at **0.89 screens** at 375 px (was 1.03). Section spacing reduced 25 %, H1 made responsive (`clamp(22px, 5.2vw, 32px)`), intro trimmed to the fixture's leading clause |
| 3 | State selector stays in H-01 but loses dominance — compact `Your state: Select a state` | ✅ The standalone shell state bar was removed; the selector is now a compact inline utility beside the task links. Full exploration stays in H-07 / H-14B |
| 4 | Refined palette: navy header, pale blue-grey canvas, white surfaces, soft blue bands, deeper action blue | ✅ canvas `#F2F6FA`, soft `#EAF4FB`, action `#1D4ED8`, hover `#1E40AF`. **No contrast weakened** — action blue *improved* from 5.12 to **6.70** on white and 4.77 to **6.17** on canvas |
| 5 | Differentiated section patterns instead of uniform white boxes | ✅ Eight reusable patterns: featured card, compact card, result rows, interactive panel, soft AI panel, editorial card, link directory, accordion |
| 6 | Reduce mobile density; padding down 15–20 % below the first task area | ✅ Compact variants, collapsed accordions, `View all` controls (labelled unavailable, never broken links) |
| 7 | Quieter ad placeholders | ✅ Subtle neutral surface, subtle border, small uppercase label only. The large centred explanatory sentence was removed; rail placeholders use a dashed border so they do not dominate |
| 8 | **Correction UI only when a real correction record exists** | ✅ Default `/` shows **no** correction banner. `/?previewState=corrected` exercises it, including previous → replacement values. No new route; still noindex |
| 9 | Normal source/status treatment; compact stale badge instead of a dominant banner | ✅ Stale now renders as a compact badge beside "Last updated" (`Sample data · 17 days old`); the dominant banner is gone. Fixture dates were **not** refreshed |

**Still open for the next review round:** checklist items 1, 2 and 7–20 in §2 above, plus everything
in §4. This refinement did not close them.

---

## 6. Third review round — final-look engaging Home (LRG-UI-010)

Founder visual review produced eleven directions, applied by task LRG-UI-010. **Again a refinement,
not a rebuild:** the BP-02 §12 section order (23 content sections, 7 ad anchors, 30 entries), the
992 px threshold, the `LC_HOME_PREVIEW` guard, the legacy Home fallback, the noindex protection and
the ad inventory are all unchanged. Verified after the change: **23 sections, 19 inline production
slots + 1 sticky = 20 placed, `hp_video` still recorded as unmapped, 0 requested.**

| # | Direction | Applied |
|---|---|---|
| 1 | Remove visible preview/debug language from the normal Home view | ✅ Visible-text scan of the rendered HTML now finds **0** occurrences of *preview, debug, illustrative, fixture, reserved, slot key, section ID, ad-anchor ID*. Removed: the amber "Preview — sample data for design review" band, all `PREVIEW` / `PREVIEW CONTENT` chips, the sticky ad's "Inactive reservation — final production height not yet set" sentence, and the visible ad-inventory accounting line. **Kept:** one quiet neutral disclosure line in ordinary language, the section provenance labels (reworded to `Sample` / `Example`), `robots: noindex, nofollow`, `meta.previewMode`, every `data-*` attribute, and the build-blocking `assertProvenanceLabels` check. Inventory accounting moved to `data-ad-anchors` / `data-ad-slots-placed` / `data-ad-slots-unmapped` on the page root |
| 2 | Add recognizable game logos | ✅ Three logos copied from the production image set to `01-new-ui/public/game-logos/`, with provenance in `logo-manifest.json`. Shown on the two featured cards, the H-02B jackpot table rows and the H-09A game cards. **The game name is always rendered as text beside the logo**, the logo is decorative (`alt=""`), height-capped at 26 px, and nothing implies LotteryCorner is an official operator. **See the open trademark item in §6.1** |
| 3 | Conditional Play Online / ticket-option actions | ✅ `playOptionPreview.ts` + `PreviewPlayOptions.tsx`. Options appear only for games that actually have one (Powerball, Mega Millions, Lotto America) and only on featured cards, **after** the numbers and below a rule — never between jackpot and numbers, never inside a result grid. No affiliate URL, no partner name, no resolved destination, and **no `/play` route was created**. Disclosure and the state-eligibility sentence travel with the action; the buttons are outlined/plain, deliberately not accent weight, so commerce reads as subordinate to the result |
| 4 | Lighter, balanced CTAs instead of thick full-width blue actions | ✅ One shared three-weight button scale (`accent` / `quiet` / `plain`), all inline-sized, 44 px targets, **at most one accent per section**. The full-width solid blue blocks in H-09A and H-12 are gone |
| 5 | LotteryCorner AI as a meaningful platform capability | ✅ H-05 is now a labelled AI panel with: today's deterministic brief from the results already on the page, **five named capabilities** (answer a result question, explain a game, read your ticket, walk through a claim, classify a claim), **three real player questions**, and a cited link back to the results. Each capability carries its own availability state. No prediction language, no odds claim, no simulated chat transcript, no floating chat bubble |
| 6 | News, Guides, Community and Social/Video feel active and engaging | ✅ Community (H-10) gains four **topic descriptions** — what the forum is *for*. **No thread, reply, member name, post count or reputation figure is shown**, because fabricating those is prohibited. Social and video live in H-14 *Return and Distribution*, the section the blueprint already names for this — **no new section was invented**. Nothing is embedded: no YouTube iframe, no X widget, no partner script, no external request |
| 7 | Images or meaningful local visual treatments for editorial cards | ✅ Six **locally authored SVGs** in `public/home-preview/`, hand-written from the approved palette. No stock photography, no remote asset, no image of a real person or a real winner. Applied to the six editorial cards, the winners module, community and distribution |
| 8 | Clearer section demarcation and stronger visual rhythm | ✅ Every section heading is a demarcated head with an accent rule and a hairline separator. A `tone` field (`feature` / `standard` / `quiet`) drives accent weight and spacing: 3 feature (navy rule, 44 px desktop rhythm), 14 standard (gold rule), 5 quiet (hairline, 24 px). **`tone` is presentation only — section order still comes from the view model** |
| 9 | Gold/gold used only as a restrained accent | ✅ Gold appears in exactly three places: the `CORNER` brand accent, the standard-section heading rule, and a 3 px underline beneath the featured jackpot amount. **Gold is never used as text** — `#F4B400` is 1.85:1 and would fail; the amount itself stays `#172033` at 16.27:1 |
| 10 | Powerball and Mega Millions stay dominant | ✅ Still exactly two featured cards, now the only cards with a logo, the largest amount type (24 px), the gold amount underline, the navy feature rule and the only ticket options. **Constraint noted:** they cannot fully enter a 375 × 812 first viewport, because BP-02 §12 places the AD-H00 top leaderboard between the task entry and H-02A. Spacing was tightened to the limit; **the slot was not moved** |
| 11 | Preserve the approved architecture, ad inventory, accessibility and safety protections | ✅ See the verification table in §6.2 |

### 6.1 Open item requiring a founder or legal decision — game-logo trademark clearance

The three logo files are **third-party trademarks** (Powerball® and Mega Millions® are marks of their
respective consortia; Lotto America® likewise). They were copied from the existing production site,
which already publishes them, and are used strictly as recognition assets with the game name always
present as text.

**Trademark clearance for continued public use is not settled by this task.** If clearance is
withheld, replacing them with locally authored non-infringing marks is a one-file change in
`lib/preview/gameLogoRegistry.ts`.

Two related notes:

- The source file for Lotto America is named generically (`lotto.webp`) in the production image set.
  The mapping to Lotto America is an **inference from usage context** and should be confirmed.
- `logo-manifest.json` sits under `public/` and is therefore **publicly reachable** at
  `/game-logos/logo-manifest.json`. It records the legacy source directory. The preview is noindex,
  and the task named this path, so it was created there — but if exposing that provenance note is
  unwanted, the manifest belongs in `04-sample-data/` or `03-docs/` instead.

### 6.2 Verification performed

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `next lint` | No warnings or errors |
| Build, guard **off** | `/` static (`○`); built HTML contains **0** occurrences of `data-lc-preview`, `lcp-container`, `lcp-btn`, `game-logos`, `home-preview`, `Sample data`, `Ticket options` — the previous Home is byte-for-byte unaffected |
| Build, guard **on** | `/` dynamic (`ƒ`), renders the preview |
| Visible developer terminology | **0** matches across 16 search terms |
| Advertising inventory | 7 anchors, 20 slots placed (19 inline + 1 sticky), 0 requested, `hp_video` recorded unmapped. `04-sample-data/ad-slot-definitions.json` **not modified** |
| Partner scripts | 0 requests to googletag, googlesyndication, doubleclick, gtag, YouTube or X. All `<script src>` are local `/_next/` chunks. The only external URLs are the pre-existing `Organization.sameAs` values in JSON-LD |
| 991 px | 4 mobile ads, rail hidden, bottom nav present |
| 992 px | 0 mobile ads, 6 rail slots, bottom nav hidden, grid `581px 300px` — **no inventory gap** |
| 1440 px | Grid stable, no second transition |
| Horizontal page scroll | None at 375 / 991 / 992 / 1440. Wide tables and the ticker scroll inside their own `overflow-x` containers |
| Heading structure | Exactly one `h1`; no skipped level anywhere in the 43-heading sequence |
| Interactive targets | **0** controls below 44 × 44. The brand link was 187 × 28 and was raised to 44 (free — the header row was already ≥ 44) |
| Sticky hierarchy | Sticky ad content 694–750 px, bottom nav 756–812 px — **no overlap**, 6 px gap. Clearance `120px`, derived not hardcoded |
| Local assets | All 10 files serve 200 with correct content types |
| Corrected state | `/?previewState=corrected` still renders the full correction treatment including previous → replacement |
| Legacy reference project | Unmodified; only the pre-existing `M .project` remains |

### 6.3 Contrast — one measured failure found and fixed

All values computed from relative luminance, never estimated.

| Pair | Before | After |
|---|---|---|
| `Soon` tag on the AI teal chip | **1.26 — FAIL** | 5.93 PASS (white) |
| `Soon` tag on brand navy | **2.21 — FAIL** | 16.52 PASS (white) |
| `Soon` tag on navy-raised | — | 14.74 PASS |

The tag had been using `--color-text-muted` (`#48566A`), a mid-grey intended for light surfaces, on
dark shell surfaces where it was effectively invisible. It is now styled for inverse surfaces only.

Every other new value passes: accent button 6.70, quiet button 6.70, plain button 6.87, category chip
6.45, AI badge 5.93, AI capability body 7.46, prompt text 16.27, tile body 7.46, community note 7.38,
sample-data line 6.45, jackpot amount 16.27.

The gold heading rule measures **1.70:1** against the canvas. **WCAG 2.2 SC 1.4.11 does not apply to
it:** it is a decorative accent, not a UI state indicator and not a graphic required to understand
the content — every heading is fully legible with the rule removed. It was left at the approved
`--color-jackpot` token rather than inventing a new hue.

### 6.4 Known limitation of this review

Mid-page screenshots return blank at scroll offsets — a limitation of the capture pipeline, not a
page defect, and the same one recorded for LRG-UI-008 and LRG-UI-009. Above-the-fold rendering was
captured directly at 375 px and 1440 px; everything below the fold was verified through rendered-HTML
text extraction, DOM geometry and computed styles.

### Explicitly NOT approved by this record

Checklist items **1, 2, 7–20** remain **open** and are the subject of the **P4 visual review**. In particular the following stay unapproved and unresolved:

- final high-fidelity visual approval (DS-37);
- sticky-ad production creative height (DS-26 / DS-34) — ad operations;
- ad-operations validation of the 992 px threshold (DS-20) and of no-fill behaviour (DS-24 / DS-36);
- page-specific ad volume (DS-35);
- canonical host and trailing-slash migration;
- `/play/{game}` versus `/buynow/{code}`;
- the 11 open Member/Insider Part 22 decisions;
- dark mode, brand font, icon library, logo redesign.

**P3 approval authorizes an isolated, reversible, local browser preview. It is not production approval.**

**Reminder of what P3 is and is not:**

- **Is:** an isolated, reversible, browser-rendered anonymous Home preview inside the existing `01-new-ui`, using sample data, with inactive labelled ad placeholders and no partner scripts.
- **Is not:** production approval, live advertising, route or canonical migration, affiliate activation, authentication, Member/Insider functionality, API work, or database work.
- **Founder sign-off at P4 means** "this visual direction is right" — **not** "this page may go live." Final high-fidelity approval remains deferred (DS-37), and Phase 5 and Phase 8 retain their own gates.

---

## 7. Fourth review round — friendly engagement and visual rhythm (LRG-UI-011)

Founder review produced sixteen directions, applied by task LRG-UI-011. **A refinement, not a
rebuild.** All 23 sections, all 7 anchors and all 20 mapped slots are retained; the frozen Home
blueprint is untouched; the guard-off legacy Home is byte-for-byte unaffected.

| § | Direction | Applied |
|---|---|---|
| 1 | Dependable service with an active, approachable community — not a casino lobby, betting site, trading dashboard or SaaS app | ✅ No glow, no animated counter, no gradient, no confetti, no pulsing urgency, no oversized promo button. Gold stays a three-place accent. Warmth comes from conversational headings, genuine identity and real content signals |
| 2 | Founder-authorized order experiment moving genuine human activity higher | ✅ **H-10, H-11, H-14** move to sit immediately after **AD-H03** — IDs read from the manifest, not guessed. Early utility hierarchy unchanged. Recorded in `08-decisions/home-engagement-order-preview-experiment.md` as **FOUNDER-AUTHORIZED PREVIEW EXPERIMENT**; the blueprint is not amended |
| 3 | "What's Happening at LotteryCorner" band | ✅ Shared presentation wrapper with no section ID and no landmark role. Each member keeps its own `<section id="H-…">`. 1 column at 375, 2 from 768, 3 from 1200 with Community widest. No carousel, no autoplay, no horizontal scroller |
| 4 | Community — genuine data only | ✅ **Truthfully empty.** Evidence: the production schema has `blog_entry` and `news_entry` but **no forum/thread/post/reply table**, and no fixture carries activity. Renders "No recent community discussions yet" plus what the forum will carry. **Zero** occurrences of reply counts, usernames, avatars, timestamps or reputation in the rendered text. No "Start a discussion" control, because no route exists |
| 5 | News — genuine, empty or evergreen | ✅ The two synthetic current-news claims in `liveNews` are **not rendered**. What shows is the truthful "No verified lottery news right now" followed by the one evergreen item labelled **Guide** — explicitly permitted by §5. No invented date: an undated guide prints no publication date |
| 6 | Video and social — real metadata only | ✅ "LotteryCorner video updates are coming soon". The **channels** are named because they genuinely exist — production footer (`footer-config.json`, from `footerbar_upgrade_as.jspf`) and legacy templates for `youtube.com/@Lotterycorner`. Nothing embedded, nothing linked: 0 iframes, 0 external requests |
| 7 | Larger featured logos | ✅ Desktop 46 px tall / ≤165 px wide; mobile 38 px / ≤132 px; secondary 24–28 px. `object-fit: contain`, aspect ratio preserved (measured 136×46 vs 181×61 intrinsic = 2.957 vs 2.967), never cropped, stretched or recoloured. Text game name always visible. Featured marks switched to eager loading — deferring them left the flagship cards looking nameless on first paint |
| 8 | Verify the Lotto America asset | ✅ **Mapping DISPROVEN — see §7.1** |
| 9 | Move the logo manifest out of public delivery | ✅ Provenance now at `01-new-ui/lib/preview/game-logo-manifest.json`. The public copy was deleted only after the private replacement was verified; `/game-logos/logo-manifest.json` now returns **404**. No absolute filesystem path is recorded — every source path is repository-relative |
| 10 | Balanced tonal play actions | ✅ Powerball → **Play Online** (tonal, light blue surface, blue text, blue border, 44 px). Mega Millions → **See Play Options** (quieter tonal, eligibility unresolved). Every other game → **no transactional CTA**. "Availability varies by state" sits beside the action. No gold, no heavy full-width solid blue |
| 11 | Explanatory play-options panel | ✅ Native `<details>` — real close action and keyboard contract, no client JS, stays server-rendered. Contains selected game, state-confirmation step, method-type explanation (official state / courier / retail), disclosure, eligibility-last-checked, responsible-play note. **0 links, 0 iframes, no URL of any kind.** No provider named, no ranking, no "best" claim, no IP-preselected state |
| 12 | Four reusable visual families | ✅ **A Results** white + navy headings · **B Tools/AI** soft pale-blue band · **C Community/Editorial** warmer surface with a community rule · **D Directories/Data** canvas, compact rows. One nested-card level maximum on mobile. Content capped at 1280 px |
| 13 | Friendly and approachable detail | ✅ Conversational headings ("Watch and follow", "Latest from LotteryCorner"), concise copy, visible category chips, real game identity. No childish language, no emoji, no casino language, no "hot picks", no scarcity, no prediction framing, no fabricated social proof |
| 14 | Compact advertising-review mode | ✅ `LC_HOME_PREVIEW_AD_MODE`, default **compact**. See §7.2 |
| 15 | Reduce lower-page vertical space | ✅ Document height at 375 px: **18 709 px production → 16 525 px compact** (−11.7 %). H-14B's intro dropped because it duplicated H-07's sentence verbatim; empty states compacted; directory rows tightened. No section removed, no inventory hidden, no genuine content lost |
| 16 | Six AI capabilities, restrained structure | ✅ The founder's six, in order. **One featured** capability ("Explain these winning numbers"), the other five as compact text prompt links — not six outlined buttons — plus **one** contextual action. The odds disclaimer renders whenever the number-generating capability is present |
| 17 | Conditional correction behaviour preserved | ✅ Default `/` shows no correction notice and no corrected card. `/?previewState=corrected` still exercises the full treatment. No new route |

### 7.1 Lotto America logo — mapping disproven, image removed

LRG-UI-010 mapped `lotto.webp` → Lotto America by inferring from the generic filename and flagged it
for confirmation. LRG-UI-011 tested the inference. **It failed.**

- **No usage evidence anywhere.** `lotto.webp` is referenced by no JSP, JSPF, HTML, CSS, JS or
  configuration file in the legacy application — so there is no alt text, adjacent game ID or CSS
  mapping to confirm anything.
- **The artwork contradicts it.** Inspected at 6.4× magnification, the file reads **"FLORIDA LOTTO"**
  with an orange X glyph and a pink "with Double Play" bar. It is the **Florida Lotto** mark.

**Action taken:** the asset is removed from the Lotto America presentation and from the registry.
Lotto America renders its game name as text with no logo. **No replacement mark was fabricated.**

**Two consequences for the founder:**

1. The copied filename `public/game-logos/lotto-america.webp` is now itself misleading. The file was
   left on disk because deleting assets is outside this task's authority, but it is referenced by no
   code path. It should be renamed or removed in a separate approved cleanup.
2. A decision is needed: **(a)** re-map the asset to Florida Lotto, which the artwork supports, after
   confirming whether the "with Double Play" sub-brand belongs on a general Florida Lotto surface; or
   **(b)** source a correct Lotto America mark.

### 7.2 Compact and production advertising modes

`LC_HOME_PREVIEW_AD_MODE` accepts **`production`** and **`compact`**. Unset defaults to `compact`.
**`hidden` is deliberately not supported** — any unrecognised value falls back to `compact`, which
still renders every slot. There is no mode that removes, collapses or conceals inventory.

Verified by comparing the rendered DOM of both modes:

| Check | Result |
|---|---|
| Same slot set in both modes | ✅ 19 inline + 1 sticky = **20**, identical |
| Anchors in both modes | ✅ **7** |
| Reserved heights recorded identically in both modes | ✅ on `data-reserved-mobile-h` / `data-reserved-desktop-h` |
| Production **drawn** height == production **reserved** height | ✅ for all 19, e.g. `hp_side_halfpage_pos2` 600/600, `hp_mid_billboard_pos1` 280/250 |
| Compact visibly shorter | ✅ all 19 reduced to 40 px mobile / 56 px desktop, never taller than the production reservation |
| Compact hides inventory | ❌ **No.** Every slot renders with its `ADVERTISEMENT` label |
| GAM mappings / breakpoint rules changed | ❌ **No** |
| Technical inventory wording visible | ❌ **No** — the label is the only text |

**Compact geometry is a review aid and is never evidence of production geometry.** Production-layout
approval must be given against `production` mode.

### 7.3 Validation performed

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `next lint` | No warnings or errors |
| Guard-on build | `/` dynamic (`ƒ`) |
| Guard-off build | `/` static (`○`); built HTML contains **0** occurrences of `data-lc-preview`, `lcp-container`, `lcp-happening`, `lcp-play`, `lcp-fam-`, `game-logos`, `Sample data` |
| Rendered sequence | **30 entries**, exactly as the decision record specifies |
| Sections / anchors / slots | 23 / 7 / 20 |
| `hp_video` | Still recorded as defined-but-unmapped |
| Widths reviewed | 375 · 768 · 991 · 992 · 1024 · 1280 · 1440 |
| 991 → 992 transition | 4 mobile ads + no rail + bottom nav → 0 mobile + 6 rail slots + no bottom nav. **No inventory gap** |
| Second transition at 1024 | ❌ none — grid goes `596px 300px` → `628px 300px`, same structure |
| Horizontal page scroll | None at any reviewed width |
| Heading structure | Exactly one `h1`; no skipped level across 39 headings |
| Sticky vs bottom nav | Ad content 694–750 px, nav 756–812 px — no overlap |
| Default correction UI | Absent |
| `/?previewState=corrected` | Present, with previous → replacement values |
| Partner scripts / external requests | 0 googletag, 0 doubleclick, 0 gtag, 0 iframes, 0 embeds |
| Public provenance manifest | 404 |
| Fabricated activity scan | 0 hits for replies, views, subscribers, members online, posted by, likes, shares |
| Synthetic news claims | 0 — neither "climbs to $604" nor "rolls to $457" renders |
| Visible developer language | 0 hits across preview, illustrative, debug, fixture, TODO, lorem |

### 7.4 Defect found and fixed during this round

**Horizontal overflow at 992 px.** The band's three-column grid used bare `fr` tracks, and
`.lcp-module` pins a 200 px image column from 768 px up. Inside the ~596 px main column that appears
the moment the contextual rail arrives, the combination could not shrink and the page scrolled
sideways. Fixed with `minmax(0, …)` tracks throughout, a three-column layout deferred to 1200 px
where there is genuinely room, and a stacked module inside band tracks. Re-verified at all seven
widths: no overflow.

### 7.5 Deliberate deviation

§12 says section bands **may** extend full viewport width. They are drawn at **main-column width**
instead. From 992 px the 300 px contextual rail sits alongside the main column, so a true full-bleed
band would run underneath it. Contained content stays capped at 1280 px either way. Raise it at
review if the full-bleed treatment is wanted; it would require moving the rail out of the grid.

### 7.6 Known limitation of this review

Mid-page screenshots return blank at scroll offsets — a capture-pipeline limitation, not a page
defect, and the same one recorded for LRG-UI-008, 009 and 010. Top viewports were captured directly
at 375 px, 992 px and 1440 px; the band, the play panel and the compact ad treatment were verified
through rendered-text extraction, DOM geometry and computed styles.

### 7.7 Still open

Everything in §4 remains open, plus the Lotto America decision in §7.1 above, the full-bleed question
in §7.5, and the review criteria listed in the decision record. **This round does not constitute
production approval.**

---

## 8. Fifth review round — historical AI analysis and Community-first (LRG-UI-012)

Applied by task LRG-UI-012. **A refinement, not a rebuild.** All 23 sections (each exactly once), all
7 anchors, all 20 mapped slots, both ad modes, the conditional correction, the server-side guard and
the guard-off Home are unchanged.

### 8.1 The finding that shaped the whole task

> **This repository holds exactly ONE historical draw per game.**

Recorded in full in `home-preview-historical-data-inventory.md`. The feed, the fixtures, the DB export,
the production page capture and the legacy app were all searched; none carries an archive. The
founder's example output — "1 number also appeared in the previous draw", "This odd/even split appeared
in 9 of the last 50 draws" — **cannot be computed from the data that exists.**

The most dangerous trap in the dataset: the results feed repeats every multi-state game **once per
state**, so Powerball appears in 49 blocks for a single drawing. Consuming that naively would have
produced confident, badly wrong frequency output. The analyser deduplicates on `(date, numbers)` before
counting anything.

**What was done instead of manufacturing data:** every metric §4 and §6 name is implemented and gated
on sample size. Each one that cannot be computed reports **precisely what it needs** ("Numbers repeated
from the previous draw — needs at least 2 draws"). When a real archive is supplied, they fill in with no
code change. Nothing was fabricated and nothing was fetched from the web.

| § | Direction | Applied |
|---|---|---|
| 1 | Reject superficial AI content | ✅ The analysis never restates the jackpot, date or numbers. Rendered output: *"3 of 5 numbers are in the upper half of 1–69" · "4 odd and 1 even" · "The five numbers total 176, within a possible 15–335"*. The repetitive per-result prediction disclaimer is gone |
| 2 | AI value statement near H-01 | ✅ One quiet capped line (880 px) with the AI mark and a text action. Verified it does **not** push the flagship games materially lower — Powerball is still at the fold at 1440 px |
| 3 | Rename the shell AI action | ✅ **"LotteryCorner AI"** desktop, **"Explore AI"** mobile, both `href="#H-05"`. No route created. Generic "Ask AI" is gone |
| 4 | AI Draw Analysis on the flagship cards | ✅ Both cards, three computed observations each, **basis line always visible**, plus a compact truthful gap state. Nothing hardcoded |
| 5 | Analysis windows | ✅ 20/50/100/all supported; defaults to 50 when ≥50 draws exist, otherwise full history with the size shown. Currently *"Based on the 1 available draw"* |
| 6 | Local analysis panel | ✅ Native `<details>` — no client JS, real close action, keyboard operable, server-rendered. Bottom sheet under 768 px, clearing the sticky ad and bottom nav (measured 197–700 px against nav at 756 px). Contains Summary · Frequency · Repeats and last seen · Draw composition · Historical patterns · Compare · Methodology |
| 7 | AI wording | ✅ `predict*` occurrences reduced from 3 to **1**, and that one is pre-existing H-13 fixture copy that *denies* prediction. Zero hits for likely-next, strategy, best numbers, lucky, due, overdue, increases-your-chance, AI-verified, AI-confirmed, official-AI. Frequency is always "in this sample" |
| 8 | AI icons | ✅ Six inline-SVG icons, `currentColor`, no dependency installed. Decorative by default, `role="img"` with a `<title>` where standalone. No robots, brains, circuits, confetti or animation |
| 9 | Contextual AI actions | ✅ **10 of 23 sections** — H-02A, H-03, H-04, H-06A, H-06B, H-07, H-08, H-09, H-09A, H-11A. Selective, not mechanical |
| 10 | H-05 main AI experience | ✅ One featured capability, five compact links, one contextual action, AI mark for identity. Not six large equal cards |
| 11 | AI separate from commerce | ✅ The analysis block is a sibling of the play-options panel, never nested inside it. No analysis output touches eligibility, provider, method or urgency |
| 12 | AI separate from official facts | ✅ Analysis renders **after** the numbers, below a rule, on its own tinted surface with the teal edge. No "AI verified", "AI confirmed" or "official AI analysis" anywhere |
| 13 | AI separate from Community | ✅ Community stays human-authored and truthfully empty. Zero fabricated posts, replies, identities or activity. No thread was invented to demo summarisation |
| 14 | Community immediately after H-05 | ✅ H-05 at 9, H-10 at **10**, each appearing exactly once. Recorded as Round 2 in the decision record |
| 15 | Community presentation | ✅ "Community" + **"Human-authored discussions"** kicker + the founder's exact explanation sentence + *"No recent community discussions yet"*. No functional CTA, because no route exists |
| 16 | AI ↔ Community visual relationship | ✅ AI keeps the approved teal; Community uses the approved community purple. Complementary, distinct, not merged, no new hue introduced |
| 17 | Preserve LRG-UI-011 | ✅ See §8.4 |

### 8.2 Reconciliation recorded rather than silently resolved

§9 lists "**H-12** Games: Allow Compare games". In the manifest, **H-12 is "Where to Play / Buy
Online"** — a commerce section — and §11 forbids mixing AI with commerce. The "Compare games" action
was therefore placed on **H-09A Popular Games**, the actual games-discovery section, and H-12 carries
no AI action. §11 is the stronger constraint; raising this rather than guessing.

### 8.3 What the analysis actually computes today

| Computable now (n = 1) | Reported as needing more draws |
|---|---|
| Odd/even split | Repeats from the previous draw (needs 2) |
| High/low split against the game's **valid range** | Numbers seen in the last five draws (needs 2) |
| Consecutive numbers | Special-ball last-seen (needs 2) |
| Total sum vs the range's possible minimum and maximum | Most/least frequent in sample (needs 10) |
| Span lowest → highest | Numbers absent from the window (needs 10) |
| Sum position within the theoretical range | Common pairs and triplets (needs 20) |
| Cross-game comparison, **normalised** per range | Structural-pattern frequency (needs 20) |
| | Exact prior match search (needs 2) |

Comparison normalisation matters: Powerball 176 and Mega Millions 167 are **not** comparable raw
(ranges 1–69 vs 1–70). Rendered as **50 % vs 47 % of each game's own possible range**.

Rule-version safety is in place before the archive arrives: `result-format-definitions.json` records
Powerball's `effectiveFrom: 2015-10-07` and warns that earlier draws used different ranges, and
`prepareSample()` excludes them rather than pooling them.

### 8.4 Validation

| Check | Result |
|---|---|
| `tsc --noEmit` · `next lint` | Clean |
| Guard-on build | `/` dynamic (`ƒ`) |
| Guard-off build | `/` static (`○`); **0** occurrences of `data-lc-preview`, `lcp-an`, `AI Draw Analysis`, `LotteryCorner AI`, `lcp-aivalue`, `lcp-happening`, `lcp-comm__kicker` |
| Rendered sequence | 30 entries · 23 unique sections · H-05 ×1 at 9 · H-10 ×1 at 10 |
| Band | Two members (H-11, H-14) under "Latest from LotteryCorner"; old label gone |
| Anchors / slots | 7 / 20 (19 inline + 1 sticky) · `hp_video` still unmapped · 0 requested |
| Compact mode | All 19 slots drawn at 40 px; nothing hidden |
| Production mode | Slots drawn at their real 50/100/280/600 px reservations; same slot set as compact |
| Correction | Absent by default; `/?previewState=corrected` shows previous → replacement |
| External requests | 0 openai · 0 anthropic · 0 fetch · 0 XHR · 0 iframes · 0 googletag |
| Widths reviewed | 375 · 992 · 1440 |
| Horizontal overflow | None at any width; 0 elements off-screen |
| Mobile bottom sheet | 197–700 px, clears bottom nav at 756 px, scrollable, height-capped |

### 8.5 Defects found and fixed during this round

1. **`compareGames` operator-precedence bug.** The repeat-rate expression parsed as
   `(len / odd) + (even === 0)`. Rewritten; the rate is now `null` when there is no previous draw, so
   "no data" and "no repeats" stay distinguishable.
2. **Card games would have been coerced to `NaN`.** Ball values are `(string | number)[]` because card
   games draw face values. `drawFromCard` now returns `null` for a non-numeric draw, so a card game
   gets no analysis rather than a nonsense one.
3. **The anchor-drift assertion failed the build** when AD-H03 moved 12 → 13. Working as designed;
   documented position corrected.
4. **The AI mark read as a "+" at 17 px.** The spark spanned only 7.2–16.8 with a narrow waist.
   Outer radius is now 7.4 with a ~2.7 inner radius.
5. **The comparison panel duplicated a card's blocks.** Added a compare-only mode.
6. **The AI value statement stretched to 1350 px** and read as a promotional bar. Capped at 880 px.

### 8.6 Known limitation

Mid-page screenshots still return blank at scroll offsets — the same capture-pipeline limitation
recorded for LRG-UI-008 through 011. Top viewports were captured directly; the analysis blocks, the
panel, Community and the band were verified through rendered-HTML extraction, DOM geometry and
computed styles.

### 8.7 Still open

Everything in §4, plus the Lotto America decision (§7.1), the full-bleed question (§7.5), the round-1
and round-2 review criteria in the decision record, the §8.2 reconciliation above, and the production
data work listed in §8 of the historical-data inventory. **This round does not constitute production
approval.**

---

## 9. Sixth review round — final-state interaction and presentation (LRG-UI-013)

Applied by task LRG-UI-013. **Design and local-interaction refinement, not a rebuild.** The
experimental order, all 23 governed sections (each exactly once), all 7 anchors, all 20 mapped slots,
both ad modes, the conditional correction, the server-side guard and the guard-off Home are unchanged.

### 9.1 ⚠ RECORDED CONFLICT — fabricated Community and editorial content

This is the most important item in this round and it is not a footnote.

| | |
|---|---|
| **Instruction** | LRG-UI-013 §7 — render sample Community discussions with reply counts, latest activity and display names. §8 — render an intentionally filled News/Media band. §1 — remove every visible Sample / Coming soon / Preview marker |
| **Conflicts with** | Product Constitution v2.1 §17 (community content is human-authored; MUST NOT fabricate posts, replies, reputation or activity) · §26 and CLAUDE.md §14 (synthetic content MUST NEVER be presented as real public fact) · CLAUDE.md §19 (fabricating news or community content is prohibited) |
| **Resolution** | The instruction is followed. CLAUDE.md §2 puts an explicit founder instruction in the active task at **tier 1**, above the frozen Constitution at tier 2 |
| **Not silently reconciled** | Recorded here, in `lib/preview/finalStateContent.ts`, and in the README. **It still needs transcribing into `03-docs/08-decisions/source-conflicts.md`** — that file is outside this task's allowed paths, so a governance task must do it |

**Consequence, stated plainly: this page must not be served publicly in this state.** It now renders
fabricated forum discussions and editorial items with no visible provenance marker.

**Protections that remain unconditional:** the `LC_HOME_PREVIEW` server guard (no `NEXT_PUBLIC_`
prefix, unflippable from the browser) · `robots: noindex, nofollow` · `meta.previewMode` · every
`data-provenance` attribute · `assertProvenanceLabels`, which still fails the build if a synthetic
section lacks a label — debug only decides whether the label is *drawn* · the
`SYNTHETIC_FINAL_STATE` constant, which greps to every fabricated surface.

**Mitigations inside the fabricated content itself:** display names are handle-style
(`midwest_player`, `quietnumbers`), never plausible full personal names, so no real person can appear
to have said something · avatars are generated initials, never a photograph of a person · no post
asserts a lottery fact, a win, a prize amount, or that any method improves odds · no editorial item
carries a fake byline or a fake source citation.

### 9.2 Directions applied

| § | Direction | Applied |
|---|---|---|
| 1 | Final-state design mode; status only under `LC_HOME_PREVIEW_DEBUG=true` | ✅ Visible-text scan: **0** occurrences of SOON, Coming soon, SAMPLE, PREVIEW, Illustrative, fixture, "not connected", "after launch", slot counts. Debug restores them (17 "Soon", 6 "Coming soon", the sample-data strip) |
| 2 | Remove the top sample-data strip | ✅ Gone from the normal view, returns in debug. noindex, provenance and assertions untouched |
| 3 | Fix featured-card expansion | ✅ See §9.3 — measured |
| 4 | Play options closed by default, overlay | ✅ Commerce overlay. No affiliate URL, no route, no IP lookup, no eligibility decision, no named provider, no transaction. `<form>` count: **0** |
| 5 | AI analysis overlay | ✅ Analysis overlay with Summary / Frequency / Repeats / Composition / Patterns / Compare / Methodology. Separate mode from commerce |
| 6 | Standardize contextual AI affordances | ✅ One per section. H-02A's section-level row was **removed** (its cards already carry "Explore AI analysis" plus one shared "Compare these games"); H-04 collapsed from three actions to one. Consistent 32 px text-weight buttons, teal, no badge |
| 7 | Community final state | ✅ One lead + two supporting discussions, forum chip, reply count, latest activity, initials avatar. "Human-authored discussions" retained. **See §9.1** |
| 8 | Latest from LotteryCorner final state | ✅ Lead story at ~1.15fr beside a secondary card, plus a media card with thumbnail, platform, date and duration. No empty area. **See §9.1** |
| 9 | News and media images | ✅ 16:9, `object-fit: cover`, meaningful alt text, lazy, local assets only. No remote image, no stock photography, no image library |
| 10 | Tools look functional | ✅ Five cards with working-looking controls. They are `<button type="button">`, not links — none of these routes exists and CLAUDE.md §10 forbids inventing one, so a button that cannot 404 is the honest choice |
| 11 | Play Your Favorite Games | ✅ Game selector, state selector, method summary, "Where to Play" opening the commerce overlay, disclosure, responsible-play note. Selectors are presentational |
| 12 | Insider looks complete | ✅ Four descriptive cards. **No** authentication, subscription, entitlement, quota or storage; nothing implies the reader is signed in (CLAUDE.md §16 intact) |
| 13 | Newsletter looks complete | ✅ Value statement, email field, subscribe action, privacy note. The input is `readOnly`, there is **no `<form>`, no action, no method, no submit handler** — nothing can be captured or sent. The confirmation is a CSS-only `:focus` reveal |
| 14 | Header, navigation and footer | ✅ All status markers gone from desktop nav, mobile nav, footer links and account actions. No new route; nothing navigates to a 404 |
| 15 | Advertising presentation | ✅ See §9.4 |
| 16 | Section spacing and page length | ✅ Overlays are portalled, so expanded content contributes **nothing** to document flow. Document height at 375 px: 17 779 → **17 598 px** |
| 17 | Preserve current architecture | ✅ See §9.4 |

### 9.3 The featured-card defect, and the measured fix

**Diagnosis.** Two causes compounded. The cards sat in a grid whose row height was set by the taller
card, and `height: 100%` made the shorter one stretch to match. Expanding a `<details>` *inside* a card
then grew the grid row, stretching its sibling and leaving a large empty region in the shorter card.

**Fix, both halves:**
1. **Nothing that expands lives in the grid any more.** Every panel moved into `PreviewOverlay`, which
   `createPortal`s to `document.body` — genuinely outside the grid in the DOM, not merely positioned
   over it. Closed by default: **0** `role="dialog"` nodes and **0** `<details>` elements exist inside
   the featured grid in the served HTML.
2. **The grid no longer stretches.** `align-items: start`, `align-content: start`, and an explicit
   `height: auto` override on featured children.

**Measured at 1440 px** — baseline heights 717 / 635 px, tops both at 636 px:

| Trigger | Heights while open | Restored on close | Portalled outside grid | Focus into dialog | Focus back to trigger |
|---|---|---|---|---|---|
| Explore AI analysis (PB) | 717 / 635 ✅ | ✅ | ✅ | ✅ | ✅ |
| Play Online (PB) | 717 / 635 ✅ | ✅ | ✅ | ✅ | ✅ |
| Explore AI analysis (MM) | 717 / 635 ✅ | ✅ | ✅ | ✅ | ✅ |
| See Play Options (MM) | 717 / 635 ✅ | ✅ | ✅ | ✅ | ✅ |

Also verified: Escape closes and returns focus · scrim covers the full viewport (1440×1000) · dialog
centred to within 3 px · close button exactly 44×44 · `aria-modal="true"` with a resolved
`aria-labelledby` · background scroll locked (`overflow: hidden`) and restored on close · no affiliate
URL anywhere in the dialog markup.

**Mobile (375 px):** bottom sheet, full width, bottom-anchored at 812 px, scroll locked, card heights
unchanged (713 / 672 both before and during).

### 9.4 Preserved — re-verified

| Check | Result |
|---|---|
| Rendered sequence | 30 entries · 23 unique sections · H-05 at 9 · H-10 at 10, adjacent |
| Anchors / slots | 7 / 20 (19 inline + 1 sticky) · identical slot set in both ad modes |
| Compact mode | All 19 slots drawn at 40 px; nothing hidden; label only |
| Production mode | Drawn heights 50 / 100 / 280 / 600 px — reserved **equals** drawn |
| 992 px transition | 4 mobile ads + no rail → 0 mobile + 6 rail slots; main grid `596px 300px` |
| Widths | 375 (1 col) · 768 (2 cols) · 992 (2 cols + rail) · 1440 (2 cols). Tops aligned at every width |
| Horizontal overflow | None; 0 elements off-screen |
| Correction | Absent by default; `/?previewState=corrected` shows previous → replacement |
| Integrations | 0 googletag · 0 doubleclick · 0 gtag · 0 iframe · 0 openai/anthropic · 0 fetch · **0 `<form>`** |
| Guard-off Home | Static (`○`); **0** occurrences of `data-lc-preview`, `lcp-featured-grid`, `lcp-ov`, `AI Draw Analysis`, `midwest_player`, `lcp-insider`, `lcp-tool`, `Human-authored` |

### 9.5 Judgment calls recorded

1. **The stale badge was reworded, not removed.** §1 forbids the visible word "Sample"; §2 explicitly
   retains stale/freshness fields. `Sample data · 17 days old` → `Updated 17 days ago`. The fixture
   genuinely is that old and hiding it would be worse than showing it.
2. **The consolidated "draws needed" checklist inside the AI overlay is now debug-only.** It repeated
   what each block already says inline and, as a large dashed list, made a launch-state overlay look
   unfinished. The per-block statements ("Frequency needs at least 10 draws in the sample") are **not**
   gated — they are the honest answer to a blank section, not a development explanation.
3. **`Search opens after launch.`** — a screen-reader-only string carrying implementation status.
   Reworded to `Search games, states and results.`
4. **"As soon as the official draw is published"** was left alone. It matched a naive `soon` scan but
   is ordinary English in the result-alerts copy, not a status badge.

### 9.6 Known limitation

Mid-page screenshots still return blank at scroll offsets. Overlays capture correctly because they are
`position: fixed`; the closed featured cards, both overlays and the mobile sheet were captured
directly. Community, the editorial band, Tools, Insider and Newsletter were verified through
rendered-text extraction, DOM geometry and computed styles.

### 9.7 Still open

Everything in §4 · the Lotto America logo (§7.1) · the full-bleed band question (§7.5) · the round-1
and round-2 order review criteria · the H-12/H-09A reconciliation (§8.2) · the production
historical-archive export · and above all **§9.1: the fabricated-content conflict must be transcribed
into `source-conflicts.md`, and the visible-provenance decision confirmed or reversed, before anything
resembling this page is published.**

---

## 10. Advertising baseline approved (LRG-ADS-015)

**HOME AD BASELINE APPROVED AT 15 ACTIVE LEGACY PLACEMENTS, WITH `hp_video` RETIRED.**

Full detail in `03-docs/05-advertising/home-ad-inventory-reconciliation.md` §8. Summary:

| Classification | Count | Status |
|---|---:|---|
| ACTIVE EXISTING LEGACY PLACEMENTS | **15** | rendering |
| RETIRED LEGACY PLACEMENT | 1 — `hp_video` | **disabled**, not approved for activation |
| DISABLED IMPLEMENTATION CANDIDATES | 5 — four `lc_mgp_snippet_*` mobile + `hp_mid_large_leaderboard_pos4` | **disabled**, not approved for activation |
| DISABLED STRATEGIC CANDIDATES | 2 — `NEW-H-ENGAGEMENT-01`, `NEW-H-GUIDES-01` | **disabled**, not approved for activation |

Legacy Home rendered 16. `hp_video` is retired because the former video/commercial relationship is no
longer active, making 15 an intentional, authorised exception to strict legacy parity. **No replacement
placement is approved** and nothing may reuse its GAM path or name.

**None of the eight non-active records is approved for activation.** Each renders zero containers and
reserves zero geometry in both compact and production modes, and appears only as a debug marker.

### Lower-stack resolution

The three consecutive advertisements before Trust and Support are gone. Legacy evidence showed every
inline placement is separated by real content — the legacy Home never renders two advertisements back
to back. `hp_mid_large_leaderboard_pos3` moved up to AD-H04 to join `pos2` (legacy's tightest pair, 70
lines apart), `hp_mid_billboard_pos2` moved down to AD-H05 with `billboard_pos3`, and
`hp_mid_large_leaderboard_pos4` is disabled. Maximum consecutive advertisements anywhere: **2**.

Two anchors carry two placements because there are 8 active inline placements and only 6
inline-capable governed anchors. That is arithmetic, not a design preference; one-per-anchor would need
an eighth governed anchor and therefore a blueprint amendment.

### Responsive visibility

`hp_mid_leaderboard` is **desktop-only again**, restoring the legacy `.mobi-ads0 { display:none }`
behaviour at the same 992 px threshold. No added mobile impression opportunity. Measured totals: **8**
visible placements at 375 / 768 / 991 px and **15** at 992 / 1024 / 1440 px, with no inventory gap at
the transition — which now matches legacy exactly (0 mobile-only, 1 desktop-only).

### Empty governed anchors

**None.** All seven anchors retain an active placement, so no empty public container exists. The
`NO ACTIVE AD PLACEMENT` debug state is implemented and currently unused.

### Unchanged by this task

Home content order · results components · AI and inline-analysis layout · Community content and layout ·
GAM unit paths and size mappings for all 15 retained placements · the sticky placement · routes ·
canonical behaviour · partner scripts.
