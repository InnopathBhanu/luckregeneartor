# State Page Founder Decisions

**Document type:** Approved decision record — State page family (PF-02 / BP-03)
**Decision ID:** `ST-DEC-001`
**Recorded by:** Task **LRG-DEC-018**
**Decision date:** July 27, 2026
**Status:** **APPROVED — founder decisions (Authority Tier 1)**
**Decided against:** the four LRG-SPEC-017 State documents (commit `87e91b4`)

**Authority note.** These are explicit founder decisions and therefore sit at **Tier 1** of the
authority hierarchy in root `CLAUDE.md` §2 — above the frozen Constitution's silence on
implementation choices and above anything recorded in the previous implementation. Where a ruling
here restates an existing requirement, it is binding **because of that requirement**, not because
this record repeats it; those entries are marked *(restates existing authority)*.

**Recording discipline.** The 36 rulings are recorded **as supplied**, without reinterpretation or
expansion. Each carries a concise implementation consequence — enough to make the ruling executable,
and no code-level design beyond that.

**Companion documents**

- `03-docs/04-page-specifications/state/state-page-founder-review.md` — reclassification of every prior entry, plus the reduced open-decision list
- `03-docs/04-page-specifications/state/state-page-source-and-current-implementation-audit.md`
- `03-docs/04-page-specifications/state/state-page-section-and-view-model-specification.md`
- `03-docs/05-advertising/state-ad-inventory-reconciliation.md` — the measured ad audit
- `03-docs/05-advertising/state-ad-anchor-distribution-proposal.md` — **the `OPEN-ST-01` distribution proposal and the six advertising approvals `APP-ST-01` … `APP-ST-06` (LRG-ADS-019)**
- `03-docs/08-decisions/design-system-founder-decisions.md` (DS-DEC-001) — the design-system rulings these build on
- `03-docs/08-decisions/source-conflicts.md` — the conflicts that survive these rulings

---

## 1. Scope and authority

**In scope.** The State page family (PF-02 / BP-03): composition, section order, result presentation,
State data governance, State advertising reconciliation, State AI placement, State commerce framing,
State routes, and the scope of the first State implementation.

**Not in scope.** The Home page (locked at `482cd39`). The Global Shell blueprint. The design system
itself (governed by DS-DEC-001, unmodified here). Member/Insider entitlement (11 decisions remain open
globally — `source-conflicts.md` Conflict 3). Game, archive, news, community and tools page families.

**Binding sources these rulings sit on top of, not instead of:** Product Constitution v2.1 (frozen);
Experience Architecture v1.1; State Page Blueprint PF-02 v1.1 (final approved and frozen);
Global Shell v1.1; DS-DEC-001.

**Status vocabulary**

| Status | Meaning |
|---|---|
| **APPROVED** | Adopt as specified. Implementable now within its phase. |
| **APPROVED DIRECTION** | The direction is settled; the specific instance list is completed by the named owner. |
| **APPROVED IN PRINCIPLE** | Adopt the concept; the artefact is produced and reviewed before use. |
| **APPROVED SUBJECT TO AD-OPERATIONS VALIDATION** | Approved as a frontend decision; ad operations must confirm before production. |
| **APPROVED RULE / REQUIREMENT** | A standing rule. No per-instance founder decision is required. |
| **DECIDED BY AUTHORITY** | Not an open option. Already settled by the Constitution or PF-02; recorded here to stop it being re-litigated. |
| **DEFERRED** | Deliberately postponed. Must not be implemented or inferred. |

---

## 2. The rulings

### A. Safety, source and content

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-01** | **Synthetic publication gate.** Any governed fact with synthetic or illustrative origin must be prevented from rendering as public fact outside an explicitly labelled internal preview environment. A visible "synthetic" label on a production page is **not** an acceptable substitute. Applies especially to winners, unclaimed prizes, claim deadlines, claim thresholds, tax rates, anonymity rules, retailer locations and purchase eligibility. | **APPROVED** | The view model carries an `origin` marker on governed facts; a single environment-level gate suppresses `synthetic` origins outside the guarded preview. The gate is **enforcement, not annotation** — a synthetic fact reaching a public page is a build/runtime failure, not a labelling problem. Fixture `_meta.illustrative` becomes machine-read rather than decorative. Closes the highest-severity audit finding. |
| **FD-S-02** | **Unsourced conditional sections.** Suppress S-11 Scratchers (where no sustainable snapshot exists), S-12 Winners and Unclaimed Prizes, S-13 Impact / Fund Allocation, and any claim, tax or anonymity fact that cannot be officially sourced — until a sustainable source, owner, verification date and review cadence exist. Required section shells must not display fabricated substitute content. Where PF-02 requires a required section, show a concise "currently unavailable" state or an authoritative outbound source **only when the blueprint permits it**. | **APPROVED** | S-11, S-12 and S-13 are suppressed in the first preview, each with a recorded `suppressionReason` (PF-02 §1 principle 11 already requires the reason). S-08 and S-08A render only officially sourced facts; unsourceable facts render **"Currently unavailable"** per PF-02 §64B and §21A, never generic state-name substitution. No empty visual shells (PF-02 §12). |
| **FD-S-03** | **State Content Manifest.** Create it as a separate governed content contract. It must **not** be designed as a database schema, API payload or fixture format in this phase. Florida is the first validation jurisdiction, **not** a hardcoded template. | **APPROVED IN PRINCIPLE** | A manifest document is authored against PF-02 §56A's field list and reviewed before it drives rendering. It is a *content* contract: storage form stays open (PF-02 §56A explicitly permits DB, XML, JSON, CMS or API). Florida is populated first to validate the field set; no Florida value may become a default for another jurisdiction. `02-new-api` stays untouched. |

### B. Composition and interaction

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-04** | **PF-02 section order.** Use the exact PF-02 section IDs and default ordering. The render sequence must support the five PF-02 Adaptive Priority overrides. **Do not create a generic page-builder framework** — a typed State-specific section manifest and resolver are sufficient. | **APPROVED** | Section order moves out of hardcoded JSX into a typed State section manifest plus a resolver that applies the five §12.1 overrides (possible win/claim · material correction · live or pending draw · safety · source outage). Scope is deliberately narrow: one State manifest and one State resolver, not a cross-family abstraction. |
| **FD-S-05** | **Existing orphan modules.** Map existing modules only where they naturally satisfy a governed PF-02 section: `quickFacts`→S-08A · `jackpotTracker`→S-10 · `highlightsGrid`→S-09 · `gameComparison`→S-06 *after neutral reframing* · `winnerLocation`→S-12 *suppressed until sourced* · `numberTrends`→S-10 · `secondChance`→S-06 or S-10 depending on whether it describes an active game offering or a tool/history destination. **Do not preserve a module merely to avoid deleting it.** | **APPROVED DIRECTION** | The seven orphan modules gain governed homes. `winnerLocation` inherits FD-S-02's suppression. `secondChance` is classified per state at fixture-transformation time, not by a blanket rule. Any module that survives neither mapping nor a genuine need is dropped rather than parked. |
| **FD-S-06** | **Neutral game comparison.** Retain a State game-comparison capability only with PF-02-compliant neutral framing. Use `Compare [State] Lottery Games`. Do not use "Which game should you play?", "best game", "best odds to play", "increase your chances", or language implying one game is financially preferable. | **APPROVED** | The existing `#game-comparison` module is reframed to the approved heading and restricted to PF-02 §19's neutral column set (ticket price · draw frequency · game format · jackpot or top-prize structure · **published** odds · purchase channel · schedule). Odds are published values only, never computed or estimated. |
| **FD-S-07** | **Legacy notice and correction surface.** Carry forward the useful three-severity legacy notice capability as the governed State notice and correction surface. It must support information, warning, correction/error, what changed, when it changed, impact, and accessible dismissal where dismissal is appropriate. Material corrections must participate in Adaptive Priority. | **APPROVED** | The legacy `noteList` capability becomes a governed section aligned to Global Shell SL-T04 and DS-29 (correction states what changed, when, and the impact). A **material correction** raises Adaptive Priority trigger 2, placing the notice and the corrected fact before all continuation modules. Dismissal must be keyboard-accessible — the legacy bare-`<i>` dismiss control is not carried forward. |
| **FD-S-08** | **Non-functional controls.** Do not render controls as disabled product promises. Until functionality exists: hide the control, or replace it with clearly labelled informational text when the missing capability must be disclosed. **No separate founder decision is required for each disabled control.** | **APPROVED RULE** | Restates and sharpens DS-17. Applies to all **7 control groups / 14 disabled controls** on the State path: shell state selector (desktop + mobile), mobile-nav auth buttons, `AccountHooks` login/register/favourite, AI teaser CTA, check-ticket inputs and submit, footer newsletter, footer privacy manager. Each is hidden or replaced with informational text at implementation time — not escalated. |

### C. Results and formats

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-09** | **Result status model.** Use a closed, exhaustive result-status model supporting at least: verified · pending · awaiting · delayed · cancelled · corrected · closed · unavailable. **Do not widen the union with arbitrary strings.** | **APPROVED** | `ResultCard.status` loses its `\| string` widening, restoring exhaustiveness checking. `corrected` and `delayed` — both absent today and both required by PF-02 §71 — are added. `awaiting` gains the exact next-draw date DS-14 requires. |
| **FD-S-10** | **Result formats.** Keep the current data-driven result-format model. Expand format definitions **incrementally by verified launch-state need**. Do not delay the complete State Page architecture until all missing fixture-referenced game definitions are filled. **Florida preview must support all games displayed in the Florida preview. Cross-State rollout must not enable a game whose format is unverified.** | **APPROVED DIRECTION** | `DynamicResultCard` / `BallGroup` / `MultiplierBadge` are kept and restyled — the format-driven architecture is correct. Format expansion becomes gated content work: **Florida's displayed games must be governed before the Florida preview**; a game with an unverified format is not enabled for another state. The 101 undefined referenced formats therefore stop being a Florida-preview blocker and become a cross-State rollout gate. |
| **FD-S-11** | **Midday/evening and related variants.** Model related draw variants under a shared game identity when this reflects the real game relationship, while preserving each independently selectable and indexable result where required. **Do not force unrelated games into a shared identity.** | **APPROVED** | Game identity gains an optional variant relationship, satisfying PF-02 §15's *"do not mix variants ambiguously"* and §19's variant grouping. Each variant keeps its own selectable, indexable result — protecting the existing per-variant archive URLs. Relationship is asserted from evidence per game, never inferred from a name pattern. |

### D. Design system and accessibility

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-12** | **Shared design-system layer.** The approved design-system tokens and accessibility rules must apply across page families and must not remain scoped only to the Home preview. Implementation must **avoid a risky one-shot CSS rewrite** — extract and apply shared tokens/utilities incrementally, preserving the locked Home appearance. | **APPROVED** | The DS token and utility layer currently confined to `[data-lc-preview]` is extracted incrementally into a shared layer the State page consumes. **The locked Home appearance must not change** — extraction is refactoring, not restyling, and any Home visual delta is a defect. This single change is what makes DS-02/03/04/09/10/11/14/15/16/29 and the 992 px threshold reachable on State. |
| **FD-S-13** | **Accessibility requirements.** The following are **binding implementation requirements, not open founder decisions**: visible focus · reduced motion · forced-colour support · skip link · table captions or equivalent accessible names · header scope · contained horizontal table overflow · accessible live status · logical headings · text and accessible names for special balls · non-colour distinction · 200 % zoom · 16 px minimum mobile body copy · sticky layers that do not obscure focus. **Remove these from the founder-decision count.** | **APPROVED REQUIREMENT** | Fourteen items move from "decisions" to the implementation checklist and the Phase 7 review gate. They are verified, not debated. Zoom must never be blocked — the legacy `user-scalable=0` must not be reintroduced. |
| **FD-S-14** | **Special-ball treatment.** Special balls and special groups must use three simultaneous distinctions: visible text or abbreviation; non-colour visual distinction such as border, shape or pattern; accessible name. **No final visual token is approved in this task** — that remains part of the State visual review. | **APPROVED** | Restates DS-11 and binds it to State result rendering. `BallGroup` gains a required `accessibleName` and a non-colour distinction; the specific border/shape/pattern values are proposed in the preview and settled at the State visual review (FD-S-13's gate, not a separate decision). |
| **FD-S-15** | **Dark mode.** Do not implement or present dark mode as approved. Existing dark-theme CSS may remain **only** when it is inert and clearly identified as unapproved reference code. Remove it later only if doing so is proven safe. | **APPROVED** | Restates DS-30. The `:root[data-theme="dark"]` block stays, annotated as unapproved reference; it must remain unreachable in normal rendering. No dark values are approved, and its incompleteness (unoverridden accent and ball tokens) must not be read as a defect to fix. |

### E. AI

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-16** | **Initial State AI scope.** The first State implementation must include: (1) S-03 State AI Brief; (2) S-01 Ask State AI entry; (3) result explanation at S-02 when grounded; (4) game-rule and schedule explanation; (5) claim-step explanation **only from official sourced information**. Defer the remaining placements until their underlying sections and governed data exist. **Do not create 18 separate AI widgets or force an AI element into every visible section.** The Section Intelligence Matrix may specify "none", "deferred" or "shared entry" where appropriate, provided it stays consistent with PF-02 and Global Shell. | **APPROVED PHASED SCOPE** | The 18-placement map becomes **5 launch placements + 13 deferred**, each deferral recorded against the section or data it waits on. This satisfies Global Shell §10.5 (a single page-level module is insufficient) without inventing surfaces for sections that do not exist. Item 5 is additionally gated by FD-S-02: no claim-step explanation until the claim facts are officially sourced. |
| **FD-S-17** | **AI authority boundaries.** Binding, not open. AI may **not** determine: official winning numbers · corrections · ticket-match results · eligibility · claim outcome · tax advice · purchase availability · affiliate recommendation. **Deterministic systems must perform ticket comparison and eligibility evaluation.** | **DECIDED BY AUTHORITY** | Restates the Constitution and PF-02 §69. Adds an explicit consequence the prior specification left implicit: **ticket comparison and eligibility evaluation are deterministic components**; AI may explain their output but never produce it. |

### F. Commerce

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-18** | **SUPERSEDED IN PART by `FD-N-03`/`FD-N-10` v1.1 (LRG-DEC-028): the primary State-page CTA is now `Buy Now`, entering a first-party purchase-options resolver; `Where to Play` survives as a resolver OUTCOME or supporting link, not the default button label. The eligibility requirement below is RETAINED IN FULL — a transactional option may still only be offered on confirmed State, game, provider, age, location and freshness eligibility, and never from fixture configuration or State-page context alone.** Original ruling: **Default commerce label.** Until confirmed State, game, provider, age, location and freshness eligibility exists, the default action is **`Where to Play`**. Do not show `Buy Tickets` or `Play Online` based only on fixture configuration or State-page context. | **APPROVED** | The current unconditional "Buy Tickets" label is replaced by "Where to Play" as the default. `Buy Tickets` / `Play Online` become derived labels requiring all six eligibility conditions — matching PF-02 §20's action-label contract, which was already binding. |
| **FD-S-19** | **Affiliate disclosure.** Every compensated recommendation or affiliate option must have conspicuous **adjacent** disclosure before the user acts. A generic footer or trust-page disclosure is insufficient. | **APPROVED** | Restates `CLAUDE.md` §13 and PF-02 §61, and closes the audit finding that the only disclosure-like text sits far below the CTAs. Disclosure renders adjacent to the action, before the click. |
| **FD-S-20** | **SUPERSEDED IN PART by `FD-N-03`/`FD-N-10` v1.1 (LRG-DEC-028): the State experience is no longer informational-only — `Buy Now` and its governed resolver are approved as a first-class journey. RETAINED: the `/play/{game}` vs `/buynow/{code}` production-route decision **remains open**, no external destination may be configured without approval, and S-07 content still renders only where genuinely sourced (`FD-S-02`).** Original ruling: **Commerce activation.** Do not activate commerce during the initial State Page preview. The `/play/{game}` versus `/buynow/{code}` production-route decision **remains open** for the later URL and migration review. The preview may show a non-transactional `Where to Play` information entry only when its data is verified. | **DEFERRED** | No resolver behaviour changes; no external destination is configured; no route is switched. S-07 appears in the preview only as verified, non-transactional information — and only where that information is genuinely sourced (FD-S-02). |

### G. Advertising

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-21** | **Protected zones.** Ads must not render inside result cards or the result-verification grid · between ticket-check input and output · inside AI answers · inside correction notices · inside claim, tax or anonymity content · inside responsible-play guidance. **This is not an open option between "production parity" and "architecture."** Production slots currently violating protected zones must be **relocated** to approved anchors while preserving inventory, unless a separate retirement decision is taken. | **DECIDED BY AUTHORITY** | The five slots legacy renders inside the results list and the two inside the claim journey are **relocated, not retired and not preserved in place**. Inventory count is preserved; position changes. Every document that previously framed this as a choice is corrected. |
| **FD-S-22** | **State ad baseline.** Preserve the legacy production State inventory as the reconciliation baseline, subject to: protected-zone relocation · removal of duplicate DOM rendering · explicit treatment of defined-but-never-rendered slots · State-specific and no-lottery rules · ad-operations validation · a build-time State ad baseline guard. **Do not reduce or add inventory silently.** | **APPROVED** | The baseline is the **24 defined State slots (23 rendered + 1 defined-not-rendered)**, not the 14 the current fixtures map. Every slot must reach a recorded disposition: active placement, or explicitly disabled with a reason. A build-time guard fails the build if the approved count changes — the State equivalent of the Home guard. |
| **FD-S-23** | **Duplicate and unreachable placements.** A single GAM div ID must never render twice. `sp_mid_leaderboard_pos4` and `sp_mobile_leaderboard_pos4` must each receive **at most one** valid mapped placement, or be explicitly disabled pending ad-operations confirmation. **Do not preserve broken or unreachable placement merely for literal DOM parity.** | **APPROVED DIRECTION** | The legacy duplicate render of `sp_mid_leaderboard_pos4` is not reproduced. Both `pos4` slots — unreachable today because the result-group index never reaches a fourth group — get one real anchor position or an explicit disabled record. Neither may remain silently mapped-but-unrendered. |
| **FD-S-24** | **992 px threshold.** Use one 992 px threshold for State layout and ad-tier switching. **There must be no 992–1023 px inventory gap.** Do not change GAM size mappings. | **APPROVED SUBJECT TO AD-OPERATIONS VALIDATION** | Extends DS-20 to State. The rail's Tailwind `lg` (1024 px) gate and the 992 px mobile-only rule are unified at 992 px, closing the band where three rail slots and three mobile slots were simultaneously hidden. **No GAM path, div id, size or size mapping changes.** Ad operations validates before production. |
| **FD-S-25** | **Claim-zone and result-grid inventory.** Relocate affected slots to the nearest permitted PF-02 ad anchor. **Do not retire them merely because their legacy placement is prohibited.** The exact anchor-to-slot distribution remains an ad-operations and founder review deliverable. | **APPROVED DIRECTION** | Combines with FD-S-21: relocation is mandatory, retirement is not implied. The specific anchor each slot lands on is the one genuinely open advertising question (see §3, `OPEN-ST-01`). |
| **FD-S-26** | **State video slot.** `atv_video_player` was retired **only for Home**. Do not assume the State unit is retired. Keep it disabled in the State preview until State-specific ad-operations confirmation. | **DEFERRED** | The slot is recorded as **disabled pending State ad-operations confirmation** — explicitly not retired, and explicitly not active. The Home retirement decision (LRG-ADS-015 §2) does not extend to State. |
| **FD-S-27** | **Wyoming slots.** Do not include the two Wyoming record-only slots in the active State preview baseline until ad operations confirms that the GAM units exist, their div IDs and their mappings. **Keep the evidence record.** | **DEFERRED TO AD OPERATIONS** | Both stay out of the active baseline and out of the preview. The audit evidence — zero `defineSlot` calls, zero renders, two HTML comments on an Insider page — is retained rather than resolved. They are not dropped from the inventory record. |
| **FD-S-28** | **Rail model.** Use a State-specific contextual rail aligned with governed section boundaries. **Do not copy the Home rail composition mechanically.** Rail advertisements may remain sticky **only where they cannot travel across protected claim, result, correction or responsible-play content.** | **APPROVED DIRECTION** | The rail is designed against State section boundaries, not Home's. Stickiness becomes conditional: a sticky rail slot that would scroll alongside claim, result, correction or responsible-play content must be pinned within its own section or made non-sticky. This is the mechanism by which FD-S-21 survives scrolling. |
| **FD-S-29** | **Sticky conflict.** Implement the Global Shell priority: (1) safety/system, (2) bottom navigation, (3) user-requested action, (4) advertising. A sticky ad and a sticky purchase action must not compete. **State preview should not introduce a sticky purchase action.** | **APPROVED** | Restates Global Shell §6.4 and DS-28. Page clearance is **derived** from reserved sticky height + bottom-nav height + spacing + safe-area inset, replacing the hardcoded `pb-28`. Because the preview introduces no sticky purchase action, only two layers can compete — which keeps the first implementation simple without deferring the rule. |

### H. Routes and SEO

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-30** | **State route registry.** Replace fixture-derived route existence with an explicit jurisdiction registry distinguishing: active lottery jurisdictions · no-active-lottery jurisdictions · territories · non-page pseudo-jurisdictions such as `USX` · unsupported/invalid routes. **Do not create `/usx`.** | **APPROVED** | The `readdirSync` param source is removed, closing the `CLAUDE.md` §10 violation. The registry is the single source of State route existence and the backing data for the sitemap. `USX` is classified as a non-page pseudo-jurisdiction: it appears in the results feed and must **never** become a route. Routes stay statically enumerable for SSG. |
| **FD-S-31** | **No-lottery jurisdictions.** Preserve `/al`, `/ak`, `/hi`, `/ut` and `/nv` with the PF-02 ST-06 experience rather than returning 404. **Do not show result, claim, tax or commerce modules that imply an active State lottery.** | **APPROVED** | Five URLs production serves stop 404-ing. The ST-06 experience per PF-02 §72: jurisdiction status with source and effective date · relevant local news/history · nearby-state information only where useful and legal · national-game availability only if genuinely applicable · community · responsible-play resources. Suppressed: result grid, Buy Online, claim/tax modules, empty scratcher/game shells. |
| **FD-S-32** | **Canonical and redirect decisions.** Deferred to the dedicated SEO/infrastructure review. **Do not emit a new canonical convention, host migration, trailing-slash migration or redirect plan during State preview implementation.** Preserve the issue record for `www` vs non-`www` · trailing slash · Apache/Cloudflare redirects · date routes · `/fl-new` · `/play` vs `/buynow`. | **DEFERRED** | The preview emits no new canonical and no redirect. Six issues stay recorded, not resolved. Consequence for scope: **canonical migration does not block a guarded preview route** — it blocks production route cutover only. |
| **FD-S-33** | **Section fragments.** Use the PF-02 fragment IDs as primary IDs. Where a legacy fragment has a **demonstrated** live inbound-link or analytics dependency, preserve compatibility with a secondary alias target **without creating duplicate visible sections**. | **APPROVED** | PF-02 §64A's eleven fragments become the primary anchors. Legacy fragments (`#results`, `#winning-history`, `#schedule`, `#how-to-play`, `#how-to-claim`) are preserved only as alias targets, and only where a dependency is demonstrated by evidence — not preserved by default. No section is duplicated to serve an alias. |
| **FD-S-34** | **Sitemap, robots and schema.** These are **implementation/SEO work items, not separate founder product decisions**. They remain blocked only by the canonical-host and migration decisions where technically necessary. `/buynow/` must remain non-indexable. Schema must describe visible content and must distinguish LotteryCorner from the official State lottery operator. | **APPROVED REQUIREMENT** | Sitemap, `robots.txt` and the schema upgrade move from decisions to execution. Two constraints are absolute regardless of the canonical decision: `/buynow/` stays non-indexable (it is currently crawlable, since no `robots.txt` exists), and the schema must model the State lottery operator as an organisation **distinct** from LotteryCorner — PF-02 §64 already prohibits marking LotteryCorner as the operator. |

### I. Engineering

| ID | Ruling | Status | Implementation consequence |
|---|---|---|---|
| **FD-S-35** | **Testing.** Introduce automated tests **before cross-State rollout**. Framework selection is an engineering decision and does not require founder approval. Minimum coverage: route-registry enumeration · game-local date handling · result-format rendering · synthetic publication gate · section-order/adaptive-priority resolver · State ad baseline · protected-zone ad constraints. **Do not create a broad test-platform project beyond what this implementation needs.** | **APPROVED REQUIREMENT** | Seven named test areas, scoped to this implementation. The gate is **cross-State rollout**, not the Florida preview — so tests do not block the first preview, but the guarded preview cannot become a rollout without them. The protected-zone constraint test is what makes FD-S-21 durable rather than a one-time fix. |
| **FD-S-36** | **Implementation scope.** The next implementation phase must be a **guarded Florida anonymous preview only**. It must not include: signed-in or Insider State variants · production route migration · commerce activation · live partner scripts · fabricated community activity · complete 49-jurisdiction content authoring. | **APPROVED** | Defines the boundary of the next task. Six exclusions, each matching an existing block or ruling: signed-in (Conflict 3) · routes (FD-S-32) · commerce (FD-S-20) · partner scripts (DS-22/DS-25, no consent layer) · fabricated community (Constitution) · full jurisdiction content (FD-S-10, FD-S-03). This is what makes the majority of previously-listed "blockers" non-blocking for the preview. |

### J. State advertising distribution — `APP-ST-01` … `APP-ST-06`

Decided by task **LRG-ADS-020**, July 28, 2026, against
`03-docs/05-advertising/state-ad-anchor-distribution-proposal.md`. **These close `OPEN-ST-01`.** They
are advertising *approvals*, not new `FD-S-*` rulings — every one sits inside `FD-S-21` … `FD-S-29`.

> **Narrowly superseded by `FD-X-04` (LRG-DEC-024).** `AD-S00` **must not reserve or display advertising
> below 992 px during the State preview**, because `FD-X-03` requires the first verified result to precede
> every advertising reservation on mobile. `AD-S00` remains **active at desktop ≥ 992 px**; the slot is not
> relocated, no replacement mobile slot is introduced, and the approved profile count is unchanged — a
> viewport-scoped inactive state is not an inventory reduction. `FD-S-24` is unaffected (the 992–1023 px band
> keeps full occupancy). Recorded in full in
> `state-page-cross-state-experience-decisions.md` §4.1 and `05-advertising/state-ad-anchor-distribution-proposal.md`
> §3.1.1. **`APP-ST-01` … `APP-ST-06` are otherwise intact.**

| ID | Approval | Status | Implementation consequence |
|---|---|---|---|
| **APP-ST-01** | Florida preview distribution | **APPROVED WITH HOST-ELIGIBILITY CORRECTION** | The PF-02 anchor model and Option A direction are approved. **A contextual-rail or mobile-inline advertisement may render beside a governed section only when that section contains substantive real content appropriate to the page. A required empty-state shell does not automatically qualify as an advertising host.** The **Minimum Florida profile — 10 active / 14 deferred — is the implementation baseline.** |
| **APP-ST-02** | Option A over Option B | **APPROVED** | Use Option A. Do not convert responsive slots to desktop-only merely to increase the unique active-slot count, and **do not reduce an existing responsive slot to one tier without ad-operations approval.** |
| **APP-ST-03** | Duplicate and unreachable placements | **APPROVED** | `sp_mid_leaderboard_pos4` may receive **at most one** valid placement and **must never use a duplicate div ID**. `sp_mobile_leaderboard_pos4` stays deferred until a valid governed mobile boundary exists. `sp_side_halfpage_pos1` stays inactive until ad operations confirms whether the defined-but-never-rendered unit should be activated. |
| **APP-ST-04** | Contextual rail | **APPROVED WITH CONTENT-HOST RULE** | State-specific, section-bounded rail. **Approved initial:** `sp_side_mpu_pos4` @ S-06 · `sp_side_mpu_pos2` @ S-10 · `sp_side_skyscraper_pos2` @ S-18. **Conditional:** `sp_side_skyscraper_pos3` @ S-14 and `sp_side_mpu_pos3` @ S-15, each only on substantive real content. A cold-start Community shell, a "no discussions yet" state, an unavailable state or an empty News hub **must not exist primarily to host advertising**. If the condition fails the slot **remains deferred and is not moved to another section.** |
| **APP-ST-05** | Mobile and sticky | **APPROVED WITH THE SAME CONTENT-HOST RULE** | `sp_mobile_leaderboard_pos1` is the mobile alternative at AD-S02. `sp_mobile_leaderboard_pos2` after S-14 and `sp_mobile_leaderboard_pos3` after S-15 **only** on substantive real content. `sp_mobile_leaderboard_pos4` stays deferred. `sp_bottom_large_leaderboard` remains the closable sticky-footer candidate. Sticky priority and derived clearance follow `FD-S-29`. **No sticky purchase action in the Florida preview.** |
| **APP-ST-06** | Proceed conditionally | **APPROVED** | The guarded anonymous Florida State preview **may begin.** Inactive pending ad-operations confirmation: `atv_video_player` · `sp_side_halfpage_pos1` · the Wyoming record-only units · the top promo bar outside its proven State gate · **any slot whose active line-item status is unknown**. **No live GAM or partner script may activate in the guarded preview.** |

#### J.1 "Substantive real content" — the narrow definition

**S-14 Community qualifies** on at least one genuine human-authored discussion, genuine State question,
real approved community collection, or other PF-02-approved human/community object. **A fabricated
discussion is prohibited.** A generic cold-start message alone does **not** qualify.

**S-15 News qualifies** on at least one published State news article, real blog entry, maintained State
guide, or other approved editorial object **with a real destination**. A generic "news coming soon"
shell does **not** qualify.

Eligibility is evaluated **per render, not latched**: a section that loses its substantive content
returns to the Minimum profile for that host.

#### J.2 Profile accounting — the two populations are never combined

**Population A — production-template-defined slots: 24.**

| Profile | Trigger | Active | Deferred |
|---|---|---:|---:|
| **Minimum** *(implementation baseline)* | default | **10** | **14** |
| Expanded — S-14 | S-14 qualifies | 12 | 12 |
| Expanded — S-15 | S-15 qualifies | 12 | 12 |
| Fully expanded | both qualify | 14 | 10 |

**Population B — record-only units outside that baseline: 2** (`wy_on_results_table_pos1`, `_pos2`).
They have zero `defineSlot` calls and zero renders in the legacy tree, and are **never added to a
template-defined subtotal**. The expanded profiles are **conditional, never guaranteed.**

---

---

## 3. Not yet decided

**`OPEN-ST-01` is closed** (LRG-ADS-020). **Seven** remain genuinely open at founder level, and **none
blocks the guarded anonymous Florida State preview.** Everything else is either ruled above, already
governed by higher authority, or execution work owned by a named function.

| ID | Open question | Owner needed first | Why the rulings above do not settle it |
|---|---|---|---|
| ~~**OPEN-ST-01**~~ | ✅ **CLOSED** by LRG-ADS-020 — see §2.J `APP-ST-01` … `APP-ST-06`. The **Minimum Florida profile (10 active / 14 deferred)** is the implementation baseline; four slots are conditional on host eligibility. | — *(decided)* | Closed. |
| **OPEN-ST-02** | **State-specific ad units after evidence:** the two Wyoming record-only slots (do the GAM units exist and deliver?) and the State `atv_video_player` (retire as Home did, or keep?). | **Ad operations** | FD-S-26 and FD-S-27 defer both deliberately. Only ad operations can confirm live delivery; no source evidence exists in the repository. |
| **OPEN-ST-03** | The `sp_toppromobar` **9-state gate** (`ny tx oh ma va pa mi mn or`) — retain, extend, or retire the sticky top promo bar. **`fl` is not in the gate**, so this is a **cross-State rollout item only** — excluding the slot from the Florida preview is exact legacy parity. | **Ad operations** + founder | An undocumented production conditional interacting with the Global Shell header. Not covered by any ruling. |
| **OPEN-ST-04** | **No-fill behaviour**, where legacy `collapseEmptyDivs()`, the recorded `collapseIfEmpty: false`, and DS-24 specify three different things — and DS-36 says ad operations prevail if they differ. | **Ad operations** | Three-way conflict between production behaviour, recorded data and a Tier-1 decision. Registered as a source conflict. |
| **OPEN-ST-05** | **Canonical and URL migration choices:** `www` vs non-`www` · trailing slash · date-route form · `/fl-new` disposition · `/play/{game}` vs `/buynow/{code}` · the Apache/Cloudflare redirect audit. | **SEO + infrastructure**, then founder | FD-S-32 defers the whole set by design. Blocks production route cutover only. |
| **OPEN-ST-06** | **Final State visual approval**, desktop and mobile (DS-37), including the specific special-ball border/shape/pattern tokens and the items DS-DEC-001 §8 left open (container width, density, weight policy). **Expressed at cross-State scope as `OPEN-SX-01` … `OPEN-SX-06`** in `state-page-cross-state-experience-decisions.md` §5 — the same gate, not additional decisions. The **44×44 target question is now settled** by `FD-X-12`: it applies to interactive controls, and non-interactive number balls may be smaller if readable, distinguishable, accessible, stable at 200% zoom and non-overlapping at 320 px. | Founder | Global Shell §0.1 makes per-family visual approval mandatory; shell approval is explicitly not styling approval. FD-S-14 defers the token values here on purpose. |


### OPEN-ST-06 / DS-37 — CLOSED for the guarded Florida anonymous State template

**Closed by LRG-SHELL-045**, on founder approval of the Florida State visual structure and content direction.

**Evidence.** Approved integrated composition: `fa71300` (*feat: integrate approved florida lower experience*).
Footer and trust layer: the LRG-SHELL-045 commit. Non-regression proof accompanying that commit shows the
Florida content **above the footer is byte-identical** — zero differing fragments in `#state-main` — so the
footer work introduced no State visual change.

**Scope of this closure, stated narrowly.** It covers the **visual structure and content direction of the
guarded Florida anonymous State template only**. It does **not** cover, and does not close:

- production route cutover (the template remains `noindex, nofollow`);
- the canonical host / redirect / trailing-slash migration, which `FD-S-32` still defers;
- robots and sitemap activation, both of which remain documented one-condition cutovers;
- live AI, community or editorial services, none of which are connected;
- the missing internal routes — news, guides, community, results calendar — whose cards currently open inline
  previews;
- cross-State content completion; only Florida has a validated configuration;
- the cross-State expression `OPEN-SX-01` … `OPEN-SX-06`, which remains open for other jurisdictions.

Signed-in, Insider and paid-tier State behaviour is untouched and remains governed by the open Member/Insider
decisions.
| **OPEN-ST-07** | **Signed-in / Insider State variants** — all 12 signed-in section IDs and the three `AD-SS*` anchors, including whether AD-SS01 carries an Insider offer. | Founder | Already open globally: `source-conflicts.md` Conflict 3, 11 outstanding Member/Insider decisions, of which decision 3 touches GAM ad treatment directly. Not a new State decision. |
| **OPEN-ST-08** | **Content ownership and review cadence** per governed fact group: who owns and re-verifies claims, tax, anonymity, operator contacts, scratcher snapshots, unclaimed prizes and fund allocation, and at what frequency. | **Content/data operations**, then founder for resourcing | FD-S-02 and FD-S-03 settle what happens *without* a source (suppress) and *what artefact* records it (the manifest). They do not assign the people. PF-02 §55/§56 name the roles; the roles are unfilled. |

**Deliberately not on this list.** Sitemap scope, `robots.txt` content, schema projection, test framework
choice, CSS extraction sequencing, per-control disabled-state handling, fragment alias mechanics,
format-definition authoring, display-name overrides and the `USX` exclusion. Each is execution work with
a named owner and a settled rule — elevating any of them to a founder decision would be inventing a
decision that does not exist.

---

## 4. Scope tracks — what blocks what

The single biggest correction this record makes to LRG-SPEC-017 is separating five tracks that were
previously collapsed into one blocker list.

### Track 1 — Guarded Florida anonymous preview *(the next implementation task)*

**Blocked by, and only by:**

| Blocker | Ruling | Why it genuinely blocks |
|---|---|---|
| Synthetic publication gate must exist | FD-S-01 | The preview renders Florida content; without the gate, fabricated winners and claim deadlines render as fact |
| Florida's displayed game formats must be governed | FD-S-10 | Florida-specific, not all 112 referenced games |
| Shared DS layer extraction started | FD-S-12 | Otherwise the preview cannot satisfy FD-S-13 |
| State section manifest + resolver | FD-S-04 | Adaptive Priority is otherwise unexpressible |
| Florida State Content Manifest entries | FD-S-03 | S-08/S-08A need sourced facts or explicit unavailability |
| ~~Approved anchor→slot distribution~~ | ✅ **cleared** — `OPEN-ST-01` closed; implement the Minimum Florida profile | *(was: ads cannot be placed without it)* |

**Explicitly not blockers for this track:** the 101 undefined non-Florida formats · the 33
jurisdictions without fixtures · the 5 no-lottery jurisdictions · canonical host and trailing slash ·
sitemap and robots · the commerce route conflict · every signed-in section · automated tests ·
complete 49-jurisdiction content · S-14 and S-15 (both may ship as genuine sparse/cold-start hubs —
PF-02 §4 records State community as *"activity may begin with Q&A/draw threads"* and State news as
*"content may be initially sparse but real"*).

### Track 2 — Cross-State rollout

Adds: the route registry (FD-S-30) · ST-06 experience for the five no-lottery jurisdictions
(FD-S-31) · per-state format verification (FD-S-10) · automated tests (FD-S-35) · content ownership
and cadence (OPEN-ST-08) · per-state module suppression decisions (FD-S-02, FD-S-05).

### Track 3 — Production route cutover

Adds: canonical host · trailing slash · date-route form · `/fl-new` · Apache/Cloudflare redirect
audit · sitemap and `lastmod` policy · `robots.txt` · schema projection · fragment alias evidence
(FD-S-32, FD-S-33, FD-S-34, OPEN-ST-05).

### Track 4 — Signed-in / Insider State

Blocked entirely by the 11 open Member/Insider decisions (`source-conflicts.md` Conflict 3). Two
constraints must be designed for now rather than retrofitted: **claim outranks play** in the
personal next-action ranking, and **exact outcomes only** in personal matches — no near-miss
celebration, no immediate play pressure (PF-02 §35, §37).

### Track 5 — Commerce activation

Blocked by: the eligibility model and provider inventory (OPEN-ST-08 for ownership) · the
`/play` vs `/buynow` route decision (FD-S-32) · adjacent disclosure implementation (FD-S-19) ·
and the consent layer, which does not exist and is a precondition for any partner script (DS-25).

---

## 5. Supersession

**This record supersedes the unresolved framing of**
`03-docs/04-page-specifications/state/state-page-founder-review.md` **as produced by LRG-SPEC-017,
wherever the two conflict.**

Specifically superseded:

1. **The decision count.** LRG-SPEC-017 headlined "57 decisions required" while its own table listed
   **74** entries — an arithmetic error in that document. Neither number stands. After reclassification
   there are **8 genuinely open founder decisions** (`OPEN-ST-01` … `OPEN-ST-08`), 36 rulings recorded
   here, and the remainder redistributed to authority, engineering, ad operations, SEO/infrastructure
   and content operations.
2. **Protected-zone framing.** Decisions previously presented as an option between "production parity"
   and "architecture" are settled by FD-S-21. They were never an option; presenting them as one was an
   error.
3. **Blocker scope.** A single flat blocker list is replaced by the five tracks in §4.
4. **Accessibility as decisions.** Fourteen items previously listed as founder decisions are binding
   requirements per FD-S-13.
5. **Per-control decisions.** The disabled-control items are replaced by the single rule FD-S-08.
6. **S-14 and S-15 as blocked.** Both were overstated. PF-02 §4 permits sparse and cold-start hubs
   provided nothing is fabricated.

The **evidence** in the LRG-SPEC-017 audit and ad reconciliation is not superseded — it stands, with
the count corrections applied in place by this task. What is superseded is how that evidence was
framed as decisions.

---

## 6. Revision history

| Task | Date | Change |
|---|---|---|
| **LRG-DEC-024** | July 28, 2026 | Cross-State experience decisions `FD-X-01` … `FD-X-14` recorded in the new companion register `state-page-cross-state-experience-decisions.md`. One narrowly scoped supersession applied here: **`AD-S00` inactive below 992 px during the State preview** (`FD-X-04`), recorded in §2.J. `OPEN-ST-06` annotated — the 44×44 target question is settled by `FD-X-12`; the visual gate is restated at cross-State scope as `OPEN-SX-01` … `OPEN-SX-06`. **No ruling `FD-S-01` … `FD-S-36` was changed, no `APP-ST-*` approval was withdrawn, and PF-02 section order and the five-trigger Adaptive Priority set are unchanged** — the proposed `jackpotSurge` sixth trigger was **rejected** by `FD-X-07`. |
| **LRG-ADS-020** | July 28, 2026 | **`APP-ST-01` … `APP-ST-06` recorded as decided** in new §2.J; **`OPEN-ST-01` CLOSED**. Host-eligibility correction applied: an empty-state shell is not an advertising host, so four slots become conditional on S-14 / S-15 substantive real content and are not relocated on failure. The **Minimum Florida profile (10 active / 14 deferred)** becomes the implementation baseline; expanded profiles are conditional. Template-defined slots (24) and Wyoming record-only units (2) are now counted as separate populations. **No ruling `FD-S-01` … `FD-S-36` was changed, and no new founder approval question was created.** |
| **LRG-ADS-019** | July 28, 2026 | `OPEN-ST-01` moved from *open* to **proposal delivered, awaiting approval**, via `state-ad-anchor-distribution-proposal.md`. `OPEN-ST-03` re-scoped to cross-State rollout only, on the source finding that `fl` is not in the nine-state promo-bar gate. Six advertising approvals `APP-ST-01` … `APP-ST-06` introduced. **No ruling `FD-S-01` … `FD-S-36` was changed.** |
| **LRG-DEC-018** | July 27, 2026 | Record created. 36 founder rulings (FD-S-01 … FD-S-36) recorded across nine domains. Every LRG-SPEC-017 decision entry given a disposition. Open founder decisions reduced to 8 (`OPEN-ST-01` … `OPEN-ST-08`). Five scope tracks separated. Supersession of the LRG-SPEC-017 founder-review framing recorded. |
