# Florida Result-Format and Buy Now Capability Contract

**Task:** LRG-STATE-029
**Version:** 1.0
**Status:** GOVERNED CONTRACT — verified data foundation for Florida Prototype V1
**Date:** 2026-07-29
**Authority:** `FD-S-01`/`FD-S-02` · `FD-S-09` · `FD-S-10` · `FD-S-14` · `FD-S-17` · `FD-X-01` · `FD-X-11`
(retained in part) · `FD-N-03` · `FD-N-10` · `FD-N-11` · `FD-N-12` · `CLAUDE.md` §13, §14

> **No visual redesign.** The rendered `/fl` DOM changed in exactly one way — eight Pick evening draw-time
> strings corrected from `7:57 PM ET` to `9:45 PM ET`. Section ids, ad slots, class attributes and game
> families are byte-identical. Home is byte-identical. This task changed **data and contracts**, not layout.

---

## 1. Official sources

Primary official sources only. No proposed PDF and no independent lottery site was used as rule authority.

| Ref | URL | Accessed | Exact facts supported | Governs |
|---|---|---|---|---|
| `powerball` | `floridalottery.com/games/draw-games/powerball` | 2026-07-28 | "Powerball drawings are held on Monday, Wednesday and Saturday." Tickets until 10:00 p.m. ET on draw night. Power Play $1/play, 2X–5X, **10X included when the jackpot is $150 million or lower**. **Double Play is an additional drawing following Powerball**, prizes up to $10 million. 5 of 1–69 + Powerball 1–26. 18+ | result rendering · prize · schedule · purchase |
| `megaMillions` | `floridalottery.com/games/draw-games/mega-millions` | 2026-07-28 | "MEGA MILLIONS drawings are held every Tuesday and Friday night at 11 PM Eastern Time". Cutoff 10:00 p.m. ET. 5 of 1–70 + MEGA BALL 1–24. **"Every non-jackpot win will multiply its base prize by 2, 3, 4, 5, or 10 times automatically!"** *(effective 2025-04-08)* | result rendering · prize · schedule |
| `floridaLotto` | `floridalottery.com/games/draw-games/florida-lotto` | **2026-07-29** | "Players pick 6 numbers between 1-53". Twice weekly. **"Tickets can be purchased until 10:55 p.m., Eastern Time"**. **Double Play**: "$1 more per play", **"held immediately after the Florida Lotto drawing"**, prizes **"up to $250,000"**. **EZmatch**: "$1", **"…win up to $500 instantly!"** 18+ | result rendering · prize · schedule · purchase |
| `jackpotTriplePlay` | `floridalottery.com/games/draw-games/jackpot-triple-play` | **2026-07-29** | **"choose six numbers 1 through 46"**. Cutoff 10:40 p.m. ET. Starting Jackpot **$250,000**, up to $2 million. **Combo**: "$1 extra… combine winning number matches from all three sets of numbers… up to $10,000". 18+ | result rendering · prize · purchase |
| `fantasy5` | `floridalottery.com/games/draw-games/fantasy5` | **2026-07-29** | **"Select five numbers from 1 through 36"**. **"twice a day, 7 days a week at 1:05 p.m. and 11:15 p.m."** ET. Cutoff 20 min before (12:45 p.m. / 10:55 p.m.). **Rolldown**: with no top-prize winner the pool is shared among 4-of-5 winners, **max $555 per winner** | result rendering · prize · schedule |
| `pick3` | `floridalottery.com/games/draw-games/pick-3` | **2026-07-29** | Three digits 0–9. **Midday 1:30 p.m., evening 9:45 p.m. ET**. Cutoff 11 min prior (1:19 p.m. / 9:34 p.m.). **"FIREBALL is the wild card… allowing you to replace one of the three official PICK winning numbers drawn with the FIREBALL number drawn."** Doubles the base price | result rendering · schedule · purchase |
| `pick5` | `floridalottery.com/games/draw-games/pick-5` | **2026-07-29** | "twice a day". **Midday 1:30 p.m., evening 9:45 p.m. ET**. Cutoff 12 min prior. FIREBALL "replace one of the five official PICK winning numbers drawn". Base $0.50 or $1 | result rendering · schedule · purchase |
| `cashPop` | `floridalottery.com/games/draw-games/cash-pop` | **2026-07-29** | "Select one number from 1 to 15". **"five drawings per day"**. **"Choose your play amount… one dollar, two dollars, five dollars, or ten dollars. Prizes increase with higher play amounts."** **"Prizes range from 5 times to 250 times the play amount"**. Base $1. 18+ | result rendering · prize |
| `cash4life` | `floridalottery.com/games/draw-games/cash4life` | **2026-07-29** | **"Game Ended: The Cash4Life Draw game ended on February 21, 2026. Please check winning numbers and claim prizes within 180 days after the winning draw date."** | retired state · result rendering |

**Not verified in this task, recorded honestly:** Pick 2 and Pick 4 game pages were not fetched
individually; the pre-2025 Mega Millions format was not verified from a primary source. All three are
`underReview` and the publication gate blocks them.

---

## 2. Final Florida game and event inventory

**19 draw events → 10 game identities.** Both counts are confirmed by repository evidence and unchanged.

| # | Game identity (`gameKey`) | Class | Events | Feed game ids | Draw periods | Format id | Verification | Primary | Secondary | Drawn add-on | Purchase add-on | Multiplier | Prize kind |
|---:|---|---|---:|---|---|---:|---|---|---|---|---|---|---|
| 1 | `powerball` | multi-state | 1 | 1012 | — | 1012 | **verifiedOfficial** | 5/69 + PB 1/26 | **Double Play** | — | — | Power Play, *independentlySelected* | estimatedAnnuitizedJackpot **+ cash value** |
| 2 | `mega-millions` | multi-state | 1 | 1013 | — | **1013** (from 2025-04-08) | **verifiedOfficial** | 5/70 + MB 1/**24** | — | — | — | **builtIn** 2–10× | estimatedAnnuitizedJackpot **+ cash value** |
| 2b | `mega-millions` *(historical)* | multi-state | — | — | — | **10131** (to 2025-04-07) | **underReview** | 5/70 + MB 1/25 | — | — | — | *unavailable* (Megaplier unverified) | — |
| 3 | `florida-lotto` | state jackpot | 1 | 337 | — | 337 | **verifiedOfficial** | 6/53 | **Double Play** (own $250,000 prize) | — | **EZmatch** | notApplicable | advertisedJackpot, **no** cash value |
| 4 | `jackpot-triple-play` | state jackpot | 1 | 582 | — | 582 | **verifiedOfficial** | **6/46** | — | — | **Combo** | notApplicable | advertisedJackpot, **no** cash value |
| 5 | `fantasy-5` | state daily | 2 | 640, 336 | Midday, Evening | 640 | **verifiedOfficial** | 5/36 | — | — | — | notApplicable | **variableTopPrize** (rolldown, max $555) |
| 6 | `pick-2` | daily numbers | 2 | 563, 564 | Midday, Evening | 563 | **underReview** | 2 digits | — | Fireball | — | notApplicable | fixedTopPrize |
| 7 | `pick-3` | daily numbers | 2 | 332, 333 | Midday, Evening | 332 | **verifiedOfficial** | 3 digits | — | **Fireball** | — | notApplicable | fixedTopPrize |
| 8 | `pick-4` | daily numbers | 2 | 334, 335 | Midday, Evening | 334 | **underReview** | 4 digits | — | Fireball | — | notApplicable | fixedTopPrize |
| 9 | `pick-5` | daily numbers | 2 | 565, 566 | Midday, Evening | 565 | **verifiedOfficial** | 5 digits | — | **Fireball** | — | notApplicable | fixedTopPrize |
| 10 | `cash-pop` | frequent draw | **5** | 614–618 | Morning, Matinee, Afternoon, Evening, Late Night | 614 | **verifiedOfficial** | 1 of 1–15 | — | — | — | notApplicable | **stakeDependentPrize** |
| — | `cash4life` | **RETIRED** | 0 | — | — | 1015 | **verifiedOfficial** (retirement) | 5/60 + Cash Ball 1/4 | — | — | — | notApplicable | unavailable |

**Powerball Double Play** is modelled as a secondary draw of `powerball` and is present in the feed's
`numbers-str`. It is **not** a separate game identity, so it does not change the 10/19 arithmetic.

---

## 3. Format classification

| Game | Classification | What changed · what is preserved |
|---|---|---|
| Powerball | **VERIFIED UNCHANGED** | Ball ranges and Double Play confirmed. Power Play now typed `independentlySelected` with the 10× jackpot condition recorded |
| Mega Millions | **SPLIT INTO VERSIONED DEFINITIONS** | Format `1013` (from 2025-04-08, Mega Ball 1–24, **builtIn** multiplier) plus a closed historical `10131`. Preserved: current rendering is unchanged. **Corrected:** `multipliers: []` was wrong — the multiplier exists and is automatic |
| Florida Lotto | **VERIFIED AND CORRECTED** | Double Play now carries **its own** $250,000 prize instead of implicitly inheriting the jackpot. **EZmatch added** as `purchaseTime`. Preserved: 6/53 rendering and the Double Play result block |
| Florida Lotto EZmatch | **REPLACE (classification)** | Was absent entirely. Now `purchaseTime` — **an instant win at purchase, never a scheduled result group** |
| Jackpot Triple Play | **VERIFIED AND CORRECTED** | 6/**46** confirmed. **Combo added** as `purchaseTime`. Prize typed `advertisedJackpot` with no cash value |
| Fantasy 5 (both dayparts) | **VERIFIED AND CORRECTED** | 5/36 and both times confirmed against the operator. **Prize corrected** from an implied fixed top prize to **`variableTopPrize`** with the rolldown recorded |
| Pick 3 · Pick 5 | **VERIFIED AND CORRECTED** | Digit counts and times confirmed. **Fireball reclassified** from a named special ball to a `drawn` add-on with the *replacement* mechanic recorded. Preserved: Fireball still renders as its own labelled group with an accessible name |
| Pick 2 · Pick 4 | **SUPPRESS UNTIL VERIFIED** | Structure is almost certainly correct by published family pattern, but the pages were not fetched. `underReview`; the gate blocks public publication. Preserved: they still render in the guarded preview |
| Cash Pop (5 dayparts) | **VERIFIED AND CORRECTED** | 1/15 and five dayparts confirmed. **Prize corrected** to `stakeDependentPrize` with stake options and the 5×–250× range. Preserved: the drawn number and daypart still render |
| Cash4Life | **RETIRED** | Ended **2026-02-21**, 180-day claim window, no official replacement. Historical results stay resolvable; excluded from current results and from Buy Now |

---

## 4. Add-ons, secondary draws and multipliers

The four distinctions the accepted research found missing, now enforced by type and by gate.

| Concept | Definition | Florida instances | Renders as a result? |
|---|---|---|---|
| **Primary result** | The official winning-number structure of the main draw | all 10 identities | **Yes** |
| **Secondary drawing** | A separately drawn result with its own numbers, label, status and prize | Powerball Double Play · Florida Lotto Double Play | **Yes — as its own labelled block** |
| **Drawn add-on** | An additional *officially drawn* value | **Fireball** (Pick 2/3/4/5) | **Yes — its own labelled group, never inside the main row** |
| **Purchase-time add-on** | Resolved at purchase; **no drawn value exists** | **EZmatch** (Florida Lotto) · **Combo** (Jackpot Triple Play) | **NO — the gate rejects a purchase-time add-on carrying a drawn group** |

**Why Fireball is not a main ball.** The operator states it "**replace[s] one of the three official PICK
winning numbers drawn** with the FIREBALL number drawn". It is drawn, so it has a value to show; it is a
wild-card substitution, so putting it inside the main group would misrepresent the drawn result.

**Multiplier kinds.** `independentlySelected` (Power Play — chosen and paid for) · `builtIn`
(Mega Millions post-2025 — automatic, cannot be declined) · `unavailable` (pre-2025 Megaplier, unverified) ·
`notApplicable` (the six games with no multiplier — stated explicitly rather than left empty).

---

## 5. Prize and jackpot semantics

**A bare money string is not a publishable fact.** Eight kinds, each requiring a source:

| Kind | Florida instances | Cash value | Note |
|---|---|---|---|
| `estimatedAnnuitizedJackpot` | Powerball, Mega Millions | **published separately** | Never derived by us |
| `advertisedJackpot` | Florida Lotto, Jackpot Triple Play | **not published** | Rolling; JTP starts at $250,000 |
| `fixedTopPrize` | Pick 2/3/4/5; both Double Plays | no | Base ticket price scales the prize |
| `variableTopPrize` | Fantasy 5 | no | Pari-mutuel rolldown, max $555 at 4-of-5 |
| **`stakeDependentPrize`** | **Cash Pop** | no | **Prize = stake × 5–250. Cannot be stated without the stake** |
| `noJackpot` / `unavailable` | Cash4Life (retired) | — | Absence needs no source |

**The Cash Pop correction.** Prototype V0 rendered a flat `$250` from the feed. That figure is the maximum
at a **$1** stake; a $10 stake could win $2,500. The contract therefore records stake options and the
multiplier range, and the gate rejects a stake-dependent prize with no stake options. **The hub may publish
the drawn number and daypart. It must not state a potential prize without ticket-specific inputs.**

---

## 6. Retired-game handling

| Field | Cash4Life |
|---|---|
| Retired on | **2026-02-21** (official) |
| Claim window | 180 days after the winning draw date |
| Replacement | **none officially identified** (`null`) |
| Current results | **excluded** — `currentVersions()` filters it out |
| Buy Now | **excluded** — no purchase option, and the gate rejects a retired game left open |
| Historical results | **retained and resolvable** — `selectFormatVersion(…, "cash4life", "2026-01-15")` returns format `1015` |
| Accidental 404 | **prevented** — `retainHistoricalResults: true` is a required literal |

Cash4Life is absent from the Florida feed, so V0 never displayed it. The mechanism exists so the **next**
retirement is handled correctly rather than discovered in production.

---

## 7. Buy Now capability contract

Three layers, all data. **No UI, no route, no partner integration, no network call.**
`/play/{game}` vs `/buynow/{code}` is **not** resolved (`FD-N-10`, `FD-S-32`, `OPEN-ST-05`).

**State level** — jurisdiction · status (`verified`/`underReview`/`unavailable`/`notApplicable`) · official
operator · minimum age · physical-location and geolocation requirements · source · lastVerified · **reviewBy**
· note.

**Game level** — per **game**, not per state, because Georgia sells Cash 3 online but not Georgia Five:
gameId · gameKey · optionType · provider identity · official-or-compensated · eligible jurisdiction ·
cutoff · material differences · **ticket custody** · prize handling · **disclosure** · source · lastVerified ·
reviewBy · lifecycle. **No partner URL field exists** — `CLAUDE.md` §13 forbids a raw affiliate URL anywhere.

**Option ordering is data, not styling** — `OPTION_TYPE_RANK`: officialWeb 1 · officialApp 2 ·
officialSubscription 3 · approvedCourier 4 · approvedAffiliate 5 · retailer 6. Official can never be
reordered below compensated.

**Resolver outcomes** — `eligibleOptions` · `clarificationRequired` · `underReview` · `unavailable` ·
`suppressedBySafetyContext` · `suppressedByStaleEvidence`. Check order is deliberate: **safety → staleness →
capability → eligibility → options.** Safety first so a suppression cannot be defeated by having good data;
staleness before capability because stale evidence is not evidence.

**Florida resolves to `underReview`.** The official Where-to-Play destination is a retailer locator — evidence
about that destination, not proof no other path exists. **Texas** is the `retailOnly` reference case: its
operator publishes that there are no internet, mail or phone sales. Florida publishes no such verified
statement, so we say we do not know. Zero purchase options are recorded, which is the honest state.

The resolver's explanation is *"LotteryCorner does not sell tickets. These are the ways to play, official
options first."* — and `Buy Now` remains the visible CTA leading to the explanation (`FD-N-03`).

---

## 8. Publication gates

**Format gate** rejects: verification other than `verifiedOfficial` · a published format with no primary
source · a retired game open for current draws · an expired version with no successor · a purchase-time
add-on carrying a drawn group · a drawn add-on with no group · an unsourced prize kind · a stake-dependent
prize with no stake options · a labelled group without an accessible name · a secondary draw with no source
or no groups of its own.

**Commerce gate** rejects: a verified capability with no source · expired capability or option evidence ·
**a compensated option with no adjacent disclosure** · a compensated option not marked as a compensated
relationship.

**Measured result today:** **9 blocking findings** across three versions — `mega-millions/10131`,
`pick-2/563`, `pick-4/334`. The **verifiedOfficial current subset is 8 versions with 0 findings**, so the
verified core is publishable and the unverified remainder is not. The guarded internal preview may still show
an under-review state; **a badge never converts an unverified fact into a publishable one.**

---

## 9. Corrections made

| # | Correction | Evidence |
|---|---|---|
| 1 | Fireball reclassified from special ball to **drawn add-on** with the replacement mechanic | `pick3`, `pick5` |
| 2 | **EZmatch added** as `purchaseTime`, forbidden from rendering as a result | `floridaLotto` |
| 3 | **Combo added** as `purchaseTime` | `jackpotTriplePlay` |
| 4 | Cash Pop prize → **`stakeDependentPrize`** with stakes and 5×–250× range | `cashPop` |
| 5 | Florida Lotto Double Play given **its own $250,000 prize** | `floridaLotto` |
| 6 | Mega Millions **split into two versions**; current multiplier typed `builtIn` | `megaMillions` |
| 7 | Fantasy 5 prize → **`variableTopPrize`** with rolldown | `fantasy5` |
| 8 | **Cash4Life recorded as retired** 2026-02-21 with history retained | `cash4life` |
| 9 | **Pick evening draw time corrected 7:57 PM → 9:45 PM ET** (8 rendered strings) | `pick3`, `pick5` |
| 10 | Florida Lotto cutoff conflict recorded (export implies 10:25 p.m.; official 10:55 p.m.) | `floridaLotto` |
| 11 | Pick 2 / Pick 4 / pre-2025 Mega Millions marked `underReview` rather than assumed | absence of evidence |

**Schedule conflicts are recorded, not silently reconciled** (`CLAUDE.md` §2). `SCHEDULE_CONFLICTS` preserves
each production-export value beside the official one, so nobody "fixes" a corrected value back to the stale
one. Fantasy 5 is recorded as **agreeing** with the export — the staleness is Pick-specific, not systematic.

---

## 10. Unresolved items

| # | Item | Owner |
|---|---|---|
| U-1 | Pick 2 and Pick 4 official pages not fetched → `underReview` | Content ops |
| U-2 | Pre-2025 Mega Millions ball ranges and Megaplier terms unverified | Content ops |
| U-3 | Florida Lotto draw **days** ("twice a week") not stated on the game page | Content ops |
| U-4 | Jackpot Triple Play draw days/times not on the game page | Content ops |
| U-5 | Whether Florida has any non-retail purchase path — keeps commerce at `underReview` | Legal + content ops |
| U-6 | Florida Lotto cutoff conflict: is the export or our reading of the draw time wrong? | Data ops |
| U-7 | `/play/{game}` vs `/buynow/{code}` | Deferred (`FD-S-32`) |
| U-8 | The 42 other active jurisdictions have no verified format or capability records | Per `FD-X-14` order |
| U-9 | `04-sample-data/result-format-definitions.json` still holds the 12 provisional cloned entries; the new registry supersedes it for governance but the JSON was left untouched | Follow-up cleanup |

---

## 11. Prototype V1 implications

1. **The verified core is 8 of 11 current formats.** V1 may render all of them in the guarded preview; only
   the verified subset may ever publish publicly.
2. **Cash Pop must stop showing a prize figure.** The drawn number and daypart are publishable; the `$250`
   is not, without stake context.
3. **EZmatch and Combo belong to game rules and Buy Now explanation** — never to a result card. The gate
   enforces it, so V1 cannot regress here.
4. **Jackpot labels must render their kind.** "Est. annuitized jackpot" with a separate cash value for
   Powerball/Mega Millions; "advertised jackpot" with no cash value for Florida Lotto and JTP.
5. **Buy Now can be built now.** The resolver has sufficient typed inputs; Florida's outcome is an
   `underReview` explanation plus a `Where to Play` supporting link, with `Buy Now` still the visible CTA.
6. **Pick 2 / Pick 4 need two page fetches** to reach a fully publishable Florida set — the cheapest
   remaining item on the `FD-N-12` cutover gate.
7. **No component changed.** V1 inherits this contract without any Florida-specific branch; every other
   jurisdiction supplies the same shapes (`FD-X-01`).
