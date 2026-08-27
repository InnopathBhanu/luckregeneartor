# State Page — Founder Review: Decision Dispositions and Remaining Open Questions

**Document type:** Founder-review record — State page family (PF-02 / BP-03)
**Produced by:** Task **LRG-SPEC-017**, consolidated and corrected by task **LRG-DEC-018**
**Date:** July 27, 2026
**Status:** **CONSOLIDATED.** 36 founder rulings applied. **`OPEN-ST-01` is CLOSED** by LRG-ADS-020
(`APP-ST-01` … `APP-ST-06` decided). **7 founder decisions remain open**, none of which blocks the
guarded anonymous Florida State preview.

> **Supersession.** The decision framing in the LRG-SPEC-017 version of this document is superseded by
> `03-docs/08-decisions/state-page-founder-decisions.md` (`ST-DEC-001`) wherever the two conflict. That
> record holds the rulings; this document holds the **disposition of every prior entry** and the
> **reduced open-decision list**. The underlying evidence — in the audit and the ad reconciliation — is
> not superseded.

**Companion documents**

- `03-docs/08-decisions/state-page-founder-decisions.md` — the 36 rulings (`FD-S-01` … `FD-S-36`)
- `state-page-source-and-current-implementation-audit.md` — the evidence
- `state-page-section-and-view-model-specification.md` — the specification the rulings unblock
- `../../05-advertising/state-ad-inventory-reconciliation.md` — slot-level ad detail
- `../../05-advertising/state-ad-anchor-distribution-proposal.md` — **the APPROVED distribution; `APP-ST-01` … `APP-ST-06` decided, `OPEN-ST-01` closed (LRG-ADS-019 / LRG-ADS-020)**
- `../../08-decisions/source-conflicts.md` — Conflicts 13–18, registered by LRG-DEC-018

---

## 1. What changed

| | LRG-SPEC-017 | After LRG-DEC-018 |
|---|---|---|
| Headline decision count | "57 decisions required" — **while the document's own table listed 74 entries** | **74 entries dispositioned; 8 remain open at founder level** |
| Protected-zone placement | Presented as a choice between "production parity" and "architecture" | **Not a choice.** Settled by `FD-S-21`; affected slots are **relocated**, inventory preserved |
| Accessibility | 14 items listed as founder decisions | **Binding implementation requirements** (`FD-S-13`), removed from the count |
| Disabled controls | Framed as needing per-control rulings | **One standing rule** (`FD-S-08`) covering 7 control groups / 14 controls |
| S-14 Community, S-15 News | "Blocked" | **Not blocked.** PF-02 §4 permits a sparse or cold-start hub provided nothing is fabricated |
| Blockers | One flat list | **Five separate tracks** — preview · rollout · route cutover · signed-in · commerce |
| Result formats | "101 of 112 undefined" read as a blocker | **Not a Florida-preview blocker** (`FD-S-10`); a cross-State rollout gate |
| Governed positions | "24 governed anonymous positions", "20 content sections" | **25 positions = 19 content sections + 5 ad anchors + footer** |
| Sections with a counterpart | "11 partial" | **10 of 19 partial; 9 absent** |
| DS-17 violations | "9" | **7 control groups / 14 disabled controls** |

**Counts corrected across all four State documents.** The "57" headline was an arithmetic error: the
nine category subtotals in the original §3 (9 + 4 + 19 + 14 + 9 + 7 + 3 + 5 + 4) sum to **74**, not 57.
Neither number is retained as a headline.

---

## 2. Disposition of every prior entry

Classification vocabulary, one per entry:

| Class | Meaning |
|---|---|
| **FOUNDER DECIDED** | Settled by a ruling in `ST-DEC-001`. Cited. |
| **AUTHORITY ALREADY DECIDED** | Was never an open decision — the Constitution, PF-02, Global Shell or DS-DEC-001 already settles it. Listing it as a decision was the error. |
| **ENGINEERING EXECUTION** | Implementation or evidence-gathering work with a settled rule. No founder input. |
| **AD-OPERATIONS VALIDATION** | Needs ad operations to confirm live GAM reality before it can close. |
| **SEO/INFRASTRUCTURE REVIEW** | Belongs to the deferred URL and migration review (`FD-S-32`). |
| **CONTENT/DATA OPERATIONS** | Needs a source, an owner, a verification date and a cadence — not a product ruling. |
| **GENUINELY OPEN FOUNDER DECISION** | Survives all rulings. Carried to §3. |
| **DUPLICATE / MERGED** | The same question as another entry; folded into it. |
| **OBSOLETE** | The premise was wrong or the question no longer has consequences. |

### 2.1 Data, content safety and sourcing (D-01 … D-09)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **D-01** | Prevent synthetic content rendering as public fact | **FOUNDER DECIDED** | `FD-S-01` — environment gate; a visible label is explicitly not a substitute |
| **D-02** | Who sources and dates claim, tax and anonymity facts, at what cadence | **CONTENT/DATA OPERATIONS** | `FD-S-02` (suppress until sourced) settles the *behaviour*; ownership → `OPEN-ST-08` |
| **D-03** | Winner and unclaimed-prize content: source or suppress | **FOUNDER DECIDED** | `FD-S-02` — S-12 suppressed until sourced |
| **D-04** | State Content Manifest field set and launch jurisdictions | **FOUNDER DECIDED** | `FD-S-03` — approved in principle; Florida validates first, is not a template |
| **D-05** | Scratcher snapshot source | **FOUNDER DECIDED** | `FD-S-02` — S-11 suppressed where no sustainable snapshot exists; sourcing → `OPEN-ST-08` |
| **D-06** | Fund-allocation source and reporting period | **FOUNDER DECIDED** | `FD-S-02` — S-13 suppressed until sourced |
| **D-07** | Restore operator identity, URL, phone, address, claim office | **CONTENT/DATA OPERATIONS** | `FD-S-03` — these are manifest fields; restoring them from legacy evidence is execution |
| **D-08** | Retain the 12 per-state admin-overridable section headings | **CONTENT/DATA OPERATIONS** | An existing production content-ops capability. Preserved unless content operations decides otherwise — dropping it would *reduce* capability, so it is not a silent default |
| **D-09** | Feed data-quality defects rendering publicly (`"Cash4  Evening"`, `"Missippi Cash3 Midday"`, `"Mega bucks"`, Maine's `State (US)-` prefix leaking into `/me`'s meta description) | **CONTENT/DATA OPERATIONS** | Display-name override layer and/or upstream feed correction |

### 2.2 Result formats (F-01 … F-04)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **F-01** | Expand format definitions; launch-state minimum | **FOUNDER DECIDED** | `FD-S-10` — incremental by verified launch-state need; Florida's displayed games must be governed; no unverified format enabled elsewhere |
| **F-02** | New format classes (Daily Derby, Keno-scale, full named-special-ball set) | **ENGINEERING EXECUTION** | Under `FD-S-10`; sourcing of values is content operations |
| **F-03** | Close the result-status union; add `corrected` and `delayed` | **FOUNDER DECIDED** | `FD-S-09` — closed, exhaustive, eight states minimum |
| **F-04** | Model midday/evening pairs as variants of one game | **FOUNDER DECIDED** | `FD-S-11` — shared identity where the relationship is real; each variant stays independently selectable and indexable |

### 2.3 Advertising (A-01 … A-19)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **A-01** | `sp_toppromobar` 9-state gate — retain, extend, retire | **GENUINELY OPEN FOUNDER DECISION** | `OPEN-ST-03` |
| **A-02** | Wyoming record-only slots | **AD-OPERATIONS VALIDATION** | `FD-S-27` — excluded from the preview baseline; evidence retained → `OPEN-ST-02` |
| **A-03** | Five ads inside the results list | **FOUNDER DECIDED** | `FD-S-21` + `FD-S-25` — **relocate**, preserve inventory. Never an option to keep in place |
| **A-04** | `sp_mid_leaderboard_pos4` duplicate and unreachable `pos4` slots | **FOUNDER DECIDED** | `FD-S-23` — at most one valid placement each, or explicitly disabled |
| **A-05** | Extend the 992 px threshold to State | **FOUNDER DECIDED**, subject to ad-ops validation | `FD-S-24` — no 992–1023 px gap; no GAM mapping change |
| **A-06** | No-fill behaviour: three conflicting specifications | **AD-OPERATIONS VALIDATION** | `OPEN-ST-04`; registered as source Conflict 15 |
| **A-07** | The 9 legacy slots the current page never renders | **FOUNDER DECIDED** *(baseline)* + **MERGED** *(placement)* | `FD-S-22` — each needs a recorded disposition; the destination is `OPEN-ST-01` |
| **A-08** | `sp_side_halfpage_pos1`, defined but never rendered in legacy | **FOUNDER DECIDED** | `FD-S-22` — "explicit treatment of defined-but-never-rendered slots" |
| **A-09** | Correct the `ad-slot-definitions.json` provenance citation | **ENGINEERING EXECUTION** | Registered as source Conflict 16; needs an approved data task (write scope) |
| **A-10** | Fill the two resolvable "UNKNOWN" div ids and `sp_toppromobar`'s missing sizes | **ENGINEERING EXECUTION** | Same task; Conflict 16 |
| **A-11** | Which jurisdictions resolve to `lottery-result_upgrade_special.jsp` | **OBSOLETE** *(as an advertising decision)* | That template's ad inventory is **identical** — 24 defined, 23 rendered, same defined-not-rendered slot — so it cannot change the ad baseline. The composition question survives only as a minor evidence item for cross-State rollout |
| **A-12** | Rail model: production section-anchored vs. one continuous rail | **FOUNDER DECIDED** | `FD-S-28` — State-specific contextual rail on governed section boundaries; sticky only where it cannot cross protected content |
| **A-13** | Claim-zone ads | **DUPLICATE / MERGED** into **A-03** | `FD-S-21` + `FD-S-25` — same ruling |
| **A-14** | Sticky-conflict priority and derived clearance | **FOUNDER DECIDED** | `FD-S-29` |
| **A-15** | Mobile snippets moved from Popular Games to the results area | **DUPLICATE / MERGED** into `OPEN-ST-01` | Placement destination; ad-ops validates |
| **A-16** | `atv_video_player` — extend the Home retirement or keep | **AD-OPERATIONS VALIDATION** | `FD-S-26` — deferred, disabled in the preview, **not** assumed retired → `OPEN-ST-02` |
| **A-17** | The anchor→slot distribution | **GENUINELY OPEN FOUNDER DECISION** | `OPEN-ST-01` |
| **A-18** | Per-state inventory variance (WY 1 of 5; AZ/MA/MN 3 of 5) | **DUPLICATE / MERGED** into `OPEN-ST-01` | Density follows the distribution; ad-ops validates |
| **A-19** | Ratify the reduced no-lottery (ST-06) ad model | **FOUNDER DECIDED** | `FD-S-22` ("State-specific and no-lottery rules") + `FD-S-31`; ad-ops validates the final set |

### 2.4 Routes and SEO (R-01 … R-14)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **R-01** | Canonical host `www` vs non-`www` | **SEO/INFRASTRUCTURE REVIEW** | `FD-S-32` → `OPEN-ST-05` |
| **R-02** | Trailing-slash convention; production's own canonical/JSON-LD contradiction | **SEO/INFRASTRUCTURE REVIEW** | `FD-S-32` → `OPEN-ST-05`; contradiction registered as Conflict 13 |
| **R-03** | Replace the fixture-derived route source with a registry | **FOUNDER DECIDED** | `FD-S-30` — registry with five jurisdiction classes; **no `/usx`** |
| **R-04** | Date-route form | **SEO/INFRASTRUCTURE REVIEW** | `FD-S-32` → `OPEN-ST-05` |
| **R-05** | ST-06 experience for `al ak hi ut nv` | **FOUNDER DECIDED** | `FD-S-31` — preserve the routes with the ST-06 experience, not 404 |
| **R-06** | `/fl-new` disposition | **SEO/INFRASTRUCTURE REVIEW** | `FD-S-32` → `OPEN-ST-05` |
| **R-07** | `/play/{game}` vs `/buynow/{code}` | **SEO/INFRASTRUCTURE REVIEW** | `FD-S-20` + `FD-S-32` → `OPEN-ST-05`; registered as Conflict 14 |
| **R-08** | Section fragments | **FOUNDER DECIDED** | `FD-S-33` — PF-02 fragments primary; legacy aliases only on demonstrated dependency |
| **R-09** | Sitemap scope, split, `lastmod` policy | **ENGINEERING EXECUTION** | `FD-S-34` — work item, not a product decision |
| **R-10** | `robots.txt`, including the `/buynow/` disallow | **ENGINEERING EXECUTION** | `FD-S-34` — `/buynow/` **must** remain non-indexable |
| **R-11** | Apache/Cloudflare redirect audit | **SEO/INFRASTRUCTURE REVIEW** | `FD-S-32` → `OPEN-ST-05` |
| **R-12** | `struts_old.xml`'s third state template | **ENGINEERING EXECUTION** | Evidence gathering for the migration review |
| **R-13** | Schema upgrade (`CollectionPage`, jurisdiction, distinct operator, stable `@id`s, `dateModified`) | **ENGINEERING EXECUTION** | `FD-S-34` — visible content only; operator distinct from LotteryCorner |
| **R-14** | `og:url`, `og:image`, `twitter:image` | **ENGINEERING EXECUTION** | `FD-S-34`; asset availability is content operations. Do not invent an image path |

### 2.5 Sections and composition (S-01 … S-09)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **S-01** | `#game-comparison` framed "which game should you play" | **FOUNDER DECIDED** | `FD-S-06` — reframe to `Compare [State] Lottery Games` with the neutral column set |
| **S-02** | Assign the 7 orphan modules | **FOUNDER DECIDED** | `FD-S-05` — explicit mapping supplied; do not preserve a module to avoid deleting it |
| **S-03** | S-14 Community is required and no platform exists | **AUTHORITY ALREADY DECIDED** — *prior framing overstated* | PF-02 §4 records State community as *"required hub — activity may begin with Q&A/draw threads"*, and §27 defines a cold start that fabricates nothing. A genuine empty hub is compliant. **Not a preview blocker.** `FD-S-36` forbids fabricated activity |
| **S-04** | S-15 News is required; reconnect the legacy blog source? | **AUTHORITY ALREADY DECIDED** — *prior framing overstated* | PF-02 §4: *"content may be initially sparse but real."* Reconnecting `blog.recentPosts` is **ENGINEERING EXECUTION** |
| **S-05** | Content-budget enforcement vs. non-existent destinations | **AUTHORITY ALREADY DECIDED** | PF-02 §12.2 sets the budget. Trimming as destinations ship is execution sequencing, not a decision |
| **S-06** | Which cutoff and live-status data is verifiable per game | **CONTENT/DATA OPERATIONS** | Legacy supplies `cutOffTime`, `advancedPlays`, `daysOff` and a closed-draw countdown; verification is data work → `OPEN-ST-08` |
| **S-07** | Check-ticket comparison needs governed formats | **FOUNDER DECIDED** | `FD-S-10` scopes it to governed games; `FD-S-17` requires the comparison itself to be deterministic, never AI |
| **S-08** | Carry forward the three-severity notice band | **FOUNDER DECIDED** | `FD-S-07` — becomes the governed notice and correction surface; material corrections drive Adaptive Priority |
| **S-09** | Section order must become data-driven | **FOUNDER DECIDED** | `FD-S-04` — typed State section manifest + resolver; **explicitly not** a generic page-builder |

### 2.6 Design system and accessibility (X-01 … X-07)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **X-01** | Merge the design-system layer out of `[data-lc-preview]` scope | **FOUNDER DECIDED** | `FD-S-12` — incremental extraction, **no one-shot CSS rewrite**, locked Home appearance preserved |
| **X-02** | Resolve the disabled controls on the State path | **FOUNDER DECIDED** | `FD-S-08` — one rule: hide, or replace with labelled informational text. **7 control groups / 14 controls**, no per-control decision |
| **X-03** | Special-ball three-signal distinction | **FOUNDER DECIDED** | `FD-S-14`; the specific border/shape/pattern tokens → `OPEN-ST-06` |
| **X-04** | The unapproved `:root[data-theme="dark"]` block | **FOUNDER DECIDED** | `FD-S-15` — may remain only while inert and clearly identified as unapproved reference code |
| **X-05** | The four items DS-DEC-001 §8 left open (container width, density, weight policy, 44×44) | **GENUINELY OPEN FOUNDER DECISION** | `OPEN-ST-06` |
| **X-06** | Skip link, live region, table captions/scope, table overflow containers | **AUTHORITY ALREADY DECIDED** | `FD-S-13` — binding implementation requirements, verified at the review gate |
| **X-07** | DS-37 final high-fidelity visual approval | **GENUINELY OPEN FOUNDER DECISION** | `OPEN-ST-06` |

### 2.7 AI (AI-01 … AI-03)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **AI-01** | Which of the 18 AI entry points launch | **FOUNDER DECIDED** | `FD-S-16` — **5 launch, 13 deferred**; no AI forced into every section |
| **AI-02** | AI grounding requires a manifest that does not exist | **FOUNDER DECIDED** | `FD-S-03` creates the manifest; `FD-S-16` sequences AI behind it |
| **AI-03** | Anonymous AI session length | **AUTHORITY ALREADY DECIDED** | Global Shell §10.2 sets the floor at one complete answer. PF-02 §77 experiment 13 stays an experiment, not a launch decision |

### 2.8 Commerce (C-01 … C-05)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **C-01** | Eligibility model and daily verification owner | **CONTENT/DATA OPERATIONS** | `FD-S-18` fixes the label rule; the eligibility inputs need provider data and an owner → `OPEN-ST-08` |
| **C-02** | Unconditional "Buy Tickets" label | **FOUNDER DECIDED** | `FD-S-18` — default is **`Where to Play`** |
| **C-03** | Adjacent affiliate disclosure | **FOUNDER DECIDED** | `FD-S-19` — footer/trust-page disclosure is insufficient |
| **C-04** | Provider inventory per state (ST-01/02/03 classification) | **CONTENT/DATA OPERATIONS** | → `OPEN-ST-08` |
| **C-05** | `/buynow/{code}` returns 200 not 302, and is crawlable | **ENGINEERING EXECUTION** | `FD-S-20` defers activation; `FD-S-34` requires it stay non-indexable |

### 2.9 Engineering (E-01 … E-04)

| ID | Prior question | Disposition | Resolves to |
|---|---|---|---|
| **E-01** | Introduce a test framework | **FOUNDER DECIDED** *(requirement)* | `FD-S-35` — seven named areas, required **before cross-State rollout**, not before the Florida preview. Framework choice is an engineering decision |
| **E-02** | State ad-baseline build-time guard | **FOUNDER DECIDED** | `FD-S-22` |
| **E-03** | Register the conflicts in `source-conflicts.md` | **ENGINEERING EXECUTION — COMPLETED by LRG-DEC-018** | 6 genuine conflicts registered as Conflicts 13–18; 14 of the original 20 were resolved by the rulings or were documentation errors rather than source conflicts |
| **E-04** | Correct stale documents | **ENGINEERING EXECUTION — PARTIALLY COMPLETED** | Count and framing corrections applied to the four State documents by LRG-DEC-018. `03-docs/17`, `03-docs/18` and `reuse-register.md` are outside this task's write scope and remain to be corrected |

### 2.10 Disposition tally

| Class | Count | Entries |
|---|---:|---|
| **FOUNDER DECIDED** | **34** | D-01, D-03, D-04, D-05, D-06, F-01, F-03, F-04, A-03, A-04, A-05, A-07, A-08, A-12, A-14, A-19, R-03, R-05, R-08, S-01, S-02, S-07, S-08, S-09, X-01, X-02, X-03, X-04, AI-01, AI-02, C-02, C-03, E-01, E-02 |
| **AUTHORITY ALREADY DECIDED** | **5** | S-03, S-04, S-05, X-06, AI-03 |
| **ENGINEERING EXECUTION** | **11** | F-02, A-09, A-10, R-09, R-10, R-12, R-13, R-14, C-05, E-03, E-04 |
| **CONTENT/DATA OPERATIONS** | **7** | D-02, D-07, D-08, D-09, S-06, C-01, C-04 |
| **SEO/INFRASTRUCTURE REVIEW** | **6** | R-01, R-02, R-04, R-06, R-07, R-11 |
| **GENUINELY OPEN FOUNDER DECISION** | **4** | A-01, A-17, X-05, X-07 |
| **AD-OPERATIONS VALIDATION** | **3** | A-02, A-06, A-16 |
| **DUPLICATE / MERGED** | **3** | A-13 → A-03; A-15, A-18 → `OPEN-ST-01` |
| **OBSOLETE** | **1** | A-11 |
| **Total** | **74** | every prior entry, exactly once |

*Sum check: 34 + 5 + 11 + 7 + 6 + 4 + 3 + 3 + 1 = **74**.*

`E-01` is FOUNDER DECIDED as a *requirement* (`FD-S-35`) while the framework choice inside it is
delegated to engineering — the requirement is the decision, so it is counted once, here.

The **4** genuinely open entries collapsed into **3** open decisions (`OPEN-ST-01`, `OPEN-ST-03`,
`OPEN-ST-06`); the remaining five arose from deferrals (`OPEN-ST-02`, `OPEN-ST-04`, `OPEN-ST-05`), the
global Member/Insider block (`OPEN-ST-07`), and content ownership (`OPEN-ST-08`).

**Update (LRG-ADS-020):** `A-17` and `A-01`'s Florida scope are resolved — `OPEN-ST-01` is **closed**,
leaving **7** open decisions. `OPEN-ST-03` survives as a cross-State rollout item only.

---

## 3. Remaining open founder decisions

**`OPEN-ST-01` is closed** (LRG-ADS-020). **Seven** remain, and **none blocks the guarded anonymous
Florida State preview.** Full statements in `ST-DEC-001` §3.

| ID | Open question | Needed from | Blocks which track |
|---|---|---|---|
| ~~**OPEN-ST-01**~~ | **CLOSED** by LRG-ADS-020. `APP-ST-01` … `APP-ST-06` decided: the PF-02 anchor model and Option A are approved **with a host-eligibility correction** — an empty-state shell is not an advertising host. **Minimum Florida profile = 10 active / 14 deferred is the implementation baseline**; four slots are conditional on S-14 / S-15 substantive real content, and are not relocated if their host fails | — *(decided)* | **nothing — the guarded Florida preview may begin** |
| **OPEN-ST-02** | State-specific ad units after evidence: the two Wyoming record-only slots, and the State `atv_video_player` | **Ad operations** | Rollout *(both stay disabled in the preview)* |
| **OPEN-ST-03** | `sp_toppromobar` 9-state gate — retain, extend, retire. **`fl` is not in the gate**, so this is **not a Florida-preview blocker** — excluding it is exact legacy parity | **Ad operations** + founder | Rollout only |
| **OPEN-ST-04** | No-fill behaviour, where legacy, recorded data and DS-24 disagree three ways | **Ad operations** | Rollout *(preview uses the DS-24 treatment)* |
| **OPEN-ST-05** | Canonical host · trailing slash · date-route form · `/fl-new` · `/play` vs `/buynow` · Apache/Cloudflare redirect audit | **SEO + infrastructure**, then founder | **Production route cutover only** |
| **OPEN-ST-06** | Final State visual approval (DS-37), the special-ball token values, and the four DS-DEC-001 §8 items | Founder | Preview → rollout transition |
| **OPEN-ST-07** | Signed-in / Insider State variants — 12 section IDs and 3 `AD-SS*` anchors | Founder | **Signed-in track only.** Already open globally as `source-conflicts.md` Conflict 3 |
| **OPEN-ST-08** | Content ownership and review cadence per governed fact group | **Content/data operations**, then founder for resourcing | Rollout · commerce |

**No remaining open decision blocks the Florida preview.** `OPEN-ST-01` closed with `APP-ST-01` …
`APP-ST-06`; every slot that depends on an ad-operations answer is **inactive** in the preview, so the
ten ad-operations questions run in parallel (`APP-ST-06`). The critical path is now the five Track 1
`FD-S-*` prerequisites, not advertising.

---

## 4. Blockers by track

Corrected from a single flat list. Full detail in `ST-DEC-001` §4.

| Track | Blockers |
|---|---|
| **1. Guarded Florida anonymous preview** | Synthetic publication gate (`FD-S-01`) · Florida's displayed formats governed (`FD-S-10`) · shared DS layer extraction started (`FD-S-12`) · State section manifest + resolver (`FD-S-04`) · Florida manifest entries (`FD-S-03`). **The advertising blocker is cleared** — `OPEN-ST-01` closed; implement the **Minimum profile (10 active slots)**, and enable a conditional slot only when its host section independently qualifies |
| **2. Cross-State rollout** | Route registry (`FD-S-30`) · ST-06 experience (`FD-S-31`) · per-state format verification (`FD-S-10`) · automated tests (`FD-S-35`) · content ownership (`OPEN-ST-08`) · `OPEN-ST-02`, `OPEN-ST-03`, `OPEN-ST-04`, `OPEN-ST-06` |
| **3. Production route cutover** | `OPEN-ST-05` in full · sitemap · `robots.txt` · schema projection · fragment alias evidence (`FD-S-33`) |
| **4. Signed-in / Insider State** | The 11 open Member/Insider decisions (Conflict 3) — `OPEN-ST-07` |
| **5. Commerce activation** | Eligibility model and provider inventory (`OPEN-ST-08`) · route decision (`OPEN-ST-05`) · adjacent disclosure implementation (`FD-S-19`) · the consent layer, which does not exist (DS-25) |

**Explicitly *not* blockers for the Florida preview:** the 101 undefined non-Florida formats · the 33
jurisdictions without fixtures · the 5 no-lottery jurisdictions · canonical host and trailing slash ·
sitemap and robots · the commerce route conflict · all signed-in sections · automated tests · complete
49-jurisdiction content · S-14 and S-15 (genuine sparse/cold-start hubs are compliant).

---

## 5. Review gates

| Gate | Owner | Must confirm |
|---|---|---|
| **G1** — anchor→slot distribution | ✅ **CLOSED** — LRG-ADS-020 | `APP-ST-01` … `APP-ST-06` decided; all 24 template-defined slots dispositioned per profile; Wyoming record-only units counted separately; protected zones respected (`FD-S-21`); no advertisement depends on an empty-state shell; the 20-invariant `assertStateAdBaseline()` specification accepted (`FD-S-22`) |
| **G2** — Florida preview content safety | Founder | No synthetic winner, unclaimed prize, claim deadline or tax rate renders as fact (`FD-S-01`); S-11/S-12/S-13 suppressed with recorded reasons (`FD-S-02`) |
| **G3** — Florida preview visual | Founder | **DS-37** desktop and mobile at all eight DS-19 widths; keyboard-only; forced colors; 200 % zoom; reduced motion; 320 px with no sticky conflict; special-ball tokens approved (`OPEN-ST-06`) |
| **G4** — cross-State rollout | Founder | Route registry enumerates correctly; ST-06 renders without implying an active lottery; no `if (stateCode === …)` introduced; game-local dates correct in non-Eastern zones; the seven `FD-S-35` test areas pass |
| **G5** — production route cutover | **Founder + SEO + Infrastructure** | `OPEN-ST-05` closed; redirect plan 1:1; no unrelated URL redirects to Home; no double-redirect chain; `lastmod` accurate; `/buynow/` non-indexable |
| **G6** — production readiness | Founder | The full `CLAUDE.md` §20 public-page pre-merge checklist |

---

## 6. What LRG-DEC-018 did not do

- Implemented nothing. No application code, fixture, route, advertisement, partner script or legacy
  file was touched.
- Did not modify `design-system-founder-decisions.md`, any blueprint, or any Home document.
- Did not correct `04-sample-data/ad-slot-definitions.json` — the provenance citation and the two
  resolvable "UNKNOWN" fields remain, registered as source Conflict 16 (`A-09`, `A-10`).
- Did not correct `03-docs/17`, `03-docs/18` or `reuse-register.md`, which are outside its write scope
  (`E-04`, partially open).
- Did not resolve `OPEN-ST-01` … `OPEN-ST-08`, and did not invent a canonical, route or GAM value.

**Recommended next task:** the **guarded Florida anonymous preview** scoped by `FD-S-36`. `OPEN-ST-01`
is closed and the advertising path is cleared, so the critical path is now the five `FD-S-*`
prerequisites in Track 1 — the synthetic publication gate, Florida format coverage, shared design-system
extraction, the section manifest and resolver, and the Florida State Content Manifest entries.
Implement the **Minimum Florida profile**; the ten ad-operations questions run in parallel and block
nothing (`APP-ST-06`).
