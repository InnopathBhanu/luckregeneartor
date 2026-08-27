/*
 * Florida family builder — maps production-derived draw events onto the generic presentation model.
 *
 * Task LRG-STATE-030. Reads `floridaDrawEvents.ts` (production-derived, one record per member game) and
 * `floridaFamilyConfig.ts` (composition), and produces `ResolvedFamily[]` for rendering.
 *
 * NOTHING IS INVENTED. Each member row carries that member game's OWN feed values. Where the feed has no
 * value, the row renders with `result: null` rather than borrowing a sibling's numbers — the defect this
 * whole model exists to prevent.
 */

import { FLORIDA_DRAW_EVENTS, type FloridaDrawEvent } from "./floridaDrawEvents";
import { FLORIDA_FAMILIES } from "./floridaFamilyConfig";
import {
  resolveFamily, type MemberResultInput, type ResolvedFamily, type MemberBallGroup,
} from "./gameFamilyPresentation";
import { selectFormatVersion, type ResultFormatVersion } from "./resultFormatContract";
import { FLORIDA_FORMAT_VERSIONS } from "./floridaFormatRegistry";

/**
 * Weekday + date, in the game's own local calendar.
 *
 * LRG-STATE-031: the DRAW TIME is no longer folded into this string. The member row now has its own
 * schedule column, and carrying the time in both places printed it twice. The date remains exact rather
 * than relative — CLAUDE.md §7 requires an exact date wherever "today" or "last night" could be ambiguous,
 * and with a 20-day-old feed it certainly could be.
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
 * Fireball comes from the FORMAT's drawn add-on definition, not from the feed's special-ball list, so its
 * `addOn` visual role and accessible label are governed rather than guessed (LRG-STATE-029).
 */
function groupsFor(e: FloridaDrawEvent, fmt: ResultFormatVersion | undefined): MemberBallGroup[] {
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
 * Prize summary, LABELLED by the format's prize kind (LRG-STATE-029).
 *
 * A stake-dependent prize returns `undefined`: Cash Pop's prize is the stake multiplied 5x-250x, so any
 * single figure is meaningless without ticket context and must not be shown.
 */
function prizeFor(e: FloridaDrawEvent, fmt: ResultFormatVersion | undefined) {
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

function secondaryFor(e: FloridaDrawEvent): MemberResultInput["secondary"] {
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
 * LRG-STATE-031 §1 requires one History action per family. No internal per-game archive page exists in this
 * implementation, and `FD-S-30` forbids inventing a route — a link to `/fl/pick-3/2026` would be a dead
 * control, which `FD-S-08` also forbids. So History points at the OPERATOR'S OWN winning-number search,
 * which is a real, verified, authoritative archive. When an internal archive ships, this is the one line
 * that changes.
 */
/*
 * LRG-STATE-040 CONTENT OWNERSHIP RULE — `History` is a LOTTERYCORNER destination.
 *
 * This used to be `https://floridalottery.com/games/winning-numbers`, so every family card carried an outbound
 * link and eleven of them appeared on one page. The ownership rule is explicit that official sources are not
 * the reader's normal destination and that the only external Florida Lottery links belong in the one compact
 * official-resources group near the footer.
 *
 * So `History` now goes to this page's own history-and-tools section, which lists LotteryCorner's own
 * destinations first and then offers the operator's archive inside that permitted official group. The reader
 * reaches the same place if they want it, one hop later, and the internal page keeps the traffic.
 *
 * Our per-game archive routes (`/{state}/{game}/{year}`) are preserved patterns that are NOT implemented; the
 * history section states that honestly rather than substituting an external site, which is the precedent
 * LRG-STATE-039 §10 set.
 */
const HISTORY_HREF = "#state-tools";

/** Build every Florida family surface. */
export function buildFloridaFamilies(
  tz = "ET",
  events: readonly FloridaDrawEvent[] = FLORIDA_DRAW_EVENTS,
  todayIso = "2026-07-29",
): ResolvedFamily[] {
  const byId = new Map(events.map((e) => [e.gameId, e]));

  return FLORIDA_FAMILIES.filter((c) => !c.retired).map((base) => {
    const config = { ...base, historyHref: base.historyHref ?? HISTORY_HREF };
    const fmt = selectFormatVersion(FLORIDA_FORMAT_VERSIONS, config.formatGameKey, todayIso);

    const inputs: MemberResultInput[] = config.members
      .map((m) => byId.get(m.gameId))
      .filter((e): e is FloridaDrawEvent => Boolean(e))
      .map((e) => ({
        gameId: e.gameId,
        drawDateIso: e.resultDate,
        drawDateDisplay: displayDate(e.resultDate),
        groups: groupsFor(e, fmt),
        status: "verified" as const,
        /* LRG-STATE-036 §6. The feed's published multiplier, with the KIND from the governed format so the
           reader can tell a multiplier they must choose and pay for from one that is included. Dropped by the
           presentation layer until now, which is why the State page showed no multiplier while Home did. */
        multiplier: e.multiplier
          ? {
              label: e.multiplier.label,
              value: e.multiplier.value,
              kind: fmt?.multiplier?.kind ?? "unavailable",
            }
          : null,
        /* The feed carries only published results, so there is no open status to report. When a status feed
           exists this is where a pending/delayed/corrected state attaches — ALONGSIDE the verified result
           above, never replacing it. */
        currentStatus: null,
        /* The schedule column shows the member game's OWN published draw time, with the display timezone
           appended once. This is the verified schedule, not a computed "next draw": the feed is 20 days
           old, and calculating a next-draw date against a stale result set would mislead. */
        drawTimeLocal: e.drawTimeLocal ? `${e.drawTimeLocal.trim()} ${tz}` : null,
        drawDays: e.drawDays,
        /* No internal per-game archive route exists yet, so no link is emitted (FD-S-30). */
        historyHref: null,
        sourceName: "LotteryCorner production results feed",
        prizeSummary: prizeFor(e, fmt),
        secondary: secondaryFor(e),
      }));

    return resolveFamily(config, inputs);
  });
}
