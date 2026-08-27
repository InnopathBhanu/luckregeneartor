/*
 * THE MOCK BFF ADAPTER — FGP-009.
 *
 * Reads the committed preview payloads in `./mock/*.json` and returns them as `FlagshipGamePageData`.
 *
 * ══ WHY JSON RATHER THAN A GENERATOR IN CODE ══
 *
 * The payload IS the contract demonstration. A reviewer can open `mock/powerball.json` and see exactly what the
 * real endpoint has to return — every field, every shape, every `source` tag — without reading any TypeScript.
 * The files were produced once by a deterministic seeded generator (no clock, no `Math.random`), so regenerating
 * them from the same inputs yields byte-identical output and a diff is meaningful.
 *
 * ══ THE ONLY PLACE MOCK DATA ENTERS THE APPLICATION ══
 *
 * Components never import the JSON. They receive a typed model built from this adapter's output, and a test
 * asserts that no file under `components/` or `app/` imports anything from `bff/mock`. That is what keeps
 * hardcoded data out of the render tree, which the FGP-009 instruction requires explicitly.
 */

import type { FlagshipGameConfig } from "../flagshipGames";
import type { BffSource, FlagshipGamePageData } from "./flagshipBffContract";

/* `with { type: "json" }` is required by Node's ESM loader, which the test runner uses directly. Next's bundler
   accepts the attribute too, so one form works in both. */
import powerball from "./mock/powerball.json" with { type: "json" };
import megaMillions from "./mock/mega-millions.json" with { type: "json" };

/**
 * The raw JSON, keyed by slug.
 *
 * `as unknown as FlagshipGamePageData` is used deliberately and exactly once, here. TypeScript widens a JSON
 * import's string literals to `string`, so `source: "mock"` arrives as `string` and will not satisfy `BffSource`.
 * The alternative — loosening the contract to accept `string` — would remove the very type safety the contract
 * exists to provide. `assertPayloadShape` below re-establishes the guarantee at runtime instead, on every read,
 * so a malformed fixture fails loudly rather than rendering as a page with holes in it.
 */
const PAYLOADS: Record<string, unknown> = {
  powerball,
  "mega-millions": megaMillions,
};

const SOURCES: readonly BffSource[] = ["productionFeed", "mock"];

/**
 * Validate the fixture against the contract's load-bearing invariants.
 *
 * Not a schema validator — a check of the things that would produce a *misleading page* rather than a broken one:
 * a row with no `source`, a payload claiming to be real when it is not, or a preview payload with no disclosure.
 * Those are exactly the failures the type system cannot catch across a JSON boundary.
 */
export function assertPayloadShape(slug: string, data: FlagshipGamePageData): void {
  const fail = (why: string): never => {
    throw new Error(`flagshipBffMock: "${slug}" payload is unusable — ${why}`);
  };

  if (data.meta.gameSlug !== slug) fail(`meta.gameSlug is "${data.meta.gameSlug}"`);
  if (!SOURCES.includes(data.meta.source)) fail(`meta.source is "${data.meta.source}"`);
  if (data.meta.source !== "productionFeed" && !data.meta.disclosure) {
    fail("preview data carries no disclosure sentence, so a page could render it without one");
  }
  if (data.history.length === 0) fail("it carries no drawings");

  /* The newest drawing must be the REAL one. If a regeneration ever lost that, the page's most prominent fact
     would silently become generated, which is the single failure this whole arrangement exists to prevent. */
  if (data.history[0].source !== "productionFeed") {
    fail("the newest drawing is not the real published result");
  }
  /* Newest first, and every row tagged. */
  for (let i = 0; i < data.history.length; i++) {
    const row = data.history[i];
    if (!SOURCES.includes(row.source)) fail(`drawing ${row.drawDateIso} has source "${row.source}"`);
    if (i > 0 && row.drawDateIso >= data.history[i - 1].drawDateIso) {
      fail(`drawings are not newest-first at ${row.drawDateIso}`);
    }
  }
  for (const p of data.jackpotHistory) {
    if (!SOURCES.includes(p.source)) fail(`jackpot point ${p.drawDateIso} has source "${p.source}"`);
  }
  for (const items of [data.content.forum, data.content.blog, data.content.news]) {
    for (const item of items) {
      if (!SOURCES.includes(item.source)) fail(`content item ${item.id} has source "${item.source}"`);
    }
  }
}

/**
 * The preview payload for a game.
 *
 * Validated on every call rather than once at module load: the cost is trivial against a page render, and it
 * means a fixture edited by hand cannot reach a reader through a warm module cache.
 */
export function mockFlagshipGamePageData(config: FlagshipGameConfig): FlagshipGamePageData {
  const raw = PAYLOADS[config.gameSlug];
  if (!raw) {
    throw new Error(
      `flagshipBffMock: no preview payload for "${config.gameSlug}". Every registered flagship route needs one.`,
    );
  }
  const data = raw as FlagshipGamePageData;
  assertPayloadShape(config.gameSlug, data);
  return data;
}

/** Every game the mock adapter can answer for. Used by the contract test. */
export function mockedGameSlugs(): string[] {
  return Object.keys(PAYLOADS);
}
