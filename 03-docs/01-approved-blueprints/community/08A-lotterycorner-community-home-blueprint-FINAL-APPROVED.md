# LotteryCorner Community Home Blueprint — Final Approved

**Document:** `08A-lotterycorner-community-home-blueprint-FINAL-APPROVED.md`  
**Version:** 1.0  
**Status:** Final approved and frozen  
**Primary route:** `/community`

---

## 1. Purpose

The Community Home helps users quickly ask, share, discover active conversations and return to the games, states and contributors they care about.

It does not expose a complicated traditional forum directory as the primary experience.

---

## 2. Page Order

| Order | ID | Section |
|---:|---|---|
| 1 | CH-01 | Community Identity and Ask or Share |
| 2 | CH-02 | Active Now |
| 3 | CH-03 | Questions and Entries Needing Player Experience |
| 4 | CH-04 | Pick 3 and Pick 4 |
| 5 | CH-05 | Jackpot Games |
| 6 | CH-06 | State Communities |
| 7 | CH-07 | Systems, Tools and Mathematics |
| 8 | AD-CH00 | Advertisement |
| 9 | CH-08 | Wins and Ticket Stories |
| 10 | CH-09 | Scratch-Offs |
| 11 | CH-10 | Dreams, Signs and Lucky Numbers |
| 12 | CH-11 | News Discussions |
| 13 | CH-12 | Most Helpful |
| 14 | CH-13 | Following |
| 15 | CH-14 | Community Events and Polls |
| 16 | CH-15 | New Members and Guidelines |
| 17 | AD-CH01 | Lower Advertisement |
| 18 | Footer | Community/game/state navigation |

---

## 3. CH-01 — Ask or Share

H1:

```text
Lottery Community
```

Supporting copy:

```text
Ask questions, share numbers, discuss systems, celebrate wins and connect with U.S. lottery players.
```

Primary composer:

```text
What do you want to ask or share?
```

Quick helpers:

- Ask a Question;
- Share Numbers;
- Share a Win;
- Start a Discussion;
- Explain a System;
- Add a Photo;
- Create a Poll.

These helpers use the same `FORUM_ENTRY`.

---

## 4. CH-02 — Active Now

Shows recent healthy activity based on:

- reply velocity;
- unique contributors;
- freshness;
- moderation quality;
- game/state relevance.

Exclude spam and low-value flooding.

---

## 5. CH-03 — Needs Player Experience

Includes:

- no replies;
- AI-only reply;
- unresolved factual/player-experience request;
- clear game/state context.

Labels:

```text
No replies yet
LotteryCorner AI answered — player experience wanted
Needs state-player input
```

---

## 6. CH-04 — Pick 3 and Pick 4

First-class module.

Shows:

- active monthly entries;
- current draw discussion;
- shared numbers;
- systems;
- helpful contributors;
- state filters.

---

## 7. CH-05 — Jackpot Games

Shows:

- Powerball;
- Mega Millions;
- current draw discussions;
- jackpot opinion;
- cash/annuity;
- claim/anonymity;
- pools;
- news discussions.

---

## 8. CH-06 — State Communities

User chooses a state.

Show:

- state games;
- local winners;
- claims;
- online purchase;
- retailers;
- state news;
- active contributors.

No IP-based forced state.

Signed-in preferred state may be used only through explicit preference.

---

## 9. CH-07 — Systems, Tools and Mathematics

Groups Forum Entries tagged with:

- system;
- tool-help;
- mathematics;
- backtest;
- wheel;
- pairs;
- statistics.

Show methodology and Responsible Play labels where relevant.

---

## 10. CH-08 — Wins and Ticket Stories

Photo-forward entries with verification state.

Privacy redaction occurs before publish.

---

## 11. CH-09 — Scratch-Offs

Show:

- ticket stories;
- state labels;
- symbol/prize questions;
- new games;
- major wins;
- community help.

---

## 12. CH-10 — Dreams, Signs and Lucky Numbers

Clearly labelled:

```text
Community beliefs and personal interpretations
```

No scientific or guaranteed-win claim.

No psychic solicitation.

---

## 13. CH-11 — News Discussions

Uses canonical Forum Entries attached to News Articles.

Show reporter/headline context and one focused discussion prompt.

---

## 14. CH-12 — Most Helpful

Rank using:

- helpful replies;
- accepted replies;
- source support;
- contributor diversity;
- low moderation risk.

Do not use popularity alone.

---

## 15. CH-13 — Following

Signed-in module for:

- games;
- states;
- members;
- entries;
- systems;
- news discussions.

Public fallback explains follow benefits without forcing sign-in early.

---

## 16. CH-14 — Events and Polls

Only governed community events and polls.

Show close/end date and non-representative poll label.

---

## 17. CH-15 — New Members and Guidelines

Compact:

- introduce yourself;
- posting tips;
- privacy warning;
- scam warning;
- Responsible Play;
- moderation and appeal.

---

## 18. Filters

Available:

- Latest;
- Active;
- Following;
- Needs Replies;
- Most Helpful;
- State;
- Game;
- Tag.

Filters do not create indexable URL explosion.

---

## 19. Community Home Schema

Conceptual graph:

```text
CollectionPage
BreadcrumbList
ItemList
Organization
WebSite
```

`ItemList` represents only visible Forum Entry cards.

---

## 20. Metadata

Title:

```text
Lottery Community: Questions, Numbers, Systems & Player Stories | LotteryCorner
```

Description:

```text
Join U.S. lottery players discussing Pick 3, Pick 4, Powerball, Mega Millions, systems, winning tickets, state games and lottery news.
```

---

## 21. Ads

Allowed after primary game/system modules and lower page.

No ad inside the composer or between a safety notice and guidance.

---

## 22. Mobile

Persistent Ask or Share access, compact cards, camera action, state/game filters and draft recovery.

---

## 23. Measurement

- composer starts;
- publish completion;
- state/game module engagement;
- first reply;
- player-experience response;
- follow;
- return;
- healthy contributor depth;
- news/game/tool continuation;
- moderated-content rate.

This blueprint is approved and frozen as Version 1.0.
