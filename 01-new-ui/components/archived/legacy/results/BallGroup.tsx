/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import type { BallGroupDrawn } from "@/lib/data-provider/types";

/*
 * Renders ONE ball group from drawn values. Ball count is derived from values.length — NEVER
 * hardcoded. Wraps automatically, so 1-ball (Cash Pop) through 20+1 (Keno/Quick Draw) all work.
 * Colors come from the group's colorToken (mapped to CSS in globals.css), not hardcoded.
 */
export default function BallGroup({
  group,
  isCard = false,
}: {
  group: BallGroupDrawn;
  isCard?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {group.values.map((v, i) => (
          <span
            key={i}
            className={isCard ? "lc-ball lc-ball--card" : "lc-ball"}
            data-token={group.colorToken}
          >
            {v}
          </span>
        ))}
      </div>
      {group.label ? (
        <span className="text-xs" style={{ color: "var(--lc-muted)" }}>
          {group.label}
        </span>
      ) : null}
    </div>
  );
}
