/*
 * THE SIGNED-IN PERKS MODEL — Home BP-02 §38 and State PF-02 §32, client-layer half. LRG-PERS-001.
 *
 * Authority: BP-02 Part VI §38 (signed-in Home sequence), PF-02 Part VII §32 (signed-in State sequence),
 * Global Shell v1.1 §33 (member state is NEVER in server HTML), `FD-ACC-18` (per-option notification
 * frequency; no delivery claims — `FD-ACC-11`), `CLAUDE.md` §14 (no synthetic lottery fact, no invented
 * prize) and §12 (no signed-in ad inventory exists — the AD-HS01/AD-SS01 anchors stay TYPED AND EMPTY).
 *
 * ══ WHAT THIS MODULE IS ══
 *
 * Pure functions and copy for the personalized layer. It computes everything the two client layers render:
 * saved-set matches against the page's own governed results, the My Lottery Day rows, insights that state
 * why they are shown, and continue-tools items. It owns NO data source: the account comes from the session
 * seam (`lib/account/session.ts`), the lottery facts come from the page's OWN anonymous view model — the
 * layer never fetches, so it can never show a result the public page does not already show.
 *
 * ══ WHAT IT MUST NEVER SAY ══
 *
 * No "almost won", no "near miss", no streaks, no confetti, no urgency, no odds claims, and NEVER a prize:
 * a match statement describes which numbers coincide with the published drawing and stops there. Only the
 * lottery that sold a ticket can validate it. `tests/signed-in-perks.test.ts` sweeps this file and the
 * components for the banned vocabulary.
 */

import type { AccountRecord, SavedNumberSet } from "../account/accountContract";
import type { PreviewEntry } from "../preview/types";
import type { ResultCard } from "../data-provider/types";
import { checkLine, type CheckMatrix } from "../flagship/flagshipCheck";

/* ==================================================================== sequences */

/**
 * One signed-in section, by its governed blueprint id.
 *
 * `heading` is the reader-facing name; State headings that carry the state name use `[State]`, replaced by
 * the renderer with the resolved state name (PF-02 §33's "My [State] Lottery Home").
 */
export interface SignedInSectionSpec {
  id: string;
  heading: string;
  /** True for an advertising anchor position, which renders a typed-empty anchor, never a section. */
  adAnchor?: boolean;
}

/**
 * BP-02 §38, ids verbatim. The anonymous discovery content (H-14B state directory, H-15 trust/footer)
 * is NOT in this list because the layer does not render it — the anonymous page below the layer IS it:
 * "The signed-in page retains broad national and state discovery" (§38).
 *
 * AD-HS01 is present as a TYPED EMPTY anchor: no signed-in ad inventory has been captured from production
 * (`CLAUDE.md` §12 — slots are transcribed, never invented), and §38's "Insider Offer" half is closed to us
 * (`CLAUDE.md` §16 — Member/Insider commercial behaviour is pending founder decisions). The anchor keeps the
 * position governed; it reserves no geometry and renders no creative.
 */
export const HOME_SIGNED_IN_SEQUENCE: readonly SignedInSectionSpec[] = Object.freeze([
  { id: "H-01S", heading: "My Lottery Day" },
  { id: "H-02S", heading: "Followed Results, Featured Games and Jackpots" },
  { id: "H-03S", heading: "My Matches" },
  { id: "H-04S", heading: "Live and Upcoming Draws and Alerts" },
  { id: "AD-HS01", heading: "", adAnchor: true },
  { id: "H-05S", heading: "Worth Knowing for Me" },
  { id: "H-06S", heading: "Following and Community" },
  { id: "H-07S", heading: "Continue My Tools and Systems" },
  { id: "H-08S", heading: "News, Blog and Winners for My Games and States" },
  { id: "H-09S", heading: "Where to Play" },
  { id: "H-10S", heading: "My LotteryCorner Controls" },
]);

/**
 * PF-02 §32, ids verbatim, same discipline. AD-SS00 (the inherited top slot) and AD-SS02 (the lower slot)
 * are NOT the layer's to render: they are inherited from the anonymous composition, which keeps every
 * approved slot exactly where it is — the layer must never move, duplicate or repurpose an ad slot
 * (`CLAUDE.md` §12). AD-SS01 is the one anchor the signed-in sequence introduces, and it is typed-empty
 * for the same two reasons as AD-HS01.
 */
export const STATE_SIGNED_IN_SEQUENCE: readonly SignedInSectionSpec[] = Object.freeze([
  { id: "S-01S", heading: "My [State] Lottery Home" },
  { id: "S-02S", heading: "Followed State Results" },
  { id: "S-03S", heading: "Personal State Next Action" },
  { id: "S-04S", heading: "Live and Upcoming Followed Draws" },
  { id: "S-05S", heading: "My State Matches" },
  { id: "S-06S", heading: "State Alerts" },
  { id: "AD-SS01", heading: "", adAnchor: true },
  { id: "S-07S", heading: "Continue My State Tools and Systems" },
  { id: "S-08S", heading: "Following and State Community" },
  { id: "S-09S", heading: "State News, Winners and Guides" },
  { id: "S-10S", heading: "Where to Play" },
  { id: "S-11S", heading: "Followed Scratchers" },
  { id: "S-12S", heading: "My Controls" },
]);

/* ==================================================================== page facts */

/**
 * How a game's numbers compare. Digit games (Pick 3, Pick 4…) draw positional digits where repeats are
 * legal; ball games draw distinct numbers where order is irrelevant. The extraction site declares which,
 * from the page's own grouping — never guessed from the values.
 */
export type GameKind = "digit" | "ball";

/**
 * One governed lottery fact ALREADY RENDERED on the page, reduced to what the personal layer needs.
 *
 * This is a projection of the page's own view model — the same `ResultCard` contract the anonymous
 * sections render — so the layer cannot state a result the public page does not show (Shell §33: the layer
 * adds ordering and account context, never facts).
 */
export interface PageGameFact {
  /** The account-store game reference form: `powerball`, `fl/pick-3`. */
  gameRef: string;
  gameLabel: string;
  kind: GameKind;
  /** Game-local draw date, ISO. */
  drawDateIso: string;
  drawDateDisplay: string;
  main: readonly number[];
  special: number | null;
  /** The named special ball — "Powerball", "Mega Ball" — when the drawing published one. */
  specialLabel: string | null;
  nextDrawDisplay: string | null;
  nextJackpotDisplay: string | null;
}

function numericValues(values: readonly (number | string)[]): number[] {
  const out: number[] = [];
  for (const v of values) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

/** Project one ResultCard into a fact. Returns null when the card carries no drawn numbers yet. */
export function factFromResultCard(card: ResultCard, gameRef: string, kind: GameKind): PageGameFact | null {
  const groups = [...card.groupsDrawn].sort((a, b) => a.order - b.order);
  if (groups.length === 0) return null;
  const main = numericValues(groups[0]?.values ?? []);
  if (main.length === 0) return null;
  /* The second drawn group, when present, is the named special ball — one value. Multi-value second
     groups (card games and the like) are not comparable to a SavedNumberSet's single `special`. */
  const specialGroup = groups.length > 1 ? groups[1] : undefined;
  const specialValues = specialGroup ? numericValues(specialGroup.values) : [];
  const special = specialValues.length === 1 ? specialValues[0]! : null;
  return {
    gameRef,
    gameLabel: card.displayName,
    kind,
    drawDateIso: card.resultDate.gameLocalDate,
    drawDateDisplay: card.resultDate.display,
    main,
    special,
    specialLabel: special !== null ? (specialGroup?.label ?? null) : null,
    nextDrawDisplay: card.nextDraw?.display ?? null,
    nextJackpotDisplay: card.nextDraw?.nextJackpotDisplay ?? null,
  };
}

/**
 * Facts from the Home view model: the H-02A flagship result cards. Flagship games are national, so their
 * `gameRef` is the bare slug — the same form the flagship save controls write.
 */
export function homeFactsFromEntries(entries: readonly PreviewEntry[]): PageGameFact[] {
  const facts: PageGameFact[] = [];
  for (const e of entries) {
    if (e.kind !== "result-cards") continue;
    for (const card of e.data.cards) {
      const fact = factFromResultCard(card, card.gameSlug, "ball");
      if (fact) facts.push(fact);
    }
  }
  return facts;
}

/** The minimal structural shape of the State model's result groups (`PreviewGroup`). */
export interface StateResultGroupLike {
  groupKey: string;
  cards: readonly { card: ResultCard }[];
}

/**
 * Facts from the State view model's grouped results. Multi-state games keep the bare national ref
 * (`powerball` saved on the flagship page must match here); state games are `{state}/{slug}`. The daily
 * number games are the digit family — declared by the page's OWN grouping, never inferred from values.
 */
export function stateFactsFromGroups(
  groups: readonly StateResultGroupLike[],
  stateCode: string,
): PageGameFact[] {
  const facts: PageGameFact[] = [];
  for (const g of groups) {
    const kind: GameKind = g.groupKey === "dailyVariants" ? "digit" : "ball";
    for (const entry of g.cards) {
      const card = entry.card;
      const gameRef = g.groupKey === "multiState" ? card.gameSlug : `${stateCode}/${card.gameSlug}`;
      const fact = factFromResultCard(card, gameRef, kind);
      if (fact) facts.push(fact);
    }
  }
  return facts;
}

/* ==================================================================== matches */

export type MatchOutcomeKind =
  /** Every digit matches in drawn order. */
  | "digit-exact"
  /** Some digit positions match. */
  | "digit-partial"
  /** A ball-game line with at least one coinciding number (main or the named special). */
  | "ball-match"
  /** A valid comparison in which nothing coincides. Reported honestly, never dressed up. */
  | "no-match"
  /** The saved line and the drawing have different shapes, so no comparison was published. */
  | "not-comparable";

export interface PersonalMatchOutcome {
  setId: string;
  setLabel: string;
  gameRef: string;
  gameLabel: string;
  drawDateIso: string;
  drawDateDisplay: string;
  kind: MatchOutcomeKind;
  /** The reader's values that coincide with the drawing (positional for digits). */
  matchedMain: readonly number[];
  mainMatched: number;
  mainCount: number;
  /** Null when the game has no comparable named special ball. */
  specialMatched: boolean | null;
  /** The reader-facing sentence. Describes the coincidence only — NEVER a prize, a claim or a near-anything. */
  sentence: string;
}

/** The one boundary sentence every match surface carries, mirroring the flagship checker's discipline. */
export const MATCH_BOUNDARY_SENTENCE =
  "This compares your saved numbers with the results shown on this page. Only the lottery that sold a "
  + "ticket can say what any ticket is worth.";

/**
 * Compare one saved digit-game line with the drawing, in drawn order.
 *
 * WHY NOT `checkTicket` (`lib/game/digitTicketCheck.ts`): that checker is play-type- and rule-era-aware —
 * it needs the wager, the play type and the jurisdiction's `GameRuleEra` records, none of which a
 * `SavedNumberSet` carries (a saved set is numbers and a label, deliberately — `accountContract.ts`).
 * So the layer publishes only the era-free fact a positional comparison supports, and SAYS it compared in
 * drawn order rather than implying any play type matched.
 */
function checkDigits(set: SavedNumberSet, fact: PageGameFact): PersonalMatchOutcome {
  const base = matchBase(set, fact);
  if (set.main.length !== fact.main.length) {
    return {
      ...base,
      kind: "not-comparable",
      matchedMain: [],
      mainMatched: 0,
      mainCount: fact.main.length,
      specialMatched: null,
      sentence:
        `“${set.label}” has ${set.main.length} digits and this ${fact.gameLabel} drawing has `
        + `${fact.main.length}, so the two were not compared.`,
    };
  }
  const matchedMain: number[] = [];
  for (let i = 0; i < fact.main.length; i += 1) {
    if (set.main[i] === fact.main[i]) matchedMain.push(set.main[i]!);
  }
  const n = matchedMain.length;
  const total = fact.main.length;
  if (n === total) {
    return {
      ...base, kind: "digit-exact", matchedMain, mainMatched: n, mainCount: total, specialMatched: null,
      sentence:
        `“${set.label}” matches all ${total} digits of the ${fact.gameLabel} drawing shown, in drawn order.`,
    };
  }
  if (n > 0) {
    return {
      ...base, kind: "digit-partial", matchedMain, mainMatched: n, mainCount: total, specialMatched: null,
      sentence:
        `“${set.label}” matches ${n} of ${total} digits of the ${fact.gameLabel} drawing shown, in the same `
        + "position.",
    };
  }
  return {
    ...base, kind: "no-match", matchedMain: [], mainMatched: 0, mainCount: total, specialMatched: null,
    sentence: `“${set.label}” matches none of the digits of the ${fact.gameLabel} drawing shown, in drawn order.`,
  };
}

/**
 * Compare one saved ball-game line via the EXISTING flagship checker (`checkLine`), whose statements are
 * already the governed honest form: they describe the coincidence and never a prize. The matrix is built
 * from the page's own drawn line plus the saved values, wide enough that a legitimately saved set is never
 * rejected on a range guess this layer has no authority to make.
 */
function checkBalls(set: SavedNumberSet, fact: PageGameFact): PersonalMatchOutcome {
  const base = matchBase(set, fact);
  if (set.main.length !== fact.main.length) {
    return {
      ...base,
      kind: "not-comparable",
      matchedMain: [],
      mainMatched: 0,
      mainCount: fact.main.length,
      specialMatched: null,
      sentence:
        `“${set.label}” has ${set.main.length} numbers and this ${fact.gameLabel} drawing has `
        + `${fact.main.length}, so the two were not compared.`,
    };
  }
  const comparable = set.special !== null && fact.special !== null;
  const allValues = [...set.main, ...fact.main];
  const specialValues = comparable ? [set.special!, fact.special!] : [1];
  const matrix: CheckMatrix = {
    mainCount: fact.main.length,
    mainMin: Math.min(...allValues),
    mainMax: Math.max(...allValues),
    specialLabel: comparable ? (fact.specialLabel ?? "special ball") : null,
    specialMin: Math.min(...specialValues),
    specialMax: Math.max(...specialValues),
  };
  const outcome = checkLine(
    { main: set.main, special: comparable ? set.special : null },
    { main: fact.main, special: comparable ? fact.special : null },
    matrix,
  );
  if (!outcome.complete) {
    return {
      ...base,
      kind: "not-comparable",
      matchedMain: [],
      mainMatched: 0,
      mainCount: fact.main.length,
      specialMatched: null,
      sentence: `“${set.label}” could not be compared with the ${fact.gameLabel} drawing shown.`,
    };
  }
  const any = outcome.mainMatched > 0 || outcome.specialMatched === true;
  return {
    ...base,
    kind: any ? "ball-match" : "no-match",
    matchedMain: outcome.matchedValues,
    mainMatched: outcome.mainMatched,
    mainCount: outcome.mainCount,
    specialMatched: outcome.specialMatched,
    sentence: `“${set.label}” — ${outcome.statement}`,
  };
}

function matchBase(set: SavedNumberSet, fact: PageGameFact) {
  return {
    setId: set.id,
    setLabel: set.label,
    gameRef: set.gameRef,
    gameLabel: fact.gameLabel,
    drawDateIso: fact.drawDateIso,
    drawDateDisplay: fact.drawDateDisplay,
  };
}

/**
 * Check every saved set against the page's own facts. A set whose game is not on this page is simply not
 * in the output — the section says how many were checked, so absence is visible, not silent.
 */
export function computeMatches(
  sets: readonly SavedNumberSet[],
  facts: readonly PageGameFact[],
): PersonalMatchOutcome[] {
  const byRef = new Map(facts.map((f) => [f.gameRef, f]));
  const out: PersonalMatchOutcome[] = [];
  for (const set of sets) {
    const fact = byRef.get(set.gameRef);
    if (!fact) continue;
    out.push(fact.kind === "digit" ? checkDigits(set, fact) : checkBalls(set, fact));
  }
  return out;
}

/* ==================================================================== my lottery day */

export interface MyDayRow {
  gameRef: string;
  gameLabel: string;
  /** Present when the followed game's latest result is on this page. */
  fact: PageGameFact | null;
}

/**
 * One row per followed game. A follow whose game is not rendered on this page is an HONEST row, not an
 * omission: the reader is told the result is not on this page rather than shown nothing.
 */
export function myLotteryDayRows(
  followedGames: readonly string[],
  facts: readonly PageGameFact[],
): MyDayRow[] {
  const byRef = new Map(facts.map((f) => [f.gameRef, f]));
  return followedGames.map((gameRef) => {
    const fact = byRef.get(gameRef) ?? null;
    return { gameRef, gameLabel: fact?.gameLabel ?? labelFromRef(gameRef), fact };
  });
}

/** A readable fallback name from a game ref — `fl/pick-3` → "FL Pick 3" — for follows not on this page. */
export function labelFromRef(gameRef: string): string {
  const [a, b] = gameRef.split("/");
  const title = (s: string) => s.split("-").map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w)).join(" ");
  return b ? `${a!.toUpperCase()} ${title(b)}` : title(a ?? gameRef);
}

/* ==================================================================== insights — H-05S */

/**
 * One deterministic insight. `whyShown` is MANDATORY and rendered: BP-02's H-05S must state why each
 * insight is shown, so the reason is part of the type, not a styling afterthought.
 */
export interface PersonalInsight {
  text: string;
  whyShown: string;
}

/**
 * Worth Knowing for Me — deterministic restatements of facts already on the page, each carrying its
 * reason. Nothing here predicts, recommends numbers, or speaks about odds; that vocabulary is banned
 * (Constitution — never "increase your chances", never certainty about a fair independent draw).
 */
export function worthKnowingInsights(
  account: Pick<AccountRecord, "followedGames" | "followedStates" | "savedNumberSets">,
  facts: readonly PageGameFact[],
): PersonalInsight[] {
  const byRef = new Map(facts.map((f) => [f.gameRef, f]));
  const insights: PersonalInsight[] = [];
  for (const ref of account.followedGames) {
    const fact = byRef.get(ref);
    if (!fact) continue;
    insights.push({
      text: `The latest ${fact.gameLabel} result on this page is from ${fact.drawDateDisplay}.`,
      whyShown: `Shown because you follow ${fact.gameLabel}.`,
    });
    if (fact.nextDrawDisplay) {
      insights.push({
        text: `The next ${fact.gameLabel} drawing shown here is ${fact.nextDrawDisplay}.`,
        whyShown: `Shown because you follow ${fact.gameLabel}.`,
      });
    }
  }
  const setsByRef = new Map<string, number>();
  for (const s of account.savedNumberSets) setsByRef.set(s.gameRef, (setsByRef.get(s.gameRef) ?? 0) + 1);
  for (const [ref, count] of setsByRef) {
    const fact = byRef.get(ref);
    if (!fact) continue;
    insights.push({
      text:
        `${count === 1 ? "One saved line" : `${count} saved lines`} for ${fact.gameLabel} `
        + `${count === 1 ? "is" : "are"} checked against this page's results in My Matches.`,
      whyShown: `Shown because you saved numbers for ${fact.gameLabel}.`,
    });
  }
  return insights.slice(0, 5);
}

/* ==================================================================== continue — H-07S / S-07S */

/** The Tax Calculator's saved-scenario preference key prefix — must match `TaxCalculatorTool.tsx`. */
export const TAX_SCENARIO_KEY_PREFIX = "tax-scenario:";

export interface ContinueItem {
  kind: "tax-scenario" | "saved-set" | "guest-progress";
  label: string;
  detail: string | null;
  savedAtIso: string;
  /** A registry-served destination, or null when the item is informational. */
  href: string | null;
}

/**
 * Continue My Tools and Systems: saved tax scenarios (the Tax Calculator's own page-preference records),
 * saved number sets, and — passed in by the caller — any device-local guest progress, which keeps its
 * "this device only" honesty when shown to a signed-in reader (it was never uploaded).
 */
export function continueItems(
  account: Pick<AccountRecord, "preferences" | "savedNumberSets">,
  guestItems: readonly { label: string; detail?: string; savedAtIso: string }[],
  taxCalculatorHref: string,
): ContinueItem[] {
  const items: ContinueItem[] = [];
  for (const [key, v] of Object.entries(account.preferences.page)) {
    if (!key.startsWith(TAX_SCENARIO_KEY_PREFIX) || v.value === "off") continue;
    items.push({
      kind: "tax-scenario", label: v.value, detail: "Saved tax scenario — re-enter it by hand on the calculator.",
      savedAtIso: v.savedAtIso, href: taxCalculatorHref,
    });
  }
  for (const s of account.savedNumberSets) {
    items.push({
      kind: "saved-set",
      label: s.label,
      detail: `Saved numbers for ${labelFromRef(s.gameRef)}.`,
      savedAtIso: s.savedAtIso,
      href: null,
    });
  }
  for (const g of guestItems) {
    items.push({
      kind: "guest-progress",
      label: g.label,
      detail: g.detail ?? "Stored on this device only — it was never uploaded to your account.",
      savedAtIso: g.savedAtIso,
      href: null,
    });
  }
  return items.sort((a, b) => (a.savedAtIso < b.savedAtIso ? 1 : -1));
}

/* ==================================================================== governed copy */

/**
 * The notification options the controls sections offer — `FD-ACC-18`: each is its own affirmative choice
 * and DECLARES ITS FREQUENCY BEFORE it is chosen. Recording one promises nothing about delivery
 * (`FD-ACC-11`); every surface that shows them renders `NO_DELIVERY_SENTENCE` beside them.
 */
export const NOTIFICATION_OPTIONS: readonly { key: string; label: string; frequency: string }[] =
  Object.freeze([
    {
      key: "draw-reminder",
      label: "Drawing reminders for games I follow",
      frequency: "Up to once per drawing",
    },
    {
      key: "result-posted",
      label: "New results for games I follow",
      frequency: "Up to once per drawing, after the result is published",
    },
    {
      key: "jackpot-update",
      label: "Jackpot updates for games I follow",
      frequency: "Up to once per day",
    },
  ]);

/** `FD-ACC-11`: no email, push or service-worker channel exists, so no surface may imply anything is sent. */
export const NO_DELIVERY_SENTENCE =
  "Nothing is sent yet — there is no email or push channel. Each choice is saved to your account for when "
  + "one exists.";

/**
 * H-09S / S-10S — Where to Play. The Constitution and `CLAUDE.md` §13 are explicit that purchase
 * eligibility is a fact about jurisdiction, resolved in the approved precedence order; an ACCOUNT is not in
 * that order, so this copy states the boundary rather than leaving it implicit.
 */
export const WHERE_TO_PLAY_ACCOUNT_NEUTRAL =
  "Signing in does not change where lottery tickets can be bought. Availability depends on the state you "
  + "are in, not on your account — each state page shows what is offered there.";

/** S-11S — the honest empty state: LotteryCorner carries no scratcher data, so nothing is followable yet. */
export const SCRATCHERS_EMPTY_SENTENCE =
  "LotteryCorner does not carry scratcher information yet, so there are no scratchers to follow. When "
  + "scratcher data is added, the ones you follow will appear here.";

/** The follow-first-game path for a reader with no follows yet. Plain, no pressure. */
export const FOLLOW_FIRST_GAME_SENTENCE =
  "Follow a game and this page starts with it. The follow control is on every game page.";

/** H-08S / S-09S — honest scope line: per-account filtered feeds are API-phase work. */
export const PERSONAL_FEED_SCOPE_SENTENCE =
  "These link to the full sections. Feeds filtered to your games and states arrive with the account API.";
