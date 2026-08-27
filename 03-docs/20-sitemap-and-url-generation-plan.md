# Sitemap & URL Generation Plan

Planning + route/data readiness for the new UI's sitemap. **Not** a production sitemap launch — no
generator is implemented in this task. Cross-refs: `01` (URL inventory), `02` (SEO), `18` (FL audit),
`14`/`16` (canonical decision).

## 1. Canonical target (decision)
- **Preferred future canonical host: `https://lotterycorner.com` — NO `www`, NO trailing slash.**
  - Examples: `https://lotterycorner.com/la`, `https://lotterycorner.com/me`, `https://lotterycorner.com/fl`.
- **Migration pending:** the **current production sitemap uses `www`** (`https://www.lotterycorner.com/…`). Moving to non-www is a migration decision.
  - **Do NOT force production redirects yet.** Record as **canonical target / migration pending**.
  - In `01-new-ui`, `SITE_URL` = `https://www.lotterycorner.com` today (schema absolute URLs) and canonical `<link>` is still **not emitted**. When migration is approved: set `SITE_URL = https://lotterycorner.com`, emit canonical, update sitemap host, and add `www → non-www` 301s at the CDN/Apache layer (not in Next.js) with matching sitemap `lastmod`.
- State sample JSON records the per-page target as `page.metadata.canonicalPlaceholder` = `https://lotterycorner.com/<code>` (marked VERIFY-CONVENTION; not emitted).

## 2. URL sets

### 2a. State pages (READY — 16 live)
`/{state}` for: fl, az, ar, ca, co, ct, de, ma, mi, ny, va, la, me, md, mn, ms.
- Served by `app/[state]/page.tsx` (SSG via `generateStaticParams` = states with a `state-<code>-sample.json`).
- **Only known states are generated; unknown slugs → 404** (must NOT appear in the sitemap).
- Sitemap should list exactly the states that have sample data (later: states enabled in config/DB).

### 2b. Multi-state game landing routes (planned)
`/powerball`, `/mega-millions`, `/lotto-america`, `/cash4life`, `/lucky-for-life`, `/2by2`, `/gimme-5`, `/tri-state-*` — from `01-...`. Not built yet (currently 404). Add to sitemap only once implemented.

### 2c. Game pages (future) — `/{state}/{game}`
Preserve existing pattern (`01-...`). Not built yet. When built, generate sitemap entries from the
state→game config; only include valid state×game combinations (no arbitrary slugs).

### 2d. History pages (future) — `/{state}/{game}/{year}`
~8,700 in production (`01-...`). Not built yet. When built: sitemap by state/game/year; consider a
**sitemap index** split by state/game/history because of volume.

### 2e. Blog / News (future) — `/blog`, `/blog/{slug}`, `/news`, `/news/{slug}`
Include **only when public + indexable**. Draft/unpublished/thin content must be excluded.

### 2f. Static pages
`/about-us`, `/faqs`, `/contact-us`, `/write-us`, `/privacy-policy`, `/cookies-policy`,
`/terms-and-conditions`, `/lottery-tax-calculator`, glossary a-to-c…t-to-z, `/jackpots`. Include when built.

### 2g. Excluded from sitemap (never / conditional)
- `/buynow/*`, `/emailbuynow/*` — affiliate redirects (**robots-disallowed**; never in sitemap).
- `/admin/*` — auth-gated, `noindex`.
- Unknown/soft-404 state or game slugs.
- A/B or preview routes.
- Ignored-status games (per game config) even though direct URLs may resolve (per `05` D4 — reachable but not promoted in sitemap without approval).

## 3. lastmod / freshness requirements
- Every sitemap URL needs an **accurate `lastmod`**. For state pages, derive from the page's
  `lastUpdated.isoDateModified` (currently in sample JSON; later from the results feed).
- **When results update, `lastmod` must update for the related URLs:** the game page, the game's
  history page(s), the state page(s) that surface that game, and the home page if shown there.
- Map: `result update → {state, game, history/year, home}` lastmod refresh. Wire this when the API/feed
  drives content (today values are static sample timestamps).

## 4. IndexNow (future)
- On result/jackpot/content updates, submit the changed URLs to **IndexNow** (Bing + participating
  engines) so fresh results are picked up quickly. Not implemented now; plan alongside the API/feed.

## 5. Robots alignment
- Keep `robots.txt` allowing crawlers and disallowing `/buynow/`; add explicit AI-crawler rules
  (Googlebot/Bingbot/OAI-SearchBot/PerplexityBot allow; GPTBot per policy) per `15`. Ensure the
  sitemap `Sitemap:` directive host matches the chosen canonical host after migration.

## 6. Implementation status / next
- **Not implemented in this task.** `app/sitemap.ts` / `robots.ts` do not yet exist in `01-new-ui`.
- **Route/data readiness achieved:** state routes are enumerable via `getAvailableStateSamples()`, each
  page carries `lastUpdated.isoDateModified` and a canonical target — enough to generate a state-only
  sitemap safely later.
- **Recommended safe first step (separate task):** add `app/sitemap.ts` that emits **only** the known
  state routes (from `getAvailableStateSamples()`) with `lastmod` from each sample's
  `isoDateModified`, using the **decided canonical host once migration is approved** (until then, keep
  matching the current production `www` host to avoid mixed signals). Expand to game/history/blog as
  those routes ship.

## Open decisions for Bala
1. Approve the **www → non-www migration** timing (enables canonical emit + `SITE_URL` switch + 301s).
2. Confirm whether the interim sitemap should use **www (current prod)** or the **non-www target** — recommend matching current prod (`www`) until the redirect is live to avoid canonical/sitemap host mismatch.
3. Confirm IndexNow adoption + key management (future).
