/*
 * THE STATE VIEW CONFIGURATION LOADER AND VALIDATOR — LRG-STATE-043 JSON-01/JSON-05.
 *
 * WHAT THIS OWNS, and the boundary that keeps it from becoming a second architecture (JSON-04):
 *
 *   THIS JSON owns  static State identity, SEO copy, presentation references and approved public content.
 *   The manifest owns sourced publication facts and provenance (`floridaContentManifest.ts`).
 *   The format registry owns result mechanics — ball counts, Fireball, Double Play, multipliers, effective dates.
 *   The runtime provider owns current results, dates, jackpots, status and freshness.
 *   The Buy Now capability contract owns commerce eligibility.
 *
 * So this file is a VIEW/CONFIGURATION contract only: not an API contract, not a database design, not a DTO
 * layer, not a CMS, not a persistence model. It carries no behaviour beyond validation.
 *
 * WHY THE VALIDATION IS STRICT AND FAILS LOUD. A view config is loaded at render time, so a typo in it would
 * otherwise surface as a silently missing card or an empty band on a public page. Every failure names the
 * configuration path and the field, because the person who has to fix it is reading a stack trace.
 *
 * NO DEPENDENCY. Hand-written narrowing against the existing repository pattern (`assert*` helpers that throw),
 * not a schema library.
 */

import type {
  StateLowerPageContent, StateExploreItem, StateNewsItem, StateGuideItem, StateDiscussionItem,
  StateResourceItem, StateClaimVideo, LowerDestination,
} from "./stateLowerPageContent";

/**
 * Whether a jurisdiction runs a lottery at all.
 *
 * `noLottery` is a POSITIVE, evidenced profile, not an empty `lottery` one. Utah, Alabama, Alaska, Hawaii
 * and Nevada each have a dedicated legacy template and no block in the production results feed; the page
 * they get is a different page, not this page with its modules missing (PF-02 ST-06, FD-S-31).
 */
export type LotteryProfile = "lottery" | "noLottery";

/**
 * POSITIVE State capabilities (CFG-03).
 *
 * Every key answers "is this true of this State?" and the default for an absent key is FALSE. That
 * direction is the whole point: a capability nobody has recorded must never read as available, which is the
 * same safety rule `FD-X-11` applies to commerce. `capabilityOf` below is the only reader, so no component
 * can accidentally treat `undefined` as permission.
 */
export type StateCapabilities = Readonly<Record<string, boolean>>;

/** One member game inside a family surface. The game's own id, never rewritten (FAM-01). */
export interface StateFamilyMemberConfig {
  gameId: number;
  variantLabel: string;
  displayOrder: number;
}

/** A configured game-family surface (CFG-04). Presentation only — no result mechanics live here. */
export interface StateFamilyConfig {
  familyId: string;
  familyLabel: string;
  visualIdentity?: string;
  group: "multiState" | "stateOnly" | "dailyVariants" | "specialized";
  formatGameKey: string;
  members: readonly StateFamilyMemberConfig[];
  historyHref?: string;
  buyNowEligible: boolean;
  aiContextKey?: string;
  priority: number;
  retired?: boolean;
}

export interface StateViewConfig {
  schemaVersion: string;
  state: {
    code: string;
    name: string;
    timezone: string;
    timezoneLabel: string;
    /** `null` where the State runs no lottery, so no minimum play age applies. */
    minimumLotteryAge: number | null;
    lotteryProfile: LotteryProfile;
  };
  /** Guarded-preview enablement. A configuration existing is NOT permission to render it (REG-01). */
  preview: { enabled: boolean };
  capabilities: StateCapabilities;
  seo: {
    slug: string;
    canonicalPath: string;
    title: string;
    description: string;
    breadcrumbLabel: string;
    schemaAboutName: string;
    openGraph: {
      type: string;
      title: string;
      description: string;
      /** `null` until an approved brand image asset exists — see the recorded gap. */
      imageKey: string | null;
    };
  };
  presentation: {
    featuredMultiStateGames: string[];
    nativeFamilyGroupOrder: string[];
    topStackAdditionalFamilies: number;
    /** Family composition and member order (CFG-04). Empty for a no-lottery State. */
    families: readonly StateFamilyConfig[];
  };
  content: {
    explore: { heading: string; intro: string; items: StateExploreItem[] };
    news: { heading: string; intro: string; ownerLabel: string; items: StateNewsItem[] };
    guides: {
      heading: string; intro: string; label: string; items: StateGuideItem[];
      aiContinuation: { heading: string; copy: string; actionLabel: string };
    };
    community: {
      heading: string; intro: string; items: StateDiscussionItem[];
      questionContinuation: { heading: string; copy: string; actionLabel: string };
    };
    resources: { heading: string; items: StateResourceItem[] };
    /** The State's own LotteryCorner claim video. `null` where none is owned (LRG-STATE-048). */
    claimVideo?: StateClaimVideo | null;
  };
  trust: { summary: string; independence: string };
}

/** The one schema version this build understands. An unknown version fails rather than half-loading. */
export const SUPPORTED_SCHEMA_VERSION = "1.0";

class StateConfigError extends Error {
  constructor(path: string, field: string, problem: string) {
    super(`State view configuration ${path}: "${field}" ${problem}`);
    this.name = "StateConfigError";
  }
}

const fail = (path: string, field: string, problem: string): never => {
  throw new StateConfigError(path, field, problem);
};

/** Duplicate ids would silently drop a card in a keyed list, so they are a hard failure. */
function assertUniqueKeys(path: string, field: string, keys: readonly string[]): void {
  const seen = new Set<string>();
  for (const k of keys) {
    if (!k) fail(path, field, "contains an item with no key");
    if (seen.has(k)) fail(path, field, `contains the duplicate id "${k}"`);
    seen.add(k);
  }
}

function assertDestination(path: string, field: string, d: LowerDestination | undefined): void {
  if (!d || typeof d !== "object") fail(path, field, "is missing its destination");
  const kind = (d as { kind?: string }).kind;
  if (kind === "route") {
    const href = (d as { href?: string }).href ?? "";
    if (!href.startsWith("/")) fail(path, field, "declares a route destination that is not a LotteryCorner path");
    if (/^https?:/i.test(href)) fail(path, field, "must not link a content card to an external destination");
  } else if (kind === "inPage") {
    if (!(d as { fragment?: string }).fragment) fail(path, field, "declares an in-page destination with no fragment");
  } else if (kind === "preview") {
    if (!(d as { note?: string }).note) fail(path, field, "declares a preview destination with no note");
  } else {
    fail(path, field, `declares an unknown destination kind "${String(kind)}"`);
  }
}

/**
 * Validate a parsed configuration and return it typed.
 *
 * `path` is the configuration's own location, so an error points at the file a human has to edit rather than
 * at this module.
 */
export function validateStateViewConfig(raw: unknown, path: string): StateViewConfig {
  if (!raw || typeof raw !== "object") fail(path, "<root>", "is not an object");
  const c = raw as Record<string, unknown>;

  if (c.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    fail(path, "schemaVersion",
      `is "${String(c.schemaVersion)}" but this build supports only "${SUPPORTED_SCHEMA_VERSION}"`);
  }

  /* ---- state identity ---- */
  const s = c.state as StateViewConfig["state"] | undefined;
  if (!s) fail(path, "state", "is missing");
  if (!s!.code) fail(path, "state.code", "is missing");
  if (!/^[a-z]{2}$/.test(s!.code)) fail(path, "state.code", `must be a two-letter lower-case code, got "${s!.code}"`);
  if (!s!.name) fail(path, "state.name", "is missing");
  if (!s!.timezone) fail(path, "state.timezone", "is missing");
  if (!s!.timezoneLabel) fail(path, "state.timezoneLabel", "is missing");
  if (s!.lotteryProfile !== "lottery" && s!.lotteryProfile !== "noLottery") {
    fail(path, "state.lotteryProfile", `must be "lottery" or "noLottery", got "${String(s!.lotteryProfile)}"`);
  }
  const noLottery = s!.lotteryProfile === "noLottery";
  /*
   * CFG-02: a minimum play age is required only where one APPLIES. A State that runs no lottery has no
   * minimum play age, and inventing one would be a fabricated legal fact — so `null` is required there
   * rather than merely tolerated, and a positive number is required everywhere else.
   */
  if (noLottery) {
    if (s!.minimumLotteryAge !== null) {
      fail(path, "state.minimumLotteryAge", "must be null for a no-lottery State — it has no play age");
    }
  } else if (s!.minimumLotteryAge !== null &&
             (typeof s!.minimumLotteryAge !== "number" || s!.minimumLotteryAge <= 0)) {
    /*
     * A lottery State may declare `null` — meaning the published minimum play age has NOT been verified —
     * or a positive number. It may not declare zero, a negative or a string.
     *
     * LRG-STATE-047 DEFECT FIX. Michigan, Virginia, California and Maryland were first written with 18,
     * which is very probably right and is not SOURCED: their content manifests record `minimumPurchaseAge`
     * as unavailable, and the global footer renders this value as a public statement ("18+ in Michigan").
     * The configuration would have contradicted the manifest and published an unverified legal fact on a
     * page — and, because the footer is global and reads configuration by path segment, it did so on the
     * GUARD-OFF legacy route too, which REG-02 forbids outright. `null` suppresses the line.
     */
    fail(path, "state.minimumLotteryAge", "must be a positive number, or null where it is not verified");
  }

  /* ---- preview enablement and capabilities ---- */
  const prev = c.preview as StateViewConfig["preview"] | undefined;
  if (!prev || typeof prev.enabled !== "boolean") {
    fail(path, "preview.enabled", "is missing or is not a boolean");
  }
  const caps = c.capabilities as Record<string, unknown> | undefined;
  if (!caps || typeof caps !== "object") fail(path, "capabilities", "is missing");
  for (const [k, v] of Object.entries(caps!)) {
    if (typeof v !== "boolean") fail(path, `capabilities.${k}`, "must be a boolean — capabilities are positive facts");
  }
  /* A no-lottery State must not declare a lottery capability. The profile and the capability set would
     otherwise be able to disagree, and the page would read one of them. */
  if (noLottery) {
    for (const [k, v] of Object.entries(caps!)) {
      if (v === true) fail(path, `capabilities.${k}`, "is true on a no-lottery State, which cannot be correct");
    }
  }

  /* ---- SEO ---- */
  const seo = c.seo as StateViewConfig["seo"] | undefined;
  if (!seo) fail(path, "seo", "is missing");
  if (!seo!.title) fail(path, "seo.title", "is missing");
  if (!seo!.description) fail(path, "seo.description", "is missing");
  if (!seo!.canonicalPath) fail(path, "seo.canonicalPath", "is missing");
  if (!seo!.canonicalPath.startsWith("/")) {
    fail(path, "seo.canonicalPath", `must begin with "/", got "${seo!.canonicalPath}"`);
  }
  if (seo!.canonicalPath.length > 1 && seo!.canonicalPath.endsWith("/")) {
    fail(path, "seo.canonicalPath", "must not end with a trailing slash");
  }
  if (seo!.canonicalPath.includes("#")) fail(path, "seo.canonicalPath", "must not contain a fragment");
  if (!seo!.breadcrumbLabel) fail(path, "seo.breadcrumbLabel", "is missing");
  if (!seo!.openGraph) fail(path, "seo.openGraph", "is missing");

  /* ---- presentation: family composition (CFG-04) ---- */
  const pres = c.presentation as StateViewConfig["presentation"] | undefined;
  if (!pres) fail(path, "presentation", "is missing");
  const families: readonly StateFamilyConfig[] = pres!.families;
  if (!Array.isArray(families)) fail(path, "presentation.families", "is missing or is not an array");
  if (noLottery && families.length > 0) {
    fail(path, "presentation.families", "must be empty on a no-lottery State");
  }
  assertUniqueKeys(path, "presentation.families", families.map((f) => f.familyId));
  const seenGameIds = new Set<number>();
  for (const f of families) {
    const at = `presentation.families[${f.familyId}]`;
    if (!f.familyLabel) fail(path, at, "has no familyLabel");
    if (!f.formatGameKey) fail(path, at, "has no formatGameKey");
    if (typeof f.priority !== "number") fail(path, at, "has no numeric priority");
    if (typeof f.buyNowEligible !== "boolean") fail(path, at, "has no buyNowEligible flag");
    if (!Array.isArray(f.members) || f.members.length === 0) fail(path, at, "has no member games");
    /*
     * FAM-02: member order is CONFIGURED, so `displayOrder` must be a complete 0..n-1 sequence. A gap or a
     * duplicate would make the rendered order depend on the sort's stability rather than on this file —
     * which is the class of defect that made a Florida family's lead game depend on input order.
     */
    const orders = f.members.map((m: StateFamilyMemberConfig) => m.displayOrder)
      .sort((a: number, b: number) => a - b);
    for (let i = 0; i < orders.length; i += 1) {
      if (orders[i] !== i) fail(path, at, `member displayOrder values must be 0..${orders.length - 1} with no gaps`);
    }
    for (const m of f.members) {
      if (typeof m.gameId !== "number") fail(path, `${at}.members`, "has a member with no numeric gameId");
      /* FAM-01: one production game id belongs to exactly one family surface. Two families claiming the
         same id would render the same result twice under different names. */
      if (seenGameIds.has(m.gameId)) {
        fail(path, "presentation.families", `game id ${m.gameId} appears in more than one family`);
      }
      seenGameIds.add(m.gameId);
      /* A multi-member family must label its members, or two rows are indistinguishable (FAM-03). */
      if (f.members.length > 1 && !m.variantLabel) {
        fail(path, `${at}.members[${m.gameId}]`, "must carry a variantLabel — its family has more than one member");
      }
    }
  }

  /* ---- content ---- */
  const content = c.content as StateViewConfig["content"] | undefined;
  if (!content) fail(path, "content", "is missing");

  assertUniqueKeys(path, "content.explore.items", (content!.explore?.items ?? []).map((i) => i.key));
  /* LRG-STATE-048: an unrecognised cue rendered the fallback icon, so three Explore tiles silently shared
     one glyph. A closed set makes the typo a build failure instead of a visual defect nobody reports. */
  const CUES = new Set(["calendar", "clock", "ticket", "grid"]);
  for (const i of content!.explore?.items ?? []) {
    if (!CUES.has(i.cue)) {
      fail(path, `content.explore.items[${i.key}].cue`, `is "${String(i.cue)}"; expected one of ${[...CUES].join(", ")}`);
    }
  }
  assertUniqueKeys(path, "content.news.items", (content!.news?.items ?? []).map((i) => i.key));
  assertUniqueKeys(path, "content.guides.items", (content!.guides?.items ?? []).map((i) => i.key));
  assertUniqueKeys(path, "content.community.items", (content!.community?.items ?? []).map((i) => i.key));

  for (const [field, items] of [
    ["content.explore.items", content!.explore?.items ?? []],
    ["content.news.items", content!.news?.items ?? []],
    ["content.guides.items", content!.guides?.items ?? []],
    ["content.community.items", content!.community?.items ?? []],
  ] as const) {
    for (const item of items) {
      assertDestination(path, `${field}[${item.key}]`, (item as { destination?: LowerDestination }).destination);
    }
  }

  /* Only an official resource may be external, and it must be HTTPS. */
  for (const r of content!.resources?.items ?? []) {
    if (r.href && !/^https:\/\//.test(r.href)) {
      fail(path, `content.resources.items[${r.label}]`, "must use an https official destination");
    }
    if (!r.label) fail(path, "content.resources.items", "contains an item with no label");
    if (!r.destinationName) fail(path, `content.resources.items[${r.label}]`, "is missing its destination name");
    if (r.href && r.fragment) {
      fail(path, `content.resources.items[${r.label}]`, "cannot be both external and an in-page anchor");
    }
    if (r.fragment && r.fragment.startsWith("#")) {
      fail(path, `content.resources.items[${r.label}]`, "fragment must be an id, without the leading #");
    }
  }

  /*
   * The claim video (LRG-STATE-048).
   *
   * Validated hard because it is the one place this task introduces an EXTERNAL destination into content.
   * The id must be a plausible YouTube id, both URLs must reference it, and the embed must be the
   * privacy-enhanced host — so a typo cannot silently point a State's video at someone else's channel.
   */
  const video = content!.claimVideo;
  if (video != null) {
    const at = "content.claimVideo";
    if (!/^[A-Za-z0-9_-]{8,20}$/.test(video.videoId)) fail(path, `${at}.videoId`, "is not a YouTube id");
    if (!video.title) fail(path, `${at}.title`, "is missing");
    if (!video.description) fail(path, `${at}.description`, "is missing");
    if (!video.ownerLabel) fail(path, `${at}.ownerLabel`, "is missing");
    if (video.embedUrl !== `https://www.youtube-nocookie.com/embed/${video.videoId}`) {
      fail(path, `${at}.embedUrl`, "must be the privacy-enhanced embed URL for this video id");
    }
    if (video.watchUrl !== `https://www.youtube.com/watch?v=${video.videoId}`) {
      fail(path, `${at}.watchUrl`, "must be the ordinary watch URL for this video id");
    }
    /* A claim RULE must never be transcribed into video copy — the video is content, the thresholds are
       governed facts that live in the manifest. Checked structurally so it cannot creep back in. */
    const copy = `${video.title} ${video.description}`;
    if (/\$[\d,]|\b\d+\s*(days?|years?|months?)\b/i.test(copy)) {
      fail(path, `${at}.description`, "must not state a prize amount or a claim deadline");
    }
  }

  /*
   * DYNAMIC DATA MUST NOT BE HERE (JSON-03). A jackpot or a draw date frozen into static configuration is a
   * stale fact presented as current — the exact hazard CLAUDE.md §14 exists to prevent. Checked structurally
   * so a future edit cannot quietly introduce one.
   */
  const flat = JSON.stringify(c);
  for (const banned of ["drawDateIso", "winningNumbers", "jackpotAmount", "cashValue", "nextPrize",
                        "currentStatus", "lastUpdatedIso", "drawStatus", "resultDate"]) {
    if (flat.includes(banned)) {
      fail(path, banned, "is runtime result data and must not be frozen into static configuration");
    }
  }

  /* No unfinished-looking public output may be configured (§JSON-05). */
  for (const banned of ["not published yet", "Coming soon", "coming soon", "Currently unavailable"]) {
    if (flat.includes(banned)) fail(path, "content", `must not contain the public phrase "${banned}"`);
  }

  const trust = c.trust as StateViewConfig["trust"] | undefined;
  if (!trust?.summary) fail(path, "trust.summary", "is missing");
  if (!trust?.independence) fail(path, "trust.independence", "is missing");

  return c as unknown as StateViewConfig;
}

/**
 * Read one capability.
 *
 * The ONLY reader of `capabilities`, and it returns `false` for an unknown or absent key. CFG-03 requires
 * that "unknown/absent capability must not be interpreted as true", and the single place that can get that
 * wrong is a `cfg.capabilities.someKey` written inline somewhere — so no such expression exists.
 */
export function capabilityOf(cfg: StateViewConfig, key: string): boolean {
  return cfg.capabilities[key] === true;
}

/** True when this State runs no lottery — the ST-06 profile. */
export function isNoLotteryState(cfg: StateViewConfig): boolean {
  return cfg.state.lotteryProfile === "noLottery";
}

/**
 * Whether any approved lower-page content exists for this State.
 *
 * CONTENT-03: a band with no items must disappear entirely rather than leave a heading, a "coming soon" or
 * a gap. This answers that question once, from the data, so no band component has to.
 */
export function hasLowerPageContent(cfg: StateViewConfig): boolean {
  const c = cfg.content;
  return (
    c.explore.items.length > 0 || c.news.items.length > 0 || c.guides.items.length > 0 ||
    c.community.items.length > 0 || c.resources.items.length > 0
  );
}

/**
 * Project a validated configuration into the lower-page view shape the approved band components already
 * consume, so the components are untouched and the rendered output is identical.
 */
export function lowerPageContentFrom(cfg: StateViewConfig): StateLowerPageContent {
  const c = cfg.content;
  return {
    exploreHeading: c.explore.heading,
    exploreIntro: c.explore.intro,
    exploreItems: c.explore.items,
    newsHeading: c.news.heading,
    newsIntro: c.news.intro,
    newsOwnerLabel: c.news.ownerLabel,
    newsItems: c.news.items,
    guidesHeading: c.guides.heading,
    guidesIntro: c.guides.intro,
    guideLabel: c.guides.label,
    guideItems: c.guides.items,
    aiContinuation: c.guides.aiContinuation,
    communityHeading: c.community.heading,
    communityIntro: c.community.intro,
    discussionItems: c.community.items,
    questionContinuation: c.community.questionContinuation,
    resourcesHeading: c.resources.heading,
    claimVideo: c.claimVideo ?? null,
    trustCopy: cfg.trust.summary,
    independenceCopy: cfg.trust.independence,
    resourceItems: c.resources.items,
  };
}
