# Home Preview — View-Model Contract

**Document type:** Page specification — preview view-model contract
**Recorded by:** Task LRG-SPEC-007 (Preview Track P2)
**Date:** July 26, 2026
**Status:** **PROPOSED — founder review required before P3**
**Governing authority:** BP-02 v1.1 §12, §57, §69 · Global Shell v1.1 §0.2 · `design-system-founder-decisions.md` · `reuse-register.md`

---

## 0. Scope and Non-Goals

**This document describes shapes in prose and tables. It is NOT a TypeScript file and P2 creates no code.**

| | |
|---|---|
| **Is** | A preview-only presentation contract for the anonymous Home page |
| **Is NOT** | An API contract · a database schema · a domain model · a production view model |

**Binding constraints carried forward:**

- **Fixtures MUST NOT become API contracts by accident** (`CLAUDE.md` §14). This contract is explicitly labelled *preview-only* and is superseded by the Phase 7 Home view-model contract.
- **Fixtures MUST NOT determine route existence.** Nothing here influences which URLs exist.
- **Signed-in state is out of preview scope**, but the contract is shaped so a later `user` discriminator can be added without restructuring existing fields.
- **Reuse the sound existing domain shapes** rather than re-inventing them: `ResultCard`, `BallGroupDrawn`, `MultiplierDrawn`, `AddOnDrawn`, `ResultFormatDefinition`, `AdSlotDefinition`, `AdSizeMapping`, `FooterConfig` are all classified game-domain-sound in `reuse-register.md` and carry forward unchanged.

---

## 1. Root Shape

```
HomePreviewViewModel
├── meta          — preview-mode declarations and provenance summary
├── page          — page metadata (title, description, canonical policy, freshness, source, correction)
├── shell         — shared anonymous shell data
├── sections      — ordered anonymous Home sections, keyed by blueprint section ID
└── ads           — anchor → slot references and placement states
```

**Ordering rule.** `sections` is an **ordered list**, not a bag. Order is supplied by the manifest and derived from BP-02 §12 — never from object key order and never from fixture key order.

---

## 2. `meta` — Preview Declarations

| Field | Type | Purpose |
|---|---|---|
| `previewMode` | `true` (literal) | Hard marker that this is preview data. Any renderer that finds `previewMode !== true` in a non-local environment must refuse to render. |
| `previewLabel` | string | Human-readable banner text, e.g. "Preview — sample data, not live lottery results" |
| `schemaVersion` | string | `"preview-1.0"`. Deliberately **not** continuous with the `0.1-sample` fixture stream, so it cannot be mistaken for the production view model |
| `supersededBy` | string | `"Phase 7 Home view-model contract"` |
| `provenanceSummary` | `{ productionDerived: string[]; copied: string[]; synthetic: string[]; illustrative: string[] }` | Section IDs grouped by provenance class. Enables a single render-time check that no synthetic lottery fact is presented unlabelled |
| `partnerScriptsActive` | `false` (literal) | Asserted, and independently enforced by env gating |

---

## 3. `page` — Page Metadata

| Field | Type | Rule |
|---|---|---|
| `title` | string | Unique. Passed through `cleanCopy` before render |
| `description` | string | Unique. `cleanCopy` |
| `h1` | string | Exactly one per page. `cleanCopy` |
| `intro` | string | Short answer / orientation copy |
| `canonical` | `{ policy: "not-emitted"; placeholder: string; reason: string }` | **The preview MUST NOT emit `<link rel="canonical">`.** The host and trailing-slash decision is unresolved (open dependency #1). `placeholder` is recorded for reference only; `reason` states the deferral. A wrong canonical is worse than none |
| `robots` | string | Preview default `"noindex, nofollow"` — the preview is not a production surface |
| `openGraph` | `{ type; siteName; title; description }` | No `og:image` value is invented. If no image exists, **omit** `og:image` **and** omit `twitter:card: summary_large_image` rather than declaring a large-image card with no image |
| `twitter` | `{ card; title; description }` | `card` is `"summary"` unless a real image exists |
| `lastUpdated` | `{ display: string; isoDateModified: string; timezoneLabel: string }` | **Visibly rendered.** `display` must state an exact date — never a bare "today" or "last night" |
| `source` | `{ name: string; text: string; verifiedLabel: string }` | Renders the Global Shell §123 line: "Source checked · Result verified · Last updated" |
| `correction` | `{ present: boolean; what?: string; whenIso?: string; impact?: string } \| null` | When `present`, the notice states **what changed, when, and the impact** (Global Shell §126). The preview includes one representative correction to exercise the state |
| `independenceDisclaimer` | string | Independent-publisher notice |
| `responsiblePlay` | `{ text: string; ageNotice: string }` | 18+ notice |
| `schema` | `{ webPage: true; webSite: true; organization: true; itemList: ItemListRef[]; searchAction: false; breadcrumbList: false }` | Per BP-02 §69: `WebPage` + `WebSite` + `Organization` required; `ItemList` **only** for visibly meaningful ordered collections; **`SearchAction` is `false`** — BP-02 §69 explicitly does not require it and no working `/search` route exists; **`BreadcrumbList` is `false`** — generally unnecessary on root Home. **No `NewsArticle` on Home** |

---

## 4. `shell` — Shared Anonymous Shell Data

Mapped to Global Shell v1.1 component IDs.

| Field | Global Shell ID | Type | Preview state |
|---|---|---|---|
| `utilityStrip` | GS-01 | `{ enabled: boolean; items: { label; href }[] }` | `enabled: false` for the preview — utility-strip enablement is reserved by Global Shell §154 |
| `header` | GS-02 | `{ brand: { name; markLabel }; sticky: boolean }` | Brand mark is the **existing** mark. **No logo redesign** (DS-33) |
| `primaryNav` | GS-03 | `{ items: { label; href; state: "live" \| "preview-unavailable" }[] }` | Every item carries an explicit `state`. Items whose route does not exist render as **`preview-unavailable`** with a visible label — **not** as silently broken links and **not** as disabled-looking controls (DS-17). **No route is created to satisfy navigation** |
| `contextBar` | GS-04 | `{ show: false }` | `BreadcrumbList` is unnecessary on root Home; no breadcrumb rendered |
| `search` | GS-05 | `{ placeholder; state: "preview-unavailable"; explanation }` | Visible, labelled, non-functional. **No `SearchAction` schema** |
| `aiTrigger` | GS-06 | `{ label: "Ask LotteryCorner AI"; compactLabel: "Ask AI"; state: "preview-unavailable"; explanation }` | Contextual entry, explicitly labelled. **Not a floating chat bubble** (Constitution §13) |
| `account` | GS-07 | `{ state: "anonymous"; signInLabel; registerLabel; valueStatement; available: false }` | **Anonymous only.** `valueStatement` says exactly what would be preserved. **No auth, no Member/Insider capability** |
| `notifications` | GS-08 | `{ show: false }` | Requires an account; out of scope |
| `mobileBottomNav` | GS-09 | `{ items: { label; href; iconTextFallback; state }[]; priority: 2 }` | **Text labels required** (Global Shell §144). `priority: 2` records its rank in the sticky hierarchy |
| `footer` | GS-10 | `FooterConfig` (existing shape, unchanged) | From `footer-config.json` — **real production links**. Targets that do not exist yet are marked, not removed |
| `messageBanner` | GS-11 | `{ present: true; kind: "preview"; text }` | Carries `meta.previewLabel` — the page-level preview disclosure |
| `consentLayer` | GS-12 | `{ required: true; implemented: false; reason }` | Recorded as a precondition for any partner script. **Not implemented; no script activated** |
| `adAnchors` | GS-13 | see §7 | — |
| `affiliateActionBar` | GS-14 | `{ show: false }` | Sticky purchase bar suppressed in the preview to avoid competing with the sticky-ad reservation (BP-02 §65) |
| `responsiblePlayAccess` | GS-15 | `{ label; href; state }` | Always reachable, including on mobile |
| `stateContext` | Global Shell §6.5 | `{ resolved: boolean; source: "page" \| "session" \| "signed-in" \| "device" \| "manual" \| "none"; stateCode?: string; askUser: boolean }` | Preview resolves to `source: "none"`, `askUser: true`. **Coarse IP MUST NEVER determine eligibility, claim rules, tax guidance or provider availability** |
| `jackpotTicker` | shell band | `{ heading?; nextDraw?; topJackpots: { game; amountDisplay; estimatedLabel }[]; disclaimer }` | `estimatedLabel` is mandatory — jackpots are estimates, stated as such |

---

## 5. `sections` — Anonymous Home Sections

Each entry shares a common envelope, then a section-specific `data` payload.

### 5.1 Common section envelope

| Field | Type | Rule |
|---|---|---|
| `id` | string | Blueprint section ID (`H-01`, `H-02A`, …). Immutable |
| `name` | string | Blueprint section name |
| `order` | number | 1–30 from the manifest |
| `headingLevel` | `2 \| 3` | Maintains heading structure beneath the single `h1`; no level skipped |
| `previewAction` | enum | `current-data` \| `transformed-fixture` \| `labelled-preview-state` |
| `provenance` | enum | `production-derived` \| `copied` \| `synthetic` \| `illustrative` |
| `provenanceLabel` | string \| null | **Required and non-null when `provenance` is `synthetic` or `illustrative`.** Rendered visibly |
| `state` | enum | `ready` \| `loading` \| `empty` \| `stale` \| `corrected` \| `unavailable` |
| `stateText` | string \| null | Required whenever `state !== "ready"`. **Always text — never colour alone** |
| `adTier` | `0 \| 1 \| 2 \| 3` | From BP-02 §57 |
| `protectedZone` | boolean | `true` blocks any ad, campaign or promo inside |
| `intelligence` | enum | `deterministic` \| `generative` \| `curated` \| `interesting-fact` \| `next-action` \| `none-documented` | Global Shell §10.5 requires every section to declare one |
| `mobilePriority` | 1–5 | From the manifest |
| `data` | section-specific | See below |

### 5.2 Section-specific payloads

| Section | `data` shape |
|---|---|
| **H-01** Home Task Entry | `{ h1; intro; taskEntries: { label; href; state }[]; stateEntry: { heading; intro }; compactAiAction: { label; state } }` |
| **H-02A** Featured National Games | `{ heading; cards: ResultCard[] }` — **existing `ResultCard` shape, unchanged**. Exactly the two flagship games |
| **H-02B** Additional Top Jackpots | `{ heading; intro; jackpots: { game; href; amountDisplay; estimatedLabel; nextDrawDisplay; status? }[] }` — transformed from the fixture's `columns`/`rows` table into typed records |
| **H-03** Latest Results | `{ heading; intro; groups: { groupKey; heading; cards: ResultCard[] }[] }` — grouped so national and state results are distinguishable |
| **H-04** Check My Numbers | `{ heading; intro; howItWorks: string[]; state: "unavailable"; stateText }` — entry and explanation only; no matching engine |
| **H-05** AI Daily Brief | `{ heading; aiLabel: "LotteryCorner AI"; mode: "deterministic-fallback"; summaryLines: string[]; citations: { label; href }[]; disclaimer }` — **`mode` is never `generative` in the preview.** `summaryLines` derive from real result data. **No prediction language** |
| **H-06A** Live / Recently Completed | `{ heading; rows: { game; drawDisplay; status: "live" \| "completed" \| "awaiting" \| "delayed"; statusText; resultRef? }[] }` — `statusText` mandatory |
| **H-06B** Tonight and Upcoming | `{ heading; items: { game; drawDisplay; exactDateIso; jackpotDisplay?; estimatedLabel?; cutoffNote? }[] }` — exact dates, never bare "tonight" |
| **H-07** Explore Your State | `{ heading; intro; states: { code; name; href }[]; askUserPrompt }` |
| **H-08** Worth Knowing | `{ heading; intro; items: { kind: "recent-win" \| "unclaimed" \| "jackpot-growth"; text; location?; amount?; note? }[]; provenanceLabel }` — **synthetic; visibly labelled** |
| **H-09** Tools and Systems | `{ heading; intro; tools: { label; desc?; href; state }[]; systems: { title; body?; list? }[] }` |
| **H-09A** Popular Games | `{ heading; items: { slug; displayName; href; jurisdiction?; topPrizeDisplay?; nextDrawDisplay?; purchase?: PurchaseRef }[] }` |
| **H-09B** Jackpot History | `{ heading; intro; items: { game; href?; currentDisplay?; previousDisplay?; changeDisplay?; nextDrawDisplay?; statusText? }[]; chart: null; chartReason }` — **`chart` is always `null` in the preview**; `chartReason` records that a chart renders only from real historical series |
| **H-10** Community Live | `{ heading; intro; state: "unavailable"; stateText; items: [] }` — **`items` MUST be empty. Fabricating community activity is prohibited** (Constitution §11; `CLAUDE.md` §7) |
| **H-10A** Winners and Claim Stories | `{ heading; items: { title?; amountDisplay?; game?; location?; dateDisplay?; text }[]; provenanceLabel }` — **synthetic; visibly labelled** |
| **H-11** News and Stories | `{ heading; intro; items: { category?; dateDisplay?; title; summary?; href; imageRef: null }[]; provenanceLabel }` — synthetic; labelled. **No `NewsArticle` schema on Home** |
| **H-11A** Blog and Guides | `{ heading; items: { title; href; excerpt?; dateDisplay?; category? }[]; provenanceLabel }` |
| **H-12** Where to Play | `{ heading; copy; purchase: PurchaseRef; disclosure: string; eligibility: { resolved: false; stateText } }` — see §6 |
| **H-13** My LotteryCorner Value | `{ heading; subheading?; valuePoints: { title; desc? }[]; state: "unavailable"; stateText }` — **value explanation only. No entitlement, tier, quota, export, ticket record or badge.** 11 Part 22 decisions open |
| **H-14** Return and Distribution | `{ heading; channels: { label; state: "unavailable"; stateText }[] }` |
| **H-14A** Newsletter | `{ heading?; text?; emailPlaceholder; state: "unavailable"; stateText }` — **explicitly labelled unavailable, not a silently disabled input** (DS-17) |
| **H-14B** State Directory | `{ heading; intro; states: { code; name; href }[] }` — complete crawlable directory |
| **H-15** Trust, Support and Footer | `{ heading; sourcePolicy; accuracyPolicy; supportLinks: { label; href; state }[]; responsiblePlay; independenceDisclaimer; ageNotice }` |

---

## 6. Results and Commerce Shapes

### 6.1 Reused domain shapes — carried forward unchanged

`ResultCard`, `BallGroupDrawn`, `MultiplierDrawn`, `AddOnDrawn` and `ResultFormatDefinition` are reused as-is. They are already format-driven, never hardcode a ball count, and support variable groups, named specials, add-ons, multipliers, secondary draws and card games.

### 6.2 Required additions for blueprint compliance

| Field | Added to | Purpose |
|---|---|---|
| `specialBallLabel` | each ball group carrying a special ball | **Mandatory visible label** — "Powerball", "Mega Ball", "Cash Ball", "Fireball", "Bonus" (DS-11, DS-14) |
| `accessibleName` | each drawn value | e.g. `"Mega Ball 9"`. Draw date and game announced before values (Global Shell §146) |
| `distinctionShape` | each special ball | `"ring" \| "double-ring" \| "square"` — the non-colour geometric signal |
| `multiplierText` | multiplier | Full text, e.g. `"Power Play 3×"` — **never a bare number** |
| `secondaryDrawHeading` | secondary draw | Named heading, e.g. `"Double Play"` |
| `awaiting` | result card | `{ isAwaiting: true; stateText: "Awaiting result"; nextDrawExactDate }` — placeholder **reserves the ball row's height** |
| `corrected` | result card | `{ isCorrected: true; what; whenIso; impact }` |
| `orderingLocked` | result card | `true` — **game-defined ordering is never re-sorted** (DS-12) |

**Ball tokens are a brand-identity family, separate from the action/state family.** `--ball-powerball-*` is red-hued but is **NOT** an alias of `--color-alert`. DS-03 reserves the *alert role* for corrections, errors, critical alerts and destructive actions; it does not forbid red in a game's brand identity. Because every special ball also carries a mandatory label and shape distinction, a Powerball cannot be misread as a correction. **The two token families MUST NOT be aliased to each other.**

### 6.3 `PurchaseRef` — commerce reference

| Field | Type | Rule |
|---|---|---|
| `label` | string | e.g. "Where to play" |
| `routeRef` | `{ status: "unresolved"; candidates: ["/play/{game}", "/buynow/{code}"] }` | **The preview resolves no destination.** BP-04 §4 approves `/play/{game}`; the implementation and legacy use `/buynow/{code}`. **This conflict MUST NOT be settled by the preview** (open dependency #4) |
| `disclosure` | string | **Mandatory, adjacent, clear and conspicuous** |
| `relAttributes` | `"nofollow sponsored"` | Always |
| `eligibility` | `{ resolved: false; stateText }` | State eligibility unresolved; stated in text |

**No raw affiliate URL may appear** in DOM, metadata, schema, fixtures, logs or AI output.

---

## 7. `ads` — Advertising References

**This section references existing configuration. It reproduces no GAM values and changes nothing.**

| Field | Type | Rule |
|---|---|---|
| `anchors` | `AdAnchor[]` | Exactly the 7 blueprint anchors, in sequence order |
| `unmappedSlots` | string[] | `["hp_video"]` — defined in production inventory but unreferenced by the current fixture. **Recorded, not dropped** |
| `flushGuard` | `true` | Retains the unconsumed-slot flush so no configured slot is silently lost |

### `AdAnchor`

| Field | Type | Rule |
|---|---|---|
| `anchorId` | string | `AD-H00` … `AD-H06` |
| `subPosition` | `"inline" \| "rail" \| "sticky" \| "mobile-inline"` | Per BP-02 §63 |
| `slotKeys` | string[] | **References into `ad-slot-definitions.json` by `slotKey` only.** No ID, unit path, size map, dimension or count is reproduced or altered |
| `visibility` | `"all" \| "gte-992" \| "lt-992"` | Bound to the single named threshold |
| `placementState` | `"reserved" \| "filled-preview" \| "no-fill-preview" \| "inactive-sticky-preview"` | See below |
| `reservedHeightSource` | `"slot-size-mapping"` | Height derives from the slot's own mapping — never hardcoded |
| `label` | `"Advertisement"` | Visible, at the 12 px micro-label floor |
| `active` | `false` | **No slot requests an ad. No `googletag` call. Partner scripts inactive** |

### Placement states

| State | Renders | Purpose |
|---|---|---|
| `reserved` | Reserved geometry + label, no creative | Default |
| `filled-preview` | Reserved geometry + label + a clearly marked non-advertising placeholder block | Demonstrates the filled appearance **without any real or simulated advertisement** |
| `no-fill-preview` | **Outer placement geometry retained; inner creative area collapsed; label suppressed** | DS-24. Zero layout shift; no empty-box impression |
| `inactive-sticky-preview` | Labelled inactive sticky reservation | DS-27. **Does not assert final production creative height** — DS-26/DS-34 unresolved |

---

## 8. Content Provenance

**Every field carrying a lottery fact declares its provenance.** This is the mechanism that prevents synthetic content being published as real.

| Class | Meaning | Render obligation |
|---|---|---|
| `production-derived` | Real values from the production results feed or production configuration | Normal render with source attribution |
| `copied` | Transcribed verbatim from a production artifact (e.g. footer links) | Normal render |
| `synthetic` | Authored sample content that resembles a lottery fact | **MUST render with a visible label.** MUST NOT appear as a live fact |
| `illustrative` | Structural placeholder with no factual claim | **MUST render with a visible label** |

### Provenance by section

| Class | Sections |
|---|---|
| **production-derived** | H-02A, H-03 (real result values, dates and jackpots from `source-xml`), AD-H00…AD-H06 (real slot references), H-15 footer links, `page.source` |
| **copied** | H-14B and H-07 state registry, footer configuration |
| **synthetic** | **H-08, H-10A, H-11, H-11A** — winner stories, unclaimed amounts, jackpot-growth notes, news items, blog items |
| **illustrative** | H-01 task entries, H-04, H-05, H-09, H-09A, H-09B, H-12, H-13, H-14, H-14A, H-10 |

**Enforcement requirements:**

1. `meta.provenanceSummary` lists every section by class, enabling one render-time assertion.
2. Any section whose `provenance` is `synthetic` or `illustrative` and whose `provenanceLabel` is null is a **build-blocking defect**.
3. `meta.previewMode` plus a local-only environment flag gate the whole page. **A non-local environment must refuse to render preview data.**
4. `page.robots` is `"noindex, nofollow"` for the preview.

---

## 9. Interaction States

Every state is carried in data and rendered as **text plus** a visual treatment — never colour alone.

| State | Data representation | Render requirement |
|---|---|---|
| `loading` | `state: "loading"` | Reserved space, no layout shift; text status ("Loading results…"); `aria-busy` |
| `empty` | `state: "empty"` + `stateText` | Explicit "nothing to show" text and the reason |
| `stale` | `state: "stale"` + `stateText` + `page.lastUpdated` | Visible last-updated timestamp **and** an explicit staleness note |
| `corrected` | `state: "corrected"` + `corrected: { what; whenIso; impact }` | Persistent, static marker adjacent to the affected value; **never a transient flash** |
| `unavailable` | `state: "unavailable"` + `stateText` | Explicit unavailability text and reason. **Never a silently disabled control** (DS-17) |
| `no-fill` (ads) | `placementState: "no-fill-preview"` | Outer geometry retained, inner creative collapsed, label suppressed |
| `anonymous` | `shell.account.state: "anonymous"` | Complete public value; registration prompts state exactly what would be preserved |

**Awaiting** is modelled on the result card (`awaiting`) rather than as a section state, because a section may hold both settled and awaiting games simultaneously.

### Forward extension for signed-in (not implemented)

The contract is shaped so a later `shell.account.state: "signed-in"` plus additional `sections` entries (`H-01S`…`H-08S`) can be added **without changing any existing field**. Specifically: `sections` is an ordered list keyed by blueprint ID; `shell.account` already carries a `state` discriminator; no field assumes anonymity. **No signed-in field is defined here and none is implemented.**

---

## 10. Fixture Transformation Principles

| Principle | Rule |
|---|---|
| **Read-through, not rewrite** | The preview reads `home-page-sample.json` through the existing data-provider seam and maps it into this contract. **The transformation lives in code, not in a rewritten fixture**, so the existing fixture remains intact for the production Phase 7 work |
| **No fixture key becomes a contract** | Section identity comes from blueprint IDs, never from fixture key names |
| **Missing data is labelled, not invented** | A section with no adequate data becomes a labelled preview state |
| **Provenance is added, never removed** | The fixture's `_meta.illustrative`, `dbApiDriven` and `adminEditable` lists feed `meta.provenanceSummary` |
| **Stale timestamps are surfaced, not hidden** | The fixture's `lastUpdated` is July 2026 and older than the freshness window. The preview renders it truthfully and marks affected sections `stale` |
| **`cleanCopy` at every text boundary** | No `[ADMIN]` or `[VERIFY-*]` marker may reach the DOM |

---

## 11. Consistency Validation

| Check | Result |
|---|---|
| Every one of the 30 manifest entries has a shape or an ad-anchor definition | ✅ 23 section payloads + 7 anchors |
| Signed-in fields defined | ✅ **None.** Forward extension described without defining fields |
| Existing sound domain shapes reused | ✅ `ResultCard`, ball groups, multipliers, format definitions, footer config unchanged |
| Additions justified by a blueprint or founder decision | ✅ each addition in §6.2 cites DS-11/DS-12/DS-14 or Global Shell §146 |
| No state relies on colour alone | ✅ every state carries mandatory `stateText` |
| No GAM value reproduced or changed | ✅ `slotKey` references only |
| Provenance declared for every lottery-fact field | ✅ §8, with build-blocking enforcement |
| Route/canonical/commerce conflicts left unresolved | ✅ `canonical.policy: "not-emitted"`, `PurchaseRef.routeRef.status: "unresolved"` |
| No Member/Insider capability | ✅ H-13 is value explanation only |
| `SearchAction` not added | ✅ `schema.searchAction: false`, with BP-02 §69 cited |
| Not an API contract | ✅ `meta.supersededBy` names the Phase 7 contract |
