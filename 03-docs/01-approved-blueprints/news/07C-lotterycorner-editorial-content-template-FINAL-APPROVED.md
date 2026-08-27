# LotteryCorner Editorial Content Template — Final Approved

**Version:** 1.0  
**Status:** Final approved reusable template

## 1. Inputs

```text
contentType
newsCategory
storyStatus
headline
slug
reporterName
reporterSlug
reporterPhoto
reporterRole
editorName
datePublished
dateModified
primaryEntity
gameIds[]
stateCodes[]
drawIds[]
yearArchiveIds[]
toolIds[]
canonicalDiscussionThreadId
primarySource
additionalSources[]
lotteryCornerDataUsed[]
riskLevel
```

# A. STANDARD NEWS ARTICLE

## Metadata

```text
Title: <Headline> | LotteryCorner
Description: <Factual summary plus player implication>
Canonical: <approved article URL>
Robots: index,follow
```

## Header

```text
<CATEGORY> · <STATE/GAME> · <STATUS>

<Headline>

By <Reporter Name>
<Reporter Role>
Published <date> · Updated <date-if-applicable>
```

Reporter photo/name link to `/authors/<reporter-slug>`.

## Bottom Line

```text
Bottom Line: <What happened and why it matters in one or two sentences.>
```

## Main Article

```text
1. Main verified event.
2. Amount/date/state/game.
3. Player implication.
4. Source or quote.
5. State/game/historical context.
6. Deadline or next official event.
```

## Reporter’s Take — Optional

```text
Reporter’s Take: <Brief clearly labelled interpretation.>
```

## Conditional AI Module

Use only when it adds new value.

```text
LotteryCorner AI Historical Note
<Grounded historical comparison>
Based on <source/data>. Open supporting history.
```

or:

```text
LotteryCorner AI Explainer
<Rule, tax, claim, odds or game explanation>
Open related guide/tool.
```

## Why It Matters

```text
• <Player impact>
• <State/game impact>
• <Deadline, claim, tax, price or rule effect>
```

## Historical/Data Connection

```text
Worth Knowing
<Verified historical or LotteryCorner data point>
```

## Primary Action

Choose one:

```text
Open Game
Open State Page
Check My Numbers
Use Tax Calculator
Compare Cash vs Annuity
Open Claim Guide
Open Historical Archive
Read Scam Guidance
```

## Discussion

```text
Join the Discussion
<One focused neutral question>
```

Render `canonicalDiscussionThreadId`.

## Related Next Steps

Maximum three.

## Sources

```text
Primary source:
Additional sources:
LotteryCorner data used:
Last checked:
Correction status:
Reporter:
Editor:
```

# B. FLASH UPDATE

```text
Headline
Reporter identity
Bottom Line
90–250 words or complete required length
Optional AI only when adding context
Relevant page
Canonical discussion
Sources
```

# C. DEVELOPING STORY

```text
DEVELOPING STORY

Latest confirmed fact: <fact/time>

Update timeline:
<time> — <verified update>

Confirmed:
• ...

Unconfirmed:
• ...
```

No speculative AI.

# D. WINNER STORY

Required:

```text
game
draw date
prize
state
retailer
winner identity status
claim deadline
cash/annuity options
anonymity/publicity rule
retailer bonus when verified
```

Do not publish home address, ticket barcode, claim number or unverified family detail.

# E. RULE OR PRICE CHANGE

Use a Before/After table:

| Item | Before | After |
|---|---|---|
| Price | | |
| Matrix | | |
| Draw days | | |
| Multiplier/add-on | | |
| Prize structure | | |
| Odds | | |

# F. UNCLAIMED PRIZE

Include game, draw date, amount, sale location, deadline, claim process and official contact.

Actions:

```text
Check My Numbers
Open State Claim Guide
View Original Draw
```

No Buy CTA beside claim information.

# G. SCAM OR SAFETY ALERT

```text
SCAM / SAFETY ALERT

Bottom Line: <scam and safe action>

Do not pay.
Do not share account or ticket information.
Verify through official channels.
Report the message/account.
Preserve evidence where appropriate.
```

No affiliate CTA or ad between warning and steps.

# H. EDITORIAL / GUIDE

Use real author and `Article` or `BlogPosting`.

Structure:

```text
Question/topic
Bottom Line
Explanation
Examples/data
Tool
Sources/methodology
Discussion
Related news/guide
```

# I. COMMUNITY EVENT

Include:

```text
Why This Is on LotteryCorner
<direct lottery connection>
lotteryConnectionScore >= 3
event end date
```

No bookmaker odds, betting advice or routine sports recap.

# J. REPORTER PROFILE

Route:

```text
/authors/<reporter-slug>
```

Visible:

```text
Name
Photo
Role
Biography
States/games/topics covered
Recent articles
Editorial standards
Corrections
Newsroom contact
Professional profiles
```

Schema:

```text
ProfilePage
mainEntity:
  @type: Person
  @id: /authors/<slug>#person
  name
  image
  description
  jobTitle
  worksFor
  knowsAbout
  sameAs
  url
```

# K. NEWSARTICLE JSON-LD CONTENT MAP

```text
@context: https://schema.org
@type: NewsArticle
@id: <canonical>#article
url: <canonical>
mainEntityOfPage:
  @id: <canonical>#webpage
headline: <visible headline>
description: <visible/meta summary>
image:
  - <landscape>
  - <square>
  - <vertical>
datePublished: <ISO timestamp>
dateModified: <ISO timestamp>
author:
  @type: Person
  @id: /authors/<reporter-slug>#person
  name: <Reporter Name>
  url: /authors/<reporter-slug>
  image: <Reporter Photo>
  jobTitle: <Reporter Role>
  worksFor:
    @id: /#organization
publisher:
  @type: Organization
  @id: /#organization
  name: LotteryCorner
  url: /
  logo:
    @type: ImageObject
    url: <Approved logo>
articleSection: <Category>
keywords: <governed keywords>
about: <primary entities>
mentions: <related entities>
isAccessibleForFree: true
inLanguage: en-US
copyrightHolder:
  @id: /#organization
copyrightYear: <year>
publishingPrinciples: <editorial policy URL>
```

All values must match visible content.

# L. CORRECTION BLOCK

```text
Correction: <date/time>

We corrected <fact>. The article previously stated <previous fact>. The verified information is <corrected fact>.

The Bottom Line, AI context, social assets and related data cards were updated.
```

# M. SOCIAL PACKAGE

```text
Facebook: human-interest or discussion-led
X: main fact plus one statistic
WhatsApp: plain one-sentence summary
Reddit: transparent descriptive title
Push: one verified fact plus reason to open
```

Do not impersonate a user recommendation.

# N. SERVER-VISIBLE CONTENT

Initial HTML includes:

```text
content class/category
headline
reporter identity/profile
published/updated date
Bottom Line
main article
AI module when rendered
Why It Matters
historical/data context
discussion link
sources
correction status
related canonical links
```

# O. OWNERSHIP

| Content | Owner |
|---|---|
| Headline/article | Reporter and Editor |
| Bottom Line | Reporter and Editor |
| Reporter identity | Author Profile |
| Publisher | LotteryCorner Organization |
| AI context | AI Editorial service |
| Historical fact | Governed data/tool |
| State/game context | Entity registry |
| Discussion | Canonical Community thread |
| Sources | Source registry |
| Corrections | Editorial lifecycle |
| Social assets | Social publishing service |
| Affiliate | First-party resolver |

This template is approved for LotteryCorner’s reporter-led News and Editorial system.
