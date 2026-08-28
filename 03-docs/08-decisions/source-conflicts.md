# Source Conflicts Register — LotteryCorner / LuckReGenerator

**Document type:** Decision record — unresolved source issues
**Created by:** Task LRG-CTL-002 (baseline and authoritative source import)
**Created:** July 25, 2026
**Rule applied:** conflicts are **recorded, not silently resolved.** No document was relabelled,
renamed to imply a status it does not hold, edited, or invented. Where an expected document was
absent, everything available was imported and the absence recorded here.

**Companion record:** `03-docs/08-decisions/source-authority.md`

---

## Summary

**Last updated:** July 25, 2026 by task **LRG-CTL-002A**.

| # | Conflict | Severity | Status | Blocks work? |
|---|---|---|---|---|
| 1 | Global Shell v1.1 final-approved missing | ~~CRITICAL~~ | ✅ **RESOLVED** (LRG-CTL-002A) | **No longer blocking** |
| 2 | AI Search / GEO / Retrieval research missing | ~~HIGH~~ | ✅ **RESOLVED** (LRG-CTL-002A) | **No longer blocking** |
| 3 | **Member/Insider: 12 unresolved founder decisions (Part 22)** | **HIGH** | 🔶 **OPEN** — document now present; decisions outstanding | **Yes — blocks member/insider/subscriber implementation** |
| 4 | Package filenames contradict internal document status | MEDIUM | 🔶 OPEN (advisory) | No — resolved per-document by reading internal metadata |
| 5 | Unapproved v1.0 originals bundled inside approved packages | MEDIUM | 🔶 OPEN (quarantined) | No |
| 6 | Approved documents duplicated as `reference/` copies inside another package | LOW | 🔶 OPEN (not imported) | No |
| 7 | Byte-identical duplicate file inside the Community package | LOW | 🔶 OPEN (one copy imported) | No |
| 8 | Internal `Document:` names differ from filenames | LOW | 🔶 OPEN (recorded) | No |
| 9 | Several approved documents state no date | LOW | 🔶 OPEN (recorded) | No |
| 10 | Legacy nested repository has an uncommitted modification | LOW | 🔶 OPEN — founder decision | No — left untouched |
| 11 | `03-docs/reference-project-git-status.txt` is stale | LOW | 🔶 OPEN (recorded) | No |
| 12 | **Approved Shell v1.1 references 5 SVGs held under `superseded-source-versions/`** | LOW | 🔶 **NEW** (LRG-CTL-002A) | No — v1.1 §0.1 declares them non-binding |
| 13 | **State page: production emits contradictory canonical / trailing-slash signals** | MEDIUM | 🔶 **NEW** (LRG-DEC-018) | No — blocks production route cutover only |
| 14 | **First-party commerce route: approved `/play/{game}` vs implemented and legacy `/buynow/*`** | MEDIUM | 🔶 **NEW** (LRG-DEC-018) | No — blocks commerce activation and route cutover |
| 15 | **Ad no-fill behaviour specified three different ways** | MEDIUM | 🔶 **NEW** (LRG-DEC-018) | No — ad-operations validation |
| 16 | **Recorded State ad inventory diverges from source evidence** | MEDIUM | 🔶 **NEW** (LRG-DEC-018) | No — evidence retained; excluded from the preview baseline |
| 17 | **`atv_video_player`: retired for Home, rendered in State production** | LOW | 🔶 **NEW** (LRG-DEC-018) | No — disabled in the State preview pending ad operations |
| 18 | **Prohibited legacy marketing copy live in the production State template** | MEDIUM | 🔶 **NEW** (LRG-DEC-018) | No — must not be migrated; remediation unapproved |

**Conflicts 4–12 are preserved unchanged below.** LRG-CTL-002A rewrote Conflicts 1–3 and added
Conflict 12. **LRG-DEC-018 added Conflicts 13–18** — the six State-page contradictions that survived
the 36 founder rulings in `state-page-founder-decisions.md` (`ST-DEC-001`). Fourteen further
contradictions recorded by the State audit were **closed by those rulings or reclassified as
documentation errors**, and are deliberately *not* registered here; their dispositions are in
`03-docs/04-page-specifications/state/state-page-source-and-current-implementation-audit.md` §7.

---

## Conflict 1 — Global Shell v1.1 — ✅ RESOLVED

**Original issue (LRG-CTL-002):** only Global Shell **v1.0**, internally *"Proposed blueprint — ready
for founder review"*, had been supplied. v1.1 was absent, which blocked all shell, header, footer,
navigation, and section-library work — and therefore every page family that composes from the shell.

**Resolution (LRG-CTL-002A):** Global Shell **v1.1** was supplied and imported. Verified internal
metadata:

```
**Document:** `02-global-shell-and-section-library-blueprint.md`
**Blueprint package:** BP-01 — Global Shell and Section Library
**Version:** 1.1
**Status:** Final approved and frozen blueprint
**Approved date:** July 23, 2026
```

| Item | Value |
|---|---|
| Active authority path | `03-docs/01-approved-blueprints/shell/02-global-shell-and-section-library-blueprint-FINAL-APPROVED.md` |
| SHA-256 | `d53d253ef8487e9d6163320fa5a18cda507e2761ae594fcb2860100e63796938` |
| Byte-identical to source | ✅ verified |
| Classification | **TIER 4 — active final-approved authority** |

**v1.0 handling.** Retained unmodified at
`03-docs/02-previous-work/superseded-source-versions/02-global-shell-and-section-library-blueprint.md`,
reclassified as **superseded historical reference**. It was **not deleted and not promoted**.

**What v1.1 adds over v1.0** (heading-level comparison; v1.0 = 2,431 lines, v1.1 = 2,546 lines):

- new **§0.1 Visual-reference boundary** — declares the companion SVGs non-binding;
- new **§3.2 Navigation-language contract**;
- new **§6.5 State-Context Precedence**;
- new **§10.5 AI-everywhere compliance rule**;
- new **§142.1 Public Language Contract**;
- §153 retitled from *"Decisions to Approve or Adjust"* → *"Founder-Approved Directions"*, plus a new
  §154 *"Items Reserved for Page-Family Testing"*;
- new appendices **C.1 Founder Review Clarifications** and **C.2 Freeze Status**.

The retitling of §153 and the added freeze-status appendix are the substantive markers of the
proposed → approved transition.

**Carry-forward constraint (v1.1 §0.1, binding).** Approval of the shell blueprint is **not** approval
of final visuals. Each page family still requires its own desktop and mobile high-fidelity review and
founder approval before implementation. Do not read "shell approved" as "styling approved."

---

## Conflict 2 — AI Search, GEO and Retrieval research — ✅ RESOLVED

**Original issue (LRG-CTL-002):** `01-ai-search-geo-research.md` was absent, leaving no approved basis
for AI-crawler strategy, retrieval-oriented content structure, `robots.txt` AI policy, or answer-block
design.

**Resolution (LRG-CTL-002A):** supplied and imported. Verified internal metadata:

| Field | Value |
|---|---|
| Document | `01-ai-search-geo-research.md` |
| Document type | Architecture and search-retrieval research record |
| Version | **1.0** |
| Status | **Research complete; requires periodic evidence refresh** |
| Research date | July 20, 2026 |
| Web-evidence retrieval date | July 20, 2026 |
| Accepted predecessor | `00-search-seo-research.md` |

| Item | Value |
|---|---|
| Path | `03-docs/00-foundation/research/01-ai-search-geo-research.md` |
| SHA-256 | `6ea1e39d3f78f08364d0ead620f1c79553d7414d4f9de944d8ef2fd90bd87103` |
| Byte-identical to source | ✅ verified |
| Classification | **TIER 6 — supporting research** |

**Classification boundary — not a blueprint.** The document lists its own exclusions: state-page
blueprint, final page sections, UI design, page copy, HTML, React, JSON-LD implementation, final
`robots.txt`, sitemap files, database design, API payloads, and agent design. It informs those
decisions; it does not govern them. **Page structure remains governed by the Tier-4 blueprints.**

**No duplication conflict with `00-search-seo-research.md`.** The new document names it as its
**accepted predecessor**, so the two are complementary: `00-` covers traditional search intent and
behavior, `01-` extends into AI retrieval, provenance, and crawler purpose. `00-search-seo-research.md`
remains the active copy at `03-docs/research/` and was **not** moved, edited, or duplicated.

**Residual caution (not a conflict).** Status says *"requires periodic evidence refresh"* and its web
evidence is dated July 20, 2026. AI-crawler and answer-engine behavior changes quickly — re-verify
time-sensitive external claims before relying on them.

---

## Conflict 3 — Member and Insider: 12 unresolved founder decisions (HIGH — OPEN)

**Original issue (LRG-CTL-002):** the document was absent entirely.

**Now:** the document is **present**, but the conflict is **not resolved** — it has changed character.
The blocker is no longer a missing file; it is the **12 material product and business decisions its
own Part 22 leaves open**.

**Verified internal metadata:**

```
**Document:** `09-lotterycorner-member-and-insider-experience-research-and-blueprint.md`
**Version:** 1.0
**Status:** Research and blueprint complete; founder decisions listed in Part 22
**Prepared:** July 25, 2026
```

| Item | Value |
|---|---|
| Path | `03-docs/01-approved-blueprints/insider/pending/09-lotterycorner-member-and-insider-experience-research-and-blueprint.md` |
| SHA-256 | `709c970d8015d595004b2a7e2aa4438c83794b830cb570f6ff9991b48daa7cf8` |
| Byte-identical to source | ✅ verified |
| Classification | **PENDING FOUNDER DECISIONS — not Tier 4** |

**"Complete" is not "approved."** The status asserts completeness of authorship, not founder approval.
The document therefore sits under `insider/pending/`, **not** beside the final-approved blueprints, and
was **not relabelled**.

### The 12 outstanding decisions (verbatim from Part 22 — Final Decisions Required from Founder)

| # | Decision | Notes |
|---|---|---|
| 1 | **Private member-home route:** retain `/insider` as canonical, redirect to `/my-lotterycorner`, or choose another route after audit | Legacy `/insider/register` and `/insider/login` already exist in production (document sources W31, W32). Any change needs a 1:1 301 plan under the SEO rules |
| 2 | **Insider paid-launch timing:** remain free during Phase 2 Preview, or charge selected features earlier | Revenue-model timing |
| 3 | **Insider ad treatment:** protected workflows only, additionally reduced density, or a future ad-light add-on | **Touches GAM ad inventory — requires explicit founder approval under `CLAUDE.md` fixed-placement rules** |
| 4 | **Paid packaging:** subscription only, versus subscription plus report/usage credits | — |
| 5 | **Trial design:** feature-specific free runs (document's recommendation) versus a time-based all-access trial | — |
| 6 | **Initial Member/Insider storage and AI quotas:** approve the configurable guardrails in Parts 5 and 10, or set alternatives | — |
| 7 | **CSV/PDF export policy:** which annual/basic exports stay public or Member-gated, subject to rights review | **NARROWED 2026-08-06 by `DATA-DEC-001` `FD-DAT-01`:** any LotteryCorner-provided export requires a **free Account**, so no annual or basic export is public. What remains open is the **Member/Insider** tier above that free Account. `FD-DAT-14` also forbids an unrestricted public CSV/API endpoint, which bears on the legacy `/results/download/*` route. Still interacts with `DataDownload` schema |
| 8 | **`PurchasedTicketRecord` launch:** launch manual records in Phase 2, or defer all ticket-like records until stronger privacy/image workflows exist | Privacy-sensitive |
| 9 | **Public Insider badge:** private entitlement only (document's recommendation), or an optional public profile badge carrying no reputation weight | Interacts with approved `08C` community profile/reputation blueprint |
| 10 | **Promotional pause scope for anonymous users:** session-only (stated minimum) versus device cookie/local preference with longer duration | — |
| 11 | **Source package correction:** locate/approve the final Experience Architecture and final Global Shell copy before wireframes are frozen | ✅ **Now satisfied.** Experience Architecture v1.1 imported in LRG-CTL-002; Global Shell v1.1 imported in LRG-CTL-002A (Conflict 1). Confirm this closes the item |
| 12 | **Legacy copy remediation:** approve removal/rewrite of "increase chances," unverified winning claims and placeholder testimonials before Member/Insider launch | Compliance-sensitive; overlaps the `CLAUDE.md` "no fake claims / no unsupported lottery advice" rule |

**Decision 11 appears already satisfied** by the imports in LRG-CTL-002 and LRG-CTL-002A. The remaining
**11** require founder input. Only the founder may close them.

### Binding rules until these decisions are made

- **Do not implement** member, insider, subscriber, login, favorites, paid-tier, or export behavior from
  this document.
- Respect the document's own reading key: only content marked **`APPROVED`** is binding, and it is
  binding because it derives from the Constitution, the Experience Architecture, or a Tier-4 blueprint —
  **not** because this document repeats it. Content marked **`RECOMMENDED`**,
  **`REQUIRES FOUNDER DECISION`**, **`SOURCE FINDING`**, or **`FUTURE`** is **not approved architecture**.
- **Do not** substitute `03-docs/15-seo-content-admin-and-ai-strategy.md` (Tier 7, previous generation).
- **Do not** stretch `08C-…-community-profile-and-reputation-blueprint-FINAL-APPROVED.md` to cover paid
  entitlement. It governs community profile and reputation only.
- The existing `01-new-ui` Insider band and disabled `AccountHooks` remain **reference only**.

### Stale internal cross-reference (recorded, document not edited)

Part 23 entry **`I06`** classifies the Global Shell as *"Proposed blueprint — Medium; subordinate to
finals."* That was accurate when written. **Global Shell v1.1 is now the active Tier-4 authority.**
Where this document reasons from the proposed shell, re-check it against v1.1. The document itself was
imported unmodified.

---

## Conflict 12 — Approved Shell v1.1 references 5 SVGs held under `superseded-source-versions/` (LOW — NEW)

Global Shell **v1.1** references all five companion visuals by name:

```
bp02-desktop-anonymous.svg
bp02-desktop-signed-in.svg
bp02-mobile-anonymous.svg
bp02-mobile-signed-in.svg
bp02-section-library.svg
```

These were supplied **only** with the v1.0 package. v1.1 arrived as a standalone Markdown file with no
visuals. Per the LRG-CTL-002A instruction to keep the v1.0 document *and its companion SVGs* under
`superseded-source-versions/`, the SVGs were **left in place and not moved**.

**Net effect:** the active Tier-4 shell blueprint at `01-approved-blueprints/shell/` references five
visuals that physically reside in the quarantine folder.

**Why this is LOW, not blocking.** v1.1 **§0.1 Visual-reference boundary** explicitly declares these
visuals **non-binding shell references** that do *not* approve final styling, colors, typography,
section density, content order, ad volume, or high-fidelity layout. Nothing binding depends on their
location.

**Founder decision available (not taken here):** either (a) leave as-is — the SVGs are non-binding and
provenance stays honest, or (b) copy the five SVGs into
`01-approved-blueprints/shell/` as v1.1 companion references while keeping the v1.0 originals in place.
**Option (b) was not performed**, because the task instruction was to keep the v1.0 companion SVGs
where they are.

---

## Conflict 4 — Package filenames contradict internal document status (MEDIUM)

Filenames were demonstrably unreliable in this import. Recorded so no future task classifies by
filename.

| Filename / package | What the name implies | Actual internal metadata |
|---|---|---|
| `02-global-shell-and-section-library-blueprint-package.zip` | *(no marker — ambiguous)* | Contains **v1.0, "Proposed blueprint — ready for founder review"** |
| `02-global-shell-and-section-library-blueprint.md` | no status marker | **NOT approved** — proposed |
| `05-…-FINAL-APPROVED-package.zip` → `reference-original-v1.0/` | inside a "FINAL-APPROVED" package | Three documents internally **"Proposed … ready for founder review"** |
| `06-…-research-original.md` | "original" | **"Research and product recommendation — not yet a frozen blueprint"**, no version field |
| `08-…-FINAL-APPROVED-package.zip` → `reference/` | inside a "FINAL-APPROVED" package | Two copies internally **v1.0 "ready for founder review"** |
| `07A`, `07B`, `07C`, `08A`–`08D`, `06-…-blueprint`, `06-…-content-template` | *(nothing implies version)* | **v1.0 and legitimately approved** — approval is carried by `Status`, not version number |

**Key lesson:** a **v1.0** document may be fully approved (`06-…-blueprint`, `07A`, `08A`), while
another **v1.0** document is not approved at all (`02-global-shell`). **`Status` is the deciding
field, never the version number and never the filename.**

**Action taken:** all 21 imported documents classified from internal metadata. No filename was used
as evidence. No file was renamed.

---

## Conflict 5 — Unapproved v1.0 originals bundled inside approved packages (MEDIUM)

Three approved packages shipped unapproved earlier versions alongside the approved documents:

| Origin inside package | File | Internal version | Internal status |
|---|---|---|---|
| `05-…-package/reference-original-v1.0/` | `05-lotterycorner-game-page-blueprint-index.md` | 1.0 | Proposed decision and blueprint index — ready for founder review |
| `05-…-package/reference-original-v1.0/` | `05A-lotterycorner-flagship-game-page-blueprint.md` | 1.0 | Proposed blueprint — ready for founder review |
| `05-…-package/reference-original-v1.0/` | `05B-lotterycorner-jurisdiction-game-page-blueprint.md` | 1.0 | Proposed blueprint — ready for founder review |
| `06-…-package/` (top level) | `06-lotterycorner-yearly-results-archive-research-original.md` | *none* | Research and product recommendation — not yet a frozen blueprint |
| `08-…-package/reference/` | `08-lotterycorner-community-forum-engagement-research.md` | 1.0 | Research and strategic recommendation — ready for founder review |

**Action taken:** all five moved to `03-docs/02-previous-work/superseded-source-versions/`, unmodified
and un-renamed. **None sits beside an active approved document.**

**Corroborating evidence:** two approved documents *declare their own supersession*, which confirms
this classification rather than relying on folder names:

- `06-…-research-FINAL-APPROVED.md` v1.1 → `Supersedes: 06-lotterycorner-yearly-results-archive-research.md`
- `08-…-research-FINAL-APPROVED.md` v1.1 → `Supersedes: 08-lotterycorner-community-forum-engagement-research.md`

**Note:** no v1.0 of `05C-…-tools-and-ai-insights-blueprint` was supplied. Not a conflict — recorded
for completeness.

---

## Conflict 6 — Approved documents duplicated as `reference/` copies inside another package (LOW)

The Game package bundled convenience copies of two already-approved documents:

```
05-…-FINAL-APPROVED-package/reference/03-lotterycorner-home-page-blueprint-FINAL-APPROVED.md
05-…-FINAL-APPROVED-package/reference/04-lotterycorner-state-page-blueprint-FINAL-APPROVED.md
```

**Verified byte-identical** (SHA-256) to the standalone approved copies:

| Document | SHA-256 (both copies) |
|---|---|
| Home blueprint v1.1 | `e9449a1476115c1b2d33ff848cffcb70db5bb49f00085059816d2aea67153f85` |
| State blueprint v1.1 | `3691046580ed7728a7abf92e54b6122d850a5bb22cb38c17b7d42d6d14e2223d` |

**Action taken:** **not imported.** The canonical single copies live at
`01-approved-blueprints/home/` and `01-approved-blueprints/state/`. Importing them again would create
two paths for one authority — the exact duplication this hierarchy exists to prevent.

**No conflict of content** — the versions are identical, so there is no ambiguity about which is
authoritative.

---

## Conflict 7 — Byte-identical duplicate file inside the Community package (LOW)

```
08-…-package/reference/08-lotterycorner-community-forum-engagement-research.md
08-…-package/reference/08-lotterycorner-community-forum-engagement-research(1).md
```

Both are **v1.0, "Research and strategic recommendation — ready for founder review"**, and both hash
to `e60e6618df6686436693126757deff0a201384974a632c1b81693a06ca06dc6a` — a byte-identical duplicate,
almost certainly a download artifact (the `(1)` suffix).

**Action taken:** **one copy** imported to
`02-previous-work/superseded-source-versions/08-lotterycorner-community-forum-engagement-research.md`.
The `(1)` duplicate was not imported.

---

## Conflict 8 — Internal `Document:` names differ from filenames (LOW)

| Repository path | Filename says | Internal `Document:` says |
|---|---|---|
| `00-foundation/authoritative/00A-v2.1-luckregenerator-product-constitution-FROZEN.md` | `00A-v2.1-…-FROZEN.md` | `00A-v2-luckregenerator-product-constitution.md` |
| `00-foundation/authoritative/01-lotterycorner-experience-architecture-FINAL-APPROVED.md` | `01-…-FINAL-APPROVED.md` | `01-lotterycorner-experience-architecture.md` |
| `01-approved-blueprints/home/03-…-FINAL-APPROVED.md` | `03-…-FINAL-APPROVED.md` | `03-lotterycorner-home-page-blueprint.md` |
| `01-approved-blueprints/state/04-…-FINAL-APPROVED.md` | `04-…-FINAL-APPROVED.md` | `04-lotterycorner-state-page-blueprint.md` |

**Assessment:** benign. In each case the internal `Version` and `Status` fields independently confirm
frozen/approved status, so classification is unaffected. The mismatch is recorded because it means the
internal `Document:` field **cannot** be used as a filename key when cross-referencing documents.

**Note:** the Constitution's internal name says `00A-v2` while its `Version:` field says **2.1**. The
`Version` field governs. Filenames were left unchanged.

---

## Conflict 9 — Several approved documents state no date (LOW)

Approved, but with **no** `Approved date` / `Date` field: `07A`, `07B`, `07C`, `08A`, `08B`, `08C`,
`08D`.

`07B`, `07C`, and `08A`–`08D` also omit any `Document:` field.

**Action taken:** recorded as *not stated* in `source-authority.md`. **No date was inferred** from
sibling documents, package names, or file timestamps.

**Impact:** low. Approval status is unambiguous in every case. Only precise approval chronology is
unavailable.

---

## Conflict 10 — Legacy nested repository has an uncommitted modification (LOW)

`00-reference-existing-project/LotteryCorner40` (independent nested Git repo, branch `main`, HEAD
`caf0f29`) reports:

```
 M .project
```

An Eclipse project-metadata file with 11 insertions / 1 deletion uncommitted.

**Provenance:** file mtime is **July 7, 2026 22:29** — 18 days before audit LRG-AUD-001 and before
tasks LRG-CTL-002. **Not caused by any Claude task.**

**Action taken:** **left completely untouched**, as instructed. The legacy repository was not
modified, not committed to, not converted to a submodule, and its Git configuration was not altered.
It is excluded from the root repository by `.gitignore`.

**Resolution required from the founder:** decide whether to commit, revert, or ignore this
modification **inside the legacy repository**. It is outside the scope of the root repository.

---

## Conflict 11 — `03-docs/reference-project-git-status.txt` is stale (LOW)

That checked-in file records:

```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

**Live `git status` contradicts it** — see Conflict 10 (`M .project`).

**Action taken:** the stale file was **not modified** (it is a protected existing document).
Recorded here so no future task trusts it. Its two companions,
`reference-project-staged-files.txt` and `reference-project-unstaged-files.txt`, are **0 bytes**.

**Guidance:** query the legacy repository directly with `git -C 00-reference-existing-project/LotteryCorner40 status`
rather than reading these captured snapshots.

---

## Conflicts 13–18 — State page (LRG-DEC-018)

**Origin.** Task LRG-SPEC-017 audited the State page family and recorded 20 contradictions. Task
LRG-DEC-018 applied 36 founder rulings (`ST-DEC-001`) and dispositioned all 20. **Six survive as
genuine unresolved source conflicts** and are registered below. The other fourteen were closed by a
ruling, settled by existing authority, or were documentation errors rather than conflicts between
sources — registering those here would have turned this register into a task list.

---

## Conflict 13 — State page: production emits contradictory canonical signals (MEDIUM — DECISION CLOSED 2026-08-11, IMPLEMENTATION PENDING)

> **DECISION CLOSED 2026-08-11 — IMPLEMENTATION STILL PENDING.**
>
> Settled by the ratified ``FD-RTE-01`, `FD-RTE-02` and `FD-RTE-03`` (see `route-canonical-and-migration-audit.md`, now IN FORCE).
> The canonical host is **`www`, with no trailing slash**, and it is ONE constant. `FD-RTE-01` additionally requires a self-referencing canonical on every public page, and `FD-RTE-04` fixes the `robots.txt` host mismatch alongside it.
>
> **Nothing in the application has changed yet, and this conflict is NOT resolved in the repository.** `productionOrigin.ts` still holds the non-`www` constant, `siteSchema.ts` still holds the `www` one, and reconciling them to a single `www` value is `FD-RTE-03` implementation work — explicitly out of scope of the instruction that ratified it.
> Until that lands, the state described below is still the state of the code. The distinction matters: a closed
> decision with pending implementation is a scheduled task; a resolved conflict is one you can stop thinking about.

The production State template `WEB-INF/upgrade/results/lottery-result_upgrade_as_new.jsp` emits
**mutually inconsistent statements about its own URL**:

| Signal | Value |
|---|---|
| `<link rel="canonical">` | `https://www.lotterycorner.com/{state}` — **no trailing slash** |
| `WebPage` JSON-LD `url` and `@id` | `https://www.lotterycorner.com/{state}/` — **with trailing slash** |
| `BreadcrumbList` JSON-LD item url | `…/{state}/` — with trailing slash |
| `og:url` | `…/{state}` — no trailing slash |
| `relatedLink` game URLs | `…/{state}/{game}/` — with trailing slash |

Legacy `struts.xml` separately routes **both** `/{state}` and `/{state}/`, so both URLs resolve.
The recorded migration target is non-`www` with no trailing slash; production is `www`.

**Why it is not resolved.** `FD-S-32` **defers** the canonical, host and trailing-slash decisions to a
dedicated SEO/infrastructure review, and forbids emitting a new convention during State preview
implementation. The deferral settles *what to do next*; it does not settle the contradiction.

**Status.** Tracked as `OPEN-ST-05`. **Blocks production route cutover only** — not a guarded preview.

---

## Conflict 14 — First-party commerce route: `/play/{game}` vs `/buynow/{code}` (MEDIUM — DECISION CLOSED 2026-08-11)

> **DECISION CLOSED 2026-08-11 — IMPLEMENTATION STILL PENDING.**
>
> Settled by the ratified ``FD-RTE-06`` (see `route-canonical-and-migration-audit.md`, now IN FORCE).
> **`/buynow/{code}` is confirmed as the first-party commerce route**, and `CLAUDE.md` §10's *"approved pattern is `/play/{game}`"* has been amended to say so. No migration to `/play/{game}` will happen.
>
> **Nothing in the application has changed yet, and this conflict is NOT resolved in the repository.** `CLAUDE.md` §10 was amended on the same authority, so the GOVERNANCE record is now correct. The application already serves `/buynow/{code}`, so unusually for this group there is little left to build — what remains is that `/play/{game}` appears in BP-04A §5 and in BP-05C, and those blueprints have not been amended.
> Until that lands, the state described below is still the state of the code. The distinction matters: a closed
> decision with pending implementation is a scheduled task; a resolved conflict is one you can stop thinking about.

> **Updated 2026-08-07 by `ROUTE-AUDIT-001`.** Live evidence: `/buynow/fl-powerball` and `/buynow/` both return
> **`302 → /`** (the no-partner safe fallback), and live `robots.txt` carries **`Disallow: /buynow/`** —
> confirming the legacy behaviour recorded below. `SITEMAP_EXCLUDED_PREFIXES` already excludes `/buynow`.
>
> The two candidates differ only in the path token and its argument. **`{code}` is strictly more capable:** it can
> encode state, game, partner and campaign in one opaque token without leaking a partner domain, whereas
> `{game}` alone cannot express the state-aware eligibility `CLAUDE.md` §13 requires.
>
> **[PROPOSED] `FD-RTE-06` — keep `/buynow/{code}` and amend `CLAUDE.md` §10's `/play/{game}`.** Not approved.
> Evidence confidence high; does not block Powerball/Mega Millions work. See the audit §5.

| Source | Value |
|---|---|
| Approved blueprint (BP-04 index §4) | `/play/{game}` |
| Current implementation | `/buynow/{code}` — returns **200 text/plain** with `X-Robots-Tag: noindex, nofollow` |
| Legacy production | `/buynow/*` → Struts `AffiliateAction` → **302**, robots-disallowed |

Three sources, three behaviours. `CLAUDE.md` §10 lists this as requiring the URL audit and founder
approval, and forbids switching either way silently.

**Why it is not resolved.** `FD-S-20` defers commerce activation for the State preview; `FD-S-32`
defers the route decision to the URL and migration review.

**Constraint that holds regardless** (`FD-S-34`): **`/buynow/` must remain non-indexable.** It is
currently crawlable, because no `robots.txt` exists in the new implementation.

**Status.** Tracked as `OPEN-ST-05`. Blocks commerce activation and route cutover.

---

## Conflict 15 — Ad no-fill behaviour specified three different ways (MEDIUM — OPEN)

| Source | Specifies |
|---|---|
| Legacy production State template | `googletag.pubads().collapseEmptyDivs()` — the div collapses |
| `04-sample-data/ad-slot-definitions.json` | `lazyLoadDefaults.collapseIfEmpty: false` — the slot does **not** collapse |
| DS-24 (Tier 1, *approved with ad-operations validation*) | Collapse the **inner creative area**, retain the **outer placement geometry**, suppress the label |

Three specifications for the same situation, from three tiers.

**Why it is not resolved.** DS-36 states that **where ad operations require a different treatment,
theirs prevails and DS-24 is amended**. Only ad operations can close it.

**Interim behaviour:** the State preview uses the DS-24 treatment.

**Status.** Tracked as `OPEN-ST-04`.

---

## Conflict 16 — Recorded State ad inventory diverges from source evidence (MEDIUM — OPEN)

Three divergences between `04-sample-data/ad-slot-definitions.json` and the legacy source, all found
by a deterministic Python scan (`state-ad-inventory-reconciliation.md` §0, §4):

**(a) Wrong provenance citation.** `_meta.purpose` states the values were *"taken verbatim from
`lottery-result_upgrade_as.jsp`"*. `struts.xml` **never references that file**. The production State
route resolves to `lottery-result_upgrade_as_new.jsp`. Both files were scanned and their slot
inventories are **identical**, so no recorded *value* is wrong — but any future re-audit that follows
the citation reads a non-production template.

**(b) Two "UNKNOWN" fields are resolvable.** `sp_toppromobar` is recorded with
`divId: "UNKNOWN — not defined in this JSP"` and sizes `[[430,71]]`; the template defines it at
`_as_new.jsp` L170 as `div-gpt-ad-1704994141196-0` with sizes `[[430,71], 'fluid', [1920,45]]` — two
sizes the record omits. `atv_video_player` is recorded `divId: "UNKNOWN"`; the template defines it at
L169 as `div-gpt-ad-1715268442152-0`.

**(c) Wyoming slots have no source evidence.** `wy_on_results_table_pos1` and `_pos2` are recorded as
`pageType: "state"`, `stateCode: "wy"`. A full-tree scan finds **zero `defineSlot` calls and zero
rendered divs anywhere** — only two HTML comments in
`WEB-INF/upgrade/insider/user/myfavouritegames_upgrade.jsp` (L334, L350), an **Insider member page,
not a state page**. They may nonetheless be live GAM units with delivery.

**Why it is not resolved.** (a) and (b) are corrections to `04-sample-data/**`, which no approved task
currently has write scope for. (c) requires ad operations to confirm whether the GAM units exist —
`CLAUDE.md` §12 forbids dropping them on this evidence alone, and `FD-S-27` accordingly **excludes
them from the active State preview baseline while retaining the evidence record**.

**Status.** (a) and (b) need an approved data task. (c) is tracked as `OPEN-ST-02`.

---

## Conflict 17 — `atv_video_player`: retired for Home, rendered in State production (LOW — OPEN)

The GAM unit `/21828142944/LC_ATV_video_player` (div `div-gpt-ad-1715268442152-0`) was **retired** for
the Home page by LRG-ADS-015 §2, on the recorded ground that *"the former video/commercial
relationship is no longer active."*

The **same unit is defined and rendered on the production State page** — `_as_new.jsp` L169 (define)
and L792 (render), inside the results list, mobile-only via `desk-ads0`.

The Home decision was explicitly Home-scoped. Whether it extends to State is not settled by it.

**Why it is not resolved.** `FD-S-26` **defers** to State-specific ad-operations confirmation and
directs that the unit be **kept disabled in the State preview** — explicitly *not* assumed retired,
and explicitly not active.

**Status.** Tracked as `OPEN-ST-02`.

---

## Conflict 18 — Prohibited legacy marketing copy live in the production State template (MEDIUM — OPEN)

The legacy State template contains a "Welcome to [State] Lottery Corner" carousel
(`lottery-result_upgrade_as.jsp` L814–L906) whose copy states that LotteryCorner *"offers an effective
solution for you to **increase your chances** of winning the perfect combination"* and that
*"the Pattern Prediction of Lottery Corner… can relatively **give you an advantage** on your lottery
stakes."*

This directly violates **Product Constitution v2.1 §7**, which prohibits language that asserts
prediction, implies that history or AI generation changes the odds of a fair independent draw, or says
**"increase your chances."**

**Why it is not resolved.** Remediating live production copy is exactly **open Member/Insider decision
12** (Conflict 3): *"approve removal/rewrite of 'increase chances,' unverified winning claims and
placeholder testimonials."* That decision is one of the 11 still outstanding.

**Binding regardless of that decision:** this copy is classified **ARCHIVE — must not be migrated**.
No rebuilt State page may carry it.

**Status.** Cross-referenced to Conflict 3, decision 12. The migration prohibition is not in doubt;
the remediation of the live production page is.

---

## Documents expected by the inventory — ALL NOW SUPPLIED

| Expected document | Slot | Status |
|---|---|---|
| `02-global-shell-and-section-library-blueprint` **v1.1** (Final approved and frozen) | `01-approved-blueprints/shell/` | ✅ **SUPPLIED AND IMPORTED** (LRG-CTL-002A, Conflict 1) |
| `01-ai-search-geo-research.md` | `00-foundation/research/` | ✅ **SUPPLIED AND IMPORTED** (LRG-CTL-002A, Conflict 2) |
| `09-lotterycorner-member-and-insider-experience-research-and-blueprint.md` | `01-approved-blueprints/insider/pending/` | ✅ **SUPPLIED AND IMPORTED** under `pending/` (LRG-CTL-002A, Conflict 3) |

**No expected source document is missing.** The repository now holds **24 governed documents** (22
final-approved/frozen + 1 pending + 1 additional foundation research) plus **14 companion visuals**, and
`03-docs/research/00-search-seo-research.md` remains active at its original path.

**No document was invented, relabelled, or substituted to fill a gap** in either LRG-CTL-002 or
LRG-CTL-002A.

**The remaining blocker is a decision blocker, not a document blocker:** the 11 still-open Member/Insider
founder decisions in Conflict 3.

---

## Conflict 19 — Pick 3 ticket price: production export omits the 50-cent play (MEDIUM — RESOLVED)

**Recorded by** LRG-GAME-050, 2026-08-04.

| Source | Value |
|---|---|
| `04-sample-data/reference-tables/game.csv` `TICKET_PRICE` (game ids 332/333) | `1$` |
| Florida rule **`53ER24-56` §1b**, read 2026-08-04 | *"Players may choose play amounts of $.50 or $1.00 per play, per drawing."* |

**Resolution — official wins.** This is not a rounding difference: **every prize in the Pick 3 matrix is exactly
half at 50 cents**, so a page built on the export would overstate a 50-cent player's prize by 100%. Both wagers
are now published and the payout table is keyed by wager.

**Scope.** The same export supplies `TICKET_PRICE` for all Florida games. Only Pick 3 was verified in this task;
the other nine Florida families remain export-only for this field and must not be published without their own
primary-source pass.

---

## Conflict 20 — Pick 3 Advance Play: fourteen DRAWS versus fourteen DAYS (LOW — RESOLVED)

**Recorded by** LRG-GAME-050, 2026-08-04.

| Source | Value |
|---|---|
| `game.csv` `ADVANCED_PLAYS` | `upto 14 consecutive draws` |
| Florida rule **`53ER24-56` §1f** | Consecutive midday, evening or both drawings within a **fourteen-day** period, or non-consecutive drawings within a seven-day period |

**Resolution — official wins.** Fourteen days is not fourteen drawings: with `BOTH` draw times selected it is up
to twenty-eight drawings.

---

## Conflict 21 — Pick 3 payout matrix in the production export is a CLOSED pre-2021 rule era (HIGH — RESOLVED)

**Recorded by** LRG-GAME-050, 2026-08-04. The most consequential of the three.

| Source | Content |
|---|---|
| `game.csv` `PRIZE_MATRIX` (game id 332) | A complete-looking Pick 3 table containing **`1-OFF`** rows and **no FIREBALL** rows |
| Florida rule **`53ER24-56` §2–§4** | Enumerates Straight, Box, Straight and Box, Combo, Front Pair and Back Pair, plus the FIREBALL add-on. **`1-OFF` appears zero times** |
| Florida **Pick 3 fact sheet**, read 2026-08-04 | *"January 18, 2021 The FIREBALL add-on feature for all PICK Daily Games was introduced, and the 1-OFF play style ended."* |
| `files.floridalottery.com/exptkt/Cash3w1-OFFRules082010.pdf` | 1-OFF was a **CASH 3** rule; CASH 3 was renamed PICK 3 on 2016-08-01 |

**Resolution — official wins, and the export is reclassified rather than corrected.** The combination of 1-OFF
present and FIREBALL absent **dates the export before 2021-01-18**. It is therefore not an approximation of the
current matrix; it is a different game.

**Disposition.** Retained in code as `PICK3_PRE_FIREBALL_ERA`, marked `verification: "retiredEra"` and
`retired: true`, so historical draws from 2015-03-16 to 2021-01-17 still resolve against the rules that applied
(BP-04B §34 preserves old rule eras). `eraPublishableAsCurrent()` reads the verification status, so the retired
era **cannot be published as current fact by any caller**. 1-OFF is excluded from all public content, verified
by test and by a rendered-HTML scan.

**Why this is registered rather than quietly fixed.** Any future task that "refreshes" the payout matrix from
`game.csv` would silently reintroduce a play type Florida stopped selling in 2021.

---

## Conflict 22 — Pick 3 Advance Play horizon: promulgated rule versus public web page (LOW — OPEN)

**Recorded by** LRG-GAME-050, 2026-08-04.

| Source | Value |
|---|---|
| Florida rule **`53ER24-56` §1f** | A fourteen-day / seven-day advance-play period |
| A summary reading of the public Florida Lottery Pick 3 game page | Suggested "up to 6 months in advance" |

**Resolution applied — the promulgated rule wins**, as the primary legal document, and it is internally
self-consistent (§1f defines both the fourteen-day and seven-day windows and the retailer parameters).

**Why it stays OPEN.** The discrepancy was not reconciled at source: it is possible the web page describes a
different mechanic, or that the summary reading was wrong. The published fact should be re-verified against the
operator before it ships to production.

---

## Conflict 23 — `/fl/pick-3` and `/fl/cash-pop` do not exist in production (MEDIUM — **EVIDENCE COMPLETE, DECISION OPEN**)

> **Updated 2026-08-07 by `ROUTE-AUDIT-001` (task LRG-ROUTE-055).** Every factual question this conflict raised is
> now answered, by repository count and by live request. **What remains open is one founder decision — the
> canonical model — not any missing evidence.** Three viable models are compared in the audit §3.3 with SEO,
> user-experience, data-model and redirect consequences; the audit recommends **Model C, staged, with nothing
> executed yet**. See `route-canonical-and-migration-audit.md`.
>
> | Question | Answer | Evidence |
> |---|---|---|
> | Pick 3 Midday archives | `/fl/pick-3-midday/{year}` — **16** sitemap years (2008–2023); **live 2008–2026 (19)** | sitemap + live |
> | Pick 3 Evening archives | `/fl/pick-3-evening/{year}` — **36** sitemap years (1988–2023); **live 1988–2026 (39)** | sitemap + live |
> | Does `/fl/pick-3/{year}` exist? | **No.** Absent from all 9,246 entries; `/fl/pick-3/2026` returns **404** live | sitemap + live |
> | Cash Pop structure | **Five** variant hubs (`morning`, `matinee`, `afternoon`, `evening`, `late-night`), 2 years each, **10** archive URLs. `/fl/cash-pop` returns **404** live | sitemap + live |
> | `/fl/pick-3`, `/fl/pick-2`, `/fl/pick-4`, `/fl/pick-5` | All **404** live — confirmed, not merely absent from the sitemap | live |
> | At stake for Florida Pick 3 | **52** indexed archive URLs + 2 hubs, oldest **1988** | sitemap |
>
> **Exact sitemap counts, verified:** 9,246 `<loc>`, all distinct, all `https://www.lotterycorner.com`; depth
> 1/2/3 = **68 / 477 / 8,700**; **456** state-game pairs, each with archives; years **1976–2023**. The live
> `sitemap.xml` is identical to the repository copy. **It is three years stale** — production serves 2024, 2025
> and 2026 archives that no sitemap declares.

**Recorded by** LRG-GAME-050, 2026-08-04. Founder decisions 2, 3 and 4 of 2026-08-04 settle the immediate
action; the SEO consequences remain open.

**Evidence.** `Game.getGameNameForURL()` derives a legacy game URL from `game.NAME` (strip `/`, spaces to
hyphens, lowercase); `struts.xml` maps `*/*` → `page=game` and `*/*/*` → `page=gameHistory`. Cross-checked
against the production sitemap (`WebContent/sitemap.xml`, 9,246 URLs, all `https://www.lotterycorner.com`, no
trailing slash).

| Candidate in the 2026-08-04 brief | Reality |
|---|---|
| `/fl/pick-3`, `/fl/pick-2`, `/fl/pick-4`, `/fl/pick-5`, `/fl/cash-pop` | **Do not exist.** These are INTRODUCE routes, not preserved ones |
| `/fl/pick-3-midday` (332) / `-evening` (333) | Exist, with **16 and 36** indexed archive years |
| `/fl/florida-lotto` → `/fl/lotto` | **Inverted.** `/fl/florida-lotto` does not exist; `/fl/lotto` (game 337, "Lotto") is already the live URL. Row removed from the proposal per founder decision 3 |
| `/fl/fantasy-5-evening` → `/fl/fantasy-5` | **Both wrong.** `/fl/fantasy-5-evening` does not exist, and `/fl/fantasy-5` already exists with 23 archive years serving **game 336 alone**. Consolidation would change what an existing indexed URL shows, not merge two variants into a new page |

**Action taken.** `/fl/pick-3`, `/fl/cash-pop` introduced under the guard only, `noindex`, no sitemap entry, no
redirect. `/fl/jackpot-triple-play` preserved unmodified. All variant-year archive URLs untouched per founder
decision 4.

**What remains open.** The consolidation target for the ~52 Florida Pick 3 variant-year archive URLs (and the
equivalent sets for Pick 2/4/5 and Cash Pop). The recorded recommendation is a single family archive such as
`/fl/pick-3/{year}` carrying Midday and Evening together, which requires the URL audit in `CLAUDE.md` §10 before
any redirect map is designed.

---

## Conflict 24 — Duplicate `<main>` landmark on guarded Game Pages (LOW — RESOLVED)

**Recorded by** LRG-GAME-050, 2026-08-04. **Pre-existing at `b57b72e`.**

`app/layout.tsx` wraps `children` in `<main>` in its **non-home-preview** branch. The Game Page supplied its own
`<main>` unconditionally, so with `LC_HOME_PREVIEW` unset both existed and the page carried two nested `main`
landmarks — WCAG 2.2 1.3.1 / 4.1.2, and an ambiguous skip-link target.

`florida-powerball-game-page-v0-implementation.md` §8 records the opposite ("the preview shell in
`app/layout.tsx` omits one"). That statement is true only when the home preview is ON, which is how V0 was
measured. **Correction recorded here rather than by editing the V0 record.**

**Resolution.** The Game Page's wrapper is now conditional on whether the layout supplied a landmark. Both
`/fl/powerball` and every JG-M2 route render exactly one `<main>`, verified in built output.

---

## Conflict 25 — Two operating guides for two agents (LOW — OPEN)

**Recorded by** LRG-GAME-050, 2026-08-04.

`AGENTS.md` (untracked at the time of this task) is a Codex-flavoured copy of `CLAUDE.md`. Diffed: identical
authority hierarchy, repository map, and all governance rules; only the title, the self-reference row in §3 and
the `.claude` → `.Codex` settings paths differ.

**No contradiction exists today.** The risk is drift — two copies of the source-of-truth hierarchy that must be
edited in lockstep. Recommend either a single guide with an agent-agnostic name, or one guide plus a thin
agent-specific preface that carries no rules of its own. Founder decision required.

---

## Non-conflicts explicitly checked and cleared

| Check | Result |
|---|---|
| News & Editorial package (`07`) presence | **Present** — all four documents imported. An earlier partial report suspected it absent; that suspicion was wrong and is corrected here |
| `00-search-seo-research.md` duplication | **No duplicate created.** No copy was supplied in this import, so there is no later version. Existing `03-docs/research/00-search-seo-research.md` remains the active copy, unmoved and unedited |
| ZIP archives copied into the repository | **None.** Only governed Markdown and companion visual files were extracted; archives were expanded outside the repository |
| Approved documents placed beside superseded versions | **None.** `01-approved-blueprints/` contains no proposed, original, reference, or superseded file. Global Shell v1.0 remains isolated in `02-previous-work/superseded-source-versions/` while v1.1 occupies `shell/` |
| Any supplied document edited during import | **None.** All imports are byte-for-byte copies, SHA-256 verified |
| Member/Insider relabelled as approved | **No.** Retained under `insider/pending/` with classification `PENDING FOUNDER DECISIONS`, per its own internal status |
| Global Shell v1.0 deleted or promoted | **Neither.** Retained unmodified as superseded historical reference, with its five companion SVGs |
| Navigational placeholder READMEs | **Removed** in LRG-CTL-002A (`shell/README.md`, `insider/pending/README.md`) — both slots now hold real documents, so the placeholders were obsolete |
| Trailing whitespace in authoritative Markdown | **Not stripped.** Two-space hard line breaks are the source documents' own Markdown syntax; imports are byte-identical |

---

## Revision History

| Task | Date | Change |
|---|---|---|
| LRG-CTL-002 | July 25, 2026 | Register created with 11 conflicts. Conflicts 1, 2, 3 recorded three **missing** source documents. |
| LRG-CTL-002A | July 25, 2026 | **Conflict 1 RESOLVED** — Global Shell v1.1 imported as Tier-4 authority; v1.0 reclassified superseded. **Conflict 2 RESOLVED** — AI Search/GEO research imported as Tier-6. **Conflict 3 REWRITTEN** — document now present under `pending/`; the missing-file issue is replaced by its 12 Part 22 founder decisions (1 already satisfied, 11 open). **Conflict 12 ADDED** — approved v1.1 references 5 SVGs held in `superseded-source-versions/`. **Conflicts 4–11 preserved unchanged.** |
| LRG-DEC-018 | July 27, 2026 | **Conflicts 13–18 ADDED** — the six State-page contradictions that survived the 36 founder rulings recorded in `state-page-founder-decisions.md` (`ST-DEC-001`): production canonical contradiction · `/play` vs `/buynow` · three-way no-fill specification · recorded State ad inventory vs. source evidence · `atv_video_player` Home-vs-State scope · prohibited legacy copy live in the production State template. Fourteen further State contradictions were **closed by ruling or reclassified as documentation errors** and deliberately not registered. **Conflicts 1–12 unchanged.** |
| LRG-GAME-050 | August 4, 2026 | **Conflicts 19–25 ADDED** — the Game Page contradictions found while verifying Florida Pick 3 against primary operator sources: three production-export errors (ticket price omits the 50-cent play · Advance Play draws-vs-days · the export's payout matrix is a closed pre-2021 era containing the withdrawn 1-OFF play type), the Advance Play horizon discrepancy between the promulgated rule and the public web page, the proven route inventory that corrects three rows of the 2026-08-04 brief's candidate redirect table, the pre-existing duplicate `<main>` landmark on guarded Game Pages, and the two-operating-guide drift risk. **Conflicts 1–18 unchanged.** |

---

## Conflict 26 — Production serves every page at many URLs with no canonical tag (HIGH — DECISION CLOSED 2026-08-11, IMPLEMENTATION PENDING)

> **DECISION CLOSED 2026-08-11 — IMPLEMENTATION STILL PENDING.**
>
> Settled by the ratified ``FD-RTE-01`, `FD-RTE-02` and `FD-RTE-04`` (see `route-canonical-and-migration-audit.md`, now IN FORCE).
> Host, slash and case are canonicalised **at the edge, to the `www` no-trailing-slash form, in one 301 hop**, and every public page emits a self-referencing canonical. §10's five-stage rollout is the authorised plan: canonical tags first (Stage 1, no route risk), the edge rule second (Stage 2, reversible in one action).
>
> **Nothing in the application has changed yet, and this conflict is NOT resolved in the repository.** No canonical tag is emitted on a public page, no edge rule exists, and `robots.txt` still advertises the non-`www` sitemap host against `www` `<loc>` entries. This is the single highest-value item now unblocked, and it is the recommended next task.
> Until that lands, the state described below is still the state of the code. The distinction matters: a closed
> decision with pending implementation is a scheduled task; a resolved conflict is one you can stop thinking about.

**Recorded by** `ROUTE-AUDIT-001`, task LRG-ROUTE-055, 2026-08-07. **Live-production evidence**, measured by HTTP
request on that date.

Production returns `200` for every one of these variants of the same page, and emits **no `<link rel="canonical">`,
no `<meta name="robots">` and no `og:url`** on any of them:

| Variant | Result |
|---|---|
| `https://www.lotterycorner.com/fl` | `200` |
| `https://lotterycorner.com/fl` — **non-`www`, no host redirect** | `200` |
| `…/fl/pick-3-evening/` — trailing slash | `200` |
| `…/fl/pick-3-evening/2023/` — trailing slash at depth 3 | `200` |
| `…/FL/pick-3-evening/2026` — upper-case state | `200` |
| `…/Fl/pick-3-evening/2023` — mixed case | `200` |
| `…/fl/PICK-3-EVENING/2023` — upper-case slug | `200` |

The only redirect on the canonical path is **HTTP → HTTPS, `301`, host preserved**. It canonicalises neither host,
slash nor case.

Counting only the certain axes — 2 hosts × 2 slash forms × 4 case forms of the state segment — that is **at least
16 live indexable URLs for each of the 9,246 sitemap entries**, with nothing to consolidate them.

**Production emits the variant form itself.** An out-of-range archive year returns
`302 → /FL/pick-3-evening/2026` — a `Location` carrying an **upper-case** state code, and a **many-to-one redirect
that discards the requested year**.

**Root cause, partly identified.** `struts.xml` declares the trailing-slash twins **explicitly** — `*/`, `*/*/`,
`*/*/*/` and `*/*/*/*/` are separate actions beside their unslashed forms. The duplication is deliberate legacy
design, not a web-server default. Where the case-insensitivity and the HTTPS redirect are implemented is
**[UNKNOWN]** — no Cloudflare or Apache configuration access was available; `Server: cloudflare` on every response
is the only signal.

**Two further live contradictions:**

1. `robots.txt` advertises `https://lotterycorner.com/sitemap.xml` (**non-`www`**) while all 9,246 `<loc>` entries
   are **`www`**.
2. `CLAUDE.md` §11 and `lib/seo/productionOrigin.ts` record a **non-`www`** canonical target; `lib/seo/siteSchema.ts`
   still carries `SITE_URL = "https://www.lotterycorner.com"`.

**Why it is HIGH.** It is pre-existing and unrelated to the rebuild, but every new page inherits whatever host,
slash and case policy the edge applies, so **no canonical decision for the Game or History pages can be made
independently of it**. The guarded previews are `noindex`, so nothing is leaking today.

**Proposed** — `FD-RTE-01` (canonicalise host, slash and case at the edge in **one hop**, plus a self-referencing
canonical tag on every public page) and `FD-RTE-02` (settle the host; the audit recommends **staying on `www`**,
which would reverse the recorded non-`www` target). Both are **proposals**, not decisions.

**Status.** Blocks: the canonical cutover for every page family. Does not block guarded preview work.

---

## Conflict 27 — Two live route families have no sitemap representation (LOW — NEW, OPEN)

**Recorded by** `ROUTE-AUDIT-001`, 2026-08-07. **Repository evidence** from `struts.xml`.

Beyond the four known families, the legacy application declares two more that appear **zero times** in the
9,246-URL sitemap:

| Pattern | Struts action | Sitemap entries |
|---|---|---|
| `/{state}/{year}/{month}/{day}` | `*/*/*/*` → `StateResultsAction` with `selectedYear`, `selectedMonth`, `selectedDay` | **0** |
| `/{state}/{game}/jackpotanalysis` | `*/*/jackpotanalysis` | **0** |

Neither was probed live and neither has measured traffic. They may be dead, intentionally unindexed, or an
undeclared surface with real inbound links. **Until classified, neither can be preserved, redirected or removed
with any confidence** — and `CLAUDE.md` §10 forbids acting on a route without evidence.

**Proposed** — `FD-RTE-12`: scope a follow-up audit covering live status, traffic and inbound links for both.
Does not block Powerball/Mega Millions work.

---

## Conflict 28 — "Visible but locked" signed-in controls contradict `FD-ACC-07`, `FD-ACC-14` and `FD-DAT-17` (MEDIUM — RESOLVED FOR THIS TASK BY TIER-1 INSTRUCTION, STANDING RULE STILL OPEN)

**Recorded by** LRG-FLAGSHIP-002, 2026-08-07, while implementing the guarded root flagship hubs `/powerball` and
`/mega-millions`.

### The contradiction

| Source | Tier | Says |
|---|---|---|
| **Active founder instruction (this task)** | **1** | *"signed-in gated tools that remain visible but require sign-in to use"*; *"signed-in-only controls must remain visible but locked"*; and, for alerts, *"Visible controls: jackpot threshold alert, draw reminder, winning number alert, favorite numbers alert, weekly digest"* |
| BP-04A §31 | 4 | *"All tools are publicly discoverable … Do not hide an Insider tool entirely."* **Public Preview**: inputs, explanation and sample output visible; Run asks for sign-in |
| BP-05C §0.1 | 4 | The same four access patterns, with the same visible-preview rule |
| `DATA-DEC-001` `FD-DAT-03` | 1 | *"High-value interactive capabilities must remain **visibly discoverable** … They must not be hidden merely because the visitor is signed out"* |
| `ACCT-DEC-001` `FD-ACC-07` | 1 | Follow, save, bookmark, saved searches, alerts and My Number Sets **remain hidden**. *"Hidden means **absent**, not disabled and not labelled. No control, no card, no badge, no tooltip and no explanatory placeholder"* |
| `ACCT-DEC-001` `FD-ACC-14` | 1 | Disabled and "Coming soon" account controls are **not permitted** |
| `DATA-DEC-001` `FD-DAT-16`/`FD-DAT-17` | 1 | Remove the executing surfaces now; restore the visible gate **when the real shared Account and sign-in continuation flow works end to end**. No fake login modal, placeholder route, non-functional button or "Coming soon" |

`FD-DAT-03` and `FD-DAT-16` are already in tension with each other inside `DATA-DEC-001`, and that record
reconciles them by *timing*: discoverability is the rule **once sign-in works**, and absence is correct **while it
cannot work at all**. No sign-in flow exists, so under `DATA-DEC-001` alone the controls would be absent today.

### How it was resolved for this task

`CLAUDE.md` §2 puts an **explicit founder instruction in the active task at Tier 1**, above the decision registers.
The instruction is unambiguous and repeated three times, and the two tier-4 blueprints point the same way. The
flagship hubs therefore render the gated capabilities **visible and locked**.

**What the override did NOT licence.** The substance of `FD-ACC-14` and `FD-DAT-17` is preserved in full:

1. No control is `disabled`. Each is a real, keyboard-reachable button that does something visible.
2. No control says "Coming soon". Each states what the capability does and that accounts are not connected.
3. **No control links to a sign-in route**, because none exists. `authAvailable` is the seam a real flow plugs
   into and is `false` everywhere; no `/login`, `/signin` or `/register` href is emitted.
4. **No control reports success.** Nothing anywhere claims a save, follow or alert happened; the panel says in
   plain words that nothing was turned on and nothing was stored.
5. Nothing mentions a plan, tier, trial, quota or upgrade (`FD-ACC-16`, `FD-DAT-06`), and the copy carries the
   word *free* (`FD-DAT-04`).
6. Each option shows its own frequency before it is chosen, and states that following alone sends nothing
   (`FD-ACC-18`).

Enforced by test, not by intention: `tests/flagship-game.test.ts` asserts 1–5 against the component sources.

### What remains open

**Is "visible but locked" now the standing rule for every page family, or a flagship-only exception?**

This matters immediately, because the two families are now inconsistent:

- the Yearly History Page removed Ask and the CSV/print controls entirely under `FD-DAT-16` (LRG-ARCHIVE-059);
- the jurisdiction Game Page's `GameSaveControls` renders options but suppresses the destination;
- `components/account/AccountHooks.tsx` is suppressed by default under `FD-ACC-14`;
- the flagship hubs render 23 locked capabilities.

A reader moving between them meets three different answers to the same question. **Founder decision required**:
either extend this task's ruling into a general amendment of `FD-ACC-07` and `FD-DAT-16` — in which case the
archive and Game Page surfaces should be brought back in the locked form — or record it as a deliberate
flagship-only exception with its reason.

**Status.** Does not block the flagship review. Blocks a consistent cross-family treatment of gated capabilities,
and should be settled alongside `ACCT-DEC-001` open item 1 (authorise the account foundation).

**CLOSED 2026-08-11 — see Conflict 37.** The founder instruction of 2026-08-11 authorises the account
foundation and settles the standing rule for every page family: gated capabilities are **visible and
functional via the account foundation** — the `FD-DAT-04` affordance, the real shared sign-in flow, the
`FD-ACC-12` intent, and `FD-ACC-13` private-action continuation.

---

## Conflict 29 — No flagship game hub advertising inventory is captured (MEDIUM — NEW, OPEN)

**Recorded by** LRG-FLAGSHIP-002, 2026-08-07.

BP-04A §43 assigns the flagship hubs **ad tier 2** and states that *"Production slot IDs and sizes require
current-code audit."* `CLAUDE.md` §12 requires each page family to have its own production ad-inventory audit
before implementation.

`04-sample-data/ad-slot-definitions.json` enumerates the Home, State and mobile-snippet slots. For the game
families it records only a reference note — the `lc_mgp_*` / `lc_mpg_*` family — with **no div ids and no size
mappings**, and directs that they be captured from the legacy templates first. `03-docs/05-advertising/` holds a
Home reconciliation and a State reconciliation; **there is no flagship game hub reconciliation and no approval.**

Consequently `AD-FG00` … `AD-FG04` remain in the governed BP-04A §12 sequence and resolve to nothing:
`lib/flagship/flagshipAdProfile.ts` returns an empty placement list with the reason attached, no geometry is
reserved and no placeholder is drawn. §12 forbids removing, merging, renaming, moving, reducing, reordering or
repurposing a slot, and rendering nothing where nothing is approved is the only action that does none of those
things.

**This is identical in kind to the Game Page gap** recorded in `lib/game/gameAdProfile.ts`, and the two should be
closed by the same ad-operations task.

**Required to close** — capture the `lc_mgp_*` / `lc_mpg_*` div ids and size mappings from the legacy templates,
reconcile against the 47 captured slots, and approve a flagship placement profile. It is an ad-operations task,
not an implementation change.

**Status.** Blocks: production readiness of `/powerball` and `/mega-millions`. Does not block the guarded review.

---

## Conflict 30 — Neither flagship game's prize matrix is captured, so no prize amount can be shown (LOW — NEW, OPEN)

**Recorded by** LRG-FLAGSHIP-002, 2026-08-07.

The task requires a Prize and Odds Explainer showing *"prize tiers · odds · jackpot odds · overall odds"*.

**Odds are delivered in full and are not a gap.** The number matrices are captured and `verifiedOfficial` in
`lib/state/floridaFormatRegistry.ts` (5 from 1–69 plus 1 from 1–26; 5 from 1–70 plus 1 from 1–24, both quoted from
the operator). `lib/flagship/flagshipOdds.ts` counts every possible match combination from the matrix — twelve
rows per game, exact integer arithmetic, with the method rendered beside the table. Powerball's jackpot resolves
to 1 in 292,201,338 and Mega Millions' to 1 in 290,472,336, both classified `computed`.

**Two things could not be delivered, and are shown as stated gaps rather than guessed:**

1. **Prize amounts, and which combinations pay at all.** These are the operator's prize matrix, which no
   arithmetic over the number matrix can yield. Neither game's table is captured anywhere in the repository.
2. **The "overall odds of winning any prize" figure.** It is a total over the operator's paying tiers; summing a
   tier list we do not hold would be inventing one. It is therefore withheld with that reason stated on the page.

Two smaller gaps in the same category: **Powerball's base ticket price** (the captured operator page quotes the $1
Power Play add-on but not the base play; BP-04A states Mega Millions' $5 but not Powerball's), and the **current UK
advertised Powerball value**, which BP-04A §15 requires to be distinguished from the U.S. figure — the distinction
is explained and no UK number is shown.

**Required to close** — transcribe both operator prize matrices with provenance into `04-sample-data` or a
governed registry, in the same verified form as the existing format definitions.

**Status.** Does not block the guarded review; the odds table is complete and correct without it. Blocks the
checker reporting what a match is worth, the Power Play and ticket-multiplier prize calculators, and any
"overall odds" claim.

---

## Conflict 31 — The flagship page order departs from BP-04A §12 (LOW — RESOLVED BY TIER-1 INSTRUCTION)

**Recorded by** LRG-FLAGSHIP-003, 2026-08-07.

BP-04A §12 fixes the anonymous sequence: result → advertisement → check → AI → intelligence → rules →
jurisdictions → tools → history → jackpot → international → guides → news → community → alerts → trust.

The active founder instruction supplies a different order and states the reason: *"Every major section must give
the user something useful to do … If not, remove it, merge it, or move it lower."* It places the four working
tools — search, check, generate, analyse — directly under the hero, and moves the rules, jurisdiction and trust
reading matter to the end. An explicit founder instruction in the active task is Tier 1 in `CLAUDE.md` §2, above
the tier-4 blueprint, so the instruction governs.

**What changed, precisely.**

| Blueprint §12 | As built | Why |
|---|---|---|
| FG-02 check at 3, FG-08 history at 11 | FG-08 search at 3, FG-02 check at 4 | The explorer is the page's largest capability; burying it under the rules failed the "useful to do" test |
| FG-07 one "Tools and Analysis Launcher" | Split into **FG-07A** (generator) and **FG-07B** (Stats Lab) | The instruction lists them as separate sections with the jackpot tracker between them. The taxonomy is **extended**, not renamed, so the mapping back to §12 stays exact |
| FG-04 draw intelligence, own band | **Merged** into the hero and the Stats Lab | On its own it was a read-only list of figures — the exact shape the instruction rejects |
| FG-05, FG-06, FG-10, FG-15 in the middle | Moved to the end | Reading matter, correctly placed lower by the instruction's own rule |

**One departure from the founder's own numbering, and its reason.** Their list places "AI Everywhere" seventh,
but the requirement under that heading is *"Do not create only one chatbot at the bottom."* The shared answer
region is therefore placed **second**, immediately under the hero: every contextual chip on the page targets it,
and a hero chip that scrolls the reader past six sections to reach its answer is the failure mode that
instruction exists to prevent. The chips themselves are distributed across nine sections.

**Status.** No further decision needed unless the founder wants the blueprint amended to match. BP-04A §12 and the
built page now differ on the record, which is why this entry exists.

---

## Conflict 32 — The flagship tools run on a guarded review history, not on connected data (MEDIUM — NEW, OPEN)

**Recorded by** LRG-FLAGSHIP-003, 2026-08-07.

The founder instruction requires a Historical Draw Explorer (*"Do not add 'search' unless it searches meaningful
historical data"*), a checker with *"check last 10 draws"* and *"check all available history"* modes, and a Stats
Lab *"connected to historical results"*.

**The repository holds one drawing per game.** The captured production feed carries a single current record per
game per jurisdiction; production has roughly 8,700 indexed yearly archive URLs and none of that history is here.
Built literally, every one of those sections would have been the passive placeholder the instruction forbids.

**Resolved by the precedent the instruction itself points at.** The founder's correction cites the Florida Pick 3
archive as *"useful as a data archive"* whose weakness was passivity — and that page solved this exact wall with a
founder-authorised guarded review fixture (`lib/archive/archiveReviewFixture.ts`). `lib/flagship/flagshipHistory.ts`
is the same device under the same six rules:

1. The newest row of every series is the **real** feed record — numbers, multiplier, Double Play, advertised
   jackpot — tagged `productionFeed`. 520 rows for Powerball, 131 for Mega Millions; **one real row each**.
2. `provenance` is a required field in the data contract, spelled `synthetic/internal-review`, surfaced as a
   per-row tag in every table and filterable by a "real published drawings only" toggle.
3. It returns an empty series unless the guard is on, and it refuses to build at all without a real anchor row.
4. **No synthetic jackpot, cash value, winner, prize, retailer, news item or discussion is generated anywhere** —
   only drawn numbers and drawn multipliers. This is why the jackpot tracker still shows only the two real
   advertised figures and states that a trend needs the series.
5. The series never crosses the current rule era's `effectiveFrom`, so nothing mixes two number matrices.
6. It is deterministic (a seeded LCG), so two builds produce byte-identical HTML.

**A real and visible consequence.** Mega Millions' current format began in April 2025, so its era-bounded series
is 131 drawings against Powerball's 520 — and its triples analysis is genuinely unavailable while Powerball's
computes. That difference is a true property of the games, and it is left visible rather than smoothed over.

**Required to close** — connect the real drawing history. When it lands, `buildFlagshipHistory` is replaced by the
real provider and **nothing else changes**: the explorer, the checker's three modes and all ten Stats Lab views
already run against the `FlagshipDrawRow` contract and are covered by tests.

**Status.** Blocks publication of `/powerball` and `/mega-millions`. Does not block the guarded founder review —
reviewing the tools is precisely what the series exists for.

---

## Conflict 31 — AMENDMENT (LRG-FLAGSHIP-004, 2026-08-07)

The founder's revision pass supplies a **second, different** order for the flagship hubs, and the reason given is
explicit: the page *"still feels like many separate white boxes stacked one after another"* and must read as a
command centre built round five jobs — Check, Explore, Build, Follow, Ask AI. Tier 1 again governs.

**The order now built**, and the departure from BP-04A §12 it represents:

| # | Section | BP-04A §12 position |
|---:|---|---|
| 1 | FG-01 hero command centre | 1 |
| 2 | FG-03 AI quick actions | 4 |
| 3 | FG-02 check your ticket | 3 |
| 4 | FG-09 jackpot tracker **and alerts** | 12 |
| 5 | FG-07A build a line | 10 (part) |
| 6 | FG-08 historical explorer | 11 |
| 7 | FG-07B Stats Lab | 10 (part) |
| 8 | FG-13 tagged discussions, news and guides | 17 |
| 9 | FG-05 prizes, odds and rules | 7 |
| 10 | FG-15 trust, responsible play and FAQ | 19 |

**Five ids are now merged rather than stacked**, using the instruction's own remedy (*"compress it, move it lower,
or merge it"*). Each keeps its governed id as a `data-section-id` on the panel that absorbed it, so the mapping
back to §12 stays exact and is asserted by test:

| Merged | Into | Why |
|---|---|---|
| FG-14 alerts and follow | FG-09 | The instruction titles that section "Jackpot Tracker and Alerts" |
| FG-11 guides | FG-13 | Three consecutive content sections were three boxes saying the same thing |
| FG-12 news | FG-13 | As above |
| FG-06 jurisdiction rules | FG-05 | Reference matter, as a disclosure beside the odds |
| FG-10 where it is played | FG-15 | Its subject is already trust and caveats |

**One structural change beyond ordering.** Sections 1–7 now render inside a single bordered **console band** with
hairline dividers rather than as seven separate cards. That is the visual half of the founder's complaint; the
reorder is the other half. Reference sections below the band keep a quieter treatment so the hierarchy is visible
rather than only asserted.

**The AI departure from the founder's own numbering is unchanged** and for the same reason: their list places AI
seventh, but the requirement under that heading is *"Do not create only one chatbot at the bottom."* Every
contextual chip on the page targets that one region, so it sits second, immediately under the hero.

**Status.** Supersedes the order recorded in the original Conflict 31 entry above. No further decision needed
unless the founder wants BP-04A §12 amended to match; the blueprint and the built page differ on the record,
which is why this entry exists.

---

## Conflict 33 — A mock BFF supplies drawing history, jackpot, prize and content data on a deployable route (FGP-009, 2026-08-10)

**Sources in tension.**

- **Tier 1 (founder instruction, FGP-009).** *"Replace the current 1-draw limited state with a local mock
  Backend-for-Frontend (BFF) data contract so the UI behaves like the final product."* At least 100 mock
  historical drawings per game; explorer, checker, Stats Lab, jackpot tracker, AI context and tagged content all
  re-enabled. The stated purpose is to **finish the UI and deploy briefly for live-site and advertising
  verification before the API and database are restructured.**
- **`CLAUDE.md` §14.** *"Synthetic content MUST NEVER be presented as real public fact,"* naming jackpots and
  community activity explicitly; and the frozen Constitution's *"Community content is human-authored. MUST NOT
  fabricate posts, threads, replies, reputation, or activity."*
- **FGP-008, the immediately preceding task**, which removed exactly this kind of data from the page and made the
  default route behaviour *"published data or intentional empty states."*

**Resolution.** Tier 1 governs, and the departure is deliberate and time-boxed. It is recorded here because it
reverses a decision taken three days earlier, on the same authority that took it.

**What the preview data is, precisely.**

| Game | Drawings | Span | Jackpot points | Prize tiers | Content items |
|---|---:|---|---:|---:|---:|
| Powerball | 300 | 2024-08-10 → 2026-07-08 | 300 (13 completed runs) | 9 | 11 |
| Mega Millions | 131 | 2025-04-08 → 2026-07-07 | 131 (6 completed runs) | 9 | 11 |

Mega Millions is shorter because its current matrix began 2025-04-08 and no drawing may be rendered under a
different rule era. That asymmetry is a true property of the games and is left visible.

**The seven conditions this is granted under.** Each is enforced by test, not by convention.

1. **The newest drawing in every payload is the real published result** from the production results feed, tagged
   `productionFeed`. The most prominent fact on the page is real, and the adapter refuses a payload where it is
   not.
2. **Every drawing, jackpot point, prize tier and content item carries `source`.** A row with no provenance cannot
   be constructed, and the adapter validates this on every read rather than once at module load.
3. **The disclosure travels inside the payload** (`meta.disclosure`) and drives the page banner, so preview data
   cannot render without the sentence that identifies it.
4. **No fabricated winner, claim, prize payout, retailer or real-person statement exists anywhere.** Preview
   headlines make no claim about an outcome — not that a jackpot was won, and not that it was not. Preview
   discussions and articles state in their own text that they were written for interface testing.
5. **The hero result, the odds and the cash-value gap remain untouched.** The result comes from the production
   feed, the odds are still counted from the verified number matrix, and no cash value is derived from an
   annuity.
6. **The prize table is labelled as preview wherever it appears**, and the jackpot row shows no figure at all.
   The operator matrix is still not captured and is still recorded as an open gap.
7. **The routes stay `noindex, nofollow`, out of every sitemap, with no redirect and no commerce-route change.**

**Two vocabularies, one fact.** The founder also required that preview rows be *"clearly marked internally as
mock source"* while *"'synthetic/internal-review' labels"* stay out of the consumer UI. Provenance therefore lives
on the data and the LABEL is chosen by `FLAGSHIP_DISPLAY_MODE` — `Preview` for a reader, `Review row` for a
founder review build. The distinction is never hidden in either register; only the wording changes.

**Required to close.** Connect the real drawing archive and prize matrix through `getFlagshipGamePageData`. When
that lands, `FLAGSHIP_DATA_MODE` moves from `"mock"` to `"api"` and **nothing else changes** — the explorer, the
checker's three modes, all ten Stats Lab views, the jackpot run, the prize table and the content rails already run
against the `FlagshipGamePageData` contract and are covered by tests. The open API questions are recorded in one
place, `FUTURE_API` in `flagshipBffContract.ts`; `CLAUDE.md` §15 forbids answering them during a UI task.

**Status.** Blocks indexing and sitemap inclusion of `/powerball` and `/mega-millions`. Does not block the brief
live deployment the founder asked for, provided the pages remain `noindex, nofollow` while preview data is live.

---

## Conflict 34 — The archive route now emits a self-referencing canonical, reversing the 2026-08-05 brief (LOW — RESOLVED BY TIER-1 INSTRUCTION)

**Sources in tension.**

- **The 2026-08-05 archive execution brief §6:** *"do not emit a production canonical from synthetic review
  content."* Implemented literally — `app/[state]/[game]/[segment]/page.tsx` emitted no `alternates` at all, and
  two tests asserted the absence.
- **`ROUTE-AUDIT-001` §9**, which recorded the consequence in its own row: *"The archive emits no canonical at
  all … Deliberate — synthetic review rows must not carry a production canonical. **On ungating this must become a
  self-referencing canonical**, or the archive ships as the one indexable page with no canonical signal."*
- **Tier-1 founder instruction (five-page finalization §A4):** add the self-referencing canonical now, *"guarded
  route only — no host or slash decision implied."*

**Resolution.** Tier 1 governs (`CLAUDE.md` §2). The brief's concern was that a canonical would nominate a page of
synthetic rows as the authoritative version of a real URL. That cannot happen while the route is
`noindex, nofollow`: **no canonical signal reaches a crawler**, so the tag is inert today and correct on the day
the page is ungated — which is precisely when it would otherwise be forgotten.

**What this does NOT decide.** The value is built by `canonicalUrl()` from `PRODUCTION_ORIGIN`, the same constant
`/fl/powerball`, `/powerball`, `/mega-millions` and the guarded State page already use. So the archive inherits the
repository's existing, still-unratified convention rather than introducing a second one. **`FD-RTE-01` (emit
self-referencing canonicals), `FD-RTE-02` (`www` versus non-`www`) and `FD-RTE-03` (reconcile
`productionOrigin.ts` with `siteSchema.ts`) all remain OPEN.** No redirect, no sitemap entry, no `robots.txt`
change and no trailing-slash behaviour was altered.

Note that `ROUTE-AUDIT-001` §11 recommends `FD-RTE-02` resolve in favour of **`www`**, which would reverse
`CLAUDE.md` §11 and `productionOrigin.ts`. If the founder accepts that recommendation, this canonical changes with
every other one in a single constant edit — which is the reason it was routed through the shared helper.

**Status.** Does not block. Closes when `FD-RTE-01`/`FD-RTE-02` are decided.

---

## Conflict 35 — Preview gating was inconsistent across the five page families (MEDIUM — RESOLVED 2026-08-11)

**The five families gate themselves five different ways.** Measured in the repository:

| Family | Route | Gate | Mechanism |
|---|---|---|---|
| Home (PF-01) | `/` | **Environment** | `LC_HOME_PREVIEW=true`, else the legacy `HomeTemplate` |
| State (PF-02) | `/{state}` | **Environment + registry** | `LC_STATE_PREVIEW=true` **and** `isPreviewJurisdiction()` |
| Game (BP-04B) | `/{state}/{game}` | **Registry only** | `isGamePreviewEligible()`; FGP-era flag removed |
| Archive | `/{state}/{game}/{year}` | **Registry only** | `resolveGamePreview()` + `isArchiveEligible()` |
| Flagship (BP-04A) | `/powerball`, `/mega-millions` | **Registry only** | `isFlagshipRouteEnabled()`; `LC_FLAGSHIP_GAME_PREVIEW` removed by FGP-007 |

**Why it matters, concretely.** Three of the five are served on any local or deployed build with no environment
variable at all. Their protection is `noindex, nofollow` plus absence from the sitemap — which is real protection
against indexing but **not** against a human reaching the URL. Two of the five additionally require a flag. So
"what does this build serve?" has two different answers depending on which family is asked, and a reviewer cannot
state the site's public surface without reading five modules.

**Both models are individually defensible.**

- *Registry-only* is what FGP-007 chose, and it gave the reason: the site is being rebuilt locally and published as
  a whole later, so a per-page preview flag is no longer how pages are held back. It also keeps `CLAUDE.md` §10
  satisfied — route existence stays declared in a registry and is never derived from a fixture or a directory.
- *Environment + registry* is what the State family chose, and its reason is equally real: a guarded page that
  carries synthetic content and unavailable states must not be reachable by accident.

**What is NOT in tension:** `CLAUDE.md` §10's registry requirement. Every family satisfies it. The open question is
only whether an **additional** environment gate is required.

**Recommendation — `[PROPOSED]` `FD-GATE-01`, not in force.** Ratify **registry-only** gating for all five
families, and make the registry the single answer to "what does this build serve", on three conditions:

1. **Indexing protection stays independent of the gate.** Every unratified page stays `noindex, nofollow` and out
   of every sitemap, enforced by test, exactly as today.
2. **Synthetic content stays gated by provenance, not by the route.** `CLAUDE.md` §14 is satisfied by the payload
   carrying its own disclosure (the `meta.disclosure` mechanism Conflict 33 established), not by a flag.
3. **One route-inventory test enumerates every served route across all five registries**, so the public surface is
   one assertion rather than five modules.

The alternative — adding `LC_*_PREVIEW` flags to Game, archive and flagship — reintroduces exactly the gate FGP-007
removed on founder instruction, and would need that instruction reversed.

### RESOLVED — `FD-GATE-01` RATIFIED, 2026-08-11

**Registry-only gating for all five families**, as recommended, with the founder's own rationale:

> **A single-deployment model, and no per-environment switches.** The site is built and published as one thing. An
> environment variable that changes which pages exist makes "what does this build serve?" a question about a shell
> session rather than about the repository — so the registry is the answer, for every family, with nothing beside it.

**Implemented in the same instruction.** `LC_HOME_PREVIEW`, `LC_STATE_PREVIEW` and `LC_GAME_PREVIEW` are gone; every
family renders from its registry entry. The blueprint-conformant templates are the sole render path, and the legacy
`HomeTemplate` and `StatePageTemplate` are ARCHIVED rather than deleted (`CLAUDE.md` §6).

**The three conditions the recommendation attached are all met, and all three are enforced by test rather than by
convention:**

1. **Indexing protection stays independent of the gate.** Every one of the five families remains `noindex, nofollow`
   and out of every sitemap. Removing an environment flag changed *availability*, never *indexability* — the two were
   always separate decisions and the ratification kept them separate.
2. **Synthetic content stays gated by provenance, not by the route.** The `meta.disclosure` mechanism (Conflict 33)
   and `assertProvenanceLabels` are untouched, so a payload still carries its own disclosure.
3. **One route-inventory test enumerates every served route across all five registries**, so the public surface is
   one assertion rather than five modules read by hand.

**What ratification does NOT do:** it does not publish anything. Availability without a flag is still `noindex`, and
un-indexing is a separate launch task.

---

## Conflict 36 — Five AI capabilities were blocked on founder decisions (HIGH — 36.1 CLOSED 2026-08-11; 36.2–36.5 OPEN)

Recorded at the founder's own instruction as part of the five-page finalization. **None of the five was
implemented.** Each is listed with what it blocks, what was shipped instead, and the recommendation.

### 36.1 An anonymous complete AI answer — Constitution §17 versus `FD-DAT-02`

**The tension.** The frozen Constitution requires *"at least one complete public AI answer"* to remain available
**without an account**, and §10.2's first-answer rule spells out the shape: one complete answer, its source basis,
one best next action, up to two additional paths — and only *then* may the experience ask for sign-in.
`DATA-DEC-001` `FD-DAT-02` makes AI execution an **Account** action, and `FD-DAT-12` requires every execution to be
metered per Account. Those cannot both be satisfied for an anonymous visitor.

**What shipped.** Every answer surface is **deterministic** and therefore outside the conflict entirely: it computes
from the page's own governed data, so there is no request, no prompt, no provider, no token and no cost for
`FD-DAT-12` to meter (`FD-DAT-20`). The Constitution's public-value floor is met by computation rather than by an
ungated model.

**Recommendation (superseded by the ruling below).** One anonymous cached answer per visit, then *"Sign in free to
use"*. It satisfies §17's floor and `FD-DAT-02`'s gate simultaneously, and a cached answer is meterable at generation
rather than per reader.

### 36.1 — **CLOSED. FOUNDER RULING, 2026-08-11.**

Recorded verbatim:

> "Anonymous visitors may execute ONE AI answer per visit, capped at a server-configurable token limit (per
> FD-DAT-18, never a code constant), sized so that typical questions receive a complete answer within it. An answer
> that would exceed the cap ends at a clean sentence boundary with a labeled 'Sign in free to continue this answer'
> affordance (FD-DAT-04 wording). Follow-up questions, continuations, saved history and personalization require the
> free Account (FD-DAT-02 applies beyond the first answer). This satisfies Constitution §17's 'one complete public AI
> answer' for the common case by design; the oversized-question boundary is a founder-accepted limit, recorded here
> rather than by editing the frozen Constitution."

**What this ruling settles, precisely.**

1. **`FD-DAT-02`'s reach is AMENDED, not overridden.** It applied to all AI execution; it now applies *beyond the
   first anonymous answer*. The first answer is ungated. Everything after it — follow-ups, continuation, history,
   personalisation — is Account-gated exactly as before.
2. **The cap is CONFIGURATION, never a constant.** `FD-DAT-18` governs it. A token limit compiled into the source
   would be unchangeable without a release, and sizing it is an operational judgement that will move with the model
   and with observed question length.
3. **Truncation has a defined shape.** An oversized answer stops at a **clean sentence boundary** — never mid-word,
   never mid-clause — and carries the `FD-DAT-04` affordance *"Sign in free to continue this answer"*. That wording
   is the ruling's, not ours to paraphrase.
4. **The Constitution is NOT edited.** §17's *"one complete public AI answer"* is satisfied *for the common case by
   design*, because the cap is sized so typical questions complete within it. The residual case — a question so
   large that a complete answer cannot fit — is a **founder-accepted limit**, recorded here. The Constitution is
   frozen and stays frozen; this record is the accepted deviation, which is what a conflict register is for.

**NOT IMPLEMENTED, and deliberately.** This is a recorded ruling, not shipped behaviour. It cannot ship until 36.2
(the account foundation) and 36.3 (a provider and the usage ledger) close, because:

- *"one answer per visit"* needs a visit identity to count against, and *"beyond the first answer"* needs an account
  to gate to;
- a **server-configurable** cap needs the server-side execution path that does not exist;
- `FD-DAT-12` still requires every execution to be metered — request count, tokens, cost, latency, outcome — and
  there is nothing to meter into.

Shipping the affordance before then would be the non-functional control `FD-ACC-14` and `CLAUDE.md` §9 both forbid.
Until it lands, every answer surface stays **deterministic** and therefore outside the conflict entirely
(`FD-DAT-20`): no request, no prompt, no provider, no token, no cost — and §17's public-value floor is met by
computation, which is a stronger position than an ungated model, not a weaker one.

### 36.2 The account foundation — `DATA-DEC-001` open items 2, 3 and 5

**Prerequisite for everything model-executed.** No sign-in flow, no account record and no session exist. That
blocks: model-executed Ask on every family; the personalised digest; restoring Ask-the-Archive (`FD-DAT-16`);
saved numbers, followed games and alerts (State S-16, Game JG-17, flagship FG-14, archive AR-08); and any per
-account allowance.

**What shipped.** Every one of those surfaces is **absent rather than gated-and-dead** (`FD-DAT-17`,
`FD-ACC-14`). §C1 removed the last violation — the AI tools teaser's *"(coming soon)"* heading and its
`<button disabled>` reading *"Sign in to try"*. **This is the single largest blocker in the AI programme.**

**AUTHORISED AND IMPLEMENTED IN REVIEW MODE, 2026-08-11 — see Conflict 37.** The sign-in flow, account
record, session and continuation contract now work end to end against the review data layer (LRG-ACCT-001).
The server-side half — real authentication, the usage ledger, the `FD-DAT-12`/`FD-DAT-15` stores — remains
for the API phase, so 36.3 still blocks model-executed AI.

### 36.3 AI provider selection and the usage ledger — `FD-DAT-12` / `FD-DAT-18` / `FD-DAT-19`

No provider is chosen, no ledger schema exists, and `CLAUDE.md` §15 forbids designing either during a UI task. §C0
therefore permitted no provider, no `fetch`, no `/api` route and no key of any kind, and
`tests/ai-everywhere.test.ts` asserts all four across every AI module.

**Note the ordering constraint.** The ledger is not a follow-up to the provider — `FD-DAT-12` requires request
count, tokens, cost, latency and outcome per Account, so the ledger and the account foundation must exist *before*
the first execution, not after.

### 36.4 Four unscheduled feature approvals

| Feature | Status | Blocked on |
|---|---|---|
| Voice input on Ask | Not approved | Founder decision; also 36.2 |
| Scam / claim checker | Not approved | Founder decision. Touches claim guidance — a protected zone |
| Photo AI Ticket Analysis | **Approved in BP-05C, unscheduled** | Build order. Needs a provider (36.3) and an account (36.2) |
| Generative draw recaps | Not approved | A **human-review pipeline**, which does not exist |

The last is the sharpest: the Constitution requires AI to be clearly identified when it *"substantially transforms
editorial content"*, and generated recaps without a review pipeline would publish unreviewed prose about lottery
results. **Recommend approving the pipeline before the feature.**

### 36.5 Conflict 3 decision 6 (AI quotas), and ratification of `ROUTE-AUDIT-001`

Quotas are one of the eleven open Part 22 decisions and are a §16 Member/Insider matter, so nothing quota-shaped
was implemented — no counter, no allowance and no "requests remaining" affordance. **That half remains OPEN.**

**The route and canonical audit half is CLOSED.** `FD-RTE-01`…`FD-RTE-12` were ratified on 2026-08-11 and are in
force — see `route-canonical-and-migration-audit.md`. Note the interaction with the anonymous-answer ruling above:
the *"one answer per visit"* allowance is **not** a quota in the Part 22 sense. A quota is a per-Account allowance
over time, which is Member/Insider territory and stays blocked; a per-visit first answer is an anonymous public-value
floor. The two must not be conflated when 36.5's remaining half is decided.

**Status, as of 2026-08-11.**

| Item | Status |
|---|---|
| **36.1** anonymous complete AI answer | **CLOSED** — founder ruling recorded verbatim above. Implementation blocked on 36.2 and 36.3 |
| **36.2** account foundation | **OPEN** — the single largest blocker in the AI programme |
| **36.3** provider selection + usage ledger | **OPEN**. Note the ordering constraint: the ledger must exist *before* the first execution, not after |
| **36.4** four unscheduled feature approvals | **OPEN** |
| **36.5** AI quotas (Part 22 decision 6) | **OPEN**. The route-audit half of this item is now closed |

Nothing here blocks the five-page work that shipped, or the registry-only gating of `FD-GATE-01`.

---

## Conflict 37 — Tier-1 founder authorization of the account foundation supersedes the timing prohibitions `FD-ACC-04`, `FD-ACC-14` and `FD-DAT-17` (CLOSED — RECORDED 2026-08-11)

**Recorded by** LRG-ACCT-001, 2026-08-11, before any implementation under it.

### The founder instruction

The founder instruction of **2026-08-11** (Tier 1 — explicit founder instruction in the active task, `CLAUDE.md`
§2) is, in substance: **"finish the entire site; assume the database exists; perks for logged-in users."** The
instruction directs that the free member-account area — sign-up, sign-in, the GS-07 member menu, and saved
member preferences — be built now as ordinary product features, running end to end against the project's
established review-mode mock data layer (the same discipline as the flagship BFF of Conflict 33), because no
real backend exists yet.

### What it supersedes, and why that is coherent

Three rulings were **timing prohibitions**: each forbade shipping account surfaces *while no sign-in flow could
work at all*, and each states or implies its own expiry condition.

| Ruling | What it said | Why it no longer bites |
|---|---|---|
| `FD-ACC-04` | No Account schema, authentication or sign-in route is authorised **by that record** | It recorded direction, not a permanent bar; `ACCT-DEC-001` open item 1 and `DATA-DEC-001` open item 2 both name "authorise the account foundation task" as the closing act. This instruction is that authorisation. |
| `FD-ACC-14` | Disabled and "Coming soon" account controls are not permitted | The controls being shipped are **functional**, not disabled: sign-in, sign-out, follow and save genuinely work against the review data layer. Nothing `FD-ACC-14` protected against is being drawn. |
| `FD-DAT-17` | No fake login, placeholder route, dead button or "Coming soon" | `/login` and `/signup` are **real, working flows**, not placeholders. `FD-DAT-16`'s own restoration condition — "when the real shared Account and sign-in continuation flow works end to end" — is satisfied within the review data layer. |

The supersession is therefore **consistent with `FD-ACC-06`'s principle rather than an exception to it**: a
signed-in capability may appear only when the whole round trip works — real authentication, real persistence, a
real sign-in return, real action continuation. Against the review store, that round trip now genuinely works;
"assume the database exists" is the founder's instruction for what the review store stands in for.

### Conflict 28's standing rule is CLOSED

Conflict 28 asked whether "visible but locked" is the standing rule for every page family or a flagship-only
exception. The founder instruction settles it: the standing rule for every page family is **visible and
functional via the account foundation**. Gated capabilities render in the position they occupy for a signed-in
reader, carry the `FD-DAT-04` affordance (**"Sign in free to use"** — the word *free* is mandatory), open the
real shared sign-in flow with an `FD-ACC-12` intent, and — for private actions only, per `FD-ACC-13` — complete
after sign-in. The three inconsistent treatments Conflict 28 enumerated (archive: absent; Game Page: suppressed
destination; flagship: locked with no destination) all converge on this one form as their surfaces are touched.

### What remains prohibited, explicitly

The instruction authorises the **free account foundation** and nothing beyond it:

- **`FD-ACC-02` stands.** No Insider concept, table, flag, route or copy is introduced by any of this work.
  Insider remains an unresolved future possibility, not a plan, and the eleven open Part 22 decisions
  (Conflict 3) are untouched.
- **`FD-ACC-16` stands.** No paid tier, paywall, premium plan, upgrade prompt, trial or conversion strategy.
  The account is free; nothing about the gate may be sold (`FD-DAT-06`).
- **`FD-ACC-11` stands as to delivery.** No notification delivery is claimed anywhere, because **no delivery
  channel exists** — no email, no push, no service worker. Notification *preferences* may be recorded per
  `FD-ACC-18` (explicit opt-in, per-option frequency shown, easy disable), but no surface may state or imply
  that anything is sent.
- **`FD-ACC-13` stands.** Outward-facing actions never auto-complete after sign-in; only private continuity
  actions (follow, save) may.
- **`CLAUDE.md` §15 stands.** The review store is presentation-side stand-in state, not a schema. `02-new-api`
  stays untouched; no table, migration or API contract is designed by this work.

### Consequential status changes

- **Conflict 28** — standing rule **CLOSED** by this entry (annotated in place).
- **Conflict 36.2** (the account foundation, "the single largest blocker in the AI programme") — **authorised
  and implemented in review mode** by LRG-ACCT-001. The server-side half (real authentication service, usage
  ledger, `FD-DAT-15`/`FD-DAT-12` logging stores) remains for the API phase; 36.3 is unchanged and still blocks
  model-executed AI.

**Status.** CLOSED — this is a recorded Tier-1 authorization, not an open question. Blocks nothing.

## Conflict 38 — Canonical ownership of the five legacy policy routes transfers to the new UI (CLOSED — RECORDED 2026-08-11)

**Recorded by the orchestrating session, directly from the founder's chat instructions of 2026-08-11.**

The founder instructed, in substance: *"finish the regular pages like contact us, login, signup, terms and
conditions, privacy policy"* and, on deployment model (same day, gating decision): *"we are not publishing step
by step; we are pushing entire code to server at once."* Together these supersede the LRG-SHELL-046 ruling
"EXISTING LEGACY POLICY — MIGRATION DEFERRED": at cutover the new UI owns `/about-us`, `/contact-us`,
`/terms-and-conditions`, `/privacy-policy`, `/cookies-policy`. The LRG-SHELL-046 duplication-guard test is to be
updated deliberately, citing this entry.

**Constraints that stand:** policy/legal text is TRANSCRIBED from the legacy pages with provenance (read-only
evidence use, `CLAUDE.md` §5), never drafted fresh by the implementation; any legacy clause that no longer
matches the product is marked `[FOUNDER-LEGAL-REVIEW]` and listed in the task report — legal wording is a
founder/legal sign-off, not an implementation decision. A contact form may store submissions in the review data
layer for the admin phase, but MUST NOT claim delivery to a human until a real channel exists. All five pages
noindex until launch.

**Status.** CLOSED as authorization; legal-text sign-off remains an open founder item at launch.

## Conflict 39 — Blog family built without its blueprint on Tier-1 instruction (CLOSED — RECORDED 2026-08-11)

The founder instructed: *"blog list page, blog search and blog item"*. No blog blueprint exists (BP-08's blog
half was never authored) — `CLAUDE.md` §2 would block the family. The Tier-1 instruction overrides the block.
Composition derives from the approved News article architecture (07B) plus the Experience Architecture §35 blog
distinction (analysis · tutorial · opinion · systems · contributor story); `BlogPosting` schema per 07/07B.
Routes `/blog` and `/blog/{slug}` are already classified **preserve** in the ratified route audit (21 live
indexed URLs). The `lc_bp_*`/`lc_bdp_*` ad families remain named-but-not-captured: blueprint-style anchors ship
as typed-empty reserved profiles pending the ad-inventory capture task. News search and blog search pages are
likewise founder additions with no blueprint section — both ship noindex with crawlable non-search fallbacks.
**Open remainder:** authoring the blog half of BP-08 post-hoc, and the legacy two-template canonical question
(`CLAUDE.md` §10) which this build does not answer.

**Status.** CLOSED as authorization; BP-08 blog authoring and the two-template question remain OPEN.

## Conflict 40 — Admin area authorized as a protected area inside the new app (CLOSED — RECORDED 2026-08-11)

The founder instructed: *"Admin login for LotteryCorner admin to approve news item and blog item entered, even
to enter news and blog items, and maintain forum approval; later we can automate it using agents by calling the
API."* No tier-1..5 authority governed admin; the tier-7 strategy document's open question 1 (legacy admin vs
separate app vs protected area) is hereby answered by the founder: **(c) protected area inside the new app**.

**Binding constraints inherited from higher tiers:** noindex + robots-disallowed + auth-gated; admin controls
never present in public page markup (Shell §15); editorial flow is draft → review → publish with `contentMeta`
(source, reviewStatus, lastReviewed); every news article has an accountable human editor (07 §3); every
moderation action carries reason + policy + appeal route (08 §22); AI may later triage and assist but humans own
severe actions and appeals (Constitution §50); full audit trail (who/what/when/action/reason).

**Status.** CLOSED as authorization.

## Conflict 41 — Community surfaces in review mode use self-identifying interface-test content (CLOSED — RECORDED 2026-08-11; TIME-BOXED)

The Constitution forbids fabricating posts, threads, replies, reputation or activity, twice. The founder's
"finish the entire site / assume the database exists" instruction requires reviewable community pages now.
Resolution, following the Conflict 33 flagship precedent: the community review data layer may carry entries and
replies ONLY if their own visible text identifies them as interface-test material written by the team (never as
members, never with invented usernames presented as real people); alternatively sections render their designed
empty states. Production launch requires real human content or empty states — the review corpus MUST NOT ship
ungated. Reputation numbers, member counts and activity statistics are never simulated; the AI/Research reply
(FE-06) renders per 08D Templates G/H with its real labels.

**Status.** CLOSED as authorization; expires at community launch (real content or empty states only).

### FOUNDER AMENDMENT — 2026-08-11 (same day, in review of this entry)

The founder ruled, in substance: *"Let's have 5 forum users (though it's fabricated, we need them for now); create
the names and personas and language very much similar to lotterypost.com so that we know exact questions and
topics; also create 10 topics and at least 5 to 10 discussion replies for each entry; for now it's only UI —
later we can build the DB for these users."*

This amends the interface-test-labeling requirement above for the REVIEW BUILD ONLY: the community review corpus
may carry five named member personas with realistic player voice and ten topics with five to ten replies each,
written by the team as design fixtures. Conditions that make this compatible with the Constitution's purpose
(never deceive the public):
1. A page-level review disclosure banner renders on every community page served from the review corpus (the
   flagship `meta.disclosure` pattern).
2. Every fixture record carries `provenance: "synthetic-review-fixture"` and the data layer REFUSES to serve the
   corpus in a production build (Conflict 33 pattern).
3. Community pages stay noindex and out of every sitemap.
4. Fixture members are never emitted as `Person` entities in JSON-LD, never counted in any statistic presented
   as real, and never carry reputation badges presented as earned.
5. The expiry stands: production launch requires real human content or designed empty states; the fixture
   corpus MUST NOT ship ungated.

**Status after amendment.** CLOSED; review-fixture personas authorized under conditions 1–5; expiry unchanged.

## Conflict 42 — `/lottery-tax-calculator` (legacy, live, indexed) vs `/tools/tax-calculator` (blueprint) (MEDIUM — OPEN)

BP-05C §5 defines `/tools/tax-calculator`; production serves the indexed static page `/lottery-tax-calculator`.
This is a route change requiring the full `CLAUDE.md` §10 package (evidence, canonical, sitemap, internal links,
1:1 redirect plan), which no FD-RTE ruling settles. **Interim (founder build instruction):** the tool is built at
the blueprint route, noindex, and the consolidation decision (redirect direction and timing) is taken with the
launch redirect map. Nothing redirects today.

**Status.** OPEN — needs the §10 route-change package before launch.

## Conflict 43 — Home carries content BP-02 §12 has no section ID for: the FAQ, and the systems block's own framing (CLOSED — RECORDED 2026-08-13)

**Raised by the founder, 2026-08-13, comparing a circulating screenshot of the ARCHIVED home against the built
one:** *"I think home page missing some of the important sections … not sure why sometimes it's creating the
attached screenshot sections and sometimes it's implementing the current home page. I like the current home
Powerball and Mega Millions sections with AI, but the sections I like in the attached screenshot — get the best
of both."*

**The screenshot is `components/archived/legacy/home/HomeTemplate.tsx`, not a design.** It is the tier-7
composition `FD-GATE-01` archived. Every section it shows is already present in the built BP-02 Home under a
governed ID — *Find Your State Lottery* is H-07, *Live Lottery News* is H-11, *Jackpot Snapshot & Comparison* is
H-09B, and so on — with exactly two exceptions, below. Its three-game featured row is NOT an exception: BP-02 §14
names H-02A *"Featured National Games: Powerball and Mega Millions"*, two games, and Lotto America appears on the
built page under H-06A. The AI-carrying H-02A is unchanged, per the instruction.

### 43.1 — The systems block lost its heading and its safety copy to a de-duplication (defect, no conflict)

BP-02 §12 order 15 is *"Tools, Systems and Number Exploration"*; §23 lists Systems and Wheels and
Frequency/number history among the initial tools. LRG-UI-016 §1 correctly filtered `systems.sections` to drop two
rows duplicating a tool card — but both fixture rows matched, the array emptied, and the renderer's
`systems.length > 0` guard took the sub-block's heading *and its intro* down with the rows. The lost intro is
Constitution §7 language: *"lottery draws are random and outcomes cannot be predicted or guaranteed"*, sitting
directly beneath a Number Analysis tool. **Not a source conflict — a regression.** Heading and intro now render
from the fixture independently of how many rows survive the filter; the filter is unchanged.

### 43.2 — The Home FAQ has no BP-02 section ID (conflict; resolved without amending §12)

`04-sample-data/home-page-sample.json` carries `faqs` with `visibleOnPage: true`, `schemaEligible: true` and
three answers. The archived template rendered it. BP-02 §12 lists **no FAQ entry at any position**, and §29
(H-15 Trust, Support and Footer) does not name one either. So: tier-4 has no slot for content the founder wants
visible and the fixture marks visible.

**Resolution — absorbed into H-15, no 31st entry.** The alternative was inventing an ID absent from a frozen
30-entry sequence, which `CLAUDE.md` §6 forbids ("page structure comes from the blueprints"). This codebase has
already approved and shipped the same absorption for the same content type: **FG-15 is "Trust, responsible play
and FAQ"** on the flagship game pages, where the FAQ renders inside the trust section without a section ID of its
own. §29's content list (methodology, corrections, support) is where these three answers belong anyway — where to
check results, how to find a state, and whether any tool can predict a draw. `visibleOnPage: false` yields no
block, so the flag genuinely governs.

**No `FAQPage` JSON-LD**, following the reason `FlagshipEcosystem` records: `CLAUDE.md` §11 permits it once the
FAQ is visible — which it now is — but Home is `noindex, nofollow`, so emitting structured data for a page no
crawler may index advertises what is not on offer. It ships with the indexing cutover, alongside the `FD-RTE-03`
origin reconciliation.

**Open founder item.** If Home should instead carry a standalone `<h2>` FAQ section at the screenshot's position
(after H-11A Blog and Guides, before H-14B Browse by State), that is a **BP-02 §12 amendment** and needs explicit
approval. It was not assumed here.

### 43.3 — `AGENTS.md` was a stale copy of `CLAUDE.md` (fixed)

Untracked `AGENTS.md`, the Codex-facing guide, was byte-identical to `CLAUDE.md` except for its title, its own
repository-map row — and **four governance paragraphs frozen before the 2026-08-11 ratifications**. It still
taught `/play/{game}` as the approved commerce route (`FD-RTE-06` settled `/buynow/{code}`), a non-`www`
canonical target (`FD-RTE-02`/`FD-RTE-03` settled `www`), a trailing-slash `301` (measured `308`, direction set
by `FD-RTE-01`), and it referenced `.Codex/settings.local.json`, a path that does not exist. An agent reading it
would have built against superseded route and canonical rules. Reconciled; the two guides now differ only in
their title and their self-referential map row.

**Root cause of the founder's "sometimes one, sometimes the other".** Neither guide named the archived
`HomeTemplate` as a trap, so its section list stayed a plausible-looking target. Both guides now carry a §6 rule:
Home has exactly one composition, and a section the archived template carried belongs in its governed BP-02
section — never in a revived template, never under an invented ID.

**Status.** 43.1 CLOSED (regression fixed). 43.2 CLOSED as built; the standalone-section variant is an OPEN
founder decision. 43.3 CLOSED.

## Conflict 44 — 07B §15 lists `image` as a REQUIRED `NewsArticle` field; Google requires it to represent the article (MEDIUM — RESOLVED 2026-08-13)

**Raised by LRG-UX-SCHEMA-001 correction 3**, which instructed: *"Remove the site logo fallback from `NewsArticle`
and `BlogPosting.image`. If there is no visible representative article image, omit `image`."*

### The two sources

**07B §15 (tier 4, Final approved and frozen)** lists `image` among the required `NewsArticle` fields, without a
condition. 07B §18 separately forbids fabricating documentary imagery, and §16 asks for "correction-safe images".

**Google's article structured-data guidance and its structured-data policies** (tier 6 evidence, re-verified
2026-08-13) treat `Article.image` as the image REPRESENTING the article, and require markup to describe the
page's actual visible content.

### What the build was doing, and why it was wrong

Both `newsSchema.ts` and `blogSchema.ts` emitted `image: ["…/logo.png"]` on every record — 19 articles and 12
posts, all the same wordmark. The reasoning recorded at the time was internally consistent: §15 requires the
field, §18 forbids inventing a photo, and the logo is the one image the organization genuinely owns.

It answers the wrong question. `image` is not "an image the publisher owns"; it is the image that represents
*this article*. A wordmark represents every article equally, which is to say none of them — and repeating it 31
times made a truthfulness claim no page could support. Under the structured-data policies that is markup
describing content the page does not contain.

### Resolution

`image` is emitted ONLY from a typed asset the page visibly shows (`representativeImage`, `lib/seo/articleImage.ts`).
No record in either corpus has one, so the field is absent throughout — **omission, not substitution**. The typed
seam means adding real editorial imagery later is a DATA change, and `alt` is required by the type, so an asset
cannot enter schema without an accessible name on the page.

The `NEWS_ARTICLE_REQUIRED_FIELDS` / `BLOG_POSTING_REQUIRED_FIELDS` constants still carry §15's list verbatim —
the blueprint's requirement stays readable in source — with `image` split into a `*_CONDITIONAL_FIELDS` list so
the test asserts the *rule* (absent without an asset, present with one) instead of quietly not checking.

**Why the hierarchy does not settle this on its own.** `CLAUDE.md` §2 puts tier 4 above tier 6, so §15 outranks
Google's guidance as a matter of authority. It is resolved here rather than escalated because the two do not
actually conflict on the FACTS: §18's prohibition on fabricated imagery and the policy requirement that markup
describe visible content point the same way, and the logo satisfied neither — it was a third option the blueprint
never contemplated. §15 assumed articles would have images, which the review corpus does not.

**Open founder item.** If 07B §15's `image` requirement is meant to be unconditional, the resolution is to
COMMISSION or license real editorial imagery, not to reinstate a stand-in. That is an editorial-budget decision.
Until it is taken, articles ship with no `image` in schema.

**Status.** RESOLVED as implemented; the editorial-imagery decision remains an OPEN founder item, and 07B §15 is
not amended.

---

## Conflict 45 — Home rail placement in `adAnchors.ts` did not match measured production placement (CLOSED — RECORDED 2026-08-27)

**Tier 4** — `home-preview-section-manifest.md` §4 (anchor → production slot mapping), BP-02 v1.1 §63 (position
map) — hung five of the six `hp_side_*` rail placements on two anchors: `hp_side_halfpage_pos1` + `hp_side_mpu`
on AD-H01, and `hp_side_halfpage_pos2` + `hp_side_mpu_pos1` + `hp_side_halfpage_pos3` + `hp_side_halfpage_pos4`
on AD-H05.

**Tier 1** — founder instruction, 2026-08-27: *"place the ads as they are on the current home page."*

### The evidence

Production Home (`lotterycorner.com/`) was measured live at a 1440px viewport. All six side placements exist and
all six are in a right rail — the `"notes": "Right rail"` transcription in `ad-slot-definitions.json` is correct
— but production spreads them down the whole page beside the content they accompany:

| slot | production `y` (page ≈ 12,000px) | share |
|---|---|---|
| `hp_side_halfpage_pos1` | 273 | 2% |
| `hp_side_halfpage_pos3` | 4948 | 41% |
| `hp_side_mpu_pos1` | 5776 | 48% |
| `hp_side_halfpage_pos4` | 9230 | 77% |
| `hp_side_mpu` | 9877 | 82% |
| `hp_side_halfpage_pos2` | 11981 | 100% |

The deployed new-UI build rendered the same six at `y` = 468, 516, 588, 636, 684, 732 — six placements inside
264px, then ~10,500px of empty rail. Two causes, one governed and one not:

1. the anchor map clustered them on two anchors (this conflict); and
2. `.lcp-rail` was a single page-level `position: sticky` column holding every rail group, which collapsed even
   that two-anchor intent into one stack. That is a layout defect, not a source conflict, and is fixed separately.

### Resolution

Rail groups re-hung across the four anchors whose sequence positions match production's shares: AD-H01 (14%) →
`pos1`; AD-H03 (44%) → `pos3` + `mpu_pos1`; AD-H04 (72%) → `pos4` + `mpu`; AD-H05 (88%) → `pos2`.

**What did NOT change**, and is asserted by the unchanged `assertHomeAdBaseline()`: no slot added, removed,
renamed, resized or retired; no GAM unit path, div id, size map or eager/lazy classification touched; all six
remain `subPosition: "rail"` and `visibility: "gte-992"`; `placedSlotKeys()` returns the same 15 active
placements. Only which anchor each rail group hangs from moved.

**Not amended.** `home-preview-section-manifest.md` §4 and BP-02 §63 still record the previous mapping. They are
superseded here by tier-1 instruction for Home only, exactly as `CLAUDE.md` §2 provides; no other page family's
anchor map is affected.

### Still open

Production also separates the two inline pairs that the new UI renders 48px apart —
`hp_mid_large_leaderboard_pos2`/`pos3` (both at 72%) and `hp_mid_billboard_pos2`/`pos3` (both at 88%). Production
puts 400–2,000px of content between each pair. Closing that requires either new anchors or moving a slot between
existing ones, which is a further BP-02 §63 change and a separate founder decision. **OPEN.**
