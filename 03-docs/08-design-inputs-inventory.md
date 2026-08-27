# Design Inputs Inventory (Complete Pass)

Complete inventory + per-file analysis of every design input under `05-design-inputs/`.
Supersedes the earlier sampled pass. Discovery only — no UI/API code.

Coverage this pass: **all 11 proposed state PDFs**, **all 10 existing state screenshots (5 states)**,
**home page**, and the **section-analysis docx**. Cross-refs: `09`, `10`, `11`, `12`, `13`.

## Location & Method

`/Users/bala/Learning/lc/05-design-inputs/`
Proposed PDFs are image-based (no text layer); their embedded JPEG segments were extracted to a
scratch dir and read top-to-bottom. Existing screenshots are PNGs read directly.

> **Provenance note:** proposed PDFs are **Lovable prototypes** — footer shows "© 2025 LotteryCorner"
> and an "Edit with Lovable" watermark. Copy, dates, jackpots, and numbers in them are **placeholder**,
> not production data. Per `12-bala-design-decisions.md`, they are **reference designs, not final layouts.**

---

## A. Home Page

### `home.png`
- **Page/state:** Existing (live) home page. **Full-page** (very tall capture, header→footer).
- **Major sections (top→bottom):** header + nav; hero featured games (Powerball, Mega Millions, Lotto America); "Latest Lottery Results" banner; live-results callout; Live Lottery News cards; 50-state selector grid; "Welcome to Lottery Corner" intro; jackpot cards; Most Popular Games grid (~9 cards); large FAQ/help block (dark navy); "Winning Numbers by State" tables; footer with newsletter signup.
- **Ad/revenue visible:** **right-rail red "lotter.com" affiliate banners** across multiple sections; red **Buy Tickets** CTAs on featured games; affiliate banners between "Most Popular Games" cards; **newsletter signup** (footer). 
- **Ad/revenue missing vs proposed:** no top leaderboard ad in current home.
- **Unique elements:** 50-state grid; predictions/insider blocks; big FAQ block; state winning-number tables.
- **Uncertainties:** compression hides exact banner sizes; **no proposed home mockup exists** for comparison.

---

## B. Proposed State PDFs (new design — reference only)

Shared chrome on **all 11**: header (logo, HOME · POWER BALL · MEGA MILLIONS · LOTTERY SYSTEMS · JACKPOTS, state selector, LOGIN, REGISTER); utility sub-bar (next-draw countdown, Top Jackpots, quick actions: Check Ticket · Past Results · Prize Lookup · Claim Info · **Buy Tickets**, "also coming up", disclaimer strip); **single centered "Advertisement" leaderboard** under the sub-bar; breadcrumb; dark 4-column footer (Quick Links / Resources / Legal) + **dismissible bottom "Advertisement"**. All are **full-page**, **desktop-width only**, **single-column with NO right-rail ads**. Cards use black balls + red special ball, and a **star/favorite icon** (logged-in hook). Common ad gap on every state: **no right-rail affiliate banners, no in-content ads** (both exist on the live site — see §C).

| File | State | Full page? | Distinct/extra sections beyond shared Layer A | Games & ball formats (unusual flagged) | Unique elements | Uncertainties |
|------|-------|:--:|-----------------------------------------------|-----------------------------------------|-----------------|---------------|
| `florida.pdf` | Florida | Yes (7 seg) | In-page tabs (Results/History/Schedule/How to Play/How to Claim); Check Ticket tool; FAQ (mini + full); Recent Highlights & Alerts (wins, unclaimed, rollovers); How to Claim (table+steps+docs+taxes+deadlines+offices); Odds & Prize accordions; Player Info Guide (draw integrity, rules, responsible play, **fund allocation**, offices, rights); **Data Methodology** (sources, freshness, verification, editorial, limits) | PB 5+1, MM 5+1, Florida Lotto 6, Fantasy 5, Cash4Life 5+CashBall, Pick 2/3/4/5 (2–5 digits) | Only state with **Data Methodology**; fullest superset | — |
| `arizona.pdf` | Arizona | Yes (4) | Quick Facts table; News & Highlights; How to Claim; Taxes (+example) & Odds table; Draw Schedule; History + browse-by-game; **Check Ticket tool**; Biggest Winners; **Scratch-Off overview**; Responsible Play; FAQs | PB 5+1, MM 5+1, The Pick 6, Fantasy 5 (5), Triple Twist 6, Pick 3 | Two ad placeholders (top+bottom) | **"Last updated … GMT+5:30"** — wrong TZ (should be ET) |
| `arkansas.pdf` | Arkansas | Yes (5) | Explore-games table; Draw Schedule; **"Which game should you play?"** comparison; How to Claim (tiered); Taxes (+example); Biggest Winners (highlighted $1.8B story); News; Where to Buy; How-to-check; **Check Ticket tool**; FAQ | PB 5+1, MM 5+1, Millionaire for Life 6+LuckyBall, Natural State Jackpot 5, Lotto 6, Lucky for Life 5+LuckyBall, Cash 3 (3, mid/eve), Cash 4 (4, mid/eve) | 10 games; game-comparison table | — |
| `california.pdf` | California | Yes (4) | **Scratch-Offs + 2nd Chance Program** (enter/rules/prizes); How to Claim (levels); Tax rules; Deadlines; **Age & Anonymity**; Draw Schedule; Biggest Winners (3 stories); News (with publish/updated dates); FAQs; Data Source & Update Policy | PB 5+1, MM 5+1, SuperLotto Plus 5+**Mega 9**, Fantasy 5 (5), Daily 3 (3), Daily 4 (4) | **Ad placeholder shows specs 970×90 / 725×90 / 320×100** (responsive slot); anonymity section | — |
| `colorado.pdf` | Colorado | Yes (4) | **Draw Schedule very early** (2nd section); Game Overview; How-to-check steps; **Check Ticket tool**; How to Claim (tiered); Taxes (US vs non-US); Tips; News; Past Results by game; **Where Funds Go** (GOCO/conservation); FAQs | PB 5+1, MM 5+1, Lucky for Life 5+LuckyBall, Lotto 6, Lotto Plus 6, Cash 5 (5), Pick 3 (3, mid/eve) | Schedule-first ordering; conservation fund links; PO Box claim address | — |
| `conneticut.pdf` | Connecticut | Yes (4) | Quick Facts table; Quick-links to games; Draw Times; **Odds/Payouts "which to play" cards**; How to Claim (tiers); Taxes; **Scratch-Off games**; ways-to-check; Responsible Play; About; Data Accuracy; FAQs | PB 5+1, MM 5+1, Lotto! 6, Lucky for Life 5+LuckyBall, Cash5 5, Play 3 Day/Night (3), Play 4 Day (4) | Color-coded game icons; **filename misspelled "conneticut"**; **only state without News & Winners** | footer partly cut |
| `delaware.pdf` | Delaware | Yes (4) | Draw-games grid (Play 3/4/5 Day & Night); Draw Times & cutoff; update-timing note; **Recent Winners + ticket locations table**; How to Claim; **Anonymity** + verification; steps-before-claiming; Taxes; Most-Popular games grid; FAQs | PB 5+1, MM 5+1, Multi-Win Lotto 6, **Lotto America 5+Star Ball**, Play 3 (3), Play 4 (4), Play 5 (5, day/eve) | Winner-location table; anonymity prominent | footer truncated |
| `Massachusetts.pdf` | Massachusetts | Yes (4) | Draw-times table; game cards; **Statistics & Number Trends**; **Recent Winners table**; How to Claim (tiers); Taxes (3-col: state/federal/reporting); Past Results cards; Play Online; FAQs | PB 5+1, MM 5+1, Mass Cash 5, Megabucks 6, Lucky for Life 5+LuckyBall, Numbers Game (4, mid/eve) | Statistics/trends module; **inconsistent filename capitalization** | footer partly visible |
| `Michigan.pdf` | Michigan | Yes (4) | **Tabbed results nav** (Winning Numbers/Draw Times/Claim Info/Taxes); last-updated (EDT); draw-games grid incl **Keno**; Games & Times table; **Biggest Jackpots table**; Recent Winners table; How to Claim (2-col options+docs); step-by-step; Odds table; **Responsible Gambling (1-800-GAMBLER)**; Facts callouts; FAQ | PB 5+1, MM 5+1, Lucky for Life 5+LuckyBall, Lotto 47 (6), Fantasy 5 (5), Daily 3 (3), Daily 4 (4), **Keno = 10 balls** | Tabbed nav; Keno; helpline; capitalized filename | footer truncated |
| `Newyork.pdf` | New York | Yes (5) | **Highlights Today grid** (fastest-growing jackpot, most-played, recent big winner, best odds, trending); How to Claim (levels/centers/notes); **Taxes** (state 10.90%, NYC/Yonkers local, offsets, lump-sum vs annuity); **Where & How to Play** (buy online via Lottery Corner = affiliate, retail, who-can-play, guidelines); Responsible Play; **NY Lottery News + Recent Winners** (tagged cards); FAQs (12); Data Source & Update Policy | PB 5+1, MM 5+1, Cash4Life 5+CashBall, NY Lotto 6+Bonus, Take 5 (5, mid/eve), **Pick 10 = 10 balls**, Numbers (3), Win 4 (4) | Highlights grid; affiliate "buy online" section; **filename "Newyork"** | — |
| `virginia.pdf` | Virginia | Yes (5, longest) | **Tabbed nav** (Winning Numbers/Draw Times/Scratchers/Prizes/Taxes/Winners); draw-games grid; **Check Ticket tool**; per-topic "Key Questions" QA blocks; Draw Schedule; **Scratchers** section; How to Claim; Taxes (exact); **Anonymity/Privacy**; **Where Money Goes (education)**; common mistakes; fairness; Recent Wins by region; **Biggest Jackpots** 4-col; game-specific highlights | PB 5+1, MM 5+1, Cash4Life 5+CashBall, Bank a Million 6+Bonus, Cash 5 (5), **Cash Pop = 1 ball**, Pick 3 (3), Pick 4 (4), Pick 5 (5) — all day/night | Most modules; **Cash Pop single ball**; heavy QA blocks; tabbed nav | footer partly visible |

---

## C. Existing State Screenshots (current live design — preserve source of truth for ads)

All are **full-page** (split into part 1 / part 2). All 5 share the **same current template**:
header + state selector → **horizontal game rows** (game+logo, draw time(s), ball display, next jackpot, View Details / **Buy Tickets**) → **Winning Numbers History** table → **About The Lottery** → **How to Claim** → FAQ (dark navy) → footer + **newsletter signup**.

**Ad/revenue on every existing state page (KEY — must preserve):**
- **Right-rail sidebar** with **red "lotter.com" affiliate banners** + **blue/white promo banners**, rotating as you scroll (~1–2 units per viewport).
- Red **Buy Tickets** CTAs on game rows (affiliate).
- **Newsletter signup** in footer.
- **No top leaderboard ad; no sticky bottom bar** in current design (ads live in right rail + between content).

| Files | State | Full page? | State-specific games / notes | Uncertainties |
|-------|-------|:--:|------------------------------|---------------|
| `Arizona1.png`, `arizona2.png` | Arizona | Yes | rows for Pick 3/4, Fantasy 5, The Pick, PB, MM, etc.; history table; How to Claim | ad rotation logic unclear; mixed filename casing |
| `arkansas1.png`, `arkansas2.png` | Arkansas | Yes | Natural State Jackpot etc.; same template | — |
| `California1.png`, `california2.png` | California | Yes | SuperLotto Plus, Daily Derby, Daily 3/4; same template | mixed filename casing |
| `colarado1.png`, `colarado2.png` | Colorado | Yes | Cash 5, Lotto, etc.; same template | **filename misspelled "colarado"** |
| `florida1.png`, `florda2.png` | Florida | Yes | Fantasy 5, Pick 3/4, Lotto; history table; draw schedule; tax section; How to Play | **part 2 misspelled "florda2"** |

Existing screenshots exist for only **5 of 11** proposed states (AZ, AR, CA, CO, FL). No existing captures for CT, DE, MA, MI, NY, VA → limited old-vs-new diffing for those.

---

## C-M. Existing Mobile Screenshots (Home + Florida)

Folder: `05-design-inputs/mobile-existing-pages/`. Added after the desktop passes. These are
**existing-site (current live) mobile captures**, provided as references for mobile **content flow,
ad placement, and revenue placement** (per `12`/`13`). There are **no proposed mobile mockups**.

| File | Page | Format | Notes |
|------|------|--------|-------|
| `Mobile_Home.pdf` | Home (existing) | 2 tall pages, **~430px wide**, up to 14400pt tall each | Full-length single-column mobile scroll of the current home page |
| `Mobile_Florida.pdf` | Florida state (existing) | 4 tall pages, **~452px wide**, up to 14400pt tall each | Full-length single-column mobile scroll of the current Florida page |

**What was confirmable (content):** both are **single-column, vertically-stacked** mobile layouts of
the same content family as the existing desktop pages. Recovered embedded imagery includes game logos
(e.g. **Lotto America**), state branding (**Florida Lottery**), a **"Congratulations! WINNER"** promo/winners
banner, and section banners (**"How to Claim Your Prize"**) — consistent with the existing desktop
structure (results, winners/news, claim, affiliate/promo, newsletter) reflowed to one column.

**Method + limitation (be explicit):** these PDFs are **vector + masked-image composites**, and **no PDF
renderer is available in this environment** (`pdftoppm`/`mutool`/`gs`/`qpdf`/PIL/pymupdf all absent;
`qlmanage` only renders page 1 and caps resolution → unreadable). Raster extraction (base + SMask
composited over white) recovered only the **embedded images** (logos, promo/section banners), **not the
vector text nor the empty ad boxes**. Therefore:
- Exact **mobile ad-slot positions/sizes could not be measured from these files**.
- Per `13`, mobile ad slots are **fixed (GAM)** and **empty ad spaces = ad evidence**; precise mobile
  slot coordinates must be **confirmed against the live site / GAM config / reference code** during the
  revenue inventory (`03-revenue-inventory.md`, pending).

**Coverage:** mobile references exist for **2 of 12** page types (Home, Florida). Other states'
mobile behavior must be derived from these + desktop mockups + responsive best practice.

## D. Section Analysis Document

`state-pages/section-analysis/State_Lottery_Prposed_section_analysis.docx`
- Defines **Layer A** (global, all states) + **Layer B** (7 flexible modules) + a feature matrix (see `10-...`).
- **Filename misspelled** ("Prposed" → "Proposed").
- The actual PDFs reveal **more modules than the docx's 7** (Quick Facts, Statistics/Trends, Biggest Jackpots, Highlights grid, tabbed nav, game-comparison, winner-location tables) — see `10-...` extended observations.

---

## E. Consolidated Ball-Format Observations (drives dynamic rendering)

- Digit games: Pick/Play/Cash/Daily/Numbers 2–5 digits.
- Standard 5-ball: Cash 5, Fantasy 5, Mass Cash, Take 5, Cash5, Natural State Jackpot.
- 6-ball: Lotto/Lotto47/Lotto Plus/Megabucks/Multi-Win Lotto/The Pick/Triple Twist/NY Lotto(+bonus)/Bank a Million(+bonus).
- 5+special: Powerball, Mega Millions, Cash4Life (Cash Ball), Lucky for Life (Lucky Ball), Lotto America (Star Ball), SuperLotto Plus (Mega 9).
- **Extremes:** **Cash Pop = 1 ball** (VA); **Keno = 10** (MI); **Pick 10 = 10** (NY).
- Special-ball names seen: Powerball, Megaball, Cash Ball, Lucky Ball, Star Ball, Bonus, Mega 9. No multipliers (Power Play/Megaplier/Fireball) shown but must still be supported.

## F. Filename / Data Issues (normalize before they become slugs/keys)

- Typos: `conneticut.pdf`→connecticut, `florda2.png`→florida2, `colarado1/2.png`→colorado, docx "Prposed"→Proposed.
- Casing: `Newyork.pdf`, `Massachusetts.pdf`, `Michigan.pdf`, `Arizona1.png`, `California1.png` inconsistent with lowercase peers.
- Data bug in mockup: Arizona "Last updated … GMT+5:30" (should be ET) — all timestamps must be ET.

## G. Remaining Coverage Gaps

- **No proposed home-page mockup** (only existing `home.png`) — per `12`, home mostly preserved, minimal alignment only.
- **Mobile:** existing-site mobile references now provided for **Home + Florida** (§C-M); still **no proposed mobile mockups** and no existing mobile refs for the other states. Derive responsive from desktop mockups + these references + best practice.
- **No standalone header/footer sheet** — inferred from state PDFs.
- **Existing screenshots only for 5/11 states.**
- **Ad slot IDs / networks / exact sizes** not derivable from images — need reference-code + live-site revenue inventory (`03-revenue-inventory.md`, pending).
