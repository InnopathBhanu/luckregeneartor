# LotteryCorner Community Content and Schema Template — Final Approved

**Document:** `08D-lotterycorner-community-content-and-schema-template-FINAL-APPROVED.md`  
**Version:** 1.0  
**Status:** Final approved reusable template

---

## 1. Forum Entry Inputs

```text
forumEntryId
slug
title
body
username
createdAt
updatedAt
tags[]
gameId
stateCode
drawId
yearArchive
newsArticleId
toolId
eventId
status
indexabilityState
moderationState
```

---

# TEMPLATE A — GENERAL FORUM ENTRY

## Metadata

```text
Title: <Title> | LotteryCorner Community
Description: Join LotteryCorner members discussing <game/state/topic>, read replies and add your experience.
Canonical: https://www.lotterycorner.com/community/<slug>
```

## Header

```text
<Tags and context>

<Title>

Posted by @<username>
<date/time> · Updated <date/time-if-applicable>
```

## Root Post

```text
<Complete user-authored body>
```

## References

```text
<Game Page card>
<State Page card>
<Draw/Archive card>
<Tool card>
<News Article card>
<Official source card>
```

## Replies

```text
@<username>
<reply text>
<date/time>
Helpful | Reply | Report
```

## Follow

```text
Follow Entry
Follow @username
Follow <Game/State>
```

---

# TEMPLATE B — QUESTION-LIKE ENTRY

Use the same `FORUM_ENTRY`.

Suggested title:

```text
How does Fireball work for Florida Pick 3?
```

Optional labels:

```text
question
claim-help
florida
pick-3
```

Reply composer:

```text
Add your answer or experience…
```

Optional accepted reply:

```text
Accepted Reply
```

Schema remains:

```text
DiscussionForumPosting
```

No separate QAPage.

---

# TEMPLATE C — NUMBER SHARE

## Structured Block

```text
Game: <game>
Draw: <draw>
Numbers: <numbers>
Play type: <type>
Shared publicly by: @<username>
```

After result:

```text
Verified result attached
Historical overlap: <neutral wording>
```

Do not convert a private set without explicit confirmation.

---

# TEMPLATE D — SYSTEM ENTRY

```text
System: <name>
Game: <game>
Version: <version>
Method: <explanation>
Example: <numbers/rules>
Backtest/tool: <link>
Assumptions: <assumptions>
```

Disclosure:

```text
This is a member method or historical research workflow. It does not guarantee future wins.
```

---

# TEMPLATE E — WIN STORY

```text
State:
Game:
Amount:
Story:
Verification state:
Photo:
```

Verification labels:

```text
Unverified Story
Ticket Image Redacted
LotteryCorner Reviewed
Official Source Confirmed
```

Privacy warning:

```text
Never upload a barcode, claim number, serial number, address or account information.
```

---

# TEMPLATE F — POLL

```text
Question:
Choice 1:
Choice 2:
...
Closes:
Votes:
```

Disclosure:

```text
This is a LotteryCorner community poll and does not represent all lottery players.
```

---

# TEMPLATE G — LOTTERYCORNER AI REPLY

```text
LotteryCorner AI

<Plain-language factual response>

Sources and tools:
• <source/tool>

Generated: <timestamp>
Updated: <timestamp-if-applicable>
Correction status: <status>
```

Do not automatically mark as accepted.

---

# TEMPLATE H — LOTTERYCORNER RESEARCH REPLY

```text
LotteryCorner Research

Question researched:
<question>

What we found:
<grounded answer>

Evidence:
• <source>
• <LotteryCorner data/tool>

What remains uncertain:
<uncertainty>

Published/updated:
<timestamp>
```

---

# TEMPLATE I — COMMUNITY SUMMARY

Render only after enough real activity.

```text
Community Summary

Facts verified:
• ...

Player experiences:
• ...

Different viewpoints:
• ...

Questions still open:
• ...
```

Disclosure:

```text
Generated from visible community replies and linked sources. It does not replace the original discussion.
```

---

# TEMPLATE J — MODERATION/CORRECTION

```text
Moderator Note
<reason and action>

Correction
<fact corrected, date and source>

Outdated
<applicable-until date and current information link>
```

---

# TEMPLATE K — DISCUSSIONFORUMPOSTING JSON-LD MAP

```text
@context: https://schema.org
@type: DiscussionForumPosting
@id: <canonical>#posting
url: <canonical>
mainEntityOfPage:
  @id: <canonical>#webpage
headline: <visible title>
text: <visible root post>
author:
  @type: Person
  @id: /members/<username>#person
  name: <visible username or display name>
  alternateName: <username-if-applicable>
  url: /members/<username>
datePublished: <ISO timestamp>
dateModified: <ISO timestamp>
about: <game/state/topic entities>
mentions: <draw/article/tool/reference entities>
comment:
  - @type: Comment
    @id: <reply URL/anchor>
    text: <visible reply>
    author:
      @type: Person
      name: <visible reply username>
      url: /members/<username>
    datePublished: <ISO timestamp>
interactionStatistic:
  - @type: InteractionCounter
    interactionType: https://schema.org/CommentAction
    userInteractionCount: <visible reply count>
isPartOf:
  @id: /community#collection
publisher:
  @id: /#organization
```

Rules:

- include only visible/crawlably accessible replies;
- match visible usernames, dates and text;
- no private/deleted content;
- no hidden AI claims;
- no separate QAPage;
- article page remains NewsArticle.

---

# TEMPLATE L — PROFILEPAGE JSON-LD MAP

```text
@context: https://schema.org
@type: ProfilePage
@id: /members/<username>#profile
url: /members/<username>
mainEntity:
  @type: Person
  @id: /members/<username>#person
  name: <visible name or username>
  alternateName: <username>
  image: <visible genuine avatar-if-any>
  description: <visible bio>
  identifier: <public member identifier-if-shown>
  interactionStatistic: <accurate visible counts>
  sameAs: <verified user-provided profiles>
```

---

# TEMPLATE M — CANONICAL ARTICLE DISCUSSION

News Article:

```text
canonicalDiscussionThreadId: <forumEntryId>
```

Article page remains:

```text
NewsArticle
```

Community page:

```text
/community/<slug>
```

uses:

```text
DiscussionForumPosting
```

Both render the same replies.

---

# TEMPLATE N — SERVER-VISIBLE CONTENT

Initial HTML includes:

```text
title
tags/context
username/profile
date
root post
structured attachment
source/reference cards
initial meaningful replies
helpful/accepted label
AI/Research reply when present
moderation/correction status
canonical link
```

Unique content cannot depend only on client-side AI or Load More.

---

# TEMPLATE O — INDEXABILITY

```text
INDEX_PENDING
INDEX_ELIGIBLE
INDEXED
NOINDEX_LOW_VALUE
NOINDEX_PRIVATE
NOINDEX_MODERATED
MERGED
REMOVED
```

Only eligible public entries enter the sitemap.

---

# TEMPLATE P — PUBLIC/PRIVATE SHARE CONFIRMATION

```text
You are sharing publicly:

• <number set/photo/tool snapshot>
• Game/state context
• Your username

Not shared:

• private saved sets
• purchased ticket record
• email/account information
```

Require confirmation before publish.

---

# TEMPLATE Q — RESPONSIBLE PLAY INTERVENTION

```text
It sounds like lottery play may be causing stress.

You can pause promotional alerts, hide Buy Tickets, review your limits or access support resources.

Your post is not publicly shamed or labelled.
```

---

## Final Approval

This template is approved for all LotteryCorner Forum Entries, usernames, tags, replies, AI/Research participation, profiles, article discussions and SEO/GEO schema implementation.
