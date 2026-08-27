/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

"use client";

import Link from "next/link";
import { useState } from "react";

/*
 * StateDirectory — crawlable state links (server-rendered) + a progressive-enhancement filter input.
 * The full list is always in the HTML (SEO); the filter only hides/shows client-side.
 */
export default function StateDirectory({
  states,
}: {
  states: { code: string; name: string; href: string }[];
}) {
  const [q, setQ] = useState("");
  const norm = q.trim().toLowerCase();
  return (
    <div>
      <label className="sr-only" htmlFor="state-filter">Filter states</label>
      <input
        id="state-filter"
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter states…"
        className="mb-3 w-full max-w-xs rounded border px-3 py-2 text-sm"
        style={{ borderColor: "var(--lc-border)", background: "var(--lc-surface)" }}
      />
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {states.map((s) => {
          const hidden = norm.length > 0 && !s.name.toLowerCase().includes(norm) && !s.code.includes(norm);
          return (
            <li key={s.code} hidden={hidden}>
              <Link href={s.href} className="block rounded-md border px-3 py-2 text-sm hover:underline" style={{ borderColor: "var(--lc-border)", color: "var(--lc-heading)" }}>
                {s.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
