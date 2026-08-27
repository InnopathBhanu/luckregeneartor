/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { getAdSlot, getAdSizeMapping } from "@/lib/data-provider";
import AdSlotView from "@/components/archived/legacy/ads/AdSlotView";

/*
 * AdSlot (server) — resolves the fixed GAM slot definition + its size mapping, computes the reserved
 * height for the desktop (>=992px) and mobile (<992px) tiers, and hands them to the lazy-ready
 * client view. FIXED placements from ad-slot-definitions.json (03-doc); no live GAM is loaded.
 */
function maxHeight(sizes: number[][] | undefined | null, fallback: number): number {
  if (!sizes || sizes.length === 0) return fallback;
  return Math.max(...sizes.map((s) => s[1]));
}
function maxWidth(sizes: number[][] | undefined | null, fallback: number): number {
  if (!sizes || sizes.length === 0) return fallback;
  return Math.max(...sizes.map((s) => s[0]));
}

export default function AdSlot({ slotKey, sticky = false }: { slotKey: string; sticky?: boolean }) {
  const slot = getAdSlot(slotKey);
  const mapping = getAdSizeMapping(slot?.sizeMapping);
  const flat = slot?.sizes ?? null;

  let desktopMinH: number;
  let mobileMinH: number;
  let maxW: number;

  if (sticky) {
    // STICKY FOOTER reservation. The production sticky bar (#stickyAd, height:auto, compressed by
    // #adContent .-mt-30/.-mb-30) tracks the LEADERBOARD creative — 728x90 desktop / 320x50 mobile —
    // NOT the generic size mapping this slot happens to reuse in the JSP (hp_horizontalAds includes
    // 336x280, which is never shown as a bottom sticky). CSS ≠ GAM mapping here, so we follow the
    // visible production behavior and reserve from the slot's own sizes: widest = desktop tier,
    // narrowest = mobile tier. Keeps the reserved bar shallow instead of the largest possible height.
    const sizes = flat && flat.length ? flat : [[728, 90], [320, 50]];
    const widest = sizes.reduce((a, b) => (b[0] >= a[0] ? b : a));
    const narrowest = sizes.reduce((a, b) => (b[0] <= a[0] ? b : a));
    desktopMinH = widest[1];
    mobileMinH = narrowest[1];
    maxW = widest[0];
  } else {
    // Prefer size-mapping tiers (desktop = [992,0], mobile = [0,0]); fall back to the flat sizes list.
    const desktopTier = mapping?.breakpoints.find((b) => b.minViewport[0] >= 992)?.sizes;
    const mobileTier = mapping?.breakpoints.find((b) => b.minViewport[0] === 0)?.sizes;
    desktopMinH = maxHeight(desktopTier ?? flat, 90);
    mobileMinH = maxHeight(mobileTier ?? flat, 50);
    maxW = maxWidth(desktopTier ?? flat, 728);
  }

  return (
    <AdSlotView
      slotKey={slotKey}
      gamPath={slot?.gamPath ?? "UNKNOWN"}
      divId={slot?.divId}
      device={slot?.device ?? "responsive"}
      mobileMinH={mobileMinH}
      desktopMinH={desktopMinH}
      maxW={maxW}
      lazyLoad={slot?.lazyLoad ?? true}
      marginPx={slot?.lazyLoadMarginPx ?? 300}
      sticky={sticky}
    />
  );
}
