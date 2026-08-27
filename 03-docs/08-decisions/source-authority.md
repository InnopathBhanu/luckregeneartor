# Source Authority Register — LotteryCorner / LuckReGenerator

**Document type:** Decision record — source-of-truth hierarchy and document register
**Created by:** Task LRG-CTL-002 (baseline and authoritative source import)
**Created:** July 25, 2026
**Method:** Every document below was classified by reading its **internal** `Document`, `Version`,
`Status`, and date fields. **Filenames were not used as classification evidence.** Where a filename
and internal metadata disagree, the internal metadata governs and the disagreement is recorded in
`source-conflicts.md`.

---

## 1. Authority Order

When two sources disagree, the higher-numbered rule loses. Rule 1 wins over everything.

1. **Explicit founder decision** (recorded in a task instruction or an approved decision record).
2. **Frozen Product Constitution** — `00A-v2.1-luckregenerator-product-constitution-FROZEN.md`, v2.1, accepted and frozen.
3. **Final-approved Experience Architecture** — `01-lotterycorner-experience-architecture-FINAL-APPROVED.md`, v1.1.
4. **Final-approved Global Shell and page-family blueprints** — everything under `03-docs/01-approved-blueprints/`.
5. **Current approved decision records** — this register and `source-conflicts.md`.
6. **Supporting research** — `03-docs/00-foundation/research/` plus `03-docs/research/00-search-seo-research.md`.
7. **Existing implementation and previous research** — `01-new-ui/`, `04-sample-data/`, `05-design-inputs/`, and the previous `03-docs/00`–`22` set: **reference only, never a requirements authority.**
8. **Legacy implementation** — `00-reference-existing-project/LotteryCorner40/`: **read-only evidence** of production behavior, routes, data shapes, monetization, and migration constraints.

### Standing rules

- **Nothing in tier 7 may override tiers 2–5.** The previous `03-docs/00`–`22` documents record what the *legacy system does* and what was *previously decided*; they do not define what to build.
- **Tier 8 is evidence, not instruction.** Legacy behavior must be understood and preserved where the blueprints require it, but legacy structure is not a design authority.
- **A missing approved blueprint blocks its page family.** Absence is not permission to fall back to tier 7. See `source-conflicts.md`.
- **`FINAL-APPROVED` in a filename proves nothing.** Two files in this import carry no such marker yet are approved, and one file sits inside a package named `FINAL-APPROVED` while being internally `Proposed`.

---

## 2. Tier 2–3 — Foundation (Authoritative)

| Repository path | Internal title | Internal document name | Version | Status | Date | Authority classification | Governing scope | Superseded relationship |
|---|---|---|---|---|---|---|---|---|
| `03-docs/00-foundation/authoritative/00A-v2.1-luckregenerator-product-constitution-FROZEN.md` | LuckReGenerator Product Constitution | `00A-v2-luckregenerator-product-constitution.md` | **2.1** | **Accepted and frozen — founder-approved product constitution** | Frozen July 23, 2026 | **TIER 2 — HIGHEST PRODUCT AUTHORITY** | Entire product: purpose, principles, non-negotiables, North Star | Supersedes `00A-luckregenerator-product-vision-and-ecosystem-strategy.md` (not supplied) |
| `03-docs/00-foundation/authoritative/01-lotterycorner-experience-architecture-FINAL-APPROVED.md` | LotteryCorner Experience Architecture | `01-lotterycorner-experience-architecture.md` | **1.1** | **Final approved and frozen experience architecture** | Approved July 23, 2026 | **TIER 3 — EXPERIENCE AUTHORITY** | Full page-family universe, experience system, cross-family rules | Internal v1.0 not supplied |

**Note on internal document names:** both files carry an internal `Document:` value that differs from
their filename (`00A-v2-…` vs `00A-v2.1-…-FROZEN`; `01-…-architecture.md` vs `…-FINAL-APPROVED.md`).
The internal `Version` and `Status` fields are authoritative and both confirm frozen/approved status.

---

## 3. Tier 4 — Final-Approved Blueprints

### 3.1 Global Shell and Section Library — BP-01 — **PRESENT AND ACTIVE**

| Repository path | Internal title | Internal document name | Version | Status | Date | Governing scope |
|---|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/shell/02-global-shell-and-section-library-blueprint-FINAL-APPROVED.md` | LotteryCorner Global Shell and Section Library Blueprint | `02-global-shell-and-section-library-blueprint.md` | **1.1** | **Final approved and frozen blueprint** | Approved July 23, 2026 | Global shell, header, footer, navigation, shared section library — **foundation every page family composes from** |

**Imported by task LRG-CTL-002A.** SHA-256 `d53d253ef8487e9d6163320fa5a18cda507e2761ae594fcb2860100e63796938`.

**Supersedes** v1.0 ("Proposed blueprint — ready for founder review"), which is retained as historical
reference in `02-previous-work/superseded-source-versions/` and must **not** be used as authority.

**Visual-reference boundary (blueprint §0.1, binding).** The blueprint's five companion desktop and
mobile SVGs are declared **non-binding shell references**. They illustrate shell zones, navigation
hierarchy, anonymous-versus-signed-in differences, and section anatomy. They explicitly **do not**
approve final styling, colors, typography, section density, page-family content order, page-specific
advertising volume, or final high-fidelity layouts. **Each page family requires its own desktop and
mobile high-fidelity review and founder approval before implementation.**

The five SVGs (`bp02-desktop-anonymous.svg`, `bp02-desktop-signed-in.svg`, `bp02-mobile-anonymous.svg`,
`bp02-mobile-signed-in.svg`, `bp02-section-library.svg`) were supplied only with the v1.0 package and
remain in `02-previous-work/superseded-source-versions/`. v1.1 references them by name — see
`source-conflicts.md` Conflict 12.

### 3.2 Home — BP-02

| Repository path | Internal title | Internal document name | Version | Status | Date | Governing scope |
|---|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/home/03-lotterycorner-home-page-blueprint-FINAL-APPROVED.md` | LotteryCorner Home Page Blueprint | `03-lotterycorner-home-page-blueprint.md` | **1.1** | **Final approved and frozen Home blueprint** | Approved July 24, 2026 | Home page (`/`) |

Companion visuals: `bp03-home-desktop-anonymous-final.svg`, `bp03-home-desktop-signed-in-final.svg`,
`bp03-home-mobile-anonymous-final.svg`, `bp03-home-mobile-signed-in-final.svg`,
`reference-current-homepage.png` *(legacy-state reference image shipped inside the approved package)*.

### 3.3 State — BP-03

| Repository path | Internal title | Internal document name | Version | Status | Date | Governing scope |
|---|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/state/04-lotterycorner-state-page-blueprint-FINAL-APPROVED.md` | LotteryCorner State Page Blueprint | `04-lotterycorner-state-page-blueprint.md` | **1.1** | **Final approved and frozen State Page blueprint** | Approved July 24, 2026 | State pages (`/{state}`) |

Companion visuals: `bp04-state-desktop-anonymous.svg`, `bp04-state-desktop-signed-in.svg`,
`bp04-state-mobile-anonymous.svg`, `bp04-state-mobile-signed-in.svg`.

### 3.4 Games — BP-04A / BP-04B / routing / tools

| Repository path | Internal title | Version | Status | Date | Governing scope |
|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/games/05-lotterycorner-game-page-blueprint-index-FINAL-APPROVED.md` | LotteryCorner Game Page Architecture and Routing Decision — Final Approved | **1.1** | **Final approved and frozen architecture** | Approved July 24, 2026 | Game-page architecture, routing, buy resolution |
| `03-docs/01-approved-blueprints/games/05A-lotterycorner-flagship-game-page-blueprint-FINAL-APPROVED.md` | LotteryCorner Flagship Game Page Blueprint — Final Approved | **1.1** | **Final approved and frozen blueprint** | Approved July 24, 2026 | Flagship game brand hubs (Powerball, Mega Millions) |
| `03-docs/01-approved-blueprints/games/05B-lotterycorner-jurisdiction-game-page-blueprint-FINAL-APPROVED.md` | LotteryCorner Jurisdiction Game Page Blueprint — Final Approved | **1.1** | **Final approved and frozen blueprint** | Approved July 24, 2026 | Jurisdiction game pages (`/{state}/{game}`) |
| `03-docs/01-approved-blueprints/games/05C-lotterycorner-tools-and-ai-insights-blueprint-FINAL-APPROVED.md` | LotteryCorner Tools and AI Insights Blueprint — Final Approved | **1.1** | **Final approved and frozen supporting blueprint** | Approved July 24, 2026 | Tools hub, AI insights surfaces |

Companion visuals: `bp05-game-routing-and-buy-resolution-final.svg`,
`bp05a-powerball-global-desktop-final.svg`, `bp05a-mega-millions-global-desktop-final.svg`,
`bp05b-jurisdiction-game-desktop-final.svg`, `bp05c-lottery-tools-hub-final.svg`.

Superseded v1.0 proposed originals (`05`, `05A`, `05B`) are held in
`02-previous-work/superseded-source-versions/`. No v1.0 of `05C` was supplied.

### 3.5 Yearly Results Archive

| Repository path | Internal title | Version | Status | Date | Governing scope | Superseded relationship |
|---|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/archives/06-lotterycorner-yearly-results-archive-research-FINAL-APPROVED.md` | LotteryCorner Yearly Results Archive Research — Final Approved | **1.1** | **Final approved and frozen research** | Approved July 24, 2026 | Archive research basis | **Declares:** `Supersedes: 06-lotterycorner-yearly-results-archive-research.md` — that original is in `02-previous-work/superseded-source-versions/` |
| `03-docs/01-approved-blueprints/archives/06-lotterycorner-yearly-results-archive-blueprint-FINAL-APPROVED.md` | LotteryCorner Yearly Results Archive Blueprint — Final Approved | **1.0** | **Final approved and frozen blueprint** | Approved July 24, 2026 | Yearly archive pages (`/{state}/{game}/{year}`) | — |
| `03-docs/01-approved-blueprints/archives/06-lotterycorner-yearly-results-archive-content-template-FINAL-APPROVED.md` | LotteryCorner Yearly Results Archive Content Template — Final Approved | **1.0** | **Final approved reusable content template** | Approved July 24, 2026 | Archive content authoring | — |

### 3.6 News and Editorial

| Repository path | Internal title | Version | Status | Date | Governing scope |
|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/news/07-lotterycorner-news-editorial-engagement-research-FINAL-APPROVED.md` | LotteryCorner News, Editorial and Engagement Research — Final Approved | **1.1** | **Final approved and frozen** | Approved July 24, 2026 | Editorial identity, content classes, engagement |
| `03-docs/01-approved-blueprints/news/07A-lotterycorner-news-hub-blueprint-FINAL-APPROVED.md` | LotteryCorner News Hub Blueprint — Final Approved | **1.0** | **Final approved and frozen** | *not stated* | News hub (`/news`) |
| `03-docs/01-approved-blueprints/news/07B-lotterycorner-news-article-blueprint-FINAL-APPROVED.md` | LotteryCorner News Article Blueprint — Final Approved | **1.0** | **Final approved and frozen** | *not stated* | News article pages |
| `03-docs/01-approved-blueprints/news/07C-lotterycorner-editorial-content-template-FINAL-APPROVED.md` | LotteryCorner Editorial Content Template — Final Approved | **1.0** | **Final approved reusable template** | *not stated* | Editorial content authoring |

No companion SVGs were supplied in the News package.

### 3.7 Community and Forum

| Repository path | Internal title | Version | Status | Date | Governing scope | Superseded relationship |
|---|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/community/08-lotterycorner-community-forum-engagement-research-FINAL-APPROVED.md` | LotteryCorner Community, Forum and Engagement Research — Final Approved | **1.1** | **Final approved and frozen research** | Approved July 24, 2026 | Community strategy basis | **Declares:** `Supersedes: 08-lotterycorner-community-forum-engagement-research.md` — that v1.0 is in `02-previous-work/superseded-source-versions/` |
| `03-docs/01-approved-blueprints/community/08A-lotterycorner-community-home-blueprint-FINAL-APPROVED.md` | LotteryCorner Community Home Blueprint — Final Approved | **1.0** | **Final approved and frozen** | *not stated* | Community home | — |
| `03-docs/01-approved-blueprints/community/08B-lotterycorner-forum-entry-blueprint-FINAL-APPROVED.md` | LotteryCorner Forum Entry Blueprint — Final Approved | **1.0** | **Final approved and frozen** | *not stated* | Forum entry / thread pages | — |
| `03-docs/01-approved-blueprints/community/08C-lotterycorner-community-profile-and-reputation-blueprint-FINAL-APPROVED.md` | LotteryCorner Community Profile and Reputation Blueprint — Final Approved | **1.0** | **Final approved and frozen** | *not stated* | Community profile, reputation | — |
| `03-docs/01-approved-blueprints/community/08D-lotterycorner-community-content-and-schema-template-FINAL-APPROVED.md` | LotteryCorner Community Content and Schema Template — Final Approved | **1.0** | **Final approved reusable template** | *not stated* | Community content + schema | — |

No companion SVGs were supplied in the Community package.

### 3.8 Member and Insider — **PRESENT, CLASSIFIED PENDING FOUNDER DECISIONS**

| Repository path | Internal title | Internal document name | Version | Status | Date | Authority classification |
|---|---|---|---|---|---|---|
| `03-docs/01-approved-blueprints/insider/pending/09-lotterycorner-member-and-insider-experience-research-and-blueprint.md` | LotteryCorner Member and Insider Experience Research and Blueprint | `09-lotterycorner-member-and-insider-experience-research-and-blueprint.md` | **1.0** | **Research and blueprint complete; founder decisions listed in Part 22** | Prepared July 25, 2026 | **PENDING FOUNDER DECISIONS — NOT TIER 4** |

**Imported by task LRG-CTL-002A.** SHA-256 `709c970d8015d595004b2a7e2aa4438c83794b830cb570f6ff9991b48daa7cf8`.

**This document is deliberately NOT placed in Tier 4.** Its own internal status states that founder
decisions remain outstanding, and it is stored under `insider/pending/` rather than beside the
final-approved blueprints.

**Binding rules for use:**

- Content the document marks **`APPROVED`** is already binding — but only because it derives from the
  frozen Constitution, the final-approved Experience Architecture, or a later final-approved blueprint.
  Its authority comes from *those* sources, not from this document.
- Content marked **`RECOMMENDED`**, **`REQUIRES FOUNDER DECISION`**, **`SOURCE FINDING`**, or
  **`FUTURE`** is **not approved architecture** and must not be implemented as if it were.
- The **12 unresolved founder decisions in Part 22** are listed in `source-conflicts.md` Conflict 3.
  None may be silently resolved.

**Scope boundary.** `08C-…-community-profile-and-reputation-blueprint-FINAL-APPROVED.md` **is** Tier-4
approved and governs *community* profile and reputation. It does **not** cover paid
Member/Insider entitlement, and this pending document does not upgrade it.

**Note on this document's own source register.** Its Part 23 entry `I06` classifies the Global Shell as
*"Proposed blueprint — Medium; subordinate to finals."* That reflected the state of the source set when
it was written. **Global Shell v1.1 is now the active Tier-4 authority** (§3.1), so that internal note
is stale. The document itself was not edited.

---

## 4. Tier 6 — Supporting Research

| Repository path | Internal title | Internal document name | Version | Status | Date | Authority classification |
|---|---|---|---|---|---|---|
| `03-docs/00-foundation/research/00B-lottery-player-behavior-engagement-and-ai-experience-research.md` | LotteryCorner Player Behavior, Engagement and AI Experience Research | `00B-lottery-player-behavior-engagement-and-ai-experience-research.md` | **1.0** | **Strategic research and decision input; not a page design or implementation specification** | Research date July 23, 2026; evidence cut-off July 23, 2026 | **TIER 6 — SUPPORTING RESEARCH** |
| `03-docs/00-foundation/research/01-ai-search-geo-research.md` | LotteryCorner AI Search, GEO and Retrieval Research | `01-ai-search-geo-research.md` | **1.0** | **Research complete; requires periodic evidence refresh** | Research date July 20, 2026; web-evidence retrieval date July 20, 2026 | **TIER 6 — SUPPORTING RESEARCH** |
| **`03-docs/research/00-search-seo-research.md`** *(existing path — active copy, not moved)* | LotteryCorner.com State Lottery Search & SEO Research | `00-search-seo-research.md` | *no version field* | **Research foundation only** | Research date July 20, 2026 | **TIER 6 — SUPPORTING RESEARCH (ACTIVE)** |

### Duplication decision — `00-search-seo-research.md`

The repository already holds this document at **`03-docs/research/00-search-seo-research.md`**
(1,856 lines, internal research date July 20, 2026). **No copy of it was supplied in this import**,
so there is no later version to compare against.

**Decision:** the existing file at its existing path **remains the active copy**. It was **not
copied, moved, or edited**, and no duplicate was created under `00-foundation/research/`. Reference
it at its existing path.

### AI Search, GEO and Retrieval Research — imported

**`01-ai-search-geo-research.md`** was supplied and imported by task LRG-CTL-002A.
SHA-256 `6ea1e39d3f78f08364d0ead620f1c79553d7414d4f9de944d8ef2fd90bd87103`.

**Classification: Tier-6 supporting research — NOT a page blueprint and NOT an implementation
specification.** The document states its own exclusions explicitly: state-page blueprint, final page
sections, UI design, page copy, HTML, React, JSON-LD implementation, final `robots.txt`, sitemap files,
database design, API payloads, and agent design. It must not be treated as governing any of those.

**Predecessor relationship.** Its Document Control block names
**`Accepted predecessor: 00-search-seo-research.md`**. The two research documents are therefore
**complementary, not competing**: `00-search-seo-research.md` (traditional search behavior and intent,
July 20 2026) remains active at `03-docs/research/`, and `01-ai-search-geo-research.md` extends it into
AI retrieval, provenance, and crawler-purpose territory. Neither supersedes the other.

**Status caveat:** *"requires periodic evidence refresh."* Its web evidence has a July 20, 2026 retrieval
date. Retrieval and AI-crawler behavior changes quickly — re-verify before relying on time-sensitive
external claims.

### Missing research

**None.** All three expected foundation research documents are present.

---

## 5. Tier 7 — Previous Work (Reference Only)

| Repository path | Internal title / content | Version | Status | Authority classification |
|---|---|---|---|---|
| `03-docs/02-previous-work/implementation-summary.md` | LuckReGenerator Implementation Program Architect brief — records `PREVIOUS IMPLEMENTATION STATUS`, `PREVIOUS RESEARCH`, `PREVIOUS ARCHITECTURE`, `UI EXPLORATION`, `REUSABLE COMPONENTS`, `REUSABLE DATA STRUCTURES`, `SEO AND AD AUDIT INPUT`, previous frontend/route/template direction | *none stated* | *none stated* | **TIER 7 — REFERENCE ONLY.** Source file: `LuckReGenerator-current-implementation-and-Claude-audit-brief.txt`. This is an **operating/program brief**, not a frozen product document; it describes previous work and audit scope |
| `03-docs/00`–`22-*.md` *(existing, untouched)* | Previous-generation discovery, plans, and decisions | various / mostly unstated | mostly unstated | **TIER 7 — REFERENCE ONLY.** `01`–`05` retain high value as *legacy-system knowledge*; `09`–`15`, `21` are superseded as *requirements* |
| `01-new-ui/**` *(untouched)* | Previous Next.js implementation | 0.1.0 | — | **TIER 7 — REFERENCE ONLY** |
| `04-sample-data/**` *(untouched)* | Previous fixtures + real production exports | `0.1`–`0.5-sample` | `illustrative: true` on synthetic payloads | **TIER 7 — REFERENCE ONLY.** `ad-slot-definitions.json`, `footer-config.json`, `reference-tables/`, `source-xml/` are production-derived evidence |
| `05-design-inputs/**` *(untouched)* | Screenshots, proposed PDFs, content docs | — | — | **TIER 7 — REFERENCE ONLY.** Proposed PDFs are style/content reference; existing screenshots are legacy-behavior and ad-inventory evidence |

### Superseded and proposed source versions — quarantined

All of the following are held in **`03-docs/02-previous-work/superseded-source-versions/`** and must
**never** be treated as approved authority:

| File | Internal version | Internal status | Why quarantined |
|---|---|---|---|
| `02-global-shell-and-section-library-blueprint.md` | **1.0** | **Proposed blueprint — ready for founder review** | **Superseded historical reference.** Superseded by v1.1 (§3.1), imported LRG-CTL-002A. Retained for history; never authority |
| `bp02-desktop-anonymous.svg`, `bp02-desktop-signed-in.svg`, `bp02-mobile-anonymous.svg`, `bp02-mobile-signed-in.svg`, `bp02-section-library.svg` | — | companion shell visuals, supplied only with the v1.0 package | **Still located here**, though referenced by approved v1.1. v1.1 §0.1 declares them **non-binding shell references**. See `source-conflicts.md` Conflict 12 |
| `05-lotterycorner-game-page-blueprint-index.md` | **1.0** | Proposed decision and blueprint index — ready for founder review | Superseded by approved v1.1 |
| `05A-lotterycorner-flagship-game-page-blueprint.md` | **1.0** | Proposed blueprint — ready for founder review | Superseded by approved v1.1 |
| `05B-lotterycorner-jurisdiction-game-page-blueprint.md` | **1.0** | Proposed blueprint — ready for founder review | Superseded by approved v1.1 |
| `06-lotterycorner-yearly-results-archive-research-original.md` | *no version field* | Research and product recommendation — not yet a frozen blueprint | Explicitly superseded by approved `06-…-research-FINAL-APPROVED.md` v1.1 |
| `08-lotterycorner-community-forum-engagement-research.md` | **1.0** | Research and strategic recommendation — ready for founder review | Explicitly superseded by approved `08-…-research-FINAL-APPROVED.md` v1.1 |

---

## 6. Tier 8 — Legacy Implementation (Read-Only Evidence)

| Path | Nature | Authority classification |
|---|---|---|
| `00-reference-existing-project/LotteryCorner40/` | Java / Struts 2 / JSP production application. **Independent nested Git repository**, excluded from the root repository by `.gitignore`. Not a submodule | **TIER 8 — READ-ONLY EVIDENCE** for production behavior, route inventory (`struts.xml`, `sitemap.xml`), result formats (`ResultFormat_Upgrade.properties`), monetization (GAM slots, `Affiliate.properties`, `ads.txt`), and migration constraints. **Never modify.** |

This tree is the **only** source for ad-slot families not yet captured (`lc_mgp_*`, `lc_bp_*`,
`lc_bdp_*`, `lc_jp_*`, `lc_gh_*`) and must remain readable and unmodified for the remainder of the
rebuild.

---

## 7. Classification Method and Cautions

- **Internal metadata only.** Every row above was set from the document's own `Document`, `Version`, `Status`, and date fields.
- **Filenames proved unreliable, concretely:**
  - `02-global-shell-…-blueprint-package.zip` contains an internally **Proposed v1.0** document; the approved **v1.1** arrived separately as a standalone `…-FINAL-APPROVED.md` file (LRG-CTL-002A).
  - `02-global-shell-and-section-library-blueprint.md` (the v1.0 file) carries **no** status marker yet is **not** approved.
  - **Both** the v1.0 and v1.1 Global Shell files declare the *same* internal `Document:` value, `02-global-shell-and-section-library-blueprint.md`. Only `Version` and `Status` distinguish them — the internal document name cannot.
  - The `05-…-FINAL-APPROVED-package` bundles a `reference-original-v1.0/` folder of **unapproved** documents.
  - `00A-v2.1-…-FROZEN.md`, `01-…-FINAL-APPROVED.md`, `03-…-FINAL-APPROVED.md`, and `04-…-FINAL-APPROVED.md` each declare a **different** internal document name than their filename.
- **Version numbers are not comparable across families.** Approved status is carried by `Status`, not by a high version number: `06-…-blueprint` and all of `07A`–`07C`, `08A`–`08D` are **v1.0 and approved**, while Global Shell **v1.0 was not approved** and Member/Insider **v1.0 is pending**.
- **"Complete" is not "approved."** Member/Insider v1.0 states *"Research and blueprint complete"* — completeness of authorship, not founder approval. It stays under `pending/`.
- **Where a field is absent** it is recorded as *not stated* rather than inferred.

---

## 8. Related Records

- `03-docs/08-decisions/source-conflicts.md` — every unresolved source issue, including the 12 outstanding Member/Insider founder decisions.

## 9. Revision History

| Task | Date | Change |
|---|---|---|
| LRG-CTL-002 | July 25, 2026 | Register created. 21 governed documents + 14 companion visuals imported. Global Shell v1.1, AI Search/GEO research, and Member/Insider recorded as **missing**. |
| LRG-CTL-002A | July 25, 2026 | **Global Shell v1.1** imported → Tier-4 active authority (§3.1); v1.0 reclassified as superseded historical reference. **`01-ai-search-geo-research.md`** imported → Tier-6 supporting research (§4). **Member/Insider v1.0** imported under `insider/pending/` → **PENDING FOUNDER DECISIONS** (§3.8). Both navigational `README.md` placeholders removed. No other document altered. |
