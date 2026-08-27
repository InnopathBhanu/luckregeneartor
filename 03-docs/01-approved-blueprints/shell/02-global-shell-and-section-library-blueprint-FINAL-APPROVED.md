# LotteryCorner Global Shell and Section Library Blueprint

**Document:** `02-global-shell-and-section-library-blueprint.md`  
**Internal codename:** LuckReGenerator  
**Product:** LotteryCorner.com  
**Blueprint package:** BP-01 — Global Shell and Section Library  
**Version:** 1.1  
**Status:** Final approved and frozen blueprint  
**Approved date:** July 23, 2026  
**Delivery class:** Core rebuild foundation  
**Primary authority:**  
- `00A-v2.1-luckregenerator-product-constitution-FROZEN.md`  
- `01-lotterycorner-experience-architecture-FINAL-APPROVED.md`  

**Supporting evidence:**  
- `00B-lottery-player-behavior-engagement-and-ai-experience-research.md`  
- U.S. official state lottery experiences  
- LotteryPost, LotteryUSA and LotteryCorner current public experiences  
- Google Search, Google Preferred Sources, W3C accessibility, FTC affiliate-disclosure and Better Ads guidance  

---

## 0. Blueprint Decision

This blueprint defines the shared product shell and reusable section language from which every LotteryCorner page family will be composed.

It converts the approved product principles into concrete experience rules for:

- desktop web;
- mobile web;
- the future LotteryCorner app wrapper/native shell;
- anonymous visitors;
- signed-in users;
- Insider users;
- page-aware AI;
- contextual search;
- global navigation;
- account continuity;
- advertising;
- affiliate purchase journeys;
- community identity;
- trust and corrections;
- SEO, social and AI-discovery metadata;
- and the reusable section library.

This document does not finalize the detailed section order of Home, State, Game, Result, News, Blog, Forum, Tools or Insider pages. Those decisions belong to their page-family blueprints.

### 0.1 Visual-reference boundary

The supplied desktop and mobile visuals are **non-binding shell references**. They illustrate:

- shared shell zones;
- navigation hierarchy;
- anonymous versus signed-in state differences;
- the relative placement of immediate utility, AI, community, monetization and next actions;
- and the visual anatomy of reusable section types.

They do **not** approve final styling, colors, typography, section density, page-family content order, page-specific advertising volume or final high-fidelity layouts. Each actual page family must receive its own desktop and mobile high-fidelity review and founder approval before implementation.

### 0.2 Binding outcomes of this blueprint

Once approved, page-family blueprints must reuse:

1. The global header and navigation model.
2. The mobile navigation model.
3. The Search and Ask architecture.
4. Anonymous, signed-in and Insider shell behavior.
5. The contextual AI-entry patterns.
6. The global trust, correction, affiliate and advertising language.
7. The section component taxonomy and IDs.
8. The lifecycle and content-operations requirements.
9. The behind-the-screen metadata contract.
10. Accessibility and responsive rules.
11. The Section Intelligence Matrix format.
12. The visual-approval format.

### 0.3 Product principles inherited without reinterpretation

- Complete the immediate user job before extending the session.
- AI is a visible product differentiator, not merely hidden infrastructure.
- AI must be contextual and useful rather than repetitive.
- Human community is a core product layer.
- Registration follows delivered value.
- State-aware purchase options are a first-class user job.
- Advertising is expected on public and Insider pages but is controlled by task sensitivity.
- Every useful surface may create meaningful momentum.
- The user may begin anywhere.
- Mobile is a primary surface.
- Every page must be visually approved before coding.
- A page-level AI panel, chatbot or Quick Take does not by itself satisfy the AI-everywhere requirement. Every individual section must independently evaluate deterministic intelligence, AI explanation, interesting facts and contextual continuation through its Section Intelligence Matrix.

---

# PART I — USER AND EXPERIENCE BASIS

## 1. Primary Shell Personas

The global shell must remain understandable across all personas, but it primarily optimizes for these high-frequency states.

| Persona/state | First need from shell | Shell priority |
|---|---|---|
| Immediate result checker | Reach result without thinking | Results, state/game context and search |
| Regular player | Return to followed games and saved numbers | My Games, My Numbers, notifications |
| Jackpot visitor | See amount, draw time and legal purchase path | Jackpots, state selector, buy eligibility |
| First-time player | Find plain-language help | Search/Ask, Games and How to Play |
| Statistics/systems user | Reach tools and saved work | Tools, Insider and AI |
| Community regular | See activity and replies | Community, Following and notifications |
| Online-ticket buyer | Determine availability | State context and qualified purchase |
| Mobile returner | Complete a micro-session quickly | Bottom navigation, push deep link |
| Winner/claim seeker | Reach calm high-consequence help | Search, state context and claim guide |
| Spending-concerned user | Reach help without marketing | Persistent Responsible Play access |

## 2. Shell Session Modes

The shell changes emphasis without becoming a different website.

| Mode | Shell emphasis |
|---|---|
| Check | Results, game/state search, saved-number check |
| Prepare | Jackpot, next draw, cutoff, numbers, purchase |
| Explore | AI insight, history, news, tools |
| Discuss | Community, followed threads, replies |
| Learn | Ask AI, guides, examples |
| Organize | My Numbers, My Games, saved systems |
| Transact | State eligibility and disclosure |
| Claim | Claim/help navigation, suppressed commerce |
| Control | Responsible-play controls, suppressed promotion |

---

# PART II — GLOBAL INFORMATION ARCHITECTURE

## 3. Proposed Primary Navigation

### 3.1 Desktop primary navigation

The recommended labels are:

1. **Results**
2. **States**
3. **Games**
4. **Jackpots**
5. **Tools**
6. **News**
7. **Community**

Persistent utility actions:

- **Search**
- **Ask LotteryCorner AI**
- **Sign in / My LotteryCorner**

### 3.2 Navigation-language contract

The labels in this blueprint are approved as the working IA, but user-facing wording remains subject to plain-language and usability testing with U.S. lottery players.

Required label tests:

- **Community** versus **Forums**, including whether `Community` is the primary label and `Forums` appears as supporting language during migration and onboarding;
- **My LotteryCorner** as the personal shell, with **Insider** retained as a recognizable capability or membership label inside it;
- **Ask LotteryCorner AI** versus shorter mobile variants such as **Ask AI**;
- whether **Blog** remains nested under **News** in navigation while retaining separate Blog Home, archive and article page families.

All shell copy must use ordinary U.S. lottery-player language: short labels, familiar game terminology and plain explanations. Avoid software, product-management, corporate and technical terminology in public UI.

### 3.3 Why these labels

- They use ordinary player vocabulary.
- Results and States support the largest information jobs.
- Games and Jackpots support affinity and transaction intent.
- Tools exposes LotteryCorner’s historical differentiation.
- News supports SEO, Google Preferred Sources and daily discovery.
- Community preserves LotteryPost-style engagement.
- AI is visible as a utility/action rather than buried in a menu.
- “My LotteryCorner” describes personal continuity more clearly than a technical account label.
- Insider remains an approved product identity inside My LotteryCorner and selected prompts.

### 3.4 Labels not recommended for primary navigation

- Analytics
- Data
- Resources
- AI Lab
- Predictions
- Affiliates
- Social
- Blog as a standalone primary item
- Buy Tickets as a universal global item

These are either technical, too narrow, misleading or insufficiently state-aware.

## 4. Desktop Navigation Structure

### 4.1 Utility/status strip

Optional narrow top strip used for one or two high-value current messages:

- largest current jackpot;
- result verified;
- user saved-number match;
- source or service incident;
- Responsible Play access;
- selected state.

Rules:

- maximum one rotating commercial/current message plus one utility control;
- no auto-advancing carousel that prevents reading;
- pause when motion is present;
- not the sole location of critical information;
- no “play now” pressure after a loss.

### 4.2 Main header row

Left:

- LotteryCorner logo and Home link.

Center:

- contextual global search.

Prominent action:

- Ask LotteryCorner AI.

Right:

- notifications when signed in;
- Sign in / My LotteryCorner;
- menu/help on constrained widths.

### 4.3 Primary navigation row

Navigation remains consistent across public pages.

Active state must be visible by more than color alone.

### 4.4 Context bar

Below primary navigation when a page has state/game/topic context.

Examples:

- Home › Florida › Powerball
- Home › News › Powerball › Article
- Community › Pick 3 › Systems
- Tools › Powerball › Hot and Cold

The context bar may also contain:

- Follow;
- Share;
- source/updated metadata;
- page-level Ask AI shortcut;
- state selector.

It must not become a second full navigation bar.

## 5. Mega Menu Architecture

### 5.1 Results mega menu

- Latest results
- Today’s drawings
- Powerball
- Mega Millions
- Daily games
- Results by state
- Historical results
- Check my numbers

Signed-in enhancement:

- My followed results
- My saved-number matches

### 5.2 States mega menu

- State selector/search
- State grid or alphabetical list
- Recently viewed state
- Followed state
- Multi-state games
- U.S. territories where supported

Do not list unrelated global lotteries in the primary U.S. experience.

### 5.3 Games mega menu

- National games
- Popular state games
- Daily games
- Games by draw day
- Game search
- How to play

Signed-in enhancement:

- My games

### 5.4 Jackpots mega menu

- Largest jackpots
- Powerball
- Mega Millions
- State jackpots
- Jackpot history
- Jackpot alerts
- Where to play / purchase availability

### 5.5 Tools mega menu

- Check my numbers
- Number generator
- Hot and cold
- Frequency
- Search number history
- Systems and wheels
- Tax calculator
- Odds/prize tools
- Methodology

Signed-in enhancement:

- Saved systems
- Saved number sets
- Performance history

### 5.6 News mega menu

- Latest news
- State lottery news
- Game news
- Winners
- Rules and industry
- Guides and analysis
- Blog
- Prefer LotteryCorner on Google

### 5.7 Community mega menu

- Community home
- Active discussions
- Unanswered questions
- State communities
- Game communities
- Pick 3 / Pick 4
- Systems and tools
- Draw discussions
- News discussions
- Helpful contributors
- Ask a question

## 6. Mobile Navigation

### 6.1 Mobile top app bar

Contains:

- logo;
- search icon;
- notification indicator when signed in;
- account/menu icon.

The top bar remains compact and sticky only when it does not obscure content or keyboard focus.

### 6.2 Mobile bottom navigation

Recommended five persistent destinations:

1. Home
2. Results
3. My Numbers
4. Community
5. Ask AI

Anonymous behavior:

- My Numbers opens temporary entry/save value and then offers sign-in when preservation is requested.
- Ask AI delivers one complete contextual answer.

Signed-in behavior:

- My Numbers opens saved sets and matches.
- Home becomes more personalized.
- badges show replies or matches, not promotional pressure.

### 6.3 More menu

Contains:

- States
- Games
- Jackpots
- Tools
- News
- My Games
- Following
- Insider
- Responsible Play
- Settings
- Policies/help

### 6.4 Mobile sticky conflict rule

A sticky ad, sticky purchase CTA and bottom navigation may not compete simultaneously.

Priority:

1. Safety/system controls.
2. Bottom navigation.
3. User-requested action such as save/buy.
4. Advertising.

If bottom navigation is visible, a mobile sticky ad must sit above it with safe spacing or be suppressed.

## 6.5 State-Context Precedence

State context affects results, AI answers, purchase eligibility, claim guidance, tax information, retailer lookup, notifications and personalized recommendations.

Resolve state context in this order:

1. Current page state or jurisdiction context.
2. Explicit state selected by the user in the current session.
3. Signed-in preferred or followed state.
4. Device location only after the user explicitly grants permission.
5. Manual ZIP, city or state selection.
6. Coarse IP location may be used only to suggest a state for confirmation; it must never independently determine legal purchase eligibility, claim rules, tax guidance or provider availability.

When state context remains uncertain, the interface must ask the user rather than silently choosing a jurisdiction.

---

# PART III — SEARCH AND ASK BLUEPRINT

## 7. Unified Search Entry

The search field should accept both navigation queries and questions.

Examples:

- florida pick 3
- powerball results july 22
- hot numbers
- how do I claim in Texas
- can I buy Powerball online in New York
- what are people saying about the jackpot

The interface should not force users to decide between traditional search and AI before typing.

## 8. Query Interpretation

The system classifies intent into:

1. **Navigate** — exact state, game, draw, page or member.
2. **Answer** — question with a canonical answer.
3. **Explore** — broad topic, history or analysis.
4. **Community** — find discussions or people.
5. **Personal** — my numbers, saved games, replies.
6. **Purchase** — availability, cutoff or provider.
7. **High consequence** — claim, tax, anonymity, fraud or responsible play.

## 9. Search Results Presentation

Recommended grouped order:

1. Direct answer or best destination.
2. Results/games/states.
3. Guides/tools.
4. News/blog.
5. Community.
6. Ask LotteryCorner AI.

When an exact canonical result exists, it should not be buried under AI prose.

## 10. Ask LotteryCorner AI Entry

### 10.1 Global entry

The global AI action opens an overlay or dedicated panel.

When page context exists, suggested prompts are contextual.

When context is absent, ask for the minimum needed:

- state;
- game;
- date;
- user’s actual question.

### 10.2 First-answer rule

Anonymous visitors receive:

- one complete answer;
- source/data basis;
- one best next action;
- up to two additional paths.

Only after value is delivered may the experience ask the user to sign in for:

- continued conversation;
- memory;
- saving;
- alerts;
- history;
- cross-device access.

### 10.3 Page-context prompt examples

Result page:

- Explain this draw.
- Did these numbers appear before?
- Check my numbers.
- What are people discussing?

State page:

- What changed in this state?
- Can I buy tickets online here?
- How do claims work?
- Which games draw tonight?

News article:

- Give me the quick take.
- Why does this matter?
- What changed since this article?
- Show related history.

Statistics tool:

- Explain this chart.
- Generate sets using these filters.
- Compare two periods.
- Save this method.

Forum:

- Research the factual part.
- Summarize the discussion.
- Show related rules or history.

### 10.4 AI visual identity

Use one consistent non-human product identity:

- LotteryCorner AI for interactive help.
- LotteryCorner Research Note for factual forum contributions.
- AI Quick Take for summaries.
- Draw Insight for result observations.

Do not create synthetic member avatars.

### 10.5 AI-everywhere compliance rule

The global AI entry is one access point, not the complete AI strategy. A page-family blueprint cannot claim AI compliance merely because it includes this trigger or a single page-level AI module. Every section must record one of the following in its Section Intelligence Matrix:

- deterministic intelligence;
- generative AI explanation or synthesis;
- curated editorial context;
- an interesting fact;
- a contextual next action;
- or a documented decision that no intelligence layer would add value.

---

# PART IV — USER-STATE SHELLS

## 11. Anonymous Shell

The anonymous shell offers:

- complete public information;
- global search;
- AI trial;
- temporary number entry;
- public tools;
- public community reading;
- qualified purchase options;
- guest progress where practical.

Registration prompts must state exactly what will be preserved.

## 12. Guest Progress Shell

Temporary guest state may preserve locally or within a short-lived session:

- selected state;
- recently viewed games;
- entered number sets;
- generated sets;
- unfinished tool configuration;
- one AI context.

Requirements:

- explain temporary nature;
- allow clear/reset;
- do not imply cloud backup;
- do not retain sensitive context indefinitely.

## 13. Signed-In Shell

Adds:

- notification indicator;
- My Games;
- My Numbers;
- Matches;
- Following;
- saved AI context;
- personalized “What changed”;
- fewer repeated registration/install prompts.

Core facts and navigation stay in the same places.

## 14. Insider Shell

Insider is a richer signed-in mode, not a separate website.

Potential shell enhancements:

- personal dashboard home;
- advanced tools;
- saved systems;
- match history;
- AI memory;
- personal timeline;
- personalized digest;
- Insider-specific ad/offer placements.

Insider remains ad-supported unless a future approved premium tier says otherwise.

## 15. Contributor and Moderator Shells

Contributor additions:

- Ask/Post;
- drafts;
- followed topics;
- reputation/activity;
- moderation status.

Moderator/editor/operator controls must be clearly separated from ordinary user actions and unavailable in public markup.

## 16. High-Protection Shell

Activated for:

- winner/claim workflows;
- responsible-play/help;
- spending concern;
- legal/tax disputes;
- ticket privacy;
- fraud reports.

Effects:

- suppress affiliate purchase;
- suppress promotional notifications;
- reduce or remove ads;
- restrict AI to source-first assistance;
- emphasize human/official help;
- preserve privacy.

---

# PART V — VISUAL SYSTEM DIRECTION

## 17. Recommended Visual Personality

LotteryCorner should feel:

- trustworthy;
- current;
- energetic without casino excess;
- understandable to non-technical players;
- visually intelligent;
- mobile-first;
- community-friendly.

Avoid:

- black-and-gold casino luxury;
- neon gambling aesthetics;
- excessive spinning/animation;
- dense enterprise dashboards on public pages;
- AI sci-fi imagery;
- generic chatbot gradients everywhere.

## 18. Provisional Semantic Color Tokens

Final values may be adjusted to fit the current logo and design system, but semantic roles should remain stable.

| Token | Proposed use | Reference value |
|---|---|---|
| Brand Navy | header, authority, footer | `#0B1F3A` |
| Action Blue | links, primary actions | `#1F5EFF` |
| AI Teal | AI entries and AI assistance | `#00A7A5` |
| Jackpot Gold | jackpot emphasis, selected facts | `#F4B400` |
| Success Green | verified match/saved success | `#138A5B` |
| Alert Red | correction/error/high consequence | `#C73A3A` |
| Surface | cards | `#FFFFFF` |
| Page Background | page canvas | `#F5F7FA` |
| Primary Text | body/headings | `#172033` |
| Secondary Text | supporting metadata | `#48566A` |

Color must never be the sole signal.

## 19. Typography Direction

Requirements:

- highly legible sans-serif;
- clear number rendering;
- tabular numerals for results, jackpots and dates;
- minimum comfortable mobile body size;
- avoid thin weights;
- progressive disclosure for advanced analysis.

Recommended type approach:

- system or high-performance web sans-serif;
- bold display for jackpots/results;
- normal human-readable body text;
- compact metadata.

Final font choice belongs to the visual design system.

## 20. Grid and Container

Proposed foundation:

- Desktop maximum content width: approximately 1280 px.
- Desktop main grid: 12 columns.
- Tablet: 8 columns.
- Mobile: 4 columns.
- Main content plus optional contextual rail on wide screens.
- Important sections use full content width when tables/numbers require it.
- No horizontal scrolling for ordinary content.
- Data tables may use controlled horizontal scrolling with visible affordance.

## 21. Spacing and Density

- Core result sections are compact and high-priority.
- AI and insight sections use clear visual identity but do not dominate.
- Long editorial/community pages can use higher information density.
- Mobile cards should avoid excessive nested cards.
- Ads require reserved dimensions to avoid layout shift.

---

# PART VI — GLOBAL SHELL VISUALS

## 22. Desktop Anonymous Reference

![Desktop anonymous shell](bp02-desktop-anonymous.svg)

### Interpretation

- Utility and primary navigation are stable.
- Search and AI are both visible.
- The primary page task appears before AI, ads and engagement.
- AI is prominently demonstrated after the immediate answer.
- Context rail creates continuation without crowding the main content.
- Ads and affiliate modules appear only after value.
- Interesting Fact, Community Pulse and Next Action are reusable section patterns.

## 23. Desktop Signed-In / Insider Reference

![Desktop signed-in shell](bp02-desktop-signed-in.svg)

Signed-in changes are additive:

- saved matches;
- followed context;
- notifications;
- personal AI;
- My LotteryCorner navigation;
- relevant purchase options;
- personal/community return modules.

## 24. Mobile Anonymous Reference

![Mobile anonymous shell](bp02-mobile-anonymous.svg)

Mobile ordering:

1. identity/navigation;
2. current context;
3. immediate task;
4. contextual AI;
5. monetization if allowed;
6. intelligence/community;
7. next action;
8. persistent bottom navigation.

## 25. Mobile Signed-In Reference

![Mobile signed-in shell](bp02-mobile-signed-in.svg)

The mobile signed-in experience prioritizes:

- personal match status;
- personal AI;
- next draw;
- following/community;
- eligible purchase or Insider monetization.

## 26. Reusable Section Visual Anatomy

![Section library anatomy](bp02-section-library.svg)

---

# PART VII — GLOBAL SHELL COMPONENT SPECIFICATIONS

## 27. GS-01 — Utility Status Strip

**Purpose:** Surface one or two high-value current messages.

**Anatomy:**

- status/message;
- optional state selector;
- optional Responsible Play link;
- optional dismiss/pause.

**Intelligence:**

- largest jackpot;
- result verification;
- user match;
- service/correction notice.

**Rules:**

- no more than two simultaneous messages;
- no unrequested rapid rotation;
- must not contain the only version of a critical notice;
- never use loss-based purchase pressure.

**Anonymous:** general status.  
**Signed-in:** personal match/reply may replace general message.  
**Ads:** prohibited.  
**Lifecycle:** event-driven; automatic expiry.  
**Accessibility:** pause motion; screen-reader announcement only for genuinely important updates.

## 28. GS-02 — Main Header

**Purpose:** Identity, search, AI, account.

**Required elements:**

- logo/Home;
- search;
- Ask LotteryCorner AI;
- account/sign-in;
- notifications when signed in.

**Desktop:** single row.  
**Mobile:** logo, search, notifications/account. AI moves to bottom nav and page context.

**Failure behavior:** Search and AI may degrade independently without hiding navigation.

## 29. GS-03 — Primary Navigation

**Purpose:** Reach major user-intent families.

**Labels:** Results, States, Games, Jackpots, Tools, News, Community.

**Rules:**

- same order across public pages;
- active state visible by text/shape and color;
- keyboard navigable;
- mega menus open by explicit activation, not hover alone;
- escape closes menu;
- focus returns to trigger.

## 30. GS-04 — Context Bar / Breadcrumb

**Purpose:** Orientation inside the nonlinear graph.

**Content:**

- user-path breadcrumb;
- state/game/date;
- optional follow/share/source actions.

**SEO:** BreadcrumbList may project the typical user hierarchy rather than merely copying URL segments.

**Mobile:** horizontally compact; collapse secondary actions.

## 31. GS-05 — Global Search

**Purpose:** Find and answer.

**States:**

- empty;
- suggestions;
- exact match;
- grouped results;
- no result;
- high-consequence;
- AI handoff;
- offline/error.

**Operations:** State/game/entity index updated with canonical content changes.

## 32. GS-06 — Global AI Trigger

**Purpose:** Make AI a visible USP.

**Rules:**

- contextual prompt when possible;
- distinct AI visual identity;
- one full anonymous answer;
- no sign-in gate before first value;
- safe restricted behavior for high-consequence context.

**Measurement:** AI discovery, first-answer completion, continuation and sign-in after delivered value.

## 33. GS-07 — Account / My LotteryCorner

**Anonymous:** Sign in, create account and benefits.  
**Signed-in:** My Games, My Numbers, Matches, Following, Notifications, AI history, Settings.  
**Insider:** advanced systems, timeline, personalized AI.

**Security:** account/menu state must not be cached into public pages.

## 34. GS-08 — Notification Indicator

**Purpose:** Signal valuable new events.

Badge may count:

- saved matches;
- replies/mentions;
- requested AI research completion;
- important followed updates.

Badge must not count generic marketing.

## 35. GS-09 — Mobile Bottom Navigation

**Items:** Home, Results, My Numbers, Community, Ask AI.

**Requirements:**

- target size ideally at least 44×44 CSS px;
- selected state visible;
- labels remain visible;
- safe-area support;
- no overlap with sticky ads or purchase bars;
- keyboard/screen-reader order matches visual order.

## 36. GS-10 — Footer

Required clusters:

- Results and games;
- States;
- Tools;
- News/blog;
- Community;
- My LotteryCorner;
- About/methodology/corrections;
- AI policy;
- affiliate/ad policy;
- privacy/terms/cookies/accessibility;
- Responsible Play;
- contact/support;
- app/social/email;
- Google Preferred Sources where relevant.

Footer should support discovery but not reproduce the entire site map.

## 37. GS-11 — Global Message Banner

Types:

- correction;
- source delay;
- maintenance;
- legal/purchase availability change;
- app update;
- consent/privacy.

Severity determines color, position and dismissibility.

Correction banners are not ads and may not be dismissed permanently if the current page is materially affected.

## 38. GS-12 — Consent and Preference Layer

Controls:

- necessary cookies;
- analytics;
- personalization;
- advertising where required;
- AI memory;
- push/email;
- location sharing;
- responsible-play marketing suppression.

Consent must not use dark patterns.

## 39. GS-13 — Ad Rail / Ad Anchors

Global shell provides named anchors, not automatic inventory.

Examples:

- `AD-HEADER-AFTER-UTILITY`
- `AD-MAIN-AFTER-CORE`
- `AD-DESKTOP-RAIL`
- `AD-IN-CONTENT`
- `AD-MOBILE-STICKY`
- `AD-FOOTER`

Each page blueprint activates or suppresses anchors based on ad tier.

## 40. GS-14 — Affiliate Action Bar

On eligible high-intent surfaces—Game, Jackpot, Next Draw, Number Generator, Saved Numbers and Purchase Guide—a **Buy Online**, **Where to Play** or equivalent qualified purchase action is required unless a documented eligibility, safety or user-intent reason suppresses it.

It appears only when:

- purchase intent is high or naturally supported by the completed task;
- state/game/provider eligibility is known;
- disclosure can be shown;
- current task is complete;
- safety suppression does not apply.

The blueprint must record the reason whenever a high-intent surface does not expose a purchase or Where to Play path.

Mobile may use a sticky purchase bar only if it does not conflict with bottom navigation, ads or urgent content.

## 41. GS-15 — Responsible Play Access

Persistent footer link plus contextual access in:

- purchase;
- account;
- notifications;
- systems;
- AI;
- community.

High-protection mode elevates it and suppresses commerce.

---

# PART VIII — SECTION LIBRARY CONTRACT

## 42. Universal Section Anatomy

Every reusable section has:

1. Section identity.
2. Immediate user job.
3. Primary content.
4. Data/source classification.
5. Optional intelligence.
6. Optional interesting fact.
7. One primary next action.
8. Up to three secondary actions.
9. Anonymous/signed-in behavior.
10. monetization decision.
11. lifecycle/degraded states.
12. mobile behavior.
13. accessibility.
14. behind-the-screen metadata responsibility.
15. measurement.

## 43. Universal Section States

Every dynamic section supports applicable states:

- loading;
- fresh;
- stale;
- pending verification;
- unavailable;
- incomplete;
- conflicting;
- corrected;
- archived;
- empty;
- restricted;
- personalized;
- anonymous fallback;
- error.

A section must never silently show stale dynamic data as current.

## 44. Section Header Pattern

Contains:

- clear heading;
- optional one-line context;
- optional data period/effective date;
- optional compact action.

Do not place multiple competing CTA buttons in the heading.

## 45. Section Footer Pattern

May contain:

- source/updated;
- method;
- correction/report;
- one best continuation;
- disclosure.

It must not become a repetitive disclaimer block.

---

# PART IX — HIGH-PRIORITY REUSABLE SECTIONS

## 46. SL-U01 — Page Identity Header

**Used by:** all pages.

**Anatomy:**

- H1 or visible primary identity;
- state/game/date/topic;
- lifecycle/status;
- primary utility action;
- follow/save;
- compact AI prompt where useful.

**SEO:** H1 and title intent align but need not be identical.  
**Schema:** identifies primary entity/page type.  
**Ads:** none inside header.  
**Mobile:** subject and immediate action first; metadata collapses.

## 47. SL-U02 — Latest Result Card

**Primary job:** Show winning numbers and status.

**Required content:**

- game;
- state/variant;
- exact draw date/time;
- winning values;
- add-on values;
- status;
- stable draw link.

**Optional signed-in content:**

- saved-set matches;
- check my numbers.

**Intelligence:** only after numbers.  
**Ads:** prohibited inside.  
**Operations:** event-driven update, verification and correction propagation.  
**Metadata:** visible/server-rendered core facts; stable entity links.

## 48. SL-U03 — Multi-Game Results Grid

**Used by:** Home, State, Results collection.

**Rules:**

- prioritize favorites for signed-in users without hiding other games;
- maintain explicit game/variant/date labels;
- avoid logo-only identification;
- each card is independently linkable.

**AI:** optional summary above/below grid, not generated text in every card.

## 49. SL-U04 — Jackpot Card

**Content:**

- game;
- jackpot;
- cash option where available;
- next drawing;
- status;
- follow;
- purchase eligibility.

**Interesting fact:** prior similar jackpot or growth context.  
**Commerce:** contextual; state selector required.  
**Ads:** no ad styled as jackpot card.

## 50. SL-U05 — Next Draw and Schedule

**Content:**

- exact date;
- time;
- timezone;
- draw variant;
- cutoff if verified;
- reminder;
- delay/cancel status.

**Signed-in:** personalized reminder state.  
**Operations:** schedule source monitoring and rule-version dependency.

## 51. SL-U06 — Prize and Match Explanation

**Purpose:** Explain what matches mean.

**Deterministic first:** prize table/rules.  
**AI:** plain-language explanation.  
**High consequence:** avoid declaring a win if input/result is uncertain.  
**Next action:** official claim guide or saved-number check.

## 52. SL-U07 — History Collection

**Features:**

- bounded date/period navigation;
- stable draw links;
- accessible table/list;
- coverage statement;
- filter state.

**AI:** ask about selected period.  
**SEO:** crawlable bounded pages; avoid infinite-scroll-only history.

## 53. SL-U08 — Stable Draw Record

**Purpose:** Permanent citable record.

**Required:**

- draw identity;
- result;
- status/correction;
- applicable rule version;
- source;
- previous/next;
- related discussion/news.

**Commerce:** no automatic purchase push from old history.

## 54. SL-U09 — Claim Summary

**Purpose:** Calm high-consequence action.

**Content:**

- threshold/method;
- deadline;
- destination;
- official source;
- effective date.

**AI:** restricted source-based explanation.  
**Ads/affiliate:** suppressed.

## 55. SL-U10 — Tax / Anonymity Summary

**Purpose:** Scope and direct answer.

**Requirements:**

- state/federal distinction;
- assumptions;
- effective date;
- calculator/guide;
- professional-advice limitation.

**Commerce:** suppressed.

## 56. SL-U11 — Purchase Eligibility Result

**Purpose:** Answer “Can I buy this online here?”

**Content:**

- state/location;
- game;
- option classification;
- provider;
- cutoff;
- age/geolocation;
- fees/material terms;
- last verification;
- disclosure;
- fallback retailer option.

**AI:** explains eligibility but deterministic rules decide.  
**Operations:** daily/event-based monitoring; suppress stale provider data.

**State context:** must follow the approved State-Context Precedence. IP-derived location alone cannot authorize or present a legal purchase option as available.

## 57. SL-U12 — Retailer / Claim Center Locator

**Purpose:** Find real-world destination.

**Content:**

- search;
- distance;
- capability;
- status;
- directions;
- source.

**Accessibility:** list alternative to map.  
**Location:** explicit permission and manual city/ZIP alternative.

## 58. SL-U13 — Scratcher Snapshot

**Content:**

- ticket;
- price;
- status;
- top prizes remaining;
- odds;
- snapshot time;
- caveat.

**Intelligence:** comparison or explanation, not guaranteed strategy.

## 59. SL-U14 — Unclaimed Prize Card

**Content:**

- prize/game/draw;
- deadline;
- status;
- location where published;
- source;
- reminder.

**Commerce:** suppressed.

## 60. SL-U15 — Calculator Output

**Purpose:** Return result before registration or ads.

**Content:**

- calculated result;
- assumptions;
- inputs;
- effective date;
- explanation;
- save/share.

**Ads:** after output.  
**AI:** explain or compare scenarios.

---

# PART X — INTELLIGENCE SECTION BLUEPRINTS

## 61. SL-I01 — LotteryCorner AI Trial

**Role:** Primary public AI demonstration.

**Anatomy:**

- contextual heading;
- suggested question;
- input;
- Ask button;
- one complete answer;
- sources/data;
- next actions;
- sign-in continuity prompt after value.

**Visual:** AI Teal, not a full-screen interruption.  
**Failure:** hide empty shell or offer deterministic alternatives.  
**Metrics:** impression, trial, answer completion, usefulness, continuation, sign-in.

## 62. SL-I02 — AI Quick Take

**Purpose:** Short summary or interpretation.

**Initial length:** brief, expandable.  
**Must identify:** AI assistance and source basis where material.  
**Used on:** news, blog, result, game, rule change.  
**Avoid:** repeating the visible headline or result.

## 63. SL-I03 — What This Means

May be:

- deterministic;
- editorial;
- AI-assisted.

It answers significance in plain language.

Best next action must be directly related.

## 64. SL-I04 — Interesting Fact

**Criteria:**

- true;
- relevant;
- evidence-linked;
- understandable;
- not a prediction;
- not a trivial restatement.

**Anatomy:**

- fact;
- one-sentence meaning;
- Explore action.

## 65. SL-I05 — Historical Match

**Deterministic calculation.**

Shows:

- exact/partial match;
- prior date;
- context;
- stable draw link;
- explicit historical framing.

No “due,” “repeat likely” or probability implication.

## 66. SL-I06 — Draw Pattern Insight

Possible outputs:

- odd/even;
- high/low;
- sum;
- consecutive numbers;
- repeated previous-draw values;
- selected-period frequency.

Calculation provenance must be available.

## 67. SL-I07 — What Changed

Anonymous:

- major public changes since a defined period.

Signed-in:

- followed games/states;
- saved matches;
- replies;
- personal tool changes.

Must state the comparison period.

## 68. SL-I08 — Community Pulse

Shows real activity:

- active related threads;
- unanswered questions;
- viewpoints;
- participation count.

AI summary must not create fake consensus.

## 69. SL-I09 — Thread Summary

Only after meaningful human participation.

Must preserve:

- major viewpoints;
- disagreement;
- factual resolution;
- unresolved items;
- key links.

## 70. SL-I10 — AI Research Note

Used in eligible factual threads.

Must show:

- LotteryCorner Research identity;
- concise answer;
- sources checked;
- uncertainty;
- invitation to human experience.

It is visually distinct from member replies.

## 71. SL-I11 — Related Question

May show:

- real community question;
- common search question;
- generated suggested question.

Generated questions must not say or imply that a member asked them.

## 72. SL-I12 — Personalized Insight

Examples:

- “Two of your saved sets were checked.”
- “A game you follow changed its draw schedule.”
- “The thread you follow has a new answer.”

No vulnerability-based personalization.

## 73. SL-I13 — Eligibility Explanation

Supports Purchase Eligibility Result.

Explains:

- why the option is available/unavailable;
- official versus courier;
- state and location dependency;
- cutoff.

## 74. SL-I14 — AI Confidence / Source Detail

Expandable detail, not always visible.

Contains:

- data/source;
- time;
- calculation/generation class;
- uncertainty;
- report/correction.

---

# PART XI — MOMENTUM AND EXPLORATION SECTIONS

## 75. SL-M01 — Primary Next Action

One action only.

Selection priority:

1. complete immediate task;
2. understand;
3. explore;
4. personal investment;
5. community;
6. commerce.

Commerce may outrank other classes only when the current intent is explicitly transactional.

## 76. SL-M02 — Explore More Rail

Up to three relevant secondary links.

Avoid:

- generic “recommended for you” without reason;
- duplicate links already shown;
- circular navigation.

## 77. SL-M03 — Related History

Relevance signals:

- same game/state;
- related numbers;
- same jackpot context;
- rule era;
- article topic.

## 78. SL-M04 — Related News

Must be:

- relevant;
- fresh enough;
- clearly dated;
- not duplicate/current-fact owner.

## 79. SL-M05 — Related Guides

Claims, rules, how-to, tax, anonymity, purchase.

## 80. SL-M06 — Related Tools

Only tools that can act on the current context.

Example:

Powerball result → hot/cold, number history, generator.

## 81. SL-M07 — Related Community

Prioritize:

- exact draw/game/state;
- real activity;
- unanswered relevant question;
- followed context.

## 82. SL-M08 — Next Draw Continuation

Contains:

- next draw;
- follow/reminder;
- generation/save;
- purchase eligibility.

Do not use “try again” after a loss.

On eligible Game, Jackpot, Next Draw, Generator and Saved Numbers surfaces, this section must include a qualified purchase or Where to Play action unless the Section Intelligence Matrix records a valid suppression reason.

## 83. SL-M09 — Return Trigger Offer

Possible actions:

- follow;
- notify;
- email;
- app;
- Google Preferred Source.

Only after value.

## 84. SL-M10 — Shareable Object

Share target must be a stable contextual page, not a transient modal.

Share preview must not expose private saved numbers unless explicitly approved.

---

# PART XII — PERSONAL INVESTMENT SECTIONS

## 85. SL-P01 — Save Number Set

Supports:

- temporary guest save;
- permanent account save;
- name;
- game;
- method;
- notes;
- privacy.

Registration copy must explain future checking value.

## 86. SL-P02 — Generate Numbers

Methods:

- random;
- fixed-number inclusion;
- hot/cold mix;
- odd/even;
- high/low;
- range/sum;
- wheels/systems;
- natural-language AI configuration.

Always state method and non-predictive boundary.

## 87. SL-P03 — Follow Game / State

User chooses events and channels.

No automatic promotional alert bundle.

## 88. SL-P04 — Follow Thread / Member

Explains what notifications will be sent.

## 89. SL-P05 — Match History

Exact outcomes only.

Avoid near-miss celebration and purchase pressure.

## 90. SL-P06 — Personal Timeline

Combines meaningful activity without becoming surveillance.

Users can remove items and control memory.

## 91. SL-P07 — Registration Value Prompt

Examples:

- Save these number sets and check them after every draw.
- Follow this question and get notified when people answer.
- Continue this AI conversation across devices.

Avoid generic “Create an account for more.”

## 92. SL-P08 — App Install Prompt

Only after:

- save;
- follow;
- alert;
- scanning interest;
- repeat use.

## 93. SL-P09 — Notification Preference Control

User-controlled:

- event;
- channel;
- timing;
- threshold;
- quiet hours;
- pause/disable.

## 94. SL-P10 — Google Preferred Source Prompt

Best placements:

- News home;
- article footer after reading;
- email;
- Insider news preferences.

Do not promise ranking.

---

# PART XIII — COMMUNITY SECTION BLUEPRINTS

## 95. SL-C01 — Community Hub Header

Contains:

- scope;
- active topics;
- follow;
- ask;
- rules/help.

## 96. SL-C02 — Active Discussions

Rank by relevance, quality, human activity and recency.

Do not rank solely by synthetic or raw reply volume.

## 97. SL-C03 — Unanswered Questions

A visible community contribution opportunity.

AI response policy depends on thread tier.

## 98. SL-C04 — Ask a Question

Pre-post assistance:

- topic/state/game;
- similar threads;
- title clarity;
- factual context.

AI does not silently rewrite the user’s voice.

## 99. SL-C05 — Human Replies

Human replies are visually primary.

Controls:

- reply;
- quote;
- helpful;
- report;
- block;
- follow.

## 100. SL-C06 — Contributor Identity

Shows:

- name/avatar;
- relevant participation;
- specialist context;
- helpfulness.

Avoid official-looking badges unless the role is genuinely verified.

## 101. SL-C07 — Reputation Signal

Reward:

- helpful answers;
- corrections;
- source quality;
- newcomer support;
- sustained participation.

Do not sell reputation.

## 102. SL-C08 — Draw Reaction

Tied to a canonical draw.

Supports quick discussion without fragmenting facts.

## 103. SL-C09 — Community Correction Banner

Shows current fact over old discussion while preserving history.

## 104. SL-C10 — Moderation / Report

Accessible and understandable.

Serious actions remain human-reviewed.

---

# PART XIV — EDITORIAL SECTION BLUEPRINTS

## 105. SL-E01 — Article Header

Contains headline, author, dates, classification and related entities.

## 106. SL-E02 — Article Summary

Human or AI-assisted with editorial ownership.

## 107. SL-E03 — Why It Matters

Plain player-oriented significance.

## 108. SL-E04 — Current Fact Card

Current canonical fact remains updated independently from article age.

## 109. SL-E05 — Timeline

Useful for rule changes, jackpots, lawsuits and game launches.

## 110. SL-E06 — Historical Context

Connects current story to stable history.

## 111. SL-E07 — Community Reaction

Links or summarizes real participation.

## 112. SL-E08 — Article Discussion

Durable thread associated with article/topic.

## 113. SL-E09 — Update / Correction Note

Visible when meaning changes materially.

## 114. SL-E10 — Author / Contributor

Supports accountability and related work.

---

# PART XV — COMMERCE AND ADVERTISING SECTIONS

## 115. SL-X01 — Official Purchase Option

Used only when an official state service exists.

## 116. SL-X02 — Affiliate Courier Option

Must state:

- independent provider;
- user eligibility;
- LotteryCorner compensation;
- last verification;
- material terms.

## 117. SL-X03 — Retail Purchase Option

Provides retailer route and cutoff.

## 118. SL-X04 — Purchase Comparison

May compare official, courier, subscription and retail options.

Commission must not silently control ordering.

## 119. SL-X05 — Generated Number Handoff

Shows numbers before outbound click and explains what transfers.

## 120. SL-X06 — Post-Click Return Setup

Offer:

- save;
- follow;
- result notification.

## 121. SL-X07 — Contextual Affiliate Disclosure

Required close to CTA:

> LotteryCorner may earn a commission if you use this link.

The exact wording may be reviewed legally, but it must communicate compensation plainly.

## 122. SL-A01 to SL-A07 — Ad System

### Utility ad

After urgent answer.

### Editorial in-content ad

Between meaningful article blocks, with reserved layout.

### Community ad

Clearly separated from posts.

### Tool completion ad

After output.

### Insider ad

Allowed unless premium/suppression applies.

### Sticky ad

Must not obstruct bottom navigation, inputs, numbers or safety.

### Prohibited experiences

- pop-up on arrival;
- countdown prestitial;
- autoplay sound;
- deceptive close;
- result-like creative;
- unreserved layout shift;
- excessive mobile density.

---

# PART XVI — TRUST AND SAFETY SECTIONS

## 123. SL-T01 — Source / Verification

Compact display:

- Source checked
- Result verified
- Last updated
- Report an issue

“Official” is used only where the distinction matters.

## 124. SL-T02 — Independent Publisher

Appears in About, purchase and high-consequence contexts, not as repetitive page noise.

## 125. SL-T03 — AI Disclosure

Material AI roles are clearly identified.

## 126. SL-T04 — Correction Notice

Shows:

- what changed;
- when;
- impact;
- corrected source.

## 127. SL-T05 — Responsible Play

Persistent access plus contextual elevation.

## 128. SL-T06 — High-Protection Mode

Suppresses monetization and limits AI.

## 129. SL-T07 — Privacy / Memory Control

Used near:

- personal AI;
- saved numbers;
- ticket images;
- location;
- notifications.

## 130. SL-T08 — Community Safety

Rules, report, block, appeal and identity protection.

---

# PART XVII — MANDATORY SECTION INTELLIGENCE MATRIX

## 131. Shell-Level Matrix

| Section | Immediate job | Source/owner | Update method | State context | Deterministic intelligence | AI role | Interesting fact | Primary next action | Signed-in change | Affiliate | Ad tier | Expiry/stale |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Utility strip | Current status | Results/jackpot/events | Event-driven | Selected/page state where relevant | Priority/ranking | Short explanation only | Optional jackpot milestone | Open exact context | Personal match/reply | Conditional | 0 | Event expiry |
| Main header | Navigate/search | Product configuration | Release-managed | Selected state indicator | Context state | AI trigger | N/A | Search/Ask | Notifications/account | No | 0 | Versioned |
| Primary nav | Reach page families | IA owner | Release-managed | N/A | Active context | None | N/A | Selected destination | My items appear separately | No | 0 | Versioned |
| Context bar | Orient page | Canonical page object | Per request | Primary source of state context | Breadcrumb/context | Suggested question | Optional | Follow/open parent | Follow state | No | 0 | Page lifecycle |
| Search | Find/answer | Search/entity index | Continuous | Explicit state resolution when needed | Exact entity matching | Answer/handoff | N/A | Best result | Personal results | Purchase query only | 0 | Index freshness |
| AI entry | Try AI | AI product + page context | Dynamic | Page/selected/confirmed state | Context prompt rules | Core | Relevant suggested question | Open page/tool/action | Memory and saved context | Contextual | 0 | Page/event |
| Account | Personal continuity | Identity/account | Real time | Preferred/followed state | badges/counts | Personal assistant link | N/A | My LotteryCorner | Full personal menu | Contextual | 0 | Real time |
| Footer | Trust/discovery | IA/policy owner | Release/editorial | N/A | N/A | AI policy link | N/A | Major support path | Account controls | Disclosure links | 0 | Policy lifecycle |
| Ad anchors | Revenue | Monetization | Config/real time | Page context only | Page tier | None | N/A | Advertiser action | Frequency control | N/A | by page | Campaign |
| Affiliate bar | Buy eligibility | Commerce rules | Daily/event | Mandatory confirmed state | Eligibility | Explanation | N/A | Qualified outbound | Saved-number continuity | Core | 1 | Verification threshold |
| Responsible play | Help/control | Safety owner | Policy-managed | Jurisdiction-specific help where relevant | Suppression rules | Restricted | N/A | Help/control | Marketing suppression | Prohibited | 0 | Policy lifecycle |

## 132. Section Matrix Requirement for Future Blueprints

Every future page blueprint must copy this matrix structure and include one row for every section, including “not applicable” decisions.

---

# PART XVIII — CONTENT OPERATIONS CONTRACT

## 133. Global Operational Owners

| Capability | Primary owner | Supporting owner |
|---|---|---|
| Navigation/IA | Product | SEO, UX |
| Search/entity discovery | Search/Product | Content, Engineering |
| AI prompts and responses | AI Product | Data, Editorial, Trust |
| Result/jackpot status | Lottery Data Operations | Source Verification |
| Community activity | Community Operations | Trust & Safety |
| News/editorial | Editorial | SEO, AI |
| Purchase eligibility | Affiliate/Commerce Operations | Legal/compliance |
| Advertising | Monetization | UX, Performance |
| Notifications/email | Lifecycle Product | Data, Trust |
| Policies/corrections | Trust/Editorial | Legal |
| Accessibility | Product/Design | Engineering, QA |

## 134. Shell Update Frequencies

| Element | Update pattern | Stale behavior |
|---|---|---|
| Result status | Event-driven | show pending/delayed |
| Jackpot strip | source/event-driven | suppress or mark stale |
| Saved-match badge | after verified result | pending until verified |
| Community pulse | near real time/hourly | show last activity time |
| News links | publication event | retain dated content |
| Affiliate eligibility | daily + event alert | suppress when threshold exceeded |
| Preferred Source prompt | static/configured | remove if no longer eligible |
| AI suggested prompts | page/event/configuration | deterministic fallback |
| Policies | editorial/legal | visible effective date |

## 135. Correction Propagation

A material correction must update as applicable:

- visible content;
- result cards;
- stable draw;
- page AI insights;
- saved-number checks;
- notifications/app inbox;
- community current-fact banner;
- article fact cards;
- metadata/schema;
- sitemap `lastmod`;
- cached AI answers;
- internal recommendation graph.

---

# PART XIX — BEHIND-THE-SCREEN CONTRACT

## 136. Global HTML and Landmark Contract

Required landmarks:

- `header`
- primary `nav`
- optional contextual `nav`
- `main`
- complementary rail where present
- `footer`

Required:

- skip-to-main link;
- one clear page H1;
- logical heading order;
- crawlable anchor links for navigation;
- no JavaScript-only critical navigation;
- server-visible core page identity and utility.

## 137. Search Identity Contract

Every page blueprint later specifies:

- title;
- meta description;
- canonical;
- index/noindex;
- alternate/duplicate handling;
- filtered/paginated behavior;
- removal/redirect/archive behavior.

Global shell must not generate conflicting titles or duplicate H1s.

## 138. Social Metadata Contract

Shared defaults:

- `og:site_name`
- default image fallback;
- page-specific Open Graph title/description/image/type;
- X/Twitter card metadata;
- share-image safe areas;
- no private saved-number content in previews;
- corrected/stale pages update previews when material.

## 139. Structured Data Contract

Global-level candidates:

- Organization;
- WebSite;
- BreadcrumbList on eligible pages.

Page-level types are selected in individual blueprints based on visible purpose and current search eligibility.

Rules:

- structured data reflects visible content;
- no fake FAQ or review markup;
- canonical entity URLs;
- correction/update propagation;
- server-rendered JSON-LD preferred for critical metadata.

## 140. Crawler and AI Discovery Contract

Public shell navigation and core content must be available to permitted crawlers.

Private areas must not expose:

- saved numbers;
- ticket images;
- AI memory;
- personal timelines;
- account activity;
- pool information.

AI discovery readiness requires:

- concise visible answers;
- stable entity identity;
- source/effective dates;
- linkable sections;
- current fact ownership;
- distinction among fact, AI, editorial, community and commercial content.

## 141. Sitemap and Internal Linking

The global shell contributes internal links to:

- major page-family homes;
- states;
- national games;
- news;
- community;
- tools;
- policies.

It must not place every dynamic URL in the footer.

Meaningful `lastmod` is controlled by page content, not shell deployment.

## 142. Preferred Sources

News/editorial surfaces may use Google’s publisher-supported preferred-source invitation.

The shell should not show the prompt on every page.

---

# PART XX — ACCESSIBILITY AND RESPONSIVE CONTRACT

## 142.1 Public Language Contract

All shared shell labels, prompts, messages, disclosures and AI invitations must:

- use ordinary U.S. lottery terminology;
- prefer short familiar labels;
- state exact dates when `today`, `tonight` or `last night` may be ambiguous;
- avoid software, architecture, analytics and corporate terminology;
- avoid prediction claims and casino-style urgency;
- explain official, independent, affiliate, AI and community roles only where the distinction matters;
- remain understandable to users with limited technical confidence.

Navigation and account terminology must be validated during page-family visual reviews, especially `Community`/`Forums`, `My LotteryCorner`/`Insider`, and long/short AI labels.

## 143. Accessibility Target

Target WCAG 2.2 AA.

Global requirements:

- keyboard access;
- visible focus;
- focus not obscured by sticky elements;
- consistent navigation;
- accessible authentication;
- minimum pointer target requirements;
- clear labels;
- status announcements;
- reduced motion;
- contrast;
- zoom/reflow;
- accessible tables and dialogs.

Recommended interactive target is at least 44×44 CSS px where practical; never below WCAG minimum without sufficient spacing/equivalent control.

## 144. Navigation Accessibility

- Mega menus operate by button.
- `aria-expanded` and `aria-controls` reflect state.
- Escape closes.
- focus returns to trigger.
- no hover-only content.
- bottom navigation has text labels.
- account and notification badges have meaningful accessible names.

## 145. AI Accessibility

- answer streaming must not continuously overwhelm screen readers;
- provide “answer complete” status;
- allow stop generation;
- sources and actions are keyboard reachable;
- generated content uses semantic headings/lists/tables;
- error/restriction states are plain language.

## 146. Result and Number Accessibility

- numbers are text, not image-only;
- lottery-ball visual styling has text equivalents;
- draw date and game are announced before values;
- color is not the only distinction for bonus balls;
- tables provide headers and captions.

## 147. Mobile/Zoom

- content reflows without horizontal page scrolling;
- sticky elements do not consume excessive viewport height;
- virtual keyboard does not hide input/action;
- safe-area insets supported;
- bottom navigation can be bypassed by assistive technology.

---

# PART XXI — PERFORMANCE AND RELIABILITY

## 148. Shell Performance Priorities

1. Core page identity and primary utility render first.
2. Header/navigation usable quickly.
3. Ads reserve space.
4. AI loads after core content.
5. Community/news rails may load progressively.
6. personalization must not block public content.
7. app/web deep links resolve reliably.

## 149. Degraded Mode

If AI fails:

- core page works;
- deterministic insights remain;
- links/tools remain.

If personalization fails:

- public shell remains;
- no private information leakage.

If ads fail:

- no blank disruptive gap beyond reserved slot rules.

If purchase eligibility fails:

- suppress CTA and provide retailer/general guidance.

If community fails:

- facts and editorial remain.

---

# PART XXII — MEASUREMENT

## 150. Global Shell Events

- navigation selected;
- search submitted;
- direct result selected;
- AI opened;
- first AI answer completed;
- account prompt viewed;
- sign-in after delivered value;
- My Numbers opened;
- notification opened;
- community opened;
- affiliate eligibility checked;
- qualified outbound click;
- Preferred Source prompt/action;
- app install prompt/action;
- Responsible Play opened.

## 151. Shell Success Metrics

- time to first useful action;
- navigation success;
- search success;
- AI trial and answer completion;
- dead-end rate;
- anonymous-to-investment conversion;
- notification usefulness;
- qualified purchase rate;
- ad-related abandonment;
- accessibility defects;
- mobile bottom-nav usage;
- direct-return growth.

## 152. Guardrails

- no increase in result abandonment;
- no confusion between ads/affiliate and facts;
- no reduced human participation from AI;
- no increased notification disable rate;
- no high-consequence commercial leakage;
- no private data in public metadata or cache.

---

# PART XXIII — APPROVED DIRECTIONS AND PAGE-LEVEL TESTS

## 153. Founder-Approved Directions

The founder approves this blueprint with the following interpretations:

1. The supplied visual references are shell references only and do not approve final page-family content or design.
2. Working desktop labels are Results, States, Games, Jackpots, Tools, News and Community.
3. Community/Forums wording remains a page-level usability test; the architecture must preserve familiar forum language where it helps LotteryPost-style users.
4. The persistent desktop AI label is **Ask LotteryCorner AI**; shorter mobile labels such as **Ask AI** are permitted.
5. Mobile bottom navigation is Home, Results, My Numbers, Community and Ask AI, subject to final high-fidelity testing.
6. The personal shell is **My LotteryCorner**; **Insider** remains an identifiable capability/membership layer within it.
7. News and Blog retain separate page-family homes, archives and article templates even when Blog is nested beneath News in global navigation.
8. Brand Navy, Action Blue and AI Teal are provisional semantic directions, not final brand approval.
9. The utility strip is optional and must prove value without distraction.
10. Guest number persistence, public AI allowance and sticky purchase behavior are decided in the relevant page-family blueprint and experiment plan.
11. Purchase or Where to Play actions are mandatory on eligible high-intent surfaces unless a documented suppression reason applies.
12. State context follows the approved precedence rule; IP location alone never determines legal purchase eligibility.
13. “Prefer LotteryCorner on Google” is primarily a News/editorial investment action and may later appear in relevant Insider preferences.
14. A single AI module never satisfies the AI-everywhere requirement; each section must make an explicit intelligence decision.

## 154. Items Reserved for Page-Family Testing

- exact visual styling and color values;
- final mobile density;
- utility-strip enablement;
- guest-save duration;
- one public AI answer versus a limited public session;
- sticky versus inline purchase CTA;
- ad-anchor activation and density;
- final Community/Forums and My LotteryCorner/Insider wording;
- page-specific section order and hierarchy.

These are not unresolved strategic gaps. They are controlled blueprint and usability decisions.

---

# PART XXIV — BLUEPRINT ACCEPTANCE CRITERIA

This blueprint is approved and frozen because:

1. The working primary desktop navigation is approved for page-family design.
2. The working mobile bottom navigation is approved for page-family design.
3. Search and Ask behavior is approved.
4. Anonymous, signed-in and Insider shell transformations are approved.
5. AI identity, first-answer behavior and the AI-everywhere guardrail are approved.
6. The supplied visuals are accepted as non-binding shell references.
7. The reusable section IDs and contracts are accepted.
8. Advertising anchors and sticky-conflict rules are accepted.
9. State-aware affiliate requirements and purchase-path obligations are accepted.
10. State-context precedence is accepted.
11. The Section Intelligence Matrix is accepted.
12. The content-operations ownership model is accepted.
13. The behind-the-screen contract is accepted.
14. The public-language contract is accepted.
15. WCAG 2.2 AA is accepted as the accessibility target.
16. Final page-family visuals remain subject to separate founder approval.
17. Page-family blueprint work may now begin using this frozen shared shell.

---

# APPENDIX A — SECTION LIBRARY REGISTRY

| Category | IDs | Purpose |
|---|---|---|
| Global shell | GS-01–GS-15 | Identity, navigation, search, AI, account, ads, affiliate, safety |
| Core utility | SL-U01–SL-U15 | Results, jackpots, schedules, claims, purchase, tools |
| Intelligence | SL-I01–SL-I14 | AI, explanation, facts, history, community summaries |
| Momentum | SL-M01–SL-M10 | Next actions, related content, return and sharing |
| Personal | SL-P01–SL-P10 | Save, generate, follow, history, registration, notifications |
| Community | SL-C01–SL-C10 | Hubs, questions, replies, identity, moderation |
| Editorial | SL-E01–SL-E10 | Articles, summaries, timelines, current facts and discussion |
| Commerce | SL-X01–SL-X07 | Purchase options, disclosures and return |
| Advertising | SL-A01–SL-A07 | Intent-sensitive ad patterns |
| Trust | SL-T01–SL-T08 | Verification, AI disclosure, corrections, safety and privacy |

---

# APPENDIX B — RESEARCH AND SOURCE REGISTER

## Internal sources

**[INT-01]** `00A-v2.1-luckregenerator-product-constitution-FROZEN.md`  
Founder-approved product constitution defining AI visibility, intelligent momentum, community, personalization, commerce and visual approval.

**[INT-02]** `01-lotterycorner-experience-architecture-FINAL-APPROVED.md`  
Approved experience zones, page families, section library, metadata and operations contracts.

**[INT-03]** `00B-lottery-player-behavior-engagement-and-ai-experience-research.md`  
Player personas, language, LotteryPost engagement, saved-play, AI and monetization research.

## Current U.S. product observations

**[EXT-01]** LotteryPost — current results, forums, news, predictions and information ecosystem.  
`https://www.lotterypost.com/`

**[EXT-02]** LotteryPost Site Map — forums, predictions, systems, charts, wheels, blogs and account capabilities.  
`https://www.lotterypost.com/sitemap`

**[EXT-03]** LotteryUSA — U.S. state results, jackpots, news, odds and utility navigation.  
`https://www.lotteryusa.com/`

**[EXT-04]** Florida Lottery — official state results and game navigation.  
`https://floridalottery.com/`

**[EXT-05]** Florida Lottery Winning Numbers.  
`https://floridalottery.com/games/winning-numbers`

**[EXT-06]** LotteryCorner current home and public state/game experiences.  
`https://www.lotterycorner.com/`

## Search, distribution and metadata

**[EXT-07]** Google Search Preferred Sources publisher guidance.  
`https://developers.google.com/search/docs/appearance/preferred-sources`

**[EXT-08]** Google guide for generative AI features and publisher visibility.  
`https://developers.google.com/search/docs/fundamentals/ai-optimization-guide`

**[EXT-09]** Google Breadcrumb structured data.  
`https://developers.google.com/search/docs/appearance/structured-data/breadcrumb`

**[EXT-10]** Google canonicalization guidance.  
`https://developers.google.com/search/docs/crawling-indexing/canonicalization`

**[EXT-11]** Open Graph protocol.  
`https://ogp.me/`

## Accessibility, advertising and responsible play

**[EXT-12]** W3C WCAG 2.2.  
`https://www.w3.org/TR/WCAG22/`

**[EXT-13]** W3C: What is new in WCAG 2.2, including focus and target-size requirements.  
`https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/`

**[EXT-14]** FTC Endorsement Guides FAQ for clear affiliate disclosure.  
`https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking`

**[EXT-15]** Coalition for Better Ads standards.  
`https://www.betterads.org/standards/`

**[EXT-16]** National Council on Problem Gambling Internet Responsible Gambling Standards.  
`https://www.ncpgambling.org/responsible-gambling/internet-standards/`

---

# APPENDIX C — APPROVAL AND FREEZE RECORD

## C.1 Founder Review Clarifications

Before freeze, the founder confirmed:

1. Shell visuals are references only; actual page content and design will be reviewed in each page-family blueprint.
2. AI must be evaluated inside every useful section and cannot be reduced to one chatbot or AI block.
3. Eligible high-intent surfaces must provide a qualified ticket-purchase or Where to Play path unless explicitly suppressed.
4. State context must be explicit and reliable; IP location alone cannot determine legal eligibility.
5. Navigation and shell language must remain familiar to ordinary U.S. lottery players, with Community/Forums and My LotteryCorner/Insider terminology tested during page design.

## C.2 Freeze Status

This Global Shell and Section Library Blueprint is accepted and frozen as Version 1.1.

Future page-family blueprints must inherit its shell, section IDs, AI-everywhere rule, state-context precedence, language contract, purchase-path requirement, Section Intelligence Matrix, content operations, metadata contract and accessibility requirements.

---

# APPENDIX D — FINAL BLUEPRINT STATEMENT


The global shell should make LotteryCorner immediately recognizable as:

- a fast U.S. lottery-results destination;
- an intelligent lottery assistant;
- a useful set of tools;
- a living community;
- a personal lottery home;
- and a trusted route to legal purchase options.

The shell must never force users to understand the architecture.

They should simply be able to:

> Find the answer, ask the AI, explore something interesting, save what matters, talk with people, and come back at the right time.
