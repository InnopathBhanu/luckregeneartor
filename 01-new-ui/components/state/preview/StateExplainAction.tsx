"use client";

/*
 * A contextual `Explain` action — FD-X-08.
 *
 * This is the mechanism that keeps "ONE shared answer surface" true in the DOM rather than only on paper:
 * the button owns no panel and renders no answer. It dispatches a selection at the single shared surface
 * (S-03) and moves focus there, so every Explain action anywhere on the page writes into the same region.
 *
 * It is genuinely functional — it really selects the prompt and really moves the user to the answer
 * surface — so it is not a disabled control and not a fake handler (FD-S-08).
 */

import { IconDrawAnalysis } from "@/components/preview/AiIcon";

export default function StateExplainAction({
  promptKey,
  label,
  familyId = null,
}: {
  promptKey: string;
  label: string;
  /**
   * The family this action came from, carried to the shared surface so the answer is about the result the
   * reader was actually looking at rather than a page default (LRG-STATE-034 §4).
   */
  familyId?: string | null;
}) {
  return (
    <button
      type="button"
      /*
       * LRG-STATE-036 §8 — HOME'S INLINE AI GRAMMAR. Home's contextual AI action is
       * `button.lcp-aiact__item`: transparent, borderless, 13px/600, `--color-ai`, underline on hover, with an
       * `AiIcon` spark beside the label. State reuses that class verbatim and adds `.lcs-explain` only to lift
       * the target to 44px — Home uses 32px because its actions sit inside an analysis panel rather than a
       * touch-first result row.
       */
      className="lcp-aiact__item lcs-explain"
      data-explain-prompt={promptKey}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("lcs-ai-select", { detail: { key: promptKey, familyId } }),
        );
        const target = document.getElementById("state-ai-brief");
        target?.scrollIntoView({ block: "start", behavior: "smooth" });
        /* Move focus, not just scroll — a keyboard user must land on the answer surface too. */
        const panel = document.querySelector<HTMLElement>("[data-ai-panel]");
        panel?.setAttribute("tabindex", "-1");
        panel?.focus();
      }}
    >
      {/* The icon SUPPORTS the label and never replaces it — it is decorative, and `AiIcon` is imported
          unchanged from the Home preview icon set, which is pure inline SVG with no Home coupling. */}
      <span className="lcp-aiact__mark" aria-hidden="true">
        <IconDrawAnalysis size={16} />
      </span>
      {label}
    </button>
  );
}
