# State Page Template Requirements (Proposed)

Derived from the **complete pass** over all 11 proposed state PDFs + the section-analysis docx,
reconciled with existing live pages and Bala's decisions (`12`, `13`). Discovery only — no code.

The proposed design is a **single reusable StatePage template** = Layer A (global, every state)
+ Layer B (optional modules toggled per state via config/data).

> **Reference, not final.** Proposed PDFs are Lovable prototypes and reference designs only (`12`).
> Existing SEO value, ad placements, affiliate CTAs, Buy Tickets flows, internal links, and the
> newsletter signup **must be preserved** even where the mockups omit them (see Ad Placement, `13`).

---

## Page Chrome (shared, above the template body)

Seen on every proposed state PDF:

1. **Header** — logo "LOTTERY CORNER", primary nav (HOME, POWER BALL, MEGA MILLIONS, LOTTERY SYSTEMS, JACKPOTS), **State selector dropdown**, LOGIN, REGISTER.
2. **Utility sub-header bar**:
   - `Next draw: [Game] — [day time] [countdown]`
   - `Top Jackpots:` inline list (Powerball, Mega Millions, top in-state game)
   - Quick-action links: **Check Ticket, Past Results, Prize Lookup, Claim Info, Buy Tickets** (Buy Tickets = affiliate/revenue link)
   - `Also coming up:` next few draws with countdowns
   - Disclaimer strip: "Winning numbers are updated shortly after each drawing. For major prizes, confirm your ticket with an authorized [State] Lottery retailer or office."
3. **Leaderboard ad slot** — a single boxed "Advertisement" placeholder directly under the sub-header. (This is the ONLY ad shown in the proposed PDFs — see Ad Placement Gaps.)
4. **Breadcrumb** — `Home › [State] Winning Numbers` (or `[State] Lottery`).

---

## Layer A — Required Global Sections (every state)

1. **Hero / Introduction**
   - H1: e.g. `Florida Lottery Results Today — Winning Numbers, Jackpots, & How to Claim` (wording varies by state; template must accept a per-state H1 + intro).
   - Short answer / intro paragraph (GEO/AEO answer block).
   - Optional in-page tab/anchor nav: Results · Winning History · Schedule · How to Play · How to Claim.

2. **Latest Draw Results**
   - **"Last updated: [date time ET]"** timestamp (visible).
   - Info callout re: confirm with official retailer.
   - **Multi-State Draws** group — Powerball & Mega Millions cards (jackpot, balls + special ball, draw date, draw schedule, next draw, **Buy Tickets** CTA).
   - **[State] In-State Draws** group — cards for each in-state game.
   - **Pick / daily digit games** group (Pick 2/3/4/5, Numbers, Win 4, Take 5, Pick 10, etc.).
   - Result cards must render **dynamic ball counts and formats** (see Result Card Requirements).

3. **Draw Schedules & Times** — which days/times each game draws (inline on cards and/or dedicated schedule block).

4. **How to Claim Prizes** — claim-by-amount table, documents to bring, step-by-step instructions, deadlines, district-office overview.

5. **Taxes Explained** — 24% federal withholding + state-specific tax note (e.g. "Florida does NOT charge state income tax").

6. **Past Results History** — link(s) to older winning numbers / history pages.

7. **FAQs** — accordion at the bottom (state-specific questions). Note: some pages show a short FAQ near the top *and* a full FAQ at the bottom.

Plus global trust/compliance blocks present on Florida (should be standard):
- **Official source attribution** / independence disclaimer ("Lottery Corner is an independent lottery information website and is not affiliated with…").
- **Responsible play / 18+ notice**.

---

## Layer B — Optional / Flexible Modules (config-driven per state)

Toggle per state via config. **Core 7** from the section-analysis matrix (see `10-...`):

- **Interactive "Check Your Ticket" Tool** — Select Game + Draw Date → match against latest results. (VA, CO, AR, AZ, FL)
- **Scratch-Offs / Instant Games** — instant-win / 2nd-chance guides. (VA, CT, CA, AZ)
- **Odds & Strategy Guide** — per-game prize matrix, odds, "how it works" accordions. (MI, MA, CT, AR, AZ, FL)
- **Local News & Winners ("Recent Highlights & Alerts")** — recent wins, unclaimed prizes nearing expiration, jackpot growth/rollovers. (all states except CT)
- **Fund Allocation / Impact ("Where Lottery Money Goes")** — e.g. Education Enhancement Trust Fund. (VA, MI, CT, CO, FL)
- **Anonymity Rules** — whether winners can stay anonymous. (VA, DE, CA)
- **Data Methodology ("Sources, Methodology & Update Process")** — data sources, update frequency, time zone, accuracy/verification, editorial standards, limitations. (FL only in current inputs)

**Additional modules found in the full PDF pass** (beyond the docx's 7 — also config-driven; see `10-...` extended observations):

- **Quick Facts table** — established year, ticket price, claim deadline, etc. (AZ, CT)
- **Statistics & Number Trends** — hot/cold numbers, frequency links. (MA)
- **Biggest Jackpots / Biggest Winners table** — historical top prizes. (MI, VA; winner stories also in AZ, AR, CA, DE)
- **Winner Location table** — prize/city/retailer/date of recent winning tickets. (DE, MA, MI)
- **Highlights Today grid** — fastest-growing jackpot, most-played game, recent big winner, best odds, trending pick. (NY)
- **Game Comparison ("Which game should you play?")** — decision-support table. (AR, CT)
- **In-page Tab / Anchor Nav** — e.g. Winning Numbers · Draw Times · Claim Info · Taxes · Winners/Scratchers. (FL, MI, VA)
- **"Where & How to Play"** — buy online (affiliate) + retail + who-can-play + guidelines. (NY; affiliate-relevant)
- **Per-topic "Key Questions" QA blocks** — inline Q&A after each section. (VA)

Also seen (should be config-driven modules):
- **[State] Lottery Guide & Player Information** — draw integrity, key rules, responsible play, where money goes, claim offices, player rights/common issues.

---

## Result Card Requirements (dynamic — do NOT hardcode)

Evidence from the full PDF pass that cards must be format-driven:

- Variable ball count across the full range: **Cash Pop → 1 ball (VA)**; Pick/Play/Daily/Numbers → 2–5 digits; standard 5-ball (Cash 5, Fantasy 5, Take 5, Mass Cash); 6-ball (Lotto, Lotto 47, Megabucks, Multi-Win Lotto, The Pick, Triple Twist); 5 + special (Powerball, Mega Millions, Cash4Life, Lucky for Life, Lotto America); **Keno → 10 balls (MI)** and **Pick 10 → 10 balls (NY)**, both wrapping to multiple rows.
- **Special balls** rendered distinctly (red) vs regular (black/navy), with varied names: Powerball, Megaball, Cash Ball, Lucky Ball, **Star Ball (Lotto America)**, Bonus, **Mega 9 (SuperLotto Plus)**.
- Special-ball label line under numbers (e.g. "Powerball: 14", "Megaball: 19", "Cash Ball: 3", "Lucky Ball: 8", "Star Ball: 7", "Bonus Ball: 17").
- Per-card metadata: game name, draw date/time, draw schedule (Wed & Sat / Daily / Midday & Evening), jackpot amount, next-draw date + next jackpot + countdown, optional Buy Tickets CTA, **Find More / View History** links, and a **star/favorite icon** (logged-in hook).
- Must support future multipliers / add-ons (Power Play, Megaplier, Fireball) even though none appear in these mockups.
- **Timestamps must be Eastern Time (ET).** The Arizona mockup leaks "GMT+5:30" — a prototype bug to avoid.

Drives the config concepts in CLAUDE.md: `GameDefinition`, `ResultFormatDefinition`, `BallGroupDefinition`, `BallDefinition`, `BonusBallDefinition`, `EffectiveDateRange`.

---

## Layout Expectations

- Single-column, full-width content column on desktop; **no right sidebar in the proposed PDFs** (existing pages had one — see gap).
- Result cards in responsive grids: multi-state = 2-up; in-state = 3-up; pick games = 4-up.
- Odds/claim content uses accordions and 2-column tables.
- In-page tab/anchor nav for long pages.

## Ad Placement Gaps (must resolve before build)

Confirmed by the complete pass (existing screenshots vs proposed PDFs) — full plan in `13-...`:

- Proposed PDFs show only a **top leaderboard** (Calif. specs 970×90 / 725×90 / 320×100) + a **dismissible footer ad**. Single-column, **no right rail**.
- **Existing** live pages (all 5 state screenshots + home) carry **right-rail "lotter.com" affiliate banners + blue/white promo banners** (rotating), **in-content ads between sections**, and a **footer newsletter signup** — all **absent** from the mockups.
- Per Bala (`12`), **mockups are not final for ads**: re-introduce the dropped right-rail affiliate/promo units, in-content ad slots, and newsletter; keep the new leaderboard + footer ad. See `13-...` for the target slot plan.
- Exact slot names, sizes, networks, and affiliate targets still require the revenue inventory (`03-revenue-inventory.md`, pending).

## Buy Tickets / Affiliate URLs (config/API-driven — do NOT hardcode)

Decision (`13-...` §3a): Buy Tickets and affiliate destination URLs must **not** be hardcoded in the UI.

- Render Buy Tickets CTAs in their required positions (sub-bar quick action + result cards), but resolve the **destination URL from config/API**, not from static UI code.
- The future API decides the correct Buy Tickets / affiliate URL from existing business rules: user geo/IP, state, game, affiliate availability, tracking requirements, and existing LotteryCorner routing logic.
- During UI-first development, use **safe placeholder** Buy Tickets links (via the data-provider abstraction).
- Do **not** change existing affiliate destinations, tracking parameters, or geo-routing logic until the reference-project revenue inventory is complete.
- Implies a `BuyTicketsCta` component that takes a resolved href from the data provider (never an inline literal), fed by an `AffiliateRule` config concept (per CLAUDE.md).

## SEO / GEO / AEO Implications

- Every state page: unique H1, unique title/meta, canonical, breadcrumb (BreadcrumbList schema), visible **Last updated** timestamp.
- Short answer block near top supports AI answer engines.
- Result tables and main content must be crawlable HTML (not client-only).
- Schema: `WebPage` + `BreadcrumbList` sitewide; `Dataset` for history/result data; `FAQPage` only where FAQ is visible; `Article`/`NewsArticle` only for the News & Winners module if it is real editorial content.
- Official source attribution + independence disclaimer support E-E-A-T / trust signals.
- Stable state URLs must be preserved (`/fl`, `/az`, …) — see `01-url-seo-preservation-rules.md`.

## Mobile / Tablet Requirements

Proposed PDFs are desktop-only, but existing-site **mobile references** now exist for **Home** and
**Florida** (`05-design-inputs/mobile-existing-pages/`, see `08-...` §C-M). Derive mobile/tablet from
desktop mockups + these references + responsive best practice.

- Existing mobile = **single-column, vertically-stacked** layout of the same content as desktop, at ~430–452px wide. The redesigned state template should reflow to this single-column pattern on mobile.
- **Mobile ad slots are FIXED (Google Ad Manager).** Preserve **exact existing mobile ad positions and order**; if redesigned content conflicts with a slot, **adjust content around the ad**, never move/remove it (`13-...` §7.4, §9). Empty ad spaces in the references count as ad slots.
- Do **not** hide or relocate revenue-critical elements on mobile: ad slots, Buy Tickets CTAs / affiliate areas, jackpot cards, latest results, key internal links.
- Header collapses to a mobile menu that **still includes** state nav, game nav, blog/news, affiliate, responsible-play links.
- Result-card ball grids must wrap gracefully (Pick 10 / Keno already wrap on desktop).
- Utility sub-header (countdowns, quick actions) needs a compact mobile treatment.
- **Caveat:** exact mobile ad-slot coordinates are not measurable from the reference PDFs (no renderer available) — confirm against live site / GAM / reference code in the revenue inventory.

## Reusable Components Likely Needed

- `SiteHeader`, `UtilitySubBar` (next-draw / top-jackpots / quick actions), `StateSelector`, `Breadcrumbs`, `PageTabNav`
- `AdSlot` (leaderboard, in-content, sidebar, footer variants), `AffiliateBanner`, `NewsletterSignup`
- `StatePageTemplate` (orchestrates Layer A + Layer B by config)
- `ResultCard` + `BallGroup` + `Ball` (dynamic, format-driven), `SpecialBallLabel`, `FavoriteStar`
- `LatestDrawResults`, `DrawScheduleTable`
- Core-7 modules: `CheckTicketTool`, `ScratchOffsGuide`, `OddsStrategyAccordion`, `NewsAndWinners`, `FundAllocation`, `AnonymityRules`, `DataMethodology`, `PlayerInfoGuide`
- Extra modules: `QuickFactsTable`, `NumberTrends`, `BiggestJackpotsTable`, `WinnerLocationTable`, `HighlightsGrid`, `GameComparisonTable`, `KeyQuestions`
- `HowToClaim` (claim table + steps + docs), `TaxInfo`
- `FaqAccordion`
- SEO/GEO utilities: `SeoHead`, `BreadcrumbSchema`, `LastUpdated`, `OfficialSourceNotice`, `ResponsiblePlayNotice`, `CanonicalUrl`, `DatasetSchema`, `ResultAnswerBlock`
- `SiteFooter`
- **Future AI/logged-in hooks** (`12`): reserve slots for `AiInsights`, `SmartNumberAnalysis`, `PersonalizedAlerts`, "Lottery Genie / Lucky GPT" entry points — gated behind login, **no fake claims**. The card `FavoriteStar` is an existing personalization hook.
