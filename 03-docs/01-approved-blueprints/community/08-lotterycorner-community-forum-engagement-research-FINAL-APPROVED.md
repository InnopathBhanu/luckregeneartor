# LotteryCorner Community, Forum and Engagement Research — Final Approved

**Document:** `08-lotterycorner-community-forum-engagement-research-FINAL-APPROVED.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Version:** 1.1  
**Status:** Final approved and frozen research  
**Approved date:** July 24, 2026  
**Scope:** U.S. lottery community, forum entries, usernames, tags, AI participation, SEO/GEO, moderation, mobile posting and return loops  
**Supersedes:** `08-lotterycorner-community-forum-engagement-research.md`

---

## 1. Final Community Decision

LotteryCorner will not build separate technical systems for questions, discussions, number posts, systems, polls, winner stories or news comments.

Everything uses one object:

```text
FORUM_ENTRY
```

Every public community page uses one URL pattern:

```text
/community/{forum-entry-slug}
```

Examples:

```text
/community/how-does-fireball-work-in-florida-pick-3
/community/florida-pick-3-july-2026-numbers
/community/cash-or-annuity-for-a-500-million-jackpot
/community/my-pick-3-pair-filter-system
/community/i-won-500-on-a-florida-scratcher
```

Meaning is expressed through:

- username;
- governed tags;
- attached game, state, draw, article, archive or tool context;
- optional structured helpers;
- replies and moderation state.

The user should not have to understand forum taxonomy or select a technical thread type.

---

## 2. Product Vision

> **A question, number set, story or opinion can begin anywhere on LotteryCorner, automatically receive the correct context and continue as one canonical community conversation.**

The Community layer is accessible from:

- Home;
- Community Home;
- State Pages;
- Game Pages;
- Current Results;
- Year Archives;
- Tools;
- News Articles;
- Conversational AI;
- notifications;
- mobile/app entry points.

The post composer travels to the user.

---

## 3. LotteryPost Persona and Engagement Priorities

LotteryPost’s public forum activity shows that sustained engagement is strongest around:

- Pick 3;
- Pick 4;
- daily number sharing;
- state communities;
- systems and methods;
- jackpot discussions;
- scratch-off wins;
- mathematics;
- mystical and lucky-number discussion;
- lottery news comments.

Therefore, LotteryCorner treats these as first-class areas:

- Pick 3 and Pick 4 recurring threads;
- state/game-specific number sharing;
- systems and backtests;
- winner and ticket stories;
- jackpot and claim discussions;
- mathematical explanations;
- Dreams, Signs and Lucky Numbers;
- news discussions;
- questions needing player experience.

The interface uses plain lottery-player language, not technical product terminology.

---

## 4. Simple Forum Entry Model

```text
ForumEntry
- id
- slug
- title
- body
- username
- createdAt
- updatedAt
- tags[]
- contextEntities[]
- replies[]
- status
- canonicalUrl
- moderationState
- indexabilityState
```

Optional context:

```text
gameId
stateCode
drawId
yearArchive
newsArticleId
toolId
eventId
```

All context is attached automatically when the user posts from a related page.

---

## 5. Governed Tags

Tags organize one common content model.

Examples:

```text
question
discussion
powerball
mega-millions
florida
pick-3
pick-4
numbers
system
winner-story
scratch-off
news
claim-help
mathematics
dreams-and-lucky-numbers
poll
tool-help
community-event
```

Rules:

- LotteryCorner infers tags;
- users may correct visible suggestions;
- no uncontrolled tag creation;
- tags never create a second content object;
- tags may power filters and landing views;
- filter/tag combinations are not automatically indexable.

---

## 6. Universal Composer

Primary action:

```text
Ask or Share
```

Main field:

```text
What do you want to ask or share?
```

Optional helper choices:

- Ask a Question;
- Share Numbers;
- Share a Win;
- Start a Discussion;
- Explain a System;
- Add a Photo;
- Create a Poll.

These change helper inputs only. They do not create different backend types or URLs.

### Composer flow

1. User types in plain language.
2. LotteryCorner infers title, tags and context.
3. Similar entries, active monthly threads, guides and existing answers are suggested.
4. AI may clarify wording, detect private data or give an immediate factual answer.
5. Sign-in is requested only when publishing or uploading.
6. Draft and context survive sign-in.
7. One tap publishes.

---

## 7. Multiple Entry Points

### Home

```text
What do you want to ask lottery players?
```

### Game Page

```text
Ask about Powerball
Share your numbers
Discuss this game
```

### State Page

```text
Ask Florida lottery players
Start a Florida discussion
```

### Result

```text
Discuss this drawing
Did anyone win?
Share what you played
```

### Archive

```text
Ask about this year
Share an archive finding
```

### Tool

```text
Ask what this chart means
Share this number set
Discuss this system result
```

### News Article

Uses the article’s one canonical Forum Entry.

### Conversational AI

```text
Ask the Community
Post this question
Share this answer for discussion
```

The user reviews the AI excerpt, sources and attached context before publishing.

---

## 8. Replies and Helpful Answers

Every Forum Entry uses the same reply model.

Optional visible reply labels:

```text
helpful
accepted
LotteryCorner AI
LotteryCorner Research
reporter clarification
moderator clarification
official source reference
```

An accepted reply may be selected when useful, but it does not change the page type or URL.

AI cannot accept its own answer.

Accepted/helpful replies support later correction and replacement history.

---

## 9. AI Role

The founder-approved differentiator is:

> A user can ask the community and LotteryCorner AI may provide the first useful factual answer while real players build on it.

Immediate AI is appropriate for:

- game rules;
- schedules;
- odds;
- claim basics;
- archive queries;
- tool explanations;
- deterministic checking;
- known state/game facts.

LotteryCorner Research is appropriate for:

- historical investigation;
- source conflicts;
- current news;
- system comparison;
- source-heavy questions.

AI normally does not lead:

- “What are you playing?”;
- winner celebrations;
- dreams and spiritual interpretation;
- opinion polls;
- introductions;
- community disputes.

AI participation rules:

- respond when invoked, needed for unresolved facts or requested by moderation;
- do not answer every post;
- do not suppress human participation;
- do not impersonate;
- do not manufacture consensus;
- cite tools and sources;
- use plain player language.

A Forum Entry with only an AI response may still be shown as:

> Needs a player’s experience

---

## 10. Canonical Ownership

Every conversation has one:

```text
threadId
canonicalRoute
rootPostId
tags[]
contextEntities[]
replyCollection
```

The same Forum Entry may be rendered from:

- News Article;
- Game Page;
- State Page;
- Draw Result;
- Year Archive;
- Community Home;
- Member Profile;
- AI conversation.

Embedded versions link to:

```text
/community/{forum-entry-slug}
```

No duplicate article comment stream, forum thread and AI thread.

---

## 11. News Article Discussion

The article page remains:

```text
NewsArticle
```

The attached community conversation has one canonical Forum Entry.

The article can render the same replies inline but does not become a forum page.

The standalone Community URL may use `DiscussionForumPosting`.

---

## 12. SEO, GEO and Schema Decision

LotteryCorner uses one main community schema:

```text
DiscussionForumPosting
```

for genuine user-created Forum Entry pages, including entries framed as questions.

Replies use:

```text
Comment
```

Supporting graph:

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

No separate `QAPage` implementation is required.

The schema purpose is determined by the actual user-generated community page, not the presence of a question mark.

### Required schema principles

- root post is visible;
- author username is visible;
- dates match the page;
- only visible/crawlably available replies are marked up;
- structured data matches content;
- article comments do not change `NewsArticle` into forum markup;
- JSON-LD is preferred;
- LotteryCorner Organization uses one stable `@id`.

### GEO/AI discovery

There is no special GEO-only schema.

Useful public entries should provide:

- descriptive title;
- concise root post;
- stable username;
- game/state/draw context;
- dates;
- helpful or accepted reply;
- facts versus theory labels;
- source cards;
- visible replies;
- canonical URL;
- moderation/correction status.

A grounded Community Summary may be shown only after enough real content exists.

---

## 13. Indexability

States:

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

New entries default to:

```text
INDEX_PENDING
```

Index eligibility may require:

- meaningful root content;
- useful reply or governed AI answer;
- clear context/tags;
- no duplicate;
- moderation cleared;
- public privacy state;
- stable canonical URL.

Do not auto-index:

- empty monthly threads;
- one-line low-value entries;
- duplicates;
- private support issues;
- sensitive ticket/claim cases;
- thin AI-only pages;
- removed content.

---

## 14. Thread Quality and Internal Prominence

Signals:

```text
originalContentQuality
answerCompleteness
humanContribution
sourceSupport
gameStateSpecificity
historicalDataValue
toolIntegration
uniqueContributorCount
helpfulVotes
acceptedReply
moderationQuality
freshness
```

Penalties:

```text
duplicateSimilarity
spamRisk
thinContent
guaranteedWinClaims
privateDataRisk
toxicity
unresolvedMisinformation
```

The score may govern:

- sitemap inclusion;
- internal links;
- Most Helpful;
- AI retrieval priority;
- index eligibility.

It must not become a visible public points score at launch.

---

## 15. Recurring Threads

Recurring entries are important for daily games.

Examples:

```text
Florida Pick 3 — July 2026
Georgia Cash 3 — July 2026
Powerball Drawing — July 25, 2026
```

Create only when:

- demonstrated activity exists;
- follower threshold is met;
- or moderator/editor enables it.

Lifecycle:

```text
SCHEDULED
OPEN
ACTIVE
CLOSED
ARCHIVED
MERGED
```

At period end:

- attach verified results;
- close routine submissions;
- preserve replies;
- create the next period only when justified;
- carry forward useful pinned help;
- do not index an empty future thread.

For national games, general draw reaction uses one national discussion. State-specific claim/purchase/winner topics may use separate state-context entries.

---

## 16. Lottery-Native Post Helpers

### Number Share

Supports:

- number set;
- draw;
- play type;
- note;
- public/private confirmation;
- result attachment;
- save/copy.

### System

Supports:

- method;
- game;
- explanation;
- version;
- examples;
- tool/backtest;
- assumptions;
- update history.

### Win Story

Supports:

- photo;
- state;
- game;
- amount;
- story;
- verification label;
- privacy redaction.

### Poll

Supports:

- 2–6 choices;
- close date;
- vote count;
- non-representative label;
- discussion.

Everything remains a `FORUM_ENTRY`.

---

## 17. Public and Private Number Separation

```text
PRIVATE_SAVED_SET
PUBLIC_NUMBER_SHARE
COMMUNITY_SYSTEM_OUTPUT
PURCHASED_TICKET_RECORD
```

Never convert private or purchased information into a public entry without explicit confirmation.

The composer shows exactly what becomes public.

---

## 18. Winner Verification

States:

```text
UNVERIFIED_STORY
TICKET_IMAGE_REDACTED
COMMUNITY_VERIFIED
LOTTERYCORNER_REVIEWED
OFFICIAL_SOURCE_CONFIRMED
```

Any badge must state what was verified.

Do not use a broad “Verified Winner” label without a documented process.

---

## 19. Member Identity and Profiles

Members post using a username.

Real names are optional.

Profile route:

```text
/members/{username}
```

Profile may show:

- username;
- optional real name;
- avatar;
- joined date;
- state/game interests;
- bio;
- public entries and replies;
- helpful/accepted replies;
- systems;
- contributor labels.

Private:

- email;
- phone;
- precise location;
- private number sets;
- ticket/purchase history.

Profile schema:

```text
ProfilePage
mainEntity: Person
```

Empty/private profiles remain noindex.

---

## 20. Reputation

Initial public labels:

- Helpful Contributor;
- State Regular;
- Game Expert;
- System Contributor;
- LotteryCorner Research;
- Reporter;
- Moderator;
- Winner Story Reviewed.

No single public points score at launch.

---

## 21. Direct Messaging

Final launch recommendation:

> No unrestricted private messaging at launch.

Public replies remain the default.

Future messaging requires scam detection, reporting, rate limits, payment-request protection and minor-safety controls.

---

## 22. Moderation and Safety

Moderation categories:

- harassment;
- hate;
- personal data;
- spam;
- affiliate solicitation;
- fake winner claim;
- ticket sale;
- scam;
- guaranteed-win claim;
- unsafe financial advice;
- loss chasing;
- impersonation;
- stolen content;
- copyright issue;
- sports betting;
- underage participation;
- distress.

Actions:

```text
CONTENT_WARNING
LIMIT_REACH
REMOVE_MEDIA
REMOVE_POST
TEMPORARY_MUTE
TEMPORARY_SUSPENSION
PERMANENT_BAN
REQUIRE_REVIEW
```

Provide reason, policy and appeal route.

---

## 23. Ticket Privacy

Redact:

- barcode;
- serial number;
- claim number;
- QR code;
- account details;
- address;
- phone/email.

Warn before publishing.

---

## 24. Responsible Play

Detect language indicating:

- chasing losses;
- borrowing;
- distress;
- compulsion;
- overspending.

Respond with non-judgmental support, controls and help resources.

Suppress:

- Buy Tickets;
- promotional alerts;
- winner-pressure content.

Do not shame users publicly.

---

## 25. Belief and Fact Labels

The platform distinguishes:

```text
Verified Fact
Historical Data
Member Theory
Personal Belief
LotteryCorner AI Explanation
```

Dreams, Signs and Lucky Numbers remains allowed as a clearly labelled community area.

AI does not validate supernatural claims as fact.

---

## 26. Pagination and Server Visibility

- server-render the root post and an initial meaningful reply set;
- use crawlable reply pages for long entries;
- stable reply anchors;
- sort/filter views remain non-indexable;
- no JavaScript-only reply history;
- mobile and desktop expose equivalent public content.

Exact pagination must be tested with long LotteryPost-style entries.

---

## 27. Community Sitemaps

Potential:

```text
community-entries-sitemap.xml
community-profiles-sitemap.xml
```

Only index-eligible public pages are included.

Do not include empty recurring entries, private profiles, merged routes, removed content or thin AI-only pages.

---

## 28. Community Content Licence and Deletion

Community terms should state:

- user retains ownership;
- LotteryCorner receives a licence to display, moderate and distribute;
- public posts may be indexed and processed for AI summaries;
- private content is excluded;
- attribution is retained;
- deletion/anonymization options exist subject to legal/moderation needs.

Account deletion may anonymize valuable public contributions while removing private identity, where policy and law permit.

---

## 29. Mobile Experience

Priorities:

- persistent Ask or Share;
- camera;
- number keyboard;
- voice-to-text;
- automatic context;
- short reply composer;
- shallow visual nesting;
- parent-reply access;
- low-bandwidth images;
- saved drafts;
- sign-in interruption recovery.

---

## 30. Notifications and Return Loops

Events:

- reply;
- mention;
- helpful/accepted reply;
- AI Research answer;
- result attached;
- shared public numbers matched;
- recurring entry opened;
- followed user posted;
- poll closed;
- moderation action;
- article update.

Delivery:

- immediate;
- daily digest;
- weekly digest;
- replies only;
- quiet hours.

Use neutral historical-overlap language.

---

## 31. Ads and Affiliate

Ads may appear:

- between Community Home groups;
- after several replies;
- lower page;
- desktop side rail.

Protected:

- composer;
- root post;
- first reply;
- helpful/accepted reply;
- AI Research reply;
- privacy warning;
- moderation notice;
- Responsible Play intervention.

Buy Tickets may appear only in normal game continuation and is suppressed after losses, distress, claim/scam content, negative backtests and safety contexts.

User-posted affiliate links are prohibited unless explicitly approved.

---

## 32. Delivery

### Phase 1

- Community Home;
- Universal Composer;
- Forum Entry;
- replies;
- usernames/profiles;
- tags/context;
- article canonical discussion;
- follow;
- reporting/moderation;
- schema;
- notifications.

### Phase 2

- Number Share;
- System helper;
- Win Story;
- Poll;
- recurring entries;
- result attachment;
- contributor labels;
- game/state filtered views.

### Phase 3

- AI first answer;
- LotteryCorner Research;
- thread summaries;
- duplicate suggestions;
- AI moderation support;
- Ask Community from AI.

### Phase 4

- invited contributors;
- verified experts;
- community events;
- live sessions;
- advanced creator tools.

---

## 33. Final Approved Decisions

1. One `FORUM_ENTRY` object.
2. One `/community/{slug}` route.
3. Usernames plus governed tags.
4. Automatic page context.
5. One universal composer.
6. Multiple posting entry points.
7. One canonical discussion reused everywhere.
8. One main `DiscussionForumPosting` schema model.
9. No separate Q&A URL or backend type.
10. Optional accepted/helpful replies.
11. AI first answers without domination.
12. Pick 3/Pick 4 and daily-game priority.
13. Recurring threads only where activity exists.
14. Dreams, Signs and Lucky Numbers allowed with belief labels.
15. No unrestricted direct messaging at launch.
16. Indexability and quality controls.
17. ProfilePage for eligible public member profiles.
18. Ticket privacy and Responsible Play intervention.
19. Mobile-first posting and draft preservation.
20. Phased delivery.

This research is approved and frozen as Version 1.1.
