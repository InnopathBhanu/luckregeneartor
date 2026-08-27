/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type BiggestWinners = {
  heading?: string;
  intro?: string;
  items: { title?: string; amount?: string; game?: string; location?: string; date?: string; text: string }[];
};

/* Generic "biggest winners" list. Item fields are optional; heading/content from state JSON. */
export default function BiggestWinnersSection({ data }: { data?: BiggestWinners }) {
  if (!data?.items || data.items.length === 0) return null;
  return (
    <section aria-label={data.heading ?? "Biggest Winners"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Biggest Winners")}</h2>
      {data.intro ? <p className="mb-2 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      <ul className="flex flex-col gap-2">
        {data.items.map((w, i) => {
          const head = [w.amount, w.game, w.location].filter(Boolean).map((s) => cleanCopy(s)).join(" · ");
          return (
            <li key={i} className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
              {w.title ? <p className="text-sm font-bold">{cleanCopy(w.title)}</p> : null}
              {head ? <p className="text-sm font-semibold" style={{ color: "var(--lc-accent)" }}>{head}{w.date ? ` (${cleanCopy(w.date)})` : ""}</p> : null}
              <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(w.text)}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
