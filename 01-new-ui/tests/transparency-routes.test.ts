/*
 * FOCUSED TESTS for the legal, editorial and transparency destinations — LRG-SHELL-046.
 *
 * The point of these is not that pages exist. It is that pages exist ONLY where approved content supported
 * them, that the footer activates only destinations that genuinely resolve, and that nothing forbidden was
 * claimed to make a label light up.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import { FOOTER_GROUPS, FOOTER_GROUP_HEADINGS, SUPPRESSED_ENTRIES, FOOTER_COPY } from "../lib/layout/globalFooterConfig";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const codeOnly = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const AFFILIATE = codeOnly(src("app/affiliate-disclosure/page.tsx"));
const CORRECTIONS = codeOnly(src("app/corrections-policy/page.tsx"));

/** The eleven destinations this task had to classify. */
const DESTINATIONS = [
  "Affiliate disclosure", "Advertising and partnerships", "Editorial standards", "Corrections policy",
  "Accessibility", "Copyright", "Terms of use", "Privacy policy", "Cookie policy", "About us", "Contact us",
] as const;

describe("LRG-SHELL-046: every destination is classified", () => {
  test("all eleven are either an active footer link or a recorded suppression", () => {
    const active = new Set(FOOTER_GROUPS.flatMap((g) => g.links.map((l) => l.label)));
    const suppressed = new Set(SUPPRESSED_ENTRIES.map((e) => e.label));
    for (const d of DESTINATIONS) {
      assert.ok(active.has(d) || suppressed.has(d), `${d} must be classified, not silently missing`);
      assert.ok(!(active.has(d) && suppressed.has(d)), `${d} cannot be both active and suppressed`);
    }
  });

  test("every suppression records WHY, and none says 'coming soon'", () => {
    for (const e of SUPPRESSED_ENTRIES) {
      assert.ok(e.reason.length > 10, `${e.label} needs a substantive reason`);
      assert.ok(!/coming soon/i.test(e.reason));
    }
    /* The four deferred Priority-A pages record incomplete approved content, not "route not implemented" —
       the distinction matters, because the blocker is content, not engineering. */
    for (const label of ["Advertising and partnerships", "Editorial standards", "Accessibility", "Copyright"]) {
      const e = SUPPRESSED_ENTRIES.find((x) => x.label === label);
      assert.ok(e, `${label} must be recorded as suppressed`);
      assert.match(e!.reason, /approved content incomplete/, `${label}'s blocker is content, not a route`);
    }
  });
});

describe("LRG-SHELL-046: footer activation", () => {
  test("only implemented routes are activated, and each one's page file exists", () => {
    /*
     * Was "only the TWO implemented routes". §C6 added a third: GS-10 lists **AI policy** among the footer's
     * required clusters and it was the one required cluster with no destination, so it was suppressed. `/ai-policy`
     * now exists, so the entry became a real link.
     *
     * The invariant that matters is unchanged and is asserted below: an activated entry must have a route file. That
     * is what stops a footer label from being activated ahead of its page — which is the failure this test exists
     * for, not the specific count.
     */
    /* `/community` joined when the Community page family shipped (08A/08B/08C, frozen; Conflict 41 FOUNDER
       AMENDMENT) — the "route not implemented" suppression it retired is exactly this test's invariant working.
       `/blog` joined when the Blog page family shipped (Conflict 39, founder-authorized): the entry stops
       resolving to the legacy application and becomes a real new-UI route.
       The FIVE POLICY ROUTES joined under **Conflict 38** (source-conflicts.md, CLOSED — RECORDED
       2026-08-11): the founder's full-cutover deployment model transfers /about-us, /contact-us,
       /terms-and-conditions, /privacy-policy and /cookies-policy to the new UI, superseding this task's own
       "EXISTING LEGACY POLICY — MIGRATION DEFERRED" ruling. This list is updated DELIBERATELY, citing that
       entry — it is not drift. */
    const newRoutes = FOOTER_GROUPS.flatMap((g) => g.links).filter((l) => l.kind === "newRoute");
    assert.deepEqual(
      newRoutes.map((l) => l.href).sort(),
      ["/about-us", "/affiliate-disclosure", "/ai-policy", "/blog", "/community", "/contact-us",
       "/cookies-policy", "/corrections-policy", "/privacy-policy", "/terms-and-conditions"],
    );
    for (const l of newRoutes) {
      const dir = l.href.replace(/^\//, "");
      assert.ok(existsSync(new URL(`../app/${dir}/page.tsx`, import.meta.url)),
        `${l.href} is activated, so its route file must exist`);
    }
  });

  test("no active link is a placeholder, and none is external for an owned policy", () => {
    for (const g of FOOTER_GROUPS) {
      for (const l of g.links) {
        assert.notEqual(l.href, "#", `${l.label} must not be a placeholder`);
        assert.ok(l.href.length > 1, `${l.label} must not have an empty href`);
        assert.ok(!/^https?:/.test(l.href), `${l.label} is LotteryCorner-owned and must stay same-site`);
      }
    }
  });

  test("the footer's shape and trust copy are untouched", () => {
    assert.equal(FOOTER_GROUPS.length, 4, "still exactly four groups");
    assert.deepEqual(FOOTER_GROUP_HEADINGS,
      ["Results and games", "Explore", "About LotteryCorner", "Legal and transparency"], "order unchanged");
    /* This task may activate links; it may not touch the responsible-play or affiliate summary copy. */
    assert.equal(FOOTER_COPY.legalAge,
      "You must be of legal lottery age in your jurisdiction. Play responsibly.");
    assert.equal(FOOTER_COPY.helpNumber, "Call or text 1-800-MY-RESET");
    assert.ok(FOOTER_COPY.affiliate.startsWith("LotteryCorner may receive compensation"));
    assert.equal(FOOTER_COPY.trademark,
      "Lottery game names and logos are trademarks of their respective owners.");
  });

  test("Terms, Privacy, Cookies, About and Contact are new-UI routes at their exact legacy paths", () => {
    /*
     * ══ DELIBERATE UPDATE — Conflict 38 (source-conflicts.md, CLOSED — RECORDED 2026-08-11) ══
     *
     * This test used to be LRG-SHELL-046's duplication guard: it asserted these five stayed
     * `legacyRoute` and that NO app page existed for them, because creating a duplicate page without a
     * migration decision would have split canonical ownership. The founder's full-cutover ruling recorded
     * in Conflict 38 IS that migration decision: the whole codebase deploys at once, so at cutover the new
     * UI owns these paths and a `legacyRoute` label would be the lie. The invariant this test protects is
     * UNCHANGED — the label must match reality: an activated policy entry must be a real page at the exact
     * production path, transcribed (never redrafted) and noindex until launch. The transcription,
     * provenance, markers and noindex posture are asserted in `tests/trust-pages.test.ts`.
     */
    const byLabel = new Map(FOOTER_GROUPS.flatMap((g) => g.links).map((l) => [l.label, l]));
    for (const [label, href] of [
      ["Terms of use", "/terms-and-conditions"], ["Privacy policy", "/privacy-policy"],
      ["Cookie policy", "/cookies-policy"], ["About us", "/about-us"], ["Contact us", "/contact-us"],
    ] as const) {
      const l = byLabel.get(label);
      assert.ok(l, `${label} must remain active`);
      assert.equal(l!.href, href, `${label} keeps its authoritative production path — Conflict 38 transfers ownership, never the URL`);
      assert.equal(l!.kind, "newRoute", `${label} is new-UI-owned under Conflict 38`);
      /* The page the label now points at must actually exist. */
      assert.equal(existsSync(new URL(`../app${href}/page.tsx`, import.meta.url)), true,
        `${href} is activated, so its route file must exist`);
    }
  });
});

describe("LRG-SHELL-046: the two pages say what they must, and nothing they must not", () => {
  test("Affiliate disclosure carries the material-relationship boundary", () => {
    for (const needle of [
      "may receive compensation from some purchase partners",
      "does not change official",
      "We may earn a commission if you buy through a partner",
      "LotteryCorner does not sell tickets directly",
      "Any option we are paid for will say so here, next to the action, before you use it",
      "This page supplements the disclosure shown beside a compensated option. It does not replace it",
    ]) {
      assert.ok(AFFILIATE.includes(needle), `affiliate page must state: ${needle}`);
    }
  });

  test("Corrections policy preserves the official-source and final-authority boundary", () => {
    for (const needle of [
      "publishes results from official lottery sources and records corrections when",
      "A corrected result states what changed, when it changed and the impact",
      "Always verify winning numbers with the official lottery before claiming a prize",
      "LotteryCorner cannot confirm a win. Only the official lottery can validate a ticket",
    ]) {
      assert.ok(CORRECTIONS.includes(needle), `corrections page must state: ${needle}`);
    }
    /* PAGE-04 forbids promising what is not implemented. */
    for (const banned of ["24/7", "within 24 hours", "notify you", "correction archive", "guarantee"]) {
      assert.ok(!CORRECTIONS.includes(banned), `corrections page must not promise "${banned}"`);
    }
  });

  test("no forbidden claim, no provider, no invented mechanism on either page", () => {
    for (const [name, page] of [["affiliate", AFFILIATE], ["corrections", CORRECTIONS]] as const) {
      for (const banned of ["certified", "accredited", "approved partner", "WCAG", "DMCA", "Coming soon",
                            "official partner", "member of", "Jackpocket", "theLotter",
                            "https://", "<form", "<input"]) {
        assert.ok(!page.includes(banned), `${name} page must not contain "${banned}"`);
      }
      /* No claim to be a lottery, an operator or a seller. */
      assert.ok(page.includes("independent lottery information service"), `${name} states independence`);
    }
  });

  test("neither page fabricates a review or update date", () => {
    for (const page of [AFFILIATE, CORRECTIONS]) {
      assert.ok(!/lastUpdated=/.test(page), "no last-updated date exists to show, so none is shown");
      assert.ok(!/[Ll]ast reviewed|[Ee]ffective date/.test(page));
    }
  });
});

describe("LRG-SHELL-046: the shared template stays small", () => {
  test("it is a layout, not a page builder", () => {
    const tpl = codeOnly(src("components/layout/InformationPage.tsx"));
    for (const banned of ["theme", "variant", "blocks", "renderBlock", "schema", "cms", "widget"]) {
      assert.ok(!tpl.toLowerCase().includes(banned), `the template must not introduce "${banned}"`);
    }
    /* One H1, semantic sections, and a readable measure rather than the full canvas. */
    assert.ok(/<h1 className="lci__h1">/.test(tpl));
    assert.ok(/<h2 className="lci__h2">/.test(tpl));
    const css = src("app/globals.css");
    assert.ok(/\.lci__inner \{[\s\S]{0,120}max-width: 68ch/.test(css), "policy text is capped at a measure");
  });

  test("metadata is one title, one description, one absolute canonical on the governed origin", () => {
    const tpl = src("components/layout/InformationPage.tsx");
    assert.ok(/title: \{ absolute:/.test(tpl), "no doubled site suffix from the layout template");
    assert.ok(/const canonical = `\$\{PRODUCTION_ORIGIN\}\$\{path\}`/.test(tpl));
    /* FD-RTE-03: the host comes only from the single origin constant — no origin literal in the template. */
    assert.ok(!/https:\/\/(www\.)?lotterycorner\.com/.test(tpl), "no hardcoded origin string");
    assert.ok(!/localhost|headers\(\)/.test(tpl), "no request host can reach a canonical");
    assert.ok(/type: "website"/.test(tpl));
    /* No page-specific structured data was added merely because a page exists. */
    for (const page of [AFFILIATE, CORRECTIONS]) {
      assert.ok(!/ld\+json|JsonLd|FAQPage|"Article"/.test(page));
    }
  });
});

describe("LRG-SHELL-046: nothing else moved", () => {
  test("the contextual Buy Now disclosure is unchanged", () => {
    const inline = src("components/state/preview/StateBuyNowInline.tsx");
    assert.ok(/does not sell tickets directly/.test(inline));
    assert.ok(/data-disclosure-slot="true"/.test(inline));
    assert.ok(/Any option we are paid for will say so here, next to the action, before you use it/.test(inline));
    assert.ok(/lcp-play__disclosure/.test(src("components/preview/PreviewPlayOptions.tsx")));
  });

  test("the footer's visual selectors are untouched", () => {
    const footer = src("components/layout/GlobalFooter.tsx");
    for (const cls of ["lcf__brand", "lcf__nav", "lcf__strip", "lcf__legal", "lcf-link"]) {
      assert.ok(footer.includes(cls), `${cls} must still be the footer's markup`);
    }
  });
});
