/*
 * A COMPACT family summary — LRG-STATE-034 §1E.
 *
 * The task distinguishes two things the rejected implementation treated as one: the first Florida-native family
 * is a full presentation, and the additional ones are "additional family summaries". Rendering all of them as
 * full panels is what pushed the AI module to 4.4 mobile screens — measured, not guessed — against a §16
 * requirement of three.
 *
 * So this is the "compact contextual bridge" tier of the experience rule: enough to recognise the game and read
 * its latest numbers, and a route to the full panel. It is NOT a card grid and NOT a shrunken panel — it has no
 * border of its own, because a row of bordered mini cards is the exact pattern already rejected twice.
 *
 * The domain model is untouched here as everywhere: the summary shows the family's own newest verified member
 * result with that member's own date, and never merges or re-sorts anything.
 */

import type { ResolvedFamily } from "@/lib/state/gameFamilyPresentation";
import { StateBallGroup } from "./StateResultGrammar";

export default function StateFamilySummary({ family }: { family: ResolvedFamily }) {
  /* The member whose result is newest — chosen by the resolver's own aggregate, never by re-sorting rows. */
  const lead = family.members.find((m) => m.result?.drawDateIso === family.newestVerifiedDateIso)
    ?? family.members.find((m) => m.result)
    ?? family.members[0];
  const main = lead?.result?.groups.find((g) => g.visualRole === "main");
  const addOn = lead?.result?.groups.find((g) => g.visualRole === "addOn");

  return (
    <li className="lcs-sum" data-family-summary={family.familyId} data-member-count={family.memberCount}>
      <a className="lcs-sum__name" href={`#family-${family.familyId}`}>{family.familyLabel}</a>

      {lead?.result ? (
        <>
          <span className="lcs-sum__when">
            {lead.variantLabel ? <span className="lcs-sum__variant">{lead.variantLabel}</span> : null}
            <time dateTime={lead.result.drawDateIso}>{lead.result.drawDateDisplay}</time>
          </span>
          <span className="lcs-sum__nums">
            {/* The SAME grammar as a result row, one size down: a summary is a routed glance, not a result
                surface, but it must still read as the same product (§2). */}
            {main ? <StateBallGroup group={main} gameName={family.familyLabel} size="compact" /> : null}
            {addOn && addOn.values.length > 0 ? (
              <StateBallGroup group={addOn} gameName={family.familyLabel} size="compact" />
            ) : null}
          </span>
        </>
      ) : (
        <span className="lcs-sum__when lcs-muted">No result published yet</span>
      )}

      {/* A multi-member family says so, because its summary shows only one of its draws. */}
      {family.memberCount > 1 ? (
        <span className="lcs-sum__more">{family.memberCount} draws · see all</span>
      ) : null}
    </li>
  );
}
