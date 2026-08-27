/*
 * PreviewPlayOptions — conditional ticket action plus a LOCAL explanatory panel.
 *
 * Authority: Constitution §22 (commerce is state-aware and safety-sensitive; an affiliate is never
 * presented as an official lottery); Global Shell §6.5 (state-context precedence); CLAUDE.md §13;
 * LRG-UI-011 §10 (action hierarchy and tonal treatment) and §11 (panel warmth).
 *
 * WHAT IT DOES
 *  - renders a ticket action ONLY for a game that has one, with the label chosen by eligibility:
 *    "Play Online" where a method is resolved, "See Play Options" where eligibility is unresolved;
 *  - opens a LOCAL, in-page panel that explains the routes to a ticket rather than selling one;
 *  - keeps "Availability varies by state" beside the action, and the disclosure inside the panel.
 *
 * WHAT IT NEVER DOES
 *  - no raw affiliate URL, no named provider, no ranking, no "best" claim, no resolved destination;
 *  - no /play, /play/{game} or /buynow route is created or linked;
 *  - no state is preselected from IP — the panel ASKS;
 *  - no external navigation of any kind.
 *
 * IMPLEMENTATION NOTE (changed in LRG-UI-013 §3/§4): the panel was a native <details> inside the
 * featured card. Expanding it grew the CSS grid row, which stretched the sibling flagship card and
 * left a large empty region in the shorter one. It now opens in PreviewOverlay — a portalled dialog
 * outside the featured grid — so it is closed by default and cannot affect either card's height.
 * The content itself is still rendered on the server and passed in as children.
 *
 * SUPPRESSION: this must not render inside a claim journey, a correction notice, a responsible-play
 * surface or an AI answer block. On Home it appears only beside jackpot and game orientation.
 */

import { playOptionsFor, type PlayOptionSet } from "@/lib/preview/playOptionPreview";
import PreviewOverlay from "./PreviewOverlay";

/**
 * The play-options body, rendered on the SERVER and handed to PreviewOverlay as children.
 *
 * §4: closed by default. It used to be a <details> inside the featured card, which grew the grid row
 * and stretched the sibling card; it now opens in a portalled dialog outside the grid.
 */
function PlayOptionsContent({ set }: { set: PlayOptionSet }) {
  return (
    <div className="lcp-play__panel">
      <p className="lcp-play__game">
        <span className="lcp-play__game-label">Selected game</span>
        <strong>{set.gameName}</strong>
      </p>

      {/* State confirmation — the interface asks, it never guesses from IP. */}
      <div className="lcp-play__step">
        <p className="lcp-play__step-title">{set.panel.stateConfirmationPrompt}</p>
        <p className="lcp-play__note">{set.panel.stateConfirmationNote}</p>
        {/* Presentational selector for design validation. It selects nothing, resolves no
            eligibility and reaches no provider. */}
        <label className="sr-only" htmlFor={`play-state-${set.gameSlug}`}>
          Your state
        </label>
        <select
          id={`play-state-${set.gameSlug}`}
          className="lcp-play__select lcp-target"
          defaultValue=""
        >
          <option value="">Choose your state</option>
          {["Arizona", "California", "Florida", "Michigan", "New York", "Virginia"].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Method TYPES, explained. Never providers, never a ranking. */}
      <div className="lcp-play__step">
        <p className="lcp-play__step-title">Ways to get a ticket</p>
        <ul className="lcp-play__methods">
          {set.panel.methods.map((m) => (
            <li key={m.method} data-method={m.method}>
              <span className="lcp-play__method-label">{m.label}</span>
              <span className="lcp-play__note">{m.body}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Material relationship disclosure. */}
      <p className="lcp-play__disclosure">{set.panel.disclosure}</p>
      <p className="lcp-play__note">{set.panel.responsiblePlayNote}</p>
      <p className="lcp-play__note">
        LotteryCorner is an independent publisher. We are not a lottery operator and we do not sell
        tickets.
      </p>
    </div>
  );
}

export default function PreviewPlayOptions({
  gameSlug,
  gameName,
}: {
  gameSlug: string | undefined;
  gameName: string;
}) {
  const set = playOptionsFor(gameSlug, gameName);
  if (!set) return null;

  return (
    <div className="lcp-play" data-play-action={set.action}>
      {/*
       * §4 label hierarchy, unchanged: "Play Online" where a method is resolved, "See Play Options"
       * where eligibility is unresolved. Commerce mode — never the analysis mode (§5).
       */}
      <PreviewOverlay
        mode="commerce"
        title={`${set.gameName} — ticket options`}
        subtitle={set.availabilityNote}
        triggerLabel={set.actionLabel}
        /* LRG-STATE-038 FP-02 — the approved narrow Home exception. This is a one-token swap of the
           trigger's colour variant onto the shared commerce primitive, mapping each existing emphasis
           level to its commerce counterpart: `tonal` -> `commerce`, `tonal-quiet` -> `commerce-quiet`.
           Same label, same destination, same eligibility behaviour, same position, same geometry — the
           commerce variants inherit `.lcp-btn` unchanged, so only the hue moves. */
        triggerVariant={set.action === "play-online" ? "commerce" : "commerce-quiet"}
      >
        <PlayOptionsContent set={set} />
      </PreviewOverlay>
      {/* Availability sits beside the action, visible before the overlay is opened. */}
      <p className="lcp-play__availability">{set.availabilityNote}</p>
    </div>
  );
}
