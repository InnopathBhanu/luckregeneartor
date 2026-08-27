/*
 * LRG-STATE-025 sections: the shared AI answer surface (S-03), upcoming draws (S-04), what changed (S-09)
 * and history/tools (S-10).
 *
 * Authority: FD-X-08 (one persistent entry, contextual Explain, precomposed prompts, ONE shared answer
 * surface, deterministic handoffs, no chatbot per section); FD-X-09 (local-only last-visit, deterministic
 * "what changed", nothing fabricated); FD-X-10 (statistics subordinate and non-predictive); FD-X-02 (the
 * hub summarises and routes to depth); FD-S-17 (ticket comparison is deterministic, never AI).
 *
 * NOTHING HERE IS FLORIDA-SPECIFIC ARCHITECTURE (FD-X-01). Every section reads the resolved model, so any
 * jurisdiction supplying the same governed facts renders the same way.
 */

import { section } from "@/lib/state/sectionManifest";
import { weeklyDrawSchedule } from "@/lib/state/weeklyDrawSchedule";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";
import { SectionShell, Unavailable, MobileDetail, ExternalLink } from "./StateCommon";
import StateAiSurface from "../StateAiSurface";
import StateWhatChanged from "../StateWhatChanged";

/* ------------------------------------------------------------------ S-03 */

/**
 * S-03 — State AI brief and THE single shared answer surface.
 *
 * FD-X-08 approves exactly one answer surface for the whole page. Every contextual `Explain` action
 * elsewhere targets this one region, so there is one place to label, ground and announce — and no
 * per-section chatbot.
 *
 * NO LIVE SERVICE. No AI is connected in this preview and no answer is fabricated. The surface shows the
 * selected question, the grounding sources that answer would be restricted to, and an explicit
 * not-connected state. That is the honest version of this interaction.
 */
export function SectionS03({ model }: { model: StatePreviewModel }) {
  const entry = section("S-03");
  return (
    /* LRG-STATE-031 §8. Founder review of V1 reported the AI experience as ABSENT. It was present and
       correct, and it was invisible: an unstyled paragraph plus a row of small grey chips, sitting in the
       same visual weight as every other section. Being technically present is not the same as being
       discoverable.
       The module is now an accented panel with its own identity, so the reader can see there is an AI
       experience here without reading the copy first. Nothing about the interaction's honesty changed: it is
       still one shared surface, still clearly labelled, still connected to no service, and it still
       fabricates no answer. */
    <SectionShell
      entry={entry}
      heading={`Ask LotteryCorner AI about ${model.stateName}`}
      headingId="state-ai-brief"
      variant="ai"
    >
      <StateAiSurface
        stateName={model.stateName}
        operatorName={model.facts.operatorName.value ?? "the official operator"}
        resultSource={model.manifest.resultSource.value ?? "the production results feed"}
        lastUpdated={model.freshness.lastUpdatedIso ?? null}
        timezoneLabel={model.manifest.displayTimezoneLabel.value ?? "ET"}
        howToClaimUrl={model.manifest.operatorHowToClaimUrl.value ?? null}
        /* The jurisdiction's own drawn add-on, read from the results this page actually renders — Florida's
           is Fireball. Derived, never hardcoded, so the prompt is correct for any state (`FD-X-01`). */
        addOnLabel={
          model.familySurfaces
            .flatMap((f) => f.members)
            .flatMap((m) => m.result?.groups ?? [])
            .find((g) => g.visualRole === "addOn")?.label ?? null
        }
        /* The page's own resolved families. Every preview answer is computed from these — never generated. */
        families={model.familySurfaces}
        daysOld={model.freshness.daysOld}
        /* LRG-STATE-047: the reader-facing purchase note for THIS State. Was a direct Florida import. */
        purchaseReaderNote={
          model.commerce.kind === "researched"
            ? model.commerce.capability.readerNote
            : model.commerce.kind === "unknown"
              ? model.commerce.readerNote
              : null
        }
      />
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ S-04 */

/**
 * S-04 — Upcoming draws and sales cutoffs.
 *
 * Unsuppressed by LRG-STATE-025: the schedule is now verified from the production database export plus the
 * operator's own published draw days (FD-X-13 prerequisite 2).
 *
 * Frequent-draw families are GROUPED (FD-X-06) — Cash Pop contributes one row carrying all five of its
 * daily draw times rather than five near-identical rows. "Drawing now" is never inferred (task §9).
 */
export function SectionS04({ model }: { model: StatePreviewModel }) {
  const entry = section("S-04");
  const st = model.sectionState["S-04"];
  const schedule = model.manifest.drawSchedule.value ?? [];
  const tz = model.manifest.displayTimezoneLabel.value ?? "ET";

  if (!st.render || schedule.length === 0) {
    return (
      <SectionShell entry={entry} heading="Upcoming draws" headingId="upcoming-draws">
        <Unavailable
          what="Draw schedule"
          reason={model.manifest.drawSchedule.source ?? "No verified schedule."}
          officialUrl={model.facts.operatorOfficialUrl.value}
          officialLabel={`${model.facts.operatorName.value ?? "Official operator"} — draw schedule`}
        />
      </SectionShell>
    );
  }

  /* One row per family. A family with several draw times lists them all in one cell. */
  const byFamily = new Map<string, typeof schedule>();
  for (const row of schedule) {
    byFamily.set(row.familyKey, [...(byFamily.get(row.familyKey) ?? []), row]);
  }

  /*
   * §B3 — THE WEEKLY VIEW, inverted from the same governed rows.
   *
   * SECTION FIT WAS VERIFIED FIRST, as the instruction required. The suggested S-08/S-08A do not fit and PF-02
   * says why: §21 is claims/taxes/anonymity, and §21A enumerates its facts (age, zone, deadline, tax, anonymity,
   * online play, help link) and exists specifically to avoid *"placing a large 'Quick Facts' table above
   * results"*. S-04's own content list is *"game/variant; time/timezone; current status"*, so this is S-04's job.
   * The correction is recorded in the implementation report; no section was invented.
   *
   * WHY IT IS ADDITIVE, not a replacement. The per-game table below answers *"when does Pick 3 draw?"*. This
   * answers *"what draws tonight?"* — Global Shell §10.3's own first State-page question — which a reader could
   * previously only answer by reading every row.
   */
  const weekly = weeklyDrawSchedule(schedule);

  return (
    <SectionShell
      entry={entry}
      heading="Upcoming draws"
      lede={`All times are ${tz}, the timezone ${model.stateName} draws are held in.`}
      headingId="upcoming-draws"
      /* §42.4/§10.5: this section's content is a projection of governed operator schedule facts, and the weekly
         view is arithmetic over them — a deterministic insight, never a model output (`FD-DAT-20`). */
      sourceClass="operatorPublished"
      intelligence="deterministic"
      libraryId="SL-U05"
    >
      {weekly.hasAny ? (
        <div className="lcs-weekly" data-weekly-schedule="true">
          <div className="lcs-tablewrap">
            <table className="lcs-table lcs-table--weekly">
              <caption>Which {model.stateName} games draw on each day of the week</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Games drawing</th>
                </tr>
              </thead>
              <tbody>
                {weekly.days.map((d) => (
                  <tr key={d.weekday} data-weekday={d.weekday} data-game-count={d.games.length}>
                    <th scope="row">{d.name}</th>
                    <td>
                      {d.games.length === 0 ? (
                        /* An honest empty day. Never "no draws" as a claim about games whose days we cannot read —
                           those are named separately below. */
                        <span className="lcs-muted">No scheduled draw</span>
                      ) : (
                        <ul className="lcs-weekly__games">
                          {d.games.map((g) => (
                            <li key={g.label}>
                              <strong>{g.label}</strong>{" "}
                              {g.times.map((t) => (
                                <span key={t} className="lcs-timechip">{t}</span>
                              ))}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/*
            Games whose draw days are not published are NAMED, not dropped and not guessed onto a day. Collapsing
            "we do not know" into "it does not draw" would let a reader conclude a game has no drawing tonight when
            the truth is that no operator source for its days exists in the repository.
          */}
          {weekly.unscheduled.length > 0 ? (
            <p className="lcs-fine lcs-muted" data-unscheduled-games={weekly.unscheduled.length}>
              Draw days are not published for {weekly.unscheduled.join(", ")}. Check the official source for those.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* §11: the full schedule is 1,600px on a 390px viewport. It collapses on mobile behind a meaningful
          summary and stays open on desktop — same markup, still in the server HTML. */}
      <MobileDetail summary="See every draw day, time and sales cutoff" count={byFamily.size}>
      <div className="lcs-tablewrap">
        <table className="lcs-table lcs-table--schedule">
          <caption>{model.stateName} draw days, draw times and ticket sales cutoffs</caption>
          <thead>
            <tr>
              <th scope="col">Game</th>
              <th scope="col">Draw days</th>
              <th scope="col">Draw time ({tz})</th>
              <th scope="col">Ticket sales close</th>
            </tr>
          </thead>
          <tbody>
            {[...byFamily.entries()].map(([key, rows]) => {
              const first = rows[0];
              return (
                <tr key={key} data-schedule-family={key} data-event-count={rows.length}>
                  <th scope="row">
                    {first.displayName.replace(/\s*\(.*\)$/, "")}
                    {rows.length > 1 ? (
                      <span className="lcs-muted"> · {rows.length} draws daily</span>
                    ) : null}
                  </th>
                  <td>{first.drawDays}</td>
                  <td>
                    {rows.map((r) => (
                      <span key={r.gameId} className="lcs-timechip">
                        {r.drawPeriod ? `${r.drawPeriod} ` : ""}
                        {r.drawTimeLocal}
                      </span>
                    ))}
                  </td>
                  <td className="lcs-muted">{first.salesCutoff ?? "Not published"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </MobileDetail>
      <p className="lcs-lede lcs-fine">
        Draw days for Powerball and Mega Millions
        are as published by the {model.facts.operatorName.value ?? "operator"}. Cutoff times are the
        published sales-close rules; always allow time before the draw.
      </p>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ S-09 */

/* ------------------------------------------------------------------ S-10 */
