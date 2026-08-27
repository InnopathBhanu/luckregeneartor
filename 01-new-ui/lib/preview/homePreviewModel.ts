/*
 * Home preview model — maps the existing Home fixture into the preview view model.
 *
 * Authority: home-preview-view-model.md (contract), home-preview-section-manifest.md (30-entry
 * sequence and per-section preview action / provenance / ad tier / mobile priority).
 *
 * READ-THROUGH, NOT REWRITE: 04-sample-data/home-page-sample.json is read unchanged through the
 * existing data-provider seam. The transformation lives here, in code, so the fixture stays intact
 * for the Phase 7 production view-model work.
 *
 * Founder decisions applied (LRG-UI-008):
 *  - Illustrative sections render clearly LABELLED illustrative content rather than blank sections.
 *  - Illustrative content is never presented as live results, real winners, current jackpots,
 *    actual claim deadlines, authoritative tax guidance or genuine community activity.
 *  - Production-derived fixture dates are NOT changed; a visible stale state is shown when old.
 */

import { getHomePage } from "../data-provider";
import type { HomePageData, ResultCard } from "../data-provider/types";
import { cleanCopy } from "../text/cleanCopy";
import { jackpotChange } from "../text/jackpotDelta";
import {
  homePriorJackpot, resolveHomeNextDraw, type ResolvedNextDraw,
} from "./homeDrawSchedule";
import {
  PREVIEW_SCHEMA_VERSION,
  PREVIEW_SUPERSEDED_BY,
  type HomePreviewViewModel,
  type LocalImage,
  type PreviewEntry,
  type PreviewSection,
  type ForwardJackpot,
  type Provenance,
  type PurchaseRef,
} from "./types";
import { daysSince, isStale } from "./previewGuard";
import { HOME_AD_ANCHORS } from "../layout/adAnchors";
import { bottomNavigation, primaryNavigation } from "../shell/globalShellModel";
import {
  COMMUNITY_HUB_PATH, communityDisclosure, recentCommunityDiscussions,
} from "../community/communityDiscussionSource";
import {
  analyseDraw,
  compareGames,
  drawFromCard,
  type DrawAnalysis,
  type HistoricalDraw,
} from "./drawAnalysis";

/*
 * Visible provenance labels (LRG-UI-010 direction 1).
 *
 * These stay VISIBLE — the Constitution forbids presenting synthetic content as real public fact, and
 * the build-blocking assertProvenanceLabels() check still requires one on every synthetic or
 * illustrative section. What changed is the WORDING: ordinary-player language ("Sample", "Example")
 * instead of developer terminology ("Illustrative preview", "Preview content").
 *
 * LRG-UI-011 refines the vocabulary so a label describes what is actually there:
 *   SAMPLE       the section renders synthetic content that must never be read as real fact.
 *   COMING_SOON  the section renders NO content — only an honest empty state or a description of
 *                what the surface will carry. "Sample" was wrong for these: nothing is sampled.
 */
const SAMPLE = "Sample";
const COMING_SOON = "Coming soon";

/*
 * Locally authored editorial imagery (direction 7). Every file is a small hand-written SVG under
 * /public/home-preview — no stock photography, no remote asset, no external request, and no image of
 * a real person or a real winner.
 */
const IMG = {
  jackpot: { src: "/home-preview/editorial-jackpot.svg", width: 320, height: 160 },
  winners: { src: "/home-preview/editorial-winners.svg", width: 320, height: 160 },
  guide: { src: "/home-preview/editorial-guide.svg", width: 320, height: 160 },
  news: { src: "/home-preview/editorial-news.svg", width: 320, height: 160 },
  community: { src: "/home-preview/editorial-community.svg", width: 320, height: 160 },
  video: { src: "/home-preview/editorial-video.svg", width: 320, height: 160 },
} satisfies Record<string, LocalImage>;

/*
 * Deterministic thumbnail assignment. Rotating over a fixed list keeps every editorial card visually
 * distinct without claiming that an image depicts the story it sits beside.
 */
function editorialImage(pool: LocalImage[], index: number): LocalImage {
  return pool[index % pool.length];
}

/**
 * Purchase reference. The destination is deliberately unresolved — see BP-04 §4 (`/play/{game}`) vs
 * the legacy and current implementation route (`/buynow/{code}`); reconciling them requires the URL
 * audit and founder approval.
 *
 * `density` controls only how long the disclosure copy is, never whether it appears. A commercial
 * action ALWAYS carries its disclosure. "compact" is for the repeated game cards, where the full
 * three-clause wording would print four or five times in one section and drown the content;
 * "full" is for H-12, where commerce is the purpose of the section.
 */
function purchaseRef(label: string, density: "compact" | "full" = "full"): PurchaseRef {
  return {
    label,
    routeRef: { status: "unresolved", candidates: ["/play/{game}", "/buynow/{code}"] },
    disclosure:
      density === "compact"
        ? "Partner links — we may earn a commission. Results are never affected."
        : "We may earn a commission if you buy through a partner. This does not change the results, numbers or information shown anywhere on LotteryCorner.",
    relAttributes: "nofollow sponsored",
    eligibility: {
      resolved: false,
      stateText:
        density === "compact"
          ? "Options depend on your state."
          : "Availability depends on your state. Select your state to see the options where you play.",
    },
  };
}

/**
 * Topics already covered in full by a Lottery Tools card (LRG-UI-016 §1).
 *
 * Keyed by normalised title. The two entries are the fixture's `systems.sections` titles; each maps to
 * the tool card that supersedes it. Explicit rather than fuzzy, because "Play responsibly" and
 * "Responsible Play" are the same topic with different wording and no string comparison would catch it.
 */
const TOOL_CARD_DUPLICATE_TOPICS: Record<string, string> = {
  "number analysis": "Number Analysis card",
  "play responsibly": "Responsible Play card",
};

function duplicatesToolCard(title: string): boolean {
  return title.trim().toLowerCase() in TOOL_CARD_DUPLICATE_TOPICS;
}

/* Small builders keep the 30-entry sequence below readable. */
type Envelope = Omit<PreviewSection, "kind" | "data">;

function env(
  o: Partial<Envelope> & Pick<Envelope, "id" | "name" | "order" | "provenance">,
): Envelope {
  const needsLabel = o.provenance === "synthetic" || o.provenance === "illustrative";
  return {
    headingLevel: 2,
    previewAction: "current-data",
    provenanceLabel: needsLabel ? SAMPLE : null,
    state: "ready",
    stateText: null,
    adTier: 0,
    protectedZone: false,
    intelligence: "none-documented",
    mobilePriority: 3,
    tone: "standard",
    family: "directory",
    ...o,
  } as Envelope;
}

/* ------------------------------------------------------------------------
 * FOUNDER-AUTHORIZED ENGAGEMENT-ORDER EXPERIMENT
 *
 * The `blueprintOrder` array below stays authored in BP-02 §12 order, so the frozen sequence remains
 * readable in source and the whole experiment is reversible by deleting one call.
 *
 * ROUND 1 — LRG-UI-011: H-10, H-11 and H-14 moved to sit immediately after AD-H03.
 * ROUND 2 — LRG-UI-012 §14: H-10 Community Live moves AGAIN, to sit immediately after
 *           H-05 LotteryCorner AI, so the page reads "AI explains -> people discuss". H-11 and H-14
 *           stay in the later band, now labelled "Latest from LotteryCorner".
 *
 * Section IDs were read from home-preview-section-manifest.md §2, not inferred.
 *
 * WHAT DOES NOT CHANGE:
 *   - every section ID is retained EXACTLY ONCE; nothing is merged, renamed, invented or dropped;
 *   - all 7 anchors remain and keep their order RELATIVE TO ONE ANOTHER;
 *   - all 20 mapped slots remain, attached to their anchors rather than to sequence numbers;
 *   - H-10A Winners and H-11A Guides stay in their existing later editorial positions;
 *   - the frozen Home blueprint is NOT amended. See
 *     03-docs/08-decisions/home-engagement-order-preview-experiment.md.
 *
 * The transform is self-verifying: it throws rather than silently losing a section.
 * ------------------------------------------------------------------------ */
interface OrderMove {
  ids: readonly string[];
  afterId: string;
  reason: string;
}

const ORDER_MOVES: readonly OrderMove[] = [
  {
    /* Round 2 first: Community sits directly under the AI section it complements. */
    ids: ["H-10"],
    afterId: "H-05",
    reason: "LRG-UI-012 §14 — Community immediately follows LotteryCorner AI",
  },
  {
    /* Round 1 remainder: news and media form the later engagement band. */
    ids: ["H-11", "H-14"],
    afterId: "AD-H03",
    reason: "LRG-UI-011 §2 — news and media band after the mid-page advertisement",
  },
];

function applyEngagementOrderExperiment(source: PreviewEntry[]): PreviewEntry[] {
  let out = [...source];

  for (const move of ORDER_MOVES) {
    const moved = move.ids.map((id) => {
      const found = out.find((e) => e.id === id);
      if (!found) {
        throw new Error(
          `Home order experiment (${move.reason}): section ${id} is missing from the sequence. ` +
            `A move must never silently render short — fix the sequence or update the decision record.`,
        );
      }
      return found;
    });

    const rest = out.filter((e) => !move.ids.includes(e.id));
    const at = rest.findIndex((e) => e.id === move.afterId);
    if (at < 0) {
      throw new Error(
        `Home order experiment (${move.reason}): target ${move.afterId} not found.`,
      );
    }
    out = [...rest.slice(0, at + 1), ...moved, ...rest.slice(at + 1)];
  }

  /* Integrity assertions — a reorder must never become a reduction or a duplication. */
  if (out.length !== source.length) {
    throw new Error(`Home order experiment: entry count changed ${source.length} -> ${out.length}.`);
  }
  const ids = out.map((e) => e.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Home order experiment: a section ID appears more than once.");
  }
  if (ids.slice().sort().join(",") !== source.map((e) => e.id).sort().join(",")) {
    throw new Error("Home order experiment: the set of section IDs changed during reordering.");
  }
  const anchorSeq = (list: PreviewEntry[]) =>
    list.filter((e) => e.kind === "ad-anchor").map((e) => e.id).join(",");
  if (anchorSeq(source) !== anchorSeq(out)) {
    throw new Error(
      "Home order experiment: advertising anchors were reordered. Anchor order may only change " +
        "with explicit evidence and documentation (CLAUDE.md §12).",
    );
  }

  return out.map((e, i) => ({ ...e, order: i + 1 }) as PreviewEntry);
}

export type PreviewStateName = "default" | "corrected";

export function buildHomePreview(
  now: Date = new Date(),
  previewState: PreviewStateName = "default",
): HomePreviewViewModel {
  const fx: HomePageData = getHomePage();
  const p = fx.page;

  const isoModified = p.lastUpdated?.isoDateModified;
  const stale = isStale(isoModified, now);
  const ageDays = daysSince(isoModified, now);
  /*
   * LRG-UI-009 §8: the genuine stale status is PRESERVED (fixture dates are not refreshed), but
   * demoted from a large dominant banner to a compact badge beside "Last updated". A larger warning
   * is reserved for cases where staleness materially affects result reliability.
   */
  /*
   * LRG-UI-013 §1 forbids the visible word "Sample"; §2 explicitly RETAINS stale/freshness fields.
   * So the badge stays — the fixture genuinely is this old and hiding that would be worse — and only
   * the wording changes to a plain freshness statement.
   */
  const staleNote = stale ? `Updated ${ageDays} days ago` : null;
  const staleDetail = stale
    ? `These results were last updated ${ageDays} days ago. Results normally update shortly after each official draw.`
    : null;

  /*
   * ══ THE FIXTURE ENRICHMENT — §B1 AND §B2 ON HOME ══
   *
   * Both modules shipped working and rendered nothing here, because the Home fixture carried a next-draw DISPLAY
   * STRING and a single jackpot figure. `homeDrawSchedule.ts` resolves what they need from the production-derived
   * draw-event records: the game's published draw days, its local draw time, its governed IANA zone, and the pair of
   * advertised figures the feed already holds.
   *
   * NOTHING IS INVENTED IN EITHER HELPER. A game with no captured schedule gets no datetime; a game whose feed
   * record withholds a prize figure gets no delta. Both modules then render nothing, which is the specified
   * behaviour and is kept deliberately — see `NOT_CAPTURED` and `homePriorJackpot`.
   */

  /** A result card with its next drawing resolved from the game's schedule. Absent where none is governed. */
  const withNextDraw = (c: ResultCard): ResultCard => {
    const next = resolveHomeNextDraw(c.gameSlug ?? c.displayName);
    if (!next || !c.nextDraw) return c;
    return {
      ...c,
      nextDraw: {
        ...c.nextDraw,
        gameLocalDate: next.gameLocalDate,
        ...(next.drawTimeLocal ? { drawTimeLocal: next.drawTimeLocal } : {}),
        timeZone: next.timeZone,
      },
    };
  };

  /** The same three fields, shaped for a row or an upcoming item rather than a card. */
  const timingRef = (next: ResolvedNextDraw | null) => (next
    ? {
        nextDrawLocalDate: next.gameLocalDate,
        ...(next.drawTimeLocal ? { nextDrawTimeLocal: next.drawTimeLocal } : {}),
        nextDrawTimeZone: next.timeZone,
      }
    : {});

  /* Result cards come straight from the fixture and carry REAL values from the production feed. */
  const allFeatured: ResultCard[] = (fx.featureGames?.cards ?? []).map(withNextDraw);

  /*
   * LRG-UI-009 §1: Powerball and Mega Millions are the ONLY two rich featured cards. Any other
   * national game supplied in featureGames (currently Lotto America) moves visually into the
   * compact comparison section, H-02B. The BP-02 section ORDER is unchanged — only which section
   * renders which game changes.
   */
  const FLAGSHIP = ["powerball", "mega-millions"];
  const featured = allFeatured.filter((c) => FLAGSHIP.includes(c.gameSlug));
  const demotedToComparison = allFeatured.filter((c) => !FLAGSHIP.includes(c.gameSlug));
  const latest: ResultCard[] = (fx.latestResults?.cards ?? []).map(withNextDraw);

  const stateList = (fx.browseByState?.states ?? []).map((s) => ({
    code: s.code,
    name: cleanCopy(s.name, s.code.toUpperCase()),
    href: s.href,
  }));

  /*
   * H-05 AI Daily Brief — DETERMINISTIC FALLBACK ONLY.
   * Lines are derived from the real result data already on the page. No generated text, no
   * prediction language, no probability claim. Constitution §13/§15.
   */
  const briefLines: string[] = [];
  for (const c of featured.slice(0, 2)) {
    const label = cleanCopy(c.displayName);
    const when = cleanCopy(c.resultDate?.display);
    if (c.status === "awaiting") {
      briefLines.push(`${label}: results for the ${when} draw are not published yet.`);
    } else {
      const n = c.groupsDrawn?.[0]?.values?.length ?? 0;
      briefLines.push(`${label}: ${n} numbers were drawn on ${when}.`);
    }
    if (c.nextDraw?.display) {
      briefLines.push(`${label}: the next draw is ${cleanCopy(c.nextDraw.display)}.`);
    }
  }
  if (briefLines.length === 0) {
    briefLines.push("No draw activity is available in this sample data.");
  }

  /*
   * Awaiting-result card, derived from the fixture's GENUINE awaiting entry (a draw that has
   * happened but whose numbers are not published yet). This makes the awaiting state reviewable
   * without inventing a result: the ball row is a height-reserving placeholder, never fake numbers.
   */
  const awaitingItem = (fx.upcoming?.items ?? []).find((u) => u.status === "awaiting");
  const awaitingCard: ResultCard | null = awaitingItem
    ? {
        gameId: -1, // preview-only sentinel; not a real gameId and never used as one
        gameSlug: "awaiting-preview",
        displayName: cleanCopy(awaitingItem.game),
        formatRef: { gameId: -1 },
        status: "awaiting",
        statusMessage: cleanCopy(awaitingItem.statusNote, "Awaiting result"),
        resultDate: { gameLocalDate: "", display: cleanCopy(awaitingItem.display) },
        groupsDrawn: [], // no values exist yet — nothing is fabricated
        nextDraw: { display: cleanCopy(awaitingItem.display) },
      }
    : null;

  /*
   * H-11 editorial split (LRG-UI-011 §5).
   *
   * Classify each fixture story before rendering it. An item is treated as EVERGREEN help content
   * only when its category says so; anything else in this fixture is a synthetic current-news claim
   * and is not rendered at all. Nothing is relabelled to sneak it through — a jackpot-movement
   * headline dressed as a "Guide" would be worse than dropping it.
   */
  const EVERGREEN_CATEGORIES = ["guides", "guide", "analysis", "taxes", "ai & tools"];
  const evergreenStories = (fx.liveNews?.items ?? [])
    .filter((n) => EVERGREEN_CATEGORIES.includes(cleanCopy(n.category).trim().toLowerCase()))
    .map((n, i) => ({
      title: cleanCopy(n.title),
      href: n.href,
      summary: n.summary ? cleanCopy(n.summary) : undefined,
      /* No dateDisplay: evergreen help content is not dated, and the fixture's date would read as a
         publication date for a story that was never published. */
      category: "Guide",
      image: editorialImage([IMG.guide, IMG.news], i),
    }));

  /* ------------------------------------------------------------------ AI Draw Analysis
   * LRG-UI-012 §4/§5/§18. Every figure is computed locally by ./drawAnalysis.
   *
   * THE ARCHIVE. `home-preview-historical-data-inventory.md` records the finding: this repository
   * holds exactly ONE draw per game. There is no archive of past draws in 04-sample-data, the DB
   * export, the production page capture or the legacy app.
   *
   * So the archive handed to the analyser is what genuinely exists — the draws on this page. It is
   * deliberately assembled from the same cards the page renders rather than invented, and the
   * analyser deduplicates and effective-date-filters it. Every cross-draw metric is implemented and
   * gated on sample size, so the moment a real archive is supplied here the analysis fills in with no
   * code change.
   *
   * NOT included: the Powerball Double Play secondary draw. It is a separate game product drawn
   * independently, and folding it into the Powerball sample would misstate frequency and repeats even
   * though it shares the 5/69 + 1/26 matrix.
   */
  const archiveFor = (slug: string): HistoricalDraw[] => {
    const own = allFeatured.filter((c) => c.gameSlug === slug);
    return own.map(drawFromCard).filter((d): d is HistoricalDraw => d !== null);
  };

  const analyses: Record<string, DrawAnalysis> = {};
  for (const card of featured) {
    const a = analyseDraw(card, archiveFor(card.gameSlug));
    if (a) analyses[card.gameSlug] = a;
  }
  /* Local comparison across the flagship games. Sums are normalised per game range — never compared
     raw, because Powerball draws 1-69 and Mega Millions 1-70. */
  /*
   * ══ BP-02 §14's ADVERTISED JACKPOT, PAIRED WITH THE DRAWN RESULT'S FIGURE ══
   *
   * §14's "Required visible content for each game" lists BOTH *"advertised jackpot"* and *"latest verified winning
   * numbers"*, and the user job it serves is *"see the current jackpot … see the latest winning numbers … know the
   * next drawing"*. The card carried only the figure advertised for the drawing that already happened, so the
   * forward jackpot — the one a reader is deciding about — was absent, and the figure that WAS shown sat above a
   * next-draw date with nothing to stop it being read as that drawing's jackpot.
   *
   * Both figures now name their exact drawing. Nothing is derived here: `homePriorJackpot` already resolves the
   * pair from the production feed, and `jackpotChange` already refuses any approximate value. This only pairs them
   * with the two drawing dates the card already holds.
   *
   * RESOLVED ON THE SERVER, deliberately. The sentence lands in the initial HTML, so adding it cannot move the
   * ad anchors after hydration — the layout-shift requirement is met by construction rather than by a reservation.
   */
  const forwardJackpots: Record<string, ForwardJackpot> = {};
  for (const card of featured) {
    const prior = homePriorJackpot(card.gameSlug ?? card.displayName);
    /* All four parts must exist. A forward figure with no drawing date, or a drawing date with no figure, is not a
       statement a reader can act on — so the card renders neither rather than half of one. */
    const amount = card.nextDraw?.nextJackpotDisplay;
    const forwardDate = card.nextDraw?.display;
    const resultDate = card.resultDate?.display;
    if (!prior || !amount || !forwardDate || !resultDate) continue;
    const change = jackpotChange(
      prior.currentAmountDisplay, prior.previousAmountDisplay, prior.previousDrawLabel,
    );
    forwardJackpots[card.gameSlug] = {
      amountDisplay: cleanCopy(amount),
      drawDateDisplay: cleanCopy(forwardDate),
      /*
       * DATE ONLY, no draw time.
       *
       * `resultDate.display` is "Wednesday, 07/08/2026 — 10:59 PM ET", which is right for the result heading and
       * wrong inside a label: it produced *"advertised for the Wednesday, 07/08/2026 — 10:59 PM ET drawing"*, which
       * puts a time in the middle of a phrase that ends in "drawing". The em-dash separator is the fixture's own,
       * so splitting on it takes the date the fixture published rather than reformatting one — and the label stays
       * an exact date, which is what the Constitution asks for.
       */
      resultDrawDateDisplay: cleanCopy(resultDate).split(" — ")[0],
      changeSentence: change?.sentence ?? null,
    };
  }

  const flagshipAnalyses = FLAGSHIP.map((s) => analyses[s]).filter(Boolean);
  const comparison = flagshipAnalyses.length >= 2 ? compareGames(flagshipAnalyses) : null;

  /* Authored in BP-02 §12 blueprint order. The engagement-order experiment is applied afterwards. */
  const blueprintOrder: PreviewEntry[] = [
    // 1 — H-01
    {
      ...env({
        id: "H-01",
        name: "Home Task Entry",
        order: 1,
        family: "results",
        provenance: "illustrative",
        provenanceLabel: COMING_SOON,
        previewAction: "transformed-fixture",
        protectedZone: true,
        intelligence: "next-action",
        mobilePriority: 1,
        tone: "quiet",
      }),
      kind: "task-entry",
      data: {
        taskEntries: [
          { label: "Latest results", href: "#H-03", state: "live" },
          { label: "Check my numbers", href: "#H-04", state: "preview-unavailable" },
          { label: "All states", href: "#H-14B", state: "live" },
        ],
        /*
         * LRG-UI-009 §2: the State selector stays in H-01 but loses its visual dominance. It is a
         * compact utility ("Your state: Select a state"), NOT the main Home task, and the fuller
         * state exploration experience stays in its later approved section (H-07 / H-14B).
         */
        stateEntryHeading: "Your state",
        stateEntryIntro: "",
        compactAiLabel: "Ask AI",
        stateOptions: stateList.map((s) => ({ code: s.code, name: s.name })),
      },
    },
    { id: "AD-H00", name: "Existing Top Leaderboard", order: 2, kind: "ad-anchor", anchorId: "AD-H00" },
    // 3 — H-02A
    {
      ...env({
        id: "H-02A",
        name: "Featured National Games — Powerball and Mega Millions",
        order: 3,
        family: "results",
        provenance: "production-derived",
        adTier: 0,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 1,
        tone: "feature",
        /*
         * LRG-UI-013 §6: NO section-level AI row here. Each featured card already carries "Explore AI
         * analysis" and one shared "Compare these games" sits below both. A third and fourth AI link
         * in the same section is exactly the clutter §6 rules out.
         */
      }),
      kind: "result-cards",
      data: {
        /*
         * The fixture heading names three games ("... & Lotto America"). Since Lotto America now
         * renders in the H-02B comparison (§1.2), the heading must describe what this section
         * ACTUALLY shows. BP-02 §12 names this section for the two flagship games.
         */
        heading: "Powerball & Mega Millions",
        cards: featured,
        analyses,
        forwardJackpots,
        comparison,
      },
    },
    { id: "AD-H01", name: "Featured-Game Interstitial / Desktop Rail", order: 4, kind: "ad-anchor", anchorId: "AD-H01" },
    // 5 — H-02B
    {
      ...env({
        id: "H-02B",
        name: "Additional Top Jackpots",
        order: 5,
        family: "results",
        provenance: "production-derived",
        previewAction: "transformed-fixture",
        adTier: 1,
        intelligence: "deterministic",
        mobilePriority: 2,
      }),
      kind: "jackpot-table",
      data: {
        heading: cleanCopy(fx.topJackpots?.heading, "Top jackpots"),
        intro: cleanCopy(fx.topJackpots?.intro),
        rows: (() => {
          const rows = (fx.topJackpots?.rows ?? []).map((r) => {
            const game = cleanCopy(r[0]);
            /*
             * §B2. The row's `amountDisplay` IS the advertised figure for the NEXT drawing, so the reference point
             * is the drawing that happened — both figures from the same feed record, neither estimated. Resolved
             * from the registry rather than duplicated into a fourth fixture column: the same production-derived
             * numbers already reach the page through `featureGames`, and two copies of a money figure is one copy
             * too many.
             */
            const prior = homePriorJackpot(game);
            return {
              game,
              amountDisplay: cleanCopy(r[1]),
              estimatedLabel: "estimated jackpot",
              nextDrawDisplay: cleanCopy(r[2]),
              statusText: r[3] ? cleanCopy(r[3]) : undefined,
              ...(prior
                ? {
                    previousAmountDisplay: prior.previousAmountDisplay,
                    previousDrawLabel: prior.previousDrawLabel,
                  }
                : {}),
              ...timingRef(resolveHomeNextDraw(game)),
            };
          });
          // Demoted national games join the comparison rather than disappearing.
          for (const c of demotedToComparison) {
            const name = cleanCopy(c.displayName);
            if (rows.some((r) => r.game === name)) continue;
            const prior = homePriorJackpot(c.gameSlug ?? name);
            rows.push({
              game: name,
              amountDisplay: cleanCopy(c.prizeDisplay, "—"),
              estimatedLabel: "estimated jackpot",
              nextDrawDisplay: cleanCopy(c.nextDraw?.display),
              statusText: undefined,
              ...(prior
                ? {
                    previousAmountDisplay: prior.previousAmountDisplay,
                    previousDrawLabel: prior.previousDrawLabel,
                  }
                : {}),
              ...timingRef(resolveHomeNextDraw(c.gameSlug ?? name)),
            });
          }
          return rows;
        })(),
      },
    },
    // 6 — H-03
    {
      ...env({
        id: "H-03",
        name: "Latest U.S. and State Results",
        order: 6,
        /* §5: H-03's action is an overlay trigger rendered by the section, not a plain row. */
        family: "results",
        provenance: "production-derived",
        adTier: 0,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 1,
        tone: "feature",
      }),
      kind: "result-groups",
      data: {
        /* Representative analysis for H-03's single AI action (§5/§9). */
        analysisRef: analyses[FLAGSHIP[0]],
        heading: cleanCopy(fx.latestResults?.heading, "Latest results"),
        intro: cleanCopy(fx.latestResults?.intro),
        groups: [{ groupKey: "national", heading: "National and state games", cards: latest }],
      },
    },
    { id: "AD-H02", name: "Post-Results Advertisement", order: 7, kind: "ad-anchor", anchorId: "AD-H02" },
    // 8 — H-04
    {
      ...env({
        id: "H-04",
        name: "Check My Numbers",
        order: 8,
        /* §6: one action per section. The other follow-ups belong inside the AI overlay. */
      aiActions: [{ label: "Explain prize tiers", icon: "explain", state: "preview-unavailable" }],
        family: "tools",
        provenance: "illustrative",
        provenanceLabel: COMING_SOON,
        previewAction: "labelled-preview-state",
        adTier: 1,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 2,
        state: "unavailable",
        stateText: "Number checking opens after launch. Nothing is compared here.",
      }),
      kind: "check-numbers",
      data: {
        heading: "Check my numbers",
        intro: "Compare your numbers against a published draw.",
        howItWorks: ["Pick the game and draw date", "Enter the numbers on your ticket", "See which numbers matched"],
      },
    },
    // 9 — H-05
    {
      ...env({
        id: "H-05",
        name: "LotteryCorner AI Daily Brief",
        order: 9,
        family: "tools",
        provenance: "production-derived",
        previewAction: "labelled-preview-state",
        adTier: 0,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 2,
        tone: "feature",
      }),
      kind: "ai-brief",
      data: {
        heading: "Today's brief",
        aiLabel: "LotteryCorner AI",
        mode: "deterministic-fallback",
        summaryLines: briefLines,
        citations: [{ label: "See the full results", href: "#H-03", state: "live" }],
        /*
         * LRG-UI-010 direction 5 — LotteryCorner AI must read as a real platform capability rather
         * than a generic chat bubble. These are the named, surface-relevant things it does. Each one
         * carries its own availability state, so describing a capability never implies it is live.
         * Nothing here promises a prediction, an edge, or better odds.
         */
        /*
         * LRG-UI-011 §16 — the six prioritized capabilities, in the founder's order. Not expanded to
         * look busier: six is the list, and the first is FEATURED while the rest render as compact
         * prompt links rather than a wall of outlined buttons.
         *
         * `generatesNumbers` marks the one capability that produces a number set. It forces the odds
         * disclaimer to stay visible — Constitution §15 prohibits implying that generation changes
         * the odds of a fair independent draw.
         */
        capabilities: [
          {
            title: "Explain these winning numbers",
            body: "What was drawn, when, and what each ball group and multiplier on this page means.",
            state: "preview-unavailable" as const,
          },
          {
            title: "Compare Powerball and Mega Millions",
            body: "Ticket price, draw nights, ball ranges and how the two games differ.",
            state: "preview-unavailable" as const,
          },
          {
            title: "Explain cash versus annuity",
            body: "How the two payout choices work, in plain terms. Not tax or financial advice.",
            state: "preview-unavailable" as const,
          },
          {
            title: "Show claim steps for my state",
            body: "Where to claim, what to bring and the deadline that applies where you play.",
            state: "preview-unavailable" as const,
          },
          {
            title: "Help me understand the odds",
            body: "What the published odds for a prize tier actually mean.",
            state: "preview-unavailable" as const,
          },
          {
            title: "Generate an entertainment-only number set",
            body: "A random set, chosen for fun. See the note below on what that means for the odds.",
            state: "preview-unavailable" as const,
          },
        ],
        /* Shown wherever a generated number set is offered. Visible, not tucked into a tooltip. */
        oddsDisclaimer:
          "Generated numbers are for entertainment only. Every draw is independent, and no number set — however it is chosen — changes the odds of winning.",
        examplePrompts: [
          "Did anyone win Powerball last night?",
          "How long do I have to claim a prize in Florida?",
        ],
        askLabel: "Ask about these results",
        /* §9/§10: one short contextual question action lives with the featured capability. */
        /*
         * §7: describe what this is, rather than repeating what it is not. The one place an odds
         * statement must stay visible is the entertainment-only generator, and `oddsDisclaimer`
         * carries it there. Restating "AI does not predict" under every block was the repetitive
         * disclaimer the founder asked us to drop.
         */
        disclaimer:
          "Answers are built from the published results on this page, cite what they draw on, and are always labelled as AI. Official verification always stays with the state lottery source.",
      },
    },
    // 10 — H-06A
    {
      ...env({
        id: "H-06A",
        name: "Live and Recently Completed Draws",
        order: 10,
        aiActions: [{ label: "Explain draw status", icon: "explain", state: "preview-unavailable" }],
        family: "results",
        provenance: "production-derived",
        previewAction: "transformed-fixture",
        adTier: 0,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 2,
      }),
      kind: "draw-status",
      data: {
        /*
         * awaitingCard exercises the awaiting-result card state for founder review (specification
         * representative example 6). It is built from the GENUINE awaiting entry in the fixture —
         * a real draw whose numbers are not published yet — not from invented data. When no
         * awaiting draw exists in the data, it is null and no card is shown.
         */
        awaitingCard: awaitingCard,
        heading: "Live and recently completed draws",
        rows: (fx.upcoming?.items ?? []).map((u) => {
          const awaiting = u.status === "awaiting";
          return {
            game: cleanCopy(u.game),
            drawDisplay: cleanCopy(u.display),
            status: awaiting ? ("awaiting" as const) : ("completed" as const),
            statusText: awaiting
              ? cleanCopy(u.statusNote, "Awaiting result — the draw has happened but numbers are not published yet.")
              : "Result published",
          };
        }),
      },
    },
    // 11 — H-06B
    {
      ...env({
        id: "H-06B",
        name: "Tonight and Upcoming Draws",
        order: 11,
        aiActions: [{ label: "Explain draw timing", icon: "explain", state: "preview-unavailable" }],
        family: "results",
        provenance: "production-derived",
        previewAction: "transformed-fixture",
        adTier: 1,
        intelligence: "deterministic",
        mobilePriority: 2,
      }),
      kind: "upcoming",
      data: {
        heading: cleanCopy(fx.upcoming?.heading, "Upcoming draws"),
        items: (fx.upcoming?.items ?? []).map((u) => ({
          game: cleanCopy(u.game),
          drawDisplay: cleanCopy(u.display),
          jackpotDisplay: u.jackpot ? cleanCopy(u.jackpot) : undefined,
          estimatedLabel: u.jackpot ? "estimated jackpot" : undefined,
          statusText: u.statusNote ? cleanCopy(u.statusNote) : undefined,
          /* §B1. Resolved by NAME here — the upcoming module identifies a game by name only. */
          ...timingRef(resolveHomeNextDraw(cleanCopy(u.game))),
        })),
      },
    },
    { id: "AD-H03", name: "Post-Live-Draw Advertisement", order: 12, kind: "ad-anchor", anchorId: "AD-H03" },
    // 13 — H-07
    {
      ...env({
        id: "H-07",
        name: "Explore Your State",
        order: 13,
        aiActions: [{ label: "Explain state game rules", icon: "explain", state: "preview-unavailable" }],
        family: "directory",
        provenance: "copied",
        adTier: 0,
        protectedZone: true,
        intelligence: "next-action",
        mobilePriority: 2,
      }),
      kind: "state-explore",
      data: {
        heading: cleanCopy(fx.stateSearch?.heading, "Explore your state"),
        intro: cleanCopy(fx.browseByState?.intro),
        states: stateList,
      },
    },
    // 14 — H-08
    {
      ...env({
        id: "H-08",
        name: "Worth Knowing / Intelligent Highlights",
        order: 14,
        aiActions: [{ label: "Explain this historical pattern", icon: "history", state: "preview-unavailable" }],
        family: "community",
        provenance: "synthetic",
        previewAction: "transformed-fixture",
        adTier: 0,
        intelligence: "interesting-fact",
        mobilePriority: 3,
      }),
      kind: "highlights",
      data: {
        heading: cleanCopy(fx.news?.heading, "Worth knowing"),
        intro: cleanCopy(fx.news?.intro),
        items: [
          ...(fx.news?.recentWins ?? []).map((w) => ({
            kind: "recent-win" as const,
            text: cleanCopy(w.text),
            location: cleanCopy(w.location),
          })),
          ...(fx.news?.unclaimedPrizes ?? []).map((u) => ({
            kind: "unclaimed" as const,
            text: cleanCopy(u.game),
            amount: cleanCopy(u.amount),
            location: cleanCopy(u.location),
            note: u.note ? cleanCopy(u.note) : undefined,
          })),
          ...(fx.news?.jackpotGrowth ?? []).map((g) => ({
            kind: "jackpot-growth" as const,
            text: cleanCopy(g.text),
            location: cleanCopy(g.game),
          })),
        ],
      },
    },
    // 15 — H-09
    {
      ...env({
        id: "H-09",
        name: "Tools, Systems and Number Exploration",
        order: 15,
        aiActions: [{ label: "Explain a tool", icon: "explain", state: "preview-unavailable" }],
        family: "tools",
        provenance: "illustrative",
        adTier: 1,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 3,
        tone: "quiet",
      }),
      kind: "tools",
      data: {
        heading: cleanCopy(fx.tools?.heading, "Tools and number exploration"),
        intro: cleanCopy(fx.tools?.intro),
        tools: (fx.tools?.items ?? []).map((t) => ({
          label: cleanCopy(t.label),
          href: t.href,
          state: "preview-unavailable" as const,
        })),
        /*
         * LRG-UI-016 §1: drop the plain rows that DUPLICATE a Lottery Tools card.
         *
         * The final-state tool cards added in LRG-UI-013 cover "Number Analysis" and "Responsible
         * Play" in full, so the fixture's `systems.sections` entries for the same two topics rendered
         * a second, thinner copy directly beneath them. The complete cards are kept; the duplicate
         * rows go.
         *
         * Filtered by TOPIC rather than by deleting the accordion path, so any future non-duplicate
         * system section still renders. The equivalence is explicit because the two wordings differ:
         * "Play responsibly" is the same topic as the "Responsible Play" card but not the same string.
         * `04-sample-data/home-page-sample.json` is NOT modified.
         */
        systems: (fx.systems?.sections ?? [])
          .filter((sec) => !duplicatesToolCard(cleanCopy(sec.title)))
          .map((s) => ({
            title: cleanCopy(s.title),
            body: s.body ? cleanCopy(s.body) : undefined,
            list: s.list?.map((i) => cleanCopy(i)),
          })),
      },
    },
    // 16 — H-09A
    {
      ...env({
        id: "H-09A",
        name: "Popular Games",
        order: 16,
        aiActions: [{ label: "Compare games", icon: "compare", state: "preview-unavailable" }],
        family: "directory",
        provenance: "production-derived",
        adTier: 1,
        intelligence: "deterministic",
        mobilePriority: 3,
      }),
      kind: "popular-games",
      data: {
        heading: cleanCopy(fx.popularGames?.heading, "Popular games"),
        items: (fx.popularGames?.items ?? []).map((g) => ({
          slug: g.slug,
          displayName: cleanCopy(g.displayName),
          href: g.href,
          jurisdiction: g.jurisdiction ? cleanCopy(g.jurisdiction) : undefined,
          topPrizeDisplay: g.topPrize ? cleanCopy(g.topPrize) : undefined,
          nextDrawDisplay: g.nextDraw ? cleanCopy(g.nextDraw) : undefined,
          purchase: g.buyTickets ? purchaseRef("Where to play", "compact") : undefined,
        })),
      },
    },
    // 17 — H-09B
    {
      ...env({
        id: "H-09B",
        name: "Jackpot History and Comparisons",
        order: 17,
        family: "directory",
        provenance: "production-derived",
        adTier: 2,
        intelligence: "deterministic",
        mobilePriority: 4,
      }),
      kind: "jackpot-history",
      data: {
        /*
         * LRG-UI-014 "Clarify repeated content modules": reframed from the fixture's
         * "Jackpot Snapshot & Comparison" to **Jackpot Trends & History**, so it no longer overlaps
         * H-02B "Top Jackpots Right Now". H-02B owns the CURRENT jackpot comparison; this section owns
         * movement over time. The governed section ID H-09B is unchanged.
         */
        heading: "Jackpot Trends & History",
        intro: cleanCopy(fx.jackpotHistory?.intro),
        items: (fx.jackpotHistory?.items ?? []).map((j) => ({
          game: cleanCopy(j.game),
          href: j.href,
          amountDisplay: cleanCopy(j.current, "—"),
          estimatedLabel: "estimated jackpot",
          nextDrawDisplay: j.nextDraw ? cleanCopy(j.nextDraw) : undefined,
          statusText: j.status ? cleanCopy(j.status) : undefined,
        })),
        chart: null,
        chartReason:
          "A trend chart appears once real historical jackpot data is available. It is never simulated.",
      },
    },
    { id: "AD-H04", name: "Lower Utility Advertisement", order: 18, kind: "ad-anchor", anchorId: "AD-H04" },
    // 19 — H-10
    {
      ...env({
        id: "H-10",
        name: "Community Live",
        order: 19,
        family: "community",
        /* LRG-UI-012 §14: H-10 leaves the three-item band and stands on its own immediately after
           H-05, so it regains its own h2. §16: complementary to but distinct from the AI section. */
        headingLevel: 2,
        tone: "feature",
        /* The threads are Conflict-41 review fixtures — synthetic, disclosed, never presented as
           real member activity. `COMING_SOON` stopped being true the day `/community` shipped. */
        provenance: "synthetic",
        previewAction: "labelled-preview-state",
        adTier: 2,
        intelligence: "none-documented",
        mobilePriority: 3,
      }),
      kind: "community",
      data: {
        heading: "Community",
        /* §15 exact wording. */
        kicker: "Human-authored discussions",
        intro:
          "Community is where players can discuss games, results and lottery experiences with other people.",
        /*
         * LRG-UI-011 §4 — GENUINE DATA ONLY — now satisfied through the Community family's own seam.
         *
         * This slot was empty ("there is nothing genuine to show") while no forum existed. The forum
         * now exists: `/community` and `/community/{slug}` are registry-served routes (commit
         * a39bdfe) over the Conflict 41 FOUNDER AMENDMENT review corpus, so `FD-ACC-10`'s condition
         * — forum integration hidden BECAUSE no forum platform exists — is satisfied by
         * construction. The designed content slot is filled; the section's approved composition is
         * unchanged.
         *
         * Every value below is a fact about a disclosed fixture thread, read through
         * `communityDiscussionSource` (the BFF seam, whose per-read assertions run here too):
         * real titles, real reply counts, real last-activity dates, real `/community/{slug}`
         * destinations. Nothing is estimated or invented — Constitution §17 still prohibits it, and
         * `disclosure` below carries the amendment-condition-1 banner sentence onto this surface.
         */
        discussions: recentCommunityDiscussions(3).map((d) => ({
          title: d.title,
          forum: d.topicLabel,
          replyCount: d.replyCount,
          lastActivityDisplay: d.lastActivityDisplay,
          authorDisplayName: d.authorUsername,
          href: d.href,
        })),
        disclosure: communityDisclosure(),
        moreHref: COMMUNITY_HUB_PATH,
        moreLabel: "Visit the community",
        emptyState: {
          headline: "No recent community discussions yet",
          body: "When Community opens you will find real players talking here — every post written by a person, none of it generated.",
        },
        /* What the forum is FOR. A capability description, never activity. */
        topics: [
          {
            title: "Game talk",
            body: "How each game works and which add-ons are worth it.",
            state: "preview-unavailable" as const,
          },
          {
            title: "Claim experiences",
            body: "What actually happened when members claimed, state by state.",
            state: "preview-unavailable" as const,
          },
          {
            title: "State corners",
            body: "One space per state, for the rules that only apply there.",
            state: "preview-unavailable" as const,
          },
        ],
        image: IMG.community,
      },
    },
    // 20 — H-10A
    {
      ...env({
        id: "H-10A",
        name: "Winners and Claim Stories",
        order: 20,
        family: "community",
        provenance: "synthetic",
        previewAction: "transformed-fixture",
        adTier: 2,
        intelligence: "curated",
        mobilePriority: 4,
      }),
      kind: "winners",
      data: {
        heading: "Winners and claim stories",
        items: (fx.news?.recentWins ?? []).map((w) => ({
          location: cleanCopy(w.location),
          text: cleanCopy(w.text),
        })),
        /* Locally drawn graphic. Never a photograph, and never an image of a real person — this
           section carries a visible Sample label and must not read as a real winner. */
        image: IMG.winners,
      },
    },
    // 21 — H-11
    {
      ...env({
        id: "H-11",
        name: "News and Stories",
        order: 21,
        family: "community",
        band: "latest-from-lc",
        headingLevel: 3,
        provenance: "synthetic",
        previewAction: "transformed-fixture",
        adTier: 2,
        intelligence: "curated",
        mobilePriority: 4,
      }),
      kind: "stories",
      data: {
        heading: "Latest from LotteryCorner",
        intro: undefined,
        /*
         * LRG-UI-011 §5 — GENUINE OR EVERGREEN ONLY.
         *
         * The Home fixture declares itself illustrative (`_meta.illustrative: true`), and only
         * `featureGames` carries real values from source-xml. Two of the three `liveNews` items are
         * therefore SYNTHETIC CURRENT-NEWS CLAIMS ("Mega Millions climbs to $604 Million",
         * "Powerball rolls to $457 Million") with no verified source or link. Presenting either as
         * news would be inventing current news, which is prohibited.
         *
         * They are dropped. What remains is the one EVERGREEN item, rendered under its own
         * classification — §5 explicitly permits approved evergreen Guide/Analysis content "clearly
         * labelled as Guide or Analysis rather than News". Nothing here is dated as breaking news.
         */
        items: evergreenStories,
        emptyState: {
          headline: "No verified lottery news right now",
          body: "Newsroom stories appear here once a source and publication date can be verified. Until then, the guides below are the durable help content.",
        },
        /* The News family (07A/07B) now serves `/news`, so H-11's continuation finally has a REAL destination —
           a link, not a restructure: the section's composition above is untouched. */
        moreHref: "/news",
        moreLabel: "More lottery news",
      },
    },
    // 22 — H-11A
    {
      ...env({
        id: "H-11A",
        name: "Lottery Blog and Guides",
        order: 22,
        aiActions: [{ label: "Ask a follow-up", icon: "explain", state: "preview-unavailable" }],
        family: "community",
        provenance: "synthetic",
        previewAction: "transformed-fixture",
        adTier: 2,
        intelligence: "curated",
        mobilePriority: 5,
      }),
      kind: "stories",
      data: {
        heading: cleanCopy(fx.blog?.heading, "Blog and guides"),
        items: (fx.blog?.items ?? []).map((b, i) => {
          const summary = b.excerpt ? cleanCopy(b.excerpt) : undefined;
          return {
            title: cleanCopy(b.title),
            href: b.href,
            summary,
            dateDisplay: b.date ? cleanCopy(b.date) : undefined,
            category: b.category ? cleanCopy(b.category) : undefined,
            image: editorialImage([IMG.guide, IMG.jackpot, IMG.news], i),
          };
        }),
      },
    },
    // 23 — H-12
    {
      ...env({
        id: "H-12",
        name: "Where to Play / Buy Online",
        order: 23,
        family: "directory",
        provenance: "illustrative",
        provenanceLabel: COMING_SOON,
        previewAction: "labelled-preview-state",
        adTier: 1,
        protectedZone: true,
        intelligence: "deterministic",
        mobilePriority: 3,
        state: "unavailable",
        stateText: "Ticket options open after launch. No partner is selected.",
      }),
      kind: "purchase",
      data: {
        heading: cleanCopy(fx.buyTicketsHighlight?.heading, "Where to play"),
        copy: cleanCopy(fx.buyTicketsHighlight?.copy),
        purchase: purchaseRef("Where to play"),
      },
    },
    // 24 — H-13
    {
      ...env({
        id: "H-13",
        name: "My LotteryCorner / Insider Value",
        order: 24,
        family: "directory",
        provenance: "illustrative",
        provenanceLabel: COMING_SOON,
        previewAction: "labelled-preview-state",
        adTier: 1,
        intelligence: "next-action",
        mobilePriority: 5,
        tone: "quiet",
        state: "unavailable",
        stateText:
          "Accounts open after launch. Nothing can be saved or followed yet.",
      }),
      kind: "account-value",
      data: {
        heading: cleanCopy(fx.insider?.heading, "My LotteryCorner"),
        subheading: cleanCopy(fx.insider?.subheading),
        valuePoints: (fx.insider?.features ?? []).map((f) => ({
          title: cleanCopy(f.title),
          body: f.desc ? cleanCopy(f.desc) : undefined,
        })),
      },
    },
    // 25 — H-14
    {
      ...env({
        id: "H-14",
        name: "Return and Distribution",
        order: 25,
        family: "community",
        band: "latest-from-lc",
        headingLevel: 3,
        provenance: "illustrative",
        provenanceLabel: COMING_SOON,
        previewAction: "labelled-preview-state",
        adTier: 1,
        intelligence: "next-action",
        mobilePriority: 5,
      }),
      kind: "return-channels",
      data: {
        heading: "Watch and follow",
        intro: "Draw-night recaps and result posts, plus a nudge when the games you follow are drawn.",
        /*
         * LRG-UI-011 §6 — GENUINE LOCAL METADATA ONLY.
         *
         * `updates` is empty. No repository data carries a real LotteryCorner video or post: there
         * is no title, thumbnail, duration, view count or verified publication date anywhere. All of
         * those are explicitly forbidden to invent, so the polished empty state renders instead.
         */
        updates: [],
        emptyState: {
          headline: "LotteryCorner video updates are coming soon",
          body: "Draw-night recaps will appear here with the numbers read out and written down.",
        },
        /*
         * The CHANNELS are real and production-evidenced, so naming them is not fabrication:
         *  - facebook, twitter/X, instagram, pinterest come from the transcribed production footer
         *    (04-sample-data/footer-config.json, sourced from footerbar_upgrade_as.jspf);
         *  - youtube.com/@Lotterycorner is evidenced in the legacy templates
         *    (WEB-INF/upgrade/CommonElementsUpgrade_as.jspf and the state result templates).
         *
         * NOTHING IS EMBEDDED and nothing links out: no YouTube iframe, no X widget, no partner
         * script, no external request. §6 permits a genuine destination "only when approved", and no
         * destination is approved here.
         */
        mediaChannels: [
          { label: "YouTube", platform: "youtube" as const, stateText: "Not connected here" },
          { label: "X", platform: "x" as const, stateText: "Not connected here" },
          { label: "Facebook", platform: "facebook" as const, stateText: "Not connected here" },
          { label: "Instagram", platform: "instagram" as const, stateText: "Not connected here" },
        ],
        /* The return half of the governed section. */
        channels: [
          {
            label: "Draw reminders",
            kind: "reminder" as const,
            body: "Before the games you follow are drawn.",
            stateText: "Opens after launch",
          },
          {
            label: "Result alerts",
            kind: "alert" as const,
            body: "As soon as the official draw is published.",
            stateText: "Opens after launch",
          },
        ],
        image: IMG.video,
      },
    },
    // 26 — H-14A
    {
      ...env({
        id: "H-14A",
        name: "Newsletter and Player Updates",
        order: 26,
        family: "directory",
        provenance: "illustrative",
        provenanceLabel: COMING_SOON,
        previewAction: "labelled-preview-state",
        adTier: 1,
        intelligence: "none-documented",
        mobilePriority: 5,
        tone: "quiet",
        state: "unavailable",
        stateText: "Sign-up opens after launch. No email address is collected.",
      }),
      kind: "newsletter",
      data: {
        heading: cleanCopy(fx.newsletter?.title, "Player updates"),
        text: cleanCopy(fx.newsletter?.text),
        emailPlaceholder: cleanCopy(fx.newsletter?.emailPlaceholder, "Email address"),
      },
    },
    // 27 — H-14B
    {
      ...env({
        id: "H-14B",
        name: "Winning Numbers by State Directory",
        order: 27,
        family: "directory",
        provenance: "copied",
        adTier: 1,
        intelligence: "none-documented",
        mobilePriority: 4,
        tone: "quiet",
      }),
      kind: "state-directory",
      data: {
        heading: cleanCopy(fx.browseByState?.heading, "Winning numbers by state"),
        /* §15: no intro. H-07 "Explore Your State" already carries this exact fixture sentence, and
           printing it twice on one page is the repeated description the direction asks us to drop.
           The heading is self-explanatory and the directory below is the content. */
        intro: undefined,
        states: stateList,
      },
    },
    { id: "AD-H05", name: "Bottom Content Advertisement", order: 28, kind: "ad-anchor", anchorId: "AD-H05" },
    // 29 — H-15
    {
      ...env({
        id: "H-15",
        name: "Trust, Support and Footer",
        order: 29,
        family: "directory",
        provenance: "copied",
        adTier: 0,
        protectedZone: true,
        intelligence: "none-documented",
        mobilePriority: 3,
        tone: "quiet",
      }),
      kind: "trust",
      data: {
        heading: "Trust and support",
        sourcePolicy:
          "Results are taken from official state lottery draws and checked after each drawing.",
        accuracyPolicy:
          "If a published result changes, we correct it and show what changed, when, and what it affects.",
        supportLinks: [
          { label: "About LotteryCorner", href: "/about-us", state: "preview-unavailable" },
          { label: "How we source results", href: "/about-us", state: "preview-unavailable" },
          { label: "Contact us", href: "/contact-us", state: "preview-unavailable" },
          { label: "Responsible play", href: "/responsible-play", state: "preview-unavailable" },
        ],
      },
    },
    { id: "AD-H06", name: "Existing Bottom Anchor / Sticky Slot, when enabled", order: 30, kind: "ad-anchor", anchorId: "AD-H06" },
  ];

  const entries = applyEngagementOrderExperiment(blueprintOrder);

  /* Cross-check the anchor map against what the sequence actually rendered. Placement resolves by
     anchorId, so a drifted `order` is documentation rot rather than a functional break — but it
     should still be visible rather than silent. */
  const renderedAnchorOrders = entries
    .filter((e) => e.kind === "ad-anchor")
    .map((e) => `${e.id}:${e.order}`)
    .join(",");
  const declaredAnchorOrders = HOME_AD_ANCHORS.map((a) => `${a.anchorId}:${a.order}`).join(",");
  if (renderedAnchorOrders !== declaredAnchorOrders) {
    throw new Error(
      `Home ad anchors: documented positions drifted from the rendered sequence.\n` +
        `  rendered: ${renderedAnchorOrders}\n  declared: ${declaredAnchorOrders}`,
    );
  }

  /* Provenance summary — enables one render-time assertion over the whole page. */
  const summary: Record<Provenance, string[]> = {
    "production-derived": [],
    copied: [],
    synthetic: [],
    illustrative: [],
  };
  for (const e of entries) {
    if (e.kind !== "ad-anchor") summary[e.provenance].push(e.id);
  }
  summary["production-derived"].push("AD-H00…AD-H06 (real slot references)");

  return {
    meta: {
      previewMode: true,
      previewLabel:
        "Preview — sample data for design review. Not live lottery results.",
      schemaVersion: PREVIEW_SCHEMA_VERSION,
      supersededBy: PREVIEW_SUPERSEDED_BY,
      partnerScriptsActive: false,
      provenanceSummary: summary,
    },
    page: {
      title: cleanCopy(p.metadata?.title, "US Lottery Results — Lottery Corner"),
      description: cleanCopy(
        p.metadata?.description,
        "US lottery results, winning numbers and jackpots.",
      ),
      h1: cleanCopy(p.h1, "US Lottery Results"),
      /*
       * LRG-UI-009 §1.4: introductory copy is REDUCED so Powerball and Mega Millions sit higher.
       * The fixture's own leading clause is kept; the trailing marketing tail is dropped. Nothing is
       * invented and no claim changes.
       */
      intro: cleanCopy(p.intro).split(" — ")[0].replace(/,\s*$/, ""),
      canonical: {
        policy: "not-emitted",
        placeholder: cleanCopy(p.metadata?.canonicalPlaceholder, "/"),
        reason:
          "Canonical host and trailing-slash convention are unresolved. A wrong canonical is worse than none, so the preview emits none.",
      },
      robots: "noindex, nofollow",
      lastUpdated: {
        // The fixture's display string already carries its own "Last updated:" prefix. Strip it so
        // the trust line does not read "Last updated: Last updated: …".
        display: cleanCopy(p.lastUpdated?.display).replace(/^last updated:\s*/i, ""),
        isoDateModified: isoModified ?? "",
        timezoneLabel: "ET",
      },
      stale,
      staleNote,
      staleDetail,
      source: {
        name: cleanCopy(fx.contentMeta?.source, "Official state lottery draws"),
        text: "Source checked",
        verifiedLabel: "Result verified",
      },
      /*
       * LRG-UI-009 §7: CONDITIONAL correction.
       *
       * The default Home preview shows NO correction banner and NO corrected-result card, because
       * no real correction record exists in the fixture. Showing one by default implied an error had
       * occurred. The capability remains fully implemented and is exercised by the developer-only
       * state at /?previewState=corrected (available only while LC_HOME_PREVIEW=true).
       */
      correction:
        previewState === "corrected"
          ? {
              present: true,
              what: "The estimated jackpot shown for one sample game was updated.",
              previousValue: "$430 Million",
              replacementValue: "$435 Million",
              whenDisplay: cleanCopy(fx.contentMeta?.lastReviewed, "after the last review"),
              impact: "Winning numbers were not affected. Only the estimated jackpot changed.",
            }
          : { present: false },
      independenceDisclaimer:
        "LotteryCorner is an independent publisher. We are not a lottery operator and not affiliated with any official state lottery.",
      responsiblePlay: {
        text: "Play for entertainment. Set your own limits and stop when it stops being fun.",
        ageNotice: "18+ only. Age limits vary by state.",
      },
      schema: {
        webPage: true,
        webSite: true,
        organization: true,
        itemList: [
          { name: "US State Lotteries", items: stateList.map((s) => ({ name: s.name, path: s.href })) },
        ],
        searchAction: false,
        breadcrumbList: false,
      },
    },
    shell: {
      header: { markLabel: "LotteryCorner" },
      /*
       * GS-03, FROM THE SHARED DEFINITION — LRG-UX-SCHEMA-001 correction 5.
       *
       * Home used to author its own seven-ish entries here (Home, Powerball, Mega Millions, States, Tools,
       * News), and `lib/shell/globalShellModel.ts` authored a different set for every other page. GS-03's very
       * first rule is "same order across public pages", which two independent arrays cannot satisfy however
       * carefully either is maintained. There is now one definition and Home reads it like everyone else.
       */
      /* Home belongs under NO primary entry — LRG-UX-SCHEMA-002 §2's mapping table. The logo owns Home, and
         marking one of the seven current on Home would tell the reader they are inside a section they are not. */
      primaryNav: primaryNavigation(null),
      search: {
        placeholder: "Search games, states or results",
        state: "preview-unavailable",
        explanation: "Search games, states and results.",
      },
      /*
       * §3: generic "Ask AI" is retired. The action names the product on desktop and shortens to
       * "Explore AI" only where mobile space is constrained. It scrolls to H-05 — no route is created.
       */
      /*
       * LRG-UX-SCHEMA-002 §1: `state` is `live`, and it now agrees with the target.
       *
       * It read `preview-unavailable` while pointing at `#H-05` — a section Home genuinely renders. The header
       * ignored `state` entirely, so the control worked and the model described it as broken; once the header
       * started honouring `state`, the same value would have hidden a working control. H-05 exists, so the
       * honest value is `live`.
       */
      aiTrigger: {
        label: "LotteryCorner AI",
        compactLabel: "Explore AI",
        href: "#H-05",
        state: "live",
        explanation: "LotteryCorner AI explains results, compares games and walks through claim steps.",
        unavailableNote: "Not on this page yet",
      },
      /*
       * §2: the compact AI value statement near H-01. One sentence, the approved AI treatment, the
       * consistent AI mark, and deliberately no promotional styling — it must not read as an
       * advertisement, and it must not push Powerball and Mega Millions materially lower.
       */
      aiValueStatement: {
        text:
          "LotteryCorner AI helps explain results, compare games, understand odds and navigate claim steps.",
        actionLabel: "See what it can do",
        href: "#H-05",
      },
      /* GS-07: the real shared sign-in flow exists (Conflict 37, 2026-08-11). The model stays anonymous —
         §33 keeps member state out of server HTML; `AccountMenu` renders the member client-side. */
      account: {
        state: "anonymous",
        signInLabel: "Sign in",
        registerLabel: "Create free account",
        valueStatement: "Free — save your numbers, follow your games, and pick up where you left off.",
        available: true,
        signInHref: "/login",
        registerHref: "/signup",
      },
      stateContext: {
        resolved: false,
        source: "none",
        askUserPrompt: "Which state do you play in?",
        options: stateList.map((s) => ({ code: s.code, name: s.name })),
      },
      /* GS-09, from the same shared definition — five destinations, not four. Home's answer surface is H-05. */
      /* GS-09, from the same shared definition. Home is the active bottom-nav item; H-05 is Home's own answer
         surface, so the Ask AI entry is genuinely live here (§1: the state and the target agree). */
      bottomNav: bottomNavigation("#H-05", "Home"),
      jackpotTicker: {
        heading: "Top jackpots",
        nextDraw: featured[0]?.nextDraw?.display ? cleanCopy(featured[0].nextDraw.display) : null,
        topJackpots: (fx.topJackpots?.rows ?? []).slice(0, 4).map((r) => ({
          game: cleanCopy(r[0]),
          amountDisplay: cleanCopy(r[1]),
          estimatedLabel: "estimated",
        })),
        disclaimer: "Jackpot amounts are estimates until the official draw is certified.",
      },
      responsiblePlayAccess: {
        label: "Responsible play",
        href: "/responsible-play",
        state: "preview-unavailable",
      },
      /*
       * The single visible provenance disclosure (LRG-UI-010 direction 1). Ordinary language, no
       * developer terminology. It still says the one thing that MUST be said — these are not live
       * results — because presenting sample data as real public fact is prohibited.
       */
      sampleDataNotice:
        "Sample data — the numbers, jackpots and stories on this page are examples, not live lottery results.",
    },
    entries,
  };
}
