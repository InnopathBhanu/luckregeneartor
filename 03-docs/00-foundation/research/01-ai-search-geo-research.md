# LotteryCorner AI Search, GEO and Retrieval Research

## Document Control

| Field | Value |
|---|---|
| Document | `01-ai-search-geo-research.md` |
| Project | LotteryCorner.com rebuild |
| Document type | Architecture and search-retrieval research record |
| Status | Research complete; requires periodic evidence refresh |
| Version | 1.0 |
| Research date | July 20, 2026 |
| Retrieval date for web evidence | July 20, 2026 |
| Primary geographic scope | United States |
| Primary product scope | State lottery information, with transferable principles for game, result, news, statistics, scratcher, community and affiliate information |
| Accepted predecessor | `00-search-seo-research.md` |
| Intended readers | SEO specialists, product architects, developers, data engineers, editors, trust and safety reviewers, AI-agent developers |
| Explicit exclusions | State-page blueprint, final page sections, UI design, page copy, HTML, React, JSON-LD implementation, final robots.txt, sitemap files, database design, API payloads and agent design |

### Evidence status vocabulary

This document uses the following evidence labels consistently:

- **FACT** — A directly verifiable fact about a source, product, standard or observed document.
- **DOCUMENTED PLATFORM GUIDANCE** — A platform’s own public statement about its products, controls or recommendations.
- **OBSERVATION** — A reproducible observation, including credible experiments, but not an official platform guarantee.
- **INFERENCE** — An architectural conclusion reasonably derived from documented mechanisms.
- **RECOMMENDATION** — A proposed research-level direction for LotteryCorner.
- **OPEN QUESTION** — A material issue that is not sufficiently documented or must be resolved in later research.

Evidence strength is classified as:

| Classification | Meaning |
|---|---|
| **Documented** | Explicitly stated by an authoritative platform, standards body or primary source |
| **Strongly evidenced** | Repeatedly observed through credible research with disclosed methods |
| **Inferred** | A reasonable architectural inference from documented behavior |
| **Unverified** | A common claim that lacks adequate evidence |
| **Speculative** | A possible future development, not an established current requirement |

---

## Executive Summary

### Core conclusion

**RECOMMENDATION — High confidence**

LotteryCorner should not treat “GEO” as a separate collection of publishing tricks. It should build one governed information system that serves users, conventional search, live AI retrieval, browser agents and internal tools through the same accurate, crawlable, well-identified and source-backed facts.

The strongest common requirements across Google Search, Google’s generative Search features, ChatGPT search, Bing/Copilot, Claude web search and Perplexity are not fixed answer lengths, universal FAQ blocks or AI-only files. They are:

- reliable public access;
- stable and discoverable URLs;
- readable primary content;
- precise entity and temporal context;
- original information rather than commodity rewriting;
- explicit provenance;
- truthful freshness signals;
- clear separation of fact, analysis, community opinion and commercial material;
- resilient source and correction processes; and
- evidence that a user or retrieval system can follow to the underlying record.

Google now states directly that AEO and GEO are industry terms and that, from Google Search’s perspective, optimizing for generative Search remains SEO. Google also says that Google Search ignores `llms.txt`, does not require AI-specific schema, does not require artificial “chunking” and does not prescribe an ideal page length. [G-AI-GUIDE]

### The most important technical distinction

**FACT — Documented**

The following are separate activities and may use separate agents, controls and data paths:

1. **Crawling for a search index**
2. **Indexing and eligibility for conventional search**
3. **Retrieval for a live AI answer**
4. **Grounding from an existing search index**
5. **User-triggered fetching of a specific page**
6. **Training-data collection**
7. **Agent/browser interaction**
8. **Preview generation or link unfurling**

OpenAI documents separate agents for ChatGPT search (`OAI-SearchBot`), potential model training (`GPTBot`) and user-initiated visits (`ChatGPT-User`). Anthropic documents `Claude-SearchBot`, `ClaudeBot` and `Claude-User`. Perplexity documents `PerplexityBot` and `Perplexity-User`. Google uses Googlebot for Google Search and its AI Search features, while `Google-Extended` is a separate robots product token affecting certain Gemini training and grounding uses without affecting Google Search inclusion or ranking. [OAI-BOTS] [ANT-BOTS] [PPLX-BOTS] [G-GOOGLE-EXTENDED]

Therefore:

- blocking a training crawler does **not** necessarily block live search retrieval;
- allowing a search crawler does **not** guarantee inclusion, ranking or citation;
- blocking a crawler with `robots.txt` is not equivalent to authentication;
- a user-directed fetcher may be treated differently from an automatic crawler;
- a URL can sometimes be known and linked even when its page content cannot be crawled;
- a CDN or WAF can accidentally defeat publisher intent by challenging or blocking legitimate bots before they read `robots.txt`.

### LotteryCorner’s defensible opportunity

**INFERENCE — High confidence**

Commodity winning numbers are necessary but rarely sufficient to make an independent publisher worth citing. The strongest cite-worthy assets are likely to be:

1. draw-level records with source, verification status and correction history;
2. normalized historical result datasets;
3. reproducible statistics tied to the underlying records;
4. state-specific claim-rule normalization with effective dates;
5. state purchase-availability records distinguishing official, courier and affiliate channels;
6. scratcher prize-inventory snapshots over time;
7. unclaimed-prize and rule-change monitoring;
8. a governed official-source registry;
9. resilient, accessible presentation during official-site failures; and
10. AI synthesis grounded in LotteryCorner’s own traceable data rather than generic generated prose.

### What structured data can and cannot do

**DOCUMENTED PLATFORM GUIDANCE — High confidence**

Structured data can help search systems understand content and may make pages eligible for supported search features. Google explicitly states that structured data is not required for its generative Search features and that there is no special AI schema. Markup must describe visible content. JSON-LD cannot substitute for readable page content, cannot correct contradictory visible facts and does not cause citation by itself. [G-STRUCTURED-DATA] [G-AI-GUIDE]

### What `llms.txt` can and cannot do

**FACT — High confidence**

`llms.txt` is a community proposal, not an IETF, W3C or Schema.org standard. Some documentation systems publish it, and Perplexity’s developer documentation exposes one as a documentation index. Google Search states that it ignores `llms.txt`; maintaining one neither helps nor harms Google Search visibility. No authoritative evidence was found that it is a general ranking or citation signal across major consumer answer engines. [LLMSTXT] [G-AI-GUIDE] [PPLX-BOTS]

**PRELIMINARY RECOMMENDATION**

Classify `llms.txt` as **optional and experimental**, not essential. Reconsider only if a target platform documents a concrete use that LotteryCorner can test and maintain without creating a second, conflicting content surface.

### Governance implication

**RECOMMENDATION — High confidence**

LotteryCorner should preserve the predecessor document’s trust tiers, freshness categories, content classes, lottery entities and official/editorial/community/commercial boundaries, but extend them with an **access-purpose dimension**:

- Search indexing
- AI search retrieval
- Model training
- User-directed retrieval
- Agent action
- Preview generation

This dimension is necessary because a single “AI bot allowed/blocked” decision is technically inaccurate.

---

## Relationship to 00-search-seo-research.md

The accepted predecessor remains the foundation for:

- search-intent families;
- user personas;
- task-chain journeys;
- trust tiers;
- content classes;
- freshness categories;
- draw-level provenance;
- lottery entity concepts;
- canonical information objects;
- official/editorial/community/commercial boundaries; and
- the principle that a state-lottery presence is a governed entity ecosystem rather than one generic article.

This document does not reproduce the predecessor’s intent taxonomy or competitor research. It extends that work into retrieval, AI-search access, citations, entities, provenance, standards, AI governance and measurement.

### Confirmed predecessor findings

| Prior finding | Current status | Evidence |
|---|---|---|
| Google’s generative Search features rely on foundational SEO | Confirmed | Google says they are rooted in core Search ranking and quality systems. [G-AI-GUIDE] |
| Google does not require special AI schema | Confirmed | Google explicitly states structured data is not required for generative Search and no special schema is needed. [G-AI-GUIDE] |
| `llms.txt` is not required for Google Search visibility | Confirmed and strengthened | Google explicitly states Google Search ignores it. [G-AI-GUIDE] |
| Mass query-variation pages are not a sound GEO strategy | Confirmed | Google warns that creating separate content for every query variation to manipulate rankings or generative responses may violate scaled-content policies. [G-AI-GUIDE] [G-SPAM] |
| Draw-level provenance and correction handling are core differentiators | Strengthened by cross-platform retrieval analysis | Retrieval systems can reuse passages out of context; precise state, game, draw, time and status reduce extraction error. |
| Facts, analysis, community and affiliate material require visible separation | Confirmed and expanded | Google’s UGC and spam policies, affiliate-link guidance and platform citation limitations support distinct trust boundaries. [G-DISCUSSION] [G-SPONSORED] [G-SPAM] |

### Scope correction introduced by this document

**FACT**

The predecessor appropriately summarized Google’s position, but some wording could be read as applying universally to “AI search.” That scope must be narrowed.

Google’s statement that `llms.txt` is unnecessary applies to **Google Search**. It does not prove that no other product reads such files. Conversely, the existence of an `llms.txt` file in a documentation platform does not prove ranking or citation benefit.

**RECOMMENDATION**

Future research must state the product concerned, the access path and the evidence class instead of generalizing from one platform to all AI systems.

---

## Research Method

### Research questions

The research investigated:

1. How major search and AI products publicly document web discovery, crawling, indexing, retrieval, grounding and citations.
2. Which crawler and publisher controls apply to each use.
3. Which proposed AI-specific standards have credible platform support.
4. Which content characteristics improve user comprehension, conventional search eligibility, retrieval precision and provenance.
5. How lottery entities and temporal states should be represented to reduce wrong-answer risk.
6. What original information would make LotteryCorner worth retrieving or citing.
7. How commercial, community and AI-generated information should be governed.
8. What first-party and estimated measurements can reveal about generative-search visibility.

### Source hierarchy applied

1. Official platform documentation
2. Standards bodies and protocol documents
3. Published research papers and disclosed experiments
4. Reputable practitioner or infrastructure-provider analysis
5. Anecdotal claims, only when explicitly labeled

### Research boundaries

- No attempt was made to infer private ranking algorithms.
- No citation frequency tests were run against live products.
- No crawler was intentionally blocked or allowed on LotteryCorner.
- No Search Console, Bing Webmaster Tools, server-log or analytics data was available.
- Product behavior may differ by geography, account, model, paid tier, experiment cohort and date.
- Documentation describes intended controls, not a legal guarantee or proof that every request is correctly identified.
- Citation display does not prove that the cited source fully supports every generated statement.

### Time-sensitive evidence register

| Product or feature | Source date/update | Retrieved | Known scope limitation |
|---|---:|---:|---|
| Google generative Search optimization guide | Last updated July 10, 2026 | July 20, 2026 | Google Search, including AI Overviews and AI Mode; not every Gemini product |
| Google common crawler documentation / Google-Extended | Last updated July 14, 2026 | July 20, 2026 | Google crawler infrastructure; product-token behavior can change |
| Google Search Console Generative AI report | Published June 3, 2026 | July 20, 2026 | Availability depends on Search Console property and feature eligibility |
| OpenAI crawler documentation | Current documentation; exact page date not exposed | July 20, 2026 | ChatGPT products and agents described by OpenAI |
| OpenAI publisher FAQ | Updated approximately July 15, 2026 | July 20, 2026 | References ChatGPT search and ChatGPT Atlas; product rollout may vary |
| Anthropic crawler documentation | Published/updated April 7, 2026 | July 20, 2026 | Anthropic’s documented bots; search availability varies by plan/model |
| Claude web-search help | Current page; exact update date not exposed | July 20, 2026 | Model and plan availability varies; image search is described as Bing-powered |
| Bing AI Performance report | Published February 10, 2026 | July 20, 2026 | Public preview; reports citations in Microsoft AI experiences and partners |
| Google Search grounding for Gemini API | Updated July 6, 2026 | July 20, 2026 | Developer API; not identical to consumer Google Search or Gemini Apps |
| Perplexity crawler documentation | Current documentation; exact update date not exposed | July 20, 2026 | Perplexity products described; user-directed fetch generally ignores robots.txt |
| Cloudflare managed robots and AI Crawl Control | Updated July 1, 2026 | July 20, 2026 | Cloudflare-specific controls; not universal web standards |
| RFC 9309 Robots Exclusion Protocol | Published September 2022 | July 20, 2026 | Protocol standard; not access authorization |
| W3C PROV-O | W3C Recommendation April 30, 2013 | July 20, 2026 | General provenance ontology, not an SEO ranking standard |

---

## Source and Evidence Classification

### Major evidence findings

| Finding | Classification | Rationale |
|---|---|---|
| Google AI Overviews and AI Mode rely on Google Search systems and Search indexing eligibility | Documented | Explicit Google Search Central guidance |
| Google Search ignores `llms.txt` | Documented | Explicit Google statement |
| OpenAI separates search, training and user-action agents | Documented | Official crawler documentation |
| Anthropic separates search, training and user-directed agents | Documented | Official help documentation |
| Perplexity separates automatic search crawling and user-directed retrieval | Documented | Official crawler documentation |
| A crawler allow rule guarantees citation | Unsupported | Every platform retains selection and ranking discretion |
| Citations guarantee factual support | Strongly contradicted | Academic evaluations have found citation completeness and correctness limitations |
| Self-contained passages may reduce extraction ambiguity | Inferred | Consistent with passage retrieval and user comprehension, but not a platform ranking guarantee |
| A graph database increases Google rankings | Unsupported | Knowledge graphs are an architecture option, not a documented ranking requirement |
| Original, non-commodity information is more defensible than rewritten official facts | Documented for Google; inferred cross-platform | Google explicitly recommends non-commodity content; cite-worthiness across other engines is a logical inference |
| Robots compliance is equivalent to authentication | False | RFC 9309 states robots directives are not access authorization |

### Research discipline for future documents

Every platform-specific statement should include:

- product name;
- access purpose;
- crawler or mechanism;
- date;
- geography/tier limitation where known;
- evidence classification; and
- what remains unknown.

---

## Terminology

### Formal and semi-formal concepts

| Term | Working definition | Formal status |
|---|---|---|
| **Search engine optimization (SEO)** | Work that helps search engines understand content and helps users discover and choose it through search | Established industry discipline; Google formally documents it |
| **Information retrieval (IR)** | Selection and ranking of information objects relevant to an information need | Established academic and engineering field |
| **Crawling** | Automated fetching of resources to discover or refresh content | Established search-engine process |
| **Indexing** | Processing and storing representations of discovered content for later retrieval | Established search-engine process |
| **Retrieval** | Selecting documents, passages or records for a query or task | Established IR term |
| **Retrieval-augmented generation (RAG)** | Generation conditioned on retrieved external information | Established research term after Lewis et al.; implementations vary [RAG-PAPER] |
| **Grounding** | Connecting generated output to external evidence or data, often through retrieval | Widely used platform term; implementation-specific |
| **Citation** | A displayed reference connecting an answer or claim to a source | Common term; quality and granularity vary |
| **Attribution** | Identifying the creator, publisher or origin of information | Established publishing and provenance concept |
| **Recommendation** | A system suggesting an action, source, product or choice | General product term; may be generated from retrieval but is not equivalent to citation |
| **Provenance** | Information about origin, derivation, custody and transformations of a record or claim | Established data-governance concept; W3C PROV provides a formal vocabulary [W3C-PROV] |
| **Training-data inclusion** | Use of content in constructing or updating model parameters or training corpora | ML/data-governance concept; separate from live retrieval |
| **Live web search** | A product querying current web indexes or fetching current pages at answer time | Product capability, not one universal architecture |
| **Agent access** | A software agent fetching, interpreting or acting on a site for a user | Emerging product category; access paths differ |
| **Link preview/unfurling** | Fetching page metadata or content to generate a preview in another product | Established platform behavior; not search indexing |

### Industry terms without one accepted standard

#### Answer engine optimization (AEO)

AEO generally refers to making information easier for answer systems to select and present. It has no single standards-body definition, certification or universally accepted technical checklist.

#### Generative engine optimization (GEO)

The term was formalized in a 2023/2024 academic paper proposing an experimental framework for improving source visibility in generative-engine responses. That research does not establish production ranking factors for current Google, OpenAI, Microsoft, Anthropic or Perplexity systems. [GEO-PAPER]

Google now explicitly characterizes AEO and GEO as terms used for AI-search visibility work, while stating that for Google Search this work remains SEO. [G-AI-GUIDE]

#### AI search optimization

This is a useful umbrella term for work that supports discovery, retrieval, answer grounding, citation and agent access. It is not a formal protocol.

### Do GEO and AEO create genuinely different engineering requirements?

**FINDING**

Mostly, they overlap with strong SEO, information architecture, data quality, accessibility, entity management and provenance. However, AI-mediated answers add emphasis in four areas:

1. **Passage independence:** a retrieved passage may be separated from surrounding context.
2. **Evidence traceability:** users may see a synthesis of several sources.
3. **multi-entity synthesis:** the system may combine jurisdiction, game, date, rule and commercial availability.
4. **access-purpose controls:** training, search retrieval and user-directed fetching may use separate agents.

**LIMITATION**

No major platform publishes a complete formula for citation selection. These requirements improve correctness and eligibility; they do not guarantee AI visibility.

**PRELIMINARY RECOMMENDATION — High confidence**

Use “AI search and retrieval readiness” as an internal architecture concern. Do not create a separate content-production doctrine called GEO.

---

## Platform-by-Platform Research

## Google Search, AI Overviews and AI Mode

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

- Google’s generative Search features are rooted in core Search ranking and quality systems. [G-AI-GUIDE]
- Google describes RAG/grounding through its Search index and query fan-out across related searches. [G-AI-GUIDE]
- A page must be indexed and eligible to appear with a snippet to be eligible for generative Search features. Eligibility does not guarantee selection. [G-AI-FEATURES] [G-AI-GUIDE]
- Googlebot and ordinary Search controls govern Google’s AI features in Search. [G-AI-FEATURES]
- Publishers can limit displayed material with `nosnippet`, `data-nosnippet`, `max-snippet` and `noindex`. [G-AI-FEATURES] [G-ROBOTS-META]
- Google says `llms.txt`, AI-only markup, fixed chunking and AI-specific writing are unnecessary for Google Search. [G-AI-GUIDE]
- Structured data is not required for generative Search, but supported structured data remains useful for ordinary Search features. [G-AI-GUIDE]
- Google launched a dedicated Search Console Generative AI performance view on June 3, 2026. The data remains included in overall performance reporting. [G-SC-AI]
- `Google-Extended` does not affect Google Search inclusion or ranking. It is a control for certain Gemini training and grounding uses outside Google Search. [G-GOOGLE-EXTENDED]

### What remains unknown

- The private ranking, fan-out, passage-selection and citation-scoring algorithms.
- How individual citations are weighted or sequenced.
- Whether any one content characteristic causes selection.
- Exact feature availability for every US account, language, query and experiment cohort.
- How often retrieved passages are refreshed relative to the last crawl.
- The complete relationship between Google Search generative features and all consumer Gemini experiences.

### What publishers can control

- Googlebot crawl access.
- Indexability and snippet eligibility.
- Page-level and text-level preview controls.
- HTTP accessibility, rendering and performance.
- Canonicalization and duplicate reduction.
- Visible content, source labeling, dates, structured data consistency and corrections.
- Google-Extended preference for affected non-Search Gemini uses.

### What publishers cannot reliably control

- Crawl frequency, indexing, ranking, selection, generated wording, link placement or citation.
- Which related fan-out queries are issued.
- Whether the system combines LotteryCorner with competing sources.
- Whether a qualifying page appears for a given user.

### LotteryCorner implications

- Maintain the predecessor’s canonical state/game/draw model.
- Make primary facts public, crawlable and visible without requiring an interaction that Google cannot reliably render.
- Preserve state, game, draw variant, date, timezone and result status in any passage that could be retrieved independently.
- Use preview controls only after evaluating the traffic-versus-reuse trade-off.
- Treat Search Console’s generative report as first-party visibility evidence, not a full citation-quality or ranking report.

### Limitations and risks

- Google’s guide is product-specific; it cannot be generalized to all answer engines.
- Overusing `nosnippet` or `max-snippet` may reduce generative visibility as well as ordinary previews.
- Automatically changing dates can damage trust and make freshness signals unreliable.
- Query fan-out can retrieve supporting pages beyond the obvious landing page, so contradictory state/game facts anywhere in the ecosystem are a risk.

### Preliminary recommendation

**RECOMMENDATION — High confidence**

Optimize one coherent Search ecosystem. Do not build a Google-AI-only content layer.

---

## Gemini

Gemini must be separated into at least three contexts:

1. Gemini Apps
2. Gemini/Vertex AI products grounded with Google Search
3. Google Search’s own AI Overviews and AI Mode

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

- The Gemini API’s Google Search grounding can generate one or more search queries, retrieve current information and return grounding metadata and citations. [GEMINI-SEARCH-GROUNDING]
- URL Context may use an internal index cache and then attempt a live fetch where necessary. [GEMINI-URL-CONTEXT]
- Google-Extended controls whether Google-crawled content may be used for training future Gemini models and for grounding in specified Gemini/Vertex products. It does not affect Google Search. [G-GOOGLE-EXTENDED]

### What remains unknown

- The complete retrieval architecture of consumer Gemini Apps for every query.
- Whether a page allowed for Google Search but disallowed through Google-Extended will still be linked through all Gemini surfaces.
- Citation selection and refresh intervals.
- Feature differences by model, developer API, region and account.

### Publisher control

- Googlebot controls Google Search indexing.
- Google-Extended is the documented product token for affected Gemini training/grounding uses.
- Ordinary access controls, authentication and WAF rules still apply to direct fetching.

### What LotteryCorner should not assume

- Gemini Apps, Gemini API and Google AI Mode are not identical products.
- Google Search ranking does not guarantee Gemini citation.
- Google-Extended is not a separate HTTP crawler user-agent string; it is a robots product token applied to content crawled by existing Google agents.
- Allowing Google-Extended does not create a citation entitlement.

### Preliminary recommendation

**RECOMMENDATION — Medium-high confidence**

Record Google Search and Google-Extended decisions separately in the future crawler policy. The business owner should decide whether model-training/grounding reuse is acceptable without compromising Google Search eligibility.

---

## OpenAI and ChatGPT Search

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

OpenAI currently documents three distinct relevant agents:

| Agent | Documented purpose | Training use | robots.txt implication |
|---|---|---|---|
| `OAI-SearchBot` | Surface websites in ChatGPT search features | Not described as the training agent | Publishers should allow it for summary/snippet inclusion |
| `GPTBot` | Crawl content that may be used to improve/train foundation models | Yes | Disallowing signals exclusion from potential training |
| `ChatGPT-User` | Visit pages for user-initiated actions in ChatGPT or custom GPTs | Not an automatic web crawler | OpenAI states robots rules may not apply because the action is user initiated |

[OAI-BOTS]

OpenAI’s publisher FAQ states:

- any public website can appear in ChatGPT search;
- allowing `OAI-SearchBot` supports discovery, summaries, citations and links;
- a disallowed page may still appear as a navigational link/title if the URL is learned elsewhere;
- `noindex` is the documented control to prevent such surfacing, but the crawler must be allowed to read it;
- ChatGPT referral links include `utm_source=chatgpt.com`;
- accessibility and ARIA semantics can help ChatGPT’s browser agent interpret interfaces. [OAI-PUBLISHERS]

### What remains unknown

- ChatGPT’s private source-selection and ranking logic.
- The complete set of third-party search providers or discovery signals used by every ChatGPT surface.
- How quickly index changes propagate for all products beyond the approximately 24-hour robots adjustment stated for search crawling.
- Geographic and plan differences in every Search, Atlas or agent feature.
- Whether a given citation indicates independent retrieval, cached retrieval or third-party index discovery.

### What publishers can control

- Allow or block `OAI-SearchBot`.
- Independently allow or block `GPTBot`.
- Use `noindex` when they do not want a page surfaced, subject to crawlability of the directive.
- Use authentication for non-public content.
- Verify OpenAI-published IP ranges in WAF policies.
- Track referrals tagged by ChatGPT.
- Improve accessibility and explicit labels for browser-agent actions.

### What publishers cannot reliably control

- Inclusion, citation, wording, placement or recommendation.
- User-directed requests that may use `ChatGPT-User` under different robots semantics.
- URL discovery from third parties when content itself is disallowed.
- How a generated answer combines LotteryCorner with other sources.

### LotteryCorner implications

- A single `Disallow: /` for GPTBot must not be assumed to block ChatGPT Search.
- A blanket firewall rule against “OpenAI” could accidentally block the search agent while intending only to block training.
- High-risk information should not rely on a citation link alone; the retrieved passage should contain scope and status.
- ChatGPT referral analytics can be measured, but citation impressions without a click are not fully exposed by OpenAI.

### Preliminary recommendation

**RECOMMENDATION — High confidence**

Manage `OAI-SearchBot`, `GPTBot` and `ChatGPT-User` as separate access purposes. Verify both user agent and official IP data when creating WAF exceptions.


---

## Microsoft Bing and Copilot

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

- Bing uses `bingbot` for web crawling and documents crawler verification because user-agent strings are spoofable. [BING-CRAWLERS] [BING-VERIFY]
- Bing documents `MicrosoftPreview` for page snapshots in Microsoft products. [BING-CRAWLERS]
- Bing supports robots meta directives for indexing and content display. [BING-ROBOTS-META]
- Microsoft introduced `NOCACHE` and `NOARCHIVE` controls for Bing Chat/Copilot-era usage; their practical effect should be verified against current Bing documentation before implementation. [BING-COPILOT-CONTROLS]
- Bing Webmaster Tools launched an AI Performance public preview on February 10, 2026. It reports total citations, cited pages, grounding query samples and trends across Microsoft Copilot, Bing and partner experiences. Microsoft states that a citation count is not a rank or statement of importance/placement. [BING-AI-PERFORMANCE]
- Microsoft 365 Copilot can optionally send generated web queries to Bing to ground responses in current public information; availability and admin controls differ by plan and organization. [MS365-WEB-SEARCH]
- Azure AI/Foundry grounding tools can formulate queries, run Bing searches, synthesize results and include citations, but model and regional support varies. [AZURE-BING-GROUNDING]

### Product-boundary warning

“Copilot” refers to multiple products:

- Bing/Copilot consumer search;
- Microsoft 365 Copilot;
- Copilot Studio;
- Azure AI/Foundry agents; and
- partner experiences using Bing grounding.

Their retrieval controls and data paths are not necessarily identical.

### What remains unknown

- Complete ranking and citation logic.
- Whether every Copilot surface follows the same `NOCACHE`/`NOARCHIVE` interpretation.
- How partner experiences report citations.
- Exact refresh delay between Bing indexing and AI grounding.
- How user personalization affects source selection.

### Publisher controls

- `robots.txt` and Bing-supported robots meta directives.
- Server accessibility and Bingbot verification.
- Bing Webmaster Tools crawl settings and diagnostics.
- `NOCACHE`/`NOARCHIVE` where current product documentation confirms desired behavior.
- WAF allow rules for verified Bing agents.

### LotteryCorner implications

- Bing’s AI Performance report is unusually useful first-party evidence because it exposes grounding-query examples, but it still does not reveal rank.
- `MicrosoftPreview` and Bingbot must not be confused in logs.
- A Cloudflare rule that only recognizes the `bingbot` string could block other legitimate Microsoft preview or retrieval agents.
- Current facts should be accessible in the Bing index before expecting Copilot grounding.

### Preliminary recommendation

**RECOMMENDATION — Medium-high confidence**

Use Bing Webmaster Tools and AI Performance reporting as a separate measurement stream. Revalidate publisher-control semantics during the future robots/metadata task because Microsoft has evolved them over time.

---

## Anthropic and Claude

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

Anthropic documents:

| Agent | Purpose |
|---|---|
| `ClaudeBot` | Collect web content that could potentially contribute to model training |
| `Claude-SearchBot` | Navigate the web to improve search relevance and accuracy |
| `Claude-User` | Retrieve content in response to user-initiated requests |

Anthropic states that its bots honor robots directives, support the non-standard `Crawl-delay` extension where appropriate and do not attempt to bypass CAPTCHAs. [ANT-BOTS]

Claude’s web-search documentation states that web search uses current web information, processes multiple sources and returns citations/source links. Web search availability depends on model, plan, workspace controls and product configuration. Claude can also fetch a directly supplied URL. [ANT-WEB-SEARCH]

### What remains unknown

- Claude’s private source-selection ranking.
- Search-index providers and architecture for every Claude product surface.
- Refresh intervals for `Claude-SearchBot`.
- Whether a directly supplied URL will always be handled through `Claude-User`.
- The exact behavior of every enterprise/government configuration.

### Publisher controls

- Independently control `ClaudeBot`, `Claude-SearchBot` and `Claude-User`.
- Use authentication and WAF enforcement where crawl preference is insufficient.
- Use Anthropic-published IP information to validate claimed agents.
- Submit removal/reporting requests through Anthropic’s documented process. [ANT-REMOVE]

### LotteryCorner implications

- Blocking training through `ClaudeBot` does not imply blocking Claude search.
- Blocking `Claude-User` may prevent direct user-request retrieval even if the search index contains references.
- Claude’s own help guidance tells users to verify cited sources for important decisions; LotteryCorner should make cited evidence easy to audit.
- Plan/model limitations mean a benchmark query can produce different behavior across accounts.

### Preliminary recommendation

**RECOMMENDATION — High confidence**

Separate training, search-index optimization and user-directed access in the future crawler matrix.

---

## Perplexity

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

Perplexity documents:

| Agent | Purpose | Training use | robots behavior |
|---|---|---|---|
| `PerplexityBot` | Gather/index information to surface and link websites in Perplexity search | Officially stated not to train foundation models | Managed through robots.txt |
| `Perplexity-User` | Fetch pages for user-requested answers and include links | Officially stated not to train foundation models | Perplexity states it generally ignores robots.txt because the user requested the fetch |

Perplexity publishes IP ranges and recommends that Cloudflare or AWS WAF rules combine user-agent and IP verification. [PPLX-BOTS]

Perplexity describes its product as searching sources and providing citations. [PPLX-HOW-IT-WORKS]

### Documented controversy

**OBSERVATION — Credible but disputed**

Cloudflare published an August 4, 2025 analysis alleging that Perplexity used undeclared or rotating crawlers to access sites that had expressed no-crawl preferences, and Cloudflare removed it from its verified-bot list. Perplexity’s current official documentation states that its automatic search bot follows robots controls while its user-directed fetcher generally ignores them. [CF-PPLX-STUDY] [PPLX-BOTS]

These claims are not identical:

- Cloudflare reported observed requests and evasion patterns.
- Perplexity documents present intended current behavior and distinguish user-directed fetching.

A July 2026 controlled preprint studying ten AI assistants also found inconsistent robots and authorization behavior across products, but it is recent, not peer reviewed and should not be treated as a definitive finding about every current version. [AI-ROBOTS-STUDY]

### What remains unknown

- The complete separation between automatic index collection and user-triggered retrieval in all product surfaces.
- Citation selection and refresh logic.
- The status and measurable impact of any publisher partnership program.
- Whether every request consistently uses the documented identifiers.
- Geographic and paid-tier differences.

### Publisher controls

- Robots rules for `PerplexityBot`.
- Direct WAF policy for both documented agents.
- IP and UA verification.
- Authentication for content that must not be fetched.
- Logs and anomaly monitoring.

### What LotteryCorner should not assume

- A robots preference is equivalent to technical access denial.
- A `PerplexityBot` allow rule guarantees citation.
- A user-triggered request will necessarily honor automatic-crawler preferences.
- Official documentation eliminates the need for log verification.

### Preliminary recommendation

**RECOMMENDATION — Medium-high confidence**

Allow or block based on an explicit policy decision, verify traffic against published IP ranges and monitor behavior. Treat the Cloudflare dispute as a reason for auditability, not as a basis for unsupported claims about current Perplexity conduct.

---

## Cross-platform comparison

| Platform | Search/index agent or mechanism | Training control | User-directed fetch | Publisher visibility controls | Citation guarantee |
|---|---|---|---|---|---|
| Google Search / AI Search | Googlebot and Search index | `Google-Extended` affects specified Gemini uses, not Search | Browser/agent mechanisms vary | robots, `noindex`, snippet controls | No |
| ChatGPT | `OAI-SearchBot` | `GPTBot` | `ChatGPT-User`; robots may not apply | robots, `noindex`, WAF, authentication | No |
| Bing/Copilot | `bingbot` / Bing index | No one universal public training token identified in this research | Product-specific | robots/meta, `NOCACHE`/`NOARCHIVE` where applicable | No |
| Claude | `Claude-SearchBot` | `ClaudeBot` | `Claude-User` | independent robots controls, WAF/auth | No |
| Perplexity | `PerplexityBot` | Officially not the foundation-model training bot | `Perplexity-User`, generally ignores robots | robots for bot, WAF/auth | No |
| Gemini products | Google Search grounding and/or direct retrieval depending on product | `Google-Extended` for documented affected uses | Product/API-specific | Googlebot + Google-Extended + access controls | No |

---

## Crawlers and Publisher Controls

## Access-control layers

| Control | What it does | What it does not do | LotteryCorner risk |
|---|---|---|---|
| `robots.txt` | Expresses crawl preferences to identified compliant agents | Does not authenticate, encrypt, remove known URLs or stop noncompliant access | False confidence; accidental blanket blocks |
| Meta robots | Controls indexing/preview behavior for crawlers that can fetch the page | Cannot be read if the page is blocked from crawling | Blocking crawl while expecting `noindex` to be honored |
| `X-Robots-Tag` | Applies robots directives through HTTP headers, including non-HTML resources | Is not access control | Misconfiguration can deindex datasets or PDFs |
| Authentication | Requires valid credentials before serving content | Does not help public discoverability | Accidentally protecting public result data |
| Rate limiting | Restricts request volume | Does not communicate content-use preference | Throttling legitimate burst crawling after draws |
| Firewall/CDN bot rule | Technically allows, blocks or challenges traffic | UA-only rules do not prove identity | Spoofing or blocking real bots |
| JavaScript challenge | Requires browser execution or challenge completion | Many crawlers and fetchers cannot complete it | Current results become invisible to search and AI |
| Paywall | Restricts full content based on entitlement | Does not automatically express indexing policy | Exposed snippets may not match accessible content |
| `nosnippet` / `max-snippet` / `data-nosnippet` | Limits content shown in Google Search previews and AI Search | Does not remove the page unless `noindex` is used | Reduced AI Search reuse and click context |
| Canonicalization | Consolidates duplicate URL signals | Does not guarantee selection of the declared canonical | Wrong canonical can detach history/result identity |

### Robots is a preference protocol, not security

RFC 9309 standardizes the Robots Exclusion Protocol but explicitly states that its rules are not access authorization. A compliant crawler is requested to honor them. Sensitive information requires authentication or network enforcement. [RFC9309]

### Does blocking a training crawler block live search?

**FACT**

Usually not. OpenAI, Anthropic and Google document separate controls. Perplexity states its search bot is not used for foundation-model training. [OAI-BOTS] [ANT-BOTS] [G-GOOGLE-EXTENDED] [PPLX-BOTS]

### Does allowing a crawler guarantee citation?

**FACT**

No. Google explicitly says crawling, indexing and serving are not guaranteed. Other platforms recommend allowing search agents but do not grant an inclusion or citation entitlement. [G-AI-GUIDE] [OAI-BOTS] [ANT-BOTS] [PPLX-BOTS]

### Are robots directives equally enforceable?

**FACT**

No. They are a protocol-based preference. Platforms may document voluntary compliance; user-directed fetchers may use different semantics. Authentication, WAF blocking and authorization are technical enforcement.

### Cloudflare-hosted site considerations

LotteryCorner currently uses Cloudflare. Cloudflare documentation introduces several relevant layers:

- managed robots rules can prepend Cloudflare directives to a site’s existing `robots.txt`;
- AI Crawl Control can enforce allow/block decisions at the edge;
- Cloudflare Content Signals separates categories such as search, AI input and AI training, but these are Cloudflare-specific and not an accepted universal standard;
- verified-bot status and WAF custom rules can be used to avoid challenging known bots;
- UA strings are spoofable, so official IP verification or provider verification mechanisms remain important. [CF-MANAGED-ROBOTS] [CF-AI-CRAWL] [CF-VERIFIED-BOTS]

### Accidental-blocking risks

1. A global “block AI bots” toggle could block search discovery alongside training crawlers.
2. A managed robots feature could override or prepend a rule not represented in source control.
3. Bot Fight Mode, rate limits or JavaScript challenges could block crawlers before `robots.txt` is read.
4. A WAF exception based only on user-agent text could allow spoofed traffic.
5. An IP-only block may become stale when providers update ranges.
6. A draw-time traffic spike could trigger automated protection and hide the most freshness-critical pages.
7. Social-preview and monitoring agents may be blocked by overly broad bot categories.
8. Preview bots can reveal stale title/image metadata if cached independently.

### Social-preview crawlers

Microsoft documents `MicrosoftPreview`. Official, current crawler documentation for every social platform was not sufficiently consistent in this research to create a permanent allowlist. This is recorded as an evidence gap rather than filling the report with stale user-agent strings.

**FUTURE BLUEPRINT IMPLICATION**

The later crawler policy should maintain a versioned agent registry sourced from each provider’s official documentation, including search, training, user-fetch, preview and monitoring categories.

### Preliminary recommendation

**RECOMMENDATION — High confidence**

Do not create the final `robots.txt` in this phase. First define a publisher policy per access purpose, then test robots, meta directives, Cloudflare edge behavior and origin behavior together.

---

## llms.txt and Emerging Standards

## `llms.txt`

### Findings

The `llms.txt` proposal was introduced by Jeremy Howard in September 2024 as a Markdown index intended to help language models find useful, concise site documentation. It proposes `/llms.txt`, optional linked Markdown pages and sometimes `llms-full.txt`. [LLMSTXT]

### Status

| Question | Assessment |
|---|---|
| Accepted IETF standard? | No |
| W3C Recommendation? | No |
| Schema.org vocabulary? | No |
| Google Search support? | Google says Search ignores it |
| Evidence it improves Google AI visibility? | None; Google explicitly says it neither helps nor harms |
| Used by some documentation systems? | Yes |
| Evidence of broad consumer answer-engine ranking benefit? | Not established |
| Maintenance risk | Duplicate/stale representations, governance overhead, accidental inconsistency |

Perplexity’s developer documentation exposes an `llms.txt` index. This demonstrates that an AI-oriented documentation index can be useful to a documentation toolchain; it does **not** demonstrate that Perplexity’s consumer answer engine ranks third-party sites because they provide one. [PPLX-BOTS]

### Classification

**Optional / experimental**

### Preliminary recommendation

Do not make `llms.txt` a launch dependency. A future experiment may be justified for internal agent documentation or specific developer-facing material, provided that:

- the file is generated from the canonical source;
- it cannot contradict visible pages;
- use is measured; and
- no ranking claim is made.

## `llms-full.txt`

`llms-full.txt` is an extension used by some documentation publishers to provide consolidated text. It has the same standards and evidence limitations as `llms.txt`, with greater size and staleness risk.

**Classification:** Experimental; unnecessary for LotteryCorner’s public state information at this stage.

## AI-specific sitemaps

No accepted cross-platform “AI sitemap” standard was found. Standard XML sitemaps remain documented discovery mechanisms for conventional search. Google instructs publishers to use accurate `lastmod` values reflecting significant changes. [G-SITEMAP-LASTMOD]

**Classification:** Unnecessary unless a target platform later publishes a formal specification.

## Machine-readable publisher manifests

No universal publisher manifest for search/AI reuse was identified. Platform-specific publisher settings, crawler tokens and licensing arrangements exist, but they do not form one interoperable standard.

**Classification:** Emerging/fragmented.

## Special AI meta tags

No cross-platform AI meta-tag standard was identified. Existing controls remain platform-specific:

- Google snippet controls and `noindex`;
- Bing-supported robots controls, including historically documented Copilot-specific behavior;
- robots product tokens such as Google-Extended;
- provider-specific user-agent rules.

**Classification:** No universal standard.

## Content licensing and preference signals

Cloudflare’s Content Signals attempts to express preferences for search, AI input and AI training. It is an infrastructure-provider mechanism, not an IETF/W3C standard, and platform honoring is not universal. [CF-MANAGED-ROBOTS]

**Classification:** Experimental/proprietary.

## W3C PROV

W3C PROV-O is a formal provenance ontology. It can represent entities, activities and agents involved in producing information. It is relevant to internal source/correction lineage and interoperable dataset metadata, but no evidence shows that publishing PROV-O directly improves search ranking or AI citation. [W3C-PROV]

**Classification:** Useful optional provenance vocabulary, not an SEO requirement.

## Model Context Protocol and agent protocols

MCP is an emerging protocol for connecting models to tools and data sources. It concerns authenticated tool integration rather than public-web ranking. It may be relevant to a future LotteryCorner agent or data service, but it is outside the current state-page research and should not shape public content prematurely.

**Classification:** Emerging; future agent architecture concern.

### Section assessment

- **Why it matters:** Proposed standards can create duplicate maintenance surfaces without measurable benefit.
- **Limitation:** Adoption can change rapidly.
- **Risk:** Treating experimental files as authoritative can cause divergence from canonical content.
- **Recommendation:** Preserve ordinary web standards and a canonical source model; adopt new signals only after documented platform support and controlled testing.
- **Confidence:** High for Google; medium for the broader future ecosystem.


---

## Content Retrieval and Passage Understanding

## Content characteristics matrix

| Characteristic | Traditional Search benefit | AI retrieval benefit | User benefit | Trust/provenance benefit | Evidence assessment |
|---|---|---|---|---|---|
| Clear page purpose | Helps relevance and quality assessment | Reduces ambiguity in retrieval | Users know what task the page serves | Clarifies responsibility | Documented for Google; inferred for other systems |
| Concise factual summary | Can support snippets | May provide a self-contained answer candidate | Faster task completion | Useful if scope/status are present | User benefit documented; no fixed length documented |
| Descriptive headings | Supports navigation and interpretation | Can segment passages | Scannability/accessibility | Helps identify scope | Google recommends clear organization; retrieval effect inferred |
| Semantic HTML | Supports accessibility and parsing | Helps some browser agents and extractors | Screen-reader and navigation benefit | Reduces structural ambiguity | Google says useful but perfect semantics are not required; OpenAI mentions ARIA |
| Stable URLs | Supports discovery, canonicalization and links | Allows repeat retrieval/citation | Bookmarking and sharing | Persistent evidence reference | Strongly established |
| Crawlable text | Required for reliable search processing | Available for retrieval and grounding | Works under constrained devices | Auditability | Documented |
| Server rendering/pre-rendering | Can simplify crawler access | Reduces dependency on execution | Faster/resilient access | More consistent evidence | Inferred benefit; not an automatic ranking factor |
| Tables | Useful for structured comparison | May support row-level extraction | Efficient comparison | Values can be tied to headers | Benefit plausible; no universal citation guarantee |
| Lists | Supports scanning | Can make discrete items retrievable | Fast comprehension | Helps enumerate conditions | Plausible/inferred |
| Definitions | Clarify terminology | Reduces entity/term confusion | Helps first-time users | Prevents misleading reuse | Strong user/IR logic; no special ranking guarantee |
| Named entities | Supports relevance/disambiguation | Helps resolve state/game/organization | Reduces wrong-jurisdiction errors | Enables source ownership | Inferred from IR/entity systems |
| Dates and timezones | Supports freshness | Prevents mixing current/historical records | Essential for lottery tasks | Audit and correction context | Strongly supported |
| Units and value labels | Supports accurate interpretation | Prevents jackpot/cash/tax confusion | Reduces mistakes | Clarifies claim meaning | Inferred; high user value |
| Inline source links | Supports verification | Gives retrieval systems and users a path to evidence | Builds confidence | Strong provenance | User/trust benefit; direct ranking effect unproven |
| Methodology | Helps quality evaluation | Allows a system to explain calculations | Reproducibility | Strong derivation evidence | Strong for analytics; citation effect unproven |
| Author/reviewer identity | Supports responsibility assessment | May help identify source authority | Accountability | Strong governance | Google quality guidance supports clear responsibility; not a single ranking factor |
| Correction history | Reduces stale/wrong reuse | Gives current status and superseded values | Restores trust | Essential lineage | Strongly inferred for lottery data |
| Original data | Differentiates from commodity pages | Gives engines a reason to retrieve the source | Unique utility | Can be documented and reused | Google explicitly recommends non-commodity content |
| Unique analysis | Adds information gain | Can support synthesis | Decision support | Requires methodology | Documented direction from Google; quality-dependent |
| Visible/structured-data consistency | Avoids policy issues | Prevents conflicting machine interpretations | Consistent experience | Reduces hidden claims | Documented |
| Internal links | Supports discovery and hierarchy | Helps locate supporting records | Journey continuity | Shows relationships | Documented for search; retrieval benefit inferred |
| Breadcrumbs | Communicate hierarchy | Can reinforce state/game context | Orientation | Entity path clarity | Supported Search feature |
| Alternative text | Image search/accessibility | Can expose meaning to multimodal systems | Accessibility | Identifies evidence image | Documented accessibility/search value |
| Downloadable datasets | Can be discovered and linked | Enables tool-based analysis | Research reuse | Strong documentation opportunity | Dataset discovery documented; AI benefit inferred |
| Versioned facts | Avoids silent overwriting | Helps select current vs superseded | Historical clarity | Core provenance | Strong architecture inference |

## Crawlable text and rendering

Google can process JavaScript, but its own guidance says JavaScript SEO is more complex. A server-rendered or pre-rendered representation can improve robustness, but **server-side rendering is not a documented automatic ranking boost**. The relevant requirement is that meaningful content is accessible, indexable, consistent and performant. [G-AI-GUIDE]

For LotteryCorner, the strongest reason to provide immediately readable result and rule text is operational reliability:

- draw-time traffic spikes;
- API failures;
- script errors;
- crawler rendering limits;
- AI fetchers that do not execute full application flows; and
- users on low-bandwidth mobile connections.

## Tables and lists

Tables are appropriate where row/column semantics matter, such as:

- winning numbers by draw;
- prize tiers;
- claim thresholds;
- scratcher inventory;
- state comparison; and
- source/correction history.

The table must carry its own context. A detached row containing “$10,000” is unsafe unless its headers or nearby text identify the state, game, match condition, multiplier and effective date.

## Source citations

External source links should be chosen for verification, not as a speculative “authority leak” tactic. No authoritative evidence says linking to official sources reduces ranking power. A source link can:

- help a user verify;
- identify official responsibility;
- allow a journalist or editor to audit;
- help internal agents reconcile changes; and
- reduce the chance that a summary is mistaken for an official statement.

It does not automatically create ranking or citation credit.

## Passage safety rule

**RECOMMENDATION — High confidence**

A passage likely to be extracted should carry the minimum context required to remain true outside the page:

- jurisdiction;
- official lottery or game entity;
- date/effective period;
- draw variant and timezone where relevant;
- status such as pending, official, corrected, estimated or confirmed;
- units and definition;
- source identity; and
- limitation or official next step for high-risk topics.

---

## Answer-First Content and Passage-Level Retrieval

### Is answer-first formally required?

**FACT**

No reviewed platform requires a specific answer-first paragraph format, word count or “AI-friendly chunk size.” Google explicitly rejects fixed chunking and ideal-length claims. [G-AI-GUIDE]

### Why it can still help

**INFERENCE**

A concise direct statement can reduce user effort and may make a passage easier to retrieve, but only if it remains accurate when detached. “Answer first” should mean **scope first, fact second, qualification immediately where material**, not “remove all nuance.”

### Lottery-specific extraction risks

| Topic | Unsafe extraction | Context required |
|---|---|---|
| Latest winning numbers | Numbers without draw identity | State, game, draw date, variant, timezone, official status |
| Draw schedule | “Draws at 10:59” | Timezone, applicable days, effective date, official source |
| Ticket cutoff | One national cutoff | State/jurisdiction, purchase channel, draw date, disclaimer that retailer systems may close earlier |
| Claim prize | “Claim at a retailer” | Prize amount, ticket type, state, channel and threshold |
| Claim deadline | “180 days” | State, game/ticket type, starting event and effective rule |
| Tax withholding | A single “tax rate” | Federal withholding vs final liability, state treatment, residency, date |
| Winner anonymity | “Winners can stay anonymous” | State law, prize threshold, exceptions, effective date |
| Online purchase | “Buy online” | State, physical location, official vs courier, age/geolocation, availability time |
| Scratcher prizes remaining | A timeless count | Snapshot date/time, official source, ticket/game status, remaining top-prize definition |

### Repetition across state, game and result pages

Important facts may appear in multiple user contexts, but manual duplication creates contradiction risk.

**RECOMMENDATION**

Use one governed fact and render it contextually. Repetition is acceptable when the fact remains sourced and synchronized; independent editorial copies should be avoided.

### High-risk answer pattern

A safe answer unit should distinguish:

1. **Direct answer**
2. **Scope**
3. **Effective/current date**
4. **Source and verification time**
5. **Important exception**
6. **Official next action**

This is a principle, not a final content block.

### Confidence

- User benefit: High
- AI retrieval benefit: Medium, inferred
- Fixed format/length requirement: Unsupported

---

## Entities and Knowledge Representation

The predecessor’s entity list is retained and refined conceptually, without defining a final schema.

## Core entities and ambiguity risks

| Entity | Required distinction | Common failure |
|---|---|---|
| State or jurisdiction | Political jurisdiction vs lottery service area | Treating a state abbreviation as a game |
| Official lottery organization | Government/authorized operator | Independent site appearing official |
| National game brand | Powerball/Mega Millions as a game entity | Assuming one national cutoff or claim rule |
| State-specific national-game offering | The game as sold under state rules | Mixing state purchase/claim rules |
| State-only game | Unique local game and variants | Mapping similar names across states as identical |
| Draw | Scheduled event instance | Confusing “next draw” with most recent completed draw |
| Draw variant | Midday/evening/day/night/add-on | Combining results from different variants |
| Draw result | Numbers/status tied to one draw | Silent overwrite after correction |
| Jackpot | Advertised prize estimate | Confusing annuity estimate with cash value |
| Prize tier | Match condition and payout rules | Detaching payout from multiplier/rule version |
| Claim rule | Jurisdiction, prize range and period | Publishing a timeless generic claim rule |
| Purchase channel | Retail, official online, subscription, courier | Calling a courier the official lottery |
| Retailer | Authorized seller/cashing capability | Assuming every seller can cash every prize |
| Claim center | Office with defined capabilities/hours | Sending users to a non-claim office |
| Scratcher game | Ticket product and lifecycle | Treating prize count as timeless |
| Prize-inventory snapshot | Time-specific remaining prizes | Showing stale values as current |
| Winner event | Verified winning ticket/claim event | Inventing personal details |
| Unclaimed prize | Prize with deadline and ticket geography | Continuing to call a claimed prize unclaimed |
| Source record | Retrieved official evidence | Losing URL, retrieval time or document version |
| Correction event | Superseded and replacement values | Removing wrong data without an audit trail |

## Consistent naming

**RECOMMENDATION**

Maintain:

- one preferred name;
- known official aliases;
- abbreviations;
- state-specific display names;
- historical names;
- stable internal identifier; and
- official external identifier/URL where available.

Search-language variants should map to the same entity; they should not create separate identities.

## `sameAs` usage and limitations

`sameAs` is intended to identify equivalent entities, not loosely related pages. Risks include:

- linking a state government page as though it were the lottery organization;
- asserting an independent game page is the official entity;
- using social profiles that are unofficial;
- equating a national game with its state-specific offering.

**PRELIMINARY RECOMMENDATION**

Use identity links conservatively and pass final usage to the schema research. Do not use `sameAs` as a general relationship field.

## Visible content and structured data

Structured data may reinforce an entity already represented visibly. It must not create a hidden alternate ontology. The visible page, internal entity registry and markup should agree on:

- name;
- type;
- URL;
- dates;
- organization;
- current status; and
- relationships.

## Reconciliation between official and independent entities

LotteryCorner is an independent publisher. A source record should identify the official organization as the source while preserving LotteryCorner as the publisher of the normalized record or analysis.

This distinction is essential:

- **source authority** is not the same as **page publisher**;
- **normalized dataset creator** is not the same as **official draw operator**;
- **affiliate destination** is not the same as **official purchase channel**.

## Knowledge graph: architecture, not tactic

A knowledge graph can mean a conceptual entity/relationship model, not necessarily a graph database.

**FACT**

No reviewed platform says a publisher needs a graph database to rank or be cited.

**INFERENCE**

A governed entity graph can reduce internal contradictions and enable multi-condition answers, but it may be implemented using relational tables, document stores, search indexes, graph databases or a hybrid.

**RECOMMENDATION — High confidence**

Finalize entity semantics before selecting storage technology. Do not market the internal graph as a ranking trick.

---

## Original Information and Information Gain

## What constitutes meaningful originality?

Originality does not require inventing facts. An independent publisher can add original value through collection, normalization, verification, computation, history, accessibility and comparison.

### Opportunity assessment by cite-worthiness

| Asset | Original contribution | Why a system might retrieve/cite it | Accuracy risk | Confidence |
|---|---|---|---|---|
| Draw-level provenance and corrections | Persistent normalized history of status/source changes | Official sites may show only current value | High but manageable | High |
| Complete historical datasets | Consolidated, queryable records across games/states | Supports precise date and analytical queries | High | High |
| Reproducible statistics | Transparent calculations over governed data | Adds information not present on official result pages | Medium | High |
| Jackpot history | Normalized advertised/cash/winner events | Enables trend and comparison queries | Medium | High |
| Claim-rule normalization | Comparable rule propositions with effective dates | Resolves fragmented official documentation | Very high | High if reviewed |
| Online-purchase availability map | State/channel/authorization/effective-date distinction | Answers high-intent multi-state questions | Very high | Medium-high |
| Scratcher inventory history | Time-series snapshots, not only current count | Rare independent longitudinal asset | Very high | Medium-high |
| Unclaimed-prize monitoring | Deadline-aware normalized alerts | Time-sensitive user utility | Very high | Medium-high |
| State-rule change detection | Diff of official rule versions | Helps users and journalists identify change | High | High |
| Source-backed calculators | Deterministic transformations of official rules/data | Completes user task | Very high for tax/legal | Medium-high |
| Community experience | Authentic first-hand claim/retailer/app experience | Adds experiential evidence | High moderation risk | Medium |
| Editorial analysis | Sourced implications and comparisons | Adds viewpoint/context | Medium | High |
| AI synthesis over own data | Flexible natural-language access to original records | Helps complex retrieval | Hallucination/context risk | Medium-high |

### Low-value or harmful substitutes

| Practice | Assessment |
|---|---|
| Rewriting official pages | Commodity; limited independent value |
| Republishing numbers without source/status | Necessary utility but weak moat |
| Generic AI summaries | Low information gain |
| Near-duplicate state/game pages | Scaled-content and contradiction risk |
| Manufactured reviews/discussions | Deceptive and reputation-damaging |
| Unsupported number predictions | Misleading; may cause gambling harm |
| Thin affiliate pages | Search-spam and trust risk |
| Auto-generated “latest” pages with no verified data | Severe freshness and credibility risk |

### Highest-priority original assets

**RECOMMENDATION — High confidence**

Prioritize:

1. source registry;
2. draw/result/correction history;
3. historical dataset completeness;
4. rule versioning;
5. reproducible analytics; and
6. time-specific scratcher/unclaimed-prize records where official source quality permits.

These assets make LotteryCorner worth citing because they answer questions official pages do not organize consistently.

---

## Sources, Citations and Provenance

## Provenance audiences

| Audience | Primary need |
|---|---|
| User | “Can I trust and act on this?” |
| Search engine | Clear publisher, source, date and visible fact |
| AI retrieval system | Self-contained evidence and stable URL |
| Journalist | Primary source, event date, record history |
| Internal agent | Machine-resolvable source and validation status |
| Editor/developer | Ownership, derivation, change and rollback information |

## Provenance elements

### Inline source links

Useful when a claim is materially dependent on an official rule, result or announcement. They should point as closely as possible to the relevant evidence rather than only to a state-lottery home page.

**Limitation:** Link presence does not prove that the source supports the interpretation.

### “Official source” labels

Should identify the role of the destination:

- official lottery;
- official national game;
- state statute/regulation;
- official press release;
- official dataset;
- independent secondary source.

Do not label LotteryCorner itself “official.”

### Retrieval timestamp

When LotteryCorner fetched the source. Useful for volatile data and debugging.

### Last updated

When LotteryCorner’s published object materially changed.

### Last verified

When a human or deterministic validator confirmed the assertion against its source, even if the visible value did not change.

### Effective date

When a rule begins to apply.

### Data coverage period

The earliest/latest records included in a dataset or analysis.

### Published date

When an editorial item first became public.

### Correction log

Should preserve:

- original value;
- corrected value;
- correction time;
- reason/source;
- affected calculations; and
- visibility of superseded status.

### Methodology

Required for statistical claims, comparisons, rankings and calculators.

### Author/reviewer identity

Use role-appropriate identities such as:

- LotteryCorner Data Team;
- LotteryCorner Research;
- LotteryCorner Editorial;
- named specialist reviewer where appropriate.

The identity should correspond to real responsibility, not manufactured personas.

### Machine-readable provenance

W3C PROV concepts can inform internal lineage or exported dataset metadata. The benefit is interoperability and auditability, not a documented Search ranking effect.

## Conflicting official sources

**RECOMMENDATION — High confidence**

When official sources conflict:

1. do not silently choose one;
2. identify both records and retrieval times;
3. apply a source-precedence policy;
4. mark the LotteryCorner state as pending review where outcome-critical;
5. contact or monitor the official source;
6. preserve the final resolution and correction event.

Possible precedence factors:

- direct result feed over promotional article;
- current game rules over archived PDF;
- signed regulation/statute over a generic help page for legal propositions;
- time-stamped official correction over the initially published result.

## Official-site outage

LotteryCorner may continue to display the last verified record only if it is clearly labeled with:

- last successful verification;
- current source availability status;
- whether a newer result is expected;
- no false “verified now” claim.

## Preliminary vs confirmed results

Do not collapse statuses. A preliminary result is not “official” merely because it came from an automated feed. Status transition is part of the record.

## AI summaries using multiple sources

Store which source supports which proposition. A bibliography alone is insufficient if a generated paragraph combines:

- official result;
- LotteryCorner calculation;
- state legal rule; and
- affiliate availability.

### Section recommendation

Build provenance into every information object, not only a general Sources page.

### Confidence

High.

---

## Freshness and Temporal Accuracy

## Temporal state vocabulary

| Information type | Required state distinctions |
|---|---|
| Draw result | scheduled, pending, preliminary, official, corrected, delayed, cancelled |
| Jackpot | advertised estimate, cash estimate, confirmed winner, rollover, reset |
| Game | announced, active, temporarily unavailable, ending, retired |
| Claim rule | current, future-effective, superseded |
| Scratcher | active snapshot, closing, ended, historical snapshot |
| Unclaimed prize | unclaimed, claimed, expired, status unknown |
| Source | available, changed, moved, unavailable |
| Verification | retrieved, parsed, validated, manually reviewed |

## Date semantics

| Date | Meaning |
|---|---|
| Draw date | When the drawing occurred in its jurisdiction |
| Scheduled draw time | Expected event time and timezone |
| Result publication time | When a result was first published |
| Result verification time | When LotteryCorner confirmed it |
| Correction time | When a replacement value was accepted |
| Rule effective date | When a rule applies |
| Record modified date | When LotteryCorner materially changed the object |
| Source retrieval date | When evidence was fetched |
| Dataset coverage date | Period included in analysis |

These dates must not be collapsed into one generic “updated” timestamp.

## Sitemap `lastmod`

Google says `lastmod` should reflect the last significant update and may be used when consistently accurate. Changing a copyright year or rebuilding a page without material content change is not a valid freshness event. [G-SITEMAP-LASTMOD]

**RECOMMENDATION**

Generate `lastmod` from material object changes, not deployment time or request time.

## Structured-data dates

Dates in markup must match visible and internal facts. The future schema research must determine which supported properties apply by content type. No unsupported date should be invented only to look fresh.

## HTTP caching

**INFERENCE**

Caching affects how quickly users and fetchers receive updates. LotteryCorner needs different policies for:

- immutable historical draws;
- current/pending draw endpoints;
- jackpot estimates;
- rule documents; and
- scratcher snapshots.

This research does not define headers, but the architecture must prevent a CDN from serving a superseded result as current.

## Risks of automatic timestamps

- false freshness;
- crawl waste;
- loss of trust;
- inability to distinguish verification from modification;
- misleading AI answers that prefer a new-looking but unchanged page;
- invalid sitemap history.

## Risks of stale AI citation

An AI answer may retrieve a cached or older passage. LotteryCorner can reduce, but not eliminate, this risk by:

- stable current/historical distinctions;
- explicit effective dates;
- corrected/superseded labels;
- persistent historical URLs;
- accurate `lastmod`;
- fast re-crawl support;
- source status; and
- avoiding evergreen wording for volatile facts.

## Preliminary recommendation

Retain the predecessor’s P0-P3 freshness categories and add explicit status transitions and date semantics.

### Confidence

High.


---

## Structured Data and AI Search

This section records only the relationship between structured data and AI retrieval. Final schema selection belongs in `03-schema-metadata-research.md`.

### Findings

**DOCUMENTED PLATFORM GUIDANCE**

- Google states that structured data helps it understand content and can make pages eligible for supported rich results. [G-STRUCTURED-DATA]
- Google states that structured data is not required for its generative Search features and that there is no AI-specific schema. [G-AI-GUIDE]
- Markup must describe visible page content and follow supported feature policies. [G-STRUCTURED-DATA-POLICIES]
- Dataset markup can provide metadata that supports dataset discovery, including Google Dataset Search. [G-DATASET]
- DiscussionForumPosting and QAPage have narrow eligibility requirements tied to genuine user-generated content. [G-DISCUSSION] [G-QAPAGE]

### Conclusions

| Claim | Assessment |
|---|---|
| Structured data is required for AI answers | Unsupported |
| Structured data may assist entity understanding | Reasonable and partly documented, but product-specific |
| Structured data directly causes citation | Unsupported |
| JSON-LD can replace visible content | False/misleading |
| Unsupported custom properties create AI visibility | Unknown; likely ignored by consumers without a contract |
| Dataset markup may help historical-dataset discovery | Supported for dataset discovery, not a citation guarantee |
| FAQ markup has special AI citation value | Unsupported |
| A universal AI schema exists | No |

### Risks

- visible/markup contradiction;
- stale JSON-LD after visible data updates;
- representing unofficial data as official;
- marking generated FAQs that are not genuine user questions as Q&A;
- adding custom lottery fields that no consumer recognizes;
- using markup to expose claims not visible to users.

### Questions for `03-schema-metadata-research.md`

1. Which supported types best describe LotteryCorner as an organization and publisher?
2. How should state lottery organizations and national games be identified without implying ownership?
3. Which visible breadcrumbs and entity URLs should be canonical?
4. Is Dataset markup appropriate for historical draw archives, downloadable files or both?
5. What distribution, temporal coverage, license and update-frequency metadata should datasets expose?
6. How should editorial Article/NewsArticle dates and corrections be represented?
7. Which properties apply to DiscussionForumPosting, QAPage and ProfilePage for authentic community content?
8. What are the boundaries for `sameAs`?
9. How should current versus historical records avoid conflicting date/status markup?
10. What supported schema can represent official source links without inventing unsupported provenance fields?
11. How should visible content and JSON-LD be validated together?
12. Which result-rich features, if any, are actually available to lottery content?
13. Does a state/game entity require a dedicated canonical entity page before being referenced in markup?
14. How should affiliate actions and sponsored links be represented without implying official sale?
15. Which structured-data elements should be omitted because no supported vocabulary exists?

### Preliminary recommendation

Use structured data to reinforce a correct visible model, not to create an invisible AI layer.

### Confidence

High for Google; medium for other platforms.

---

## Community and User-Generated Content

## Potential value

Authentic community content can add:

- first-hand experience with claim centers, apps and retailer service;
- long-tail questions not predicted by editors;
- timely reports of outages or confusing processes;
- vocabulary used by real players;
- repeat visits and relationships;
- evidence of experience distinct from official rules.

Google supports structured data for genuine discussion and Q&A pages, but eligibility depends on real user-generated content and page purpose. [G-DISCUSSION] [G-QAPAGE]

## Risks

- spam and affiliate manipulation;
- fabricated identities;
- synthetic “user” discussions;
- unsupported winner claims;
- claims of predictive systems;
- financial/tax/legal advice;
- scams and solicitation;
- thin tag/profile pages;
- duplicate questions;
- reputation abuse;
- AI-generated replies overwhelming human contributions;
- doxxing or publication of sensitive winner information;
- confusing anecdote with state rule.

## Transparent internal identities

Acceptable internal identities include:

- LotteryCorner Research;
- LotteryCorner Data Team;
- LotteryCorner Editorial;
- LotteryCorner AI Assistant.

They must be visibly identified as LotteryCorner-operated and must not imitate independent users.

## Manufactured independent identities

**RECOMMENDATION — Must not do**

Do not create fictitious community members, winner stories, reviews, consensus or conversations.

## AI in community

AI may:

- identify unanswered questions;
- flag spam;
- suggest duplicates;
- summarize a thread with links to contributions;
- surface relevant official information.

AI must not:

- impersonate a human participant;
- fabricate first-hand experience;
- make unsupported winner or system claims;
- suppress human disagreement while presenting consensus;
- post high-risk legal/tax guidance without review.

## Indexing controls

Not every profile, tag or low-value question needs to be indexable. The future community research should define quality thresholds, lifecycle and consolidation rules.

## Preliminary recommendation

Community should be a separately governed trust layer, launched only after moderation, identity and provenance controls exist.

### Confidence

High on risks; medium on search value until first-party demand is known.

---

## Commercial and Affiliate Content

## Required distinctions

| Destination | Required label |
|---|---|
| State lottery website/app | Official lottery destination |
| National game site | Official game information, not state ticket seller |
| Authorized subscription | Official or officially authorized, with state scope |
| Courier | Third-party service purchasing/holding tickets under its terms |
| Affiliate merchant | Commercial referral relationship |
| Retailer locator | Official or independent location information |
| LotteryCorner | Independent information publisher |

## Search-quality context

Google recommends `rel="sponsored"` for paid/affiliate links and identifies thin affiliation and misleading presentation as spam risks. [G-SPONSORED] [G-SPAM]

## Context required for an extracted commercial recommendation

Any “buy tickets” recommendation should remain accurate when detached from the page. It must include, where applicable:

- state/jurisdiction;
- user physical-location requirement;
- seller identity;
- official, subscription, courier or affiliate classification;
- current service availability;
- legal/authorization source;
- minimum age;
- geolocation/account requirements;
- purchase cutoff and timezone;
- fees/material terms;
- whether LotteryCorner receives compensation;
- responsible-play context; and
- verification date.

## AI extraction risk

A generative system may quote “Buy Powerball online” without the conditions. Therefore the commercial statement itself must carry the state and channel limitations; a disclosure hidden elsewhere is insufficient.

## Official appearance risk

LotteryCorner must not:

- use official logos or wording in a way that implies government operation;
- label a courier “the lottery”;
- put affiliate purchase before a user can identify the official source;
- claim availability from a partner’s national marketing page without state verification;
- show a stale cutoff;
- promote purchase in a responsible-play, scam or claim-support context.

## Preliminary recommendation

Commercial information should be a governed content class with its own freshness, source and disclosure policy. It should never alter factual conclusions.

### Confidence

High.

---

## AI-Generated and Agent-Maintained Content

## Appropriate uses

| Use | Preliminary governance |
|---|---|
| Drafting low-risk explanations | Editorial review |
| Summarizing official updates | Source diff + editorial review |
| Statistical narratives | Deterministic validation against calculations |
| Detecting official-source changes | Automated detection; human/deterministic confirmation |
| Comparing old and new rules | Specialist review |
| Producing news drafts | Editorial review and source verification |
| Creating FAQs from real demand | Editorial review; no universal FAQ requirement |
| Answering community questions | Grounded answer, transparent AI identity, escalation |
| Translation | Review proportional to risk and language quality |
| Flagging stale information | May run automatically; publication status change must be governed |
| Suggesting internal links | Automated suggestion; quality checks |
| Generating alternative text | Review for accuracy and accessibility |
| Producing dataset documentation drafts | Data-owner review |

## High-risk uses

- automatically publishing tax or legal interpretations;
- inventing winner details;
- generating predictions as evidence of future advantage;
- fabricating community consensus;
- altering winning numbers through natural-language generation;
- marking a record “verified” because an AI summarized it;
- rewriting affiliate claims without jurisdiction validation;
- silently changing source-backed rules;
- producing many near-duplicate pages;
- using synthetic citations;
- presenting model confidence as factual probability.

## Platform guidance

Google says AI-generated content is not automatically penalized. Its systems focus on quality, originality and purpose. Scaled generation intended to manipulate rankings can violate spam policies. [G-AI-CONTENT] [G-SPAM]

## Preliminary governance categories

### May publish automatically

Only low-risk outputs whose facts are generated deterministically from validated records, for example:

- formatting a confirmed draw record;
- updating a “data unavailable” status based on monitored source health;
- recalculating a clearly labeled descriptive statistic;
- generating machine-readable internal link suggestions that do not alter public facts.

Even these require monitoring and rollback.

### Requires deterministic validation

- current winning-number summaries;
- prize-tier calculations;
- jackpot change calculations;
- historical statistics;
- scratcher snapshot summaries;
- date/timezone conversions.

Validation must compare structured output to authoritative fields, not ask a second language model whether the first is correct.

### Requires editorial review

- explanatory content;
- source-change summaries;
- news drafts;
- FAQs;
- translations;
- comparative descriptions;
- community summaries.

### Requires specialist review

- tax;
- legal/anonymity;
- claim ownership;
- estate/trust/pool issues;
- state online-purchase legality;
- responsible-play and high-harm guidance;
- interpretation of conflicting official sources.

### Must not be generated or published automatically

- official-result changes;
- winner identities/details not present in source;
- unsupported predictions;
- fabricated testimonials or discussions;
- “verified” labels without a real validation event;
- legal conclusions presented as professional advice;
- claims that a seller is official/authorized without evidence.

## Agent-maintained information

An agent may monitor and propose changes. It should not be the legal or editorial authority. Every automated action needs:

- source record;
- reason;
- validation result;
- actor identity;
- timestamp;
- previous value;
- review state; and
- rollback.

### Preliminary recommendation

Treat AI as an assistant inside a governed publishing system, not as the source of truth.

### Confidence

High.

---

## Measurement and Validation

## Measurement methods

| Method | What it measures | What it cannot measure | Reliability |
|---|---|---|---|
| Google Search Console standard performance | Google Search impressions, clicks, queries and pages | Full generative answer wording, all citation positions | High first-party |
| Search Console Generative AI report | Visibility within eligible Google generative Search/Discover features | Exact ranking formula or all no-click influence | High first-party, product-dependent |
| Bing Webmaster AI Performance | Citation totals, cited pages, grounding queries and trends | Rank, importance or exact generated position | High first-party; public preview |
| Web analytics referrals | Visits from ChatGPT, Perplexity, Bing, Google and others | Citations/impressions without clicks | High for recorded visits; attribution can be lost |
| Server logs | Crawler/fetch traffic, status, latency, paths | Whether a fetch caused a citation | High raw data; identity requires verification |
| Bot IP/UA verification | Whether claimed agents accessed the site | What happened after fetch | High if official ranges are maintained |
| Brand mention tracking | Public mentions in sampled answers/pages | Complete visibility or causation | Estimated |
| Controlled query set | Repeatable observation across products | Universal ranking; results are nondeterministic/personalized | Medium if carefully designed |
| Third-party AI visibility tools | Estimated presence/citation across sampled prompts | Internal platform data or guaranteed accuracy | Low-to-medium |
| Affiliate analytics | Clicks, qualified sessions, conversions | Informational trust or citations | High for partner events |
| Return-user behavior | Repeat value and tool utility | Search-engine source selection | High first-party |
| Correction/freshness metrics | Operational data quality | External visibility by itself | High first-party |

## Misinterpretation risks

- Citation count is not rank.
- A citation without a click is not necessarily low value.
- Referral growth can reflect product adoption rather than better content.
- Query results vary by location, account, model, date and conversation context.
- AI visibility tools use limited prompt samples and cannot access private ranking systems.
- Bot traffic does not prove indexing.
- An answer may cite a URL while deriving a claim from another source.
- A Google ranking and a ChatGPT citation are not equivalent.

## Proposed benchmark question set

The benchmark should be versioned, run under documented account/location conditions and evaluated for answer correctness, source use and landing-page accuracy.

### Current facts

1. What were the latest Virginia Powerball numbers?
2. What were the New York Pick 3 midday and evening results yesterday?
3. Did anyone win the latest Mega Millions jackpot?
4. What is the next advertised Powerball jackpot and cash value?
5. Was the latest result corrected after publication?

### Schedules and purchase

6. What time is the next Powerball draw in Pennsylvania?
7. What is the ticket-sale cutoff in California for tonight’s draw?
8. Can I buy Mega Millions online in Texas?
9. Is this online seller the official state lottery or a courier?
10. Where is the nearest authorized retailer that can cash a prize?

### Claims and high-trust rules

11. Where can a $10,000 Virginia prize be claimed?
12. How long does a Florida draw ticket remain valid?
13. Can a California lottery winner remain anonymous?
14. What is federal withholding versus final tax liability?
15. What should I do with a damaged ticket?

### Scratchers and unclaimed prizes

16. Which active Pennsylvania $10 scratchers have top prizes remaining?
17. When was the remaining-prize count last verified?
18. Which unclaimed prizes in this state expire within thirty days?
19. Is this scratcher still active or already in its claim-only period?

### Historical data and analytics

20. Show every Powerball drawing containing 7 and 21 in the last two years.
21. What is the source dataset and coverage period?
22. Are “hot numbers” predictive or only descriptive?
23. Compare state draw games by ticket cost and published odds.
24. How has the jackpot changed over the last ten draws?

### Provenance and identity

25. What is the official source for this result?
26. When did LotteryCorner last verify this rule?
27. What changed in the latest correction?
28. Is LotteryCorner an official lottery organization?
29. Which source supports the online-purchase availability claim?
30. Can I download the historical records used for this calculation?

## Validation dimensions

For each answer, score:

- correct entity;
- correct date/timezone;
- current status;
- source correctness;
- citation support;
- jurisdictional accuracy;
- commercial disclosure;
- landing-page relevance;
- missing qualification;
- harmful overstatement; and
- answer reproducibility.

## Preliminary recommendation

Create a baseline after the state information objects exist. Do not interpret a single manually observed answer as evidence of platform-wide visibility.

### Confidence

High.

---

## Myths and Unsupported Claims

| Claim | Rating | Evidence assessment | Practical implication |
|---|---|---|---|
| “AI engines prefer 40–60 word answers.” | **Unsupported** | No authoritative cross-platform requirement; Google rejects ideal length/chunking claims. [G-AI-GUIDE] | Write the shortest complete answer that preserves scope and safety. |
| “Every page needs an FAQ section.” | **Unsupported** | No platform guidance requires it; Q&A/FAQ markup has narrow purposes. | Use questions only where real user demand and page purpose justify them. |
| “FAQ schema causes AI citations.” | **Unsupported** | Google says structured data is not required for generative Search. | Do not add FAQ markup as a citation tactic. |
| “Adding llms.txt improves Google AI visibility.” | **Unsupported / contradicted** | Google says Search ignores it. | Do not make it a Google visibility project. |
| “Schema is invisible content for AI bots.” | **Misleading** | Structured data is machine-readable but must match visible content; it is not a substitute. | Keep one visible and machine-consistent fact model. |
| “AI systems only read the first paragraph.” | **Unsupported** | Google describes passage understanding and rejects fixed chunking; other systems retrieve multiple sources/pages. | Put key context early for users, but govern the full page. |
| “Mentioning a brand frequently creates entity authority.” | **Misleading** | Google warns against inauthentic mentions. | Build real identity, references and user value. |
| “Longer content always ranks better.” | **Unsupported** | Google says there is no ideal page length or preferred word count. | Match depth to task and risk. |
| “Publishing hundreds of AI pages builds topical authority.” | **Misleading** | Scaled low-value publishing can violate spam policies. | Require unique purpose, source and maintenance capacity. |
| “Server-side rendering automatically improves rankings.” | **Misleading** | Reliable crawlability can improve access, but rendering mode is not an automatic rank boost. | Choose robust delivery for users and crawlers. |
| “External links to official sources reduce ranking power.” | **Unsupported** | No authoritative evidence supports the claim. | Link where verification benefits the user. |
| “AI-generated content is automatically penalized.” | **Unsupported** | Google evaluates quality and purpose, not generation method alone. [G-AI-CONTENT] | Use AI under quality and governance controls. |
| “Being cited by ChatGPT means the page ranks well in Google.” | **Unsupported** | Products use distinct retrieval and ranking systems. | Measure each platform separately. |
| “Blocking training bots prevents all AI use.” | **Misleading / false** | Search and user-fetch agents are documented separately. | Define controls per access purpose. |
| “Allowing an AI crawler guarantees inclusion or citation.” | **Unsupported / false** | Platforms reserve selection discretion. | Treat allow rules as eligibility, not entitlement. |

### Additional myths

| Claim | Rating | Implication |
|---|---|---|
| “A knowledge graph means we need a graph database.” | Unsupported | Model entities first; select storage later. |
| “A citation proves the answer is supported.” | Misleading | Validate claim-to-source entailment; academic research has found citation errors. [CITATION-STUDY] |
| “Fresh timestamps make pages look current.” | Misleading | Use dates only for real changes or verification. |
| “Official source means the site will always be available.” | Unsupported | Maintain resilient status and last-verification handling. |
| “AI traffic can be measured precisely.” | Unsupported | First-party tools remain partial and product-specific. |

---

## LotteryCorner Opportunity Assessment

Ratings: High / Medium / Low are relative and preliminary.

| Opportunity | User value | Traditional Search value | AI retrieval value | Originality | Accuracy risk | Maintenance cost | Required source quality | Confidence |
|---|---|---|---|---|---|---|---|---|
| State-lottery entity hubs | High | High | High | Medium | High | High | Official state sources | High |
| Draw-level source and correction records | Very high | High | Very high | High | Very high | High | Direct official result sources | High |
| Unified game/state relationships | High | High | Very high | High | High | High | Official game/rule sources | High |
| Historical result datasets | Very high | High | Very high | High | High | High | Complete authoritative records | High |
| Statistics tied to source records | High | High | Very high | High | Medium | Medium-high | Validated historical data | High |
| Claim-rule normalization | Very high | High | Very high | Very high | Very high | Very high | Official rules/forms/statutes | High |
| Purchase-availability information | Very high | High | Very high | High | Very high | Very high | Official/legal/partner evidence | Medium-high |
| Scratcher monitoring | High | High | Very high | Very high | Very high | Very high | Official current inventory | Medium-high |
| Unclaimed-prize monitoring | High | High | High | High | Very high | High | Official lists/releases | Medium-high |
| Official-source registry | Indirect but foundational | Medium | High | High | Medium | Medium | Primary-source verification | High |
| Change detection and verification history | High | Medium-high | Very high | Very high | High | High | Stable source snapshots | High |
| Original tools | Very high | High | High | High | Varies | High | Governed data/methodology | High |
| News | Medium-high | High | Medium-high | Medium | High | High | Primary sources and reporting | Medium-high |
| Community | Medium-high | Medium | Medium-high | High if authentic | Very high | Very high | Human moderation/source links | Medium |
| AI-assisted question answering | High | Medium | Very high | High when grounded in own data | Very high | High | Governed retrieval and citations | Medium-high |
| Affiliate purchase paths | High for eligible buyers | High intent | High recommendation value | Low-medium | Very high | High | Current authorization/availability | Medium-high |

## Opportunity interpretation

### Highest strategic value

1. Draw-level provenance/corrections
2. Complete historical datasets
3. Unified entity relationships
4. Rule normalization/versioning
5. Source-backed statistics and tools
6. Source registry/change detection

These are foundational assets that can support both pages and AI answers.

### Highest commercial value but highest trust risk

- purchase availability;
- affiliate/courier pathways;
- scratcher comparison; and
- jackpot/cutoff information.

### Highest network-effect potential

- community;
- saved analyses;
- alerts; and
- AI question answering.

These should follow, not precede, the trust/data foundation.

---

## Risks and Failure Modes

## Data and temporal failures

- latest result is stale;
- wrong draw variant;
- timezone omission;
- advertised jackpot presented as confirmed;
- corrected result silently overwritten;
- rule remains visible after supersession;
- scratcher snapshot presented as current without timestamp;
- unclaimed prize remains listed after claim/expiry;
- automatic `lastmod` falsely indicates freshness.

## Entity failures

- national game confused with state-specific offering;
- lottery organization confused with state government;
- courier presented as official;
- same game name incorrectly merged across states;
- claim center confused with retailer;
- winner event inferred from an unverified social post.

## Retrieval failures

- passage loses jurisdiction/date context;
- table row extracted without headers;
- source note separated from claim;
- AI combines two states’ rules;
- a current page and historical page compete;
- an older cached passage is reused after correction.

## Crawler/access failures

- Cloudflare challenges legitimate crawlers;
- managed robots overrides source-controlled policy;
- a broad block targets search and training together;
- IP ranges are stale;
- UA-only allow rule admits spoofing;
- `noindex` cannot be read because crawling is blocked;
- API-only content is unavailable to crawler/fetcher;
- origin differs from CDN response.

## Provenance failures

- source URL changes;
- source document has no effective date;
- official sources conflict;
- retrieval time mistaken for effective time;
- a citation does not support the generated statement;
- a generic state homepage is cited for a specific legal rule;
- author/reviewer roles are fictional or unclear.

## Community failures

- synthetic threads;
- affiliate spam;
- fake winners;
- unsupported number systems;
- personal information exposure;
- low-quality profiles/tags indexed;
- AI response volume displaces authentic members.

## Commercial failures

- state eligibility is wrong;
- cutoff is stale;
- partner becomes unavailable;
- disclosure is missing;
- paid destination looks official;
- conditions are omitted from an extracted recommendation;
- responsible-play context is absent.

## AI-publishing failures

- hallucinated source;
- generated number corruption;
- false “verified” label;
- rule interpretation without specialist review;
- mass near-duplicate pages;
- generic AI content reduces information gain;
- translation changes a legal condition;
- model-generated confidence appears as official probability.

## Measurement failures

- referral traffic treated as total AI visibility;
- citation count treated as ranking;
- third-party estimates presented as first-party data;
- tests ignore geography/account tier;
- one successful prompt is generalized;
- brand growth is attributed to one technical change without control.


---

## Research Recommendations

### R1 — Preserve one canonical fact system

**RECOMMENDATION — High confidence**

Visible pages, structured data, datasets, internal APIs, AI answers and editorial tools should derive from one governed record where feasible.

### R2 — Add access-purpose governance

Maintain a crawler/access matrix with:

- provider;
- agent;
- purpose;
- official documentation URL;
- current UA/IP verification method;
- robots policy;
- WAF policy;
- last reviewed date; and
- business owner decision.

### R3 — Establish source and correction infrastructure first

Before adding large-scale AI content, ensure:

- official-source registry;
- retrieval timestamps;
- verification status;
- correction events;
- rule effective/superseded states; and
- failure fallbacks.

### R4 — Make passages independently safe

Current result, cutoff, claim, anonymity, tax, online-purchase and scratcher statements should retain context when extracted.

### R5 — Prioritize non-commodity assets

Invest in normalized data, historical completeness, corrections, comparisons, tools and reproducible analysis rather than generic generated summaries.

### R6 — Treat high-risk topics as specialist content

Tax, legal, anonymity, ownership, claim exceptions and responsible play require specialist or qualified editorial review.

### R7 — Keep content classes visibly separate

Official fact, LotteryCorner analysis, community statement, AI synthesis and commercial recommendation must have distinct labels and source rules.

### R8 — Do not make experimental files launch dependencies

`llms.txt`, proprietary AI preference signals and unsupported schema should remain optional experiments.

### R9 — Build measurement before optimization claims

Configure Search Console, Bing Webmaster Tools, referral analytics, verified bot logs and benchmark queries. Preserve baselines.

### R10 — Recheck documentation at implementation

Crawler identities, controls, AI reports and product availability are time-sensitive. Revalidate during robots, metadata, schema and launch-readiness research.

---

## Conflicts or Corrections to Prior Research

| Prior statement or implication | Newer/stronger evidence | Recommended correction | Effect on future research |
|---|---|---|---|
| “Google’s July 10, 2026 generative-search guidance…” | The official page confirms `Last updated 2026-07-10 UTC`. [G-AI-GUIDE] | No correction required; preserve the exact date. | Use source metadata rather than search-result date estimates. |
| “No special AI technical file is required.” | Explicitly documented for Google Search; not a universal statement for every platform. Google says Search ignores `llms.txt`. Some documentation ecosystems publish it. | Scope as: “No special AI file is required for Google Search; no universal cross-platform requirement is established.” | Every standards claim must identify the platform. |
| AI search was treated broadly as one consumer of governed facts. | OpenAI, Anthropic, Google and Perplexity document separate search, training and user-fetch paths. | Add access-purpose distinctions to the architecture. | Robots/WAF research must be agent-specific. |
| Search Console AI reporting was described as evolving. | Google launched a dedicated Generative AI performance report on June 3, 2026. [G-SC-AI] | Treat the report as currently documented, while recording property/feature limitations. | Include it in the baseline measurement plan. |
| The predecessor did not discuss Google-Extended. | Google documents Google-Extended as a control for specified Gemini training and grounding, with no Search inclusion/ranking impact. [G-GOOGLE-EXTENDED] | Add Google-Extended as a separate publisher-policy decision. | Do not conflate Googlebot and Gemini reuse preferences. |
| “Structured data may help AI understanding” could be interpreted as a direct citation tactic. | Google explicitly says structured data is not required for generative Search and no special AI schema exists. | Retain structured data for visible consistency and supported search features; do not claim citation causation. | Schema research must avoid unsupported AI properties. |
| State facts can be repeated across contextual pages. | Passage retrieval increases the consequence of contradictory copies. | Repeat from one governed source; avoid independent manual copies. | Blueprint research must identify the canonical fact owner. |
| Official-source links were primarily trust features. | They also support source reconciliation and internal agent verification, but citation/ranking effect remains unproven. | Expand provenance use while preserving the non-ranking caveat. | Source registry becomes a required blueprint input. |
| Current data was classified P0-P3. | AI retrieval adds explicit state transitions such as pending, preliminary, official, corrected and superseded. | Keep P0-P3 and add temporal state vocabulary. | State-page blueprint must expose status without designing final presentation yet. |
| The predecessor warned about official-site outages. | Current platform/WAF research shows LotteryCorner itself can create equivalent access failures through CDN challenges or managed robots. | Add crawler and edge-access testing to launch governance. | Robots and infrastructure validation become separate research tasks. |

---

## Open Questions

1. Which OpenAI, Anthropic, Perplexity and Microsoft agents currently visit LotteryCorner in real server logs?
2. What is LotteryCorner’s explicit policy on model training versus search retrieval?
3. Does the business want Google-Extended allowed, blocked or selectively allowed?
4. Which Cloudflare managed robots, bot-management and AI Crawl Control features are enabled?
5. Do any current WAF rules challenge Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot or PerplexityBot?
6. Which official state sources provide stable feeds rather than only rendered pages?
7. Which states expose correction status and official publication timestamps?
8. Which claim/tax/anonymity topics require external legal review?
9. Which historical datasets can LotteryCorner lawfully redistribute or license?
10. What first-party Search Console query families show AI-style multi-condition demand?
11. Does Bing Webmaster AI Performance show existing LotteryCorner citations?
12. Does Search Console’s Generative AI report contain enough data for state/game segmentation?
13. Which pages are already cited by ChatGPT, Claude, Perplexity or Copilot under controlled tests?
14. What citation errors occur when a page contains several draw variants or states?
15. Which social-preview and monitoring bots must remain available through Cloudflare?
16. Should public downloadable datasets have explicit reuse licenses?
17. What is the source-precedence policy when state and national game sources disagree?
18. How should preliminary results be published when the official source has not confirmed them?
19. Can scratcher inventory be refreshed reliably enough to justify a public comparison product?
20. Which internal identities and review roles can be staffed consistently?

---

## Evidence Gaps

### Platform gaps

- No complete public algorithm for citation selection.
- No universal AI crawler registry.
- Limited public detail on every Copilot surface.
- Limited documentation of consumer Gemini retrieval architecture.
- No authoritative general proof that `llms.txt` improves third-party consumer answer visibility.
- No universal content-licensing preference standard.
- No reliable, complete social-preview crawler inventory was established in this research.
- User-directed fetch behavior may differ from automatic crawl documentation.

### Lottery data gaps

- State-by-state source stability and refresh frequency.
- Historical correction completeness.
- Scratcher inventory coverage.
- Claim-rule effective dates.
- Courier authorization evidence by state.
- Official retailer/claim-center update feeds.
- Data licensing and redistribution terms.

### Measurement gaps

- LotteryCorner Search Console and Bing data.
- Verified server logs.
- AI referral baseline.
- Citation baseline.
- Controlled query observations by geography/tier.
- Conversion and task-completion data.

### Research quality limitation

Several 2026 product documents are recent and may change. Academic crawler-compliance research published in July 2026 is too new to treat as settled platform behavior.

---

## Inputs Required for the State Page Blueprint

The future state-page blueprint should not begin until the following inputs are available or explicitly marked unresolved.

### Entity inputs

- state/jurisdiction registry;
- official lottery organization registry;
- state game portfolio;
- national-game-to-state-offering relationships;
- draw variants;
- official apps, purchase channels, retailers and claim centers;
- stable identifiers and naming rules.

### Fact ownership inputs

For each fact family:

- canonical owner;
- official source;
- change frequency;
- trust tier;
- status vocabulary;
- page contexts that may display it;
- whether it can be repeated from the same source object.

### Freshness inputs

- P0-P3 classification;
- expected source publication time;
- retrieval schedule;
- pending/official/corrected transitions;
- outage fallback;
- visible dates;
- correction rules.

### Provenance inputs

- source registry;
- source-precedence policy;
- retrieval/verification/effective dates;
- reviewer roles;
- correction log requirements;
- dataset methodology and coverage.

### Access inputs

- search crawler policy;
- training crawler policy;
- user-directed fetch policy;
- Google-Extended policy;
- Cloudflare/WAF configuration;
- bot verification mechanism;
- monitoring and alerting.

### Content-class inputs

- official facts;
- LotteryCorner editorial analysis;
- statistical calculations;
- community contributions;
- AI synthesis;
- commercial/affiliate material;
- responsible-play information.

Each must have a distinct labeling and governance policy.

### Search and retrieval inputs

- accepted search-intent families from the predecessor;
- canonical URL-object map;
- query families requiring state/game/date disambiguation;
- passage-safety requirements;
- internal relationship map;
- indexability criteria.

### Commercial inputs

- partner identity;
- state eligibility;
- official/courier/affiliate classification;
- material terms and fees;
- cutoff source;
- disclosure wording policy;
- responsible-play requirements;
- suspension criteria when verification fails.

### Measurement inputs

- Search Console baseline;
- Search Console Generative AI report;
- Bing AI Performance;
- server-log bot baseline;
- analytics referral classification;
- benchmark questions;
- correctness/citation evaluation rubric.

### Schema handoff inputs

- entities requiring markup research;
- dataset candidates;
- editorial/community content types;
- visible/structured consistency rules;
- sameAs candidates and exclusions;
- temporal/status fields needing schema evaluation.

### Blueprint constraint

The blueprint should choose page sections only after determining which canonical information objects are needed to satisfy the accepted intent families. This document does not choose those sections.

---

## References

All web sources were retrieved July 20, 2026. “Current documentation” means the page did not expose a precise publication date in the retrieved content.

### Accepted foundation

**[BASE-00] LotteryCorner.com State Lottery Search & SEO Research**  
Publisher: LotteryCorner project research  
Date: July 20, 2026  
Source category: Accepted internal research foundation  
Supports: Intent families, personas, trust tiers, content classes, freshness categories, provenance and entity ecosystem principles  
Location: Uploaded project file `00-search-seo-research.md`

### Google Search and Gemini

**[G-AI-GUIDE] Optimizing your website for generative AI features on Google Search**  
Publisher: Google Search Central  
Updated: July 10, 2026  
URL: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide  
Category: Official platform documentation  
Supports: SEO/AEO/GEO relationship, RAG, query fan-out, non-commodity content, crawlability, no fixed chunking, `llms.txt` ignored by Google Search, no AI-specific schema, measurement

**[G-AI-FEATURES] AI features and your website**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/appearance/ai-features  
Category: Official platform documentation  
Supports: Googlebot control, indexing/snippet eligibility, preview controls, Google-Extended distinction

**[G-SC-AI] Introducing Search Generative AI performance reports in Search Console**  
Publisher: Google Search Central  
Published: June 3, 2026  
URL: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports  
Category: Official platform announcement  
Supports: Dedicated generative AI performance reporting and limitations

**[G-GOOGLE-EXTENDED] Google’s common crawlers — Google-Extended**  
Publisher: Google Crawling Infrastructure  
Updated: July 14, 2026  
URL: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers  
Category: Official crawler documentation  
Supports: Google-Extended affected products; no impact on Google Search inclusion/ranking

**[G-ROBOTS] Introduction to robots.txt**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/crawling-indexing/robots/intro  
Category: Official platform documentation  
Supports: Crawl control is not deindexing or security

**[G-ROBOTS-META] Robots meta tags specifications**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag  
Category: Official platform documentation  
Supports: Meta robots, `X-Robots-Tag`, crawler-specific directives, crawlability requirement

**[G-SITEMAP-LASTMOD] Build and submit a sitemap**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap  
Category: Official platform documentation  
Supports: Accurate `lastmod` based on significant updates

**[G-STRUCTURED-DATA] Introduction to structured data markup in Google Search**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data  
Category: Official platform documentation  
Supports: Structured data helps understanding/feature eligibility

**[G-STRUCTURED-DATA-POLICIES] Structured data general guidelines**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/appearance/structured-data/sd-policies  
Category: Official platform documentation  
Supports: Visible-content consistency and quality policies

**[G-DATASET] Dataset structured data**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/appearance/structured-data/dataset  
Category: Official platform documentation  
Supports: Dataset metadata and discovery

**[G-DISCUSSION] Discussion forum structured data**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/appearance/structured-data/discussion-forum  
Category: Official platform documentation  
Supports: Genuine user-generated discussion requirements

**[G-QAPAGE] Q&A structured data**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/appearance/structured-data/qapage  
Category: Official platform documentation  
Supports: Narrow QAPage eligibility and non-FAQ purpose

**[G-AI-CONTENT] Guidance about AI-generated content**  
Publisher: Google Search Central  
Published: February 8, 2023; current guidance maintained in documentation  
URL: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content  
Category: Official platform guidance  
Supports: Quality/purpose rather than automatic AI-content penalty

**[G-SPAM] Spam policies for Google web search**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/essentials/spam-policies  
Category: Official platform policy  
Supports: Scaled content abuse, thin affiliation, reputation abuse

**[G-SPONSORED] Qualify outbound links**  
Publisher: Google Search Central  
Date: Current documentation  
URL: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links  
Category: Official platform guidance  
Supports: `rel="sponsored"` and `rel="ugc"`

**[GEMINI-SEARCH-GROUNDING] Grounding with Google Search**  
Publisher: Google AI for Developers  
Updated: July 6, 2026  
URL: https://ai.google.dev/gemini-api/docs/google-search  
Category: Official developer documentation  
Supports: Search queries, current grounding, citations and grounding metadata

**[GEMINI-URL-CONTEXT] URL Context**  
Publisher: Google AI for Developers  
Date: Current documentation  
URL: https://ai.google.dev/gemini-api/docs/url-context  
Category: Official developer documentation  
Supports: Indexed cache and live fetch fallback behavior

### OpenAI

**[OAI-BOTS] Overview of OpenAI Crawlers**  
Publisher: OpenAI  
Date: Current documentation  
URL: https://developers.openai.com/api/docs/bots  
Category: Official crawler documentation  
Supports: `OAI-SearchBot`, `GPTBot`, `ChatGPT-User`, independent settings, published IP ranges

**[OAI-PUBLISHERS] Publishers and Developers FAQ**  
Publisher: OpenAI Help Center  
Updated: approximately July 15, 2026  
URL: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq  
Category: Official platform documentation  
Supports: ChatGPT search inclusion, `noindex`, referral tags, Atlas accessibility guidance

### Microsoft and Bing

**[BING-CRAWLERS] Which Crawlers Does Bing Use?**  
Publisher: Bing Webmaster Tools  
Date: Current documentation  
URL: https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0  
Category: Official crawler documentation  
Supports: `bingbot`, MicrosoftPreview, UA spoofing warning, verification

**[BING-VERIFY] How to Verify Bingbot**  
Publisher: Bing Webmaster Tools  
Date: Current documentation  
URL: https://www.bing.com/webmasters/help/how-to-verify-bingbot-3905dc26  
Category: Official crawler documentation  
Supports: IP/reverse-DNS verification

**[BING-ROBOTS-META] Robots meta tags and attributes that Bing supports**  
Publisher: Bing Webmaster Tools  
Date: Current documentation  
URL: https://www.bing.com/webmasters/help/robots-meta-tags-and-attributes-that-bing-supports-5198d240  
Category: Official platform documentation  
Supports: Bing indexing/display directives

**[BING-COPILOT-CONTROLS] Announcing new options for webmasters to control usage of their content in Bing Chat**  
Publisher: Microsoft Bing Blogs  
Published: September 22, 2023  
URL: https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat  
Category: Official platform announcement  
Supports: `NOCACHE`/`NOARCHIVE` publisher controls; requires current revalidation

**[BING-AI-PERFORMANCE] Introducing AI Performance in Bing Webmaster Tools Public Preview**  
Publisher: Microsoft Bing Blogs  
Published: February 10, 2026  
URL: https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview  
Category: Official platform announcement  
Supports: Citation metrics, grounding queries and stated limitations

**[MS365-WEB-SEARCH] Manage web search in Microsoft 365 Copilot**  
Publisher: Microsoft Learn  
Date: Current documentation  
URL: https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access  
Category: Official product documentation  
Supports: Bing-grounded public web queries, admin/product limitations

**[AZURE-BING-GROUNDING] Use Bing grounding tools in Azure AI Foundry agents**  
Publisher: Microsoft Learn  
Updated: 2026 documentation  
URL: https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/bing-tools  
Category: Official developer documentation  
Supports: Query formation, search, synthesis, citations and availability limits

### Anthropic

**[ANT-BOTS] Does Anthropic crawl data from the web, and how can site owners block the crawler?**  
Publisher: Anthropic / Claude Help Center  
Updated: April 7, 2026  
URL: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler  
Category: Official crawler documentation  
Supports: `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, robots and crawl-delay behavior

**[ANT-WEB-SEARCH] Enable and use web search**  
Publisher: Anthropic / Claude Help Center  
Date: Current documentation  
URL: https://support.claude.com/en/articles/10684626-enable-and-use-web-search  
Category: Official product documentation  
Supports: Live web grounding, citations, direct fetch, model/plan limitations

**[ANT-REMOVE] Reporting, Blocking, and Removing Content from Claude**  
Publisher: Anthropic / Claude Help Center  
Date: Current documentation  
URL: https://support.claude.com/en/articles/7996906-reporting-blocking-and-removing-content-from-claude  
Category: Official platform documentation  
Supports: Publisher reporting and output controls

### Perplexity

**[PPLX-BOTS] Perplexity Crawlers**  
Publisher: Perplexity developer documentation  
Date: Current documentation  
URL: https://docs.perplexity.ai/docs/resources/perplexity-crawlers  
Category: Official crawler documentation  
Supports: `PerplexityBot`, `Perplexity-User`, robots behavior, published IP ranges, WAF guidance

**[PPLX-HOW-IT-WORKS] How does Perplexity work?**  
Publisher: Perplexity Help Center  
Date: Current documentation  
URL: https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work  
Category: Official product documentation  
Supports: Web retrieval and source citations

**[CF-PPLX-STUDY] Perplexity is using stealth, undeclared crawlers to evade website no-crawl directives**  
Publisher: Cloudflare  
Published: August 4, 2025  
URL: https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/  
Category: Infrastructure-provider observation; contested platform behavior  
Supports: Neutral controversy and need for log verification

### Cloudflare and access infrastructure

**[CF-MANAGED-ROBOTS] Managed robots.txt**  
Publisher: Cloudflare Docs  
Updated: July 1, 2026  
URL: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/  
Category: Official infrastructure documentation  
Supports: Managed rules, voluntary nature of robots, Content Signals

**[CF-AI-CRAWL] Manage AI crawlers with AI Crawl Control**  
Publisher: Cloudflare Docs  
Updated: July 1, 2026  
URL: https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/  
Category: Official infrastructure documentation  
Supports: Edge-level enforcement and crawler management

**[CF-VERIFIED-BOTS] Verified bots**  
Publisher: Cloudflare Docs  
Updated: July 1, 2026  
URL: https://developers.cloudflare.com/bots/concepts/bot/verified-bots/  
Category: Official infrastructure documentation  
Supports: Verified-agent categories and bot handling

### Standards and research

**[RFC9309] RFC 9309: Robots Exclusion Protocol**  
Publisher: Internet Engineering Task Force / RFC Editor  
Published: September 2022  
URL: https://www.rfc-editor.org/info/rfc9309/  
Category: Internet standard  
Supports: Robots semantics and non-authorization limitation

**[W3C-PROV] PROV-O: The PROV Ontology**  
Publisher: World Wide Web Consortium  
Recommendation: April 30, 2013  
URL: https://www.w3.org/TR/prov-o/  
Category: W3C standard  
Supports: Provenance entities, activities and agents

**[SCHEMA-DATASET] Dataset**  
Publisher: Schema.org  
Date: Living vocabulary  
URL: https://schema.org/Dataset  
Category: Semantic-web vocabulary  
Supports: Dataset concepts and properties

**[LLMSTXT] The /llms.txt file proposal**  
Publisher: llmstxt.org / Jeremy Howard and contributors  
Proposed: September 3, 2024  
URL: https://llmstxt.org/  
Category: Community proposal  
Supports: Origin and intended purpose of `llms.txt`

**[RAG-PAPER] Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**  
Authors: Patrick Lewis et al.  
Published: 2020  
URL: https://arxiv.org/abs/2005.11401  
Category: Research paper  
Supports: Formal RAG concept

**[GEO-PAPER] GEO: Generative Engine Optimization**  
Authors: Pranjal Aggarwal et al.  
Initial publication: November 16, 2023; revised June 28, 2024  
URL: https://arxiv.org/abs/2311.09735  
Category: Research paper  
Supports: Origin and experimental framing of GEO; not production platform guidance

**[CITATION-STUDY] Evaluating Verifiability in Generative Search Engines**  
Authors: Nelson F. Liu et al.  
Published: 2023  
URL: https://arxiv.org/abs/2304.09848  
Category: Research paper  
Supports: Historical evidence that citations can be incomplete or unsupported

**[AI-ROBOTS-STUDY] AI Crawlers and Assistants: Controlled Study of Robots and Authorization Compliance**  
Published: July 16, 2026  
URL: https://arxiv.org/abs/2607.14447  
Category: Recent preprint, not yet treated as settled evidence  
Supports: Observed inconsistency in agent access behavior and need for enforcement/logging

---

## Final Research Position

LotteryCorner should pursue visibility in search and AI systems by becoming the best-governed independent source for state-lottery facts and original data, not by producing AI-shaped prose or adopting unsupported files.

The durable architecture principle is:

> Publish each fact as a clearly identified, temporally scoped, source-backed and correctable information object; make it accessible to users and legitimate retrieval systems; and preserve visible boundaries between official fact, LotteryCorner analysis, community contribution, AI synthesis and commercial recommendation.

This position supports conventional SEO, live AI retrieval, citation accuracy, future agents and user trust without assuming private ranking behavior or locking the rebuild to temporary GEO tactics.
