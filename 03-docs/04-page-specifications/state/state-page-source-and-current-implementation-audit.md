# State Page — Source, Legacy and Current-Implementation Audit

**Document type:** Audit record — State page family (PF-02 / BP-03)
**Produced by:** Task **LRG-SPEC-017**
**Date:** July 27, 2026
**Status:** **AUDIT ONLY.** No application code, fixture, route, advertisement, or legacy file was modified.
**Baseline commit:** `482cd39` (branch `main`, clean tree, contained in `origin/main`)

**Consolidated by:** Task **LRG-DEC-018** — count corrections and blocker-scope corrections applied
in place; every conflict in §7 now carries its disposition. The **evidence** in this document is
unchanged and was not re-derived.

**Companion documents**

- `03-docs/08-decisions/state-page-founder-decisions.md` (`ST-DEC-001`) — the 36 founder rulings that dispose of most of what this document records
- `03-docs/04-page-specifications/state/state-page-section-and-view-model-specification.md`
- `03-docs/05-advertising/state-ad-inventory-reconciliation.md`
- `03-docs/04-page-specifications/state/state-page-founder-review.md` — disposition of every prior entry

**Scope boundary.** This document establishes *what exists and what it conflicts with*. It proposes
no implementation. Findings are routed to `ST-DEC-001` (ruled), to the founder review (dispositioned),
or to `source-conflicts.md` (genuinely unresolved).

---

## 1. Authority reconciliation

### 1.1 Sources read for this audit

| Tier | Document | Version / Status | Used for |
|---:|---|---|---|
| 2 | `00-foundation/authoritative/00A-v2.1-…-product-constitution-FROZEN.md` | 2.1 — frozen | Protected zones, language prohibitions, public-value boundary, AI labelling, synthetic-content rule |
| 3 | `00-foundation/authoritative/01-…-experience-architecture-FINAL-APPROVED.md` | 1.1 — final approved | §25 PF-02 State Hub required clusters; §60 purchase-eligibility decision; §71 universal experience states |
| 4 | `01-approved-blueprints/state/04-…-state-page-blueprint-FINAL-APPROVED.md` | **1.1 — final approved and frozen** | **The binding State authority.** Section inventory and order, state types, conditional modules, adaptive priority, content budget, ad contract, behind-the-screen contract |
| 4 | `01-approved-blueprints/shell/02-global-shell-…-FINAL-APPROVED.md` | 1.1 — final approved and frozen | §6.2–6.5 mobile nav, sticky conflict, State-Context Precedence; §10.2–10.5 AI first-answer and AI-everywhere; §42–45 section contract; §122 ad system; §136–§147 behind-the-screen, accessibility, responsive |
| 4 | `01-approved-blueprints/state/bp04-state-{desktop,mobile}-{anonymous,signed-in}.svg` | structural reference only | Structure and behaviour only — Global Shell §0.1 declares blueprint visuals non-binding for styling |
| 1 | `08-decisions/design-system-founder-decisions.md` | DS-DEC-001 — approved (Tier 1) | DS-01…DS-37; especially DS-04, DS-09, DS-11, DS-14, DS-15…DS-20, DS-28, DS-29, DS-30 |
| 5 | `08-decisions/source-authority.md`, `source-conflicts.md` | approved | Authority order; the 11 open Member/Insider decisions |
| 5 | `08-decisions/reuse-register.md`, `implementation-sequence.md` | approved | Prior artifact classifications, verified independently here |
| 6 | `03-design-system/design-system-specification.md`, `token-reuse-register.md`, `component-visual-contracts.md` | supporting | Token vocabulary, measured contrast failures |
| 7 | `03-docs/09`, `10`, `16`, `17`, `18`, `19`, `20` | reference only | Prior State discovery; **not requirements** |
| 7 | `04-page-specifications/home-preview/**`, `05-advertising/home-ad-inventory-reconciliation.md` | reference | **Shell and design-system lessons only.** Home composition is explicitly *not* a State template |
| 7 | `01-new-ui/**`, `04-sample-data/**` | reference | Current implementation and fixtures |
| 8 | `00-reference-existing-project/LotteryCorner40/**` | read-only evidence | Routes, ad inventory, business rules, SEO behaviour |
| — | `05-design-inputs/state-pages/**` | style / behaviour reference only | Proposed PDFs carry no layout or ad authority |

### 1.2 Binding State Page sections and order (transcribed, PF-02 §12)

**Composition, verified programmatically against PF-02 §12:** **25 governed anonymous positions =
19 content sections (S-01 … S-18, including S-08A) + 5 ad anchors (AD-S00 … AD-S04) + the global
footer.** (LRG-SPEC-017 stated "24 positions" and "20 content sections"; both were wrong.)

Anonymous desktop sequence — **transcribed verbatim, order unchanged**:

| Order | ID | Section |
|---:|---|---|
| 1 | S-01 | State Identity and Task Header |
| 2 | AD-S00 | Top State Advertisement |
| 3 | S-02 | Latest State Results |
| 4 | S-03 | State AI Brief |
| 5 | AD-S01 | Post-Results Advertisement |
| 6 | S-04 | Live and Upcoming Draws |
| 7 | S-05 | Check My State Ticket |
| 8 | S-06 | State Game Portfolio |
| 9 | AD-S02 | Post-Games Advertisement |
| 10 | S-07 | Where to Play / Buy Online |
| 11 | S-08 | Claims, Taxes, Anonymity and Player Help |
| 12 | S-08A | State Essentials |
| 13 | S-09 | Worth Knowing in This State |
| 14 | S-10 | State Tools, History and Statistics |
| 15 | AD-S03 | Lower Utility Advertisement |
| 16 | S-11 | Scratchers / Instant Games |
| 17 | S-12 | Winners and Unclaimed Prizes |
| 18 | S-13 | State Lottery Impact / Fund Allocation |
| 19 | S-14 | State Community / Forums |
| 20 | S-15 | State News, Blog and Guides |
| 21 | S-16 | Follow State / My LotteryCorner |
| 22 | S-17 | State Sources, Responsible Play and Support |
| 23 | S-18 | All States / Change State |
| 24 | AD-S04 | Pre-Footer Advertisement |
| 25 | Footer | Global Footer |

Signed-in sequence (PF-02 §32): S-01S, AD-SS00, S-02S, S-03S, S-04S, S-05S, S-06S, AD-SS01, S-07S,
S-08S, S-09S, S-10S, S-11S, S-12S, broad state discovery, AD-SS02, Footer — **17 positions,
12 signed-in section IDs**. Mobile anonymous order (§46) is a 22-step resequence; mobile signed-in
(§47) is a 16-step resequence. Neither is the desktop order with sections removed.

**Adaptive Priority Override (§12.1)** may reorder the visible sequence for: a possible winning
match or claim-sensitive outcome; a material correction; a live/pending/newly-completed draw; a
safety or responsible-play context; a source outage or stale purchase rule. Each override must
record trigger, start time and expiry. Personalisation can never outrank a possible win, a
correction or a safety state.

### 1.3 Required, conditional and suppressed

**Required (experience level):** S-01, S-02 (where active games exist), S-03, S-05, S-06, S-08 with
its claims/tax/anonymity/locator cards, S-08A, S-14 hub, S-15 hub, S-16, S-17, S-18.

**Conditional (PF-02 §4) — displayed only after data, lifecycle *and* review ownership are
approved:** live draws, online purchase, retailer finder, scratchers, unclaimed prizes, winners,
fund allocation, FAQs. *"Conditional never means add later without an owner."*

**Suppressed:** commerce in claim journeys, responsible-play contexts, distress/loss contexts and
whenever eligibility data is stale (§21, §58, §20 rule); the whole state result grid, Buy Online,
claim and tax modules on a no-lottery jurisdiction (§72); any module whose facts fall past their
freshness threshold (§56) — such a module must label, suppress or route, never silently display.

### 1.4 Protected task zones

Ads, promotion and interruption are prohibited inside: result verification; ticket-check input→output;
AI answer blocks; the space between live status and result; claim, tax and anonymity content;
correction notices; responsible-play guidance (Constitution §protected zones; PF-02 §60; Global Shell §122).
Production currently violates two of these — see §6.6 and the ad reconciliation §8.

### 1.5 State context

PF-02 §9 and Global Shell §6.5 agree: **page jurisdiction → explicit session selection → signed-in
preference → granted device location → manual ZIP/city/state → coarse IP as a *suggestion requiring
confirmation only*.** IP must never independently determine legal purchase eligibility, claim rules,
tax guidance or provider availability. When context is uncertain the interface must ask.

### 1.6 Mobile

Mobile is a primary surface. Binding rules (PF-02 §48, Global Shell §6.2–6.4): latest results must
not depend on horizontal swipe; state/game names and draw variants stay visible; the state section
menu is compact, not a permanently sticky row; AI and ticket-check keyboards must not hide actions;
**a sticky ad and a sticky purchase action never coexist**; state change is always accessible; claim
and responsible-play paths are never menu-only.

### 1.7 Accessibility

WCAG 2.2 AA is the floor (PF-02 §73, Global Shell §143, DS-18). Binding specifics: exactly one H1;
logical headings; skip link; result numbers as **text**; a **text equivalent for every bonus ball**
(DS-11 requires three simultaneous signals — visible label/abbreviation, distinct border/shape/pattern,
accessible name); accessible tables and accordions; no horizontal-swipe-only result access; exact
dates and time zones; keyboard-operable state selector, search and AI; a list alternative to any map;
**focus indicators never obscured by sticky elements** (DS-15); clear ad labels; reduced-motion
support (DS-16); 16 px minimum mobile body text (DS-09); tabular numerals (DS-10); validation at
**320, 375, 390, 768, 992, 1024, 1280, 1440 px** (DS-19).

These are **binding implementation requirements, not decisions** — confirmed by `FD-S-13`, which
removes all fourteen from the founder-decision count and moves them to the implementation checklist
and the visual review gate.

### 1.8 AI

Contextual, labelled, supportive. Global Shell §10.5 states that a single page-level AI module does
**not** satisfy AI compliance; each section declares its intelligence layer via the Section
Intelligence Matrix (PF-02 §53). Anonymous users receive **one complete answer** before any sign-in
ask (Global Shell §10.2). AI must never be the only unique state content (PF-02 §64B), and must never
determine winning numbers, corrections, eligibility, claim outcomes, tax advice, purchase
availability or affiliate recommendation.

### 1.9 Trust, source, correction, responsible play

Visible last-updated, official-source attribution, methodology and corrections where relevant; a
correction notice states **what changed, when, and the impact** (DS-29). Every governed rule carries
an effective date and a last-verified date (PF-02 §56A). The independent-publisher role, contacts,
responsible-play help, state age minimum and AI/affiliate disclosure links live in S-17. Schema must
reflect visible content only.

### 1.10 Unresolved decisions inherited into this page family

**Most of what LRG-SPEC-017 listed here is now ruled.** See `ST-DEC-001` for the 36 rulings and its §3
for the 8 that remain open. What genuinely persists:

| Source | Item | Effect on State |
|---|---|---|
| `source-conflicts.md` Conflict 3 | 11 open Member/Insider decisions | **Blocks the signed-in State sequence (S-01S…S-12S) only — not the anonymous preview.** Decision 1 touches `/insider`; decision 3 touches GAM ad treatment; decision 12 touches "increase your chances" copy remediation, which the legacy State page contains (§6.7) |
| DS-20 | 992 px threshold — approved *with ad-operations validation* | Extended to State by `FD-S-24`; ad-operations validation is still outstanding |
| DS-26 / DS-34 | Sticky-ad production creative height | The State sticky (`horizontalads2`, 50 px mobile max) was recorded as *consistent*; still formally deferred |
| DS-35 | Page-family ad volume | The State anchor→slot distribution → `OPEN-ST-01`, the only open decision that blocks the Florida preview |
| DS-37 | Final high-fidelity visual approval | Required per page family; State has had none → `OPEN-ST-06` |
| `design-system-founder-decisions.md` §8 | B-02 container width, B-03 density, T-04 weights, S-05 44×44 targets | Unratified → `OPEN-ST-06`. State review must not assume them |
| `FD-S-32` | Canonical host, trailing slash, date route, `/fl-new`, `/play/{game}` vs `/buynow/{code}`, redirect audit | Deferred to the SEO/infrastructure review → `OPEN-ST-05`. Blocks **production route cutover**, not a guarded preview route |

---

## 2. Current State implementation audit

Everything in this section was verified by reading the files at commit `482cd39`.

### 2.1 Route structure — verified

`01-new-ui/app/[state]/page.tsx` — 39 lines.

```
export function generateStaticParams() {
  return getAvailableStateSamples().map((state) => ({ state }));
}
```

- One dynamic segment, `/{state}`. Server component. `notFound()` on unknown slug.
- `generateMetadata` calls `getStatePage(state)` and `buildStateMetadata`.
- Renders `StatePageTemplate`.

**Static params are fixture-derived.** `lib/data-provider/index.ts:55-60`:

```
export function getAvailableStateSamples(): string[] {
  return fs.readdirSync(SAMPLE_DIR)
    .map((f) => /^state-([a-z]{2})-sample\.json$/.exec(f)?.[1])
    .filter((x): x is string => Boolean(x));
}
```

Route existence is a **directory listing**. This directly violates `CLAUDE.md` §10:
*"MUST NEVER derive route existence from a fixture filename or a directory listing."* Renaming a
fixture silently deletes a public URL. `getStatePage` performs a second `fs.existsSync` on the same
filename pattern, so the runtime 404 has the same source.

**No `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx` or `app/error.tsx` exists.** Verified by
directory listing. There are therefore no crawler directives at all, and `/buynow/` is not disallowed.

### 2.2 Template and components — verified inventory

`components/state/StatePageTemplate.tsx` — 230 lines, server component, one shared template for all
16 states. **No `if (stateCode === …)` branch exists anywhere in it.** Section order is hardcoded JSX.

Rendered sequence as coded:

1. `JackpotTicker` (full-bleed)
2. top ad band (`adSlotRefs.top`)
3. JSON-LD: `webPageSchema`, `breadcrumbJsonLd`, conditional `faqJsonLd`
4. breadcrumb `<nav>`
5. `<section id="results">` — H1 + intro
6. `TabNav`
7. `CampaignPlacement state.afterHero`
8. two-column grid: content column + `<aside>` rail
9. `QuickFactsTable`
10. Latest-results heading, `lastUpdated`, intro, info callout, `ContentFreshnessNote`
11. per result group: heading, `DynamicResultCard` grid, `inContent[gi]` ad, `mobileInContent[gi]` ad
12. `DrawScheduleTable`
13. `CampaignPlacement state.afterLatestResults`
14. `DataTable#jackpot-tracker`
15. `HighlightsGrid`
16. `CheckTicketTool`
17. `FaqAccordion` (mini)
18. `HistoryLinksSection`
19. `HighlightsAlerts`
20. `DataTable#winner-location`
21. `BiggestWinnersSection`
22. `DataTable#game-comparison`
23. `InfoSectionList#scratch-offs`
24. `InfoSectionList#second-chance`
25. `CampaignPlacement state.beforeClaiming`
26. `HowToClaim`
27. `TaxInfo`
28. `OddsAccordion`
29. `InfoSectionList#player-info`
30. `InfoSectionList#fund-allocation`
31. `InfoSectionList#anonymity`
32. `InfoSectionList#number-trends`
33. `InfoSectionList#legal-responsible-play`
34. `InfoSectionList#methodology`
35. `AiToolsTeaser`
36. `CampaignPlacement state.beforeFaq`
37. `FaqAccordion#faqs` (final)
38. trust notices
39. `adSlotRefs.bottom`
40. rail: `adSlotRefs.rightRail`
41. `StickyFooterAd`

**Mapping to PF-02.** Of the **19** governed content sections, the current page has a recognisable
counterpart for **10** — S-02 and S-05 substantively, and S-01, S-08, S-09, S-10, S-11, S-12, S-13,
S-17 partially. It has **no** counterpart for **9**: S-03 State AI Brief, S-04 Live and Upcoming
Draws, S-06 State Game Portfolio, S-07 Where to Play, S-08A State Essentials, S-14 State Community,
S-15 State News, S-16 Follow State, S-18 All States / Change State. It has **zero** signed-in
branches: all 12 signed-in section IDs are unimplemented.

**Not all nine absences block the first preview.** S-14 and S-15 are *required hubs* whose own PF-02 §4
conditions permit a sparse or cold-start state — *"activity may begin with Q&A/draw threads"* and
*"content may be initially sparse but real"* — so a genuine empty hub with no fabricated activity is
compliant. S-16 is blocked by the Member/Insider decisions, which is a signed-in-track blocker, not a
preview blocker. See `ST-DEC-001` §4 for the five-track split.

It also renders content with **no governed home** in PF-02: the "Welcome"/marketing carousel is gone,
but `QuickFactsTable`, `DataTable#jackpot-tracker`, `HighlightsGrid`, `#game-comparison`,
`#winner-location`, `#number-trends` and `#second-chance` are modules invented in the previous
generation. Some map onto S-08A, S-09, S-10 or S-12; the mapping is a specification decision, not an
audit finding.

### 2.3 State fixture model — verified

`lib/data-provider/types.ts` `StatePageData`: a single flat interface with **~40 optional top-level
keys**. `page` carries `stateCode`, `stateName`, `url`, `pageType`, `metadata`, `h1`, `intro`,
`lastUpdated`, `timezoneMeta`. Everything else is an optional presentation block.

Observed properties:

- **No provenance per field.** Provenance exists only as a free-text `_meta.purpose` per file.
- **No freshness, effective date, last-verified date, owner or review cadence** on any governed fact.
- **No state lifecycle**, no `isLotteryState`, no jurisdiction type, no operator identity.
- **No section identifiers.** Sections are implied by component call order.
- **No user-state model.** No anonymous/signed-in discriminator anywhere.
- **No eligibility model.** `buyTickets` is a pre-resolved `{label, href}` on the result card.
- **No interaction states** beyond `ResultCard.status: "latest" | "awaiting" | "closed" | string` —
  which is a widened `string`, so it is not exhaustive and cannot be checked.
- `adSlotRefs: Record<string, string[] | string>` — untyped keys, requiring the `asArr` coercion
  helper duplicated in both templates.

This satisfies `CLAUDE.md` §9's *"typed fixtures and view models"* only nominally: the types mirror
the sample JSON rather than expressing a contract.

### 2.4 Hardcoded state behaviour — verified

The template itself is state-agnostic. **Three real hardcodings sit around it**, and all three render
on every one of the 16 state pages:

| Location | Hardcoded value | Effect |
|---|---|---|
| `components/modules/HighlightsAlerts.tsx:23` | `<h3>Recent Florida Lottery Wins</h3>` | Every non-Florida state shows "Florida" above its own state's highlights |
| `components/modules/HighlightsAlerts.tsx:34` | `<h3>Unclaimed Florida Lottery Prizes</h3>` | Same |
| `components/layout/SiteHeader.tsx:45-52` and `MobileNav.tsx:53-59` | `<select disabled defaultValue="fl"><option value="fl">Florida</option></select>` | The **shell state selector is a disabled, single-option Florida control on all 16 states** — it both misstates context and violates DS-17 |

`StatePageTemplate.tsx:34` still describes itself as *"Florida state page — follows the proposed PDF
section flow."* The PDFs are now style-reference only.

### 2.5 Game-result rendering — verified strong

`DynamicResultCard` (126 lines) + `BallGroup` (35 lines) + `MultiplierBadge` (14 lines).

- Ball count derives from `group.values.length` — **never hardcoded**. Verified in source.
- Supports: multiple ball groups, named special balls via `colorToken`, add-ons (Fireball),
  multipliers, `secondaryDraw` (Double Play), card games via `format.isCardGame`, and the
  `awaiting`/`closed` statuses.
- Falls back to rendering whatever groups the data supplies when no `ResultFormatDefinition` exists
  — which is what happens for 101 of 112 referenced game IDs (§5).
- Numbers are server-rendered text, so they are crawlable (DS-13 satisfied).

Accessibility gaps against Global Shell §146 and DS-11/DS-14:

- Draw date and game **are** announced before values in DOM order (`<h3>` then date, then balls) — satisfied.
- Ball colour comes from `data-token`; **the only text distinction is `group.label`**, which is
  optional and null for main groups. DS-11 requires *three* simultaneous signals per special ball.
  Border/shape/pattern differentiation is absent — `.lc-ball` is one shape with a background swap.
- The ball group has no accessible name or role; a screen reader reads a bare run of numbers.
- `📅` and `🕐` emoji are used as unlabelled meaning-bearing glyphs (`DynamicResultCard.tsx:32-33`).
- `awaiting` renders `statusMessage ?? "Awaiting latest results"` but **not the exact next-draw date**
  that DS-14 requires.
- There is **no `corrected` status at all** in the type union or the component. DS-14 and PF-02 §71
  both require it.

### 2.6 Metadata and schema — verified

`lib/seo/metadata.ts` `buildStateMetadata` emits title, description, robots, OpenGraph (type,
siteName, title, description) and Twitter (card, title, description).

- **No canonical is emitted.** Deliberate — `metadata.ts:10-11` records that the host and
  trailing-slash convention are unresolved. Correct under the circumstances, but it means every state
  page currently ships with **no canonical signal at all** while production emits one (§3).
- **No `og:url`, no `og:image`, no `twitter:image`.** Legacy emits all three.
- JSON-LD emitted per state page: `WebPage` (with `@id`, `isPartOf`), `BreadcrumbList` (absolute
  URLs), and `FAQPage` **gated on `faqs.visibleOnPage && faqs.items`** — correctly gated.
- Sitewide: `Organization` and `WebSite`. **`SearchAction` has already been removed** from
  `lib/seo/siteSchema.ts` with a documented two-part rationale. `03-docs/18-florida-seo-source-audit.md`
  row 10 and row 13 still assert SearchAction is emitted — **that document is stale**; the code is
  correct and `CLAUDE.md` §11 is satisfied.
- PF-02 §64 prefers **`CollectionPage`** for the State Hub with `WebPage` as fallback, plus
  `Place`/`AdministrativeArea`, a separate state-lottery-operator organisation identity, stable `@id`
  values, and `mainEntity`/`about`/`mentions`/`isPartOf`. **None of that is implemented.**
- `SITE_URL` is hardcoded `https://www.lotterycorner.com` and used for absolute schema URLs. It is
  provisional and unreconciled with the canonical decision.
- `dateModified` is visible in copy but **not emitted machine-readably**, despite
  `page.lastUpdated.isoDateModified` existing in every fixture.

### 2.7 Breadcrumbs — verified

Rendered as a `<nav aria-label="Breadcrumb">` of `<a>` elements separated by a literal `›`, from
`page.metadata.breadcrumb`. All 16 fixtures use `Home → {State} Winning Numbers`. It is a plain
`<span>` chain, not an ordered list; the trailing (current-page) crumb is a live link to itself.
Legacy renders the same two crumbs as a `<ul>`.

### 2.8 Ad-slot mapping — verified

Covered in full in `03-docs/05-advertising/state-ad-inventory-reconciliation.md`. Summary: **14 slot
keys mapped, identical across all 16 fixtures; 9 actually render at ≥1024 px; 6 render between
992–1023 px; 12 recorded state-domain slots are never referenced.**

### 2.9 Affiliate actions — verified compliant in shape

- `BuyTicketsCta` **rejects any href that is not `/buynow/`** and renders nothing otherwise. It sets
  `rel="nofollow sponsored"` and `data-affiliate-resolved="false"`.
- `app/buynow/[code]/route.ts` returns a **200 text/plain placeholder** with
  `X-Robots-Tag: noindex, nofollow`. Legacy `/buynow/*` is a **302 redirect** (Struts `AffiliateAction`)
  and is robots-disallowed in production.
- **No external affiliate URL appears anywhere in the new UI.** Verified.
- **No disclosure of the material relationship appears next to any Buy Tickets CTA.** `CLAUDE.md` §13
  and PF-02 §61 both require conspicuous disclosure near every affiliate recommendation. The only
  disclosure-like text is the generic independence disclaimer in the trust block far below.
- **No eligibility check of any kind exists.** `card.buyTickets` is present or absent in the fixture.
  PF-02 §20 requires **Buy Tickets / Play Online only after confirmed state, game, provider and
  physical-location eligibility**; otherwise the label must be **Where to Play**. The current page
  labels the action "Buy Tickets" unconditionally.
- The approved commerce route is `/play/{game}` (BP-04 index §4). The implementation uses
  `/buynow/{code}`. **Unresolved — see §3.6.**

### 2.10 AI modules — verified minimal

`components/ai/AiToolsTeaser.tsx` — 36 lines, one heading, one paragraph, one **`disabled`** button
labelled "Sign in to try". The copy discipline is careful and non-predictive ("AI-assisted insights",
"for entertainment and informational purposes only"), and the fixture carries an explicit
`guardrail` string. That discipline should survive.

Against authority: Global Shell §10.5 states a single page-level AI module does not satisfy AI
compliance. PF-02 requires an AI role in **18 of 19** matrix rows (§53), a dedicated S-03 State AI
Brief with one complete anonymous answer, and an "Ask State AI" action in S-01. **None exists.** The
one AI control that does exist is permanently disabled, violating DS-17.

### 2.11 Community and editorial modules — verified absent

- **No community module of any kind.** PF-02 requires S-14 as a **required hub**.
- **No news/blog/guides module.** PF-02 requires S-15 as a **required hub**.
- Editorial-adjacent content exists only as `InfoSectionList` prose and `HighlightsAlerts`.
- Legacy renders a *Recent Blog Posts* card in the About-[State] right column, driven by
  `blog.recentPosts` — real production editorial the new page drops entirely.

### 2.12 Mobile behaviour — verified

- Single column below `lg` (1024 px); rail hidden.
- `MobileNav` is a hamburger drawer holding nav + the disabled state selector + disabled login/register.
- **No bottom navigation exists** (Global Shell §6.2 requires five persistent destinations).
- **No sticky-conflict arbitration exists** (Global Shell §6.4, DS-28). The sticky footer ad is the
  only sticky layer today, so nothing collides *yet*; clearance is a hardcoded `pb-28` on the page
  container (`StatePageTemplate.tsx:67`) rather than derived from reserved height.
- Result cards stack; ball groups wrap via `flex-wrap`. No horizontal-swipe dependency — satisfies
  PF-02 §48.
- Content column is capped at `max-w-[70ch]` inside a `lc-container` of `max-width: 72rem` (1152 px).
- Tables (`DataTable`, `DrawScheduleTable`, `HowToClaim`) have **no `overflow-x` container**, so wide
  tables can push horizontal page scroll at 320–375 px. The `.lcp-scroll-x` utility exists but is
  scoped to the Home preview layer.

### 2.13 Accessibility — verified against DS decisions

| Requirement | Status on the State page | Evidence |
|---|---|---|
| DS-15 visible focus, ≥3:1, never obscured | **Absent.** `:focus-visible` is defined only under `[data-lc-preview]` (`globals.css:494`). The State page has no focus style at all. | `globals.css` |
| DS-16 reduced motion | **Absent.** The `prefers-reduced-motion` block is scoped to `[data-lc-preview]`. | `globals.css:827` |
| Forced colors | **Absent.** The `forced-colors: active` block is scoped to `.lcp-*`. | `globals.css:839` |
| DS-09 16 px minimum mobile body | **Violated.** Page container is `text-[15px]`. | `StatePageTemplate.tsx:67` |
| DS-10 tabular numerals | **Absent.** No `font-variant-numeric` anywhere in the `lc-*` layer. | `globals.css` |
| DS-02/DS-03 blue primary, red reserved for corrections | **Violated.** `--lc-accent: #b91c1c` (red) is the primary CTA colour, used for Buy Tickets, prize amounts, awaiting-status text and the sticky-ad close button. | `globals.css:16` |
| DS-04 contrast corrections | **Not applied.** `--lc-muted: #64748b` and `--lc-border: #e2e8f0` are the measured-failing values; both are used throughout the State page. | `globals.css:15,12` |
| DS-11/DS-14 non-colour special-ball distinction | **Partial.** Optional text label only; no border/shape/pattern, no accessible name. | `BallGroup.tsx` |
| DS-17 no non-functional controls | **Violated — 14 disabled controls in 7 groups on the State page path:** (1) shell state selector, desktop + mobile — 2; (2) mobile-nav auth buttons — 2; (3) `AccountHooks` login, register and the result-card favourite star — 3; (4) `AiToolsTeaser` CTA — 1; (5) `CheckTicketTool` `<select>`, `<input type=date>` and submit — 3; (6) footer newsletter input + submit — 2; (7) footer Privacy Manager — 1. *(LRG-SPEC-017 said "9 instances", which matched neither the group count nor the control count. A `<option disabled>` placeholder in `CheckTicketTool` is excluded — it is not a control.)* Disposed of by a single rule, `FD-S-08`. | grep of `disabled` |
| DS-30 light mode only | **At risk.** A `:root[data-theme="dark"]` block exists with `--lc-accent` and all seven ball tokens unoverridden. DS-30 warns this must not be inferred as approved. | `globals.css:38-49` |
| Single H1 | Satisfied — one `<h1>`. | verified |
| Heading hierarchy | Section headings are `<h2>`; group headings `<h3>`; card titles `<h3>`. Result-card `<h3>` siblings of a group `<h3>` produce a flat level. | verified |
| Skip link | **Absent.** | `layout.tsx` |
| `<main>` landmark | Present in the non-preview branch of `layout.tsx`. | verified |
| Ad labelling | `role="complementary" aria-label="Advertisement"` plus visible text. Satisfied. | `AdSlotView.tsx` |
| Table semantics | `<th>` present; **no `<caption>`, no `scope`**. | `DataTable.tsx`, `DrawScheduleTable.tsx` |
| Zoom to 200% | Not verified in this task; the legacy page actively blocks zoom (§6.5) and the new page does not — no `maximum-scale` is set. **New page is better here.** | verified |

### 2.14 Test coverage — verified

**There is none.** `package.json` declares four scripts (`dev`, `build`, `start`, `lint`) and no test
framework, runner, or assertion library in dependencies or devDependencies. No `*.test.*` or
`*.spec.*` file exists outside `node_modules`. `next.config.mjs` sets
`eslint: { ignoreDuringBuilds: true }`, so lint does not gate the build either.

The only machine-enforced invariant anywhere in the codebase is `assertHomeAdBaseline()` in
`lib/layout/adAnchors.ts` — a Home-only guard. **The State page has no equivalent ad-inventory guard.**

### 2.15 Reuse classification

Vocabulary per `CLAUDE.md` §6. For every REFACTOR and REPLACE, what must be preserved is stated.

| # | Artifact | Decision | Must be preserved |
|---:|---|---|---|
| 1 | `app/[state]/page.tsx` — dynamic route + SSG + `notFound()` | **REFACTOR** | The `/{state}` URL pattern; server rendering; SSG; `notFound()` on unknown slug (better than legacy's soft-404 wildcard); the recorded decision that date-specific results use the *same* route plus a date param, not a new route |
| 2 | `getAvailableStateSamples()` filesystem param source | **REPLACE** | Only the property that routes stay **statically enumerable** for SSG and sitemap generation. The `readdirSync` mechanism itself must not survive |
| 3 | State route registry | **REPLACE (create new)** | — must become the single source of state-route existence, covering territories (`/pr`, `/vi`) and no-lottery jurisdictions |
| 4 | `StatePageTemplate.tsx` | **REPLACE** | The one-template/all-states/data-only architecture — no `if (stateCode === …)` exists and that must survive; the render-only-if-data-present module pattern; the documented right-rail policy (production ad slots and known widgets only; AI teasers never in the rail); the existing 41-step sequence as a **coverage checklist** so nothing currently rendered is lost by omission |
| 5 | Hardcoded JSX section order | **REPLACE** | Externalise to a section-order contract keyed to PF-02 section IDs |
| 6 | `DynamicResultCard` | **KEEP AND RESTYLE** | Format-driven rendering with no hardcoded ball count; add DS-11/DS-14 signals, an accessible group name, exact next-draw date on `awaiting`, and a `corrected` state |
| 7 | `BallGroup` | **KEEP AND RESTYLE** | `values.length`-derived count; `colorToken` indirection; server-rendered text |
| 8 | `MultiplierBadge` | **KEEP AND RESTYLE** | Data-driven full-text multiplier rendering (DS-14: never a bare number) |
| 9 | `AdSlot` / `AdSlotView` | **KEEP AND RESTYLE** | Reserved-height computation from the slot's own size mapping; the `[992,0]`/`[0,0]` tier split; the single documented `googletag` hook point; `data-*` provenance attributes. Add: explicit no-fill state; the DS-20 threshold fix |
| 10 | `StickyFooterAd` | **REFACTOR** | The absolutely-positioned close button that adds no height; `#stickyAd`/`#adContent`/`#closeAdButton` structural fidelity. Add: Global Shell §6.4 priority arbitration; derived clearance replacing `pb-28`; production's 1-hour `hideAd` cookie semantics rather than component state |
| 11 | `BuyTicketsCta` | **KEEP AS REFERENCE** | The hard guard that rejects any non-`/buynow/` href — the no-hardcoded-external-URL guarantee. **Do not extend**: the `/play/{game}` vs `/buynow/{code}` route conflict is unresolved, and eligibility gating and disclosure are missing |
| 12 | `app/buynow/[code]/route.ts` | **KEEP AS REFERENCE** | The no-external-URL guarantee and `X-Robots-Tag: noindex, nofollow`. Note it returns 200, not the legacy 302, and no `robots.txt` disallows it |
| 13 | `lib/data-provider` seam | **KEEP** | The single module that knows where data comes from. Only its `getAvailableStateSamples` export is replaced (row 2) |
| 14 | `lib/data-provider/types.ts` `StatePageData` | **REPLACE** | The *concept* of a typed page payload; the `ResultFormatDefinition`, `BallGroupDef` and `AdSlotDefinition` shapes, which are genuinely domain-shaped. The flat 40-optional-key presentation blob must not survive as the contract |
| 15 | Generic module components — `InfoSectionList`, `DataTable`, `QuickFactsTable`, `DrawScheduleTable`, `HistoryLinksSection`, `BiggestWinnersSection`, `HighlightsGrid`, `ContentFreshnessNote`, `OddsAccordion` | **KEEP AND RESTYLE** | Props-only, page-uncoupled design; headings from data. Each must be mapped to a PF-02 section ID and given a Section Intelligence Matrix entry |
| 16 | `FaqAccordion` | **KEEP AND RESTYLE** | The visibility gate on FAQ schema (`visibleOnPage && items`) |
| 17 | `HighlightsAlerts` | **REFACTOR** | The section's data shape. **Remove** the two hardcoded "Florida" headings (lines 23, 34) |
| 18 | `HowToClaim`, `TaxInfo` | **KEEP AND RESTYLE** | Card structure. Add: ad suppression inside the section; effective/last-verified dates; an environment gate so synthetic deadlines and tax guidance can never render as fact |
| 19 | `CheckTicketTool` | **REFACTOR** | The input→output flow shape and the "no ad between input and output" placement. Its three `disabled` controls must be implemented, hidden, or explicitly labelled unavailable (DS-17) |
| 20 | `TabNav` | **KEEP AND RESTYLE** | Data-driven anchors. Add ARIA tab semantics; reconcile the anchor IDs against PF-02 §64A (§3.5) |
| 21 | `AiToolsTeaser` | **REPLACE** | The non-predictive copy discipline and the fixture `guardrail` field — both are Constitution requirements. Rebuild as per-section contextual AI entries |
| 22 | `AccountHooks` | **KEEP AS REFERENCE** | The recorded intent that entry points stay visible. **Do not extend** — blocked by the 11 open Member/Insider decisions |
| 23 | `SiteHeader`, `MobileNav` | **REPLACE** | Carry forward as *requirements* only: state navigation, game navigation, high-value internal links. Nothing structural survives; Global Shell v1.1 §4–§6 governs |
| 24 | `SiteFooter` + `footer-config.json` | **KEEP AND RESTYLE** / **KEEP** | The config-driven rendering and the real production link set — "do not invent links" |
| 25 | `JackpotTicker` | **KEEP AND RESTYLE** | Data-driven band; map to an approved shell section ID |
| 26 | `CampaignPlacement` / `CampaignBanner` / `lib/campaign` | **KEEP** | Placement allowlist, priority and GAM separation. Campaigns must never replace, move, collapse or reorder a GAM slot |
| 27 | `cleanCopy` | **KEEP** | Strips `[ADMIN]` / `[VERIFY-*]` before render — verified zero marker leakage |
| 28 | `PartnerScripts` | **KEEP** | Env-gated, inert by default; no script fires without an explicit `"true"` flag |
| 29 | SEO helpers `buildStateMetadata`, `breadcrumbJsonLd`, `faqJsonLd`, `JsonLd`, `siteSchema` | **REFACTOR** | The FAQ visibility gate; the SearchAction removal and its recorded rationale; absolute schema URLs. Add: `CollectionPage`, jurisdiction and operator entities, stable `@id`s, `dateModified`, canonical + `og:url` once the host decision lands |
| 30 | 16 state fixtures | **REFACTOR** | Real result values sourced from `latest-results-lc.xml`; the per-state module variety they demonstrate. Must gain provenance, freshness and lifecycle fields, and synthetic winner/unclaimed content must be gated (§4.4) |
| 31 | `states-config.json` | **REFACTOR** | The `moduleKeys` toggle concept, timezone fields and the `isLotteryState` flag. Must be expanded from 5 to the full jurisdiction set and become the route registry's backing data |
| 32 | `ad-slot-definitions.json` | **KEEP** | Verbatim production values. Corrections needed are recorded, not applied (ad reconciliation §0.1) |
| 33 | `result-format-definitions.json` | **KEEP** | The `ResultFormatDefinition` / `BallGroupDef` / `EffectiveDateRange` shape. Coverage expansion is data work (§5) |
| 34 | `03-docs/09`, `10`, `16`, `17`, `18`, `19` | **KEEP AS REFERENCE** | Historical discovery. `18` is now **stale** on SearchAction; `17` is stale on scope ("only `/fl` is built out") |
| 35 | `UtilitySubBar` (orphaned) | **ARCHIVE** | The recorded requirement that a utility sub-bar was expected as global chrome — reconcile against Global Shell v1.1 before discarding the intent |
| 36 | `globals.css` `lc-*` token layer | **MERGE** | Must merge into the DS token layer currently confined to `[data-lc-preview]`, so the State page inherits focus, reduced-motion, forced-colors, contrast corrections and the 992 px threshold |

---

## 3. State route and canonical audit

### 3.1 Approved route format

PF-02 §62: *"Use the approved existing state route from the migration/canonical inventory… The
blueprint does not authorize changing an established state URL without a separate migration
decision."* §78 decision 13 repeats it. `CLAUDE.md` §10 lists `/{state}` two-letter state-code hubs
**including territories such as `/pr` and `/vi`** as MUST-preserve.

### 3.2 Legacy state routes — verified from `src/struts.xml`

| Pattern | Action | Result template | Note |
|---|---|---|---|
| `/{state}` | `StateResultsAction` | `lottery-result_upgrade_as_new.jsp` | Production state page |
| `/{state}/` | `StateResultsAction` | same | **Trailing-slash twin, separately routed** |
| `/{state}/{yyyy}/{mm}/{dd}` | `StateResultsAction` | same | **Date-specific state results — a real production route** |
| `/{state}/{yyyy}/{mm}/{dd}/` | `StateResultsAction` | same | Trailing-slash twin |
| `/{state}` → `al \| ak \| hi \| ut \| nv` | `StateResultsAction` | `state_al.jsp`, `state_ak.jsp`, `state_hi.jsp`, `state_ut.jsp`, `state_nv.jsp` | **Five dedicated no-lottery jurisdiction templates** — production's ST-06 implementation |
| `/{state}` → `special` | `StateResultsAction` | `lottery-result_upgrade_special.jsp` | Which states resolve to `special` is decided in Java, not configuration |
| `/fl-new`, `/fl-new/` | `StateResultsAction` | `florida_newVersion.jsp` | **Test route.** Its H1 is the exact string the current fixtures use |
| `/{state}/{game}` (+ `/`) | `GameResultsAction` | `game_upgrade_as.jsp` | Out of scope here |
| `/{state}/{game}/{year}` (+ `/`) | `GameResultsHistoryAction` | `gamehistoryresults_upgrade_as.jsp` | Has a `redirectToLatest` result — an existing redirect behaviour |
| `/buynow/*` | `AffiliateAction` | — | Commerce resolver |

`struts_old.xml` references `lottery-result_upgrade.jsp` — a third, older state template. It remains
an **open question** per `CLAUDE.md` §10.

### 3.3 Findings

**R1 — the audited template was not the production template.** `lottery-result_upgrade_as.jsp` is
referenced by **zero** Struts results. `ad-slot-definitions.json` and `03-docs/17` both cite it as
the source of production ad values. The slot inventories happen to be identical, so no recorded value
is wrong, but the citation is. Full detail in the ad reconciliation §0.1.

**R2 — trailing-slash twins.** Legacy explicitly routes both `/{state}` and `/{state}/`. Next.js
defaults to `trailingSlash: false` and `next.config.mjs` sets no override, so `/fl/` 308-redirects to
`/fl`. That is probably the desired end state, but it is a **behaviour change to an indexed URL
class** that has not been approved, and it must be audited against existing Apache/Cloudflare rules
before any Next redirect is added (`CLAUDE.md` §10).

**R3 — canonical is internally inconsistent in production.** In `lottery-result_upgrade_as_new.jsp`:

- `<link rel="canonical" href="https://www.lotterycorner.com/{state}">` — **no trailing slash**
- `WebPage` JSON-LD `url` and `@id`: `https://www.lotterycorner.com/{state}/` — **with trailing slash**
- `BreadcrumbList` JSON-LD item url: `…/{state}/` — **with trailing slash**
- `og:url`: `…/{state}` — no trailing slash
- `relatedLink` game URLs: `…/{state}/{game}/` — with trailing slash

Production therefore emits **conflicting canonical signals about its own state URLs**. The recorded
migration target is non-`www` with no trailing slash; production is `www`. One fixture
(`state-me-sample.json._meta.canonicalTarget`) already records `https://lotterycorner.com/me (no
trailing slash; www->non-www migration pending)` while the other fifteen record only
`[VERIFY-CONVENTION]`. **Requires SEO/infrastructure approval.**

**R4 — the new implementation emits no canonical at all.** Defensible while the convention is
unresolved, but it means state pages currently ship weaker canonical signalling than production.

**R5 — routes are fixture-derived.** §2.1. Violates `CLAUDE.md` §10 outright.

**R6 — route coverage gap.** The production results feed carries **49 jurisdictions**; 16 fixtures
exist; `states-config.json` lists 5. **33 jurisdictions that production serves would 404** in the new
implementation. `hi` is configured (`isLotteryState: false`) but has no fixture, so `/hi` 404s while
production serves `state_hi.jsp`.

**R7 — the date route is unimplemented.** `/{state}/{yyyy}/{mm}/{dd}` is a live production route with
a visible entry point (the state page's date-picker control, `_as_new.jsp` L515-523). The new
implementation has no counterpart. `app/[state]/page.tsx:12` records the intent — *"Date-specific
results use the SAME route + a date param later (not a separate route)"* — which **conflicts with the
production path-segment form**. Unresolved.

**R8 — no-lottery jurisdictions have no model.** Production has five dedicated templates
(`al`, `ak`, `hi`, `ut`, `nv`). PF-02 §72 specifies the ST-06 experience. The new implementation has
neither; those states simply 404.

**R9 — invalid state handling.** New: `notFound()` → Next's default 404. Legacy: the `*` wildcard
matches **any** single-segment path, so an unknown slug renders a state page shell — a soft-404 across
an unbounded URL space. The new behaviour is better; it should be preserved and made explicit
(`app/not-found.tsx` does not exist).

**R10 — `/fl-new` exists in production.** A Struts-routed test URL rendering `florida_newVersion.jsp`.
Its indexability, and whether it should be removed or redirected, is unresolved (`CLAUDE.md` §10 lists
`/fl` vs `/fl-new` as an open question).

**R11 — no sitemap.** `app/sitemap.ts` does not exist. `03-docs/20-sitemap-and-url-generation-plan.md`
holds a ready plan (state-only sitemap first, `lastmod` from `isoDateModified`, current production
host until migration is approved). PF-02 §68 defines which events may move a state page's `lastmod`.

**R12 — no `robots.txt`.** `app/robots.ts` does not exist, so `/buynow/` is not disallowed — while
production disallows it.

### 3.4 Route classification

| Route | Class | Note |
|---|---|---|
| `/{state}` | **preserve** | Largest state surface; no change authorised |
| `/{state}/` | **decision required** | Legacy twin vs. Next 308 |
| `/{state}/{yyyy}/{mm}/{dd}` | **decision required** | Production route with no new-implementation counterpart |
| `/al`, `/ak`, `/hi`, `/ut`, `/nv` | **preserve** | ST-06 experience — **ruled** by `FD-S-31`; no longer 404 |
| `/pr`, `/vi` | **preserve** | Territories, in the feed, no fixture; registry class per `FD-S-30` |
| `/usx` | **must never exist** | `USX` is a feed pseudo-jurisdiction — **ruled** by `FD-S-30` |
| `/fl-new` | **deferred** | Test route → `OPEN-ST-05` |
| `/buynow/{code}` | **deferred** | vs. approved `/play/{game}` → `OPEN-ST-05`, source Conflict 14 |

### 3.5 Section-fragment conflict

Legacy in-page anchors and all 16 fixtures' `tabs` use the **same five** fragments:

```
#results  #winning-history  #schedule  #how-to-play  #how-to-claim
```

PF-02 §64A mandates stable fragments:

```
#latest-results  #live-draws  #games  #check-ticket  #where-to-play
#claim-prize  #taxes  #state-essentials  #scratchers  #community  #news
```

**Zero overlap.** These identifiers support direct links, accessibility, analytics, AI citations and
future app deep links, and the legacy set is live in production HTML today.

**Ruled by `FD-S-33`:** the PF-02 fragments become the primary IDs; a legacy fragment is preserved
only as a secondary alias target, and only where a live inbound-link or analytics dependency is
**demonstrated** — not by default, and never by duplicating a visible section.

### 3.6 Commerce route conflict

Approved pattern: `/play/{game}` (BP-04 index §4). Current implementation: `/buynow/{code}`. Legacy:
`/buynow/*` → `AffiliateAction` → 302, robots-disallowed. **`CLAUDE.md` §10 requires the URL audit
and founder approval before either is switched.** Not resolved here.

### 3.7 Route dispositions after the LRG-DEC-018 rulings

| Prior item | Disposition |
|---|---|
| Fixture-derived route source; jurisdiction list | **RULED** — `FD-S-30`: explicit registry with five jurisdiction classes; no `/usx` |
| ST-06 no-lottery routes and experience | **RULED** — `FD-S-31`: `/al /ak /hi /ut /nv` preserved with the ST-06 experience |
| Section-fragment set | **RULED** — `FD-S-33`: PF-02 fragments primary, evidence-gated legacy aliases |
| Sitemap scope, split and `lastmod`; `robots.txt` incl. the `/buynow/` disallow; schema projection | **EXECUTION** — `FD-S-34`: implementation/SEO work items, not product decisions. `/buynow/` must remain non-indexable regardless |
| Canonical host · trailing slash and the production canonical/JSON-LD contradiction · date-route form · `/fl-new` · `/play/{game}` vs `/buynow/{code}` · Apache/Cloudflare redirect audit | **DEFERRED** — `FD-S-32` → `OPEN-ST-05`, the dedicated SEO/infrastructure review |
| `struts_old.xml` legacy state routes | **EXECUTION** — evidence gathering for the migration review |

**Scope consequence:** none of the deferred items blocks a *guarded preview route*. They block
**production route cutover** only (`ST-DEC-001` §4, Track 3).

**No redirect was implemented and no canonical decision was invented.**

---

## 4. State data audit

### 4.1 What exists

| Source | Content | Classification |
|---|---|---|
| `04-sample-data/source-xml/latest-results-lc.xml` | 188 KB; **49 jurisdictions, 448 games**; per game: `result-date`, `numbers-str`, `next-date`, and where applicable `jackpot`, `next-jackpot`, `prize`, `next-prize`; **9 `<payout>` elements** | **Production-derived** |
| `04-sample-data/payout-sample.json` | Normalised payout rows for one real draw (CA Fantasy 5, gameId 314) | **Production-derived** (normalisation is illustrative) |
| `04-sample-data/reference-tables/` | `game.csv` (580 KB), `state_info.csv` (149 KB), `state_game.csv`, `schema-only.sql` | **Production-derived** (DB export) |
| `04-sample-data/result-format-definitions.json` | **13** format definitions | **Configuration** |
| `04-sample-data/states-config.json` | **5** states: `fl`, `az`, `ny`, `ca`, `hi` | **Configuration** — `_meta.illustrative: true` |
| `04-sample-data/state-*-sample.json` | **16** fixtures | **Mixed** — see §4.4 |
| `04-sample-data/ad-slot-definitions.json` | 47 slot definitions, 12 named size maps | **Production-derived** (provenance citation wrong — ad recon §0.1) |
| `04-sample-data/footer-config.json` | Real production footer link set | **Production-derived** |
| `05-design-inputs/state-pages/content-docs/*.docx` | Louisiana, Maine, Maryland, Minnesota, Mississippi | **Copied editorial** |
| `05-design-inputs/state-pages/proposed-screenshots/*.pdf` | 11 states | **Style reference only** |
| `05-design-inputs/state-pages/existing-screenshots/*.png` | AZ, AR, CA, CO, FL | **Behaviour and ad-inventory evidence only** |

### 4.2 Jurisdiction coverage

| Set | Count | Members |
|---|---:|---|
| In the results feed | **49** | AZ AR CA CO CT DE FL GA ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT **USX** NE NH NJ NM NY NC ND OH OK OR PA **PR** RI SC SD TN TX **VI** VT VA WA DC WV WI WY |
| Have a fixture | **16** | ar az ca co ct de fl la ma md me mi mn ms ny va |
| In `states-config.json` | **5** | fl az ny ca **hi** |
| In feed, no fixture | **33** | dc ga ia id il in ks ky mo mt nc nd ne nh nj nm oh ok or pa pr ri sc sd tn tx usx vi vt wa wi wv wy |
| Configured but no fixture | **1** | hi (`isLotteryState: false`) |
| Non-lottery jurisdictions with a legacy template | **5** | al ak hi ut nv — **none has a fixture; none is in the feed** |
| `USX` | 1 | A multi-state pseudo-jurisdiction (10 games) in the feed. It is **not** a state hub and must not become `/usx` |

### 4.3 Per-fixture inventory

Games per fixture range **6 → 15** (14 for ME and MD, 15 for VA, 6 for AZ/MA/MN). Result groups are
`multiState` / `inState` / `pick` in 15 fixtures; **Maine has only two** (`multiState`, `pick`) —
which is why one `inContent` and one `mobileInContent` ad slot never render there.

Module presence across the 16 fixtures:

| Module key | States |
|---|---:|
| `page`, `latestResults`, `tabs`, `adSlotRefs`, `howToClaim`, `taxes`, `faqs`, `finalFaqs`, `playerInfo`, `jackpotTicker`, `popularGames`, `aiToolsTeaser`, `accountHooks`, `officialSourceNotice`, `independenceDisclaimer`, `responsiblePlayNotice`, `_meta` | **16 / 16** |
| `quickFacts`, `drawSchedule`, `historyLinks` | 15 (not FL) |
| `highlights` | 15 (not CT) |
| `oddsGuide` | 6 — ar az ct fl ma mi |
| `checkTicket` | 5 — ar az co fl va |
| `contentMeta`, `jackpotTracker` | 5 — la md me mn ms |
| `biggestWinners` | 4 — ar az ca mi |
| `anonymityRules` | 4 — ca de me va |
| `fundAllocation` | 4 — co ct mi va |
| `scratchOffs` | 5 — az ca ct la va |
| `winnerLocation` | 3 — de ma mi |
| `gameComparison` | 2 — ar ct |
| `secondChance` | 2 — md mn |
| `legalResponsiblePlay` | 1 — az |
| `sourcesMethodology` | 1 — fl |
| `numberTrends` | 1 — ma |
| `highlightsGrid` | 1 — ny |

### 4.4 Provenance classification of fixture content

| Field group | Classification | Evidence and risk |
|---|---|---|
| `latestResults` ball values, draw dates, next dates, jackpots | **Production-derived** | Every fixture `_meta` states values come from `source-xml/latest-results-lc.xml`. Real. |
| `page.metadata` title / description / H1 / intro | **Synthetic (admin-editable placeholder)** | Written as clean production copy; `_meta.editableContentNote` says every text block is admin/API-editable. |
| `page.lastUpdated`, `timezoneMeta` | **Configuration** | See §4.5. |
| `howToClaim` deadlines, thresholds, documents | **Synthetic** presented as fact | e.g. FL `"Draw games: 180 days from draw date"`. Plausible and possibly correct, but **unsourced and undated**. PF-02 §21 requires source + effective date. |
| `taxes` withholding rates and state notes | **Synthetic** presented as fact | e.g. `"Mandatory federal withholding: 24%"`, `"Florida does NOT charge state income tax…"`. Unsourced, undated. |
| `highlights.recentWins`, `highlights.unclaimedPrizes` | **SYNTHETIC — presented as real public fact** | **Highest-severity finding.** FL fixture asserts *"$2 Million Florida Lotto: a ticket worth $2 million was sold in Tampa. The ticket must be claimed within 180 days"*; *"Fantasy 5 … $208,000 … Miami … Expires soon. Ticket purchased at a convenience store in southwest Miami."* These are fabricated winners, amounts, cities, retailer types and claim deadlines, rendered as clean production copy with no gate. Violates `CLAUDE.md` §14, Constitution §12 and PF-02 §76 (*"no fabricated community"*, *"no stale claim/tax presented as current"*). `_meta.illustrative: true` exists but **nothing in the code reads it**. |
| `oddsGuide` prize matrices | **Mixed** | `03-docs/19` records that only Powerball/Mega Millions odds are real; in-state odds were deliberately omitted to avoid fabrication. That restraint is correct and must be preserved. |
| `faqs`, `finalFaqs`, `playerInfo`, `scratchOffs`, `fundAllocation`, `anonymityRules`, `numberTrends`, `secondChance`, `legalResponsiblePlay`, `sourcesMethodology` | **Synthetic / copied editorial** | LA/ME/MD/MN/MS derive from the `content-docs/*.docx` inputs — copied editorial. The rest is authored sample copy. |
| `officialSourceNotice`, `independenceDisclaimer`, `responsiblePlayNotice` | **Synthetic but compliant in substance** | Correct disclaimers; not sourced to a policy page. |
| `contentMeta` (`source`, `reviewStatus`, `lastReviewed`) | **Configuration** — the seed of a real freshness model | Only 5 of 16 fixtures carry it; rendered by `ContentFreshnessNote`. |
| `adSlotRefs` | **Production-derived by reference** | slotKeys only; no GAM value duplicated. Correct pattern. |
| `buyTickets.href` | **Configuration** | Only `/buynow/{code}`; never an external URL. Correct. |

### 4.5 Date and time-zone handling

Every fixture records `storedTimezone: America/New_York`, matching the feed
(`updated-time="Wed 07/08/2026 11:17:33 PM EDT"`). `gameLocalTimezone` and `displayTimezone` vary
correctly per state (`America/Phoenix` for AZ, `America/Los_Angeles` for CA, `America/Chicago` for
AR/LA/MN/MS, `America/Denver` for CO). Display strings carry the correct abbreviation (`MST` for AZ,
`PT`, `CT`, `MT`, `ET`).

**But the values are pre-rendered strings.** `lastUpdated.display` is authored text; there is no
runtime conversion, so the stored→game-local rule is *documented in the data* rather than *enforced
by the system*. `CLAUDE.md` §14 requires that year and date routes reflect the **game-local** draw
date. The legacy off-by-one behaviour is a symptom to test against — and there is **no test at all**
(§2.14).

### 4.6 Missing data

Facts PF-02 requires that **no** fixture supplies: minimum purchase age · jurisdiction type and
lottery status · state lottery operator identity and official URL · verified draw cutoff rules ·
purchase-option classification and provider eligibility · claim thresholds with source and effective
date · winner-anonymity rule with source and effective date · retailer/claim-centre locations ·
responsible-play contacts · per-field effective and last-verified dates · review cadence and freshness
threshold · source URL, source type and trust tier · content owner · correction/version history ·
module enablement/suppression reason · stable entity identifiers. Legacy **does** carry the operator
address, phone and official URL (`stateDetails.address`, `stateDetails.url`) — the new fixtures dropped
them.

### 4.7 Fixtures are not API contracts

`CLAUDE.md` §14 and §15 both apply. `StatePageData` is a presentation payload built for superseded
requirements. The DB export in `reference-tables/` and the live results feed are legitimate inputs to
future API design; **the page fixtures are not.**

---

## 5. Result-format audit

### 5.1 Coverage

| Measure | Count |
|---|---:|
| Format definitions in `result-format-definitions.json` | **13** |
| Distinct `gameId` values referenced by the 16 state fixtures | **112** |
| Referenced IDs **with** a definition | **11** |
| Referenced IDs **without** a definition | **101 — i.e. 101 of 112 referenced games (90 %) are ungoverned** |
| Definitions for games no fixture uses | 2 — `384` KY 5 Card Cash, `511` IN Quick Draw |

The single consistent statement of this gap: **11 of 112 referenced games have a governed format; 101
do not.** The ratio 13 : 112 is not the coverage ratio — two of the thirteen definitions belong to
games no fixture references.

The 11 covered IDs are: 301, 303, 305 (AZ), 332, 336, 337, 563, 577, 614 (FL/AZ), 1012 Powerball,
1013 Mega Millions.

`DynamicResultCard` degrades gracefully — with no definition it renders whatever groups the data
supplies. So the page *works*, but for 90 % of games there is **no governed format**: no declared
ball count, no declared special-ball semantics, no multiplier or add-on declaration, and **no
date-effective rule**.

### 5.2 Format features — supported vs. unsupported

**Proven supported** (definition exists and the component handles it):

| Feature | Evidence |
|---|---|
| Variable main-ball count 1 → 21 | `614` Cash Pop `maxBallCount: 1`; `511` Quick Draw `maxBallCount: 21` (10/80 + special) |
| Named special balls | `1012` Powerball, `1013` Mega Ball via `specialBalls[]` |
| Multipliers | `1012` Power Play, `1013` Megaplier — rendered full-text by `MultiplierBadge` |
| Add-ons | `332`, `563` Fireball via `addOns[]` |
| Secondary draw | `1012` Powerball Double Play, `337` Florida Lotto Double Play (`playType: "6/53+6/53"`, `maxBallCount: 12`, `secondaryDraw: true`) |
| Card games | `384` KY 5 Card Cash, `valueType: "card"`, `isCardGame: true`, `cardFaces` |
| Digit games | `301`, `332`, `563` — `valueType: "digit"` |
| **Date-effective ranges** | `effectiveFrom` / `effectiveTo` exist on the definition and `formatRef.effectiveFrom` on the card. Populated for **4** definitions: `332` and `563` from 2019-04-28; `1012` from 2015-10-07; `1013` from **2025-04-08** (the Mega Millions format change) |

**Unsupported / unproven — every one needs a new definition:**

| Format class | Games seen in fixtures with no definition |
|---|---|
| Keno / high-count | `402` MI Keno, `427` NY Pick 10 |
| Named special balls beyond PB/MM | Cash Ball, Lucky Ball, **Star Ball** (Lotto America `1018`), Bonus Ball, **Mega 9** (SuperLotto Plus `316`) |
| Bonus-ball lotto | `331` DE Multi-Win Lotto, `392` MD Bonus Match 5, `515` MD Multi Match |
| Multiplier games | `605` MS *Match 5 With Multiplier* |
| Horse-race style | `315` CA **Daily Derby** — a distinct result shape (racers + race time) unlike any modelled group |
| Cash Pop variants | 16 distinct IDs across VA (5), ME (5), MD (4), MS (2) — each a named daily slot |
| Midday/evening variant pairs | ~30 IDs across AR, CA, CT, DE, MA, MD, MI, NY, VA |
| Tri-State multi-jurisdiction | `1001`–`1005`, `1008` (ME) — display names carry the raw `State (US)-` prefix |
| In-state 5-digit | `629`, `630` MD Pick 5; `641`, `642` VA Pick 5; `658`, `659` DE Play 5; `612` LA Pick 5 |

### 5.3 Data-quality defects visible in the fixtures

- `605` **"Match 5 With Multiplier"** and `613` **"Cash4  Evening"** (double space), `626`
  **"Missippi Cash3 Midday"**, `627` **"Missippi Cash4 Midday"** — misspellings carried from the feed
  into display names. `516` **"Mega bucks"**. These render publicly today.
- ME display names retain the `State (US)-` source prefix: *"State (US)-Gimme 5"*,
  *"State (US)-Tri-State Megabucks Plus"* — and that prefix reaches the **meta description** of `/me`.
- The feed provides `jackpot`/`prize` inconsistently (264 `jackpot` vs 184 `prize` across 448 games),
  and only **9 of 448** games carry a `<payout>` element.
- The feed's `<payout>` content is **escaped nested XML** (`&lt;payoutInfo&gt;`). `payout-sample.json`
  correctly records that decoding is server-side only and the browser must never parse it. It also
  records a **time-zone inconsistency inside the feed**: main draw fields are EST/`America/New_York`
  while `payoutInfo` timestamps are `Z`/UTC.

### 5.4 Interaction states

| State | Fixture / type support | Component support |
|---|---|---|
| `latest` | yes | yes |
| `awaiting` | yes | yes — but without the exact next-draw date DS-14 requires |
| `closed` | yes | yes |
| **`corrected`** | **absent** | **absent** — required by PF-02 §71 and DS-14 |
| **`delayed`** | absent | absent — required by PF-02 §71 |
| **`cancelled`** | absent | absent |
| **`verified`** | absent | absent |
| **`unavailable`** | absent | absent |
| Live / drawing-soon | absent | absent (no S-04) |

`ResultCard.status` is typed `"latest" \| "awaiting" \| "closed" \| string`. The trailing `string`
defeats exhaustiveness checking, so a new status silently falls through to the "next draw" branch.

### 5.5 Reuse verdict

`DynamicResultCard`, `BallGroup` and `MultiplierBadge` are **KEEP AND RESTYLE** — the format-driven
architecture is correct and must not be rebuilt (**ruled**: `FD-S-10`). What is required is **data work
plus state modelling**, not new rendering logic:

1. Expand `result-format-definitions.json` **incrementally by verified launch-state need**
   (`FD-S-10`), with real `effectiveFrom`/`effectiveTo` ranges. Sourced, never invented —
   `CLAUDE.md` §14 is explicit that incomplete coverage is *"not a licence to hardcode."*
2. Add format classes for Daily Derby, Keno-scale draws, and the full named-special-ball set.
3. Close the status union and add `corrected`, `delayed`, `cancelled`, `verified`, `unavailable`
   (**ruled**: `FD-S-09`).
4. Model related draw variants under a shared game identity where the relationship is real, keeping
   each independently selectable and indexable (**ruled**: `FD-S-11`).

**Scope correction.** The 101 ungoverned formats are **not a Florida-preview blocker.** `FD-S-10`
requires only that *"Florida preview must support all games displayed in the Florida preview"*, and
that *"cross-State rollout must not enable a game whose format is unverified."* The gap is therefore a
**cross-State rollout gate**, not an architecture blocker.

**Florida's format must not become the generic model.** FL contributes 6 of the 13 definitions and is
the only state exercising Fireball and a `6/53+6/53` secondary draw. `FD-S-03` reinforces this:
Florida is the first validation jurisdiction, not a template.

---

## 6. Legacy State behaviour audit

Source of record: `WEB-INF/upgrade/results/lottery-result_upgrade_as_new.jsp` (2,452 lines) — the
template `struts.xml` actually routes to — plus its includes `CommonElementsUpgrade_as.jspf`,
`headerbar_upgrade_as.jspf`, `wiiningNumbersByStateSearchInput_as.jspf`,
`wiiningNumbersByState_as.jspf`, `populargames_as.jspf`, `footerbar_upgrade_as.jspf`.
`lottery-result_upgrade_as.jsp` (2,366 lines) was also read; it is structurally the same page with
`<h3>` headings, a `<table>`-based result grid, a separate H1 banner section, and
`winning-history` before `schedule`.

### 6.1 Production page composition, in order

1. `sp_toppromobar` sticky bar — **9 states only**
2. Header include
3. Top billboard ad
4. *(commented-out affiliate promo block — §6.7)*
5. Breadcrumb: `Home › {State} Winning Numbers`
6. Notice band — `noteList` with three severities: **Error** (red), **Information** (indigo),
   **Warning** (amber), each individually dismissible. **This is production's correction/alert
   channel** and maps to PF-02's correction notice and Global Shell SL-T04.
7. In-page nav (`.c-inner-nav-list`): Results · Winning History · Schedule · How to Play · How to Claim
8. `#results` — H1; an H2 marketing sentence with hardcoded absolute links to
   `lotterycorner.com/powerball` and `/mega-millions`; **state `<select>`** driven by
   `#application.statesList`; **date picker** bound to `selectedDate`; then the result cards
9. Result cards, one per game, with ads injected at indices 1, 3, 5, 7, 12
10. `#schedule` — draw-days matrix (`game.daysOff` inverted into seven day columns)
11. `#winning-history` — per-game "dates available on this site" from/to table
12. About-[State] — `stateDetails.stateText` (admin HTML), a link to the official state lottery site,
    a **Recent Blog Posts** card (`blog.recentPosts`, capped at 6), the **operator address block**
    (address, city, state, ZIP, country, phone) and a standing accuracy disclaimer
13. `#how-to-claim` — claim methods, claim forms (`howToClaim.claimForms`), notes, claim-centre carousel
14. Claim video (conditional on `howToClaim.videoUrl`)
15. Tax information — two desktop-only tables plus `taxNoteList`
16. `#how-to-play` — per-game cards: play type, jackpot vs top prize
17. Cut-Off Time — game / cut-off time / advance plays; a **mobile card list** and a **desktop table**
    as two separate DOM renderings
18. Facts of [State] — `stateFacts.stateFactsList` sliced by index (`<3`, `3–4`, `==5`) into three cards
19. FAQs — accordion with Close All / Open All, from `faqsContent.faqs`
20. Winning Numbers by State — search input + full state directory
21. Popular Games include (carries the four mobile ad slots)
22. Footer include
23. Sticky closable footer ad

### 6.2 Business rules worth preserving

| Rule | Evidence | Why it matters |
|---|---|---|
| **Per-state SEO override** | `seoMetaInfo.pageTitle`, `.metaDescription`, `.metaKeywords`, `.h1Tag`, and `seoHeadingsMap` keyed by `welcomeH2`, `easyWayToWinH4`, `winningNumberHistoryH3`, `gamesScheduleH3`, `aboutH3`, `collectLotteryH3`, `cutOffTimeH3`, `howToPlayH3`, `factsH3`, `taxRatesH3`, `FAQsH3`, `winningNumbersByStateH3` | **Every section heading is individually admin-overridable per state**, with a coded fallback. This is a real content-operations capability the new implementation has no equivalent for. |
| **Three-severity notice band** | `noteList` with `type` ∈ Error / Information / Warning, individually dismissible | Production's live correction and alert channel |
| **Draw-schedule model** | `game.daysOff` — days the game does *not* draw, inverted at render | The stored model is exclusion-based; a naive "draw days" import would invert the meaning |
| **Cut-off and advance plays** | `game.cutOffTime`, `game.advancedPlays` | Feeds PF-02's cutoff rules and S-04 |
| **Jackpot vs top prize** | `game.haveJackpot` switches the label between "Jackpot" and "Top Prize" | A real domain distinction |
| **Result-availability range** | `resultsFrom` / `resultsTill` per game | Governs which archive years exist — directly relevant to the ~8,700 yearly archive URLs |
| **Closed-draw countdown** | `nextDrawTime.contains('Closed')` gates a countdown bound to `nextDrawTimeZoned` | Production's live/cutoff behaviour |
| **Purchase gate** | `showBuy` (server-computed) selects a "Buy Tickets" + "Find More" cell, else "Find More" only | The only eligibility logic that exists. Its inputs live in `AffiliateAction` / `Affiliate.properties`, **not read by this task** |
| **Favourites hook** | `c-favorite` div with `data-id`, `data-login`, `data-active`, `data-inActive`, gated on `#session.Insider_User` | The one signed-in behaviour on the legacy state page |
| **Operator contact block** | `stateDetails.address.*`, `stateDetails.url` | Directly satisfies PF-02 §21's locator-and-contact card. The new fixtures dropped it |
| **Global state directory** | `#application.statesList` (application scope) | The authoritative state list — and the correct source for a route registry |
| **Admin HTML content** | `stateDetails.stateText`, `stateHistoryText` rendered with `escape="false"` | Long-form per-state editorial exists in production and is admin-managed |
| **Per-state GAM targeting** | `setTargeting('state', [stateCode])` | Must survive any rebuild |

### 6.3 SEO and structured data in production

- `<title>`: `seoMetaInfo.pageTitle` else `"{State} ({CODE}) Lottery Results - Latest Winning numbers | Lottery Corner"`
- `<meta name="description">`: override else a generated sentence
- **`<meta name="keywords">`** — present, obsolete, must not be reproduced
- `<link rel="canonical">`: `https://www.lotterycorner.com/{state}` (no trailing slash)
- JSON-LD: `WebSite` (`@id …/#website`), `WebPage` (`@id …/{state}/#webpage`, `isPartOf`, and a
  `relatedLink` array of every game URL), `BreadcrumbList` (`@id …/{state}/#breadcrumb`)
- Twitter: `summary` card, `@lotterycorner` site and creator, per-state image at
  `/img/social/{state-name}-Lottery.png`
- OpenGraph: `og:type=website`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`,
  `og:image:alt` — `og:type` is emitted **twice**
- `og:image:width` / `:height` are commented out

The `relatedLink` array on `WebPage` is a genuinely useful internal-link signal the new page does not
emit. The trailing-slash contradiction between `canonical` and the JSON-LD `url`/`@id` is recorded in
§3.3 R3.

### 6.4 Tracking and partner scripts

- `gpt.js` loaded async from `securepubads.g.doubleclick.net`
- `setTargeting('state', …)`, `collapseEmptyDivs()`, `enableServices()`
- Custom `IntersectionObserver` lazy-ad loader over `.lazy-ad`, **no `rootMargin`**, with a
  display-everything fallback
- AdSense `ca-pub-6009276896057794` loaded site-wide via the common include
- Font Awesome 4.7 from `cdnjs.cloudflare.com`
- **No consent gate of any kind.** Every script fires unconditionally. `CLAUDE.md` §12 requires
  consent and environment gating before any partner script activates. The new implementation's
  `PartnerScripts` env-gating is the correct model and must not regress.

### 6.5 Accessibility defects in production — do not carry forward

| Defect | Evidence |
|---|---|
| **Zoom is blocked** | `<meta name="viewport" content="… maximum-scale=1.0, user-scalable=0">`. Fails WCAG 1.4.4. The new implementation does **not** do this |
| Cut-Off Time renders twice | `d-sm-none` card list + `d-none d-sm-block` table — duplicate content for screen readers |
| Two tax tables are `d-none d-lg-table` | Tax content is **absent on mobile** |
| Winning-history table splits by breakpoint | `d-none d-lg-table-cell` vs `d-lg-none` cells |
| Result table loses its header row on mobile | `.results-table .table thead { display:none }` at ≤991 px while `td { display:block }` — data cells lose their headers |
| Close-all / open-all FAQ controls are `<a>` with no `href` | Not keyboard-focusable |
| Notice dismiss controls are bare `<i>` icons | No accessible name, not focusable |
| Heading hierarchy | `_as.jsp` jumps H1 → H2 → H3 → H3…; `_as_new.jsp` improves it but places the H1 *inside* the results section |
| `#stickyAd` at `z-index: 9999` | No focus management; can obscure focused elements (DS-15) |

### 6.6 Protected-zone violations in production

**Five ad slots render inside the results list** and **two render inside the claim journey.** Detailed
in `state-ad-inventory-reconciliation.md` §8 (findings P1 and P2). Recorded here because they are
*behaviour*, not merely inventory: the legacy page interleaves advertising with the exact content the
Constitution protects.

### 6.7 Obsolete presentation and prohibited copy — must not be carried forward

| Item | Why |
|---|---|
| **"Welcome to [State] Lottery Corner" carousel** (`_as.jsp` L814-906) | Its copy states LotteryCorner *"offers an effective solution for you to **increase your chances** of winning the perfect combination"* and that *"the Pattern Prediction of Lottery Corner… can relatively **give you an advantage** on your lottery stakes."* This violates Constitution §7 (`MUST NOT … say "increase your chances"`) and is exactly the *"legacy copy remediation"* named in open Member/Insider decision 12. **Prohibited copy — ARCHIVE, do not migrate.** |
| Commented-out affiliate bonus header (`_as_new.jsp` L283-365) | A "Michigan Lottery Promo Code" block with a star rating, copy-to-clipboard code and an outbound partner link. Inactive; its outbound destination must not be carried forward |
| `<meta name="keywords">` | Obsolete |
| Bootstrap grid classes, `mobi-ads*` / `desk-ads*` visibility hacks, inline `!important` style blocks, duplicated mobile/desktop DOM | Presentation only; `CLAUDE.md` §5 forbids copying legacy CSS/markup/class names |
| Font Awesome CDN dependency | External dependency; no icon library is approved (DS-32) |
| The `*` wildcard soft-404 route | §3.3 R9 |

---

## 7. Cross-cutting conflicts and their dispositions

Twenty contradictions were recorded by LRG-SPEC-017. LRG-DEC-018 dispositioned all twenty: **14 are
resolved by a founder ruling, by existing authority, or were documentation errors rather than source
conflicts; 6 are genuine unresolved source conflicts and are now registered** in
`03-docs/08-decisions/source-conflicts.md` as **Conflicts 13–18**.

| ID | Conflict | Sources in tension | Disposition |
|---|---|---|---|
| **C-S-01** | Ads render inside the result grid and inside claim content in production | Production revenue vs. Constitution protected zones, PF-02 §15/§21/§60 | **RESOLVED** — `FD-S-21` + `FD-S-25`: relocate to approved anchors, preserve inventory. Never an option to keep in place |
| **C-S-02** | Synthetic winners, unclaimed prizes and claim/tax facts render as clean production copy with no environment gate | Fixtures vs. `CLAUDE.md` §14, Constitution §12, PF-02 §76 | **RESOLVED** — `FD-S-01` environment gate; `FD-S-02` suppression |
| **C-S-03** | Route existence derived from a directory listing | Implementation vs. `CLAUDE.md` §10 | **RESOLVED** — `FD-S-30` route registry |
| **C-S-04** | Production emits contradictory trailing-slash signals between `canonical` and JSON-LD | Production internal inconsistency | **REGISTERED — Conflict 13.** `FD-S-32` defers the convention; the contradiction itself remains unresolved |
| **C-S-05** | Legacy section fragments vs. PF-02 §64A mandated fragments — zero overlap | Legacy vs. PF-02 §64A | **RESOLVED** — `FD-S-33` |
| **C-S-06** | `/buynow/{code}` vs approved `/play/{game}` | Implementation vs. BP-04 index §4 | **REGISTERED — Conflict 14.** `FD-S-20` / `FD-S-32` keep it open by design |
| **C-S-07** | "Buy Tickets" shown with no eligibility confirmation and no adjacent disclosure | Implementation vs. PF-02 §20/§61, `CLAUDE.md` §13 | **RESOLVED** — `FD-S-18` default label, `FD-S-19` adjacent disclosure |
| **C-S-08** | Design-system decisions applied only inside `[data-lc-preview]` | Implementation vs. DS-DEC-001 (Tier 1) | **RESOLVED** — `FD-S-12` incremental shared-layer extraction |
| **C-S-09** | 992 px (GAM, DS-20) vs 1024 px (Tailwind `lg`) on the State page | Implementation vs. DS-20 | **RESOLVED** — `FD-S-24`; ad-operations validation is a dependency, not a conflict |
| **C-S-10** | `collapseEmptyDivs()` vs `collapseIfEmpty: false` vs DS-24 | Legacy vs. recorded data vs. DS-24 | **REGISTERED — Conflict 15.** Three-way; DS-36 gives ad operations the final word → `OPEN-ST-04` |
| **C-S-11** | `ad-slot-definitions.json` cites a template production does not use | Recorded provenance vs. `struts.xml` | **REGISTERED — Conflict 16** (with C-S-12) |
| **C-S-12** | Wyoming slots recorded as state-page inventory with no source evidence | Recorded data vs. legacy source | **REGISTERED — Conflict 16.** `FD-S-27` excludes them from the preview baseline and retains the evidence |
| **C-S-13** | `atv_video_player` retired on Home, rendered on State | LRG-ADS-015 (Home-scoped) vs. State production | **REGISTERED — Conflict 17.** `FD-S-26` defers; disabled in the preview, **not** assumed retired |
| **C-S-14** | Legacy "increase your chances" copy still in the production template | Legacy vs. Constitution §7; open Insider decision 12 | **REGISTERED — Conflict 18.** Prohibited copy live in production; remediation is unapproved |
| **C-S-15** | 101 of 112 referenced games have no format definition | Fixtures vs. `CLAUDE.md` §14 | **RESOLVED** — `FD-S-10` incremental expansion; a rollout gate, not a preview blocker |
| **C-S-16** | 33 feed jurisdictions and 5 no-lottery jurisdictions have no route | Feed/legacy vs. implementation | **RESOLVED** — `FD-S-30` registry, `FD-S-31` ST-06 |
| **C-S-17** | Signed-in State sequence blocked by 11 open Member/Insider decisions | PF-02 Part VII vs. `source-conflicts.md` Conflict 3 | **ALREADY REGISTERED** — Conflict 3. Not duplicated; cross-referenced from Conflict 18 |
| **C-S-18** | `03-docs/18` asserts SearchAction is emitted; the code removed it | Stale documentation vs. code | **NOT A SOURCE CONFLICT** — a stale Tier-7 document. Correction item (`E-04`), outside this task's write scope |
| **C-S-19** | Reuse register says "15 slots" per state fixture; verified count is 14 | Documentation vs. data | **NOT A SOURCE CONFLICT** — arithmetic error in a Tier-5 record. Correction item (`E-04`) |
| **C-S-20** | No test framework exists; no State ad-inventory guard exists | Implementation vs. `CLAUDE.md` §12 revenue-protection intent | **RESOLVED** — `FD-S-35` tests before rollout; `FD-S-22` build-time ad guard |

**Nothing was silently reconciled.** Fourteen items were closed by an explicit ruling or reclassified
with a stated reason; six survived as genuine source conflicts and are registered. Per `CLAUDE.md` §2,
that registration is where unresolved conflicts belong.
