/*
 * State engagement model — LRG-STATE-034.
 *
 * WHY THIS MODULE EXISTS. The rejected implementation had every capability the research asks for and none of
 * the loop the research describes. AI, discussion, "what changed" and Buy Now each existed as a section in a
 * long stack of equally-weighted modules, so a reader who had just checked a result was offered nothing.
 *
 * The researched CONTINUITY LOOP has EIGHT steps, not six
 * (`03-docs/00-foundation/research/00B-lottery-player-behavior-engagement-and-ai-experience-research.md` §1.1,
 * and Constitution §6, identical wording):
 *
 *     check -> understand -> explore -> save -> follow -> discuss -> return -> transact when appropriate
 *
 * `save` and `follow` are DEFERRED for the anonymous launch by `FD-X-09` and `FD-N-04`, which also forbid
 * rendering disabled Follow or Notify controls. So the loop this page can honestly implement today is the
 * six-step one — and the two missing steps are missing by decision, not by omission.
 *
 * The Constitution adds that this is "not a fixed funnel": a reader may enter in the middle or skip steps, so
 * every step below is reachable independently rather than gated behind the previous one.
 *
 * This file is the typed spine of that loop. It holds no JSX and makes no network call. It exists so the
 * engagement surfaces share ONE definition of what an action is, what context it carries and which shared
 * surface it opens — the property that makes "AI everywhere" mean contextual intelligence rather than the
 * same button repeated everywhere.
 *
 * NOTHING HERE IS LIVE. No AI service, no community backend, no commerce. Every surface these types feed is
 * a guarded preview.
 */

import type { ResolvedFamily } from "./gameFamilyPresentation";

/* ------------------------------------------------------------------ shared surfaces */

/**
 * The three shared surfaces of the loop. There is exactly ONE of each on the page.
 *
 * `ai` answers, `discussion` hosts conversation, `commerce` resolves purchase options. Every contextual
 * action anywhere on the page targets one of these three by dispatching an event — which is what keeps the
 * "one shared surface" guarantee true in the DOM rather than only on paper.
 */
export type SharedSurface = "ai" | "discussion" | "commerce";

/** The DOM events that open each shared surface. One event per surface, no exceptions. */
export const SURFACE_EVENT: Record<SharedSurface, string> = {
  ai: "lcs-ai-select",
  discussion: "lcs-discuss-open",
  commerce: "lcs-buynow-open",
};

/* ------------------------------------------------------------------ discussion context */

/**
 * What a discussion action carries with it.
 *
 * The research is specific that lottery discussion is CONTEXTUAL — players discuss a particular game's
 * particular draw, not the lottery in general. A discussion opened from a result must therefore know which
 * result, from when, in what state, and with what source and correction status. Without that it is a generic
 * comment box, which is the thing that does not get used.
 */
export interface DiscussionContext {
  stateName: string;
  stateCode: string;
  /** The game family being discussed, or `null` for a state-level discussion. */
  familyLabel: string | null;
  familyId: string | null;
  /** The draw date in question, exactly as published. */
  resultDateDisplay: string | null;
  resultDateIso: string | null;
  /** Verified / corrected / awaiting — the status the reader is looking at. */
  resultStatus: string | null;
  /** The official source this result came from, so the discussion can cite it. */
  sourceName: string;
  officialSourceUrl: string | null;
  /** Set only when a correction actually applies. Never invented. */
  correctionNote: string | null;
}

/** Build a discussion context from a resolved family. Pure, so the surfaces cannot disagree. */
export function discussionContextForFamily(
  family: ResolvedFamily,
  stateName: string,
  stateCode: string,
  sourceName: string,
  officialSourceUrl: string | null,
): DiscussionContext {
  /* The family's newest verified member result is the one a reader is most likely asking about. Members are
     never re-sorted, so this reads the aggregate the resolver already computed. */
  const lead = family.members.find((m) => m.result?.drawDateIso === family.newestVerifiedDateIso)
    ?? family.members[0];
  return {
    stateName,
    stateCode,
    familyLabel: family.familyLabel,
    familyId: family.familyId,
    resultDateDisplay: lead?.result?.drawDateDisplay ?? null,
    resultDateIso: lead?.result?.drawDateIso ?? null,
    resultStatus: lead?.result?.status ?? null,
    sourceName,
    officialSourceUrl,
    correctionNote: null,
  };
}

/* ------------------------------------------------------------------ community areas */

/**
 * A high-context discussion area.
 *
 * These are the areas the research identifies as the ones lottery players actually use: a specific game
 * group, the multi-state games, result questions and corrections, claim and help, and reactions to real
 * news. They are AREAS, not threads — no thread, post, reply, member or activity count is fabricated
 * anywhere in this implementation.
 */
/**
 * The FOUR-TIER community AI policy — 00B §15.2, carried as constitutional text in Constitution §31.
 *
 * Four tiers, not a two-way split. The distinction matters most at the bottom: there are questions where AI
 * may not answer autonomously at all, and questions where it must not participate socially in any form.
 * Collapsing those into "humans first" understates both.
 *
 * `tierA` IMMEDIATE FACTUAL RESEARCH NOTE — current official result or rule, schedule, game mechanics, public
 *         claim procedure, verifiable history, official online-purchase availability. A labelled, visually
 *         separate note with sources shown. AI receives no member reputation.
 * `tierB` HUMAN FIRST, AI LATER — strategy, scratcher and retailer experiences, number rituals, opinion and
 *         debate. AI waits for human participation or an unanswered threshold.
 * `tierC` MODERATOR-TRIGGERED ONLY — winner privacy, tax, law, anonymity, disputed tickets, fraud
 *         accusations, possible scams, youth concerns, financial distress. No autonomous public answer.
 * `tierD` NO AI SOCIAL PARTICIPATION — condolences and deeply personal stories, interpersonal conflict,
 *         celebrations where synthetic praise would be inauthentic, explicit requests for human-only views.
 */
export type CommunityAiTier = "tierA" | "tierB" | "tierC" | "tierD";

export interface CommunityArea {
  key: string;
  /** The in-page id this group renders at, so a discuss action can navigate straight to it. */
  id: string;
  label: string;
  /** What this area is for, in a player's words. */
  purpose: string;
  /**
   * The cold-start action a reader can genuinely take today. There is no community backend, so this opens
   * the labelled preview surface — it never pretends to post.
   */
  coldStartAction: string;
  /** Which of the four researched tiers governs AI participation in this area. */
  aiParticipation: CommunityAiTier;
}

/**
 * Areas for a jurisdiction, derived from the families the page actually renders.
 *
 * Derived rather than hardcoded so a state with no daily games shows no daily-games area, and so nothing
 * claims an area exists for a game the state does not offer (`FD-X-01`).
 */
/**
 * The THREE visible launch groups — LRG-STATE-037 §9.
 *
 * The previous eight areas were too many for a cold-start landing page: eight empty groups read as an empty
 * forum, which `01 §56` warns against ("do not open every possible category") and `00B §27.3` names as the
 * failure mode where "users infer the community is dead".
 *
 * The finer categories are not deleted — they remain in `FUTURE_AREA_KEYS` as configuration, so nothing is
 * lost and nothing renders as an empty card.
 */
export const FUTURE_AREA_KEYS: readonly string[] = [
  "reactions", "beginners", "frequent", "news",
];

/** The in-page id a discuss action navigates to, for the group that fits a family. */
export function communityGroupIdFor(family: ResolvedFamily): string {
  if (family.group === "dailyVariants" || family.group === "specialized") return "community-daily";
  if (family.group === "stateOnly" || family.group === "multiState") return "community-jackpot";
  return "community-help";
}

export function communityAreasFor(
  stateName: string,
  families: readonly ResolvedFamily[],
): CommunityArea[] {
  const areas: CommunityArea[] = [];
  const has = (group: ResolvedFamily["group"]) => families.some((f) => f.group === group);

  /* 1. Daily number games — the durable anchor. PF-02 §1.4 records that LotteryPost's long-running monthly
        Pick 3 / Pick 4 threads organised by state prove state identity is what sustains these. */
  if (has("dailyVariants") || has("specialized")) {
    areas.push({
      key: "daily",
      id: "community-daily",
      label: `${stateName} daily number games`,
      purpose: "Midday and evening draws, add-on results, and how the daily games work.",
      coldStartAction: "Join the discussion",
      aiParticipation: "tierA",
    });
  }
  /* 2. Jackpot and multi-state games, together — a reader thinking about jackpots is not distinguishing
        between a state jackpot game and Powerball. */
  if (has("stateOnly") || has("multiState")) {
    areas.push({
      key: "jackpot",
      id: "community-jackpot",
      label: "Jackpot and multi-state games",
      purpose: "Jackpot movement, Powerball and Mega Millions, secondary draws and draw-night questions.",
      coldStartAction: "Join the discussion",
      aiParticipation: "tierA",
    });
  }
  /* 3. Results, claims and player questions. Always present, and TIER C because it carries claims, tax and
        anonymity — no autonomous AI answer (00B §15.2). */
  areas.push({
    key: "help",
    id: "community-help",
    label: "Results, claims and player questions",
    purpose: "Ask about a published result, report something that looks wrong, or ask about claiming a prize.",
    coldStartAction: "Ask a question",
    aiParticipation: "tierC",
  });
  return areas;
}

/**
 * The AI-participation sentence shown for an area.
 *
 * Stated on the surface rather than only in documentation, because the reader is the person who needs to know
 * whether a reply might come from a machine. `LotteryCorner Research Note` is the approved label for a
 * community AI note (Constitution §13; 00B §5.4 adds "not 'expert' or a human name").
 */
export function aiParticipationNote(tier: CommunityAiTier): string {
  switch (tier) {
    case "tierA":
      return "A LotteryCorner Research Note can add cited sources after a discussion is posted.";
    case "tierB":
      return "Human responses come first here. AI only helps if a factual question goes unanswered.";
    case "tierC":
      return "A moderator reviews these. AI never answers on its own.";
    case "tierD":
      return "People only. AI does not take part in this area.";
  }
}

/* ------------------------------------------------------------------ engagement actions */

/** One action in the consumer action row. */
export interface EngagementAction {
  key: "ask-ai" | "discuss" | "buy" | "changed";
  /**
   * The plain label. `ask-ai` is refined with the game in context at render time (FV-04 §8); the rest are
   * short enough to stand alone on a 320px row.
   */
  label: string;
  /**
   * LRG-STATE-037 FV-08. Exactly ONE primary; the rest are compact secondary actions. Four equal outlined
   * cards read as four administrative controls, which is what founder review rejected.
   */
  emphasis: "primary" | "secondary";
  /**
   * Which shared INLINE surface the reader is moved to, or `route` for a plain in-page destination.
   *
   * FV-03: none of these opens a dialog. `ai` and `commerce` dispatch at their shared surface and then scroll
   * and focus it; `discussion` and `route` are ordinary anchors.
   */
  opens: SharedSurface | "route";
  /**
   * In-page destination for `route` actions. Must resolve to a real rendered id. `discussion` resolves its
   * destination per family at render time, so it carries no fixed href here.
   */
  href?: string;
}

/**
 * The four immediate actions, in the researched order: understand -> discuss -> transact -> return.
 *
 * WHAT LRG-STATE-037 CHANGED. The `hint` field is gone. It rendered one line of microcopy under every label,
 * and FV-08 forbids explanatory microcopy under every action while FV-09 forbids tiny metadata lines. Removing
 * the field rather than leaving it unread keeps this record honest about what the row shows.
 *
 * `Check Ticket` is deliberately ABSENT. The task permits it to replace `What Changed` only when the
 * deterministic checker genuinely works; it does not exist yet, and `FD-S-08` forbids showing a control that
 * looks functional and is not.
 */
export function engagementActions(): EngagementAction[] {
  return [
    { key: "ask-ai", label: "Ask AI", emphasis: "primary", opens: "ai" },
    { key: "discuss", label: "Discuss", emphasis: "secondary", opens: "discussion" },
    { key: "buy", label: "Buy Now", emphasis: "secondary", opens: "commerce" },
    { key: "changed", label: "What changed", emphasis: "secondary", opens: "route", href: "#what-changed" },
  ];
}
