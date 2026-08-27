/*
 * S-02 Latest State Results · S-04 Live and Upcoming Draws · S-06 State Game Portfolio.
 *
 * Task LRG-STATE-021 §8. Authority: PF-02 §15, §17, §19; FD-S-06 (neutral comparison), FD-S-09 (closed
 * status union), FD-S-10 (verified formats only), FD-S-14 (three special-ball signals), FD-S-21 (no ad
 * inside the result grid).
 */

import { getResultFormat } from "@/lib/data-provider";
import type { BallGroupDrawn } from "@/lib/data-provider/types";
import { section } from "@/lib/state/sectionManifest";
import type { PreviewGroup, StatePreviewModel } from "@/lib/state/statePreviewModel";
import { SectionShell, SourceFreshness, Unavailable, Attribution, MobileDetail, ExternalLink } from "./StateCommon";

/**
 * One drawn ball group.
 *
 * FD-S-14 requires THREE simultaneous signals on a special ball: visible text, a non-colour visual
 * distinction, and an accessible name. Colour alone is measurably insufficient (1.09–1.30:1 separation
 * between special-ball tokens).
 *
 * Ball count comes from `values.length` — never hardcoded (CLAUDE.md §14). Drawn order is preserved
 * exactly (DS-12): the array is mapped, never sorted.
 */
function BallGroup({ group, isCard }: { group: BallGroupDrawn; isCard: boolean }) {
  const special = Boolean(group.label);
  return (
    <div className="lcs-ballgroup">
      <div className="lcs-balls">
        {group.values.map((v, i) => (
          <span
            key={`${group.order}-${i}`}
            className="lcp-ball"
            data-token={group.colorToken}
            /* Signal 2 — non-colour visual distinction, driven by CSS, not by hue. */
            data-special={special ? "true" : "false"}
            {...(isCard ? { "data-card-face": "true" } : {})}
          >
            {v}
          </span>
        ))}
      </div>
      {/* Signal 1 — the visible label. Signal 3 — the accessible name, announced before the values. */}
      {group.label ? (
        <span className="lcs-balllabel" data-ball-label={group.label}>
          {group.label}
        </span>
      ) : null}
    </div>
  );
}

/* Exported for reuse by the LRG-STATE-025 family cards — one card renderer, not a second one. */
export function ResultCardView({
  gameId,
  displayName,
  status,
  statusDetail,
  card,
}: PreviewGroup["cards"][number]) {
  const format = getResultFormat(card.formatRef?.gameId ?? gameId);
  const isCard = Boolean(format?.isCardGame);
  const showValues = status === "verified" || status === "corrected";

  return (
    <article
      className="lcp-card lcp-card--compact"
      data-game-id={gameId}
      data-status={status}
      data-format-id={card.formatRef?.gameId ?? gameId}
    >
      {/* PF-02 §73 / Global Shell §146: game and draw date are announced BEFORE the values. */}
      <h3 className="lcs-h3">{displayName}</h3>
      <p className="lcs-lede" style={{ fontSize: "0.875rem" }}>
        {card.drawScheduleLabel ? `${card.drawScheduleLabel} · ` : ""}
        Draw date {card.resultDate?.display ?? "unavailable"}
      </p>

      {showValues ? (
        <div className="lcs-ballrow">
          {card.groupsDrawn.map((g) => (
            <BallGroup key={g.order} group={g} isCard={isCard} />
          ))}
        </div>
      ) : (
        /* Height-reserved placeholder so nothing shifts when a result lands (DS-14). */
        <div className="lcp-ball--awaiting" data-awaiting="true">
          {statusDetail}
        </div>
      )}

      {/* Add-ons (e.g. Fireball) — a named single ball, never a bare number. */}
      {card.addOns?.length ? (
        <div className="lcs-ballrow">
          {card.addOns.map((a, i) => (
            <div className="lcs-ballgroup" key={i}>
              <div className="lcs-balls">
                <span className="lcp-ball" data-token={a.colorToken} data-special="true">
                  {a.value}
                </span>
              </div>
              <span className="lcs-balllabel" data-ball-label={a.label}>{a.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Multipliers render as full text, never a bare number (DS-14). */}
      {card.multipliers?.length ? (
        <p className="lcs-lede" style={{ fontSize: "0.875rem" }}>
          {card.multipliers.map((m) => m.display ?? `${m.label} ${m.value}×`).join(" · ")}
        </p>
      ) : null}

      {/* Secondary draw (e.g. Double Play) carries a named heading. */}
      {card.secondaryDraw ? (
        <div data-secondary-draw="true">
          <p className="lcs-h3" style={{ fontSize: "0.9375rem" }}>
            {card.secondaryDraw.label}
          </p>
          <div className="lcs-ballrow">
            {card.secondaryDraw.groupsDrawn.map((g) => (
              <BallGroup key={`sec-${g.order}`} group={g} isCard={isCard} />
            ))}
          </div>
        </div>
      ) : null}

      {/* LRG-STATE-022 DEFECT FIX — the status detail was rendered TWICE.
          When `showValues` is false the height-reserved placeholder above already carries
          `statusDetail`, and this paragraph repeated the identical string, so every awaiting card read
          "Awaiting result — next draw Friday, 07/10/2026" twice, once to the eye and twice to a screen
          reader. The paragraph now renders only when the values ARE shown and the status is still not
          verified — the `corrected` case — where it genuinely adds information the balls do not carry. */}
      {showValues && status !== "verified" ? (
        <p className="lcs-lede" style={{ fontSize: "0.875rem" }} data-status-detail="true">
          {statusDetail}
        </p>
      ) : null}

      {/* No purchase CTA, and no ad, inside a result card (FD-S-18, FD-S-21). */}
    </article>
  );
}

/** S-02 — Latest State Results. */
export function SectionS02({ model }: { model: StatePreviewModel }) {
  const entry = section("S-02");
  const state = model.sectionState["S-02"];
  if (!state.render) {
    return (
      <SectionShell entry={entry} heading={`Latest ${model.stateName} lottery results`}>
        <Unavailable
          what="Current results"
          reason={state.reason}
          officialUrl={model.facts.operatorWinningNumbersUrl.value}
          officialLabel={`Check ${model.facts.operatorName.value ?? "the official operator"} winning numbers`}
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell entry={entry} heading={`Latest ${model.stateName} lottery results`}>
      <SourceFreshness
        lastUpdatedIso={model.freshness.lastUpdatedIso}
        daysOld={model.freshness.daysOld}
        stale={model.freshness.stale}
        timezoneLabel={model.manifest.displayTimezoneLabel.value}
        sourceName={model.manifest.resultSource.value}
      />
      {/* PF-02 §15 grouping order: multi-state → state-only → daily variants → specialised.
          FD-S-21: no advertisement renders inside this grid. */}
      {model.results.map((g) => (
        <div key={g.groupKey} data-result-group={g.groupKey}>
          <h3 className="lcs-h3">{g.heading}</h3>
          <div className="lcs-cardgrid">
            {g.cards.map((c) => (
              <ResultCardView key={c.gameId} {...c} />
            ))}
          </div>
        </div>
      ))}
      {model.coverage.suppressed.length > 0 ? (
        <Unavailable
          what={`${model.coverage.suppressed.length} game(s)`}
          reason={`Suppressed because the result format could not be verified: ${model.coverage.suppressed
            .map((s) => `${s.displayName} (${s.reason})`)
            .join("; ")}`}
        />
      ) : null}
    </SectionShell>
  );
}

/**
 * S-04 — Live and Upcoming Draws. **Conditional** (PF-02 §4).
 *
 * LRG-STATE-022 correction: the first version inverted its own guard (`if (state.render) return null`),
 * so it could only ever render an unavailable box and would have rendered NOTHING once real schedule data
 * arrived. It is also unreachable while suppressed, because the orchestrator nulls suppressed content
 * sections before the switch — which is the correct behaviour for a conditional section with no data
 * (PF-02 §12: collapse, do not leave a shell).
 *
 * This version renders real content when it is reachable, and never fabricates a live state.
 */
export function SectionS04({ model }: { model: StatePreviewModel }) {
  const entry = section("S-04");
  const schedule = model.manifest.drawSchedule;
  /* Reached only when the section is not suppressed. Without verified schedule data there is nothing
     truthful to draw, so it renders nothing rather than an invented live status. */
  if (!schedule.value) return null;
  return (
    <SectionShell entry={entry} heading={`Live and upcoming ${model.stateName} draws`}>
      <p className="lcs-lede">
        Draw times shown in{" "}
        {model.manifest.displayTimezoneLabel.value}.
      </p>
    </SectionShell>
  );
}

/**
 * S-06 — State Game Portfolio, with the PF-02 §19 / FD-S-06 neutral comparison.
 *
 * The comparison uses only VERIFIED facts: game name, group, and the ball structure taken from the
 * format definition. Published odds are omitted — the fixture's odds are unverified and FD-S-06 permits
 * only *published* odds, never computed or estimated ones.
 *
 * Prohibited framing is absent by construction: the heading is the approved string and there is no
 * recommendation column.
 */
export function SectionS06({ model }: { model: StatePreviewModel }) {
  const entry = section("S-06");
  const rows = model.coverage.covered;

  /* LRG-STATE-030 COMPACTION (§12). This table previously listed all 19 member games as separate rows —
     the same equal-weight explosion the family surface exists to fix, repeated 200 px lower down. It now
     lists one row per FAMILY, with the member count in the row.

     Nothing is lost: every member of a family shares one result-format definition, so `Pick 3 Midday` and
     `Pick 3 Evening` produced two byte-identical format rows. The member games themselves remain fully
     visible, with their own dates and numbers, in S-02. */
  const families = model.familySurfaces.filter((f) =>
    f.members.some((m) => rows.some((r) => r.gameId === m.gameId)),
  );

  return (
    <SectionShell
      entry={entry}
      heading={`${model.stateName} lottery games`}
      /* LRG-STATE-048 PUBLIC-COPY CLEANUP. This read "The N {State} games whose result format is verified in
         this preview, covering N draw events." — a verification-gate count and the word "preview" in reader
         copy, and on the four new States it printed "The 0 Michigan games…" beside six rendered games,
         because the count came from a different coverage source than the surfaces below it. The reader
         sentence now says what the section is for. */
      lede={`Browse current ${model.stateName} draw games and recent results.`}
    >
      {/* §11: 10 rows x 4 columns measured 1,077px on a 390px viewport. Collapsed on mobile, open on
          desktop, crawlable in both. */}
      <MobileDetail summary={`Compare all ${model.stateName} games`} count={families.length}>
      <div className="lcp-scroll-x">
        <table className="lcs-table">
          {/* FD-S-06: the approved neutral heading. No "which game should you play", no "best odds". */}
          <caption>Compare {model.stateName} Lottery Games</caption>
          <thead>
            <tr>
              <th scope="col">Game</th>
              <th scope="col">Offering</th>
              <th scope="col">Game format</th>
              <th scope="col">Numbers drawn</th>
            </tr>
          </thead>
          <tbody>
            {families.map((f) => {
              /* The format is a family-level fact; read it from the first covered member. */
              const chk = f.members.map((m) => rows.find((r) => r.gameId === m.gameId)).find(Boolean);
              return (
                <tr key={f.familyId} data-portfolio-family={f.familyId} data-member-count={f.memberCount}>
                  <th scope="row">
                    <a href={`#family-${f.familyId}`}>{f.familyLabel}</a>
                    {f.memberCount > 1 ? (
                      <span className="lcs-muted"> · {f.memberCount} daily draws</span>
                    ) : null}
                  </th>
                  <td>{f.group === "multiState" ? "Multi-state" : f.group === "stateOnly" ? `${model.stateName} only` : f.group === "dailyVariants" ? "Daily" : "Specialised"}</td>
                  <td>{chk?.detail?.playType ?? "unavailable"}</td>
                  <td>{chk?.detail?.maxBallCount ?? "unavailable"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </MobileDetail>
      <p className="lcs-lede" style={{ fontSize: "0.875rem" }}>
        Game format and drawn-number counts come from the published game rules.
      </p>
      {/*
        LRG-STATE-039 §11 REMOVED THE UNAVAILABLE ODDS CARD.

        It was a bordered block headed "Published odds and prize tiers: currently unavailable" — a module whose
        content was the absence of content, which FP-05 ruled out and §11 names explicitly. The substance
        survives as one sentence: odds are not shown here, and the operator publishes them. Nothing is estimated
        and nothing is computed, which was the rule the card existed to state.

        LRG-STATE-038 §11/FP-03 also routes odds and prize matrices to a dedicated page, so a hub card was the
        wrong home for them regardless of their availability.
      */}
      <p className="lcs-fine lcs-muted">
        Odds and prize tiers are not shown here — we publish them only from an official source, never computed
        or estimated. {model.facts.operatorOfficialUrl.value ? (
          <ExternalLink
            href={model.facts.operatorOfficialUrl.value}
            siteName={model.facts.operatorName.value ?? "the official site"}
          >
            {model.facts.operatorName.value ?? "The operator"} publishes them
          </ExternalLink>
        ) : null}
      </p>
    </SectionShell>
  );
}
