# LotteryCorner Game Page Architecture and Routing Decision

**Document:** `05-lotterycorner-game-page-blueprint-index.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Version:** 1.0  
**Status:** Proposed decision and blueprint index — ready for founder review  
**Date:** July 24, 2026  
**Primary authority:** Frozen Constitution, Approved Experience Architecture, Approved Global Shell, Approved Home Blueprint and Approved State Blueprint.

---

## 1. Final Architecture

LotteryCorner will use **two coordinated game-page blueprint families**.

### 05A — Flagship Game Brand Hub

Used initially for:

- `/powerball`
- `/mega-millions`

These pages own universal game truth and the full international-quality experience:

- current result and jackpot;
- shared draw records;
- game rules and prize structure;
- results and jackpot history;
- tools, statistics and number generation;
- LotteryCorner AI;
- news, winners and global community;
- save/follow/notifications;
- jurisdiction selector;
- geo-aware purchase and cutoff context;
- international guidance.

### 05B — Jurisdiction Game Offering

Used for:

- `/fl/powerball`
- `/fl/mega-millions`
- `/fl/pick-3`
- `/mi/powerball`
- `/uk/powerball`
- other state/jurisdiction game offerings.

It has three modes:

1. **Minimal flagship offering** — Powerball or Mega Millions in a state/jurisdiction.
2. **Full state-native game** — Pick 3, Pick 4, Florida Lotto or another game with no global brand hub.
3. **Hybrid multi-jurisdiction offering** — another shared game whose root hub is created only when demand and shared content justify it.

## 2. Ownership Rule

> **Shared game facts and tools belong to the global game hub. Local purchase, cutoff, add-ons, claims, taxes, winner rules, news and community belong to the jurisdiction offering.**

One draw is stored and governed once.

Example:

```text
/powerball/results/2026-07-22
```

All state/jurisdiction Powerball pages consume that draw object.

## 3. URL and Canonical Matrix

| Object | Example | Canonical behavior |
|---|---|---|
| Flagship brand hub | `/powerball` | Self-canonical |
| Flagship draw record | `/powerball/results/2026-07-22` | Self-canonical; owns shared result |
| Flagship history | `/powerball/results` | Self-canonical collection |
| Flagship tool | `/powerball/statistics` | Self-canonical |
| Minimal state offering | `/fl/powerball` | Self-canonical only when substantial local content exists |
| UK offering | `/uk/powerball` | Self-canonical local offering |
| State-native game | `/fl/pick-3` | Self-canonical full game page |
| Temporary context parameter | `/powerball?state=fl` | Canonical to `/powerball` |
| International guidance | `/powerball/international` | Self-canonical if substantial and maintained |

Do not use `hreflang` between `/powerball` and `/fl/powerball`; they serve different purposes rather than being translated equivalents.

## 4. Click Routing from a State Hub

| State-hub action | Destination |
|---|---|
| Game name or local details | `/fl/powerball` |
| Latest winning numbers/draw date | Global stable draw record |
| Full results history | `/powerball/results` |
| Statistics/hot-cold | `/powerball/statistics` |
| Generator/systems | `/powerball/generator` or tool route |
| Jackpot history | `/powerball/jackpot-history` |
| Universal rules | `/powerball/how-to-play` |
| Buy Tickets/cutoff | Local offering purchase module |
| Local claim/tax/privacy | Local offering or state guide |
| Local discussion | Florida Powerball community |
| Full game experience | `/powerball` |

## 5. Geo/IP Personalization Contract

The founder approves IP-based personalization for **Buy Tickets and purchase cutoff**.

IP may:

- preselect a likely state/country;
- display a likely purchase option;
- display a local cutoff;
- prioritize local news/winners;
- suggest the local offering page.

Requirements:

1. Display the detected location and a prominent **Change location** control.
2. Do not auto-redirect `/powerball` or `/mega-millions`.
3. Do not change the canonical URL or hide global content.
4. Use IP as a presentation signal, not final legal verification.
5. The official lottery or purchase provider performs precise geolocation, age, account and eligibility checks before sale.
6. Suppress the direct purchase CTA when location confidence, provider status or source freshness is insufficient.
7. Search crawlers receive a stable global default, not materially different hidden regional pages.

## 6. Global Audience Modes

### Powerball

- U.S. selling jurisdiction.
- United Kingdom.
- Other country.
- Unknown location.

The U.S. and UK share the jackpot and drawing, while price, lower-tier prizes, purchase and jackpot payment differ.

### Mega Millions

- U.S. selling jurisdiction.
- Outside the United States.
- Unknown location.

Mega Millions is not officially sold outside the United States. International visitors still receive results, tools, news, AI, local draw-time conversion, alerts and scam guidance.

## 7. Blueprint Files

- `05A-lotterycorner-flagship-game-page-blueprint.md`
- `05B-lotterycorner-jurisdiction-game-page-blueprint.md`

![Routing model](bp05-game-routing-map.svg)

---

# Source Basis

The decision is grounded in current official Powerball, Mega Millions, UK National Lottery, Illinois Lottery and Florida Lottery guidance, plus Google’s locale-adaptive crawling guidance.

Key findings:

- Powerball entered the UK in July 2026 with a shared jackpot but a distinct UK ticket price, lower-tier prize structure and jackpot-payment model.
- Powerball sales cutoffs, online sales, add-ons and claims remain jurisdiction-specific.
- Mega Millions is a $5 U.S. game with a built-in multiplier and is not officially sold outside the United States.
- State lotteries require precise geolocation at purchase even when a page can use IP for initial personalization.
- Google may not fully crawl locale-adaptive content, so global URLs remain stable and accessible without forced redirects.
