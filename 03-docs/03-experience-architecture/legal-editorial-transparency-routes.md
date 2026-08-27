# Legal, Editorial and Transparency Destinations

**Task:** LRG-SHELL-046 · **Commit:** `feat: add legal and transparency destinations` · **Baseline:** `ad91cb5`

## The governing judgement

Six footer labels were suppressed. The question for each was not "can a page be built?" but **"does approved
repository content support one?"** — because writing the missing policy would be authoring legal text, which
this task forbids.

Two destinations passed that test and were built **entirely from wording already published elsewhere on
LotteryCorner**. Four did not, and stay suppressed with the blocker recorded as *content*, not engineering.
Five Priority-B destinations are authoritative in the legacy application and were left there.

## Inventory

| # | Destination | Authoritative source | Disposition | Footer | Legal-review status |
|---|---|---|---|---|---|
| 1 | Affiliate disclosure | Footer notice (LRG-SHELL-045) · Buy Now resolver · Home play-options disclosure | **CREATE NEW-UI** `/affiliate-disclosure` | **activated** | APPROVED REPOSITORY COPY — LEGAL REVIEW STILL REQUIRED |
| 2 | Advertising and partnerships | One approved sentence only | **DEFER** | suppressed | DEFERRED — APPROVED CONTENT INCOMPLETE |
| 3 | Editorial standards | Constitution rules are internal governance, not public copy | **DEFER** | suppressed | DEFERRED — APPROVED CONTENT INCOMPLETE |
| 4 | Corrections policy | Footer trust sentence · State resources band · verification reminder | **CREATE NEW-UI** `/corrections-policy` | **activated** | APPROVED REPOSITORY COPY — LEGAL REVIEW STILL REQUIRED |
| 5 | Accessibility | CLAUDE.md §9 is an engineering target list, not a public statement | **DEFER** | suppressed | DEFERRED — APPROVED CONTENT INCOMPLETE |
| 6 | Copyright | Only the trademark-owner sentence | **DEFER** | suppressed | DEFERRED — APPROVED CONTENT INCOMPLETE |
| 7 | Terms of use | `terms_and_conditions_upgrade.jsp` | **KEEP LEGACY** `/terms-and-conditions` | active | EXISTING LEGACY POLICY — MIGRATION DEFERRED |
| 8 | Privacy policy | `privacy_policy_upgrade.jsp` | **KEEP LEGACY** `/privacy-policy` | active | EXISTING LEGACY POLICY — MIGRATION DEFERRED |
| 9 | Cookie policy | `cookies_policy_upgrade.jsp` | **KEEP LEGACY** `/cookies-policy` | active | EXISTING LEGACY POLICY — MIGRATION DEFERRED |
| 10 | About us | Legacy route, 8 references | **KEEP LEGACY** `/about-us` | active | EXISTING LEGACY POLICY — MIGRATION DEFERRED |
| 11 | Contact us | Legacy route, 63 references | **KEEP LEGACY** `/contact-us` | active | EXISTING LEGACY POLICY — MIGRATION DEFERRED |

No legacy page exists for **any** Priority-A destination — `/Affiliate` in the legacy tree is a Java properties
file, not a route. No conflict between two approved sources arose, so nothing needed deferring on that ground.

## Pages created

`/affiliate-disclosure` and `/corrections-policy`, on one small `InformationPage` template — breadcrumb, H1,
intro, semantic sections, lists, related links. Capped at a **68ch measure** so policy text does not stretch
across the State canvas. No theme system, no block engine, no CMS.

Every substantive sentence is reused verbatim from published copy. One connective sentence on the affiliate
page was reworded during review: it had used the phrase *"approved partner"* — which is the resolver's own UI
group heading, but the task's language policy prohibits it in page copy — so the option separation is now
described without it.

Both pages state independence, and neither claims LotteryCorner is a lottery, an operator, a seller, endorsed,
certified or accredited. Neither carries a fabricated review or effective date, a form, a provider name or an
affiliate URL. The corrections page promises no deadline, no 24/7 review, no notification and no archive.

## Legacy destinations retained

The five Priority-B routes stay same-site and were **not duplicated** — creating a Next.js page at any of those
paths would take canonical ownership from the authoritative legacy document without a migration decision. They
return 404 in the local preview and resolve on production; that is the documented migration state, and a test
asserts no duplicate page exists at any of the five paths.

## Footer

Two links activated (12 → 14). **Four groups, same order, visual design and trust copy untouched** — the
legal-age sentence, the helpline, the affiliate summary and the trademark line are all byte-identical.

Still suppressed: Advertising and partnerships · Editorial standards · Accessibility · Copyright, plus the six
navigation entries LRG-SHELL-045 recorded (State lottery results, Results calendar, Draw schedules, Guides and
answers, Community, LotteryCorner AI).

## Validation

Both new routes return 200 with one title, one description, one H1 and an absolute non-`www` self-referencing
canonical. Substantive content, the footer and internal links are all in raw HTML — nothing requires a modal,
a client fetch or JavaScript. No page-specific structured data was added; only the root layout's Organization
and WebSite nodes appear. The contextual Buy Now disclosure is unchanged, and no Home or State composition file
was touched.

## Remaining dependencies

1. **Four Priority-A pages need approved public copy** before they can exist — Advertising and partnerships,
   Editorial standards, Accessibility, Copyright. Each needs a founder-approved public statement; the
   accessibility page in particular must be written without a conformance or audit claim.
2. **Legal review of both new pages is outstanding.** This task implemented approved repository content; it is
   not legal advice or legal approval.
3. **Migration of the five legacy policy documents** into the new UI is deferred and needs a canonical-ownership
   decision alongside the host cutover.
4. **No cookie preference control exists.** The cookie policy is authoritative in the legacy app; no Privacy
   Manager was created, and no dead control was added to the footer.
