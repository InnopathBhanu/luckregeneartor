/*
 * THE NO-LOTTERY (ST-06) COMPOSITION — LRG-STATE-047 STATE-06.
 *
 * Authority: PF-02 §252 `ST-06 — No active state lottery`; `FD-S-31` (preserve `/al`, `/ak`, `/hi`, `/ut`
 * and `/nv` with the ST-06 experience rather than returning 404); `FD-X-14` step 6 (Utah validates
 * suppression); the Product Constitution's rule that the user's reason for arriving is satisfied first.
 *
 * ══ WHY THIS IS A DIFFERENT PAGE, NOT THE STATE PAGE WITH GAPS ══
 *
 * The task is explicit: the no-lottery page must be "useful and concise, not an error page and not a normal
 * State page with empty modules". Running Utah through the normal composition would produce a sequence of
 * suppressed sections and a page whose whole content is things that are missing. Somebody arriving here
 * asked a real question — "what are the Utah lottery numbers?" — and the honest answer is short, complete,
 * and available immediately. So this is a small dedicated composition rather than a filtered one.
 *
 * ══ WHAT IS DELIBERATELY NOT HERE, AND WHY EACH ABSENCE IS EVIDENCED ══
 *
 *   - NO result section, and no empty result card. The production results feed has no `<State
 *     stateCode="UT">` block at all — that absence IS the evidence for this profile.
 *   - NO multi-state block. Utah does not sell Powerball or Mega Millions, and the repository contains no
 *     evidence that it does. Listing national games on a Utah page would imply they can be played here.
 *   - NO cross-border purchase guidance. "Utah players often drive to Idaho or Wyoming" is a real-world
 *     commonplace and it is not in this repository, and it is purchase-legality guidance — the task forbids
 *     inferring cross-border eligibility, and CLAUDE.md §13 makes eligibility state-aware and evidence-based.
 *   - NO retailer locator, claim guide, Buy Now, tax content or news. There is no operator to have them.
 *   - NO helpline number. `1-800-GAMBLER` is in the global footer as a national resource; inventing a
 *     Utah-specific responsible-play contact would be a fabricated official fact.
 *
 * What remains is the answer, the reason, and a way onward. That is the whole page, and it is enough.
 */

import Link from "next/link";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";

/**
 * States a reader can actually reach right now.
 *
 * ROUTE-AND-LINK requires that any Change State affordance shows the supported preview States "without
 * claiming full rollout" — hence the explicit sentence rather than a directory of 53 jurisdictions, most of
 * which have no page in this preview. Every entry is a route that exists.
 */
function OtherStates({ model }: { model: StatePreviewModel }) {
  const others = model.previewStates.filter((s) => s.code !== model.stateCode);
  if (others.length === 0) return null;
  return (
    <section className="lcs-section" aria-labelledby="ut-other-states" data-section-id="S-18">
      <h2 className="lcs-h2" id="ut-other-states">States in this preview</h2>
      <p className="lcs-lede">
        These are the states included in this internal preview. The full LotteryCorner state list is not part
        of it.
      </p>
      <ul className="lcs-nolottery__states">
        {others.map((s) => (
          <li key={s.code}>
            <Link href={`/${s.code}`}>{s.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The whole page body for a State that runs no lottery.
 *
 * Three blocks: the answer, why, and where to go instead. It fits on one mobile screen at 390 px, which is
 * the correct length for a page whose entire content is a single fact.
 */
export default function StateNoLottery({ model }: { model: StatePreviewModel }) {
  const name = model.stateName;
  return (
    <>
      <section className="lcs-section lcs-nolottery" aria-labelledby="ut-answer" data-section-id="S-01">
        <h1 className="lcs-h1" id="ut-answer">{name} lottery results</h1>
        {/*
          THE ANSWER, FIRST AND WITHOUT QUALIFICATION. The Constitution requires the reason for arriving to
          be satisfied before anything else, and here that takes one sentence.
        */}
        <p className="lcs-nolottery__lede">
          There are no {name} lottery results, because {name} does not run a state lottery.
        </p>
        <p className="lcs-lede">
          No state-run draw games are sold in {name}, so there are no {name} winning numbers, jackpots or
          claim deadlines to check — here or anywhere else.
        </p>
      </section>

      <section className="lcs-section" aria-labelledby="ut-why" data-section-id="S-08A">
        <h2 className="lcs-h2" id="ut-why">What this means if you are looking for numbers</h2>
        <ul className="lcs-nolottery__points">
          <li>
            A ticket bought in another state is checked against <strong>that state&rsquo;s</strong> results
            and claimed under that state&rsquo;s rules, whichever state you live in.
          </li>
          <li>
            Prize claim deadlines, minimum age and tax treatment are set by the state that ran the draw.
          </li>
          {/*
            The one thing we will NOT say is where to go and buy a ticket instead. That is purchase-legality
            guidance about a jurisdiction, and this task has no evidence for it.
          */}
          <li>
            We do not give guidance on buying tickets outside your own state. Rules differ by state and we
            have not verified them.
          </li>
        </ul>
      </section>

      <OtherStates model={model} />

      <section className="lcs-section" aria-labelledby="ut-trust" data-section-id="S-17">
        <h2 className="lcs-h2" id="ut-trust">About this page</h2>
        <p className="lcs-lede">{model.config.trust.independence}</p>
      </section>
    </>
  );
}
