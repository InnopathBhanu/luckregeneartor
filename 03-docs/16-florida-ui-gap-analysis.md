# Florida UI Gap Analysis — Generated vs Target PDF

Compares the current `/fl` implementation (`01-new-ui`) against the target
`05-design-inputs/state-pages/proposed-screenshots/florida.pdf`. Documentation only — **no code changed**.
Correction is focused on **/fl** only. Cross-refs: `09`, `13`, `14`.

> **Headline:** the generated page is **dark-themed, leaks `[ADMIN]` placeholders, stacks two heavy dark
> ad boxes, and is missing most sections**. The target is a **light-themed**, structured results page
> with a jackpot ticker, tabs, and many content modules. The stack is right; the theme, chrome, ad
> styling, and section coverage are wrong.

---

## 1. Target Florida PDF — section by section (light theme)
1. **Header (light/white):** navy "LOTTERY CORNER" logo, nav (HOME · POWER BALL · MEGA MILLIONS · LOTTERY SYSTEMS · JACKPOTS), **Florida state dropdown**, LOGIN, REGISTER (red).
2. **Jackpot ticker sub-bar (grey):** `Next draw: Powerball — Sat 10:59 PM ET [12h 51m]` countdown pill; **`Top Jackpots:` Powerball $750M · Mega Millions $420M · Florida Lotto $8.5M** (red values); quick actions right (Check Ticket · Past Results · Prize Lookup · Claim Info · **Buy Tickets** red); `Also coming up:` next draws w/ countdowns; **disclaimer strip**.
3. **Single leaderboard ad:** one **subtle** bordered "Advertisement" box on a light-blue band (not heavy, not stacked).
4. **Breadcrumb:** `Home › Florida Winning Numbers`.
5. **H1 (dark navy on light):** "Florida Lottery Results Today — Winning Numbers, Jackpots, & How to Claim" + muted intro paragraph.
6. **Tab nav:** Results (active) · Winning History · Schedule · How to Play · How to Claim.
7. **Latest Draw Results:** "Last updated…", light-blue info callout; **Multi-State cards** (Powerball, Mega Millions — white cards, red jackpot top-right, draw-date + schedule row, **black balls + red special ball**, special label, "Next draw:", full-width red **Buy Tickets**); **Florida In-State** (Florida Lotto, Fantasy 5, Cash4Life — 3-up, no Buy Tickets); **Pick 2/3/4/5** (4-up compact, Midday & Evening).
8. **Check Your Ticket tool:** Select Game + Draw Date + "Check My Ticket" + "How it works".
9. **FAQs** (mini accordion).
10. **Recent Highlights & Alerts:** Recent FL Wins, Unclaimed Prizes (light-blue rows), Jackpot Growth & Rollovers.
11. **How to Claim:** claim-by-amount table, "Documents You Must Bring", step-by-step, **Taxes & Withholding** card, Claim Deadlines, District Offices, mini-FAQ.
12. **Game Odds, Prize Matrix & How Each Game Works:** accordions per game (Florida Lotto, Fantasy 5, Cash4Life, Powerball, Mega Millions, Pick 2–5).
13. **Florida Lottery Guide & Player Information:** Draw Integrity, Key Rules, Responsible Play, Where Lottery Money Goes, Claim Offices, Player Rights.
14. **Sources, Methodology & Update Process:** Data Sources, Update Frequency, Time Zone, Accuracy & Verification, Editorial Standards, Limitations.
15. **Full Florida FAQ** accordion.
16. **Footer (dark navy):** 4-col (LotteryCorner / Quick Links / Resources / Legal), © 2025, disclaimer + dismissible bottom ad.

## 2. Current generated UI (`/fl`)
- **Dark theme** throughout (globals.css flips to dark via `prefers-color-scheme`).
- Header (dark): red-circle logo, nav, Login/Register stubs. **No state dropdown.**
- Sub-bar: only "Florida Lottery — updated shortly…" + quick actions + Buy Tickets. **No next-draw countdown, no Top Jackpots values, no "also coming up", no disclaimer strip.**
- **Two stacked large dark "ADVERTISEMENT" boxes** at top (+ a right-rail box).
- Breadcrumb `Home › Florida`.
- **H1 shows `[ADMIN] Florida Lottery Results Today`**; **intro shows `[ADMIN] Answer block:…`**.
- **No tab nav.**
- Latest Draw Results: multi-state 2-up cards (balls, Power Play badge, awaiting status, red Buy Tickets), in-state group, pick group — structurally close but dark, and cards lack the draw-schedule row.
- Draw schedule table, AI teaser stub, mini FAQ, trust notices, footer (dark, matches target footer).
- **Missing:** Check Ticket tool, Highlights & Alerts, full How to Claim (table/docs/steps/taxes/deadlines/offices), Odds/Prize accordions, Player Information, Sources/Methodology, tabs, jackpot ticker.

## 3. Visual differences
| Area | Target PDF | Current UI | Action |
|------|-----------|-----------|--------|
| **Theme** | **Light** (light bg, white cards, navy text, red accents) | **Dark** | Make **light the default**; only opt-in dark if ever approved. |
| **Header/topbar** | Light, + **Florida state dropdown** | Dark, no dropdown | Light header; add state dropdown. |
| **Jackpot ticker** | Next-draw countdown + Top Jackpots ($ values) + also-coming-up + disclaimer | Absent | Build `JackpotTicker` sub-bar. |
| **Ad placement/style** | **One subtle** bordered leaderboard; light | **Two heavy dark** boxes stacked + rail | Single subtle top slot; light, thin-border, low-contrast; keep rail subtle. |
| **H1/intro/tabs** | Full title, intro, **tab nav** | `[ADMIN]` title/intro, **no tabs** | Remove `[ADMIN]`; add tab nav. |
| **Result card layout** | White card, draw-date + **schedule row**, black+red balls, Next draw, red Buy Tickets | Dark card, no schedule row | Light card; add schedule line. |
| **Check ticket** | Present (tool) | Missing | Add `CheckTicketTool` (stub form). |
| **FAQs** | Mini + full accordions | Mini only | Add full FAQ; real Q/A copy. |
| **Highlights/alerts** | Recent wins, unclaimed, rollovers | Missing | Add `HighlightsAlerts`. |
| **Claim/tax** | Table + docs + steps + taxes + deadlines + offices | Missing (placeholders only) | Add `HowToClaim` + `TaxInfo`. |
| **Odds/prize guide** | Per-game accordions | Missing | Add `OddsAccordion`. |
| **Player information** | Integrity/rules/responsible/funds/offices/rights | Missing | Add `PlayerInfoGuide`. |
| **Source/methodology** | Data sources/frequency/TZ/accuracy/editorial/limits | Missing | Add `SourcesMethodology`. |
| **Footer** | Dark 4-col | Dark 4-col | **OK** (keep). |

## 4. Missing sections (not rendered at all)
Jackpot ticker, tab nav, info callout, Check Ticket tool, Highlights & Alerts, full How-to-Claim (options table / documents / steps / deadlines / district offices), Taxes detail card, Odds & Prize accordions, Player Information guide, Sources & Methodology, full FAQ, state dropdown.

## 5. Sections where sample JSON must be extended (`state-fl-sample.json`)
Add real, display-ready (NOT `[ADMIN]`) content for:
- **Visible copy:** `h1`, `introParagraph`, `metaTitle`/`metaDescription` (kept for SEO), `lastUpdated.display` — replace `[ADMIN]`/keep SEO placeholders out of visible DOM.
- **jackpotTicker:** `nextDraw {game, timeDisplay, countdownLabel}`, `topJackpots[] {game, amountDisplay}`, `alsoComingUp[] {game, countdownLabel}`, `disclaimer`.
- **tabs[]** (Results/Winning History/Schedule/How to Play/How to Claim).
- **result cards:** add `drawScheduleLabel` (e.g. "Wed & Sat") per card.
- **checkTicket:** `{ gameOptions[], howItWorks[] }`.
- **highlights:** `{ recentWins[], unclaimedPrizes[], jackpotGrowth[] }`.
- **howToClaim:** `{ claimOptions[] (amount→method), documents[], steps[], deadlines[], districtOffices[] }` (upgrade the current placeholder object to real strings).
- **taxes:** `{ stateNote, federalNote, withholdingRows[] }`.
- **oddsGuide:** per-game `{ gameName, rulesSummary, prizeMatrix[], odds[] }`.
- **playerInfo:** `{ drawIntegrity, keyRules[], responsiblePlay[], whereMoneyGoes, claimOffices, playerRights[] }`.
- **sourcesMethodology:** `{ dataSources[], updateFrequency[], timeZone[], accuracy[], editorial[], limitations[] }`.
- **faqs.items[]:** real `q`/`a` (not `qPlaceholder`/`[ADMIN]`).

> Where a field is genuinely admin-driven but not yet supplied, render **clean neutral copy** (e.g. a short factual sentence or "—"), **never** the literal `[ADMIN]`/`[VERIFY-CONVENTION]` tokens. Add a small guard so any residual `[ADMIN]`/`[VERIFY-*]` string is stripped before rendering.

## 6. Exact correction plan for /fl
1. **Theme → light default.** Rework `globals.css`: light page/surface/border/text tokens as the base; move the dark block to an opt-in (`:root[data-theme="dark"]`) and **do not** auto-dark via `prefers-color-scheme` for now (PDF is light).
2. **Kill `[ADMIN]` leakage.** Add `cleanCopy()` (strip `[ADMIN]`/`[VERIFY-*]`, fall back to neutral text) used by every visible-text render; and replace visible placeholder copy in the FL sample with real display strings.
3. **Ad styling + count.** Make `.lc-adslot` subtle (light bg, 1px light border, small centered "Advertisement", reserved min-height). Render **one** top leaderboard (`sp_top_billboard`); treat `sp_toppromobar` as the thin sub-bar promo, not a second big box. Keep right-rail subtle and desktop-only.
4. **Jackpot ticker.** New `JackpotTicker` sub-bar (next-draw + countdown + Top Jackpots + also-coming-up + disclaimer) fed by new sample fields.
5. **Tabs + info callout + intro.** Add `TabNav` (anchor links) and the light-blue "updated shortly…" callout.
6. **Result cards (light).** Light card styling; add draw-schedule row; keep black main + red special balls (already token-driven), red full-width Buy Tickets on multi-state.
7. **Add Layer B modules** (data-driven, clean placeholders when empty): `CheckTicketTool`, `HighlightsAlerts`, `HowToClaim` + `TaxInfo`, `OddsAccordion`, `PlayerInfoGuide`, `SourcesMethodology`, full `FaqAccordion`.
8. **State dropdown** in header (light).
9. Rebuild against PDF spacing; verify responsive (desktop/tablet/mobile) and re-run build/lint.

## 7. Files likely needing code changes
- `app/globals.css` — light theme default; subtle ad style.
- `lib/data-provider/types.ts` — types for the new sample fields (ticker/tabs/checkTicket/highlights/claim/tax/odds/playerInfo/methodology).
- `components/state/StatePageTemplate.tsx` — assemble the full section order; single top ad; light layout; `cleanCopy`.
- `components/layout/SiteHeader.tsx` — light + state dropdown.
- `components/layout/UtilitySubBar.tsx` → replace with `JackpotTicker`.
- `components/ads/AdSlot.tsx` — subtle style; ensure no double-stack.
- `components/results/DynamicResultCard.tsx` — light card + schedule row.
- **New:** `components/state/TabNav.tsx`, `modules/CheckTicketTool.tsx`, `modules/HighlightsAlerts.tsx`, `modules/HowToClaim.tsx`, `modules/TaxInfo.tsx`, `modules/OddsAccordion.tsx`, `modules/PlayerInfoGuide.tsx`, `modules/SourcesMethodology.tsx`, `modules/FaqAccordion.tsx`, `lib/text/cleanCopy.ts`.
- **Data:** extend `04-sample-data/state-fl-sample.json` (§5).

## 8. What must NOT change
- **Next.js 15 + TS + Tailwind + App Router** stack (`14`).
- **Sample-data-driven** approach via the data-provider (no live API calls).
- **Fixed ad-slot keys** and GAM paths from `ad-slot-definitions.json` (still referenced by `slotKey`; only the *visual* placeholder style changes, not the slots/positions — `13`/`14`).
- **`/buynow/<code>` CTA model** — no hardcoded external affiliate URLs.
- **No live GAM/googletag scripts** yet (AdSlot still only reserves space).
- **No API, login, admin, forum, or functional AI** in this correction.

---

## Summary
Right stack, wrong presentation. The correction is: **light theme by default**, **no `[ADMIN]` in the DOM**, **subtle single top ad**, a **jackpot ticker + tabs**, and the **missing Layer B sections** — all data-driven from an extended `state-fl-sample.json`. Scope stays on `/fl`; ad slots, `/buynow`, and the no-API/no-GAM rules are preserved.
