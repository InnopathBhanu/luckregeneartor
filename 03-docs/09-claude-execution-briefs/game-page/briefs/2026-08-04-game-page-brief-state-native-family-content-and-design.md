# Claude Code Execution Brief: State-Native Game Family Page

**Status:** Ready for Claude Code execution after founder review  
**Date:** 2026-08-04  
**Primary reference route:** `/fl/pick-3`  
**Preview guard:** `LC_GAME_PREVIEW=true`  
**Implementation owner:** Claude Code  
**Content and task preparation:** ChatGPT/Codex  

## 1. Founder Direction

Build one complete State Game Page family rather than separate pages for every daily draw variant.

For example:

- `/fl/pick-3` is the canonical Florida Pick 3 page.
- Midday and Evening remain separate draw records, with their own game IDs, dates, times, results and statuses.
- Both render as stable rows under one Pick 3 identity and one logo.
- Candidate old URLs such as `/fl/pick-3-midday` and `/fl/pick-3-evening` should eventually 301 to `/fl/pick-3`, but only after Claude verifies the real legacy URL inventory and records the redirect decision.

The State Page must use the same presentation rule: one game identity, then two or more draw rows where the game has multiple daily drawings.

This task is also the design reference for other full State-native game pages. It is not the design for the future global `/powerball` or `/mega-millions` ecosystems.

## 2. Important Correction to the Current Review Direction

The Pick 3 design review must show all eighteen approved `JG-01` through `JG-18` content sections. The prior short Florida Powerball V0 is a `JG-M1` minimal local offering and is not a complete reference for Pick 3.

Do not make Pick 3 look like a longer version of the current Florida Powerball screenshot. Start from the approved blueprint, the accepted Home/State visual language, the content below and the needs of a frequent Pick 3 player.

## 3. Product Modes

### JG-M1: State-specific view of a multi-state game

Examples:

- `/fl/powerball`
- `/fl/mega-millions`

These pages own meaningful Florida-specific content: local availability, add-ons, local buying information, claim information, local winners/news/community and responsible-play resources.

Universal history, statistics, generators and general game rules belong to the future global `/powerball` and `/mega-millions` pages. A local page may preview and route into those tools after the global routes exist.

### JG-M2: Full State-native game

Examples:

- `/fl/lotto`
- `/fl/jackpot-triple-play`
- `/fl/fantasy-5`
- `/fl/pick-2`
- `/fl/pick-3`
- `/fl/pick-4`
- `/fl/pick-5`
- `/fl/cash-pop`

These pages own the complete game experience and must support all eighteen sections where the required data or an approved internal-review fixture is available.

## 4. Source Documents Claude Must Read First

Read completely before changing code:

1. Root `CLAUDE.md`
2. `03-docs/09-claude-execution-briefs/README.md`
3. `03-docs/09-claude-execution-briefs/game-page/README.md`
4. `03-docs/01-approved-blueprints/games/05-lotterycorner-game-page-blueprint-index-FINAL-APPROVED.md`
5. `03-docs/01-approved-blueprints/games/05B-lotterycorner-jurisdiction-game-page-blueprint-FINAL-APPROVED.md`
6. `03-docs/01-approved-blueprints/games/05C-lotterycorner-tools-and-ai-insights-blueprint-FINAL-APPROVED.md`
7. `03-docs/04-page-specifications/game/florida-powerball-game-page-v0-implementation.md`
8. `03-docs/04-page-specifications/game/florida-powerball-game-page-v0-founder-review.md`
9. The accepted Home, State and Global Footer implementation records, only for shared visual and interaction primitives
10. The current State family configuration, draw-event feed, date-effective result-format registry, commerce resolver, claim manifest and existing legacy game/history routes

The Powerball V0 implementation is evidence about the current system and shared primitives. It is not the visual blueprint for this full Pick 3 page.

## 5. Trust and Official-Source Copy Policy

Do not repeat “check the official site,” “verify with the official source” or equivalent copy throughout the page. Repetition weakens LotteryCorner as the destination and makes every answer feel provisional.

Use this policy instead:

1. Normal verified results show a concise source/freshness line once near the result, such as `Updated [time] · Florida Lottery results feed`.
2. A stale, pending, delayed or corrected result gets one contextual exception notice beside the affected result.
3. The checker result states once that only the lottery can validate a ticket, because that is a necessary transactional boundary.
4. Claims/tax/privacy show only sourced facts. Suppress an unverified field instead of filling the section with warnings.
5. `JG-18` contains the complete source, methodology, corrections, independence and Responsible Play explanation.
6. Do not add an official-source warning to every tool, article card, insight or content section.

LotteryCorner should confidently answer from governed data, clearly label exceptions, and make source details available without constantly sending the reader away.

## 6. Page-Level Content

### SEO title

`Florida Pick 3 Results, Winning Numbers, Payouts and Tools | LotteryCorner`

### Meta description

`See Florida Pick 3 Midday and Evening results, check your numbers, explore payouts and history, generate number sets, and learn how Pick 3 works.`

### H1

`Florida Pick 3 Results, Winning Numbers and Payouts`

### Introductory copy

`Find the latest Florida Pick 3 Midday and Evening winning numbers in one place. Check a set of numbers, compare past draws, understand Straight and Box plays, explore statistics and generate a valid random set for a future drawing.`

### Primary page navigation

Use a compact in-page navigation appropriate to the accepted shell:

- Latest results
- Check numbers
- How to play
- History
- Statistics
- Generator
- Payouts
- News and guides

Do not show eighteen equal navigation pills or eighteen equal cards. The content has eighteen governed sections, but the page must group them into a readable hierarchy.

## 7. The Eighteen Required Sections and Actual Content

Every section needs a stable `JG-xx` marker and a user-facing anchor. For the guarded design review, `/fl/pick-3` must render all eighteen sections in server HTML using governed data where it exists and an unmistakably internal sample fixture where it does not. Sample data must never appear when the guard is off and must never be represented as current production fact.

### JG-01: Game Identity, Latest Variants and Next Draw

**Visible heading:** `Latest Florida Pick 3 results`

**Purpose:** Answer the primary visit intent immediately.

**Content:**

- One Pick 3 identity and one logo/approved neutral mark.
- One prize summary only when the current wager/play context supports it.
- Stable Midday row followed by stable Evening row.
- Each row shows its own draw date, draw time, three winning digits, Fireball value, status and next-draw information.
- Dates may legitimately differ. Never replace an older verified Evening result with the Midday result.
- When a new drawing is pending, show the pending state alongside the last verified result rather than removing it.

**Row labels:**

- `Midday`
- `Evening`

**Compact source line:**

`Updated {resultUpdatedDisplay} · {resultSourceName}`

**Primary result actions:**

- `Check these numbers`
- `Explain this result`
- `View result history`
- `Share`

Only one action should receive primary visual emphasis.

### JG-02: Buy, Retail Guidance and Countdown

**Visible heading:** `Play Pick 3 in Florida`

**Body copy:**

`Choose three digits from 0 through 9, select a play type and choose the drawing you want to enter. Midday and Evening are separate drawings on the same Pick 3 ticket experience.`

**Facts:**

- Ticket/wager options from the verified active rule era
- Next Midday draw
- Next Evening draw
- Current purchase cutoff only when sourced and governed
- Fireball availability and price only when sourced and governed
- Advance Play only when sourced and governed

**Actions:**

- Render `Buy Now` only when the existing first-party resolver returns an eligible option.
- Otherwise show useful retailer or play guidance without presenting a disabled Buy button.

Do not repeat a broad “LotteryCorner does not sell tickets” warning in multiple places. Keep the material commerce disclosure adjacent to the commerce action.

### JG-03: Check My Numbers

**Visible heading:** `Check your Pick 3 numbers`

**Intro copy:**

`Enter the three digits from your ticket, then choose the drawing, play type, wager and Fireball option. The checker compares the ticket with the rules that applied to that drawing.`

**Required inputs:**

- Draw date
- Midday or Evening
- Three position-aware digits
- Play type: Straight, Box, Straight/Box, Combo, Front Pair, Back Pair or the verified active set
- Wager
- Fireball selected: Yes/No

**Required output examples:**

- `All three digits match in exact order.`
- `All three digits match in a different order.`
- `Two positions match your Front Pair selection.`
- `Fireball changes the comparison for this ticket.`
- `This set does not match the selected drawing.`

**Boundary copy after output:**

`This is a results comparison, not ticket validation. The Florida Lottery determines the final prize.`

The comparison and prize logic must be deterministic and rule-era aware. AI may explain an output but must not calculate it.

### JG-04: Game AI

**Visible heading:** `Ask LotteryCorner about Pick 3`

**Intro copy:**

`Ask about the latest drawings, play types, payouts, Fireball, history or the statistics shown on this page.`

**Visible prompts:**

- `Explain the latest Midday result`
- `What is the difference between Straight and Box?`
- `How does Fireball affect a ticket?`
- `Compare Midday and Evening history`
- `Show me where to find a past draw`

**Behavior:**

- Answers use the current page context, selected variant and rule era.
- AI routes calculations to deterministic services.
- Answers may link to the relevant section or tool.
- No claim that AI predicts future numbers.
- No repeated source warning below every answer; source details belong in the answer only when material and in `JG-18` globally.

### JG-05: Live and Upcoming Variants

**Visible heading:** `Today’s Pick 3 drawings`

**Intro copy:**

`Midday and Evening are separate drawings. Each keeps its own result, status and next scheduled time.`

**Variant rows:**

| Drawing | Latest status | Next drawing | Available action |
|---|---|---|---|
| Midday | `{middayStatus}` | `{middayNextDraw}` | `Set reminder` |
| Evening | `{eveningStatus}` | `{eveningNextDraw}` | `Set reminder` |

Supported statuses must come from the existing governed status union: verified, pending, awaiting, delayed or corrected. Do not invent “live” when no real live state exists.

### JG-06: How to Play, Prize Types and Odds

**Visible heading:** `How to play Florida Pick 3`

**Core explanation:**

`Pick 3 uses three digits, one for each position. You can choose the digits yourself or generate a random valid set. Your play type determines whether order matters.`

**Plain-language play-type content:**

- **Straight:** `Match all three digits in the exact order drawn.`
- **Box:** `Match all three digits in any order. Available Box combinations depend on whether digits repeat.`
- **Straight/Box:** `Split the wager between an exact-order play and an any-order play.`
- **Combo:** `Cover every unique order of the selected digits as separate Straight plays.`
- **Front Pair:** `Match the first two digits in exact order.`
- **Back Pair:** `Match the last two digits in exact order.`
- **Fireball:** `An optional drawn number that can replace one of the three Pick 3 digits when the ticket includes Fireball.`

**Prize matrix columns:**

- Play type
- Example number pattern
- Wager
- Match requirement
- Prize
- Odds
- Fireball effect
- Effective rule date

Do not hardcode a payout matrix from memory. Load it from a versioned, sourced rule contract. For the design review, Claude may use a clearly labelled internal sample matrix covering Straight, 3-way Box, 6-way Box, Front Pair and Back Pair.

**Guide links/content:**

- `Straight, Box and Combo explained`
- `How repeated digits change Box combinations`
- `How Fireball works on a Pick 3 ticket`

### JG-07: Results History

**Visible heading:** `Florida Pick 3 results history`

**Intro copy:**

`Browse Midday and Evening results together or filter to one drawing. Every row keeps the draw date and rule era that applied at the time.`

**Controls:**

- Date range
- Midday/Evening/All
- Exact digit search
- Include Fireball
- Previous month / next month

**History table columns:**

- Date
- Drawing
- Winning digits
- Fireball
- Status/correction marker when exceptional
- `View draw`

The first page of real history must be in server HTML and crawlable. Do not create fake historical rows for production. Use an internal review fixture only if the archive is not connected.

### JG-08: Number History

**Visible heading:** `Pick 3 number history`

**Intro copy:**

`See when a digit, pair or exact three-digit result appeared in the selected drawing history.`

**Tools:**

- Search a digit by position
- Search a Front Pair or Back Pair
- Search an exact three-digit result
- Compare Midday with Evening
- Choose a supported date range

**Result language examples:**

- `Digit 7 appeared in the first position {count} times in the selected period.`
- `Pair 2-4 last appeared as a Back Pair on {date}.`
- `Exact result 3-7-8 appeared {count} times in the supported history.`

Always state the selected date range and data coverage. Historical occurrence is descriptive, not predictive.

### JG-09: Statistics and Patterns

**Visible heading:** `Pick 3 statistics`

**Intro copy:**

`Explore descriptive patterns in the selected history. Change the date range or drawing to update every view.`

**Required views:**

- Digit frequency by first, second and third position
- Midday versus Evening comparison
- Repeated-digit distribution: all different, one pair, triple
- Sum distribution
- Front Pair and Back Pair frequency
- Consecutive digits
- Repeat from previous drawing
- Time since last appearance, labelled as a historical gap

**Required controls:**

- Date range
- Midday/Evening/All
- Include/exclude corrected draws
- Table/chart view

**Neutral interpretation copy:**

`These statistics describe the selected history. They do not change the odds of an independent future drawing.`

Do not use “due,” “overdue,” “best,” “winning pattern” or “most likely next.”

### JG-10: Generator

**Visible heading:** `Generate Pick 3 numbers`

**Intro copy:**

`Create a valid random three-digit set for Midday or Evening. You can keep the first set or generate another.`

**Controls:**

- Drawing: Midday/Evening
- Number of sets
- Allow repeated digits: Yes/No, with clear explanation that disabling repeats is a preference filter
- Optional saved-digit preferences only when the product supports them
- Fireball ticket preference, clearly separate from the drawn Fireball result

**Actions:**

- `Generate numbers`
- `Generate again`
- `Save set`
- `Check saved sets after the draw`

**One concise boundary:**

`Every valid Pick 3 combination has the same chance. The generator does not predict a drawing.`

The generator must be deterministic-service backed or use a proven random-number library. AI may configure preferences in plain language but must not manufacture the numbers itself.

### JG-11: Systems and Player Methods

**Visible heading:** `Pick 3 play methods explained`

**Intro copy:**

`Learn how common Pick 3 play methods are structured, what they cost and what they do not change.`

**Content modules:**

- `Straight versus Box: order and coverage`
- `What a wheel or combination set actually covers`
- `Playing repeated digits`
- `Using Front Pair and Back Pair`
- `Setting a fixed entertainment budget`

Each method must show:

- Number of combinations
- Ticket cost from verified wager data
- Match conditions
- What the method does not guarantee

Do not rank systems by profitability or imply that a method improves the draw odds.

### JG-12: Local Offering

**Visible heading:** `Florida Pick 3 game details`

**Content:**

- Operator
- Minimum age, only when verified
- Ticket/wager options
- Midday and Evening schedules
- Sales cutoff, only when verified
- Fireball availability
- Advance Play availability
- Retail and approved online-purchase information from the commerce resolver
- Drawing broadcast/watch destination only when a real route exists

**Body copy:**

`Florida Pick 3 offers separate Midday and Evening drawings. Choose the drawing and play type on the ticket; each drawing is checked independently.`

### JG-13: Claim, Tax and Privacy

**Visible heading:** `Claiming a Florida Pick 3 prize`

**Intro copy:**

`Where and how a prize is claimed depends on the amount and the Florida Lottery’s current claim rules.`

**Content blocks:**

- Claim deadline
- Claim locations by prize threshold
- Mail claim availability
- Ticket-signing/security guidance, only when sourced
- Tax summary, only when sourced
- Winner publicity/privacy rule, only when sourced
- Contact/help destination

Do not render “unverified,” “under review” or a warning card as public content. Suppress an unavailable fact. Keep one necessary statement near the checker/claim action that the lottery determines ticket validity and final payment.

### JG-14: Draw Insights

**Visible heading:** `What changed in recent Pick 3 drawings`

**Intro copy:**

`A concise summary of changes in the selected verified history, based on the filters shown below.`

**Permitted insight examples:**

- `The latest Midday result repeated one digit from the previous Midday drawing.`
- `Two of the last ten Evening results contained a repeated digit.`
- `The selected period contains more 11–15 sums than the previous equal-length period.`
- `Digit 4 appeared in different positions across the latest five matching results.`

Every insight must expose:

- Date range
- Drawing variant
- Deterministic calculation/method
- Link to the supporting history or statistic

AI may summarize deterministic findings. It must not turn a historical observation into a forecast.

### JG-15: News, Guides, Blogs and Winners

**Visible heading:** `Pick 3 news, guides and player stories`

Use four tabs or a similarly compact information architecture:

1. `News`
2. `Guides`
3. `Blogs`
4. `Winners`

**Required Pick 3 content inventory:**

**News**

- `Florida Pick 3 schedule and rule updates`
- `Pick 3 payout or Fireball changes`
- `Corrections affecting a published Pick 3 result`

**Guides**

- `How to play Florida Pick 3`
- `Straight, Box, Combo and pair plays explained`
- `How Fireball changes a Pick 3 comparison`

**Blogs**

- `How to read Pick 3 digit frequency without treating it as a forecast`
- `Why Midday and Evening results need separate dates`
- `Repeated digits: what the historical data shows`

**Winners**

- Real Florida Pick 3 winner stories only when a sourced article and real destination exist
- Never fabricate a winner, prize, location, quotation or publication date

Cards require title, short summary, content type, publication/update date and real destination. During internal design review, editorial fixture items must be explicitly marked as preview data and must not create indexable fake articles.

### JG-16: Community

**Visible heading:** `Florida Pick 3 player discussions`

**Cold-start copy:**

`Start a discussion about a result, play type, checker explanation or Pick 3 history. Questions and replies must not be presented as lottery advice or predictions.`

**LotteryCorner-authored discussion starters:**

- `Do you track Midday and Evening results separately?`
- `Which Pick 3 play type is hardest to understand?`
- `What should a result checker explain after a match?`

**Actions:**

- `Discuss the latest result`
- `Ask Florida players`
- `View Pick 3 discussions`

Do not invent authors, replies, views, likes, timestamps or “popular” status. Clearly label platform-authored starters until real community activity exists.

### JG-17: Save, Follow and Alerts

**Visible heading:** `Save Pick 3 and get the updates you choose`

**Options:**

- Follow Florida Pick 3
- Save generated number sets
- Alert after Midday result
- Alert after Evening result
- Jackpot/top-prize alert only if this game and data support it
- Rule or schedule change alert
- Weekly results summary

**Signed-out copy:**

`Save this game on this device, or sign in to keep number sets and alerts across devices.`

Do not claim an alert was created unless a real alert service exists. In a design-only preview, controls must state their preview status outside the public product UI or remain non-public under the guard.

### JG-18: Sources, Methodology and Responsible Play

**Visible heading:** `About these Pick 3 results and tools`

**Primary copy:**

`LotteryCorner organizes Florida Pick 3 results by drawing, date and rule era. Checkers and statistics use deterministic calculations; AI explains those results and helps route questions to the right tool.`

**Source line:**

`Results source: {operatorOrFeedName} · Last updated {resultUpdatedDisplay}`

**Methodology links:**

- `How results are collected`
- `How corrections are handled`
- `Statistics methodology`
- `AI explanation policy`

**Official resource links:**

- Florida Lottery Pick 3 rules
- Florida Lottery winning numbers
- Florida Lottery claim information
- Responsible Play

**Independence copy:**

`LotteryCorner is an independent lottery information service and is not affiliated with or endorsed by the Florida Lottery.`

This is the page’s complete trust area. Do not duplicate this block’s wording in earlier sections except where the trust policy in Section 5 requires a contextual exception.

## 8. Visual Grouping of the Eighteen Sections

All eighteen sections must exist, but they should be composed into a manageable page rather than eighteen equal cards.

Recommended visual bands:

1. **Result and immediate action:** JG-01, JG-02
2. **Do something now:** JG-03, JG-04
3. **Today and game rules:** JG-05, JG-06
4. **History and analysis workspace:** JG-07, JG-08, JG-09
5. **Generate and learn:** JG-10, JG-11
6. **Florida player information:** JG-12, JG-13
7. **Fresh context and content:** JG-14, JG-15
8. **Community and return:** JG-16, JG-17
9. **Trust:** JG-18

Desktop may use a tool workspace layout inside the history/analysis band. Mobile must remain a single clear reading flow with no horizontal page scrolling.

## 9. Multi-Draw Family Contract

Do not merge underlying draw-event records.

Each family member retains:

- `gameId`
- variant label
- stable display order
- own latest result
- own result date/time
- own status
- own schedule and cutoff
- own history query identity
- own correction state

Required Florida family composition for review:

| Canonical family | Stable rows |
|---|---|
| Fantasy 5 | Midday, Evening |
| Pick 2 | Midday, Evening |
| Pick 3 | Midday, Evening |
| Pick 4 | Midday, Evening |
| Pick 5 | Midday, Evening |
| Cash Pop | Morning, Matinee, Afternoon, Evening, Late Night |

Single-draw families still use the same family contract with one member row.

## 10. Target Florida Routes

Claude should design one shared configuration-driven family page that can represent these ten routes without game-specific JSX branches:

| Route | Mode |
|---|---|
| `/fl/powerball` | JG-M1 local multi-state offering |
| `/fl/mega-millions` | JG-M1 local multi-state offering |
| `/fl/lotto` | JG-M2 full State-native |
| `/fl/jackpot-triple-play` | JG-M2 full State-native |
| `/fl/fantasy-5` | JG-M2 full State-native, two rows |
| `/fl/pick-2` | JG-M2 full State-native, two rows |
| `/fl/pick-3` | JG-M2 full State-native, two rows |
| `/fl/pick-4` | JG-M2 full State-native, two rows |
| `/fl/pick-5` | JG-M2 full State-native, two rows |
| `/fl/cash-pop` | JG-M2 full State-native, five rows |

The ten-route list is a target inventory, not permission to invent route data. Claude must reconcile it with the route audit, live legacy mappings and existing canonical decisions.

## 11. Candidate Legacy Consolidation

Founder intent is to consolidate variant URLs into the canonical family page.

Candidate mappings to verify before implementation:

| Candidate old URL | Target |
|---|---|
| `/fl/florida-lotto` | `/fl/lotto` |
| `/fl/fantasy-5-midday` | `/fl/fantasy-5` |
| `/fl/fantasy-5-evening` | `/fl/fantasy-5` |
| `/fl/pick-2-midday` | `/fl/pick-2` |
| `/fl/pick-2-evening` | `/fl/pick-2` |
| `/fl/pick-3-midday` | `/fl/pick-3` |
| `/fl/pick-3-evening` | `/fl/pick-3` |
| `/fl/pick-4-midday` | `/fl/pick-4` |
| `/fl/pick-4-evening` | `/fl/pick-4` |
| `/fl/pick-5-midday` | `/fl/pick-5` |
| `/fl/pick-5-evening` | `/fl/pick-5` |
| `/fl/cash-pop-morning` | `/fl/cash-pop` |
| `/fl/cash-pop-matinee` | `/fl/cash-pop` |
| `/fl/cash-pop-afternoon` | `/fl/cash-pop` |
| `/fl/cash-pop-evening` | `/fl/cash-pop` |
| `/fl/cash-pop-late-night` | `/fl/cash-pop` |

Do not ship production 301s merely because this table lists candidates. Claude must first prove each old URL exists or is an approved historical alias, check inbound/canonical implications, and document the redirect set. Guarded preview redirects may be used only if the repository’s route policy permits them.

## 12. Data Ownership and Proposed Contract

### Runtime/dynamic data

- Latest result per member draw
- Draw date/time and status
- Next draw
- Current top prize/jackpot where applicable
- Current result freshness
- Result history
- Correction history
- Derived statistics for selected history
- Generated sets and saved-state status
- Commerce eligibility/options
- Published news/community activity

### Versioned sourced rules

- Number ranges and result shape
- Play types
- Wager options
- Fireball or other add-on mechanics
- Payout matrix
- Odds
- Draw schedules and cutoffs
- Ticket price
- Claim thresholds/deadlines
- Tax/privacy facts
- Rule-era effective dates

These are not ordinary static copy. They require sources, effective dates and correction/version handling.

### Static presentation/editorial configuration

- Canonical family slug
- Family label and identity token
- Mode: JG-M1/JG-M2/JG-M3
- Member game IDs, variant labels and stable order
- Introductory copy
- Section capability map
- Tool destinations
- Guide/blog taxonomy
- Candidate legacy aliases, pending route audit

### Suggested family object

```json
{
  "stateCode": "fl",
  "slug": "pick-3",
  "familyId": "pick-3",
  "label": "Pick 3",
  "mode": "JG-M2",
  "visualIdentity": null,
  "members": [
    { "gameId": 332, "variantLabel": "Midday", "displayOrder": 1 },
    { "gameId": 333, "variantLabel": "Evening", "displayOrder": 2 }
  ],
  "capabilities": {
    "checker": true,
    "history": true,
    "numberHistory": true,
    "statistics": true,
    "generator": true,
    "systems": true,
    "news": true,
    "community": true,
    "alerts": true
  }
}
```

The object is a design target, not a command to duplicate data already governed elsewhere. Reuse the existing State family configuration, draw-event provider and result-format registry wherever they already own a field.

## 13. Internal Review Data

The founder wants to see the complete page before production integrations are ready.

Claude may create a guarded internal-review fixture that makes all eighteen Pick 3 sections visible, provided that:

- it is isolated from production data;
- every sample record is explicitly typed as sample/internal in the data contract;
- the public UI does not repeatedly print “sample” on every row;
- one internal preview banner clearly identifies the page as non-production;
- fake community metrics, fake users, fake winners and fake official claims are prohibited;
- historical result samples are either drawn from real repository history or visibly synthetic internal fixtures that cannot leak when the guard is off;
- no sample item enters metadata, canonical, sitemap, schema or production APIs.

## 14. Design Requirements

- Mobile-first at 390 px, then 1440 px.
- Match the accepted Home and State design language without modifying them.
- One game identity, not one card per variant.
- Results dominate the first viewport.
- All eighteen sections are present on Pick 3, grouped into the nine visual bands above.
- No nested cards and no landing-page hero treatment.
- Use the existing shared result-ball, multiplier, commerce, AI and shell primitives where they genuinely fit.
- Use familiar icons for actions when the repository already has an icon primitive.
- Controls must be functional in the guarded preview; do not draw disabled product promises.
- Stable responsive dimensions; no text overlap or horizontal page scrolling.
- Do not make every section a pale grey bordered rectangle.
- Do not allow advertisements to interrupt the result, checker, AI answer or claim flow.
- No Game Page advertisements until the real game ad inventory/profile is approved.

## 15. Claude Implementation Task

### Phase 1: Review and report

Before coding, Claude must:

1. Confirm branch, HEAD, origin/main, ahead/behind and working tree.
2. Confirm `b57b72e` and the current guarded `/fl/powerball` implementation.
3. Locate the current `/fl/pick-3` behavior and all candidate legacy Pick 3 routes.
4. Audit existing State Page family grouping for Pick 3 and Cash Pop.
5. Audit data coverage for each of the eighteen sections.
6. Report conflicts, missing routes/data and any decision that would change canonical or production behavior.

### Phase 2: Content/data model

Create a configuration-driven State Game Page model that:

- preserves independent member game IDs;
- separates dynamic data, versioned sourced rules and static presentation config;
- declares section capabilities explicitly;
- fails safely when a required rule/data source is absent;
- supports JG-M1 and JG-M2 without per-game JSX branches;
- reuses the State family composition rather than creating a competing family registry.

### Phase 3: Complete Pick 3 guarded page

Implement `/fl/pick-3` under `LC_GAME_PREVIEW=true` with all `JG-01` through `JG-18` sections and the exact content intent in this brief.

Use governed real data first. Use one isolated internal-review fixture for missing history/editorial/community/alert states only under the rules in Section 13.

### Phase 4: Generalization proof

Prove the template against:

- one single-member State-native family, such as Florida Lotto or Jackpot Triple Play;
- Pick 3 with two members;
- Cash Pop with five members;
- one JG-M1 local multi-state offering without forcing the eighteen-section JG-M2 composition onto it.

Do not create four bespoke page components.

### Phase 5: State Page integration

Once the guarded Game Page routes genuinely resolve:

- keep the accepted State Page family layout;
- add only the minimal route affordance needed to open the family page;
- preserve one game identity and all member result rows;
- do not redesign Home, State or Footer.

### Phase 6: Redirect recommendation

Audit the candidate old URLs and produce an exact redirect table with evidence. Implement guarded redirects only if allowed. Do not activate production redirects, canonicals or sitemap entries without the required cutover decision.

## 16. Allowed Paths

Claude should confirm the exact repository shape, then keep changes inside:

- `01-new-ui/app/[state]/[game]/`
- `01-new-ui/components/game/`
- `01-new-ui/lib/game/`
- `01-new-ui/config/games/`
- narrowly required shared State family presentation files
- namespaced Game Page CSS in `01-new-ui/app/globals.css`
- Game Page tests under `01-new-ui/tests/`
- this permanent execution-brief workspace for task notes
- the existing authoritative Game Page implementation record for final results

Middleware/redirect files are allowed only after the route audit confirms the approach.

## 17. Forbidden Changes

- Do not redesign or modify accepted Home, State or Global Footer visuals.
- Do not build the global `/powerball` or `/mega-millions` page in this task.
- Do not replace local game content based on visitor IP.
- Do not add raw affiliate destinations.
- Do not create production 301s, canonicals, sitemap entries or indexable sample pages without cutover approval.
- Do not modify legacy database/API schemas to create presentation families.
- Do not merge Midday/Evening records into one synthetic result record.
- Do not fabricate results, winners, community activity, publication dates, claims, tax rules or privacy rules.
- Do not suggest hot/cold numbers, AI, systems or generators improve the chance of winning.
- Do not repeat official-site verification warnings throughout the page.
- Do not use the removed Codex prototype as a design reference.

## 18. Acceptance Criteria

### Content completeness

- `/fl/pick-3` visibly contains `JG-01` through `JG-18` in server HTML under the guard.
- Section headings and copy satisfy this brief rather than placeholder text.
- News, guides and blogs are distinct content types.
- Missing production integrations use the approved internal-review fixture boundary, not fake public content.

### Family behavior

- Pick 3 renders one identity with Midday and Evening rows.
- Each row preserves its own game ID, date, time, result and status.
- Cash Pop proves five stable rows.
- Single-member games use the same family contract.
- JG-M1 pages remain locally focused and do not duplicate future global tools.

### Engagement

- Checker is deterministic and rule-era aware.
- Generator produces valid random sets and makes no prediction claim.
- AI explains and routes; it does not calculate payouts or invent answers.
- History/statistics controls visibly change the relevant output in the review fixture.
- Save/follow/alert controls do not claim success without a real service.

### Trust

- Normal page content does not repeatedly tell users to visit the official site.
- One compact result source/freshness line exists.
- Contextual notices appear only for stale/pending/delayed/corrected data.
- One ticket-validation boundary exists after checker/claim output.
- `JG-18` carries the full methodology, source, correction, independence and Responsible Play information.

### Responsive quality

- Verified at 390 px and 1440 px.
- No horizontal page scrolling.
- No overlap, clipped labels or unstable result rows.
- First mobile viewport clearly identifies the game and shows the latest result.
- All eighteen sections remain discoverable without presenting eighteen equal cards.

### Guard and regression

- Guard off preserves the current application behavior byte-for-byte where required.
- Existing Home, State and Footer tests pass.
- New tests cover section completeness, independent variant dates, five-row families, data ownership and route gating.
- Production build passes.

## 19. Required Claude Deliverables

1. Concise pre-implementation review and conflict report
2. Data-coverage matrix for all eighteen sections
3. Pick 3 screenshots at 390 px and 1440 px
4. Generalization screenshots for one single-member family and Cash Pop
5. Exact tested route/redirect report
6. Test and build results
7. Updated authoritative Game Page implementation record
8. Founder-review document listing remaining decisions without treating missing production services as completed

Do not commit or push until the founder reviews the complete guarded page.
