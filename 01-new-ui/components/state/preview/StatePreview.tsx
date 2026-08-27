/*
 * StatePreview — the guarded anonymous State preview orchestrator.
 *
 * Task LRG-STATE-021. Authority: FD-S-04 (typed manifest + resolver, NOT a page-builder), FD-S-36
 * (anonymous Florida preview only), FD-S-21/22/24/29 (advertising), FD-S-13 (accessibility).
 *
 * WHAT THIS FILE DOES. Walks the resolved section order and renders one small component per governed
 * section, placing advertising at anchor positions from the approved Minimum Florida profile. It holds
 * no content, makes no eligibility decision and branches on no state code — everything comes from the
 * resolved model.
 *
 * WHAT IT IS NOT. There is no dynamic component lookup by string, no plugin registry and no schema
 * interpreter. The `switch` below is 20 literal cases, which is the point: a typed State-specific
 * resolver rather than a generic engine.
 */

import { Fragment, type ReactNode } from "react";
import { section, STATE_MERGED_SECTIONS, type StateSectionId } from "@/lib/state/sectionManifest";
import type { StatePreviewModel } from "@/lib/state/statePreviewModel";
import { renderedSectionIds, adHostEligibleSectionIds } from "@/lib/state/statePreviewModel";
import {
  bandRuns, assertBandMembershipUnique, assertBandsPreserveOrder, assertEverySectionBanded,
} from "@/lib/state/stateVisualBands";
import {
  assertStateAdBaseline, resolvePreviewPlacements,
  FORBIDDEN_IN_PREVIEW, type StatePlacement,
} from "@/lib/state/stateAdBaseline";
import { assertNoAdBeforePromoted } from "@/lib/state/adaptivePriority";
import { assertAllGatedClassesChecked } from "@/lib/state/publicationGate";
import {
  type StatePreviewAdMode,
  STATE_EXPERIENCE_ID, STATE_RENDERER_ID, STATE_PREVIEW_COMMIT,
} from "@/lib/state/statePreviewGuard";
import StatePreviewAdSlot from "./StatePreviewAdSlot";
import { reservedHeights } from "@/lib/state/stateAdReservation";
import { SectionS01, SectionS05, SectionS07, SectionS08, SectionS08A } from "./sections/StateUtilitySections";
import { SectionS06 } from "./sections/StateResultSections";
import { SectionS02Families } from "./sections/StateFamilySurface";
import { SectionS03 as SectionS03Draft, SectionS04 as SectionS04Draft } from "./sections/StateDraftSections";
import StateStickyFooterAd from "./StateStickyFooterAd";
import { SuppressedSectionNotes } from "./sections/StateLowerSections";
import { Attribution, SectionShell } from "./sections/StateCommon";
import { Breadcrumbs } from "@/components/shell/SectionChrome";
import {
  ExploreBand, NewsBand, GuidesBand, CommunityBand, ResourcesBand,
} from "./sections/StateLowerBands";
import { stateHubGraph } from "@/lib/seo/stateHubSchema";
import StateNoLottery from "./sections/StateNoLottery";
import { gameThemeVars, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";
import SignedInStateLayer from "@/components/personal/SignedInStateLayer";
import GuestProgress from "@/components/personal/GuestProgress";
import { stateFactsFromGroups } from "@/lib/personal/personalModel";

/**
 * An ad anchor: at most one visible inline slot per viewport, from the RESOLVED active set.
 *
 * Three placement shapes, and the distinction matters:
 *   - RESPONSIVE (both viewports): its own GAM size mapping serves both tiers, so it renders ONCE and
 *     UNGATED. Wrapping it in a device class would silently make it single-tier and open the very
 *     992-1023 px hole FD-S-24 forbids.
 *   - DESKTOP-ONLY: gated with `lcs-ad-desktop-only` (hidden below 992 px).
 *   - MOBILE-ONLY: gated with `lcs-ad-mobile-only` (hidden at/above 992 px).
 *
 * A device-exclusive pair is therefore one desktop-only slot plus one mobile-only slot at the same
 * anchor, switching at the single 992 px threshold.
 *
 * LRG-STATE-022 DEFECT FIX. These wrappers were previously the Home shell's `lcp-desktop-only` /
 * `lcp-ad-mobile`. `lcp-desktop-only` is Home's NAVIGATION class and resolves to `display: flex` at
 * >= 992 px, which made the ad slot a flex item and shrank it to its label width — measured 112 px
 * against a reserved 728 px at 1440 px. That destroyed the DS-22 reservation on precisely the
 * device-paired anchors. State ads now own block-level wrappers, so the reservation always survives
 * and State ad geometry no longer depends on a Home navigation rule.
 */
function AdAnchor({
  id, adMode, active, stateCode,
}: {
  id: StateSectionId; adMode: StatePreviewAdMode; active: readonly StatePlacement[];
  /* LRG-ADS-CANARY-001 §4: the canary activates Florida only, so the jurisdiction travels with the slot. */
  stateCode: string;
}) {
  const inline = active.filter(
    (p) => p.anchorId === id && (p.subPosition === "inline" || p.subPosition === "mobile-inline"),
  );
  if (inline.length === 0) return null;

  const responsive = inline.filter((p) => p.viewports.includes("desktop") && p.viewports.includes("mobile"));
  const desktopOnly = inline.filter((p) => p.viewports.includes("desktop") && !p.viewports.includes("mobile"));
  const mobileOnly = inline.filter((p) => p.viewports.includes("mobile") && !p.viewports.includes("desktop"));

  /* LRG-STATE-025 / FD-X-04: when an anchor carries ONLY desktop-only placements — AD-S00 during the State
     preview — the anchor WRAPPER must collapse below 992 px too. Hiding just the slot would leave the
     anchor's own margin as a blank reservation on mobile, and FD-X-04 forbids any mobile reservation before
     the first verified result. */
  const desktopOnlyAnchor = responsive.length === 0 && mobileOnly.length === 0 && desktopOnly.length > 0;

  return (
    <div
      data-ad-anchor={id}
      className={`lcs-adanchor${desktopOnlyAnchor ? " lcs-adanchor--desktop-only" : ""}`}
      data-anchor-viewports={desktopOnlyAnchor ? "desktop" : "mobile,desktop"}
    >
      {responsive.map((p) => (
        <StatePreviewAdSlot key={`r-${p.slotKey}`} placement={p} adMode={adMode} stateCode={stateCode} />
      ))}
      {desktopOnly.map((p) => (
        <div key={`d-${p.slotKey}`} className="lcs-ad-desktop-only">
          <StatePreviewAdSlot placement={p} adMode={adMode} stateCode={stateCode} />
        </div>
      ))}
      {mobileOnly.map((p) => (
        <div key={`m-${p.slotKey}`} className="lcs-ad-mobile-only">
          <StatePreviewAdSlot placement={p} adMode={adMode} stateCode={stateCode} />
        </div>
      ))}
    </div>
  );
}

/**
 * A governed section, optionally with a section-bounded contextual rail (FD-S-28).
 *
 * The rail cell lives INSIDE this section's grid, so `position: sticky` releases at the section
 * boundary by construction — a rail slot can never travel into adjacent, possibly protected, content.
 */
function HostedSection({
  id,
  adMode,
  active,
  children,
  stateCode,
}: {
  id: StateSectionId;
  adMode: StatePreviewAdMode;
  active: readonly StatePlacement[];
  children: ReactNode;
  /* LRG-ADS-CANARY-001 §4: as `AdAnchor` — the rail's slots need the same jurisdiction gate. */
  stateCode: string;
}) {
  const rail = active.filter((p) => p.subPosition === "rail" && p.hostSectionId === id);
  if (rail.length === 0) return <>{children}</>;
  return (
    <div className="lcs-hostgrid" data-rail-host={id}>
      <div>{children}</div>
      <aside
        className="lcs-railcell"
        data-sticky={rail.some((r) => r.sticky) ? "true" : "false"}
        aria-label="Sponsored"
      >
        {rail.map((p) => (
          <StatePreviewAdSlot key={p.slotKey} placement={p} adMode={adMode} stateCode={stateCode} />
        ))}
      </aside>
    </div>
  );
}

/**
 * Every RESOLVED active rail placement must have a rendered host section.
 *
 * Inline, mobile-inline and sticky placements are exempt: an ad anchor is a sequence position, which
 * survives a neighbouring section's suppression.
 */
function assertReachable(
  active: readonly StatePlacement[],
  renderedIds: readonly StateSectionId[],
): void {
  const rendered = new Set<string>([...renderedIds, "Footer"]);
  for (const p of active) {
    if (p.subPosition === "rail" && !rendered.has(p.hostSectionId)) {
      throw new Error(
        `State ad baseline: active rail slot "${p.slotKey}" has no rendered host section (${p.hostSectionId}).`,
      );
    }
  }
}

/** Every ACTIVE rail placement must accompany an ad-host-eligible section (APP-ST-01). */
function assertRailHostsEligible(
  active: readonly StatePlacement[],
  eligibleIds: readonly StateSectionId[],
): void {
  const eligible = new Set<string>([...eligibleIds, "Footer"]);
  for (const p of active) {
    if (p.subPosition === "rail" && !eligible.has(p.hostSectionId)) {
      throw new Error(
        `State ad baseline: active rail slot "${p.slotKey}" accompanies ${p.hostSectionId}, which carries no ` +
          `substantive real content. APP-ST-01 forbids an advertisement hosted by an empty-state shell.`,
      );
    }
  }
}

export default function StatePreview({
  model,
  adMode = "compact",
  debug = false,
}: {
  model: StatePreviewModel;
  adMode?: StatePreviewAdMode;
  /** LRG-STATE-022: when false (default) internal suppression diagnostics are NOT drawn. */
  debug?: boolean;
}) {
  /*
   * The approved lower-page content (LRG-STATE-042), now resolved from the STATE'S OWN configuration
   * (LRG-STATE-047). This was `FLORIDA_LOWER_PAGE_CONTENT` — a direct jurisdiction import in the shared
   * orchestrator, which is the single thing that made this a Florida page rather than a State page.
   *
   * `todayIso` drives the promotion end date from the page's own governed freshness value rather than from a
   * wall clock, so the render stays deterministic and the server and client agree.
   */
  const lowerContent = model.lowerContent;
  const config = model.config;

  /*
   * §A6 — THE SHARED GAME THEME REGISTRY, on the State page.
   *
   * A State hub is not one game, so it does not take a game's colour. It takes the theme of its PRIMARY family —
   * the single most relevant verified result, which is the thing the first viewport is built around (FD-X-03) —
   * and falls back to `DEFAULT_GAME_THEME` when no family resolves. Utah, which runs no lottery, therefore gets
   * the neutral fallback rather than inheriting whichever colour happened to be last in the cascade.
   *
   * Why this matters beyond tidiness: the State page's per-family accents were the one remaining place a game
   * colour could be decided outside the registry. Now `/fl` and `/fl/pick-3` and `/fl/pick-3/2026` all resolve
   * Pick 3's identity from the same source, so they cannot disagree.
   *
   * THE BALL SYSTEM STAYS FIREWALLED. `--gt-*` is the GAME's identity; `--ball-*` is the identity of a POSITION in
   * a result. `StateResultGrammar` reads the second and never the first, and a test enforces it.
   */
  /* `familyName` is the reader-facing name ("Powerball", "Pick 3"), which `resolveGameTheme` normalises through
     the same name-alias table Home's jackpot rows use — so a State page and a Game page reach the same theme from
     two different identifiers without either side hardcoding a mapping. */
  const theme = resolveGameTheme(model.primary?.familyName ?? model.familySurfaces[0]?.familyId ?? null);
  const todayIso = (model.freshness.lastUpdatedIso ?? "2026-07-09").slice(0, 10);

  /* ---- build-time / render-time guards. All THROW: a silent violation is the failure mode. ---- */
  const rendered = renderedSectionIds(model);

  /* Resolve the approved 10-placement profile against the sections this preview renders. A rail slot
     whose approved host is suppressed is DEFERRED with a reason, never re-homed (APP-ST-04). */
  const eligible = adHostEligibleSectionIds(model);
  /*
   * LRG-STATE-047 ADS-01/ADS-02. Florida resolves the approved ten-placement Minimum Florida profile exactly
   * as before. Every other preview State resolves an EMPTY profile, because none has a founder-approved one
   * and copying Florida's inventory to another State is explicitly forbidden. The recorded gap travels on
   * the model and is reported, never rendered.
   */
  const adPlacements = model.adProfile.placements;
  const { active, deferred } = resolvePreviewPlacements(rendered, adPlacements, eligible);

  /* The approved baseline is asserted on the FULL profile: the approved count of 10 does not change
     merely because a preview suppresses a host section. Reachability is asserted on the RESOLVED set,
     so a rail slot that was correctly deferred does not trip the unreachable check. */
  /* The approved baseline is asserted only where there IS an approved baseline. Running Florida's
     ten-slot assertion against a State with no approved profile would fail on every slot — and the correct
     reading of an empty profile is "no inventory approved yet", not "inventory missing". */
  if (model.adProfile.gap === null) {
    assertStateAdBaseline(adPlacements, {
      deferredReasons: {
        ...FORBIDDEN_IN_PREVIEW,
        ...Object.fromEntries(deferred.map((d) => [d.slotKey, d.reason])),
      },
    });
  }
  assertReachable(active, rendered);
  /* LRG-STATE-022: a rail placement must also satisfy the APP-ST-01 content-host rule. */
  assertRailHostsEligible(active, eligible);
  assertNoAdBeforePromoted(model.order, model.activeOverride);
  assertAllGatedClassesChecked(model.gateAudit.map((g) => g.fieldClass));

  /*
   * LRG-STATE-047 DEFECT FIX — ADS-02/ADS-03.
   *
   * This was `active.find(...) ?? stickyPlacement()`, and `stickyPlacement()` reads the MINIMUM FLORIDA
   * PROFILE unconditionally. With per-State profiles that fallback put Florida's sticky advertisement on
   * every State including no-lottery Utah, which is precisely the "do not fill the page with Florida slots"
   * rule — and ADS-03's "must not be monetised by copying the normal State ad density". Caught in the 390px
   * Utah capture, where an ADVERTISEMENT bar sat under a page that has no inventory approved at all.
   *
   * The fallback now searches THIS STATE'S OWN profile, so a State with no placements gets no sticky bar and
   * no clearance reservation. Florida is unaffected: its sticky slot is in its own profile.
   */
  const sticky = active.find((p) => p.subPosition === "sticky")
    ?? adPlacements.find((p) => p.subPosition === "sticky");
  const stickyReserve = sticky ? reservedHeights(sticky.slotKey, adMode) : null;

  /* LRG-STATE-031 §10 — VISUAL BANDS. Both guards run before anything renders: membership must be a
     partition, and banding must reproduce the governed order exactly. A visual grouping that could reorder
     sections would be a governance breach dressed as styling, so it is proved rather than asserted. */
  assertBandMembershipUnique();
  assertEverySectionBanded(model.order);
  assertBandsPreserveOrder(model.order);

  const renderSection = (id: StateSectionId) => {
    const st = model.sectionState[id];
    /* A suppressed content section renders nothing here; its recorded reason is collected into the
       suppression summary instead of leaving an empty visual shell (PF-02 §12). */
    if (st && st.render === false && id !== "Footer" && !id.startsWith("AD-")) return null;

    switch (id) {
      case "S-01": return <SectionS01 key={id} model={model} />;
      case "AD-S00": return <AdAnchor key={id} id={id} adMode={adMode} active={active} stateCode={model.stateCode} />;
      case "S-02": return <SectionS02Families key={id} model={model} />;
      case "S-03":
        /* LRG-STATE-032 §5 places the ONE prominent State-level Buy Now immediately AFTER the AI module, so
           the top sequence is: first result -> multi-state -> three families -> AI -> Buy Now. It is a
           sibling of the section rather than content inside it, because the AI module must stay a single
           clean surface and S-03's semantics are unchanged. */
        return (
          <Fragment key={id}>
            <SectionS03Draft model={model} />
            {/* LRG-STATE-037 FV-08: the State-level Buy Now moved into the consumer action row directly under
                the first result. A second hero CTA here competed with it and pushed the page longer. */}
          </Fragment>
        );
      case "AD-S01": return <AdAnchor key={id} id={id} adMode={adMode} active={active} stateCode={model.stateCode} />;
      case "S-04": return <SectionS04Draft key={id} model={model} />;
      case "S-05": return <SectionS05 key={id} model={model} />;
      case "S-06":
        return (
          <HostedSection key={id} id="S-06" adMode={adMode} active={active} stateCode={model.stateCode}>
            <SectionS06 model={model} />
          </HostedSection>
        );
      case "AD-S02": return <AdAnchor key={id} id={id} adMode={adMode} active={active} stateCode={model.stateCode} />;
      case "S-07": return <SectionS07 key={id} model={model} />;
      case "S-08": return <SectionS08 key={id} model={model} />;
      case "S-08A": return <SectionS08A key={id} model={model} />;
      /* LRG-STATE-025: S-09 now carries the deterministic local-only "what changed" summary (FD-X-09) and
         S-10 renders history/tools with destinations that genuinely resolve (FD-X-13). S-11 … S-13 remain
         suppressed; their reasons stay in the model and in `data-*` attributes for audit. */
      /*
       * LRG-STATE-042 — THE APPROVED LOWER-PAGE BANDS.
       *
       * S-09 (the Recent-changes block), S-16 (the "Come back to Florida" essay) and S-17 (the old
       * Sources-and-methodology section) no longer render: they are the rejected content, and their render
       * calls are removed rather than hidden. The top What Changed interaction is untouched — it lives in S-02.
       *
       * Each approved band is wrapped by the governed section that already owns its anchor and its ad host, so
       * no advertisement moves and no anchor breaks. See `stateVisualBands.ts` for the full mapping.
       */
      case "S-09": return null;
      case "S-10":
        /* Explore Florida Lottery, at the governed utility position — keeps `#state-tools` and hosts AD-S03. */
        return (
          <HostedSection key={id} id="S-10" adMode={adMode} active={active} stateCode={model.stateCode}>
            <SectionShell entry={section("S-10")} heading={lowerContent.exploreHeading} headingId="state-tools">
              <ExploreBand content={lowerContent} />
            </SectionShell>
          </HostedSection>
        );
      case "AD-S03":
        /* LRG-STATE-025: S-10 now renders WITH substantive real content, so its approved rail companion
           (`sp_side_mpu_pos2` @ S-10) becomes reachable and host-eligible under APP-ST-01. That restores
           the placement LRG-STATE-022 legitimately deferred — by giving the host real content, which is
           the only permitted way to resolve it. The slot was never re-homed. */
        return <AdAnchor key={id} id={id} adMode={adMode} active={active} stateCode={model.stateCode} />;
      case "S-14":
        /* Florida community, at the governed community position — keeps `#community`. */
        return (
          <SectionShell key={id} entry={section("S-14")} heading={lowerContent.communityHeading} variant="engagement">
            <CommunityBand content={lowerContent} />
          </SectionShell>
        );
      case "S-15":
        /*
         * The editorial position — keeps `#news`. LRG-STATE-048 splits the two bands that share it: a State
         * with guides and no news article now renders the guides, where before the whole section was gated
         * on news and both disappeared. Each band draws only when it has items, so neither leaves a heading
         * with nothing under it (CONTENT-03).
         */
        return (
          <Fragment key={id}>
            {lowerContent.newsItems.length > 0 ? (
              <SectionShell entry={section("S-15")} heading={lowerContent.newsHeading}>
                <NewsBand content={lowerContent} todayIso={todayIso} />
              </SectionShell>
            ) : null}
            {lowerContent.guideItems.length > 0 ? (
              <div className="lcs-lp-guidesblock">
                <h2 className="lcs-h2">{lowerContent.guidesHeading}</h2>
                <GuidesBand content={lowerContent} />
              </div>
            ) : null}
          </Fragment>
        );
      /*
       * §A3: S-16 and S-17 no longer have `return null` cases here.
       *
       * They are recorded in the model instead — S-16 `blocked-member-insider`, S-17 `merged-into-neighbour` —
       * so the guard at the top of this function filters them with a stated reason that reaches
       * `data-suppressed-sections`. A required section that silently returned `null` was invisible to every audit.
       */
      case "S-18":
        /*
         * Resources and player support, immediately above the footer — hosts AD-S04, and ABSORBS S-17.
         *
         * `mergedFrom` puts the merge in the DOM, so the mapping back to PF-02 §12 stays exact: the reader finds
         * State sources, responsible play and support here, at the `#state-sources` fragment S-17 used to own.
         */
        return (
          <HostedSection key={id} id="S-18" adMode={adMode} active={active} stateCode={model.stateCode}>
            <SectionShell
              entry={section("S-18")}
              heading={lowerContent.resourcesHeading}
              headingId="state-sources"
              mergedFrom={Object.entries(STATE_MERGED_SECTIONS)
                .filter(([, into]) => into === "S-18")
                .map(([from]) => from)}
            >
              <ResourcesBand content={lowerContent} />
            </SectionShell>
          </HostedSection>
        );
      case "AD-S04": return <AdAnchor key={id} id={id} adMode={adMode} active={active} stateCode={model.stateCode} />;
      case "Footer": return null; /* Global footer is supplied by the app layout. */
      default: return null;
    }
  };

  /* Runs of adjacent same-band sections, in the governed order. A band that renders nothing (every section
     in it suppressed) draws no container, so banding never leaves an empty shell. */
  const body = bandRuns(model.order).map((run, i) => {
    const rendered = run.ids.map((id) => renderSection(id)).filter(Boolean);
    if (rendered.length === 0) return null;
    if (!run.band) return <Fragment key={`unbanded-${i}`}>{rendered}</Fragment>;
    return (
      <section
        key={`${run.band.id}-${i}`}
        className={`lcs-band lcs-band--${run.band.id} lcs-band--cols${run.band.desktopColumns}`}
        data-visual-band={run.band.id}
        data-band-sections={run.ids.join(",")}
        {...(run.band.title ? { "aria-labelledby": `band-${run.band.id}-${i}` } : {})}
      >
        {run.band.title ? (
          <header className="lcs-band__head">
            {/* The run index is part of the id: `assertEverySectionBanded` makes a split band impossible
                  today, but a heading id that CAN duplicate is a latent accessibility defect. */}
            <h2 className="lcs-band__title" id={`band-${run.band.id}-${i}`}>{run.band.title}</h2>
            {run.band.intro ? <p className="lcs-band__intro">{run.band.intro}</p> : null}
          </header>
        ) : null}
        <div className="lcs-band__body">{rendered}</div>
      </section>
    );
  });

  return (
    <div
      /* The State preview root. `[data-lc-state-preview]` is what opts this subtree into the approved
         design-system layer; Home carries `[data-lc-preview]` and is unaffected. */
      data-lc-state-preview=""
      /* RUNTIME PROOF MARKER — LRG-STATE-034 §18, extended by LRG-STATE-035 §5 to name the RENDERER and the
         COMMIT as well as the experience. It exists so a founder can confirm from the rendered page which code
         produced it, rather than inferring from a screenshot. All three attributes live on the preview root,
         which only mounts when `resolveStatePreview` is true — so they are absent guard-off, absent on Home and
         absent on every non-preview State route, by construction rather than by a second condition. */
      data-lc-state-experience={STATE_EXPERIENCE_ID}
      data-lc-state-renderer={STATE_RENDERER_ID}
      data-lc-state-preview-commit={STATE_PREVIEW_COMMIT}
      data-state-code={model.stateCode}
      data-game-theme={theme.id}
      style={gameThemeVars(theme)}
      data-preview="state-anonymous"
      data-user-state="anonymous"
      data-section-order={model.order.join(",")}
      data-active-override={model.activeOverride?.trigger ?? "none"}
      data-suppressed-sections={
        model.order.filter((id) => model.sectionState[id]?.render === false).join(",") || "none"
      }
      data-visible-sections={
        model.order.filter((id) => model.sectionState[id]?.render !== false && id !== "Footer").join(",")
      }
      data-ad-profile={model.adProfile.id}
      data-ad-approved-count={adPlacements.length}
      data-ad-active-count={active.length}
      data-ad-deferred={deferred.map((d) => d.slotKey).join(",") || "none"}
      data-gam-active="false"
      /* LRG-STATE-022 DEFECT FIX — sticky clearance moved to the DOCUMENT, in `app/layout.tsx`.
         It used to live here as `lcs-sticky-clearance` and resolved through Home's
         `--lcp-sticky-ad-h: 56px`, a compact-mode constant: 68px of clearance under a 90px fixed bar in
         production ad mode. Two separate faults — the wrong height, and the wrong element, since a
         `position: fixed` bar covers the viewport and the shared footer renders after this element. The
         reservation is now derived per tier and applied to `<body>`, which is the only element whose
         padding can clear the end of the document. */
      className="lcs-page"
      data-sticky-reserved-mobile-h={stickyReserve?.mobileH ?? 0}
      data-sticky-reserved-desktop-h={stickyReserve?.desktopH ?? 0}
    >
      {/* FD-S-13: skip link. */}
      <a className="lcs-skip" href="#state-main">
        Skip to main content
      </a>

      {/* Guarded-preview banner. This page carries unavailable and preview states and must never be
          served publicly in this form — stated on the page, not only in documentation. */}
      {/* LRG-STATE-025: compacted to ONE line. The full-height banner consumed roughly 180 px of the
          390 px first screen and pushed the first verified result to the fold, working against FD-X-03.
          The warning is unchanged in substance — it is simply no longer the largest thing on the page. */}
      <div className="lcs-previewbar" role="status" data-preview-banner="true">
        {/* LRG-STATE-031 §7: shortened to fit ONE line at 390px. It cost 77px as two lines, directly above
            the first result. The substance is unchanged — this page must not be published, and nothing live
            is connected. */}
        <Attribution kind="preview">Internal preview</Attribution>{" "}
        <span>Not for publication · nothing live is connected.</span>{" "}
        {/* The visible half of the §18 proof marker. */}
        <span className="lcs-expmark" data-experience-marker={STATE_EXPERIENCE_ID}>
          State Experience Preview · Engagement V1 · {STATE_PREVIEW_COMMIT}
        </span>
      </div>

      {model.activeOverride ? (
        <div
          className="lcs-unavailable"
          role="status"
          data-override={model.activeOverride.trigger}
          data-override-affects={model.activeOverride.affects.join(",")}
          data-override-expires={model.activeOverride.expiresAt}
        >
          {/* LRG-STATE-039 §1: this printed the internal trigger name, the governed section ids that moved and
              the ad-deferral flag — an implementation report in public content. The reader-facing fact is that
              something important has been moved to the top; the trigger, the affected section ids and the
              expiry all remain on `data-*` and in the model for audit. */}
          <p>
            <strong>Important update.</strong> The most urgent {model.stateName} information has been moved to
            the top of this page.
          </p>
        </div>
      ) : null}

      {/*
        LRG-STATE-043 SD-01 — the conservative State hub graph, server-rendered.
        `CollectionPage` + `BreadcrumbList` only. `dateModified` is the governed freshness value, never a build
        or request timestamp. The visible breadcrumb below agrees with the JSON-LD.
      */}
      <script
        type="application/ld+json"
        data-state-hub-schema="true"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stateHubGraph({
          config,
          dateModified: model.freshness.lastUpdatedIso ?? null,
        })) }}
      />

      {/* The visible breadcrumb the graph mirrors (SD-01: the two must agree).
          §A7: the shared primitive, so all five families emit identical markup. State's own inline version was
          already correct — it is replaced for uniformity, not to fix a defect. */}
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: config.seo.breadcrumbLabel }]} />

      {/* NOT a <main>: the root app layout already provides one, and two `main` landmarks in a document
          is an accessibility defect. The skip link targets this container's id instead. */}
      <div id="state-main" className="lcs-container">
        {/*
         * SIGNED-IN LAYER MOUNT — the Global Shell §33 layering decision, stated where it is taken.
         *
         * The anonymous PF-02 composition (`body`, below) IS the server HTML, byte-identical for every
         * request: both mounts are client-only components whose server (and first-client-render) output
         * is null, so no member state can ever be cached into this public page. With a browser session,
         * the PF-02 §32 personalized sections mount HERE, above the anonymous content — fed only by the
         * account store and by this model's own governed result groups. The anonymous section order,
         * and every approved ad slot in it (AD-SS00/AD-SS02 included), stays exactly where it is.
         * A no-lottery state has no results to personalize, so the layer does not mount there.
         */}
        {model.noLottery ? null : (
          <SignedInStateLayer
            stateCode={model.stateCode}
            stateName={model.stateName}
            facts={stateFactsFromGroups(model.results, model.stateCode)}
          />
        )}
        {/* Shell §12 guest continuity: anonymous, device-local; visiting this page is recorded on-device. */}
        {model.noLottery ? null : (
          <GuestProgress record={{ kind: "viewed-game", label: `${model.stateName} lottery results` }} />
        )}
        {/*
          ST-06. A State that runs no lottery gets its own short composition rather than the governed
          sequence with almost every section suppressed. The branch is HERE, at the composition boundary,
          and it reads a resolved model field — not a state code — so adding Alabama, Alaska, Hawaii or
          Nevada later is a configuration change (`FD-S-31`).
        */}
        {model.noLottery ? <StateNoLottery model={model} /> : body}
        {/* Internal diagnostics only. The suppression reasons stay in the model and in `data-*`
            attributes for audit; drawing them as a visible section put a generic debug box on the page,
            which PF-02 §12 forbids. */}
        {debug ? <SuppressedSectionNotes model={model} /> : null}
      </div>

      {/*
        Sticky closable footer advertisement (FD-S-29).
        
        §B5 CORRECTION. This comment used to read *"the preview introduces no sticky purchase action and no bottom
        navigation, so only one sticky layer exists"*. §A2 added GS-09 to this page, so there are now TWO layers and
        the §12 priority order applies: bottom navigation outranks advertising, so the bar sits ABOVE the navigation
        with the navigation's own declared height as the offset, and the document clearance sums both. See the
        `.lcs-stickyfoot` block in `globals.css` for the measurement and the reasoning. Clearance is still DERIVED
        from the slot's real GAM size mapping, never hardcoded.
      */}
      {sticky && stickyReserve ? (
        <StateStickyFooterAd
          reservedMobileH={stickyReserve.mobileH}
          reservedDesktopH={stickyReserve.desktopH}
        >
          <StatePreviewAdSlot placement={sticky} adMode={adMode} stateCode={model.stateCode} />
        </StateStickyFooterAd>
      ) : null}
    </div>
  );
}
