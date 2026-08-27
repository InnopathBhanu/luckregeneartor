# Ad Placement & Home Design Decisions

Captures Bala's decisions (`12-bala-design-decisions.md`) plus the concrete reconciliation between
the **existing** ad/revenue layout and the **proposed** mockups, based on the complete design-input
pass (`08`). Discovery/decision record — no UI/API code. Cross-refs: `08`, `09`, `11`.

## 1. Governing Decisions (from Bala)

- Proposed PDFs are **reference designs, not final production layouts**. Use them for structure/clarity/modern feel only.
- **Ad placements are FIXED (Google Ad Manager).** Preserve **exact existing positions, order, and slot behavior** across desktop, tablet, and mobile. See §9 "Fixed Google Ad Manager Placement Decision".
- **Mockups missing ads ≠ remove ads.** The **new UI adapts around existing ad slots**, not the other way around.
- **Empty ad spaces are ad-placement evidence** — even when the ad did not load in a screenshot.
- **Home page:** mostly preserve existing structure; only **minimal** visual/design-system alignment. No heavy redesign without approval. No proposed home mockup exists.
- Prepare for **AI-enabled tools for logged-in users**; AI sections may be planned where appropriate, **no fake/unsupported claims**, nothing implemented yet.
- **Mobile references now available** for Home + Florida (existing-site, under `05-design-inputs/mobile-existing-pages/`). Proposed desktop mockups still have **no** mobile version — derive mobile/tablet from desktop mockups + these existing mobile references + responsive best practices. Revenue-critical elements must not disappear or move on mobile.

## 2. Existing vs Proposed Ad Inventory (from design inputs)

| Ad / revenue unit | Existing live pages (`home.png`, 5 state screenshots) | Proposed PDFs (11 states) | Action |
|-------------------|-------------------------------------------------------|---------------------------|--------|
| Top leaderboard ad | **Not present** | **Present** — one "Advertisement" under sub-bar (Calif. specs 970×90 / 725×90 / 320×100) | Keep (new, good) |
| Right-rail affiliate banners ("lotter.com", red) | **Present** — rotating down the right rail, all pages | **Missing** (single-column) | **Re-introduce** — main affiliate revenue driver |
| Right-rail blue/white promo banners | **Present** — alternating with affiliate banners | **Missing** | **Re-introduce** |
| In-content ads between sections | **Present** (right rail changes per section) | **Missing** | **Re-introduce** as in-content slots suited to single-column |
| Buy Tickets CTAs | Present (game rows) | Present (cards: "Buy Tickets" + sub-bar quick action) | Keep both |
| Quick actions (Check Ticket / Past Results / Prize Lookup / Claim Info / Buy Tickets) | Partial | Present (sub-bar) | Keep |
| Jackpot / next-draw visibility | Present | Present (cards + Top Jackpots bar) | Keep |
| Footer ad | Not clearly present | **Present** — dismissible bottom "Advertisement" | Keep |
| Newsletter signup | **Present** (footer) | **Not shown** in footer | **Re-introduce** (lead capture) |

**Bottom line:** the proposed design *added* a responsive leaderboard + footer ad but *dropped* the
existing right-rail affiliate/promo banners, in-content ads, and newsletter signup. All dropped units
must be re-added.

## 3. Target Ad Slot Plan (preserve exact existing positions)

**Decision:** preserve **exact existing ad positions and order** on every breakpoint; the new UI
sections are arranged **around** the fixed GAM slots. Do not move, merge, rename, or reduce slots.

- **Desktop:** keep existing placement relationships — **right-rail** "lotter.com" affiliate banners + blue/white promo banners, **in-content** ad units between sections, and the footer newsletter, all in their **current order/position**. The proposed top leaderboard + dismissible footer ad may be **added** only if they do not displace existing slots (confirm with Bala + GAM).
- **Tablet/Mobile:** keep existing mobile ad positions **exactly** where the existing mobile pages place them (see mobile references, §6). If the redesigned content conflicts with an ad slot, **adjust the content around the slot** — never move the ad down or remove it.
- **Buy Tickets / affiliate:** preserve all Buy Tickets CTAs and affiliate areas and their destinations (§7.3). URLs are **config/API-driven, not hardcoded** — see §3a.
- **Density:** match existing density exactly — do **not** lighten or reduce (§7.2).

> Exact slot names, sizes, GAM slot IDs, ad networks, and affiliate link targets must be captured by the
> **revenue inventory** from `00-reference-existing-project` + live site before build. The mobile
> references confirm mobile ad slots exist and must be mapped 1:1.

## 3a. Buy Tickets / Affiliate URL Decision

Buy Tickets and affiliate destination URLs must not be hardcoded in the new UI.

The UI should render Buy Tickets CTAs in the same required positions, but the final destination URL should come from API/config later.

The future API should decide the correct Buy Tickets / affiliate URL based on existing business rules such as:
- user geo/IP
- state
- game
- affiliate availability
- tracking requirements
- existing LotteryCorner routing logic

During UI-first development, use safe placeholder data for Buy Tickets links.

Do not change existing affiliate destinations, tracking parameters, or geo-routing logic until the reference project revenue inventory is completed.

## 4. Home Page Decision

- **Preserve** existing structure and section order (hero, latest results, news, 50-state grid, most-popular games, jackpot cards, FAQ, state winning-number tables, footer/newsletter).
- **Preserve** existing home ad/affiliate placements (right-rail lotter.com banners, Buy Tickets, newsletter).
- **Minimal changes only:** apply the new design system (typography, spacing, card styling, colors) for visual consistency with the redesigned state pages.
- **Do not** adopt the state-page single-column layout for home or drop any home section without approval.
- No proposed home mockup exists → any structural change requires Bala's approval.

## 5. AI-Enabled Positioning (future, logged-in)

- Cards already show a **star/favorite icon** in the proposed mockups — a natural logged-in personalization hook.
- Reserve space for future AI/logged-in modules **without fake claims**: e.g. AI lottery insights, smart number analysis, personalized alerts, "Lottery Genie / Lucky GPT" entry points.
- Gate AI tools behind login; keep public result content crawlable and unaffected.
- Exact AI copy/placement TBD with Bala. Do not ship AI claims that aren't backed by a real feature.

## 6. Responsive / Mobile Approach

**Inputs now available:** existing-site mobile references for **Home** (`Mobile_Home.pdf`) and
**Florida** (`Mobile_Florida.pdf`) under `05-design-inputs/mobile-existing-pages/`. Proposed desktop
mockups still have no mobile version. Derive mobile/tablet from: desktop mockups + these existing
mobile references + responsive best practices.

- **The existing mobile pages define the source of truth for mobile content flow AND mobile ad positions.** Map every mobile ad slot 1:1; the redesign adapts content around them.
- Both mobile references are **single-column, full-length vertical scroll** captures (~430–452px wide) of the current live site — same content family as the desktop existing pages, stacked vertically.
- Result-card grids reflow: multi-state 2-up → 1-up; in-state 3-up → 2/1-up; pick games 4-up → 2/1-up.
- Ball grids wrap (Keno/Pick 10 = 10 balls already wrap).
- Sub-bar (countdowns, quick actions) needs a compact mobile treatment.
- Revenue-critical elements stay visible and in their existing positions on mobile (see §3, §9).
- **Tooling caveat:** no PDF renderer is available in-environment; only embedded raster images (logos, promo/section banners) could be recovered from the mobile PDFs, not the vector text or the empty ad boxes. **Exact mobile ad-slot coordinates must be confirmed against the live site / GAM config / reference code** during the revenue inventory. (More detail in `08-...`.)

## 7. Resolved Decisions (answers to prior open questions)

1. **Desktop ad strategy:** preserve **exact existing desktop ad placement positions**. Right-rail ads, affiliate banners, and in-content ads keep their current placement order/relationship unless Bala approves changes.
2. **Ad density:** **match current density exactly.** Do not lighten or reduce.
3. **Affiliate destinations:** **do not change.** Discover and preserve existing Buy Tickets, lotter.com, tracking, and affiliate destinations (via revenue inventory).
4. **Mobile ads:** preserve **exact existing mobile ad positions.** Do not move them down or remove them. If the proposed layout conflicts with an ad, **adjust content sections around the ad slot.**
5. **AI modules:** plan for future AI tools — Lottery Genie / Lucky GPT, smart number analysis, personalized alerts, favorites, logged-in tools — but **do not implement or overclaim yet.**

## 8. Blocking Prerequisites Before UI Code (per `12`)

1. Complete design-input coverage ✅ (incl. mobile Home + Florida, this pass).
2. Revenue inventory (ad slots + **GAM slot IDs**, affiliate banners, networks, link targets, **exact mobile positions**) → `03-revenue-inventory.md` — **pending**.
3. URL/SEO inventory → `01-url-inventory.md` / `02-seo-geo-aeo-inventory.md` — **pending**.
4. Ad-placement strategy — **resolved** (§7); slot-level specifics pending revenue inventory.

## 9. Fixed Google Ad Manager Placement Decision

- **Existing ad placements are fixed.** They are **configured in Google Ad Manager (GAM)**.
- The rebuild must **preserve the exact placement positions and slot behavior** of every existing ad — across desktop, tablet, and mobile.
- **New UI sections must be arranged around these slots**, not the other way around. Content adapts to the ads; ads do not move to suit the content.
- **Mockups that omit ads are incomplete for production.** Both the proposed desktop PDFs (which omit the right-rail/in-content ads) and any screenshot with an empty ad box must be treated as ad-bearing. **Empty ad spaces are evidence of an ad slot.**
- **Do not move, remove, merge, rename, reduce, or replace** any ad placement, affiliate banner, Buy Tickets CTA, or ad-placement order **without explicit Bala approval**.
- Any proposed change affecting a GAM slot, affiliate banner, Buy Tickets CTA, ad order, or ad visibility must be **listed separately and approved by Bala before implementation**.
