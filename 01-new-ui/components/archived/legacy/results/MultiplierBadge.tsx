/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import type { MultiplierDrawn } from "@/lib/data-provider/types";

/** Multiplier/add-on badge (Power Play, Multiplier/Megaplier, etc.). Optional per draw. */
export default function MultiplierBadge({ multiplier }: { multiplier: MultiplierDrawn }) {
  const text = multiplier.display ?? `${multiplier.label} ${multiplier.value}X`;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ border: "1px solid var(--lc-border)", color: "var(--lc-text)" }}
    >
      {text}
    </span>
  );
}
