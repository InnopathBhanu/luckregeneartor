/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type HighlightsGrid = {
  heading?: string;
  intro?: string;
  items: { label: string; value: string; note?: string }[];
};

/* Generic labeled stat-card grid (e.g. NY "Highlights Today"). Data-driven; renders if items exist. */
export default function HighlightsGrid({ data }: { data?: HighlightsGrid }) {
  if (!data?.items || data.items.length === 0) return null;
  return (
    <section aria-label={data.heading ?? "Highlights"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Highlights")}</h2>
      {data.intro ? <p className="mb-3 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.items.map((it, i) => (
          <div key={i} className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--lc-muted)" }}>{cleanCopy(it.label)}</p>
            <p className="text-base font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(it.value)}</p>
            {it.note ? <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(it.note)}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
