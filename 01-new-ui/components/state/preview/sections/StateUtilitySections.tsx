/*
 * S-01 Identity · S-03 AI Brief · S-05 Check Ticket · S-07 Where to Play · S-08 Player Help ·
 * S-08A State Essentials.
 *
 * Task LRG-STATE-021 §8. Authority: PF-02 §13, §16, §18, §20, §21, §21A; FD-S-08 (no disabled
 * controls), FD-S-16 (5 launch AI placements), FD-S-17 (AI determines nothing), FD-S-18 (default
 * `Where to Play`), FD-S-02 (unsourced facts render "Currently unavailable").
 */

import { section } from "@/lib/state/sectionManifest";
import { intelligenceOf } from "@/lib/ai/sectionIntelligence";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";
import { SectionShell, SourceFreshness, Unavailable, Attribution, MobileDetail } from "./StateCommon";
import StateBuyNowInline from "../StateBuyNowInline";
import StateClaimVideoBlock from "../StateClaimVideo";
import { readerCopy } from "@/lib/state/stateReaderCopy";

/**
 * S-01 — State Identity and Task Header. Carries the page's single H1.
 *
 * FD-S-08: no disabled controls. The Change State affordance is a real anchor to S-18 (a section that
 * genuinely exists on this page), not a disabled `<select>`. The Ask State AI entry is a real anchor to
 * the S-03 brief, so it is a working control rather than a dead promise.
 */
export function SectionS01({ model }: { model: StatePreviewModel }) {
  const entry = section("S-01");
  return (
    /* LRG-STATE-031 §6. Founder review reported "small typography and weak State identity". The header was
       a plain H1 over a plain paragraph over metadata — correct, and anonymous: nothing said *Florida*
       before the words did.
       The identity is now an eyebrow line (jurisdiction + operator + timezone) above a tighter H1, with
       freshness and shortcuts on one compact row beneath. It stays a compact header, not a hero: the brief
       explicitly rules out a giant hero and a three-line H1, and the first result must still reach the first
       screen at 390 px. */
    <section
      className="lcs-section lcs-ident"
      aria-labelledby="state-h1"
      data-section-id={entry.id}
      data-section-order={entry.order}
      data-protected-zone="true"
      /*
       * §C3 — THE §10.5 COVERAGE HOLE THIS CLOSES.
       *
       * S-01 owns the page's `<h1>`, so it cannot use `SectionShell` — the shared §42 primitive derives an `<h2>`,
       * and a second top-level heading would be an outline defect. It therefore built its own `<section>`, and was
       * the ONE section on the State page emitting no `data-intelligence`. Measured in the rendered DOM at 375px:
       * 13 sections carried the attribute and this one did not.
       *
       * The value comes from the same Section Intelligence Matrix `UniversalSection` reads, so the decision is
       * recorded in one place whichever element emits it. `data-intelligence-source` says it came from the matrix.
       */
      data-intelligence={intelligenceOf("state", entry.id)}
      data-intelligence-source="matrix"
      data-source-class="configured"
    >
      <p className="lcs-ident__eyebrow" data-state-identity={model.stateCode}>
        <span className="lcs-ident__code" aria-hidden="true">{model.stateCode.toUpperCase()}</span>
        <span className="lcs-ident__place">{model.stateName}</span>
        {model.facts.operatorName.publish && model.facts.operatorName.value ? (
          <span className="lcs-ident__op">{model.facts.operatorName.value}</span>
        ) : null}
        <span className="lcs-ident__tz">
          All times {model.manifest.displayTimezoneLabel.value ?? "ET"}
        </span>
      </p>

      {/* PF-02 §63: exactly one H1, results-dominant. Shortened from "Latest Florida Lottery Results,
          Winning Numbers and Jackpots" — the old string wrapped to three lines at 390 px, which is
          precisely what §6 rules out. It remains unique, descriptive and keyword-complete. */}
      <h1 className="lcs-h1" id="state-h1">
        {model.stateName} Lottery Results and Winning Numbers
      </h1>

      <div className="lcs-ident__meta">
        {/* LRG-STATE-039 §1: ONE concise line — when it was updated, and where the numbers come from. The
            reader-facing source is the OPERATOR, which is where the winning numbers originate; the internal
            feed that transports them is named in the sources section, not in the page's opening line. */}
        <SourceFreshness
          lastUpdatedIso={model.freshness.lastUpdatedIso}
          daysOld={model.freshness.daysOld}
          stale={model.freshness.stale}
          timezoneLabel={model.manifest.displayTimezoneLabel.value}
          sourceName={model.facts.operatorName.value ?? undefined}
        />
        {/* LRG-STATE-032 §5: the count shares the freshness line rather than taking a third row of its own.
            It was 45px directly above the first result, saying something the S-02 source line repeats. */}
        <span className="lcs-ident__count">
          · {model.drawEventCount} draws · {model.familySurfaces.length} games
        </span>
      </div>

      {/* Real in-page destinations only — no disabled control, no dead link. One wrapping chip row rather
          than stacked buttons, so the first result stays near the fold (LRG-STATE-030 §7). */}
      {/*
        LRG-STATE-037 FV-09 CUT THIS ROW FROM FOUR CHIPS TO TWO.

        `Jump to results` and `Ask {state} AI` were removed because the reorder made them redundant, not because
        shortcuts are unwanted: FV-01 puts Powerball and Mega Millions immediately below this row, so "jump to
        results" now points at what the reader can already see, and FV-08 puts a prominent `Ask AI` in the action
        row under the first result. Two rows of four chips cost ~160px at 390px directly above the first result.

        The two that remain lead somewhere the reader cannot otherwise see from here.
      */}
      <nav className="lcs-chiprow" aria-label={`${model.stateName} page shortcuts`}>
        <a className="lcs-chip lcp-target" href="#check-ticket">Check my ticket</a>
        <a className="lcs-chip lcp-target" href="#all-states">Change state</a>
      </nav>
      {/* PF-02 §13: no purchase CTA in the header. */}
    </section>
  );
}

/*
 * LRG-STATE-037 §12 — a DUPLICATE PREVIEW SURFACE was removed here.
 *
 * This file also carried a `SectionS03`, left over from the first guarded draft. Nothing imported it:
 * `StatePreview` mounts `SectionS03` from `StateDraftSections` (aliased `SectionS03Draft`). It was dead, and
 * it declared `id="state-ai-brief"` — the same DOM id the live AI section owns — so anything that resurrected
 * it would have produced two elements answering `#state-ai-brief`, which is exactly the anchor every
 * contextual Ask AI action now depends on.
 *
 * The live State AI surface is `StateAiSurface`, hosted by `SectionS03` in `StateDraftSections`.
 */


/**
 * S-05 — how to check a State ticket. Required at experience level (PF-02 §4).
 *
 * IS THE CHECKER FUNCTIONAL? NO, and LRG-STATE-038 §5 required that to be established rather than assumed.
 * There is no comparison code anywhere in the repository: no matcher, no per-game prize rule set, no input
 * handler. `buildStatePreviewModel` marks S-05 unavailable for exactly that reason. So the honest options
 * were to build a real checker (out of scope) or to stop presenting one.
 *
 * WHAT CHANGED. This was an `Unavailable` card headed "Ticket checking: currently unavailable" — a module
 * whose entire content was a statement that it does not work, which FP-05 forbids. It is now a compact
 * three-step summary of how a reader actually checks a Florida ticket today, ending at the operator's own
 * winning-number search.
 *
 * EVERY FACT HERE IS VERIFIED. The steps use `operatorWinningNumbersUrl` and the `$599 or less` claim
 * threshold, both `verified` in the content manifest from the official Winner's Guide [O2]. Nothing states
 * a prize, simulates a match or implies LotteryCorner can confirm a win.
 *
 * The section id, order and heading semantics are unchanged. No fake checker was created.
 */
export function SectionS05({ model }: { model: StatePreviewModel }) {
  const entry = section("S-05");
  const official = model.facts.operatorWinningNumbersUrl.value;
  /* The smallest-prize threshold only. FP-03 keeps the full claim table off the hub. */
  const smallPrize = model.manifest.claimThresholds.value?.[0];
  return (
    <SectionShell entry={entry} heading={`How to check your ${model.stateName} ticket`}>
      <ol className="lcs-steps" data-ticket-guidance="true">
        <li>Find your game and draw date in the results above, and compare every number on your ticket.</li>
        <li>
          Check the official numbers before you act on a result.{" "}
          {official ? (
            <a href={official} rel="noopener noreferrer external" target="_blank">
              {model.facts.operatorName.value ?? "The operator"} — winning numbers
            </a>
          ) : null}
        </li>
        {smallPrize ? (
          <li>
            A prize of {smallPrize.range} can be claimed at {smallPrize.where}. Larger prizes have their own
            process — see the claim guidance below.
          </li>
        ) : null}
      </ol>
      <p className="lcs-fine lcs-muted">
        LotteryCorner cannot confirm a win. Only the {model.facts.operatorName.value ?? "operator"} can
        validate a ticket.
      </p>
    </SectionShell>
  );
}

/**
 * S-07 — Where to Play. Informational only.
 *
 * FD-S-18: the default action is `Where to Play`; `Buy Tickets` and `Play Online` require confirmed
 * state, game, provider, age, location and freshness eligibility, none of which exists here. FD-S-20
 * defers commerce activation entirely, so there is no resolver link and no affiliate destination.
 */
export function SectionS07({ model }: { model: StatePreviewModel }) {
  const entry = section("S-07");
  const operator = model.facts.operatorName.value ?? "the official operator";
  const whereToPlay = model.facts.operatorWhereToPlayUrl.value;
  return (
    <SectionShell
      entry={entry}
      /* LRG-STATE-036 §7: the visible public heading is now the commerce label the page actually uses.
         "Where to Play" survives as a resolver outcome and a supporting link, not as the section title. The
         governed section id and semantic position are unchanged. */
      heading={`Buy Now in ${model.stateName}`}
      /* LRG-STATE-037 FV-09 REMOVED THIS SECTION'S LEDE. The inline resolver directly beneath it now states
         the same three things in the reader's own terms — that LotteryCorner does not sell tickets, that the
         purchase status is "Still being verified", and that neither an online nor a partner option has been
         verified. A lede repeating them made four consecutive statements of one fact. */
    >
      {/* LRG-DEC-028 / FD-N-03 SUPERSEDE FD-S-18 HERE. The State-page commerce CTA is `Buy Now`, and
          `Where to Play` is no longer the primary action. `Buy Now` is safe as the prominent label because
          it opens the governed first-party resolver rather than a destination: the resolver states that
          LotteryCorner does not sell tickets, reports Florida's actual `underReview` purchase status, and
          offers only the official operator. The eligibility conditions FD-S-18 was protecting are enforced
          inside the resolver, which is where they belong.

          The official Where-to-Play destination stays available as a supporting link — it is a verified
          manifest fact, and demoting it must not mean hiding it. */}
      {/* LRG-STATE-037 FV-07: the ONE shared resolver, inline in S-07. Every Buy Now on the page scrolls here
          and expands it. It is no longer a dialog. */}
      <StateBuyNowInline
        stateName={model.stateName}
        officialWhereToPlayUrl={model.facts.operatorWhereToPlayUrl.value ?? null}
        operatorName={model.facts.operatorName.value ?? "the official operator"}
        todayIso={(model.freshness.lastUpdatedIso ?? "2026-07-30").slice(0, 10)}
        commerce={model.commerce}
      />

      <p className="lcs-actions">
        {whereToPlay ? (
          <a
            className="lcs-famlink"
            href={whereToPlay}
            rel="noopener noreferrer external"
            target="_blank"
            data-commerce-label="where-to-play"
          >
            Where to Play — {operator}
          </a>
        ) : null}
      </p>

      {/*
        LRG-STATE-048 — THE CLAIM VIDEO, immediately after the claim-and-help content.
        Placed here rather than in S-08 because S-08 (claim tiers and deadlines) suppresses on every State
        whose claim facts are unresearched, and the video would have gone with it. This section is the
        "Playing, buying and getting help" area those States actually render, and it sits well after the
        results, the AI surface and the ticket-check guidance — which is the ordering the task requires.
        Florida configures no video, so it renders nothing and is untouched.
      */}
      {model.lowerContent.claimVideo ? (
        <StateClaimVideoBlock video={model.lowerContent.claimVideo} stateName={model.stateName} />
      ) : null}
      {/* FV-09: trimmed from four sentences to one. The resolver's own option groups already say that no
          partner option exists and that any paid option would be disclosed beside it; what this line adds, and
          the resolver cannot, is the eligibility rule. */}
      <p className="lcs-fine lcs-muted">
        Location alone never authorises a purchase
        option.
      </p>
    </SectionShell>
  );
}

/**
 * S-08 — claims and player help. A protected zone: no ad, no affiliate CTA, no commerce treatment.
 *
 * A CONTENT DEFECT WAS FIXED HERE — LRG-STATE-038 §6.
 *
 * This section rendered FOUR `Currently unavailable` cards. Two of them were wrong: `claimThresholds` and
 * `claimDeadline` are both `verified` in the content manifest, cited to the official Winner's Guide [O2],
 * and had been since LRG-STATE-025. The section passed `.source` — the reviewer citation — straight into
 * `Unavailable` without ever checking whether the fact publishes, so verified guidance was being withheld
 * from readers while the page claimed it did not exist. That is worse than a cosmetic problem: a claim
 * deadline is the one fact on this page a reader can actually miss out on.
 *
 * WHAT IS PUBLISHED NOW — verified items only, as §6 lists them:
 *   - the verified claim deadline, which covers both draw games and Scratch-Offs in one sourced sentence;
 *   - the official claim destination (the Winner's Guide, which also carries the district-office detail);
 *   - the official responsible-play destination.
 *
 * WHAT IS SUPPRESSED, NOT BOXED. `taxStatus` and `anonymityRule` are `absent` — no primary source has been
 * verified for either. FP-05 forbids a card whose content is "currently unavailable", and §6 says route
 * them to a dedicated guide if one exists and otherwise suppress. No such guide exists, so they render
 * nothing at all. The absence stays recorded in the manifest, where a future task will find it.
 *
 * FP-03 keeps the full claim-threshold table off the hub: the amount bands and district-office addresses
 * belong on a dedicated claim page, and the official Winner's Guide is the destination until one exists.
 */
export function SectionS08({ model }: { model: StatePreviewModel }) {
  const entry = section("S-08");
  const operator = model.facts.operatorName.value ?? "the official operator";
  const howToClaim = model.manifest.operatorHowToClaimUrl.value;
  const responsiblePlay = model.manifest.operatorResponsiblePlayUrl.value;
  const deadline = model.manifest.claimDeadline.value;

  return (
    <SectionShell entry={entry} heading={`Claiming a prize in ${model.stateName}`}>
      {/* PF-02 §64A names both `#claim-prize` and `#taxes`; S-08 owns both fragments. */}
      <div id="taxes" />

      {deadline ? (
        <p className="lcs-claimline" data-claim-deadline="verified">
          <strong>Claim deadline.</strong>{" "}
          {deadline}
        </p>
      ) : null}

      <ul className="lcs-linklist" data-help-destinations="true">
        {howToClaim ? (
          <li>
            <a href={howToClaim} rel="noopener noreferrer external" target="_blank">
              {operator} — how to claim a prize
            </a>
            <span className="lcs-muted lcs-fine"> · official site · amounts, offices and forms</span>
          </li>
        ) : null}
        {responsiblePlay ? (
          <li>
            <a href={responsiblePlay} rel="noopener noreferrer external" target="_blank">
              {operator} — play responsibly
            </a>
            <span className="lcs-muted lcs-fine"> · official site</span>
          </li>
        ) : null}
      </ul>

      <p className="lcs-fine lcs-muted">
        Tax and winner-anonymity rules are not stated here because no primary source has been verified for
        them. We would rather say nothing than guess about either.
      </p>
      {/* PF-02 §21: no affiliate CTA, no commerce treatment and no advertisement inside this section. */}
    </SectionShell>
  );
}

/**
 * S-08A — State Essentials. The compact governed-fact block (PF-02 §21A).
 *
 * Publishes only what the manifest verifies. Facts without a source are marked
 * "Currently unavailable" rather than generic-filled.
 */
export function SectionS08A({ model }: { model: StatePreviewModel }) {
  const entry = section("S-08A");
  const m = model.manifest;
  /*
   * LRG-STATE-038 §6 / FP-05 — VERIFIED ROWS ONLY.
   *
   * Five of the nine rows rendered "Currently unavailable", and two of those five were simply wrong:
   * `minimumPurchaseAge` (value "18") and `claimDeadline` are both `verified`, yet the table passed their
   * reviewer citation into the unavailable branch and printed the note instead of the fact. A reader saw
   * "Minimum purchase age — Currently unavailable" beside the very sentence that establishes it.
   *
   * The table now publishes only what is genuinely verified, and rows with no verified value are OMITTED
   * rather than rendered as unavailable. A facts table half-filled with "we do not know" is the
   * unfinished-looking surface FP-05 rules out. What is absent stays absent in the manifest, which is
   * where absence is supposed to be recorded — not on the reader's screen.
   */
  const rows: { label: string; value: string }[] = [
    { label: "Jurisdiction", value: `${m.canonicalName.value} (${(m.stateCode.value ?? "").toUpperCase()})` },
    { label: "Lottery status", value: m.lotteryStatus.value === "active" ? "Active state lottery" : "No active state lottery" },
    { label: "Operator", value: m.operatorName.value ?? "" },
    { label: "Primary time zone", value: `${m.primaryTimezone.value} (${m.displayTimezoneLabel.value})` },
    ...(m.minimumPurchaseAge.value ? [{ label: "Minimum age to play", value: `${m.minimumPurchaseAge.value} or older` }] : []),
    ...(m.claimDeadline.value ? [{ label: "Claim deadline", value: m.claimDeadline.value }] : []),
    ...(m.drawCutoffs.value ? [{ label: "Ticket sales cutoff", value: m.drawCutoffs.value }] : []),
  ].filter((r) => r.value !== "");
  return (
    <SectionShell entry={entry} heading={`${model.stateName} essentials`}>
      {/* §11: collapsed on mobile, open on desktop. Not a result table — these are jurisdiction facts. */}
      <MobileDetail summary={`See all ${model.stateName} lottery facts`} count={rows.length}>
      <div className="lcp-scroll-x">
        <table className="lcs-table">
          <caption>{model.stateName} lottery facts</caption>
          <thead>
            <tr>
              <th scope="col">Fact</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} data-fact-available="true">
                <th scope="row">{r.label}</th>
                <td>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </MobileDetail>
      {/*
        LRG-STATE-048 PUBLIC-COPY CLEANUP. This read "Operator identity is cited from the approved State
        blueprint; jurisdiction and time zone from production configuration." — three internal vocabularies
        in one sentence (source-authority tier, "approved blueprint", "production configuration"), and it
        appeared on every State including Florida. It is REMOVED rather than reworded: the table above already
        shows each fact with its own value, and a provenance footnote written for a reviewer is not something
        a reader needs under it. Provenance itself is untouched — it stays in the manifest and in the tests.
      */}
    </SectionShell>
  );
}
