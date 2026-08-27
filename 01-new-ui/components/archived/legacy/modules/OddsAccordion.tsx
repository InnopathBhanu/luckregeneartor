/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type OddsGuide = {
  heading?: string;
  intro?: string;
  games?: {
    gameName: string;
    rules?: string;
    prizeMatrix?: { tier: string; prize: string }[];
    odds?: string[];
  }[];
};

/* Game odds / prize-matrix accordions (native <details>). */
export default function OddsAccordion({ data }: { data?: OddsGuide }) {
  if (!data?.games || data.games.length === 0) return null;
  return (
    <section id="how-to-play" aria-label={data.heading ?? "Game Odds & Prize Matrix"} className="flex flex-col gap-3">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Game Odds & Prize Matrix")}</h2>
        {data.intro ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        {data.games.map((g, i) => (
          <details key={i} className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
            <summary className="cursor-pointer font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(g.gameName)} — Odds &amp; Prize Guide</summary>
            {g.rules ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(g.rules)}</p> : null}
            {g.prizeMatrix && g.prizeMatrix.length > 0 ? (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {g.prizeMatrix.map((row, r) => (
                      <tr key={r} style={{ borderTop: "1px solid var(--lc-border)" }}>
                        <td className="py-1.5 pr-4 font-semibold">{cleanCopy(row.tier)}</td>
                        <td className="py-1.5" style={{ color: "var(--lc-muted)" }}>{cleanCopy(row.prize)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {g.odds && g.odds.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: "var(--lc-muted)" }}>
                {g.odds.map((o, k) => <li key={k}>{cleanCopy(o)}</li>)}
              </ul>
            ) : null}
          </details>
        ))}
      </div>
    </section>
  );
}
