"use client";

/*
 * THE BUY NOW RESOLVER, INLINE IN S-07 — LRG-STATE-037 FV-07.
 *
 * WHAT THIS REPLACES. `StateBuyNowResolver.tsx` was a `role="dialog"` sheet with `aria-modal`, a focus trap, a
 * backdrop and a close button. Founder review rejected modal interaction for ordinary actions, and commerce is
 * the most ordinary of them: a reader asking "where can I play this" should not be interrupted by an overlay.
 *
 * WHAT IT IS NOW. One shared resolver that lives inside S-07 and expands in place. Every Buy Now on the page —
 * the action row, the featured family, each multi-state game — scrolls the reader here and expands it with that
 * game's context. There is still exactly ONE resolver instance; it simply is not a dialog.
 *
 * WHAT SURVIVES UNCHANGED. It runs the real deterministic `resolveBuyNow` against the real governed capability
 * record and shows its actual outcome. It performs no transaction, contacts no partner and exposes no
 * destination URL. Florida has zero verified options, so the honest outcome is the reader-facing sentence FV-07
 * specifies — never `underReview`, never `retailOnly`, never a decision id, never a raw partner URL, and never
 * an implication that LotteryCorner sells the ticket.
 *
 * `/play/{game}` versus `/buynow/{code}` is untouched. No route is referenced here.
 */

import { useEffect, useRef, useState } from "react";
import { resolveBuyNow, isCompensated } from "@/lib/state/buyNowCapability";
import type { StateCommerceResolution } from "@/lib/state/stateCommerceRegistry";

/**
 * Plain-language purchase status. The internal enum never reaches the reader (CLAUDE.md §7).
 *
 * LRG-STATE-048 REMOVED the `unknown` entry. It read "Not known yet", which the founder ruling names
 * explicitly as prohibited public copy — and the row it sat in was labelled "Purchase status", so the page
 * was reporting a system state as though it were a fact about the State. Where nothing has been researched
 * the row is now SUPPRESSED and the outcome sentence carries the meaning instead.
 */
const STATUS_LABEL: Record<string, string> = {
  underReview: "Still being verified",
  onlineAvailable: "Available online",
  retailOnly: "In stores only",
  courierOnly: "Through an approved courier",
  unavailable: "Not available",
};

export default function StateBuyNowInline({
  stateName,
  officialWhereToPlayUrl,
  operatorName,
  todayIso,
  initialGameLabel = null,
  commerce,
}: {
  stateName: string;
  officialWhereToPlayUrl: string | null;
  operatorName: string;
  todayIso: string;
  /**
   * The game this surface opens for, when the PAGE already knows it — LRG-GAME-049.
   *
   * On a State page the reader picks a game by pressing Buy Now on a family, so the label arrives with the
   * open event and this stays `null`. On a Game Page the game is the page, and defaulting to
   * "All {State} games" would have been wrong on a surface that is entirely about one game.
   *
   * Optional and null-defaulted, so the State page passes nothing and its output is unchanged.
   */
  initialGameLabel?: string | null;
  /**
   * LRG-STATE-047. This component used to import Florida's capability record directly, which made the one
   * shared commerce surface a Florida surface. It now takes the RESOLVED commerce state for whichever
   * jurisdiction is rendering.
   */
  commerce: StateCommerceResolution;
}) {
  /** The game the reader asked about. `null` means the state-level question. */
  const [gameLabel, setGameLabel] = useState<string | null>(initialGameLabel);
  const [expanded, setExpanded] = useState(false);
  const headingRef = useRef<HTMLParagraphElement>(null);

  /* Every Buy Now entry dispatches this. One surface, many entries — no dialog. */
  useEffect(() => {
    const onOpen = (ev: Event) => {
      const d = (ev as CustomEvent<{ stateName?: string; gameLabel?: string | null }>).detail;
      setGameLabel(d?.gameLabel ?? null);
      setExpanded(true);
    };
    window.addEventListener("lcs-buynow-open", onOpen);
    return () => window.removeEventListener("lcs-buynow-open", onOpen);
  }, []);

  /*
   * COM-02/COM-03. The governed resolver runs only where a researched capability record EXISTS. A State
   * whose purchase paths have never been researched has no record to resolve, and `CapabilityStatus` has no
   * member meaning "never checked" — so it is handled here as an explicit unknown rather than by feeding the
   * resolver a fabricated record. Absence of evidence never becomes `retailOnly` on either path.
   */
  const outcome = commerce.kind === "researched"
    ? resolveBuyNow({
        capability: commerce.capability,
        options: commerce.options,
        jurisdictionConfirmed: true,
        ageConfirmed: true,
        physicalLocationConfirmed: true,
        safetyContexts: [],
        todayIso,
      })
    : null;

  const options = outcome?.options ?? [];
  const official = options.filter((o) => !isCompensated(o.optionType));
  const partner = options.filter((o) => isCompensated(o.optionType));
  /*
   * A researched capability has a reader-facing label. An unresearched one has NO status row at all — see
   * `STATUS_LABEL`. `null` is what suppresses it.
   *
   * The governed status STRING stays on `data-status` for audit. It is not reader copy, it is not rendered,
   * and removing it would change Florida's DOM for no reader benefit — the cleanup this task authorises is
   * of what a reader sees. TECHNICAL REVIEW MODE explicitly permits a non-visual diagnostic attribute.
   */
  const statusLabel = commerce.kind === "researched"
    ? STATUS_LABEL[commerce.capability.status] ?? null
    : null;
  const statusAudit = commerce.kind === "researched" ? commerce.capability.status : "unresearched";

  return (
    <div
      className="lcs-buy"
      data-buynow-resolver="inline"
      data-resolver-outcome={outcome?.kind ?? "unknownJurisdiction"}
      data-resolver-expanded={expanded ? "true" : "false"}
    >
      {/* The disclaimer leads, always — before any option and regardless of expansion state. Buy Now is an
          entry point, never a claim. */}
      <p className="lcs-buy__lead" data-buynow-disclaimer="true" ref={headingRef} data-resolver-heading="true">
        <strong>LotteryCorner does not sell tickets directly.</strong> We show you where you can play and who is
        offering it.
      </p>

      <dl className="lcs-buy__ctx" data-buynow-context="true">
        <dt>State</dt><dd>{stateName}</dd>
        <dt>Game</dt><dd>{gameLabel ?? `All ${stateName} games`}</dd>
        {statusLabel ? (
          <>
            <dt>Purchase status</dt>
            <dd><span data-status={statusAudit}>{statusLabel}</span></dd>
          </>
        ) : null}
      </dl>

      {/* FV-07's reader-facing message: what we are doing, and where they can go now. For a State with no
          researched evidence the message says exactly that, and names no provider (FD-X-11). */}
      <p className="lcs-buy__outcome" data-resolver-message="true">
        {commerce.kind === "researched" ? (
          <>
            LotteryCorner is still verifying available purchase options for
            {gameLabel ? ` ${gameLabel}` : ` ${stateName} games`}. You can continue to official{" "}
            {operatorName} retailer information.
          </>
        ) : (
          <>
            {/* LRG-STATE-048: the reader-facing wording the founder ruling asks for. It says what to do
                next and states plainly that nothing is listed — without naming a provider, asserting a
                channel, or reporting a system state. */}
            Choose Buy Now to see the purchase options currently available for
            {gameLabel ? ` ${gameLabel}` : ` ${stateName} games`}. No purchase option is currently listed.
          </>
        )}
      </p>

      {officialWhereToPlayUrl ? (
        <p className="lcs-buy__official">
          <a
            className="lcp-btn lcp-btn--quiet lcs-buynow"
            href={officialWhereToPlayUrl}
            rel="noopener noreferrer external"
            target="_blank"
            data-supporting-destination="official"
          >
            {operatorName} — find a retailer
          </a>
        </p>
      ) : null}

      {/*
        LRG-STATE-048 PUBLIC-COPY CLEANUP.
        Two empty groups previously printed "No official online purchase option has been verified for
        {State} yet." and "No approved partner option has been verified for {State} yet." — the second is
        named in the founder ruling's cleanup list, and together they said the same absence twice in
        verification vocabulary. When there is nothing to list, the reader now gets ONE plain sentence.

        The governed ordering — official before compensated — has not moved; it is enforced by the resolver
        and asserted in the tests, which is where a reviewer concern belongs rather than on the page. The
        disclosure slot survives unconditionally, because it is a promise about paid options and must be
        visible before any option ever appears.
      */}
      <div className="lcs-buy__groups">
        {official.length === 0 && partner.length === 0 ? (
          <p className="lcs-fine lcs-muted" data-option-groups="empty">
            No purchase option is currently listed.
          </p>
        ) : (
          <>
            {official.length > 0 ? (
              <section data-option-group="official">
                <h3 className="lcs-h4">Official options</h3>
              </section>
            ) : null}
            {partner.length > 0 ? (
              <section data-option-group="partner">
                <h3 className="lcs-h4">Approved partner options</h3>
              </section>
            ) : null}
          </>
        )}
        <p className="lcs-fine lcs-muted" data-disclosure-slot="true">
          Any option we are paid for will say so here, next to the action, before you use it.
        </p>
      </div>

      <p className="lcs-fine lcs-muted">
        Nothing is bought or reserved on this page, and this preview contacts no provider.
      </p>
    </div>
  );
}
