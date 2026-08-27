# Yearly Archive at Real Scale — Recommendation for Founder Review

**Task:** LRG-ARCHIVE-055 · **Status:** recommendation only. **Nothing in this document is implemented.** No
pagination, canonical, sitemap, redirect or production SEO behaviour is activated.

The guarded V0 renders **52 rows**. A genuine Florida Pick 3 year is **~730** — two drawings a day, every day.
That is a 14× increase, and it changes decisions that look settled at 52.

---

## 1. The numbers this has to survive

| | V0 today | One real Pick 3 year | A real five-draw game (Cash Pop) |
|---|---:|---:|---:|
| Rows | 52 | **~730** | ~1,825 |
| Server HTML | 431 KB | **~2.1 MB** (measured: 4.0 KB per row + shell) | ~5 MB |
| Mobile page length at 390 px | 17.2 screens | **~220 screens** | ~550 screens |

The HTML figure is the blocker. 2.1 MB of markup for one page fails Core Web Vitals on mobile regardless of how
well it is structured, and 220 screens of scroll is not a page a reader navigates — it is a document they abandon.

**A five-draw game is the real test.** Pick 3 at 730 is survivable with effort; Cash Pop at 1,825 is not. Any
strategy chosen for Pick 3 has to hold for Cash Pop, because the archive engine is generic and the next
jurisdiction will bring one.

---

## 2. Recommendation: the month is the page, the year is the hub

**One route per month, with the year route as a real hub — not a paginated list.**

```
/fl/pick-3/2023            the year hub: summary, month index, statistics, the most recent 60 rows
/fl/pick-3/2023/03         March: every March drawing, ~62 rows
```

### Why a month and not `?page=2`

Four reasons, in order of weight:

1. **A month is a unit a reader already has in mind.** "What came up in March" is a question; "page 4 of 12" is
   not. Numbered pagination makes a reader guess which page holds a date they know.
2. **A month URL is stable and linkable.** `?page=4` shifts every time a row is added, so a link rots; `/2023/03`
   never does. That matters for a page family whose value is being cited.
3. **~62 rows is a page.** 250 KB of HTML, roughly 18 mobile screens — the size the V0 is now, which reviews well.
4. **Google's own pagination guidance** (in the brief's research register) is that crawlers follow links, not
   buttons. Twelve month links in the year hub are twelve crawlable URLs discovered in one hop, with no rel-next
   chain to traverse and no click-only state.

### What each surface holds

**The year hub** — the archive's front door, and a complete page in its own right:

- the concise summary and year navigation, exactly as they are now;
- the month index, with a count per month — already built, already crawlable;
- **the most recent 60 rows**, server-rendered, so the hub answers "what came up lately" without a second click;
- year-wide statistics computed over the **whole** year (see §5);
- search that queries the whole year (see §4);
- a clear link to each month for the complete rows.

**A month page** — every drawing in that month, the same table as today, plus previous/next month links and a link
back to the year hub.

### Why not the alternatives

| Option | Why not |
|---|---|
| One page, all 730 rows | 2.1 MB of HTML. Fails on mobile, and is 5 MB for a five-draw game |
| Numbered pagination | Unstable URLs, no reader meaning, more hops to crawl |
| Infinite scroll / "load more" | Blueprint §35 and the brief both forbid a click-only history; rows would not exist in server HTML |
| Client-side month filtering only | Same defect — 730 rows either ship in the HTML or are not crawlable |
| Collapsed months, expanded on click | The rows are still all in the HTML, so it fixes scroll length and not payload |

---

## 3. Month navigation and the default view

- The month index stays where it is now: **above** search, real links, a count per month.
- On a **month page** the current month is marked `aria-current` and the others remain links, so the index doubles
  as the pagination control. No separate pager.
- The **year hub's default view** is the 60 most recent rows — about a month of a two-draw game. Enough to be
  useful, small enough to stay fast, and it means the hub is never an index-only page with nothing on it.
- **Ordering stays newest-first everywhere**, and within a date the family's configured member order. Unchanged.

---

## 4. Search across a partitioned archive

This is the part that needs a decision, because search is currently client-side over 52 rows in memory.

**Recommendation: search stays year-wide, and moves server-side when the row count crosses a threshold.**

- On a **month page**, search still queries the **whole year** — a reader searching `378` wants every 2023 hit, not
  the March ones. The result table links each hit to its month page.
- Below ~120 rows, keep the current client-side filter: it is instant and needs no request.
- Above that, the same `filterArchive` runs on the server behind a POST or a server action. **The function does not
  change** — it is already pure and already the single source of matching semantics, which is what makes moving it
  cheap.
- Filter state stays out of the query string, exactly as now. Blueprint §31 forbids indexable filter states, and a
  year × month × variant × number × order-mode combination space would be a large crawl trap.
- The **URL-fragment filter carry** built in this pass extends unchanged to month pages, so a reader's search
  survives both a year change and a month change.

---

## 5. Statistics scope — the one place to be careful

**Statistics must be computed over the whole year, never over the visible page.**

If a month page computed its statistics from its own 62 rows, "number frequency" would silently mean "frequency in
March" while sitting under a heading about the year. Two readers on two month pages would see different "year"
figures. That is the class of quietly-wrong output this program has repeatedly had to correct.

So:

- **Every figure names its window.** The model already requires this — `period`, `variants`, `drawCount` and
  `method` are mandatory on every analysis view, and `range` is mandatory on every metric.
- A **month page shows the year's statistics**, labelled as the year's, with an optional clearly-labelled
  month-scoped view beside it.
- Statistics for a **closed year never change**, so they are computed once. The current year recomputes after each
  new result — which is also when `lastmod` should move.
- The engine itself is unchanged: it already takes a row array and a filter.

---

## 6. Year-to-year navigation

Already built and already correct for this: `archiveYearNavigation` reads the registry, so Older and Newer mean
the nearest **registered** year and a boundary renders as an unavailable control. Connecting 2023 is a one-line
registry edit plus its data — no navigation change.

Two additions when a second year exists:

- The month index on a year hub links only to months **that year** has, so a partial first year cannot offer an
  empty month.
- The filter carry drops a month unavailable in the destination year — already implemented and tested.

---

## 7. Crawlability and SEO, to be activated only on approval

Recorded for the cutover task, **not** activated here:

- **Canonical:** each month page canonical to itself; the year hub canonical to itself. The hub is not a
  `rel=canonical` target for its months — they hold different content.
- **No `rel=next`/`rel=prev`.** Google ignores them for pagination now, and the month index already provides
  discovery.
- **Sitemap:** one entry per year hub and one per month, which is 13 URLs per game-year. For Florida Pick 3 back
  to 1988 that is ~470 URLs for this game alone — so the sitemap **index split by state and game** that
  `CLAUDE.md` §11 already anticipates becomes a requirement, not an option.
- **`lastmod`:** current-year month pages move after a result in that month; a closed year moves only on a
  correction or a material content change. Per `CLAUDE.md` §11.
- **The route conflict is unresolved and this makes it larger.** Production serves
  `/fl/pick-3-{midday,evening}/{year}` — 52 indexed URLs. A family route with month partitioning would be ~13 per
  year instead of 2. The redirect map has to reconcile both the variant split and the month split, which is more
  reason to run the URL audit before connecting 2023, not after.

---

## 8. Mobile page length

| Surface | Rows | Est. mobile screens |
|---|---:|---:|
| Year hub (60 recent rows + statistics) | 60 | ~19 |
| Month page (Pick 3) | ~62 | ~18 |
| Month page (five-draw game) | ~155 | ~40 |

A five-draw month at 40 screens is still long. If that proves too long in review, the next partition is **month +
draw time** (`/fl/cash-pop/2023/03?draw=morning` as a filter, or a route if it earns one) — but that is a decision
to make with a real five-draw archive in front of us, not now.

---

## 9. What this needs before the 2023 connection task

1. **Founder approval of month partitioning**, since it introduces a route level and the brief forbids activating
   routing changes without it.
2. **A decision on the URL audit** — it should precede the connection, because the redirect map depends on the
   partitioning choice.
3. **Confirmation of the 60-row hub default**, which is a judgement about how much is useful versus fast.
4. **The search threshold**, if the server-side move is wanted in the same task rather than later.

**Recommended sequence:** approve this strategy → run the URL audit → connect 2023 as a single year hub with month
partitioning → review at real scale → then decide on production SEO activation.
