/*
 * FOCUSED TESTS for the global footer and trust layer — LRG-SHELL-045.
 *
 * Scoped to what this task owns: the footer's structure, its trust copy, the legal-age behaviour, the link
 * audit, the membership/logo policy and the organization host. Existing suites cover the page content above it.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import {
  FOOTER_GROUPS, FOOTER_GROUP_HEADINGS, FOOTER_COPY, SUPPRESSED_ENTRIES, HELPLINE_TEL, stateAgeLine,
} from "../lib/layout/globalFooterConfig";
import { PRODUCTION_ORIGIN } from "../lib/seo/productionOrigin";
import { organizationSchema, websiteSchema, SITE_URL } from "../lib/seo/siteSchema";
import { FLORIDA_VIEW_CONFIG } from "../lib/state/floridaLowerPageContent";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
/* Comments explain the rulings that ban these words; only the OUTPUT must be free of them. */
const codeOnly = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const FOOTER = codeOnly(src("components/layout/GlobalFooter.tsx"));
const AGE = codeOnly(src("components/layout/FooterStateAge.tsx"));
const LAYOUT = src("app/layout.tsx");

describe("LRG-SHELL-045: information architecture", () => {
  test("exactly four navigation groups, with the approved headings", () => {
    assert.equal(FOOTER_GROUPS.length, 4, "a fifth group needs a reported blocker");
    assert.deepEqual(FOOTER_GROUP_HEADINGS,
      ["Results and games", "Explore", "About LotteryCorner", "Legal and transparency"]);
  });

  test("the four layers are present and there is no newsletter or signup", () => {
    for (const marker of ['data-global-footer="true"', "lcf__brand", "lcf__nav",
                          'data-footer-strip="true"', "lcf__legal"]) {
      assert.ok(FOOTER.includes(marker), `the footer must render ${marker}`);
    }
    for (const banned of ["<form", "<input", "newsletter", "Subscribe", "Sign up", "Privacy Manager"]) {
      assert.ok(!FOOTER.includes(banned), `the footer must not contain ${banned}`);
    }
  });

  test("one shared footer, rendered globally from the layout", () => {
    /* Before this task the guarded State page had no page footer at all: the layout suppressed the legacy one
       under the preview flag and only Home supplied its own. */
    assert.ok(/<SiteFooter currentYear=\{currentYear\} \/>/.test(LAYOUT));
    /*
     * ONE occurrence now, not two.
     *
     * The layout used to have two branches — a home-preview one and a legacy one — and each rendered the footer, so
     * the count was 2. §A2 removed the branch entirely: the header and the `<main>` landmark moved to the pages,
     * which is what let GS-06 become contextual, and with nothing left to branch on the layout renders one
     * composition. "Rendered globally on every route" is now structural rather than duplicated.
     */
    assert.equal((LAYOUT.match(/<SiteFooter /g) ?? []).length, 1, "one branchless composition renders it");
    assert.ok(!/<SiteHeader/.test(LAYOUT), "the layout no longer owns a header — see §A2");
    assert.ok(
      !/<main>\{children\}<\/main>/.test(LAYOUT),
      "the layout no longer owns the landmark — each page renders exactly one",
    );
    assert.ok(/const currentYear = new Date\(\)\.getFullYear\(\);/.test(LAYOUT),
      "the year is resolved once on the server, so the copyright line cannot mismatch on hydration");
    /* Home no longer renders a second one. */
    assert.ok(!/PreviewFooter/.test(src("app/page.tsx")));
    assert.ok(!/export function PreviewFooter/.test(src("components/shell/PreviewChrome.tsx")));
  });
});

describe("LRG-SHELL-045: trust copy", () => {
  test("independence and official-verification wording is exact", () => {
    assert.equal(FOOTER_COPY.independence,
      "LotteryCorner is an independent lottery information service and is not affiliated with or endorsed by "
      + "any state lottery.");
    assert.equal(FOOTER_COPY.verification,
      "Always verify winning numbers with the official lottery before claiming a prize.");
    assert.equal(FOOTER_COPY.purpose,
      "Lottery results, game information, guides and player discussions for U.S. lottery players.");
  });

  test("no verified badge, citation or editorial-process explanation in the brand block", () => {
    for (const banned of ["Verified", "Source checked", "citation", "[O", "methodology"]) {
      assert.ok(!FOOTER.includes(banned), `the footer must not carry "${banned}"`);
    }
  });

  test("copyright and trademark, without a false ownership claim", () => {
    assert.ok(/© \{currentYear\} LotteryCorner\. All rights reserved\./.test(FOOTER));
    assert.equal(FOOTER_COPY.trademark,
      "Lottery game names and logos are trademarks of their respective owners.");
    /* The independence sentence appears once, not repeated in the legal line. */
    assert.equal((FOOTER.match(/FOOTER_COPY\.independence/g) ?? []).length, 1);
  });
});

describe("LRG-SHELL-045: legal age", () => {
  test("the shared copy is jurisdiction-neutral and hardcodes no State", () => {
    assert.equal(FOOTER_COPY.legalAge,
      "You must be of legal lottery age in your jurisdiction. Play responsibly.");
    assert.ok(!/18\+|Florida|"fl"/.test(FOOTER), "the shared footer must not hardcode an age or a State");
  });

  test("the numeric line is derived from validated State configuration", () => {
    assert.equal(stateAgeLine("Florida", 18), "18+ in Florida");
    assert.equal(stateAgeLine(FLORIDA_VIEW_CONFIG.state.name, FLORIDA_VIEW_CONFIG.state.minimumLotteryAge),
      "18+ in Florida");
    /* A lookup, not a branch: no state code is compared anywhere. */
    assert.ok(!/=== "fl"|Florida/.test(AGE), "the age component must not name a jurisdiction");
    assert.ok(/stateViewConfigFor/.test(AGE), "it resolves configuration by path segment");
    /* Nothing renders without both a valid State context and a minimum age. */
    assert.ok(/if \(!cfg\?\.state\?\.minimumLotteryAge \|\| !cfg\.state\.name\) return null;/.test(AGE));
    /* And no claim that LotteryCorner verifies age. */
    for (const banned of ["verify your age", "age verification", "we verify"]) {
      assert.ok(!AGE.includes(banned) && !FOOTER.includes(banned));
    }
  });
});

describe("LRG-SHELL-045: responsible play and help", () => {
  test("the national helpline is present, plain, and cannot 404", () => {
    assert.equal(FOOTER_COPY.helpHeading, "Need help with gambling?");
    assert.equal(FOOTER_COPY.helpNumber, "Call or text 1-800-MY-RESET");
    assert.equal(FOOTER_COPY.helpSupport, "Free, confidential support is available 24/7.");
    /* A `tel:` destination rather than a guessed NCPG page URL — no governed web destination exists, and an
       invented one could break. The digits are the keypad mapping of the supplied vanity number. */
    assert.equal(HELPLINE_TEL, "tel:+18006973738");
    assert.ok(FOOTER.includes("HELPLINE_TEL"));
  });

  test("no membership logo and no affiliation claim", () => {
    for (const banned of ["NCPG", "NASPL", "World Lottery", "certified", "accredited",
                          "we are a member", "official partner", "sponsor", "<img", "<Image"]) {
      assert.ok(!FOOTER.includes(banned), `the footer must not claim or show "${banned}"`);
    }
    /* "partners" appears only inside the compensation disclosure, never as an affiliation claim. */
    const partnerUses = [...FOOTER_COPY.affiliate.matchAll(/partner/gi)];
    assert.equal(partnerUses.length, 1, "one use, in the compensation sentence");
  });
});

describe("LRG-SHELL-045: affiliate and advertising disclosure", () => {
  test("the global notice is present and names no provider", () => {
    assert.equal(FOOTER_COPY.affiliate,
      "LotteryCorner may receive compensation from some purchase partners. This does not change official "
      + "results or editorial coverage.");
    assert.equal(FOOTER_COPY.advertising,
      "Advertising is kept separate from results and editorial decisions.");
    for (const banned of ["Jackpocket", "theLotter", "Lotto.com", "courier"]) {
      assert.ok(!FOOTER.includes(banned), "no provider is named in the global footer");
    }
  });

  test("no affiliate or State-provider link is placed in the footer", () => {
    const hrefs = FOOTER_GROUPS.flatMap((g) => g.links.map((l) => l.href));
    for (const h of hrefs) {
      assert.ok(!/^https?:/.test(h) || !/lottery|affiliate|partner/i.test(h),
        `${h} must not be an affiliate or provider destination`);
      assert.ok(!/floridalottery/.test(h), "no State official destination belongs in the global footer");
    }
  });

  test("the CONTEXTUAL Buy Now disclosure is untouched and still adjacent", () => {
    /* The global notice supplements it; it must never be allowed to replace it. */
    const inline = src("components/state/preview/StateBuyNowInline.tsx");
    assert.ok(/does not sell tickets directly/.test(inline), "the resolver's lead disclaimer survives");
    assert.ok(/data-disclosure-slot="true"/.test(inline), "and the adjacent compensation slot");
    assert.ok(/Any option we are paid for will say so here, next to the action, before you use it/.test(inline));
    const home = src("components/preview/PreviewPlayOptions.tsx");
    assert.ok(/lcp-play__disclosure/.test(home), "Home's play-options disclosure survives");
  });
});

describe("LRG-SHELL-045: link audit", () => {
  test("every entry has a real destination — no placeholder, no invented URL", () => {
    for (const g of FOOTER_GROUPS) {
      assert.ok(g.links.length > 0, `${g.heading} must not be an empty group`);
      for (const l of g.links) {
        assert.ok(l.href && l.href !== "#", `${l.label} needs a real href`);
        assert.ok(l.href.startsWith("/") || l.href.startsWith("https://"),
          `${l.label} must be same-site or https`);
        assert.ok(["newRoute", "legacyRoute", "external"].includes(l.kind), `${l.label} must be classified`);
      }
    }
  });

  test("unavailable preferred entries are suppressed and recorded, never shown", () => {
    assert.ok(SUPPRESSED_ENTRIES.length > 0, "the dependencies are recorded");
    const rendered = new Set(FOOTER_GROUPS.flatMap((g) => g.links.map((l) => l.label)));
    for (const e of SUPPRESSED_ENTRIES) {
      assert.ok(!rendered.has(e.label), `${e.label} must not render while it has no destination`);
      assert.ok(e.reason.length > 0, `${e.label} needs a recorded reason`);
    }
    /* And no "coming soon" anywhere. */
    for (const s of [FOOTER, src("lib/layout/globalFooterConfig.ts")]) {
      assert.ok(!/coming soon|not available/i.test(codeOnly(s)));
    }
  });

  test("a same-site legacy destination stays same-site; only external gets external treatment", () => {
    for (const g of FOOTER_GROUPS) {
      for (const l of g.links) {
        if (l.kind === "legacyRoute" || l.kind === "newRoute") {
          assert.ok(l.href.startsWith("/"), `${l.label} must remain same-site`);
        }
      }
    }
    /* The external branch carries rel, target and an accessible destination name. */
    assert.ok(/rel="noopener noreferrer external"/.test(FOOTER));
    assert.ok(/opens \{link\.siteName \?\? "an external site"\} in a new tab/.test(FOOTER));
  });
});

describe("LRG-SHELL-045 + FD-RTE-02/03: organization identity host", () => {
  test("one governed origin, and no non-www host form left in the identity nodes", () => {
    assert.equal(SITE_URL, PRODUCTION_ORIGIN);
    assert.equal(PRODUCTION_ORIGIN, "https://www.lotterycorner.com");
    const org = organizationSchema() as Record<string, unknown>;
    const site = websiteSchema() as Record<string, unknown>;
    for (const [label, node] of [["Organization", org], ["WebSite", site]] as const) {
      const flat = JSON.stringify(node);
      /* FD-RTE-02 reversed the earlier non-www direction: every identity URL is now the ratified www form,
         and the bare-host form must not survive anywhere in the emitted nodes. */
      assert.ok(!flat.includes("://lotterycorner.com"), `${label} must not use the non-www host`);
    }
    assert.equal(org["@id"], "https://www.lotterycorner.com/#organization");
    assert.equal(site["@id"], "https://www.lotterycorner.com/#website");
    /* An `ImageObject` since LRG-UX-SCHEMA-001 unified the identity — the form the news, blog, community and
       tools modules already emitted, so the five no longer disagree about the publisher's own logo. */
    assert.deepEqual(org.logo, { "@type": "ImageObject", url: "https://www.lotterycorner.com/logo.png" });
  });

  test("the logo asset still resolves, and favicon assets are untouched", () => {
    assert.ok(existsSync(new URL("../public/logo.png", import.meta.url)));
    for (const f of ["favicon.ico", "icon-48.png", "icon-96.png"]) {
      assert.ok(existsSync(new URL(`../public/${f}`, import.meta.url)), `${f} must be unchanged`);
    }
  });
});

describe("LRG-SHELL-045: no ad, and nothing duplicated from the State band", () => {
  test("the footer renders no advertisement and no JSON-LD", () => {
    for (const banned of ["AdSlot", "StatePreviewAdSlot", "data-slot-key", "ld+json", "JsonLd"]) {
      assert.ok(!FOOTER.includes(banned), `the footer must not contain ${banned}`);
    }
  });

  test("the Florida resources band is not duplicated in the global footer", () => {
    for (const banned of ["Verify results", "Find a retailer", "Claim information",
                          "Responsible play resources", "floridalottery"]) {
      assert.ok(!FOOTER.includes(banned), `"${banned}" belongs to the State band, not the footer`);
      assert.ok(!codeOnly(src("lib/layout/globalFooterConfig.ts")).includes(banned));
    }
  });

  test("the footer clears fixed layers", () => {
    const css = src("app/globals.css");
    const rule = css.slice(css.indexOf(".lcf {"), css.indexOf(".lcf__inner"));
    assert.ok(/padding-bottom: calc\(/.test(rule), "the footer reserves space for fixed layers");
    for (const v of ["--lcs-stickyad-h", "--lcp-bottom-nav-h", "safe-area-inset-bottom"]) {
      assert.ok(rule.includes(v), `clearance must account for ${v}`);
    }
  });
});
