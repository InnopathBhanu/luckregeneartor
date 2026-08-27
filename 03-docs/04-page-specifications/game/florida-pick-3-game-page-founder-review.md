# Florida Pick 3 State-Native Game Page — Founder Review

**Route:** `/fl/pick-3` · **Guard:** `LC_GAME_PREVIEW=true` · **Blueprint:** BP-04B `JG-M2` (full state-native
game) · Generalization proofs: `/fl/jackpot-triple-play` (1 row), `/fl/cash-pop` (5 rows), `/fl/powerball`
(unchanged `JG-M1`)

> ## Post-commit accuracy review — LRG-GAME-054, 2026-08-07
>
> **CORRECTED:** this line read **"Not committed."** The Game Page code was committed in **`f8e3061`**; this review
> and its implementation companion were left untracked and are committed by the documentation-only checkpoint that
> carries this note.
>
> Three further corrections are marked inline below:
>
> 1. **§"The one thing worth your attention first"** claimed *"1-OFF appears nowhere on the page."* It appears
>    **four times**, in the news article about its retirement that a later task added. Never as a sellable play type.
> 2. **Decision 7** still describes the device-local save that LRG-GAME-051 removed entirely. Now marked
>    `[SUPERSEDED]` like the others.
> 3. **This document stops at LRG-GAME-051.** It does not review **LRG-GAME-052** (the generic format-driven
>    engine and ten representative pages) or **LRG-GAME-053** (eight generic-engine corrections). Both are recorded
>    in the implementation companion and neither has had a founder-review pass. Flagged rather than back-filled —
>    writing a review of work you have not seen would defeat the purpose of the document.
>
> **Since this review was written:** `/fl/pick-3/2026` now exists as a guarded Yearly History Page
> (LRG-ARCHIVE-054…060, `2020760`), which is the family-archive recommendation in decision 4 partly built and still
> guarded. `ACCT-DEC-001` and `DATA-DEC-001` now govern the account boundary that decision 7 described as absent.

> **Read the REVISION REVIEW at the end of this document alongside this one.** LRG-GAME-051 changed the editorial
> hierarchy, the number search, the page length, the membership behaviour, the logo and the canvas width. Points
> superseded by it are marked **[SUPERSEDED]** inline below.

---

## What this page is

`JG-M2` means no global hub exists and none is planned, so **this page is the canonical owner of the whole
game** — result, rules, prize structure, odds, history, statistics, generator, systems, claim. That is why it is
long and `/fl/powerball` is short: Powerball's drawing is national and governed elsewhere, Pick 3's is not.

All eighteen approved sections are present in server HTML, grouped into your nine bands so the page reads as
nine steps rather than eighteen peers.

---

## The one thing worth your attention first

**The production database was wrong about Pick 3, in three ways that mattered.** Founder decisions 5 and 6 sent
me to the operator's own rules, and what came back changed the page:

1. **Ticket price.** The export says `$1`. The rule says **50 cents or $1.00**. The export omits half the
   product — and every prize in the matrix is exactly half at 50¢. A page built on the export would have
   overstated what a 50-cent player wins by 100%.

2. **Advance Play.** The export says "14 consecutive draws". The rule says a **fourteen-DAY period** — which,
   with both draw times selected, is up to 28 drawings.

3. **The payout matrix contained a play type Florida no longer sells.** The export's matrix has **1-OFF** rows
   and **no FIREBALL** rows. The fact sheet dates it: *"January 18, 2021 The FIREBALL add-on feature … was
   introduced, and the 1-OFF play style ended."*

So the export is not "roughly current" — it is a **closed pre-2021 era**. It is kept in the code so a 2019
ticket still checks against 2019 rules, and it is structurally unpublishable: the publication check reads the
era's verification status, so no future edit can promote it by accident.

**[CORRECTED 2026-08-07]** This paragraph ended *"**1-OFF appears nowhere on the page.**"* That was true when
written and is not true now. `1-OFF` appears **four times** on `/fl/pick-3` — all of them inside the news article a
later task added, *"Rule change: FIREBALL replaced the 1-OFF play style across the PICK daily games."* The
guarantee that still holds, and the one you were being given, is narrower: **1-OFF is nowhere sellable.** No payout
row, no play type, no wager, no checker option. It survives only as history, which is the honest way to describe a
product the operator retired.

The page now carries the complete, current, verified matrix — nine base play types and nine FIREBALL rows, with
the operator's odds and its published maximum FIREBALL win counts.

---

## 390 px hierarchy

1. One preview banner, stating the review-date basis once
2. Florida chip · "2 drawings a day"
3. Game mark + H1 + one-paragraph orientation — **[SUPERSEDED]** the neutral lettered mark is now the
   verified Florida "PICK 3 PLUS FIREBALL" wordmark; see REVISION R5
4. Eight jump links (not eighteen)
5. **Midday: Thu 07/09/2026 · 1:30 PM ET → 3 · 7 · 8 → Fireball 9 → verified · next drawing Fri 07/10/2026**
6. **Evening: Wed 07/08/2026 · 9:45 PM ET → 5 · 6 · 9 → Fireball 4**
7. One compact source line, then Check these numbers (primary) / Explain / History / Share

Both drawings are inside the first viewport. Getting there needed a measured fix: the neutral mark was wrapping
above a two-line H1 and costing 50 px, which was the difference between one visible drawing and two.

## 1440 px

**[SUPERSEDED — see REVISION R6.]** This described a single 900 px column. The canvas is now the accepted State
width (1380 px), scoped to JG-M2 so `/fl/powerball` keeps its 900 px column. There is still no supporting rail,
because no Game Page ad profile is approved and an empty right column is the failure mode the requirement names.
Tables and tools take the extra width; editorial prose stays bound to a 726 px measure.

---

## One identity, two independent records

This is the part the brief cared most about, and it is now structural rather than careful:

- Midday is game **332**, Evening is game **333**. Separate ids, separate results, separate dates, separate
  times, separate FIREBALL values, separate history queries.
- **The differing dates are the correct answer, not staleness.** Midday shows 07/09 and Evening shows 07/08
  because that is what was drawn. Evening keeps its own older date rather than borrowing Midday's.
- Rows render in **configured order, never re-sorted by recency** — so Midday is in the same place every visit.
- Member composition is **read from `config/states/fl.json`**, the same array the State page renders. It is not
  restated in the game configuration, and a test fails if anyone adds it there. That is what stops Midday and
  Evening drifting apart between the two pages.

Cash Pop proves five rows the same way (three drew on the 9th, two on the 8th). Jackpot Triple Play proves one.

---

## What is real and what is sample

Honest split, because it changes how you should read the page:

| Section | Data |
|---|---|
| JG-01, 02, 05, 12, 13, 18 | **Real** — production feed, operator rules, governed claim manifest |
| JG-06 prizes and odds | **Real** — Florida rule `53ER24-56`, read 2026-08-04 |
| JG-03 checker, JG-10 generator | **Real logic**, verified against the official matrix |
| JG-07 history | **2 real rows + 119 internal samples** |
| JG-08 | **[SUPERSEDED]** now a whole-number lookup across recent draws — see REVISION R2 |
| JG-09, 14 | Computed from that history, so mostly describing sample data |
| JG-15 | **[SUPERSEDED]** now 8 real articles at their own routes, with effective/reviewed dates and citations — see REVISION R1 |
| JG-16 | Platform-authored starters only |
| JG-17 | **[SUPERSEDED]** device-local save removed entirely; all options are account-backed and the `member-auth` dependency is missing — see REVISION R4 |

Every history row carries its own provenance tag, and the newest row for each drawing is always real. No
fabricated winner, publication date, author, community activity, claim rule or tax fact exists anywhere.

---

## Trust treatment

Measured in the rendered HTML, not asserted: **zero** occurrences of "official site", "official website",
"verify with" or "check the official". One compact source line near the result. One preview banner. One
ticket-validation boundary, after the checker output. The complete source, methodology, corrections,
independence and Responsible Play explanation lives in JG-18 and nowhere else.

---

## Route position

`/fl/pick-3` **does not exist in production.** I proved the legacy slug rule from `Game.getGameNameForURL()` and
confirmed it against the 9,246-URL production sitemap: Florida's indexed inventory is `/fl/pick-3-midday`
(16 archive years) and `/fl/pick-3-evening` (36 archive years). So this is an **introduced** route — guarded,
`noindex`, absent from every sitemap, with no redirect either way. Your decisions 2, 3 and 4 are implemented
exactly as written; nothing about the archive URLs was touched.

---

## Decisions requiring your review

1. **Nine of ten "sections" on the analysis band describe sample data.** Connecting a real archive is the one
   change that turns this page from a design review into a publishable page. Confirm it is the next task.

2. **Advance Play horizon conflict.** The promulgated rule `53ER24-56` §1f says a fourteen-day / seven-day
   period. A summary reading of the public Pick 3 web page suggested "up to 6 months in advance", which the rule
   text does not support. I used the **rule** and recorded the discrepancy (Conflict 22). Confirm, or ask for a
   re-read before this fact ships.

3. **`/fl/fantasy-5` is the awkward one in your decision 3.** It already exists with 23 archive years and
   currently serves **the Evening game alone** — `/fl/fantasy-5-midday` is not in the sitemap at all. So
   "expanding it into a family page" changes what an existing indexed URL shows, rather than consolidating two
   variants into a new page. Different SEO decision, same table row. Confirm you want that.

4. **Family archive route.** Per decision 4 I changed nothing. The recommendation on the table is one
   `/fl/pick-3/{year}` carrying Midday and Evening together, which would eventually supersede 52 Florida Pick 3
   archive URLs. That needs the URL audit before anyone designs a redirect.

5. **JG-15 suppresses on Cash Pop and Jackpot Triple Play** (17 of 18 sections) because no editorial inventory
   is configured for them. **[REVISED]** There are no longer any tabs to leave empty; the alternative is now three
   empty section headings, which the revision direction forbids. Confirm suppression.

6. **Jackpot Triple Play and Cash Pop have no prize matrix**, so JG-06 shows structure and odds but no amounts,
   and JG-03 shows its explanation without the tool. That is decision 6 applied. If you want those two complete,
   they each need their own primary-source research pass.

7. **Sign-in for save/follow/alerts.** **[SUPERSEDED — see REVISION R4.]** *(Marked 2026-08-07; it was the one
   superseded item left unmarked.)* This read: *"I implemented: device-local save that genuinely works
   (localStorage, reversible, claims nothing more), and account-dependent options…"* **All device-local save was
   removed by LRG-GAME-051** — no `localStorage`, no "on this device" copy. Every option is account-backed, and
   the missing `member-auth` dependency is stated on the page. The rest still stands: no login was built and no
   route was invented. `ACCT-DEC-001` `FD-ACC-14` has since made that treatment platform policy.

8. **`/fl/powerball` gained one fix.** It rendered two `<main>` landmarks whenever the home preview flag was
   off — a pre-existing WCAG defect from `b57b72e` that the V0 record missed because it was measured with that
   flag on. Both pages now render exactly one. Everything else about `/fl/powerball` is unchanged and verified:
   same order, same six visible sections, zero JG markers.

9. **No Game Page advertising**, still. The four `AD-JG*` anchors hold their governed positions and resolve to
   nothing. Confirm the page reviews ad-free until ad ops captures `lc_mgp_*` from the legacy JSPs.

10. **`/play/{game}` remains unresolved** (Conflict 14). This page reuses the existing inline resolver and
    creates no route.

---

## Verification summary

608 tests pass (83 new). Type-check, lint and production build clean. All eighteen sections in server HTML.
Guard off: all four game routes 404 with zero markup leak, and Home plus all six State pages are
**byte-identical** to guard-on. 0 horizontal overflow at 375, 390 and 1440 px. Checker verified live against
the official matrix on five paths; filters verified to change coverage, frequencies and the variant comparison.

---

# REVISION REVIEW — LRG-GAME-051 (2026-08-04)

Six focused changes to the page reviewed above. Nothing else was redesigned.

## The page got shorter by getting more useful

| | Before | After |
|---|---|---|
| Height at 390 px | 23,207 px | **19,197 px** |
| Height at 1440 px | 15,145 px | **12,871 px** |
| Editorial articles | 0 (nine "not yet published" cards behind a tab strip) | **8 real articles at their own routes** |

The length came out of repetition, not content: 121 history rows became 10 with a full-history action, ten inline
statistics panels became four figures with a detailed view behind a button, five insight cards became one summary,
and 119 per-row "Review sample" badges became one sentence under the table.

## The editorial content is now real

The tab strip is gone. Three visible sections — **Pick 3 guides**, **Pick 3 news and rule updates**, **Pick 3
analysis** — each linking real articles with real bodies at real routes. Every card is a crawlable `<a href>`, and
every link resolves; an undeclared slug 404s rather than rendering a blank page.

**On dates.** LotteryCorner has not published these on a date, so no publication date is stated. What the cards
show instead is true and specific: **Effective 2021-01-18** for the FIREBALL/1-OFF changeover, **Effective
2018-08-05** for the evening draw-time move, **Effective 2016-08-01** for the CASH 3 rename — each citing the
Florida Lottery fact sheet — and **Facts checked 2026-08-04** for the evergreen guides. The validator rejects
`author`, `byline` and `publishedDate` outright.

**Winners is absent, not empty.** The category is rejected at the config layer: a winner story needs a sourced
article about a real person, and none exists. That is the one editorial category that cannot be written honestly
yet, so it is not on the page at all.

## The number search answers the question people actually arrive with

The old JG-08 asked "how often was 7 in the first position" — which is a statistic, and JG-09's frequency table
already answered it. It now asks **"did this number come up?"**: one three-digit field, last 10/25/50/100 draws,
Midday/Evening/Both, Exact or Any order, and FIREBALL combinations when you want them.

**Leading zeros work, and that needed a structural fix.** `007` is a real Pick 3 number and a numeric input
cannot hold it — the browser normalises it and `Number("007")` is `7`. The field is a text field with a numeric
keypad, and the parser reads it position by position. `007`, `070` and `700` are three different searches, and a
partially typed number is refused rather than quietly searched as something else.

Verified live: `378` exact → 1 match; `873` exact → 0; `873` any order → 1, labelled "Any order"; `978` with
FIREBALL → 1, naming which position the FIREBALL number replaced.

It is deliberately separate from Check your numbers, and each links to the other: one searches many drawings and
prices nothing, the other compares one ticket against one drawing and reads the payout table.

## Membership is honest now, and it is also incomplete

**Every trace of device-local Save is gone** — no storage, no "on this device" language. The old toggle worked,
but a member's saved games have to follow them across devices, so it was the wrong feature wearing the right word.

All six options are account-backed. Clicking one while signed out opens a prompt that names the action and holds
the intent so it can be resumed after signing in.

**The missing dependency is `member-auth`.** There is no authentication service and no member store in this
repository. So no Log in link is rendered — inventing a route that 404s would be worse than saying so — and the
panel states plainly that accounts are not connected, nothing was turned on, and nothing was saved. The signed-in
success path exists as a seam but is unreachable, so no action can report success. **This is the one required
change that cannot be completed until membership exists.**

## The logo is authentic, and one was nearly wrong

**Found and used:** the Florida Lottery **"PICK 3 PLUS FIREBALL"** wordmark, from the production per-state logo
library. One identity for the whole family — Midday and Evening share it.

Three signals confirm it is the right asset and current: it sits in `img/logos/florida/` rather than the
multi-state share-card folder; the FIREBALL lockup dates it after 2021-01-18; and its sibling reads "CA$H 3", the
pre-2016 name it supersedes.

**The near-miss is worth your attention.** A filename search for "pick3" finds `img/social/pick3.webp` first, and
that file is **Maine's** Pick 3 logo. Using it would have repeated the mis-mapping LRG-UI-011 had to undo. The
registry key is now state-scoped (`fl-pick-3`), because the legacy library holds a different Pick 3 mark for about
thirty jurisdictions and a bare game slug would have put Florida's logo on Virginia's page.

## Decisions requiring your review

1. **Article routes are introduced.** `/fl/pick-3/{guides|news|blog}/{slug}` — eight of them, guarded, `noindex`,
   no sitemap entry, no redirect. They exist because crawlable links need destinations. Confirm the shape, and
   that they stay guarded pending the URL audit.

2. **Trademark clearance for the Pick 3 wordmark is unresolved** — the same open question already recorded for
   Powerball and Mega Millions. Provenance is verified; rights are not. If clearance is withheld, deleting one
   registry line reverts to the neutral mark.

3. **Membership cannot be finished here.** Confirm the guarded review state is the right stopping point, or tell
   me the auth routes and session source to wire against.

4. **Statistics still describe sample data.** 119 of 121 history rows are internal samples, so the four preview
   figures and the "what changed" summary are computed over them. Connecting a real archive remains the change
   that turns this page publishable.

5. **`/fl/powerball` gained one scoped fix and no redesign.** A first attempt at the State canvas width widened
   the shared container and did change Powerball; it is now scoped to JG-M2 only, and Powerball is verified
   unchanged. Its breadcrumb misalignment stays unfixed for the same reason — it is a JG-M1 page and out of scope.

6. **I could not open your screenshot.** It is in `~/Downloads`, outside the workspace, and the sandbox denies
   reads there. All six changes were implemented from your written direction. If you move a copy into the repo or
   `/tmp` I will review it against the result.

## Verification

640 tests pass (32 new, covering leading zeros, every window size, draw-type filters, Exact and Any order, the
add-on path, editorial routing, and the logo scoping). Type-check, lint and production build clean. Guard off:
every game and article route 404s with no markup leak, and Home plus all six State pages are **byte-identical**
to guard-on. 0 horizontal overflow and 0 card overlaps at 375, 390 and 1440 px. Zero occurrences of "not yet
published" anywhere on the page.
