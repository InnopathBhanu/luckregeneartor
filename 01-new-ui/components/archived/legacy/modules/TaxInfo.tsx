/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type Taxes = { heading?: string; stateNote?: string; federalIntro?: string; points?: string[] };

export default function TaxInfo({ data }: { data?: Taxes }) {
  if (!data) return null;
  return (
    <section aria-label={data.heading ?? "Taxes & Withholding"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Taxes & Withholding")}</h2>
      <div className="rounded-md p-4" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
        {data.stateNote ? <p className="font-semibold">{cleanCopy(data.stateNote)}</p> : null}
        {data.federalIntro ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.federalIntro)}</p> : null}
        {data.points && data.points.length > 0 ? (
          <ul className="mt-1 list-disc pl-5 text-sm" style={{ color: "var(--lc-muted)" }}>
            {data.points.map((p, i) => <li key={i}>{cleanCopy(p)}</li>)}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
