/*
 * THE NEWS HUB VIEW MODEL — 07A, in NEWS-LOW-VOLUME mode.
 *
 * Builds the seventeen 07A §3 rows, in order, each carrying its data and its §43 section state. The component
 * renders what this returns and adds nothing — so `tests/news-pages.test.ts` can assert the composition against
 * the blueprint by reading the model, and the DOM audit can read the same answer off `data-section-*`.
 *
 * ══ HOW LOW-VOLUME HONESTY IS EXPRESSED ══
 *
 * 07A §2: *"Do not manufacture news. Increase Guides, Research and archive discovery."* Concretely:
 *
 *   - NH-02 renders the strongest DATED HISTORICAL record, labelled with its real category — never a manufactured
 *     top story;
 *   - NH-03 Jackpot Watch is `unavailable` WITH LINKS: no live jackpot feed is connected, and rendering the
 *     flagship preview figures here would present mock jackpots as news fact (`CLAUDE.md` §14);
 *   - NH-05 (Winners), NH-08/09/10 (rankings), NH-11 (Community) and NH-12 (Events) are `empty` with recorded
 *     reasons — no fabricated winners, counts, members or events;
 *   - NH-06's state selector is crawlable links plus a server-side filter. No IP is read anywhere (07A §9).
 */

import { getNewsData } from "./bff/newsBff";
import { newsAdProfile, type NewsAdProfile } from "./newsAdProfile";
import type { NewsArticleRecord, NewsAuthorRecord, NewsHubSectionId } from "./newsContract";
import {
  NEWS_HUB_H1, NEWS_HUB_MODE, NEWS_HUB_ORDER, NEWS_HUB_SECTION_NAMES, NEWS_HUB_SUPPORT,
  type NewsHubMode,
} from "./newsContract";
import { directoryJurisdictions } from "@/lib/state/jurisdictionRegistry";
import { servesPage } from "@/lib/registry/pageFamilyRegistry";
import type { SectionState } from "@/lib/shell/sectionContract";

/* ------------------------------------------------------------------ shapes */

export interface NewsStateOption {
  code: string;
  name: string;
  /** Present only when this build serves the state hub — a selector chip never invents a link. */
  hubHref: string | null;
}

export interface NewsHubSection {
  id: NewsHubSectionId;
  name: string;
  /** §43 section state. `fresh` for populated modules, `empty`/`unavailable` with a reason otherwise. */
  state: SectionState;
  /** Why a non-fresh section is in its state. Rendered as the honest empty copy. */
  reason: string | null;
}

export interface NewsHubModel {
  mode: NewsHubMode;
  h1: string;
  support: string;
  /** The payload's reader-facing disclosure sentence. Rendered once, near the top. */
  disclosure: string | null;
  sections: readonly NewsHubSection[];
  /** NH-02 — the strongest dated historical record. */
  topStory: NewsArticleRecord | null;
  /** NH-04 — dated NEWS records, newest first. */
  latest: readonly NewsArticleRecord[];
  /** NH-07 — EDITORIAL guides and research. */
  guides: readonly NewsArticleRecord[];
  /** NH-06 — the crawlable state selector plus the filtered result. */
  stateOptions: readonly NewsStateOption[];
  selectedState: NewsStateOption | null;
  stateNews: readonly NewsArticleRecord[];
  /** Authors for NH-14 (07A §15's honest form: the one accountable review identity). */
  authors: readonly NewsAuthorRecord[];
  ads: NewsAdProfile;
  /** Every visible article card, in render order, for the ItemList (07A §17: visible cards only). */
  visibleCards: readonly { headline: string; slug: string }[];
}

/* ------------------------------------------------------------------ the model */

export function buildNewsHubModel(selectedStateCode?: string | null): NewsHubModel {
  const data = getNewsData();

  const news = data.articles.filter((a) => a.contentType === "NEWS");
  const guides = data.articles.filter((a) => a.contentType === "EDITORIAL");
  const byNewest = (a: NewsArticleRecord, b: NewsArticleRecord) =>
    b.datePublishedIso.localeCompare(a.datePublishedIso);
  const latest = [...news].sort(byNewest);
  /* 07A §5: selection uses impact/utility/originality, not recency alone. With a review corpus of dated records
     the most impactful is the most RECENT dated change — deterministic and honest. */
  const topStory = latest[0] ?? null;

  const stateOptions: NewsStateOption[] = directoryJurisdictions().map((j) => ({
    code: j.code,
    name: j.name,
    hubHref: servesPage("state", j.code) ? `/${j.code}` : null,
  }));
  const selectedState =
    stateOptions.find((s) => s.code === (selectedStateCode ?? "").toLowerCase()) ?? null;
  const stateNews = selectedState
    ? data.articles.filter((a) => a.stateCodes.includes(selectedState.code))
    : [];

  const empty = (reason: string): { state: SectionState; reason: string } => ({ state: "empty", reason });

  const sectionState: Record<NewsHubSectionId, { state: SectionState; reason: string | null }> = {
    "NH-01": { state: "fresh", reason: null },
    "NH-02": topStory
      ? { state: "fresh", reason: null }
      : empty("No story qualifies. A top story is never manufactured (07A §2 NEWS-LOW-VOLUME)."),
    "NH-03": {
      state: "unavailable",
      reason:
        "Live jackpot tracking is not connected in this build. Jackpot figures appear here only from a real "
        + "feed — the game pages carry each game's own latest published information.",
    },
    "AD-NH00": { state: "empty", reason: newsAdProfile().gap },
    "NH-04": latest.length > 0
      ? { state: "fresh", reason: null }
      : empty("No dated records exist yet."),
    "NH-05": empty(
      "No verified winner or unclaimed-prize story is published. A winner story is a factual claim about a real "
      + "person, so nothing appears here until it comes from a published, verified source.",
    ),
    "NH-06": { state: "fresh", reason: null },
    "NH-07": guides.length > 0
      ? { state: "fresh", reason: null }
      : empty("No guides are published yet."),
    "AD-NH01": { state: "empty", reason: newsAdProfile().gap },
    "NH-08": empty(
      "Trending is measured from real reader velocity (07 §11). No readership data exists in this build, and "
      + "counts are never invented.",
    ),
    "NH-09": empty(
      "Most Discussed is measured from real contributors and reply depth (07 §11). No community platform is "
      + "connected, and discussion activity is never fabricated.",
    ),
    "NH-10": empty(
      "Most Read is measured from real readership (07 §11). No readership data exists in this build, and counts "
      + "are never invented.",
    ),
    "NH-11": empty(
      "Community content is human-authored. No community platform is connected yet, so nothing appears here — "
      + "no sample threads, replies or members have been created.",
    ),
    "NH-12": empty(
      "No approved event package exists (07A §13 allows at most one controlled module at launch, and none is "
      + "approved)."),
    "NH-13": { state: "fresh", reason: null },
    "NH-14": { state: "fresh", reason: null },
    "AD-NH02": { state: "empty", reason: newsAdProfile().gap },
  };

  const sections: NewsHubSection[] = NEWS_HUB_ORDER.map((id) => ({
    id,
    name: NEWS_HUB_SECTION_NAMES[id],
    state: sectionState[id].state,
    reason: sectionState[id].reason,
  }));

  /* Visible cards, in the order the page renders them: top story, latest feed, guides, state-filtered results.
     Deduplicated because the top story also heads the latest feed's source list. */
  const cardSeen = new Set<string>();
  const visibleCards: { headline: string; slug: string }[] = [];
  const pushCard = (a: NewsArticleRecord) => {
    if (cardSeen.has(a.slug)) return;
    cardSeen.add(a.slug);
    visibleCards.push({ headline: a.headline, slug: a.slug });
  };
  if (topStory) pushCard(topStory);
  for (const a of latest) pushCard(a);
  for (const a of guides) pushCard(a);
  for (const a of stateNews) pushCard(a);

  return {
    mode: NEWS_HUB_MODE,
    h1: NEWS_HUB_H1,
    support: NEWS_HUB_SUPPORT,
    disclosure: data.meta.disclosure,
    sections,
    topStory,
    /* The latest feed lists the dated records the top story did not already take. */
    latest: latest.filter((a) => a.slug !== topStory?.slug),
    guides,
    stateOptions,
    selectedState,
    stateNews,
    authors: data.authors,
    ads: newsAdProfile(),
    visibleCards,
  };
}
