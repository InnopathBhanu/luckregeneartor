/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { APPROVED_PLACEMENTS } from "@/lib/campaign/types";
import type { Campaign, CampaignSelectContext } from "@/lib/campaign/types";

/*
 * Pure campaign matcher. Sample phase: matches only `previewEligible` campaigns against
 * placement + page + state. Geo/device/schedule are NOT resolved here (no browser IP lookup; a
 * future API/backend resolver + Cloudflare country header will handle geo). Returns campaigns
 * sorted by priority (desc). The caller renders at most one per placement.
 */
export function selectCampaigns(all: Campaign[], ctx: CampaignSelectContext): Campaign[] {
  if (!APPROVED_PLACEMENTS.includes(ctx.placement)) return [];
  return all
    .filter((c) => c.active !== false)
    .filter((c) => c.previewEligible === true) // sample-phase gate
    .filter((c) => c.placements?.includes(ctx.placement))
    .filter((c) => {
      const t = c.targeting;
      if (!t) return true;
      if (t.pages && t.pages.length > 0 && !t.pages.includes(ctx.page)) return false;
      if (ctx.page === "state" && ctx.stateCode) {
        if (t.stateCodesInclude && t.stateCodesInclude.length > 0 && !t.stateCodesInclude.includes(ctx.stateCode)) return false;
        if (t.stateCodesExclude && t.stateCodesExclude.includes(ctx.stateCode)) return false;
      }
      // geo/device/schedule intentionally NOT enforced in the sample phase (deferred to API).
      return true;
    })
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}
