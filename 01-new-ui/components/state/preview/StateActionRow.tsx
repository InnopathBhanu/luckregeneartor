"use client";

/*
 * THE CONSUMER ACTION ROW — LRG-STATE-037 FV-08.
 *
 * WHAT IT REPLACED. Four equal outlined cards, each with a line of explanatory microcopy beneath its label.
 * Founder review read that as four administrative controls rather than as four things a person might want, and
 * the four-card block consumed most of a mobile screen on its own.
 *
 * WHAT IT IS NOW. One prominent `Ask AI` and three compact secondary actions. Plain, familiar labels; no
 * microcopy under any of them.
 *
 * NOTHING HERE OPENS A DIALOG (FV-03).
 *   - Ask AI      scrolls to the inline AI section, prefills the contextual question and expands the answer.
 *   - Discuss     is a plain anchor to the community group that fits the game.
 *   - What changed is a plain anchor to the inline disclosure directly beneath this row.
 *   - Buy Now     scrolls to S-07 and expands the inline resolver there.
 *
 * The two that need JavaScript dispatch an event and then MOVE THE READER TO the surface — they never render a
 * surface of their own, which is what keeps "one shared surface" true.
 */

import { engagementActions, type DiscussionContext } from "@/lib/state/stateEngagement";

/** Scroll to a section, then move focus into it so a keyboard reader lands there too. */
function goTo(id: string, focusSelector?: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ block: "start", behavior: "smooth" });
  const focusable = focusSelector
    ? document.querySelector<HTMLElement>(focusSelector)
    : target;
  if (focusable) {
    focusable.setAttribute("tabindex", focusable.tabIndex >= 0 ? String(focusable.tabIndex) : "-1");
    focusable.focus({ preventScroll: true });
  }
}

export default function StateActionRow({
  stateName,
  context,
  focusFamilyId,
  communityGroupId,
}: {
  stateName: string;
  context: DiscussionContext;
  focusFamilyId: string | null;
  communityGroupId: string;
}) {
  const askAi = () => {
    /* Prefill + expand happen in the AI section; this action only says which question and from where. */
    window.dispatchEvent(new CustomEvent("lcs-ai-ask", {
      detail: { key: "explain-result", familyId: focusFamilyId, prefill: true },
    }));
    goTo("state-ai-brief", "[data-ai-input]");
  };

  const buyNow = () => {
    window.dispatchEvent(new CustomEvent("lcs-buynow-open", {
      detail: { stateName, gameLabel: context.familyLabel },
    }));
    goTo("where-to-play", "[data-resolver-heading]");
  };

  /* Order, labels and emphasis come from the one governed list, so the row cannot drift from the record. */
  const [primary, ...secondary] = engagementActions();

  return (
    <div className="lcs-act" data-action-row="true">
      <button type="button" className="lcs-act__primary" data-action={primary.key} onClick={askAi}>
        {/* The only place a label is refined, per §8: the reader is asking about the result they just read. */}
        {primary.label} about {context.familyLabel ?? stateName}
      </button>

      <div className="lcs-act__rest">
        {secondary.map((a) =>
          a.opens === "commerce" ? (
            <button
              key={a.key}
              type="button"
              className="lcs-act__link"
              data-action={a.key}
              onClick={buyNow}
            >
              {a.label}
            </button>
          ) : (
            <a
              key={a.key}
              className="lcs-act__link"
              /* `discussion` resolves per family; `route` carries its own in-page id. */
              href={a.opens === "discussion" ? `#${communityGroupId}` : a.href}
              data-action={a.key}
            >
              {a.label}
            </a>
          ),
        )}
      </div>
    </div>
  );
}
