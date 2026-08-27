# 22 — Campaign / Banner Framework: Admin & Targeting Plan

Status: Phase-1 (UI-first, sample data). No backend, no admin UI, no live geo yet.
Scope: documents the generic internal-campaign/banner framework added to `01-new-ui` and the
future admin + targeting/resolver work. Campaigns are **content modules**, not ads.

## 0. Non-negotiables (carried from CLAUDE.md)

- Campaigns **never** replace, move, merge, rename, reduce, collapse, or reorder any Google Ad
  Manager (GAM) ad slot, affiliate banner, or Buy Tickets CTA. They render as separate content
  modules in approved content positions only.
- No browser-side IP/geo lookup. No third-party geo scripts. Geo/device/schedule are **stored**
  now and **resolved later** by the API/backend (Cloudflare country header, etc.).
- CTA URLs are **internal only** (`/...`, `#...`, or `/buynow/<code>`). No hardcoded external
  affiliate URLs. `/buynow/<code>` continues to route through the existing redirect.
- An AI agent may **create or update campaign drafts**, but must **not publish** without Bala's
  approval (see §6 Workflow).

## 1. Where the framework lives

| Concern | File |
| --- | --- |
| Types (Campaign, targeting, schedule, placement allowlist) | `01-new-ui/lib/campaign/types.ts` |
| Pure matcher (placement + page + state; geo/device/schedule deferred) | `01-new-ui/lib/campaign/select.ts` |
| Presentational banner (visible fields only; no targeting leaked) | `01-new-ui/components/campaign/CampaignBanner.tsx` |
| Server placement hook (renders ≤1 campaign or nothing) | `01-new-ui/components/campaign/CampaignPlacement.tsx` |
| Provider read | `01-new-ui/lib/data-provider/index.ts` → `getCampaigns()` |
| Sample data | `04-sample-data/campaigns-sample.json` |

`<CampaignPlacement placement="…" page="home|state" stateCode? />` is dropped into approved
positions in `HomeTemplate` and `StatePageTemplate`. It calls `selectCampaigns()` and renders the
single highest-priority match, or `null`.

## 2. Data model

```ts
Campaign {
  id: string
  title: string
  description?: string
  image?: string | null          // optional; sample uses a neutral placeholder, no external URL
  ctaText?: string
  ctaUrl?: string                 // INTERNAL only: "/...", "#...", or "/buynow/<code>"
  variant?: "info" | "accent" | "insider" | "subtle"
  priority?: number               // higher wins when multiple match one placement
  active?: boolean                // false = never render
  previewEligible?: boolean       // Phase-1 render gate (sample only)
  placements: PlacementKey[]      // approved keys only (allowlist)
  targeting?: {
    pages?: ("home"|"state"|"game")[]
    stateCodesInclude?: string[]
    stateCodesExclude?: string[]
    geo?: { allGeos?; countriesInclude?; countriesExclude?; regionsInclude?; regionsExclude? }
    devices?: ("desktop"|"tablet"|"mobile"|"all")[]
  }
  schedule?: { start?: ISO; end?: ISO; timezone?: string }
}
```

Notes:
- `previewEligible` is the **sample-phase gate**. In production this field is ignored and
  `active` + `schedule` + targeting decide visibility.
- Raw targeting/geo/schedule fields are **never** written to the DOM. `CampaignBanner` only renders
  `title`, `description`, optional image, and the CTA, plus `data-campaign-id`.

## 3. Approved placement keys (allowlist)

Unknown keys never render (enforced in `selectCampaigns`). `game.*` reserved for future game pages.

**Home** (`HomeTemplate`)
- `home.heroBelow` — directly under the hero/intro.
- `home.afterTopJackpots` — after the Top Jackpots table.
- `home.beforeNews` — before the Live Lottery News section.
- `home.insiderBand` — after the Insider band.
- `home.beforeStateDirectory` — before "Browse by State".

**State** (`StatePageTemplate`) — render nothing unless a matching campaign exists; do not visually
redesign state pages.
- `state.afterHero` — after the hero/tabs.
- `state.afterLatestResults` — after latest-results groups / draw schedule.
- `state.beforeClaiming` — before How-to-Claim / taxes.
- `state.beforeFaq` — before the final FAQ.

**Future**
- `game.afterResult`, `game.beforeHistory`, `game.beforeFaq` (add when game pages exist).

## 4. Targeting model

- **Page**: `targeting.pages` — `home`, `state`, `game`.
- **State**: `stateCodesInclude` / `stateCodesExclude` (two-letter codes matching route slugs, e.g.
  `ny`, `fl`). Include-list scopes a campaign to specific states without touching others.
- **Geo** (deferred): `geo.allGeos` or countries/regions include/exclude. Resolved by the backend
  from the Cloudflare `CF-IPCountry` header (or equivalent) — **not** in the browser.
- **Device** (deferred): `devices` — desktop/tablet/mobile/all. Resolved server-side (UA/viewport
  hints) in production. Phase-1 renders regardless of device but obeys mobile single-column layout.
- **Schedule** (deferred): `schedule.start`/`end`/`timezone`. Enforced by the backend clock in
  production; not enforced in the sample phase.

Phase-1 matcher (`select.ts`) enforces only: `active !== false`, `previewEligible === true`,
placement in allowlist, `placements` includes the key, page match, state include/exclude. Geo,
device, and schedule are intentionally **not** enforced yet.

## 5. Scheduling & priority

- `priority` (desc) breaks ties when several campaigns match one placement; the caller renders one.
- `schedule.start`/`end` define an active window; `timezone` anchors it (default `America/New_York`).
- Future: overlapping windows resolve by priority, then most-recent `start`.

## 6. Draft → review → publish workflow

1. **Draft** — created by an admin **or an AI agent**. `active:false` (or `status:"draft"` in the
   future model). Not shown to the public.
2. **Review** — a human (Bala or an approver) checks copy, CTA (internal-only), targeting, schedule,
   and that no ad slot is affected.
3. **Publish** — approver sets it live (`active:true`, within schedule window). **AI agents may not
   perform this step.**
4. **Retire** — `active:false` or past `schedule.end`.

Phase-1 mirror: `previewEligible:true` ≈ "visible in sample preview"; `previewEligible:false`
(see `va-responsible-play-example`) ≈ a stored draft that renders nowhere.

## 7. Future admin UI

- CRUD over campaigns: content, variant, placements, targeting, schedule, priority, status.
- Placement picker limited to the **approved allowlist** (§3); no free-form positions.
- CTA validation: internal paths / `#anchor` / `/buynow/<code>` only; reject external URLs.
- Explicit **publish gate** with role separation (author vs approver; agents = author only).
- Guardrail copy in the UI: "Campaigns are content modules and must never replace or move ad slots."
- Optional **inline-edit preview**: an authenticated editor could see a page in preview mode with
  campaign slots highlighted/editable. Preview state must never leak targeting fields into the public
  DOM and must not alter ad-slot markup.

## 8. Future API response model

The API resolves visibility server-side and returns only render-ready, already-targeted campaigns
per placement — the client never receives raw geo/schedule rules.

```
GET /api/campaigns?page=state&state=ny&placement=state.afterHero
→ { placement: "state.afterHero",
    campaigns: [ { id, title, description, image?, ctaText?, ctaUrl } ] }   // ≤1 after resolution
```

- Backend applies active + schedule (server clock) + geo (Cloudflare country) + device + state/page.
- Response contains **presentational fields only**. Targeting/geo/schedule stay server-side.
- `getCampaigns()` in the data-provider is the swap point: same shape, sample JSON → API later.

## 9. Campaign content vs GAM house ads (distinction)

| | Campaign (this framework) | GAM ad slot / house ad |
| --- | --- | --- |
| Purpose | First-party promos (jackpot alerts, tools, sign-in, responsible play) | Monetized/house inventory served by Google Ad Manager |
| Rendered by | `CampaignPlacement` / `CampaignBanner` (content modules) | `AdSlot` / `AdSlotView` (fixed GAM slots) |
| Position | Approved content placements (§3) | Fixed GAM placements — never moved |
| Targeting | This model (page/state/geo/device/schedule) | GAM line-item/targeting (out of scope here) |
| Rule | Must never replace/move an ad slot | Preserved exactly across breakpoints |

If a promo ever needs to run as paid/house inventory, it belongs in GAM, not here.

## 10. Sample campaigns (current)

| id | placement | preview | notes |
| --- | --- | --- | --- |
| `buy-tickets-availability` | `home.heroBelow` | ✓ | `/buynow/play-usa-powerball`; availability-depends-on-location wording |
| `pb-jackpot-alert` | `home.afterTopJackpots` | ✓ | internal `/powerball` |
| `jackpot-alert-subscribe` | `home.beforeNews` | ✓ | sign-in `#alerts` |
| `ai-tools-teaser` | `home.insiderBand` | ✓ | responsible AI wording, `#insider` |
| `ny-check-ticket-promo` | `state.afterHero` | ✓ | `stateCodesInclude:["ny"]` — NY only; `/fl` unaffected |
| `va-responsible-play-example` | `state.beforeFaq` | ✗ | `previewEligible:false` — stored draft, renders nowhere |

All CTAs are internal; responsible-play wording used where relevant.
