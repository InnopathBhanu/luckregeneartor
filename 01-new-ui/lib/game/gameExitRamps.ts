/*
 * THE GAME PAGE'S EXIT RAMPS — §B4.
 *
 * Authority: research persona findings (Aug 11); `CLAUDE.md` §10 (*"MUST NEVER derive route existence from a
 * fixture filename or a directory listing"*, *"MUST NEVER invent a route because a blueprint needs a page
 * family"*), §11 (game pages link to related state pages, archives, tools and responsible play), §9 (no
 * non-functional control presented as functional).
 *
 * ══ EVERY RAMP IS PROVED BEFORE IT IS OFFERED ══
 *
 * Two kinds of destination, and each is verified in the only way that is honest for its kind:
 *
 *   AN IN-PAGE FRAGMENT is offered only when the section that owns it is in `visibleSections`. That is the whole
 *   point of resolving ramps from the MODEL rather than from a static list: the Game Page suppresses sections
 *   whose data is unverified, and a chip pointing at `#jg-06` on a page where JG-06 did not render is a link to
 *   nothing. Checking the resolved model makes that unexpressible.
 *
 *   A ROUTE is offered only when the explicit registry serves it. The archive ramp reads `archiveYearsFor`, so it
 *   appears for `/fl/pick-3` (2026 is registered) and not for a pair with no registered archive year — and the
 *   answer changes by a registry edit, never because a fixture gained a row.
 *
 * A ramp with no proved destination is `null`, and `ResultExitRamps` renders nothing for it. There is no disabled
 * chip and no `#` placeholder.
 *
 * ══ WHY THE TWO BLUEPRINT MODES SHARE ONE RESOLVER ══
 *
 * `JG-M1` numbers its sections `JO-*` and `JG-M2` numbers them `JG-*`, and the two modes put the same JOB in
 * differently-numbered sections. The reader's question is identical on both pages, so the mapping from job to
 * section id is data here — one table per mode — and the resolver is shared. That is also what stops the two modes
 * drifting into two different answers for "where are the odds?".
 */

import { archiveYearsFor } from "../archive/archiveRegistry";
import type { ExitRamp } from "@/components/shell/ResultExitRamps";
import type { GameSectionId } from "./gamePreviewModel";

/**
 * Which section owns each reader job, per BP-04B mode.
 *
 * `prizes` and `rules` are separate jobs even where one section serves both: a reader asking "what would I have
 * won?" and one asking "how does this game work?" are not the same reader, and pointing both at one fragment is
 * fine — pointing at a section that does not exist is not.
 */
const OWNER: Readonly<Record<"JG-M1" | "JG-M2" | "JG-M3", { prizes: GameSectionId; rules: GameSectionId }>> =
  Object.freeze({
    /* JG-M1 (minimal local page): JO-03 carries the local features and the game's shape. */
    "JG-M1": { prizes: "JO-03", rules: "JO-03" },
    /* JG-M2 (state-native): JG-06 is "how the game works", which carries the prize table and the rules. */
    "JG-M2": { prizes: "JG-06", rules: "JG-06" },
    "JG-M3": { prizes: "JG-06", rules: "JG-06" },
  });

/** `JG-06` → `#jg-06`. One transform, so a fragment and its section id cannot drift. */
function fragmentOf(id: GameSectionId): string {
  return `#${id.toLowerCase()}`;
}

export function gameExitRamps(input: {
  mode: "JG-M1" | "JG-M2" | "JG-M3";
  stateCode: string;
  stateName: string;
  gameSlug: string;
  gameLabel: string;
  /** The sections this render actually produced. A fragment for anything absent is not offered. */
  visibleSections: readonly GameSectionId[];
  /** The state hub destination, from the game's own governed configuration. */
  stateHubHref: string | null;
}): ExitRamp[] {
  const visible = new Set(input.visibleSections);
  const owner = OWNER[input.mode];

  /* The newest REGISTERED archive year. Never `new Date().getFullYear()`: an arithmetic year is exactly the dead
     link `archiveRegistry` exists to prevent, and production's own out-of-range redirect is the symptom. */
  const years = archiveYearsFor(input.stateCode, input.gameSlug);
  const newestYear = years.length > 0 ? years[years.length - 1] : null;

  return [
    {
      key: "prizes",
      label: "Prizes and odds",
      href: visible.has(owner.prizes) ? fragmentOf(owner.prizes) : null,
    },
    {
      key: "history",
      label: newestYear ? `Past results (${newestYear})` : "Past results",
      href: newestYear ? `/${input.stateCode}/${input.gameSlug}/${newestYear}` : null,
    },
    {
      key: "rules",
      label: `How ${input.gameLabel} works`,
      href: visible.has(owner.rules) ? fragmentOf(owner.rules) : null,
    },
    {
      key: "stateHub",
      label: `All ${input.stateName} results`,
      href: input.stateHubHref,
    },
  ];
}
