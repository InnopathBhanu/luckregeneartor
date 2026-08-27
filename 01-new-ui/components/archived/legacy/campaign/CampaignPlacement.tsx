/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { getCampaigns } from "@/lib/data-provider";
import { selectCampaigns } from "@/lib/archived/legacy/campaign/select";
import type { PlacementKey, PageTarget } from "@/lib/campaign/types";
import CampaignBanner from "@/components/archived/legacy/campaign/CampaignBanner";

/*
 * CampaignPlacement — server component. Drops into an approved placement key on home/state pages.
 * Renders AT MOST ONE matching campaign (highest priority) and NOTHING when nothing matches.
 * Campaigns are content modules and never touch GAM ad slots.
 */
export default function CampaignPlacement({
  placement,
  page,
  stateCode,
}: {
  placement: PlacementKey;
  page: PageTarget;
  stateCode?: string;
}) {
  const matches = selectCampaigns(getCampaigns(), { placement, page, stateCode });
  if (matches.length === 0) return null;
  return <CampaignBanner campaign={matches[0]} />;
}
