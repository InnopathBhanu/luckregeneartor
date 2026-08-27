/*
 * THE TRUST ROUTE REGISTRY — the "trust" page family's half of `FD-GATE-01` registry-only gating.
 *
 * Authority: **Conflict 38** (`source-conflicts.md`, CLOSED — RECORDED 2026-08-11): under the founder's
 * full-cutover deployment model the new UI owns the five legacy policy routes, superseding the
 * LRG-SHELL-046 ruling "EXISTING LEGACY POLICY — MIGRATION DEFERRED". Also `FD-GATE-01` (registry-only
 * gating; no environment reads) and `CLAUDE.md` §10 (routes come from an explicit registry — these five are
 * all in the "MUST be preserved" class as production-indexed URLs, so the paths are the legacy paths,
 * exactly).
 *
 * Every row's authority id is `CONFLICT-38`, because that record IS the authority — no page-family
 * blueprint governs these pages (the Conflict 39 blog precedent).
 *
 * The three older transparency routes (`/affiliate-disclosure`, `/corrections-policy`, `/ai-policy`)
 * remain static routes outside this registry, as LRG-SHELL-046 built them. This registry does not absorb
 * them — that would be unrelated refactoring.
 */

export interface TrustRegistryEntry {
  route: string;
  enabled: boolean;
  /** The authority the served composition traces to. */
  authority: "CONFLICT-38";
  note: string;
}

export const TRUST_REGISTRY: readonly TrustRegistryEntry[] = Object.freeze([
  {
    route: "/about-us",
    enabled: true,
    authority: "CONFLICT-38",
    note:
      "Legacy About Us text transcribed with provenance (lib/trust/content/aboutUsContent.ts) plus the "
      + "CLAUDE.md §11 trust block from approved footer copy. noindex until launch; never in a sitemap "
      + "until launch (PUBLICATION_SAFETY).",
  },
  {
    route: "/contact-us",
    enabled: true,
    authority: "CONFLICT-38",
    note:
      "Transcribed contact page plus the review-mode contact form (lib/contact/). The form stores to the "
      + "review data layer and NEVER claims delivery to a human (Conflict 38 condition 3). noindex until "
      + "launch.",
  },
  {
    route: "/terms-and-conditions",
    enabled: true,
    authority: "CONFLICT-38",
    note:
      "Legacy terms transcribed verbatim with provenance; clauses the product no longer matches carry "
      + "[FOUNDER-LEGAL-REVIEW]. Legal sign-off is an open founder item at launch. noindex until launch.",
  },
  {
    route: "/privacy-policy",
    enabled: true,
    authority: "CONFLICT-38",
    note:
      "Legacy privacy policy transcribed verbatim with provenance; flagged clauses carry "
      + "[FOUNDER-LEGAL-REVIEW]. Legal sign-off is an open founder item at launch. noindex until launch.",
  },
  {
    route: "/cookies-policy",
    enabled: true,
    authority: "CONFLICT-38",
    note:
      "Legacy cookies policy transcribed verbatim, including the March 2021 cookie-inventory tables, which "
      + "are flagged for re-audit before launch. noindex until launch.",
  },
]);

/** Does this build serve this trust-family route? The `servesPage("trust", …)` delegate. */
export function isTrustRouteServed(route: string): boolean {
  return TRUST_REGISTRY.some((e) => e.enabled && e.route === route);
}

/** Every trust-family route this build serves, for the FD-GATE-01 route inventory. */
export function trustRoutePaths(): { route: string; authority: "CONFLICT-38" }[] {
  return TRUST_REGISTRY.filter((e) => e.enabled).map((e) => ({ route: e.route, authority: e.authority }));
}
