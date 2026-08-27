# Home & State UI Discovery Summary

What the new UI must support, based on the **complete pass** over the design inputs
(`home.png`, all 11 proposed state PDFs, all 10 existing state screenshots, section-analysis docx),
reconciled with Bala's decisions. Discovery only — no UI/API code. Cross-refs `08`, `09`, `10`, `12`, `13`.

---

## 1. What is Common Across All State Pages (build once)

Shared chrome + Layer A appear on every proposed state page:

- **Header**: logo, primary nav (Home, Power Ball, Mega Millions, Lottery Systems, Jackpots), state selector, Login, Register.
- **Utility sub-bar**: next-draw countdown, top jackpots, quick actions (Check Ticket, Past Results, Prize Lookup, Claim Info, **Buy Tickets**), "also coming up", disclaimer strip.
- **Leaderboard ad slot** under the sub-bar.
- **Breadcrumb**.
- **Hero**: H1 + short answer intro (+ optional tab/anchor nav).
- **Latest Draw Results**: Last-updated timestamp, Multi-State group (Powerball/Mega Millions), In-State group, Pick/daily group — all using dynamic result cards.
- **Draw schedules**, **How to Claim**, **Taxes**, **Past Results history links**, **FAQs**.
- **Official-source / independence disclaimer** + **responsible-play / 18+ notice**.
- **Footer**.

## 2. What Changes by State

- H1 wording and intro copy (FL: "…Winning Numbers, Jackpots, & How to Claim"; NY: "…Winning Numbers & Jackpot Information").
- **Game list** and result-card formats (FL: Florida Lotto, Fantasy 5, Cash4Life, Pick 2–5; NY: Cash4Life, NY Lotto, Take 5, Pick 10, Numbers, Win 4 — Pick 10 shows 10 balls).
- Which **Layer B modules** appear (see matrix `10-...`).
- State-specific text: tax rules, claim offices/deadlines, fund-allocation program name, anonymity rules, local wins/unclaimed prizes.
- State code / URL (`/fl`, `/ny`, `/az`, …) and state name in labels/schema.

## 3. What Should Be Data / Config Driven

- **State definition**: code, name, URL slug, H1, intro, enabled Layer B modules, game list, tax rule, claim rules, fund program, anonymity rule.
- **Game & result-format definitions**: ball count, ball groups, special/bonus balls, labels, colors, multipliers, draw schedule, next-draw logic, effective-date ranges for historical formats.
- **Module toggles** per state (Check Ticket, Scratch-Offs, Odds & Strategy, News & Winners, Fund Allocation, Anonymity, Data Methodology).
- **Content blocks**: FAQs, odds/prize matrices, claim steps, news/winners entries, methodology text.
- **SEO metadata** (title, meta, canonical, schema) via templates.
- **Ad placements** via config/rules (so slots are consistent and not lost in redesign).
- **Nav/footer link sets**.

## 4. What Should Be Reusable Components

See full list in `09-...`. Core set:
`StatePageTemplate`, `SiteHeader`, `UtilitySubBar`, `StateSelector`, `Breadcrumbs`, `AdSlot`,
`ResultCard` + `BallGroup`/`Ball` + `SpecialBallLabel`, `LatestDrawResults`, `DrawScheduleTable`,
`CheckTicketTool`, `ScratchOffsGuide`, `OddsStrategyAccordion`, `NewsAndWinners`, `FundAllocation`,
`AnonymityRules`, `DataMethodology`, `PlayerInfoGuide`, `HowToClaim`, `TaxInfo`, `FaqAccordion`,
`SiteFooter`, plus SEO utilities (`SeoHead`, `BreadcrumbSchema`, `LastUpdated`, `OfficialSourceNotice`,
`ResponsiblePlayNotice`, `DatasetSchema`, `ResultAnswerBlock`).

The **result card must be fully dynamic**: variable ball counts, multiple ball groups, named/colored special balls, optional multipliers/add-ons, and historical (date-effective) formats — never hardcode a fixed number of balls or a single game's shape.

## 5. What Still Needs Ad-Placement Discovery (from reference code / live site)

**Critical — do not treat mockups as final for ads.** Full reconciliation + target slot plan in `13-...`.

- Proposed PDFs (all 11): only a **top leaderboard** (Calif. specs 970×90/725×90/320×100) + a **dismissible footer ad**; single-column, **no right rail**.
- Existing pages (all 5 state screenshots + `home.png`): **right-rail "lotter.com" affiliate banners + blue/white promo banners** (rotating, ~1–2/viewport), **in-content ads**, and a **footer newsletter signup** — all **dropped** in the mockups.
- Decision (`12`/`13`): **re-introduce** the dropped right-rail affiliate/promo units, in-content slots, and newsletter; keep the new leaderboard + footer ad.
- Still required before build:
  - Complete **revenue inventory** (`03-revenue-inventory.md`, pending) from `00-reference-existing-project` + live site: every ad slot, network/slot IDs, affiliate/Buy-Tickets link targets, and positions.
  - Map each existing ad/affiliate unit to a slot in the new template so **no revenue unit is dropped**, then re-insert on desktop, tablet, mobile.
  - Confirm affiliate destination(s) behind "Buy Tickets", "lotter.com", and quick-action links.
- **Buy Tickets / affiliate URLs are config/API-driven, not hardcoded** (`13-...` §3a): render CTAs in their fixed positions, but resolve destinations from config/API using existing business rules (geo/IP, state, game, affiliate availability, tracking, LotteryCorner routing). Use safe placeholders during UI-first; don't change existing destinations/tracking/geo-routing until the revenue inventory is done.

## 6. What Still Needs API Contract Later (UI-first now with sample data)

Build UI now against sample JSON/XML (`04-sample-data/`, empty) behind a data-provider abstraction. API contracts to finalize after UI stabilizes:

- **Latest results per state/game**: game meta + result format + drawn numbers + special balls + jackpot + draw date/time + next draw + last-updated timestamp.
- **Result format metadata** (drives dynamic rendering; incl. effective-date ranges for historical formats).
- **Jackpots / next-draw / countdown** feed for the utility sub-bar and cards.
- **Results history** (paginated, filterable, crawlable) for history pages + Dataset schema.
- **Check-Ticket** match endpoint (game + draw date + numbers → prize match).
- **News & Winners / unclaimed prizes** content feed.
- **Static/config content**: state definitions, game definitions, odds/prize matrices, claim rules, tax rules, FAQs, methodology text.
- **Buy Tickets / affiliate URL resolver** (`13-...` §3a): returns the correct destination per user geo/IP, state, game, affiliate availability, tracking requirements, and existing routing logic — UI never hardcodes the URL.
- **SEO/sitemap freshness**: lastmod per page and IndexNow submission on updates.

## 6a. Home Page (decided — `12`/`13`)

- **Preserve** existing home structure and all home ad/affiliate/newsletter placements.
- Apply **only minimal** design-system alignment (typography, spacing, cards, colors) to match the new state pages.
- No heavy home redesign, and no structural section changes, without Bala's approval. No proposed home mockup exists.

## 6b. AI-Enabled Positioning (future, logged-in — `12`/`13`)

- Reserve space for future AI/logged-in tools (AI insights, smart number analysis, personalized alerts, "Lottery Genie / Lucky GPT") — gated behind login, **no fake/unsupported claims**.
- The card **star/favorite icon** in the mockups is an existing personalization hook.
- Public result content stays crawlable and unaffected by AI gating.

## 6c. Mobile (existing references now available — `08` §C-M, `13` §6/§9)

- Existing-site **mobile references** provided for **Home** + **Florida** (`05-design-inputs/mobile-existing-pages/`); still **no proposed mobile mockups**.
- Both are **single-column, full-length vertical scroll** captures (~430–452px) of the current live site — mobile = same content stacked to one column. Redesigned pages reflow to this pattern.
- **Mobile ad slots are FIXED (GAM):** preserve exact positions/order; adapt content around slots; empty ad spaces = ad evidence; never move/remove on mobile.
- **Caveat:** no PDF renderer available here, so exact mobile ad coordinates weren't measurable from the PDFs — confirm against live site / GAM / reference code in the revenue inventory.

## 7. Open Uncertainties (flagged, not guessed)

- **Exact mobile ad-slot positions/sizes** not measurable from the reference PDFs (no renderer) — must be confirmed via live site / GAM config / reference code.
- No mobile references for states **other than Florida**; other states' mobile behavior derived from desktop + FL/Home references + best practice.
- No **proposed header/footer** component sheet — inferred from state PDFs; footer link inventory still needed (footer currently hardcodes "Florida Lotto" — should be state-aware).
- **Ad slot IDs / networks / affiliate targets** unknown from images — need revenue inventory (§5).
- Existing screenshots cover only **5 of 11** states, limiting old-vs-new diffing for AR/CT/DE/MA/MI/NY/VA.
- Whether in-page tabs (seen in FL/MI/VA) are **anchor links or separate routes** affects URL/SEO planning.
- Proposed PDFs are **Lovable prototypes** with placeholder copy/data and at least one bug (Arizona timestamp "GMT+5:30" — must be ET).

## 8. Next Suggested Steps

1. ✅ Complete design-input coverage (this pass).
2. Run the **revenue inventory** (ad + affiliate discovery) from reference project + live site → `03-revenue-inventory.md` — **next**. Must capture **exact desktop + mobile ad positions, GAM slot IDs, and affiliate destinations** (ties to `13-...` §7/§9).
3. Run the **URL/SEO inventory** (state/game/history/blog routes incl. `/fl`, `/az`) → `01-url-inventory.md`, `02-seo-geo-aeo-inventory.md`.
4. Ad-placement strategy **resolved** (`13-...` §7/§9: preserve exact positions, GAM-fixed); slot-level specifics pending the revenue inventory.
5. Request **mobile references for remaining states** and a **footer link** list; normalize the misspelled filenames.
6. Draft **sample data schema** (state + game + result-format JSON) in `04-sample-data/` behind a data-provider abstraction.
7. Only after 2–4 and Bala's approval: begin `01-new-ui` code.
