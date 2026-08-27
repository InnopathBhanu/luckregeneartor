"use client";

/*
 * CONSOLE-APPROVED ITEMS ON THE FAMILY HUBS — the Conflict 40 round trip's public half.
 *
 * An item entered in the console and APPROVED (draft → pending → approved, contentMeta on every step) must
 * appear in its family's review feed — this strip is where it appears, on /news and /blog. It follows the
 * community family's client-resolved precedent exactly: the store is browser-side review data, so the
 * server HTML carries nothing (this component's first render is empty), and the items hydrate in on the
 * machine that holds the store. A real editorial backend replaces this with ordinary server reads.
 *
 * WHAT THIS DELIBERATELY IS NOT: an admin surface. No control, no action, no console link renders here —
 * admin controls never appear in public page markup (Global Shell §15). It renders CONTENT, clearly
 * labelled as review-build editorial entries.
 */

import { useEffect, useState } from "react";
import type { AdminEditorialItem } from "@/lib/admin/adminContract";
import { approvedEditorialItems } from "@/lib/admin/adminContentStore";

export default function ConsoleApprovedItems({ family }: { family: "news" | "blog" }) {
  /* Read once after hydration: server render and first client render are identical (and empty). */
  const [items, setItems] = useState<readonly AdminEditorialItem[]>([]);
  useEffect(() => {
    setItems(approvedEditorialItems(family));
  }, [family]);

  if (items.length === 0) return null;

  return (
    <div className="lcm-consoleitems" data-console-approved={family} data-console-approved-count={items.length}>
      <p className="lcm-consoleitems__label">
        Entered and approved through this review build&apos;s editorial console — review content on this
        machine only, not published editorial output.
      </p>
      {items.map((item) => (
        <article key={item.id} className="lcm-consoleitem" data-console-item={item.slug}>
          <p className="lcm-consoleitem__kicker">
            <span>{item.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={item.contentMeta.lastReviewedIso ?? item.createdAtIso}>
              {new Date(item.contentMeta.lastReviewedIso ?? item.createdAtIso).toLocaleDateString()}
            </time>
            <span aria-hidden="true">·</span>
            <span>Editor: {item.editorName}</span>
          </p>
          <h3 className="lcm-consoleitem__title">{item.headline}</h3>
          {item.bottomLine ? <p className="lcm-consoleitem__bottomline">{item.bottomLine}</p> : null}
          <p className="lcm-consoleitem__summary">{item.description}</p>
          {item.body.map((p, i) => (
            <p key={i} className="lcm-consoleitem__para">{p}</p>
          ))}
          <p className="lcm-consoleitem__source">Source basis: {item.evidenceNote}</p>
        </article>
      ))}
    </div>
  );
}
