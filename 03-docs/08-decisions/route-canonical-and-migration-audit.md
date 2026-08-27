# Combined Game / History Route and Canonical Architecture Audit

**Document type:** Audit and decision proposal — routes, canonical architecture, redirects, sitemap
**Audit ID:** `ROUTE-AUDIT-001`
**Ruling family:** `FD-RTE-01` … `FD-RTE-12` — **RATIFIED BY THE FOUNDER, 2026-08-11. IN FORCE.**
**Produced by:** Task **LRG-ROUTE-055**
**Audit date:** August 7, 2026 · **Repository state:** `cb523f4` on `main`
**Status:** **IN FORCE — ratified by the founder on 2026-08-11.**

The audit that produced this document changed no route, redirect, canonical, sitemap, Next.js configuration,
Apache/Cloudflare configuration, internal link or page implementation. **Ratification does not change that.** What
ratification settles is the *decisions*; the *implementation* of each remains a separately scheduled task, and §10's
five-stage rollout — with its two rollback checkpoints and the `FD-RTE-11` data prerequisite — is now the authorised
plan rather than a proposal.

**Two governance records were amended on the same authority**, and both amendments are in `CLAUDE.md`:

| Record | Was | Now | Ruling |
|---|---|---|---|
| `CLAUDE.md` §11 canonical target | non-`www`, no trailing slash | **`www`, no trailing slash** | `FD-RTE-02` / `FD-RTE-03` |
| `CLAUDE.md` §10 commerce route | approved pattern `/play/{game}` | **`/buynow/{code}` confirmed** | `FD-RTE-06` |

**What is NOT yet implemented, and must not be assumed from this status line.** `productionOrigin.ts` still holds the
non-`www` constant; no `sitemap.ts` or `robots.txt` exists; no redirect is emitted; the ~1,300 missing archive URLs
are still undeclared. Those are `FD-RTE-01`/`02`/`03`/`04`/`08`/`09` implementation work, scheduled separately. Until
it lands, every new page family remains `noindex`, which is what keeps the unratified constant harmless.

**Evidence labelling.** Every finding below carries one of four labels, used strictly:

| Label | Meaning |
|---|---|
| **[REPO]** | Read from this repository at `cb523f4` |
| **[LIVE]** | Measured against production on 2026-08-07 by HTTP request |
| **[PROPOSED]** | This audit's recommendation. Not a decision |
| **[UNKNOWN]** | Not determinable without infrastructure access or a founder answer |

**Access boundary.** Production was inspected over plain HTTP only — status codes, `Location` headers, response
bodies, `robots.txt` and `sitemap.xml`. **No Cloudflare dashboard, Apache configuration, WAF rule set, analytics
property or Search Console data was available.** Every conclusion about *where* a behaviour is implemented, as
opposed to *what* it does, is therefore **[UNKNOWN]** and is marked so.

---

## 0. The finding that outranks the rest

Everything in this audit was commissioned to settle the Pick 3 family-archive question. That question is real and
§3 answers it. But the audit surfaced something larger, and it is independent of any decision about Pick 3:

> **[LIVE] Production serves every page at a large number of distinct URLs, all returning `200`, and emits no
> canonical tag anywhere.**

Measured directly:

| Variant axis | Result | Evidence |
|---|---|---|
| `https://www.lotterycorner.com/fl` | `200` | [LIVE] |
| `https://lotterycorner.com/fl` (non-`www`) | `200` — **no host redirect** | [LIVE] |
| `…/fl/pick-3-evening/` (trailing slash, depth 2) | `200` — **no slash redirect** | [LIVE] |
| `…/fl/pick-3-evening/2023/` (trailing slash, depth 3) | `200` | [LIVE] |
| `…/FL/pick-3-evening/2026` (upper-case state) | `200` | [LIVE] |
| `…/Fl/pick-3-evening/2023` (mixed-case state) | `200` | [LIVE] |
| `…/fl/PICK-3-EVENING/2023` (upper-case slug) | `200` | [LIVE] |
| `<link rel="canonical">` on any of the above | **absent** | [LIVE] |
| `<meta name="robots">` on any of the above | **absent** | [LIVE] |
| `og:url` on any of the above | **absent** | [LIVE] |

Only one redirect exists on the canonical path: **HTTP → HTTPS, `301`, host preserved** [LIVE]. It does not
canonicalise the host, the slash or the case.

Multiplying the axes that are certain — 2 hosts × 2 slash forms × at least 4 case forms of the state segment —
gives **at least 16 live, indexable, byte-identical URLs for every one of the 9,246 sitemap entries**, with no
canonical tag to consolidate them. Case variants of the game slug multiply it further.

**Production is generating these URLs itself.** [LIVE] Requesting an out-of-range archive year returns
`302 → /FL/pick-3-evening/2026` — a redirect whose `Location` carries an **upper-case state code**. The
application does not merely tolerate the variant form; it emits it.

This is a pre-existing production condition. It is not caused by, and will not be fixed by, any Game or History
Page work. But **no canonical decision for the new pages can be made in isolation from it**, because the new
pages will inherit whatever host, slash and case policy the edge applies. It is `FD-RTE-01`, and it is the one
recommendation in this audit that would deliver value before a single new route ships.

---

## 1. Route family inventory

### 1.1 Production route families — [LIVE] and [REPO]

Derived from `src/struts.xml` [REPO, read-only] and confirmed by request [LIVE].

| # | Pattern | Struts action | In sitemap? | Live | Notes |
|---|---|---|---|---|---|
| 1 | `/` | `welcome` | 1 URL | `200` | Home |
| 2 | `/{state}` | `*` → `{1}_state` | 48 | `200` | Two-letter hubs, incl. `/pr`, `/vi` |
| 3 | `/{state}/{game}` | `*/*` → `page=game` | 456 | `200` | Jurisdiction game page |
| 4 | `/{state}/{game}/{year}` | `*/*/*` → `page=gameHistory` | **8,700** | `200` | The yearly archive — the dominant surface |
| 5 | `/{state}/{year}/{month}/{day}` | `*/*/*/*` → `StateResultsAction` | **0** | not probed | **A fourth family, entirely absent from the sitemap** [REPO] |
| 6 | `/{state}/{game}/jackpotanalysis` | `*/*/jackpotanalysis` | 0 | not probed | [REPO] |
| 7 | `/powerball`, `/mega-millions`, `/lotto-america`, `/2by2`, `/tri-state-megabucks-plus` | named | 5 | `200` | **Global game hubs already exist and are indexed** |
| 8 | `/blog`, `/blog/{slug}` | named | 1 + 20 | `200` | Two blog templates (open question, `CLAUDE.md` §10) |
| 9 | `/jackpots`, `/lottery-tax-calculator`, 6 × `/lottery-glossary-*` | named | 8 | `200` | Tools and reference |
| 10 | `/about-us`, `/contact-us`, `/faqs`, `/privacy-policy`, `/terms-and-conditions`, `/cookies-policy` | named | 6 | `200` | Trust surfaces |
| 11 | `/buynow/{code}` | `buynow/*` → `redirect ${partnerURL}` | **0** (robots-disallowed) | `302 → /` | Commerce resolver |
| 12 | **Every pattern above, again, with a trailing slash** | `*/`, `*/*/`, `*/*/*/`, `*/*/*/*/` | 0 | `200` | **Declared explicitly in `struts.xml`** — the duplication is deliberate legacy design, not a server accident [REPO] |

**Families 5, 6 and 12 are live route surface with zero sitemap representation.** Family 12 is the trailing-slash
twin of everything, and it is declared line-by-line in the legacy configuration.

### 1.2 New application route families — [REPO]

`01-new-ui` at `cb523f4`. Four page routes and one handler exist:

| Route file | URL shape | Guard | `robots` | Canonical emitted? |
|---|---|---|---|---|
| `app/page.tsx` | `/` | `LC_HOME_PREVIEW` | from view model | **No** — "migration policy is unresolved" |
| `app/[state]/page.tsx` | `/{state}` | preview flag | `noindex, nofollow` while preview | **Yes**, non-`www` |
| `app/[state]/[game]/page.tsx` | `/{state}/{game}` | `LC_GAME_PREVIEW` | `noindex, nofollow` | **Yes**, non-`www` |
| `app/[state]/[game]/[segment]/page.tsx` | `/{state}/{game}/{year}` | `LC_GAME_PREVIEW` | `noindex, nofollow` | **No** — deliberate; synthetic review rows must not carry a production canonical |
| `app/[state]/[game]/[segment]/[slug]/page.tsx` | `/{state}/{game}/{guides\|news\|blog}/{slug}` | `LC_GAME_PREVIEW` | `noindex, nofollow` | **Yes**, non-`www` |
| `app/buynow/[code]/route.ts` | `/buynow/{code}` | — | — | n/a |

**The `[segment]` parameter carries two different meanings** at the same depth: a four-digit year routes to the
archive, a known editorial segment routes to the article index. [REPO] This is not a style choice — Next.js
rejects two differently-named dynamic segments at one depth, **at request time rather than build time**, which
is what forced the unification. It is a constraint any future route design at this depth must respect.

**There is no `app/sitemap.ts` and no `robots.txt` in the new application.** [REPO] `lib/seo/sitemapEntries.ts`
is a tested but deliberately **unwired** generator that emits **State hubs only** — no game pages, no archives —
and its own header documents the one-line cutover that would activate it.

---

## 2. Registry reconciliation against the production sitemap

### 2.1 The registries, by their exact names — [REPO]

| Registry | File | Export | Entries |
|---|---|---|---|
| Game | `lib/game/gameRegistry.ts` | **`ELIGIBLE`** (`readonly GameRegistryEntry[]`, frozen) | **11** |
| Archive | `lib/archive/archiveRegistry.ts` | **`ARCHIVE_ELIGIBLE`** (`readonly ArchiveRegistryEntry[]`, frozen) | **1** |

Accessors: `gameRegistryEntry`, `isGamePreviewEligible`, `eligiblePairs`; `isArchiveEligible`, `archiveYearsFor`,
`archiveRoutePaths`, `adjacentArchiveYear`, `archiveYearNavigation`.

*(An earlier progress report spelled the game export `ELEGIBLE`. The correct identifier is `ELIGIBLE`.)*

### 2.2 Verified sitemap counts — [REPO] and [LIVE], exact

The live `sitemap.xml` and the repository copy are **identical in URL set**: 9,246 `<loc>` entries, 0 differing
in either direction.

| Measure | Exact value |
|---|---|
| Total `<loc>` entries | **9,246** |
| Distinct | **9,246** (no duplicates) |
| Host — every entry | `https://www.lotterycorner.com` (**9,246 of 9,246**) |
| Scheme | `https` (9,246 of 9,246) |
| Entries with a trailing slash | **1** (the root `/`) |
| Depth 0 / 1 / 2 / 3 | **1 / 68 / 477 / 8,700** |
| Two-letter state hubs | **48** |
| `/{state}/{game}` pairs | **456** |
| `/{state}/{game}/{year}` archives | **8,700** |
| Distinct state-game pairs with archives | **456** — every pair has a hub, and every hub has archives |
| Archive year range | **1976 – 2023** (48 distinct years) |
| `<lastmod>` tags present | **9,246** |
| Format | Single flat `<urlset>`, **1,671,263 bytes**, no `<sitemapindex>` |
| Largest single pair | `md/pick-3-evening` — **48** years |

The ~9,246 and ~8,700 figures in `CLAUDE.md` §10 are **confirmed exactly**, not approximately.

### 2.3 The sitemap is three years stale — [LIVE]

The sitemap's newest archive year is **2023**. Production serves later years:

| URL | Sitemap | Live |
|---|---|---|
| `/fl/pick-3-evening/2023` | listed | `200` |
| `/fl/pick-3-evening/2024` | **not listed** | **`200`** |
| `/fl/pick-3-evening/2025` | **not listed** | **`200`** |
| `/fl/pick-3-evening/2026` | **not listed** | **`200`** |
| `/fl/pick-3-evening/2027` | not listed | `302 → /FL/pick-3-evening/2026` |
| `/fl/pick-3-evening/1987` | not listed | `302 → /FL/pick-3-evening/2026` |
| `/fl/pick-3-midday/2024`–`2026` | **not listed** | **`200`** |

So the live archive reach is **1988–2026 for Pick 3 Evening (39 years)** and **2008–2026 for Midday (19 years)**,
against 36 and 16 in the sitemap. Out-of-range years redirect to the newest year rather than 404 — a
**many-to-one redirect that discards the requested year**, and a `302` where the intent is permanent.

**[PROPOSED] estimate, flagged as an estimate:** if the same three-year gap applies across the 456 pairs, roughly
**1,300–1,400 live archive URLs are absent from the sitemap**. This was not verified pair-by-pair; doing so needs
~1,400 requests and should be a scripted crawl, not this audit.

### 2.4 Registry-to-production reconciliation — [LIVE] verified per pair

| Registry pair | Mode | Production `/{state}/{game}` | Sitemap archive years | Classification |
|---|---|---|---|---|
| `fl/powerball` | JG-M1 | `200` | 30 (1994–2023) | **Preserve** |
| `fl/pick-2` | JG-M2 | **`404`** | 0 | **Introduce** |
| `fl/pick-3` | JG-M2 | **`404`** | **0** | **Introduce** |
| `fl/pick-4` | JG-M2 | **`404`** | 0 | **Introduce** |
| `fl/pick-5` | JG-M2 | **`404`** | 0 | **Introduce** |
| `fl/cash-pop` | JG-M2 | **`404`** | **0** | **Introduce** |
| `fl/fantasy-5` | JG-M2 | `200` | 23 (2001–2023) | **Preserve, scope change** — see §3.5 |
| `fl/jackpot-triple-play` | JG-M2 | `200` | 5 (2019–2023) | **Preserve** |
| `fl/lotto` | JG-M2 | `200` | 25 (1999–2023) | **Preserve** |
| `ca/daily-3` | JG-M2 | not probed | 0 in sitemap | **Introduce** |
| `ca/superlotto-plus` | JG-M2 | not probed | 0 in sitemap | **Introduce** |
| `ARCHIVE_ELIGIBLE`: `fl/pick-3/2026` | — | **`404`** | 0 | **Introduce** |

**Four of eleven game pairs preserve an existing indexed URL; seven are introductions. The one archive route is
an introduction.** Nothing in either registry currently collides with a live production URL — every introduced
route 404s today, so there is no accidental overwrite risk and no equity at stake in the introductions.

---

## 3. Conflict 23 — resolved on evidence

### 3.1 The four questions, answered exactly

| Question | Answer | Evidence |
|---|---|---|
| Production Pick 3 **Midday** archive routes | `/fl/pick-3-midday/{year}` — **16 years, 2008–2023** in the sitemap; **live 2008–2026 (19)** | [REPO] + [LIVE] |
| Production Pick 3 **Evening** archive routes | `/fl/pick-3-evening/{year}` — **36 years, 1988–2023** in the sitemap; **live 1988–2026 (39)** | [REPO] + [LIVE] |
| Does `/fl/pick-3/{year}` exist? | **No.** Absent from all 9,246 sitemap entries; `/fl/pick-3/2026` returns **`404`** live | [REPO] + [LIVE] |
| Cash Pop archive structure | **Five separate variant hubs**, each with its own archives: `cash-pop-morning`, `-matinee`, `-afternoon`, `-evening`, `-late-night` — **2 years each (2022–2023), 10 archive URLs total**. `/fl/cash-pop` returns **`404`** | [REPO] + [LIVE] |
| Proposed presentation-layer family routes | `/fl/pick-3` and `/fl/pick-3/{year}` (two members), `/fl/cash-pop` (five members) — both currently **guarded, `noindex`, absent from every sitemap** | [REPO] |

**The production model is one URL per drawing variant. The proposed model is one URL per game family.** That is
the whole of Conflict 23, and it is a genuine architectural disagreement, not an oversight.

### 3.2 What is at stake, quantified — [REPO]

| | Florida Pick 3 | Florida Cash Pop |
|---|---|---|
| Production hub URLs | 2 | 5 |
| Production archive URLs (sitemap) | **52** | **10** |
| Production archive URLs (live, est.) | ~58 | ~10 |
| Proposed hub URLs | 1 | 1 |
| Proposed archive URLs | 1 per year | 1 per year |
| Oldest year | **1988** (Evening) | 2022 |

Florida Pick 3 alone is 52 indexed archive URLs and a hub with 36 years of accumulated authority reaching back to
1988. Across all 48 jurisdictions the same variant-splitting pattern produces much of the 8,700.

### 3.3 The three viable canonical models

**Model A — Preserve the variant model. Do not introduce family routes.**

Family pages are dropped; `/fl/pick-3-midday` and `/fl/pick-3-evening` are rebuilt on the new stack at their
existing URLs.

- **SEO:** zero risk. No redirect, no consolidation, no equity transfer. 8,700 archive URLs keep their history.
- **UX:** a reader who wants "Florida Pick 3" must choose Midday or Evening before seeing either, and can never
  compare them on one page. This is the problem the Game Page blueprint was written to solve.
- **Data model:** fights the implementation. `presentation.families` in `config/states/{code}.json`, the whole
  JG-M2 multi-member composition, and the archive's variant filter all assume a family page. [REPO]
- **Redirects:** none.
- **Cost:** discards approved, built and reviewed work.

**Model B — Introduce family routes, keep variant routes, cross-link. No redirect.**

`/fl/pick-3` and `/fl/pick-3/{year}` ship alongside the existing variant URLs. Both stay indexable.

- **SEO:** **this is the dangerous one.** Two URL sets covering the same drawings, self-competing, with the
  family page a near-superset of both variants. Absent a canonical decision, this is the textbook duplicate-content
  split. It could be made survivable only by canonicalising the family page to itself and the variant pages to
  themselves, and accepting the overlap — which search engines may resolve against us either way.
- **UX:** best of both, briefly. Two paths to the same fact is a maintenance and analytics problem.
- **Redirects:** none, which is exactly why it is risky.

**Model C — Introduce family routes as canonical; redirect variant routes 1:1. [PROPOSED]**

`/fl/pick-3/{year}` becomes the canonical archive. `/fl/pick-3-midday/{year}` and `/fl/pick-3-evening/{year}`
**301** to it, each preserving its own year, and the family page presents both variants with the variant
selectable in-page.

- **SEO:** consolidates two competing URLs per year into one stronger page. Real but bounded risk: 1:1 redirects
  of same-intent content are the well-understood case. **The risk is concentrated in years where only one variant
  exists** — Evening has 1988–2007 with no Midday counterpart, so 20 Evening years would redirect to a family page
  whose Midday side is legitimately empty. That must be designed, not discovered.
- **UX:** matches the blueprint and the built implementation. One page per game family, per year.
- **Data model:** matches `presentation.families` exactly. No new abstraction.
- **Redirects:** ~62 for Florida Pick 3 and Cash Pop; on the order of **8,700 across all jurisdictions** if
  applied platform-wide. §7 sets out the plan; it must be generated from the registry, never hand-written.
- **Prerequisite:** the archive must actually hold the data. Today it holds **one year, 52 rows, of which most are
  review samples** [REPO]. Redirecting 1988 to a page with no 1988 data would be worse than any duplicate.

### 3.4 [RATIFIED 2026-08-11] `FD-RTE-05` — adopt Model C, staged, and not yet

Model C is the right destination: it is what the blueprints approved, what the code implements, and what a reader
wants. Model A discards approved work; Model B ships a known SEO hazard.

**But it must not be executed as a migration today.** Sequence:

1. **Now:** family routes stay guarded, `noindex`, absent from every sitemap. Variant routes untouched. *(This is
   already the state — no change required.)*
2. **Before any redirect:** connect real archive data for every year a redirect would target. A 301 to a page
   without the data is a broken promise the crawler records.
3. **Then:** one jurisdiction-game family as a pilot — **Florida Pick 3** — with the variant URLs redirected and
   measured for a full indexing cycle before the second family follows.
4. **Only then:** generate the platform-wide plan from `ARCHIVE_ELIGIBLE`, never by hand.

**Evidence confidence: high** on the route facts, **medium** on the SEO outcome — no traffic, backlink or Search
Console data was available to weight the 52 Florida URLs, which is `FD-RTE-11`.

### 3.5 `/fl/fantasy-5` — a different decision wearing the same label

[LIVE] `/fl/fantasy-5` returns `200` with **23 archive years (2001–2023)**. `/fl/fantasy-5-midday` is **absent
from the sitemap entirely** — 0 entries.

So Fantasy 5 is **not** a consolidation. Turning it into a family page **changes what an existing indexed URL
shows** — from one game to two — rather than merging two URLs into one. Same table row, materially different
decision, and it needs its own answer. The founder review already flagged this; the evidence confirms it.

---

## 4. Canonical host and slash handling

### 4.1 The measured redirect matrix — [LIVE], every hop recorded

| Request | Hops | Terminal |
|---|---|---|
| `http://lotterycorner.com/fl` | `301 → https://lotterycorner.com/fl` | `200` |
| `http://www.lotterycorner.com/fl` | `301 → https://www.lotterycorner.com/fl` | `200` |
| `https://lotterycorner.com/fl` | — | `200` |
| `https://www.lotterycorner.com/fl` | — | `200` |
| `https://www.lotterycorner.com/fl/` | — | `200` |
| `https://www.lotterycorner.com/fl/pick-3-evening/` | — | `200` |
| `https://www.lotterycorner.com/fl/pick-3-evening/2023/` | — | `200` |
| `https://www.lotterycorner.com/FL/pick-3-evening/2026` | — | `200` |
| `https://lotterycorner.com/fl/pick-3-evening/2023` | — | `200` |
| `https://www.lotterycorner.com/fl/pick-3-evening/2027` | `302 → /FL/pick-3-evening/2026` | `200` |
| `https://www.lotterycorner.com/buynow/fl-powerball` | `302 → /` | `200` |
| `https://www.lotterycorner.com/fl/this-game-does-not-exist` | — | `404` (true 404, not soft) |
| `https://www.lotterycorner.com/zz` | — | `404` |

**No redirect loop was found.** The longest chain is two hops (`http` + out-of-range year), well within limits.
`Server: cloudflare` on every response [LIVE].

### 4.2 Layer attribution

| Behaviour | Where implemented | Confidence |
|---|---|---|
| HTTP → HTTPS `301`, host preserved | Cloudflare, almost certainly an *Always Use HTTPS* rule | **[UNKNOWN]** — inferred from the `Server` header and the host-preserving shape. Not confirmed against the dashboard |
| Trailing-slash twins both `200` | **Legacy Struts.** `struts.xml` declares `*/`, `*/*/`, `*/*/*/` and `*/*/*/*/` as separate actions alongside their unslashed forms | **[REPO] — high.** This is explicit configuration, not a server default |
| Case-insensitive segments | Legacy application — Struts wildcards feed `selectedState` into a lookup that evidently normalises | [REPO] inference, **[LIVE]** confirmed behaviour |
| Out-of-range year `302` to newest, upper-casing the state | Legacy `StateResultsAction` / `gameHistory` | [LIVE] confirmed; source not traced |
| `/buynow/*` `302 → /` | Legacy `buynow/*` → `AffiliateAction`, `<result type="redirect">${partnerURL}</result>`; falls back to `/` when no partner resolves | **[REPO] — high** |
| `www` vs non-`www` | **Nothing.** No rule anywhere | **[LIVE] — certain** |
| Canonical tag | **Nothing emits one** | **[LIVE] — certain** |

### 4.3 The new application's own behaviour — [REPO] + measured locally

- `next.config.mjs` declares **no** `trailingSlash`, **no** `redirects()`, **no** `headers()`, **no** `rewrites()`.
- Next.js therefore applies its default: **`308`**, not `301`. Measured: `/fl/` → `308 → /fl`; `/fl/pick-3/` →
  `308 → /fl/pick-3`; `/fl/pick-3/2026/` → `308 → /fl/pick-3/2026`.

> **Correction to `CLAUDE.md` §10.** It records *"Next.js already applies a default trailing-slash 301."* The
> measured status is **308 Permanent Redirect**. Both are permanent and both pass equity; they differ in that 308
> preserves the request method. The distinction matters when the redirect plan is written against a spec.

- `PRODUCTION_ORIGIN = "https://lotterycorner.com"` — **non-`www`** [REPO], matching the `CLAUDE.md` §11 target.
- `lib/seo/siteSchema.ts` still carries `SITE_URL = "https://www.lotterycorner.com"`, marked provisional, feeding
  Home's `Organization` and `WebSite` JSON-LD. **The repository holds both host forms in two files.** [REPO]

### 4.4 The collision to avoid

If the new application ships behind the current edge, `/fl/` arrives at Cloudflare, is passed through, and Next
issues `308 → /fl`. Add a Cloudflare host-canonicalisation rule later and a request to `https://www.…/fl/`
becomes: Cloudflare `301 → https://lotterycorner.com/fl/`, then Next `308 → /fl`. **A two-hop chain, avoidable by
ordering the rules correctly** — host and slash normalised in one edge hop, before the origin ever sees it.

### 4.5 [RATIFIED 2026-08-11] `FD-RTE-01` — canonicalise the host, slash and case at the edge, before anything else

One Cloudflare rule set, applied ahead of any new-stack cutover:

1. `http` → `https` — **keep**, already correct.
2. `www.lotterycorner.com` → `lotterycorner.com`, **301**, path and query preserved.
3. Trailing slash → no trailing slash, **301**, except `/`.
4. Upper/mixed-case path → lower-case, **301**.
5. **Combine 2–4 into a single hop.** Never chain them.
6. Emit a self-referencing `<link rel="canonical">` on every public page, as a second signal.

**Do 6 even if 2–5 are deferred.** A canonical tag is additive, reversible, and needs no edge change — and it is
the only one of the six that could ship this week.

**Direction of the host decision.** `CLAUDE.md` §11 and `productionOrigin.ts` both record **non-`www`**. Every one
of the 9,246 sitemap URLs is **`www`**, and `robots.txt` points at the **non-`www`** sitemap — production already
contradicts itself. Moving to non-`www` means redirecting the entire indexed corpus; staying on `www` means
amending two governance records instead. **[RATIFIED 2026-08-11] `FD-RTE-02`: stay on `www`.** 9,246 indexed URLs are already
there, the migration cost is asymmetric and buys nothing a reader can perceive, and the recorded non-`www` target
predates the count. This reverses a recorded target and is therefore explicitly a founder decision, not a change
this audit may make.

---

## 5. Conflict 14 — `/play/{game}` versus `/buynow/{code}`

### 5.1 Evidence

| Source | Finding |
|---|---|
| Approved pattern (`CLAUDE.md` §10) | `/play/{game}` |
| Current implementation | `app/buynow/[code]/route.ts` — **`/buynow/{code}`** [REPO] |
| Legacy | `struts.xml` `buynow/*` → `AffiliateAction`, `urlCode={1}`, `<result type="redirect">${partnerURL}</result>` [REPO] |
| Live behaviour | `/buynow/fl-powerball` → **`302 → /`**; `/buynow/` → **`302 → /`** [LIVE] |
| `robots.txt` | `Disallow: /buynow/` — **confirmed live** |
| Sitemap | 0 `/buynow/*` entries; `SITEMAP_EXCLUDED_PREFIXES = ["/design-lab", "/buynow"]` [REPO] |

The legacy and new implementations **already agree**: a first-party path carrying an opaque code, resolved
server-side, robots-disallowed, never in a sitemap, falling back safely. The `302 → /` observed live is the
no-partner fallback, which is the correct safe behaviour. `CLAUDE.md` §13's requirements — no raw affiliate URL
exposed, resolution at click time, safe fallback — are met by the shape in use.

### 5.2 What actually differs

Only the **path token and its argument**: `/play/{game}` names a game; `/buynow/{code}` carries an opaque code.
The code form is strictly more capable — it can encode state, game, partner and campaign in one token without
leaking the partner — and `{game}` alone cannot express state-aware eligibility, which `CLAUDE.md` §13 requires.

### 5.3 [RATIFIED 2026-08-11] `FD-RTE-06` — keep `/buynow/{code}`; amend the approved pattern

Keep the live, robots-disallowed, already-implemented path. Amend `CLAUDE.md` §10's `/play/{game}` to
`/buynow/{code}`, recording that the code form was retained because it carries state-aware eligibility that a
bare game slug cannot, and because it is the live production contract.

**Risk of the alternative:** switching to `/play/{game}` needs a new robots rule, a new resolver, a redirect from
the live `/buynow/*`, and a token redesign — for no reader-visible or revenue benefit. **Evidence confidence:
high. Blocks Powerball/Mega Millions: no** — the inline resolver is already reused unchanged.

---

## 6. Per-route classification

`P` preserve · `I` introduce · `C` consolidate · `R` redirect · `A` archive/remove

| Route | Now | Class | Proposed canonical | Redirect | Sitemap | Internal links | Risk |
|---|---|---|---|---|---|---|---|
| `/` | live, indexed | **P** | self | none | keep | Home → flagships, states, results | Low |
| `/{state}` × 48 | live, indexed | **P** | self | none | keep | hub → its game pages | Low |
| `/fl/powerball` | live, indexed | **P** | self | none | keep | — | Low |
| `/fl/lotto`, `/fl/jackpot-triple-play` | live, indexed | **P** | self | none | keep | — | Low |
| `/fl/fantasy-5` | live, indexed, **one member** | **P + scope change** | self | none | keep | — | **Medium** — §3.5 |
| `/fl/pick-{2,3,4,5}`, `/fl/cash-pop` | **404** | **I** | self, once ungated | none | **excluded while guarded** | none yet | Low while guarded |
| `/ca/daily-3`, `/ca/superlotto-plus` | not in sitemap | **I** | self, once ungated | none | excluded | none | Low |
| `/{state}/{game}/{year}` × 8,700 | live, indexed | **P** *(until §3.4 stage 3)* | self | none yet | **keep — add the ~1,300 missing live years** | year navigation | **High if touched early** |
| `/fl/pick-3-{midday,evening}/{year}` × 52 | live, indexed | **C → R** *(staged)* | `/fl/pick-3/{year}` | **1:1, 301, later** | remove on cutover only | 52 inbound | **High** |
| `/fl/cash-pop-*/{year}` × 10 | live, indexed | **C → R** *(staged)* | `/fl/cash-pop/{year}` | 1:1, 301, later | as above | 10 | Medium |
| `/fl/pick-3/{year}` | **404**, guarded build | **I** | self | none | excluded while guarded | year nav | Low while guarded |
| `/fl/pick-3/{guides\|news\|blog}/{slug}` × 8 | guarded | **I** | self, non-`www` | none | excluded | 8 from the game page | Low |
| `/powerball`, `/mega-millions`, +3 | live, indexed | **P** | self | none | keep | — | Low — **not this task** |
| `/{state}/{year}/{month}/{day}` | live, **0 in sitemap** | **[UNKNOWN]** | — | — | **decide** | unknown | **Unquantified** — §10 |
| `/{state}/{game}/jackpotanalysis` | live, 0 in sitemap | **[UNKNOWN]** | — | — | decide | unknown | Unquantified |
| `/blog`, `/blog/{slug}` × 21 | live, indexed | **P** | self | none | keep | — | Low — two templates still open |
| Trailing-slash twin of everything | live, `200`, 0 in sitemap | **R** | unslashed form | **301, one hop** | n/a | n/a | **High if chained** |
| Case variants of everything | live, `200`, 0 in sitemap | **R** | lower-case | **301, one hop** | n/a | production emits them | **High** |
| `/buynow/{code}` | live, `302`, disallowed | **P** | none — never canonical | keep `302` | **never** | CTAs only | Low |

---

## 7. The 1:1 redirect plan for legacy archive URLs

**Not to be executed.** This is the specification the migration task would follow.

### 7.1 The rule

```
/{state}/{variant-game-slug}/{year}   →  301  →  /{state}/{family-game-slug}/{year}
```

**Year, jurisdiction and game family are preserved in every mapping. The drawing variant is preserved in the
destination as an in-page selection, never discarded.**

Worked, from the real inventory:

| Legacy URL | Destination | Variant carried by |
|---|---|---|
| `/fl/pick-3-midday/2023` | `/fl/pick-3/2023` | in-page filter, defaulting to *all drawings* |
| `/fl/pick-3-evening/2023` | `/fl/pick-3/2023` | same |
| `/fl/pick-3-evening/1988` | `/fl/pick-3/1988` | same — **Midday legitimately empty for 1988–2007** |
| `/fl/cash-pop-morning/2022` | `/fl/cash-pop/2022` | one of five |
| `/fl/pick-3-evening` | `/fl/pick-3` | hub → family hub |

### 7.2 Rules the plan must obey

1. **Never many-to-one.** No variant year may redirect to the family hub, to the newest year, or to Home.
   `CLAUDE.md` §10 forbids the last outright — and note that **production already violates the spirit of this**,
   sending `/fl/pick-3-evening/1985` to `/FL/pick-3-evening/2026`.
2. **Generate from `ARCHIVE_ELIGIBLE`.** A hand-written map of 8,700 rules will contain errors. Every mapping must
   be produced from the registry and asserted by test.
3. **A destination must exist and hold that year's data before its source is redirected.** No 301 to an empty
   year.
4. **One hop.** The redirect must emit the final canonical host, case and slash form directly.
5. **`301`, not `302`.** Production's out-of-range redirect uses 302; the migration must not copy that.
6. **Asymmetric years are a design input, not an exception.** Evening 1988–2007 has no Midday counterpart. The
   family page must state *"Midday drawings began in 2008"* rather than render an empty half.
7. **Reversible.** Keep the map as data so it can be inverted.

### 7.3 Volume

| Scope | 1:1 rules |
|---|---|
| Florida Pick 3 | **52** archives + 2 hubs |
| Florida Cash Pop | **10** archives + 5 hubs |
| **Florida pilot total** | **69** |
| Platform-wide, if extended | **on the order of 8,700** archives + up to 456 hubs |

**[RATIFIED 2026-08-11] `FD-RTE-07`:** author the generator and the pilot map. Execute Florida Pick 3 only. Measure a full
indexing cycle before the second family.

---

## 8. Sitemap index structure

### 8.1 Where things stand

- **Live:** one flat `<urlset>`, 9,246 URLs, 1.67 MB, every entry `<lastmod>`-tagged, newest archive year 2023.
- **Limits:** 50,000 URLs / 50 MB uncompressed. **Today's sitemap is within both** — an index is not yet
  *required*, it is *prudent*, and the staleness is the more urgent defect.
- **New application:** no `app/sitemap.ts`, no `robots.txt`; `sitemapEntries()` covers **State hubs only** and is
  unwired [REPO].

### 8.2 [RATIFIED 2026-08-11] `FD-RTE-08` — structure

```
/sitemap.xml                        (index)
├── /sitemaps/core.xml              Home, 48 state hubs, 5 global hubs, trust pages, tools     ~70
├── /sitemaps/games.xml             all /{state}/{game} hubs                                  ~456
├── /sitemaps/editorial.xml         /blog + /blog/{slug}, and game articles when ungated       ~21+
└── /sitemaps/archive-{state}.xml   one child per jurisdiction, /{state}/{game}/{year}      ~50–350 each
```

**Grouped by jurisdiction, not by year.** A result update touches one state's archive child; a per-year split
would touch 48 files for one draw. Largest jurisdiction today is `pa`/`tx` at 311 URLs — comfortable, and it
scales to a per-state-per-decade split if any child nears 50,000.

**Update strategy.** A result update refreshes `<lastmod>` on the game page, its state hub, the affected archive
year and Home where surfaced (`CLAUDE.md` §11). `<lastmod>` must be a real signal — `sitemapEntries()` already
omits it rather than inventing one, and that discipline must survive the expansion.

**Canonical eligibility — the gate.** A URL may enter a sitemap only if it is: `200`; canonical to itself; not
`noindex`; not robots-disallowed; and on the canonical host, case and slash form. This automatically excludes
every guarded preview route, every `/buynow/*`, every trailing-slash and case variant, and any variant URL that
has been redirected.

**Two live defects to fix regardless of any decision here:**

1. **The ~1,300 missing 2024–2026 archive URLs.** Live, `200`, and undeclared.
2. **`robots.txt` advertises `https://lotterycorner.com/sitemap.xml` (non-`www`) while all 9,246 entries are
   `www`.** Whichever host wins, these must agree.

---

## 9. Consequences for canonical tags, breadcrumbs, schema, navigation and links

| Surface | Where | Consequence |
|---|---|---|
| **Canonical tags** | `productionOrigin.ts` (non-`www`) vs `siteSchema.ts` `SITE_URL` (`www`) [REPO] | Two host forms in one repository. `FD-RTE-02` settles both at once. Until then the guarded pages emit **no** crawler-visible canonical, so nothing is currently wrong in production |
| **The archive emits no canonical at all** | `app/[state]/[game]/[segment]/page.tsx` [REPO] | Deliberate — synthetic review rows must not carry a production canonical. **On ungating this must become a self-referencing canonical**, or the archive ships as the one indexable page with no canonical signal |
| **Breadcrumbs** | `gamePageSchema.ts`, `stateHubSchema.ts` [REPO] | Under Model C the trail becomes Home → State → Game family → Year. Under Model A it stays Home → State → Variant game → Year. **The chosen model changes emitted `BreadcrumbList` on 8,700 pages** |
| **Schema** | `ItemList` for archives, `BreadcrumbList`, `WebPage` | `CLAUDE.md` §11 — schema reflects visible content only. A family page listing two variants must not emit an `ItemList` implying one drawing series |
| **Year navigation** | `adjacentArchiveYear`, `archiveYearNavigation` [REPO] | Already correct for this: *"previous"* is the nearest **registered** year, never `year - 1`, so the 1988–2007 Midday gap and any retirement gap are handled without generating dead links |
| **Internal links** | Game page → 8 articles, `#jg-03`, state hub, trust pages [LIVE, local] | Under Model C every internal link to a variant URL must be rewritten to the family URL **in the same release as the redirect** — a redirected internal link is a self-inflicted hop |
| **Grouped family presentation** | `config/states/{code}.json` `presentation.families` [REPO] | Single source for membership, shared by State and Game pages. Model C matches it exactly; Model A would need a second, variant-shaped presentation |
| **The `[segment]` constraint** | [REPO] | Year and editorial segment share one dynamic parameter. Any new route at that depth must extend the same discriminator |

---

## 10. Rollout order, validation and rollback

Five stages. **Each is independently valuable and independently reversible.** Nothing after Stage 1 is authorised
by this audit.

| Stage | Action | Validation | Rollback |
|---|---|---|---|
| **1. Canonical hygiene** *(no route change; do first)* | Self-referencing canonical on every public page. Fix the `robots.txt` host mismatch. Add the ~1,300 missing archive years | Canonical present and self-referencing on a sample of each family; `robots.txt` host matches `<loc>` host; new URLs return `200` | Remove the tag. Zero route risk |
| **2. Edge canonicalisation** | One Cloudflare rule: host + slash + case → canonical form, **301, one hop** | Re-run the §4.1 matrix — every variant must be exactly one hop to the canonical form; **assert no chain exceeds one hop and no loop exists**; sample 100 sitemap URLs for `200` | Disable the rule. Reversible in one action |
| **3. Sitemap index** | Split per §8.2; wire `app/sitemap.ts`; enforce the eligibility gate | Child sitemaps parse; every URL `200`, canonical-to-self, not `noindex`; totals reconcile against the registries | Restore the flat sitemap |
| **4. Pilot consolidation — Florida Pick 3 only** | Generate 69 1:1 rules from `ARCHIVE_ELIGIBLE`; rewrite internal links in the same release; **only after real archive data exists for 1988–2026** | Every one of the 69 resolves in one hop to a `200` **that contains that year's data**; no redirect to a hub, newest year or Home; family page states the 1988–2007 Midday gap honestly | Invert the map. **Checkpoint: hold here for a full indexing cycle** |
| **5. Platform-wide** | Extend the generator across all jurisdictions | As Stage 4, generated and asserted, per jurisdiction | Per-jurisdiction inversion |

**Rollback checkpoints:** after Stage 2 (before any URL changes meaning), after Stage 4 (before scale). **Stage 4
is the point of no easy return** — once 52 URLs have been reindexed under a new canonical, reverting costs a
second migration.

**Measurement gap.** No Search Console, analytics or backlink data was available. **Stages 4 and 5 must not
proceed without before/after impression, click and index-coverage data for the affected URLs.** That is
`FD-RTE-11`, and it is the largest single risk in this plan.

---

## 11. Founder decision table — RATIFIED

**All twelve are IN FORCE as of 2026-08-11.** The `Recommended` column below was the audit's recommendation and is
now the RULING in every row: the founder ratified the recommended option for each, unamended.

Two rulings carry a condition that survives ratification, and both are conditions on *doing*, not on the decision:

- **`FD-RTE-05`** is ratified as *"Model C, staged"* — which explicitly includes *"nothing today"*. Ratifying it
  authorises the model and the staging, not an immediate consolidation.
- **`FD-RTE-11`** is ratified as a **hard prerequisite**. Stages 4 and 5 of §10 may not proceed without
  before/after impression, click and index-coverage data. Ratification does not waive it; it makes it binding.

| # | Decision required | Recommended | Alternatives | Trade-offs | Confidence | Blocks PB/MM? |
|---|---|---|---|---|---|---|
| **`FD-RTE-01`** **· RATIFIED** | Canonicalise host, slash and case; emit self-referencing canonicals | **Yes — do the canonical tag now, the edge rule next** | Leave as is | ≥16 live duplicate URLs per page with no canonical, today. Tag is additive and reversible | **High** [LIVE] | **YES** — new pages inherit this |
| **`FD-RTE-02`** **· RATIFIED** | Canonical host: `www` or non-`www` | **Stay on `www`** | Move to non-`www` per the recorded target | 9,246 indexed URLs are `www`; moving redirects the whole corpus for no reader benefit. Recommending this **reverses `CLAUDE.md` §11 and `productionOrigin.ts`** | **High** on evidence, **founder call** on direction | **YES** |
| **`FD-RTE-03`** **· RATIFIED** | Reconcile `productionOrigin.ts` (non-`www`) with `siteSchema.ts` (`www`) | Follow `FD-RTE-02`; single constant | Keep both | Two host forms in one repo will leak into a canonical eventually | High | YES |
| **`FD-RTE-04`** **· RATIFIED** | Fix `robots.txt` sitemap host mismatch | Yes, with `FD-RTE-02` | Leave | Production contradicts itself today | **Certain** [LIVE] | No |
| **`FD-RTE-05`** **· RATIFIED** | Conflict 23 — family vs variant archive model | **Model C, staged; nothing today** | A (variant only) · B (both indexed) | A discards approved work; **B is a known duplicate-content hazard**; C needs 62 Florida redirects and real data first | High on facts, **medium** on outcome | **YES** — settles the shared archive shape |
| **`FD-RTE-06`** **· RATIFIED** | Conflict 14 — `/play/{game}` vs `/buynow/{code}` | **Keep `/buynow/{code}`; amend `CLAUDE.md` §10** | Migrate to `/play/{game}` | Live, robots-disallowed, implemented, and the only form that carries state-aware eligibility | **High** | No |
| **`FD-RTE-07`** **· RATIFIED** | Authorise the 1:1 redirect generator + Florida pilot | Yes — **author and review; do not execute** | Defer entirely | Generating from `ARCHIVE_ELIGIBLE` is the only safe way to reach 8,700 rules | High | No |
| **`FD-RTE-08`** **· RATIFIED** | Sitemap index structure | **Per-jurisdiction archive children** | Per-year · flat | Per-year touches 48 files per draw; flat is within limits but stale by 3 years | High | No |
| **`FD-RTE-09`** **· RATIFIED** | Add the ~1,300 live 2024–2026 archive URLs | **Yes** | Leave | Live `200` pages undeclared for three years. Pure gain, no route change | **High** [LIVE] | No |
| **`FD-RTE-10`** **· RATIFIED** | `/fl/fantasy-5` — expand an indexed single-member URL to a family page | **Decide separately from `FD-RTE-05`** | Treat as consolidation | **Not** a consolidation: `/fl/fantasy-5-midday` has 0 sitemap entries. It changes what an indexed URL shows | **High** [REPO] | No |
| **`FD-RTE-11`** **· RATIFIED** | Obtain Search Console / analytics / backlink data before Stages 4–5 | **Yes — hard prerequisite** | Proceed without | The only unmitigated risk. `CLAUDE.md` §10 requires traffic and backlink evidence for any route change | — **[UNKNOWN]** | No, but blocks migration |
| **`FD-RTE-12`** **· RATIFIED** | Classify `/{state}/{year}/{month}/{day}` and `/{state}/{game}/jackpotanalysis` | **Scope a follow-up audit** | Ignore | Two live families with **0 sitemap representation** and unmeasured traffic | **[UNKNOWN]** | No |

### Corrections to governance records — APPLIED 2026-08-11

1. **`CLAUDE.md` §10** — *"Next.js already applies a default trailing-slash 301."* Measured: **`308`**.
2. **`CLAUDE.md` §10** — *"approved pattern is `/play/{game}`"* — see `FD-RTE-06`.
3. **`CLAUDE.md` §11 / `productionOrigin.ts`** — the non-`www` target predates the finding that all 9,246 indexed
   URLs are `www`; `FD-RTE-02` invites a reversal.

*Findings 2 and 3 were APPLIED to `CLAUDE.md` on 2026-08-11 under the ratifying instruction — see the amendment
table in the status block at the head of this document. Finding 1 (the `308`, not `301`) is a factual correction to
§10's wording and is applied with them.*

### What this audit did not determine — [UNKNOWN]

- Which layer implements HTTP→HTTPS, case-insensitivity and the out-of-range-year redirect. No Cloudflare or
  Apache configuration access.
- Traffic, impressions, backlinks or revenue for any URL. No Search Console or analytics access.
- Whether Cloudflare, WAF or bot protection blocks approved crawlers (`CLAUDE.md` §11).
- Exact live archive reach for all 456 pairs — sampled on Florida Pick 3 only; ~1,300 is an extrapolation.
- Purpose and traffic of the date-based and `jackpotanalysis` families.
- Whether Apache serves anything Cloudflare does not.
