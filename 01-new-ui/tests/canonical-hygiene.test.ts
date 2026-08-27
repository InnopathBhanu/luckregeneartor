/*
 * FD-RTE STAGE 1 — CANONICAL HYGIENE. ROUTE-AUDIT-001 §10 Stage 1, executing the ratified rulings
 * `FD-RTE-01` (canonical tag half only), `FD-RTE-02`, `FD-RTE-03` and `FD-RTE-04` (IN FORCE 2026-08-11).
 *
 * What Stage 1 is, and is not. It is "no route change; do first": one `www` no-trailing-slash origin
 * constant, a self-referencing canonical on every routable page family, and robots host hygiene. It is NOT
 * the edge redirect (Stage 2), NOT a sitemap (Stage 3), and NOT a consolidation (Stages 4–5). The robots.txt
 * host mismatch and the ~1,300 missing archive years named by Stage 1 live in PRODUCTION — this repository
 * ships no robots.txt and no sitemap — so this file asserts the repo-side truth: those files still do not
 * exist here, and nothing in this stage invented them.
 *
 * Why canonicals and `noindex` coexist. Every guarded page family stays `noindex, nofollow` until its launch
 * task. The canonical is emitted anyway, deliberately: while `noindex` stands the tag reaches no crawler, and
 * at cutover only the robots posture changes — the canonical architecture is already correct.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

import { PRODUCTION_ORIGIN, WEBSITE_ID, ORGANIZATION_ID, canonicalUrl } from "../lib/seo/productionOrigin";
import { SITE_URL } from "../lib/seo/siteSchema";
import { stateViewConfigFor, configuredStateCodes } from "../lib/state/stateViewConfigRegistry";
import { gameConfigFor, configuredGamePairs } from "../lib/game/gameConfigRegistry";
import { flagshipMetadata } from "../lib/flagship/flagshipRouteMetadata";
import { buildHomePreview } from "../lib/preview/homePreviewModel";
import { PUBLICATION_SAFETY } from "../lib/registry/pageFamilyRegistry";
import { SITEMAP_EXCLUDED_PREFIXES } from "../lib/seo/sitemapEntries";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");
const exists = (p: string) => existsSync(join(ROOT, p));

/** Every .ts/.tsx source file under the given top-level directories. */
function sourceFiles(dirs: string[]): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === "node_modules" || name === ".next") continue;
        walk(full);
      } else if (/\.tsx?$/.test(name)) {
        out.push(relative(ROOT, full));
      }
    }
  };
  for (const d of dirs) if (existsSync(join(ROOT, d))) walk(join(ROOT, d));
  return out;
}

/* ══════════════════════════════════════════ FD-RTE-02/03: one www origin constant ══ */

describe("FD-RTE-02/03: one origin constant, and it is the ratified www form", () => {
  test("the constant is www with no trailing slash, and SITE_URL is the same value, not a second definition", () => {
    assert.equal(PRODUCTION_ORIGIN, "https://www.lotterycorner.com");
    assert.ok(!PRODUCTION_ORIGIN.endsWith("/"), "no trailing slash on the origin, ever");
    assert.equal(SITE_URL, PRODUCTION_ORIGIN);
    /* The schema node ids derive from the same constant. */
    assert.equal(WEBSITE_ID, "https://www.lotterycorner.com/#website");
    assert.equal(ORGANIZATION_ID, "https://www.lotterycorner.com/#organization");
  });

  test("the non-www origin form survives nowhere in lib/, app/ or components/", () => {
    /* `https://lotterycorner.com` (no `www.`) — the form FD-RTE-02 reversed. The regex cannot match the
       ratified `https://www.lotterycorner.com`, so this is a true sweep for the dead host, comments included:
       a comment carrying the old origin is how it gets pasted back into code. */
    const nonWww = /https:\/\/lotterycorner\.com/;
    for (const f of sourceFiles(["lib", "app", "components"])) {
      assert.ok(!nonWww.test(src(f)), `${f} must not carry the non-www origin form`);
    }
  });

  test("the origin literal is DEFINED exactly once — in productionOrigin.ts", () => {
    const literal = "https://www.lotterycorner.com";
    for (const f of sourceFiles(["lib", "app", "components"])) {
      if (f === join("lib", "seo", "productionOrigin.ts")) continue;
      assert.ok(!src(f).includes(literal),
        `${f} must import the origin from productionOrigin.ts, never restate the literal`);
    }
    assert.ok(src("lib/seo/productionOrigin.ts").includes(`"${literal}"`));
  });
});

/* ══════════════════════════════════ FD-RTE-01 (tag half): canonical form of the URL ══ */

describe("FD-RTE-01: canonicalUrl emits the canonical host, slash and case form", () => {
  test("host is www, path keeps no trailing slash, and case is lowered", () => {
    assert.equal(canonicalUrl("/fl"), "https://www.lotterycorner.com/fl");
    assert.equal(canonicalUrl("/fl/"), "https://www.lotterycorner.com/fl");
    assert.equal(canonicalUrl("/fl/pick-3/2026/"), "https://www.lotterycorner.com/fl/pick-3/2026");
    /* FD-RTE-01 rule 4: upper/mixed-case → lower-case. Production itself emits upper-case state codes
       (`302 → /FL/pick-3-evening/2026`), so the canonical must never repeat the variant form. */
    assert.equal(canonicalUrl("/FL/PICK-3/2026"), "https://www.lotterycorner.com/fl/pick-3/2026");
    /* The root is the one path that keeps its slash — it matches the sitemap's single `/` entry. */
    assert.equal(canonicalUrl("/"), "https://www.lotterycorner.com/");
  });

  test("a relative path or a fragment is refused, never repaired into a canonical", () => {
    assert.throws(() => canonicalUrl("fl"), /must begin with "\/"/);
    assert.throws(() => canonicalUrl("/fl#results"), /must not contain a fragment/);
  });
});

/* ══════════════════ FD-RTE-02/04: a self-referencing canonical on every page family ══ */

describe("FD-RTE Stage 1: every routable page family emits exactly one self-referencing canonical", () => {
  /* Route metadata that runs through React components is asserted on source; pure modules are executed. */

  test("Home emits its canonical, from the shared constant", () => {
    const home = src("app/page.tsx");
    assert.match(home, /alternates: \{ canonical: canonicalUrl\("\/"\) \}/);
    assert.equal((home.match(/alternates:/g) ?? []).length, 1, "exactly one canonical declaration");
    /* And the deliberate canonical/noindex coexistence is stated where they meet. */
    assert.match(home, /COEXIST DELIBERATELY/);
  });

  test("every configured State hub self-canonicalises on the www origin", () => {
    for (const code of configuredStateCodes()) {
      const cfg = stateViewConfigFor(code)!;
      assert.equal(canonicalUrl(cfg.seo.canonicalPath), `https://www.lotterycorner.com/${code}`);
    }
    const route = src("app/[state]/page.tsx");
    assert.match(route, /alternates: \{ canonical \}/);
    assert.equal((route.match(/alternates:/g) ?? []).length, 1);
  });

  test("every configured Game page self-canonicalises on the www origin", () => {
    for (const pair of configuredGamePairs()) {
      const [state, game] = pair.split("/");
      const cfg = gameConfigFor(state, game)!;
      assert.equal(canonicalUrl(cfg.seo.canonicalPath), `https://www.lotterycorner.com/${state}/${game}`);
    }
    const route = src("app/[state]/[game]/page.tsx");
    assert.match(route, /alternates: \{ canonical \}/);
    assert.equal((route.match(/alternates:/g) ?? []).length, 1);
  });

  test("the Archive route self-canonicalises through canonicalUrl", () => {
    const route = src("app/[state]/[game]/[segment]/page.tsx");
    assert.match(route, /alternates: \{ canonical: canonicalUrl\(`\/\$\{state\}\/\$\{game\}\/\$\{parsed\}`\) \}/);
    assert.equal((route.match(/alternates:/g) ?? []).length, 1);
  });

  test("the game article route self-canonicalises through canonicalUrl", () => {
    const route = src("app/[state]/[game]/[segment]/[slug]/page.tsx");
    assert.match(route, /alternates: \{ canonical \}/);
    assert.equal((route.match(/alternates:/g) ?? []).length, 1);
  });

  test("both flagship hubs self-canonicalise on the www origin", () => {
    assert.equal(flagshipMetadata("powerball").alternates?.canonical, "https://www.lotterycorner.com/powerball");
    assert.equal(flagshipMetadata("mega-millions").alternates?.canonical,
      "https://www.lotterycorner.com/mega-millions");
  });

  test("the three transparency pages canonicalise through the shared template, one tag each", () => {
    const tpl = src("components/layout/InformationPage.tsx");
    assert.match(tpl, /const canonical = `\$\{PRODUCTION_ORIGIN\}\$\{path\}`/);
    assert.match(tpl, /alternates: \{ canonical \}/);
    for (const page of ["app/ai-policy/page.tsx", "app/corrections-policy/page.tsx",
                        "app/affiliate-disclosure/page.tsx"]) {
      assert.match(src(page), /informationPageMetadata\(\{/, `${page} uses the shared metadata`);
      assert.ok(!src(page).includes("alternates:"), `${page} declares no second canonical of its own`);
    }
  });

  test("the root layout claims no canonical, so no page can ever carry two", () => {
    assert.ok(!src("app/layout.tsx").includes("alternates"),
      "a layout-level canonical would duplicate onto every page");
  });
});

/* ═══════════════════════════ guarded routes keep noindex; canonical+noindex coexist ══ */

describe("FD-RTE Stage 1 changes canonicals, never indexability", () => {
  test("every guarded route metadata source still declares noindex", () => {
    for (const f of [
      "app/[state]/page.tsx",
      "app/[state]/[game]/page.tsx",
      "app/[state]/[game]/[segment]/page.tsx",
      "app/[state]/[game]/[segment]/[slug]/page.tsx",
      "lib/flagship/flagshipRouteMetadata.ts",
    ]) {
      assert.match(src(f), /robots: \{ index: false, follow: false \}/, `${f} must stay noindex`);
    }
    /* Home takes robots from its view model; the value is still the guarded one. */
    assert.equal(buildHomePreview().page.robots, "noindex, nofollow");
    /* And the publication-safety record still pins the posture. */
    assert.deepEqual(PUBLICATION_SAFETY.robots, { index: false, follow: false });
    assert.equal(PUBLICATION_SAFETY.inSitemap, false);
  });

  test("flagship metadata carries noindex alongside its canonical", () => {
    const pb = flagshipMetadata("powerball");
    assert.deepEqual(pb.robots, { index: false, follow: false });
    assert.ok(pb.alternates?.canonical, "canonical and noindex coexist deliberately pre-launch");
  });
});

/* ═══════════════════════════════ FD-RTE-06 and the Stage 1 robots/sitemap boundary ══ */

describe("FD-RTE-06: /buynow stays robots-disallowed and canonical-free", () => {
  test("the resolver route emits noindex and never a canonical", () => {
    const route = src("app/buynow/[code]/route.ts");
    assert.match(route, /"X-Robots-Tag": "noindex, nofollow"/);
    assert.ok(!route.includes("canonical"), "a redirect resolver is never a canonical URL");
    assert.ok(!route.includes("alternates"));
  });

  test("/buynow is structurally excluded from any future sitemap", () => {
    assert.ok((SITEMAP_EXCLUDED_PREFIXES as readonly string[]).includes("/buynow"));
  });
});

describe("Stage 1 stops at canonical hygiene — nothing from later stages leaked in", () => {
  test("no robots file, no sitemap route, no redirect appears in this repository", () => {
    /* The robots.txt host mismatch (FD-RTE-04) and the ~1,300 missing archive years (FD-RTE-09) are
       PRODUCTION artefacts — the legacy robots.txt advertises the non-www sitemap host. This repo ships no
       robots.txt to fix; the fix is recorded as out-of-repo work. Stage 3 owns app/sitemap.ts; Stage 2 owns
       redirects, at the edge. None of them may ride in with Stage 1. */
    assert.equal(exists("app/robots.ts"), false);
    assert.equal(exists("app/robots.txt"), false);
    assert.equal(exists("public/robots.txt"), false);
    assert.equal(exists("app/sitemap.ts"), false);
    assert.equal(exists("public/sitemap.xml"), false);
    const nextConfig = exists("next.config.mjs") ? src("next.config.mjs")
      : exists("next.config.ts") ? src("next.config.ts") : "";
    assert.doesNotMatch(nextConfig, /redirects\s*\(/, "Stage 2 is edge-side and not yet implemented");
  });
});
