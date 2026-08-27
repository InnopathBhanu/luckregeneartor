# Implementation Sequence — Controlled Delivery Order

**Document type:** Decision record — approved implementation sequence
**Recorded by:** Task LRG-DEC-004
**Date:** July 25, 2026
**Status:** **APPROVED**
**Governing decisions:** `frontend-architecture-decision.md` (FE-ARCH-001) · `reuse-register.md` · root `CLAUDE.md`

---

## 0. How to Read This Sequence

- **Two tracks exist.** §1 is the **production sequence** (Phases 1–23). §1A is a separately labelled
  **accelerated preview track** (P1–P5) authorized July 25, 2026, which runs alongside Phases 3–8 and
  **replaces no production phase and satisfies no production gate**.
- **One phase at a time.** Root `CLAUDE.md` §17 requires each task to stop on completion and never begin the next automatically.
- **Phases are dependency-ordered, not merely numbered.** A phase MUST NOT start while a blocking decision above it is open.
- **"Code changes allowed" is per phase**, and a task may still narrow it further.
- **Review gate** means the phase is not complete until that review passes.
- Phases 3–19 each end with a founder review; Global Shell v1.1 §0.1 requires **desktop and mobile high-fidelity review and founder approval for every page family** before implementation is considered complete.

### Standing rule — ad inventory precedes implementation

> **A page family's production GAM ad inventory MUST be captured and approved before that page family is implemented.**

Only the **state** (`lc_sp_*`, 19 slots + 4 mobile snippets) and **home** (`lc_hp_*`, 21 slots) families are enumerated today — 47 slot definitions total. The slot families for **game** (`lc_mgp_*` / `lc_mpg_*`), **blog/editorial** (`lc_bp_*`, `lc_bdp_*`), **jackpot** (`lc_jp_*`), and **game history** (`lc_gh_*`) are *named but not captured*, and `promotionalbar_test` (1920×75) is unverified. They must be read from the legacy JSPs first. This gates phases 12, 14, 15, 16, 17 and 18.

---

## 1. Phase Table

### Phase 1 — Governance and source control ✅ COMPLETE

| | |
|---|---|
| **Primary authority** | Founder instruction |
| **Inputs** | Existing repository |
| **Output** | Git baseline `191013b`; 24 governed documents imported; `source-authority.md`, `source-conflicts.md`; rewritten root `CLAUDE.md` (`92d77ea`) |
| **Code changes** | No |
| **Blocking decisions** | None |
| **Review gate** | Complete — tasks LRG-CTL-002, LRG-CTL-002A, LRG-GOV-003 |

### Phase 2 — Frontend architecture and reuse decision ✅ THIS TASK

| | |
|---|---|
| **Primary authority** | Frozen Constitution; Experience Architecture v1.1; Global Shell v1.1; page-family blueprints; `CLAUDE.md` |
| **Inputs** | LRG-AUD-001 findings, verified against the repository |
| **Output** | `frontend-architecture-decision.md`, `reuse-register.md`, this document |
| **Code changes** | **No** |
| **Blocking decisions** | None |
| **Review gate** | Founder confirmation that Option B and the 71 artifact classifications are accepted |

### Phase 3 — Shared design-system specification

| | |
|---|---|
| **Primary authority** | **Global Shell v1.1** (§143–147 accessibility; §122 ad system; §0.1 visual-reference boundary) + the approved State-page style reference PDFs (style only) |
| **Inputs** | `app/globals.css` (18 existing tokens); blueprint SVGs; `05-design-inputs` proposed PDFs; `ad-slot-definitions.json` size maps |
| **Output** | A specification document under `03-docs`: color tokens with light/dark treatment, type scale, spacing scale, breakpoint set, ball/special-ball token semantics with non-color distinctions, focus/contrast/reduced-motion rules to WCAG 2.2 AA, ad-slot reservation and no-fill appearance, and the shared section-ID taxonomy |
| **Code changes** | **No** — specification only |
| **Blocking decisions** | **992 px GAM tier vs 1024 px Tailwind `lg`** must be resolved here (see §2). Final styling is *not* approved by Global Shell approval — this phase produces the proposal for founder approval |
| **Review gate** | Founder approval of tokens, type scale, breakpoints and accessibility targets |

### Phase 4 — Shared shell specification

| | |
|---|---|
| **Primary authority** | **Global Shell v1.1** (§0.2 twelve binding reuse outcomes; §3.2 navigation-language contract; §6.1–6.5 mobile nav, sticky-conflict, state-context precedence; §7 unified Search and Ask; §10.5 AI-everywhere; §11 user-state shells; §142.1 public language contract) |
| **Inputs** | Approved design system (Phase 3); `footer-config.json`; existing shell components as reference |
| **Output** | Shell specification: header, mobile top app bar and bottom navigation, Search/Ask entry, anonymous / signed-in / Insider shell states, contextual AI entries, trust and correction surfaces, section taxonomy and IDs, metadata contract |
| **Code changes** | **No** |
| **Blocking decisions** | Navigation label testing per §3.2 (`Community`/`Forums`, `My LotteryCorner`/`Insider`, long/short AI labels) — record as proposals, do not finalize wording unilaterally. Member/Insider shell *entitlement* behavior stays out of scope (11 decisions open) |
| **Review gate** | Founder approval of the shell model, desktop and mobile |

### Phase 5 — Shared shell implementation

| | |
|---|---|
| **Primary authority** | Approved shell specification (Phase 4) |
| **Inputs** | Phases 3–4 |
| **Output** | Implemented shell in `01-new-ui`: header, mobile navigation, footer, trust surfaces, shared page-composition primitives (right rail, top-ad band, `asArr`) |
| **Code changes** | **Yes** — `01-new-ui/components/layout/**`, `app/layout.tsx`, `app/globals.css`, shared primitives |
| **Blocking decisions** | Header nav currently links to four 404 routes — either implement the targets in later phases or render them per the approved registry state. Do not create routes to satisfy the nav |
| **Review gate** | Desktop + mobile review; WCAG 2.2 AA checks; no sticky conflict at 375 px |

### Phase 6 — Home Page exact specification and responsive wireframes

| | |
|---|---|
| **Primary authority** | **BP-02 Home blueprint v1.1** (PF-01) |
| **Inputs** | Phases 3–5; the 33 BP-02 section IDs incl. signed-in variants; **Home ad-inventory audit** (21 `lc_hp_*` slots, already enumerated) |
| **Output** | Section-by-section Home specification with anonymous and signed-in sequences, protected ad zones, Section Intelligence Matrix entries, and desktop + mobile wireframes |
| **Code changes** | **No** |
| **Blocking decisions** | Mobile ad distribution must be specified here (current implementation stacks four 320×50 units at page bottom). `hp_video` is unmapped |
| **Review gate** | Founder approval of section order, ad placement and both user states |

### Phase 7 — Home Page fixture / view-model contract

| | |
|---|---|
| **Primary authority** | Approved Home specification (Phase 6) |
| **Inputs** | `home-page-sample.json`; existing `types.ts` game-domain shapes |
| **Output** | Typed Home view model + transformed fixture, with provenance and synthetic/production-derived declarations |
| **Code changes** | **Yes** — `01-new-ui/lib` types; `04-sample-data/home-page-sample.json` |
| **Blocking decisions** | **Fixtures MUST NOT become API contracts** and MUST NOT determine route existence. Synthetic-content publication protection must be in place |
| **Review gate** | Type check clean; every field traceable to a specification section |

### Phase 8 — Home Page implementation

| | |
|---|---|
| **Primary authority** | Phases 6–7 |
| **Inputs** | Phases 3–7 |
| **Output** | Home rebuilt from BP-02 |
| **Code changes** | **Yes** — `app/page.tsx`, Home composition components |
| **Blocking decisions** | All 21 home GAM slots preserved by `slotKey`; the unconsumed-ad flush guard retained |
| **Review gate** | Desktop + mobile review; public-page pre-merge checklist (`CLAUDE.md` §20); ad slots present with reserved dimensions |

### Phase 9 — State Page exact specification

| | |
|---|---|
| **Primary authority** | **BP-03 State blueprint v1.1** (PF-02) |
| **Inputs** | Phases 3–5; the 31 BP-03 section IDs; **State ad-inventory audit** (19 + 4 slots enumerated; **13 slots currently unmapped**) |
| **Output** | Section-by-section State specification, anonymous and signed-in, with a section-order contract rather than hardcoded order |
| **Code changes** | **No** |
| **Blocking decisions** | The 13 unmapped slots must be resolved with ad ops. State-context precedence (Global Shell §6.5) applies. Wyoming's in-results-table slots have no mapping or visual evidence |
| **Review gate** | Founder approval; explicit confirmation that no currently-rendered content is lost by omission |

### Phase 10 — State fixture / view-model transformation

| | |
|---|---|
| **Primary authority** | Approved State specification (Phase 9) |
| **Inputs** | 16 state fixtures; `states-config.json`; `result-format-definitions.json` |
| **Output** | Typed State view model; 16 transformed fixtures; unified schema version; reconciled canonical placeholders; refreshed timestamps |
| **Code changes** | **Yes** — `01-new-ui/lib` types; `04-sample-data/state-*.json` |
| **Blocking decisions** | Result-format coverage is **11 of 112** gameIds — expanding it is data work in this phase or a parallel data task. Timestamps are frozen at July 8–9 2026 |
| **Review gate** | Type check clean; provenance declared per fixture; no synthetic content presented as fact |

### Phase 11 — State Page implementation

| | |
|---|---|
| **Primary authority** | Phases 9–10 |
| **Inputs** | Phases 3–10 |
| **Output** | State pages rebuilt from BP-03, one shared template, data-only differences preserved |
| **Code changes** | **Yes** — `app/[state]/page.tsx`, State composition components |
| **Blocking decisions** | **Route registry must replace filesystem-derived params before or during this phase** — see §2. Existing `/{state}` URLs MUST be preserved |
| **Review gate** | Desktop + mobile review; pre-merge checklist; ad slots preserved; 16 states render with no state-specific branching in shared components |

### Phase 12 — Flagship Game Page specification and Powerball implementation

| | |
|---|---|
| **Primary authority** | **BP-04 index v1.1** (architecture, ownership rule, canonical/URL audit rule) + **BP-04A Flagship v1.1** |
| **Inputs** | Phases 3–5; **game-family ad inventory capture (`lc_mgp_*` / `lc_mpg_*`) — NOT YET DONE** |
| **Output** | Flagship specification; `/powerball` implemented with its draw records (main draw, Power Play attached to the main draw, Double Play as a separate drawing) |
| **Code changes** | **Yes** — new route, new components, fixtures |
| **Blocking decisions** | **Game ad inventory must be captured first.** `/play/{game}` vs `/buynow/{code}` affects the Buy CTA — see §2. Route addition follows the BP-04 §6 URL audit |
| **Review gate** | Desktop + mobile review; ad inventory approved; pre-merge checklist |

### Phase 13 — Mega Millions adaptation

| | |
|---|---|
| **Primary authority** | BP-04A |
| **Inputs** | Phase 12 |
| **Output** | `/mega-millions` from the same flagship template |
| **Code changes** | **Yes** — fixtures and any template generalization |
| **Blocking decisions** | Mega Millions current-format draws have **no draw-level multiplier** (it is assigned per ticket play at purchase) — the model must not force a shared multiplier |
| **Review gate** | Desktop + mobile review; confirms the flagship template generalizes without game-specific branching |

### Phase 14 — Jurisdiction Game Page

| | |
|---|---|
| **Primary authority** | **BP-04B Jurisdiction v1.1** |
| **Inputs** | Phases 9–13; game-family ad inventory |
| **Output** | `/{state}/{game}` for minimal flagship offerings and state-native games |
| **Code changes** | **Yes** |
| **Blocking decisions** | Ownership rule: shared game facts belong to the flagship; local claims, taxes, winner rules, local news and community belong to the jurisdiction page. Closed and ignored game URLs must stay reachable per legacy business rules |
| **Review gate** | Desktop + mobile review; existing `/{state}/{game}` URLs preserved |

### Phase 15 — Yearly Results Archive

| | |
|---|---|
| **Primary authority** | **BP-06** research v1.1, blueprint v1.0, content template v1.0 |
| **Inputs** | Phases 12–14; **history-family ad inventory (`lc_gh_*`) — NOT YET DONE** |
| **Output** | `/{state}/{game}/{year}` and `/{game}/{year}` |
| **Code changes** | **Yes** |
| **Blocking decisions** | **Largest indexed surface (~8,700 URLs)** — highest SEO risk of any phase. Year MUST reflect the **game-local** draw date, not an EST-shifted date. The legacy `redirectToLatest` self-canonicalizing behavior must be preserved. Sitemap index split required |
| **Review gate** | Desktop + mobile review; crawlability verified; `Dataset` schema justified if used; sitemap `lastmod` correct |

### Phase 16 — Tools Hub and a representative tool

| | |
|---|---|
| **Primary authority** | **BP-04C Tools and AI Insights v1.1** |
| **Inputs** | Phases 3–5, 12–14; ad inventory for tool pages |
| **Output** | `/tools` plus one complete tool, with public / sign-in / Insider access patterns |
| **Code changes** | **Yes** |
| **Blocking decisions** | No ad between tool input and output. Public value must be complete before any gate. Insider-gated depth is blocked by the open Member/Insider decisions |
| **Review gate** | Desktop + mobile review; non-predictive copy verified; ad protection verified |

### Phase 17 — News Hub and News Article

| | |
|---|---|
| **Primary authority** | **BP-07** research v1.1, `07A` Hub v1.0, `07B` Article v1.0, `07C` content template v1.0 |
| **Inputs** | Phases 3–5; **editorial ad inventory (`lc_bp_*`, `lc_bdp_*`) — NOT YET DONE** |
| **Output** | `/news` and article pages with reporter identity, correction timeline and protected ad zones |
| **Code changes** | **Yes** |
| **Blocking decisions** | Legacy blog/news URLs must be inventoried first; two legacy blog templates exist and which is canonical is an open question. `NewsArticle` schema only for real editorial content — **no fabricated news** |
| **Review gate** | Desktop + mobile review; correction surface present; pre-merge checklist |

### Phase 18 — Community Home, Forum Entry, public profile and reputation

| | |
|---|---|
| **Primary authority** | **BP-08** research v1.1, `08A` Home v1.0, `08B` Forum Entry v1.0, `08C` Profile/Reputation v1.0, `08D` content/schema template v1.0 |
| **Inputs** | Phases 3–5; community ad inventory |
| **Output** | `/community`, `/community/{forum-entry-slug}`, `/members/{username}` |
| **Code changes** | **Yes** |
| **Blocking decisions** | **Community content MUST be human-authored — no fabricated posts, threads, replies, reputation or activity.** AI contributions must be clearly identified and must never appear human. Community ads must be clearly separated from posts. `DiscussionForumPosting` schema where justified. Requires a real user-state model from Phase 5 |
| **Review gate** | Desktop + mobile review; moderation and safety surfaces present; no synthetic community activity |

### Phase 19 — Remaining Member/Insider founder decisions

| | |
|---|---|
| **Primary authority** | **Founder decision** (tier 1), then `09-…-member-and-insider-…` once it moves out of `pending/` |
| **Inputs** | The 11 open Part 22 decisions |
| **Output** | Closed decisions recorded as an approved decision record; the blueprint reclassified from pending |
| **Code changes** | **No** until decisions close |
| **Blocking decisions** | **All 11.** Decision 11 (source-package correction) is already closed. Decision 1 touches the `/insider` route; decision 3 touches GAM ad treatment; decision 7 touches export rights; decision 12 touches legacy copy remediation |
| **Review gate** | Founder sign-off per decision; `source-conflicts.md` Conflict 3 updated |

### Phase 20 — UI data-contract stabilization

| | |
|---|---|
| **Primary authority** | Approved page specifications from phases 6–18 |
| **Inputs** | All implemented view models |
| **Output** | A consolidated UI data contract separating **domain data · presentation view models · provenance · freshness · entitlement · advertising · commerce** |
| **Code changes** | **Yes** — types and the data-provider seam only |
| **Blocking decisions** | Entitlement shape depends on Phase 19 |
| **Review gate** | Contract review; confirms no fixture shape leaked in as a domain contract |

### Phase 21 — Spring Boot API architecture and implementation

| | |
|---|---|
| **Primary authority** | Stabilized UI contract (Phase 20) + a dedicated approved API task |
| **Inputs** | Phase 20; `reference-tables/schema-only.sql`; `source-xml/latest-results-lc.xml`; `payout-sample.json` |
| **Output** | API architecture then implementation in `02-new-api` |
| **Code changes** | **Yes** — `02-new-api` only |
| **Blocking decisions** | `02-new-api` MUST remain untouched until this phase is approved. Domain design MUST NOT be derived from old page JSON |
| **Review gate** | Contract conformance; the data-provider swap changes only the provider module |

### Phase 22 — Target database design

| | |
|---|---|
| **Primary authority** | Phase 21 |
| **Inputs** | Real production schema (`luckydb`, 37 tables); result-format and timezone rules |
| **Output** | Target schema and migration design |
| **Code changes** | **Yes** — API/DB scope only |
| **Blocking decisions** | Must support date-effective result formats and game-local draw-date semantics |
| **Review gate** | Schema review against the format and timezone rules |

### Phase 23 — Legacy migration and cutover

| | |
|---|---|
| **Primary authority** | Founder decision + route/canonical decisions from §2 |
| **Inputs** | All prior phases; legacy route inventory; Apache/Cloudflare redirect audit |
| **Output** | Migration and cutover plan, then execution |
| **Code changes** | **Yes** — infrastructure scope |
| **Blocking decisions** | Canonical host + trailing slash; the Apache/Cloudflare redirect audit; 1:1 redirect map; `/buynow` vs `/play` resolution; IndexNow adoption |
| **Review gate** | Founder approval; redirect map verified 1:1; no unrelated URL redirected to Home |

---

## 1A. Accelerated Preview Track (Parallel — Does NOT Replace or Reorder the Production Sequence)

**Authorized by:** founder decision, July 25, 2026 — `home-preview-track-decision.md` (PREVIEW-DEC-001)
**Design decisions applied:** `design-system-founder-decisions.md` (DS-DEC-001), DS-01 … DS-29

> **This track runs alongside Phases 3–8. It replaces no phase, reorders no phase, and satisfies no production review gate.**
> The preview is authorized to accelerate founder visual feedback. It does not bypass the approved architecture, ad
> inventory, route, SEO, accessibility or production-readiness gates. **The preview is not production approval.**

### Preview Track P1 — Founder design decision lock ✅ COMPLETE

| | |
|---|---|
| **Primary authority** | Founder decision (Tier 1); Global Shell v1.1 §154 (which reserved exact styling for decisions like this) |
| **Inputs** | Task LRG-DS-005 design-system package |
| **Output** | `design-system-founder-decisions.md` (37 decisions); `home-preview-track-decision.md`; founder checklist updated (31 of 35 items decided) |
| **Code changes** | **No** |
| **Blocking decisions** | None — this step resolved them |
| **Review gate** | Complete — Task LRG-DEC-006 |

### Preview Track P2 — Shared Shell and Home Preview Specification

| | |
|---|---|
| **Primary authority** | Global Shell v1.1 §0.2 binding reuse outcomes; **Home Page Blueprint BP-02 v1.1**; DS-01 … DS-29 |
| **Inputs** | P1 decisions; design-system specification; component visual contracts; `reuse-register.md` classifications; `ad-slot-definitions.json` (Home slots already enumerated) |
| **Output** | One combined specification covering the shared shell (anonymous state) **and** the Home preview: token values resolved per DS-01/DS-02/DS-03/DS-04, the approved BP-02 anonymous section sequence, ad-anchor positions, and the **desktop and mobile representative examples required by checklist N-01** — anonymous shell, result card with special-ball non-colour distinctions, filled ad container, **no-fill** ad container, labelled inactive sticky reservation ordered against bottom navigation, correction notice, labelled AI entry |
| **Code changes** | **No** |
| **Blocking decisions** | None for the preview. Sticky-ad production height stays deferred (DS-26/DS-34) — the specification uses the labelled inactive reservation per DS-27. Signed-in Home sequence (`H-01S`…`H-08S`) is out of scope |
| **Review gate** | **Founder review of this specification is required before P3 begins** |

### Preview Track P3 — Browser-rendered Home preview

| | |
|---|---|
| **Primary authority** | Approved P2 specification |
| **Inputs** | P2; existing `01-new-ui`; sample fixtures via the data-provider seam |
| **Output** | One browser-rendered Home preview inside the **existing** `01-new-ui` |
| **Code changes** | **Yes — task-scoped to `01-new-ui` only** |
| **Blocking decisions** | **No production route, canonical, sitemap, robots, affiliate-destination or GAM change.** Partner scripts stay disabled (DS-22, DS-25). Sample data only. No API or database work. No dependency installation. No Member/Insider implementation. No dark mode, brand font, icon library or logo change |
| **Review gate** | Must be **fully reversible** — a single revertible commit, diffable against baseline `191013b`. Validated at 320/375/390/768/992/1024/1280/1440 px (DS-19), keyboard-only, with reduced motion, and **with all ad slots unfilled** |

### Preview Track P4 — Founder visual review

| | |
|---|---|
| **Primary authority** | Founder decision; Global Shell v1.1 §0.1 (desktop **and** mobile review required per page family) |
| **Inputs** | P3 preview |
| **Output** | Recorded founder feedback: approve, adjust or reject per visual decision |
| **Code changes** | **No** |
| **Blocking decisions** | A desktop-only review does **not** satisfy the gate |
| **Review gate** | Founder sign-off means "this visual direction is right" — **not** "this page may go live". Final high-fidelity approval remains deferred (DS-37) |

### Preview Track P5 — Feed approved adjustments back into the production sequence

| | |
|---|---|
| **Primary authority** | Founder decision from P4 |
| **Inputs** | P4 feedback |
| **Output** | Approved adjustments merged into the Phase 3 design-system specification, Phase 4 shell specification and Phase 6 Home specification; any new conflicts recorded in `source-conflicts.md` |
| **Code changes** | **No** |
| **Blocking decisions** | **P5 is the only path by which preview learnings enter the production sequence.** Nothing from P3 is promoted to production by default |
| **Review gate** | Production phases retain their own gates: Phase 5 (shell implementation) and Phase 8 (Home implementation) are **not** satisfied by P3 |

### Relationship to the production sequence

| Production phase | Effect of the preview track |
|---|---|
| **Phase 3** — design-system specification | P1 supplies the founder decisions this phase was waiting on. Four items remain open (B-02, B-03, T-04, S-05) |
| **Phase 4** — shell specification | **Unblocked** by P1 (C-01…C-04, X-01 all cleared). P2 may be merged into it at P5 |
| **Phase 5** — shell implementation | **Unblocked** by P1 (A-04, S-02, S-03, N-01, B-01 cleared). **P3 does not satisfy this phase** |
| **Phase 6** — Home exact specification | P2 informs it; may be merged at P5 |
| **Phase 8** — Home implementation | **P3 does not satisfy this phase.** A-03 (sticky height) remains deferred and still blocks it |
| **Phases 9–23** | Unaffected |

---

## 2. Unresolved Implementation Dependencies

**Recorded, not resolved.** None of these may be settled inside a page-implementation task.

**Status updated July 25, 2026** by `design-system-founder-decisions.md` (DS-DEC-001). Dependencies **5** and the no-fill portion of the advertising question are now **decided as frontend decisions, pending ad-operations validation**. Everything else below remains open.

| # | Dependency | Owner | Resolving phase / task | Status | Consequence if unresolved |
|---|---|---|---|---|---|
| 1 | **Canonical host and trailing-slash migration** — target is non-`www` without trailing slash; production uses `www`; fixtures carry two conflicting placeholder forms | Founder + SEO | Canonical migration task, before Phase 23 | 🔶 **OPEN** | No canonical can be emitted; the pre-merge checklist cannot fully pass |
| 2 | **Apache and Cloudflare redirects** — edge behavior is the current source of truth; no redirect map exists in this repository | Founder + infrastructure | Redirect audit task, before Phase 23 | 🔶 **OPEN** | Next.js redirects risk double-redirect chains. Note Next already applies a default trailing-slash 301 while legacy served both forms |
| 3 | **Route registry vs fixture-derived routes** — `readdirSync` currently determines which public URLs exist | Frontend architecture | Route registry task, before/with Phase 11 | 🔶 **OPEN** | A fixture rename silently removes a public URL |
| 4 | **`/play/{game}` vs `/buynow/{code}`** — BP-04 §4 approves `/play/{game}`; the implementation and legacy both use `/buynow` | Founder + commerce | Route + commerce task, before Phase 12 | 🔶 **OPEN** | Commerce CTAs cannot be finalized on any game page |
| 5 | **992 px GAM breakpoint vs 1024 px layout breakpoint** — ad reservation flips at 992 px, Tailwind `lg` at 1024 px, leaving a 32 px mismatch band | Design system + ad ops | **Phase 3** | ✅ **DECIDED — DS-20** (992 px named threshold). Ad-operations confirmation after live-ad testing still required | Reserved ad height and layout disagree between 992–1023 px |
| 6 | **Sticky-ad mobile creative and reservation behavior** — `AdSlot` deliberately reserves 320×50 while the slot's GAM mapping includes 336×280 | Ad ops | Ad-ops confirmation, before Phase 8 | 🔶 **OPEN — DS-26, DS-34 DEFERRED.** Still blocks Phase 8 | If GAM serves 336×280 the bar under-reserves by ~230 px, breaking clearance |
| 7 | **13 unmapped ad slots** — defined in production inventory but referenced by no fixture | Ad ops | State ad audit, **Phase 9** | 🔶 **OPEN** — DS-21 reaffirms all inventory is preserved; mapping still required | Slots that may be live in GAM currently render no container — silent revenue loss |
| 8 | **Uncaptured game, history, jackpot and editorial ad families** — `lc_mgp_*`/`lc_mpg_*`, `lc_gh_*`, `lc_jp_*`, `lc_bp_*`/`lc_bdp_*`, plus unverified `promotionalbar_test` | Ad ops + legacy read | Per-family ad audits, before Phases 12, 15, 16, 17, 18 | 🔶 **OPEN** | Those page families cannot be implemented without losing inventory |
| 9 | **Node version pinning** — README requires Node 24; no `engines`, `.nvmrc` or CI pin; shell Node is v16.14.2 | Frontend | Foundation hardening task, before Phase 5 | 🔶 **OPEN** | Install and build behavior is unenforced and unverified |
| 10 | **Missing tests and CI** — zero tests, no framework, no workflow; `eslint.ignoreDuringBuilds: true` | Frontend | Test infrastructure task, before/with Phase 5 | 🔶 **OPEN** | Ad reservation, `cleanCopy`, campaign selection and format fallback stay unverified |
| 11 | **Incomplete result-format coverage** — 11 of 112 referenced gameIds have definitions | Data | Data coverage task, with Phase 10 | 🔶 **OPEN** | 101 gameIds render through an untested fallback path |
| 12 | **Synthetic fixture publication protection** — synthetic winners, deadlines, jackpots and tax guidance currently render as clean production-style copy with no marker | Frontend + content | Fixture safety task, before any non-local deployment | 🔶 **OPEN** | Risk of publishing invented lottery facts |
| 13 | **11 open Member/Insider decisions** (Part 22; decision 11 closed) | **Founder** | **Phase 19** | 🔶 **OPEN** | Member, insider, paid tier, quotas, exports, ticket records, public badges, Insider ad treatment and promotional pauses all stay unimplementable |
| 14 | **Production no-fill behaviour where ad operations require a different treatment** — DS-24 approves collapse-inner-creative / retain-outer-geometry as the default | **Ad ops** | Ad-operations review, before Phase 8 | 🔶 **OPEN — DS-36 DEFERRED** | Preview may use the approved default; production treatment could differ |
| 15 | **Page-family-specific ad volume** — ad-anchor activation and density | Founder + ad ops | Per-page-family blueprint review | 🔶 **OPEN — DS-35 DEFERRED** | Per-family ad density cannot be finalized |
| 16 | **Final high-fidelity visual approval** — required per page family, desktop and mobile | Founder + design | Per-page-family visual review; Preview Track P4 | 🔶 **OPEN — DS-37 DEFERRED** | No page family is implementation-complete without it |

---

## 3. Sequence Consistency Validation

| Check | Result |
|---|---|
| Design-system work precedes shell and page implementation | ✅ Phase 3 → Phase 4 → Phase 5 → Phases 6+ |
| Shell precedes page families | ✅ Phase 5 precedes Phases 6–18; Global Shell §0.2 binds shell reuse into every page family |
| Specification precedes fixtures, fixtures precede implementation | ✅ 6→7→8 for Home; 9→10→11 for State |
| API follows stabilized UI contracts | ✅ Phase 20 → 21 → 22; `02-new-api` untouched until Phase 21 |
| Database follows API | ✅ Phase 22 after 21 |
| Migration last | ✅ Phase 23, gated on the canonical and redirect decisions |
| Ad inventory precedes each page family | ✅ Stated as a standing rule; Home and State enumerated, phases 12/15/16/17/18 explicitly gated |
| Member/Insider blocked, not sequenced early | ✅ Phase 19; no earlier phase implements it |
| No phase resolves a deferred conflict implicitly | ✅ All 13 dependencies have a named owner and resolving phase |
| Every phase has authority, inputs, output, code-change flag, blockers, review gate | ✅ All 23 phases |
