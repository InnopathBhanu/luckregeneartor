/*
 * SUPERSEDED — KEEP AS REFERENCE (task LRG-STATE-030).
 *
 * This is the Prototype V0 composition of S-02. It is NO LONGER MOUNTED: `StatePreview.tsx` now renders
 * `sections/StateFamilySurface.tsx` instead. It is retained deliberately rather than deleted — CLAUDE.md §6
 * requires ARCHIVE, not deletion, outside an approved cleanup task, and this file records what V0 actually
 * did, which is the only honest reference for why V1 differs.
 *
 * V1 changed three things this file gets wrong against the LRG-STATE-030 brief:
 *   1. Member rows here are `leadCard` / `siblingCards` sorted by RECENCY. V1 renders the CONFIGURED order,
 *      so Midday never swaps places with Evening between visits.
 *   2. This file renders TWO Explain actions per card — twenty across ten families. V1 renders two in total.
 *   3. Siblings are progressively disclosed per card. V1 shows every member game's own date and numbers
 *      inline, because a member game is a game, not a detail of another game.
 *
 * ------------------------------------------------------------------------------------------------------
 *
 * S-02 — the results-first experience, built from grouped draw-event families.
 *
 * Authority: FD-X-03 (the first verified result leads on mobile, before any advertising), FD-X-05
 * (compact multi-state strip on mobile, featured pair on desktop, native games never erased), FD-X-06
 * (neutral deterministic ordering; frequent-draw variants grouped), FD-S-10 (format-driven rendering),
 * FD-S-14 (three-signal special balls), FD-S-21 (no advertisement inside the result grid).
 *
 * THE GROUPING THAT MAKES THIS WORK. Florida runs 19 draw events. Rendering 19 equal-weight cards is what
 * FD-X-06 forbids, and it is unusable on a phone. So the 19 collapse into 10 game identities: each family
 * leads with its most recent draw and discloses its siblings on request. Cash Pop is one card with five
 * draws inside it, not five cards; Pick 2/3/4/5 and Fantasy 5 are one card each with a midday and an
 * evening draw. Every event keeps an explicit draw-period label, so a result is never ambiguous about
 * which draw it belongs to.
 */

import { section } from "@/lib/state/sectionManifest";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";
import type { FamilyViewModel } from "@/lib/state/stateResultBuilder";
import { SectionShell, Attribution } from "./StateCommon";
import { ResultCardView } from "./StateResultSections";
import StateExplainAction from "../StateExplainAction";

/** A family card: the lead result, plus sibling draws disclosed without hiding their identity. */
function FamilyCard({
  family,
  featured = false,
}: {
  family: FamilyViewModel;
  featured?: boolean;
}) {
  const hasSiblings = family.siblingCards.length > 0;
  return (
    <article
      className={`lcs-family${featured ? " lcs-family--featured" : ""}`}
      data-family-key={family.familyKey}
      data-event-count={family.eventCount}
      data-game-class={family.gameClass}
      data-featured={featured ? "true" : "false"}
    >
      <ResultCardView {...family.leadCard} />

      {/* Jackpot movement is factual and published — never urgency (FD-X-07). */}
      {family.jackpotMovement?.changed ? (
        <p className="lcs-fine lcs-muted" data-jackpot-delta="true">
          Next advertised jackpot {family.jackpotMovement.next}
        </p>
      ) : null}

      <div className="lcs-family__actions">
        <StateExplainAction promptKey="explain-result" label="Explain this result" />
        <StateExplainAction promptKey="explain-game" label="Explain this game" />
      </div>

      {/* Sibling draws. `<details>` keeps them in the server HTML and crawlable — progressive disclosure,
          not client-side filtering (CLAUDE.md §11). Game name and period stay visible when open. */}
      {hasSiblings ? (
        <details className="lcs-family__more" data-sibling-count={family.siblingCards.length}>
          <summary>
            {family.eventCount === 2
              ? "Show the other draw"
              : `Show all ${family.eventCount} ${family.familyName} draws`}
          </summary>
          <div className="lcs-family__siblings">
            {family.siblingCards.map((c) => (
              <ResultCardView key={c.gameId} {...c} />
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

/** The mobile compact multi-state strip — FD-X-05: identity, status, jackpot, next draw, ONE action. */
function MultiStateStrip({ families }: { families: FamilyViewModel[] }) {
  if (families.length === 0) return null;
  return (
    <div className="lcs-msstrip" data-multistate-strip="true" data-count={families.length}>
      {families.map((f) => (
        <a
          key={f.familyKey}
          className="lcs-msstrip__item"
          href={`#family-${f.familyKey}`}
          data-family-key={f.familyKey}
        >
          <span className="lcs-msstrip__game">{f.familyName}</span>
          {f.leadCard.card.prizeDisplay ? (
            <span className="lcs-msstrip__jackpot">{f.leadCard.card.prizeDisplay}</span>
          ) : null}
          <span className="lcs-msstrip__next">
            {f.leadCard.card.nextDraw?.gameLocalDate
              ? `Next draw ${f.leadCard.card.nextDraw.gameLocalDate}`
              : f.drawDays}
          </span>
        </a>
      ))}
    </div>
  );
}

const GROUP_HEADINGS: { group: FamilyViewModel["group"]; heading: string }[] = [
  { group: "stateOnly", heading: "Florida jackpot games" },
  { group: "dailyVariants", heading: "Florida daily games" },
  { group: "specialized", heading: "Frequent draws" },
];

export function SectionS02Families({ model }: { model: StatePreviewModel }) {
  const entry = section("S-02");
  const st = model.sectionState["S-02"];
  const primary = model.primary;

  if (!st.render || !primary) {
    return (
      <SectionShell entry={entry} heading={`Latest ${model.stateName} lottery results`} headingId="latest-results">
        <p className="lcs-lede">No Florida result passed format verification.</p>
      </SectionShell>
    );
  }

  const multi = model.multiState;
  /* The primary result may itself be a multi-state or native family; either way it renders once here and
     is not repeated below. */
  const rest = model.families.filter((f) => f.familyKey !== primary.familyKey);
  const restMulti = rest.filter((f) => f.group === "multiState");

  return (
    <SectionShell
      entry={entry}
      heading={`Latest ${model.stateName} lottery results`}
      headingId="latest-results"
    >
      <p className="lcs-lede">
        {model.drawEventCount} Florida draw events
        across {model.families.length} games, from the {model.manifest.resultSource.value}.
      </p>

      {/* BAND 2 — the first verified result. Nothing, including advertising, precedes it below 992 px. */}
      <div className="lcs-primary" data-primary-result="true" id={`family-${primary.familyKey}`}>
        <FamilyCard family={primary} featured />
      </div>

      {/* BAND 3 — compact multi-state strip on mobile only; the featured pair below serves desktop. */}
      <div className="lcs-mobileonly">
        <MultiStateStrip families={multi.filter((f) => f.familyKey !== primary.familyKey)} />
      </div>

      {/* Desktop featured pair. No empty paired-card position when only one game is offered (FD-X-05). */}
      {restMulti.length > 0 ? (
        <div className="lcs-featured" data-featured-group="multiState" data-count={restMulti.length}>
          <h3 className="lcs-h3">Multi-state games in {model.stateName}</h3>
          <div className={`lcs-featured__grid lcs-featured__grid--${Math.min(restMulti.length, 2)}`}>
            {restMulti.map((f) => (
              <div key={f.familyKey} id={`family-${f.familyKey}`}>
                <FamilyCard family={f} featured />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Florida-native games, immediately after the multi-state treatment (FD-X-05 adjacency). */}
      {GROUP_HEADINGS.map(({ group, heading }) => {
        const inGroup = rest.filter((f) => f.group === group);
        if (inGroup.length === 0) return null;
        return (
          <div key={group} className="lcs-gamegroup" data-result-group={group} data-count={inGroup.length}>
            <h3 className="lcs-h3">{heading}</h3>
            <div className="lcs-familygrid">
              {inGroup.map((f) => (
                <div key={f.familyKey} id={`family-${f.familyKey}`}>
                  <FamilyCard family={f} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="lcs-lede lcs-fine">
        Results are published shortly after each official drawing. Always confirm a winning ticket with{" "}
        {model.facts.operatorName.value ?? "the official operator"}.
      </p>
    </SectionShell>
  );
}
