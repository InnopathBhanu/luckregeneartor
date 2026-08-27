"use client";

/*
 * A `Buy Now` entry point — FD-N-03.
 *
 * Every instance opens the ONE shared resolver surface. The button owns no options, names no provider and
 * carries no destination; it dispatches a request and the resolver decides. That is what makes `Buy Now`
 * safe to place prominently: the label is an entry, and the governed resolver is the authority.
 *
 * It is genuinely functional — it really opens the resolver — so it is not a disabled control and not a
 * fake handler (`FD-S-08`).
 */

/*
 * LRG-STATE-031 §9 — VARIANTS ARE HIERARCHY, NOT DECORATION.
 *
 * Founder review of V1 rejected "repeated small Buy Now buttons rather than one clear commerce journey".
 * V1 rendered fourteen identical filled buttons, so nothing was primary. The fix is hierarchy: exactly one
 * `primary` filled button per major journey step (state-level after the first result, each multi-state
 * feature, and S-07), while a family panel carries the `quiet` variant — a real, same-size, same-target
 * control that simply does not shout. Removing the family-level action instead would have made a whole game
 * unpurchasable from its own panel, which is a worse answer than making it quieter.
 */
export default function StateBuyNowButton({
  stateName,
  gameLabel = null,
  variant = "primary",
}: {
  stateName: string;
  gameLabel?: string | null;
  variant?: "primary" | "compact" | "quiet";
}) {
  /* LRG-STATE-037 FV-08 retired the `hero` variant. The trailing State-level CTA it existed for is gone —
     commerce now sits in the action row under the first result — so the size step had no caller left. */
  /*
   * LRG-STATE-036 §7 — HOME'S BUTTON GRAMMAR, reused as a low-level primitive.
   *
   * Home's button grammar is `.lcp-btn` (9px/14px padding, `--radius-sm`, 14px/600). It is a CSS class, not a
   * Home component, so State uses it verbatim: identical padding, radius, weight and hover, with zero Home
   * regression risk. LRG-STATE-038 changed only which colour variant sits on top of it — see below.
   *
   * `.lcs-buynow` remains only to raise the touch target to 44px, which Home's cards do not need because their
   * action sits in a `<details>` trigger. That is the one State addition, and it is additive.
   */
  /*
   * LRG-STATE-038 FP-01 — THE COMMERCE TREATMENT.
   *
   * These were `.lcp-btn--accent` (solid blue) and `.lcp-btn--quiet` (outlined blue). Blue is the site's
   * link, navigation and neutral-utility colour, so a purchase read as just another action. Buy Now now
   * uses the shared `.lcp-btn--commerce` primitive — the same one the Home preview uses, so commerce looks
   * the same wherever a reader meets it (FP-02).
   *
   * `quiet` maps to `--commerce-quiet`: still commerce, still the full 44px target, lower emphasis. It is
   * hierarchy, never disablement.
   *
   * Nothing else moves. `.lcp-btn` supplies the same padding, radius, weight and size it always did.
   */
  const className =
    variant === "quiet"
      ? "lcp-btn lcp-btn--commerce-quiet lcs-buynow"
      : variant === "compact"
        ? "lcp-btn lcp-btn--commerce lcs-buynow lcs-buynow--compact"
        : "lcp-btn lcp-btn--commerce lcs-buynow";
  return (
    <button
      type="button"
      className={className}
      data-buynow-entry={gameLabel ?? "state"}
      data-buynow-variant={variant}
      onClick={() => {
        /*
         * LRG-STATE-037 FV-07/§6. The resolver used to be a dialog, so dispatching was enough — the sheet came
         * to the reader. Now that it lives inline in S-07, dispatching alone would expand a panel somewhere
         * off-screen and appear to do nothing. So every entry does all four things §6 requires: set the game
         * context, scroll to S-07, expand the resolver, and move focus to its heading.
         */
        window.dispatchEvent(
          new CustomEvent("lcs-buynow-open", { detail: { stateName, gameLabel } }),
        );
        document.getElementById("where-to-play")?.scrollIntoView({ block: "start", behavior: "smooth" });
        const heading = document.querySelector<HTMLElement>("[data-resolver-heading]");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          /* `preventScroll` so focus does not fight the smooth scroll that is already running. */
          heading.focus({ preventScroll: true });
        }
      }}
    >
      Buy Now
    </button>
  );
}
