/*
 * SAVE, FOLLOW, ALERTS AND PERSONALISATION — LRG-FLAGSHIP-002, section FG-14.
 *
 * Authority: BP-04A §28 (saved numbers, saved tools, result, jackpot threshold, draw reminder, news, discussion
 * reply, app/email), `ACCT-DEC-001` `FD-ACC-15` (the Account is free, and exists for continuity), `FD-ACC-16`
 * (no paid tier, paywall, premium plan, upgrade prompt or conversion strategy), `FD-ACC-18` (any future
 * notification is explicit opt-in, frequency-controlled and easy to disable), `FD-DAT-06` (nothing about the gate
 * may be sold), the active founder instruction (*"Visible controls … Signed-in gated: create alert, manage
 * alerts, follow game, follow tagged content, save page personalization"*).
 *
 * ══ WHAT IS TRUE OF EVERY OPTION HERE — UPDATED UNDER CONFLICT 37 (2026-08-11) ══
 *
 *   - It is **visible**, in the position it occupies for a signed-in reader (`FD-DAT-03`).
 *   - It is **functional**: signed out, it opens the real shared sign-in flow via the `FD-DAT-04` affordance
 *     and resumes after sign-in (`FD-ACC-12`/`FD-ACC-13`); signed in, it genuinely toggles on the member's
 *     review-mode account.
 *   - **Nothing claims delivery.** A recorded alert preference is a saved choice; no channel exists
 *     (`FD-ACC-11`), and the surface says so in plain words.
 *   - Nothing anywhere mentions a plan, a tier, a trial, a limit money would raise, or an upgrade.
 *   - Each is a **separate** choice with its own frequency implication, because `FD-ACC-18` forbids a
 *     notification arriving as a side effect of signing in or following.
 *
 * ══ THE INTENT SHAPE, NOW CONSUMED ══
 *
 * `EngagementIntent` is what `FD-ACC-12`'s allowlisted, expiring, single-use nonce carries for this page
 * family: the return path, the game, and the action the reader asked for. `lib/account/signInIntent.ts`
 * stores it and `/login` completes it.
 */

import type { LockedCapability } from "./flagshipContract";
import type { FlagshipGameConfig } from "./flagshipGames";

export type EngagementCategory = "alert" | "follow" | "personalise";

export interface EngagementOption extends LockedCapability {
  category: EngagementCategory;
  /** What arriving looks like, so the reader knows what they are agreeing to before they agree. */
  frequencyNote: string;
}

/**
 * A captured intent.
 *
 * `returnTo` is an internal path from this page's own canonical route — never an arbitrary or caller-supplied
 * URL, so an open redirect is not expressible even before the server allowlist exists.
 */
export interface EngagementIntent {
  action: string;
  label: string;
  gameSlug: string;
  returnTo: string;
}

export function engagementIntent(cfg: FlagshipGameConfig, option: EngagementOption): EngagementIntent {
  return {
    action: option.key,
    label: option.label,
    gameSlug: cfg.gameSlug,
    returnTo: `${cfg.canonicalPath}#alerts`,
  };
}

/**
 * The engagement options a flagship hub offers.
 *
 * Generated from the game config, so the jackpot-threshold option names the game and the draw reminder names its
 * real draw nights. Nothing here branches on a slug.
 */
export function engagementOptions(cfg: FlagshipGameConfig): EngagementOption[] {
  const days = cfg.drawDays.value;
  return [
    {
      key: "jackpot-threshold",
      label: "Tell me when the jackpot passes an amount",
      benefit: `A message when the advertised ${cfg.gameLabel} jackpot crosses a figure you choose.`,
      gate: "signedIn",
      category: "alert",
      frequencyNote: "At most once each time it crosses your figure.",
    },
    {
      key: "draw-reminder",
      label: "Remind me before the drawing",
      benefit: `A reminder before the ${days} drawing, at a time you set.`,
      gate: "signedIn",
      category: "alert",
      frequencyNote: `Up to once per drawing — ${days}.`,
    },
    {
      key: "result-alert",
      label: "Send me the winning numbers",
      benefit: "The result as soon as it is verified, instead of you coming back to look.",
      gate: "signedIn",
      category: "alert",
      frequencyNote: "Once per drawing, after the result is verified.",
    },
    {
      key: "favourite-numbers-alert",
      label: "Tell me if my numbers come up",
      benefit: "Your saved lines are compared after each drawing and you hear only if one matches.",
      gate: "signedIn",
      category: "alert",
      frequencyNote: "Only when one of your saved lines matches.",
    },
    {
      key: "weekly-digest",
      label: "Send me a weekly summary",
      benefit: `One message a week covering ${cfg.gameLabel} results, the jackpot and anything corrected.`,
      gate: "signedIn",
      category: "alert",
      frequencyNote: "Once a week.",
    },
    {
      key: "follow-game",
      label: `Follow ${cfg.gameLabel}`,
      benefit: "This game leads your home page and your saved views open on it.",
      gate: "signedIn",
      category: "follow",
      frequencyNote: "Following on its own sends nothing. Each alert above is a separate choice.",
    },
    {
      key: "follow-tag",
      label: `Follow ${cfg.contentTag} guides, news and discussions`,
      benefit: `New content tagged ${cfg.contentTag} is collected for you in one place.`,
      gate: "signedIn",
      category: "follow",
      frequencyNote: "Following on its own sends nothing.",
    },
    {
      key: "save-personalisation",
      label: "Remember how I like this page",
      benefit: "Your Stats Lab view, saved lines and the sections you use open the way you left them.",
      gate: "signedIn",
      category: "personalise",
      frequencyNote: "Sends nothing. It only changes what this page looks like when you return.",
    },
  ];
}

/**
 * The one statement the signed-out panel makes about the state of the world.
 *
 * The honest floor under every gated control: what an Account is for, that it is free, and — plainly — that
 * nothing is saved until the reader signs in. `FD-ACC-15` requires the first, `FD-DAT-06` and `FD-ACC-16`
 * forbid anything resembling an upsell, and `CLAUDE.md` §14 requires the last.
 */
export const ENGAGEMENT_LOCKED_NOTE =
  "A LotteryCorner account is free and exists to remember things for you — your numbers, what you follow, where " +
  "you were — across every device you use. Nothing is turned on and nothing has been saved until you sign in. " +
  "Each of these is a separate choice you make, with its own frequency, and each is as easy to turn off as to " +
  "turn on.";
