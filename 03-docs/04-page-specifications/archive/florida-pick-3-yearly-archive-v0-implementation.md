# Florida Pick 3 Yearly History Archive V0 — Implementation Record

**Task:** LRG-ARCHIVE-054 · **Baseline:** `b57b72e` · **Route:** `/fl/pick-3/2026` · **Guard:**
`LC_GAME_PREVIEW=true` (inert by default) · **Blueprint:** archive `YR-CURRENT`, `AR-01`…`AR-11` · No production
route, canonical, redirect, sitemap, export or ad change. Not committed.

Executes `03-docs/09-claude-execution-briefs/game-page/briefs/2026-08-05-game-page-brief-yearly-history-archive-v0.md`.

---

## 1. Source inventory

| Source | Status | Used for |
|---|---|---|
| `06-…-yearly-results-archive-blueprint-FINAL-APPROVED.md` v1.0 | Final approved, frozen | **Governing document.** §1 modes, §3 archive-year logic, §4 game identity, §5 completeness, §6 order, §7 protected priority, §8–§18 sections, §29–§33 SEO, §34 ad anchors, Part XI acceptance |
| `06-…-content-template-FINAL-APPROVED.md` v1.0 | Final approved | Visible copy. Template C (state daily game), E (partial data), F (correction), G (empty Ask), J (server-visible content), K (structured data), L (content ownership) |
| `06-…-archive-research-FINAL-APPROVED.md` v1.0 | Final approved | Supporting research |
| Root `CLAUDE.md`, root `AGENTS.md` | Governance | §10 routes, §12 ads, §14 fixtures, §15 API boundary |
| `florida-pick-3-game-page-implementation.md` + `-founder-review.md` | Prior record | Shared primitives, the guard pattern, the LRG-GAME-053 ordering distinction |
| `config/states/fl.json` `presentation.families` | Governed config | Pick 3 members 332/333 — **reused, not restated** |
| `struts.xml`, production `sitemap.xml` | Legacy, read-only | Route evidence (§3) |
| `gamehistoryresults_upgrade_as.jsp` | Legacy, read-only | The `lc_gh_*` ad inventory (§4) |

---

## 2. Founder direction versus the blueprint — the route conflict

The blueprint's Structure B uses **per-variant** yearly routes (`/fl/pick-3-evening/2021`) and §4 says not to
rename or split games during redesign. The founder has directed **one family route** with Midday and Evening as
independent rows. Production confirms the blueprint describes what exists:

| Route | Indexed years | Range |
|---|---:|---|
| `/fl/pick-3-evening/{year}` | 36 | 1988–2023 |
| `/fl/pick-3-midday/{year}` | 16 | 2008–2023 |
| `/fl/pick-3` | **0** | — |
| `/fl/pick-3/{year}` | **0** | — |

`struts.xml` maps the wildcard `*/*/*` to `GameResultsHistoryAction` with `selectedYear={3}`, so
`/{state}/{game}/{year}` is a live production **pattern** — but `/fl/pick-3/2026` is not a live **URL**.

**Applied as directed, without acting on the migration.** Member game ids 332 and 333 stay distinct; every draw
record keeps its own date, time, values, status and stored order; only page identity, navigation and presentation
are combined. Consolidating 52 indexed URLs into ~26 is a migration requiring the route, canonical, traffic,
backlink and edge-redirect audit `CLAUDE.md` §10 mandates. **No redirect, no canonical, no sitemap entry.**

**A second legacy note for the eventual cutover.** Legacy `*/*/*` also swallows `/fl/pick-3/news`; the new UI puts
articles one level deeper, so it has no such ambiguity — but the legacy behaviour matters before any redirect map.

---

## 3. Route, guard and the segment collision

### The collision, and why a build could not find it

The brief's allowed path is `01-new-ui/app/[state]/[game]/[year]/`. That directory cannot coexist with the
existing `app/[state]/[game]/[section]/`: **Next.js rejects two different slug names at the same dynamic depth.**

It rejects them at **request** time, not at build time. `[year]` beside `[section]` compiled cleanly and listed
both routes in the build table; every request then failed with
`You cannot use different slug names for the same dynamic path ('section' !== 'year')`.

A build-only probe therefore proves nothing here. An early probe's 500s were this error and were first
misattributed to stale-`.next` corruption; the pair has to be **served** to be verified.

### The resolution

One shared slug name at that depth:

```
app/[state]/[game]/[segment]/page.tsx          → the yearly archive
app/[state]/[game]/[segment]/[slug]/page.tsx   → an editorial article
```

They disambiguate on **content**, not position: a four-digit year is an archive, a known editorial segment is an
article, anything else 404s in both. **No URL changed** — `/fl/pick-3/news/{slug}` and `/fl/pick-3/2026` both
resolve as before. This is the one pre-existing file the task renames; the alternative (nesting the archive
deeper) would have invented a URL production does not have.

### Three independent conditions

1. **`resolveGamePreview`** — the same boundary `/fl/pick-3` uses: server-only `LC_GAME_PREVIEW` **and** an
   explicit game-registry pair. No `NEXT_PUBLIC_`. A narrower archive-only flag was rejected: it would allow the
   archive to be live while its parent game page was not.
2. **`isArchiveEligible`** — an explicit state/game/**year** registry (`lib/archive/archiveRegistry.ts`).
3. **A built model with rows** — belt and braces.

**A correction worth recording.** The first revision had no registry: it accepted any eligible game with any
parseable year and 404'd only when the fixture produced no rows. That is route existence *derived from data* —
the exact pattern `CLAUDE.md` §10 forbids — and it made `/fl/cash-pop/2026`, `/fl/lotto/2026`,
`/ca/superlotto-plus/2026` and `/fl/powerball/2026` all resolve 200, against a brief scoped to one archive page.
The registry is now the single answer to "what archive URLs does this build serve?" — `/fl/pick-3/2026`, and
nothing else.

### Verified resolution

| URL | Guard on | Guard off |
|---|---|---|
| `/fl/pick-3/2026` | **200** | 404 |
| `/fl/pick-3/2025`, `/2019`, `/2027` | 404 | 404 |
| `/fl/pick-3/abcd`, `/026` | 404 | 404 |
| `/fl/cash-pop/2026`, `/fl/lotto/2026`, `/ca/superlotto-plus/2026`, `/fl/powerball/2026` | 404 | 404 |
| `/fl/pick-3/news/cash-3-renamed-pick-3` | 200 | 404 |
| `/fl/pick-3` | 200 | 404 |

Metadata is `noindex, nofollow` with **no canonical** — the brief forbids emitting a production canonical from
synthetic review content. The title and description say the page is an internal preview. No `sitemap.ts` route
exists in the repository and `sitemapEntries()` emits no game or archive path, so sitemap exclusion is structural
and asserted by test.

---

## 4. History-page ad inventory — audited, not activated

Read from `gamehistoryresults_upgrade_as.jsp` (read-only). `04-sample-data/ad-slot-definitions.json` held only the
placeholder string `lc_gh_*`; these are the real slots.

| Slot | Sizes | Div id |
|---|---|---|
| `lc_gh_display_web_top_masthead` | 728×90, 320×50 | `div-gpt-ad-8701632745-0` |
| `lc_gh_display_web_middle_leaderboard_pos1` | 728×90, 336×280 | `div-gpt-ad-5061855814-0` |
| `lc_gh_display_web_middle_leaderboard_pos2` | 728×90, 336×280 | `div-gpt-ad-9289817098-0` |
| `lc_gh_display_web_middle_leaderboard_pos3` | 728×90, 336×280 | `div-gpt-ad-9152476576-0` |
| `lc_gh_display_web_middle_leaderboard_pos4` | 728×90, 336×280 | `div-gpt-ad-7071936826-0` |
| `lc_gh_display_web_side_halfpage` | 300×600, 336×280 | `div-gpt-ad-2146634548-0` |
| `lc_gn_display_web_bottom_leaderboard_sticky` | 728×90, 320×50 | `div-gpt-ad-6946562090-0` |
| `lc_mgp_snippet_…_mobile_leaderboard_pos1–4` | 320×50 | `div-gpt-ad-17074137…` |
| `LC_ATV_video_player` | 300×168 | `div-gpt-ad-1715268442152-0` |

Size-map breakpoint **992 px** — not Tailwind's 1024. The archive layout uses 992 deliberately so the layout tier
and the ad tier agree.

**Nothing is activated.** `AD-AR00`…`AD-AR03` keep their governed positions in `AR_ORDER`, render nothing and
reserve no geometry, with the suppression reason naming the family. Reading the inventory is not approval;
`CLAUDE.md` §12 requires a per-page-family audit and founder sign-off before a slot renders on a new surface.

---

## 5. Archive data-coverage matrix, `AR-01`…`AR-11`

| § | Rendered | Source | Notes |
|---|---|---|---|
| AR-01 | ✅ | Family config, format, rule era, coverage | Breadcrumbs, logo, H1, status line, year navigation, return link. Previous year is **not** a link — no earlier year is connected, so it reads "No earlier year connected" rather than linking to an empty archive |
| AR-02 | ✅ 6 metrics | Deterministic counts | Draws completed · by variant · doubles · triples · unique exact results · repeated exact results. Partial-data and correction notices render **above** them (blueprint §7) |
| AD-AR00 | ⛔ | — | Anchor held, nothing rendered |
| AR-03 | ✅ 5 points | Deterministic metrics | Labelled `LotteryCorner AI Year-to-Date Brief` **plus** an explicit statement that no live model produced it. Every point carries its figure and an evidence link |
| AR-04 | ✅ 12 months | Row counts, rule data | Jan–Jul are links with counts; Aug–Dec read "(not yet)". ⚑ correction marker on June only; § rule-change marker on no month, because Pick 3's era began 2021-01-18 |
| AR-05 | ✅ 52 rows | Fixture + feed | Date · Drawing · Winning digits · Fireball · Pattern · Sum · Status · Actions. Midday then Evening per date. `Discuss` absent — no community destination exists |
| AD-AR01 | ⛔ | — | Anchor held |
| AR-06 | ✅ | Deterministic filter + interpreter | Number, match mode, drawing, month, pattern, sum range, order, include-add-on, include-corrected. One complete public Ask answer is **server-rendered** |
| AR-07 | ✅ 9 views + 4 notable | Deterministic statistics | 3 position frequencies · drawing comparison · shape distribution · sum distribution · front and back pairs · previous-draw repeats. Every notable draw links to its row |
| AD-AR02 | ⛔ | — | Anchor held |
| AR-08 | ✅ 6 tools | Format + capability | 3 `Public`, 3 `Planned`. **No** `Sign in to save` anywhere — no auth service exists |
| AR-09 | ✅ 4 groups | Game configuration | News, Guides, Blogs with real article routes; Community as an honest empty state |
| AR-10 | ✅ | Coverage + manifest | Five coverage fields, last verified, source label, rule era, methodology, export status, corrections policy link |
| AR-11 | ✅ 4 actions | Config + mode | Return · Check numbers · Search this year · Compare another year (noted unavailable). No Save, Follow, alert or Buy |
| AD-AR03 | ⛔ | — | Anchor held |

Absences are model-level reasons, not blank space. Suppressed sections are listed at the page foot as review
diagnostics, never as reader copy.

---

## 6. Reuse classification (`CLAUDE.md` §6 vocabulary)

**KEEP — used unmodified:** `resolveGamePreview`, `isGamePreviewEligible`, `gameConfigFor`, `stateViewConfigFor`
families, `formatVersionsFor`, `selectFormatVersion`, `formatProfile`, `parseGroupInput`, `matchGroup`,
`sameValuesDifferentOrder`, `drawEventsFor`, `resolveReviewDate`, `ruleErasFor`, `selectRuleEra`,
`eraPublishableAsCurrent`, `stateManifestFor`, `gate`, `gameCapability`, `editorialSections`, `StateBallGroup`,
`gameLogo`, `sitemapEntries`, and every function in `digitHistoryAnalysis` (`positionFrequency`,
`shapeDistribution`, `sumDistribution`, `pairFrequency`, `repeatFromPrevious`, `STATISTICS_NEUTRALITY`,
`assertNeutralLanguage`).

**NEW:** `lib/archive/{archiveContract, archiveYear, archiveRegistry, archiveReviewFixture, archiveMetrics,
archiveFilter, archiveAsk, archiveModel}.ts` · `components/archive/{ArchiveView, ArchiveWorkspace}.tsx` ·
`app/[state]/[game]/[segment]/page.tsx` · `tests/archive-page.test.ts` · a 216-line `lca-` CSS section.

**REFACTOR — minimal, justified, regression-covered:**

| File | Change | Why |
|---|---|---|
| `app/[state]/[game]/[section]/[slug]/page.tsx` → `[segment]/[slug]/page.tsx` | Directory and param rename | The slug-name collision in §3. No URL changed |
| `tests/game-page.test.ts` | The CSS-namespace slice now ends at the next page-family banner | It ran to end-of-file, correct only while the Game Page block was last. When `lca-` was appended every archive selector read as an un-namespaced Game Page rule. Original intent unchanged |

**Deliberately NOT created:** a competing family registry, a second review-date source, a second ordering system,
a jackpot metric set, any export, any structured data, any archive ad, and a `GameYearArchive` /
`GameYearMetrics` / `GameYearAISnapshot` service contract — blueprint Part VII describes a computing-and-caching
service, which is API work, not a UI task (`CLAUDE.md` §15).

---

## 7. How the model stays generic

Nothing in the model or the composition reads a game slug to decide behaviour — asserted by a test that greps
every archive module for a state code, a game name, `Fireball`, `Midday` or `Evening`. Three declared sources
drive every decision:

1. **The format profile** — count, range, ordered or not, repeats or not, which special groups exist, which tools
   the shape can support.
2. **The family configuration** — which members exist, their labels and their `displayOrder`.
3. **The game configuration** — capabilities, copy, editorial inventory.

### The generalization proof

Driven through the same `buildArchiveModel`, with **no public archive route** for any proof case (brief Phase 4):

| Shape | Game | Result |
|---|---|---|
| Ordered digits, 2 variants | `fl/pick-3` | Positional frequency, pairs, doubles/triples, exact/any-order controls, sums |
| **Single value, 5 variants** | `fl/cash-pop` | **Zero occurrences of "digit" or "position"** in any produced string. No shape, sum, pair or repeat metric. All five variants kept, in configured order |
| Unordered pool, single member | `fl/lotto` | No positional or ordered-pair analysis, no double/triple metric, no variant comparison. Exact-repetition metrics suppressed by the outcome-space gate |
| Unordered pool + special ball | `ca/superlotto-plus` | Mega Ball is a separate group; a full main match with the **wrong** special ball does not match |

**The outcome-space gate.** "Unique exact results" is informative at 1,000 outcomes (Pick 3) and meaningless at
C(53,6) = 22,957,480 (Florida Lotto), where "26 of 26" is arithmetic and would imply a repeat was a live
possibility. The gate computes the space from the declared format, so no game is named.

---

## 8. The review fixture

52 rows for 2026: **2 from the captured production feed** (the newest row for each member) and **50 internal
review samples** filling earlier dates. Four dates a month × 2 members, January through July.

- Provenance is a required **data** field, spelled `synthetic/internal-review` exactly as the brief requires.
- Real data wins: the top of the table is real, and no synthetic row is dated on or after a real one.
- Deterministic — a seeded LCG keyed on year and family, no `Math.random`, no clock read. Two builds produce
  identical rows.
- Demonstrates: all twelve months' navigation with seven populated, both variants on the same dates, exact and
  any-order matches, all-different / double / triple, add-on present (44 rows) and absent (8 rows), one corrected
  row with its full correction record, and the `PARTIAL`/`CORRECTED` coverage state.
- Contains **no** synthetic winner, prize, payout, jackpot, retailer, article date or discussion.

**Three barriers.** The route 404s with the guard off; `buildArchiveReviewRows` returns empty unless
`previewEnabled`; and — added after a defect — the fixture returns empty unless the captured feed carries a real
record **in that year**.

**That third barrier is a real correction.** Without it the generator produced a complete twelve-month archive for
any past year, because every date in 2019 precedes the review date. `/fl/pick-3/2019` returned **200 with 96
fabricated rows** and a status line describing a year this repository holds no data about — the synthetic-as-fact
failure `CLAUDE.md` §14 forbids. Production has 52 indexed Pick 3 yearly URLs back to 1988; inventing their
contents is not a substitute for connecting them.

---

## 9. Ask the Archive — what it is, honestly

> **The Ask surface was removed on 2026-08-06** by `DATA-DEC-001` `FD-DAT-02` (see **N**). This section describes
> what was built and remains accurate about `lib/archive/archiveAsk.ts`, which is retained and still tested. It no
> longer describes anything a reader can see.

Real AI-provider integration is out of scope (brief §2). The dishonest options were a stub presented as
generated output, or hand-written prose whose label implies a model. Both would make the page a false statement
about how it works.

Implemented instead as a **deterministic interpreter**: it genuinely parses the reader's question into an
`ArchiveFilterInput`, reports what it understood, and when it understands nothing it **says so** with content
template Template G's suggestions rather than inventing an interpretation. Two disclosures render in the page:
`INTERPRETER_DISCLOSURE` in the Ask block, and the brief's `generation` line in AR-03 — both stating that no live
model produced or verified the answer, while the required AI label is still present.

The architectural point survives intact: **every count, row and explanation comes from deterministic code**, and a
test asserts the answer's count equals the same filter's count. Replacing the parser with a provider later changes
only how a question becomes a filter.

It recognises a month name, a variant label (from the family's **own** labels), a number of the main group's exact
length, order vocabulary, and shape words — including the phrases the page itself displays. That last part was a
defect: a generated suggested prompt read "Which dates had every value the same?" and the parser only knew the
word "triple", so the page suggested a question it could not answer.

---

## 10. Ordering — the three-way distinction, carried forward

The LRG-GAME-053 record's correction applies here verbatim:

1. **Real winning values preserve supplied order.** A feed value is never reordered, and a test asserts each
   row's rendered main group equals its stored array.
2. **History *records* may be ordered for presentation.** Rows sort newest-first; within one date, members keep
   the family's `displayOrder` — never alphabetical, never by game id. Search results re-sort records only.
3. **Guarded unordered *sample* values may be normalised.** A synthetic group whose declared semantics are
   `repeatsAllowed: false` is sorted ascending, because every operator in the reference set publishes such a game
   ascending. An **ordered** group is never sorted — its positions are the point.

---

## 11. Verification

| Check | Result |
|---|---|
| Type-check (`tsc --noEmit`) | **exit 0** |
| Lint (`next lint`) | **exit 0**, 0 errors, 3 pre-existing `GameChecker` dependency warnings — **no new warnings** |
| Full test suite | **790 pass, 0 fail** (166 suites; 707 before, **83 archive tests added**) |
| Production build | **exit 0**, 22/22 static pages |
| Guard-on routes | `/fl/pick-3/2026` 200 with all 11 sections and 52 rows in server HTML |
| Guard-off | Every guarded route 404. 404 body contains **0** occurrences of "Internal preview", "internal review sample", "Year to Date", `data-section-id`, `draw-332` or "Ask the" |
| Home + 6 State pages | **Byte-identical** guard-on versus guard-off, from one build (the guard is read per request) |
| Game Page | 18 JG sections unchanged; no archive link added to its navigation |
| Overflow at 390 px | `scrollWidth === clientWidth === 390`, **0** elements past the edge without a scroll ancestor |
| Overflow at 1440 px | `scrollWidth === clientWidth === 1440`, 1380 px canvas, **0** tables needing scroll, prose bound to 635 px |
| Tables | 11 tables, all inside `overflow-x: auto` containers with `tabIndex={0}` and an `aria-label` |
| Interaction | Typed `378`, submitted → *"1 of 52 drawings match 378 in exact order"*, matching the real 2026-07-09 Midday draw |

### Two layout defects found and fixed in the responsive review

1. **Page-level horizontal overflow at 390 px** (`scrollWidth` 503). Two causes: flex items default to
   `min-width: auto`, and `.lcg-fine` carries a prose `max-width` wider than the viewport. `min-width: 0` alone
   was **not** enough — an implicit grid column is `auto` and resolves toward max-content, so the constraint had
   to go on the **track**: `grid-template-columns: minmax(0, 1fr)`.
2. **The 900 px container** left the results table scrolling at 1440 px. Widened to 1380 px scoped to
   `[data-archive-mode]` / `.lca-page`, mirroring the JG-M2 precedent. Prose stays bound to `--layout-measure`.

### Screenshots

`{scratchpad}/archive-shots-lrg-archive-054/fl-pick-3-2026-{390,1440}.png`. Scratchpad, **outside the
repository**, so `git status` stays clean — and session-scoped, so re-capture for a founder review rather than
relying on the path. Headless captures crop rather than reflow, so overflow was **measured** in the browser
rather than read off the image.

---

## 12. Known limitations

1. **One archive year exists.** 2026 only, because it is the only year with a captured feed record. Previous-year
   navigation, Compare Years, Archive Explorer and Rule-Era Comparison therefore have nothing to work on and are
   labelled `Planned`. Connecting the real history — 52 indexed per-variant Pick 3 yearly URLs back to 1988 — is
   the substantive next step.
2. **50 of 52 rows are internal review samples**, and four dates a month is not a real Pick 3 draw calendar (a
   real year is ~730 rows for two variants). Row-volume behaviour — pagination, crawlable month partitioning,
   payload size — is unproven at real scale.
3. **The G1 data gaps from the Game Page record are unchanged and still open**: no per-draw identifier, no
   intra-day sequence, no draw-level status history, no per-draw published-at timestamp. `(gameId, resultDate)`
   remains the only draw identity, which is unique for the captured feed but would collide if a member ever
   published two drawings on one date. These stay **future data-provider requirements**, not UI design work.
4. **No structured data at all** in this V0. Blueprint §32 permits `WebPage`/`CollectionPage`/`BreadcrumbList`/
   `ItemList` only when the data is governed; most rows here are samples, so schema would describe synthetic
   content as fact. The production title, description, canonical and schema templates are recorded for cutover.
5. **Ask the Archive is a deterministic parser, not a model.** It handles month, variant, number, order mode and
   shape. A question outside that vocabulary is honestly refused rather than guessed at.
6. **No account capability.** `member-auth` does not exist, so no Save, Follow, alert or saved-search control is
   drawn and no tool is labelled `Sign in to save`. The gap is the record, not a placeholder control.
7. **No export and no `Discuss` action.** Data-redistribution rights are unapproved and no community service
   exists.
8. **A pre-existing content typo now also renders here.** A configured Pick 3 news title reads
   *"fIREBALL replaced the 1-OFF play style…"* — the capitalisation is wrong at the source
   (`config/games/fl-pick-3.json`). Not corrected: that file is Game Page configuration, outside this task's
   allowed paths. It is a one-word fix for whoever owns that config.
9. **The archive canvas widening is attribute-scoped but shares a selector surface with the Game Page's.** Both
   now override `.lcg-container`; a third page family should reconcile them into one rule rather than adding a
   fourth override.

---

## 13. Founder decisions required

1. **The route conflict in §2.** Keep `/fl/pick-3/2026` guarded pending the URL audit, or begin the audit that
   would consolidate `/fl/pick-3-{midday,evening}/{year}` into the family route. **Nothing is redirected today.**
2. **Ad activation.** The `lc_gh_*` family is now documented with sizes and div ids. Approving it for the archive
   surface is a separate decision; the four anchors are inert.
3. **Export and data rights.** AR-10 states no export is available. A governed dataset release would also unlock
   `Dataset` markup, which is prohibited until then.
4. **Ask the Archive's future.** Confirm the deterministic interpreter is acceptable for review, and whether a
   real provider is in scope for the next phase.
5. **Row volume at real scale.** A real Pick 3 year is ~730 rows. Confirm whether the full year stays in one
   server-rendered page (crawlable, per blueprint §35) or is partitioned by month with crawlable links.

---

# FOUNDER-CORRECTION PASS — LRG-ARCHIVE-055 (2026-08-05)

The founder reviewed the V0 and found it read as an internal validation report rather than a public lottery
archive. This pass corrects the presentation. **No 2023 data is connected, no year is registered, no route,
canonical, sitemap, redirect, ad, export or AI provider is activated.** Not committed.

## K1. The problem, measured before the change

| | Before | After |
|---|---:|---:|
| Screens to reach search (390 px) | **10.2** | **1.3** |
| Screens to reach the first result (390 px) | 4.4 | **2.3** |
| Total page length (390 px) | 23.6 screens | **17.2** |
| Screens to results (1440 px) | 2.6 | **1.4** |
| Search position | *after* the results | **before** them |
| `verified` in visible text | **53** | **0** |
| Row action links | **156** | **0** |
| Statistics tables shown by default | **9** | **4** |
| Non-functional roadmap cards | **4** | **0** |
| Visible ad-anchor review block | present | **removed** |

## K2. The eleven corrections

**1 — Verification terminology removed.** No `Status` column, no `verified` badge, no "Last verified" (now "Last
updated"), no "verified observations". `row.status` and `row.provenance` survive on the data as `data-status` and
`data-provenance` attributes for governance and tests; a test asserts both that they exist internally and that no
string matching `/verif/i` reaches any reader-facing field.

**2 — The correction presentation is gated on a genuine record.** `isGenuineCorrection` requires a previous value,
a corrected value, a **source** and a date. The fixture's record now carries `source: null`, so it is structurally
unpublishable — the gate does the work, not a caption. Five surfaces were keyed on the raw `corrected` flag and all
five now consult the gate: the notice, the row marker, the month ⚑ marker and its legend, the notable-draw
narrative (which the brief then repeated), and the `CORRECTED` completeness state. The "Include corrected results"
filter is also hidden, because a filter for a state the archive cannot contain teaches the wrong thing.

**3 — One preview disclosure.** Rewritten in plain language and kept, because most rows are samples and removing
the warning would let them read as real. Every other internal phrase is gone: "internal review samples", "governed
rule data", "Not rendered in this review", the `AD-AR*`/`lc_gh_*` list, the interpreter disclosure, "rule era".

**4 — Content before the results shortened.** The founder hierarchy is now the render order. The six-card metric
grid became four inline facts (total, Midday, Evening, dates covered); the fuller metric set and the year brief
moved below the results.

**5 — Year navigation** — new `ArchiveYearNav`, `‹ Older | 2026 ▾ | Newer ›`, driven only by
`archiveYearNavigation` over the registry. Older/Newer mean the **nearest registered** year, never `year ± 1`; a
boundary renders as `aria-disabled` text, never a link. Filters survive a year change via a **URL fragment** —
carried because the reader's question does not change with the year, a fragment because blueprint §31 forbids an
indexable filter state. The month remaps to the destination year and drops when unavailable there; a variant drops
when the destination family lacks the id. Multi-year behaviour is proven by tests over non-consecutive years, with
no fake year registered.

**6 — Search moved above the results,** with the matching-count summary between the controls and the rows. The Ask
block moved below the results and its copy is now "Answers are based on the results in this archive."

**7 — Rows simplified.** No `Status`, no `Actions`. Fireball is `Fireball: 9` in smaller type inline with the
digits — and, correcting a first attempt at this fix, it is also **excluded from `RowValues`**, because it was
rendering as a full-size ball *and* as the inline label, which is exactly the fourth-winning-digit reading the
direction rules out.

**8 — Statistics weighted.** Four primary views open: number frequency by position, repeated digits, sum
distribution, drawing comparison. The three separate position tables became **one combined view** (digits as rows,
positions as columns) — without that, "four primary insights" still rendered as six tables. The rest sit in a
native `<details>`, keyboard-operable and announced. The responsible-play statement is unchanged and still renders
above the figures. The engine and its coverage are untouched.

**9 — Roadmap capabilities hidden.** Compare years, Archive Explorer, Rule-era comparison and Download/report are
gone from the page and live in §12 and the strategy document. `ToolAccess` keeps its `planned` member because the
type describes the domain; a test asserts nothing reaching the model carries it. No Continue action explains why it
does not work.

**10 — The ad-anchor review block removed.** `AD-AR00`…`AD-AR03` are absent from the render order and preserved in
`AR_ORDER_BLUEPRINT`, in §4's audited slot table and in tests. No ad is activated.

**11 — Real-scale strategy** — `florida-pick-3-yearly-archive-real-scale-strategy.md`.

## K3. Section order — before and after

| | Order |
|---|---|
| **Blueprint §6** | AR-01, AR-02, **AD-AR00**, AR-03, AR-04, AR-05, **AD-AR01**, AR-06, AR-07, AR-08, **AD-AR02**, AR-09, AR-10, AR-11, **AD-AR03**, Footer |
| **V0 as reviewed** | AR-01, AR-02, AR-03, AR-04, AR-05, AR-06, AR-07, AR-08, AR-09, AR-10, AR-11 |
| **Now** | AR-01, AR-04, **AR-06**, **AR-05**, AR-03, AR-02, AR-07, AR-09, AR-10, AR-11, Footer |

Section IDs are unchanged, so the §6 taxonomy, the per-section contracts and the Section Intelligence Matrix all
still apply to the same sections. `AR_ORDER_BLUEPRINT` retains the original verbatim so the deviation is diffable.

**Deviations founder direction required:** §6 order (search before results, long-form below); §9 six metrics → four
above the results; §12 row actions removed; §13 Ask separated from the filters and placed after the results; §15
tool cards with `Planned` badges hidden; §17 "Last verified" → "Last updated"; §34 ad anchors absent from the
render order.

## K4. Files changed in this pass

| File | Change |
|---|---|
| `lib/archive/archiveContract.ts` | `AR_ORDER` (founder) + `AR_ORDER_BLUEPRINT`; `isGenuineCorrection`; `lastUpdatedIso`; `primary` on analysis views; `summaryMetrics`, `yearNav`, `hasPublishedCorrection` |
| `lib/archive/archiveRegistry.ts` | `adjacentArchiveYear`, `archiveYearNavigation` |
| **NEW** `lib/archive/archiveFilterCarry.ts` | Fragment encode/decode and destination-year application |
| **NEW** `lib/archive/archiveFilterBus.ts` | Client-only holder linking the workspace to the year navigation |
| `lib/archive/archiveModel.ts` | Concise summary; correction gate; registry year nav; combined frequency view; primary weighting; tools and actions filtered to what works; de-jargoned coverage |
| `lib/archive/archiveMetrics.ts` | Notable draws gate on a genuine correction |
| `lib/archive/archiveReviewFixture.ts` | `source: null`; plain-language banner |
| **NEW** `components/archive/ArchiveYearNav.tsx` | The year navigation |
| `components/archive/ArchiveView.tsx` | Reorder; concise summary; no Status/Actions; inline add-on excluded from `RowValues`; `<details>` statistics; one disclosure; no suppressed block |
| `components/archive/ArchiveWorkspace.tsx` | `part="search" \| "ask"`; fragment restore; filter publishing; gated corrected filter; plain Ask copy |
| `app/globals.css` | `lca-` additions only (summary, year nav, add-on, corrected marker, details) |
| `tests/archive-page.test.ts` | 6 suites updated, **36 tests added** (119 archive tests total) |
| `tests/game-page.test.ts` | *(previous pass)* CSS slice bounded by the next family banner |

## K5. Validation

| Check | Result |
|---|---|
| Archive tests | **119 pass, 0 fail** |
| Full suite | **827 pass, 0 fail** (173 suites) |
| Type-check | exit 0 |
| Lint | exit 0, 0 errors, **no new warnings** (3 pre-existing `GameChecker`) |
| Production build | exit 0, 22/22 static pages |
| Guard off | every guarded route 404s; the 404 body contains **0** occurrences of "preview", "sample", "Year to Date", `data-section-id`, `draw-332`, "Midday", "Total drawings" or `lca-` |
| Route regression | archive 200, both article routes 200, `/fl/pick-3/2025` and all four unregistered pairs 404 |
| Home + 6 State pages | **byte-identical** guard-on vs guard-off from one build |
| Game Page | 18 JG sections unchanged, no archive link added |
| 390 px | zero page overflow, all tables wrapped, year-nav and `<details>` targets ≥ 44 px |
| 1440 px | zero page overflow, 1380 px canvas, **0** tables needing scroll |
| Roadmap / ad review | **0** `[data-access="planned"]` elements, **0** suppressed-section blocks |

Screenshots: `{scratchpad}/archive-shots-lrg-archive-055/` — `full-{390,1440}.png`,
`crop-top-and-yearnav-390.png`, `crop-top-search-rows-1440.png`. Outside the repository; session-scoped.

## K6. Limitations after this pass

1. **Still one year, still 50 of 52 rows synthetic.** Unchanged, and the reason the preview disclosure stays.
2. **Cross-year filter carry is proven by unit tests, not by use** — there is no second year to click to. The
   encode/decode, month remap and variant drop are all tested directly.
3. **`archiveMetrics` is now only reachable below the results.** Its six metrics are still computed and tested;
   whether the fuller set earns its place there is a founder call after this review.
4. **The month index is not yet pagination.** At 52 rows it is navigation; at ~730 it becomes the pagination
   control, which is what the strategy document proposes and nothing implements.
5. **The `lca-page` canvas override shares a selector surface with the Game Page's JG-M2 override.** Both widen
   `.lcg-container`; a third page family should reconcile them into one rule.
6. **The Pick 3 news title typo** (`"fIREBALL replaced…"` in `config/games/fl-pick-3.json`) is unfixed — that file
   is Game Page configuration, outside this task's allowed paths.

---

# PUBLIC EXPANSION — LRG-ARCHIVE-057 (2026-08-05)

Phase 1 of the accepted capability audit. **No authentication, account persistence, Insider, forum, alerts or
notifications.** No 2023 data, no new registered year. Not committed.

Governed by **`ACCT-DEC-001`** (`03-docs/08-decisions/account-identity-and-signed-in-capability-decisions.md`),
created in this task and recorded by `LRG-DEC-029`.

## L1. What was added

| § | Capability | Notes |
|---|---|---|
| 1 | `Table \| Calendar` switch inside AR-05 | Server table remains the default and the crawlable form |
| 1 | Desktop month calendar (7 grids) | Sunday-aligned, weekday from noon-UTC, three honest day states |
| 1 | Mobile date-grouped agenda | Swaps in below 720 px; 27 dated groups |
| 2 | Result detail | Native `<details>`, date · drawing · values · Fireball · pattern · sum · source · last updated, plus a gated correction |
| 3 | `Explore more analytics (6)` | Pairs ×2, consecutive, monthly comparison, historical gaps, previous-draw repeats |
| 4 | Two Ask intents | Consecutive-pattern and historical-gap aggregates, with supporting rows. **Surface removed in N (LRG-ARCHIVE-059) — `FD-DAT-02`.** The intents and their tests remain |
| 5 | Articles | Already live (AR-09); unchanged this pass |
| 6 | Year CSV, filtered CSV, print | ~~Public~~; RFC-4180 escaped; print header + print stylesheet. **Controls removed in N (LRG-ARCHIVE-059) — `FD-DAT-01`.** The builder, the escaping and the print stylesheet remain |
| 7 | Shell account promises removed | `account` and `favourites` off by default; `FavoriteStar` defaults to off |

## L2. Section order — unchanged

`AR-01, AR-04, AR-06, AR-05, AR-03, AR-02, AR-07, AR-09, AR-10, AR-11`. The founder's target order maps onto it
with the view switch **inside** AR-05 rather than as a section, exactly as the audit proposed.

**AR-08 is now reserved and empty** (`FD-ACC-08`). It previously held three "public tools" — two anchors to AR-06
and AR-07 on the same page and one link to the game page — which was navigation furniture rather than a tool
launcher. `buildTools` is retained and returns `[]`.

## L3. Three defects found and fixed during this pass

1. **AR-08 rendered redundant anchors.** Superseded by `FD-ACC-08`; the section is reserved.
2. **A 390 px page-level overflow of 557 px, with zero over-wide elements reported.** The cause is worth
   recording because it will recur: `.lcs-vh` is `position: absolute`, and an absolutely positioned element is
   clipped by an ancestor's `overflow: auto` **only when that ancestor is its containing block** — which requires
   the ancestor to be positioned. `.lcg-tablewrap` was not, so the hidden span inside the new detail `<summary>`,
   laid out at document x≈548 inside a 640 px table, escaped the scroll container and extended the document. Fixed
   with `.lca-page .lcg-tablewrap { position: relative; }`. **The same latent condition exists on the Game Page**
   and is recorded in L6 rather than changed, because that page is preserved by this task.
3. **The detail cell was too wide** — `white-space: nowrap` plus a `.lcg-fine` link whose prose `max-width` far
   exceeds a table cell. The link was removed (the source is already a field) and the cell bounded.

## L4. Files changed

| File | Change |
|---|---|
| **NEW** `lib/archive/archiveCalendar.ts` | Month/agenda grouping, three-state days, no date parsing |
| **NEW** `lib/archive/archiveDownload.ts` | CSV builder, RFC-4180 escaping, formula-injection guard. *Kept in N; no longer called from the page* |
| **NEW** `components/archive/ArchiveResultViews.tsx` | View switch, calendar, agenda, downloads, print, `ResultDetail`. *Downloads and print removed in N* |
| `lib/archive/archiveContract.ts` | `coveredFromIso`/`coveredToIso` |
| `lib/archive/archiveModel.ts` | Consecutive, monthly and gap views; AR-08 reserved; coverage bounds |
| `lib/archive/archiveAsk.ts` | `AskAggregate`, two intents, `aggregateAnswer` |
| `components/archive/ArchiveView.tsx` | Island above the table, per-row detail cell, print header, disclosure label |
| `lib/layout/shellCapabilities.ts` | `account: false`, `favourites: false` by default |
| `components/account/AccountHooks.tsx` | `FavoriteStar` defaults to `enabled: false` |
| `app/globals.css` | `lca-` additions plus the print stylesheet |
| `tests/archive-page.test.ts` | **+42 tests** (161 archive tests) |
| `tests/state-preview.test.ts` | One LRG-STATE-022 assertion superseded by `FD-ACC-14` |
| **NEW** `03-docs/08-decisions/account-identity-and-signed-in-capability-decisions.md` | `ACCT-DEC-001` |

## L5. Validation

| Check | Result |
|---|---|
| Archive tests | **161 pass, 0 fail** |
| Full suite | **868 pass, 0 fail** (179 suites) |
| Type-check / Lint / Build | exit 0 / exit 0 with no new warnings / exit 0 |
| Guard on/off | archive + article 200 on, 404 off; `/fl/pick-3/2025` and unregistered pairs 404 both ways; **0** fixture leaks in the 404 |
| Home + 6 State pages | **byte-identical** guard-on vs off |
| Game Page / Article | 18 JG sections; article 200 |
| 390 px | **zero page overflow** in table, calendar, detail-open and analytics-open states |
| 1440 px | zero overflow, 7 month grids, **0** tables needing scroll |
| Day states | 27 `drawn`, 160 `noDrawing`, 25 `outside` — no blank cells |
| Keyboard | 110 focusable new controls, **0** unreachable; all ≥ 44 px |
| Absent | ad-review block, `planned` cards, Login, Register, star, `AD-AR`, AR-08 — all **0** |

Screenshots: `{scratchpad}/archive-shots-lrg-archive-057/` — `full-{390,1440}.png`, `crop-top-390.png`,
`crop-viewswitch-and-downloads-1440.png`. Interactive states (calendar, agenda + open detail, analytics) were
captured in the review session; the browser pane renders blank at 1440 px after scrolling, so those are 390 px.

## L6. Remaining defects and findings

1. **`.lcg-tablewrap` is not a containing block outside the archive.** The same absolutely-positioned-descendant
   escape can occur on the Game Page. Not changed — that page is preserved here. Recommended as a one-line
   shared-CSS fix in its own task.
2. **The disabled state selector still renders** (`title="State selector (coming soon)"`) on Home, State, Game and
   the Archive. It is a navigation control rather than an account control, so `FD-ACC-14` does not reach it and the
   PRESERVE list covers those pages. Recommended for a founder ruling alongside `newsletter` and `privacyManager`.
3. **Home's "AI-assisted lottery tools (coming soon)"** promo block is Home-owned and preserved.
4. **Custom date range is not implemented.** The direction permitted it *"if it can operate completely from the
   current archive rows"*. It can — but the existing month and sum controls already narrow the set, and adding two
   more date inputs to a workspace that is already eleven controls wide risks the density the correction pass
   reduced. Recommended as a founder decision rather than assumed.
5. **A five-draw game's calendar is untested at real scale** — 1,825 rows would put five drawings in one day cell.

---

# FOUNDER-REVIEW CORRECTIONS — LRG-ARCHIVE-058 (2026-08-06)

Verification pass on the provisionally accepted Phase 1. Not committed.

## M1. Calendar day-state accuracy — a false claim, corrected

**The defect.** Any date inside the covered range with no archive row was classified `noDrawing` and rendered the
words **"No drawing"**. Both Pick 3 members register `drawDays: "Daily"`, so a drawing occurred on every one of
those dates. **160 of 187 cells were making a false factual claim about a real lottery.**

The founder's premise was exactly right: an absent row is not proof that no drawing occurred.

### The exact rule for each state, after correction

| State | Rule | Reachable for Pick 3? |
|---|---|---|
| `drawn` | ≥ 1 archive row for the date in the current filter | Yes — 27 dates |
| `noDrawing` | **Positive evidence only:** an explicit no-draw record for the date, **or** the registered schedule excludes that weekday, **or** the schedule expects a drawing *and* coverage is complete | **No** — daily schedule, incomplete coverage |
| `noRegisteredResult` | No row, and none of the above can be established. Renders *"No registered result"* | Yes — 160 dates |
| `outside` | Before the first or after the last date the archive covers. No visible claim | Yes — 25 dates |

`noDrawing` is now a conclusion that must be earned. An unreadable schedule can never license it: `parseDrawDays`
returns `unknown` for anything it cannot parse, and `scheduleDrawsOn` returns `null` rather than `false` — the
three-state return is the whole fix, because collapsing "unknown" into "no" is what produced the defect.

### Is the archive data complete for every displayed date?

**No, and emphatically not.** `assessCoverage` measures it:

| | |
|---|---|
| Covered range | 2026-01-04 → 2026-07-09 |
| Calendar days in range | **187** |
| Dates the schedule expects a drawing | **187** (daily) |
| Dates the archive holds a row for | **27** |
| `complete` | **false** |

### State counts before and after

| State | Before | After |
|---|---:|---:|
| `drawn` | 27 | **27** |
| `noDrawing` | **160** ← every one false | **0** |
| `noRegisteredResult` | — | **160** |
| `outside` | 25 | **25** |

A single coverage note now renders above the grid explaining the gaps in the schedule's own terms, so 160 muted
cells do not read as a broken calendar. The style is muted italic — an absent record, not an event and not an error.

**Evidence sources.** `drawDays` is available and parsed. An explicit day-off status is **not** available anywhere in
this repository; production has a `game_daysoff` table, so the concept exists upstream, and
`explicitNoDrawDates` is the parameter it will feed. Nothing was invented.

Weekday alignment remains pinned to noon UTC in both `archiveCalendar.ts` and the new `archiveSchedule.ts`.

**13 tests added**, including the two that matter most: no cell claims `No drawing` for a daily game, and a
`"Wed & Sat"` schedule *does* still license the claim — so the correction removed the false statements without
removing the true one.

## M2. The 1440 px blank pane — a capture-tool limitation, proven three ways

**The real UI is not blank.** After scrolling to the calendar at 1440 px the live DOM reports the grid in the
viewport at 1316×953, `display: block`, `visibility: visible`, `opacity: 1`, with 27 drawn cells carrying real
content and month headings present. **Hit-testing `document.elementFromPoint` at the grid's centre returns
`SPAN.lca-calcell`** — the browser's own confirmation that the calendar is painted there.

Three diagnostics isolate the cause to the capture path:

1. **DOM + hit-test after scrolling** — content present and painted; capture blank.
2. **Page height halved** (16,611 → 8,456 px) then captured — still blank, so height is not the cause.
3. **Captured at `scrollY: 0`** with the grid brought into the first viewport — **captures perfectly.**

**Conclusion:** the in-app browser pane cannot capture a *scrolled* viewport at 1440 px. At 390 px scrolled
captures work; at 1440 px only `scrollY: 0` does. Nothing in the archive causes it and no fix belongs in this code.

**The reliable method**, used for every 1440 px capture in this pass: collapse the sections above the target so it
lands in the first viewport, capture at `scrollY: 0`, then reload. Purely a capture aid — no code path, no
persisted state, and a reload restores the page exactly.

Verified at 1440 px this way: the **calendar** (January grid — Jan 1–3 shaded and unlabelled as `outside`, Jan 4
showing independent Midday and Evening with `Fireball: not recorded` and `Fireball: 5`, every other covered date
reading *No registered result*), the **analytics workspace** (six views, two columns, each with period/variants/
count/method), and **related articles** (four groups, eight linked articles). The result detail was verified open at
390 px and by DOM assertion at 1440 px.

## M3. `ACCT-DEC-001` — amended

The record already said the Account is free (`FD-ACC-01`) and that Insider is an entitlement rather than the
identity (`FD-ACC-02`). But `FD-ACC-02` read *"Insider **will** eventually be a subscription…"*, which **did** imply
a paid tier is the planned destination. Corrected.

| Ruling | Status |
|---|---|
| `FD-ACC-01` | Already accurate — Account is free and distinct from `insider_user` |
| `FD-ACC-02` | **AMENDED** — conditional: *if* Insider ever exists it is an entitlement on an Account; it is not part of the present implementation or monetisation plan |
| `FD-ACC-05` | Accurate as recorded on Aug 5; **PARTLY SUPERSEDED on Aug 6** by `DATA-DEC-001` — Ask execution and provided CSV/export are now Account-gated. See N |
| **`FD-ACC-15`** | **NEW** — the Account is free and exists for continuity, personalisation and engagement |
| **`FD-ACC-16`** | **NEW** — no paid tier, paywall, premium plan, upgrade prompt, trial, payment-driving quota or Insider conversion strategy is approved |
| **`FD-ACC-17`** | **NEW** — monetisation is governed advertising and approved ticket-purchase referrals, supported by repeat engagement rather than by restricting information |
| **`FD-ACC-18`** | **NEW** — future notifications must be explicit opt-in, frequency-controlled and easy to disable |

`FD-ACC-17` also records the strategic consequence: because revenue depends on engagement rather than gating,
making public information *more* useful **is** the monetisation strategy — which is why `FD-ACC-05` and `FD-ACC-17`
are consistent rather than in tension. Cross-linked to the capability audit and both archive records.

## M4. Related articles — verified

| | |
|---|---|
| **Section ID** | **AR-09**, `render: true` |
| **Selection logic** | `editorialSections(config, { limit: 3 })` — filter by `kind`, sort by `effectiveDate` descending, take 3; `articleHref` builds `/{state}/{game}/{segment}/{slug}` from the item's own kind |
| **Metadata used** | State and game (the configuration file identity), `kind`, `slug`, `title`, `summary`, `effectiveDate`, `reviewedDate` |
| **Metadata NOT used** | **archive year** and **topic** — no editorial item carries either field. Year-filtering a 2026 archive would empty the News group, since the three real News items date to 2021, 2018 and 2016 |
| **Empty behaviour** | A group with no items renders its honest `emptyStatement` instead of an item list. Community has zero items and says so; `Winners` has no configuration kind at all, so a winner story cannot be fabricated |

**The eight real articles selected:** Guides — *Which Pick 3 play type should you choose?*, *Why a repeated digit
changes what your ticket pays*, *How FIREBALL works on a Pick 3 ticket*. News — *Rule change: FIREBALL replaced the
1-OFF play style* (2021-01-18), *Schedule change: evening draw time moved to 9:45 p.m. ET* (2018-08-05), *Name
change: Cash 3 was renamed Pick 3* (2016-08-01). Blogs — *How to read Pick 3 digit frequency without fooling
yourself*, *Midday and Evening are two different games*. All eight hrefs resolve 200 under the guard.

## M5. Validation

| Check | Result | Change |
|---|---|---|
| Archive tests | **174 pass, 0 fail** | 161 → 174 (**+13**) |
| Full suite | **881 pass, 0 fail** (180 suites) | 868 → 881 (**+13**) |
| Type-check / Lint / Build | exit 0 / exit 0, no new warnings / exit 0 | unchanged |
| Guard on/off | archive + article 200 on, 404 off; unregistered 404 both | unchanged |
| Preserved pages | Home + 6 State **byte-identical**; Game 18 sections | unchanged |
| Filter parity | calendar and agenda hold exactly the table's rows | unchanged |
| 390 px overflow | **zero** in table, calendar, detail-open, analytics-open | unchanged |
| 1440 px overflow | **zero**; 0 tables needing scroll | unchanged |

Three tests were updated rather than added: the three-state assertions became four-state, and one now asserts the
absence of `noDrawing` for a daily game.

## M6. Files changed in this pass

| File | Change |
|---|---|
| **NEW** `lib/archive/archiveSchedule.ts` | `parseDrawDays`, `combineSchedules`, `scheduleDrawsOn`, `assessCoverage` |
| `lib/archive/archiveCalendar.ts` | Four-state classification; schedule, coverage and explicit-no-draw inputs |
| `lib/archive/archiveContract.ts` | `schedule`, `scheduleCoverage` on the model |
| `lib/archive/archiveModel.ts` | Parse the members' schedules, assess coverage |
| `components/archive/ArchiveResultViews.tsx` | Render `No registered result`; one coverage note |
| `app/globals.css` | `.lca-calcell__unknown` — muted italic, no error tone |
| `tests/archive-page.test.ts` | +13 tests, 3 updated |
| `03-docs/08-decisions/account-identity-and-signed-in-capability-decisions.md` | `FD-ACC-02` amended; `FD-ACC-15`–`18` added |

## M7. Deferred as instructed

Custom date range · five-draw calendar scale · the Game Page's latent visually-hidden overflow · the disabled state
selector · Home's AI "coming soon" content · Account capabilities · forum, alerts, Compare Years.

---

# N. LRG-ARCHIVE-059 — Account-gating Ask and export

**Task:** LRG-ARCHIVE-059 · **Date:** August 6, 2026 · **Authority:** founder decision, recorded as
`DATA-DEC-001` (`03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md`) by task LRG-DEC-030.
**Nothing committed. Nothing pushed.**

## N1. What changed and why

The founder decision opens: *"This supersedes the earlier ruling that AI/Ask and public-result downloads operate
publicly."* Ask/AI execution and provided CSV/print/export now require a free Account (`FD-DAT-01`, `FD-DAT-02`).

Real authentication and persistence do not exist. `FD-DAT-03` and `FD-DAT-04` want the gated control to stay
visible, labelled `Sign in free to use`, opening the real shared sign-in flow — but `FD-DAT-17` (and `FD-ACC-14`)
forbid a non-functional button, a placeholder route and a fake login modal. With no flow to open, a visible
`Sign in free to use` control today would be precisely the dead control both rulings prohibit.

`FD-DAT-16` resolves it: **remove the executing surface now, record the target experience now, restore it when the
flow works end to end.** That is what this pass does. Absence is the honest state; a disabled button is not.

## N2. The exact temporary removals

| # | Surface | Where | Mechanism removed | Ruling |
|---|---|---|---|---|
| 1 | `Download year CSV` | AR-05, `ArchiveResultViews.tsx` | `buildArchiveCsv` → `Blob` → `createObjectURL` → `download` anchor | `FD-DAT-01` |
| 2 | `Download filtered CSV` | AR-05, `ArchiveResultViews.tsx` | same, over the filtered row set | `FD-DAT-01` |
| 3 | `Print this year` | AR-05, `ArchiveResultViews.tsx` | `window.print()` | `FD-DAT-09` |
| 4 | `Ask about 2026` | AR-03, `ArchiveView.tsx` | `<ArchiveWorkspace part="ask">` — question input, interpretation line, grounded answer, supporting rows, `INTERPRETER_DISCLOSURE` | `FD-DAT-02` |

Each removal site carries an inline comment naming the ruling, the reason and the restoration target, so the work
is findable from the code and not only from this record.

**Deliberately NOT removed.** Every one of these is a **KEEP** under `CLAUDE.md` §6:

| Kept | Why |
|---|---|
| `lib/archive/archiveDownload.ts` — `buildArchiveCsv`, `escapeCsvField`, `filterDescription` | A pure builder over rows. This is exactly what the future server export endpoint calls. Its RFC 4180 escaping and formula-injection guard are reviewed work that must exist either way. Still tested. `filterDescription` is still used for on-page headings |
| `lib/archive/archiveAsk.ts` — the interpreter, both aggregates, grounded answers | Same reasoning: the future gated endpoint's logic. Still tested, so it cannot rot while gated |
| `ArchiveWorkspace.tsx`'s `part === "ask"` branch | Retained unreached, as the literal restoration point `FD-DAT-16` describes |
| `askAnswer` / `askPrompts` on the view model | Computed but unrendered; the grounding tests are what stop an interpreter regression |
| The `@media print` stylesheet and print header | `FD-DAT-09` — Cmd/Ctrl+P is the reader's, not ours, and must keep producing a clean sheet |
| The whole analytics workspace, calendar, agenda, statistics, articles, tables | `FD-DAT-08` — unchanged and public |

**Not replaced by anything.** No sign-in button, no modal, no `/signin` route, no disabled control, no tooltip, no
`Coming soon`, no explanatory placeholder card (`FD-DAT-17`).

## N3. One question referred to the founder — **ANSWERED, see O**

The **AR-03 year brief** was left in place pending a founder answer, recorded as `DATA-DEC-001` open item 1: it is
deterministic arithmetic over public statistics, with no reader input, prompt, provider, model, tokens, latency or
cost — so none of the nine `FD-DAT-12` fields apply and there is nothing for `FD-DAT-18` to meter — but it carried
an AI label, and the decision gates "AI/Ask execution".

**Resolved the same day by `FD-DAT-20`:** it is not an AI execution, it stays public, it consumes no allowance and
writes no ledger entry, and the AI label was wrong rather than merely unnecessary. Implemented in **LRG-ARCHIVE-060**
— see section **O**.

## N4. Future Account-phase requirements this pass creates

Nothing here is implemented; this is what the authorised account and export work must satisfy.

**Restoration, per `FD-DAT-16` and the nine-point target experience recorded there:** the control returns in the
same position and prominence for signed-out readers; the label contains the word *free*; it opens the real shared
sign-in flow; a server-side, allowlisted, expiring, single-use intent carries state, game, archive year, active
filters and the requested action; on return the reader lands on the same archive with the action **prepared and
awaiting confirmation**, never auto-run (`FD-ACC-13`).

**Server work:**

| Requirement | Ruling |
|---|---|
| Export runs as an authenticated server action; no client file generation | `FD-DAT-01`, `FD-DAT-11` |
| Ask runs as an authenticated server action | `FD-DAT-02`, `FD-DAT-11` |
| Reject any request spanning more than two calendar years, before doing work | `FD-DAT-07` |
| Meter three distinct `(state, game, year)` datasets per Account per **rolling** 24 hours | `FD-DAT-10` |
| Account the allowance against the **underlying dataset**, so filters, date-range splitting and repeats cannot reconstruct a larger export | `FD-DAT-13` |
| No unrestricted public CSV or API endpoint — including no "convenience" JSON route for the client island | `FD-DAT-14` |
| Log every export **attempt**, success or rejection, with eleven fields; field 11 is a derived, privacy-safe abuse signal, never a raw IP (`CLAUDE.md` §13) | `FD-DAT-15` |
| Record AI usage per Account with nine fields, including provider, tokens, estimated cost and latency | `FD-DAT-12` |
| Hold both limit sets in server configuration, readable at request time; a component may display an allowance but never be one | `FD-DAT-18` |
| Retain no complete prompts for analytics — operation, safety and support only, each with its own period and access control | `FD-DAT-19` |
| No plan, offer, upgrade, trial or payment anywhere in the gate, including in a limit-rejection message | `FD-DAT-06` |

**Dependencies:** the `Account` entity, sessions and the real shared sign-in flow (`FD-ACC-01`, `FD-ACC-06`); the
intent store and return allowlist (`FD-ACC-12`); and a usage/export logging store with agreed retention periods.
All are `DATA-DEC-001` open items 2–5.

## N5. Records changed

| Document | Change |
|---|---|
| **NEW** `03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md` | `DATA-DEC-001`, rulings `FD-DAT-01`…`FD-DAT-19`, recorded by LRG-DEC-030. Covers the gated boundary, download control, AI usage accounting, the current boundary and the restoration spec |
| `03-docs/08-decisions/account-identity-and-signed-in-capability-decisions.md` | `FD-ACC-05` marked **partly superseded**, split into what stands and what does not, with the reasoning. `FD-ACC-17`'s monetisation note reconciled. Companion list, deliberately-not-decided list and open items updated |
| `03-docs/04-page-specifications/archive/yearly-history-page-expansion-capability-audit-and-brief.md` | Superseding banner; §4's two placements struck through in place; conflict 4 marked resolved in favour of blueprint §17's middle tier; **R2** marked partly reversed and **R3** marked declined. Findings left intact |
| This record | §9 banner; L1 rows 4 and 6; L4 rows; M3's `FD-ACC-05` row; this section |

## N6. Tests changed

| Test | Change |
|---|---|
| `downloads stay public and add no endpoint` → `no download executes publicly` | Inverted. Now asserts no `Blob`, no `createObjectURL`, no `buildArchiveCsv` call, no `lca-downloads` markup — **and** no `Sign in free`/`Coming soon` replacement (`FD-DAT-17`) |
| `no PDF generation exists` → `no LotteryCorner-provided print or export action executes publicly` | Now asserts no `window.print()`, while asserting the `@media print` stylesheet and `.lca-printhead` rule survive — the `FD-DAT-09` distinction, tested |

The Ask tests were **not** weakened: they cover `archiveAsk.ts` directly, which is retained, so the interpreter
stays under test while its surface is absent.

---

# O. LRG-ARCHIVE-060 — the year brief is not an AI execution

**Task:** LRG-ARCHIVE-060 · **Date:** August 6, 2026 · **Authority:** founder ruling of 2026-08-06, recorded as
`DATA-DEC-001` `FD-DAT-20`, resolving that record's open item 1. **Nothing committed. Nothing pushed.**

## O1. The ruling

AR-03 stays publicly visible. The brief is a deterministic summary derived from public archive statistics — **not**
an AI execution — so it needs no sign-in, consumes no AI allowance and writes no `FD-DAT-12` ledger entry. The label
drops the word AI, and deterministic generation must not be described as AI anywhere in this surface.

The reasoning worth keeping: the Constitution's AI-labelling duty exists so a reader can tell when a **model**
produced something. Where no model is involved, an AI label is not compliance — it is an inaccurate description. The
prohibition therefore runs in **both directions**: claiming AI misdescribes a calculation, and *disclaiming* AI
raises the idea in a surface where it never arose.

## O2. What changed

| # | Change | Where |
|---|---|---|
| 1 | `LotteryCorner AI Year-to-Date Brief` → **`LotteryCorner Year-to-Date Brief`** | `lib/archive/archiveModel.ts` |
| 2 | The V0 provenance line's second sentence — *"No live AI model generated or verified these observations"* — **removed**. It now reads: *"Calculated from the drawings listed on this page. Every figure is counted from the results in this archive."* | `lib/archive/archiveModel.ts` |
| 3 | CSS class `.lca-ailabel` → **`.lca-brieflabel`** | `ArchiveView.tsx`, `app/globals.css` |
| 4 | The AR-03 comment rewritten to state why the label went and on what condition it returns | `ArchiveView.tsx` |
| 5 | Contract doc comments on `ArchiveBrief.label` and `.generation` corrected | `lib/archive/archiveContract.ts` |

The closed-year label, `LotteryCorner Historical Brief`, never contained the word AI and is unchanged. The brief's
content, its three-to-five observations, its figures and its evidence links are all untouched — this pass changed
what the surface is *called*, not what it *says*.

**`INTERPRETER_DISCLOSURE` is deliberately unchanged.** It belongs to the Ask interpreter, which really would answer
a reader's question, and which `FD-DAT-02` has gated and section **N** removed from the page. Its statement that no
live model is involved remains correct and necessary *there*.

## O3. The condition on which this reverses

If AR-03 later uses an **AI provider, a user prompt, personalized generation or model inference**, it moves behind
the free Account, executes through the server, and follows `FD-DAT-12` (usage recording), `FD-DAT-18`
(server-configurable limits) and `FD-DAT-19` (no full-prompt retention). The ruling attaches to what the surface
does, never to what it is called — which is exactly why renaming it is not a way around the gate.

## O4. Tests

| Test | Change |
|---|---|
| `nothing claims a live model produced the answer` | **Inverted for the brief.** Now asserts the label and provenance line contain no `AI` in either direction, and that the positive provenance statement survives. The `INTERPRETER_DISCLOSURE` assertion is retained unchanged |
| `the AI brief carries three to five observations…` | Renamed `the year brief carries…`; assertions unchanged |
| **NEW** `AR-03 is composed and public` | `FD-DAT-20` point 1 — in `AR_ORDER`, renders anonymously, still carries its observations |
| **NEW** `no part of the surface describes itself as AI` | `FD-DAT-20` point 5 — sweeps heading, label, evidence line, provenance line and every point's text and evidence; also asserts the class rename |
| **NEW** `the label reads as a LotteryCorner brief, not a model output` | Exact-match on `LotteryCorner Year-to-Date Brief` |
| **NEW** `every figure in the brief is counted, not generated` | Two builds produce an identical brief, and a figure is re-derived directly off the rows — the evidence for point 3 |
| **NEW** `no AI allowance or usage ledger is touched by the brief` | `FD-DAT-20` point 4 — no provider call, no inference, no allowance/quota/token/cost accounting in the model |

## O5. Records changed

| Document | Change |
|---|---|
| `03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md` | **`FD-DAT-20` added**, with the reasoning and the reversal condition; ruling family extended to `FD-DAT-20`; amendment noted in the header; `FD-DAT-02`'s forward reference updated; **open item 1 struck and marked resolved** |
| This record | N3 marked answered and pointed here; this section |
