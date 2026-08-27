# Representative State Template Generalization — Review

> **SUPERSEDED IN PART by LRG-STATE-048.** The four new States are no longer skeletal: Michigan, Virginia,
> California and Maryland were hydrated from LotteryCorner-owned material and now render Explore, guides,
> community starters, resources and a claim video. The internal-language leaks this document reported as
> rendered copy — the S-06 verification count, the operator-provenance footnote and the Buy Now status row —
> have been removed from all six States. See
> `representative-state-content-hydration-review.md`. Everything else here — the registry, the
> configuration boundary, the format gaps, the commerce and advertising positions, and the Florida
> non-regression evidence — stands unchanged.

**Task:** LRG-STATE-047 · **Baseline:** `1b14cbd` · **Guard:** `LC_STATE_PREVIEW=true` (inert by default)
· **Six preview States:** `fl` `mi` `va` `ca` `md` `ut` · **No production, canonical, redirect or sitemap change.**

Florida is unchanged, proved by DOM comparison against the baseline build. Five further States now run through
the same template from configuration alone.

---

## 1. Architecture changes

| Concern | Before | After |
|---|---|---|
| Preview enablement | `code === "fl"` in `jurisdictionRegistry.ts` **and** a one-entry config map | One declaration in `stateViewConfigRegistry.ts`, read by both |
| Runtime results | `FLORIDA_DRAW_EVENTS` imported by the model | `drawEventsFor(code)` |
| Family composition | `floridaFamilyConfig.ts` (TypeScript) | `presentation.families` in each State's JSON |
| Family building | `buildFloridaFamilies()` | `buildStateFamilies({families, events, formats, tz, todayIso})` |
| Formats | `FLORIDA_FORMAT_VERSIONS` | `formatVersionsFor(code)` — shared multi-state rules + native |
| Governed facts | `getStateManifest()` (Florida only) | `stateManifestFor(code)` |
| Lower-page content | `FLORIDA_LOWER_PAGE_CONTENT` imported by the orchestrator | `model.lowerContent` |
| Commerce | `FLORIDA_COMMERCE_CAPABILITY` imported by two components | `model.commerce` |
| Advertising | `MINIMUM_FLORIDA_PROFILE` imported by the orchestrator | `model.adProfile` |
| Route gate | `getStatePage()` fixture check **before** the guard | Guard first; fixture optional |

**Reuse decisions.** KEEP — `gameFamilyPresentation`, `resultFormatContract`, `publicationGate`,
`sectionManifest`, `stateVisualBands`, `stateAdBaseline`, `buyNowCapability`, all band components.
GENERALIZE — the model, the orchestrator, the family builder, the Buy Now surface, S-03/S-04.
MOVE TO CONFIG — family composition, capabilities, lottery profile, preview enablement.
KEEP STATE-SPECIFIC — `floridaDrawEvents`, `floridaContentManifest`, `floridaFormatRegistry`.
KEEP AS REFERENCE — `floridaFamilyBuilder.ts` and `floridaFamilyConfig.ts`, retained **unused by the
application** solely as the non-regression oracle §6 compares against.

Every Florida lookup is a **table**, not a branch: `RESEARCHED`, `APPROVED`, `COMPLETE`. Florida is the one
jurisdiction that currently has researched facts, an approved ad profile and verified formats — a fact about
the evidence, not about the renderer. A test asserts no generic module compares a state code.

---

## 2. Registry

`PREVIEW_STATES` in `lib/state/stateViewConfigRegistry.ts`, in `FD-X-14` order. Three independent conditions
must hold — registry listing **and** registry flag **and** the configuration's own `preview.enabled`. A JSON
file existing is necessary and never sufficient.

Route existence is proved not fixture-derived in both directions: eleven States have a `state-*-sample.json`
fixture and no preview; **Utah has no fixture at all and previews anyway.**

---

## 3. The six States

| State | Profile | Games rendered | Families | TZ | Age | Content | Ads | Commerce |
|---|---|---:|---:|---|---|---|---|---|
| Florida | lottery | 19 events | 10 | ET | 18 (sourced) | 5 approved bands | **10 approved** | `underReview` |
| Michigan | lottery | 8 | 6 | ET | not verified | none | none | unknown |
| Virginia | lottery | 15 | 8 | ET | not verified | none | none | unknown |
| California | lottery | 7 | **5** | **PT** | not verified | none | none | unknown |
| Maryland | lottery | 14 | 8 | ET | not verified | none | none | unknown |
| Utah | **noLottery** | 0 | 0 | MT | n/a | none | none | not applicable |

Capabilities are positive and default to false. Utah's are all false and the validator rejects a
no-lottery State that declares any capability true.

**Minimum play age is `null` for Michigan, Virginia, California and Maryland.** 18 is very probably correct
for all four and it is not sourced — their manifests record the published age as unresearched, and the global
footer renders this value as a public statement. See §11, defect 2.

---

## 4. Family grouping

Independent production game ids are preserved end to end; nothing is merged in the data model.

- **Maryland Cash Pop** — one surface, four member rows (9am/1pm/6pm/11pm), ids 654–657, each with its own
  date, time and drawn number. Not four cards.
- **Maryland Pick 3** — 388 Midday and 389 Evening as two stable rows in configured order. Midday is the
  more recent draw and is configured first; reversing the configuration reverses the rows, which is how the
  test proves recency is not the sort key.
- **Michigan Fantasy 5 / Classic Lotto 47** — Double Play renders as a labelled secondary result inside the
  family, never as a member game.
- **Virginia Cash Pop** — five members; **Virginia Pick 3/4/5** — Day and Night, each with its own Fireball.

---

## 5. Format coverage and the three refusals

Formats for the four new States are derived where **two independent production sources agree**: `PLAY_TYPE`
and `NUM_OF_BALLS` in `game.csv`, and the actual `numbers-str` shape in the results feed. They are recorded
`provisionalProductionDerived` with **no `RuleSource`**, because no operator page was read — so the existing
publication gate blocks them from any public page, exactly as it blocks LRG-STATE-025's cloned Florida
definitions. Prize semantics are `unavailable`: the feed has a money figure, but whether it is an annuitized
jackpot, a cash value or a fixed top prize is unverified, and an unlabelled money figure beside a result is
what `PrizeSpec` exists to prevent. Powerball and Mega Millions keep their verified formats and their prizes.

**Three real production games are deliberately not rendered**, recorded in `FORMAT_GAPS`:

| Game | Why it is refused |
|---|---|
| Michigan Keno (402) | The two sources **disagree**: `PLAY_TYPE` is `10/80`, `NUM_OF_BALLS` is 22, and the feed draws 22. The pick-vs-draw reading is plausible and is recorded nowhere. |
| Michigan Poker Lotto (403) | A card game. `BallValueType` admits `card`, but no governed rank/suit/colour rendering rules exist and no format definition uses the type. Rendering it means inventing the presentation. |
| California Daily Derby (315) | Placed horse names plus a race time. The format model has no representation for a finishing order or an elapsed time. |

No format was cloned: every native format key is namespaced to its State and no key is shared.

---

## 6. Florida non-regression

Guarded `/fl` was captured from a build of baseline `1b14cbd` in a separate worktree and diffed against the
new build.

- **HTML identical after removing HTML comments.** The only four raw differences are the Next.js build-id
  marker and three React text-node separators (`<!-- -->`) that moved when two static strings became
  interpolations. No visible text changed.
- **Structural signature identical** on all thirteen compared properties: section order, visible sections,
  band order, all **ten** ad slot keys, ad profile id, active count, family order and count, the H1, every
  H2, 99 number balls, 14 footer links, and the action-label set.
- **The JSON family composition is deep-equal to `floridaFamilyConfig.ts`**, and **the generic builder's
  output is deep-equal to `buildFloridaFamilies()`** — the oracle test.
- **Home: 0 differing fragments.** No Home file changed.
- **Guard-off: `/fl`, `/mi`, `/va`, `/ca`, `/md`, `/ny`, `/az` and `/` are all byte-identical to baseline.**

---

## 7. Content, AI and community

No approved content package exists for Michigan, Virginia, California or Maryland, so S-10, S-14, S-15 and
S-18 **suppress entirely** — no heading, no "coming soon", no blank gap — each with a recorded reason. No
Florida copy appears in any other configuration; a test asserts none of them contains the word Florida.

One shared AI surface per page, prompts contextual to the State and game. No fabricated discussion, reply
count, view count, avatar or trending label anywhere; the four new configurations carry zero community and
zero news items.

---

## 8. Commerce

`Buy Now` remains the entry label everywhere (COM-01). Florida keeps `underReview`. The four new States
resolve to **unknown**, modelled as the **absence** of a capability record rather than as a status —
`CapabilityStatus` is a closed union whose members all assert something we have not earned, and widening a
governed contract is not this task's call. No provider is named, no affiliate destination appears in any
configuration, and no compensated option can render because no option list exists.

`FD-X-14` calls Michigan the online-play validation case and California the `retailOnly` verification case.
Those are validation *purposes*; treating either as a finding would publish an unverified commercial claim.

---

## 9. SEO, schema and raw HTML

Unique title, description and canonical per State, all from configuration; canonical is the governed non-www
origin `https://lotterycorner.com/{code}`. **All six are `noindex, nofollow`** and all six stay out of the
sitemap until the documented cutover. JSON-LD is `CollectionPage` + `BreadcrumbList` only; no prohibited type
appears. Utah's metadata says it does not operate a state lottery and its `schemaAboutName` is "Utah", not
"Utah Lottery". All critical content — identity, results, family labels, resources, trust copy — is in the
server HTML.

---

## 10. Advertising

Florida keeps its approved ten placements unchanged. **The other five render none.** ADS-02 forbids copying
Florida's inventory and no common placeholder profile has been ratified; `AD-S-DEC-19` rules the reduced
no-lottery model in principle but ratifies no slot set. Each State's profile carries the gap text.

---

## 11. Two defects found and fixed during this task

1. **A sticky Florida advertisement rendered on every State, including no-lottery Utah.** The orchestrator
   read `active.find(sticky) ?? stickyPlacement()`, and `stickyPlacement()` reads the Minimum Florida profile
   unconditionally. Caught in the 390 px Utah capture. The fallback now searches the State's own profile;
   Utah reserves 0 px of clearance.
2. **An unverified minimum play age reached the global footer, on the guard-off legacy page.** Configuring
   `18` for the four new States made `FooterStateAge` — which is global and resolves by path segment —
   render "18+ in Michigan" on the **legacy** `/mi`, changing guard-off output, which REG-02 forbids, and
   publishing a legal fact the State's own manifest records as unresearched. Ages are now `null`.

---

## 12. Responsive and accessibility

24 combinations measured — six States × 320/390/992/1440 px:

| Check | Result |
|---|---|
| Horizontal page overflow | **0 px everywhere** |
| Exactly one `<h1>` | yes, all 24 |
| Clipped result balls | 0 |
| Disabled controls | 0 |
| Dialogs for ordinary actions | 0 |
| Empty section gaps | none — suppressed bands draw nothing |
| Utah useful without placeholders | yes |

**Three carried-over findings, all pre-existing on the approved Florida reference and inherited by the new
States through shared components.** None was introduced here; Florida's HTML is byte-identical to baseline
and the only CSS added is scoped to `.lcs-nolottery*`.

- **No `<main>` landmark in the preview shell.** `app/layout.tsx` wraps `children` in `<main>` only in the
  non-preview branch, so guarded Home and all six States have none. The skip link targets `#state-main`,
  which is an id, not a landmark. Fixing it changes Home's DOM.
- **Share buttons are 42 × 44 px**, 2 px under the 44 px target; several desktop family links are inline at
  17 px tall.
- **Reflow at 200 % zoom of a 390 px viewport** (195 CSS px): Florida overflows 60 px and Michigan 18 px on
  the multi-state number strip. Utah is clean. WCAG 2.2 AA §1.4.10 is specified at 320 CSS px, which passes
  with 0 px overflow, so this is stricter than the standard requires — but it is real and it is worth fixing
  with the design system.

---

## 13. Screenshots

Stored outside the repository at `…/scratchpad/lrg-state-047/`. Twenty captures: Florida 390 top / 390 lower
/ 1440 full; Michigan 390 top / 390 grouped family / 1440; Virginia 390 / 1440; California 390 / 1440;
Maryland 390 frequent-draw / 1440; Utah 390 / 1440; Home 1440; guard-off Florida 1440; unsupported `/ny`
1440; and 200 % reflow for Florida, Michigan and Utah.

---

## 14. Rollout recommendation

**Approve the architecture; do not activate any new State.** The template is proved reusable across a broad
portfolio, a Pacific timezone, a high-volume frequent-draw State, a genuinely empty feed record and a
no-lottery jurisdiction, with Florida provably unchanged. What the five new States lack is **content and
research, not engineering** — and `FD-X-14` already requires each to pass the content-manifest and
result-format gates before its preview activates. None of them passes those gates today.

---

## 15. Remaining decisions

**Founder**
1. Approve or amend the Utah no-lottery composition — it is new copy and the first page of its kind.
2. Confirm the four new States should show **no advertisement** until ad ops ratifies a profile.
3. Confirm `unknown` commerce (Buy Now leading to "we have not checked") is the right reader experience.

**Ad operations**
4. A per-State advertising profile for Michigan, Virginia, California and Maryland.
5. The ST-06 no-lottery slot set — production renders ten on the legacy templates; none is approved here.

**Research / data**
6. Operator name, official URLs, claim routes, minimum age, draw days and responsible-play contact for the
   four new States — every absence in `stateContentManifests.ts` names the specific research needed.
7. Official rule sources to lift the four native format registries from `provisionalProductionDerived` to
   `verifiedOfficial`, and prize semantics so prize figures can render.
8. Michigan Keno's drawn structure, Michigan Poker Lotto's card presentation, California Daily Derby's format.
9. Approved public content packages, if these States are to carry Explore, news, guides, community or
   resources bands.

**Engineering, deferred**
10. The `<main>` landmark in the preview shell, the 42 px Share targets and the 195 px reflow overflow —
    all pre-existing on the approved Florida reference; each needs founder sign-off because each changes it.
11. `generateStaticParams` still derives its **prerender list** from fixture filenames. It does not determine
    route existence — `/ut` resolves without a fixture — but it is the last fixture-derived route behaviour,
    and changing it alters production static generation.
