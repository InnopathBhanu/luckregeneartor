/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import Link from "next/link";
import { cleanCopy } from "@/lib/text/cleanCopy";

type HistoryLinks = { heading?: string; intro?: string; links: { label: string; href: string }[] };

/*
 * Generic crawlable internal-links section (id="winning-history" — targets the "Winning History"
 * / "Past Results" anchors). Links come from state JSON; good for SEO internal linking.
 */
export default function HistoryLinksSection({ data }: { data?: HistoryLinks }) {
  if (!data?.links || data.links.length === 0) return null;
  return (
    <section id="winning-history" aria-label={data.heading ?? "Winning Numbers History"}>
      <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(data.heading, "Winning Numbers History")}</h2>
      {data.intro ? <p className="mb-2 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(data.intro)}</p> : null}
      <ul className="flex flex-wrap gap-2">
        {data.links.map((l, i) => (
          <li key={i}>
            <Link
              href={l.href}
              className="inline-block rounded-md border px-3 py-1.5 text-sm font-semibold"
              style={{ borderColor: "var(--lc-border)", color: "var(--lc-heading)" }}
            >
              {cleanCopy(l.label)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
