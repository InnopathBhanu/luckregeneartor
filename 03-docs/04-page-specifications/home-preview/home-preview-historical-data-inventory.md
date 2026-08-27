# Home Preview — Historical Draw Data Inventory

**Document type:** Page specification — data inventory
**Recorded by:** Task LRG-UI-012 (§18, mandatory before implementing draw analysis)
**Date:** July 26, 2026
**Status:** **FINDING — blocks full historical analysis**
**Scope:** the historical draw data available in this repository for AI Draw Analysis on the guarded Home preview

---

## 1. Headline finding

> **There is exactly ONE historical draw per game in this repository.**
>
> No archive of past draws exists anywhere in `04-sample-data`, the production DB export, the
> production page capture, or the legacy application. The founder's example analysis output — "1
> number also appeared in the previous draw", "This odd/even split appeared in 9 of the last 50
> draws" — **cannot be computed from the data that exists.**
>
> Per §4 and §18 the analysis engine is implemented in full, computes every metric the data supports,
> and reports the rest as a truthful insufficient-data state. Nothing is manufactured, no dataset is
> fabricated, and nothing was fetched from the web.

---

## 2. Sources searched

| Source | Contents | Historical draws? |
|---|---|---|
| `04-sample-data/source-xml/latest-results-lc.xml` (188 KB) | 448 `<game>` blocks across 15 states | **No — one draw per game.** Each block carries exactly one `<result-date>` and one `<numbers-str>` |
| `04-sample-data/home-page-sample.json` | Home fixture | **No.** `featureGames` = 3 cards, one draw each; `latestResults` = 2 cards, one draw each |
| `04-sample-data/state-*-sample.json` (15 files) | State fixtures | **No.** They carry `historyLinks` — URLs to archive pages, not draw data |
| `04-sample-data/reference-tables/game.csv` (377 rows) | Game **definitions**: `PLAY_TYPE`, `NUM_OF_BALLS`, `TOP_PRIZE_ODDS`, `PRIZE_MATRIX`, `TICKET_PRICE` | **No draws** — but see §4, this is the authority for valid number ranges |
| `04-sample-data/reference-tables/schema-only.sql` | Production MySQL schema | **No data.** 0 `INSERT` statements. A `game_result` table exists (`info`, `payout_xml`, `game`) but no rows were exported |
| `04-sample-data/fl-view-source.html` (366 KB) | Production Florida page capture | **No.** 5 distinct dates, **0** five-number runs — the page shows current results only |
| `04-sample-data/result-format-definitions.json` | 13 format definitions | **No draws** — but carries date-effective ball ranges (§4) |
| `00-reference-existing-project/**` | Legacy Struts/JSP app | **No result data export.** Read-only; not modified |

**Not used:** the web. §18 forbids scraping and nothing was fetched.

---

## 3. Draw count per game

| Game | Game ID | Slug | Draws available | Draw date | Main numbers | Special ball |
|---|---|---|---|---|---|---|
| Powerball | 1012 | `powerball` | **1** | 2026-07-08 | 12·29·37·43·55 | Powerball 18 |
| Mega Millions | 1013 | `mega-millions` | **1** | 2026-07-07 | 2·31·35·36·63 | Mega Ball 12 |
| Lotto America | 1018 | `lotto-america` | **1** | 2026-07-08 | 17·26·31·32·37 | Star Ball 1 |

**Powerball secondary draw.** One state's feed entry carries a Double Play result
(6·27·33·44·69, Powerball 23). It is **deliberately excluded** from the Powerball sample. Double Play
is a separate game product drawn independently; counting it as a second Powerball draw would
misrepresent frequency and repeat metrics, even though it happens to share the 5/69 + 1/26 matrix.

**Multi-state duplication.** Powerball appears in 49 `<game>` blocks and Mega Millions in 48, because
the feed repeats each multi-state game once per state. Deduplicating by `(date, numbers)` collapses
these to **one** draw each. A naive block count would have looked like ~49 draws and produced
completely false frequency output — this is the single most dangerous trap in the dataset.

---

## 4. Valid number ranges — available and date-effective

Two production-derived sources agree, which is what makes high/low splits safe to compute:

| Game | `result-format-definitions.json` | `game.csv` `PLAY_TYPE` | Effective from |
|---|---|---|---|
| Powerball | main 5 × 1–69, special 1 × 1–26 | `5/69+1/26` | **2015-10-07** |
| Mega Millions | main 5 × 1–70, special 1 × 1–24 | `5/70+1/24` | recorded per definition |
| Lotto America | main 5 × 1–52, special 1 × 1–10 | `5/52+1/10` | recorded per definition |

`result-format-definitions.json` also carries `historicalFormats` with an explicit warning on
Powerball: *older draws used different main/special ranges; model as prior effective-date ranges when
historical data is loaded* (`effectiveTo: 2015-10-06`).

**Consequence for §18:** the rule-version boundary is known and enforced. Any draw dated before a
game's `effectiveFrom` must be excluded from that game's sample rather than silently mixed in, and
the analysis engine does exclude it. With one draw per game, no exclusion is triggered today — but
the guard is in place before the archive arrives, not after.

---

## 5. Rule-version boundaries and compatibility

| Concern | Status |
|---|---|
| Current rules differ from historical records? | **Yes, for Powerball** — pre-2015-10-07 draws used different ranges. Recorded, and excluded by effective date |
| Cross-game aggregation | **Prohibited without normalisation.** Powerball 5/69, Mega Millions 5/70 and Lotto America 5/52 have different ranges, so raw sums are not comparable. Comparison normalises each sum against that game's own theoretical range |
| Malformed or missing draws | **None in the current sample.** All three draws parse cleanly with the expected group counts |
| Special-ball availability | **Present for all three games** — Powerball 18, Mega Ball 12, Star Ball 1 |
| Timezone / game-local date | `resultDate.gameLocalDate` is present and is the field used. No date shifting |

---

## 6. What can and cannot be computed today

With **n = 1** draw per game:

### Computable now — intra-draw composition

| Metric | Basis |
|---|---|
| Odd/even split | The drawn main numbers |
| High/low split | Drawn numbers against the game's **valid range** from the format definition |
| Consecutive numbers present | Sorted drawn numbers |
| Total sum | Drawn main numbers (reported as a value, **not** compared to a historical range) |
| Span (lowest → highest) | Sorted drawn numbers |
| Sum position within the theoretical possible range | Minimum and maximum achievable sum for the game's range — a mathematical property, not a historical claim |

### Not computable — requires ≥ 2, or a sample of N, draws

| Metric | Draws needed |
|---|---|
| Numbers repeated from the previous draw | ≥ 2 |
| Current numbers seen within the last 5 draws | ≥ 2 |
| Special-ball last-seen | ≥ 2 |
| Most / least frequent numbers in the sample | ≥ 10 to be meaningful |
| Numbers absent in a recent window | ≥ 10 |
| Frequently occurring pairs and triplets | ≥ 20 |
| "This odd/even split appeared in N of the last M draws" | ≥ 20 |
| Similar structural-pattern frequency | ≥ 20 |
| Exact prior full-result match | ≥ 2 |
| Repeat rate for game comparison | ≥ 2 |

Every one of these is **implemented** in `01-new-ui/lib/preview/drawAnalysis.ts` and gated on sample
size. When an archive is supplied they compute with no code change; until then each is reported as
requiring more draws.

---

## 7. Analysis-window behaviour (§5)

Windows supported: **20 · 50 · 100 · full archive.**

Default: **50** when at least 50 valid draws exist for the game; otherwise the **full available
history**, with the sample size displayed. Today every game falls into the second branch and the
basis line reads:

> `Based on the 1 available draw`

The basis line is never omitted and never rounded up. It states the number of draws actually used
after deduplication and effective-date filtering — not the number of records read.

---

## 8. Production data work required later

Recorded rather than worked around. None of this is in scope for a guarded UI task.

1. **A historical result archive.** The largest indexed surface is the yearly archive
   (`/{state}/{game}/{year}`, ~8 700 URLs), so the underlying data exists in production — it is simply
   not exported into this repository. An export or API endpoint is needed.
2. **Minimum viable sample.** 100 draws per flagship game covers all four windows. 50 covers the
   default. Below ~20 the pattern metrics are not worth showing.
3. **Effective-date metadata per draw,** so pre-rule-change draws are excluded by data rather than by
   inference.
4. **Deduplication at the source.** The feed's per-state repetition must be collapsed before any
   analysis consumes it, or frequency output will be badly wrong. See §3.
5. **Double Play and secondary draws** need their own game identity in the archive, not to be folded
   into the parent game.
6. **Freshness.** The current fixture is 17 days old and already renders a visible stale badge.
   Analysis output must inherit that freshness signal — an analysis over stale draws must say so.

---

## 9. Verdict

| Question | Answer |
|---|---|
| Is there enough history for the analysis the founder described? | **No** |
| Was a dataset manufactured to compensate? | **No** |
| Was anything fetched from the web? | **No** |
| Is the analysis UI implemented? | **Yes** — with every metric coded and gated on sample size |
| Is the insufficient-data state truthful and specific? | **Yes** — it names the sample size and what each unavailable metric needs |
| Does the implementation respect date-effective game rules? | **Yes** — before the archive exists, not after |
