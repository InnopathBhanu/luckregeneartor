/*
 * THE SHARED FLAGSHIP GAME HUB — LRG-FLAGSHIP-002.
 *
 * Authority: BP-04A §12 (the anonymous section sequence), §11 (the internal anchor contract), §15–§29,
 * §39 (server-visible content), `CLAUDE.md` §9 (all applicable page states; WCAG 2.2 AA).
 *
 * ══ ONE RENDERER, TWO PAGES ══
 *
 * `/powerball` and `/mega-millions` render THIS component. There is no game branch anywhere in
 * `components/flagship/**`: the number matrix, the draw rhythm, how the multiplier is obtained, whether a
 * secondary drawing exists, which tools lead and which tag the content rails carry are all read from the model.
 * The two pages differ because their configuration differs.
 *
 * ══ THE ORDER IS THE FOUNDER'S REVISION OF THE BLUEPRINT'S — CORRECTED, §A5 ══
 *
 * This comment used to read *"`model.order` is BP-04A §12 verbatim."* It has not been true since LRG-FLAGSHIP-004.
 * `FLAGSHIP_SECTION_ORDER` is the active founder order, which differs from §12 in two substantive ways and says so
 * at length in `flagshipContract.ts`:
 *
 *   1. **The sequence is re-ordered** around the five jobs the instruction names — Check, Explore, Build, Follow,
 *      Ask AI — because the §12 stacking read as *"many separate white boxes stacked one after another"*. AI moves
 *      to second, since every contextual chip on the page targets that one region.
 *   2. **Five ids are MERGED into a neighbour** rather than owning a box: FG-14→FG-09, FG-11→FG-13, FG-12→FG-13,
 *      FG-06→FG-05, FG-10→FG-15. FG-04 stays merged into the hero and the Stats Lab.
 *
 * An explicit founder instruction is tier 1 in `CLAUDE.md` §2, above the tier-4 blueprint, and the deviation is
 * recorded in `source-conflicts.md` Conflict 31 — so the ORDER was never the defect. The comment was, and a comment
 * that misstates which authority a file implements is worse than no comment: it is the first thing the next reader
 * trusts. `flagshipContract.ts` is the single place the sequence and its justification live; this file walks it.
 *
 * The five `AD-FG*` anchors resolve to nothing — no flagship ad profile is captured or approved — so they reserve no
 * geometry and introduce no layout shift, and the suppression reason travels in `data-suppressed-sections`.
 *
 * ══ WHY THERE IS NO BUY BUTTON ══
 *
 * BP-04A §5 routes purchase through `/play/{game}`, and `CLAUDE.md` §10 records that reconciling `/play` with the
 * live `/buynow/{code}` REQUIRES the URL audit and founder approval. §13 additionally requires purchase
 * eligibility to be deterministic and state-aware, resolved from page context first — and a national hub has no
 * jurisdiction context to resolve from. Coarse IP MAY NEVER independently determine eligibility. So this page
 * renders BP-04A §6's `BUY_HIDDEN_UNSUPPORTED` state, explained in FG-10, and changes no commerce route.
 */

import Image from "next/image";
import type { FlagshipPageModel } from "@/lib/flagship/flagshipPageModel";
import { FLAGSHIP_ANCHORS, type FlagshipSectionId } from "@/lib/flagship/flagshipContract";
import { flagshipPageGraph } from "@/lib/flagship/flagshipSchema";
import { aiSurfacesFor } from "@/lib/flagship/flagshipAi";
import { ENGAGEMENT_LOCKED_NOTE, engagementIntent } from "@/lib/flagship/flagshipEngagement";
import { gameLogo } from "@/lib/preview/gameLogoRegistry";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";
import { StateBallGroup } from "@/components/state/preview/sections/StateResultGrammar";
import { Breadcrumbs, LastUpdated, UniversalSection } from "@/components/shell/SectionChrome";
import NextDrawRelative from "@/components/shell/NextDrawRelative";
import ResultExitRamps from "@/components/shell/ResultExitRamps";

import FlagshipAiConsole, { FlagshipAskChip } from "@/components/flagship/tools/FlagshipAiConsole";
import FlagshipConsoleProvider from "@/components/flagship/tools/FlagshipConsole";
import FlagshipCheckerSection from "@/components/flagship/tools/FlagshipCheckerSection";
import FlagshipGeneratorSection from "@/components/flagship/tools/FlagshipGeneratorSection";
import FlagshipExplorerSection from "@/components/flagship/tools/FlagshipExplorerSection";
import FlagshipStatsSection from "@/components/flagship/tools/FlagshipStatsSection";
import FlagshipJackpotTracker from "@/components/flagship/tools/FlagshipJackpotTracker";
import { FlagshipTaggedContent, FlagshipTrust } from "@/components/flagship/sections/FlagshipEcosystem";
import { FlagshipHowToPlay } from "@/components/flagship/sections/FlagshipRules";
import { CHECKER_LOCKS, GENERATOR_LOCKS, STATS_LOCKS } from "@/lib/flagship/flagshipTools";
import { drawNightsOf } from "@/lib/flagship/flagshipHistory";
import type { ConsoleSectionProps } from "@/components/flagship/tools/consoleSectionProps";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

/**
 * The sections that render inside the console band.
 *
 * The five jobs the founder's revision names — Check, Explore, Build, Follow, Ask AI — plus the result they all
 * act on. Everything outside this set is reference matter: prizes, rules, trust and the tagged content module.
 */
const CONSOLE_BAND: readonly FlagshipSectionId[] = Object.freeze([
  "FG-01", "FG-03", "FG-02", "FG-09", "FG-07A", "FG-08", "FG-07B",
]);

/* ------------------------------------------------------------------ action icons */

/**
 * The five primary actions carry a mark each.
 *
 * Inline SVG rather than an icon font or emoji: it inherits `currentColor`, so one glyph works on the filled
 * primary, the outline secondaries and the dashed locked action without a second asset; it needs no network
 * request; and it renders identically on every platform, which emoji does not. `aria-hidden` throughout — the
 * label beside it is the accessible name, and a decorative mark must not be announced twice.
 */
function ActionIcon({ name }: { name: "check" | "search" | "build" | "ask" | "follow" }) {
  const paths: Record<string, React.ReactNode> = {
    check: <path d="M3 8.5l3.5 3.5L13 4" />,
    search: (
      <>
        <circle cx="7" cy="7" r="4.25" />
        <path d="M10.2 10.2L14 14" />
      </>
    ),
    build: (
      <>
        <path d="M8 2.5v11M2.5 8h11" />
      </>
    ),
    ask: (
      <>
        <path d="M8 1.8l1.5 3.9 3.9 1.5-3.9 1.5L8 12.6 6.5 8.7 2.6 7.2l3.9-1.5z" />
      </>
    ),
    follow: (
      <>
        <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
        <path d="M5.75 7V5a2.25 2.25 0 014.5 0v2" />
      </>
    ),
  };
  return (
    <svg
      className="lcfg-btn__icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ landmark */

/**
 * A `<main>` only when nothing above it already is one.
 *
 * `app/layout.tsx` wraps `children` in `<main>` in its non-home-preview branch, so an unconditional landmark here
 * would produce a second, nested one — a WCAG 2.2 defect (1.3.1 / 4.1.2) and an ambiguous skip-link target. The
 * jurisdiction Game Page carries the same fix for the same reason.
 */
function Landmark({
  id, className, suppressLandmark, children,
}: {
  id: string;
  className: string;
  suppressLandmark: boolean;
  children: React.ReactNode;
}) {
  if (suppressLandmark) {
    return (
      <div id={id} className={className} tabIndex={-1}>
        {children}
      </div>
    );
  }
  return (
    <main id={id} className={className}>
      {children}
    </main>
  );
}

/* ------------------------------------------------------------------ section navigation */

/** BP-04A §11's anchors, as a real in-page navigation. Only sections that actually render are listed. */
function SectionNav({ model }: { model: FlagshipPageModel }) {
  const items: { id: FlagshipSectionId; href: string; label: string }[] = ([
    { id: "FG-01", href: FLAGSHIP_ANCHORS.latestResult, label: "Result" },
    { id: "FG-03", href: FLAGSHIP_ANCHORS.askAi, label: "Ask AI" },
    { id: "FG-02", href: FLAGSHIP_ANCHORS.checkNumbers, label: "Check" },
    { id: "FG-09", href: FLAGSHIP_ANCHORS.jackpotHistory, label: "Jackpot & alerts" },
    { id: "FG-07A", href: FLAGSHIP_ANCHORS.generator, label: "Build" },
    { id: "FG-08", href: FLAGSHIP_ANCHORS.resultsHistory, label: "Explore history" },
    { id: "FG-07B", href: FLAGSHIP_ANCHORS.statsLab, label: "Stats" },
    { id: "FG-13", href: FLAGSHIP_ANCHORS.community, label: "Discussions" },
    { id: "FG-05", href: FLAGSHIP_ANCHORS.prizesAndOdds, label: "Odds & rules" },
    { id: "FG-15", href: FLAGSHIP_ANCHORS.trust, label: "Trust" },
  ] satisfies { id: FlagshipSectionId; href: string; label: string }[]).filter((i) =>
    model.visibleSections.includes(i.id),
  );

  return (
    <nav className="lcfg-sectionnav" aria-label={`${model.config.gameLabel} sections`}>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.href}`}>{i.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ FG-01 */

function Hero({ model }: { model: FlagshipPageModel }) {
  const { config, result, freshness } = model;
  const logo = gameLogo(config.visualIdentity);
  const main = config.groups.find((g) => g.role === "main");
  const special = config.groups.find((g) => g.role === "special");
  const chips = aiSurfacesFor(model.ai, "FG-01");

  return (
    <section
      className="lcfg-section lcfg-hero"
      data-section-id="FG-01" {...sectionAuditAttributes("flagship", "FG-01")}
      id={FLAGSHIP_ANCHORS.latestResult}
      data-result-state={freshness.state}
      aria-labelledby="lcfg-h1"
    >
      <div className="lcfg-hero__identity">
        {logo ? (
          <Image
            className="lcfg-logo"
            src={logo.src}
            alt={`${config.gameLabel} logo`}
            width={logo.width}
            height={logo.height}
            priority
          />
        ) : null}
        <div>
          <h1 className="lcfg-h1" id="lcfg-h1">
            {config.seo.h1}
          </h1>
          <p className="lcfg-hero__matrix">
            {main ? (
              <>
                {main.count} numbers from {main.min}–{main.max}
                {special ? ` plus a ${special.label} from ${special.min}–${special.max}` : ""}
              </>
            ) : null}
            <span className="lcfg-dot" aria-hidden="true">
              ·
            </span>
            drawn {config.drawDays.value} at {config.drawTimeEt.value}
          </p>
        </div>
      </div>

      {result ? (
        <div className="lcfg-hero__grid">
          <div className="lcfg-hero__result">
            {/* Draw date and game are announced BEFORE the values — `CLAUDE.md` §9. */}
            <p className="lcfg-hero__drawdate">
              <span className="lcfg-hero__drawlabel">Winning numbers</span>
              <strong>{result.drawDateDisplay}</strong>
              {result.drawTimeLocal ? <span className="lcfg-muted"> · {result.drawTimeLocal} ET</span> : null}
            </p>

            <div
              className="lcfg-result"
              role="group"
              aria-label={`${config.gameLabel} winning numbers for ${result.drawDateDisplay}`}
            >
              {result.groups.map((g) => (
                <StateBallGroup key={g.label ?? "main"} group={g} gameName={config.gameLabel} />
              ))}
            </div>

            {result.multiplier ? (
              <p className="lcfg-mult" data-multiplier-mode={result.multiplier.mode}>
                <span className="lcs-mult" data-multiplier-kind={result.multiplier.mode}>
                  {result.multiplier.label} {result.multiplier.value}X
                  <span className="lcs-mult__how">{" · if selected"}</span>
                </span>
              </p>
            ) : config.multiplier.mode === "builtIn" ? (
              /* Mega Millions. BP-04A §46 names a draw-level current Mega Millions multiplier as a guardrail
                 violation, so the absence is EXPLAINED here rather than left as a missing element. */
              <p className="lcfg-fine lcfg-muted" data-multiplier-mode="builtIn">
                No multiplier is shown beside the numbers: the {config.multiplier.label.toLowerCase()} is assigned
                to each play when the ticket is bought, and it is printed on the ticket.
              </p>
            ) : null}

            {/*
              THE FIVE JOBS — Check · Explore · Build · Ask · Follow.

              Placed directly under the drawn numbers and their multiplier, ABOVE the secondary drawing.

              FGP-004 measured them at y=742 on mobile, 228px tall, ending at 970 — past the 812 fold. Powerball
              showed one of five, because its Double Play block sat between the numbers and the actions; Mega
              Millions, which has no such block, showed four. Moving the actions above the secondary drawing
              fixes the Powerball case at its cause and makes the two pages behave alike.

              The reorder is in the DOM, not in CSS `order`: visual, DOM and focus order stay identical, which a
              flex-order swap would have broken (WCAG 2.4.3).
            */}
            {/*
              Three visual tiers, so the row can be scanned rather than read: one filled primary, three outline
              secondaries, one dashed locked action. `data-tier` carries the tier to CSS, so the hierarchy is
              declared here rather than inferred from class-name order.
            */}
            <div className="lcfg-heroactions" data-primary-actions="5">
              <a className="lcfg-btn lcfg-btn--primary" data-tier="primary" href={`#${FLAGSHIP_ANCHORS.checkNumbers}`}>
                <ActionIcon name="check" />
                Check my ticket
              </a>
              <a className="lcfg-btn" data-tier="secondary" href={`#${FLAGSHIP_ANCHORS.resultsHistory}`}>
                <ActionIcon name="search" />
                Search history
              </a>
              <a className="lcfg-btn" data-tier="secondary" href={`#${FLAGSHIP_ANCHORS.generator}`}>
                <ActionIcon name="build" />
                Build numbers
              </a>
              {chips.slice(0, 1).map((c) => (
                /* Short label for the action row — the full question stays on the chip in the AI console. */
                <FlagshipAskChip
                  key={c.key}
                  surfaceKey={c.key}
                  label="Ask AI"
                  anchor={`#${FLAGSHIP_ANCHORS.askAi}`}
                  tier="secondary"
                  icon={<ActionIcon name="ask" />}
                />
              ))}
              <a className="lcfg-btn lcfg-btn--locked" data-tier="locked" href={`#${FLAGSHIP_ANCHORS.alerts}`}>
                <ActionIcon name="follow" />
                Follow &amp; alerts
              </a>
            </div>

            {result.secondary ? (
              <div className="lcfg-secondary" data-secondary-draw={result.secondary.label}>
                {/* One line in the hero. The full timing note is in the odds section and the FAQ. */}
                <h3 className="lcfg-h4">
                  {result.secondary.label}
                  <span className="lcfg-muted lcfg-fine"> · a separate drawing on the same ticket</span>
                </h3>
                <div
                  className="lcfg-result lcfg-result--secondary"
                  role="group"
                  aria-label={`${config.gameLabel} ${result.secondary.label} numbers for ${result.drawDateDisplay}`}
                >
                  {result.secondary.groups.map((g) => (
                    <StateBallGroup
                      key={g.label ?? "main"}
                      group={g}
                      gameName={`${config.gameLabel} ${result.secondary!.label}`}
                      size="compact"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {result.conflicts.length > 0 ? (
              <div className="lcfg-conflict" role="status" data-conflict="true">
                <p className="lcfg-conflict__head">The sources for this drawing disagree</p>
                <ul>
                  {result.conflicts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : null}

          </div>

          <aside className="lcfg-hero__jackpot" aria-label="Jackpot and next drawing">
            <p className="lcfg-jackpot">
              <span className="lcfg-jackpot__label">{result.jackpotLabel}</span>
              <strong className="lcfg-jackpot__value">{result.jackpotDisplay ?? "—"}</strong>
            </p>
            <p className="lcfg-fine lcfg-muted" data-gap="cash-value">
              {result.cashValueGap.shortWhy ?? result.cashValueGap.why}
            </p>

            {result.nextDrawDateDisplay ? (
              <p className="lcfg-nextdraw">
                <span className="lcfg-muted">Next drawing</span>{" "}
                <strong>{result.nextDrawDateDisplay}</strong>
                <span className="lcfg-muted"> at {config.drawTimeEt.value}</span>
                {/*
                  §B1 — the relative label, beside the absolute date and never instead of it.
                  Server-rendered HTML carries the exact date and time; this hydrates client-side because a
                  relative phrase is a function of the READER'S clock and cannot be cached.

                  Both flagship games draw in Eastern Time and `drawTimeEt` is the operator's own published
                  string, so the instant is resolved through `America/New_York` and is DST-correct — not by
                  subtracting a naive `Date.parse`, which is how the legacy application produced its off-by-one
                  dates (`CLAUDE.md` §14).
                */}
                {result.nextDrawIso ? (
                  <>
                    {" · "}
                    <NextDrawRelative
                      gameLocalDate={result.nextDrawIso}
                      drawTimeLocal={config.drawTimeEt.value}
                      timeZone="America/New_York"
                      className="lcfg-nextdraw__rel"
                    />
                  </>
                ) : null}
                {result.nextJackpotDisplay ? (
                  <>
                    {" · "}
                    <span className="lcfg-muted">advertised</span> {result.nextJackpotDisplay}
                  </>
                ) : null}
              </p>
            ) : null}

            {/*
              §B2 — HOW THE JACKPOT MOVED SINCE THE LAST DRAWING.
              
              The research finding is that a reader looking at a jackpot wants to know whether it went up and by
              how much, and the page held both figures without ever stating the difference.
              
              COMPUTED, NEVER ESTIMATED. `changeDisplay` is `null` unless BOTH advertised figures parse as plain
              amounts from the same governed feed record, and the model does that arithmetic — see
              `jackpotMovement` in `flagshipInsights.ts`. No growth rate is projected, no future amount is implied,
              and the sentence describes what happened rather than what will.
            */}
            {model.jackpot?.changeDisplay ? (
              <p className="lcfg-fine lcfg-muted" data-jackpot-delta={model.jackpot.changeDisplay}>
                Up {model.jackpot.changeDisplay} from the {model.jackpot.currentDrawDisplay} drawing. A jackpot
                rises when nobody wins it; the rise says nothing about the odds of the next drawing.
              </p>
            ) : null}

            <p className="lcfg-fine lcfg-muted">Ticket sales close {config.salesCutoffEt.value}.</p>
          </aside>
        </div>
      ) : null}

      {/* Key game facts, in the hero, so the reader does not scroll to the rules to learn the shape of the game. */}
      <dl className="lcfg-herofacts">
        <div>
          <dt>Draw nights</dt>
          <dd>{config.drawDays.value}</dd>
        </div>
        <div>
          <dt>Sales close</dt>
          <dd>{config.salesCutoffEt.value}</dd>
        </div>
        <div>
          <dt>Ticket</dt>
          <dd>{model.ticketPriceDisplay}</dd>
        </div>
        <div>
          <dt>Jackpot odds</dt>
          <dd>{model.odds.jackpotRow.display}</dd>
        </div>
        <div>
          <dt>{config.multiplier.mode === "none" ? "Multiplier" : config.multiplier.label}</dt>
          <dd>
            {config.multiplier.mode === "none"
              ? "None"
              : config.multiplier.mode === "independentlySelected"
                ? `${config.multiplier.values.join("/")}X · bought separately`
                : `${config.multiplier.values.join("/")}X · built in`}
          </dd>
        </div>
      </dl>

      {/*
        Freshness and the official-source boundary, on one line. Two stacked paragraphs of small print between the
        result and the tools was pure vertical cost; both statements survive in full.

        §A7 — the DATE now comes from the one shared `LastUpdated` primitive, so "Last updated July 9, 2026 at
        2:01 PM ET" reads identically here, on State, on the Game Page and in the archive. `freshness.label` is
        retained beside it because it carries the flagship's own draw-relative wording, which the shared primitive
        deliberately does not invent.
      */}
      <p className="lcfg-freshness" role="status" data-stale={freshness.stale}>
        {freshness.label}{" "}
        <span className="lcfg-muted">
          LotteryCorner is not a lottery — only the lottery that sold a ticket can validate it, and only the
          official result is final.
        </span>
      </p>
      <LastUpdated
        family="flagship"
        iso={freshness.lastResultIso}
        timezoneLabel="ET"
        stale={freshness.stale}
      />

      {/*
        §B4 — THE UNIFORM EXIT RAMPS.

        The hero already carries five TASK buttons (check, search, build, ask, follow); those are things to DO with
        the result. These four are places to GO for the questions that follow it, in the same order and the same
        position as on the State page, the Game Page and the archive.

        `prizes`, `rules` and `history` are in-page fragments and are offered only when their section is in
        `visibleSections`, so a suppressed section never leaves a chip pointing at nothing. `stateHub` is `null`
        deliberately and permanently for a flagship hub: this is a NATIONAL page with no jurisdiction context, and
        `CLAUDE.md` §13 forbids resolving one from coarse IP — picking a state here would be inventing the reader's.
      */}
      <ResultExitRamps
        family="flagship"
        ramps={[
          {
            key: "prizes",
            label: "Prizes and odds",
            href: model.visibleSections.includes("FG-05") ? `#${FLAGSHIP_ANCHORS.prizesAndOdds}` : null,
          },
          {
            key: "history",
            label: "Past results",
            href: model.visibleSections.includes("FG-08") ? `#${FLAGSHIP_ANCHORS.resultsHistory}` : null,
          },
          {
            key: "rules",
            label: `How ${config.gameLabel} works`,
            href: model.visibleSections.includes("FG-05") ? `#${FLAGSHIP_ANCHORS.howToPlay}` : null,
          },
          { key: "stateHub", label: "", href: null },
        ]}
      />

      {/* The deterministic shape of THIS drawing, folded into the hero rather than kept as a read-only band. */}
      {model.insights.length > 0 ? (
        <details className="lcfg-heroinsights">
          <summary>What this drawing looked like</summary>
          <ul className="lcfg-insightgrid">
            {model.insights.map((i) => (
              <li key={i.key} className="lcfg-insight" data-insight={i.key} data-claim={i.claim}>
                <span className="lcfg-insight__label">{i.label}</span>
                <strong className="lcfg-insight__value">{i.value}</strong>
                <span className="lcfg-insight__detail">{i.detail}</span>
              </li>
            ))}
          </ul>
          <p className="lcfg-boundary">{model.insightBoundary}</p>
        </details>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ the page */

export default function FlagshipGamePage({
  model,
  layoutSuppliesMain = false,
}: {
  model: FlagshipPageModel;
  layoutSuppliesMain?: boolean;
}) {
  const { config } = model;
  const theme = resolveGameTheme(config.gameSlug);
  const mainGroup = config.groups.find((g) => g.role === "main");
  const specialGroup = config.groups.find((g) => g.role === "special");

  const checkMatrix = {
    mainCount: config.matrix.mainCount,
    mainMin: mainGroup?.min ?? 1,
    mainMax: config.matrix.mainPool,
    specialLabel: config.matrix.specialCount > 0 ? config.specialLabel : null,
    specialMin: specialGroup?.min ?? 1,
    specialMax: config.matrix.specialPool,
  };

  /* One prop object for the four console sections, so a new field cannot reach one tool and miss another. */
  const consoleProps: ConsoleSectionProps = {
    gameLabel: config.gameLabel,
    specialLabel: config.matrix.specialCount > 0 ? config.specialLabel : null,
    matrix: checkMatrix,
    generatorMatrix: checkMatrix,
    history: model.history,
    historyDisclosure: model.historyDisclosure,
    coverage: model.coverage,
    statViews: model.stats.views,
    statsMethod: model.stats.method,
    multiplierMode: config.multiplier.mode,
    multiplierLabel: config.multiplier.mode === "none" ? null : config.multiplier.label,
    multiplierValues: config.multiplier.drawnWithResult ? config.multiplier.values : [],
    drawNights: drawNightsOf(config),
    secondaryLabel: config.secondaryDraw?.label ?? null,
    insightBoundary: model.insightBoundary,
    displayMode: model.displayMode,
    checkerExamples: model.checkerExamples,
    checkerLocks: CHECKER_LOCKS,
    generatorLocks: GENERATOR_LOCKS,
    statsLocks: STATS_LOCKS,
    lockedNote: ENGAGEMENT_LOCKED_NOTE,
  };

  /* FGP-008: "has history" now means PUBLISHED drawings. With none, the tools that need a drawing to compare
     against are not offered at all rather than rendered empty. */
  const hasHistory = model.history.rows.length > 0;

  const renderSection = (id: FlagshipSectionId) => {
    if (!model.visibleSections.includes(id)) return null;

    switch (id) {
      case "FG-01":
        return <Hero key={id} model={model} />;

      case "FG-03":
        /*
         * §A1/§A5 — MIGRATED ONTO THE SHARED BP-01 §42–§45 CHROME.
         *
         * REUSE CLASSIFICATION: **REFACTOR**. The class names, the anchor and the AI mark are unchanged;
         * `family="flagship"` keeps `.lcfg-section`, `.lcfg-section--ai` and `.lcfg-h2` exactly as the stylesheet
         * styles them. What the section GAINS is everything §42 asks a section to record and the flagship had no
         * way to: `data-section-library-id` (this is SL-I01, the same object State's S-03 is), `data-source-class`,
         * `data-intelligence` and `data-section-state`.
         *
         * `intelligence: "deterministic"` is the honest value. Per `FD-DAT-20` a deterministic answer is NOT
         * labelled AI in either direction, and nothing here executes a model — so the Section Intelligence Matrix
         * records the computation, not a claim about a provider.
         */
        return (
          <UniversalSection
            key={id}
            family="flagship"
            className="lcfg-section--ai"
            anatomy={{
              sectionId: "FG-03",
              libraryId: "SL-I01",
              fragment: FLAGSHIP_ANCHORS.askAi,
              heading: (
                <>
                  <span className="lcfg-assistantmark" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" focusable="false">
                      <path d="M8 1.4l1.6 4.2 4.2 1.6-4.2 1.6L8 13l-1.6-4.2L2.2 7.2l4.2-1.6z" />
                    </svg>
                  </span>
                  Ask about {config.gameLabel}
                </>
              ),
              sourceClass: "deterministic",
              intelligence: "deterministic",
              protectedZone: true,
              state: "fresh",
            }}
          >
            <FlagshipAiConsole
              gameLabel={config.gameLabel}
              surfaces={model.ai}
              lastUpdatedIso={model.freshness.lastResultIso}
            />
          </UniversalSection>
        );

      /*
       * The four console sections. They share state through `FlagshipConsoleProvider` rather than through a
       * common parent, because the founder's order interleaves them with the jackpot tracker — check (3),
       * jackpot (4), build (5), explore (6), analyse (7) — so no single component can emit them any more.
       */
      case "FG-02":
        return hasHistory ? <FlagshipCheckerSection key={id} {...consoleProps} /> : null;
      case "FG-07A":
        return <FlagshipGeneratorSection key={id} {...consoleProps} />;
      case "FG-08":
        return hasHistory ? <FlagshipExplorerSection key={id} {...consoleProps} /> : null;
      case "FG-07B":
        return hasHistory ? <FlagshipStatsSection key={id} {...consoleProps} /> : null;

      case "FG-09":
        return model.jackpot ? (
          <FlagshipJackpotTracker
            key={id}
            gameLabel={config.gameLabel}
            jackpot={model.jackpot}
            run={model.jackpotRun}
            nextDrawIso={model.result?.nextDrawIso ?? null}
            drawTimeEt={config.drawTimeEt.value}
            cashValueGapWhy={model.result?.cashValueGap.why ?? ""}
            options={model.engagement}
            gameSlug={config.gameSlug}
            returnTo={engagementIntent(config, model.engagement[0]).returnTo}
            lockedNote={ENGAGEMENT_LOCKED_NOTE}
          />
        ) : null;

      case "FG-13":
        return <FlagshipTaggedContent key={id} model={model} />;
      case "FG-05":
        return <FlagshipHowToPlay key={id} model={model} />;
      case "FG-15":
        return <FlagshipTrust key={id} model={model} />;

      default:
        /* The five AD-FG anchors, and the five ids merged into a neighbour. Both resolve to nothing here; the
           reasons travel in `data-suppressed-sections`. */
        return null;
    }
  };

  return (
    <div
      data-lc-flagship-preview=""
      data-game-slug={config.gameSlug}
      data-game-id={config.gameId}
      data-page-family="PF-03"
      data-blueprint="BP-04A"
      data-section-order={model.order.join(",")}
      data-visible-sections={model.visibleSections.join(",")}
      data-suppressed-sections={model.suppressed.map((s) => s.id).join(",") || "none"}
      data-ad-profile={model.ads.id}
      data-ad-active-count={model.ads.placements.length}
      data-gam-active="false"
      data-content-tag={config.contentTag}
      data-result-state={model.freshness.state}
      data-data-source={model.preview ? "preview" : "productionFeed"}
      data-display-mode={model.displayMode}
      /*
        FGP-011: the game's identity comes from the SHARED registry, resolved by slug, and reaches the page as
        custom properties. The stylesheet knows how to consume a theme and nothing about which game this is —
        which is why `/lotto-america` will be branded the day it exists, with no CSS change.
      */
      data-game-theme={theme.id}
      style={gameThemeVars(theme)}
      className="lcfg-page"
    >
      <a className="lcs-skip" href="#lcfg-main">
        Skip to main content
      </a>

      {/*
        ONE preview identification, stated once. Not repeated per section.

        FGP-009: the sentence now comes from the payload's own `meta.disclosure` rather than from a string typed
        here. A page rendering preview data therefore cannot lose its disclosure by a component edit, and a page
        rendering real published data drops the banner automatically instead of carrying a stale warning.
      */}
      {model.preview ? (
        <div className="lcs-previewbar" role="status" data-preview-banner="true" data-preview-data="true">
          <span className="lcs-attr">UI review data</span>{" "}
          <span>{model.preview.disclosure}</span>
        </div>
      ) : (
        <div className="lcs-previewbar" role="status" data-preview-banner="true" data-preview-data="false">
          <span className="lcs-attr">Internal preview</span>{" "}
          <span>
Not published yet. Everything shown is real published data, or counted from it.
          </span>
        </div>
      )}

      <script
        type="application/ld+json"
        data-flagship-schema="true"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            flagshipPageGraph({ config, dateModified: model.freshness.lastResultIso }),
          ),
        }}
      />

      {/* §A7 — the one shared breadcrumb primitive. Identical markup on all five families. */}
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: config.seo.breadcrumbLabel }]} />

      <Landmark id="lcfg-main" className="lcfg-container" suppressLandmark={layoutSuppliesMain}>
        <SectionNav model={model} />
        {/* The provider wraps the whole walk, so the four tool sections share state across the sections between
            them. Server-rendered children arrive as an already-rendered prop and stay on the server. */}
        <FlagshipConsoleProvider mainCount={config.matrix.mainCount}>
          {/*
            THE CONSOLE BAND. Sections 1-7 — result, ask, check, jackpot, build, explore, analyse — render on one
            continuous surface with hairline dividers instead of seven separate bordered cards. The founder review
            named the stacking of white boxes as the problem; this is the structural half of the answer, and the
            reorder above is the other half. Everything after the band is reference matter and keeps its own
            quieter treatment.
          */}
          <div className="lcfg-console" data-console-band={CONSOLE_BAND.length}>
            {model.order.filter((id) => CONSOLE_BAND.includes(id)).map((id) => renderSection(id))}
          </div>
          {model.order.filter((id) => !CONSOLE_BAND.includes(id)).map((id) => renderSection(id))}
        </FlagshipConsoleProvider>
      </Landmark>
    </div>
  );
}
