/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type DrawSchedule = {
  heading?: string;
  intro?: string;
  entries: { game: string; days: string; timeDisplay: string }[];
};

/* Generic draw-schedule table (id="schedule" — targets the "Schedule" tab anchor). Data-driven. */
export default function DrawScheduleTable({ data }: { data?: DrawSchedule }) {
  if (!data?.entries || data.entries.length === 0) return null;
  return (
    <section id="schedule" aria-label={data.heading ?? "Draw Schedule"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Draw Schedule")}</h2>
      {data.intro ? <p className="mb-2 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      <div className="overflow-x-auto rounded-md" style={{ border: "1px solid var(--lc-border)" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: "var(--lc-info-bg)" }}>
              <th className="p-2 font-semibold">Game</th>
              <th className="p-2 font-semibold">Days</th>
              <th className="p-2 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((e, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--lc-border)" }}>
                <td className="p-2 font-semibold">{cleanCopy(e.game)}</td>
                <td className="p-2" style={{ color: "var(--lc-muted)" }}>{cleanCopy(e.days)}</td>
                <td className="p-2" style={{ color: "var(--lc-muted)" }}>{cleanCopy(e.timeDisplay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
