/*
 * THE MULTI-STATE BLOCK — LRG-STATE-032 §6.
 *
 * WHAT WAS REJECTED. Powerball and Mega Millions rendered as two separately bordered cards floating beside
 * each other, with a small heading underneath them. The founder read them as "unrelated card fragments", and
 * that is exactly what two independent borders communicate.
 *
 * WHAT THIS IS. ONE outer block with ONE border and ONE heading, containing two columns that share it. The
 * games are divided by a rule, never by borders of their own — so they read as two parts of one thing, which
 * is what they are: the two multi-state games Florida sells.
 *
 * Mobile stacks the pair inside the same single block. Desktop shows them as two related columns.
 *
 * BALANCE. This block deliberately does NOT use the family-panel component. A multi-state game must not
 * out-weigh the Florida-native families, and on mobile it renders after the first native result (`FD-N-02`).
 * Jackpot size never promotes it.
 */

import type { ReactNode } from "react";
import type { ResolvedFamily } from "@/lib/state/gameFamilyPresentation";
import { resolveGameIdentity } from "@/lib/state/stateGameIdentity";
import StateBuyNowButton from "../StateBuyNowButton";
import StateShareResult from "../StateShareResult";
import { StateBallGroup, StateMultiplierPill, StatePrize } from "./StateResultGrammar";

function Mark({ family }: { family: ResolvedFamily }) {
  const identity = resolveGameIdentity(family.visualIdentity);
  if (identity.kind === "verifiedAsset" && identity.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="lcs-ms__logo"
        src={identity.logo.src}
        width={identity.logo.width}
        height={identity.logo.height}
        alt=""
        data-identity="verified-asset"
      />
    );
  }
  return (
    <span className="lcs-ms__mark" aria-hidden="true" data-identity="temporary-neutral-mark">
      <svg viewBox="0 0 24 24" width="24" height="24" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.4" fill="currentColor" />
      </svg>
    </span>
  );
}

/** One game inside the shared block. No border of its own — the block owns the boundary. */
function MultiStateGame({
  family,
  stateName,
  leadGame,
  discuss,
}: {
  family: ResolvedFamily;
  stateName: string;
  /** The block's lead game carries the filled commerce action; the rest are quiet (LRG-STATE-038 §4). */
  leadGame: boolean;
  /**
   * The game's discussion entry, injected by the surface exactly as the family panel receives it. Built
   * outside this component because assembling discussion context is not this component's business — that is
   * what keeps the block purely presentational.
   */
  discuss: ReactNode;
}) {
  const lead = family.members[0];
  return (
    <div className="lcs-ms__game" data-family-id={family.familyId} id={`family-${family.familyId}`}>
      <h4 className="lcs-ms__title">
        <Mark family={family} />
        <span>{family.familyLabel}</span>
      </h4>

      {family.prizeSummary ? (
        <StatePrize
          label={family.prizeSummary.label}
          value={family.prizeSummary.value}
          cashValue={family.prizeSummary.cashValue}
          emphasis="featured"
        />
      ) : null}

      {lead?.result ? (
        <div className="lcs-ms__result">
          <time className="lcs-ms__date" dateTime={lead.result.drawDateIso}>
            {lead.result.drawDateDisplay}
          </time>
          <span className="lcs-ms__nums">
            {lead.result.groups.map((g, i) => (
              <StateBallGroup key={i} group={g} gameName={family.familyLabel} />
            ))}
            {/* The multiplier belongs with the result it applies to (§6). Power Play is selected and paid for;
                the Mega Millions multiplier is built in — the pill says which. */}
            {lead.result.multiplier ? <StateMultiplierPill multiplier={lead.result.multiplier} /> : null}
          </span>
        </div>
      ) : (
        <p className="lcs-fp__pending">No result published yet</p>
      )}

      {/* A secondary drawing stays inside its own game identity — Powerball Double Play. */}
      {family.secondary ? (
        <div className="lcs-ms__secondary" data-secondary-draw={family.secondary.label}>
          <h5 className="lcs-fp__secondaryhead">{family.secondary.label}</h5>
          <span className="lcs-ms__nums">
            {family.secondary.groups.map((g, i) => (
              <StateBallGroup key={i} group={g} gameName={family.familyLabel} />
            ))}
          </span>
        </div>
      ) : null}

      {/* Next draw, from the member game's own published schedule — never a computed date. */}
      {lead?.drawTimeLocal ? (
        <p className="lcs-ms__next">
          Next draw {lead.drawDays ? `${lead.drawDays} · ` : ""}{lead.drawTimeLocal}
        </p>
      ) : null}

      <div className="lcs-ms__actions">
        {/*
          ONE Buy Now per multi-state game (§8), and LRG-STATE-038 §4 gives them a HIERARCHY.

          Measured cause: at 390px the two buttons sit 233px apart, so both are on screen at once. Two
          identical filled crimson controls in one viewport is precisely the "several equally dominant red
          buttons" §4 rules out — with two equals, neither is the dominant action.

          The lead game takes the filled treatment and the rest take the outlined commerce variant. That is
          the same selective rule this block already applies to its single AI action (`showAi={i === 0}`),
          so the block has one visual hierarchy rather than two competing ones. Quiet is lower emphasis, not
          disablement: same 44px target, same behaviour, same shared resolver.
        */}
        <StateBuyNowButton
          stateName={stateName}
          gameLabel={family.familyLabel}
          variant={leadGame ? "primary" : "quiet"}
        />
        {family.historyHref ? (
          <a
            className="lcs-fp__link"
            href={family.historyHref}
            /* LRG-STATE-040: an internal anchor, so no external rel and no new tab. */
          >
            History
          </a>
        ) : null}
        {/*
          LRG-STATE-039 §4 sets this block's action list to History · Discuss · Share · Buy Now — Ask AI is
          deliberately NOT here. The main State AI module remains the primary AI experience, and a Powerball
          reader who wants an explanation has the prominent `Ask AI` in the action row directly below.
        */}
        <StateShareResult
          stateName={stateName}
          gameLabel={family.familyLabel}
          fragment={`family-${family.familyId}`}
          resultDateDisplay={lead?.result?.drawDateDisplay ?? null}
          resultStatus={lead?.currentStatus?.status ?? null}
        />
        {discuss}
      </div>
    </div>
  );
}

export default function StateMultiStateBlock({
  families,
  stateName,
  discussFor,
}: {
  families: ResolvedFamily[];
  stateName: string;
  /** Builds the discussion entry for one game. Supplied by S-02, which owns the context assembly. */
  discussFor?: (family: ResolvedFamily) => ReactNode;
}) {
  if (families.length === 0) return null;
  return (
    <section
      className="lcs-ms"
      aria-labelledby="multistate-heading"
      data-multistate-block="true"
      data-count={families.length}
    >
      <h3 className="lcs-ms__head" id="multistate-heading">
        Multi-state games in {stateName}
      </h3>
      <div className={`lcs-ms__grid lcs-ms__grid--${Math.min(families.length, 2)}`}>
        {families.map((f, i) => (
          <MultiStateGame
            key={f.familyId}
            family={f}
            stateName={stateName}
            /* Selective, not per card: the first game in the block carries its one filled commerce action
               (LRG-STATE-038 §4). The block no longer carries an AI action at all (LRG-STATE-039 §4). */
            leadGame={i === 0}
            discuss={discussFor ? discussFor(f) : null}
          />
        ))}
      </div>
    </section>
  );
}
