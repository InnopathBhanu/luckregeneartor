/*
 * THE TRUST PAGE FAMILY — the five legacy policy routes, per **Conflict 38** (source-conflicts.md, CLOSED —
 * RECORDED 2026-08-11).
 *
 * What this file guards, in order of how badly it would fail in public:
 *
 *   1. REDRAFTED LEGAL TEXT. The one thing this task was forbidden to do is write policy. The transcription
 *      fidelity checks pin verbatim legacy sentences — typos included — so a well-meaning "cleanup" of the
 *      terms or privacy text fails loudly.
 *   2. A DELIVERY CLAIM ON THE CONTACT FORM. Nothing may say a human receives the message until a real
 *      channel exists (Conflict 38 condition 3). The legacy "We will get back to you soon!" is asserted
 *      ABSENT from everything that renders, and present ONLY in the recorded exclusion.
 *   3. A FLAG DISAPPEARING SILENTLY. Every [FOUNDER-LEGAL-REVIEW] marker is counted per page; adding or
 *      removing one is a deliberate, visible edit.
 *   4. A PAGE BECOMING INDEXABLE, or reachable outside the registry, or carrying an ad.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import { FOUNDER_LEGAL_REVIEW, founderLegalReviewMarkers } from "../lib/trust/trustContract";
import type { TrustPageContent } from "../lib/trust/trustContract";
import { TRUST_REGISTRY, isTrustRouteServed, trustRoutePaths } from "../lib/trust/trustRegistry";
import { ABOUT_US_CONTENT } from "../lib/trust/content/aboutUsContent";
import { CONTACT_US_CONTENT, SUPPORT_EMAIL } from "../lib/trust/content/contactUsContent";
import { TERMS_CONTENT } from "../lib/trust/content/termsContent";
import { PRIVACY_CONTENT } from "../lib/trust/content/privacyContent";
import { COOKIES_CONTENT } from "../lib/trust/content/cookiesContent";
import { PAGE_FAMILIES, routeInventory, servesPage } from "../lib/registry/pageFamilyRegistry";
import { FOOTER_GROUPS } from "../lib/layout/globalFooterConfig";
import {
  contactStoreResetForTests, listContactSubmissions, submitContactMessage,
} from "../lib/contact/reviewContactStore";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const exists = (p: string) => existsSync(new URL(`../${p}`, import.meta.url));

const CONTENTS: { content: TrustPageContent; page: string; expectedMarkers: number }[] = [
  { content: ABOUT_US_CONTENT, page: "app/about-us/page.tsx", expectedMarkers: 7 },
  { content: CONTACT_US_CONTENT, page: "app/contact-us/page.tsx", expectedMarkers: 4 },
  { content: TERMS_CONTENT, page: "app/terms-and-conditions/page.tsx", expectedMarkers: 6 },
  { content: PRIVACY_CONTENT, page: "app/privacy-policy/page.tsx", expectedMarkers: 13 },
  { content: COOKIES_CONTENT, page: "app/cookies-policy/page.tsx", expectedMarkers: 9 },
];

const ROUTES = [
  "/about-us", "/contact-us", "/terms-and-conditions", "/privacy-policy", "/cookies-policy",
] as const;

/* ═════════════════════════════════════════════════ the registry owns the routes ══ */

describe("Conflict 38: the trust registry serves exactly the five legacy paths", () => {
  test("five enabled rows, each at its exact production path, each carrying CONFLICT-38", () => {
    assert.deepEqual(TRUST_REGISTRY.map((e) => e.route), [...ROUTES]);
    for (const e of TRUST_REGISTRY) {
      assert.equal(e.enabled, true);
      assert.equal(e.authority, "CONFLICT-38", `${e.route}'s authority is the founder record itself`);
      assert.match(e.note, /noindex/, `${e.route} records its pre-launch posture`);
    }
  });

  test("servesPage answers for the family, and the route inventory lists all five", () => {
    assert.ok((PAGE_FAMILIES as readonly string[]).includes("trust"));
    for (const r of ROUTES) assert.equal(servesPage("trust", r), true, r);
    assert.equal(servesPage("trust", "/faqs"), false, "no route exists that no registry row declares");
    assert.equal(isTrustRouteServed("/about-us/"), false, "trailing-slash twin is not a registered route");
    const inv = routeInventory().filter((r) => r.family === "trust");
    assert.deepEqual(inv.map((r) => r.route).sort(), [...ROUTES].sort());
    for (const r of inv) assert.equal(r.blueprint, "CONFLICT-38");
    assert.equal(trustRoutePaths().length, 5);
  });

  test("every page file exists, gates on the registry, and 404s when not served", () => {
    for (const { page } of CONTENTS) {
      assert.ok(exists(page), `${page} must exist`);
      const s = src(page);
      assert.match(s, /servesPage\("trust", CONTENT\.path\)/, `${page} asks the registry`);
      assert.match(s, /notFound\(\)/, `${page} refuses when the registry does not serve it`);
    }
  });
});

/* ═══════════════════════════════════ metadata: unique, canonical, noindex ══ */

describe("Conflict 38 condition 4: noindex until launch, one canonical, unique identity", () => {
  test("every page declares noindex and takes its canonical from the shared template", () => {
    for (const { page } of CONTENTS) {
      const s = src(page);
      assert.match(s, /robots: \{ index: false, follow: false \}/, `${page} must be noindex until launch`);
      assert.match(s, /informationPageMetadata\(\{/, `${page} uses the shared metadata`);
      /* The spread of informationPageMetadata is the ONLY canonical; no second alternates block. */
      assert.equal((s.match(/alternates/g) ?? []).length, 0, `${page} declares no second canonical`);
      /* Server-rendered: the substantive text must be in the initial HTML (CLAUDE.md §9). */
      assert.ok(!s.includes('"use client"'), `${page} is a server component`);
    }
  });

  test("titles, H1s, descriptions and paths are unique across the five", () => {
    const titles = CONTENTS.map((c) => c.content.title);
    const descriptions = CONTENTS.map((c) => c.content.description);
    const paths = CONTENTS.map((c) => c.content.path);
    assert.equal(new Set(titles).size, 5, "five unique titles/H1s");
    assert.equal(new Set(descriptions).size, 5, "five unique descriptions");
    assert.deepEqual(paths, [...ROUTES]);
  });

  test("no trust page enters a sitemap, structurally", () => {
    assert.equal(exists("app/sitemap.ts"), false);
    assert.equal(exists("public/sitemap.xml"), false);
  });
});

/* ══════════════════════════════════════ transcription, provenance, markers ══ */

describe("Conflict 38 condition 1: transcribed with provenance, never drafted fresh", () => {
  test("every content module names its legacy source file and the transcription date", () => {
    for (const { content } of CONTENTS) {
      assert.match(
        content.provenance.sourceFile,
        /^00-reference-existing-project\/LotteryCorner40\/WebContent\/WEB-INF\/upgrade\/[a-zA-Z_]+\.jsp$/,
        `${content.path} names the exact legacy JSP`,
      );
      assert.equal(content.provenance.transcriptionDate, "2026-08-12");
      assert.ok(content.provenance.note.length > 40, `${content.path} records what was and was not carried`);
    }
  });

  test("the text is the LEGACY text — verbatim sentences, typos included, survive", () => {
    /* A "cleanup" of any of these is redrafting legal text, which only the founder may do. */
    const flat = (c: TrustPageContent) =>
      [c.intro, ...c.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.list ?? [])])].join("\n");
    assert.match(flat(TERMS_CONTENT), /Poweball, Mega millions/, "terms trademark typo preserved");
    assert.match(flat(TERMS_CONTENT), /afford to loose/, "terms 'loose' typo preserved");
    assert.match(flat(PRIVACY_CONTENT), /operate the Site from the India/, "privacy location wording preserved");
    assert.match(flat(COOKIES_CONTENT), /A part form the above specified/, "cookies typo preserved");
    assert.match(flat(ABOUT_US_CONTENT), /graduation course of 'Mathematical Thinking'/);
    assert.match(CONTACT_US_CONTENT.intro, /W'd Love to hear from you/, "contact tagline preserved verbatim");
    /* The cookies inventory is the legacy table, not a rewrite. */
    const cookieRows = COOKIES_CONTENT.sections.flatMap((s) => s.table?.rows ?? []);
    assert.ok(cookieRows.some((r) => r[0] === "JSESSIONID"), "the legacy JSP session cookie row survives");
    assert.equal(cookieRows.length, 12, "all twelve legacy cookie rows, no invented entries");
    /* And the one honest date: the legacy document's own. */
    assert.equal(COOKIES_CONTENT.lastUpdated, "March 19, 2021");
    for (const c of [ABOUT_US_CONTENT, CONTACT_US_CONTENT, TERMS_CONTENT, PRIVACY_CONTENT]) {
      assert.equal(c.lastUpdated, undefined, `${c.path} has no legacy date, so none is fabricated`);
    }
  });

  test("every [FOUNDER-LEGAL-REVIEW] marker is counted — none can be added or dropped silently", () => {
    let total = 0;
    for (const { content, expectedMarkers } of CONTENTS) {
      const markers = founderLegalReviewMarkers(content);
      assert.equal(
        markers.length, expectedMarkers,
        `${content.path}: ${markers.length} markers found, ${expectedMarkers} recorded. The count is a `
        + "deliberate record — update it (and the task report) together with the flagged clause.",
      );
      for (const m of markers) assert.ok(m.includes(FOUNDER_LEGAL_REVIEW));
      total += markers.length;
    }
    assert.equal(total, 39, "the family-wide flag count, pinned");
  });
});

/* ═══════════════════════════════════════════ the contact form's honesty ══ */

describe("Conflict 38 condition 3: recorded, never claimed delivered", () => {
  test("a submission becomes a typed review record with status 'new'", () => {
    contactStoreResetForTests();
    const before = Date.now();
    const record = submitContactMessage({ name: "  ", email: " reader@example.test ", message: " My message. " });
    assert.equal(record.dataMode, "review");
    assert.equal(record.status, "new");
    assert.equal(record.name, null, "blank name stores as null — name is optional by design");
    assert.equal(record.email, "reader@example.test");
    assert.equal(record.message, "My message.");
    assert.ok(Math.abs(Date.parse(record.submittedAtIso) - before) < 5_000, "a real submission instant");
    assert.match(record.id, /^review-contact-/);

    const second = submitContactMessage({ name: "A Reader", email: "b@example.test", message: "Two." });
    const listed = listContactSubmissions();
    assert.equal(listed.length, 2);
    assert.equal(listed[0].id, second.id, "the admin seam lists newest first");
    contactStoreResetForTests();
  });

  test("the store delivers to no one: no fetch, no mail, no API, no environment", () => {
    for (const f of ["lib/contact/reviewContactStore.ts", "lib/contact/contactContract.ts"]) {
      const s = src(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      assert.doesNotMatch(s, /fetch\(|mailto|\/api\/|process\.env|sendmail|smtp/i, `${f} must stay review-local`);
    }
  });

  test("nothing that renders claims a reply — the legacy claim lives only in the exclusion record", () => {
    /* Comments stripped: a comment EXPLAINING why the legacy claim is absent is the audit trail, not a claim. */
    const codeOnly = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    const rendered = [
      codeOnly(src("components/trust/ContactForm.tsx")),
      CONTACT_US_CONTENT.intro,
      ...CONTACT_US_CONTENT.sections.flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? []), ...(s.list ?? [])]),
    ].join("\n");
    for (const banned of [
      /get back to you/i, /we will reply/i, /we'll reply/i, /respond (to you|within|shortly|soon)/i,
      /hear back/i, /reach out to you/i,
    ]) {
      assert.doesNotMatch(rendered, banned, `a delivery claim renders nowhere: ${banned}`);
    }
    /* The honest copy IS there: recorded, plus the direct route. */
    assert.match(rendered, /recorded for the team to review/);
    assert.match(rendered, /does not send email/);
    assert.ok(rendered.includes(SUPPORT_EMAIL));
    /* And the legacy claim is preserved AS AN EXCLUSION, flagged, so the founder sees what was dropped. */
    const excluded = (CONTACT_US_CONTENT.excludedLegacyClauses ?? []).join("\n");
    assert.match(excluded, /We will get back to you soon!/);
    assert.ok(excluded.includes(FOUNDER_LEGAL_REVIEW));
  });

  test("the form is a client component on the session seam, with plain fields and 44px classes", () => {
    const form = src("components/trust/ContactForm.tsx");
    assert.match(form.slice(0, 200), /"use client"/);
    assert.match(form, /useAccountSession/, "signed-in email prefills through the seam");
    assert.doesNotMatch(form, /reviewAccountStore|accountData/, "never through the store internals");
    assert.match(form, /\(optional\)/, "name is labelled optional in plain language");
    for (const cls of ["lca-input", "lca-label", "lca-submit"]) {
      assert.ok(form.includes(cls), `${cls} carries the ≥44px target styling`);
    }
    /* No CAPTCHA and no third-party script came along from the legacy form. */
    assert.doesNotMatch(form, /recaptcha|grecaptcha|fontawesome|jquery/i);
  });
});

/* ═══════════════════════════════════════════════ footer, ads, shell ══ */

describe("Conflict 38: footer activation and the no-ads rule", () => {
  test("the five footer entries flipped to newRoute at their unchanged hrefs", () => {
    const byLabel = new Map(FOOTER_GROUPS.flatMap((g) => g.links).map((l) => [l.label, l]));
    for (const [label, href] of [
      ["About us", "/about-us"], ["Contact us", "/contact-us"], ["Terms of use", "/terms-and-conditions"],
      ["Privacy policy", "/privacy-policy"], ["Cookie policy", "/cookies-policy"],
    ] as const) {
      const l = byLabel.get(label);
      assert.ok(l, `${label} is active`);
      assert.equal(l!.kind, "newRoute", `${label} is new-UI-owned under Conflict 38`);
      assert.equal(l!.href, href, `${label} keeps the exact production path`);
    }
  });

  test("no ad markup on any policy page — policy pages carry no ads", () => {
    /* The legacy pages each carried a leaderboard slot; those belong to the not-yet-captured legacy slot
       families and were NOT transcribed — a policy page is a protected reading surface. No GAM slot was
       removed from the recorded 47: none of the five pages' slots is in ad-slot-definitions.json. */
    const surfaces = [
      ...CONTENTS.map((c) => c.page),
      "components/layout/InformationPage.tsx",
      "components/trust/ContactForm.tsx",
    ];
    for (const f of surfaces) {
      const s = src(f);
      assert.doesNotMatch(
        s, /AdSlot|adSlot|data-ad|googletag|freestar|placementName|CampaignSlot|lc_ro_|lc_mgp_/,
        `${f} must carry no ad markup`,
      );
    }
  });

  test("the guard tests were updated deliberately, citing Conflict 38", () => {
    assert.match(src("tests/transparency-routes.test.ts"), /Conflict 38/,
      "the LRG-SHELL-046 duplication guard cites the superseding record");
    assert.match(src("tests/registry-gating.test.ts"), /Conflict 38/,
      "the blueprint-id allowlist cites the superseding record");
  });
});
