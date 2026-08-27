/*
 * GLOBAL FOOTER CONFIGURATION — LRG-SHELL-045.
 *
 * Public labels, destinations and trust copy live here rather than repeated in JSX. It is typed navigation
 * data, not an API or database contract, and it deliberately stays small — no framework, no selector layers.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 * DESTINATION AUDIT, and why several preferred entries are absent.
 *
 * Every entry below is classified. A preferred entry with no real destination is SUPPRESSED — not shown as
 * "coming soon", not pointed at a `#`, and never redirected to an official external site. The suppressed ones
 * are recorded as route dependencies in the footer implementation record.
 *
 *   newRoute      implemented in this application today
 *   legacyRoute   a real same-site production destination on lotterycorner.com, served by the legacy
 *                 application. Same-site, so it stays a same-site link; it 404s in this preview, which is the
 *                 documented migration state rather than a broken link in production.
 *   external      an off-site destination, given accessible external treatment
 *
 * Page-specific anchors are deliberately NOT used here: the task forbids putting a current-page anchor in the
 * global footer, so `LotteryCorner AI`, `Guides and answers` and `Community` — which exist only as anchors on
 * the State page — are suppressed globally rather than linked to a fragment that means nothing on Home.
 * ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 */

export type FooterLinkKind = "newRoute" | "legacyRoute" | "external";

export interface FooterLink {
  label: string;
  href: string;
  kind: FooterLinkKind;
  /** Named in the accessible label for an external destination. */
  siteName?: string;
}

export interface FooterGroup {
  heading: string;
  links: FooterLink[];
}

/** A preferred entry with no destination today. Recorded, never rendered. */
export interface SuppressedEntry {
  group: string;
  label: string;
  reason: string;
}

/* ------------------------------------------------------------------ navigation */

/**
 * Exactly four groups. The founder information architecture allows no fifth without a reported blocker.
 */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    heading: "Results and games",
    links: [
      { label: "Powerball", href: "/powerball", kind: "legacyRoute" },
      { label: "Mega Millions", href: "/mega-millions", kind: "legacyRoute" },
      { label: "Jackpots", href: "/jackpots", kind: "legacyRoute" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Lottery news", href: "/news", kind: "legacyRoute" },
      /* The Blog page family (Conflict 39) ACTIVATED this entry: `/blog` is a real new-UI route,
         registry-gated (FD-GATE-01), so it no longer resolves to the legacy application. */
      { label: "Blog", href: "/blog", kind: "newRoute" },
      /* The Community page family (08A/08B/08C) ACTIVATED this entry: `/community` is a real new-UI route,
         registry-gated (FD-GATE-01), so the suppression "route not implemented" no longer holds. */
      { label: "Community", href: "/community", kind: "newRoute" },
    ],
  },
  {
    heading: "About LotteryCorner",
    links: [
      /* **Conflict 38** ACTIVATED the five policy entries: the trust page family owns the legacy paths
         under the founder's full-cutover model — text transcribed with provenance, registry-gated
         (`lib/trust/trustRegistry.ts`), noindex until launch. They stop resolving to the legacy
         application and become real new-UI routes at the SAME paths. */
      { label: "About us", href: "/about-us", kind: "newRoute" },
      { label: "Contact us", href: "/contact-us", kind: "newRoute" },
      { label: "Help and FAQs", href: "/faqs", kind: "legacyRoute" },
    ],
  },
  {
    heading: "Legal and transparency",
    links: [
      /* Conflict 38 — see the About group note above. */
      { label: "Terms of use", href: "/terms-and-conditions", kind: "newRoute" },
      { label: "Privacy policy", href: "/privacy-policy", kind: "newRoute" },
      { label: "Cookie policy", href: "/cookies-policy", kind: "newRoute" },
      /* LRG-SHELL-046 ACTIVATED these two. Both are new-UI routes built entirely from wording already
         published elsewhere on the site — no policy was authored to make a footer label resolve. The other
         four Legal-and-transparency entries stay suppressed because their approved content is incomplete. */
      { label: "Affiliate disclosure", href: "/affiliate-disclosure", kind: "newRoute" },
      { label: "Corrections policy", href: "/corrections-policy", kind: "newRoute" },
      /*
       * §C6 ACTIVATES the AI-policy entry. GS-10 lists **AI policy** among the footer's REQUIRED clusters, and it
       * was the one required cluster with no destination — so it was suppressed, correctly, because this file's own
       * rule is that a preferred entry with no real destination is never shown as "coming soon" and never pointed
       * at a `#`. `/ai-policy` now exists, so the entry is a real link rather than a recorded gap.
       */
      { label: "AI policy", href: "/ai-policy", kind: "newRoute" },
    ],
  },
];

/**
 * Preferred entries with no destination today.
 *
 * These are the footer's route dependencies. Rendering any of them would mean inventing a URL, showing a dead
 * link, or putting a page-specific anchor in a global surface — all three are forbidden.
 */
export const SUPPRESSED_ENTRIES: SuppressedEntry[] = [
  { group: "Results and games", label: "State lottery results", reason: "no global State index route exists" },
  { group: "Results and games", label: "Results calendar", reason: "route not implemented" },
  { group: "Results and games", label: "Draw schedules", reason: "exists only as a State-page anchor" },
  { group: "Explore", label: "Guides and answers", reason: "exists only as a State-page anchor" },
  { group: "Explore", label: "LotteryCorner AI", reason: "exists only as a State-page anchor" },
  { group: "About LotteryCorner", label: "Editorial standards", reason: "approved content incomplete — the governing rules are internal, with no public editorial-standards copy" },
  /* LRG-SHELL-046 audited these four and DEFERRED them: approved repository content covers only part of what
     each page must say, and writing the rest would be authoring policy. Recorded, not published. */
  { group: "Legal and transparency", label: "Accessibility", reason: "approved content incomplete — no public accessibility statement exists, and a conformance claim is forbidden" },
  { group: "Legal and transparency", label: "Copyright", reason: "approved content incomplete — only the trademark-owner sentence exists" },
  { group: "Legal and transparency", label: "Advertising and partnerships", reason: "approved content incomplete — only the editorial-separation sentence exists" },
];

/* ------------------------------------------------------------------ public copy */

export const FOOTER_COPY = {
  brand: "LotteryCorner",
  purpose:
    "Lottery results, game information, guides and player discussions for U.S. lottery players.",
  independence:
    "LotteryCorner is an independent lottery information service and is not affiliated with or endorsed by "
    + "any state lottery.",
  verification: "Always verify winning numbers with the official lottery before claiming a prize.",

  /* Jurisdiction-neutral. A numeric age appears only where a validated State configuration supplies one. */
  legalAge: "You must be of legal lottery age in your jurisdiction. Play responsibly.",

  helpHeading: "Need help with gambling?",
  helpNumber: "Call or text 1-800-MY-RESET",
  helpSupport: "Free, confidential support is available 24/7.",

  /*
   * The GLOBAL notice. It supplements — never replaces — the disclosure that sits beside a compensated option
   * inside the Buy Now resolver. No provider is named here and no affiliate link is placed here.
   */
  affiliate:
    "LotteryCorner may receive compensation from some purchase partners. This does not change official "
    + "results or editorial coverage.",
  advertising: "Advertising is kept separate from results and editorial decisions.",

  trademark: "Lottery game names and logos are trademarks of their respective owners.",
} as const;

/**
 * The helpline, as a `tel:` link.
 *
 * NO WEB URL IS INVENTED. The repository contains no governed National Problem Gambling Helpline destination —
 * the Florida manifest explicitly records that no helpline number has been verified for that jurisdiction — so
 * rather than guess at an NCPG page URL that could 404, the number itself is the destination. A `tel:` link
 * cannot break, and it is what a person in difficulty actually needs on a phone. The governed web destination
 * is recorded as a dependency.
 *
 * The digits are the standard keypad mapping of the vanity number supplied as fixed input
 * (M=6, Y=9, R=7, E=3, S=7, E=3, T=8).
 */
export const HELPLINE_TEL = "tel:+18006973738";

/**
 * The State-aware supplemental age line. Rendered only when a validated configuration supplies both.
 *
 * LRG-STATE-047: `minimumLotteryAge` became nullable when the no-lottery profile arrived — a State that runs
 * no lottery has no minimum play age, and printing one would be a fabricated legal fact. Null in, null out.
 */
export function stateAgeLine(stateName: string, minimumLotteryAge: number | null): string | null {
  if (minimumLotteryAge === null) return null;
  return `${minimumLotteryAge}+ in ${stateName}`;
}

/** Every group heading, for tests and for the record. */
export const FOOTER_GROUP_HEADINGS = FOOTER_GROUPS.map((g) => g.heading);
