# LotteryCorner / LuckReGenerator — Claude Code Operating Guide

## 1. Project Identity and Current Phase

- **Public product:** LotteryCorner.com
- **Internal platform codename:** LuckReGenerator
- **Repository root:** `/Users/bala/Learning/lc`
- **Current phase:** architecture-controlled frontend renewal, governed by a frozen Product Constitution, a final-approved Experience Architecture, and final-approved page-family blueprints.

Rules for this phase:

- The existing implementation in `01-new-ui` is **reference work, not approved architecture**. It was built against earlier requirements that the blueprints now supersede.
- **Selective reuse is the approved strategy.** Keep valuable infrastructure; rebuild page composition, the shell, the route registry, and the fixture/view-model contracts against the blueprints.
- **One active task at a time.** Complete the assigned task, report, and stop.
- Design-system creation and page implementation are **separate, later, individually approved tasks**.

---

## 2. Source-of-Truth Hierarchy

Authority order. A lower-numbered source always wins.

1. **Explicit founder instruction in the active task.**
2. **Frozen Product Constitution** — `03-docs/00-foundation/authoritative/00A-v2.1-luckregenerator-product-constitution-FROZEN.md` (v2.1, accepted and frozen).
3. **Final-approved Experience Architecture** — `03-docs/00-foundation/authoritative/01-lotterycorner-experience-architecture-FINAL-APPROVED.md` (v1.1).
4. **Final-approved Global Shell and page-family blueprints** — `03-docs/01-approved-blueprints/**` (excluding `insider/pending/`).
5. **Approved decision registers** — `03-docs/08-decisions/source-authority.md` and `source-conflicts.md`.
6. **Supporting research** — `03-docs/00-foundation/research/**` and `03-docs/research/00-search-seo-research.md`.
7. **Previous implementation and previous research** — `01-new-ui`, `04-sample-data`, `05-design-inputs`, `03-docs/00`–`22`, `03-docs/02-previous-work/**`. Reference only.
8. **Legacy Struts/JSP application** — `00-reference-existing-project/**`. Read-only evidence only.

### Binding rules

- **Internal document `Version` and `Status` override filenames.** A filename containing `FINAL-APPROVED` proves nothing. Several approved documents lack the marker; one internally-proposed document sat inside a package named `FINAL-APPROVED`.
- **"Complete" is not "approved."** A document stating research or authorship is complete is not thereby founder-approved.
- **Frozen and final-approved documents override previous implementation**, always.
- **Supporting research informs; it does not override** frozen product decisions or approved blueprints.
- **Previous documentation is knowledge and history**, not requirements, unless a task explicitly promotes it.
- **Do not infer approval from the existence of code.** That something is implemented in `01-new-ui` is evidence of past intent, never of current approval.
- **A missing approved blueprint blocks its page family.** Absence is not permission to fall back to tier 7.
- **Conflicts MUST be recorded in `03-docs/08-decisions/source-conflicts.md`, never silently reconciled.** If two sources disagree and the hierarchy does not settle it, stop and report.
- Version numbers are not comparable across page families. Approval is carried by `Status`.

---

## 3. Repository Map

| Path | Role | Write policy |
|---|---|---|
| `00-reference-existing-project/` | Legacy Java/Struts/JSP production app. Read-only behavioral, route, data, monetization and migration evidence. | **Never write.** |
| `01-new-ui/` | Target frontend. Next.js App Router + React + TypeScript + Tailwind. | Write only in an approved UI task. |
| `02-new-api/` | Future Spring Boot API. Currently **empty**. | **Do not touch** until UI contracts stabilize and a dedicated API task is approved. |
| `03-docs/` | Architecture, blueprints, decisions, specifications. | Write only in the paths a task names. |
| `04-sample-data/` | Fixtures plus production-derived reference data (ad inventory, footer config, DB exports, results feed). | Write only in an approved data task. |
| `05-design-inputs/` | Visual and content references. | Read-only in practice. |
| `CLAUDE.md` | This operating guide. | Governance tasks only. |

- The **root repository is Git-controlled** (`main`).
- `00-reference-existing-project/LotteryCorner40/` is an **independent nested Git repository**, excluded from the root repository by `.gitignore`. It is **not** a submodule and MUST NOT become one.

---

## 4. Git Safety

Every task MUST:

1. Begin with `git status --short` and `git branch --show-current`.
2. **Report unrelated uncommitted changes before proceeding.** Do not absorb them into your commit and do not "clean them up."
3. Commit only task-scoped changes, with the commit message the task specifies.
4. End by reporting the final `git status --short`.

You MUST NOT, unless the active task explicitly requests it:

- `reset`, `clean`, `stash`, `checkout` over changes, `commit --amend`, `rebase`, force-push, delete or rename branches, or alter Git configuration (local or global).
- Add a remote or push. **Pushing REQUIRES APPROVAL every time.**

Never commit:

- `node_modules/`, `.next/`, and other build or vendor output
- `.DS_Store`
- secrets of any kind
- `.claude/settings.local.json`
- any content under the nested legacy repository

If Git author identity is unavailable, **stop before committing** and report it rather than inventing one.

---

## 5. Legacy Isolation

- **No JSP or Struts development.** MUST NOT.
- **No copying legacy CSS, markup, or class names** into the new UI.
- **No modification of `00-reference-existing-project/**`.** MUST NOT.
- **No imports, path references, build aliases, or runtime dependencies** from the legacy project into `01-new-ui` or `02-new-api`. Knowledge transfers by transcription into `03-docs` or `04-sample-data` with recorded provenance — never by code dependency.
- Legacy reading is permitted, and often required, **only** as evidence of: public routes; business rules; production data structures; ad inventory; affiliate behavior; SEO behavior; migration constraints.
- The nested repository has a **pre-existing uncommitted modification to `.project`** (an Eclipse metadata file, dated before this program of work). It MUST remain untouched — not committed, not reverted — unless separately authorized.
- MUST NOT run unrestricted or wildcard shell commands inside the legacy directory.

The legacy tree remains the **only** source for ad-slot families not yet captured (`lc_mgp_*`, `lc_bp_*`, `lc_bdp_*`, `lc_jp_*`, `lc_gh_*`), `ResultFormat_Upgrade.properties`, `Affiliate.properties`, and the production `sitemap.xml`. It must stay readable and unmodified for the remainder of the rebuild.

---

## 6. Selective-Reuse Policy

Every implementation task MUST classify each affected artifact as exactly one of:

**KEEP** · **KEEP AND RESTYLE** · **REFACTOR** · **MERGE** · **REPLACE** · **ARCHIVE** · **KEEP AS REFERENCE**

Rules:

- **Preserve valuable infrastructure.** Do not rebuild working, decoupled infrastructure without evidence that it fails a blueprint requirement.
- **Do not preserve old page composition merely because it exists.** Section order and page structure come from the blueprints.
- **Do not delete previous work** outside an approved cleanup task. ARCHIVE, do not delete.
- **Existing JSON fixtures are NOT automatically future API contracts.** They encode the previous page requirements.

### Currently favored for reuse

- Next.js / React / TypeScript foundation and its strict TS configuration
- Result cards and number-ball rendering (already format-driven; never hardcodes ball counts)
- Ad inventory definitions and the space-reservation / lazy-ready ad components
- SEO and JSON-LD helpers
- `cleanCopy` (strips internal `[ADMIN]` / `[VERIFY-*]` markers before render)
- Partner-script environment gating
- Campaign framework (placement allowlist, priority, GAM separation)
- Data-provider seam (single module owning where data comes from)
- Production-derived reference data (ad slot definitions, footer config, DB exports, results feed, payout normalization)

### Requires blueprint-driven redesign

- Shell, header, footer, navigation, mobile navigation
- Home composition
- State composition
- Route registry
- Fixture and view-model contracts
- Design system (tokens, type scale, breakpoints)
- Mobile ad distribution

---

## 7. Product Constitution Rules

Implementation-facing summary. The Constitution itself governs; read it for the reasoning.

- **Deliver immediate value before engagement.** The user's reason for arriving MUST be satisfied before the product asks for registration, discussion, purchase, or further exploration. Results before recommendations. Claim guidance before ads. Tool output before "save this."
- **Complete public value stays public.** Current winning numbers, basic history, official source links, core game rules, basic odds, claim and responsible-play information, corrections, and at least one complete public AI answer MUST remain available without an account. An account unlocks **continuity, not truth**.
- **Registration follows demonstrated value** — at the moment the user has something worth preserving. MUST NOT interrupt result-checking with a premature prompt.
- **AI is contextual, clearly labelled, and supportive.** AI entry points MUST be relevant to the surface. A single floating chat button is not an AI strategy. AI MUST be clearly identified when it posts in community, summarizes opinion, generates numbers, interprets a ticket image, personalizes a recommendation, substantially transforms editorial content, or answers a high-consequence question. MUST NOT create AI accounts that appear human.
- **Community content is human-authored.** MUST NOT fabricate posts, threads, replies, reputation, or activity.
- **Commerce is state-aware and safety-sensitive.** Purchase availability MUST reflect current jurisdiction rules. An affiliate MUST NEVER be presented as an official lottery. A result MUST NEVER be confused with an ad. Commission MUST NOT covertly drive neutral recommendations.
- **Distinguish claim types explicitly:** verified fact · statistically true historical observation · historical coincidence · LotteryCorner analysis · community belief · entertainment tool · unsupported prediction. Respect player culture (lucky numbers, hot/cold lists, systems, wheels) without endorsing false claims.
- **Protect these from interruption and commercial pressure:** result verification · claim guidance · correction notices · AI answer blocks · tool input/output flows · responsible-play guidance.
- **Language MUST NOT** assert certainty or prediction, imply that history or AI generation changes the odds of a fair independent draw, use manipulative urgency, or say "increase your chances."
- **Suppress commerce and promotion in sensitive contexts** — claim journeys, responsible-play controls, distress, loss, and uncertainty-heavy states.
- **Copy pattern:** answer → classify → explain → continue. Use ordinary U.S. lottery-player language; short, familiar labels; exact dates where "today" or "last night" could be ambiguous. Avoid software, analytics, and corporate terminology in public UI. Reserve the word "official" for where the distinction materially matters.
- **Mobile is a primary surface**, not an adaptation.
- **The product MUST NOT feel like** a trading terminal, a casino interface, or an analytical dashboard.

---

## 8. Visual-Reference Hierarchy

- **Global Shell v1.1 is ACTIVE and governs** shell behavior, header and mobile navigation, Search and Ask architecture, anonymous / signed-in / Insider shell states, contextual AI-entry patterns, global trust / correction / affiliate / advertising language, the section component taxonomy and IDs, lifecycle and content-operations requirements, the metadata contract, accessibility and responsive rules, the Section Intelligence Matrix format, and **state-context precedence**. Page-family blueprints MUST reuse these rather than re-inventing them.
- **Blueprint SVGs govern structure and behavior only.** Global Shell §0.1 declares the shell visuals **non-binding references**: they do not approve final styling, colors, typography, section density, page-family content order, page-specific ad volume, or high-fidelity layout.
- **Proposed State designs** (`05-design-inputs/state-pages/proposed-screenshots/*.pdf`) are **color and style references only**. They carry no layout authority and no ad-placement authority.
- **Existing production screenshots and mobile PDFs** are **behavior and ad-inventory references only**. Note that several are height-truncated at 28800 px; page tails live in their `*2.png` partners.
- **The previous `01-new-ui`** is **reusable implementation reference only**.
- **No visual reference overrides page-family section ordering.** Section order comes from the page-family blueprint.
- **Every page-family implementation REQUIRES its own desktop and mobile review and founder approval** before it is considered complete. Shell approval is not styling approval.

---

## 9. UI Architecture Rules

- **Mobile-first responsive design.** MUST cover mobile, tablet, and desktop. MUST NOT hide revenue-critical or task-critical elements on mobile.
- **Critical results and public facts MUST be present in server-rendered HTML**, not injected client-side. Numbers MUST be text, never image-only.
- **Typed fixtures and view models.** No untyped page payloads.
- **Shared design tokens.** No raw hex values or ad-hoc spacing in components once the design system exists.
- **Shared section IDs and section contracts** per the Global Shell taxonomy.
- **Progressive disclosure** — depth on request, not by default.
- **Every page MUST implement all applicable states:** loading · empty · awaiting result · stale · corrected · unavailable · no-fill ad · anonymous · signed in.
- **Accessibility target: WCAG 2.2 AA.** Keyboard operation; visible focus never obscured by sticky elements; semantic heading structure; sufficient contrast; reduced-motion support; screen-reader labels and status announcements; accessible tables and dialogs; interactive targets ≥ 44×44 CSS px where practical; content reflows without horizontal page scrolling; the virtual keyboard must not hide inputs or actions. Color MUST NOT be the only distinction for bonus balls. Draw date and game MUST be announced before values.
- **MUST NOT display disabled controls as if they were functional.** Either implement, hide, or clearly label as unavailable.
- **MUST NOT publish synthetic fixtures as real lottery facts.** See §14.

---

## 10. Route and Migration Rules

- **Inventory existing public routes before implementing or changing anything.** The legacy production sitemap contains ~9,246 URLs, of which roughly 8,700 are yearly archive URLs.
- **MUST NEVER derive route existence from a fixture filename or a directory listing.** Routes come from an explicit config or registry.
- **MUST NEVER invent a route because a blueprint needs a page family.** Blueprint child routes define semantic ownership, not automatic URL migration.
- **Any route change REQUIRES APPROVAL** and MUST document: old route · new route · evidence (indexed URL, traffic, backlinks, internal links, affiliate revenue) · canonical impact · sitemap impact · internal-link impact · a 1:1 redirect plan. Classify each route as preserve / introduce / consolidate / redirect / archive.

### Routes that MUST be preserved

| Pattern | Notes |
|---|---|
| `/` | Home (PF-01) |
| `/{state}` — e.g. `/fl` | Two-letter state-code hubs (PF-02), including territories such as `/pr`, `/vi` |
| `/powerball`, `/mega-millions` | Flagship game brand hubs (BP-04A) |
| `/{state}/{game}` — e.g. `/fl/pick-3`, `/fl/powerball` | Jurisdiction game pages (BP-04B) |
| `/{state}/{game}/{year}` and `/{game}/{year}` | Yearly results archives — the largest indexed surface |
| `/news`, `/community`, `/community/{forum-entry-slug}`, `/members/{username}`, `/tools` | Approved page-family routes |
| First-party commerce routes | **`/buynow/{code}` — CONFIRMED by `FD-RTE-06` (ratified 2026-08-11).** It is live, robots-disallowed, implemented, and the only form that carries state-aware eligibility. The former "approved pattern is `/play/{game}`" is SUPERSEDED; no migration to `/play/{game}` will happen. Note that BP-04A §5 and BP-05C still say `/play/{game}` and have not been amended — `FD-RTE-06` outranks them. |

- **MUST NEVER redirect unrelated URLs to Home.**
- **Apache and Cloudflare redirect behavior MUST be audited before adding any Next.js redirect.** Existing edge redirects are the current source of truth; avoid double-redirect chains. Next.js applies a default trailing-slash **`308`** (measured — this record previously said `301`), while the legacy app served trailing-slash twins. `FD-RTE-01` settles the direction: host, slash and case canonicalise **at the edge, to the `www` no-trailing-slash form, in one hop**. The edge rule is Stage 2 of `ROUTE-AUDIT-001` §10 and is not yet implemented.
- Legacy `struts_old.xml` routes, the `/fl` vs `/fl-new` question, and the two blog templates remain **open questions**; resolve them with evidence before any redirect map.

---

## 11. SEO, Schema, GEO and Retrieval Rules

- Every public page MUST have a **unique title, unique meta description, a single unique H1, a clean heading structure, a correct canonical, and internal links**.
- **The canonical target is `www`, with no trailing slash** — `FD-RTE-02` and `FD-RTE-03`, ratified 2026-08-11. This REVERSES the non-`www` target this record carried previously: all 9,246 indexed production URLs are already `www`, so moving would redirect the entire corpus for no reader benefit. There MUST be exactly one origin constant. `lib/seo/productionOrigin.ts` still holds the old non-`www` value and `lib/seo/siteSchema.ts` holds `www`; reconciling them to one `www` constant is `FD-RTE-03` implementation work and is not yet done, which is why every new page family stays `noindex` until it is. Do not emit conflicting canonical signals in the meantime.
- **Critical facts MUST be crawlable in the initial server HTML.** Result tables MUST be crawlable and MUST NOT depend on client-side filtering.
- Where relevant, show **visible last-updated, official-source attribution, methodology, and correction information**. A correction notice MUST state what changed, when, and the impact.
- **Schema MUST reflect visible content only.**
- Use page-family-appropriate JSON-LD: `Organization` · `WebSite` · `WebPage` · `BreadcrumbList` · `ItemList` · `FAQPage` **only** when the FAQ is visible · `Dataset` / `DataCatalog` / `DataDownload` **only** where genuinely justified · `NewsArticle` for real editorial content · `DiscussionForumPosting` for community entries.
- **MUST NOT invent lottery-specific schema types.**
- **MUST NOT add `SearchAction`** unless a working public search route exists.
- **MUST NOT claim AI-crawler or GEO behavior without evidence.** Time-sensitive crawler and answer-engine claims REQUIRE periodic re-verification; the supporting research carries a July 2026 evidence date and states that it needs refreshing.
- Sitemaps MUST carry accurate `lastmod`. A result update MUST refresh `lastmod` for the related game page, state page, archive page(s), and Home where surfaced. Sitemap coverage MUST include Home, state hubs, game pages, archives, static informational pages, and news/community once those ship; given archive volume, plan a sitemap index split by state/game/year.
- **Future requirement:** on result, jackpot, or important-content updates, submit the changed URLs to **IndexNow** for Bing and participating engines. Not implemented; plan alongside the API/feed. Adoption and key management REQUIRE APPROVAL.
- `robots.txt` MUST not accidentally block important public result pages, and MUST keep first-party commerce redirect routes out of the index. Verify that Cloudflare, WAF, or bot protection is not blocking approved crawlers.
- **Public, private, paid, and community content boundaries MUST remain explicit** in both markup and metadata.
- Trust surfaces MUST exist and be linked: About, result-source policy, update frequency, independence disclaimer, responsible-play and 18+ notices, contact, and an accuracy/corrections policy.
- Internal linking: state hubs link to their game pages, recent and historical results, claim and tax information, and official sources; game pages link to related state pages, archives, tools, and responsible play; Home links to flagship games, top states, recent results, and tools.

---

## 12. Advertising Rules

- **Google Ad Manager inventory is a production constraint, not a design choice.** 47 slot definitions with size maps and div IDs are recorded in `04-sample-data/ad-slot-definitions.json`, transcribed verbatim from production.
- **MUST NOT remove, merge, rename, move, reduce, reorder, or repurpose any slot without explicit founder approval.**
- **Mockups that omit ads do not authorize removal.** Treat such mockups as incomplete for production and lay content out around the existing slots.
- **Empty ad spaces in production screenshots are evidence of slot placement.**
- **Reserved dimensions are mandatory** to prevent layout shift, for both the desktop and mobile tiers. Note that the GAM size-mapping breakpoint (992 px) differs from the Tailwind `lg` breakpoint (1024 px); reconcile deliberately.
- **Ads MUST NOT interrupt:** result verification · claim instructions · correction notices · AI answer blocks · tool input/output flows · responsible-play guidance. No ad inside a result grid, between a game's jackpot and its numbers, between a tool's input and output, or between a pending row and its status. No ad styled as a result, jackpot card, or community topic.
- **Prohibited ad experiences:** pop-up on arrival · countdown prestitial · autoplay sound · deceptive close · result-like creative · unreserved layout shift · excessive mobile density.
- **Sticky ad, mobile bottom navigation, and sticky task actions MUST NOT compete simultaneously.** Priority: safety/system controls → bottom navigation → user-requested action (save/buy) → advertising. If bottom navigation is visible, a mobile sticky ad MUST sit above it with safe spacing, or be suppressed.
- **Campaigns are content modules and are separate from GAM.** They MUST NOT replace, move, collapse, or reorder an ad slot, and MUST render only in approved placement keys.
- **Consent and environment gating are mandatory before any partner script activates** (GAM/GPT, AdSense, GA4/GTM, push). Scripts MUST stay inert by default.
- **No-fill behavior MUST be designed explicitly.** Fixed placements do not collapse, so an unfilled slot's appearance is a deliberate design decision, not an accident.
- **Each page family REQUIRES its own production ad-inventory audit** before implementation. Slot families for game, blog, jackpot, and history pages are named but **not yet captured**; they must be read from the legacy templates first.
- 13 currently defined slots are referenced by no fixture. Do not treat that as permission to drop them — resolve with ad ops.

---

## 13. Affiliate and Commerce Rules

- **MUST NEVER expose or hardcode a raw affiliate URL** in UI, metadata, schema, fixtures, sitemaps, logs, or AI output. Partner domains and tracking parameters stay in `03-docs` evidence only.
- **All purchase CTAs MUST route through a first-party resolver route.** The page exposes a LotteryCorner path; the resolver chooses the destination at click time and falls back safely when none exists.
- **Eligibility and partner selection MUST be deterministic and state-aware.** Resolve state context in the approved precedence order: page/jurisdiction context → explicit session selection → signed-in preference → granted device location → manual entry. **Coarse IP MAY only suggest a state for confirmation and MUST NEVER independently determine legal purchase eligibility, claim rules, tax guidance, or provider availability.** When state context is uncertain, ask the user.
- **Raw IP MUST NEVER be written** to redirect, content, or analytics stores.
- **Commerce CTAs REQUIRE clear, conspicuous disclosure** of the material relationship.
- **Suppress commerce** in sensitive, claim-related, or uncertainty-heavy contexts, and when eligibility data is stale.
- **Member/Insider commercial behavior remains pending founder decisions.** See §16.

---

## 14. Data and Fixture Rules

- **Every fixture MUST declare whether it is synthetic, copied, or production-derived**, and production-derived data MUST retain provenance (source file, extraction date).
- **Synthetic content MUST NEVER be presented as real public fact.** This applies to winners, prize claims, unclaimed amounts, claim deadlines, jackpots, tax guidance, testimonials, news, and community activity. Current fixtures render synthetic prose as clean production-style copy — treat that as a publication hazard and gate it by environment.
- **Fixtures MUST NOT determine route existence.**
- **Fixtures MUST NOT become API contracts by accident.** A view model is not a domain contract.
- **Date and time handling MUST preserve game-local draw date and timezone meaning.** Draw data is stored in one timezone and displayed in the game's local zone; year and date routes MUST reflect the **game-local** draw date, not a shifted one. Legacy off-by-one behavior is a symptom to test against, not a rule to reproduce.
- **Result formats MUST support:** variable ball counts (1 through 20+) · multiple ball groups · named special balls (Powerball, Mega Ball, Cash Ball, Bonus, Star, Fireball) · multipliers (Power Play, Megaplier) · add-on games · secondary draws (Double Play) · card games · **date-effective format rules**. MUST NOT hardcode a ball count or assume a uniform shape.
- Historical result display MUST NOT break. Where legacy code has date-based display conditions, document them before changing behavior.
- Format metadata coverage is currently incomplete (a small fraction of referenced games have definitions). Expanding it is data work, not a licence to hardcode.
- Prefer **configuration-driven definitions** over scattered conditionals: `GameDefinition`, `StateDefinition`, `ResultFormatDefinition`, `EffectiveDateRange`, `BallGroupDefinition`, `BonusBallDefinition`, `MultiplierDefinition`, `DrawScheduleDefinition`, `AdPlacementRule`, `AffiliateRule`, `SeoTemplate`, `PageTemplateDefinition`.
- Before simplifying any legacy business rule, **document its purpose first**. Do not assume temporary-looking code is useless.

---

## 15. API and Database Boundaries

- **`02-new-api` remains untouched** until UI contracts stabilize and a dedicated API task is approved.
- **MUST NOT scaffold Spring Boot, choose API dependencies, design or create database tables, or write migrations during a UI task.**
- **MUST NOT derive domain design directly from old page JSON.** Those shapes are presentation payloads built for superseded requirements.
- When API design begins, contracts MUST keep these concerns separate: **domain data · presentation view models · provenance · freshness · entitlement · advertising · commerce**.
- The real production MySQL schema and the live results feed in `04-sample-data` are legitimate inputs to future API design; the page fixtures are not.

---

## 16. Member / Insider Boundary

- `03-docs/01-approved-blueprints/insider/pending/**` is **NOT tier-4 authority**. Its own status records that founder decisions remain open.
- **MUST NOT implement** Member/Insider routes, paid tiers, quotas, exports, ticket records, public badges, Insider ad treatment, or promotional pauses until those decisions close.
- Within that document, only content marked **`APPROVED`** is binding — and it is binding because it derives from the Constitution, the Experience Architecture, or a tier-4 blueprint, **not** because this document repeats it. Content marked `RECOMMENDED`, `REQUIRES FOUNDER DECISION`, `SOURCE FINDING`, or `FUTURE` is **not approved architecture**.
- **Part 22 decision 11 (source-package correction) is CLOSED** — the final Experience Architecture and Global Shell v1.1 are both imported.
- **The other 11 Part 22 decisions remain OPEN.** They are enumerated in `03-docs/08-decisions/source-conflicts.md`, Conflict 3. Several intersect protected areas: decision 1 touches the `/insider` route, decision 3 touches GAM ad treatment, decision 7 touches export rights, decision 12 touches legacy copy remediation.
- **MUST NOT substitute** `03-docs/15-seo-content-admin-and-ai-strategy.md` (tier 7) as a Member/Insider requirements source.
- **MUST NOT stretch** the approved community profile and reputation blueprint to cover paid entitlement. It governs community identity and reputation only.

---

## 17. Task Execution Discipline

Every task MUST:

1. Read the source authority relevant to the page family or concern.
2. Inspect the existing implementation before planning changes.
3. State a concise plan.
4. Name the allowed and forbidden paths for the task.
5. Modify only task-scoped files.
6. Preserve unrelated work.
7. Avoid install, build, test, lint, and format commands unless the task explicitly allows them.
8. Run only the validation the task specifies.
9. Report: files read · files changed · commands run · reuse decisions · assumptions · unresolved conflicts · validation results · final Git status.
10. **Stop after the assigned task.**
11. **Never begin the next task automatically.** Recommend exactly one next task; do not execute it.

Where evidence is missing, **label it as missing rather than guessing**.

---

## 18. Permission Discipline

- **MUST NOT request permanent or project-wide access.** Prefer one-time permission, scoped to the specific command.
- **MUST NOT use `dangerouslyDisableSandbox`.**
- **MUST NOT read outside the workspace** unless the active task explicitly names an external staging path.
- **MUST NOT modify `.claude/settings.local.json`.**
- **MUST NOT run unrestricted or wildcard commands inside the legacy repository.**
- **MUST NEVER open, read, copy, summarize, print, or commit secrets**, including `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.jks`, `kubeconfig`, `application-prod*.yml`, database dumps containing values, credential-bearing logs, access tokens, passwords, and private certificates. If a secret-like value is encountered, **redact it and report only the filename and category**.
- Ask before running install, delete, network, database, deployment, or `chmod`/`chown` commands.

---

## 19. Prohibited Actions

MUST NOT, without an explicit approved task:

- destructive cleanup of any kind
- silent deletion of files, routes, slots, or content
- modification of the legacy project
- route, canonical, redirect, or sitemap-host changes
- ad-inventory removal, reduction, reordering, or renaming
- exposing raw affiliate destinations
- fabricating lottery results, winners, news, or community content
- installing or upgrading dependencies
- upgrading the framework during a page task
- refactoring unrelated code
- API, schema, or database work during a UI task
- implementing anything from pending Member/Insider recommendations
- pushing to a remote

---

## 20. Standard Final Response Format

Close every task with:

1. **Result** — PASS / PARTIAL / FAIL
2. **Source documents consulted**
3. **Reuse decisions** — per artifact, using the §6 vocabulary
4. **Files changed**
5. **Validation performed** — commands run and their outcome
6. **Known limitations**
7. **Conflicts or founder decisions required**
8. **Git status** — final `git status --short`
9. **Recommended next task** — exactly one, not executed

Be concise and factual. Report failures with their output. Do not restate the full plan unless asked. If part of the scope was blocked, complete everything else and say plainly what was left out and why.

### Public page pre-merge checklist

Before marking any public page complete, verify: unique H1 · unique title and description · correct canonical · indexable unless intentionally excluded · main content in server HTML · crawlable result tables · visible last-updated where relevant · breadcrumbs · valid JSON-LD matching visible content · internal links · sitemap handling · no duplicate page for the same intent · all applicable page states implemented · GAM slots present with reserved dimensions · clean mobile layout at 375 px with no sticky conflict · WCAG 2.2 AA checks · no synthetic content presented as fact · no fake claims, fake official affiliation, or unsupported lottery advice.
