/*
 * Loose TypeScript shapes for the Phase-1 sample data (04-sample-data/*.json).
 * Mirrors the sample JSON; the future API must satisfy the same data-provider interface so
 * components never change when we swap sample -> API.
 */

export interface BallGroupDrawn {
  order: number;
  label: string | null;
  values: (number | string)[];
  colorToken: string;
}

export interface MultiplierDrawn {
  key?: string;
  label: string;
  value: number;
  display?: string;
}

export interface AddOnDrawn {
  key?: string;
  label: string;
  value: number | string;
  colorToken: string;
}

export interface ResultCard {
  gameId: number;
  gameSlug: string;
  displayName: string;
  formatRef: { gameId: number; effectiveFrom?: string | null };
  status: "latest" | "awaiting" | "closed" | string;
  statusMessage?: string;
  drawScheduleLabel?: string;
  resultDate: { gameLocalDate: string; display: string; isoDrawDateTime?: string };
  groupsDrawn: BallGroupDrawn[];
  secondaryDraw?: { key?: string; label: string; groupsDrawn: BallGroupDrawn[] } | null;
  multipliers?: MultiplierDrawn[];
  addOns?: AddOnDrawn[];
  prizeDisplay?: string;
  prizeRaw?: string;
  /**
   * The next drawing.
   *
   * §B1 added `drawTimeLocal` and `timeZone`. They are what a relative "next drawing in …" label needs and what
   * `display` cannot supply: a display string is a presentation decision, and re-deriving a governed date or time
   * from it is how a formatting change silently becomes a date bug (`CLAUDE.md` §14). Both are optional, and the
   * label is simply absent where a source does not carry them — never inferred.
   */
  nextDraw?: {
    gameLocalDate?: string;
    display?: string;
    nextJackpotDisplay?: string;
    /** The operator's published local draw time, e.g. `"10:59 PM"`. */
    drawTimeLocal?: string;
    /** The jurisdiction's governed IANA zone, e.g. `America/New_York`. Never a label like "ET". */
    timeZone?: string;
  };
  buyTickets?: { label: string; href: string; affiliateResolved?: boolean } | null;
  actions?: { type: string; href: string }[];
  favoriteHook?: boolean;
  toolLinks?: { label: string; href: string }[];
}

export interface ResultGroup {
  groupKey: string;
  heading: string;
  resultCards: ResultCard[];
}

export interface PageMetadata {
  title?: string;
  description?: string;
  canonicalPlaceholder?: string;
  robots?: string;
  openGraph?: Record<string, string>;
  twitter?: Record<string, string>;
  schemaTypes?: string[];
  breadcrumb: { name: string; url: string }[];
}

export interface JackpotTickerData {
  nextDraw?: { game: string; timeDisplay: string; countdownLabel?: string };
  topJackpots?: { game: string; amountDisplay: string }[];
  alsoComingUp?: { game: string; countdownLabel?: string }[];
  quickActions?: { label: string; href: string }[];
  buyTickets?: { label: string; href: string };
  disclaimer?: string;
}

export interface TabItem {
  key: string;
  label: string;
  href: string;
  active?: boolean;
}

export interface FaqBlock {
  heading?: string;
  visibleOnPage?: boolean;
  schemaEligible?: boolean;
  items?: { q: string; a: string }[];
}

export interface StatePageData {
  page: {
    stateCode: string;
    stateName: string;
    url: string;
    pageType: string;
    metadata: PageMetadata;
    h1: string;
    intro: string;
    lastUpdated: {
      display: string;
      storedDrawTimezone?: string;
      displayTimezone?: string;
      isoDateModified?: string;
    };
    timezoneMeta?: Record<string, string>;
  };
  jackpotTicker?: JackpotTickerData;
  tabs?: TabItem[];
  latestResults: {
    heading?: string;
    infoCallout?: string;
    intro?: string;
    groups: ResultGroup[];
  };
  checkTicket?: {
    heading?: string;
    intro?: string;
    howItWorks?: string[];
    gameOptions?: string[];
    note?: string;
  };
  faqs?: FaqBlock;
  finalFaqs?: FaqBlock;
  highlights?: {
    heading?: string;
    intro?: string;
    recentWins?: { location: string; text: string }[];
    unclaimedPrizes?: { game: string; amount: string; location: string; note?: string }[];
    jackpotGrowth?: { game: string; text: string }[];
    note?: string;
  };
  howToClaim?: {
    heading?: string;
    intro?: string;
    claimOptions?: { amount: string; method: string }[];
    documents?: string[];
    steps?: { title: string; detail: string }[];
    deadlines?: string[];
    districtOffices?: string;
  };
  taxes?: {
    heading?: string;
    stateNote?: string;
    federalIntro?: string;
    points?: string[];
  };
  oddsGuide?: {
    heading?: string;
    intro?: string;
    games?: {
      gameName: string;
      rules?: string;
      prizeMatrix?: { tier: string; prize: string }[];
      odds?: string[];
    }[];
  };
  playerInfo?: {
    heading?: string;
    intro?: string;
    sections?: { title: string; body?: string; list?: string[] }[];
  };
  sourcesMethodology?: {
    heading?: string;
    intro?: string;
    groups?: { title: string; list: string[] }[];
  };
  // ---- Generic optional state-specific modules (render only when data is present) ----
  quickFacts?: { heading?: string; rows: { label: string; value: string }[] };
  drawSchedule?: { heading?: string; intro?: string; entries: { game: string; days: string; timeDisplay: string }[] };
  historyLinks?: { heading?: string; intro?: string; links: { label: string; href: string }[] };
  biggestWinners?: {
    heading?: string;
    intro?: string;
    items: { title?: string; amount?: string; game?: string; location?: string; date?: string; text: string }[];
  };
  scratchOffs?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  legalResponsiblePlay?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  // ---- Additional generic optional modules (matrix-driven; render only if present) ----
  anonymityRules?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  fundAllocation?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  numberTrends?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  highlightsGrid?: { heading?: string; intro?: string; items: { label: string; value: string; note?: string }[] };
  gameComparison?: { heading?: string; intro?: string; columns: string[]; rows: string[][] };
  winnerLocation?: { heading?: string; intro?: string; columns: string[]; rows: string[][] };
  jackpotTracker?: { heading?: string; intro?: string; columns: string[]; rows: string[][] };
  secondChance?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  contentMeta?: { source?: string; reviewStatus?: string; lastReviewed?: string; note?: string };
  adSlotRefs: Record<string, string[] | string>;
  officialSourceNotice?: { name?: string; text?: string };
  responsiblePlayNotice?: { text?: string };
  independenceDisclaimer?: { text?: string };
  popularGames?: { gameSlug: string; displayName: string; href: string }[];
  aiToolsTeaser?: { enabled?: boolean; heading?: string; copy?: string; cta?: string };
  accountHooks?: Record<string, unknown>;
}

export interface HomePageData {
  page: {
    url: string;
    pageType: string;
    metadata: PageMetadata;
    h1: string;
    intro: string;
    lastUpdated: { display: string; isoDateModified?: string };
  };
  stateSearch?: { heading?: string; intro?: string };
  featureGames?: { heading?: string; cards: ResultCard[] };
  topJackpots?: { heading?: string; intro?: string; columns: string[]; rows: string[][] };
  latestResults?: { heading?: string; intro?: string; cards: ResultCard[] };
  upcoming?: { heading?: string; items: { game: string; display: string; jackpot?: string; status?: string; statusNote?: string }[] };
  browseByState?: { heading?: string; intro?: string; states: { code: string; name: string; href: string }[] };
  tools?: { heading?: string; intro?: string; items: { label: string; desc?: string; href: string }[] };
  aiToolsTeaser?: { enabled?: boolean; heading?: string; copy?: string; cta?: string };
  buyTicketsHighlight?: { heading?: string; copy?: string; cta?: { label: string; href: string } };
  news?: {
    heading?: string; intro?: string;
    recentWins?: { location: string; text: string }[];
    unclaimedPrizes?: { game: string; amount: string; location: string; note?: string }[];
    jackpotGrowth?: { game: string; text: string }[];
    note?: string;
  };
  liveNews?: { heading?: string; intro?: string; futureSource?: string; items: { category?: string; date?: string; title: string; summary?: string; image?: string | null; href: string }[] };
  popularGames?: { heading?: string; items: { slug: string; displayName: string; href: string; jurisdiction?: string; topPrize?: string; nextDraw?: string; buyTickets?: string | null }[] };
  jackpotHistory?: {
    heading?: string;
    intro?: string;
    futureSeriesNote?: string;
    items: {
      game: string;
      href?: string;
      current?: string; // current / next-draw estimated jackpot
      previous?: string; // previous-draw estimated jackpot, only if available
      change?: string; // change vs previous estimate, only if available
      nextDraw?: string;
      status?: string; // rollover / status text, only if supported
      // Reserved for a FUTURE real historical series from the API/DB. A chart is rendered ONLY when
      // this is real data (never simulated); the sample intentionally omits it.
      series?: number[];
    }[];
  };
  insider?: { heading?: string; subheading?: string; features?: { title: string; desc?: string }[]; cta?: { label: string; href: string }; loginGated?: boolean };
  systems?: { heading?: string; intro?: string; sections?: { title: string; body?: string; list?: string[] }[] };
  blog?: { heading?: string; items: { title: string; href: string; excerpt?: string; date?: string; category?: string }[] };
  newsletter?: { title?: string; text?: string; emailPlaceholder?: string };
  faqs?: FaqBlock;
  adSlotRefs: Record<string, string[] | string>;
  contentMeta?: { source?: string; reviewStatus?: string; lastReviewed?: string; note?: string };
}

export interface BallGroupDef {
  order: number;
  ballType: string;
  label: string | null;
  valueType: "number" | "digit" | "card";
  count: number;
  min: number | null;
  max: number | null;
  colorToken: string;
}

export interface ResultFormatDefinition {
  gameId: number;
  gameName: string;
  displayName: string;
  stateCode: string;
  gameSlug: string;
  isMultiState: boolean;
  isCardGame: boolean;
  playType: string;
  maxBallCount: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  ballGroups: BallGroupDef[];
  specialBalls: BallGroupDef[];
  multipliers: { key?: string; label: string; suffix?: string }[];
  addOns: { key?: string; label: string }[];
  secondaryDraw?: unknown | null;
  cardFaces?: boolean;
}

export interface FooterLink { label: string; href: string }
export interface FooterConfig {
  columns: {
    title: string;
    links: FooterLink[];
    glossary?: { label: string; links: FooterLink[] };
  }[];
  newsletter?: { title: string; emailPlaceholder?: string; action?: string; text?: string };
  bottom?: {
    privacyManager?: boolean;
    links?: FooterLink[];
    social?: FooterLink[];
  };
}

export type AdDevice = "responsive" | "mobile" | "desktop" | "tablet";

export interface AdSizeMapping {
  breakpoints: { minViewport: [number, number]; sizes: number[][] }[];
}

export interface AdSlotDefinition {
  slotKey: string;
  pageType: string;
  placementName: string;
  gamPath: string;
  divId?: string;
  device?: AdDevice;
  sizeMapping?: string | null;
  sizes: number[][] | null;
  container?: string;
  closable?: boolean;
  desktopPlacement?: string;
  mobilePlacement?: string;
  fixedPlacement: boolean;
  eagerAboveFold?: boolean;
  lazyLoad?: boolean;
  lazyLoadMarginPx?: number;
  reserveSpace?: boolean;
  collapseIfEmpty?: boolean;
  notes?: string;
  stateCode?: string;
}
