/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import { cleanCopy } from "@/lib/text/cleanCopy";

type ContentMeta = {
  source?: string;
  reviewStatus?: string;
  lastReviewed?: string;
  note?: string;
};

/*
 * Generic content-freshness / review note (seeds the future admin draft→review→publish workflow).
 * Data-driven; renders a small trust line only if data exists. No editing UI here — Phase 1 display
 * only. Future admin/agent updates should flow through review/publish, not uncontrolled live edits.
 */
export default function ContentFreshnessNote({ data }: { data?: ContentMeta }) {
  if (!data || (!data.source && !data.note && !data.reviewStatus)) return null;
  const bits = [
    data.source ? `Source: ${cleanCopy(data.source)}` : null,
    data.lastReviewed ? `Reviewed: ${cleanCopy(data.lastReviewed)}` : null,
    data.reviewStatus ? `Status: ${cleanCopy(data.reviewStatus)}` : null,
  ].filter(Boolean);
  return (
    <p className="text-xs" style={{ color: "var(--lc-muted)" }} data-content-review={cleanCopy(data.reviewStatus, "")}>
      {bits.join(" · ")}
      {data.note ? ` — ${cleanCopy(data.note)}` : ""}
    </p>
  );
}
