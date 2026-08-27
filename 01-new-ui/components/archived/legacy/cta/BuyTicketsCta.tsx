/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import Link from "next/link";

/*
 * BuyTicketsCta — Phase 1.
 *
 * Renders the CTA in its required position, but the destination is ONLY the internal
 * /buynow/<code> redirect. External affiliate URLs are never hardcoded here (13/14 D2). Any href
 * that is not an internal /buynow/ path is rejected (renders nothing) to enforce the rule.
 */
export default function BuyTicketsCta({
  href,
  label = "Buy Tickets",
}: {
  href?: string | null;
  label?: string;
}) {
  if (!href || !href.startsWith("/buynow/")) {
    // Guard: never emit an external/hardcoded affiliate URL.
    return null;
  }
  return (
    <Link
      href={href}
      className="inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white"
      style={{ background: "var(--lc-accent)" }}
      data-affiliate-resolved="false"
      rel="nofollow sponsored"
    >
      {label}
    </Link>
  );
}
