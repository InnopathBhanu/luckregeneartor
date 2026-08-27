/*
 * HomePreview — the anonymous Home page, composed in the EXACT approved order.
 *
 * Authority: Home Page Blueprint BP-02 v1.1 §12 (anonymous section sequence) as transcribed in
 * 03-docs/04-page-specifications/home-preview/home-preview-section-manifest.md.
 *
 * 30 entries: 23 content sections + 7 advertising anchors (AD-H00 … AD-H06).
 * Order is driven by the view model's ordered `entries` array — never by object key order.
 * No section is reordered, merged, invented or silently omitted. Sections without adequate data
 * render as clearly LABELLED preview states (founder decision), never as blank gaps and never as
 * fabricated lottery facts.
 *
 * Signed-in sections (H-01S … H-08S) are OUT OF SCOPE and are not implemented.
 *
 * First-viewport contract (BP-02 §11): identity and shell, functional task entry, jackpot
 * orientation, and latest results all precede the first normal advertisement.
 */

import Link from "next/link";
import type {
  HomePreviewViewModel,
  PreviewEntry,
  PreviewSection,
  LinkRef,
  EmptyState as EmptyStateData,
} from "@/lib/preview/types";
import type { HomePreviewAdMode } from "@/lib/preview/previewGuard";
import { isAdAnchor } from "@/lib/preview/types";
import {
  anchorById,
  anchorsWithoutActivePlacement,
  railGroups,
  DISABLED_IMPLEMENTATION_CANDIDATES,
  HOME_AD_ACCOUNTING,
  HOME_AD_ANCHORS,
  HOME_AD_CANDIDATES,
  RETIRED_HOME_SLOTS,
  UNMAPPED_HOME_SLOTS,
  assertHomeAdBaseline,
  placedSlotKeys,
} from "@/lib/layout/adAnchors";
import PreviewAdSlot from "./PreviewAdSlot";
import PreviewResultCard from "./PreviewResultCard";
import { gameLogoByName } from "@/lib/preview/gameLogoRegistry";
import { gameThemeVarsFor, resolveGameTheme } from "@/lib/theme/gameThemeRegistry";
import { AiMark, ObservationIcon } from "./AiIcon";
import { DrawAnalysisContent } from "./PreviewDrawAnalysis";
import PreviewInlineAnalysis from "./PreviewInlineAnalysis";
import PreviewOverlay from "./PreviewOverlay";
import {
  SAMPLE_DISCUSSIONS,
  SAMPLE_INSIDER_CARDS,
  SAMPLE_LEAD_STORY,
  SAMPLE_MEDIA_UPDATE,
  SAMPLE_NEWSLETTER,
  SAMPLE_PLAY_GAMES,
  SAMPLE_PLAY_METHOD_SUMMARY,
  SAMPLE_SECONDARY_STORY,
  SAMPLE_TOOLS,
  initialsFor,
} from "@/lib/preview/finalStateContent";
import {
  CommerceDisclosure,
  CorrectionNotice,
  ProvenanceLabel,
  SourceNotice,
  StaleNote,
  UnavailableNote,
} from "@/components/trust/SourceNotice";
import StickyStack from "@/components/shell/StickyStack";
import { jackpotChange } from "@/lib/text/jackpotDelta";
import NextDrawRelative from "@/components/shell/NextDrawRelative";
import SignedInHomeLayer from "@/components/personal/SignedInHomeLayer";
import GuestProgress from "@/components/personal/GuestProgress";
import { homeFactsFromEntries } from "@/lib/personal/personalModel";

/* ----------------------------------------------------------------- helpers */

/*
 * FINAL-STATE vs DEBUG presentation (LRG-UI-013 §1).
 *
 * `debug` is read once from the server env at the top of the render and passed down. With it off —
 * the default — no "Soon", "Coming soon", "Sample" or provenance chip is drawn anywhere. The values
 * still EXIST on the view model and the build-blocking provenance assertion still runs; debug only
 * decides whether they are rendered.
 *
 * A module-level variable rather than a React context, because a context provider would force a
 * client boundary onto the whole tree and this page is deliberately server-rendered.
 */
let DEBUG = false;

/** Renders a status marker only in debug. In final-state mode it is nothing at all. */
function StatusTag({ children }: { children: React.ReactNode }) {
  if (!DEBUG) return null;
  return <span className="lcp-btn__tag">{children}</span>;
}

function H({ level, children }: { level: 2 | 3; children: React.ReactNode }) {
  const style = { margin: 0, fontSize: level === 2 ? 22 : 18, fontWeight: 700 } as const;
  return level === 2 ? <h2 style={style}>{children}</h2> : <h3 style={style}>{children}</h3>;
}

/** Section wrapper. Carries the blueprint section ID, ad tier and protected-zone flag into the DOM
 *  so the founder review and any later audit can verify placement without reading source. Those are
 *  data attributes only — no internal identifier is ever rendered as visible copy.
 *
 *  LRG-UI-010 direction 8: the heading block is a demarcated head with an accent rule, and the
 *  section's `tone` drives its spacing and accent weight. Tone is presentation only — the BP-02 §12
 *  order is still supplied by the view model and is never derived here. */
function Section({
  s,
  compact,
  hideHeading,
  children,
}: {
  s: PreviewSection;
  compact?: boolean;
  /** H-01 suppresses its own heading: the page h1 already states the task. Keeps an accessible
   *  name on the section via aria-label so the landmark is still identifiable. */
  hideHeading?: boolean;
  children: React.ReactNode;
}) {
  const cls = [
    "lcp-section",
    /* Family surface (§12). Four reusable treatments; never a per-section colour. */
    `lcp-fam-${s.family}`,
    compact ? "lcp-section--compact" : null,
    s.tone === "feature" ? "lcp-section--feature" : null,
    s.tone === "quiet" ? "lcp-section--quiet" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={s.id}
      {...(hideHeading ? { "aria-label": s.name } : { "aria-labelledby": `${s.id}-h` })}
      className={cls}
      data-section-id={s.id}
      data-ad-tier={s.adTier}
      data-protected-zone={s.protectedZone ? "true" : "false"}
      data-provenance={s.provenance}
      data-intelligence={s.intelligence}
      data-tone={s.tone}
      data-family={s.family}
      {...(s.band ? { "data-band": s.band } : {})}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {hideHeading ? null : (
        <div className="lcp-section__head">
          <span id={`${s.id}-h`}>
            <H level={s.headingLevel}>{sectionHeading(s)}</H>
          </span>
          {DEBUG && s.provenanceLabel ? <ProvenanceLabel label={s.provenanceLabel} /> : null}
        </div>
      )}
      {/* §1: "opens after launch" explanations are implementation status, not final-state copy. */}
      {DEBUG && s.state === "stale" && s.stateText ? <StaleNote text={s.stateText} /> : null}
      {DEBUG && s.state === "unavailable" && s.stateText ? <UnavailableNote text={s.stateText} /> : null}
      {children}
      <AiActionRow actions={s.aiActions} />
    </section>
  );
}

/**
 * A locally authored decorative graphic. `alt=""` is correct and deliberate: the adjacent heading is
 * the accessible name, and a decorative image that repeated it would just be noise for a
 * screen-reader user. Width and height are always supplied, so nothing shifts while it loads.
 *
 * A plain <img> is used rather than next/image: these are tiny local SVGs with no remote origin, and
 * the optimiser would add nothing but a runtime request.
 */
function Media({
  image,
  className = "lcp-media",
}: {
  image: { src: string; width: number; height: number } | undefined;
  className?: string;
}) {
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt=""
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

/**
 * A polished, truthful empty state (LRG-UI-011 §4/§5/§6).
 *
 * Used wherever genuine data does not exist. It says plainly that there is nothing yet and explains
 * what the surface will carry. It is NEVER a stand-in that later gets filled with invented activity,
 * and it carries no developer terminology.
 */
function EmptyState({ state }: { state: EmptyStateData }) {
  return (
    <div className="lcp-empty">
      <p className="lcp-empty__headline">{state.headline}</p>
      <p className="lcp-empty__body">{state.body}</p>
    </div>
  );
}

/**
 * Contextual AI actions (LRG-UI-012 §9).
 *
 * Rendered from the section envelope, so only the sections the founder named carry any. Each is a
 * quiet text-weight control with the AI mark — never a bright button, and never one per item. None is
 * live in the preview, so each is a labelled non-actionable control rather than a link to nowhere.
 */
function AiActionRow({ actions }: { actions?: PreviewSection["aiActions"] }) {
  if (!actions || actions.length === 0) return null;
  return (
    <p className="lcp-aiact" data-ai-area="contextual">
      <span className="lcp-aiact__mark">
        <AiMark size={15} title="LotteryCorner AI" />
      </span>
      {/*
        §C3 — THESE ARE NOW REAL DESTINATIONS, NOT DEAD BUTTONS.

        They were `<button type="button">` with NO handler. The comment above described them as "labelled
        non-actionable controls", but nothing on screen said so: a reader saw a button, pressed it, and nothing
        happened. `CLAUDE.md` §9 and `FD-S-08` both forbid presenting a non-functional control as functional, and an
        unlabelled inert button is the clearest case of it.

        They are anchors to H-05 — the page's ONE shared answer surface — which is exactly what
        `StateExplainAction` does on the State page: the action owns no panel and renders no answer, it moves the
        reader to the single region that does (`FD-X-08`). An anchor rather than a client component because Home's
        composition is server-rendered and a real `href` needs no JavaScript to work.
      */}
      {actions.map((a) => (
        <a key={a.label} href="#H-05" className="lcp-aiact__item lcp-target" data-explain-target="H-05">
          <ObservationIcon
            kind={
              a.icon === "compare"
                ? "compare"
                : a.icon === "history"
                  ? "history"
                  : a.icon === "analysis"
                    ? "composition"
                    : "pattern"
            }
            size={14}
          />
          {a.label}
        </a>
      ))}
    </p>
  );
}

/**
 * Editorial image (§9). 16:9, `object-fit: cover`, MEANINGFUL alt text, lazy below the first
 * viewport. Local assets only — no remote image, no stock photography, no image library.
 *
 * A plain <img>: these are tiny local SVGs with no remote origin, so the optimiser would only add a
 * runtime request.
 */
function StoryImage({
  image,
  alt,
  lead,
}: {
  image?: { src: string; width: number; height: number };
  alt: string;
  lead?: boolean;
}) {
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      className={lead ? "lcp-media lcp-media--lead" : "lcp-media"}
    />
  );
}

/**
 * DISABLED STRATEGIC CANDIDATE marker (§4/§9).
 *
 * Renders NOTHING in normal mode — a candidate is not inventory and must not look like a slot. It has
 * no GAM unit path, no div id, no size map and no reserved geometry, and it is excluded from the
 * active count.
 */
function AdCandidateMarker({ afterSectionId }: { afterSectionId: string }) {
  if (!DEBUG) return null;
  const c = HOME_AD_CANDIDATES.find((x) => x.afterSectionId === afterSectionId);
  if (!c) return null;
  return (
    <div className="lcp-adcand" data-candidate-id={c.candidateId} data-candidate-status="disabled">
      <strong>NEW STRATEGIC CANDIDATE AD — DISABLED</strong>
      <span>{c.candidateId}</span>
      <span>{c.rationale}</span>
    </div>
  );
}

/**
 * The retired placement and the five disabled implementation candidates (§2/§3/§9).
 *
 * DEBUG ONLY, and deliberately rendered as one block rather than at simulated positions: a marker
 * placed where a retired ad "used to be" would imply a reserved position, and §2 requires that the
 * retired position show nothing at all. This is an audit list, not a placeholder.
 */
function AdNonActiveMarkers() {
  if (!DEBUG) return null;
  return (
    <div className="lcp-adretired" data-ad-nonactive="true">
      {RETIRED_HOME_SLOTS.map((r) => (
        <p key={r.slotKey} data-retired-slot={r.slotKey}>
          <strong>RETIRED AD — {r.slotKey} — DISABLED</strong>{" "}
          <span>
            {r.legacyDivId} · legacy L{r.legacyLine} · {r.legacySize} · {r.reason}
          </span>
        </p>
      ))}
      {DISABLED_IMPLEMENTATION_CANDIDATES.map((c) => (
        <p key={c.slotKey} data-disabled-candidate={c.slotKey}>
          <strong>NEW CANDIDATE AD — DISABLED</strong>{" "}
          <span>
            {c.slotKey} · {c.legacyDivId} · {c.note}
          </span>
        </p>
      ))}
      <p>
        <strong>
          Active {HOME_AD_ACCOUNTING.activeExistingLegacy} · retired{" "}
          {HOME_AD_ACCOUNTING.retiredLegacy} · implementation candidates{" "}
          {HOME_AD_ACCOUNTING.disabledImplementationCandidates} · strategic candidates{" "}
          {HOME_AD_ACCOUNTING.disabledStrategicCandidates}
        </strong>
      </p>
    </div>
  );
}

function sectionHeading(s: PreviewSection): string {
  const d = s.data as { heading?: string; stateEntryHeading?: string };
  return d.heading ?? d.stateEntryHeading ?? s.name;
}

function Grid({ min = 260, children }: { min?: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

/*
 * Action control (LRG-UI-010 direction 4). Inline-sized and lightly weighted — the thick full-width
 * blue block is gone. `weight` selects one of the three shared button weights; at most one `accent`
 * per section.
 *
 * A control whose target does not exist yet renders as a <span> with a visible "Soon" marker, never
 * as a link to nowhere and never as a silently disabled control (DS-17).
 */
function ActionLink({ l, weight = "quiet" }: { l: LinkRef; weight?: "accent" | "quiet" | "plain" }) {
  if (l.state !== "live") {
    return (
      <span className="lcp-btn lcp-btn--plain lcp-target" data-actionable="false">
        {l.label}
        <StatusTag>Soon</StatusTag>
      </span>
    );
  }
  return (
    <Link href={l.href} className={`lcp-btn lcp-btn--${weight} lcp-target`}>
      {l.label}
    </Link>
  );
}

/*
 * Compact State utility (LRG-UI-009 §2). Reads "Your state: Select a state" — a utility control,
 * deliberately NOT the page's headline task. Global Shell §6.5: when state context is unresolved the
 * interface ASKS; coarse IP never decides eligibility, claim rules or tax guidance.
 */
function StateUtility({
  label,
  options,
}: {
  label: string;
  options: { code: string; name: string }[];
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        color: "var(--color-text-muted)",
      }}
    >
      <label htmlFor="lcp-state-utility" style={{ fontWeight: 600 }}>
        {label}:
      </label>
      <select
        id="lcp-state-utility"
        defaultValue=""
        className="lcp-target"
        style={{
          padding: "8px 10px",
          fontSize: 14,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      >
        <option value="">Select a state</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
    </span>
  );
}

/*
 * Progressive-disclosure control (LRG-UI-009 §29/§31). The target route does not exist yet, so this
 * is rendered as an explicitly LABELLED unavailable control rather than a broken link.
 */
function ViewAll({ label }: { label: string }) {
  return (
    <span
      className="lcp-btn lcp-btn--plain lcp-target"
      data-actionable="false"
      style={{ alignSelf: "flex-start" }}
    >
      {label}
      <StatusTag>Soon</StatusTag>
    </span>
  );
}

/* ------------------------------------------------------------ section render */

function renderSection(s: PreviewSection) {
  switch (s.kind) {
    case "task-entry":
      return (
        <Section s={s} compact hideHeading>
          <div className="lcp-actions">
            {/* Direction 4: exactly ONE accent action — the reason most people arrive. Everything
                else is outlined or plain, so the row reads as balanced rather than as a stack of
                heavy blue blocks. */}
            {s.data.taskEntries.map((t, i) => (
              <ActionLink key={t.label} l={t} weight={i === 0 ? "accent" : "quiet"} />
            ))}
            {/* LRG-UI-009 §2: State selector kept in H-01 but as a COMPACT UTILITY, not the
                page's headline task. The full exploration experience stays in H-07 / H-14B. */}
            <StateUtility label={s.data.stateEntryHeading} options={s.data.stateOptions} />
          </div>
        </Section>
      );

    case "result-cards":
      // H-02A — Powerball and Mega Millions only, the heaviest treatment on the page.
      return (
        <Section s={s} compact>
          {/*
            §3 grid contract: `lcp-featured-grid` sets align-items:start and does NOT stretch its
            children, so the two flagship cards keep content-driven heights and stay aligned at their
            tops. Nothing that expands lives inside this grid any more — every panel is a portalled
            overlay — so opening an action cannot change either card's height.
          */}
          <div className="lcp-featured-grid">
            {s.data.cards.map((c) => (
              <PreviewResultCard
                key={c.gameId}
                card={c}
                variant="featured"
                analysis={s.data.analyses[c.gameSlug]}
                /* BP-02 §14's advertised jackpot for the next drawing, threaded exactly as `analyses` is —
                   keyed by game slug, resolved in the view model, absent where the feed cannot source both
                   figures. H-02A is the only section that supplies it. */
                forwardJackpot={s.data.forwardJackpots[c.gameSlug]}
                debug={DEBUG}
              />
            ))}
          </div>
          {/*
           * LRG-UI-014 inline analysis. This is a SIBLING of .lcp-featured-grid, never a descendant,
           * so expanding it grows the page below the grid and cannot grow a grid row — the LRG-UI-013
           * height fix is preserved without a modal.
           *
           * Every panel body is rendered on the server and handed in, so switching mode performs no
           * request. One mode at a time; the component enforces that.
           */}
          <PreviewInlineAnalysis
            games={s.data.cards
              .filter((c) => s.data.analyses[c.gameSlug])
              .map((c) => ({
                slug: c.gameSlug,
                name: s.data.analyses[c.gameSlug].gameName,
                basisText: s.data.analyses[c.gameSlug].basisText,
              }))}
            comparison={Boolean(s.data.comparison && s.data.cards[0])}
            panels={{
              ...Object.fromEntries(
                s.data.cards
                  .filter((c) => s.data.analyses[c.gameSlug])
                  .map((c) => [
                    c.gameSlug,
                    <DrawAnalysisContent
                      key={c.gameSlug}
                      analysis={s.data.analyses[c.gameSlug]}
                      debug={DEBUG}
                    />,
                  ]),
              ),
              ...(s.data.comparison && s.data.cards[0]
                ? {
                    compare: (
                      <DrawAnalysisContent
                        analysis={s.data.analyses[s.data.cards[0].gameSlug]}
                        comparison={s.data.comparison}
                        compareOnly
                      />
                    ),
                  }
                : {}),
            }}
          />
        </Section>
      );

    case "result-groups":
      return (
        <Section s={s} compact>
          {s.data.intro ? (
            <p className="lcp-measure" style={{ margin: 0, fontSize: 15 }}>
              {s.data.intro}
            </p>
          ) : null}
          {s.data.analysisRef ? (
            /* LRG-UI-014: inline here too. No AI content uses the modal any more. */
            <PreviewInlineAnalysis
              games={[
                {
                  slug: s.data.analysisRef.gameSlug,
                  name: s.data.analysisRef.gameName,
                  basisText: s.data.analysisRef.basisText,
                },
              ]}
              comparison={false}
              panels={{
                [s.data.analysisRef.gameSlug]: (
                  <DrawAnalysisContent analysis={s.data.analysisRef} debug={DEBUG} />
                ),
              }}
            />
          ) : null}
          {s.data.groups.map((g) => (
            <div key={g.groupKey} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <H level={3}>{g.heading}</H>
              <Grid min={280}>
                {g.cards.map((c) => (
                  <PreviewResultCard key={c.gameId} card={c} variant="compact" />
                ))}
              </Grid>
              <ViewAll label="View all results" />
            </div>
          ))}
        </Section>
      );

    case "jackpot-table":
      return (
        <Section s={s} compact>
          <div className="lcp-scroll-x lcp-rows">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <caption
                style={{
                  captionSide: "top",
                  textAlign: "left",
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  paddingBottom: 6,
                }}
              >
                {s.data.intro || "Current estimated jackpots"}
              </caption>
              <thead>
                <tr>
                  {["Game", "Estimated jackpot", "Next draw", "Status"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.data.rows.map((r) => (
                  /* FGP-011: the row carries its game's identity; the name cell takes a 3px bar from it while
                     the figures beside it stay neutral, so the table reads as data, not as six highlights. */
                  <tr key={r.game} style={gameThemeVarsFor(r.game)} data-game-theme={resolveGameTheme(r.game).id}>
                    <th
                      scope="row"
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        fontWeight: 600,
                        borderLeft: "3px solid var(--gt-accent-ink)",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Media
                          image={gameLogoByName(r.game) ?? undefined}
                          className="lcp-gamelogo lcp-gamelogo--sm"
                        />
                        {r.game}
                      </span>
                    </th>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>
                      {r.amountDisplay}
                      {/*
                        §B2 — HOW THE JACKPOT MOVED SINCE THE LAST DRAWING.

                        COMPUTED, NEVER ESTIMATED. `jackpotChange` returns `null` unless BOTH figures are published
                        and both parse as exact amounts, so a qualifier like "over $600M" produces no delta rather
                        than a fabricated subtraction. It also distinguishes a RISE from a RESET — a jackpot that
                        falls was won, and saying so is the honest reading.

                        Today this renders nothing on Home: `home-page-sample.json` supplies one figure per game and
                        no previous-drawing reference, which is why the row's two new fields are optional. That is
                        the correct output for the data that exists (`CLAUDE.md` §14 — label it as missing rather
                        than guess), and the gap is recorded in the implementation report.
                      */}
                      {(() => {
                        const change = jackpotChange(
                          r.amountDisplay,
                          r.previousAmountDisplay,
                          r.previousDrawLabel ?? "the previous drawing",
                        );
                        if (!change) return null;
                        return (
                          <span
                            style={{
                              display: "block",
                              fontWeight: 600,
                              fontSize: 13,
                              color: "var(--color-text-muted)",
                            }}
                            data-jackpot-delta={change.direction}
                          >
                            {change.sentence}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {r.nextDrawDisplay ?? "—"}
                      {/*
                        §B1 — the relative label, in the cell that already shows the absolute date.

                        Additive only: the absolute date stays exactly where it was, server-rendered and crawlable,
                        and this hydrates beside it because a relative phrase is a function of the reader's clock.
                        It renders nothing unless all three governed values are present, so Lotto America — which has
                        no captured schedule — shows the date alone.
                      */}
                      {r.nextDrawLocalDate && r.nextDrawTimeZone ? (
                        <>
                          {" · "}
                          <NextDrawRelative
                            gameLocalDate={r.nextDrawLocalDate}
                            drawTimeLocal={r.nextDrawTimeLocal ?? null}
                            timeZone={r.nextDrawTimeZone}
                          />
                        </>
                      ) : null}
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--color-text-muted)" }}>
                      {r.statusText ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      );

    case "check-numbers":
      return (
        <Section s={s}>
          <div className="lcp-panel">
            <p className="lcp-measure" style={{ margin: 0, fontSize: 15 }}>
              {s.data.intro}
            </p>
            <ol
              className="lcp-measure"
              style={{ margin: "8px 0 0", paddingInlineStart: 20, fontSize: 14 }}
            >
              {s.data.howItWorks.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ol>
          </div>
        </Section>
      );

    case "ai-brief": {
      /*
       * LotteryCorner AI as a PLATFORM CAPABILITY (LRG-UI-010 direction 5, refined by LRG-UI-011 §16).
       *
       * Restrained structure, deliberately not a wall of bright outlined buttons:
       *   - ONE featured capability, the one contextual to this page;
       *   - the remaining five as compact prompt links;
       *   - ONE contextual action.
       *
       * It is a panel in the page flow, never a floating chat bubble (Constitution §13). Every AI
       * area is explicitly labelled. Nothing predicts a draw, claims an edge, or implies that AI
       * changes the odds of a fair independent draw.
       */
      const [featured, ...rest] = s.data.capabilities;
      /* The odds disclaimer is mandatory wherever a number-generating capability is offered, and it
         stays visible rather than hidden behind a tooltip. */
      const generates = s.data.capabilities.some((c) => /generate/i.test(c.title));
      return (
        <Section s={s} compact>
          <div className="lcp-ai">
            <span className="lcp-ai__badge">
              <AiMark size={15} />
              {s.data.aiLabel}
            </span>

            {/* Today's brief — deterministic, derived from the published results on this page. */}
            <ul className="lcp-ai__brief">
              {s.data.summaryLines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>

            {/* ONE featured capability. */}
            {featured ? (
              <div className="lcp-ai__featured">
                <h3 className="lcp-ai__featured-title">{featured.title}</h3>
                <p className="lcp-ai__featured-body">{featured.body}</p>
                <div className="lcp-actions">
                  <span className="lcp-btn lcp-btn--tonal lcp-target" data-actionable="false">
                    <AiMark size={16} />
                    {s.data.askLabel}
                    <StatusTag>Soon</StatusTag>
                  </span>
                  {s.data.citations.map((c) => (
                    <ActionLink key={c.label} l={c} weight="plain" />
                  ))}
                </div>
              </div>
            ) : null}

            {/* The rest as compact prompt links — quiet text, not five outlined buttons. */}
            {rest.length > 0 ? (
              <div>
                <p className="lcp-ai__rubric">It can also</p>
                <ul className="lcp-ai__list">
                  {rest.map((c) => (
                    <li key={c.title}>
                      <span className="lcp-ai__link" data-actionable="false">
                        {c.title}
                      </span>
                      <span className="lcp-ai__hint">{c.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {s.data.examplePrompts.length > 0 ? (
              <ul className="lcp-ai__prompts">
                {s.data.examplePrompts.map((q) => (
                  <li key={q} className="lcp-ai__prompt">
                    {q}
                  </li>
                ))}
              </ul>
            ) : null}

            {generates ? <p className="lcp-ai__odds">{s.data.oddsDisclaimer}</p> : null}
            <p className="lcp-ai__foot">{s.data.disclaimer}</p>
          </div>
        </Section>
      );
    }

    case "draw-status":
      return (
        <Section s={s} compact>
          {/* Awaiting-result CARD state — reviewable without inventing numbers. */}
          {s.data.awaitingCard ? (
            <Grid min={280}>
              <PreviewResultCard card={s.data.awaitingCard} />
            </Grid>
          ) : null}
          <ul className="lcp-rows" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {s.data.rows.map((r) => (
              <li key={r.game} className="lcp-row">
                <p style={{ margin: 0, fontWeight: 700, minWidth: 140 }}>{r.game}</p>
                <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)" }}>
                  {r.drawDisplay}
                </p>
                {/* Status is TEXT, never colour alone. */}
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color:
                      r.status === "awaiting"
                        ? "var(--color-state-awaiting)"
                        : "var(--color-success)",
                  }}
                >
                  {r.statusText}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "upcoming":
      return (
        <Section s={s}>
          <Grid min={200}>
            {s.data.items.map((u) => (
              <div key={u.game} className="lcp-card lcp-card--compact">
                <p style={{ margin: 0, fontWeight: 700 }}>{u.game}</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--color-text-muted)" }}>
                  {u.drawDisplay}
                  {/* §B1 — same rule as the jackpot table: additive to the absolute date, never instead of it. */}
                  {u.nextDrawLocalDate && u.nextDrawTimeZone ? (
                    <>
                      {" · "}
                      <NextDrawRelative
                        gameLocalDate={u.nextDrawLocalDate}
                        drawTimeLocal={u.nextDrawTimeLocal ?? null}
                        timeZone={u.nextDrawTimeZone}
                      />
                    </>
                  ) : null}
                </p>
                {u.jackpotDisplay ? (
                  <p style={{ margin: "6px 0 0", fontSize: 15 }}>
                    <strong>{u.jackpotDisplay}</strong>{" "}
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                      {u.estimatedLabel}
                    </span>
                  </p>
                ) : null}
                {u.statusText ? (
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-state-awaiting)" }}>
                    {u.statusText}
                  </p>
                ) : null}
              </div>
            ))}
          </Grid>
        </Section>
      );

    case "state-explore":
    case "state-directory":
      return (
        <Section s={s}>
          {s.data.intro ? (
            <p className="lcp-measure" style={{ margin: 0, fontSize: 15 }}>
              {s.data.intro}
            </p>
          ) : null}
          <ul className="lcp-directory">
            {s.data.states.map((st) => (
              <li key={st.code}>
                <Link href={st.href}>{st.name}</Link>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "highlights":
      return (
        <Section s={s}>
          <Grid min={240}>
            {s.data.items.map((h, i) => (
              <div key={i} className="lcp-card lcp-card--compact">
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  {h.kind === "recent-win" ? "Recent win" : h.kind === "unclaimed" ? "Unclaimed" : "Jackpot growth"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 15 }}>{h.text}</p>
                {h.amount ? <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{h.amount}</p> : null}
                {h.location ? (
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
                    {h.location}
                  </p>
                ) : null}
              </div>
            ))}
          </Grid>
        </Section>
      );

    case "tools":
      /*
       * §10 FINAL-STATE TOOLS. Each tool is a real-looking card with a working-looking control.
       *
       * NO BROKEN ROUTE: the controls are <button type="button">, not links. None of these routes
       * exists, and CLAUDE.md §10 forbids inventing one, so a button that opens nothing is the honest
       * choice for design validation — it cannot 404.
       */
      return (
        <Section s={s} compact>
          {s.data.intro ? <p className="lcp-lede">{s.data.intro}</p> : null}
          <ul className="lcp-tools">
            {SAMPLE_TOOLS.map((t) => (
              <li key={t.key} className="lcp-tool" data-tool={t.key}>
                <p className="lcp-tool__label">{t.label}</p>
                <p className="lcp-tool__body">{t.body}</p>
                <button type="button" className="lcp-btn lcp-btn--quiet lcp-target lcp-tool__action">
                  {t.sampleAction}
                </button>
              </li>
            ))}
          </ul>
          {/* Progressive disclosure retained: the explanatory system content stays collapsed. */}
          {s.data.systems.length > 0 ? (
            <div>
              {s.data.systems.map((b) => (
                <details key={b.title} className="lcp-accordion">
                  <summary>{b.title}</summary>
                  <div>
                    {b.body ? <p className="lcp-measure lcp-an__short">{b.body}</p> : null}
                    {b.list ? (
                      <ul className="lcp-an__list">
                        {b.list.map((li) => (
                          <li key={li}>{li}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          ) : null}
        </Section>
      );

    case "popular-games":
      return (
        <Section s={s}>
          <Grid min={240}>
            {s.data.items.map((g) => (
              <div
                key={g.slug}
                className="lcp-card lcp-card--compact"
                style={{
                  ...gameThemeVarsFor(g.slug),
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  borderTop: "3px solid var(--gt-accent-ink)",
                }}
              >
                {/* Recognition logo where one exists. The game NAME is always rendered as text
                    beside it — the logo never replaces the name (LRG-UI-010 direction 2). */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Media image={gameLogoByName(g.displayName) ?? undefined} className="lcp-gamelogo lcp-gamelogo--sm" />
                  <p style={{ margin: 0, fontWeight: 700 }}>{g.displayName}</p>
                </div>
                {g.jurisdiction ? (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
                    {g.jurisdiction}
                  </p>
                ) : null}
                {g.topPrizeDisplay ? (
                  <p style={{ margin: 0, fontSize: 15 }}>
                    <strong style={{ color: "var(--gt-accent-ink)" }}>{g.topPrizeDisplay}</strong>{" "}
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>top prize</span>
                  </p>
                ) : null}
                {g.nextDrawDisplay ? (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
                    Next draw: {g.nextDrawDisplay}
                  </p>
                ) : null}
                <div className="lcp-actions">
                  <Link href={g.href} className="lcp-btn lcp-btn--quiet lcp-target">
                    View game
                  </Link>
                  {/* Commerce CTA: quiet weight, no destination resolved, disclosure adjacent. */}
                  {g.purchase ? (
                    <span className="lcp-btn lcp-btn--plain lcp-target" data-actionable="false">
                      {g.purchase.label}
                      <StatusTag>Soon</StatusTag>
                    </span>
                  ) : null}
                </div>
                {g.purchase ? (
                  <CommerceDisclosure
                    text={g.purchase.disclosure}
                    eligibility={g.purchase.eligibility.stateText}
                  />
                ) : null}
              </div>
            ))}
          </Grid>
        </Section>
      );

    case "jackpot-history":
      return (
        <Section s={s}>
          {s.data.intro ? <p className="lcp-measure" style={{ margin: 0 }}>{s.data.intro}</p> : null}
          <Grid min={240}>
            {s.data.items.map((j) => (
              <div
                key={j.game}
                className="lcp-card lcp-card--compact"
                style={{ ...gameThemeVarsFor(j.game), borderTop: "3px solid var(--gt-accent-ink)" }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>{j.game}</p>
                <p style={{ margin: "4px 0 0", fontSize: 15 }}>
                  <strong style={{ color: "var(--gt-accent-ink)" }}>{j.amountDisplay}</strong>{" "}
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                    {j.estimatedLabel}
                  </span>
                </p>
                {j.nextDrawDisplay ? (
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
                    Next draw: {j.nextDrawDisplay}
                  </p>
                ) : null}
              </div>
            ))}
          </Grid>
          {/* No chart: one is rendered only from real historical series data, never simulated. */}
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            {s.data.chartReason}
          </p>
        </Section>
      );

    case "community": {
      /*
       * §7 COMMUNITY — now fed by the REAL forum's own seam.
       *
       * The model populates `discussions` from the Community family's review corpus (Conflict 41
       * FOUNDER AMENDMENT): `/community` and `/community/{slug}` are registry-served routes, so
       * `FD-ACC-10`'s "hidden because no forum exists" condition is satisfied by construction and
       * each thread links its real destination. Counts and dates are facts about the disclosed
       * fixture threads — never invented — and `s.data.disclosure` renders the amendment's
       * condition-1 banner sentence on this surface.
       *
       * The LRG-UI-013 §7 fallback below survives only for a build whose corpus is retired:
       * ⚠ `SAMPLE_DISCUSSIONS` is FABRICATED design-validation content (recorded conflict, see
       * lib/preview/finalStateContent.ts) and renders only when `discussions` is empty.
       */
      const list = s.data.discussions.length > 0 ? s.data.discussions : SAMPLE_DISCUSSIONS;
      const [lead, ...rest] = list;
      return (
        <Section s={s}>
          <p className="lcp-comm__kicker">{s.data.kicker}</p>
          <p className="lcp-lede">{s.data.intro}</p>

          <div className="lcp-comm__grid">
            {/* Lead discussion. A real thread links its real `/community/{slug}` page. */}
            <article className="lcp-thread lcp-thread--lead">
              <p className="lcp-meta">
                <span className="lcp-chip">{lead.forum}</span>
                <span>{lead.lastActivityDisplay}</span>
              </p>
              <h3 className="lcp-thread__title">
                {lead.href ? <a href={lead.href}>{lead.title}</a> : lead.title}
              </h3>
              <p className="lcp-thread__by">
                <span className="lcp-avatar" aria-hidden>
                  {initialsFor(lead.authorDisplayName ?? "LC")}
                </span>
                <span>{lead.authorDisplayName}</span>
                <span aria-hidden>·</span>
                <span>
                  {lead.replyCount} {lead.replyCount === 1 ? "reply" : "replies"}
                </span>
              </p>
            </article>

            {/* Two compact supporting discussions. */}
            <ul className="lcp-comm__list">
              {rest.slice(0, 2).map((d) => (
                <li key={d.title} className="lcp-thread">
                  <p className="lcp-meta">
                    <span className="lcp-chip">{d.forum}</span>
                    <span>{d.lastActivityDisplay}</span>
                  </p>
                  <p className="lcp-thread__title">
                    {d.href ? <a href={d.href}>{d.title}</a> : d.title}
                  </p>
                  <p className="lcp-thread__by">
                    <span className="lcp-avatar" aria-hidden>
                      {initialsFor(d.authorDisplayName ?? "LC")}
                    </span>
                    <span>{d.authorDisplayName}</span>
                    <span aria-hidden>·</span>
                    <span>{d.replyCount} {d.replyCount === 1 ? "reply" : "replies"}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* The one continuation — a link appended after the grid, exactly the H-11 → /news pattern.
              The section's approved composition above is untouched. */}
          {s.data.moreHref ? (
            <p className="lcp-meta" data-more-community="true">
              <a href={s.data.moreHref}>{s.data.moreLabel ?? "Visit the community"} →</a>
            </p>
          ) : null}

          {/* §13 of LRG-UI-012 stands: community content is never labelled AI-generated. When the
              threads are review fixtures, the Conflict 41 disclosure replaces the membership claim —
              saying "written by members" over fixture threads would be the fabrication §17 forbids. */}
          <p className="lcp-note lcp-note--community">
            {s.data.disclosure ?? "Written by members of the LotteryCorner community."}
          </p>
        </Section>
      );
    }

    case "winners":
      return (
        <Section s={s}>
          <div className="lcp-module">
            <Media image={s.data.image} />
            <div className="lcp-module__body">
              <Grid min={220}>
                {s.data.items.map((w, i) => (
                  <div key={i} className="lcp-card lcp-card--compact">
                    <p style={{ margin: 0, fontSize: 15 }}>{w.text}</p>
                    {w.location ? (
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
                        {w.location}
                      </p>
                    ) : null}
                  </div>
                ))}
              </Grid>
            </div>
          </div>
        </Section>
      );

    case "stories": {
      /*
       * §8/§9 FINAL-STATE EDITORIAL.
       *
       * ⚠ Fabricated editorial, same recorded conflict as Community above. Genuine items win when they
       * exist; the sample lead and secondary are the fallback so the band is never a large empty area.
       *
       * Images: 16:9, object-fit cover, MEANINGFUL alt text (§9) because these carry a story role
       * rather than sitting decoratively beside a heading. All local assets — no remote image, no
       * stock photography, no image library.
       */
      const real = s.data.items;
      const lead = real[0] ?? SAMPLE_LEAD_STORY;
      const secondary = real[1] ?? SAMPLE_SECONDARY_STORY;
      return (
        <Section s={s} compact>
          {s.data.intro ? <p className="lcp-lede">{s.data.intro}</p> : null}
          <div className="lcp-ed__grid">
            <article className="lcp-ed__lead">
              <StoryImage
                image={lead.image}
                alt={"alt" in lead ? (lead as { alt: string }).alt : lead.title}
                lead
              />
              <p className="lcp-meta">
                {lead.category ? <span className="lcp-chip">{lead.category}</span> : null}
                {lead.dateDisplay ? <span>{lead.dateDisplay}</span> : null}
              </p>
              <h3 className="lcp-ed__lead-title">{lead.title}</h3>
              {lead.summary ? <p className="lcp-card__body">{lead.summary}</p> : null}
            </article>
            <article className="lcp-card--editorial">
              <StoryImage
                image={secondary.image}
                alt={"alt" in secondary ? (secondary as { alt: string }).alt : secondary.title}
              />
              <p className="lcp-meta">
                {secondary.category ? <span className="lcp-chip">{secondary.category}</span> : null}
              </p>
              <h3 className="lcp-card__title">{secondary.title}</h3>
              {secondary.summary ? <p className="lcp-card__body">{secondary.summary}</p> : null}
            </article>
          </div>
          {/* The one continuation, and only when the model supplies a REAL route (H-11 → /news). A link
              appended after the grid — the section's approved composition above is untouched. */}
          {s.data.moreHref ? (
            <p className="lcp-meta" data-more-news="true">
              <a href={s.data.moreHref}>{s.data.moreLabel ?? "More"} →</a>
            </p>
          ) : null}
        </Section>
      );
    }

    case "purchase":
      /*
       * §11 FINAL-STATE "Play your favourite games".
       *
       * A completed-looking selector set: game, state, a method summary, the "Where to Play" action,
       * the affiliate disclosure and the responsible-play note.
       *
       * The selectors are PRESENTATIONAL. They resolve no eligibility, reach no provider and store
       * nothing. The action opens the same local commerce overlay used on the featured cards — no
       * route, no external destination, no affiliate URL (CLAUDE.md §13).
       */
      return (
        <Section s={s} compact>
          <p className="lcp-lede">{s.data.copy}</p>
          <div className="lcp-playpick">
            <div className="lcp-playpick__field">
              <label htmlFor="lcp-pick-game">Game</label>
              <select id="lcp-pick-game" className="lcp-target" defaultValue={SAMPLE_PLAY_GAMES[0]}>
                {SAMPLE_PLAY_GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="lcp-playpick__field">
              <label htmlFor="lcp-pick-state">State</label>
              <select id="lcp-pick-state" className="lcp-target" defaultValue="">
                <option value="">Choose your state</option>
                {["Arizona", "California", "Florida", "Michigan", "New York", "Virginia"].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="lcp-an__short">{SAMPLE_PLAY_METHOD_SUMMARY}</p>
          <div className="lcp-actions">
            <PreviewOverlay
              mode="commerce"
              title="Where to play"
              subtitle="Availability varies by state"
              triggerLabel={s.data.purchase.label}
              /* LRG-STATE-038 FP-02 — the same one-token commerce swap. Label, destination, eligibility,
                 position and geometry are unchanged; only the colour variant moves. */
              triggerVariant="commerce"
            >
              <div className="lcp-play__panel">
                <p className="lcp-play__step-title">Ways to get a ticket</p>
                <p className="lcp-play__note">{SAMPLE_PLAY_METHOD_SUMMARY}</p>
                <p className="lcp-play__disclosure">{s.data.purchase.disclosure}</p>
                <p className="lcp-play__note">{s.data.purchase.eligibility.stateText}</p>
                <p className="lcp-play__note">
                  Play for entertainment and set your own limits. 18+ only, and age limits vary by
                  state.
                </p>
                <p className="lcp-play__note">
                  LotteryCorner is an independent publisher. We are not a lottery operator and we do
                  not sell tickets.
                </p>
              </div>
            </PreviewOverlay>
          </div>
          <CommerceDisclosure
            text={s.data.purchase.disclosure}
            eligibility={s.data.purchase.eligibility.stateText}
          />
        </Section>
      );

    case "account-value":
      /*
       * §12 FINAL-STATE Insider promotion — VISUAL ONLY.
       *
       * Four descriptive cards, no "Coming soon". CLAUDE.md §16 keeps Member/Insider architecture
       * behind open founder decisions, so this implements NO authentication, NO subscription, NO
       * entitlement, NO quota and NO storage, and nothing here implies the reader is signed in. It is
       * the anonymous Home's account-value promotion and nothing more.
       */
      return (
        <Section s={s} compact>
          {s.data.subheading ? <p className="lcp-lede">{s.data.subheading}</p> : null}
          <ul className="lcp-insider">
            {SAMPLE_INSIDER_CARDS.map((cd) => (
              <li key={cd.key} className="lcp-insider__card" data-insider={cd.key}>
                <p className="lcp-insider__title">{cd.title}</p>
                <p className="lcp-insider__body">{cd.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "return-channels":
      /*
       * §8 FINAL-STATE MEDIA CARD.
       *
       * ⚠ Fabricated video metadata, same recorded conflict. NOTHING is embedded and nothing links
       * out: no iframe, no widget, no partner script, no external request. The "not connected here"
       * and "coming soon" states are gone from final-state mode per §8, and the reminder/alert
       * channels render as clean final-looking rows without status badges.
       */
      return (
        <Section s={s} compact>
          {s.data.intro ? <p className="lcp-lede">{s.data.intro}</p> : null}
          <article className="lcp-media-card">
            <StoryImage image={SAMPLE_MEDIA_UPDATE.thumbnail} alt={SAMPLE_MEDIA_UPDATE.alt} />
            <div className="lcp-media-card__body">
              <p className="lcp-meta">
                <span className="lcp-chip">YouTube</span>
                <span>{SAMPLE_MEDIA_UPDATE.publishedDisplay}</span>
                <span aria-hidden>·</span>
                <span>{SAMPLE_MEDIA_UPDATE.durationLabel}</span>
              </p>
              <h3 className="lcp-card__title">{SAMPLE_MEDIA_UPDATE.title}</h3>
            </div>
          </article>
          <ul className="lcp-chanrow">
            {s.data.channels.map((c) => (
              <li key={c.label} data-channel-kind={c.kind}>
                <span className="lcp-chanrow__label">{c.label}</span>
                <span className="lcp-chanrow__body">{c.body}</span>
              </li>
            ))}
          </ul>
          <ul className="lcp-channels">
            {s.data.mediaChannels.map((c) => (
              <li key={c.label} className="lcp-channel" data-platform={c.platform}>
                <span className="lcp-channel__name">{c.label}</span>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "newsletter":
      /*
       * §13 FINAL-STATE newsletter. Value statement, email field, subscribe action, privacy note.
       *
       * IT TRANSMITS NOTHING. There is no form action, no method, no submit handler and no storage:
       * the field is `readOnly` so a value cannot even be captured, and the local sample confirmation
       * is a CSS-only reveal on the button's :focus. No email address is collected or sent anywhere.
       */
      return (
        <Section s={s} compact>
          <p className="lcp-lede">{SAMPLE_NEWSLETTER.value}</p>
          <div className="lcp-news-form">
            <label className="sr-only" htmlFor="lcp-news-email">
              Email address
            </label>
            <input
              id="lcp-news-email"
              type="email"
              readOnly
              placeholder={SAMPLE_NEWSLETTER.placeholder}
              className="lcp-news-form__input lcp-target"
            />
            <button type="button" className="lcp-btn lcp-btn--tonal lcp-target lcp-news-form__go">
              {SAMPLE_NEWSLETTER.action}
              <span className="lcp-news-form__done" aria-hidden>
                Subscribed
              </span>
            </button>
          </div>
          <p className="lcp-an__short">{SAMPLE_NEWSLETTER.privacyNote}</p>
        </Section>
      );

    case "trust":
      return (
        <Section s={s}>
          <p className="lcp-measure" style={{ margin: 0, fontSize: 15 }}>
            {s.data.sourcePolicy}
          </p>
          <p className="lcp-measure" style={{ margin: 0, fontSize: 15 }}>
            {s.data.accuracyPolicy}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {s.data.supportLinks.map((l) => (
              <ActionLink key={l.label} l={l} />
            ))}
          </div>
        </Section>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------- page */

/**
 * Presentation heading for the engagement band (LRG-UI-011 §3).
 *
 * This is a VISUAL GROUPING LABEL, not a governed content section: it has no BP-02 section ID, no
 * `data-section-id`, and it is not a landmark. Each member section keeps its own `<section id="H-…">`
 * element inside and remains separately identifiable in the DOM.
 *
 * It renders as an `<h2>` and the member sections drop to `<h3>`, which is the honest heading
 * structure for "three things grouped under one label" and keeps the outline free of skips.
 */
const BAND_LABELS: Record<string, string> = {
  /* Renamed by LRG-UI-012 §14: Community left this group to sit directly under H-05, so the label
     now describes what remains — news and media. Still a presentation label with no section ID. */
  "latest-from-lc": "Latest from LotteryCorner",
};

export default function HomePreview({
  vm,
  adMode = "production",
  debug = false,
}: {
  vm: HomePreviewViewModel;
  adMode?: HomePreviewAdMode;
  /** §1: off by default. Controls only whether internal status is DRAWN — never whether it exists. */
  debug?: boolean;
}) {
  const { page, entries } = vm;
  DEBUG = debug;

  /*
   * Advertising inventory accounting.
   *
   * LRG-UI-010 direction 1 removed the VISIBLE accounting line — slot keys and inventory counts are
   * developer terminology and have no place in player-facing copy. The accounting itself is NOT
   * removed: it moves onto data attributes on the page root, so the founder review, ad ops and any
   * later audit can still verify that every configured slot is placed and that the defined-but-
   * unmapped slot is recorded rather than dropped (CLAUDE.md §12).
   */
  /*
   * §19: the approved shape is 15 active + 8 non-active (1 retired + 5 implementation + 2 strategic).
   * This throws at render rather than letting a different inventory count ship silently.
   */
  assertHomeAdBaseline();
  const placed = placedSlotKeys();

  const renderEntry = (e: PreviewEntry) => {
    if (isAdAnchor(e)) {
      const anchor = anchorById(e.anchorId);
      if (!anchor) return null;
      /*
       * §8: a governed anchor may legitimately have no active placement after the retirement and the
       * disabling. It stays in the DOM as a documented anchor, but renders NO container and reserves
       * NO geometry — inventing a slot to keep every anchor visually populated is exactly what §8
       * forbids. Debug shows a marker so governance is still visible.
       */
      const hasActive = anchor.groups.some((g) => g.slotKeys.length > 0);
      return (
        <div key={e.id} id={e.id} data-ad-anchor-id={anchor.anchorId} data-ad-active-placement={hasActive ? "true" : "false"}>
          {!hasActive && DEBUG ? (
            <p className="lcp-adempty">NO ACTIVE AD PLACEMENT — {anchor.anchorId}</p>
          ) : null}
          {anchor.groups
            /* Rail groups render in the contextual rail, not inline. */
            .filter((g) => g.subPosition !== "rail" && g.subPosition !== "sticky")
            .map((g, i) => (
              <PreviewAdSlot
                key={`${anchor.anchorId}-${i}`}
                anchorId={anchor.anchorId}
                group={g}
                adMode={adMode}
                debug={debug}
              />
            ))}
        </div>
      );
    }
    return (
      <div key={e.id}>
        {renderSection(e)}
        {/* Registered disabled candidates sit after their named sections. Debug-only. */}
        <AdCandidateMarker afterSectionId={e.id} />
      </div>
    );
  };

  /*
   * Group CONTIGUOUS band members under one shared presentation wrapper (§3).
   *
   * Contiguity matters: the wrapper only ever collects entries that are already adjacent in the
   * sequence, so grouping can never reorder anything or pull a section out of its position. If the
   * experiment were reverted, the three sections would no longer be adjacent and each would simply
   * render standalone — no special-casing needed.
   */
  const renderSequence = () => {
    const out: React.ReactNode[] = [];
    let i = 0;
    while (i < entries.length) {
      const e = entries[i];
      const band = !isAdAnchor(e) ? e.band : undefined;
      if (!band) {
        out.push(renderEntry(e));
        i += 1;
        continue;
      }
      const members: PreviewEntry[] = [];
      while (i < entries.length) {
        const next = entries[i];
        if (isAdAnchor(next) || next.band !== band) break;
        members.push(next);
        i += 1;
      }
      out.push(
        <div key={`band-${band}`} className="lcp-happening" data-band={band}>
          <div className="lcp-happening__head">
            <h2 className="lcp-happening__title">{BAND_LABELS[band] ?? band}</h2>
            <p className="lcp-happening__sub">
              Durable guides and draw-night updates.
            </p>
          </div>
          {/* Three-part layout where content exists; one column on mobile, in the order
              Community → News → Video/Social. No carousel, no autoplay, no horizontal scroller. */}
          <div className="lcp-happening__grid">{members.map(renderEntry)}</div>
        </div>,
      );
    }
    return out;
  };

  return (
    <div
      className="lcp-sticky-clearance"
      data-ad-anchors={HOME_AD_ANCHORS.length}
      data-ad-slots-placed={placed.length}
      data-ad-slots-requested={0}
      data-ad-slots-unmapped={UNMAPPED_HOME_SLOTS.join(",")}
      data-ad-mode={adMode}
      /* Published accounting, inspectable without reading source. */
      data-ad-active={HOME_AD_ACCOUNTING.activeExistingLegacy}
      data-ad-retired={HOME_AD_ACCOUNTING.retiredLegacy}
      data-ad-candidates-implementation={HOME_AD_ACCOUNTING.disabledImplementationCandidates}
      data-ad-candidates-strategic={HOME_AD_ACCOUNTING.disabledStrategicCandidates}
      data-ad-anchors-without-placement={anchorsWithoutActivePlacement().join(",")}
    >
      <div className="lcp-container">
        {/*
         * SIGNED-IN LAYER MOUNT — the Global Shell §33 layering decision, stated where it is taken.
         *
         * The anonymous BP-02 composition below IS the server HTML, byte-identical for every request:
         * both mounts are client-only components whose server (and first-client-render) output is null,
         * so no member state, name or follow can ever be cached into this public page. When a browser
         * session exists, the BP-02 §38 personalized sections mount HERE, above the anonymous content —
         * fed only by the account store and by `entries`, the page's own already-rendered facts.
         * Personalization changes priority, never fact ownership (§38); nothing below is reordered.
         */}
        <SignedInHomeLayer facts={homeFactsFromEntries(entries)} />
        {/* Shell §12 guest continuity: anonymous, device-local, visible only when something is stored. */}
        <GuestProgress />
        {/* Page heading — exactly one h1. */}
        {/* Tightened in LRG-UI-010 so the flagship result cards sit as high as the blueprint allows.
            They cannot enter the 375x812 first viewport entirely: BP-02 §12 places the AD-H00 top
            leaderboard between the task entry and H-02A, and that slot must not be moved (§12 ad
            preservation). What is reachable is minimised, not the slot. */}
        <div className="lcp-homeintro" style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Responsive H1 so the mobile first viewport keeps room for the featured results. */}
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 5.2vw, 32px)",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {page.h1}
          </h1>
          <p className="lcp-measure" style={{ margin: 0, fontSize: 16 }}>
            {page.intro}
          </p>
          {/* Normal source/status treatment. The stale badge rides inside SourceNotice; there is
              no dominant banner and nothing implies an error occurred (LRG-UI-009 §8). */}
          <SourceNotice page={page} />
          {/* Correction UI renders ONLY when a real correction record exists. The default preview
              shows none; /?previewState=corrected exercises it (LRG-UI-009 §7). */}
          {page.correction.present ? (
            <CorrectionNotice
              what={page.correction.what}
              previousValue={page.correction.previousValue}
              replacementValue={page.correction.replacementValue}
              whenDisplay={page.correction.whenDisplay}
              impact={page.correction.impact}
            />
          ) : null}
        </div>

        {/*
          §2 — compact AI value statement near H-01.
          Deliberately one quiet line with the AI mark and a text action: it identifies the product's
          capability without promotional styling, and it is short enough that it does not push
          Powerball and Mega Millions materially lower (measured in the founder review).
        */}
        <p className="lcp-aivalue" data-ai-area="value-statement">
          <span className="lcp-aivalue__mark">
            <AiMark size={17} title="LotteryCorner AI" />
          </span>
          <span className="lcp-aivalue__text">{vm.shell.aiValueStatement.text}</span>
          {/* The action is rendered only where it has somewhere to go — LRG-UX-SCHEMA-002 §1. Home's H-05
              surface exists, so on Home it always does; the guard keeps the sentence honest if it ever does
              not, rather than falling back to a policy page. */}
          {vm.shell.aiValueStatement.href ? (
            <Link href={vm.shell.aiValueStatement.href} className="lcp-aivalue__link">
              {vm.shell.aiValueStatement.actionLabel}
            </Link>
          ) : null}
        </p>

        <div className="lcp-grid" style={{ marginTop: 16 }}>
          {/* Main column — the ordered 30-entry sequence. */}
          <div>{renderSequence()}</div>

          {/* Desktop contextual rail (>=992px only) — production ad slots only. */}
          <aside className="lcp-rail" aria-label="Sponsored">
            {railGroups().map(({ anchorId, group }, i) => (
              <PreviewAdSlot
                key={`${anchorId}-rail-${i}`}
                anchorId={anchorId}
                group={group}
                adMode={adMode}
                debug={debug}
              />
            ))}
          </aside>
        </div>

      </div>

      {/* §9 debug-only audit list of every non-active record. Renders nothing in normal mode. */}
      <AdNonActiveMarkers />

      {/* AD-H06 — sticky reservation. Rendered last, outside the container, priority 4. */}
      <StickyStack
        slotKeys={HOME_AD_ANCHORS.find((a) => a.anchorId === "AD-H06")?.groups[0].slotKeys ?? []}
        label="Inactive reservation — final production height not yet set"
        debug={debug}
      />
    </div>
  );
}
