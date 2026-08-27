# LotteryCorner News Article Blueprint — Final Approved

**Version:** 1.0  
**Status:** Final approved and frozen

## 1. Page Promise

The reader understands the verified story quickly, knows who reported it, receives original LotteryCorner context and has a focused reason to continue or participate.

## 2. Article Types

- Flash Update
- Standard News
- Explainer/Research
- Developing Story

## 3. Page Order

| Order | Section |
|---:|---|
| 1 | Category, entities and status |
| 2 | Headline |
| 3 | Reporter identity and dates |
| 4 | Bottom Line |
| 5 | Primary image/data card |
| 6 | Main article |
| 7 | Conditional AI context |
| 8 | Why It Matters |
| 9 | Historical/data connection |
| 10 | Relevant tool/game/state/guide |
| 11 | Focused discussion question |
| 12 | Canonical discussion |
| 13 | Related next actions |
| 14 | Sources, updates and corrections |
| 15 | Responsible Play/affiliate disclosure |

## 4. Reporter Identity

Visible:

```text
By <Reporter Name>
LotteryCorner Reporter
Published <date/time> · Updated <date/time-if-applicable>
```

Reporter image and name link to:

```text
/authors/{reporter-slug}
```

A real author and accountable editor are required for normal News.

## 5. Bottom Line

One or two human-written or editor-approved sentences stating what happened and why it matters.

## 6. Main Article

Use short paragraphs and verified attribution.

Suggested flow:

1. event;
2. amount/date/state/game;
3. player impact;
4. source/quote;
5. local or historical context;
6. next official deadline/event.

## 7. Reporter’s Take

Optional, one short labelled paragraph. It cannot introduce unsupported facts.

## 8. Conditional AI

Render only when it adds new value.

Labels:

```text
AI Quick Take
AI Context
AI Explainer
AI Historical Note
```

Every claim links to supporting source, data, archive or tool.

## 9. Why It Matters

Explain cost, odds, claim, state rule, deadline, anonymity, scam/safety, community impact or game effect.

## 10. Historical Connection

Use deterministic LotteryCorner data before AI explanation.

## 11. Primary Action

Choose one relevant action, not a tool wall.

## 12. Focused Discussion

One neutral question tied to the story.

The article owns:

```text
canonicalDiscussionThreadId
```

The same thread is reused by Community.

## 13. Sources and Corrections

Visible:

```text
Primary source
Additional sources
LotteryCorner data used
Last checked
Update status
Correction status
```

A correction updates the article, Bottom Line, AI context, social image and discussion fact banner.

## 14. Author Profile

Route:

```text
/authors/{reporter-slug}
```

Schema:

```text
ProfilePage
mainEntity: Person
```

## 15. NewsArticle Schema

Conceptual graph:

```text
NewsArticle
WebPage
Person
Organization
ImageObject
BreadcrumbList
```

Required `NewsArticle` fields:

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

Author is a linked `Person`; publisher is the LotteryCorner `Organization`.

Use `Article` or `BlogPosting` for evergreen Editorial.

The article remains `NewsArticle` even when comments are rendered. A standalone genuine user thread may use `DiscussionForumPosting`.

## 16. Open Graph and X

Include verified headline, description, canonical, author, dates and correction-safe images.

Do not include IP-resolved offers, private data or unverified identities.

## 17. Developing Story

One stable URL, latest confirmed fact, update timeline, uncertainty block and no speculative AI.

## 18. Privacy and Rights

Winner content requires consent, verification and sensitive-image redaction. No exact home address or anonymous-winner speculation.

Use owned/licensed images. Never fabricate documentary imagery.

## 19. Ads

No ad between headline and Bottom Line, in reporter identity, inside AI context, correction timeline, safety instructions or between discussion prompt and first comments.

## 20. Moderation

AI responds only when invoked or needed for unresolved factual clarification. No impersonation, manufactured consensus or comment domination.

## 21. Accessibility

WCAG 2.2 AA, semantic headings, accessible author identity, image alt text, video captions, keyboard comments/share controls and visible status labels.

## 22. Lifecycle

```text
DRAFT
SCHEDULED
PUBLISHED
DEVELOPING
UPDATED
CORRECTED
RESOLVED
EVERGREEN
ARCHIVED
MERGED
RETRACTED
```

This blueprint is approved and frozen as Version 1.0.
