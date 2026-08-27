# Advertising canary — deployment runbook

**Task:** LRG-ADS-CANARY-001 · **Implementation commit:** see `git log` for `feat: add consent-gated GAM deployment canary`
**Intended host:** `ads-test.lotterycorner.com` (restricted subdomain)
**Status of production activation:** **BLOCKED.** See [Consent posture](#consent-posture).

---

## 1. What this deployment is

The complete currently-implemented application, deployed so that a named tester can verify that real Google Ad
Manager requests reach the **already captured and approved Home and Florida State placements** — and nothing
else.

It is **not** a public launch. Every page remains `noindex, nofollow`, and no ad request happens until a tester
explicitly starts one.

### What can request an ad

| Surface | Slots | Source of truth |
|---|---|---|
| Home (`/`) | **14** active placements | `canaryHomeSlotKeys()` in `lib/ads/canarySlots.ts` |
| Florida State (`/fl`) | 10 captured placements | `MINIMUM_FLORIDA_PROFILE` in `lib/state/stateAdBaseline.ts` |

**Eligible placements per tier** (the 992px GAM breakpoint):

| Surface | ≥ 992px | < 992px |
|---|---:|---:|
| Home | 14 | 7 |
| Florida State | 9 | 5 |

The difference is the governed desktop-only placements — Home's `gte-992` rails and its AD-H01 inline slot, and
Florida's `viewports: ["desktop"]` placements including `sp_top_billboard`. The AD-S02 device pair activates
exactly one member per tier.

> **The Home sticky is drawn but never requested.** `hp_bottom_large_leaderboard_sticky` keeps its reservation
> and its recorded inventory, but its anchor group is governed `inactive-sticky-preview` pending ad-operations
> approval of the mobile sticky treatment, so it is excluded from canary eligibility. That is why Home renders
> 15 reservations and registers 14 slots.

### What cannot

Retired (`hp_video`), the five disabled implementation candidates, the two strategic candidates, the video unit,
the Wyoming in-table units, **the Home bottom sticky (`hp_bottom_large_leaderboard_sticky`)**, every other
jurisdiction, and **every other page family** — game, flagship, archive,
news, blog, community, tools, policy, authentication, member. Eligibility is asked of the same code that decides
what the page *renders*, so a placement that is not drawn cannot be requested.

The `lc_mgp_*`, `lc_mpg_*`, `lc_bp_*`, `lc_bdp_*`, `lc_jp_*`, `lc_gh_*` and `lc_gn_*` families are **captured
only** — recorded in `04-sample-data/ad-slot-definitions.json` under `capturedPageFamiliesNotActivated`, with
file and line evidence, and wired to nothing. Their placement in the new blueprints needs a separate
founder/ad-operations review.

---

## 2. Vercel project configuration

| Setting | Value |
|---|---|
| Root Directory | `01-new-ui` |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | *framework default* (leave blank) |
| Install Command | *framework default* (leave blank) |
| Node.js Version | 20.x or 22.x |

Normal Next.js SSR/SSG. **No `output: "export"`**, and no `vercel.json` — nothing about this canary requires
redirects, rewrites, canonical behaviour, trailing-slash behaviour or route changes, and adding a config file
that could express those is a risk with no benefit here.

**Domain:** attach `ads-test.lotterycorner.com` only. **Do not** change production `www` or apex DNS.

---

## 3. Environment variables

Set all five, in the canary project only.

```
NEXT_PUBLIC_GAM_ENABLED=true
NEXT_PUBLIC_GAM_CANARY_MODE=true
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_IZOOTO_ENABLED=false
```

Every flag is **fail-closed**: only the exact string `true` enables anything. `1`, `TRUE`, `yes` and an unset
variable all mean off, so a new environment that inherits nothing loads nothing.

`NEXT_PUBLIC_ADSENSE_ENABLED` must stay `false`. A second ad system on the same page makes every observed fill
ambiguous about which system served it, which defeats the purpose of the canary.

> The former combined `NEXT_PUBLIC_ADS_ENABLED` flag no longer exists. It gated GAM and AdSense together, so
> the canary could not be expressed with it.

---

## 4. Running an ad test

1. Open a page on the canary host (`/` or `/fl`).
2. At the top of the page, find the **Ad verification** strip. It reads *not started*.
3. Press **Start ad verification**.
4. GPT loads, the eligible slots register, above-the-fold slots request immediately, and below-the-fold slots
   request as they approach the viewport.
5. Press **Stop ad verification** to end it, or simply close the tab.

The gate is stored in `sessionStorage` under `lc-ad-verification` and is scoped to **that browser tab**. It does
not persist to the next visit and does not travel to the server.

**Before you press the button, the page makes zero requests to `securepubads.g.doubleclick.net`.** That is the
first thing to verify on any new deployment.

---

## 5. Reading slot state

### In the DOM

The OUTER reservation carries `data-gam-state`, and derives `data-ad-active` / `data-ad-requested` from it, so
the reservation and the inner GPT div can no longer disagree. The inner GPT div carries the same value on
`data-ad-state`:

| Value | Meaning | Action |
|---|---|---|
| `inactive` | Gate not started | Expected before the test |
| `registered` | Defined with GPT, not yet requested | Normal for a lazy slot above the fold line |
| `requested` | Ad requested, awaiting a response | Transient |
| `filled` | A creative rendered | Success |
| `empty-response` | The slot rendered nothing | **Investigation required** — see below |
| `blocked` | The library or the slot could not be set up | **Integration investigation** |

Quick console survey:

```js
[...document.querySelectorAll('[data-gam-state]')].map(e => `${e.dataset.slotKey} ${e.dataset.gamState}`)
```

On an `empty-response` the reservation keeps its exact reserved height, drops the visible "Advertisement"
label, and its accessible name becomes "Advertisement, not filled".

**Viewport eligibility.** A placement governed for one tier only is not merely hidden at the other tier — it is
ineligible: no GPT slot is defined, no `display()` is called and no ad is requested. `data-tier` on each GPT div
records the tier it is live in. Crossing 992px destroys the now-ineligible slot and activates its counterpart.

### In the Google Publisher Console

Append `?google_console=1` to any canary URL, or press `Ctrl+F10`. The console lists each slot with its unit
path, requested sizes and delivery diagnostics.

### An empty response is an observation, not a diagnosis

`slotRenderEnded` with `isEmpty === true` says the slot rendered nothing. **It does not say why.** Google's GPT
release notes record that a **request network failure** also surfaces this way, so an empty response is not
by itself evidence of an inventory no-fill.

Five causes remain open until evidence narrows them:

1. genuine inventory no-fill (no eligible line item);
2. a line-item or targeting problem;
3. a consent or geographic restriction;
4. a creative-size mismatch against the requested sizes;
5. a request network failure.

**Publisher Console and network evidence are required to distinguish them.** Open the console
(`?google_console=1`) and check the slot's delivery diagnostics, then check the Network panel for a failed or
blocked request to `securepubads.g.doubleclick.net`. Do not record an empty response as a confirmed line-item
or inventory failure without that evidence.

The reader-facing treatment is identical whichever cause applies: the label is suppressed, the accessible name
becomes "Advertisement, not filled", and the reserved geometry is retained.

---

## 6. Authorized sellers

`https://<canary-host>/ads.txt` and `/ads_google.txt` are served from `01-new-ui/public/` and are
**byte-identical** to the legacy `WebContent/` originals (verified by checksum and asserted by test). Nothing was
sorted, deduplicated, normalised, added or removed.

Note that crawlers read `ads.txt` from the **root domain**, so a file on a subdomain does not authorize sellers
for `lotterycorner.com`. It is published here so the canary is a faithful copy of the production surface, not to
change any seller relationship.

---

## 7. Rollback

In increasing order of severity:

1. **Stop one tester** — press *Stop ad verification*, or close the tab.
2. **Stop all ad requests, keep the site up** — set `NEXT_PUBLIC_GAM_ENABLED=false` in the Vercel project and
   redeploy. The gate disappears, GPT is never fetched, and every placement returns to reserved-and-labelled.
3. **Withdraw the deployment** — remove the `ads-test` domain assignment, or delete the deployment. Production
   `www` and apex are untouched by any of this and need no action.

No rollback step requires a code change, and none touches production DNS.

---

## 8. Indexing

Every page in this build is `noindex, nofollow`, and this task changed nothing about that: no robots directive,
no canonical, no sitemap, no host constant and no route was modified. The canary must not be linked publicly,
and the restricted host should additionally be blocked at the edge if that is available.

---

## 9. Consent posture

**This is a restricted technical canary gate, not a production-certified CMP.**

The session control records one boolean about one tester's browser tab. It does not enumerate purposes or
vendors, does not record a legal basis, does not emit a TCF string, and does not speak for any end user.

Public production activation remains **blocked** until the approved Google-certified CMP arrangement is
confirmed. That statement is also encoded as `PUBLIC_ACTIVATION_BLOCKED` in `lib/ads/gamConfig.ts` and asserted
by `tests/gam-canary.test.ts`, so lifting the restriction requires editing a named constant rather than flipping
an environment variable.
