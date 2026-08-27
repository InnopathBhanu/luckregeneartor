/* ARCHIVED — unreachable from any route since `FD-GATE-01` (2026-08-11) made the blueprint templates the
   sole render path. Archived, not deleted (`CLAUDE.md` §6). See `legacy/home/HomeTemplate.tsx` for the
   full reasoning and the revival conditions. */

import type { FaqBlock } from "@/lib/data-provider/types";
import { cleanCopy } from "@/lib/text/cleanCopy";

/* Visible FAQ accordion (native <details>). Used for both the mini and final FAQ blocks. */
export default function FaqAccordion({ faq, id }: { faq?: FaqBlock; id?: string }) {
  if (!faq?.items || faq.items.length === 0) return null;
  return (
    <section id={id} aria-label={faq.heading ?? "FAQs"} className="flex flex-col gap-3">
      {faq.heading ? <h2 className="text-xl font-bold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(faq.heading)}</h2> : null}
      <div className="flex flex-col gap-2">
        {faq.items.map((f, i) => (
          <details key={i} className="rounded-md p-3" style={{ background: "var(--lc-surface)", border: "1px solid var(--lc-border)" }}>
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--lc-heading)" }}>{cleanCopy(f.q)}</summary>
            <p className="mt-1 text-sm" style={{ color: "var(--lc-muted)" }}>{cleanCopy(f.a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
