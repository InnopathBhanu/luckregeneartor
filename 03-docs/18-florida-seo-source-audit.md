# Florida SEO Source Audit (/fl)

Audit of the **actual rendered HTML** for `/fl` in `01-new-ui` (SSG output +
live-served page), against the SEO/GEO/AEO requirements in `02` and `15`. Baseline freeze +
verification pass. Small SEO fixes applied (schema); page **not** redesigned.

Method: `npm run build` → inspected `.next/server/app/fl.html` `<head>` + body and the served page.
Build ✅, lint ✅ (Node 24).

---

## Result summary

| # | Signal | Status | Evidence / value |
|---|--------|:--:|------------------|
| 1 | **`<title>`** | ✅ | "Florida Lottery Results Today — Winning Numbers, Jackpots & How to Claim \| Lottery Corner" (unique, template suffix, no marker) |
| 2 | **meta description** | ✅ | Unique, game-listing description; no `[ADMIN]` |
| 3 | **canonical** | ⚠️ deferred | **Intentionally not emitted** — host/trailing-slash convention unverified (`14`/`16`). Not a defect. |
| 4 | **robots** | ✅ | `index,follow` |
| 5 | **OpenGraph** | ✅ (partial) | `og:title`, `og:description`, `og:site_name`, `og:type=website`. Missing `og:url`, `og:image` (see gaps) |
| 6 | **Twitter** | ✅ (partial) | `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`. Missing `twitter:image` |
| 7 | **H1** | ✅ | Exactly **1** H1 (state title); 11 `<h2>` section headings, clean hierarchy |
| 8 | **Crawlable result content** | ✅ | Ball numbers (12, 29, 37, …), special-ball labels, prizes, next-draw all server-rendered in HTML |
| 9 | **Crawlable FAQ content** | ✅ | 15 `<summary>` blocks (mini FAQ + final FAQ + odds accordions); answers in HTML, not JS-only |
| 10 | **JSON-LD types** | ✅ | Organization, WebSite (+SearchAction), WebPage, BreadcrumbList, FAQPage |
| 11 | **BreadcrumbList** | ✅ | Home › Florida Winning Numbers; absolute item URLs |
| 12 | **FAQPage (only if visible)** | ✅ | Emitted only because FAQ is visible (`faqs.visibleOnPage` gate) |
| 13 | **Organization / WebSite / WebPage** | ✅ (added this pass) | Organization (real name/logo/sameAs socials), WebSite (name "US Lottery Results" + SearchAction), WebPage per URL |
| 14 | **lastUpdated visible** | ✅ | "Last updated: July 9, 2026 at 12:11 AM ET" (visible; ISO `dateModified` in sample) |
| 15 | **Official source / responsible play** | ✅ | Official-source notice + independence disclaimer + "Play responsibly. 18+" in content |
| 16 | **No `[ADMIN]`/`[VERIFY]` markers** | ✅ | Zero occurrences in DOM (`cleanCopy` guard + real sample copy) |
| 17 | **No external affiliate URLs** | ✅ | No `thelotter` / `jackpot.com` / `lotter.com` in HTML |
| 18 | **Buy Tickets → /buynow/<code>** | ✅ | `/buynow/play-usa-powerball`, `/buynow/play-usa-megamillions` only |

## Fixes applied this pass (small, no redesign)
- Added **OrganizationSchema** + **WebSiteSchema (with SearchAction)** sitewide (`app/layout.tsx`), and **WebPageSchema** per state page (`StatePageTemplate`) — new `lib/seo/siteSchema.ts` with real production values (name, logo, social `sameAs`).
- Upgraded **BreadcrumbList** item URLs to **absolute** (via provisional `SITE_URL`).
- No page layout/content redesign; build + lint pass.

## Remaining SEO gaps (deferred / need input — not fixed here)
1. **Canonical + `og:url`** — blocked on the **host + trailing-slash convention** decision (`14`/`16` §15). Emit once confirmed; do not guess the host.
2. **`og:image` / `twitter:image`** — no real social-share image asset yet; add when a real OG image URL exists (don't invent a path).
3. **`SITE_URL` is provisional** (`https://www.lotterycorner.com`) — used for absolute schema URLs; must be reconciled with the canonical decision. Does **not** emit a canonical tag.
4. **WebSite `SearchAction`** targets `/search?q=` — a **public search endpoint does not exist yet** (TODO); the action is present per `15` §3 but is not yet functional.
5. **`dateModified` not in schema** — visible `lastUpdated` + sample ISO exist, but no machine-readable `dateModified` is emitted on WebPage/Dataset yet.
6. **No `Dataset` schema** on result/history content (recommended by `15` §3 for the results DB; deferred to history-page work).
7. **Sitemap / robots / IndexNow** — not part of the `/fl` page; handled at app level later.
8. **AMP/OG image dimensions, `article`/`NewsArticle`** — only relevant for blog/news pages (not built).

## Baseline freeze note
`/fl` is the reference implementation for the state template. Before building more states, this SEO
shape (title/desc/H1/schema set/notices/no-markers/`/buynow`) is the contract each new state page must
reproduce. Canonical + OG image are the only known head-level items intentionally pending.
