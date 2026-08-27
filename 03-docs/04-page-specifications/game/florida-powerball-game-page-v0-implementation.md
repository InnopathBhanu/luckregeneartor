# Florida Powerball Game Page V0 — Implementation Record

**Task:** LRG-GAME-049 · **Baseline:** `f5c9656` · **Route:** `/fl/powerball` · **Guard:** `LC_GAME_PREVIEW=true`
(inert by default) · **Blueprint:** BP-04B `JG-M1` · No production route, canonical, redirect, sitemap or ad change.

---

## 1. Source inventory

| Source | Status | Used for |
|---|---|---|
| `05-…game-page-blueprint-index-FINAL-APPROVED.md` v1.1 | Final approved, frozen | Which blueprint governs `/fl/powerball` |
| `05B-…jurisdiction-game-page-blueprint-FINAL-APPROVED.md` v1.1 | Final approved, frozen | **The governing document.** Mode, section order, content budget, ownership split |
| `05A` flagship blueprint v1.1 | Final approved, frozen | Read for the ownership boundary only — it governs `/powerball`, which is not built |
| `src/struts.xml` | Legacy, read-only | Route evidence: `*/*` → `page=game`; `*/*/*` → `page=gameHistory` |
| `game_upgrade_as.jsp` (2,960 lines) | Legacy, read-only | Ad-slot audit — carries no slot id of its own |
| `latest-results-lc.xml` | Production-derived | The Powerball draw record (gameId 1012) |
| `floridaFormatRegistry.ts` | Governed contract | Powerball format, Power Play, Double Play, prize kind |
| `floridaContentManifest.ts` | Governed manifest | Operator, claim deadline, claim tiers, cutoff, age, schedule |
| `buyNowCapability.ts` + `stateCommerceRegistry.ts` | Governed contract | Commerce resolution (`underReview`) |
| `ad-slot-definitions.json` | Production-derived | Ad audit — Game Page family named, **not enumerated** |

All four blueprints were verified by their internal `Version` and `Status`, not by their filenames.

---

## 2. Blueprint and legacy reconciliation

**05 §1 names `/fl/powerball` a `JG-M1` minimal flagship offering.** That is decisive and it reshapes the page:
BP-04B §3 assigns latest-numbers history, statistics, generators and universal rules to the flagship
ecosystem at `/powerball`; the jurisdiction page owns *"only substantial local context"*. The task's suggested
GP-01…GP-13 outline describes a fuller page, and the task itself says the blueprint order wins.

| Blueprint / legacy item | Disposition |
|---|---|
| JO-01 Identity + shared result | **KEEP** — implemented |
| JO-02 Countdown + Buy | **REFACTOR** — Buy implemented; countdown **DEFER** (below) |
| AD-JO00 / AD-JO01 | **SUPPRESS** — no approved profile (§7) |
| JO-03 Local price, features, add-ons | **KEEP**, partially — 5 of 6 facts unavailable or verified |
| JO-04 Claim, tax, privacy, contact | **KEEP**, partially — claim verified; tax and publicity suppressed |
| JO-05 Local AI, news, winners, community | **REUSE SHARED PRIMITIVE** + starters; news/winners suppressed |
| JO-06 Global tools launcher | **SUPPRESS** — every target route is unbuilt |
| JO-07 Follow local offering | **DEFER** — needs an account; Member/Insider is blocked (CLAUDE.md §16) |
| JO-08 Trust | **KEEP** — implemented |
| Legacy `/{state}/{game}/{year}` history | **DEFER** — separate route family, not this task |
| Legacy `/{state}/{game}/jackpotanalysis` | **DEFER** |
| Legacy Smart Pick / `getsmartpicks.jsp` | **SUPPRESS** — prohibited category |

**Recorded conflicts.**
1. **BP-04B §2 self-canonical vs available facts.** The blueprint requires substantial unique local
   information for a local flagship page to deserve its own canonical, and warns that a thin page "must be
   strengthened or explicitly consolidated after SEO review". Florida supplies four verified local facts
   (sales cutoff, draw days, minimum age, claim deadline + three claim tiers) plus Power Play and Double Play
   availability. Ticket price, advance play, tax and winner publicity are **not** in the repository. The page
   is honest but thinner than §2 envisages — flagged for SEO review, not padded.
2. **BP-04B §11 countdown vs data.** The blueprint wants the global draw countdown reused from the root hub.
   No countdown component exists, the feed is 23 days old, and no governed current-draw target time exists. A
   ticking clock against a stale draw would actively mislead, so the governed schedule facts render instead
   and the countdown is deferred. The task's GP-05 independently permits this ("no countdown unless timezone
   and target time are governed").
3. **BP-04B §0.2 `/play/{game}` vs the implemented resolver.** The blueprint's buy link is `/play/{game}`.
   CLAUDE.md §10 records `/play/{game}` vs `/buynow/{code}` as requiring the URL audit and founder approval,
   and forbids silently switching. **No new route was created**; the page reuses the existing inline
   first-party resolver, exactly as the State page does.

---

## 3. Route and guard

`/{state}/{game}` — the production route, evidenced by the struts wildcard mapping and preserved by BP-04B §1.
No `-new` path, no design-lab path, no second canonical. `app/[state]/[game]/page.tsx` is a new segment beside
`app/[state]/page.tsx`; `/fl` and `/fl/powerball` do not collide.

`LC_GAME_PREVIEW` is a second, independent server-only flag, so a Game Page draft can never change what a
State reviewer sees. Eligibility is one declared **pair** — `fl/powerball` — in `gameRegistry.ts`, never
derived from the feed (Powerball appears in all 49 jurisdictions), a fixture, or the presence of a JSON file.

**Guard-off parity is absolute and measured.** The route did not exist before this task; with the guard off it
404s, and `/fl`, `/mi`, `/va`, `/ca`, `/md`, `/ny`, `/az` and `/` are byte-identical to `f5c9656`. No `lcg-`
marker, no `data-lc-game-preview` and no metadata leak into guard-off output.

---

## 4. Reuse decisions

**REUSE SHARED PRIMITIVE, unmodified** — `StateBallGroup`, `StateMultiplierPill`, `StateAiSurface`,
`StateShareResult`, `StateExplainAction`, `StateDiscussLink`, the publication gate, the commerce registry, the
format registry, `drawEventsFor`. All already took plain props and imported no jurisdiction module.

**GENERALIZE — one component, additively.** `StateBuyNowInline` gained an optional, null-defaulted
`initialGameLabel`. Its game label previously defaulted to "All {State} games", which is right on a State page
and wrong on a page that *is* one game. The State call site passes nothing, so its output is unchanged —
proved by DOM comparison and by the rendered value still reading "All Florida games".

**NEW, Game-owned** — the registry, config contract, model, composition, schema graph, ad profile and CSS.

An earlier revision of the composition had its own ball markup. It rendered unstyled plain text, because the
approved ball rules are scoped to the preview roots. Both faults are fixed the same way: the Game Page root
carries `data-lc-game-preview`, which was **added to the existing scope selector list** (widening what matches
can never change what Home or State already resolve to), and the component now renders `StateBallGroup`.

---

## 5. Implemented sections

| Section | Content |
|---|---|
| JO-01 | Breadcrumb, Florida chip, "Multi-state game", Powerball logo, H1, draw date + time, 5 main balls + labelled Powerball, Power Play pill with its governed kind, `$435,000,000 Est. annuitized jackpot`, explicit cash-value absence, 23-day staleness notice, action row, `All Florida results`, local-purpose line |
| JO-02 | Next drawing + advertised next jackpot, the one inline Buy Now resolver (game context = Powerball) |
| JO-03 | Power Play offered, Double Play offered, ticket sales cutoff, draw days, minimum age; **Double Play rendered as a labelled secondary drawing** with its own numbers and its own Powerball |
| JO-04 | Only-the-operator-validates line, verified claim deadline, 3-tier claim table with header scopes, official claim link |
| JO-05 | One shared AI surface; three labelled discussion starters |
| JO-08 | Trust summary, official verify + responsible-play links, State hub, independence line |

**Deferred / suppressed, each with a recorded reason:** AD-JO00, AD-JO01, JO-06, JO-07, results history,
jackpot movement, countdown, ticket price, advance play, tax, winner publicity, published odds.

---

## 6. SEO, schema and raw HTML

One title, one description, one H1, canonical `https://lotterycorner.com/fl/powerball` from the governed
non-www origin, `noindex, nofollow`, Open Graph, `summary` Twitter card (no approved Powerball image asset).
Not added to any sitemap; no redirect behaviour.

Graph is **`WebPage` + `BreadcrumbList` only**. `Organization` and `WebSite` are referenced by `@id`, never
duplicated. No `Event`, `Product`, `Offer`, `FAQPage`, `QAPage`, `Dataset`, `Article`, `NewsArticle` or
`VideoObject`. **No `ItemList`** — it is permitted only for a visible recent-results list with stable internal
item destinations, and no result history exists to describe.

All 21 audited content items are present in the raw server response; nothing critical depends on a client
fetch or a modal.

---

## 7. Advertising

**No Game Page advertising renders, and the dependency is reported.** `ad-slot-definitions.json` names the
`lc_mgp_*` / `lc_mpg_*` family but records *"Div IDs/size mappings not enumerated here — capture from their
JSPs before building those pages"*; `03-docs/05-advertising/` holds Home and State reconciliations and no Game
Page one; `game_upgrade_as.jsp` carries no slot id. So no div id, size mapping, GAM path or approval exists for
a single Game Page slot, and nothing in this task permits review placeholders. `AD-JO00` and `AD-JO01` remain
in the governed sequence and resolve to nothing, so no geometry is reserved. No State slot key appears
anywhere on the page.

---

## 8. Responsive and accessibility

320 / 390 / 992 / 1440 px and 200 % zoom (195 CSS px): **0 horizontal overflow, one `<h1>`, one `<main>`,
0 clipped balls, 0 disabled controls, 0 dialogs.**

Two defects were found and fixed during the sweep: action-row controls measured 32 px tall (now ≥ 44 px via a
Game-scoped rule, leaving the shared components untouched), and the jackpot figure overflowed by 18 px at
195 px (now `clamp()`-sized). The Game Page supplies its **own `<main>`** because the preview shell in
`app/layout.tsx` omits one — a pre-existing condition the State family cannot fix without changing Home's DOM.

Remaining: the Share control is 42 × 44 px, 2 px under target — carried over from the State family and
pre-existing on the approved Florida reference.

---

## 9. Non-regression

`/fl`, `/mi`, `/ut` and `/` are **byte-identical** to `f5c9656` with the guard on, and Florida's structural
signature matches on all eight compared properties including the ten ad slot keys, family order, 99 balls,
the `underReview` Buy Now outcome and 14 footer links. Home is pixel-identical at 1440 px.

A pixel comparison of `/fl` initially showed 82 differing pixels of 4,608,000. Two captures of the *same*
build differ by exactly 82, so that is capture-time anti-aliasing noise, not a change.

---

## 10. Known limitations

1. No result history exists in the repository, so no recent-results section.
2. No flagship `/powerball` hub and no `/tools`, so JO-06 cannot render.
3. No countdown; the feed is 23 days old.
4. Ticket price, advance play, tax and winner publicity are unverified for Florida Powerball.
5. `VideoObject`-style enrichment, jackpot movement and Follow all await other work.
6. The page is thinner than BP-04B §2 envisages for a self-canonical local page — an SEO-review item.

---

## 11. Next generalization recommendation

Per founder ruling 14, the next Game Page task should generalize across **one native State game and one
frequent-draw family** — `/fl/pick-3` is both (BP-04B `JG-M2`, and a two-member Midday/Evening family). It
would exercise the mode this V0 did not, prove the variant contract in BP-04B §19, and reuse the State page's
existing grouped-family model. It also needs no new data: Florida Pick 3 already has transcribed events, a
verified format and configured family composition.
