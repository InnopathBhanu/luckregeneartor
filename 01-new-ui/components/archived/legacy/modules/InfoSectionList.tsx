/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type Section = { title: string; body?: string; list?: string[] };
type Group = { title: string; list: string[] };

/*
 * Generic titled-content renderer used by both "Player Information" (sections with body/list) and
 * "Sources & Methodology" (groups with list). Keeps content data-driven, not hardcoded.
 */
export default function InfoSectionList({
  id,
  heading,
  intro,
  sections,
  groups,
}: {
  id?: string;
  heading?: string;
  intro?: string;
  sections?: Section[];
  groups?: Group[];
}) {
  const items: Section[] = sections ?? (groups ?? []).map((g) => ({ title: g.title, list: g.list }));
  if (items.length === 0) return null;
  return (
    <section id={id} aria-label={heading} className="flex flex-col gap-3">
      {heading ? <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(heading)}</h2> : null}
      {intro ? <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(intro)}</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((s, i) => (
          <div key={i} className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
            <h3 className="mb-1 text-sm font-bold">{cleanCopy(s.title)}</h3>
            {s.body ? <p className="text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(s.body)}</p> : null}
            {s.list && s.list.length > 0 ? (
              <ul className="list-disc pl-5 text-sm" style={{ color: "var(--lc-muted)" }}>
                {s.list.map((li, k) => <li key={k}>{cleanCopy(li)}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
