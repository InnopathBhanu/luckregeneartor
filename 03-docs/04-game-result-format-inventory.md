# Game Result Format Inventory — LotteryCorner (reference project)

Discovery of how lottery result formats are configured and rendered in
`00-reference-existing-project/LotteryCorner40`. Read-only; reference not modified. No UI/API built.
Cross-refs: `09-state-page-template-requirements.md`, `03-revenue-inventory.md`, `01-url-inventory.md`, `CLAUDE.md`.

> **Headline:** result formats are **NOT uniform**. They are encoded as **per-game HTML templates with
> positional `printf` placeholders** (`ResultFormat_Upgrade.properties`), selected at render time by
> **hardcoded Java if/else on gameId + draw-date cutoffs + result-array size/flags**. Ball counts range
> from digit games up to **~20–21 drawn values**. Special balls, multipliers, add-ons (Fireball/Sum),
> Double Play, and **date-effective historical formats** all exist.

> **Update (reference DB/CSV pass):** game/state IDs are now resolved from
> `04-sample-data/reference-tables/` (see **Reference Tables Used**). Games **511/371 = Indiana Quick Draw
> (Keno, 20+1)**, **509 = Illinois Lotto (6+1)**. The schema already contains a structured
> **`bonus_numbers_info`** table (ball groups per game) — the basis for the recommended future contract.

---

## Reference Tables Used

Source: `04-sample-data/reference-tables/` — `game.csv` (376 games), `state_info.csv` (states),
`state_game.csv` (game↔state), `schema-only.sql` (DDL). These resolve the numeric IDs used by
`ResultFormat_Upgrade.properties` and `GameResultsWeb`.

**Key columns**
- `game.csv` / `game` table: `ID, NAME, UNIQUE_NAME, PLAY_TYPE, IS_MULTI_STATE, isCardGame, `**`NUM_OF_BALLS`**`, DIS_GAME_TYPE, TINBU_GAME_ID, isJackpot, PRIZE_MATRIX, HOWTOPLAY, CUTOFFTIME`. `NUM_OF_BALLS` is a compact spec, e.g. `5+1+1`, `20+1`, `2+2`, `6+6`, `4+4+4`, `3+1`.
- `state_info.csv`: `ID, NAME, STATECODE, ONLYMULTISTATE, TAX_RATE, …`.
- `state_game.csv`: `GAME_ID, STATE_ID, ORDER_ID` (a game maps to many states; multi-state IDs map to all participating states).

**Resolved IDs referenced elsewhere in this doc**

| ID | Game | State(s) | Multi | NUM_OF_BALLS | PLAY_TYPE | Notes |
|----|------|----------|:--:|-----|-----|-------|
| 1012 | Powerball | multi | T | `5+1+1` | 5/69+1/26 | main + Power Ball + Power Play |
| 1013 | Mega Millions | multi | T | `5+1` | 5/70+1/24 | Mega Ball (+ Megaplier "Multiplier") |
| 1010 | Lucky for Life | multi | T | `5+1` | 5/48+1/18 | Lucky Ball |
| 1017 | Cash4Life | multi | T | `5+1` | 5/60+1/4 | Cash Ball |
| 1018 | Lotto America | multi | T | `5+1+1` | 5/52+1/10 | Star Ball + All Star Bonus |
| 1008 | Tri-State Megabucks Plus | ME/NH/VT | T | `5+1` | 5/41+1/6 | |
| 1009 | 2by2 | KS/NE/ND/WY | T | `2+2` | 2/26+2/26 | 2 red + 2 white |
| 1014 | Wild Card 2 | ID/MT/ND/SD | T | `6+1` | 6/53 | **card game** |
| 316 | SuperLotto Plus | CA | F | `5+1` | 5/47+1/27 | "Mega" ball |
| 337 | Lotto (Florida) | FL | F | `6+6` | 6/53+6/53 | **Double Play (two 6-number draws)** |
| 507 | Super Cash | WI | F | `6+1` | 6/39 | Doubler flag in results array |
| 509 | Lotto | IL | F | `6+1` | 6/52 | `.max2/.lottomax` variants (multi-draw display — confirm) |
| 511 | Quick Draw Midday | IN | F | `20+1` | 10/80 | **Keno — 20 drawn + bonus (~21 slots)** |
| 371 | Quick Draw Evening | IN | F | `20+1` | 10/80 | **Keno** |
| 516 | Mega bucks | MA | F | `6+1` | 6/44 + 1-Digit | doubler at size 7 |
| 517 | Classic Lotto 47 | MI | F | `6` | 6/47 | double/doubleplay variants |
| 526 | Pick 6 | NJ | F | `6+1` | 6/49 | old/doubleplay variants |
| 537 | Palmetto Cash 5 | SC | F | `5+1` | 5/38 | old at size 6 |
| 432 | Cash 5 | NC | F | `5` | 5/43 | double/doubleplay |
| 476–479 | Pick 3 (Morning/Day/Eve/Night) | TX | F | `3+1` | 3-Digits+1 | **Fireball from 04/28/2019** |
| 480–483 | Daily 4 (Morning/Day/Eve/Night) | TX | F | `4+1` | 4-Digits+1 | **Fireball from 04/28/2019** |
| 428–431 | Pick 3 / Pick 4 (Day/Eve) | NC | F | `3+1`/`4+1` | Digits+1 | **Fireball 09/21/2022; Sum ball 2018–2022** |
| 421/422 | Numbers (Mid/Eve) | NY | F | `3` | 3-Digits | old Fireball format |
| 423/424 | Win 4 (Mid/Eve) | NY | F | `4` | 4-Digits | old Fireball format |
| 600–603 | Pick 4 (Morning/Midday/Sunset/Evening) | US Virgin Islands | F | `4+4+4` | 4-Digits | **triple-draw (3 sets)** |
| 384/393/546/571 | 5 Card Cash | KY/MD/WI/NJ | F | `5` | PlayingCardGame | **card game** |
| 403 | Poker Lotto | MI | F | `5` | PlayingCardGame | **card game** |
| 576 | WPT | ME | F | `5` | PlayingCardGame | **card game** |
| 628 | Lotto (Arkansas) | AR | F | `6+1` | 6/40+1/40 | Bonus |

### Config ↔ CSV coverage
- **117** distinct gameIds have an **explicit format template** in `ResultFormat_Upgrade.properties`.
- **All 117 resolve to a row in `game.csv`** → **no orphan template IDs** (item 6: none missing).
- **259 of 376** `game.csv` games have **no explicit template** → they render via the **size-based default builder** (`getDefaultResultFormat`) — expected for simple digit/standard games (item 7). Card games use the card default builder.

### Schema connection (result storage)
- `game` — game metadata (`NUM_OF_BALLS`, `PLAY_TYPE`, `isCardGame`, `IS_MULTI_STATE`, `TINBU_GAME_ID`).
- `game_result` — one row per **draw event** (`EVENT_ID`, `GAME_ID`, `DRAW_TIME`, `PRIZE`, `JACKPOT_CASH_VALUE`, `payout_xml`).
- `event_result` — one row per **drawn value** (`EVENT_ID`, `ORDER_ID`, `DRAWN`); ordered by `ORDER_ID` this **is** the `List<Short>` fed to `String.format`.
- **`bonus_numbers_info`** — **structured ball-group metadata per game**: `GAME_ID, ORDER_ID, BALL_TYPE, BALL_NAME, NUM_OF_BALLS, MIN, MAX, required, different_set, BONUS_INFO`. This is the schema-level format model that the current renderer largely bypasses in favor of HTML templates. **No CSV data provided for this table — DDL only.**

---

## 1. Result-format config / properties files (`src/config/`)
| File | Role |
|------|------|
| **`ResultFormat_Upgrade.properties`** (108 KB) | The core: HTML result templates keyed by `gameId[.variant].upgrade` with `%N$d` placeholders. Also `default.format.*` (generic ball row) and `default.format.card.*` (card games). |
| `StateGamePoperties.properties` (40 KB) | Per `state.gameId.*` metadata: `playtype` (e.g. `ca.1013.playtype = 5/70 + 1/25 (Mega Ball)`), `howtoplay`, `advancedplays`, `cutofftime`. Human-readable ball ranges live here, not machine format. |
| `GameLogo.properties` (33 KB) | `State.Game_Name = logo.webp` mapping. |
| `ResultsReaderConfig.properties` (27 KB) | Maps the external results feed (Tinbu) → gameId / parsing config. |
| `FrequencyChart.properties`, `SimpleSmartPicks.properties`, `YearlyUrlsConfig.properties` | Analysis/history-URL config (secondary). |
| `Application.properties`, `Affiliate.properties`, `src/config/xmls/*` | App config; affiliate (`03-...`); XML content (FAQs, tax, email templates). |

## 2. Data model (how a result is stored)
- **`GameResults.results` = `List<Short>`** — the drawn values in a single flat list. This list **mixes** main numbers + special/bonus ball(s) + multiplier value + occasional **flags** (e.g. game 507 uses `results.get(6)==1` as a Doubler flag). Order is significant and coupled to the template.
- Pojos: `pojo/core/Game.java` (game def, `isCardGame()`, timezone, id/uniqueName), `pojo/core/GameResults.java` (results, drawTime, prize, info), `pojo/core/BonusNumbersInfo.java`, `pojo/ui/GameResultsWeb.java` (renderer), `GameResultDTO.java`, `ResultsWrapper.java`, `LatestGameResultsInfo.java`.
- Result data ingested via **Tinbu feed** (`quartz/TinbuUSResultsReader.java` + `TinbuUSResultsValidator.java`, `ResultReaderJob.java`) and **admin XML upload** (`admin/UpdateResultsFromXmlAction.java`, `uploadresults.jsp`, `updateresultsfromxml.jsp`). JSON output via `JsonResultsOutputAction`.
- **Format metadata is NOT stored with the result data** — it is inferred from `gameId` + `drawTime` + `results.size()` at render time (see §6, §8).

## 3. Rendering pipeline
`GameResultsWeb.getResultsHTMLString(dbResults, game, special, format)`:
1. Selects a template key via a large **`if/else` on `gameId`** (date/size/flag conditions, §8).
2. `ApplicationProperties.getResultFormat(gameId, special, "upgrade")` → looks up key `gameId.upgrade` (special null) or `gameId.<special>.upgrade`.
3. `String.format(template, results.toArray())` fills `%1$d..%N$d`.
4. **Fallbacks:** template null / `String.format` throws (size mismatch) → silently falls back to `getDefaultResultFormat(size, hasBonus, version)` (builds a generic ball row from `default.format.number.start/end`, last ball as bonus). **Card games** (`game.isCardGame()`) → `getDefaultCardGameResultFormat` using `%s` string values.
5. `format` = page context ("upgrade" for current pages; also `.welcome` on home, `.smart` for smart picks).

## 4. Template variants (the `.variant` in the key)
Observed suffixes and meaning:
- `.upgrade` (default current), `.old` / `.old.format` (**historical/pre-change format**), `.fire` (Fireball add-on, **43+ keys**), `.doublefire` (double + Fireball), `.wild` (Wild ball), `.double` / `.doubleplay` (**Double Play** = a second full ball row, placeholders `%8..%13`), `.doubler` (Doubler), `.max` / `.max1` / `.max2` / `.lottomax` (multi-line / Lotto-Max style), `.super`, `.sum` (Sum ball), `.single`, `.mega` (Megaplier row), `.powerup`, `.welcome` (homepage), `.smart` (smart-picks display).

## 5. Ball / value count distribution
Max placeholder index per template (**includes** special ball + multiplier + Double-Play second row):

| Max `%N$` | # format keys | Interpretation |
|-----------|---------------|----------------|
| 3 | 11 | 3-number/digit games |
| 4 | 45 | 4-digit / 2by2 (4 balls) |
| 5 | 44 | 5-ball games |
| 6 | 38 | 5+1 special (Powerball/Mega/etc.) or 6-ball |
| 7 | 15 | 5+1 + multiplier, or 6+bonus |
| 8–10 | 14 | 6+bonus+extras / 10-value games |
| 12–13 | 14 | **Double Play** (2×6) games (e.g. 1012 doubleplay = 13) |
| 19 | 2 | 509 `.lottomax`/`.max2` (Lotto-Max/multi-draw) |
| 21 | 2 | **511, 371** — ~20-value games (Keno-type) |

- **Small digit games (1–2 values: Cash Pop = 1 ball, Pick 2)** have **no explicit template** → rendered by the **size-based default builder** (`getDefaultResultFormat`). So the low end is handled dynamically, not by per-game templates.
- **Card games** (IDs noted in config: 384, 393, 546, 1014, 403, 571, 576) render playing-card values via `%s` (card format), not numeric balls.
- **15+ values confirmed:** **511/371 = Indiana Quick Draw (Keno, `20+1` = 20 drawn + bonus, ~21 slots)**. **509 = Illinois Lotto (`6+1`)** — its 19-placeholder `.max2/.lottomax` templates render a multi-draw/combined view (exact rule to confirm). **600–603 = USVI Pick 4 (`4+4+4`, three draw sets)** = 12 slots.

## 6. How formats vary by state/game
- **Game ID is the format key**, and multi-state game IDs are shared across states (1012 Powerball, 1013 Mega Millions, 1010 Lucky for Life, 1017 Cash4Life, 1018 Lotto America, 509 Lotto-Max-style). State-specific games have their own IDs (e.g. 507 Wisconsin Super Cash, 316 CA, 628 AR lotto, NY 421–424/337/526).
- Same game can render differently by **draw date** (historical), **result size** (variant), or a **flag** in the results array — see §8.
- Per-state textual metadata (playtype/howtoplay/cutoff) is in `StateGamePoperties.properties` keyed `state.gameId.*`.

## 7. Special ball names & colors
Label text (from templates) + CSS class (color):
- **Power Ball** (`highlighted`), **Mega Ball** (`highlighted2`), **Lucky Ball** (`highlighted1`), **Cash Ball** (`highlighted7`), **Star Ball** (`highlighted5`), **Bonus** (`highlighted4`), **Fire Ball** (49 keys — Pick-3/4 add-on), **Sum** (12), **Doubler** (`doubler` class), **Extra**, **2by2** uses `red`/`white` classes (2 red + 2 white, no label).
- **Color is encoded as CSS class (`highlighted1..7`)**, not a token — the class→color mapping lives in CSS (not decoded here; see Questions/Risks).

## 8. Historical / date-effective format changes (HARDCODED in `GameResultsWeb`)
Selection depends on `gameId` + `drawTime` cutoff + `results.size()`:
- **IDs 476–483 = Texas Pick 3 / Daily 4** (all draw times): **Fireball from `04/28/2019`**; draws before that → `.old`.
- **IDs 428–431 = North Carolina Pick 3 / Pick 4** (Day/Eve): **Fireball from `09/21/2022`**; **Sum ball `02/27/2018`–`09/21/2022`** → `.old`; size 6 → `.fire`, size 8 → `.doublefire`.
- **IDs 421/422 = NY Numbers (3-digit), 423/424 = NY Win 4 (4-digit), 337 = Florida Lotto (6+6 Double Play), 526 = NJ Pick 6**: older results → `.old` (size-gated: 421/422 size 4, 423/424 size 5, 337/526 size 7).
- **ID 507 = Wisconsin Super Cash:** `results.get(6)==1` → `.doubler` variant (flag-driven).
- **ID 537 = SC Palmetto Cash 5:** size 6 → `.old`. **ID 516 = MA Mega bucks:** size 7 → `.doubler`.
- All other games → `getResultFormat(gameId, special, format)` with the passed-in `special`.
> These magic dates/sizes **must be preserved exactly** or historical result pages (`/{state}/{game}/{year}`, ~8,700 URLs) will render wrong. This is the single most fragile area.

## 9. if/else conditions related to result display
- Concentrated in **`GameResultsWeb.getResultsHTMLString`** (the big gameId if/else, §8).
- `ApplicationProperties.getResultFormat` / `getDefaultResultFormat` / `getDefaultCardGameResultFormat` (key building + generic fallback).
- Callers pass `special`/`format`: `StateResultsAction`, `GameResultsAction`, `GameResultsHistoryAction`, `CommonResultsCache`, `MyFavouriteGamesAction`.
- `game.isCardGame()` branch (card vs numeric).
- Silent fallback on `String.format` exception → default format (bad/edge data degrades quietly; errors logged only for draws within last 10 days).

## 10. State/game-specific display exceptions
- **No-lottery states** (`al/ak/hi/ut/nv`) → dedicated `state_XX.jsp`, no result rendering (`01-...` §3).
- **Card games** (§5) → card render mode.
- **Wisconsin 507** Doubler flag; **NY** legacy formats; **Double Play** games (Powerball 1012, plus 337/432/517/526) render two rows.
- **Home** uses `.welcome` variants; **smart picks** use `.smart`.

## 11. How result format is currently encoded (summary)
- **Numbers:** DB `List<Short>` (feed: Tinbu; or admin XML upload). Flat, order-significant, includes specials/multiplier/flags inline.
- **Format:** **presentation-layer HTML templates** in `ResultFormat_Upgrade.properties`, chosen by hardcoded logic. **There is no machine-readable format schema in the data** — no ball-group/label/color model; it's implicit in the template + Java conditions.

## 12. How the future UI should render results dynamically
Do **not** port the `printf`-HTML approach. Render from **explicit format metadata**:
- A `ResultFormatDefinition` per game (+ `EffectiveDateRange` for historical formats) describing:
  - `ballGroups[]` (each: count, value type numeric/digit/card, min/max range), rendered generically.
  - `specialBalls[]` (label e.g. "Power Ball", colorToken, position).
  - `multiplier` / add-ons (Power Play, Megaplier/Multiplier, All Star Bonus, Fireball, Sum, Wild) with label + value.
  - `doublePlay` / secondary draw group (model as a second result set, not `%8..%13`).
  - `cardGame` flag (render card faces).
- UI maps each drawn value to a slot by **metadata**, not positional string formatting. Colors are **design tokens**, not CSS `highlightedN` classes.
- Must gracefully render the full range: **1 ball → 20+ values**, wrapping ball grids on mobile (per `09-...`).

## 13. Recommendations for future config / API contract
- **API returns numbers + format metadata** (or a stable `formatId` + `effectiveDate` referencing a config table), so the UI never infers format from array size.
- **Move date-effective logic out of hardcoded Java** into data-driven `EffectiveDateRange` records (migrate the exact cutoffs in §8 verbatim).
- **Separate concerns in the result payload:** main numbers, special balls (named), multiplier, add-ons, double-play set, flags — instead of one flat `List<Short>`.
- Preserve all existing variant behavior (`old/fire/doublefire/sum/wild/double/doubler/max/lottomax`) as config, not code.
- Keep a **default/generic renderer** for games without explicit config (mirror `getDefaultResultFormat`).
- Feeds into CLAUDE.md config concepts: `GameDefinition`, `ResultFormatDefinition`, `EffectiveDateRange`, `BallGroupDefinition`, `BallDefinition`, `BonusBallDefinition`, `MultiplierDefinition`.

---

## Recommended Future Result Format Contract

The new API should expose **result display metadata** so the UI renders dynamically and **no HTML
template lives in the UI**. This maps cleanly onto the existing schema (`game`, `game_result`,
`event_result`, and especially **`bonus_numbers_info`**) — build the contract from data, not `.properties` HTML.

### Principles
- **UI renders from metadata, never from server HTML strings.** Retire `ResultFormat_Upgrade.properties`-style templates for the new UI. (History-page rendering must stay visually identical — see Preservation.)
- **Format is versioned by effective date**, so historical draws render in the format that was live on their draw date (replaces the hardcoded date if/else in `GameResultsWeb`).
- Numbers are **grouped and labeled**, not a flat positional array.

### Proposed shape (illustrative, not final)
```
GET /api/games/{gameId}/result-format?date={drawDate}   → ResultFormatDefinition
GET /api/results/{state}/{game}[/{date|year}]           → DrawResult (numbers + formatRef)
```
```jsonc
// ResultFormatDefinition  (derivable from bonus_numbers_info + game.NUM_OF_BALLS)
{
  "gameId": 1012, "gameName": "Powerball", "isMultiState": true, "isCardGame": false,
  "effectiveFrom": "2015-10-07", "effectiveTo": null,          // EffectiveDateRange
  "ballGroups": [                                              // ordered by ORDER_ID
    { "order": 0, "ballType": "MAIN",   "label": null,        "count": 5, "min": 1, "max": 69,
      "differentSet": false, "required": true, "colorToken": "ball.default" },
    { "order": 1, "ballType": "SPECIAL","label": "Power Ball", "count": 1, "min": 1, "max": 26,
      "differentSet": true,  "required": true, "colorToken": "ball.powerball" }
  ],
  "multipliers": [ { "label": "Power Play", "suffix": "X" } ],  // add-ons: Megaplier, All Star Bonus, Fireball, Sum, Wild, Doubler
  "secondaryDraw": null,                                        // e.g. Double Play / FL Lotto 6+6 / USVI 4+4+4 → another ballGroups set
  "cardFaces": false                                            // true → render playing-card faces (5 Card Cash, Poker Lotto, WPT, Wild Card 2)
}
```
```jsonc
// DrawResult
{ "eventId": 123, "gameId": 1012, "drawTime": "2026-07-06T22:59:00-04:00",
  "prize": "$750,000,000", "jackpotCashValue": "$...",
  "groups": [ {"order":0,"values":[5,23,34,56,67]}, {"order":1,"values":[14]} ],
  "multipliers": [ {"label":"Power Play","value":3} ],
  "secondaryGroups": null,
  "formatRef": {"gameId":1012,"effectiveFrom":"2015-10-07"},   // ties to the ResultFormatDefinition
  "lastUpdated": "2026-07-06T23:05:00-04:00" }
```

### Mapping to existing schema (no new source of truth needed)
- `ballGroups[]` ← **`bonus_numbers_info`** rows for the game (`ORDER_ID, BALL_TYPE, BALL_NAME, NUM_OF_BALLS, MIN, MAX, required, different_set`).
- `values` ← **`event_result`** rows (`ORDER_ID, DRAWN`) grouped per `ballGroups` definition (replaces the flat `List<Short>` + positional `String.format`).
- `isMultiState`/`isCardGame`/`gameName`/`NUM_OF_BALLS` ← **`game`** table.
- `effectiveFrom/To` ← new versioning table (migrate the §8 cutoffs verbatim: `04/28/2019`, `09/21/2022`, `02/27/2018`, plus size/flag rules → date-versioned format rows).
- `colorToken` ← replace CSS `highlighted1..7` with named tokens (needs the CSS color mapping — see Questions).

### Preservation guarantees
- **History pages must render identically** to today. The new metadata contract must reproduce every existing variant (`old/fire/doublefire/sum/wild/double/doubler/max/lottomax/card`) and every date cutoff; verify old draws against current output before switch-over.
- Keep a **generic default renderer** (mirror `getDefaultResultFormat`) for the **259** games without explicit templates, driven by `game.NUM_OF_BALLS` + `bonus_numbers_info`.
- Populate `bonus_numbers_info` for all games (DDL exists; **data not provided** — see Unknowns).

---

## Risks
- **Fragile hardcoded date/size logic** (§8) — porting must replicate every cutoff (`04/28/2019`, `09/21/2022`, `02/27/2018`) and size/flag rule or historical pages break.
- **Positional `String.format` coupling** — result-array order must match template exactly; mismatches fall back silently to default format (data errors hidden).
- **Inline flags/multipliers in `List<Short>`** (e.g. 507 index 6) — ambiguous without the template; risky to model in an API.
- **Colors via CSS `highlighted1..7`** — the class→color mapping is in CSS, not decoded here; needed to preserve visual identity.
- **`bonus_numbers_info` has DDL but no data** in the reference CSVs — the structured ball-group model can't be validated per-game until that data is provided; some `game.NUM_OF_BALLS` specs (e.g. `6+6`, `4+4+4`, `20+1`) will need careful group decomposition.
- **509 (Illinois Lotto)** `.max2/.lottomax` 19-slot templates — the exact multi-draw/combined rule is inferred, not confirmed.

## Questions for Bala
1. **Resolved via CSVs:** 511/371 = Indiana Quick Draw (Keno 20+1), 509 = Illinois Lotto (6+1). Confirm the Illinois Lotto **`.max2/.lottomax` (19-slot)** rule — is it a combined multi-draw display?
2. What is the **CSS color** for each `highlighted1..7` / `doubler` / `red` / `white` class (to preserve special-ball colors as tokens)?
3. Will the new **API expose format metadata** (preferred — see contract), or keep per-game templates? Is the results feed still **Tinbu** (`TINBU_GAME_ID`)?
4. Should **Double Play / doublefire** and multi-draw sets (**FL Lotto 6+6, USVI Pick 4 4+4+4**) be modeled as a **`secondaryDraw`/multiple result sets**?
5. Any **format changes since the 2018–2022 cutoffs** (§8) not yet reflected in code?
6. Can the **`bonus_numbers_info` data** (not just DDL) be provided, so we can drive the format contract from it?

## Next suggested step
Proceed to the **Business Rule inventory** → `03-docs/05-business-rule-inventory.md` (jackpot display rules, draw-date/next-draw handling, prize formatting `LuckUtils.formatePrizeString`, no-lottery-state logic, smart-picks/insider rules, and any remaining game/state/date conditionals) — the last discovery doc before sample-data schema design.
