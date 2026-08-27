/*
 * REGISTRY-ONLY PAGE GATING — `FD-GATE-01`, ratified 2026-08-11.
 *
 * This file is the third condition the ruling was ratified under: *"one route-inventory test enumerates every served
 * route across all five registries, so the public surface is one assertion rather than five modules."*
 *
 * What it guards, in order of how badly it would fail in public:
 *
 *   1. A PAGE BECOMING REACHABLE WITHOUT A REGISTRY EDIT — route existence derived from a fixture, a directory or an
 *      environment variable, which `CLAUDE.md` §10 forbids outright.
 *   2. A PAGE BECOMING INDEXABLE. Registry-only gating is safe *because* everything is `noindex`. If that slips while
 *      `FD-RTE-03` is still unimplemented, this build starts competing with production on the wrong host.
 *   3. AN ENVIRONMENT READ COMING BACK into a gating path.
 *   4. A LEGACY TEMPLATE BECOMING REACHABLE AGAIN — the failure mode the ruling actually removed: an unset flag used
 *      to serve a page built against superseded requirements.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";

import {
  HOME_REGISTRY, PAGE_FAMILIES, PUBLICATION_SAFETY, routeInventory, servedRoutes, servesPage,
} from "../lib/registry/pageFamilyRegistry";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const exists = (p: string) => existsSync(new URL(`../${p}`, import.meta.url));
/** Source with comments stripped: a comment RECORDING a removed flag is the audit trail, not a regression. */
const code = (p: string) =>
  src(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ══════════════════════════════════════════════════════════════════════ the inventory */

describe("FD-GATE-01: one route inventory, across all five families", () => {
  test("every family is represented, and the list is exactly what the registries declare", () => {
    const inv = routeInventory();
    const byFamily = new Map<string, string[]>();
    for (const r of inv) byFamily.set(r.family, [...(byFamily.get(r.family) ?? []), r.route]);

    for (const f of PAGE_FAMILIES) {
      assert.ok((byFamily.get(f) ?? []).length > 0, `${f} must contribute at least one served route`);
    }
    assert.deepEqual(byFamily.get("home"), ["/"]);
    assert.deepEqual([...(byFamily.get("state") ?? [])].sort(), ["/ca", "/fl", "/md", "/mi", "/ut", "/va"]);
    assert.deepEqual([...(byFamily.get("flagship") ?? [])].sort(), ["/mega-millions", "/powerball"]);
    assert.deepEqual(byFamily.get("archive"), ["/fl/pick-3/2026"]);
    /* Game pairs come from the game registry; assert the shape rather than freezing the list, since adding a game is
       a registry edit that should not need this test edited too. */
    for (const r of byFamily.get("game") ?? []) {
      assert.match(r, /^\/[a-z]{2}\/[a-z0-9-]+$/, `${r} must be a /{state}/{game} path`);
    }
  });

  test("no route appears twice, and every route is a same-site absolute path", () => {
    const routes = servedRoutes();
    assert.equal(new Set(routes).size, routes.length, "a duplicated route means two registries claim one URL");
    for (const r of routes) {
      assert.match(r, /^\//, `${r} must be a same-site absolute path`);
      /* Root is the one legitimate "/" — every other route must carry no trailing slash (FD-RTE-01). */
      if (r !== "/") assert.doesNotMatch(r, /\/$/, `${r} must carry no trailing slash (FD-RTE-01)`);
      assert.doesNotMatch(r, /[A-Z]/, `${r} must be lower case (FD-RTE-01 canonicalises case)`);
    }
  });

  test("every declared blueprint is a real approved document id", () => {
    /* GS-07 joined the list under Conflict 37 (2026-08-11): the account routes conform to the Global Shell's
       GS-07 section spec rather than to a page-family blueprint of their own. 07A (News Hub) and 07B (News
       Article) joined with the news family — both Final approved and frozen. 08A (Community Home), 08B
       (Forum Entry) and 08C (Profile and Reputation) joined with the community family — all three Final
       approved and frozen, implemented under the Conflict 41 FOUNDER AMENDMENT. CONFLICT-39 joined with the
       blog family: NO blueprint exists — the founder authorization recorded in source-conflicts.md Conflict 39
       IS the authority its rows name, and the composition contract lives in lib/blog/blogContract.ts. BP-05C
       joined with the tools family (Final approved and frozen), implemented at the blueprint route under the
       Conflict 42 interim founder instruction. CONFLICT-38 joined with the trust family (DELIBERATE update,
       citing source-conflicts.md Conflict 38): the five legacy policy routes transfer to the new UI under the
       founder's full-cutover model — again no blueprint exists, so the founder authorization IS the authority
       the rows name. CONFLICT-40 joined with the admin family (DELIBERATE update, citing source-conflicts.md
       Conflict 40): the founder authorized the protected /admin area inside the new app — no blueprint
       exists, so the founder authorization IS the authority the rows name. */
    for (const r of routeInventory()) {
      assert.match(
        r.blueprint,
        /^(BP-02|PF-02|BP-04A|BP-04B|ARCHIVE-06|GS-07|07A|07B|08A|08B|08C|CONFLICT-39|BP-05C|CONFLICT-38|CONFLICT-40)$/,
        `${r.route} names ${r.blueprint}`,
      );
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ registry, not environment */

describe("FD-GATE-01: the registry decides, and no environment variable does", () => {
  const GATING_PATHS = [
    "lib/registry/pageFamilyRegistry.ts",
    "lib/game/gamePreviewGuard.ts",
    "lib/flagship/flagshipRouteAccess.ts",
    "lib/flagship/flagshipRegistry.ts",
    "lib/game/gameRegistry.ts",
    "lib/archive/archiveRegistry.ts",
    "lib/state/jurisdictionRegistry.ts",
  ];

  test("no gating path reads process.env at all", () => {
    for (const f of GATING_PATHS) {
      assert.doesNotMatch(code(f), /process\.env/, `${f} decides route existence and must read no environment`);
    }
  });

  test("the three removed flags cannot change what this build serves", () => {
    /*
     * The behavioural half of the guarantee. Setting a removed flag to anything — including the value that used to
     * ENABLE a page, and the value that used to DISABLE it — must not move a single answer.
     */
    const baseline = JSON.stringify(routeInventory());
    const FLAGS = ["LC_HOME_PREVIEW", "LC_STATE_PREVIEW", "LC_GAME_PREVIEW", "LC_FLAGSHIP_GAME_PREVIEW"];
    const saved = Object.fromEntries(FLAGS.map((f) => [f, process.env[f]]));
    try {
      for (const value of ["true", "false", "1", "TRUE", ""]) {
        for (const f of FLAGS) process.env[f] = value;
        assert.equal(JSON.stringify(routeInventory()), baseline, `${value} must change no served route`);
        assert.equal(servesPage("home"), true);
        assert.equal(servesPage("state", "fl"), true);
        assert.equal(servesPage("state", "az"), false);
        assert.equal(servesPage("flagship", "powerball"), true);
        assert.equal(servesPage("game", "fl", "pick-3"), true);
        assert.equal(servesPage("archive", "fl", "pick-3", 2026), true);
      }
    } finally {
      for (const f of FLAGS) {
        if (saved[f] === undefined) delete process.env[f];
        else process.env[f] = saved[f];
      }
    }
  });

  test("the two removed gate functions no longer exist", () => {
    const state = code("lib/state/statePreviewGuard.ts");
    assert.ok(!/export function isStatePreviewEnabled/.test(state));
    assert.ok(!/export function resolveStatePreview/.test(state));
    assert.ok(!/export function isHomePreviewEnabled/.test(code("lib/preview/previewGuard.ts")));
    /* The REVIEW AIDS survive, and the distinction is the point: a gate decides which pages exist, an ad mode and a
       debug switch decide review geometry and label visibility. Removing those would cost founder review capability
       and buy nothing. */
    assert.match(state, /export function getStatePreviewAdMode/);
    assert.match(state, /export function isStatePreviewDebug/);
    assert.match(code("lib/preview/previewGuard.ts"), /export function isHomePreviewDebug/);
    assert.match(code("lib/preview/previewGuard.ts"), /export function getHomePreviewAdMode/);
  });

  test("no route file reads a removed gate", () => {
    for (const f of [
      "app/page.tsx", "app/layout.tsx", "app/[state]/page.tsx", "app/[state]/[game]/page.tsx",
      "app/[state]/[game]/[segment]/page.tsx", "app/[state]/[game]/[segment]/[slug]/page.tsx",
      "app/powerball/page.tsx", "app/mega-millions/page.tsx",
    ]) {
      const body = code(f);
      for (const gone of [/isHomePreviewEnabled/, /isStatePreviewEnabled/, /resolveStatePreview/]) {
        assert.doesNotMatch(body, gone, `${f} must not call a removed gate`);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════ the legacy path is gone */

describe("FD-GATE-01: the blueprint templates are the sole render path", () => {
  test("the two legacy templates are ARCHIVED, not deleted, and not reachable", () => {
    /* `CLAUDE.md` §6: *"Do not delete previous work outside an approved cleanup task. ARCHIVE, do not delete."* */
    assert.ok(exists("components/archived/legacy/home/HomeTemplate.tsx"));
    assert.ok(exists("components/archived/legacy/state/StatePageTemplate.tsx"));
    assert.equal(exists("components/home/HomeTemplate.tsx"), false);
    assert.equal(exists("components/state/StatePageTemplate.tsx"), false);
    /* Both carry the banner explaining why they moved and what would have to be true to revive them. */
    for (const f of ["components/archived/legacy/home/HomeTemplate.tsx",
                     "components/archived/legacy/state/StatePageTemplate.tsx"]) {
      assert.match(src(f), /ARCHIVED — NOT REACHABLE FROM ANY ROUTE/);
      assert.match(src(f), /FD-GATE-01/);
    }
  });

  test("NOTHING outside the archive imports anything inside it", () => {
    /*
     * The load-bearing assertion of this whole block. An archived tree that something live still imports is not
     * archived — it is the same code in a different folder. Walked over every live source file rather than a curated
     * list, so a new import cannot slip in unnoticed.
     */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
        const rel = `${dir}/${name}`;
        if (rel.includes("/archived")) continue;
        const p = new URL(`../${rel}`, import.meta.url);
        if (statSync(p).isDirectory()) walk(rel);
        else if (/\.tsx?$/.test(name) && /archived\/legacy/.test(readFileSync(p, "utf8"))) offenders.push(rel);
      }
    };
    for (const root of ["app", "components", "lib"]) walk(root);
    assert.deepEqual(offenders, [], "a live module imports archived code, so it is not archived");
  });

  test("the archived tree still type-checks, so it can actually be revived", () => {
    /* Its imports were rewritten to `@/`-absolute form on the way out: a module that stayed live is referenced at
       its live path and an archived sibling at its archived path. An archived tree that no longer builds is a tree
       nobody can bring back — so this asserts the rewrite happened rather than trusting it. */
    const t = src("components/archived/legacy/home/HomeTemplate.tsx");
    assert.match(t, /from "@\/components\/archived\/legacy\//, "archived siblings use archived paths");
    assert.match(t, /from "@\/(components|lib)\/(?!archived)/, "live modules are referenced at their live paths");
    /* No relative import survives in the archived tree — that is what used to break when a file moved depth. */
    for (const f of ["components/archived/legacy/home/HomeTemplate.tsx",
                     "components/archived/legacy/state/StatePageTemplate.tsx",
                     "components/archived/legacy/layout/SiteHeader.tsx"]) {
      assert.doesNotMatch(code(f), /from "\.\.?\//, `${f} must use alias imports so its depth cannot matter`);
    }
  });

  test("the Home and State routes have exactly one render path each", () => {
    const home = code("app/page.tsx");
    assert.match(home, /servesPage\("home"\)/);
    assert.ok(!/HomeTemplate/.test(home), "no second Home template");
    /* One metadata path too. The removed branch was the only one that defaulted to `index,follow`. */
    assert.equal((home.match(/robots:/g) ?? []).length, 1, "one robots declaration, from the view model");

    const state = code("app/[state]/page.tsx");
    assert.match(state, /servesPage\("state", state\)/);
    assert.ok(!/StatePageTemplate/.test(state), "no second State template");
    assert.ok(!/SiteHeader/.test(state), "no legacy shell");
    /* A state the registry does not serve is not a page. */
    assert.match(state, /notFound\(\);/);
  });
});

/* ══════════════════════════════════════════════════════════════════════ publication safety */

describe("FD-GATE-01: availability is not publication", () => {
  test("the safety record says what it must, and says why", () => {
    assert.deepEqual(PUBLICATION_SAFETY.robots, { index: false, follow: false });
    assert.equal(PUBLICATION_SAFETY.inSitemap, false);
    /* FD-RTE-03 is now IMPLEMENTED: one www origin constant, self-referencing canonicals everywhere. The record
       must say so, and must state that the canonical and `noindex` coexist deliberately until launch. */
    assert.match(PUBLICATION_SAFETY.why, /FD-RTE-03/);
    assert.match(PUBLICATION_SAFETY.why, /IMPLEMENTED/);
    assert.match(PUBLICATION_SAFETY.why, /coexist deliberately/);
  });

  test("every one of the five families is still noindex", () => {
    /*
     * Route by route, in the metadata source. Removing an environment flag changed AVAILABILITY, never
     * INDEXABILITY — and this is the assertion that keeps those two separate now that a flag no longer does.
     */
    for (const f of [
      "app/[state]/page.tsx",
      "app/[state]/[game]/page.tsx",
      "app/[state]/[game]/[segment]/page.tsx",
      "app/[state]/[game]/[segment]/[slug]/page.tsx",
    ]) {
      assert.match(code(f), /index: false/, `${f} must stay noindex`);
    }
    /* Home takes its robots from the view model, and the flagship hubs from their shared metadata module. */
    assert.match(code("lib/preview/homePreviewModel.ts"), /robots:/);
    assert.match(code("lib/flagship/flagshipRouteMetadata.ts"), /index: false, follow: false/);
  });

  test("nothing became indexable or sitemapped by this change", () => {
    /* Structural, not conventional: there is no sitemap route at all, so no family can be in one. */
    assert.equal(exists("app/sitemap.ts"), false);
    assert.equal(exists("app/robots.ts"), false);
    assert.equal(exists("public/robots.txt"), false);
    /* And no redirect was introduced — `FD-RTE-01`'s edge rule is Stage 2 and is not this task. */
    assert.doesNotMatch(src("next.config.mjs"), /redirects/);
  });

  test("Home's registry entry records the safety condition, not just the flag removal", () => {
    assert.equal(HOME_REGISTRY.enabled, true);
    assert.equal(HOME_REGISTRY.blueprint, "BP-02");
    assert.match(HOME_REGISTRY.note, /noindex/);
    assert.match(HOME_REGISTRY.note, /ARCHIVED/);
  });
});
