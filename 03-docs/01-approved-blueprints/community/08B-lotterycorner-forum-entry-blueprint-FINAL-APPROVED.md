# LotteryCorner Forum Entry Blueprint — Final Approved

**Document:** `08B-lotterycorner-forum-entry-blueprint-FINAL-APPROVED.md`  
**Version:** 1.0  
**Status:** Final approved and frozen  
**Canonical route:** `/community/{forum-entry-slug}`

---

## 1. Page Model

Every question, discussion, number share, system, win story, poll or news conversation uses one:

```text
FORUM_ENTRY
```

Tags and helpers define presentation.

---

## 2. Page Order

| Order | ID | Section |
|---:|---|---|
| 1 | FE-01 | Breadcrumbs, Tags and Context |
| 2 | FE-02 | Title, Username and Dates |
| 3 | FE-03 | Root Post |
| 4 | FE-04 | Structured Attachment |
| 5 | FE-05 | Sources, Tool or Page Context |
| 6 | FE-06 | LotteryCorner AI or Research Reply |
| 7 | FE-07 | Replies |
| 8 | FE-08 | Helpful or Accepted Reply |
| 9 | FE-09 | Community Summary |
| 10 | FE-10 | Reply Composer |
| 11 | FE-11 | Related Forum Entries |
| 12 | FE-12 | Follow and Notifications |
| 13 | FE-13 | Moderation, Corrections and Responsible Play |
| 14 | AD-FE00 | Controlled Reply Advertisement |
| 15 | Footer | Community/game/state navigation |

---

## 3. FE-01 — Context

Show visible chips:

- game;
- state;
- draw/date;
- year archive;
- news article;
- system/tool;
- governed tags.

Do not expose internal IDs.

---

## 4. FE-02 — Identity

Display:

```text
<Title>
Posted by @<username>
<date/time> · Updated <date/time-if-applicable>
```

Optional labels:

- Helpful Contributor;
- State Regular;
- Game Expert;
- System Contributor;
- Reporter;
- Moderator;
- LotteryCorner Research.

---

## 5. FE-03 — Root Post

Full user content.

Supports:

- text;
- number sets;
- images;
- poll;
- system detail;
- safe tool snapshot;
- links/reference cards.

User wording remains intact.

AI-assisted title changes do not silently rewrite the post body.

---

## 6. FE-04 — Structured Attachment

### Number Share

```text
Game
Draw
Numbers
Play type
Public-share confirmation
Result status after draw
```

### System

```text
System name
Game
Version
Rules
Example
Backtest/tool link
Assumptions
```

### Win Story

```text
State
Game
Amount
Photo
Verification state
Story
```

### Poll

```text
Question
Choices
Vote count
Close date
Community poll disclosure
```

All remain the same page type.

---

## 7. FE-05 — Context References

Structured cards may link to:

- Game Page;
- State Page;
- Result;
- Year Archive;
- Tool;
- News Article;
- official source;
- LotteryCorner Guide.

---

## 8. FE-06 — AI/Research Reply

Optional.

Labels:

- LotteryCorner AI;
- LotteryCorner Research;
- Moderator Clarification;
- Reporter Clarification.

Show:

- response;
- sources/tools;
- generated/updated date;
- correction status.

AI does not appear first for purely social/opinion entries unless invoked.

---

## 9. FE-07 — Replies

Sort options:

- Top;
- Newest;
- Oldest;
- Helpful.

Mobile uses limited visual nesting and parent-link navigation.

Replies support:

- mention;
- quote;
- source card;
- image where approved;
- helpful;
- report;
- block;
- follow.

---

## 10. FE-08 — Helpful or Accepted Reply

The original poster may accept one reply where appropriate.

Multiple replies may be marked helpful.

AI cannot accept itself.

A later correction may replace an accepted reply with audit history.

---

## 11. FE-09 — Community Summary

Optional after enough real activity.

May show:

- facts verified;
- common viewpoints;
- differing opinions;
- open questions;
- useful links.

Must not manufacture consensus or replace replies.

---

## 12. FE-10 — Reply Composer

Placeholder:

```text
Add your answer or experience…
```

Context-sensitive alternatives:

```text
Share your numbers…
Add your experience…
Explain your method…
Answer the question…
```

Keep the model simple.

---

## 13. FE-11 — Related Entries

Maximum useful suggestions based on:

- game;
- state;
- tags;
- draw;
- news;
- system;
- duplicate similarity.

---

## 14. FE-12 — Follow

Users may follow:

- entry;
- user;
- game;
- state;
- system.

Delivery options:

- immediate;
- daily;
- weekly;
- mentions/replies only;
- quiet hours.

---

## 15. FE-13 — Moderation and Status

Visible states where relevant:

```text
Updated
Outdated
Corrected
Locked
Archived
Merged
Removed
Under Review
```

Stale factual replies retain history but show applicability dates and current corrections.

---

## 16. Indexability

New entry:

```text
INDEX_PENDING
```

Eligible after quality, moderation and public-value checks.

Noindex:

- thin;
- duplicate;
- private;
- moderated;
- sensitive;
- empty recurring;
- AI-only low-value.

---

## 17. Forum Schema

Primary type:

```text
DiscussionForumPosting
```

Conceptual graph:

```text
WebPage
DiscussionForumPosting
Person
Comment
InteractionCounter
BreadcrumbList
ImageObject
VideoObject
Organization
```

Recommended root fields:

```text
@id
url
headline
text
author
datePublished
dateModified
comment
interactionStatistic
image
video
about
mentions
isPartOf
mainEntityOfPage
```

Replies represented as visible `Comment` objects.

### Binding rules

- use JSON-LD;
- schema matches visible content;
- only visible/crawlable replies included;
- one canonical URL;
- article remains `NewsArticle`;
- no separate QAPage implementation;
- user question tags do not change the top-level schema.

---

## 18. Canonical and Pagination

- canonical `/community/{slug}`;
- embedded versions link to canonical;
- crawlable long-thread pages;
- stable reply anchors;
- sort/filter variants noindex;
- merged duplicates redirect;
- removed/private status handled accurately.

---

## 19. Metadata

Title pattern:

```text
<Forum Entry Title> | LotteryCorner Community
```

Description:

```text
Join LotteryCorner members discussing <game/state/topic>, read player replies and add your experience.
```

Question-like entries may use:

```text
<Plain question title> | LotteryCorner Community
```

---

## 20. Share

Copy, Facebook, X, WhatsApp, Reddit and native mobile share.

Do not expose private numbers, ticket records or removed media.

---

## 21. Ads and Buy

No ad in:

- root post;
- first reply;
- helpful/accepted reply;
- AI Research;
- privacy warning;
- Responsible Play intervention.

Buy suppression follows context and safety rules.

---

## 22. Measurement

- read depth;
- reply start/completion;
- first human reply;
- AI-only to human-reply conversion;
- helpful/accepted use;
- follow;
- return after result;
- source/evidence clicks;
- moderation;
- index eligibility;
- organic/AI discovery.

This blueprint is approved and frozen as Version 1.0.
