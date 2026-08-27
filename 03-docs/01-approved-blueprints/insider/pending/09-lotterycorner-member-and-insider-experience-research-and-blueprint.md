# LotteryCorner Member and Insider Experience Research and Blueprint

**Document:** `09-lotterycorner-member-and-insider-experience-research-and-blueprint.md`  
**Internal platform codename:** LuckReGenerator  
**Public product:** LotteryCorner.com  
**Version:** 1.0  
**Status:** Research and blueprint complete; founder decisions listed in Part 22  
**Prepared:** July 25, 2026  
**Primary market:** United States lottery information, tools, AI, news and community  
**Document type:** Product research, experience architecture and implementation-ready blueprint  
**Explicit exclusions:** High-fidelity UI, implementation code, API contracts, database schemas, authentication protocol design and final pricing approval

---

## Reading Key

- **APPROVED** — already binding through a founder decision, the frozen Product Constitution or a later final-approved blueprint.
- **SOURCE FINDING** — directly observed in an attached source or current external source.
- **RECOMMENDED** — the board's proposed decision for this blueprint.
- **REQUIRES FOUNDER DECISION** — material product or business choice that should not be silently finalized.
- **FUTURE** — intentionally excluded from launch or dependent on later evidence.
- **PUBLIC COMPLETE** — the visitor can complete the immediate task without registration.
- **PUBLIC PREVIEW** — the feature, supported inputs and sample value are visible, but advanced execution is gated.
- **MEMBER** — free signed-in user.
- **INSIDER** — advanced consumer experience; not automatically ad-free and not a promise of better winning probability.
- **PRO/DATA** — future high-usage, business or licensed-data access; not the normal consumer tier.

External observations document current product behavior as of July 25, 2026. They are not endorsements, legal opinions or permanent capability guarantees.

# Preliminary Source Inventory and Conflict Check

## A. Short Source Inventory

The complete uploaded package was reviewed before the blueprint was written, including the Markdown decision documents and their desktop/mobile companion wireframes. The source hierarchy applied is the one frozen in the Product Constitution: explicit founder decision → Product Constitution → approved experience architecture → final page-family blueprints → research → existing implementation. [I02]

| ID | Source | Status | How it governs this blueprint |
| --- | --- | --- | --- |
| I01 | Project brief (`Pasted text(1).txt`) | Current task authority | Binding scope, required parts, matrices and founder decisions |
| I02 | LuckReGenerator Product Constitution v2.1 | Accepted and frozen; Jul 23, 2026 | Highest uploaded product authority after explicit founder decisions |
| I03 | Player Behavior, Engagement and AI Experience Research | Strategic research; Jul 23, 2026 | Personas, draw-cycle behavior, saved-play and AI/community evidence |
| I04 | State Lottery Search & SEO Research | Research foundation; Jul 20, 2026 | Search intents, trust tiers, public usefulness and state-lottery jobs |
| I05 | AI Search, GEO and Retrieval Research | Research complete; Jul 20, 2026 | Public/private retrieval, provenance, indexing and AI-search boundaries |
| I06 | Global Shell and Section Library | Proposed v1.0; Jul 23, 2026 | Shared shell, My LotteryCorner label, reusable section contracts; subordinate to later final blueprints |
| I07 | Home Page Blueprint | Final approved and frozen v1.1; Jul 24, 2026 | Anonymous discovery and signed-in personal-home transformation |
| I08 | State Page Blueprint | Final approved and frozen v1.1; Jul 24, 2026 | State following, saved matches, local alerts and personalized state experience |
| I09–I12 | Game Page, Jurisdiction Game and Tools/AI Blueprints | Final approved and frozen v1.1; Jul 24, 2026 | Public game truth, tool visibility, preview gating, save/track loops and first-party `/play` resolution |
| I13–I15 | Yearly Results Archive research, blueprint and content template | Final approved and frozen v1.1; Jul 24, 2026 | Complete public annual archives; tiered Ask the Archive and Archive Explorer |
| I16–I19 | News and Editorial research, hub, article and template | Final approved and frozen; Jul 24, 2026 | Public news, reporter identity, canonical discussion and protected editorial zones |
| I20–I24 | Community research, home, Forum Entry, profile and content template | Final approved and frozen v1.1; Jul 24, 2026 | One Forum Entry object, public member profiles, identity/privacy and moderation |
| V01 | Companion desktop/mobile SVG wireframes | Attached visual references | Confirmed anonymous/signed-in ordering, protected workflow placement and mobile priorities |

## B. Decision and Conflict Log

| Issue | Observed conflict or ambiguity | Applied decision | Status |
| --- | --- | --- | --- |
| Shell status mismatch | The uploaded Global Shell is marked **proposed**, while later final Home/State/Game documents refer to a final-approved shell. | Use the shell only where consistent with the later final packages. Record the missing final shell copy as a source-control gap. | REQUIRES SOURCE CONFIRMATION |
| Missing experience architecture | The shell and project brief reference `01-lotterycorner-experience-architecture-FINAL-APPROVED.md`, but it was not attached. | Do not invent missing route or page-family decisions. Use the Constitution and final page-family blueprints; flag the missing document before final wireframe sign-off. | GAP |
| Research versus frozen authority | The behavioral research challenges earlier strategic ideas; the Product Constitution v2.1 is later, frozen and founder-approved. | Use behavioral research as evidence; where language differs, preserve the frozen Constitution. | RESOLVED |
| Original versus final research copies | Archive and Community packages include original/reference research beside v1.1 final-frozen versions. | Use v1.1 final-frozen documents as authoritative; originals are audit history only. | RESOLVED |
| Public AI access versus costly tools | The Constitution requires at least one complete public AI answer; the Tools and Archive blueprints permit preview gating and advanced limits. | Give one complete low-cost contextual answer publicly. Gate saved context, batch work, multi-year research, reports and costly agents after value is shown. | RESOLVED |
| Insider and advertising | Conventional premium models often use ad removal, but founder decisions and the Constitution explicitly allow ads for Members and Insiders. | Insider protects workflows and can reduce interruptions; ad-free is not the default promise. | RESOLVED |
| Member-home URL | The final Community blueprint approves `/members/{username}` for a public profile; the current site already uses `/insider/login` and `/insider/register`; no approved private-home route exists. | Keep **My LotteryCorner** as the user-facing label. Preserve/redirect current `/insider/*` during migration. Do not finalize `/member`, `/dashboard`, `/my-lottery` or `/my-lotterycorner` until route and redirect review. | REQUIRES FOUNDER DECISION |
| Ticket checking terminology | Sources support saved-number checking and camera assistance, but LotteryCorner has no approved official ticket-validation integration. | Call the output a LotteryCorner number/ticket comparison. The official lottery remains final authority. A `PurchasedTicketRecord` exists only when the user explicitly records purchase. | RESOLVED |
| Reporter versus member identity | News uses `/authors/{reporter-slug}`; Community uses `/members/{username}`. | Keep identities separate. A reporter may link a member identity, but member reputation does not replace editorial accountability. | RESOLVED |
| Legacy promotional claims | The current public site contains claims such as increasing winning chances and placeholder testimonials, while the Constitution prohibits predictive advantage and manufactured proof. | Treat existing copy as migration debt; do not carry it into Member or Insider positioning. | CORRECTION REQUIRED |

### Source-check conclusion

The approved package is sufficiently coherent to design the Member and Insider system. Two documentary gaps remain: the absent final Experience Architecture and the uploaded shell's proposed status. Neither prevents this blueprint because the frozen Constitution and the later final page-family blueprints establish the product contract, but both should be corrected before high-fidelity wireframes become the implementation record.

---

# Part 1 — Executive Recommendation

## 1.1 What Member Means

**RECOMMENDED:** A **Member** is a free signed-in LotteryCorner user who has invested something worth preserving: a game, state, number set, alert, tool configuration, article, Forum Entry, AI continuation or community identity.

Member is not a reduced public experience and is not a compulsory account wall. Public truth remains public. Membership adds:

- continuity across devices;
- private saved objects;
- result and reply notifications;
- basic AI history and explicit preferences;
- community participation;
- limited saved tool and archive history;
- personal match checking; and
- user-controlled return loops.

The registration promise is therefore:

> **Save what matters and let LotteryCorner bring you back when something changes.**

## 1.2 What Insider Means

**RECOMMENDED:** **Insider** is the advanced consumer workspace inside the same LotteryCorner pages and My LotteryCorner experience. It adds depth, scale, automation and convenience—not essential truth and not better future odds.

Insider's core value is:

- deeper Archive Explorer and multi-year research;
- larger or batch number checking;
- advanced generators, wheels and System Lab;
- historical backtesting with rule-era controls;
- saved research workspaces, versions and private notes;
- larger AI limits and higher-cost reports;
- custom multi-condition alerts and scheduled briefs;
- advanced exports when rights and completeness permit; and
- greater storage and cross-device continuity.

An Insider capability remains visible on public pages with its purpose, accepted inputs, sample output, access label and reason to use it. Upgrade happens only after the user understands the value and their configured work is preserved.

## 1.3 Why Users Register

The strongest reasons are concrete and event-linked:

1. Save a number set after checking or generating it.
2. Automatically compare that set with future verified results.
3. Follow a state, game, reporter, Forum Entry or member.
4. Receive a result, match, reply or major-change alert.
5. Publish a drafted Community question without losing it.
6. Continue a useful AI conversation with permitted context.
7. Preserve a tax scenario, archive filter or basic system.

The weakest registration reason is “create an account to see what this does.”

## 1.4 Why Users Upgrade

Users upgrade when a completed free task naturally expands:

- one year → all available years;
- one number set → batch portfolio;
- one calculation → scenario comparison and report;
- one system → versions, backtests and scheduled tracking;
- one AI answer → durable workspace and deeper research;
- standard alerts → custom conditions and scheduled summaries.

The upgrade promise is:

> **Research more history, organize more of your lottery activity, and automate the follow-up—without claiming better odds.**

## 1.5 Recommended Initial Monetization Model

**RECOMMENDED:** Launch the Member foundation as completely free and ad-supported. Launch Insider as a visible, capped **Insider Preview/Beta** before charging broadly. Use this period to measure cost, demand and retention by capability.

Later monetization should combine:

- a simple monthly/annual Insider subscription for ongoing advanced access;
- metered credits for unusually expensive AI research or batch jobs;
- one-time purchase for a clearly scoped report/export where useful;
- sponsor-supported access to selected tools only when the sponsor cannot influence outputs; and
- a separate future Pro/Data tier for API, commercial CSV and high-volume use.

Do not make ad removal the primary conversion message. Do not finalize price until feature usage, AI cost, willingness-to-pay and cancellation/support tests are available. Current comparables show that consumers understand free plus progressively higher usage, and data products commonly charge for deeper querying and export rather than for basic facts. [W01][W17][W20][W26][W27]

## 1.6 Main Differentiator

LotteryCorner's defensible difference is the connected loop:

> **Trusted public result → personal number check → explainable historical context → saved continuity → human discussion → user-controlled alert → deeper research when needed.**

LotteryPost demonstrates demand for durable community, systems and premium history tools; official lottery apps demonstrate demand for scanning, alerts, saved account state and official transactions; AI products demonstrate understandable tiering by usage, context and advanced research. LotteryCorner should combine those patterns without copying prediction claims, transaction custody or an ad-free-only premium promise. [W01][W02][W06][W07][W08][W17][W20]

# Part 2 — Founder Decisions and Assumptions

| Decision or assumption | Classification | Basis |
| --- | --- | --- |
| U.S.-lottery-first scope; do not merge unrelated non-U.S. games | APPROVED | Product brief and Constitution |
| Basic results, rules, ordinary news, community reading and complete annual archives remain public | APPROVED | Founder decision and final archive/news/community blueprints |
| AI is embedded across pages, tools, archives, news and community; chatbot is one interface | APPROVED | Constitution |
| One complete low-cost public AI answer before sign-in | APPROVED | Constitution; reconciled with preview gating |
| Sign-in follows demonstrated value | APPROVED | Constitution |
| Advanced Insider capabilities remain publicly discoverable and previewable | APPROVED | Founder decision and Tools blueprint |
| Insider is not automatically ad-free | APPROVED | Founder decision and Constitution |
| Public/private object types remain distinct | APPROVED | Founder decision |
| One connected product, not a detached premium microsite | APPROVED | Founder decision |
| Free Member as the launch account tier | RECOMMENDED | Best fit with acquisition, public SEO, community and alert loops |
| Insider Preview/Beta before broad paid launch | RECOMMENDED | Reduces price and AI-cost uncertainty |
| Long-term lead positioning: Personal Lottery Workspace, supported by research/tools/AI | RECOMMENDED | Highest ordinary-player comprehension |
| Working signed-in label: My LotteryCorner | APPROVED/RECOMMENDED | Approved shell language; route remains open |
| Private signed-in route | REQUIRES FOUNDER DECISION | Current `/insider/*` exists; future route not approved |
| Exact free and Insider AI quotas | RECOMMENDED CONFIGURABLE | Initial guardrails in Part 10; must be tuned from cost and abuse data |
| Paid subscription price and annual discount | REQUIRES FOUNDER DECISION | Research supports models, not one final price |
| Whether Insider has reduced ad density or only protected workflows | REQUIRES FOUNDER DECISION | This blueprint recommends both protected workflows and fewer interruptions |
| Optional future ad-light add-on | FUTURE | Test only after understanding ad economics and demand |
| Commercial API/data licenses | FUTURE | Separate product and rights review |
| Official ticket scanning/purchase integration | FUTURE | Do not imply until verified integration exists |

# Part 3 — Market and Competitor Research

## 3.1 Research Conclusions

1. **Lottery community premium is historically tool-led, not purely ad-removal-led.** LotteryPost requires a free membership before Gold or Platinum and promotes deeper histories, Pick 3/Pick 4 utilities, wheels, filters, storage and community capabilities. [W01][W02][W03]
2. **Official lottery accounts earn return through utility.** State apps commonly combine results, ticket scanning, favorites/alerts, rewards and—where lawful—online purchase. Account requirements vary: some let anonymous users see results or scan, while account features unlock history, purchase and personalized alerts. [W06][W07][W08][W09][W10][W11]
3. **Courier products make continuity part of the purchase journey.** They typically preserve a ticket image, notify the user, automatically check results and provide account-level responsible-play controls. LotteryCorner should learn from the continuity pattern but not copy custody or imply official validation. [W12][W13][W14][W15]
4. **Advanced-data products charge for query power and export.** Stathead keeps broad public sports reference value while charging for deep historical finders and exporting query results. This is a closer monetization analogy for Archive Explorer and System Lab than a generic content paywall. [W26][W27]
5. **Consumer AI tiers are explained through usage, context, research depth and workspace features.** Free access proves value; paid tiers raise limits and add projects, scheduled actions, larger context or advanced research. [W17][W18][W19][W20][W21][W22]
6. **Community products separate following from paying.** Lightweight follow/save relationships can precede subscription; notification categories are independently controllable. [W23][W24]
7. **Responsible-play controls must be close, immediate and respected across marketing.** Current NCPG standards emphasize accessible time-outs/self-exclusion, marketing suppression and no automatic resumption; official/courier products provide practical examples of deposit/spend limits and cool-off controls. LotteryCorner is not the operator, but it should suppress its own promotional and affiliate activity when a user requests a pause. [W13][W14][W16]
8. **Disclosures must appear where decisions are made.** FTC guidance requires material affiliate or native-ad relationships to be clear, conspicuous and difficult to miss; Better Ads standards argue against disruptive formats. [W28][W29]

## 3.2 Competitor and Pattern Matrix

| Source/pattern | Observed finding | Relevance | Adopt | Do not copy |
| --- | --- | --- | --- | --- |
| LotteryPost | Free membership plus Gold/Platinum history, utilities, wheels, storage and community participation. | Strong proof that specialist depth and identity can support payment. | Free identity first; premium history/system depth; durable public discussion. | Dense legacy UX, predictive implication, or premium status as credibility. |
| Official state lottery apps | Results, scan/check, alerts, rewards, retailer or official purchase depending on state. | Users understand accounts when tied to concrete recurring utility. | Result alerts, favorite games, clear official-source handoff, device continuity. | Assuming one national feature set; implying LotteryCorner validates an official ticket. |
| Powerball / Mega Millions | Authoritative results, past draws, number checking/generation and game education. | Public core facts must remain complete and source-backed. | Official links, transparent game/rule-era context. | Putting essential facts behind an account. |
| Lottery couriers | Ticket image, automatic check, notifications, smaller-win handling, limits and self-exclusion. | Shows the value of preserving work through the draw cycle. | Status continuity and user-controlled alerts. | Custody, payment or official-validation claims without integration; aggressive purchase prompts. |
| Stathead / Sports Reference | Public reference ecosystem; paid advanced querying and export. | Best analogy for archive/workflow monetization. | Charge for query scale, saved work and export—not basic records. | Hard paywall before showing query value or unclear data rights. |
| ChatGPT / Claude / Gemini / Perplexity | Free trial value; paid usage, projects, memory/research and scheduling. | Users understand cost-linked limits if meters and fallbacks are clear. | Explicit quotas, model/tool transparency, workspace separation, deletion controls. | Invisible throttling, indefinite promises, or merging all saved state into ‘memory.’ |
| Substack / Reddit / Discord | Follow/save/community first; optional paid access or personalization. | Identity and return can grow before monetization. | Follow relationships, independent notification controls, visible roles. | Pay-to-win reputation, unrestricted direct messaging at launch, or subscriber-only ordinary reading. |
| Strava | Free tracking/community; paid advanced analysis and route detail. | A personal workspace can be the lead benefit while advanced analysis is secondary. | Progressive disclosure and saved continuity. | Streak pressure or competitive ranking applied to lottery spend. |
| Third-party lottery data APIs | Structured current/historical feeds sold to developers; claims vary by provider. | Confirms a distinct future B2B market, but rights/provenance must be verified. | Separate Pro/Data product with service-level and correction terms. | Mixing unverified third-party data licensing into consumer Insider. |

# Part 4 — User and Access Levels

| Level/role | Purpose and capabilities | Boundary | Identity/privacy rule |
| --- | --- | --- | --- |
| Anonymous Visitor | Complete public facts and ordinary reading; use selected complete public tools; receive one contextual AI answer; configure drafts/alerts before sign-in. | Cannot persist private objects cross-device, publish, receive alerts or run costly/batch work. | No identity inferred from temporary activity beyond essential security/abuse controls. |
| Member | Free signed-in continuity: save/follow, notifications, community participation, basic histories, limited AI and tool storage. | Cannot claim advanced unlimited research, batch processing, commercial rights or moderator authority. | Private saved objects remain private by default. |
| Insider | Advanced consumer depth, automation, storage and usage limits throughout the same product. | Does not receive better official facts, better winning odds, moderation influence or paid reputation. | May still see ads outside protected workflows. |
| Future Pro/Data | High-volume exports/API, licensed/commercial use, correction feed and higher AI/job quotas. | Not a normal player upgrade and not a community status symbol. | Separate terms, rights, support and pricing. |
| Community Contributor | A Member or Insider who posts/replies and accumulates public contribution history. | No special authority merely from activity or payment. | Public username may differ from account/legal name. |
| Reporter | Named editorial author using `/authors/{reporter-slug}` with editorial accountability. | Reporter identity is not replaced by `/members/{username}` and cannot use private member data for stories without consent. | May link an optional community identity. |
| Moderator | Human role for content safety, appeals and enforcement; can see only data necessary for moderation. | Cannot access private saved numbers, tickets or AI chats unless a specific reported item and policy allow it. | Actions are logged and reviewable. |
| Administrator | Operational role for account, entitlement, billing, security and product governance. | No routine browsing of private content; least privilege and audited access. | Cannot publish private user material without explicit authorization. |

## 4.1 Anonymous Value Decisions

Anonymous visitors may:

- ask **one complete standard contextual AI question** per 24-hour browser window, subject to abuse controls;
- run a basic number check for one set and one draw;
- run a basic generator and tax estimate;
- search one annual archive and make a small number of basic archive queries;
- configure an alert, then sign in only to activate delivery;
- draft a Forum Entry or reply locally, then sign in to publish;
- configure an advanced tool and see the interpreted inputs/sample before access is requested.

Anonymous temporary work should be held only long enough to preserve the immediate flow, normally up to 24 hours in the browser/session and not treated as durable account data.

## 4.2 Role Combination Rules

- Member and Insider are **entitlements**.
- Contributor, Reporter and Moderator are **roles**.
- A Reporter may be a Member or Insider, but paid status cannot affect editorial authority.
- A Moderator may receive Insider capabilities for work but should not display a paid-status badge as moderation authority.
- Future Pro/Data access is contractual usage, not a public social rank.

# Part 5 — Feature Entitlement Matrix

### Interpretation

- **Complete**: immediate public task is usable without registration.
- **Limited**: usable with explicit quantitative or scope limits.
- **Preview**: inputs/sample/value visible; advanced execution gated.
- **Included**: available within the tier's fair-use limits.
- **Metered**: consumes an explicit usage allowance/credit.
- **Separate**: separately contracted or purchased.
- **No**: unavailable at that level.

| Feature | Anonymous | Member | Insider | Future Pro/Data | Publicly Visible | Preview Allowed | Usage Limit | Storage Limit | AI Cost Risk | Requires Deterministic Tool | Requires Rights Review | Ads | Affiliate Allowed | Responsible Play Risk | Launch Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Basic result access | Complete | Complete | Complete | Complete | Yes | N/A | None | None | Low | Yes | No | Normal after answer | Contextual only | Low | 1 |
| Number checking | 1 set/1 draw complete | Saved and recent checks | Batch up to plan cap | High-volume/API | Yes | Advanced batch | Session | Member: 100 sets; Insider: 2,000 | Low | Yes | Rule-era/prize rights | No ad in result | No immediate loss CTA | Medium | 1–2 |
| Saved number sets | Configure then sign in | Up to 100 | Up to 2,000 | Contract | Feature visible | Yes | N/A | 100/2,000 | Low | Yes | No | Outside edit/match | Eligible pre-draw | Medium | 1 |
| Purchased-ticket records | Preview model | Up to 100 private records | Up to 2,000 + batch | Contract | Feature visible | Yes | N/A | 100/2,000; images lower | Medium | Yes | Image/privacy review | Protected | Suppressed after distress | High | 2 |
| Favorite games/states | Preview follow | 10 games/5 states | Higher practical cap | N/A | Yes | Yes | N/A | 10/5 vs 100/50 | Low | No | No | Normal | Eligible | Low | 1 |
| Basic AI question | 1 complete/day | 10/day | 100/day soft cap | Metered/custom | Yes | N/A | Daily | No durable anon history | Medium | Route tools first | Source rights | No ads in answer | No embedded Buy in answer | Medium | 1 |
| Conversational AI history | No | 30 days/50 conversations default | Extended/user-managed | Contract | Value visible | Yes | N/A | 50 vs 500 active | Medium | No | Privacy review | No ad in transcript | Only explicit safe handoff | Medium | 1–2 |
| AI memory | No | Explicit preferences only | Workspace/project memory | Custom | Controls public | Yes | N/A | Small structured preferences | Medium | No | Privacy review | None | No marketing inference | High | 1–2 |
| Ask the Archive | Limited annual queries | 3/day + save | 20/day + multi-year | High volume | Yes | Yes | Daily | Saved query history 50/500 | Medium | Yes | Data rights | After result, not inside | None | Low | 1–2 |
| Multi-year Archive Explorer | Preview | 1 monthly trial or campaign | Included fair use | Separate high-volume | Yes | Yes | Monthly/daily | 10/500 saved views | High | Yes | Export rights | Outside workflow | None | Low | 2 |
| Basic generator | Complete | Save/history | Included | N/A | Yes | N/A | Reasonable abuse cap | 100/2,000 sets | Low | Yes | No | After output | Eligible pre-draw | Medium | 1 |
| Advanced generator | Preview/configure | 1 trial/month | Included fair use | N/A | Yes | Yes | Monthly/daily | Saved presets 10/200 | Medium | Yes | No | Outside controls | Eligible pre-draw | High | 2 |
| Hot/cold and frequency | Limited period complete | Saved filters | All periods/export | Bulk/API | Yes | Yes | Range | 10/200 presets | Low | Yes | Data rights | Normal after table | Contextual only | High | 1–2 |
| Pair/triple analysis | Preview + small period | Limited saved pairs | Advanced multi-number | Bulk/API | Yes | Yes | Range/query | 10/200 | Medium | Yes | Data rights | Outside table | Contextual | High | 2 |
| Wheels and coverage | Form + sample | Basic run/save | Advanced constraints/versions | N/A | Yes | Yes | Combinations | 5/100 systems | Medium | Yes | Method rights | Outside core workflow | Eligible after clear cost | High | 2 |
| System Lab | Preview/sample system | 1 active system + limited history | 25 active/versioned | Research contract | Yes | Yes | Systems/backtests | 1 vs 25 active | High | Yes | Method/data rights | Protected workspace | Eligible pre-draw only | High | 2 |
| Historical backtesting | Preview | 1-year/limited runs | Multi-year and compare | Bulk/contract | Yes | Yes | Runs/month | 10/500 reports | High | Yes | Data rights | Protected | No Buy after negative outcome | High | 2–3 |
| Financial backtesting | No run; explanation | No unless complete data | Allowed only with verified price/payout coverage | Contract | Visible warning | No misleading preview | Data completeness | Reports only | High | Yes | High rights/completeness | Protected | No Buy | Very high | 3 |
| Ticket Portfolio Analyzer | Preview | Manual portfolio and checks | Batch/import/advanced summary | Contract | Yes | Yes | Ticket count | 100/2,000 | High | Yes | Image/data rights | Protected | Suppressed after loss/distress | Very high | 2 |
| Basic tax calculator | 1 complete estimate | Save scenarios | Compare/export/sensitivity | Professional use separate | Yes | N/A | Reasonable cap | 10/100 scenarios | Low | Yes | Legal/tax review | No ad in result | No Buy | High | 1 |
| Saved tax scenarios | Configure then sign in | 10 | 100 | Contract | Visible | Yes | N/A | 10/100 | Low | Yes | Legal/tax review | Protected | No Buy | High | 1–2 |
| Cash versus annuity | 1 complete estimate | Save one scenario | Sensitivity and report | Professional separate | Yes | Yes | Runs | 10/100 | Medium | Yes | Legal/financial review | Protected result | No Buy | High | 1–2 |
| Custom reports | Sample | No or one trial | Metered allowance | Separate | Yes | Yes | Credits/month | 10/100 reports | High | Yes | Rights review | No ads in paid report | None | Medium | 2–3 |
| CSV export | Annual public file where approved; otherwise preview | Small saved/filtered export | Advanced filtered export | Commercial/bulk separate | Yes | Yes | Rows/files | 10/100 exports | Low | Yes | Required | No ads in file | None | Low | 2–4 |
| PDF report | Sample | One trial | Metered/included allowance | Commercial separate | Yes | Yes | Reports | 5/100 | Medium | Yes | Required | No ads in report | None | Low | 2–3 |
| API | No | No | No consumer API | Separate contract | Marketing page | Sample docs later | Requests | Contract | High | Yes | Required | No ads | No affiliate payloads | Low | 4 |
| Community posting | Draft only | Included with rate/reputation controls | Same; no paid boost | N/A | Reading public | Draft preview | Rate/trust | Public posts retained by policy | Medium | Moderation tools | Image/copyright review | Thread ads controlled | User links restricted | Medium | 1 |
| Image uploads | No publish | Limited after verification/trust | Larger storage, same safety | N/A | Capability visible | Yes | Rate/size | Member 250MB; Insider 5GB initial | High | Moderation/redaction | Required | No ad in upload flow | No affiliate images | High | 2 |
| Polls | Read public | Create after trust threshold | Same; no paid boost | N/A | Yes | Yes | Rate/trust | Within entries | Low | Yes | Moderation | Normal | No purchase polls by platform | Medium | 2 |
| Saved Forum Entries | Preview save | Up to 500 | Higher practical cap | N/A | Yes | Yes | N/A | 500/5,000 | Low | No | No | Normal | None | Low | 1 |
| Following members | Preview follow | Up to 500 | Higher practical cap | N/A | Yes | Yes | N/A | 500/5,000 | Low | No | No | Normal | None | Low | 1 |
| News alerts | Configure | Game/state/reporter alerts | Advanced rules/digests | N/A | Yes | Yes | Frequency | 100 rules combined | Low | No | No | Normal | Affiliate only in linked page | Medium | 1 |
| Result alerts | Configure | Included opt-in | Included + custom timing | N/A | Yes | Yes | Frequency | Per followed game | Low | Yes | No | No ad in notification | No purchase pressure | Medium | 1 |
| Jackpot threshold alerts | Configure | Basic threshold per game | Multiple conditions | N/A | Yes | Yes | Rules | 10/100 | Low | Yes | No | No ad in notification | Calm wording | High | 1–2 |
| Custom condition alerts | Preview | No or one trial | Included fair use | Contract | Yes | Yes | Rules/evaluation | 100 | Medium | Yes | Rights review | No ad in notification | Safety suppression | High | 2 |
| Scheduled email reports | Sample | Basic weekly digest | Custom scheduled reports | Contract | Yes | Yes | Schedules | 1 default/20 custom | High | Yes | Rights review | No ads in paid report; digest may have ads | No Buy after loss | High | 2–3 |
| Mobile push | Configure | Included opt-in | Same + custom rules | N/A | Yes | Yes | Frequency caps | Device tokens only | Low | Yes | Platform policy | No ad-only push | Strict promo consent | High | 1 |
| Saved articles | Preview save | Up to 500 | Higher cap | N/A | Yes | Yes | N/A | 500/5,000 | Low | No | No | Normal | Article rules | Low | 1 |
| Private notes | No | Basic notes on saved objects | Workspace notes/search | Contract | Visible | Yes | N/A | 10MB/500MB text | Low | No | Privacy review | Protected | None | Low | 2 |
| Research workspace | Preview | No or one trial workspace | Included with limits | Contract | Yes | Yes | Projects/jobs | 10/100 projects | High | Yes | Rights/privacy | Protected | None | Low | 2 |
| Advertisement treatment | Normal controlled | Normal; fewer generic prompts | Protected workflows + reduced interruptions; not automatically ad-free | Contract/no consumer ads | N/A | N/A | Frequency cap | N/A | N/A | N/A | Ad policy | By tier | N/A | Medium | 1–4 |
| Affiliate Buy Tickets | Where eligible and safe | Where eligible and safe | Same; never a paid advantage | Excluded from data/API outputs | Yes | Eligibility preview | State/game/cutoff | No raw URLs saved | Low | Resolver | Rights/legal review | Clear disclosure | High safety suppression | Very high | 1 |
| Support level | Public help/report issue | Account/community/data issue | Plus billing/usage explanation; no safety priority advantage | Contract support | Help public | N/A | Fair use | Case history | Medium | No | Privacy/security | No ads | No sales pressure | Low | 1–4 |

## 5.1 Entitlement Rules That Prevent Ambiguity

1. **Access labels appear before input:** Public, Sign in to save, Insider Preview, Insider, Metered, or Pro/Data.
2. **A limit is measurable:** show remaining runs, reset time and what happens next.
3. **An error is not an upgrade prompt:** system failure, unavailable source or incomplete data never masquerades as a paywall.
4. **Paid status does not change public facts:** numbers, rules, corrections, ordinary news and complete annual archives remain identical.
5. **Work is preserved through sign-in and upgrade:** configured inputs, interpreted query and unsent draft survive.
6. **Safety/support is never degraded by tier:** claim, security, privacy and Responsible Play access is equal or stronger for everyone.

# Part 6 — Member Journeys

## Journey 1 — Result Visitor Becomes a Member

**Powerball example**

1. Anonymous visitor opens the verified Powerball result.
2. Winning numbers, date, draw status and source appear first.
3. Visitor enters one number set and receives a deterministic comparison.
4. The result says “No prize match” or the exact match; no near-miss celebration.
5. CTA: **Save these numbers and check future draws automatically.**
6. The set remains in temporary state while sign-up opens.
7. After sign-up, the user names it “Family Numbers,” chooses future Powerball draws and selects in-app/push/email.
8. After the next verified draw, LotteryCorner checks it and sends only the chosen notification.
9. Return deep-link opens the exact saved-set result, not the homepage.

**Failure/empty states:** invalid ball range; wrong rule era; result pending; duplicate set; notification permission denied; no future draw scheduled. Each state preserves the set and gives one corrective action.

## Journey 2 — Game-Page Visitor Uses AI

1. On the Mega Millions page, the visitor asks: “Why is the multiplier on my ticket different from the last draw?”
2. LotteryCorner routes current-format facts to deterministic/rule sources and gives one complete answer with source context.
3. CTA: **Keep this conversation and remember Mega Millions as a game I follow.**
4. Sign-up preserves the conversation and asks separately whether the user wants the game followed and whether AI may remember that preference.
5. The Member later sees the conversation under Recent AI Conversations and a relevant rule-change follow-up—not generic AI prompts.

**Failure states:** ambiguous rule era; unsupported ticket image; source unavailable; AI limit reached after the free answer. The user still sees the completed answer and official-source link.

## Journey 3 — Historical Archive User Becomes Insider

1. Visitor opens the **2025 Powerball archive** and asks: “Find every draw containing 7 and 21.”
2. LotteryCorner shows the interpreted query, coverage and matching 2025 rows.
3. The user selects **Compare across all available years**.
4. The page explains: “Multi-year Archive Explorer is an Insider feature. Your query is ready and will continue from the same filters.”
5. Sign-in/upgrade retains game, numbers, rule-era handling and output format.
6. After access, comparison runs immediately and links every conclusion to draw records.

**Failure states:** one year has incomplete history; a rule-era boundary affects valid balls; export rights unavailable. The system narrows or labels results instead of inventing completeness.

## Journey 4 — System User

1. User runs a basic Florida Pick 3 generator.
2. After seeing generated sets and method disclosure, the user signs in to save “Evening Split Test.”
3. Member receives one limited historical test and can edit notes.
4. Insider Preview shows versioning, longer evaluation periods, costs and exact outcomes.
5. Insider creates Version 2, compares it with Version 1 and schedules a weekly report.
6. Every report states: **Historical performance does not establish future advantage.**
7. Financial ROI is omitted when ticket-price, add-on or payout coverage is incomplete.

## Journey 5 — Community User

1. Anonymous visitor drafts: “Does Florida Pick 3 Fireball change a straight/box prize?”
2. The composer detects the game and suggests the relevant official rule context without publishing.
3. User signs in; draft remains intact.
4. Forum Entry publishes at `/community/{slug}`.
5. A labeled LotteryCorner Research Note may answer the verifiable rule portion; human replies remain prominent.
6. User follows the entry and receives independent reply/mention controls.
7. Helpful contributors can be followed through `/members/{username}`.

**Failure states:** duplicate question; moderation hold; unsupported attachment; username unavailable; official rule source conflict. Draft remains private until resolution.

## Journey 6 — News Reader

1. User reads a short News Article about a Powerball jackpot winner.
2. The Bottom Line, reporter, published/updated dates and source appear before ads.
3. User follows Powerball or the reporter, joins the canonical Forum Entry and opens jackpot history.
4. A major factual update triggers the user's selected news alert.
5. The return page shows the update timeline, not a duplicate article.

## Journey 7 — Winner/Ticket Tracking

1. User privately creates a `PurchasedTicketRecord` by explicitly saying the set was purchased and entering the draw.
2. Optional image upload warns the user to hide barcode, claim number and personal information; automated redaction runs before storage.
3. On result verification, the system compares numbers deterministically.
4. If a prize-relevant match is found, the result says **Potential match—verify with the official lottery** and opens state-specific claim guidance.
5. The record remains private. Sharing requires a separate redacted `PublicNumberShare`.

**Failure states:** unreadable image; wrong draw; unsupported ticket/add-on; result corrected; claim data unavailable. Never declare official validation.

## Journey 8 — Free Member Sees Insider Capability

1. Member configures an advanced System Lab backtest.
2. Inputs, estimated computation, supported history and sample report are visible.
3. User selects **Run full comparison**.
4. Access explanation states what Insider adds, the applicable limit and the no-prediction boundary.
5. The configuration is saved as a draft.
6. After trial/upgrade, the exact job runs; the user is not asked to rebuild it.

## Journey 9 — Responsible Play Intervention

1. User writes “I keep losing and need to stop buying.”
2. The system suppresses Buy links, promotional jackpot alerts and sponsor messages for that session immediately.
3. It offers: pause promotional notifications, pause Buy links, set a quiet period, hide jackpot marketing, and open official/help resources.
4. A signed-in user may apply an account-level promotional pause across devices.
5. The control does not shame the user, does not close access to results or claim information and does not automatically resume at expiry without explicit consent.

## 6.1 Journey Design Rules

- The immediate task completes before registration or upgrade.
- The exact created work is the conversion anchor.
- Notifications deep-link to the precise object/event.
- A loss is not an affiliate trigger.
- Private records never become public merely because the user joins Community.
- Every journey includes a reversible exit and settings path.

# Part 7 — Member Home Blueprint

## 7.1 Name and Route

**APPROVED USER-FACING LABEL:** **My LotteryCorner**.

**REQUIRES FOUNDER DECISION:** final private route. The current site exposes `/insider/login` and `/insider/register`; the final Community route `/members/{username}` is a public profile and must not become the private dashboard. [W31][W32][I23]

Recommended migration behavior:

1. Keep `/insider/login` and `/insider/register` functional during transition.
2. Introduce the My LotteryCorner product label in navigation and onboarding.
3. Select one private canonical route only after legacy URL, analytics, redirects, mobile deep links and authentication callback review.
4. Candidate order for founder review: `/my-lotterycorner` (clearest brand), `/member` (short), `/my-lottery` (plain but narrower), `/dashboard` (reject unless unavoidable because it feels enterprise-like).

## 7.2 Experience Principle

My LotteryCorner is a **personal draw-cycle home**, not an enterprise dashboard. It answers three questions:

1. What changed for me?
2. What needs my attention now?
3. What did I save or start that I may continue?

No more than five modules should compete above the first major scroll on desktop; mobile begins with one summary and two immediate actions.

## 7.3 Launch Module Order

| Priority | Module | Launch behavior | Empty state | Mobile rule |
|---:|---|---|---|---|
| 1 | **What Changed for Me** | Exact counts: saved sets checked, followed results, replies, report completion | “Follow a game or save numbers to see changes here” with public examples | Single compact summary; no carousel |
| 2 | **My Games & Next Draws** | Followed games, verified latest result, next draw and alert state | State/game selector with popular and recent contexts | Next two relevant draws only; “See all” |
| 3 | **My Numbers & Matches** | Saved sets, exact outcomes, pending draws, privacy label | Create/enter/generate one set before sign-in prompt | Exact matches first; no near-miss styling |
| 4 | **Replies & Following** | Replies, mentions, followed Forum Entries/reporters/members | Suggest high-context discussions, not random feed | Unread first; mute/frequency controls nearby |
| 5 | **Continue** | Last AI conversation, archive query, tool or system draft | Explain what can be saved after first use | One most relevant continuation |
| 6 | Alerts | Category status, failures and quiet hours | Configure one result alert | Collapsed unless action required |
| 7 | Saved Tools & Systems | Basic tools, System Lab, versions | Public tool discovery | Show recent two |
| 8 | Archive Research | Saved queries and Insider preview | Run first annual query | Recent one plus “Explore” |
| 9 | Saved News & Guides | Bookmarks and followed stories | Relevant current guide | Deferred below utility |
| 10 | Insider Preview | One contextual capability based on actual usage | Explain value without generic upgrade wall | Never first module |
| 11 | Responsible Play & Controls | Promotional pause, notifications, help | Always available; no empty state | Persistent settings entry, not marketing footer |

## 7.4 Adaptive Rules

- **Current draw priority:** pending/just-verified saved-set checks outrank articles or tool recommendations.
- **First-week Member:** emphasize one saved object, one alert and one follow—not all modules.
- **Community-active Member:** replies may move above Continue, but never above an urgent potential match.
- **Insider:** show running/completed reports and usage meter; do not replace public facts with charts.
- **No saved games:** ask the user to follow a game/state, not to complete a long profile.
- **No saved numbers:** offer enter, generate or check; explain privacy first.
- **Distress/pause state:** hide purchase and jackpot-promotional modules; keep results, claims and settings.

## 7.5 Personalization Boundaries

Use:

- explicit followed games/states;
- saved number sets and systems;
- notification choices;
- recent tools and saved research;
- Forum Entry participation;
- explicit interests and AI memory choices.

Do not infer or expose:

- income or affordability;
- gambling disorder for marketing;
- precise location beyond a current user-selected/consented transaction need;
- legal identity from username;
- political, health or other sensitive traits;
- private ticket spend as a reason to promote more play.

## 7.6 Advertising

- Ads may appear after the What Changed/My Games/My Numbers utility sequence.
- No ads inside match outcomes, alert failures, billing, privacy, Responsible Play, AI transcript or paid report.
- Insider receives fewer interruption points; the exact density remains a founder/economics decision.

# Part 8 — Public-Page Transformation Matrix

| Page family | Anonymous experience | Member experience | Insider experience | What never changes | Save/follow | AI behavior | Ad behavior | Affiliate behavior | Privacy behavior | Upgrade trigger |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Current results/jackpots, state discovery, AI trial, tools/news/community | What changed, followed games, saved checks, replies | Personal brief, advanced continuation, reports/usage | Public current facts and navigation | Follow state/game; save after value | 1 contextual answer; member context after sign-in | Normal after utility; Insider fewer interruptions | State-aware `/play` only; suppressed in safety contexts | No private data in public modules | Saving, custom report or advanced tool |
| State Page | Complete state results, games, claims, taxes, scratchers, news/community | My state home: followed results, sets, state alerts | Advanced state research, custom conditions | All public state facts | Follow state/game; check/save sets | State-specific public answer; memory optional | After result/claim-sensitive rules | Qualified options only | State preference is private unless profile opt-in | Custom multi-game/state research |
| Powerball/Mega Millions Page | Global result, jackpot, rules, tools, history, news/community | Saved-set comparison, followed context, alerts | Advanced analyses, systems, reports | Global current facts and rule-era truth | Follow/check/save | Contextual game answer | Never before result; no ad in checker | First-party resolver; only supported regions | Saved sets private | Batch check, advanced analysis |
| State-specific Game Page | Local features, claims, rules, local community | Local saved checks and alerts | Advanced local/history comparisons | URL-defined content for all visitors | Follow local offering | Local rule/context answer | Claim section protected | Global `/play/{game}` resolver; no raw URL | No IP content rewrite/private exposure | Advanced research or custom alerts |
| Yearly Results Archive | Complete annual rows, basic filters, limited Ask Archive | Save query/numbers, small export where permitted | Multi-year Explorer, advanced conditions/reports | Complete valid annual archive | Save search/follow game | Interprets filters and cites rows | Ads outside rows/query workflow | Current-year only when safe; none in historical rows | Queries private unless explicitly shared | Compare years/export/report |
| Tools Hub | All tools visible with labels and samples | Recent/saved tools | Insider usage and advanced tools | Catalog visibility | Save tool/preset | Tool chooser/help | Normal catalog ads | Only contextually qualified | Private inputs never used in ads | Attempt advanced run |
| Individual Tool | Complete basic output or advanced preview | Save/history/basic personalization | Scale, batch, versions, exports | Inputs/method/public examples | Save output/configuration | Explains deterministic result | No ad inside input/result; after completion only | Only after task and safe intent | Inputs private by default | Save, batch, export or costly run |
| News Hub | Public stories, categories, states/games | Followed topics/reporters and unread updates | Research/saved workspace continuation | All ordinary news | Follow reporter/topic; save article | AI summaries only where labeled | Controlled feed inventory | Contextual and disclosed | Reading history private | Custom digest/research |
| News Article | Bottom Line, reporter, dates, sources, discussion | Saved/followed state, canonical replies | Private notes/research workspace | Article and updates | Save/follow/join discussion | Labeled context, never speculative fact | Protected headline/Bottom Line/reporter/correction zones | Only after article context and safe | Private notes separate from comments | Save report or advanced history |
| Community Home | Public authentic discussions | Following, replies, recommended high-context topics | No pay-to-rank; advanced research tools only | Public reading and discovery | Follow spaces/members | AI discovery/summary, not fake activity | Moderate list ads | Minimal; user links restricted | Private follows unless opted public | Publish/follow; not typically upgrade |
| Forum Entry | Question and public replies | Reply/follow/mention state | Advanced private research continuation, no paid answer priority | Public entry and human replies | Follow/reply/save | Tiered Research Note policy | No ad between prompt and first useful replies | No platform Buy in distress/claim threads | Drafts/private notes stay private | Save research/report, not discussion access |
| Reporter/Member Profile | Public approved identity and contributions | Follow/mute; own profile controls | No paid credibility boost | Public contributions and role labels | Follow member/reporter | Optional contribution summary | Normal controlled | No affiliate in profile unless approved editorial role | Email/phone/private objects never public | No standard upgrade trigger |
| Conversational AI | One complete contextual answer, no history | History, permitted preferences, saved objects | Higher limits, projects, deep reports | Source-backed answer quality | Save conversation/object | Core experience with tool routing | No ads in answers/transcript | Explicit safe handoff only | Private by default; explicit share creates new public object | Limit, workspace, deep job |
| Search | Public pages and clear entity/date results | Personal shortcuts may be shown privately | Advanced saved searches/research | Public result ranking cannot be paywalled | Save/follow search | Query interpretation where useful | Search ads clearly separate | Only explicit purchase intent | Private personalization not in public URL | Save/alert/complex cross-entity query |

## 8.1 Inline Transformation Rules

- Public results are identical for all access levels.
- A signed-in Game Page may show the user's saved-number match immediately **after** the public result.
- Insider depth appears inline as a concise summary and opens a workspace only when the task needs sustained controls; it does not turn every page into a terminal.
- Members receive fewer generic prompts because continuation is based on saved context.
- Buy Tickets is hidden in claim, scam, distress, Responsible Play, post-loss pressure and unsupported-jurisdiction contexts.
- Any share action shows exactly what becomes public and never shares the source private object automatically.

# Part 9 — Saved Numbers, Tickets and Systems

## 9.1 Conceptual Object Definitions

| Object | Meaning | Ownership | Default privacy | Public sharing | Result behavior | Deletion/retention |
| --- | --- | --- | --- | --- | --- | --- |
| SavedNumberSet | User-entered or saved generated numbers for a game; not proof of purchase. | User | Private | Explicit PublicNumberShare only | Against selected/future draws under correct rule era | Until user deletes; checks may be cleared |
| PurchasedTicketRecord | User explicitly records that a ticket was purchased, with draw/add-ons and optional redacted image. | User | Private | Never direct; create redacted share | Potential-match comparison only; official lottery final | User-controlled; images shorter retention by default |
| PublicNumberShare | Public copy containing only selected numbers/context and no private ticket identifiers. | Publishing member | Public after confirmation | Already public; editable/removable subject to discussion integrity | Optional link to public draw result | Retained with public post/share policy |
| SystemGeneratedSet | Number set generated by a named system/version and method disclosure. | User/system workspace | Private by default | Share copy with method/version disclosure | Tracked as a set; no predictive claim | Follows parent system or user deletion |
| PoolNumberSet | Numbers associated with a private group record; LotteryCorner is not custodian or legal guarantor. | Pool organizer/group members as configured | Private | Redacted deliberate share only | Checks draw; no ownership adjudication | Group-controlled; access removed on membership change |
| HistoricalCheck | Record of comparing a set/object against one or more historical draws. | User | Private | Share a generated report only | Deterministic and reproducible | Cleared with object or independently by user |

## 9.2 Required Fields at the Conceptual Level

Every number/ticket object carries:

- owner;
- game and jurisdiction offering where relevant;
- draw date or tracking range;
- rule era;
- creation source: user entry, generator, system, import or image assistance;
- privacy state;
- explicit purchase assertion, if any;
- notification rules;
- result-check history and correction status;
- share-copy references; and
- deletion/retention preference.

No database design is implied.

## 9.3 System Object

A `System` represents a user-defined method or reusable tool configuration:

- name and owner;
- target game/rule era;
- filters and constraints;
- generated number sets;
- method disclosure;
- current version and prior versions;
- evaluation period;
- historical matches and prize-relevant outcomes;
- verified ticket-price/add-on/payout coverage;
- historical cost only where complete;
- notes;
- private/public state;
- related Forum Entry share copy;
- saved report and schedule;
- future draw tracking.

### Mandatory claims

Every System Lab or backtest surface states:

> **Historical performance does not establish future advantage.**

Financial ROI is blocked or visibly incomplete when any relevant prize, ticket-price, add-on, tax or payout rule is missing. The system never fills absent historical economics with current values.

## 9.4 Share Safety

Sharing uses a two-step confirmation:

1. Preview the exact public copy, including numbers, name, notes, image and draw context.
2. Confirm audience and permanence; default excludes ticket image, barcode, purchase amount, location, claim data and AI conversation.

Deleting a private source object does not silently delete an existing public Forum Entry if replies depend on it; the user is offered delete, anonymize or detach according to Community policy.

# Part 10 — AI and Personalization

## 10.1 Separate Concepts

| Concept | Purpose | Control boundary |
| --- | --- | --- |
| Session Context | Temporary page/game/draw/tool context needed for the current interaction. | Expires with session; not durable memory. |
| Saved User Preference | Explicit choice such as favorite state, game, units or notification format. | Visible in settings; editable/deletable. |
| Explicit Memory | A user-approved fact the assistant may reuse, such as ‘I follow Florida Pick 3 Evening.’ | Never inferred from sensitive traits; source shown; can be disabled. |
| Saved Object | Number set, ticket record, system, archive query, article or note with its own lifecycle. | Not stored as generic AI memory. |
| Private AI Conversation | User/assistant transcript and tool evidence. | Private by default; separate retention and deletion controls. |
| Public Community Post | Deliberately published Forum Entry/reply. | Independent public object; no automatic conversion from chat. |
| AI Research Report | Generated synthesis with sources, scope, model/tool metadata and expiry/correction behavior. | Private unless editorially reviewed or explicitly shared. |
| Notification Rule | Deterministic trigger and delivery preferences. | Not AI memory; independently paused/deleted. |

## 10.2 Memory and Privacy Controls

Users can:

- view remembered preferences and their source;
- remove one memory or all memories;
- disable personalization while retaining the account;
- use a private/temporary conversation that does not enter history;
- separate workspaces by game, system or research project;
- clear AI history without deleting saved number sets;
- share a deliberately redacted conversation copy to Community;
- download or delete relevant account data;
- disable model improvement/secondary use where the product offers it;
- keep private notes and public comments separate.

Consumer AI products increasingly expose memory, project and data-control separation; LotteryCorner should make those concepts simpler and lottery-specific. [W18][W19][W20][W21][W22]

## 10.3 Initial AI Access and Fair-Use Policy

**RECOMMENDED, CONFIGURABLE LAUNCH GUARDRAILS**

| AI class | Anonymous | Member | Insider | When the limit is reached |
|---|---:|---:|---:|---|
| Standard contextual answer | 1 per 24 hours | 10/day | 100/day soft cap | Show reset time; deterministic tools and public sources remain available |
| Ask the Archive (annual) | 2 queries/session | 3/day | 20/day | Preserve query and offer basic filters |
| Multi-year Archive Explorer | Preview only | 1 trial/month | 10/day fair use | Queue not implied; narrow scope, use credit or retry after reset |
| Image/ticket assistance | Preview | 3/month | 50/month | Manual entry fallback |
| System/backtest explanation | Sample | 5/month | 100/month | Deterministic summary or smaller period |
| Deep research/report | Sample | 1 trial where offered | 5/month included, then credits | Preserve job; show cost/credit before run |
| Scheduled AI report | No | Basic digest only | 20 active schedules | Disable least-recent schedule only after user chooses |

Limits are product controls, not promises of exact model capacity. Show usage before the user invests substantial effort. Do not silently downgrade a report into a less reliable answer.

## 10.4 Tool Routing and Transparency

Use deterministic tools for:

- winning-number and prize matching;
- dates, timezones and draw status;
- frequencies, gaps, pairs, sums and filters;
- tax arithmetic and annuity schedules;
- access eligibility and notification triggers;
- rule-era validation;
- storage, privacy and billing status.

Use generative AI for:

- plain-language explanation;
- translating a natural-language archive question into visible filters;
- summarizing sourced evidence;
- comparing user-selected scenarios;
- drafting a report or community question;
- suggesting the next valid tool.

Every substantial answer shows the tools/sources used, interpreted inputs, date coverage and uncertainty. High-consequence claim/tax/legal questions prioritize official sources and explicitly avoid personalized professional conclusions.

## 10.5 AI Cost Matrix

| AI feature | Cost level | Free limit | Insider limit | Fallback |
| --- | --- | --- | --- | --- |
| Page Quick Take | Low | 1 public/day | High fair use | Template/deterministic fact or hide module |
| Conversational rule/result explanation | Low–Medium | 1 public then Member quota | High fair use | Official-source extract and related guide |
| Annual Ask the Archive | Medium | 2/session | 20/day | Visible filters and matching rows without narrative |
| Multi-year Archive Explorer | High | Preview or monthly trial | 10/day fair use | Narrow to one year or fewer conditions |
| Ticket image assistance | High | Preview | 50/month | Manual number/game/draw entry |
| Batch number checking | Medium | No batch | Plan cap | Smaller batch/deterministic CSV import later |
| System Lab report | High | Sample | Included/credits | Deterministic metrics only |
| Tax/cash-annuity explanation | Low–Medium | One estimate | Higher limits | Calculator output and official links |
| News/Forum summary | Medium | Public only when published | On-demand private summaries | Chronological list or human-curated highlights |
| Deep research report | Very High | Sample/trial | Monthly allowance + credits | Scope reduction; preserve draft |
| Scheduled personalized brief | Medium recurring | No | Active schedule cap | Rule-based digest without generative prose |

## 10.6 Error and Retry Behavior

- **Source unavailable:** say what could not be verified; never fabricate.
- **Tool timeout:** preserve inputs, allow deterministic partial output and do not consume a paid credit unless useful output was delivered.
- **Model fallback:** disclose when a simpler model/template is used if output capability materially changes.
- **Correction:** link affected report/answer to the corrected draw/rule and mark it superseded.
- **Ambiguous query:** show the interpreted game, date, jurisdiction and filters before running expensive work.
- **Cost estimate changed:** ask before exceeding the shown credit/allowance.

## 10.7 Personalization Safety

Recommendation ranking may use explicit follows, saved objects and recent product actions. It may not use distress, losses, inferred wealth, precise location or private ticket spending to increase purchase likelihood.

# Part 11 — Insider Positioning and Upgrade Experience

## 11.1 Positioning Options

| Option | Promise | Strengths | Risks | Ordinary-player comprehension | Retention | AI cost | Responsible Play complexity | App fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A — Research and Tools | Advanced history, systems, exports and AI research. | Clear for enthusiasts; differentiated from ordinary results. | Can sound technical; narrower regular-player appeal. | Medium | High | Medium | Medium | Strong for desktop power users |
| B — Personal Lottery Workspace | Save, track, check, follow and continue everything in one place. | Best ordinary-player comprehension and retention story. | May understate advanced research differentiation. | High | High | Medium | Low–Medium | Strongest mobile/app fit |
| C — LotteryCorner AI Insider | Higher AI limits and personalized analysis. | Modern and easy to advertise. | AI cost exposure; novelty risk; may imply prediction. | Medium | Medium | High | High | Useful secondary message, weak sole promise |
| D — Hybrid | Lead with personal workspace; prove depth through research, systems, automation and AI. | Broad comprehension plus differentiated power. | Requires disciplined progressive disclosure. | High | High | Controlled | Medium | Best overall |

## 11.2 Recommendation

**RECOMMENDED: Option D, with Option B as the public-language lead.**

Public headline direction:

> **Your LotteryCorner, saved and ready for the next draw.**

Supporting value:

> Track your games and numbers, continue your research, use deeper tools and choose the alerts that matter.

AI appears as a capability, not the entire identity:

> Ask more questions, compare more history and create sourced reports with LotteryCorner AI.

## 11.3 Upgrade Contract

Every upgrade surface must show:

1. the capability and supported inputs;
2. a real sample or limited completed result;
3. the exact action the user attempted;
4. the free/Member/Insider difference;
5. usage or credit limit;
6. whether ads remain;
7. renewal/cancellation terms before purchase;
8. that configured work will be preserved;
9. no better-odds implication.

### Upgrade-trigger matrix

| Context | User action | Value already shown | Upgrade message | Work preserved |
| --- | --- | --- | --- | --- |
| 2025 Powerball archive | Compare across all years | Valid 2025 matches and interpreted filters | Compare the same query across all available years with Insider Archive Explorer. | Game, numbers, conditions and output choice |
| Basic number checker | Upload/check many sets | One set checked accurately | Check and organize a larger private portfolio; official lottery remains final authority. | Entered sets and draw |
| Tax calculator | Compare cash/annuity scenarios | One complete estimate | Save assumptions, compare scenarios and generate a report. | State, prize and assumptions |
| Generator | Use advanced constraints | Basic generated sets | Apply more filters, save presets and track versions. | All configured constraints |
| System Lab | Run multi-year/version comparison | Sample/limited backtest | Compare versions across supported history with transparent methodology. | System, version, period |
| Conversational AI | Start deep research | One useful answer | Use a research workspace, more sources and a structured report. | Conversation scope and sources |
| Alerts | Create multi-condition rule | Basic result/jackpot alert | Combine game, threshold, timing and delivery conditions. | Configured rule |
| Export | Download advanced filtered result | Visible rows/basic file where permitted | Export the current supported result with rights and completeness notes. | Filters and format |
| Usage limit | Continue same feature | Delivered prior outputs and visible meter | Continue after reset, use included credits or choose a smaller free scope. | Unsaved work and job definition |

## 11.4 Trial and Expiry

- Prefer feature-specific trials (for example, one multi-year comparison) over a confusing all-product countdown.
- A trial states end date, conversion behavior and included usage before activation.
- Expiry never deletes private work immediately; it becomes read-only for at least 90 days, with export/delete controls.
- The user may downgrade without losing public/community identity or Member objects within Member storage limits; over-limit items become read-only, never silently deleted.
- Payment failure uses grace/read-only states and clear retry/cancel paths.

# Part 12 — Ads, Affiliate and Monetization

## 12.1 Pricing and Access Model Evaluation

| Model | User clarity | Conversion risk | AI cost | Support cost | Ad impact | Affiliate impact | Retention | Implementation effort | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Free ad-supported Member | Very clear | Low | Low–Medium | Moderate | Protects ad scale | Supports qualified return clicks | High | Low | Launch foundation |
| Free Insider during growth beta | Clear if time-bound/cap-labeled | No immediate revenue | AI risk unless capped | Low | Protects ads | Supports affiliate | Useful product learning | Low–Medium | Phase 2 only |
| Freemium Insider subscription | Clear with feature matrix | Moderate | Predictable if fair-use caps | Billing/support needed | May reduce some inventory, but ads may remain | Potentially improves retained intent | High if value recurring | Medium | Preferred later base |
| Monthly subscription | Familiar | Easy trial, higher churn | Predictable | Recurring billing | Neutral | Neutral/positive | Tests value quickly | Medium | Offer when paid launch starts |
| Annual subscription | Clear with savings | Higher upfront friction | Predictable | Renewal/support | Neutral | Neutral | Stronger retention but cancellation sensitivity | Medium | Offer beside monthly, not preselected deceptively |
| Usage credits | Clear only for discrete expensive jobs | Can confuse ordinary users | Strong cost alignment | Ledger/refund support | Neutral | Neutral | Low for habit, useful for research | Medium–High | Use only for deep reports/batch jobs |
| One-time report/export | Very clear when scoped | Low recurring conversion | Direct cost recovery | Low–Medium | No effect | Neutral | Low recurring retention | Low | Useful supplement |
| Sponsor-supported tool | Requires prominent sponsor boundary | Low if trust unclear | Offsets cost | Sponsor governance | Adds sponsor inventory | May conflict with affiliate | Variable | Medium | Selective only; sponsor cannot affect output |
| Optional contribution | Clear as support, not access | Low expected conversion | Low | Low | No required ad impact | Neutral | Community goodwill | Low | Future experiment |
| Ad-light add-on | Clear | May cannibalize Insider positioning | Low | Billing | Directly reduces ad revenue | Neutral | Convenience retention | Medium | Future, only with demand evidence |
| Future Pro/Data contract | Clear to business users | Separate sales cycle | Cost-aligned | Higher support/legal | No consumer ad impact | Exclude affiliate outputs | Contract retention | High | Phase 4 |

### Benchmark interpretation

LotteryPost monetizes specialist history/utilities after free membership; Stathead prices advanced data finding/export; leading AI products use free access plus higher message, context, project and research allowances. These benchmarks support a paid workflow/depth model, but they do not establish LotteryCorner's price. [W01][W02][W17][W20][W26][W27]

## 12.2 Recommended Launch-to-Paid Path

1. **Phase 1:** Free Member, ads and qualified affiliate commerce.
2. **Phase 2:** Insider Preview/Beta with visible meters and no payment requirement for selected users/capabilities.
3. **Evidence gate:** measure activation, recurring use, cost per successful job, conversion intent, support burden and trust.
4. **Phase 3:** monthly + annual Insider, with a small included deep-research allowance; optional one-time reports/credits.
5. **Phase 4:** separate Pro/Data agreements.

No price is approved by this document.

## 12.3 Advertising Contract

### Protected zones

No ads:

- inside AI answers or private conversation transcripts;
- inside saved-number/purchased-ticket match results;
- inside claim, scam, security, privacy or Responsible Play actions;
- between a News headline and Bottom Line/reporter identity;
- inside correction timelines;
- inside paid exports or paid reports;
- inside billing/cancellation;
- disguised as system controls, results or official sources.

### Ad and affiliate matrix

| Page/workflow | Anonymous | Member | Insider | Protected zone |
| --- | --- | --- | --- | --- |
| Home | Normal after immediate utility | Normal after personal utility | Reduced interruptions; standard lower placements | No ad before results/What Changed |
| Result page | After verified result and essential actions | After result + personal match | Same protected result; fewer repeats | Winning numbers/status/check outcome |
| Game/State page | Controlled standard inventory | Controlled standard inventory | Fewer interstitials; may retain rail/long-form slots | Result, claim, local rule answer |
| Archive rows | Outside result rows | Outside rows/query controls | Outside rows/research workspace | Rows, filters, interpreted query |
| Tool input/output | After complete result | After complete result | Outside workspace; none in paid report | Input, calculation and result |
| AI | No ad in answer; page ad outside module | No ad in transcript | No ad in transcript/report | Entire answer/transcript |
| News Article | After Bottom Line/source-sensitive opening | Same | May have reduced long-form density | Headline, Bottom Line, reporter, correction/safety |
| Community | Controlled list/thread placements | Same | No paid reply prominence | Composer, prompt and first useful reply sequence |
| My LotteryCorner | After personal utility modules | After personal utility modules | Reduced interruptions | Matches, alerts, settings, usage/billing |
| Claim/Responsible Play | None or minimal non-promotional house navigation | None | None | Entire action flow |
| Affiliate resolver | Clear first-party step; no competing ads | Same | Same | Eligibility, provider type, fees/cutoff/disclosure |
| Paid export/report | N/A | N/A | No ads | Entire paid artifact |

## 12.4 Affiliate Contract

- Use first-party `/play/{game}` resolver; never store raw affiliate URLs in saved objects or user-generated content.
- Resolver uses only approved coarse location rules and current user-selected context; raw IP is not stored for personalization.
- Show provider type: official state service, official subscription, independent courier/affiliate or retailer-only.
- Show material disclosure next to the CTA, not only in a footer. FTC guidance requires material connections to be clear, conspicuous and difficult to miss. [W28]
- Suppress Buy after a reported loss/distress signal, on claim/tax/scam/help pages, after a negative portfolio summary, and when eligibility cannot be verified.
- No affiliate link in a public user post unless a moderator-approved policy permits and labels it.
- No ads that imitate Buy, Check, Save or official controls; avoid disruptive formats identified by Better Ads standards. [W29]

# Part 13 — Notifications and Return Loops

## 13.1 Notification Principles

- User-owned subscriptions, never bundled promotional consent.
- Deep-link to the exact draw, set, Forum Entry, article, report or setting.
- In-app, push and email are independently controlled.
- Quiet hours default to the user's account timezone and can be overridden for user-selected urgent categories.
- Frequency caps apply across channels to prevent duplicates.
- Essential account/security/billing messages remain separate from promotional notifications.

## 13.2 Notification Matrix

| Event | In-App | Push | Email | Default | User control |
| --- | --- | --- | --- | --- | --- |
| Verified result | Yes | Optional | Optional/digest | Off until game followed or alert activated | Per game/channel; immediate or digest |
| Saved-number result | Yes | Optional recommended after explicit activation | Optional | Off until set tracking activated | Per set/game; exact matches or all checks |
| Jackpot threshold | Yes | Optional | Optional | Off; user sets threshold | Per game/threshold; pause anytime |
| Next draw reminder | Yes | Optional | Optional | Off | Per game; one reminder max unless user chooses |
| Claim deadline | Yes | Optional | Optional | Off; only for explicit private ticket record | Per record; protected, no marketing |
| Unclaimed prize | Yes | Optional | Optional/digest | Off | State/game/major only |
| Game/rule change | Yes | Optional major | Optional | On in-app for followed game; others off | Major only or all |
| News | Yes | Optional major | Digest default after opt-in | Off until follow | State/game/reporter/category |
| Reporter story | Yes | Optional | Optional/digest | Off | Per reporter |
| Forum Entry reply | Yes | Optional | Optional | On in-app after posting/following | Per entry/channel |
| Mention | Yes | Optional | Optional | On in-app | Mute/block controls |
| AI Research answer | Yes | Optional | Optional | On for explicitly started long job | Per job; no marketing |
| System report | Yes | Optional | Optional | Off until schedule created | Per system/schedule |
| Archive report | Yes | Optional | Optional | Off until scheduled | Per saved query |
| Insider usage/limit | Yes | No unless user chooses | Optional | On in-app near limit | Meter and reset controls |
| Billing/renewal | Yes | No push by default | Required transactional email | On for paying user | Cannot opt out of essential billing; marketing separate |
| Payment failure | Yes | Optional | Required transactional email | On | Retry/update/cancel; no promotional copy |
| Security/suspicious sign-in | Yes | Optional | Required | On | Essential; device/session controls |
| Responsible Play control | Yes | Optional if user requests | Optional/confirmation | On only for requested confirmation/expiry | No promotion; no automatic resumption |
| Promotional offer | No inbox by default | Off | Off | Off | Separate explicit consent; frequency cap |

## 13.3 Frequency and Quiet-Hour Defaults

- Default quiet hours: 10:00 p.m.–8:00 a.m. account local time.
- Verified result alerts may wait until quiet hours end unless the user explicitly marks that game “send immediately.”
- At most one promotional message per seven days and only with separate consent; recommended launch default is none.
- Reply/mention bundling: one summary after five events or 15 minutes, whichever comes first, unless the user is active in the app.
- Draw/result notifications deduplicate across push/email; in-app remains as the durable record.
- Notification failure appears in My LotteryCorner with a fix path; the product does not repeatedly prompt for permissions on every visit.

## 13.4 Return Loops

- Result → exact saved-set check → next draw/follow.
- Reply → exact Forum Entry → reply/follow/mute.
- Report completion → exact workspace → review/export/schedule.
- News update → canonical article timeline → game/state/community.
- Usage threshold → meter → smaller scope/reset/credit; not a panic upgrade modal.

# Part 14 — Account, Profile and Privacy

## 14.1 Account Experience

### Sign-up

- Email/password and appropriate identity-provider options at product level; do not prescribe low-level auth here.
- Show the saved object/draft/alert being preserved.
- Require age/terms confirmation only where legally/product necessary; do not imply the account itself purchases tickets.
- Verify email before publishing, changing security-sensitive settings or receiving high-risk alerts.
- Ask for username only when Community participation is requested; registration for saving numbers need not force public identity setup.

### Sign-in and recovery

- Persistent cross-device session with visible device/session management.
- Recovery path does not reveal whether an email exists more than necessary.
- Suspicious sign-in alerts and revoke-all-sessions control.
- Step-up verification for billing, data export, deletion or sensitive ticket-image access.

## 14.2 Identity Model

- **Account name:** private operational identity; optional real name.
- **Community username:** public pseudonym, unique, change-controlled.
- **Reporter identity:** editorial author record at `/authors/{reporter-slug}`.
- **Member profile:** public contribution page at `/members/{username}` only when the user participates publicly.
- **Insider status:** may be shown privately; public badge is optional and must not imply expertise.
- **Moderator/Reporter labels:** verified role labels with separate governance.

## 14.3 Settings Map

1. Account and sign-in security.
2. Public profile and username.
3. Preferred states/games.
4. Notifications by category/channel, quiet hours and digest.
5. Privacy and sharing defaults.
6. AI memory, personalization and history.
7. Saved data, export and deletion.
8. Insider plan, usage, billing and cancellation.
9. Responsible Play and promotional pause.
10. Support and report issue.

## 14.4 Privacy Matrix

| Object | Private by Default | Public Option | Share Confirmation | Retention |
| --- | --- | --- | --- | --- |
| SavedNumberSet | Yes | Yes, through separate PublicNumberShare | Yes, exact preview | Until user deletes; configurable history clearing |
| PurchasedTicketRecord | Yes | Redacted derivative only | Strong confirmation | User-controlled; images default shorter retention |
| Ticket image | Yes | No direct public option | N/A | Delete after extraction by default or explicit retain; redact sensitive fields |
| PublicNumberShare | No after publication | Already public | Yes before publishing | Until removed/anonymized under Community rules |
| SystemGeneratedSet | Yes | Share copy | Yes | With parent system or user deletion |
| PoolNumberSet | Yes | Redacted derivative only | All authorized sharers as configured | Group policy; removed members lose access |
| Private AI Conversation | Yes | Share copy only | Exact transcript/redaction preview | User-selected history; clear/delete controls |
| Explicit AI Memory | Yes | No | N/A | Until removed or account deleted |
| Saved Archive Query | Yes | Share report only | Yes | User controlled |
| Private note/workspace | Yes | No direct public option | N/A | User controlled; read-only grace on downgrade |
| Forum Entry/reply | No | Public | Publish confirmation | Community retention/anonymization policy |
| Member profile | Private until public participation/profile enabled | Yes | Profile preview | Noindex/remove/anonymize options |
| Reporter profile | Public editorial record | Yes | Editorial approval | Retained as publication record with updates |
| Notification Rule | Yes | No | N/A | Until disabled/deleted; delivery logs minimized |
| Billing record | Yes | No | N/A | Legal/accounting retention; separated from content |
| Security/session log | Yes | No | N/A | Risk-based limited retention |
| Data export | Private downloadable package | User may share outside product | Step-up verification | Temporary download expiry |

## 14.5 Prohibited Exposure

LotteryCorner never exposes email, phone, precise address, private number sets, purchase history, ticket barcode, claim number, private AI conversation or billing details without explicit authorization. Raw IP is not stored for personalization; security logging and coarse affiliate eligibility require separate governance and retention.

## 14.6 Deletion and Downgrade

- Account deletion shows what will be deleted, anonymized or retained for public discussion/legal reasons.
- Private saved objects and AI history are deletable independently.
- Public contributions may be deleted or anonymized according to Community integrity and legal policy.
- Downgrade preserves objects read-only for a grace period; it never publicly reveals or immediately destroys over-limit private work.
- Data export is available before deletion and includes plain-language object categories.

# Part 15 — Responsible Play and Trust

## 15.1 Product Controls

LotteryCorner is an independent information product, not the official lottery operator. Its controls therefore govern LotteryCorner promotions, alerts, affiliate links and workspace behavior; official self-exclusion or transaction limits must be completed with the relevant lottery/provider.

Provide:

- **Promotional pause:** suppress jackpot marketing, sponsor tools and affiliate Buy links.
- **Buy Tickets pause:** hide `/play` CTAs across signed-in sessions/devices for a selected period.
- **Notification pause:** pause promotional and optional draw reminders while preserving security/account messages.
- **Quiet period:** 24 hours, 7 days, 30 days or indefinite; no automatic marketing resumption without confirmation.
- **Spend/budget tracker:** informational, private and non-shaming; no “remaining budget” framed as permission to spend.
- **Play reminders:** user-selected time/spend reflection, not streak mechanics.
- **Official help links:** state/provider resources and national support resources, kept current.
- **Sensitive-language handling:** detect distress/chasing language to suppress promotion and offer controls; do not use the signal for targeting or public labeling.
- **Account safety preference:** remember a user's requested promotional suppression and make it easy to extend.

Current NCPG standards emphasize accessible time-outs/self-exclusion, marketing suppression and no automatic return to play; LotteryCorner should meet the spirit of those controls even though it cannot administer an operator's formal exclusion. [W16]

## 15.2 Context Classification

| Context | Information | Purchase action | Promotional alert | Account/safety message |
|---|---|---|---|---|
| Normal result/game exploration | Allowed | Qualified and restrained | Opt-in only | Allowed |
| After non-winning check | Allowed | De-emphasized; never “try again” | Suppressed for session | Allowed |
| Potential prize/claim | Official-first | Suppressed | Suppressed | Claim/security only |
| Scam/fraud concern | Safety information | Suppressed | Suppressed | Safety follow-up |
| Distress/chasing language | Help/results remain | Suppressed | Suppressed | Control confirmation only |
| Responsible Play page/settings | Full help | Suppressed | Suppressed | Essential only |
| User promotional pause | Full public information | Hidden | Paused | Essential only |

## 15.3 Trust Controls

- Never describe independent output as official.
- Corrections propagate to saved checks, reports, notifications and AI answers.
- AI sources and deterministic tools are visible.
- User-generated claims are labeled as member content.
- Reporter/editorial and Community identities stay distinct.
- No paid tier purchases credibility, ranking or moderation leniency.
- Ticket images receive automated redaction plus a user preview before any share.

# Part 16 — SEO/GEO and Public/Private Boundaries

## 16.1 Indexing Matrix

| Surface | Public access | Indexing recommendation | Reason |
|---|---|---|---|
| Results, State, Game, guides and complete yearly archives | Public | Index/follow when valid and canonical | Essential public utility, search and AI discovery |
| Archive filters/query states | Public result state | Noindex by default; canonical annual page | Avoid thin/infinite combinations; preserve annual source of truth |
| Tools Hub and tool marketing/preview pages | Public | Index/follow when substantive | Discoverability and value-before-sign-in |
| News Hub/Articles and reporter profiles | Public | Index/follow | Editorial discovery and accountability |
| Community Home and quality Forum Entries | Public | Index/follow after quality/moderation rules | Human knowledge and discussion |
| `/members/{username}` | Public only when enabled | Index substantive profiles; noindex empty/low-value/moderated profiles | Prevent thin identity pages and privacy leakage |
| PublicNumberShare | Public link | Noindex by default; consider index only for substantive editorial/community context | Avoid low-value number spam and accidental discoverability |
| Public AI Research Report | Only after explicit publish/editorial review | Index only when original, sourced, durable and corrected | Avoid mass generated pages |
| Insider feature explanation/upgrade pages | Public | Index/follow | Explain visible capabilities and access transparently |
| My LotteryCorner/private member home | Authenticated | Noindex/no public cache | Private personalized state |
| Saved numbers/tickets/systems/notes/workspaces | Authenticated | Noindex | Private objects |
| AI conversations/memory/settings | Authenticated | Noindex | Private/sensitive |
| Alerts/notification center | Authenticated | Noindex | Private preferences |
| Billing, security, export, deletion | Authenticated | Noindex | Sensitive account operations |
| Pro/Data docs | Public marketing/docs when launched | Index selectively | Business discovery without exposing credentials/data |

## 16.2 Public/Private Retrieval Rules

- Authentication, not `robots.txt`, protects private objects.
- Public pages contain primary facts as crawlable text; AI/GEO does not require a separate generated content surface. [I05]
- Public passages carry game, state, draw, date, timezone, source and verification status so retrieval cannot easily detach the fact from context.
- Structured data describes visible content; it does not expose private membership state.
- AI-generated public content requires provenance, correction path, source dates and human/editorial accountability where appropriate.
- User personalization never appears in shareable query strings or server-rendered public HTML.

## 16.3 Canonical Identity Boundaries

- `/authors/{reporter-slug}`: editorial identity.
- `/members/{username}`: public community identity.
- `/community/{slug}`: canonical Forum Entry.
- Annual archive routes remain public canonical records.
- Private My LotteryCorner route remains unapproved pending route audit.

# Part 17 — Data and Conceptual Object Model

This section defines product concepts and ownership only. It is not a database schema.

| Concept | Meaning | Owner | Default visibility | Primary access |
| --- | --- | --- | --- | --- |
| Account | Authentication, entitlement, private settings and security | User | Private | Member/Insider/roles |
| CommunityProfile | Username, avatar, public contribution identity and reputation | User | Private until enabled; public fields thereafter | Contributor/Member |
| ReporterProfile | Editorial author identity and accountability | Publisher/reporting team | Public | Reporter |
| Follow | Relationship to game, state, reporter, member or Forum Entry | User | Private by default; optional public profile display | Member/Insider |
| SavedNumberSet | Private numbers not necessarily purchased | User | Private | Member/Insider |
| PurchasedTicketRecord | Explicit user purchase record, optional redacted image | User | Private | Member/Insider |
| PublicNumberShare | Deliberately public derivative | Publishing user | Public | Contributor |
| System | Reusable method/configuration | User | Private by default; share derivative | Member/Insider |
| SystemVersion | Immutable conceptual snapshot of filters/method | User | Follows system privacy | Member/Insider |
| Backtest | Historical evaluation with coverage/method metadata | User | Private unless report shared | Member/Insider |
| SavedToolRun | Inputs/output/method for a tool | User | Private | Member/Insider |
| ArchiveQuery | Interpreted filters, coverage and result references | User or anonymous session | Private/session | All, persistent for Member+ |
| ResearchWorkspace | Collection of queries, notes, reports and sources | User | Private | Insider/Pro |
| PrivateAIConversation | Transcript, context and tool evidence | User | Private | Member/Insider |
| ExplicitMemory | User-approved reusable preference | User | Private | Member/Insider |
| AIResearchReport | Sourced generated artifact with scope and correction status | User or publisher | Private unless deliberately published | Insider/Reporter |
| ForumEntry | Canonical public question/discussion | Contributor/community | Public after publish | Member+ |
| Reply | Public response attached to Forum Entry | Contributor/community | Public after publish | Member+ |
| NotificationRule | Trigger, channel, timing, cap and safety state | User | Private | Member/Insider |
| NotificationEvent | Generated event and delivery status | User/system | Private | Member/Insider |
| Entitlement | Member/Insider/Pro access and limits | Account/platform | Private | Account |
| UsageLedger | Feature usage, resets and credits | Account/platform | Private | Insider/Pro |
| ConsentRecord | Marketing, notification, AI memory, sharing and safety choices | User/platform | Private | All accounts |
| SupportCase | Issue, evidence and operational handling | User/support | Private, least privilege | All |

## 17.1 Ownership Rules

- Canonical lottery facts are publisher-governed public records, not member objects.
- Saved objects belong to the user and remain private by default.
- A public share is a separate publication event, not a visibility flag casually applied to the private record.
- Community contributions belong to the member as authored content but are governed by public-thread integrity and moderation policy.
- Reporter content is governed by editorial policy.
- AI reports retain source and tool lineage; payment does not transfer rights to underlying third-party data.

# Part 18 — Error, Empty and Limit States

| State | Required experience | Must not happen |
| --- | --- | --- |
| No saved games | Show state/game chooser and explain follow value; keep public results nearby. | Generic upgrade modal or empty grid. |
| No saved numbers | Offer enter, generate or check one set; explain privacy. | Calling a set a ticket or implying automatic purchase. |
| Alert disabled | Show cause: user setting, permission, invalid email/device, promotional pause or retired game. | Repeated browser permission prompts. |
| AI limit reached | Show used/remaining/reset, preserve prompt and offer deterministic/public fallback. | Pretending a system error is a paywall. |
| Insider preview | Show supported inputs, sample, exact entitlement and preserved work. | Hiding the feature or using vague ‘unlock more.’ |
| Payment failure | Grace/read-only state, update method, retry and cancel; private work preserved. | Locking claim/safety or deleting data. |
| Expired trial | Read-only advanced work, export/delete, clear plan options. | Surprise auto-charge or immediate deletion. |
| Export rights unavailable | Explain which rights/fields block export and offer visible on-page analysis or permitted subset. | Generating a partial file without disclosure. |
| Incomplete historical data | Show coverage profile, suppress unsupported metrics, allow valid rows. | Using current price/payout rules retroactively. |
| Notification delivery failure | In-app durable event, reason and fix path; avoid duplicate spam. | Silently dropping a potential match alert. |
| Account under review | State affected actions, reason category, expected process and appeal path without exposing abuse controls. | Blocking public results, claim or safety help. |
| Deleted/retired game | Preserve historical records, mark status, disable future alerts/Buy and suggest successor only when official. | Redirecting history to an unrelated current game. |
| Result pending | Show pending status/source and wait for verification; saved checks remain queued conceptually. | Model-guessing numbers or sending ‘no win’ early. |
| Corrected result | Mark prior output superseded, re-run affected checks, notify impacted users without hype. | Silent overwrite. |
| Unsupported ticket image | Preserve image privately only with consent; offer manual entry and deletion. | Claiming no win from poor OCR. |
| Over storage limit | Read-only oldest advanced objects; allow delete/export/upgrade. | Automatic deletion or public exposure. |
| Community moderation hold | Keep draft private, explain policy category and appeal route. | Publishing then hiding without notice where avoidable. |
| Private share warning | Exact public preview with sensitive-field detection. | One-click public toggle. |
| Official source conflict | Show both source states, last checked, uncertainty and correction workflow. | Choosing the more exciting value. |

# Part 19 — Measurement

## 19.1 Acquisition

- registration conversion after completed public value;
- source page and completed task before registration;
- AI-answer-to-registration;
- configured-alert-to-registration;
- Community draft-to-registration;
- tool-preview-to-registration;
- public archive query-to-registration;
- percentage of registrations with a preserved object versus generic sign-up.

## 19.2 Member Activation

Activation is achieved when a Member completes at least one durable loop within seven days:

- first saved game/state;
- first saved number set;
- first activated result/match alert;
- first published Forum Entry/reply;
- first saved AI continuation;
- first return after a followed draw;
- first saved tool/archive query.

Track time-to-first-value and time-to-first-return, not only profile completion.

## 19.3 Insider Conversion

- capability/context that triggered preview;
- preview → configured job → run/upgrade;
- work-preservation success;
- trial usage and successful-output rate;
- limit encounters by feature;
- conversion by Archive Explorer, System Lab, reports, alerts, AI or storage;
- monthly versus annual choice;
- cancel/downgrade reason;
- payment failure recovery;
- proportion upgrading for ad expectations—used to test whether ad-light matters.

## 19.4 Retention

- draw-cycle return by followed game;
- weekly/monthly active Members and Insiders;
- alert-driven return with task completion;
- saved-number checks per active set;
- system version/report continuation;
- Archive Explorer repeat use;
- Community reply and human first-response return;
- AI conversation/workspace continuity;
- percentage of notifications retained versus disabled after 30/90 days.

## 19.5 Monetization and Cost

- ad revenue and interruption rate by access/page sensitivity;
- qualified affiliate click and downstream-confirmed conversion where available;
- paid report/export revenue;
- subscription/credit revenue;
- AI/tool cost per successful output and per retained user;
- support cost by feature/tier;
- gross margin after AI, data rights, payment fees and support;
- refund/credit rate for failed jobs.

## 19.6 Trust and Safety

- promotional suppression activations and successful enforcement;
- complaint rate by ad/affiliate/AI surface;
- accidental public sharing and reversal;
- ticket-image redaction failure rate;
- result/AI correction rate and affected-user notification time;
- unsupported official-validation language incidents;
- cancellation completion time and complaint rate;
- moderation appeals and overturn rate;
- Responsible Play control engagement and marketing-suppression failures.

## 19.7 North-Star Set

Do not optimize only for time spent or ticket-purchase clicks. Use a balanced set:

1. **Trusted draw-cycle returners** — users who return for a relevant result/reply/change and complete a task.
2. **Durable member activation** — members with a saved object plus a return trigger.
3. **Successful advanced jobs** — Insider outputs delivered accurately within cost/rights constraints.
4. **Human community health** — human response, helpfulness and retention, not synthetic volume.
5. **Trust-adjusted revenue** — revenue net of complaints, refunds, suppression failures and support cost.

# Part 20 — Phased Roadmap

## 20.1 Roadmap Matrix

| Capability | Phase | Dependencies | Risk | Success metric |
| --- | --- | --- | --- | --- |
| Identity, sign-up/sign-in and My LotteryCorner shell | 1 | Route/redirect audit; privacy/settings | Legacy `/insider` migration | Registration after value; successful preserved work |
| Follow games/states and personal next draws | 1 | Canonical game/state identity | Over-personalized clutter | First follow and draw-cycle return |
| SavedNumberSet + deterministic future checks | 1 | Rule-era results and correction pipeline | Incorrect match notification | Saved-set activation and accurate check rate |
| Basic result/jackpot/reply/news notifications | 1 | Notification service, consent, deep links | Spam/duplicates | Opt-in retention and task completion |
| Community posting/following/profile basics | 1 | Final Community objects/moderation | Empty or unsafe community | Human first replies and contributor retention |
| Limited AI, history and explicit preferences | 1 | Tool routing, source registry, controls | Cost/privacy confusion | Useful answer rate and save/return |
| Basic saved tools/tax/archive query history | 1 | Canonical tools/archive | Dashboard overload | First saved tool/query |
| Insider Preview labels and usage meter | 2 | Entitlement service and analytics | Unclear value | Configured-preview-to-run intent |
| Multi-year Archive Explorer | 2 | Complete history, rights, coverage profiles | Incorrect cross-era analysis | Successful multi-year jobs and repeat use |
| System Lab, versions and limited backtests | 2 | Deterministic methods, coverage | Prediction/ROI misuse | Saved systems and report completion |
| Advanced generators, batch checks, portfolio analyzer | 2 | Private object model, imports/redaction | Privacy and cost | Successful batch jobs and retained objects |
| Research workspaces, reports and custom alerts | 2 | AI orchestration, sources, schedules | AI cost/support | Workspace retention and cost per output |
| Billing, trials, monthly/annual Insider | 3 | Pricing test, entitlements, tax/payment, cancellation | Conversion/cancellation friction | Paid conversion, churn, support and margin |
| Usage credits and one-time reports | 3 | Usage ledger/refunds | Complexity | Credit clarity and gross margin |
| Reduced-interruption/ad-light experiment | 3 | Ad economics and product experiments | Cannibalization/confusion | Net revenue and satisfaction |
| Commercial CSV/API and correction feed | 4 | Rights, SLA, auth, support | B2B distraction/data liability | Contract revenue and reliability |
| Embedded widgets/high-usage research | 4 | Licensing and developer platform | Brand/source misuse | Qualified business adoption |

## 20.2 Phase Definitions

### Phase 1 — Free Member Foundation

Launch only the loops needed to make registration useful: identity, save/follow, deterministic saved-number checks, basic alerts, Community participation, basic AI history, limited saved tools and a compact My LotteryCorner home.

**Exit gate:** Members return after a draw/reply at meaningful rates; match checks and notifications are accurate; privacy/support operations are stable.

### Phase 2 — Insider Preview and Advanced Tools

Expose advanced tools publicly, run Insider Preview with controlled cohorts/limits, and build Archive Explorer, System Lab, batch checking, research workspaces and custom alerts.

**Exit gate:** repeated use and willingness-to-pay signals justify billing; AI/data cost per successful job is understood; no material prediction/privacy issue.

### Phase 3 — Paid or Usage-Based Monetization

Introduce simple subscription options, trial/expiry, credits for expensive jobs, one-time reports/exports and any reduced-interruption experiment.

**Exit gate:** positive gross margin, clear cancellation, manageable support and trust-adjusted retention.

### Phase 4 — Data/API and Higher-Usage Products

Separate commercial CSV/API, correction feeds, embedded widgets and professional/high-volume research from consumer Insider.

**Exit gate:** rights, SLAs, developer support and commercial demand are independently viable.

# Part 21 — Risks and Mitigations

| Risk | Failure mode | Mitigation |
| --- | --- | --- |
| Overcomplicated dashboard | Trying to show every saved object and feature at once. | What Changed + two immediate modules; progressive disclosure; mobile prioritization. |
| Unclear Insider value | Generic ‘more features’ or AI-only positioning. | Contextual preview tied to the user's attempted expansion; personal workspace lead. |
| AI cost | Unlimited open-ended research and repeated generation. | Tool routing, explicit quotas, scope preview, caching governed facts, credits for high cost. |
| Excessive paywalls | Gating results, rules, archives or first useful answer. | Constitutional public-value tests and entitlement QA. |
| Weak conversion | Member/Insider asks appear before investment. | Preserve created work and trigger after demonstrated value. |
| Ad conflict | Ads obscure results, resemble controls or compete with affiliate CTA. | Protected zones, reserved placement, Better Ads review, page-sensitivity tiers. |
| Affiliate pressure | Revenue ranks purchase above safety/relevance. | Deterministic eligibility/suppression, disclosure and trust-adjusted metrics. |
| Privacy leakage | Saved sets/tickets/AI chats become public or enter URLs/ads. | Separate objects, private defaults, exact share preview, no private personalization in public HTML. |
| Community misuse | Scams, guru claims, harassment, doxxing, link spam. | Rate/reputation controls, moderation, no unrestricted DMs, role labels and appeals. |
| Incorrect historical analysis | Cross-era balls/prices/payouts or incomplete data. | Rule-era and completeness profiles, deterministic tools, blocked financial ROI and source links. |
| Responsible Play harm | Near-miss pressure, loss chasing or persistent Buy prompts. | Suppression rules, non-shaming controls, notification separation and audits. |
| Support burden | Too many complex tools, billing states and data disputes for a small team. | Phased launch, self-service explanations, automation and narrow human escalation. |
| Cancellation friction | Hard-to-find cancel, surprise renewal or lost work. | In-product plan management, pre-renewal clarity, read-only downgrade grace and reason tracking. |
| Entitlement drift | Different pages describe free/Member/Insider differently. | One centralized product entitlement registry and automated content QA. |
| Paid-status credibility | Insider badge mistaken for expert/moderator status. | Do not make paid badge a reputation signal; verified roles separate. |
| Source-control gaps | Missing final architecture/shell version creates divergent wireframes. | Resolve document registry before UI sign-off; versioned amendment process. |
| Legacy claims | Existing ‘increase chances’ and placeholder proof undermine new trust promise. | Content migration audit and constitutional copy review before launch. |

## 21.1 Small-Team Support and Operations Model

| Issue | Automation | Human owner |
|---|---|---|
| Sign-in/recovery/notification troubleshooting | Guided diagnostics, device/email status, self-service reset | Technical support only after failed automation |
| AI answer feedback | Capture source, answer, tool trace and reason | Product/data review for repeated/high-risk errors |
| Archive-data correction | Structured report linked to draw/source; duplicate detection | Data steward/editor verifies and publishes correction |
| Community report/appeal | Triage spam/scam/privacy categories | Moderator owns severe action and appeal |
| Ticket-image privacy | Automated sensitive-field detection and immediate user delete | Privacy/security reviewer for confirmed exposure |
| Billing/usage limit | Visible meter, invoices, retry/cancel and failed-job credit rule | Billing support for exceptions/refunds |
| Claim/tax/high-consequence content | Official-source routing and disclaimers | Reporter/editor or qualified escalation; no personalized professional advice |
| Responsible Play control | Immediate automated suppression | Human support only when user requests assistance; never sales |

### Operating principle

Launch no capability that requires continuous manual interpretation for ordinary use. Human review is reserved for corrections, appeals, privacy/security, editorial accountability, billing exceptions and high-consequence safety—not every AI or tool output.

# Part 22 — Final Decisions Required from Founder

1. **Private member-home route:** retain `/insider` as canonical, redirect to `/my-lotterycorner`, or choose another route after audit.
2. **Insider paid-launch timing:** remain free during Phase 2 Preview or charge selected features earlier.
3. **Insider ad treatment:** protected workflows only, additionally reduced density, or future ad-light add-on.
4. **Paid packaging:** subscription only versus subscription plus report/usage credits.
5. **Trial design:** feature-specific free runs (recommended) versus time-based all-access trial.
6. **Initial Member/Insider storage and AI quotas:** approve the configurable guardrails in Parts 5 and 10 or set alternatives.
7. **CSV/PDF policy:** which annual/basic exports remain public or Member, subject to rights review.
8. **PurchasedTicketRecord launch:** launch manual records in Phase 2 or defer all ticket-like records until stronger privacy/image workflows exist.
9. **Public Insider badge:** private entitlement only (recommended) or optional public profile badge with no reputation weight.
10. **Promotional pause scope for anonymous users:** session-only (minimum) versus device cookie/local preference with longer duration.
11. **Source package correction:** locate/approve the final Experience Architecture and final Global Shell copy before wireframes are frozen.
12. **Legacy copy remediation:** approve removal/rewrite of “increase chances,” unverified winning claims and placeholder testimonials before Member/Insider launch.

# Part 23 — Source Register

## 23.1 Attached Project Sources

| ID | Title | Publisher | URL/location | Accessed | Supported finding | Source type | Authority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I01 | Member and Insider project brief | LotteryCorner/LuckReGenerator founder input | Attached `Pasted text(1).txt` | Jul 25, 2026 | Required scope, founder decisions, journeys, matrices and deliverable | Founder brief | Highest for this task |
| I02 | LuckReGenerator Product Constitution v2.1 | LotteryCorner | Attached `00A-v2.1-luckregenerator-product-constitution-FROZEN.md` | Jul 25, 2026 | Binding product principles, authority hierarchy, public value, AI, community, ads, Insider | Frozen constitution | Highest after explicit founder decision |
| I03 | LotteryCorner Player Behavior, Engagement and AI Experience Research | LotteryCorner | Attached `00B-lottery-player-behavior-engagement-and-ai-experience-research(1).md` | Jul 25, 2026 | Personas, draw-cycle behavior, systems, community, AI and monetization evidence | Internal research | High |
| I04 | LotteryCorner State Lottery Search & SEO Research | LotteryCorner | Attached `00-search-seo-research.md` | Jul 25, 2026 | Intent families, public utility, trust and search journeys | Internal research | High |
| I05 | LotteryCorner AI Search, GEO and Retrieval Research | LotteryCorner | Attached `01-ai-search-geo-research.md` | Jul 25, 2026 | Retrieval, provenance, crawler-purpose and public/private boundaries | Internal research | High |
| I06 | Global Shell and Section Library Blueprint | LotteryCorner | Attached package `02-global-shell-and-section-library-blueprint-package.zip` | Jul 25, 2026 | Shared shell, My LotteryCorner label, signed-in transformations | Proposed blueprint | Medium; subordinate to finals |
| I07 | Home Page Blueprint — Final Approved | LotteryCorner | Attached package `03-lotterycorner-home-page-blueprint-FINAL-APPROVED-package.zip` | Jul 25, 2026 | Anonymous/signed-in home sequencing and modules | Final blueprint | High |
| I08 | State Page Blueprint — Final Approved | LotteryCorner | Attached package `04-lotterycorner-state-page-blueprint-FINAL-APPROVED-package.zip` | Jul 25, 2026 | State following, saved checks, alerts and local page behavior | Final blueprint | High |
| I09 | Game Page Blueprint Index — Final Approved | LotteryCorner | Attached package `05-lotterycorner-game-page-blueprint-FINAL-APPROVED-package.zip` | Jul 25, 2026 | Game route families and shared rules | Final blueprint | High |
| I10 | Flagship Game Page Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Powerball/Mega Millions global page and saved-number behavior | Final blueprint | High |
| I11 | Jurisdiction Game Page Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Local offering, claim protection and stable URL behavior | Final blueprint | High |
| I12 | Tools and AI Insights Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Public tool visibility, access patterns, save/track and preview gating | Final blueprint | High |
| I13 | Yearly Results Archive Research — Final Approved | LotteryCorner | Attached package `06-lotterycorner-yearly-results-archive-FINAL-APPROVED-package.zip` | Jul 25, 2026 | Archive users, public completeness and research model | Final research | High |
| I14 | Yearly Results Archive Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Public archives, Ask Archive and Insider multi-year access | Final blueprint | High |
| I15 | Yearly Results Archive Content Template — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Content/provenance requirements | Final template | High |
| I16 | News and Editorial Engagement Research — Final Approved | LotteryCorner | Attached package `07-lotterycorner-news-editorial-FINAL-APPROVED-package.zip` | Jul 25, 2026 | Editorial engagement and trust | Final research | High |
| I17 | News Hub Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | News discovery/follow behavior | Final blueprint | High |
| I18 | News Article Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Reporter identity, correction timeline, protected ads | Final blueprint | High |
| I19 | Editorial Content Template — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Editorial object/content requirements | Final template | High |
| I20 | Community and Forum Engagement Research — Final Approved | LotteryCorner | Attached package `08-lotterycorner-community-forum-FINAL-APPROVED-package.zip` | Jul 25, 2026 | Human community, roles, safety and launch wedges | Final research | High |
| I21 | Community Home Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Community discovery and activity | Final blueprint | High |
| I22 | Forum Entry Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Canonical discussion object and AI/human behavior | Final blueprint | High |
| I23 | Community Profile and Reputation Blueprint — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | `/members/{username}`, identity/privacy, follow and reporter separation | Final blueprint | High |
| I24 | Community Content and Schema Template — Final Approved | LotteryCorner | Same attached package | Jul 25, 2026 | Content lifecycle and schema boundaries | Final template | High |

## 23.2 Current External Sources

| ID | Title | Publisher | URL | Accessed | Supported finding | Source type | Authority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W01 | Lottery Post Premium Memberships | Lottery Post | https://www.lotterypost.com/memberships | Jul 25, 2026 | Free membership prerequisite; Gold/Platinum history and utilities | Competitor primary | Medium |
| W02 | Gold and Platinum Membership Features | Lottery Post | https://www.lotterypost.com/features | Jul 25, 2026 | Wheels, filters, storage and premium community features | Competitor primary | Medium |
| W03 | Lottery Post Members | Lottery Post | https://www.lotterypost.com/members | Jul 25, 2026 | Free registration enables forums, predictions and blogs | Competitor primary | Medium |
| W04 | Check Your Numbers | Powerball | https://www.powerball.com/check-your-numbers | Jul 25, 2026 | Authoritative number-checking pattern | Official lottery | High |
| W05 | Random Number Generator | Mega Millions | https://www.megamillions.com/How-to-Play/Random-Number-Generator.aspx | Jul 25, 2026 | Official public generator pattern | Official lottery | High |
| W06 | Official California Lottery App | California Lottery | https://www.calottery.com/en/mobile-app | Jul 25, 2026 | Ticket scan, results, second chance and retailer features | Official state lottery | High |
| W07 | Illinois Lottery App / account features | Illinois Lottery | https://www.illinoislottery.com/help-center/faqs/making-illinois-lottery-purchases-online | Jul 25, 2026 | Anonymous utility versus signed-in purchase/history/alerts | Official state lottery | High |
| W08 | Virginia Lottery Mobile App | Virginia Lottery | https://www.valottery.com/aboutus/mobileapp?gameid=11605 | Jul 25, 2026 | Results, scanning, playslips, rewards and alerts | Official state lottery | High |
| W09 | Official New York Lottery App | New York Lottery | https://nylottery.ny.gov/ticket-check/ | Jul 25, 2026 | Ticket check, account, retailer and notifications | Official state lottery | High |
| W10 | Michigan Lottery Mobile App | Michigan Lottery | https://www.michiganlottery.com/resources/mobile-app | Jul 25, 2026 | Result access, scanning and account-linked features | Official state lottery | High |
| W11 | Florida Lottery App and Alerts | Florida Lottery | https://floridalottery.com/about/integrity | Jul 25, 2026 | Ticket scan, results and alert patterns | Official state lottery | High |
| W12 | How Jackpocket Works | Jackpocket | https://support.jackpocket.com/jp/en-us/how-does-jackpocket-work?id=kb_article_view&sysparm_article=KB0010074 | Jul 25, 2026 | Ticket image, automatic check and account continuity | Provider primary | Medium |
| W13 | Responsible Gaming Center | Jackpocket | https://rg.jackpocket.com/ | Jul 25, 2026 | Limits, history, cool-off/self-exclusion patterns | Provider primary | Medium |
| W14 | Responsible Play | Lotto.com | https://support.lotto.com/hc/en-us/articles/360059796834-What-is-Self-Exclusion | Jul 25, 2026 | Limits, self-exclusion and support patterns | Provider primary | Medium |
| W15 | How It Works / Responsible Gaming | Jackpot.com | https://www.jackpot.com/press/jackpotcom-launches-in-new-jersey | Jul 25, 2026 | Ticket scan, notification and user-control patterns | Provider primary | Medium |
| W16 | Internet Responsible Gambling Standards 2026 | National Council on Problem Gambling | https://www.ncpgambling.org/wp-content/uploads/2024/01/Internet-Responsible-Gambling-Standards-Rev.-12-2023-FINAL.pdf | Jul 25, 2026 | Accessible time-outs/self-exclusion, marketing suppression, no automatic resumption | Authoritative nonprofit standard | High |
| W17 | ChatGPT Pricing | OpenAI | https://openai.com/chatgpt/pricing/ | Jul 25, 2026 | Free and paid tiers differentiated by usage and advanced capabilities | Product primary | High |
| W18 | Memory FAQ | OpenAI | https://help.openai.com/en/articles/8590148-memory-faq | Jul 25, 2026 | View/delete/disable memory and personalization controls | Product primary | High |
| W19 | Data Controls FAQ | OpenAI | https://help.openai.com/en/articles/7730893-data-controls-faq | Jul 25, 2026 | Export, temporary chat and data controls | Product primary | High |
| W20 | Claude Plans and Pricing | Anthropic | https://www.anthropic.com/pricing | Jul 25, 2026 | Free/Pro/Max usage and advanced capability tiers | Product primary | High |
| W21 | Gemini Apps limits and upgrades | Google | https://support.google.com/gemini/answer/16275805 | Jul 25, 2026 | Visible plan-based usage limits and resets | Product primary | High |
| W22 | Perplexity Pro / Spaces and Tasks | Perplexity | https://www.perplexity.ai/pro | Jul 25, 2026 | Higher research usage, projects/files and scheduled tasks | Product primary | Medium–High |
| W23 | Following on Substack | Substack | https://support.substack.com/hc/en-us/articles/15557763070740-What-does-following-mean-on-Substack | Jul 25, 2026 | Lightweight follow before subscription | Product primary | Medium |
| W24 | Manage Reddit notifications | Reddit Help | https://support.reddithelp.com/hc/en-us/articles/360043034552-How-do-I-opt-in-or-out-of-notifications | Jul 25, 2026 | Independent category/channel notification controls | Product primary | Medium |
| W25 | Saved Routes and subscription features | Strava Support | https://support.strava.com/hc/en-us/articles/216918387-Routes | Jul 25, 2026 | Free saved continuity with subscriber depth | Product primary | Medium |
| W26 | Stathead Subscription Plans | Sports Reference | https://faq.sports-reference.com/portal/en/kb/articles/subscription-plans | Jul 25, 2026 | Pricing of advanced historical database search | Product primary | High |
| W27 | How to Download Data | Sports Reference | https://faq.sports-reference.com/portal/en/kb/articles/how-to-download-data | Jul 25, 2026 | Paid query result exports and public table export pattern | Product primary | High |
| W28 | Disclosures 101 for Social Media Influencers / Native Advertising guidance | U.S. Federal Trade Commission | https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers | Jul 25, 2026 | Clear, conspicuous and hard-to-miss material relationship disclosure | Government guidance | High |
| W29 | Better Ads Standards | Coalition for Better Ads | https://www.betterads.org/standards/ | Jul 25, 2026 | Avoid disruptive and deceptive ad formats | Industry standard | Medium–High |
| W30 | Cancel, pause, or change a subscription on Google Play | Google Play Help | https://support.google.com/googleplay/answer/7018481 | Jul 25, 2026 | Clear subscription cancellation and renewal expectations | Platform primary | High |
| W31 | Lottery Corner Register | LotteryCorner.com | https://www.lotterycorner.com/insider/register | Jul 25, 2026 | Existing `/insider/register` route and legacy value claims | First-party current site | High for current implementation |
| W32 | Lottery Corner Insider Login | LotteryCorner.com | https://www.lotterycorner.com/insider/login | Jul 25, 2026 | Existing `/insider/login` route | First-party current site | High for current implementation |
| W33 | Lottery Results Feed API | LotteryResultsFeed.com | https://www.lotteryresultsfeed.com/api-docs/introduction | Jul 25, 2026 | Independent current/historical lottery API market example | Vendor primary | Low–Medium; claims require verification |

---

# Closing Assessment

## Overall Recommendation

Launch **Member** as the free continuity layer and **Insider** as a visible advanced workspace inside the same public pages. Lead with **My LotteryCorner**—games, numbers, checks, alerts, conversations and discussions saved for the next relevant event. Use advanced history, System Lab, reports, automation and higher AI limits as the reasons to upgrade. Keep public results, rules, ordinary news/community and complete yearly archives useful and indexable. Keep ads, but protect sensitive and paid workflows. Separate any future commercial data/API product from consumer Insider.

## Changes or Decisions Requiring Founder Approval

The explicit approval list is in Part 22. The highest-priority choices are the private route, Phase 2 free-versus-paid timing, Insider ad treatment, paid packaging/trials, export rights and whether PurchasedTicketRecord launches in Phase 2.

## Gaps in the Attached Source Documents

1. Missing final-approved Experience Architecture document.
2. Uploaded Global Shell is proposed although later documents reference a final-approved version.
3. No approved final private Member Home route or legacy redirect decision.
4. No current data-rights register for CSV/PDF/API exports.
5. No approved pricing, billing, refund or trial policy.
6. No approved quantitative AI/storage limits; this blueprint supplies configurable recommendations.
7. No official ticket-validation/scanning integration contract.
8. No supplied first-party analytics, AI cost, ad yield, affiliate conversion, support-volume or user-research dataset.
9. Legacy site copy and current `/insider` pages conflict with the frozen no-prediction/trust standard and require migration review.

## Readiness Assessment for Wireframing

**READY WITH TWO DOCUMENT-CONTROL CONDITIONS.** The product decisions, module priorities, page transformations, access matrix, objects, notifications, privacy, errors and roadmap are sufficiently defined for exact Member Home, signed-in public-page and upgrade-flow wireframes. Before those wireframes are declared final implementation authority:

- recover/approve the missing final Experience Architecture and Global Shell version; and
- resolve the private canonical route/legacy `/insider` redirect strategy.

Pricing screens may be wireframed as variable plans and states, but no dollar price should be frozen yet.

## Suggested Final Filename

`09-lotterycorner-member-and-insider-experience-research-and-blueprint.md`
