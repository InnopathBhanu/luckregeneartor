/*
 * THE GAME-FAMILY PANEL — LRG-STATE-032 §1–§4.
 *
 * A HARD REPLACEMENT of the V2 family card, not a restyle of it. The task requires that, and the close
 * screenshot showed why: the previous panel had a GREY header band over a WHITE row body. That single
 * background change is what made every family read as "a grey label bar plus a separate white card", and at
 * the compression of a full-page screenshot it read as mini cards. No amount of border tuning fixes a panel
 * whose header and body are different surfaces.
 *
 * WHAT THIS COMPONENT GUARANTEES VISUALLY
 *
 *   - ONE continuous surface. The header, the rows and the footer all sit on the same background. The only
 *     internal marks are 1px rules. There is exactly one outer border, and it is on the panel.
 *   - Member rows have NO background of their own, NO border, NO radius and NO shadow. A row cannot look
 *     like a card because it has none of the properties that make something look like a card.
 *   - ONE family title, ONE identity mark, ONE History, ONE Buy Now, at most ONE contextual AI action.
 *   - Rows span the full panel width, with the add-on/status column at the far right, so the panel visibly
 *     uses the primary content width instead of huddling at the left.
 *
 * SEMANTICS. A multi-member family is a real `role="table"` with a `rowheader` per member, so a screen
 * reader associates each date and result with the correct member game. A single-member family is not a table.
 *
 * GENERIC BY CONSTRUCTION. Pick 3 was built and accepted first; every other family renders through this same
 * component from configuration. Nothing here names a jurisdiction or a game, and there is no per-family JSX.
 */

import type { ReactNode } from "react";
import type { ResolvedFamily, ResolvedMember, MemberBallGroup } from "@/lib/state/gameFamilyPresentation";
import { resolveGameIdentity } from "@/lib/state/stateGameIdentity";
import { StateBallGroup, StateMultiplierPill, StatePrize } from "./StateResultGrammar";
import StateExplainAction from "../StateExplainAction";
import StateShareResult from "../StateShareResult";
import StateBuyNowButton from "../StateBuyNowButton";

/**
 * The family identity mark.
 *
 * A verified brand asset renders as itself. Everything else renders ONE consistent neutral mark — the same
 * glyph for every family, so it can never be mistaken for branding. Decorative in both cases: the visible
 * family title beside it is the accessible name.
 */
function IdentityMark({ family }: { family: ResolvedFamily }) {
  const identity = resolveGameIdentity(family.visualIdentity);

  if (identity.kind === "verifiedAsset" && identity.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="lcs-fp__logo"
        src={identity.logo.src}
        width={identity.logo.width}
        height={identity.logo.height}
        alt=""
        data-identity="verified-asset"
        data-identity-token={family.visualIdentity}
      />
    );
  }
  return (
    <span className="lcs-fp__mark" aria-hidden="true" data-identity="temporary-neutral-mark">
      <svg viewBox="0 0 24 24" width="26" height="26" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.4" fill="currentColor" />
      </svg>
    </span>
  );
}

/**
 * One member game row.
 *
 * Everything in it belongs to the member game itself — its own id, variant label, draw date, numbers,
 * schedule and status. Nothing is inherited from a sibling, and a member with no verified result says so
 * rather than borrowing one.
 */
function MemberRow({
  member,
  showVariant,
  tabular,
  gameName,
}: {
  member: ResolvedMember;
  showVariant: boolean;
  tabular: boolean;
  /** Named in every ball's accessible label, as Home does. */
  gameName: string;
}) {
  const rowRole = tabular ? { role: "row" as const } : {};
  const cellRole = tabular ? { role: "cell" as const } : {};

  return (
    <div
      className="lcs-fp__row"
      data-member-game-id={member.gameId}
      data-display-order={member.displayOrder}
      {...rowRole}
    >
      {showVariant ? (
        <span
          className="lcs-fp__variant"
          data-variant-label={member.variantLabel}
          {...(tabular ? { role: "rowheader" as const } : {})}
        >
          {member.variantLabel}
        </span>
      ) : null}

      {/* The member's OWN date, with its own published schedule beneath. Dates legitimately differ between
          rows — before the evening draw, midday shows today and evening shows yesterday. The schedule is the
          VERIFIED published time, never a computed next-draw date. */}
      <span className="lcs-fp__when" {...cellRole}>
        {member.result ? (
          <time className="lcs-fp__date" dateTime={member.result.drawDateIso}>
            {member.result.drawDateDisplay}
          </time>
        ) : (
          <span className="lcs-fp__date lcs-fp__date--none">Not published</span>
        )}
        {member.drawTimeLocal ? (
          <span className="lcs-fp__sched">
            {member.drawDays ? `${member.drawDays} · ` : ""}
            {member.drawTimeLocal}
          </span>
        ) : null}
      </span>

      {/* The numbers. The loudest thing in the row, and in the page. */}
      <span className="lcs-fp__nums" {...cellRole}>
        {member.result ? (
          member.result.groups
            .filter((g) => g.visualRole !== "addOn")
            .map((g, i) => <StateBallGroup key={i} group={g} gameName={gameName} />)
        ) : (
          <span className="lcs-fp__pending">No result published yet</span>
        )}
      </span>

      {/* Add-on and status share the trailing column, at the right edge of the panel. Both are secondary to
          the result and neither may displace it — an open status renders ALONGSIDE the last verified result. */}
      <span className="lcs-fp__extra" {...cellRole}>
        {member.result
          ? member.result.groups
              .filter((g) => g.visualRole === "addOn")
              .map((g, i) => <StateBallGroup key={i} group={g} gameName={gameName} />)
          : null}
        {/* LRG-STATE-036 §6: the multiplier, as full text in Home's outlined pill. Previously dropped. */}
        {member.result?.multiplier ? (
          <StateMultiplierPill multiplier={member.result.multiplier} />
        ) : null}
        {member.currentStatus ? (
          <span className="lcs-fp__status" data-open-status={member.currentStatus.status}>
            {member.currentStatus.detail}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/**
 * A family panel.
 *
 * `featured` raises the leading family with a heavier border only — the same component, never a different
 * shape, so no family is rendered as a lesser class of thing.
 *
 * `showAi` is granted by the surface, not claimed by the family, which is what keeps AI selective.
 */
export default function StateFamilyPanel({
  family,
  stateName,
  featured = false,
  showAi = false,
  discuss = null,
  commerce = false,
}: {
  family: ResolvedFamily;
  stateName: string;
  featured?: boolean;
  showAi?: boolean;
  /**
   * The contextual discussion entry (LRG-STATE-034 §5), injected by the surface rather than built here.
   *
   * Injected because the panel must not know how discussion context is assembled — that keeps the panel
   * purely presentational and keeps "one shared discussion surface" a property of the page, not of the card.
   */
  discuss?: ReactNode;
  /**
   * Whether this panel carries its own Buy Now (LRG-STATE-034 §10).
   *
   * Default FALSE. Commerce is granted by the surface to the panels where it is useful, rather than claimed by
   * every panel — which is what produced eleven Buy Now buttons on one page.
   */
  commerce?: boolean;
}) {
  const multiMember = family.memberCount > 1;
  const tabular = multiMember;

  return (
    <article
      className={`lcs-fp${featured ? " lcs-fp--featured" : ""}`}
      data-family-panel={family.familyId}
      data-family-id={family.familyId}
      data-member-count={family.memberCount}
      data-group={family.group}
      id={`family-${family.familyId}`}
    >
      {/* HEADER — same surface as the rows. Separated by a rule, never by a background change. */}
      <header className="lcs-fp__head">
        <h3 className="lcs-fp__title">
          <IdentityMark family={family} />
          <span className="lcs-fp__name">{family.familyLabel}</span>
        </h3>

        {family.prizeSummary ? (
          /* Home's amount typography with State's labelled prize semantics (§2) — see StateResultGrammar. */
          <StatePrize
            label={family.prizeSummary.label}
            value={family.prizeSummary.value}
            cashValue={family.prizeSummary.cashValue}
            emphasis={featured ? "featured" : "row"}
          />
        ) : null}

        {/* LRG-STATE-034 §10 — "reduce repetition". A Buy Now on all eight native panels put eleven of them
            on the page. Commerce now appears where it is USEFUL: the engagement bar, the featured family, each
            multi-state game, and the S-07 resolver. A secondary family panel routes through the bar instead. */}
        {family.buyNowEligible && commerce ? (
          <span className="lcs-fp__cta">
            <StateBuyNowButton stateName={stateName} gameLabel={family.familyLabel} />
          </span>
        ) : null}
      </header>

      <div
        className="lcs-fp__rows"
        {...(tabular ? { role: "table", "aria-label": `${family.familyLabel} draws` } : {})}
      >
        {/* Column headers exist for assistive technology only. The visual alignment communicates the columns
            to a sighted reader, and a visible header row repeated on every panel would be noise. */}
        {tabular ? (
          <div className="lcs-fp__row lcs-fp__row--head" role="row">
            <span className="lcs-vh" role="columnheader">Draw</span>
            <span className="lcs-vh" role="columnheader">Date and schedule</span>
            <span className="lcs-vh" role="columnheader">Winning numbers</span>
            <span className="lcs-vh" role="columnheader">Add-on and status</span>
          </div>
        ) : null}

        {family.members.map((m) => (
          <MemberRow
            key={m.gameId}
            member={m}
            showVariant={multiMember}
            tabular={tabular}
            gameName={family.familyLabel}
          />
        ))}
      </div>

      {/* A secondary drawing belongs to the FAMILY's result, not to a member row — the Double Play case:
          one game identity, two drawings. */}
      {family.secondary ? (
        <div className="lcs-fp__secondary" data-secondary-draw={family.secondary.label}>
          {/* Home gives a secondary drawing its OWN named heading, because it is a separate drawing rather
              than an annotation on the first one. State follows that, subordinate to the main rows (§6). */}
          <h4 className="lcs-fp__secondaryhead">{family.secondary.label}</h4>
          <span className="lcs-fp__secondarynums">
            {family.secondary.groups.map((g, i) => (
              <StateBallGroup key={i} group={g} gameName={family.familyLabel} />
            ))}
          </span>
        </div>
      ) : null}

      {/*
        FOOTER — the LRG-STATE-039 §4 action set for a native game family:
        History · Ask AI · Discuss · Share, with Buy Now kept separate as the primary commerce action.

        All four are quiet links or link-weight controls, so the crimson Buy Now in the header stays the only
        emphasised action on the card. None of them opens a dialog, and none is repeated on a member row —
        `MemberRow` renders numbers and status only, which is what keeps a five-draw family from carrying
        twenty controls. `What changed` is deliberately absent: §4 keeps it a State-level action.
      */}
      <footer className="lcs-fp__foot">
        {family.historyHref ? (
          <a
            className="lcs-fp__link"
            href={family.historyHref}
            /* LRG-STATE-040: an internal anchor, so no external rel and no new tab. */
          >
            History
          </a>
        ) : null}
        {showAi && family.aiContextKey ? (
          <StateExplainAction promptKey="explain-result" label="Ask AI" familyId={family.familyId} />
        ) : null}
        {discuss}
        <StateShareResult
          stateName={stateName}
          gameLabel={family.familyLabel}
          /* The panel's own existing anchor — see the `id` on the `<article>` above. */
          fragment={`family-${family.familyId}`}
          resultDateDisplay={family.members[0]?.result?.drawDateDisplay ?? null}
          resultStatus={family.members[0]?.currentStatus?.status ?? null}
        />
      </footer>
    </article>
  );
}
