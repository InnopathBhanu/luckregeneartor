# LotteryCorner Game Page Architecture and Routing Decision — Final Approved

**Document:** `05-lotterycorner-game-page-blueprint-index-FINAL-APPROVED.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Version:** 1.1  
**Status:** Final approved and frozen architecture  
**Approved date:** July 24, 2026  
**Primary authority:** Frozen Constitution, Approved Experience Architecture, Approved Global Shell, Approved Home Blueprint and Approved State Blueprint.

---

## 1. Approved Architecture

LotteryCorner uses two coordinated game-page families and one supporting tools blueprint.

### 05A — Flagship Game Brand Hub

Initial pages:

- `/powerball`
- `/mega-millions`

They own:

- latest global result and jackpot;
- official draw countdown;
- shared draw and rule-era objects;
- AI insights and explanations;
- results/jackpot history;
- game statistics, generators and systems;
- guides and LotteryCorner Research;
- news, winners and global community;
- save/follow/alerts;
- U.S./UK or international guidance;
- a simple generic Buy button when supported.

### 05B — Jurisdiction Game Page

Used for:

- minimal flagship offerings such as `/fl/powerball` and `/fl/mega-millions`;
- `/uk/powerball`;
- full state-native games such as `/fl/pick-3`;
- future hybrid multi-jurisdiction games.

### 05C — Lottery Tools and AI Insights

Defines:

- `/tools`;
- standalone calculators;
- game-scoped analytical tools;
- public, sign-in and Insider access;
- AI insight and orchestration patterns.

## 2. Ownership Rule

> **Shared game facts, draw records and global tools belong to the flagship game ecosystem. Static local features, claims, taxes, winner rules, local news and local community belong to the jurisdiction offering.**

One result is governed once.

Powerball uses separate linked records for:

- the main Powerball drawing;
- the Power Play multiplier attached to the main drawing;
- the Double Play separate drawing.

Mega Millions current-format draws do **not** have a single draw-level multiplier. The multiplier is assigned to each ticket play at purchase.

## 3. Founder-Approved IP Simplification

Page content does not change by IP.

LotteryCorner calls an external coarse geolocation service only to resolve:

- U.S. state when the visitor appears to be in the United States;
- country when outside the United States.

The result is used only to:

1. decide whether the Buy button should be shown for a game;
2. decide which approved affiliate destination is used after the click.

Rules:

- raw IP is never stored;
- no automatic page redirect;
- no state/country content rewriting;
- no state-specific news, claims, rules or banners in the current scope;
- a visitor from Florida may read a California page without any change to California content;
- future location-based banners/offers require a separate feature flag and review.

## 4. First-Party Affiliate Redirect

Pages expose a LotteryCorner route, not a raw affiliate URL.

Examples:

```text
/play/powerball
/play/mega-millions
/play/{game}
```

At click time the resolver:

1. calls or reuses the non-persisted coarse location result;
2. checks game/region support and active campaign status;
3. chooses an approved destination;
4. redirects;
5. falls back safely when no destination exists.

The raw IP is never written to the redirect, content or analytics stores.

## 5. Global Draw and Buy Countdown

Each flagship game has one official Eastern Time countdown:

- Powerball: Monday, Wednesday and Saturday at 10:59 p.m. ET.
- Mega Millions: Tuesday and Friday at 11:00 p.m. ET.

Use `America/New_York`, not a permanently hard-coded EST offset.

LotteryCorner also has one game-level affiliate handoff deadline:

```text
purchaseWindowClosesAt = officialDrawAt - configuredBuffer
```

Founder-approved initial product direction:

- use a 30-minute buffer before the official draw;
- validate that buffer against active affiliate partners before production;
- configure it once per game, not per state;
- label it **LotteryCorner online purchase window**, not an official state lottery cutoff;
- hide the Buy button after the window closes;
- do not show state-specific cutoff calculations on game pages.

## 6. Canonical and URL Rule

Root routes and existing state-game routes are preserved.

Child-route examples in these blueprints define semantic ownership, not automatic URL migration.

Before creating or changing a child route, complete the URL audit:

- current indexed URL;
- traffic;
- backlinks;
- internal links;
- affiliate revenue;
- canonical;
- redirect need.

Each route is classified as:

- preserve;
- introduce;
- consolidate;
- redirect;
- archive.

## 7. Query Ownership

| Search intent | Canonical owner |
|---|---|
| Powerball results | Root game/current result owner |
| Powerball numbers for a date | Stable global draw |
| Powerball statistics | Global game tool |
| Florida Powerball | `/fl/powerball` |
| Florida Powerball claims/Double Play | Local offering |
| Powerball UK | UK offering |
| Can I play Powerball from India? | Global international guide |
| Mega Millions results/tools | Global hub/tool |
| Florida Pick 3 results | `/fl/pick-3` |
| Pick 3 by state | Future Game Family Hub |

## 8. Blueprint Scope

`05A` fully blueprints PF-03 Flagship Game Hub.

It also defines ownership and integration requirements for later child-page blueprints covering:

- current result;
- stable draw;
- results history;
- jackpot history;
- statistics and other tools.

Those child pages require their own detailed visual/metadata blueprints before implementation if they are not already covered by an accepted research blueprint.

## 9. Approved Files

- `05A-lotterycorner-flagship-game-page-blueprint-FINAL-APPROVED.md`
- `05B-lotterycorner-jurisdiction-game-page-blueprint-FINAL-APPROVED.md`
- `05C-lotterycorner-tools-and-ai-insights-blueprint-FINAL-APPROVED.md`

![Approved routing model](bp05-game-routing-and-buy-resolution-final.svg)

---

# APPENDIX A — FREEZE RECORD

The founder approved:

1. stable global page content;
2. IP use only for Buy-button visibility and redirect resolution;
3. no IP storage;
4. first-party LotteryCorner affiliate links;
5. one game-level ET draw/buy countdown;
6. global tools on Powerball and Mega Millions;
7. a separate `/tools` hub and standalone calculators;
8. extensive deterministic and AI insights;
9. minimal state-specific flagship pages;
10. full state-native game pages;
11. all factual, semantic and governance corrections in Version 1.1.

This architecture is frozen.
