/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import Link from "next/link";
import type { TabItem } from "@/lib/data-provider/types";

/* In-page anchor tab nav (Results / Winning History / Schedule / How to Play / How to Claim). */
export default function TabNav({ tabs }: { tabs?: TabItem[] }) {
  if (!tabs || tabs.length === 0) return null;
  return (
    <nav className="flex flex-wrap gap-1 border-b py-2" style={{ borderColor: "var(--lc-border)" }} aria-label="Sections">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className="rounded-md px-3 py-1.5 text-sm font-semibold"
          style={
            t.active
              ? { background: "var(--lc-tab-active)", color: "#fff" }
              : { color: "var(--lc-muted)" }
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
