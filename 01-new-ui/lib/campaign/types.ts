/*
 * Generic internal-campaign / promotional-banner framework (content modules — NOT ads).
 * Campaigns never replace, move, or collapse GAM ad slots. No browser IP lookup; geo/device/schedule
 * are stored for a FUTURE API/backend resolver. In the sample phase only `previewEligible` campaigns
 * that match the placement/page/state render.
 */

export type CampaignVariant = "info" | "accent" | "insider" | "subtle";
export type DeviceTarget = "desktop" | "tablet" | "mobile" | "all";
export type PageTarget = "home" | "state" | "game";

/** Approved placement keys (allowlist). Unknown keys never render. */
export const APPROVED_PLACEMENTS = [
  "home.heroBelow",
  "home.afterTopJackpots",
  "home.beforeNews",
  "home.insiderBand",
  "home.beforeStateDirectory",
  "state.afterHero",
  "state.afterLatestResults",
  "state.beforeClaiming",
  "state.beforeFaq",
] as const;
export type PlacementKey = (typeof APPROVED_PLACEMENTS)[number];

export interface CampaignTargeting {
  pages?: PageTarget[];
  stateCodesInclude?: string[];
  stateCodesExclude?: string[];
  geo?: {
    allGeos?: boolean;
    countriesInclude?: string[];
    countriesExclude?: string[];
    regionsInclude?: string[];
    regionsExclude?: string[];
  };
  devices?: DeviceTarget[];
}

export interface CampaignSchedule {
  start?: string; // ISO
  end?: string; // ISO
  timezone?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  ctaText?: string;
  ctaUrl?: string; // INTERNAL only (/... or /buynow/<code>)
  variant?: CampaignVariant;
  priority?: number; // higher wins
  active?: boolean;
  previewEligible?: boolean; // sample-phase render gate
  placements: PlacementKey[];
  targeting?: CampaignTargeting;
  schedule?: CampaignSchedule;
}

export interface CampaignSelectContext {
  placement: PlacementKey;
  page: PageTarget;
  stateCode?: string;
}
