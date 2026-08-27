# Yearly History Page Expansion — Capability Audit and Implementation Brief

**Task:** LRG-ARCHIVE-056 (audit only) · **Route under review:** `/fl/pick-3/2026` · **Status:** awaiting founder
approval of the capability boundary. **No code changed. Nothing committed or pushed.**

Covers AI, community, editorial, calendar, analytics, downloads and signed-in continuity for the Yearly History
Page. Every classification below was reached by tracing the complete flow and persistence path — never from a card,
label, fixture, test or blueprint reference.

> ### ⚠ SUPERSEDED IN PART — 2026-08-06 (`DATA-DEC-001`, task LRG-ARCHIVE-059)
>
> This audit's **§4 placement of Ask and downloads as public**, and recommendations **R2** and **R3**, were
> accepted on August 5 and implemented in `LRG-ARCHIVE-057`. The founder decision of **August 6** reverses that
> part: *"This supersedes the earlier ruling that AI/Ask and public-result downloads operate publicly."*
>
> **Now Account-gated:** Ask/AI execution (`FD-DAT-02`) · full-year CSV, filtered CSV and any
> LotteryCorner-provided bulk print or export (`FD-DAT-01`).
> **Still public and unchanged:** results, tables, calendar and agenda, statistics, the advanced analytics
> workspace, articles, sources, and ordinary browser printing (`FD-DAT-08`, `FD-DAT-09`).
>
> Because no sign-in flow exists, those surfaces were **removed rather than disabled** (`FD-DAT-16`,
> `FD-DAT-17`). The rest of this audit — the tracing, the readiness matrix, the phase plan and every other
> recommendation — stands. Superseded passages are marked in place; nothing has been rewritten to hide what was
> found and recommended on August 5.
>
> Operative record: `03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md`.

---

## 1. Current Git and archive state

| | |
|---|---|
| Branch | `main` |
| HEAD | `f8e3061` — *added history and game pages* |
| `origin/main` | `f8e3061` — **identical** |
| Ahead / behind | **0 / 0** |
| Working tree | 1 modified (`03-docs/08-decisions/source-conflicts.md`), 5 untracked (all `03-docs/**` records plus `AGENTS.md`) |

**HEAD moved since the last session.** The archive and Game Page work was committed and pushed by the founder as
`f8e3061`. Verified against the committed tree:

- Type-check exit 0; **827 tests pass, 0 fail** (173 suites).
- Every LRG-ARCHIVE-055 correction survives: `AR_ORDER` still begins `AR-01, AR-04, AR-06, AR-05` (search above
  results), `AR_ORDER_BLUEPRINT`, `isGenuineCorrection`, `lastUpdatedIso`, `hasPublishedCorrection`,
  `archiveYearNavigation` and `encodeCarriedFilter` are all present.
- All nine archive source files are tracked.

**No prior archive correction has been lost.**

---

## 2. Platform capability inventory — traced, not inferred

### 2.1 The dependency baseline

`01-new-ui/package.json` runtime dependencies are **`next`, `react`, `react-dom`** and nothing else. No auth
library, no database client or ORM, no CSV or PDF library, no chart library, no AI provider SDK, no mail or push
service. Every capability below is therefore either already hand-built in this repository or absent.

### 2.2 Authentication and session handling — **ABSENT**

| Probe | Result |
|---|---|
| Auth library in dependencies | **none** (no next-auth, clerk, lucia, iron-session, passport) |
| `middleware.ts` | **does not exist** |
| `next/headers` (cookies/session) usage | **0 files** |
| `/signin`, `/login`, `/register`, `/account`, `/members` routes | **0** |
| API route handlers | exactly one: `app/buynow/[code]/route.ts` (the affiliate resolver) |

**The shell's Login and Register buttons are `disabled`.** `components/account/AccountHooks.tsx` renders them with
`disabled` and `title="Login coming in a later phase"`, and exports a `FavoriteStar` with
`aria-label="Save … to favorites (coming soon)"`. `lib/layout/shellCapabilities.ts` documents them as
*"Login and Register entry points. No auth exists."*

There is **no authentication of any kind**: no identity, no session, no cookie, no return-to mechanism.

### 2.3 Persistence — **ABSENT in the new UI, MODELLED in production**

`02-new-api` is **empty** (0 entries). No database client. `localStorage`/`sessionStorage` appears in 4 files and
none of it is user persistence — `StateRememberDevice` (a device-only state preference, explicitly labelled as
such), `StateStickyFooterAd` (session-scoped dismissal), and `GameSaveControls`, whose header records that a real
`localStorage` "save on this device" control was **removed** in LRG-GAME-051 because it implied an account.

**But production already models all of it.** `04-sample-data/reference-tables/schema-only.sql` — 37 tables:

| Table | Columns of interest | Maps to |
|---|---|---|
| `insider_user` | `INSIDER_ID, EMAIL, PASS_WORD, IS_VERIFIED, LAST_LOGINDATE, ACCESS, EXPIRE_DATE, DEFAULT_STATE, DOB` | Credential authentication |
| `reset_id` | `INSIDER_ID, UID, UID_EXPIRE_DATE` → FK `insider_user` | Password reset with expiry |
| `pepper` | — | Password peppering |
| `favourite_game` | `GAME_ID` → FK `game.ID`, `USER_ID` → FK `insider_user` | **Follow this game** |
| `lucky_numbers` | `LUCKY_NUMBERS_ID, INFO, LUCKY_SYSTEM` | **A saved number set** |
| `lucky_numbers_list` | `LUCKY_NUMBERS_ID, ORDER_ID, NUMBER` | The set's values, **ordered** |
| `lucky_numbers_match` | `LUCKY_NUMBERS_ID, ORDER_ID, RESULT` | **Historical matches** |
| `lucky_numbers_tracker` | `GAME_ID, DRAW_TIME, RESULT, PRIZE, DRAWN, LUCKY_NUMBERS_ID` | **Match-on-new-result notification** |
| `insider_subscription` + `subscription_definition` | `INSIDER_ID, subscription_id, STATUS` | The paid tier |

Two consequences worth stating plainly:

1. **My Number Sets is not greenfield.** Production already models ordered saved sets, their historical matches and
   a per-draw tracker. `lucky_numbers_list.ORDER_ID` means exact-order matching was always the intent — which
   matches the archive's own declared `matchOrdered` semantics exactly.
2. **`favourite_game.GAME_ID` references `game.ID`** — the same production game id the archive already carries as
   `332` (Midday) and `333` (Evening). Following is per-member, not per-family, in production.

### 2.4 **The blocking finding: every user table hangs off the Insider (paid) account**

```
favourite_game.USER_ID       → insider_user.INSIDER_ID
reset_id.INSIDER_ID          → insider_user.INSIDER_ID
insider_subscription.INSIDER_ID → insider_user.INSIDER_ID
```

There is **no free-account table**. In production the only user identity is `insider_user`, and
`CLAUDE.md` §16 states:

> **MUST NOT implement** Member/Insider routes, paid tiers, quotas, exports, ticket records, public badges,
> Insider ad treatment, or promotional pauses until those decisions close.

`03-docs/08-decisions/source-conflicts.md` Conflict 3 records **12 Part 22 decisions, 11 still OPEN**, and names
the intersections: decision 1 touches the `/insider` route, **decision 3 touches ad treatment, decision 7 touches
export rights**.

So the entire signed-in programme currently rests on an entity governance blocks. **This is the one decision that
unblocks everything else**, and §5 proposes the narrowest way through it.

### 2.5 AI — **deterministic engines exist; no provider**

| | |
|---|---|
| Provider SDK | **none** |
| `lib/archive/archiveAsk.ts` | Deterministic interpreter + grounded answer. Recognises month, variant, number, order mode, shape phrases. Returns `understood: false` rather than guessing |
| `lib/state/stateAiPreview.ts` | Deterministic State answers computed from the page's own governed data |
| `components/state/preview/StateAiSurface.tsx` | Suggested-question surface; states it *"holds no live model"* |

The Ask surface is genuinely functional within its vocabulary and answers only from registered archive data. Every
count comes from `filterArchive`, asserted by test.

### 2.6 Forum / community — **ABSENT everywhere, including production**

| Probe | Result |
|---|---|
| `app/community` route | **does not exist** |
| Forum lib modules / components | **0** (only `StateDiscussLink`, which links to an in-page `#anchor` and documents that `/community` is unimplemented) |
| Forum, topic, reply, comment, post, thread tables in production | **0 of 37** |

There is no forum: no route, no model, no data, and — unlike saved numbers — **no production precedent to migrate
from**. `/community` and `/community/{slug}` are approved blueprint routes with no implementation anywhere.

### 2.7 Articles / editorial — **REUSABLE NOW**

| | |
|---|---|
| Route | `app/[state]/[game]/[segment]/[slug]/page.tsx` — **live and guarded**, 200 today |
| Inventory | **8 real articles** across 11 game configs, all Pick 3 |
| Metadata per item | `kind` (`News` \| `Guides` \| `Blogs`), `slug`, `title`, `summary`, `body`, `effectiveDate`, `reviewedDate`, `sources` |
| Selection helper | `lib/game/gameEditorial.ts` — `editorialSections`, `findArticle`, `articleRoutes`, `articleDateLine` |
| Already on the archive | AR-09 renders News, Guides and Blogs with real hrefs |

Production also has `blog_entry`, `news_entry`, `review_entry` and `note_entry` tables, so the eventual content
pipeline exists. **Gap:** no `archiveYear` or topic tag on an editorial item, so year-specific selection
(*"rule changes affecting 2021"*) cannot be expressed yet — a small, additive extension.

### 2.8 Analytics — **REUSABLE NOW**

`lib/game/digitHistoryAnalysis.ts` already computes, generically and with tests: `positionFrequency`,
`pairFrequency`, `shapeDistribution`, `sumDistribution`, `consecutiveSummary`, `repeatFromPrevious`,
`historicalGaps`, `variantComparison`, `coverageOf`, plus `STATISTICS_NEUTRALITY` and `assertNeutralLanguage`
(which fails the build on `hot`/`cold`/`due`/`overdue`/`best`/`most likely`).

**Every one of the eight advanced analyses the brief lists is already computed** — `historicalGaps` and
`consecutiveSummary` are computed today and not yet surfaced. No chart library: visualisation is a CSS bar beside a
figure in text, which is the accessible pattern already in use.

### 2.9 Downloads — **ABSENT**

No CSV or PDF library, **0** files using `createObjectURL`, `text/csv`, `application/pdf` or a `download`
attribute, and **0** `@media print` rules in `globals.css`. Nothing exists. Note also that export rights are
unapproved (blueprint §17) and **Part 22 decision 7 — export rights — is one of the open decisions**.

### 2.10 Calendar — **ABSENT**

No calendar or agenda component. The only date-grid arithmetic is `daysInMonth` in
`lib/archive/archiveReviewFixture.ts` (a correct Gregorian leap-year rule), which is reusable as a primitive.

### 2.11 Result detail — **ABSENT**

No panel, drawer, dialog or expandable row. Rows are static `<tr>`; the LRG-ARCHIVE-055 pass deliberately removed
the per-row `Details` link because it went to a section rather than to a detail.

### 2.12 Notifications — **ABSENT**

**0** files referencing `ServiceWorker`, `PushManager`, `Notification()`, `nodemailer` or any mail transport. No
service worker, no manifest, no email. `alertOptionsFor` in `gameReviewFixture.ts` returns options with
`available: false` — a description, not a mechanism. Production's `lucky_numbers_tracker` shows where match
detection would live, but there is no delivery channel anywhere.

---

## 3. End-to-end readiness matrix

Classification: **① Reusable now** · **② Small extension** · **③ New platform capability** · **④ Keep hidden**

### Public capabilities

| Capability | Class | Evidence and what is missing |
|---|---|---|
| Results table, year + month navigation, search and filters | **①** | Live, tested, server-rendered |
| Basic statistics (the four primary) | **①** | Live |
| Ask the Archive — grounded answer | **①** | Live and deterministic |
| Ask: "when did 1-2-3 appear in exact order" | **①** | Already parsed |
| Ask: "digits in any order" | **①** | Already parsed |
| Ask: "compare Midday and Evening" | **②** | Comparison is computed (`variantComparison`); the parser does not recognise a *comparison* question — it needs one intent and a table-shaped answer |
| Ask: "which month had the most repeated digits" | **②** | Per-month shape counts are computable; needs a month-aggregate intent |
| Ask: "show the rows supporting this answer" | **①** | Every answer already carries rows and evidence anchors |
| **Calendar / mobile agenda view** | **②** | No component, but everything it needs exists: `daysInMonth`, month keys, rows grouped by date, and `filterArchive` for shared filters. Purely presentational — **the largest safe public win** |
| Result detail (compact) | **②** | New disclosure component over data already on the row |
| Advanced analytics workspace (7 of 8 analyses) | **②** | All computed already; needs a workspace surface and a custom-range control |
| Comparison of registered years | **④** | Blocked by data, not by code: **one year is registered**. Cannot work end to end |
| Saved-number performance against the archive | **②** *(anonymous)* / **③** *(saved)* | Running a typed set against the archive works today; *saving* it needs auth |
| Related guides and articles | **①** | 8 real articles, live routes, real metadata |
| Article selection by archive year / topic | **②** | Needs `archiveYears?` and `topics?` on the editorial item |
| Forum **reading** | **③** | No route, no model, no data, no production precedent |
| Sources and methodology | **①** | Live (AR-10) |

### Account-enabled capabilities

Every row here depends on §2.4. Under the refined rule — *a signed-out user may see and click a capability only
when it works end to end* — **none may render until authentication, persistence and return exist.**

| Capability | Class | Blocking dependency |
|---|---|---|
| Sign-in / registration | **③** | No auth of any kind. Plus the §2.4 Insider entanglement |
| Sign-in-and-return contract | **③** | Depends on auth; the archive half (state capture) is **②** — `encodeCarriedFilter` already captures most of it |
| Follow this game | **③** | Auth + persistence. Production model exists (`favourite_game`) |
| Save a number set | **③** | Auth + persistence. Production model exists (`lucky_numbers` + `_list`) |
| Historical match for a saved set | **②** *after* persistence | The matching engine is live and tested; only storage is missing |
| Save this search | **③** | Auth + persistence. `CarriedFilter` is already the exact payload |
| Save an Ask answer | **③** | Auth + persistence |
| Remember table/calendar preference | **③** | Auth + persistence (device-only storage was deliberately removed once) |
| Result-match alert | **③** | Auth + persistence + **a delivery channel that does not exist in any form** |
| Downloads — year CSV, filtered CSV | **②** | Genuinely small: rows are in memory, a CSV is a string and a Blob. **But** export rights are unapproved and Part 22 decision 7 is open |
| Printable PDF | **②** | `@media print` over the existing HTML. No PDF library needed |
| Saved-number match report | **③** | Depends on saved sets |
| Forum posting, replies, reactions, reporting | **③** | Everything the forum needs, plus auth |
| `Discuss this finding` prefilled composer | **④** | Requires the forum flow to exist first |

---

## 4. Recommended signed-out versus signed-in boundary

**Signed-out — everything that is a lottery fact or a calculation over it:**

results · year and month navigation · search and all filters · table **and calendar** views · the four primary
statistics · **the whole advanced analytics workspace** · at least one grounded Ask answer and any follow-up
question · running an ad-hoc number set against the archive · year CSV and filtered CSV · printable view · related
articles · sources and methodology · forum reading when a forum exists.

Two deliberate placements:

- **Advanced analytics stays public.** It is arithmetic over public results, it is already computed, and gating it
  would put authentication in front of basic lottery information. It belongs in a workspace for *length*, not for
  entitlement.
- ~~**Downloads of public result data stay public.**~~ **SUPERSEDED by `DATA-DEC-001` `FD-DAT-01`, 2026-08-06.**
  The recommendation read: *"A CSV of published winning numbers is the same public fact the page already renders;
  gating it buys no continuity value and invites the perception that we are charging for public information."* The
  founder ruled otherwise. The distinction the audit missed is between **reading a fact** and **taking the whole
  dataset**: the page still shows every row free and crawlable (`FD-DAT-08`), and the perception risk the audit
  raised is answered by `FD-DAT-06`, which forbids attaching any plan, offer, upgrade, trial or payment to the
  gate. The Account is free.
- ~~Ask the Archive listed above as an anonymous capability.~~ **SUPERSEDED by `FD-DAT-02`.** AI/Ask *execution*
  is Account-gated, because an anonymous invocation cannot be metered against the nine `FD-DAT-12` fields.

**Signed-in — only continuity, never truth:**

follow a game · save a number set and see its match history · save a search · save an Ask answer · remember the
view preference · result-match alerts · saved-number reports · cross-year comparison once a second year exists ·
posting, replying, reacting.

This is exactly the Constitution's rule — *"An account unlocks continuity, not truth"* — and nothing above moves a
public fact behind a login.

---

## 5. The one decision that unblocks the programme

Production's only user identity is `insider_user`, the **paid** account, and §16 blocks Insider implementation
pending 11 open decisions. Three ways forward:

| Option | Assessment |
|---|---|
| **A.** Treat `insider_user` as the account table and add a free tier | Requires closing several Part 22 decisions; entangles a free sign-in with paid-tier questions (quotas, exports, ad treatment) that have nothing to do with following a game |
| **B. RECOMMENDED — define a free `Account` entity; Insider becomes a subscription *on* an account** | Needs **one narrow founder ruling**: *a free account is not an Insider.* Free continuity (follow, saved sets, saved searches) attaches to `Account`; `insider_subscription` continues to describe the paid tier. Cleanly separates §16's open questions from ordinary sign-in, and is better architecture regardless — production's conflation of identity with subscription is a constraint to migrate away from, not to reproduce |
| **C.** Defer all signed-in work until Part 22 closes | Honest but stalls the founder's stated retention priority behind 11 decisions, most of which are about paid features |

**Recommendation: B**, with the ruling requested as decision R1 in §13. It does not implement any Insider
capability, so §16 is respected as written.

---

## 6. Proposed History Page section structure

The founder's target order maps onto the existing `AR-xx` contract with **no new section ids** except the view
switch, which belongs inside AR-05 rather than becoming a section of its own.

| # | Founder's target | Section | Change |
|---|---|---|---|
| 1 | Archive title and year navigation | **AR-01** | unchanged |
| 2 | Month navigation | **AR-04** | unchanged |
| 3 | Search and filters | **AR-06** | unchanged |
| 4 | `Table \| Calendar` switch | *inside* **AR-05** | **new control** — a view switch is a property of the results, not a section; making it one would put a two-button toolbar between the filters and the data |
| 5 | Results | **AR-05** | gains the calendar view |
| 6 | Ask the Archive | **AR-03** | already holds it after LRG-ARCHIVE-055 |
| 7 | Statistics and advanced analysis | **AR-07** | four primary open; advanced workspace behind disclosure |
| 8 | Personal archive tools | **AR-08** | **currently suppressed** — this is its purpose. Renders **only** when at least one action works end to end |
| 9 | Community discussion | **AR-09a** | hidden until a forum exists |
| 10 | Related guides and articles | **AR-09b** | already live |
| 11 | Sources and methodology | **AR-10** | unchanged |

**AR-02** (the fuller year summary) and **AR-11** (Continue) become candidates for removal: AR-02 is now largely
redundant against the concise summary plus the statistics section, and AR-11's remaining actions duplicate the year
navigation and the search anchor. Recommended for founder decision R5.

**Compactness rule.** Base page = navigation, search, results, four statistics, articles, sources. Everything else
opens in a disclosure, a panel or a dedicated workspace. Target: **no more than ~18 mobile screens**, the length
achieved by the correction pass.

---

## 7. Interaction design

### Table ↔ Calendar

- **Desktop:** a two-button segmented control above the results, `aria-pressed`, the current view reflected in the
  results region's `aria-label`. Calendar is a 7-column month grid; each date cell lists its drawings as
  `Midday 3 · 7 · 8` / `Evening 5 · 6 · 9` with `Fireball: 9` in smaller type beneath — the same treatment the
  table now uses, so the two views cannot disagree about what a Fireball is.
- **Mobile (390 px):** a 7-column grid is unreadable at this width, so the calendar becomes an **agenda** — a
  date-grouped vertical list, one date heading per day with its drawings beneath. Same data, same filters, no
  horizontal scroll.
- **Empty dates** read as *"No drawing"* in muted text — never a blank cell, a dash or an error tone. A day with no
  drawing is a fact about the schedule, not missing data.
- **Shared filters:** both views render from the same `filterArchive` result, so switching never changes the set.
- **Server-rendered:** the **table remains the server-rendered default**, because it is the crawlable form and
  Template J requires the rows in the initial HTML. The calendar is a client enhancement over the same rows.

### Result detail

A native `<details>` per row on mobile and a right-hand panel on desktop, both driven by one component. Contents:
the drawing's own values, its pattern and sum, its published status, and — only when a forum exists — a
drawing-specific discussion link. **No per-row action cluster returns**; the correction pass removed 156 links and
nothing here reinstates them.

### Advanced analytics workspace

One `<details>` — *"Advanced analysis"* — inside AR-07, containing position frequency, pair frequency,
consecutive-digit patterns, monthly comparison, custom date range and historical gaps. Each view keeps the
mandatory `period / variants / drawCount / method` line. `historicalGaps` needs its label chosen carefully: *"drawings
since this value last appeared"* is descriptive; *"overdue"* is forbidden and `assertNeutralLanguage` will fail the
build on it.

### Personal archive tools

One compact `AR-08` block, rendered **only** if `personalToolsAvailable` is true — which is false until auth,
persistence and return all exist. No "Coming soon", no disabled control. Each action carries a one-line benefit
statement, shown before sign-in is requested.

---

## 8. Sign-in-and-return state contract

### The captured state

```
ArchiveIntent {
  returnPath   "/fl/pick-3/2026"        internal, allowlisted, no query string
  view         "table" | "calendar"
  monthKey     "2026-03" | null
  filter       CarriedFilter            number, match mode, variant, pattern, sum band, sort
  selectedRow  "draw-332-2026-07-09" | null
  action       "followGame" | "saveNumberSet" | "saveSearch" | "saveAnswer" | "compareYears" | "createAlert"
  actionPayload  small, non-sensitive, action-specific
  section      "#ar-08"
  issuedAt / expiresAt
  nonce
}
```

**`CarriedFilter` already exists** (`lib/archive/archiveFilterCarry.ts`) and already encodes the filter half of
this. The archive contribution is therefore an extension, not new work.

### Where it lives, and why not the URL

Server-side, in a short-lived signed store keyed by a nonce in an `HttpOnly` cookie. **Not the URL** — the brief
forbids sensitive data in URLs and indexable filter combinations, and blueprint §31 forbids a crawl trap. The
existing fragment mechanism is fine for a filter a human carries between years, but an *action intent* is
security-relevant and belongs server-side.

### The flow

1. Reader clicks a gated action → a compact inline prompt states the benefit and that sign-in is needed.
2. On confirm, the intent is stored and the reader is sent to `/signin?rt=<nonce>` — **a nonce, never a path**.
3. After sign-in or registration, the nonce resolves to the intent.
4. `returnPath` is validated against an **allowlist of internal archive routes** built from `ARCHIVE_ELIGIBLE` and
   the game registry. A path that is not a registered archive route is rejected and the reader lands on the game
   page instead. No open redirect is possible because no caller-supplied URL is ever followed.
5. The archive re-renders, restores view, month, filter and selection, and **automatically continues the action**.
6. **Cancelling returns to the same archive state**, action discarded.

### Security requirements, addressed

| Requirement | How |
|---|---|
| Allowlist internal destinations | `returnPath` matched against the archive registry; anything else falls back |
| Prevent open redirects | Only a nonce crosses the boundary; no URL is accepted from a caller |
| No sensitive data in URLs | `?rt=<nonce>` only |
| No indexable filter combinations | Intent is server-side; the archive page emits no filtered links |
| Expiry and validation | `expiresAt` (recommend **15 minutes**), single-use nonce, action re-authorised against the signed-in user before it runs |
| Cancel path | Intent dropped, reader returned to the same state |

**One caution to record:** auto-continuing an action after sign-in must never perform something *irreversible or
outward-facing* without a further confirmation. Following a game and saving a set are safe to auto-continue;
anything that publishes — a forum post — must land the reader in a composer, never post on their behalf.

---

## 9. Security and SEO risks

| Risk | Severity | Mitigation |
|---|---|---|
| Open redirect via a return parameter | **High** | Nonce-only; allowlist from the registry |
| Intent replay | Medium | Single-use nonce + 15-minute expiry + re-authorisation |
| A calendar or view state creating indexable URLs | Medium | View, month and filter stay out of the query string; the table remains the crawlable default |
| Forum content creating thin or spam-indexable pages | **High** *(if built)* | Out of scope until the forum exists; needs its own indexation policy |
| Editorial pages that merely restate archive statistics | Medium | The brief forbids it; only real articles with real bodies and sources |
| A download endpoint becoming a crawl surface | Medium | `noindex` headers on any generated file; no crawlable links to parameterised exports |
| Calendar client-only rows | **High** if mishandled | The table stays server-rendered; the calendar never becomes the only source of rows |
| Saved-number data in a URL or a log | **High** | Server-side only; a number set is personal data and must never enter analytics or a redirect store |
| Personalised content weakening the cached public page | Medium | Personal sections render client-side after hydration, or on a separate authenticated route |

---

## 10. Files likely to be reused, modified or created

**Reused unchanged:** `digitHistoryAnalysis.ts` (all eight analyses) · `archiveFilter.ts` · `archiveAsk.ts` ·
`archiveRegistry.ts` · `archiveYear.ts` · `archiveFilterCarry.ts` · `gameEditorial.ts` · `StateBallGroup` ·
`gamePreviewGuard.ts` · `assertNeutralLanguage`.

**Modified:** `archiveContract.ts` (view mode, calendar groups, analytics workspace, personal-tool availability,
intent) · `archiveModel.ts` (calendar grouping, advanced views, AR-08 gating) · `ArchiveView.tsx` (view switch,
calendar, result detail, AR-08) · `ArchiveWorkspace.tsx` (comparison and month-aggregate Ask intents) ·
`globals.css` (`lca-` additions) · `archive-page.test.ts`.

**Created:** `components/archive/ArchiveCalendar.tsx` · `ArchiveAgenda.tsx` · `ArchiveResultDetail.tsx` ·
`ArchiveAnalyticsWorkspace.tsx` · `lib/archive/archiveCalendar.ts` · `archiveDownload.ts` (CSV builder) ·
`archiveAnalytics.ts` (advanced view assembly).

**Created only after the §5 ruling:** `lib/account/*` (account contract, session, intent store, return allowlist) ·
`app/signin/**` · `components/archive/ArchivePersonalTools.tsx` · `lib/archive/archiveIntent.ts`.

**Not touched:** every Game Page, State, Home, footer and article file; `02-new-api`; all legacy paths.

---

## 11. Recommended implementation phases

**Phase 1 — Public engagement (no auth, no new dependency).** Calendar + mobile agenda; result detail; advanced
analytics workspace; the two new Ask intents (Midday-vs-Evening comparison, month-with-most-repeats); article
selection by year and topic; year CSV, filtered CSV and a printable view. *Delivers most of the founder's list and
needs no platform decision.*

**Phase 2 — Account foundation.** Only after the §5 ruling. Free `Account` entity, session, sign-in and
registration routes, the intent store, the return allowlist. **No archive UI changes** — this phase is the platform
capability, proven by tests and one non-archive consumer.

**Phase 3 — Personal archive tools.** AR-08 appears for the first time: follow, save a number set, save a search,
save an Ask answer, remember the view. Each ships only when its full round trip works.

**Phase 4 — Alerts, reports and cross-year.** Result-match alerts (needs a delivery channel — the largest single
build), saved-number match reports, custom-range reports, and year comparison **once a second year is registered**.

**Sequencing note:** Phase 1 is independent of every open founder decision and can start immediately on approval.
Phases 2–4 are strictly ordered.

---

## 12. Features that must remain hidden

| Feature | Until |
|---|---|
| Every account-enabled action | Auth + persistence + return all exist (Phase 2 complete) |
| Compare years | A second archive year is registered — **blocked by data, not code** |
| Community discussion, `Discuss this finding` | A forum route, model and moderation policy exist |
| Result-match alerts | A delivery channel exists in any form |
| Saved-number and custom-range reports | Saved sets persist |
| Anything Insider or paid | Part 22 closes (§16) |

And a correction to the earlier instruction: **hidden now means absent, not disabled.** The refined rule permits a
signed-out user to *see and click* a capability only when the whole round trip works — so a capability whose round
trip does not exist must not be drawn at all.

---

## 13. Conflicts and founder decisions required

### Conflicts with approved sources

1. **§16 versus the founder's signed-in direction (HIGH).** Production's only identity is `insider_user`; §16
   blocks Insider implementation pending 11 open Part 22 decisions. §5 option B is the narrowest resolution.
2. **The shell already ships disabled controls the refined rule forbids.** `AccountHooks.tsx` renders `disabled`
   Login and Register with *"coming in a later phase"* and a `FavoriteStar` labelled *"(coming soon)"*, in the
   accepted Global Shell. This directly contradicts *"Never display disabled, 'Coming soon,' or non-functional
   roadmap cards."* **Not changed in this audit** — it is founder-owned shared shell work outside this task. It
   needs either removal or a real destination.
3. **Blueprint §6 order** is already overridden by the founder's correction pass; the target structure continues
   that. Recorded, with `AR_ORDER_BLUEPRINT` retained for diffing.
4. **Blueprint §17 export access tiers** (public print/copy, signed-in filtered export, Insider full export)
   versus the §4 recommendation that public-result CSVs stay public. **RESOLVED 2026-08-06 in favour of §17's
   middle tier**, by `DATA-DEC-001`: provided export requires a free Account (`FD-DAT-01`), ordinary browser
   print/copy stays unrestricted (`FD-DAT-09`), and the Insider full-export tier remains untouched because Part 22
   decision 7 is still open. The audit's own recommendation lost.
5. **Part 22 decision 7 (export rights) is open**, so §17's export tiers cannot be settled until it closes — which
   is a further reason to keep Phase 1 downloads limited to public result data with clear provenance.

### Decisions requested

| # | Decision |
|---|---|
| **R1** | **Approve a free `Account` entity distinct from `insider_user`** (§5 option B), so ordinary sign-in is not an Insider implementation. *Blocks Phases 2–4.* |
| **R2** | ~~Approve **Phase 1 as public and unauthenticated**, including the calendar, the advanced analytics workspace and public CSV/print.~~ **Accepted Aug 5; PARTLY REVERSED Aug 6** — the calendar, agenda and analytics workspace remain public (`FD-DAT-08`); CSV/print became Account-gated (`FD-DAT-01`) and were removed (`FD-DAT-16`). |
| **R3** | ~~Confirm **public downloads of public result data**, with sign-in reserved for personal reports.~~ **DECLINED Aug 6** — `DATA-DEC-001` `FD-DAT-01` gates provided downloads behind a free Account; `FD-DAT-14` additionally forbids any unrestricted public CSV/API endpoint. |
| **R4** | Rule on the **disabled shell Login/Register and FavoriteStar** (conflict 2): remove, or give them a real destination in Phase 2. |
| **R5** | Approve **removing AR-02 and AR-11** as redundant against the concise summary, the statistics section and the year navigation. |
| **R6** | Confirm the **forum stays out of scope** until it has a route, a model and a moderation policy — there is no production precedent to migrate. |
| **R7** | Confirm **15 minutes** and single use for the intent, and that auto-continue never publishes on a reader's behalf (§8). |

---

## 14. Implementation brief for approval — Phase 1

**Task:** LRG-ARCHIVE-057 — Public engagement integration for the Yearly History Page.
**Precondition:** R2 approved. Independent of R1.

**Scope.** `Table | Calendar` switch inside AR-05, with a desktop month grid and a mobile agenda, shared filters
and honest empty dates · a compact result detail · an advanced analytics workspace behind disclosure (position
frequency, pair frequency, consecutive patterns, monthly comparison, custom range, historical gaps) · two new Ask
intents · editorial selection by archive year and topic · year CSV, filtered CSV and a printable view · AR-02 and
AR-11 removed if R5 approves.

**Out of scope.** Any account capability, AR-08, community, alerts, cross-year comparison, a live AI provider,
2023 data, a new registered year, ads, structured data, canonical/sitemap/redirect changes.

**Preserved.** `LC_GAME_PREVIEW`; preview `noindex`; no canonical; no sitemap entry; explicit archive
registration; the generic archive model; Pick 3 as one family with independent 332/333 rows; the server-rendered
table as the crawlable default; existing URLs and `[segment]`; the genuine-correction gate; internal provenance
metadata; the founder-corrected section hierarchy; every existing search, year-navigation and statistics test.

**Acceptance.** Both views render from one filter result and never disagree · the table stays server-rendered and
every row remains in the initial HTML · no view, month or filter state enters a query string · zero page-level
horizontal overflow at 390 px and 1440 px · `assertNeutralLanguage` passes over every new string, including the
gap labels · CSV content matches the rendered rows exactly and carries game, year, filters, generation date and a
source reference · no disabled or "Coming soon" control anywhere · the full suite, type-check, lint and production
build pass · guard-off still 404s with no leakage.

**Deliverables.** Implementation record and founder-review update under
`03-docs/04-page-specifications/archive/`; screenshots at 390 px and 1440 px of the table view, the calendar view,
the mobile agenda, the result detail and the analytics workspace.
