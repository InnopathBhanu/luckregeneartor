/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type CheckTicket = {
  heading?: string;
  intro?: string;
  howItWorks?: string[];
  gameOptions?: string[];
  note?: string;
};

/* Check Your Ticket tool — Phase-1 non-functional placeholder form (no matching logic yet). */
export default function CheckTicketTool({ data }: { data?: CheckTicket }) {
  if (!data) return null;
  return (
    <section id="check-ticket" className="rounded-lg p-4" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
      <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Check Your Ticket")}</h2>
      {data.intro ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}

      {data.howItWorks && data.howItWorks.length > 0 ? (
        <div className="mt-3 rounded-md p-3 text-sm" style={{ background: "var(--lc-info-bg)", border: "1px solid var(--lc-info-border)" }}>
          <p className="font-semibold">How it works:</p>
          <ol className="mt-1 list-decimal pl-5" style={{ color: "var(--lc-muted)" }}>
            {data.howItWorks.map((s, i) => <li key={i}>{cleanCopy(s)}</li>)}
          </ol>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Select Game</span>
          <select disabled className="w-full rounded border px-2 py-2" style={{ borderColor: "var(--lc-border)", background: "var(--lc-surface)" }} defaultValue="">
            <option value="" disabled>Choose a game…</option>
            {(data.gameOptions ?? []).map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Draw Date</span>
          <input type="date" disabled className="w-full rounded border px-2 py-2" style={{ borderColor: "var(--lc-border)", background: "var(--lc-surface)" }} />
        </label>
      </div>
      <button type="button" disabled className="mt-3 w-full rounded-md py-2 text-sm font-semibold text-white opacity-80" style={{ background: "var(--lc-muted)" }}>
        Check My Ticket
      </button>
      {data.note ? <p className="mt-2 text-xs" style={{ color: "var(--lc-muted)" }}>ⓘ {cleanCopy(data.note)}</p> : null}
    </section>
  );
}
