/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type QuickFacts = { heading?: string; rows: { label: string; value: string }[] };

/* Generic label/value facts table. Heading + rows come from state JSON (not hardcoded). */
export default function QuickFactsTable({ data }: { data?: QuickFacts }) {
  if (!data?.rows || data.rows.length === 0) return null;
  return (
    <section aria-label={data.heading ?? "Quick Facts"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Quick Facts")}</h2>
      <div className="overflow-x-auto rounded-md" style={{ border: "1px solid var(--lc-border)" }}>
        <table className="w-full text-left text-sm">
          <tbody>
            {data.rows.map((r, i) => (
              <tr key={i} style={{ borderTop: i ? "1px solid var(--lc-border)" : "none", background: i % 2 ? "var(--lc-info-bg)" : "transparent" }}>
                <td className="p-2 font-semibold">{cleanCopy(r.label)}</td>
                <td className="p-2" style={{ color: "var(--lc-muted)" }}>{cleanCopy(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
