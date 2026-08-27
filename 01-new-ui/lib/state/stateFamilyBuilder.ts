/*
 * THE GENERIC STATE FAMILY BUILDER — LRG-STATE-047.
 *
 * Maps any jurisdiction's draw events onto the generic presentation model. This is `floridaFamilyBuilder.ts`
 * with its three Florida imports turned into three parameters; the mapping logic is unchanged, and a test
 * asserts that Florida's resolved families are deep-equal to what the Florida builder produces.
 *
 * NOTHING IS INVENTED. Each member row carries that member game's OWN feed values. Where the feed has no
 * value the row resolves with `result: null` rather than borrowing a sibling's numbers — the defect this
 * whole model exists to prevent, and the one California's empty Mega Millions record exercises for real.
 */

import type { StateDrawEvent } from "./stateDrawEvents";
import {
  resolveFamily, type GameFamilyConfig, type MemberResultInput, type ResolvedFamily, type MemberBallGroup,
} from "./gameFamilyPresentation";
import { selectFormatVersion, type ResultFormatVersion } from "./resultFormatContract";
import type { StateFamilyConfig } from "./stateViewConfig";

/**
 * Weekday + date, in the game's own local calendar.
 *
 * The date stays exact rather than relative — CLAUDE.md §7 requires an exact date wherever "today" or "last
 * night" could be ambiguous, and with a feed this old it certainly could be.
 */
function displayDate(iso: string | null): string {
  if (!iso) return "No result yet";
  const [y, m, d] = iso.split("-");
  const weekday = new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short", timeZone: "UTC",
  });
  return `${weekday} ${m}/${d}/${y}`;
}

/**
 * Ball groups for one member game.
 *
 * A drawn add-on such as Fireball comes from the FORMAT's add-on definition, not from the feed's special-ball
 * list, so its `addOn` visual role and accessible label are governed rather than guessed.
 */
function groupsFor(e: StateDrawEvent, fmt: ResultFormatVersion | undefined): MemberBallGroup[] {
  const drawnAddOnLabels = new Set(
    (fmt?.addOns ?? []).filter((a) => a.addOnClass === "drawn").map((a) => a.label.toLowerCase()),
  );
  const out: MemberBallGroup[] = [
    { label: null, values: e.mainNumbers, colorToken: "ball.default", visualRole: "main" },
  ];
  for (const s of e.specialBalls) {
    const isAddOn = drawnAddOnLabels.has(s.label.toLowerCase());
    out.push({
      label: s.label,
      values: s.values,
      colorToken: isAddOn
        ? "ball.fireball"
        : s.label.toLowerCase().includes("mega")
          ? "ball.megaball"
          : "ball.powerball",
      visualRole: isAddOn ? "addOn" : "special",
      accessibleLabel: s.label,
    });
  }
  return out;
}

/**
 * Prize summary, LABELLED by the format's prize kind.
 *
 * `unavailable` returns nothing, which is how every state-native game in the four new preview States behaves:
 * the feed has a money figure but the governed semantics behind it are unverified, and an unlabelled money
 * string beside a result is exactly what `PrizeSpec` exists to prevent.
 */
function prizeFor(e: StateDrawEvent, fmt: ResultFormatVersion | undefined) {
  if (!fmt || !e.topPrizeDisplay) return undefined;
  switch (fmt.prize.kind) {
    case "stakeDependentPrize":
      return undefined;
    case "estimatedAnnuitizedJackpot":
      return { label: "Est. annuitized jackpot", value: e.topPrizeDisplay };
    case "advertisedJackpot":
      return { label: "Advertised jackpot", value: e.topPrizeDisplay };
    case "variableTopPrize":
      return { label: "Est. top prize", value: e.topPrizeDisplay };
    case "fixedTopPrize":
      return { label: "Top prize", value: e.topPrizeDisplay };
    default:
      return undefined;
  }
}

function secondaryFor(e: StateDrawEvent): MemberResultInput["secondary"] {
  if (!e.secondaryDraw) return null;
  return {
    label: e.secondaryDraw.label,
    groups: [
      { label: null, values: e.secondaryDraw.mainNumbers, colorToken: "ball.default", visualRole: "main" },
      ...e.secondaryDraw.specialBalls.map((s) => ({
        label: s.label, values: s.values, colorToken: "ball.powerball",
        visualRole: "special" as const, accessibleLabel: s.label,
      })),
    ],
  };
}

/**
 * The family-level history destination.
 *
 * Per-game archive routes (`/{state}/{game}/{year}`) are preserved patterns that are NOT implemented, and
 * `FD-S-30` forbids inventing one — so History points at this page's own history-and-tools section rather
 * than at an outbound operator archive. One line changes when an internal archive ships.
 */
const HISTORY_HREF = "#state-tools";

/** Configuration from JSON widened to the presentation layer's own type. Shapes are identical by design. */
function toFamilyConfig(f: StateFamilyConfig): GameFamilyConfig {
  return {
    familyId: f.familyId,
    familyLabel: f.familyLabel,
    ...(f.visualIdentity ? { visualIdentity: f.visualIdentity } : {}),
    group: f.group,
    formatGameKey: f.formatGameKey,
    members: f.members.map((m) => ({
      gameId: m.gameId, variantLabel: m.variantLabel, displayOrder: m.displayOrder,
    })),
    ...(f.historyHref ? { historyHref: f.historyHref } : {}),
    buyNowEligible: f.buyNowEligible,
    ...(f.aiContextKey ? { aiContextKey: f.aiContextKey } : {}),
    priority: f.priority,
    ...(f.retired ? { retired: f.retired } : {}),
  };
}

export interface StateFamilyBuildInput {
  families: readonly StateFamilyConfig[];
  events: readonly StateDrawEvent[];
  formats: readonly ResultFormatVersion[];
  /** Display timezone label appended to each member's own published draw time. */
  timezoneLabel: string;
  todayIso: string;
}

/**
 * Build every family surface for one jurisdiction.
 *
 * A member whose game has no transcribed event is omitted, exactly as before. A member whose event exists
 * but carries NO DRAWN NUMBERS is also omitted — `FAM-04`: an empty ball row is not an honest result state,
 * and the alternative (rendering the family's other members) is what the rule protects.
 */
export function buildStateFamilies(input: StateFamilyBuildInput): ResolvedFamily[] {
  const { families, events, formats, timezoneLabel: tz, todayIso } = input;
  const byId = new Map(events.map((e) => [e.gameId, e]));

  return families
    .filter((c) => !c.retired)
    .map((base) => {
      const config = { ...toFamilyConfig(base), historyHref: base.historyHref ?? HISTORY_HREF };
      const fmt = selectFormatVersion(formats, config.formatGameKey, todayIso);

      const inputs: MemberResultInput[] = config.members
        .map((m) => byId.get(m.gameId))
        .filter((e): e is StateDrawEvent => Boolean(e))
        /* FAM-04. California's Mega Millions record has a result date and a prize but an empty
           `<numbers-str/>`. Rendering it would print a labelled result with no numbers under it; borrowing
           another State's identical Mega Millions draw would be worse. It is dropped, and because that is
           the family's only member the family resolves empty and the section suppresses it. */
        .filter((e) => e.mainNumbers.length > 0 || e.specialBalls.length > 0)
        .map((e) => ({
          gameId: e.gameId,
          drawDateIso: e.resultDate,
          drawDateDisplay: displayDate(e.resultDate),
          groups: groupsFor(e, fmt),
          status: "verified" as const,
          /* The feed's published multiplier, with the KIND from the governed format so a multiplier the
             player must choose and pay for is never confused with one that is included. */
          multiplier: e.multiplier
            ? { label: e.multiplier.label, value: e.multiplier.value, kind: fmt?.multiplier?.kind ?? "unavailable" }
            : null,
          /* The feed carries only published results, so there is no open status to report. When a status
             feed exists this is where pending/delayed/corrected attaches — ALONGSIDE the verified result
             above, never replacing it. */
          currentStatus: null,
          /* The member game's OWN published draw time, with the display timezone appended once. Verified
             schedule, not a computed "next draw": the feed is weeks old and a calculated next-draw date
             against a stale result set would mislead. */
          drawTimeLocal: e.drawTimeLocal ? `${e.drawTimeLocal.trim()} ${tz}` : null,
          drawDays: e.drawDays,
          /* No internal per-game archive route exists yet, so no link is emitted (FD-S-30). */
          historyHref: null,
          sourceName: "LotteryCorner production results feed",
          prizeSummary: prizeFor(e, fmt),
          secondary: secondaryFor(e),
        }));

      return resolveFamily(config, inputs);
    })
    /*
     * FAM-04, at family level. `resolveFamily` always returns one row per CONFIGURED member, so a family
     * whose every member was dropped still has rows — it just has no results in them. A surface of empty
     * rows under a game name is not an honest state, so the family is removed entirely.
     *
     * Note what this does NOT do: a family keeps its place as long as ONE member has a result, so Pick 3
     * never disappears because the Evening draw has not happened yet. That is the other half of FAM-04.
     */
    .filter((f) => f.members.some((m) => m.result !== null));
}
