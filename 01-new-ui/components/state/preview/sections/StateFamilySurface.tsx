/*
 * S-02 — the top results experience.
 *
 * LRG-STATE-037 FV-01 REORDERED THIS. Powerball and Mega Millions now render IMMEDIATELY after the compact
 * State identity, ahead of the latest Florida-native family. The previous order put them third because a
 * Florida-native result was more recent, and founder review rejected that: recency is the wrong tiebreak for
 * the two games most readers arrive looking for.
 *
 * FV-02 keeps the deterministic native selection intact — it still decides WHICH native family leads, it just
 * no longer decides whether the multi-state block comes first. `selectFirstNativeFamily` is unchanged.
 *
 * An urgent correction or status still outranks everything, because `resolveOrder` promotes it above S-02
 * entirely (`adaptivePriority`). Jackpot size never promotes anything.
 *
 * Original composition notes from LRG-STATE-032 §1–§6:
 *
 * WHAT THE FOUNDER REJECTED, AND WHY IT WAS A REAL FAULT — not a cache or build problem.
 *
 * The V2 section rendered SEVEN Florida-native family panels plus the multi-state pair before anything else.
 * Two consequences, both visible in the compressed screenshot:
 *
 *   1. The AI module sat roughly 2,500 px down the page, so it was invisible during normal top-page
 *      scanning. It was styled, accented and unreachable.
 *   2. Nine `Buy Now` buttons appeared in the top area, which is exactly "many small repeated buttons".
 *
 * The fix was a shorter, harder top stack (§5). LRG-STATE-037 then reordered it and dropped the trailing CTA,
 * so the current stack is:
 *
 *      compact identity  ->  multi-state block (Powerball, Mega Millions)  ->  first native family
 *   -> action row  ->  What changed  ->  two more native families  ->  View all  ->  AI
 *
 * Everything beyond the first three native families routes through a visible `View all Florida results`
 * action. The reader gets a daily destination, not a catalogue.
 *
 * NO ADVERTISEMENT PRECEDES THE FIRST RESULT on mobile. AD-S00 is desktop-only in this profile and its whole
 * anchor collapses below 992 px.
 *
 * The family panel itself lives in `StateFamilyPanel.tsx` and the multi-state block in
 * `StateMultiStateBlock.tsx` — both hard replacements of the rejected V2 markup, not restyles of it.
 */

import { Fragment } from "react";
import { section } from "@/lib/state/sectionManifest";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";
import type { ResolvedFamily } from "@/lib/state/gameFamilyPresentation";
import { familiesInGroup, selectFirstNativeFamily } from "@/lib/state/gameFamilyPresentation";
import { anyTemporaryMark, TEMPORARY_MARK_NOTE } from "@/lib/state/stateGameIdentity";
import { discussionContextForFamily, communityGroupIdFor } from "@/lib/state/stateEngagement";
import { SectionShell } from "./StateCommon";
import StateFamilyPanel from "./StateFamilyPanel";
import StateFamilySummary from "./StateFamilySummary";
import StateMultiStateBlock from "./StateMultiStateBlock";
import StateActionRow from "../StateActionRow";
import StateWhatChanged from "../StateWhatChanged";
import StateDiscussLink from "../StateDiscussLink";

/** Native group headings, parameterised by state name (`FD-X-01` — nothing branches on a jurisdiction). */
function nativeGroups(stateName: string): { group: ResolvedFamily["group"]; heading: string }[] {
  return [
    { group: "stateOnly", heading: `${stateName} jackpot games` },
    { group: "dailyVariants", heading: `${stateName} daily games` },
    { group: "specialized", heading: "Frequent draws" },
  ];
}

/**
 * How many native families join the leading one as compact summaries (§1E: "a limited number").
 *
 * Measured, not guessed. `FD-N-01` caps native families at four before disclosure, but the binding constraint
 * here is §16: the AI module must be within the first three mobile screens at 390 px. Three full panels put it
 * at 4.38 screens and three summaries at 3.42; two summaries plus a compact multi-state block bring it inside
 * the limit. The cap is a consequence of the mobile budget, not a preference.
 */
export const TOP_STACK_ADDITIONAL = 2;

export function SectionS02Families({ model }: { model: StatePreviewModel }) {
  const entry = section("S-02");
  const st = model.sectionState["S-02"];
  const families = model.familySurfaces;
  const first = selectFirstNativeFamily(families);

  if (!st.render || !first) {
    return (
      <SectionShell entry={entry} heading={`Latest ${model.stateName} lottery results`}>
        <p className="lcs-lede">No {model.stateName} result passed format verification.</p>
      </SectionShell>
    );
  }

  const multi = familiesInGroup(families, "multiState");
  const restNative = nativeGroups(model.stateName).flatMap(({ group, heading }) =>
    familiesInGroup(families, group)
      .filter((f) => f.familyId !== first.familyId)
      .map((f) => ({ f, heading })),
  );
  const topStack = restNative.slice(0, TOP_STACK_ADDITIONAL);
  const deferred = restNative.slice(TOP_STACK_ADDITIONAL);
  const showMarkNote = anyTemporaryMark(families.map((f) => f.visualIdentity));
  const sourceName = model.manifest.resultSource.value ?? "the production results feed";
  const officialUrl = model.facts.operatorWinningNumbersUrl.value ?? null;
  /* The context every engagement surface receives: the result the reader has just seen. */
  const firstContext = discussionContextForFamily(
    first, model.stateName, model.stateCode, sourceName, officialUrl,
  );

  let lastHeading = "";

  return (
    <SectionShell entry={entry} heading={`Latest ${model.stateName} lottery results`}>
      {/*
        LRG-STATE-037 FV-09 REMOVED A REPEATED STATUS LINE HERE.

        S-02 opened with a second `Source checked` pill followed by "19 draws · 10 games · <feed name>". The
        identity area directly above already states the source status, the update date, the freshness, the draw
        count and the game count — so this line repeated all of it about 110px above the first result, on both
        mobile and desktop, and pushed the Florida-native family out of the first desktop screen.

        FV-09 names exactly this: repeated status pills and tiny metadata lines. Nothing factual was lost — the
        source is still attributed in the identity area, on every result panel's own source note, and in S-16.
      */}

      {/* 1 — POWERBALL AND MEGA MILLIONS, immediately after the identity area (FV-01). One shared outer
             block, unchanged from LRG-STATE-036. */}
      <StateMultiStateBlock
        families={multi}
        stateName={model.stateName}
        /* LRG-STATE-039 §4 gives Powerball and Mega Millions a Discuss entry of their own. Assembled here,
           because S-02 already owns the source and official-URL context every discussion entry carries. */
        discussFor={(f) => (
          <StateDiscussLink
            context={discussionContextForFamily(f, model.stateName, model.stateCode, sourceName, officialUrl)}
            groupId={communityGroupIdFor(f)}
            label="Discuss this result"
          />
        )}
      />

      {/* 2 — THE LATEST FLORIDA-NATIVE RESULT, immediately after and still visually important: it keeps the
             featured border, the family panel treatment and its own actions (FV-01, FV-02). */}
      <div className="lcs-topresult" data-primary-result="true" data-primary-family={first.familyId}>
        {/*
          ACTION OWNERSHIP, as LRG-STATE-039 §4 sets it.

          LRG-STATE-037 FV-08 had stripped this panel back to `History` alone, because the action row beneath it
          offered the same three things and two stacked strips read as duplication. §4 supersedes that: the card
          owns the actions that belong to THIS RESULT — History, Ask AI, Discuss, Share and the separate Buy Now
          — and the row keeps the ones that belong to the STATE, with `What changed` explicitly named as
          State-level. The scopes are now different rather than duplicated.
        */}
        <StateFamilyPanel
          family={first}
          stateName={model.stateName}
          featured
          /* LRG-STATE-039 §4 sets the family-panel action list: History, Ask AI, Discuss, Share, with Buy Now
             separate as the primary commerce action. LRG-STATE-038 had reduced this panel to History alone
             because the action row beneath duplicated the rest; §4 supersedes that and restores the card's own
             actions, while `What changed` stays State-level in the row. */
          showAi
          commerce
          discuss={
            <StateDiscussLink
              context={firstContext}
              groupId={communityGroupIdFor(first)}
              label="Discuss this result"
            />
          }
        />
      </div>

      {/* 3 — THE CONSUMER ACTION ROW (FV-08). One prominent Ask AI, three compact secondary actions. It
             replaced four equal outlined cards with explanatory microcopy under each, which read as four
             administrative controls rather than as things a person wants to do. */}
      <StateActionRow
        stateName={model.stateName}
        context={firstContext}
        focusFamilyId={first.familyId}
        communityGroupId={communityGroupIdFor(first)}
      />

      {/* 4 — WHAT CHANGED, an inline disclosure directly below the action row (FV-06). No dialog, and it
             costs one line when collapsed.

             It receives the SAME deterministic facts FV-06 lists — new verified results, the latest result date
             and jackpot movement — computed from the page's own published data. S-09 states the movement figures
             too, in the server HTML where §11 needs them crawlable; this copy is visit-conditional and client
             only, so it cannot live there. Same fact, two different jobs, four thousand pixels apart. */}
      <StateWhatChanged
        stateName={model.stateName}
        resultCount={model.drawEventCount}
        latestResultDate={first.newestVerifiedDateIso}
        movements={model.families
          .filter((f) => f.jackpotMovement?.changed)
          .map((f) => ({
            family: f.familyName,
            current: f.jackpotMovement!.current,
            next: f.jackpotMovement!.next,
          }))}
        feedVersion={model.freshness.lastUpdatedIso ?? "0"}
      />

      {/* 5 — additional Florida-native families as COMPACT SUMMARIES (§1E), not full panels.
             Measured cause: rendering these three as full panels put the AI module at 4.4 mobile screens
             against §16's limit of three. A summary is enough to recognise the game and read its latest
             numbers; the full panel is one tap away under View all. */}
      <ul className="lcs-sumlist" data-top-stack-count={topStack.length}>
        {topStack.map(({ f, heading }) => {
          const showHeading = heading !== lastHeading;
          lastHeading = heading;
          return (
            <Fragment key={f.familyId}>
              {showHeading ? (
                <li className="lcs-sumlist__head" role="presentation">
                  <h3 className="lcs-groupheading">{heading}</h3>
                </li>
              ) : null}
              <StateFamilySummary family={f} />
            </Fragment>
          );
        })}
      </ul>

      {/* 4 — the FULL panels for every remaining family, plus the summarised ones, behind one disclosure.
             `<details>` keeps them in the SERVER HTML and crawlable: depth on request, never client-side
             filtering, so every result stays indexable. */}
      <details className="lcs-viewall" data-deferred-count={deferred.length + topStack.length}>
        <summary className="lcs-viewall__summary">
          View all {model.stateName} results
          <span className="lcs-viewall__count">
            {" "}({deferred.length + topStack.length} games in full)
          </span>
        </summary>
        <div className="lcs-natives">
          {[...topStack, ...deferred].map(({ f }) => (
            <StateFamilyPanel key={f.familyId} family={f} stateName={model.stateName} />
          ))}
        </div>
      </details>

      {/* Said ONCE per section. A disclosure badged onto ten panels stops being read. */}
      {showMarkNote ? (
        <p className="lcs-marknote" data-temporary-mark-note="true">{TEMPORARY_MARK_NOTE}</p>
      ) : null}
    </SectionShell>
  );
}
