# Florida Pick 3 Yearly History Archive V0 — Founder Review

**Task:** LRG-ARCHIVE-054 · **Review route:** `/fl/pick-3/2026` · **Status:** ready for founder review ·
**Not committed, not pushed.**

Run it:

```bash
cd 01-new-ui && LC_GAME_PREVIEW=true npm run dev
```

Then open `http://localhost:3000/fl/pick-3/2026`. With the flag absent the URL 404s, exactly as it does today.

---

## 1. What to look at first

The page is deliberately **results-first**. In the first viewport you should see the game, the year, the status
line and the source — then metrics, then the year brief, then the complete table. No landing-page hero.

Five things worth checking in order:

1. **AR-01** — is `Florida Pick 3 Results 2026 — Year to Date` the identity you want, with
   `52 drawings from Sun 01/04/2026 through Thu 07/09/2026 · Midday and Evening · Includes a corrected drawing`
   as the status line?
2. **AR-02** — the two notices sit **above** the six metrics, because the blueprint puts a partial-data warning and
   a correction notice ahead of the figures they qualify. Is that the priority you want?
3. **AR-05** — Midday then Evening on each date, never merged. `not recorded` where Fireball is absent. One row
   marked `corrected`.
4. **AR-06** — type `378`, press *Search this year*. You should get
   *"1 of 52 drawings match 378 in exact order."* Switch to **Any order** and the count changes.
5. **AR-03** — the brief is labelled `LotteryCorner AI Year-to-Date Brief` **and** says plainly that no live AI
   model produced it. Please confirm that pairing is what you want (see §4).

---

## 2. The decision you asked for, applied — and the conflict it creates

You directed **one family route** with Midday and Evening as independent rows. That is what is built.

The blueprint and production both do it the other way, and the numbers matter:

| Route | Indexed years in the production sitemap |
|---|---:|
| `/fl/pick-3-evening/{year}` | **36** (1988–2023) |
| `/fl/pick-3-midday/{year}` | **16** (2008–2023) |
| `/fl/pick-3/{year}` | **0 — does not exist** |

So your direction eventually consolidates **52 indexed URLs into about 26**. That is a migration with SEO
consequences, not a rendering choice, and `CLAUDE.md` §10 requires a route, canonical, traffic, backlink and
edge-redirect audit before any of it moves.

**Nothing has moved.** No redirect, no canonical, no sitemap entry, `noindex` on the page. Game ids 332 and 333
stay separate and every draw record keeps its own identity — only page identity, navigation and presentation are
combined, exactly as you specified.

**Decision 1:** keep it guarded pending the audit, or authorise the audit now?

---

## 3. What is real on this page and what is not

This matters more than anything else on the page, so it is stated plainly.

| | Count | Status |
|---|---:|---|
| Rows from the captured production feed | **2** | Real. The newest Midday and Evening drawings |
| Internal review samples | **50** | Synthetic values, filling earlier 2026 dates |
| Synthetic winners, prizes, payouts, jackpots, retailers, articles, discussions | **0** | None exist anywhere |

The real rows are at the **top** of the table, where a reader actually looks. Every synthetic row is tagged
`synthetic/internal-review` in the data itself, one banner identifies the whole page as an internal preview, and
the coverage state reads `Partial, and includes a corrected drawing` rather than claiming completeness.

**The correction notice and the corrected row are fixture demonstrations**, there so you can review Template F.
The notice's source line says `Internal review sample — not a real correction`.

Two guardrails you may want to probe:

- With `LC_GAME_PREVIEW` unset, the 404 page contains **zero** occurrences of "Internal preview", "internal review
  sample", "Year to Date" or any section marker.
- `/fl/pick-3/2019` 404s. It used to return a complete fabricated 96-row 2019 archive — caught and fixed. A year
  only exists when the feed carries a real record in it.

---

## 4. Ask the Archive — please read this one

You asked for a transparent Ask flow. Real AI-provider integration is out of scope for this task, which left
three options:

1. Stub a model and present its output as generated — **dishonest**.
2. Hand-write an answer and let the AI label imply a model produced it — **dishonest**.
3. Write a genuine deterministic interpreter and say so — **what is built**.

It really does parse your question: month, drawing, number, exact/any order, and pattern words. When it
understands nothing it **says so** and suggests what it can read, instead of inventing an interpretation and
returning a confident row list.

Two disclosures render on the page. The Ask block says the interpretation is deterministic rather than a live
model, and the AR-03 brief says no live model generated or verified its observations — while both still carry the
AI label, because the Constitution requires AI framing to be identified rather than hidden.

**The architectural requirement holds either way: every count, row and explanation is computed by deterministic
code.** A test asserts the Ask answer's count equals the same filter's count. Swapping in a real provider later
changes only how a question becomes a filter — it cannot change a number.

**Decision 4:** is the deterministic interpreter acceptable for design review, and is a real provider in scope
next?

---

## 5. What is deliberately absent, and why

Each of these is a judgement you may want to overturn — none is an oversight.

| Absent | Reason |
|---|---|
| **Save, Follow, alerts, saved searches** | `member-auth` does not exist. A Save button would route nowhere and persist nothing. No tool is labelled "Sign in to save" |
| **Export / download / CSV** | Data-redistribution rights are unapproved. AR-10 says so in words |
| **`Discuss` row action, community threads** | No community service exists. Fabricating a discussion is forbidden, so the group shows an honest empty state |
| **Buy Now** | Not required for this V0, and the blueprint forbids commerce after a historical comparison |
| **All four archive ads** | The `lc_gh_*` family is now documented (12 slots, sizes, div ids) but unapproved for this surface. The anchors hold their governed positions and render nothing |
| **All structured data** | Most rows are samples; schema would describe synthetic content as fact. `Dataset` stays prohibited until a governed dataset exists |
| **Previous-year link, Compare Years, Archive Explorer, Rule-Era Comparison** | Only one year is connected. Labelled `Planned`, never drawn as a working control |
| **Any prize, payout or jackpot figure on a row** | No historical prize data exists, so no financial claim and no backtest appears |

---

## 6. Proof that the engine is generic, not Pick 3 with a coat of paint

The same model was driven with four different format shapes. **None of them has a public archive route** — you
asked for one archive page, and that is all that resolves.

| Shape | Game | What changed on its own |
|---|---|---|
| Ordered digits, 2 variants | Pick 3 | Positional frequency, pairs, doubles/triples, exact/any-order control |
| **Single value, 5 variants** | Cash Pop | **Zero** occurrences of "digit" or "position". No shape, sum, pair or repeat metric. All five drawings kept, in your configured order |
| Unordered pool, 1 member | Florida Lotto | No positional analysis, no double/triple metric, no variant comparison |
| Unordered pool + special ball | CA SuperLotto Plus | Mega Ball compared separately — five correct main numbers with the **wrong** Mega Ball does not match |

A test greps every archive module for a state code, a game name, "Fireball", "Midday" or "Evening" and fails if
one appears. The only file allowed to name a game is the route registry, because that is its job.

One judgement worth surfacing: **"unique exact results" is shown for Pick 3 and suppressed for Florida Lotto.**
Pick 3 has 1,000 possible results and genuinely repeats; Lotto has 22,957,480, where "26 of 26 unique" is
arithmetic dressed as an observation — and printing it would imply a repeat was a live possibility.

---

## 7. Verification summary

| Check | Result |
|---|---|
| Type-check | exit 0 |
| Lint | exit 0, **no new warnings** (3 pre-existing) |
| Tests | **790 pass, 0 fail** — 83 new archive tests |
| Production build | exit 0 |
| Guard off | every guarded route 404s, no fixture text in the 404 body |
| Home + 6 State pages | **byte-identical** with the guard on and off |
| Game Page | unchanged, 18 sections, no archive link added |
| 390 px | zero page overflow, every wide table scrolls in its own labelled container |
| 1440 px | zero page overflow, 1380 px canvas, no table needs scrolling |

Two layout defects were found in the responsive review and fixed: the workspace pushed the page to a 503 px scroll
width at 390 px, and the 900 px container left the results table scrolling at 1440 px. Both are described in the
implementation record.

**One file was renamed in existing work.** `app/[state]/[game]/[section]/` became `[segment]/`, because Next.js
refuses two different dynamic slug names at the same depth — and it refuses them at request time, so a build
passes and every request fails. No URL changed; the article routes still resolve.

---

## 8. Decisions required before the next task

1. **The route conflict** — keep guarded, or start the URL audit that consolidates 52 indexed yearly URLs?
2. **Ad activation** — approve `lc_gh_*` for the archive surface, or keep the anchors inert?
3. **Export rights** — is a governed dataset release in scope? It would also unlock `Dataset` markup.
4. **Ask the Archive** — deterministic interpreter acceptable for review; real provider next?
5. **Row volume** — a real Pick 3 year is ~730 rows, not 52. One crawlable page, or month partitioning with
   crawlable links?

---

## 9. Recommended next task

**Connect one real archive year end to end for Florida Pick 3** — the 2023 per-variant history that production
already publishes — so the archive renders a genuine ~730-row year instead of a 52-row fixture. That is the single
change that turns every remaining limitation into a measurable question: row volume and crawlable partitioning,
`YR-CLOSED` mode, real previous/next year navigation, Compare Years, rule-era boundaries inside a year, and
whether the metrics still read well at real scale.

Not started. No other work has begun.

---

# FOUNDER-CORRECTION PASS — LRG-ARCHIVE-055 (2026-08-05)

You reviewed the V0 and said it read as an internal validation report, not a public lottery archive. That was
right, and it was measurable. This pass fixes the presentation. **No 2023 data, no new registered year, nothing
activated.** Not committed.

```bash
cd 01-new-ui && LC_GAME_PREVIEW=true npm run dev
```

`http://localhost:3000/fl/pick-3/2026`

---

## 1. What changed, in one table

| | Before | After |
|---|---:|---:|
| Screens to reach search on a phone | **10.2** | **1.3** |
| Screens to reach the first result | 4.4 | **2.3** |
| Total page length on a phone | 23.6 screens | **17.2** |
| The word "verified" in visible text | **53** | **0** |
| `Check / Analyze / Details` links | **156** | **0** |
| Statistics tables shown at once | **9** | **4** |
| Cards saying "Planned" | **4** | **0** |
| Correction notice, metric and badge | shown, from sample data | **gone** |
| Ad-anchor review block | shown | **gone** |

---

## 2. The top of the page now

1. One preview line — kept, because most results are still samples.
2. Breadcrumb and title.
3. **Total drawings 52 · Midday 26 · Evening 26 · Dates covered Sun 01/04/2026 – Thu 07/09/2026.**
4. `Updated Thu 07/09/2026 · Florida Lottery results feed`.
5. **`‹ Older | 2026 ▾ | Newer ›`** with "2026 is the only year available in this archive so far."
6. Month navigation.
7. Search and filters.
8. **"Showing all 52 drawings in this archive year."**
9. The results.

Everything longer — the year brief, the fuller summary, statistics, news, sources, continue — is below the results.

---

## 3. The correction story is gone, and cannot come back by accident

You were right that it should not have been there: it was a sample row presented as a genuine historical
correction to a real Florida drawing.

A correction now needs **four facts** before anything renders: previous value, corrected value, **a source**, and a
date. The fixture record still exists — the capability is worth keeping — but its source is `null`, so it is
structurally unpublishable. The gate does the work; there is no caption asking to be believed.

Five separate places were keyed on the raw flag and all five now ask the gate: the notice, the row badge, the month
⚑ marker and its legend, the "notable drawing" narrative, and the year's completeness state. The "Include corrected
results" filter is hidden too — a filter for something the archive does not contain teaches the wrong thing.

When a real sourced correction arrives, all five light up together.

---

## 4. Year navigation with only 2026 registered

`‹ Older` and `Newer ›` render as **dashed, unavailable controls** — not links, not buttons that look clickable —
and the selector holds one option. Below it: *"2026 is the only year available in this archive so far."*

Three behaviours worth knowing, all built and tested now rather than when 2023 lands:

- **"Previous" means the nearest *registered* year, never `year − 1`.** With 2019, 2021 and 2026 registered, Older
  from 2021 is **2019** and Newer is **2026**. No link to 2020 or 2022 is ever generated.
- **Your search survives a year change.** A number, match mode, draw time, pattern and sum band all carry over.
- **The month resets only when it does not exist in the destination year.** March → March; if the destination has
  no March, the month clears and the search itself survives.

Filters travel in the URL **fragment**, not a query string, so no filter combination becomes a crawlable page.

---

## 5. Rows, statistics and the roadmap

**Rows** keep Date, Drawing, Winning digits, Pattern and Sum. Fireball is `Fireball: 9` in smaller type under the
digits — worth noting that the first attempt at this still drew it as a full-size ball *and* the label, so it read
as a fourth winning digit; it is now excluded from the ball rendering entirely.

**Statistics** open with the four you named: number frequency by position, repeated digits, sum distribution,
Midday versus Evening. The three separate position tables became one combined table — digits down, positions
across — because without that "four insights" still rendered as six tables. Pairs and previous-draw repeats sit
behind "More statistics (3)". The responsible-play statement is unchanged and still above every figure.

**The roadmap is gone from the page** and lives in the documentation. Nothing says "Planned", and no Continue
action explains why it does not work.

---

## 6. What I kept that you might have expected to go

- **The preview line.** Removing it would let 50 sample rows read as real results.
- **Sources and methodology (AR-10)** — you asked for it explicitly, and it is the page's trust surface.
- **"Corrections: No published correction affects this year"** in the coverage list, and the corrections-policy
  link. That is trust information, not the correction *presentation* you asked me to remove.
- **`row.status` and `row.provenance` on the data.** They render nowhere and are asserted by tests to still exist,
  so backend governance keeps what it needs.

---

## 7. Real-scale strategy — the decision this unblocks

`florida-pick-3-yearly-archive-real-scale-strategy.md`. The short version:

A real Pick 3 year is **~730 rows ≈ 2.1 MB of HTML ≈ 220 phone screens**. That fails regardless of structure — and
a five-draw game like Cash Pop would be **1,825 rows ≈ 5 MB**, which is the real test.

**Recommendation: the month is the page, the year is the hub.** `/fl/pick-3/2023` keeps the summary, month index,
statistics, search and the **60 most recent rows**; `/fl/pick-3/2023/03` holds every March drawing (~62 rows, about
the size this page is now). Not numbered pagination — a month is a unit you already think in, its URL never rots,
and twelve month links are twelve crawlable URLs in one hop.

The one thing to be careful about: **statistics must stay year-wide even on a month page**, or "number frequency"
silently means March while sitting under a year heading.

**This needs your approval before the 2023 connection**, because it adds a route level. It also argues for running
the URL audit *first*: the redirect map depends on the partitioning choice, and month partitioning changes the
target URL count.

---

## 8. Validation

| Check | Result |
|---|---|
| Archive tests | **119 pass, 0 fail** (36 added) |
| Full suite | **827 pass, 0 fail** |
| Type-check / Lint / Build | exit 0 / exit 0, no new warnings / exit 0 |
| Guard off | every guarded route 404s; **0** occurrences of "preview", "sample", "Year to Date", "Midday" or any section marker in the 404 body |
| Route regression | archive 200, both article routes 200, `/fl/pick-3/2025` and all four unregistered pairs 404 |
| Home + 6 State pages | **byte-identical** with the guard on and off |
| Game Page | 18 sections, unchanged, no archive link added |
| 390 px / 1440 px | zero page overflow at both; every wide table in its own scroll container; touch targets ≥ 44 px |
| Roadmap / ad review | 0 "Planned" cards, 0 ad-review blocks |

Screenshots: `{scratchpad}/archive-shots-lrg-archive-055/` — `full-390.png`, `full-1440.png`,
`crop-top-and-yearnav-390.png`, `crop-top-search-rows-1440.png`.

**Nothing committed. Nothing pushed.**

---

## 9. Decisions needed before the 2023 connection

1. **Approve the month-partitioning strategy** (§7) — it adds a route level, so it needs your sign-off.
2. **Run the URL audit before connecting 2023?** I recommend yes: the redirect map depends on the partitioning
   decision, and production has 52 indexed per-variant yearly URLs to reconcile.
3. **Confirm the 60-row year-hub default** — how much is useful versus fast.
4. **Does the fuller metric set below the results still earn its place**, now that four facts sit above them?
5. **Ad activation** — the `lc_gh_*` family stays documented and inert until you say otherwise.

## 10. Recommended next task

**Run the route and canonical URL audit for the Florida Pick 3 yearly archive**, before any 2023 data is
connected. It is the one piece of work every other decision now waits on: the 52 indexed per-variant URLs, the
family-route consolidation you directed, and the month partitioning proposed in §7 all have to be reconciled in a
single redirect and canonical plan. Connecting data first would mean building the partitioning twice.

Not started.
