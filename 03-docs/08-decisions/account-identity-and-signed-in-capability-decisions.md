# Account Identity and Signed-In Capability Decisions

**Document type:** Approved decision record — platform identity and signed-in capability boundary
**Decision ID:** `ACCT-DEC-001`
**Ruling family:** `FD-ACC-01` … `FD-ACC-18` *(new family; `FD-S`, `FD-X` and `FD-N` are in use and are not
extended by this record)*
**Recorded by:** Task **LRG-DEC-029**, within **LRG-ARCHIVE-057**
**Decision date:** August 5, 2026 · **Amended:** August 6, 2026 (`FD-ACC-02` reworded; `FD-ACC-15`–`18` added;
`FD-ACC-05` **partly superseded** by `DATA-DEC-001`)
**Status:** **APPROVED — founder decisions (Authority Tier 1)**
**Decided against:** `03-docs/04-page-specifications/archive/yearly-history-page-expansion-capability-audit-and-brief.md`
(the accepted capability audit, task LRG-ARCHIVE-056)

**Authority note.** These are explicit founder decisions and therefore sit at **Tier 1** of the authority
hierarchy in root `CLAUDE.md` §2. Where a ruling restates an existing requirement it is binding **because of that
requirement**, not because this record repeats it; those entries are marked *(restates existing authority)*.

**Recording discipline.** The eighteen rulings are recorded **as supplied**, in the order supplied, each with a
concise implementation consequence — enough to make the ruling executable, and no code-level design beyond that.
`FD-ACC-01`–`14` were supplied on August 5; `FD-ACC-15`–`18` and the `FD-ACC-02` amendment come from the founder
clarification of August 6, which corrected an implication in the original record that a paid Insider tier was the
planned destination for Account users. It is not.

**Companion documents**

- `03-docs/04-page-specifications/archive/yearly-history-page-expansion-capability-audit-and-brief.md` — the
  capability audit these rulings answer, including the readiness matrix and the phase plan
- `03-docs/04-page-specifications/archive/florida-pick-3-yearly-archive-v0-implementation.md` — the execution
  record for the Yearly History Page, where the Phase 1 consequences of these rulings are implemented
- `03-docs/04-page-specifications/archive/florida-pick-3-yearly-archive-v0-founder-review.md` — the founder-review
  record for the same page
- `03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md` — `DATA-DEC-001`, which supersedes
  `FD-ACC-05` in part and governs export control, export logging and AI usage accounting
- `03-docs/08-decisions/source-conflicts.md` Conflict 3 — the eleven open Part 22 Member/Insider decisions these
  rulings deliberately do **not** pre-empt

---

## Why this record exists

The capability audit traced every user-persistence table in the production schema and found that all of them hang
off one identity:

```
favourite_game.USER_ID          → insider_user.INSIDER_ID
reset_id.INSIDER_ID             → insider_user.INSIDER_ID
insider_subscription.INSIDER_ID → insider_user.INSIDER_ID
```

There is **no free-account table**. In production, having an account and having a paid membership are the same
fact. `CLAUDE.md` §16 forbids implementing Member/Insider until eleven Part 22 founder decisions close — so under
the legacy model, following a game would be blocked by decisions about export rights and ad treatment.

These rulings separate identity from entitlement so that ordinary sign-in is not an Insider implementation.

---

## The rulings

### `FD-ACC-01` — A free Account identity, distinct from `insider_user`

LotteryCorner requires a free **`Account`** identity that is distinct from the legacy `insider_user` entity.

**Consequence.** When the account foundation is authorised, `Account` is designed as its own entity. It is not a
row in `insider_user`, not a flag on it, and not a subclass of it. Migration from `insider_user` is a data
concern for that task, not an identity model to inherit.

### `FD-ACC-02` — If Insider ever exists, it is an entitlement *on* an Account, never the identity

**AMENDED 2026-08-06.** The original wording read *"Insider **will** eventually be a subscription or entitlement
associated with an Account"*, which implied that a paid Insider tier is the planned destination for Account users.
The founder clarification is explicit that it is not: **Insider is an unresolved future product possibility, not a
plan.** The ruling is therefore conditional.

Insider is **not part of the present implementation or monetisation plan**. Should it ever be approved, it is an
entitlement or subscription **associated with** an Account — never the identity itself.

**Consequence.** Authentication resolves an `Account`, full stop. Entitlement, if it ever exists, is a separate
lookup answering *"what may this account do"*. Code that asks "is this user signed in" must never be answerable
only by asking whether they are an Insider. No Insider concept, table, flag, route or copy is introduced by any
Account work, and nothing in the product may be built on the assumption that Insider will arrive.

### `FD-ACC-03` — Do not reproduce the legacy conflation

The legacy database conflation of account identity and paid membership **must not** be reproduced.

**Consequence.** No new table, type, session claim or API field may make a capability's availability depend on
subscription state unless that capability is genuinely a paid one. The production schema is evidence of what
exists, never a template for what to build (`CLAUDE.md` §15).

### `FD-ACC-04` — No Account implementation is authorised in this task

No Account schema, migration, authentication or Insider implementation is authorised by this record.

**Consequence.** `ACCT-DEC-001` records the *direction*. LRG-ARCHIVE-057 implements **only** the public Phase 1
scope. `02-new-api` stays untouched, no schema is designed, no session or cookie is introduced, and no sign-in
route is created — not even a placeholder. *(Restates `CLAUDE.md` §15 and §16.)*

### `FD-ACC-05` — These capabilities are public — **PARTLY SUPERSEDED 2026-08-06**

> **SUPERSEDED IN PART by `DATA-DEC-001` (`03-docs/08-decisions/data-access-export-and-ai-usage-decisions.md`).**
> The founder decision of August 6, 2026 opens: *"This supersedes the earlier ruling that AI/Ask and public-result
> downloads operate publicly."* **Ask/AI execution** is now Account-gated (`FD-DAT-02`) and **full-year CSV,
> filtered CSV and any LotteryCorner-provided bulk print or export** are now Account-gated (`FD-DAT-01`).
> Read `DATA-DEC-001` for the operative rule on those two items.

**Still in force.** Results, result tables, calendar and agenda viewing, basic statistics over public results,
articles, source information, and ordinary browser printing of a public page **remain public**, and none of these
may be placed behind authentication at any future point. They are facts about published lottery drawings, or
arithmetic over those facts, and the Constitution's complete-public-value rule covers them. `FD-DAT-08` restates
this and `FD-DAT-09` keeps browser printing unrestricted. *(Partly restates the frozen Constitution.)*

**No longer in force.** The listing of *Ask the Archive* and *public-result CSV downloads and print* as public, and
the sentence extending "may not be placed behind authentication at any future point" to them.

**Why the change is narrow.** What the Constitution protects is the **fact** — and every fact stays free,
crawlable and readable in full on the page. What moved is a **bulk transfer of the dataset** and a **metered
computation that costs money per invocation**, neither of which is a fact. `FD-ACC-16` still forbids gating
anything in order to sell it, and `FD-DAT-06` keeps the destination free: no plan, offer, upgrade, trial or
payment may appear anywhere in the gate.

### `FD-ACC-06` — Signed-in capabilities appear only when the whole round trip works

A signed-in capability may appear only after it works **end to end** through real authentication, real
persistence, a real sign-in return, and real action continuation.

**Consequence.** This is the refined rule replacing the earlier "hide unavailable account capabilities". A
signed-out reader **may** see and click a gated capability — but only when clicking it genuinely explains the
benefit, requests sign-in, preserves archive state, returns to the same page and continues the intended action.
Partial implementations do not render.

### `FD-ACC-07` — Until then, every personal capability stays hidden

Follow, save, bookmark, saved searches, saved answers, alerts, personal reports and My Number Sets **remain
hidden** until the foundation in `FD-ACC-06` exists.

**Consequence.** Hidden means **absent**, not disabled and not labelled. No control, no card, no badge, no
tooltip and no explanatory placeholder.

### `FD-ACC-08` — AR-08 is reserved

`AR-08` remains **reserved** as the future Personal Archive Tools slot.

**Consequence.** The section id stays in the archive contract and continues to resolve to `render: false` with a
recorded reason. It is not repurposed, not removed from the taxonomy, and not rendered empty.

### `FD-ACC-09` — Compare Years stays hidden until two genuine years exist

Compare Years remains hidden until at least **two genuine years** are registered.

**Consequence.** Blocked by *data*, not by code or by entitlement. When a second year is registered the
capability may appear publicly — it needs no account. Until then it is absent, including from any analytics
workspace.

### `FD-ACC-10` — Forum integration stays hidden

Forum integration remains hidden because **no forum platform currently exists**.

**Consequence.** No archive-discussion section, no "Discuss this finding", no prefilled composer and no
drawing-level discussion link. Confirmed by the audit: no route, no model, no component, and **no forum table
among the 37 production tables** — so unlike saved numbers there is not even a production precedent to migrate.

### `FD-ACC-11` — Alerts stay hidden

Alerts remain hidden because **no notification delivery channel exists**.

**Consequence.** No result-match alert, no follow-with-notification, no email or push affordance. The audit found
zero service-worker, push and mail references anywhere in the repository.

### `FD-ACC-12` — The sign-in continuation contract uses a server-side, expiring, single-use intent

The future sign-in continuation contract will use a **server-side, allowlisted, expiring, single-use
intent/nonce** rather than accepting an arbitrary return path.

**Consequence.** Only a nonce crosses the sign-in boundary. The stored intent holds the internal return path,
year, month, search value and match mode, draw filter, view, selected result, intended action and target section.
The return path is validated against an allowlist derived from the archive registry, so an open redirect is not
expressible. No sensitive data enters a URL, and no filter combination becomes indexable.

### `FD-ACC-13` — Auto-continuation must never act outwardly without final confirmation

Auto-continuation after sign-in must **never** publish, post, subscribe, purchase or send anything on the user's
behalf without final confirmation.

**Consequence.** Continuing a *private* action — following a game, saving a set — may complete automatically.
Anything outward-facing must land the reader in a composer or a confirmation step. A restored intent is evidence
of what the reader wanted before authenticating, not consent to act publicly for them.

### `FD-ACC-14` — Disabled and "Coming soon" account controls are not permitted

Disabled, "Coming soon" and non-functional account controls are **not permitted**.

**Consequence, and a correction to existing shipped work.** The audit found this rule already violated in the
accepted Global Shell: `components/account/AccountHooks.tsx` renders `Login` and `Register` as `disabled` with
`title="Login coming in a later phase"`, and exports a `FavoriteStar` with
`aria-label="Save … to favorites (coming soon)"`. Under this ruling those controls are suppressed until a real
Account destination exists. LRG-ARCHIVE-057 applies that suppression. *(Reinforces `FD-S-08` / `DS-17`, which
already forbid drawing a disabled control as if it were functional.)*

### `FD-ACC-15` — The Account is free, and exists for continuity, personalisation and engagement

A LotteryCorner Account is **free**. Its purpose is continuity, personalisation and engagement: remembering what a
reader saved, what they follow, what they searched, and where they were.

**Consequence.** No capability may be placed behind an Account in order to create a reason to pay for one. The
Constitution's rule stands unchanged — *an account unlocks continuity, not truth* — and `FD-ACC-15` adds that it
does not unlock a price either.

### `FD-ACC-16` — No paid tier, paywall, premium plan, upgrade prompt or conversion strategy is approved

None of the following is currently approved: a paid subscription, a paywall, a premium tier, an upgrade prompt, a
trial, a usage quota intended to drive payment, or any Insider conversion strategy.

**Consequence.** No surface may contain an upgrade path, a "premium" badge, a locked feature teaser or a quota
notice framed as an incentive to pay. A signed-out reader is asked to sign in **only** where `FD-ACC-06` permits —
for a capability that genuinely works end to end — and never to buy.

### `FD-ACC-17` — Monetisation is governed advertising and approved ticket-purchase referrals

The current monetisation direction is **governed advertising** and **approved ticket-purchase referrals**,
supported by useful repeat engagement rather than by restricting information.

**Consequence.** Two things follow, and both are already-binding requirements this ruling reinforces rather than
creates. Advertising remains subject to `CLAUDE.md` §12 in full — the captured GAM inventory, the reserved
dimensions, and the prohibition on interrupting result verification, claim guidance, correction notices, AI answers,
tool flows or responsible-play guidance. Referrals remain subject to §13 — a first-party resolver, deterministic
state-aware eligibility, conspicuous disclosure, no raw affiliate URL, and suppression in sensitive contexts.

**The product strategy consequence is the one worth stating.** Because revenue depends on repeat engagement rather
than on gating, making public information *more* useful is the monetisation strategy. That is why `FD-ACC-05`
keeps results, analytics, calendar and articles public, and why this ruling and that one are consistent rather
than in tension. `DATA-DEC-001` later moved Ask execution and provided CSV/export behind a **free** Account — which
does not disturb this ruling, because `FD-DAT-06` forbids attaching any plan, offer, upgrade, trial or payment to
that gate. Gating for cost control and abuse control is not gating in order to sell.

### `FD-ACC-18` — Future notifications are explicit opt-in, frequency-controlled and easy to disable

Any future notification — a result-match alert, a follow update, an email digest — must be **explicit opt-in**, must
give the reader control over frequency, and must be easy to turn off.

**Consequence.** No notification may be enabled as a side effect of signing in, following a game or saving a number
set. Each requires its own affirmative choice, its own frequency setting, and a disable path no harder to reach than
the enable path was. `FD-ACC-11` keeps every notification hidden until a delivery channel exists; this ruling
governs what that channel must do when it arrives, and it also applies to `FD-ACC-13` — a restored sign-in intent
may never be treated as consent to subscribe.

---

## What these rulings deliberately do not decide

- **The eleven open Part 22 Member/Insider decisions** (`source-conflicts.md` Conflict 3) are untouched.
  `FD-ACC-01` and `FD-ACC-02` are what allow ordinary sign-in to proceed *without* pre-empting them.
- **The Account schema, session mechanism and credential handling** — deferred to the authorised account task.
- **Export allowances, AI usage accounting and the data-access boundary** — moved to `DATA-DEC-001`, which
  supersedes `FD-ACC-05` as to Ask execution and provided CSV/export. `FD-ACC-16` still forbids gating anything in
  order to sell it, and Part 22 decision 7 still governs Member/Insider bulk-export entitlement.
- **Forum indexation, moderation and content policy** — out of scope while `FD-ACC-10` holds.

## Open items arising

| # | Item | Blocks |
|---|---|---|
| 1 | Authorise the account foundation task (`Account` entity, session, sign-in, intent store, return allowlist) | Every `FD-ACC-06`-gated capability |
| 2 | Decide whether `insider_user` migrates into `Account` or is mapped alongside it | The account foundation task |
| 3 | Confirm intent expiry (**15 minutes** recommended in the audit) and single-use semantics | `FD-ACC-12` implementation |
| 4 | Rule on whether `AccountHooks.tsx` is deleted or retained for a future real destination | Shell cleanup beyond suppression |
| 5 | The `DATA-DEC-001` open items — chiefly whether the pre-computed AI year brief falls under `FD-DAT-02` | AR-03 content |
| 6 | Whether Insider is ever revisited at all (`FD-ACC-02` as amended treats it as a possibility, not a plan) | Nothing — no work depends on it |
