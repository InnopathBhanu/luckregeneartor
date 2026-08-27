# Data Access, Export and AI Usage Decisions

**Document type:** Approved decision record — data-access boundary, export control and AI usage accounting
**Decision ID:** `DATA-DEC-001`
**Ruling family:** `FD-DAT-01` … `FD-DAT-20` *(new family; `FD-S`, `FD-X`, `FD-N` and `FD-ACC` are in use and are
not extended by this record)*
**Recorded by:** Task **LRG-DEC-030**, within **LRG-ARCHIVE-059**
**Decision date:** August 6, 2026 · **Amended:** August 6, 2026 (`FD-DAT-20` added, resolving open item 1)
**Status:** **APPROVED — founder decisions (Authority Tier 1)**
**Supersedes:** `ACCT-DEC-001` `FD-ACC-05` in part — see *Relationship to `ACCT-DEC-001`* below

**Authority note.** These are explicit founder decisions and therefore sit at **Tier 1** of the authority hierarchy
in root `CLAUDE.md` §2. Where a ruling restates an existing requirement it is binding **because of that
requirement**, not because this record repeats it; those entries are marked *(restates existing authority)*.

**Recording discipline.** The founder decision was supplied as twenty numbered points under four headings. Points
1–19 are recorded here as nineteen rulings; point 20 is a documentation instruction and is discharged by this
record and the amendments it lists rather than by a ruling of its own. **`FD-DAT-20` was added later the same day**
by a second founder ruling that resolved this record's open item 1. The rulings are **grouped by subject** — the
gated-action boundary, then the download controls, then the AI controls, then the current implementation boundary —
because the source text interleaves the boundary and its exceptions. **Every ruling cites the source point it comes
from**, so the mapping back to the founder's text is exact and nothing is lost in the regrouping.

**Why a separate record.** Source point 20 invites one *"if cleaner governance requires"* it. It does.
`ACCT-DEC-001` answers *who the user is* — identity, entitlement, and when a personal capability may appear.
This record answers *what may be taken out of the platform, by whom, how much, and at what cost* — a different
question with a different lifetime, its own operational configuration and its own logging obligations. Keeping them
apart means the export allowance can be retuned without reopening the identity model.

**Companion documents**

- `03-docs/08-decisions/account-identity-and-signed-in-capability-decisions.md` — `ACCT-DEC-001`, the identity and
  signed-in capability boundary these rulings sit on top of
- `03-docs/04-page-specifications/archive/yearly-history-page-expansion-capability-audit-and-brief.md` — the
  capability audit, whose downloads and Ask readiness rows these rulings change
- `03-docs/04-page-specifications/archive/florida-pick-3-yearly-archive-v0-implementation.md` — the execution record
  for the Yearly History Page, where the removals required by `FD-DAT-16` are recorded
- `03-docs/08-decisions/source-conflicts.md` Conflict 3 — the eleven open Part 22 Member/Insider decisions, of which
  **decision 7 (export rights)** is adjacent to this record and is **not** pre-empted by it

---

## Relationship to `ACCT-DEC-001`

`ACCT-DEC-001` `FD-ACC-05` recorded, on August 5, that *"Results, calendar and agenda viewing, public-data
analytics, Ask the Archive, articles, public-result CSV downloads and print remain public,"* and drew the strong
consequence that *"none of these may be placed behind authentication at any future point."*

That ruling is **superseded in part**. The founder decision of August 6 opens with the words *"This supersedes the
earlier ruling that AI/Ask and public-result downloads operate publicly."* Two items move:

| Capability | `FD-ACC-05` (Aug 5) | This record (Aug 6) |
|---|---|---|
| Results, tables, calendar, agenda | public | **unchanged — public** (`FD-DAT-08`) |
| Basic statistics over public results | public | **unchanged — public** (`FD-DAT-08`) |
| Articles and source information | public | **unchanged — public** (`FD-DAT-08`) |
| **Ask / AI execution** | public | **Account-gated** (`FD-DAT-02`) |
| **Full-year CSV, filtered CSV, provided bulk print/export** | public | **Account-gated** (`FD-DAT-01`) |
| Ordinary browser printing (Cmd/Ctrl+P) | public | **unchanged — public and cannot be prevented** (`FD-DAT-09`) |

The superseding is narrow and deliberate, and it does not contradict the Constitution's complete-public-value rule.
What that rule protects is the **fact** — the winning numbers, the draw dates, the official source, the arithmetic
over them. All of that stays readable, crawlable and free, and `FD-DAT-08` restates it. What moves behind an
Account is not a fact but a **bulk transfer of the whole dataset** and a **metered computation that costs money per
invocation**. `FD-ACC-16` still forbids gating anything in order to sell it, and nothing here is sold:
`FD-DAT-06` keeps the destination free.

`ACCT-DEC-001` has been amended in place to mark `FD-ACC-05` superseded and to point here.

---

## The gated-action boundary

### `FD-DAT-01` — Provided export is an Account action *(source point 3)*

Full-year CSV download, filtered CSV download, and any **bulk report or application-provided print/export** require
a free LotteryCorner Account.

**Consequence.** The page may not generate a file for an anonymous visitor by any mechanism, including a
browser-side `Blob`, a data URI, a client-rendered print sheet or a public route that returns rows. Export becomes a
server action that authenticates first. The same source point also gates **saved number sets, saved searches and
answers, and alerts, follows and personalized reports**; those are personal-continuity capabilities already governed
by `FD-ACC-06` and `FD-ACC-07`, remain hidden today, and are not re-decided here.

### `FD-DAT-02` — Ask / AI execution is an Account action *(source point 3)*

Executing an Ask or any other AI request requires a free LotteryCorner Account.

**Consequence.** The distinction is **execution**, not subject matter. A pre-computed, deterministic summary that
runs at build time, calls no provider, consumes no tokens and costs nothing is not an execution and is not gated by
this ruling — **`FD-DAT-20` settles that for the AR-03 year brief**, which stays public and is no longer described
as AI at all. Anything that takes a reader's question and answers it is gated.

### `FD-DAT-03` — A gated capability stays visibly discoverable *(source point 2)*

High-value interactive capabilities must remain **visibly discoverable** in the final interface. They must not be
hidden merely because the visitor is signed out.

**Consequence.** This is the opposite default from `FD-ACC-07`, and the two are reconciled by `FD-DAT-16`: hiding is
correct only while the capability cannot work at all, and the moment sign-in works, discoverability — not hiding —
is the rule. A signed-out reader must be able to see that Ask and export exist, understand what they do, and reach
them in one action.

### `FD-DAT-04` — The affordance says `Sign in free to use` and opens the real flow *(source point 4)*

For a signed-out visitor the control remains visible and clearly says `Sign in free to use` or equivalent. Clicking
it must open the **real shared sign-in flow**.

**Consequence.** The label must carry the word **free**, so that no reader can mistake the gate for a paywall. The
control is a real control: it opens the shared sign-in surface used everywhere else on the platform, not a modal
built for this page, and not a route that exists only to receive the click. Because no such flow exists today,
`FD-DAT-16` and `FD-DAT-17` keep the affordance **absent** rather than shipping it inert.

### `FD-DAT-05` — Sign-in restores the same game, year, filters and action *(source point 5)*

After sign-in, restore the same game, year, filters and requested action using the approved server-side,
allowlisted, expiring, single-use intent/nonce contract.

**Consequence.** The contract is the one already approved as `FD-ACC-12`; this ruling fixes **what it must carry**
for this page family — state, game, archive year, the active filter set, and the requested action — and requires
that the reader lands back on the same archive with the request ready to complete rather than at a generic
destination. `FD-ACC-13` still applies: restoration may prepare the action, but an outward or costly action must be
confirmed by the reader before it runs. *(Restates existing authority as to the mechanism.)*

### `FD-DAT-06` — Nothing about the gate may be sold *(source point 6)*

No paid plan, Insider offer, upgrade prompt, trial or payment requirement may appear.

**Consequence.** The gate has exactly one destination, and it is free. No copy anywhere in the gated flow may
mention a tier, a plan, a limit that money would raise, or a future paid product; and the export and AI allowances
in this record may never be presented as something an upgrade would increase. *(Restates `FD-ACC-15` and
`FD-ACC-16`.)*

### `FD-DAT-08` — What remains publicly readable *(source point 1)*

Core lottery results, result tables, calendars, basic statistics, articles and source information remain **publicly
readable**.

**Consequence.** No part of this record may be used to gate a published drawing, a result table, the calendar or
agenda presentation of those results, ordinary statistics computed over them, editorial articles, or the official
source and last-updated information. These stay in server-rendered HTML and stay crawlable, per `CLAUDE.md` §9 and
§11. Readability is the test: a reader may read the whole year on the page. *(Restates the frozen Constitution's
complete-public-value rule.)*

### `FD-DAT-09` — Browser printing is not, and cannot be, prevented *(source point 19)*

The normal browser's ability to print a public page cannot be completely prevented. However, any
LotteryCorner-**provided** bulk print, report or export action must follow the signed-in usage rules.

**Consequence.** The print stylesheet stays, and Cmd/Ctrl+P must continue to produce a clean, correctly formatted
sheet of whatever the reader can already see — that is part of `FD-DAT-08`. What is removed is the platform's own
print/export **button**, because that is a provided action and would otherwise be an ungated, unmetered export path
around `FD-DAT-01`. The line is authorship: the browser's print is the reader's; a button we render is ours.

---

## Download control

### `FD-DAT-07` — Maximum two calendar years per export request *(source point 7)*

Apply an **initial maximum of two calendar years** in one export request.

**Consequence.** The server rejects a request spanning more than two calendar years before doing any work, and the
rejection is recorded with its reason under `FD-DAT-15`. "Initial" is deliberate: the value is a starting point, and
`FD-DAT-18` makes it configurable rather than fixed.

### `FD-DAT-10` — Three distinct game-year datasets per Account per rolling 24 hours *(source point 8)*

Apply an **initial rolling limit of three distinct game-year datasets per Account within 24 hours.**

**Consequence.** The unit metered is the **distinct `(state, game, year)` dataset**, not the request and not the
row. Re-exporting a dataset the Account has already drawn within the window does not consume a fourth allowance; a
fourth *new* dataset does. The window is **rolling**, not a calendar day, so the allowance recovers continuously
rather than resetting at midnight in some timezone. The value is server-configurable per `FD-DAT-18`.

### `FD-DAT-13` — Filters, splitting and repetition draw on the same allowance *(source point 9)*

Filtered downloads, date-range splitting and repeated requests must count against the **same underlying data
allowance**, so that a reader cannot reconstruct a larger export by changing filters.

**Consequence.** The allowance is accounted against the **underlying dataset**, before filtering. Requesting January
of a year and then February of the same year consumes that year's dataset once, not twice — and, critically,
splitting a three-year request into three one-year requests does not evade `FD-DAT-07`, because each distinct year
consumes its own dataset slot under `FD-DAT-10`. Filter parameters change the file, never the accounting.

### `FD-DAT-11` — Enforce on the server *(source point 10)*

Enforce authentication, authorization and limits **on the server**. Do not rely on hidden buttons, client
JavaScript, cookies alone or `localStorage`.

**Consequence.** Every check runs where the reader cannot reach it. A hidden control is a presentation choice, never
a security boundary; a client-side counter is an advisory display, never the allowance; a cookie may carry a session
reference but never the entitlement itself. This is why the current removals are **removals of the executing
surface** rather than conditional rendering — see `FD-DAT-16`.

### `FD-DAT-14` — No unrestricted public CSV or API endpoint *(source point 11)*

Do not expose an unrestricted public CSV/API endpoint.

**Consequence.** No route may return bulk archive rows without authenticating the caller and charging the allowance
first. This also forecloses the tempting shortcuts: a "convenience" JSON route for the client island, an
unauthenticated route that is merely undocumented, and a route protected only by a header the client sets.

### `FD-DAT-15` — Record every export attempt, with eleven fields *(source point 12)*

Every export **attempt** — successful or rejected — is recorded with:

| # | Field | Note |
|---|---|---|
| 1 | Account ID | the authenticated identity, never a raw session token |
| 2 | Timestamp | server time, with zone |
| 3 | State and game | the jurisdiction and game requested |
| 4 | Requested years / date range | as requested, before clamping |
| 5 | Applied filters | the filter set that shaped the file |
| 6 | Row count | rows actually returned; zero on rejection |
| 7 | Export type | full-year CSV, filtered CSV, report, provided print |
| 8 | Success or rejection | the outcome |
| 9 | Rejection reason | required whenever the outcome is a rejection |
| 10 | Request / correlation ID | ties the record to the request trace |
| 11 | Privacy-safe IP/device abuse signal | **derived**, never a raw address |

**Consequence.** Attempts are logged, not just successes — a rejection log is what makes an abuse pattern visible at
all. Field 11 is explicitly a *signal*: `CLAUDE.md` §13 forbids writing a raw IP to any redirect, content or
analytics store, so this is a salted, non-reversible derivation retained on a defined schedule, never an address.

---

## AI usage control

### `FD-DAT-12` — Record AI/Ask usage by Account, with nine fields *(source point 13)*

AI/Ask usage is recorded **by Account**, including:

| # | Field | Note |
|---|---|---|
| 1 | Feature and page context | which capability, on which surface |
| 2 | State, game and archive year | where applicable |
| 3 | Request count | invocations |
| 4 | Provider / model | when one exists — today none does |
| 5 | Input / output token counts | per invocation |
| 6 | Estimated cost | derived from tokens and the model's rate |
| 7 | Latency | measured server-side |
| 8 | Success, failure or rejection | the outcome |
| 9 | Daily and monthly totals | aggregated per Account |

**Consequence.** This is the accounting substrate the allowance in `FD-DAT-18` is enforced against, and it is the
reason `FD-DAT-02` gates execution at all: an anonymous invocation has no Account to charge, so none of these nine
fields can be attributed. Note field 4 — a deterministic interpreter with **no provider** is not what this ruling
was written for, which is the substance of the open item below.

### `FD-DAT-18` — Both limit sets are server-configurable, never code constants *(source points 8 and 14)*

AI limits — and the export values in `FD-DAT-07` and `FD-DAT-10` — must be **server-configurable**. Do not hard-code
a permanent allowance into page components.

**Consequence.** Allowances live in server configuration and are readable at request time, so they can be retuned
without a deployment and without a founder decision. A page component may **display** the reader's remaining
allowance; it may never **be** the allowance. A constant in a component, a value baked into a client bundle, or a
number duplicated between client and server all fail this ruling.

### `FD-DAT-19` — Do not retain complete prompts for analytics *(source point 15)*

Do not retain complete user prompts merely for analytics. Store only what is required for operation, safety and
support, following the eventual privacy policy.

**Consequence.** Three purposes justify retention, and analytics is not one of them. Operation covers what a request
needs while it is in flight; safety covers abuse and harm review; support covers reproducing a specific reader's
reported problem. Each requires its own retention period and its own access control. Everything the product wants to
*learn* must come from the structured fields in `FD-DAT-12`, which is why that list is field-level rather than
free-text. Where a prompt is retained for safety or support, it must be retrievable by request/correlation ID, not
mined in bulk.

---

## Current implementation boundary

### `FD-DAT-16` — Remove the executing surfaces now; restore the visible gate later *(source points 16 and 18)*

Real authentication and persistence do not currently exist. Therefore, **immediately remove public execution** of
AI/Ask and download/export actions. **Record** the final visible-but-sign-in-required experience now, and **restore**
those visible controls when the real shared Account and sign-in continuation flow works end to end.

**Consequence — the removals made under this ruling.** In `LRG-ARCHIVE-059`, on the Yearly History Page:

| Surface | Was | Now |
|---|---|---|
| Full-year CSV button | client `Blob` download, AR-05 | **absent**; `buildArchiveCsv` retained and tested |
| Filtered CSV button | client `Blob` download, AR-05 | **absent**; `filterDescription` still used for headings |
| Print this year button | `window.print()`, AR-05 | **absent**; the `@media print` stylesheet is unchanged |
| Ask the Archive | executing input + answer, AR-03 | **absent**; `archiveAsk.ts` retained and tested |

Nothing under it was deleted. The CSV builder, the RFC 4180 escaping and formula-injection guard, the Ask
interpreter and the grounded-answer logic are all **KEEP** — they are precisely what the future server endpoint
calls, and they remain covered by tests so they cannot rot while gated. Each removal site carries an inline comment
naming this ruling, so the restoration points are findable from the code rather than only from this record.

**Consequence — the experience to restore.** When sign-in works end to end, the following is the target, and it is
recorded now so that it is implemented as decided rather than redesigned later:

1. The control is **present and legible** for a signed-out reader in the same position it occupies for a signed-in
   reader — same section, same order, same prominence (`FD-DAT-03`). It is not moved to a promotional block.
2. Its label reads **`Sign in free to use`** or a clear equivalent containing the word *free* (`FD-DAT-04`).
3. Adjacent copy states plainly what the action does and that an Account costs nothing. It does not mention a plan,
   a tier, a trial or an upgrade (`FD-DAT-06`).
4. Activating it opens the **real shared sign-in flow** — the platform's, not a page-local modal (`FD-DAT-04`).
5. Before leaving, the server records a single-use, expiring, allowlisted intent carrying state, game, archive year,
   the active filter set and the requested action (`FD-DAT-05`, `FD-ACC-12`).
6. On return, the reader lands on the same archive, at the same year, with the same filters applied, and the
   requested action **prepared and awaiting their confirmation** — never auto-executed (`FD-ACC-13`).
7. For a signed-in reader, the control executes against the server, which authenticates, applies `FD-DAT-07`,
   `FD-DAT-10` and `FD-DAT-13`, and logs the attempt under `FD-DAT-15` or `FD-DAT-12`.
8. A rejection is explained in the reader's terms — what the limit is, what they have used, and when it recovers —
   and never as an invitation to pay (`FD-DAT-06`).
9. The reader's remaining allowance may be shown, read from server configuration at request time, never from a
   client constant (`FD-DAT-18`).

### `FD-DAT-20` — The AR-03 year brief is a deterministic summary, not an AI execution *(founder ruling of 2026-08-06 resolving open item 1)*

The Yearly History Page's year-to-date brief **stays publicly visible**. It is a deterministic summary derived from
public archive statistics: it is **not** an AI execution and does not require sign-in. It must **not** consume an AI
allowance or create an AI-usage ledger entry. Its label drops the word AI — `LotteryCorner Year-to-Date Brief` — and
**deterministic generation must not be described as AI anywhere in this surface.**

**Consequence.** `FD-DAT-02` gates *execution*, and this brief is not one: there is no reader request, no prompt, no
provider, no model inference, no tokens, no latency and no cost, so none of the nine `FD-DAT-12` fields can be
populated and there is nothing for `FD-DAT-18` to meter. It is arithmetic over the same public results `FD-DAT-08`
keeps public, and it is therefore governed as a public statistic.

The prohibition on describing it as AI runs **in both directions**. Claiming AI would misdescribe a calculation;
disclaiming AI raises the idea in a surface where it does not arise. The V0 copy did the latter — *"No live AI model
generated or verified these observations"* — and that sentence is removed along with the label. What remains is the
positive statement of provenance: the figures are counted from the drawings listed on the page.

This also clarifies the Constitution's AI-labelling duty rather than narrowing it. That duty exists so a reader can
tell when a model produced something. Where no model is involved, an AI label is not compliance — it is an
inaccurate description of the surface.

**The condition on which this reverses.** If AR-03 later uses an **AI provider, a user prompt, personalized
generation or model inference**, it moves behind the free Account, executes through the server, and follows
`FD-DAT-12` (usage recording), `FD-DAT-18` (server-configurable limits) and `FD-DAT-19` (no full-prompt retention).
The ruling attaches to what the surface *does*, never to what it is called.

### `FD-DAT-17` — No fake login, placeholder route, dead button or `Coming soon` *(source point 17)*

Do not create a fake login modal, placeholder route, non-functional button or `Coming soon` control.

**Consequence.** This is what makes the removals in `FD-DAT-16` the *only* available reading of the boundary.
`FD-DAT-03` and `FD-DAT-04` describe a visible control that opens a working sign-in flow; no such flow exists; a
visible `Sign in free to use` button today would therefore be exactly the non-functional control this ruling
forbids. Absence is the honest state until the flow works. The same prohibition rules out a `/signin` stub, a modal
that collects an address and does nothing, and a disabled button with an explanatory tooltip. *(Restates
`FD-ACC-14`.)*

---

## What these rulings deliberately do not decide

- **Authentication, sessions, credentials and the usage database.** Explicitly out of scope for the current task;
  they belong to the authorised account foundation task. This record specifies what that task must satisfy.
- **The retention periods** for the `FD-DAT-15` export log, the `FD-DAT-12` usage record and any prompt retained
  under `FD-DAT-19`. Each needs a period; the eventual privacy policy sets them.
- **Part 22 decision 7 (export rights)** remains open. `FD-DAT-01` fixes that provided export requires an Account;
  it does not settle Member/Insider export entitlement, and `CLAUDE.md` §16 still applies.
- **Rate limiting of public page reads.** `FD-DAT-14` forecloses a bulk endpoint; ordinary crawling and reading of
  the public page is governed by `FD-DAT-08` and is not restricted here.
- **Whether Ask is ever offered anonymously at a low allowance.** Not proposed and not decided; `FD-DAT-02` gates it
  outright today.

## Open items arising

| # | Item | Blocks |
|---|---|---|
| 1 | ~~Does the pre-computed AI year brief fall under `FD-DAT-02`?~~ **RESOLVED 2026-08-06 by `FD-DAT-20`** — it does not. The brief stays public, is not an AI execution, consumes no allowance, writes no ledger entry, and is no longer labelled AI. Implemented in LRG-ARCHIVE-060. | — |
| 2 | Authorise the account foundation task — `Account` entity, session, real shared sign-in, intent store, return allowlist | Every `FD-DAT-16` restoration |
| 3 | Authorise the usage and export logging store, with the retention periods for `FD-DAT-12`, `FD-DAT-15` and `FD-DAT-19` | Export and Ask going live |
| 4 | Confirm the derivation and retention of the `FD-DAT-15` field 11 abuse signal against `CLAUDE.md` §13 | Export logging design |
| 5 | Confirm the configuration surface for `FD-DAT-18` — where allowances live and who may change them | Export and Ask going live |
