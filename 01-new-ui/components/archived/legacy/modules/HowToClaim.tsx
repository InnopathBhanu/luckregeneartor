/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type HowToClaim = {
  heading?: string;
  intro?: string;
  claimOptions?: { amount: string; method: string }[];
  documents?: string[];
  steps?: { title: string; detail: string }[];
  deadlines?: string[];
  districtOffices?: string;
};

export default function HowToClaim({ data }: { data?: HowToClaim }) {
  if (!data) return null;
  return (
    <section id="how-to-claim" aria-label={data.heading ?? "How to Claim"} className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "How to Claim Prizes")}</h2>
        {data.intro ? <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.claimOptions && data.claimOptions.length > 0 ? (
          <div className="overflow-x-auto rounded-md" style={{ border: "1px solid var(--lc-border)" }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ background: "var(--lc-info-bg)" }}>
                  <th className="p-2 font-semibold">Prize Amount</th>
                  <th className="p-2 font-semibold">Claim Method</th>
                </tr>
              </thead>
              <tbody>
                {data.claimOptions.map((o, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--lc-border)" }}>
                    <td className="p-2 font-semibold">{cleanCopy(o.amount)}</td>
                    <td className="p-2" style={{ color: "var(--lc-muted)" }}>{cleanCopy(o.method)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {data.documents && data.documents.length > 0 ? (
          <div className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
            <h3 className="mb-2 text-sm font-bold">Documents You Must Bring</h3>
            <ul className="list-disc pl-5 text-sm" style={{ color: "var(--lc-muted)" }}>
              {data.documents.map((d, i) => <li key={i}>{cleanCopy(d)}</li>)}
            </ul>
          </div>
        ) : null}
      </div>

      {data.steps && data.steps.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-bold">Step-by-Step: How to Claim Your Prize</h3>
          <ol className="flex flex-col gap-1.5 pl-5 text-sm" style={{ listStyle: "decimal" }}>
            {data.steps.map((s, i) => (
              <li key={i}><strong>{cleanCopy(s.title)}</strong> — <span style={{ color: "var(--lc-muted)" }}>{cleanCopy(s.detail)}</span></li>
            ))}
          </ol>
        </div>
      ) : null}

      {data.deadlines && data.deadlines.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-bold">Claim Deadlines You Should Know</h3>
          <ul className="list-disc pl-5 text-sm" style={{ color: "var(--lc-muted)" }}>
            {data.deadlines.map((d, i) => <li key={i}>{cleanCopy(d)}</li>)}
          </ul>
        </div>
      ) : null}

      {data.districtOffices ? (
        <p className="text-sm" style={{ color: "var(--lc-muted)" }}><strong style={{ color: "var(--lc-text)" }}>Where to Claim:</strong> {cleanCopy(data.districtOffices)}</p>
      ) : null}
    </section>
  );
}
