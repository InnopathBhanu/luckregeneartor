# LotteryCorner News Hub Blueprint — Final Approved

**Version:** 1.0  
**Status:** Final approved and frozen  
**Primary route:** `/news`

## 1. Purpose

The News Hub is the daily discovery and conversation entry point for U.S. lottery news, Editorial, LotteryCorner Research and controlled community events.

## 2. Modes

```text
NEWS-NORMAL
NEWS-BREAKING
NEWS-MAJOR-JACKPOT
NEWS-LOW-VOLUME
NEWS-EVENT
```

### NEWS-NORMAL

Top Story → Jackpot Watch → Latest → Winners/Unclaimed → State News → Guides/Research → Trending → Most Discussed → Community → Events.

### NEWS-BREAKING

Developing Story and update timeline dominate. Unrelated event content is suppressed near the top.

### NEWS-MAJOR-JACKPOT

Jackpot Watch, main story, game page, countdown, tax/annuity tools, historical rank and discussion receive priority.

### NEWS-LOW-VOLUME

Do not manufacture news. Increase Guides, Research and archive discovery.

### NEWS-EVENT

Temporary approved event package with explicit LotteryCorner relevance. Normal lottery news remains visible.

## 3. Page Order

| Order | ID | Module |
|---:|---|---|
| 1 | NH-01 | Identity and Navigation |
| 2 | NH-02 | Top/Developing Story |
| 3 | NH-03 | Jackpot Watch |
| 4 | AD-NH00 | Advertisement |
| 5 | NH-04 | Latest News |
| 6 | NH-05 | Winners and Unclaimed Prizes |
| 7 | NH-06 | State News |
| 8 | NH-07 | Guides and LotteryCorner Research |
| 9 | AD-NH01 | Advertisement |
| 10 | NH-08 | Trending |
| 11 | NH-09 | Most Discussed |
| 12 | NH-10 | Most Read |
| 13 | NH-11 | From the Community |
| 14 | NH-12 | Celebrations and Events |
| 15 | NH-13 | Alerts and Digests |
| 16 | NH-14 | Trust, Reporters and Policies |
| 17 | AD-NH02 | Lower Advertisement |

## 4. Identity

H1:

```text
Lottery News, Winners, Jackpots and Player Stories
```

Supporting copy:

```text
Verified U.S. lottery news with named reporters, LotteryCorner data, useful AI context and community discussion.
```

## 5. Top Story

Selection uses urgency, impact, reach, utility, originality, discussion, historical significance and source strength—not recency alone.

Card includes reporter photo/name, Bottom Line, state/game, status, comment count and discussion action.

## 6. Jackpot Watch

Data-driven, not a repetitive article feed.

Show Powerball and Mega Millions jackpot, cash option, next draw, rollover count, historical rank when meaningful, latest related story, game link and approved Buy action.

## 7. Latest Feed

Compact cards with:

- category;
- headline;
- short summary;
- reporter;
- time;
- state/game;
- image;
- comments;
- developing/updated/corrected label.

## 8. Winners and Unclaimed Prizes

Separate views for:

- Winners;
- Winning Retailers;
- Unclaimed Prizes;
- Claim Deadlines.

Privacy and claim protection rules apply.

## 9. State News

State selector plus balanced local stories. No IP-based content rewrite. Future personalization uses explicit signed-in preference.

## 10. Guides and Research

Distinct labels:

- Guide;
- Explainer;
- Research;
- Historical Note.

## 11. Rankings

Trending, Most Discussed and Most Read remain separate.

## 12. Community

Show verified winner stories, helpful answers, game/state questions, system/tool discussions and community polls. Do not convert unverified claims into News.

## 13. Events

Maximum one controlled module at launch.

Each event shows:

- why it is on LotteryCorner;
- direct lottery connection;
- related tool/discussion;
- event end date.

## 14. Alerts

Users can follow game, state, jackpot threshold, winner stories, rule changes, unclaimed deadlines, Research and replies.

Adjacent-event alerts are separate opt-in.

## 15. Named Reporters

Feature two or three real reporters with:

- image;
- name;
- role;
- beat;
- profile link;
- recent articles.

## 16. Taxonomy

```text
contentType
newsCategory
primaryEntity
gameIds[]
stateCodes[]
topic
storyStatus
riskLevel
eventId
reporterId
editorId
canonicalDiscussionThreadId
```

## 17. Hub Schema

Use a graph containing:

```text
CollectionPage
BreadcrumbList
ItemList
Organization
WebSite
```

`ItemList` includes only visible article cards.

Metadata:

```text
Title: Lottery News, Winners, Jackpots & Player Stories | LotteryCorner
Description: Read verified U.S. lottery news, jackpot updates, winner stories, state developments, LotteryCorner Research and community discussions.
```

## 18. URL and Topic Pages

Preserve current URLs pending audit.

Possible later topic collections:

```text
/news/jackpots
/news/winners
/news/unclaimed-prizes
/news/scratch-offs
/news/research
```

Create only with sufficient durable content and demand.

## 19. Ads

Allowed after Jackpot Watch, after Guides/Research and in lower content.

Protected: Top Story Bottom Line, Developing Story timeline, safety instructions and first discussion interaction.

## 20. Performance

Server-render the main feed. Use crawlable category/archive links. Do not rely on infinite scroll alone.

## 21. Measurement

Track top-story clicks, category/state use, ranking-module use, repeat visits, second-page rate, discussion conversion, news-to-game/tool continuation, alert signups, reporter-profile visits and adjacent-content quality.

This blueprint is approved and frozen as Version 1.0.
