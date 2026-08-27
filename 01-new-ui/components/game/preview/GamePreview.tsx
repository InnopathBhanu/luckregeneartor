/*
 * THE GUARDED GAME PAGE — LRG-GAME-049.
 *
 * Composition for BP-04B `JG-M1` (minimal flagship offering). The section order is `JG_M1_ORDER` from the
 * model, which reproduces the blueprint's §8 table exactly; this file walks it and draws one module per
 * governed id. Nothing here branches on a state code or a game slug — Florida Powerball is configuration.
 *
 * ══ WHY THIS PAGE IS SHORT ══
 *
 * `JG-M1` is deliberately a LOCAL page. BP-04B §3 assigns latest-numbers history, statistics, generators and
 * universal rules to the flagship ecosystem at `/powerball`; the jurisdiction page owns "only substantial
 * local context". Sections that would launch into that ecosystem suppress here because the ecosystem is not
 * built, and inventing those routes is forbidden. The result is a page that answers the Florida-specific
 * questions and stops, rather than a State page with fewer games.
 *
 * ══ SHARED PRIMITIVES ARE REUSED, NOT REIMPLEMENTED ══
 *
 * The result balls, the AI surface, Share, Discuss, Explain and the Buy Now resolver are the SAME components
 * the State page renders, imported unmodified. They already take plain props and import no jurisdiction
 * module, so reuse required no generalization and the State page cannot regress through them.
 */

import Link from "next/link";
import Image from "next/image";
import type { GamePreviewModel, GameSectionId, GameBallGroup } from "@/lib/game/gamePreviewModel";
import { gameCapability } from "@/lib/game/gameViewConfig";
import { gameAdProfileFor } from "@/lib/game/gameAdProfile";
import { gameLogo } from "@/lib/preview/gameLogoRegistry";
import StateAiSurface from "@/components/state/preview/StateAiSurface";
import StateBuyNowInline from "@/components/state/preview/StateBuyNowInline";
import StateShareResult from "@/components/state/preview/StateShareResult";
import StateExplainAction from "@/components/state/preview/StateExplainAction";
import StateDiscussLink from "@/components/state/preview/StateDiscussLink";
import type { StateMultiplier } from "@/components/state/preview/sections/StateResultGrammar";
import { StateBallGroup, StateMultiplierPill } from "@/components/state/preview/sections/StateResultGrammar";
import { gamePageGraph } from "@/lib/seo/gamePageSchema";
import GameM2Bands from "@/components/game/preview/sections/GameM2Bands";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";
import { Breadcrumbs, LastUpdated } from "@/components/shell/SectionChrome";
import NextDrawRelative from "@/components/shell/NextDrawRelative";
import ResultExitRamps from "@/components/shell/ResultExitRamps";
import { gameExitRamps } from "@/lib/game/gameExitRamps";
import { sectionAuditAttributes } from "@/lib/ai/sectionIntelligence";

/* ------------------------------------------------------------------ balls */

/**
 * A result's full drawn set.
 *
 * `StateBallGroup` is used UNCHANGED. It is already generic — it takes a `MemberBallGroup` and a game name,
 * maps the colour token through `stateBallIdentity`, and renders Home's `lcp-ball` primitive with the
 * governed `data-ball` / `data-special` attributes and a per-ball accessible name. FOUNDER RULING 5 requires
 * the same visual language as Home and State, and the only way to guarantee that is to render the same
 * component rather than a lookalike. An earlier revision of this file had its own ball markup; it produced
 * unstyled text, which is precisely the drift the ruling exists to prevent.
 *
 * The group is announced game-and-date first, so a screen reader has context before it reaches values.
 */
function DrawnResult({
  groups, gameName, caption,
}: { groups: GameBallGroup[]; gameName: string; caption: string }) {
  return (
    <div className="lcg-result" role="group" aria-label={caption}>
      <span className="lcs-vh">{caption}</span>
      {groups.map((g) => (
        <StateBallGroup key={g.label ?? "main"} group={g} gameName={gameName} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ landmark */

/**
 * The page's content wrapper — a `<main>` only when nothing above it already is one.
 *
 * `tabIndex={-1}` on the non-landmark branch keeps the skip link working: without it, activating a skip link
 * that targets a plain `<div>` moves the scroll position but not keyboard focus in several browsers, so the
 * next Tab returns to the top of the page.
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

/* ------------------------------------------------------------------ the page */

export default function GamePreview({
  model,
  layoutSuppliesMain = false,
}: {
  model: GamePreviewModel;
  /**
   * Whether `app/layout.tsx` already wrapped `children` in a `<main>`.
   *
   * DEFECT FIX, LRG-GAME-050. The layout's landmark branch keys off the HOME preview flag alone, so with
   * `LC_HOME_PREVIEW` unset the layout renders `<main>{children}</main>` — and this component's own `<main>`
   * became a SECOND, nested landmark. Two `main` landmarks is a WCAG 2.2 defect (1.3.1 / 4.1.2) and it made
   * the skip link ambiguous.
   *
   * This was a pre-existing condition at `b57b72e`: `/fl/powerball` has the same nesting in the same flag
   * combination. The `JG-M1` implementation record recorded the opposite because it was measured with the home
   * preview ON, where the layout omits the landmark and this component's `<main>` is the page's only one.
   *
   * So the element is now conditional rather than assumed: this component supplies the landmark when nothing
   * else does, and yields to the layout when it does. Both cases keep `#game-main` as the skip-link target.
   */
  layoutSuppliesMain?: boolean;
}) {
  const { config, stateName, gameLabel, timezoneLabel, result } = model;
  const adProfile = gameAdProfileFor(config.game.stateCode, config.game.gameSlug);
  /*
   * §A6 — THE SHARED GAME THEME REGISTRY.
   *
   * Resolved from the configuration's DECLARED `visualIdentity` first and the slug second, which is the same
   * lookup the archive and the flagship hubs use — so `/fl/powerball`, `/powerball` and `/fl/pick-3/2026` cannot
   * present three different Powerball or Pick 3 identities. The theme reaches the DOM only as `--gt-*` custom
   * properties; no hex enters this component.
   *
   * THE BALL SYSTEM STAYS FIREWALLED: `DrawnResult` renders `StateBallGroup`, which colours a drawn number from
   * the row's own `colorToken`. Editing a game's page accent must never move a drawn number's colour.
   */
  const theme = resolveGameTheme(config.game.visualIdentity ?? config.game.gameSlug);
  const logo = config.game.visualIdentity ? gameLogo(config.game.visualIdentity) : null;
  const stateHub = config.destinations.stateHub;

  /* The governed discussion context, filled from this page's own facts. Reused verbatim from the State
     engagement contract so Discuss behaves identically on both families. */
  const discussionContext = {
    stateName,
    stateCode: config.game.stateCode,
    familyLabel: gameLabel,
    familyId: config.game.gameSlug,
    resultDateDisplay: result?.drawDateDisplay ?? null,
    resultDateIso: result?.drawDateIso ?? null,
    resultStatus: result ? "verified" : null,
    sourceName: "LotteryCorner production results feed",
    officialSourceUrl: model.operatorWinningNumbersUrl.value ?? null,
    correctionNote: null,
  };

  const renderSection = (id: GameSectionId) => {
    const st = model.sectionState[id];
    if (!st || st.render === false) return null;

    switch (id) {
      /* ---------------------------------------------------------- JO-01 */
      case "JO-01":
        return (
          <section key={id} className="lcg-section lcg-hero" data-section-id="JO-01" {...sectionAuditAttributes("game", "JO-01")} aria-labelledby="game-h1">
            <p className="lcg-context">
              <span className="lcg-statechip">{stateName}</span>
              {config.game.isMultiState ? (
                /* Stated plainly, because BP-04B's whole point is that this page is the LOCAL side of a
                   national game. It is also the guard against reading Powerball as Florida-native. */
                <span className="lcg-kind">Multi-state game</span>
              ) : null}
            </p>
            <div className="lcg-identity">
              {logo ? (
                <Image
                  className="lcg-logo"
                  src={logo.src}
                  alt={`${gameLabel} logo`}
                  width={logo.width}
                  height={logo.height}
                  priority
                />
              ) : null}
              <h1 className="lcg-h1" id="game-h1">{config.copy.h1}</h1>
            </div>

            {result ? (
              <>
                <p className="lcg-drawdate">
                  <strong>{result.drawDateDisplay}</strong>
                  {result.drawTimeLocal ? <span className="lcg-muted"> · {result.drawTimeLocal} {timezoneLabel}</span> : null}
                </p>
                <DrawnResult
                  groups={result.groups}
                  gameName={gameLabel}
                  caption={`${gameLabel} winning numbers for ${result.drawDateDisplay}`}
                />
                {result.multiplier ? (
                  <p className="lcg-mult" data-multiplier-kind={result.multiplier.kind}>
                    {/* The approved multiplier pill, reused verbatim. */}
                    <StateMultiplierPill
                      multiplier={{
                        label: result.multiplier.label,
                        value: result.multiplier.value,
                        kind: result.multiplier.kind as StateMultiplier["kind"],
                      }}
                    />
                    {/* No second sentence about the multiplier KIND. `StateMultiplierPill` already renders
                        it — "Power Play 4X · if selected" — and repeating "applies only if the ticket
                        includes it" beside it said the same thing twice in one line. */}
                  </p>
                ) : null}
                {result.jackpotDisplay && result.jackpotLabel ? (
                  <p className="lcg-jackpot">
                    <span className="lcg-jackpotvalue">{result.jackpotDisplay}</span>
                    <span className="lcg-jackpotlabel">{result.jackpotLabel}</span>
                  </p>
                ) : null}
                {/* A cash value is separately published and the feed does not carry one. Saying so is
                    better than silence, because the reader is looking for the number. */}
                <p className="lcg-fine lcg-muted">
                  The cash value is published separately by the game operator and is not shown here.
                </p>
                {/*
                  §A7 — the shared freshness primitive, so this page prints the same shape as State, the archive
                  and the flagship hubs. The Game Page previously drew a `.lcg-stale` sentence ONLY when the feed
                  was stale, which meant a current page said nothing at all about when it was updated — and
                  `CLAUDE.md` §20's pre-merge checklist requires a visible last-updated where relevant. It is now
                  always present, and the stale case is still labelled rather than silently presented as current.
                */}
                <LastUpdated
                  family="game"
                  iso={model.freshness.lastUpdatedIso ?? null}
                  timezoneLabel={timezoneLabel}
                  daysOld={model.freshness.daysOld}
                  stale={model.freshness.stale}
                />
              </>
            ) : null}

            {/* GP-04 / one compact action row, one dominant action, no modal. */}
            <div className="lcg-actions" data-action-row="primary">
              <StateExplainAction
                promptKey="explain-result"
                label={`Explain this ${gameLabel} result`}
                familyId={config.game.gameSlug}
              />
              <StateDiscussLink
                context={discussionContext}
                groupId="game-community"
                label="Discuss this result"
              />
              <StateShareResult
                stateName={stateName}
                gameLabel={gameLabel}
                fragment="game-h1"
                resultDateDisplay={result?.drawDateDisplay ?? null}
              />
            </div>

            {/*
              §B4 — THE UNIFORM EXIT RAMPS.

              This used to be a single "All Florida results" link. The row now answers the four questions a reader
              reliably has after checking a result — prizes and odds, past results, how the game works, and the
              state hub — in the same order they appear on every other family, so the position is learnable.

              Each destination is PROVED before it is offered: a fragment only when its section rendered, and the
              archive route only when the registry serves that year. See `gameExitRamps.ts`. The old single link is
              subsumed by the `stateHub` ramp rather than duplicated beside it.
            */}
            <ResultExitRamps
              family="game"
              ramps={gameExitRamps({
                mode: config.game.mode,
                stateCode: config.game.stateCode,
                stateName,
                gameSlug: config.game.gameSlug,
                gameLabel,
                visibleSections: model.order.filter((x) => model.sectionState[x]?.render !== false),
                stateHubHref: stateHub && stateHub.kind === "route" ? stateHub.href : null,
              })}
            />
            <p className="lcg-purpose">{config.copy.localPurpose}</p>
          </section>
        );

      /* ---------------------------------------------------------- JO-02 */
      case "JO-02":
        return (
          <section key={id} className="lcg-section" data-section-id="JO-02" {...sectionAuditAttributes("game", "JO-02")} aria-labelledby="game-buy">
            <h2 className="lcg-h2" id="game-buy">Buying a {gameLabel} ticket in {stateName}</h2>
            {/* BP-04B §11 asks for the global draw countdown here. No countdown renders: the feed is weeks
                old, no governed current-draw target time exists, and a ticking clock against a stale draw
                would be actively misleading. The governed schedule facts appear in JO-03 instead. */}
            {result?.nextDrawDateDisplay ? (
              <p className="lcg-nextdraw">
                <span className="lcg-muted">Next drawing</span>{" "}
                <strong>{result.nextDrawDateDisplay}</strong>
                {/* §B1 — the relative label, additive to the server-rendered absolute date. Resolved through the
                    jurisdiction's governed IANA zone, so a reader in another timezone is not told "today" about a
                    drawing that has already happened locally. */}
                {result.nextDrawDateIso && model.timeZone ? (
                  <>
                    {" · "}
                    <NextDrawRelative
                      gameLocalDate={result.nextDrawDateIso}
                      drawTimeLocal={result.drawTimeLocal}
                      timeZone={model.timeZone}
                      className="lcg-muted"
                    />
                  </>
                ) : null}
                {result.nextJackpotDisplay ? (
                  <> · <span className="lcg-muted">advertised</span> {result.nextJackpotDisplay}</>
                ) : null}
              </p>
            ) : null}
            <StateBuyNowInline
              stateName={stateName}
              officialWhereToPlayUrl={null}
              operatorName={model.operatorName.value ?? "the official operator"}
              todayIso={(model.freshness.lastUpdatedIso ?? "2026-08-02").slice(0, 10)}
              /* The page IS the game, so the resolver opens already knowing it. */
              initialGameLabel={gameLabel}
              commerce={model.commerce}
            />
          </section>
        );

      /* ---------------------------------------------------------- JO-03 */
      case "JO-03":
        return (
          <section key={id} className="lcg-section" data-section-id="JO-03" {...sectionAuditAttributes("game", "JO-03")} aria-labelledby="game-features">
            <h2 className="lcg-h2" id="game-features">{config.copy.featuresHeading}</h2>
            <dl className="lcg-facts">
              {model.localFeatures.map((f) => (
                <div key={f.key} className="lcg-fact" data-feature={f.key}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            {result?.secondary ? (
              /* GP-03 / BP-04B: Double Play is a labelled SECONDARY DRAWING inside the Powerball
                 experience — its own numbers and its own special ball — never a second game card. */
              <div className="lcg-secondary" data-secondary-draw={result.secondary.label}>
                <h3 className="lcg-h3">{result.secondary.label}</h3>
                <p className="lcg-fine lcg-muted">
                  A separate drawing held with the same ticket. It has its own numbers and its own{" "}
                  {result.secondary.groups.find((g) => g.visualRole === "special")?.label ?? "special ball"}.
                </p>
                <p className="lcg-drawdate lcg-muted">{result.drawDateDisplay}</p>
                <DrawnResult
                  groups={result.secondary.groups}
                  gameName={`${gameLabel} ${result.secondary.label}`}
                  caption={`${gameLabel} ${result.secondary.label} numbers for ${result.drawDateDisplay}`}
                />
              </div>
            ) : null}
          </section>
        );

      /* ---------------------------------------------------------- JO-04 */
      case "JO-04":
        return (
          <section key={id} className="lcg-section" data-section-id="JO-04" {...sectionAuditAttributes("game", "JO-04")} aria-labelledby="claim-prize">
            <h2 className="lcg-h2" id="claim-prize">{config.copy.claimHeading}</h2>
            <p className="lcg-fine">
              Only the {model.operatorName.value ?? "official operator"} can validate a ticket. Compare your
              numbers with the official result before travelling to claim.
            </p>
            {model.claimDeadline.publish && model.claimDeadline.value ? (
              <p><strong>Claim deadline.</strong> {model.claimDeadline.value}</p>
            ) : null}
            {model.claimTiers.length > 0 ? (
              <div className="lcg-tablewrap">
                <table className="lcg-table">
                  <caption>Where a {stateName} {gameLabel} prize is claimed</caption>
                  <thead>
                    <tr><th scope="col">Prize amount</th><th scope="col">Where to claim</th></tr>
                  </thead>
                  <tbody>
                    {model.claimTiers.map((t) => (
                      <tr key={t.range}><th scope="row">{t.range}</th><td>{t.where}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {/* No tax and no winner-publicity statement: neither is verified for this jurisdiction, and
                both are exactly the kind of claim that must not be guessed. They suppress silently. */}
            {model.operatorHowToClaimUrl.publish && model.operatorHowToClaimUrl.value ? (
              <p className="lcg-actions">
                <a
                  className="lcs-famlink"
                  href={model.operatorHowToClaimUrl.value}
                  rel="noopener noreferrer external"
                  target="_blank"
                >
                  {model.operatorName.value ?? "Official"} claim guidance
                  <span aria-hidden="true"> ↗</span>
                  <span className="lcs-vh"> (opens the official claim page in a new tab)</span>
                </a>
              </p>
            ) : null}
          </section>
        );

      /* ---------------------------------------------------------- JO-05 */
      case "JO-05":
        return (
          <section key={id} className="lcg-section" data-section-id="JO-05" {...sectionAuditAttributes("game", "JO-05")} aria-labelledby="game-ai">
            <h2 className="lcg-h2" id="game-ai">Ask LotteryCorner AI about {gameLabel} in {stateName}</h2>
            {/* ONE shared inline answer surface, reused from the State page. Every Explain action on this
                page targets this one region — no per-section chatbot and no modal (GP-09). */}
            <StateAiSurface
              stateName={stateName}
              operatorName={model.operatorName.value ?? "the official operator"}
              resultSource="the production results feed"
              lastUpdated={model.freshness.lastUpdatedIso}
              timezoneLabel={timezoneLabel}
              howToClaimUrl={model.operatorHowToClaimUrl.value ?? null}
              addOnLabel={result?.multiplier?.label ?? null}
              families={[]}
              daysOld={model.freshness.daysOld}
              purchaseReaderNote={
                model.commerce.kind === "researched" ? model.commerce.capability.readerNote
                  : model.commerce.kind === "unknown" ? model.commerce.readerNote : null
              }
            />

            {config.community.length > 0 ? (
              <div className="lcg-community" id="game-community">
                <h3 className="lcg-h3">{config.copy.communityHeading}</h3>
                <p className="lcg-fine lcg-muted">{config.copy.communityIntro}</p>
                <ul className="lcg-convos">
                  {config.community.map((s) => (
                    <li key={s.key} className="lcg-convo">
                      <h4 className="lcg-h4">{s.title}</h4>
                      <p className="lcg-muted">{s.excerpt}</p>
                      <p className="lcg-tags">
                        {s.tags.map((t) => <span key={t} className="lcg-tag">{t}</span>)}
                      </p>
                      <StateDiscussLink
                        context={discussionContext}
                        groupId="game-community"
                        label={s.actionLabel}
                        variant="action"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        );

      /* ---------------------------------------------------------- JO-08 */
      case "JO-08":
        return (
          <section key={id} className="lcg-section" data-section-id="JO-08" {...sectionAuditAttributes("game", "JO-08")} aria-labelledby="game-sources">
            <h2 className="lcg-h2" id="game-sources">{config.copy.resourcesHeading}</h2>
            <p className="lcg-fine">{config.trust.summary}</p>
            <ul className="lcg-chips">
              {model.operatorWinningNumbersUrl.publish && model.operatorWinningNumbersUrl.value ? (
                <li>
                  <a
                    className="lcg-chip"
                    href={model.operatorWinningNumbersUrl.value}
                    rel="noopener noreferrer external"
                    target="_blank"
                  >
                    Verify results<span aria-hidden="true"> ↗</span>
                    <span className="lcs-vh"> (opens the official winning numbers page in a new tab)</span>
                  </a>
                </li>
              ) : null}
              {model.operatorResponsiblePlayUrl.publish && model.operatorResponsiblePlayUrl.value ? (
                <li>
                  <a
                    className="lcg-chip"
                    href={model.operatorResponsiblePlayUrl.value}
                    rel="noopener noreferrer external"
                    target="_blank"
                  >
                    Responsible play<span aria-hidden="true"> ↗</span>
                    <span className="lcs-vh"> (opens the official responsible-play page in a new tab)</span>
                  </a>
                </li>
              ) : null}
              {stateHub && stateHub.kind === "route" ? (
                <li><Link className="lcg-chip" href={stateHub.href}>{stateHub.label}</Link></li>
              ) : null}
            </ul>
            <p className="lcg-fine lcg-muted">{config.trust.independence}</p>
          </section>
        );

      default:
        /* AD-JO00, AD-JO01 and Footer. The ad anchors resolve to no placement — no approved Game Page
           profile exists — and the footer is supplied by the app layout. */
        return null;
    }
  };

  return (
    <div
      data-lc-game-preview=""
      data-state-code={config.game.stateCode}
      data-game-slug={config.game.gameSlug}
      data-game-id={config.game.gameId}
      data-blueprint-mode={config.game.mode}
      data-section-order={model.order.join(",")}
      data-visible-sections={
        model.order.filter((s) => model.sectionState[s]?.render !== false && s !== "Footer").join(",")
      }
      data-suppressed-sections={model.suppressed.map((s) => s.id).join(",") || "none"}
      data-ad-profile={adProfile.id}
      data-ad-active-count={adProfile.placements.length}
      data-gam-active="false"
      /* §A6 — the shared registry supplies this game's identity as `--gt-*` properties. */
      data-game-theme={theme.id}
      style={gameThemeVars(theme)}
      className="lcg-page"
    >
      <a className="lcs-skip" href="#game-main">Skip to main content</a>

      {/*
        THE ONE PREVIEW IDENTIFICATION.
        Founder decision 1: *"Identify the whole page once as an internal preview. Do not repeatedly show
        stale-data or official-site warnings."* So a JG-M2 page states the review-date basis HERE and nowhere
        else — no per-section sample label, no per-row staleness notice, no repeated official-source warning.
      */}
      <div className="lcs-previewbar" role="status" data-preview-banner="true">
        <span className="lcs-attr">Internal preview</span>{" "}
        <span>{model.m2 ? model.m2.reviewBanner : "Not for publication · nothing live is connected."}</span>
      </div>

      {/* Conservative graph: WebPage + BreadcrumbList only. No Event, Product, Offer, FAQPage or ItemList —
          there is no recent-results list with stable internal item destinations to describe. */}
      <script
        type="application/ld+json"
        data-game-page-schema="true"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(gamePageGraph({ config, dateModified: model.freshness.lastUpdatedIso })),
        }}
      />

      {/* §A7 — the one shared breadcrumb primitive. Same markup, same `data-breadcrumb` marker, all five
          families — and the `BreadcrumbList` emitted above has exactly one visible counterpart to agree with. */}
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: stateName, href: `/${config.game.stateCode}` },
          { label: config.seo.breadcrumbLabel },
        ]}
      />

      {/*
        A REAL `<main>` LANDMARK. The preview shell in `app/layout.tsx` wraps `children` in `<main>` only in
        its non-preview branch, so guarded pages have no landmark at all — a pre-existing condition the State
        family inherited and could not fix, because adding one there would change Home's and Florida's DOM.
        A NEW page has no such constraint: this element is the page's only `<main>`, the skip link targets it,
        and nothing outside this file changes.
      */}
      <Landmark id="game-main" className="lcg-container" suppressLandmark={layoutSuppliesMain}>
        {/*
          MODE DISPATCH, ONE LINE.
          `JG-M2` is a different ownership model, not a longer `JG-M1` — BP-04B §18 gives it its own section
          order and the brief gives it nine bands. It composes in `GameM2Bands`; the `JG-M1` walk below is
          untouched by this task, so `/fl/powerball` renders exactly what it rendered at `b57b72e`.
        */}
        {model.m2 ? (
          <GameM2Bands model={model} m2={model.m2} discussionContext={discussionContext} />
        ) : (
          model.order.map((id) => renderSection(id))
        )}
      </Landmark>
    </div>
  );
}
