# Advertising canary — deployment runbook

**Task:** LRG-ADS-CANARY-001 · **Implementation commit:** see `git log` for `feat: add consent-gated GAM deployment canary`
**Intended host:** `ads-test.lotterycorner.com` (restricted subdomain)
**Status of production activation:** **BLOCKED.** See [Consent posture](#consent-posture).

---

## 1. What this deployment is

The complete currently-implemented application, deployed so that a named tester can verify that real Google Ad
Manager requests reach the **already captured and approved Home and Florida State placements** — and nothing
else.

It is **not** a public launch. Every page remains `noindex, nofollow`. On this protected temporary host, GAM
loads automatically and eligible placements begin their normal eager/lazy request lifecycle without an in-page
startup gate.

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
| Node.js Version | 24.x |

Normal Next.js SSR/SSG. **No `output: "export"`**, and no `vercel.json` — nothing about this canary requires
redirects, rewrites, canonical behaviour, trailing-slash behaviour or route changes, and adding a config file
that could express those is a risk with no benefit here.

**Domain:** attach `ads-test.lotterycorner.com` only. **Do not** change production `www` or apex DNS.

**Access:** keep the temporary host behind the existing Vercel Deployment Protection or equivalent edge access
control. There is deliberately no application-level password, verification strip, or GAM start button.

The application is self-contained under the configured root. Runtime JSON is bundled from
`lib/data-provider/fixtures`; deployment must not set `SAMPLE_DATA_DIR` or depend on `../04-sample-data`.

---

## 3. Environment variables

No environment variable is required to enable GAM or iZooto. Their defaults are:

```
NEXT_PUBLIC_GAM_ENABLED=(unset)          # enabled
NEXT_PUBLIC_IZOOTO_ENABLED=(unset)       # enabled
NEXT_PUBLIC_ADSENSE_ENABLED=(unset)      # disabled
NEXT_PUBLIC_ANALYTICS_ENABLED=(unset)    # disabled
```

To disable GAM or iZooto, add the corresponding variable with the exact value `false` and redeploy:

```
NEXT_PUBLIC_GAM_ENABLED=false
NEXT_PUBLIC_IZOOTO_ENABLED=false
```

AdSense and analytics remain opt-in: only the exact value `true` enables either of them.

`NEXT_PUBLIC_ADSENSE_ENABLED` must stay unset or `false`. A second ad system on the same page makes every observed fill
ambiguous about which system served it, which defeats the purpose of the canary.

> The former combined `NEXT_PUBLIC_ADS_ENABLED` flag no longer exists. It gated GAM and AdSense together, so
> the canary could not be expressed with it.

---

## 4. Running an ad test

1. Open a page on the protected host (`/` or `/fl`).
2. Open browser developer tools before or immediately after navigation.
3. Confirm one `gpt.js` request to `securepubads.g.doubleclick.net`.
4. Confirm eligible above-the-fold slots register and request automatically.
5. Scroll the page and confirm lazy placements request as they approach the viewport.

There is no `sessionStorage` gate and no start/stop control. The explicit deployment-wide stop mechanism is
`NEXT_PUBLIC_GAM_ENABLED=false` followed by a redeploy.

---

## 5. Reading slot state

### In the DOM

The OUTER reservation carries `data-gam-state`, and derives `data-ad-active` / `data-ad-requested` from it, so
the reservation and the inner GPT div can no longer disagree. The inner GPT div carries the same value on
`data-ad-state`:

| Value | Meaning | Action |
|---|---|---|
| `inactive` | GAM disabled, placement ineligible, or slot not mounted | Expected with the kill switch off or outside the slot's viewport tier |
| `registered` | Defined with GPT, not yet requested | Normal for a lazy slot outside the request threshold |
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

1. **Stop all ad requests, keep the site up** — set `NEXT_PUBLIC_GAM_ENABLED=false` in the Vercel project and
   redeploy. GPT is never fetched, and every placement returns to reserved-and-labelled.
2. **Withdraw the deployment** — remove the `ads-test` domain assignment, or delete the deployment. Production
   `www` and apex are untouched by any of this and need no action.

No rollback step requires a code change, and none touches production DNS.

---

## 8. Indexing

Every page in this build is `noindex, nofollow`, and this task changed nothing about that: no robots directive,
no canonical, no sitemap, no host constant and no route was modified. The canary must not be linked publicly,
and the restricted host should additionally be blocked at the edge if that is available.

---

## 9. Consent posture

**The protected temporary host is not a production-certified CMP.**

External access protection limits who can reach the host, but it does not enumerate purposes or vendors, record
a legal basis, emit a TCF string, or speak for a public end user.

Public production activation remains **blocked** until the approved Google-certified CMP arrangement is
confirmed. That statement is also encoded as `PUBLIC_ACTIVATION_BLOCKED` in `lib/ads/gamConfig.ts` and asserted
by `tests/gam-canary.test.ts`, so lifting the restriction requires editing a named constant rather than flipping
an environment variable.
