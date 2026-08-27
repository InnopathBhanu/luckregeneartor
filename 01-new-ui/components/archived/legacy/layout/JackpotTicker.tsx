/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import Link from "next/link";
import type { JackpotTickerData } from "@/lib/data-provider/types";
import { cleanCopy } from "@/lib/text/cleanCopy";

/*
 * Jackpot ticker sub-bar (grey band) matching the proposed PDF: next-draw + countdown, Top Jackpots
 * with $ values, quick actions (incl. Buy Tickets via /buynow only), "also coming up", disclaimer.
 * Full-bleed band; content constrained via .lc-container.
 */
export default function JackpotTicker({ data }: { data?: JackpotTickerData }) {
  if (!data) return null;
  const buy = data.buyTickets;
  const buyOk = buy?.href?.startsWith("/buynow/");
  return (
    <div className="w-full text-xs" style={{ background: "var(--lc-ticker-bg)", borderBottom: "1px solid var(--lc-border)" }}>
      <div className="lc-container flex flex-col gap-1.5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {data.nextDraw ? (
              <span>
                ⏱ Next draw: <strong>{data.nextDraw.game}</strong> — {data.nextDraw.timeDisplay}
                {data.nextDraw.countdownLabel ? (
                  <span className="ml-1 rounded px-1.5 py-0.5 font-semibold text-white" style={{ background: "var(--lc-accent)" }}>
                    {data.nextDraw.countdownLabel}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <nav className="flex flex-wrap items-center gap-3" aria-label="Quick actions">
            {(data.quickActions ?? []).map((q) => (
              <Link key={q.label} href={q.href} className="hover:underline">{q.label}</Link>
            ))}
            {buyOk ? (
              <Link href={buy!.href} className="font-semibold" style={{ color: "var(--lc-accent)" }} rel="nofollow sponsored">
                ↗ {buy!.label}
              </Link>
            ) : null}
          </nav>
        </div>

        {data.topJackpots && data.topJackpots.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold" style={{ color: "var(--lc-accent)" }}>$ Top Jackpots:</span>
            {data.topJackpots.map((j, i) => (
              <span key={j.game}>
                {i > 0 ? "· " : ""}
                {j.game} <span className="font-semibold" style={{ color: "var(--lc-accent)" }}>{j.amountDisplay}</span>
              </span>
            ))}
          </div>
        ) : null}

        {data.alsoComingUp && data.alsoComingUp.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-3" style={{ color: "var(--lc-muted)" }}>
            <span>Also coming up:</span>
            {data.alsoComingUp.map((c) => (
              <span key={c.game}>
                <strong>{c.game}</strong>{c.countdownLabel ? ` ${c.countdownLabel}` : ""}
              </span>
            ))}
          </div>
        ) : null}

        {data.disclaimer ? (
          <p className="text-center" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.disclaimer)}</p>
        ) : null}
      </div>
    </div>
  );
}
