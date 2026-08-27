# Frontend Architecture Decision — Retain and Selectively Refactor `01-new-ui`

**Document type:** Architecture decision record (ADR)
**Decision ID:** FE-ARCH-001
**Recorded by:** Task LRG-DEC-004
**Date:** July 25, 2026
**Status:** **APPROVED — current architecture decision**
**Supersedes:** the informal Option-B conclusion held only in the LRG-AUD-001 audit response
**Companion records:** `reuse-register.md`, `implementation-sequence.md`, `source-authority.md`, `source-conflicts.md`

**Primary authority:** `00A-v2.1-luckregenerator-product-constitution-FROZEN.md` (v2.1, frozen) · `01-lotterycorner-experience-architecture-FINAL-APPROVED.md` (v1.1) · `02-global-shell-and-section-library-blueprint-FINAL-APPROVED.md` (v1.1) · page-family blueprints BP-02 … BP-08D · root `CLAUDE.md`

---

## 1. Decision

**Retain `01-new-ui` as the target frontend foundation and selectively refactor it in place under controlled, individually approved tasks.**

Specifically:

| # | Decision | Binding force |
|---|---|---|
| 1 | `01-new-ui` **is retained** as the single target frontend. | MUST |
| 2 | It is **refactored in place**, task by task, each task individually scoped and approved. | MUST |
| 3 | **No parallel frontend application** is created — no `01-new-ui-v2`, no second Next.js app, no monorepo restructuring, no workspace layer. | MUST NOT |
| 4 | `01-new-ui` is **not moved or renamed.** | MUST NOT |
| 5 | **The framework is not changed during page-implementation work.** Framework changes require a dedicated architecture task. | MUST NOT |
| 6 | **Next.js App Router + React + TypeScript + Tailwind is retained** unless a dedicated architecture task demonstrates it cannot meet an approved requirement. | MUST |
| 7 | Verified stack: Next.js `^15.5.4`, React `^19.1.0`, TypeScript `^5.9.2` with `strict: true`, Tailwind `^4.1.13`, three runtime dependencies. | Recorded fact |

### What this decision explicitly does NOT approve

The existing **Home composition, State composition, shell (header / mobile nav / footer / ticker / tabs), route surface, and fixture/view-model contracts are NOT approved architecture.** They were built against superseded requirements and are reference implementations only. Retaining the *project* is not approval of its *pages*.

Per root `CLAUDE.md` §2: approval is never inferred from the existence of code.

---

## 2. Context

### Why full continuation is unsafe

Verified against the repository, not assumed:

- **The blueprints define a user-state transformation the implementation does not have.** The Home blueprint defines **33 section IDs** and the State blueprint **31**, both including explicit signed-in variants (`H-01S` "My Lottery Day", `H-02S` "Followed Results…", and the `S-*S` series). A repository-wide search for signed-in state in `01-new-ui` returns **four matches, all of which are code comments**. There is no user-state model, no session, and no signed-in branch. `AccountHooks` renders three permanently `disabled` buttons.
- **Route surface covers a fraction of production.** Three routes exist (`/`, `/{state}`, `/buynow/{code}`) serving 17 URLs, against a legacy production sitemap of ~9,246 — of which roughly 8,700 are yearly-archive URLs that are entirely unbuilt. Six approved page families (games, archives, news, community, tools, plus the pending insider family) have no routes at all.
- **Routes are derived from the filesystem.** `lib/data-provider/index.ts:57` calls `readdirSync` over `04-sample-data`, and `app/[state]/page.tsx:15` feeds that into `generateStaticParams`. Renaming or removing a fixture file silently removes a public URL — unacceptable under the route-preservation rules.
- **Page section order is hardcoded in JSX**, not configuration. `StatePageTemplate` still self-describes in its header comment as "Florida state page — follows the proposed PDF section flow", a design source now downgraded to **style reference only**.
- **No tests and no CI.** Zero test files, no framework, no test script, no workflow. The ad-slot reservation math, `cleanCopy`, campaign selection, and the result-format fallback are entirely unverified.
- **Governance gaps in the build.** `next.config.mjs:6` sets `eslint: { ignoreDuringBuilds: true }` and `package.json` has **no `engines` field**, while the README requires Node 24.

### Why full recreation is unnecessary

- **Coupling is loose, not tight.** All 16 state pages share **one** template with **no `if (stateCode === …)` branching anywhere**. Differences are data-only. State-specific references are shallow: two disabled Florida-only `<select>` elements, two fallback copy strings, one stale comment.
- **Legacy isolation is already clean.** A repository-wide grep for `00-reference` / `LotteryCorner40` inside `01-new-ui` source returns **0 matches**. Legacy knowledge arrived by transcription into `03-docs` and `04-sample-data` with recorded provenance — the correct pattern, and one recreation would have to redo.
- **The data seam already exists.** `lib/data-provider/index.ts` is the only module that knows data comes from files. Swapping to an API client is a single-file change.
- **The most valuable assets are not UI-shaped** and would survive recreation unchanged — meaning recreation buys nothing for them while risking their loss.
- **The codebase is small:** 3,048 lines of TS/TSX/CSS across 57 repo-owned files, with three runtime dependencies. There is little inertia to fight.

### Which infrastructure is decoupled and valuable

`ad-slot-definitions.json` (47 slots, 12 GAM size maps, div IDs, transcribed verbatim from production JSPs) · the space-reserving, lazy-ready `AdSlot` / `AdSlotView` pair · `cleanCopy` · `JsonLd` · env-gated `PartnerScripts` · the format-driven `DynamicResultCard` / `BallGroup` / `MultiplierBadge` trio · the campaign placement-allowlist framework · the data-provider seam · `footer-config.json` and the production-derived reference data in `04-sample-data`.

### Which page-level assumptions are superseded

Home section sequence · State section sequence and its ~25 hardcoded optional modules · shell composition and navigation labels · the 36-key state fixture schema (a JSON transcription of the previous Layer A + Layer B module matrix) · the anonymous-only user model · `states-config.json`, which describes 5 states while 16 render.

### How Git protects reversible migration

The root repository is now Git-controlled with a **pre-blueprint baseline at `191013b`** capturing all 145 project files before any blueprint-driven change. Every subsequent refactor is diffable against, and revertible to, that baseline. This is what makes in-place refactoring safe and makes "archive and recreate" unnecessary as a safety measure. The nested legacy repository remains independent and excluded.

---

## 3. Options Considered

### Option A — Continue the existing UI largely as-is

| | |
|---|---|
| **Benefits** | Fastest to visible output. No rework of Home or State. Preserves all existing work without analysis. |
| **Risks** | Ships a page architecture with no signed-in state against blueprints that require one across 33 Home and 31 State sections. Leaves routes derived from fixture filenames. Entrenches a fixture schema that encodes superseded requirements. Leaves zero test coverage over revenue-critical ad logic. Would require rebuilding pages a second time once the blueprints were applied. |
| **Evidence** | 33 Home / 31 State blueprint section IDs vs. 0 signed-in branches; `readdirSync`-derived `generateStaticParams`; 36-key fixture union mirroring `03-docs/09`/`10`; 0 test files. |
| **Outcome** | **REJECTED.** Fails the test in root `CLAUDE.md` §6 — old page composition must not be preserved merely because it exists. Four of the six health criteria for this option (routes, tests, separation of old requirements, shell) fail on verified evidence. |

### Option B — Selective reuse

| | |
|---|---|
| **Benefits** | Preserves irreplaceable transcribed ad inventory and the working infrastructure layer. Rebuilds exactly what the blueprints govern. Keeps one application, one dependency tree, one history. Refactoring is incremental, diffable, and revertible against `191013b`. |
| **Risks** | Requires disciplined per-artifact classification to avoid quietly carrying superseded composition forward. Mixed-state periods where new and old composition coexist must be managed by task scoping. Mitigated by the reuse register and the phased sequence. |
| **Evidence** | Loose coupling (one template, 16 states, no state branching); clean legacy isolation (0 coupling matches); existing data seam; small surface (3,048 LOC, 3 runtime deps); valuable non-UI-shaped assets. |
| **Outcome** | **ACCEPTED.** Matches the condition precisely: infrastructure, components, SEO and ads are valuable, while page composition, data models and routing assumptions require substantial refactor. |

### Option C — Archive and recreate

| | |
|---|---|
| **Benefits** | A clean start with no inherited assumptions. No risk of silently retaining superseded composition. |
| **Risks** | Forfeits the 47-slot ad inventory transcription and would require re-reading the legacy JSPs to recover it — the single most expensive and error-prone asset to reproduce. Discards working CLS-safe ad reservation, `cleanCopy` (which fixes a documented `[ADMIN]`-leak defect), env-gated partner scripts, and format-driven result rendering. Re-establishes a dependency tree and TS configuration for no gain. |
| **Evidence against** | The option's own criteria are not met: coupling is **loose** not tight; fixtures do not tightly bind the components (only the templates and route registry); the most valuable assets are domain data, not UI. |
| **Outcome** | **REJECTED.** Root `CLAUDE.md` and the LRG-AUD-001 constraints both forbid choosing recreation merely because requirements changed — which is the primary thing that happened. Recreation would also be irreversible for anything not already committed, offering no safety benefit now that a Git baseline exists. |

---

## 4. Consequences

1. **No parallel application.** One frontend, one dependency tree, one Git history. No monorepo or workspace restructuring.
2. **Controlled task-by-task refactoring.** Each task names its allowed and forbidden paths, classifies affected artifacts using the `CLAUDE.md` §6 vocabulary, and stops on completion.
3. **No destructive cleanup.** Superseded artifacts are **ARCHIVE**d or kept as reference, never deleted. Deletion requires a separate, approved cleanup task. `DELETE AFTER CONFIRMATION` is deliberately not used in this decision.
4. **Blueprint-driven page composition.** Section order, section IDs, and user-state behavior come from the page-family blueprints and the Global Shell v1.1 taxonomy — never from a visual reference, an existing template, or a fixture shape.
5. **Design system precedes shell and page implementation.** Global Shell v1.1 §0.1 approves shell *behavior* while explicitly leaving final styling, colors, typography, section density, content order, and ad volume unapproved. The token layer must be settled first.
6. **Fixtures are transformed only after page and view-model specifications exist.** Fixture work follows specification; it never leads it.
7. **API work is deferred** until UI data contracts stabilize. `02-new-api` stays empty and untouched.
8. **Public routes and ad inventory remain protected** throughout. No route change, canonical change, or ad-slot change happens as a side effect of a page task.
9. **Every REPLACE and REFACTOR decision must name the knowledge or behavior to preserve** before the work begins — recorded per artifact in `reuse-register.md`.
10. **Page-family ad inventory must be captured before that page family is implemented.** Slot families for game, history, jackpot, blog and editorial pages are named but not yet enumerated.

---

## 5. Decision Triggers That Would Reopen This Architecture

This decision is **not** reopened by requirements changing, by a new blueprint arriving, or by a preference. Only material evidence reopens it:

| # | Trigger | Verification required |
|---|---|---|
| 1 | The project **cannot build** under its supported Node version. | A recorded build attempt under Node 24 in a task authorized to run builds. Currently unverified — the shell Node is v16.14.2 and no build has been run under this governance. |
| 2 | An approved blueprint requires a **rendering model the current framework cannot support**. | Named blueprint requirement plus a demonstration that Next.js App Router cannot satisfy it. |
| 3 | Reusable components prove **tightly coupled to obsolete structures**. | Concrete coupling evidence, e.g. state-specific branching inside shared components, or components that cannot render blueprint sections without rewriting their contracts. Current evidence is the opposite. |
| 4 | **Refactoring cost exceeds controlled recreation.** | Per-artifact cost comparison, not an impression. |
| 5 | A **security or dependency issue** makes the current foundation unacceptable. | Named advisory affecting Next.js 15 / React 19 / Tailwind 4 with no viable upgrade path. |

Any reopening REQUIRES founder approval and MUST be recorded as a superseding ADR — never by silent drift in an implementation task.

---

## 6. Verification Record

Every claim in this ADR was checked against the repository during LRG-DEC-004. The prior audit was treated as supporting evidence requiring verification, not as fact.

| Claim | Verification | Result |
|---|---|---|
| Stack and versions | `package.json` | Next `^15.5.4`, React `^19.1.0`, TS `^5.9.2`, Tailwind `^4.1.13`, 3 runtime deps |
| `engines` field absent | `package.json` | **Absent** — confirmed |
| TS strict on, `noUncheckedIndexedAccess` off | `tsconfig.json` | Confirmed |
| Lint not gating builds | `next.config.mjs:6` | `ignoreDuringBuilds: true` confirmed |
| Three routes only | `find app -name page.tsx -o -name route.ts` | `app/page.tsx`, `app/[state]/page.tsx`, `app/buynow/[code]/route.ts` |
| Routes filesystem-derived | `lib/data-provider/index.ts:57`, `app/[state]/page.tsx:15` | `readdirSync` → `generateStaticParams` confirmed |
| No sitemap / robots / not-found / error | `ls app/` | All four absent |
| Zero tests | recursive search | 0 files |
| No signed-in state | grep for `signedIn`/`session`/`auth` | 4 matches, **all comments** |
| Blueprint section counts | Home and State blueprint tables | **33** Home IDs, **31** State IDs, incl. signed-in variants |
| No legacy code coupling | grep `00-reference`/`LotteryCorner40` in source | **0** matches |
| `UtilitySubBar` orphaned | import search | No importer — confirmed orphan |
| `asArr` duplicated | grep | `HomeTemplate.tsx:20`, `StatePageTemplate.tsx:29` |
| State hardcoding shallow | grep `"fl"` / `Florida` | 2 disabled selects, 2 fallback strings, 1 stale comment |
| 16 fixtures vs 5-state config | file count, `states-config.json` | 16 fixtures, **5** config entries |
| Format coverage | computed over all fixtures | **112** gameIds referenced, **11** covered, **101** uncovered |
| Ad slots and unmapped count | computed against fixtures | **47** defined, **34** referenced, **13** unmapped |
