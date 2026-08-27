/*
 * State page VISUAL BANDS — LRG-STATE-031 §10.
 *
 * WHAT THIS IS. A purely visual grouping of the governed PF-02 sections into four bands, so the lower page
 * reads as a few coherent regions instead of eighteen loose stacked slabs.
 *
 * WHAT THIS IS NOT — and this is the whole point of putting it in its own module with guards:
 *
 *   - It does NOT change the governed section order. The order still comes from `resolveOrder`; bands only
 *     draw a container around RUNS OF ADJACENT sections in that order.
 *   - It does NOT merge, rename, alias or reinterpret any section id. Every section keeps its own
 *     `data-section-id`, heading, fragment and semantics.
 *   - It does NOT change which sections render. A suppressed section stays suppressed; a band containing
 *     only suppressed sections draws nothing.
 *   - It does NOT move an ad anchor. Anchors are sequence positions and are banded wherever they already
 *     sit in the resolved order.
 *
 * The guard `assertBandsPreserveOrder` proves the first two claims mechanically: banding a resolved order
 * and then concatenating the bands back must reproduce that order exactly, element for element.
 *
 * WHY BANDS AT ALL. Founder review of V1 read the lower page as "fragmented". Each section was individually
 * correct and individually bordered, which at eighteen sections becomes visual noise with no hierarchy —
 * trust content ended up looking as important as results. A band gives the reader four things to
 * understand instead of eighteen, without touching what any section says.
 */

import type { StateSectionId } from "./sectionManifest";

export interface VisualBand {
  id: string;
  /** Shown as the band's own heading. Empty string renders no band heading (the results band). */
  title: string;
  /** One short line of orientation. Empty renders nothing. */
  intro: string;
  /**
   * Sections this band owns. Membership is declarative; adjacency in the resolved order is what actually
   * determines the drawn containers.
   */
  sections: readonly StateSectionId[];
  /** Two-column desktop treatment for compact informational bands. */
  desktopColumns: 1 | 2;
}

/**
 * The four provisional bands.
 *
 * PROVISIONAL. These groupings are this task's proposal for founder review, not an approved architecture.
 * `DS-37` stays open.
 *
 * The results band deliberately carries NO heading: a heading above the page's primary content competes
 * with the section headings inside it, and the first result must be the loudest thing on the page.
 */
export const STATE_VISUAL_BANDS: readonly VisualBand[] = [
  {
    id: "results",
    title: "",
    intro: "",
    sections: ["S-01", "AD-S00", "S-02", "S-03", "AD-S01", "S-04", "S-05"],
    desktopColumns: 1,
  },
  {
    id: "play-and-help",
    title: "Playing, buying and getting help",
    intro: "Game details, where to play, and what to do if you win.",
    sections: ["S-06", "AD-S02", "S-07", "S-08", "S-08A", "S-09"],
    desktopColumns: 2,
  },
  /*
   * LRG-STATE-042 — THE FIVE APPROVED LOWER-PAGE BANDS.
   *
   * These replace `updates-and-discovery` ("Updates, history and community") and `trust-and-navigation`
   * ("Sources and methodology"), both of which founder review rejected. Each approved band is wrapped by the
   * governed section that already owns its anchor and, where applicable, its advertisement host — so no ad
   * moves and no anchor breaks.
   *
   * THE PF-02 RECONCILIATION, stated plainly. The approved visible order is Explore, Latest, Guides,
   * Community, Resources. The manifest orders S-14 (community, 19) before S-15 (news/guides, 20), which would
   * put community before news. The founder ruling authorises the visual composition, so `LOWER_PAGE_SEQUENCE`
   * below fixes the reading order while every section keeps its governed id, anchor and ad host. Nothing in the
   * frozen blueprint changed; the reconciliation is recorded in the implementation record.
   *
   * Section to band:
   *   S-10  -> Explore Florida Lottery       (anchor `state-tools`, hosts AD-S03)
   *   S-15  -> Latest from Florida + Guides  (anchor `news`)
   *   S-14  -> Florida community             (anchor `community`)
   *   S-18  -> Resources and player support  (immediately above the footer, hosts AD-S04)
   *
   * S-09, S-16 and S-17 no longer render: the Recent-changes block, the "Come back to Florida" essay and the
   * old Sources-and-methodology section are the rejected content. S-17's trust and independence sentences
   * survive as the Resources band's copy. S-11 to S-13 stay suppressed on their own evidence grounds.
   */
  {
    id: "explore",
    title: "",
    intro: "",
    sections: ["S-10", "AD-S03", "S-11", "S-12", "S-13"],
    desktopColumns: 1,
  },
  {
    id: "editorial",
    title: "",
    intro: "",
    sections: ["S-15"],
    desktopColumns: 1,
  },
  {
    id: "community",
    title: "",
    intro: "",
    sections: ["S-14", "S-16", "S-17"],
    desktopColumns: 1,
  },
  {
    id: "resources",
    title: "",
    intro: "",
    sections: ["S-18", "AD-S04"],
    desktopColumns: 1,
  },
];

/** The band that owns a section, or `undefined` for anything unbanded (e.g. `Footer`). */
export function bandFor(id: StateSectionId): VisualBand | undefined {
  return STATE_VISUAL_BANDS.find((b) => b.sections.includes(id));
}

export interface BandedRun {
  band: VisualBand | undefined;
  ids: StateSectionId[];
}

/**
 * Partition a resolved order into consecutive runs, each belonging to one band.
 *
 * A RUN, not a bucket. If the governed order ever interleaved sections from two bands, this would emit
 * several runs for the same band rather than silently reordering them into one. That is the behaviour that
 * makes banding safe: the order wins, always, and a surprising order shows up as extra containers instead
 * of as moved content.
 */
/**
 * The approved lower-page reading order — LRG-STATE-042, the founder's lower-page visual ruling.
 *
 * The manifest orders S-14 (community) before S-15 (news and guides). The approved composition is Explore,
 * Latest, Guides, Community, Resources, so the two swap places in the READING order while each keeps its own
 * governed id, anchor and advertisement host. This is the one place that decision lives.
 *
 * Applied as a stable pairwise swap rather than a hardcoded sequence, so a suppressed section, a promoted
 * correction or any future adaptive reorder still flows through `resolveOrder` untouched.
 */
export function approvedLowerOrder(order: readonly StateSectionId[]): StateSectionId[] {
  const out = [...order];
  const i14 = out.indexOf("S-14");
  const i15 = out.indexOf("S-15");
  if (i14 >= 0 && i15 >= 0 && i14 < i15) {
    out[i14] = "S-15";
    out[i15] = "S-14";
  }
  return out;
}

export function bandRuns(rawOrder: readonly StateSectionId[]): BandedRun[] {
  const order = approvedLowerOrder(rawOrder);
  const runs: BandedRun[] = [];
  for (const id of order) {
    const band = bandFor(id);
    const last = runs[runs.length - 1];
    if (last && last.band === band) last.ids.push(id);
    else runs.push({ band, ids: [id] });
  }
  return runs;
}

/** Band membership must be a partition: no section in two bands, none listed twice. */
export function assertBandMembershipUnique(): void {
  const seen = new Map<string, string>();
  for (const b of STATE_VISUAL_BANDS) {
    for (const id of b.sections) {
      const prior = seen.get(id);
      if (prior) {
        throw new Error(
          `State visual bands: section ${id} is claimed by both "${prior}" and "${b.id}". ` +
            `A section belongs to exactly one visual band.`,
        );
      }
      seen.set(id, b.id);
    }
  }
}

/**
 * Every governed section must belong to a band.
 *
 * A gap is not cosmetic. An unbanded section between two sections of the same band splits that band into
 * two runs, which renders the band's heading twice and — because the heading id is derived from the band id
 * — produces a DUPLICATE DOM ID. That is exactly what happened before S-11/S-12/S-13 were banded.
 *
 * `Footer` is exempt: the global footer comes from the app layout, not from a band.
 */
export function assertEverySectionBanded(order: readonly StateSectionId[]): void {
  const unbanded = order.filter((id) => id !== "Footer" && !bandFor(id));
  if (unbanded.length > 0) {
    throw new Error(
      `State visual bands: no band owns ${unbanded.join(", ")}. An unbanded section splits its ` +
        `neighbours' band into two containers and duplicates the band heading id.`,
    );
  }
}

/**
 * Banding must be order-preserving and lossless.
 *
 * Concatenating the runs must reproduce the input order exactly. This is the mechanical proof that a
 * visual grouping cannot become a reordering — the failure mode that would turn a styling change into a
 * governance breach.
 */
export function assertBandsPreserveOrder(order: readonly StateSectionId[]): void {
  /* Compared against the APPROVED order, not the raw one: LRG-STATE-042's founder-authorised lower-page swap
     is applied by `bandRuns`, and this assertion exists to catch banding moving anything ELSE. */
  const expected = approvedLowerOrder(order);
  const flat = bandRuns(order).flatMap((r) => r.ids);
  if (flat.length !== order.length || flat.some((id, i) => id !== expected[i])) {
    throw new Error(
      `State visual bands: banding changed the section order.\n` +
        `  governed: ${order.join(",")}\n` +
        `  banded:   ${flat.join(",")}`,
    );
  }
}
