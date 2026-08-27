# LotteryCorner — New UI (Phase 1 skeleton)

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4. Sample-data-driven, UI-first.
See `03-docs/14` (stack), `03-docs/06` (readiness), `03-docs/09` (state template).

## Requirements
- **Node 24** (v24.18.0 used). This repo's default shell may point at an older nvm Node — select 24 first:
  ```
  nvm use 24            # or: export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
  ```
- Do **not** install under Node 16 — the Tailwind v4 native binary (`@tailwindcss/oxide`) requires Node ≥18.

## Install & run
```
cd 01-new-ui
npm install
npm run dev      # http://localhost:3000  (try /fl)
npm run build    # production build (SSR/SSG hybrid — not static export)
npm run start    # serve the production build
npm run lint
```

## Data
Reads static sample JSON from `../04-sample-data` via the data-provider (`lib/data-provider`).
Override the location with `SAMPLE_DATA_DIR=/abs/path`. No API/DB, no live calls (Phase 1).

## Home preview (Preview Track P3)

The approved anonymous Home preview renders **only** when the server env flag is set:

```
cd 01-new-ui
LC_HOME_PREVIEW=true npm run dev      # then open http://localhost:3000/
```

### Advertising review mode

`LC_HOME_PREVIEW_AD_MODE` controls how the (always inactive) ad reservations are drawn:

```
LC_HOME_PREVIEW=true LC_HOME_PREVIEW_AD_MODE=compact    npm run dev   # default when unset
LC_HOME_PREVIEW=true LC_HOME_PREVIEW_AD_MODE=production npm run dev
```

| Mode | Behaviour |
|---|---|
| `production` | The exact reserved geometry. **Verify production layout in this mode.** |
| `compact` | The same slots at a reduced review height, so the page can be read without scrolling past tall empty reservations. |

### Final-state vs debug presentation

```
LC_HOME_PREVIEW=true npm run dev                              # final-state (default)
LC_HOME_PREVIEW=true LC_HOME_PREVIEW_DEBUG=true npm run dev   # internal status visible
```

Default **off**. With debug off, the guarded Home presents as the intended completed launch: no
"Soon", no "Coming soon", no "Sample", no provenance chips, no sample-data strip, no slot counts.

Debug controls only what is **drawn**. These stay on unconditionally: the `LC_HOME_PREVIEW` guard,
`robots: noindex, nofollow`, `meta.previewMode`, every `data-*` provenance attribute, and
`assertProvenanceLabels` — which still requires a label to *exist* on every synthetic section.

> ⚠ **The final-state view renders fabricated Community discussions and editorial items** for design
> validation, on founder instruction (LRG-UI-013 §7/§8), with the visible labelling turned off. That
> conflicts with Product Constitution §17/§26 and is recorded in the founder-review record §9. **This
> page must not be served publicly in this state.**

`compact` **preserves every slot, anchor and sequence position**, changes no GAM mapping or
breakpoint rule, and hides nothing — the production reservation stays readable on each slot's
`data-reserved-mobile-h` / `data-reserved-desktop-h`. **Compact geometry is never evidence of
production geometry.** There is no `hidden` mode; an unrecognised value falls back to `compact`.

Developer-only preview states (available only while the flag is set — no new route is created):

| URL | Shows |
|---|---|
| `/` | Normal state. **No correction UI** — a correction renders only when a real correction record exists. |
| `/?previewState=corrected` | Exercises the corrected-result treatment: what changed, previous value, replacement value, when, and impact. |

**Active order experiment:** the preview currently renders H-10 Community, H-11 News and H-14
Return/Distribution immediately after the AD-H03 anchor, grouped under a "What's Happening at
LotteryCorner" presentation heading. This is a founder-authorized experiment recorded in
`03-docs/08-decisions/home-engagement-order-preview-experiment.md`; the frozen Home blueprint is
unchanged and the experiment is reverted by removing one call in `lib/preview/homePreviewModel.ts`.

Without the flag, `/` keeps its previous behaviour unchanged. The flag has no `NEXT_PUBLIC_`
prefix, so it is never inlined into the client bundle and cannot be flipped from the browser.

The preview is `noindex, nofollow`, uses sample data only, and keeps **all partner scripts
inactive** — no GAM/GPT, AdSense, analytics or push request is made. Advertising renders as
labelled, reserved, inactive placeholders. **It is a design-review preview, not production
approval.** See `03-docs/04-page-specifications/home-preview/`.

## What works
- `/` — legacy sample home, or the anonymous Home preview when `LC_HOME_PREVIEW=true`.
- `/fl` — Florida state page rendered from `state-fl-sample.json` (SSG).
- `/buynow/<code>` — stub for the future internal affiliate redirect (noindex placeholder).

## Deferred (stubs only): login/register, favorites, forum, AI tools, admin, live ads, real affiliate resolver.
