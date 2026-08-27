/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";
import { gameThemeVarsFor, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";

type Highlights = {
  heading?: string;
  intro?: string;
  recentWins?: { location: string; text: string }[];
  unclaimedPrizes?: { game: string; amount: string; location: string; note?: string }[];
  jackpotGrowth?: { game: string; text: string }[];
  note?: string;
};

export default function HighlightsAlerts({ data }: { data?: Highlights }) {
  if (!data) return null;
  return (
    <section aria-label={data.heading ?? "Recent Highlights & Alerts"} className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Recent Highlights & Alerts")}</h2>
        {data.intro ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      </div>

      {data.recentWins && data.recentWins.length > 0 ? (
        <div className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
          <h3 className="mb-2 text-sm font-bold">Recent Florida Lottery Wins</h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            {data.recentWins.map((w, i) => (
              <li key={i}><strong>{cleanCopy(w.location)}</strong> — {cleanCopy(w.text)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.unclaimedPrizes && data.unclaimedPrizes.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-bold">Unclaimed Florida Lottery Prizes</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {data.unclaimedPrizes.map((u, i) => (
              /* FGP-011: an unclaimed prize names a game, so it carries that game's colour rather than the
                 site's one red — the same identity the card for that game shows further up the page. */
              <li key={i} className="rounded-md p-2.5" style={{ ...gameThemeVarsFor(u.game), background: "var(--lc-info-bg)", border: "1px solid var(--lc-info-border)" }} data-game-theme={resolveGameTheme(u.game).id}>
                <span className="font-semibold" style={{ color: "var(--gt-accent-ink)" }}>{cleanCopy(u.game)} — {cleanCopy(u.amount)} ({cleanCopy(u.location)})</span>
                {u.note ? <span style={{ color: "var(--lc-muted)" }}>: {cleanCopy(u.note)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.jackpotGrowth && data.jackpotGrowth.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-bold">Jackpot Growth & Rollovers</h3>
          <ul className="list-disc pl-5 text-sm" style={{ color: "var(--lc-muted)" }}>
            {data.jackpotGrowth.map((g, i) => (
              <li key={i}><strong style={{ color: "var(--lc-text)" }}>{cleanCopy(g.game)}</strong> — {cleanCopy(g.text)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.note ? <p className="text-xs" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.note)}</p> : null}
    </section>
  );
}
