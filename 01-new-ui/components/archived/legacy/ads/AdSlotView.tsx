/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

"use client";

import { useEffect, useRef, useState } from "react";

/*
 * AdSlotView — client, LAZY-LOAD READY placeholder.
 *
 * - RESERVES space up-front (mobile min-height inline; desktop min-height via CSS var + media query
 *   at 992px, matching the GAM size-mapping breakpoint) so there is NO layout shift.
 * - Uses IntersectionObserver with rootMargin = lazyLoadMarginPx to detect when the slot NEARS the
 *   viewport, then flips data-in-view / data-ad-requested. Eager slots (lazyLoad=false, e.g. the
 *   above-the-fold top billboard) are marked ready immediately.
 * - It does NOT call googletag or load any ad script. This is the single, well-defined hook point
 *   where FUTURE GAM integration should request the ad for this divId — and only then, so ads are
 *   requested near-viewport instead of all at once.
 */
export default function AdSlotView({
  slotKey,
  gamPath,
  divId,
  device = "responsive",
  mobileMinH,
  desktopMinH,
  maxW,
  lazyLoad = true,
  marginPx = 300,
  sticky = false,
}: {
  slotKey: string;
  gamPath: string;
  divId?: string;
  device?: string;
  mobileMinH: number;
  desktopMinH: number;
  maxW: number;
  lazyLoad?: boolean;
  marginPx?: number;
  sticky?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(!lazyLoad);

  useEffect(() => {
    if (inView) return; // eager, or already triggered
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true); // graceful fallback: reserve + mark ready
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
          // FUTURE GAM HOOK (do NOT enable yet):
          //   window.googletag?.cmd.push(() => window.googletag.display(divId));
          // Requesting here (near-viewport) avoids requesting every slot on load.
        }
      },
      { rootMargin: `${marginPx}px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, marginPx]);

  const mobileOnly = device === "mobile";
  // Sticky footer: no vertical margin, so the reserved bar stays flush to the fixed creative height
  // (production compresses the sticky ad content; here we simply avoid inflating the bar).
  const marginClass = sticky ? "my-0" : "my-3";

  return (
    <div
      ref={ref}
      className={`lc-adslot ${marginClass} w-full${mobileOnly ? " lc-ad--mobile-only" : ""}`}
      style={
        {
          minHeight: mobileMinH,
          maxWidth: maxW,
          marginInline: "auto",
          ["--lc-ad-desktop-h" as string]: `${desktopMinH}px`,
        } as React.CSSProperties
      }
      data-slot-key={slotKey}
      data-gam-path={gamPath}
      data-div-id={divId ?? "UNKNOWN"}
      data-device={device}
      data-desktop-minh="1"
      data-fixed-placement="true"
      data-lazy={lazyLoad ? "true" : "false"}
      data-in-view={inView ? "true" : "false"}
      data-ad-requested={inView ? "true" : "false"}
      role="complementary"
      aria-label="Advertisement"
    >
      Advertisement
    </div>
  );
}
