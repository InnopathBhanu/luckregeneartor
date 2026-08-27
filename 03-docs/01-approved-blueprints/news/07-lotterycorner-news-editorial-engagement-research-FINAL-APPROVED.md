# LotteryCorner News, Editorial and Engagement Research — Final Approved

**Version:** 1.1  
**Status:** Final approved and frozen  
**Approved:** July 24, 2026  
**Scope:** U.S. lottery-first news, editorial, community, named reporters, AI context, comments, sharing and recirculation.

## 1. Editorial Identity

LotteryCorner will be **the daily news and conversation layer of the U.S. lottery community**, not a general news or sports website.

Three content classes remain distinct:

- **NEWS** — time-sensitive reported events; use `NewsArticle`.
- **EDITORIAL** — guides, explainers and research; use `Article` or `BlogPosting`.
- **COMMUNITY** — user-first discussions, polls and stories; use discussion-page markup only on genuine discussion pages.

## 2. Named Reporter and Publisher Contract

Every normal news article has a real accountable human author.

Visible identity:

- name;
- photograph;
- role;
- profile link;
- published/updated dates;
- accountable editor where required.

Correct model:

```text
author = Person
publisher = LotteryCorner Organization
```

LotteryCorner remains the publisher. Employees and approved contributors are authors/reporters.

Reporter profiles use:

```text
/authors/{reporter-slug}
```

and include biography, role, beats, recent articles, disclosure, editorial-policy links and professional profiles where relevant.

Reporter commentary is optional and labelled:

> **Reporter’s Take:** [short interpretation]

It remains separate from verified facts.

AI is separately labelled:

- LotteryCorner AI Quick Take
- LotteryCorner AI Context
- LotteryCorner AI Explainer
- LotteryCorner AI Historical Note
- LotteryCorner Research

AI never replaces the accountable author.

## 3. Initial Newsroom Model

Start with two or three genuine employees or approved contributors.

Roles supported:

```text
REPORTER
EDITOR
COLUMNIST
GUEST_CONTRIBUTOR
COMMUNITY_CONTRIBUTOR
LOTTERYCORNER_RESEARCH
```

At launch:

- approved reporters publish News;
- every article has an accountable editor;
- guest contributors require review;
- community members cannot directly publish into the News feed;
- no fake authors, synthetic biographies or synthetic reporter photos.

## 4. Editorial Scope

### Core Lottery News

- jackpot and draw developments;
- winners and retailers;
- unclaimed prizes;
- state-lottery changes;
- game launches, retirements and rule changes;
- scratch-off launches and major remaining prizes;
- claim, tax, anonymity and scams;
- online purchase and approved affiliate changes;
- public-funding impact;
- industry and technology;
- LotteryCorner data and research.

### Controlled Adjacent Coverage

Initial target: **0–5%**. It may grow to 10% only after proving lottery continuation, comments and return visits.

An adjacent story needs at least 3 points and one direct lottery signal:

| Signal | Points |
|---|---:|
| Official lottery promotion/licensed product | 3 |
| Direct state/game connection | 2 |
| Lottery-funded beneficiary/program | 2 |
| Lottery tool, pool or number experience | 2 |
| Strong community interest | 1 |
| Original LotteryCorner data/context | 2 |
| Popularity alone | 0 |

If the only reason is popularity, do not publish.

Sports coverage must not include bookmaker odds, betting advice, bet slips, sports-betting affiliate links or routine scores.

## 5. Article Classes

Guidance, not rigid limits:

- **Flash Update:** about 90–250 words.
- **Standard News:** about 250–500 words.
- **Explainer/Research:** about 500–1,200+ words where required.

Stop when the verified story and useful LotteryCorner context are complete.

## 6. Article Experience

Recommended order:

1. Category, state/game and status.
2. Headline.
3. Reporter identity and dates.
4. Bottom Line.
5. Primary image or verified data card.
6. Main article.
7. Conditional AI context.
8. Why it matters.
9. Historical/data connection.
10. Relevant game, state, archive, guide or tool.
11. One focused discussion question.
12. Canonical discussion thread.
13. Related next actions.
14. Sources, updates and corrections.
15. Responsible Play and affiliate disclosure where relevant.

For Flash Updates, AI may appear directly after the Bottom Line only when it adds value.

## 7. AI Acceptance Test

Suppress the AI module when it only repeats the headline, Bottom Line or first paragraph.

AI must add at least one:

- historical comparison;
- state rule;
- claim/tax context;
- numerical calculation;
- game explanation;
- archive connection;
- real community summary;
- tool configuration.

Every AI claim links to evidence.

## 8. Originality Threshold

Every aggregated article adds at least one proprietary LotteryCorner element:

- historical comparison;
- state/game data card;
- tax or annuity estimate;
- claim/anonymity context;
- archive link;
- tool;
- original community question;
- verified local context;
- original reporting;
- source comparison.

Major stories require at least two proprietary elements.

## 9. Article Entity Contract

```text
primaryEntity
relatedGameIds[]
relatedStateCodes[]
relatedDrawIds[]
relatedYearArchives[]
relatedRetailerIds[]
relatedWinnerRecord
relatedGuideIds[]
relatedToolIds[]
canonicalDiscussionThreadId
eventId
reporterId
editorId
```

These drive distribution across Home, News, State, Game, Archive, Community, email and notifications.

## 10. Canonical Discussion

Every article has one canonical thread:

```text
Article
  └── canonicalDiscussionThreadId
```

The article may render it inline. Do not create fragmented article comments, forum and AI threads for the same story.

AI comments only when invoked, when a factual question remains unresolved or when moderators request clarification. AI does not dominate, impersonate users or manufacture consensus.

## 11. Rankings

Keep separate:

- **Trending** — velocity and time decay.
- **Most Discussed** — unique contributors, reply depth and constructive quality.
- **Most Read** — readership only.

## 12. Developing Stories

A developing story uses one stable URL and shows:

- Developing Story label;
- latest confirmed fact;
- update timeline;
- confirmed versus unconfirmed items;
- source conflict;
- no speculative AI;
- no unverified winner identity.

## 13. Jackpot Watch

Routine jackpot increases remain in a live module.

Create a new article only when a configured milestone, historical rank, unusual rollover, operational issue, major reaction or jackpot win justifies it.

## 14. Polls

Community polls must show vote count, dates and non-representative status. Do not ask manipulative spending questions.

## 15. Required Schema

### News article

```text
NewsArticle
```

Required fields:

```text
@context
@type
@id
url
mainEntityOfPage
headline
description
image
datePublished
dateModified
author
publisher
articleSection
keywords
about
mentions
isAccessibleForFree
inLanguage
copyrightHolder
copyrightYear
publishingPrinciples
```

### Author

```text
Person
```

linked to:

```text
/authors/{reporter-slug}
```

### Reporter profile

```text
ProfilePage
mainEntity: Person
```

### Publisher

```text
Organization
```

with stable LotteryCorner `@id`, URL, logo and publishing principles.

### News Hub

```text
CollectionPage
BreadcrumbList
ItemList
```

### Video

```text
VideoObject
```

only for visible owned or lawfully used video.

### Discussion

The article remains `NewsArticle`. A standalone genuine user thread may use `DiscussionForumPosting`.

### Premium sections

Use `isAccessibleForFree` and `hasPart` only for real paywalled sections.

All schema must match visible content.

## 16. Source Display

Every article shows:

```text
Primary source
Additional sources
LotteryCorner data used
Last checked
Correction status
```

Aggregated story label:

> Reported from [source], with additional LotteryCorner state, game and historical context.

## 17. Privacy and Rights

Winner submissions require consent, verification and removal of barcode, serial and claim details. Do not publish home addresses or speculate about anonymous winners.

Use owned/licensed images. AI-generated images must not fabricate a real winner, retailer or event as documentary evidence. Prefer verified data graphics.

## 18. Sharing and Notifications

Share controls:

- Copy Link;
- Facebook;
- X;
- WhatsApp;
- Reddit;
- email;
- native mobile share.

Users may follow game, state, jackpot threshold, winners, rule changes, unclaimed deadlines, Research, replies and events.

Adjacent-event alerts require separate opt-in.

## 19. News Hub Modes

```text
NEWS-NORMAL
NEWS-BREAKING
NEWS-MAJOR-JACKPOT
NEWS-LOW-VOLUME
NEWS-EVENT
```

## 20. Governed Taxonomy

```text
contentType
newsCategory
gameId
stateCode
topic
storyStatus
riskLevel
eventId
reporterId
editorId
```

Approved categories:

- Jackpot
- Winner
- Unclaimed Prize
- State Lottery
- Game Change
- Scratch-Off
- Claims and Taxes
- Scam and Safety
- Industry
- Community
- Research
- Celebration and Event

## 21. URL Contract

Conceptual:

```text
/news
/news/{article-slug}
/authors/{reporter-slug}
```

Preserve existing routes until URL audit. Do not automatically create deep state/game folders.

## 22. News-to-Guide Handoff

A News article records the dated change. An evergreen Guide owns the current answer.

## 23. Ads

No ad:

- between headline and Bottom Line;
- inside reporter identity;
- inside AI context;
- inside correction/update timeline;
- between safety warning and instructions;
- between discussion question and first comments.

No affiliate CTA in claim, scam, fraud or Responsible Play articles.

## 24. Measurement

Track engaged time, completion, AI usefulness, historical-context clicks, tool/game continuation, discussion quality, shares, second-page recirculation, reporter-profile visits, alert signups, return visits, corrections and adjacent-content lottery continuation.

## 25. Final Formula

> **Short verified story → accountable reporter → original LotteryCorner context → conditional AI value → focused conversation → relevant next action.**

This research is approved and frozen as Version 1.1.
