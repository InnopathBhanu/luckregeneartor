/*
 * "Discuss these results" — a NORMAL NAVIGATION, not a dialog. LRG-STATE-037 FV-05.
 *
 * WHAT CHANGED AND WHY. This was a button that opened a modal drawer. Founder review rejected modal-based
 * exploration outright: ordinary browsing on a public lottery site is links and pages, not dialogs.
 *
 * WHERE IT GOES.
 * The approved canonical routes are `/community` and `/community/{forum-entry-slug}` — CLAUDE.md §10 lists both
 * as preserved page families, and `08B-...forum-entry-blueprint` fixes the entry route. While neither was
 * implemented, FV-05 forbade inventing a production URL, so this used the governed in-page community anchor as
 * the guarded-preview fallback. **The Community family now serves `/community` from the registry** (commit
 * a39bdfe, Conflict 41 FOUNDER AMENDMENT), which satisfies `FD-ACC-10`'s hidden-because-no-forum condition by
 * construction — so a caller whose blueprint designates a real community destination passes `href`, and the
 * in-page anchor remains the default for the State page's own community groups.
 *
 * CONTEXT IS PRESERVED by navigating to the SPECIFIC community group that fits the game, rather than to the
 * top of the section — `#community-daily`, `#community-jackpot` or `#community-help`. That is real preserved
 * context in a plain anchor, with no JavaScript and no fabricated thread.
 *
 * It is a server component: a link needs no client runtime.
 */

import type { DiscussionContext } from "@/lib/state/stateEngagement";

export default function StateDiscussLink({
  context,
  groupId,
  href,
  /* LRG-STATE-039 §7: friendly, reader-facing language. */
  label = "Discuss this result",
  variant = "link",
}: {
  /** Carried for the data attributes, so an audit can see which result the entry belongs to. */
  context: DiscussionContext;
  /** The community group this game belongs to. */
  groupId: string;
  /** A real registered destination (e.g. `/community`). When absent, the in-page group anchor is used. */
  href?: string;
  label?: string;
  variant?: "link" | "action";
}) {
  return (
    <a
      className={variant === "action" ? "lcs-act__link" : "lcs-fp__link lcs-fp__link--discuss"}
      href={href ?? `#${groupId}`}
      data-discuss-link={context.familyId ?? "state"}
      data-discuss-group={groupId}
      /* The context travels as data so the destination — and any audit — can see what was being discussed.
         No thread, author, reply or count is invented anywhere. */
      data-discuss-date={context.resultDateIso ?? undefined}
      data-discuss-status={context.resultStatus ?? undefined}
    >
      {label}
    </a>
  );
}
