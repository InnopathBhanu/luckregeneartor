# State Page Module Matrix

Sources: `05-design-inputs/state-pages/section-analysis/State_Lottery_Prposed_section_analysis.docx`
(canonical 7-module matrix) + the **complete pass** over all 11 proposed PDFs (extended observations).
Discovery only.

`Data Methodology` is added as an extra column: the docx describes it in prose ("Found in FL")
but omits it from the printed table. All other cells are copied from the docx feature matrix.

## Layer B Module Matrix (11 proposed states)

| State | Check Ticket Tool | Scratch-Offs / Instant Games | Odds & Strategy | News & Winners | Fund Allocation | Anonymity Rules | Data Methodology | Notes |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|-------|
| Virginia | Yes | Yes | No | Yes | Yes | Yes | No | Most modules of any state after FL |
| New York | No | No | No | Yes | No | No | No | Leanest page — Layer A + News only |
| Michigan | No | No | Yes | Yes | Yes | No | No | |
| Massachusetts | No | No | Yes | Yes | No | No | No | |
| Delaware | No | No | No | Yes | No | Yes | No | |
| Connecticut | No | Yes | Yes | No | Yes | No | No | **Only state without News & Winners** |
| Colorado | Yes | No | No | Yes | Yes | No | No | |
| California | No | Yes | No | Yes | No | Yes | No | |
| Arkansas | Yes | No | Yes | Yes | No | No | No | |
| Arizona | Yes | Yes | Yes | Yes | No | No | No | |
| Florida | Yes | No | Yes | Yes | Yes | No | **Yes** | Reference "full" page — every Layer A section + Data Methodology |

## Module Frequency (how many of 11 states use each)

| Module | Count | States |
|--------|:---:|--------|
| News & Winners | 10 | all except CT |
| Odds & Strategy | 6 | MI, MA, CT, AR, AZ, FL |
| Check Ticket Tool | 5 | VA, CO, AR, AZ, FL |
| Fund Allocation | 5 | VA, MI, CT, CO, FL |
| Scratch-Offs / Instant Games | 4 | VA, CT, CA, AZ |
| Anonymity Rules | 3 | VA, DE, CA |
| Data Methodology | 1 | FL |

## Extended Module Observations (from the full PDF pass)

The docx matrix above covers 7 modules. The actual proposed PDFs contain **additional flexible
modules** not in the docx. These should also be **config-driven toggles**. Presence observed:

| State | Quick Facts | Number Trends/Stats | Biggest Jackpots/Winners | Winner Location table | Highlights grid | Game Comparison | In-page Tab Nav | Where & How to Play (affiliate) | Key-Questions QA |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Virginia | – | – | Yes | – | – | – | Yes | – | Yes (heavy) |
| New York | – | – | – (Highlights only) | – | Yes | – | – | Yes | – |
| Michigan | Facts callouts | – | Yes | Yes | – | – | Yes | – | – |
| Massachusetts | – | Yes | – (winner table) | Yes | – | – | – | Online play | – |
| Delaware | – | – | – (winner table) | Yes | – | – | – | – | – |
| Connecticut | Yes | – | – | – | – | Yes | – | – | – |
| Colorado | – | – | – | – | – | – | – | – | – |
| California | – | – | Yes (3 stories) | – | – | – | – | – | – |
| Arkansas | – | – | Yes (story) | – | – | Yes | – | Where to Buy | – |
| Arizona | Yes | – | Yes | – | – | – | – | – | – |
| Florida | – | – | – | – | – | – | Yes | – | – |

(These are observations from single mockups, not fixed rules — treat as toggles.)

## Reading Notes

- The matrices reflect **current provided inputs**, not a permanent rule. "No" means "not shown in that mockup" — not "never allowed." All modules should be **config-driven toggles**, so any state can enable any module later without template changes.
- **Florida** is the only complete example for the core 7 (+ Data Methodology) — use it as the template superset, but do **not** hardcode Florida-specific content/order into the shared component.
- **New York** is lean on the core-7 Layer B (News only) but is **not** minimal overall — the full pass shows it also has a **Highlights Today grid** and a rich **Where & How to Play** (affiliate) section. So "leanest core-7" ≠ "fewest sections."
- **Connecticut** is the only state without News & Winners.
- Layer A (Hero, Latest Results, Schedules, How to Claim, Taxes, History, FAQs) is assumed present for **all 11** and is not represented in these matrices.
- **Game formats vary widely** per state and drive dynamic result cards (e.g. Cash Pop = 1 ball in VA, Keno = 10 in MI, Pick 10 = 10 in NY) — see `08-...` §E and `09-...`.
