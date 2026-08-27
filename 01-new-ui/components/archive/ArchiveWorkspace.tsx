"use client";

/*
 * AR-06 — THE SEARCH, FILTER AND ASK WORKSPACE — LRG-ARCHIVE-054.
 *
 * Authority: brief §8 AR-06 (*"This is one coherent workspace, not three disconnected cards"*, the public
 * control list, the Ask output requirements and *"At least one complete public answer must render without
 * requiring sign-in"*), blueprint §13, content template A8 and Template G; brief §13 (filter states create no
 * indexable crawl trap), §12 (keyboard, no sticky obstruction).
 *
 * ══ WHY THIS IS THE ONLY CLIENT COMPONENT ON THE PAGE ══
 *
 * Filtering is an interaction, so it needs state. Everything else — the complete result list, the metrics, the
 * analysis, the month links, and the complete public Ask answer — is server-rendered by `ArchiveView`, because
 * Template J requires the year's unique content to exist without JavaScript and blueprint §35 forbids a
 * history that depends on it.
 *
 * The Ask answer computed on the server is passed in and shown first. So the required *"one complete public
 * answer"* is in the initial HTML; this component only lets a reader ask a different question.
 *
 * ══ NO URL STATE, DELIBERATELY ══
 *
 * Filter state lives in React and never touches the URL. Blueprint §31 and brief §13 both require filter and
 * query states to be non-indexable, and the cheapest way to guarantee that is to give a crawler nothing to
 * follow: there is no `?month=` link to discover, so no filter combination can become a crawl trap or a
 * duplicate of the canonical year page.
 *
 * ══ THE NUMBER INPUT IS GENERATED FROM THE FORMAT ══
 *
 * One renderer, three presentations, all driven by the profile. A `digit` group is ONE contiguous field so a
 * leading zero survives — `Number("007")` is `7`, and an archive that cannot search `007` is broken for a tenth
 * of its own outcome space. A `number` group gets one field PER value, because 15 is a single value and typing
 * it into a digit field would read as a 1 and a 5. A special group is compared separately and never folded into
 * the main condition.
 */

import { useEffect, useMemo, useState } from "react";
import type {
  ArchiveDrawRow, ArchiveFilterInput, ArchiveOrderMode, ArchiveSortOrder, ArchiveViewModel, ResultShape,
} from "@/lib/archive/archiveContract";
import { defaultArchiveFilter, filterArchive } from "@/lib/archive/archiveFilter";
import { askArchive } from "@/lib/archive/archiveAsk";
import { archiveDisplayDate } from "@/lib/archive/archiveYear";
import { applyCarriedFilter, decodeCarriedFilter } from "@/lib/archive/archiveFilterCarry";
import { clearCurrentArchiveFilter, setCurrentArchiveFilter } from "@/lib/archive/archiveFilterBus";
import { useAccountSession } from "@/lib/account/useAccountSession";
import SignInToUse from "@/components/account/SignInToUse";

const ROWS_SHOWN = 12;

/**
 * `search` renders the controls and the matching-results summary; `ask` renders the question block.
 *
 * ══ WHY ONE COMPONENT IN TWO PARTS ══
 *
 * The founder order puts the search CONTROLS before the results and allows the Ask block to follow them. Both need
 * the same model and the same deterministic filter, so splitting them into two files would duplicate that wiring;
 * splitting them by prop keeps one source of truth for how a question becomes a result.
 *
 * The two parts do not share React state, and they do not need to: a filter and a question are separate ways of
 * asking, and a reader who types a number expects the table to change, not the Ask box.
 */
export default function ArchiveWorkspace({
  model,
  part = "search",
}: {
  model: ArchiveViewModel;
  part?: "search" | "ask";
}) {
  const m = model;
  /* The FD-DAT-04 gate state. Server snapshot is always anonymous (Shell §33), so the server-rendered
     HTML always carries the signed-out form with the public answer — exactly what FD-DAT-08 requires. */
  const { session } = useAccountSession();
  const main = m.profile.main;
  /* Selectable groups only. A drawn add-on is not a player choice, so it never becomes an input field — it
     participates through the "include" checkbox, which widens a match rather than constraining it. */
  const inputGroups = useMemo(() => m.profile.groups.filter((g) => g.role !== "addOn"), [m.profile.groups]);
  const addOn = m.profile.groups.find((g) => g.role === "addOn");

  /* Raw strings all the way to the parser, per group. This is what preserves a leading zero. */
  const [raw, setRaw] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(inputGroups.map((g) => [g.key, Array(g.valueType === "digit" ? 1 : g.count).fill("")])),
  );
  const [monthKey, setMonthKey] = useState<string>("");
  const [variant, setVariant] = useState<string>("all");
  const [orderMode, setOrderMode] = useState<ArchiveOrderMode>("exact");
  const [includeAddOn, setIncludeAddOn] = useState(false);
  const [shape, setShape] = useState<string>("");
  const [sumFrom, setSumFrom] = useState<string>("");
  const [sumTo, setSumTo] = useState<string>("");
  const [sort, setSort] = useState<ArchiveSortOrder>("newest");
  const [includeCorrected, setIncludeCorrected] = useState(true);
  const [searched, setSearched] = useState(false);

  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

  const setGroupRaw = (key: string, index: number, value: string) => {
    setRaw((prev) => {
      const next = { ...prev, [key]: [...(prev[key] ?? [])] };
      next[key][index] = value;
      return next;
    });
  };

  const filter: ArchiveFilterInput = useMemo(() => ({
    ...defaultArchiveFilter(),
    monthKey: monthKey || null,
    variant: variant === "all" ? "all" : { gameId: Number(variant) },
    raw,
    orderMode,
    includeAddOn,
    shape: (shape || null) as ResultShape | null,
    sumFrom: sumFrom.trim() === "" ? null : Number(sumFrom),
    sumTo: sumTo.trim() === "" ? null : Number(sumTo),
    sort,
    includeCorrected,
  }), [monthKey, variant, raw, orderMode, includeAddOn, shape, sumFrom, sumTo, sort, includeCorrected]);

  const result = useMemo(
    () => filterArchive(m.rows, m.profile, filter),
    [m.rows, m.profile, filter],
  );

  /*
   * The Ask answer.
   *
   * The server-computed answer is shown until the reader asks something else. Recomputed with the SAME
   * deterministic function the server used, so the client cannot produce a different count for the same
   * question — the property that makes "deterministic code performs the search" true rather than aspirational.
   */
  const answer = useMemo(
    () => (askedQuestion === null
      ? m.askAnswer
      : askArchive(askedQuestion, m.rows, m.profile, m.members, m.archiveYear, `${m.stateName} ${m.gameLabel}`)),
    [askedQuestion, m.askAnswer, m.rows, m.profile, m.members, m.archiveYear, m.stateName, m.gameLabel],
  );

  /*
   * ---- restore a filter carried in from another year ----
   *
   * The year links append `#f=<encoded>`, so a reader who searched `378` in one year still has it after switching.
   * `applyCarriedFilter` drops what cannot survive: a month that holds no drawings in THIS year, and a variant this
   * family does not have. Runs once on mount — a fragment is a starting point, not a binding.
   */
  useEffect(() => {
    const carried = decodeCarriedFilter(window.location.hash);
    if (Object.keys(carried).length === 0) return;

    const availableMonths = m.months.filter((x) => x.valid && x.drawCount > 0).map((x) => x.month);
    const memberIds = m.members.map((x) => x.gameId);
    const { carried: kept, monthKey: destMonth } = applyCarriedFilter(
      carried, m.archiveYear, availableMonths, memberIds,
    );

    if (kept.raw) setRaw((prev) => ({ ...prev, ...kept.raw }));
    if (kept.orderMode) setOrderMode(kept.orderMode);
    if (kept.variant) setVariant(kept.variant);
    if (kept.shape) setShape(kept.shape);
    if (kept.sumFrom) setSumFrom(kept.sumFrom);
    if (kept.sumTo) setSumTo(kept.sumTo);
    if (kept.sort) setSort(kept.sort);
    /* The month is remapped to this year, or dropped when unavailable — never carried as a stale `YYYY-MM`. */
    setMonthKey(destMonth ?? "");
    if (kept.raw || kept.shape || kept.variant) setSearched(true);
    /* Mount only: re-running on filter changes would fight the reader's own edits. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ---- publish the live filter for the year navigation ----
   *
   * Written on every change so a year link built at click time carries the current state. Deliberately not in the
   * URL: blueprint §31 forbids an indexable filter state, and a fragment is invisible to crawling.
   */
  useEffect(() => {
    setCurrentArchiveFilter({
      raw, orderMode, variant, shape, sumFrom, sumTo, sort,
      month: monthKey ? Number(monthKey.slice(5, 7)) : undefined,
    });
  }, [raw, orderMode, variant, shape, sumFrom, sumTo, sort, monthKey]);

  const hasVariants = m.members.some((x) => x.variantLabel);
  const shapesAvailable = main?.semantics.repeatsAllowed === true && main.count > 1;
  const sumsAvailable = m.rows.some((r) => r.sum !== null);

  /*
   * ══ THE RESTORED ASK SURFACE (`FD-DAT-16`'s own condition, met by Conflict 37) ══
   *
   * This branch was retained un-rendered as the restoration point `FD-DAT-16` describes; `ArchiveView`
   * composes it again because the ruling's condition — "the real shared Account and sign-in continuation flow
   * works end to end" — is now true (Conflict 37, 2026-08-11). The `FD-DAT-04` visible-gate form:
   *
   *   - SIGNED OUT: everything is visible in its final position (`FD-DAT-03`) — the chips, the input, and the
   *     one complete public answer the server computed (`FD-DAT-08`). Executing a NEW question is the gated
   *     act (`FD-DAT-02`), so the submit affordance is the shared `SignInToUse` control, which captures
   *     state, game, archive year and the typed question in an `FD-ACC-12` intent (nonce-only URL). Chips
   *     fill the input without executing. Adjacent copy says what asking does and that an account is free —
   *     never a plan, tier, trial or upgrade (`FD-DAT-06`).
   *   - SIGNED IN: `askArchive` executes end to end, deterministically. Per `FD-DAT-20`'s reasoning these
   *     answers are never labelled AI — no model produced them, and claiming one would misdescribe the page.
   *   - On return from sign-in the intent lands as `prepared` (`FD-DAT-16` point 6): the reader confirms by
   *     asking — nothing auto-executes.
   *
   * `FD-DAT-12` metering is server work, recorded API-phase in Conflict 37. No allowance, ledger or limit
   * error is faked here (`FD-DAT-18` forbids client constants for those values anyway).
   */
  if (part === "ask") {
    const askIntentContext = {
      class: "prepared",
      stateCode: m.stateCode,
      gameSlug: m.gameSlug,
      year: String(m.archiveYear),
      query: question.trim(),
    };
    return (
      <div className="lca-ask" data-account-gated={session ? "signed-in" : "signed-out"}>
        <p className="lcg-fine lcg-muted">Answers are based on the results in this archive.</p>

        <ul className="lcg-chips">
          {m.askPrompts.map((p) => (
            <li key={p}>
              {/* Signed out, a chip FILLS the input (no execution — FD-DAT-02); signed in, it asks. */}
              <button
                className="lcg-chip"
                type="button"
                onClick={() => { setQuestion(p); if (session) setAskedQuestion(p); }}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>

        <form
          className="lca-askform"
          onSubmit={(e) => { e.preventDefault(); if (session) setAskedQuestion(question.trim() || null); }}
        >
          <label htmlFor="af-question">Your question</label>
          <input
            id="af-question"
            type="text"
            autoComplete="off"
            placeholder={`Ask about ${m.gameLabel} results in ${m.archiveYear}…`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {session ? (
            <button className="lcg-btn lcg-btn--primary" type="submit">Ask</button>
          ) : (
            /* FD-DAT-04: the shared affordance, exact wording, real flow, intent captured on click. */
            <SignInToUse
              className="lcg-btn lcg-btn--primary"
              intent={{
                returnTo: `${m.gameHref}/${m.archiveYear}#ar-03`,
                action: "archive-ask",
                label: `Ask about ${m.gameLabel} results in ${m.archiveYear}`,
                kind: "private",
                context: askIntentContext,
              }}
            />
          )}
        </form>
        {!session ? (
          <p className="lcg-fine lcg-muted">
            Asking your own question is free with a LotteryCorner account. The answer below is computed from
            this archive and stays public.
          </p>
        ) : null}

        {/* The required output: what was understood, how many matched, the rows, and the explanation. */}
        <div className="lca-askanswer" aria-live="polite">
          <p className="lca-askanswer__q">
            <span className="lcg-muted">Question:</span> {answer.question}
          </p>
          <dl className="lcg-facts lca-facts--tight">
            <div className="lcg-fact">
              <dt>Understood as</dt>
              <dd>{answer.interpretation.map((i) => `${i.label}: ${i.value}`).join(" · ")}</dd>
            </div>
            <div className="lcg-fact">
              <dt>Matching drawings</dt>
              <dd>{answer.matchingCount}</dd>
            </div>
          </dl>
          <p className="lca-answer__statement">{answer.explanation}</p>

          {answer.rows.length > 0 ? (
            <MatchTable rows={answer.rows} total={answer.matchingCount} model={m} />
          ) : null}

          {answer.suggestions.length > 0 ? (
            <ul className="lcg-fine">
              {answer.suggestions.map((sug) => <li key={sug}>{sug}</li>)}
            </ul>
          ) : null}

          {answer.evidence.length > 0 ? (
            <p className="lcg-fine">
              {answer.evidence.map((e, i) => (
                <span key={e.href}>
                  {i > 0 ? " · " : null}
                  <a href={e.href}>{e.label}</a>
                </span>
              ))}
            </p>
          ) : null}

          <p className="lcg-fine lcg-muted">{answer.neutrality}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lca-workspace">
      {/* ─────────────────────────────── filters and number search */}
      <form
        className="lca-form"
        data-tool="archive-search"
        data-search-kind={m.profile.searchKind}
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
        }}
      >
        <div className="lca-fieldrow">
          {inputGroups.map((g) => (
            <div className="lca-field" key={g.key}>
              <label htmlFor={`af-${g.key}-0`}>
                {g.label ?? (main?.valueType === "digit" ? "Number" : "Numbers")}
              </label>
              {g.valueType === "digit" ? (
                <input
                  id={`af-${g.key}-0`}
                  className="lca-numberinput"
                  /* `text`, not `number`: a number input strips a leading zero before the parser ever sees it. */
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern={`[0-9]{${g.count}}`}
                  maxLength={g.count}
                  placeholder={"0".repeat(g.count)}
                  aria-describedby={`af-${g.key}-hint`}
                  value={raw[g.key]?.[0] ?? ""}
                  onChange={(e) => setGroupRaw(g.key, 0, e.target.value.replace(/[^0-9]/g, "").slice(0, g.count))}
                />
              ) : (
                <span className="lca-numbers" role="group" aria-labelledby={`af-${g.key}-label`}>
                  <span className="lcs-vh" id={`af-${g.key}-label`}>{g.accessibleLabel}</span>
                  {Array.from({ length: g.count }, (_, i) => (
                    <span key={i}>
                      <label className="lcs-vh" htmlFor={`af-${g.key}-${i}`}>
                        {g.accessibleLabel} value {i + 1}
                      </label>
                      <input
                        id={`af-${g.key}-${i}`}
                        className="lca-numbox"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={String(g.max).length}
                        placeholder="–"
                        value={raw[g.key]?.[i] ?? ""}
                        onChange={(e) =>
                          setGroupRaw(g.key, i, e.target.value.replace(/[^0-9]/g, "").slice(0, String(g.max).length))
                        }
                      />
                    </span>
                  ))}
                </span>
              )}
              <span id={`af-${g.key}-hint`} className="lcg-fine lcg-muted">
                {g.valueType === "digit"
                  ? `All ${g.count} digits, ${g.min}–${g.max}. Leading zeros count — 007 and 700 are different results.`
                  : g.count === 1
                    ? `One number from ${g.min} to ${g.max}.`
                    : `${g.count} different numbers from ${g.min} to ${g.max}.`}
              </span>
              {result.errors[g.key] ? (
                <span className="lca-fielderror" role="alert">{result.errors[g.key]}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="lca-controls">
          {/* Exact / any order only where order is a real distinction in this game's rules. */}
          {main?.semantics.matchOrdered ? (
            <fieldset className="lca-segmented">
              <legend>Match mode</legend>
              {(["exact", "any"] as const).map((mode) => (
                <label key={mode}>
                  <input
                    type="radio"
                    name="af-order"
                    value={mode}
                    checked={orderMode === mode}
                    onChange={() => setOrderMode(mode)}
                  />
                  <span>{mode === "exact" ? "Exact order" : "Any order"}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {hasVariants ? (
            <fieldset className="lca-segmented">
              <legend>Drawing</legend>
              <label>
                <input type="radio" name="af-variant" value="all" checked={variant === "all"} onChange={() => setVariant("all")} />
                <span>Both</span>
              </label>
              {/* Ordered by the family's configured `memberOrder`, never alphabetically. */}
              {[...m.members].sort((a, b) => a.memberOrder - b.memberOrder).filter((x) => x.variantLabel).map((x) => (
                <label key={x.gameId}>
                  <input
                    type="radio"
                    name="af-variant"
                    value={String(x.gameId)}
                    checked={variant === String(x.gameId)}
                    onChange={() => setVariant(String(x.gameId))}
                  />
                  <span>{x.variantLabel}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          <div className="lca-control">
            <label htmlFor="af-month">Month</label>
            <select id="af-month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
              <option value="">Whole year</option>
              {m.months.filter((mo) => mo.valid && mo.drawCount > 0).map((mo) => (
                <option key={mo.monthKey} value={mo.monthKey}>{mo.label} ({mo.drawCount})</option>
              ))}
            </select>
          </div>

          {shapesAvailable ? (
            <div className="lca-control">
              <label htmlFor="af-shape">Pattern</label>
              <select id="af-shape" value={shape} onChange={(e) => setShape(e.target.value)}>
                <option value="">Any pattern</option>
                <option value="allDifferent">All different</option>
                <option value="double">Contains a double</option>
                <option value="triple">Every value the same</option>
              </select>
            </div>
          ) : null}

          {sumsAvailable ? (
            <div className="lca-control lca-control--range">
              <span className="lca-control__label" id="af-sum-label">Sum range</span>
              <span role="group" aria-labelledby="af-sum-label">
                <label className="lcs-vh" htmlFor="af-sumfrom">Lowest sum</label>
                <input id="af-sumfrom" className="lca-numbox" type="text" inputMode="numeric" placeholder="from"
                  value={sumFrom} onChange={(e) => setSumFrom(e.target.value.replace(/[^0-9]/g, ""))} />
                <label className="lcs-vh" htmlFor="af-sumto">Highest sum</label>
                <input id="af-sumto" className="lca-numbox" type="text" inputMode="numeric" placeholder="to"
                  value={sumTo} onChange={(e) => setSumTo(e.target.value.replace(/[^0-9]/g, ""))} />
              </span>
            </div>
          ) : null}

          <div className="lca-control">
            <label htmlFor="af-sort">Order</label>
            <select id="af-sort" value={sort} onChange={(e) => setSort(e.target.value as ArchiveSortOrder)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {addOn ? (
            <label className="lca-check">
              <input type="checkbox" checked={includeAddOn} onChange={(e) => setIncludeAddOn(e.target.checked)} />
              <span>Include {addOn.label} as a replacement value</span>
            </label>
          ) : null}

          {/*
            A filter for corrected results exists only when a corrected result exists.
            
            The V0 showed it unconditionally, so a reader met a control for a state the archive did not contain —
            which teaches the wrong thing about the data. `hasPublishedCorrection` is true only for a genuine,
            sourced correction, so today this control is absent.
          */}
          {m.hasPublishedCorrection ? (
            <label className="lca-check">
              <input type="checkbox" checked={includeCorrected} onChange={(e) => setIncludeCorrected(e.target.checked)} />
              <span>Include corrected results</span>
            </label>
          ) : null}
        </div>

        <div className="lca-formactions">
          <button className="lcg-btn lcg-btn--primary" type="submit">Search</button>
          <button
            className="lcg-btn"
            type="button"
            onClick={() => {
              setRaw(Object.fromEntries(inputGroups.map((g) => [g.key, Array(g.valueType === "digit" ? 1 : g.count).fill("")])));
              setMonthKey(""); setVariant("all"); setOrderMode("exact"); setIncludeAddOn(false);
              setShape(""); setSumFrom(""); setSumTo(""); setSort("newest"); setIncludeCorrected(true);
              setSearched(false);
              /* A reset filter must not be carried into another year. */
              clearCurrentArchiveFilter();
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* ─────────────────────────────── filter results */}
      {/*
        THE MATCHING-RESULTS SUMMARY.

        Step 6 of the founder's hierarchy, between the controls and the results. Always present — before a search
        it states what the unfiltered year contains, so the count a reader sees always describes what is below it.
      */}
      <div className="lca-answer" role="status" aria-live="polite">
        <p className="lca-answer__statement">{result.statement}</p>
        {searched && result.rows.length > 0 ? (
          <MatchTable rows={result.rows.slice(0, ROWS_SHOWN)} total={result.rows.length} model={m} />
        ) : null}
        {searched && result.rows.length === 0 && Object.keys(result.errors).length === 0 ? (
          <p className="lcg-fine">
            No drawing in this archive year matched those conditions. Try removing one condition or choosing the
            whole year.
          </p>
        ) : null}
      </div>

    </div>
  );
}

/**
 * The matching-rows table.
 *
 * Deliberately the same columns as AR-05 minus the actions, so a reader comparing a search result with the full
 * list is comparing like with like. `total` is always the true count, so a capped display never understates the
 * answer.
 */
function MatchTable({
  rows, total, model,
}: {
  rows: readonly ArchiveDrawRow[];
  total: number;
  model: ArchiveViewModel;
}) {
  const addOn = model.profile.groups.find((g) => g.role === "addOn");
  const hasShapes = rows.some((r) => r.shape !== "notApplicable");
  const hasSums = rows.some((r) => r.sum !== null);
  const hasVariants = model.members.some((x) => x.variantLabel);

  return (
    <>
      <div className="lcg-tablewrap" tabIndex={0} role="group" aria-label="Matching drawings">
        <table className="lcg-table lcg-table--tight">
          <caption className="lcs-vh">
            Matching drawings. {rows.length} of {total} shown.
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              {hasVariants ? <th scope="col">Drawing</th> : null}
              <th scope="col">Result</th>
              {/* The add-on rides inline with the values, exactly as it does in the full table — a column of its
                  own would read as an extra winning digit in both places. */}
              {hasShapes ? <th scope="col">Pattern</th> : null}
              {hasSums ? <th scope="col">Sum</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.anchorId}>
                <th scope="row">
                  <a href={`#${r.anchorId}`}>
                    <time dateTime={r.drawDateIso}>{archiveDisplayDate(r.drawDateIso)}</time>
                  </a>
                </th>
                {hasVariants ? <td>{r.variantLabel || "Main"}</td> : null}
                <td className="lcg-numcell">
                  {r.groups.filter((g) => g.role === "main").map((g) => g.values.join(" · ")).join(" ")}
                  {addOn ? (
                    <span className="lca-addon">
                      {addOn.label}:{" "}
                      {r.addOnValue !== null
                        ? <b className="lca-addon__value">{r.addOnValue}</b>
                        : <span className="lcg-muted">—</span>}
                    </span>
                  ) : null}
                </td>
                {hasShapes ? (
                  <td>
                    {r.shape === "allDifferent" ? "All different"
                      : r.shape === "double" ? "Double"
                      : r.shape === "triple" ? "Triple" : "—"}
                  </td>
                ) : null}
                {hasSums ? <td className="lcg-numcell">{r.sum ?? "—"}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length < total ? (
        <p className="lcg-fine lcg-muted">
          Showing the first {rows.length} of {total}. Narrow the month or the conditions to see fewer.
        </p>
      ) : null}
    </>
  );
}
